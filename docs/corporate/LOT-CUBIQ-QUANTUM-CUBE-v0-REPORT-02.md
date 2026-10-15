================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-15
VERSION:  0.2 — ENERGY BUDGET, ACTUATOR RE-CHECK, USE CASE 02
STATUS:   v.0 — PRE-HARDWARE. ANALYSIS AND SPEC CORRECTION. NO PHYSICAL UNIT
          EXISTS YET. NOTHING IN THIS REPORT IS A MEASUREMENT.
================================================================================

Companion to: docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md (Report 01, the
master spec, dated 2026-07-28). Report 01 is not edited here except for the
append-only Use Case entry in its Section 07. Where this report corrects
Report 01, the correction is stated explicitly in Section 03 and carried
forward as a proposed spec amendment for S-2 approval — it is not silently
applied.

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read in full for this cycle:

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md   (own prior work, Report 01)
    Four-gesture vocabulary, 45mm / <120g reference body, single
    voice-coil actuator + piezo bias, IMU landing recovery, ToF edge gate,
    v.0→v.3 roadmap, Use Case 01 "The Desk Migration."
  docs/corporate/LOT-CUBIQ-VISION.md
    Section 05: physical products as "the completion of the cubic."
  docs/corporate/LOT-CUBIQ-OPERATOR.md
    Operator Index of Systems (signal source); Phase 4 physical extension.
  docs/corporate/LOT_QI46_ENGINE.md
    Cube as Month-12 input device (haptic preference telemetry); Institute
    corpus includes the Quantum Cube white paper (line ~311); piezoelectric
    / nano-ceramic material line (line ~110).
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md
    "Quantum Cube Hardware — PLANNED" row; institute.lot-systems.com.
  docs/corporate/LOT_ROBOTICS_COSMO.md
    COSMO® robotics lineage; "a unit without a verified LOT profile does
    not activate" — adopted below as the pairing rule for CUBIQ™.
  docs/benchmark/LOT-MANIFEST.md
    Heartbeat / Quantum Cube software entries (2026-05-03/04); confirms
    COSMO® Cube is a separate computer-class track.
  git history (HEAD 98971f2): platform now at QIE v113 with circadian
    signal engine (P143 circadian-signal-lock, Arch49 Circadian Master).
    This is new since Report 01 and gives the cube a second, richer signal
    source used in Use Case 02.

Not available: the original Institute Quantum Cube white paper PDF
(institute.lot-systems.com). It is referenced by the corpus but is not in
this repository. The "base on LOT® Institute work" requirement is therefore
met through the Institute material that IS in the repo (QI46 + CQGS
snapshots). Action item A-1 below: S-2 to drop the Institute white paper into
docs/corporate/ so Report 03 can cite it directly.

--------------------------------------------------------------------------------
01 // WHAT THIS CYCLE DID
--------------------------------------------------------------------------------

Report 01 locked architecture and vocabulary. Report 02 does the first
numerical check on that architecture, because the roadmap (hop → long jump →
surface swing → levitation) lives or dies on one number: how much energy the
actuator must put into a 120g body, and whether a single voice-coil can
deliver it inside a 45mm cube.

Result, in one line: the gesture vocabulary survives, but two statements in
Report 01 Section 03 do not — the 5–15° launch bias for THE LEAP, and the
voice-coil as sole energy source. Both are corrected below.

--------------------------------------------------------------------------------
02 // BALLISTICS — WHAT EACH GESTURE COSTS
--------------------------------------------------------------------------------

Method: ideal projectile on a flat surface, no air drag, no spin, launch and
landing at the same height. R = v²·sin(2θ)/g ; KE = ½mv² ; apex =
v²·sin²θ/(2g). g = 9.81 m/s². These are lower bounds on the energy that
must leave the actuator as kinetic energy of the shell. Real units lose
more (see Section 03). Mass is the Report 01 targets: 120g (v.0), 90g (v.1).

  GESTURE / TARGET                  θ(from horiz)   v       KE      APEX
  ───────────────────────────────   ─────────────   ─────   ─────   ─────
  THE HOP, 10mm rise, in place      90°             0.44    11.8 mJ 10.0 mm
  THE LEAP, 40mm, 45° launch        45°             0.63    23.5 mJ 10.0 mm
  THE LEAP, 40mm, 75° (15° bias)    75°             0.89    47.1 mJ 37.3 mm
  THE LEAP, 40mm, 85° (5° bias)     85°             1.50   135.6 mJ 114 mm
  v.1 LONG JUMP, 150mm, 45°, 90g    45°             1.21    66.2 mJ 37.5 mm
  v.1 LONG JUMP, 150mm, 30°, 90g    30°             1.30    76.5 mJ 21.7 mm
  v.1 LONG JUMP, 150mm, 20°, 90g    20°             1.51   103.0 mJ 13.6 mm

FINDING 1 — THE 5–15° BIAS IN REPORT 01 IS WRONG FOR THE LEAP.
  Report 01 specified a piezo bias of 5–15° off VERTICAL for a ~40mm
  displacement. At 15° off vertical the cube must rise 37mm and costs 4× the
  energy of a 45° launch; at 5° it rises 114mm (a quarter of its own height
  ×2.5) and costs nearly 6×. That is not "presence without spectacle" — it is
  a cube launching itself two cube-heights into the air at a desk edge.
  A 40mm displacement is cheapest and gentlest at ~45° from horizontal.
  PROPOSED AMENDMENT (for S-2): THE HOP keeps ~vertical launch (5–15° off
  vertical is fine at 10mm rise). THE LEAP is redefined as a 45° launch,
  ~10mm apex, ~40mm travel. Same piezo bias element, different angle and
  timing, ~2× less energy than the Report 01 reading.

FINDING 2 — THE LONG JUMP IS AN ENERGY-CHEAP, ANGLE-HARD PROBLEM.
  150mm needs only ~66–76 mJ at 30–45°. Energy is not the long-jump blocker;
  controlling launch angle and landing attitude on three surface types is.
  v.1 gate (Report 01: 150mm, 9/10 trials, three surfaces) stands, but the
  v.1 risk register should list "launch-angle repeatability" ahead of
  "stroke length."

--------------------------------------------------------------------------------
03 // ACTUATOR RE-CHECK — VOICE COIL VS. STORED-SPRING LATCH
--------------------------------------------------------------------------------

Report 01 chose a voice-coil driving a spring-loaded reaction mass. The
energy numbers above expose a power problem the report did not examine.

  Required work from the actuator for THE LEAP (45°): ≥ 23.5 mJ delivered to
  the shell. With realistic losses (foot slip, elastic losses, reaction-mass
  coupling, 30–50% transfer efficiency — an ASSUMPTION, to be measured) the
  actuator must release ~50–80 mJ in about 2–5 ms.
  Impulse power: 50 mJ / 3 ms ≈ 17 W peak. For a ~5mm stroke that is an
  average force of ~10 N held across the stroke.
  A voice-coil that fits inside a 45mm / 120g cube typically produces peak
  forces of a few newtons (assumption — no datasheet selected yet; verify
  against candidate parts). Direct-drive from a coil is marginal for THE
  LEAP and not credible for the v.1 long jump at 66–103 mJ.

  RECOMMENDATION (carried to v.0 design lock):
    Decouple energy storage from energy release.
      1. A small motor or the voice-coil itself compresses a spring slowly
         (hundreds of ms, tens of mW — battery- and noise-friendly).
      2. A low-force latch (small solenoid, SMA wire, or piezo trigger —
         the piezo is already in the BOM) releases the spring.
      3. Piezo bias element retained for launch-angle trim.
    This is the standard architecture for small jumping mechanisms; it makes
    peak force a spring property rather than a coil property, and it makes
    the v.0→v.1 upgrade a spring-rate/stroke change rather than a redesign.
    The voice-coil remains the right part for THE NUDGE and THE SETTLE
    (sub-liftoff, quiet, controllable) — it simply stops being the jump
    engine. Net effect on v.0 BOM: +1 small latch, −0 parts removed.

  ENERGY BUDGET PER DAY (sanity check, assumptions flagged):
    A 3.7V / 300 mAh cell holds ~4,000 J. Even at 1 J per leap including
    charge/discharge losses (generous), 100 gestures/day costs ~100 J ≈ 2.5%
    of capacity. Battery capacity is not the constraint; quiet charging and
    the thermal envelope of the latch are. Qi charging (Report 01) holds.

--------------------------------------------------------------------------------
04 // SAFETY AND ETHICS ADDITIONS (NEW IN REPORT 02)
--------------------------------------------------------------------------------

Use Case 02 puts the cube in a household with a child, which Report 01 did
not address. The following are added as v.0 requirements:

  S-1  HELD/HANDLED INHIBIT. IMU detects pickup (free-fall-less sustained
       acceleration + orientation change) → all jump gestures disabled until
       the cube is set down and stable for 3 s. A cube must never fire while
       in a hand, a lap, or a small child's grip.
  S-2  QUIET-HOURS GOVERNOR. No LEAP/HOP between 22:00–07:00 local unless the
       operator opts in; only THE NUDGE and THE SETTLE (no liftoff). The
       circadian engine (QIE P143) supplies the phase; the cube enforces the
       floor locally even if the phone/server is unreachable.
  S-3  SMALL-PARTS / CHILD-SAFETY REVIEW. A 45mm cube is larger than a
       standard small-parts test cylinder (~31.7mm), but this report does not
       certify compliance. Consumer-product safety testing (CPSC / ASTM F963
       for products likely to be accessible to children, lithium cell
       enclosure, UL/IEC battery standards) is a gate before any non-lab
       placement. Not yet scheduled — see A-3.
  S-4  OWNER-PAIRING RULE. Adopted from LOT_ROBOTICS_COSMO.md: a cube
       without a verified LOT® profile does not perform gestures other than
       charge-state indication.
  S-5  PRIVACY. The cube's IMU/ToF telemetry (QI46 "haptic preference") is
       operator-owned data, stored per the existing QI·46 sovereignty model;
       the cube has no microphone and no camera in any version on this
       roadmap. Stating it here so the product never drifts toward the
       sensors the anti-feed thesis rules out.

--------------------------------------------------------------------------------
05 // VALIDATION PLAN (WHAT WOULD ACTUALLY CLOSE v.0)
--------------------------------------------------------------------------------

Report 01 gates are retained (500/500 hop-recover cycles, 100/100 edge
trials). Report 02 adds the pre-hardware experiments that de-risk them
cheaply, in order:

  E-1  BENCH SPRING-LATCH RIG. A printed 45mm shell with ballast to 120g, a
       hobby spring and a manual latch release. Measure launch velocity by
       high-speed phone video (240fps). Goal: confirm the 23.5 mJ / 45°
       Leap numbers and measure true transfer efficiency (replaces the
       30–50% assumption in Section 03).
  E-2  ANGLE REPEATABILITY. 50 launches, three surfaces (wood, glass,
       laminate); record landing displacement scatter. Sets feasibility for
       the v.1 150mm / 60mm-zone gate.
  E-3  PICKUP-INHIBIT FIRMWARE (S-1) on an off-the-shelf IMU dev board; no
       actuator needed. Pass = 100/100 pickups detected inhibited.
  E-4  EDGE GATE (Report 01 hard gate) on a ToF dev board mounted to a
       cart on a tabletop. No jumping until this passes 100/100.

No firmware or hardware was written or run in this cycle. The arithmetic in
Section 02 was computed with a short script and is reproducible with the
formulas stated there.

--------------------------------------------------------------------------------
06 // ROADMAP DELTA
--------------------------------------------------------------------------------

  v.0  Hop + Leap(45°) + Nudge + Settle. Architecture amended: spring-latch
       jump engine, voice-coil for sub-liftoff gestures. Gates unchanged,
       plus S-1…S-5.
  v.1  Long jump 150mm. Risk order revised: launch-angle repeatability >
       stroke length. Energy need ~66–103 mJ at 90g.
  v.2  Surface swings. Unchanged; benefits from the latch engine because a
       directed swing-hop is a sequence of small latched hops with yaw trim.
       Open question carried: traction model per surface (E-2 data feeds it).
  v.3  Levitation — research track only. Nothing here changes. One
       constraint added from the energy view: any levitation mechanism that
       needs continuous power is a watts-class load (acoustic arrays,
       electromagnets), versus the sub-watt-average hop cube; the cube will
       need to live on a powered base surface for v.3. This is consistent
       with Report 01's "pad is the table" decision and is the strongest
       argument for keeping that decision.

--------------------------------------------------------------------------------
07 // CONSUMER USE CASE 02
--------------------------------------------------------------------------------

  USE CASE 02 — THE KITCHEN-TABLE WIND-DOWN                  2026-10-15
  ─────────────────────────────────────────────────────────────────
  Operator profile: parent of a school-age child, Usership tier, circadian
  engine active (Arch49 "Circadian Master" cohort). The CUBIQ pad sits in the
  middle of the kitchen table. This is a shared space: homework, dinner
  plates, a laptop, a child who touches everything.

  The problem today: the operator's evening wind-down is supposed to start at
  a time they chose in the morning, but the reminder lives on a phone. The
  phone is face-down because the parent put it away to be present with the
  child. The reminder fires into a dark, silent device and is found, late,
  the next morning. Or the parent keeps the phone face-up to catch it — and
  is pulled into a scroll while the child waits.

  With CUBIQ v.0: at the wind-down time the circadian engine marks the
  evening phase. The cube performs THE SETTLE — a light standing pressure
  for two seconds that the parent feels through the table under their
  forearm. Nothing lights up; nothing chimes; the child, absorbed in
  spelling words, doesn't notice. The parent understands, without
  looking at anything, that the window has opened. They finish the page they
  were helping with. Later, when they open the cubic for their 5–11 minute
  session, the cube performs a single THE HOP and rests.

  What the product does right in a shared room:
    - It never fires when held (S-1). When the child picks it up to look,
      it goes inert, and resumes only when set down. No toy-like surprise
      in a child's hand.
    - After 22:00 it only Nudges or Settles (S-2). It never hops at night
      beside a sleeping house.
    - It is not a toy and does not behave like one: it does not react to the
      child, only to the parent's own Index of Systems signals (S-4). The
      child cannot "play" notifications out of it.
    - The signal is private to the parent's body: a vibration through a
      shared table is felt by the person whose arm is on it. A screen on a
      shared table is read by everyone.

  Measurable outcome for the telemetry loop (QI46 haptic preference): time
  between Settle and the operator's first cubic session, compared against
  the baseline of phone-only reminders for the same operator. Hypothesis, to
  be tested, not claimed: the physical cue reduces the latency to session
  start without increasing phone pick-ups in the preceding hour.

  Why this use case matters to the roadmap: Use Case 01 proved the cube as a
  desk companion for an individual. Use Case 02 proves it in a shared
  household — the setting where a physical notification either becomes
  something a family trusts or something that gets put in a drawer. It is
  the reason S-1 through S-4 are v.0 requirements and not v.1 polish.

  NEXT USE CASE SEEDS (for Report 03): the cube as a medication / lent-diet
  adherence cue (see LOT-LENT-DIET-OUTCOME-2026.md); the cube travelling
  between a home pad and an office pad as a "continuity object"; the cube as
  an accessibility notifier for hearing-impaired operators where motion
  replaces sound and light.

--------------------------------------------------------------------------------
08 // ACTION ITEMS
--------------------------------------------------------------------------------

  A-1  S-2: supply the Institute Quantum Cube white paper PDF to the repo
       (docs/corporate/) so future reports cite the primary Institute source.
  A-2  S-2: approve or reject the two amendments — LEAP launch angle 45°
       (Finding 1) and spring-latch jump engine (Section 03).
  A-3  Schedule the consumer-safety review path (S-3) before any placement
       outside the lab; owner and budget TBD.
  A-4  Build E-1 bench rig; report measured efficiency in Report 03.
  A-5  Select candidate voice-coil, latch and IMU/ToF parts; record
       datasheet force/stroke figures to replace the assumptions flagged in
       Section 03.

--------------------------------------------------------------------------------
09 // BRAND
--------------------------------------------------------------------------------

LOT® Quantum Cube             The object
CUBIQ™                        The experience — software and hardware
LOT®† CUBIQ®                  The combined mark

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
================================================================================
