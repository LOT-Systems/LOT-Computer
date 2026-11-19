# 03 · Roadmap and analysis

*Session 01 · 2026-11-19*

## 1. Phases and gates

| Phase | Goal | Output | Gate to pass | Est. time |
|---|---|---|---|---|
| **P0 · Spec** *(this session)* | Plan, BOM, protocol, firmware skeleton, docs | This package | Vadik approves the plan and decisions D-01…D-04 | wk 0 |
| **P1 · Breadboard** | Prove the whole loop on dev boards | ESP32-S3 DevKit + Sharp LCD breakout + BME688 breakout + button. Flash `firmware/` | A notification from the (staging) site shows on the LCD; Copy appears in the Log tab | wk 1–2 |
| **P1b · Server** | Device API live on staging | `Device`, `DeviceMessage` models + migration, routes from `software/server-draft/` | Simulator passes against staging | wk 1–2 (parallel) |
| **P2 · EVT** | First custom board + CNC body | 5 PCBA from PCBWay, 5 bodies, 7 mm stack | Power-on, Wi-Fi through the glass, Qi charge, 72 h sleep-current test | wk 3–7 |
| **P3 · DVT** | Real size and real finish | 20 units at 5.5 mm, mirror-polished backs, final glass | Drop 1 m × 10, 2-week battery, RF pre-scan, 10 outside users | wk 8–13 |
| **P4 · Cert** | FCC/CE (if needed) | Lab report | Pass | wk 12–18 |
| **P5 · PVT / run** | 100 units | 120 PCBA, 120 bodies, test jig, packaging | ≥ 95% first-pass yield, all units paired and tested | wk 16–22 |
| **P6 · Ship** | Ship to members | Units + PDF manuals + the site feature | — | wk 22+ |

**Critical path:** schematic → EVT PCBA (2–3 weeks at PCBWay) → stack-up proven → DVT CNC mirror finish → certification.

## 2. Decisions needed (from Vadik)

| ID | Question | Options | Recommendation |
|---|---|---|---|
| D-01 | Radio: SiP or pre-certified module | (a) ESP32-S3-PICO-1 SiP: thinnest, needs full FCC/CE (~$10–20k). (b) ESP32-S3-MINI-1 module: modular certification, but 2.4 mm tall and 15 × 20 mm | **(b) for EVT/DVT** to learn fast. Choose for PVT once the 100 units' use is known (gift/dev kit or for sale) |
| D-02 | Height | 5.0 mm (custom cell + rigid-flex, +$3–5k NRE) / 5.5 mm / 6.5 mm | **5.5 mm** for the 100-unit run. Keep 5.0 mm for v2 |
| D-03 | Wireless charging | (a) Qi coil under the front glass, charge face down. (b) Magnetic pogo dock on the back edge | **Both footprints on EVT.** Keep whichever passes the 72 h test |
| D-04 | Camera purpose | (a) Presence/motion only, no images leave the device. (b) Photo capture to Log | **(a) for v1.** It's private and saves power. Long-press capture can come later |

## 3. Analysis

**Feasibility.** Every function uses parts you can buy off the shelf. Nothing needs new silicon. Two things are hard: **height** (R-01) and **radio/charging through steel** (R-02). Both are mechanical problems with known fixes. The front glass window acts as the RF and charging aperture.

**Software is the cheapest part and the most reusable.** The LOT site already has:
- a `Log` model with `event` + `metadata`. `device_copy` slots straight in, and the Log tab shows it without UI changes.
- `aiEngineManager` and scheduled jobs, which can write the AI notifications.
- weather utilities and circadian phase, which give the notifier context.

What's missing is **device authentication**. Today the site only uses cookie sessions. The draft adds pairing codes and revocable hashed bearer tokens.

**Cost.** About $131 per unit in parts. About $300–450 all-in at 100 units because of NRE, mostly certification. At 1,000 units it would drop to about $90–110.

**Schedule.** About 22 weeks from approval to shipping 100 units if nothing slips. The steel mirror polish and certification lab slots usually slip, so plan for 26.

**What to cut if needed.** Drop the camera (−$12, −0.5 mm of risk, no privacy questions) or drop the SHT45. The product still meets its core promise: show AI notifications, press Copy, see it in the Log.

## 4. Budget timeline

| Phase | Spend |
|---|---|
| P1 breadboard | ~$250 (dev boards and breakouts) |
| P2 EVT | ~$2,000 |
| P3 DVT | ~$4,500 |
| P4 cert | $0–20,000 (D-01) |
| P5 run | ~$14,000 + jig/fixtures ~$2,000 |
| **Total** | **≈ $23k–43k** |

## 5. P1 breadboard shopping list (order now, about $250)

| Item | Link |
|---|---|
| ESP32-S3-DevKitC-1 N8R8 | [DigiKey](https://www.digikey.com/en/products/result?keywords=ESP32-S3-DevKitC-1-N8R8) |
| Adafruit SHARP Memory Display breakout 1.3" 168×144 (or LS013B7DH03 breakout) | [Adafruit](https://www.adafruit.com/search?q=sharp+memory) |
| Adafruit/Pimoroni BME688 breakout | [Adafruit](https://www.adafruit.com/search?q=BME688) |
| BMI270 breakout | [SparkFun](https://www.sparkfun.com/search/results?term=BMI270) |
| Arducam HM0360 module | [Arducam](https://www.arducam.com/?s=HM0360) |
| Qi receiver breakout + 5 W pad | [Adafruit](https://www.adafruit.com/search?q=qi) |
| 150 mAh LiPo, coin motor, tact switches | [Adafruit](https://www.adafruit.com/search?q=lipo+150mah) |
