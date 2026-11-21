#pragma once
// LOT Systems · LD-01 · pins and timings (Proto-A, XIAO ESP32S3)

#define LD01_FW_VERSION      "0.1.0-revA"
#define LD01_API_HOST        "lot-systems.com"
#define LD01_API_BASE        "/api/device/v1"

// Sharp memory LCD (SPI)
#define PIN_LCD_SCK          7   // D8
#define PIN_LCD_MOSI         9   // D10
#define PIN_LCD_CS           2   // D1
#define LCD_W                168 // Proto-A breakout; production LS013B7DH03 = 128
#define LCD_H                144

// I2C: BME688 (+ BHI260AP in production)
#define PIN_SDA              5   // D4
#define PIN_SCL              6   // D5

// Copy button (to GND, internal pull-up, RTC-capable for ext0 wake)
#define PIN_BTN_COPY         1   // D0

// Timings
#define POLL_INTERVAL_S      900     // 15 min default, server may override
#define SAMPLE_INTERVAL_S    300     // BME688 every 5 min
#define BATCH_MAX            12      // upload after 12 samples (1 h)
#define LONG_PRESS_MS        1500
#define RESET_PRESS_MS       10000
#define OUTBOX_SLOTS         16
