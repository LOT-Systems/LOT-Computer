// LOT Pager L-01 — pin map and constants (P1 breadboard = DevKitC-1; matches doc 05 §2)
#pragma once

#define LOT_API_BASE      "https://lot-systems.com/api/device/v1"
#define HW_NAME           "L-01"

// Sharp memory LCD (SPI)
#define PIN_LCD_SCK       12
#define PIN_LCD_MOSI      11
#define PIN_LCD_CS        10
#define PIN_LCD_EXTCOMIN  9
#define PIN_LCD_DISP      8
#define LCD_W             128
#define LCD_H             128
#define SCREEN_MAX_CHARS  80   // 16 cols x 5 lines, 8x16 font

// I2C sensors: BME688 0x77, BMI270 0x68, SHT45 0x44, MAX17048 0x36
#define PIN_SDA           1
#define PIN_SCL           2

// Inputs / outputs
#define PIN_BTN_COPY      4    // RTC GPIO, active low, wake source
#define PIN_IMU_INT1      3    // RTC GPIO, wake on pick-up
#define PIN_HAPTIC        5
#define PIN_CAM_LED       6    // also gates camera power (privacy)

// Timing
#define DEFAULT_POLL_S    900  // overridden by server pollSeconds
#define LONG_PRESS_MS     2000 // reserved: camera capture (D-04, off in v1)
#define RESET_PRESS_MS    8000 // unpair + factory reset
#define COPY_QUEUE_MAX    20   // offline Copy presses kept in NVS
#define HTTP_TIMEOUT_MS   8000
