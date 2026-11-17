// LOT PAGER — board + network configuration (HW-01)
#pragma once

// ---------------------------------------------------------------------------
// Network
// ---------------------------------------------------------------------------
#define LOT_API_HOST        "lot-systems.com"
#define LOT_API_BASE        "https://lot-systems.com/api/device/v1"
#define LOT_HTTP_TIMEOUT_MS 6000
#define LOT_WIFI_TIMEOUT_MS 8000

// Root CA for LOT_API_HOST (PEM). Must be filled from the live chain before
// production: `openssl s_client -connect lot-systems.com:443 -showcerts`.
// Firmware REFUSES to talk to the API while this is empty — never setInsecure().
#define LOT_ROOT_CA ""

// ---------------------------------------------------------------------------
// Display — Sharp LS011B7DH03 memory-in-pixel LCD, 160x68, 1.08"
// ---------------------------------------------------------------------------
#define LCD_W 160
#define LCD_H 68

// ---------------------------------------------------------------------------
// Pin map — Rev A custom PCB. Devkit overrides below.
// ---------------------------------------------------------------------------
#if defined(LOT_BOARD_DEVKIT)
  #define PIN_LCD_SCK   12
  #define PIN_LCD_MOSI  11
  #define PIN_LCD_CS    10
  #define PIN_LCD_DISP  9
  #define PIN_I2C_SDA   8
  #define PIN_I2C_SCL   18
  #define PIN_BTN       0     // BOOT button on devkit (RTC GPIO)
  #define PIN_CHG_N     -1
  #define PIN_IMU_INT   -1
#else
  #define PIN_LCD_SCK   36
  #define PIN_LCD_MOSI  35
  #define PIN_LCD_CS    37
  #define PIN_LCD_DISP  38
  #define PIN_I2C_SDA   1     // BME688, BMI270, LTR-303, MAX17048, RV-3028
  #define PIN_I2C_SCL   2
  #define PIN_BTN       3     // RTC GPIO, active-low, ext1 wake
  #define PIN_CHG_N     4     // BQ51050B CHG (open-drain, low = charging)
  #define PIN_IMU_INT   5     // BMI270 INT1, RTC GPIO, flip/tap wake
#endif

// Camera (DVP, 8-bit) — GC0308 / OV2640 class module on FPC
#define CAM_PIN_PWDN  6
#define CAM_PIN_XCLK  15
#define CAM_PIN_SIOD  PIN_I2C_SDA   // SCCB shares the sensor bus
#define CAM_PIN_SIOC  PIN_I2C_SCL
#define CAM_PIN_D0    16
#define CAM_PIN_D1    17
#define CAM_PIN_D2    21
#define CAM_PIN_D3    47
#define CAM_PIN_D4    48
#define CAM_PIN_D5    45
#define CAM_PIN_D6    39
#define CAM_PIN_D7    40
#define CAM_PIN_VSYNC 41
#define CAM_PIN_HREF  42
#define CAM_PIN_PCLK  14

// I2C addresses
#define I2C_BME688    0x77
#define I2C_BMI270    0x68
#define I2C_LTR303    0x29
#define I2C_MAX17048  0x36
#define I2C_RV3028    0x52   // CLKOUT = 1 Hz → LCD EXTCOMIN (VCOM) in deep sleep

// ---------------------------------------------------------------------------
// Behaviour
// ---------------------------------------------------------------------------
#define BTN_LONG_MS        1200   // long press = camera snap (S2)
#define TELEMETRY_EVERY_N  4      // send sensors every Nth wake
#define DEFAULT_POLL_S     900
#define MIN_POLL_S         60
#define MAX_POLL_S         3600
