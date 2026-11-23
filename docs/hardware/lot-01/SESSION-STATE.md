# LOT·01 — Compressed Session State
_Rewrite at the end of every session. Keep it ≤ 40 lines. Last run: S02 · 2026-11-23 · branch `claude/brave-lamport-9yyxhx` (builds on S01 `…-fqxxwb`)_

**Product:** 40×40×5 mm 316L two-part square. A = mirror back (solid). B = bezel + glass: memory LCD, camera, Copy key. Pager buzz (LRA). Qi charging face-down.
**Loop:** AI job → `device_notifications` → device polls `/device-api/v1/inbox` → buzz + show → Copy → `POST /copy` → `Log{event:'note', metadata.source:'lot-01'}` → Log tab.
**Silicon:** ESP32-S3FH4R2 · LS013B7DH03 · GC0308/OV2640 slim · BME688 · LSM6DSOX · BQ51050B · MAX17048 · TPS62840 · DRV2603 · 100 mAh 2.2 mm LiPo.
**Physics:** Qi + antenna go through the front glass (steel blocks both). Z = 4.89 mm (0.11 mm margin); fallback 5.5 mm.
**Cost:** ~$117–148/unit build · NRE ~$23–33k · ~$36–49k for 100 units · P1 bench ≈ $500.
**Timeline:** P1 W1–3 → EVT W3–9 → DVT W9–15 → cert W14–20 → PVT W18–22 (≈ late Apr 2027). **New risk R0: LCD panel 28-week lead.**

## Done
- S01: 10 docs, BOM, roadmap, manual, firmware skeleton, simulator, 5 PDFs
- S02: server routes **live behind `LOT_DEVICES_ENABLED`** (`src/server/routes/device-api.ts`), migration, hourly AI nudge job (`utils/device-nudges.ts`), Settings endpoints (claim/list/revoke/test)
- S02: tests green: tsc + `server:build`; itest 27/27 on Postgres 16; native firmware test 12/12 (real `lot_api.cpp` + ArduinoJson ↔ real routes)
- S02: real ISRG X1/X2 roots in firmware; doc 11 P1 bench order + PCBWay quote text; PDFs Rev B; S01 drafts deleted (superseded)

## Open decisions (need Vadik)
D-1 bare chip vs module · D-2 front-glass Qi vs NCVM insert · D-3 camera purpose · D-4 haptic (rec. yes) · D-5 who gets the 100 units
D-6 (new) merge this branch + set `LOT_DEVICES_ENABLED=true` on staging? (migration is additive and runs on deploy)
D-7 (new) order 20 LS013B7DH03 panels now (long lead) + 2 bench kits (~$500)?

## Next session (S03), in order
1. Settings → Devices UI (claim code box, device list, revoke, "Send test") using `/api/devices/*`
2. Full `pio run -e lot01-p1` (needs `dl.platformio.org` / `registry.platformio.org` allowed) and pin library versions
3. LSM6DSOX double-tap config + EXTCOMIN timer for the LCD in `hw.cpp`
4. Copy long-press → camera photo → Log attachment (after D-3)
5. Verify the lot-systems.com TLS chain and add a GTS root if needed

## Blockers
- `lot-systems.com`, `brand.`, `institute.` (CQGS) still fail DNS here. Allow them in the environment's network settings.
- PlatformIO/Espressif download hosts are blocked, so `main.cpp`/`hw.cpp` are not compiled.

## How to re-verify (≈ 2 min)
`yarn install && yarn server:build` → start a throwaway Postgres → `DB_*=… DB_SSL=false JWT_SECRET=x LOT_DEVICES_ENABLED=true node docs/hardware/lot-01/connector/device-api.itest.mjs` → `ARDUINOJSON_SRC=… docs/hardware/lot-01/firmware/test/native/run.sh`
