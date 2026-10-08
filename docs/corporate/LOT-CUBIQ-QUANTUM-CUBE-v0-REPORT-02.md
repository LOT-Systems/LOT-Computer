================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report, Cycle 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-08
VERSION:  0.2 — PHYSICS BUDGET, ARCHITECTURE DECISION, TEST PLAN
STATUS:   v.0 — PRE-HARDWARE. NO PROTOTYPE EXISTS. ALL NUMBERS BELOW ARE
          FIRST-ORDER ESTIMATES TO BE REPLACED BY BENCH MEASUREMENT.
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read in full before writing (nothing re-derived that is already on record):

  LOT-CUBIQ-QUANTUM-CUBE-v0.md (cycle 01, 2026-07-28) — the v.0 spec: 45 mm
    cube, <120 g, voice-coil hop + piezo bias, IMU recovery, ToF edge gate,
    four gestures (Nudge/Hop/Leap/Settle), roadmap v.0→v.3, Use Case 01.
  LOT-CUBIQ-VISION.md — anti-feed thesis; Section 05 physical products.
  LOT-CUBIQ-OPERATOR.md — Index of Systems, Phase 4 physical extension.
  LOT_QI46_ENGINE.md — haptic-preference telemetry (line 757), piezo /
    nano-ceramic corpus (line 110).
  CQGS-WHITE-PAPER-SNAPSHOT.md — "Quantum Cube Hardware: PLANNED".
  LOT-MANIFEST.md — COSMO® Cube is a separate track; no naming collision.

Cycle 01 produced the spec. Cycle 02 (this report) does what a spec cannot:
checks the physics, makes the architecture decision cycle 01 left open,
defines the build-and-test path, and adds Use Case 02.

--------------------------------------------------------------------------------
01 // FINDINGS FROM REVIEWING CYCLE 01
--------------------------------------------------------------------------------

F1. The gesture numbers are mutually consistent only at the edge of the
    stated range. A 40 mm Leap with a bias of 5–15° off vertical is only
    achievable at ~15°. Ballistic range R = v²·sin(2θ)/g (θ = launch angle
    from horizontal). At 15° off vertical (θ = 75°), R = 40 mm needs
    v ≈ 0.89 m/s and rises ≈ 37 mm. At 5° off vertical, the same launch
    energy would give ~2.5× the apex height and ~1/3 the range.
    → The Leap is a HIGH-BIAS gesture (≈15°). It rises ~37 mm, not <10 mm.
      "Hop" (<10 mm) and "Leap" (≈37 mm rise / 40 mm range) are different
      energy classes, ~4× apart. Spec amended in Section 03 below.

F2. A 15° bias needs horizontal impulse = tan(15°) ≈ 27% of vertical
    impulse. Feet must hold μ ≳ 0.3 or the cube slides instead of leaping.
    Four elastomer feet satisfy this on wood/laminate; glass and wet
    surfaces are the stress case (already in the v.1 gate; pull into v.0).

F3. "Reaction mass driven down against the base" (cycle 01 §03) is a
    ground-reaction hammer: the cube leaves the table only because the
    table pushes back. It works, but it is inelastic and peak-power hungry
    (Section 02). Architecture decision made in Section 03.

F4. The piezo bimorph "fires a millisecond after release to bias the leap".
    A bimorph strip produces micro-newton-to-newton forces at sub-mm
    stroke; a 15° bias needs ~0.03 N·s of horizontal impulse. A bimorph
    cannot supply that. → Demoted to SENSOR/ TRIM role in v.0 (contact
    timing, landing detection); bias is delivered mechanically by tilting
    the strike axis (Section 03). Piezo stays in the corpus-aligned role
    cycle 01 wanted, but as sensing, not propulsion.

F5. Edge gate is forward-facing only. Hop-in-place and the Nudge are safe
    anywhere; the Leap has a 40 mm range with ±landing scatter, so it is
    gated by edge distance AND by surface size (see Use Case 02).

--------------------------------------------------------------------------------
02 // PHYSICS BUDGET (FIRST-ORDER, m = 0.120 kg, g = 9.81 m/s²)
--------------------------------------------------------------------------------

  GESTURE        TARGET                     v_launch   KE_useful   notes
  ───────        ──────                     ────────   ─────────   ─────
  NUDGE          sub-threshold, no liftoff     —         <2 mJ     felt, not seen
  HOP            10 mm rise                  0.44 m/s    11.8 mJ   m·g·h
  LEAP           40 mm range @ 15° bias      0.89 m/s    47 mJ     rise ≈ 37 mm
  SETTLE         2 s standing pressure         —         <1 W·s    no motion

  Momentum needed for the Leap:  J = m·v = 0.120 × 0.886 ≈ 0.106 N·s
    vertical ≈ 0.103 N·s, horizontal ≈ 0.028 N·s.

  Hammer architecture (cycle 01): strike mass m_r = 40 g (⅓ of cube)
    required strike speed v_r ≈ 0.106 / 0.040 ≈ 2.7 m/s
    strike KE ≈ 141 mJ  → only ~33 % becomes flight energy (inelastic).
    over an 8 mm stroke: a ≈ 450 m/s² (~46 g), F ≈ 18 N on m_r,
    peak electrical power ≈ 20 W for ~6 ms.
  → A single Li-ion cell cannot deliver the peak without sag; a small
    supercapacitor / capacitor bank (≈ 0.3 J usable) charged between
    gestures is REQUIRED. Per-Leap energy from the cell ≈ 0.2–0.3 J.
  → A 150 mAh / 3.7 V cell holds ≈ 2 kJ ⇒ thousands of Leaps per charge.
    Battery is not the constraint; PEAK CURRENT and MASS are.

  Mass budget (target 118 g):
    shell (nano-ceramic composite) 28 g · strike mass 38 g · coil + guide
    14 g · cell + cap bank 17 g · PCB (MCU, IMU, ToF, Qi Rx) 12 g ·
    feet, fasteners, margin 9 g.   Strike mass is the lever — every gram
    moved from shell to strike mass raises Leap range.

--------------------------------------------------------------------------------
03 // ARCHITECTURE DECISION — A vs B
--------------------------------------------------------------------------------

  A. HAMMER (cycle 01 baseline): voice coil drives m_r into the base.
     + simplest, silent-ish, controllable amplitude (Nudge→Leap in one
       actuator), no latch.
     – 33 % efficient, 18 N / 20 W peak, audible "tick" on strike.
  B. SPRING-LATCH PUSH-OFF: a spring/leaf stack loaded slowly by a small
     motor or coil, released by a latch; a foot extends 5–6 mm and pushes
     off the table.
     + elastic ⇒ ~3× more efficient, low peak power, loadable on USB
       power. Proven in jumping-toy and insect-robot prior art.
     – needs a latch + motor (two moving systems), amplitude is discrete
       (hard to do a graded Nudge), more wear points.

  DECISION (v.0):  A, with B retained as the v.1 Long-Jump path.
  Rationale: v.0's job is the graded notification vocabulary (Nudge, Hop,
  Leap, Settle) from ONE actuator. A gives continuous amplitude control; B
  does not. The Leap at 40 mm is within A's reach with a cap bank. Distance
  (v.1, >150 mm needs ≈ 0.55 J launch energy ≈ 12× the v.0 Leap) is where
  hammer inefficiency stops being acceptable — that is the correct place
  to introduce a spring. Both share the shell, IMU, ToF, cap bank and
  driver, so no v.0 work is discarded.

  Bias mechanism: strike axis tilted 15° in the base frame (fixed, passive).
  Hop and Nudge use reduced amplitude; the Leap uses full amplitude on the
  same tilted axis. A passive axis means ZERO extra actuators for bias;
  directionality (steering) is deferred to v.2 yaw-torque work.

--------------------------------------------------------------------------------
04 // SENSING, SAFETY, FIRMWARE
--------------------------------------------------------------------------------

  Sensors: 6-axis IMU (landing detect, tilt, flight-time ⇒ measured rise
  h = g·t²/8), forward ToF (edge), piezo disc on base (contact/tap timing,
  surface classification by ring-down), Qi coil (also gives "on pad" state).

  Firmware state machine:
    IDLE → ARMED (cap bank charged, pad present)
         → GATE (edge distance ≥ 20 mm forward AND ≥ 60 mm all sides if
                 ToF array available; surface-size check; DND check)
         → ACTUATE (gesture profile) → LAND/RECOVER (IMU; ≤ 2 righting
           pulses) → LOG (rise, tilt, recovery count) → IDLE
  Refusal ladder when GATE fails: Leap → Hop → Nudge → silent LED-ring
  pulse + queued. The cube always degrades to LESS motion, never more.
  Hard stops: tilt > 25° after 2 pulses ⇒ lock and signal fault; free-fall
  detected off-surface ⇒ log + lock until user re-seats on pad.

  Signal path (cloud → cube): Index of Systems event → LOT cubic API →
  BLE (v.0) → gesture ID + intensity byte. The cube holds NO user content;
  a gesture is two bytes. Telemetry back (rise, recovery, ignored/felt via
  tap) feeds QI·46 "haptic preference" (QI46 line 757).

--------------------------------------------------------------------------------
05 // BUILD PLAN AND GATES
--------------------------------------------------------------------------------

  Stage 0 — BENCH ACTUATOR (wk 1–3): voice coil + 38 g strike mass on a
    force plate / 3-axis accelerometer rig. Output: measured impulse vs
    drive energy curve. GATE: ≥ 0.10 N·s repeatable (σ < 8 %).
  Stage 1 — LIFT TEST (wk 3–6): 3D-printed 45 mm shell, ballast to 120 g,
    tilted axis, no electronics beyond driver. High-speed video (≥ 240 fps).
    GATE: 20/20 Hop at 10 ± 3 mm; 15/20 Leap at 40 ± 15 mm.
  Stage 2 — SENSED CUBE (wk 6–10): IMU + ToF + cap bank + MCU on a rigid
    PCB. Landing recovery and edge gate live. GATE: 100/100 edge-approach
    trials with zero falls (cycle 01 hard gate, unchanged).
  Stage 3 — SURFACE MATRIX (wk 10–12): wood, laminate, glass, rubber mat,
    fabric desk pad. Record μ, range, scatter. Output: surface table used
    by v.1/v.2 friction model.
  Stage 4 — ENDURANCE (wk 12–16): 500/500 hop-and-recover, zero off-table
    landings, zero actuator failures (cycle 01 v.0 closing gate).
  Stage 5 — FIELD PILOT (wk 16+): 5 operators, 14 days, real Index signals.
    Metric: felt-rate (tap-ack within 60 s of Nudge) and unprompted removal
    rate (cube unplugged/hidden by user = failure signal).

  Verification not yet done: nothing above has been measured. Every figure
  in Section 02 should be treated as a hypothesis until Stage 0/1 data.

--------------------------------------------------------------------------------
06 // RISKS
--------------------------------------------------------------------------------

  R1 Peak power / sag ........ mitigated by cap bank (Stage 0 verifies).
  R2 Noise — strike "tick" is the main audible artifact; desk-borne
     vibration may be louder than the cube in the air. Needs soft strike
     pad and dB measurement; the anti-feed thesis fails if it is annoying.
  R3 Surface variance — μ 0.3 floor on glass/wet. Surface-ID by ring-down.
  R4 Consumer safety — moving object near cups, keyboards, children, pets.
     Leap limited to 40 mm, mass 120 g, KE 47 mJ (comparable to a dropped
     pen); no pinch points on shell; user can set Nudge-only mode.
  R5 Regulatory — Li-ion + inductive + BLE ⇒ UN38.3, FCC/CE, IEC 62368.
     Not started; required before any consumer shipment.
  R6 Levitation (v.3) — still research only. Order-of-magnitude note:
     acoustic levitation of a 120 g cube is far beyond demonstrated mm-
     scale, mg–g payload systems; active magnetic levitation of 120 g is
     feasible physics (EM array under a pad, closed-loop) but a large
     power / thermal / pad-thickness cost. Recommend a 10–20 g, 25 mm
     "CUBIQ mini" as the levitation test article rather than scaling the
     45 mm unit.

--------------------------------------------------------------------------------
07 // CONSUMER USE CASES (APPENDED PER CYCLE — SEE ALSO SPEC §07)
--------------------------------------------------------------------------------

  USE CASE 01 — THE DESK MIGRATION (2026-07-28). On record in the spec.

  USE CASE 02 — THE NIGHTSTAND, SILENT                          2026-10-08
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, shares a bedroom, night mode on,
  phone charges in another room by deliberate choice (anti-feed habit).
  The CUBIQ pad sits on a small nightstand.

  The operator's evening Assembly phase advances at 22:40 while their
  partner is already asleep. A phone buzz or chime would wake someone and
  re-open the feed. The cube's GATE runs: surface-size check reads a
  nightstand (≈ 250 mm, less than the 60 mm all-sides clearance would
  allow for a Leap), Do-Not-Disturb is set, ambient is dark. The refusal
  ladder drops Leap → Hop → Nudge, and since a Nudge on a nightstand would
  be heard by a light sleeper, it drops once more to THE SETTLE: the
  actuator holds light standing pressure for 2 s — a micro-warmth in the
  pad surface the operator feels only if their hand is resting on it, no
  sound and no light. Nothing happens in the room.

  In the morning, the operator lifts their hand off the nightstand and the
  cube performs a single Hop to say the phase advanced overnight. They tap
  it once (telemetry: acknowledged, ~7 h latency, logged as "morning
  receive" preference). QI·46 learns this operator wants bedtime events
  deferred to first-touch, not delivered at the time of the event.

  What this case proves about v.0: the cube's most valuable behavior is
  RESTRAINT. A notification device earns trust by knowing when to do less.
  The refusal ladder, surface-size gate and DND states (Section 04) are
  not safety add-ons; they are the product.

--------------------------------------------------------------------------------
08 // NEXT CYCLE (03) — PROPOSED
--------------------------------------------------------------------------------

  1. Stage 0 bench BOM and driver schematic (voice coil, H-bridge, cap bank).
  2. Noise budget and soft-strike pad study (R2).
  3. BLE gesture protocol v0 (2-byte frame) and a cubic-API stub in this
     repo so Index events can already map to gesture IDs in software.
  4. Use Case 03 (candidate: a pair of cubes on a shared desk, couples/
     co-workers, cohort resonance ping; or the child's-room/elder-care
     check-in case, which needs an even more conservative gate).
  5. Levitation test article spec (25 mm, 10–20 g).

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
================================================================================
