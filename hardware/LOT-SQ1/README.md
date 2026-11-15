# LOT SQ-1: the LOT pager

A flat, silver, 40 × 40 × 5 mm stainless-steel square. It shows autonomous notifications from **lot-systems.com** (for example "Coffee time!"). Its single **COPY** button sends the moment back to your **Log** tab.

| | |
|---|---|
| Status | **P0 Concept complete** (session HW-01, 2026-11-15) → next: P1 Breadboard |
| Owner | Vadik Marmeladov, Inventor · COSMO® / LOT Systems |
| Start here | [`SESSION-STATE.md`](SESSION-STATE.md), the compressed state of the project |

## Documents (each one is also a PDF in `manuals/`)

| # | Document | PDF |
|---|---|---|
| 01 | [Plan & system spec](docs/01-PLAN.md) | [pdf](manuals/LOT-SQ1-01-PLAN.pdf) |
| 02 | [Components buying list (BOM + links)](docs/02-BOM.md) | [pdf](manuals/LOT-SQ1-02-BOM.pdf) |
| 03 | [Roadmap & engineering analysis](docs/03-ROADMAP.md) | [pdf](manuals/LOT-SQ1-03-ROADMAP.pdf) |
| 04 | [Mechanical, body & charger](docs/04-MECHANICAL.md) | [pdf](manuals/LOT-SQ1-04-MECHANICAL.pdf) |
| 05 | [Firmware architecture](docs/05-FIRMWARE.md) | [pdf](manuals/LOT-SQ1-05-FIRMWARE.pdf) |
| 06 | [LOT Device API v1 connector](docs/06-LOT-API-CONNECTOR.md) | [pdf](manuals/LOT-SQ1-06-LOT-API-CONNECTOR.pdf) |
| 07 | [User manual](docs/07-USER-MANUAL.md) | [pdf](manuals/LOT-SQ1-07-USER-MANUAL.pdf) |
| 08 | [100-unit pilot run (PCBWay)](docs/08-MANUFACTURING-100.md) | [pdf](manuals/LOT-SQ1-08-MANUFACTURING-100.pdf) |

## Code

| Path | What |
|---|---|
| `firmware/` | ESP32-S3 PlatformIO project (v0.1 skeleton, not yet compiled) |
| `software/server-connector/device-api.ts` | Fastify plugin for lot-systems.com (reference, not registered) |
| `software/mock-server/` | Dependency-free mock of the Device API |
| `software/device-sim/` | Device simulator + contract test: `node software/device-sim/device-sim.mjs` |
| `tools/build-pdfs.sh` | Rebuilds `manuals/*.pdf` from `docs/*.md` |
