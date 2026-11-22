// LOT·01 — build configuration
#pragma once

// ---- Server ---------------------------------------------------------------
#ifndef LOT_API_BASE
#define LOT_API_BASE "https://lot-systems.com/device-api/v1"
#endif
#define LOT_HW_REV "lot-01-evt"
#define LOT_FW_VERSION "0.1.0"

// ---- Limits (compressed protocol) -----------------------------------------
#define LOT_MAX_TEXT 64           // chars on screen / per message
#define LOT_MIN_POLL_S 300        // 5 min
#define LOT_MAX_POLL_S 3600       // 60 min
#define LOT_DEFAULT_POLL_S 900    // 15 min
#define LOT_LONG_PRESS_MS 1500

// ---- Pins (EVT draft, see 05-PCB-PCBWAY.md) --------------------------------
#define PIN_KEY_COPY 1    // RTC GPIO, active low, wake source
#define PIN_IMU_INT1 2    // RTC GPIO, active high, wake source
#define PIN_CHG_STAT 4
#define PIN_I2C_SDA 8
#define PIN_I2C_SCL 9
#define PIN_LCD_SCS 10
#define PIN_LCD_SI 11
#define PIN_LCD_SCK 12
#define PIN_LCD_EXTCOMIN 13
#define PIN_HAPTIC_EN 14
#define PIN_CAM_PWR_EN 21

#define LCD_W 128
#define LCD_H 128
