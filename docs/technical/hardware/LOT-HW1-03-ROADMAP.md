# LOT-HW1 — Roadmap and Analysis (Document 03 of 06)

Dates are relative weeks from a go decision (W0). Durations are **ESTIMATE**; steel finishing and radio compliance are the long poles. Starting point today (2026-10-04): no hardware exists; the site side already has the pieces to build on (see Doc 05 §1).

## 1. Phases and gates

| Phase | Weeks | Goal | Exit gate (must be true to continue) |
|---|---|---|---|
| **P0 Decide** | W0–1 | S-2 answers the 7 open decisions (Doc 01 §8) | Decisions logged; thickness target set (5 vs ≈7 mm) |
| **P1 Feasibility** (dev boards + steel samples) | W1–6 | Prove the 3 physics risks on the bench | (a) Qi delivers ≥ 150 mA charge through chosen stack; (b) Wi-Fi link works at ≥ 10 m with steel mock-up; (c) BME688 readable via vent; (d) camera + display + cell fit in a printed shell at target thickness |
| **P2 EVT** (10 units, custom PCB) | W6–14 | First custom board from PCBWay; steel parts machined | Boots, connects, shows a notification, button writes a Log row; real PCBWay assembly quote in hand |
| **P3 DVT** (30 units) | W14–22 | Fix EVT defects; power + radio + thermal tests; draft manuals | Battery life measured; drop/dust sanity; compliance lab pre-scan passed |
| **P4 PVT / 100-unit run** | W22–32 | Production-like build, test jig, packaging, PDF manuals | ≥ 95 % first-pass yield on a 10-unit pilot, then release 100 |
| **P5 Field** | W32+ | Hand to first users, collect Log-tab telemetry | Ongoing |

**Indicative total: 26–34 weeks to 100 units (ESTIMATE).** If the 5 mm target is held for Gen-1, add 8–12 weeks (chip-down RF, custom thin cell, thin camera sourcing) and a larger compliance bill.

## 2. Parallel tracks

| Track | Work | Starts |
|---|---|---|
| Hardware | schematic → layout → PCBWay package (Doc 06) | P1 |
| Mechanical | CAD of 2-part steel body, polish spec, quotes | P1 |
| Firmware | Doc 04; runs on dev boards in P1 | P1 |
| Site/API | Doc 05 endpoints + Log tab event (small, low risk) | P1 |
| Documents | Doc set → PDF manuals; session report each session | P1, continuous |
| Compliance | lab selection, test plan, UN38.3 | P2 |

## 3. Critical path

`P0 decisions → steel sample Qi/RF tests → PCB layout freeze → PCBWay EVT → DVT → compliance → 100-run`

Slack exists on firmware/site work (small); none on steel finishing (long quote/lead) or compliance.

## 4. Risk register

| # | Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| R1 | 5 mm total thickness not achievable with camera + battery + Qi | High | High | Gen-1 at ≈7 mm; Gen-2 chip-down | S-2 decision |
| R2 | Qi charging weak through steel | High | High | Face-down charging through glass (Option A), ceramic inset (B); test in P1 | HW |
| R3 | Wi-Fi range poor in metal body | High | High | Antenna at glass side, keep-out, plastic slot; OTA test in P1 | HW |
| R4 | BME688 reads self-heat / no airflow | Med | Med | Vent + membrane, firmware offset, server weather fallback | HW/FW |
| R5 | Steel mirror polish cost/lead too high | Med | Med | Early quote; allow brushed fallback on non-front edges | MECH |
| R6 | Radio compliance cost/time | Med | High | Use pre-certified module in Gen-1 | S-2 |
| R7 | Thin cell shipping/supply (UN38.3, custom cell MOQ) | Med | Med | Qualify 2 cells in P1; MOQ check | HW |
| R8 | Camera privacy concerns | Med | Med | Capture only on press, visible indicator, no stream (Doc 04 §6) | FW/S-2 |
| R9 | Device auth is new surface on the site | Med | High | Per-device tokens, hashed at rest, revocable, rate-limited (Doc 05 §2) | API |
| R10 | PCBWay assembly is manually quoted; part shortages | Med | Med | BOM with approved alternates (Doc 02) | HW |

## 5. Analysis: what to build vs what to buy

- **Buy / off-the-shelf:** ESP32-S3 module, display, camera, BME688, BMI270, Qi RX IC, charger IC. These are the "AI-grade off-the-shelf sensors" you asked for; no custom silicon.
- **Build:** 4-layer PCB, 2-part steel body, firmware, device API on the site, flasher/provisioning tool, manuals.
- **Do not build:** own Qi coil design, own radio, own cell.

## 6. Scope options for the first 100 (DECISION)

| Option | Thickness | Notes | Risk |
|---|---|---|---|
| **A "Prove it"** (recommended) | ≈7 mm | module-based, color IPS, face-down Qi | Low–Med |
| B "Spec-true" | 5 mm | chip-down RF, thin cell, thin camera | High |
| C "Notify-only" | 4–5 mm | drop camera; screen + button + sensors only | Low |

Option C is worth a thought: removing the camera removes the biggest thickness driver. If the camera's value is unproven, ship C first and add a camera in Gen-2.

---
AUTHORIZED BY: S-2 // VADIK MARMELADOV
