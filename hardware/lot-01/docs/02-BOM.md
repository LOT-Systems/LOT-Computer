---
title: "LOT-01 SQUARE — Bill of Materials & Buying List"
subtitle: "Doc 02 · Costed at 100 units · Rev A (2026-11-24)"
---

# LOT-01 — Bill of Materials & Buying List

Prices are USD per unit at the 100-unit break, checked or estimated on 2026-11-24.
**Est.** means no live quote yet. Confirm every line on the distributor page before
ordering. Distributor stock and lead times change weekly.

## A. Device electronics

| Ref | Part | Function | Package / size | Qty | Unit $ @100 | Source / link | Notes |
|---|---|---|---|---|---|---|---|
| U1 | **Espressif ESP32-S3FH4R2** | MCU, Wi-Fi 4, BLE 5, 4 MB flash + 2 MB PSRAM in package | QFN-56 7×7×0.9 mm | 1 | ~3.00 | [Digi-Key 1965-ESP32-S3FH4R2](https://www.digikey.com/en/products/detail/espressif-systems/ESP32-S3FH4R2/17887524) · [LCSC C3013940](https://www.lcsc.com/product-detail/ESP32-S3FH4R2_C3013940.html) | LCSC stock matters for PCBWay assembly. Confirm PSRAM size in the datasheet |
| Y1 | 40 MHz crystal, 2016, ±10 ppm | MCU clock | 2.0×1.6×0.5 | 1 | 0.25 | LCSC (est.) | |
| ANT1 | 2.4 GHz chip antenna (e.g. Johanson 2450AT18A100 class) | Wi-Fi/BLE | 3.2×1.6×0.5 | 1 | 0.45 | Digi-Key (est.) | Behind the glass window, with a pi-match network |
| DS1 | **Sharp LS013B7DH03** | 1.28″ 128×128 memory LCD, reflective | ~0.75 mm module (verify) | 1 | 7.31 | [Digi-Key 425-2903-ND](https://www.digikey.com/en/products/detail/sharp-microelectronics/LS013B7DH03/425-2903-ND/5300387) | **0 in stock, 28-week lead time. Buy first.** Alternative: JDI LPM013M126A (176×176, 8-colour) |
| CAM1 | GalaxyCore **GC032A** (or GC0308) VGA FPC camera module, ≤ 2.6 mm tall | Camera | FPC, 24-pin DVP | 1 | 3.50 (est.) | AliExpress / Taobao module vendors, via PCBWay sourcing | Driver support is in community esp32-camera forks. Validate in EVT. Get a height drawing from the vendor |
| U2 | **Bosch BME688** | Weather + AI gas sensor | LGA 3.0×3.0×0.93 | 1 | ~7.50 | [LCSC C3664478](https://www.lcsc.com/product-detail/Temperature-and-Humidity-Sensor_Bosch-Sensortec-BME688_C3664478.html) · [Digi-Key highlight](https://www.digikey.com/en/product-highlight/b/bosch-sensortec/bme688-4-in-1-environmental-sensing) | Uses the BSEC2 library and BME AI-Studio |
| U3 | **ST LSM6DSV16X** | 6-axis IMU with Machine-Learning Core (pick-up, tap) | LGA 2.5×3.0×0.83 | 1 | 3.80 (est.) | Digi-Key / LCSC | The MLC runs wrist-raise detection at ~µA |
| U4 | **TI BQ25120A** | Charger, buck, LDO, push-button controller | DSBGA 2.5×2.5 | 1 | 2.40 (est.) | [ti.com BQ25120A](https://www.ti.com/product/BQ25120A) | Low-power PMIC made for wearables |
| U5 | **Renesas PTX30W** | NFC wireless-charging listener (up to 1 W) | WL-CSP ~3.2 mm² | 1 | 2.50 (est.) | [renesas.com/PTX30W](https://www.renesas.com/en/products/ptx30w) | Some variants are obsolete, so check the ordering table. Fallback: TI BQ51003 (Qi) |
| L1 | NFC-WLC receive antenna, flex ring (custom) | Charging antenna | 0.12 mm flex + 0.1 mm ferrite sheet | 1 | 1.50 (est.) | PCBWay flex PCB | Ring around the display, under the glass |
| BT1 | LiPo cell 2.0 × 25 × 30 mm, ~90 mAh, with PCM and NTC | Battery | pouch | 1 | 4.00 (est.) | Grepow / EEMB / Shenzhen thin-cell vendors | **Custom cells often have an MOQ of about 500.** Ask about stock 202530-size cells |
| M1 | Coin vibration motor Ø8 × 2.0 mm, 3 V | Pager buzz | coin | 1 | 0.60 | LCSC (est.) | Driven by a MOSFET with a flyback diode |
| SW1 | Low-profile tact switch, 1.0–1.6 mm, 160–250 gf | COPY | SMD | 1 | 0.30 | Alps SKRK / C&K KMR class (est.) | A steel plunger sits on top |
| J1–J3 | 0.3/0.5 mm FPC connectors (LCD, camera, NFC antenna) | Interconnect | ≤ 0.9 mm tall | 3 | 0.45 | Hirose FH / Molex Easy-On (est.) | |
| Q, R, C, D | Passives 0201/0402, ESD diodes, MOSFETs | Misc | | ~70 | 1.20 | LCSC basic parts | |
| TP | Pogo test pads (USB D+/D−, UART, EN, IO0, VBAT, GND) | Factory flashing | pads | — | 0 | — | Under the battery area |

**Electronics subtotal ≈ $39–42 per unit.**

## B. PCB and assembly (PCBWay)

| Item | Spec | $/unit @100 | Link |
|---|---|---|---|
| Main PCB | 4-layer HDI, 0.6 mm FR-4, 37 × 37 mm, ENIG, 3/3 mil, 0.2 mm laser microvias, via-in-pad for the 0.4 mm-pitch BGA | 4–7 (est.) | [PCBWay PCB quote](https://www.pcbway.com/orderonline.aspx) |
| NFC antenna flex | 2-layer polyimide 0.12 mm | 1.5 (est.) | [PCBWay flex](https://www.pcbway.com/flexible-pcb-manufacturing.html) |
| PCBA | Turnkey (PCBWay sources parts), double-sided, X-ray inspection for the WLCSP/QFN | 10–15 (est.) | [PCBWay assembly](https://www.pcbway.com/pcb-assembly.html) |
| Stencil + setup | One-time | ~$150 NRE | |

## C. Enclosure (PCBWay CNC + finishing)

| Item | Spec | $/unit @100 | Link |
|---|---|---|---|
| Front tray | 316L, CNC, 0.5 mm face, window pocket, button bore Ø4.2, vent port Ø0.5 | 18–30 (est.) | [PCBWay CNC milling](https://pcbway.com/rapid-prototyping/cnc-machining/cnc-milling.html) |
| Back plate | 316L, 0.5 mm, **mirror polish (target Ra ≤ 0.05 µm)** + passivation | 10–20 (est.) | Custom finish: email **3dcnc@pcbway.com** (mirror polish is quote-only) |
| COPY plunger | 316L turned pin, Ø4.0, polished | 2 (est.) | PCBWay CNC turning |
| Front window | Sapphire 0.5 mm (or chemically strengthened glass 0.55 mm), AR coat, black ink mask, 36 × 30 mm | 6–12 (sapphire) / 2–4 (glass) (est.) | Glass vendor (PCBWay can source) |
| Laser engraving | LOT mark + serial on the inner face of the back plate | 1 | PCBWay |
| Gaskets, PSA, ePTFE vent membrane, 4× M1.0 screws | | 2 | |

**Enclosure subtotal ≈ $39–67 per unit.**

## D. Charger puck (doc 09)

| Item | $/unit @100 |
|---|---|
| Renesas PTX130W poller + matching + antenna (PCB) | 6–9 (est.) |
| USB-C receptacle, ESD, LDO | 1.5 |
| Puck body (CNC aluminium or 316L, Ø50 × 8 mm) + silicone top pad | 8–15 |
| USB-C cable 1 m | 1.5 |
| **Subtotal** | **17–27** |

## E. Pack and print

Box, foam, printed quick-start card (from doc 10 PDF), serial sticker: **$4–6**.

## F. Roll-up (per unit, 100-unit run)

| Block | Low | High |
|---|---|---|
| Electronics (A) | 39 | 42 |
| PCB + PCBA (B) | 15 | 23 |
| Enclosure (C) | 39 | 67 |
| Charger (D) | 17 | 27 |
| Pack (E) | 4 | 6 |
| Yield allowance (10 %) | 11 | 17 |
| **Unit cost** | **≈ $125** | **≈ $182** |
| **100 units** | **≈ $12.5k** | **≈ $18.2k** |

## G. One-time costs (NRE)

| Item | Est. |
|---|---|
| Dev kits and early samples (ESP32-S3 dev boards, Sharp LCD breakouts, BME688 boards, PTX130W-30W eval kit, camera modules) | $1,000–1,500 |
| EVT prototypes (10 boards + 10 CNC bodies) | $2,000–3,500 |
| DVT build (20 units) | $3,000–5,000 |
| FCC Part 15 (15.247 + 15.225/18 for WLC) + CE RED + UKCA test lab | $15,000–25,000 |
| Battery UN38.3 / IEC 62133 report (from the cell vendor, or own) | $0–6,000 |
| Fixtures (pogo flashing jig, RF test) | $800 |
| **Total NRE** | **≈ $22k–41k** |

## H. Buy-first list (long lead / gating)

1. **Sharp LS013B7DH03 × 120** (28-week lead time on Digi-Key). Check Mouser, Arrow and the Sharp distributor. Buy breakout boards now for EVT.
2. **Renesas PTX130W-30W evaluation kit**. This proves charging through the glass window, the #1 technical risk.
3. **Camera modules**: 3 vendors × 5 samples, with mechanical drawings showing height ≤ 2.6 mm.
4. **Thin LiPo**: ask 3 vendors for 2.0 mm cells. Get MOQ, UN38.3 status and lead time.
5. **ESP32-S3-DevKitC-1** × 3 and an **LSM6DSV16X / BME688 breakout** × 3 for firmware bring-up.
