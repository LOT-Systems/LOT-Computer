================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-R02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report 02
          Actuation Physics, Architecture Revisions, Firmware, Use Case 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-19
VERSION:  0.2 — ENGINEERING BASELINE (PRE-HARDWARE, DESIGN LOCK PENDING)
PARENT:   docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md (v0.1, 2026-07-28)
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG — WHAT WAS READ BEFORE THIS REPORT
--------------------------------------------------------------------------------

This is the second development report on the v.0 Quantum Cube. It extends,
and does not replace, the v0.1 specification. Read in full before writing:

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md        (v0.1 — own prior work)
    Form factor 45mm / <120g, CONTROLLED HOP primitive, four-gesture
    language (NUDGE / HOP / LEAP / SETTLE), IMU righting, forward ToF
    edge gate, v.0→v.3 roadmap, Use Case 01 "The Desk Migration."

  docs/corporate/LOT-CUBIQ-VISION.md                  (2026-06-23)
    Anti-feed thesis; Section 05 "Physical Products — The Inevitable Step."

  docs/corporate/LOT-CUBIQ-OPERATOR.md
    Section 04 AI-driven physical delivery; Phase 4 "Physical Extension."

  docs/corporate/LOT_QI46_ENGINE.md
    Layer 0 corpus line: "LOT® Institute white papers — CQGS, Quantum Cube,
    bioelectric philosophy"; bioelectric domain "piezoelectric mechanics,
    nano-ceramic architecture, biofield theory, haptic feedback language."
    Step 3.3 "Quantum Cube sync (Month 12 milestone)" — haptic preference,
    usage frequency, biofield response as Calibration Loop signals.

  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md         (institute.lot-systems.com)
    Products row: "Quantum Cube | Bioelectric hardware, haptic feedback,
    nano-ceramic, piezoelectric." Tier row: "$399/mo priority with Quantum
    Cube sync." Memory Arc: "12mo+ hardware." Status: "Quantum Cube
    Hardware | PLANNED."

  src/client/stores/selfAssembly.ts
    The software Quantum Cube already exists as the platform's heartbeat
    metaphor ("Quantum Cube dormant. Send the first signal — assembly
    begins with you."). The hardware's resting state should be named the
    same way: DORMANT. Section 05 adopts it.

  docs/benchmark/LOT-MANIFEST.md
    COSMO® Cube (hardware computer, brave-lamport-t9z5u8) remains a
    separate object. No shared part numbers or names. Confirmed again.

What this report adds that v0.1 did not have: numbers. v0.1 said WHAT the
cube does. R02 checks, with first-order physics, whether the v0.1
architecture can actually do it — and where it cannot, revises it.

--------------------------------------------------------------------------------
01 // SUMMARY OF DECISIONS IN THIS REPORT
--------------------------------------------------------------------------------

  D-01  REVISED  Hop mechanism changes from "internal reaction mass striking
                 the base face" to a BASE PISTON (an exposed foot-plunger
                 that pushes directly against the table). ~3-4× less
                 actuator force needed for the same hop. Section 02.
  D-02  REVISED  Forward-only ToF edge sensor becomes FOUR downward-angled
                 cliff sensors (one per side face). The cube can land
                 rotated, so "forward" is not a stable concept. Section 03.
  D-03  NEW      Supercapacitor pulse buffer between battery and actuator.
                 The battery alone cannot source the LEAP current pulse
                 cleanly. Section 04.
  D-04  NEW      Firmware state machine with a mandatory PRE-FLIGHT check
                 and a RATE GOVERNOR (anti-feed limits enforced in
                 hardware, not in app settings). Section 05.
  D-05  NEW      FACE SEMANTICS — the cube's resting orientation is an
                 input. Six faces, six meanings. Section 06.
  D-06  NARROWED Levitation track: acoustic levitation of the full cube is
                 closed (physically out of range). Active electromagnetic
                 levitation over the charging base is the single open
                 track. This puts a hard constraint on v.0 today: a
                 reserved magnet bay. Section 08.
  D-07  NEW      v.2 locomotion candidate: STICK-SLIP GLIDE using the same
                 actuator class mounted horizontally — table travel
                 without legs or wheels. Section 07.
  D-08  NEW      Use Case 02 — "The Night Face." Section 10.

--------------------------------------------------------------------------------
02 // ACTUATION PHYSICS — DOES THE v0.1 HOP CLOSE?
--------------------------------------------------------------------------------

All figures are first-order (point mass, no air drag, rigid table).
g = 9.81 m/s². Shell mass M = 0.120 kg (v0.1 target). Actuator stroke
s = 8 mm (fits inside a 45mm cube with shell, battery, board).

  2.1 REQUIRED TAKE-OFF VELOCITIES

  GESTURE   TARGET                          LAUNCH          v_takeoff   KE
  ───────   ──────                          ──────          ─────────   ──
  NUDGE     no liftoff                      —               0           <1 mJ
  HOP       10 mm rise, in place            vertical        0.44 m/s    12 mJ
  LEAP      40 mm forward displacement      15° off vert.   0.89 m/s    47 mJ
            (implied rise ≈ 37 mm)
  v.1 JUMP  150 mm displacement, M=0.09 kg  45° (tilted)    1.21 m/s    66 mJ

  Note for the record: v0.1 described the LEAP as "full-amplitude hop with
  forward bias, ~40mm displacement." At a 15° bias, 40mm of horizontal
  travel requires ~37mm of rise — almost the cube's own height. That is a
  dramatic motion, not a subtle one. R02 keeps the 40mm LEAP target but
  flags it for user testing: it may prove too theatrical for a
  notification, in which case LEAP drops to ~20mm displacement / ~18mm
  rise and the full 40mm becomes a rare-badge-only "GRAND LEAP."

  2.2 ARCHITECTURE A — INTERNAL REACTION MASS (v0.1)

    A mass m_r is driven upward and strikes an internal stop. The
    collision is effectively inelastic, so the whole body leaves with
    v = m_r·u / M. With m_r = 30 g (25% of mass), the LEAP needs
    u ≈ 3.5 m/s inside an 8mm stroke:

        a = u² / 2s ≈ 770 m/s²     F ≈ 23 N on the reaction mass
        energy into mass ≈ 184 mJ, of which only ~25% becomes flight

    23 N peak is beyond any voice coil that fits in a 45mm cube at this
    mass budget. Architecture A works only with a stored-energy spring
    latch — and a latch makes the NUDGE and SETTLE gestures impossible
    from the same actuator. Not chosen.

  2.3 ARCHITECTURE B — BASE PISTON (R02 DECISION D-01)

    A foot-plunger exits the base face and pushes directly against the
    table. The ground reaction accelerates the whole shell; nothing is
    lost in an internal collision.

        F = M·(v² / 2s + g)

        HOP      F ≈ 0.120 · (12.3 + 9.8)  ≈ 2.7 N
        LEAP     F ≈ 0.120 · (49   + 9.8)  ≈ 7.1 N
        v.1 JUMP F ≈ 0.090 · (92   + 9.8)  ≈ 9.2 N   (or 12 mm stroke: 6.6 N)

    7 N over 8mm is within reach of a small moving-magnet voice coil
    (force constant ~2 N/A, ~3.5 A peak for ~18 ms). The same coil, driven
    at low current, produces the NUDGE (sub-liftoff press, felt through
    the table) and the SETTLE (steady 0.5-1 N standing press). One
    actuator still serves all four gestures — the v0.1 principle
    "one actuator, one moving mass" survives.

    The forward bias in v0.1 came from an angle-mounted piezo bimorph.
    In Architecture B the bias comes more cheaply from geometry: the
    plunger is offset 6-8mm from the center of mass, so the push carries
    a small rotation and a forward component. The piezo bimorph is kept,
    but re-assigned (Section 07): it becomes the stick-slip driver for
    v.2 and the NUDGE texture element. This keeps the Institute-named
    piezoelectric line (CQGS row "piezoelectric") in the product.

  2.4 LANDING

    Landing kinetic energy equals take-off (≤ 47 mJ). Elastomer feet
    (Shore 40A, 2mm) plus the plunger retracting as a damper (the voice
    coil runs as a generator through a load resistor on touchdown) absorb
    it. Targets: peak landing deceleration < 60 g at the IMU; landing
    sound < 35 dBA at 1 m for HOP, < 45 dBA for LEAP. The sound target
    matters: a notification that clacks is a chime, not a presence.

--------------------------------------------------------------------------------
03 // SAFETY GATES (REVISED)
--------------------------------------------------------------------------------

  CLIFF SENSING (D-02)
    Four short-range ToF sensors, one in the lower edge of each side face,
    angled 30° downward. Any reading beyond floor-distance + 8 mm means
    "no table here." Before every LEAP, the predicted landing footprint
    (from IMU heading + plunger offset) must be ≥ 20 mm inside all four
    readings. If not: LEAP is downgraded to HOP; if HOP is also unsafe,
    to NUDGE. The cube never decides to leap blind.

  HELD-IN-HAND LOCKOUT
    If the IMU reads free-fall, sustained non-gravity acceleration, or
    no stable contact for > 300 ms, the piston is inhibited. A cube being
    carried, held, or rolled across a palm may only NUDGE.

  OBSTACLE CHECK
    The same side-face ToF sensors, read at their horizontal channel,
    detect a cup, glass or hand within 60 mm in the leap direction and
    downgrade the gesture. Liquids on a desk are the realistic hazard.

  MAGNET SAFETY (forward-looking, see Section 08)
    Any reserved magnet is fully encapsulated and bonded; the shell must
    pass a drop and crush test before a magnet is ever installed.

  GATES (amends v0.1 Section 06 v.0 gate)
    G-1  500/500 hop-and-recover cycles, zero off-table landings  (v0.1)
    G-2  100/100 edge approaches from each of 4 sides, zero falls  (new)
    G-3  50/50 lift-during-arming trials, zero piston fires         (new)
    G-4  Landing sound under targets on wood, glass, laminate       (new)

--------------------------------------------------------------------------------
04 // ELECTRONICS AND POWER BUDGET
--------------------------------------------------------------------------------

  BLOCK                    v.0 CANDIDATE CLASS                     MASS (g)
  ─────                    ───────────────────                     ────────
  MCU + radio              BLE 5.x SoC, low-power                  2
  IMU                      6-axis accel + gyro                     <1
  Cliff / obstacle         4× short-range ToF                      2
  Actuator                 moving-magnet voice coil, 8mm stroke    28
  Pulse buffer             supercapacitor, ~0.5 F / 5 V             8
  Driver                   H-bridge, ≥4 A peak                      1
  Battery                  Li-po ~150 mAh                           4
  Charging                 Qi-class receiver coil (see §08)         4
  Piezo element            bimorph strip (NUDGE / stick-slip)       1
  Shell + feet + frame     nano-ceramic composite                  45
  Reserved magnet bay      empty in v.0 (see §08)                   0
  Wiring, fasteners, PCB   —                                        10
                                                                 ──────
                                                                 ~106 g
  Margin to 120 g target: ~14 g. Tight but real.

  ENERGY
    LEAP mechanical ≈ 57 mJ (incl. lifting through stroke). At ~12%
    electrical-to-mechanical efficiency ≈ 0.5 J drawn per LEAP.
    Battery ~150 mAh · 3.7 V ≈ 2,000 J. Even at the rate-governor ceiling
    (Section 05), actuation is < 5% of daily energy; idle radio and the
    cliff sensors dominate. Target: 7 days between charges if the cube
    is left off its base; indefinite on base.

  WHY A SUPERCAPACITOR (D-03)
    3.5 A for 18 ms from a 150 mAh cell is > 20C — it sags the rail and
    browns out the MCU mid-leap. A ~0.5 F supercap charged to 5 V holds
    ~6 J, ten LEAPs' worth; the battery trickles it back up between
    gestures. The supercap's charge state also becomes a natural safety
    interlock: no charge, no leap.

--------------------------------------------------------------------------------
05 // FIRMWARE — STATE MACHINE AND RATE GOVERNOR (D-04)
--------------------------------------------------------------------------------

  STATES
    DORMANT     Radio listening, sensors off. Name taken from the
                software heartbeat in selfAssembly.ts.
    ARMED       Gesture packet received and accepted by the governor.
    PRE-FLIGHT  Level check (tilt < 3°), contact check, cliff + obstacle
                scan, supercap ≥ threshold, face check (Section 06).
                Any failure → downgrade gesture or ABORT.
    FIRE        Piston drive profile for the gesture (open-loop, tuned
                per unit at calibration).
    FLIGHT      IMU logs at 1 kHz; nothing else can interrupt.
    LANDING     Plunger damping; impact peak recorded.
    RIGHTING    If tilt > 25°, corrective pulse (max 2 attempts), else
                report "needs a hand."
    REPORT      Telemetry packet to the platform, return to DORMANT.

  GESTURE PACKET (BLE, platform → cube)
    gesture_id    NUDGE | HOP | LEAP | SETTLE
    signal_class  memory_ready | badge_common | badge_rare | assembly_phase
    intensity     0-100 (scaled inside per-gesture safe envelope)
    not_before    timestamp (lets the platform queue for a quiet window)
    nonce         replay protection; packets are signed per paired unit

  TELEMETRY PACKET (cube → platform → QI·46 Calibration Loop)
    executed_gesture, downgrade_reason, flight_ms, landing_peak_g,
    righting_attempts, time_to_first_touch_after_gesture,
    face_at_rest, battery, supercap.
    "time_to_first_touch" is the cleanest available proxy for the
    QI·46 Step 3.3 "haptic preference — cadence" signal: how long the
    operator lets the cube wait is how they want to be reached.

  RATE GOVERNOR (enforced on the cube itself)
    - Max 1 LEAP per hour, max 6 visible gestures (HOP/LEAP) per day.
    - NUDGE coalescing: multiple pending signals inside 10 minutes
      collapse into one NUDGE.
    - Quiet window: no visible gestures during the operator's night face
      (Section 06) or the configured sleep window.
    The governor lives in firmware, not in the app, so that no future
    product pressure can turn the cube into a slot machine by a server
    flag. This is the anti-feed thesis (LOT-CUBIQ-VISION §01) written
    as a hardware invariant.

--------------------------------------------------------------------------------
06 // FACE SEMANTICS — ORIENTATION AS INPUT (D-05)
--------------------------------------------------------------------------------

v0.1 treated the cube only as an output. QI·46 Step 3.3 already expects
the cube to report back. The simplest honest input on a cube is which
face is up. The IMU knows this for free.

  FACE (UP)        MEANING                       CUBE BEHAVIOUR
  ─────────        ───────                       ──────────────
  TOP (logo)       Present — default             Full gesture language
  BASE (piston up) Night / do-not-disturb         All gestures held; queue
                                                  delivered on next TOP
  SIDE 1           Deep work                      NUDGE only
  SIDE 2           Open to the cohort             Cohort resonance pings
                                                  allowed (future)
  SIDE 3           Self-care window               SETTLE on each completed
                                                  self-care item
  SIDE 4           Reserved (v.1)                 —

  With the piston face up the cube physically cannot hop — the safe
  state and the "do not disturb" state are the same object position.
  Turning the cube over becomes a ritual gesture, not a settings toggle.

  Each face change is a deliberate input and is sent as telemetry
  (face_at_rest). It is the first operator-to-cube signal in the system.

--------------------------------------------------------------------------------
07 // v.2 HORIZONTAL MOTION — STICK-SLIP GLIDE (D-07)
--------------------------------------------------------------------------------

v0.1 proposed actuated traction pads for v.2 "swing-hops." R02 records a
lighter alternative to test in parallel on the v.0 bench:

  STICK-SLIP (INERTIAL) GLIDE
    An internal mass on a horizontal axis is moved slowly one way (static
    friction holds the cube still), then snapped back fast (the reaction
    briefly exceeds friction and the cube slides a fraction of a
    millimetre). Repeated at 20-80 Hz, the cube glides across the table
    with no visible moving parts. Two orthogonal axes, or one axis plus
    yaw from an offset drive, give steering.

    Why it fits CUBIQ: silent, slow, legless motion reads as "the object
    came to you" rather than "a robot drove over." It also reuses the
    piezo bimorph (fine steps) and a second small voice coil (coarse
    steps). Friction coefficient of the feet becomes a designed parameter:
    the same elastomer must grip for the HOP and slide for the GLIDE —
    this tension is the v.2 core research question.

  SWING-HOP (from v0.1) remains: a LEAP with yaw pre-rotation (via the
    offset piston) gives directed jumps. GLIDE for approach, swing-hop
    for arrival.

  v.0 BENCH TASK: build a single-axis stick-slip sled at 120 g and measure
    mm/s on wood, glass, laminate. No product commitment.

--------------------------------------------------------------------------------
08 // v.3 LEVITATION — TRACK NARROWED (D-06)
--------------------------------------------------------------------------------

  CLOSED  Acoustic levitation of the cube body.
          Ultrasonic standing-wave levitation holds millimetre-scale,
          low-density objects (beads, droplets). A 45mm, ~100g cube is
          orders of magnitude beyond the acoustic radiation force any
          desk-scale phased array produces. Kept only as a possible
          *secondary* effect (e.g. levitating a few particles of light
          material above the base as a display), not as cube levitation.

  CLOSED  Passive / diamagnetic levitation of the cube body.
          Static permanent-magnet arrangements cannot hold a stable
          levitation on their own (Earnshaw's theorem); diamagnetic
          lift at ~100 g needs field strengths far beyond a consumer
          object.

  OPEN    Active electromagnetic levitation over the charging base.
          This is the class already used in consumer levitating speakers
          and planters that float several-hundred-gram objects 10-20 mm
          above a powered base: a permanent magnet in the floating body,
          a ring of electromagnets plus Hall sensors in the base, and a
          fast control loop. Power can cross the gap inductively.

  WHAT THIS MEANS FOR v.0 — TODAY
    The base pad (v0.1 Section 02: "the charging pad IS the table")
    becomes the future levitation stage. To avoid foreclosing that:
      - Reserve a centred bay in the cube for a disc magnet
        (~25 mm Ø × 5 mm, ~18 g) — empty in v.0, mass budget noted.
      - No ferrous fasteners or ferrite sheets within 15 mm of the bay.
      - The Qi receiver coil and its ferrite shield must be designed so
        a magnet can later sit above it — this is the highest-risk
        compatibility item. Flag for the electronics lead.
      - The base pad's PCB footprint reserves a ring for 4 coils + Hall
        sensors from v.0, unpopulated.
    The long-horizon choreography this enables: the cube HOPs onto its
    base, settles, and rises. Jump → land → levitate is one continuous
    gesture once v.3 lands.

--------------------------------------------------------------------------------
09 // RISKS AND OPEN QUESTIONS
--------------------------------------------------------------------------------

  R-1  Mass: 106 g estimate vs 120 g ceiling with 18 g magnet reserved
       for v.3 → v.3 cube is ~124 g unless the shell loses mass. Nano-
       ceramic composite density is the lever.
  R-2  Piston seal: an exposed plunger collects dust and crumbs. Needs a
       flexible boot; boot stiffness eats into the force budget.
  R-3  LEAP height (~37 mm rise) may feel too theatrical — user test.
  R-4  Qi coil vs future magnet: unresolved (Section 08).
  R-5  Table variance: a soft desk mat absorbs piston energy; cube must
       detect "soft surface" from the first NUDGE response and refuse
       LEAP rather than under-perform it.
  R-6  Pricing link: CQGS lists "$399/mo priority with Quantum Cube sync."
       The hardware BOM must be costed against that tier. Not done yet.

  NEXT REPORT (R03) SHOULD DELIVER
    - Bench results for piston force vs stroke on a printed prototype.
    - Stick-slip sled speeds on three surfaces.
    - First BOM cost estimate against the $399 tier.
    - Use Case 03.

--------------------------------------------------------------------------------
10 // CONSUMER USE CASE 02 — THE NIGHT FACE                      2026-11-19
--------------------------------------------------------------------------------

  (Also appended to LOT-CUBIQ-QUANTUM-CUBE-v0.md, Section 07, per that
  document's append-only rule.)

  Operator profile: Usership tier, 8 months in (Memory Arc "coherence"
  phase), lives alone, has tried and failed three times to keep the phone
  out of the bedroom. The CUBIQ base pad sits on the nightstand.

  At 22:40 the operator finishes the evening self-care list on the
  software cubic. The cube, resting on its SIDE 3 "self-care window" face,
  has performed one SETTLE for each completed item — a two-second
  standing press, nothing visible, just the faint sense that the object
  agreed.

  Then the operator turns the cube over onto its NIGHT FACE — piston up,
  logo down. There is no app, no toggle, no confirmation screen. The cube
  answers with one NUDGE through the nightstand: received. From now until
  morning, nothing it is sent will move it. With the piston pointing at
  the ceiling, it physically cannot hop. The operator can see, from the
  bed, that the cube is face-down — and therefore knows, without checking
  anything, that the system is holding everything for them.

  The phone goes in the kitchen. That is the whole point. The reason the
  phone came to bed was the fear of missing something. The cube replaces
  that fear with a visible promise: everything that arrives tonight is
  being kept.

  Overnight the Memory Engine prepares a question and a rare badge
  unlocks from yesterday's streak. Both queue.

  At 07:15 the operator turns the cube upright. The rate governor
  releases the queue in order, gently: first a NUDGE (the memory
  question is ready), then — thirty seconds later, after a cliff check
  that confirms it is safely in the middle of the base pad — a single
  LEAP for the rare badge. The first thing that "notified" them today
  was an object, not a screen, and it waited until they asked.

  Telemetry: face_at_rest=BASE for 8h35m; time_to_first_touch after the
  morning LEAP: 4 seconds. QI·46 reads this as a strong preference for
  morning delivery and begins scheduling non-urgent signals for the
  upright-at-dawn moment instead of the evening.

  What this use case proves about v.0: orientation is input, the safe
  mechanical state and the do-not-disturb state are the same physical
  position, and the cube can help a person leave the phone outside the
  bedroom — the anti-feed thesis doing something a setting never could.

--------------------------------------------------------------------------------
11 // USE CASE LEDGER
--------------------------------------------------------------------------------

  01  THE DESK MIGRATION   2026-07-28   NUDGE + LEAP, deep-work desk
  02  THE NIGHT FACE       2026-11-19   Face semantics, overnight queue,
                                        phone-free bedroom

  Rule (inherited from v0.1): one new use case per development cycle,
  appended, never rewritten.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-R02
================================================================================
