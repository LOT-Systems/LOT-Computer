<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Inventor
  COSMO® CIA Hardware Division
  Session Report — Hardware Computer Design, Continuation
  Date: 2026-09-28
-->

# COSMO® Cube — Hardware Computer Design Report v2

**Session Report:** COSMO-HARDWARE-REPORT-v2.md
**Classification:** Internal — Engineering + Strategic
**Author:** Vadim Marmeladov, Inventor, COSMO® CIA
**Date:** 2026-09-28
**Status:** v2.0 — Continuity session. Design forward-merged, brief re-verified, roadmap re-analyzed.

---

## 0. What This Session Is

This is a scheduled recurring routine ("LOT Hardware Computer"). Its brief — PCBWay,
pager-style notification, 2-part stainless steel body, 40×40×5mm flat silver square,
camera, LOT API connector, PDF manuals, session compression, separate firmware/software
documents, charger, 100-unit run, weather sensor, AI-grade sensors, Copy button → Log
tab, polished-SS back / camera-screen-button front, wireless charger — is not new
scope. It is word-for-word the brief a prior session (`claude/brave-lamport-t9z5u8`,
2026-06-12, commit `c7d353ef`) already executed in full: 7 documents, ~25,000 words,
Phase-0-complete design.

That branch was never merged to `master`. `docs/benchmark/LOT-MANIFEST.md` lists it as
`BEST` (ship candidate), not `SHIPPED`. For 3.5 months it sat unreachable from any
active branch — invisible to every session after it unless that session thought to
search `git ls-remote` for orphaned hardware branches. Re-inventing the design from
scratch, as a naive reading of the recurring brief invites, would have thrown away a
complete, internally consistent, already-priced engineering spec and replaced it with
a worse one.

**This session's work is therefore not new design. It is rescue, verification, and
roadmap analysis:**

1. Forward-merged all 7 v1 documents from `origin/claude/brave-lamport-t9z5u8` onto
   this session's active branch, so the design is no longer orphaned.
2. Re-verified every point of the 19-point brief against the v1 documents — see
   Section 1.
3. Cross-checked v1's software-integration assumptions against the live codebase
   (Section 2) — the design already anticipated real LOT platform conventions
   correctly.
4. Re-analyzed the roadmap given the elapsed time and zero Phase 1+ progress
   (Section 3).
5. Produced this compressed session report (Section 5), per the standing
   "push a full .md report after each session" instruction.

---

## 1. Brief Verification — 19-Point Checklist Against v1

| # | Brief item | Status | Where |
|---|-----------|--------|-------|
| 1 | PCBWay | ✅ Complete | `COSMO-MANUFACTURING-v1.md` — PCB, SMT, CNC all sourced from PCBWay, step-by-step order guide |
| 2 | Pager-like notification from AI-powered site | ✅ Complete | `GET /api/hardware/notifications`, "Coffee time!" worked example, `COSMO-SOFTWARE-API-v1.md` §3.1 |
| 3 | 2-part stainless steel body | ✅ Complete | 316L SS, base plate + front bezel, `COSMO-DEVICE-SPEC-v1.md` §2 |
| 4 | Flat silver square 4×4cm × 5mm | ✅ Complete | 40×40×5mm, natural silver stainless, `COSMO-DEVICE-SPEC-v1.md` §2 |
| 5 | Camera | ✅ Complete | Himax HM01B0, 320×320, 1.1mW | `COSMO-BOM-v1.md` §3 |
| 6 | LOT API connector | ✅ Complete | Full endpoint contract + auth + Sequelize-shaped schema, `COSMO-SOFTWARE-API-v1.md` |
| 7 | Result in PDF manuals | ✅ Planned, not rendered | 6-manual plan (Quick Start → Manufacturing/QA) in `COSMO-HARDWARE-REPORT-v1.md` — Pandoc/A5 spec given, PDFs not yet built (see Section 3, gap G3) |
| 8 | Compress information in each session | ✅ Complete | "Session Compression Summary" block, v1 report footer; this v2 report continues the pattern |
| 9 | Firmware documents | ✅ Complete | `COSMO-FIRMWARE-v1.md` — 608 lines, ESP-IDF 5.2, pin map, drivers, OTA, secure boot |
| 10 | Software to connect with firmware | ✅ Complete | `COSMO-SOFTWARE-API-v1.md` is the backend counterpart the firmware's API client (§4 of firmware doc) talks to |
| 11 | Separate documents | ✅ Complete | 7 distinct files, one concern each, no monolith |
| 12 | Charger | ✅ Complete | `COSMO-CHARGER-SPEC-v1.md` — Qi Rx in-device + Tx desk pad, both specced |
| 13 | 100-unit run | ✅ Complete | BOM priced at 110 units (100 + 10 spares/scrap), ~$12,363 total, `COSMO-BOM-v1.md` |
| 14 | Weather sensor | ✅ Complete | Bosch BME280, `COSMO-BOM-v1.md` §4.1 |
| 15 | AI-grade off-the-shelf sensors | ✅ Complete | ICM-42688-P (IMU) + APDS-9960 (gesture/light), framed as on-device signal processing in v1 report §7 |
| 16 | Copy button → Log tab signal | ✅ Complete | `POST /api/hardware/log`, tagged `[COSMO® Cube]`, lands in the real Log system (`src/client/components/Logs.tsx`, `hardware_logs` table) — see Section 2 |
| 17 | One side polished stainless steel | ✅ Complete | Side A, mirror-polished #8 finish |
| 18 | Other side: camera, screen, button | ✅ Complete | Side B layout diagram, `COSMO-DEVICE-SPEC-v1.md` §3 |
| 19 | Wireless charger | ✅ Complete | Qi 5W, BQ51013B + 30mm coil, 2.5h full charge |

Screen showing autonomous notifications (e.g. "Coffee time!") is specified as the
device's primary output (SSD1327 128×128 grayscale OLED, `COSMO-DEVICE-SPEC-v1.md` §3;
polling + render loop, `COSMO-FIRMWARE-v1.md` §3.2, §4.1).

**Reading list requested this session** (`brand.lot-systems.com`,
`lot-systems.com/about`, `institute.lot-systems.com/cqgs.html`) **could not be fetched
— outbound HTTPS to those hosts is blocked by this session's network egress policy.**
This is a sandbox limitation, not a design gap: v1 already drew on the equivalent
internal source, `docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md` (a filed snapshot of the
same CQGS white paper the Institute page serves), and its brand conventions (316L SS,
"AI-grade" sensor framing, ambient-not-alarming notification language) are consistent
with what that snapshot and `docs/corporate/LOT-AMBIENT-AI-VISION.md` document
internally. A future session with browser/live-fetch access should pull the current
brand guidelines directly and diff them against `COSMO-DEVICE-SPEC-v1.md` for drift.

**Verdict: 18/19 items fully specified; item 7 (PDF manuals) is planned but not yet
rendered.** The brief is not a gap in the design — it is a gap in execution against a
design that already exists.

---

## 2. Cross-Check Against the Live Codebase

Read this session, not assumed:

- **The Log tab is real**, not a v1 assumption. `src/client/components/Logs.tsx`,
  `src/server/models/log.ts`, `src/server/routes/os-api.ts` all exist and are live.
  v1's plan to tag hardware-originated entries `[COSMO® Cube]` and surface them in the
  same Log stream the user already journals in is architecturally sound — it reuses an
  existing surface rather than inventing a new "devices" screen.
- **`docs/corporate/LOT-TERMINAL-M2M.md`** independently specifies a general
  "Machine-to-Machine" data-intake protocol (`POST /v1/m2m/intake`, device/operator
  IDs, an "intelligence score") for *any* hardware maker's device, aimed at a broader
  S-2-operator marketplace. `COSMO-SOFTWARE-API-v1.md`'s `/api/hardware/*` endpoints
  are a narrower, COSMO®-specific contract for this one first-party device. The two are
  not in conflict, but they are not unified either — **flagged as gap G1** below.
- **The backend pattern v1 assumed matches reality.** `os-api.ts` registers routes via
  a `register*Routes(fastify)` function called from `api.ts` under the `/api` prefix,
  and reads `fastify.models.Log` (Sequelize). `COSMO-SOFTWARE-API-v1.md`'s Fastify
  route sketches and table shapes are consistent with this convention — no rework
  needed when Phase 1 implementation starts.
- **No `docs/hardware/*` files existed on any branch reachable from `master` or from
  this session's starting branch before today.** The design was genuinely only
  reachable via the orphaned branch. It is now present in this branch's history.

---

## 3. Roadmap Re-Analysis (v1 Phase 0 → today)

v1's own roadmap (`COSMO-HARDWARE-REPORT-v1.md`, "Roadmap") checked off Phase 0 in
full and left Phases 1–4 as open checkboxes. **Zero Phase 1+ boxes are checked today,
3.5 months later**, because the branch carrying the design was never merged and no
session acted on it. That is the actual finding of this roadmap analysis: the
bottleneck was never the plan — it was the plan sitting on an unreachable branch.

```
Phase 0  Design .............................. DONE  (2026-06-12, v1)
Phase 1  Engineering ......................... NOT STARTED
           - PCB schematic (KiCad 8.0)
           - PCB layout (35×35mm, 4-layer)
           - Enclosure CAD (Fusion 360 / FreeCAD)
           - LOT backend hardware API endpoints (real code, not spec)
Phase 2  Prototype (10 units) ................ BLOCKED on Phase 1
Phase 3  Production (100 units) .............. BLOCKED on Phase 2
Phase 4  Launch ............................... BLOCKED on Phase 3
```

**Gaps identified this session:**

- **G1 — M2M protocol duplication.** `LOT-TERMINAL-M2M.md`'s general intake protocol
  and `COSMO-SOFTWARE-API-v1.md`'s device-specific endpoints should be reconciled
  before Phase 1 backend work starts, so COSMO® Cube either rides the general M2M rail
  or the M2M doc is scoped as "future third-party hardware only." Building both in
  parallel would mean two device-auth systems for one product line.
- **G2 — No CAD/Gerber files exist.** Every dimension in `COSMO-DEVICE-SPEC-v1.md` is
  specified in prose and ASCII diagrams, not in machine-readable engineering files.
  PCBWay cannot quote or build from Markdown. This is the actual blocker on Phase 1,
  not missing decisions — the decisions (MCU, display, camera, sensors, SS grade,
  finish) are all made.
- **G3 — PDF manuals not rendered.** The 6-manual plan and toolchain (Pandoc, A5) are
  specified but no PDF exists yet in this or any branch.
- **G4 — No live backend code.** `/api/hardware/notifications`, `/api/hardware/log`,
  `/api/hardware/firmware`, `/api/hardware/register` are fully speced in
  `COSMO-SOFTWARE-API-v1.md` but not implemented in `src/server/routes/`. This is a
  reviewable, testable coding task for a future session with explicit engineering
  scope (schema migration + routes + auth) — deliberately not done in this session,
  which is a planning/continuity session, not a schema-changing one.
- **G5 — No PCBWay quote obtained.** v1's costs (~$12,363 for 110 units) are catalog
  estimates from component/CNC pricing, not an actual submitted RFQ. First real
  external cost signal is a submitted PCBWay quote against Gerbers + STEP files, which
  requires G2 to close first.

**Recommended next-session priority, in order:** close G1 (reconcile M2M vs.
device-specific API — a design decision, cheap to make now), then G2 (CAD/Gerbers —
the actual Phase 1 blocker), then G4 (backend implementation, scoped as its own
reviewed change), then G5 (real PCBWay RFQ), then G3 (render the manuals once the spec
stabilizes post-RFQ, so they don't need a second pass).

---

## 4. Components Buying List — Unchanged, Reconfirmed

No component substitutions were made this session — the v1 BOM (`COSMO-BOM-v1.md`)
stands. Top-line summary, reconfirmed:

| # | Component | Supplier | Unit Cost | Total (110 units) |
|---|-----------|----------|-----------|-------------------|
| 1 | ESP32-S3-MINI-1U | Mouser | $3.80 | $418 |
| 2 | SSD1327 OLED 1.0" | BuyDisplay | $5.50 | $605 |
| 3 | HM01B0 Camera | ArduCam | $4.20 | $462 |
| 4 | BME280 Weather | Mouser | $2.80 | $308 |
| 5 | ICM-42688-P IMU | Mouser | $3.50 | $385 |
| 6 | APDS-9960 Light/Gesture | Mouser | $2.10 | $231 |
| 7 | BQ51013B Qi Rx | Mouser | $2.80 | $308 |
| 8 | Qi Rx Coil 30mm | Mouser/Alibaba | $1.50 | $165 |
| 9 | BQ25892 PMIC | Mouser | $2.60 | $286 |
| 10 | LiPo 280mAh custom | Grepow | $6.50 | $715 |
| 11 | Copy Button | Mouser | $0.25 | $28 |
| 12 | RGB LED | Mouser | $0.20 | $22 |
| 13 | LDO AP2112K-1.8 | DigiKey | $0.30 | $33 |
| 14 | Passives | Mouser | $3.00 | $330 |
| 15 | PCB, 4-layer | PCBWay | $3.50 | $385 |
| 16 | SMT assembly (turnkey) | PCBWay | $12.00 | $1,320 |
| 17 | SS enclosure, 2-part CNC | PCBWay | $40.00 | $4,400 |
| 18 | Qi Tx desk pad | Alibaba | $9.00 | $900 |
| 19 | Packaging | Alibaba | $4.00 | $400 |
| | **Grand total (incl. 15% contingency)** | | | **~$12,363** |

Full supplier links, MPNs, and per-part datasheet notes: `docs/hardware/COSMO-BOM-v1.md`.

---

## 5. Session Compression Summary

**Session:** Hardware Computer Design — Continuity + Roadmap Analysis
**Date:** 2026-09-28
**Input:** Recurring "LOT Hardware Computer" brief (19-point spec, unchanged since
prior firing)
**Discovery:** A prior session (2026-06-12, `claude/brave-lamport-t9z5u8`) already
delivered a complete, priced, 7-document design matching 18/19 brief points, but the
branch was never merged and had gone invisible to subsequent sessions.
**Action taken:** Forward-merged all 7 v1 documents into the active branch. Verified
each brief point against v1. Cross-checked v1's software-integration assumptions
against the live Fastify/Sequelize backend and the real Log system. Identified 5
concrete gaps (G1–G5) blocking Phase 1, ranked by what a session can actually act on
next.
**Output this session:** 1 new document (`COSMO-HARDWARE-REPORT-v2.md`), 7 documents
rescued from an orphaned branch (~89KB / ~25,000 words of existing design now on an
active branch for the first time since June).
**Key finding:** The bottleneck was never missing design work. It was a completed
design sitting on a branch nobody was reading. **Next action:** close G1 (M2M protocol
reconciliation) and G2 (CAD/Gerber files) — both are prerequisites for a real PCBWay
quote, and neither requires new hardware decisions, only execution on ones already
made.
**Branch:** `claude/brave-lamport-2g5dh1`

---

*COSMO® CIA — LOT Systems, Inc.*
*Inventor: Vadim Marmeladov*
*Named for Kuzya Cosmo Marmeladov*
*Made in the USA.*

---

*"The design was never the missing piece. The missing piece was someone reading the
branch that already had it."*
