================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report, Cycle 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-04
VERSION:  0.2 — PHYSICS BUDGET + VALIDATION PLAN
STATUS:   v.0 — PRE-HARDWARE. DESIGN LOCK STILL PENDING (see 05)
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing (Cycle 02):

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md   (Cycle 01, 2026-07-28)
    The v.0 spec: 45mm / <120g cube, voice-coil + piezo-bias hop, IMU
    landing recovery, ToF edge gate, four gestures (NUDGE, HOP, LEAP,
    SETTLE), roadmap v.0 -> v.3, Use Case 01 "The Desk Migration".
  docs/corporate/LOT-CUBIQ-VISION.md      Section 05, physical products.
  docs/corporate/LOT-CUBIQ-OPERATOR.md    Section 04, Phase 4 (Days 90+).
  docs/corporate/LOT_QI46_ENGINE.md       Piezo / nano-ceramic / haptic line;
                                          Month-12 cube-as-input milestone.
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md   Quantum Cube Hardware: PLANNED.

State found: one spec, no numbers behind it. Cycle 01 stated targets
(<10mm rise, ~40mm LEAP displacement, >150mm long jump) without checking that
they are mutually consistent with the mass and the bias angle. This cycle does
that check, and it changes the spec.

--------------------------------------------------------------------------------
01 // FINDING 1 — THE LEAP AS WRITTEN IS NOT A HOP
--------------------------------------------------------------------------------

Ballistic model, flat surface, launch at angle phi off vertical, vertical
launch speed vz, rise h = vz^2/2g, range R = 4 h tan(phi).

Cycle 01 gives the piezo bias as 5-15 deg off vertical and the LEAP as
~40mm displacement. Solving for the rise that requires (m = 120 g):

  phi    rise h    launch v   kinetic E   E from battery @30% chain eff.
  ----   -------   --------   ---------   ------------------------------
  15 deg  37 mm    0.89 m/s    47 mJ       157 mJ
  10 deg  57 mm    1.07 m/s    69 mJ       230 mJ
   5 deg 114 mm    1.50 m/s   136 mJ       452 mJ

Reference: the 10mm HOP needs only 11.8 mJ (launch 0.44 m/s, flight ~90 ms).

CONSEQUENCES
  - A 40mm LEAP is a 37-114mm-high flight on a 45mm cube. It is airborne for
    ~175 ms+ and lands at ~0.86-1.5 m/s. That is a jump, not a nudge, and it
    is 4x-10x the energy of the HOP. HOP and LEAP are different actuator
    regimes, not one primitive at two amplitudes.
  - At 5 deg bias the LEAP is unaffordable. The bias element must deliver
    >= 15 deg for the LEAP to stay under ~50 mJ.
  - A 45mm cube landing at ~0.9 m/s with a lateral component tumbles unless
    the feet and the shell absorb it. Landing, not launch, is the v.0 risk.

DECISION (Cycle 02 amendment, supersedes Cycle 01 Sec. 04 numbers)
  - LEAP target: 40mm displacement at 15 deg bias, ~37mm rise, <=50 mJ
    kinetic. Piezo bias spec raised to a 15 deg minimum.
  - HOP stays <10mm rise, ~12 mJ.
  - Separate gate for each; do not validate LEAP by scaling HOP results.

--------------------------------------------------------------------------------
02 // FINDING 2 — v.1 LONG JUMP IS CHEAPER THAN IT LOOKS, IF ANGLE IS FREE
--------------------------------------------------------------------------------

Range scales with launch angle, not just energy. For 150mm at 90 g:

  phi     rise h    kinetic E   from battery @30%
  -----   -------   ---------   ------------------
  20 deg  103 mm    103 mJ      343 mJ   (tall, floaty, high landing speed)
  30 deg   65 mm     77 mJ      255 mJ
  45 deg   38 mm     66 mJ      221 mJ   (cheapest; lowest landing speed)

Landing speed (vertical) at 45 deg is 0.86 m/s, no worse than the v.0 LEAP.
So the v.1 long jump is an angle problem first, an energy problem second:
v.0's single forward-bias piezo cannot reach 45 deg; v.1 needs a tilt
mechanism (movable reaction-mass axis, or a pivoted coil carrier). Record this
now so v.0's coil carrier is designed with a pivot-ready mount (cost: ~1 g).

Energy is not the constraint anywhere in v.0-v.1. A 150 mAh / 3.7 V cell holds
~2.0 kJ; a 255 mJ jump is ~1e-4 of that. Peak current into the coil, and the
storage cap that supplies it, are the electrical constraints, not battery
capacity. Charging via the Qi pad (Cycle 01 Sec. 02) is unaffected.

--------------------------------------------------------------------------------
03 // v.0 ARCHITECTURE — REVISION
--------------------------------------------------------------------------------

  Unchanged: 45mm shell, nano-ceramic, voice-coil primary actuator, 6-axis IMU,
  ToF edge gate, Qi base, LED ring for pairing/charge only.

  Changed:
  1. Piezo bias element >= 15 deg (Finding 1).
  2. Pivot-ready coil carrier (Finding 2) - passive in v.0.
  3. Energy storage: supercap or low-ESR bank sized for 160 mJ burst
     (LEAP at 30% chain efficiency + 2x margin => specify 320 mJ), recharged
     between gestures. Minimum rest time between LEAPs: 2 s; between HOPs: 0.5 s.
  4. Landing: elastomer feet specified by rebound/damping, not just grip;
     target peak landing deceleration < 15 g at 0.9 m/s onto laminate. This
     is a shell-survival and anti-tumble requirement.
  5. Edge gate margin: LEAP displacement is 40mm; Cycle 01's 20mm inhibit
     distance is less than one LEAP. Raise to 40mm + 25mm overshoot allowance
     = 65mm before inhibit for LEAP, 30mm for HOP. Replace with SHUDDER inside
     the margin.
  6. Anti-feed rules, now enforced in firmware spec: no gesture repeats within
     90 s unless the signal class changes; quiet hours default ON 22:00-07:00
     (NUDGE and SETTLE only, never HOP/LEAP); the operator can disable any
     class from the Index of Systems.

--------------------------------------------------------------------------------
04 // VALIDATION PLAN (BEFORE ANY CLAIM OF "v.0 CLOSED")
--------------------------------------------------------------------------------

  Rig: instrumented test bench - high-speed camera (>=1000 fps) over a
  ruled surface; IMU log; coil current log. Three surfaces: oak, glass,
  laminate. 20 deg C +/- 3.

  T1  HOP: 500/500 cycles, rise 8-10mm, in-place landing within 40mm.
  T2  LEAP: 200 cycles per surface, displacement 40mm +/- 10mm, upright
      landing rate >= 95% (self-right counts as failure of first landing,
      success of recovery - log both).
  T3  Recovery: 100 forced off-axis (>25 deg) landings, righted <= 3 pulses.
  T4  Edge gate: 100/100 approach trials at 0/45/90 deg to a table edge, zero
      off-table events. Hard gate, no waiver. (Cycle 01 rule retained.)
  T5  Quiet: NUDGE <= 30 dBA at 0.5 m; HOP/LEAP landing <= 45 dBA at 0.5 m.
  T6  Thermal: coil < 60 deg C surface after a 30-gesture burst.
  T7  Anti-feed firmware: rule tests for Sec. 03.6 pass.

  Status of every item above: NOT RUN. No hardware exists in this repository.
  Nothing in this document is a measured result; all figures are model
  predictions from the ballistic relation in Sec. 01 and should be treated as
  design targets until T1-T7 are run.

--------------------------------------------------------------------------------
05 // OPEN ITEMS / RISKS
--------------------------------------------------------------------------------

  R1  Reaction-mass launch: the model assumes the stated kinetic energy reaches
      the shell. A spring-loaded internal mass transfers only the share set by
      the mass ratio; a 120 g cube needs a reaction mass of roughly 15-25 g
      stroking several mm. Full coupled model is a Cycle 03 deliverable.
  R2  Piezo bimorph timing: it fires "a millisecond after release" - at that
      scale it acts on a body already accelerating. Whether a bimorph can supply
      15 deg of bias is unproven; fallback is an angled coil axis (fixed bias,
      gesture-selectable by flipping the orientation at SETTLE).
  R3  Surface variance: friction on glass vs laminate may dominate displacement
      error more than launch speed does.
  R4  Safety/regulatory: a self-moving consumer object needs a child/pet
      assessment and an edge-fall failure analysis before any field unit.
  R5  Levitation (v.3) remains research only. No mechanism claim is made.
      The power-surface-as-table architecture is retained so that either
      acoustic or magnetic options stay open.
  R6  COSMO® Cube is a separate track (see LOT-MANIFEST.md). No shared naming.

--------------------------------------------------------------------------------
06 // CYCLE 03 PLAN
--------------------------------------------------------------------------------

  1. Coupled reaction-mass model (R1) with spreadsheet/script in repo.
  2. Bench rig bill of materials and a first coil + carrier drawing.
  3. Firmware gesture-state-machine spec, mapped to Index of Systems signals.
  4. Use Case 03.

--------------------------------------------------------------------------------
07 // CONSUMER USE CASE — CYCLE 02
--------------------------------------------------------------------------------

  USE CASE 02 — THE NIGHT-SHIFT PARENT                      2026-11-04
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, parent of an infant, works evenings from a
  kitchen counter while the household sleeps. The CUBIQ pad sits on the
  counter. The operator's Memory Engine profile carries the theme the LOT®
  corpus calls "parental loneliness" - the need to parent oneself while
  parenting.

  Problem with software-only: a phone chime in a quiet house wakes the child
  and spikes the operator's stress; silencing the phone also silences
  everything that mattered. A lit screen at midnight is a scroll invitation.

  With CUBIQ v.0 under Sec. 03.6 quiet-hours rules: after 22:00 the cube is
  limited to THE NUDGE and THE SETTLE. When the Memory Engine has a question
  ready, the cube gives one NUDGE - a tremor through the counter, under the
  operator's forearm, below 30 dBA. No light, no sound the baby hears. When the
  operator finishes the bottle and sits, THE SETTLE answers: two seconds of
  steady presence, no motion. They open the cubic for a 5-minute session.
  The cube never hops, never repeats inside 90 s, and its edge gate keeps it
  from ever approaching the counter's edge at 2 a.m.

  Telemetry returns (Sec. 05 loop of Cycle 01) record that the operator
  responded to NUDGE within 6 minutes on 5 of 7 nights, and that no HOP was
  suppressed because none was permitted. The notification fits the room
  instead of overriding it.

  Why this case matters to the design: it is the use case that justifies the
  quiet-hours rule and the SHUDDER/NUDGE tier as first-class features, not
  fallbacks. The parent doesn't want a clever jumping cube at 2 a.m.; they
  want the cube to know when not to jump.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
================================================================================
