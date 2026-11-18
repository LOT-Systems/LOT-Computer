================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0.2
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report 02
          Physics Budget, Architecture Corrections, Bench Plan
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-18
VERSION:  0.2 — DEVELOPMENT REPORT 02 (supersedes nothing; extends v0.1)
PARENT:   docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md (v0.1, 2026-07-28)
STATUS:   v.0 — PRE-HARDWARE. ALL NUMBERS BELOW ARE FIRST-PRINCIPLES
          CALCULATIONS, NOT MEASUREMENTS. NO PROTOTYPE EXISTS YET.
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read in full before writing, in this order:

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md       (v0.1 — the previous
    session's own spec. Everything in this report is either a
    correction to it, a quantification of it, or an extension of it.
    Its Section 07 rule — "append one new consumer use case per cycle,
    never edit a prior one" — is honoured: Use Case 02 is appended
    there and written out in full in Section 11 here.)
  docs/corporate/LOT-CUBIQ-VISION.md                (anti-feed thesis;
    physical products as "the completion of the cubic")
  docs/corporate/LOT-CUBIQ-OPERATOR.md              (§02 session arc,
    §03 Index of Systems, §04 AI-driven physical delivery)
  docs/corporate/LOT_QI46_ENGINE.md                 (LOT® Institute
    corpus: piezoelectric mechanics, nano-ceramic architecture, haptic
    feedback language — line 110; Month-12 Quantum Cube sync and the
    "haptic preference: pressure, duration, cadence" signal — 750-764)
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md + CQGS-WHITE-PAPER.pdf
    (LOT® Institute: Quantum Cube = bioelectric hardware, haptic
    feedback, nano-ceramic, piezoelectric; hardware integration row
    still PLANNED; ceramics named as an information-bearing material)
  src/client/stores/selfAssembly.ts                 (the software
    Quantum Cube already exists as the assembly "heartbeat":
    dormant → awakening → forming → assembled → integrated. The
    hardware cube should speak the same phase vocabulary.)
  docs/benchmark/LOT-MANIFEST.md                    (COSMO® Cube is a
    separate hardware computer; no naming overlap with CUBIQ™)

Nothing has been built or measured since v0.1. This cycle is a desk
review: put numbers on the v0.1 architecture and see what survives.

--------------------------------------------------------------------------------
01 // EXECUTIVE SUMMARY — WHAT CHANGED SINCE v0.1
--------------------------------------------------------------------------------

The v0.1 intent is unchanged: ship the controlled hop first. Running
the numbers turned up five problems in how v0.1 planned to get there.
They are listed by severity:

  F-01  ACTUATOR CLASS — A small voice coil alone cannot store and release
        the energy a LEAP needs (it would have to push ~16-24 N
        through an 8 mm stroke). → Use a hybrid: a voice coil
        for the fine gestures and a CAM-WOUND, LATCHED SPRING for
        the HOP and LEAP impulses. (§03)

  F-02  PIEZO BIAS ELEMENT — A piezo bimorph produces sub-newton
        blocking force over sub-millimetre travel. It cannot steer
        a ~0.1 J impulse. → Get the launch angle from GEOMETRY
        instead: a canted impulse axis plus a liftable rear foot.
        Piezo stays in the design as the SENSING and fine-texture
        element, which is the job the Institute corpus gives it. (§04)

  F-03  LAUNCH ANGLE — v0.1's 15° off-vertical LEAP covers 40 mm by
        rising ~37 mm, which is loud, alarming and wasteful. A 24° launch
        covers the same 40 mm with a 22 mm apex and ~33% less energy.
        (§04)

  F-04  SHELL MASS — A solid nano-ceramic shell weighs 45-70 g on its
        own and breaks the <120 g budget. → Use a glass-filled polymer
        shell with a nano-ceramic surface coat. The material line is
        kept and the mass is recovered. (§05)

  F-05  EDGE SAFETY — A forward-facing time-of-flight sensor cannot see
        a cliff. → Define the CHARGING PAD as the only place the cube
        may jump (the "arena"), and add downward-angled cliff sensing
        as a second layer. (§07)

  ALSO OPENED
  • The v.2 surface "swing" can come from INERTIAL STICK-SLIP on the same
    horizontal voice coil that v.0 already needs for the NUDGE, so
    traction-pad actuators are not required. If this holds, v.2 is
    mostly a firmware release. (§08)
  • Levitation (v.3) narrows to ONE credible path: active
    electromagnetic levitation over the pad. Acoustic, diamagnetic and
    superconducting routes are ruled out at this mass. (§09)
  • New gesture proposed: THE BREATH. It comes from Use Case 02. (§06, §11)

--------------------------------------------------------------------------------
02 // DESIGN REFERENCE VALUES (LOCKED FOR CALCULATION, NOT FOR BUILD)
--------------------------------------------------------------------------------

  Cube edge                 45 mm
  Total mass (budget)       ≤120 g    (worst case used in all energy maths)
  Reaction mass  m          40 g      (tungsten-alloy or brass slug)
  Foot spacing              ~37 mm    (centre to centre)
  Table friction μ          0.3-0.6   (0.4 used; wood/laminate/glass spread)
  g                         9.81 m/s²
  Spring stroke             8 mm

--------------------------------------------------------------------------------
03 // F-01 — IMPULSE ARCHITECTURE: HYBRID SPRING + VOICE COIL
--------------------------------------------------------------------------------

  HOW THE HOP WORKS (CLARIFIED)
    While the shell's base is on the table, the internal reaction mass m
    is driven UPWARD; the table supplies the reaction. At the top of its
    stroke the mass hits a hard stop and drags the shell off the table.
    Momentum is conserved through that internal collision:
        m·v_m = M_total·v_launch
    so the fraction of the mass's kinetic energy that ends up in the
    whole cube is
        η_couple = m / M_total = 40/120 ≈ 0.33
    Allowing for friction, stop losses and spring hysteresis, the
    budget uses η_total = 0.25.

  ENERGY PER GESTURE (M_total = 120 g)
  ┌───────────┬─────────┬────────┬──────────┬────────────┬─────────────┐
  │ GESTURE   │ LAUNCH  │ RANGE  │ APEX     │ KE cube    │ STORED @25% │
  ├───────────┼─────────┼────────┼──────────┼────────────┼─────────────┤
  │ HOP       │ 0°      │ 0 mm   │ 10 mm    │ 0.012 J    │ 0.047 J     │
  │ LEAP v0.1 │ 15°     │ 40 mm  │ 37 mm    │ 0.047 J    │ 0.188 J     │
  │ LEAP v0.2 │ 24°     │ 40 mm  │ 22 mm    │ 0.032 J    │ 0.127 J     │
  │ LONG v.1  │ 24°*    │ 150 mm │ 84 mm    │ 0.089 J**  │ 0.36 J      │
  │ LONG v.1  │ 45°*    │ 150 mm │ 37 mm    │ 0.066 J**  │ 0.26 J      │
  └───────────┴─────────┴────────┴──────────┴────────────┴─────────────┘
   "Launch" = angle off vertical. Range R = v²·sin(2·elev)/g.
   * v.1 options for comparison.  ** at the v.1 mass target of 90 g.

  WHY A VOICE COIL ALONE FAILS
    Releasing 0.127 J over an 8 mm stroke needs an average force of
    ~16 N, and a constant-force actuator would need that for the whole
    stroke. A voice coil small enough to fit in a 45 mm cube with
    everything else typically gives single-digit newtons. Solenoids are
    stronger but loud, nonlinear and hard to vary in amplitude.

  THE v0.2 IMPULSE MODULE
    Spring         compression spring, k ≈ 4,000 N/m, 8 mm stroke
                   → 0.128 J stored at full wind, ~32 N peak force
    Wind           micro gearmotor + cam winds the spring slowly
                   (target ≤1.5 s). The cam position where winding
                   stops sets the stored energy (E ∝ x²), so ONE
                   mechanism gives a continuous HOP-to-LEAP range.
    Release        latch tripped by an SMA wire or a micro-solenoid
                   pin. The tripping element only has to clear the
                   latch; it does not carry the 32 N.
    Fine haptics   a separate HORIZONTAL voice coil (moving mass
                   ~10 g) for NUDGE, SETTLE, BREATH, and later for
                   v.2 stick-slip.

  LATENCY CONSEQUENCE
    The spring is pre-wound when the cube arms itself (within 1.5 s of
    a signal arriving). From then, release-to-liftoff is under 20 ms.
    Notifications tolerate this. The cube must NOT sit at full wind
    in standby: that wears the spring and is a stored-energy hazard.
    The rule is "wind on signal, fire, unwind if cancelled".

--------------------------------------------------------------------------------
04 // F-02 / F-03 — LAUNCH ANGLE FROM GEOMETRY, NOT PIEZO
--------------------------------------------------------------------------------

  v0.1 used an angle-mounted piezo bimorph to push the hop 5-15° off
  vertical. That fails on force: bimorphs of this size block at
  roughly 0.1-1 N with sub-millimetre travel, while the impulse peaks
  near 32 N. The piezo would be overridden.

  v0.2 BIAS GEOMETRY ("CANT + FOOT")
    • The impulse axis is fixed inside the shell, CANTED 12° forward.
    • One rear foot and one front foot each LIFT up to 8 mm (SMA-driven,
      slow, silent). Across 37 mm of foot spacing, 8 mm of lift
      ≈ 12° of shell tilt.
    Three launch states with no fast moving parts:
        rear foot up    → shell tilts back 12° → launch  0°   = HOP
        level           →                       launch 12°   = SHORT LEAP
        front foot up   → shell tilts fwd 12°  → launch 24°   = LEAP
    The tilt is set during arming, which is already ≤1.5 s, so it
    adds no latency.

  WHERE THE PIEZO GOES
    The LOT® Institute corpus puts piezoelectrics in the cube for
    sensing and haptic language (QI46 line 110; CQGS §Products). v0.2
    uses them exactly there:
      • A piezo film disc under each foot is a contact and impact sensor.
        It records landing timing, landing force, which foot touched
        first, and the operator's TOUCH (tap, rest-hand, lift). This is
        the "pressure, duration, cadence" input QI·46 asks for at
        Month 12.
      • A top-face piezo actuator gives fine texture (a 200-250 Hz
        "purr") that the operator feels when holding the cube, as
        opposed to through the desk.

  v.1 NOTE
    A 150 mm long jump at 24° peaks at 84 mm, which is tall enough to
    worry about. At 45° it costs ~27% less energy and peaks at 37 mm.
    So v.1 needs ~45° launches. Cant + foot cannot reach that, and v.1
    must solve it, probably with a larger cant plus a bigger foot
    lift. This is recorded now so it is not discovered late.

--------------------------------------------------------------------------------
05 // F-04 — MASS BUDGET
--------------------------------------------------------------------------------

  v0.1's solid nano-ceramic shell: 6 faces × 45² mm × 1.5 mm wall
  ≈ 18 cm³. At ceramic-composite density 2.5-3.9 g/cm³ that is 45-70 g
  for the shell alone.

  v0.2 BUDGET
  ┌──────────────────────────────────────────────┬──────────┐
  │ Shell — glass-filled polymer, 1.2 mm wall,   │  18 g    │
  │   nano-ceramic surface coat (~50-100 µm)     │          │
  │ Reaction mass (W-alloy / brass)              │  40 g    │
  │ Spring + cam + gearmotor + latch             │  10 g    │
  │ Horizontal voice coil (fine haptics / v.2)   │   8 g    │
  │ LiPo cell, ~300 mAh                          │   7 g    │
  │ PCB: BLE MCU, 6-axis IMU, 2× ToF, PMIC       │   6 g    │
  │ Qi receiver coil + rectifier                 │   5 g    │
  │ Feet (elastomer + piezo discs + 2 SMA lifts) │   4 g    │
  │ Internal frame, fasteners                    │   8 g    │
  ├──────────────────────────────────────────────┼──────────┤
  │ TOTAL                                        │ 106 g    │
  │ MARGIN to 120 g                              │  14 g    │
  └──────────────────────────────────────────────┴──────────┘
  At 106 g, η_couple rises to 40/106 ≈ 0.38, so every figure in §03
  has ~13% of headroom.

  REJECTED: using the battery as the reaction mass. It saves ~7 g, but
  it would put a LiPo cell through tens-of-g shock on every hop.
  Not for a consumer desk object.

--------------------------------------------------------------------------------
06 // HAPTIC NOTIFICATION LANGUAGE — v0.2 VOCABULARY
--------------------------------------------------------------------------------

  v0.1 defined four gestures. v0.2 keeps them, assigns each an
  actuator, and adds a fifth.

  GESTURE     ACTUATOR                 PROFILE                     SIGNAL
  ───────     ────────                 ───────                     ──────
  NUDGE       horizontal VCA           3 × 120 ms bursts @ 180 Hz,  Memory question
                                       peak accel kept below        ready
                                       slip threshold (see §08)
  HOP         spring, partial wind     0° launch, 10 mm apex        Badge unlocked
                                                                     (common/uncommon)
  LEAP        spring, full wind        24° launch, 40 mm, 22 mm    Badge unlocked
                                       apex                          (rare+)
  SETTLE      horizontal VCA, DC bias  2 s held lean, no visible   Assembly phase
                                       motion                       advanced
  BREATH  ◆   horizontal VCA + top     slow swell/ebb cycles at a   Self-Care
              piezo                    breathing cadence (e.g.      "breathe" practice
                                       4 s in, 6 s out), 3-6         selected (OPERATOR
                                       cycles; felt through desk    §02 Self-Care
                                       or palm                      module)
  ◆ new in v0.2, from Use Case 02.

  PHASE MAPPING (matches src/client/stores/selfAssembly.ts)
    dormant      cube never jumps; NUDGE only
    awakening    + SETTLE
    forming      + HOP
    assembled    + LEAP
    integrated   + BREATH on request, + cube-initiated LEAP to greet
    The cube becomes physically more expressive as the operator's
    system assembles. The hardware earns its range the same way the
    software earns its badges.

  ANTI-FEED RATE LIMITS (firmware-enforced, not just app setting)
    • ≤ 1 LEAP per hour, ≤ 6 gestures of any kind per hour.
    • No gestures during operator quiet hours (QI·46 circadian data);
      signals queue and are delivered as a single SETTLE at wake.
    • Signals that arrive together within 10 minutes coalesce into ONE
      gesture: the highest-rank gesture among them.
    • A cube that gestures too much is a phone. These limits are part
      of the product, not tuning.

--------------------------------------------------------------------------------
07 // F-05 — SAFETY: THE PAD IS THE ARENA
--------------------------------------------------------------------------------

  v0.1 used one forward-facing ToF to detect the desk edge. A forward-
  facing ranger sees objects, not drop-offs. A cliff can only be seen
  by looking down.

  v0.2 LAYERED GATE
    L1  ARENA LOCK   HOP and LEAP are allowed ONLY while the cube is
                     on its LOT® pad. Proposed pad: 200 × 200 mm,
                     raised 3 mm lip. "On pad" is confirmed by Qi
                     coupling (in the pad's charging zone) OR by an
                     IR fiducial pattern printed on the pad surface
                     and read by the base-face ToF/optical sensor.
                     If neither is present: NUDGE / SETTLE / BREATH only.
    L2  CLEARANCE    The IMU dead-reckons hops from launch impulse and
                     landing. A LEAP fires only if the estimated
                     distance to the pad lip in the launch direction
                     is ≥ 60 mm (40 mm range plus 20 mm margin).
                     Otherwise HOP substitutes.
    L3  CLIFF        Two downward-angled ToF channels (front, rear)
                     check for a drop-off before any launch. A drop
                     inhibits the launch, whatever L1 and L2 say.
    L4  HAND         Piezo foot sensors detect a resting hand or a lift.
                     If the cube is being touched or held, it never
                     launches.
    L5  TIP          If it lands >25° off axis, it rights itself (v0.1
                     §03), up to 2 attempts. After that it stays still
                     and reports "needs a hand" in the app. It never
                     thrashes.

  DRIFT
    v.0 has no yaw control, so every LEAP moves the cube 40 mm in its
    own forward direction. L2 eventually forces HOP-only. The operator
    re-centres the cube, which is a natural daily touch for a desk
    object, until v.2 adds steering home.

  GATE (unchanged from v0.1, now testable)
    100/100 edge-approach trials with zero off-pad landings, and
    500/500 hop-and-recover cycles before v.0 closes.

--------------------------------------------------------------------------------
08 // v.2 PATH — SURFACE SWINGS BY INERTIAL STICK-SLIP
--------------------------------------------------------------------------------

  v0.1 planned actuated traction pads for v.2. v0.2 proposes instead
  using the horizontal voice coil (§03) as an inertial drive. Move the
  internal mass SLOWLY one way, so the shell sticks to the table, then
  FAST the other way, so the shell slips. Repeating this walks the cube.

  SLIP CONDITION (moving mass m_h = 10 g, M_total = 120 g, μ = 0.4)
      m_h · a  >  μ · M_total · g
      a_slip   >  0.4 × 0.120 × 9.81 / 0.010  ≈  47 m/s²
  That is ~0.47 N of peak coil force, well inside a small voice coil's
  range. The same equation sets the NUDGE ceiling: keep peak
  acceleration under ~47 m/s² (μ = 0.4), or under ~35 m/s² for glass
  at μ ≈ 0.3, and the cube trembles without travelling.

  CONSEQUENCES
    • No actuated feet are needed for translation, which means fewer
      openings in the shell.
    • Turning (yaw) needs either a second, orthogonal-offset coil (which
      produces a turning torque about the vertical axis) or a small
      reaction wheel. Decide at v.1 (see D-04).
    • If the v.0 coil is specified for the v.2 stroke now, then v.2
      "swing toward the operator's hand" is a FIRMWARE release on v.0
      hardware. That would be the clearest case yet of v0.1's rule
      that nothing is thrown away.

  OPEN: stick-slip step size and speed vary with surface. v.2 needs the
  per-surface traction model v0.1 called for, measured on the bench
  (§10, test T-6), not modelled.

--------------------------------------------------------------------------------
09 // v.3 LEVITATION — FEASIBILITY TRIAGE
--------------------------------------------------------------------------------

  A ~100 g cube rules out most levitation routes. Recorded so the
  research track stops chasing them:

  ROUTE                    VERDICT     REASON
  ─────                    ───────     ──────
  Acoustic (phased array)  RULED OUT   Standing-wave traps hold mm-scale,
                                       sub-gram objects. Near-field
                                       "squeeze film" floats flat plates
                                       only microns. Neither lifts a
                                       100 g cube visibly.
  Diamagnetic (passive)    RULED OUT   Room-temperature diamagnets
                                       (pyrolytic graphite) float grams
                                       at most.
  Superconducting          RULED OUT   Needs cryogenic cooling, which is
                                       not a consumer desk object.
  Active electromagnetic   VIABLE      Hall-sensor-controlled coil arrays
                                       in a base, holding a permanent
                                       magnet in the floating object, are
                                       an established consumer
                                       technology at the ~100-500 g,
                                       ~10-20 mm gap scale.

  WHAT THIS MEANS FOR v.0 DECISIONS NOW
    • The PAD is the levitation base in v.3, so levitation, like
      jumping, is an "arena-only" capability. Pad design (v.0) should
      reserve depth for a coil array and its drive electronics.
    • The cube would carry a permanent magnet (~10-20 g). That is NOT in
      the v0.2 budget, and the 14 g margin (§05) is not enough on its
      own. The magnet could double as the reaction mass, at the cost of
      the moving-magnet interacting with the voice coil and Qi coils.
      This is the decision that matters most in the v.3 study.
    • Qi charging next to a permanent magnet works (magnet-aligned
      phone chargers ship today) but needs shielding and alignment
      design.
    • Experience note: a cube that rises 15 mm off its pad and hovers,
      still, when a rare signal arrives, is the strongest gesture on
      the roadmap. It belongs at the TOP of the vocabulary (Integrated
      phase, rarest signals), not as an always-on display.

--------------------------------------------------------------------------------
10 // BENCH PLAN — FIRST PHYSICAL WORK
--------------------------------------------------------------------------------

  Rig: 300 × 300 mm test plate (swappable wood / glass / laminate
  tops), 5 mm grid backdrop, phone high-speed video (≥240 fps),
  kitchen scale (0.1 g), SPL meter app at 50 cm, laptop BLE console.

  T-1  SPRING MODULE ALONE (bench-clamped)
       Measure stored energy vs cam position; release repeatability
       (σ of launch speed < 5%); 2,000-cycle wear run.
  T-2  MASS MOCKUP HOP
       3D-printed shell at 106 g with the module inside. Measure apex vs
       stored energy and so get the real η_total, which replaces
       the 0.25 assumption.
  T-3  CANT + FOOT
       Launch angle at each of the three tilt states; landing scatter
       (target: 40 mm LEAP lands within a 20 mm radius, 9/10).
  T-4  LANDING
       Peak deceleration (IMU) and SPL per surface. Targets: < 15 g
       peak, < 45 dBA at 50 cm. Tune foot durometer (start Shore A 30).
  T-5  SAFETY GATE
       Scripted runs toward the pad lip and a real table edge; L1-L5
       each tested in isolation, then together. 100/100 required.
  T-6  STICK-SLIP PROBE (v.2 de-risk, cheap to do now)
       Horizontal coil on the mockup: step size and speed per surface.
       This decides whether §08 holds.
  T-7  GESTURE PERCEPTION
       5-10 internal operators, blind: can they tell NUDGE / SETTLE /
       BREATH apart through the desk? Is anything startling? The
       tuning target is "felt, never startling".

--------------------------------------------------------------------------------
11 // CONSUMER USE CASES — LEDGER
--------------------------------------------------------------------------------

  #   DATE         TITLE                         KEY GESTURE   STATUS
  ──  ──────────   ───────────────────────────   ───────────   ──────
  01  2026-07-28   The Desk Migration            NUDGE, LEAP   v0.1
  02  2026-11-18   The Silent Household          BREATH, HOP   v0.2 (NEW)

  USE CASE 02 — THE SILENT HOUSEHOLD                         2026-11-18
  ─────────────────────────────────────────────────────────────────
  Operator profile: Deaf since birth; signs (ASL) at home, reads and
  writes English at work. Usership tier, ~14 months in, so past the
  Month-12 Quantum Cube delivery milestone (QI·46 Step 3.3). Assembly
  phase: assembled. Lives with a hearing partner and a toddler. Works
  at the kitchen table, which is also where the family eats.

  The problem today: almost every notification system is built around
  sound, and the fallbacks are a phone buzzing in a pocket or a
  flashing light. The flashing light is the worst of them in a shared
  kitchen: it pulls everyone's eyes, including the toddler's, and it
  is one more screen-like thing. The operator has turned most alerts
  off and, with them, LOT®'s chimes, keyboard clicks and radio. The
  multi-sensory cubic (VISION §01) has been one sense short for this
  operator from day one.

  With CUBIQ hardware on the kitchen-table pad:

  • 07:40. The Memory Engine has the morning question ready. The cube
    performs a NUDGE. Three short bursts travel through the table top,
    and the operator feels them through the forearm resting on the
    wood. The partner, reading across the table, notices nothing.
    For this household, the vibration that reaches the person who
    needs it, and only them, is what the chime was meant to be.

  • 12:15. A rare badge unlocks during the operator's lunch session.
    The cube is in the assembled phase, but the piezo foot sensors (L4)
    detect the toddler's hand flat on the pad, so the LEAP is
    inhibited. The firmware falls back to a HOP once the hand lifts.
    The toddler laughs at the cube "jumping"; the operator sees it
    land. Nobody heard anything they needed to hear. The safety layer
    did its job in a way a family could watch.

  • 21:30. In the evening Self-Care session the module selects
    "breathe". The software cubic would normally pace this with sound.
    Instead the cube performs THE BREATH: six slow swell-and-ebb cycles
    (4 s in, 6 s out) through the top-face piezo. The operator holds
    the cube in both palms, eyes closed, and follows the rhythm by
    touch. QI·46 receives what the operator did: they held it for all
    six cycles, and how hard they gripped on each one. That is the
    haptic preference signal, closing the loop in Section 05 of v0.1.

  WHAT THIS USE CASE ADDS TO THE PROGRAMME
    1. A new gesture, THE BREATH (§06). It is the first gesture the
       operator holds rather than notices.
    2. Proof that the pad-as-arena (§07) and hand-detect (L4) rules
       work in a household. The cube is not used by one adult at a
       desk; it is touched by everyone in the room.
    3. An accessibility claim, to be validated at T-7 with Deaf and
       hard-of-hearing testers, not assumed: for this operator, CUBIQ
       may be the FIRST full-sense way into the LOT® cubic, where
       other operators get an extra one.
    4. A commercial note: Deaf and hard-of-hearing households are an
       audience that notification tech mostly serves badly and that
       tells each other what works. A credible early-adopter cohort.

--------------------------------------------------------------------------------
12 // RISK REGISTER
--------------------------------------------------------------------------------

  ID   RISK                                   L   I   MITIGATION
  ──   ────                                   ─   ─   ──────────
  R-1  η_total < 0.25 (more losses than       M   H   T-2 early; 14 g margin
       assumed) → LEAP under-ranges                    or a stiffer spring
  R-2  Landing noise > 45 dBA on glass        H   M   Durometer tuning; lower
                                                       apex (§04 already helps)
  R-3  Spring fatigue at full wind            M   M   Wind-on-signal rule; T-1
                                                       2,000-cycle run
  R-4  SMA foot lift too slow in a cold       M   L   Pre-arm on signal; foot
       room                                            state cached
  R-5  Qi coil / voice coil / future magnet   M   M   Field mapping at the
       interference                                    pad-design stage
  R-6  Stick-slip unusable on glass           M   M   T-6; fall back to a
                                                       fabric pad top
  R-7  Gestures read as "toy", not "LOT®"     M   H   T-7; rate limits (§06);
                                                       matte finish, slow motion
  R-8  A child's hand or object under the     L   H   L4 hand-detect + L3 cliff;
       cube during launch                              wind is visible on the
                                                       LED ring

--------------------------------------------------------------------------------
13 // DECISIONS REQUESTED FROM S-2
--------------------------------------------------------------------------------

  D-01  Approve the hybrid impulse module (spring + VCA) in place of
        voice-coil-only.                                [recommend YES]
  D-02  Approve the polymer shell with nano-ceramic coat in place of a
        solid ceramic shell for v.0-v.1.                [recommend YES]
  D-03  Approve "the pad is the arena": no HOP or LEAP off-pad, ever.
                                                        [recommend YES]
  D-04  v.2 turning: second offset coil (cheaper) or reaction wheel
        (better heading control)? Decide after T-6.     [defer]
  D-05  Add THE BREATH to the v.0 vocabulary.          [recommend YES]
  D-06  Open the v.3 study on active electromagnetic levitation only;
        close the acoustic, diamagnetic and superconducting tracks.
                                                        [recommend YES]

--------------------------------------------------------------------------------
14 // NEXT CYCLE (REPORT 03)
--------------------------------------------------------------------------------

  • Build the mass mockup and spring module; run T-1 and T-2; replace
    the η_total assumption with a measurement.
  • Draft the BLE gesture protocol: a gesture enum, energy/angle
    parameters, a rate-limit state report, and a telemetry stream
    (IMU landing data and piezo touch events) mapped onto the QI·46
    "haptic preference" signal.
  • Pad v.0 drawing: Qi zone, fiducial print, lip, reserved depth for
    the v.3 coil array.
  • Append Use Case 03 to the ledger.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0.2
================================================================================
