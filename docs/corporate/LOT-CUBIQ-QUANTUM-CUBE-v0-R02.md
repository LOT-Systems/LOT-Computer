================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-R02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report 02
          Actuation Physics, Architecture Correction, Rev-A Build Plan
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-12
VERSION:  0.2 — DEVELOPMENT REPORT (PRE-HARDWARE)
PARENT:   docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md (v0.1, 2026-07-28)
STATUS:   v.0 — DESIGN LOCK STILL PENDING · ONE ARCHITECTURE CORRECTION
          RAISED (SECTION 03) · REV-A BENCH BUILD PLANNED
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG — WHAT THIS REPORT WAS BUILT ON
--------------------------------------------------------------------------------

This is the second development cycle for the physical Quantum Cube. The
first cycle (v0.1) produced the specification. This cycle turns the
specification into numbers, a bill of materials, a firmware state machine,
a test plan, and a list of what is still unknown. Read in full before
writing:

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md       (v0.1 — own prior work)
    The parent spec. Form factor 45mm / <120g, the CONTROLLED HOP, the
    four-gesture language (NUDGE / HOP / LEAP / SETTLE), the QI·46 loop,
    the v.0 → v.3 roadmap, Use Case 01 "The Desk Migration."
    Section 07 rule: one new consumer use case per cycle, append-only.

  docs/corporate/LOT-CUBIQ-VISION.md
    The anti-feed thesis: "LOT® invests attention and returns structure."
    Section 05 — physical products as the completion of the cubic.

  docs/corporate/LOT-CUBIQ-OPERATOR.md
    Section 03 (Index of Systems) — the signal sources the cube expresses.
    Section 04 (AI-Driven Physical Product Delivery) and Section 07
    Phase 4 (Days 90+) — when and why the cube arrives.

  docs/corporate/LOT_QI46_ENGINE.md
    Line 110 — Institute material line: piezoelectric mechanics,
    nano-ceramic architecture, haptic feedback language.
    Lines 750-764 — Month-12 Quantum Cube sync; the cube reports haptic
    preference (pressure, duration, cadence) into the Calibration Loop.

  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md
    Line 32 — Quantum Cube as "bioelectric hardware, haptic feedback,
    nano-ceramic, piezoelectric." Line 180 — "Quantum Cube Hardware |
    Hardware feedback integration (Month 12+) | PLANNED."

  docs/corporate/LOT_ROBOTICS_COSMO.md
    The COSMO® robotics line and its ethical framework. CUBIQ™ is
    not a robot in the COSMO® sense — it carries no behavioral
    fingerprint and takes no autonomous action beyond the gesture it was
    told to perform. It does, however, share COSMO®'s first rule:
    hardware placed in a home with children must be safe by construction.

  src/server/routes/api.ts  (live codebase, read for integration)
    GET  /api/sync          — existing Server-Sent Events stream
    POST /api/sync-badges   — returns newBadges[] on unlock
    GET  /api/memory        — memory question generation
    These are the real hooks a CUBIQ bridge subscribes to (Section 07).
    No new endpoint is required for v.0 bench work.

External prior art consulted (public, non-LOT®, cited for engineering
honesty — CUBIQ™ is not the first cube that moves):
    - ETH Zurich "Cubli" (2012-2013) — a cube that jumps up onto an edge
      and balances using braked reaction wheels.
    - MIT CSAIL "M-Blocks" (2013) and "M-Blocks 2.0" (2019) — modular
      cubes that pivot, roll and jump using an internal flywheel that is
      abruptly braked.
    These matter most for v.2 (surface swings), see Section 09.

--------------------------------------------------------------------------------
01 // CYCLE SUMMARY
--------------------------------------------------------------------------------

  ITEM                                  v0.1 (07-28)    v0.2 (THIS REPORT)
  ────                                  ────────────    ──────────────────
  Form factor / mass target             locked          unchanged
  Gesture language (4 gestures)         locked          unchanged, now
                                                         parameterized
  Hop mechanism                         internal mass    CORRECTED — see 03
                                         "pushed down"
  Hop physics                           qualitative      quantified (02)
  Energy / battery budget               —                quantified (04)
  Bill of materials                     —                candidate BOM (05)
  Edge safety                           1 forward ToF   4 cliff sensors +
                                                         ToF (06)
  Firmware state machine                —                defined (07)
  Server integration                    conceptual       mapped to live
                                                         endpoints (07)
  Test plan / gates                     v.0 gate only   Rev-A bench plan (08)
  Risk register                         —                opened (10)
  Consumer use cases                    01               01 + 02 (11)

--------------------------------------------------------------------------------
02 // HOP PHYSICS — THE NUMBERS BEHIND THE FOUR GESTURES
--------------------------------------------------------------------------------

All figures are first-order estimates (no air drag, rigid bodies, flat
level surface, g = 9.81 m/s²). They exist to size the actuator, not to
promise a performance figure. Rev-A bench data replaces them.

  REFERENCE MASS     M = 0.120 kg (v.0 ceiling)

  THE HOP — <10mm vertical rise, lands in place
    Take-off velocity      v = sqrt(2·g·h) = sqrt(2·9.81·0.010)
                           v ≈ 0.44 m/s
    Kinetic energy         E = ½·M·v² ≈ 0.5·0.12·0.196 ≈ 12 mJ

  THE LEAP — ~40mm displacement, launch 15° off vertical (75° elevation)
    Range equation         R = v²·sin(2θ)/g,  sin(150°) = 0.5
                           v² = 2·g·R = 2·9.81·0.040 ≈ 0.785
                           v ≈ 0.89 m/s
    Apex height            h = v²·sin²(75°)/(2g) ≈ 0.785·0.933/19.62
                           h ≈ 37 mm
    Kinetic energy         E ≈ 0.5·0.12·0.785 ≈ 47 mJ
    Flight time            t = 2·v·sin(75°)/g ≈ 0.175 s

    Reading: a 40mm forward LEAP is a ~37mm-high arc. That is a visible,
    deliberate gesture — consistent with its "rare and above" badge tier.

  v.1 LONG JUMP — >150mm displacement (for sizing headroom only)
    At 45° (best range):   v = sqrt(g·R) = sqrt(9.81·0.150) ≈ 1.21 m/s
                           E ≈ 0.5·0.12·1.47 ≈ 88 mJ  (at 120g)
                           E ≈ 66 mJ                    (at v.1 target 90g)
    At 75° (LOT® arc):     v² = 2·g·R → v ≈ 1.72 m/s, E ≈ 178 mJ (120g)

    Reading: v.1 at the v.0 launch angle needs ~4× the LEAP energy.
    v.1 must therefore either lower the launch angle (flatter, faster —
    less "gesture," more "projectile") or cut mass. The v0.1 mass target
    of <90g for v.1 is confirmed as necessary, not aspirational.

  THE NUDGE — no liftoff
    Peak force must stay below M·g ≈ 1.18 N net upward reaction, or the
    cube unloads its feet. Practical NUDGE envelope: 0.2-0.6 N at
    60-200 Hz for 80-300 ms. This is felt through a wood or laminate
    desk at hand distance; glass transmits less (see Risk R-04).

  THE SETTLE — no visible motion
    A held, sub-liftoff press (0.3-0.5 N) for 2 s. Functionally a slow
    NUDGE envelope with no carrier frequency — a "weight" rather than a
    "buzz."

--------------------------------------------------------------------------------
03 // ARCHITECTURE CORRECTION — HOW THE CUBE ACTUALLY LEAVES THE TABLE
--------------------------------------------------------------------------------

  WHAT v0.1 SAID
    "A single vertical linear actuator drives a spring-loaded internal
    reaction mass DOWNWARD against the base face. Newton's third law does
    the rest — the shell leaps."

  WHY THAT IS WRONG AS WRITTEN
    A mass driven downward onto the base face pushes the base into the
    table; the table pushes back; the net external impulse on the cube is
    zero once the mass stops. The shell does not leave the surface. For a
    closed shell to jump, the momentum has to come from the table, via one
    of two routes:

  OPTION A — INTERNAL STRIKER (UPWARD IMPACT)
    Accelerate an internal mass m UPWARD (the stator reacts by pressing
    the shell into the table — the table supplies the impulse), then let
    the mass strike a top stop. Momentum transfers to the whole cube.

      Cube take-off speed      V = m·u / M
      Energy efficiency        η = m / M   (inelastic transfer)

      For THE LEAP (V = 0.89 m/s), m = 40 g, M = 120 g:
        striker speed           u = V·M/m ≈ 2.7 m/s
        striker energy          ½·m·u² ≈ 142 mJ  (η ≈ 33%)
        over an 8 mm stroke:    a ≈ u²/(2s) ≈ 450 m/s² (~46 g)
                                F ≈ m·a ≈ 18 N peak

      + Fully sealed shell — no moving part exits the cube
      + Matches the v0.1 "reaction mass" intent and the anti-spectacle
        aesthetic (the cube appears to jump by will)
      − 67% of energy lost as impact; audible "tock" at every LEAP
      − 18 N peak in a 45mm envelope is beyond a small voice coil;
        requires a stored-energy spring with a latch

  OPTION B — KICK PLUNGER (THROUGH THE BASE FACE)
    A short pin (Ø4-6mm, 6mm stroke) extends through a port in the base
    face and pushes directly against the table/charging pad.

      For THE LEAP (V = 0.89 m/s), 6 mm stroke:
        acceleration            a ≈ V²/(2s) ≈ 66 m/s²
        force                   F ≈ M·(a + g) ≈ 9 N
        mechanical energy       ≈ 47 mJ + M·g·s ≈ 54 mJ  (η → ~90%)

      + Half the peak force, ~3× better energy efficiency
      + Directly reuses the voice-coil class named in v0.1
      − A port in the base face (dust, liquid ingress; shares the face
        with the Qi coil — the coil becomes an annulus around the port)
      − Plunger tip contacts the surface: tip material defines noise and
        surface marking (soft-tip elastomer over a hard core)

  DECISION FOR REV-A
    Build BOTH on the bench (Section 08, Rig 1). Default hypothesis:
    OPTION B for THE HOP and THE LEAP; the same voice coil, plunger
    retracted, renders THE NUDGE and THE SETTLE against an internal
    stop. OPTION A remains the fallback if the base port fails ingress or
    acoustic targets. The piezo bias element from v0.1 is retained in
    both options for the 5-15° forward component.

    This is recorded as an architecture correction, not a reversal —
    the v0.1 principle ("one actuator, one moving mass, mechanically
    boring") holds under either option.

--------------------------------------------------------------------------------
04 // ENERGY AND BATTERY BUDGET
--------------------------------------------------------------------------------

  CELL               3.7 V LiPo, ~150 mAh (≈ 0.55 Wh ≈ 2,000 J)
                     — fits a 30 × 20 × 5 mm pouch, ~3-4 g

  PER-GESTURE ELECTRICAL COST (Option B, assumed 15% electro-mechanical
  efficiency including driver losses — conservative, to be measured)
    THE NUDGE        ~0.05 J
    THE HOP          ~0.10 J
    THE SETTLE       ~0.10 J
    THE LEAP         ~0.40 J   (+ boost-converter piezo pulse ~0.02 J)

  STANDBY (BLE advertising + IMU wake-on-motion + RTC)
    Target average   ≤ 0.3 mW  →  ≈ 26 J/day

  WORST REALISTIC DAY  (20 NUDGE, 6 HOP, 2 LEAP, 4 SETTLE)
                     ≈ 1.0 + 0.6 + 0.8 + 0.4 + 26 ≈ 29 J/day
                     → ~60+ days per charge OFF the pad

  On the pad, the cube is continuously topped up by Qi. Battery capacity
  is therefore sized for the cube being picked up and carried, not for
  desk duty. Implication: the cell may shrink in Rev-B to recover mass
  for v.1 — every gram argued for.

  PEAK CURRENT
    9 N voice-coil pulse for ~15 ms at ~2-3 A from the cell. LiPo pouch
    cells of this size are commonly rated ~1-2C continuous; a supercap
    buffer (≈ 0.5-1 F, 5.5 V) between cell and driver is planned so the
    cell never sees the pulse directly. Logged as Risk R-02.

--------------------------------------------------------------------------------
05 // CANDIDATE BILL OF MATERIALS — REV-A (BENCH, NOT PRODUCTION)
--------------------------------------------------------------------------------

Component classes are named, specific parts are candidates. Nothing here
is a sourcing commitment.

  SUBSYSTEM          COMPONENT CLASS                       MASS (g, est.)
  ─────────          ───────────────                       ──────────────
  Shell              Nano-ceramic composite, 45mm, ~1.2mm       38
                     wall, matte LOT® black
                     (Rev-A bench: SLA resin stand-in)
  Actuator           Linear voice coil, ~8-10 N peak,           28
                     6mm stroke, with plunger + return spring
  Bias element       Piezo bimorph strip + HV boost driver       4
  Energy buffer      Supercapacitor, 0.5-1 F                     5
  Battery            LiPo pouch ~150 mAh                         4
  Compute / radio    BLE 5 SoC (nRF52/nRF54 class)               2
  Motion sensing     6-axis IMU, wake-on-motion capable          1
  Edge safety        4× IR cliff sensors (bottom edges) +        3
                     1× ToF ranging sensor (forward/down)
  Power              Qi-class receiver coil (annular) + charger  7
  Drivers            H-bridge for voice coil, LRA-style haptic   2
                     waveform driver for NUDGE shaping
  Indicator          LED ring, base face                         1
  Structure / PCB    Rigid-flex PCB, internal frame, fasteners  14
  Feet               4× elastomer                                2
                                                               ─────
  TOTAL (est.)                                                ≈ 111 g

  Margin to 120g ceiling ≈ 9 g. Shell and actuator are 60% of mass —
  they are the only two levers that matter for v.1.

--------------------------------------------------------------------------------
06 // SAFETY — REVISED EDGE GATE
--------------------------------------------------------------------------------

  v0.1 specified one forward-facing time-of-flight sensor. That covers
  THE LEAP's intended direction but not landing scatter: a 40mm leap with
  ±10mm scatter can drift in any direction, and an in-place HOP that
  lands off-axis and is righted by a corrective pulse can walk sideways
  over many cycles.

  REV-A EDGE GATE
    - Four IR cliff sensors, one per bottom edge, angled 30° outward —
      the same principle used in floor-cleaning robots. A sensor that
      sees no surface within 15mm marks that edge "open."
    - Forward ToF retained for LEAP trajectory clearance (objects, not
      only drops — a mug in the landing zone inhibits the LEAP).
    - Rule: any open edge within the gesture's landing radius
      (HOP 15mm, LEAP 60mm) downgrades the gesture to NUDGE. The gate
      is evaluated fresh before every actuation, never cached.
    - Gate is enforced in firmware below the BLE command layer: no
      server or app command can bypass it.

  OTHER SAFETY LINES OPENED THIS CYCLE
    - Pick-up inhibit: IMU detects free-fall or hand-hold (non-gravity
      acceleration pattern) → all actuation locked for 10 s after rest.
    - Small-parts: a 45mm cube exceeds the 31.7mm small-parts test
      cylinder; the plunger and feet must be captive (non-removable)
      to keep that true. Relevant for Use Case 02 (household setting).
    - Thermal: voice coil duty-cycle limit, max 1 LEAP per 20 s.
    - Battery: cell sealed inside ceramic, no user access.

--------------------------------------------------------------------------------
07 // FIRMWARE STATE MACHINE AND SERVER INTEGRATION
--------------------------------------------------------------------------------

  STATES
    SLEEP ──(BLE cmd / scheduled wake)──▶ ARMED
    ARMED ──(edge gate PASS)──────────▶ ACTUATE(gesture)
    ARMED ──(edge gate FAIL)──────────▶ ACTUATE(NUDGE)  [downgrade]
    ACTUATE ──(done)──────────────────▶ LAND_CHECK
    LAND_CHECK ──(tilt ≤ 25°)─────────▶ REPORT
    LAND_CHECK ──(tilt > 25°)─────────▶ RIGHTING (max 2 attempts)
    RIGHTING ──(success | give up)────▶ REPORT
    REPORT ──(telemetry sent)─────────▶ SLEEP
    ANY ──(pick-up / free-fall)───────▶ LOCKOUT (10 s after rest) ──▶ SLEEP

  BLE COMMAND (v.0 draft, single characteristic, 8 bytes)
    [0]   gesture id     0=NUDGE 1=HOP 2=LEAP 3=SETTLE
    [1]   amplitude      0-255 (scaled into the gesture's safe envelope)
    [2]   heading        0-255 → 0-360°, LEAP only
    [3]   cadence        repeat count (NUDGE only, max 3)
    [4-7] signal ref     truncated hash of the originating LOT® signal

  TELEMETRY (REPORT state → bridge → QI·46 "haptic preference")
    gesture requested, gesture performed (downgrade visible), landing
    tilt, righting attempts, time-to-first-touch (IMU detects operator
    contact after gesture), surface vibration response. Time-to-first-
    touch is the v.0 proxy for the QI·46 "cadence" signal.

  BRIDGE — v.0 REFERENCE PATH (no new server endpoint required)
    Phase 1 (bench):  a browser tab with Web Bluetooth, signed in to
                      lot-systems.com, listens on the existing SSE
                      stream GET /api/sync and on POST /api/sync-badges
                      responses (newBadges[]) and translates them to BLE
                      commands using the Section 04 mapping of v0.1.
    Phase 2:          a dedicated, explicit server event type for CUBIQ
                      (e.g. "cubiq.gesture") on the SSE stream, so the
                      mapping lives server-side with QI·46 — scoped in a
                      future cycle, NOT built in this one.

  NOTE ON CURRENT SIGNAL COVERAGE
    The server-side badge whitelist in /api/sync-badges today accepts
    milestone_7, milestone_30 and milestone_100 only. For bench work this
    is sufficient (three distinct real triggers). Before any operator
    trial, the badge-tier → gesture mapping (HOP vs LEAP) needs a
    rarity field the bridge can read.

--------------------------------------------------------------------------------
08 // REV-A BENCH PLAN
--------------------------------------------------------------------------------

  RIG 1 — ACTUATOR SHOOT-OUT (Option A vs Option B)
    Open frame, 45mm footprint, mass-matched to 120g with ballast.
    Measure: apex height (high-speed video, 240 fps minimum), landing
    scatter radius, energy per hop (cell-side), acoustic peak at 0.5 m.
    Exit: pick A or B. Criteria in order: reliability > energy > noise.

  RIG 2 — LANDING AND RIGHTING
    Closed SLA shell, chosen actuator, IMU live.
    500 HOP cycles, 200 LEAP cycles on wood, glass, laminate.
    Record tilt distribution and righting success rate.

  RIG 3 — EDGE GATE
    Cube placed at 10, 20, 40, 60, 80mm from a table edge, each of four
    sides, each gesture. The v0.1 hard gate stands: 100/100 approach
    trials, zero off-table events, or v.0 does not close.

  RIG 4 — NOTIFICATION LANGUAGE PERCEPTION
    10 participants, blind. Can they distinguish NUDGE vs SETTLE through
    a desk at hand distance while typing? Can they identify LEAP as
    "more important" than HOP without being told? This is the first test
    of the gesture language as a language, not only as mechanics.

  RIG 5 — LIVE SIGNAL LOOP
    Bench bridge (Section 07, Phase 1) connected to a test operator
    account. Fire milestone badge sync and a memory question; confirm
    gesture, telemetry return and end-to-end latency (target < 2 s from
    server event to motion).

  v.0 CLOSE GATE (unchanged from v0.1, now with rig references)
    500/500 hop-and-recover (Rig 2) · zero off-table landings (Rig 3) ·
    zero actuator failures · end-to-end loop proven (Rig 5).

--------------------------------------------------------------------------------
09 // ROADMAP NOTES CARRIED FORWARD
--------------------------------------------------------------------------------

  v.1 — LONG JUMP
    Section 02 shows ~4× LEAP energy is needed at the LOT® 75° arc, or
    a flatter arc at lower energy. Decision deferred to after Rig 1 data.
    Mass target <90g confirmed necessary.

  v.2 — HORIZONTAL SURFACE SWINGS
    New candidate mechanism this cycle: a small internal flywheel,
    spun up slowly and braked abruptly, transfers angular momentum to the
    shell and pivots the cube about one bottom edge — a "swing" onto the
    next face. This is the public M-Blocks / Cubli principle (Section 00)
    and competes with v0.1's actuated traction pads. Advantage: it
    produces the most cube-like motion possible (a cube tumbling face to
    face), and a single flywheel on a yaw gimbal gives directionality.
    Cost: flywheel mass (~10-15 g) and gyroscopic disturbance to the HOP.
    Recorded as v.2 OPTION F (flywheel) alongside OPTION T (traction).

  v.3 — LEVITATION (RESEARCH TRACK, UNCHANGED STATUS)
    One constraint learned this cycle: the Section 05 mass budget
    (~111 g) is far above what phased-array acoustic levitation can lift
    — that technique handles beads and small particles, not a 100g
    object. Acoustic levitation of a full cube is therefore not a
    realistic v.3 path at this mass; at most it is a path for a
    "satellite" (a small, light element levitated ABOVE the cube or the
    pad). Active magnetic levitation above a powered base remains the
    only plausible full-cube candidate and requires a magnet in the
    shell — a choice that conflicts with the Qi coil and the IMU
    magnetometer and must be designed for, not added later.
    No mechanism is claimed. No date is set.

--------------------------------------------------------------------------------
10 // RISK REGISTER (OPENED THIS CYCLE)
--------------------------------------------------------------------------------

  ID    RISK                                    LIKELIHOOD  MITIGATION
  ──    ────                                    ──────────  ──────────
  R-01  Option B base port fails ingress        MED         Option A
        (coffee spill on the desk)                           fallback
  R-02  Pulse current exceeds cell rating       MED         Supercap
                                                             buffer
  R-03  LEAP "tock" is perceived as noise,      MED         Soft-tip
        not presence — breaks the anti-feed                  plunger, Rig 4
        thesis                                               perception data
  R-04  NUDGE imperceptible on glass /          HIGH        Surface-aware
        stone desks                                          amplitude via
                                                             IMU response
  R-05  Ceramic shell cracks on a fall from     MED         Fall test in
        desk height                                          Rev-B; inner
                                                             elastomer frame
  R-06  Mass overrun past 120g                  MED         Shell wall and
                                                             actuator are
                                                             the only levers
  R-07  Magnetic levitation path conflicts      LOW (now)   Recorded in 09,
        with Qi + magnetometer                  HIGH (v.3)  design for it

--------------------------------------------------------------------------------
11 // CONSUMER USE CASES
--------------------------------------------------------------------------------

Per the parent document's Section 07 rule, each cycle adds one new
consumer use case. Use Case 01 lives in the parent document and is
not repeated here. Use Case 02 is appended to the parent document's
Section 07 in this same commit, and is reproduced below.

  USE CASE 02 — THE KITCHEN TABLE HOUR                      2026-11-12
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, parent of a seven-year-old, single
  household, works remotely. Has run the evening self-care section of
  the cubic for months but keeps missing it on weeknights — not from
  lack of intent, but because by 19:00 the laptop is closed and the
  phone is deliberately in another room. The cube arrived at Month 12
  and lives on its charging pad on the kitchen table, not the desk.

  At 19:10, the evening self-care window opens in the operator's Index
  of Systems. No screen is on in the house. The cube performs THE
  SETTLE — a two-second held press, nothing visible. The operator,
  wiping the table, feels it under the cloth and knows what it means:
  the evening is starting. They do not open anything yet.

  At 19:25, the child finishes homework at the same table. The memory
  question for the evening is ready. The cube performs THE HOP — a
  single small rise, under a centimeter, landing in place. The child
  sees it first and says, "It's asking." The operator opens the cubic on
  the tablet; the question tonight is about a meal they cooked with
  their own father. They answer it out loud, with the child listening,
  and type it in afterward.

  Two weeks later the HOP has become a household cue, not a device
  notification. The child waits for it. On the evening the operator
  closes a 30-day streak, the cube performs THE LEAP — 40mm across the
  table toward the child's side, because the operator set the LEAP
  heading that way. Before the LEAP fires, the edge gate reads the
  table edge on the child's side as clear beyond 60mm; on a narrower
  table the cube would have downgraded to a NUDGE without being asked.

  What the cube did that a phone could not: it carried the evening
  ritual into a room with no screens, it was seen by someone who is not
  the account holder without exposing any content, and it made the
  operator's self-care visible to their child as something done
  calmly and on time — the "fathers and mothers feel of being needed"
  of LOT-CUBIQ-VISION.md Section 04, expressed as a small object
  rising off a kitchen table.

  Engineering implications pulled from this case into Rev-A:
    - SETTLE must be perceptible through a tablecloth (Rig 4 add-on).
    - LEAP heading must be operator-configurable per placement (BLE
      byte [2], Section 07) and persisted on the cube.
    - Household setting makes the small-parts and pick-up inhibit lines
      of Section 06 mandatory for v.0, not v.1.
    - Gestures must never encode content. The child sees that a
      question exists, never what it is. This is a privacy rule, and it
      is now a design rule: no display, no text, no audio content on
      the cube, at any version.

--------------------------------------------------------------------------------
12 // NEXT CYCLE — OPEN ITEMS FOR R03
--------------------------------------------------------------------------------

  [ ] Rig 1 data: Option A vs Option B decision
  [ ] Specific part numbers for actuator, IMU, cliff sensors (sourcing)
  [ ] Rarity field for badge → HOP/LEAP mapping (server-side, scoped)
  [ ] Bench bridge (Web Bluetooth page) — first code artifact
  [ ] v.2 Option F vs Option T: flywheel mass study
  [ ] Consumer Use Case 03

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-R02
================================================================================
