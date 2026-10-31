# LOT PLATE — Electronics (HW-05)

REV A · 2026-10-31 · schematic not drawn yet; this is the block + net plan for the PCBWay design.

## Block diagram
```
Qi coil -> BQ51050B -> LiPo -> MAX17048 (I2C)
                         |-> 3V3 reg -> ESP32-S3 -+- I2C0: BME688, BMI270, VEML7700, MAX17048
                                                  +- SPI : display (ST7789) 
                                                  +- DVP : camera (8-bit, XCLK 20 MHz, SCCB on I2C1)
                                                  +- GPIO: COPY button (wake, ext0), haptic, status LED
                                                  +- USB : native USB-C pads (flash/log) / pogo jig
```
## Pin plan (ESP32-S3-MINI-1, EVT; confirm vs datasheet, avoid strap pins 0/3/45/46, PSRAM-less N8)
| Signal | GPIO | Note |
|---|---|---|
| I2C0 SDA/SCL | 8 / 9 | sensors + gauge, 400 kHz |
| SPI SCK/MOSI/CS/DC/RST | 12/11/10/13/14 | display |
| BTN_COPY | 4 | RTC-capable wake |
| HAPTIC | 5 | PWM |
| CAM D0–D7, PCLK, VSYNC, HREF, XCLK | per Espressif ESP32-S3-EYE ref | use their reference table |
| CHG_INT / GAUGE_ALRT | 6 / 7 | |
| LED | 15 | |
Camera DVP eats ~12 GPIOs; with N8 (no PSRAM) a JPEG frame at QVGA/VGA fits; use N8R2 if SVGA wanted.

## Power
Cell 3.0–4.2 V. Sleep: ESP32 deep sleep ~10 µA + sensors ~10 µA. Wake every 30 s for poll via light sleep, or use MQTT keepalive (EVT-2). Budget ESTIMATE: avg ≈ 1.2 mA → 80 mAh ≈ 2.7 days; target 5 days needs duty-cycle (poll 60 s) + display only on event. Screen stays off by default (pager behavior), wakes on notification/button.

## AI-grade sensors (what "AI" means here, honestly)
- BME688: Bosch BSEC library classifies gas patterns (needs BME AI-Studio training; closed-source lib, licence terms to check).
- BMI270/BHI260: on-chip gesture/tap; BHI260AP runs Bosch AI-ready firmware.
- ESP32-S3: TinyML (ESP-NN, TFLite-Micro) for tap/room-state; no cloud LLM on device.
- Camera: capture only; vision AI runs server-side via existing AI engine on explicit request.

## PCBWay design rules (ESTIMATE spec for quote)
4 layers, 0.8 mm, 38x38 mm, ENIG, 0.1/0.1 mm trace/space, 0.2 mm via, impedance on RF trace (50 Ω), antenna keep-out zone, castellated test pads, fiducials, panelized 2x4 for SMT. Files: Gerber RS-274X + BOM + CPL + assembly drawing.

## Charger
Qi RX BQ51050B → charge 100 mA CC/CV to 4.2 V. Dock: 5 W Qi TX, magnet ring. USB-C on dock only; plate has none (pads under glass for service).
