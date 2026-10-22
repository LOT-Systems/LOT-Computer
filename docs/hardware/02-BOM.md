# Bill of Materials — prototype (EVT) and 100-unit estimate
**Prices are rough estimates from memory, NOT verified quotes** (live pricing was unavailable in this session). Get quotes before ordering.

| Part | Suggested part | Link (verify) | Est. unit @100 |
|---|---|---|---|
| MCU module | ESP32-S3-MINI-1U / WROOM-1 (N8R2) | https://www.espressif.com/en/products/socs/esp32-s3 | $3.5 |
| Camera | OV2640 DVP module (or GC2145) | https://www.omnivision.com | $3 |
| Display | 1.3" IPS 240×240 ST7789 (or 1.12" OLED) | https://www.aliexpress.com / https://www.adafruit.com | $4 |
| Env sensor | Bosch BME280 → BME688 | https://www.bosch-sensortec.com/products/environmental-sensors/gas-sensors/bme688/ | $3 / $9 |
| IMU | Bosch BMI270 | https://www.bosch-sensortec.com/products/motion-sensors/imus/bmi270/ | $2 |
| Haptic | LRA 6 mm + DRV2605L driver | https://www.ti.com/product/DRV2605L | $2 |
| Qi receiver IC | TI BQ51003 / BQ51050B | https://www.ti.com/product/BQ51050B | $2.5 |
| Qi Rx coil | Würth 760308101 series, ferrite-backed | https://www.we-online.com | $2 |
| Charger/PMIC | BQ25895 or AXP2101 | https://www.ti.com/product/BQ25895 | $2 |
| Battery | Li-Po 502020 (~120 mAh) | cell vendor TBD | $2 |
| Button | Tact switch 3×3 mm, sealed | https://www.alps.com | $0.3 |
| Misc passives/connectors | | | $2 |
| **PCB + SMT (PCBWay)** | 4-layer ENIG, 38×38 mm | https://www.pcbway.com | $8–15 incl. assembly @100 |
| **Stainless body (2 parts)** | 316L CNC + polish | PCBWay CNC quote | $25–60 |
| Packaging, QC, shipping, duties | | | $8 |

**Rough BOM+body @100: ~$80–130/unit → ~$8–13k run**, plus tooling/NRE (fixtures, test jig, FCC pre-scan ~ $3–8k). Dominant cost: polished steel.
Dev kit shortcut for week 1: ESP32-S3-EYE or XIAO ESP32S3 Sense (camera built in) + display + BME280 breakout, ~ $60.
