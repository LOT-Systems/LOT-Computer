# LOT COMPUTER — Bill of Materials & Sourcing (v1, 40×40×~9 mm)

Doc ID: LOT-HW-02 · Rev A · 2026-10-20
**Prices are rough estimates from memory of typical 2025–26 market pricing; not live quotes. Links are manufacturer/distributor search or product pages; verify part availability before ordering.**

## 1. Core electronics

| # | Item | Part (preferred) | Qty/unit | Est. unit $ @100 | Source link |
|---|---|---|---|---|---|
| 1 | MCU module | Espressif ESP32-S3-WROOM-1-N16R8 | 1 | 5.5 | https://www.espressif.com/en/products/modules |
| 2 | Display | 1.54" IPS 240×240 ST7789 (≈ 31.5×33 mm) | 1 | 4–7 | https://www.aliexpress.com/w/wholesale-1.54-inch-ST7789.html |
| 3 | Camera | OV2640 2MP DVP module (fits 40 mm; thin FPC) | 1 | 3–5 | https://www.aliexpress.com/w/wholesale-OV2640-camera-module.html |
| 4 | Weather/AI gas | Bosch BME688 (T/H/P + gas, BSEC AI) | 1 | 8–10 | https://www.bosch-sensortec.com/products/environmental-sensors/gas-sensors/bme688/ |
| 5 | Weather (low-cost alt) | Bosch BME280 | alt | 2.5 | https://www.bosch-sensortec.com/products/environmental-sensors/humidity-sensors-bme280/ |
| 6 | VOC/NOx (optional) | Sensirion SGP41 | opt | 7 | https://sensirion.com/products/catalog/SGP41 |
| 7 | IMU (tap/orientation) | Bosch BMI270 or ST LSM6DSO | opt | 2–3 | https://www.bosch-sensortec.com/products/motion-sensors/imus/bmi270/ |
| 8 | Qi receiver IC | TI BQ51013B (5 V, ≤ 1 A) | 1 | 2.5 | https://www.ti.com/product/BQ51013B |
| 9 | Qi RX coil | Würth 760308101208-class (≈ 20 mm, thin) + ferrite sheet | 1 | 2–3 | https://www.we-online.com/en/components/products/WPCC_WIRELESS_POWER_CHARGING_COIL |
| 10 | LiPo charger | TI BQ25185 or Microchip MCP73831 | 1 | 0.8–1.5 | https://www.ti.com/product/BQ25185 |
| 11 | 3.3 V buck-boost/LDO | TPS63802 / AP2112K-3.3 | 1 | 0.5–1.5 | https://www.ti.com/product/TPS63802 |
| 12 | Battery | LiPo ≈ 3.7 V 250–350 mAh, ≤ 3.0 mm thick (e.g., 303040-class) | 1 | 3–4 | https://www.aliexpress.com/w/wholesale-303040-lipo.html |
| 13 | Button | Low-profile tactile 3×3 mm or piezo/capacitive under steel | 1 | 0.1–0.5 | https://www.digikey.com/en/products/filter/tactile-switches/197 |
| 14 | Status LED (camera indicator) | 0402 RGB LED | 1 | 0.1 | https://www.digikey.com |
| 15 | Passives, connectors, USB-C (service pads or 16-pin) | – | – | 2–4 | – |
| 16 | PCB | 4-layer, 0.8 mm, ENIG, ~38×38 mm | 1 | 2–4 | https://www.pcbway.com |
| 17 | SMT assembly | PCBWay Turnkey Assembly | 1 | 6–12 | https://www.pcbway.com/pcb-assembly.html |

Electronics estimate: **~ 55–85 / unit at 100 pcs** parts + ~ 8–16 PCB/assembly = **≈ 65–100**, plus 20–30 % contingency → ≈ 95–150.

## 2. Body & materials

| Item | Spec | Est. $ @100 | Source |
|---|---|---|---|
| Front body (screen/cam/button side) | 316L, 0.8–1.0 mm wall, CNC or deep-draw, openings for window, lens, button | 20–40 | PCBWay CNC: https://www.pcbway.com/cnc-machining-quote.html |
| Back body (polished mirror side) | 316L plate, #8 mirror/BA finish, **Qi window cut-out** | 15–35 | PCBWay or Xometry: https://www.xometry.com |
| Qi window | Zirconia ceramic / PEEK / Gorilla-type glass disk 26 mm × 0.6 mm | 3–8 | custom |
| Display window | Sapphire or chem-strengthened glass 0.5 mm, AR coating | 2–5 | custom |
| Camera lens window | AR-coated glass 6 mm | 1 | custom |
| Gasket + adhesive | silicone/ PSA, IP54 target | 1 | – |
| Screws | M1.2 torx, 4× | 0.6 | – |

Note: **316L** is preferred (corrosion-resistant, mostly non-magnetic); 304 acceptable.

## 3. Charger (separate product)
Qi pad, 5 W, 40×40×5 mm silver (the "flat silver square" under reading (c) in 01 §3 R1). Reference ICs: Renesas P9242/ P9221 TX or off-the-shelf low-profile Qi TX pad 3–5 W (retail 8–12). Alternative for v1: ship a standard Qi pad + USB-C cable (cost ≈ 8–12).

## 4. Dev kit (week 1 purchase, ≈ $120)
- ESP32-S3 camera dev board (e.g., Freenove ESP32-S3-WROOM CAM or Seeed XIAO ESP32S3 Sense) — https://www.seeedstudio.com/XIAO-ESP32S3-Sense-p-5639.html
- 1.54" ST7789 display, BME688 breakout (Adafruit 5046 / Pimoroni), Qi RX module + LiPo, tact button, Qi pad.
- Adafruit BME688 breakout: https://www.adafruit.com/product/5046

## 5. Test equipment
USB-C logic analyzer, multimeter, Qi power-meter (e.g., USB-C meter), 2.4 GHz spectrum check (NanoVNA for antenna tuning).

## 6. PCBWay ordering checklist
1. Upload Gerber + BOM (CSV: designator, MPN, qty) + Pick&Place.
2. Choose: 4-layer, 0.8 mm, ENIG, green/black mask, impedance control not needed (DVP at 24 MHz; keep traces short).
3. Assembly: Turnkey; choose consigned or PCBWay-sourced parts; request DFM review for 0201/ 0402 and BME688 LGA.
4. First order: 5 PCBs assembled (proto); second: 20 (EVT); third: 100 (pilot). Request X-ray for BGA/LGA if any.
5. Keep panel: 2×N array with tabs; fiducials; test pads for pogo-pin programming jig.

## 7. 100-unit cost summary (estimate)

| Line | Low | High |
|---|---|---|
| Electronics + PCB + assembly | 6,500 | 10,000 |
| Steel body (2 parts) + windows | 4,000 | 8,000 |
| Battery, gasket, screws, packaging | 800 | 1,500 |
| Tooling/ fixtures/ NRE | 3,000 | 8,000 |
| Test jig + QC labor | 500 | 1,500 |
| Contingency 20 % | 3,000 | 6,000 |
| **Total (≈)** | **~18,000** | **~35,000** |

Re-quote everything before committing.
