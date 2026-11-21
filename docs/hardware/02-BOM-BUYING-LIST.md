<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LD-01 · Components Buying List (BOM)

**Document:** LD-01-DOC-02 · Rev A · 2026-11-21

> **Read before ordering.** Part numbers are *candidates* picked from public datasheets. Prices are
> Nov-2026 **estimates** for budgeting, not quotes. Stock and prices were not checked live this
> session because the cloud session had no distributor access. Most links are distributor
> **search** URLs, so they still work when a SKU changes. Check the datasheet, footprint and Z-height
> of every line before you release the BOM to PCBWay.

---

## A. Proto-A: bench prototype from dev boards (buy now, about $160 per kit)

Proto-A proves the full software loop (site → device → Log) on a desk before any custom PCB.
Buy **3 kits**.

| # | Item | Why | Qty/kit | Est. $ | Link |
|---|------|-----|---------|--------|------|
| A1 | Seeed Studio XIAO ESP32S3 **Sense** (ESP32-S3 + OV2640 camera + mic) | Same MCU family as production, camera included, 21 × 17.5 mm | 1 | 14 | https://www.seeedstudio.com/XIAO-ESP32S3-Sense-p-5639.html |
| A2 | Adafruit SHARP Memory Display breakout 1.3" 168 × 144 | Same display technology as production (µW static image) | 1 | 25 | https://www.adafruit.com/product/3502 |
| A3 | BME688 breakout (Adafruit or Pimoroni) | Weather + gas, AI-Studio capable | 1 | 20 | https://www.adafruit.com/search?q=BME688 |
| A4 | BHI260AP / BMI270 breakout | Tap, lift and gesture | 1 | 15 | https://www.digikey.com/en/products/result?keywords=BHI260AP%20shuttle |
| A5 | Qi receiver module, 5 V | Proves wireless charging | 1 | 10 | https://www.adafruit.com/search?q=qi+receiver |
| A6 | Qi charging pad, 5–10 W | Charger | 1 | 15 | any certified Qi pad |
| A7 | LiPo 3.7 V 100–150 mAh, JST | Battery | 1 | 6 | https://www.adafruit.com/search?q=lipo+100mAh |
| A8 | DRV2605L haptic driver breakout + coin LRA | Pager tick | 1 | 12 | https://www.adafruit.com/search?q=DRV2605L |
| A9 | Tactile switch (6 × 6) + cap | Copy button | 2 | 1 | — |
| A10 | Breadboard, jumpers, USB-C cable | — | 1 | 10 | — |
| A11 | Himax HM0360 eval / module | Tests the production camera | 1 per 3 kits | 30 | https://www.digikey.com/en/products/result?keywords=HM0360 |
| | **Kit total (approx.)** | | | **≈ $160** | |

---

## B. Production BOM (EVT/DVT/PVT, per unit, 100-unit pricing)

### B1. Electronics

| Ref | Function | Candidate P/N | Package / Z | Est. $ @100 | Link |
|-----|----------|---------------|-------------|-------------|------|
| U1 | MCU + Wi-Fi/BLE, **FCC/CE pre-certified** | Espressif **ESP32-S3-MINI-1-N4R2** | 15.4 × 20.5 × 2.4 mm | 3.80 | https://www.digikey.com/en/products/result?keywords=ESP32-S3-MINI-1-N4R2 |
| U2 | Qi receiver + Li-ion charger (one IC) | TI **BQ51050B** | VQFN-20 4 × 3.5 | 2.90 | https://www.ti.com/product/BQ51050B |
| L1 | Qi Rx coil, flat, ~30 mm, with ferrite | Würth WE-WPCC receiver series (choose ≤ 0.6 mm) | ≤ 0.6 mm | 3.50 | https://www.digikey.com/en/products/result?keywords=wireless%20charging%20receiver%20coil%20wurth |
| U3 | Ultra-low-Iq buck, 3.3 V | TI **TPS62840** | 1.5 × 2 WCSP | 1.10 | https://www.ti.com/product/TPS62840 |
| U4 | Fuel gauge | TI **BQ27427** or MAX17048 | ~1.6 × 2 | 1.20 | https://www.digikey.com/en/products/result?keywords=MAX17048 |
| U5 | Weather + gas (AI) | Bosch **BME688** | 3 × 3 × 0.93 LGA | 8.50 | https://www.bosch-sensortec.com/products/environmental-sensors/gas-sensors/bme688/ |
| U6 | Self-learning AI IMU | Bosch **BHI260AP** | 2.5 × 2.5 × ? LGA | 6.50 | https://www.bosch-sensortec.com/products/smart-sensor-systems/bhi260ap/ |
| U7 | Camera, AI low-power VGA | Himax **HM0360** module (≤ 3.0 mm with lens) | module | 6.00 | https://www.himax.com.tw/products/cmos-image-sensor/always-on-vision-sensors/ |
| U8 | Haptic driver | TI **DRV2605L** | 2 × 2 | 1.30 | https://www.ti.com/product/DRV2605L |
| M1 | Haptic actuator, flat LRA / coin ERM ≤ 2.5 mm | Vybronics / Precision Microdrives thin coin | Ø8 × 2.5 | 1.50 | https://www.digikey.com/en/products/result?keywords=coin%20vibration%20motor%202.5mm |
| DS1 | Display, 1.28" 128 × 128 memory LCD, square | Sharp **LS013B7DH03** | ~0.7 mm panel | 11.00 | https://www.digikey.com/en/products/result?keywords=LS013B7DH03 |
| SW1 | Copy button, low-profile tact | C&K **KMR2** series (1.9 mm) | 4.2 × 2.8 × 1.9 | 0.40 | https://www.digikey.com/en/products/result?keywords=KMR221G |
| BT1 | LiPo cell, custom thin, ~100 mAh, PCM + NTC | e.g. 202030 / 162530 class | 1.6–2.0 mm | 3.00 | PCBWay or Grepow quote |
| J1 | 6-pin pogo/test pads (UART+EN+IO0) for flashing | pads only | 0 | 0.00 | — |
| — | Passives, ESD (TPD1E10B06), MLCCs, crystal (inside module) | — | — | 1.50 | — |
| **PCB** | 4-layer, 0.6 mm FR-4 or flex-rigid, ENIG, 38 × 38 mm | PCBWay | | 4.00 (rigid) / 12.00 (flex-rigid) | https://www.pcbway.com/orderonline.aspx |
| **PCBA** | Turnkey assembly, both sides, X-ray for LGA | PCBWay | | 9.00 | https://www.pcbway.com/pcb-assembly.html |
| | **Electronics subtotal** | | | **≈ $65–75** | |

### B2. Mechanical (see doc 03)

| Item | Spec | Est. $ @100 | Link |
|------|------|-------------|------|
| Part A: back shell | 316L, CNC, **mirror polish #8**, laser-etched LOT mark inside | 22–35 | https://www.pcbway.com/rapid-prototyping/cnc-machining/ |
| Part B: front bezel ring | 316L, CNC, bead-blast/brushed, 4 × M1.0 or snap | 14–20 | same |
| Front window | 0.55 mm chemically strengthened glass (or sapphire, +$12), AR + AF coat, black mask print, camera hole open | 4–8 | glass supplier / PCBWay quote |
| Button cap | 316L, Ø3.5 mm, through bezel | 2 | CNC with the shells |
| Gaskets / adhesive | 3M 9474LE die-cut, PSA for glass | 1 | — |
| Vent | ePTFE membrane for BME688 port (Ø1.0 mm hole in bezel) | 0.80 | https://www.digikey.com/en/products/result?keywords=ePTFE%20vent%20adhesive |
| Fasteners | M1.0 × 2.5 stainless Torx ×4 | 0.40 | — |
| | **Mechanical subtotal** | **≈ $45–70** | |

### B3. Box, charger, docs

| Item | Est. $ @100 |
|------|-------------|
| Qi pad, 5 W, certified, white-label, microfiber top | 6–9 |
| USB-C cable | 1 |
| Rigid box, foam insert, printed quick-start card (QR → PDF manual) | 4–6 |
| **Subtotal** | **≈ $11–16** |

### B4. Per-unit landed estimate (100 units)

| Bucket | Low | High |
|--------|-----|------|
| Electronics | 65 | 75 |
| Mechanical | 45 | 70 |
| Packaging + charger | 11 | 16 |
| Freight + duty (estimate) | 6 | 12 |
| **Per unit** | **$127** | **$173** |
| **100 units** | **$12.7k** | **$17.3k** |

One-time NRE (not included above): stencils and fixtures (~$300), polishing setup, Part 15B
emissions pre-scan + report (~$2–4k at a US lab, with the modular Wi-Fi grant reused), UN38.3
battery transport docs (supplier provides them), and the 3 Proto-A kits (~$480).
