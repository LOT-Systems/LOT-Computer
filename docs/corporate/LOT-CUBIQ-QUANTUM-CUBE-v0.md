================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Actuated Haptic Notification Device
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-07-28
VERSION:  0.1 — DEVELOPMENT START (see R02-R10 reports for amendments to §03/§06)
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

  USE CASE 02 — THE BEDSIDE SETTLE                          2026-11-10
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, evening routine in the Index of
  Systems, phone charged in another room. CUBIQ pad on a ~100 mm
  nightstand. Too narrow for THE LEAP (R02 degradation ladder), so the
  cube's whole vocabulary is THE SETTLE (21:30 wind-down, felt as 2s
  standing pressure, no light, no sound) and THE NUDGE (06:50 Memory
  question). Quiet hours forbid all ballistic gestures overnight.
  Proves the cube is as valuable when it refuses to jump as when it
  jumps. Full narrative: LOT-CUBIQ-QUANTUM-CUBE-v0-R02.md, Section 10.

  USE CASE 03 — THE PRACTICE PIANO                          2026-11-11
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, adult returning to piano, 40-minute
  evening practice, phone in a drawer. CUBIQ pad on the upright's top
  lid. The cube's surface resonance probe (R03 §06) classifies the lid
  RESONANT: NUDGE would sound as a faint note through the soundboard, and
  a landing would sound like a drum. So the cube downgrades to THE SETTLE,
  fires once at the end of the practice block, never repeats, and holds
  the waiting Memory question until the operator lifts the cube. Proves
  the cube must listen to the furniture before it speaks through it.
  Full narrative: LOT-CUBIQ-QUANTUM-CUBE-v0-R03.md, Section 09.

  USE CASE 04 — THE HOTEL DESK                              2026-11-13
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, frequent traveller, ~10 hotel nights a
  month. The cube travels in a pocket with no pad: off-pad endurance is
  months (R04 §04). On each new desk it runs the unknown-surface
  placement routine (resonance probe, four-ToF edge map, level check)
  before it allows any ballistic gesture. Here that means NUDGE, SETTLE,
  and HOP, but not LEAP. At 22:40 local, when the phone and the feed are
  most tempting, it NUDGEs the Memory question. The operator puts the
  phone down and picks up the cube. Quiet hours follow the operator's
  local time. Proves the cube's value isn't tied to one desk: it measures
  each new surface before it moves on it.
  Full narrative: LOT-CUBIQ-QUANTUM-CUBE-v0-R04.md, Section 09.

  USE CASE 05 — THE SILENT HOUSEHOLD                        2026-11-14
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, Deaf, a native signer, architectural
  drafter in a home studio, hearing partner. The home already uses
  flashing lights for the doorbell and smoke alarm and a bed shaker for
  waking. For this operator both the phone and the cube are touch
  channels, so the cube's job is to be told apart from the phone: THE
  NUDGE becomes a two-beat push signature that a hand on the desk can't
  mistake for a phone's buzz (R05 §07). The LED ring never blinks, so it
  never competes with alert lights. During a live signed call, gestures
  drop to SETTLE, because motion next to a signer pulls the eye off the
  conversation. Quiet hours still apply for the sleeping partner.
  Proves that a motion-first, sound-free cube suits Deaf operators
  especially well, and that they belong on the design panel from the
  start. Full narrative: LOT-CUBIQ-QUANTUM-CUBE-v0-R05.md, Section 09.

  USE CASE 06 — THE MAKER'S BENCH                           2026-11-15
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, studio potter in a garage studio,
  900 mm plywood bench, concrete floor, phone bagged away from clay and
  dust. In the workshop, the felt channel and the touch ack both fail:
  the bench is pounded during wedging and hands are wet with clay. When
  the shared surface vibrates, the cube DEFERS (G9). It never escalates.
  Instead, the operator chooses to raise memory_ready one rung to HOP
  (an operator-set ceiling that QI·46 can lower but never set) and acks
  by approach. The LEAP spring is cocked only on intent, so when a
  sleeve knocks the cube onto concrete, nothing fires. SAFE-HOLD,
  placement and a self-test follow (G8). Dusty ToF windows fail quiet to
  SETTLE. Proves that hands-busy makers need the visible channel, that
  drops are routine rather than an edge case, and that only the operator
  may make the cube louder. Full narrative:
  LOT-CUBIQ-QUANTUM-CUBE-v0-R06.md, Section 10.

  USE CASE 07 — THE READING ROOM                            2026-11-20
  ─────────────────────────────────────────────────────────────────
  Operator profile: R&D tier, part-time doctoral student reading in a
  university library on long shared oak tables (~35 dB room, next seat
  1.2 m away). The phone sits face-down and still gets turned over every
  twelve minutes. In a public quiet room the cube's sound reaches
  strangers, and no ballistic gesture is quiet enough: even a HOP on a
  damped desk lands ~10 dB over the room at the next seat (R07 §02). The
  operator double-taps the top face to set HUSH (G10). One felt SETTLE
  pulse confirms it. A badge that would LEAP at home arrives as a NUDGE
  at the wrist, and the neighbour reads on. Only the operator clears
  HUSH, never a timer or coming home. No microphone is involved. Proves
  that the operator, not a sensor, should decide that a room is quiet,
  and that a private felt signal can replace the habit of checking the
  phone. Full narrative: LOT-CUBIQ-QUANTUM-CUBE-v0-R07.md, Section 11.

  USE CASE 08 — THE CLASSROOM                               2026-11-21
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, primary-school teacher, 27 pupils,
  phone locked away during lessons, desk of ringing laminate on steel.
  The cube sits in the recess of its home pad. Qi ID plus an orientation
  key give a 0.1 s placement, and the pad certifies the surface but never
  the airspace (R08 §04). HUSH is on through lessons. A rare badge
  arrives as a NUDGE: the pad keeps it a NUDGE where the bare steel desk
  would force SETTLE. Pupils see nothing. At break a pupil double-taps
  it. HUSH-LOCK means a tap can make the cube quieter but never louder
  (R08 F60). Another pupil drops it from desk height: the spring was
  never cocked, the cam can't fire, and it goes to SAFE-HOLD. At lunch,
  in an empty room, the teacher clears HUSH in the app. The Memory
  question HOPs on the 590 g isolated deck, and the knock never reaches
  the steel frame. Proves that a cube with no "make it jump" input is
  safe among children, that a tap is not proof of the operator, and that
  the pad's mass, not firmware, gives the cube back its full vocabulary
  on a bad surface. Full narrative: LOT-CUBIQ-QUANTUM-CUBE-v0-R08.md,
  Section 11.

  USE CASE 09 — THE COFFEE TABLE                            2026-11-22
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, 81, living alone. Daughter and
  grandson are in their LOT® cohort. The phone stays in a drawer because
  every buzz might be bad news. The table is glass on chrome: resonant
  and slippery. On its home pad the cube knows its deck in 0.43 s
  (R09 §04). The Memory question HOPs, raised one rung by the operator,
  and the platform asked for exactly that much and no more (R09 §03). The
  daughter's cohort ping can never exceed NUDGE. It arrives while the
  cube is in the operator's hands, so it is a SETTLE, a slow push in the
  palm. She sees "sent", never "felt", "off its pad" or "fall": device
  events are operator-private (R09 F74). A drop on the rug goes to
  SAFE-HOLD, and only the operator is told. An epic achievement LEAPs
  across the deck. The pad's feet grip the glass (μ ≥ 0.6 spec, R09 §05).
  Proves that the people who send to a cube cannot turn it up, that a
  notification object must not report on its owner, and that the hand
  is a surface. CUBIQ is not a care or fall-alarm device and is never
  sold as one. Full narrative: LOT-CUBIQ-QUANTUM-CUBE-v0-R09.md,
  Section 10.

  USE CASE 10 — THE MOORING                                 2026-11-23
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, 38, a translator living aboard a
  narrowboat that must move every fourteen days. Solar and 12 V power,
  signal that drops out in the cuttings, and a ply-on-steel dinette
  table that sits on water. A passing boat's wash rocks the deck ±1.5°.
  R05's "still for ≥ 2 s" check would have made the cube unplaced, so
  SETTLE would be its only gesture. Placement v0.3 sees the table moving
  WITH the cube and classes the motion GENTLE, and the morning Memory
  HOP lands 0.8 mm off (R10 §05). Under way, the engine (G9) and then
  ±4° of roll (G11 ROUGH) defer an epic achievement. A cohort ping
  reaches the phone 30 minutes late and expires on its 15-minute TTL,
  so it is never performed late. Back at a mooring, a tea towel covers
  the pad's deck edge. edge_seen is false, so there is no pad credit,
  and the deferred LEAP falls through to a SETTLE. The queued uplink
  tells only the operator to clear the deck (R10 F78, F79). Proves
  that a moving surface is not an unsafe one, that on-device decisions
  plus per-class TTLs need no network to stay correct, and that a pad's
  claim must be checked against what the cube can see. Full narrative:
  LOT-CUBIQ-QUANTUM-CUBE-v0-R10.md, Section 10.

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
