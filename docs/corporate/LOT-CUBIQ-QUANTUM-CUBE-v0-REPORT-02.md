================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-05
VERSION:  0.2 — ENGINEERING FIRST PASS (PHYSICS BUDGET + TEST PLAN)
STATUS:   v.0 — PRE-HARDWARE. NO PHYSICAL PROTOTYPE EXISTS YET.
PREDECESSOR: docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md (v0.1, 2026-07-28)
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing (per the reading rule in v0.1 Section 00):

  LOT-CUBIQ-QUANTUM-CUBE-v0.md   v0.1 spec: controlled hop, four gestures,
                                  roadmap v.0-v.3, Use Case 01.
  LOT-CUBIQ-VISION.md            "Anti-feed" thesis: invest attention, return
                                  structure.
  LOT-CUBIQ-OPERATOR.md          Index of Systems, Phase 4 physical extension.
  LOT_QI46_ENGINE.md             Piezo / nano-ceramic / haptic corpus; cube as
                                  Month-12 input device (calibration loop).
  CQGS-WHITE-PAPER-SNAPSHOT.md   "Quantum Cube Hardware" PLANNED line item.
  LOT-MANIFEST.md                COSMO® Cube is a separate Kuzya track; no
                                  naming collision.

Status of the brief: v0.1 defined WHAT. This report does the first
quantitative pass — it checks whether v0.1's numbers are physically
consistent, and defines how v.0 is tested. It is a design analysis, not a
build report. No hardware has been built or measured; every figure below is
a calculation or a target, labelled as such.

--------------------------------------------------------------------------------
01 // SUMMARY OF FINDINGS
--------------------------------------------------------------------------------

  F1  The v0.1 numbers are consistent for v.0: a 120 g cube performing a
      <10 mm HOP needs ~12 mJ; a 40 mm LEAP needs ~47 mJ. Both are small
      and easily met by a voice-coil or spring-latch actuator.

  F2  The v0.1 bias range "5-15° off vertical" is too wide. At 5° the same
      launch energy that gives 40 mm range would need ~135 mJ and the cube
      would rise ~114 mm — a tumble hazard and a noise problem. LEAP bias
      must be held to 12-15° (see Section 02).

  F3  v.1 (LONG JUMP, >150 mm) is NOT reachable by retuning stroke length
      alone while keeping a ~15° bias: it would need ~132 mJ and a ~140 mm
      rise. A long jump is a flatter trajectory. v.1 therefore requires an
      ADJUSTABLE launch angle (target 40-50°), which v0.1 did not list.
      Recommendation: reserve a tilt axis in the v.0 mechanical envelope.

  F4  Energy is never the bottleneck; peak power, landing, and noise are.
      Battery energy is ~4 orders of magnitude above one jump.

  F5  The first real risk is the edge-detection gate and landing
      survivability, not the jump itself. Test plan (Section 05) front-loads
      both.

--------------------------------------------------------------------------------
02 // PHYSICS BUDGET (CALCULATED, NOT MEASURED)
--------------------------------------------------------------------------------

Assumptions: flat level surface, ideal projectile, no air drag, launch and
landing at the same height. g = 9.81 m/s². Real units lose energy to
friction, contact, and spring hysteresis; assume 25-40 % actuator-to-launch
efficiency when sizing parts.

  HOP (v0.1 §04): 120 g, rise 10 mm
      E = m·g·h = 0.12 × 9.81 × 0.010 ≈ 11.8 mJ

  LEAP (v0.1 §04): 120 g, 40 mm range
      range R = v²·sin(2θ)/g ; rise = v²·sin²θ/(2g) ; E = ½·m·v²
      θ = launch angle above horizontal (75° = 15° off vertical)

      bias off vertical | launch energy | launch speed | peak rise
      ------------------+---------------+--------------+----------
            15°         |    ~47 mJ     |  0.89 m/s    |  ~37 mm
            10°         |    ~69 mJ     |  1.07 m/s    |  ~57 mm
             5°         |   ~136 mJ     |  1.50 m/s    | ~114 mm

      -> Keep LEAP bias at 12-15°. Rise ≈ 35-45 mm is visible but gentle.

  v.1 LONG JUMP: 90 g, 150 mm range

      launch angle | launch energy | launch speed | peak rise
      -------------+---------------+--------------+----------
          45°      |    ~66 mJ     |  1.21 m/s    |  ~38 mm
          60°      |    ~76 mJ     |  1.30 m/s    |  ~65 mm
          75°      |   ~132 mJ     |  1.72 m/s    | ~140 mm

      -> A 150 mm jump at 45° costs about the same energy as the v.0 LEAP and
         rises no higher. The long jump is cheap if the angle is adjustable;
         it is expensive and violent if the angle is fixed near vertical.

  ACTUATOR SIZING (v.0)
      Target launch energy with margin: 47 mJ / 0.30 efficiency ≈ 160 mJ
      stored/delivered. A ~8-10 mm stroke implies ~16-20 N average force
      over the stroke — within small voice-coil / spring-latch range.
      Release time 3-5 ms implies ~10-15 W mechanical peak. Supercapacitor
      or small LiPo burst is sufficient; peak current, not energy, drives
      the power-stage design.

  ENERGY BUDGET
      200 mAh @ 3.7 V ≈ 2.7 kJ. One 160 mJ jump ≈ 6e-5 of the pack.
      Battery life is dominated by standby (IMU, radio), not actuation.
      Target: >14 days standby on one charge, ~20 gesture events per day.

  NOISE
      A hard-stop impact at 3-5 ms is audible. The "presence without
      spectacle" thesis (v0.1 §04) requires a soft-stop (elastomer bump
      stop) on the reaction mass and a sub-35 dBA target at 30 cm for THE
      NUDGE and THE HOP. THE LEAP may be louder; it is the rare gesture.

--------------------------------------------------------------------------------
03 // v.0 ARCHITECTURE — REVISED BLOCK LIST
--------------------------------------------------------------------------------

  Unchanged from v0.1: 45 mm cube, nano-ceramic shell, <120 g, four
  elastomer feet, Qi-class base charging, single LED ring (state only).

  Clarified or added:

  A1  ACTUATOR     Voice-coil (primary candidate) vs. spring-latch + small
                   motor (fallback). Decision gate: bench test both on a
                   gram-scale test mass before shell design is locked.
  A2  BIAS         Piezo bimorph per v0.1 for 12-15° bias. ADD: reserve a
                   mounting boss for a tilt flexure (for v.1 variable angle).
  A3  SENSING      6-axis IMU at center (v0.1) + ToF edge sensors. CHANGE:
                   v0.1 specified a forward-facing ToF only. v.0 should
                   carry at least TWO (forward + rear) so a cube that lands
                   rotated 180° still sees the edge. Four-sided coverage is
                   the v.2 requirement; two is the v.0 minimum.
  A4  MCU/RADIO    Low-power BLE SoC. Paired to the operator's phone or
                   desktop session; the Index of Systems signal arrives as a
                   small gesture-ID message (see Section 04).
  A5  POWER        Small LiPo + supercap burst stage; Qi receiver in base.
  A6  LANDING      Corrective micro-pulse per v0.1 when tilt >25°. ADD: a
                   hard "give up" rule — after 2 failed self-rights the cube
                   stops, signals via LED, and waits. A cube must never
                   hammer itself in a loop.

--------------------------------------------------------------------------------
04 // SOFTWARE CONTRACT — SIGNAL TO GESTURE
--------------------------------------------------------------------------------

The Index of Systems emits events; the cube driver maps them to gestures.
The mapping lives on the host, not in firmware, so gestures can be re-mapped
without a firmware flash. Firmware only knows five commands:

      NUDGE | HOP | LEAP | SETTLE | STAND_DOWN

  event                       gesture     rules
  --------------------------  ----------  ----------------------------------
  memory question ready       NUDGE       max 1 per 30 min
  badge unlocked (≤ uncommon) HOP         max 3 per hour
  badge unlocked (≥ rare)     LEAP        max 1 per 2 hours
  assembly phase advanced     SETTLE      any time
  operator "quiet" / night    STAND_DOWN  cancels queue, blocks all motion

  SAFETY OVERRIDES (firmware-enforced, not host-overridable):
    - Edge gate: refuse HOP/LEAP if any edge sensor reads <20 mm travel path.
      Substitute NUDGE.
    - Tilt gate: refuse all gestures unless the IMU reports the cube upright
      and stationary for >500 ms.
    - Thermal / rate limit: max 6 jumps per minute.
    - Pickup detect: if the IMU sees a lift, cancel and hold 10 s.

  Telemetry returned to QI·46 calibration loop (v0.1 §05): gesture ID,
  achieved displacement (IMU double integration, coarse), landing tilt,
  operator response latency (time to the next software session after the
  gesture). Opt-in, off by default.

--------------------------------------------------------------------------------
05 // TEST PLAN
--------------------------------------------------------------------------------

Ordered so the highest-risk items are tested first.

  T1  EDGE GATE (blocking)       100/100 approach trials at 20-60 mm from a
                                  table edge, from 4 start orientations, 3
                                  surfaces. One miss = fail and redesign.
  T2  ACTUATOR BENCH             Voice-coil vs. spring-latch on a 120 g
                                  dummy mass: delivered energy, repeatability
                                  (σ < 10 %), noise at 30 cm, 5,000-cycle
                                  endurance.
  T3  HOP / LEAP CHARACTERIZATION  High-speed camera + IMU. Verify Section 02
                                  predictions; record real efficiency.
  T4  LANDING                    500 hop-and-recover cycles (v0.1 gate),
                                  zero off-table landings, zero actuator
                                  failures, self-right success rate reported.
  T5  SURFACES                   wood, glass, laminate, fabric desk mat. Log
                                  slip; flag surfaces where the cube must
                                  fall back to NUDGE only.
  T6  PICKUP / HAND SAFETY       Cube mid-gesture touched or lifted: cancel
                                  within 50 ms, no pinch points on shell.
  T7  CHARGE-PAD CYCLE           Cube leaps while on the pad: confirm it
                                  never lands off the pad's coil alignment
                                  in a way that stops charging unnoticed.

  v.0 CLOSE CRITERIA (adds to v0.1): T1 100/100, T4 500/500, T2 σ < 10 %,
  noise target met for NUDGE/HOP.

--------------------------------------------------------------------------------
06 // RISKS
--------------------------------------------------------------------------------

  R1  Cube falls off desk          HIGH impact. Mitigation: T1, rear ToF,
                                    tilt gate, conservative default of NUDGE.
  R2  Noise annoys, not soothes    MED. Mitigation: soft stops, sub-35 dBA
                                    target, STAND_DOWN schedule, user caps.
  R3  Surface variance             MED. Cube behaves differently on glass vs.
                                    felt. Mitigation: IMU-calibrated gain per
                                    session; NUDGE fallback.
  R4  Notification fatigue         MED. A moving object is still an
                                    interruption. Mitigation: rate limits in
                                    Section 04; default-sparse mapping.
  R5  Anti-feed drift              MED (brand). If gestures become
                                    gamified engagement bait, the product
                                    contradicts LOT-CUBIQ-VISION §01. Rule:
                                    no gesture without a user-meaningful
                                    event.
  R6  Levitation expectations      LOW now. v.3 remains a research track;
                                    no marketing claim until a mechanism is
                                    demonstrated.
  R7  Privacy of telemetry         MED. Opt-in, minimal, on-device
                                    aggregation before upload.

--------------------------------------------------------------------------------
07 // CONSUMER USE CASES (LEDGER — APPEND ONLY)
--------------------------------------------------------------------------------

Use Case 01 is on record in LOT-CUBIQ-QUANTUM-CUBE-v0.md (THE DESK
MIGRATION, 2026-07-28). Not repeated here. Each cycle adds exactly one.

  USE CASE 02 — THE PHONE-FREE EVENING                      2026-11-05
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, works in a high-notification job,
  has a habit of picking up the phone "just to check" after dinner and
  losing 90 minutes. Has agreed in the LOT® app to a wind-down window
  of 20:00-23:00 and charges the phone in the hallway. The CUBIQ™ pad
  sits on the coffee table.

  20:00 — The cube performs THE SETTLE: two seconds of light standing
  pressure, no visible motion. It is the signal that the window has
  begun. No alarm, no screen. The operator, on the sofa, notices the
  faint buzz in the table through their coffee cup and understands what
  it means because they set it up.

  20:00-23:00 — Everything is routed through the cube instead of the
  phone, under the Section 04 rules. A memory question becomes a NUDGE.
  A rare badge earned earlier on the desktop becomes a single LEAP — 40
  mm toward the operator's side of the table — shown once and not
  repeated. Messages from work, social apps, and news never reach the
  cube; it has no vocabulary for them. That absence is the feature.

  21:30 — The operator reaches for the phone out of habit, finds
  nothing in their pocket, and looks at the cube instead. It is still.
  Nothing is waiting. The urge passes in under a minute.

  23:00 — STAND_DOWN. The cube goes inert; the Index of Systems writes
  a one-line summary into tomorrow's first session ("1 question
  waiting, 1 badge earned").

  Why it matters: this is the anti-feed thesis (LOT-CUBIQ-VISION §01) in
  physical form. The phone notifies about everything and demands a screen.
  The cube notifies about almost nothing, and never asks to be looked at.
  It uses only v.0 capabilities (NUDGE, LEAP, SETTLE, STAND_DOWN) — no
  v.1+ motion is assumed.

  Measured by (opt-in): evening phone pickups, evening software-session
  completion rate, number of STAND_DOWN overrides by the operator.

  QUEUE FOR FUTURE CYCLES (ideas only, not commitments):
    UC03  v.1 — THE DELIVERY: a long jump brings the cube across the
          desk to rest beside a physical Phase 4 item (cleanse kit).
    UC04  v.2 — THE GUIDE: the cube walks a slow path toward the
          operator's hand at the start of a 5-11 minute session.
    UC05  v.3 — THE FLOAT: research-only; a levitating cube as a
          focus-timer object. No claim until demonstrated.

--------------------------------------------------------------------------------
08 // NEXT ACTIONS
--------------------------------------------------------------------------------

  N1  Decide: reserve variable-angle (tilt) boss in v.0 envelope? (F3)
  N2  Source voice-coil and spring-latch bench parts; run T2.
  N3  Specify the BLE gesture-command message (five commands, Section 04)
      and add a host-side driver stub to the Index of Systems.
  N4  Add rear ToF to the v.0 sensor list (A3). Rewrite T1 accordingly.
  N5  Next cycle: append Use Case 03 and update the physics table with
      measured values from T2/T3 once any bench data exists.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
================================================================================
