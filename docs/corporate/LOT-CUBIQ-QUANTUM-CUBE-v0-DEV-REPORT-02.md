================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-DEV-REPORT-02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report, Cycle 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-20
VERSION:  0.2 — PHYSICS AUDIT + ARCHITECTURE AMENDMENTS + USE CASE 02
STATUS:   v.0 — PRE-HARDWARE. DESIGN LOCK STILL PENDING (see Section 09)
PARENT:   docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md (spec v0.1, 2026-07-28)
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read in full before writing this report:

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md   (spec v0.1 — the parent)
  docs/corporate/LOT-CUBIQ-VISION.md             (anti-feed thesis, physical arc)
  docs/corporate/LOT-CUBIQ-OPERATOR.md           (Index of Systems, Phase 4)
  docs/corporate/LOT_QI46_ENGINE.md              (piezo / nano-ceramic line 110;
                                                  cube-as-input, lines 750-764)
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md    (Institute corpus; hardware
                                                  row "PLANNED")
  docs/corporate/LOT-AMBIENT-AI-VISION.md        (QIoT™, LOT® Station, LOT® Brush
                                                  — the existing LOT hardware the
                                                  cube must coexist with)
  docs/corporate/LOT_ROBOTICS_COSMO.md           (COSMO® line; naming boundary)

REPO STATE AT THIS CYCLE
  - Spec v0.1 is the only CUBIQ-hardware document. No prior dev report exists;
    this is Report 02 in the sense that the spec itself was cycle 01 (Use
    Case 01 lives there).
  - No firmware, CAD, schematic, BOM or test-rig artifact exists in the repo.
    84 days have passed since spec v0.1 with no hardware progress on record.
    This report does not pretend otherwise: everything below is analysis and
    design, nothing is measured. Numbers are first-order engineering
    estimates (rigid body, no losses unless stated) and are labelled as such.

WHAT THIS REPORT DOES
  1. Audits spec v0.1's physics before any hardware money is spent (Sec 02-03).
  2. Proposes amendments A-01..A-05 to the v.0 architecture (Sec 04).
  3. Defines firmware, test rig and gates so v.0 can be closed (Sec 05-07).
  4. Extends the roadmap to v.1 / v.2 / v.3 with corrected parameters (Sec 08).
  5. Adds Consumer Use Case 02 and a queue for later cycles (Sec 10).

--------------------------------------------------------------------------------
01 // EXECUTIVE SUMMARY
--------------------------------------------------------------------------------

  The v.0 concept holds. Two parts of spec v0.1 do not survive a physics
  check as written and need amendment before a design lock:

  F-1  ACTUATOR CLASS. A voice-coil reaction mass cannot deliver the Leap
       gesture inside a 45 mm / <120 g envelope (peak power ~14 W for 5 ms,
       reaction mass at ~4 m/s). A motor-wound spring with a latch can.
       -> Amendment A-01.

  F-2  BIAS ANGLE. A 5-15° off-vertical bias gives 40 mm of travel only
       with a 37-57 mm rise. The Hop (<10 mm rise) therefore cannot also be
       a displacing gesture, and v.1's 150 mm long jump is a LAUNCH-ANGLE
       problem (30-45°), not a stroke-length problem. -> Amendments A-02, A-03.

  F-3  "UPRIGHT". A cube has six identical stable faces. "Right it if it
       tips past 25°" is only meaningful for rocking on an edge/corner, not
       for a face-change. The spec must define landing success, and the
       base face (charging, ToF) must be the one that lands down or the
       cube must tolerate any face. -> Amendment A-04.

  F-4  EDGE SENSING. A forward-facing ToF sensor sees obstacles, not
       drop-offs. An edge is a range discontinuity from a DOWN-looking
       sensor. -> Amendment A-05.

  None of these changes the product thesis (a notification you feel, not
  see). They change what is built first.

--------------------------------------------------------------------------------
02 // PHYSICS AUDIT — FIRST-ORDER NUMBERS
--------------------------------------------------------------------------------

Rigid-body projectile, M = 0.120 kg, g = 9.81 m/s², flat landing at launch
height. "Off-vertical" is the angle between the launch vector and the
surface normal. Energy is kinetic energy at liftoff.

  GESTURE TARGET            OFF-VERT   LIFTOFF v   RISE      ENERGY
  ───────────────           ────────   ─────────   ──────    ──────
  Hop, 10 mm rise, in place     0°      0.44 m/s   10 mm      12 mJ
  Leap, 40 mm travel           10°      1.07 m/s   57 mm      69 mJ
  Leap, 40 mm travel           15°      0.89 m/s   37 mm      47 mJ
  Leap, 40 mm travel           30°      0.67 m/s   17 mm      27 mJ
  Leap, 40 mm travel           45°      0.63 m/s   10 mm      24 mJ
  Long jump, 150 mm            45°      1.21 m/s   38 mm      88 mJ
  Long jump, 150 mm            30°      1.30 m/s   65 mm     102 mJ
  Long jump, 150 mm            15°      1.72 m/s  140 mm     177 mJ
  Long jump, 200 mm            45°      1.40 m/s   50 mm     118 mJ

  READINGS
  - The spec's Leap (5-15° bias) is a ~40-55 mm vertical jump that happens
    to drift 40 mm. That is a large, noisy, attention-grabbing motion —
    not the "small, deliberate greeting" Use Case 01 describes.
  - The same 40 mm of travel at 30-45° needs only 10-17 mm rise and
    24-27 mJ — a third of the energy and far quieter on landing.
  - The 150 mm long jump costs ~90-100 mJ at 30-45°. That is well inside
    a spring-latch budget. At 15° it would cost ~180 mJ and a 140 mm rise
    (a cube that leaps a hand-width into the air). Low-angle long jumps are
    the wrong design.
  - Flight time for a 57 mm rise is ~0.22 s; for a 10 mm hop ~0.09 s. The IMU
    must sample >= 1 kHz to see liftoff, apex and touchdown cleanly.

  ENERGY AND POWER
  - Leap (47-69 mJ) in a 5 ms release implies 9-14 W peak. A voice coil in a
    45 mm cube, fed from a ~3.7 V / 300 mAh cell, will not deliver that
    without a bulk capacitor bank and a mass that wants to be >30 g.
  - Percussive reaction-mass launch (spec v0.1 wording): a 30 g mass
    striking the base must hit at ~4.3 m/s (~275 mJ of kinetic energy) to
    give the 120 g shell 1.07 m/s. ~4x the useful energy is spent in the
    mass. Rejected.
  - Spring-latch: E = ½kx². For 100 mJ over x = 8 mm, k ≈ 3.1 kN/m — an
    ordinary stamped music-wire spring. A small geared motor winds it over
    ~0.5-2 s at < 1 W. Battery cost per leap is ~0.1 J of ~4 kJ stored
    (300 mAh x 3.7 V): ~40,000 leaps of headroom per charge; the pad
    recharges between uses anyway.

  MASS BUDGET (estimate, 45 mm cube, target < 120 g)

  ITEM                              MASS (g)   NOTE
  ──────────────────────────────   ────────   ─────────────────────────────
  Nano-ceramic shell (2 mm wall)      30-38    densest single item; see A-03
  Spring + cam + latch + gear train   14-20    dominant mechanical mass
  Micro motor (6 mm class)             3-5
  LiPo 3.7 V ~250-300 mAh             7-9
  PCB: MCU, IMU, ToF x2, charger,
       Qi receiver coil, BLE          10-14    coil is ~3-5 g
  Piezo bias element + driver          2-3
  Elastomer feet / corner bumpers      4-6
  Fasteners, wiring, margin            5-8
  ──────────────────────────────   ────────
  TOTAL                               75-103   under 120 g with margin
  (v.1 target < 90 g is reachable only at the low end; do not promise it.)

--------------------------------------------------------------------------------
03 // THE FOUR FINDINGS IN DETAIL
--------------------------------------------------------------------------------

  F-1 ACTUATOR CLASS
    Spec v0.1 Sec 03 specifies a voice-coil that drives a spring-loaded
    reaction mass "downward against the base face." Two problems: (a) an
    internal mass can only move the shell by striking it, and strike
    efficiency is poor (Sec 02); (b) peak electrical power is out of reach
    for the cell. Springs do the high-power part mechanically; the motor
    only has to be strong over time.

  F-2 BIAS ELEMENT
    The piezoelectric bimorph in the spec "fires a millisecond after
    release to bias the leap 5-15°." A bimorph that small stores on the
    order of microjoules; against a 50-100 mJ launch it cannot steer the
    vector by 5°, let alone 30°. Piezo is retained, but as (i) the quiet
    sub-threshold NUDGE actuator, (ii) a contact/touchdown sensor, and
    (iii) a fine trim — not as the bias mechanism. Launch angle is set
    mechanically: the spring axis is canted, or the foot contact line is
    offset from the centre of mass (see A-02).

  F-3 LANDING AND "UPRIGHT"
    A cube has no up. What it has is a base face with the charge coil and
    the downward ToF. Two honest options: design the cube to land on any
    face (symmetric: coil + sensors replicated, mass budget +6-8 g), or
    constrain the hop so that the base face always lands down (rotation
    during flight < ~15°). v.0 chooses the second and writes it as a gate
    (A-04). A vertical actuator cannot rotate a cube from one face to
    another, so the spec's "corrective micro-pulse" only applies when the
    cube is rocking on an edge or corner (tilt < ~45°, i.e. not yet over
    the tipping line). Anything beyond that is a FAULT state (Sec 05).

  F-4 EDGE DETECTION
    The spec's forward-facing ToF cannot tell a table edge from a clear
    table. v.0 needs a downward-angled ToF per planned travel direction:
    an edge appears as a sudden increase in range (or loss of return).
    v.0 hops only along the +X face normal, so ONE forward-down sensor is
    sufficient for v.0; a second, rear-down sensor is added for v.2 when
    travel becomes multi-directional. Glass, black laminate and glossy
    surfaces are the known ToF failure case — see risk R-3.

--------------------------------------------------------------------------------
04 // PROPOSED AMENDMENTS TO SPEC v0.1 (FOR S-2 DECISION)
--------------------------------------------------------------------------------

  A-01  ACTUATOR: replace voice-coil/reaction-mass with a motor-wound
        spring-latch (cam-and-pawl). Latch release by micro solenoid or SMA
        wire. One spring, one cam, one motor.
        Gesture energy is set by wind position (variable preload), which
        makes NUDGE / HOP / LEAP three points on the same dial.
        Cost: mechanical complexity (~20 parts) vs. spec; benefit: 4x energy
        efficiency, ~1 W instead of ~14 W peak.

  A-02  LAUNCH VECTOR: define the Leap at 35° off-vertical (not 5-15°),
        giving ~40 mm travel at ~12-14 mm rise and ~30 mJ. Realised by
        canting the spring axis; no moving part needed. The Hop remains a
        vertical, in-place, ~10 mm gesture (0° spring axis position selected
        by a second cam lobe or a swappable wedge in the rig).
        v.0 prototype may use a printed wedge between spring and shell so
        angle is a 3D-printed variable, not a design commitment.

  A-03  MATERIAL: keep nano-ceramic as the production shell line (LOT_QI46
        line 110) but prototype v.0 in 3D-printed PA12 or resin at the same
        2 mm wall and target mass. Ceramic shells are brittle under
        repeated 10-20 g landing shocks; ceramic is validated in a drop test
        (Sec 07, T-6) before it is promised. Elastomer corner bumpers are
        mandatory either way.

  A-04  LANDING SUCCESS CRITERIA (new, replaces "upright"):
        L-1 base face down within 10° of surface plane after settling;
        L-2 final position within 20 mm of predicted landing point (Hop)
            / 15 mm of predicted (Leap);
        L-3 settle time < 0.5 s;
        L-4 no more than one bounce.
        A cube that comes to rest on any other face enters FAULT_TIPPED:
        no further hops, a slow LED ring pulse, BLE report to the app.

  A-05  EDGE SENSING: forward-down ToF (45° down, 40 mm look-ahead on the
        surface) replaces forward-flat ToF. Inhibit hop if range at the
        look-ahead point exceeds the surface-range baseline by > 8 mm.
        Baseline is re-measured every wake (the cube may be moved between
        surfaces). Second ToF (rear-down) reserved on the PCB for v.2.

--------------------------------------------------------------------------------
05 // FIRMWARE ARCHITECTURE (v.0)
--------------------------------------------------------------------------------

  MCU CLASS      BLE-capable Cortex-M4/M33-class SoC (nRF52840-class
                 reference). Sleep-dominant: duty cycle < 0.5 % of day.
  LINK           BLE 5 to a paired phone/hub running the LOT® app. The
                 cube does NOT hold personal data: it receives a gesture
                 ID + intensity and returns telemetry (Sec 06). Meaning is
                 resolved upstream in the Index of Systems.

  STATE MACHINE

    SLEEP ─(BLE event)─▶ WAKE ─▶ SURFACE_CHECK ─▶ ARMED
       ▲                              │              │
       │                    fail ─────┘              │ gesture authorised
       │                       ▼                     ▼
       │                  DEGRADE_NUDGE         WIND_SPRING
       │              (in-place only)                │
       │                                             ▼
       │                                        RELEASE ─▶ FLIGHT ─▶ LAND
       │                                                              │
       └──────────── REPORT ◀───── SETTLE_CHECK ◀─────────────────────┘
                                         │ L-1..L-4 fail
                                         ▼
                                   FAULT_TIPPED  (no hops until placed by hand
                                                  and IMU reports base-down, still)

  SURFACE_CHECK (every wake, before any gesture above NUDGE)
    - IMU: level within ±5° and stationary
    - ToF-down: baseline range, edge look-ahead per A-05
    - Battery above leap threshold (spring wind peak current)
    - Not mid-charge-pad handshake (cube on Qi pad performs NUDGE only,
      never launches off its own charger)

  HARD INHIBITS (any one -> degrade to NUDGE or refuse)
    tilt > 5°, edge flag, battery < 20 %, temperature outside 5-40 °C,
    motion detected in last 2 s (someone is holding it), >= 3 gestures in the
    last 60 s (anti-nag), operator Quiet Hours.

  ANTI-NAG RULES (product behaviour, not safety)
    - Max one Leap per 15 min, max six gestures per hour in v.0.
    - Escalation never increases amplitude; it only repeats NUDGE.
    - Operator may set "Never leap" (NUDGE/SETTLE only) per signal class.

--------------------------------------------------------------------------------
06 // TELEMETRY AND QI·46 LOOP
--------------------------------------------------------------------------------

  Per gesture the cube reports, at most, 64 bytes:

    gesture_id, commanded_energy, wind_position, flight_time_ms,
    peak_accel_g, landing_tilt_deg, displacement_est_mm (IMU double-integral,
    flagged low-confidence), settle_ms, edge_flag, battery_pct, fault_code.

  - flight_time and landing_tilt are the quantities QI·46 calibrates on
    ("pressure, duration, cadence" proxy — LOT_QI46_ENGINE.md line 757).
  - Operator reaction signals (hand-touch within N seconds, cube picked up,
    gesture dismissed in app) are ADDED by the app, not inferred by the cube.
  - Only the QI·46 calibration deltas leave the device; raw IMU streams do
    not leave the cube.

--------------------------------------------------------------------------------
07 // TEST RIG AND GATES — HOW v.0 IS CLOSED
--------------------------------------------------------------------------------

  RIG (target <= $400 of parts, one bench, one week)
    - Printed 45 mm test shell, interchangeable launch wedge (0/15/30/45°)
    - Dev-kit MCU + IMU + ToF + motor driver on a carrier PCB
    - Overhead 240 fps camera (phone) with 5 mm grid mat for ground truth
    - Surfaces: oak, glass, matte laminate, felt desk mat
    - Edge fixture: surface with adjustable, padded drop-off + catch tray

  TESTS

  T-1  Spring characterisation. Wind position vs. launch energy
       (10 energy points x 20 repeats). Output: energy lookup table.
  T-2  Launch-angle sweep. 0/15/30/45° wedge x 50 hops on wood.
       Output: travel vs. rise vs. angle, compared to Sec 02.
  T-3  Hop repeatability. 100 in-place hops. PASS: rise 10 ±3 mm, drift
       < 20 mm, L-1..L-4 met in >= 98.
  T-4  Leap accuracy. 100 hops on each of 3 surfaces. PASS: travel
       40 ±8 mm, L-1..L-4 met in >= 95 per surface.
  T-5  Edge gate (spec's hard gate, preserved). 100 approaches to the
       fixture edge from 100 mm, from varied headings within ±20°, on wood,
       laminate and glass. PASS: 100/100 inhibited, zero falls.
       Glass and glossy-black surfaces are tested explicitly (R-3).
  T-6  Shock and endurance. 5,000-cycle Leap soak, then 1 m drop onto wood
       x 6 faces. PASS: no functional change; ceramic prototype shell
       survives or A-03 is closed as "polymer only for v.0".
  T-7  Acoustic. Landing noise measured at 0.5 m. TARGET: Hop < 35 dBA, Leap
       < 42 dBA on wood, < 38 dBA on felt mat. (Targets, not yet measured.)
  T-8  Thermal/charge. 20 gestures/hour for 8 h on Qi pad at 25 °C, no
       cell temperature above 45 °C.

  v.0 CLOSE GATE (supersedes the 500-cycle line in spec v0.1 Sec 06)
    T-3, T-4, T-5, T-6 pass; 500/500 hop-and-recover cycles with zero
    off-surface landings; zero actuator failures; FAULT_TIPPED rate
    < 2 % of Leaps. One mechanical unit, three builds, same results.

--------------------------------------------------------------------------------
08 // REVISED ROADMAP PARAMETERS
--------------------------------------------------------------------------------

  v.0  CONTROLLED HOP         spring-latch, A-01..A-05, gates in Sec 07.
  v.1  THE LONG JUMP          150 mm at 40-45° launch, ~90-100 mJ, <= 40 mm
                              rise; higher-preload spring + stiffer wedge;
                              NOT a longer coil stroke. Landing accuracy
                              target 60 mm zone (unchanged). Needs
                              landing-bump damping for ~25 g touchdown.
                              Rise at 45° is lower than v.0's Leap, so the
                              long jump is quieter than the spec implies.
  v.2  TABLE-WALKING          Yaw torque from the two actuated feet is still
                              the unknown. Alternative to evaluate before
                              building: chained 30-45° micro-leaps with the
                              IMU heading estimate and a per-surface
                              friction table, using v.1 hardware only. If
                              chained leaps hit < 15 mm cross-track, the
                              actuated traction pads are unnecessary.
  v.3  LEVITATION (RESEARCH)  Unchanged: recorded, not scheduled. Updated
                              notes in Sec 09 R-6.

--------------------------------------------------------------------------------
09 // RISKS, OPEN QUESTIONS, AND DECISIONS NEEDED
--------------------------------------------------------------------------------

  R-1  ACTUATOR CHANGE (A-01) invalidates the spec's "voice-coil" line.
       Decision needed: S-2 approves A-01 or requests voice-coil
       feasibility proof (needs a capacitor-bank prototype).
  R-2  RESIDENTIAL SAFETY. A hopping object needs a defined impact energy
       (30-100 mJ is < a dropped coin from table height). Pinch points:
       cam and spring must be fully enclosed. Third-party consumer-product
       review (UL/IEC class) is a post-v.0 task but the enclosure is
       designed to it from day one.
  R-3  ToF on glass / glossy black: known weak case. Mitigation candidates:
       secondary downward IR reflectance sensor; cap-sense on feet. T-5 is
       the pass/fail.
  R-4  Noise vs. "peripheral awareness" thesis. A loud hop is a failed
       notification. T-7 targets are provisional; first prototype decides.
  R-5  Table-as-charger (spec Sec 02) conflicts with edge safety: the
       cube starts every gesture ON the pad, so the pad must have a raised
       lip or the first hop is the most dangerous one. Pad design added to
       the v.0 deliverables (padded 2 mm lip, 80 mm landing apron).
  R-6  LEVITATION notes. Acoustic levitation lifts light beads (mm scale)
       and is not known to carry a 100 g cube; active magnetic levitation
       needs continuous power and sensing in the pad. Neither is a v.0-v.2
       commitment. The mass budget should stay < 120 g so the research
       question is not foreclosed. Institute follow-up: literature pass,
       no hardware.
  R-7  NAMING. COSMO® Cube (general-purpose hardware computer, under
       Kuzya's COSMO® brand) and CUBIQ™ Quantum Cube (notification body)
       must stay distinct in all copy, as spec v0.1 already requires.
  R-8  NO HARDWARE ARTEFACT YET. The first physical step is the Sec 07 rig.
       Until T-1/T-2 produce measured data, every number in Sec 02 is an
       estimate.

  DECISIONS REQUESTED FROM S-2
    D-1  Approve or reject A-01 (spring-latch).
    D-2  Approve A-02 Leap angle (35°) — changes Use Case 01's motion
         profile from "visible bound" to "short low scoot".
    D-3  Approve A-03 prototype in polymer, ceramic deferred to T-6.
    D-4  Approve anti-nag defaults (Sec 05).
    D-5  Authorise rig purchase (<= $400) or confirm a hardware partner.

--------------------------------------------------------------------------------
10 // CONSUMER USE CASES (APPEND-ONLY REGISTER)
--------------------------------------------------------------------------------

Rule carried forward from spec v0.1 Section 07: one new consumer use case
per development cycle, numbered and dated, never edited after the fact.
Use Case 01 (The Desk Migration, 2026-07-28) lives in the parent spec.
Use Case 02 below is mirrored there so the register stays in one place.

  USE CASE 02 — THE TWO-MINUTE HOP                          2026-10-20
  ─────────────────────────────────────────────────────────────────
  Consumer profile: a parent with a child aged 5-8, Usership tier, who
  already owns the LOT® Brush (connected toothbrush) and LOT® Station.
  The cube lives on the bathroom counter, charging on its pad, 150 mm
  from the sink edge behind a raised lip.

  Today: brushing is a nightly negotiation. A phone timer means handing a
  child a screen at bedtime — the opposite of the LOT® anti-feed position
  (LOT-CUBIQ-VISION.md, Section 01). The toothbrush alone reports the
  event only after it ends (LOT-AMBIENT-AI-VISION.md).

  With CUBIQ v.0 + LOT® Brush (QIoT™ fusion):
   - Child starts brushing. The Brush reports "brush active" over BLE.
     The cube does nothing. No light, no sound. It is simply there.
   - At 60 s, THE NUDGE: a faint tremor in the counter. The child feels
     it with a hand on the sink: "halfway."
   - At 120 s, the Brush reports target duration reached. THE HOP: one
     small in-place bounce, ~10 mm, on a soft landing mat. The child
     laughs. This is the reward and the signal in one physical event —
     no screen, no score, no sound beyond a soft tap.
   - If the child brushed under 60 s, the cube stays still (SETTLE). It
     never punishes; it only withholds the hop.
   - The parent's phone gets a single quiet line: "Brushing complete,
     2:03." Streaks become a weekly Index of Systems row, not a nightly
     alert.

  Why this belongs to CUBIQ's v.0 primitive set:
   - It uses the in-place Hop, the one gesture v.0 can close first. The
     Leap, the long jump and any table travel are NOT needed.
   - It needs the edge gate and the pad lip most of all — a counter-top
     edge, a wet surface, and a child's hands. The use case therefore
     makes R-5 (pad lip) and T-5 (edge) non-negotiable for any consumer
     SKU, and adds a requirement not in spec v0.1:
       * Bathroom use needs water ingress protection (IPX4 target) and
         a damp-surface traction check (foot elastomer on wet laminate/
         ceramic tile) — new test T-9, below.
   - It exercises the QIoT™ model (Brush signal -> Index of Systems ->
     cube gesture) without touching the Memory Engine's psychological
     depth data. The cube never learns what the child's data means; it
     receives "gesture: hop, intensity: low".

  Constraints raised (carried into the backlog):
   - CHILD DATA. The brushing log is a minor's behavioural record. The
     cube holds none; the app holds the minimum (duration, timestamp).
     Any LOT® Person™ training use of this data (LOT-CUBIQ-OPERATOR.md,
     Section 06) requires an explicit parental opt-in, and legal review
     for COPPA-class rules before this use case ships as a product.
   - PINCH AND SMALL-PARTS. A child-adjacent hopping object is a toy-
     adjacent product regardless of how it is marketed. The enclosure
     must pass a small-parts and pinch review at the post-v.0 stage;
     v.0 prototypes are not given to children.
   - ANTI-NAG. The hop fires once per brushing session, never in
     response to a missed brushing.

  T-9  (new test) Wet-surface gate: 100 Hops on a wet ceramic/laminate
       surface. PASS: drift < 30 mm, zero off-surface events, no ingress
       after 30 s splash test at IPX4 target.

  BACKLOG FOR LATER CYCLES (candidates; each run takes ONE, in this order,
  and appends it above — do not batch)
   UC-03  Night-stand wake: the Settle replaces the alarm tone
          (tests the quietest gesture, light-sleep timing, no screen).
   UC-04  Kitchen air: LOT® Station CO₂/VOC spike -> Nudge on the counter
          (QIoT™ fusion #2; ties to the Station already shipping).
   UC-05  Elder check-in: cube hops once when a family member sends a
          "thinking of you" ping (needs v.1 range for a bedside table).
   UC-06  Focus break: Leap toward the keyboard when the operator has
          typed for 90 min without pause (the v.2 "approach" gesture).
   UC-07  Pet distance: confirm the cube is not mistaken for a toy by a
          cat (safety, not a feature) — needs a pet-safe amplitude profile.

--------------------------------------------------------------------------------
11 // NEXT-CYCLE WORK ORDER (CYCLE 03)
--------------------------------------------------------------------------------

  1. S-2 decisions D-1..D-5 (Sec 09).
  2. If D-1 approved: write the spring-latch dimensional sketch and parts
     list (cam profile, pawl geometry, spring wire diameter for 3 kN/m).
  3. Order or build the Sec 07 rig; run T-1 and T-2 and replace Sec 02 with
     measured data.
  4. Append Use Case 03.
  5. If rig not available: produce the BOM with named vendors and a quote
     list instead of more analysis. (Paper progress has diminishing
     returns after this report.)

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-DEV-REPORT-02
================================================================================
