================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-R02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report 02
          Energy Budget · Launch Architecture · Test Plan · Use Case 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-03
VERSION:  0.2 — DEVELOPMENT CYCLE 02 (PRE-HARDWARE, DESIGN LOCK STILL PENDING)
PARENT:   docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md (2026-07-28, cycle 01)
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing, in this order:

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md       (cycle 01 — my own spec)
  docs/corporate/LOT-CUBIQ-VISION.md                (anti-feed thesis, arc)
  docs/corporate/LOT-CUBIQ-OPERATOR.md              (Index of Systems, /breathe 4-2-6)
  docs/corporate/LOT_QI46_ENGINE.md                 (cube as haptic-preference input)
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md       (hardware line: PLANNED)
  docs/corporate/LOT_ROBOTICS_COSMO.md              (COSMO® lineage; separate track)

Repo state: cycle 01 is the only prior cube document. No prototype, CAD,
firmware or BOM exists in the repository; everything below is paper
engineering. Nothing in this report is a measured result.

--------------------------------------------------------------------------------
01 // CYCLE 02 SUMMARY
--------------------------------------------------------------------------------

Cycle 01 fixed the vocabulary (Nudge / Hop / Leap / Settle) and the roadmap
(v.0 hop -> v.1 long jump -> v.2 table swing -> v.3 levitation research).
Cycle 02 does the first quantitative pass on it and finds three things:

  F1  The v.0 Leap figures in cycle 01 are internally inconsistent
      (see Section 02). Corrected here.
  F2  The cycle 01 launch mechanism ("reaction mass driven downward") is
      under-specified. A latch-and-release spring launcher is recommended
      (Section 03).
  F3  Battery energy is not the constraint; PEAK POWER and landing shock
      are (Section 04).

New in this cycle: energy budget, launch architecture decision, a 5th
gesture proposal (THE BREATH), a test plan with pass/fail gates, open risks,
and Consumer Use Case 02.

--------------------------------------------------------------------------------
02 // ENERGY BUDGET (BALLISTIC MODEL)
--------------------------------------------------------------------------------

Model: point-mass projectile on a flat surface, no drag, g = 9.81 m/s²,
launch and landing at the same height. Elevation is measured from the
horizontal. Values computed, not measured.

  GESTURE / TARGET            MASS   ELEV   LAUNCH v   APEX    KINETIC E
  ──────────────────────────  ─────  ─────  ─────────  ──────  ─────────
  HOP   (10 mm rise)          120 g  90°    0.44 m/s   10 mm   11.8 mJ
  LEAP  (40 mm range)         120 g  75°    0.89 m/s   37 mm   47 mJ
  v.1   (150 mm range)         90 g  45°    1.21 m/s   38 mm   66 mJ
  v.1   (150 mm range)        120 g  45°    1.21 m/s   38 mm   88 mJ
  v.1   (150 mm, low arc)      90 g  30°    1.30 m/s   22 mm   77 mJ
  LEAP flight time (75°)                               ~0.17 s

FINDING F1 — Cycle 01 specified the Leap as "5-15° off vertical" with
"~40 mm displacement". Those two numbers cannot both hold at the 10 mm
Hop scale: at 15° off vertical, a 40 mm range already implies a ~37 mm
apex, i.e. a 4x higher jump than the Hop. Resolution adopted for v.0:
  - THE HOP stays <10 mm rise, vertical (~12 mJ).
  - THE LEAP is re-defined as ~37 mm apex / ~40 mm range at 75° elevation
    (~47 mJ). Roughly 4x the Hop energy, so the Hop and Leap are two
    distinct power settings of one launcher, not one launcher at
    different angles.
  - The v.1 "long jump" is cheap in energy (66-88 mJ) because low-arc
    shots trade apex for range. The v.1 difficulty is controlling a ~1.2 m/s
    takeoff on a 45 mm cube, not producing the energy.

--------------------------------------------------------------------------------
03 // LAUNCH ARCHITECTURE DECISION
--------------------------------------------------------------------------------

FINDING F2 — "A voice coil drives a reaction mass downward against the base"
is ambiguous. Two physically different mechanisms hide in that sentence:

  OPTION A — DIRECT-DRIVE PROOF MASS
    A ~30 g internal mass is accelerated and its momentum handed to the
    shell. To give a 120 g body 0.89 m/s the proof mass must reach ~3.5 m/s
    inside an ~8 mm stroke: ~780 m/s² (~80 g) and ~23 N peak from a
    voice coil that must fit in a 45 mm cube. Loud, hot, and hard to make
    repeatable at 11-12 mJ vs 47 mJ settings.

  OPTION B — LATCH-AND-RELEASE SPRING (RECOMMENDED FOR v.0)
    A coil/motor slowly charges a spring over ~150-300 ms; a small latch
    (piezo or SMA release) lets it go in under 2 ms. For 47 mJ over an 8 mm
    stroke the spring rate is ~1.5 kN/m. Charging power is ~0.2-0.3 W
    average, trivial. Hop vs Leap becomes a stroke-length setting, and the
    voice coil is demoted to the quiet job it is best at: the NUDGE and
    SETTLE gestures (sub-threshold, no liftoff).

  DECISION: Option B for v.0. The piezoelectric element named in the
  Institute corpus (LOT_QI46_ENGINE.md line 110) is retained as the
  LATCH-RELEASE and as the forward-bias trigger, which keeps the design on
  Institute-named technology. Option A stays as a fallback if latch wear
  fails the cycle test in Section 06.

  Forward bias (cycle 01 piezo bimorph) is unchanged in intent: a
  millisecond-scale staggered release gives the launch a tilt without a
  second motor.

--------------------------------------------------------------------------------
04 // POWER, THERMAL, ACOUSTIC
--------------------------------------------------------------------------------

  BATTERY      A 150 mAh / 3.7 V cell holds ~2.0 kJ. One Leap is ~47 mJ
               mechanical; even at 5% end-to-end efficiency that is ~1 J.
               Energy supports thousands of gestures per charge. Sizing
               is driven by PEAK current for spring charging, so a
               supercapacitor buffer is preferred over a bigger cell.
  CHARGING     Inductive pad (cycle 01). Open question: a metal-free shell
               is required, which suits the nano-ceramic choice.
  LANDING      A 120 g cube falling 37 mm lands at ~0.85 m/s. Elastomer
               feet (cycle 01) must absorb this on glass and hard wood
               without chatter; IMU-detected tip-over (>25°) triggers the
               corrective pulse, now a spring re-charge-and-fire at Hop
               power.
  ACOUSTIC     Spring release plus landing click is the loudest event. The
               target is <35 dBA at 0.5 m for a Hop. A gesture that wakes
               someone is a failed notification. Unverified; measure first.

--------------------------------------------------------------------------------
05 // GESTURE VOCABULARY UPDATE
--------------------------------------------------------------------------------

  Cycle 01 gestures are unchanged: NUDGE, HOP, LEAP, SETTLE.
  Proposed 5th gesture for v.0 (pending S-2 approval):

  THE BREATH      A slow 4-2-6 second pulse train from the voice coil,
                  sub-threshold, no liftoff. Mirrors the /breathe exercise
                  (LOT-CUBIQ-OPERATOR.md, Section 02). Trigger: SELF-CARE
                  signal (Breathe moment due). Duration 3 cycles (~36 s).
                  Needs no jump hardware; can ship on the earliest
                  prototype.

  Signal-to-gesture contract, with BREATH added:

  SIGNAL                       GESTURE   NOTE
  ───────────────────────────  ────────  ──────────────────────────────
  Memory question ready        NUDGE     felt, not seen
  Badge common/uncommon        HOP       lands in place
  Badge rare and above         LEAP      ~40 mm toward operator
  Assembly phase advanced      SETTLE    2 s standing pressure
  Self-care "Breathe" due      BREATH    4-2-6 pulse train (new)

--------------------------------------------------------------------------------
06 // TEST PLAN AND GATES (v.0 CLOSE CRITERIA, EXTENDED)
--------------------------------------------------------------------------------

Cycle 01 gate (500/500 hop-and-recover, zero off-table landings) stands.
Added intermediate gates, in build order:

  G0  BENCH   Spring + latch on a test rig, no shell. 10,000 release
              cycles. Energy repeatability: 47 mJ ± 10% at Leap setting.
  G1  SHELL   Assembled 120 g cube on glass, wood, laminate. Hop rise
              within 10 mm, 100 trials, no tip-over beyond the recoverable
              25° limit.
  G2  EDGE    100/100 edge-approach trials with the time-of-flight
              inhibit (cycle 01 hard gate, unchanged). Test also with a
              glass of liquid and a laptop edge as obstacles.
  G3  ACOUST  Hop <35 dBA at 0.5 m in a quiet room.
  G4  SOAK    500/500 hop-and-recover (cycle 01 gate).
  G5  LOOP    Gesture telemetry returns to QI·46 as the haptic-preference
              signal on a mock endpoint (QI46 line 796 mock test).

--------------------------------------------------------------------------------
07 // OPEN RISKS
--------------------------------------------------------------------------------

  R1  Latch wear before 10,000 cycles. Mitigation: Option A fallback.
  R2  Surface variance (glass vs felt) breaks repeatability; v.2 will
      amplify this. Needs a calibration hop on pairing.
  R3  Child and pet interaction: a launching object at desk level needs
      a firm speed cap (<1.3 m/s) and a pinch-point review.
  R4  Edge detection fails on transparent or black glass for a ToF sensor.
  R5  Naming collision with the COSMO® Cube computer track. Cycle 01
      keeps them separate; no change.
  R6  Levitation (v.3) remains research only; no claim is made here.

--------------------------------------------------------------------------------
08 // NEXT CYCLE (03) PROPOSED
--------------------------------------------------------------------------------

  1. Bill of materials with price estimate for the G0 bench rig.
  2. Firmware state-machine sketch: signal -> gesture -> telemetry.
  3. API contract for a CUBIQ hardware endpoint in the existing signal
     pipeline (read-only design; no code until S-2 approves).
  4. Use Case 03.

--------------------------------------------------------------------------------
09 // CONSUMER USE CASES (CUMULATIVE — ONE NEW ENTRY PER CYCLE)
--------------------------------------------------------------------------------

  USE CASE 01 — THE DESK MIGRATION                          2026-07-28
  See LOT-CUBIQ-QUANTUM-CUBE-v0.md, Section 07. Unchanged.

  USE CASE 02 — THE KITCHEN-COUNTER BREATH                  2026-10-03
  ─────────────────────────────────────────────────────────────────
  Operator profile: a parent, Usership tier, home most evenings. The
  CUBIQ pad sits on the kitchen counter, away from the sink edge.

  It is 18:40. The operator is cooking with a child at the table, phone in
  another room. The system has seen the day: a dense work log, no
  self-care moment recorded, a stress-leaning mood check at noon. The
  Self-Care module decides a Breathe moment is due. Today, that would be a
  phone buzz the operator is not holding, then a missed prompt, then a
  guilt-shaped line in tomorrow's log.

  With CUBIQ v.0: the cube performs THE BREATH. A slow pulse in the
  counter, 4 seconds in, 2 held, 6 out, three times. Nothing lights up,
  nothing beeps, and the child doesn't notice. The operator, hands in the
  dough, feels it through the forearm resting on the counter. They match
  their breath to it for 36 seconds and carry on cooking.

  Because the pulse is sub-threshold and the cube never leaves the pad,
  the edge-safety rule is never in play: near hot pans, knives and
  liquids, the cube prefers the Nudge/Breath family and refuses to hop. The
  cube's IMU logs that the pulse was felt (the counter vibration damped by
  the operator's arm). That response feeds QI·46 as a haptic-preference
  signal. Within a few weeks the system learns that this operator takes the
  breathing prompt best at the kitchen counter and not at the desk, and
  moves it there.

  Consumer value: a self-care practice that arrives in the body, in the
  room the operator actually is in, without a screen. Hardware cost to
  serve: voice coil only; no jump mechanism needed. This is the cheapest
  gesture in the vocabulary and the one most likely to ship first.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-R02
================================================================================
