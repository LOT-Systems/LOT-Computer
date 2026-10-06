# LOT® Pager — Plan (v0.1)

## 1. Product in one paragraph
A flat, square stainless-steel object. One face polished mirror steel; the other carries a small screen, a camera and one button. It sits on a Qi pad. When the LOT site (lot-systems.com) decides something is worth interrupting you for ("Coffee time!"), the device shows it and buzzes like a pager. Pressing the button acts as "Copy": it signals back and an entry appears in the site's **Log** tab. It also reads the room (weather-class sensors) and reports it to LOT.

## 2. Requirement trace (your 19 points)
| # | Requirement | Where addressed |
|---|---|---|
| 1 | PCBWay | BOM §Fab, ROADMAP P3/P5 — PCB + SMT assembly + CNC at PCBWay |
| 2 | Pager-like notifications from AI site | SOFTWARE-CONNECTOR §3, FIRMWARE §4 |
| 3 | 2-part stainless body | §4 below |
| 4 | Flat silver 4×4 cm × 5 mm | §4 — **5 mm infeasible in v1; see §5** |
| 5 | Camera | OV2640 (v1), FIRMWARE §6 |
| 6 | LOT API connector | SOFTWARE-CONNECTOR |
| 7 | PDF manuals | `pdf/` built from MANUAL-USER.md |
| 8 | Compress info each session | README STATE block + session reports |
| 9 | Firmware documents | FIRMWARE.md |
| 10 | Software to connect with firmware | SOFTWARE-CONNECTOR §5 (host CLI) |
| 11 | Separate documents | one file per concern |
| 12, 19 | Charger / wireless charger | Qi receiver + Qi pad (BOM) |
| 13 | 100-unit run | BOM §cost, ROADMAP P5 |
| 14, 15 | Weather + AI-grade off-the-shelf sensors | BME688 (BSEC gas-AI), VEML7700, IMU |
| 16 | Button "Copy" → Log tab | SOFTWARE-CONNECTOR §3.3 |
| 17, 18 | Polished back; camera+screen+button front | §4 |

## 3. Architecture
```
 lot-systems.com (Fastify/Postgres)            Device (ESP32-S3)
 ┌─────────────────────────┐   HTTPS / TLS   ┌──────────────────────┐
 │ AI engine → decides     │  ───────────►   │ poll/SSE client      │
 │ notification            │  notify (JSON)   │ screen + piezo/haptic│
 │ /api/device/*           │  ◄───────────    │ button "Copy"        │
 │ Log tab (event log)     │  event, telemetry│ BME688 IMU light cam │
 └─────────────────────────┘                  └──────────────────────┘
```
- Device is a thin client: it never runs AI. Server owns decisions, rate limits, and quiet hours.
- Auth: per-device token minted by a claim code the user enters on the site (SOFTWARE-CONNECTOR §2).
- Transport: HTTPS long-poll (battery-friendly, works through any NAT), upgrade to SSE later.

## 4. Mechanical (2-part stainless)
- Material: 316L (skin-safe, polishable) or 304 (cheaper). Recommend 316L for the polished face.
- Part A "mirror": 40×40 mm plate, mirror polish (Ra < 0.05 µm). Qi charges through it only if thin and low-permeability — **austenitic steel attenuates Qi strongly**. Plan: put the Qi coil against a non-metal window or thin (≤0.3 mm) section, or make the *front* part carry a plastic/ceramic charging window. This is the #1 mechanical risk (R2).
- Part B "face": 40×40 mm tray with display window, camera aperture (sapphire/glass), button hole. Parts join with 4 hidden screws or laser weld + gasket.
- Silver look: bead-blast or satin on Part B, mirror on Part A.

## 5. Height analysis (the 5 mm problem)
| Layer | mm |
|---|---|
| Part A plate | 0.8 |
| Ferrite + Qi coil | 0.8 |
| Thin LiPo (e.g. 3 mm cell) | 3.0 |
| PCB + components | 1.2 (module is 3.1 alone) |
| Display module (1.28" round) | 2.0 |
| Part B front/ window | 0.8 |
| Camera module (lens stack) | ≥3.5 (bump) |
| **Total (v1 estimate)** | **≈ 9–10 mm** |
Conclusion: v1 target **≤ 10 mm**; 5 mm needs bare-die display, a custom flex PCB, a ≤1.5 mm cell, and a pinhole-class camera: a v2 research item. Decision needed from S-2.

## 6. Risks
| ID | Risk | Mitigation |
|---|---|---|
| R1 | 5 mm height | Stage: v1 ≤10 mm, v2 5 mm |
| R2 | Qi through steel | Charging window or contact pads (pogo) fallback |
| R3 | Wi-Fi antenna inside steel box | Use antenna aperture/plastic window; module with external antenna keepout |
| R4 | Battery life with camera + Wi-Fi | Deep sleep, camera off by default, poll 30–60 s |
| R5 | Privacy of camera | Hardware shutter or LED + explicit capture only |
| R6 | Heat from charging → sensor reads high | Compensate in firmware; place BME688 away |
| R7 | Radio certification (FCC/CE) for sale | Use pre-certified module; budget lab |
| R8 | Li-ion in sealed steel | UN38.3, protection IC, vent consideration |
