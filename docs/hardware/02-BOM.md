<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT Pager — Components Buying List (BOM)

**Document:** LOT-HW-01 / BOM · **Rev:** A (2026-11-13)

Prices are planning estimates for 100-unit quantity (Nov 2026), USD, not quotes. Links are
distributor **search** links so they don't break when a listing changes. Check stock and
lifecycle status before ordering. Items marked **VERIFY** need a datasheet check of size or
part number before layout.

## A. Stage 0 — breadboard kit (buy now, 1–2 sets)

Proves the whole loop (notice → screen → Copy → Log tab) before any custom PCB.

| Qty | Item | Why | Est. | Link |
|----:|------|-----|-----:|------|
| 1 | Seeed Studio XIAO ESP32S3 **Sense** (camera + PSRAM) | Same MCU family as final; has a camera | $14 | [DigiKey](https://www.digikey.com/en/products/result?keywords=XIAO%20ESP32S3%20Sense) |
| 1 | Arduino Nicla Sense ME (BME688 + BHI260AP on one board) | Exactly the final AI sensors | $75 | [DigiKey](https://www.digikey.com/en/products/result?keywords=Nicla%20Sense%20ME) |
| 1 | Adafruit SHARP Memory Display breakout 1.3" (#3502) | Same display tech as final | $25 | [Adafruit](https://www.adafruit.com/product/3502) |
| 1 | Adafruit DRV2605L haptic driver (#2305) + LRA motor (#1640 ERM or any LRA) | Pager buzz | $13 | [Adafruit](https://www.adafruit.com/product/2305) |
| 1 | Qi receiver module, 5 V, ~30 mm coil (generic) + Qi pad | Prove charging through glass vs. steel | $15 | [DigiKey](https://www.digikey.com/en/products/result?keywords=qi%20receiver%20coil) |
| 1 | LiPo 3.7 V ~150 mAh with protection | Battery-life measurements | $7 | [Adafruit](https://www.adafruit.com/category/574) |
| 1 | Tactile button, jumper wires, breadboard | Copy button | $8 | — |
| 1 | 316L stainless sheet sample, 0.5 mm, 50 × 50 mm | Qi + Wi-Fi attenuation test | $10 | [McMaster](https://www.mcmaster.com/stainless-steel-sheets/) |
|   | **Stage 0 total** | | **~$167** | |

## B. Production BOM (per unit, 100 units)

| Ref | Part | Function | Package / size | Est. @100 | Link |
|-----|------|----------|----------------|----------:|------|
| U1 | Espressif **ESP32-S3-PICO-1-N8R8** | MCU, Wi-Fi 4 + BLE 5, 8 MB flash + 8 MB PSRAM, camera DVP | LGA 7 × 7 mm SiP | 4.80 | [DigiKey](https://www.digikey.com/en/products/result?keywords=ESP32-S3-PICO-1-N8R8) · [LCSC](https://www.lcsc.com/search?q=ESP32-S3-PICO-1-N8R8) |
| ANT1 | Johanson 2450AT18A100 (or equal) | 2.4 GHz chip antenna, under glass window | 0603-size | 0.45 | [DigiKey](https://www.digikey.com/en/products/result?keywords=2450AT18A100) |
| Y1 | 40 MHz crystal | ESP32-S3 clock (check SiP — some PICO variants integrate it) **VERIFY** | 2016 | 0.30 | [LCSC](https://www.lcsc.com/search?q=40MHz%202016%20crystal) |
| Y2 | 32.768 kHz crystal | Low-power RTC for scheduled wake | 1610 | 0.30 | [LCSC](https://www.lcsc.com/search?q=32.768kHz%201610) |
| U2 | Bosch **BME688** | Weather: temp, humidity, pressure, gas (VOC) — AI-trainable via BME AI-Studio | LGA 3 × 3 × 0.93 mm | 8.50 | [DigiKey](https://www.digikey.com/en/products/result?keywords=BME688) |
| U3 | Bosch **BHI260AP** | Self-learning AI motion sensor: pick-up wake, tap, gesture | LGA 3.6 × 4.1 mm | 7.00 | [DigiKey](https://www.digikey.com/en/products/result?keywords=BHI260AP) |
| U4 | Himax **HM0360** camera module (VGA, ultra-low-power, AI vision) | Camera | module ≤ 2.5 mm Z **VERIFY** | 11.00 | [DigiKey](https://www.digikey.com/en/products/result?keywords=HM0360) |
| LCD1 | Sharp **LS013B7DH03** 1.28" 128 × 128 memory LCD | Silver reflective, µW static power, readable in sun | ~0.7–1.0 mm panel **VERIFY** | 13.50 | [DigiKey](https://www.digikey.com/en/products/result?keywords=LS013B7DH03) |
| U5 | TI **BQ51050B** | Qi receiver + Li-ion charger in one IC | DSBGA / VQFN | 3.20 | [DigiKey](https://www.digikey.com/en/products/result?keywords=BQ51050B) |
| L1 | Qi receiver coil, ~30 mm, ≤ 0.6 mm thick (Würth WE-WPCC family or equal) **VERIFY** | Wireless charging | flat coil | 3.00 | [DigiKey](https://www.digikey.com/en/products/result?keywords=wireless%20charging%20receiver%20coil) |
| FS1 | Ferrite shielding sheet 30 × 30 × 0.1 mm | Shields battery/PCB from Qi field | sheet | 0.60 | [DigiKey](https://www.digikey.com/en/products/result?keywords=ferrite%20sheet%20wireless%20charging) |
| BT1 | LiPo cell, 1.5 mm × 30 × 30 mm class, ~80 mAh, with PCM | Battery (semi-custom; MOQ often 500+, ask PCBWay/vendor) | pouch | 4.50 | [search](https://www.alibaba.com/trade/search?SearchText=ultra%20thin%20lipo%20battery%201.5mm) |
| U6 | Analog Devices **MAX17048** | Fuel gauge (battery %) | WLP 0.9 × 1.7 mm | 1.40 | [DigiKey](https://www.digikey.com/en/products/result?keywords=MAX17048) |
| U7 | TI **TPS62840** | 3.0 V buck, 60 nA quiescent | WCSP | 1.10 | [DigiKey](https://www.digikey.com/en/products/result?keywords=TPS62840) |
| U8 | Microchip **ATECC608B** | Secure device identity / token storage for LOT API | UDFN 2 × 3 mm | 0.80 | [DigiKey](https://www.digikey.com/en/products/result?keywords=ATECC608B) |
| U9 | TI **DRV2605L** | Haptic driver (pager buzz patterns) | WCSP / VSSOP | 1.60 | [DigiKey](https://www.digikey.com/en/products/result?keywords=DRV2605L) |
| M1 | Coin LRA, ≤ 8 mm Ø × ≤ 2.5 mm | Vibration | coin | 1.50 | [DigiKey](https://www.digikey.com/en/products/result?keywords=LRA%20vibration%20motor%20coin) |
| U10 | Vishay **VEML6030** | Ambient light → auto screen frontlight off/on, context | 2 × 2 mm | 0.90 | [DigiKey](https://www.digikey.com/en/products/result?keywords=VEML6030) |
| SW1 | Metal snap dome, 4 mm, ~250 gf | Copy button under steel key | 0.3 mm | 0.10 | [DigiKey](https://www.digikey.com/en/products/result?keywords=snap%20dome%204mm) |
| J1, J2 | 0.3 mm pitch FPC connectors (LCD, camera) | | low-profile ≤ 0.6 mm | 1.20 | [DigiKey](https://www.digikey.com/en/products/result?keywords=FPC%200.3mm%200.6mm%20height) |
| VENT1 | ePTFE adhesive vent (Gore PolyVent class), Ø 3 mm | Lets BME688 breathe, keeps water out | 0.2 mm | 1.20 | [DigiKey](https://www.digikey.com/en/products/result?keywords=gore%20vent%20adhesive) |
| — | Passives (~60 × 0201/0402), ESD diodes | | | 2.00 | — |
| — | Factory pogo pads (UART, EN, BOOT, GND, VBAT) | Flash + test; no USB port on device (sealed) | pads only | 0.00 | — |
|   | **Electronics subtotal** | | | **68.95** | |
|   | + 5 % attrition / spares | | | **≈ 72.40** | |

## C. Mechanical and packaging (per unit)

| Item | Spec | Vendor | Est. @100 |
|------|------|--------|----------:|
| Back shell (Part A) | 316L, CNC, #8 mirror polish outside, bead-blast inside | PCBWay CNC | 22.00 |
| Front frame (Part B) | 316L, CNC, brushed or polished, window pocket + key hole | PCBWay CNC | 16.00 |
| Steel key cap | 316L, 5 mm Ø, laser-etched "COPY" | PCBWay CNC | (incl.) |
| Cover glass | 0.55 mm aluminosilicate (or 0.4 mm sapphire, +$8), AR coat, black print mask with camera hole | glass vendor via PCBWay | 6.00 |
| Screws / adhesive | 4 × M1.2 stainless Torx or 3M VHB ring | McMaster / PCBWay | 0.60 |
| Qi charging pad (5 W, off-the-shelf, white-label) | in box | Alibaba / Anker class | 7.50 |
| USB-C cable + box + printed quick-start | | local printer | 5.90 |

## D. Where to buy

- **PCBWay** — PCB, turnkey PCBA (they source parts), CNC stainless, polishing: https://www.pcbway.com
- **DigiKey / Mouser** — sensors, ICs, dev kits (best for Stage 0 and for consigning hard-to-find ICs to PCBWay)
- **LCSC** — passives, crystals, connectors at low cost (PCBWay can source from here)
- **Bosch Sensortec** — BME AI-Studio (free) for training gas/odour classes on BME688

## E. Alternatives (if a part is short or too thick)

| Primary | Alternative | Trade-off |
|---------|-------------|-----------|
| ESP32-S3-PICO-1 (SiP, needs own FCC cert) | ESP32-S3-MINI-1 (pre-certified module, 2.4 mm tall) | Saves cert cost; adds ~1.4 mm or forces side-by-side layout |
| HM0360 | GalaxyCore GC0308 / GC032A thin module | Cheaper, lower quality, less AI support |
| LS013B7DH03 | 0.96" SSD1306 OLED (~1.4 mm) | Brighter in the dark, 10–100× more power, not silver |
| BHI260AP | BMI270 | $3 cheaper, no on-sensor learning |
| BME688 | Sensirion SHT45 + Bosch BMP390 | No gas/AI; better temp accuracy |
