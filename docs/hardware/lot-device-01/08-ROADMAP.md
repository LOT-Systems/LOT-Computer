# LOT DEVICE-01 — Roadmap and Analysis

**Doc:** HW-08-ROAD · **Rev:** A · **Date:** 2026-11-28
**Baseline:** week 0 = the week Phase 1 starts. Durations are estimates.

## 1. Phases

| Phase | Weeks | Output | Gate |
|---|---|---|---|
| **0. Plan** (this session) | — | Plan, BOM, mechanical, PCB, firmware, connector spec, PDFs, simulator | ✔ done |
| **1. Dev-kit proof** | 1–3 | ESP32-S3 dev board + Memory LCD breakout + BME688 breakout + camera on the desk, running firmware v0.1 against a **staging** LOT server | Notice → screen → Copy → Log, end to end |
| **2. Server connector** | 2–4 (in parallel) | `devices` table, `/api/device/*`, pairing page, `device_copy` in the Log tab, notice composer job. Simulator used as the contract test | Green build, deployed to staging |
| **3. EVT** (10 + 10 units) | 4–9 | KiCad layout in **two versions**: chip-down 5.0 mm and module 6.0 mm. PCBWay PCBA and CNC, both sets | **G-1:** choose the version (see §2) |
| **4. DVT** (20 units) | 10–15 | The chosen version, final glass, RF tuning, battery life test, drop test (1 m, 26 drops), pre-scan at an RF lab | Battery ≥ 5 days, RF pre-scan pass |
| **5. Certification** | 14–22 | FCC (and CE/UKCA if selling in Europe), UN38.3 for the battery, RoHS docs | Grants issued |
| **6. PVT + 100-unit run** | 20–26 | 110 PCBA + 110 body sets, final assembly, factory test, packaging | ≥ 97% first-pass yield |
| **7. Ship + OTA** | 26+ | Units to users, firmware 1.1 (MQTT instant mode), BME AI-Studio gas profiles | — |

Critical path: **EVT → G-1 → certification**. The server work (Phase 2) does not block the hardware and can start right away.

## 2. Decision gate G-1: 5.0 mm or 6.0 mm

| | Chip-down, 5.0 mm | Module, 6.0 mm |
|---|---|---|
| Matches the brief "4×4 cm × 5 mm" | ✔ | ✘ (+1 mm) |
| Radio certification | Full intentional radiator: **$10–25k**, 6–10 weeks | Reuses the module grant: **$2.5–5k** (Part 15B) |
| RF risk | Antenna tuning in a steel frame is our job | Module antenna, but it still needs the glass keep-out |
| Battery | 2.0 mm cell, ~110 mAh | 2.5–3.0 mm cell, ~150 mAh (+35% life) |
| Program total (100 units) | ~$28–45k | ~$20–25k |

**Recommendation:** build both in EVT, which costs about $1.5k extra. If the 5.0 mm stack measures ≤ 5.2 mm with a working camera, and the budget allows certification, ship chip-down. Otherwise ship the 6.0 mm "Developer Edition" for the first 100 and move to 5.0 mm in run 2.

## 3. Risk register

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Camera module too thick for 5 mm | High | High | Source HM0360 and OV2640 thin modules in Phase 1; measure them; allow a 0.3 mm camera boss on the bezel |
| R2 | Steel detunes the antenna | Medium | High | Antenna under the glass with a 3 mm keep-out; tune on the assembled unit; budget RSSI ≥ −60 dBm at 1 m |
| R3 | Custom battery minimum order | High | Medium | Off-the-shelf cell for EVT/DVT; RFQ 3 cell vendors now |
| R4 | Mirror polish yield at 100 units | Medium | Medium | Order 110 Part A; inspect with a light box; reject rate in the contract |
| R5 | Battery life < 5 days | Medium | Medium | Adaptive poll interval; TLS session resumption; MQTT only while charging |
| R6 | BME688 reads warm | High | Low | Offset model + per-batch calibration; vent the sensor away from the SoC |
| R7 | Pairing/token security | Low | High | Hashed tokens, rate limits, secure boot + flash encryption |
| R8 | Certification delay | Medium | High | RF lab pre-scan in DVT; don't promise a ship date before G-1 |

## 4. Next session should start with

1. Turn `01-PLAN` §2 rows marked "Spec written" into tracked GitHub issues, one per phase.
2. Start Phase 2 on a feature branch: `Device` model, migration, `/api/device/*` routes, simulator as the test.
3. Order Phase 1 dev parts: ESP32-S3 DevKitC-1, Adafruit/Sharp Memory LCD breakout, BME688 breakout, OV2640 module.
4. Write vendor RFQs: battery (3), glass (2), PCBWay CNC quote for 12 EVT sets.
