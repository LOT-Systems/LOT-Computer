<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Inventor
  COSMO® CIA Hardware Division
  Session Report — Hardware Computer Design, Session 2
  Date: 2026-09-08
-->

# COSMO® Cube — Hardware Computer Design Report v2

**Session Report:** COSMO-HARDWARE-REPORT-v2.md
**Classification:** Internal — Engineering + Strategic
**Author:** Vadim Marmeladov, Inventor, COSMO® CIA
**Date:** 2026-09-08
**Status:** v2 — Ship-forward + gap audit against 19-point brief + first PDF manual
**Branch:** `claude/brave-lamport-994pfp`

---

## 00 // Reading Log — Sources This Session Is Built On

Before writing anything new, this session read what already exists rather
than re-deriving it from scratch:

- `docs/hardware/COSMO-HARDWARE-REPORT-v1.md`, `COSMO-DEVICE-SPEC-v1.md`,
  `COSMO-BOM-v1.md`, `COSMO-FIRMWARE-v1.md`, `COSMO-SOFTWARE-API-v1.md`,
  `COSMO-MANUFACTURING-v1.md`, `COSMO-CHARGER-SPEC-v1.md` — the complete
  v1.0 hardware design (2026-06-12, branch `claude/brave-lamport-t9z5u8`,
  commit `c7d353ef`). This is the same 19-point brief already fully
  specified: ESP32-S3, HM01B0 camera, SSD1327 OLED, 316L stainless steel
  2-part body, BME280/ICM-42688-P/APDS-9960 sensors, Qi wireless charging,
  PCBWay manufacturing, 100-unit run, Copy-button-to-Log-tab signal.
- `docs/benchmark/LOT-MANIFEST.md` — confirmed the v1.0 design was rated
  **BEST** (14/14 iterations, +2610 lines, 7 files) but was **never
  shipped to master**. It has sat on an unmerged branch for three months.
  That, not a redesign, is the actual gap this session closes.
- `docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md` — the sibling hardware
  track (LOT®'s CUBIQ™ notification cube, a jumping/haptic object). Its
  own reading log (Section 00) already drew the brand line: CUBIQ™ is
  LOT®'s object, COSMO® Cube is Kuzya's general-purpose hardware computer
  under the COSMO® brand. This session preserves that line — no naming
  collision introduced.
- `docs/corporate/LOT_ROBOTICS_COSMO.md` — checked for overlap with the
  COSMO® robotics roadmap. No mention of the Cube form factor; the two
  tracks stay distinct (Cube = ambient sensor node, Robotics = separate
  program).
- `docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md` — line "Quantum Cube
  Hardware | Hardware feedback integration (Month 12+) | PLANNED" is the
  white-paper line item this hardware track answers to.

**Network note:** `brand.lot-systems.com`, `lot-systems.com/about`, and
`institute.lot-systems.com/cqgs.html` were named as reading sources for
this session but were unreachable — this sandbox's egress proxy blocks
`lot-systems.com` and its subdomains outright. The internal corpus above
(the CQGS snapshot already vendored into the repo, the CUBIQ and Robotics
docs) is the best available substitute this session. **Action item:** a
session with network access to those three URLs should re-run this
reading log and fold in anything brand.lot-systems.com specifies about
logo/color/type usage that the physical engraving spec (Section 4 of
`COSMO-DEVICE-SPEC-v1.md`) should follow.

---

## 01 // What Changed This Session

1. **Ported the v1.0 design forward.** All 7 `docs/hardware/*.md` files
   from `claude/brave-lamport-t9z5u8` (commit `c7d353ef`) are now on this
   branch. Nothing was rewritten — the design already answers all 19
   points in the current brief (audit below). Re-deriving it would have
   contradicted the compression doctrine this same brief asks for
   (point 8: "compress the information in each session," not repeat it).
2. **First PDF manual produced.** `docs/hardware/pdf/COSMO-CUBE-QUICKSTART-v1.pdf`
   — a 4-page A5 Quick Start Guide (in the box, setup, Copy button
   behavior, care, spec sheet). This is the first artifact in the "Result
   in PDF manuals" deliverable (point 7); v1's report only planned the
   six-manual set, none were rendered. The other five (Full User Manual,
   Firmware Developer Guide, Hardware Reference Manual, API Integration
   Guide, Manufacturing & QA Manual) remain planned — see Section 03.
3. **This report** — the session-compression artifact point 8 and the
   original brief's "push a full report after each session" ask for.

---

## 02 // Point-by-Point Audit Against the Current Brief

| # | Brief item | Status | Where |
|---|------------|--------|-------|
| 1 | PCBWay | ✅ Specified | `COSMO-MANUFACTURING-v1.md` — PCB, SMT, CNC enclosure all PCBWay |
| 2 | Pager-like notification from AI site | ✅ Specified | `COSMO-SOFTWARE-API-v1.md` §notification poll; `COSMO-HARDWARE-REPORT-v1.md` "Coffee time!" example |
| 3 | 2-part stainless steel body | ✅ Specified | `COSMO-DEVICE-SPEC-v1.md` §2, §4 — base plate + front bezel |
| 4 | Flat silver square 4×4cm × 5mm | ✅ Specified | `COSMO-DEVICE-SPEC-v1.md` §2 — 40×40×5mm, natural silver 316L |
| 5 | Camera | ✅ Specified | HM01B0, `COSMO-DEVICE-SPEC-v1.md` §5, `COSMO-BOM-v1.md` #3 |
| 6 | LOT API connector | ✅ Specified | `COSMO-SOFTWARE-API-v1.md` — full connector + backend schema |
| 7 | PDF manuals | 🟡 Partial | 1 of 6 rendered this session (`COSMO-CUBE-QUICKSTART-v1.pdf`); 5 remain planned-only |
| 8 | Compress info each session | ✅ This document | Ported forward + audited rather than re-specified |
| 9 | Firmware documents | ✅ Specified | `COSMO-FIRMWARE-v1.md` — ESP-IDF 5.2 architecture + code |
| 10 | Software to connect with firmware | ✅ Specified | `COSMO-SOFTWARE-API-v1.md` |
| 11 | Separate documents | ✅ Done | 7 distinct files, single-topic each, `docs/hardware/` |
| 12 | Charger | ✅ Specified | `COSMO-CHARGER-SPEC-v1.md` — Qi Rx in-device + Tx pad |
| 13 | 100-unit run | ✅ Specified | `COSMO-BOM-v1.md` — priced at 100+10 spares (110) |
| 14 | Weather sensor | ✅ Specified | BME280, `COSMO-DEVICE-SPEC-v1.md` §5 |
| 15 | AI-grade off-the-shelf sensors | ✅ Specified | ICM-42688-P (IMU) + APDS-9960 (light/gesture), both hardware-classified event detection |
| 16 | Copy button → Log tab signal | ✅ Specified | `COSMO-HARDWARE-REPORT-v1.md` design decision 6; `COSMO-SOFTWARE-API-v1.md` POST /api/hardware/log |
| 17 | One side polished stainless | ✅ Specified | Side A, mirror #8 finish, `COSMO-DEVICE-SPEC-v1.md` §4 |
| 18 | Other side: camera + screen + button | ✅ Specified | Side B layout, `COSMO-DEVICE-SPEC-v1.md` §3 |
| 19 | Wireless charger | ✅ Specified | Qi 5W, `COSMO-CHARGER-SPEC-v1.md` |

**Finding:** the design is not missing engineering content — it is
missing **shipping**. 18 of 19 points were fully answered in the first
session; the sole open item (PDF manuals) is now started, not finished.
The real backlog is Phase 1–4 of the v1.0 roadmap (KiCad schematic, PCB
layout, enclosure CAD, LOT backend endpoints, prototype order) — none of
which has moved since 2026-06-12.

---

## 03 // Updated Roadmap

### Phase 0 — Design — COMPLETE (2026-06-12, this session confirms no rework needed)

### Phase 0.5 — Ship the design to master — NEW, THIS SESSION
- [x] Port `docs/hardware/*.md` (7 files) to a branch off current master
- [x] Render first PDF manual (Quick Start Guide)
- [ ] Merge to `master` — currently blocked only by process: no PR has
      been opened for this hardware track since it was designed. This is
      the single highest-leverage next action; every other phase is
      downstream of the design actually being on `master`.
- [ ] Render remaining 5 PDF manuals (Full User Manual, Firmware
      Developer Guide, Hardware Reference Manual, API Integration Guide,
      Manufacturing & QA Manual) — same reportlab/A5 pipeline as the
      Quick Start Guide, one document per session to keep sessions
      focused (compression doctrine, point 8)

### Phase 1 — Engineering (unchanged, still not started)
- [ ] PCB schematic capture (KiCad 8.0)
- [ ] PCB layout (35×35mm, 4-layer)
- [ ] Enclosure CAD (Fusion 360 or FreeCAD)
- [ ] Gerbers + DXF/STEP generated
- [ ] LOT backend: hardware API endpoints coded (`COSMO-SOFTWARE-API-v1.md`
      is a spec, not yet implemented in `src/`)

### Phase 2 — Prototype (unchanged, still not started)
- [ ] 10-unit prototype order (PCBWay)
- [ ] Firmware v0.1–v0.3 per `COSMO-FIRMWARE-v1.md`
- [ ] Hardware validation: sensors, charging, camera

### Phase 3 — Production (unchanged, still not started)
- [ ] 100-unit production order (PCBWay)
- [ ] Factory firmware flash + provisioning
- [ ] QA all 100 units

### Phase 4 — Launch (unchanged, still not started)
- [ ] LOT web app: My Devices page
- [ ] LOT Log tab: hardware entry display
- [ ] OTA infrastructure
- [ ] FCC/CE certification (~$20K budget)
- [ ] Retail listing at $349 (Purple+ Benchmark tier)

---

## 04 // Components Buying List

Unchanged from v1.0 — see `docs/hardware/COSMO-BOM-v1.md` for the full
19-line, supplier-linked, 100+10-unit bill of materials (~$12,340 total,
~$110/unit at scale). No component substitutions were needed this
session; nothing in the current brief asked for a spec change.

---

## 05 // Session Compression Summary

**Session:** Hardware Computer Design — Session 2 (ship-forward + audit)
**Date:** 2026-09-08
**Output:** 1 new report (this document), 1 new PDF manual, 7 v1.0 design
docs ported forward unmodified
**Key finding:** the design was already complete against all 19 brief
points; the gap was process (unshipped branch), not engineering
**Next action:** open a PR for `docs/hardware/*` to `master`; render the
remaining 5 PDF manuals one per session; start Phase 1 KiCad schematic
**Branch:** `claude/brave-lamport-994pfp`
**Source branch (ported from):** `claude/brave-lamport-t9z5u8` (unmerged,
commit `c7d353ef`, 2026-06-12)

---

*COSMO® CIA — LOT Systems, Inc.*
*Inventor: Vadim Marmeladov*
*Named for Kuzya Cosmo Marmeladov*
