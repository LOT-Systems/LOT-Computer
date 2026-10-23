================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0.2-ENGINEERING-REPORT
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Cycle 02: Physics Budget & Actuator Lock
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-23
VERSION:  0.2 — DEVELOPMENT CYCLE 02 (scheduled run)
STATUS:   v.0 — PRE-HARDWARE · PAPER PHYSICS CLOSED · ACTUATOR TOPOLOGY AMENDED
PREDECESSOR: docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md (v0.1, 2026-07-28)
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG — WHAT WAS READ BEFORE WRITING
--------------------------------------------------------------------------------

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md       (v0.1 — own prior work, in full)
    Source of the four-gesture vocabulary, the 45mm / <120g reference body,
    the voice-coil + piezo-bias hop, the 500/500 gate, Use Case 01.
  docs/corporate/LOT-CUBIQ-VISION.md                (anti-feed thesis, arc step 4)
  docs/corporate/LOT-CUBIQ-OPERATOR.md              (Index of Systems; Phase 4)
  docs/corporate/LOT_QI46_ENGINE.md                 (Quantum Cube = Month-12 sync,
                                                     haptic preference signal)
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md       (LOT® Institute: piezoelectric,
                                                     bioelectric, nano-ceramic)
  docs/corporate/LOT-AMBIENT-AI-VISION.md           (LOT® Station / Brush; design
                                                     rule "one line, no alarm,
                                                     exact moment")
  docs/corporate/LOT_ROBOTICS_COSMO.md              (COSMO® track — kept separate)
  docs/benchmark/LOT-MANIFEST.md                    (confirms no CUBIQ™ hardware
                                                     entries since v0.1)

  STATE OF THE REPO AT START
    One CUBIQ™ hardware document exists (v0.1). It specifies WHAT the cube does
    and WHICH components it uses. It does not yet prove the numbers. No code,
    CAD, BOM, firmware, or test protocol exists. Cycle 02's job: close the
    physics on paper, find where v0.1 is wrong, lock the actuator, and write
    the test protocol that Cycle 03 (first bench build) executes.

  CYCLE 02 DELIVERABLES
    A. Ballistic budget for every gesture and for the v.1 long jump.
    B. Two corrections to v0.1 (Section 02: Findings F-1, F-2).
    C. Amended actuator topology (Section 03).
    D. Mass and energy budgets (Section 04).
    E. Firmware state machine and safety interlocks (Section 05).
    F. Bench test protocol (Section 06).
    G. Updated roadmap and risks (Sections 07, 08).
    H. Consumer Use Case 02 (Section 09).

  HONESTY NOTE
    Everything below is analytical (first-order ballistics, rigid body, ideal
    collisions). No hardware has been built or measured. Values are design
    targets and gates, not results.

--------------------------------------------------------------------------------
01 // BALLISTIC BUDGET (PAPER PHYSICS)
--------------------------------------------------------------------------------

  Governing relations (flat surface, launch and landing at same height,
  no drag, elevation angle θ measured from the table):
      range  R = v² · sin(2θ) / g
      rise   h = v² · sin²(θ) / (2g)
      KE       = ½ · M · v²          momentum p = M · v          g = 9.81 m/s²

  1.1  THE HOP  (v0.1 spec: <10mm rise, lands in place)
       h = 10mm  →  v = 0.44 m/s  →  KE = 11.8 mJ  →  p = 0.053 N·s  (M=120g)

  1.2  THE LEAP  (v0.1 spec: ~40mm displacement, 5–15° off vertical)
       M = 120g, R = 40mm
         off vertical   θ      v (m/s)   rise h    KE       p (N·s)
         ────────────   ──     ───────   ───────   ──────   ───────
         15°            75°    0.89      37 mm     47 mJ    0.106
         10°            80°    1.07      57 mm     69 mJ    0.129
          5°            85°    1.50      114 mm    136 mJ   0.180

  1.3  THE LONG JUMP  (v.1 target: R > 150mm, M ≤ 90g)
         elevation θ    v (m/s)   rise h    KE       p (N·s)
         ───────────    ───────   ───────   ──────   ───────
         30°            1.30      22 mm     76 mJ    0.117
         35°            1.25      26 mm     70 mJ    0.113
         45°            1.21      38 mm     66 mJ    0.109   ← optimum
         60°            1.30      65 mm     76 mJ    0.117
         80° (v0.1's    2.07      213 mm    194 mJ   0.187   ← absurd
              bias band)

--------------------------------------------------------------------------------
02 // FINDINGS — WHERE v0.1 NEEDS CORRECTION
--------------------------------------------------------------------------------

  F-1  THE LEAP IS A 57mm-TALL EVENT, NOT A FLAT SLIDE.
       v0.1 §04 describes THE LEAP as "~40mm displacement" with a 5–15° bias.
       The table above shows that at that bias the cube rises 37–114mm to
       cover 40mm. Consequences:
         - Peak height is 5–10× the HOP. Landing energy and edge-fall
           consequences scale accordingly; the edge gate (v0.1 §03) must be
           sized for the LEAP, not the HOP.
         - "Presence without spectacle" is at risk: a 57mm vertical bound by a
           45mm cube is clearly visible. That may be correct for rare-badge
           events — but it must be a deliberate choice.
       RESOLUTION: Keep the 10° band for the LEAP (it is a spectacle-class
       gesture, reserved for rare badges). Add a flat-trajectory variant
       "THE SLIDE" (θ ≈ 30–45°, low rise, ~20mm) as a v.1 gesture.

  F-2  THE PIEZO BIAS CANNOT REACH THE LONG JUMP.
       v0.1 §03/§06: a 5–15° piezo bimorph bias gives "forward component"
       and v.1 is "same architecture, re-tuned". At 80° elevation a 150mm jump
       needs 213mm rise and 194 mJ (§1.3). The efficient launch is 30–45°.
       A 5–15° off-vertical bias cannot produce this by retuning.
       RESOLUTION: v.1 needs a tilted launch axis, not a re-timed piezo. Two
       candidates, to be bench-tested in v.1:
         (a) Kick-foot: one actuated foot extends before the strike, pitching
             the cube to ~35° so the slug strike lies along the body diagonal.
         (b) Canted slug axis: the actuator is fixed at 35–45° to the base
             face and the cube is launched from a leading edge/foot.
       v.0 stays vertical + small piezo bias — no change to v.0 scope.

  F-3  VOICE COIL IS THE WRONG v.0 PRIMARY (see Section 03).

--------------------------------------------------------------------------------
03 // ACTUATOR TOPOLOGY — AMENDMENT A-1
--------------------------------------------------------------------------------

  Reaction-mass analysis (hammer-slug model: internal slug of mass m_s is
  driven upward inside the shell and strikes the top stop; momentum transfers
  to the shell; the cube leaves the table).

  LEAP at 10° bias needs p = 0.129 N·s (§1.2), M = 120g:
       slug mass 40g, plastic strike     (restitution e = 0)
         slug speed 3.2 m/s   slug KE 206 mJ   (only ~1/3 reaches the shell)
         over a 12mm stroke → 430 m/s²  → 17 N peak force on the slug
       slug mass 40g, bouncy strike       (e = 0.5)
         slug speed 2.1 m/s   slug KE  92 mJ
         over a 12mm stroke → 190 m/s²  → 7.6 N peak force

  v0.1 chose a voice coil as the primary. A 17 N peak (or even 7.6 N) voice
  coil inside a 45mm cube that also holds a battery, a Qi receiver, and an
  IMU is at or beyond the edge of what the volume allows, and it holds that
  force only by drawing multi-amp peak current from a coin-sized cell.

  AMENDMENT A-1 (adopted for v.0):
    PRIMARY LAUNCH   Spring-latch slug. A small motor/solenoid slowly charges
                     a spring (or magnet-pair) over 0.5–2 s; a micro-latch
                     (SMA wire or micro-solenoid) releases it in <2 ms.
                     Energy is stored slowly, delivered fast. Peak battery
                     draw falls to a few hundred mA.
    SECONDARY        Voice coil is KEPT, demoted to the low-force gestures:
                     THE NUDGE (sub-threshold tremor) and THE SETTLE (2 s light
                     standing pressure). Both need <1 N.
    BIAS             Piezo bimorph bias retained as in v0.1 (5–15° band).
    LEAP STRIKE      Use e ≈ 0.5 elastomer-faced strike; target slug energy
                     ≈ 90–120 mJ per LEAP.

  v0.1 GESTURE TABLE, REVISED ACTUATION MAP
     THE NUDGE   voice coil (<1 N, no liftoff)
     THE SETTLE  voice coil (hold, 2 s)
     THE HOP     spring-latch, low charge  (≈ 12 mJ at the shell, ~35 mJ slug)
     THE LEAP    spring-latch, full charge (≈ 69 mJ at the shell, ~100 mJ slug)

--------------------------------------------------------------------------------
04 // MASS & ENERGY BUDGET
--------------------------------------------------------------------------------

  MASS (target < 120g)
     Nano-ceramic shell (45mm cube, thin-wall)            25 g
     Slug (tungsten-loaded)                                40 g
     Spring, latch, charging motor                          9 g
     Voice coil (nudge/settle)                              6 g
     LiPo ~200 mAh                                          5 g
     PCB: MCU, BLE, IMU, ToF, driver                        8 g
     Qi receiver coil + shielding                           6 g
     Piezo bimorph + feet + LED ring                        5 g
     ─────────────────────────────────────────────────────────
     TOTAL                                                104 g   (16 g margin)

  ENERGY (200 mAh @ 3.7 V ≈ 2.7 kJ)
     One LEAP drawn from battery ≈ 1.4 J at ~7% end-to-end efficiency
       → order of 1,900 LEAPs per full charge (design estimate)
     500/500 gate (v0.1 §06) costs ≈ 0.7 kJ — one battery, one afternoon.
     Qi base pad charges between gestures; the table is the power source.

  CONSTRAINT FOR v.1: <90g target requires the slug to drop to ~30g and the
  spring to hold ≥ 100 mJ — a harder strike regime. Logged as risk R-3.

--------------------------------------------------------------------------------
05 // FIRMWARE STATE MACHINE & SAFETY INTERLOCKS
--------------------------------------------------------------------------------

  STATES
     DORMANT → PAIRED → ARMED → CHARGING_SPRING → READY → FIRING → LANDED
                 ↑                                              │
                 └────────────── RIGHTING ◄── (tilt > 25°) ─────┘
     any state → INHIBIT on fault (edge, tilt, low battery, tamper)

  GESTURE REQUEST FLOW
     1. Index of Systems event → BLE → gesture class (NUDGE/SETTLE/HOP/LEAP)
     2. Pre-fire checks (all must pass):
          a. ToF clearance ≥ (predicted displacement + 20mm) in the forward
             cone; if not, downgrade: LEAP → HOP → NUDGE.
          b. IMU: base tilt < 5° (flat, stationary, not in a hand or bag).
          c. Battery above reserve for one righting pulse after firing.
          d. Do-not-disturb schedule honored (operator-set quiet hours).
          e. Spring state matches gesture class (no over-charge).
     3. FIRING → LANDED: IMU records flight time, tilt, rebound.
     4. Tilt > 25° → RIGHTING micro-pulse, max 2 attempts, then INHIBIT and
        report "needs help" over BLE.

  HARD INTERLOCKS (no v.0 unit ships unless each passes 100/100 trials)
     I-1  Edge: no firing within 20mm of a detected edge, any gesture above
          NUDGE. (Sized for LEAP rise per F-1.)
     I-2  Narrow surface: if ToF detects an edge within 80mm in any direction
          (nightstand, shelf), cap gesture at HOP, in-place only.
     I-3  Lifted/tilted: if the IMU sees the cube held or carried, spring
          discharge is blocked and the spring is relaxed to its safe state.
     I-4  Child/pet guard (hand-proximity ToF at <30mm): fire only NUDGE.
     I-5  Thermal/charge: INHIBIT above 45°C or below the battery reserve.

  TELEMETRY (feeds QI·46 as haptic preference — LOT_QI46_ENGINE.md l.757)
     gesture, flight time, peak tilt, rebound count, clearance at fire,
     operator response latency (via the software cubic opening or a tap).

--------------------------------------------------------------------------------
06 // BENCH TEST PROTOCOL (EXECUTED IN CYCLE 03)
--------------------------------------------------------------------------------

  T-1  SLUG ENERGY CHARACTERIZATION
       Instrument slug exit speed (photogate or 1000 fps video). Targets:
       HOP ≈ 35 mJ, LEAP ≈ 90–120 mJ. 30 shots each, report mean ± σ.
  T-2  SHELL FLIGHT
       Ballistic fit: measured rise/range vs §1.2. Pass: within ±20% of table.
       Surfaces: wood, glass, laminate. 10 trials per gesture per surface.
  T-3  LANDING RECOVERY
       Drop the cube from 60mm at random attitudes: ≥ 95% right themselves
       within 2 pulses. Record failure modes.
  T-4  EDGE GATE (hard)
       100/100 approaches at 3 speeds and 5 approach angles: zero off-table
       events, zero false-inhibit rate above 5%.
  T-5  ENDURANCE
       500/500 hop-and-recover cycles (v0.1 gate). Track spring rate drift,
       latch wear, shell micro-cracks, foot wear.
  T-6  ACOUSTIC / HAPTIC
       NUDGE must be felt but inaudible: ≤ 28 dB(A) at 0.5 m; vibration
       perceptible on a standard desk at ≤ 5 cm. Panel of 10 operators.
  T-7  PRIVACY / SIGNAL
       BLE pairing uses a per-cube key; verify that no gesture can be
       triggered by an unpaired host.

  EXIT CRITERIA FOR v.0 DESIGN LOCK: T-1 through T-5 pass; T-6/T-7 reported.

--------------------------------------------------------------------------------
07 // ROADMAP (UPDATED)
--------------------------------------------------------------------------------

  v.0  CONTROLLED HOP     spring-latch slug + voice coil + piezo bias. Gestures:
                          NUDGE / SETTLE / HOP / LEAP. Gate: T-1…T-5.
  v.1  LONG JUMP          tilted launch axis (F-2). New gesture THE SLIDE (F-1).
                          Target >150mm at 35–45°, M<90g.
  v.2  TABLE-WALK         two actuated feet, yaw control, per-surface friction
                          model, multidirectional edge cone.
  v.3  LEVITATION         research track unchanged from v0.1 (acoustic phased
                          array vs. active magnetic). Added design constraint:
                          the slug's tungsten loading must not preclude a later
                          shell-embedded magnet or acoustic reflector — keep
                          the slug removable (modular core).

--------------------------------------------------------------------------------
08 // RISK REGISTER
--------------------------------------------------------------------------------

  R-1  Spring fatigue / latch wear under 500+ cycles.        MED   test T-5
  R-2  Landing on edge/corner of ceramic shell → chipping.    MED   elastomer
                                                                    corner caps
  R-3  <90g v.1 target conflicts with ≥100 mJ strike.         HIGH  open
  R-4  Off-table falls from LEAP (57mm rise).                 HIGH  I-1, I-2
  R-5  Qi pad heating interacts with piezo/IMU drift.         LOW   T-5 log
  R-6  Noise: spring release click louder than "NUDGE" brand. MED   damped latch
  R-7  Surface variance (glass vs. felt) shifts flight.       MED   T-2 matrix
  R-8  Pets/children interacting with a moving object.        MED   I-4

--------------------------------------------------------------------------------
09 // CONSUMER USE CASES
--------------------------------------------------------------------------------

  Accumulating register — one new, dated entry per development cycle. Entry 01
  lives in LOT-CUBIQ-QUANTUM-CUBE-v0.md §07 (THE DESK MIGRATION, 2026-07-28).
  Entries are never edited after the fact.

  USE CASE 02 — THE BRUSH RELAY                              2026-10-23
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, owns the LOT® Brush and the CUBIQ™ pad,
  which sits on a narrow nightstand. Evening routine matters to them: the
  LOT® Brush event log (docs/corporate/LOT-AMBIENT-AI-VISION.md) is part of
  their self-care signal. They go to bed without opening the app.

  22:40, bedroom, lights low. The LOT® Brush log shows no evening brushing.
  A phone would buzz — and would pull them into the screen they put down an
  hour ago. CUBIQ™ does not.

  Pre-fire checks run (Section 05). The ToF sees the nightstand edge 60mm
  away: interlock I-2 caps the gesture at THE HOP, in place. No LEAP, no
  travel — the cube is told by its own sensors that the nightstand is too
  small for spectacle. The cube performs one HOP, <10mm rise, landing
  exactly where it stood. It is felt through the wood and heard as a soft
  tick, not seen on a screen.

  The operator, half asleep, reaches out, feels the cube is upright and
  in place, picks up the Brush and goes to the bathroom. Picking the cube up
  is itself a signal: I-3 relaxes the spring; the IMU logs "held". The
  session telemetry (response latency: 31 s) goes back into QI·46 as haptic
  preference — a nighttime HOP works, a NUDGE was too faint, a LEAP would
  have been wrong for this surface.

  Next morning there is no "missed notifications" list. Only the Index of
  Systems carries a quiet line: "Evening brush — done, 22:44."

  WHY THIS USE CASE MATTERS FOR THE BUILD
    It makes the safety interlocks a consumer feature, not an engineering
    footnote: the cube that refuses to leap on a small surface is the same
    cube that can be trusted on a nightstand. It also opens the first
    consumable-to-cube coupling (Brush → Index → Cube), which is the
    mechanism by which hardware products become signal sources for one
    another (LOT_QI46_ENGINE.md: "self-care as signal source").

--------------------------------------------------------------------------------
10 // NEXT CYCLE (03) — PLANNED
--------------------------------------------------------------------------------

  1. CAD-ready dimensioned drawing of the 45mm shell and internal layout.
  2. Bill of materials with candidate part classes and unit costs (10-unit
     prototype run).
  3. BLE gesture protocol (packet format, pairing, rate limits).
  4. Firmware skeleton: state machine of Section 05 as a simulatable module,
     with a ballistic simulator that regenerates the tables of Section 01.
  5. Use Case 03.
  6. LOT® Institute white-paper outline: "Haptic Presence — Notification
     Without Attention."

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0.2-ENGINEERING-REPORT
================================================================================
