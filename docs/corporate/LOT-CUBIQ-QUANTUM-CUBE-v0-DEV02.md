================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-DEV02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-09-30
VERSION:  0.2 — ACTUATION PHYSICS, ENERGY BUDGET, LEVITATION FEASIBILITY
STATUS:   v.0 — DESIGN REVIEW (PRE-HARDWARE). Amends, does not replace, v0.1.
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read in full before writing (all in docs/corporate/ unless noted):

  LOT-CUBIQ-QUANTUM-CUBE-v0.md     v0.1 (2026-07-28). Baseline spec: 45 mm,
                                   <120 g, voice-coil hop + piezo bias, IMU,
                                   ToF edge gate, four gestures, roadmap
                                   v.0→v.3, Use Case 01.
  LOT-CUBIQ-VISION.md              Anti-feed thesis; physical-products arc.
  LOT-CUBIQ-OPERATOR.md            Index of Systems signals; Phase 4 physical.
  LOT_QI46_ENGINE.md               Line 110 (piezoelectric / nano-ceramic /
                                   haptic language) and lines 750-764
                                   (Cube as Month-12 input device). Re-verified.
  CQGS-WHITE-PAPER-SNAPSHOT.md     Lines 32-34, 180. Re-verified.
  docs/benchmark/LOT-MANIFEST.md   COSMO® Cube is a separate track.

Only one prior CUBIQ hardware document exists (v0.1); no earlier DEV report.
Session-level history of my own: v0.1 was written 2026-07-28; this is the
next cycle. v0.1 Section 07 asks each cycle to add one use case and never
edit prior ones. Use Case 02 is appended to v0.1 Section 07 and reproduced in
Section 08 below. Nothing in v0.1 was edited or removed.

--------------------------------------------------------------------------------
01 // WHAT THIS CYCLE DID
--------------------------------------------------------------------------------

v0.1 fixed the architecture on paper. This cycle checks it against physics
before anyone buys parts. Numbers below come from
scripts/cubiq/hop-model.mjs (vacuum ballistics, no drag, no bounce; run it:
`node scripts/cubiq/hop-model.mjs`). They are first-order estimates for
design decisions, not measurements. No hardware exists yet and none was tested.

Findings, most important first:

  F1  The v0.1 actuator (voice coil pushing a reaction mass against the base)
      is the wrong launcher. Replace with spring + latch (Section 02).
  F2  v0.1's "<10 mm HOP" and "~40 mm LEAP" are consistent only if the LEAP
      bias is at the top of the 5-15° range. At 5° the LEAP needs 3× the energy
      and rises 114 mm. Pin the bias at 15° (Section 03).
  F3  Levitation: acoustic is ruled out at cube scale; active magnetic is the
      only credible path, and it also unifies with v.2 lateral motion
      (Section 06).
  F4  Yaw via internal reaction wheel is a simpler v.2 than actuated feet
      (Section 05).

--------------------------------------------------------------------------------
02 // F1 — LAUNCHER: SPRING + LATCH, NOT VOICE COIL
--------------------------------------------------------------------------------

Design target from v0.1: the LEAP, 120 g body, 40 mm range.

  Launch angle 75° (15° bias):  v = 0.886 m/s   body KE = 47 mJ   apex 37 mm

A slug-impact launcher (30 g slug strikes the shell; momentum transfer):

  Slug speed 3.54 m/s, slug KE 188 mJ, efficiency 0.25 (body KE / slug KE).
  Voice-coil mean force over a 15 mm stroke = 12.6 N.

12.6 N sustained over 15 mm inside a 45 mm cube that also holds battery, IMU,
ToF, Qi coil and a 30 g slug is not a plausible voice coil. It is also loud:
a 30 g slug hitting the shell at 3.5 m/s is a knock, which contradicts the
"felt, not heard" register of v0.1 Section 04.

RECOMMENDATION — store energy slowly, release it fast:

  - Micro gearmotor winds a compression/torsion spring over ~1 s.
    Recharge power for 188 mJ in 1.0 s = 0.19 W. Trivial.
  - A small latch (solenoid pin or shape-memory-alloy wire) releases it.
    Latch force is low; the spring does the work.
  - 300 mAh / 3.7 V cell holds ~4.0 kJ. At 25% drivetrain efficiency that is
    ~5,300 leaps per charge (model estimate). Battery is not the constraint.

This is the same principle as small jumping robots (energy stored in a
spring, released through a latch). The Institute-named piezoelectric element
stays, in a better role: it is a fine fast trigger and bias-trim element and a
poor prime mover. Keep it for bias timing (v0.1 Section 03), not for lift.

The NUDGE gesture (sub-threshold tremor) does not need the spring at all: it
is a small eccentric/voice-coil buzz. So v.0 carries two mechanisms:
  (1) spring-latch launcher   → HOP, LEAP
  (2) small linear resonant actuator (LRA) → NUDGE, SETTLE
Two simple parts beat one stretched part. Mass budget below.

MASS BUDGET (target <120 g, first pass; to be replaced by weighed parts)

  Shell, nano-ceramic composite, 45 mm cube, 1.5 mm wall     ~22 g
  Li-Po 300 mAh                                              ~9 g
  Qi receiver coil + board                                   ~8 g
  Gearmotor + spring + latch                                 ~14 g
  LRA (NUDGE/SETTLE)                                         ~3 g
  MCU + IMU + ToF + BLE                                      ~5 g
  Piezo bias element + driver                                ~4 g
  Feet, fasteners, wiring, margin                            ~10 g
  ────────────────────────────────────────────────────────────
  Total                                                      ~75 g

That is under both the 120 g v.0 target and the 90 g v.1 target with room to
spare, which matters: at 90 g the v.1 long jump needs only 66 mJ (Section 04).
The nano-ceramic shell mass is the least certain line; ceramic composites can
be dense. Weigh a shell sample before trusting this table.

--------------------------------------------------------------------------------
03 // F2 — HOP VS LEAP GEOMETRY
--------------------------------------------------------------------------------

  Gesture   Target                         Energy needed   Apex
  ───────   ──────                         ─────────────   ────
  HOP       <10 mm rise, in place          11.8 mJ         10 mm
  LEAP 15°  40 mm range, 75° launch        47.1 mJ         37 mm
  LEAP 5°   40 mm range, 85° launch        135.6 mJ        114 mm

Consequences:
  - The LEAP is not a "bigger HOP". It is a ~37 mm rise with a 15° lean.
    A cube rising 37 mm and translating 40 mm is a real ballistic flight and
    needs a rotation-rate budget (Section 07).
  - A 5° bias makes the LEAP a tall, energetic, scary jump at 115 mm rise.
    Lock the bias at 15° and treat 5° as out of spec.
  - The edge-detection gate (20 mm) in v0.1 must account for the 40 mm LEAP
    range plus landing scatter, plus a tumble/roll allowance. Proposed new
    rule: inhibit LEAP if ToF sees an edge within 100 mm ahead; inhibit HOP
    within 30 mm. (Numbers to be validated in the 100-trial edge test; the
    v0.1 pass criterion of 100/100 stands.)

--------------------------------------------------------------------------------
04 // v.1 LONG JUMP — RE-CHECKED
--------------------------------------------------------------------------------

  90 g body, 150 mm range, 45° launch: v = 1.21 m/s, 66 mJ, apex 37.5 mm.

The energy is small and within the spring-latch budget. The hard part is not
range, it is landing. A 45 mm cube landing at ~1.2 m/s on a hard table will
tumble. v0.1's "60 mm landing zone in 9/10 trials" is therefore mostly a
landing-attitude problem, not a launch problem. Options for v.1:

  a) Rounded/chamfered corners with elastomer bumpers and accept tumbling;
     make every face a valid "top" (IMU tells the MCU which face is up).
  b) Spin-stabilise with the flight wheel from Section 05, landing feet-first.
  c) Passive: heavy base, light top, so the cube self-rights (like a
     weighted toy).
  Recommend (b)+(c). (a) is the fallback and the least "clean" behaviour.

--------------------------------------------------------------------------------
05 // F4 — v.2 STEERING VIA INTERNAL REACTION WHEEL
--------------------------------------------------------------------------------

v0.1 proposes two actuated traction feet for horizontal walking. Simpler:
one small flywheel on the vertical axis.

  - In flight, torque on the wheel yaws the shell (conservation of angular
    momentum). The cube lands with a new heading, then leaps along it.
  - "Turn, then leap" gives a directed traverse without any friction model:
    200 mm traverse = two ~100 mm leaps along the heading.
  - The same wheel provides in-flight attitude control for Section 04 (b).
  - Reference point: research cubes balanced/jumped with reaction wheels
    exist (ETH Zurich "Cubli"); this is a known, feasible class of mechanism
    at larger scale. Scaling to 45 mm is unproven and is the v.2 risk.

The traction-feet path is kept as the fallback. v.2 gate from v0.1 (200 mm,
<15 mm cross-track, 50/50, zero edge incidents) stands unchanged.

--------------------------------------------------------------------------------
06 // F3 — LEVITATION FEASIBILITY (v.3)
--------------------------------------------------------------------------------

v0.1 named two candidate routes. Assessed:

  ACOUSTIC (standing-wave, phased ultrasonic pad)
    Order-of-magnitude, using radiation pressure ~ p²/(ρc²) against the
    weight per 45×45 mm face:
        120 g cube   → ~173 dB SPL
         20 g cube   → ~165 dB SPL
          5 g cube   → ~159 dB SPL
    Even at 5 g these levels are far beyond what is acceptable for a
    consumer desk object. Acoustic levitation works for millimetre-scale
    light particles, not a 45 mm cube. VERDICT: drop from the roadmap for
    the cube. (Estimate is coarse; a real standing-wave design can beat
    it by a factor but not by the ~50 dB needed.)

  ACTIVE MAGNETIC (servo electromagnet array in the pad)
    Earnshaw's theorem forbids passive stable levitation with static
    magnets, so it needs closed-loop control (Hall sensing + coil current
    at kHz rates). Floating display bases and planters at a similar payload
    and 10-20 mm gap are established consumer products, so the core is not
    speculative. Costs to expect: pad power in the watt range while
    levitating, a permanent magnet in the cube, and stray-field limits
    near pacemakers and magnetic media.
    VERDICT: the v.3 mechanism. Sensing (Hall array) and coil layout
    should be prototyped on the pad BEFORE v.2 finishes, since the pad is
    shared.

  UNIFICATION WITH v.2
    A multi-coil planar array can both lift and translate the cube
    (planar-motor style), which makes "swing across the table" a pad
    behaviour rather than a cube behaviour. Long-term this lets the cube
    retire the spring launcher for locomotion and keep it only as the
    "wake" leap. v.3 remains a research track with no gate; a suggested
    first gate is: hold a 120 g dummy body at 10 mm for 10 minutes,
    ±1 mm, under ≤5 W pad power.

  DESIGN CONSEQUENCES FOR v.0 (do now, cost ~nothing)
    - Reserve a 12×12×5 mm cavity centred under the IMU for a future magnet.
    - Keep the IMU magnetometer OFF the BOM (6-axis only, as in v0.1);
      a magnetometer will be useless near a levitation pad.
    - Keep the Qi coil the pad-facing face; leave the pad electronics
      footprint open for a coil array.

--------------------------------------------------------------------------------
07 // SAFETY AND VERIFICATION ADDITIONS
--------------------------------------------------------------------------------

  1. Rotation-rate cap in flight (IMU): abort/soften if gyro exceeds a set
     limit on the first 20 ms (latch mis-release).
  2. Quiet hours and DND: no HOP/LEAP in operator-defined quiet hours or when
     the IMU reports the cube has been moved by hand in the last 60 s.
     The NUDGE only, or nothing.
  3. Pinch/hand rule: a LEAP toward the operator (Use Case 01) must stop
     short of any ToF-detected object <60 mm; the cube never launches at a
     hand.
  4. Children and pets: LEAP/HOP disabled when the pad is not detected as
     level (±3°) or the ToF sees a moving object <150 mm at arm time.
  5. Spring safety: mechanical stop so a failed latch cannot fire the spring
     with the shell open; shell is not user-openable.
  6. Test ladder for the v.0 gate (extends 500/500): 100 edge trials, 500
     hop-recover cycles, 50 latch mis-release injections, 3 surfaces, and a
     drop test from desk height.

--------------------------------------------------------------------------------
08 // CONSUMER USE CASES (CUMULATIVE — ONE NEW ENTRY PER CYCLE)
--------------------------------------------------------------------------------

  USE CASE 01 — THE DESK MIGRATION                          2026-07-28
  See LOT-CUBIQ-QUANTUM-CUBE-v0.md Section 07. Unchanged.

  USE CASE 02 — THE TWO-DESK RESONANCE                      2026-09-30
  ─────────────────────────────────────────────────────────────────
  Operator profile: two Usership-tier operators who are close (partners,
  co-founders, or a parent and adult child) in different cities and time
  zones. Each has a CUBIQ on their desk and has opted in to a cohort
  resonance link with the other. Neither wants another chat app; both
  say they lose hours to "just checking" messages.

  Signal: COHORT RESONANCE PING — already named in v0.1 as a trigger
  class but not yet given a use case. When one operator completes a
  5-11 minute CUBIQ session, the other's cube receives a single event:
  "your person finished a session." No content, no mood, no text. The
  message carries one bit of presence.

  Experience: at 07:40 in Lisbon, Ana finishes her morning session. On
  a desk in Vancouver it is 23:40 and Ben is reading in bed; the cube
  is in quiet hours, so nothing moves. At 09:10 Vancouver time he sits
  down; his cube performs a single NUDGE that he feels through the desk
  under his forearm: someone he cares about started her day clean.
  He does not reply; there is nothing to reply to. He starts his own
  session. When he finishes, Ana's cube, sitting by her sink-side desk
  in the evening light, gives one HOP. The pair of small motions is the
  whole conversation.

  What makes this a consumer use case and not a novelty:
    - Replaces a habit (thumb-checking a chat thread) with a
      once-per-session, opt-in, content-free signal. It fits the
      anti-feed thesis of LOT-CUBIQ-VISION.md Section 01.
    - Uses the existing cohort resonance signal; no new content pipeline.
    - Privacy is structural: only a presence event leaves the operator's
      account, and only to explicitly linked operators. Revocable in one
      gesture (turn the cube face-down for 3 seconds → link paused).
    - Failure is graceful: offline cube queues at most one pending
      NUDGE, never a backlog; quiet hours suppress motion completely.

  Telemetry back to QI·46 (per v0.1 Section 05): whether the operator
  starts a session within 30 minutes of receiving the ping. Useful
  signal, and easy to aggregate without exposing who pinged whom.

  Next-cycle candidates (not commitments): 03 Bedside wind-down (SETTLE at
  the circadian window), 04 Kitchen self-care prompt (badge + habit),
  05 Child-safe "homework done" for parents, 06 Elder check-in.

--------------------------------------------------------------------------------
09 // OPEN ITEMS FOR S-2
--------------------------------------------------------------------------------

  1. Approve spring-latch + LRA as the v.0 baseline replacing the single
     voice coil. This is the one real architectural change from v0.1.
  2. Approve 15° fixed bias (drop the 5-15° range).
  3. Decide whether to drop acoustic levitation from the roadmap now.
  4. Weigh a nano-ceramic shell sample (largest mass-budget uncertainty).
  5. Approve building the first breadboard: MCU + IMU + LRA + latch and
     spring on a 3D-printed 45 mm shell, to test HOP and NUDGE only.
  6. Firmware/software: a CUBIQ driver mapping Index of Systems events to
     gestures does not exist in the codebase yet. Only docs and the
     model script are in this cycle; no application code changed.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-DEV02
================================================================================
