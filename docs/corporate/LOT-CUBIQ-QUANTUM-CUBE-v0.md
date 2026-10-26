================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Actuated Haptic Notification Device
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-07-28 (rev 0.2: 2026-10-26)
VERSION:  0.2 — ENERGY BUDGET + BILL OF MATERIALS + TEST PLAN
STATUS:   v.0 — NOTIFICATION-GRADE ACTUATION (PRE-HARDWARE, DESIGN LOCK PENDING)
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

REV 0.2 ADDITIONS (2026-10-26) — re-read in full before writing:
  - this document (rev 0.1), unchanged except where marked
  - docs/corporate/LOT-AMBIENT-AI-VISION.md — LOT® Station and LOT® Brush
    as QIoT™ hardware signal sources (used by Use Case 02)
  - docs/wiki/LOT-WIKI-v87.md (latest wiki) — confirms no later CUBIQ
    hardware entry exists; software CUBIQ™ lifecycle unchanged

No prior document specified jump mechanics, surface locomotion, or a
levitation roadmap. This document is that specification, v.0.

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

  USE CASE 02 — THE AIR AT THE DESK                         2026-10-26
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier with the LOT® Station (PM2.5 / CO2 /
  VOC) already in the room. Works in a small closed-door home office;
  has never once opened the air-quality widget unprompted.

  QIoT™ (LOT-AMBIENT-AI-VISION.md) fuses Station data with behavioral
  signal. At 14:10 the Station reports CO2 crossing ~1,400 ppm while the
  operator's reflection velocity has dropped for the third afternoon in
  a row. The system concludes the room, not the person, is the cause.
  A phone alert ("open a window") would be one more feed item.

  The cube instead performs THE SETTLE (Section 04), then a single
  in-place HOP, once, and nothing more. The operator has learned this
  pairing: a settle-then-hop is the room speaking. They stand, crack the
  window, sit back down. When CO2 falls under 900 ppm the cube performs
  a lone NUDGE, "resolved," and goes still. Nothing is logged by hand;
  the IMU-timed response (Section 05 telemetry) records that the
  operator reacted within 90 seconds, which calibrates how often the
  cube should speak about air at all.

  New requirement raised by this use case: gesture COMPOSITION. Two
  primitives chained (SETTLE + HOP) carry a meaning neither carries
  alone. Added as G5 in Section 10.

--------------------------------------------------------------------------------
09 // ENERGY BUDGET (REV 0.2)  — first-principles, to be bench-verified
--------------------------------------------------------------------------------

  Ideal ballistic energy E = m·g·h (losses ignored; real drivetrain
  efficiency for a voice-coil + spring reaction-mass hopper is assumed
  15-30%, UNVERIFIED — first bench task is to measure it).

    CASE                          m      rise/range   E_ideal   launch v
    THE HOP  (v.0 gate)          120 g   10 mm        11.8 mJ   0.44 m/s
    Stretch hop                  120 g   30 mm        35.3 mJ   0.77 m/s
    v.1 apex target               90 g   50 mm        44.1 mJ   0.99 m/s
    v.1 long jump (150 mm, 45°)   90 g   150 mm range ~66 mJ    1.21 m/s
    v.1 stretch (250 mm, 45°)     90 g   250 mm range ~110 mJ   1.57 m/s

  Implications:
    - At 20% efficiency the 150 mm jump needs ~330 mJ electrical per
      hop. A 400 mAh / 3.7 V cell holds ~5.3 kJ, so battery is not the
      constraint; PEAK POWER is. A 20 ms drive pulse at 330 mJ is ~16 W,
      requiring a supercapacitor or a low-ESR cell plus a boost stage.
    - The 120 g v.0 mass target is adequate for the 10 mm hop. The v.1
      long jump is only reachable if mass drops to ~90 g AND the spring
      stores energy slowly then releases it fast (latch-and-release),
      since a direct-drive voice coil of this size will not deliver it.
    - Therefore rev 0.2 changes the v.0 candidate: voice-coil for the
      NUDGE/SETTLE (fine control), spring + latch released by the coil
      for HOP/LEAP. Same single actuator envelope, one added latch.
    - Levitation (v.3) energy is continuous, not impulsive; it is a
      different budget and remains unscoped.

--------------------------------------------------------------------------------
10 // BILL OF MATERIALS, TEST PLAN, GESTURE G5 (REV 0.2)
--------------------------------------------------------------------------------

  BOM (v.0 prototype, no costs asserted — to be quoted)
    Voice-coil actuator + latch/spring stage     1
    Piezo bimorph bias strip                     1
    6-axis IMU                                   1
    ToF edge sensor (forward)                    1
    MCU with BLE, low-power                      1
    Li-poly cell ~400 mAh + supercap bank        1
    Qi-class receive coil, base                  1
    LED ring (pair/charge only)                  1
    Elastomer feet                               4
    Nano-ceramic shell, 45 mm                    1

  BENCH TEST PLAN (ordered; each must pass before the next starts)
    T1  Drivetrain efficiency: instrumented drop-test equivalent, high-
        speed video, measured rise vs. electrical input (replaces the
        15-30% assumption above).
    T2  Single hop repeatability: 100 hops, rise 10 mm +/- 2 mm.
    T3  Landing recovery: 100 forced off-axis landings (>25 deg), cube
        rights itself within two micro-pulses.
    T4  Edge gate: 100/100 approach trials, zero off-table (carried over
        from Section 03, hard gate).
    T5  Gesture legibility: 10 non-engineers must correctly rank NUDGE /
        HOP / LEAP by urgency without instruction.
    T6  500/500 closure run (Section 06 v.0 gate).

  G5 — GESTURE COMPOSITION (new)
    Gestures may be chained with a fixed 400 ms gap. Reserved v.0
    compositions: SETTLE+HOP = environmental (room) signal;
    NUDGE alone after a composition = "resolved". Compositions must be
    user-learnable in one sentence or they are cut.

  OPEN RISKS
    - Noise: a hop on a hard table is audible; may fail the "edge of
      awareness" thesis. T5 should include a sound-level reading.
    - Sleep/shared spaces: need a quiet-hours lockout in the driver.
    - Pets and children: unattended moving object; edge gate plus a
      lift-detect shutdown (IMU free-fall/grab) is mandatory.

  CHANGELOG
    0.1  2026-07-28  Initial v.0 spec, Use Case 01.
    0.2  2026-10-26  Energy budget, latch-and-release candidate, BOM,
                     bench test plan, gesture composition, Use Case 02.

--------------------------------------------------------------------------------
08 // BRAND
--------------------------------------------------------------------------------

LOT® Quantum Cube             The object
CUBIQ™                        The experience — software and hardware,
                               one name, one system
LOT®† CUBIQ®                  The combined mark

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0
================================================================================
