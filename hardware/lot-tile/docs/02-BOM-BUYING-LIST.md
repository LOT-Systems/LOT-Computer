# 02 · Buying List (BOM) — LOT TILE P1

> **Prices are estimates from 2026 catalog knowledge. They were NOT checked live**: the build sandbox could not reach distributor sites. Confirm every line with a real quote before ordering.
> Links are distributor **keyword-search URLs**, chosen because they stay valid even when a product page moves.
> **Quantity rule:** to ship 100 units, buy for 110 builds (10% yield and test buffer). Buy 10% more on top of that for small passives.

## A. Proto-0 dev kits (buy now, about $350)

These let firmware and the server connector be finished before any custom PCB exists.

| Qty | Part | Why | Link | Est. |
|---|---|---|---|---|
| 2 | Seeed XIAO ESP32S3 **Sense** (ESP32-S3 + camera) | Same chip as production, with a camera already fitted | [DigiKey](https://www.digikey.com/en/products/result?keywords=XIAO%20ESP32S3%20Sense) | $28 |
| 2 | Adafruit SHARP Memory Display 1.3" 168×144 (closest breakout to the LS013B7DH03) | Same memory-LCD protocol as production | [Adafruit search](https://www.adafruit.com/search?q=sharp+memory+display) | $50 |
| 2 | Bosch BME688 breakout (Adafruit / Pimoroni) | Weather sensor plus the BSEC2 AI library | [DigiKey](https://www.digikey.com/en/products/result?keywords=BME688%20breakout) | $40 |
| 1 | Bosch BHI260AP shuttle / eval board (or Arduino Nicla Sense ME, which has BHI260AP + BME688 on one board) | AI IMU for gestures | [DigiKey](https://www.digikey.com/en/products/result?keywords=Nicla%20Sense%20ME) | $75 |
| 2 | LTR-390UV breakout | UV index | [DigiKey](https://www.digikey.com/en/products/result?keywords=LTR390%20breakout) | $10 |
| 2 | DRV2605L haptic breakout + small LRA | Pager buzz | [DigiKey](https://www.digikey.com/en/products/result?keywords=DRV2605L%20breakout) | $25 |
| 2 | Qi receiver module, 5 V (BQ51050B-based EVM or a generic Qi RX pad) | Charging tests through metal and ceramic | [DigiKey](https://www.digikey.com/en/products/result?keywords=BQ51050B) | $40 |
| 1 | Qi 5 W/15 W transmitter pad (any certified one) | Charger for tests | — | $20 |
| 4 | 316L coupons, 40×40×0.5 mm, one mirror-polished; one Ø22 mm zirconia disc | D1 heat and efficiency test | PCBWay CNC quote | $60 |
| 2 | LiPo 3.7 V ~100–150 mAh, ≤ 3 mm thick (hobby grade, for bench only) | Power budget measurement | [DigiKey](https://www.digikey.com/en/products/result?keywords=lipo%20100mAh) | $16 |
| 1 | Nordic PPK2 power profiler | Measures µA sleep current and mAh per wake | [DigiKey](https://www.digikey.com/en/products/result?keywords=PPK2) | $100 |

## B. Production BOM (per unit, priced at 110 units)

### B1 · Compute, radio, display, camera

| Ref | Part number | Description | Package / size | Link | Est. @100 |
|---|---|---|---|---|---|
| U1 | **ESP32-S3-MINI-1-N4R2** | Wi-Fi 4 + BLE 5, 4 MB flash, 2 MB PSRAM, FCC modular grant | 15.4×20.5×2.4 mm | [DigiKey](https://www.digikey.com/en/products/result?keywords=ESP32-S3-MINI-1-N4R2) | $3.80 |
| DSP1 | **Sharp LS013B7DH03** | 1.28" 128×128 memory-in-pixel LCD, ~10 µW static, sunlight readable | ~0.9 mm panel + FPC | [DigiKey](https://www.digikey.com/en/products/result?keywords=LS013B7DH03) | $16.00 |
| DSP1-alt | JDI LPM013M126A | 1.28" 176×176, 8-colour MIP | similar | [search](https://www.digikey.com/en/products/result?keywords=LPM013M126A) | $18 (check availability) |
| CAM1 | **Himax HM0360** + lens module (≤ 3.0 mm height module from a Himax partner) | 640×480 / 320×240, < 1 mW in motion-detect mode, DVP 8-bit | module | [DigiKey](https://www.digikey.com/en/products/result?keywords=HM0360) | $9.00 |
| CAM1-alt | OmniVision OVM7692 CameraCube | VGA wafer-level camera, 2.5×2.9×2.5 mm. **May be EOL; confirm** | WLCSP module | [search](https://www.digikey.com/en/products/result?keywords=OVM7692) | $8–14 |

### B2 · AI-grade sensors (requirements #14, #15)

| Ref | Part number | Description | Size | Link | Est. |
|---|---|---|---|---|---|
| U2 | **Bosch BME688** | T / RH / P / gas with an AI gas scanner (BSEC2, BME AI-Studio) | 3.0×3.0×0.93 mm | [DigiKey](https://www.digikey.com/en/products/result?keywords=BME688) | $10.50 |
| U3 | **Bosch BHI260AP** | Self-learning AI smart IMU: tap, flip, wrist, step, activity on-chip | 3.6×4.1×0.83 mm | [DigiKey](https://www.digikey.com/en/products/result?keywords=BHI260AP) | $8.00 |
| U4 | **Lite-On LTR-390UV-01** | UV index plus ambient light | 2.0×2.0×0.65 mm | [DigiKey](https://www.digikey.com/en/products/result?keywords=LTR-390UV-01) | $1.60 |
| M1 | ePTFE vent membrane, Ø3 mm (Gore / Saati) | Lets the BME688 sample air through steel while keeping water out | — | [search](https://www.digikey.com/en/products/result?keywords=protective%20vent%20adhesive) | $0.60 |

### B3 · Power and charging (requirements #12, #19)

| Ref | Part number | Description | Link | Est. |
|---|---|---|---|---|
| BT1 | Custom LiPo **~110 mAh, 1.8×28×30 mm** (5.0 mm build) / ~180 mAh 2.8 mm (6.0 mm build), with PCM, UN38.3 + IEC 62133 | Grepow / PowerStream ultra-thin custom | vendor RFQ | $5–8 (+$300–800 NRE) |
| U5 | **TI BQ51050B** | Qi receiver with a built-in Li-ion charger, 1.9×3.0 mm DSBGA | [DigiKey](https://www.digikey.com/en/products/result?keywords=BQ51050B) | $3.20 |
| L1 | Qi Rx coil, Ø ≈ 20–22 mm, ≤ 0.6 mm with ferrite (Würth WE-WPCC family or a TDK WR-series equivalent) | [search](https://www.digikey.com/en/products/result?keywords=wireless%20charging%20receiver%20coil) | $3.50 |
| U6 | **TI TPS63900** | 75 nA Iq buck-boost, 3.3 V rail | [DigiKey](https://www.digikey.com/en/products/result?keywords=TPS63900) | $1.90 |
| U7 | **Analog Devices MAX17048** | 1-cell fuel gauge (ModelGauge) | [DigiKey](https://www.digikey.com/en/products/result?keywords=MAX17048) | $1.50 |
| J1 | 2-pin magnetic pogo contact (Mill-Max / CFE spring pins, 1.0 mm) | Dock charging, factory programming | [DigiKey](https://www.digikey.com/en/products/result?keywords=mill-max%20spring%20loaded%20pin%20low%20profile) | $1.20 |

### B4 · User interface

| Ref | Part number | Description | Link | Est. |
|---|---|---|---|---|
| SW1 | Snaptron metal snap dome, 4 mm, ~240 gf (F04-series) | The **COPY** button, 0.3 mm tall | [DigiKey](https://www.digikey.com/en/products/result?keywords=snaptron%20dome) | $0.15 |
| — | Stainless button cap Ø6 mm plus silicone seal | Machined with the body | PCBWay CNC | (in body) |
| U8 | **TI DRV2605L** | Haptic driver with a built-in effect library | [DigiKey](https://www.digikey.com/en/products/result?keywords=DRV2605L) | $1.90 |
| HAP1 | Coin LRA ≤ Ø8 × 2.5 mm (Vybronics / Jinlong class; **confirm the height**) | Pager buzz | [search](https://www.digikey.com/en/products/result?keywords=LRA%20vibration%20motor) | $1.80 |
| D1 | 0402 white LED | Camera privacy indicator (always lit while the camera is on) | — | $0.05 |

### B5 · Mechanical (PCBWay CNC, see doc 03)

| Item | Spec | Est. @100 |
|---|---|---|
| Back tub | 316L, CNC, mirror polish #8, 0.5 mm floor, Ø22 mm zirconia window bore (if D1 = B) | $22–38 |
| Front lid | 316L, CNC, bead-blast or brushed, window pocket, button bore, 4 × M1.0 countersinks | $16–28 |
| Zirconia disc | Ø22 × 0.6 mm, black, mirror polished (D1 = B) | $4–7 |
| Front window | Sapphire 0.4 mm, 34×24 mm, AR coated, black ink mask with camera hole | $6–10 |
| Screws | 4 × M1.0 × 2.0 Torx T3, A2 stainless | $0.40 |
| Gasket | Formed-in-place silicone (or 0.3 mm die-cut PORON) | $0.50 |
| Adhesives | 3M 9474LE (window), 3M 300LSE (battery) | $0.40 |

### B6 · PCB and assembly (PCBWay)

| Item | Spec | Est. |
|---|---|---|
| PCB | 4-layer, 0.6 mm FR-4 (or 0.4 mm), 38×38 mm, 0.1 mm via-in-pad, ENIG | $2.50/unit + $80 setup |
| PCBA | Turnkey, both sides (top only if possible), 0201 passives, BGA X-ray | $9–14/unit + $150 setup + $40 stencil |
| Passives / ESD / FPC connector | ~45 parts | $3.00 |

### B7 · Charger, box, print

| Item | Est. |
|---|---|
| Qi pad, 5 W, certified off-the-shelf (white-label, Qi-certified) | $6–9 |
| Pogo dock: CNC aluminium puck + USB-C + 2 magnets + 2 pogo receptacles | $8–14 |
| USB-C cable | $1.50 |
| Box: rigid two-piece, foam insert, LOT foil stamp | $4–6 |
| Printed quick-start card (the full manual is a PDF) | $0.40 |

## C. Cost summary (100 shipped units, 110 built)

| Bucket | Low | High |
|---|---|---|
| Electronics per unit (B1–B4 + B6) | $77 | $100 |
| Mechanical per unit (B5) | $50 | $85 |
| Charger + box per unit (B7) | $20 | $31 |
| **Unit landed cost** | **≈ $147** | **≈ $216** |
| × 110 builds | $16.2k | $23.8k |
| NRE: EVT + DVT rounds (2 × 10–20 units PCBA + CNC) | $4k | $9k |
| NRE: battery tooling | $0.3k | $0.8k |
| NRE: certification (module reuse: SDoC + CE RED, Qi optional) | $4k | $15k |
| NRE: freight, duties, fixtures | $1k | $3k |
| **Total program to 100 shipped** | **≈ $25k** | **≈ $52k** |

## D. Where to order

1. **PCBWay** (pcbway.com): PCB, PCBA (turnkey; PCBWay sources parts or we consign), CNC machining (316L), polishing, sapphire through a partner.
2. **DigiKey / Mouser**: dev kits, and consigned parts if PCBWay's turnkey prices are high.
3. **Battery**: request quotes from 2–3 custom LiPo vendors. Lead time is 4–6 weeks and typical MOQ is 500, so ask for a 200-pc pilot.
