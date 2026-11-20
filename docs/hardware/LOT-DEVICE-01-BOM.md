# LOT-DEVICE-01 · Components Buying List (BOM)

**Doc:** LOT-HW-BOM · Rev A · 2026-11-20
**Machine-readable:** [`hardware/lot-device-01/bom/bom.csv`](../../hardware/lot-device-01/bom/bom.csv)

> **Price note:** prices are 2026 planning estimates for 100-unit quantities. Vendor sites (PCBWay, Digi-Key, Mouser, Adafruit) were **not reachable** from this routine's network sandbox, so none of these figures are live quotes. Every line is marked *verify*. Step 1 of the Roadmap is to get real quotes. Links go to the manufacturer or vendor page for each part family. Confirm the exact MPN on the page.

---

## 1. Stage A: Dev-kit prototype (buy now, about $150–200)

Off-the-shelf boards to prove the whole loop (site → device → Copy → Log tab) before any custom PCB.

| Qty | Item | Why | Link (verify) | ≈ USD |
|---|---|---|---|---|
| 2 | Seeed Studio **XIAO ESP32S3 Sense** (ESP32-S3 + OV2640 camera + mic + microSD) | Same MCU family as the product, camera already wired | https://www.seeedstudio.com/XIAO-ESP32S3-Sense-p-5639.html | 2 × 14 |
| 1 | Adafruit **SHARP Memory Display** breakout 1.3" 168×144 | Same display technology (memory LCD, always-on) | https://www.adafruit.com/product/3502 | 25 |
| 1 | Adafruit **BME688** breakout (STEMMA QT) | The production weather + AI gas sensor | https://www.adafruit.com/product/5046 | 20 |
| 1 | **BMI270** IMU breakout (SparkFun or similar) | Tap/pick-up wake | https://www.sparkfun.com/search/results?term=BMI270 | 20 |
| 1 | Adafruit **Universal Qi receiver** module | Prove wireless charging through glass, not steel | https://www.adafruit.com/product/1901 | 15 |
| 1 | Adafruit **Qi charger** transmitter | Charger stand-in | https://www.adafruit.com/product/2162 | 25 |
| 2 | LiPo 3.7 V ~100 mAh | Battery-life measurements | https://www.adafruit.com/product/1570 | 2 × 6 |
| 2 | Vibrating mini disc motor | Pager buzz | https://www.adafruit.com/product/1201 | 2 × 2 |
| 1 | Tactile buttons + STEMMA QT cables + breadboard | Copy button | https://www.adafruit.com | 10 |
| 1 | 316L stainless sample plate 40×40×1 mm (any metal shop / PCBWay CNC) | RF and Qi attenuation test | https://www.pcbway.com/rapid-prototyping/cnc-machining/ | 15 |
| | | | **Stage A total** | **≈ 175** |

## 2. Stage B: Production BOM (per unit, 100-unit pilot)

| Ref | Part | MPN / spec | Maker | ≈ USD (low–high) |
|---|---|---|---|---|
| U1 | SoC Wi-Fi + BLE, 4 MB flash + 2 MB PSRAM in package | **ESP32-S3FH4R2** (QFN56 7×7×0.9) | Espressif | 2.80–3.60 |
| Y1 | 40 MHz crystal, 2016 | FA-128 or eq. | Epson/TXC | 0.20–0.40 |
| ANT1 | 2.4 GHz flex antenna | Molex 146153-0100 | Molex | 0.80–1.40 |
| DS1 | 1.28" Memory LCD 128×128 | **LS013B7DH03** | Sharp | 9.00–13.00 |
| CAM1 | Ultra-low-power AI vision sensor | **HM0360** module | Himax | 8.00–15.00 |
| SEN1 | Weather + gas (T/RH/P/IAQ), AI-Studio | **BME688** | Bosch | 7.50–10.00 |
| SEN2 | 6-axis IMU, on-chip wake/gesture | **BMI270** | Bosch | 2.50–3.50 |
| U2 | Qi receiver + Li-ion charger | **BQ51050B** | TI | 3.00–4.20 |
| L1 | Thin Qi Rx coil (≤ 0.8 mm) | WE-WPCC family (pick in EVT) | Würth | 2.00–4.00 |
| U3 | 3.3 V buck, 60 nA Iq | TPS62840 | TI | 0.90–1.40 |
| U4 | Fuel gauge | MAX17048 | ADI | 1.20–1.80 |
| BT1 | LiPo 2.0×25×30 mm, 80–120 mAh, PCM | custom 202530 | Grepow/PKCell | 3.00–6.00 |
| M1 | Coin ERM 8×2 mm | 0820 | generic | 0.40–0.90 |
| SW1 | Low-profile tact switch 0.55 mm | SKRKAEE010 | Alps Alpine | 0.20–0.40 |
| — | Passives / ESD / MOSFET (~45) | — | various | 1.20–2.20 |
| PCB | 4-layer 0.6 mm FR4 ENIG ~38×38 | — | **PCBWay** | 1.50–3.50 |
| PCBA | SMT + stencil + X-ray, amortised | turnkey | **PCBWay** | 8.00–14.00 |
| ENC1 | Front frame 316L CNC | custom | **PCBWay CNC** | 14.00–24.00 |
| ENC2 | Back cover 316L CNC, #8 mirror polish | custom | **PCBWay CNC** | 12.00–22.00 |
| GL1 | Cover glass 0.55 mm, AR, black mask | custom | glass vendor | 2.00–4.50 |
| HW1 | M1.2 Torx screws ×4 | — | generic | 0.16–0.32 |
| GSK1 / VENT1 | Die-cut adhesive + ePTFE vent | — | tesa / Gore | 0.60–1.60 |
| | **Device subtotal** | | | **≈ 82–137** |
| CHG1/2 + CBL1 | Charger puck (OEM Qi pad + CNC alu shell + USB-C cable) | | | 10.80–21.50 |
| PKG1 | Box + quick-start card (QR → PDF manual) | | | 2.00–4.00 |
| | **Landed per unit (device + charger + box)** | | | **≈ 94–163** |

## 3. Charger (items 12 + 19)

- **Pilot:** buy a white-label Qi pad (5–10 W, USB-C) and put it in a CNC aluminium puck from PCBWay. The puck's top surface over the coil must be glass, ceramic or plastic, never metal.
- The device charges **face-down** because its Qi coil sits under the front glass (Plan §4.1).
- Branding: say "Qi-compatible" only. The Qi logo requires WPC membership and certification.

## 4. PCBWay plan (item 1)

One vendor for the board and the body keeps the 100-unit run simple:

1. **PCB:** 4-layer, 0.6 mm, ENIG, 0.1 mm trace/space, via-in-pad for the QFN. Upload Gerbers + BOM + CPL.
2. **PCBA:** turnkey (PCBWay buys parts). Consign the Sharp LCD, Himax camera and battery, which have long lead times or need hand-assembly. Ask for X-ray of U1/SEN1.
3. **CNC:** 316L front frame + back, 0.5 mm min wall, #8 mirror polish on the back, bead-blast on the frame edge. Request a first-article (5 sets) before 100.
4. **Order sequence:** EVT 10 PCBA + 10 bodies → DVT 20 → PVT/pilot 100.

## 5. 100-unit run costing (item 13)

| Bucket | Low | High | Notes |
|---|---|---|---|
| 100 × landed unit | $9,400 | $16,300 | from §2 |
| EVT + DVT prototype rounds (30 boards + 30 bodies, expedited) | $3,000 | $6,000 | |
| Radio compliance: FCC Part 15C (bare ESP32-S3 = intentional radiator) | $8,000 | $15,000 | Using a pre-certified module removes most of this but adds about 1.5 mm. See Roadmap decision D2 |
| Battery UN38.3 / MSDS (if vendor has none) | $0 | $3,000 | |
| Spares + yield loss (10 %) | $940 | $1,630 | |
| **Pilot total** | **≈ $21k** | **≈ $42k** | |

## 6. Long-lead / risk items

| Item | Risk | Mitigation |
|---|---|---|
| Sharp LS013B7DH03 | Allocation, MOQ | Order 120 early, consign to PCBWay |
| Himax HM0360 | Module availability and z-height | Fall back to OV2640/GC0308 low-profile module. Verify in EVT |
| Custom LiPo | 4–6 week lead time + shipping certification | Order a sample cell in week 1 |
| Cover glass | Custom print MOQ | Order 150 with the camera window |
