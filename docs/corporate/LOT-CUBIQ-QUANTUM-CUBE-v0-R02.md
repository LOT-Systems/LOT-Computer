================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-R02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report, Cycle 02
          Hop Physics · Actuator Revision · Power · Firmware · Test Plan
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-26
VERSION:  0.2 — ENGINEERING BASELINE (PRE-HARDWARE)
PARENT:   docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md (v0.1, 2026-07-28)
STATUS:   v.0 — DESIGN LOCK STILL PENDING · ONE ARCHITECTURE CORRECTION FILED
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG — WHAT THIS CYCLE WAS BUILT ON
--------------------------------------------------------------------------------

Read in full before writing, per the parent document's Section 07 rule
("future sessions read this document first"):

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md   (v0.1 — the parent spec,
                                                 written by the previous
                                                 cycle of this routine)
  docs/corporate/LOT-CUBIQ-VISION.md            (anti-feed thesis; §05
                                                 physical products arc)
  docs/corporate/LOT-CUBIQ-OPERATOR.md          (operator model; §04 AI
                                                 physical delivery; Phase 4)
  docs/corporate/LOT_QI46_ENGINE.md             (Step 3.3 Quantum Cube sync:
                                                 haptic preference / usage
                                                 frequency / biofield)
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md   (LOT® Institute white paper,
                                                 institute.lot-systems.com:
                                                 "Bioelectric hardware,
                                                 haptic feedback,
                                                 nano-ceramic, piezoelectric";
                                                 $399/mo priority tier with
                                                 Quantum Cube sync)
  docs/wiki/LOT-WIKI-v87.md                     (current system state: badge
                                                 rarity scale COMMON→COSMIC,
                                                 P143 circadian-signal-lock,
                                                 J46 daily circadian check)

Status of the parent spec after review: the form factor (§02), gesture
language (§04), QI·46 loop (§05) and roadmap (§06) stand. One mechanical
statement in §03 does not survive a physics check and is corrected below
(§02 of this report). The levitation research track (§06 v.3) is narrowed
from two candidates to one (§08 of this report).

Since v0.1 the LOT® system has moved: the badge codex grew from 7 to 8
rarity tiers (now COMMON → COSMIC, 843 badges as of Codex v33), and QIE
gained a circadian-signal-lock pattern (P143). Both change the gesture
mapping (§05 of this report).

--------------------------------------------------------------------------------
01 // CYCLE 02 SUMMARY
--------------------------------------------------------------------------------

  DONE THIS CYCLE
    [x] Hop physics worked from first principles for all four v.0 gestures
    [x] Actuator architecture corrected (impact-hop, not base-push)
    [x] Actuator force, stroke, and energy budget sized
    [x] Power architecture: LiPo + supercapacitor pulse buffer
    [x] v.0 bill of materials, first pass, with mass budget (<120 g held)
    [x] Firmware state machine and safety interlocks specified
    [x] Host↔cube protocol (BLE GATT) drafted
    [x] Gesture map updated for 8-tier rarity scale + circadian quiet hours
    [x] v.0 test plan expanded from one gate to six
    [x] Horizontal-motion research: three candidate mechanisms ranked
    [x] Levitation track narrowed to active electromagnetic suspension
    [x] Consumer Use Case 02 filed (here, and appended to parent §07)

  NOT DONE — CARRIED TO CYCLE 03
    [ ] Physical bench rig (no hardware exists yet — all figures below are
        calculated, not measured; every number is a target, not a result)
    [ ] Voice-coil vendor shortlist with datasheet-verified force constants
    [ ] Shell material trial: nano-ceramic composite vs. ceramic-filled
        polymer at 1.2 mm wall (impact survival at 50 mm drop)
    [ ] Driver code in this repository (server-side signal → gesture
        dispatcher; see §07 for the proposed seam)

--------------------------------------------------------------------------------
02 // ARCHITECTURE CORRECTION — HOW THE CUBE ACTUALLY LEAVES THE TABLE
--------------------------------------------------------------------------------

  PARENT SPEC SAID (v0.1 §03)
    "drives a spring-loaded internal reaction mass downward against the
    base face. Newton's third law does the rest — the shell leaps."

  WHY THAT DOES NOT WORK
    A mass inside a closed shell striking the shell's own floor is an
    internal force. The table pushes back on the base, the shell is
    pressed harder into the table, and the centre of mass never gains
    upward momentum. Nothing leaves the surface.

  CORRECTED MECHANISM — IMPACT HOP (v0.2 baseline)
    The reaction mass is driven UPWARD along the vertical axis and
    arrested hard against a top stop. Sequence:
      1. Actuator accelerates reaction mass m_r upward over stroke s.
         During this phase the shell is pressed into the table; the
         table supplies the upward impulse m_r · v_r to the system.
      2. Mass strikes the top stop (near-inelastic, damped by a thin
         polyurethane pad). Momentum is shared with the whole body.
      3. Whole cube lifts off at V = (m_r / M) · v_r.
      4. Return spring re-centres the mass during flight; IMU detects
         landing; recovery logic runs (parent §03, unchanged).
    This is the same family of mechanism used in published
    internal-impact hopping and self-righting cube robots; it needs no
    external moving parts, keeps the shell sealed, and preserves the
    parent spec's "one actuator, one moving mass" principle.

  ALTERNATIVE CONSIDERED — PLUNGER FOOT
    A piston that punches through the base face against the table. More
    efficient (no inelastic loss), but: breaks the sealed shell, makes
    noise against glass, marks soft wood, and couples jump height to
    surface hardness. Rejected for v.0. Held as a v.1 option if the
    long jump cannot be reached by impact hop alone.

  BIAS ELEMENT — RETAINED, RE-POSITIONED
    The piezoelectric bimorph (Institute-named component class) is kept,
    but it no longer "fires after release." It now tilts the reaction
    mass guide rail by 5–15° before launch, so the impulse vector itself
    is off-vertical. One piezo, quasi-static, low power. Bias direction
    is fixed in v.0 (one forward face); steerable bias is v.2.

--------------------------------------------------------------------------------
03 // HOP PHYSICS — SIZING THE FOUR GESTURES
--------------------------------------------------------------------------------

  ASSUMPTIONS
    M   total mass                 0.120 kg   (parent §02 target)
    m_r reaction mass              0.040 kg   (one third of M)
    s   actuator stroke            8 mm
    g                              9.81 m/s²
    Losses ignored except the impact-hop momentum transfer (m_r/M).

  TAKE-OFF REQUIREMENTS

    GESTURE    TARGET               LIFT-OFF V   MASS V_r   PEAK ACCEL   PEAK FORCE
    ───────    ──────               ──────────   ────────   ──────────   ──────────
    NUDGE      no lift-off          < 0.10 m/s   < 0.30     sub-1 g      < 0.5 N
    HOP        apex 10 mm           0.44 m/s     1.33 m/s   11 g         4.4 N
    LEAP       40 mm range @ 75°    0.89 m/s     2.66 m/s   45 g         17.7 N
    SETTLE     static 2 s hold      —            —          —            ~1 N held

  WORKING FOR THE LEAP
    Range R = V² · sin(2α) / g with α = 75° elevation (15° bias):
      0.040 = V² · 0.5 / 9.81           →  V  = 0.886 m/s
    Apex  h = V² · sin²α / (2g)        →  h  ≈ 37 mm
    Flight t = 2 · V · sinα / g        →  t  ≈ 0.17 s
    Momentum: v_r = V · M / m_r        →  v_r = 2.66 m/s
    Accel over 8 mm: a = v_r² / (2s)   →  a  = 442 m/s² (≈ 45 g)
    Force: F = m_r · a                 →  F  = 17.7 N peak

  ENERGY PER GESTURE (mechanical, at the reaction mass)
    HOP    ½ · 0.040 · 1.33²  = 0.035 J
    LEAP   ½ · 0.040 · 2.66²  = 0.141 J
    Only m_r / M = 33% of that becomes body kinetic energy. The rest is
    heat and sound in the top-stop pad — which is why the pad material
    is an acoustic decision as much as a mechanical one (§06, G4).

  WHAT THE NUMBERS SAY
    - The HOP is easy. Any 45 mm voice-coil actuator can do it.
    - The LEAP is the v.0 stress case: ~18 N peak in a 45 mm cube is at
      the top of what small voice-coil actuators deliver. If the vendor
      shortlist (cycle 03) cannot reach it, fall back order is:
        (1) raise m_r to 0.050 kg (lowers needed v_r to 2.13 m/s,
            force to 14.2 N at the same stroke), or
        (2) lengthen stroke to 10 mm (force 14.2 N at m_r = 0.040), or
        (3) cut the LEAP range target from 40 mm to 25 mm for v.0 and
            move 40 mm into v.1.
      Option (3) is the honest default. The parent spec's principle
      holds: ship the smallest true thing.
    - The long jump (v.1, >150 mm) needs V ≈ 1.7 m/s at the same angle —
      ~3.8× the LEAP energy. That is not reachable by the v.0 actuator.
      v.1 will need either the plunger foot, a stored-spring latch, or a
      much lighter shell. This is recorded now so nobody expects v.0
      hardware to "just be tuned" into a long jumper.

--------------------------------------------------------------------------------
04 // POWER ARCHITECTURE
--------------------------------------------------------------------------------

  THE PROBLEM
    Peak actuator current for the LEAP is several amperes for ~10 ms.
    A 45 mm cube's LiPo (300–400 mAh class) cannot safely source that
    directly, and voltage sag would brown out the radio and IMU at the
    exact moment they are needed to watch the landing.

  THE ARCHITECTURE
    Qi-class pad ──▶ charge IC ──▶ LiPo 1S (~350 mAh, ~4.7 kJ)
                                    │
                                    ├──▶ 3.3 V LDO ──▶ MCU · BLE · IMU · ToF
                                    │                  (never shares the
                                    │                   actuator rail)
                                    └──▶ boost ──▶ supercap 0.47 F / 5.5 V
                                                   (~7 J stored)
                                                        │
                                                        ▼
                                                 H-bridge ──▶ voice coil

    The supercap trickle-charges from the battery between gestures and
    dumps into the coil on command. ~7 J stored vs. ~1 J electrical per
    LEAP (assuming ~15% coil-to-mass efficiency) gives margin for a
    LEAP plus a corrective self-righting pulse without recharge.

  BUDGET (calculated, not measured)
    Electrical per LEAP         ~1 J
    LEAPs per full battery      ~4,000 (actuator only, theoretical)
    Realistic daily use         ≤ 20 gestures + BLE idle
    Off-pad runtime target      ≥ 7 days
    On-pad                      indefinite — the pad is home

  SAFETY
    Supercap bleed resistor; actuator rail hard-disabled when the cube
    is lifted (IMU free-fall/hand-hold detection) and when the lid
    (service) switch is open. No gesture can fire while being held.

--------------------------------------------------------------------------------
05 // GESTURE MAP v0.2 — UPDATED FOR THE CURRENT LOT® SYSTEM
--------------------------------------------------------------------------------

The parent map (v0.1 §04) predates the 8-tier rarity scale and the
circadian-signal-lock pattern. Revised:

  SIGNAL (Index of Systems / QIE)          GESTURE    NOTES
  ───────────────────────────────          ───────    ─────
  Memory question ready                    NUDGE      unchanged
  Badge — COMMON / UNCOMMON                NUDGE      demoted from HOP:
                                                      COMMON is "frequent"
                                                      by definition — a hop
                                                      for each would turn
                                                      the cube into a feed
  Badge — RARE / EPIC                      HOP
  Badge — LEGENDARY / MYTHIC               LEAP
  Badge — COSMIC                           LEAP ×2    the only double gesture
                                                      in v.0; rare enough to
                                                      be an event
  Assembly phase advanced                  SETTLE     unchanged
  Circadian lock (P143) — wind-down        SETTLE     new; see Use Case 02
  Circadian lock — morning first signal    NUDGE      new; see Use Case 02

  RATE LIMITS (new, firmware-enforced, not configurable by the server)
    - Max 1 LEAP per 30 min, max 6 HOPs per hour, NUDGE unlimited but
      coalesced (multiple NUDGEs within 60 s merge into one).
    - QUIET HOURS: operator-local 22:00–07:00 by default, or derived
      from the operator's circadian lock when present. During quiet
      hours only NUDGE and SETTLE may fire. HOP/LEAP signals are queued
      and released as a single NUDGE at the first morning signal.
    Rationale: the anti-feed thesis is a hardware property, not a
    server-side setting someone can turn up later. Scarcity is enforced
    where the motion happens.

--------------------------------------------------------------------------------
06 // v.0 BILL OF MATERIALS — FIRST PASS WITH MASS BUDGET
--------------------------------------------------------------------------------

  SUBSYSTEM               COMPONENT CLASS                         MASS (g)
  ─────────               ───────────────                         ────────
  Shell                   Nano-ceramic composite, 1.2 mm wall,         28
                          5 faces + base plate
  Reaction mass           Tungsten-loaded slug on linear rail          40
  Actuator                Voice-coil (moving-magnet), 8 mm stroke      14
                          (coil + yoke, excluding moving mass)
  Return spring + stop    Steel spring, PU top-stop pad                 2
  Bias element            Piezo bimorph tilt on rail mount              1
  Battery                 1S LiPo ~350 mAh                              7
  Pulse buffer            Supercap 0.47 F / 5.5 V                       4
  Electronics             BLE SoC, 6-axis IMU, ToF edge sensor,         6
                          H-bridge, boost, charge IC, PCB
  Charging                Qi receive coil + ferrite                     4
  Feet                    4 × elastomer                                 2
  Levitation reserve      Empty bay, see §08 — no ferrous parts         0
                          within 12 mm of base centre
                                                                  ────────
  TOTAL                                                               108
  MARGIN TO 120 g TARGET                                               12

  Notes
    - The reaction mass is a third of the cube. Tungsten loading keeps
      it compact so the rail fits beside the battery, not under it.
    - The 12 g margin is the first thing cycle 03 will spend (fasteners,
      adhesive, wiring are not yet counted).

--------------------------------------------------------------------------------
07 // FIRMWARE AND HOST PROTOCOL
--------------------------------------------------------------------------------

  FIRMWARE STATE MACHINE

    BOOT ─▶ PAIRING ─▶ IDLE ◀──────────────────────────────┐
                        │                                    │
                        │ gesture cmd (passes rate limit,    │
                        │ quiet hours, held-check)           │
                        ▼                                    │
                     PRE-FLIGHT  ── edge ToF < 20 mm ──▶ SUBSTITUTE NUDGE
                        │                                    │
                        │ supercap ≥ threshold, level ±5°    │
                        ▼                                    │
                     EXECUTE (coil waveform, ~10 ms)         │
                        ▼                                    │
                     FLIGHT (IMU free-fall window)           │
                        ▼                                    │
                     LANDED ── tilt > 25° ──▶ RIGHTING (≤ 3 tries)
                        │                         │          │
                        ▼                         ▼ fail     │
                     REPORT telemetry        FAULT (LED, stop all
                        └────────────────────  gestures, notify host)

    Hard interlocks (cannot be overridden by host command):
      - Edge gate (parent §03): ToF < 20 mm → never launch
      - Held/lifted: never fire actuator
      - Not level (>5°): never launch, NUDGE only
      - Supercap below threshold: defer, do not drop the signal
      - FAULT latches until the cube is placed back on its pad

  HOST PROTOCOL — BLE GATT (draft)
    Service  LOT-CUBIQ
      gesture   write   { id, type: NUDGE|HOP|LEAP|SETTLE, count, ttl }
      state     notify  { state, battery, supercap, onPad, level }
      telemetry notify  { gestureId, liftoffMs, flightMs, landTiltDeg,
                          rightingTries, edgeSubstituted, heldDuring }
      config    write   { quietStart, quietEnd, tz }   (read-back only
                          for rate limits — those are compiled in)

  REPOSITORY SEAM (proposed, not built)
    The server already emits the signals the cube needs (badge unlocks,
    memory question ready, assembly phase change, circadian lock). The
    smallest correct integration is a single dispatcher that maps those
    log events to gesture commands and hands them to the operator's
    paired client (browser Web Bluetooth or a companion app), which
    relays them over BLE. The server never talks to the cube directly.
    Telemetry flows back the same way and is written as a log event so
    QI·46 Step 3.3 (haptic preference / usage frequency) can read it
    without a new data path. No code was written for this in cycle 02;
    the seam is recorded so cycle 03 can build it against real events.

--------------------------------------------------------------------------------
08 // RESEARCH TRACKS — HORIZONTAL MOTION AND LEVITATION
--------------------------------------------------------------------------------

  v.2 HORIZONTAL SURFACE SWINGS — THREE CANDIDATES, RANKED

    (1) HOP-WALK  — RECOMMENDED FIRST
        Repeated biased LEAPs with yaw correction between hops. Uses
        only v.0 hardware plus steerable bias (piezo on two axes).
        Coarse (25–40 mm steps) but zero new actuators. Lets v.2 start
        on v.0 hardware as soon as the HOP gate passes.

    (2) STICK-SLIP GLIDE — RECOMMENDED SECOND
        Add a small horizontal reaction mass. Drive it with a sawtooth:
        slow stroke (force below static friction — the cube stays put),
        fast return (force above it — the cube slides). Each cycle moves
        the cube a fraction of a millimetre; at 20–50 Hz it glides
        smoothly and silently across the table. Condition to stay put on
        the slow stroke: m_h · a_slow < μ_s · M · g. With elastomer feet
        on wood (μ_s ≈ 0.5) and M = 0.12 kg the friction budget is
        ~0.59 N. This is the most "swing"-like motion and the quietest;
        it is also highly surface-dependent (glass vs. wood vs. cloth).

    (3) REACTION-WHEEL ROLL
        An internal flywheel spun up and braked hard to tip the cube
        onto its next face. Large, dramatic, loud on hard surfaces,
        and costs the most mass. Recorded, not pursued for v.2.

  v.3 LEVITATION — NARROWED TO ONE CANDIDATE

    The parent spec listed acoustic and magnetic levitation as equal
    candidates. They are not:

    (a) ACOUSTIC — DEPRIORITISED. Ultrasonic standing-wave levitation
        lifts objects in the millimetre and milligram-to-gram range. A
        ~110 g cube is far outside what a desk-sized phased array can
        hold, and the sound pressures involved are not compatible with
        a quiet object on someone's desk. Kept only as a curiosity.

    (b) ACTIVE ELECTROMAGNETIC SUSPENSION — THE TRACK. A permanent
        magnet in the cube, held above a pad that carries an
        electromagnet array under closed-loop position control (static
        permanent-magnet arrangements alone cannot be stable — the
        control loop is mandatory). Consumer levitating lamps and
        speakers already float objects of a few hundred grams at
        10–20 mm gaps and pass wireless power across that gap. That fits
        LOT®'s existing architecture exactly: the pad is already the
        power surface and "the table" (parent §02).

    CONSEQUENCES FOR v.0 DESIGN (binding from this cycle)
      - Reserve a central base bay for a future ring magnet (~15–25 g;
        v.0 margin does not yet cover it — v.3 shell must be lighter).
      - No ferrous material within 12 mm of the base centre.
      - Qi receive coil geometry must leave room for a magnet core.
      - Pad PCB layout reserves space for a future coil array.
    The levitating cube is still not scheduled. But v.0 no longer makes
    choices that would forbid it.

--------------------------------------------------------------------------------
09 // v.0 TEST PLAN — SIX GATES (REPLACES PARENT'S SINGLE GATE)
--------------------------------------------------------------------------------

  G1  HOP CYCLE        500/500 HOPs on the pad, land within 15 mm,
                       zero tip-overs that righting cannot recover.
  G2  LEAP RANGE       LEAP lands at target range ±10 mm, 9/10 trials,
                       on wood, glass, laminate.
  G3  EDGE GATE        100/100 approaches to a table edge: zero launches
                       within 20 mm; substitute NUDGE fires instead.
  G4  ACOUSTIC         NUDGE and SETTLE ≤ 30 dBA at 1 m (nightstand
                       grade). HOP ≤ 45 dBA. LEAP ≤ 55 dBA.
  G5  HELD SAFETY      1,000 gesture commands sent while the cube is
                       held in hand: zero actuator firings.
  G6  RATE LIMIT       Server floods 1,000 LEAP commands in 1 hour:
                       cube performs exactly 2; quiet-hours commands
                       produce zero HOP/LEAP.

  v.0 closes when G1–G6 all pass on three consecutive builds.

--------------------------------------------------------------------------------
10 // RISK REGISTER
--------------------------------------------------------------------------------

  RISK                                      LIKELIHOOD  MITIGATION
  ────                                      ──────────  ──────────
  LEAP force not reachable in 45 mm         HIGH        Ship v.0 at 25 mm
                                                        range (§03 option 3)
  Top-stop impact noise exceeds G4          MEDIUM      Pad material trials;
                                                        soft-landing coil
                                                        braking waveform
  Shell cracks on repeated landings         MEDIUM      Drop test in cycle 03;
                                                        ceramic-filled polymer
                                                        fallback
  Surface dependence of landing             MEDIUM      Three-surface gate
                                                        (G2); per-surface
                                                        calibration hop
  Signals arrive while operator away,       LOW         Queue + coalesce; never
  cube "performs to an empty room"                      replay a backlog as
                                                        multiple gestures
  Brand collision with COSMO® Cube          LOW         Already separated in
                                                        parent §00; keep
                                                        "Quantum Cube" naming

--------------------------------------------------------------------------------
11 // CONSUMER USE CASE 02 — THE BEDSIDE CIRCADIAN CLOSE       2026-11-26
--------------------------------------------------------------------------------

  (Also appended to the parent document's §07 register, per its rule.)

  Operator profile: Usership tier, eight months in, a parent of two,
  sleep listed as the weakest line in their Bioethics Index. The CUBIQ
  pad lives on the nightstand, not the desk. The phone used to live
  there.

  For months the system has been learning this operator's evening
  rhythm through mood checks, journal timestamps, and self-care
  entries. QIE now holds a circadian lock (P143): it knows, within
  about fifteen minutes, when this person's day actually ends.

  At 22:40 — not at a clock time the operator set, but at the moment
  their own pattern says the day is closing — the cube performs THE
  SETTLE. No light. No sound above a breath (G4: ≤ 30 dBA). Two
  seconds of standing pressure the operator only notices because their
  hand is resting beside it. It is a signal with exactly one meaning:
  the day is done; the system has what it needs; you can stop.

  The operator puts the phone in the kitchen. They have been doing
  this for three weeks now.

  During the night, a LEGENDARY badge unlocks from the journal entry
  they wrote before bed. Under the v0.1 map this would have been a
  LEAP — a 37 mm jump on a nightstand at 01:00. Under the v0.2 quiet
  hours it is held. Nothing moves.

  At 06:55, with the morning half of the circadian lock, the cube gives
  a single NUDGE — the queued badge, the morning memory question, and
  the day's first signal merged into one tremor (§05 coalescing). The
  operator opens the cubic over coffee and finds the badge there,
  earned while they slept.

  What this use case proves for v.0 engineering:
    - Quiet hours and coalescing are not polish — without them the
      device is unusable in a bedroom, which is where sleep, the
      Bioethics Index's hardest line, is actually won or lost.
    - The acoustic gate (G4) is a product requirement, not a test
      nicety.
    - The cube's most valuable gesture may be the one that tells the
      operator to stop. A notification device whose best moment is
      ending the day is the anti-feed thesis in hardware.
    - Telemetry back to QI·46: the time between the evening SETTLE and
      the last phone-side session is a direct, measurable sleep-hygiene
      signal — the first biofield-adjacent number the cube can give the
      Calibration Loop without any new sensor.

--------------------------------------------------------------------------------
12 // NEXT CYCLE (03) — ORDERS
--------------------------------------------------------------------------------

  1. Voice-coil shortlist with datasheet force constants; confirm or
     cut the 17.7 N LEAP requirement (§03).
  2. Bench rig: 3D-printed 45 mm shell, off-the-shelf VCA, IMU breakout,
     supercap — measure real HOP apex and LEAP range against §03.
  3. Top-stop pad material trial against G4.
  4. Build the server-side signal → gesture dispatcher seam (§07)
     behind a feature flag, emitting commands to a log only.
  5. Read this document and the parent first. File Use Case 03.

--------------------------------------------------------------------------------
13 // BRAND
--------------------------------------------------------------------------------

LOT® Quantum Cube             The object
CUBIQ™                        The experience — software and hardware,
                               one name, one system
LOT®† CUBIQ®                  The combined mark

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-R02
================================================================================
