<!--
  LOT SYSTEMS CORPORATION
  COSMO® CIA — Vadik, Inventor
  Made in the USA | brand.lot-systems.com
-->

# 02 — Components Buying List (BOM v0.1)

**Verification status:** part choices come from engineering knowledge; links go to manufacturer/distributor pages and **were not verified live** (prices are rough estimates for qty ~100, USD, for planning only). Confirm stock, thickness, and datasheet before ordering.

## A. Dev-kit (order now, P1) — ≈ $150–250
| Item | Why | Link |
|---|---|---|
| ESP32-S3 dev board with camera port (e.g. ESP32-S3-EYE or Freenove ESP32-S3 WROOM CAM) | MCU+Wi-Fi+camera in one | https://www.espressif.com/en/products/devkits |
| 1.3" OLED I2C module (SH1106, 128×64) | screen proto | https://www.adafruit.com/search?q=1.3%22+OLED |
| Bosch BME688 breakout | weather + AI gas | https://www.adafruit.com/search?q=BME688 |
| VEML7700 breakout | ambient light | https://www.adafruit.com/search?q=VEML7700 |
| BMI270 breakout | motion | https://www.sparkfun.com/search/results?term=BMI270 |
| Qi receiver + 5 W Qi pad dev kit (e.g. TI BQ51003 EVM) | charge test | https://www.ti.com/product/BQ51003 |
| LiPo 3.7 V ~150 mAh with protection (JST-SH) | battery | https://www.adafruit.com/search?q=lipo+150mah |
| Tact switch, jumper wires, breadboard | button | https://www.digikey.com |

## B. Production BOM (per device)
| Ref | Part | Spec | Qty | Est. $ | Source / link |
|---|---|---|---|---|---|
| U1 | ESP32-S3-MINI-1 (or -1U) module | Wi-Fi/BLE, pre-certified, 8 MB flash | 1 | 3.5 | https://www.espressif.com/en/products/modules |
| U2 | Bosch BME688 | T/H/P/gas, AI (BSEC) | 1 | 9 | https://www.bosch-sensortec.com/products/environmental-sensors/gas-sensors/bme688/ |
| U3 | Bosch BMI270 | IMU, on-chip motion recognition | 1 | 3 | https://www.bosch-sensortec.com/products/motion-sensors/imus/bmi270/ |
| U4 | Vishay VEML7700 | ambient light | 1 | 1.5 | https://www.vishay.com/en/product/84286/ |
| U5 | TI BQ51003 (Qi Rx) | 5 W Qi receiver | 1 | 3 | https://www.ti.com/product/BQ51003 |
| U6 | TI BQ25185 (or BQ25170) | Li-ion charger, power-path | 1 | 1.5 | https://www.ti.com/product/BQ25185 |
| U7 | Analog Devices MAX17048 | fuel gauge | 1 | 2 | https://www.analog.com/en/products/max17048.html |
| U8 | LDO/Buck 3.3 V (e.g. TPS62840) | low-Iq regulator | 1 | 1.2 | https://www.ti.com/product/TPS62840 |
| L1 | Qi Rx coil, thin (≈0.5–0.8 mm) + ferrite | Würth 760308 series class or equivalent | 1 | 3 | https://www.we-online.com/en/components/products/WPCC |
| B1 | LiPo cell, UN38.3-certified, ~120–200 mAh, ≤3.2 mm | e.g. 502025 class | 1 | 3.5 | https://www.digikey.com/en/products/filter/batteries-rechargeable-secondary/92 |
| DS1 | 1.3" OLED 128×64 (SH1106) or 1.54" e-paper | per D3 | 1 | 5–9 | https://www.buydisplay.com |
| CAM1 | OV2640 2 MP module (DVP, FPC) | ~8×8 mm | 1 | 4 | https://www.ovt.com/products/ov2640/ |
| SW1 | Low-profile tact / dome switch | ≤1.2 mm travel stack | 1 | 0.3 | https://www.digikey.com/en/products/filter/tactile-switches/197 |
| LED | Camera indicator LED 0402 | privacy | 1 | 0.1 | — |
| PCB | 4-layer 0.8 mm ENIG, 40×40 mm, PCBA | PCBWay | 1 | 8 (fab) + 12 (assembly) | https://www.pcbway.com/pcb-assembly.html |
| Passives/ESD/connectors | ≈60 pcs | — | — | 4 | via PCBWay turnkey |
| M1 | Front frame, 316L, CNC, mirror-polish option | 40×40, window recess | 1 | 35–60 | https://www.pcbway.com/cnc-machining-quote.html |
| M2 | Back plate, 316L, #8 mirror polish | 40×40×0.8–1.0 | 1 | 25–45 | same |
| G1 | Window: glass/sapphire cover with oleophobic coat | RF/Qi transparent | 1 | 6–15 | PCBWay / local glass shop |
| S1 | Screws M1.2 ×4 / gasket / adhesive | — | — | 2 | https://www.mcmaster.com |
| **Total (est.)** | | | | **≈ $130–210** | |

## C. Accessories / one-time
| Item | Est. | Note |
|---|---|---|
| Qi charge pad, 5 W, ×100 | $4–8 each | off-the-shelf v1; custom branded later |
| USB-C service cable + pogo programmer jig | $150 | flashing/test, Tag-Connect or pogo |
| CNC fixtures + polish jig | $500–1,500 | NRE |
| Pre-compliance (Part 15B, Qi, UN38.3) | $4–12k | module-based path |
| Packaging + PDF quick-start card | $3/unit | — |
| **100-unit run total (est.)** | **≈ $20k–35k** incl. NRE | |

## D. Notes
- Buy sensors/passives through PCBWay turnkey (consignment optional) — fewer lines to manage.
- Lock thickness-critical parts (battery, camera, display, coil) before PCB layout.
