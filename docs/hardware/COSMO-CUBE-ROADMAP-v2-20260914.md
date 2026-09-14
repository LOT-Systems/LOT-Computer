<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Inventor, COSMO® CIA
  Document: COSMO-CUBE-ROADMAP-v2-20260914.md
  Classification: Internal Engineering — Confidential
  Date: 2026-09-14
-->

# COSMO® Cube — Roadmap Analysis & Ship Note v2

**Document:** COSMO-CUBE-ROADMAP-v2-20260914.md
**Product:** COSMO® Cube — hardware computer connected to lot-systems.com
**Classification:** Internal Engineering — Confidential
**Author:** Vadim Marmeladov, Inventor, COSMO® CIA (session: scheduled build request, 2026-09-14)
**Status:** v1.0 design SHIPPED to this branch this session. Phase 1 engineering NOT started.

---

## 00 // READING LOG — WHAT THIS DOCUMENT IS BUILT ON

This is not a new invention. The scheduled request that opened this session
("build a hardware computer connected to the LOT site... plan, components
buying list, link, and analyze the roadmap") describes, point for point, a
device that was already fully specified on **2026-06-12** and has been
sitting on an unshipped branch for three months. Before writing a line of
new spec, the following were read in full:

  `docs/hardware/COSMO-HARDWARE-REPORT-v1.md` (this session, copied from
  `origin/claude/brave-lamport-t9z5u8`, commit `c7d353ef`)
    Executive summary, design-decision log, BOM summary, and Phase 0-4
    roadmap for the COSMO® Cube — a 40×40×5mm 316L stainless steel device,
    2-part body, PCBWay-manufactured, 100-unit run, Copy button → LOT Log
    tab, pager-style AI notifications ("Coffee time!").

  `docs/hardware/COSMO-DEVICE-SPEC-v1.md`, `COSMO-BOM-v1.md`,
  `COSMO-FIRMWARE-v1.md`, `COSMO-SOFTWARE-API-v1.md`,
  `COSMO-MANUFACTURING-v1.md`, `COSMO-CHARGER-SPEC-v1.md`
    The six supporting documents — electronics architecture, line-item BOM
    with supplier links, ESP-IDF firmware architecture, LOT API connector
    + Fastify route implementations, PCBWay manufacturing guide, wireless
    charger spec.

  `docs/corporate/LOT_ROBOTICS_COSMO.md`
    Confirms COSMO® as Vadim's son Kuzya's namesake robotics/hardware
    division, distinct from LOT®'s own CUBIQ™ notification cube.

  `docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md`, Section 00
    Independently names this exact branch and commit as "a general-purpose
    hardware computer" and warns the two product lines "should share no
    naming collision going forward." That warning is honored here — this
    document is COSMO® Cube, not CUBIQ™.

  `docs/benchmark/LOT-MANIFEST.md`
    Lists "COSMO Hardware | brave-lamport-t9z5u8 | c7d353ef | 14/14 | BEST
    | 7 | +2610 | COSMO® Cube — complete hardware computer design v1.0" in
    the ship queue, then separately states (§ note, 2026-06-27) that ship-
    queue branches "no longer exist on the remote — they were incorporated
    into master in prior sessions."

**Correction to the record (honest engineering):** that incorporation claim
is false for this feature. `origin/claude/brave-lamport-t9z5u8` still
exists on the remote at commit `c7d353ef`, and `docs/hardware/` did not
exist anywhere on this branch's history before this session. The v1.0
design was never shipped. It sat BEST-and-untouched for 94 days. Section
04 below folds this into doctrine so it does not recur silently again.

---

## 01 // THE 19-ITEM REQUEST, MAPPED TO EXISTING v1.0 SPEC

Every numbered item in this session's intake maps to a section already
written on 2026-06-12. None required new invention; all are copied into
this branch for the first time this session.

| # | Requested item | Already specified in | Status |
|---|-----------------|----------------------|--------|
| 1 | PCBWay manufacturing | MANUFACTURING-v1 §2 (PCB, SMT, CNC orders) | Spec complete, order not placed |
| 2 | Pager-like AI notification from the site | DEVICE-SPEC §7.2, SOFTWARE-API §3.1 | Spec complete, endpoint not coded |
| 3 | 2-part stainless steel body | DEVICE-SPEC §2, HARDWARE-REPORT decision #8 | Spec complete |
| 4 | Flat silver square 4×4cm × 5mm | DEVICE-SPEC §2 (40×40×5mm, natural silver SS) | Spec complete |
| 5 | Camera | DEVICE-SPEC §5.3 (Himax HM01B0) | Spec complete, part not purchased |
| 6 | LOT API connector | SOFTWARE-API-v1 (full endpoint set) | Spec + reference server code complete, not deployed |
| 7 | Result in PDF manuals | HARDWARE-REPORT §"PDF Manual Plan" (6 manuals scoped) | Planned, none produced yet |
| 8 | Compress information in each session | SOFTWARE-API §6 (HardwareDaySummary) | Spec complete |
| 9 | Firmware documents | FIRMWARE-v1 (608 lines, full ESP-IDF architecture) | Spec complete, no firmware repo exists |
| 10 | Software to connect with firmware | SOFTWARE-API-v1 (Fastify routes + schema) | Spec complete, not implemented in `src/server` |
| 11 | Separate documents | 7 documents, one per concern, `docs/hardware/` | Done (this session: landed on branch) |
| 12 | Charger | CHARGER-SPEC-v1 (Qi Rx + Tx pad, full stack-up) | Spec complete |
| 13 | 100 units run | BOM-v1, MANUFACTURING-v1 (110 ordered incl. overage) | Spec complete |
| 14 | Weather sensor | DEVICE-SPEC §5.4 (Bosch BME280) | Spec complete |
| 15 | AI-grade off-the-shelf sensors | DEVICE-SPEC §5.4 (ICM-42688-P, APDS-9960) | Spec complete |
| 16 | "Copy" button → Log tab signal | DEVICE-SPEC §7.1, SOFTWARE-API §3.2 | Spec complete, not deployed |
| 17 | One side polished stainless steel | DEVICE-SPEC §4 (Side A, mirror #8 finish) | Spec complete |
| 18 | Other side: camera, screen, button | DEVICE-SPEC §3 (Side B front-face layout) | Spec complete |
| 19 | Wireless charger | CHARGER-SPEC-v1 (Qi 5W, in-box pad) | Spec complete |
| — | Screen showing e.g. "Coffee time!" | DEVICE-SPEC §8, SOFTWARE-API §4.3 (exact phrase, exact mechanism) | Spec complete |

**Reading-material note:** `brand.lot-systems.com`, `lot-systems.com/about`,
and `institute.lot-systems.com/cqgs.html` were named as background reading
in this session's request. Their content is already the source material
the v1.0 documents were built from — the COSMO® naming, the LOT® wordmark
engraving spec, the CQGS piezoelectric/psychotronic-sensor register, and
the "military purity" no-decoration interface standard all originate
there and are already reflected in DEVICE-SPEC-v1 and the Field Manual.
No new reading changes the v1.0 design; it confirms it was built correctly
the first time.

---

## 02 // LINK VERIFICATION — ATTEMPTED, BLOCKED

This session attempted to live-verify the supplier links in `COSMO-BOM-v1.md`
(PCBWay order pages, Mouser part search) before restating them as current.
Both `pcbway.com` and `mouser.com` are outside this environment's network
egress allowlist — the fetch was refused at the proxy, not by the vendor
site. No claim is made here about whether prices, stock, or MPNs in
BOM-v1 have moved since 2026-06-12; three months is enough time for
component pricing (especially the custom LiPo and CNC quotes) to have
shifted. **Action for S-2 or a future session with broader network access:**
re-quote PCBWay PCB + CNC + SMT and re-check Mouser/DigiKey stock on
ESP32-S3-MINI-1U, ICM-42688-P, and BQ51013B before placing any order —
treat BOM-v1's prices as directional, not current quotes.

---

## 03 // IMPLEMENTATION GAP — HONEST STATUS, 2026-09-14

Verified against the live repository, not assumed:

- `src/server/routes/` has no `/api/hardware/*` routes. `api.ts`,
  `admin-api.ts`, `auth.ts`, `os-api.ts`, and `public-api.ts` were checked;
  none reference hardware devices, logs, or notifications.
- `prisma/schema.prisma` and `migrations/` have no `hardware_devices`,
  `hardware_logs`, or `hardware_notifications` tables. SOFTWARE-API-v1 §2.2
  is schema, not migration.
- No firmware repository or `cosmo-firmware/` directory exists anywhere in
  this codebase. FIRMWARE-v1 is architecture and pin-map documentation, not
  buildable source.
- No KiCad project, Gerbers, STEP/DXF enclosure files, or PDF manuals exist.
  MANUFACTURING-v1 §5 names the files PCBWay needs; none have been drawn.

**Conclusion:** Phase 0 (Design) from HARDWARE-REPORT-v1's own roadmap is
complete and, as of this session, finally landed in version control.
Phase 1 (Engineering — schematic, PCB layout, enclosure CAD, backend
migration + routes) has not been started. The 100-unit production run,
the PCBWay order, and the PDF manuals all depend on Phase 1 first. Calling
this session's output a "hardware computer" would overstate it — it is a
complete, production-ready **plan** for one, now finally committed where
the next session can act on it.

---

## 04 // DOCTRINE FOLD — DESIGN-SHIP LAG

Extends **Manifest Hygiene** and **Ship Mode Discipline**
(`docs/benchmark/LOT-DOCTRINE.md`): a BEST-tagged branch is not safe from
silent staleness just because it is marked BEST. `brave-lamport-t9z5u8`
sat BEST, untouched, for 94 days (2026-06-12 → 2026-09-14) while the
MANIFEST asserted it had already been incorporated into master. The
assertion was never checked against the actual tree. Rule going forward:
a MANIFEST "incorporated into master" note is a claim, not a fact, until
the target files are confirmed present via `ls`/`grep` on the receiving
branch — the same discipline this protocol already applies to `LAST_GREEN`
tags in step 00. This session's fix was mechanical: read the branch, `cp`
its files, verify by directory listing, correct the MANIFEST row. The
same check should run before any future MANIFEST row is trusted at face
value.

---

## 05 // NEXT ACTIONS (Phase 1, in dependency order)

1. KiCad 8.0 schematic capture from DEVICE-SPEC-v1 §5 (Section 5.1-5.5
   component list is already the netlist's parts).
2. PCB layout, 35×35mm 4-layer, per MANUFACTURING-v1 §2.1 parameters.
3. Enclosure CAD (Fusion 360/FreeCAD) from DEVICE-SPEC-v1 §2-4 dimensions
   and MANUFACTURING-v1 §2.3 machining features — produces the STEP/DXF
   PCBWay CNC needs.
4. `migrations/` — add `hardware_devices`, `hardware_logs`,
   `hardware_notifications` per SOFTWARE-API-v1 §2.2 (this repo already
   has the Sequelize/Prisma migration pattern; SOFTWARE-API-v1's schema
   translates directly).
5. `src/server/routes/` — add the four endpoints in SOFTWARE-API-v1 §3,
   following the same `fastify.get`/`fastify.post` pattern already used in
   `api.ts`.
6. Re-quote PCBWay (PCB, SMT, CNC) and Mouser/DigiKey stock once Gerbers
   and STEP files exist (see §02 — do this before ordering, not from
   BOM-v1's June prices alone).
7. Only after 1-6: place the 100-unit (110-ordered) production order.

---

*Document v2 — COSMO® CIA — LOT Systems, Inc.*
*Inventor: Vadim Marmeladov*
*Supersedes nothing — v1.0 documents stand verbatim; this is the next layer.*
