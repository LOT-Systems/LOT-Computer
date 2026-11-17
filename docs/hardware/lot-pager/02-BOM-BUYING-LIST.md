---
title: "LOT PAGER — 02 · Components Buying List (BOM)"
subtitle: "Hardware programme HW-01 · Rev 0.1 · 2026-11-17"
---

# LOT PAGER — 02 · COMPONENTS BUYING LIST (BOM)

```
DOCUMENT   HW-01 / 02-BOM
BASIS      100-unit PVT run, prices in USD
PRICES     Estimates/snapshots Nov 2026 — confirm on the distributor page before ordering
LINKS      Distributor search links are used where part pages change often
```

Status legend: **✓** = verified this session (distributor listing) · **~** = estimate, verify.

## A · Electronics (per unit)

| # | Function | Part | Qty | Unit @100 | Link | Note |
|---|----------|------|-----|-----------|------|------|
| 1 | MCU + Wi-Fi/BLE | **Espressif ESP32-S3FH4R2** (QFN-56 7×7, 4 MB flash + 2 MB PSRAM in-package) | 1 | $3.00 ✓ | [LCSC C3013940](https://www.lcsc.com/product-detail/C3013940.html) · [DigiKey](https://www.digikey.com/en/products/detail/espressif-systems/ESP32-S3FH4R2/17887524) | LCSC ≈ $4.29 @1, ≈ $2.76 @1k |
| 1b | MCU module (EVT only) | ESP32-S3-MINI-1-N4R2 (pre-certified) | 1 | $3.90 ~ | [DigiKey search](https://www.digikey.com/en/products/result?keywords=ESP32-S3-MINI-1-N4R2) | 2.4 mm tall → EVT "fat" body only |
| 2 | Crystal | 40 MHz, 2016 package, ±10 ppm | 1 | $0.15 ~ | [LCSC search](https://www.lcsc.com/search?q=40MHz%202016%20crystal) | |
| 3 | Antenna | 2.4 GHz chip antenna, ≤ 0.5 mm z (or printed IFA on PCB) | 1 | $0.40 ~ | [DigiKey search](https://www.digikey.com/en/products/result?keywords=2.4GHz%20chip%20antenna) | Must sit under glass, not steel (R1) |
| 4 | **Display** | **Sharp LS011B7DH03** memory LCD, 1.08", 160×68, 32.0 × 14.0 × 0.745 mm | 1 | $12.00 ~ | [DigiKey](https://www.digikey.com/en/products/detail/sharp-microelectronics/LS011B7DH03/25953418) · [Avnet](https://embedded.avnet.com/product/ls011b7dh03) | Outline ✓ (Sharp lineup); µW hold, sunlight-readable, pager feel |
| 5 | **Camera** | GC0308 0.3 MP DVP module on FPC (OV2640 alt.), low-z lens | 1 | $5.00 ~ | [GC0308 DVP module](https://www.cameramodule.com/fpc-camera-module/dvp-camera-module/gc0308-sensor-dvp-camera-module.html) · [Arducam OV2640 mini](https://www.arducam.com/product/arducam-ov2640-camera-module-2mp-mini-ccm-compact-camera-modules-compatible-with-arduino_m0031esp32-esp8266-development-board-with-dvp-24-pin-interface_/) | z-height not published — request drawing (R2) |
| 6 | **Weather / air (AI)** | **Bosch BME688** T/H/P/gas, BSEC2 AI gas classes, 3 × 3 × 0.93 mm | 1 | $7.50 ~ | [DigiKey search](https://www.digikey.com/en/products/result?keywords=BME688) | Needs side vent + membrane |
| 7 | Motion (AI feature engine) | Bosch BMI270 6-axis IMU | 1 | $2.50 ~ | [DigiKey search](https://www.digikey.com/en/products/result?keywords=BMI270) | Flip-to-silence, tap |
| 8 | Ambient light | Lite-On LTR-303ALS-01 | 1 | $0.60 ~ | [DigiKey search](https://www.digikey.com/en/products/result?keywords=LTR-303ALS-01) | Night mode |
| 9 | RTC + 1 Hz VCOM clock | Micro Crystal RV-3028-C7 (≈45 nA) | 1 | $2.40 ~ | [DigiKey search](https://www.digikey.com/en/products/result?keywords=RV-3028-C7) | CLKOUT → LCD EXTCOMIN |
| 10 | **Qi receiver + charger** | TI **BQ51050B** (Qi RX + Li-ion charger, 4.2 V) | 1 | $3.50 ~ | [TI product page](https://www.ti.com/product/BQ51050B) · [DigiKey search](https://www.digikey.com/en/products/result?keywords=BQ51050B) | Single-chip wireless charger |
| 11 | Qi receive coil | Ø 20 mm thin FPC/wound coil with ferrite, ≈ 0.5 mm | 1 | $2.00 ~ | [Würth WE-WPCC search](https://www.digikey.com/en/products/result?keywords=wireless%20power%20receiver%20coil%2020mm) | Tune with BQ51050B design tool |
| 12 | Buck 3.3 V | TI TPS62840 (60 nA Iq) | 1 | $1.00 ~ | [TI product page](https://www.ti.com/product/TPS62840) | |
| 13 | Fuel gauge | Analog Devices MAX17048 | 1 | $1.50 ~ | [DigiKey search](https://www.digikey.com/en/products/result?keywords=MAX17048G%2BT10) | |
| 14 | Battery | LiPo ≈ 100 mAh, ≤ 2.0 mm thick, ≈ 25 × 30 mm, with PCM + NTC | 1 | $2.50 ~ | [LCSC search](https://www.lcsc.com/search?q=lipo%20battery%20100mAh) | Order UN38.3 certified cells |
| 15 | COPY button | Side-/top-actuated tactile switch, ≤ 0.6 mm (e.g. Panasonic EVP-AK series) | 1 | $0.30 ~ | [DigiKey search](https://www.digikey.com/en/products/result?keywords=EVP-AKE31A) | Actuated by steel button cap |
| 16 | ESD / TVS | TPD1E10B06 on button + antenna | 2 | $0.20 ~ | [DigiKey search](https://www.digikey.com/en/products/result?keywords=TPD1E10B06) | |
| 17 | Passives | 0201/0402 R/C/L, ≈ 45 pcs | 1 set | $0.80 ~ | — | |
| 18 | Program/test pads | Tag-Connect TC2030 footprint (no part on board) | — | $0.00 | [Tag-Connect](https://www.tag-connect.com/) | One cable for the jig ≈ $40 |
| | **Electronics subtotal** | | | **≈ $45** | | |

## B · PCB + assembly (PCBWay, per unit @100)

| Item | Spec | Unit @100 | Link |
|------|------|-----------|------|
| Bare PCB | 4-layer, 0.6 mm FR-4, ENIG, 36 × 36 mm, camera cut-out, 50 Ω RF line | $3.00 ~ | [PCBWay PCB order](https://www.pcbway.com/orderonline.aspx) |
| PCBA (turnkey) | SMT both sides, QFN X-ray, stencil, parts sourced by PCBWay or consigned | $12.00 ~ | [PCBWay assembly](https://www.pcbway.com/pcb-assembly.html) |

## C · Mechanical (per unit @100)

| Item | Spec | Unit @100 | Link |
|------|------|-----------|------|
| Front frame | 316L stainless, CNC, bead-blast or brushed, glass pocket, button bore, vent | $18.00 ~ | [PCBWay CNC machining](https://www.pcbway.com/rapid-prototyping/cnc-machining/) |
| Back plate | 316L stainless, CNC, **#8 mirror polish**, laser-etched LOT mark inside | $14.00 ~ | same |
| Button cap | 316L, Ø 4 mm, polished | $1.50 ~ | same |
| Cover glass | 0.4 mm chemically strengthened, custom cut, black ink mask, AR optional | $3.00 ~ | custom glass vendor (quote) |
| Vent membrane | ePTFE adhesive vent, Ø 3 mm | $0.50 ~ | [Gore vents](https://www.gore.com/products/categories/venting) |
| Fasteners / adhesive | 4 × M1.2 Torx screws or 3M VHB ring + gasket | $0.60 ~ | — |
| **Mechanical subtotal** | | **≈ $38** | |

## D · Charger + packaging

| Item | Spec | Unit @100 | Link |
|------|------|-----------|------|
| Qi pad | Off-the-shelf certified Qi 5–15 W pad (S1 baseline) | $10.00 ~ | buy retail/wholesale |
| — or LOT puck | Custom stainless puck housing + Qi TX module (S3 option) | $22.00 ~ | 08-CHARGER |
| Box + insert + printed quick-start | Rigid box, foam, 1 card | $3.00 ~ | — |

## E · Totals

| | Per unit | × 100 |
|---|---|---|
| Electronics (A) | $45 | $4,500 |
| PCB + PCBA (B) | $15 | $1,500 |
| Mechanical (C) | $38 | $3,800 |
| Charger + packaging (D, Qi pad) | $13 | $1,300 |
| **Variable cost** | **≈ $111** | **≈ $11,100** |
| One-time: stencils, CNC fixtures, glass tooling, test jig | | ≈ $3,500 |
| One-time: FCC + CE (only if chip-down radio ships) | | ≈ $10,000–20,000 |
| Shipping, duties, 10 % spares | | ≈ $1,500 |
| **Programme total (no cert / with cert)** | | **≈ $16 k / ≈ $26–36 k** |

## F · Prototype shopping list (P0 breadboard — order this week)

| Qty | Item | Why |
|-----|------|-----|
| 3 | ESP32-S3-DevKitC-1 (N8R2 or N4R2) | runs `env:lot-pager-devkit` |
| 3 | Sharp memory LCD breakout (LS011B7DH03 or 1.3" LS013B7DH05 breakout) | screen bring-up |
| 3 | BME688 breakout | sensor + BSEC2 |
| 1 | BQ51050B EVM + any Qi pad | wireless charging + metal-plate test (R1) |
| 2 | GC0308 + OV2640 FPC modules | measure real z-height (R2) |
| 3 | 100 mAh LiPo cells | power budget |
| 1 | Nordic PPK2 power profiler | sleep-current measurement |
| 1 | Tag-Connect TC2030-USB/JTAG cable | programming pads |
