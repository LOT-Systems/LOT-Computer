================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report, Cycle 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-02
VERSION:  0.2 — PHYSICS AUDIT + SPEC TIGHTENING
STATUS:   v.0 — PRE-HARDWARE, DESIGN LOCK STILL PENDING
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing, in this order:

  1. docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md (my own cycle-01 spec,
     2026-07-28). Sections 01-08, including Use Case 01.
  2. docs/corporate/LOT-CUBIQ-VISION.md §05 — physical products as the
     "inevitable step"; the cubic completed in the real world.
  3. docs/corporate/LOT-CUBIQ-OPERATOR.md §02-04, §07 — the 5-11 minute
     session, Self-Care module (BREATHE 4-2-6), Phase 4 physical extension.
  4. docs/corporate/LOT_QI46_ENGINE.md — the only prior technical mention
     of the Quantum Cube (piezoelectric, nano-ceramic; Month-12 sync as
     an INPUT device).
  5. docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md — LOT® Institute (CQGS)
     row "Quantum Cube Hardware | PLANNED".
  6. docs/corporate/LOT_ROBOTICS_COSMO.md and docs/benchmark/LOT-MANIFEST.md
     — COSMO® hardware is a sibling track; no naming collision.

Repository state: cycle 01 is on master. No prior cycle-02 document exists.

--------------------------------------------------------------------------------
01 // CYCLE 02 SUMMARY
--------------------------------------------------------------------------------

Cycle 01 wrote the architecture in words. Cycle 02 puts numbers under it.
No hardware exists yet, so everything below is first-order physics, not
measurement, and is labelled as such. Four things came out of it:

  A. The cycle-01 THE LEAP target (40 mm displacement) is consistent with
     a 15° bias but needs ~37 mm of rise. Spec wording tightened (§02).
  B. A concrete energy and capacitor budget for the actuator (§03).
  C. Two sensing gaps: IMU range at landing, and the edge sensor's field
     of view (§04). Both are fixable but must be in the design lock.
  D. A new gesture, THE PACER, and Use Case 02 (§06), requiring no new
     hardware.

--------------------------------------------------------------------------------
02 // FIRST-ORDER BALLISTICS (g = 9.81 m/s², flat surface, no drag)
--------------------------------------------------------------------------------

  GESTURE / TARGET            MASS    BIAS FROM  LAUNCH  PEAK    KINETIC
                                      VERTICAL   SPEED   RISE    ENERGY
  ─────────────────────────   ─────   ─────────  ──────  ──────  ───────
  THE HOP    (10 mm rise)     120 g   0°         0.44    10 mm   11.8 mJ
  THE LEAP   (40 mm range)    120 g   15°        0.89    37 mm   47 mJ
  THE LEAP   (40 mm range)    120 g   10°        1.07    57 mm   69 mJ
  THE LEAP   (40 mm range)    120 g   5°         1.50    114 mm  136 mJ
  v.1 LONG JUMP (150 mm)       90 g   30°        1.30    65 mm   77 mJ
  v.1 LONG JUMP (150 mm)       90 g   45°        1.21    38 mm   66 mJ

  FINDINGS
    - The cycle-01 bias of "5-15° off vertical" is a wide band. At 5° a
      40 mm range costs 114 mm of rise — 2.5 cube-heights. THE LEAP is
      therefore spec'd at 15° bias, ~37 mm rise, ~0.17 s flight.
    - Bias controls energy per unit range. The v.0 piezoelectric bias
      element should be validated at its 15° setting first; lower biases
      are not worth building until 15° is proven.
    - v.1 long jump is cheaper per mm at a flatter launch (45° class)
      than the v.0 near-vertical bias. v.1 therefore changes the bias
      mechanism, not just the stroke; the cycle-01 roadmap said "re-tuned
      stroke, same architecture" and should be read with this caveat.

--------------------------------------------------------------------------------
03 // ACTUATOR ENERGY BUDGET
--------------------------------------------------------------------------------

Assumption: 30% electrical-to-kinetic efficiency end to end. This is a
placeholder to be replaced by bench data; it is not a measured value.

  THE LEAP (47 mJ kinetic)   → ~157 mJ electrical per leap.
  Capacitor bank at 5 V      → C = 2E/V² ≈ 12.6 mF (rounded: 15 mF).
  Peak power over a 5 ms
  stroke                     → ~9-10 W kinetic, ~31 W electrical.

  CONCLUSION
    A 3.7 V Li-ion cell cannot deliver 31 W peaks at the wireless-charge
    trickle rate, and should not be asked to. Architecture: small cell
    → boost converter → supercap/capacitor bank → coil driver. The bank
    is charged slowly between gestures, then dumped in one stroke. The
    bank charge time (not the battery capacity) sets the minimum interval
    between leaps — a design parameter to be fixed after bench test; a
    sensible v.0 policy is "no more than one LEAP per 30 s," which is
    also a notification-etiquette limit, not only an electrical one.
  Battery energy is not the constraint: 157 mJ per leap is trivial against
  even a 100 mAh cell, so leap count per charge is not a v.0 risk.

--------------------------------------------------------------------------------
04 // SENSING AND SAFETY GAPS FOUND
--------------------------------------------------------------------------------

  GAP 1 — IMU RANGE AT LANDING
    Landing vertical speed on THE LEAP ≈ 0.86 m/s. Over a ~3 mm elastomer
    foot compression that is ~12 g average, ~20 g peak (half-sine
    estimate). A typical ±16 g MEMS accelerometer will clip on the
    landing. Clipping is acceptable for detecting that a landing happened,
    but not for logging impact severity for the QI·46 telemetry loop.
    ACTION: spec a second, high-g accelerometer (±100 g class) or accept
    a "landed / not landed" signal only. Decision required at design lock.

  GAP 2 — EDGE SENSOR FIELD OF VIEW
    Cycle 01 specifies a forward-facing time-of-flight sensor on the base
    face and a 20 mm margin. A THE LEAP carries 40 mm, so the sensor must
    resolve a missing surface at ≥ 60 mm ahead plus tolerance. A single
    forward ray on the base face is also blind to the cube's yaw after a
    prior landing: if the cube has rotated, "forward" is no longer the
    direction it was last aimed.
    ACTION: use a multi-zone ToF (grid class) angled downward, and add a
    sensor on at least two adjacent faces until v.2 gives full coverage.
    Until then the hop-on-the-spot gesture (no bias) is the only gesture
    allowed when yaw is unknown.

  GAP 3 — FIRST-USE CALIBRATION
    The cube has never seen the operator's surface. Surface friction and
    compliance change landing displacement and recovery. Cycle 01 only
    gates 500 cycles on one surface.
    ACTION: a mandatory first-use "calibration hop" at zero bias, edge
    sensor ON, on the charging pad, before any biased gesture is enabled.

  Safety remains a hard gate: the 100/100 edge-approach rule from cycle 01
  is unchanged.

--------------------------------------------------------------------------------
05 // UPDATED v.0 DESIGN-LOCK CHECKLIST
--------------------------------------------------------------------------------

  [ ] Mass ≤ 120 g with capacitor bank included (bank adds mass — verify)
  [ ] Bias fixed at 15° for THE LEAP; lower bias not built
  [ ] Boost → capacitor bank → coil driver power path
  [ ] LEAP rate limit: ≤ 1 per 30 s (software + hardware interlock)
  [ ] IMU range decision (Gap 1)
  [ ] Multi-zone downward ToF on ≥ 2 faces (Gap 2)
  [ ] Zero-bias calibration hop at first use (Gap 3)
  [ ] Efficiency measured on a bench coil, replacing the 30% assumption
  [ ] 500/500 hop-and-recover gate (unchanged from cycle 01)
  [ ] Wireless charge pad flatness spec (it is the table for v.0)

--------------------------------------------------------------------------------
06 // CONSUMER USE CASE 02 — THE BREATH PACER                  2026-10-02
--------------------------------------------------------------------------------

Operator profile: Usership tier, Archetype "Rhythm Architect," screen-heavy
workday. Uses the Self-Care module but dismisses it, because it sits on the
same screen that is causing the load.

SCENE
  15:40. The Energy Capacitor drops below threshold and the Self-Care
  module selects BREATHE (the 4-2-6 exercise, as in /breathe). Under the
  software-only cubic this is a card on a tired screen.

  With CUBIQ: the cube performs THE SETTLE (2 s of presence), then THE
  PACER. THE PACER is built entirely from the existing sub-threshold
  NUDGE primitive:

      INHALE   4 s   pulse amplitude ramps up
      HOLD     2 s   amplitude flat
      EXHALE   6 s   amplitude ramps down to zero
      = 12 s cycle, repeated 3 times (36 s), then silence

  The operator rests a wrist on the desk, closes their eyes, and breathes
  with a rhythm felt through the wood. No screen is opened.

WHY IT IS A v.0 USE CASE
  No liftoff and no locomotion, so the edge-safety hazard does not apply.
  It only needs low-amplitude controllability of the voice-coil, which v.0
  has to prove anyway. It is also the lowest-risk way to put a v.0 unit in
  front of a real operator before the hop is certified.

NEW REQUIREMENT IT CREATES
  Amplitude resolution: the actuator driver must produce at least 8
  distinct amplitude steps between "imperceptible" and the Nudge ceiling.
  Added to the design-lock checklist as a bench-test item: ≥ 8 steps,
  repeatable across 100 consecutive cycles.

TELEMETRY (QI·46 loop, as in cycle-01 §05)
  IMU damping signature (hand on desk vs. not), early abort of the
  cycle, and next-day Energy Capacitor recovery feed "haptic preference."

BOUNDARY
  Wellness pacing only. No medical or clinical claim is made for this
  gesture, and none should be added in marketing copy.

--------------------------------------------------------------------------------
07 // ROADMAP DELTA
--------------------------------------------------------------------------------

  v.0  Add THE PACER to the gesture vocabulary (five gestures).
       Design-lock checklist above replaces the cycle-01 implied list.
  v.1  Long jump needs a flatter-launch bias mechanism (see §02);
       roadmap wording corrected. Target and gate unchanged.
  v.2  Surface locomotion: Gap 2 sensor coverage and Gap 3 calibration
       become prerequisites, not options.
  v.3  Levitation: no change. Still a research track, no mechanism
       committed. One note for the Institute: any levitating design must
       also carry the rate-limit and edge-safety logic, because a
       cube falling from a levitation field is a worse failure than one
       hopping off a desk.

--------------------------------------------------------------------------------
08 // CAVEATS
--------------------------------------------------------------------------------

  - All numbers are first-order estimates assuming no air drag, no
    rotation, a rigid-body hop, and an assumed 30% efficiency. They size
    the design; they do not validate it.
  - No prototype exists. Nothing here claims a working mechanism.
  - Landing g-forces assume ~3 mm foot compression; real elastomer
    behaviour must be measured.

--------------------------------------------------------------------------------
09 // NEXT CYCLE (SEED FOR CYCLE 03)
--------------------------------------------------------------------------------

  1. Bench plan for the voice-coil: efficiency, amplitude steps, thermal.
  2. Mass budget table, part by part, against the 120 g target.
  3. Use Case 03 — candidate: the cohort resonance ping (two operators in
     a cohort, one cube each), to exercise the Section 04 trigger that is
     not yet covered.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
================================================================================
