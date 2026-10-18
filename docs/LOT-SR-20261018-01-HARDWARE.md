# LOT-SR-20261018-01 — HARDWARE: LOT Computer plan, BOM, roadmap

Date: 2026-10-18 · Branch: claude/brave-lamport-70x80l · Class: HARDWARE-PLANNING · Author: automated session for Vadik (Inventor, COSMO® CIA)

## Request
Build a hardware computer connected to lot-systems.com: plan → buying list with links → roadmap analysis (19-item logic list).

## Done
- Created `docs/hardware/` with README (index + compressed state), 01-PLAN, 02-BOM, 03-FIRMWARE-API, 04-MANUALS-PIPELINE.
- Mapped all 19 requirements; built a Z-stack, risk list, 38-week roadmap to a 100-unit run, cost estimate (~$18–37k run, ~$75–125/unit).
- Read the repo: confirmed `/logs` allow-list (`src/server/routes/api.ts` ~1083) must gain `device_copy`; COSMO® hardware is described in About.tsx as 2028–2029.

## Findings that need you
1. 5 mm height is infeasible with screen + camera + battery + Qi coil (~7–8 mm). EVT proposed at 8 mm.
2. Stainless blocks Qi charging and Wi-Fi: needs non-metal charging window and antenna slot (decision D2).
3. Not verified: lot-systems.com, brand.lot-systems.com, institute.lot-systems.com (CQGS) were unreachable (DNS failure from the sandbox) — brand styling and CQGS context not applied.
4. All prices are estimates; web search found no PCBWay 100-unit or steel quotes. Only the Waveshare and Espressif links were confirmed by search; other parts are "search MPN".
5. No code, firmware or server endpoints were written this session (spec only).

## Not done / next session
- Resolve D1–D5; get PCBWay + steel quotes; read brand/institute pages when reachable; KiCad EVT schematic; implement `/api/device/*` and Device model; POC firmware.

## Compressed state
See `docs/hardware/README.md`.
