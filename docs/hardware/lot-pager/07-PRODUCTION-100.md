# LOT® PAGER — 100-Unit Production Run

## 1. Build plan
| Step | Who | Lead time | Notes |
|---|---|---|---|
| Gerber/BOM freeze | LOT | — | After DVT pass |
| PCB fab + SMT, 110 pcs | PCBWay | 3–4 wk | Consign scarce ICs |
| CNC 316L, 110 sets | PCBWay CNC / local shop | 3–5 wk | +10 % scrap |
| Polish (back plates) | Shop | 1–2 wk | Mirror finish yield ~85 % |
| Windows (camera, screen, antenna strip) | Glass/sapphire vendor | 3 wk | Custom |
| Battery, coil, displays, cameras | Distributor | 1–6 wk | Order early |
| Final assembly + test | LOT (or EMS) | 2 wk | Jig + test script |
| Pack + Qi pad | LOT | 1 wk | |

## 2. Test fixture (per unit)
1. Flash + provision (UART/pogo), burn device ID/QR.
2. Self-test: display colour bars, button, buzzer, sensors read within range, camera frame, Qi charge current, Wi‑Fi RSSI through the closed shell.
3. 24 h burn-in at 5 units/shelf; sample 10 for 72 h.
4. Log results per serial in a CSV; fail → rework bin.

## 3. Compliance (needed before sale, not for internal pilot)
FCC Part 15 (unintentional + intentional radiator via modular ESP32 cert reuse – antenna change may void; budget pre-scan), CE‑RED, UN38.3 for the cell, IEC 62368‑1, RoHS. Pre-scan $2–4k; full ~$10–20k. Internal-only distribution of 100 units avoids sale but not safety risk (battery).

## 4. Costs (100 units, +10 % overage)
Per 02-BOM: **$9–15k** parts+fab, **$1.5–4k** NRE, **$2–4k** pre-scan. Total **$12–23k**.

## 5. Acceptance
Yield ≥ 90 %, 7‑day battery claim ≥ 5 days measured, Qi charge 0→90 % ≤ 90 min, notification latency p95 ≤ 30 s, zero thermals > 40 °C, 1 m drop onto hardwood ×6 faces.
