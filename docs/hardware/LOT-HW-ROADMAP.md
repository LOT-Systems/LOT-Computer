# LOT HW-0 ROADMAP (analysis)

Assumes start 2026-11-10. Durations are typical for a first-time hardware team; PCBWay + CNC lead times dominate.

| Phase | Weeks | Window | Exit criteria | Cash |
|---|---|---|---|---|
| 0 Decisions | 2 | Nov 10–Nov 24 | Choose thickness (R1), charging window (R2), display type | $0 |
| 1 Breadboard proof | 4 | Nov 24–Dec 22 | ESP32-S3 devkit + display + BME280 receives notification, Copy → Log row | $300 |
| 2 Site API | 3 (parallel) | Dec 1–Dec 22 | `/api/device/*` live, pairing, tests, docs/API.md | dev time |
| 3 EVT (5 boards) | 8 | Jan 5–Mar 2 | Schematic, PCB, PCBWay proto, 3D-printed + 1 CNC steel shell | $1.5–2.5k |
| 4 DVT (30) | 8 | Mar 2–Apr 27 | Body final, Qi working through window, 24 h soak, drop/scratch | $5–8k |
| 5 Compliance pre-scan | 4 | Apr 27–May 25 | FCC/CE pre-scan, UN38.3 plan | $3–10k |
| 6 PVT / 100-unit run | 8 | May 25–Jul 20 | 100 units pass jig test, PDF manuals, OTA signed | $5–7k |

**Critical path:** body CNC + polish (3–5 wk/spin) → Qi window integration → compliance.
**Schedule risk:** 30–40% slip likely at DVT. First shippable 100 units realistic **Jul–Sep 2027**.
**Budget:** ≈ $15–30k all-in for 100 units incl. tooling/test (≈ $150–300/unit amortised), $45–65/unit marginal.
**Next 3 actions (this week):** (1) answer R1/R2; (2) order ESP32-S3 devkit, e-paper 1.54", BME280, Qi RX kit; (3) scaffold `device-api.ts` + migration.
