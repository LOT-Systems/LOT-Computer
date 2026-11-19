# 02 · Buying list (BOM): 100-unit run

*Session 01 · 2026-11-19. Machine-readable version: [`bom/lot-pager-bom.csv`](../bom/lot-pager-bom.csv).*

> **Prices are estimates, not quotes.** No live pricing was available in this session. Every figure is an engineering estimate at 100-unit quantity in USD, and must be checked against DigiKey, LCSC and a PCBWay quote before ordering. Links go to supplier search pages so they keep working when listings change.

## 1. Electronics

| Ref | Part | MPN | Qty | Est. $ | Link |
|---|---|---|---|---|---|
| U1 | ESP32-S3 SiP: Wi-Fi, BLE, 8 MB flash, 8 MB PSRAM | ESP32-S3-PICO-1-N8R8 | 1 | 4.80 | [DigiKey](https://www.digikey.com/en/products/result?keywords=ESP32-S3-PICO-1-N8R8) |
| DS1 | Sharp 1.28" 128×128 Memory LCD, always on | LS013B7DH03 | 1 | 13.50 | [DigiKey](https://www.digikey.com/en/products/result?keywords=LS013B7DH03) |
| CAM1 | Himax HM0360 AI vision camera module | HM0360 module | 1 | 12.00 | [Arducam](https://www.arducam.com/?s=HM0360) |
| U2 | **Weather + air**: Bosch BME688 (T, RH, P, gas AI) | BME688 | 1 | 7.50 | [DigiKey](https://www.digikey.com/en/products/result?keywords=BME688) |
| U3 | IMU with on-chip gesture AI | BMI270 | 1 | 2.60 | [DigiKey](https://www.digikey.com/en/products/result?keywords=BMI270) |
| U4 | Reference temp/RH (optional) | SHT45-AD1B | 1 | 2.90 | [DigiKey](https://www.digikey.com/en/products/result?keywords=SHT45) |
| U5 | Qi receiver + Li-ion charger | BQ51050BYFPR | 1 | 3.20 | [TI](https://www.ti.com/product/BQ51050B) |
| L1 | Qi Rx coil, Ø20–22 mm, with ferrite | Würth WE-WPCC (pick P/N) | 1 | 2.80 | [Würth](https://www.we-online.com/en/components/products/WE-WPCC) |
| U6 | Fuel gauge | MAX17048 | 1 | 1.40 | [DigiKey](https://www.digikey.com/en/products/result?keywords=MAX17048) |
| U7 | 3.3 V buck, 60 nA Iq | TPS62840 | 1 | 1.10 | [DigiKey](https://www.digikey.com/en/products/result?keywords=TPS62840) |
| U8 | Battery protection | DW01A + FS8205 | 1 | 0.25 | [LCSC](https://www.lcsc.com/search?q=DW01A) |
| BT1 | LiPo 150 mAh, about 2.0 × 25 × 30 mm | 202530-class | 1 | 3.50 | [Alibaba](https://www.alibaba.com/trade/search?SearchText=202530+lipo) |
| M1 | 8 mm coin vibration motor (the pager buzz) | 0820 ERM | 1 | 0.70 | [LCSC](https://www.lcsc.com/search?q=coin%20vibration%20motor%208mm) |
| SW1 | Ultra-thin tact switch (Copy) | ALPS SKRPACE010 | 1 | 0.35 | [DigiKey](https://www.digikey.com/en/products/result?keywords=SKRPACE010) |
| ANT1 | 2.4 GHz chip antenna | 2450AT18A100 | 1 | 0.45 | [DigiKey](https://www.digikey.com/en/products/result?keywords=2450AT18A100) |
| LED1 | Camera-on privacy LED, 0402 | — | 1 | 0.05 | [LCSC](https://www.lcsc.com/search?q=0402%20LED) |
| — | Passives, crystal, ESD (about 45 parts) | 0201/0402 | 1 | 1.50 | [LCSC](https://www.lcsc.com) |
| | | | | **$55.10** | |

### Why these "AI-grade" sensors

- **BME688.** Bosch's gas sensor made for on-device AI. You train smell or air classes (coffee brewing, stale air, VOC spikes) in Bosch AI Studio and run them on the MCU through BSEC. It's also the weather sensor.
- **BMI270.** Has built-in gesture and activity recognition, so the device can wake when it's picked up without the MCU running.
- **HM0360.** A camera made for TinyML. It detects motion and regions of interest on the sensor itself at µW power, so the ESP32 only wakes when there's something to look at.

## 2. PCB and assembly (PCBWay)

| Item | Spec | Est. $/unit | Link |
|---|---|---|---|
| PCB | 38 × 38 mm, 6-layer HDI, 0.6–0.8 mm, ENIG, via-in-pad, panel of 4 | 6.00 | [PCBWay HDI](https://www.pcbway.com/HighQualityPCB.html) |
| PCBA | Turnkey SMT, both sides, X-ray for LGA/BGA | 9.00 | [PCBWay PCBA](https://www.pcbway.com/pcb-assembly.html) |
| One-time | Stencil, setup, X-ray (NRE) | $150–250 total | |

## 3. Body (two-part 316L)

| Item | Spec | Est. $/unit | Link |
|---|---|---|---|
| Back shell | 316L CNC, **mirror polish #8**, 0.7–0.8 mm skin | 22.00 | [PCBWay CNC](https://www.pcbway.com/rapid-prototyping/manufacture/) |
| Front frame | 316L CNC, brushed or bead-blast, pockets for glass and button | 18.00 | same |
| Front glass | 0.55 mm chemically strengthened, black ink mask, camera hole | 4.50 | [cover glass](https://www.alibaba.com/trade/search?SearchText=custom+cover+glass+0.55mm) |
| Button cap | 316L Ø6 mm + silicone gasket | 2.00 | PCBWay CNC |
| Vent | Adhesive membrane vent about 3 mm (weather accuracy) | 0.90 | [Gore venting](https://www.gore.com/products/categories/venting) |
| Hardware | 4 × M1.2 screws, PSA adhesive | 0.60 | [McMaster](https://www.mcmaster.com) |
| | | **$48.00** | |

## 4. Charger and packaging

| Item | Est. $/unit |
|---|---|
| Qi 5 W desk pad (off the shelf, rebrandable) | 6.00 |
| Box, printed quick-start card, microfiber pouch | 3.50 |

## 5. Totals

| Block | $/unit |
|---|---|
| Electronics | 55.10 |
| PCB + PCBA | 15.00 |
| Body | 48.00 |
| Charger + packaging | 9.50 |
| **Unit BOM** | **≈ $131** (estimate range $115–185) |
| **× 100 units** | **≈ $13,100** |

### One-time costs (NRE)

| Item | Est. $ |
|---|---|
| EVT: 5 boards + 5 CNC bodies (fast-turn) | 1,500–2,500 |
| DVT: 20 units | 3,500–5,000 |
| PCBA stencil and setup, CNC fixtures, glass tooling | 800–1,500 |
| Factory test jig (pogo bed + ESP32 tester) | 400–800 |
| FCC Part 15C + CE RED (if using the SiP, not a certified module) | 10,000–20,000 |
| Cell certification UN38.3 (usually covered by the cell vendor) | 0–2,500 |
| **NRE total** | **≈ $16k–32k** |

**All-in for 100 units: about $30k–45k, or $300–450 per unit.** Certification is the biggest single cost. Decision D-01 in the roadmap is the lever for it.

## 6. Ordering checklist

1. Freeze the schematic and choose D-01 (SiP or certified module) before any parts order.
2. Order long-lead parts first: memory LCD, HM0360 modules, BME688 (check stock for 120+ of each).
3. Send the custom LiPo spec (size, 150 mAh, PCM, JST-SH or solder tabs, UN38.3) to two vendors.
4. Send STEP files for the body to PCBWay CNC. Ask for a first-article mirror-polish sample.
5. Send the PCBA order pack (doc 05) to PCBWay as turnkey, with consigned LCD and camera if they can't source them.
