================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-04
VERSION:  0.2 — PHYSICS BUDGET + OPEN DESIGN FINDINGS + USE CASE 02
STATUS:   v.0 — PRE-HARDWARE, DESIGN LOCK STILL PENDING
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing (in this order):

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md   (v0.1, 2026-07-28 — own prior
    work; Use Case 01 "The Desk Migration"; roadmap v.0→v.3; gesture table)
  docs/corporate/LOT-CUBIQ-VISION.md / LOT-CUBIQ-OPERATOR.md
  docs/corporate/LOT_QI46_ENGINE.md / CQGS-WHITE-PAPER-SNAPSHOT.md
  docs/corporate/LOT-AMBIENT-AI-VISION.md   (new input this cycle — Station,
    Brush, QIoT™, 4D UX, rule "one line, no alarm, exact moment")
  docs/corporate/LOT_ROBOTICS_COSMO.md (sibling COSMO® track — no naming overlap)

What this report adds to v0.1: v0.1 fixed the architecture and gesture
language but contained no numbers. This report puts a first-order energy and
impact budget under it, records design findings that the budget exposes, and
appends USE CASE 02. Nothing in v0.1 is removed or edited.

--------------------------------------------------------------------------------
01 // FIRST-ORDER PHYSICS BUDGET (g = 9.81 m/s², ideal ballistics, no drag)
--------------------------------------------------------------------------------

Launch energy is the energy delivered to the shell's centre of mass at liftoff.
Range R = v²·sin(2θ)/g, apex = (v·sinθ)²/2g, θ measured from horizontal.

  GESTURE / TIER     M      TARGET           θ     v       KE      APEX   AIR
  ──────────────     ────   ──────────────   ───   ─────   ─────   ─────  ─────
  THE HOP (v.0)      120 g  10 mm rise       90°   0.44    11.8 mJ  10 mm  —
  THE LEAP (v.0)     120 g  40 mm range      75°   0.89    47 mJ    37 mm  174 ms
  THE LEAP, 80°      120 g  40 mm range      80°   1.07    69 mJ    57 mm  215 ms
  LONG JUMP (v.1)     90 g  150 mm range     45°   1.21    66 mJ    38 mm  175 ms
  LONG JUMP, 60°      90 g  150 mm range     60°   1.30    77 mJ    65 mm  230 ms

Reading the table:

  F1  THE LEAP IS NOT A "<10 mm" MOTION. v0.1 §04 shows THE HOP at <10 mm
      rise and THE LEAP with "~40 mm displacement," and §03 gives a 5–15° bias
      off vertical. At 15° off vertical (θ = 75°) a 40 mm range needs a
      ~37 mm apex. That is a visible jump, not a nudge. Consequence: the
      v.0 "full-amplitude" actuator must deliver ~47 mJ, about 4× THE HOP.
      The 5–15° bias also means a 40 mm range is the MAXIMUM, reached only at
      15°; at 5° range is ~13 mm. Spec language to be tightened: LEAP range is
      a function of bias angle, and 40 mm is its ceiling.

  F2  v.1 LONG JUMP IS ENERGETICALLY CHEAP, KINEMATICALLY HARD. 150 mm at
      45° needs only ~66 mJ — barely more than the v.0 LEAP — because the
      mass drops to 90 g and the angle opens up. The v.0 bias strip cannot
      produce a 45° launch; the v.1 problem is angle control, not energy.
      Recommendation: do not size the v.1 actuator by stroke alone; add a
      tilt/impulse-vector stage (angled striker or two-point launch).

  F3  BATTERY IS NOT THE CONSTRAINT. A 100 mAh / 3.7 V cell holds ~1.33 kJ.
      At an assumed 20 % electro-mechanical efficiency a 47 mJ LEAP costs
      ~235 mJ — about 5,600 leaps per charge, before the Qi pad tops it up.
      Thermal duty cycle of the voice coil and the shell fatigue life are the
      real limits (see F4, §03 gates).

  F4  LANDING LOAD. Touchdown at 0.89 m/s decelerated over 1 mm of foot
      compression is ~40 g; over 2 mm ~20 g. For a 45 mm nano-ceramic shell
      with an internal PCB and cell this is a design-driving number. v.0
      foot elastomer must provide ≥2 mm stroke (target ≤20 g peak). The
      500-cycle gate in v0.1 §06 should log peak landing g from the IMU.

  F5  MOMENTUM, NOT JUST ENERGY. The LEAP needs ~0.106 kg·m/s of impulse.
      A downward-driven internal reaction mass only delivers this if it is
      arrested against the base (hammer-strike) — a free-moving internal
      mass returns its momentum and nets zero. v0.1 §03 should state the
      mechanism as "strike-and-stop" explicitly; a 20 g mass needs ~5 m/s.
      This sets the voice-coil stroke and bench-test fixture for week 1.

--------------------------------------------------------------------------------
02 // OPEN DESIGN FINDINGS (to resolve before design lock)
--------------------------------------------------------------------------------

  D1  LANDING ORIENTATION. v0.1 §03 rights a cube that tips "past 25°" with a
      micro-pulse. A cube is a six-sided body: a hop that ends on an edge or
      a different face needs ~45–90° of rotation, which a micro-pulse cannot
      give. Options: (a) suppress spin — keep launch impulse through the
      centre of mass (strike axis ±1 mm of CoM) and gate the gesture on IMU
      pre-launch pitch/roll < 3°; (b) low centre of mass via a dense base
      plate so edge landings self-right; (c) all faces identical for feet and
      inductive receiver. Recommended: (a)+(b) for v.0, (c) deferred.

  D2  QI PAD AS ARENA. Pad-as-table is elegant, but the pad coil region is
      not the whole surface. Hop landings off the coil lose charging and
      alignment. Add a "return-to-pad" rule: after any LEAP, if the IMU
      shows displacement > 30 mm from pad centre, the next gesture is a
      reverse-bias hop. Closed-loop position needs only dead-reckoning from
      the commanded bias plus a pad-edge capacitive/NFC proximity sense.

  D3  ACOUSTIC SIGNATURE. THE HOP/LEAP are audible on wood or glass. Ambient
      AI™ forbids alarm-like noise. Target ≤ 35 dBA at 300 mm; foot
      elastomer and shell damping count as gate criteria, not polish.

  D4  NOTIFICATION BUDGET. The anti-feed thesis fails if the cube becomes the
      new buzzing phone. Proposed hard limit: ≤ 6 non-Settle gestures per
      operator per day, enforced in the driver (Section 05 of v0.1), with
      the gesture dropped — never queued — when the cap is hit.

  D5  OUTPUT-CHANNEL CONSENT. Motion near an operator's hand/keyboard (the
      LEAP "greeting" of Use Case 01) must be opt-in per gesture and
      suppressed when the IMU senses the cube is being held or the ToF sensor
      sees an object < 60 mm in the hop path (cup, hand, keyboard edge).

--------------------------------------------------------------------------------
03 // v.0 BUILD PLAN — NEXT 30 DAYS
--------------------------------------------------------------------------------

  WEEK 1  Bench: voice-coil + strike-and-stop mass on a 120 g dummy shell on
          a load cell / high-speed camera (240 fps phone is sufficient).
          Gate: reproduce 10 mm HOP to ±2 mm over 100 trials.
  WEEK 2  Add bias element; map bias angle → range curve (validate F1 table).
          Log landing g (F4). Choose foot elastomer.
  WEEK 3  IMU pre-launch gating + landing check (D1); ToF edge/obstacle gate
          (v0.1 §03; D5). 100/100 edge-approach trials on glass and wood.
  WEEK 4  Driver: signal→gesture map (v0.1 §04), daily cap (D4), telemetry
          upload to QI·46 haptic-preference channel. Dry-run against the
          Index of Systems signals listed in Use Cases 01 and 02.
  EXIT    500/500 hop-and-recover, zero off-table landings, ≤35 dBA, ≤20 g
          peak landing. Then v.0 closes and v.1 opens (angle-control stage, F2).

--------------------------------------------------------------------------------
04 // CONSUMER USE CASES (APPEND-ONLY — SEE v0.1 §07 FOR USE CASE 01)
--------------------------------------------------------------------------------

  USE CASE 02 — THE OPEN WINDOW                             2026-10-04
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, remote worker in a small apartment,
  LOT® Station on the shelf (Ambient AI™ vision), CUBIQ™ pad on the desk.
  Autumn: windows are shut, heating is on, a three-hour focus block is in
  progress. Screen is full-screen on an unrelated document.

  The Station reports CO₂ crossing 1,200 ppm. Under the software-only
  Ambient AI™ design, the Air Quality widget would surface "Air quality:
  open a window for 30 minutes." — but the operator is not looking at the
  LOT® OS; the line sits unread. The widget is correct and unseen.

  With CUBIQ™ hardware v.0: the QIoT™ layer fuses the Station reading with
  the operator's focus state (typing cadence, no tab changes) and chooses a
  gesture proportional to the signal. CO₂ is a slow, low-urgency signal, so
  the cube performs THE SETTLE — standing pressure for two seconds, no
  visible motion, felt through the desk. It does not hop. It does not repeat
  that hour. The operator, at the next natural pause, looks at the cube,
  then at the OS, where the one-line widget message is waiting. They open
  the window. Within ten minutes CO₂ falls below 800 ppm; the Station
  confirms, and the cube does nothing at all — the loop closes in silence.

  Two design points this use case proves:
    1. The cube is the carrier of the Ambient AI™ rule "one line, no alarm,
       exact moment" — hardware that points at the line, never replaces it.
    2. Silence is a gesture. Resolution is not announced. This fixes the
       Section 04 gesture table: THE SETTLE gains a second trigger class,
       "environmental signal from the QIoT™ layer" (Station: air quality,
       temperature delta), in addition to "assembly phase advanced."

  Telemetry returned to QI·46: gesture delivered, time-to-glance (IMU/ToF
  proximity), time-to-resolution (Station delta). Resulting calibration:
  operators who respond to SETTLE within 15 min get no escalation; those who
  do not get the same single SETTLE the next day, never a stronger gesture
  (D4 cap, anti-feed).

--------------------------------------------------------------------------------
05 // ROADMAP DELTA vs v0.1
--------------------------------------------------------------------------------

  v.0  Gesture table updated: SETTLE adds Station triggers. LEAP spec
       tightened per F1. Added gates: ≤35 dBA, ≤20 g landing.
  v.1  Scope change: angle-control stage is the main work item (F2).
  v.2  Return-to-pad (D2) becomes a prerequisite for table-walking.
  v.3  Unchanged: levitation remains a research track; acoustic option
       benefits from the pad-as-array direction already taken in D2.

--------------------------------------------------------------------------------
06 // NEXT CYCLE
--------------------------------------------------------------------------------

  - Append USE CASE 03 (candidate: shared household — one cube, two
    operators, who gets the gesture).
  - Order bench parts for Week 1 (voice-coil, 120 g dummy shell, load cell).
  - Resolve D1 on paper (CoM and strike axis) with a CAD sketch.

All figures in §01 are first-order estimates for design guidance, not
measurements. No hardware has been built or tested.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
================================================================================
