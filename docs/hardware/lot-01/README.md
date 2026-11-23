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
| 11 | [`11-P1-BENCH-ORDER.md`](11-P1-BENCH-ORDER.md) | P1 bench buying list with links, PCBWay quote request text, long-lead items |

## Code
| Path | What | Verified |
|---|---|---|
| `src/server/routes/device-api.ts` (repo) | **Live server routes** behind `LOT_DEVICES_ENABLED` | ✅ tsc + server build green · ✅ 27/27 `connector/device-api.itest.mjs` on Postgres 16 |
| `src/server/utils/device-nudges.ts` (repo) | Hourly AI "Coffee time!" job | ✅ in the itest (caps, gap, quiet hours, AI-down fallback) |
| `migrations/20261123120000_add-lot-devices.cjs` (repo) | Device tables | ✅ applied with all repo migrations on Postgres 16 |
| `firmware/` | PlatformIO project (ESP32-S3) | ✅ `lot_api.cpp` 12/12 native test against the real routes · ❌ full `pio run` blocked (no toolchain network) |
| `firmware/test/native/` | Host shims + test driver | `run.sh` |
| `connector/lot-device-sim.mjs` | Zero-dependency mock + simulator | ✅ selftest |

## PDF manuals → [`pdf/`](pdf/)
`LOT-01_User-Manual.pdf` · `LOT-01_Firmware-Manual.pdf` · `LOT-01_LOT-API-Connector.pdf` · `LOT-01_Manufacturing-Manual.pdf` · `LOT-01_Plan-BOM-Roadmap.pdf`
Rebuild them with `NODE_PATH=$(npm root -g) ./build/make-pdfs.sh` (needs pandoc + Playwright).

## Session reports → [`reports/`](reports/)
