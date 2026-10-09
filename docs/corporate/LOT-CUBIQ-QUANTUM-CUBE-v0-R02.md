================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-R02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-09
VERSION:  0.2 — ENGINEERING ANALYSIS + USE CASE 02
STATUS:   v.0 — PRE-HARDWARE, PHYSICS BUDGET CLOSED, DESIGN LOCK PENDING
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing (per the rule in LOT-CUBIQ-QUANTUM-CUBE-v0.md §07):

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md   (R01, 2026-07-28)
    Spec: 45mm / <120g cube, voice-coil + reaction mass, piezo bias,
    IMU righting, ToF edge gate, four gestures (NUDGE / HOP / LEAP /
    SETTLE), roadmap v.0 hop -> v.1 long jump -> v.2 table-walk ->
    v.3 levitation (research). Use Case 01 "The Desk Migration."
  docs/corporate/LOT-CUBIQ-VISION.md             anti-feed thesis; physical
    products as completion of the cubic.
  docs/corporate/LOT-CUBIQ-OPERATOR.md           Index of Systems signals;
    Phase 4 physical extension.
  docs/corporate/LOT_QI46_ENGINE.md, CQGS-WHITE-PAPER-SNAPSHOT.md
    LOT® Institute corpus: piezoelectric / nano-ceramic / bioelectric
    line items; cube as Month-12 calibration INPUT.

R01 specified WHAT the cube does. R02 asks whether the numbers in R01 close,
and records what they imply. No prior document contained a physics budget.

--------------------------------------------------------------------------------
01 // WHAT CHANGED SINCE R01
--------------------------------------------------------------------------------

  - No hardware exists yet; this cycle is analytical. Findings below are
    first-order calculations (rigid body, no air drag, no surface losses),
    to be replaced by bench data from the first prototype.
  - Three R01 inconsistencies found and resolved (§02).
  - Energy, power and battery budgets added (§03-§04).
  - v.1 launch geometry revised (§05).
  - Test and validation plan for the v.0 gate added (§06).
  - Use Case 02 added (§08).

--------------------------------------------------------------------------------
02 // FINDINGS — R01 INTERNAL CONSISTENCY
--------------------------------------------------------------------------------

F1. THE LEAP IS NOT A SMALL HOP.
    R01 sets THE LEAP at ~40mm displacement with 5-15° bias off vertical.
    At 15° off vertical (75° launch angle) a 40mm range needs
    v = 0.886 m/s, which gives an apex of ~37mm (nearly the cube's own
    height) and ~174ms airtime. R01's "<10mm rise" applies to THE HOP only.
    Resolution: R01 numbers are consistent, but the LEAP is a visible
    ~37mm flight, not a low skip. Landing-recovery and edge-gate margins
    must be sized for LEAP, not HOP. Edge inhibit distance (20mm, R01 §03)
    is too small for a 40mm LEAP: raise the LEAP inhibit to 60mm
    (displacement + 20mm margin); keep 20mm for HOP.

F2. REACTION-MASS ENERGY IS DOMINATED BY COLLISION LOSS.
    R01 describes a spring-loaded reaction mass driven against the base.
    If it strikes the shell (inelastic), the hammer must carry
    m_shell * v / m_hammer velocity. Hammer 40g, shell 120g, LEAP:
    2.66 m/s and 141mJ, versus 47mJ of useful flight energy: ~33%
    transfer. Resolution: prefer a DIRECT-DRIVE stroke (coil pushes
    the shell off a fixed stator through the stroke) over a strike, or a
    lighter/faster hammer with an elastomer-free rigid stop. Recommend
    v.0 prototypes both (A: strike, B: direct stroke) and keeps the one
    with higher measured transfer and lower noise.

F3. THE PIEZO BIAS CANNOT BE THE DIRECTIONAL SOURCE.
    R01 uses a piezo bimorph firing ms after release to bias the leap.
    Piezo bimorphs deliver millinewton-class force at sub-mm travel; the
    lateral impulse required for 15° bias is ~0.106 N·s * sin15° =
    ~27 mN·s, orders of magnitude beyond a bimorph tick. Resolution:
    the bias is produced mechanically by TILTING the stator axis 15°
    (fixed wedge in v.0). The piezo is retained as a micro-tuner of
    contact timing and as the NUDGE tremor actuator, where it is
    well-suited. This keeps the Institute-named piezoelectric element
    in the design for the right job.

--------------------------------------------------------------------------------
03 // ENERGY AND MOMENTUM BUDGET (v.0, M = 120g)
--------------------------------------------------------------------------------

  GESTURE   TARGET             TAKEOFF v   APEX     KE     MOMENTUM
  ───────   ──────             ─────────   ────     ──     ────────
  HOP       10mm rise          0.44 m/s    10mm     11.8mJ 0.053 N·s
  LEAP      40mm range @75°    0.89 m/s    37mm     47mJ   0.106 N·s
  v.1 JUMP  150mm range @75°   1.72 m/s    140mm    177mJ  0.206 N·s
  v.1 JUMP  150mm range @45°   1.21 m/s    37mm     88mJ   0.146 N·s

  Direct-drive stroke (F2, option B): for LEAP with 8mm stroke the mean
  acceleration is v²/(2s) = ~49 m/s² (~5g); mean force ≈ M(a+g) = ~7N.
  Voice coils of ~25mm diameter reach this peak briefly (duty < 1%), so
  LEAP is feasible without exotic actuators. v.1 at 45° needs
  ~92 m/s² over 8mm (≈9g, ~12N mean at 120g) — the design driver for
  v.1 coil sizing and thermal limits.

--------------------------------------------------------------------------------
04 // POWER AND BATTERY
--------------------------------------------------------------------------------

  Pack: 3.7V 100mAh LiPo ≈ 1.33kJ. Assume 25% electrical-to-kinetic
  efficiency (coil + driver + collision). LEAP ≈ 0.19J drawn; HOP ≈ 0.05J.
  Even at 10 LEAPs/day the actuator is <2J/day; standby (BLE sleep +
  IMU wake-on-motion, ~30µA) dominates: ~0.72mAh/day → ~140 days standby
  on 100mAh before the pad recharges it. The Qi pad (R01 §02) makes this
  non-binding; the cube returns to the pad "home" position to charge.
  Burst delivery: a small supercap (0.1F, 5V) charges between gestures so
  the LiPo never sees a 3A pulse.

  IMPLICATION: mass, not energy, is the binding v.0 constraint. Battery
  (~3g), coil+magnet stack (~35g) and shell (~25g) already consume
  ~63g of the 120g budget; target allocation in §07.

--------------------------------------------------------------------------------
05 // v.1 AND v.2 REVISIONS
--------------------------------------------------------------------------------

  v.1 LONG JUMP — change the launch angle, not just the power.
    R01 retunes stroke/mass/bias for >150mm. At the R01 15° bias this is
    a 140mm-high flight (3x the cube's height), 177mJ, and a tumbling
    landing. Launching at ~45° gives the same 150mm range at 37mm apex
    and half the energy (88mJ). Revised v.1: mechanical tilt adjustable
    by a small cam (15° for LEAP, 45° for JUMP); the same stator, same
    coil, one added servo-free detent. Spin control: asymmetric thrust
    line through the centre of mass; IMU gates "commit" if pitch rate
    at takeoff exceeds 200°/s.

  v.2 HORIZONTAL SWING / TABLE-WALK — keep the hop, add yaw.
    The "swing" is best built as a pivot-hop: land on one edge/foot pair,
    yaw 5-10° per hop via the asymmetric foot pads, advance ~30mm per
    hop, 6-7 hops for the 200mm gate. This reuses the v.0 actuator with
    no second linear axis; only the foot-pad friction asymmetry and IMU
    heading loop are new. Closed-loop heading from gyro integration plus
    pad-mounted optical-flow chip for drift.

  v.3 LEVITATION — unchanged, research only. One addition: levitation
    height scales with the pad's field/acoustic aperture; keep the pad
    footprint at ≥120×120mm in v.0 industrial design so the future array
    fits the same chassis.

--------------------------------------------------------------------------------
06 // v.0 VALIDATION PLAN (BEFORE THE 500/500 GATE)
--------------------------------------------------------------------------------

  B1  Bench actuator: measure force-vs-stroke for options A and B;
      choose by transfer efficiency and sound level (<35 dBA at 30cm).
  B2  Drop-rig calibration: cube dropped from 10/40mm onto wood, glass,
      laminate — measure bounce, tip angle, righting success.
  B3  High-speed video (240fps phone suffices) of HOP/LEAP: confirm
      apex 10mm / 37mm and range 40mm ±10mm.
  B4  Edge gate: 100/100 approach trials at 20mm (HOP) and 60mm (LEAP)
      per R01 hard gate.
  B5  Endurance: 500/500 hop-and-recover (R01 gate), thermal check of
      coil (<60°C surface) with 1 LEAP/10s duty.
  B6  Telemetry: IMU log → QI·46 "haptic preference" packet schema
      (pressure, duration, cadence — QI46 line 757), dry-run offline.

--------------------------------------------------------------------------------
07 // MASS BUDGET (TARGET <120g)
--------------------------------------------------------------------------------

  Shell (nano-ceramic composite)           25g
  Coil + magnet + stator                   35g
  Moving mass / spring (option A hammer)   (counted in above; option B 0g)
  Battery 100mAh + supercap                 6g
  PCB (MCU+BLE, IMU, ToF, driver)           8g
  Qi receiver coil                          5g
  Feet, LED ring, fasteners                 6g
  Ballast / margin                         35g   <- spend on v.1 weight cut
  ─────────────────────────────────────────────
  TOTAL                                   120g

  Lever for v.1 (<90g): trim margin and move to a lighter shell.

--------------------------------------------------------------------------------
08 // CONSUMER USE CASES (APPEND-ONLY)
--------------------------------------------------------------------------------

  USE CASE 01 — THE DESK MIGRATION                          2026-07-28
  See LOT-CUBIQ-QUANTUM-CUBE-v0.md §07 (unchanged).

  USE CASE 02 — THE KITCHEN-TABLE HANDOFF                   2026-10-09
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, parent of two, archetype "Caretaker,"
  CARE index high / ENG moderate. Evenings: laptop closed, phone in a
  drawer by house rule. The CUBIQ pad sits in the middle of the kitchen
  table, which doubles as homework desk.

  Problem today: the operator's evening self-check (5-11 min) is the
  first thing dropped when dinner runs long. A phone reminder would mean
  taking the phone out — the exact behavior the house rule forbids — and
  would be seen by the children as "work on the phone."

  With CUBIQ v.0: at the operator's learned window (QI·46 rhythm: ~20:40),
  after the plates are cleared, the cube performs THE SETTLE — a two-second
  standing pressure, imperceptible to the children, felt by the operator's
  forearm resting on the table. No chime, no light. If the operator has
  not opened the cubic by 21:10, THE NUDGE repeats once, and only once;
  QI·46 learns from the telemetry that a second nudge was the effective
  one and shifts tomorrow's first signal later by 15 minutes.

  When the operator finally opens the cubic and the session completes,
  THE HOP fires once as the assembly phase advances ("forming" ->
  "assembled"). The younger child sees the cube jump and asks what it is.
  The operator answers in one sentence. The cube has turned a private
  self-care ritual into something a family can see without a screen —
  and the only data that leaves the table is the haptic-preference packet
  (pressure, cadence), not the conversation.

  Hardware traits this use case exercises: SETTLE and NUDGE (no liftoff,
  safe around children), edge gate (kitchen table with a hard rim and a
  child's elbow — the 20mm HOP inhibit must hold), single-repeat
  notification policy (anti-feed: the cube never escalates beyond two
  signals per window).

--------------------------------------------------------------------------------
09 // NEXT CYCLE (R03)
--------------------------------------------------------------------------------

  1. Build the B1 bench rig (BOM and wiring sheet) and record first
     force-vs-stroke numbers.
  2. Choose actuator option A or B.
  3. Draft the BLE gesture API (signal class -> gesture) as a schema.
  4. Use Case 03 (append; do not edit 01-02).

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-R02
================================================================================
