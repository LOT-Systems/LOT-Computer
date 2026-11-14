# 08 · Roadmap and Analysis

**Doc:** LOT-HW-01-ROAD · **Rev:** A (2026-11-14) · Week 0 = the week Vadik approves decisions D-1 and D-2.

## 1. Phases

| Phase | Weeks | Deliverables | Exit gate |
|-------|------:|--------------|-----------|
| **0 · Plan** (done, session 1) | — | Docs 01–09, BOM, API spec, firmware skeleton, `lotctl` with mock server | Vadik signs off D-1…D-5 |
| **1 · Server API** | 0–2 | `devices` + `device_notifications` migration, `/api/device/*` routes, Settings → Devices UI, `device_copy` in the Log tab, `device-nudge` job | `lotctl simulate --host https://lot-systems.com` passes against staging |
| **2 · EVT-0 bench** | 0–3 | Dev kits wired. Firmware drivers for LCD, haptic, BME688, camera, sleep. SoftAP Wi-Fi setup portal | "Coffee time!" arrives on the bench unit. Copy appears in Log |
| **3 · EVT-1 design** | 2–6 | KiCad schematic and layout, STEP enclosure, cover-glass drawings | DRC/ERC clean. PCBWay DFM review passes |
| **4 · EVT-1 build** | 6–9 | 10 units (PCBWay quick-turn PCBA plus 5 CNC shells) | Power budget measured. RF ≥ −65 dBm closed. Qi charges through GL2 |
| **5 · DVT** | 9–15 | Thin stack (if D-2 = 5 mm), 20 units, FCC pre-scan, drop and thermal tests | All of 01 §6 met on ≥ 18 of 20 |
| **6 · Certification** | 13–18 | FCC Part 15B (+15C if chip-down), UN38.3 docs | Grant / test report in hand |
| **7 · PVT / 100-unit run** | 16–22 | 110 units built, tested, packed. PDF manuals printed and in the box | ≥ 95 % first-pass yield |
| **8 · Field** | 22+ | OTA channel, user feedback via Log, v2 planning (push socket, BLE app) | — |

Critical path: **custom cell (BT1-DVT) and NCVM window (GL2)**, which have 4–6-week lead times. Order samples in week 0.

## 2. Open decisions for Vadik

| ID | Decision | Options | Recommendation |
|----|----------|---------|----------------|
| **D-1** | Wireless charging versus an all-steel back | NCVM glass window / all-steel with pogo dock / ceramic back | **NCVM glass window.** It keeps the silver look and Qi works (03 §1, 01 §3) |
| **D-2** | Thickness | 6.5 mm with module (cheaper, faster, pre-certified) / 5.0 mm chip-down (+$10k FCC, +6 weeks) | Ship the first 100 at **6.5 mm**. Make 5.0 mm the v1.1 run |
| **D-3** | Camera purpose | Photo-to-Log only / also QR pairing / disabled until v2 | Photo-to-Log on long press. QR pairing is a nice follow-on |
| **D-4** | Delivery model | Poll every 5 min (days of battery) / persistent socket (~1 day) | **Poll** with server-driven adaptive cadence |
| **D-5** | Steel grade | 304 (cheaper, polishes well) / 316L (better corrosion, skin contact) | **316L** for a skin-contact pocket object |

## 3. Risk register

| # | Risk | L | I | Mitigation |
|---|------|:-:|:-:|------------|
| R1 | Steel enclosure kills Wi-Fi range | H | H | Antenna under the front glass, keep-out, tuning on EVT-1, chip antenna on DVT |
| R2 | Qi heats the steel ring and charging stalls | M | H | Window ≥ coil + 3 mm, NTC at the cell, 1 C limit. Pogo-pin fallback footprint on the PCB |
| R3 | 5 mm unachievable with a camera | H | M | D-2: 6.5 mm first. Camera beside the battery in a PCB cut-out |
| R4 | Memory LCD outline does not fit with the camera and button | M | M | Verify the LS011B7DH03 drawing in week 0. Alternative: 0.96" 128 × 64 bare OLED (higher power) |
| R5 | Thin camera module sourcing (single supplier, EOL) | M | M | Qualify 2 module houses. Firmware supports GC032A and GC0308 |
| R6 | Custom cell MOQ above 100 | H | M | Pay NRE, or use the catalogue 303030 for the first run |
| R7 | FCC delay | M | H | Module path for the first run. Pre-scan at DVT |
| R8 | Notification fatigue | M | M | Server caps: 8/day, 45-min gap, quiet hours, circadian phase |
| R9 | Token leak from a lost device | L | M | Revoke in Settings. Device scope is write-only `device_*` logs plus own notifications |

## 4. Analysis: is the concept sound?

- **Strong fit with LOT.** The site already produces proactive, context-aware prompts (Memory Engine questions, self-care, circadian phase).
  TILE is a *physical, quiet output channel* for them, and the Copy button closes the loop into the Log, which is LOT's record of the day.
- **The hard parts are mechanical and RF, not software.** Steel, a 5 mm thickness and wireless charging pull against each other, and §2 resolves them.
- **The software is low-risk:** about 8 new routes, 2 tables and 1 scheduled job, plus the Log allow-list change.
  The mock server in `lotctl` already pins the contract.
- **Unit economics at 100:** about $153 build cost plus about $40 per unit amortised certification, so about **$190–$200 landed per unit**.
  Fine for a limited, numbered "LOT TILE 001/100" edition. At 1 000 units this drops below about $70.

## 5. Budget summary (100-unit edition, USD estimates)

| Item | Estimate |
|------|---------:|
| Dev kits and EVT-0 | 300 |
| EVT-1 (10 units, quick-turn) | 2 500 |
| DVT (20 units) | 4 000 |
| Certification (module path) | 4 000 |
| PVT run (07 §3) | 15 300 |
| Contingency 15 % | 3 915 |
| **Total programme** | **≈ 30 000** |

## 6. Next session (session 2) plan

1. Implement phase 1 on the server: migration, `src/server/routes/device-api.ts`, the auth hook, `device_copy` in `LogEvent` and `displayableEvents`, then run `lotctl simulate` against a local server.
2. Start the KiCad schematic in `hardware/lot-tile/pcb/`.
3. Firmware: Memory LCD driver and DRV2605L pager waveform (needs a toolchain-enabled environment to compile).
