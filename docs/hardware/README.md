# LOT Pager — Hardware Program (HW-0)

Owner: Vadik, Inventor, COSMO® CIA · Program start: 2026-11-02 · This consolidation: S3, 2026-11-11

A 40 × 40 mm stainless-steel pocket computer. It shows autonomous notices from lot-systems.com ("Coffee time!") on a small screen. One button, "Copy", sends the notice back to the site's **Log** tab.

## Document set (each one stands alone; PDFs in `pdf/`)
| # | Document | What it is | Status |
|---|---|---|---|
| 01 | [Plan & roadmap](LOT-HW-01-PLAN-ROADMAP.md) | Product, 19-point trace, mechanics, schedule, budget | v0.3 |
| 02 | [BOM](LOT-HW-02-BOM.csv) · [Buying list](LOT-HW-02-BUYING-LIST.md) | Parts, prices (estimates), where to buy | v0.3 |
| 03 | [LOT API connector](LOT-HW-03-API-CONNECTOR.md) | Site ↔ device contract | **Implemented + tested** |
| 04 | [Firmware](LOT-HW-04-FIRMWARE.md) | ESP32-S3 architecture, scaffold in `hardware/firmware/lot-pager` | v0.1 scaffold |
| 05 | [Companion software](LOT-HW-05-SOFTWARE.md) | Simulator/CLI, e2e test | Working |
| 06 | [Manufacturing, 100 units](LOT-HW-06-MANUFACTURING-100.md) | PCBWay, steel body, test jig, compliance | Plan |
| 07 | [User manual](LOT-HW-07-USER-MANUAL.md) | What ships in the box | Draft |
| 08 | [Decisions R1–R3](LOT-HW-08-DECISIONS.md) | Thickness, charging through steel, RF | **Waiting on Vadik** |
| — | [Session reports](sessions/) | One compressed report per session | S3 |

## Code in this repo
- `src/server/models/device.ts`, `migrations/20261111120000_create-devices.cjs` — paired devices (token hash only)
- `src/server/routes/device-api.ts` — `/api/devices*` (user) and `/api/device/*` (device)
- `src/client/components/Logs.tsx` — `device_copy` renders as `PAGER:` in the Log tab
- `hardware/firmware/lot-pager/` — firmware v0.1 (PlatformIO, Arduino-ESP32)
- `hardware/tools/lot-pager-sim.mjs` — device simulator / companion CLI
- `hardware/tools/device-api-e2e.mjs` — 23-check end-to-end test (real Postgres)
- `hardware/tools/build-pdfs.mjs` — regenerates `pdf/` from these Markdown files

## Not reachable from the build sessions
lot-systems.com, brand.lot-systems.com and institute.lot-systems.com are blocked by the session network policy (proxy 403). Brand language here comes from the repo only. Add those hosts to the environment's allowlist so a session can read them.
