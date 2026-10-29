# BOM & Buying List — LOT Computer EVT (v0.1)

> **Prices are planning estimates (USD), not quotes.** Sandbox could not reach vendor sites to verify stock or price; every link is a manufacturer/vendor landing page — re-check before ordering. "Unit @100" assumes volume pricing.

## A. Electronics (per unit)
| # | Part | Choice | Why | Unit @100 | Link |
|---|---|---|---|---|---|
| 1 | MCU / Wi-Fi / BLE | ESP32-S3-WROOM-1-N16R8 (16 MB flash, 8 MB PSRAM) | Camera (DVP) + display + TLS | $5.5 | https://www.espressif.com/en/products/socs/esp32-s3 |
| 2 | Display | 1.54" 240×240 IPS, ST7789, SPI, FPC | Fits 40 mm; simple text pager | $4.0 | search "1.54 inch ST7789 240x240 FPC" (Alibaba / LCSC) |
| 3 | Camera | OV2640 (2 MP) FPC module, ≤3 mm height; upgrade OV5640 | Cheap, ESP32 driver mature | $3.0 | https://www.ovt.com (OmniVision) / LCSC |
| 4 | Env sensor | Bosch BME688 (T/RH/P + AI gas) | AI-grade weather/air; BSEC + AI Studio | $9.0 | https://www.bosch-sensortec.com/products/environmental-sensors/gas-sensors/bme688/ |
| 5 | Motion/AI | Bosch BMI270 | On-sensor gesture/step; wake-on-tap | $2.0 | https://www.bosch-sensortec.com/products/motion-sensors/imus/bmi270/ |
| 6 | Light | LTR-559 or VEML7700 | Auto screen brightness | $0.9 | https://www.vishay.com/en/product/84286/ |
| 7 | Qi receiver | TI BQ51013B | 5 V, up to 5 W, small | $2.2 | https://www.ti.com/product/BQ51013B |
| 8 | Charger / PMIC | TI BQ25120A (ship mode, 1.8 V LDO) | Low Iq for sleep | $1.8 | https://www.ti.com/product/BQ25120A |
| 9 | Battery | LiPo 3.7 V ~200–300 mAh, 2.0–3.0 mm, w/ protection (UL 1642 / UN38.3 docs) | Height is the constraint | $3.5 | vendor RFQ (Grepow / Dnk) |
| 10 | Qi coil + ferrite | Ø20–24 mm flexible, ≤0.5 mm total | Behind zirconia disc | $1.5 | RFQ (Wurth 760308 family) |
| 11 | Button | 3×3 mm low-profile tact, 0.35 mm travel (or capacitive-over-steel) | One "Copy" button | $0.3 | LCSC |
| 12 | Haptic/buzzer (opt.) | 6 mm LRA or piezo | "Pager" feel | $0.8 | LCSC |
| 13 | Misc passives, ESD (USBLC6), USB-C 16-pin (programming/ fallback charge), LDO, connectors | — | — | $3.0 | DigiKey / LCSC |
| 14 | PCB + assembly | 4-layer 0.8 mm ENIG, 36×36 mm; SMT both sides | PCBWay | $9 PCB+SMT @100 (excl. parts) | https://www.pcbway.com |

## B. Mechanical
| # | Part | Spec | Unit @100 | Source |
|---|---|---|---|---|
| 15 | Shell A (back) | 316L, CNC, mirror polish, 40×40, rounded 3 mm radius, Ø22 mm zirconia/glass inset | $22 | PCBWay CNC / Xometry / Protolabs RFQ |
| 16 | Shell B (front) | 316L, CNC, window recess + camera port + button hole, sapphire/AR glass 0.5 mm | $24 | same |
| 17 | Window glass / sapphire | 0.5 mm, AR, printed | $5 | RFQ |
| 18 | Gasket, M1.2 screws (4×) or laser weld | IP54 target | $1.5 | — |
| 19 | Charger dock | Qi 5 W puck, steel-safe alignment magnets | $6 | custom (PCBWay) or off-shelf Qi puck for EVT |
| 20 | Packaging + printed manual card + QR | — | $3 | — |

## C. Cost roll-up (estimate)
| Item | Per unit | ×100 |
|---|---|---|
| Electronics (A1–A13) | ~$38 | $3,800 |
| PCB + SMT (A14) | ~$9 | $900 |
| Mechanical + dock + pack (B) | ~$62 | $6,200 |
| Subtotal | **~$109** | **~$10,900** |
| Yield loss 8% + spares 10 + NRE (fixtures, tooling, certification pre-scan) | — | **+$6–9k** |
| **Planning budget, 100 units** | **~$170–200/unit** | **~$17–20k** |

Not included: FCC Part 15B/15C (intentional radiator — modular ESP32 cert helps), Qi/WPC licence (use a certified receiver reference), UN38.3 battery test, CE if exporting.

## D. Pilot purchase (EVT, buy now)
- 5× ESP32-S3-DevKitC-1 N16R8, 5× 1.54" ST7789, 5× OV2640 module, 5× BME688 breakout, 5× BMI270 breakout, 2× Qi RX + coil eval (TI BQ51013B EVM), 10× LiPo 250 mAh, 1 stainless 316L 40×40×8 mm sample block for Qi/RF attenuation test. ≈ **$350–450**.
