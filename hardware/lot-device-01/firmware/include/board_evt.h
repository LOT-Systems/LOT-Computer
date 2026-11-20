// LOT-DEVICE-01 EVT custom PCB pin map — PLACEHOLDER until schematic Rev A.
#pragma once
#define PIN_LCD_SCK   12
#define PIN_LCD_MOSI  11
#define PIN_LCD_CS    10
#define PIN_LCD_EXTCOMIN 9           // 1 Hz VCOM toggle (memory LCD), driven by LEDC/ULP
#define PIN_BUTTON    0
#define PIN_BUZZ      4
#define PIN_SDA       8
#define PIN_SCL       18
#define PIN_IMU_INT   1              // BMI270 any-motion → wake (EXT1)
