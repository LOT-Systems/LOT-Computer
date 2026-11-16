# LOT SQ-1 — Roadmap & Engineering Analysis

**Document:** LOT-SQ1-03 · **Version:** 0.1 · **Date:** 2026-11-15

## 1. Phases

| Phase | Weeks | Output | Gate to exit |
|---|---|---|---|
| **P0 Concept** (this session) | 0 | Plan, BOM, API contract, firmware skeleton, manuals | Inventor approves the spec |
| **P1 Breadboard** | 1–3 | ESP32-S3 DevKit + BME688 + LSM6DSOX breakouts + 1.54" EPD + OV2640 board, running `firmware/` against the live staging API | End to end: site → screen → COPY → Log |
| **P2 Server connector** | 2–4 (parallel) | `device-api` plugin wired into lot-systems.com, device pairing UI in Settings, Log tab renders `device_*` events | Mock simulator passes against staging |
| **P3 EVT-1** | 4–8 | First PCB (module version, 6.0 mm), 3D-printed and CNC aluminium shells, 10 boards from PCBWay | Battery life ≥ 5 days, Qi charge through the glass ≥ 2 W |
| **P4 EVT-2** | 8–12 | Chip-down ESP32-S3R8, 0.6 mm PCB, first 316L parts + mirror polish, 10 units | Z ≤ 5.5 mm, RSSI ≥ −75 dBm at 10 m in the steel case |
| **P5 DVT** | 12–16 | 20 units, final glass, test jig, FCC pre-scan | Pre-scan margin ≥ 3 dB, drop 1.2 m ×10 |
| **P6 Certification** | 14–20 | FCC Part 15, CE RED (if EU), UN38.3 battery transport | Grants issued |
| **P7 PVT / Pilot 100** | 18–24 | 100 + 15 spare units, packaging, PDF manuals printed | Yield ≥ 90%, every unit paired + burned in |

Critical path: **EVT-2 mechanics → RF in steel → certification.** Software (P2) is not on the critical path and should start right away.

## 2. Engineering analysis of the brief

### 2.1 Z-stack: can it be 5 mm? (R1)

| Layer (front → back) | Thickness |
|---|---|
| Cover glass 0.4 + OCA 0.1 | 0.50 |
| E-paper panel | 1.00 |
| Qi coil + ferrite (behind the EPD) | 0.50 |
| PCB 0.6 mm + tallest SMD 0.9 mm in the battery-free zone | 1.50 |
| Li-Po (beside the components, under the EPD) | 1.50–2.00 |
| Back plate 316L | 0.40 |
| Tolerance / foam | 0.10 |
| **Total** | **5.5–6.0 mm if stacked, 5.0 mm only if the battery and components share one plane** |

**HW-02 update:** `tools/zstack.py` shows the frame board reaching 4.6 mm with a 2.0 mm cell (~107 mAh, ~11 days). See 04-MECHANICAL §3. Original HW-01 conclusion kept below for the record.

**HW-01 conclusion:** 5.0 mm works only if the PCB is an **L-shaped "frame board"** with the battery nested in a cut-out next to it, not under it. The camera module (≤3.5 mm) goes through a PCB cut-out in the bottom strip. Plan for **5.5 mm at EVT-2** and push to 5.0 mm in DVT. If 5.0 mm is a hard brand constraint, it costs about 30% battery capacity.

### 2.2 Stainless steel vs. radio and wireless charging (R2)

A closed steel box is a Faraday cage. A mirror-polished steel back placed on a Qi pad will heat up from eddy currents and will not charge.

* **Qi through face A.** The coil sits behind the e-paper, and the Dock charges the device **face-down** in a cradle. The 1.4 mm of glass + EPD is within Qi Rx coupling range for a small coil, but expect about 2–2.5 W and 60–70% efficiency. A full charge takes about 1 h, which is fine for a 100 mAh cell.
* **Antenna.** Place it at the edge of the glass window on face A. The insulated seam between the two steel parts (0.15 mm isolator) also works as a slot aperture. Tune with a VNA in the real case at EVT-2.
* **Fallback (option B).** The two insulated steel parts double as **charging contacts** (front = V+, back = GND), with an ideal-diode, OVP and a charger-presence handshake. The only cost is the Dock geometry. Keep this on the EVT-2 board as a DNP footprint.

### 2.3 Polished face durability (R5)

A #8 mirror on 316L shows scratches fast. Options: (a) accept patina as "LOT honesty", (b) clear PVD/DLC hard coat for +$4–6, or (c) ship a microfibre pouch. **Recommend (a) + (c)** for the pilot.

### 2.4 "AI-grade off-the-shelf sensors"

* **BME688.** Bosch AI-Studio trains gas-scan classifiers (coffee brewing, fresh air, cooking, stale room) and runs them on the device through BSEC2. This links the sensor directly to site moments: the device smells coffee brewing, and the site sends "Coffee time!" or logs it.
* **LSM6DSOX MLC.** Its decision-tree core runs on the IMU itself, so the ESP32 can stay in deep sleep while the IMU detects double-tap, pick-up and "on desk" vs. "in pocket". It wakes the MCU only when needed.

### 2.5 Session compression (brief #8)

On the device, each sync session reports a **delta** (sensor deltas, battery %, unseen events) as compact JSON (< 300 B). The server answers with a single notification plus `next_sync_s`. On the documentation side, `SESSION-STATE.md` is a ≤ 60-line compressed carry-over that every scheduled session reads first and rewrites last.

## 3. Decisions needed from the Inventor

1. **Height:** hard 5.0 mm (smaller battery, about 5 days of life) or 5.5 mm (about 8–10 days)?
2. **Charging:** Qi face-down Dock (recommended) or steel-contact Dock (option B)?
3. **Camera use:** Log photo only, or also a Mirror widget snapshot?
4. **Markets:** US only (FCC), or US + EU (CE RED adds about $4–6k)?
5. **Price point** for 100 pilot units (unit cost about $117–183 + NRE)?

## 4. Session log

| Session | Date | Done |
|---|---|---|
| HW-01 | 2026-11-15 | P0 concept: plan, BOM, API v1 contract, firmware v0.1 skeleton, mock + simulator (14/14), 8 PDFs |
| HW-02 | 2026-11-16 | Consolidated 15 parallel branches into this one (doc 09). Firmware v0.2: portable `lot_core` + 43 host tests. Z-stack tool → D1 can be 5.0 mm. |

## 5. Next session (HW-03) plan

1. KiCad schematic for EVT-1 (module board) using the pin map in 05 §4; export a netlist.
2. SoftAP pairing portal (`provision.*`) to replace the serial provisioning.
3. If D6 = yes: wire `device-api.ts` into `src/server/routes` behind `DEVICE_API_ENABLED`, plus the migration and Log rendering of `device_*` events (a working version already exists on branch `brave-lamport-c0sqik`, see doc 09).
4. Front frame + back plate STEP drafts for a PCBWay CNC quote.
