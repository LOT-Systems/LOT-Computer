// LOT·01 — main state machine (see 06-FIRMWARE.md §2)
#include <Arduino.h>
#include <WiFi.h>
#include <Preferences.h>
#include <esp_sleep.h>
#include "config.h"
#include "lot_api.h"
#include "hw.h"

static Preferences nvs;
RTC_DATA_ATTR static uint32_t g_bootCount = 0;
RTC_DATA_ATTR static uint32_t g_nextPollS = LOT_DEFAULT_POLL_S;

static bool wifiUp(uint32_t timeoutMs = 6000) {
  if (WiFi.status() == WL_CONNECTED) return true;
  String ssid = nvs.getString("ssid", ""), pass = nvs.getString("pass", "");
  if (!ssid.length()) return false;  // TODO(P1): BLE provisioning (wifi_prov_mgr)
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid.c_str(), pass.c_str());
  uint32_t t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < timeoutMs) delay(50);
  if (WiFi.status() == WL_CONNECTED) configTime(0, 0, "pool.ntp.org");
  return WiFi.status() == WL_CONNECTED;
}

static void wifiDown() { WiFi.disconnect(true); WiFi.mode(WIFI_OFF); }

static void doPairing() {
  if (!wifiUp(15000)) { hw::showText("No Wi-Fi", "press Copy to set up"); return; }
  String deviceCode, userCode; uint32_t interval;
  if (!lot::pairStart(deviceCode, userCode, interval)) { hw::showText("Server busy", "retry later"); return; }
  hw::showPairCode(userCode);
  for (int i = 0; i < 120; i++) {           // ~10 min at 5 s
    delay(interval * 1000);
    String token, deviceId;
    int r = lot::pairPoll(deviceCode, token, deviceId);
    if (r == 1) {
      nvs.putString("token", token);
      nvs.putString("device_id", deviceId);
      lot::begin(token);
      hw::buzz(1);
      hw::showText("Paired.", "LOT-01");
      return;
    }
    if (r < 0) break;
  }
  hw::showText("Code expired", "press Copy");
}

static void doPoll() {
  if (!wifiUp()) return;
  LotItem item; uint32_t nextPoll = LOT_DEFAULT_POLL_S;
  if (lot::inbox(nvs.getString("last_id", ""), item, nextPoll)) {
    nvs.putString("last_id", item.id);
    nvs.putString("last_text", item.text);
    hw::buzz(2);
    hw::showText(item.text, String(hw::batteryPct()) + "%");
    lot::ack(item.id);
  }
  g_nextPollS = nextPoll;
  if (g_bootCount % 8 == 0) lot::telemetry(hw::batteryPct(), hw::batteryMv(), WiFi.RSSI(), millis() / 1000);
}

static void doCopy() {
  LotItem item;
  item.id = nvs.getString("last_id", "");
  item.text = nvs.getString("last_text", "");
  if (!item.text.length()) { hw::showText("Nothing to copy"); return; }
  LotEnv env = hw::readEnv();
  if (!wifiUp()) { hw::showText(item.text, "offline - not logged"); return; }
  String logId;
  bool ok = lot::copy(item, env, logId);
  hw::buzz(ok ? 1 : 3);
  hw::showText(item.text, ok ? "Copied to Log" : "Copy failed");
}

static void goToSleep() {
  wifiDown();
  hw::powerDownPeripherals();
  esp_sleep_enable_timer_wakeup((uint64_t)g_nextPollS * 1000000ULL);
  esp_sleep_enable_ext1_wakeup((1ULL << PIN_KEY_COPY), ESP_EXT1_WAKEUP_ANY_LOW);
  // IMU wake on a second ext source (ext0) — active high double-tap.
  esp_sleep_enable_ext0_wakeup((gpio_num_t)PIN_IMU_INT1, 1);
  esp_deep_sleep_start();
}

void setup() {
  g_bootCount++;
  Serial.begin(115200);
  pinMode(PIN_KEY_COPY, INPUT_PULLUP);
  nvs.begin("lot01", false);
  hw::begin();

  String token = nvs.getString("token", "");
  if (!token.length()) { doPairing(); goToSleep(); }
  lot::begin(token);

  switch (esp_sleep_get_wakeup_cause()) {
    case ESP_SLEEP_WAKEUP_EXT1: {             // Copy key
      uint32_t t0 = millis();
      while (digitalRead(PIN_KEY_COPY) == LOW && millis() - t0 < LOT_LONG_PRESS_MS) delay(10);
      if (millis() - t0 >= LOT_LONG_PRESS_MS) hw::showText("Camera", "Phase 2");  // TODO(D-3)
      else doCopy();
      break;
    }
    case ESP_SLEEP_WAKEUP_EXT0:               // double-tap: redraw last message
      hw::showText(nvs.getString("last_text", "LOT"), String(hw::batteryPct()) + "%");
      break;
    default:                                  // timer or cold boot
      if (hw::onCharger()) g_nextPollS = LOT_MIN_POLL_S;
      doPoll();
      break;
  }
  goToSleep();
}

void loop() {}
