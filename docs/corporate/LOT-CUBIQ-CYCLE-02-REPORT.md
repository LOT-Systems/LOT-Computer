================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-CYCLE-02-REPORT
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Cycle 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-09-29
VERSION:  0.2 — ENGINEERING BASELINE (PRE-HARDWARE, DESIGN LOCK STILL PENDING)
PARENT:   docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md (v0.1, 2026-07-28)
STATUS:   ACTUATOR ARCHITECTURE REVISED · ENERGY BUDGET CLOSED · TEST PLAN OPEN
================================================================================

This report is Cycle 02 of the v.0 development. It does not replace the v0.1
specification — it audits it, corrects what the numbers do not support, and
adds what v0.1 left open: an energy budget, a firmware state machine, a
verification plan, a risk register, and Consumer Use Case 02.

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing (per the instruction "read previous .MDs, including your
own"):

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md   — my own v0.1 spec (2026-07-28).
      Sections 01-08. Use Case 01 "The Desk Migration". Append-only rule for
      Section 07 observed.
  docs/corporate/LOT-CUBIQ-VISION.md            — Section 05, the arc from the
      cubic in the mind to the cubic in the world.
  docs/corporate/LOT-CUBIQ-OPERATOR.md          — Section 02 (the 5-11 minute
      session, the Memory Question), Section 04, Phase 4 physical extension.
  docs/corporate/LOT_QI46_ENGINE.md             — line 110 (piezoelectric,
      nano-ceramic, haptic feedback language), Step 3.3 (Quantum Cube signal
      integration: haptic preference, usage frequency, biofield response).
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md   — "Quantum Cube Hardware"
      line item, PLANNED.
  docs/corporate/LOT-AMBIENT-AI-VISION.md       — the Station (air quality) and
      Brush hardware family; the "always present, never loud" principle.
      Cycle 02 uses it: the Station is the second LOT® object the cube can
      listen to.
  docs/benchmark/LOT-MANIFEST.md                — the COSMO® Cube hardware
      computer is a separate, non-colliding track. Unchanged from v0.1.

Repository state at read time: no CUBIQ hardware document exists other than
v0.1; nothing was written on the cube between 2026-07-28 and today. The
present cycle is therefore the first revision.

--------------------------------------------------------------------------------
01 // WHAT THIS CYCLE DELIVERS
--------------------------------------------------------------------------------

  D1  Design review of v0.1 against physics          (Section 02)
  D2  Revised actuator architecture — spring + latch (Section 03)
  D3  Closed v.0 energy and mass budget              (Section 04)
  D4  Firmware state machine and safety interlocks   (Section 05)
  D5  Signal driver contract to the Index of Systems (Section 06)
  D6  Verification plan and gates                    (Section 07)
  D7  Risk register                                  (Section 08)
  D8  v.1 / v.2 / v.3 roadmap deltas                 (Section 09)
  D9  Consumer Use Case 02 — The Breath Pacer        (Section 10)
  D10 Reproducible calculator: scripts/cubiq/hop-budget.mjs

Not delivered, on purpose: a CAD model, a PCB, a firmware binary, or any claim
that a prototype exists. There is no hardware in this repository. Everything
below is design-time, and every number is labeled as computed or assumed.

--------------------------------------------------------------------------------
02 // DESIGN REVIEW OF v0.1 — WHAT THE NUMBERS SAY
--------------------------------------------------------------------------------

The calculator (scripts/cubiq/hop-budget.mjs) takes the v0.1 targets — 120 g
mass, THE HOP under 10 mm rise, THE LEAP ~40 mm displacement at 15° off
vertical — and back-solves what the actuator must do.

  GESTURE                 LAUNCH SPEED   RISE     RANGE   ENERGY TO CUBE
  THE HOP (8 mm rise)      0.40 m/s       8.0 mm    0 mm     9.4 mJ
  THE LEAP (40 mm, 15°)    0.89 m/s      37.3 mm   40 mm    47.1 mJ
  v.1 LONG JUMP (150 mm)   1.25 m/s      53.6 mm  150 mm    94.0 mJ

  F1  CONFIRMED — THE HOP is well inside a voice-coil's envelope.
      A 40 g reaction mass over 8 mm needs ~1.6 N peak. Voice-coil drive is
      realistic for the Hop and for THE NUDGE / THE SETTLE.

  F2  CORRECTED — THE LEAP is not a voice-coil-direct-drive gesture in a
      45 mm cube. The same reaction mass over 8 mm needs ~7.8 N peak
      (~20 g acceleration). A coil that fits inside a 45 mm cube with a
      120 g budget does not deliver that force at a usable duty cycle.
      v0.1 Section 03 named voice-coil as "candidate"; this cycle rules it
      out for the Leap. (It also fails harder for v.1: ~15.7 N.)

  F3  A LEAP RISES 37 mm — nearly the cube's own height (45 mm) — and is
      airborne for ~174 ms. It is a visible, deliberate object in flight,
      not a "tremor". The four-gesture vocabulary in v0.1 Section 04 is
      correct to reserve it for rare-and-above badges; this cycle adds that
      it must also be rate-limited (Section 05) so it stays rare.

  F4  LANDING. Touchdown speed equals launch speed, 0.89 m/s. Stopping in
      2 mm of elastomer foot compression is ~20 g decel — survivable for the
      board and the cell, but audible on wood or glass. The anti-feed
      thesis ("a notification you feel, not one that shouts") makes landing
      noise a first-class requirement, not a polish item. It now has a gate
      (Section 07, G4).

  F5  ENERGY IS NOT THE CONSTRAINT. The Leap delivers ~47 mJ to the cube;
      with realistic launcher losses (~63 mJ stored in the reaction mass at
      restitution 0.5) it is still two orders of magnitude below what a
      small pack holds. FORCE and PACKAGING are the constraints, not
      battery. (The "Leaps per charge" line the calculator prints assumes
      5% chain efficiency and is an illustration, not a spec.)

  F6  LEVITATION MATH, RECORDED EARLY. Weight at 120 g is 1.18 N.
      Acoustic: holding that over one 45 mm face needs ~581 Pa rms,
      ≈149 dB SPL — unsafe and outside any acoustic-levitator regime
      (published devices hold bead-scale masses). Acoustic levitation of
      this cube is ruled out. Magnetic: ~38 mT across the face area
      supports the weight — a modest field — but a static magnet
      arrangement cannot be stable (Earnshaw), and diamagnetic lift of 120 g
      is out of reach at desk-safe fields. Only ACTIVE electromagnetic
      levitation (sensed, closed-loop, kHz-rate) remains. See Section 09.

--------------------------------------------------------------------------------
03 // REVISED ACTUATOR ARCHITECTURE (SUPERSEDES v0.1 §03 "MECHANISM")
--------------------------------------------------------------------------------

  v0.1 said: a voice-coil drives a spring-loaded reaction mass down against
  the base; a piezo bimorph biases the leap direction.

  v0.2 (this cycle):

    LAUNCHER      A wound spring stores the launch energy; the reaction mass
                  is released by a latch. The spring, not the coil, supplies
                  the peak force (~4 N for the Leap with a 15 mm working
                  stroke, per calculator).
    WIND-UP       A small geared motor (or the voice-coil at low force over
                  a longer time via a ratchet) compresses the spring
                  slowly. Slow and quiet; the operator hears nothing.
    RELEASE       A small solenoid or shape-memory latch releases the
                  spring on command. Release is a single ~ms event, so
                  timing is precise and repeatable.
    BIAS          The piezo bimorph from v0.1 stays: it fires just after
                  release to tilt the shell 5-15° off vertical. Unchanged.
    LOW-FORCE     The voice coil is retained ONLY for the low-force
    GESTURES      vocabulary — NUDGE, SETTLE, THE BREATH PACER (Section 10)
                  — where its controllability and silence are the point,
                  and for landing-recovery micro-pulses.

  Consequence: v.0 now has two actuators — a latch-released spring launcher
  (jump class) and a voice coil (presence class) — instead of one. v0.1's
  "mechanically boring" principle is preserved by keeping each actuator to
  ONE job. The cost is mass and volume; Section 04 books both.

  Alternative considered and rejected for v.0: a larger single coil.
  It would bust the 120 g budget and the 45 mm envelope for a Leap that
  spends 1-2 times a day at most. Rejected.

--------------------------------------------------------------------------------
04 // V.0 MASS AND ENERGY BUDGET (ASSUMED, TO BE MEASURED)
--------------------------------------------------------------------------------

  MASS (target ≤ 120 g; figures are allocation targets, not weighed parts)

    Nano-ceramic shell (6 faces, 45 mm)          28 g
    Reaction mass + spring + latch                44 g   (reaction mass 40 g)
    Voice coil + magnet (presence class)          8 g
    Piezo bias + driver                           2 g
    Li-ion cell (~150 mAh class)                  6 g
    PCB: MCU, IMU, ToF, Qi receiver, driver      10 g
    Elastomer feet ×4 + adhesive                  3 g
    ─────────────────────────────────────────────────
    Allocated                                    101 g
    Margin held                                   19 g   (16%)

  Note on the 6 g cell: v0.1 and the calculator's 300 mAh illustration are
  not the same cell. A 150 mAh class cell is what fits the mass line; the
  Leap does not need more. Runtime for the presence-class gestures is the
  real battery question and is a Section 07 measurement (G6), not a claim.

  ENERGY PER GESTURE (calculator output; delivered energy)

    THE NUDGE / SETTLE / PACER    milli-joule class, voice coil, silent
    THE HOP                        9.4 mJ to cube  (13 mJ launcher store)
    THE LEAP                      47.1 mJ to cube  (63 mJ launcher store)

--------------------------------------------------------------------------------
05 // FIRMWARE STATE MACHINE AND SAFETY INTERLOCKS
--------------------------------------------------------------------------------

  STATES
    DORMANT    On the pad, charging, awaiting a signal. Lowest power.
    ARMED      Spring wound, IMU level, ToF clear on all sensed sides.
    ACTING     A gesture is executing.
    RECOVER    Post-jump: IMU checks attitude, applies the ≤25° righting
               pulse if needed (v0.1 §03).
    HOLD       Any interlock failed. Only low-force gestures allowed.
    FAULT      Two consecutive recovery failures, latch fault, or IMU
               fault. Unwinds the spring, stops, reports.

  INTERLOCKS (all gate the jump-class actuator; failing any → HOLD)
    I1  Edge: ToF sees an edge within 20 mm of the predicted landing → jump
        inhibited, in-place gesture substitutes (v0.1 §03, carried forward).
    I2  Level: IMU tilt > 5° at ARMED → no jump (a jump off a slope becomes
        a slide).
    I3  Contact: capacitive or IMU-damping detects a hand or object
        touching the cube → no jump. (A cube that leaps out of a palm is a
        bug, and Use Case 02 is a palm on the cube.)
    I4  Rate: Leap limited to N per hour and per day (default 4 / 12,
        operator-configurable downward only). Hop likewise, larger.
    I5  Do-not-disturb: honors the operator's LOT® quiet window and
        circadian state. Silence is the default (Section 06).
    I6  Motion budget: total actuator duty capped to protect the latch and
        spring; excess signals downgrade one rung (Leap → Hop → Nudge).

  PRINCIPLE
    Every fault degrades toward LESS motion. There is no failure mode in
    which the cube does more than it was told.

--------------------------------------------------------------------------------
06 // SIGNAL DRIVER CONTRACT — INDEX OF SYSTEMS → CUBE
--------------------------------------------------------------------------------

  The cube subscribes to a single outbound event type. The driver, not the
  cube, decides gesture; the cube owns only safety (Section 05). Fields are
  a proposal for the integration cycle; no server change is made here.

    {
      signal:   "memory_question_ready" | "badge_unlocked" |
                "assembly_phase_advanced" | "breath_invited" |
                "air_quality_advisory",
      severity: "low" | "normal" | "high",   // maps to a gesture rung
      tier:     "common" | "uncommon" | "rare" | "epic" | "legendary",
      quiet:    boolean,                     // operator's quiet window
      at:       ISO-8601 timestamp
    }

  MAPPING (extends v0.1 §04; NEW rows marked)
    memory_question_ready       → THE NUDGE
    badge_unlocked (common/unc) → THE HOP
    badge_unlocked (rare+)      → THE LEAP
    assembly_phase_advanced     → THE SETTLE
    breath_invited              → THE BREATH PACER            NEW (§10)
    air_quality_advisory        → THE NUDGE ×2, spaced 8 s    NEW (Station)

  TELEMETRY BACK (the return half of QI·46 Step 3.3)
    gesture executed, landing attitude, whether recovery fired, whether the
    operator touched the cube within 60 s, and pacer session length. It is
    derived from the IMU already on board. It is per-operator, local-first,
    and rides the existing signal path. No audio, no camera, no microphone
    — none exist on the device.

--------------------------------------------------------------------------------
07 // VERIFICATION PLAN AND GATES
--------------------------------------------------------------------------------

  Carried from v0.1: 500/500 hop-and-recover cycles, zero off-table
  landings, zero actuator failures before v.0 closes. New gates:

  G1  Edge safety      100/100 edge-approach trials, zero falls,
                       all six approach angles (v0.1 was forward-only).
  G2  Hop repeatability  Rise 8 ± 2 mm across 500 cycles.
  G3  Leap accuracy    Displacement 40 ± 12 mm, 9/10 on each of wood, glass,
                       laminate, in a 60 mm landing zone.
  G4  Landing noise    Peak SPL at 300 mm not above the ambient noise of a
                       quiet room by more than an agreed margin (set at
                       first prototype, then locked). Fails if a Leap is
                       audible from an adjacent room.
  G5  Contact interlock  I3 blocks a jump in 100/100 palm-on-cube trials.
  G6  Presence runtime   ≥ 7 days of typical use per charge for the
                       low-force vocabulary. Target; measure first.
  G7  Fault degradation  Injected IMU / latch / ToF faults → HOLD or FAULT
                       in 100/100 injections; never an unintended jump.
  G8  Drop and knock   Survives a 30 cm table-to-floor drop (the failure
                       that I1 exists to prevent must not brick the unit).

  Order: G7 and G1 first — safety before accuracy, accuracy before delight.

--------------------------------------------------------------------------------
08 // RISK REGISTER
--------------------------------------------------------------------------------

  R1  Cube leaves the desk           HIGH   I1 gate, G1, G7; also I2 slope.
  R2  Landing noise defeats anti-feed MED   Compliant feet, mass, G4.
  R3  Leap fatigues the spring/latch  MED   I4/I6 caps; cycle-life test.
  R4  Leaps at the wrong moment       MED   I5 quiet window; rate limits;
                                            operator can disable per signal.
  R5  Hand/child/pet contact          HIGH  I3; no exposed pinch points; small
                                            enclosed mass. Child-safety
                                            review is required before any
                                            consumer release.
  R6  Battery safety at 6 g cell      MED   Certified cell and protection
                                            circuit; regulatory pass before
                                            shipment.
  R7  Qi charging heats the cube      LOW   Thermal cutoff; charge pad is the
                                            same object v.3 needs.
  R8  Scope creep to v.2/v.3 early    MED   v0.1 principle stands: prove the
                                            single hop first.
  R9  No prototype exists             HIGH  Everything above is design-time
                                            until a bench rig confirms it.
                                            First physical step is a bench
                                            rig of launcher + IMU only.

--------------------------------------------------------------------------------
09 // ROADMAP DELTAS
--------------------------------------------------------------------------------

  v.0  Now two actuators (launcher + voice coil). Adds THE BREATH PACER to
       the vocabulary and the air-quality double-nudge. Closing gates as
       Section 07.

  v.1  LONG JUMP. Calculator: 150 mm needs 1.25 m/s and ~94 mJ delivered.
       Spring-latch remains viable (~8.4 N at 15 mm stroke). Shell target
       <90 g is now on the critical path; the 19 g margin above is the
       first thing v.1 spends. Direct-drive coil is out.

  v.2  TABLE SWINGS. Unchanged from v0.1 in intent. Added constraint: the
       cube must be able to steer against friction it has not measured, so
       a bench friction sweep (wood / glass / laminate / cloth mat) precedes
       any path-following code.

  v.3  LEVITATION. Narrowed by Section 02 F6 to one candidate: active
       electromagnetic levitation with the table surface as the actuator
       array. Acoustic levitation is removed from the candidate list for a
       120 g cube. Passive/diamagnetic is removed. Open questions for LOT®
       Institute: the sensing rate and gap achievable in a 45 mm cube with
       the Qi receiver in the same base; how landing/take-off (i.e. the
       Hop) hands over to the controller; power draw of a continuously held
       state versus the presence-class budget.

--------------------------------------------------------------------------------
10 // CONSUMER USE CASES
--------------------------------------------------------------------------------

  (Section 07 of v0.1 remains the append-only ledger. Use Case 02 is
   recorded there and reproduced here in full.)

  USE CASE 02 — THE BREATH PACER                            2026-09-29
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, a 40-something parent in a small
  apartment, works from a kitchen table, has logged elevated stress for
  three afternoons running. Owns the LOT® Station (CO₂ and PM2.5) and the
  CUBIQ pad on the table. Screen on the table is a laptop, closed.

  15:10. The Station reports CO₂ climbing past the operator's threshold.
  The cubic's software surface would show one quiet line — "open a window
  for 30 minutes" — but the laptop is shut, so nobody reads it. Under
  v.0 the cube performs THE NUDGE twice, eight seconds apart (Section 06).
  Two soft pulses through the wood. The operator stands, opens the window.
  No sound. Nothing lit.

  15:40. The stress pattern the Quantum Intent Engine has been following
  peaks with the operator's last three messages. The driver emits
  breath_invited. The cube does NOT jump — a jump would be an
  interruption, and the operator's hand is resting on the table next to
  it. The operator, tired, places a palm on the cube.

  Interlock I3 detects the palm from the IMU's changed damping and locks
  out jump-class motion. The voice coil then delivers THE BREATH PACER:
  a felt swell over 4 seconds (inhale), a held stillness for 2 seconds,
  a slow release over 6 seconds (exhale) — the same 4-2-6 cadence as the
  /breathe command in the cubic (LOT-CUBIQ-OPERATOR.md, Section 02). The
  carrier is a low-amplitude vibration under the palm; the envelope is the
  breath. The operator closes their eyes. Six cycles, about 72 seconds.

  When the operator lifts their hand the cube stops, performs THE SETTLE
  once (two seconds of standing pressure, nothing visible), and goes
  DORMANT. There is no score, no streak, no "you did it" screen. On the
  next opening of the cubic, the Memory Question is simply gentler that
  evening, because the telemetry loop recorded a 72-second pacer session
  and a hand held on the cube.

  Why this belongs to v.0: it uses only the low-force voice-coil actuator
  and the IMU. It needs no jump, no long range, no surface locomotion. It
  is the use case that exercises the parts of the cube that are the same
  in every future version, and it shows that presence — not
  acrobatics — is the product.

  What it needs from the spec (added this cycle):
    - THE BREATH PACER gesture (Section 06)
    - Interlock I3 contact detection (Section 05)
    - Station-triggered air_quality_advisory (Section 06)
    - Gate G5 (Section 07)

  Privacy note: the cube learns that a palm was on it and for how long.
  It has no microphone, camera or pulse sensor; it does not infer heart
  rate. Any biofield claim in QI·46 remains a self-report, not a
  measurement made by this device.

--------------------------------------------------------------------------------
11 // NEXT CYCLE (03) — PROPOSED
--------------------------------------------------------------------------------

  1. Bench rig: launcher + latch + IMU on a fixture, no shell. Measure
     stored energy, launch speed, and repeatability against Section 02.
  2. Landing-noise study (G4) with two foot compounds.
  3. Draft server-side hook for the Section 06 event — no cube required,
     a simulator subscribing to it is enough to run the Index → gesture
     mapping under test.
  4. Use Case 03: to be chosen by the next session. Candidates already
     surfaced by this reading: the Brush morning handoff (brushing event
     closes a loop the cube can acknowledge with a Settle), and the
     Assembly-phase ceremony (a cube that recognises its operator's phase
     change from "forming" to "assembled").

--------------------------------------------------------------------------------
12 // REPRODUCE
--------------------------------------------------------------------------------

  node scripts/cubiq/hop-budget.mjs

  Physics-only, no dependencies. Change M, s, e or the gesture targets at
  the top of the file and re-run.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-CYCLE-02-REPORT
================================================================================
