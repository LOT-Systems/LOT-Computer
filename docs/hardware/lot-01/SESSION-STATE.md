# LOT·01 — Compressed Session State
_Rewrite this file at the end of every session. Keep it ≤ 40 lines. Last run: S01 · 2026-11-22_

**Product:** 40×40×5 mm 316L two-part square. A = mirror back (solid). B = bezel + glass: memory LCD, camera, Copy key. Pager buzz (LRA). Qi charging face-down.
**Core loop:** AI job → `device_notifications` → device polls `/device-api/v1/inbox` → buzz + show → Copy → `POST /copy` → `Log{event:'note', metadata.source:'lot-01'}` → Log tab.
**Silicon:** ESP32-S3FH4R2 · LS013B7DH03 · GC0308/OV2640 slim · BME688 · LSM6DSOX · BQ51050B · MAX17048 · TPS62840 · DRV2603 · 100 mAh 2.2 mm LiPo.
**Physics calls:** Qi + antenna both go through the front glass (steel blocks both). Z stack = 4.89 mm (0.11 mm margin). Fallback is 5.5 mm.
**Cost:** ~$117–148/unit build · NRE ~$23–33k (certification dominates) · ~$36–49k for 100 units.
**Timeline:** P1 devkit proof W1–3 → EVT W3–9 → DVT W9–15 → cert W14–20 → PVT 100 W18–22 (≈ late Apr 2027).

## Done (S01)
- 10 discipline docs, BOM with links, roadmap and risk analysis, user manual
- Firmware skeleton (not compiled), server plugin + migration drafts (not type-checked)
- Device simulator selftest ✅ 10/10 · 5 PDF manuals generated

## Open decisions (need Vadik)
D-1 bare chip vs certified module · D-2 front-glass Qi vs NCVM back insert · D-3 camera purpose · D-4 haptic (recommended yes) · D-5 who gets the 100 units (drives certification)

## Next session (S02) — do in order
1. Wire `device-api.draft.ts` into `src/server` behind a feature flag, plus the migration and a Settings → Devices UI (needs `yarn install` + green build)
2. Add the AI message scheduled job (≤ 64 chars, ≤ 8/day, quiet hours)
3. Compile the firmware (`pio run -e lot01-p1`) and fix library versions
4. P1 bench order list: ESP32-S3-DevKitC-1 N8R2, LS013B7DH03 breakout, BME688 breakout, LSM6DSOX breakout, Qi RX eval kit (BQ51050BEVM)
5. Request PCBWay quotes: CNC Part A mirror polish ×15, Part B ×15

## Blockers
- `brand.lot-systems.com`, `lot-systems.com/about` and `institute.lot-systems.com/cqgs.html` are not in this environment's network allowlist, so brand and CQGS inputs were not read. Allow those domains for S02.
