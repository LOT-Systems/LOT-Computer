================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report 02
          Physics Audit · Firmware Architecture · Validation Plan · Use Case 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-10
VERSION:  0.2 — SPEC HARDENING (PRE-HARDWARE)
STATUS:   v.0 — DESIGN LOCK STILL PENDING (3 OPEN ITEMS, SECTION 02)
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing (this report builds on them, it does not replace them):

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md        (REPORT 01 — my own, 2026-07-28)
  docs/corporate/LOT-CUBIQ-VISION.md                 cubic thesis, Section 05 physical arc
  docs/corporate/LOT-CUBIQ-OPERATOR.md               signals, Phase 4 "Physical Extension"
  docs/corporate/LOT_QI46_ENGINE.md                  cube as INPUT device (Month-12 sync)
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md        Institute corpus, "Quantum Cube Hardware: PLANNED"
  docs/corporate/LOT-AMBIENT-AI-VISION.md            Ambient AI™ principle; LOT® Station / Brush signals
  docs/corporate/LOT_ROBOTICS_COSMO.md               sibling COSMO® hardware track (no name collision)

Nothing in REPORT 01 is retracted. Section 02 below corrects one numerical
inconsistency in it; everything else stands. Per the append-only rule in
REPORT 01 Section 07, Use Case 02 is also appended there (not edited in place).

Institute basis (what is on record vs. what is new here):

  ON RECORD   nano-ceramic architecture, piezoelectric mechanics, haptic
              feedback, psychotronic-sensor design register (QI·46, CQGS).
  NEW HERE    all numbers in this report. They are first-order engineering
              estimates, not measurements. No hardware exists yet. Every
              figure is marked [EST] until a bench test replaces it.

--------------------------------------------------------------------------------
01 // STATE OF PLAY
--------------------------------------------------------------------------------

  Done      Architecture and gesture vocabulary (REPORT 01).
  Not done  Any bench hardware, firmware, or measured data.
  This run  Physics sanity check of REPORT 01's targets, firmware/driver
            architecture, validation plan, v.1 derisking, Use Case 02.

--------------------------------------------------------------------------------
02 // PHYSICS AUDIT — FINDING: THE "LEAP" SPEC IS SELF-INCONSISTENT
--------------------------------------------------------------------------------

REPORT 01 Section 03 biases the hop 5-15° off vertical. Section 04 defines
THE LEAP as ~40mm of displacement. These cannot both hold for a 120g cube.

Ballistic range R = v² · sin(2α) / g, α = launch angle above horizontal.
Required launch speed for R = 40mm, mass 120g, g = 9.81 m/s²  [EST]:

  bias off vertical   launch speed   kinetic energy   peak rise
  ─────────────────   ────────────   ──────────────   ─────────
   5°                 1.50 m/s       136 mJ           114 mm
  10°                 1.07 m/s        69 mJ            57 mm
  15°                 0.89 m/s        47 mJ            37 mm
  30°                 0.67 m/s        27 mJ            17 mm
  45°                 0.63 m/s        24 mJ            10 mm

Reading: with a 5-15° bias the cube must rise 37-114mm to travel 40mm
sideways. That is a tall bounce, not a "leap that lands in place," and it
conflicts with THE HOP (<10mm rise). Conversely a 10mm rise (11.8 mJ, 0.44
m/s) with a 10° bias travels only ~4mm.

  OPEN ITEM A — Leap geometry. Pick one (recommendation: option 2):
    1. Keep 5-15° bias, redefine THE LEAP as a ~40mm RISE with ~10mm drift.
    2. Raise bias to ~30°, keeping 40mm displacement with a 17mm rise
       (27 mJ). Needs a stronger piezo/angled-strike element than REPORT 01
       assumes; traction on landing becomes the risk, not energy.
    3. Drop the 40mm figure; defer lateral range entirely to v.1.
  Option 2 also keeps v.0 on the path to v.1 (>150mm needs ~45° launch at
  ~1.2 m/s, ~86 mJ, ~35mm rise [EST]) instead of fighting the geometry.

  OPEN ITEM B — Energy delivery. An internal reaction mass that strikes a
  stop transfers only part of its energy to the body. With a 30g internal
  mass in a 120g cube a perfectly inelastic hand-off couples roughly
  m_r/M = 25% [EST], so stored energy per Leap is ~4x the ballistic number
  (≈110 mJ for option 2). Cheap for a battery (a 100 mAh cell holds ~1.3 kJ,
  i.e. >10,000 leaps in principle) but peak power and spring/coil sizing
  must be designed to the stored figure, not the kinetic one.

  OPEN ITEM C — Landing recovery claim. "Righting from tip >25° with a
  micro-pulse of the same actuator" is plausible only if the CoM is low and
  the base face is not flat-on-flat. A 45mm cube at rest on a flat face has
  a tipping threshold of 45° about an edge; a vertical pulse cannot create
  a righting torque unless the cube is balanced on an edge or corner.
  Needs either a slightly convex base (self-righting by geometry) or a
  second small eccentric mass. Decision needed before design lock.

Lock criteria for v.0: A, B, C each closed with a bench measurement, not
another estimate.

--------------------------------------------------------------------------------
03 // POWER AND ENERGY BUDGET  [EST]
--------------------------------------------------------------------------------

  Battery           3.7V 100 mAh Li-Po (~1.3 kJ), ~3g; mass budget below
  Qi-class coupling 1-3 W receive; base-face coil. Foreign-object risk:
                    the cube hops OFF the coil, so charge only when
                    seated; firmware reads coil-detect before any hop.
  Idle              <50 µA in deep sleep; BLE advertise burst 1/s average
                    ~20 µA → days of standby on cell alone
  Leap (option 2)   ~110 mJ stored, ~1-3 ms strike → peak ~40-100 W for
                    the strike itself, supplied by a supercap / spring
                    precharge, never straight from the cell
  Daily load        20 gestures/day ≈ 2 J/day — negligible; the standby
                    current dominates battery life, not the motion.

  Mass budget (120g target, REPORT 01)
    shell nano-ceramic       38g     coil + reaction mass   32g
    battery + PCB + BLE      14g     IMU/ToF/piezo/LED       6g
    Qi coil + feet           10g     margin (to 120g)       20g
  Margin is 17% — any v.1 target of <90g will consume it entirely.

--------------------------------------------------------------------------------
04 // FIRMWARE AND DRIVER ARCHITECTURE
--------------------------------------------------------------------------------

Principle: the cube is dumb about meaning and strict about safety. The
Index of Systems decides WHAT to signal; the cube decides WHETHER it is
physically safe to do it.

  Signal path
    Index of Systems event ──▶ CUBIQ driver (server) ──▶ BLE ──▶ cube MCU
    cube MCU: gesture request ──▶ SAFETY GATE ──▶ actuator, or a fallback

  Gesture request (BLE payload, 8 bytes)
    gesture_id   NUDGE | HOP | LEAP | SETTLE
    priority     0-3
    ttl_s        discard if not executed in time (stale signals are dropped,
                 never queued — a cube must not replay yesterday's badge)
    seq          dedupe counter

  Safety gate — all must pass or the gesture downgrades
    1. on_surface      IMU static, ToF base-return valid
    2. level           tilt < 5°
    3. edge_clear      ToF forward cone clear of an edge by > 20mm (REPORT 01)
                       — on ToF fault, treat as NOT clear
    4. coil_seated     not on the charge coil mid-charge
    5. quiet_hours     operator-set; default NUDGE only
    6. rate_limit      ≤ 1 hop-class gesture / 30s; ≤ 12 / hour
  Downgrade chain: LEAP → HOP → NUDGE → LED ring pulse → drop (log only).
  Fail direction is always toward LESS motion. A dead sensor never results
  in a hop.

  State machine
    SLEEP → ARMED → (request) → GATING → EXECUTING → RECOVERING → ARMED
                                   │                      │
                                   └──▶ REFUSED (logged)   └──▶ FAULT (locks
                                                              motion, NUDGE
                                                              and LED only)

  Telemetry returned (feeds the QI·46 haptic-preference loop)
    gesture_id, gate_result, IMU peak accel, flight time (from IMU
    free-fall), landing tilt, recovery-needed flag, surface-class estimate.
  Privacy: telemetry is motion statistics only; no audio, no camera, no
  location. Consistent with the anti-feed / non-extractive thesis.

--------------------------------------------------------------------------------
05 // VALIDATION PLAN (WHAT "GREEN" MEANS FOR v.0)
--------------------------------------------------------------------------------

  Bench rig       drop-test frame, 240 fps camera, calibrated grid, IMU log
  Surfaces        oak, glass, laminate, felt desk mat (felt is the worst case)

  T1  Single-hop repeatability: 100 hops, rise std-dev < 15% of mean
  T2  Leap displacement (post Open Item A): 40mm ±10mm, 90/100
  T3  Landing: upright after hop, 500/500 incl. recovery (REPORT 01 gate)
  T4  Edge refusal: 100/100 approach trials from 5 headings, zero falls
      — a hard gate; ANY fall fails the whole build
  T5  Sensor-fault injection: unplug ToF, IMU glitch, brown-out →
      0 hops, fallback to NUDGE/LED in 100% of trials
  T6  Thermal/endurance: 5,000 gestures, coil <60°C, no drift >10%
  T7  Noise: NUDGE inaudible at 0.5m in a 35 dBA room; HOP < 45 dBA
  T8  Child/pet safety review: no pinch points, edge radii, mass-vs-impact
      assessment, small-parts review, and a regulatory screen (radio,
      battery transport, consumer-product safety) before ANY external user
      receives a unit. Not scoped here; flagged so it is not forgotten.

--------------------------------------------------------------------------------
06 // v.1 / v.2 / v.3 — DERISKING NOTES
--------------------------------------------------------------------------------

  v.1 LONG JUMP     Range scales with v², so 150mm needs ~4x the Leap
                    energy at the same angle. Mass is the cheapest lever:
                    every gram removed from 120g buys ~0.8% energy. Plan:
                    bench-prove 150mm with a stripped test shell BEFORE
                    the nano-ceramic shell is tooled.
  v.2 TABLE-WALK    Honest risk: traction. Cheap elastomer feet slip on
                    glass and bind on felt. Prototype with an interchangeable
                    foot set; log surface-class from IMU vibration signature.
  v.3 LEVITATION    Still a research track, no mechanism claimed. Two
                    constraints worth recording now: (a) acoustic levitation
                    lifts only very light objects (a 120g ceramic cube is far
                    outside current array capability — mass target would need
                    to fall by an order of magnitude); (b) magnetic
                    levitation needs closed-loop control and a bulky base.
                    Neither fits the 120g design. Recommendation: scope
                    v.3 as a SEPARATE "light cube" product line (<10g
                    shell) rather than an evolution of this body.

--------------------------------------------------------------------------------
07 // CONSUMER USE CASE LEDGER
--------------------------------------------------------------------------------

  01 — The Desk Migration (2026-07-28)  [in REPORT 01]
       Focused desk worker; NUDGE then LEAP toward the keyboard.

  02 — THE EDGE OF THE NIGHT                                  2026-10-10
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, home user, 60+ days of sleep and
  self-care logging; LOT® Station (air quality) on the nightstand; the
  cube sits on its charging pad next to the bed. The pad is small and
  near the edge of a narrow table.

  Scenario. At 03:40 the LOT® Station reports CO₂ climbing in a closed
  bedroom (the Air Quality widget in LOT-AMBIENT-AI-VISION.md would
  normally surface "open a window for 30 minutes" on screen — useless at
  3 a.m., the operator is asleep and the phone is dark).

  Cube behavior. Quiet hours cap the cube at NUDGE. The cube emits a very
  low sub-threshold tremor through the nightstand — felt, if at all,
  as a vague pull toward waking, not an alarm. No light, no sound. The
  operator stirs but does not fully wake; the signal does not escalate
  to a hop. A HOP here would be wrong twice over: it wakes them, and the
  edge gate (REPORT 01 Section 03; Section 04 above) would refuse it
  anyway because the pad is 30mm from the table edge.

  In the morning. Rule: signals missed overnight are not replayed (ttl_s
  expired). Instead, on the first wake-up the cube performs one THE
  SETTLE — a 2-second standing pressure, no motion — and the LOT® OS shows
  one line: "Air quality was poor overnight. Sleep score adjusted." The
  system reports honestly rather than pretending the night was fine.

  Why this use case matters.
    - It is the first USE CASE where the cube's refusal is the product:
      the safety gate and the quiet-hours rule are visible features, not
      limitations. A haptic object that knows when NOT to move is the
      trust foundation for every later, more spectacular gesture.
    - It connects the Station → Index of Systems → Cube chain, proving
      the cube is a general ambient output for any LOT® signal source, not
      only badges and memory questions.
    - It exercises ttl_s dropping and the downgrade chain
      (LEAP → HOP → NUDGE) in the real world.
  Telemetry captured for QI·46: gate_result = DOWNGRADED(quiet_hours,
  edge_clear), gesture executed = NUDGE, operator wake latency (from
  sleep-tracker, opt-in).

  Backlog of candidate use cases (one per future cycle, in order):
    03 The Brush Handshake    LOT® Brush logs a completed morning routine →
                              single HOP on the pad beside the sink.
    04 The Shared Table       Two operators in a household, two cubes,
                              cohort-resonance ping hops toward each other.
    05 The Lent Reminder      Fasting-day SETTLE at meal times (see
                              LOT-LENT-DIET-OUTCOME-2026.md).
    06 The Waiting Room       A clinic/lounge cube as a calm queue signal
                              replacing a buzzer (needs v.1 range).
    07 The Child's Desk       Homework-timer gestures (needs T8 review).
    08 The Long Jump Hello    v.1: cube crosses the desk to greet arrival.

--------------------------------------------------------------------------------
08 // NEXT ACTIONS  (S-2 DECISIONS REQUESTED)
--------------------------------------------------------------------------------

  1. Rule on Open Item A (recommend option 2: ~30° bias, 40mm / 17mm rise).
  2. Approve a bench-only prototype budget (voice-coil + IMU + ToF + MCU
     dev boards, stripped test shell, felt/oak/glass/laminate surfaces).
  3. Decide whether v.3 levitation becomes a separate "light cube" line.
  4. Next report (REPORT 03) opens with bench-test data replacing every
     [EST] in this document, and Use Case 03.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
================================================================================
