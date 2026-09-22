================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Actuated Haptic Notification Device
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-07-28
VERSION:  0.2 — DEVELOPMENT CYCLE 2 (DESIGN LOCK CLOSED, v.1 BRIEF OPENED)
STATUS:   v.0 — NOTIFICATION-GRADE ACTUATION (DESIGN LOCKED, BOM SPECIFIED)
UPDATED:  2026-09-22 — see Section 00b, Section 09, Section 10, Use Case 02
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
00b // READING LOG — CYCLE 2 (2026-09-22)
--------------------------------------------------------------------------------

Second development pass on this document, per its own instruction in
Section 07 ("future sessions read this document first and append the next
entry"). Re-read in full before writing a line of new spec:

  This document, LOT-CUBIQ-QUANTUM-CUBE-v0.md, in its entirety (v.0.1,
  2026-07-28) — no prior section is edited or removed; this cycle only
  appends Section 00b, Section 09, Section 10, and Use Case 02 below.

  docs/corporate/LOT-CUBIQ-VISION.md, Section 05 — confirms the physical
  arc ("digital cubic extends into the physical") is still the operative
  thesis; nothing in the two months since v.0.1 shipped changes it.

  docs/corporate/LOT-CUBIQ-OPERATOR.md, Sections 04 and 07 — the AI
  physical-delivery decision logic and the Phase 4 timeline this hardware
  answers to.

  docs/corporate/LOT_QI46_ENGINE.md — re-checked for drift against the
  Section 05 signal loop. No structural change to the haptic-preference
  input contract (pressure, duration, cadence) since v.0.1; the loop this
  document specified still matches.

  docs/corporate/LOT_ROBOTICS_COSMO.md — re-checked the COSMO® naming
  boundary. COSMO® remains a distinct, general-purpose robotics division
  (father/son brand split, "a robot that carries the behavioral
  fingerprint of its owner"). CUBIQ™ continues to be scoped narrower and
  differently: a single-purpose notification body, not a general robot.
  No naming or scope collision found; none introduced here.

  docs/benchmark/LOT-MANIFEST.md — the COSMO Hardware row (line 31,
  "COSMO® Cube — complete hardware computer design v1.0") is unchanged
  and remains the sibling, textually distinct hardware track noted in
  Section 00 above.

This cycle's work: (1) close the v.0 design lock opened in Section 02-04
with a concrete bill of materials (Section 09), since "DESIGN LOCK
PENDING" is no longer an accurate status once real part classes are
named; (2) open, not close, the v.1 Long Jump engineering brief
(Section 10) — advancing the roadmap item from a one-paragraph forward
reference (old Section 06) into real numbers, without pulling forward the
v.0 gate criteria or claiming v.1 hardware exists; (3) append Use Case 02
to Section 07, per that section's standing instruction.

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

  USE CASE 02 — THE SHARED DESK                              2026-09-22
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, Archetype "Evening Integrator"
  (LOT-WIKI Arch43 class), cohort-active, shares a two-person desk with a
  partner who is not a LOT® operator. The CUBIQ charging pad sits at the
  operator's half of the desk, in the partner's peripheral vision.

  A cohort resonance ping fires (LOT-CUBIQ-OPERATOR.md, Section 03) — a
  signal class that, until now, has only ever been demonstrated on a
  single-operator desk (Use Case 01). Here the same THE HOP gesture
  (Section 04) fires with a second person seated eighteen inches away.

  The non-operator partner sees a matte-black cube lift ten millimeters
  and resettle, once, with no light, no sound, no screen. They ask what
  it was. The operator explains it in one sentence: a badge unlocked.
  Nothing more is said, because nothing more is asked — the gesture reads
  as a private, contained event, not a broadcast. This is the load-bearing
  design requirement Section 03's edge-detection and Section 02's
  light-as-secondary choices were made to satisfy, and Use Case 02 is the
  first entry in this document to test them against a witness who is not
  the intended recipient of the signal.

  Two weeks later, the telemetry loop (Section 05) shows a measurable
  change unique to this profile: THE HOP's landing displacement variance
  tightens over successive cohort pings — not because the actuator
  changed, but because the operator has started leaving a folded cloth
  coaster under the cube, unprompted, quieting the resettle. The cube did
  not ask for this. The operator's own care pattern extended the object's
  behavior, the same way a person adjusts a chair for someone else's
  comfort without being told to. This is the use case that establishes
  the cube can be present on a shared surface without becoming a shared
  notification — it stays legible to one operator, one signal source,
  even when someone else is close enough to feel it too.

--------------------------------------------------------------------------------
08 // BRAND
--------------------------------------------------------------------------------

LOT® Quantum Cube             The object
CUBIQ™                        The experience — software and hardware,
                               one name, one system
LOT®† CUBIQ®                  The combined mark

--------------------------------------------------------------------------------
09 // DESIGN LOCK — v.0 BILL OF MATERIALS (CYCLE 2 CLOSE-OUT)
--------------------------------------------------------------------------------

The document header no longer needs to read "design lock pending." This
cycle names real, sourceable part classes against every functional block
specified in Sections 02-04, closing v.0's design lock:

  BLOCK               PART CLASS                       NOTE
  ─────               ──────────                       ────
  Primary actuator     Voice-coil linear actuator,       Chosen in v.0.1 for
                        ~8mm stroke, closed-shell         controllability and
                        (e.g. LRA/voice-coil hybrid       quiet operation;
                        class, not off-the-shelf ERM)     stroke class is the
                                                          v.1 lever (Sec 10).
  Directional bias      PZT piezoelectric bimorph         Reuses Institute-
                        strip, angle-mounted 5-15°        named component
                        off the actuator's primary axis   class (Sec 03).
  Motion sensing        6-axis IMU (accel + gyro),        Single part serves
                        I2C, geometric-center mount       both landing-
                                                          recovery (Sec 03)
                                                          and QI·46 haptic-
                                                          preference telemetry
                                                          (Sec 05).
  Edge safety           Time-of-flight distance           Hard safety gate,
                        sensor, forward-facing, base       Sec 03 — 100/100
                        face, <30mm dead zone              trial requirement
                                                          is unchanged by
                                                          part selection.
  Compute + driver      Low-power MCU with a single        Runs the gesture
                        motor-driver channel and I2C       vocabulary (Sec 04)
                        sensor bus; no display driver,     as fixed firmware
                        no radio beyond charge-pairing     states, not a
                                                          general compute
                                                          load — keeps mass
                                                          and power budget
                                                          honest.
  Power                 Small-format LiPo cell sized       Charged only
                        to the <120g mass target (Sec      through the base
                        02); no user-accessible port       face (Sec 02) —
                                                          no cable, no port,
                                                          no attack surface
                                                          on the shell.
  Charge/pairing        Qi-class inductive receiver,       Base face — same
                        base face                         face referenced as
                                                          "the table" in
                                                          Sec 02.
  Shell                 Nano-ceramic composite, matte      Unchanged from
                        LOT® black, single-piece with      v.0.1; no shell
                        four elastomer feet bonded at      redesign needed
                        the base corners                  to close design
                                                          lock.

  WHAT "DESIGN LOCK" MEANS HERE
    Every block above names a sourceable part class, not a finished bill
    of materials with vendor part numbers — that step belongs to hardware
    procurement, outside this document's scope. Design lock means: no
    functional block in Sections 02-04 still depends on an unnamed or
    undecided technology. The 500/500 hop-and-recover gate in Section 06
    is unchanged; this section closes the design question the gate was
    waiting on, it does not relax the gate itself.

--------------------------------------------------------------------------------
10 // v.1 LONG JUMP — ENGINEERING BRIEF (DEVELOPMENT OPENED, NOT CLOSED)
--------------------------------------------------------------------------------

Section 06 named v.1's deliverable (>150mm single-bound displacement,
60mm landing accuracy) without opening the engineering question of how
the v.0 actuator gets there. This section opens it — a brief, not a
closed spec. v.1 remains a future build milestone; nothing here is a
claim that v.1 hardware exists.

  THE TWO LEVERS
    v.0's controlled hop (Section 03) trades range for reliability: short
    stroke, conservative piezoelectric bias angle, four passive feet to
    absorb an imperfect landing. v.1 has exactly two levers to pull
    against the same single-actuator architecture, and both are already
    implied by v.0's design choices rather than requiring a new
    mechanism:

      LEVER 1 — STROKE LENGTH
        The v.0 voice-coil actuator (Section 09) is specified with an
        ~8mm stroke. Longer stroke means more impulse transferred to the
        shell per hop, at the cost of a taller actuator housing and a
        longer minimum gesture duration (the actuator needs the full
        stroke to build impulse before release). v.1's engineering task:
        find the longest stroke that still fits the 45mm cube envelope
        (Section 02) without redesigning the shell — because a shell
        redesign would break the "nothing in v.0 is thrown away" promise
        Section 01 makes.

      LEVER 2 — MASS
        Section 06 already names the v.1 mass target: <90g, down from
        v.0's <120g. Every gram removed from the shell or the reaction
        mass increases hop height for the same actuator impulse. The
        nano-ceramic shell (Section 02) is not the place to cut mass —
        it is the part of the object an operator touches and it stays
        as specified. The mass budget instead comes from the MCU/driver
        board (Section 09) and battery: a smaller cell, charged more
        often, is an acceptable v.1 trade if it buys jump range; a
        thinner shell is not.

  WHY THE PIEZOELECTRIC BIAS ELEMENT DOES NOT CHANGE
    v.0's forward-bias angle (5-15° off vertical, Section 03) is tuned
    for a short in-place hop where landing inside a 40mm radius matters
    more than distance. v.1 re-tunes the same PZT bimorph's timing and
    angle for reach rather than containment — a wider bias angle and an
    earlier fire point relative to actuator release. This is calibration
    work on an existing part (Section 09), not a new component. It keeps
    faith with Section 03's original reasoning: reuse Institute-named
    technology rather than inventing new material science.

  WHAT v.1 STILL HAS OPEN
    Landing accuracy at range is the harder half of v.1, not distance.
    A 150mm bound with a 60mm accuracy window (Section 06) needs the IMU
    (Section 09) to characterize launch angle variance across many hops
    before the corrective-pulse landing recovery (Section 03) can be
    re-tuned for a longer flight path — that characterization work has
    not started and is not claimed as done here. v.1 is not gated by
    this document; it is gated by trial data this document does not yet
    have.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0
================================================================================
