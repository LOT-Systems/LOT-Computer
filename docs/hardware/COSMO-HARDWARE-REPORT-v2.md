<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Inventor
  COSMO® CIA Hardware Division
  Session Report — Hardware Computer Design, Session 2
  Date: 2026-09-23
-->

# COSMO® Cube — Hardware Computer Design Report v2

**Session Report:** COSMO-HARDWARE-REPORT-v2.md
**Classification:** Internal — Engineering + Strategic
**Author:** Vadim Marmeladov, Inventor, COSMO® CIA
**Date:** 2026-09-23
**Status:** v2 — Recovery, verification, and PDF manual production
**Prior session:** COSMO-HARDWARE-REPORT-v1.md (2026-06-12, branch `claude/brave-lamport-t9z5u8`)

---

## Executive Summary

This is the second "LOT Hardware Computer" session for the COSMO® Cube. Per the standing instruction to compress information rather than restate it, this report does not re-derive the design — it verifies what already exists, recovers work that was stranded, and closes the one concrete gap the v1 session left open (printed PDF manuals).

**What this session found:** the full hardware computer design brief — PCB manufacturer, pager-style notifications, 2-part stainless body, 40×40×5mm form factor, camera, LOT API connector, PDF manuals, firmware docs, software docs, separate documents, charger, 100-unit run, weather sensor, AI-grade sensors, Copy button → Log tab, dual-finish stainless sides, wireless charging — was **already fully specified** on 2026-06-12 in 7 documents totaling 2,610 lines. That work sat on branch `claude/brave-lamport-t9z5u8` (manifest status: BEST) and was never merged. It has now been recovered onto this session's branch.

**What this session added:**
1. Recovered all 7 v1 documents (cherry-picked from `c7d353ef`, `claude/brave-lamport-t9z5u8`) into `docs/hardware/` on this branch.
2. Verified the design against all 19 brief points — see the checklist below. All 19 are covered by existing specification.
3. Generated the first 3 of the 6 planned PDF manuals (the "PDF Manual Plan" in v1 was a plan, not a deliverable — this session produced actual PDF files).
4. Identified the one honest engineering gap: the LOT API hardware endpoints (`/api/hardware/notifications`, `/api/hardware/log`, `/api/hardware/register`, `/api/hardware/firmware`) are specified in COSMO-SOFTWARE-API-v1.md but do not exist yet in `src/server/routes/`. No hardware routes are live in this repository as of this session.

---

## Brief Verification Checklist (19 points, this firing)

| # | Requirement | Status | Where specified |
|---|-------------|--------|------------------|
| 1 | PCBWay | ✅ Covered | COSMO-MANUFACTURING-v1.md — full order walkthrough (PCB, SMT, CNC) |
| 2 | Pager-like notification from AI-powered site | ✅ Covered | COSMO-DEVICE-SPEC-v1.md §7.2, COSMO-SOFTWARE-API-v1.md §3.1 |
| 3 | 2-part stainless steel body | ✅ Covered | COSMO-DEVICE-SPEC-v1.md §2 — back plate + front bezel, 316L |
| 4 | Flat silver square 4×4cm × 5mm | ✅ Covered | COSMO-DEVICE-SPEC-v1.md §2 — 40×40×5mm, ~28g |
| 5 | Camera | ✅ Covered | Himax HM01B0, COSMO-DEVICE-SPEC-v1.md §5.3 |
| 6 | LOT API connector | ⚠️ Spec'd, not implemented | COSMO-SOFTWARE-API-v1.md — endpoints designed; no code in `src/server/routes/` yet |
| 7 | Result in PDF manuals | ✅ Delivered this session | `docs/hardware/pdf/` — 3 of 6 manuals now exist as real PDFs (was plan-only in v1) |
| 8 | Compress the information in each session | ✅ Covered | This report is compression, not restatement; COSMO-SOFTWARE-API-v1.md §6 specs the on-device data compression policy |
| 9 | Firmware documents | ✅ Covered | COSMO-FIRMWARE-v1.md — 608 lines, ESP-IDF 5.2, pin map, drivers, OTA |
| 10 | Software to connect with firmware | ✅ Covered | COSMO-SOFTWARE-API-v1.md — backend schema + endpoints firmware calls |
| 11 | Separate documents | ✅ Covered | 7 documents, one per concern, `docs/hardware/` |
| 12 | Charger | ✅ Covered | COSMO-CHARGER-SPEC-v1.md — Rx in-device + Tx desktop pad |
| 13 | 100 units run | ✅ Covered | COSMO-BOM-v1.md, COSMO-MANUFACTURING-v1.md — 100 units + 10% overage |
| 14 | Weather sensor | ✅ Covered | Bosch BME280 — temp/humidity/pressure |
| 15 | AI-grade off-the-shelf sensors | ✅ Covered | TDK ICM-42688-P (IMU), Broadcom APDS-9960 (gesture/light) |
| 16 | Copy button → signal to Log tab | ✅ Covered | COSMO-DEVICE-SPEC-v1.md §7.1, COSMO-FIRMWARE-v1.md §7 |
| 17 | One side polished stainless steel | ✅ Covered | Side A, mirror #8 finish |
| 18 | Other side: camera, screen, button | ✅ Covered | Side B layout, COSMO-DEVICE-SPEC-v1.md §3 |
| 19 | Wireless charger | ✅ Covered | Qi WPC 1.3, 5W, COSMO-CHARGER-SPEC-v1.md |

**18 of 19 fully covered by existing specification. 1 (LOT API connector) is designed but not yet built in code — see Gap below.**

---

## Gap: LOT API Connector Is a Spec, Not Code

`docs/hardware/COSMO-SOFTWARE-API-v1.md` fully designs four endpoints:

```
GET  /api/hardware/notifications
POST /api/hardware/log
POST /api/hardware/register
GET  /api/hardware/firmware
```

A search of `src/server/routes/api.ts` and `src/server/routes/public-api.ts` in this session found no hardware routes, no device table, and no Log tab hardware-entry rendering. This is expected — Phase 1 (Engineering) of the v1 roadmap was never started, only Phase 0 (Design) completed. This session does not implement the backend, for the same reason Phase 1 was never scheduled here: it requires a database migration, new route file, and Log tab UI change — a build task, not a plan/BOM/roadmap task, and outside what this session was asked to produce. It is flagged here so the next session (engineering, not planning) can pick it up without re-deriving it.

---

## PDF Manuals Produced This Session

| File | Source | Pages |
|------|--------|-------|
| `docs/hardware/pdf/COSMO-CUBE-QUICKSTART-v1.pdf` | New — written this session, consumer-facing | 8 |
| `docs/hardware/pdf/COSMO-CUBE-HARDWARE-REFERENCE-v1.pdf` | Compiled from COSMO-DEVICE-SPEC-v1.md + firmware pin map | ~14 |
| `docs/hardware/pdf/COSMO-CUBE-MANUFACTURING-QA-v1.pdf` | Compiled from COSMO-MANUFACTURING-v1.md + COSMO-BOM-v1.md | ~20 |

Built with Pandoc (Markdown → HTML) + headless Chromium (HTML → PDF, A5 print stylesheet), matching the "Pandoc" tool named in the v1 PDF Manual Plan.

**Still open from the original 6-manual plan:** Firmware Developer Guide (40+ pages, engineer audience — a superset of the Hardware Reference Manual, deferred to avoid duplicating COSMO-FIRMWARE-v1.md's 608 lines into a second PDF this session), API Integration Guide (blocked on the code gap above — a guide to an API that doesn't exist yet would be fiction), Full User Manual (the Quick Start Guide produced this session covers the same ground at a scope actually usable today).

---

## Roadmap Status (carried forward from v1, updated)

### Phase 0 — Design
- [x] Device specification, BOM, firmware architecture, LOT API integration design, manufacturing guide, charger spec, session report — **complete since 2026-06-12**
- [x] Recovered onto an active branch — **this session**
- [x] PDF manuals (3 of 6) — **this session**

### Phase 1 — Engineering (not started)
- [ ] PCB schematic capture (KiCad 8.0) — requires CAD tooling not available in this session environment
- [ ] PCB layout (35×35mm, 4-layer)
- [ ] Enclosure CAD (Fusion 360 / FreeCAD)
- [ ] LOT backend: `/api/hardware/*` endpoints coded (see Gap above)

### Phase 2 — Prototype, Phase 3 — Production, Phase 4 — Launch
Unchanged from v1 — see COSMO-HARDWARE-REPORT-v1.md. Still blocked on Phase 1.

---

## Session Compression Summary

**Session:** Hardware Computer Design — COSMO® Cube, Session 2
**Date:** 2026-09-23
**Output:** 1 report (this document) + 3 PDF manuals. No new markdown specification written — v1's 2,610 lines already cover the brief.
**Key action:** Recovery of orphaned branch `claude/brave-lamport-t9z5u8` (commit `c7d353ef`), not re-design.
**Key finding:** design is complete; engineering (CAD, code) has not started.
**Next action:** Phase 1 — PCB schematic in KiCad, `/api/hardware/*` route implementation in `src/server/routes/`.
**Branch:** `claude/brave-lamport-sioo04`

---

*COSMO® CIA — LOT Systems, Inc.*
*Inventor: Vadim Marmeladov*
*Named for Kuzya Cosmo Marmeladov*
*Made in the USA.*
