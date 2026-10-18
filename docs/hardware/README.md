# LOT Computer — Hardware Program (HW)

Index of separate documents (logic item 11). Compressed state (item 8) is at the bottom; update it each session.

| Doc | Purpose |
|---|---|
| [01-PLAN.md](01-PLAN.md) | Concept, requirement map (19 items), mechanical stack, risks, roadmap |
| [02-BOM.md](02-BOM.md) | Components buying list, links, cost estimates, 100-unit run |
| [03-FIRMWARE-API.md](03-FIRMWARE-API.md) | Firmware design, LOT API connector, Log-tab "Copy" signal, software tooling |
| [04-MANUALS-PIPELINE.md](04-MANUALS-PIPELINE.md) | How PDF manuals are generated from these docs |

## Compressed state (session 1 — 2026-10-18)
- Device: 40x40 mm, 2-part stainless square; polished back, front = screen + camera + button; Qi charging; ESP32-S3.
- Status: PLAN + BOM + API spec drafted. Nothing ordered. Nothing built.
- Blockers: (1) 5 mm height not achievable with camera+screen+battery+coil — EVT at ~8 mm; (2) stainless blocks Qi — needs non-metal charging window; (3) lot-systems.com / brand / institute pages not readable from the build sandbox — brand styling not yet applied; (4) prices are estimates until PCBWay quotes.
- Next: decisions D1–D5 in 01-PLAN.md, then EVT schematic.
