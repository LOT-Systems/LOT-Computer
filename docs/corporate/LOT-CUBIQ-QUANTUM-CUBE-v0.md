================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Actuated Haptic Notification Device
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-07-28
UPDATED:  2026-09-27
VERSION:  0.2 — DEVELOPMENT CYCLE 2 (CONTROL FIRMWARE + BOM)
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

No prior document specified jump mechanics, surface locomotion, or a
levitation roadmap. This document is that specification, v.0.

  CYCLE 2 ADDENDUM — 2026-09-27
    This document was re-read in full before writing a further line,
    per its own rule. Nothing in Sections 01-06 or Use Case 01 is
    edited or removed. Cycle 2 adds Section 07 (control firmware, BOM
    shortlist, validation rig — the engineering layer the 500/500 gate
    in Section 06 needs to actually be run) and Use Case 02 (Section 08).
    No other LOT® Institute document changed since Cycle 1 introduces
    new constraints on this spec.

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
07 // V.0 DEVELOPMENT LOG — CONTROL FIRMWARE, BOM, VALIDATION RIG
--------------------------------------------------------------------------------

Sections 01-06 lock the mechanical/electronic architecture and the
gesture vocabulary. This section opens the layer beneath the 500/500
gate named in Section 06: the firmware that turns a QI·46 signal into
an actuator command, the components that firmware runs on, and the
rig that proves it. Nothing here changes the v.0 boundary in Section 01
— it makes that boundary buildable.

  07.1 — GESTURE DISPATCHER (FIRMWARE STATE MACHINE)

    A single MCU-resident dispatcher sits between the signal channel in
    Section 05 and the actuator driver in Section 03. It is the only
    component that knows the mapping in Section 04's gesture table —
    every other layer just moves current.

      STATE: IDLE
        Listens on the paired-device signal channel for a QI·46 event
        class (badge_unlock, memory_question_ready, cohort_resonance,
        assembly_phase_advance). On receipt, looks up the Section 04
        gesture row and transitions to ARMED.

      STATE: ARMED
        Reads the ToF edge sensor (Section 03, Safety) once. Clear ->
        transition to FIRE with the looked-up gesture's actuator profile
        (pulse amplitude, duration, piezo-bias angle). Edge detected
        within 20mm -> downgrade profile to the "in-place shudder"
        substitute and transition to FIRE anyway — the dispatcher never
        silently drops a signal, it always de-escalates one.

      STATE: FIRE
        Drives the voice-coil actuator per the armed profile. THE LEAP
        and THE HOP additionally schedule the piezo-bimorph bias pulse
        at t+1ms per Section 03. Transitions to RECOVER unconditionally
        — a fire event without a recovery check is a firmware defect,
        not an edge case.

      STATE: RECOVER
        Reads the 6-axis IMU for 300ms post-fire. Tilt >25° -> issues
        one corrective micro-pulse (Section 03, Landing Recovery) and
        re-reads. Two failed recoveries in a row -> transitions to FAULT
        rather than retrying indefinitely (a cube that keeps kicking
        itself upright and failing is a cube grinding its actuator to
        failure, unattended).

      STATE: FAULT
        Actuator inhibited. LED ring (Section 02) shifts to a fault
        pattern — the one case where the notification language in
        Section 04 is allowed to borrow the light channel, because a
        faulted cube must be diagnosable without teardown. Returns to
        IDLE only on a paired-device reset command.

    Every FIRE and RECOVER transition emits the IMU + timing telemetry
    packet that Section 05 already promises back to the Calibration
    Loop as the "haptic preference" signal (pressure, duration, cadence).
    The dispatcher is therefore the single point that both consumes and
    produces the loop Section 05 draws — it is not a new subsystem, it
    is the missing implementation of one already specified.

  07.2 — BOM SHORTLIST (v.0 REFERENCE BUILD)

    Component-class decisions only — this is a shortlist for the
    engineering team evaluating suppliers, not a purchase order. Every
    class name here already appears in Section 02/03 or the Institute
    corpus named in Section 00; no new material science is introduced.

      ROLE                CLASS                       v.0 CONSTRAINT
      ────                ─────                       ──────────────
      Vertical actuator   Voice-coil linear actuator   Stroke ≥6mm,
                                                        peak force sized
                                                        to <120g shell
                                                        (Section 02)
      Directional bias    Piezoelectric bimorph strip  5-15° bias per
                                                        Section 03; fires
                                                        at t+1ms post-
                                                        release
      Attitude sensing    6-axis IMU (accel+gyro)      Center-mounted,
                                                        ≥100Hz sample
                                                        rate for the
                                                        300ms RECOVER
                                                        window (07.1)
      Edge safety         Time-of-flight sensor        Forward-facing,
                                                        v.0; multi-
                                                        directional cone
                                                        deferred to v.2
                                                        (Section 06)
      Control             Low-power MCU                Runs 07.1 whole
                                                        state machine;
                                                        BLE/Matter radio
                                                        for the paired-
                                                        device signal
                                                        channel
      Power               Wireless (Qi-class) receiver Charging pad IS
                          + small buffer cell           the table per
                                                        Section 02 — no
                                                        user-facing
                                                        battery swap in
                                                        v.0
      Shell               Nano-ceramic composite       Matte, LOT® black
                                                        (Section 02,
                                                        Institute-named
                                                        material line)

  07.3 — VALIDATION RIG (FOR THE SECTION 06 500/500 GATE)

    The v.0 gate reads "500/500 hop-and-recover cycles with zero
    off-table landings and zero actuator failures." That number is not
    met by hand-testing. The rig:

      - Flat reference surface, 600mm × 600mm, matte laminate (the
        Section 06 v.1 gate's three-surface test starts here with one).
      - Overhead camera at 1080p/120fps for displacement measurement
        against the Section 01 40mm radius spec.
      - Automated signal injector replaying the four Section 04 QI·46
        event classes at randomized intervals, so the rig exercises
        the dispatcher's IDLE→ARMED→FIRE→RECOVER path the same way a
        live operator's Index of Systems would, not a scripted demo
        loop.
      - Edge-approach fixture: reference surface mounted on a jig that
        can present a physical table edge at a programmable distance,
        for the 100/100 edge-approach trial named in Section 03.
      - Every cycle logs the same telemetry packet 07.1 defines for
        production units — the rig is the first consumer of the
        Section 05 telemetry format, which is the cheapest possible way
        to prove that format is sufficient before it ships inside a
        physical product.

    GATE STATUS: rig specified, not yet built. 0/500 cycles run. This
    is the honest state of v.0 as of this cycle — Sections 01-06 are a
    locked design; 07.1-07.3 are the first pass at making that design
    buildable and testable. No cycle count is claimed until the rig
    exists.

--------------------------------------------------------------------------------
08 // CONSUMER USE CASES
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

  USE CASE 02 — THE SHARED DESK                              2026-09-27
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, Archetype "Momentum Architect,"
  cohabiting household — two Index of Systems accounts, two CUBIQ
  charging pads on the same physical desk (a couple who each run their
  own operator record but share a workspace, a scenario the
  single-operator framing in Use Case 01 does not cover).

  Both cubes sit on the same desk surface, each paired to its own
  operator's Index of Systems over the Section 07.1 signal channel.
  Operator A's Quantum Intent Engine fires a cohort_resonance event —
  their behavioral cohort (LOT-CUBIQ-OPERATOR.md, Section 05, COHORT
  CONNECT) has just crossed a shared-pattern threshold with Operator
  B's cohort, something neither partner asked to be told and neither
  a screen notification nor a shared calendar entry would represent
  cleanly.

  Operator A's cube performs THE HOP (Section 04) — <10mm rise, lands
  in place. Because the gesture dispatcher (Section 07.1) reads only
  its own paired signal channel, Operator B's cube does not move; there
  is no cross-talk between the two Index of Systems, and no operator's
  cube ever performs a gesture sourced from another operator's private
  signal record. Operator B, seated at the same desk, feels the second
  cube's tremor through the shared desk surface (the same wood-grain
  transmission Use Case 01 describes) without seeing which cube moved
  or receiving the underlying signal themselves — presence is legible
  across the desk, the private signal is not.

  Operator A glances over, recognizes their own cube moved, opens the
  cubic, and the resonance detail resolves inside their own private
  session. Operator B never learns the specific cohort event — only
  that the desk, as a shared physical field, registered a moment for
  their partner. This is the case the Section 07.2 BOM's per-unit MCU
  and paired-radio decision was made to support without extra hardware:
  two independently addressed cubes, one shared table, zero shared
  data — the multi-operator household is a v.0 configuration, not a
  future one, because nothing in Sections 01-07 assumed a desk has
  only one cube on it.

--------------------------------------------------------------------------------
09 // BRAND
--------------------------------------------------------------------------------

LOT® Quantum Cube             The object
CUBIQ™                        The experience — software and hardware,
                               one name, one system
LOT®† CUBIQ®                  The combined mark

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0
================================================================================
