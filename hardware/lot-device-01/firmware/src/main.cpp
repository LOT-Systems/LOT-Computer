// LOT-DEVICE-01 "Pager" firmware — v0.1.0 skeleton
// Spec: docs/hardware/LOT-DEVICE-01-FIRMWARE.md · API: docs/hardware/LOT-DEVICE-01-API.md
//
// Wake cycle (one compact radio session per wake):
//   wake (timer | Copy button | IMU) → read BME688 (cold board) → Wi-Fi fast-connect
//   → GET /inbox → show + buzz → POST /ack → [button? POST /copy] → POST /telemetry
//   → Wi-Fi off → deep sleep (memory LCD keeps the image at ~µW)
//
// STATUS: not yet compiled (PlatformIO toolchain not available in the routine sandbox).

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SharpMem.h>
#include <Adafruit_BME680.h>
#include "config.h"

// ── Persistent state (NVS) ─────────────────────────────────────────────────
// Written once by BLE provisioning from lot-systems.com (Web Bluetooth): ssid, pass, token.
static Preferences nvs;
static String gSsid, gPass, gToken;

// Survives deep sleep (RTC RAM): last shown notification, poll interval.
RTC_DATA_ATTR char rtcLastId[16] = {0};
RTC_DATA_ATTR char rtcLastText[LOT_TEXT_MAX + 1] = {0};
RTC_DATA_ATTR uint32_t rtcPollS = LOT_POLL_DEFAULT_S;
RTC_DATA_ATTR uint8_t rtcBssid[6] = {0};
RTC_DATA_ATTR int32_t rtcChannel = 0;

static Adafruit_SharpMem lcd(PIN_LCD_SCK, PIN_LCD_MOSI, PIN_LCD_CS, 128, 128);
static Adafruit_BME680 bme(&Wire);

// ── Display ────────────────────────────────────────────────────────────────
static void showText(const char *line1, const char *line2 = nullptr) {
  lcd.begin();
  lcd.clearDisplay();
  lcd.setTextColor(0);  // black on reflective silver
  lcd.setTextSize(2);
  lcd.setCursor(4, 40);
  lcd.print(line1);
  if (line2) {
    lcd.setTextSize(1);
    lcd.setCursor(4, 110);
    lcd.print(line2);
  }
  lcd.refresh();
}

static void buzz(uint16_t ms = LOT_BUZZ_MS) {
  pinMode(PIN_BUZZ, OUTPUT);
  digitalWrite(PIN_BUZZ, HIGH);
  delay(ms);
  digitalWrite(PIN_BUZZ, LOW);
}

// ── Network ────────────────────────────────────────────────────────────────
static bool wifiUp() {
  WiFi.mode(WIFI_STA);
  // Fast reconnect: reuse cached channel + BSSID to skip the scan (~600 ms saved).
  if (rtcChannel > 0) WiFi.begin(gSsid.c_str(), gPass.c_str(), rtcChannel, rtcBssid, true);
  else WiFi.begin(gSsid.c_str(), gPass.c_str());
  uint32_t t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 8000) delay(20);
  if (WiFi.status() != WL_CONNECTED) { rtcChannel = 0; return false; }
  rtcChannel = WiFi.channel();
  memcpy(rtcBssid, WiFi.BSSID(), 6);
  return true;
}

static void wifiDown() { WiFi.disconnect(true); WiFi.mode(WIFI_OFF); }

// One TLS client reused for every call in this wake (compressed session).
static WiFiClientSecure tls;

static int api(const char *method, const char *path, const String &body, JsonDocument *out) {
  HTTPClient http;
  http.setReuse(true);
  String url = String("https://") + LOT_API_HOST + LOT_API_BASE + path;
  if (!http.begin(tls, url)) return -1;
  http.addHeader("Authorization", "Bearer " + gToken);
  if (body.length()) http.addHeader("Content-Type", "application/json");
  int code = http.sendRequest(method, body);
  if (code == 200 && out) deserializeJson(*out, http.getString());
  http.end();
  return code;
}

// ── Wake handlers ──────────────────────────────────────────────────────────
static void pollInbox() {
  JsonDocument doc;
  if (api("GET", "/inbox", "", &doc) != 200) return;
  if (doc["w"].is<uint32_t>()) rtcPollS = doc["w"].as<uint32_t>();
  JsonArray n = doc["n"].as<JsonArray>();
  if (n.size() == 0) return;

  JsonObject last = n[n.size() - 1];
  strlcpy(rtcLastId, last["i"] | "", sizeof(rtcLastId));
  strlcpy(rtcLastText, last["t"] | "", sizeof(rtcLastText));
  showText(rtcLastText, "COPY >");
  buzz();

  JsonDocument ack;
  JsonArray ids = ack["i"].to<JsonArray>();
  for (JsonObject x : n) ids.add(x["i"].as<const char *>());
  String body; serializeJson(ack, body);
  api("POST", "/ack", body, nullptr);
}

static void sendCopy() {
  if (!rtcLastText[0]) return;
  JsonDocument d;
  d["i"] = rtcLastId;
  d["t"] = rtcLastText;
  String body; serializeJson(d, body);
  if (api("POST", "/copy", body, nullptr) == 200) {
    showText(rtcLastText, "Copied.");
    buzz(60);
  }
}

static String readTelemetry() {
  JsonDocument d;
  Wire.begin(PIN_SDA, PIN_SCL);
  if (bme.begin(0x77) || bme.begin(0x76)) {
    bme.setGasHeater(320, 150);
    if (bme.performReading()) {
      d["t"] = round(bme.temperature * 10) / 10.0;
      d["h"] = round(bme.humidity);
      d["p"] = round(bme.pressure / 100.0);
      d["g"] = round(bme.gas_resistance / 100.0) / 10.0;  // kΩ
    }
  }
  d["b"] = analogReadMilliVolts(A0) * 2;  // devkit divider; EVT uses MAX17048
  String body; serializeJson(d, body);
  return body;
}

// ── Provisioning (BLE) — stub ──────────────────────────────────────────────
// TODO(S2): NimBLE GATT service "LOT-PROV" with write chars ssid/pass/token,
// written from lot-systems.com Settings → Device → Pair via Web Bluetooth.
static bool loadCreds() {
  nvs.begin("lot", true);
  gSsid = nvs.getString("ssid", "");
  gPass = nvs.getString("pass", "");
  gToken = nvs.getString("token", "");
  nvs.end();
  return gSsid.length() && gToken.startsWith("lotd.");
}

// ── Main ───────────────────────────────────────────────────────────────────
void setup() {
  esp_sleep_wakeup_cause_t cause = esp_sleep_get_wakeup_cause();
  bool buttonWake = cause == ESP_SLEEP_WAKEUP_EXT0;
  bool longPress = false;

  if (buttonWake) {
    pinMode(PIN_BUTTON, INPUT_PULLUP);
    uint32_t t0 = millis();
    while (digitalRead(PIN_BUTTON) == LOW && millis() - t0 < 3000) delay(10);
    longPress = millis() - t0 >= LOT_LONG_PRESS_MS;
  }

  if (!loadCreds()) {
    showText("LOT.", "Pair at lot-systems.com");
    // TODO(S2): start BLE provisioning and wait.
  } else {
    String telemetry = readTelemetry();  // measure before radio heats the board
    if (wifiUp()) {
      tls.setInsecure();  // TODO(S2): pin ISRG Root X1 CA + enable TLS session tickets
      if (cause == ESP_SLEEP_WAKEUP_UNDEFINED) {
        api("POST", "/hello", String("{\"fw\":\"") + LOT_FW_VERSION + "\"}", nullptr);
        showText("Ready.");
      }
      if (buttonWake && !longPress) sendCopy();
      // TODO(phase 2): longPress → camera capture → POST /copy with img
      pollInbox();
      api("POST", "/telemetry", telemetry, nullptr);
    }
    wifiDown();
  }

  // Sleep until the next poll or a button press.
  esp_sleep_enable_ext0_wakeup((gpio_num_t)PIN_BUTTON, 0);
  esp_sleep_enable_timer_wakeup((uint64_t)rtcPollS * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {}
