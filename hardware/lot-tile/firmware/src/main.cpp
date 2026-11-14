// LOT TILE (LOT-HW-01) — main state machine. Design: docs/05-FIRMWARE.md
// Session 1 skeleton: provisioning, pairing, sync, Copy -> Log, telemetry, deep sleep.
// Display/haptic/sensor/camera drivers are thin stubs marked TODO(EVT).
#include <Arduino.h>
#include <Preferences.h>
#include <WiFi.h>
#include <Wire.h>
#include <esp_sleep.h>
#include "config.h"
#include "lot_api.h"

static Preferences prefs;  // NVS namespace "lot"; encrypted at PVT (flash encryption)
static LotApi api;

RTC_DATA_ATTR static uint32_t wakeCount = 0;
RTC_DATA_ATTR static char rtcCursor[40] = "";
RTC_DATA_ATTR static char rtcNid[40] = "";     // id of the notification on screen
RTC_DATA_ATTR static uint32_t rtcNextPollS = LOT_POLL_DEFAULT_S;

// ---------------------------------------------------------------- UI stubs
// TODO(EVT): Adafruit_SharpMem on PIN_LCD_*; 2 lines, LOT style (periods, no icons).
static void show(const String& line1, const String& line2 = "") {
  Serial.printf("[LCD] %s | %s\n", line1.c_str(), line2.c_str());
}
// TODO(EVT): DRV2605L, library 6 (LRA), effect 47 "buzz 100%" x2 = pager pulse.
static void buzz() { Serial.println("[HAPTIC] pager pulse"); }

// ----------------------------------------------------------- sensors stubs
// TODO(EVT): BSEC2 forced mode on BME688, LTR-303 lux, MAX17048 SoC.
static LotTelemetry readSensors() {
  LotTelemetry t{};
  t.tempC = NAN; t.rh = NAN; t.hPa = NAN; t.iaq = NAN;
  t.gasClass = -1; t.lux = -1; t.batteryPct = -1;
  t.rssi = WiFi.RSSI();
  return t;
}
// TODO(EVT): esp32-camera, PWDN load switch, QVGA JPEG q=12. Returns false until implemented.
static bool capturePhoto(uint8_t** buf, size_t* len) { (void)buf; (void)len; return false; }

// ----------------------------------------------------------- provisioning
// USB-serial line protocol used by software/lotctl.py (docs/05-FIRMWARE.md §8)
static String serialNumber() {
  String s = prefs.getString("serial", "");
  if (s.length()) return s;
  uint64_t mac = ESP.getEfuseMac();  // dev fallback; factory burns LT01-xxxxxx
  char buf[24];
  snprintf(buf, sizeof buf, "LTDV-%06llX", (unsigned long long)(mac & 0xFFFFFF));
  return String(buf);
}

static void handleSerialCommand(const String& line) {
  if (line == "HELLO") {
    Serial.printf("OK LOT-TILE %s fw=%s hw=%s\n", serialNumber().c_str(), LOT_FW_VERSION, LOT_HW_REV);
  } else if (line.startsWith("WIFI ")) {
    int sp = line.indexOf(' ', 5);
    if (sp < 0) { Serial.println("ERR usage: WIFI <ssid> <pass>"); return; }
    prefs.putString("ssid", line.substring(5, sp));
    prefs.putString("pass", line.substring(sp + 1));
    Serial.println("OK saved");
  } else if (line.startsWith("API ")) {
    prefs.putString("host", line.substring(4));
    Serial.println("OK");
  } else if (line == "STATUS") {
    Serial.printf("OK wifi=%s rssi=%d paired=%s nid=%s poll=%u\n",
                  WiFi.isConnected() ? "up" : "down", WiFi.RSSI(),
                  prefs.getString("token", "").length() ? "yes" : "no", rtcNid, rtcNextPollS);
  } else if (line == "FORGET") {
    prefs.remove("token");
    Serial.println("OK");
  } else if (line == "SLEEP") {
    Serial.println("OK");
    Serial.flush();
    esp_deep_sleep_start();
  } else {
    Serial.println("ERR unknown");
  }
}

static void serialConsole(uint32_t windowMs) {
  uint32_t until = millis() + windowMs;
  String line;
  while (millis() < until) {
    while (Serial.available()) {
      char c = Serial.read();
      if (c == '\n' || c == '\r') {
        line.trim();
        if (line.length()) { handleSerialCommand(line); until = millis() + windowMs; }
        line = "";
      } else {
        line += c;
      }
    }
    delay(5);
  }
}

// ----------------------------------------------------------------- network
static bool wifiUp() {
  String ssid = prefs.getString("ssid", "");
  if (!ssid.length()) return false;
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid.c_str(), prefs.getString("pass", "").c_str());
  uint32_t t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 10000) delay(50);
  return WiFi.status() == WL_CONNECTED;
}

static void pairFlow() {
  String code;
  uint32_t expires = 0;
  if (!api.registerDevice(code, expires)) { show("Offline.", "Pairing failed."); return; }
  show("Pair: " + code, "lot-systems.com");
  uint32_t until = millis() + expires * 1000UL;
  String token, name;
  while (millis() < until) {
    if (api.pollPair(code, token, name)) {
      prefs.putString("token", token);
      show(name.length() ? "Hello, " + name + "." : "Paired.");
      buzz();
      return;
    }
    delay(3000);
  }
  show("Pair code expired.", "Hold Copy to retry.");
}

// ---------------------------------------------------------------- copy key
static void handleCopyKey() {
  uint32_t t0 = millis();
  while (digitalRead(PIN_COPY_KEY) == LOW && millis() - t0 < LOT_COPY_FORGET_MS) delay(10);
  uint32_t held = millis() - t0;

  if (held >= LOT_COPY_FORGET_MS) {
    prefs.remove("token");
    rtcNid[0] = 0;
    show("Forgotten.", "Pairing again.");
    return;  // next step in loop falls into pairFlow()
  }
  if (!rtcNid[0]) { show("Nothing to copy."); return; }

  bool ok = api.copy(rtcNid);
  if (ok && held >= LOT_COPY_LONG_MS) {
    uint8_t* jpg = nullptr;
    size_t len = 0;
    if (capturePhoto(&jpg, &len)) {
      ok = api.photo(rtcNid, jpg, len);
      free(jpg);
      show(ok ? "Copied. Photo." : "Photo failed.");
      return;
    }
  }
  show(ok ? "Copied." : "Copy failed.");
}

// ------------------------------------------------------------------- sleep
static void sleepNow() {
  uint32_t s = constrain(rtcNextPollS, (uint32_t)LOT_POLL_MIN_S, (uint32_t)LOT_POLL_MAX_S);
  esp_sleep_enable_timer_wakeup((uint64_t)s * 1000000ULL);
  // Copy key + IMU pickup, both active-low RTC GPIOs
  esp_sleep_enable_ext1_wakeup((1ULL << PIN_COPY_KEY) | (1ULL << PIN_IMU_INT1), ESP_EXT1_WAKEUP_ANY_LOW);
  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
  Serial.flush();
  esp_deep_sleep_start();
}

// ------------------------------------------------------------------- main
void setup() {
  Serial.begin(115200);
  pinMode(PIN_COPY_KEY, INPUT_PULLUP);
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
  prefs.begin("lot", false);
  wakeCount++;

  esp_sleep_wakeup_cause_t cause = esp_sleep_get_wakeup_cause();
  bool firstBoot = cause == ESP_SLEEP_WAKEUP_UNDEFINED;
  if (firstBoot) serialConsole(3000);  // window for lotctl after reset / USB plug

  if (!prefs.getString("ssid", "").length()) {
    show("Connect to lotctl.", "USB-C on dock.");
    serialConsole(120000);
    sleepNow();
  }
  if (!wifiUp()) { show("Offline."); sleepNow(); }

  api.begin(prefs.getString("host", LOT_API_DEFAULT_HOST), serialNumber(), prefs.getString("token", ""));

  if (cause == ESP_SLEEP_WAKEUP_EXT1 && digitalRead(PIN_COPY_KEY) == LOW && prefs.getString("token", "").length()) {
    handleCopyKey();
  }
  if (!prefs.getString("token", "").length()) {
    pairFlow();
    api.setToken(prefs.getString("token", ""));
  }

  LotSyncResult r = api.sync(rtcCursor);
  if (r.httpStatus == 401) {
    prefs.remove("token");
    show("Unpaired.", "Hold Copy to pair.");
  } else if (r.ok) {
    strlcpy(rtcCursor, r.cursor.c_str(), sizeof rtcCursor);
    if (r.nextPollS) rtcNextPollS = r.nextPollS;
    if (r.hasNew) {
      strlcpy(rtcNid, r.latest.id.c_str(), sizeof rtcNid);
      buzz();
      show(r.latest.text);
    }
  }

  if (wakeCount % LOT_TELEMETRY_EVERY_N == 0) api.telemetry(readSensors());
  sleepNow();
}

void loop() {}  // never reached: every path ends in deep sleep
