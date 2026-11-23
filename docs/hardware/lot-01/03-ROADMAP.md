# LOT·01 — Roadmap & Analysis

Starting week **W0 = 2026-11-23**. Durations assume one hardware engineer plus a contract ME, with Vadik deciding at the gates.

## Phases

| Phase | Weeks | Output | Gate (exit criteria) |
|---|---|---|---|
| **P0 Plan** | W0 | This document set, BOM rev A, API spec | ✅ S01 |
| **P1 Proof (breadboard)** | W1–W3 | ESP32-S3 devkit + LS013B7DH03 breakout + BME688 + LSM6DSOX + Qi RX eval kit. Firmware polls the **mock** connector, Copy creates a Log on staging | **G0:** end-to-end "Coffee time!" → buzz → Copy → Log tab, on staging |
| **P2 Server** (runs alongside P1) | W1–W4 | `/device-api/v1` live on staging: pairing, inbox, copy, telemetry; AI message job; "Devices" panel in Settings | Connector simulator passes against staging · **S02: routes, migration and AI job built behind a flag, 27 + 12 tests green locally. Settings UI and staging deploy still open** |
| **P3 EVT** | W3–W9 | Schematic, 4-layer 0.4 mm layout, 15 PCBA (PCBWay), 15 CNC enclosures, glass samples | **G1:** Z ≤ 5.0 mm (or approve 5.5) · Qi charges through glass+LCD at ≥ 2.5 W, coil ΔT < 10 °C · Wi-Fi RSSI ≥ −75 dBm at 10 m in the closed case |
| **P4 DVT** | W9–W15 | Rev B fixes, 30 units, drop (1 m × 6 faces), IP54 spray, 72 h battery soak, pre-scan EMC | **G2:** pre-scan passes with ≥ 3 dB margin · BSEC readings within ±1 °C / ±5 %RH of a reference after case-heat compensation |
| **P5 Certification** | W14–W20 | FCC 15B/15C, ISED, CE RED, UN38.3 | **G3:** grants issued |
| **P6 PVT — 100 units** | W18–W22 | 110 built, 100 pass, serialised `001–100`, flashed, paired-ready, boxed | **G4:** FPY ≥ 90 %, 100 % functional test log |
| **P7 Ship & learn** | W22+ | OTA channel, field telemetry, v2 brief (LOT puck charger, BLE phone relay) | |

**Fastest realistic ship date: ~W22 ≈ late April 2027.** The critical path is EVT → certification, not the PCB.

## Critical path & risks

| Rank | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R0 (S02) | LS013B7DH03 panel lead time: 28 weeks at DigiKey, 0 stock | High | High (blocks EVT at W3) | Order 20 panels now via Future Electronics or Data Modul. Bench breakout on Tindie. Fallback: LS013B7DH05 (1.26″ 144×168) if stock exists |
| R1 | 5 mm Z not achievable with sourced cell/camera | High | High | Side-by-side layout; 2.2 mm cell; pre-approve 5.5 mm fallback at G1 |
| R2 | Qi through LCD heats or won't couple | Medium | High | Test in P1 with a Qi eval board + LCD sample on the bench; NCVM back-insert fallback |
| R3 | RF detuned by steel case | High | Medium | Antenna at the glass edge, tuning pads in the matching network, VNA tuning at EVT |
| R4 | Slim camera module unavailable at 100 MOQ | Medium | Medium | Two module houses quoted in P1; camera can be depopulated for a "v1-lite" |
| R5 | BME688 reads case heat, not the weather | High | Low | Thermal slot in PCB, sample after 10 min of sleep, BSEC offset; server also has API weather (`/api/weather`) as the ground truth |
| R6 | Certification cost > parts cost | Certain | Medium | Decide D-1/D-5 now; one lab, combined FCC+CE package |
| R7 | Mirror finish scratched in assembly | Medium | Medium | Polish last, peel-film on Part A until boxing |
| R8 | Battery shipping (Li-ion) | Low | Medium | UN38.3 report, ship as "batteries contained in equipment" (UN3481, PI 967) |

## Analysis — is this the right product shape?

**What's strong.** The LOT site already makes context-aware AI prompts (memory engine, circadian phase, weather in the log context). A one-line ambient screen is the smallest possible physical surface for that, and Copy closes the loop back into the Log. The memory LCD matches that: always on, no glow, reads like printed metal.

**What's hard.** A 5 mm steel square is a sealed RF and induction shield. Every radio problem here comes from the material choice. The plan keeps the polished back as pure steel and pushes all of the "electrical" side — glass, display, coil, antenna, camera — to the front. That trade-off is honest and worth keeping.

**What to cut if the schedule slips.** Drop the camera first (removes R4, saves ~1 mm of design pain and ~$6). Keep BME688 and the LRA; they are cheap and make the device feel alive.

**Software first.** P1 and P2 need no custom hardware. The whole user loop (AI message → device → Copy → Log) can be proven on a $15 devkit before any money goes to steel.
