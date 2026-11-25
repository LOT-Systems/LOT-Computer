// LOT-HW-01 "TILE" — firmware v0.1.0 skeleton
// States: BOOT → (PAIR?) → WAKE → [SYNC] → SHOW → DEEP SLEEP
// Wake sources: RTC timer (sync / scheduled fireAt), Copy button, IMU pick-up.
// See hardware/docs/05-FIRMWARE.md. Not yet compiled or run on hardware.

#include <Arduino.h>
#include <WiFi.h>
#include <Wire.h>
#include <Preferences.h>
#include <Adafruit_SharpMem.h>
#include <Adafruit_BME680.h>
#include <sys/time.h>
#include "esp_sleep.h"
#include "config.h"
#include "lot_api.h"

// ── RTC memory: survives deep sleep, lost on power loss ──────────────────────
RTC_DATA_ATTR uint32_t rtcCursor = 0;
RTC_DATA_ATTR uint32_t rtcLastSync = 0;
RTC_DATA_ATTR uint32_t rtcSyncSec = LOT_SYNC_SEC_DEFAULT;
RTC_DATA_ATTR uint32_t rtcSession = 0;
RTC_DATA_ATTR uint16_t rtcWakes = 0, rtcCopies = 0;
RTC_DATA_ATTR LotNote  rtcInbox[LOT_INBOX_SLOTS];
RTC_DATA_ATTR uint8_t  rtcInboxN = 0;
RTC_DATA_ATTR int8_t   rtcShown = -1;           // index currently on screen

Adafruit_SharpMem lcd(PIN_LCD_SCK, PIN_LCD_MOSI, PIN_LCD_CS, 128, 128);
Adafruit_BME680 bme(&Wire);
Preferences prefs;

static uint32_t nowEpoch() {
  // ESP32 system time keeps running on the RTC timer through deep sleep.
  // It is set from the server's clock on every sync (no NTP needed).
  return (uint32_t)time(nullptr);
}

static LotEnv readEnv() {
  LotEnv e{NAN, NAN, NAN, NAN};
  if (bme.performReading()) {
    e.t = bme.temperature;
    e.rh = bme.humidity;
    e.p = bme.pressure / 100.0f;
    e.iaq = bme.gas_resistance / 1000.0f;  // raw kΩ; BSEC2 gives true IAQ in production firmware
  }
  return e;
}

static void draw(const char* line, const char* meta) {
  lcd.begin();
  lcd.clearDisplay();
  lcd.setTextColor(0);
  lcd.setTextWrap(true);
  lcd.setTextSize(2);
  lcd.setCursor(4, 36);
  lcd.print(line);
  lcd.setTextSize(1);
  lcd.setCursor(4, 116);
  lcd.print(meta);
  lcd.refresh();  // memory LCD keeps the image with ~µW while the MCU sleeps
}

static void showCurrent(const LotEnv& e) {
  char meta[40];
  uint32_t t = nowEpoch();
  snprintf(meta, sizeof meta, "%02lu:%02lu  %.0fC  %.0f%%",
           (unsigned long)((t / 3600) % 24), (unsigned long)((t / 60) % 60), e.t, e.rh);
  if (rtcShown >= 0 && rtcShown < rtcInboxN) draw(rtcInbox[rtcShown].text, meta);
  else draw("", meta);
}

// Pick the newest note whose fireAt has arrived and whose ttl has not expired.
static void selectDue() {
  uint32_t t = nowEpoch();
  int8_t best = -1;
  for (uint8_t i = 0; i < rtcInboxN; i++) {
    const LotNote& n = rtcInbox[i];
    bool due = n.fireAt == 0 || n.fireAt <= t;
    bool alive = n.ttl == 0 || (n.fireAt ? n.fireAt : rtcLastSync) + n.ttl > t;
    if (due && alive) best = i;
  }
  rtcShown = best;
}

// Seconds until the next thing that needs the CPU: a scheduled fireAt or the next sync.
static uint32_t secondsToNextWake() {
  uint32_t t = nowEpoch();
  uint32_t next = rtcLastSync + rtcSyncSec;
  for (uint8_t i = 0; i < rtcInboxN; i++)
    if (rtcInbox[i].fireAt > t && rtcInbox[i].fireAt < next) next = rtcInbox[i].fireAt;
  return next > t ? next - t : 5;
}

static bool wifiUp() {
  prefs.begin("lot", true);
  String ssid = prefs.getString("ssid", ""), pass = prefs.getString("pass", "");
  prefs.end();
  if (ssid.isEmpty()) return false;
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid.c_str(), pass.c_str());
  for (int i = 0; i < 60 && WiFi.status() != WL_CONNECTED; i++) delay(50);  // ≤ 3 s budget
  return WiFi.status() == WL_CONNECTED;
}

static String token() {
  prefs.begin("lot", true);
  String t = prefs.getString("token", "");
  prefs.end();
  return t;
}

static void sync(const LotEnv& e) {
  String tok = token();
  if (tok.isEmpty() || !wifiUp()) return;
  LotApi api(tok.c_str());
  LotNote fresh[LOT_INBOX_SLOTS];
  uint32_t serverNow = 0, syncSec = rtcSyncSec;
  int n = api.inbox(rtcCursor, fresh, LOT_INBOX_SLOTS, serverNow, syncSec);
  if (n >= 0) {
    if (serverNow) { timeval tv{(time_t)serverNow, 0}; settimeofday(&tv, nullptr); }  // resync clock
    rtcLastSync = nowEpoch();
    rtcSyncSec = syncSec;
    for (int i = 0; i < n; i++) {                       // append, drop oldest when full
      if (rtcInboxN == LOT_INBOX_SLOTS) { memmove(rtcInbox, rtcInbox + 1, sizeof(LotNote) * (LOT_INBOX_SLOTS - 1)); rtcInboxN--; }
      rtcInbox[rtcInboxN++] = fresh[i];
    }
    api.telemetry(rtcSession, rtcWakes, rtcCopies, 0 /* MAX17048 in product build */, e);
  }
  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
}

static void doCopy(const LotEnv& e) {
  if (rtcShown < 0) return;
  String tok = token();
  if (tok.isEmpty() || !wifiUp()) { draw("Offline.", "Copy saved for next sync."); return; }  // TODO: queue in NVS
  LotApi api(tok.c_str());
  bool ok = api.copy(rtcInbox[rtcShown], e, nowEpoch());
  WiFi.disconnect(true); WiFi.mode(WIFI_OFF);
  if (ok) rtcCopies++;
  draw(ok ? "Copied." : "Not copied.", ok ? "In your Log." : "Will retry.");
  delay(1200);
}

// Classify the button gesture that woke us (button is active-low).
enum Gesture { NONE, SHORT, LONG, DOUBLE, REPAIR };
static Gesture readGesture() {
  pinMode(PIN_COPY_BTN, INPUT_PULLUP);
  uint32_t t0 = millis();
  while (digitalRead(PIN_COPY_BTN) == LOW) {
    if (millis() - t0 > REPAIR_PRESS_MS) return REPAIR;
    delay(10);
  }
  uint32_t held = millis() - t0;
  if (held >= LONG_PRESS_MS) return LONG;
  uint32_t t1 = millis();
  while (millis() - t1 < DOUBLE_PRESS_MS) if (digitalRead(PIN_COPY_BTN) == LOW) return DOUBLE;
  return SHORT;
}

static void sleepNow() {
  uint32_t s = secondsToNextWake();
  esp_sleep_enable_timer_wakeup((uint64_t)s * 1000000ULL);
  esp_sleep_enable_ext1_wakeup((1ULL << PIN_COPY_BTN), ESP_EXT1_WAKEUP_ANY_LOW);
  // IMU pick-up wake (PIN_IMU_INT1) is added on the product board via ext1 mask with the button.
  esp_deep_sleep_start();
}

void setup() {
  rtcWakes++;
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
  bme.begin();
  bme.setGasHeater(320, 150);
  LotEnv e = readEnv();

  esp_sleep_wakeup_cause_t why = esp_sleep_get_wakeup_cause();
  if (why == ESP_SLEEP_WAKEUP_UNDEFINED) rtcSession++;  // cold boot = new session

  if (why == ESP_SLEEP_WAKEUP_EXT1) {
    switch (readGesture()) {
      case SHORT:  doCopy(e); break;
      case DOUBLE: if (rtcInboxN) rtcShown = (rtcShown + 1) % rtcInboxN; break;
      case LONG:   draw("Photo.", "Camera: EVT-1 build."); delay(800); break;  // HM01B0 capture → /api/device/photo
      case REPAIR: draw("Pair.", "Open lot-systems.com Settings."); break;      // BLE/NFC provisioning, doc 05 §06
      default: break;
    }
  } else if (why == ESP_SLEEP_WAKEUP_UNDEFINED || nowEpoch() >= rtcLastSync + rtcSyncSec) {
    sync(e);
  }

  selectDue();
  showCurrent(e);
  sleepNow();
}

void loop() {}
