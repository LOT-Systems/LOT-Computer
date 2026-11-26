// LOT PAGER · TILE-40 · firmware v0.1 (EVT-0)
// One screen, one button, one camera, one weather sensor.
//
// State machine:
//   BOOT -> SYNC (fetch notice) -> SHOW (memory LCD holds image at ~uW) -> SLEEP
//   SLEEP wakes on: timer (POLL_INTERVAL_S) | button (ext0 on PIN_BUTTON)
//   Button short press  = COPY  -> POST /api/logs, screen shows "Copied."
//   Button long press   = SNAP  -> camera frame (EVT-1: upload for AI caption)
//
// Not compiled in the 2026-11-26 session (no toolchain/network in sandbox).
// First action of the next session with hardware: `pio run -t upload`.

#include <Arduino.h>
#include <Wire.h>
#include <SPI.h>
#include <Adafruit_SharpMem.h>
#include <bme68xLibrary.h>
#include "config.h"
#include "lot_client.h"

#define LCD_W 128
#define LCD_H 128
#define BLACK 0
#define WHITE 1

static Adafruit_SharpMem lcd(PIN_LCD_SCK, PIN_LCD_MOSI, PIN_LCD_CS, LCD_W, LCD_H);
static Bme68x bme;

RTC_DATA_ATTR static char rtcNotice[NOTIFY_MAX_CHARS + 1] = "";
RTC_DATA_ATTR static char rtcSource[8] = "none";
RTC_DATA_ATTR static uint32_t bootCount = 0;

static void drawScreen(const String& line, const char* footer) {
  lcd.clearDisplay();
  lcd.setTextColor(BLACK);
  lcd.setTextSize(1);
  lcd.setTextWrap(true);
  lcd.setCursor(4, 8);
  lcd.print("LOT");
  lcd.drawFastHLine(4, 20, LCD_W - 8, BLACK);
  lcd.setTextSize(2);           // 12x16 glyphs -> ~10 chars x 5 lines
  lcd.setCursor(4, 28);
  lcd.print(line.length() ? line : String("Quiet."));
  lcd.setTextSize(1);
  lcd.setCursor(4, LCD_H - 12);
  lcd.print(footer);
  lcd.refresh();
}

static LotSensorSnapshot readWeather() {
  LotSensorSnapshot s{0, 0, 0, 0, false};
  bme.begin(BME68X_I2C_ADDR_LOW, Wire);
  if (bme.checkStatus() == BME68X_ERROR) return s;
  bme.setTPH();
  bme.setHeaterProf(300, 100);
  bme.setOpMode(BME68X_FORCED_MODE);
  delayMicroseconds(bme.getMeasDur());
  delay(110);
  bme68xData d;
  if (bme.fetchData() && bme.getData(d)) {
    // NOTE: self-heating inside a sealed steel can biases temperature upward.
    // EVT-1 applies a per-unit offset measured at EOL test (see 08-PRODUCTION).
    s = { d.temperature, d.humidity, d.pressure / 100.0f, d.gas_resistance / 1000.0f, true };
  }
  return s;
}

static bool isLongPress() {
  uint32_t t0 = millis();
  while (digitalRead(PIN_BUTTON) == LOW) {
    if (millis() - t0 > 1200) return true;
    delay(10);
  }
  return false;
}

static void goToSleep() {
  esp_sleep_enable_timer_wakeup((uint64_t)POLL_INTERVAL_S * 1000000ULL);
  esp_sleep_enable_ext0_wakeup((gpio_num_t)PIN_BUTTON, 0);
  // Memory LCD keeps its image with EXTCOMIN toggling; on the custom PCB that
  // toggle comes from the RTC/ULP or a 1 Hz pin of the fuel gauge, not the CPU.
  esp_deep_sleep_start();
}

void setup() {
  bootCount++;
  pinMode(PIN_BUTTON, INPUT_PULLUP);
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
  lcd.begin();

  esp_sleep_wakeup_cause_t cause = esp_sleep_get_wakeup_cause();
  LotNotice current{ String(rtcNotice), String(rtcSource), 0 };

  if (cause == ESP_SLEEP_WAKEUP_EXT0) {
    bool longPress = isLongPress();
    if (!longPress) {
      drawScreen(current.text, "Copying.");
      bool ok = lot::begin() && lot::postCopy(current, readWeather());
      drawScreen(current.text, ok ? "Copied." : "Not sent. Retry.");
    } else {
      // EVT-1: camera capture -> POST /api/device/snap (see 06-SOFTWARE doc)
      drawScreen(current.text, "Camera: EVT-1.");
    }
    goToSleep();
  }

  // Timer wake or first boot: sync a notice
  if (lot::begin()) {
    LotNotice n = lot::fetchNotice();
    if (n.source != "none") {
      strncpy(rtcNotice, n.text.c_str(), NOTIFY_MAX_CHARS);
      rtcNotice[NOTIFY_MAX_CHARS] = 0;
      strncpy(rtcSource, n.source.c_str(), sizeof(rtcSource) - 1);
      current = n;
    }
    drawScreen(current.text, "Synced.");
  } else {
    drawScreen(current.text, "Offline.");
  }
  goToSleep();
}

void loop() {}
