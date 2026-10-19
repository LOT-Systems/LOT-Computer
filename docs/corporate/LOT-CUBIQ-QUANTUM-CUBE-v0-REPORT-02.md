================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report, Cycle 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-19
VERSION:  0.2 — LAUNCH-PHYSICS CORRECTION + SAFETY-GATE RESIZE
STATUS:   v.0 — PRE-HARDWARE, DESIGN LOCK STILL PENDING (analytic only; no
          bench hardware has been built or measured in this cycle)
PARENT:   docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md (Cycle 01, 2026-07-28)
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing (this cycle):

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md   (Cycle 01 — my own prior work)
    Fixed the form (45 mm, <120 g), the four-gesture vocabulary, the roadmap
    v.0 → v.3, the edge-detection gate, and Use Case 01. Rule recorded in its
    Section 07: one new consumer use case per cycle, appended, never edited.
  docs/corporate/LOT-CUBIQ-VISION.md            (anti-feed thesis, physical arc)
  docs/corporate/LOT-CUBIQ-OPERATOR.md          (Index of Systems, Phase 4)
  docs/corporate/LOT_QI46_ENGINE.md             (piezo / nano-ceramic / haptic
                                                 telemetry loop, Month-12 cube)
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md   (Quantum Cube = PLANNED row)
  docs/benchmark/LOT-SR-20260621-01.md          (P79 evening-coherence-close,
                                                 Archetype 25, Job 18 @ 22:00 UTC)
  docs/benchmark/LOT-MANIFEST.md                (COSMO® Cube is a separate track)

LOT® Institute basis for this cycle: piezoelectric mechanics and nano-ceramic
shell (QI46), anti-feed thesis (VISION §01), Calibration Loop with haptic
telemetry (QI46 Month-12), and the P79/Job 18 diurnal-close signal that
already exists in production and gives the cube a real trigger to bind to.

Searched the repo for prior hardware work (cubiq / haptic / levitat): only the
two CUBIQ docs above and software-side "Quantum Cube" heartbeat references in
src/client (SystemProgressWidget, selfAssembly, About). No bench data, CAD,
firmware or BOM exists anywhere in the repo. This report does not pretend
otherwise.

--------------------------------------------------------------------------------
01 // HEADLINE: CYCLE 01 CONTAINED THREE PHYSICS ERRORS — CORRECTED HERE
--------------------------------------------------------------------------------

Re-deriving Cycle 01's numbers (m = 120 g, g = 9.81 m/s², ideal ballistic
flight, no air drag) shows its gesture table and safety gate are not
mutually consistent. None of this invalidates the architecture; it changes
what must be built.

  ERROR 1 — THE LEAP CANNOT BE <10 mm RISE AT 5–15° OFF VERTICAL
    Cycle 01: THE HOP <10 mm rise; THE LEAP ~40 mm displacement via a "5–15°
    off-vertical bias".
    Check:  range R = v² sin(2θ)/g, θ measured from horizontal.

      launch (from horizontal)  rise    launch energy   flight time
      ────────────────────────  ─────   ─────────────   ───────────
      85° (5° off vertical)     114 mm  136 mJ          305 ms
      80° (10° off vertical)     57 mm   69 mJ          215 ms
      75° (15° off vertical)     37 mm   47 mJ          174 ms
      45°                        10 mm   23.5 mJ          90 ms

    A 40 mm leap at the spec'd bias needs 37–114 mm of vertical rise — a cube
    leaping 4–11× its own height off a desk, 2–6× the energy. It is neither
    "quiet" nor "safe". CORRECTION: launch the LEAP at 45° (±5°). It then
    delivers 40 mm range with only ~10 mm rise and 23.5 mJ. Bonus: the same
    geometry scales to v.1 — 150 mm at 45° with a 90 g shell needs only
    66 mJ and 37 mm rise, i.e. the long jump is a ~3× energy step, not a new
    machine.

  ERROR 2 — A PIEZO BIMORPH CANNOT SUPPLY THE FORWARD BIAS
    Cycle 01 fired a piezo bimorph "a millisecond after release" to bias the
    leap. A bimorph of this size moves tens of micrometres and produces
    millinewtons — orders of magnitude short of the ~0.075 N·s impulse (at
    0.63 m/s, 120 g) a 45° leap needs. Lateral launch direction is set by the
    thrust vector, not by a late nudge.
    CORRECTION: cant the primary actuator axis in the shell. Use TWO fixed
    launch axes — 90° (vertical, for THE HOP) and 45° (for THE LEAP) — by
    mounting a second spring-latch stack or by a 2-position pivot cradle
    (v.0 baseline: two stacks; mechanically boring beats clever). Piezo stays
    in the design where it is strong: (a) a tilt/contact sensor on the feet and
    (b) micro-vibration for THE NUDGE — both consistent with the QI46 corpus.
    Friction check: at a 45° thrust the horizontal share of the ground reaction
    equals the vertical share, so the feet need a friction coefficient of
    about 1 or the cube slips during the thrust window (<5 ms) and range drops.
    Elastomer feet reach μ≈0.8–1.2 on wood/laminate but less on glass: measure
    range loss per surface in T2 before the gate.

--------------------------------------------------------------------------------
02 // REVISED v.0 ACTUATION — SPRING-LATCH, NOT DIRECT DRIVE
--------------------------------------------------------------------------------

Cycle 01 proposed a voice coil driving a reaction mass directly. Sizing it:

    23.5 mJ delivered over a 4 mm stroke = 5.9 N mean force; at the 69 mJ
    Cycle 01 implied, 17 N. Through a 45 mm cube coil with a 3.7 V cell that
    is a multi-amp, tens-of-ms pulse: heat, voltage sag, and a loud click.

REVISED PLAN (jumping-robot standard practice): a small gearmotor slowly
winds a spring through a cam/ratchet (≈1.6 s); a latch releases it in <2 ms.

    stored energy / launch      23.5 mJ (LEAP, 45°)   11.8 mJ (HOP, 10 mm)
    assumed end-to-end eff.     15 %  (to be measured; conservative)
    electrical cost / launch    ~157 mJ               ~78 mJ
    winding power               ~100 mW for ~1.6 s
    150 mAh / 3.7 V cell        ≈ 2 kJ  →  ≈ 12,700 leaps per charge budget
                                (idle, radio and IMU draw dominate in practice)

The voice coil is retained for THE NUDGE and THE SETTLE (small, continuous,
quiet) — the two gestures that need controllability, not impulse. This keeps
the Cycle 01 intent (quiet, controllable) where it matters.

  v.0 ARCHITECTURE (REVISED, FOR DESIGN LOCK)
    Shell:       45 mm nano-ceramic, <120 g, matte LOT® black   (unchanged)
    Impulse:     2× spring-latch launchers, 90° and 45° axes
    Quiet:       1× voice coil, no-liftoff gestures
    Sense:       6-axis IMU @ centre · 3–4× ToF (fwd, ±45°) · piezo foot
                 contact · lux sensor (used by Use Case 02)
    Power:       ~150 mAh Li-poly, Qi receiver in base face   (unchanged)
    Radio:       BLE to the user's device / hub; no screen, LED ring only for
                 pairing and charge                            (unchanged)
    Fail-safe:   any sensor fault, low battery (<20 %), un-level (>10° at
                 rest) or no clear ToF → no liftoff; NUDGE/SETTLE only.

--------------------------------------------------------------------------------
03 // FIRMWARE STATE MACHINE (v.0, PROPOSED)
--------------------------------------------------------------------------------

    IDLE ──signal──▶ POLICY ──▶ ARM ──▶ CHECK ──▶ FIRE ──▶ LAND ──▶ RECOVER ─┐
      ▲                │  deny           │ fail                              │
      │                ▼                 ▼                                   │
      │            QUIET-ONLY ◀──── INHIBIT (shudder, log)                   │
      └──────────────────────────────────────────────────────────────────────┘

  POLICY   Maps Index-of-Systems signal → gesture, then applies hard limits:
           quiet hours, lux below threshold (dark room), cube face-down
           (operator "sleep" gesture), battery, and one-attempt-per-signal.
  CHECK    ToF edge scan + IMU level + surface-contact. Fail-closed.
  LAND     IMU detects impact, attitude. >25° tilt → RECOVER micro-pulse.
  Log      Every event (gesture, inhibit reason, landing attitude, pickup) is
           emitted as telemetry for the QI46 Calibration Loop.

  Anti-feed rule: ONE attempt per signal. No repeats, no escalation, no badge
  count. An unanswered signal stays in the Index, not on the desk.

--------------------------------------------------------------------------------
04 // TEST PLAN AND GATES
--------------------------------------------------------------------------------

  T0  Bench, 1 launcher, load cell + high-speed phone video: confirm energy
      (target 23.5 mJ ±20 %), launch angle (45° ±5°), latch time (<2 ms).
  T1  Drop/land 500×: attitude at rest, tip-over rate, shell damage.
  T2  Dispersion: 100 LEAPs × 3 surfaces → measure σ; resize INHIBIT = 40 +
      3σ + 20 mm if σ ≠ 8 mm. (Assumption from §01 Error 3.)
  T3  Safety: 100/100 edge-approach trials, from 6 headings, zero off-table.
      Blocked ToF, dropped ToF, covered ToF each → fail-closed.
  T4  Acoustic: NUDGE/SETTLE ≤ 25 dBA at 1 m (bedside use); HOP/LEAP landing
      ≤ 45 dBA at 1 m on wood with elastomer feet.
  T5  Thermal/battery: 24 h duty cycle, 20 events/day, <35 °C case surface.
  Gate to close v.0: Cycle 01's 500/500 hop-and-recover with zero off-table
  landings, plus T2/T3/T4 passing. v.1 begins only after.

--------------------------------------------------------------------------------
05 // CONSUMER USE CASE 02 — THE EVENING CLOSE                    2026-10-19
--------------------------------------------------------------------------------

  Operator profile: Usership tier, Archetype 25 "Diurnal Operator", phone
  charges in the hallway, not the bedroom. The cube lives on the nightstand,
  on its Qi pad, 15 cm from the bed edge.

  Signal source: P79 evening-coherence-close / Job 18 (22:00 UTC, user-local
  mapping at the hub) already detects a day that opened with an intention and
  closed with a reflection. Until now the operator learned this only on a
  screen — the very thing they are trying not to touch before sleep.

  The evening, with CUBIQ hardware v.0:
    22:00  If the day's arc is complete (morning signal + an evening journal,
           memory or note), the cube performs THE SETTLE — two seconds of
           standing pressure, no movement, no light. The operator, reading
           a paper book, feels the faint steady pulse through the nightstand
           and recognises it: the day is closed. They do nothing.
    22:00  If the arc is open (morning intention present, no evening capture),
           the cube performs ONE THE NUDGE — a sub-threshold tremor. Never
           repeated. The operator can answer in the cubic, or not. The cube
           will not ask again tonight.
    Night rules (the new engineering this use case forces):
      • No HOP or LEAP at night. Ever. A nightstand has an edge 15 cm away, a
        sleeping person, and a glass of water; liftoff is disabled by POLICY
        when lux is low or local time is in quiet hours.
      • Pick up the cube and set it down on its face: the cube sleeps (no
        signals until it is turned upright). This is the physical equivalent
        of "do not disturb" and needs no app, no screen.
      • Pickup detected by IMU is logged as an acknowledgement signal
        (haptic-preference telemetry, QI46 line 757) — the loop closes
        without the operator tapping a thing.
    Outcome targeted: the operator's last interaction of the day is with an
    object, not a feed. The cube's whole message is one of two states — "the
    day is closed" or "one question is left" — delivered by touch.

  Why this use case matters for the product: it is the first one that
  constrains the cube. The Desk Migration (Use Case 01) shows what the cube
  CAN do; the Evening Close shows what it must REFUSE to do, and therefore
  specifies the POLICY layer and the lux sensor that every later gesture
  inherits.

--------------------------------------------------------------------------------
06 // ROADMAP DELTA
--------------------------------------------------------------------------------

  v.0  Two launchers (90°/45°) + voice coil + 3–4 ToF + lux + POLICY layer.
       Closes on T0–T5.
  v.1  Long jump: re-use the 45° launcher, 90 g target, ~66 mJ spring, 150 mm
       at 45°. The v.1 step is spring and mass, not a new mechanism.
  v.2  Table-walking: with 45° launch already in v.0, a "swing" is a chained
       sequence of short 45° leaps with yaw trimmed by the feet — evaluate
       this cheaper path before adding actuated traction pads (Cycle 01).
  v.3  Levitation: unchanged — research only. NOTE: acoustic levitation
       payload is limited (ultrasonic arrays hold beads/droplets, not
       120 g solids); active magnetic levitation of a 120 g cube over a
       table-embedded coil array is the engineering-plausible track and
       sets a mass/magnet budget to carry from v.0. No mechanism committed.

--------------------------------------------------------------------------------
07 // OPEN QUESTIONS FOR S-2
--------------------------------------------------------------------------------

  1. Approve the correction in §01 (45° LEAP, two launchers, 85 mm inhibit) as
     the v.0 design basis? It supersedes Cycle 01 §03 where they conflict.
  2. Commission T0 (single-launcher bench test) — this needs real hardware;
     nothing in this document is measured.
  3. Which surface set for T2: wood, glass, laminate (as in v.1 gate) or add
     stone/fabric desk mats?
  4. Is user-local quiet-hours mapping acceptable on the hub, given Job 18 is
     scheduled in UTC?

--------------------------------------------------------------------------------
08 // HONESTY STATEMENT
--------------------------------------------------------------------------------

All numbers are first-principles estimates (ideal ballistics, no drag, assumed
15 % efficiency, assumed σ = 8 mm). They size the design; they do not prove
it. The only validated thing in the LOT® CUBIQ™ hardware track today is that
the analysis in Cycle 01 had errors worth finding before money was spent.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
================================================================================
