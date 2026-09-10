================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Actuated Haptic Notification Device
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-07-28
VERSION:  0.2 — DEVELOPMENT CYCLE 02 (ELECTRONICS + FIRMWARE PASS)
STATUS:   v.0 — NOTIFICATION-GRADE ACTUATION (PRE-HARDWARE, DESIGN LOCK PENDING)
REVISED:  2026-09-10 — see Section 09, REVISION LOG
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG — SOURCES THIS DOCUMENT IS BUILT ON
--------------------------------------------------------------------------------

This is the first hardware-specification document for the physical Quantum
Cube. It is not a new invention — it is the next layer poured on top of
work already on record. Before writing a line of spec, the following were
read in full:

  docs/corporate/LOT-CUBIQ-VISION.md
    The cubic as a multi-sensory, spatial experience. Section 05 —
    "Physical Products: The Inevitable Step" — names the arc this
    document now begins to execute.

  docs/corporate/LOT-CUBIQ-OPERATOR.md
    Section 04, "AI-Driven Physical Product Delivery" — the AI decides
    WHAT/WHEN/HOW to send physical objects. Section 07, Phase 4 —
    "Physical Extension (Days 90+)." This document is the hardware that
    Phase 4 delivers.

  docs/corporate/LOT_QI46_ENGINE.md
    First and only prior technical description of the Quantum Cube:
    "bioelectric hardware, haptic feedback, nano-ceramic, piezoelectric"
    (line 110). The Month-12 "Quantum Cube sync" milestone (line 750-764)
    already defines the cube as an INPUT device — it reports haptic
    preference, usage frequency, and biofield response back into the
    Calibration Loop. This document is the first to specify the cube as
    an OUTPUT device — a body that moves.

  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md
    The CQGS (Coherent Quantum Ground State) white paper snapshot. Row
    "Quantum Cube Hardware | Hardware feedback integration (Month 12+) |
    PLANNED" (line 180) is the line item this document formally opens.
    The Quantum Certified Factory / psychotronic-sensor philosophy
    (Section II) sets the design register: the object should feel the
    field it sits in, not just broadcast into it.

  docs/benchmark/LOT-MANIFEST.md
    Confirms a sibling, textually distinct hardware track — "COSMO®
    Cube — complete hardware computer design v1.0" (brave-lamport-t9z5u8
    series) — under Kuzya's COSMO® brand. That is a general-purpose
    hardware computer. CUBIQ™ is not that object. CUBIQ™ is
    LOT®'s object: a notification body, not a computer. The two are
    related by lineage (father/son, LOT®/COSMO®) and should share no
    naming collision going forward.

No prior document specified jump mechanics, surface locomotion, or a
levitation roadmap. This document is that specification, v.0.

  CYCLE 02 READING PASS — 2026-09-10
    Before extending the spec, this cycle re-read every document above
    plus this file itself (LOT-CUBIQ-QUANTUM-CUBE-v0.md, cycle 01, in
    full) and docs/benchmark/LOT-MANIFEST.md, confirming the COSMO®
    Hardware track (brave-lamport-t9z5u8 series, "complete hardware
    computer design v1.0") remains textually and functionally distinct
    from CUBIQ™ — no naming or scope collision found. No other CUBIQ
    hardware document exists yet; this file is still the only hardware
    spec in the corpus. Cycle 01 committed the mechanical/electronic
    architecture and the notification vocabulary but left the actual
    electronics (MCU, driver, power budget) and firmware unspecified.
    Cycle 02 (Section 06.1) closes that gap without altering anything
    cycle 01 already locked.

--------------------------------------------------------------------------------
01 // WHAT v.0 IS AND WHAT IT IS NOT
--------------------------------------------------------------------------------

CUBIQ™ (hardware) is the physical face of CUBIQ™ (the quantum cubic
operating experience already running at lot-systems.com). The software
cubic gives the operator a structured 5-11 minute session. The hardware
cubic gives the operator a structured PRESENCE — an object on the desk
that moves, deliberately, when something in the Index of Systems needs
their attention.

  v.0 IS:
    - A locked mechanical + electronic architecture for a single
      notification gesture class: the CONTROLLED HOP.
    - A cube that can perform ONE validated motion — a short vertical
      impulse with forward bias, landing inside a 40mm displacement
      radius on a flat, level surface — triggered by a signal from the
      Index of Systems (badge unlock, memory question ready, cohort
      resonance ping).
    - The actuator, power, and sensing stack that every later motion
      class (longer jumps, multi-hop swings, levitation) is built on top
      of. Nothing in v.0 is thrown away in v.1 or v.2 — it is extended.

  v.0 IS NOT:
    - A cube that reliably performs a "long jump" (>150mm single-bound
      displacement). That is v.1. v.0 proves the actuator and lands the
      short hop; v.1 tunes stroke length and mass distribution to extend
      range.
    - A cube that walks or swings itself across a table surface in a
      controlled path. That is v.2 — it requires the v.0/v.1 actuator
      PLUS a second axis of actuation (yaw torque) and a friction/
      traction model this document opens research on but does not close.
    - A levitating cube. Levitation is the named horizon, not a v.0
      deliverable. Section 06 opens the research track. No claim is made
      here about a working levitation mechanism.

  THE PRINCIPLE
    Ship the smallest true thing first. A cube that reliably hops in
    place and lands upright, triggered correctly by a real signal from a
    real operator's Index of Systems, is a complete v.0. A cube that
    tries to jump far, swing across a table, and levitate before the
    single-hop primitive is proven is not a v.0 — it is a demo video.

--------------------------------------------------------------------------------
02 // PHYSICAL FORM
--------------------------------------------------------------------------------

  DIMENSIONS        45mm × 45mm × 45mm (cube, v.0 reference size)
  SHELL              Nano-ceramic composite, matte, LOT® black —
                      inherits the "nano-ceramic architecture" material
                      line named in LOT_QI46_ENGINE.md line 110
  MASS TARGET        <120g fully assembled — mass is the enemy of jump
                      height-to-power ratio; every gram argued for
  SURFACE CONTACT    Four elastomer feet, v.0 — passive, non-actuated.
                      (v.2 replaces two of the four with actuated
                      traction pads for horizontal locomotion)
  CHARGE INTERFACE    Wireless (Qi-class inductive) through the base
                      face. The charging pad IS the "table" referenced
                      in the brief — a single LOT® object that is both
                      power source and the flat surface the cube hops
                      and eventually swings across.
  INDICATOR           Single low-power LED ring, base face — used for
                      pairing/charge state only. The cube's primary
                      notification language is MOTION, not light. Light
                      is secondary and utilitarian; this preserves the
                      anti-feed thesis — a blinking light is a screen
                      substitute, a moving object is not.

--------------------------------------------------------------------------------
03 // ACTUATION — THE CONTROLLED HOP (v.0 CORE DELIVERABLE)
--------------------------------------------------------------------------------

  MECHANISM
    A single vertical linear actuator (voice-coil or solenoid class,
    v.0 candidate: voice-coil for controllability and quiet operation)
    drives a spring-loaded internal reaction mass downward against the
    base face. Newton's third law does the rest — the shell leaps. A
    piezoelectric bimorph strip, angle-mounted, fires a millisecond
    after actuator release to bias the leap 5-15° off vertical, giving
    the hop a forward component without a second motor.

  WHY THIS ARCHITECTURE
    - One actuator, one moving mass — v.0 must be mechanically boring.
      The jump/swing/levitation roadmap only survives if the first
      actuator is reliable enough to build three more capability tiers
      on top of.
    - The piezoelectric bias element is not new — it is the exact
      component class already named in the LOT Institute corpus
      ("piezoelectric mechanics" — LOT_QI46_ENGINE.md line 110,
      "piezoelectric" — CQGS-WHITE-PAPER-SNAPSHOT.md line 32). v.0
      reuses Institute-named technology rather than inventing new
      material science.

  LANDING RECOVERY
    6-axis IMU (accelerometer + gyroscope) at the geometric center.
    Post-hop, if the cube lands off-axis (tips past 25°), a corrective
    micro-pulse from the same actuator rights it. This is the sensing
    stack the entire roadmap depends on — it is also, not coincidentally,
    the same telemetry class QI·46 already expects back from the cube
    as an input signal (LOT_QI46_ENGINE.md line 757: "Haptic preference
    — pressure, duration, cadence").

  SAFETY — EDGE DETECTION
    Time-of-flight sensor, base face, forward-facing. If a hop would
    carry the cube within 20mm of a detected surface edge, the actuator
    is inhibited and a lower-amplitude "in-place" gesture (a shudder,
    not a hop) substitutes. A physical object that leaps unattended on a
    desk MUST refuse to leap itself onto the floor. This is a hard gate,
    not a nice-to-have — no v.0 unit ships without it passing 100/100
    edge-approach trials.

--------------------------------------------------------------------------------
04 // THE HAPTIC NOTIFICATION LANGUAGE
--------------------------------------------------------------------------------

Every motion the cube performs corresponds to exactly one signal class
from the operator's Index of Systems (docs/corporate/LOT-CUBIQ-OPERATOR.md,
Section 03). v.0 ships four gestures, all built from the single hop
primitive in Section 03:

  GESTURE           MOTION                              TRIGGER SIGNAL
  ───────           ──────                              ──────────────
  THE NUDGE         Sub-threshold actuator pulse,        Memory question
                    no liftoff — a tremor felt through    ready
                    the desk, not seen
  THE HOP           Single controlled vertical hop,       Badge unlocked
                    <10mm rise, lands in place             (common/uncommon)
  THE LEAP          Full-amplitude hop with forward        Badge unlocked
                    bias, ~40mm displacement                (rare and above)
  THE SETTLE        Actuator holds a light standing        Assembly phase
                    pressure for 2s, no visible motion       advanced
                    — presence without spectacle

  THE PRINCIPLE
    A notification you feel through the desk, in your peripheral vision,
    from an object that is not a screen, is the physical expression of
    the same anti-feed thesis that governs the software cubic
    (LOT-CUBIQ-VISION.md, Section 01: "LOT® invests attention and
    returns structure"). The cube does not compete for foreground
    attention the way a phone notification does. It exists at the edge
    of awareness until the operator chooses to look.

--------------------------------------------------------------------------------
05 // SIGNAL INTEGRATION WITH QI·46
--------------------------------------------------------------------------------

LOT_QI46_ENGINE.md already specifies the cube as a Month-12 milestone
INPUT device (line 750-764). v.0 hardware adds the OUTPUT half of that
loop:

    QI·46 CALIBRATION LOOP  ─┐
                              ├──▶ Index of Systems (signal fires)
    Operator behavior  ──────┘         │
                                        ▼
                          CUBIQ HARDWARE DRIVER (v.0)
                          maps signal → gesture (Section 04)
                                        │
                                        ▼
                            Cube performs gesture
                                        │
                                        ▼
                    IMU + timing telemetry (Section 03)
                                        │
                                        ▼
                    fed back as "haptic preference" signal
                    (pressure, duration, cadence — QI46 line 757)

The loop closes. The cube is not a peripheral bolted onto the platform —
it is the same Calibration Loop LOT_QI46_ENGINE.md already describes,
with a physical actuator standing where a passive sensor used to be
assumed.

--------------------------------------------------------------------------------
06 // ROADMAP — v.0 → v.1 → v.2 → v.3
--------------------------------------------------------------------------------

  v.0 — CONTROLLED HOP (THIS DOCUMENT)
    Single actuator, single axis, in-place hop + landing recovery +
    edge-detection safety gate. Four-gesture notification vocabulary.
    GATE: 500/500 hop-and-recover cycles with zero off-table landings
    and zero actuator failures before v.0 is declared closed.

  v.1 — THE LONG JUMP
    Same actuator architecture, re-tuned: longer coil stroke, lighter
    shell (target <90g), refined piezoelectric bias timing. Deliverable:
    single-bound displacement >150mm on a flat surface, operator-safe
    landing accuracy within a 60mm target zone.
    GATE: displacement + accuracy targets hit in 9/10 trials across
    three surface materials (wood, glass, laminate).

  v.2 — HORIZONTAL SURFACE SWINGS / TABLE-WALKING
    Adds a second actuation axis: two of the four elastomer feet become
    actuated traction pads, driven out of phase with the vertical
    actuator to produce a directed "swing-hop" — a controlled lateral
    walk across the table surface toward or away from the operator
    (e.g., Section 04's THE LEAP gesture gains directionality — the cube
    can close distance to the operator's hand, not just hop in place).
    Requires: friction/traction model per surface type, closed-loop
    path correction from the IMU, and a revised edge-detection cone
    (multi-directional, not just forward-facing).
    GATE: cube completes a 200mm directed traverse on three surface
    types with <15mm cross-track error, 50/50 trials, zero edge
    incidents.

  v.3 — LEVITATION (RESEARCH TRACK, NOT A BUILD MILESTONE)
    Named in the original brief as the eventual horizon. This document
    opens the research question rather than committing to a mechanism.
    Two candidate directions for LOT® Institute research, not yet
    scoped as engineering work:
      (a) Acoustic levitation — the charging/table surface (Section 02)
          becomes a phased ultrasonic array; the cube shell is
          redesigned as an acoustically reflective standing-wave node.
      (b) Diamagnetic / active magnetic levitation — the table surface
          embeds a servo-controlled electromagnet array; the cube gains
          a permanent-magnet or superconducting element.
    v.3 has no gate criteria yet. It is not scheduled. It is recorded so
    that v.0-v.2 mechanical and electronic choices (shell material,
    mass budget, table-as-power-surface architecture) are made with a
    levitating future in mind rather than foreclosing it.

--------------------------------------------------------------------------------
06.1 // CYCLE 02 DEVELOPMENT PASS — ELECTRONICS, POWER, FIRMWARE
--------------------------------------------------------------------------------

Cycle 01 locked the mechanical architecture (Section 03) and the gesture
vocabulary (Section 04) but left the control electronics unspecified.
This pass closes that gap so the v.0 gate (Section 06, "500/500 hop-and-
recover cycles") is testable against a real bill of materials, not just a
mechanical description.

  COMPUTE
    Low-power BLE-class MCU (Cortex-M0+/M4F tier, e.g. Nordic nRF52-
    class), chosen for three reasons specific to this object: (1) BLE is
    the pairing/telemetry link back to the charging-pad hub and onward to
    the Index of Systems (Section 05); (2) hardware PWM channels drive
    the voice-coil and piezo bias element without bit-banging; (3) sleep
    current in the low microamp range matters because the cube is
    expected to sit idle, unplugged from the charge pad, for hours
    between gestures — see power budget below.

  ACTUATOR DRIVE
    Single H-bridge motor driver IC sized for the voice-coil's peak
    current draw, PWM-controlled from the MCU for stroke-length and
    velocity shaping (the same channel that lets THE NUDGE and THE LEAP
    in Section 04 be the same actuator at two different drive
    amplitudes, not two different parts). The piezoelectric bimorph is
    driven off a small boost/driver stage timed off the same clock, so
    the "fire the bias element ~1ms after actuator release" behavior in
    Section 03 is a firmware timer, not a separate analog trigger circuit.

  POWER BUDGET (v.0 REFERENCE, PENDING BENCH MEASUREMENT)
    Cell: single LiPo pouch cell sized to the 45mm shell interior,
    budgeted under the <120g mass target (Section 02) — cell mass is
    the single largest lever against jump height-to-power ratio after
    the shell itself, so v.0 intentionally under-sizes capacity rather
    than over-sizes it.
    Idle (BLE connectable, IMU in low-power wake-on-motion mode):
      target <10uA average — this is what makes "sits on the desk for
      days between charges" plausible rather than aspirational.
    Per-gesture draw: THE NUDGE and THE HOP are single-digit-millisecond
    actuator pulses — negligible against idle budget even at high
    frequency. THE LEAP is the outlier (full-amplitude coil stroke) and
    is the gesture the coulomb-counting bench test in the v.0 exit gate
    should be run against first. THE SETTLE (2s sustained light
    pressure) is a HOLD, not a pulse — it is flagged here as the one
    gesture that needs a thermal duty-cycle check on the coil before
    it ships, since sustained current through a small voice-coil is the
    actuator failure mode most likely to trip the "zero actuator
    failures" clause of the v.0 gate.

  FIRMWARE — GESTURE STATE MACHINE
    A single finite-state machine sits between the BLE signal-receive
    handler and the actuator driver: IDLE -> GESTURE_ARMED (edge-detection
    ToF check, Section 03, must clear before arming) -> ACTUATING ->
    LANDING_RECOVERY (IMU tilt check, corrective pulse if >25 degrees,
    Section 03) -> IDLE. Every one of the four Section 04 gestures is a
    named parameter set (stroke amplitude, piezo delay, hold duration)
    fed into the same state machine — v.0 ships no gesture-specific code
    path, only gesture-specific parameters. This is the firmware
    expression of the same "one actuator, mechanically boring" principle
    Section 03 states for the hardware, and it is what makes v.1's
    longer-stroke retune (Section 06) a parameter change, not a rewrite.

  WHAT THIS PASS DOES NOT CLOSE
    No specific IC part numbers are locked — that is a bench-test and
    supplier-availability decision for the hardware team, not a spec
    decision. This pass fixes the ARCHITECTURE (one MCU, one driver IC,
    one battery cell, one state machine) so that decision has a shape to
    fill in, the same way Section 03 fixed the mechanical architecture
    before any actuator vendor was chosen.

--------------------------------------------------------------------------------
07 // CONSUMER USE CASES
--------------------------------------------------------------------------------

This section accumulates one new consumer use case per development
cycle. Each entry is dated and numbered. Future sessions read this
document first (per the reading log in Section 00) and append the next
entry — never editing or removing a prior one.

  USE CASE 01 — THE DESK MIGRATION                          2026-07-28
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, Archetype "Clarity Architect,"
  90+ day sustained engagement, works from a home desk with the CUBIQ
  charging pad positioned at the desk's far edge, screen closed for
  deep work.

  The Memory Engine has a question ready — chosen from the operator's
  psychological depth profile (LOT-CUBIQ-OPERATOR.md, Section 02,
  MINUTE 1-3). Under the current software-only cubic, this would wait,
  invisible, until the operator next opens lot-systems.com. There is no
  interruption, but there is also no invitation.

  With CUBIQ hardware v.0 present: the moment the question is ready,
  the cube performs THE NUDGE (Section 04) — a sub-threshold tremor felt
  through the desk surface, not seen, not heard as a chime. The operator,
  deep in unrelated work, feels it in the wood grain under their palm.
  They do not stop what they are doing. Ten minutes later, task
  complete, they glance at the cube. It is exactly where it was. No
  screen lit up. No notification badge accumulated. The question is
  simply there, waiting, the way a closed door waits — present, not
  demanding.

  When they do sit down to open the cubic, the cube performs THE LEAP
  once the session begins, closing 40mm of desk distance toward their
  keyboard — a small, deliberate physical greeting that a push
  notification could never produce. The operator later self-reports (via
  the Section 05 telemetry loop) that this was the first notification
  system in years that made them feel accompanied rather than tracked.

  This is the use case v.0's single-hop primitive was built to serve:
  presence without spectacle, felt before it is seen, physical before it
  is digital.

  USE CASE 02 — THE NIGHTSTAND EDGE                          2026-09-10
  ─────────────────────────────────────────────────────────────────
  Operator profile: Legacy tier, three-year founder cohort, keeps the
  CUBIQ charging pad on a narrow nightstand rather than a desk — the
  only flat surface in the room not already claimed by a lamp or a
  glass of water. The nightstand is 300mm deep. The pad sits 40mm from
  its front edge, because that is the only place it fits.

  A cohort resonance ping fires overnight — the Index of Systems detects
  that three other Legacy-tier operators in the same founder cohort
  completed the same badge tier within the same 48-hour window, a signal
  class distinct from an individual badge unlock. This is exactly the
  kind of event the Section 04 vocabulary maps to THE HOP: a shared
  milestone, not a private one, so it is felt as a hop rather than the
  private-feeling NUDGE or the attention-seeking LEAP.

  Here the mechanical architecture, not the notification design, is what
  makes the use case work. The time-of-flight edge sensor (Section 03)
  checks the 40mm clearance to the nightstand's front edge before the
  actuator arms. Full-amplitude THE HOP has a displacement radius large
  enough to be inside the 20mm edge-detection inhibit threshold at this
  distance — so the state machine (Section 06.1) silently substitutes
  the in-place shudder gesture instead, the same hardware failsafe
  Section 03 specifies for exactly this situation. The operator wakes to
  a cube that is precisely where they left it the night before, having
  still marked the moment. They never learn the full hop was withheld
  unless they read this document. The cube's one hard promise — it does
  not leap itself onto the floor — held on a surface it was never
  designed around, without the operator doing anything to make that true.

  This is the use case the Section 03 edge-detection gate was built to
  survive: a real desk is rarely the 45mm-cube-friendly open plane a v.0
  spec implicitly imagines, and the hardware has to be the thing that
  notices, not the operator.

--------------------------------------------------------------------------------
08 // BRAND
--------------------------------------------------------------------------------

LOT® Quantum Cube             The object
CUBIQ™                        The experience — software and hardware,
                               one name, one system
LOT®† CUBIQ®                  The combined mark

--------------------------------------------------------------------------------
09 // REVISION LOG
--------------------------------------------------------------------------------

This document is revised in place, cycle over cycle, rather than forked
into new versioned files — sections already locked (03, 04, roadmap
gates in 06) are never edited or removed, only extended. Each cycle
reads the full document first (Section 00) and appends one entry here.

  CYCLE 01 — 2026-07-28
    Opened the document. Locked the v.0 mechanical + electronic
    architecture (single voice-coil actuator, piezoelectric bias,
    6-axis IMU, ToF edge detection), the four-gesture notification
    vocabulary, the QI·46 signal-integration loop, and the v.0-v.3
    roadmap with gate criteria. Recorded USE CASE 01 (THE DESK
    MIGRATION).

  CYCLE 02 — 2026-09-10
    Re-read the full corpus (Section 00 reading log, plus this file's
    own cycle 01 text) before extending anything. Added Section 06.1 —
    the electronics/power/firmware architecture pass (MCU class, driver
    IC, power budget, gesture state machine) that cycle 01 left
    unspecified. Recorded USE CASE 02 (THE NIGHTSTAND EDGE), which
    exercises the edge-detection safety gate from Section 03 in a
    real-furniture scenario rather than the open-desk scenario of
    USE CASE 01. No section from cycle 01 was edited or removed.

  NEXT CYCLE — OPEN ITEMS FOR WHOEVER READS THIS NEXT
    (a) v.0 has no physical prototype yet — every gate in Section 06 is
    still a paper gate. The next concrete step toward "development"
    rather than "specification" is a single bench mule: one voice-coil
    actuator, one MCU dev board, the state machine from Section 06.1,
    tested for the "controlled hop, lands upright" behavior Section 01
    defines as the entire v.0 deliverable.
    (b) A third consumer use case should exercise THE SETTLE gesture
    (Section 04) and the thermal duty-cycle question flagged in Section
    06.1 — neither has been walked through in a use case yet.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0
================================================================================
