================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-R11
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report R11
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-25
VERSION:  0.11 — FIRMWARE REFERENCE (C) · CALENDAR RULE · LANDING TIP-OVER · v.2 LAYOUT
STATUS:   v.0 — PRE-HARDWARE · FIRST SPEND (D41) STILL OPEN
PREDECESSORS: LOT-CUBIQ-QUANTUM-CUBE-v0.md     (R01, 2026-07-28)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R02.md … -R10.md (2026-11-10 … 2026-11-23)
================================================================================

R11 is the eleventh development cycle of the v.0 actuated haptic notification
device. D41 (first spend) is still unanswered, so R11 takes R10 §12's "if not"
branch: the C port of decide(), and v.2 layout v0.3 with the tip-over re-run.
It also takes a finding from a parallel CUBIQ run on another branch. There are
eight results. The C port did its job on the first run: it found
disagreements that two implementations and 200,000 fuzz cases had missed.

  1. FIRMWARE REFERENCE: decide() now exists in C99, the language the cube
     will run (firmware/cubiq/). It includes its own strict JSON decoder,
     uses no malloc and bounds its recursion. It passes every vector file
     the programme has ever written: 30, 44, 54, 59, 72 and 82 of each. It
     agrees with Python on 100,000 fuzz cases, INCLUDING the integer-as-float
     pool that TypeScript can never agree on. R09's F66 wire rule is now
     enforced on the cube itself.
  2. CORRECTION to R09 §02 ("one rule, both sides"): the v0.5 timestamp
     profile fixed the SYNTAX and left the CALENDAR to each library. They
     disagree INSIDE the profile. Python reads "+05:60" as +06:00.
     JavaScript's Date.parse accepts 2026-02-29, 2026-04-31 and T24:00 (it
     rolls them over) and keeps only milliseconds. On calendar edge cases the
     ADOPTED v0.5 pair (TypeScript decide vs Python) disagrees 768 times in
     10,129. The v0.6 draft now writes the calendar into the contract, and
     the new vectors are 73-82.
  3. A CLOCK THAT CANNOT BE READ MUST NOT PERFORM: in TypeScript, an
     unparseable device clock becomes NaN. Every comparison with NaN is
     false, so v0.5 decide() falls through to "performed" whatever the
     time. The v0.6 draft now throws, Python raises, and the C port returns
     a state fault (F86).
  4. LANDING TIP-OVER, RECONCILED: the parallel Cycle-02 report found "v.1
     long jump at 45° tips above v_h ≈ 0.70 m/s". Its model reproduces
     exactly for this geometry (0.667 m/s), but that model ignores the
     vertical impulse. With the impulse balance this chain already uses for
     sticking landings (R04 F19), a flat landing cannot start a rotation at
     any speed unless μ_feet > b/h ≈ 0.97 (§03 A).
  5. THE REAL v.1 LIMIT IS IN-FLIGHT PITCH: a thrust line 0.72° off the
     CoM (R08 F54, the worst-case stack) spins the cube in flight. A 150 mm
     JUMP lands pitched 14.4° on ONE foot, and a 200 mm JUMP lands pitched
     19.2°. Topple onset is at 1.18° (150 mm) and 0.85° (200 mm) of
     thrust-line error, margins of 1.6× and 1.2×. v.0's LEAP has 6.9×.
     Asking 2× over an unmeasured stack limits v.1 to 125 mm. R11 proposes
     G12, a per-unit PITCH SELF-CHECK. The gyro measures the cube's own
     thrust-line error on every LEAP, and JUMP is enabled only when that
     error is small enough (F88).
  6. v.2 LAYOUT v0.3: the reaction wheel goes in the top zone. Its mounting
     (FR4 stator disc, two bearings) adds 1.2 g that R10 did not count, so
     v.2 is 116.2 g with a 3.8 g margin. The CoM rises +1.36 mm (R10
     estimated ~1.4) and the static tip angle goes from 44.2° to 42.4°.
     Every v.2 gesture keeps ≥ 6.2× tip-over margin. The spinning wheel
     couples 0.13° of roll into a turn-hop, which is negligible (F89).
  7. COLD ROOMS: a cold cube carried into a warm kitchen fogs its ToF
     window for 10-30 minutes (lumped model). That is G7 "dirty" and needs
     no new guard. Li-ion charging on the pad gets a temperature window
     (F90).
  8. Use Case 11 — THE GARDEN STUDIO: an illustrator in an unheated garden
     office in January. It is the first use case where temperature is the
     main condition, and the first where the cube loses its clock.

Everything here is analysis or reference code. No hardware exists. No part has
been bought. Inputs marked EST are placeholders for bench measurement.

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Own prior work (read this cycle):
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R10.md   read in full. §02
    contract v0.6-draft; §04 reaction wheel (I_body 38,800 g·mm², ring 544
    g·mm², peak 1,792 rpm on a 20 mm hop); §08 mass budget v0.8; §12 the R11
    scope this report follows.
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R09.md   §02 F66 (the timestamp
    profile, "one rule, both sides", which §02 here corrects).
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R08.md   §02 F51: CoM 20.56 mm,
    static tip-over 44.2°, foot pitch 40 mm. F54: thrust-line stack 0.72°.
    §03 section view: top zone z 38.4-46.
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R06.md   F32 60° launch, F34
    landing impact. R04 F19: landings stick when μ ≥ cot θ / (1+e).
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R03.md   RECOVER at 25° tilt,
    SAFE-HOLD if still tipped.
  Re-run before writing: all 16 earlier CUBIQ Python scripts exit 0, and
    both TypeScript checks pass (54/54, 59/59, 72/72, 59/59 extension,
    42/42 encoder).

Parallel CUBIQ work (other branches, read this cycle):
  claude/tender-turing-mqesdo  docs/corporate/LOT-CUBIQ-v0-DEV-REPORT-02.md
    (2026-11-24). A separate run started from master's R01 and wrote its own
    "Cycle 02". Its §03 finding, "v.1 long jump at 45° tips, 72° is safe",
    is the claim §03 here re-derives for this chain's geometry. Its Use
    Case 02 ("The Quiet House") was added to the theme list below.

LOT® Institute corpus (re-read in the cited sections):
  docs/corporate/LOT-CUBIQ-OPERATOR.md   §04 "The AI reads … Seasonal
                                          context (weather, time of year,
                                          circadian data)". The platform
                                          already reads the season. Use Case
                                          11 is the first where the OBJECT
                                          has to cope with it as well.
  src/server/utils/contextual-prompts.ts  the weather-mood pattern
                                          (tempKelvin → "It's 3°C — you tend
                                          to feel …"). The Memory question
                                          in Use Case 11 comes from here.
                                          The cube is not told the weather;
                                          it measures its own.
  docs/corporate/LOT_QI46_ENGINE.md       the Month-12 Calibration Loop. A
                                          per-unit, MEASURED thrust-line
                                          error (G12) is the first
                                          calibration value the cube learns
                                          about itself rather than about its
                                          operator.
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md  "The object should feel the
                                          field it sits in." R10 read that
                                          as motion. R11 reads it as cold,
                                          humidity and time.
  docs/corporate/LOT-CUBIQ-VISION.md      §01 "returns structure". A cube
                                          that has lost its clock has no
                                          structure to return, so it waits
                                          (F86).

PROCESS NOTE — CONTINUITY, S-2 (ninth time)
  This run started on `claude/tender-turing-wba0c1`, cut from `master`.
  `master` still holds only R01. The R01→R10 chain was on
  `claude/tender-turing-5c0bpq` (2026-11-23) and was fast-forwarded onto
  this branch, which now holds R01→R11 in order. A run on 2026-11-24
  (`claude/tender-turing-mqesdo`) did NOT find the chain and started its
  own "Cycle 02" from R01. It is not a bad report. It duplicates work the
  chain did in R02-R04, and one of its findings needed reconciling here.
  D0 is still the fix. D41 got no answer before this run. Scheduled runs
  have no live input, so D41 is OPEN and nothing is spent.
  Use-case themes checked across every CUBIQ document on all branches
  (R10's list, plus The Mooring and The Quiet House): "garden", "shed
  office", "outbuilding", "chalet", "condensation", "fogged" and "dew
  point" appear in no CUBIQ document on any branch. "second home" appears
  once, meaning the nightstand. No use case has made TEMPERATURE its main
  condition, and none has had the cube lose its clock. Use Case 11 covers
  both.

--------------------------------------------------------------------------------
01 // WHAT CHANGED IN R11
--------------------------------------------------------------------------------

  F84  C99 firmware reference: decoder + decide(), v0.5 and v0.6-draft
       modes, no malloc, depth ≤ 16. Every vector file passes; 100,000-case
       fuzz: 0 disagreements with Python in all five pools.            §02
  F85  CORRECTION to R09 §02: the timestamp profile left the calendar to
       each library. Calendar rule + microsecond comparison written into
       v0.6-draft. Vectors 73-82 (82 total).                           §02
  F86  An unreadable device clock must not perform. v0.5 TypeScript does
       (NaN comparisons fall through). v0.6-draft throws; C faults.    §02
  F87  Landing tip-over: flat landings cannot start a rotation unless
       μ > b/h. The binding limit is in-flight pitch from thrust-line
       error. v.1 JUMP margin 1.6× (150 mm), 1.2× (200 mm); 125 mm at
       2× without G12.                                                 §03
  F88  G12 pitch self-check: the gyro measures each unit's thrust-line
       error on every LEAP. JUMP is enabled per unit only below a limit. §03
  F89  v.2 layout v0.3: wheel in the top zone, 116.2 g (margin 3.8),
       CoM +1.36 mm, static tip 42.4°, tip margin ≥ 6.2× on v.2.       §04
  F90  Cold rooms: fogging is G7; temperature window for charging.     §05
  F91  Use Case 11 — THE GARDEN STUDIO.                                §09

  Reproduce every number in this report with:
      python3 -I scripts/cubiq-r11-c-fuzz.py 100000   (builds firmware/cubiq; vectors; 3-way fuzz)
      python3 -I scripts/cubiq-r11-contract-v06.py    (Python v0.6-draft R11: 82/82)
      python3 -I scripts/cubiq-r11-landing.py         (§03-§05)
      node scripts/cubiq-r10-contract-check.ts        (TypeScript: unchanged results)
  All R09 and R10 commands still pass unchanged. decide() is still v0.5.

--------------------------------------------------------------------------------
02 // F84 + F85 + F86 — THE FIRMWARE REFERENCE, AND WHAT IT FOUND
--------------------------------------------------------------------------------

  WHY C, AND WHY NOW
    R09 §02: "the cube that DECIDES them will be C on an MCU". R10 §12 asked
    for the third implementation. A contract that has only been run in
    garbage-collected languages has never met the constraints it will ship
    under: fixed memory, no exceptions, and a decoder somebody has to write.

  WHAT IS IN firmware/cubiq/ (766 lines)
    cubiq_json.{h,c}      strict JSON decoder into a caller-supplied arena.
                          No malloc. Depth > 16 is an error, never a stack
                          overflow. Duplicate keys: the last wins (Python's
                          rule). NaN and Infinity are rejected. Strings carry
                          lengths, so an embedded NUL cannot shorten a class
                          name. R09 F66 is decided LEXICALLY: a number with
                          '.', 'e' or 'E' is not an integer, so "priority":
                          2.0 is type_priority.
    cubiq_contract.{h,c}  decide() in two modes: CUBIQ_V05 (adopted) and
                          CUBIQ_V06_DRAFT. The decision order is R10 §02's,
                          written out. Time is integer microseconds, and the
                          timestamp parser and calendar are written out, not
                          handed to libc. A malformed STATE (the firmware's
                          own data) returns EV_FAULT, a distinct outcome,
                          never a gesture.
    cubiq_contract_test.c host driver: runs vector files, or reads JSON lines
                          on stdin for the fuzz.
    Builds clean with -std=c99 -Wall -Wextra -Wpedantic -Werror (gcc, clang).

  RESULTS
    vectors, C v0.5 mode         v0.2 30/30 · v0.3 44/44 · v0.4 54/54 · v0.5 59/59
    vectors, C v0.6-draft mode   R10 72/72 · R11 82/82
    differential fuzz, 100,000 cases, seed 20261125 (R09 + R10 generators,
    plus two R11 pools):
      pool       cases    A: C vs Py v0.6   TS v0.6 vs Py   B: C vs Py v0.5   B known F85
      plain     79,830          0                 0                0               0
      float      5,029          0             4,806 (F66)          0               0
      odd_ts     5,012          0                 0                0               0
      ts_edge    7,141          0                 0                0              70
      ttl_edge   2,988          0                 0                0               0
      Python exceptions 380, every one matched by a C state fault. C faults
      without a Python exception: 0.
    Decoder spot checks (escapes, duplicate keys, 2.0 / 2e0 / 10^30, NaN,
      trailing data, depth 40, NUL inside a class name)              9/9
    ASan + UBSan build: 60,000 decisions, plus 20,000 byte-mutated wire
      lines (17,002 rejected by the decoder, the rest decided). 0 sanitizer
      reports, and every line gets a defined outcome.

  F85 — WHAT THE NEW POOLS FOUND
    ts_edge draws timestamps INSIDE the v0.5 profile that a calendar must
    judge: month 00/13, Feb 29 in leap and common years, day 31 in 30-day
    months, hour 24, minute or second 60, offsets +23:59/+24:00/+05:60, and
    1-7 fraction digits. ttl_edge puts `now` at not_before + ttl_s, and 1 µs
    either side of it. Probing each library directly:
                                   Python 3.11        V8 Date.parse     C (R11)
      2026-02-29T00:00Z            reject             ACCEPT (Mar 1)    reject
      2026-04-31T00:00Z            reject             ACCEPT (May 1)    reject
      2026-01-01T24:00Z            reject             ACCEPT (+1 day)   reject
      2026-01-01T00:00+05:60       ACCEPT (+06:00)    reject            reject
      2026-01-01T00:00+05:99       ACCEPT (+06:39)    reject            reject
      …T10:15:00.000001Z           µs                 ms (truncated)    µs
    R09 F66 believed that one regular expression made Python and TypeScript
    read a timestamp the same way. It made them read the same CHARACTERS.
    The calendar under the characters is each library's own. The adopted
    v0.5 pair (TypeScript decide vs Python v0.5) on the 10,129 calendar-pool
    cases:
      703  calendar / microsecond differences (e.g. 480 "Python expired,
           TypeScript performed": 1 µs past the TTL)
       65  the device clock was unreadable (F86)
    THE RULE (v0.6-draft, all three implementations):
      year 0001-9999 · month 01-12 · day valid for its month (Gregorian
      leap years) · hour 00-23 · minute 00-59 · second 00-59 (no leap
      second) · fraction 1-6 digits · offset hours 00-23, minutes 00-59 ·
      every comparison in integer microseconds.
    TypeScript: parseTsMicros() in src/shared/cubiq/signal-contract.ts, used
    only by decideV06Draft(). Number holds microseconds exactly up to 2^53
    µs, the year 2255. Python: scripts/cubiq-r11-contract-v06.py adds the
    offset check to R10's file, which is otherwise loaded unchanged.
    NEW VECTORS (docs/corporate/cubiq/signal-contract-v0.6-draft-r11-vectors.json,
    01-72 unchanged; each expectation written by hand before any run):
      73  2026-02-29 (common year)            → rejected bad_not_before
      74  2024-02-29 (leap year)              → performed hop
      75  2026-04-31                          → rejected
      76  T24:00                              → rejected
      77  +05:60                              → rejected
      78  15:59+05:59 = 10:00Z                → performed hop (offset arithmetic)
      79  now = not_before + ttl + 1 µs       → expired
      80  now = not_before + ttl exactly      → performed (the boundary is inclusive)
      81  not_before .5 s, now .4 s           → held
      82  year 0000                           → rejected
    On 73-82, the adopted TypeScript decide() gets 5 wrong (73, 75, 76, 79,
    82), and the adopted Python v0.5 gets 1 wrong (77). decide() stays at
    v0.5 (R10 D50). Adopting v0.6 closes F85 (D56).

  F86 — NaN IS NOT A TIME
    In TypeScript v0.5, a `now` that doesn't parse is NaN. Then `now >
    expiry` and `now < not_before` are both false. A signal is neither
    expired nor held, and it PERFORMS. The platform passes its own clock,
    so this cannot happen there today. But the same function is meant to
    run in the app as a preview ("what will my cube do?"), and the
    firmware's clock is exactly the one that can be lost (Use Case 11,
    09:00). The rule, in all three: no readable clock, no decision.
      Python   raises (as it always did)
      TS v0.6  throws RangeError("cubiq: bad device clock …")
      C        returns EV_FAULT "state_now". The firmware maps it to "clock
               unsynced": nothing performs, signals stay queued, and the
               TTL decides once the phone sets the time.
    The --cases mode of scripts/cubiq-r10-contract-check.ts now reports a
    throw as ["crash"]. That is a harness change only: R10's results are
    unchanged.

  KNOWN AND ACCEPTED
    TypeScript still cannot tell 2.0 from 2 (R09 F66, 4,806 cases). The
    encoder rule closes this on the sending side, and the C decoder closes
    it on the receiving side. The cube is the authority (R09 F64), so a
    float can no longer change what a cube does.
    B's 70 known cases are the v0.5 Python accepting +05:60 offsets, and a
    v0.5 Python quirk: the profile is applied to not_before only, and
    fromisoformat accepts `now` = "23:00:00.Z". `now` is the cube's own RTC,
    never wire data.

--------------------------------------------------------------------------------
03 // F87 + F88 — LANDING TIP-OVER, RECONCILED, AND THE REAL v.1 LIMIT
--------------------------------------------------------------------------------

  Planar rigid-body model (scripts/cubiq-r11-landing.py). v.0 108.7 g, CoM
  h 20.56 mm, foot half-pitch b 20 mm, I_pitch 38,800 g·mm² (EST; R10's
  I_z used for the horizontal axis). Landing restitution e 0.2 and feet μ
  0.5 (R04 F19, EST). 60° launch (R06 F32).

  A. FLAT LANDING — CAN THE IMPACT START A ROTATION AT ALL?
    On a sticking landing, the friction impulse J_x and the normal impulse
    J_y must balance about the CoM. They do if their resultant meets the
    floor inside the base: x_c = h·J_x/J_y ≤ b. Friction caps J_x at
    μ·J_y, so x_c ≤ μ·h. A flat landing can start a forward rotation only
    if μ > b/h, at ANY speed:
      v.0 / v.1   b/h 0.97        v.2 (wheel)   b/h 0.91        feet μ 0.5
    At 60°, J_x/J_y = cot 60° / (1+e) = 0.48 (the R04 F19 sticking number),
    so x_c = 9.9 mm of the 20 mm available. Even a sticking 45° landing
    with e = 0 gives x_c = 20.6 mm: just past the edge, and only if the
    feet can supply μ ≥ 1.

  B. THE CYCLE-02 MODEL, REPRODUCED
    Cycle-02 (mqesdo) put all of m·v_h·h into rotation about the leading
    foot and ignored the vertical impulse. For this geometry it gives v_h
    critical = 0.667 m/s (Cycle-02 quoted ~0.70 for its own):
      LEAP 40 mm @60°    v_h 0.337   ok     1.98×
      JUMP 150 mm @60°   v_h 0.652   ok     1.02×
      JUMP 200 mm @60°   v_h 0.753   TIPS   0.89×
      JUMP 150 mm @45°   v_h 0.858   TIPS   0.78×
    That model is a bound, not a mechanism. In a rigid impact the vertical
    momentum has a moment about the leading foot, and it rotates the cube
    BACK onto its base (A). The two reports agree on the direction (steeper
    is safer, 45° is the worst axis). They disagree about the cause.

  C. WHAT BOTH MODELS MISS — IN-FLIGHT PITCH
    A thrust line that misses the CoM by d gives angular impulse J·d. The
    cube leaves the table spinning at ω = m·v·d/I and lands pitched
    ψ = ω·t_flight, on ONE foot. R08 F54's worst-case stack is 0.72°, which
    is d = 0.30 mm on the 23.7 mm tip-to-CoM lever. The model: plastic,
    sticking impact at that foot, with angular momentum about the foot
    conserved. The cube topples if the rotational energy after impact
    exceeds m·g·(|GP| − y_GP). Worst spin sign:
      gesture             config        pitch at landing   energy / barrier
      HOP in place 10 mm  v.0               1.9°               0.00  settles
      LEAP 40 mm @60°     v.0               3.8°               0.00  settles
      LEAP 40 mm @60°     v.2               4.0°               0.00  settles
      JUMP 150 mm @60°    v.1              14.4°               0.00  rocks
      JUMP 200 mm @60°    v.1              19.2°               0.28  rocks
    THRUST-LINE ERROR AT WHICH EACH GESTURE FIRST TOPPLES (0.01° scan):
      HOP in place        v.0  14.45°   20.1×      v.2  14.14°  19.6×
      v.2 HOP 20 mm @60°                            v.2   9.32°  12.9×
      LEAP 40 mm @60°     v.0   5.00°    6.9×      v.2   4.49°   6.2×
      JUMP 150 mm @60°    v.1   1.18°    1.6×   (landing pitch 23.5°)
      JUMP 200 mm @60°    v.1   0.85°    1.2×   (landing pitch 22.6°)
      JUMP 150 mm @45°    v.1   0.82°    1.1×   (the Cycle-02 axis)
    v.0 is safe, with margin. v.1 is not. The 0.72° stack is itself an
    estimate that nobody has measured, so R11 asks for 2× over an
    unmeasured stack and 1.5× over a measured one (part F of the script):
      longest v.1 JUMP at 2.0× (unmeasured, no G12)    125 mm
      longest v.1 JUMP at 1.5× (measured, G12)         160 mm at the 0.72° stack
    The pitch grows as v × t, roughly with range^1.5, which is why the long
    jump and not the hop carries the risk. Mass cancels (90 g and 108.7 g
    give the same numbers, with I scaled), so the 90 g target does not
    help.

  F88 — G12: THE CUBE MEASURES ITS OWN THRUST LINE
    The error that matters is the one in THIS unit, and the cube can see it.
    During every LEAP's flight the gyro reads the pitch rate. That rate is
    m·v·d/I, and v and I are known, so the rate gives d:
      thrust-line error   LEAP pitch rate   pitch over the 119 ms flight
         0.25°              11.2°/s              1.33°
         0.50°              22.4°/s              2.66°
         0.72°              32.2°/s              3.83°
         1.00°              44.8°/s              5.32°
    A MEMS gyro (noise ~0.01°/s/√Hz, class EST) resolves the rate to well
    under 0.5°/s in 0.12 s, which is ~0.02° of thrust-line error per LEAP.
    PROPOSED RULE (firmware, below the contract; D58):
      · JUMP stays capped at LEAP (reason G12_pitch_unverified) until the
        unit has ≥ 5 LEAPs on record.
      · Allowed range from the measured error ε (median of the last 5),
        with a 1.5× margin: 150 mm if ε ≤ 0.79°, 200 mm if ε ≤ 0.57°.
      · Re-checked on every LEAP. A drop (G8) clears the record: a dropped
        cube may have a bent guide (R10 B36).
    G12 also catches what no tolerance stack contains: a plunger tip that
    scuffs at launch, a worn guide, a foot that has lost its grip. It
    measures the flight, not the drawing.
    MECHANICAL OPTION, NOT LAID OUT: a second reaction wheel on a
    horizontal axis could cancel the spin in flight. Stopping 1.09 rad/s
    takes I·ω = 4.2·10⁻⁵ N·m·s, which is 7 ms at R10's 6 mN·m, and the
    wheel would reach ~750 rpm. It is cheap in torque. It is not cheap in
    space. It belongs to the v.3 attitude question (§08), not to v.1.

--------------------------------------------------------------------------------
04 // F89 — v.2 LAYOUT v0.3: THE WHEEL IN THE TOP ZONE
--------------------------------------------------------------------------------

  PLACEMENT (R08 §03 section view, R10 §04)
    z 38.4-46.0   top zone, 6.6 mm (R08 F51). From the bottom up: the wheel
                  stator on a 0.8 mm FR4 disc bonded to the stator cap (z
                  38.4-39.2); the 12-14-pole rotor ring, Ø30/Ø26 × 2 mm
                  steel, running on a 4 mm shaft in two Ø4 × 1.5 mm
                  miniature bearings (z 39.4-43.4); 1.0 mm clear; then the
                  ack-touch electrode on the inside of the cap (z 44.4-45.0,
                  R05 L5). The top zone still holds no part the operator
                  touches through.
    The wheel driver sits on the main PCB. Three phase lines run up the +y
    wall, opposite the R09 F72 rear ToF tab. The cam pocket (+y, R08 F52)
    is below z 30, so they don't cross.
  NUMBERS (scripts/cubiq-r11-landing.py, part D)
    mass       108.7 + 6.3 wheel + 1.0 FR4 disc + 0.2 bearings = 116.2 g
               (cap 120, margin 3.8 g). CORRECTION to R10 §08 (115.0 g,
               margin 5.0): R10's 3.5 g "stator + driver" did not include
               the parts that hold the stator and the shaft.
    CoM z      20.56 → 21.92 mm (+1.36; R10 estimated ~1.4)
    I_pitch    38,800 → 42,178 g·mm²
    static tip 44.2° → 42.4°  (RECOVER still triggers at 25°, R03)
    landing    every v.2 gesture ≥ 6.2× tip-over margin at the 0.72° stack (§03 C)
    gyro       wheel momentum 102 µN·m·s × the pitch rate of a 20 mm hop
               (0.42 rad/s) = 43 µN·m, which is 0.13° of roll at landing.
               Negligible: the wheel is spun only during a turn, and it is
               back at rest before touchdown (R10 §04).
  WHAT IS STILL OPEN (B37)
    Cogging between the wheel's rotor ring and the moving-magnet stator,
    1-2 mm apart. The multipole ring is the mitigation R10 named; R11 adds
    nothing until it is measured.

--------------------------------------------------------------------------------
05 // F90 — COLD ROOMS
--------------------------------------------------------------------------------

  FOG ON THE ToF WINDOW (lumped thermal model, EST: 104 J/K, 122 cm²,
  h 5 W/m²K → τ 28 min)
    Heating a cold room does not fog a cold cube: warming air at constant
    absolute humidity keeps its dew point. CARRYING a cold cube into a warm,
    humid room does:
      from    into (air, RH)     dew point   window fogged for
       3 °C   21 °C, 55 %          11.6 °C        18.5 min
       3 °C   21 °C, 45 %           8.6 °C        10.6 min
       3 °C   23 °C, 65 %          16.1 °C        30.1 min  (a kitchen, cooking)
       8 °C   21 °C, 55 %          11.6 °C         9.2 min
       3 °C   12 °C, 80 %           8.7 °C        28.1 min  (into a damp hallway)
    A fogged window scatters the ToF return, which is what
    tof_window_dirty already detects (R05). G7 caps everything at SETTLE.
    NO NEW GUARD. The uplink gets one new reason text: "window fogged —
    cold cube in a warm room; clears as it warms". The cube knows it is
    cold from its own thermistor, and it cannot know the room's humidity,
    so it promises no time. A window heater was considered and rejected:
    ~1 W for 10 minutes is more than the off-pad budget (R04), and the
    failure mode it prevents is already safe.
  CHARGING
    Li-ion cells must not be charged below 0 °C, and should charge at
    reduced current from 0 to 10 °C (JEITA-style windows; exact numbers are
    in the cell datasheet, B43). The pad's charger reads the cube's
    thermistor over the pad link. In Use Case 11 the cube sits on its pad
    at 3 °C overnight, so it charges at reduced current.
  ACTUATION IN THE COLD
    Copper resistance at 3 °C is ~7 % lower than at 22 °C, so the coil gets
    slightly STRONGER at the same drive. The R03 governor caps energy, so
    gestures do not grow. Spring rate changes by < 1 % over 20 K. The open
    item is the silicone feet: μ and restitution at 2-5 °C decide whether
    landings still stick (needs μ ≥ 0.48, R04 F19), and that is B43.

--------------------------------------------------------------------------------
06 // VALIDATION PLAN — DELTAS TO R10 §07
--------------------------------------------------------------------------------

  B23  REVISED  CI adds: scripts/cubiq-r11-c-fuzz.py with ≥ 20,000 cases
                (build with -Werror, all 6 vector files, 3-way fuzz, 0
                unexplained) and the R11 Python 82/82. All green in this
                repo today.
  B40  NEW      Firmware reference under sanitizers: ASan + UBSan build, all
                vectors, ≥ 50,000 fuzz decisions, ≥ 20,000 byte-mutated wire
                lines. PASS: 0 sanitizer reports, every line a defined
                outcome. Green today (60,000 + 20,000).
  B41  NEW      Thrust line → in-flight pitch, MULE-0: 100 LEAPs, high-speed
                video beside the IMU. PASS: gyro-inferred error agrees with
                video within 0.1°; measured stack ≤ 0.72°.
  B42  NEW      v.1 landing tip-over, MULE-0 v.1 rig (R10 B36 rocker):
                150 mm JUMPs with the thrust line deliberately offset 0.5,
                0.8, 1.0 and 1.2°, 20 each. PASS: topple onset within ±0.15°
                of the model's 1.18°. If it is lower, the G12 limits drop
                with it.
  B43  NEW      Cold chamber, MULE-1: 12 h at 2 °C, then carried into 21 °C /
                55 %. PASS: tof_window_dirty asserted while the window is
                fogged (camera), and clear within the model ±30 %; feet μ
                at 2 °C ≥ 0.48; no charge below 0 °C, reduced current 0-10 °C.
  B44  NEW      Clock loss, MULE-1: drain until the RTC resets, then put
                back on the pad. PASS: no gesture before the time sync; after
                sync every queued signal is judged by its TTL; none is
                performed outside it.
  MULE allocation: B40 none, B41-B42 MULE-0, B43-B44 MULE-1. 41 of 45
  B-items now run before any custom part (R10: 36 of 40). The four that
  need one are unchanged: B8, B17, B19, B26.

--------------------------------------------------------------------------------
07 // MASS BUDGET v0.9
--------------------------------------------------------------------------------

    v.0 total (R10)                                    108.7 g   margin 11.3 g
    v.0 changes in R11                                   0.0 g   (code and analysis only)
    v.2 (R10): v.0 + wheel                             115.0 g   margin 5.0 g
    v.2 layout v0.3 adds: FR4 stator disc Ø30 × 0.8    + 1.0 g   EST
                          two Ø4 × 1.5 bearings        + 0.2 g   EST
    ──────────────────────────────────────────────────────────
    v.2 total                                          116.2 g   margin 3.8 g
    CoM z: v.0 20.56 mm, v.2 21.92 mm (computed; R10's ~1.4 mm rise was EST
    and close). 3.8 g is the smallest margin the programme has carried.
    The next v.2 part has to pay for itself.

--------------------------------------------------------------------------------
08 // ROADMAP CHECK — DOES R11 HELP OR HURT v.1-v.3?
--------------------------------------------------------------------------------

  v.0             Helped. The decision logic now exists in the cube's own
                  language and has passed everything the programme has. Its
                  decoder has been attacked with mutated bytes under
                  sanitizers. LEAP has 6.9× tip-over margin.
  v.1 LONG JUMP   HURT, and honestly so. The 150 mm SPEC (R10 D51) holds
                  only with a measured thrust line, and 200 mm only with a
                  very good one. G12 turns this from a design risk into a
                  per-unit fact the cube checks every day. Without G12, the
                  R11 recommendation would be 125 mm.
  v.2 SWINGS      Helped, at a price. The wheel fits, the CoM change is
                  small, and every v.2 gesture keeps ≥ 6.2× margin. The mass
                  margin falls to 3.8 g.
  v.3 LEVITATION  Clarified. A levitated cube needs attitude control in all
                  three axes. R10 gave it yaw (wheel, z). §03 shows that
                  pitch matters as soon as flight is long, and a hover is
                  the longest flight there is. The horizontal-axis wheel
                  sketched in §03 is the second of the three.
  PLATFORM        A real bug class found before shipping: a preview that
                  says "performed" for an unreadable clock (F86), and two
                  libraries with two calendars (F85).

--------------------------------------------------------------------------------
09 // CONSUMER USE CASE 11 — THE GARDEN STUDIO
--------------------------------------------------------------------------------

(Also appended to LOT-CUBIQ-QUANTUM-CUBE-v0.md §07. Prior entries untouched.)

  Operator profile: Usership tier, 51, a freelance children's-book
  illustrator who works from an insulated timber garden studio at the end
  of the lawn, thirty steps from the house. An oil-filled radiator on a
  timer heats it on working days only. In January the studio is 3 °C at
  dawn. The cube lives on its home pad on the drawing desk, next to a jar
  of brushes. A three-person LOT® cohort: two other illustrators met at a
  book fair. They joined LOT® because a phone in a cold studio is a phone
  you keep in your pocket, and a phone in your pocket is a phone you check.

  07:00. The radiator timer clicks on. The cube spent the night on its pad
  at 3 °C. The pad's charger read the cube's thermistor and charged at
  reduced current (§05). Nothing else happened.

  07:45. The operator walks down the lawn with a flask. The air is 9 °C;
  the cube is still at 5 °C. The studio's dew point is under 2 °C, so the
  window is clear (§05: heating a room does not fog a cube). The Memory
  window opens at their chosen hour (R10 §03). The question was written
  from the weather record, "It's 3 °C — you tend to feel …"
  (contextual-prompts.ts). The cube has its own reading and doesn't need
  that one. The pad ID arrives, the deck edge is seen, the credit stands,
  and the cube HOPs once by the brush jar. The feet are cold and a little
  harder. The landing sticks anyway (B43 will say by how much).

  10:20. The weekly achievement pass finds an epic: a hundred days of
  Memory answers. The cube is a v.0, so its largest word is a LEAP. It
  LEAPs 40 mm across the pad's deck. At worst it lands 3.8° pitched, with
  a 6.9× tip-over margin (§03). G12 does not apply to a v.0. Had this been
  a v.1, its last five LEAPs would have measured its thrust line (0.41°),
  and a 150 mm JUMP would have been allowed.

  17:30. Dusk. The operator carries the cube up the lawn into the kitchen,
  where pasta water is boiling: 23 °C, 65 % RH, dew point 16 °C. The cube
  is at 4 °C. Its ToF window fogs over at once. tof_window_dirty: G7 caps
  everything at SETTLE (§05). At 17:41 a cohort member sends a thought.
  A cohort_ping is a SETTLE anyway, so the cube performs it: a slow press
  under the operator's hand on the kitchen table. The uplink shows the
  operator one line: "window fogged — cold cube in a warm room; clears as
  it warms". It clears at about 18:01, half an hour after the carry-in
  (§05: 30.1 min).
  The cube places itself on the oak table and probes it: damped.

  FEBRUARY. A nine-day trip. The cube is left on the studio windowsill,
  off its pad. The unheated nights and the off-pad drain empty the cell.
  The cube browns out and its real-time clock stops. On the operator's
  return it goes back on the pad and wakes with a clock that reads
  nothing. The phone is still in the house. Nine days of signals are
  waiting in the app's queue: seven badge_common, two cohort pings, a
  Memory window. A preview built on v0.5 TypeScript would say "performed"
  for every one of them, because NaN is never late (F86). The firmware
  says nothing. The clock is unsynced, so decide() returns a state fault,
  no gesture is made, and the queue is held. At 08:02 the phone comes
  into range and sets the time. Every queued signal is judged against its
  TTL: the badges (1 h) and pings (15 min) have EXPIRED, and the morning's
  Memory window (6 h) is live. One NUDGE. Nobody comes home to a cube that
  empties nine days onto the desk.

  What Use Case 11 proves that 01-10 did not:
    · Temperature is an ordinary operating condition, not a fault. Cold
      makes the coil stronger, the feet harder and the cell slower to
      charge. The firmware's existing guards and the charger's
      temperature window cover all three.
    · Fog is just G7. Carrying an object between rooms is ordinary use,
      and a guard designed for a smudged window covers it without a new
      rule.
    · A device that has lost its clock must not act. "No readable clock,
      no decision" (F86) is what keeps a TTL meaningful after a power
      loss. Without it, the TTL table is a list of promises nothing keeps.
    · Coming home should be quiet. Per-class TTLs mean an absence leaves
      at most what is still true today, never a backlog.

  Consumer market: garden offices and studio outbuildings, a large and
  still-growing home-working segment; seasonal and second homes heated
  only when occupied; mountain and northern households that set the
  heating low at night; anyone who carries their objects between a cold
  room and a warm one. More widely, people who want a notification object
  that comes back from a week away with one sentence, not a pile.

--------------------------------------------------------------------------------
10 // DECISIONS FOR S-2
--------------------------------------------------------------------------------

  D0  PROCESS: merge one CUBIQ branch (this one, R01 → R11) to master, or
      point the routine at a single long-lived branch. (Ninth time.) The
      cost is now visible: a run on 2026-11-24 rebuilt Cycle 02 from
      scratch on another branch.
  D41 FIRST SPEND: still open from R08. B41-B44 need MULE-0/1. R12 will
      have little left to do on paper (§11).
  D55 Adopt firmware/cubiq/ as the contract's third implementation; CI runs
      scripts/cubiq-r11-c-fuzz.py (B23, B40) (F84).
  D56 Contract v0.6-draft: add the calendar rule and microsecond comparison
      (F85, vectors 73-82). v0.5 is left as adopted, and its F85 divergence
      is documented. Adopting v0.6 closes it.
  D57 No readable clock, no decision: firmware treats an unsynced RTC as a
      state fault (nothing performs, the queue is held, TTLs judge after
      sync). The app preview uses decideV06Draft() or later, never v0.5
      (F86).
  D58 v.1 JUMP gated by G12, the per-unit pitch self-check: ≥ 5 LEAPs on
      record; 150 mm if ε ≤ 0.79°, 200 mm if ε ≤ 0.57°; reset on a drop.
      Without G12, the v.1 range spec would be 125 mm (2× over the
      unmeasured stack) (F87, F88).
  D59 v.2 layout v0.3 as §04: wheel in the top zone, on two miniature
      bearings, under the ack electrode. v.2 mass 116.2 g, margin 3.8 g
      (F89).
  D60 Cold rooms: the charger's temperature window per the cell datasheet
      (no charge < 0 °C); a "window fogged" uplink reason; no window heater
      (F90).
  Open and compatible: R05 D14, D16-D19; R06 D20, D21, D23-D28; R07
  D29-D35; R08 D36-D40; R09 D42-D49; R10 D50-D54.

--------------------------------------------------------------------------------
11 // NEXT CYCLE (R12) PROPOSED SCOPE
--------------------------------------------------------------------------------

  · If D41 is approved: MULE-0 (B1, B33, B36, B41, B42) and MULE-1 (B31,
    B37, B38, B43, B44). Replace the EST inputs in the R04-R11 scripts with
    measured values and report what moved. B42 decides v.1's range.
  · If not:
      – G12 in the firmware reference: the LEAP pitch-rate estimator and
        the JUMP gate in C, with vectors for its states (no record, 1-4
        LEAPs, within and over each limit, reset on a drop).
      – Firmware FSM v0.4 in C: the R08 simulator's states (ARM, LOCK,
        FIRE, RECOVER, DECOCK), driven by cubiq_decide(), with the R08
        timing tests ported. This is the step from "a function the cube
        calls" to "the loop the cube runs".
      – If D53/D54 are approved: the platform change on its own branch,
        with B39 as its tests.
  · Use Case 12, chosen from themes not yet used across all branches.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-R11
================================================================================
