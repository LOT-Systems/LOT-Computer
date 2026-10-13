================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Engineering Report 02
          Energy Budget, Actuator Re-Architecture, Test Plan, Use Case 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-13
VERSION:  0.2 — DEVELOPMENT CYCLE 02
STATUS:   v.0 — DESIGN LOCK CANDIDATE (PRE-HARDWARE, ANALYTICAL)
PRECEDES: LOT-CUBIQ-QUANTUM-CUBE-v0.md (cycle 01, 2026-07-28)
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing (all in this repository):

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md   (cycle 01 — my own prior work)
    Locked the v.0 scope: one controlled hop, four gestures (NUDGE, HOP,
    LEAP, SETTLE), voice-coil + piezo-bias architecture, IMU landing
    recovery, ToF edge gate, v.0→v.3 roadmap, Use Case 01.
  docs/corporate/LOT-CUBIQ-VISION.md      — anti-feed thesis; Section 05
    "Physical Products" is the arc this hardware executes.
  docs/corporate/LOT-CUBIQ-OPERATOR.md    — Section 03 Index of Systems
    (signal source), Section 04 AI-driven physical delivery, Section 07
    Phase 4 physical extension.
  docs/corporate/LOT_QI46_ENGINE.md       — line 110 (piezoelectric,
    nano-ceramic, haptic language), line 127 (Quantum Cube haptic
    preference as consumable feedback), lines 750-764 (Month-12 cube
    sync as INPUT telemetry).
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md — Quantum Cube hardware row,
    status PLANNED.
  docs/benchmark/LOT-MANIFEST.md          — COSMO® Cube is a separate
    hardware-computer track; no naming collision with CUBIQ™.

Finding on reading: the repository holds ONE prior CUBIQ hardware document
(cycle 01). No prior energy budget, no prototype BOM, no test protocol, and
no reliability analysis exist. This cycle supplies them — and, doing the
arithmetic, corrects three assumptions in cycle 01 (Section 02 below).

NOTE ON EVIDENCE. Everything below is first-principles analysis (ballistics,
energy, momentum). No hardware has been built or measured. Numbers are
design targets with stated assumptions, not test results.

--------------------------------------------------------------------------------
01 // WHAT THIS CYCLE ADDS
--------------------------------------------------------------------------------

  1. A ballistic energy budget for every motion class (v.0, v.1).
  2. Three corrections to the cycle-01 architecture (mechanism, bias
     element, self-righting).
  3. A prototype bill of materials and a build sequence for the first
     physical v.0 unit ("P0").
  4. A test protocol that turns cycle-01's gates into runnable procedures.
  5. A risk register.
  6. Use Case 02 (appended to the master spec, Section 07, as that
     document's rule requires).

--------------------------------------------------------------------------------
02 // ENERGY BUDGET — WHAT EACH MOTION ACTUALLY COSTS
--------------------------------------------------------------------------------

Ideal projectile on a flat surface, g = 9.81 m/s², no drag, no landing
losses. Launch energy E = ½·m·v², range R = v²·sin(2θ)/g.

  GESTURE / CLASS        MASS   LAUNCH  TARGET          v (m/s)  E (mJ)  APEX    FLIGHT
  ─────────────────────  ─────  ──────  ──────────────  ───────  ──────  ──────  ──────
  THE HOP (v.0)          120 g  ~90°    10 mm rise       0.44     11.8   10 mm   ~90 ms
  THE LEAP, as written   120 g  15°     40 mm range      0.89     47.1   2.7 mm  ~47 ms
  THE LEAP, steep alt.   120 g  45°     40 mm range      0.63     23.5   10 mm   ~90 ms
  LONG JUMP (v.1)         90 g  45°     150 mm range     1.21     66.2   37 mm   ~175 ms
  LONG JUMP, low-flat     90 g  30°     150 mm range     1.30     76.5   22 mm   ~133 ms

Real-world derating: assume 50% of stored energy reaches the shell (friction,
elastomer feet, coil losses) → size stored energy at 2× the table.

  v.0 stored-energy requirement : ~95 mJ  (LEAP as written, ×2 margin)
  v.1 stored-energy requirement : ~150 mJ (long jump, ×2 margin)

READ-OUT
  - The LEAP as written in cycle 01 (5-15° bias) costs ~4× the energy of
    the HOP, and flies only ~3 mm high. At 15° it is a skid-and-hop, so
    surface friction (not the actuator) dominates landing displacement.
    The 40 mm figure is only dependable at launch angles ≥ 30°.
  - v.1's 150 mm target is ~5.6× the v.0 LEAP launch energy. It is a
    different energy-storage design, not a retune.
  - Energy per event is small. A 100 mAh / 3.7 V cell holds ~1,330 J,
    i.e. >10,000 full-power leaps at 10% end-to-end efficiency. The
    budget limit is PEAK POWER (delivering 50-100 mJ in <10 ms ≈ 5-10 W
    peak), not battery capacity.

--------------------------------------------------------------------------------
03 // THREE CORRECTIONS TO CYCLE 01
--------------------------------------------------------------------------------

  C1 — MECHANISM: CHARGE-AND-RELEASE, NOT A DIRECT VOICE COIL
  ────────────────────────────────────────────────────────────
  Cycle 01 specified a voice-coil driving a spring-loaded reaction mass.
  A voice coil small enough for a 45 mm cube delivers ~1-4 N over a
  ~5-8 mm stroke, i.e. ~10-30 mJ per stroke. That covers THE HOP and
  THE NUDGE. It does not reach the ~47-95 mJ the LEAP needs.

  Also, an internal mass cannot launch the shell by pushing itself —
  momentum only transfers if the reaction mass is stopped by the shell
  (impact or hard stroke-end). The mechanism must be designed as a
  hammer-and-anvil, not a free push.

  CORRECTION: slow-charge, fast-release.
    - A small DC gear-motor (or the voice coil at low duty) compresses a
      leaf/coil spring over ~200-500 ms (silent, low peak current).
    - A latch (SMA wire or small solenoid pawl) releases the spring in
      <5 ms; the spring drives the reaction mass into a hard stop on
      the base-side anvil; the shell leaves the surface.
    - Required spring: for 95 mJ stored over 8 mm, k ≈ 2.97 kN/m
      (E = ½kx²); about 24 N peak at full compression.
    - The voice coil is retained, but for THE NUDGE and THE SETTLE only
      (sub-threshold, proportional, quiet). Two actuators, two jobs.

  C2 — BIAS ELEMENT: A TILTED AXIS, NOT A PIEZO BIMORPH
  ────────────────────────────────────────────────────
  Cycle 01 used a piezo bimorph to bias the launch 5-15° off vertical.
  A bimorph at this size produces well under 1 mJ and sub-millimetre
  stroke; it cannot meaningfully steer a 120 g body.

  CORRECTION: mount the spring/hammer axis at a fixed launch angle (30°
  from the surface plane gives ~60° from vertical in the shell frame)
  and let the launch angle be a mechanical constant. Directionality
  (cycle 01 v.2) then comes from yaw-reorienting the shell, not from
  bending a ceramic strip.
  Piezoelectric material is not abandoned — the Institute-named
  technology (LOT_QI46_ENGINE.md line 110) is re-assigned to where it
  is strong: SENSING. A piezo film on the base face detects landing
  impulse and surface type (see Section 05, test T4).

  C3 — SELF-RIGHTING: A CUBE HAS SIX STABLE FACES
  ───────────────────────────────────────────────
  Cycle 01 says a corrective micro-pulse rights the cube if it tips past
  25°. A cube resting on a face is stable; a vertical pulse cannot turn
  a face-down or on-its-side cube back onto the base face (a 90° or
  180° rotation).

  CORRECTION (two-part):
    a) PREVENT: bias the centre of mass low and toward the base face
       (battery + spring stack low), chamfer the four vertical edges
       and base perimeter (1.5 mm radius), and keep v.0 hops short.
       Rise ≤ 10 mm with 3 mm elastomer feet makes a non-base landing
       a fault, not an expectation.
    b) RECOVER, v.0: if the IMU detects a non-base resting face, the
       cube stays still and reports FAULT:ORIENTATION to the app (a
       gentle one-shot LED ring pulse on whichever face is up is
       permitted). It does NOT keep actuating — an unattended cube
       thrashing on a desk is a failure mode, not a feature.
    c) RECOVER, v.1+: add a small internal flywheel (single-axis
       momentum wheel, ~3 g) for a controlled 90° flip. Out of scope
       for v.0.

--------------------------------------------------------------------------------
04 // P0 PROTOTYPE — BILL OF MATERIALS AND BUILD SEQUENCE
--------------------------------------------------------------------------------

P0 is a throw-away proof unit. Goal: prove the hop primitive and the edge
gate. Not the shell, not the brand finish.

  SUBSYSTEM        P0 PART (class, not a vendor commitment)         MASS (g)
  ───────────────  ───────────────────────────────────────────────  ────────
  Shell            SLA-printed 45 mm cube, 1.5 mm wall (stand-in      18
                   for nano-ceramic composite, which is v.0-final)
  Spring + hammer  Stainless coil spring ~3 kN/m; 20 g tungsten-       30
                   alloy reaction mass
  Charge drive     6 mm micro gear-motor + cam                          6
  Latch            SMA-wire or micro-solenoid pawl                      2
  Nudge/Settle     Miniature voice-coil / LRA-class actuator            4
  Sensing          6-axis IMU; VL53L-class ToF; piezo film (base)       2
  Compute / radio  BLE SoC module with antenna                          2
  Power            ~100 mAh LiPo + charge IC                            3
  Charging         Qi-class receiver coil (base) + ferrite sheet        5
  Feet             4× elastomer pads (Shore 40A)                        1
  Wiring/fasteners/PCB                                                  9
  ─────────────────────────────────────────────────────────────────────
  TOTAL                                                               ~82 g

  The ~82 g P0 mass sits well under the 120 g ceiling; the margin is
  reserved for the nano-ceramic production shell (denser than SLA resin).
  If the shell pushes the unit over 120 g, the HOP still works (energy
  scales linearly) but LEAP range shortens ~proportionally.

  BUILD SEQUENCE
    S1  Bench rig: spring + latch + hammer on a force plate. Measure
        stored energy and release time. GATE: ≥ 95 mJ, release < 5 ms.
    S2  Add shell and feet. Free-hop on a glass plate and a wood plate;
        measure rise with a high-speed camera (240 fps minimum).
    S3  Add IMU + ToF + piezo film. Close the edge gate in firmware.
    S4  Add BLE. Drive from a test harness that mimics Index of Systems
        signals (Section 06).
    S5  Soak: run the 500-cycle gate from cycle 01.

--------------------------------------------------------------------------------
05 // TEST PROTOCOL
--------------------------------------------------------------------------------

  T1  ENERGY       Force plate + high-speed video; compute E from rise
                   and mass. PASS: HOP rise 8-12 mm; LEAP range
                   35-45 mm on laminate, over 30 consecutive trials.
  T2  EDGE GATE    Place the cube at 100 mm, 60 mm, 30 mm and 20 mm from
                   a table edge in each of 4 headings. Command LEAP.
                   PASS: 100/100 trials inhibited or landing ≥ 20 mm
                   from the edge. A single off-table event fails v.0.
                   Add transparent-glass and black-matte-edge cases: ToF
                   optical sensors misread both. If ToF fails either,
                   add an under-face IR reflectance pair.
  T3  LANDING      500 hop cycles on each of 3 surfaces (wood, glass,
                   laminate). Record IMU resting face after each.
                   PASS: ≥ 99% on base face; any non-base landing must
                   produce FAULT:ORIENTATION, never continued hopping.
  T4  SURFACE ID   Use the base piezo film's landing impulse signature
                   to classify surface (hard / medium / soft). Needed
                   by v.2 traction model; logged from v.0 onward.
  T5  ACOUSTIC     Measure noise at 0.5 m. HOP and NUDGE are
                   notifications meant for peripheral awareness, not
                   alarms. TARGET: NUDGE < 25 dBA, HOP < 40 dBA.
  T6  THERMAL      Continuous worst case (one LEAP per 10 s, 1 hour).
                   PASS: shell < 40 °C, no cell derating.
  T7  GESTURE      10 blinded volunteers, desk task: can they identify
  LEGIBILITY       NUDGE vs HOP vs LEAP vs SETTLE after a 2-minute
                   introduction? TARGET: ≥ 80% correct identification.
                   This is the ONE test of the notification language
                   itself; an unreadable language ships nothing.

--------------------------------------------------------------------------------
06 // SIGNAL INTERFACE (HARDWARE DRIVER CONTRACT, v.0)
--------------------------------------------------------------------------------

The cube is a dumb actuator with a smart safety gate. The Index of Systems
decides WHAT; the cube decides ONLY whether it is physically safe to do so.

  App → cube (BLE write):   { gesture: NUDGE|HOP|LEAP|SETTLE, signal_id }
  Cube → app (BLE notify):  { signal_id, status: DONE|INHIBITED|FAULT,
                              rise_mm, displacement_mm, resting_face,
                              edge_clearance_mm, surface_class }

  RULES
  R1  The cube NEVER initiates a gesture on its own.
  R2  If the edge gate inhibits a LEAP, it substitutes a HOP-in-place,
      then reports INHIBITED. The operator is never left with silence.
  R3  Quiet hours are enforced ON the cube, not only in the app, so a
      disconnected cube cannot fire at 03:00 from a stale queue.
  R4  Telemetry maps to the QI·46 "haptic preference" channel
      (LOT_QI46_ENGINE.md line 757). Raw IMU stays on-device; only
      aggregate pressure / duration / cadence is sent. This extends the
      repository's existing privacy posture rather than weakening it.

--------------------------------------------------------------------------------
07 // RISK REGISTER
--------------------------------------------------------------------------------

  ID  RISK                                             SEV  MITIGATION
  ──  ───────────────────────────────────────────────  ───  ─────────────────────────────
  K1  Cube leaves the desk                              HIGH Edge gate (T2); quiet fallback
  K2  Lands on non-base face and stops being useful     MED  C3a/b; FAULT report, no thrash
  K3  Peak current > cell/regulator limit               MED  Slow-charge/fast-release (C1)
  K4  Spring fatigue before 500-cycle gate              MED  Over-spec wire; S5 soak early
  K5  Hop noise reads as a click, not a cue             MED  T5; elastomer anvil face
  K6  Child/pet picks it up mid-charge or mid-spring    MED  Release lockout on lift (IMU
                                                              free-fall/lift detect)
  K7  Wireless charging coil blocked by mass layout     LOW  Coil on base; spring stack
                                                              above, ferrite shielded
  K8  Brand/naming collision with COSMO® Cube           LOW  Per cycle 01: CUBIQ™ = notify
                                                              body, COSMO® = computer
  K9  Levitation expectations outrun engineering        LOW  v.3 stays "research track"

  Safety note, K6: a charged spring is stored energy in a consumer object.
  v.0 requires a mechanical interlock so that the spring cannot be left
  charged at rest (discharge-to-safe on power-down, lift, or fault).

--------------------------------------------------------------------------------
08 // ROADMAP DELTA
--------------------------------------------------------------------------------

  v.0  CONTROLLED HOP   Unchanged scope. Mechanism re-specified (C1-C3).
                         Gate upgraded: add T2, T3, T7 to the 500/500 run.
  v.1  THE LONG JUMP    Energy need now quantified: ~150 mJ stored
                         (Section 02). Needs a larger spring stack or a
                         two-stage release; shell target < 90 g.
                         Add momentum wheel (C3c) at v.1.
  v.2  SURFACE SWINGS   Unchanged; T4 surface-ID logging begins in v.0 so
                         the traction model has data on day one.
  v.3  LEVITATION       Research track only. No mechanism claimed.
                         Carry-forward: acoustic and magnetic options need
                         the charge surface to become active — keep the
                         Qi pad's coil layout modular for that future.

--------------------------------------------------------------------------------
09 // CONSUMER USE CASES
--------------------------------------------------------------------------------

Use Case 01 (THE DESK MIGRATION, 2026-07-28) is on record in the master
spec, Section 07. This report adds Use Case 02 below and the same text is
appended to the master spec so the numbered list stays in one place.

  USE CASE 02 — THE KITCHEN COUNTER SETTLE                 2026-10-13
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, parent of two school-age children,
  Archetype "Steady Provider." The CUBIQ pad sits on the kitchen counter
  beside the coffee machine. The phone lives in a drawer between 18:00
  and 21:00 (family hours). The operator has deliberately turned off
  every push notification except one: the cube.

  The AI-driven physical delivery layer (LOT-CUBIQ-OPERATOR.md,
  Section 04) has advanced the operator's assembly phase and queued a
  hygiene-consumable shipment. Under software-only CUBIQ this surfaces
  as a badge on a screen nobody is looking at until 22:00.

  With CUBIQ hardware v.0:
    - 18:42  Assembly phase advances. The cube performs THE SETTLE —
      a two-second standing pressure, no visible motion. The operator,
      resting a hand on the counter while stirring a pot, feels a slow
      pulse through the surface. Nothing lights up. Nothing sounds. The
      children, mid-homework, notice nothing.
    - 19:15  A rare badge unlocks. THE LEAP fires — but the edge gate
      sees the counter's 280 mm depth and the cube sitting 90 mm from the
      front edge, and substitutes an in-place HOP. The app logs
      INHIBITED with 90 mm clearance. The operator sees a small bounce
      beside the pot and smiles; the cube never gets near the edge.
    - 21:10  Children in bed. The operator sits, opens CUBIQ for the
      5-11 minute session, and the badge and shipment note are both
      waiting. The two physical cues from earlier now have meaning
      attached.

  Why this case matters for the roadmap: it is the first use case where
  the edge gate is the hero rather than a footnote, and the first where
  the cube operates among people who did not choose it (children, guests).
  It therefore sets the requirement for K6 (lift lockout and discharge-to-
  safe) and for the on-device quiet-hours rule (R3). It also shows the
  anti-feed thesis in a household setting: the one notification the
  operator kept is the one that never asks to be looked at.

  Roadmap hook: with v.1's longer jump the same cube could cross a
  counter to reach the operator's hand — and would need the v.2
  multi-direction edge cone to do so safely. Counter-top use is the
  strongest early argument for building the edge gate before the range.

--------------------------------------------------------------------------------
10 // NEXT CYCLE (03) — PROPOSED
--------------------------------------------------------------------------------

  - Bench-plan the S1 spring/latch rig; pick SMA vs solenoid latch with
    a current-draw comparison.
  - Draft the ToF-failure fallback (IR reflectance pair) design.
  - Use Case 03: a v.1-class scenario (long jump) — e.g. shared office
    desk, cohort resonance ping crossing between two cubes.
  - Open question for S-2: should P0 be built in-house, or specified to
    an external prototype shop? Cost/timeline not estimated here.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
================================================================================
