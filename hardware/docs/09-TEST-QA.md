# 09 · Test, QA and certification: the 100-unit run

*Session 01 · 2026-11-19*

## 1. Factory test jig (one station, about 90 s per unit)

A pogo bed fixture that touches the bottom test pads + Tag-Connect, plus a host ESP32 and a laptop script.

| Step | Test | Pass |
|---|---|---|
| 1 | Current with no firmware | < 5 mA |
| 2 | Flash test firmware + burn flash-encryption key | OK |
| 3 | 3V3 rail, VBAT | 3.25–3.35 V / cell ± 0.05 |
| 4 | I²C scan | 0x36, 0x44, 0x68, 0x77 present |
| 5 | BME688 reading vs room reference | T ± 1.5 °C, RH ± 5 % |
| 6 | LCD pattern (camera-checked) | Checkerboard + text visible |
| 7 | Button press detected | 1 press |
| 8 | Haptic current pulse | 60–120 mA |
| 9 | Wi-Fi RSSI to jig AP at 1 m, **with the front frame on** | ≥ −55 dBm |
| 10 | Camera frame + LED on together | Frame received, LED current > 1 mA |
| 11 | Qi: place on the reference pad, charge current | ≥ 100 mA within 5 s |
| 12 | Deep-sleep current | ≤ 25 µA |
| 13 | Flash production firmware, write serial, print label | OK |

Results are saved per serial to `qa/L01-<serial>.json`, and the summary goes into the session report.

## 2. Lot acceptance (100 units)

- Build 120 sets of parts. Target ≥ 95 % first-pass yield, and every unit that ships passes all 13 steps.
- 10 % sample: 24 h soak in the sleep/wake cycle, 1 m drop × 3 onto wood, cosmetic check of the mirror back under a light box (no scratches > 0.5 mm, no orange peel).
- Every unit is paired to a LOT test account, receives "Coffee time.", sends Copy, and the Log entry is confirmed, before unpairing and boxing.

## 3. Certification

| Market | Need | Notes |
|---|---|---|
| USA | FCC Part 15B (unintentional) + 15C (intentional radiator) | With a pre-certified ESP32-S3 module only 15B + the module grant label are needed. SiP = full 15C |
| EU/UK | CE RED, RoHS, WEEE; UKCA | Same split |
| Battery | UN38.3 test summary, MSDS | Comes from the cell vendor. Needed to ship by air |
| Qi | Using the "Qi" logo needs WPC certification | Otherwise say "works with Qi chargers" with no logo |

If the 100 units are **gifts or developer kits** and not for sale, FCC has limited rules for evaluation kits. Check with a lab before choosing D-01.
