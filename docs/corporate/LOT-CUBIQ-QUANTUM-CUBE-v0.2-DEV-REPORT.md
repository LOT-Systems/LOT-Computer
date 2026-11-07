================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0.2-DEV-REPORT
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report, Cycle 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-07
VERSION:  0.2 — ENGINEERING PASS (PAPER + FIRST-ORDER PHYSICS, NO HARDWARE YET)
STATUS:   v.0 DESIGN LOCK STILL PENDING — 2 SPEC CORRECTIONS RAISED (§03)
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing (per standing rule in LOT-CUBIQ-QUANTUM-CUBE-v0.md §07):

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md   (my own v0.1, 2026-07-28)
      Baseline spec: 45mm cube, <120g, voice-coil + piezo-bias hop, IMU
      recovery, ToF edge gate, four gestures, roadmap v.0→v.3, Use Case 01.
  docs/corporate/LOT-CUBIQ-VISION.md            Anti-feed thesis, §05 physical arc.
  docs/corporate/LOT-CUBIQ-OPERATOR.md          Index of Systems signals, Phase 4.
  docs/corporate/LOT_QI46_ENGINE.md             Cube as Month-12 input device.
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md   "Quantum Cube Hardware: PLANNED".
  docs/corporate/LOT_ROBOTICS_COSMO.md          COSMO® robotics line. CUBIQ™ stays
                                                a notification body, not a robot —
                                                no naming or scope collision.
  docs/benchmark/LOT-MANIFEST.md                COSMO® Cube hardware track (separate).

State of the record: only one prior CUBIQ hardware document exists (v0.1).
Nothing was built between 2026-07-28 and today; this cycle is therefore a
numerical review of v0.1, not a test report. NO MEASUREMENTS ARE CLAIMED.
All numbers below come from the idealised model in
docs/corporate/cubiq/cubiq_budget.py (point mass, no drag, no coil dynamics)
and must be read as first-order bounds, to be replaced by bench data.

--------------------------------------------------------------------------------
01 // CYCLE 02 SUMMARY
--------------------------------------------------------------------------------

  1. Put numbers under v0.1's motion classes (hop / leap / long jump).
  2. Found and corrected two v0.1 spec errors (edge margin; long-jump launch
     angle vs. friction).
  3. Added a power architecture (v0.1 had none): capacitor-buffered discharge.
  4. Added the v.2 "swing" mechanics note and a v.3 levitation feasibility
     screen with a recommendation.
  5. Defined the v.0 test rig and gate protocol so build can start.
  6. Added Consumer Use Case 02 (below and appended to the v0.1 doc §07).

--------------------------------------------------------------------------------
02 // MOTION BUDGET (FIRST-ORDER PHYSICS)
--------------------------------------------------------------------------------

Model: frictionless flight, launch from rest, g = 9.81 m/s². Efficiency
(electrical→kinetic) assumed 20% — a placeholder typical of small
voice-coil/impact actuators, NOT a measured value.

  v.0  m = 120 g
  ───────────────────────────────────────────────────────────────────────
  Motion                 Launch v    Kinetic E   Electrical E   Notes
  HOP, 10 mm rise        0.44 m/s    11.8 mJ     ~59 mJ         vertical
  LEAP, 40 mm @ 75°      0.89 m/s    47.1 mJ     ~235 mJ        apex ≈ 37 mm
                                                                (15° off vertical)

  v.1  m = 90 g, 150 mm single bound
  ───────────────────────────────────────────────────────────────────────
  Launch angle   v        Kinetic E   Apex     Min. friction μ (no slip)
  45°            1.21     66 mJ       37 mm    1.00
  51°            1.23     68 mJ       46 mm    0.81
  55°            1.25     71 mJ       54 mm    0.70
  60°            1.30     77 mJ       65 mm    0.58

Reading: a 150 mm bound needs only ~70 mJ of kinetic energy — about 1.5× the
v.0 leap. Long jump is an angle-and-traction problem, not an energy problem.
Do not spend v.1 effort on a bigger coil first.

--------------------------------------------------------------------------------
03 // SPEC CORRECTIONS TO v0.1
--------------------------------------------------------------------------------

  CORRECTION C-1 — EDGE MARGIN (SAFETY, BLOCKING)
    v0.1 §03: inhibit the actuator if a hop would land "within 20mm of a
    detected surface edge." But the LEAP displaces ~40 mm, has a ~37 mm apex,
    and lands with a vertical speed ≈0.86 m/s onto elastomer feet: it will
    bounce and slide. 20 mm margin is smaller than the nominal flight, so the
    gate would permit a leap that ends off the table.
    NEW RULE: inhibit LEAP/HOP-with-bias when ToF reports an edge within
    100 mm along the travel cone (≥ 2× nominal displacement, covering
    bounce/slide). Within 100 mm: substitute THE NUDGE or in-place HOP only
    (bias element disabled). Gate unchanged: 100/100 edge-approach trials.
    Also: ToF is forward-facing only in v0.1; a bias-off in-place hop can
    still yaw/skid. Add a second ToF (rear) to the v.0 BOM, or restrict
    v.0 gestures to forward-biased with a keep-out zone behind the cube.

  CORRECTION C-2 — LONG-JUMP LAUNCH ANGLE (v.1 DESIGN)
    A launch from friction with the surface needs horizontal impulse ≤ μ ×
    vertical impulse, i.e. launch angle α (from horizontal) with tan α ≥ 1/μ.
    A "classic" 45° bound needs μ ≥ 1.0 — not available on glass or
    laminate with generic elastomer. v0.1's v.1 target (>150 mm across wood,
    glass, laminate) is therefore unreachable at 45°.
    NEW RULE: v.1 targets launch ≥ 55° (μ ≥ 0.70) and a high-grip foot
    compound, trading range-per-joule for surface independence; the apex
    rises to ~54 mm, so the edge keep-out for LONG JUMP is ≥ 250 mm
    (150 mm range + bounce allowance). Measure μ per surface in the rig
    before fixing the angle.

  Retained from v0.1 without change: 45 mm cube, <120 g, voice-coil primary,
  piezo bias element, IMU righting pulse (>25° tip), Qi base, anti-feed
  motion-first language.

--------------------------------------------------------------------------------
04 // POWER ARCHITECTURE (NEW — NOT IN v0.1)
--------------------------------------------------------------------------------

  The LEAP needs ~235 mJ electrical in ~5 ms ⇒ ~47 W peak (≈12.7 A from a
  3.7 V cell). A coin/pouch cell sized for a 45 mm cube cannot source that.

  DESIGN:
    - 150 mAh Li-Po (≈2.0 kJ): ~8,500 LEAPs of energy; idle/radio draw, not
      actuation, sets battery life.
    - Supercapacitor / low-ESR capacitor bank, ≥ 19 mF at 5 V minimum
      (22 mF ≈ 275 mJ stored) charged slowly (≤ 200 mA) by a boost stage;
      the coil is discharged through a MOSFET H-bridge with current limit.
    - Recharge between gestures: 235 mJ at 200 mA·5 V (1 W) ≈ 0.25 s
      theoretical; allow 2 s minimum gesture spacing. Rate-limit the driver
      (e.g. max 6 LEAPs/min) — also an anti-annoyance guard.
    - Qi base: the pad is the dock; cube hops are only enabled while the
      battery is above a reserve level so a hop never strands a dead cube
      off the pad.
  RISK: cap-bank volume inside 45 mm³ envelope alongside coil, reaction mass
  and PCB. First-order stack: PCB 12 mm, coil+mass 18 mm, cap+cell 15 mm.
  Tight; shell thickness may need to drop below the nano-ceramic comfort
  range. Raise to 50 mm cube if the stack fails — decide at CAD, not now.

--------------------------------------------------------------------------------
05 // v.2 — HORIZONTAL SURFACE SWINGS (MECHANICS NOTE)
--------------------------------------------------------------------------------

  - Same friction constraint as C-2 applies to every step: horizontal
    thrust per step ≤ μ·N. Walking is slower but robust — design for many
    low-angle small hops (e.g. 20–30 mm steps) rather than one big bound.
  - Directional control: the v0.1 plan (two actuated traction pads out of
    phase) is retained. Cheaper v.1.5 alternative to test first: asymmetric
    feet (angled elastomer bristles, "bristlebot" principle) so a pure
    vertical vibration produces net drift; steering by selecting which
    bristle group contacts. Needs only the v.0 actuator plus a tuned
    frequency sweep (hypothesis, to be bench-tested).
  - Path sensing: IMU yaw integrates drift; add an optical-flow sensor (as
    in desktop mice) on the base for position-over-surface. Qi pad as
    absolute reference via a small coil-position beacon is a v.2 idea only.

--------------------------------------------------------------------------------
06 // v.3 — LEVITATION FEASIBILITY SCREEN
--------------------------------------------------------------------------------

  This is a screening from general physics and reference classes, not a
  literature review; verify before committing budget.

  (a) ACOUSTIC (ultrasonic phased array in the pad)
      Practical for light objects (beads/droplets, sub-gram to a few grams).
      A 90–120 g cube is orders of magnitude above that regime.
      VERDICT: not suitable for the cube-as-object. Keep only for a
      future ultra-light "mote" variant.
  (b) DIAMAGNETIC (pyrolytic graphite over magnet array)
      Works for light graphite platelets; useless for a 100 g electronic
      cube without cryogenics. VERDICT: reject.
  (c) ACTIVE ELECTROMAGNETIC SUSPENSION (feedback-controlled coils + Hall
      sensors, magnet in the cube)
      Commercially demonstrated class ("floating" display/globe products)
      at hundreds of grams over gaps of ~1–3 cm. Requires continuous
      control (kHz loop), holds the object in 1–2 axes with mechanical
      limits. VERDICT: the only credible v.3 candidate. Needs the cube's
      mass and magnet orientation designed in from v.1.
  Design implications for v.0–v.2 (free now): keep centre-of-mass at the
  geometric centre; reserve a 10×10×5 mm flat zone in the top face for a
  future magnet; keep the shell non-ferrous and non-conductive near the
  top face (eddy currents).
  v.3 remains a research track with no gate. Proposed first experiment:
  off-the-shelf maglev module + a 120 g dummy cube, measure stable
  payload and gap.

--------------------------------------------------------------------------------
07 // v.0 TEST RIG AND GATE PROTOCOL (BUILD CAN START)
--------------------------------------------------------------------------------

  RIG
    - Test table: 3 surfaces (wood, glass, laminate), levelled ±0.5°.
    - High-speed phone video (240 fps) from side + top, 10 mm gridded mat.
    - Cube logs IMU at ≥ 1 kHz on each gesture; export CSV.
    - Edge course: 1 straight and 1 corner edge, ToF validation targets.
  GATES (v.0 CLOSE)
    G1 500/500 hop-and-recover cycles, zero off-table, zero actuator faults.
    G2 100/100 edge-approach trials with NEW 100 mm rule (C-1).
    G3 Measured LEAP displacement 40 mm ±10 mm on all 3 surfaces.
    G4 Gesture distinguishability: 20 blind participants, ≥ 90% correct
       NUDGE vs HOP vs LEAP vs SETTLE identification (a notification
       language nobody can tell apart is not a language).
    G5 Noise ≤ 40 dBA at 0.5 m for NUDGE/SETTLE (so it can't wake or
       startle).
  PARTS (v.0 prototype, indicative)
    Voice-coil actuator, piezo bimorph, 6-axis IMU, 2× ToF, MCU with BLE,
    Qi receiver coil, 150 mAh Li-Po, 22 mF cap bank, H-bridge, 3D-printed
    shell (nano-ceramic is a v.0.5 production decision).

--------------------------------------------------------------------------------
08 // OPEN RISKS AND DECISIONS FOR S-2
--------------------------------------------------------------------------------

  R1 Packaging: 45 mm may not fit (§04). Decision needed at CAD.
  R2 Safety/regulatory: moving consumer electronics near children and pets,
     battery + capacitor discharge — needs a compliance review (UL/CE-class)
     before any external pilot. Not assessed here.
  R3 Efficiency assumption (20%) unverified; if real efficiency is ~5%,
     LEAP needs ~1 J: re-plan power stage.
  R4 Naming: keep CUBIQ™ distinct from COSMO® Cube (hardware computer).
  D1 Approve C-1 and C-2 as binding spec amendments?
  D2 Approve rear ToF in BOM?
  D3 Confirm Qi-pad-as-dock-only (no hop when off pad)?

--------------------------------------------------------------------------------
09 // CONSUMER USE CASES (CYCLE LOG — ONE NEW PER CYCLE)
--------------------------------------------------------------------------------

  USE CASE 01 — THE DESK MIGRATION                       (2026-07-28, v0.1)
    See LOT-CUBIQ-QUANTUM-CUBE-v0.md §07. Solo knowledge worker; memory
    question ready → NUDGE; session begins → LEAP toward keyboard.

  USE CASE 02 — THE TWIN NUDGE                           (2026-11-07, v0.2)
  ─────────────────────────────────────────────────────────────────
  Operator profile: two paired Usership-tier members — a parent travelling
  for work and a 9-year-old at home — each with a CUBIQ on a nightstand or
  homework desk. A consenting, parent-managed pair, no accounts to chat in,
  no content exchanged, no feed.

  Today: a travelling parent texts "thinking of you" and the message sinks
  under a hundred other notifications, or the child doesn't have (or
  shouldn't have) a phone at the table. Each end has either an interrupting
  buzz or nothing.

  With CUBIQ v.0 (cohort resonance ping, already a v0.1 trigger class):
  the parent presses and holds the top face of their cube for two seconds.
  At home, the child's cube performs THE NUDGE in the parent's signature
  cadence — three slow pulses, one fast — felt through the desk. The child
  places a hand on the cube; the hand-on-cube (IMU + touch) is returned to
  the parent as a single THE SETTLE, two seconds of steady pressure under
  the parent's palm. Nothing is typed, read, scrolled or stored; the
  exchange is a gesture and an acknowledgement, over in ten seconds.

  Why it works with only the v.0 primitive: it uses NUDGE and SETTLE
  (sub-threshold, no flight), so it is safe next to a sleeping child, makes
  no edge risk, and needs no travel. Cadence-as-identity encodes WHO sent it
  without a screen. It is the anti-feed thesis (LOT-CUBIQ-VISION §01)
  applied to a relationship instead of a task.

  Guardrails (design requirements, not features):
    - Quiet hours set by the child's guardian; the cube drops to
      SETTLE-only after bedtime and never LEAPs.
    - Pairing requires physical co-location (both cubes on the same pad for
      the initial bond) — no remote friend-requests.
    - Telemetry uses haptic preference class only (QI·46 §757), no content.
    - Rate limit: max 3 pings/hour per pair.
  Success signal for the pilot: reply-by-touch rate (child places hand on
  cube within 60 s), and parent-reported presence score, not engagement
  minutes.

  Backlog of candidate use cases for future cycles (not yet specified):
    03 Medication/ritual adherence nudge (sibling of LOT Medical Records /
       Lent-diet tracking);  04 Focus-timer companion that walks away from
    the keyboard at break time (v.2);  05 Kitchen-counter timer that leaps
    toward the cook when done (v.1);  06 Elder-care check-in presence
    (daily "good morning" settle);  07 Levitating status object (v.3).

--------------------------------------------------------------------------------
10 // NEXT CYCLE (03) PROPOSED SCOPE
--------------------------------------------------------------------------------

  - Bench evidence: assemble rig of §07, measure real μ on three surfaces
    and real voice-coil efficiency; replace the 20% assumption.
  - CAD packaging study at 45 mm vs 50 mm.
  - Firmware spec: gesture driver API (signal → gesture), rate limiter,
    quiet hours, bonded-pair protocol.
  - Add Use Case 03.

--------------------------------------------------------------------------------
Artifacts this cycle:
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.2-DEV-REPORT.md  (this file)
  docs/corporate/cubiq/cubiq_budget.py                      (motion/power model)
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md               (appended Use Case 02 + cycle log)
================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0.2-DEV-REPORT
================================================================================
