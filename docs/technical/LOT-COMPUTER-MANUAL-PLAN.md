================================================================================
LOT SYSTEMS CORPORATION
LOT COMPUTER
PDF MANUAL GENERATION PLAN
================================================================================

DOCUMENT    LOT-COMPUTER-MANUAL-PLAN / REV A
ISSUE DATE  2026.09.24
CLASS       INTERNAL / BUILD
STYLE       TERMINAL GRID
COMPANION   docs/technical/LOT-COMPUTER-HARDWARE-SPEC.md
            docs/technical/LOT-COMPUTER-FIRMWARE-SPEC.md
            docs/technical/LOT-COMPUTER-SOFTWARE-API-SPEC.md

Point 7 of the S-2 brief: "result in PDF manuals." Point 11: keep documents
separate. This plan covers HOW the manuals get generated and what each one
contains — it does not contain the manuals themselves (those are generated
artifacts, produced once firmware/hardware are locked, not authored by hand
in this repo).

================================================================================

## 00  TOOLING — WHAT THE REPO ALREADY HAS

```
pdfkit  ^0.18.0   Already a project dependency (package.json). This is the
                  correct, in-stack tool for programmatic PDF generation —
                  no new dependency needed. docs/badges/pdf/*.pdf shows
                  this repo already has a house habit of shipping
                  generated PDFs alongside markdown source; the LOT
                  Computer manuals should follow the same pattern: a
                  generator script producing the PDF from structured
                  content, not a hand-built document.
```

No existing generator script for the badge PDFs was found in scripts/ this
session — if one exists elsewhere or was run ad hoc, the LOT Computer
manual generator should be a new, clearly-named script rather than an
assumed extension of unfound code.

```
PROPOSED SCRIPT   scripts/build/generate-device-manuals.ts
                  Reads structured manual content (see 02) and emits PDFs
                  to docs/technical/pdf/ (new folder, mirrors docs/badges/
                  pdf/ convention) using pdfkit.
```

================================================================================

## 01  MANUAL SET (THREE DOCUMENTS, POINT 11 — KEPT SEPARATE)

```
1. QUICK START            1-2 pages. Unbox -> Qi-charge -> pair via BLE
                           (web app flow) -> first notification. This is
                           the ONLY manual that ships printed in the box;
                           the others are QR-linked from it.

2. USER MANUAL             Full operation: what the screen shows, what
                           COPY does, battery/charging behavior, weather
                           sensor readings on-device (if any UI surfaces
                           them — see FIRMWARE-SPEC 04), care/cleaning of
                           the polished stainless face, IP54 rating
                           limits, factory reset. Written for the
                           operator, zero firmware/API detail.

3. SERVICE MANUAL           Restricted / internal. Shell disassembly (the
                           4x M1.6 screws, HARDWARE-SPEC 01), debug pogo
                           header pinout (HARDWARE-SPEC 03), DFU/recovery
                           flow (FIRMWARE-SPEC 05), battery replacement.
                           NOT included in the consumer box — this is for
                           LOT Systems support / repair only.
```

Each manual is generated as its own PDF (three files), matching point 11's
"separate documents" instruction applied to the manual set as well as to
firmware vs. software.

================================================================================

## 02  CONTENT SOURCE OF TRUTH

```
Manual content is NOT hand-duplicated prose. Each manual generator pulls
from the same source-of-truth spec documents so the manuals cannot drift
from the engineering spec:

QUICK START     <- HARDWARE-SPEC 03 (charger), SOFTWARE-API-SPEC 03
                   (pairing flow), FIRMWARE-SPEC 04 (first notification)
USER MANUAL     <- FIRMWARE-SPEC 01/02/04 (power behavior, button, screen),
                   HARDWARE-SPEC 01 (IP54, materials, care)
SERVICE MANUAL  <- HARDWARE-SPEC 01/03 (disassembly, debug header),
                   FIRMWARE-SPEC 05 (DFU/recovery/factory reset)

A future session implementing the generator script should treat the three
LOT-COMPUTER-*-SPEC.md files as the input and the manual PDFs as build
output — the same "docs are source, PDF is derived artifact" relationship
docs/badges/pdf already models in this repo.
```

================================================================================

## 03  BRAND / STYLE

```
Manual layout should follow docs/technical/LOT-STYLE-GUIDE.md if it
defines print/PDF conventions (not audited in this session — flag for
whoever implements the generator to check before hardcoding fonts/colors
into scripts/build/generate-device-manuals.ts). Do not invent a new visual
language for the manuals independent of the existing LOT-STYLE-GUIDE.
```

================================================================================

## 04  OPEN ITEMS

```
- Generator script itself (scripts/build/generate-device-manuals.ts) is
  NOT written in this session — this document is the plan, not the
  implementation. Flagged for a dedicated engineering session once
  HARDWARE-SPEC/FIRMWARE-SPEC/SOFTWARE-API-SPEC are stable enough that
  the manual content will not immediately go stale.
- Printed quick-start card: physical print vendor + packaging insert
  process is unscoped here — PCBWay's own packaging services or a
  separate print vendor, decide alongside the 100-unit order in
  HARDWARE-SPEC 05.
```

================================================================================
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
END OF SPECIFICATION                                                2026.09.24
================================================================================
