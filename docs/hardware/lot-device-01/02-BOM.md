# LOT DEVICE-01 — Components Buying List (BOM)

**Doc:** HW-02-BOM · **Rev:** A · **Date:** 2026-11-28

> **Prices are planning estimates (USD, per unit at 100 pcs) from typical distributor pricing. They were not checked live this session, because outbound network access was limited.** Before ordering, confirm each line on the linked search page and against the datasheet: stock, the exact suffix, height (Z) and lead time. Links go to distributor *search* pages so they don't break when a listing changes.

## 1. Electronics

| Ref | Function | Primary part | Alternate | Key spec to verify | Est. $/u @100 | Buy |
|---|---|---|---|---|---|---|
| U1 | SoC, Wi-Fi/BLE | Espressif **ESP32-S3FH4R2** (QFN56 7×7) | ESP32-S3-MINI-1-N4R2 module (pre-certified, 2.4 mm Z) | In-package 4 MB flash + 2 MB PSRAM | 3.20 (module 4.10) | [DigiKey](https://www.digikey.com/en/products/result?keywords=ESP32-S3FH4R2) · [LCSC](https://www.lcsc.com/search?q=ESP32-S3FH4R2) |
| Y1 | 40 MHz crystal | 2016-size, 10 ppm | 2520 | Load capacitance as the Espressif HW guide gives | 0.20 | [LCSC](https://www.lcsc.com/search?q=40MHz%202016%20crystal) |
| ANT1 | 2.4 GHz chip antenna | Johanson 2450AT18A100 | PCB trace antenna | Must sit under the glass, ≥3 mm from steel | 0.35 | [DigiKey](https://www.digikey.com/en/products/result?keywords=2450AT18A100) |
| DS1 | Screen | Sharp **LS013B7DH05** 1.26" 144×168 Memory LCD | LS011B7DH03 1.08" 160×68; SSD1306 0.96" OLED | Module Z ≈ 0.8 mm, 10-pin FPC, 3 V | 9.50 | [DigiKey](https://www.digikey.com/en/products/result?keywords=LS013B7DH05) · [Mouser](https://www.mouser.com/c/?q=LS013B7DH05) |
| CAM1 | Camera (AI vision) | Himax **HM0360** VGA module | OV2640 FPC module (short flex) | **Module Z ≤ 3.0 mm** decides the 5 mm target | 7.00 | [DigiKey](https://www.digikey.com/en/products/result?keywords=HM0360) · [LCSC](https://www.lcsc.com/search?q=OV2640) |
| U2 | Weather + air (AI) | Bosch **BME688** | BME280 (no gas) | LGA 3×3×0.93 mm, needs a vent | 9.00 | [DigiKey](https://www.digikey.com/en/products/result?keywords=BME688) · [Mouser](https://www.mouser.com/c/?q=BME688) |
| U3 | Qi receiver + Li-ion charger | TI **BQ51050B** | BQ51013B + BQ25100 | Up to 4.2 V charge, small package | 3.10 | [DigiKey](https://www.digikey.com/en/products/result?keywords=BQ51050B) |
| L1 | Qi RX coil | Würth WE-WPCC receiver coil (thin, ≤0.6 mm, ~28 mm) | Custom FPC coil (PCBWay) | Inductance matched to the BQ51050B design | 2.50 | [DigiKey](https://www.digikey.com/en/products/result?keywords=WE-WPCC%20receiver) |
| U4 | Buck 3.0 V | TI **TPS62840** (60 nA Iq) | TPS62743 | Output 3.0 V, 750 mA | 1.10 | [DigiKey](https://www.digikey.com/en/products/result?keywords=TPS62840) |
| U5 | Fuel gauge | Analog **MAX17048** | — | ModelGauge, I²C | 1.80 | [DigiKey](https://www.digikey.com/en/products/result?keywords=MAX17048) |
| U6 | Load switch (camera/sensor) | TI **TPS22916** | — | Ultra-low leakage | 0.40 | [DigiKey](https://www.digikey.com/en/products/result?keywords=TPS22916) |
| SW1 | Copy button | C&K **KMR2** series tactile (4.2×2.8×1.9) | Panasonic EVP-AW | Actuated by a stainless plunger through the bezel | 0.45 | [DigiKey](https://www.digikey.com/en/products/result?keywords=KMR2) |
| M1 | Haptic | 8 mm coin ERM, 2.0 mm Z | 0610 LRA + DRV2603 | ≤ 70 mA at 3 V | 0.90 | [LCSC](https://www.lcsc.com/search?q=coin%20vibration%20motor%208mm) |
| Q1/D1 | Motor driver | N-MOSFET SOT-723 + flyback diode | — | — | 0.10 | [LCSC](https://www.lcsc.com/search?q=SOT-723%20N-MOSFET) |
| BT1 | Battery | LiPo pouch **2.0–2.5 × 25 × 30 mm**, ~100–130 mAh, with protection circuit | Custom cell (MOQ 500+) | Thickness decides Z; UN38.3 test report needed for shipping | 4.00 | Vendor RFQ (e.g. Grepow, PowerStream) |
| J1 | Factory/debug | 6 gold test pads (USB D±, EN, BOOT, VBAT, GND) | — | Pogo jig, no external connector | 0.00 | — |
| — | Passives, ESD, misc. | 0201/0402 R/C, ESD on button and pads | — | — | 1.20 | LCSC |
| | | | | **Electronics subtotal** | **≈ 44.80** | |

## 2. Mechanical, PCB and assembly

| Item | Spec | Source | Est. $/u @100 |
|---|---|---|---|
| PCB | 4-layer HDI, 0.6 mm FR-4, ENIG, ~37×37 mm, battery cut-out, laser microvias | [PCBWay PCB](https://www.pcbway.com/orderonline.aspx) | 5.00 |
| PCB assembly (PCBA) | Turnkey, double-sided, 0201, QFN; includes stencil and setup amortised over 100 | [PCBWay Assembly](https://www.pcbway.com/pcb-assembly.html) | 12.00 |
| **Part A** back shell | 316L stainless, CNC, mirror #8 polish, 0.5 mm floor | [PCBWay CNC machining](https://www.pcbway.com/) (Rapid Prototyping → CNC) | 22.00 |
| **Part B** front bezel | 316L, CNC, bead-blast or brushed, glass pocket, button bore, vent | PCBWay CNC | 18.00 |
| Front glass | 0.4 mm chemically strengthened (or 0.3 mm sapphire), AR coating, black print mask, camera window | Glass supplier RFQ | 4.50 |
| Button plunger | 316L pin Ø1.6 mm with O-ring | PCBWay CNC | 1.20 |
| Fasteners | 4 × M1.2 × 2.5 stainless Torx, from the front corners | McMaster / Misumi | 0.60 |
| Adhesive / gasket | Tesa / 3M 0.1 mm die-cut, ePTFE vent membrane | Die-cut vendor | 0.90 |
| Packaging + quick-start card (QR → PDF manual) | Matte sleeve, card | Local print | 3.00 |
| | | **Mechanical/PCB subtotal** | **≈ 67.20** |

## 3. Charger (one per unit)

| Item | Spec | Est. $/u @100 |
|---|---|---|
| **Option 1:** off-the-shelf Qi 5 W pad, rebadged | Any Qi-certified pad. Low-power transfer to a small coil works at 2–3 W | 6.00 |
| **Option 2:** LOT puck | Qi TX module + 6061 aluminium CNC puck with an alignment recess + USB-C | 14.00 |

## 4. Totals at 100 units (estimate)

| Bucket | Per unit | × 100 |
|---|---|---|
| Electronics | 44.80 | 4,480 |
| Mechanical + PCB + PCBA | 67.20 | 6,720 |
| Charger (Option 2) | 14.00 | 1,400 |
| **Unit cost** | **≈ 126** | **≈ 12,600** |
| One-time costs (NRE): EVT/DVT prototypes (2 rounds × 10 units) | — | 3,500–5,000 |
| NRE: factory test jig (pogo) | — | 600–1,200 |
| NRE: certification, **module version** (FCC Part 15B unintentional + modular grant reuse) | — | 2,500–5,000 |
| NRE: certification, **chip-down version** (FCC/ISED/CE intentional radiator) | — | 10,000–25,000 |
| Shipping, duties, UN38.3 battery shipping | — | 800–1,500 |
| **Program total, module version** | | **≈ 20k–25k** |
| **Program total, chip-down version** | | **≈ 28k–45k** |

Spares: order ×1.1 on all electronics (110 kits) so a scrapped board doesn't stop the run.
