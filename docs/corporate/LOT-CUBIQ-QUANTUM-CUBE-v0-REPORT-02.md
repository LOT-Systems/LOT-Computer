================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report, Cycle 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-28
CYCLE:    02 (cycle 01 = LOT-CUBIQ-QUANTUM-CUBE-v0, 2026-07-28)
STATUS:   v.0 — PRE-HARDWARE. ACTUATOR PHYSICS PRE-QUALIFIED ON PAPER.
          NO PROTOTYPE EXISTS. NOTHING IN THIS REPORT HAS BEEN BENCH-TESTED.
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing (per the standing rule in v0 §07):

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md      my cycle-01 spec (336 lines)
  docs/corporate/LOT-CUBIQ-VISION.md               cubic as spatial experience
  docs/corporate/LOT-CUBIQ-OPERATOR.md             Index of Systems, Phase 4
  docs/corporate/LOT_QI46_ENGINE.md                cube as Month-12 INPUT device;
                                                   Institute corpus incl. "Quantum
                                                   Cube" white paper, piezoelectric,
                                                   nano-ceramic, haptic language
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md      Quantum Cube "PLANNED" line item
  docs/corporate/LOT-AMBIENT-AI-VISION.md          QIoT™, LOT® Station, LOT® Brush
  docs/corporate/LOT_ROBOTICS_COSMO.md             COSMO® lineage (naming boundary)
  docs/assembly/LOT-LEDGER.md                      last entry 2026-08-05

Repo state: no prior cube-specific code, CAD, or firmware exists. The only
CUBIQ hardware artifact on record is the cycle-01 spec. This report is the
second document, not the second iteration of a build.

LOT® Institute basis (what the Institute corpus actually provides): the
Quantum Cube is named in the Institute white-paper set (QI46 lines 108, 311)
and described only as "bioelectric hardware, haptic feedback, nano-ceramic,
piezoelectric" (CQGS snapshot line 32). The white paper itself is not in this
repository, so this report does not claim to implement it. It stays inside
the Institute's named material vocabulary and flags where engineering
requires departing from it (§03).

--------------------------------------------------------------------------------
01 // CYCLE 02 DELTA — WHAT CHANGED SINCE CYCLE 01
--------------------------------------------------------------------------------

  1. Energy budget computed for every v.0 gesture and the v.1 long jump.
  2. Cycle-01's actuator choice (direct voice-coil drive) is challenged:
     it does not scale to v.1. Recommendation changed to SPRING-LATCH.
  3. Firmware state machine and the signal → gesture contract specified.
  4. Test plan and gates made measurable (instrumentation, not just counts).
  5. Hazard analysis (unattended moving object: children, pets, edges).
  6. Use Case 02 added (§08). Use Case 01 untouched.
  7. Cycle-01 inconsistency found and corrected (§02, item A).

--------------------------------------------------------------------------------
02 // CORRECTIONS TO CYCLE 01
--------------------------------------------------------------------------------

  A. THE LEAP IS NOT A "FULL-AMPLITUDE HOP".
     Cycle 01 defined THE HOP as <10 mm rise and THE LEAP as the same
     primitive at "full amplitude" with ~40 mm displacement. The physics
     says these are different energy classes (table below): the Leap needs
     roughly 2.3–4x the energy of the Hop. They share an actuator, not a
     drive level; the firmware must treat them as separate calibrated
     profiles. Cycle 01 implied a single scalar; that was wrong.

  B. THE PIEZO BIAS ELEMENT IS UNPROVEN AS THE PRIMARY STEERING MECHANISM.
     Cycle 01 had a piezo bimorph "bias the leap 5–15° off vertical". A
     bimorph moves micrometres to sub-millimetres; at the energies below
     it will not measurably steer a 120 g body. Forward bias is more
     credibly produced by the geometry of the strike (angled impact
     face / offset strike point). The piezo is retained, demoted to its
     defensible roles: contact/landing detection and the NUDGE (a
     sub-threshold buzz it is well suited to), and as the Institute-
     vocabulary link. Bench test T-04 decides this; until then the
     angled-strike geometry is the baseline.

--------------------------------------------------------------------------------
03 // ACTUATION PHYSICS (g = 9.81 m/s², flat rigid surface, ideal flight)
--------------------------------------------------------------------------------

  Required launch energy = ½ m v²; range R = v² sin(2θ)/g.

  GESTURE / TARGET            m     launch  v        KE        flight  apex
  ───────────────────────     ────  ──────  ───────  ────────  ──────  ──────
  HOP, 10 mm rise (v.0)       120g  90°     0.44 m/s 11.8 mJ   90 ms   10 mm
  LEAP, 40 mm range (v.0)     120g  60°     0.67 m/s 27 mJ     119 ms  17 mm
  LEAP, 40 mm range (v.0)     120g  75°     0.89 m/s 47 mJ     174 ms  37 mm
  LONG JUMP, 150 mm (v.1)     90g   45°     1.21 m/s 66 mJ     175 ms  38 mm
  LONG JUMP, 150 mm (v.1)     90g   30°     1.30 m/s 77 mJ     133 ms  22 mm

  Notes:
  - These are ideal-ballistic minima. Real losses (strike inefficiency,
    shell compliance, feet, air) are typically 2–5x. Budget design energy
    at 3x: ~200 mJ for v.1.
  - A 30–45° launch is the low-energy, low-apex long jump. It is also the
    gentlest on landing, which favors v.1. 60° is not cheaper in energy.
  - Required momentum for the 150 mm jump: ≈ 0.11 N·s.

  DIRECT-DRIVE VOICE COIL — DOES NOT SCALE TO v.1 (changes cycle-01 choice)
    Delivering 0.11 N·s with a 25 g reaction mass over an 8 mm stroke needs
    the mass at ~4.4 m/s, i.e. ~1,200 m/s² (≈120 g) and ≈30 N peak force.
    That is not credible from a voice coil that fits a 45 mm cube and a
    ~100 mAh cell. The same stroke at v.0's 11.8–47 mJ is credible.

  RECOMMENDATION — SPRING-LATCH STRIKER (carried into v.0 so v.1 inherits it)
    A small coil/gear charges a spring slowly (low peak current, silent,
    battery-friendly); a latch releases it in ~1 ms (high peak force, no
    high peak current). Energy stored is set by compression, giving
    repeatable, calibratable gesture energies. This is the same actuator
    for NUDGE (partial charge, no liftoff), HOP, LEAP and LONG JUMP — only
    the charge level and strike geometry differ. v.0 therefore pays for the
    mechanism v.1 needs and loses nothing.
    Voice coil remains the candidate for the SETTLE gesture (steady light
    pressure) and as the spring charger.

  BATTERY SANITY (100 mAh, 3.7 V = 1.33 kJ; assume 50% usable)
    At 5% overall electrical→kinetic efficiency a 66 mJ jump costs ~1.3 J
    → ~500 long jumps per charge. The v.0 hop/leap profiles cost far less.
    Energy is not the constraint; peak current, noise, and mass are.

  NOISE: a latch strike is audible. Target ≤ 35 dBA at 30 cm for NUDGE,
  ≤ 45 dBA for LEAP. Open item; measure on prototype (T-08).

--------------------------------------------------------------------------------
04 // FIRMWARE — SIGNAL → GESTURE CONTRACT
--------------------------------------------------------------------------------

  STATES
    CHARGING → IDLE → ARMED → FIRING → FLIGHT → LANDED → RECOVER → IDLE
                         └→ INHIBIT (edge / child-safe / do-not-disturb)
                         └→ FAULT   (latch, IMU, or ToF failure; stays still)

  GATES evaluated in ARMED, any one forces INHIBIT or downgrade:
    1. Edge gate: ToF reports surface edge within 20 mm of predicted
       landing → downgrade to NUDGE (no liftoff). Hard gate (from v0 §03).
    2. Tilt gate: base not within ±5° of level → no liftoff.
    3. Lift gate: IMU shows the cube is being held/carried → no liftoff.
    4. Quiet gate: operator "do not disturb" window → NUDGE only or silent.
    5. Rate limit: ≤ 1 liftoff gesture per 60 s; ≤ N per hour (default 6).
       A cube that keeps jumping is a feed. The anti-feed thesis (VISION
       §01) applies to the hardware as strictly as to the software.
    6. Power gate: below 15% charge → NUDGE only.

  SIGNAL CLASS → GESTURE MAP (extends v0 §04; additions marked +)
    memory question ready ............ NUDGE
    badge unlocked, common/uncommon .. HOP
    badge unlocked, rare+ ............ LEAP
    assembly phase advanced .......... SETTLE
  + environment advisory (Station) ... HOP, repeated twice, 4 s apart
  + brush routine incomplete ......... NUDGE, evening window only
  Transport: signed message from the LOT® OS over BLE; the cube never
  initiates network traffic and holds no operator profile data, only a
  gesture enum and a nonce (privacy by construction).

  TELEMETRY BACK TO QI·46 (closes the loop in QI46 line 757)
    gesture_id, commanded vs measured energy (IMU), landing attitude,
    inhibit reason, operator response latency (cube touched/lifted within
    N minutes). No audio, no camera, no location. The cube has no
    microphone by design.

--------------------------------------------------------------------------------
05 // MECHANICAL + ELECTRONIC STACK (v.0 REFERENCE BOM, NON-BINDING)
--------------------------------------------------------------------------------

  Shell ................ nano-ceramic composite (Institute material line)
                         ~25–30 g, 45 mm cube, 1.5 mm walls; rounded edges
                         (r ≥ 3 mm) so a bad landing tumbles rather than digs
  Striker .............. spring-latch + small coil/gear charger, ≤ 25 g
  Bias / landing ....... piezo disc (contact detect, NUDGE), angled strike face
  Sensing .............. 6-axis IMU (centre), ToF (base, forward), Hall/
                         optical latch-state sensor
  Compute/radio ........ BLE SoC (nRF-class), ≥ 1 MB flash for OTA
  Power ................ ~100 mAh LiPo + Qi-class receiver coil in base face
  Feet ................. 4 elastomer feet (passive); shore ≥ A60, μ ≥ 0.6
  Indicator ............ single LED ring, base only (charge/pairing)
  Mass budget .......... shell 28 + striker 25 + cell 3.5 + PCB/IMU/ToF/BLE 12
                         + coil/feet/misc 20 ≈ 90 g core; 120 g v.0 target
                         leaves 30 g margin. Unverified estimate.

  MAGNETICS NOTE: any magnet near the IMU needs a magnetometer-free
  design or shielding. v.0 uses no magnetometer; heading is irrelevant.

--------------------------------------------------------------------------------
06 // TEST PLAN AND GATES (MEASURABLE)
--------------------------------------------------------------------------------

  Instrumentation: 240 fps overhead camera + 5 mm grid mat; onboard IMU
  log; calibrated sound meter. Surfaces: oak, tempered glass, laminate.

  T-01  Strike energy repeatability .. 100 shots/charge level; σ ≤ 8% of mean
  T-02  HOP ......................... rise 8–12 mm, lands upright ≥ 98/100
  T-03  LEAP ........................ 40 ± 10 mm displacement, ≥ 95/100 on all
                                      three surfaces
  T-04  Steering mechanism .......... angled-strike vs piezo bias, A/B; decides
                                      correction B (§02)
  T-05  Landing recovery ............ from tip > 25°, self-right ≥ 9/10
  T-06  Edge gate ................... 100/100 approaches inhibited at ≤ 20 mm;
                                      ZERO tolerance (release blocker)
  T-07  Soak ........................ 500 hop+recover cycles, zero off-table
                                      landings, zero latch failures
  T-08  Acoustic .................... ≤ 35 dBA NUDGE, ≤ 45 dBA LEAP @ 30 cm
  T-09  Lift/carry gate ............. 50/50 liftoff refusals when hand-held
  T-10  Thermal ..................... shell ≤ 41 °C after 20 min charging

  v.0 CLOSES ONLY WHEN T-01..T-03, T-05..T-10 PASS. T-04 may close with
  either answer, but must be answered.

--------------------------------------------------------------------------------
07 // HAZARD ANALYSIS — A MOVING OBJECT NOBODY IS WATCHING
--------------------------------------------------------------------------------

  H1  Falls off desk ............ edge gate, rate limit, rounded landing
  H2  Hits a child/pet .......... 120 g at ≤ 0.9 m/s is low-energy, but:
                                  no liftoff gesture from a surface the
                                  tilt gate cannot confirm level; child
                                  mode = NUDGE only (parent toggle)
  H3  Lands on keyboard/drink ... Leap is directional and only ≤ 40 mm in
                                  v.0; v.2 path planning needs a keep-out
                                  concept (open)
  H4  Swallowable part .......... 45 mm cube is above the small-parts
                                  cylinder, but latch/cover screws must be
                                  tamper-resistant; no button cells
  H5  Li-ion cell ............... certified cell + protection IC; UN38.3;
                                  charge only on the LOT® pad
  H6  Privacy ................... no mic/camera/location; BLE-only; signed
                                  commands; no operator profile on device
  H7  Regulatory (flag, not a
      claim) .................... radio (FCC Part 15), battery transport,
                                  product-safety testing needed before any
                                  consumer sale. Not started.
  H8  Biofield claims ........... the Institute's biofield language is
                                  philosophy; the product must not make
                                  health or therapeutic claims. Marketing
                                  review required.

--------------------------------------------------------------------------------
08 // CONSUMER USE CASES (APPEND-ONLY; USE CASE 01 IS IN THE v0 SPEC §07)
--------------------------------------------------------------------------------

  USE CASE 02 — THE STALE ROOM                                   2026-10-28
  ─────────────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, Station owner, works and sleeps in a
  small apartment; windows closed through autumn. Not a wellness
  enthusiast — would never open an air-quality app.

  The LOT® Station (Ambient AI vision, QIoT™) reads CO₂ climbing past
  ~1,200 ppm after three hours of a closed room — the range associated
  with drowsiness and weaker concentration. Today the ambient answer is a
  one-line widget the operator has to be looking at the screen to see.

  With CUBIQ v.0: the Station signal reaches the cube. It performs THE
  HOP twice, four seconds apart — a small physical "hey" on the desk,
  once, at an unobtrusive moment (not mid-typing burst; the IMU's desk-
  vibration reading is the typing proxy). No light, no chime, no number.
  The operator glances over, thinks "oh, the room," opens a window. When
  the Station reports CO₂ back under 800 ppm the cube does THE SETTLE —
  two seconds of quiet pressure, no motion — the "thank you." If the
  operator ignores it, the rate limit means the cube asks again after an
  hour, not every minute.

  Why a cube and not a phone alert: the signal is about the room, so it
  arrives from an object IN the room. It is the first notification the
  operator would describe as the room speaking, not an app nagging.
  Telemetry (response latency, inhibit reason) feeds QI·46 so the next
  reminder lands at the operator's actual receptive moments.

  Gesture used: HOP ×2, SETTLE. Hardware required: v.0 only. Signal
  source: LOT® Station. Gates exercised: quiet, rate limit, lift.

  USE CASE BACKLOG (candidates only; not committed, one per future cycle)
    03  The Handoff — Brush routine incomplete at bedtime: evening NUDGE
        (v.0), and in v.2 the cube closes distance toward the operator.
    04  The Shared Table — household: per-person gesture signatures so two
        operators on one desk feel different cubes' languages. (v.2)
    05  The Bedside — wake-window nudge felt through the nightstand
        instead of an alarm tone. Needs noise target ≤ 30 dBA first.
    06  The Return Home — long jump (v.1) from shelf to the pad edge as
        a "welcome": requires the v.3-era keep-out and path planning.

--------------------------------------------------------------------------------
09 // ROADMAP STATUS
--------------------------------------------------------------------------------

  v.0  CONTROLLED HOP ....... SPECIFIED, physics pre-qualified, test plan
                              measurable. Next: build 3 striker benches
                              (no shell) to run T-01, T-02, T-04. 
  v.1  LONG JUMP ............ unchanged target (>150 mm); mechanism now
                              spring-latch; mass target <90 g.
  v.2  SURFACE SWINGS ....... unchanged; depends on v.1 + traction pads.
  v.3  LEVITATION ........... research only. Candidate directions in v0 §06
                              stand. Added constraint: a 90–120 g body
                              needs ~1 N of sustained lift; acoustic
                              levitation typically suspends milligram–gram
                              particles, so (a) is a research reach for this
                              mass. Active magnetic levitation (b) is the
                              more plausible path for a cube-scale object
                              and implies a servo-controlled coil array in
                              the pad. Not a v.0–v.2 commitment.

--------------------------------------------------------------------------------
10 // OPEN ITEMS FOR S-2
--------------------------------------------------------------------------------

  1. Provide or locate the Institute "Quantum Cube" white paper — it is
     referenced by the corpus but is not in this repo.
  2. Decide: spring-latch replaces direct voice-coil as v.0 baseline (§03).
  3. Authorize ~3 striker bench builds (budget, supplier) — nothing exists
     physically yet.
  4. Confirm child-mode default and the 6/hour liftoff rate limit.
  5. Confirm brand marks for packaging (v0 §08 unchanged).

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
================================================================================
