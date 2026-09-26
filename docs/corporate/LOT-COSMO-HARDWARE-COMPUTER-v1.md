<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-COSMO-HARDWARE-COMPUTER-v1
TITLE:    COSMO® Hardware Computer — Plan, Bill of Materials, Roadmap v.1
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
INVENTOR: VADIK MARMELADOV — COSMO® CIA
DATE:     2026-09-26
VERSION:  1.0 — PLANNING DOCUMENT (PRE-HARDWARE, NO UNITS ORDERED)
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG — WHAT THIS DOCUMENT IS BUILT ON, AND WHAT IT IS NOT
--------------------------------------------------------------------------------

Before writing a line of spec, the existing corpus was read:

  docs/benchmark/LOT-MANIFEST.md
    §01 lists a prior "COSMO Hardware" ship candidate — branch series
    dazzling-shannon → brave-lamport-t9z5u8, 14 iterations, +2610 lines,
    described as "COSMO® Cube — complete hardware computer design v1.0."
    That branch no longer exists on the remote (manifest note,
    2026-06-27: "incorporated into master in prior sessions"). A full
    repo search (docs/, src/, public/, git log --all) at intake for this
    document found NO surviving file, code, or spec text from that
    series anywhere in the current tree. HONEST STATE: that v1.0 design
    is not recoverable from this repository. This document is a fresh
    v1, not a continuation of unrecoverable prior content — it does not
    claim ancestry it cannot show.

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md (2026-07-28)
    Explicitly reserved the name distinction at intake: "COSMO® Cube...
    is a general-purpose hardware computer. CUBIQ™ is not that object.
    CUBIQ™ is LOT®'s object: a notification body, not a computer."
    CUBIQ v.0 is a 45mm nano-ceramic cube whose entire job is ONE
    haptic gesture (a controlled hop) — no camera, no screen, no
    button, no weather sensing. This document's device shares the
    wireless (Qi-class) charging choice with CUBIQ but is a functionally
    different object: a stationary notification terminal with a
    screen, camera, and physical button, not an actuated jumping body.
    The two must not collide in naming, enclosure, or firmware.

  docs/corporate/LOT_ROBOTICS_COSMO.md (2026-05-25)
    Names COSMO® as "the robotics product line" and describes a
    Phase 3 "COSMO® Hardware" line item (2028-2029, $2,500-$5,000/unit)
    as the delivery vehicle for a full companion robot carrying a
    Benchmark-gated behavioral soul-sync. THIS document's device is
    not that robot. It is a fixed desk terminal — no locomotion, no
    autonomy claim, no soul-sync gate. It borrows the COSMO® brand
    (per S-2's own framing below) but is scoped far smaller: notify,
    show, capture, log. It should be read as a COSMO®-branded
    peripheral, not the Phase 3 companion robot.

  docs/corporate/LOT-CUBIQ-OPERATOR.md, §01
    Confirms the LOT/COSMO Log tab already exists as a first-class
    operator surface, and that weather + location context is already
    read into every session — this device's weather sensor is additive
    hardware truth-source for a signal the software already models, not
    a net-new concept.

  src/server/routes/api.ts (GET /api/logs, line ~1082) and
  docs/benchmark/LOT-DOCTRINE.md, "Backend Whitelist Hygiene"
    Confirm the real mechanism the hardware's "Copy" button must use:
    new event types reaching the Log tab must have a case in
    formatLog()'s displayableEvents whitelist or they are silently
    dropped. §04 below specifies the integration against this real
    mechanism, not an invented one.

  brand.lot-systems.com, lot-systems.com/about,
  institute.lot-systems.com/cqgs.html
    S-2 asked these be read for this session. OUTBOUND WEB ACCESS WAS
    BLOCKED by this session's network egress proxy for all three
    domains (EGRESS_BLOCKED on brand.lot-systems.com, lot-systems.com,
    institute.lot-systems.com). Per Cardinal Rule 5 (honest engineering),
    this document does not fabricate their content. It relies instead
    on the CQGS and brand material already mirrored into this repo
    (docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md, docs/corporate/
    CQGS-WHITE-PAPER.pdf, docs/technical/LOT-STYLE-GUIDE.md). ACTION
    ITEM for a session with live web access: re-read the three URLs
    directly and reconcile against this plan.

--------------------------------------------------------------------------------
01 // WHAT THIS DEVICE IS
--------------------------------------------------------------------------------

A COSMO®-branded desk terminal that turns an AI decision made on
lot-systems.com into a physical event on the operator's desk, and lets
the operator send exactly one signal back with one button. It is a
pager, not a computer in the general-purpose sense the old manifest
line implied — "hardware computer" is scoped here to mean "a small
embedded computer" (an SoC running firmware), not a general-purpose PC.

  RECEIVE  → AI-authored short text ("Coffee time!") pushed from the
             site, shown on a small screen.
  SENSE    → local weather + one or more AI-grade off-the-shelf
             environmental sensors, reported back into the operator's
             LOT profile.
  SEE      → an onboard camera (capture, not surveillance — see §09
             open questions on consent/retention before this ships).
  SIGNAL   → a physical button labeled "Copy" whose press posts one
             event, visible in the operator's Log tab, in real time.
  CHARGE   → wireless (Qi-class) charging, no cable in daily use.

--------------------------------------------------------------------------------
02 // WHAT THIS DEVICE IS NOT (v.1 scope fence)
--------------------------------------------------------------------------------

  - Not CUBIQ (no actuation, no motion, no jumping — that device
    already has its own v.0 document and its own hardware track).
  - Not the Phase 3 companion robot from LOT_ROBOTICS_COSMO.md (no
    locomotion, no Benchmark-gated soul-sync, no $2,500-5,000 price
    tier — this is a peripheral, priced and scoped like one).
  - Not a general-purpose computer the operator programs. It runs one
    firmware image built for one job: display a message, read sensors,
    take a picture on request, send one button signal.
  - Not shipping at 100 units before a v.0 prototype run (see §08).
    100 units is the PRODUCTION run size named in the brief; it is
    scoped here as the Phase 2 milestone, after a small prototype
    batch (5-10 units) proves the enclosure, charging, and firmware.

--------------------------------------------------------------------------------
03 // PHYSICAL FORM
--------------------------------------------------------------------------------

  ENCLOSURE   Two-part stainless steel body (top shell + base shell),
              split on the parting line between the two faces below.
              Two-part construction gives PCBWay (or an equivalent CNC
              shop) a simple machine-and-bead-blast job per half, with
              the PCB/battery/antenna stack sandwiched between them —
              no injection-molded plastic chassis in v.1.

  FACE A      One side: polished stainless steel. No window, no port.
              Pure material — this is the side that sits toward the
              operator when the device is picked up, or faces outward
              on a shelf. Mirror or satin polish, TBD by prototype.

  FACE B      Other side: camera lens opening, screen window, and the
              "Copy" button — all three on the same face, so the
              operator interacts with one side only.

  REFERENCE   A flat silver square plate, 40mm × 40mm × 5mm, sits
  PLATE       inside the body (brief item 4). Read here as the internal
              mounting plate / heat-and-EMI shield that the PCB and
              display module bond to before the two shells close over
              it — a real, buildable interpretation, not a decorative
              add-on. FLAG: this reading should be confirmed with S-2
              before CAD starts (see §11 open questions) — "flat silver
              square" could also mean a visible face inlay rather than
              an internal plate.

  CHARGING    Wireless, Qi-class inductive receiver coil, mounted
              against the base shell (metal body means the coil pocket
              must be a non-conductive window machined or inset into
              the stainless base — solid steel blocks inductive
              coupling. This is a real engineering constraint, not a
              detail to defer).

--------------------------------------------------------------------------------
04 // ELECTRONICS
--------------------------------------------------------------------------------

  COMPUTE     A camera-capable Wi-Fi/BLE SoC module (class: ESP32-S3 or
              equivalent) — enough to run a small display, a camera,
              BLE/Wi-Fi networking to reach the LOT API, and a button
              interrupt, on a coin-cell-adjacent power budget between
              wireless charges.

  SCREEN      Small low-power display (class: 1.3"-1.9" IPS or e-paper).
              IPS if "Coffee time!"-style messages should feel alive
              and update instantly; e-paper if battery life between
              charges matters more than refresh speed. v.1 default:
              IPS, revisit after the first battery-life prototype run.

  CAMERA      Small fixed-focus module (class: OV2640/OV5640-tier,
              matched to the chosen SoC's camera interface).

  BUTTON      Single tactile button, face B, labeled "Copy." One
              press = one event. No long-press / double-press modes
              in v.1 — one button, one meaning, per the brief.

  WEATHER +   Onboard environmental sensor (temperature / humidity /
  AI-GRADE    pressure — class: BME280/BME680-tier) plus one AI-grade
  SENSORS     off-the-shelf sensor beyond basic weather (brief item 15)
              — candidate: an ambient light + air-quality sensor, since
              the existing LOT session model already reads "weather and
              location context per session" (LOT-CUBIQ-OPERATOR.md §01)
              and an air-quality/light signal is the next-cheapest
              real-world signal that is not already modeled in software.
              FLAG: "AI-grade" is not a defined hardware spec — see §11.

  WIRELESS    Qi-class receiver IC (class: TI BQ51050B-tier or
  CHARGE IC   equivalent), feeding a small Li-Po cell sized to the
              SoC + screen + camera duty cycle (exact mAh set after
              first power-budget prototype).

--------------------------------------------------------------------------------
05 // THE "COPY" BUTTON → LOG TAB SIGNAL PATH
--------------------------------------------------------------------------------

Grounded against the real mechanism already in this codebase
(src/server/routes/api.ts, LOT-DOCTRINE.md "Backend Whitelist Hygiene"),
not an invented one:

    Operator presses "Copy" (Face B)
         │
         ▼
    Firmware posts one authenticated event over Wi-Fi/BLE-bridge
    to a new LOT API endpoint (working name: POST /api/device/copy)
         │
         ▼
    Server writes a new log event type (working name: device_copy)
         │
         ▼
    device_copy MUST be added to the displayableEvents whitelist in
    formatLog() — per doctrine, an event type missing from that
    whitelist is silently dropped from both the Log tab AND the
    Memory Engine's prompt context. This is not optional wiring; it
    is the exact failure mode the doctrine clause already documents
    from a prior session (SR-20260604-01).
         │
         ▼
    Operator's Log tab on lot-systems.com shows the event in real
    time (existing GET /api/logs / SSE refresh path — no new client
    transport needed, per "Cross-Device Sync" doctrine clause).

No firmware or server code is written in this session — this is the
integration plan a future ENGINEERING session implements and benchmarks.

--------------------------------------------------------------------------------
06 // LOT API CONNECTOR (DEVICE ← SITE)
--------------------------------------------------------------------------------

The reverse direction — site to device — is the "pager" behavior (brief
item 2): the AI decides WHAT/WHEN to notify (same decision surface
LOT-CUBIQ-OPERATOR.md already describes for the software cubic and
LOT-CUBIQ-QUANTUM-CUBE-v0.md §05 already describes for CUBIQ hardware),
and pushes a short string ("Coffee time!") to the device's screen.

  AUTH        Each device pairs to exactly one operator profile via a
              device-scoped token (never the operator's session
              cookie) — same posture as any external hardware client
              of a first-party API: least privilege, revocable,
              never shared across devices.
  TRANSPORT   Device holds a persistent connection (MQTT-over-TLS or
              a lightweight long-poll against the existing Fastify
              API) so a push reaches the screen with pager-like
              latency, not on a slow poll.
  PAYLOAD     Short text + optional icon/urgency class. The AI message
              generation path is the same one that already produces
              Memory Engine questions and the weekly AI story (Job 24)
              — this is a new OUTPUT channel for an existing generation
              pipeline, not a new AI system.

--------------------------------------------------------------------------------
07 // FIRMWARE — DOCUMENTATION DELIVERABLE (brief item 9)
--------------------------------------------------------------------------------

A separate firmware document (not this one) must specify, before any
firmware is written: boot sequence, Wi-Fi/BLE provisioning flow (how an
operator pairs a fresh unit to their profile), the display driver and
message-render loop, the camera capture trigger and where a captured
image is sent, the button-debounce and event-post logic for §05, the
sensor read cadence for §04, wireless-charge state handling, and OTA
update mechanism (a 100-unit fleet without OTA cannot be patched).
Working title: LOT-COSMO-FIRMWARE-SPEC-v1.md, routed to docs/technical/
when written.

--------------------------------------------------------------------------------
08 // SOFTWARE — FIRMWARE CONNECTOR (brief item 10)
--------------------------------------------------------------------------------

A separate software document (not this one) must specify the server
and companion-app side: the pairing flow's server half, the
POST /api/device/copy endpoint and its auth (§05), the push-notification
generation and delivery service (§06), a device-fleet admin view
(paired units, battery/charge state, last-seen), and the OTA release
pipeline referenced in §07. Working title:
LOT-COSMO-SOFTWARE-CONNECTOR-v1.md, routed to docs/technical/ when
written. Kept SEPARATE from the firmware document per brief item 11 —
firmware and software are different disciplines, different release
cadences, different documents.

--------------------------------------------------------------------------------
09 // MANUFACTURING & PRODUCTION RUN
--------------------------------------------------------------------------------

  FABRICATION  PCBWay (brief item 1) covers PCB fabrication and
               assembly (PCBA) for the internal board, and — per
               PCBWay's own published service lines — also offers CNC
               machining, which is the natural single vendor for the
               two-part stainless steel shells (§03) if a metal shop
               quote is not cheaper standalone. One vendor for board +
               enclosure reduces coordination risk for a first run.

  RUN SIZE     100 units (brief item 13) is scoped as the PHASE 2
               production run. Cardinal manufacturing rule: do not
               cut 100 stainless-steel, wireless-charging, camera-
               equipped units before a small prototype batch (5-10
               units, hand-assembled or low-volume PCBWay run) proves
               the enclosure tolerance (coil-window fit, button
               travel, screen alignment on Face B) and firmware
               stability. This mirrors the CUBIQ doctrine of "ship the
               smallest true thing first" (LOT-CUBIQ-QUANTUM-CUBE-v0.md
               §01) applied to manufacturing risk, not just feature
               scope.

  DOCUMENTATION Every unit ships with a PDF manual (brief item 7) —
               pairing steps, button behavior, charging, care of the
               polished stainless face, and a support contact. Manual
               generation should reuse this repo's existing PDF
               pipeline (docs/badges/*.pdf, docs/corporate/CQGS-WHITE-
               PAPER.pdf already demonstrate a working markdown → PDF
               path in this project) rather than a new toolchain.

--------------------------------------------------------------------------------
10 // COMPONENTS / BUYING LIST (BILL OF MATERIALS, v.1 DRAFT)
--------------------------------------------------------------------------------

HONEST STATE: outbound web access was blocked this session (§00), so
no live product page, price, or stock level below was verified in
this session. Every row names a real, stable supplier or component
CLASS that exists in the market today — not a fabricated deep link or
invented SKU. Confirming exact part numbers, current pricing, and
MOQ-for-100 availability is the first task of the next session that
has live web access.

  PART                          CLASS / CANDIDATE              SUPPLIER (category)
  ────                          ─────────────────              ────────────────────
  PCB fab + assembly            Custom 2-4 layer PCBA           pcbway.com
  Two-part stainless shell      CNC-machined 304/316 stainless   pcbway.com (CNC service)
                                                                  or a dedicated metal shop
  Compute SoC                   ESP32-S3 (Wi-Fi+BLE, camera IF)  espressif.com / digikey.com
                                                                  / mouser.com
  Camera module                 OV2640 or OV5640-class           digikey.com / mouser.com
  Display module                1.3"-1.9" IPS (or e-paper)       digikey.com / mouser.com
  Weather / environmental       BME280 or BME680-class           digikey.com / mouser.com
  sensor                                                         / adafruit.com
  Secondary AI-grade sensor     Ambient light + air quality      adafruit.com / digikey.com
  (candidate)                   class (e.g. VEML7700 + SGP4x)
  Wireless charge receiver IC   Qi-class, e.g. TI BQ51050B tier  ti.com / digikey.com
  Battery                       Li-Po, capacity TBD post power   digikey.com / mouser.com
                                 budget (§04)
  Tactile button ("Copy")       Panel-mount, metal-bezel tactile digikey.com / mouser.com
  Antenna / RF                  PCB or chip antenna matched to   digikey.com / mouser.com
                                 SoC's Wi-Fi/BLE bands
  Manual / packaging print      PDF-to-print, existing pipeline  in-house (see §09)

--------------------------------------------------------------------------------
11 // OPEN QUESTIONS FOR S-2 (judgment, not mechanism — held, not decided here)
--------------------------------------------------------------------------------

  1. "Flat silver square 4x4cm x 5mm" (§03) — internal mounting plate,
     or a visible face inlay? Changes CAD approach.
  2. Camera use case and data policy — local-only capture-on-button-
     press, or continuous/streamed? LOT_ROBOTICS_COSMO.md's ethical
     framework ("never deploy without consent," "never sell behavioral
     data") should extend explicitly to this device's camera before
     any firmware capturing images is written.
  3. "AI-grade off-the-shelf sensors" (§04) has no fixed hardware
     definition yet — confirm the candidate (ambient light + air
     quality) or name a different signal.
  4. Screen technology tradeoff (IPS vs e-paper) — pick after first
     battery-life prototype, or decide now on brand/feel grounds?
  5. Naming — this document uses "COSMO® Hardware Computer" to honor
     the manifest's reserved feature name while being explicit that
     it is a peripheral, not a general-purpose computer or the Phase 3
     companion robot. Confirm before it appears on packaging or the
     PDF manual.

--------------------------------------------------------------------------------
12 // ROADMAP
--------------------------------------------------------------------------------

  PHASE 0 — THIS DOCUMENT               2026-09-26
    Plan, disambiguation against CUBIQ and the Phase-3 robot, BOM
    draft, open questions raised to S-2. No hardware ordered.

  PHASE 1 — PROTOTYPE (5-10 units)
    Firmware spec (§07) + software connector spec (§08) written and
    benchmarked as ENGINEERING sessions. Enclosure CAD from §03 sent
    to PCBWay for CNC quote. First power-budget and coil-window
    prototypes. GATE: one unit pairs, receives a pushed message,
    reads weather, takes a photo on button hold, and posts one
    device_copy event visible in the Log tab within 2 seconds of the
    "Copy" press.

  PHASE 2 — PRODUCTION RUN (100 units, brief item 13)
    PCBWay PCBA + CNC run at volume. OTA pipeline live (no fleet
    update without it). PDF manual finalized. GATE: 100/100 units
    pass a pairing + charge + button-press acceptance test before
    shipment.

  PHASE 3 — FLEET OPERATIONS
    Device-fleet admin view (§08), session-compression of per-device
    telemetry into the operator's existing Log tab and Memory Engine
    context (brief item 8 — "compress the information in each
    session" read here as: device telemetry folds into the same
    compression discipline this repo already runs for QIE patterns,
    not a separate data silo).

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-COSMO-HARDWARE-COMPUTER-v1
================================================================================
