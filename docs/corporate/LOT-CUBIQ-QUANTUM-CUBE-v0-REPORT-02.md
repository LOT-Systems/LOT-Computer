================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report, Cycle 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-30
VERSION:  0.2 — ARCHITECTURE REVIEW + FIRST NUMBERS
STATUS:   v.0 — PRE-HARDWARE. NO PROTOTYPE EXISTS. ALL FIGURES BELOW ARE
          DESK CALCULATIONS (IDEALISED) OR ESTIMATES, LABELLED AS SUCH.
PARENT:   docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md  (cycle 01, 2026-07-28)
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing (all in this repository):

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md   Cycle-01 spec. Hop primitive,
      four gestures, roadmap v.0 → v.3, Use Case 01. Its Section 07 rule:
      each cycle appends ONE new consumer use case; prior entries are never
      edited. Cycle 02 follows that rule (Section 08 below; also appended to
      the parent spec).
  docs/corporate/LOT-CUBIQ-VISION.md            Anti-feed thesis; physical
      products as "the inevitable step".
  docs/corporate/LOT-CUBIQ-OPERATOR.md          Index of Systems, Memory
      Question, /breathe 4-2-6, Phase 4 physical extension.
  docs/corporate/LOT-AMBIENT-AI-VISION.md       "One line, no alarm, exact
      moment." LOT® Station (CO₂/PM2.5/VOC) and LOT® Brush as QIoT™ precedent
      for hardware-as-invisible-signal.
  docs/corporate/LOT_QI46_ENGINE.md             Piezo / nano-ceramic /
      haptic line (l.110); cube as Month-12 INPUT device (l.750-764).
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md   Institute corpus; cube row
      "PLANNED".
  docs/benchmark/LOT-MANIFEST.md                COSMO® Cube is a separate
      hardware computer track; no naming collision.

Finding on the record: no prior document contains any quantitative analysis of
the cube. Cycle 01 is a design intent document. This cycle is the first to put
numbers under it. Several numbers do not agree with cycle 01 (Section 02).

--------------------------------------------------------------------------------
01 // CYCLE 02 SUMMARY
--------------------------------------------------------------------------------

  1. Physics review of the cycle-01 hop architecture. FIVE issues found
     (E1–E5). Two are design-breaking if left unfixed (E1, E2).
  2. Proposed replacement architecture for v.0: TWO ENGINES —
       HAPTIC ENGINE  (LRA, always-on, silent, no liftoff)
       JUMP ENGINE    (spring-store + latch-release "pogo foot", ~7g moving
                       mass, replaces the 20-30g reaction mass of cycle 01)
  3. First mass, energy and battery budgets (estimates).
  4. A fifth gesture, THE TIDE (breathing pacer), added to the vocabulary.
  5. Use Case 02 — THE TIDE ON THE DESK (Section 08).
  6. Gate criteria tightened and made measurable; test plan drafted.
  7. Open questions routed to LOT® Institute (Section 10).

Nothing here is a claim of a working device. It is a corrected plan.

--------------------------------------------------------------------------------
02 // ERRATA AND DESIGN CLARIFICATIONS TO CYCLE 01
--------------------------------------------------------------------------------

Constants: g = 9.81 m/s². Launch elevation θ is measured from the horizontal.
Range = v² sin2θ / g (flat ground, launch and landing at the same height).

  E1 — HOP DIRECTION OF THE REACTION MASS  [DESIGN-BREAKING]
    Cycle 01 (§03): "drives a spring-loaded internal reaction mass DOWNWARD
    against the base face."
    A smooth downward push cannot lift the cube: the floor can only push, so
    accelerating a mass downward REDUCES floor force below weight; the shell
    stays down. Liftoff needs the internal mass to be accelerated UPWARD (floor
    force rises above weight, the system gains upward momentum) and then
    stopped against the shell, or an equivalent spring-release between shell
    and a foot. Either way the stroke direction is upward, not downward.
    Fix: Jump Engine (Section 03).

  E2 — PIEZO "BIAS" ELEMENT FIRING AFTER RELEASE  [DESIGN-BREAKING]
    Cycle 01 (§03): a piezo bimorph "fires a millisecond after actuator
    release to bias the leap 5-15° off vertical".
    Any impulse applied off the centre of mass is also a torque, and flight is
    long enough to tumble. Calculation, 120 g cube, I = m·a²/6 = 4.05e-5 kg·m²,
    Leap (40 mm at 75° elevation: v = 0.89 m/s, flight 174 ms, p = 0.106 N·s):

      thrust-line offset from CoM    spin rate     rotation during flight
      0.5 mm                         1.3 rad/s     13°
      1.0 mm                         2.6 rad/s     26°
      2.0 mm                         5.2 rad/s     52°   ← lands on an edge/side
      3.0 mm                         7.9 rad/s     79°

    A side-mounted piezo kick is an offset of several millimetres by
    construction. Fix: the forward component comes from the DIRECTION of the
    single launch axis (inclined guide), whose line passes through the CoM to
    within ≤ 0.5 mm. No second impulse. Piezo is retained only as a sensor/
    micro-haptic element, which keeps it inside the Institute-named component
    class (LOT_QI46_ENGINE.md l.110).

  E3 — EDGE-DETECTION MARGIN SMALLER THAN THE HOP  [SAFETY]
    Cycle 01 inhibits a hop "within 20 mm of a detected edge" while THE LEAP
    travels ~40 mm with unmeasured dispersion. As written, a cube 30 mm from
    the edge would leap off it.
    Fix: inhibit if  d_edge < d_nominal + 3σ_dispersion + 20 mm. With 40 mm
    nominal and σ assumed 8 mm (to be measured, T3), threshold = 84 mm; plan
    on ≥ 85 mm for the Leap and ≥ 40 mm for the Hop until σ is measured.
    Sensor must also cover the DIRECTION OF TRAVEL, not just "forward", and a
    cliff-sensor reading must be fresh (< 100 ms) at the moment of release.

  E4 — LANDING ON A NON-BASE FACE  [FUNCTIONAL]
    Cycle 01's recovery ("tips past 25°, corrective micro-pulse") assumes the
    cube lands on or near its base. The base carries feet, charge coil, ToF
    and the actuator axis; the other five faces carry none of it. A cube that
    lands on a side is stranded.
    Fix: (a) E2's CoM discipline keeps flight rotation ≲ 25°; (b) feet are a
    soft elastomer ring wide enough that a ≤ 30° tilt at touchdown rolls back
    to base (tilt-stable by CoM height, to be verified in T5); (c) if the IMU
    reports "not on base" the cube does NOT attempt to jump, notifies by LED
    ring + app state "cube needs placing" and goes quiet. Stranded-after-
    landing rate becomes a gate metric (Section 07).

  E5 — LONG-JUMP FRICTION  [v.1 SIZING]
    No slip at launch requires μ ≥ cot(θ). Cycle 01's v.1 target
    (>150 mm, 90 g) gives:

      launch θ   energy (90 g)   apex     flight   μ needed
      75°        132 mJ          140 mm   338 ms   0.27
      60°         76 mJ           65 mm   230 ms   0.58
      55°         70 mJ           54 mm   209 ms   0.70
      45°         66 mJ           38 mm   175 ms   1.00
      35°         70 mJ           26 mm   146 ms   1.43

    A flat "skimming" long jump is cheaper on paper, but elastomer on glass or
    laminate delivers μ ≈ 0.5–1.0 (typical, to be measured, T4). So the v.1
    launch angle is bounded BELOW by surface friction: design for 60° (μ 0.58)
    unless a gecko-type or micro-spike foot is validated. Corollary: v.1
    cannot be "v.0 with a longer coil"; the launch axis is re-pitched.

  E6 — SHELL MASS (minor)  [BUDGET]
    Cycle 01 specifies a nano-ceramic composite shell at <120 g total. A solid
    ceramic composite (~2.5-3 g/cm³) at 1 mm wall on a 45 mm cube is ~30-36 g
    (surface 12,150 mm² × 1 mm). That is ~30% of the v.0 budget and ~40% of
    the v.1 <90 g target. Plan: v.0 uses 1 mm composite; v.1 moves to a
    ceramic-coated polymer shell (est. ~18 g). Decision deferred to the
    first shell prototype.

--------------------------------------------------------------------------------
03 // ARCHITECTURE r0.2 — TWO ENGINES
--------------------------------------------------------------------------------

  3.1  HAPTIC ENGINE  (carries THE NUDGE, THE SETTLE, THE TIDE)
    One LRA (linear resonant actuator, phone-haptic class), ~2 g, mounted at
    the base plate and driven with amplitude envelopes. Silent at low drive,
    felt through a desk, continuously controllable — which a spring-latch
    cannot do. No liftoff, no edge risk, near-zero energy (est. < 50 mW while
    driven). This is the cube's everyday voice and is the part most operators
    will experience 95% of the time.

  3.2  JUMP ENGINE  (carries THE HOP and THE LEAP)
    "Pogo foot": a foot plate rides an inclined linear guide; a main spring
    stores energy; a micro gearmotor + cam charges the spring over ~2 s (slow,
    quiet, low current); a latch releases it in ~ms. The whole body is
    accelerated over a ~6 mm stroke, so the moving mass is the foot (~7 g),
    not a 20-30 g slug.

    Energy needed (120 g, from the Section 02 table / reproducible with
    scratchpad calc):
      THE HOP   10 mm rise                       11.8 mJ at the body
      THE LEAP  40 mm at 75° (apex 37 mm)        47 mJ at the body
    Spring sized for ~70 mJ stored (≈ 67% transfer assumed through guide
    friction and latch). Average launch force over 6 mm ≈ 8-12 N (7-10 × body
    weight) — small-spring territory.

    Why not the cycle-01 voice-coil strike? For the same Leap, a 30 g reaction
    mass must reach ~3.5 m/s and carry ~190 mJ, delivered in a few ms:
    tens of watts peak from a 45 mm cube's coil and a ~150 mAh cell. A
    stored-spring release moves that peak into a mechanical element and
    leaves the electronics at milliwatts. (A 20 g mass needs 5.3 m/s / 283 mJ;
    40 g needs 2.7 m/s / 141 mJ — no point on that curve is comfortable.)

    Launch axis: fixed at 75° elevation (15° off vertical) in v.0, passing
    through the CoM within ≤ 0.5 mm (E2). v.1 introduces a 60° axis variant.

  3.3  SENSING
    6-axis IMU at the CoM (as cycle 01), plus ToF edge sensing with the
    margin rule E3. Touch/palm-contact is inferred from IMU damping + a
    capacitive pad on the TOP face (new; needed by THE TIDE, Section 08).

  3.4  SIMPLEST-THING-FIRST ORDER OF BUILD
    (i) Haptic engine alone in a 3D-printed 45 mm shell — ships the Nudge,
    Settle and Tide with no moving parts that can leave the table.
    (ii) Add the Jump Engine in a test rig clamped to a guide rail, no free
    flight.
    (iii) Free flight inside a soft-walled enclosure on a bench, then on
    the open table with the edge gate armed.
    This ordering means Use Case 02 is deliverable one stage before the first
    free hop.

--------------------------------------------------------------------------------
04 // BUDGETS (ESTIMATES — NO PART HAS BEEN WEIGHED)
--------------------------------------------------------------------------------

  MASS, v.0 TARGET < 120 g

    Shell, composite, 1 mm wall                    36 g
    Jump engine (foot 7, spring 3, motor+cam 12,
      latch 2, guide 4)                            28 g
    Battery, ~150 mAh LiPo                          5 g
    Qi receiver coil + shielding                    6 g
    Main PCB (MCU/BLE, PMIC, driver)                4 g
    IMU + ToF + capacitive pad                      2 g
    LRA                                             2 g
    Elastomer feet                                  3 g
    LED ring                                        1 g
    Fasteners, wiring, adhesive                     6 g
    ───────────────────────────────────────────────────
    Subtotal                                      ~93 g
    Contingency (≈ 25%)                           ~27 g
    Total at gate                               ≤ 120 g

  ENERGY
    Battery 150 mAh × 3.7 V ≈ 2.0 kJ.
    Per Leap: ~70 mJ stored; at ~25% motor-to-spring chain efficiency ≈ 0.28 J
    drawn. Theoretical ≈ 4,000-6,000 jumps per charge; real figure will be
    lower (standby, BLE, LRA). Standby is the budget that matters: BLE
    advertising + IMU wake-on-motion must stay under ~1 mW average for a
    multi-day charge between pad placements. The Qi pad is also the table, so
    "charge" is the resting state, not an event.

  ACOUSTICS
    Latch + landing are the loud events. Target ≤ 40 dBA at 0.5 m for the
    Hop (to be measured). The Nudge/Settle/Tide path is near-silent by design.
    A loud cube contradicts "presence without spectacle" (cycle 01 §01).

--------------------------------------------------------------------------------
05 // GESTURE VOCABULARY r0.2
--------------------------------------------------------------------------------

  GESTURE      ENGINE   MOTION                         TRIGGER SIGNAL
  ────────     ──────   ──────                         ──────────────
  THE NUDGE    Haptic   Sub-threshold tremor, no       Memory question ready
                        liftoff, ≤ 1 s
  THE SETTLE   Haptic   Light standing pressure, 2 s   Assembly phase advanced
  THE TIDE     Haptic   NEW. 12 s amplitude envelope:  Self-Care "Breathe"
                        4 s rise · 2 s hold · 6 s fall due, or a logged stress
                        (matches /breathe 4-2-6)       pattern + Station CO₂
  THE HOP      Jump     <10 mm rise, in place          Badge — common/uncommon
  THE LEAP     Jump     ~40 mm, 75° axis               Badge — rare and above

  Rules (new, anti-habituation / anti-feed):
    R1  Daily budget: at most 12 gesture events per day, at most 3 Jump-engine
        events. An exhausted budget is dropped, not queued — the cube never
        "catches up".
    R2  Operator-set quiet hours; the Jump engine is disabled outright in
        them. Haptic Nudge may be set to off.
    R3  No gesture repeats the same signal within 2 h unless the operator
        responds.
    R4  The cube never jumps when not on its charge-pad table or when the
        edge gate (E3) has not passed. Fail-closed: if in doubt, tremor,
        don't jump.
    R5  Nothing in the cube's behaviour is a medical or therapeutic claim.
        THE TIDE is a pacing cue, in the same register as the existing
        /breathe command.

--------------------------------------------------------------------------------
06 // SIGNAL INTEGRATION
--------------------------------------------------------------------------------

Cycle 01 §05 loop retained. Additions this cycle:

  HARDWARE → OS
    palm_contact { start, end, cycles_completed }   from THE TIDE
    gesture_ack  { gesture, felt: touch within 60 s | ignored }
    on_base      { bool }                           from IMU + base switch
    These are QIoT™ events of the same class as LOT® Brush brushing events
    (LOT-AMBIENT-AI-VISION.md): a self-care practice recorded by the world,
    not typed by the operator.

  OS → HARDWARE
    gesture request { gesture, amplitude_pref }, where amplitude_pref is the
    "haptic preference — pressure, duration, cadence" already named in
    LOT_QI46_ENGINE.md l.757. The Tide's amplitude is therefore personal and
    learned, not hard-coded.

  PRIVACY
    No audio, no camera, no raw IMU stream leaves the cube. Only the three
    event types above, and only with the operator's hardware consent switch
    on. Same stance as the OS: measure continuously, surface rarely.

--------------------------------------------------------------------------------
07 // GATES AND TEST PLAN (REVISED)
--------------------------------------------------------------------------------

  Cycle-01 gate retained: 500/500 hop-and-recover cycles, zero off-table
  landings, zero actuator failures. Added, so the gate is measurable:

  T1  CoM + thrust-line alignment    ≤ 0.5 mm   (bifilar pendulum + jig)
  T2  Launch-angle accuracy          75° ± 3°   (1,000 fps camera, 30 shots)
  T3  Leap dispersion σ              measure; sets the E3 edge threshold
  T4  Friction μ, feet on wood /     measure; sets v.1 launch-angle floor (E5)
      glass / laminate / stone
  T5  Landing: stranded-on-side      ≤ 1 in 200 (target; baseline unknown),
      rate; roll-back from 30° tilt  roll-back 20/20
  T6  Edge gate                      100/100 approach trials, zero inhibit
                                     failures, with threshold from T3
  T7  Noise                          ≤ 40 dBA @ 0.5 m, Hop; Tide ≤ 25 dBA
  T8  Standby draw                   ≤ 1 mW average
  T9  Tide fidelity                  envelope within ±10% of 4/2/6 s over
                                     6 cycles; palm-contact detection ≥ 95%
  T10 Drop test                      1 m onto hard floor ×6 faces, survives

  v.0 CLOSED when: T1–T10 pass AND 500/500 cycle gate AND one real operator
  completes a 7-day unsupervised trial with R1–R5 enforced.

  Compliance, to be verified with a lab (NOT assumed): consumer-electronics
  safety (IEC 62368-1 class), lithium-cell transport (UN 38.3), Qi, radio
  (FCC Part 15 / CE-RED for BLE). A 45 mm cube is above small-parts size but
  is still a moving consumer object: age-grade it 14+ for v.0.

--------------------------------------------------------------------------------
08 // CONSUMER USE CASES
--------------------------------------------------------------------------------

  (Use Case 01 — THE DESK MIGRATION, 2026-07-28, lives in the parent spec.
   It is not repeated or edited here.)

  USE CASE 02 — THE TIDE ON THE DESK                         2026-10-30
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, 30+ days of signal, owns the LOT® Station
  (CO₂/PM2.5/VOC) from the Usership kit. Works evenings in a small closed
  room. Dislikes using the phone to wind down — the phone is where the
  stress came from.

  19:40. The operator has been logging short, clipped entries for three days;
  the Quantum Intent Engine is already reading the pattern. The Station
  reports CO₂ at ~1,350 ppm — windows shut since afternoon. The Self-Care
  "Breathe" practice is due and has not been done.

  Under the current software-only OS, the answer is one quiet line in a
  widget the operator is not looking at. With CUBIQ v.0 (Haptic Engine only —
  this is deliverable before the first free hop, Section 03.4), the cube on
  the desk performs a single THE NUDGE. The operator feels it through the
  wood under their forearm. No light, no chime, no badge.

  They rest a palm on top of the cube — the capacitive pad and IMU damping
  register a hand. THE TIDE begins: pressure rising over four seconds,
  holding for two, falling over six — the 4-2-6 of /breathe, felt rather than
  watched. Amplitude is the operator's learned preference. Six cycles take
  72 seconds. When the palm lifts, the cube finishes the current exhale and
  stops; it does not ask again for two hours (R3).

  The cube writes one event to the OS — Breathe: completed, six cycles,
  hardware-detected, no manual logging. Only afterwards does a widget line
  appear on the screen, in the same register as every hardware widget:
  "Air quality: open a window for 30 minutes."

  What this proves about v.0: (1) the notification vocabulary extends beyond
  "something happened" to "a practice is offered" — the cube can carry
  self-care, not only alerts; (2) the most valuable v.0 gesture needs no jump
  at all, so the product has a safe, silent, shippable first stage; (3) the
  hardware reports a practice the way the Brush reports brushing — QIoT™
  entanglement without a manual log.

  What could go wrong (and the rule that answers it): a cube that
  "coaches" is one nudge too many. R1 (budget), R2 (quiet hours), R3 (no
  repeat) and R5 (no therapeutic claim) exist for this case. If operators
  report the Tide as pressure rather than relief, it is switched to
  opt-in and the Nudge alone is kept.

--------------------------------------------------------------------------------
09 // ROADMAP DELTAS
--------------------------------------------------------------------------------

  v.0   Stage order is now: Haptic-only (Nudge/Settle/Tide) → jump rig →
        free hop. Piezo kick removed. Pogo-foot jump engine. Edge margin
        rule E3. Gate T1–T10.
  v.1   Long jump: launch axis re-pitched to ~60° (E5), not just longer
        stroke. Needs a friction measurement campaign (T4) before the angle
        is frozen. Shell moves toward ceramic-coated polymer (E6).
  v.2   Table-walking: unchanged in intent. Note that a directed traverse is
        a series of v.0 Hops with a yaw change — the R1 daily budget will
        need a separate, larger "walk" allowance and a clear operator opt-in.
  v.3   Levitation: still research only. No mechanism claim. Added
        observation: Qi-class pad ≈ table is compatible with either
        candidate in the parent spec (acoustic array or magnetic array in the
        pad), but a ceramic-coated polymer shell (E6) is friendlier to both
        than the heavier composite.

--------------------------------------------------------------------------------
10 // OPEN QUESTIONS (ROUTED TO LOT® INSTITUTE)
--------------------------------------------------------------------------------

  Q1  Is there Institute material on the Quantum Cube beyond the 2-line
      mentions (QI46 l.110; CQGS snapshot)? The QI46 corpus map lists a
      "Quantum Cube" white paper under /corpus/institute/ (l.311). It is not
      in this repository. If it exists, it should be read before design lock.
  Q2  What does "bioelectric" mean for the object — does the cube sense
      anything about the operator beyond touch and IMU, or is that purely the
      Month-12 calibration input? This report assumes touch + IMU only.
  Q3  Brand: cycle 01 uses LOT®† CUBIQ® (combined mark); the Ambient AI
      document uses ™. Which marks are registered is a legal question, not an
      engineering one; this report follows the parent spec.
  Q4  Is a Usership-kit bundle (Station + Brush + Cube) the intended
      commercial shape? It affects the standby/charge-pad design (one pad per
      desk vs. per room).

--------------------------------------------------------------------------------
11 // NEXT CYCLE (03) BACKLOG
--------------------------------------------------------------------------------

  - Shell + CoM CAD sketch; confirm ≤ 0.5 mm alignment is machinable.
  - Bench test plan for T4 friction (cheap, unlocks E5 decision).
  - Candidate Use Case 03 ideas (pick one, append, do not edit 01/02):
      · THE RETURN — the Leap carries the cube back to its charge-pad centre
        after the operator nudges it off (v.1 behaviour in a consumer story).
      · THE HANDOFF — two cubes on a shared table, one operator's signal
        mirrored to a partner's cube (cohort-style presence, v.2).
      · THE FLOAT — morning "arrival" gesture as the first levitation demo
        (v.3, research framing only).

================================================================================
METHOD NOTE
  Launch figures: ideal ballistic, flat ground, no drag, impulsive launch.
  Spin figures: rigid cube, uniform density (I = m·a²/6), impulse applied at
  the stated offset from CoM. Battery and mass figures are estimates, not
  measurements. Reproduction script: kept in the session scratchpad; the
  formulas above are sufficient to re-derive every table.
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
================================================================================
