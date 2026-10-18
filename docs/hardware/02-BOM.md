# 02 — Components buying list

Prices are **estimates (USD, ~2026) to be replaced by PCBWay/distributor quotes**; links are to manufacturer/vendor pages. "Search MPN" = look up the part number at DigiKey/Mouser/LCSC; I could not verify live stock from the build sandbox.

## A. POC kit (Phase 1, ~US$60 total)
| Item | Part | Link | Est. |
|---|---|---|---|
| MCU + round 1.28" screen + IMU + LiPo charge | Waveshare ESP32-S3-LCD-1.28 | https://waveshare.com/esp32-s3-lcd-1.28.htm | $15–20 |
| Touch variant (alt) | Waveshare ESP32-S3-Touch-LCD-1.28 | https://www.waveshare.com/product/arduino/boards-kits/esp32-s3-touch-lcd-1.28.htm | $20 |
| Weather sensor breakout | BME280 or BME688 (Adafruit/Pimoroni) | search MPN | $10–20 |
| Camera | OV2640 DVP module | search "OV2640 FPC module" | $5–10 |
| Qi RX + TX pad | 5 V Qi receiver coil + pad | search "Qi receiver module 5V" | $10 |
| Button, LiPo 100 mAh | tactile switch, 401020 cell | search | $5 |

## B. Custom device BOM (per unit, EVT target)
| Block | MPN / part | Note | Est./unit @100 |
|---|---|---|---|
| MCU/radio | ESP32-S3-WROOM-1-N8R2 (or -1U + antenna) | datasheet: https://documentation.espressif.com/esp32-s3-wroom-1_wroom-1u_datasheet_en.html | $4 |
| Display | 1.3" 240x240 IPS ST7789 module | thin FPC | $4–6 |
| Camera | OV2640 DVP FPC (thin) | height risk | $4–6 |
| Env sensor | Bosch BME688 (LGA) | gas/IAQ via BSEC | $9 |
| IMU | QMI8658C or BMI270 | motion/orient | $1.5 |
| Wireless RX | TI BQ51013B (or NXP/other Qi RX) + coil + ferrite | | $4 |
| Charger/PMIC | BQ25895 or MCP73831 + protection | | $2 |
| Battery | LiPo, thinnest available, with PCM | UN38.3 required | $3–5 |
| LDO/passives/connectors | | | $3 |
| Button | 2.0x3 mm SMT tact | | $0.3 |
| PCB + SMT assembly (PCBWay turnkey) | 4-layer, ~36x36 mm | quote needed | $8–12 |
| **Electronics subtotal** | | | **~$45–60** |
| Stainless body, 2 parts (316L, CNC + mirror polish) | PCBWay CNC or other | quote needed | $25–60 |
| Gasket, screws, display glass/window | | | $3–5 |
| **Unit total (est.)** | | | **~$75–125** |

## C. Run cost (100 units, est.)
- Units: $7.5k–12.5k; NRE (tooling, fixtures, PCB stencils, test jig): $2–4k; certification (FCC/CE, UN38.3): $8–20k (module pre-cert reduces); chargers 100x $4 = $0.4k.
- **Rough total: $18k–37k**, dominated by certification and steel.

## D. Vendors / next actions
1. PCBWay quote: upload Gerbers + BOM + pick-and-place (turnkey, 100 pcs) — they review by hand, ~1–2 business days.
2. Steel: send STEP/drawings to PCBWay CNC and one alt shop; ask for 316L, Ra ≤0.05 µm mirror on back.
3. Qi coil: ask coil vendor for ≤25 mm, ≤0.5 mm flex coil with ferrite.
