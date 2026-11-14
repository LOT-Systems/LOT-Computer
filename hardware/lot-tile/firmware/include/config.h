// LOT TILE (LOT-HW-01) — board configuration. Pin map: docs/04-ELECTRICAL.md §2
#pragma once

#ifndef LOT_FW_VERSION
#define LOT_FW_VERSION "0.0.0"
#endif
#ifndef LOT_HW_REV
#define LOT_HW_REV "DEVKIT"
#endif

// ---- LOT API -------------------------------------------------------------
#define LOT_API_DEFAULT_HOST   "https://lot-systems.com"
#define LOT_API_PREFIX         "/api/device"
#define LOT_NOTIFY_MAX_CHARS   48      // server guarantees, device re-checks
#define LOT_PAYLOAD_MAX_BYTES  512
#define LOT_PHOTO_MAX_BYTES    (60 * 1024)

// ---- Cadence (seconds) ---------------------------------------------------
#define LOT_POLL_DEFAULT_S     300     // 5 min; server may override via next_poll_s
#define LOT_POLL_MIN_S         60
#define LOT_POLL_MAX_S         3600
#define LOT_TELEMETRY_EVERY_N  3       // telemetry every 3rd wake (~15 min)

// ---- Button timing (ms) --------------------------------------------------
#define LOT_COPY_LONG_MS       800     // long press -> photo
#define LOT_COPY_FORGET_MS     10000   // hold -> forget pairing

// ---- Pins (EVT1; devkit uses the same numbers via jumper wires) ----------
#define PIN_I2C_SDA      8
#define PIN_I2C_SCL      9
#define PIN_LCD_SCLK     12
#define PIN_LCD_MOSI     11
#define PIN_LCD_CS       10
#define PIN_LCD_EXTCOMIN 13
#define PIN_LCD_DISP     14
#define PIN_CAM_PWDN     21
#define PIN_CAM_XCLK     7
#define PIN_CAM_PCLK     4
#define PIN_CAM_VSYNC    5
#define PIN_CAM_HREF     6
#define PIN_CAM_D0       15
#define PIN_CAM_D1       16
#define PIN_CAM_D2       17
#define PIN_CAM_D3       18
#define PIN_CAM_D4       39
#define PIN_CAM_D5       40
#define PIN_CAM_D6       41
#define PIN_CAM_D7       42
#define PIN_COPY_KEY     0      // active low, RTC wake
#define PIN_IMU_INT1     1      // RTC wake
#define PIN_QI_CHG       2
#define PIN_QI_PGOOD     3
#define PIN_GAUGE_ALRT   47

#define LCD_W 160
#define LCD_H 68
