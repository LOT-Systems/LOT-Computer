// LOT-DEVICE-01 — compile-time configuration
#pragma once

#ifndef LOT_FW_VERSION
#define LOT_FW_VERSION "0.0.0"
#endif

#define LOT_API_HOST        "lot-systems.com"
#define LOT_API_BASE        "/api/device/v1"
#define LOT_POLL_DEFAULT_S  900      // server may override via `w`
#define LOT_TEXT_MAX        64       // matches server clip()
#define LOT_LONG_PRESS_MS   1200     // long-press = camera capture (phase 2)
#define LOT_BUZZ_MS         180

// ── Pin map ────────────────────────────────────────────────────────────────
#if defined(LOT_BOARD_DEVKIT)        // Seeed XIAO ESP32S3 Sense
  #define PIN_LCD_SCK   7
  #define PIN_LCD_MOSI  9
  #define PIN_LCD_CS    2
  #define PIN_BUTTON    1            // RTC-capable → deep-sleep wake (EXT0)
  #define PIN_BUZZ      3
  #define PIN_SDA       5
  #define PIN_SCL       6
#elif defined(LOT_BOARD_EVT)
  #include "board_evt.h"
#else
  #error "Select a board env in platformio.ini"
#endif
