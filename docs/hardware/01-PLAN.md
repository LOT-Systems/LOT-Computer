# LOT Computer (hardware) — Plan v0.1
Owner: Vadik · Status: PLANNING · Date: 2026-10-22

## Concept
A 40×40 mm stainless-steel pager-like device tied to lot-systems.com. The site (AI) decides when to nudge the user; the device shows it ("Coffee time!"), reports weather/environment, takes photos, and has one button, **Copy**, that writes a signal into the site's **Log** tab.

## Your 19 requirements → decisions
| # | Requirement | Decision |
|---|---|---|
| 1 | PCBWay | PCB + turnkey SMT assembly at PCBWay; request enclosure quote there too (they also do CNC). |
| 2 | Pager-like notification from AI site | Server creates `device_notification`; device receives it (poll/long-poll, see 04). Haptic + screen. |
| 3 | 2-part stainless body | Front shell + back plate, 316L (or 304), M1.2 screws/laser-weld. |
| 4 | Flat silver square 4×4 cm × 5 mm | **Not feasible as stated** with camera + screen + Li-Po + Qi coil. Baseline **40×40×9 mm**. 5 mm "slim" variant only without camera lens stack, ≤40 mAh cell. Decision needed from you. |
| 5 | Camera | OV2640/GC2145-class DVP module, ~4 mm, on ESP32-S3. |
| 6 | LOT API connector | New `/api/device/*` routes in this repo (spec in 04). |
| 7 | PDF manuals | Markdown → PDF build (pandoc), user + service manual. |
| 8 | Compress info each session | Each session ends with an MD report plus a rolling `SUMMARY.md` (≤1 page). |
| 9 | Firmware docs | `05-FIRMWARE.md`. |
| 10 | Software to connect with firmware | Web flasher (ESP Web Tools) + pairing page on site. |
| 11 | Separate documents | This folder: 01 plan, 02 BOM, 03 roadmap, 04 API, 05 firmware, sessions/. |
| 12/19 | Charger / wireless charger | Qi receiver (5 V, ≤1 W class) + 20×20 mm Rx coil in back plate. **Stainless blocks Qi** → use a non-metal (glass/ceramic/PEEK) charging window on the back or ferrite-shielded coil behind a thin insert. Biggest mechanical risk. |
| 13 | 100 unit run | Pilot batch. EVT 5 → DVT 20 → PVT 100. |
| 14 | Weather sensor | BME280 (T/RH/P); BME688 upgrade adds gas/VOC. Site weather API as fallback. |
| 15 | AI-grade off-the-shelf sensors | BME688 (BSEC gas AI), BMI270 IMU (on-chip gesture ML). ESP32-S3 vector instructions for TinyML. |
| 16 | Button "Copy" → Log tab | `POST /api/device/event {type:"copy"}` → Log event `device_copy`. |
| 17 | One side polished stainless | Back plate, mirror polish (#8). |
| 18 | Other side camera+screen+button | Front shell. |

## Architecture
ESP32-S3-MINI/WROOM (Wi-Fi/BLE, DVP camera) · 1.3" 240×240 IPS or 1.12" OLED · LRA haptic · tact button · Li-Po + charger/PMIC + Qi Rx · BME280/688 · BMI270. Wi-Fi via phone-provisioned (BLE) credentials.

## Risks
1. Qi through stainless (needs window). 2. 5 mm height. 3. Polished SS cosmetic yield. 4. Battery life (Wi-Fi radio) → sleep + scheduled poll. 5. Regulatory: FCC Part 15 (intentional radiator; use pre-certified module) + UL 62368/battery UN38.3 for shipping. 6. Privacy: camera needs shutter/LED and explicit opt-in.
