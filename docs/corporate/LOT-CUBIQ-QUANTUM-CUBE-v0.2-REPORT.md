================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0.2-REPORT
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Engineering Cycle 02
          Physics Validation, Spec Errata, Actuator Re-Selection, Use Case 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-24
VERSION:  0.2 — SUPERSEDES NOTHING; CORRECTS 0.1 WHERE STATED (SECTION 03)
STATUS:   v.0 — PRE-HARDWARE, DESIGN LOCK STILL PENDING (NOW 4 OPEN DECISIONS)
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read in full before writing (per the standing rule in v0 §07):

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md   (2026-07-28, cycle 01 — the spec)
  docs/corporate/LOT-CUBIQ-VISION.md            (2026-06-23, the thesis)
  docs/corporate/LOT-CUBIQ-OPERATOR.md          (Index of Systems, Phase 4)
  docs/corporate/LOT_QI46_ENGINE.md             (line 110 materials; 750-764 loop)
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md   (line 180 hardware row)
  docs/benchmark/LOT-MANIFEST.md                (COSMO® Cube is a separate track)

Cycle 01 produced the architecture. It stated its targets (45mm cube, <120g,
~40mm Leap, <10mm Hop, 20mm edge inhibit, piezo bias 5-15°) but never ran
the numbers on them. Cycle 02 does, using plain ballistics. Method and
assumptions are in Section 02 so any engineer can reproduce them.

NO HARDWARE EXISTS YET. Every figure below is a first-principles calculation
or an estimate, labeled as such. Nothing here is a measurement.

--------------------------------------------------------------------------------
01 // EXECUTIVE SUMMARY
--------------------------------------------------------------------------------

  1. The v0.1 targets are individually reasonable but not mutually
     consistent. Three of them conflict (Section 03, ERRATA E1-E3).
  2. A 40mm Leap with a 10° forward bias needs a ~57mm rise and 0.13 N·s of
     impulse. A 40mm Leap at a 15° bias needs ~37mm rise. The "<10mm" rise
     belongs to THE HOP only, and the gesture table must say so.
  3. The edge-inhibit distance (20mm) is SHORTER than the Leap's own range
     (40mm). As written the safety gate would let the cube leap off the
     table. This is the most important correction in this report.
  4. A voice coil alone must deliver ~16 N average force for ~8ms inside a
     45mm cube. That is a stretch. A spring-and-latch stored-energy jumper
     is the better primary candidate for the Leap; the voice coil stays for
     Nudge and Settle (Section 04).
  5. The piezo bimorph cannot plausibly steer the launch by 5-15°. A canted
     thrust axis does it passively. Piezo stays as an experiment (Section 04).
  6. The Leap is one-way. After leaping 40mm the cube is off the Qi coil and
     cannot return until v.2. Use Case 01 depends on this; it needs a note
     (E4) rather than a rewrite.
  7. New consumer use case added: USE CASE 02 — THE NIGHTSTAND SETTLE.

--------------------------------------------------------------------------------
02 // BALLISTIC MODEL (REPRODUCIBLE)
--------------------------------------------------------------------------------

  Assumptions: flat level surface; launch and landing at same height; drag
  ignored (negligible at ~1 m/s); g = 9.81 m/s²; launch angle measured as
  "bias" off vertical, so launch elevation = 90° − bias.

    range   R = v²·sin(2θ)/g          θ = 90° − bias
    rise    h = (v·sinθ)²/(2g)
    energy  E = ½·M·v²                (kinetic, at liftoff)
    impulse J = M·v
    flight  t = 2·v·sinθ/g

  THE HOP (<10mm rise, M = 120g)
    v = √(2·g·h) = 0.44 m/s        E ≈ 11.8 mJ        J ≈ 0.053 N·s
    Trivial. Any candidate actuator clears this.

  THE LEAP (R = 40mm, M = 120g)
    BIAS   v (m/s)   RISE (mm)   E (mJ)   J (N·s)   FLIGHT (ms)
     5°     1.50      114.3      135.6     0.180      305
    10°     1.07       56.7       68.8     0.129      215
    15°     0.89       37.3       47.1     0.106      174

  v.1 LONG JUMP (R = 150mm, M = 90g)
    BIAS   v (m/s)   RISE (mm)   E (mJ)   J (N·s)   FLIGHT (ms)
    15°     1.72      140.0      132.4     0.154      338
    30°     1.30       65.0       76.5     0.117      230
    45°     1.21       37.5       66.2     0.109      175

  Reading the tables:
    - A shallow bias is cheaper in energy but a steep bias keeps the cube
      upright-ish and the landing short. 15° is the sweet spot for the Leap:
      lowest energy (47 mJ), lowest rise (37mm), shortest airtime.
    - The 150mm long jump at the v0.1 bias (≤15°) needs 140mm of rise and
      ~2.8× the Leap's energy. That is a very tall, tumble-prone arc for a
      cube. Reaching 150mm sanely needs 30-45° elevation off vertical —
      a launch-angle mechanism v0.1 did not budget for (E5).

--------------------------------------------------------------------------------
03 // ERRATA TO v0.1 (APPEND-ONLY: v0.1 TEXT IS NOT EDITED)
--------------------------------------------------------------------------------

  E1  RISE vs RANGE.  v0.1 §04 lists THE HOP at <10mm rise and THE LEAP at
      ~40mm displacement without a rise figure. A 40mm Leap is a 37-57mm
      rise (15°-10° bias). The Leap is therefore ~4-6× the height of the
      Hop, not "full-amplitude hop." Ship the table with both numbers.

  E2  EDGE INHIBIT (SAFETY, BLOCKING).  v0.1 §03 inhibits the actuator when
      a hop would land within 20mm of an edge. The Leap travels 40mm, plus
      landing dispersion and a slide on the elastomer feet. Required rule:

          inhibit if  d_edge  <  R_gesture + 3σ_landing + slide_margin

      with provisional values R=40, 3σ=15, slide=10  →  inhibit under 65mm
      for the Leap; keep ~25mm for the Hop. The ToF must also look in the
      Leap's heading, which in v.0 is fixed to the cube's canted axis — so
      "forward" is a physical face and the cube must know which face it is
      on after landing (IMU yaw reference, no magnetometer needed since the
      pad/keyed base fixes it). The 100/100 edge gate stands, but must be
      run at the Leap, not the Hop.

  E3  MASS vs DISPLACEMENT.  Not a contradiction at 120g (Section 02), but
      v0.1 §01 says v.1 reaches 150mm by "longer coil stroke and lighter
      shell." The tables show the real lever is launch angle, not stroke.

  E4  ONE-WAY LEAP / CHARGING.  v0.1 §02 makes the Qi pad "the table."
      Qi alignment tolerance is on the order of ±10mm (typical, check the
      chosen coil). After a 40mm Leap the cube is off the coil with no way
      back until v.2. Options: (a) pad wider than the leap envelope with a
      multi-coil array; (b) Leap used only when the operator is present and
      expected to reset the cube (USE CASE 01 already implies this);
      (c) cap v.0 Leap displacement to the coil tolerance and treat 40mm as
      v.1. RECOMMEND (a)+(b). Needs S-2 decision (Section 07, D1).

  E5  v.1 REQUIRES A LAUNCH-ANGLE MECHANISM.  See Section 02. The v.1
      "same architecture, re-tuned" statement should read "same actuator,
      plus an adjustable thrust axis (two detent angles are enough)."

--------------------------------------------------------------------------------
04 // ACTUATOR RE-SELECTION
--------------------------------------------------------------------------------

  THE PROBLEM
    A 12 mJ Hop is easy. A 47-69 mJ Leap delivered through a short stroke is
    not. If the push happens over ~8ms (stroke on the order of 8mm at ~1 m/s
    mean tip speed), mean force ≈ J/t = 0.129 / 0.008 ≈ 16 N, with a peak
    near twice that for a half-sine pulse. The cube weighs 1.2 N. A voice
    coil producing >15 N out of a ~45mm package with a ~120g budget is
    outside normal small voice-coil territory, and it would draw several
    amps from a battery that cannot supply them directly.

  RECOMMENDED SPLIT (all estimates, to be bench-validated)

    GESTURE        ACTUATOR                                   ENERGY
    THE NUDGE      voice coil, sub-lift-off pulse              <2 mJ
    THE SETTLE     voice coil, held pressure                   <1 mJ avg
    THE HOP        voice coil, short stroke                    ~12 mJ
    THE LEAP       torsion/compression spring + micro-latch    47-69 mJ
                   (small motor or SMA wire cocks the spring
                   slowly; a tiny solenoid or SMA release
                   frees it in <1ms)

    Why: this is the same energy-storage trick used by small jumping robots
    — charge slowly at low power, release fast. Cocking energy of ~0.1-0.3 J
    over 1-2 seconds is ~0.1-0.3 W, well inside a small battery's limits.
    The release is a tiny actuator doing almost no work. Cost: a ~1-2s
    "wind-up" before the Leap (a feature: the operator hears and feels it
    coming), one more moving part, and a reset step on landing.

  POWER BUDGET (ESTIMATE, η = 25% end-to-end)
    Leap electric energy ≈ 69 mJ / 0.25 ≈ 0.28 J.
    Cocking via small motor: ~0.2 W for ~1.5s. No capacitor bank required.
    If the voice-coil-only route is kept instead: a ~4 mF capacitor at 12V
    (E=½CV² ≥ 0.28 J) supplies the pulse, charged between gestures.
    Battery: a ~100-150 mAh 1S LiPo (≈0.4-0.55 Wh) supports on the order of
    1,000+ Leaps per charge by energy alone; standby draw (BLE, IMU, ToF)
    sets runtime, not actuation. Standby must be sub-1 mW-class to reach
    multi-day life without charging; that is a firmware target, not a given.

  PIEZO BIAS ELEMENT (v0.1 §03)
    A bimorph strip moves micrometres to a fraction of a millimetre. It can
    add a tiny lateral kick but not steer a 120g body by 5-15°. Baseline:
    tilt the thrust axis 10-15° off the shell's vertical axis, so the bias
    is geometry, not electronics. Keep the piezo as an experiment for
    fine yaw/pitch trim and as a contact/landing sensor — the latter fits
    the QI·46 "haptic preference" telemetry (QI46 line 757) well.

  LANDING
    Touchdown speed equals launch speed (~0.9-1.1 m/s for the Leap). The
    ~47-69 mJ must be dumped by the four elastomer feet and the shell. Bench
    item: drop-test the nano-ceramic shell and feet from 40-60mm onto wood,
    glass, laminate, 1,000 cycles, inspecting for chipping and bounce
    rebound. Rebound can exceed the edge margin on glass.

  ACOUSTICS
    A 60 mJ impact is an audible click. THE NUDGE and THE SETTLE remain the
    only truly silent gestures. Quiet hours should disable Hop and Leap by
    default (see USE CASE 02).

--------------------------------------------------------------------------------
05 // SUBSYSTEM STATUS — v.0 AFTER CYCLE 02
--------------------------------------------------------------------------------

  SUBSYSTEM                     v0.1 STATE        v0.2 STATE
  ───────────────────────────   ───────────────   ─────────────────────────
  Shell / form factor           specified         unchanged
  Hop actuator (voice coil)     specified         confirmed adequate (12 mJ)
  Leap actuator                 voice coil        CHANGED: spring + latch
  Thrust-axis bias              piezo             CHANGED: canted axis; piezo
                                                  demoted to experiment
  Landing recovery (IMU)        specified         unchanged; add yaw ref
  Edge detection                20mm, forward     CHANGED: ≥65mm Leap rule
  Charging                      Qi pad = table    OPEN: leap leaves the coil
  Gesture vocabulary            4 gestures        4 gestures, +rise column
  Telemetry loop to QI·46       specified         unchanged
  Test plan                     500 cycles gate   expanded (Section 06)

--------------------------------------------------------------------------------
06 // TEST PLAN (PRE-HARDWARE, DEFINES WHAT "DONE" MEANS)
--------------------------------------------------------------------------------

  T1  Ballistics rig: 120g mock cube, canted thrust, high-speed camera
      (240 fps phone is enough). Gate: measured range within ±25% of
      Section 02 at 3 settings (5°, 10°, 15°).
  T2  Landing dispersion: 100 Leaps, record landing point and heading.
      Output: measured σ for E2. Until measured, 3σ=15mm is a placeholder.
  T3  Edge refusal: 100/100 Leap-approach trials at the E2 inhibit
      distance, on wood, glass, laminate. Zero off-table events. (Hard gate.)
  T4  Rebound and shell survival: 1,000 landings per surface.
  T5  Wind-up cycle: 1,000 cock-and-release cycles; latch must not
      double-fire or stick.
  T6  Standby power: measured µA-class draw with BLE advertising + IMU
      wake-on-motion; projects days of runtime on the chosen cell.
  T7  v.0 close gate (unchanged from v0.1): 500/500 hop-and-recover cycles,
      zero off-table landings, zero actuator failures.

--------------------------------------------------------------------------------
07 // OPEN DECISIONS FOR S-2
--------------------------------------------------------------------------------

  D1  Charging vs Leap (E4): wider multi-coil pad, or Leap = operator-reset?
  D2  Adopt the spring-and-latch Leap actuator (Section 04)?
      Recommended: yes. Changes the mechanical BOM and adds a 1-2s wind-up.
  D3  Leap bias target: 10° (57mm rise, 0.13 N·s) vs 15° (37mm, 0.11 N·s).
      Recommended: 15°. Lower energy, lower arc, lower tumble risk.
  D4  Quiet-hours default: Hop/Leap off, Nudge/Settle only? Recommended: yes.

--------------------------------------------------------------------------------
08 // ROADMAP DELTA
--------------------------------------------------------------------------------

  v.0  Closed by T7 after D1-D4 are decided. Hop + Nudge + Settle are
       low-risk and can be prototyped first; Leap follows once T1-T3 pass.
  v.1  Re-scoped: requires adjustable thrust axis (E5). Gate unchanged.
  v.2  Table-walking. Also solves E4 (the cube can walk back to the pad).
  v.3  Levitation research track — no change; still not a build milestone.

--------------------------------------------------------------------------------
09 // CONSUMER USE CASES — INDEX
--------------------------------------------------------------------------------

  The full text of every use case lives in LOT-CUBIQ-QUANTUM-CUBE-v0.md §07
  (append-only). This cycle's entry is reproduced here for the reader.

  USE CASE 01 — THE DESK MIGRATION                          2026-07-28
    Memory question ready → NUDGE through the desk; LEAP toward the
    keyboard when the session opens. (See v0 §07.)
    v0.2 NOTE: depends on the one-way Leap (E4). The operator moves the
    cube back to the pad, or the wider pad (D1) keeps it in charge range.

  USE CASE 02 — THE NIGHTSTAND SETTLE                       2026-10-24
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, evening user trying to retire the
  phone-in-bed habit. The CUBIQ pad sits on the nightstand, a small
  surface with an edge close by. The phone charges in another room.

  The problem it solves: the last ten minutes before sleep are where a
  feed does the most damage. Even a "do not disturb" phone invites a
  glance. A lit screen on the nightstand is the thing the operator is
  trying to remove.

  What the cube does: nothing visible. At the operator's chosen wind-down
  time, once the evening close of the Assembly phase advances, the cube
  performs THE SETTLE (v0 §04) — a two-second standing pressure felt
  through the nightstand and, if a hand rests on it, in the fingertips. No
  light, no sound. It means: "the day is closed; nothing is owed." A
  second Settle, ten minutes later, fires only if the operator's day
  carries an unfinished item, and even then it is a Nudge, not a leap.

  The hard rules this case enforces:
    - Quiet hours: Hop and Leap are disabled by default (D4). The only
      gestures allowed after the wind-down time are Nudge and Settle.
    - Edge: a nightstand is a small, high-risk surface. The cube's edge
      inhibit (E2) means that even if an operator overrides quiet hours, the
      cube refuses to leap and substitutes a shudder.
    - No LED: the base ring is dark at night; charge state is not shown.

  Why it is a good consumer use case: the product works by being
  absent. It offers a physical "end of day" ritual without a second screen,
  directly from the anti-feed thesis (CUBIQ-VISION §01). A person can
  explain it in one sentence: "my desk object taps once, and I'm done for
  the day."

  Feedback into QI·46: whether the operator rests a hand on the cube during
  the Settle (IMU micro-damping) is a clean, non-invasive "haptic
  preference" signal for the calibration loop (QI46 line 757).

  Next-cycle candidate (not scheduled): USE CASE 03 — a cohort resonance
  ping between two cubes in different homes. Requires cohort pairing and
  consent design; recorded here so the next session starts from it.

--------------------------------------------------------------------------------
10 // NEXT CYCLE
--------------------------------------------------------------------------------

  1. Await D1-D4. Without them the Leap cannot be locked.
  2. Produce a mechanical sketch of the canted-axis spring-latch Leap
     module with dimensional fit inside 45mm³ and the 120g budget.
  3. Draft the CUBIQ hardware driver message format (signal → gesture →
     telemetry) as a short interface spec for the QI·46 side.
  4. Append USE CASE 03 to v0 §07.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0.2-REPORT
================================================================================
