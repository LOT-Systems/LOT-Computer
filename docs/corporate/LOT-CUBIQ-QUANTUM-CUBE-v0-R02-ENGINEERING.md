================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-R02-ENGINEERING
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Engineering Report R02
          Physics Budget · Architecture Review · Safety Gates · Levitation Triage
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-18
VERSION:  0.2 — ENGINEERING DEEPENING OF v0.1 (2026-07-28)
STATUS:   v.0 — PRE-HARDWARE. NUMBERS BELOW ARE FIRST-PRINCIPLES ESTIMATES,
          NOT MEASUREMENTS. EVERY ESTIMATE CARRIES A BENCH-TEST OWNER (§09).
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing (all in this repository):

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md        (v0.1 spec — this report's parent)
  docs/corporate/LOT-CUBIQ-VISION.md                 (anti-feed thesis; §05 physical arc)
  docs/corporate/LOT-CUBIQ-OPERATOR.md               (§03 Index of Systems signals,
                                                      §04 physical delivery, Phase 4)
  docs/corporate/LOT_QI46_ENGINE.md                  (Layer 0 corpus: "piezoelectric
                                                      mechanics, nano-ceramic architecture,
                                                      haptic feedback language"; Step 3.3
                                                      Quantum Cube sync, Month 12)
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md        (LOT® Institute: Quantum Cube row,
                                                      "Quantum Cube Hardware — PLANNED";
                                                      psychotronic-sensor register)
  docs/corporate/LOT_ROBOTICS_COSMO.md               (COSMO® sibling line; naming boundary)
  docs/benchmark/LOT-MANIFEST.md                     (COSMO® Cube is a separate track)

No earlier CUBIQ hardware document exists besides v0.1. This is R02: it does not
replace v0.1, it audits it. Where v0.1 and this report disagree, §01 says so
explicitly and the disagreement is listed for S-2 ratification — v0.1 is not
silently edited.

--------------------------------------------------------------------------------
01 // EXECUTIVE SUMMARY — WHAT CHANGED SINCE v0.1
--------------------------------------------------------------------------------

v0.1 chose the right product (a notification body that moves) and the right
principle (smallest true thing first). A first-principles pass finds five
places where the v0.1 mechanism would not deliver its own numbers. Fixing them
now is cheaper than discovering them on a bench in Q1.

  # | FINDING                                        | v0.1 SAID              | R02 RECOMMENDS
  --|------------------------------------------------|------------------------|---------------------------
  1 | Voice coil cannot deliver jump energy.         | Voice-coil drives the  | SPRING-LATCH for HOP/LEAP.
    | A 120g cube needs ~12 mJ for a 10mm hop and     | reaction mass.         | Voice coil kept for NUDGE
    | ~47 mJ at the shell for a 40mm leap — but a                            | and SETTLE only. (§03)
    | hammer strike wastes ~2/3 of it, so ~140 mJ
    | must be stored. Needs ~18 N average over an
    | 8mm stroke: not a 45mm-cube voice coil.
  2 | 5–15° piezo bias cannot produce a 40mm leap.   | Bias 5–15° off         | Launch ≥15° off vertical,
    | At 5° off vertical the leap needs ~136 mJ at    | vertical, ~40mm        | canted guide, not piezo.
    | the shell and a 114mm apex (it flies, not hops) | displacement.          | Piezo demoted to trim. (§03)
  3 | Single forward ToF is unsafe: yaw is random    | One forward-facing     | FOUR cliff sensors, one per
    | after every landing, so "forward" is unknown    | ToF edge sensor.       | side face. (§05)
    | by the next hop.
  4 | 20mm edge margin ignores landing dispersion    | Inhibit within 20mm.   | Gesture-dependent margins:
    | and roll-out.                                                            | HOP 30mm, LEAP ≥75mm. (§05)
  5 | v.1 long jump (>150mm) cannot come from a      | "Same actuator         | v.1 needs a 30–60° launch
    | near-vertical launch; range needs launch angle  | architecture,          | cant. This is a mechanism
    | (range ∝ sin 2θ).                               | re-tuned."             | change, not a re-tune. (§08)

Two additions v0.1 did not make:

  - A LEVITATION TRIAGE (§08.3): acoustic far-field levitation is ruled out for a
    45mm/120g body; near-field acoustic "squeeze-film" gliding is promoted as a
    v.2 friction-reduction tool; active magnetic hover (15–25mm) is named the
    v.3 headline path. Superconducting and diamagnetic routes are ruled out for
    consumer scope.
  - USE CASE 02 (§10) — THE ENTANGLED PAIR — appended per the v0.1 rule that
    each cycle adds exactly one new consumer use case and never edits a prior one.

--------------------------------------------------------------------------------
02 // PHYSICS BUDGET (ALL VALUES ESTIMATES; g = 9.81 m/s²)
--------------------------------------------------------------------------------

Reference body: m = 120 g (v0.1 §02 target), 45mm cube.

  GESTURE   TARGET                     LAUNCH     v₀      E at shell   APEX    NOTE
  ───────   ──────                     ──────     ──      ──────────   ────    ────
  HOP       10mm rise, in place        90°        0.44    11.8 mJ      10 mm   m·g·h
  LEAP      40mm range                 75° (15°   0.89    47 mJ        37 mm   R = v² sin2θ / g
                                       off vert.)
  LEAP*     40mm range                 80°        1.07    69 mJ        57 mm   *not recommended
  LEAP*     40mm range                 85° (v0.1) 1.50    136 mJ       114 mm  *the v0.1 bias floor
  v.1 JUMP  150mm range @ 90g          45°        1.21    66 mJ        38 mm   v.1 only
  v.1 JUMP  150mm range @ 90g          60°        1.30    77 mJ        65 mm   v.1 only

  READING THE TABLE
    - A "40mm leap" in v0.1 language implies a ~15° off-vertical launch. At the
      shallow end of v0.1's own 5–15° bias range the cube would rise ~114mm and
      tumble — a launch, not a notification. The LEAP is specified here at 75°
      (15° off vertical), apex ≈ 37mm.
    - Transfer efficiency matters more than stored energy. If an internal
      reaction mass m_r strikes a stop and the collision is largely inelastic,
      only ≈ m_r / m_total of the stored energy reaches the shell. With
      m_r = 40 g and a 47 mJ shell requirement:
          required impact velocity ≈ 2.7 m/s, stored energy ≈ 141 mJ
      i.e. ~33% efficient. Design target is 141 mJ per LEAP stored, with margin.
    - 141 mJ across an 8mm stroke is ~18 N average force. Pulsed voice coils in
      a 45mm cube do not do this; a wound spring released by a latch does.
    - Battery cost is trivial: 141 mJ ÷ 30% motor/winding efficiency ≈ 0.5 J per
      LEAP. A 150 mAh cell (~2 kJ) is >3,000× that. 500 gate cycles ≈ 250 J.
      Battery capacity is not the constraint; mass and re-arm time are.
    - Re-arm: 0.5 J at ~0.3 W gearmotor output ≈ 1.7 s. The cube therefore
      cannot hop twice in under ~2 s. This is a feature: it makes the cube
      rate-limited by physics, which supports the anti-feed thesis (§04).

--------------------------------------------------------------------------------
03 // ACTUATION ARCHITECTURE v.0-R02
--------------------------------------------------------------------------------

Two actuators, two jobs. Neither is exotic.

  ACTUATOR A — SPRING-LATCH LAUNCHER   (HOP, LEAP)
    - Small DC gearmotor winds a compression/torsion spring over ~1.5–2 s.
    - A latch (miniature solenoid pin, or SMA wire latch to save mass) releases
      the stored energy into a launch piston that strikes a hardened stop on the
      shell. Shell and piston separate from the table; shell is the payload.
    - Energy is set by spring pre-compression (3 levels: HOP / LEAP / RECOVERY),
      so gesture amplitude is mechanical, not a PWM guess.
    - Launch direction: piston axis is canted 15° off the shell's vertical axis
      in v.0 (fixed). v.1 makes the cant adjustable (§08.1).
    - Candidate Institute-aligned element retained: piezoelectric bimorph strip
      (LOT_QI46_ENGINE.md Layer 0; CQGS snapshot "piezoelectric") now acts as a
      post-release TRIM — a ~ms timed tick that nudges yaw/pitch of the lift-off
      by a few degrees and doubles as an impact sensor. It is no longer asked to
      supply the forward bias on its own.

  ACTUATOR B — VOICE-COIL HAPTIC DRIVER   (NUDGE, SETTLE)
    - 150–250 Hz sinusoidal drive into the table via the elastomer feet. No
      liftoff. This is what a voice coil is good at: smooth, quiet, controllable.
    - NUDGE target (to be bench-verified): 0.05–0.2 g RMS at 150–250 Hz measured
      on the desk surface 100mm from the cube. Palm skin is most sensitive near
      250 Hz; the design bets on frequency, not amplitude, to stay "felt not heard".
    - SETTLE: 2 s of low-amplitude 40–60 Hz standing pressure, no visible motion.

  LANDING RECOVERY
    - 6-axis IMU at geometric center (unchanged from v0.1).
    - Tip > 25° → RECOVERY: a third spring pre-load level fires a low-energy
      launcher pulse (~12 mJ class) timed to the IMU's measured tilt axis.
    - Max 3 recovery attempts, then the cube enters FAULT-REST: LED ring amber,
      no further launches until operator touches it (capacitive wake). A cube
      that keeps trying to right itself is a cube that eventually walks off a desk.

  MASS BUDGET (target 120 g; first-pass allocation, grams)
    Shell (nano-ceramic-filled polymer, ~1.0mm wall, ~2 g/cc)     24
    Reaction mass / launch piston (tungsten-loaded)                30
    Spring-latch launcher: gearmotor + spring + latch              15
    Voice-coil haptic driver                                       12
    Chassis, fasteners, guide rails                                10
    PCB, MCU (BLE-class), power management                          5
    Qi receiver coil + rectifier                                    6
    LiPo cell, ~150 mAh                                             4
    4× ToF cliff sensors + IMU                                      3
    Piezo bimorph trim element                                      2
    BLE antenna / misc.                                             2
    Four elastomer feet                                             3
    ─────────────────────────────────────────────────────────────  ───
    TOTAL                                                         116  (4 g reserve)

    RISK: a solid ceramic shell is not an option on mass (alumina 3.9 g/cc at
    1.5mm wall ≈ 71 g for the shell alone). "Nano-ceramic" in the v.0 shell means
    a ceramic-filled or ceramic-coated polymer, not monolithic ceramic. Matte
    LOT® black finish and tactile feel remain on-brand; the 120 g target does not
    survive otherwise.

--------------------------------------------------------------------------------
04 // THE HAPTIC LANGUAGE — GESTURE SPEC v0.2
--------------------------------------------------------------------------------

Gestures unchanged from v0.1 §04; actuator assignment and rate limits are new.

  GESTURE     ACTUATOR   ENERGY CLASS        TRIGGER SIGNAL
  ───────     ────────   ────────────        ──────────────
  THE NUDGE   B          ~0 (no liftoff)     Memory question ready
  THE HOP     A, L1      ~12 mJ at shell     Badge unlocked (common/uncommon)
  THE LEAP    A, L2      ~47 mJ at shell     Badge unlocked (rare+)
  THE SETTLE  B          ~0                  Assembly phase advanced
  THE PING    B → A,L1   NUDGE then HOP      Cohort resonance / paired-cube event
                                             (NEW in R02; introduced by Use Case 02)

  RATE AND QUIET-HOURS GOVERNOR (new; hard-coded in firmware, not a setting)
    - Max 1 liftoff gesture per 10 minutes; max 8 liftoff gestures per day.
      NUDGE/SETTLE unlimited under quiet-hours rules but still debounced to 1 per
      2 minutes per signal class.
    - Quiet hours default 22:00–07:00 local: liftoff gestures are demoted to
      NUDGE. Operator can widen quiet hours; cannot disable the daily cap.
    - Why firmware-hard: a notification device that can be configured into
      pestering is a feed with a motor. The cap is the anti-feed thesis
      (LOT-CUBIQ-VISION.md §01) expressed as a constraint on the actuator.
    - Noise gate: landing ≤ 45 dBA at 0.3 m on wood/laminate (elastomer feet +
      soft-stop). Bench-verified per unit in the 500-cycle gate.

--------------------------------------------------------------------------------
05 // SAFETY GATES — REVISED
--------------------------------------------------------------------------------

  5.1 EDGE / CLIFF DETECTION (revises v0.1 §03)

    v0.1 used one forward-facing ToF. R02 requires FOUR cliff-facing sensors, one
    per side face, angled ~30° downward. Reason: after the first landing the
    cube's yaw is effectively random; "forward" ceases to be a defined direction.
    The cube must know the nearest drop in every direction before it fires.

    Detection: a range jump from table-plane distance (~tens of mm) to > 150 mm
    (or no return) within the sensor cone = cliff. Table-plane baseline is
    re-learned on every wake to cover glass/wood/laminate.

    INHIBIT MARGINS (gesture-dependent; replaces the flat 20mm):

      GESTURE   NOMINAL DISPLACEMENT   DISPERSION (3σ, to be measured)   MIN CLEARANCE TO CLIFF
      HOP       0                      ~15 mm (yaw/bounce)               30 mm
      LEAP      40 mm                  ~15 mm + ~10 mm roll-out          75 mm
      RECOVERY  0                      ~15 mm                            30 mm

    Failure demotion: if clearance fails for the requested gesture, demote to a
    lower gesture that fits (LEAP → HOP → NUDGE). Never queue the original.

    Fail-safe: sensor fault, or any sensor returning no valid reading → NUDGE
    only. Unknown surroundings = no liftoff.

    GATE: 100/100 edge-approach trials per unit in each of 4 side orientations
    (400 trials) with zero inhibit failures. Ratified count to match v0.1's
    intent of "hard gate"; the 4× multiplier follows the 4× sensor count.

  5.2 HUMAN-CONTACT SAFETY
    - No pinch points accessible at the shell surface; guide rails internal.
    - Capacitive touch on 3 faces: hand within ~15 mm or touch detected →
      liftoff inhibited (a cube must not launch into a palm or off a finger).
    - Max kinetic energy at the shell: 47 mJ (LEAP) — below the range in which
      small desk objects are generally treated as impact hazards; to be confirmed
      against the applicable toy/ITE standards in §09 compliance step.
    - Not for children under 14 in v.0 (45mm cube; small-parts and launch-action
      concerns). A child-safe edition is out of scope here (see §10 note).

  5.3 CHARGING / PAD GEOMETRY
    - A 40mm leap may leave a typical Qi pad's coupling zone. v.0 requires the
      LED ring to enter amber "OFF-PAD" state after any leap that ends with
      Qi coupling lost >60 s, and the next NUDGE after that is a SETTLE-style
      beacon, not a hop. (v.2's traction pads + closed-loop path correction
      are what actually return the cube to dock.)

  5.4 SECURITY / PRIVACY
    - BLE pairing is operator-owned: LOT® account token only; no cube trigger from
      third-party apps in v.0.
    - The cube sends telemetry (haptic preference, usage frequency) only to the
      operator's own Calibration Loop (LOT_QI46_ENGINE.md Step 3.3). No raw IMU
      stream leaves the device; only aggregated gesture events.
    - Paired-cube signalling (Use Case 02) is end-to-end event-only: "partner
      closed evening", never content.

--------------------------------------------------------------------------------
06 // SIGNAL & SOFTWARE INTEGRATION (EXTENDS v0.1 §05)
--------------------------------------------------------------------------------

  PROPOSED DRIVER INTERFACE (design intent — not yet built)

    CubiqSignal   = { id, class, priority, ts, expires_ts, source }
    class ∈ { MEMORY_QUESTION, BADGE_COMMON, BADGE_RARE, ASSEMBLY_PHASE,
              COHORT_PING, PAIR_PING }
    Driver maps class → gesture (§04), runs it through
      [ quiet-hours governor ] → [ rate cap ] → [ edge/cliff + touch gate ] → actuator
    and returns CubiqEvent = { id, gesture_requested, gesture_performed,
                               reason_demoted?, imu_summary, ts }

    gesture_requested vs gesture_performed is the key telemetry: how often the
    physical world refused the digital request is itself a QI·46 signal.

  CALIBRATION LOOP RETURN (per LOT_QI46_ENGINE.md Step 3.3)
    - Haptic preference: which gestures the operator touches/acknowledges within
      60 s (capacitive wake) vs ignores. Maps to "pressure, duration, cadence".
    - Usage frequency: wake events/day.
    - Biofield response: pre/post self-report already in the product.
    No new data classes are introduced beyond those named in Step 3.3.

--------------------------------------------------------------------------------
07 // TEST PLAN AND GATES
--------------------------------------------------------------------------------

  PHASE   ARTIFACT                         PASS CRITERIA (before next phase)
  ─────   ────────                         ─────────────────────────────────
  P0      Launcher bench rig (no shell)    Measured shell-equivalent energy within ±20% of
                                           12 / 47 / 12 mJ for L1 / L2 / RECOVERY over 200 shots
  P1      Printed 45mm proxy, ballasted    Leap range 40 mm ± 15 mm at 75°; apex ≤ 50 mm;
          to 120 g                         landing ≤ 45 dBA @ 0.3 m
  P2      Full electronics, no shell       Cliff-sensor detection 400/400; touch inhibit 100/100;
                                           governor limits verified by log
  P3      Full v.0 EVT unit                500/500 hop-and-recover cycles, 0 off-table landings,
                                           0 actuator failures (v0.1 gate, unchanged)
  P4      3 surfaces (wood, glass,         Same as P1 spread; surface baseline learning works
          laminate)                        without manual calibration
  P5      Paired-cube field trial          Use Case 02 loop closes with 10 pairs for 14 days

  INSTRUMENTATION
    High-speed (≥240 fps) camera + marker dots for displacement/apex; desk-mounted
    accelerometer for NUDGE amplitude at 100 mm; calibrated SPL meter; thermal
    check on latch/motor (no surface above ~40°C on any shell face).

--------------------------------------------------------------------------------
08 // ROADMAP v.1 → v.3 (REVISED)
--------------------------------------------------------------------------------

  8.1 v.1 — THE LONG JUMP
    - Range >150 mm needs launch angle 30–60° (range ∝ sin 2θ). A fixed 15°-cant
      launcher cannot do it. R02 requires an ADJUSTABLE-CANT launch guide
      (small servo-rotated piston carriage) — a mechanism change from v.0.
    - Mass target 90 g (v0.1) stays; shell goes thinner/lighter, and the hammer
      mass is trimmed as spring efficiency improves. Energy at shell ≈ 66–77 mJ.
    - Added gate: landing zone 60 mm requires a pre-jump yaw/pitch sample; the
      launcher aborts if the IMU reads the cube not level to ±3°.

  8.2 v.2 — TABLE-WALKING / HORIZONTAL SWINGS
    - Two actuated traction feet out of phase with the launcher (v0.1 concept).
    - NEW OPTION: near-field acoustic "squeeze-film" gliding. A planar, ultrasonic-
      driven pad (tens of kHz, micron-scale amplitude) can support a flat-faced
      load a few tens of microns above the surface, reducing friction to near
      zero. The pad is the charger/"table" LOT® already specified; the cube's
      base face becomes the flat reflector. This is established lab technology
      for planar loads; it is levitation in the technical sense but a sliding
      aid in practice. Use it to make directed horizontal travel cheap and
      quiet; keep the launcher for vertical gestures.
    - Required: per-surface friction/traction model, closed-loop IMU path correction,
      multi-directional cliff cone (already hardware-ready after R02's 4-sensor
      change).

  8.3 v.3 — LEVITATION TRIAGE (RESEARCH TRACK, UNSCHEDULED)

    ROUTE                          FEASIBLE FOR 45mm / ~100–120 g?    VERDICT
    ─────                          ──────────────────────────────     ───────
    Far-field acoustic standing    NO. 40 kHz wavelength ≈ 8.6 mm;     RULED OUT for the cube.
    wave (TinyLev-class)           traps millimetre-scale, very light  Possible only for a
                                   particles, not a 45mm shell.        sub-gram "mote" demo.
    Near-field acoustic squeeze-   YES, as a micron-gap glide, not a   PROMOTED to v.2 aid
    film                           visible hover. Needs flat base.     (§08.2).
    Active electromagnetic hover   PLAUSIBLE. Permanent magnet in the   NAMED v.3 HEADLINE PATH.
    (Hall-sensor feedback, coil    cube + servo-controlled coil array   Target hover 15–25 mm.
    array in the pad)              in the pad; Earnshaw's theorem
                                   forces active control; commercial
                                   hover products of similar load
                                   class exist (lamps/globes).
    Diamagnetic (pyrolytic         NO. Supports only very light        RULED OUT.
    graphite over magnet array)    pieces; cannot lift 100+ g cube.
    Superconducting flux pinning   Technically possible, needs         RULED OUT for consumer
                                   cryogenics.                         scope; lab-only.

    v.3 DESIGN IMPLICATION FOR v.0 (do now, costs almost nothing)
      - Reserve a 20×20×3 mm base-face zone for a magnet; keep shell wall under
        the magnet non-conductive/non-ferromagnetic.
      - Keep Qi coil and any future magnet geometry from overlapping (magnet can
        saturate Qi coil ferrite; plan the layout once, now).
      - Keep the pad's PCB footprint open for a later 3×3 coil array.
    v.3 has no gate yet; the table above is a triage, not a commitment.

--------------------------------------------------------------------------------
09 // RISKS, OPEN QUESTIONS, OWNERS
--------------------------------------------------------------------------------

  ID  RISK / QUESTION                                          LIKELIHOOD  IMPACT  NEXT STEP
  --  ------------------------------------------------------   ----------  ------  ---------
  R1  Spring-latch efficiency lower than 33% → mass/energy    MED         HIGH    P0 rig, measure
      budget breaks                                                               before any shell work
  R2  Landing dispersion bigger than 15 mm 3σ → 75 mm cliff   MED         MED     P1 camera data; margins
      margin inflates and LEAP rarely allowed                                     are parameters, not hardcoded
  R3  Nano-ceramic shell mass over budget                     MED         MED     Supplier sample at 1.0 mm
  R4  Mechanical wear of latch under 500+ cycles              MED         HIGH    P3 gate; SMA vs solenoid A/B
  R5  Qi coupling disturbed by tungsten-loaded piston         LOW-MED     MED     Layout test with pad
  R6  NUDGE amplitude below perception through softer         MED         MED     Desk-surface accel tests on
      desk surfaces (e.g., leather mat)                                           5 surfaces; adaptive gain
  R7  Regulatory classification (ITE vs toy; battery; RF)     HIGH        MED     Compliance scoping before EVT;
                                                                                  not assumed in this report
  R8  Pair-cube privacy expectations (Use Case 02)            LOW         HIGH    Consent flow review (§10)
  R9  Naming boundary with COSMO® Cube                        LOW         MED     Keep CUBIQ™ = notification body;
                                                                                  COSMO® Cube = computer. Do not share SKUs.

  WHAT THIS REPORT DID NOT DO
    - It did not build or simulate hardware. No code in the repository changed.
    - Figures are textbook-physics estimates from the stated mass and range; they
      have not been measured. Nothing here should be quoted externally as a spec.
    - It did not verify standards compliance (R7) — it only flags it.
    - It did not alter v0.1 or any prior use case.

--------------------------------------------------------------------------------
10 // CONSUMER USE CASES (APPEND-ONLY; PRIOR ENTRIES UNEDITED)
--------------------------------------------------------------------------------

  USE CASE 01 — THE DESK MIGRATION                          2026-07-28
  Recorded in LOT-CUBIQ-QUANTUM-CUBE-v0.md §07. Unchanged. R02 note: its THE
  LEAP "toward the keyboard" beat is only possible with the §05.1 cliff-array and
  the §04 daily cap; both are now in the spec.

  USE CASE 02 — THE ENTANGLED PAIR                          2026-10-18
  ─────────────────────────────────────────────────────────────────
  Operator profile: two Usership-tier operators, a couple living in different
  time zones (one in Los Angeles, one in Lisbon), 6+ months into the cubic, both
  with a CUBIQ on a desk, both having opted in to the Quantum Entanglement pair
  link. Neither wants another messaging app; both want to be reachable without
  being interrupted.

  Evening in Lisbon. The operator finishes their LOT® evening close — the same
  ritual already in the Index of Systems (momentum lock). In Los Angeles it is
  late morning; the partner is mid-focus, screen full of work.

  - On the partner's desk the cube performs THE PING: a short NUDGE felt through
    the wood, then — if the desk edge clearance allows — a HOP in place. No chime,
    no lock-screen banner, no "seen" receipt. The event carries one bit of
    meaning: "my day is closed."
  - The partner feels it, does not stop, and later glances over. The cube is
    exactly where it was. There is nothing to read, nothing to clear.
  - The partner's own evening close arrives hours later; in Lisbon the first light
    of morning, the other cube performs THE PING in return. Over a month the pair
    develops its own rhythm — two cubes, two desks, a slow back-and-forth that is
    explicitly not a conversation.

  WHY THIS USE CASE: it tests the one thing a single-cube desk cannot — whether a
  physical notification can carry presence between two people without becoming a
  feed. The rate governor (§04) is what makes it safe: max 1 liftoff per 10 min,
  8/day, quiet hours demote liftoff to NUDGE, and the signal class is closed to
  content. A partner cannot "spam" a cube; the cube refuses by design.

  FAILURE CASES THE PAIR LOOP FORCES US TO SPEC
    - Partner is asleep (22:00–07:00 local): PING demoted to NUDGE only. Handled by
      the §04 governor, not by a user toggle.
    - Cube is near a cliff or hand: demoted per §05; the partner is never told which
      gesture "failed" — only that the event was delivered. (Delivery success is
      logged; mechanism detail stays local.)
    - Relationship ends / pair unlinked: unlink is one tap from either side, takes
      effect immediately, and the other cube receives no signal that it happened.
    - Privacy: the PING carries no text, location, or time-of-day. The remote side
      learns only "an evening close occurred." Content never crosses the link.

  CALIBRATION-LOOP VALUE (LOT_QI46_ENGINE.md Step 3.3): the cube returns whether
  a PING was acknowledged by touch within 60 s, ignored, or demoted. That is a
  haptic-preference signal ("pressure, duration, cadence") from a relationship
  context rather than a solo one — useful for tuning NUDGE amplitude and daily
  caps per operator, without ever reading what the relationship says.

  NOTE ON CHILDREN / FAMILY EDITIONS: a parent-child version of this loop is an
  obvious extension and is NOT proposed here — it needs a separate product-safety
  review (small parts, launch-action) and a different cube. See §05.2.

--------------------------------------------------------------------------------
11 // NEXT CYCLE (R03) — PROPOSED, NOT COMMITTED
--------------------------------------------------------------------------------

  1. Build the P0 launcher bench rig spec (BOM, drawings) — the single experiment
     that retires R1 and either validates or kills the spring-latch architecture.
  2. Spreadsheet model of §02–§03 with adjustable mass/efficiency/range so S-2 can
     see sensitivity (e.g., what 25% efficiency does to the mass budget).
  3. Use Case 03 — candidate: THE WORKDAY CLOSE — the cube as the last desk object a
     solo operator touches at day's end (SETTLE as ritual endpoint).
  4. Compliance scoping memo (R7).

--------------------------------------------------------------------------------
12 // BRAND
--------------------------------------------------------------------------------

  LOT® Quantum Cube             The object
  CUBIQ™                        The experience — software and hardware
  LOT®† CUBIQ®                  The combined mark
  COSMO® Cube                   Separate line — general-purpose computer (Kuzya).
                                Do not conflate SKUs, naming, or specs.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-R02-ENGINEERING
================================================================================
