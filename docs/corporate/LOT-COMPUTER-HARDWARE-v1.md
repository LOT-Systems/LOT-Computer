<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-COMPUTER-HARDWARE-v1
TITLE:    LOT® Computer — Personal Notification & Presence Terminal
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-09-19
VERSION:  1.0 — PLAN, BOM, ROADMAP (PRE-HARDWARE, NOT YET FABRICATED)
STATUS:   PAPER DESIGN — no unit built, no PCB ordered, no tooling cut
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG — SOURCES THIS DOCUMENT IS BUILT ON
--------------------------------------------------------------------------------

This is a new hardware line, not a rename of an existing one. Before writing a
line of spec, the following prior art was read in full:

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md
    LOT®'s existing hardware object — a cube whose entire vocabulary is
    MOTION (hop/leap/nudge/settle). It has no screen, no camera, and
    explicitly rejects light/text as its primary notification language
    ("a blinking light is a screen substitute, a moving object is not").
    LOT® Computer is the opposite bet: a screen-first, text-first pager.
    The two are siblings, not the same object.

  docs/benchmark/LOT-MANIFEST.md (line 31, line 88-89)
    Records a prior, textually distinct effort — "COSMO Hardware —
    complete hardware computer design v1.0" (brave-lamport-t9z5u8 series,
    +2610 lines, 14 iterations, STATUS: BEST). Per the manifest's own
    note (Section 01, 2026-06-27), the branches in that series "no longer
    exist on the remote" and no corresponding file was found anywhere
    under docs/ in the current tree — the content did not land. This
    document does not assume, reconstruct, or claim continuity with that
    lost branch series. It starts from the live repo as found, per
    CARDINAL RULE 3 of the benchmark protocol ("discover, don't assume").
    The current working branch (claude/brave-lamport-9yyabj) shares a
    name root with that prior series by coincidence of the branch-name
    generator, not by design — noted here so a future session does not
    mistake naming coincidence for provenance.

  docs/corporate/LOT_ROBOTICS_COSMO.md
    COSMO® is the robotics division — a humanoid-adjacent companion that
    carries an owner's behavioral "soul" signature, gated by Benchmark
    tier. LOT® Computer is NOT a COSMO® product. It carries no soul
    profile, performs no autonomous action, and makes no companionship
    claim. It borrows exactly one idea from this document: hardware
    should not activate without a verified LOT profile (Section 06).

  docs/corporate/LOT-AMBIENT-AI-VISION.md
    Establishes the existing LOT® hardware ecosystem — LOT® Station
    (weather + air quality) and LOT® Brush (connected toothbrush) — both
    Usership-kit hardware that surface "one line, no alarm, exact
    moment." LOT® Computer is the third member of this family: the
    ecosystem's first hardware object with its own screen, rather than
    a sensor that feeds a software widget. The design rule stated there
    ("hardware is invisible data... the complexity is structural, the
    surface is clean") governs every UI decision in Section 04 below.

  docs/technical/OS_API.md
    The existing user OS API (`/api/os/status`, `/api/os/version`).
    LOT® Computer's software connector (see LOT-COMPUTER-SOFTWARE-API-v1.md)
    extends this API family rather than inventing a parallel one.

  src/client/components/ui/Layout.tsx (line 72)
    Confirms the "Log" tab is a real, live nav item (`{ label: 'Log',
    route: 'logs' }`), not a document invention. Requirement 16 below
    (the COPY button) wires into this existing tab.

--------------------------------------------------------------------------------
01 // WHAT THIS DOCUMENT IS AND WHAT IT IS NOT
--------------------------------------------------------------------------------

  THIS DOCUMENT IS:
    - A plan: physical form, bill of materials, manufacturing route, and
      a staged roadmap from single-prototype to a 100-unit pilot run.
    - Honest about status: nothing described here has been fabricated.
      No PCB has been ordered from PCBWay. No enclosure has been
      machined. Every dimension, part number, and cost figure is a
      SPEC or an ESTIMATE, marked as such.
    - The first of three documents (Section 11 of the brief this
      responds to: "separate documents"). Firmware and software/API
      integration are specified in their own files, not folded in here:
        docs/technical/LOT-COMPUTER-FIRMWARE-v1.md
        docs/technical/LOT-COMPUTER-SOFTWARE-API-v1.md

  THIS DOCUMENT IS NOT:
    - A claim that units exist, that PCBWay has been contacted, or that
      tooling has been quoted. Section 08 (Manufacturing) is a plan to
      execute, not a record of execution.
    - A finished industrial design. Dimensions in Section 02 are a
      working spec for the first prototype pass, expected to move once
      a mechanical engineer reviews thermal, antenna, and camera-cone
      constraints against the stainless steel shell.

--------------------------------------------------------------------------------
02 // PHYSICAL FORM
--------------------------------------------------------------------------------

  NAME (working)     LOT® Computer — internal codename PAGE
                      (chosen to describe the function — a pager-like
                      notification terminal — without colliding with
                      CUBIQ™'s motion vocabulary or COSMO®'s robotics
                      branding; see Section 00)

  BODY                Two-part 316L stainless steel shell, CNC-machined
                      or MIM (metal injection molding, if the 100-unit
                      run justifies tooling — see Section 08)
    FRONT PLATE        Camera + screen + button (Section 04). Matte or
                      bead-blasted finish around the screen bezel to
                      cut glare.
    BACK PLATE         Mirror-polished stainless steel, blank except for
                      a laser-etched LOT® wordmark. No screen, no vents,
                      no visible seam on the polished face — the
                      "presence object" side, meant to sit face-down on
                      a desk when not in active use, per the Ambient AI
                      principle of a quiet, undemanding physical object.
    OVERALL FOOTPRINT   ~50mm x 50mm x 12mm, SPEC — sized to sit upright
                      in a small stainless steel stand or lie flat on
                      the charging plate (below). Final thickness is
                      gated by battery capacity (Section 03) and camera
                      module z-height; both are unresolved pending
                      prototype 1.

  CHARGING BASE       A separate object, not part of the two-piece body:
    DIMENSIONS         40mm x 40mm x 5mm — flat silver square, brushed
                      aluminum or stainless steel top face
    FUNCTION            Qi-class wireless charging transmitter (Section
                      03) AND the flat reference surface the device
                      rests on. Shares the "the charging pad is a LOT®
                      object in its own right" principle already
                      established for CUBIQ (LOT-CUBIQ-QUANTUM-CUBE-v0.md,
                      Section 02) — here it charges rather than serves
                      as a hop surface.

--------------------------------------------------------------------------------
03 // ELECTRONICS — BILL OF MATERIALS (off-the-shelf, prototype-grade)
--------------------------------------------------------------------------------

Every part below is a real, sourceable component. Costs are SPEC unit
prices at low volume (1-100 units) from public distributor pricing as of
this document's date; they are ESTIMATES, not quotes, and will move once
PCBWay/a distributor is engaged (Section 08).

  CATEGORY          PART (CANDIDATE)              WHY THIS PART
  --------          -----------------              --------------
  MCU / SoC          ESP32-S3 (dual-core, Wi-Fi     Off-the-shelf,
                      + BLE, camera DVP interface,   "AI-grade" via its
                      vector/SIMD instructions for   ESP-NN kernels for
                      on-device inference)            on-device inference
                                                       — Requirement 15.
  CAMERA             OV2640 or OV5640 module         Low-resolution by
                      (off-the-shelf, ESP32-S3-      choice (see Section
                      compatible)                     09, Ethics) — not a
                                                       surveillance-grade
                                                       sensor.
  DISPLAY             Sharp Memory LCD, ~1.3",        Monochrome,
                      reflective, monochrome           ultra-low static
                                                       power, fast enough
                                                       refresh for short
                                                       text ("Coffee
                                                       time!") without the
                                                       multi-second redraw
                                                       of e-paper.
  WEATHER SENSOR      Bosch BME688 (temp, humidity,   Literally marketed
                      pressure, gas/VOC, with an      by its manufacturer
                      on-chip AI-assisted gas-scan     as an "AI-grade"
                      mode)                            off-the-shelf
                                                       sensor — direct
                                                       match to Requirement
                                                       14 + 15. Extends the
                                                       LOT® Station sensor
                                                       family (LOT-AMBIENT-
                                                       AI-VISION.md) into a
                                                       pocket form factor.
  PRESENCE / EDGE     VL53L0x time-of-flight          Same component
  SENSOR              sensor                          class CUBIQ already
                                                       uses for edge-
                                                       detection safety
                                                       (LOT-CUBIQ-QUANTUM-
                                                       CUBE-v0.md, Section
                                                       03) — reused here to
                                                       wake the screen when
                                                       a hand approaches,
                                                       not to detect table
                                                       edges.
  IMU                 LSM6DS3 6-axis                  Orientation-aware
                                                       wake (screen faces
                                                       up vs. face-down on
                                                       desk).
  SECURE ELEMENT       ATECC608 (or equivalent)        Per-unit device
                                                       identity; gates
                                                       activation on a
                                                       verified LOT profile
                                                       (Section 09,
                                                       borrowed from
                                                       LOT_ROBOTICS_COSMO.md
                                                       Section 06 — "a
                                                       unit without a
                                                       verified LOT profile
                                                       does not activate").
  WIRELESS CHARGE RX   Qi receiver coil + PMIC         In the device.
                      (e.g. BQ51013B class)
  WIRELESS CHARGE TX   Qi transmitter IC (e.g.         In the 40x40x5mm
                      BQ500410 class) + coil           charging base.
  BATTERY              LiPo, 250-400mAh, SPEC          Sized for a
                                                       multi-day pager
                                                       duty cycle at
                                                       Section 04's
                                                       low-refresh screen;
                                                       exact capacity
                                                       pending real
                                                       current-draw
                                                       measurement on
                                                       prototype 1.
  BUTTON               Single tactile switch,          Requirement 16 —
                      laser-etched "COPY" cap          see Section 05.

--------------------------------------------------------------------------------
04 // THE NOTIFICATION LANGUAGE — SCREEN
--------------------------------------------------------------------------------

Where CUBIQ speaks in motion, LOT® Computer speaks in one short line of
text, exactly the Ambient AI™ rule already on record
(LOT-AMBIENT-AI-VISION.md: "one line, no alarm, exact moment").

  SCREEN STATE        WHAT SHOWS
  ------------          ----------
  IDLE                 Blank / last message retained (memory LCD holds
                      an image with zero refresh power — nothing is
                      "on" between notifications)
  NOTIFICATION         One short line, sent by the AI layer at
                      lot-systems.com (Index of Systems / QIE — see
                      LOT-COMPUTER-SOFTWARE-API-v1.md), e.g.:
                        "Coffee time!"
                        "Air quality: crack a window."
                        "Badge unlocked — Purple tier."
  PRESENCE WAKE        VL53L0x detects an approaching hand → screen
                      redraws current message at full contrast, no new
                      content — a pager glanced at, not pinged.

No scrolling feed, no unread badge count, no icon grid. This is a direct
hardware expression of the Ambient AI™ design principle "everything
quantified, nothing displayed unless it matters" — a screen that is
almost always doing nothing.

--------------------------------------------------------------------------------
05 // THE BUTTON — "COPY"
--------------------------------------------------------------------------------

Requirement 16 of the originating brief, verified against live code
(Section 00): the "Log" tab (`route: 'logs'`) already exists in the
product. The button does exactly what its label says:

  PRESS "COPY"  →  the message currently on screen is sent, via the LOT
                    API connector (LOT-COMPUTER-SOFTWARE-API-v1.md), as a
                    new entry appended to the operator's Log tab on
                    lot-systems.com — the physical object's screen
                    content becomes a permanent record in the same place
                    every other LOT signal lives.

This is deliberately the device's only input. One button, one action,
no menu. The exact server-side write path (which existing log-ingestion
route the firmware calls) is not yet confirmed against the live
`src/server` code and is marked OPEN in LOT-COMPUTER-SOFTWARE-API-v1.md,
Section 03 — an honest gap, not a guessed endpoint.

--------------------------------------------------------------------------------
06 // WIRELESS CHARGING
--------------------------------------------------------------------------------

Requirements 12 + 19 are one feature, not two: the device charges only
via the Qi-class inductive base described in Section 02. No charging
port, no cable, on the device body — consistent with a sealed two-piece
stainless steel shell (no port to weatherproof, no cable to snag on the
polished back face).

--------------------------------------------------------------------------------
07 // "COMPRESS THE INFORMATION IN EACH SESSION"
--------------------------------------------------------------------------------

Requirement 8 maps to an existing, real pattern in this repo rather than
a new invention: the Memory Engine's compression architecture
(docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md) and the
benchmark protocol's own WORDS-trend discipline
(docs/benchmark/LOT-DOCTRINE.md, Step 06 of the benchmark pipeline).

Applied to hardware: the device does not stream raw sensor readings
continuously. It buffers locally for one "session" (a wake-to-sleep
cycle bounded by the presence sensor, Section 03), compresses that
session to its meaningful deltas (temperature/humidity change, gas-scan
event, button press, screen-content history), and syncs one compact
summary per session — full mechanism specified in
LOT-COMPUTER-FIRMWARE-v1.md, Section 04. This keeps battery draw and
API load down and mirrors the software side's existing compression
ethic rather than introducing a second, disconnected one.

--------------------------------------------------------------------------------
08 // MANUFACTURING — PCBWAY, PROTOTYPE TO 100-UNIT PILOT
--------------------------------------------------------------------------------

PCBWay is the named manufacturing partner (Requirement 1) for the full
stack this design needs from one vendor relationship:
  - PCB fabrication (the main board carrying the BOM in Section 03)
  - PCBA (SMT assembly — placing and reflow-soldering the BOM)
  - CNC machining (stainless steel front/back plates, prototype qty)
  - Sheet metal (the 40x40x5mm charging base, brushed finish)

  STAGE               QTY     WHAT                          GATE
  -----                ---     ----                          ----
  PROTO 0              1       Dev-board bring-up (ESP32-S3   Firmware
                              devkit + breakout BOM parts,     boots,
                              no custom PCB, no enclosure)      camera +
                                                                 display +
                                                                 sensors
                                                                 all read
                                                                 correctly.
  PROTO 1              5       First custom PCB from PCBWay    Board
                              (PCB + PCBA) in a 3D-printed      powers on,
                              stand-in shell, NOT yet the       Qi charge
                              stainless steel enclosure          works,
                                                                 battery
                                                                 life
                                                                 measured
                                                                 for real.
  PROTO 2               10      PCBWay CNC-machined stainless   Full
                              steel shell (Section 02) fitted   mechanical
                              to the Proto 1 board revision      fit —
                                                                 camera
                                                                 cone,
                                                                 button
                                                                 travel,
                                                                 charge
                                                                 alignment
                                                                 on the
                                                                 40x40x5mm
                                                                 base.
  PILOT RUN             100     Full production run —           Requirement
                              PCBWay PCB + PCBA + CNC/MIM        13. Gate:
                              enclosure at pilot volume           Proto 2
                                                                 design
                                                                 frozen,
                                                                 zero open
                                                                 mechanical
                                                                 issues.

No stage above has been started. This table is the plan; execution
begins with a PCBWay quote request against the Section 03 BOM and the
Section 02 mechanical drawing — neither exists yet as a file. That is
the next concrete task, not part of this document.

--------------------------------------------------------------------------------
09 // ETHICS — THE CAMERA
--------------------------------------------------------------------------------

The camera (Section 03) is the one component on this device most likely
to be misread as surveillance hardware if its scope is not stated
plainly, borrowing the "what LOT will never do" discipline from
LOT_ROBOTICS_COSMO.md Section on Ethical Framework:

  - Low-resolution sensor by deliberate choice (OV2640/OV5640, not a
    high-megapixel module) — sized for presence/QR-pairing use, not
    photography.
  - No image leaves the device by default. The intended use (pairing
    QR scan, ambient presence confirmation) is processed on-device via
    the ESP32-S3's local inference path (Section 03); this document
    commits to that boundary. If any future revision needs to transmit
    frames off-device, that is a new, explicit decision requiring its
    own S-2-authorized document — never a silent capability creep.
  - Same activation gate as COSMO® hardware (Section 00): the device
    does not power its camera or screen until paired to a verified
    Usership-tier LOT profile.

--------------------------------------------------------------------------------
10 // DELIVERABLES — PDF MANUALS (Requirement 7)
--------------------------------------------------------------------------------

Two manuals, generated the same way the repo already produces PDFs
(scripts/generate_badge_pdf_v30.py — Python + reportlab, already proven
in this codebase):

  docs/technical/pdf/LOT-COMPUTER-QUICKSTART-v1.pdf   [GENERATED this session]
    One page, text-only: place on charging base, wait for the pairing
    code on screen, enter it at lot-systems.com/pair, done. Explicitly
    marked pre-production / text-only in its own footer — it has no
    product photography because none exists yet (Section 08, Proto 0
    has not run). It exists now to prove the manual structure and the
    generation pipeline ahead of real hardware, not to claim a finished
    manual.

  docs/technical/pdf/LOT-COMPUTER-USER-MANUAL-v1.pdf   [NOT YET GENERATED]
    Full manual: physical care (polished face fingerprints, cleaning),
    what the screen does and does not show (Section 04), what the COPY
    button does (Section 05), charging, and the Section 09 camera
    ethics statement in plain language for the box insert. Deferred
    until Proto 1/2 (Section 08) produce something to photograph —
    a full manual with no product image is worse than no manual.

--------------------------------------------------------------------------------
11 // ROADMAP SUMMARY
--------------------------------------------------------------------------------

  NOW           This document + LOT-COMPUTER-FIRMWARE-v1.md +
                LOT-COMPUTER-SOFTWARE-API-v1.md — plan, BOM, connector
                spec. No hardware exists.
  NEXT          Proto 0 (dev-board bring-up), off the shelf, no PCBWay
                order yet.
  THEN          PCBWay quote + Proto 1 (5 units, custom PCB).
  THEN          Proto 2 (10 units, stainless steel shell from PCBWay
                CNC).
  PILOT         100-unit run (Requirement 13), gated on Proto 2 closing
                with zero open mechanical issues.
  ONGOING       Joins the LOT® hardware ecosystem alongside LOT® Station
                and LOT® Brush (LOT-AMBIENT-AI-VISION.md) as a Usership-
                kit item once past pilot.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-COMPUTER-HARDWARE-v1
================================================================================
