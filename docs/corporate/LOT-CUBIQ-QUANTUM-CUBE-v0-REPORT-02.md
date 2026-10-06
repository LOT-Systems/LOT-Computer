================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report 02: Energy Budget
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-06
STATUS:   v.0 — PRE-HARDWARE, DESIGN LOCK PENDING
================================================================================

00 // READING LOG
  - docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md (spec 0.1, 2026-07-28; Use Case 01)
  - docs/corporate/LOT-CUBIQ-VISION.md, LOT-CUBIQ-OPERATOR.md
  - docs/corporate/LOT_QI46_ENGINE.md (piezo / haptic input loop), CQGS-WHITE-PAPER-SNAPSHOT.md
  No hardware, bench data or prototype exists in the repository. Everything
  below is first-order analytical work, not measurement.

01 // THIS CYCLE'S OBJECTIVE
  Spec 0.1 fixed form, gestures and gates but never closed the ENERGY budget.
  This report does that, using ideal ballistics (no air drag, no landing loss,
  no actuator efficiency), g = 9.81 m/s². Treat figures as LOWER bounds.

02 // BALLISTIC ENERGY BUDGET
  Launch energy needed for a projectile of mass m, range R, launch angle θ:
    v² = R·g / sin(2θ);  E = ½·m·v²;  rise = v²·sin²θ / 2g

  CASE                          m      R     θ    v(m/s)  E(mJ)  rise(mm)
  ----------------------------  -----  ----  ---  ------  -----  --------
  v.0 HOP (vertical, 10mm)      120g   —     90°  0.44    11.8   10.0
  v.0 LEAP as specced (5-15°)   120g   40mm  10°  1.07    68.8   1.8
  v.0 LEAP at 30°               120g   40mm  30°  0.67    27.2   5.8
  v.0 LEAP at 45°               120g   40mm  45°  0.63    23.5   10.0
  v.1 LONG JUMP at 45°           90g   150mm 45°  1.21    66.2   37.5
  v.1 LONG JUMP at 30°           90g   150mm 30°  1.30    76.5   21.7

03 // FINDINGS
  F1. SPEC CONFLICT — THE LEAP BIAS ANGLE.
      Spec §03 biases the hop 5-15° off vertical (launch angle
      75-85° from horizontal), which yields almost no range: at 80°,
      R = v²·sin2θ/g ≈ 0.34·v²/g, so 40 mm needs v ≈ 1.07 m/s and ~69 mJ.
      Read the other way (5-15° above horizontal) the same 40 mm needs
      ~69 mJ and rises under 2 mm — a skid, not a leap. Either reading is
      inefficient. RECOMMENDATION: the
      LEAP launch angle is 30-45° above horizontal; this cuts launch energy
      ~60% (69 → 24-27 mJ) and gives a visible 6-10 mm arc. Amend spec §03.
  F2. HOP is cheap: 11.8 mJ, 0.44 m/s, impulse 0.053 N·s at 120 g. A 25-30 g
      reaction mass needs ≈1.8-2.1 m/s stroke-end velocity (momentum
      conservation); at a 5 mm voice-coil stroke that is ≈ 0.4-0.5 ms of
      acceleration-limited travel — a force-limited design, not energy-limited.
      The coil must be sized on peak force (~100-130 N), not on mJ.
  F3. v.1 LONG JUMP needs ≈ 66-77 mJ at 90 g — ~6× the v.0 hop. Mass
      reduction 120→90 g alone saves only 25%; stroke length and spring
      storage must carry the rest. Spring-storage (cam-latched) launch is
      favoured over direct voice-coil drive at this energy.
  F4. EDGE MARGIN. Spec §03 inhibits at 20 mm from an edge. LEAP lands 40 mm
      away with unmodelled scatter; with 20 mm margin the cube can overshoot
      by a full 20 mm without refusing. RECOMMENDATION: inhibit margin =
      commanded displacement + 3σ landing scatter (provisionally 40 + 30 =
      70 mm for LEAP), keep 20 mm for in-place HOP.
  F5. v.2 TABLE-WALKING is power-bounded by the Qi pad: 5 W class at ~70%
      efficiency, and a 70 mJ hop every 2 s is only ~35 mW average — power is
      not the constraint; cell cycle life (≥ 500 hop gate) and shell impact
      survival are.

04 // CHANGES PROPOSED TO SPEC 0.1 (FOR S-2 APPROVAL, NOT YET APPLIED)
  1. §03: launch angle 30-45° above horizontal for THE LEAP.
  2. §03: edge-inhibit margin scaled to commanded gesture (F4).
  3. §06 v.0 gate: add launch-velocity measurement (high-speed video or
     IMU peak accel) to the 500/500 cycle log so F1-F3 are validated.

05 // NEXT CYCLE
  Bench plan: 3D-printed 45 mm shell + off-the-shelf voice coil, measure rise
  vs drive current; verify F2 force estimate. Open questions: elastomer
  foot restitution on wood/glass/laminate; piezo bimorph authority at
  ~1 g payload shifts (it may be too weak to bias a 120 g body — F1 suggests
  angling the coil axis mechanically instead).

06 // CONSUMER USE CASES (CUMULATIVE — ONE NEW PER REPORT)
  USE CASE 01 — THE DESK MIGRATION: see spec v0, §07 (2026-07-28).

  USE CASE 02 — THE BEDSIDE SUNRISE                          2026-10-06
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, shift-work parent, phone banished from
  the bedroom to protect sleep; CUBIQ sits on its charging pad on the
  nightstand.

  A phone alarm drags the operator into the feed before they are awake.
  Instead, at the wake window the operator chose, the cube performs THE
  NUDGE — a tremor through the nightstand, too soft for a partner to hear.
  If there is no response, it escalates to a single THE HOP, then waits.
  It never repeats faster than once a minute and never lights the room:
  the LED ring is off by design (spec §02). Silence is the default.

  When the operator reaches out and moves the cube, the IMU reads the touch
  (spec §03 sensing stack) and the cube goes quiet — dismissal is the
  physical act of picking up the object. The Memory Engine's question for
  the day is held until the operator opens the cubic at breakfast, so the
  first thing they receive from LOT® is not a demand.

  Hardware constraints this exposes: (a) edge safety is critical on a
  nightstand — a 70 mm inhibit margin (F4) makes the cube refuse to hop on
  a narrow surface and fall back to the NUDGE; (b) acoustic noise of the
  hop landing must be < 30 dBA, a new requirement added to the v.0 gate
  list; (c) a nightstand lamp or book breaks the flat-surface assumption,
  so the ToF sensor must also gate on obstacles, not only edges.

07 // STATUS LEDGER
  v.0 spec 0.1 ............ on record
  Energy budget (this) .... done, analytical
  Spec amendments ......... PROPOSED, awaiting S-2
  Prototype hardware ...... none
  Levitation (v.3) ........ research track, no change

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
================================================================================
