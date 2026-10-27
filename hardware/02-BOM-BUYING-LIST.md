# 02 · Components Buying List (BOM)

> **Prices are engineering estimates (USD, 2026, qty 1 → qty 100), NOT live quotes.** The sandbox had no vendor access. All links are vendor **search/landing URLs** (stable patterns) — open them, pick an in-stock SKU, confirm datasheet. Re-verify in HW-02.

Tier **A = buy now for EVT/dev-kit**, **B = buy at DVT**, **C = 100-unit run**.

## 1. Compute & radio
| Part | Pick | Why | Qty/unit | Est. $ | Link | Tier |
|---|---|---|---|---|---|---|
| MCU (dev) | ESP32-S3-WROOM-1-N16R8 module | Wi-Fi/BLE, DVP camera, PSRAM, vector AI, pre-certified RF | 1 | 4.5 | https://www.digikey.com/en/products/result?keywords=ESP32-S3-WROOM-1-N16R8 | A |
| MCU (thin, DVT) | ESP32-S3 bare QFN56 + 16 MB flash + 8 MB PSRAM + chip antenna | Saves ~2.3 mm vs module; needs own RF cert | 1 | 5 | https://www.lcsc.com/search?q=ESP32-S3R8 | B |
| Dev board | Espressif ESP32-S3-DevKitC-1 | Day-one firmware work | 1–3 (once) | 15 | https://www.digikey.com/en/products/result?keywords=ESP32-S3-DevKitC-1 | A |

## 2. Display, camera, input
| Part | Pick | Notes | Qty | Est. $ | Link | Tier |
|---|---|---|---|---|---|---|
| Screen (EVT) | 1.54" 240×240 IPS, ST7789, SPI (≈31 mm active) | Fits 40 mm face; simple, color | 1 | 3.5 | https://www.lcsc.com/search?q=1.54%22+ST7789+240x240 | A |
| Screen (alt, low-power) | 1.54" e-paper 200×200 | Best battery; slow refresh (alert flash via LED) | 1 | 6 | https://www.digikey.com/en/products/result?keywords=1.54+e-paper | B |
| Camera | OV2640 2 MP DVP, 24-pin FPC | ESP32-S3 supported, small | 1 | 3 | https://www.lcsc.com/search?q=OV2640 | A |
| Camera (alt) | OV5640 5 MP (AF) | Better image, taller | 1 | 7 | https://www.lcsc.com/search?q=OV5640 | B |
| Button | Low-profile tact 0.6 mm travel, ≤1.2 mm tall (e.g. Alps SKRP/ C&K PTS) or capacitive-metal dome | Becomes "Copy" | 1 | 0.4 | https://www.digikey.com/en/products/result?keywords=ultra+thin+tactile+switch | A |
| Indicator LED | Camera-active LED 0402 red + RGB 0404 status | Privacy + alerts | 2 | 0.2 | https://www.lcsc.com/search?q=0402+LED | A |
| Haptic (optional pager buzz) | LRA 6 mm flat or piezo buzzer | "Pager" feel | 1 | 1.2 | https://www.digikey.com/en/products/result?keywords=flat+vibration+motor+LRA | B |

## 3. Sensors ("AI-grade, off-the-shelf")
| Part | Pick | Measures / AI feature | Est. $ | Link | Tier |
|---|---|---|---|---|---|
| Weather + air | **Bosch BME688** (T/RH/P + gas, BSEC AI classification) | Weather + air-quality classes | 7 | https://www.digikey.com/en/products/result?keywords=BME688 | A |
| Precision T/RH | Sensirion SHT45 | ±0.1 °C reference, far from heat sources | 2.5 | https://www.digikey.com/en/products/result?keywords=SHT45 | B |
| Ambient light | Vishay VEML7700 | Auto screen brightness | 1.2 | https://www.digikey.com/en/products/result?keywords=VEML7700 | A |
| Motion | **Bosch BMI270** (on-chip gesture/step AI) or ST LSM6DSOX (ML core) | Tap/wake/orientation | 2 | https://www.digikey.com/en/products/result?keywords=BMI270 | A |
| UV (optional) | LTR-390UV-01 | Weather "UV index" | 1.5 | https://www.digikey.com/en/products/result?keywords=LTR-390UV | C |
| On-device AI | TensorFlow Lite Micro / ESP-DL on ESP32-S3 (software) | Person/motion detect on camera | 0 | https://github.com/espressif/esp-dl | A |

Thermal note: ESP32-S3 + charging heat biases the T/RH sensor — place sensors at board edge on a thermal slot, firmware offset calibration.

## 4. Power & wireless charging
| Part | Pick | Notes | Est. $ | Link | Tier |
|---|---|---|---|---|---|
| Battery | LiPo **3.0 mm** thick (e.g. 303040 ≈ 3×30×40 mm, ~280 mAh; or 302530 ~180 mAh), PCM + UN38.3 doc | Thickness-limited | 3.5 | https://www.lcsc.com/search?q=303040+lipo | A |
| Qi receiver IC | TI **BQ51013B** (5 V out) or Cypress/Infineon/CPS equivalent | Qi 1.2 BPP | 2.2 | https://www.digikey.com/en/products/result?keywords=BQ51013B | A |
| Qi RX coil | Ultra-thin ≈ 0.5–0.8 mm, ≤ 30 mm dia, Ni-Zn ferrite shield, ~ 10 µH (e.g. Würth 760308xxxx series or Chinese FPC coil) | Needs window (R2) | 3 | https://www.digikey.com/en/products/result?keywords=wireless+charging+receiver+coil | A |
| Li-ion charger | TI **BQ25185** (≤1 A, power-path, tiny) | USB-C + Qi 5 V in | 1 | https://www.digikey.com/en/products/result?keywords=BQ25185 | A |
| Fuel gauge | Analog/Maxim **MAX17048** | % battery on screen/site | 1.5 | https://www.digikey.com/en/products/result?keywords=MAX17048 | A |
| 3.3 V buck | TPS62840 (60 nA Iq) | Battery life | 1 | https://www.digikey.com/en/products/result?keywords=TPS62840 | A |
| USB-C (service/charge) | Midmount low-profile 2-pin power-only, or **pogo pads** on seam | USB-C is 3.2 mm → pogo pads preferred | 0.5 | https://www.digikey.com/en/products/result?keywords=pogo+pin+pads | B |
| Charging pad (for desk) | Any Qi 5 W pad for EVT; custom LOT pad at DVT | | 12 | https://www.digikey.com/en/products/result?keywords=qi+wireless+charging+transmitter+module | A |

## 5. PCB, mechanics (all PCBWay)
| Item | Spec | Est. | Link | Tier |
|---|---|---|---|---|
| PCB EVT | 4-layer, 0.8 mm, ENIG, 38×38 mm, 5–10 pcs; (option: rigid-flex for camera/screen) | $60–150 / batch | https://www.pcbway.com/orderonline.aspx | A |
| SMT assembly | PCBWay turnkey, fine pitch, incl. stencil | $150–350 EVT | https://www.pcbway.com/pcb-assembly.html | A |
| Steel body (2 parts) | **316L** CNC, back: 0.6–1.0 mm plate mirror-polished (#8); front: bezel with screen/camera/button openings | $20–35/part @100 | https://www.pcbway.com/cnc-machining-quote.html | B |
| Dielectric windows | Alumina/zirconia ceramic or sapphire disc (Qi), PEEK/PC ring (RF seam) | $2–6 | https://www.pcbway.com/cnc-machining-quote.html | B |
| Cover glass | 0.5 mm chemically-strengthened glass over screen, AR | $1.5 | https://www.lcsc.com/search?q=cover+glass | B |
| Camera lens window | Sapphire/glass 4 mm | $0.8 | (as above) | B |
| EVT shells (before steel) | 3D print / CNC aluminium | $40–100 | https://www.pcbway.com/rapid-prototyping/ | A |

## 6. Unit-cost roll-up (estimates, qty 100)
| Group | $/unit (low–high) |
|---|---|
| Compute & radio | 5–9 |
| Display + camera + button + LEDs | 8–15 |
| Sensors | 10–16 |
| Power & Qi | 12–18 |
| PCB + SMT (100 run) | 9–16 |
| Steel ×2 + windows + glass | 45–85 |
| Packaging, test fixture amortization, assembly labor | 8–15 |
| **Total** | **≈ 97–175** |

**100-unit run ≈ $10 k–17.5 k** + NRE (stencil, test jig, CNC programming ≈ $1–2.5 k) + certification ($6–15 k; module-based design is cheaper).

## 7. Procurement order of operations
1. **This week (Tier A, ≈ $150–250):** 2× DevKitC-1, 2× 1.54" TFT, 2× OV2640, BME688 breakout, BMI270 breakout, VEML7700 breakout, Qi pad + RX kit, 2× 303040 LiPo, buttons. → proves firmware & site loop.
2. **After P3 Qi/RF test:** release Tier B (CNC steel prototypes + windows).
3. **After DVT sign-off:** Tier C and PCBWay 100-unit order.
