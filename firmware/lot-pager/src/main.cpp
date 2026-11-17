// LOT PAGER firmware — v0.1.0 (HW-01)
//
// One wake = one "session". Every session:
//   wake (timer | button) → sensors → Wi-Fi → ONE compact API call → screen → deep sleep
// The memory LCD keeps its image with ~µW draw; RV-3028 CLKOUT toggles VCOM
// during deep sleep, so the MCU never needs to stay awake to hold a message.
//
// Button "COPY":  short press → copy the message on screen to the LOT Log tab
//                 long press  → (S2) camera snapshot
//
// Provisioning over USB-CDC serial (115200), one command per line:
//   WIFI <ssid> <password>
//   TOKEN <lotd.xxx token from POST /api/devices/pair>
//   INFO | WIPE | SLEEP

#include <Arduino.h>
#include <Wire.h>
#include <SPI.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <ArduinoJson.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SharpMem.h>
#include <Adafruit_BME680.h>
#include "esp_sleep.h"
#include "config.h"

#ifndef LOT_FW_VERSION
#define LOT_FW_VERSION "0.0.0"
#endif

// ---------------------------------------------------------------------------
// State that survives deep sleep (RTC slow memory)
// ---------------------------------------------------------------------------
RTC_DATA_ATTR uint32_t g_wakeCount = 0;
RTC_DATA_ATTR char     g_msgId[16] = {0};
RTC_DATA_ATTR char     g_msgText[64] = {0};
RTC_DATA_ATTR uint32_t g_nextPollS = DEFAULT_POLL_S;

Adafruit_SharpMem lcd(PIN_LCD_SCK, PIN_LCD_MOSI, PIN_LCD_CS, LCD_W, LCD_H);
Adafruit_BME680   bme(&Wire);
Preferences       prefs;

struct Telemetry { float t = NAN, h = NAN, p = NAN, gas = NAN; int bat = -1; bool ok = false; };

// ---------------------------------------------------------------------------
// Display
// ---------------------------------------------------------------------------
static void lcdBegin() {
  pinMode(PIN_LCD_DISP, OUTPUT);
  digitalWrite(PIN_LCD_DISP, HIGH);
  lcd.begin();
  lcd.setRotation(0);
  lcd.setTextColor(0, 1); // black on white (reflective)
  lcd.setTextWrap(true);
}

// Render a pager message: tiny status bar + up to 2 lines of size-1 text
// (26 chars/line) — matches compressForPager() PAGER_MAX_CHARS = 52.
static void lcdShow(const char* msg, const char* status) {
  lcd.clearDisplay();
  lcd.setTextSize(1);
  lcd.setCursor(0, 0);
  lcd.print("LOT");
  if (status && *status) {
    int16_t x, y; uint16_t w, h;
    lcd.getTextBounds(status, 0, 0, &x, &y, &w, &h);
    lcd.setCursor(LCD_W - w, 0);
    lcd.print(status);
  }
  lcd.drawFastHLine(0, 10, LCD_W, 0);
  lcd.setTextSize(msg && strlen(msg) <= 13 ? 2 : 1); // short nudges render large
  lcd.setCursor(0, 18);
  lcd.print(msg && *msg ? msg : "-");
  lcd.refresh();
}

// ---------------------------------------------------------------------------
// Sensors
// ---------------------------------------------------------------------------
static int readBatteryPct() {
  // MAX17048 SOC register 0x04, 1/256 % per LSB
  Wire.beginTransmission(I2C_MAX17048);
  Wire.write(0x04);
  if (Wire.endTransmission(false) != 0) return -1;
  if (Wire.requestFrom(I2C_MAX17048, 2) != 2) return -1;
  uint16_t raw = (Wire.read() << 8) | Wire.read();
  int pct = raw >> 8;
  return pct > 100 ? 100 : pct;
}

static void rtcClkout1Hz() {
  // RV-3028-C7: CLKOUT register 0x35, FD[2:0]=0b101 → 1 Hz, CLKOE in EEPROM backup.
  Wire.beginTransmission(I2C_RV3028);
  Wire.write(0x35);
  Wire.write(0b11000101); // CLKOE=1, CLKSY=1, FD=101 (1 Hz)
  Wire.endTransmission();
}

static Telemetry readSensors() {
  Telemetry tm;
  if (bme.begin(I2C_BME688)) {
    bme.setTemperatureOversampling(BME680_OS_2X);
    bme.setHumidityOversampling(BME680_OS_2X);
    bme.setPressureOversampling(BME680_OS_2X);
    bme.setGasHeater(320, 150);
    if (bme.performReading()) {
      tm.t = bme.temperature;
      tm.h = bme.humidity;
      tm.p = bme.pressure / 100.0f;
      tm.gas = bme.gas_resistance;
      tm.ok = true;
    }
  }
  tm.bat = readBatteryPct();
  return tm;
}

// ---------------------------------------------------------------------------
// Network — one TLS session per wake
// ---------------------------------------------------------------------------
static bool wifiUp() {
  prefs.begin("lot", true);
  String ssid = prefs.getString("ssid", "");
  String pass = prefs.getString("pass", "");
  prefs.end();
  if (ssid.isEmpty()) return false;
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(true);
  WiFi.begin(ssid.c_str(), pass.c_str());
  uint32_t t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < LOT_WIFI_TIMEOUT_MS) delay(50);
  return WiFi.status() == WL_CONNECTED;
}

static String token() {
  prefs.begin("lot", true);
  String t = prefs.getString("token", "");
  prefs.end();
  return t;
}

// Returns HTTP status, fills `out` with the body.
static int api(const char* method, const String& path, const String& body, String& out) {
  if (strlen(LOT_ROOT_CA) == 0) return -100; // refuse to run without TLS pinning material
  String tok = token();
  if (tok.isEmpty()) return -101;
  WiFiClientSecure client;
  client.setCACert(LOT_ROOT_CA);
  HTTPClient http;
  http.setTimeout(LOT_HTTP_TIMEOUT_MS);
  if (!http.begin(client, String(LOT_API_BASE) + path)) return -102;
  http.addHeader("Authorization", "Bearer " + tok);
  int code;
  if (strcmp(method, "POST") == 0) {
    http.addHeader("Content-Type", "application/json");
    code = http.POST(body);
  } else {
    code = http.GET();
  }
  out = code > 0 ? http.getString() : String();
  http.end();
  return code;
}

static void sendTelemetry(const Telemetry& tm) {
  JsonDocument d;
  if (tm.ok) { d["t"] = tm.t; d["h"] = tm.h; d["p"] = tm.p; }
  if (tm.bat >= 0) d["bat"] = tm.bat;
  String body, out;
  serializeJson(d, body);
  api("POST", "/telemetry", body, out);
}

static void pollFrame(int bat) {
  String out;
  String q = String("/frame?fw=") + LOT_FW_VERSION + (bat >= 0 ? "&bat=" + String(bat) : "");
  int code = api("GET", q, "", out);
  if (code != 200) {
    lcdShow(g_msgText[0] ? g_msgText : "No signal", code == 401 ? "PAIR" : "OFF");
    g_nextPollS = DEFAULT_POLL_S;
    return;
  }
  JsonDocument f;
  if (deserializeJson(f, out)) return;
  uint32_t n = f["n"] | DEFAULT_POLL_S;
  g_nextPollS = constrain(n, (uint32_t)MIN_POLL_S, (uint32_t)MAX_POLL_S);
  const char* m = f["m"] | (const char*)nullptr;
  const char* i = f["i"] | (const char*)nullptr;
  if (m && i) {
    strlcpy(g_msgText, m, sizeof(g_msgText));
    strlcpy(g_msgId, i, sizeof(g_msgId));
    int q = f["q"] | 0;
    lcdShow(g_msgText, q > 0 ? (String("+") + q).c_str() : "NEW");
  }
}

static void copyToLog() {
  if (!g_msgId[0] && !g_msgText[0]) { lcdShow("Nothing to copy", ""); return; }
  lcdShow(g_msgText, "...");
  if (!wifiUp()) { lcdShow(g_msgText, "OFF"); return; }
  JsonDocument d;
  d["i"] = g_msgId;
  d["m"] = g_msgText;
  String body, out;
  serializeJson(d, body);
  int code = api("POST", "/copy", body, out);
  lcdShow(g_msgText, code == 200 ? "COPIED" : "ERR");
}

// ---------------------------------------------------------------------------
// Serial provisioning (USB-CDC; only active for 3 s after a USB-powered boot)
// ---------------------------------------------------------------------------
static void provisioningWindow(uint32_t ms) {
  uint32_t t0 = millis();
  while (millis() - t0 < ms) {
    if (!Serial.available()) { delay(10); continue; }
    String line = Serial.readStringUntil('\n');
    line.trim();
    t0 = millis(); // extend window while a host is talking
    prefs.begin("lot", false);
    if (line.startsWith("WIFI ")) {
      int sp = line.indexOf(' ', 5);
      prefs.putString("ssid", sp > 0 ? line.substring(5, sp) : line.substring(5));
      prefs.putString("pass", sp > 0 ? line.substring(sp + 1) : "");
      Serial.println("OK WIFI");
    } else if (line.startsWith("TOKEN lotd.")) {
      prefs.putString("token", line.substring(6));
      Serial.println("OK TOKEN");
    } else if (line == "INFO") {
      Serial.printf("LOT PAGER fw=%s wakes=%u ssid=%s token=%s\n", LOT_FW_VERSION, g_wakeCount,
                    prefs.getString("ssid", "-").c_str(), prefs.getString("token", "").isEmpty() ? "no" : "yes");
    } else if (line == "WIPE") {
      prefs.clear();
      Serial.println("OK WIPE");
    } else if (line == "SLEEP") {
      prefs.end();
      return;
    } else {
      Serial.println("ERR");
    }
    prefs.end();
  }
}

// ---------------------------------------------------------------------------
// Deep sleep
// ---------------------------------------------------------------------------
static void sleepNow() {
  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
  esp_sleep_enable_timer_wakeup((uint64_t)g_nextPollS * 1000000ULL);
  esp_sleep_enable_ext1_wakeup(1ULL << PIN_BTN, ESP_EXT1_WAKEUP_ANY_LOW);
  // LCD keeps the frame; DISP stays high via RTC hold.
  gpio_hold_en((gpio_num_t)PIN_LCD_DISP);
  gpio_deep_sleep_hold_en();
  esp_deep_sleep_start();
}

static bool longPress() {
  uint32_t t0 = millis();
  while (digitalRead(PIN_BTN) == LOW) {
    if (millis() - t0 > BTN_LONG_MS) return true;
    delay(10);
  }
  return false;
}

void setup() {
  gpio_hold_dis((gpio_num_t)PIN_LCD_DISP);
  pinMode(PIN_BTN, INPUT_PULLUP);
  Serial.begin(115200);
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL, 400000);
  lcdBegin();
  g_wakeCount++;

  esp_sleep_wakeup_cause_t cause = esp_sleep_get_wakeup_cause();

  if (cause == ESP_SLEEP_WAKEUP_UNDEFINED) {
    // Cold boot (battery insert / USB / Qi pad first power)
    rtcClkout1Hz();
    lcdShow("LOT PAGER", LOT_FW_VERSION);
    provisioningWindow(3000);
  }

  if (cause == ESP_SLEEP_WAKEUP_EXT1) {
    if (longPress()) {
      lcdShow("Camera: S2", "SNAP"); // camera pipeline lands in session 2
    } else {
      copyToLog();
    }
    sleepNow();
  }

  // Timer wake (or cold boot): sensors → frame
  Telemetry tm = readSensors();
  if (wifiUp()) {
    if (g_wakeCount % TELEMETRY_EVERY_N == 1) sendTelemetry(tm);
    pollFrame(tm.bat);
  } else if (!g_msgText[0]) {
    lcdShow("Set up Wi-Fi", "SETUP");
  }
  sleepNow();
}

void loop() {}
