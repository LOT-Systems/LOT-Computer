================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-SR-20261022-01
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-22
VERSION:  0.2 — PHYSICS BUDGET, FIRMWARE ARCHITECTURE, TEST PLAN
STATUS:   v.0 — PRE-HARDWARE, DESIGN LOCK STILL PENDING
PARENT:   docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md (v0.1, 2026-07-28)
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing:

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md     v0.1 spec (the base this extends)
  docs/corporate/LOT-CUBIQ-VISION.md              cubic as spatial experience; physical arc
  docs/corporate/LOT-CUBIQ-OPERATOR.md            Phase 4 "Physical Extension (Days 90+)"
  docs/corporate/LOT-AMBIENT-AI-VISION.md         Ambient AI™: "always present, never loud";
                                                  Usership table lists "Hardware: not
                                                  connected" -> LOT® Station + Brush live
  docs/corporate/LOT_QI46_ENGINE.md               cube as Month-12 INPUT device (haptic prefs)
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md     "Quantum Cube Hardware" PLANNED line item
  docs/benchmark/LOT-MANIFEST.md                  COSMO® Cube is a separate track; no
                                                  naming collision

v0.1 left four things open. This report closes the first three and records
the fourth:

  1. Numbers: no energy / power / mass budget existed. (Section 02)
  2. An internal inconsistency in the v0.1 gesture table. (Section 03)
  3. No firmware / safety architecture. No test plan. (Sections 04-06)
  4. Levitation mechanism choice. (Section 07 — recommendation only)

No hardware has been built. Every figure below is a first-order analytical
estimate (rigid body, ideal projectile, no air drag) intended to size the
design, not to certify it. Bench measurement supersedes everything here.

--------------------------------------------------------------------------------
01 // WHAT CHANGED SINCE v0.1
--------------------------------------------------------------------------------

  - Added a quantified energy budget for Hop / Leap / v.1 Long Jump / v.2 Swing.
  - FOUND AND FIXED a spec inconsistency: v0.1 pairs a 5-15° forward bias
    with a ~40mm displacement and a "<10mm rise" hop. These do not hold
    together (Section 03). Gesture table amended.
  - Defined the firmware state machine and the safety interlock order.
  - Defined the v.0 closing test protocol (500-cycle gate) and instrumentation.
  - Narrowed the levitation recommendation from "two candidates" to one
    primary path, one drop (Section 07).
  - Added USE CASE 02 (Section 09); appended, unchanged, to the parent spec.

--------------------------------------------------------------------------------
02 // PHYSICS BUDGET (FIRST-ORDER)
--------------------------------------------------------------------------------

Basis: shell+internals mass m, launch speed v, launch angle θ above
horizontal, g = 9.81 m/s². Range R = v²·sin(2θ)/g. Apex rise
h = v²·sin²(θ)/(2g). Kinetic energy at launch KE = ½·m·v².

  MOTION                  m      TARGET            θ     v       KE      RISE
  ──────                  ───    ──────            ───   ────    ────    ────
  HOP (v.0)               120g   10mm rise         90°   0.44    11.8mJ  10mm
                                 in place                m/s
  LEAP (v.0, AMENDED)     120g   40mm range        45°   0.63    23.5mJ  10mm
                                                         m/s
  LEAP (v0.1 AS WRITTEN)  120g   40mm @ 15° bias   75°   0.89    47mJ    37mm
                                                         m/s
  LONG JUMP (v.1)          90g   150mm range       45°   1.21    66mJ    37mm
                                                         m/s
  LONG JUMP, steep alt.    90g   150mm range       60°   1.30    76mJ    65mm
                                                         m/s

Reading the table:

  - The whole v.0 gesture set lives under ~50 mJ of launch energy. That is
    small. Voice-coil and even small solenoid actuators are comfortably
    in range; this is not an exotic-actuator problem.
  - The v.1 Long Jump costs ~3x the v.0 Leap in energy, not 4x the range
    in difficulty — range grows linearly with v² while mass drops 25%.
    The mass diet (120g -> 90g) is worth roughly a quarter of the energy.

  ACTUATOR SIZING (striker architecture, v0.1 Section 03)
    The reaction mass is driven into the base and transfers momentum
    inelastically. Assuming a 30g striker and a partly inelastic impact,
    expect 20-30% of striker kinetic energy to reach the shell:
        Leap  23.5mJ  ->  striker ~ 90-120 mJ  (≈ 2.5 m/s striker speed)
        v.1   66mJ    ->  striker ~ 220-330 mJ
    Design for 4x margin on the v.0 figure; the spec target is
    >=120 mJ striker energy, adjustable in firmware down to the Nudge.

  POWER AND BATTERY
    Energy per leap is trivial against a ~100 mAh / 3.7 V cell (~1.3 kJ).
    The binding constraint is PEAK POWER: ~120 mJ delivered in ~5 ms is
    ~24 W. Spec a supercapacitor (or low-ESR cell + bulk capacitance) to
    supply the pulse; the Qi coil trickle-charges it. Battery life is not
    the v.0 risk. Pulse delivery and thermal duty cycle are.

  LANDING LOAD
    Drop from a 37mm apex (worst case above) lands at ~0.85 m/s. Four
    elastomer feet plus the shell's own compliance must absorb this
    without chipping the nano-ceramic corners. Corner radius >=1.5mm and
    foot Shore A 40-50 are the starting values.

  v.2 SWING (RECORD ONLY)
    Directed walking is a friction problem, not an energy problem. Required
    traction: horizontal impulse per step must stay below μ·(normal impulse)
    or the cube slides instead of stepping. Wood, glass, and laminate span
    roughly a 2x range in μ, so the gait cannot be open-loop. This confirms
    v0.1: v.2 needs the IMU closed loop and a per-surface calibration hop.

--------------------------------------------------------------------------------
03 // SPEC AMENDMENT — THE LEAP
--------------------------------------------------------------------------------

v0.1 Section 03 specifies a 5-15° bias off vertical. v0.1 Section 04 then
calls for ~40mm displacement from that bias while keeping the cube a
low "hop". At 15° off vertical (θ = 75°) a 40mm range needs a ~37mm apex.
The cube would rise nearly 4x higher than the Hop and be airborne longer —
a different gesture, and a harsher landing.

  AMENDMENT (supersedes v0.1 for the Leap only):

    HOP     vertical, <10mm rise, in place (unchanged)
    LEAP    ~45° launch, ~40mm displacement, ~10mm rise
            (flat, fast, low — reads as a "step" not a "bounce")

  Mechanism consequence: a 45° launch cannot come from a 5-15° piezo
  bias. The striker axis must be canted, or the base face must carry a
  fixed 45° wedge strike plate. Preferred v.0 option: CANTED STRIKER
  (single actuator, no second mechanism; Hop = striker fired at the
  vertical strike plate, Leap = striker rotated 45° by the piezo bimorph
  before release). The bimorph therefore moves from "bias after release"
  to "aim before release". Net parts count unchanged.

  Gate impact: the 40mm displacement tolerance stays; add a landing
  radius spec of +/-10mm for the Leap.

--------------------------------------------------------------------------------
04 // FIRMWARE ARCHITECTURE
--------------------------------------------------------------------------------

Principle: the cube may refuse; it may never improvise. Every motion is
requested by a signal and gated by sensors. No gate, no motion.

  STATES
    DOCKED        on charging pad, supercap topped, no motion allowed
                  except THE SETTLE. Default resting state.
    ARMED         off pad on a surface, edge scan complete, awaiting signal
    SCANNING      ToF sweep + IMU level check (<=200ms)
    FIRING        striker released
    FLIGHT        IMU free-fall detected; actuators locked out
    LANDED        impact detected; settle timer
    RECOVER       tip angle >25° -> corrective micro-pulse (max 2 attempts)
    FAULT         3 failed recoveries, low supercap, or sensor fault ->
                  stop, LED ring pairing-red, report; require dock to clear

  INTERLOCK ORDER (every gesture, every time; first failure aborts)
    1. SIGNAL VALID       gesture requested by the Index of Systems driver
    2. LEVEL              IMU tilt <8° (not on a slope or a book)
    3. EDGE               ToF: no surface boundary inside gesture envelope
                          + 20mm margin (v0.1). On fail: downgrade to Nudge.
    4. ENERGY             supercap above threshold for requested gesture
    5. QUIET HOURS        gesture amplitude capped by operator's schedule
    6. RATE LIMIT         max 1 Hop/Leap per 60s, max 12 per hour;
                          the cube must not become the notification spam
                          that the software cubic exists to oppose

  DOWNGRADE LADDER
    Leap -> Hop -> Nudge -> Settle -> (silent, log only)
    A refused gesture is logged. Refusals are data, not errors.

  SIGNAL PATH
    Index of Systems event -> CUBIQ driver (maps event to gesture, v0.1
    Section 04 table) -> firmware request -> interlocks -> motion ->
    IMU telemetry (peak accel, flight time, landing offset, tip angle) ->
    summarized to QI·46 as the haptic-preference signal. Raw IMU data
    stays on-device; only the per-gesture summary leaves.

  PRIVACY NOTE
    The ToF and IMU are the only sensors. No camera, no microphone. This
    is a hard spec line: an object that moves unattended in a home earns
    trust only by being unable to watch.

--------------------------------------------------------------------------------
05 // MASS AND PACKAGING BUDGET (45 x 45 x 45 mm, <120 g)
--------------------------------------------------------------------------------

  Item                                  Target mass    Note
  ────                                  ───────────    ────
  Nano-ceramic shell (2mm wall)         32 g           largest single item
  Striker + voice coil + spring         34 g           30g striker is the lever
  Supercap + 80 mAh cell                18 g
  Qi receive coil + board               9 g            base-face coil
  MCU + IMU + ToF + piezo driver        6 g
  Piezo bimorph aiming element          3 g
  Elastomer feet x4, LED ring, misc     6 g
  ─────────────────────────────────────────────
  TOTAL                                 108 g          12 g reserve

  Volume check: 45mm cube = 91 cm³. Shell wall displaces ~22 cm³, leaving
  ~69 cm³ for internals. Striker stroke of 8 mm at 25 mm diameter is
  ~4 cm³. Feasible, but tight enough that the cell + supercap placement
  decides the build. First prototype shell should be 3D-printed resin
  (not ceramic) to iterate geometry; ceramic comes at design lock.

  v.1 mass diet (120g -> 90g): thin the shell wall to 1.4mm, drop the cell
  to 50 mAh with a larger supercap. Ceramic wall thickness is the risk.

--------------------------------------------------------------------------------
06 // TEST PLAN AND CLOSING GATES
--------------------------------------------------------------------------------

  BENCH STAGES
    T0  Striker rig, shell bolted to a load cell: measure impulse vs
        coil current. Output: current -> launch energy lookup table.
    T1  Free shell on a flat wood plate, high-speed camera (240 fps
        minimum), 50 hops. Measure rise, drift, tip angle.
    T2  Add canted striker: 50 Leaps. Measure range and landing radius.
    T3  Edge rig: table edge at 10 distances, 10 approach angles. The
        hard gate: cube inhibits at <=20mm margin, 100/100.
    T4  Thermal: 60 gestures/hour for 4 hours; coil and supercap
        temperature <55°C at the shell surface.
    T5  Closing gate (v0.1): 500/500 hop-and-recover cycles, zero
        off-table landings, zero actuator failures.

  INSTRUMENTATION
    On-device IMU (1 kHz), external camera, load cell, thermocouple.
    Every run logs firmware version, surface, supercap voltage, ambient
    temperature. Results go to docs/benchmark as a LOT-SR report.

  FAILURE PRIORITY
    1. Any off-table fall            -> stop all testing, root cause first
    2. Any coil/supercap overheat    -> stop, redesign duty cycle
    3. Missed rise/range target      -> tune, not a blocker
    4. Cosmetic chipping of corners  -> track, fix at ceramic stage

--------------------------------------------------------------------------------
07 // LEVITATION — RECOMMENDATION FOR THE v.3 RESEARCH TRACK
--------------------------------------------------------------------------------

v0.1 left two candidates open. Recommendation: pursue (b), active
electromagnetic levitation; drop (a) for this object.

  (a) ACOUSTIC — DROP
      Standing-wave levitation holds light, small objects (millimetre
      scale, milligram to gram class). A 45mm, ~100g object is two to
      three orders of magnitude beyond that regime. The table-as-array
      idea remains valid for small satellite objects (a future 10mm
      LOT® token), not for the Cube.

  (b) ACTIVE ELECTROMAGNETIC — PRIMARY
      Earnshaw's theorem forbids passive static stable levitation with
      permanent magnets alone, so the table needs a servo loop: a
      Hall-sensor array reading the cube's magnet, a coil array
      adjusting current at kHz rates. A 100g object at 10-20mm gap is
      within hobby-to-lab maglev practice. Cost is power (levitation is
      continuously powered, unlike a hop) and the cube must carry a
      magnet, which interacts with the Qi coil and the IMU magnetometer
      (the v.0 IMU is 6-axis, so no magnetometer to corrupt).

  DESIGN CONSEQUENCES TO LOCK NOW (cost nothing at v.0)
    - Reserve a 15mm x 15mm x 5mm pocket on the cube's top-centre axis
      for a future magnet; it holds a mass dummy in v.0.
    - Keep the Qi coil on the base and keep it shielded.
    - Keep the 6-axis IMU choice: no magnetometer.
    - Specify the charging pad as a modular top plate over a service
      cavity, so the coil array can be added without a new pad.

  CLAIM CONTROL: nothing in this document claims that levitation works.
  It records the shortest credible path to find out.

--------------------------------------------------------------------------------
08 // RISKS
--------------------------------------------------------------------------------

  R1  A hopping object is a fall hazard to itself and to a pet's attention.
      Mitigation: edge gate, rate limit, quiet hours, a "pad-only" mode
      where the cube refuses all motion except on the dock.
  R2  Noise. A striker impact is audible. Target <35 dBA at 0.5m for the
      Hop; if missed, the notification language shifts toward Nudge.
  R3  Surface variability (soft desk mats, glass, tablecloths). The
      level + surface calibration hop must detect "too soft" and refuse.
  R4  Trust. Motion that wasn't asked for reads as a defect. The driver
      only ever maps documented signals to documented gestures.
  R5  Brand collision with COSMO® Cube. Mitigated per v0.1 Section 00.
  R6  Regulatory. Wireless charging, moving consumer product, small parts
      for children. Legal review needed before any pilot. Not assessed here.

--------------------------------------------------------------------------------
09 // CONSUMER USE CASES (RUNNING LOG)
--------------------------------------------------------------------------------

  USE CASE 01 — THE DESK MIGRATION                          2026-07-28
  (see parent spec, Section 07. Unchanged.)

  USE CASE 02 — THE SILENT ALARM                            2026-10-22
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier. Hard of hearing, wears no hearing
  aids at night. Has missed a phone alarm twice this year; relies on a
  vibrating wristband that she finds uncomfortable to sleep in. The
  CUBIQ pad is on the nightstand, 120mm from the edge, with a book
  beside it.

  The existing alternatives all fail her differently. A phone alarm is
  audio first. A strobe lamp wakes the whole household. A wristband is a
  body-worn device. A bed shaker is a separate product and mattress
  dependent. None of them is something she wants to look at, or live
  with, in the room where she recovers.

  With CUBIQ hardware: the evening before, at wind-down time, the cube
  performs THE SETTLE (v0.1, Section 04) — two seconds of standing
  pressure, nothing visible — the same ritual every night. It tells her
  the day is closed and the alarm is armed. In the morning, at the time
  she set, escalation runs as a ladder she chose:

      1. THE NUDGE, repeating every 20s, felt through the nightstand wood
         and through the pillow-side hand she rests on it
      2. THE HOP, after 2 minutes unacknowledged
      3. THE LEAP, after 4 minutes, only toward the bed side

  Three firmware gates matter more here than anywhere else:
      - EDGE: the nightstand edge is 120mm from the pad. v.0's 40mm Leap
        is allowed; the ToF margin refuses anything that would approach
        the 20mm limit; if the book beside the pad is moved, the scan sees
        the new geometry and downgrades the gesture instead of guessing.
      - NIGHT CAP: amplitude is capped below the Hop until the alarm
        time, so a 3am signal from the Index of Systems (a badge unlock,
        a cohort ping) cannot move the cube at all. Only the alarm and
        the operator's own override may.
      - ACKNOWLEDGE: she stops it by lifting the cube back onto the pad.
        Docking is the only dismissal. No screen, no tap, no voice.

  Why this is a v.0 use case and not a v.1 one: nothing here needs range.
  It needs the Nudge, the Hop, a short Leap, the edge gate, and the dock
  as an acknowledgement. The Long Jump (v.1) would improve it (a cube that
  can cross a wider nightstand to reach the hand) and the surface swing
  (v.2) would too, but the product is already real without either.

  What it tests for the roadmap: whether a notification language built for
  attention-respect ("presence without spectacle") also works as an
  accessibility tool when the only channel left is touch. If yes, the
  Nudge is the most valuable gesture the cube has, which would reorder
  the engineering priority toward silent, low-amplitude actuation (R2) over
  jump range.

  Data returned to QI·46 (per Section 04): which escalation step woke her,
  time to dock, and whether the nightly Settle was followed by sleep-onset
  signals logged in the morning check-in. Per-gesture summaries only.

  APPEND RULE
    The next session adds USE CASE 03 below this line. Do not edit or
    remove prior entries. Candidate directions not yet used: shared
    household (two operators, one pad), a child's room (pad-only mode),
    a kitchen counter, a hospital bedside, and a travel-case dock.

--------------------------------------------------------------------------------
10 // NEXT STEPS
--------------------------------------------------------------------------------

  N1  Bench T0: striker rig and load cell, validate the energy table.
  N2  Decide canted-striker vs fixed 45° wedge for the Leap (Section 03).
  N3  Order resin shell + voice coil + 6-axis IMU + ToF dev kit.
  N4  Write the CUBIQ driver spec: Index of Systems events -> gestures.
  N5  Legal review (R6) before any pilot.
  N6  Name USE CASE 03 and append it.

  DESIGN LOCK CRITERIA (unchanged from v0.1, restated):
    T3 (edge gate) 100/100 and T5 (500 cycles) both pass.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-SR-20261022-01
================================================================================
