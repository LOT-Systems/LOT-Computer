// LOT TILE P1 — pin map (see docs/04-ELECTRICAL.md §2)
#pragma once
#define PIN_BTN_COPY      1   // RTC, active-low, ext0 wake
#define PIN_LCD_SCLK     12
#define PIN_LCD_MOSI     11
#define PIN_LCD_CS       10   // Sharp: active-HIGH
#define PIN_LCD_EXTCOMIN  9
#define PIN_LCD_DISP      8
#define PIN_I2C_SDA       4
#define PIN_I2C_SCL       5
#define PIN_BHI_INT       6   // RTC, tap/flip wake
#define PIN_CAM_PWR_EN   14   // also powers privacy LED (hard-wired)
#define PIN_HAPTIC_EN    21
#define PIN_CHG_STAT     13
#define LCD_W 128
#define LCD_H 128
