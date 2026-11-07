# 06 — ROADMAP, RISKS, DECISIONS

## Phases
| Phase | Weeks | Deliverable | Exit |
|---|---|---|---|
| 0 Plan *(done 2026-11-07)* | 0 | These docs + PDFs | Approved by S-2 |
| 1 Software spine | 1–3 | Prisma models, `/api/device/*`, AI job, Log "copy" entry, mock device script | Mock `curl` Copy appears on Log tab |
| 2 EVT breadboard | 2–5 | ESP32-C3 + memory LCD + sensors firmware; power measurement | End-to-end on desk |
| 3 CAD + PCB design | 4–8 | KiCad board, Fusion/SolidWorks body, stack proof | DFM pass |
| 4 DVT order | 8–12 | 5 units from PCBWay | Fit/charge/RF tests |
| 5 PVT | 12–16 | 20 units, certs pre-scan, manuals v1 | QA ≥90 % |
| 6 MP-1 100 units | 16–22 | 100 units, charger, packaging | Delivery |

## Risks
R1 5 mm stack won't close → fallback 6.5 mm or drop haptics/camera. R2 Qi through glass window weak → move coil to larger ring. R3 Steel detunes antenna → antenna keep-out/external FPC antenna on glass edge. R4 Mirror polish cost/yield. R5 Li-ion in 5 mm: thermal, swelling. R6 Camera privacy. R7 Compliance cost.

## Decisions needed from S-2
1. Accept glass window on Face B (C1)? (recommended) — or ceramic back.
2. Camera in run #1, or leave footprint DNP (reduces risk/cost)?
3. Screen: memory LCD (recommended) vs OLED vs e-paper.
4. Open the sandbox allow-list for `*.lot-systems.com` so brand/CQGS/About can be read and applied.
5. Firmware in this repo (`firmware/`) or separate repo?
6. Budget cap for MP-1.

## Next session (proposed)
Read brand site; implement Phase 1 server (models, routes, job, tests); create `firmware/lot-p1` skeleton; KiCad project skeleton.
