================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-R02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report R02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-10
VERSION:  0.2 — PHYSICS-VALIDATED ARCHITECTURE REVISION
STATUS:   v.0 — PRE-HARDWARE · DESIGN LOCK STILL PENDING (see §09)
PREDECESSOR: LOT-CUBIQ-QUANTUM-CUBE-v0.md (v0.1, 2026-07-28)
================================================================================

R02 is the second development cycle of the v.0 actuated haptic notification
device. R01 (the v0.1 spec) fixed the product shape. R02 puts numbers under
it. The headline: the v0.1 mechanism holds for HOP and NUDGE but does NOT
hold for LEAP, and the launch-angle choice taxes every later tier. Both are
fixable on paper now, cheaply, before any metal is cut.

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read in full or in the cited sections before writing this report:

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md      (own prior work, R01)
    Sections 01-08. Carried forward unchanged: form (45 mm, <120 g), four-
    gesture language, QI·46 loop, v.0→v.3 roadmap, Use Case 01. This report
    amends §03 (actuation) and §06 (gates); it does not delete either.
  docs/corporate/LOT-CUBIQ-VISION.md                (§01 anti-feed thesis,
    §05 "Physical Products: The Inevitable Step")
  docs/corporate/LOT-CUBIQ-OPERATOR.md              (§03 Index of Systems,
    §04 AI-driven physical delivery, §07 Phase 4 physical extension)
  docs/corporate/LOT_QI46_ENGINE.md                 (line ~110 corpus: piezo,
    nano-ceramic, haptic language; Step 3.3 Month-12 Quantum Cube sync,
    signals: haptic preference / usage frequency / biofield response)
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md       (Quantum Cube Hardware row,
    PLANNED; psychotronic-sensor register)
  docs/corporate/LOT_ROBOTICS_COSMO.md              (sibling COSMO® track —
    kept naming-separate; CUBIQ™ is a notification body, not a computer)
  docs/benchmark/LOT-MANIFEST.md · LOT-LEDGER.md    (COSMO® Cube hardware
    v1.0 entry; "Quantum Cube heartbeat" software entries 2026-05-03/04)
  docs/LOT-SR-20260805-01.md                        (latest session report;
    format and discipline reference)

Not found in repo: any prior jump, locomotion or levitation analysis. The
numbers below are the first on record. Reproduce them with:
    python3 -I scripts/cubiq-ballistics.py

--------------------------------------------------------------------------------
01 // WHAT CHANGED IN R02
--------------------------------------------------------------------------------

  F1  LEAP exceeds a voice-coil's honest reach.            (§03)  AMEND §03
  F2  Launch angle 5-15° off vertical is energy-wasteful.  (§04)  AMEND §03/§06
  F3  Nightstand/shelf geometry makes the edge gate the    (§05)  NEW RULE
      dominant constraint on which gestures may fire.
  F4  Acoustic levitation is not viable at cube mass.      (§07)  AMEND §06 v.3
  F5  Energy per gesture is trivial; thermal & noise,      (§06)  NEW BUDGETS
      not battery, are the real limits.
  F6  Use Case 02 added (§10).

--------------------------------------------------------------------------------
02 // METHOD AND ASSUMPTIONS
--------------------------------------------------------------------------------

Point-mass ballistics on level ground, no drag, rigid contact. Real losses
(contact friction on the base, shell/foot compliance, spring hysteresis) only
push required energy UP, so every figure below is a floor, not an estimate.
All values come from scripts/cubiq-ballistics.py. g = 9.81 m/s².

Shell mass is the R01 target: 120 g (v.0), 90 g (v.1).

--------------------------------------------------------------------------------
03 // F1 — ACTUATION: THE VOICE COIL CARRIES HOP, NOT LEAP
--------------------------------------------------------------------------------

  GESTURE              KE REQUIRED   LAUNCH SPEED   IMPULSE
  ──────────────────   ───────────   ────────────   ─────────
  HOP (10 mm rise)        11.8 mJ       0.44 m/s    0.053 N·s
  LEAP (40 mm, 80°)       68.8 mJ       1.07 m/s    0.129 N·s
  LEAP (40 mm, 75°)       47.1 mJ       0.89 m/s    0.106 N·s
  LEAP (40 mm, 45°)       23.5 mJ       0.63 m/s    0.075 N·s

Mean force a single actuator must hold across its stroke (E / stroke):

  STROKE    HOP        LEAP @ 80°
  3 mm      3.9 N      22.9 N  (19.5 × shell weight)
  5 mm      2.4 N      13.8 N  (11.7 ×)
  8 mm      1.5 N       8.6 N  ( 7.3 ×)

A voice coil that fits inside a 45 mm cube alongside a battery, IMU, ToF
sensor, Qi receiver and a piezo bimorph realistically has a few millimetres
of stroke and single-digit newtons of continuous-duty force. HOP sits inside
that. LEAP at R01's geometry sits well outside it. (Engineering judgment,
to be confirmed by the §08 bench test — not a measured fact.)

  R02 DECISION — HYBRID DRIVE
    Split energy storage from energy release:
      · A preloaded leaf/coil spring stores the leap energy (~70 mJ is a
        small spring), cocked slowly by a low-power motor or by the voice
        coil itself over many small strokes between gestures.
      · A latch released by the voice coil (milliwatt-class trigger) fires
        the spring. Release time sets the impulse shape.
      · The voice coil alone still performs NUDGE (sub-threshold), SETTLE
        (standing pressure) and HOP (11.8 mJ), the quiet gestures that
        make up most of a day's traffic.
    Consequence: LEAP/JUMP become spring-latch gestures. The latch-and-spring
    module is the SAME module v.1 enlarges for the long jump, so v.0 now
    de-risks v.1 instead of being a dead end. Cocking time is a new
    user-visible constraint: a LEAP is not available again for ~3-5 s.

--------------------------------------------------------------------------------
04 // F2 — LAUNCH ANGLE: WHY "MOSTLY VERTICAL" IS EXPENSIVE
--------------------------------------------------------------------------------

R01 biased the hop only 5-15° off vertical via a piezo bimorph. For a fixed
horizontal displacement that is the costliest possible trajectory:

  v.0, 120 g, 40 mm displacement
     80° launch :  68.8 mJ   rise 56.7 mm   flight 215 ms
     75° launch :  47.1 mJ   rise 37.3 mm   flight 174 ms
     45° launch :  23.5 mJ   rise 10.0 mm   flight  90 ms

  v.1, 90 g, long jump
     150 mm @ 45° :  66.2 mJ   rise 37.5 mm   flight 175 ms
     150 mm @ 55° :  70.5 mJ   rise 53.6 mm
     150 mm @ 65° :  86.4 mJ   rise 80.4 mm
     200 mm @ 45° :  88.3 mJ   rise 50.0 mm

Reading the table:
  · A 150 mm v.1 jump at 45° costs about the same energy (66 mJ) as the R01
    40 mm LEAP at 80° (69 mJ). The long jump is not a bigger energy problem
    than the leap; it is the same problem aimed differently.
  · A 57 mm-high arc for a 40 mm move is a visible jump, not a "presence
    without spectacle" gesture. A low ~10 mm arc over 40 mm (45° launch) is
    quieter, cheaper (23.5 mJ) and lands softer.
  · Touchdown at 80° launch: 1.05 m/s vertical, equal to a 57 mm drop onto
    the shell — fine for a nano-ceramic composite shell, but it is the load
    case the elastomer feet and shell edges must be tested against.

  R02 DECISION — TWO LAUNCH PROFILES
    PROFILE LOW   (≈45°)  : LEAP, JUMP, and all directed gestures.
    PROFILE HIGH  (≈85-90°): HOP, in-place gestures near edges.
    The piezo bimorph is retained as a fine trim on the angle (±5°), not as
    the sole source of forward bias. The mechanical angle is set by the foot
    geometry/latch axis, which is a locked-at-design-time decision (§09).

--------------------------------------------------------------------------------
05 // F3 — THE EDGE GATE RULES THE GESTURE SET
--------------------------------------------------------------------------------

R01 requires the cube to refuse any hop landing within 20 mm of an edge.
A nightstand, shelf, or monitor stand is often narrower than 150 mm. With a
45 mm cube, a 20 mm margin on each side and a 40 mm LEAP, the minimum
usable flat is about 45 + 20 + 40 + 20 = 125 mm in the leap direction.
Under that, LEAP is inhibited. Under ~85 mm, HOP is inhibited too (cube +
two margins), leaving NUDGE and SETTLE only.

  R02 NEW RULE — GESTURE DEGRADATION LADDER (fail quiet, never fail forward)
    Surface ≥125 mm free ahead : LEAP permitted
    Surface  85-125 mm         : HOP permitted, LEAP downgraded to HOP
    Surface  <85 mm / unknown  : NUDGE or SETTLE only
    ToF reading invalid/saturated (glass, glossy, dark) : treat as <85 mm
    Cube tilted >10° at rest   : no ballistic gesture at all
  A cube that cannot see the edge behaves as if the edge is under it.

  Added gate (in addition to R01's 100/100 edge trials): the ToF must be
  tested on the §08 surface set INCLUDING glass and black matte laminate,
  the two surfaces most likely to blind a time-of-flight sensor.

--------------------------------------------------------------------------------
06 // F5 — BUDGETS: ENERGY, THERMAL, NOISE
--------------------------------------------------------------------------------

  ENERGY  (300 mAh, 3.7 V cell = 4,000 J)
    Wall-plug-to-kinetic efficiency   J per LEAP    LEAPs per full cell
    5 %                                  1.38 J         ~2,900
    10 %                                 0.69 J         ~5,800
    20 %                                 0.34 J        ~11,600
  Battery life is NOT the constraint at any plausible efficiency. At 20
  gestures a day the cell is not the limiting component. Sensing duty cycle
  (IMU + ToF + radio) will dominate energy use; budget that in firmware.

  THERMAL  Repeated spring cocking and coil drive heat a 120 g closed shell
  with poor airflow. Proposed duty cap: ≤1 LEAP per 5 s, ≤12 LEAP/hour, with
  a shell-temperature cutout. To be measured, not assumed.

  NOISE  The landing thump is the loudest event. Proposed quiet-hours rule:
  between operator-defined hours, only NUDGE and SETTLE are permitted
  regardless of surface (see Use Case 02).

--------------------------------------------------------------------------------
07 // F4 — LEVITATION (v.3) — NARROWED
--------------------------------------------------------------------------------

Static load to defeat: 1.18 N (120 g) or 0.88 N (90 g).

  (a) ACOUSTIC (R01 candidate)  — NOT VIABLE at cube mass.
      Acoustic standing-wave traps hold objects far smaller and lighter than
      a 45 mm, 90-120 g body; the radiation force available from a table-top
      ultrasonic array is orders of magnitude under 1 N over a cube-scale
      face. Acoustic levitation is retained only as a possible companion
      object (a light "mote"), not as the CUBIQ™ levitation route.
      (Engineering judgment from the acoustic-radiation-force scale; a
      literature check is a v.3 pre-work item, not done here.)
  (b) DIAMAGNETIC (R01 candidate)  — NOT VIABLE alone. Passive diamagnetic
      lift at useful gaps handles only very light payloads; it cannot carry
      this mass.
  (c) ACTIVE MAGNETIC (revised front-runner) — a permanent magnet in the
      cube, an electromagnet array under the Qi pad, hall-sensor feedback at
      kHz rate. Earnshaw's theorem forbids a purely passive stable static
      trap, so this is a servo problem. Plausible, power-hungry at
      watt-class, and the pad becomes both charger and lifter.
  v.3 stays a research track with no build gate. R02 only narrows the field
  so v.0-v.2 mass and magnet-clearance decisions point at (c): reserve a
  magnet volume in the base, keep ferrous parts away from it, and keep the
  Qi coil compatible with an electromagnet array underneath.

--------------------------------------------------------------------------------
08 // v.0 VALIDATION PLAN (REVISED GATES)
--------------------------------------------------------------------------------

  Bench tests, ordered. Each blocks the next.
  B1  Voice-coil force/stroke curve vs. §03 table. PASS: ≥2.4 N mean over 5 mm.
  B2  HOP: 10 ±3 mm rise, 100 trials, 3 surfaces (wood, glass, laminate).
  B3  Latch/spring module: 47-69 mJ delivered ±15 %, 200 cycles, no creep.
  B4  LEAP @ ~45°: 40 ±10 mm displacement, 100 trials, 3 surfaces.
  B5  Landing recovery: 100/100 righted after forced 25°+ tip.
  B6  Edge gate: 100/100 on wood, 100/100 on glass, 100/100 on matte black
      laminate, plus ToF-blind case defaulting to quiet gestures.
  B7  NUDGE felt-threshold: panel of 10 users, desk contact, 80-250 Hz band;
      gesture must be perceived through the desk and not heard at 1 m.
  B8  Thermal: 12 LEAP/hour for 4 h, shell ≤ 41 °C at touch surfaces.
  CLOSE v.0: R01's 500/500 hop-and-recover gate retained, run AFTER B1-B8.

--------------------------------------------------------------------------------
09 // OPEN DECISIONS FOR S-2 (DESIGN LOCK BLOCKERS)
--------------------------------------------------------------------------------

  D1  Approve HYBRID DRIVE (voice coil + spring-latch) — §03.
  D2  Approve two launch profiles and a mechanical ~45° LEAP axis — §04.
  D3  Approve the gesture degradation ladder as a hard rule — §05.
  D4  Approve narrowing v.3 research to active magnetic — §07.
  D5  Approve quiet-hours restriction to NUDGE/SETTLE — §06.
  Nothing is built until D1 and D2 are answered; they set the mechanical
  envelope. No hardware is claimed to exist. Everything here is analysis.

--------------------------------------------------------------------------------
10 // CONSUMER USE CASE 02 — THE BEDSIDE SETTLE
--------------------------------------------------------------------------------

(Appended to LOT-CUBIQ-QUANTUM-CUBE-v0.md §07 under the same rule: one new
use case per cycle, prior entries never edited.)

  Operator profile: Usership tier, evening routine already in the Index of
  Systems, phone charged in another room by choice. The CUBIQ™ pad sits on a
  100 mm-wide nightstand. A screen-free, light-free object is wanted because
  any lit notification on a bedside table is the thing the operator is
  trying to remove from their night.

  The cube cannot LEAP here (§05: the surface is under 125 mm). The
  degradation ladder is therefore not a limitation but the product: on this
  surface the cube's whole vocabulary is NUDGE and SETTLE, the two gestures
  that do not need space and make no landing noise.

  21:30 — the Index reaches the operator's wind-down phase. The cube does
  one SETTLE: a two-second standing pressure the operator feels if a hand is
  resting on the nightstand, and otherwise does not notice at all. No light.
  No sound. Nothing to dismiss.
  21:45 — operator sets the phone down elsewhere and reads. The cube is
  silent; quiet hours (§06) forbid every ballistic gesture after this point.
  06:50 — a Memory Engine question is ready and the operator is awake,
  because their own alarm has gone. A single NUDGE through the nightstand.
  They answer it with coffee; the cube never moved.

  What this case proves that Use Case 01 did not: the cube is as valuable
  when it refuses to jump as when it jumps. The safety gate, the quiet-hours
  rule and the degradation ladder together make a device that is safe to
  leave beside a sleeping person. It also gives the QI·46 loop its first
  night-time haptic signal: whether the operator acknowledges a SETTLE
  (hand on the nightstand) or ignores it is a usable "haptic preference"
  data point (QI46 Step 3.3) with no screen interaction involved.

  Forward note: at v.2, the same operator could allow a single slow
  directed swing toward the hand on waking, only when ToF confirms ≥125 mm
  of clear surface. On this nightstand it never will. That is correct.

--------------------------------------------------------------------------------
11 // BRAND AND POSITIONING NOTE
--------------------------------------------------------------------------------

LOT® Quantum Cube · CUBIQ™ · LOT®† CUBIQ® — unchanged from R01 §08.
CUBIQ™ stays distinct from the COSMO® Cube (general-purpose hardware
computer, Kuzya's line). No shared component naming.

--------------------------------------------------------------------------------
12 // NEXT CYCLE (R03) PROPOSED SCOPE
--------------------------------------------------------------------------------

  · BOM v0.1 with candidate parts for voice coil, latch, bimorph, IMU, ToF.
  · Firmware state machine: IDLE → ARMED → COCKING → FIRE → SETTLED →
    RECOVER, with the §05 ladder as the guard on FIRE.
  · Hardware-driver message schema from the Index of Systems to the cube.
  · Use Case 03 (to be chosen next cycle; candidate: shared household / the
    cohort resonance ping on a common table).

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-R02
================================================================================
