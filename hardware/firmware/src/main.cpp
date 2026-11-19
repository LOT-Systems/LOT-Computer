// LOT Pager L-01 — main loop: wake → fetch → show → sleep.
// Skeleton for P1 breadboard. Not yet compiled in CI (no PlatformIO in the doc session).
#include <Arduino.h>
#include <WiFi.h>
#include <Preferences.h>
#include <Wire.h>
#include <Adafruit_SharpMem.h>
#include "config.h"
#include "lot_client.h"

Adafruit_SharpMem lcd(PIN_LCD_SCK, PIN_LCD_MOSI, PIN_LCD_CS, LCD_W, LCD_H);
Preferences nvs;
LotClient lot;

RTC_DATA_ATTR uint32_t g_cursor = 0;       // survives deep sleep
RTC_DATA_ATTR char g_screen[SCREEN_MAX_CHARS + 1] = "";
RTC_DATA_ATTR char g_msgId[40] = "";

static void buzz(uint8_t n) {
  for (uint8_t i = 0; i < n; i++) { digitalWrite(PIN_HAPTIC, HIGH); delay(120); digitalWrite(PIN_HAPTIC, LOW); delay(120); }
}

// LOT style: plain text, ends with a period, no icons. Bottom line = time · temp · IAQ.
static void draw(const char* text, const String& footer) {
  lcd.clearDisplayBuffer();
  lcd.setTextColor(0); lcd.setTextSize(1); lcd.setTextWrap(true);
  lcd.setCursor(4, 8);  lcd.print(text);
  lcd.setCursor(4, LCD_H - 12); lcd.print(footer);
  lcd.refresh();  // memory LCD keeps the image with ~µW while the MCU sleeps
}

static bool wifiUp() {
  String ssid = nvs.getString("ssid", ""), pass = nvs.getString("pass", "");
  if (!ssid.length()) return false;
  WiFi.mode(WIFI_STA); WiFi.begin(ssid.c_str(), pass.c_str());
  for (int i = 0; i < 60 && WiFi.status() != WL_CONNECTED; i++) delay(100);
  return WiFi.status() == WL_CONNECTED;
}

static void flushCopyQueue() {
  int n = nvs.getInt("cq_n", 0);
  for (int i = 0; i < n; i++) {
    String t = nvs.getString(("cq_t" + String(i)).c_str(), "");
    String id = nvs.getString(("cq_i" + String(i)).c_str(), "");
    if (t.length() && !lot.copy(id, t)) return;  // still offline; keep queue
  }
  nvs.putInt("cq_n", 0);
}

static void queueCopy(const char* id, const char* text) {
  int n = nvs.getInt("cq_n", 0);
  if (n >= COPY_QUEUE_MAX) return;
  nvs.putString(("cq_t" + String(n)).c_str(), text);
  nvs.putString(("cq_i" + String(n)).c_str(), id);
  nvs.putInt("cq_n", n + 1);
}

static void onCopyPressed(bool online) {
  if (!g_screen[0]) return;
  buzz(1);
  draw("Copied.", "");
  if (!(online && lot.copy(g_msgId, g_screen))) queueCopy(g_msgId, g_screen);
  delay(1500);
}

static void sleepFor(uint32_t seconds) {
  WiFi.disconnect(true); WiFi.mode(WIFI_OFF);
  esp_sleep_enable_timer_wakeup((uint64_t)seconds * 1000000ULL);
  esp_sleep_enable_ext0_wakeup((gpio_num_t)PIN_BTN_COPY, 0);       // Copy button
  esp_sleep_enable_ext1_wakeup(1ULL << PIN_IMU_INT1, ESP_EXT1_WAKEUP_ANY_HIGH);  // pick-up
  esp_deep_sleep_start();
}

void setup() {
  pinMode(PIN_HAPTIC, OUTPUT); pinMode(PIN_CAM_LED, OUTPUT); digitalWrite(PIN_CAM_LED, LOW);
  pinMode(PIN_BTN_COPY, INPUT_PULLUP);
  Wire.begin(PIN_SDA, PIN_SCL);
  lcd.begin();
  nvs.begin("l01", false);
  lot.begin(nvs.getString("token", ""));
  if (!g_cursor) g_cursor = nvs.getUInt("cursor", 0);

  bool woke_by_button = esp_sleep_get_wakeup_cause() == ESP_SLEEP_WAKEUP_EXT0;

  // Hold 8 s at boot → unpair + reset
  uint32_t t0 = millis();
  while (woke_by_button && digitalRead(PIN_BTN_COPY) == LOW) {
    if (millis() - t0 > RESET_PRESS_MS) { draw("Reset.", ""); lot.unpair(); nvs.clear(); ESP.restart(); }
    delay(20);
  }

  if (!lot.paired()) {
    // TODO(P1): BLE/SoftAP setup page: Wi-Fi credentials + 6-digit code from lot-systems.com
    draw("Pair me on lot-systems.com.", "L-01 " L01_FW_VERSION);
    sleepFor(3600);
  }

  bool online = wifiUp();
  if (woke_by_button) onCopyPressed(online);

  uint32_t poll = DEFAULT_POLL_S;
  if (online) {
    flushCopyQueue();
    LotInbox ib = lot.inbox(g_cursor);
    if (ib.ok) {
      poll = ib.pollSeconds;
      g_cursor = ib.cursor; nvs.putUInt("cursor", g_cursor);
      if (ib.hasMessage) {
        strlcpy(g_screen, ib.latest.text.c_str(), sizeof g_screen);
        strlcpy(g_msgId, ib.latest.id.c_str(), sizeof g_msgId);
        buzz(ib.latest.buzz);
      }
    }
    // TODO(P1): read BSEC2 (BME688) + SHT45 + MAX17048, apply self-heating offset, then:
    LotReading r{21.4f, 41.2f, 1012.6f, 38, "normal", 87, WiFi.RSSI()};
    lot.telemetry(r);
  }
  draw(g_screen[0] ? g_screen : "LOT.", online ? "" : "Offline.");
  sleepFor(poll);
}

void loop() {}
