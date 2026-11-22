# LOT·01 — PCB & PCBWay Order Spec

## Board
| Parameter | Value |
|---|---|
| Layers | 4 (SIG / GND / PWR+SIG / SIG) |
| Thickness | **0.4 mm** FR-4 (high-Tg) |
| Outline | ~36 × 36 mm, R2.5 corners, camera cut-out ~7 × 7 mm |
| Min track/space | 0.1 / 0.1 mm (4/4 mil) |
| Vias | 0.2 mm drill / 0.4 pad; via-in-pad, filled + capped under the QFN thermal pad |
| Finish | ENIG |
| Impedance | 50 Ω coplanar waveguide for the antenna feed (ask PCBWay for the stack-up and coupon) |
| Panel | 4-up with rails + fiducials, V-score not allowed (0.4 mm) → tab-route |
| Components | **Back side only** (front side holds the coil and the display) |

## PCBWay quote checklist
1. **PCB:** upload Gerbers + stack-up + drill; choose "impedance control", "via-in-pad filled".
2. **Turnkey PCBA:** BOM (MPN column), CPL (pick-and-place), assembly drawing; enable **X-ray** (QFN, DSBGA) and **AOI**.
3. **Consigned parts:** LS013B7DH03, camera module, battery, coil (often not stocked) — ship to PCBWay or fit at final assembly.
4. **Firmware:** supply `factory.bin` so PCBWay can flash during functional test (optional service).
5. **CNC:** Part A, Part B, key, as STEP + 2D PDF with finish callouts; request mirror-polish confirmation in writing.
6. **Final assembly / box build:** optional at PCBWay ("OEM" service) for PVT, or assemble in-house for 100 units.

Quantities: EVT 15 · DVT 30 · PVT 110.

## Schematic blocks
1. Power: Qi coil → BQ51050B → LiPo (NTC, PCM) → TPS62840 3.3 V → loads; MAX17048 on I²C.
2. MCU: ESP32-S3FH4R2, 40 MHz crystal, RF π-match → chip antenna, USB D+/D− on test pads (factory flashing), EN/BOOT on pads.
3. Display: LS013B7DH03 on SPI (SCK, SI, SCS) + EXTCOMIN (1 Hz from the RTC/LEDC) + DISP.
4. Camera: DVP 8-bit + XCLK + SCCB, behind TPS22916.
5. Sensors: BME688 + LSM6DSOX on I²C (shared), IMU INT1 → RTC GPIO (wake).
6. Haptic: DRV2603 + LRA.
7. Key: metal dome → RTC GPIO (wake), with ESD diode.

## Pin plan (draft)
| Signal | GPIO | Note |
|---|---|---|
| KEY_COPY | GPIO1 (RTC) | not GPIO0, which is a strap pin |
| IMU_INT1 | GPIO2 (RTC) | ext1 wake |
| I2C SDA/SCL | GPIO8 / GPIO9 | BME688, LSM6DSOX, MAX17048 |
| LCD SCK/SI/SCS | GPIO12 / GPIO11 / GPIO10 | SPI2 |
| LCD EXTCOMIN | GPIO13 | LEDC 1 Hz |
| HAPTIC_EN | GPIO14 | DRV2603 EN |
| CAM_PWR_EN | GPIO21 | load switch |
| CAM D0–D7, PCLK, VSYNC, HREF, XCLK | GPIO38–48, 15–18 | finalise against the FH4R2 reserved pins (7 GPIO used by in-package memory) |
| CHG_STAT | GPIO4 | BQ51050B CHG |
