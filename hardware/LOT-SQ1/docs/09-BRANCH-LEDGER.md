# LOT SQ-1 — Branch Ledger (session consolidation)

**Document:** LOT-SQ1-09 · **Version:** 0.2 (Session HW-02) · **Date:** 2026-11-16

## 1. The problem

The "LOT Hardware Computer" routine runs every day. Each run gets a **fresh container cloned from `master`** and a **new branch**. None of these branches has been merged, so every run starts without seeing the earlier work. Between 2026-11-01 and 2026-11-15, 15 runs produced 15 separate versions of the same project, under 5 different product names.

Brief item #8 ("compress the information in each session") cannot work while each session starts from zero. `SESSION-STATE.md` only carries over if it is on the branch the next run clones.

## 2. Fix (needs the Inventor)

**Merge this branch (`claude/brave-lamport-qa9enn`) into `master`.** It only adds files under `hardware/LOT-SQ1/` and `docs/`; it changes no app code. After the merge, every later run starts from `hardware/LOT-SQ1/SESSION-STATE.md`.

Without the merge, HW-02 has done what it can: it took the newest and most complete version (SQ-1, 2026-11-15) as the canonical base and recorded the useful pieces from the other branches below so they are not lost.

## 3. Ledger of earlier branches (all prefixed `claude/brave-lamport-`)

| Date | Branch | Name used | Notable content worth keeping |
|---|---|---|---|
| 11-01 | `93ixdg` | LOT Pager | first plan v0.1, BOM, API + firmware specs |
| 11-02 | `2x4jdf` | LOT Pager | plan, BOM, API spec, roadmap |
| 11-03 | `47vvzz` | LOT Pager | first z-stack budget tool, firmware scaffold |
| 11-04 | `ujq26o` | LOT-P1 | manufacturing spec, PDFs |
| 11-05 | `yboa0w` | LOT Pager | plan, specs |
| 11-06 | `8l2xci` | (unnamed) | plan, BOM, roadmap |
| 11-07 | `6iehwu` | LOT-P1 | plan, BOM, firmware/API docs, PDFs |
| 11-08 | `k3c6i5` | LOT Pager | S1 plan, draft PDF |
| 11-09 | `aw8icu` | LOT Pager | decision memo R1–R3, `zstack.py` |
| 11-10 | `k3mn3y` | HW-0 | plan, BOM, roadmap |
| 11-11 | **`c0sqik`** | LOT Pager | **only branch with production server code:** `migrations/…create-devices.cjs`, `src/server/models/device.ts`, `src/server/routes/device-api.ts` (pair / inbox / ack / copy→Log), Log-tab rendering in `Logs.tsx`, an end-to-end test. Use it as the starting point for HW-03 step 3 (D6). |
| 11-12 | `qu948o` | LOT-01 | ESP-IDF (C) firmware variant, separate electrical-design doc, Fastify plugin + simulator |
| 11-13 | `1yiovy` | LOT Pager | companion-software doc, 9 PDFs |
| 11-14 | `gpbw0e` | LOT TILE | `lotctl.py` CLI (353 lines), `fetch_root_ca.sh`, combined "Complete" PDF |
| 11-15 | **`45y5w8`** | **LOT SQ-1** | **canonical base** for this branch: 8 docs + PDFs, firmware v0.1, Device API v1 plugin, mock server, simulator (14/14), `SESSION-STATE.md` |

## 4. Where the branches agree (now treated as settled)

Every version independently landed on the same core: **ESP32-S3** + **1.54" e-paper** + **Bosch BME688** + Qi receiver behind the glass, polling a REST device API with a bearer device token, COPY → a Log entry. The open questions have always been the same too: **Z-height**, **Qi/RF through steel**, **battery cell sourcing**, **certification route**.

## 5. Proposal on naming

Five names have been used. This branch uses **SQ-1** (Square, generation 1), the name of the most complete version. The Inventor should confirm or rename it once; the docs use the name in one place per file header, so renaming is cheap.
