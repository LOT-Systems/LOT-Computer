# LOT SQ-1 — Components Buying List (BOM v0.1)

**Document:** LOT-SQ1-02 · **Version:** 0.1 · **Date:** 2026-11-15

> **Pricing note.** All prices are planning estimates in USD at a quantity of about 100, based on typical 2025–2026 distributor pricing. Distributor sites could not be reached from this session (blocked by the network policy), so the **links are search URLs** that will not go stale. Confirm stock, price and the exact orderable suffix before you place a PO. Rows marked **VERIFY** have a size or height that must be checked against the datasheet before the layout is frozen.

## A. Electronics (per unit)

| Ref | Function | Part (primary) | Alt | Package / size | Est. $ | Buy |
|---|---|---|---|---|---|---|
| U1 | MCU + Wi-Fi/BLE | **Espressif ESP32-S3R8** (8 MB PSRAM in package) | ESP32-S3-MINI-1-N8R8 module (EVT; 2.4 mm tall) | QFN56 7×7 | 3.20 | [LCSC](https://www.lcsc.com/search?q=ESP32-S3R8) · [DigiKey](https://www.digikey.com/en/products/result?keywords=ESP32-S3R8) |
| U2 | Flash 8 MB QSPI | Winbond W25Q64JW (1.8 V) / W25Q64JV (3.3 V) | GD25Q64 | USON-8 2×3 | 0.45 | [LCSC](https://www.lcsc.com/search?q=W25Q64JV) |
| Y1 | 40 MHz crystal | 2016-size 40 MHz, ±10 ppm | | 2.0×1.6 | 0.25 | [LCSC](https://www.lcsc.com/search?q=40MHz%202016) |
| ANT1 | 2.4 GHz antenna | Chip antenna, 2.4 GHz (e.g. Johanson 2450AT series) **VERIFY** | PCB IFA | ~3.2×1.6 | 0.40 | [DigiKey](https://www.digikey.com/en/products/result?keywords=2450AT%20chip%20antenna) |
| U3 | Weather + gas AI | **Bosch BME688** | BME680 | LGA 3×3×0.93 | 10.50 | [DigiKey](https://www.digikey.com/en/products/result?keywords=BME688) · [Mouser](https://www.mouser.com/c/?q=BME688) |
| U4 | IMU + ML core | **ST LSM6DSOX** | LSM6DSO / BMI270 | LGA-14 2.5×3×0.83 | 3.60 | [DigiKey](https://www.digikey.com/en/products/result?keywords=LSM6DSOX) |
| U5 | Qi Rx + Li-ion charger | **TI BQ51050B** | BQ51003 + BQ25180 | DSBGA / QFN | 3.10 | [TI](https://www.ti.com/product/BQ51050B) · [DigiKey](https://www.digikey.com/en/products/result?keywords=BQ51050B) |
| L1 | Qi receiver coil | Small wearable Rx coil ~Ø20–25 mm, ≤0.5 mm with ferrite **VERIFY** | Würth WE-WPCC wearable series | Ø≤25 | 3.00 | [DigiKey](https://www.digikey.com/en/products/result?keywords=wireless%20charging%20receiver%20coil%20wearable) |
| — | Ferrite shield sheet | 0.1–0.2 mm NFC/WPC ferrite sheet | | die-cut 30×30 | 0.40 | [DigiKey](https://www.digikey.com/en/products/result?keywords=ferrite%20sheet%20wireless%20charging) |
| U6 | 3.3 V buck | **TI TPS62840** (60 nA Iq) | TPS62743 | WCSON / DSBGA | 1.10 | [TI](https://www.ti.com/product/TPS62840) |
| U7 | Fuel gauge | **Analog Devices MAX17048** | MAX17260 | WLP / TDFN | 1.60 | [DigiKey](https://www.digikey.com/en/products/result?keywords=MAX17048) |
| BT1 | Battery | Ultra-thin Li-Po, 1.5–2.0 mm, 30×30 mm class, 80–120 mAh, with PCM **VERIFY** | Custom cell (MOQ 500+) | pouch | 4.50 | [Alibaba search](https://www.alibaba.com/trade/search?SearchText=ultra%20thin%20lipo%20battery%201.5mm) |
| DS1 | Display | **Good Display 1.54" e-paper 200×200 (SSD1681), e.g. GDEY0154D67** | Waveshare 1.54" V2 panel | 37.3×31.8×~1.0 | 6.50 | [Good Display](https://www.good-display.com/) · [Waveshare](https://www.waveshare.com/search?q=1.54%20e-paper%20raw) |
| — | EPD booster | Inductor 10 µH + MOSFET + 3× Schottky + caps (reference circuit) | | 0402/SOD-523 | 0.50 | [LCSC](https://www.lcsc.com/search?q=SOD-523%20schottky) |
| J1 | EPD FPC | 24-pin 0.5 mm FPC, ≤1.0 mm tall | Hirose FH34SRJ class | | 0.35 | [LCSC](https://www.lcsc.com/search?q=FPC%2024P%200.5mm%201.0mm) |
| CAM1 | Camera | Thin VGA DVP module, **GC0308 / GC032A class, ≤3.5 mm Z** **VERIFY** | OV2640 (too tall; EVT only) | ~6×6 | 5.00 | [Alibaba search](https://www.alibaba.com/trade/search?SearchText=GC0308%20camera%20module%20thin) |
| J2 | Camera FPC | 24-pin 0.5 mm FPC (or hot-bar) | | | 0.35 | [LCSC](https://www.lcsc.com/search?q=FPC%2024P%200.5mm) |
| SW1 | COPY button | Ultra-low-profile tact, ≤1.9 mm (C&K KMR2 class) under a stainless key cap | Capacitive touch on an isolated steel disc | 4.2×2.8 | 0.60 | [DigiKey](https://www.digikey.com/en/products/result?keywords=KMR2) |
| M1 | Vibration | Coin ERM Ø8×2.0 mm (pager buzz) **VERIFY** | LRA Ø8 + DRV2603 | Ø8 | 1.20 | [DigiKey](https://www.digikey.com/en/products/result?keywords=coin%20vibration%20motor%208mm) |
| Q1 | Motor driver | N-MOSFET SOT-723 + flyback diode | | | 0.10 | [LCSC](https://www.lcsc.com/search?q=SOT-723%20N-MOSFET) |
| D1 | Camera privacy dot | 0402 white LED, hard-wired to camera power | | 0402 | 0.05 | [LCSC](https://www.lcsc.com/search?q=0402%20white%20LED) |
| ESD | ESD on button / pogo | TI TPD1E10B06 ×3 | | 0402 | 0.30 | [DigiKey](https://www.digikey.com/en/products/result?keywords=TPD1E10B06) |
| TP | Programming pads | USB D+/D−, EN, IO0, 3V3, GND test pads (pogo jig) | | | 0.00 | — |
| — | Passives | ~45× 0201/0402 R/C, RF matching π-network | | | 0.90 | [LCSC](https://www.lcsc.com/) |
| | | | | **Electronics subtotal** | **≈ 48** | |

## B. PCB & assembly (PCBWay)

| Item | Spec | Est. $ / unit @100 | Link |
|---|---|---|---|
| PCB | 4-layer, **0.6 mm**, 1 oz, ENIG, 0.1 mm trace/space, blind vias optional, Ø16 mm camera/battery cut-outs | 6–12 | [PCBWay PCB quote](https://www.pcbway.com/orderonline.aspx) |
| PCBA | Turnkey (PCBWay sources parts), 0201 capable, X-ray for QFN/LGA, double-sided | 12–20 | [PCBWay Assembly](https://www.pcbway.com/pcb-assembly.html) |
| Stencil / test jig | Steel stencil + pogo fixture (NRE) | NRE $150–400 | same |

## C. Mechanical (PCBWay CNC)

| Item | Material / finish | Est. $ / unit @100 | Link |
|---|---|---|---|
| Front frame (part 1) | 316L, CNC, bead-blast or brushed, glass pocket | 18–30 | [PCBWay CNC](https://www.pcbway.com/rapid-prototyping/cnc-machining/) |
| Back plate (part 2) | 316L, CNC 0.4–0.5 mm, **mirror polish #8**, laser-etched mark + serial | 12–25 | same |
| Cover glass | 0.4 mm chemically strengthened glass + AR + AF coating, printed black mask | 3–6 (MOQ) | [Alibaba search](https://www.alibaba.com/trade/search?SearchText=custom%200.4mm%20cover%20glass%20AR%20AF) |
| Seam gasket | 0.15 mm PET/polyimide die-cut isolator (RF slot + insulation) | 0.30 | — |
| Fasteners | 4× M1.2 × 2.5 mm stainless torx | 0.40 | [Misumi search](https://us.misumi-ec.com/vona2/result/?Keyword=M1.2%20screw) |
| Micro-vent | Sintered SS / ePTFE vent for BME688 port (Ø1.0 mm) | 0.50 | [DigiKey](https://www.digikey.com/en/products/result?keywords=ePTFE%20vent%20adhesive) |
| Adhesives | PSA for display / battery, OCA for glass | 0.60 | — |

## D. LOT Dock (charger)

| Item | Spec | Est. $ | Link |
|---|---|---|---|
| Qi Tx module | 5 W Qi transmitter board, USB-C in (off the shelf) | 4–7 | [DigiKey](https://www.digikey.com/en/products/result?keywords=Qi%20transmitter%20module) |
| Dock body | CNC aluminium or 316L puck with a 40.4×40.4 mm cradle, face-down seating | 10–18 | [PCBWay CNC](https://www.pcbway.com/rapid-prototyping/cnc-machining/) |
| Cable | USB-C to USB-C 1 m, braided | 2.00 | — |

## E. Packaging & print

| Item | Est. $ |
|---|---|
| Rigid box + foam insert | 3–5 |
| Printed Quick Start card (from manuals/07) | 0.40 |

## F. Roll-up per unit at 100

| Block | Low | High |
|---|---|---|
| Electronics | 44 | 55 |
| PCB + PCBA | 18 | 32 |
| Mechanical | 35 | 63 |
| Dock | 16 | 27 |
| Packaging | 3.5 | 5.5 |
| **Unit cost** | **≈ $117** | **≈ $183** |

**One-time NRE** (see 08): prototypes (3 EVT spins) $3–6k · FCC Part 15 (module route, SDoC) $2–4k, or chip-down 15.247 intentional radiator $8–15k · Qi compliance optional · drop and IP tests $1–2k.
