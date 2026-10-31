================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-R02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-31
VERSION:  0.2 — ENERGY BUDGET, ARCHITECTURE CORRECTION, VALIDATION PLAN
STATUS:   v.0 — PRE-HARDWARE, DESIGN LOCK PENDING (NO PROTOTYPE BUILT YET)
PARENT:   docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md (R01, 2026-07-28)
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read in full before writing, per the R01 rule that every cycle reads prior
documents first (including its own):

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md (R01)
    The v.0 specification. Defines THE HOP / THE LEAP / THE NUDGE / THE SETTLE,
    the voice-coil + piezo-bias architecture, the edge-detection gate, and the
    v.0 → v.3 roadmap. Section 07 holds Use Case 01 (THE DESK MIGRATION).
  docs/corporate/LOT-CUBIQ-VISION.md
    Anti-feed thesis; Section 05 "Physical Products — The Inevitable Step".
  docs/corporate/LOT-CUBIQ-OPERATOR.md
    Index of Systems (Section 03) = the signal source. Section 04 = AI-driven
    physical product delivery. Section 07 Phase 4 = physical extension.
  docs/corporate/LOT_QI46_ENGINE.md
    Institute corpus line 110 (piezoelectric mechanics, nano-ceramic
    architecture, haptic feedback language). Step 3.3: the cube as a
    Calibration Loop INPUT (haptic preference, usage frequency, biofield).
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md
    Quantum Cube Hardware row: PLANNED. Psychotronic-sensor design register.
  docs/corporate/LOT_FMCG_SUBSCRIPTION_PLAN_2027.md
    Basic Essentials subscription — the physical touchpoint Use Case 02 uses.
  docs/corporate/LOT_PTSD_Protocol.md
    NOT-a-diagnostic-tool guardrails; applied as a constraint on Section 07.
  docs/benchmark/LOT-MANIFEST.md
    COSMO® Cube (general-purpose computer) is a separate object; no naming
    collision. CUBIQ™ remains the notification body.

Repo scan for prior jump / swing / levitation work: none beyond R01. This
report is therefore an increment on R01, not a restart.

--------------------------------------------------------------------------------
01 // WHAT THIS CYCLE DID
--------------------------------------------------------------------------------

R01 fixed WHAT the v.0 cube is. R02 checks whether the numbers in R01 close.
Method: a first-principles ballistic and energy budget, reproducible with
stdlib Python (scripts/cubiq/hop_budget.py, added this cycle). The budget is a
point-mass model: flat surface, no drag, no landing loss. It gives LOWER
BOUNDS on launch energy. Real actuator chains only get worse.

Outcome: one R01 inconsistency found and corrected (Section 02), a concrete
energy requirement per gesture (Section 03), an architecture amendment
(Section 04), and a hard negative result on acoustic levitation (Section 07).
No hardware has been built or measured. Everything below is analysis, not test
data, and is labelled as such.

--------------------------------------------------------------------------------
02 // CORRECTION TO R01 — THE LEAP DID NOT CLOSE
--------------------------------------------------------------------------------

R01 §03 specifies a vertical impulse biased "5–15° off vertical". R01 §04
specifies THE LEAP as "~40mm displacement". R01 §04 also specifies THE HOP as
"<10mm rise". These do not all hold at once for a 120 g cube.

Range of a launch at elevation θ (measured from horizontal) is v²·sin(2θ)/g.
A launch 10° off vertical is θ = 80°, so sin(2θ) = 0.34:

  LAUNCH (120 g)          RANGE   v        APEX RISE   KINETIC ENERGY
  ----------------------  ------  -------  ----------  --------------
  R01 as written, 80°     40 mm   1.07 m/s  56.7 mm     68.8 mJ
  60° launch              40 mm   0.67 m/s  17.3 mm     27.2 mJ
  45° launch              40 mm   0.63 m/s  10.0 mm     23.5 mJ

A near-vertical launch needs ~57 mm of rise to travel 40 mm. That is not a
nudge-class gesture, and it is 3x the energy of a 45° launch for the same
displacement. It also makes landing recovery harder (long flight time, more
tumble).

AMENDMENT (binding on R02 onward):
  - THE HOP stays vertical: <10 mm rise = 11.8 mJ at 120 g. Unchanged.
  - THE LEAP is redefined as a 45–60° launch for 40 mm displacement:
    23–27 mJ, 10–17 mm rise. Forward bias is a launch ANGLE (a canted
    contact pad / angled impulse axis), not a 5–15° wobble on a vertical hop.
  - The piezo bimorph "bias" element in R01 §03 is demoted to a trim /
    fine-steering device (a few degrees) and is no longer the source of
    forward travel. The bulk of the angle comes from geometry.

--------------------------------------------------------------------------------
03 // ENERGY AND POWER BUDGET
--------------------------------------------------------------------------------

Launch kinetic energy per gesture (m = mass, 45° launch unless noted):

  GESTURE / TIER              RANGE    MASS   RISE     KE
  --------------------------  -------  -----  -------  --------
  v.0 THE HOP (vertical)      —        120 g  10 mm    11.8 mJ
  v.0 THE LEAP (45°)          40 mm    120 g  10 mm    23.5 mJ
  v.1 LONG JUMP               150 mm   90 g   37.5 mm  66.2 mJ
  v.1 LONG JUMP, if 120 g     150 mm   120 g  37.5 mm  88.3 mJ
  v.1 DOCK JUMP (Section 08)  250 mm   90 g   62.5 mm  110.4 mJ

Takeaways:
  1. Energy is NOT the battery problem. A 100 mAh / 3.7 V cell holds ~1,332 J.
     At a pessimistic 5% electrical-to-launch efficiency a 70 mJ jump costs
     1.4 J, so ~950 jumps per charge; at 15%, ~2,850. The pad recharges the
     cube anyway (R01 §02).
  2. Power DENSITY is the problem. 66–110 mJ delivered in a few milliseconds
     from a 45 mm cube means tens of watts of instantaneous mechanical power.
     A directly driven voice coil in this volume can supply roughly
     single-digit newtons over a few millimetres of stroke — adequate for the
     11.8 mJ HOP and the NUDGE, marginal for the 23.5 mJ LEAP, and not
     credible for v.1's 66+ mJ. (Estimate from typical small voice-coil force
     constants; to be replaced by a measured value in the bench phase.)
  3. Mass is worth more than anything else. At fixed range, KE scales with
     mass. R01's <90 g v.1 target is a 25% energy saving over 120 g and is
     the cheapest lever in the programme.

Reproduce: python3 scripts/cubiq/hop_budget.py

--------------------------------------------------------------------------------
04 // ARCHITECTURE AMENDMENT — STORE ENERGY, THEN RELEASE
--------------------------------------------------------------------------------

Consequence of Section 03.2: a pure voice-coil "push" cannot be the v.1
mechanism. Every small jumping robot that reaches long relative jumps
(insect-scale and palm-scale jumpers) does it the same way: a slow motor
loads a spring over hundreds of milliseconds, a latch releases it in under
a few milliseconds. Peak power is then set by the spring, not the motor.

v.0 / v.1 PLATFORM (replaces R01 §03 "Mechanism", keeps its goals):

  ACTUATOR A — LOAD/RELEASE CORE        (NEW)
    Micro gearmotor winds a compression spring via cam; a latch (small
    solenoid or SMA wire) releases it into the reaction mass. Quiet loading
    (<30 dBA at 1 m, target) because the slow phase is where the sound is.
    Sized for 90 mJ stored, which covers every v.0 and v.1 gesture in
    Section 03 by metering how far the spring is wound.

  ACTUATOR B — VOICE COIL               (KEPT, ROLE NARROWED)
    Drives THE NUDGE and THE SETTLE (sub-threshold, no liftoff) and the
    corrective right-up micro-pulse after a bad landing. It no longer has to
    produce launch energy. This is the role it is good at.

  ANGLE — CANTED CONTACT PAD
    A fixed 45° contact face on the base redirects the spring impulse.
    Piezo bimorph trims ±few degrees. One launch geometry, metered by wind
    depth, gives HOP (shallow), LEAP, and LONG JUMP.

  Trade accepted: more moving parts than R01's "one actuator, one moving
  mass". R01's boredom principle is not violated lightly — it is bought back
  by the gate in Section 06: the load/release core is validated alone on a
  bench before any shell is built around it.

  Open risks carried forward:
    - Latch life: >10,000 releases target, not demonstrated.
    - Spring set / fatigue shifts launch energy over life; needs closed-loop
      correction from IMU flight data (apex height from freefall time).
    - Acoustic signature of landing on hard surfaces (glass). Elastomer feet
      help; measure.

--------------------------------------------------------------------------------
05 // SENSING AND CLOSED LOOP
--------------------------------------------------------------------------------

  IMU (6-axis, centre):
    Freefall detection gives flight time t, hence apex rise = g·t²/8, which
    is the cheap closed-loop energy estimate. Compare to commanded rise;
    adjust next wind depth. This is also the telemetry QI·46 expects back
    (Step 3.3: pressure, duration, cadence).
  ToF (base, forward) — R01 edge gate, kept.
  v.1 ADDITION: ToF ranging must see further than the jump. A 150 mm jump
    needs edge look-ahead of at least 150 mm + landing scatter (60 mm zone)
    + 20 mm margin = ~230 mm, versus R01's 20 mm "near edge" inhibit. The
    gate becomes: inhibit any jump whose predicted landing zone plus margin
    crosses a detected edge. Refuse to leap off the table remains absolute.
  v.2 ADDITION: multi-directional ToF (3 beams minimum) for walking.

--------------------------------------------------------------------------------
06 // VALIDATION PLAN AND GATES (ADDS TO R01 §06)
--------------------------------------------------------------------------------

Bench order. Each gate must pass before the next stage is funded:

  G0  LOAD/RELEASE CORE, NO SHELL
      1,000 consecutive cycles, delivered energy within ±10% of command at
      three wind depths, measured with a drop-height rig (mass-on-rail
      rise). Output: measured energy vs command table.
  G1  SHELL + IMU, TETHER-FREE ON ONE SURFACE
      THE HOP: 200/200 in-place, lands upright or self-rights (>25° tip →
      corrective pulse succeeds).
  G2  EDGE GATE, ADVERSARIAL
      100/100 approach trials at 5 approach angles, zero off-table events
      (R01 criterion, kept). Add: a stationary cube must also refuse commands
      when ToF is occluded (blocked sensor = fail-safe, no jump).
  G3  THE LEAP (REDEFINED)
      40 mm ± 15 mm displacement, 45/50 trials on wood and laminate.
  G4  500/500 hop-and-recover soak (R01 v.0 close gate), unchanged.

v.0 is closed only when G0–G4 pass. v.1 funding is a separate decision.

--------------------------------------------------------------------------------
07 // v.2 AND v.3 — WHAT THE NUMBERS SAY
--------------------------------------------------------------------------------

v.2 TABLE-WALKING
  Not rebuilt here; R01 gate stands. New constraint from this cycle: a walk
  made of hops costs 12–24 mJ per step at hop scale, so a 200 mm traverse in
  ~10 small leaps is ~0.2–0.3 J — affordable. The hard part is heading
  control per step (cross-track error <15 mm over 200 mm), which depends on
  contact-pad friction, not energy. Friction per surface (wood, glass,
  laminate, stone) is the first v.2 research deliverable.

v.3 LEVITATION — RESULT: ACOUSTIC IS OUT FOR A 120 g CUBE
  Weight: 1.18 N. Over a 45 × 45 mm base (20.25 cm²) the mean support
  pressure is ~581 Pa. Acoustic radiation pressure scales as p²/(ρc²). At
  160 dB SPL (p ≈ 2 kPa) that is ~28 Pa; ~173 dB is required to reach
  581 Pa. Sustained ~173 dB ultrasound at a desk is far above published
  occupational ultrasound exposure limits (those are roughly 110–120 dB at
  40 kHz) and the order-of-magnitude estimate does not allow for standing-
  wave efficiency losses. Acoustic levitation suits millimetre-scale, gram-
  scale objects; it does not scale to a consumer cube of this mass.
  R01 §06 v.3 candidate (a) is therefore RETIRED for the current form factor.

  Remaining candidates:
    (b) Active electromagnetic suspension (EMS): table-embedded coil array,
        permanent magnet in the cube, Hall-sensor feedback at kHz rate.
        Earnshaw's theorem forbids passive stable levitation with static
        magnets, so the loop is mandatory. 1.18 N is a modest force; the open
        problems are lift height (a few mm to ~20 mm realistic), lateral
        stability, and sustained power draw.
    (c) Diamagnetic levitation (pyrolytic graphite over a magnet lattice):
        passive and silent but supports only low mass per area; a 120 g cube
        is out of range without a large base plate.
    (d) Shrink the problem: a hovering PLATE or ring under a lighter cube
        (<40 g) reopens the options. Mass reduction pays off in v.1 anyway.

  Recommendation: v.3 research proceeds on (b) at a bench-test scale — a
  single-axis EMS rig lifting a 120 g dummy mass, measuring holding power and
  disturbance rejection. No v.3 milestone is committed.

  Design-for-levitation rules for v.0–v.2 stay as R01 states (table-as-power-
  surface; mass budget). Add: leave a ≥10×10×10 mm volume in the cube centre
  free for a future permanent magnet, and keep the magnet-bearing structure
  non-ferrous.

--------------------------------------------------------------------------------
08 // CONSUMER USE CASES
--------------------------------------------------------------------------------

Use Case 01 (THE DESK MIGRATION, 2026-07-28) lives in R01 §07 and is not
repeated. This cycle's entry follows; it is also appended to R01 §07 per its
append-only rule.

  USE CASE 02 — THE REFILL DAY                              2026-10-31
  ─────────────────────────────────────────────────────────────────
  Tier needed: v.1 (LONG JUMP). Subscriber: Basic Essentials
  (LOT_FMCG_SUBSCRIPTION_PLAN_2027.md) with a CUBIQ™ and two LOT® pads.

  The monthly essentials box — toothbrushes, paper goods, basics —
  arrives. Today nothing tells a household that a refill is due or that the
  old items are past their cycle; the box sits by the door and the
  toothbrush stays in the cup another three weeks.

  Setup: Pad A on the hallway console, Pad B ("the Dock") 200–250 mm away
  on the same console, beside the household's toothbrush cup or on the
  bathroom shelf. The cube lives on Pad A.

  Delivery is confirmed in the Index of Systems (Operator doc §04). The
  cube performs THE NUDGE on Pad A: a tremor through the console. The
  subscriber carries the box in and opens it. The cube, now seeing its
  Dock reachable (ToF ranging; no edge within the jump + margin), performs
  one LONG JUMP onto Pad B — a deliberate, visible cross of the gap, landing
  within the 60 mm zone and self-righting. The jump is the prompt: "refill is
  here, swap now." The subscriber swaps the brush; the cube does THE SETTLE
  (2 s standing pressure) as acknowledgement and charges on the Dock.

  Why this needs the cube and not a push notification: the prompt appears
  at the exact object the action concerns (the cup), at the moment hands are
  free, and it clears itself — no unread badge. Why it needs v.1: a
  40 mm LEAP cannot cross two pads; a 150–250 mm jump with a placement
  guarantee can.

  Consumer value proposition: converts a recurring-delivery subscription
  from "something that arrives" into "a ritual that closes". Churn argument,
  stated as hypothesis not result: households that complete the swap within
  24 h of delivery should show higher retention than those that do not;
  the Calibration Loop (Step 3.3 usage frequency) can measure it.

  Constraints and guardrails:
    - Opt-in only; the cube never jumps unless the subscriber has enabled
      Refill Day and set up the Dock (a calibration step maps pad positions
      so edge-gate and landing zone are known).
    - No health claims. The cube prompts a household chore; it makes no
      statement about dental or medical outcomes (consistent with the
      NOT-a-diagnostic-tool stance of LOT_PTSD_Protocol.md).
    - Kids/pets: motion is brief, low-energy (~66–110 mJ, about a 5 g coin
      dropped from 1.3–2.2 m); a pinch/finger-on-pad detection input (IMU tilt / capacitive)
      cancels the jump. Needs formal child-safety review before any
      household with children ships — flagged, not solved.
    - If the Dock is moved or occluded the cube falls back to THE NUDGE
      only. Refusing to jump is always the safe default.

  Telemetry returned (Calibration Loop): time from delivery to swap
  acknowledgement, jump success/landing offset, subscriber cancellations of
  the prompt.

--------------------------------------------------------------------------------
09 // NEXT CYCLE (R03) — PROPOSED, NOT COMMITTED
--------------------------------------------------------------------------------

  1. Bench-spec the load/release core: spring rate, stroke, cam profile for
     90 mJ at ≤30 dBA load noise; supplier shortlist (gearmotor, latch).
  2. Write the haptic-driver software interface (signal → gesture) as a
     typed contract so the Index of Systems can target the cube before
     hardware exists; simulate with the budget script as the physics stub.
  3. Surface-friction test protocol for v.2 (four surfaces).
  4. Use Case 03 — new consumer scenario for the NEXT tier (likely v.2
     walking), appended here and to R01 §07.

--------------------------------------------------------------------------------
10 // OPEN QUESTIONS FOR S-2
--------------------------------------------------------------------------------

  Q1  Accept the Section 02 amendment (LEAP at a 45–60° launch, piezo demoted
      to trim)? R01 is not edited; this report supersedes it where they
      conflict.
  Q2  Approve the added moving parts (load/release core) in exchange for a
      credible v.1? The alternative is staying at the 11.8 mJ HOP/NUDGE class
      and treating long jumps as research.
  Q3  Is Refill Day the right physical-subscription tie-in, or should the
      next use case sit with a non-FMCG tier?

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-R02
================================================================================
