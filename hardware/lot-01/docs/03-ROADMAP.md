---
title: "LOT-01 SQUARE — Roadmap & Risk Analysis"
subtitle: "Doc 03 · Rev A (2026-11-24)"
---

# LOT-01 — Roadmap & Risk Analysis

## 1. Phases

| Phase | Weeks (from go) | Goal | Exit criteria | Output |
|---|---|---|---|---|
| **P0 Plan** | 0 | Plan, BOM, docs, API spec | This document set approved by Vadik | Docs 01–10 (done, Rev A) |
| **P1 Breadboard** | 1–4 | All functions on dev kits | DevKit + LCD + BME688 + IMU + camera run the firmware; a note goes from server → device → Copy → Log end to end | Firmware v0.1, server device API behind a feature flag |
| **P2 Feasibility** | 2–6 | Kill the big risks | (a) NFC-WLC charges a 90 mAh cell through 0.5 mm glass in a steel tray in < 90 min; (b) Wi-Fi RSSI ≥ −75 dBm at 10 m through the window; (c) camera module ≤ 2.6 mm confirmed | Test reports, final antenna and coil decision |
| **P3 EVT** | 6–12 | First real board and body | 10 units, all features working, 5.0 mm closed, battery life ≥ 5 days measured | PCB Rev 1, CNC Rev 1, EVT report |
| **P4 DVT** | 12–18 | Design frozen and certifiable | 20 units: drop 1.2 m × 10, IP54 splash, 7-day battery, thermal while charging < 41 °C skin; pre-scan EMC | PCB Rev 2, CNC Rev 2, FCC/CE pre-scan |
| **P5 Certification** | 16–24 | Legal to ship | FCC ID granted, CE RED DoC, UKCA, UN38.3 on file | Certificates, labels |
| **P6 PVT / Pilot run** | 22–28 | 100 units built | Yield ≥ 90 % at final test, all units flashed, paired and burned in for 24 h | 100 units + 100 chargers, packed |
| **P7 Field** | 28+ | Users | OTA channel live, crash-free sessions ≥ 99 %, Copy success ≥ 99.5 % | Field telemetry dashboard |

Realistic pilot delivery is about **6–7 months** from go. The critical path is the
Sharp LCD lead time and FCC certification.

## 2. Critical path

```
LCD order (wk0) ────────────────────────────── 28 wk ───────────────► PVT
NFC-WLC eval (wk0) ─► feasibility (wk6) ─► EVT (wk12) ─► DVT (wk18) ─► FCC (wk24) ─► PVT (wk28)
Server device API (wk1) ─► Pager Composer (wk4) ─► OTA service (wk10)
```

## 3. Risk register

| ID | Risk | Likelihood | Impact | Mitigation | Owner / gate |
|---|---|---|---|---|---|
| **R1** | **5.0 mm height is not reachable** with camera + battery + glass | Med | High | Split-level stack-up (doc 04 §3). Camera sits only in the bottom strip. Fallback A: 5.0 mm body + 0.4 mm polished camera bump. Fallback B: 5.5 mm body | P2 mech mock-up |
| **R2** | **Wireless charging through a steel body** (eddy heating, detuning) | High | High | NFC-WLC at 13.56 MHz behind the glass window with a ferrite sheet. Charge face-down. Fallback: Qi BQ51003 with a Ø20 mm coil behind a larger window, or magnetic pogo pins on the edge (not wireless) | P2 test (a) |
| **R3** | Wi-Fi blocked by the metal enclosure | High | High | Chip antenna under the glass, in the corner furthest from the coil. Backup: the seam between the two body parts as an RF slot (0.3 mm dielectric gasket) | P2 test (b) |
| **R4** | Sharp LCD supply (0 stock, 28 weeks) | High | High | Order 120 pcs at week 0. Second source JDI LPM013M126A. Broker stock with a lot-traceability check | Week 0 |
| **R5** | Custom thin-cell MOQ ~500 | Med | Med | Use the closest stock cell size. Order 500 (≈ $2k) and keep spares for the next batch | Week 2 |
| **R6** | Camera driver/module support (GC032A in forks only) | Med | Med | Validate in P1. Alternative: OV7725 (official driver) in a thinner package, or HM0360 (low power) | P1 |
| **R7** | FCC/CE cost and time for a bare-chip radio | Certain | Med | Use Espressif reference RF layout, pre-scan at DVT, then book a lab slot early | P4 |
| **R8** | BME688 reads high from internal heat (MCU, battery, charging) | High | Low | Thermal isolation slot in the PCB, vent port, BSEC self-heating compensation, no reading while charging. LOT server weather is the outdoor baseline | P3 |
| **R9** | Mirror polish scratches during assembly | Med | Med | Protective film from polish to pack. Polish the back plate after laser weld, or use screw assembly | P3 |
| **R10** | Battery life below 7 days | Med | Med | Adaptive poll interval, ULP-driven LCD VCOM, IMU MLC wake, Wi-Fi power-save | P3 |
| **R11** | Security: device token leak lets someone write to a user's Log | Low | High | Per-device revocable tokens (stored hashed), scoped to inbox/copy only, rate-limited, flash encryption + secure boot v2 | P1 |
| **R12** | Polling at scale (100 devices is fine, 10k is not) | Low | Low | ETag/304 responses, server-set `next_poll_s`, later MQTT | P7 |

## 4. Analysis

**What is easy:** the software path. LOT already generates contextual prompts
(`/api/contextual-prompts`), knows circadian phase and weather, and has a Log model
with free-form `event` + `metadata`. The device API is a thin layer: one new route
file, two new Log event types and one table (doc 07).

**What is hard:** physics in 5 mm of steel. RF and wireless power need a
non-metal window, and the brief already provides one (the screen side). The
design puts the window to work: display, camera, Wi-Fi antenna and charging coil
all sit behind one glass panel. The polished back stays clean and solid.

**What is expensive:** certification (~$15–25k) costs more than the whole
100-unit BOM. That is normal for a first radio product. Re-using the same PCB in
later runs spreads the cost.

**Recommendation:** approve P1 + P2 now (≈ $2.5k: dev kits, eval kits, LCD order).
Do not order PCBs or CNC bodies until the three P2 feasibility tests pass.

## 5. Next session (S2) proposal

1. Implement the server side of the LOT API Connector in `src/server/routes/device-api.ts` with the full build green (doc 07 §6).
2. Draw the schematic in KiCad (blocks from doc 05) and run ERC.
3. Make a STEP mock-up of the stack-up for the R1 check.
