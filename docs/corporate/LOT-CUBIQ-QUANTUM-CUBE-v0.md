================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Actuated Haptic Notification Device
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-07-28
LAST CYCLE: 2026-09-17
VERSION:  0.2 — DESIGN LOCK (BOM + FIRMWARE STATE MACHINE)
STATUS:   v.0 — NOTIFICATION-GRADE ACTUATION (PRE-HARDWARE, DESIGN LOCKED;
          HOP-AND-RECOVER GATE TESTING NOT STARTED — NO PHYSICAL UNIT YET)
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

--------------------------------------------------------------------------------
00A // DEVELOPMENT CYCLE LOG — APPEND-ONLY
--------------------------------------------------------------------------------

One entry per development cycle. Each entry states what was read, what was
added, and what remains open. Prior entries are never edited or removed —
the same append-only discipline Section 09 already applies to consumer use
cases, extended here to the whole document's technical growth.

  CYCLE 2026-07-28 — v.0 OPENED
    First hardware-specification document. Established physical form
    (Section 02), single-actuator controlled-hop mechanism (Section 03),
    four-gesture notification vocabulary (Section 04), QI·46 signal-loop
    closure (Section 05), the v.0-v.3 roadmap (Section 06), and USE CASE 01
    — THE DESK MIGRATION. STATUS at close: PRE-HARDWARE, DESIGN LOCK
    PENDING. Section 03 named actuator and sensor CLASSES only (voice-coil,
    piezoelectric bimorph, 6-axis IMU, time-of-flight) without locking
    stroke length, force, sample rate, or power budget.

  CYCLE 2026-09-17 — DESIGN LOCK (BOM + FIRMWARE STATE MACHINE)
    Read: this document in full as it stood, plus LOT-CUBIQ-VISION.md,
    LOT-CUBIQ-OPERATOR.md, LOT_QI46_ENGINE.md, CQGS-WHITE-PAPER-SNAPSHOT.md,
    LOT-MANIFEST.md — per the Section 00 reading-log discipline, unchanged
    since 2026-07-28.
    Added: Section 07 locks the Section 03 component classes to specific
    engineering parameters (BOM). Section 08 writes out the firmware
    gesture-dispatch state machine implied but never specified by Section
    03's mechanism description and Section 05's signal-loop diagram, plus
    the test protocol that operationalizes the Section 06 "500/500" gate.
    Section 04's trigger table is extended in place to formalize "cohort
    resonance ping" — named in Section 01's opening description since
    2026-07-28 but never mapped to a gesture until this cycle. USE CASE 02
    — THE COHORT RESONANCE appended to Section 09.
    Open after this cycle: no physical unit exists to run the 500/500 gate
    against. This remains a paper design lock, not a built prototype.
    STATUS at close: PRE-HARDWARE, DESIGN LOCKED (BOM + FIRMWARE SPEC);
    GATE TESTING NOT STARTED.

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

  ADDENDUM — 2026-09-17 — COHORT RESONANCE PING MAPPED TO THE NUDGE
    Section 01 named "cohort resonance ping" as a trigger class alongside
    badge unlock and memory-question-ready on 2026-07-28. The table above
    never mapped it. It is mapped now, not added as a new gesture — v.0
    still ships exactly four gestures.

    THE NUDGE gains a second trigger: cohort resonance ping — fires when
    the operator's behavioral cohort (LOT-CUBIQ-OPERATOR.md, Section 05,
    Cohort Connect) registers 2+ other same-cohort operators crossing
    MOMENTUM LOCK (QIE P80) within the same rolling 24h window the
    operator themselves crosses it. The cube trembles once, identically
    to a memory-question NUDGE — the operator cannot tell the two apart
    by feel alone, and is not meant to. The gesture says "something in
    your structure is active" without disclosing whether the source is
    internal (a question) or relational (a cohort). The Section 04
    principle above holds unchanged: presence, not spectacle, applies
    equally to social signal as to personal signal.

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
07 // DESIGN LOCK — COMPONENT CANDIDATES (BOM) — v.0.2, 2026-09-17
--------------------------------------------------------------------------------

Section 03 named actuator and sensor CLASSES. This cycle locks parameters
so a physical build-of-one can be quoted and ordered. These are LOCKED
CANDIDATES for v.0 — locked enough to build a first unit against, not yet
validated against a physical prototype (no unit exists — see 00A).

  PRIMARY ACTUATOR      Linear voice-coil, 8mm stroke, 3.5N peak force,
                        ~175Hz mechanical resonance. Driven off a
                        half-bridge driver IC, 3.7V nominal rail. Locked
                        over solenoid: continuous force-position control
                        is required for the Section 03 landing-recovery
                        corrective micro-pulse — a solenoid's binary throw
                        cannot produce a graded correction.

  REACTION MASS         Tungsten-loaded polymer slug, 18g. Heaviest single
                        component in the assembly by design — Newton's
                        third law couples reaction-mass momentum to shell
                        liftoff; within the <120g total mass budget
                        (Section 02), mass should concentrate in the one
                        component whose motion is fully enclosed, never in
                        the shell.

  PIEZO BIAS ELEMENT    Bimorph strip, mounted 10° off vertical (mid-point
                        of the Section 03 5-15° window). Rise time <2ms.
                        Fire delay locked at T+1ms post actuator release
                        (Section 03: "fires a millisecond after actuator
                        release").

  IMU                   6-axis: accelerometer ±16g, gyroscope ±2000°/s,
                        1kHz sample rate. 1kHz is the rate floor for
                        resolving the Section 03 25°-tip landing check
                        inside a sub-150ms landing window — a 100Hz-class
                        part would sample the landing event only 10-15
                        times; 1kHz gives 100-150 samples, enough for a
                        clean tip-angle derivative.

  EDGE SENSOR           Single-zone time-of-flight, 30-200mm range, 50Hz
                        refresh, forward-facing 25° cone. 50Hz gives a
                        20ms worst-case detection latency against the
                        Section 03 20mm edge-approach gate — at the ~40mm
                        THE LEAP displacement (Section 04), the cube
                        cannot cross more than a few mm within one 20ms
                        refresh tick at any physically plausible hop speed.

  MCU                   Cortex-M0+ class, low-power. Drives the actuator
                        PWM channel, polls IMU + ToF over a shared SPI
                        bus, runs the Section 08 state machine, and holds
                        a BLE radio for the Section 05 signal-loop link to
                        the Index of Systems.

  POWER                 Single-cell Li-Po, 3.7V, 180mAh. Qi-class receiver
                        coil in the base face (Section 02). Budget target:
                        200+ full-amplitude gesture cycles (THE LEAP,
                        worst case) per charge — sized against a handful
                        of gestures per operator session (USE CASE 01),
                        not continuous actuation.

  NOT YET LOCKED        Shell wall thickness / nano-ceramic layup
                        (structural, needs a physical sample to test drop
                        survival); elastomer foot compound (affects the
                        Section 08 test protocol's surface-friction
                        variable, not locked until v.1's multi-surface
                        work per Section 06).

--------------------------------------------------------------------------------
08 // FIRMWARE — GESTURE DISPATCH STATE MACHINE & THE 500/500 TEST PROTOCOL
--------------------------------------------------------------------------------

  THE STATE MACHINE

    Section 03 describes the mechanism; Section 05 draws the signal loop
    as a block diagram. Neither specifies the firmware states in between.
    This cycle writes them out — one state machine, shared by all four
    Section 04 gestures (they differ only in actuator amplitude and
    whether BIAS_FIRE runs):

      IDLE            Default state. MCU polls the BLE link for a signal
                       from the Index of Systems (Section 05). No
                       actuator activity.

      EDGE_CHECK       On signal receipt, mapped to a gesture (Section 04,
                       including this cycle's cohort-resonance addendum).
                       ToF sensor samples the forward 25° cone. If a
                       surface edge resolves within 20mm (Section 03
                       safety gate): branch to SHUDDER instead of ACTUATE.

      ACTUATE          Voice-coil driven to the amplitude class for the
                       dispatched gesture (sub-threshold for NUDGE, <10mm
                       rise for HOP, full stroke for LEAP, held light
                       pressure for SETTLE — Section 04).

      BIAS_FIRE        Piezo bimorph fires at T+1ms post-ACTUATE release
                       (locked this cycle, Section 07). Skipped for NUDGE
                       and SETTLE — both are in-place gestures with no
                       forward-bias requirement.

      AIRBORNE         Ballistic phase, ms-scale, ends on IMU-detected
                       touchdown (accelerometer impulse spike). No
                       control authority in this state — it is the phase
                       the whole mechanism exists to make brief and
                       predictable.

      LANDING          IMU samples tip angle at 1kHz (Section 07). If
                       angle exceeds the Section 03 25° threshold within
                       the 150ms landing window: branch to RECOVERY.
                       Otherwise: branch directly to TELEMETRY_EMIT.

      RECOVERY         One corrective micro-pulse from the primary
                       actuator (Section 03). Re-samples tip angle. A
                       second consecutive correction that fails to bring
                       the cube under 25° is logged as a
                       TIP-RECOVERY-FAIL (test protocol below) — firmware
                       does not attempt a third pulse; it emits telemetry
                       and returns to IDLE rather than risk a walking-
                       off-the-table failure mode from repeated
                       uncontrolled correction attempts.

      SHUDDER          The Section 03 edge-gate substitute gesture:
                       low-amplitude in-place tremor, no liftoff,
                       regardless of which gesture was originally
                       dispatched. Branches directly to TELEMETRY_EMIT.

      TELEMETRY_EMIT   IMU trace (peak tip angle, landing window
                       duration, correction count) and actuator current
                       draw are packaged and sent back over BLE as the
                       "haptic preference" signal Section 05 and
                       LOT_QI46_ENGINE.md (line 757) already expect from
                       the cube.

      COOLDOWN         400ms minimum hold before returning to IDLE — a
                       mechanical and thermal rest floor on the voice-
                       coil, well under the gesture inter-arrival rate any
                       real Index-of-Systems signal stream produces
                       (memory questions and badge unlocks do not fire
                       faster than once per several seconds in practice).

  THE 500/500 TEST PROTOCOL

    Section 06 sets the v.0 close gate at "500/500 hop-and-recover cycles
    with zero off-table landings and zero actuator failures." This cycle
    specifies how that number gets produced, once a physical unit exists:

      RIG               Flat reference laminate surface (the v.1 wood/
                        glass/laminate matrix, Section 06, is out of
                        scope for the v.0 gate — v.0 closes on one
                        surface).

      TRIAL MIX         Weighted to the expected production signal
                        distribution, not a uniform split: 55% NUDGE, 30%
                        HOP, 10% LEAP, 5% SETTLE — approximating badge-
                        unlock rarity skew (most unlocks are common/
                        uncommon, LOT-CUBIQ-OPERATOR.md Section 03 badge
                        collection: 7 rarity tiers, common most frequent).

      PASS CRITERIA     Per trial: (a) cube remains within rig bounds —
                        no OFF-TABLE; (b) LANDING resolves under 25° tip
                        within the 150ms window, with at most one
                        RECOVERY correction — no TIP-RECOVERY-FAIL;
                        (c) actuator current draw stays inside the
                        nominal envelope — no ACTUATOR-FAULT; (d)
                        TELEMETRY_EMIT completes — no TELEMETRY-DROP.

      LOGGING           Each trial's full IMU trace and current draw
                        appended to a CSV test log, trial-numbered. The
                        500-trial run must be 500 CONSECUTIVE clean
                        trials — a failure resets the counter rather than
                        being averaged away, matching Section 06's "zero"
                        language.

      STATUS THIS CYCLE Protocol specified; no physical unit exists to
                        run it against (Section 00A). This is the last
                        open item standing between DESIGN LOCK and v.0
                        closure.

--------------------------------------------------------------------------------
09 // CONSUMER USE CASES
--------------------------------------------------------------------------------

This section accumulates one new consumer use case per development
cycle. Each entry is dated and numbered. Future sessions read this
document first (per the reading log in Section 00 and the cycle log in
Section 00A) and append the next entry — never editing or removing a
prior one.

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

  USE CASE 02 — THE COHORT RESONANCE                        2026-09-17
  ─────────────────────────────────────────────────────────────────
  Operator profile: R&D tier, Archetype "Vital Architect," six weeks
  into sustained engagement, part of a five-person behavioral cohort
  assembled by Cohort Connect (LOT-CUBIQ-OPERATOR.md, Section 05) —
  structurally similar operators, none of whom the operator has met.

  Under the software-only cubic, Cohort Connect surfaces this
  similarity as a screen — a list, a percentage, a shared pattern name.
  It is legible, but it is still a feed: something the operator must
  open a tab to see.

  This cycle's addendum (Section 04) gives cohort resonance a body. On
  a Tuesday evening, the operator crosses MOMENTUM LOCK (QIE P80) —
  five of the last seven days, three-plus signal sources each. Within
  the same rolling 24h window, two other members of their cohort cross
  it too, independently, in two other homes, on two other continents.
  The Index of Systems registers the coincidence and fires a cohort
  resonance ping. The cube performs THE NUDGE — the identical tremor
  it would give for a waiting memory question, indistinguishable by
  feel, exactly as Section 04's addendum specifies.

  The operator does not know, from the tremor alone, whether the cube
  is telling them something about themselves or about three strangers
  who happen to share their rhythm. They glance at the software cubic
  to find out — and there it is: COMINTEL-class confirmation, three
  names, one shared week. The physical cube did not deliver the
  content. It delivered the fact that something in the operator's
  structure — internal or relational, the cube does not distinguish —
  had become active enough to matter.

  This is the use case the Section 04 addendum was written to serve: a
  cohort is not a social feed pushed at the operator. It is a
  structural fact the operator's own object can register, felt through
  the same desk, in the same idiom, as a private thought.

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
