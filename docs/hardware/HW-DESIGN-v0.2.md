# LOT Computer — Hardware Design v0.2 (pin map, stack-up, power, test)
Draft. Derived from datasheet knowledge, **not yet verified against current datasheets** — check each pin against the ESP32-S3-MINI-1 datasheet before layout.

## 1. MCU & pin plan (ESP32-S3-MINI-1-N8R2, quad PSRAM)
Rules: GPIO26–32 are flash/PSRAM (never use); GPIO0/3/45/46 are strapping pins (keep button/boot only); GPIO19/20 = native USB D-/D+ (route to pogo pads for flashing).
| Block | Signals | Proposed GPIO | Note |
|---|---|---|---|
| Camera DVP (OV2640) | D0–D7, XCLK, PCLK, VSYNC, HREF | 4,5,6,7,15,16,17,18 / 8,9,10,11 | 12 pins; SCCB shares I2C bus |
| I2C (sensors+camera SCCB+fuel gauge+haptic) | SDA, SCL | 1, 2 | 400 kHz; 3.3 V; check address clashes (DRV2605L 0x5A, BME688 0x76, LTR-390 0x53, BMI270 0x68, MAX17048 0x36, OV2640 0x30) — no clash |
| Display (ST7789 SPI) | SCK, MOSI, CS, DC, RST, BL(PWM) | 12, 13, 14, 21, 38, 39 | |
| Button "Copy" | SW1 -> GPIO, RTC-capable wake | 3 is strapping → use **GPIO 40** w/ ext. pull-up | RTC wake not needed if IMU wakes |
| IMU INT / fuel-gauge ALRT / charger STAT | interrupts | 41, 42, 47 | |
| Haptic EN / piezo | DRV2605 EN, buzzer PWM | 48, 35 | |
| USB (flash/log) | D-, D+ | 19, 20 | pogo pads only |
Total ≈ 33 GPIO used of ~36 available → **no spare**. If a pin is needed later, drop the piezo (haptic is enough) or use a bare ESP32-S3 with more pins.

## 2. Power
- Rails: LiPo 3.7 V → buck/LDO 3.3 V (TPS62840-class buck, ~60 nA Iq) for MCU + sensors. Camera 2.8 V/1.5 V from its module regulator; **camera power-gated by load switch** (default off).
- Charge path: Qi coil → BQ51003 → BQ25185 → battery. USB via pogo pads also feeds BQ25185.
- Average-current target < 1.5 mA (light sleep + 30 s poll). Honest note: Wi-Fi poll every 30 s on ESP32 costs more than that in practice (~3–6 mA avg). **Realistic battery life 1–2 days on 200 mAh with 30 s polling; 5+ days needs 5–15 min polling or SSE push with DTIM sleep.** Make poll interval server-configurable (`/api/device/config`) and measure on the EVT unit.

## 3. Mechanical stack-up (mm, indicative)
| Layer | t |
|---|---|
| Cover glass | 0.5 |
| OCA / air gap | 0.1 |
| Display module (1.3" IPS, FPC folded) | 1.8 |
| Main PCB (0.8) + tallest part (BME688 gas 0.9) on rear | 0.8 + 0.9 |
| LiPo 402530-class | 2.8 |
| Ferrite + Qi coil | 0.8 |
| Bottom steel skin | 0.8 |
| **Sum** | **~8.5** |
Camera (OV2640 module ~4.5 incl. lens) sits beside the display inside the 40 mm footprint, so it adds no height beyond the display stack but needs ~10×10 mm of PCB area. 5 mm (req 4) is **not** reachable in v1; flat-face footprint 40×40 is. Decision still pending from Vadik: **ship v1 at ~9 mm.**
Body: 316L, 2 parts (front bezel w/ glass pocket + back plate), 4× hidden M1.0 or laser weld. Back plate = polished mirror; RF/Qi window → see below.

## 4. RF / Qi through steel — test plan before any tooling
1. Dev-kit test: ESP32-S3 + Qi RX coil inside a $30 CNC'd 316L clamshell from PCBWay. Measure RSSI delta and Qi coupling.
2. Variants: (a) glass/PEEK window on the **front** (coil + antenna under cover glass side, dock charges screen-down); (b) ceramic ring in the edge; (c) 2 mm slot in steel edge.
3. Pass: RSSI loss ≤ 10 dB vs open air at 3 m; Qi ≥ 3 W at 4 mm gap.
Camera/display face already glass → option (a) is the lead candidate and keeps the mirror side fully metal (req 17).

## 5. Test jig & 100-unit flow
Pogo-pin jig (6 pins: 3V3, GND, D+, D-, BOOT, EN): flash → self-test (I2C scan, BME688 read, camera frame hash, display pattern, button, haptic, charge current) → write serial + QR → POST to site `pair` pre-registration. Target yield ≥ 85%.

## 6. Open questions for Vadik
1. v1 thickness ~9 mm OK? 2. Screen-down Qi dock OK? 3. Camera: keep in v1 (adds ~$3 + privacy shutter + power) or de-scope to v1.1? 4. Single "Copy" button only, or add a second for dismiss? 5. Engraving/brand marks — need brand.lot-systems.com content (unreachable from sandbox).
