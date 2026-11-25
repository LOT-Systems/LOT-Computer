// LOT-HW-01 "TILE" — build configuration
#pragma once

#define LOT_FW_VERSION      "0.1.0"
#define LOT_HW_REV          "LOT-HW-01"
#define LOT_API_BASE        "https://lot-systems.com"   // Device API, doc 06
#define LOT_SYNC_SEC_DEFAULT 900                         // 15 min
#define LOT_MAX_TEXT        64
#define LOT_INBOX_SLOTS     8                            // RTC-memory ring of pending lines

// Pins (bench = XIAO ESP32-S3; product = doc 04 §02)
#if LOT_BENCH
  #define PIN_COPY_BTN   GPIO_NUM_2   // D1
  #define PIN_IMU_INT1   GPIO_NUM_3   // D2
  #define PIN_LCD_SCK    7
  #define PIN_LCD_MOSI   9
  #define PIN_LCD_CS     44
  #define PIN_I2C_SDA    5
  #define PIN_I2C_SCL    6
#else
  #define PIN_COPY_BTN   GPIO_NUM_4
  #define PIN_IMU_INT1   GPIO_NUM_5
  #define PIN_LCD_SCK    12
  #define PIN_LCD_MOSI   11
  #define PIN_LCD_CS     10
  #define PIN_I2C_SDA    8
  #define PIN_I2C_SCL    9
  #define PIN_CAM_EN     1
  #define PIN_SNS_EN     2
#endif

#define LONG_PRESS_MS    2000
#define DOUBLE_PRESS_MS  400
#define REPAIR_PRESS_MS  10000
