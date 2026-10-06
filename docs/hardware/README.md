# LOT® Pager — Hardware Track Index

Working name: **LOT® Pager (LOT-P1)** · Owner: Vadik Marmeladov (S-2) · Started 2026-10-06
Not to be confused with CUBIQ™ (hopping notification cube, `docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md`) or the COSMO® Cube (general-purpose computer, branch `brave-lamport-t9z5u8`).

## Separate documents
| Doc | Purpose |
|---|---|
| [PLAN.md](PLAN.md) | Product definition, architecture, mechanical stack, risks |
| [BOM.md](BOM.md) | Components buying list, links, 100-unit cost estimate |
| [ROADMAP.md](ROADMAP.md) | Phases, gates, dates, analysis |
| [FIRMWARE.md](FIRMWARE.md) | Firmware architecture and spec |
| [SOFTWARE-CONNECTOR.md](SOFTWARE-CONNECTOR.md) | LOT API connector: device API contract + host tooling |
| [MANUAL-USER.md](MANUAL-USER.md) | User manual (PDF in `pdf/`) |
| [sessions/](sessions/) | One full report per session |

## STATE (compressed — rewrite each session, max 15 lines)
- Phase: P0 Plan complete. No hardware ordered. No server code written.
- Decision: 40×40 mm square, 2-part 304/316L stainless; ESP32-S3 + OV2640 + 1.28" round LCD + BME688 + IMU + Qi RX + 1 button.
- Hard finding: **5 mm height is not achievable in v1** (est. 9 mm; 5 mm = v2 stretch). Needs S-2 decision.
- Server: new `/api/device/*` routes + new log event `device_copy`; none exist yet.
- LOT sites unreachable from the routine sandbox (egress blocked) — brand specs taken from repo docs only.
- Open for S-2: height decision; Wi-Fi provisioning method; camera purpose; quote approvals (PCBWay).
- Next: S-2 answers → P1 schematic + dev-kit prototype; request PCBWay quotes.
