# Roadmap & Analysis — LOT Computer

Dates assume go-ahead 2026-11-02. Gates are pass/fail; no phase starts until the previous gate is green.

| Phase | Weeks | Deliverable | Gate |
|---|---|---|---|
| **P0 Decide** | 0–1 | Resolve §3 conflicts (height, Qi through steel, RF); read brand/CQGS; Copy semantics | Signed spec v1 |
| **P1 Backend** | 1–3 | Device token table + `/api/device/*` + notify queue + `hw.*` Log events + Log-tab device badge (see FIRMWARE-API) | Simulated device passes e2e test |
| **P2 Breadboard (EVT-0)** | 2–5 | Dev-kit build: screen, button, BME688, camera, Wi-Fi, sample steel RF/Qi test | Message shows ≤3 s; button → Log row; Wi-Fi through steel window measured |
| **P3 PCB v1 (EVT-1)** | 5–9 | KiCad design, PCBWay 5-pc proto (≈ 2 wks fab+asm), firmware on real board, `lotctl` | Boots, all sensors read, charges on pogo |
| **P4 Body proto** | 7–11 | 3 CNC 316L shells + polish; fit-check; Qi disc test | Closes, 8 mm, charges wirelessly ≥ 3 W |
| **P5 DVT** | 11–16 | 20 units; battery life, thermal, drop, RF pre-scan, privacy review | 7-day battery at 5-min poll; pre-scan pass |
| **P6 PVT / pilot** | 16–20 | 100-unit run (PCBWay PCBA + shell batch); PDF manual set final | ≥ 92% yield; units shipped |

## Analysis
- **Critical path:** shell machining + polish (4–6 wk lead) and Qi-through-window. Order shell RFQs during P2.
- **Biggest risks:** (1) 5 mm height (decided 8 mm); (2) RF through steel; (3) battery shipping/cert; (4) US-made claim vs PCBWay; (5) camera privacy perception.
- **Cheapest de-risk:** $400 EVT kit + one steel block (P2) before committing to PCB spin.
- **Software surface is small:** 1 table, ~6 routes, 1 scheduled job, 1 Log-tab filter. Reuses existing `Log` (`event`,`text`,`metadata`).
- **100-unit economics:** ~$170–200/unit at this volume; shell machining is ~45% of cost — casting/MIM at 1k+ drops it ~70%.
- **Docs plan (PDF):** User Manual, Quick Start card, Firmware Guide, Device API Spec, Assembly & Test Guide, Regulatory File — each separate, built from MD (`docs/hardware/*.md` → PDF).
