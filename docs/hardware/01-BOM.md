# HW-001 Bill of Materials and Buying List

Prices are estimates in USD at 100-unit volume, ±30%. Not quotes. Stock not verified. PCBWay turnkey needs manufacturer part numbers (MPNs), so MPNs are listed.

## A. Prototype kit (buy now, Phase 1)

| Item | Why | Link | Est. |
|---|---|---|---|
| Adafruit MEMENTO (ESP32-S3, 1.54" 240×240 TFT, camera, buttons) | Closest all-in-one reference | [guide](https://learn.adafruit.com/adafruit-memento-camera-board.md?view=all) | $50 |
| DFRobot FireBeetle 2 ESP32-S3 + OV2640 (DFR0975) | Cheaper OV2640 dev board | [DigiKey](https://www.digikey.com/en/products/detail/dfrobot/DFR0975/20500154) | $25 |
| Waveshare ESP32-S3-LCD-2 | ST7789 screen + camera port | [Waveshare](https://www.waveshare.com/esp32-s3-lcd-2.htm) | $20 |
| BME280 breakout | Weather sensor | search "BME280 breakout" on Adafruit or SparkFun | $10 |
| Qi receiver coil + module, 5 V | Test charging through window materials | search "Qi receiver 5V" | $10 |
| Samples of 316L, glass, PEEK 40×40 plates | RF and Qi attenuation test | PCBWay CNC or local machinist | $60 |

## B. Production BOM per unit (v1, 9.5 mm)

| Function | Part (MPN) | Maker page | Est. |
|---|---|---|---|
| MCU + Wi-Fi/BLE | ESP32-S3-WROOM-1-N16R8 (pre-certified module) | [Espressif](https://www.espressif.com/en/products/modules) | $5.00 |
| Camera | OV2640 (OmniVision) module | [OmniVision](https://www.ovt.com) | $3.50 |
| Screen | 1.54" IPS 240×240, ST7789 | vendor TBD (Waveshare/AliExpress/Adafruit) | $5.00 |
| Weather sensor | BME280 (Bosch) T/RH/pressure | [Bosch](https://www.bosch-sensortec.com/products/environmental-sensors/humidity-sensors-bme280/) | $3.50 |
| Upgrade: air quality "AI" sensor | BME688 (Bosch, runs BSEC) | [Bosch](https://www.bosch-sensortec.com/products/environmental-sensors/gas-sensors/bme688/) | +$6 |
| Wireless charging IC | BQ51013B (TI Qi receiver) + coil | [TI](https://www.ti.com/product/BQ51013B) | $4.50 |
| Li-Po charger | MCP73831 or BQ25185 | Microchip / TI | $0.80 |
| Battery | Li-Po 301230–402025, 3.7 V, 100–150 mAh, with protection | vendor TBD | $3.50 |
| 3.3 V regulator | AP2112K-3.3 | Diodes Inc. | $0.30 |
| Button | Tactile switch, low profile (e.g. 3×2×0.6 mm) | TBD | $0.20 |
| Piezo or LRA haptic | Pager alert | TBD | $0.80 |
| PCB, 4-layer, 38×38 mm | PCBWay | [PCBWay](https://www.pcbway.com) | $4.00 |
| Assembly | PCBWay turnkey (quote-based) | [quote](https://www.pcbway.com/quotesmt.aspx?f=fa) | $10.00 |
| Passives, connectors, FPC | misc. | — | $3.00 |
| Charging window | PEEK or glass insert | — | $3.00 |
| Steel body, 2 parts, 316L CNC | PCBWay CNC or machinist | — | $35–50 |
| Mirror polish (one face) | finishing | — | $8–12 |
| Gasket, screws, adhesive | — | — | $2.00 |
| Packaging, QC, test jig share | — | — | $4.00 |
| **Total per unit** | | | **about $105–125** |

## C. One-off costs (NRE)

| Item | Est. |
|---|---|
| CNC programming and fixtures | $500–1,000 |
| Stencil, test jig, programming fixture | $300 |
| Pre-compliance RF scan | $1,000–2,000 |
| FCC full test (only if selling) | $5,000–10,000 |
| UN38.3 battery test (only if shipping commercially) | $1,500–3,000 |

100-unit run: about $10.5–12.5k hardware + about $1–2k NRE, before certification.

## D. Cost levers

- Aluminium anodised or PVD-coated steel-look body cuts body cost by about 60%, but it is not stainless.
- Drop the camera: saves about $6 and gains about 4 mm of thickness.
- Order 300 units: the body drops to about $20–25 each.
