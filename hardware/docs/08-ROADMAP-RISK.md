# 08 · ROADMAP + RISK ANALYSIS

```
DOCUMENT  HW-08-ROADMAP   ISSUE 2026.11.25      CLASS INTERNAL / PLAN
```

## 01 · Phases

Dates assume work starts the week of 2026-11-30 and that one engineer
(firmware/electrical) and one mechanical contractor are engaged. The Chinese
New Year factory shutdown (mid-February 2027) is built in.

```
2026        DEC          2027 JAN       FEB          MAR          APR          MAY          JUN
            │            │              │            │            │            │            │
EVT-0  ████████████      bench kit · firmware v0.2 · server S-1..S-3 · WLC eval
EVT-1              ███████████████      first PCB (10) · CNC sample (10) · fit + RF + charge
                                    ░░░  CNY shutdown
EVT-2                                     ████████████  rev-B PCB · camera · pairing · 6 mm/5 mm decision
DVT                                                    ████████████  20 units · glass tooling · cert pre-scan · beta users
PVT / RUN                                                           ████████████████  100 units
SHIP                                                                              ▲ 2027-06
```

| Phase | Weeks | Goal | Exit gate |
|-------|-------|------|-----------|
| **EVT-0 bench** | 1–4 | Everything works on breakouts; server API live on staging | Copy on bench kit creates a `device_copy` row on staging; NFC-WLC charges a cell through glass + LCD stack ≥ 100 mW |
| **EVT-1 first board** | 5–10 | First 38 × 38 PCB in a first steel body | Boots, displays, syncs, sleeps at ≤ 20 µA; Wi-Fi RSSI loss in steel ≤ 10 dB; thickness measured |
| **EVT-2** | 11–16 | Camera, pairing, IMU, rev-B fixes | All 19 requirements demonstrated on one unit; final height decided (5.0 or 6.0 mm) |
| **DVT** | 17–22 | 20 units, final materials | 10-day battery test pass; drop 1 m × 10; sweat / salt-fog 24 h; FCC/CE pre-scan pass; 5 beta users for 2 weeks |
| **PVT + run** | 23–30 | 110 built, 100 shipped | Yield ≥ 90 % at final test; cosmetic AQL pass on Side A |

## 02 · Next 10 actions (in order)

1. Order the prototype kit (doc 02 §G), about $300.
2. Order the PTX30W / PTX130W evaluation kit, the longest-lead learning item.
3. Request quotes: thin Li-Po 1.6 × 25 × 30 mm (3 suppliers), 0.55 mm cover glass (2 suppliers).
4. Server S-1..S-3 (doc 06 §07) on a branch, deploy to staging.
5. Compile firmware for `xiao_bench`, fix, get the first Copy into the staging Log (F-1, F-2).
6. Get 3D models for display, SiP, camera, cell; build the CAD assembly (doc 03 §07).
7. SLA resin mock-ups at 5.0 and 6.0 mm, hold them, decide what you want.
8. KiCad schematic from doc 04, design review against the checklist (doc 04 §07).
9. PCBWay: quote 10 × HDI + PCBA; CNC quote 10 × body sets.
10. Write the notification-generator prompt into the Memory Engine schedule (S-5).

## 03 · Risk register

Score = likelihood (1–5) × impact (1–5).

| ID | Risk | L | I | Score | Mitigation | Owner / gate |
|----|------|---|---|-------|------------|--------------|
| R1 | **5.0 mm not achievable** (camera height, battery thickness, tolerance stack) | 4 | 3 | **12** | Camera in PCB cut-out; 1.6 mm cell; mock-ups at 5.0 / 6.0. A 6.0 mm fallback costs about +40 % battery | Mech / EVT-2 |
| R2 | **Wireless power through glass + LCD stack too weak** | 3 | 4 | **12** | Eval kit test first; coil under display with ferrite; Qi-LP fallback | Elec / EVT-0 |
| R3 | **RF inside steel**: Wi-Fi range poor | 3 | 4 | **12** | Antenna under glass border, 3 mm steel relief, tune in the final body with a VNA; BLE-to-phone relay as fallback path | Elec / EVT-1 |
| R4 | Wi-Fi peak current vs tiny cell: brown-outs | 3 | 3 | 9 | ≥ 3C pulse cell, bulk capacitance, TX power cap, brown-out retry logic | Elec / EVT-1 |
| R5 | Thin custom Li-Po MOQ (often 500–1000) and air-shipping rules (UN38.3) | 4 | 2 | 8 | Ask for sample-lot pricing; buy 150; supplier provides UN38.3 + MSDS | Ops / DVT |
| R6 | Certification: SiP is **not** a pre-certified module the way WROOM modules are | 3 | 4 | **12** | Budget for full FCC Part 15C / CE RED intentional-radiator testing, or switch to a certified ultra-small module (e.g. ESP32-C6-MINI) at +1 mm in X/Y. Selling 100 units in the US still requires FCC authorization | Ops / DVT |
| R7 | BME688 reads high from self-heating inside a sealed steel box | 4 | 2 | 8 | Vent channel, PCB slots, temperature offset compensation from MCU on-time, BSEC2 | FW / DVT |
| R8 | Mirror polish scratches in assembly and shipping | 4 | 2 | 8 | Protective film from polishing until unboxing; final cosmetic inspection | Mech / PVT |
| R9 | PTX30W / LS013B7DH03 supply (single source) | 2 | 4 | 8 | Buy 120 of each at EVT-2, before DVT | Ops / EVT-2 |
| R10 | Server API not ready when hardware is | 2 | 3 | 6 | Mock server exists (connector); S-1..S-3 is ~1 week of work | SW / EVT-0 |
| R11 | Privacy: a camera that uploads to the cloud | 2 | 4 | 8 | Photo only on an explicit 2 s press; on-screen `Photo.`; no autonomous capture; photos visible and deletable in the Log | Product / DVT |

Top four (score 12): R1 height, R2 wireless power, R3 RF in steel,
R6 certification. EVT-0 and EVT-1 are designed to settle R1–R3 cheaply
before money goes into glass tooling and 100 sets of steel.

## 04 · Analysis: is the roadmap realistic?

- **Feasible:** pager function, Copy → Log, weather sensing, AI sensors,
  steel body, PCBWay build, 100 units. These are ordinary engineering with
  known parts.
- **Hard but solvable:** the 5 mm height together with camera, battery and
  wireless charging. Each of these fits on its own; all together leave
  ~0.1 mm margin. The plan keeps a 6 mm fallback so the programme cannot stall.
- **Most underestimated:** certification (R6) and RF in steel (R3). A
  first-time steel product typically needs two antenna iterations.
- **Cost:** about $141 per unit, $26k–35k programme including NRE and
  certification (doc 02 §F). The largest single items are the steel body and
  the display.
- **Time:** about 30 weeks to 100 shipped units (June 2027) if EVT-0 starts in
  the first week of December. The critical path is
  WLC eval → coil freeze → PCB rev-A → steel fit → rev-B → glass tooling.
