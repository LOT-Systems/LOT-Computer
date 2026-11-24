================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-v0-DEV-REPORT-02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report, Cycle 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-24
CYCLE:    02 (Cycle 01 = LOT-CUBIQ-QUANTUM-CUBE-v0.md, 2026-07-28)
STATUS:   v.0 — ACTUATION BUDGET CLOSED ON PAPER · ONE ARCHITECTURE CHANGE
          PROPOSED (ECR-001) · v.1 TIP-OVER RISK FOUND · LEVITATION TRACK
          NARROWED
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG — WHAT THIS CYCLE IS BUILT ON
--------------------------------------------------------------------------------

Read in full before writing this report:

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md   (Cycle 01, own prior work)
    The v.0 spec. 45mm cube, <120g, single voice-coil reaction-mass
    actuator plus piezo bias strip, IMU landing recovery, ToF edge gate,
    four-gesture vocabulary (NUDGE / HOP / LEAP / SETTLE), roadmap
    v.0 → v.3, Use Case 01 "The Desk Migration". Section 07 requires each
    cycle to append one new consumer use case. Cycle 02 does so (§09).

  docs/corporate/LOT-CUBIQ-VISION.md
    Anti-feed thesis; §05 "Physical Products: The Inevitable Step".
    Multi-sensory cubic includes NIGHT MODE as a native state. Cycle 02
    is the first to carry night mode into hardware (§09, §05).

  docs/corporate/LOT-CUBIQ-OPERATOR.md
    §03 Index of Systems (the signal source), §04 AI-driven physical
    delivery ("WELLNESS DEVICES — ambient tech that feeds back into
    LOT®"), §07 Phase 4 Physical Extension (Days 90+).

  docs/corporate/LOT_QI46_ENGINE.md
    Line 108: LOT® Institute white papers — CQGS, Quantum Cube,
    bioelectric philosophy. Line 110: nano-ceramic, piezoelectric
    mechanics. Lines 750-764: Month-12 Quantum Cube sync — cube reports
    haptic preference (pressure, duration, cadence). §06 of this report
    turns that line into a concrete telemetry schema.

  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md
    Institute surface (institute.lot-systems.com), Layer 0 corpus, row
    "Quantum Cube Hardware — Month 12+ — PLANNED".

  docs/corporate/LOT_ROBOTICS_COSMO.md
    COSMO® rule: a unit without a verified LOT profile does not
    activate. Cycle 02 adopts this for CUBIQ™ pairing (§05, state
    UNBOUND). CUBIQ™ remains a notification body, not a COSMO® computer.

Nothing in Cycle 01 is reversed. One element is proposed for change
under a formal engineering change request (ECR-001, §02), because the
numbers in §01 do not support it as written.

--------------------------------------------------------------------------------
01 // ACTUATION ENERGY BUDGET — THE NUMBERS CYCLE 01 DID NOT HAVE
--------------------------------------------------------------------------------

All figures are first-order, rigid-body, no air drag, g = 9.81 m/s².
Cube edge a = 45mm. These are design-sizing numbers, not test results.

  1.1  REQUIRED TAKEOFF STATE PER GESTURE

  GESTURE     MASS    TARGET                  LAUNCH       TAKEOFF   CUBE KE
                                              ANGLE*       SPEED
  ───────     ────    ──────                  ──────       ───────   ───────
  NUDGE       120g    no liftoff, <0.3g at    —            —         ~0
                      shell, felt via desk
  HOP         120g    10mm rise, in place     90°          0.44 m/s  11.8 mJ
  LEAP (v.0)  120g    40mm range             75°          0.89 m/s  47 mJ
  LONG JUMP   90g     150mm range            72°**        1.58 m/s  113 mJ
   (v.1)
                       * measured from the table plane
                      ** see §03 — 45° would be cheapest and is unsafe

  LEAP apex height: ~37mm. LONG JUMP apex height: ~115mm.

  1.2  REACTION-MASS TRANSFER

  The cube jumps by accelerating an internal reaction mass m_r upward
  against the shell and arresting it at the top stop. Momentum carries
  the whole body: V = (m_r / M) · v_r. The arrest is inelastic, so the
  fraction of stored mechanical energy that becomes cube flight energy
  is roughly m_r / M.

    LEAP, m_r = 30g, M = 120g   →  v_r ≈ 3.5 m/s
                                    stored energy needed ≈ 190 mJ
    LONG JUMP, m_r = 30g, M = 90g →  v_r ≈ 4.7 m/s
                                    stored energy needed ≈ 340 mJ

  Raising m_r helps efficiency but eats the mass budget. 30g (25-33%
  of total) is the Cycle 02 working value. It is also the battery: see
  1.4.

  1.3  WHAT A VOICE COIL ALONE WOULD HAVE TO DO

  Accelerating 30g to 3.5 m/s over a realistic 8mm internal stroke
  needs ~770 m/s² — about 23 N sustained for ~4.5 ms. A voice coil that
  delivers 23 N inside a 45mm cube draws tens of amps peak from a cell
  that also has to be small. It is not impossible. It is not boring,
  and Cycle 01 said v.0 must be mechanically boring.

  1.4  POWER

    Working cell: 1S LiPo, 300 mAh, 3.7 V ≈ 4.0 kJ, ~7g.
    Per LEAP at ~30% electrical→stored efficiency: ~0.65 J.
    Per LONG JUMP: ~1.1 J.
    → ~6,000 LEAPs or ~3,500 LONG JUMPs per charge on paper. A realistic
      notification day is 5-40 gestures. Motion energy is not the
      constraint; standby radio and IMU current are (§05, sleep budget).

  DESIGN NOTE: the cell is the densest part in the cube. Mounting the
  cell itself as the reaction mass (on the slider, flex-cabled) is
  recorded as option RM-B for the bench. It saves ~7-10g of dead
  tungsten but puts a lithium cell under 80g+ shock every LEAP. Not
  adopted for v.0; logged for v.1 mass reduction.

--------------------------------------------------------------------------------
02 // ECR-001 — HYBRID ACTUATOR: VOICE COIL + SPRING-LATCH
--------------------------------------------------------------------------------

  STATUS      PROPOSED · awaiting S-2 sign-off
  CHANGES     Cycle 01 §03 MECHANISM (single voice-coil)
  KEEPS       single reaction mass, single axis, piezo bias strip, IMU,
              ToF edge gate, four-gesture vocabulary — unchanged

  THE CHANGE
    Two drives on the one reaction-mass slider:

    (1) VOICE COIL — small, quiet, fast. Drives NUDGE and SETTLE
        directly (sub-liftoff, continuous control, < 2 N). Also does the
        landing-recovery micro-pulse.

    (2) SPRING-LATCH — a 2-3 kN/m compression spring wound by a micro
        gear-motor + lead screw over ~0.6-1.0 s (≈0.3 W), held by a
        latch, released by a shape-memory-alloy or solenoid pin. Drives
        HOP and LEAP. Stored energy is set by wind depth, so the
        gesture amplitude is a firmware number, not a current limit.

    Peak spring force ≈ 45-50 N for a few ms — this is what a 23 N
    voice coil would have had to fake with peak current.

  WHY
    - Energy is accumulated slowly from a small cell and released fast.
      The battery never sees the jump.
    - Wind-time (≤1 s) becomes a feature: §05 uses it as the EDGE_CHECK
      window. The cube looks before it leaps, literally.
    - Voice coil is still there for everything that must be silent.
      Night mode (§09) only uses the voice coil.

  COST
    +1 motor, +1 latch, +~9g. Mass budget in §04 still closes under
    120g. One more wear part (latch) — gated in §07 at 5,000 cycles.

  REJECTED ALTERNATIVES
    - Solenoid only: loud click at both ends of stroke, poor for NUDGE.
    - Piezo stack as primary: correct material line (QI46 L110), but
      stroke is microns; would need a flexure amplifier that is its own
      R&D project. Piezo stays as the bias element and as the v.2.5
      glide driver (§08).
    - Flywheel/reaction-wheel jumping (cube balances and flips on an
      edge): elegant, proven in research robots, but it is a tumbling
      gesture, not a hop — wrong language for a desk object at v.0.
      Recorded as a candidate for v.2 yaw control.

--------------------------------------------------------------------------------
03 // FINDING — THE 45° LONG JUMP TIPS THE CUBE OVER (v.1 RISK)
--------------------------------------------------------------------------------

  The minimum-energy way to cover 150mm is a 45° launch. On a flat
  table a cube that lands with horizontal speed v_h and is stopped by
  friction at its leading edge rotates about that edge. It tips over if
  that rotation can lift its center of mass over the edge:

    rotational KE at edge-stop   = (3/16) · M · v_h²
    energy to tip past the edge  = M · g · a(√2 − 1)/2   (≈ 9.3mm lift)

    → tip-over threshold: v_h > ~0.70 m/s  (worst case: no slip,
      no bounce, rigid feet)

    v.0 LEAP at 75°          v_h = 0.23 m/s   margin ≈ 9×   SAFE
    v.1 LONG JUMP at 45°     v_h = 0.86 m/s                 TIPS
    v.1 LONG JUMP at 72°     v_h = 0.49 m/s   margin ≈ 2×   SAFE

  CONSEQUENCE FOR v.1
    The "long jump" is a lob, not a skim: ~115mm apex for 150mm range,
    and ~2.4× the energy of the 45° jump. The piezo bias strip must
    deliver ~18° off vertical, not the 5-15° Cycle 01 specified for
    v.0. Mitigations to test in v.1 (any one widens margin):
      - softer leading-edge feet (Shore 20-30A) to allow controlled slip
      - lowering COM by placing reaction mass at bottom-stop on landing
      - voice-coil "brake pulse" on IMU-detected touchdown
    Cycle 01 v.1 gate (150mm, 60mm landing zone, 9/10 on three surfaces)
    stands; add: 0 tip-overs in those trials.

--------------------------------------------------------------------------------
04 // v.0 MASS BUDGET AND BILL OF MATERIALS (WORKING DRAFT)
--------------------------------------------------------------------------------

  SUBSYSTEM                       PART CLASS                         MASS
  ─────────                       ──────────                         ────
  Shell, 5 faces + base           nano-ceramic composite, 1.2mm wall  34g
  Reaction mass + slider          tungsten-alloy slug on linear rail  30g
  Spring + lead screw + gearmotor 6mm micro gearmotor, 2.5 kN/m       9g
  Latch                           SMA wire pin (or micro solenoid)     1g
  Voice coil                      10mm moving-magnet VCA               6g
  Piezo bias strip                bimorph, 25×5mm, angle-mounted       1g
  MCU + radio                     BLE 5.x SoC, ARM Cortex-M class      2g
  IMU                             6-axis, ≥1 kHz ODR                  <1g
  ToF edge sensors ×2             multizone ToF, base-forward          1g
  Charge coil + PMIC              Qi-class receiver, 1S charger        5g
  Cell                            1S LiPo 300 mAh                      7g
  Driver stage                    H-bridge (coil), MOSFET (latch)      1g
  Feet ×4                         elastomer, Shore 40A, replaceable    2g
  Harness / fasteners / margin                                        10g
                                                                    ─────
                                                           TOTAL   ~110g
                                                  v.0 ceiling       120g

  Cycle 01 specified ONE forward ToF. Cycle 02 specifies TWO (forward +
  rear-down), because the latch release is irreversible and a cube
  that hops backward off a misaligned plinth is as lost as one that
  hops forward. Cost +1g.

--------------------------------------------------------------------------------
05 // FIRMWARE — GESTURE STATE MACHINE v0.1
--------------------------------------------------------------------------------

  UNBOUND ──pair w/ verified LOT profile──▶ IDLE
     (adopted from LOT_ROBOTICS_COSMO.md: no profile, no motion. An
      unbound cube can only blink its pairing ring.)

  IDLE ──signal from Index of Systems──▶ RESOLVE
  RESOLVE   map signal → gesture (Cycle 01 §04) → apply MODE caps
            (DAY / NIGHT / QUIET-HOURS, §09)
              ├─ NUDGE / SETTLE ─▶ VOICE_COIL_PLAY ─▶ REPORT ─▶ IDLE
              └─ HOP / LEAP ─────▶ WIND
  WIND      gearmotor winds spring to gesture depth (0.6-1.0 s)
            ToF sampled continuously during wind  ─ this is EDGE_CHECK
              ├─ edge < 20mm in launch cone ─▶ UNWIND ─▶ substitute
              │                                NUDGE ─▶ REPORT
              ├─ IMU tilt > 3° (cube not flat) ─▶ UNWIND ─▶ abort
              └─ clear ─▶ RELEASE
  RELEASE   piezo bias fires, latch pin pulled (t0 + 1-3 ms)
  FLIGHT    IMU free-fall detect, time-of-flight logged
  LAND      impact detect → optional voice-coil brake pulse
  RECOVER   if tilt > 25° → corrective pulse (≤3 tries) → else FAULT
  REPORT    telemetry packet (§06) ─▶ IDLE
  FAULT     cube on side/back, or 3 recovery failures: all actuation
            locked until operator touches/rights it. Ring shows amber.

  RULES
    - Rate limit: ≤1 HOP/LEAP per 90 s, ≤12 per hour, regardless of
      signal volume. A cube that hops every time a badge fires during a
      badge-codex release (812→843 badges this month) becomes a feed.
      Excess signals coalesce into one SETTLE.
    - Latch release only from WIND with both ToF channels clear and
      fresh (< 50 ms old). Hard rule in firmware, not configurable.
    - Sleep budget target: ≤ 40 µA average in IDLE (BLE advertising at
      long interval, IMU in wake-on-motion). At 300 mAh that is the
      difference between weeks off-plinth and days.

--------------------------------------------------------------------------------
06 // TELEMETRY CONTRACT — CLOSING THE QI·46 LOOP
--------------------------------------------------------------------------------

  QI46 L757 asks the cube for "haptic preference — pressure, duration,
  cadence". Cycle 02 turns that into one packet per gesture:

    {
      "v": 0,
      "gesture": "LEAP",            // NUDGE | HOP | LEAP | SETTLE
      "signal": "badge.rare",       // Index of Systems signal class
      "mode": "DAY",                // DAY | NIGHT | QUIET
      "outcome": "OK",              // OK | SUBSTITUTED | ABORTED | FAULT
      "wind_ms": 820,
      "flight_ms": 171,
      "range_mm_est": 41,           // IMU dead-reckoned
      "tilt_on_land_deg": 6.2,
      "recover_pulses": 0,
      "edge_min_mm": 74,
      "ack_s": 312                  // seconds until operator next opened
                                    // the cubic, or touched the cube
    }

  "ack_s" is the preference signal. QI·46 does not need the operator
  to rate the cube: if NUDGEs are acknowledged faster than LEAPs for
  this operator at this hour, the Calibration Loop should learn to
  NUDGE. That is cadence and pressure, measured rather than asked.

  PRIVACY: the packet carries no audio, no image, no location beyond
  "on plinth / off plinth". ToF range data never leaves the cube.

--------------------------------------------------------------------------------
07 // v.0 VALIDATION PLAN (BENCH, PRE-HARDWARE)
--------------------------------------------------------------------------------

  Cycle 01 gates stand (500/500 hop-and-recover, 100/100 edge trials).
  Cycle 02 adds the protocol and the missing gates:

  TEST                     RIG / METHOD                            PASS
  ────                     ────────────                            ────
  T1 Hop-and-recover       plinth on 3 surfaces (oak, glass,       500/500 upright,
                           laminate), 60 fps side camera           0 off-table
  T2 Edge refusal          cube placed 5-60mm from edge at 8       100/100 refusals
                           headings, LEAP commanded                inside 20mm
  T3 Latch endurance       wind/release cycling on bench jig       5,000 cycles,
                                                                   <5% energy drift
  T4 Acoustic — DAY        LEAP, mic at 1m, quiet room             ≤ 45 dBA peak
  T5 Acoustic — NIGHT      NUDGE/SETTLE only, mic at 1m            ≤ 25 dBA peak
                                                                   (new, from §09)
  T6 Felt-not-heard        NUDGE on oak desk, 10 subjects,         ≥ 8/10 feel it,
                           palm on desk 40cm away                  ≤ 2/10 hear it
  T7 Unbound lock          unpaired cube, all signals injected     0 actuations
  T8 Drop                  1m onto hardwood, 6 faces               functional after

  Bench order: T3 → T1 → T2 → T4/T5 → T6 → T7 → T8. Latch first,
  because ECR-001 lives or dies on it.

--------------------------------------------------------------------------------
08 // LEVITATION RESEARCH TRACK — NARROWED (v.3)
--------------------------------------------------------------------------------

  Cycle 01 opened two directions. Cycle 02 checks them against the
  object's size and mass:

  (a) ACOUSTIC STANDING-WAVE LEVITATION — DEPRIORITIZED
      Practical ultrasonic levitators trap objects smaller than about
      half a wavelength (~4mm at 40 kHz) and of low mass. A 45mm, ~110g
      cube is an order of magnitude outside that envelope. Not a path to
      a visibly floating CUBIQ™.

  (a') NEAR-FIELD SQUEEZE-FILM LEVITATION — PROMOTED, AS "v.2.5 GLIDE"
      A flat plate vibrated ultrasonically creates a thin pressurized
      air film that can float a flat object tens to a couple hundred
      microns above it. That is not levitation anyone will see. It is
      near-frictionless contact — and it is exactly what v.2 horizontal
      swings need: a cube that glides across the plinth instead of
      fighting friction per surface type. The driver is piezoelectric,
      which is the Institute's own named material line (QI46 L110).
      Constraint: works over the plinth only, not over bare wood.

  (b) ACTIVE ELECTROMAGNETIC LEVITATION — RECOMMENDED v.3 PATH
      Static passive magnetic levitation of a magnet is ruled out by
      Earnshaw's theorem, and diamagnetic levitation is gram-scale.
      ACTIVE levitation — an electromagnet array in the plinth with
      Hall-sensor feedback holding a permanent magnet in the object at
      a 10-20mm gap — is a mature consumer technique for objects in the
      100-500g range. CUBIQ™ is in that range.
      Design tension recorded: the levitation magnet adds ~20-30g,
      against v.1's <90g long-jump target. Resolution options for v.3:
      a separate "levitation shell" variant, or the reaction mass
      itself made of NdFeB (it is already 30g of dead weight).

  THE PLINTH
    Every path above lands on the same conclusion Cycle 01 reached for
    charging: the table is a LOT® object. Cycle 02 names it the PLINTH —
    Qi charging (v.0), edge-defined safe zone (v.0), squeeze-film glide
    surface (v.2.5), electromagnet levitation array (v.3). One base,
    four generations. v.0 plinth tooling must leave volume under the
    surface for the v.3 coil array (target ≥ 12mm free depth).

--------------------------------------------------------------------------------
09 // CONSUMER USE CASE 02 — THE QUIET HOUSE                    2026-11-24
--------------------------------------------------------------------------------

  (Also appended to LOT-CUBIQ-QUANTUM-CUBE-v0.md §07, per that
   section's rule. Use Case 01 "The Desk Migration" is unchanged.)

  Operator profile: Usership tier, parent of an infant, works late at
  the kitchen table after the child is asleep in the next room. LOT®
  is in night mode. The phone is face-down on silent — but a phone on
  silent still buzzes against a wooden table loud enough to carry
  through a door, so in practice it lives in a drawer.

  The evening self-care routine is ready in the Index of Systems: the
  system has seen three nights of short sleep and wants to close the
  day before midnight, not after. Under the software-only cubic, that
  prompt waits behind a closed laptop and a phone in a drawer, and the
  operator works until one in the morning.

  With CUBIQ v.0 on its plinth, the cube is in NIGHT mode, which it
  inherits from the operator's LOT® theme state. In NIGHT mode the
  spring-latch is locked out entirely (ECR-001). Only the voice coil
  moves. The cube performs THE SETTLE: two seconds of standing pressure
  that the operator feels as a faint change in the table under their
  forearm, below 25 dBA at a meter (T5), quieter than the refrigerator.
  Nothing lights up. No sound crosses the doorway.

  The operator doesn't respond. Twenty minutes later, rate-limited and
  still unacknowledged, the cube sends one NUDGE, and then nothing else
  for the rest of the night. It does not escalate to a HOP. In a house
  with a sleeping child, escalating is the wrong thing to do.

  The operator closes the laptop at 23:40. The telemetry packet
  records ack_s = 1,410 for SETTLE in NIGHT mode. Over the following
  week QI·46 learns that this operator answers the second, softer
  signal, and starts the evening routine 25 minutes earlier, with a
  single NUDGE and no SETTLE.

  WHAT THIS USE CASE ADDS TO THE SPEC
    - NIGHT mode as a hardware state, slaved to the LOT® theme state.
    - Acoustic gate T5 (≤ 25 dBA) and the felt-not-heard trial T6.
    - No escalation in NIGHT mode: the cube may get softer as a signal
      ages, never louder.
    - A design reason for the hybrid actuator: the jump drive can be
      mechanically locked out while the haptic drive stays live.

--------------------------------------------------------------------------------
10 // CYCLE 02 DECISIONS, OPEN QUESTIONS, NEXT CYCLE
--------------------------------------------------------------------------------

  DECISIONS RECORDED (PROPOSED, PENDING S-2)
    D-02.1  ECR-001 hybrid actuator (voice coil + spring-latch).
    D-02.2  Second ToF channel (rear-down). Two-channel edge gate.
    D-02.3  NIGHT mode lockout of spring-latch, slaved to LOT® theme.
    D-02.4  Gesture rate limit ≤1 jump / 90 s, ≤12 / h, coalesce to
            SETTLE.
    D-02.5  UNBOUND state: no verified LOT profile, no motion.
    D-02.6  Levitation path = active electromagnetic (v.3); squeeze-film
            glide inserted as v.2.5. Acoustic standing-wave dropped.
    D-02.7  Plinth reserves ≥12mm under-surface depth for v.3 coils.

  OPEN QUESTIONS
    Q-02.1  SMA-wire vs micro-solenoid latch: SMA is silent and light
            but slow to reset (~1 s cool-down). Acceptable given the 90 s
            rate limit? Bench T3 decides.
    Q-02.2  Nano-ceramic shell under 1m drop (T8): ceramics chip. Is
            the shell ceramic-coated polymer rather than bulk ceramic?
    Q-02.3  Off-plinth behavior: does the cube refuse to jump anywhere
            but the plinth (simplest, safest), or does it map arbitrary
            desks with ToF? Recommendation: plinth-only for v.0.
    Q-02.4  Where the signal→gesture mapping lives: on the cube
            (offline-safe) or on the server (QI·46 can retune it). Draft:
            server owns the map, cube caches it and enforces the hard
            caps locally.

  CYCLE 03 TARGETS
    - Rigid-body simulation of HOP/LEAP/LONG JUMP including foot
      compliance and restitution; confirm or revise §03 threshold.
    - Spring and latch part selection with real datasheet numbers;
      replace §04 estimates.
    - Plinth v.0 mechanical draft (Qi coil, edge geometry, v.3 depth).
    - Server-side signal contract: which Index of Systems events emit
      which gesture classes, and how coalescing is decided.
    - Consumer Use Case 03 (append to the spec §07).

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
PREPARED FOR LOT® INSTITUTE — institute.lot-systems.com
END LOT-CUBIQ-v0-DEV-REPORT-02
================================================================================
