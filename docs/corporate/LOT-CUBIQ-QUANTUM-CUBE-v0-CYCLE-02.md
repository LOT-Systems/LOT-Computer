================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-CYCLE-02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report, Cycle 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-12
VERSION:  0.2 — ENGINEERING ANALYSIS + DESIGN-LOCK CANDIDATE
STATUS:   PRE-HARDWARE. ALL NUMBERS ARE FIRST-ORDER CALCULATIONS, NOT MEASUREMENTS.
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing (per the standing instruction in cycle 01, Section 00):

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md      (cycle 01, 2026-07-28)
    The baseline. Single voice-coil reaction-mass actuator, piezo bias strip,
    IMU landing recovery, ToF edge gate, four gestures (NUDGE / HOP / LEAP /
    SETTLE), roadmap v.0 hop -> v.1 long jump -> v.2 table swings -> v.3
    levitation research. Use Case 01 recorded. Rule: use cases are append-only.
  docs/corporate/LOT-CUBIQ-VISION.md, LOT-CUBIQ-OPERATOR.md
    Anti-feed thesis; Phase 4 "Physical Extension"; Index of Systems signals.
  docs/corporate/LOT_QI46_ENGINE.md, CQGS-WHITE-PAPER-SNAPSHOT.md
    LOT® Institute basis: piezoelectric mechanics, nano-ceramic architecture,
    haptic feedback language, Quantum Cube as Month-12 INPUT device
    ("haptic preference: pressure, duration, cadence", QI46 line 757).
  docs/benchmark/LOT-MANIFEST.md
    COSMO® Cube (hardware computer) remains a separate track; no naming overlap.

Repo search for any cube work after 2026-07-28: none. Cycle 02 is the first
follow-up. No hardware, firmware or CAD exists yet in this repository.

--------------------------------------------------------------------------------
01 // CYCLE 02 SUMMARY
--------------------------------------------------------------------------------

Cycle 01 wrote the vision-level spec. Cycle 02 puts numbers under it. Doing so
surfaced FOUR corrections to cycle 01 and produced a design-lock candidate:

  F1  LEAP and HOP specs are inconsistent (Section 02).
  F2  The piezo bias strip cannot deliver the v.1 long jump (Section 02).
  F3  A battery cannot drive the actuator directly; a capacitor-discharge
      driver is required (Section 03).
  F4  Acoustic levitation of a ~100 g cube is not physically credible;
      active electromagnetic levitation is the only v.3 path worth scoping
      (Section 08).

Cycle 01 text is left untouched. This document supersedes it where they differ.

--------------------------------------------------------------------------------
02 // BALLISTICS — THE NUMBERS BEHIND THE GESTURES
--------------------------------------------------------------------------------

Model: point mass M = 120 g, flat level surface, no air drag, launch angle
measured from horizontal (= 90° minus "bias off vertical").

  A. THE HOP (<10 mm rise)
     v = sqrt(2 g h) = 0.44 m/s
     E = M g h = 11.8 mJ     p = M v = 0.053 N·s
     Easy. Plenty of margin.

  B. THE LEAP — cycle 01 says "~40 mm displacement" with 5-15° bias
     Range R = v² sin(2θ) / g.  Solving for R = 40 mm:

       bias off vertical   launch speed   energy    apex height   flight time
              5°            1.50 m/s     136 mJ     114 mm        305 ms
             10°            1.07 m/s      69 mJ      57 mm        215 ms
             15°            0.89 m/s      47 mJ      37 mm        174 ms
             20°            0.78 m/s      37 mJ      28 mm        150 ms
             30°            0.67 m/s      27 mJ      17 mm        119 ms

     FINDING F1: a 40 mm leap at the cycle-01 bias of 5-15° requires a
     37-114 mm apex. That is a real jump, not a "hop". Either the LEAP is a
     genuine small jump (and must be specified and safety-gated as one), or
     the bias must be ~30° for a low flat 17 mm arc. DECISION for v.0 lock:
     bias 25-30° (apex ≈ 17-21 mm, ~31 mJ, ~130 ms flight). Lower apex means
     lower landing speed, less noise, less tumble, less edge risk.

  C. THE v.1 LONG JUMP (>150 mm), mass target 90 g
     Best case, 45° launch: v = 1.21 m/s, E = 66 mJ, apex 37 mm.
     Off-vertical bias of 5-15° (cycle 01) gives 140-430 mm apex for 150 mm
     range at 120 g (177-508 mJ) — a cube flung 14-43 cm into the air.

     FINDING F2: the piezo "off-vertical bias" of cycle 01 is the wrong tool
     for v.1. A long, SAFE jump is a ~45° launch with a low apex. That needs
     the actuator axis itself tilted (or a tilt-selectable mount), not a
     small piezo nudge. v.1 therefore changes the actuator geometry, which
     cycle 01 claimed it would not. The v.0 mount should be designed so the
     actuator axis angle is a swappable part (30° in v.0, 45° in v.1).

  D. FRICTION AT LAUNCH
     Foot slips unless mu >= tan(bias off vertical)... equivalently
     mu >= cot(launch angle). 30° bias -> mu >= 0.58. 45° launch -> mu >= 1.0.
     Elastomer feet (mu ~0.8-1.2 on wood/laminate) are marginal on glass and
     fail on wet or dusty surfaces. The v.1 gate "wood, glass, laminate"
     (cycle 01) is therefore a real engineering gate, not a formality.

  E. ROTATION
     An off-center impulse spins the cube. Landing a cube upright from a
     tilted launch requires the impulse line to pass within ~1 mm of the
     center of mass. CoM placement is a v.0 mechanical requirement:
     battery and cap bank are placed to put CoM on the actuator axis.

--------------------------------------------------------------------------------
03 // ACTUATOR AND POWER ARCHITECTURE (REVISED)
--------------------------------------------------------------------------------

Reaction-mass launch: the internal mass m_r is accelerated and strikes the
base; momentum transfers to the whole cube. Needed momentum for the v.0 LEAP
(30° bias, 40 mm, M = 120 g) is p ≈ M·v = 0.08 N·s.

  Design point (30 g reaction mass, 8 mm stroke, v.1-capable headroom):
     m_r v_r = 0.106 N·s  ->  v_r = 3.5 m/s
     kinetic energy 187 mJ, stroke time 4.5 ms, mean force 23 N,
     PEAK POWER ≈ 41 W

  Collision efficiency ≈ m_r / M = 25%. This is why 187 mJ is spent for ~47 mJ
  of cube motion. It is acceptable; battery energy is not the constraint.

  FINDING F3: ENERGY is trivial (a 150 mAh cell holds ~2000 J, i.e. >10,000
  leaps). PEAK POWER is the problem: 41 W in 4.5 ms is beyond what a small
  Li-poly cell and its protection circuit should be asked to deliver.
  v.0 therefore adopts a CAPACITOR-DISCHARGE DRIVER:

     - Boost charger tops a small capacitor bank to 24 V between gestures
       (target ~2-3 mF at 24 V for ~0.2 J at 30% drive efficiency; ~8 mF at 12 V).
     - H-bridge dumps the bank into the voice coil in a shaped pulse.
     - Pulse shape is a firmware parameter => the same hardware produces the
       NUDGE (sub-threshold), HOP, LEAP and SETTLE by scaling the charge.
     - Re-arm time target: <= 2 s after a LEAP.

  Voice coil vs solenoid: voice coil kept (controllable amplitude, quiet).
  Open risk: a voice coil at 30 g moving mass is non-trivial to package in
  45 mm. If packaging fails, fall back to a latched spring-and-release (a small
  motor cocks a spring, a solenoid trips it). Louder, but mechanically proven
  in toy jumping mechanisms. Prototype both; choose by measured noise.

--------------------------------------------------------------------------------
04 // v.0 DESIGN-LOCK CANDIDATE
--------------------------------------------------------------------------------

  SIZE / MASS        45 x 45 x 45 mm; <=120 g (budget below)
  SHELL              nano-ceramic composite, matte LOT® black (Institute material
                     line). Prototype shells: 3D-printed resin, ceramic later.
  ACTUATOR           voice coil, 30 g reaction mass, 8 mm stroke, axis tilt 30°
                     (swappable mount), capacitor-discharge driver
  BIAS ELEMENT       piezo bimorph retained ONLY for fine yaw/tilt trim and
                     NUDGE tremor; no longer the main launch-angle source
  SENSING            6-axis IMU at CoM; 3x ToF (forward + 2 lateral, for
                     v.2 readiness); contact/bottom-reflectance edge sensor
                     (ToF alone misreads dark or glass surfaces)
  MCU / RADIO        BLE 5 SoC (nRF52-class), OTA firmware
  POWER              ~150 mAh Li-poly, Qi-class receive coil in base, supercap
                     or film-cap bank for the discharge driver
  FEET               4 elastomer feet, mu >= 0.9 target
  INDICATOR          one LED ring on base, pairing/charge only

  MASS BUDGET (grams, target)
     shell 22 | reaction mass 30 | coil+magnet+spring 20 | battery 8
     caps+driver PCB 10 | MCU/BLE/IMU/ToF PCB 6 | Qi coil 5 | feet/fasteners 6
     contingency 13                                       => 120

  MASS IS TIGHT. The reaction mass alone is a quarter of the cube. If the
  budget fails, v.0 grows to 50 mm before it sheds the safety sensors.

--------------------------------------------------------------------------------
05 // FIRMWARE AND SIGNAL INTERFACE
--------------------------------------------------------------------------------

State machine:

   SLEEP -> ARMED (cap charged) -> GESTURE (pulse) -> FLIGHT (IMU free-fall)
        -> LANDED -> ASSESS (tilt < 25°?) -> [RECOVER pulse] -> COOLDOWN -> ARMED
   Any state: EDGE_INHIBIT (edge sensor trips)  -> downgrade to NUDGE
   Any state: PICKED_UP (IMU lift/handling)     -> disarm, discharge caps
   Any state: LOW_BATTERY                       -> NUDGE only

Safety rules (hard gates, all must pass before any hop):
   1. Edge sensor reading valid AND >= 40 mm margin in the launch direction
      (cycle 01 said 20 mm; with a 40 mm leap and slide on landing, 20 mm is
      not enough - raised to 40 mm).
   2. Cube resting level (IMU tilt < 10°).
   3. Not being held (no handling signature in last 2 s).
   4. Rate limit: max 6 gestures per hour, none between the operator's
      configured quiet hours. A notification object must be rare to stay felt.
   5. Capacitor voltage verified before pulse (no partial-charge surprises).

Host interface (BLE GATT, one write characteristic):

   gesture : enum { NUDGE=0, HOP=1, LEAP=2, SETTLE=3 }
   intensity: uint8 (0-255, clamped by safety state)
   direction: int16 degrees (v.0 ignored; reserved for v.2)
   -> returns { executed_gesture, downgrade_reason, landing_tilt, flight_ms }

Index of Systems mapping (unchanged from cycle 01 Section 04), plus telemetry
return (flight_ms, landing_tilt, downgrade_reason, operator-picked-up-within-60s)
written to QI·46 as the "haptic preference" signal.

A server-side adapter is NOT yet written; the interface above is the contract
it will be built to. No application code was changed in this cycle.

--------------------------------------------------------------------------------
06 // VALIDATION PLAN AND GATES
--------------------------------------------------------------------------------

Bench (no cube):
   B1  Voice-coil + reaction mass rig on a load cell: confirm impulse
       0.05-0.11 N·s from a measured cap discharge.
   B2  Cap-discharge pulse shaping: repeatability +/-5% impulse over 1000 shots.

Prototype (printed shell, dummy electronics at final mass and CoM):
   P1  CoM within 1 mm of actuator axis.
   P2  200 launches per bias angle (20/25/30°) on wood, laminate, glass:
       record apex (high-speed phone camera), range, tumble, slip.
   P3  Noise: measure landing and actuator noise (dBA at 30 cm, 25 cm desk).

Integrated v.0 gates (supersede cycle 01 where stricter):
   G1  500/500 hop-and-recover cycles, zero off-table landings, zero actuator
       failures (cycle 01 gate, kept)
   G2  Edge safety: 100/100 approach trials at 40 mm margin, from 8 headings,
       on wood, glass and a dark matte surface
   G3  Landing upright >= 98% of LEAPs on the three surfaces
   G4  Handling safety: zero discharges while picked up, 100 trials
   G5  Charge/thermal: no surface above 40°C after 6 LEAPs in 10 minutes
   G6  Child/pet safety review: no exposed pinch points, no loose parts
       under a 10 N pull, no battery access without tools

--------------------------------------------------------------------------------
07 // RISK REGISTER
--------------------------------------------------------------------------------

  R1  Packaging: 30 g reaction mass + coil + caps may not fit 45 mm.     HIGH
      Mitigation: spring-and-release fallback; allow 50 mm.
  R2  Surface variance (glass, wet, dusty) breaks traction.             HIGH
      Mitigation: friction-aware downgrade to NUDGE; surface classifier
      from first-pulse IMU response.
  R3  Noise. A clacking cube is worse than a buzzing phone.             MED
      Mitigation: damped landing feet; NUDGE/SETTLE as defaults, LEAP rare.
  R4  Falls despite the gate (sensor miss).                             MED
      Mitigation: low LEAP energy (apex ~20 mm), lateral ToF, rate limit,
      fall detection => lock until placed back on a pad.
  R5  Li-poly battery in a consumer object that is hit/dropped.        MED
      Mitigation: protected cell, shell crush test, certification path.
  R6  Regulatory (radio, battery, toy/consumer safety, shipping).      MED
      Not studied yet; needs counsel/lab before any consumer unit ships.
  R7  Novelty-wear: a jumping cube is delightful once and annoying by
      day 30.                                                           MED
      Mitigation: rate limits, quiet hours, QI·46 haptic-preference
      loop turns gestures DOWN as readily as up.

--------------------------------------------------------------------------------
08 // ROADMAP REFINEMENTS (v.1 / v.2 / v.3)
--------------------------------------------------------------------------------

  v.1 THE LONG JUMP
    Swap actuator mount to 45°; shell target <=90 g; higher-friction feet;
    stroke 10-12 mm. Apex ~37 mm for 150 mm range (E ≈ 66 mJ at 90 g).
    A real flight path (~350 ms) needs a landing zone clear of obstacles:
    add forward ToF + camera-free "landing clearance" check.

  v.2 SURFACE SWINGS / TABLE WALKING
    Re-scoped. Instead of actuated traction pads (complex, wear-prone), first
    evaluate SERIES OF SHORT HOPS (3-5 x 40 mm leaps, IMU yaw-corrected between
    each by a small internal gyroscopic or reaction-wheel torque). A
    200 mm traverse = 5 leaps = ~10 s with cooldown. Slow but mechanically
    simple. Traction pads remain an option if hop-chains drift beyond
    15 mm cross-track error.

  v.3 LEVITATION
    FINDING F4:
      (a) Acoustic levitation: practical acoustic levitators suspend objects
          of a few grams at most, with standing-wave nodes far smaller than
          a 45 mm cube. A ~100 g solid cube is out of reach. DROP as a path
          for the full cube.
      (b) Active electromagnetic levitation (electromagnet array in the
          pad + permanent magnet in the cube + Hall-sensor feedback loop):
          commercial levitating displays hold several hundred grams over
          ~20-30 mm gaps. This is the one credible v.3 path. Constraints:
          needs a continuous control loop and continuous power in the pad
          (watts, not mJ), the cube is bound to ITS pad, and magnets near
          the cube will affect phones, cards and pacemakers: a safety and
          labeling issue to resolve before any consumer concept.
      (c) Diamagnetic levitation (pyrolytic graphite): passive, but suspends
          only grams over a strong magnet array. Not for the full cube.
      (d) Hybrid: a lightweight internal "floating core" inside a docked
          shell. A demonstrator, not a product.
    RECOMMENDATION: v.3 starts as a bench demo of (b) at ~120 g with a
    dummy cube. No consumer claim until a working loop exists.

--------------------------------------------------------------------------------
09 // CONSUMER USE CASES (APPEND-ONLY - SEE ALSO LOT-CUBIQ-QUANTUM-CUBE-v0.md §07)
--------------------------------------------------------------------------------

  USE CASE 02 — THE NIGHT-SHIFT RETURN                      2026-10-12
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, works nights (nurse / baker / driver),
  sleeps in the daytime with a partner or child asleep in the same room.
  The CUBIQ pad sits on a narrow bedside table. Phone is on do-not-disturb
  and face-down; the operator has stopped trusting any lit or sounding
  notification near sleep.

  The Memory Engine has a question ready after the operator's overnight
  "Release" self-care moment. Under software-only CUBIQ the question waits
  behind the phone. Under every other notification system it would arrive
  as a sound or light, waking someone.

  With CUBIQ hardware v.0: the quiet-hours profile forbids LEAP and HOP
  entirely. The cube performs only THE SETTLE - a light standing pressure for
  two seconds, felt as a faint vibration through the bedside table to the
  operator's hand resting near it. Nothing is lit. Nothing is heard. The
  partner does not stir.

  The same table is only 140 mm deep. When a rare badge unlock arrives at
  dusk and the operator is awake, the cube starts to prepare THE LEAP, the
  edge gate reads a 35 mm margin (below the 40 mm minimum), and the cube
  quietly downgrades to a NUDGE instead. The return telemetry records
  downgrade_reason = EDGE; QI·46 learns this operator's surface is small and
  stops requesting LEAPs here. The cube never leaves the table.

  This is the use case where v.0's restraint is the feature: an object that
  knows when NOT to move, and tells the operator the truth about why.

--------------------------------------------------------------------------------
10 // OPEN QUESTIONS FOR S-2 (CYCLE 03 INPUTS)
--------------------------------------------------------------------------------

  Q1  Approve LEAP redefinition (30° bias, ~20 mm apex) and edge margin 40 mm?
  Q2  Approve moving the actuator-axis angle into a swappable part for v.1?
  Q3  Size ceiling: allow 50 mm if packaging (R1) fails?
  Q4  Prototype path: in-house bench build, or contract mechatronics lab?
      Budget not defined in the repo; no hardware spend is assumed here.
  Q5  Confirm v.3 direction (active electromagnetic) and magnet-safety stance.
  Q6  Which signal gets the first cube-driver adapter: memory question,
      badge unlock, or assembly phase change?

--------------------------------------------------------------------------------
11 // PROVENANCE AND LIMITS
--------------------------------------------------------------------------------

All physics above was recomputed in this session (point-mass ballistics, impulse
and energy, capacitor sizing). Packaging, noise, thermal, traction and regulatory
claims are engineering judgments, not measurements. No prototype exists. No
hardware vendor, part number, price or schedule has been checked. Nothing here
should be quoted externally as a tested capability.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-CYCLE-02
================================================================================
