================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-R12
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report R12
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-27
VERSION:  0.12 — G12 IN FIRMWARE · FSM v0.4 IN C · THE JUMP PATH
STATUS:   v.0 — PRE-HARDWARE · FIRST SPEND (D41) STILL OPEN
PREDECESSORS: LOT-CUBIQ-QUANTUM-CUBE-v0.md     (R01, 2026-07-28)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R02.md … -R11.md (2026-11-10 … 2026-11-25)
================================================================================

R12 is the twelfth development cycle of the v.0 actuated haptic notification
device. D41 (first spend) is still unanswered, so R12 takes the "if not"
branch of R11 §11. It does both items on that list. The G12 pitch self-check
now runs in C. The R08 state machine has become the loop the cube actually
runs, in C, with the v.1 JUMP path added. Writing them down as code turned up
three things the paper versions had wrong. There are ten results.

  1. G12 IN FIRMWARE (firmware/cubiq/cubiq_g12.{h,c}). It has no malloc and
     no floating point. It passes 20/20 hand-written vectors in both the C
     and a Python reference, and the two agree on all 50,000 commands of a
     differential fuzz.
  2. GATE ON WHAT THE GYRO MEASURES (F92). R11 converted the gyro's pitch
     rate into a thrust-line ANGLE through three EST constants (m, I, v).
     R12 gates on the rate itself, normalised by the measured flight time.
     m and I cancel out of the JUMP landing pitch, and a weak spring no
     longer reads as a good thrust line.
  3. CORRECTION to R11 D58: use the MAX of the last five flights, not the
     MEDIAN (F93). After an undetected knock, the median lets through two
     200 mm JUMPs that topple. The max lets through none. Gyro noise is
     1/800 of the limit, so the max costs almost nothing.
  4. CORRECTION to R11 F87: R11 read the topple onsets off the upper edge
     of a 0.01° bracket. The 1.5× limits are 0.781° (150 mm) and 0.566°
     (200 mm), not 0.79° and 0.57°. In the measured unit they are
     34.964 °/s and 25.355 °/s (F95).
  5. CORRECTION to R08 F57 (FSM v0.3 invariant I1): v0.3 read the stored
     spring energy off the state's NAME. In the "fall during ARM" scenario
     it reported "at rest, zero spring" while the worm held the cam 45 %
     of the way up. v0.4 tracks the cam as a number, and once the cube is
     still it relaxes a held spring from SAFE_HOLD (F96).
  6. EVERY v.1 JUMP WOULD HAVE BEEN A "FALL" (F97). R06 confirms a fall
     after 150 ms of free fall. A 150 mm JUMP is in the air for 230 ms and
     a 200 mm JUMP for 266 ms. Unmasked, each JUMP would end in SAFE_HOLD
     and wipe the G12 record. v0.4 masks fall detection while the cube is
     ballistic. The real fall is a flight that runs 50 % over its nominal
     time.
  7. THE JUMP PATH (F98). If the re-check fails with room for a LEAP, the
     rocker is decocked PART-way to the LEAP level and re-locked. That
     takes 5.63 s, against 7.63 s for a full decock and re-arm. v0.4 also
     adds latency budgets for JUMP, because a 3.1 s arm cannot meet v.0's
     1.5 s budget.
  8. CORRECTION to R08 fault f3 (F99): a hand 70 mm ahead does not produce
     the HOP that R08 showed. With the contract's own runways it gives a
     NUDGE off the pad, and on the pad the LEAP fires anyway. The second
     case raises a real question about obstacles on the pad (B48).
  9. PLATFORM: the cube's class mapper does not know the Badge Codex's two
     highest rarities (F101). A MYTHIC or COSMIC codex badge would map to
     badge_common, a HOP, which is smaller than what an "epic" gets.
     Separately, no class earns JUMP at all, because D27 is still open, so
     R12 tests the JUMP path from a plan, not from decide() (F100).
 10. Use Case 12 — THE JIGSAW TABLE: a retired surveyor, a 2,000-piece
     puzzle and a v.1 cube on a long oak table. It is the first use case
     with a JUMP and the first where the cube corrects itself after damage
     nobody saw.

Everything here is analysis or reference code. No hardware exists. No part
has been bought. Inputs marked EST are placeholders for bench measurement.

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Own prior work (read this cycle):
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R11.md   read in full. §03 F87/
    F88 (landing pitch, G12 proposal, D58), §08, §10 D55-D60, and §11 the
    R12 scope this report follows.
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R10.md   §06 the rocker and
    double-torsion spring, and its arming time: 2.8-3.4 s at 150 mm and
    3.7-4.5 s at 200 mm.
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R08.md   §05 FSM v0.3: the
    state table, rules F57, invariants I1-I6 and fault scenarios f1-f8.
    §04: the home-pad runways.
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R06.md   F36 cock-on-intent, the
    150 ms fall confirmation, and D27 ("which class earns JUMP").
  firmware/cubiq/*, scripts/cubiq-r08-fsm-sim.py, scripts/cubiq-r11-landing.py
    are imported unchanged by the R12 script. Before writing, all 19 earlier
    CUBIQ Python scripts were re-run and exit 0, and both TypeScript checks
    pass. They still do after R12.

Parallel CUBIQ work (other branches, read this cycle):
  claude/tender-turing-hc8hpk  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R02.md
    (2026-11-26). Another run started from master's R01 and wrote its own
    "Cycle 02" (impact-hop actuator, supercap power, a BLE draft, Use Case
    02 "Bedside Circadian Close"). Its reading log notes that the Badge
    Codex has grown to eight rarity tiers and 843 badges (Codex v33). That
    note led to F101. Nothing in it contradicts this chain's R02-R11.

LOT® Institute corpus (re-read in the cited sections):
  docs/corporate/LOT_QI46_ENGINE.md       Month-12 Calibration Loop. R11
                                          called G12 "the first value the
                                          cube learns about itself". R12
                                          makes that value a measured one
                                          (°/s), not a model's output (deg).
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md  the psychotronic-sensor
                                          register: "the object should feel
                                          the field it sits in". G12 is the
                                          cube feeling its own body.
  docs/corporate/LOT-CUBIQ-OPERATOR.md    §03 BADGE COLLECTION, the 7 rarity
                                          tiers common → cosmic ("most badges
                                          are hidden"). §07 Phase 4. F101 and
                                          D64 read from here.
  docs/corporate/LOT-CUBIQ-VISION.md      §01 "presence without spectacle".
                                          A JUMP is the most spectacular
                                          thing the cube will do. Use Case 12
                                          keeps it rare and earned.
  docs/LOT-SR-20261117-CODEX-v33.md and src/client/utils/badges.ts:798
                                          the codex rarity field: 'common' …
                                          'mythic' | 'cosmic'.
  src/shared/cubiq/signal-contract.ts:291-301  achievementClass(): five
                                          tiers, and "anything without a
                                          rarity (e.g. Badge Codex entries)
                                          is badge_common".

PROCESS NOTE — CONTINUITY, S-2 (tenth time)
  This run started on `claude/tender-turing-vccu5e`, cut from `master`.
  `master` still holds only R01. The R01→R11 chain was on
  `claude/tender-turing-wba0c1` and was fast-forwarded onto this branch,
  which now holds R01→R12 in order. The 2026-11-26 run (`hc8hpk`) is the
  second this week to miss the chain and rebuild a "Cycle 02" from R01. D0
  is still the fix. D41 has no answer, and scheduled runs have no live
  input, so nothing is spent.
  Use-case themes were checked across every CUBIQ document on all 111
  routine branches. "jigsaw", "puzzle", "farmhouse", "long table",
  "grandparent", "multigenerational", "board game" and "chess" appear in
  none of them. No earlier use case has a JUMP, and none has the cube take
  damage that nobody notices. Use Case 12 covers both.

--------------------------------------------------------------------------------
01 // WHAT CHANGED IN R12
--------------------------------------------------------------------------------

  F92  G12 gates on the measured pitch rate, normalised by flight time
       (q_eq). m and I cancel; B42 now calibrates in °/s.               §02
  F93  CORRECTION to R11 D58: max of the last 5, not the median.         §02
  F94  A sample is never refused for its value. A saturated gyro counts
       as the worst possible sample. Refusals are for flight time or
       contact only.                                                     §02
  F95  CORRECTION to R11 F87: limits 0.781° / 0.566°, i.e. 34,964 /
       25,355 mdps (the old ones were 1.2 % / 0.6 % permissive).        §02
  F96  CORRECTION to R08 I1: spring energy is a cam position, not a state
       name. SAFE_HOLD → DECOCK → SAFE_HOLD. Invariant I7 added.         §03
  F97  Fall detection is masked while the cube is ballistic, and a flight
       that overruns by 50 % counts as a fall. Without this, every JUMP
       confirms as a fall.                                               §03
  F98  v.1 JUMP path: partial decock to the LEAP level (new DECOCK →
       LOCK edge). JUMP latency budgets.                                 §03
  F99  CORRECTION to R08 f3: 70 mm gives NUDGE off-pad and no downgrade
       on-pad. The on-pad case opens B48.                                §03
  F100 No class earns JUMP (D27 open), so the FSM's JUMP tests start from
       a plan. A candidate answer is D64.                                §04
  F101 achievementClass() does not know the codex's mythic or cosmic, so
       the rarest badges would get a HOP.                                §04
  F102 Use Case 12 — THE JIGSAW TABLE.                                   §08

  Reproduce every number in this report with:
      python3 -I scripts/cubiq-r12-g12-fsm.py 50000
  The script builds firmware/cubiq/ with -Werror, re-derives the limits,
  runs the vectors, both fuzzes, the Monte Carlo, all 30 FSM scenarios and
  the ASan/UBSan build. It also compares the C FSM against R08's v0.3
  simulator. It exits 0 only if everything passes. gcc and clang both build
  it clean. All R08-R11 commands still pass unchanged, and decide() is
  still v0.5.

--------------------------------------------------------------------------------
02 // G12 — THE PITCH SELF-CHECK, IN FIRMWARE
--------------------------------------------------------------------------------

  WHAT IS IN firmware/cubiq/ (new: cubiq_g12.h 70 lines, cubiq_g12.c 50)
    A five-slot ring of samples, a record call, a reset call and a query
    that returns the allowed range (0 = LEAP only, 150 or 200 mm). Integer
    arithmetic only. The FSM calls record() on every LEAP or JUMP landing
    and reset() on a confirmed fall (§03).

  F92 — GATE ON THE MEASURED QUANTITY
    In free flight the body rate is constant and equal to m·v·d/I. R11
    inverted that to get an angle and compared the angle with a limit. Each
    of m, I and v is EST. R12 asks what the gate is protecting: the JUMP's
    landing pitch ψ_J = (m·v_J·d/I)·t_J. Compare the rate on a LEAP with
    the rate on a JUMP and m, d and I all cancel: ω_J/ω_L = v_J/v_L. At a
    fixed 60° launch, v is proportional to the flight time. So the firmware
    stores
        q_eq = |mean pitch rate in flight| × T_LEAP_NOM / t_flight_measured
    which is the rate this unit would show on a nominal LEAP. It compares
    q_eq with a limit in °/s. The true thrust-line error is 0.70°. With one
    EST input off by 10 % (script part 2):
      case                     R11 inferred angle   R12 q_eq     real JUMP-150 landing pitch
      inputs as EST               0.700°            31.34 °/s        14.0°
      true I 10 % higher          0.636°            28.49 °/s        12.7°
      spring 10 % weak            0.630°            31.34 °/s        14.0°
      true m 10 % lower           0.630°            28.21 °/s        12.6°
    In the rows where the R11 angle moves, the landing pitch it is meant to
    predict moves with q_eq, not with the angle. The weak-spring row is the
    dangerous one. A raw rate under-reads it by 10 %, which is permissive,
    because a weak spring makes a slow LEAP. q_eq reads it correctly. One
    dependence on m and I is left: the topple THRESHOLD comes from the R11
    impact model. B42 now measures that threshold directly in °/s (§06).

  F95 — THE LIMITS, RE-DERIVED (script part 1)
    R11's scan stepped 0.01° and reported the first value that toppled,
    i.e. the upper edge of the bracket. At 0.0001°:
      range    R11 onset   onset      ÷1.5 limit   R11 limit   q_eq limit   header (mdps)
      150 mm    1.18°      1.1714°    0.7809°      0.79°       34.965 °/s   34,964
      200 mm    0.85°      0.8495°    0.5663°      0.57°       25.356 °/s   25,355
    The header values are floored, and the script fails if they drift from
    the model. One degree of thrust-line error reads 44.77 °/s on a nominal
    LEAP. R08's 0.72° worst-case stack reads 32.2 °/s, so a unit at the
    stack is allowed 150 mm but not 200 mm.

  F93 — MAX, NOT MEDIAN (CORRECTION to R11 D58)
    R11 proposed the median of five so that one odd flight could not block
    a JUMP. Take a unit knocked off the table onto a rug, or bumped by a
    vacuum cleaner. The knock never reaches the 150 ms free-fall
    threshold, so G8 does not fire, but the guide is bent. The thrust line
    goes from 0.40° to 0.95°, past the 200 mm onset of 0.85°. Monte Carlo,
    20,000 knocks, rate noise 0.03 °/s per flight, three JUMP requests
    after each knock (script part 5):
      rule     200 mm JUMPs allowed that topple, per knock
      median        2.00
      max           0.00
    The median needs three bad flights before it moves. The max moves on
    the first. The cost of the max is false holds from noise. A unit 0.1
    °/s below the 200 mm limit is held to 150 mm on 0.21 % of queries, and
    one 0.2 °/s below is not held at all. Noise is 1/800 of the limit, so
    the robustness the median buys is not needed, and what it costs is two
    toppled cubes.
    One odd flight now blocks JUMP for five LEAPs. That is the right way
    round. At the G4b cadence of 12 a day it takes at most a day, and
    nothing is blocked below LEAP.

  F94 — NO SAMPLE IS REFUSED FOR ITS VALUE
    A filter that drops "outliers" by their rate would drop exactly the
    flights that should tighten the gate. A sample is refused only for a
    reason that is independent of its rate:
      · flight time outside ±15 % of the gesture's nominal (it was not a
        clean ballistic flight of that gesture)
      · contact during flight (it was caught, or landed on something)
    A saturated gyro is recorded as INT32_MAX, the worst possible sample,
    and that blocks JUMP. Flights are recorded from LEAPs and JUMPs, since
    both launch at 60° and use the same guide. HOPs are vertical, with a
    different lever, so they are not used. A JUMP-150 flight (230 ms) lies
    inside the JUMP-200 window (266 ms ±15 %), so the windows overlap. That
    does no harm, because q_eq uses the measured time and not the window.
    One hand-written vector had assumed the windows were disjoint. It was
    corrected once after the first run (vector 18).

  VECTORS AND FUZZ
    docs/corporate/cubiq/g12-v0.1-vectors.json, 20 vectors, expectations
    written from the rule text. They cover: empty record, 4 of 5, both
    limits ±1 mdps, one bad of five, roll-out after five more, sign, both
    window edges ±1 µs, weak-spring normalisation, saturation, contact, the
    drop reset, a JUMP sample, the JUMP windows, impossible inputs, and an
    INT32_MIN rate (it clamps instead of wrapping).
      Python reference 20/20 · C 20/20
      50,000-command differential fuzz (seed 20261127): 0 disagreements
      ASan + UBSan on 20,000 commands: 0 reports

  WHAT G12 STILL ASSUMES (B41, B42)
    That the thrust line of a LEAP and of a JUMP is the same line, because
    the same rod runs in the same guide (R10 §06). If the rocker's roller
    loads the rod off-axis at JUMP energy, a LEAP will not show it. B42 now
    records q on both gestures.

--------------------------------------------------------------------------------
03 // FSM v0.4 — THE LOOP THE CUBE RUNS
--------------------------------------------------------------------------------

  WHAT IS IN firmware/cubiq/ (new: cubiq_fsm.h 124 lines, cubiq_fsm.c 376,
  host driver cubiq_r12_test.c 196)
    The R08 state table is a bitmask the code enforces. An illegal edge is
    a firmware bug: the FSM goes to SAFE_HOLD and counts it, and it never
    improvises. Inputs (fall, lifted, pad lost, still, runway, tilt, sleeve,
    airborne, contact, gyro) arrive at any time through
    cubiq_fsm_poll(now). Durations are integer microseconds, and the R08
    EST timings are used unchanged. The FSM calls G12 before arming a
    JUMP, and feeds it on every ballistic landing.

  TABLE v0.4 = v0.3 + three edges
    DECOCK    → LOCK          F98: partial decock to the LEAP level, re-lock
    SAFE_HOLD → DECOCK        F96: relax a held spring once still
    SAFE_HOLD → IDLE          self-test exit (R06 G8), stated in the table

  F96 — THE SPRING IS A NUMBER (CORRECTION to R08 I1)
    v0.3 looked up spring energy by state name, and SAFE_HOLD is "0". In f1
    (fall at 0.5 s into a 1.1 s ARM) the motor stops and the worm
    self-locks with the cam 45 % of the way up (R08 F57). v0.3 then
    reported f1 as "ends at rest with zero spring". That was not true, and
    R08's "decock after self-test" wording never said when the decock would
    happen. v0.4 keeps the cam position in µs of motor time, and adds:
      I7  at rest (IDLE or SAFE_HOLD), cam = 0
    Once the fall is over and the IMU is still, SAFE_HOLD runs DECOCK in
    reverse only, which moves the plunger away from the foot. It then goes
    back to SAFE_HOLD. In f1 this adds 0.5 s of decock at t 2.0 s, and the
    trace becomes ARM > SAFE_HOLD > DECOCK > SAFE_HOLD.

  F97 — FREE FALL IS WHAT A JUMP IS
    Every ballistic gesture is free fall, and R06 confirms a fall after
    150 ms:
      HOP 10 mm        90.3 ms     below 150 ms
      LEAP 40 mm      118.8 ms     below 150 ms
      JUMP 150 mm     230.1 ms     CONFIRMS AS A FALL unless masked
      JUMP 200 mm     265.8 ms     CONFIRMS AS A FALL unless masked
    Unmasked, every JUMP would end in SAFE_HOLD and clear the G12 record.
    The JUMP would then lock itself out for five LEAPs after each use. v0.4
    masks the fall input from HOP_STROKE to LAND. The real fall, off the
    deck edge, is a FLIGHT that is still airborne at 1.5× its nominal time:
    FLIGHT → SAFE_HOLD, fall latch set, G12 cleared (scenario f11, 3.68 s).
    A late landing inside 1.5× (f12, a soft landing on a cushion) goes to
    LAND, and G12 refuses that flight's time (§02 F94). Scenario f16 drives
    the fall signal high 150 ms into a JUMP's flight: v0.4 lands normally
    and keeps its record.

  F98 — THE JUMP PATH AND ITS BUDGETS
    cock-on-intent (R06 F36) at the JUMP level: 3.1 s for 150 mm, 4.1 s for
    200 mm (R10 §06 midpoints, EST). If the ARMED re-check finds room for a
    LEAP but not a JUMP, the cube decocks part-way to the LEAP level (1.0 s
    of cam, EST), re-locks, re-checks and fires a LEAP. A fall during a
    partial decock turns it into a full one (f10). "Decock time = time
    spent arming" (R08 F57) generalises to "decock time = cam above the
    target".
      first motion (EST)      v0.4     budget   note
      SETTLE / NUDGE          0.00 s    0.1 s
      HOP                     1.00 s    1.5 s
      LEAP                    1.26 s    1.5 s
      JUMP 150                3.26 s    3.5 s   NEW (F98)
      JUMP 200                4.26 s    4.5 s   NEW
      substitute after LEAP   2.47 s    3.0 s   R08 F57, unchanged
      substitute after JUMP   5.63 s    6.0 s   NEW: partial decock; full + re-arm 7.63 s
    I4 now checks these budgets. A JUMP arms for 3-4 s with an audible
    whirr (R07 §02). This is the cost R10 named. The cube arms only for an
    intent that already allows a JUMP, so the cost is paid in waiting, and
    it does not add stored energy.

  F99 — R08 f3 IS NOT WHAT THE CONTRACT SAYS (CORRECTION)
    R08 f3: a hand appears 70 mm ahead at the re-check, and the cube
    substitutes a HOP. The runways in the contract (R06/R08 §04) say
    otherwise:
      off the pad   LEAP 125, HOP 85    → 70 mm gives NUDGE   (f3b)
      on the pad    LEAP 60,  HOP 20    → 70 mm passes, LEAP FIRES (f3c)
    The HOP substitute happens at 85-124 mm off the pad, and v0.4 runs f3
    at 100 mm (f3). The on-pad case is the real finding. The pad's 60 mm
    is a SURFACE number: the deck edge is known (R08 §04, "surface, not
    airspace"). The ToF cannot tell a hand from a deck edge, though. With
    the pad credit applied, a 40 mm LEAP fires toward a hand that is 70 mm
    away and may still be moving, and lands about 30 mm short of it. The
    contract is not wrong to credit the surface, but obstacle
    clearance probably needs its own number, kept apart from the deck
    runway. R12 opens B48 and D65 and changes nothing until it is measured.

  RESULTS (script part 6)
    30/30 scenarios pass the expectations and invariants I1-I7: the 5
    gesture traces, R08 f1-f8 (with f3 split into f3/f3b/f3c), and 15 new
    v.1 and G12 scenarios (j150, j200, j200 capped to 150, unverified,
    one-bad-of-five, a v.0 asked for a JUMP, f9-f16). No illegal edges, no
    forward motor after a fall, ARMED never longer than 10 s, and every
    rest has cam 0.
    Against R08 v0.3, same faults, same timings: 12/14 are identical in
    sequence, rest time and first motion (to 2 µs). The two that differ
    are expected:
      f1   +DECOCK > SAFE_HOLD (F96)
      f4   rest −50 ms: the I5 10 s clock now starts on entering ARMED,
           not at the re-check. The spring is at full energy from LOCK,
           so the stricter clock is the honest one.
    The 54 contract v0.4 vectors, decided by R08's decide() and driven
    through the C FSM, give 54/54 traces identical to v0.3.
    ASan + UBSan: all 30 scenarios, 0 reports.

  WHAT THE FSM IS NOT, YET
    It does not sample a sensor: the host harness supplies the inputs at
    event times, and the MCU's 1 kHz loop will call the same poll(). Its
    timings are EST until MULE-1 (B32). The tilt "plant" in the harness
    (−20° per RECOVER pulse) is R08's EST.

--------------------------------------------------------------------------------
04 // F100 + F101 — WHAT THE PLATFORM SENDS THE CUBE
--------------------------------------------------------------------------------

  F100 — NOTHING EARNS A JUMP YET
    The class ceilings (R06 F39, cubiq_contract.c:21) top out at LEAP, and
    OPERATOR_MAX is LEAP. decide() cannot return JUMP for any signal. That
    is deliberate: D27 has been open since R06. The 82 v0.6-draft vectors
    contain no performed JUMP. R12's JUMP scenarios therefore start from a
    plan (gesture + range) passed to cubiq_fsm_start(). That tests the FSM
    and G12, not the contract. When D27 is answered, the contract gets a
    class and vectors, and the plan comes from decide().

  F101 — THE CODEX'S RAREST BADGES WOULD BE THE QUIETEST
    The Badge Codex has a rarity field with seven values: 'common' …
    'legendary' | 'mythic' | 'cosmic' (src/client/utils/badges.ts:798). The
    hc8hpk report counts eight tiers in Codex v33. The platform's mapper
    knows five:
      achievementClass('epic')    → badge_rare   (LEAP)
      achievementClass('mythic')  → badge_common (HOP)
      achievementClass('cosmic')  → badge_common (HOP)
    So a COSMIC codex badge, the rarest thing the platform awards, would
    move the cube less than an "epic" RPG achievement. The mapper is
    encoder-side, and it is not wired into the platform yet (R09). The
    proposed fix is one line: epic | legendary | mythic | cosmic →
    badge_rare. R12 does not change the code. The mapping is S-2's call
    (D64), and any rarity the mapper doesn't recognise should be read as
    badge_rare, not badge_common (D64b).

  D64 — A CANDIDATE ANSWER TO D27 (offered, not decided)
    Engineering's constraints on any class that earns a JUMP:
      · v.1 only, G12 verified (§02), surface DAMPED (R06 F34), not in quiet
        hours or HUSH, not on a moving surface (G11).
      · rare enough that 3-4 s of audible arming is an event: ≤ 1 a day
        (G4b), and in practice a few a year.
      · never raised by the operator ceiling (R06 F39 stays). It is earned,
        not configured. The operator may LOWER it (as for every class).
    The platform already has a class that fits: COSMIC-rarity codex badges.
    Candidate: badge_cosmic, ceiling JUMP on v.1 (LEAP on v.0 via device
    capability). This is a product decision. If S-2 agrees, R13 writes the
    contract change and its vectors. Use Case 12 assumes it, and says so.

--------------------------------------------------------------------------------
05 // MASS BUDGET — UNCHANGED (v0.9)
--------------------------------------------------------------------------------

    R12 is code and analysis only. v.0 108.7 g (margin 11.3 g). v.2 116.2 g
    (margin 3.8 g). The firmware that R12 adds costs flash, not grams:
    cubiq_g12.o + cubiq_fsm.o are 5.4 kB of text + data at -O2 on x86-64 (an ARM
    Cortex-M build will differ, B49).

--------------------------------------------------------------------------------
06 // VALIDATION PLAN — DELTAS TO R11 §06
--------------------------------------------------------------------------------

  B23  REVISED  CI adds scripts/cubiq-r12-g12-fsm.py with ≥ 20,000 fuzz
                commands: G12 vectors 20/20 in both implementations, 0 fuzz
                disagreements, 30/30 FSM scenarios, 54/54 v0.3 traces,
                sanitizers clean. All green in this repo today.
  B41  REVISED  Results reported in °/s (q_eq), not degrees. The gyro's q_eq
                must agree with the video-derived pitch rate within
                0.5 °/s. Record t_flight for every flight.
  B42  REVISED  Topple onset measured in q_eq (°/s) for 150 and 200 mm
                JUMPs. Record q on LEAP AND JUMP for each offset unit (the
                same-line assumption, §02). PASS: onset ≥ 1.5 × the header
                limits. If it is lower, the limits drop and the header
                changes.
  B45  NEW      Fall detector vs ballistic flight, MULE-0 v.1 rig: 50 JUMPs
                at 150 mm and 50 at 200 mm. PASS: 0 false falls (masking
                works). Then 10 deliberate edge exits onto foam 300 mm
                below: 10/10 detected as flight_overrun, G12 cleared.
  B46  NEW      Partial decock repeatability, MULE-0 v.1 rocker: 100
                JUMP-level arms decocked to the LEAP level, then fired.
                PASS: LEAP range 40 mm ±10 % (R04 σ); 0 latch slips.
  B47  NEW      Held spring after a fall during ARM, MULE-1: 50 drops of
                0.75 m onto foam at random cam positions. PASS: every unit
                ends SAFE_HOLD with cam 0 within 3 s of stillness, and
                none fires.
  B48  NEW      Hand vs deck edge on the pad, MULE-1 + home pad: hands,
                mugs and a puzzle box at 40-120 mm ahead. Find the
                obstacle clearance the ToF needs beyond the 60 mm deck
                runway (F99, D65).
  B49  NEW      Firmware on target: cross-compile firmware/cubiq/ for the
                v.0 MCU (Cortex-M class), run the vectors on the device.
                PASS: identical outputs; flash and stack within budget.
  MULE allocation: B45-B46 MULE-0, B47-B48 MULE-1, B49 dev board. 46 of 50
  B-items now run before any custom part (R11: 41 of 45). The four that
  need one are unchanged: B8, B17, B19, B26.

--------------------------------------------------------------------------------
07 // ROADMAP CHECK — DOES R12 HELP OR HURT v.1-v.3?
--------------------------------------------------------------------------------

  v.0             Helped. The FSM the cube will run exists in its own
                  language, and it enforces the table it used to only be
                  checked against. A spring held after a fall is now
                  relaxed (F96). The f3 correction tells the on-pad design
                  where to look (B48).
  v.1 LONG JUMP   Helped the most. Three defects that would each have
                  stopped v.1 in the field were found on paper: every JUMP
                  read as a fall (F97); the median let a bent guide through
                  (F93); a weak spring passed as a good thrust line (F92).
                  The JUMP now has a latency budget and a cheaper way to
                  back down (F98). Its range is set per unit by a number
                  the unit measures.
  v.2 SWINGS      Neutral. The v.2 turn-hop is a HOP in this FSM. The
                  reaction wheel (R10 D52) needs its own states (SPIN-UP,
                  BRAKE), which go into v0.5.
  v.3 LEVITATION  Clarified. "A flight longer than its nominal time is a
                  fall" (F97) is exactly the rule a hover must break. A
                  levitating cube needs a different source of truth for
                  "am I supported?": the field it hovers in, not the
                  accelerometer. That is a v.3 requirement R12 can now
                  state.
  PLATFORM        A mapping bug was found before the platform is wired:
                  F101 would have made the rarest badges the quietest.

--------------------------------------------------------------------------------
08 // CONSUMER USE CASE 12 — THE JIGSAW TABLE
--------------------------------------------------------------------------------

(Also appended to LOT-CUBIQ-QUANTUM-CUBE-v0.md §07. Prior entries untouched.)

  Operator profile: Legacy tier, 68. A retired land surveyor who lives
  alone in a terraced house with a 2.2 m oak dining table, which has not
  been used for dining since the grandchildren grew up. A 2,000-piece
  jigsaw occupies the near end of it for six weeks at a time. The cube is
  a v.1 that lives on its home pad at the far end, next to the puzzle
  boxes. The surveyor's archetype directive is about patience. Their
  cohort is four puzzlers who swap boxes by post. They describe the
  phone as "the thing that makes me lose my place".
  (The JUMP in this use case assumes D64: a COSMIC codex badge earns
  JUMP. Without D64, every JUMP below is a LEAP.)

  DAY 1, 09:10. The cube is new. Its G12 record is empty, so a JUMP is not
  yet allowed: G12_pitch_unverified (§02). Over the first week, five
  ordinary LEAPs (rare badges, a cohort milestone) each measure the
  thrust line in flight. The worst of the five reads 17.9 °/s, 0.40°. On
  day 6 the record is complete and the unit is cleared for 200 mm. The
  surveyor notices none of this. They only see that it has started to
  move across the deck a little more confidently.

  WEEK 4, 15:40. The surveyor finishes the sky, the hardest 600 pieces.
  The platform has a COSMIC codex badge for a 28-day streak of answering
  the evening Memory question (perfect_month, badges.ts:176). Under F101's
  proposed mapping and D64, the class is badge_cosmic and the cube JUMPs.
  It takes 4.1 s to cock, a faint whirr from the far end of the table
  that makes the surveyor look up. Then it crosses 200 mm of oak in 266
  ms and lands square beside the box lid. The free-fall detector reported
  a fall 150 ms into the flight. The FSM masks that input while the cube
  is ballistic (F97), so the cube landed, reset and went back to IDLE
  instead of locking itself out. The surveyor laughs out loud, alone in
  the house, at a piece of furniture. That is the whole use case in one
  sentence.

  WEEK 5, SATURDAY. The grandchildren visit. The seven-year-old picks up
  the cube, puts it back on the table and knocks it with an elbow. It
  slides off onto the rug, 74 cm down. The fall lasts 389 ms, so G8
  confirms it: the G12 record is cleared and the cube goes to SAFE_HOLD.
  The cube is set back on its pad, and the self-test brings it back to
  IDLE. Later the same child drags the pad across the table by its cable,
  and the cube tips against a mug. That is a knock, not a fall, so
  nothing is recorded. The plunger guide is now very slightly bent.

  WEEK 5, SUNDAY. Over the next day, five LEAPs rebuild the record. The
  third of them, the first after the cable incident, reads 42.5 °/s
  (0.95°). Under R11's median it would have been one bad sample of five,
  and a 200 mm JUMP would still have been allowed. A 200 mm JUMP topples
  at 0.85°. Under R12's max (F93) the cube is held to LEAP:
  G12_pitch_over_limit. The surveyor's app shows one line under device
  status: "long jump paused — this cube measured its own launch and
  wants a check". The surveyor has spent forty years trusting
  instruments that report their own error. They email support with a
  photo, and a replacement guide arrives in the post along with the next
  puzzle box.

  WEEK 6, 21:15. The last piece. The surveyor reaches for the cube's side
  of the table to clear the box lids just as an achievement fires. The
  cube is armed for a JUMP. At the re-check the ToF sees a hand 150 mm
  ahead: no room for 200 mm, room for 40. The cube decocks part-way to
  the LEAP level and re-locks (F98), and LEAPs into the space the hand
  just left. The first motion comes 5.6 s after the signal. A full decock
  and re-arm would have taken 7.6 s.

  What Use Case 12 proves that 01-11 did not:
    · A JUMP is safe only per unit, and the unit can show that it is.
      The record is built from ordinary LEAPs, and no operator calibrates
      anything.
    · Damage nobody saw is caught by the next flight, not by the next
      service. The max-of-five rule is what makes "the next flight" true.
    · The biggest gesture must survive its own physics: a 230-266 ms
      flight is free fall, and the fall detector has to know it is part
      of the plan.
    · Backing down should be cheap. A partial decock gives a LEAP 2 s
      sooner than starting over.

  Consumer market: slow, table-sized hobbies such as jigsaws, model
  building, tabletop wargaming, stamp and coin collecting, and
  genealogy. These are long sessions where a phone costs the user their
  place. Also older adults living alone who want something present on
  the table that is not a screen, and households where grandchildren
  visit, so the object has to survive and diagnose ordinary knocks.

--------------------------------------------------------------------------------
09 // DECISIONS FOR S-2
--------------------------------------------------------------------------------

  D0  PROCESS: merge one CUBIQ branch (this one, R01 → R12) to master, or
      point the routine at a single long-lived branch. (Tenth time.) Two
      runs this week rebuilt Cycle 02 from scratch.
  D41 FIRST SPEND: still open from R08. B41-B48 need MULE-0/1, and paper
      work is close to exhausted (§10).
  D61 Adopt G12 v0.1 as specified: q_eq (flight-normalised rate), the max
      of the last 5, limits 34,964 / 25,355 mdps, refusals only for flight
      time or contact, saturation counted as the worst sample, cleared by
      G8. This supersedes R11 D58's median and degree limits (F92-F95).
  D62 Adopt FSM v0.4 (firmware/cubiq/cubiq_fsm.*) as the firmware
      reference: cam position tracked with I7, SAFE_HOLD decock, ballistic
      fall masking with the 1.5× overrun rule, partial decock, and I5
      counted from ARMED entry (F96-F98).
  D63 Latency budgets: JUMP 150 ≤ 3.5 s, JUMP 200 ≤ 4.5 s, substitute
      after JUMP ≤ 6.0 s (F98).
  D64 (product) Answer D27: badge_cosmic → JUMP on v.1, earned only, never
      raised by the operator. D64b: achievementClass() maps epic |
      legendary | mythic | cosmic → badge_rare (or badge_cosmic if D64),
      and an unknown rarity maps upward, not to badge_common (F100, F101).
  D65 Hold the on-pad runway credit as it is until B48 measures obstacle
      clearance. Then decide whether obstacle clearance gets its own
      runway number (F99).
  Open and compatible: R05 D14, D16-D19; R06 D20, D21, D23-D28; R07
  D29-D35; R08 D36-D40; R09 D42-D49; R10 D50-D54; R11 D55-D57, D59, D60.
  (D58 is superseded by D61.)

--------------------------------------------------------------------------------
10 // NEXT CYCLE (R13) PROPOSED SCOPE
--------------------------------------------------------------------------------

  · If D41 is approved: MULE-0 (B1, B33, B36, B41, B42, B45, B46) and MULE-1
    (B31, B37, B38, B43, B44, B47, B48), and B49 on a dev board. Replace
    the EST timings and limits with measured ones, and report what moved.
  · If not:
      – If D64 is approved: contract v0.7-draft with badge_cosmic and its
        vectors, and decide() → plan → FSM run end to end in C, so the
        JUMP plan comes from the contract.
      – FSM v0.5: the v.2 reaction-wheel states (SPIN-UP, BRAKE) and the
        turn-hop, with the R10 yaw numbers as vectors.
      – The main loop in C: decide() + G12 + FSM + the TTL queue (R11 F86)
        as one cubiq_tick(). That is everything the cube does except the
        drivers.
  · Use Case 13, chosen from themes not yet used across all branches.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-R12
================================================================================
