# LOT® PAGER — Components Buying List (BOM v0.1)

**Prices and availability are estimates from memory, not live quotes** (the
session had no access to vendor sites). Verify on the linked search pages
before ordering. Qty is per unit; 100-unit price is a rough planning number.

Link convention: part-number search links, which stay valid when product IDs change.

## Compute & radio
| Part | Pick | Why | Est. unit @100 | Link |
|---|---|---|---|---|
| MCU+Wi‑Fi/BLE | Espressif ESP32‑S3‑MINI‑1U‑N8 (15.4×20.5×2.4 mm) | DVP camera, 8 MB flash, USB, BLE. **-1U = u.FL**; steel body blocks PCB antenna, so use -1U with an external antenna (see 03 §6) | $3.5 | https://www.digikey.com/en/products/result?keywords=ESP32-S3-MINI-1U |
| Dev kit (P0) | ESP32‑S3‑EYE or Freenove ESP32‑S3 CAM | Fast prototype | $25–45 | https://www.espressif.com/en/products/devkits |

## Display
| Part | Pick | Est. | Link |
|---|---|---|---|
| Colour (default) | 1.3" 240×240 IPS, ST7789 SPI (e.g. Waveshare / generic 1.3" module) | $3–6 | https://www.waveshare.com/product/displays/lcd-oled.htm |
| Alt (pager feel) | 1.54" 200×200 e‑paper, GDEH0154D67 | $5–8 | https://www.good-display.com/product/236.html |

## Camera
| Part | Pick | Est. | Link |
|---|---|---|---|
| Sensor | OV2640 (2 MP) small DVP module (check exact height; most are 5–6 mm), or OV5640 for quality | $4–9 | https://www.digikey.com/en/products/result?keywords=OV2640 |
Note: lens must align with a ≥3 mm glass/sapphire window in the steel. Window = custom part.

## Sensors (weather + "AI-grade" off-the-shelf)
| Role | Part | Interface | Est. | Link |
|---|---|---|---|---|
| Weather: T/RH/P/gas (VOC index) | Bosch BME688 (3×3 mm) | I²C | $7 | https://www.digikey.com/en/products/result?keywords=BME688 |
| Motion / pickup / tap | Bosch BMI270 (2.5×3 mm, on-chip gesture) | I²C/SPI | $3 | https://www.digikey.com/en/products/result?keywords=BMI270 |
| Ambient light (auto‑dim) | Vishay VEML7700 | I²C | $1.5 | https://www.digikey.com/en/products/result?keywords=VEML7700 |
| Optional UV/air | Sensirion SGP41 / SCD41 (CO₂, larger) | I²C | $7 / $25 | https://sensirion.com/products |
| Mic (optional v1) | TDK ICS‑43434 | I²S | $1.2 | https://www.digikey.com/en/products/result?keywords=ICS-43434 |

"AI-grade": the BME688 has Bosch BSEC on-device gas classification, BMI270 has
on-chip gesture recognition; both reduce what the MCU must stream. Training data
for calibration is collected via Bosch's BME AI-Studio.

## Power & charging
| Role | Part | Est. | Link |
|---|---|---|---|
| Qi receiver IC | TI BQ51013B (5 V, WCSP) | $2.5 | https://www.ti.com/product/BQ51013B |
| Li‑Po charger | TI BQ25185 (or BQ25101) | $1.2 | https://www.ti.com/product/BQ25185 |
| Fuel gauge | Maxim MAX17048 | $1.5 | https://www.analog.com/en/products/max17048.html |
| 3.3 V buck | TI TPS62840 / TLV62569 | $0.9 | https://www.ti.com/product/TPS62840 |
| Rx coil | 5 W Qi RX coil, ≤ Ø30 mm, flex with ferrite (Würth 760308101303 class) | $3–5 | https://www.we-online.com/en/components/products/WCCT |
| Battery | 3.7 V Li‑Po 150–300 mAh, ≤ 3.5 mm thick (e.g. 303040-class) w/ protection + UN38.3 report | $3–5 | search "301830 / 303040 LiPo" on https://www.pcbway.com or Adafruit/Seeed |
| **Charging pad (not in device)** | Any 5 W Qi pad for dev; branded LOT® pad for the run (injection/CNC puck) | $4–8 | https://www.digikey.com/en/products/result?keywords=Qi+transmitter+module |

Safety: steel between coil and pad kills Qi. Charge must go through a non-metal
window or a coil mounted against a thin (≤0.3 mm) non-magnetic 316L face —
see 03 §5. This is the single biggest charging risk.

## Input / feedback
| Part | Pick | Est. | Link |
|---|---|---|---|
| Button | Alps SKRRAAE010 side/top tact, or metal dome on PCB | $0.4 | https://www.digikey.com/en/products/result?keywords=SKRRAAE010 |
| Buzzer/haptic | Piezo buzzer 7 mm or LRA 8×3 mm | $0.6–1.5 | https://www.digikey.com/en/products/result?keywords=LRA+8mm |
| Status LED | RGB 0402 | $0.2 | — |

## Passive / PCB / misc
Passives, ESD (TPD4E05U06), load switch, antenna u.FL + 2.4 GHz FPC antenna (e.g. Molex 146153), gasket, M1.2 screws or laser weld: ~$4.

## Per-unit estimate (100 units)
| Group | $ |
|---|---|
| Compute/radio, display, camera | 12–22 |
| Sensors | 12–15 |
| Power/charging incl. battery | 12–16 |
| Input/feedback, passives, misc | 6–8 |
| **Electronics BOM** | **~42–61** |
| PCB + SMT assembly (PCBWay, 100 pcs) | 10–18 |
| Stainless body (2 CNC parts + polish + window) | 28–60 |
| Test, pack, pad | 8–12 |
| **Landed cost / unit** | **~$90–150** |

100 units ⇒ roughly **$9k–15k** plus NRE ($1.5–4k for fixtures, 2 PCB spins,
EMC pre-scan). Order buffer +10 %.
