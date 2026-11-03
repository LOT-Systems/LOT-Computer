================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0.2-REPORT
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report, Cycle 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-03
VERSION:  0.2 — PHYSICS AUDIT + ARCHITECTURE ERRATA + TEST PLAN
STATUS:   v.0 — PRE-HARDWARE. DESIGN LOCK STILL PENDING (see §09).
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing (in order):

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md   (cycle 01, 2026-07-28)
    The v.0 spec: 45mm cube, <120g, voice-coil "reaction mass" hop,
    piezo bimorph forward bias, IMU landing recovery, ToF edge gate,
    4-gesture language, roadmap v.0→v.3, Use Case 01 (Desk Migration).
  docs/corporate/LOT-CUBIQ-VISION.md      Anti-feed thesis; "quantum
    entanglements" on public profiles; physical products as the
    "inevitable step".
  docs/corporate/LOT-CUBIQ-OPERATOR.md    Operator model, Index of Systems,
    Phase 4 "Physical Extension (Days 90+)".
  docs/corporate/LOT_QI46_ENGINE.md       Cube as Month-12 input device;
    nano-ceramic / piezoelectric lines.
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md   "Quantum Cube Hardware: PLANNED".
  docs/corporate/LOT-AMBIENT-AI-VISION.md  "Always present, never loud" —
    the design register the cube must obey. Lists LOT® Station and LOT®
    Brush as sibling hardware that already feeds the Index of Systems.
  docs/benchmark/LOT-MANIFEST.md          COSMO® Cube is a separate track.

Repo check: no firmware, CAD, BOM, or simulation for CUBIQ™ exists yet.
Cycle 01 is the only prior hardware work. This cycle does not add CAD; it
audits cycle 01's physics, corrects it, and makes v.0 buildable.

--------------------------------------------------------------------------------
01 // EXECUTIVE SUMMARY
--------------------------------------------------------------------------------

1. Cycle 01's goals hold: single hop primitive first, jump → surface swing
   → levitation as later tiers.
2. Two mechanisms in cycle 01 do NOT work as written and are corrected
   here (§03): (a) a mass driven DOWN into the base cannot launch the cube
   upward; (b) a piezo bimorph cannot supply meaningful lateral momentum.
3. Energy budgets are tiny and battery is a non-issue: a full Leap is
   ~0.2 J against a 100 mAh cell holding ~1,330 J (§04). The hard
   constraints are peak power, stroke length and noise — not capacity.
4. Levitation: acoustic levitation cannot lift a ~100g cube. v.3 should
   pursue active electromagnetic levitation; acoustic is relegated to a
   side-experiment with a ~1g token (§07).
5. v.0 is not closed. §09 lists what must exist before design lock.
6. New this cycle: Use Case 02 — THE ENTANGLED PAIR (§10), also appended
   to Section 07 of the cycle-01 spec.

--------------------------------------------------------------------------------
02 // PHYSICS AUDIT OF THE v.0 GESTURES
--------------------------------------------------------------------------------

Assumptions: assembled mass m = 105 g (budget in §05), g = 9.81 m/s².
Computed with simple ballistics; real values will differ by surface
compliance and friction losses. These are targets, not measurements.

  THE HOP — "<10mm rise, lands in place"
    Needs takeoff speed v = sqrt(2gh) = 0.44 m/s, energy mgh ≈ 10 mJ.

  THE LEAP — "~40mm displacement"
    Ballistic range R = v² sin(2θ)/g, θ = launch angle from horizontal.
    Cycle 01 allows 5–15° off vertical, i.e. θ = 75–85°.

      θ (from horiz.)   takeoff v    apex height   flight time   KE
      ───────────────   ─────────    ───────────   ───────────   ──────
      75°  (15° bias)   0.89 m/s     37 mm         174 ms         41 mJ
      80°  (10° bias)   1.07 m/s     57 mm         215 ms         60 mJ
      85°  ( 5° bias)   1.50 m/s     114 mm        305 ms        119 mJ

    FINDING: a 40mm Leap is a ~40–115mm-high bound, not a flat skip. It is
    ~4–11× higher than the Hop. This is fine for the gesture language
    ("badge rare+" should feel bigger) but it must be designed on purpose:
    the ToF edge gate (§03.3) must account for lateral travel AND for a
    ~0.2–0.3 s flight with a possible bounce on landing (assume 1 bounce,
    ~25% of the first range).
    RECOMMENDATION: lock 10° bias (θ = 80°): moderate height, 40mm range,
    least sensitive to surface friction.

  THE NUDGE / THE SETTLE — no liftoff. Constraint is acoustic, not
    kinematic: target <30 dBA at 300 mm. Haptic tremor band 150–250 Hz
    (Pacinian sensitivity peak) is felt through a desk without much airborne
    sound. Needs measurement.

  LONGER TIERS (for planning only, mass 90g)
    v.1 Long Jump 150mm: at θ=45° needs v = 1.21 m/s, apex 37mm, KE 66 mJ;
    at θ=60° v = 1.30 m/s, apex 65mm, KE 76 mJ. Takeoff KE is about the
    same as v.0's Leap — the v.1 problem is NOT energy, it is launching at
    a low angle: the actuator must push through the cube's centre of mass
    along a tilted axis, with a defined landing orientation. So v.1 is
    mainly a geometry/control problem, which suits the v.0 IMU stack.

--------------------------------------------------------------------------------
03 // ARCHITECTURE ERRATA TO CYCLE 01
--------------------------------------------------------------------------------

03.1 ERRATUM — the "downward reaction mass" does not launch the cube
  Cycle 01 §03: "drives a spring-loaded internal reaction mass downward
  against the base face. Newton's third law does the rest — the shell
  leaps."
  Problem: an internal mass moving down and stopping against the base
  transfers DOWNWARD momentum to the shell. Net external impulse from
  internal forces alone is zero; the cube only leaves the table if the
  table's normal force exceeds weight, which happens while the mass is
  being accelerated UPWARD (pushing the base into the table) and the
  momentum is then handed to the shell when the mass hits the top stop.
  CORRECTION: a HAMMER-LAUNCH architecture:
    1. The reaction mass (30g) sits near the base on a short linear guide.
    2. The actuator accelerates it UPWARD over a stroke s (~12mm).
    3. It strikes a stop in the ceiling of the shell. Momentum is shared
       by the whole body; the cube leaves the table.
    Required hammer speed (mass-only momentum, perfectly inelastic) for the
    10° Leap: u = m·v / m_r = 0.105 × 1.07 / 0.030 ≈ 3.7 m/s.
    Hammer KE ≈ 0.21 J (only ~60 mJ becomes cube KE; the rest is lost in the
    inelastic stop — use a hard, low-loss stop; a more elastic stop cuts
    the required energy by up to ~2×).
    Over s = 12mm: a ≈ 590 m/s² (≈60 g) → F ≈ 17.6 N on the 30g mass, for
    ~6.5 ms.
  Implications:
    - 17.6 N for ~6.5 ms is beyond a small voice coil running continuously.
      Two buildable options, to be A/B tested in the bench rig (§08):
        OPTION A — SPRING + LATCH (preferred). A small motor/cam (or
          SMA wire) winds a spring to ~0.25 J slowly (seconds, silent);
          a micro-solenoid unlatches it. Peak electrical power ≈ tiny;
          Leap amplitude set by how far the spring is wound (analog energy
          control = Nudge/Hop/Leap from one mechanism).
        OPTION B — PULSED COIL. Voice coil/solenoid driven by a supercap
          or small LiPo burst: 0.21 J in ~6.5 ms ≈ 32 W peak electrical
          at 100% efficiency; real peak 60–100 W. Needs a 1–2 cell low-ESR
          pack or 0.5–1 F supercap. Faster to build, louder, hotter.
    - Both options keep one actuator, one moving mass, matching the
      "mechanically boring" principle of cycle 01.

03.2 ERRATUM — piezo forward bias
  Cycle 01 proposed a piezo bimorph firing ms after actuator release to
  bias the leap 5–15° off vertical.
  Problem: piezo bimorph tip motion is sub-millimetre and force is a
  fraction of a newton; the lateral impulse is orders of magnitude below
  the ~0.1 N·s needed (m·v·cos θ ≈ 0.105 × 1.07 × 0.17 ≈ 0.02 kg·m/s).
  CORRECTION: obtain forward bias GEOMETRICALLY. The hammer guide axis is
  tilted 10° from the cube's vertical axis (cube "faces" are chosen so the
  tilted axis passes through the centre of mass). This is zero extra parts,
  zero timing sensitivity. The piezo bimorph is kept ONLY as a candidate
  for the Nudge band (150–250 Hz tremor), where its quietness and small
  stroke are advantages. This preserves the Institute-named piezo
  technology in the roadmap without asking it to do the wrong job.

03.3 EDGE-DETECTION GATE — extended
  Cycle 01: forward ToF, inhibit at 20mm margin. Updated rule:
    - Required clearance = Leap range (40mm) + one bounce (~10mm) + 20mm
      margin = 70mm. Below that, downgrade Leap → Hop → Nudge (in place).
    - A single forward ToF sensor cannot see a table edge BEHIND or beside
      the cube after a post-landing tilt recovery. v.0 minimum: ToF on the
      forward face + IR cliff sensors (as in robot vacuums) on the two
      base-adjacent edges. If the cube does not know where it is facing, it
      does Nudge only.
    - Cube must remember the edge map of its pad. Charging pad (Qi) has
      known dimensions; the pad could carry a passive fiducial ring, so
      edge distance does not depend on free-space ranging.
    - Fail-safe: on any sensor fault, boot-time self-check failure, lift
      detection (IMU sees free-fall without a command) or low battery
      (<20%): gestures limited to Nudge/Settle only.

03.4 LANDING RECOVERY — clarified
  Cube has six faces; 25° tilt tolerance only covers resting on the
  intended base. A cube can land on an edge or a different face. v.0 rule:
  if the IMU says resting face ≠ base face, set state UPRIGHT_NEEDED, do
  not attempt further hops, send a low-priority "I'm down" signal to the
  operator's cubic (software), never an automatic self-righting
  hop. A cube is a symmetric object, so v.0 should in addition fit
  magnets/weight bias that make base-face-down the stable state
  (centre of mass 3–4mm below geometric centre).

--------------------------------------------------------------------------------
04 // ENERGY AND POWER BUDGET
--------------------------------------------------------------------------------

  Cell: 3.7 V LiPo, 100 mAh ≈ 1,332 J.
  Leap (spring, ~0.25 J stored): ≈ 5,300 Leaps per charge from the
  actuator alone. With MCU/IMU/radio idle (~1.5 mA average, BLE low
  duty), standby alone is ~65 h. Reality: standby dominates; plan on
  2–3 days off the pad, indefinitely on the pad.
  Peak power matters, not capacity:
    OPTION A: <1 W, but ~1–2 s winding noise (target <25 dBA).
    OPTION B: 60–100 W for ~7 ms — needs low-ESR cell/supercap and 
    inrush control; causes a measurable voltage dip; must be on its own
    rail so radio/IMU do not brown out.
  Wireless charging through the base is compatible with the hop only if
  the Qi receiver coil stays on the base plate and the contact pad is
  reinforced — repeated 1+ m/s landings on a PCB-grade receiver are a
  reliability risk (see §09 R4).

--------------------------------------------------------------------------------
05 // MASS BUDGET (target 105g, ceiling 120g)
--------------------------------------------------------------------------------

  COMPONENT                              g
  Shell, nano-ceramic composite, 1.2 mm wall, ~2.5 g/cc    ~ 38
  Hammer (reaction) mass, tungsten-alloy slug              30
  Spring + latch/winder (Option A) or coil (Option B)      12
  Guide, stops, structure                                   6
  MCU/BLE PCB, IMU, ToF, cliff IR                           6
  LiPo 100 mAh                                              3
  Qi receiver                                               4
  Elastomer feet, magnets, fasteners                        6
  TOTAL                                                   ~105

  Cube volume: 45 mm → 91 cm³. Density 1.15 g/cc average (cube floats if
  it were water-filled; mechanically fine). If a pure alumina shell was
  used instead (3.9 g/cc), the shell alone is ~63 g and pushes the
  total over 120g — not viable; keep the composite.

--------------------------------------------------------------------------------
06 // SOFTWARE AND SIGNAL ARCHITECTURE (v.0)
--------------------------------------------------------------------------------

  Link:   BLE from the operator's phone/desktop (the LOT® app/web session)
          to the cube. No cloud connection from the cube itself.
  Flow:   Index of Systems signal → server decides gesture → client gets
          { gesture, intensity, expires_at } → cube executes only if
          edge/self-check gates pass and quiet-hours allow.
  Gesture map (unchanged from cycle 01 §04):
          memory question ready → NUDGE; badge common/uncommon → HOP;
          badge rare+ → LEAP; assembly phase advance → SETTLE.
  Operator controls (new, required for v.0 consumer release):
          Quiet hours; a hard "Mute cube" long-press on the top face; a
          "gesture ceiling" setting (Nudge only / up to Hop / up to Leap);
          a rate limit (max 6 gestures/hour, Leap max 3/day) — the
          cube must not become the feed it replaces.
  Telemetry: gesture executed/skipped(+reason), IMU landing result,
          operator reaction time (cube picked up / app opened within N min).
          Reported to the QI·46 calibration loop as "haptic preference".
          Nothing else leaves the device; no microphone, no camera.

--------------------------------------------------------------------------------
07 // LEVITATION RESEARCH TRACK — UPDATED (v.3)
--------------------------------------------------------------------------------

  (a) ACOUSTIC (cycle 01 candidate). Standing-wave levitators of the common
      kind hold objects of the order of milligrams to a few grams (e.g.
      polystyrene beads, ~mm scale). Radiation pressure of ultrasonic
      arrays at safe levels cannot support a 105g cube. VERDICT: not a
      route to a full cube. Keep only as a 1g "token" side-experiment
      (e.g. a small ceramic cube suspended above the pad as a display
      piece), and for ultrasonic haptic effects. Safety note: high-
      intensity ultrasound has hearing/skin exposure limits and is
      disturbing to pets.
  (b) ACTIVE ELECTROMAGNETIC (maglev). Commercial desktop maglev
      levitators hold hundreds of grams at gaps of 15–25 mm using
      hall-sensor feedback and a controlled electromagnet at ~10 W.
      VERDICT: the v.3 candidate. Needs: permanent magnet in the cube
      top, hall/optical position feedback on the pad, 1 kHz control loop.
      Constraints: stable lateral position requires either active 3-axis
      control (electromagnet array) or a diamagnetic/pinning trick; magnets
      interfere with Qi charging; pacemaker/medical-device warnings apply.
      Power for levitation comes from the pad (cube idles up there with
      no battery draw, which actually turns the pad into the cube's
      dock).
  Decision requested of S-2 (not yet made): fund (b) as a bench study
  after v.0 hop closes. No Gate criteria yet for v.3.

--------------------------------------------------------------------------------
08 // TEST PLAN — HOW v.0 GETS CLOSED
--------------------------------------------------------------------------------

  Bench rig (build first, before any enclosure):
    - Hammer/stop test stand with load cell and high-speed camera
      (240 fps phone is enough: 215 ms flight = 51 frames).
    - Drop rig for landing/Qi receiver durability.
    - Table-top surface set: oak, glass, laminate, linoleum, felt desk mat.
  Test ladder:
    T1  Hammer launch curve: energy vs. spring wind / pulse width.
        Output: calibrated rise height for Nudge/Hop/Leap.
    T2  Repeatability: 100 Hops, std dev of rise < 2 mm.
    T3  Leap range: 40 ±10 mm in 18/20 trials per surface; landing on
        base face ≥ 95%.
    T4  Edge gate: 100/100 approach trials (6 directions), zero falls.
        Include: pad rotated, cube rotated 90°, partial occlusion,
        glass table, black matt surface (IR cliff worst case).
    T5  Noise: ≤ 30 dBA @ 300 mm (Nudge), ≤ 45 dBA (Leap).
    T6  Fatigue: 500/500 hop-and-recover cycles, zero failures (cycle 01
        gate) + 5,000-cycle accelerated life.
    T7  Safety: no pinch point on any face; max surface temp < 41°C;
        drop from 750 mm onto hardwood survives; child/pet tilt test.
  Closure: v.0 is "closed" when T1–T7 pass on three consecutive builds.

--------------------------------------------------------------------------------
09 // OPEN ITEMS AND RISKS BEFORE DESIGN LOCK
--------------------------------------------------------------------------------

  R1  Hammer-launch (Option A vs B) not yet bench-tested — the main
      unknown. Owner: hardware lead. Exit: T1 results.
  R2  Nano-ceramic composite shell: no supplier, no spec for impact life.
      Fallback: injection-moulded PA/glass-fibre with ceramic-filled
      coating (looks/feels ceramic; ~10× cheaper).
  R3  Noise of impacts may break the "ambient, never loud" rule. A
      hammer strike is a click; cube is not silent. Mitigation:
      Nudge/Settle carry the daily load; Hop/Leap are rare events
      (rate limits in §06).
  R4  Qi receiver survivability under repeated 1–3 g landings.
  R5  Edge detection on transparent/black/reflective surfaces.
  R6  Regulatory: FCC/CE for BLE + Qi, battery transport (UN38.3), toy/
      child-safety classification (cube moves unattended), consumer
      product liability. Needs counsel and a certified lab before any
      shipment.
  R7  Brand: LOT®† CUBIQ® usage with COSMO® Cube track — keep separate
      (LOT-MANIFEST.md).
  R8  This document is physics-level estimation only. No prototype
      exists. No performance claim here is a measured result. 

  Decisions needed from S-2:
    D1  Approve hammer-launch errata (§03.1–03.2) as the v.0 baseline.
    D2  Choose Option A (spring+latch) vs Option B (pulsed coil) for first
        prototype — recommendation: A, build B as a second rig.
    D3  Approve bench-study funding for v.3 EM levitation (§07).
    D4  Approve operator-controls list in §06 as consumer-release
        requirements.

--------------------------------------------------------------------------------
10 // USE CASE 02 — THE ENTANGLED PAIR                          2026-11-03
--------------------------------------------------------------------------------

  Operator profile: Two Usership-tier operators, a daughter (26, in
  another city) and her mother (58), who have linked profiles as
  "quantum entanglements" (LOT-CUBIQ-VISION.md §03). Each owns one
  CUBIQ™, placed on a kitchen table at one end and a work desk at the
  other. The mother's use of apps is limited; she hates notifications
  that ask for a reply.

  The problem: parental loneliness and the "need to parent themselves"
  (LOT-CUBIQ-VISION.md §04) — people are too polite to interrupt each
  other, and a message app turns every sign of life into a duty to answer.

  With CUBIQ™ hardware v.0: when the daughter completes her morning
  session (the 5–11 minute cubic) and opts to share, the mother's cube
  does a single SETTLE — a soft presence-hold, no motion. It carries
  zero content and demands no response. If the mother does her own session
  later, the daughter's cube performs a NUDGE, felt through the wood of
  her desk. On a rare day — one of them earns a rare badge and chooses to
  share it — the other's cube does a LEAP, a single small bound on the
  table. Both cubes also exchange nothing else: no text, no photo, no
  location.

  Within a few weeks the pair becomes a quiet ritual: "the cube moved,
  she's up." Neither feels watched, because only a session-completed
  event crosses, nothing about what was written. The mother says the
  object feels like "a pet that belongs to both of us." Telemetry shows
  fewer unprompted check-in texts and more voluntary phone calls — the
  result LOT® wants: an anti-feed relationship channel.

  Why this needs the hardware: a screen version of this feature is a
  presence indicator — the exact "online/last seen" pressure the anti-feed
  thesis rejects. A cube moves once and is then still. It cannot be
  scrolled, quantified or left unread.

  Guardrails this use case imposes:
    - Both operators must opt in per direction, revocable at any time.
    - The shared event carries ONLY "session completed / badge tier".
    - Quiet hours are local to the receiving cube; no queued gestures —
      a missed signal is dropped, not replayed.
    - Rate limit applies to the pair as a whole (§06).
    - No gesture is ever sent without the sender having done something.
      The cube is a letter, not a ping.

--------------------------------------------------------------------------------
11 // NEXT-CYCLE PLAN
--------------------------------------------------------------------------------

  Cycle 03 targets (in order, subject to S-2 decisions D1–D4):
    1. Bench-rig drawing set (hammer stand, guide, latch) and a BOM with
       real part numbers and unit costs for a 10-unit prototype run.
    2. Firmware skeleton for the gesture state machine + safety gates
       (can be simulated on desktop and unit-tested).
    3. BLE protocol draft: { gesture, intensity, expires_at } and a
       signed pairing handshake for the Entangled Pair feature.
    4. Use Case 03 (candidate areas: sleep/bedside, workspace-team
       cohort, accessibility for low-vision operators).

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0.2-REPORT
================================================================================
