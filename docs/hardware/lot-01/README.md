# LOT·01 — Hardware Computer for LOT-systems.com

A **40 × 40 × 5 mm two-part stainless-steel square**. One side is a polished mirror. The other side has a memory-LCD screen, a camera and a **Copy** key. It buzzes like a pager when the LOT site's AI sends a moment ("Coffee time!"). Pressing Copy writes that moment to your **Log** tab on lot-systems.com. It charges wirelessly (Qi), screen-down.

## Documents (one discipline each)
| # | File | What |
|---|---|---|
| 0 | [`SESSION-STATE.md`](SESSION-STATE.md) | **Compressed state**: read this first each session |
| 1 | [`01-PLAN.md`](01-PLAN.md) | Requirements, architecture, physics problems, Z stack, power, open decisions |
| 2 | [`02-BOM.md`](02-BOM.md) | Components buying list with links, cost roll-up, NRE |
| 3 | [`03-ROADMAP.md`](03-ROADMAP.md) | Phases P0–P7, gates, risks, analysis |
| 4 | [`04-ENCLOSURE.md`](04-ENCLOSURE.md) | Part A / Part B stainless body, tolerances, openings |
| 5 | [`05-PCB-PCBWAY.md`](05-PCB-PCBWAY.md) | Board spec, PCBWay quote checklist, schematic blocks, pin plan |
| 6 | [`06-FIRMWARE.md`](06-FIRMWARE.md) | Firmware architecture, state machine, power, OTA, factory flashing |
| 7 | [`07-LOT-API-CONNECTOR.md`](07-LOT-API-CONNECTOR.md) | `/device-api/v1`: pairing, inbox, Copy → Log, security |
| 8 | [`08-CHARGER.md`](08-CHARGER.md) | Qi charging approach, v1 pad, v2 LOT puck |
| 9 | [`09-USER-MANUAL.md`](09-USER-MANUAL.md) | End-user manual |
| 10 | [`10-MANUFACTURING-100.md`](10-MANUFACTURING-100.md) | 100-unit PVT flow, QC, shipping |

## Code
| Path | What | Verified |
|---|---|---|
| `firmware/` | PlatformIO project (ESP32-S3): `main.cpp` state machine, `lot_api` client, `hw` drivers | Not compiled: no toolchain in this environment |
| `connector/device-api.draft.ts` | Fastify plugin for the server (not wired in) | Not type-checked: repo deps not installed in this environment |
| `connector/20261122120000_create-lot-devices.draft.cjs` | DB migration draft | Not run |
| `connector/lot-device-sim.mjs` | Zero-dependency mock server + device simulator | ✅ `node connector/lot-device-sim.mjs --selftest` passes 10/10 checks |

## PDF manuals → [`pdf/`](pdf/)
`LOT-01_User-Manual.pdf` · `LOT-01_Firmware-Manual.pdf` · `LOT-01_LOT-API-Connector.pdf` · `LOT-01_Manufacturing-Manual.pdf` · `LOT-01_Plan-BOM-Roadmap.pdf`
Rebuild them with `NODE_PATH=$(npm root -g) ./build/make-pdfs.sh` (needs pandoc + Playwright).

## Session reports → [`reports/`](reports/)
