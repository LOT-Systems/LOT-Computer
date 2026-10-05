# LOT COMPUTER — HARDWARE PROGRAM (codename PAGER-0)

LOT Systems Corporation · Inventor: Vadik Marmeladov · COSMO® CIA
Status: PLAN / pre-EVT · Last session: 2026-10-05 (S01)

A 4×4 cm, 5 mm stainless-steel pager-class device wired to lot-systems.com.
Receives autonomous AI notifications ("Coffee time!"), shows them on a small
screen, and sends a "Copy" button press back to the site's Log tab.

## Document set (separate documents, per brief item 11)

| # | File | Purpose |
|---|------|---------|
| 01 | [01-PLAN-ROADMAP.md](01-PLAN-ROADMAP.md) | Product definition, risks, roadmap, 100-unit run |
| 02 | [02-BOM-BUYING-LIST.md](02-BOM-BUYING-LIST.md) | Components, links, cost estimate |
| 03 | [03-FIRMWARE-SPEC.md](03-FIRMWARE-SPEC.md) | Firmware architecture and docs plan |
| 04 | [04-API-CONNECTOR-SPEC.md](04-API-CONNECTOR-SPEC.md) | LOT API connector + host software |
| 05 | [05-MECH-MANUFACTURING.md](05-MECH-MANUFACTURING.md) | Enclosure, charging, PCBWay, compliance |
| — | [sessions/](sessions/) | One full report per session |
| — | [manuals/LOT-PAGER-0-MANUAL.pdf](manuals/LOT-PAGER-0-MANUAL.pdf) | PDF manual (generated) |

## Session digest (compressed memory, item 8)

Update this block every session; keep it under 15 lines.

- S01 (2026-10-05): Plan, BOM, specs, roadmap written. brand/institute sites
  unreachable from the sandbox (egress blocked), so brand rules taken from
  docs/technical/LOT-STYLE-GUIDE.md. Top risks: (1) 5 mm height with camera +
  screen + battery, (2) Qi through stainless steel, (3) camera privacy.
  Decisions needed from Vadik: see 01 §6.
  Next: pick MCU/display, order EVT dev kits, add /api/device endpoints.
