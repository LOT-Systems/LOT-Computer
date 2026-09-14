================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Actuated Haptic Notification Device
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-07-28
REVISED:  2026-09-14 — CYCLE 2 — component selection + firmware state machine
VERSION:  0.2 — DEVELOPMENT CONTINUED
STATUS:   v.0 — NOTIFICATION-GRADE ACTUATION (BOM DRAFTED, DESIGN LOCK PENDING)
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

  CYCLE 2 READING LOG — 2026-09-14

  Per this document's own Section 09 instruction ("Future sessions read
  this document first"), this cycle re-read LOT-CUBIQ-QUANTUM-CUBE-v0.md
  v0.1 in full before extending it, plus every source named above. No new
  LOT® Institute document exists between v0.1 (2026-07-28) and this cycle
  — the two-source corpus (LOT_QI46_ENGINE.md, CQGS-WHITE-PAPER-SNAPSHOT.md)
  remains the complete Institute record on hardware. This cycle's addition
  (Sections 06-07, below) is therefore an extension of that same corpus,
  not a new source: it converts the "class"-level component language
  already in Section 03 (voice-coil OR solenoid class, piezoelectric
  bimorph, 6-axis IMU, ToF sensor) into a locked reference selection and a
  firmware state machine, and appends the next required consumer use case
  to Section 09.

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
      deliverable. Section 08 opens the research track. No claim is made
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
06 // COMPONENT SELECTION — v.0 REFERENCE BOM
--------------------------------------------------------------------------------

Section 03 named component CLASSES (voice-coil OR solenoid, piezoelectric
bimorph, 6-axis IMU, ToF sensor). This cycle locks the reference selection
each class resolves to for the first BOM lock candidate. Every line is
sized against the mass budget in Section 02 (<120g fully assembled) —
mass, not cost, is the constraint that governs this table.

  SUBSYSTEM          CLASS                          v.0 REFERENCE TARGET
  ─────────          ─────                          ─────────────────────
  Primary actuator   Voice-coil linear actuator      8-10mm diameter,
                      (selected over solenoid for     3-5mm stroke, 1.5-2N
                      controllability + quiet          peak force, <8g
                      operation — Section 03)
  Direction bias      Piezoelectric bimorph strip,     15-20mm length,
                      angle-mounted                    5-15deg fixed mount
                                                        angle, <2g, fires
                                                        1ms post-release
  Motion sensing      6-axis IMU (accel + gyro),        MEMS package,
                      geometric center                  <2mm z-height,
                                                          400Hz+ sample rate
                                                          for landing-recovery
                                                          window (Section 03)
  Edge safety         Time-of-flight, base face,        <20mm to <2m range,
                      forward-facing                    <10ms response —
                                                         Section 03's 20mm
                                                         inhibit threshold
                                                         needs sub-hop-latency
                                                         reads, not sub-second
  Power               Wireless (Qi-class inductive)      Receiver coil sized
                      receiver coil + Li-Po cell          to base face
                                                          (Section 02); cell
                                                          capacity sized to
                                                          survive charging-pad
                                                          removal (operator
                                                          carries cube off the
                                                          "table") for a full
                                                          waking day of
                                                          gesture-class events
  Indicator           Single LED ring, base face          Pairing/charge
                                                          state only —
                                                          Section 02's
                                                          anti-feed constraint
                                                          (motion is the
                                                          language, not light)
  Compute             Low-power MCU, single die           Drives actuator
                                                          PWM, reads IMU + ToF,
                                                          runs the Section 07
                                                          state machine, holds
                                                          the BLE/Wi-Fi link
                                                          back to the Index of
                                                          Systems signal bus
  Shell               Nano-ceramic composite, matte,       Per Section 02 —
                      LOT® black                           unchanged this
                                                            cycle

  MASS LEDGER (v.0 TARGET, NOT YET MEASURED)
    Actuator + bias element      ~10g
    IMU + ToF + MCU              ~5g
    Coil + cell                  ~35g  (largest single line — v.1's <90g
                                        target (Section 08) depends on
                                        trimming this line first, not the
                                        actuator)
    Shell + feet + assembly      ~65g  (remainder of the <120g budget)
    TOTAL TARGET                 <120g — matches Section 02

  WHAT IS NOT YET LOCKED
    No vendor part numbers are named in this document. "Reference target"
    means a size/spec envelope a real component must fit, not a
    procurement decision. Vendor selection and first-article sourcing are
    a v.0 hardware-build milestone, not a documentation milestone — they
    are gated behind this BOM being reviewed and signed off by S-2.

--------------------------------------------------------------------------------
07 // FIRMWARE — GESTURE DISPATCH STATE MACHINE
--------------------------------------------------------------------------------

The MCU (Section 06) runs one state machine. It is the software expression
of the loop already drawn in Section 05 — this section specifies the
on-device half of that loop, not a new architecture.

    IDLE
      │  signal arrives on the bus (Section 05: badge unlock / memory
      │  question ready / cohort resonance ping)
      ▼
    GESTURE_ARMED
      │  map signal → gesture (Section 04 table)
      │  IF gesture requires liftoff (THE HOP, THE LEAP):
      │      poll ToF edge sensor — Section 03's 20mm inhibit check
      │      IF edge detected within threshold:
      │          SUBSTITUTE gesture → THE NUDGE-class in-place shudder
      │          (Section 03: "a physical object that leaps unattended
      │          on a desk MUST refuse to leap itself onto the floor" —
      │          this is that rule, as code, not just as a spec sentence)
      ▼
    GESTURE_EXECUTING
      │  drive actuator PWM per gesture profile (Section 04)
      │  piezoelectric bias fires 1ms post-release for THE HOP / THE LEAP
      │  IMU sampling continues through the full motion window
      ▼
    LANDING_RECOVERY
      │  read IMU tilt angle post-landing
      │  IF tilt > 25deg (Section 03 threshold):
      │      fire corrective micro-pulse from same actuator
      │      re-sample IMU, repeat once
      ▼
    TELEMETRY_EMIT
      │  package pressure/duration/cadence + tilt/recovery-count as the
      │  "haptic preference" signal (Section 05; LOT_QI46_ENGINE.md
      │  line 757) and push to the Calibration Loop
      ▼
    IDLE

  GATE FOR THIS STATE MACHINE (inherits Section 08's v.0 gate)
    500/500 simulated dispatch cycles (bench rig, not yet the physical
    actuator) with zero missed edge-inhibit substitutions and zero
    unhandled tilt-recovery cases before this firmware is eligible to
    drive a physical actuator build.

--------------------------------------------------------------------------------
08 // ROADMAP — v.0 → v.1 → v.2 → v.3
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
09 // CONSUMER USE CASES
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

  USE CASE 02 — THE SHARED TABLE                             2026-09-14
  ─────────────────────────────────────────────────────────────────
  Operator profile: Legacy tier, Archetype "Diurnal Operator" (Arch25),
  active J18 evening-close job (22:00 UTC EVE: handler), three-years-plus
  tenure, two school-age children at home. The CUBIQ charging pad sits on
  the family dinner table, not a desk — the operator's evening pattern is
  a 20-30 minute wind-down after dinner, cube present, phone left in
  another room by household rule.

  Mid-dinner, the QIE fires P79 evening-coherence-close — the pattern
  that closes the operator's DIURNAL ARC for the day. Under a phone-based
  notification model this would be a buzz face-down on a counter,
  unseen until after the meal, or worse, seen and answered mid-bite. On
  CUBIQ hardware v.0, the signal maps to THE HOP (Section 04): a single
  controlled vertical hop, <10mm rise, lands in place.

  Here the Section 07 firmware state machine's edge-inhibit path is not a
  hypothetical — it is load-bearing. The dinner table has place settings,
  a water glass, a child's hand inches from the cube. The ToF sensor
  reads the reduced clearance and the state machine substitutes the
  THE NUDGE-class shudder in place of the hop before any liftoff is
  attempted. What the family witnesses is not a leaping object near
  glassware; it is a small, contained tremor, felt by whoever's hand is
  nearest the table edge, gone before it is questioned.

  The children ask what it was. The operator explains, plainly: the
  system noticed the day's care was complete. Nothing to open, nothing to
  answer, nothing to scroll — a fact registered by a machine, made
  briefly physical, then already over. This is the LOT® Person™ data
  thesis (LOT-CUBIQ-OPERATOR.md, Section 06) made visible at the table:
  a parent modeling self-care discipline as a felt, momentary event
  rather than a screen pulled out at dinner. The robot that eventually
  trains on this operator's Index inherits not just the signal that fired,
  but the fact that the household's evening stayed a household evening —
  the anti-feed thesis holding even under the hardest social condition
  v.0 has yet been asked to perform in: shared, unpredictable, physically
  crowded space, with a child's hand near the actuator.

  This is why Section 06's edge-safety line item and Section 07's
  inhibit-substitution branch are v.0 requirements, not v.1 refinements:
  the first real household this cube sits in will not be a clear desk.

--------------------------------------------------------------------------------
10 // BRAND
--------------------------------------------------------------------------------

LOT® Quantum Cube             The object
CUBIQ™                        The experience — software and hardware,
                               one name, one system
LOT®† CUBIQ®                  The combined mark

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0
================================================================================
