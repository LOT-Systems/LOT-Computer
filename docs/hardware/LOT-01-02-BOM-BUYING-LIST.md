<!--
  LOT SYSTEMS CORPORATION
  Made in the USA | brand.lot-systems.com
-->

```
================================================================================
LOT-01 — COMPONENTS BUYING LIST (BOM) + 100-UNIT COSTING
================================================================================
DOCUMENT    HW-02 / BOM
ISSUE       2026.11.12 · REV A
CURRENCY    USD, planning estimates at qty 100–110
NOTE        Supplier sites were unreachable this session. Prices are
            estimates from known market ranges. Verify price + stock
            before every order. Machine-readable copy:
            hardware/bom/LOT-01-BOM-revA.csv
================================================================================
```

## A · PROTOTYPE KIT (phase P1 — buy this first, ×3 sets)

Off-the-shelf boards to prove the full loop (notification → screen, COPY →
Log tab, weather → server, camera frame → server) before any custom PCB.

| # | Part                                   | Role                         | Est. $ | Link (verify) |
|---|----------------------------------------|------------------------------|--------|---------------|
| 1 | Seeed Studio XIAO ESP32S3 Sense         | MCU + camera + 8 MB PSRAM     | 14     | https://www.seeedstudio.com/XIAO-ESP32S3-Sense-p-5639.html |
| 2 | Adafruit SHARP Memory Display 1.3" 168×144 | Screen (same family as product) | 25 | https://www.adafruit.com/product/3502 |
| 3 | Adafruit BME688 breakout                | Weather + air (AI gas)        | 20     | https://www.adafruit.com/product/5046 |
| 4 | SparkFun 6DoF IMU BMI270 (Qwiic)        | Motion / wake gesture         | 18     | https://www.sparkfun.com/products/22397 |
| 5 | Adafruit Universal Qi Receiver Module   | Wireless charge test          | 15     | https://www.adafruit.com/product/1901 |
| 6 | Adafruit Qi Wireless Charging Transmitter 5V | Dock stand-in            | 30     | https://www.adafruit.com/product/2162 |
| 7 | LiPo 3.7 V 150 mAh                       | Battery                       | 6      | https://www.adafruit.com/product/1317 |
| 8 | Vibrating mini motor disc               | Pager buzz                    | 2      | https://www.adafruit.com/product/1201 |
| 9 | 6 mm tactile switch + jumper wires + perfboard | COPY button            | 5      | any |
|   | **Per set ≈ US$ 135 · ×3 sets ≈ US$ 405** |                            |        | |

## B · PRODUCTION BOM — DEVICE (per unit, qty 110)

| Ref | Part (manufacturer P/N)                         | Package / size              | Qty | Est. $ | Link (verify) |
|-----|-------------------------------------------------|-----------------------------|-----|--------|---------------|
| U1  | Espressif **ESP32-S3-PICO-1-N8R2** (SiP: MCU + 8 MB flash + 2 MB PSRAM + crystal) | LGA 7.0 × 7.0 × 1.0 mm | 1 | 3.60 | https://www.espressif.com/en/products/socs/esp32-s3 |
| ANT | Johanson **2450AT18A100** 2.4 GHz chip antenna   | 0603-size, 1.6 × 0.8 mm     | 1   | 0.45   | https://www.digikey.com/en/products/result?keywords=2450AT18A100 |
| DS1 | Sharp **LS013B7DH03** 1.28" memory-in-pixel LCD, 128 × 128, reflective | ~ 0.75 mm thick (verify) | 1 | 10.00 | https://www.digikey.com/en/products/result?keywords=LS013B7DH03 |
| CAM | GalaxyCore **GC0308** VGA camera, FPC module, ≤ 3.0 mm Z | 6 × 6 mm class | 1 | 3.00 | https://www.lcsc.com/search?q=GC0308 |
| U2  | Bosch **BME688** gas / T / RH / P sensor (AI-Studio) | LGA 3.0 × 3.0 × 0.93 mm   | 1   | 8.50   | https://www.bosch-sensortec.com/products/environmental-sensors/gas-sensors/bme688/ |
| U3  | Bosch **BMI270** 6-axis IMU                     | LGA 2.5 × 3.0 × 0.83 mm     | 1   | 2.40   | https://www.bosch-sensortec.com/products/motion-sensors/imus/bmi270/ |
| U4  | TI **BQ51050B** Qi receiver + Li-ion charger     | DSBGA / VQFN                | 1   | 2.60   | https://www.ti.com/product/BQ51050B |
| L1  | Würth **WE-WPCC** Qi receiver coil, ≤ 25 mm, ≤ 0.6 mm, with ferrite (pick from series) | flat | 1 | 3.20 | https://www.we-online.com/en/components/products/WE-WPCC |
| U5  | TI **TPS62840** buck 3.3 V, 750 mA, 60 nA Iq     | WSON / DSBGA                | 1   | 1.20   | https://www.ti.com/product/TPS62840 |
| U6  | Analog Devices **MAX17048** fuel gauge           | WLP 0.9 × 1.7 mm            | 1   | 1.80   | https://www.analog.com/en/products/max17048.html |
| BT1 | LiPo cell 2.0 × 25 × 30 mm, ~ 90 mAh, PCM, UN38.3 (DVT: 1.6 mm cell) | pouch | 1 | 2.80 | https://www.digikey.com/en/products/result?keywords=lipo%20303030 |
| SW1 | C&K **KMR2** series tactile switch (COPY)        | 4.2 × 2.8 × 1.9 mm          | 1   | 0.40   | https://www.ckswitches.com/products/switches/product-details/Tactile/KMR2/ |
| M1  | Coin ERM vibration motor 8 mm × ≤ 2.0 mm (verify thickness) | coin             | 1   | 0.70   | https://www.digikey.com/en/products/result?keywords=coin%20vibration%20motor%208mm |
| Q1  | N-MOSFET for motor + flyback diode               | SOT-523 / SOD-923           | 1   | 0.15   | — |
| RT1 | NTC 10 k 0402 (battery temp → BQ51050B TS)        | 0402                        | 1   | 0.05   | — |
| —   | Passives (≈ 45 × 0201/0402 R/C/L)                 |                             | 45  | 0.90   | — |
| VNT | GORE adhesive protective vent (for BME688)        | Ø 3–4 mm                    | 1   | 0.60   | https://www.gore.com/products/categories/venting |
| PCB | 6-layer HDI, 0.6 mm (DVT: 0.4 mm), 36 × 36 mm, ENIG, via-in-pad | PCBWay        | 1   | 7.50   | https://www.pcbway.com/orderonline.aspx |
| PCBA| SMT assembly (both sides), stencil, X-ray for LGA | PCBWay                      | 1   | 11.00  | https://www.pcbway.com/pcb-assembly.html |
| GLS | Cover glass 0.55 mm aluminosilicate, 38 × 38 mm, black ink mask, clear camera + screen windows, AR coat | custom | 1 | 4.50 | glass vendor (RFQ) |
| BDY | 316L body, 2 parts, CNC + mirror polish (back), bead-blast (bezel, optional) | PCBWay CNC | 1 set | 34.00 | https://www.pcbway.com/rapid-prototyping/ |
| BTN | 316L COPY button cap, CNC, polished               | Ø 5 mm                      | 1   | 1.50   | PCBWay CNC |
| GSK | 0.3 mm PEEK seam gasket (RF window + seal)        | laser cut                   | 1   | 0.60   | PCBWay / local |
| SCR | M1.2 × 3 Torx, A4 stainless                       |                             | 4   | 0.25   | — |
| ADH | tesa 61395 / 3M 5925 die-cut adhesive (glass, battery) |                       | 1 set | 0.40 | — |
|     | **Device subtotal ≈ US$ 102 / unit**              |                             |     |        | |

## C · PRODUCTION BOM — LOT DOCK (wireless charger, item 12 + 19)

| Part                                                          | Qty | Est. $ | Note |
|---------------------------------------------------------------|-----|--------|------|
| Qi 5 V transmitter PCBA (single-coil, A11-type, FOD)          | 1   | 4.00   | Off-the-shelf for run 1; custom TX in run 2 |
| 316L CNC puck ring Ø 50 × 8 mm, polished                       | 1   | 12.00  | PCBWay CNC; must **not** cover the coil |
| Top plate 1.0 mm ceramic or glass Ø 46 mm                      | 1   | 2.50   | Coil sits directly under it |
| Silicone foot ring + 2 × M2 screws                             | 1   | 0.60   | |
| USB-C cable 1 m, braided, white or silver                      | 1   | 2.50   | |
| **Dock subtotal ≈ US$ 22 / unit**                              |     |        | |

## D · 100-UNIT RUN — COST ROLL-UP (order 110: 100 + 10 spares)

| Line                                              | Per unit | × 110      |
|---------------------------------------------------|----------|------------|
| Device BOM + PCBA + body                          | 102      | 11,220     |
| LOT Dock                                          | 22       | 2,420      |
| Packaging (box, foam, printed manual card)        | 5        | 550        |
| Shipping, duties, freight (est.)                  | 6        | 660        |
| **Recurring subtotal**                            | **135**  | **14,850** |
| NRE: stencils, CNC fixtures, polish jigs          | —        | 1,200      |
| NRE: EVT (10) + DVT (20) builds                   | —        | 6,500      |
| NRE: test jig (pogo bed + firmware)               | —        | 900        |
| Certification FCC + CE (radio, pre-scan + test)   | —        | 8,000–15,000 |
| **Program total**                                 |          | **≈ 31,500 – 38,500** |
| **All-in cost per delivered unit (÷ 100)**         |          | **≈ 315 – 385** |

Recurring cost drops to about **US$ 110–125** per unit at 1,000 units; the
biggest one-time line is certification. Using a pre-certified ESP32-S3
**module** (not the SiP) can cut certification cost, but it is 2.4–3.2 mm
thick. That trade is open until the EVT Z-stack is measured.

## E · ORDER SEQUENCE

1. **Now:** Prototype kit A × 3 (≈ US$ 405).
2. **After P1 passes:** EVT — 10 × PCB/PCBA + 10 × CNC body at 6.0 mm (PCBWay), 10 × cover glass, 12 × battery (≈ US$ 2,500).
3. **After EVT passes:** DVT — 20 units at 5.0 mm + 20 Docks.
4. **After DVT passes + cert pre-scan:** PVT — 110 units.

Long-lead items to quote early: cover glass (custom), LS013B7DH03 (stock
varies), thin LiPo with UN38.3 report (needed to ship by air).
