# LOT® Pager — Roadmap & Analysis

Dates assume S-2 decisions arrive promptly; elapsed durations are estimates.

| Phase | Weeks | Deliverable | Gate |
|---|---|---|---|
| P0 Plan | done 2026-10-06 | This doc set | S-2 approves height + form decision |
| P1 Dev-kit proof | 1–3 | Waveshare board shows server notification; button writes Log event | End-to-end demo |
| P2 Server API | 1–3 (parallel) | `/api/device/*`, claim flow, `device_copy` in Log tab | API tests green |
| P3 Schematic + PCB v1 | 3–8 | KiCad, 4-layer 40×40, DFM check, PCBWay quote | Quote + DFM pass |
| P4 Enclosure v1 | 4–9 | CAD of 2 SS parts, Qi window test with mockups | Qi charges ≥ 300 mA through stack |
| P5 EVT (5–10 units) | 9–14 | PCBWay boards + CNC prototypes | Radio, battery, thermal pass |
| P6 DVT + docs | 14–18 | Firmware 1.0, PDF manuals, test jig | 20 units pass full test |
| P7 PVT / 100-unit run | 18–24 | 100 assembled units | Yield ≥ 95 %; certification plan |

## Analysis
- **Critical path:** enclosure + Qi-through-steel (P4), not firmware.
- **Cheapest de-risking:** buy a 316L sheet 0.8 mm and a Qi RX now; measure charge current through it (1 day, ~$40).
- **Software is the easy part:** the existing server has `/logs` and SSE; the device API is ~4 routes.
- **Cost lever:** drop BME688→BME280 (−$6), camera optional SKU (−$4), 304 instead of 316L.
- **Schedule risk:** polishing + CNC lead times, certification if sold. Internal/inventor-use units avoid certification.
