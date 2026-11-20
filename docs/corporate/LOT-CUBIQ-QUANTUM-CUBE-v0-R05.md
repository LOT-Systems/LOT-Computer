================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-R05
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report R05
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-14
VERSION:  0.5 — POSITION · STATIC LOOK · TOLERANCE STACK · FIRST LAYOUT
STATUS:   v.0 — PRE-HARDWARE · DESIGN LOCK STILL PENDING (see §10)
PREDECESSORS: LOT-CUBIQ-QUANTUM-CUBE-v0.md     (R01, 2026-07-28)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R02.md (R02, 2026-11-10)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R03.md (R03, 2026-11-11)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R04.md (R04, 2026-11-13)
================================================================================

R05 is the fifth development cycle of the v.0 actuated haptic notification
device. It covers the scope set in R04 §11. Four results:

  1. Lateral ToF ranging to a reference brings the v.2 swing-hop gate
     (< 15 mm cross-track) from "thin pass" to a comfortable pass, as long
     as the ToF lateral noise is ≤ 5 mm. At 10 mm noise it makes things
     worse than heading-hold alone.
  2. The piezo yaw "look" proposed in R04 G7 doesn't work. It is either
     too slow, audible, or both. R05 replaces it with a STATIC look: four
     face-mounted multizone ToF sensors, no rotation, nothing moves during
     placement.
  3. The ≤ 0.3 mm thrust-line tolerance (R04 F18), the hardest number so
     far, closes on paper at ~0.1 mm. The real constraint is the plunger
     axis ANGLE: ≤ 0.57°.
  4. Multizone ToF uses up the last of the mass margin (0.5 g left). R05
     asks S-2 to adopt battery-as-reaction-mass now rather than at B1b.

Everything here is analysis. No hardware exists. No part has been bought.
Inputs marked EST are placeholders for bench measurement.

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Own prior work (read in full this cycle):
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md       R01 — form, gestures,
    QI·46 loop, v.0→v.3 roadmap, Use Cases 01-04 (§07).
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R02.md   R02 — ballistics, hybrid
    drive, edge degradation ladder, quiet hours, bench plan B1-B8.
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R03.md   R03 — reaction-mass
    correction, foot-plunger LEAP, 115 g budget, firmware FSM G1-G6,
    signal contract v0.1, surface resonance probe.
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R04.md   R04 — power path and
    supercap, G4 split, off-pad budget, G7 unknown surface, v.2 swing-hop
    pre-study (F18-F20), BOM classes v0.2, Use Case 04.
  scripts/cubiq-r04-power-swing.py — re-run. F20 reproduces within Monte
    Carlo noise (heading-hold p98 13.4 → 13.6 mm with this cycle's seed).

LOT® Institute corpus (re-read in the cited sections):
  docs/corporate/LOT-CUBIQ-VISION.md      §01 anti-feed ("LOT® invests
                                           attention and returns
                                           structure"); §05 physical step
  docs/corporate/LOT-CUBIQ-OPERATOR.md    §01 PRESENCE; §03 Index of
                                           Systems; §04 AI-driven physical
                                           delivery; §07 Phase 4
  docs/corporate/LOT_QI46_ENGINE.md       piezo / nano-ceramic / haptic
                                           corpus; Month-12 cube sync —
                                           "haptic preference: pressure,
                                           duration, cadence"
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md  "Quantum Cube Hardware —
                                           PLANNED"; the object should
                                           "feel the field it sits in"

PROCESS NOTE — CONTINUITY, S-2
  Still not merged. This run started from `master` (R01 only) again. It
  found the R02→R04 chain on `claude/tender-turing-o9fkgo` by scanning
  every `origin/claude/tender-turing-*` branch for the highest R-number,
  as R04 asked, and fast-forwarded this branch
  (`claude/tender-turing-cjpwpx`) onto it. This branch now holds
  R01→R05 in order. Merging it to `master` is still the fix (D0).
  Use-case themes were checked against all ~97 branches. An accessibility
  case for a Deaf operator was seeded twice as a one-line candidate
  ("haptic-only channel for a Deaf operator") but never written up.
  Use Case 05 is that case.

--------------------------------------------------------------------------------
01 // WHAT CHANGED IN R05
--------------------------------------------------------------------------------

  F23  Lateral ToF position correction: v.2 gate passes with margin at
       ≤ 5 mm ranging noise; fails at 10 mm. Ranging noise is now a v.2
       sensor spec.                                                   §02
  F24  Piezo-only yaw "look" is infeasible: ~19 s at 1 kHz (audible) or
       ~1 min ultrasonic. Removed from G7.                            §03
  F25  Static look: 4 multizone ToF, ≥ 45° horizontal FoV each, no
       rotation. Straight edges in the blind diagonals read ≤ 8 % long;
       a fixed derate keeps the estimate safe. Placement is now
       motionless and silent.                                         §03
  F26  Thrust-line tolerance stack: ~0.10 mm RSS unit-to-unit (calibrated
       out at end-of-line), ~0.02 mm in use. The 0.3 mm budget holds.
       The binding tolerance is plunger axis angle, ≤ 0.57°.          §04
  F27  First mechanical layout, section view. ToF sensors move down to
       the base band; IMU moves off-centroid.                         §05
  F28  Mass budget v0.3: 119.5 g, margin 0.5 g. Recommend
       battery-as-reaction-mass now (→ 112.5 g, margin 7.5 g).        §06
  F29  NUDGE waveform gets a signature so it can't be mistaken for a
       phone buzzing on the same desk. LED ring never blinks.         §07
  F30  Use Case 05 — THE SILENT HOUSEHOLD.                            §09

  Reproduce every number in this report with:
      python3 -I scripts/cubiq-r05-position-look.py

--------------------------------------------------------------------------------
02 // F23 — v.2 LATERAL POSITION CORRECTION
--------------------------------------------------------------------------------

  THE PROBLEM (R04 F20)
    Heading-hold stops yaw errors from adding up, but landing slip still
    adds up sideways, and the IMU can't see it. R04 passed the v.2 gate
    with ~1.5 mm to spare.

  THE MODEL
    Same per-hop noise as R04: yaw σ 3°, range σ 10 %, slip σ 1.5 mm.
    New: before every hop the cube is still. A side-facing ToF ranges a
    reference that runs parallel to the track (a keyboard, a book spine,
    the pad edge, a wall), with noise σ_tof. The cube then re-aims toward
    the track line: aim = atan(−0.8 · y_measured / hop), clipped to ±20°.
    The gate is checked two ways: final error, and the WORST error at
    any point on the path. "Cross-track error" in R01 §06 should mean
    the second. A cube that wanders 20 mm off and comes back still went
    20 mm off.

    20,000 runs per row, 98th percentile, 200 mm traverse:

      hop     correction                   final    worst-on-path   gate
      20 mm   heading-hold only (R04)      13.6     14.1 mm         PASS (thin)
      20 mm   + lateral ToF σ 2 mm          5.7      7.6 mm         PASS
      20 mm   + lateral ToF σ 5 mm          9.5     12.4 mm         PASS
      20 mm   + lateral ToF σ 10 mm        14.3     18.6 mm         FAIL
      20 mm   + σ 5 mm, ref seen 50 %      10.7     13.1 mm         PASS
      40 mm   heading-hold only (R04)      13.6     13.9 mm         PASS (thin)
      40 mm   + lateral ToF σ 2 mm          7.3      9.0 mm         PASS
      40 mm   + lateral ToF σ 5 mm         11.1     13.9 mm         PASS (thin)
      40 mm   + lateral ToF σ 10 mm        18.0     21.7 mm         FAIL
      40 mm   + σ 5 mm, ref seen 50 %      12.5     14.5 mm         PASS (thin)

  WHAT IT MEANS
    · Position correction is worth having only if the ranging is good. At
      σ 10 mm the cube steers toward its own noise and does worse than
      heading-hold alone. v.2 spec: lateral ranging σ ≤ 5 mm at 50-300 mm
      on matte and glossy references.
    · Small hops (20 mm) beat big ones (40 mm) once correction is on:
      more chances to re-aim. v.2 traverses use 20 mm hops by default.
    · Losing the reference half the time still passes. The cube needs a
      reference sometimes, not always. If there is no reference at all,
      it falls back to R04 heading-hold.
    · The reference only has to be roughly straight and roughly parallel.
      The cube follows it, so a slanted book steers a slanted path. v.2
      firmware should read the reference angle from multizone ToF (F25)
      and refuse references more than 10° off the requested heading.

--------------------------------------------------------------------------------
03 // F24 + F25 — THE PLACEMENT "LOOK"
--------------------------------------------------------------------------------

  F24 — WHY THE PIEZO CAN'T TURN THE CUBE
    R04 G7 asked the piezo trim bimorph to yaw the cube 360° at a
    "sub-felt" amplitude while the ToF sampled edges. With four face ToF
    sensors, 60° of rotation is enough (sampling every 30°). Even so:

      Friction torque on four elastomer feet (μ 0.5 EST)    10.4 mN·m
      Best case yaw per bimorph stroke, feet unloaded     3.2 millideg
        (2 g moving, 15 mm lever, 75 µm stroke EST; momentum bound)
      Strokes for 60°                                         18,850

      drive rate     time for 60°    band
        200 Hz          94 s         audible
        1 kHz           19 s         audible
        5 kHz          3.8 s         audible
        25 kHz         0.8 s         ultrasonic, but needs 75 µm at
                                     25 kHz = ~190,000 g tip
                                     acceleration. Not physical.
                                     At a real ~1 µm: ~57 s.

    And that's the frictionless case. With feet loaded, every fast stroke
    first has to overcome 10.4 mN·m of friction. A placement routine that
    hums for 20 s on a hotel desk is not "measure before you move"
    (R04 Use Case 04). It's a noise. And this is the one cube that must
    not make noise on a resonant surface (R03 G6). F24 drops piezo yaw.
    The bimorph keeps its R02 job, ±5° launch trim, and nothing else.

  F25 — STATIC LOOK: SEE WITHOUT TURNING
    Replace the four single-zone ToF (R04 §06) with four MULTIZONE ToF,
    one per vertical face. Each returns a grid of ranges across its field
    of view. Nothing rotates.

      horizontal FoV   azimuth seen   straight edge read long by
        27°             108°            ×1.173  (derate 14.7 %)
        45°             180°            ×1.082  (derate  7.6 %)
        60°             240°            ×1.035  (derate  3.4 %)
        90°             360°            ×1.000

    Gaps sit on the four diagonals. A straight table edge whose nearest
    point lies in a gap is still seen by the zones on either side, just
    at a slant, so it reads up to 1/cos(gap/2) long. Multiplying every
    range by cos(gap/2) makes the estimate safe. On rectangular desks
    (convex, straight edges) that bound is exact.
    Round tables, Monte Carlo (R 250-600 mm, random position and yaw,
    20,000 placements): worst estimate/true = 0.994 at 45° FoV and 0.996
    at 60°. Always ≤ 1, so the derated estimate is safe on curves too.

    SPEC (v.0): multizone ToF, ≥ 45° horizontal FoV, ≥ 4 zones across,
    ≥ 300 mm range on matte wood. Mounted in the BASE BAND, canted 10-15°
    down so the table surface fills the lower zones and the edge appears
    as the range at which the table stops returning (§05).

  G7 REVISED — PLACEMENT ROUTINE v0.2
    1. Still for ≥ 2 s (IMU).
    2. Level check: < 3° for LEAP (unchanged).
    3. Static look: one multizone frame from each face, derated (F25).
       ~30-60 ms per frame, ~0.1 s total.
    4. Resonance probe (R03 §06): the one step that touches the surface,
       sub-felt, ~0.5 s.
    Total ≈ 1 s, from ~20 s with a piezo yaw. Nothing visible moves.
    Fail quiet: NUDGE (if DAMPED) and SETTLE only until step 4 passes.

--------------------------------------------------------------------------------
04 // F26 — THE TOLERANCE STACK
--------------------------------------------------------------------------------

  R04 F18 found ~5-14° of in-flight yaw per 1 mm of thrust-line-to-CoM
  offset and asked for ≤ 0.3 mm. R05 checks whether that's buildable.
  Lateral placement tolerances per part (EST), RSS:

    part                              mass   tol.     kind
    shell (wall-thickness asymmetry)   23 g  ±0.10 mm  unit-to-unit
    frame + fasteners                   8 g  ±0.10     unit-to-unit
    stator                             14 g  ±0.05     unit-to-unit
    reaction mass, radial play         40 g  ±0.05     IN USE
    cell in coil former (if moving)     7 g  ±0.10     IN USE
    foot-plunger module                 9 g  ±0.10     unit-to-unit
    PCB + parts                         5 g  ±0.20     unit-to-unit
    supercap                            3 g  ±0.30     unit-to-unit
    Qi coil + ferrite                   4 g  ±0.20     unit-to-unit
    ToF ×4 + IMU + piezo                4 g  ±0.20     unit-to-unit
    plunger boss position                —   ±0.10     unit-to-unit

    unit-to-unit RSS     0.104 mm   → 0.7° yaw per 20 mm / 60° hop
    in-use RSS           0.018 mm   → 0.1° yaw per hop
    total (uncalibrated) 0.105 mm   vs. 0.3 mm budget: OK

  WHAT IT MEANS
    · The offset budget closes with ~3× margin. Most of it is the plunger
      boss, and unit-to-unit error is fixed per unit, so it can be
      CALIBRATED OUT. At end-of-line each cube does ten 20 mm swing-hops
      on a reference plate; the measured mean yaw sets a per-unit plunger
      timing offset (the R04 F18b steering input, used as trim). Only
      the 0.02 mm in-use part is left, worth ~0.1° per hop.
    · The tolerance that binds is ANGLE, not offset. The plunger foot is
      ~30 mm from the CoM along the thrust line (EST, §05). A tilted
      plunger axis misses the CoM by 30 mm × tan(error):
        0.3 mm budget → plunger axis within 0.57°
        0.1 mm (to keep the calibration small) → within 0.19°
      R05 asks for the plunger bore to be machined or reamed in the same
      setup as the stator datum, not moulded separately and assembled.
    · The radial play of the reaction mass matters little (0.05 mm on
      40 g). The 40 g mass doesn't need a precision bearing, so the
      bushing can be chosen for quiet running instead.

--------------------------------------------------------------------------------
05 // F27 — FIRST MECHANICAL LAYOUT (SECTION VIEW, v0.1)
--------------------------------------------------------------------------------

  Vertical section through the cube centre, front face on the left. 45 mm
  outer. Not to scale in detail; to scale in stacking order.

        ┌───────────────────────── 45 ─────────────────────────┐
     45 │ shell 1.0 mm ceramic-filled polymer (R03)              │
        │  ┌──────────────── TOP: ack-touch zone ────────────┐   │
        │  │      ┌────────────────────────────┐             │   │
        │  │      │  STATOR (magnet + coil)    │ 14 g        │   │
        │  │      │   ┌──────────────────┐     │             │   │
        │  │      │   │ REACTION MASS    │ ↕8  │  axis =     │   │
        │  │      │   │ (cell in former, │ mm  │  stator     │   │
        │  │      │   │  F28) 40 g       │     │  DATUM A    │   │
        │  │      │   └──────────────────┘     │             │   │
        │  │      └────────────────────────────┘             │   │
        │  │  [supercap 3 g]      [IMU]   [piezo trim 2 g]   │   │
        │  │ ══════════ PCB: MCU+BLE · H-bridge · boost ═════ │   │
        │  │  ╲ plunger ╱                     ╲ plunger ╱     │   │
        │  │   ╲ 60-70°╱  (v.2 pair; v.0 has  ╲      ╱       │   │
        │  │    ╲bore ╱    one, LEAP at 45°)   ╲    ╱        │   │
        │◁ToF│▓▓▓▓▓▓▓▓▓ Qi RX coil + ferrite ▓▓▓▓▓▓▓▓▓│ToF▷  │
      0 │ ▔▔ └ foot ─────────── LED ring (steady) ──── foot ┘ ▔▔ │
        └─────────────────────────────────────────────────────────┘
                      v.3 keep-out: no ferrous part above the
                      Qi ferrite; ferrite is the one magnetic part

  LAYOUT DECISIONS
    L1  DATUM A is the stator axis. Plunger bores, PCB locating pins and
        foot positions all reference it (F26).
    L2  The ToF sensors move from mid-face (R01) to the BASE BAND, 3-6 mm
        above the table, canted 10-15° down (F25). The table edge shows
        up as "surface stops returning". Glass edges need B13.
    L3  The IMU moves OFF the centroid; the stator is there. It sits on
        the PCB 8-10 mm below the centroid, and firmware applies the
        lever-arm correction (ω × r) to acceleration. A known offset is
        better than shrinking the stator for it.
    L4  The supercap goes beside the stator, near the base. Low mass, low
        CoM. Its ±0.3 mm tolerance is the biggest unit-to-unit term per
        gram; it gets a moulded pocket, not adhesive.
    L5  The top face is the ACK zone. The R03 "touch" ack is read by the
        IMU. Nothing on top: no LED, no sensor window. It stays a quiet
        surface to put a hand on.
    L6  Plunger foot ~30 mm from CoM along the thrust line (F26 input).
        Bench check B17.

--------------------------------------------------------------------------------
06 // F28 — MASS BUDGET v0.3
--------------------------------------------------------------------------------

    R04 total                                   118.5 g
    + multizone ToF ×4 vs. single-zone (EST)    + 1.0 g
    ─────────────────────────────────────────────────────
    R05 total                                   119.5 g   margin 0.5 g

    with battery-as-reaction-mass (R03 §02)     112.5 g   margin 7.5 g

  At 0.5 g of margin, the next change of any kind breaks 120 g.
  Battery-as-reaction-mass makes the moving 40 g out of something the
  cube already has to carry, instead of adding a dead slug. Costs:
    · flex leads rated ≥ 1,000,000 cycles at 8 mm (≈ 50 HOP/day for
      50 years; the real target is v.0 life, but leads are cheap)
    · cell certified for repeated acceleration (≈ 11 g on the HOP stroke)
    · B1b: cell surface temperature after 1,000 HOPs (R04 F16 says the
      coil is cool; the cell sits inside it)
  R05 asks S-2 to adopt it now (D15), with B1b as the go/no-go, rather
  than to carry it as an option.

--------------------------------------------------------------------------------
07 // F29 — SIGNATURES: NOT A PHONE, NOT AN ALARM
--------------------------------------------------------------------------------

  Use Case 05 (§09) raised two collisions the earlier cycles missed.

  NUDGE vs. A PHONE ON THE SAME DESK
    A phone vibrating on a desk is a continuous buzz, usually 150-250 Hz,
    0.3-1 s. If the NUDGE feels like that, a hand on the desk can't tell
    the cube from the phone, and the cube ends up sending people back to
    the phone it was meant to replace.
    NUDGE signature v0.1: TWO beats. Each beat is a single coil
    half-stroke with a ~60 ms rise, so it's felt as a push, not a buzz.
    The beats are 350 ms apart. Envelope content sits below 30 Hz; the
    carrier is PWM ≥ 20 kHz (R04 §06). A phone can't make that pattern
    and the cube never makes a continuous buzz.
    QI·46 may adjust the beat gap per operator (cadence, per the Month-12
    haptic-preference signal) within 250-600 ms. Two beats, always.

  LED RING vs. ALERT LIGHTS
    Many homes, Deaf households especially, use flashing lights for
    doorbells, phones, baby monitors and smoke alarms. A flashing light
    in that home means "something needs you NOW", sometimes "get out".
    New rule: THE LED RING NEVER BLINKS. It is steady or off. It shows
    charge and pairing only (R01 §02), and the base is the only place it
    can be seen. The cube's notification language stays motion (R01 §04).
    A cube that flashed would compete with a fire alarm. That is the
    opposite of presence without spectacle.

--------------------------------------------------------------------------------
08 // VALIDATION PLAN — DELTAS TO R04 §07
--------------------------------------------------------------------------------

  B13 REVISED  Placement on 6 unseen surfaces (incl. glass edge, cloth,
               round table) using the STATIC look. PASS: derated edge
               estimate never exceeds tape-measure truth; routine ≤ 1.5 s;
               no audible output at 0.3 m (≤ ambient + 3 dB(A)).
  B15 NEW      Multizone ToF incoming test: horizontal FoV ≥ 45°, lateral
               range σ ≤ 5 mm at 50-300 mm on matte and glossy references.
  B16 NEW      Gesture identification, touch-only and sight-only, 20
               participants, at least 8 of them Deaf or hard of hearing,
               recruited as CO-DESIGNERS (paid, credited), not test
               subjects. Include a phone vibrating on the same desk as a
               distractor. PASS: ≥ 90 % correct NUDGE / HOP / LEAP /
               SETTLE / "phone", by touch alone and by sight alone.
  B17 NEW      End-of-line yaw calibration on 10 units: ten 20 mm / 60°
               swing-hops on a reference plate; derive the timing trim;
               re-run. PASS: post-trim mean yaw ≤ 0.3° per hop.
  B1b REVISED  Battery-as-reaction-mass: 1,000 HOPs, cell surface
               ≤ +5 K, flex leads continuity monitored throughout.
  Unchanged: B1-B12, B14 and the R01 500/500 close gate.

--------------------------------------------------------------------------------
09 // CONSUMER USE CASE 05 — THE SILENT HOUSEHOLD
--------------------------------------------------------------------------------

(Also appended to LOT-CUBIQ-QUANTUM-CUBE-v0.md §07. Prior entries untouched.)

  Operator profile: Usership tier, Deaf since birth, a native signer,
  works as an architectural drafter from a home studio. Their partner is
  hearing. Their home already has flashing-light alerts for the doorbell
  and the smoke alarm, and a bed shaker for the morning. Their phone is
  their main link to hearing colleagues, which also makes it the device
  they find hardest to put down: captions, video calls, group chats,
  feeds, all on one vibrating rectangle.

  What's different for this operator: the phone's buzz and the cube's
  motion are both touch channels. Most of the "felt, not heard"
  reasoning in Use Cases 01-04 assumed the cube was quieter than a chime.
  Here, sound doesn't help either device. What matters is whether a hand
  on the desk can tell them apart, and whether the cube adds yet another
  thing that needs a response.

  Morning. The bed shaker wakes the operator. That's their alarm, and
  the cube doesn't try to replace it. The cube sits on its pad at the
  drafting desk.

  10:20. Deep in a drawing, phone face down at the far corner of the
  desk, one hand resting on the desk surface. The Memory Engine has a
  question ready. The cube performs THE NUDGE with the F29 signature: two
  soft pushes, a third of a second apart. The phone has buzzed four
  times this morning, each a continuous hum. This is different, and
  their hand knows it before they think about it. Not the phone. Not
  urgent. The question can wait until the section is finished.

  11:05. Section done. The operator lays their palm on the cube's top
  face (ack = "touch", latency 45 min, an allowed and normal latency;
  the R03 contract has no penalty for slow acks). The 5-minute cubic
  opens on the drafting monitor. The questions are text, so nothing
  depends on hearing.

  14:30. A colleague's video call runs long. The operator's attention
  is on the interpreter. A badge unlocks (badge_rare → ceiling LEAP).
  The cube is in the operator's peripheral vision, and the platform
  knows a call is live (PRESENCE, LOT-CUBIQ-OPERATOR §01), so it lowers
  the ceiling to SETTLE until the call ends. Movement next to someone
  who is signing or reading a signer is not peripheral; it pulls the eye
  straight off the conversation. At 15:10, call over, the cube does THE
  HOP once. Seen, not heard. That's enough.

  Evening. The doorbell light flashes: a delivery. The cube's LED ring
  stays steady, as always (F29). In this home, flashing light means the
  door or the alarm. The cube never borrows that signal.

  22:00. Quiet hours. The partner is asleep. The operator is reading in
  the studio. For the operator, a LEAP landing would be silent. For the
  partner on the other side of a thin wall, it's a knock at 22:00.
  Quiet hours belong to the household, not to whoever is awake and can
  hear. Ballistic gestures stay off, as R02 §06 specifies.

  What Use Case 05 proves that 01-04 did not:
    · For this operator the cube's real job is to be TELL-APART-ABLE from
      the phone. It's a second, slower channel next to a device that
      already buzzes all day. That made the NUDGE signature a v.0
      requirement (F29), not a nice-to-have.
    · Motion near a signed conversation is foreground, not peripheral.
      The platform must lower gesture ceilings during live calls for
      operators who sign, or who read captions or lips. This becomes a
      new signal-contract field (D17).
    · LOT® did not design the cube for Deaf operators. A motion-first,
      screen-free, sound-free notification object turns out to suit
      them better than almost anyone. That is a reason to put Deaf
      co-designers on the B16 panel from the start (§08), rather than
      accommodate them later.

  Consumer market: people born Deaf (roughly 1 in 1,000), a much
  larger group of hard-of-hearing adults, and the hearing
  people who live with them. Products for this market are mostly alert
  devices (lights, shakers) that signal urgency. The cube is the
  opposite: a calm, non-urgent signal that doesn't need sound.

--------------------------------------------------------------------------------
10 // DECISIONS FOR S-2
--------------------------------------------------------------------------------

  D0  PROCESS — merge this branch (R02 → R05) to master, or point the
      routine at one long-lived CUBIQ branch. (Third time asked.)
  D14 Approve dropping piezo yaw from G7 and adopting the STATIC look:
      4 multizone ToF, ≥ 45° FoV, base band, 10-15° down-cant (F24-F25).
  D15 Adopt battery-as-reaction-mass as the v.0 baseline now, with B1b
      as go/no-go (F28). Without it, the budget has 0.5 g of margin.
  D16 Approve the plunger-axis angle tolerance (≤ 0.57°, target 0.19°),
      bore machined in the stator-datum setup, and end-of-line timing
      trim (F26, B17).
  D17 Signal contract v0.2: add "ceiling_hint": "call_live" (platform
      lowers any ceiling to SETTLE while a call is live, if the operator
      opts in) and fix the NUDGE two-beat signature in firmware (F29).
  D18 Rule: the LED ring never blinks (F29).
  D19 B16 panel: Deaf and hard-of-hearing co-designers, paid and
      credited.
  R04 D9-D13 remain open and compatible. D12 (4× ToF) is superseded in
  part by D14: still four sensors, now multizone.

--------------------------------------------------------------------------------
11 // NEXT CYCLE (R06) PROPOSED SCOPE
--------------------------------------------------------------------------------

  · v.1 LONG JUMP (>150 mm): first numbers. Spring energy, latch loads,
    landing impact on a 112.5 g cube, and how the static look covers a
    150 mm runway when the ToF range is 300 mm.
  · Drop and tip survival: a cube that leaps will one day leave the desk.
    Shell and internals for a 750 mm fall onto hard floor; what fails
    first; what firmware does after a fall (SAFE-HOLD + re-placement).
  · Signal contract v0.2 written out in full (D17), including a schema
    test vector set the platform side can run.
  · Use Case 06, chosen from themes not yet used across all branches.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-R05
================================================================================
