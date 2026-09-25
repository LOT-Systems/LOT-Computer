================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-SIGNET-HARDWARE-v0
TITLE:    LOT® SIGNET™ — v.0 Physical Notification Badge — Plan, BOM, Roadmap
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-09-25
VERSION:  0.1 — PLANNING START (PRE-HARDWARE, DESIGN LOCK PENDING)
STATUS:   v.0 — PLAN + BOM + ROADMAP (NO UNITS ORDERED)
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG — SOURCES THIS DOCUMENT IS BUILT ON
--------------------------------------------------------------------------------

This document answers S-2's request (scheduled routine "LOT Hardware
Computer", 2026-09-25): a plan, a components buying list, and a roadmap for
a physical device connected to lot-systems.com. Before writing a line of
spec, the following were read:

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md
    LOT®'s only prior hardware-spec document. Its own reading log names a
    sibling hardware track: "COSMO® Cube — complete hardware computer
    design v1.0" on branch brave-lamport-t9z5u8, and draws the naming
    boundary this document must respect — CUBIQ™ is LOT®'s notification
    body (a cube that hops), COSMO® is a separate personal-robotics
    brand. Neither name fits the device S-2 is describing here.

  docs/benchmark/LOT-MANIFEST.md, line 31
    Lists "COSMO Hardware | brave-lamport-t9z5u8 | ... | COSMO® Cube —
    complete hardware computer design v1.0" at STATUS: BEST (ship
    candidate, never shipped). VERIFIED THIS SESSION: that branch no
    longer resolves on origin (`git fetch origin brave-lamport-t9z5u8`
    fails — no such ref), and no commit matching "COSMO Cube" or
    "hardware computer" exists in this repository's history on any
    reachable branch. That +2,610-line design was lost before it
    reached master. This document does not attempt to reconstruct it —
    the physical form S-2 specifies today (a flat two-sided square, not
    a cube) is different enough that reconstruction would be guessing.
    The loss itself is recorded here as a standing argument for shipping
    hardware specs to `docs/corporate/` early and often rather than
    letting them live only on a feature branch.

  docs/corporate/LOT_ROBOTICS_COSMO.md
    Confirms COSMO® is a distinct brand (personal companion robotics,
    "soul transfer," owned in spirit by Kuzya Cosmo Marmeladov) and is
    not a notification device. This document's device is filed under
    LOT® proper, not COSMO®, for the same reason CUBIQ™ was: it serves
    the LOT® software product directly.

  src/server/routes/api.ts:1563-1587, src/server/models/log.ts,
  src/client/components/ui/Layout.tsx:23,72
    Read to ground the "Copy button -> Log tab" requirement (item 16 of
    the brief) in the ACTUAL running system rather than an assumed one.
    Findings carried into Section 06 below: the Log tab is real (route
    `logs`, label "Log"), the create-log endpoint is real
    (`POST /api/logs`, body `{ text, event, metadata }`), and — this is
    the important finding — that endpoint is gated by session-cookie
    auth only (`req.user` set from a cookie session lookup in
    src/server/index.ts:~300-321). There is no API-key or device-token
    auth path anywhere in `src/server/routes/public-api.ts` or
    `api.ts` today. A headless hardware device cannot authenticate to
    `POST /api/logs` as the system exists right now. This is new
    backend work, not a wiring exercise — recorded honestly rather than
    assumed away.

  External sources named in the brief (brand.lot-systems.com,
  https://lot-systems.com/about, https://institute.lot-systems.com/cqgs.html)
    ATTEMPTED, BLOCKED: this session's network egress proxy blocks all
    three domains (`EGRESS_BLOCKED`), and also blocked a supplier
    reference fetch (pcbway.com) attempted for BOM verification. This
    document's brand-voice and BOM links are therefore drawn from
    internal precedent (CUBIQ, COSMO, Node-0 rig spec) and from
    well-known, real supplier catalog entries cited by name/part number
    rather than live-fetched pricing. RECORD FOR NEXT SESSION: verify
    the three URLs and re-derive brand language from source once
    egress is available, and confirm current pricing/stock for every
    BOM line before any purchase order is cut.

  docs/technical/LOT-NODE-0-RIG-SPEC.md
    LOT®'s other hardware document (a self-hosted inference server, not
    a wearable). Confirms the Terminal Grid documentation style used
    here and confirms no naming collision — Node-0 is a rig, SIGNET is
    a badge.

--------------------------------------------------------------------------------
01 // NAMING — LOT® SIGNET™
--------------------------------------------------------------------------------

The brief describes a flat, two-sided, stainless-steel notification badge —
not a robot (COSMO®), not an actuated cube (CUBIQ™), not a server (Node-0).
It is named LOT® SIGNET™ here: a signet is historically a small flat
stamped medallion carried on the person — the physical form matches
exactly (flat square, polished face, a mark on the reverse), and "signet"
already carries the sense of a personal, authenticated mark, which fits a
device whose entire job is proving a signal came from a specific person's
LOT profile back to their own Log tab.

  WHAT v.0 IS:
    - A locked physical form factor and a bill of materials sufficient to
      order prototype units from PCBWay.
    - A notification receiver: the LOT® backend pushes short text to the
      device's screen (e.g. "Coffee time!").
    - A single-button uplink: pressing "Copy" writes one authenticated
      log entry back to the owner's Log tab on lot-systems.com.
    - A weather/ambient sensor reporting into the same log stream.
    - A camera present in v.0 as a populated-but-inert BOM line (module
      selected, not yet wired to a firmware capture pipeline — see
      Section 07).

  WHAT v.0 IS NOT:
    - Not yet ordered. No PCB has been fabbed, no enclosure milled. This
      is the plan and BOM that precede a PCBWay order.
    - Not a computer-vision product in v.0. The camera BOM line is
      selected for a v1 feature (visual log capture); v.0 firmware does
      not process camera frames.
    - Not authenticated against the live LOT API yet, because that API
      does not have a device-auth path yet (Section 06 opens that work
      as a prerequisite, not a footnote).

--------------------------------------------------------------------------------
02 // PHYSICAL FORM (per S-2 brief, items 3-4, 17-19)
--------------------------------------------------------------------------------

  FOOTPRINT          40mm x 40mm x 5mm — flat square, per brief
  BODY               Two-part stainless steel shell (top + bottom shell,
                      brief item 3)
  FACE A (rear)       Polished stainless steel, no markings — the "signet"
                      face. Brief item 17.
  FACE B (front)      Camera aperture, screen window, single button.
                      Brief item 18.
  MASS TARGET         <40g fully assembled (thin flat form limits internal
                      volume more than it limits mass; 5mm stack height is
                      the binding constraint — see Section 03)
  CHARGING            Wireless (Qi-class inductive) through the base,
                      consistent with the CUBIQ™ precedent
                      (LOT-CUBIQ-QUANTUM-CUBE-v0.md Section 02) — one
                      LOT® charging-pad object serves both device lines.
                      Brief items 12, 19.
  MOUNTING            None specified in the brief. OPEN QUESTION for S-2:
                      desk-stand, lanyard loop, or magnetic dock — decides
                      whether a loop/notch survives the 5mm stack height.

  THE 5mm CONSTRAINT — THE HARD PART OF THIS SPEC
    A 5mm total height must contain, top to bottom: two stainless shell
    halves, a display, a PCB with MCU/radio/sensors, a battery, and a Qi
    receiver coil. Standard round LiPo cells and standard Qi receiver
    coils are individually 1-3mm thick; stacked naively they exceed 5mm
    before the display or shells are counted. This is flagged HERE,
    plainly, rather than glossed over: v.0 BOM selections in Section 03
    are chosen specifically for their thin-stack datasheet numbers, and
    the roadmap in Section 08 puts a stack-height physical mockup
    (cardboard/acrylic, no electronics) before any PCB is fabbed, so the
    5mm constraint is validated before money is spent on PCBWay.

--------------------------------------------------------------------------------
03 // BILL OF MATERIALS — v.0 REFERENCE BOM (per unit, pilot qty basis)
--------------------------------------------------------------------------------

Every line below is a real, named, sourceable part class. Prices are
NOT live-quoted (egress to supplier sites was blocked this session —
Section 00) and must be re-verified before ordering. Where a device is
"AI grade off-the-shelf" (brief item 15) the class is named; the exact
SKU is an S-2/engineering decision at order time, not a documentation
decision.

  COMPONENT              CLASS / EXAMPLE PART                 STACK HEIGHT  SUPPLIER
  ----------------------  ------------------------------------  ------------  -----------------
  MCU + radio             Nordic nRF52840 or ESP32-C3 (BLE +      ~1.0mm die   Mouser / DigiKey
                          Wi-Fi; nRF52840 favored for BLE-only    on PCB
                          power budget — no Wi-Fi radio needed
                          if the device pairs to a phone/hub
                          rather than joining Wi-Fi directly)
  Display                 0.96" round or square monochrome        <1.5mm      Adafruit / DigiKey
                          OLED (SSD1306/SSD1315 class) or a
                          low-power sharp memory LCD for
                          always-on "Coffee time!"-class text
  Camera module            OV2640 / OV5640-class miniature         ~4-5mm      Mouser / DigiKey
                          camera-on-flex module — THIS IS THE
                          LINE ITEM MOST LIKELY TO VIOLATE THE
                          5mm STACK BUDGET; flagged for the v.0
                          mockup pass (Section 08) before order
  Weather/ambient sensor  Bosch BME280 or BME680 (temp/humidity/    ~1.0mm      Mouser / DigiKey
                          pressure[/VOC]) — brief item 14, "AI
                          grade off-the-shelf sensor" (item 15)
  Button                  Low-profile tactile SMD switch, "Copy"    <1.0mm      DigiKey
                          function per brief item 16
  Battery                 Ultra-thin LiPo, 1-2mm profile class      1-2mm       PCBWay battery
                          (e.g. 301230-class thin cell) — capacity                partner / DigiKey
                          traded down hard to meet stack height,
                          expect short runtime, mitigated by
                          always-on wireless charging dock
  Wireless charge receiver Qi receiver coil + IC (e.g. IDT/         ~0.5-1mm    DigiKey
                          Renesas P9221-class), thin-profile coil
  PCB                     Flex-rigid or thin rigid PCB, custom      per PCBWay  PCBWay (brief
                          outline to fit 40x40mm footprint,        stackup      item 1)
                          fabricated AND assembled (SMT) by
                          PCBWay's PCBA service
  Enclosure                Two-piece stainless steel shell, CNC     shell walls PCBWay CNC
                          or stamped, one face polished — PCBWay                machining
                          also offers CNC metal machining, which
                          keeps fab (item 1) and enclosure under
                          one vendor relationship for the pilot
                          run

  NOT YET SPECIFIED (needs S-2 decision before order):
    - Exact MCU (nRF52840 vs ESP32-C3) — depends on whether SIGNET
      pairs via a phone app (BLE, longer battery life) or joins the
      home/office Wi-Fi directly (ESP32-C3, simpler backend, worse
      battery life at this cell size).
    - Exact camera SKU and whether v.0 units are built WITH the camera
      populated (higher cost, validates the stack) or WITHOUT it
      (cheaper pilot, camera added at v1) — RECOMMEND: populate on at
      least 10 of the 100 units to validate the stack-height risk in
      Section 02, leave unpopulated on the remaining 90 to control
      pilot cost. This is a recommendation, not a decision made here.

--------------------------------------------------------------------------------
04 // MANUFACTURING — PCBWAY, 100-UNIT PILOT RUN (brief items 1, 13)
--------------------------------------------------------------------------------

  PATH
    1. PCB fabrication + SMT assembly (PCBA) — PCBWay, using the BOM
       above, quantity 100 + spares (recommend ordering 110 to cover
       reflow/test attrition).
    2. Stainless steel shell — PCBWay CNC machining service, two shell
       halves per unit, one batch polished (Face A), one batch left for
       Face B fitment (aperture cutouts for camera/screen/button).
    3. Final assembly (board into shell, battery, charge coil) — NOT
       assumed to be PCBWay-included; confirm at quote time whether
       PCBWay's assembly service extends to non-PCB mechanical
       integration, or whether final assembly is done in-house/by a
       contract assembler. This is an open cost/logistics question, not
       resolved by this document.

  COST — NOT ESTIMATED HERE
    No live pricing was reachable this session (Section 00). A per-unit
    and total-run cost table belongs in a follow-up document once a
    PCBWay quote is actually requested against the BOM above. Any number
    written here without a real quote would be exactly the kind of
    fabricated precision the benchmark doctrine prohibits (Cardinal Rule
    5, honest engineering).

  100-UNIT RATIONALE
    Matches brief item 13 directly. 100 units is a pilot run, not a
    consumer launch: sized to validate the stack-height risk (Section
    02), the wireless-charge/battery-life tradeoff, and the new
    device-auth backend path (Section 06) against real, in-hand
    hardware before committing to a larger run.

--------------------------------------------------------------------------------
05 // NOTIFICATION PATH — "COFFEE TIME!" (brief: pager-like notification)
--------------------------------------------------------------------------------

  DIRECTION: LOT-systems.com -> SIGNET (downlink)

  The brief asks for "a simple screen to show autonomous notifications ...
  from the site LOT-systems.com." The LOT backend already generates
  short autonomous text via the Quantum Intent Engine's log-block
  handlers (docs/benchmark/LOT-LEXICON.md catalogs dozens: MCL:, EVE:,
  MOM:, etc. — short triggered strings tied to behavioral patterns).
  SIGNET's downlink is the same class of signal, routed to a physical
  screen instead of (or in addition to) the in-app feed:

    QIE pattern fires (e.g. a care-pattern handler)
       -> existing handler produces short text ("Coffee time!" is
          brief's own example — maps naturally to a self-care /
          break-reminder pattern class already in the QIE corpus)
       -> NEW: a push channel to the paired SIGNET device (BLE
          notification if nRF52840, or a lightweight push/poll if
          ESP32-C3 + Wi-Fi)
       -> SIGNET firmware renders the text on the OLED/memory-LCD

  This downlink is new work: no push-to-hardware channel exists in the
  repo today. It is scoped in docs/technical/LOT-SIGNET-FIRMWARE.md
  Section 03 and docs/technical/LOT-SIGNET-SOFTWARE.md Section 02.

--------------------------------------------------------------------------------
06 // UPLINK — "COPY" BUTTON TO THE LOG TAB (brief item 16)
--------------------------------------------------------------------------------

  DIRECTION: SIGNET -> LOT-systems.com (uplink)

  VERIFIED THIS SESSION (Section 00): the Log tab and its endpoint are
  real and already load-bearing in production:

    Client:  src/client/components/ui/Layout.tsx:23,72
             route `logs`, nav label "Log"
    Server:  src/server/routes/api.ts:1563-1587
             fastify.post('/logs', ...) — mounted at POST /api/logs
             body: { text: string, event?: string, metadata?: object }
             creates a row via src/server/models/log.ts (fields:
             userId, text, event, metadata, context)

  THE GAP: that route sits behind a fastify onRequest hook
  (src/server/index.ts, ~line 315) that 401s any request without
  `req.user`, and `req.user` is populated ONLY from a cookie-based
  browser session lookup. There is no bearer-token, API-key, or
  device-pairing auth path in src/server/routes/api.ts or
  public-api.ts today. A SIGNET unit pressing "Copy" cannot call
  POST /api/logs as the backend exists right now.

  REQUIRED NEW BACKEND WORK (not covered by this document; scoped as a
  separate ENGINEERING artifact for a future benchmark session):
    1. A device-pairing flow: a user generates a long-lived device
       token from their LOT account (analogous to a personal access
       token), which SIGNET stores at provisioning time.
    2. A new auth branch in the `/api` onRequest hook (or a sibling
       `/api/device` prefix) that accepts `Authorization: Bearer
       <device-token>` and resolves it to the same `req.user` shape the
       cookie path produces, so `POST /api/logs` needs NO changes to
       accept device-originated calls once the token resolves.
    3. `event: 'signet_copy'` recommended as the event tag SIGNET writes,
       so it is filterable in the Log tab and in future QIE handlers
       without a schema change — `event` is already a free-text STRING
       column (src/server/models/log.ts).

  This is flagged as a prerequisite, not a blocker to publishing this
  plan: the BOM and manufacturing path (Sections 03-04) do not depend on
  it, but no SIGNET unit can perform its one core function (item 16)
  until it exists.

--------------------------------------------------------------------------------
07 // CAMERA — v.0 SCOPE (brief item 5)
--------------------------------------------------------------------------------

  v.0 populates the camera module on a subset of pilot units (Section 03
  recommendation: 10 of 100) to validate the physical stack, but does
  NOT wire a capture pipeline in v.0 firmware. A camera that captures
  and uploads images is a materially larger firmware/backend scope
  (image codec, transfer protocol, storage, and a privacy/consent
  review that a device with a camera on a person's desk requires before
  any capture path ships) and is explicitly deferred to a v1 document,
  named here as OPEN, not silently dropped.

--------------------------------------------------------------------------------
08 // ROADMAP
--------------------------------------------------------------------------------

  v.0a  PHYSICAL MOCKUP (no electronics)
        Cardboard/acrylic/3D-printed shell at exact 40x40x5mm, stacking
        real datasheet component thicknesses (Section 03) to confirm the
        5mm budget closes before a single part is purchased. Cheapest
        possible falsification of the riskiest assumption in this
        document.

  v.0b  BACKEND PREREQUISITE
        Device-pairing token + auth branch (Section 06) shipped as its
        own ENGINEERING benchmark session, independent of hardware
        arriving. SIGNET cannot be demoed end-to-end without this
        regardless of hardware readiness.

  v.0c  PCBWAY QUOTE + BOM LOCK
        Request an actual PCBWay quote against Section 03's BOM (PCB +
        PCBA + CNC shell), 100+10 spare units. Replace Section 04's
        "not estimated" cost gap with real numbers. This is the
        conversion point from "plan" to "purchase order."

  v.0d  FIRST 10 UNITS (camera-populated)
        Validate stack height, wireless charge, weather sensor read,
        and the Copy-button uplink (via v.0b) end to end before
        committing the remaining 90.

  v.1   Remaining 90 units, no camera by default; camera capture
        pipeline (Section 07) begins as its own document once v.0d
        proves the stack.

  v.2   Camera capture pipeline, PDF-manual pipeline (Section 09),
        firmware/software split hardens into versioned releases.

--------------------------------------------------------------------------------
09 // DOCUMENTATION SET (brief items 7, 9, 10, 11)
--------------------------------------------------------------------------------

Per the brief's explicit request for separate documents:

  docs/corporate/LOT-SIGNET-HARDWARE-v0.md   THIS DOCUMENT — plan, BOM,
                                              roadmap (hardware/product)
  docs/technical/LOT-SIGNET-FIRMWARE.md      Firmware architecture
                                              (brief item 9)
  docs/technical/LOT-SIGNET-SOFTWARE.md      Host software / LOT API
                                              connector (brief item 10)

  PDF MANUALS (brief item 7)
    Not generated this session. The repo already has a working
    markdown-to-PDF pipeline (scripts/generate-badge-codex-pdf.cjs and
    the generate_badge_pdf_v*.py family, used for docs/badges/*.pdf).
    RECOMMENDATION: once the three SIGNET documents stabilize past v.0
    (i.e. after the v.0a mockup and v.0b backend work land and the specs
    stop changing weekly), adapt that existing pipeline into
    scripts/generate-signet-manual-pdf.cjs rather than hand-building a
    new one. Generating a PDF from a spec that is still changing daily
    would produce a stale manual faster than it produces a useful one —
    deferred deliberately, not forgotten.

--------------------------------------------------------------------------------
10 // COMPRESSION NOTE (brief item 8 — "compress the information in
    each session")
--------------------------------------------------------------------------------

This document is v.0 of an ongoing series, per the same discipline the
benchmark protocol already applies to QIE/wiki sessions: each future
SIGNET session appends a NEW dated session report to docs/benchmark/
(never edits this file's history) and, once findings repeat three times,
promotes them into docs/benchmark/LOT-DOCTRINE.md as dense clauses. This
document itself stays the durable v.0 reference; it is superseded by a
v0.2/v1 document when the design changes materially, never silently
rewritten.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-SIGNET-HARDWARE-v0
================================================================================
