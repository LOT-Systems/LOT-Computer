================================================================================
LOT SYSTEMS CORPORATION
LOT COMPUTER — PHYSICAL NOTIFICATION DEVICE
PLAN + ROADMAP
================================================================================

DOCUMENT    LOT-COMPUTER-ROADMAP
ISSUE DATE  2026.09.22
CLASS       INTERNAL / BUILD
STYLE       TERMINAL GRID
S-2         VADIK MARMELADOV, INVENTOR — COSMO® CIA
SOURCE      S-2 19-POINT BUILD LOGIC (verbatim intake, see 01)

================================================================================

## 00  WHAT THIS IS

A small stainless-steel object that sits on a desk, a shelf, or a charging
dock, and does one thing: it tells you something LOT's AI already knows you
need to hear, right now, without you opening an app. "Coffee time." "Weather
turning." "Your streak needs you." A pager for a life-operating-system,
not a phone. One screen line, one button, one camera, one signal home.

It is a companion object to lot-systems.com — not a standalone gadget. Every
function on it either receives from the LOT API or writes back to it (the
Log tab). No function is meant to work with LOT down.

================================================================================

## 01  INTAKE — S-2 19-POINT LOGIC (verbatim, numbered as received)

```
 1  PCB Way                                          -> manufacturing partner
 2  Send a pager-like notification from an           -> core function
    AI-powered site
 3  2 parts stainless steel body                      -> mechanical, 2-shell
 4  A flat silver square 4x4cm x 5mm height            -> form factor
 5  Camera                                             -> input sensor
 6  Use LOT API connector                              -> software, inbound
 7  Result in PDF manuals                              -> documentation output
 8  Compress the information in each session           -> doctrine/self-assembly
 9  Firmware documents                                 -> documentation, firmware
10  Software to connect with firmware                  -> documentation, software
11  Separate documents                                 -> doc structure
12  Charger                                             -> wireless charging
13  100 units run                                       -> pilot manufacturing
14  Weather sensor                                       -> input sensor
15  AI grade off-the-shelf sensors                       -> component standard
16  Button as "Copy" -> signal to Log tab                -> software, outbound
    on lot-systems.com
17  One side is polished stainless steel                 -> mechanical, face A
18  Other side: camera, screen, button                   -> mechanical, face B
19  Wireless charger                                      -> restates 12
```

Points 12 and 19 are the same requirement (wireless charging) stated twice —
recorded once as WIRELESS-CHARGE in the BOM and mechanical spec, not built
twice. Reading 17+18 against 3+4: the two-part stainless shell is FACE A
(polished, blank) and FACE B (camera + screen + button); the seam between
them is the 4x4cm x 5mm parting line.

CLASSIFICATION: ENGINEERING (hardware). No `hardware/` top-level folder
exists in `docs/` yet — routed under `docs/technical/hardware/` per the
protocol's documented fallback, keeping it beside the one prior hardware
spec in this repo (`LOT-NODE-0-RIG-SPEC.md`, the AI server rig — a
different object, same "own the metal, record every act" house style).

================================================================================

## 02  THE HONEST CONSTRAINT — 5mm IS THE WHOLE PROBLEM

40mm x 40mm x 5mm is a coin-sized footprint. Read literally, 5mm total
height has to hold: stainless top + bottom shells (≥0.3mm each after
machining), a display, a camera module, a battery, a Qi receiver coil, a
weather sensor, an MCU + antenna, and a tactile button travel — stacked.
No off-the-shelf camera+display+battery stack fits that today without a
flexible PCB and the thinnest tier of each part. This is recorded plainly,
not hidden:

    RISK: 5mm total height is achievable ONLY with a flex-PCB stack,
    a bare-die or chip-on-board camera (no lens barrel), a sub-1mm
    flexible/solid-state cell, and a low-profile Qi coil. See
    LOT-COMPUTER-MECHANICAL-SPEC.md 02 for the two paths (5mm strict
    vs. 6-8mm buildable-now) and the part-by-part height budget.

Everything below is planned against the buildable-now path with the strict
5mm path kept as the target for rev B once thinner parts are sourced.

================================================================================

## 03  DOCUMENT SET (point 11 — separate documents)

```
LOT-COMPUTER-ROADMAP.md              this file — plan, phases, BOM link
LOT-COMPUTER-BOM.md                  components, suppliers, links, cost (point 1,4,5,12,14,15,19)
LOT-COMPUTER-MECHANICAL-SPEC.md      2-part shell, dimensions, faces (point 3,4,17,18)
LOT-COMPUTER-FIRMWARE-SPEC.md        firmware architecture (point 9)
LOT-COMPUTER-SOFTWARE-INTEGRATION.md LOT API connector, Log tab signal (point 6,10,16)
LOT-COMPUTER-MANUAL-DRAFT.md         user manual, print/PDF-ready source (point 7)
README.md                            index of this folder
```

Point 7 ("Result in PDF manuals") is honestly PROVISIONAL this session: no
PDF renderer (pandoc/weasyprint/reportlab) is installed in this build
environment, so `LOT-COMPUTER-MANUAL-DRAFT.md` is written print-ready
(fixed line width, no live links needed to read it) rather than faked as a
binary that was never actually produced. Converting it to `.pdf` is a
one-command mechanical step for the next session with a PDF toolchain
available — not a design decision, so it does not block anything else here.

================================================================================

## 04  PHASES

```
PHASE 0   PLAN            <- this document set. DONE this session.
PHASE 1   PROTO-ELECTRICAL  Breadboard the sensor/display/camera/radio stack
                             on a dev board (XIAO ESP32S3 Sense + round
                             display breakout). Prove the notification round
                             trip against the real /api/os/status + Log
                             endpoints on lot-systems.com staging BEFORE any
                             metal is cut. Software risk is cheaper to find
                             here than after a CNC run.
PHASE 2   PROTO-MECHANICAL  PCBWay CNC 1-3 stainless prototype shells at the
                             buildable-now height (see 02). Fit-check the
                             Phase 1 electrical stack inside them. Iterate
                             the shell, not the electronics.
PHASE 3   FIRMWARE FREEZE   Lock the firmware spec (LOT-COMPUTER-FIRMWARE-
                             SPEC.md v1), OTA update path tested, battery
                             life measured on the real shell (thermal mass
                             of stainless changes battery/radio behavior
                             vs. the dev-board test).
PHASE 4   PCB LAYOUT + PCBA  Flex-PCB layout finalized; PCBWay PCBA quote for
                             a 5-10 unit bring-up batch; assemble, flash,
                             burn-in 72h each.
PHASE 5   PILOT RUN (100u)   PCBWay CNC (100x shell pairs) + PCBWay PCBA
                             (100x boards), see LOT-COMPUTER-BOM.md 04 for
                             the cost rollup and MOQ notes per part.
PHASE 6   PAIRING + FIELD    Pairing flow (LOT-COMPUTER-SOFTWARE-
                             INTEGRATION.md), manuals finalized + exported
                             to PDF, units shipped to first cohort.
```

Phase 1 exists specifically so the AI-notification round trip (point 2) and
the Log-tab Copy signal (point 16) are proven on real software before a
single stainless part is machined — cheap software iteration in front of
expensive metal iteration, not the reverse.

================================================================================

## 05  NEXT SESSION

- Source and confirm exact part numbers for the buildable-now (6-8mm) BOM
  path with the supplier's current stock (BOM lines currently name the
  component class + one concrete reference part; treat reference parts as
  ESTIMATES until ordered).
- Get a PCBWay CNC quote on the FACE A / FACE B stainless shells at the
  Phase 2 dimensions once the shell CAD exists (no CAD file exists yet —
  this session produced the spec the CAD is drawn from, not the CAD itself).
- Stand up the two new Fastify routes named in LOT-COMPUTER-SOFTWARE-
  INTEGRATION.md 03 (`POST /api/hardware/pair`, `POST /api/hardware/log`)
  against staging.

================================================================================
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
END LOT-COMPUTER-ROADMAP                                            2026.09.22
================================================================================
