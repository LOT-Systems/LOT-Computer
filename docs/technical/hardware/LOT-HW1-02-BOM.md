# LOT-HW1 — Components Buying List (Document 02 of 06)

**Evidence labels:** VERIFIED = part/spec confirmed from a cited page in the 2026-10-04 research pass. ESTIMATE = judgement or price not quoted. Links marked *unverified* could not be opened from the sandbox (vendor sites blocked); open and confirm before ordering.
**Machine-readable copy:** `LOT-HW1-BOM.csv` (same rows; import to PCBWay quote form after MPN confirmation).

Prices are rough USD per unit at ~100-unit volume, **ESTIMATE ±40%, not quotes**. PCBWay assembly is manually quoted (1–2 business days per research), so get a real quote in phase P2.

## 1. Electronic parts (per unit)

| Ref | Function | Part (first choice) | Alt | Key spec | Est. $ | Source / link |
|---|---|---|---|---|---|---|
| U1 | MCU + Wi-Fi/BLE | **ESP32-S3-MINI-1-N8** (Gen-1, module) | ESP32-S3 chip-down (Gen-2, thinner) | 15.4×20.5×2.4 mm, 8 MB flash, PCB antenna, VERIFIED | 3–4 | [Espressif datasheet](https://www.espressif.com/documentation/esp32-s3-mini-1_mini-1u_datasheet_en.pdf) (VERIFIED); atomic14 [module notes](https://www.atomic14.com/esp32/modules/esp32-s3-mini-1/) |
| DS1 | Screen | **1.3" 240×240 IPS, SPI, ST7789-class** | AMOLED round/square; e-paper | Module outlines seen 26.2×29.2×1.5 mm (VERIFIED, one vendor) — pick a part ≤ 1.5 mm | 5–8 | [Display Module 1.3" IPS](https://displaymodule.com/products/1-3-inch-ips-display-240x240-with-spi); [Adafruit 4520](https://www.adafruit.com/product/4520) (reference part for prototyping) |
| CAM1 | Camera | **OV2640 2 MP DVP** (JPEG on-chip) | GC2145 2 MP DVP | 24-pin FPC; thickness 3–5 mm ESTIMATE → **thickness risk** | 3–6 | [Arducam OV2640 mini](https://www.arducam.com/product/arducam-ov2640-camera-module-2mp-mini-ccm-compact-camera-modules-compatible-with-arduino_m0031esp32-esp8266-development-board-with-dvp-24-pin-interface_/) (prototype); GC2145 [RobotShop pack](https://ca.robotshop.com/products/camemake-10-pack-gc2145-dvp-camera-module-2mp-ov2640-replacement) |
| U2 | Weather + AI gas | **Bosch BME688** | BME280 (no gas) | 3.0×3.0×0.9 mm, VERIFIED | 8–10 | [Bosch](https://bosch-sensortec.com/products/environmental-sensors/gas-sensors/bme688/); [datasheet](https://cdn.sparkfun.com/assets/0/a/b/6/7/BME688_Datasheet.pdf) |
| U3 | IMU / gestures | **Bosch BMI270** | BMA400 | LGA-14 2.5×3.0×0.83 mm, VERIFIED | 2–3 | [Bosch BMI270](https://www.bosch-sensortec.com/products/motion-sensors/imus/bmi270.html); [LCSC C2836813](https://lcsc.com/product-detail/Accelerometers_Bosch-BMI270_C2836813.html) |
| U4 | Ambient light | VEML7700 or equivalent | — | tiny I²C ALS; part TBD in P1 | 1 | *unverified* — pick in P1 |
| U5 | Qi receiver | **TI BQ51013B** (5 W class) | cheaper Qi RX IC in P2 | Qi v1.x, ≤5 W; used by Adafruit AF-1901 module (VERIFIED via search) | 2–3 | [TI BQ51013B](https://www.ti.com/product/BQ51013B) *unverified*; [Adafruit datasheet](https://cdn-shop.adafruit.com/product-files/1901/P1901+C2400-001+datasheet.pdf) |
| L1 | Qi RX coil + ferrite | 20–25 mm flex coil with ferrite sheet, ≤0.5 mm | module-integrated coil | thin type; must be bench-tested through chosen stack | 2–4 | vendor TBD (Würth/TDK/generic) — *unverified* |
| U6 | Battery charger | **TI BQ25185** (1 A linear, power-path) | **BQ25101** (250 mA, 1.4×1.0×0.5 mm, VERIFIED) | BQ25101 is smaller and enough for ~100 mAh cell | 1–2 | [BQ25185](https://ti.com/product/BQ25185); [BQ25101 datasheet](https://www.radiolocman.com/datasheet/data.html?di=178223) |
| U7 | Regulator 3.3 V | low-Iq buck/LDO (e.g., TPS62740-class) | — | Iq < 1 µA ideal for sleep | 1 | *unverified* — pick in P1 |
| BT1 | Battery | **Ultra-thin LiPo 3.7 V, 50–120 mAh, protected** | 402030 (200 mAh, **4 mm** thick — too thick for Track A) | thinner = less capacity (VERIFIED: 402030 is 4 mm; a 55 mAh ≤2.5 mm pack exists) | 3–5 | [CM Batteries 55 mAh ≤2.5 mm](https://cmbatteries.com/project/3-7v-55mah-lipo-battery-pack/); [Besomi 402030](https://besomi.com/product/402030-besomi-200mah-3-7v-lithium-battery); custom thin cell likely needed |
| SW1 | "Copy" button | low-profile tact switch, ≤1.2 mm, side or bezel | — | IP-sealed preferred | 0.3 | TBD |
| BZ1 | Pager alert | piezo SMD buzzer ≤1 mm **or** tiny LRA haptic | — | haptic = "pager-like" feel; thickness check | 1–2 | TBD |
| X | Passives, ESD, connectors, antenna keep-out | — | — | — | 2–3 | PCBWay turnkey/sourced |
| PCB | 4-layer, 0.6–0.8 mm FR-4 (rigid-flex only if camera/display need it) | — | — | ENIG, 40×40 mm outline | 3–5 | [PCBWay](https://www.pcbway.com/pcb-assembly.html) *unverified* |

## 2. Mechanical parts (per unit)

| Item | Spec | Est. $ | Notes |
|---|---|---|---|
| Stainless back plate | 316L, 40×40 mm, 0.6–0.8 mm, mirror polish | 8–20 | Polish is the cost driver; quote with finish spec "mirror, Ra target TBD" |
| Stainless frame/bezel | 316L, 40×40 mm, machined window, camera aperture, button hole, vent | 15–40 | CNC; PCBWay machining mentions 316L work ([example](https://www.pcbway.com/project/share/CNC_Machining_2ede75bd.html)) — get quote |
| Cover glass | 0.4–0.5 mm chemically-strengthened, AR coat optional | 2–4 | |
| Camera lens window | AR glass or integrated | 1 | |
| Gasket / adhesive / micro-screws | PSA, silicone gasket | 1–2 | |
| Vent membrane | hydrophobic membrane over 0.8 mm hole | 0.5–1 | for BME688 airflow |

## 3. Cost roll-up for the 100-unit run (ESTIMATE ±40%)

| Block | Per unit | ×100 |
|---|---|---|
| Electronic parts + PCB | 35–55 | 3.5–5.5 k |
| Assembly (PCBWay) | 6–15 | 0.6–1.5 k |
| Steel + glass + mech | 30–70 | 3–7 k |
| **Per-unit subtotal** | **~70–140** | **~7–14 k** |
| One-time: stencil, fixtures, test jig, EVT/DVT rounds | — | 3–8 k |
| One-time: radio compliance (FCC/CE) + UN38.3 | — | 5–15 k (less if module-based; confirm with lab) |
| Charger pad (wireless), per unit, any Qi 5 W pad | 8–15 | 0.8–1.5 k |

Steel is expected to be the single largest line. A real quote from PCBWay (PCB + assembly + CNC) is a **P2 gate item**.

## 4. Prototype shopping list for phase P1 (no custom PCB yet)

Order these first (roughly $150–250, ESTIMATE):
1. ESP32-S3 dev board with PSRAM and DVP camera header (any S3-CAM-style board).
2. 1.3" 240×240 IPS (Adafruit 4520 as known-good reference).
3. BME688 breakout + BMI270 breakout.
4. Qi RX module (Adafruit AF-1901 style, BQ51013B) + 5 W Qi pad.
5. 316L steel sample squares: 40×40 mm at 0.3 / 0.6 / 0.8 mm (for Qi + RF tests) — local metal shop or PCBWay CNC.
6. 3 candidate thin LiPo cells (see BT1 row).
7. One 3D-printed (resin) 40×40×7 mm shell to check fit.

---
AUTHORIZED BY: S-2 // VADIK MARMELADOV
