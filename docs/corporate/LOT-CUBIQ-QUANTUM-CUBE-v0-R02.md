================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-R02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report, Cycle 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-01
VERSION:  0.2 — ENGINEERING BUDGET + USE CASE 02
STATUS:   v.0 — PRE-HARDWARE. DESIGN LOCK STILL PENDING (see Section 08)
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing, in this order:

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md   (my own, cycle 01, 2026-07-28)
    Baseline. Defines v.0 = controlled hop, v.1 = long jump (>150mm),
    v.2 = table-walking, v.3 = levitation research. Section 07 is the
    append-only consumer use case log. Use Case 01 (THE DESK MIGRATION)
    is on record and is not edited here.
  docs/corporate/LOT-CUBIQ-VISION.md
  docs/corporate/LOT-CUBIQ-OPERATOR.md
  docs/corporate/LOT_QI46_ENGINE.md             (haptic / piezoelectric lines)
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md   (hardware feedback, Month 12+)
  docs/corporate/LOT-AMBIENT-AI-VISION.md
    New to this cycle. Sets the register for every cube behavior:
    "one line, no alarm, exact moment"; "it waits. When it speaks, the
    moment was earned." Also names QIoT™ and the LOT® Station / Brush
    as the existing hardware signal sources the cube should coexist with.
  docs/corporate/LOT_ROBOTICS_COSMO.md
    Confirms COSMO® robotics is the separate, later track. CUBIQ™ stays a
    notification body, not a robot.
  docs/benchmark/LOT-LEXICON.md, LOT-MANIFEST.md
    Vocabulary (EVE, MCL, OPERATOR, COCKPIT-RULE) and the COSMO® Cube
    naming boundary.

Repo state check: git history shows no hardware artifacts after the
cycle 01 spec. No prototype, BOM, CAD or test data exists in this
repository. Everything below is engineering analysis and planning, not
test results.

--------------------------------------------------------------------------------
01 // EXECUTIVE SUMMARY
--------------------------------------------------------------------------------

  1. Cycle 01 gave the cube a vocabulary and a roadmap. It gave no numbers.
     This cycle adds the first physics budget.
  2. Finding A — the 40mm "LEAP" is bias-angle-limited. At the specified
     5-15° off-vertical bias, a 120g cube needs between 37mm and 114mm of
     vertical rise to travel 40mm. Only the 15° end is plausible for a
     desk object. Bias must be 12-15°, or the LEAP target must be relaxed.
  3. Finding B — direct voice-coil drive is marginal for the LEAP. About
     47 mJ must reach the center of mass in a ~5mm stroke. Recommend
     cock-and-release (spring + latch) with the voice coil as cocking
     and modulation actuator. This revises Section 03 of the cycle 01
     spec as a proposal; it is not applied there.
  4. Finding C — acoustic levitation (v.3a) cannot lift a 45mm, ~100g
     cube. Active magnetic levitation (v.3b) is the only credible
     direction. Acoustic is demoted to a possible sub-component
     (surface-contact-free sensing or damping), not a lift mechanism.
  5. Use Case 02 (THE EVENING PARK) added. It adds a quiet-hours
     requirement and a "return to pad" behavior to the roadmap.

--------------------------------------------------------------------------------
02 // V.0 PHYSICS BUDGET
--------------------------------------------------------------------------------

Assumptions: mass 120g, g = 9.81 m/s², flat rigid surface, ballistic
flight, no air drag. Calculated, not measured.

  02.1 THE HOP (<10mm rise, lands in place)

    v_launch = sqrt(2 g h) = 0.443 m/s at h = 10mm
    KE at launch ≈ 11.8 mJ     Airtime ≈ 90 ms
    Required impulse ≈ 0.053 N·s

    11.8 mJ is within reach of a small voice coil in a 3-5mm stroke
    (needs roughly 3-4 N average force). THE HOP is realistic on the
    cycle 01 architecture.

  02.2 THE LEAP (~40mm displacement)

    Range R = 2 vy² tan(θ) / g, where θ is the bias off vertical.
    Solving for R = 40mm:

      BIAS θ    VERTICAL RISE    LAUNCH ENERGY    VERDICT
      ───────   ──────────────   ──────────────   ─────────────────────
       5°         114 mm           136 mJ          Unsuitable. Cube leaves
                                                    the desk visually.
      10°          57 mm            69 mJ          Marginal.
      15°          37 mm            47 mJ          Plausible. Upper limit
                                                    of the cycle 01 range.

    Consequence: the piezo bias strip alone (cycle 01, "5-15°") will not
    reliably deliver 15°. The bias must come from geometry: a canted
    actuator axis or a canted base contact plane. Piezo remains useful
    as fine timing trim, not as the primary steering element.

    Consequence for noise and optics: a 37mm rise is not "presence
    without spectacle." It conflicts with the anti-feed register unless
    LEAP is reserved for rare events, as cycle 01 already specifies
    (rare-and-above badges, session start). Keep it rare.

  02.3 ACTUATOR SIZING

    47 mJ over a 5mm stroke = 9.4 N average force, on top of 1.2 N
    weight. Small voice coils at this size commonly peak well below
    that continuously. So:

    PROPOSED (revision to cycle 01 Section 03):
      - Spring-and-latch launch for LEAP. Voice coil cocks the spring
        over ~200-400 ms (silent, slow), a latch releases in <2 ms.
      - Direct voice-coil drive retained for NUDGE, HOP and SETTLE
        (all under ~12 mJ).
      - LEAP is therefore not instantaneous: ≤400 ms between trigger
        and launch. Acceptable, because no v.0 signal is time-critical.
      - Duty limit: LEAP no more than once per 60 s to protect the
        latch and avoid motor heating.

  02.4 MASS AND BATTERY

    Per-LEAP input energy at assumed 30% end-to-end efficiency ≈ 160 mJ.
    A 150 mAh cell at 3.7V holds ≈ 2 kJ, so the actuator is not the
    battery bottleneck. Radio standby, IMU and ToF sampling are. The
    cell and Qi receiver coil dominate the mass budget; the 120g target
    is tight with a nano-ceramic shell and must be confirmed against a
    real BOM (open item, Section 08).

  02.5 NOISE

    A latch strike and landing impact are audible on a hard desk. Target
    <35 dBA at 300mm for HOP, <45 dBA for LEAP, measured. NUDGE should
    be below the room's noise floor. Elastomer feet and a softer landing
    face are the primary levers. No data exists yet.

--------------------------------------------------------------------------------
03 // EDGE SAFETY AND FAILURE MODES
--------------------------------------------------------------------------------

Cycle 01 made edge detection a hard gate. Added failure modes:

  F1  ToF blind to transparent or black surfaces (glass desk edge).
      Mitigation: pad-relative dead reckoning from the Qi pad edge plus
      IMU, ToF as second vote. Require both to agree to permit LEAP.
  F2  Cube lifted or bumped mid-sequence. IMU free-fall / shock
      detection aborts the cock-and-release cycle (never fire a cocked
      spring unattended: detect tilt >25° or pickup, then safely decock).
  F3  Pets, children. A 120g cube moving on its own near a child's hand
      is low energy, but the cocked spring is the pinch hazard. Latch
      must be fully enclosed. Quiet hours and an operator "freeze"
      (place a hand on top, capacitive) disable all motion.
  F4  Battery swelling or Qi heating beneath a nano-ceramic shell:
      thermal cutoff, standard cell protection.
  F5  Silent failure. A cube that stops moving looks identical to a cube
      that has nothing to say. Needs a heartbeat gesture or a charge-pad
      LED state so the operator can tell dead from quiet.

--------------------------------------------------------------------------------
04 // SIGNAL MAPPING UPDATE
--------------------------------------------------------------------------------

Cycle 01 mapped four gestures to four signals. The Ambient AI™ rule —
"no alarm, exact moment" — implies the cube must also NOT move often.
Proposed policy for the driver:

  - Rate limit: at most 6 gestures per rolling hour, LEAP at most 2.
  - Coalescing: multiple signals within 10 minutes collapse to the
    highest-priority gesture. No stacking.
  - Quiet hours: operator-set, default aligned with EVE (Evening
    Coherence Close) through MCL (Morning Coherence Launch). During quiet
    hours only NUDGE is permitted, and only for operator-defined
    exceptions. Everything else queues for the morning.
  - COCKPIT-RULE applies to telemetry logs: instrument readings only
    (peak accel, flight ms, landing tilt, edge-inhibit flag).
  - Station/Brush signals (CO₂ threshold, brush events) are NOT mapped to
    motion in v.0. Motion is reserved for Index of Systems signals. This
    keeps the cube from becoming a second alarm system.

--------------------------------------------------------------------------------
05 // ROADMAP REVISIONS
--------------------------------------------------------------------------------

  v.0  Unchanged scope. Gate additions: latch-cycle endurance (≥10,000
       cock/release), pickup-abort test (50/50), noise targets measured.
  v.1  Long jump >150mm: from the Section 02 math, a 150mm range at 15°
       bias needs ≈ 140mm rise and ≈ 180 mJ at 120g. At the <90g target
       the energy drops to ≈ 130 mJ. Consequence: the 150mm jump is a
       distinct launcher, not a re-tune of v.0. A larger spring and a
       sturdier latch are needed. Revise expectation upward.
  v.2  Table-walking: slip-limited. At friction μ ≈ 0.4 (assumed, glass)
       horizontal acceleration is capped near 3.9 m/s²; elastomer on
       laminate or wood is higher. A 200mm traverse from 40mm LEAPs is
       ~5 hops, ~5 s at 1 Hz. Surface identification (IMU slip signature
       on the first hop) is needed before any directed swing.
       NEW v.2 behavior from Use Case 02: RETURN-TO-PAD (the cube
       finds and re-centers on its charging pad).
  v.3  Levitation, revised below.

--------------------------------------------------------------------------------
06 // LEVITATION RESEARCH TRACK, REVISED
--------------------------------------------------------------------------------

  (a) Acoustic levitation — DEMOTED.
      Standing-wave levitators trap objects far smaller than the
      acoustic half-wavelength (a few mm at ultrasonic frequencies) and
      far lighter than a cube of this size. A 45mm, ~100g shell is orders
      of magnitude outside that regime. Not a lift path for this object.

  (b) Active magnetic levitation — RETAINED, NOT YET SCOPED.
      Static magnets cannot hold a stable float (Earnshaw's theorem).
      Stable float needs closed-loop control: position sensing (Hall)
      and fast coil current modulation. Hobby-scale systems demonstrate
      floating objects in the hundreds of grams at tens of mm gap,
      usually by attraction from above. A planar table array that floats
      a freely movable cube above it, rather than hanging it, is a
      harder control problem (multi-axis, tilt and yaw stability) and
      this document makes no claim it is solved for a 120g cube.
      Required force ≈ 1.2 N at the float gap. Next research artifact:
      a bench test with one coil, one Hall sensor and a 100g steel
      payload, to measure gap, power draw and heat. This is a one-week
      experiment, not a product commitment.

  (c) NEW: SHORT-AIR "HOVER-ASSIST" — idea only. Partial unloading of
      the cube's weight to reduce friction for v.2 walking. No evidence
      yet this helps. Listed so it is not lost.

  The word "quantum" in the product name is a brand, not a mechanism.
  No document in this series should imply a quantum effect produces
  motion or levitation.

--------------------------------------------------------------------------------
07 // CONSUMER USE CASES (CYCLE 02 ENTRY)
--------------------------------------------------------------------------------

Use Case 01 (THE DESK MIGRATION, 2026-07-28) is recorded in
LOT-CUBIQ-QUANTUM-CUBE-v0.md Section 07. The entry below is mirrored
there as USE CASE 02.

  USE CASE 02 — THE EVENING PARK                            2026-10-01
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, parent of a young child, works at the
  kitchen table during the day, uses the cube pad in a shared family
  space. Evening Coherence Close (EVE) is part of the operator's
  routine. The household includes a toddler and a dog.

  The problem today: the day does not end. Laptop closes, phone stays
  on the counter and keeps lighting up. The operator's closing ritual
  competes with the same screens that caused the open loops.

  With CUBIQ v.0: at the operator's EVE time, the cube performs THE
  SETTLE — two seconds of light standing pressure on the table, a quiet
  signal felt through the surface, no light and no sound. It is the
  hardware equivalent of the EVE log block: the day is closing. If the
  operator ignores it, nothing else happens. No repeat, no escalation.
  The next signal waits until MCL.

  Motion is blocked by design while it is unsafe: the cube detects the
  toddler's hand (capacitive freeze), and the dog's table bump (IMU
  shock). It does not hop; it stays put and logs the inhibit.

  With later tiers (not v.0): at the close of the EVE routine, the cube
  performs RETURN-TO-PAD (v.2), walking the last few centimeters back to
  the center of its charging pad, so it spends the night charging and
  motionless. The kitchen table is clear of electronics except one
  object that has gone to sleep. In the morning, the first MCL signal is
  a NUDGE.

  What this use case teaches the roadmap:
    R1  Quiet hours and rate limits are v.0 requirements, not later
        polish (Section 04).
    R2  Capacitive freeze and shock-abort are v.0 safety gates, because
        the cube lives in shared spaces (Section 03, F2-F3).
    R3  RETURN-TO-PAD enters the v.2 scope.
    R4  The cube must communicate "off duty" vs "broken" (Section 03, F5).

  Acceptance for this use case at v.0: SETTLE fires within ±60 s of EVE
  time; zero motion events during quiet hours except operator-whitelisted
  NUDGE; zero hops within 3 s of a capacitive or shock event.

--------------------------------------------------------------------------------
08 // OPEN ITEMS FOR S-2
--------------------------------------------------------------------------------

  1. Approve or reject the cock-and-release revision (Section 02.3).
     Until decided, the cycle 01 Section 03 text stands unchanged.
  2. Decide whether the 40mm LEAP stays at 15° bias (canted geometry) or
     relaxes to ~20mm at 10° and lower rise.
  3. Real BOM and mass check for 120g. No BOM exists in the repository.
  4. Confirm the single-coil magnetic levitation bench test (Section 06b)
     is worth a week of Institute time.
  5. Confirm the cube may never be given motion triggers from Station/
     Brush signals (Section 04).
  6. Hardware prototype owner and budget are not named anywhere in the
     repository. Design lock cannot be called without them.

--------------------------------------------------------------------------------
09 // NEXT CYCLE (03)
--------------------------------------------------------------------------------

  - Section 07 gets USE CASE 03 (candidate areas not yet used: shared
    household/family cube pairing, travel and hotel desk, workplace team
    cohort ping, accessibility for low-vision operators).
  - Draft the CUBIQ HARDWARE DRIVER signal schema (JSON) against the
    existing Index of Systems events.
  - If approved, a one-page test plan for the 500/500 hop gate.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-R02
================================================================================
