================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-CYCLE-02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Cycle 02 Report
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-21
VERSION:  0.2 — ENGINEERING BASELINE (PRE-HARDWARE, ANALYTIC)
STATUS:   v.0 — DESIGN LOCK CANDIDATE. NO PHYSICAL PROTOTYPE EXISTS YET.
================================================================================

HONESTY NOTE
  Everything in this report is analytic: first-order physics, design
  intent, test plans. No hardware was built or measured in this cycle.
  Numbers marked [CALC] are back-of-envelope and must be replaced by bench
  data. Numbers marked [CAND] are candidate parts/values, not selections.

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read in this cycle (all in docs/corporate/ unless noted):

  LOT-CUBIQ-QUANTUM-CUBE-v0.md   My own cycle-01 spec. Baseline for this
                                 report. Its Section 07 rule is followed:
                                 prior use cases are never edited; Use Case
                                 02 is appended there as well as below.
  LOT-CUBIQ-VISION.md            Cubic as spatial experience; physical arc.
  LOT-CUBIQ-OPERATOR.md          Signal sources (Section 03), Phase 4
                                 "Physical Extension."
  LOT_QI46_ENGINE.md             Cube as Month-12 input device; haptic
                                 preference signal (pressure, duration,
                                 cadence).
  CQGS-WHITE-PAPER-SNAPSHOT.md   Quantum Cube Hardware line = PLANNED.
  LOT-AMBIENT-AI-VISION.md       NEW to this cycle. Ambient AI™ rules —
                                 "one line, no alarm, exact moment"; QIoT™
                                 fusion of hardware + behavioral signal;
                                 LOT® Station (air quality) and LOT® Brush
                                 as live hardware signal sources. Both are
                                 now cube trigger sources (Section 04).
  LOT_ROBOTICS_COSMO.md          COSMO® robotics lineage. CUBIQ™ stays a
                                 notification body, not a robot or
                                 computer; no naming collision.
  docs/benchmark/LOT-MANIFEST.md Confirms COSMO® Cube is a separate track.

Git history check: cycle 01 (commit 2cce5a9) is the only prior CUBIQ
hardware commit. No hardware code exists in src/.

--------------------------------------------------------------------------------
01 // WHAT THIS CYCLE ADDS
--------------------------------------------------------------------------------

Cycle 01 defined WHAT v.0 is. Cycle 02 makes it buildable on paper:

  1. First-order jump dynamics, so the targets are checked against physics.
  2. A correction to cycle 01's launch-angle assumption for v.1.
  3. Mechanical stack, electronics block diagram, power budget.
  4. Firmware state machine and safety interlocks.
  5. Software signal contract (trigger -> gesture), incl. Ambient AI™
     hardware signals.
  6. Bench test plan with pass/fail gates.
  7. Risk register and open decisions for S-2.
  8. Use Case 02 (consumer).

--------------------------------------------------------------------------------
02 // FIRST-ORDER JUMP DYNAMICS [CALC]
--------------------------------------------------------------------------------

Assumptions: m = 0.120 kg (v.0 mass target), g = 9.81 m/s², flat level
surface, drag and bounce ignored, launch and landing at same height.

  HOP (rise 10 mm, vertical)
    v0 = sqrt(2 g h) = 0.44 m/s        KE = 11.8 mJ
    Momentum needed p = m v0 = 0.053 N·s

  LEAP (40 mm displacement, launch 75° above horizontal = 15° off vertical)
    R = v0² sin(2θ) / g  ->  v0² = 0.040 * 9.81 / sin150° = 0.785
    v0 = 0.89 m/s        KE = 47 mJ        p = 0.106 N·s
    Apex height = v0² sin²θ / 2g = 37 mm

  FINDING 1 — a 40 mm leap at 15° off vertical rises ~37 mm. That is a
  tall, visible jump, not a "short hop." Cycle 01 called THE LEAP "full
  amplitude" so this is consistent, but the 40 mm displacement budget and
  the 37 mm apex should both be treated as design limits. The 20 mm edge
  keep-out in cycle 01 must be measured against displacement + roll-out
  after landing, not displacement alone. PROPOSED: edge keep-out 20 mm ->
  40 mm for THE LEAP. Open decision D1.

  FINDING 2 — cycle 01's 5-15° bias CANNOT reach v.1's >150 mm target.
    v.1: m = 0.090 kg, R = 150 mm, launch 50° above horizontal:
      v0² = R g / sin100° = 1.49  ->  v0 = 1.22 m/s
      KE = 67 mJ      p = 0.110 N·s      Apex = 43 mm
    Same impulse class as the v.0 leap, but the direction must be ~40°
    off vertical, not 5-15°. A piezo bimorph "bias" cannot steer that
    much; v.1 needs the voice-coil axis itself canted (angled drive),
    or a switchable cant. This is the key architectural change flagged for
    v.1 and costs nothing in v.0 if the actuator mount is designed for a
    cant adjustment now. Open decision D2.

  IMPULSE SOURCE (reaction-mass model) [CALC]
    Reaction mass m_r = 30 g accelerated over stroke s = 8 mm to
    v_r = p / m_r = 3.5 m/s (leap). Required acceleration
    a = v_r² / 2s = 766 m/s² (~78 g), force on mass ~23 N, drive pulse
    ~4.5 ms. Voice-coil peak force of 23 N at 30 g moving mass is a
    demanding but not exotic spec; solenoid class is a viable fallback
    but is louder. A pulse this short makes the 12 V -> boost rail and
    capacitor bank (Section 04) the real constraint, not the coil.

  LANDING [CALC]
    Touchdown speed ~ launch speed (0.89 m/s). Shell stops over ~1 mm of
    elastomer foot travel -> peak decel ~ v²/2d = 395 m/s² (~40 g). The
    IMU and PCB must survive this; potting and a mass-balanced stack are
    required. Ceramic shell chipping on glass/stone surfaces is a
    material risk (R3).

  ENERGY PER EVENT
    Leap: 47 mJ mechanical; at an assumed 15% electromechanical efficiency
    ~0.3 J electrical. A 300 mWh (1.08 kJ) cell funds ~3,500 leaps; so
    battery is not the limit, charge-bus pulse current is.

--------------------------------------------------------------------------------
03 // PHYSICAL STACK (v.0 REFERENCE, 45 x 45 x 45 mm)
--------------------------------------------------------------------------------

  Bottom -> top:
    L0  Base face: 4 elastomer feet, Qi receiver coil + ferrite sheet,
        ToF sensor window (forward), LED ring window.
    L1  Reaction-mass chamber: voice coil (CAND, 14 mm dia), 30 g mass on
        spring guide, 8 mm stroke, hard-stop bumpers. Mount plate
        designed with a cant-adjust tab (D2).
    L2  Piezo bimorph bias strip, angled, millisecond-delayed fire (v.0
        bias 5-15°).
    L3  Main PCB: MCU + BLE radio, IMU at geometric center, boost
        converter, supercap bank, charge controller.
    L4  Li-poly cell, 300 mAh class [CAND], center-biased for COM.
    L5  Nano-ceramic shell (matte LOT® black), shell mass budget 25 g.

  Mass budget (target 120 g):
    shell 25, reaction mass 30, coil+guide 14, PCB+parts 12, cell 9,
    Qi coil+ferrite 6, feet+bumpers+fasteners 8, margin 16 = 120 g

  Center of mass must sit within 1.5 mm of the geometric center, or the
  hop tumbles. Verified by pendulum / balance test (Section 06, T1).

--------------------------------------------------------------------------------
04 // ELECTRONICS, POWER, FIRMWARE
--------------------------------------------------------------------------------

  BLOCK DIAGRAM
    Qi RX -> charge IC -> Li-poly -> boost (8-12 V) -> supercap bank
          -> H-bridge -> voice coil
          -> piezo driver (high-V, low-current) -> bimorph
    MCU (BLE) <- IMU (6-axis, >=1 kHz) <- center
    MCU <- ToF (forward) ; MCU -> LED ring
    MCU <-> Cube Driver (BLE to phone/hub, Section 05)

  FIRMWARE STATE MACHINE
    IDLE -> ARMED (trigger received, capacitor charged, safety checks
    pass) -> FIRE -> FLIGHT (IMU free-fall detect) -> LAND (impact detect)
    -> ASSESS (tilt < 25° = OK) -> IDLE
                                 \-> RECOVER (corrective pulse, max 2
                                     tries) -> IDLE or FAULT
    FAULT: no further actuation until docked on charger and cleared.

  INTERLOCKS (all hard gates, all independent of the phone/app)
    I1 Edge: ToF sees no surface within keep-out in the firing direction
       -> else downgrade to NUDGE. If ToF is invalid/occluded -> NUDGE
       only, never hop.
    I2 Level: IMU tilt at rest must be < 5° before any hop; otherwise
       NUDGE only (cube sits on a book, a slope, a keyboard).
    I3 Not on charger pad: hops inhibited while charging (Qi coupled).
    I4 Cooldown: min 20 s between hops, max 12 hops/hour. Notification
       budget is also an Ambient AI™ rule: it must be rare to be
       meaningful.
    I5 Battery: below 20% -> NUDGE only, 10% -> LED only.
    I6 Quiet hours: operator's circadian window (QIE circadian lock)
       forces NUDGE-class gestures.
    I7 Watchdog: any actuator command > 8 ms or coil temp over limit ->
       FAULT.
    I8 Pet/child safe-mode: a user-set flag restricts to NUDGE/SETTLE
       only (hops on a table near a toddler or cat are not neutral).

--------------------------------------------------------------------------------
05 // SIGNAL CONTRACT (SOFTWARE <-> CUBE)
--------------------------------------------------------------------------------

  One trigger -> one gesture. The platform sends an intent, never raw
  coil commands; the cube decides whether it is safe to perform it.

    cube.signal {
      id, ts, source: "index" | "station" | "brush" | "qi46",
      class: "memory_question" | "badge_common" | "badge_rare"
           | "phase_advance" | "air_quality" | "routine_done"
           | "quiet_presence",
      urgency: 0..2        // 0 = ambient, 2 = needs-me-today
      ttl_s: number        // drop if not performed within TTL
    }
    cube.telemetry {
      id, gesture_performed, gesture_downgraded_reason?,
      peak_g, flight_ms, tilt_deg, recover_tries,
      acknowledgment: "touched" | "ignored" | "picked_up"
    }

  MAPPING TABLE v0.2 (cycle 01 gestures + this cycle's additions)
    memory_question   -> THE NUDGE
    badge_common      -> THE HOP
    badge_rare+       -> THE LEAP
    phase_advance     -> THE SETTLE
    air_quality       -> THE KNOCK    (NEW: two sub-threshold pulses,
                                       ~400 ms apart, tied to the Station
                                       CO2/PM2.5 threshold; "open a window")
    routine_done      -> THE SETTLE   (Brush completes morning routine;
                                       one 2 s hold, no spectacle)

  Telemetry feeds QI·46's haptic-preference signal (touched / ignored /
  picked_up replaces explicit ratings). A gesture the operator keeps
  ignoring is retired for that operator automatically; the cube learns to
  be quieter, in keeping with "it waits. When it speaks, the moment was
  earned" (LOT-AMBIENT-AI-VISION.md).

  Repo placement proposal (not created this cycle): src/server/cubiq/
  (signal router + gesture mapper), shared types in src/shared/. No code
  was written; the contract above is the spec to implement against.

--------------------------------------------------------------------------------
06 // BENCH TEST PLAN AND GATES
--------------------------------------------------------------------------------

  T1  COM / balance: <= 1.5 mm offset. PASS/FAIL.
  T2  Impulse calibration: measure p vs. coil drive on a force plate or
      laser displacement rig; fit curve for hop (0.053 N·s) and leap
      (0.106 N·s) within +/- 10%.
  T3  Hop repeatability: 500 cycles, rise 10 mm +/- 3 mm, zero off-table.
  T4  Landing recovery: 200 forced off-axis landings; upright within 2
      recovery tries >= 98%.
  T5  Edge safety: 100/100 approach trials at 0°, +/-30°, +/-60° headings
      on wood, glass, laminate. Zero tolerated failures (unchanged gate).
  T6  Surface matrix: wood, glass, laminate, stone, desk mat; displacement
      spread logged per surface.
  T7  Acoustic: leap peak < 45 dBA at 0.5 m [CAND target]; nudge inaudible
      at 1 m (< 30 dBA).
  T8  Thermal and duty: 12 hops/h for 24 h, coil < 60 °C.
  T9  Drop/shell: 100 landings on glass and stone; no shell cracks.
  T10 Interlock fault injection: occlude ToF, tilt base, dock on charger,
      kill BLE mid-sequence; every case must degrade to NUDGE/LED/FAULT.

  v.0 CLOSE GATE (supersedes nothing in cycle 01, adds):
    500/500 hop-and-recover, T5 100/100, T10 all pass.

--------------------------------------------------------------------------------
07 // ROADMAP DELTA
--------------------------------------------------------------------------------

  v.0 hop      -> unchanged scope. Add cant-adjust tab and 40 mm leap
                  keep-out (D1, D2).
  v.1 long jump-> requires angled/canted drive axis (~40° off vertical),
                  not piezo bias. Impulse (~0.11 N·s at 90 g) is the same
                  class as the v.0 leap; mass reduction and launch angle
                  are the levers, not more power.
  v.2 table walk-> unchanged; traction-pad design deferred to v.1 data.
                  Yaw control needs the IMU gyro closed-loop proven first.
  v.3 levitation-> still a research track, no mechanism claim. Constraint
                  recorded: at 120 g, magnetic or acoustic levitation of
                  the shell is far beyond acoustic-array capability
                  (acoustic levitation lifts millimeter-scale, mg-class
                  objects). Realistic v.3 paths are (a) a table-embedded
                  electromagnet array with an active-stabilized magnet
                  cube (maglev display class), hover height ~10-20 mm
                  over a powered pad; or (b) a sub-gram "mote" companion
                  levitating acoustically beside the cube. Cycle 01's
                  acoustic option (a) for the full shell is therefore
                  downgraded. Open decision D3.

--------------------------------------------------------------------------------
08 // RISK REGISTER
--------------------------------------------------------------------------------

  R1  Cube falls off desk            HIGH  I1 edge gate, I2 level gate,
                                          T5 100/100, T10 fault injection.
  R2  Pulse current on small cell    MED   Supercap bank decouples cell.
  R3  Ceramic shell chips/cracks     MED   Elastomer feet, shell test T9,
                                          fallback: filled polymer shell
                                          with ceramic coating.
  R4  Noise is annoying, not calm    MED   T7 target; nudge-first policy;
                                          circadian quiet hours (I6).
  R5  Scatter on real desks (cables, MED   I2 level gate; downgrade, never
      keyboards, mouse pads)               fire, when uncertain.
  R6  Harm to pets / kids            MED   I8 safe mode; hop size cap.
  R7  Notification overload          MED   I4 budget, auto-retire ignored
                                          gestures.
  R8  Qi coil shielded by metal desk LOW   Docking pad geometry; test T6.
  R9  Cost vs. Usership BOM          UNK   BOM not yet estimated.

--------------------------------------------------------------------------------
09 // OPEN DECISIONS FOR S-2
--------------------------------------------------------------------------------

  D1  Raise leap edge keep-out from 20 mm to 40 mm?   (recommended: yes)
  D2  Add a cant-adjust actuator mount now, for v.1?  (recommended: yes)
  D3  Replace "levitate the whole cube" with maglev-pad + acoustic-mote
      track in the Institute research brief?          (recommended: yes)
  D4  Include a hard physical power switch on the base? (recommended: yes)
  D5  Next cycle: (a) software signal router stub in src/server/cubiq/,
      (b) 3D-printed bench rig drawings, or (c) BOM + cost model?

--------------------------------------------------------------------------------
10 // CONSUMER USE CASE 02 — THE OPEN WINDOW                   2026-10-21
--------------------------------------------------------------------------------

  Operator profile: Usership tier, owns the LOT® Station and the LOT®
  Brush, works from a small home office, door usually closed, cube on its
  charging pad beside the keyboard. Afternoon, late October, heating on.

  There is no screen alert and no badge. Over two hours the room CO2
  climbs. The LOT® Station reports it (QIoT™ fusion: Station + the
  operator's logged "foggy afternoon" pattern from the Memory Engine). At
  the threshold, the cube is lifted off the charger first (I3 would block
  a hop on the pad; the operator keeps it on the desk mat, not the pad
  during the day) and performs THE KNOCK: two faint taps through the wood,
  400 ms apart. Not a chime. Not a red dot.

  The operator feels it, glances at the cube, and on the LOT® screen sees
  one line in the usual typeface: "Air quality: open a window for 30
  minutes." They open the window. The cube registers "touched" (they rest
  a hand on it for a second, a habit by now) and logs the acknowledgment.
  Station CO2 drops; no second knock is sent.

  Next morning, the Brush closes the routine; the cube performs THE
  SETTLE once, a 2-second held pressure. They notice it only because they
  were reaching for their coffee. Two weeks later, when they begin
  ignoring the Settle, the system silently retires it for them; the cube
  stays quiet unless the air is bad.

  Why this case matters: it is the first CUBIQ use case where the cube is
  the physical voice of ANOTHER LOT® object (the Station), proving the
  cube as a single ambient output body for the whole QIoT™ ecosystem,
  and it shows the anti-feed rule in hardware form: fewer notifications
  as the relationship matures, not more.

--------------------------------------------------------------------------------
11 // NEXT-CYCLE USE CASE QUEUE (so each run adds a new one)
--------------------------------------------------------------------------------

  03  Shared Table: two cubes on one desk, one per cohort member.
  04  The Child's Desk: SETTLE-only safe mode (COSMO® family context).
  05  Focus Block: cube as a physical session timer for the 5-11 minute
      cubic session.
  06  Travel Mode: NUDGE-only hotel desk, no hops, no edge assumptions.
  07  Ward/Care: elder-care cube; routine-missed gesture to a caregiver's
      cube on another table (needs a privacy review first).

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-CYCLE-02
================================================================================
