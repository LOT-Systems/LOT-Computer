// LOT SQ-1 — hardware + service configuration
#pragma once

#define SQ1_FW_VERSION "0.1.0"

// ---- LOT Device API v1 ----
#ifndef SQ1_API_HOST
#define SQ1_API_HOST "https://lot-systems.com"
#endif
#define SQ1_API_PREFIX "/api/device/v1"
#define SQ1_MAX_TEXT 48
#define SQ1_DEFAULT_SYNC_S 900
#define SQ1_MIN_SYNC_S 60
#define SQ1_MAX_SYNC_S 7200
#define SQ1_HTTP_TIMEOUT_MS 8000

// ---- Pins (see docs/05-FIRMWARE.md §4) ----
#define PIN_BTN_COPY 1   // RTC, active low, EXT0 wake
#define PIN_IMU_INT1 2   // RTC, EXT1 wake
#define PIN_I2C_SDA 8
#define PIN_I2C_SCL 9
#define PIN_VIBE 5
#define PIN_CAM_PWR 7    // also drives the privacy LED (hardware)

#define PIN_EPD_CS 10
#define PIN_EPD_MOSI 11
#define PIN_EPD_SCK 12
#define PIN_EPD_DC 13
#define PIN_EPD_RST 14
#define PIN_EPD_BUSY 4

#define PIN_CAM_XCLK 15
#define PIN_CAM_PCLK 6
#define PIN_CAM_VSYNC 47
#define PIN_CAM_HREF 48
#define PIN_CAM_D0 16
#define PIN_CAM_D1 17
#define PIN_CAM_D2 18
#define PIN_CAM_D3 21
#define PIN_CAM_D4 38
#define PIN_CAM_D5 39
#define PIN_CAM_D6 40
#define PIN_CAM_D7 41

// ---- UX ----
#define LONG_PRESS_MS 1500
#define BUZZ_ON_MS 120
#define BUZZ_GAP_MS 140
#define PHOTO_MAX_BYTES (200 * 1024)
