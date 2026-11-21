// LOT Systems · LD-01 "Tile" · Rev A firmware skeleton
// State machine: SLEEP -> SENSE -> SYNC -> SLEEP (docs/hardware/04-FIRMWARE.md)
#include <Arduino.h>
#include <WiFi.h>
#include <Wire.h>
#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SharpMem.h>
#include <Adafruit_BME680.h>
#include "config.h"
#include "lot_api.h"
#if __has_include("secrets.h")
  #include "secrets.h"
#else
  #include "secrets.example.h"
#endif

#define BLACK 0
#define WHITE 1

static Adafruit_SharpMem lcd(PIN_LCD_SCK, PIN_LCD_MOSI, PIN_LCD_CS, LCD_W, LCD_H);
static Adafruit_BME680 bme(&Wire);

// Survives deep sleep
RTC_DATA_ATTR static LotNotification rtc_current = {"", ""};
RTC_DATA_ATTR static uint32_t rtc_poll_s = POLL_INTERVAL_S;
RTC_DATA_ATTR static uint32_t rtc_since_poll_s = POLL_INTERVAL_S; // force sync on first boot
RTC_DATA_ATTR static SensorSnap rtc_last = {0, 0, 0, 0};

static void render(const char* line, const SensorSnap& s, const char* status = nullptr) {
  lcd.clearDisplay();
  lcd.setTextColor(BLACK);
  lcd.setTextSize(2);
  lcd.setCursor(6, 20);
  lcd.print(*line ? line : "LOT.");   // GFX wraps long text
  lcd.setTextSize(1);
  lcd.setCursor(6, LCD_H - 14);
  lcd.printf("%.0f%c  %.0f%%  %.0f", s.t, 0xF8, s.rh, s.p / 100.0f);
  if (status) { lcd.setCursor(LCD_W - 50, LCD_H - 14); lcd.print(status); }
  lcd.refresh();
}

static SensorSnap sample() {
  SensorSnap s = rtc_last;
  if (bme.performReading()) {
    s.t = bme.temperature; s.rh = bme.humidity; s.p = bme.pressure;
    s.gasKohm = bme.gas_resistance / 1000.0f;
    rtc_last = s;
    // TODO(S-2): append zig-zag varint delta to RTC batch; CBOR-encode + POST /telemetry at BATCH_MAX
  }
  return s;
}

static bool wifi_up() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(LD01_WIFI_SSID, LD01_WIFI_PASS);  // TODO(S-2): BLE provisioning + RTC channel/BSSID cache
  for (int i = 0; i < 60 && WiFi.status() != WL_CONNECTED; i++) delay(50);
  return WiFi.status() == WL_CONNECTED;
}

static void wifi_down() { WiFi.disconnect(true); WiFi.mode(WIFI_OFF); }

static void haptic_tick() { /* TODO(S-2): DRV2605L effect #1 (strong click) */ }

static uint32_t press_ms() {
  uint32_t t0 = millis();
  while (digitalRead(PIN_BTN_COPY) == LOW && millis() - t0 < RESET_PRESS_MS + 100) delay(10);
  return millis() - t0;
}

static void do_copy(const SensorSnap& s) {
  render(rtc_current.text, s, "...");
  bool ok = wifi_up() && lot_api::postCopy(rtc_current.id, rtc_current.text, s);
  wifi_down();
  render(rtc_current.text, s, ok ? "Copied." : "Saved.");  // "Saved." = queued in outbox (TODO)
  delay(2000);
  render(rtc_current.text, s);
}

static void do_sync(const SensorSnap& s) {
  if (!wifi_up()) { wifi_down(); return; }
  LotNotification inbox[5];
  int n = lot_api::fetchInbox(inbox, 5, &rtc_poll_s);
  wifi_down();
  if (n > 0) {
    rtc_current = inbox[n - 1];   // newest on screen; TODO: queue for double-tap paging
    haptic_tick();
  }
  render(rtc_current.text, s);
  rtc_since_poll_s = 0;
}

void setup() {
  pinMode(PIN_BTN_COPY, INPUT_PULLUP);
  Wire.begin(PIN_SDA, PIN_SCL);
  lcd.begin();
  bme.begin(0x76) || bme.begin(0x77);
  bme.setGasHeater(320, 150);
  lot_api::begin(LD01_DEVICE_TOKEN);

  SensorSnap s = sample();
  esp_sleep_wakeup_cause_t why = esp_sleep_get_wakeup_cause();

  if (why == ESP_SLEEP_WAKEUP_EXT0) {
    uint32_t held = press_ms();
    if (held >= RESET_PRESS_MS) {
      render("Reset.", s);  // TODO(S-2): erase NVS + enter PROVISION
    } else if (held >= LONG_PRESS_MS) {
      render("Capture.", s); // TODO(S-2): camera frame -> POST /capture
    } else {
      do_copy(s);
    }
  } else {
    rtc_since_poll_s += SAMPLE_INTERVAL_S;
    if (why == ESP_SLEEP_WAKEUP_UNDEFINED || rtc_since_poll_s >= rtc_poll_s) do_sync(s);
    else render(rtc_current.text, s);
  }

  // Sleep: timer for next sample, button for Copy.
  // NOTE: Sharp LCD needs VCOM toggling while static; production uses EXTCOMIN from RTC/ULP. TODO(S-5).
  esp_sleep_enable_ext0_wakeup((gpio_num_t)PIN_BTN_COPY, 0);
  esp_sleep_enable_timer_wakeup((uint64_t)SAMPLE_INTERVAL_S * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {}
