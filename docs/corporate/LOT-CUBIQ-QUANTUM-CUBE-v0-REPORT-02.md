================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-09
VERSION:  0.2 — PHYSICS CLOSURE, ENGINEERING BASELINE, TEST PLAN
STATUS:   v.0 — PRE-HARDWARE. DESIGN LOCK STILL PENDING (see §09)
================================================================================

Scope of the brief: v.0 of an actuated haptic notification device capable of
(1) long jumps, (2) horizontal surface swings/jumps on a table, and
(3) eventually levitation. Per the standing rule in v0 §07, each cycle adds
one new consumer use case. This cycle adds USE CASE 02 (§08).

Report 01 = LOT-CUBIQ-QUANTUM-CUBE-v0.md (the v.0 spec, 2026-07-28).
Report 02 = this document. It does NOT replace the spec; it closes the
physics the spec left open, corrects one mechanism error, and turns the
spec into a buildable, testable baseline.

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing (all in docs/corporate unless noted):

  LOT-CUBIQ-QUANTUM-CUBE-v0.md   My own prior output. Spec, 4 gestures,
                                 roadmap v.0→v.3, Use Case 01.
  LOT-CUBIQ-VISION.md            Anti-feed thesis; physical products arc.
  LOT-CUBIQ-OPERATOR.md          Signals from the Index of Systems that
                                 drive gestures; Phase 4 physical extension.
  LOT-AMBIENT-AI-VISION.md       NEW to this cycle. Ambient AI™ design rule
                                 "one line, no alarm, exact moment";
                                 QIoT™; LOT® Station (air quality) and
                                 LOT® Brush as existing hardware signal
                                 sources. The cube becomes their physical
                                 voice. Basis for Use Case 02.
  LOT_QI46_ENGINE.md             Cube as INPUT device (Month-12); piezo /
                                 nano-ceramic named.
  CQGS-WHITE-PAPER-SNAPSHOT.md   "Quantum Cube Hardware — PLANNED" line item.
  benchmark/LOT-MANIFEST.md      COSMO® Cube is a separate hardware track.
                                 CUBIQ™ stays a notification body, not a
                                 computer.

Institute basis (LOT® Institute corpus, reused not reinvented): piezoelectric
mechanics, nano-ceramic shell, QI·46 Calibration Loop telemetry, Ambient AI™
interaction rule, Quantum Certified Factory sensing philosophy.

--------------------------------------------------------------------------------
01 // STATUS vs THE BRIEF
--------------------------------------------------------------------------------

  CAPABILITY             TIER   STATE AFTER THIS REPORT
  ─────────────────────  ─────  ─────────────────────────────────────────
  Controlled hop         v.0    Specified; physics closed (§02); test
                                plan written (§06). No hardware yet.
  Long jump (>150 mm)    v.1    Feasibility computed (§03). Needs a
                                ~3.4× energy budget. Plausible, not proven.
  Surface swing/walk     v.2    Concept + gait model (§04). Research.
  Levitation             v.3    Honest feasibility assessment (§05).
                                Research track only. No claim made.

Nothing in this document claims a built or measured device. All numbers are
first-order analytic estimates to be replaced by bench data.

--------------------------------------------------------------------------------
02 // PHYSICS CLOSURE — THE v.0 HOP
--------------------------------------------------------------------------------

2.1  CORRECTION D-01 TO THE v.0 SPEC (mechanism sequencing)

  Spec §03 says the actuator "drives a spring-loaded internal reaction mass
  downward against the base face." That is wrong as written. An internal
  mass pushed down and stopped by the shell exchanges momentum only with
  the shell; the centre of mass of the whole cube leaves the table only if
  the TABLE pushes up harder than weight, and a downward-moving internal
  mass cannot make that net impulse persist after it is arrested.

  Corrected mechanism — "slap-up" (hammer) sequence:
    1. Voice-coil accelerates reaction mass m_r UPWARD inside the shell,
       through stroke s, while the cube sits on its feet (ground reaction
       carries the coil's recoil — no liftoff yet, because m_r·a < M·g
       is NOT required; the shell is simply pressed into the pad).
    2. m_r strikes a compliant stop at the top of the shell (elastomer
       bumper). Collision is near-inelastic; momentum m_r·v_r is shared
       with the shell: the whole body leaves the table at
           v0 = m_r · v_r / M        (M = total mass)
    3. Flight is ballistic. Landing absorbed by the four elastomer feet.
  This is the standard mechanism of impulse-hopping microrobots; it needs
  one coil, one mass, one bumper — consistent with "mechanically boring".

2.2  BUDGET (M = 0.120 kg, g = 9.81 m/s²)

  Liftoff speed for a given vertical rise h:   v = sqrt(2·g·h)
  Energy delivered to the body:                E  = ½·M·v²  = M·g·h

  GESTURE  TARGET                    v0 (m/s)   E_body (J)   NOTE
  ───────  ────────────────────────  ─────────  ───────────  ──────────────
  HOP      rise 8 mm, in place       0.40       0.0094       <10 mm per spec
  LEAP     range 40 mm, bias 15°     0.89       0.047        rise ≈ 37 mm
                                                              flight 0.175 s

  Check on LEAP: launch 15° off vertical → range R = v²·sin(2·75°)/g
  = 0.5·v²/g; R = 40 mm → v = 0.89 m/s. Vertical component 0.86 m/s → rise
  37 mm. FINDING D-02: the spec's LEAP is a 37 mm-high hop, not a flat
  skip. The ToF edge gate (spec §03) must therefore assume ~175 ms of
  airtime and ±5 mm landing scatter; margin 20 mm → raised to 25 mm.

2.3  REACTION MASS AND COIL SIZING (LEAP, worst case)

  Choose m_r = 0.040 kg (one third of M). Required strike speed
      v_r = M·v0 / m_r = 0.120 · 0.89 / 0.040 = 2.67 m/s
  Kinetic energy of the slug: ½·0.040·2.67² = 0.143 J.
  Over a 10 mm stroke the mean force is 14.3 N (≈36× the slug's weight),
  coil peak ~20 N. Voice-coil of this class (≈ Ø20 mm) at ~60-70 %
  electrical-to-kinetic efficiency during a burst is achievable; assume
  40 % to include drive losses → ~0.36 J electrical per LEAP.

  Battery: 3.7 V / 200 mAh LiPo ≈ 2.7 kJ. One LEAP ≈ 0.4 J drawn from a
  capacitor bank (burst current ~6 A for ~15 ms exceeds what a coin-size
  LiPo should supply directly) → supercap/film-cap buffer of ~10 mF @ 5 V
  (E = ½CV² = 0.125 J … use 2×, 20 mF, for margin). Idle drain dominates
  daily energy, not hopping: even 200 LEAPs/day ≈ 80 J ≈ 3 % of cell.

2.4  PIEZO BIAS (spec §03) — RE-SCOPED

  A bimorph "firing a millisecond after release" cannot generate meaningful
  lateral impulse at these masses (piezo bimorph tip force is mN-class).
  RE-SCOPE: the forward bias comes from geometry — the coil axis is tilted
  15° from the shell axis so the strike impulse vector is itself biased.
  The piezo element is retained for (a) the NUDGE (sub-threshold tremor
  driven at 150–250 Hz, the most perceptible band for skin/desk coupling)
  and (b) as an impact/landing sensor. Same Institute-named component
  class; honest job.

2.5  LANDING RECOVERY — RE-CHECKED

  Self-righting of a 45 mm cube by a micro-pulse works only for tilt just
  past the tipping point (corner-balance ≈ 54.7° for a cube about an edge
  is the unstable equilibrium; the 25° trigger is inside the stable basin
  and mostly means "rocking"). So:
    - v.0 recovery = wait for rocking to settle, flag only if resting
      face ≠ base (IMU gravity vector) → raise operator-visible FAULT via
      the app, no self-flip attempt.
    - Active self-righting (a flip pulse from a corner-mounted second coil)
      is moved to v.1 backlog (item B-07).

--------------------------------------------------------------------------------
03 // v.1 — THE LONG JUMP (feasibility)
--------------------------------------------------------------------------------

  Target: R > 150 mm, landing zone ±30 mm (60 mm zone), M < 90 g.

  Use a more horizontal launch: 45° gives R = v²/g → v = sqrt(0.15·9.81)
  = 1.21 m/s. E_body = ½·0.090·1.21² = 0.066 J (≈ 1.4× the v.0 LEAP, not
  3.4× — the 45° geometry is far more efficient than the 15° bias).
  Apex height at 45° ≈ R/4 = 38 mm, flight ≈ 0.175 s … 0.25 s.
  Slug: m_r = 0.035 kg → v_r = 3.1 m/s, KE_slug = 0.168 J, stroke 12 mm
  → ~14 N mean. Within the v.0 coil family with a longer stroke and 30 %
  more drive voltage. VERDICT: feasible with the v.0 actuator class.
  The real v.1 problem is landing scatter, not power: compliant bounce on
  wood/glass/laminate differs; mitigate with a landing-pad model and a
  restitution-tuned foot durometer (Shore 40A candidate).

  v.1 changes vs v.0: coil tilt 15°→ selectable 15°/45° via two coils
  (one at each angle, fire one) — avoids a moving gimbal. Mass: remove
  Qi receiver coil from shell → charging via pogo contacts at base (saves
  ~8 g) or accept 105 g and shorten stroke target. Decide at v.1 review.

--------------------------------------------------------------------------------
04 // v.2 — SURFACE SWING / TABLE WALK (concept)
--------------------------------------------------------------------------------

  Two viable gaits, ranked by mechanical simplicity:

  GAIT A — STICK-SLIP HOPPING (preferred): sequence of low hops (HOP-class
    rise 3-5 mm) with the coil tilted 60° toward the direction of travel;
    each hop steps ~12-20 mm. A 200 mm traverse = ~12 hops ≈ 3 s at 4 Hz.
    Steering by choosing which of four tilted coils (±X, ±Y strike axis)
    fires. No actuated feet needed. This SUPERSEDES the spec's "two
    actuated traction pads" and removes the yaw-torque axis, cutting
    parts. Position estimate by IMU dead reckoning, corrected by the table
    surface if it is the LOT® pad (optical-fiducial or capacitive grid).

  GAIT B — ASYMMETRIC-FRICTION VIBRATION (bristle-bot): sustained 100–200
    Hz vibration on angled bristle feet creates smooth creeping at 10–30
    mm/s. Quiet and cheap, but low steering authority, and poorly suited to
    the "swing" the brief describes. Retained as the low-power "drift
    toward operator" gesture only.

  GATE (unchanged): 200 mm directed traverse, <15 mm cross-track error,
  50/50 trials, 3 surfaces, zero edge incidents. New hard requirement:
  4-direction ToF (or 2 ToF + IMU yaw) edge detection, 25 mm margin.

--------------------------------------------------------------------------------
05 // v.3 — LEVITATION (honest assessment)
--------------------------------------------------------------------------------

  Required lift for M = 0.12 kg: F = M·g = 1.18 N, continuously.

  (a) ACOUSTIC (phased-array standing wave, 40 kHz transducer array under
      or around the cube): published acoustic levitation traps lift
      millimetre-scale, low-density objects (≲ tens of mg). A 120 g solid
      cube is roughly four orders of magnitude beyond that. NOT VIABLE for
      this mass. Viable only for a tiny, hollow decorative "satellite"
      element ≲ 1 g — i.e. not the cube.
  (b) ACTIVE ELECTROMAGNETIC (Earnshaw-compliant servo loop: Hall sensor +
      PID on an electromagnet, as in maglev display bases): 120 g to several
      hundred g is commercially routine at 10–30 mm gap, ~5–15 W continuous
      draw for the pad. This is the ONLY credible path for the full cube.
      Cost: the cube gains a permanent magnet + a ferrous/magnetic element,
      constrains the shell (no shielding), and levitation hover is
      one-dimensional stable — hops are replaced by hover-bob gestures.
  (c) DIAMAGNETIC (pyrolytic graphite over a magnet array): passive and
      silent but lifts only ~mm gap at low load, needs a precision magnet
      lattice. Decorative only.

  RECOMMENDATION: designate (b) as the v.3 reference architecture. Design
  consequence NOW (v.0/v.1): keep the LOT® charging pad a fully replaceable
  module (pad = dumb Qi at v.0; pad = maglev driver at v.3) and reserve a
  Ø20 mm × 5 mm magnet pocket in the cube's base. Costs ~2 g, nothing else.

  Note: levitation and hopping are mutually exclusive on one object at one
  time; v.3 notification vocabulary is hover amplitude/rate (bob, tilt-hold,
  slow drop), not ballistic motion. This is a language redesign — recorded
  in backlog B-12, not scoped.

--------------------------------------------------------------------------------
06 // v.0 BUILD BASELINE AND TEST PLAN
--------------------------------------------------------------------------------

6.1  ARCHITECTURE (BLOCKS)

  MCU            BLE-class SoC (nRF52-family / ESP32-C3 candidate). BLE to
                 the phone; phone/app relays Index of Systems signals.
  ACTUATOR       1× voice-coil, 40 g slug, tilted 15°; H-bridge + cap bank.
  SENSORS        6-axis IMU (landing, orientation); piezo (nudge/impact);
                 ToF forward (+ 3 more at v.2); hall sensor (pad presence).
  POWER          200 mAh LiPo, Qi RX, 20 mF buffer, protection IC.
  SHELL          Nano-ceramic outer, 3D-printed PA12 inner for prototypes.
  MASS BUDGET    shell 38 g · slug+coil 48 g · battery 7 g · PCB 12 g ·
                 feet/bumper 5 g · Qi RX 6 g · misc 4 g = 120 g. Zero
                 margin. Prototype may run 140 g; LEAP v0 retunes from
                 measured mass.

6.2  FIRMWARE STATE MACHINE

  IDLE → ARMED (cap charged, pad/edge check ok) → GESTURE(n) → LANDING
  (IMU settle ≤ 600 ms) → VERIFY (face = base?) → LOG → IDLE.
  FAULT states: EDGE_INHIBIT (substitute SHUDDER), TIPPED, CAP_LOW,
  OVERTEMP. A gesture request is dropped (never queued) if the operator
  was active at the desk in the last 60 s — the cube never jumps at a
  hand. Rate limit: ≤ 6 hops / hour, ≤ 1 LEAP / 10 min (Ambient AI™ rule).

6.3  GATES (supersede/extend spec §06 v.0 gate)

  G0  Bench: coil + slug on a load cell. Measure impulse vs drive; fit
      to §02.3 within ±20 %.             PASS = model within 20 %.
  G1  Single-hop rig: rise/range at 3 drive levels on wood.  PASS = HOP
      8±3 mm, LEAP 40±10 mm range, 10/10.
  G2  Edge gate: 100/100 approach trials, 0 off-table events, ToF margin
      25 mm. (Hard ship gate — unchanged.)
  G3  Endurance: 500/500 hop-and-verify cycles, zero actuator failures,
      zero off-table. (Spec gate — unchanged.)
  G4  Nudge perceptibility: 20-person blind desk test; ≥ 90 % detect NUDGE
      at the lowest drive level without audible cue (< 35 dBA at 0.5 m).
  G5  Acoustic: LEAP landing < 45 dBA at 0.5 m on wood (a hopping cube must
      not be an alarm clock).
  G6  Telemetry: gesture→IMU outcome→QI·46 "haptic preference" record
      round-trip works end-to-end in staging.

6.4  SOFTWARE CONTRACT (for the platform side, no code in this cycle)

  Event in:   { signal_class, severity, ts, quiet_hours }
  Gesture out:{ gesture, outcome, rise_mm, tilt_deg, edge_state, ts }
  Mapping is defined in spec §04 plus the KNOCK gesture added in §07.

--------------------------------------------------------------------------------
07 // GESTURE VOCABULARY — ADDITION
--------------------------------------------------------------------------------

  THE KNOCK (new, v.0-compatible)
    Two sub-threshold NUDGE pulses 400 ms apart. No liftoff. Distinct from
    the single NUDGE, so "something about the ROOM" is felt differently from
    "something in the INDEX". Trigger class: environmental QIoT™ signals
    (LOT® Station air quality, LOT® Brush). Gesture count: 5.

--------------------------------------------------------------------------------
08 // CONSUMER USE CASES (APPENDED — NEVER EDITED)
--------------------------------------------------------------------------------

  Use Case 01 — THE DESK MIGRATION (2026-07-28). See
  LOT-CUBIQ-QUANTUM-CUBE-v0.md §07. Memory question → NUDGE; session
  begins → LEAP toward the keyboard.

  USE CASE 02 — THE OPEN WINDOW                              2026-11-09
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, small apartment office in the northern
  hemisphere in November — windows shut, radiator on. Owns the LOT® Station
  and the CUBIQ™ pad on the desk. Does focused work in 3-hour blocks.

  Problem today: indoor CO₂ climbs from 500 to 1,800 ppm during a closed-
  door afternoon. Concentration and mood degrade; the person blames
  themselves ("I'm tired"), not the room. A phone alert would be one more
  buzz in a feed they are trying to avoid, and screens-off focus mode
  suppresses it anyway.

  With CUBIQ™ v.0 + LOT® Station (QIoT™, per LOT-AMBIENT-AI-VISION.md):
    - CO₂ crosses 1,200 ppm. The Ambient AI™ rule — "one line, no alarm,
      exact moment" — applies. The cube does THE KNOCK (two soft taps felt
      through the desk). No light, no sound, no badge.
    - The operator, absorbed, does nothing. The system does not escalate.
      It waits for a natural pause (IMU on the desk detects the keyboard-
      silence handoff; the operator has just lifted their hands).
    - At the pause the Station widget shows its single line: "Air quality:
      open a window for 30 minutes." The cube, still, has already done its
      job — the body knew before the eyes were asked.
    - Window opens. CO₂ falls below 800 ppm. The cube performs THE SETTLE
      (2 s of standing presence, no motion): the room is fine again. No
      "resolved" notification. The cube simply goes quiet.
    - Over weeks, QI·46 learns this operator's reaction latency to KNOCK
      vs on-screen text and tunes the threshold (e.g., earlier in the
      afternoon, never in the first deep-work hour). The cube's own IMU
      confirms "operator reached for the window latch within 3 min of KNOCK"
      indirectly (desk-vibration signature + Station delta).

  Why it matters: this is the first CUBIQ™ use case that is not about
  attention to the app at all. The cube speaks for the ROOM. It establishes
  the object as the physical voice of every QIoT™ sensor (Station, Brush,
  later others) through a single, learnable gesture language — the path from
  "notification device" to "ambient interface".

  Hardware requirement exposed: the cube must tolerate a near-continuous
  duty of low-energy gestures (KNOCK/SETTLE ≈ 0.01 J each) and a BLE link to
  the Station signal path via the phone/hub — covered by §06.1.

  (Next cycle slot: USE CASE 03 — to be proposed by the next session. Seed
  ideas: LOT® Brush "morning routine confirmed" greeting; focus-timer
  "closing the door"; a gift/shared cube pair on two desks; travel mode.)

--------------------------------------------------------------------------------
09 // RISKS, OPEN QUESTIONS, DECISIONS NEEDED FROM S-2
--------------------------------------------------------------------------------

  R-1  Safety/regulatory: a moving consumer object near children and pets;
       battery in a shock-cycled shell. Needs product-safety review (UL
       62368-1 / IEC 62133 class) before any outside unit. Lock the
       charge-and-sleep-when-lifted logic.
  R-2  Mass budget has zero margin (§06.1). Mitigation: accept 140 g for
       the v.0 prototype.
  R-3  Surface variance (glass, felt, cork) can break gesture calibration.
       Mitigation: IMU auto-calibration "calibration hop" on pad.
  R-4  Acoustic nuisance of landing; G5 gate.
  R-5  Levitation expectation risk: marketing must not imply a shipping
       date. The brief says "eventually"; §05 stands.
  R-6  Naming/IP: keep CUBIQ™ distinct from COSMO® Cube (LOT-MANIFEST).

  DECISIONS REQUESTED:
    D-A  Approve CORRECTION D-01 (slap-up mechanism) and the piezo re-scope
         (§02.4) so the spec text can be amended in the next revision.
    D-B  Approve v.2 gait A (stick-slip hopping) over actuated feet.
    D-C  Choose v.3 reference: electromagnetic (recommended) vs. parked.
    D-D  Prototype budget and who builds: in-house vs. contract engineering
         partner (a voice-coil + MCU + 3D-printed shell proof-of-mechanism
         is a few-week effort for a competent mechatronics engineer).

--------------------------------------------------------------------------------
10 // NEXT CYCLE
--------------------------------------------------------------------------------

  1. Run G0 on a bench rig (load cell + off-the-shelf voice coil + 40 g slug)
     — the single result that converts this document from analysis to data.
  2. Amend spec v0 §03 with D-01 and §02.4 once approved.
  3. Draft BLE/app gesture API contract (§06.4) as a short engineering note.
  4. Append USE CASE 03.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
================================================================================
