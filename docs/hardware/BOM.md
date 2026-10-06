# LOT® Pager — Components Buying List (v0.1)

Link legend: ✔ = opened/returned by search this session; ○ = standard vendor/part page, **not verified** — confirm part number and stock before buying. Prices are **rough estimates at 100 units, not quotes**.

## A. Prototype kit (buy first, ~US$150)
| Item | Part | Link | Qty |
|---|---|---|---|
| MCU + round LCD dev board | Waveshare ESP32-S3-LCD-1.28 (GC9A01, 16 MB flash, 2 MB PSRAM) | ✔ https://waveshare.com/ESP32-S3-LCD-1.28.htm | 2 |
| Touch variant w/ IMU + LiPo charger | Waveshare ESP32-S3-Touch-LCD-1.28 | ✔ https://www.waveshare.com/product/esp32-s3-touch-lcd-1.28.htm | 2 |
| Camera | OV2640 DVP module (24-pin FPC) | ○ https://www.adafruit.com/ (search OV2640) | 3 |
| Env sensor breakout | BME688 (AI gas) | ○ https://www.adafruit.com/ (search BME688) | 2 |
| Qi receiver | Adafruit Universal Qi Receiver (BQ51013B) 5 V 500 mA | ✔ https://www.adafruit.com/product/1901 | 2 |
| Qi transmitter pad | any 5 W Qi pad | ○ | 2 |
| Thin LiPo | 3.7 V 100–150 mAh, ≤3 mm | ○ | 4 |
| Tactile switch | low-profile SMT, ≤2 mm | ○ | 10 |

## B. Production BOM per unit (~100 qty)
| Block | Part | Est. $ | Link |
|---|---|---|---|
| MCU | ESP32-S3-WROOM-1-N16R8 (pre-certified, octal PSRAM for camera) | 6 | ○ https://www.espressif.com/en/products/modules |
| Display | 1.28" round IPS 240×240, GC9A01 | 5 | ✔ (via Waveshare board ref) |
| Camera | OV2640 2 MP module | 4 | ○ |
| Env sensor | Bosch BME688 (BME280 is cheaper non-gas fallback) | 9 | ✔ BME280 https://lcsc.com/product-detail/Humidity-Sensors-Temperature-and-Humidity-Sensors_Bosch-Sensortec-BME280_C92489.html · datasheet https://cdn.sparkfun.com/assets/5/3/0/f/7/BME280_Datasheet.pdf |
| Light | VEML7700 | 1.5 | ○ |
| IMU | LSM6DS3TR-C or ICM-42670 | 2 | ○ |
| Wireless power | BQ51013B + coil (see module) | 4 | ✔ https://www.adafruit.com/product/1901 |
| Charger / gauge | BQ25180 + MAX17048 | 2.5 | ○ |
| Battery | thin LiPo with protection | 3 | ○ |
| Alert | piezo sounder + optional LRA + DRV2605L | 2 | ○ |
| Button | SMT tactile | 0.3 | ○ |
| Passives/connectors/ESD | | 2 | |
| **Electronics subtotal** | | **≈ 41** | |
| PCB 4-layer, 40×40 | PCBWay | 2 | https://www.pcbway.com |
| SMT assembly (turnkey) | PCBWay, quote after upload (1–2 days) | 6 | ✔ per search |
| Stainless 2-part CNC + polish | PCBWay CNC (304/316L) | 20–35 | ✔ per search; ○ quote |
| Window glass/sapphire, gaskets, screws | | 3 | |
| Packaging + Qi pad | | 6 | |
| **Estimated unit total** | | **≈ US$80–100** | |
One-off NRE (stencil, test jig, programming fixture, polishing fixture, certification budget): **~$800–3,000 + FCC/CE if sold.**

## C. Sourcing notes
- Supply MPNs; ask PCBWay for turnkey sourcing. Keep Gerbers/BOM/CPL in `hardware/` when created.
- Tooling for polished stainless drives cost — get a quote for 100 vs 500 pieces.
- Check LCSC/Digi-Key stock for BME688 and ESP32-S3-WROOM before design freeze.
