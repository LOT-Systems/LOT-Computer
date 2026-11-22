================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-R09
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report R09
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-22
VERSION:  0.9 — PLATFORM REFERENCE · CONTRACT v0.5 · PAD ID · MOVING MAGNET · ASSEMBLY
STATUS:   v.0 — PRE-HARDWARE · FIRST SPEND (D41) STILL OPEN
PREDECESSORS: LOT-CUBIQ-QUANTUM-CUBE-v0.md     (R01, 2026-07-28)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R02.md (R02, 2026-11-10)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R03.md (R03, 2026-11-11)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R04.md (R04, 2026-11-13)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R05.md (R05, 2026-11-14)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R06.md (R06, 2026-11-15)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R07.md (R07, 2026-11-20)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R08.md (R08, 2026-11-21)
================================================================================

R09 is the ninth development cycle of the v.0 actuated haptic notification
device. D41 (first spend) has not been answered, so R09 takes R08 §13's
"if not" branch: the platform side of the contract, the pad's ID message
and isolators, and a fit-and-assembly pass inside the cube. There are eight
results. Two correct R08, one settles a question R03-R08 left open, and one
is the first CUBIQ code that lives in the LOT® codebase itself:

  1. A platform reference for the signal contract now exists in
     TypeScript at src/shared/cubiq/signal-contract.ts. It has a decoder
     (decide) and an encoder (event to signal). It passes 54/54 v0.4
     vectors and compiles under the server's strict tsconfig. It is not
     wired to any route yet.
  2. A differential fuzz ran Python against TypeScript on 100,000 random
     messages. It found a crash in the v0.4 Python reference: a not_before
     with no UTC offset raises a TypeError (1,037 crashes in 100,000). It
     also found that the two ISO-8601 parsers disagree on edge forms.
     Contract v0.5 fixes both with one strict timestamp profile and adds 5
     vectors (59 in all). Both references pass 59/59. On the same 100,000
     cases the v0.5 references never crash and never disagree. The one
     exception is the known integer-as-float case, which is closed by an
     encoder rule.
  3. Encoder rule: THE PLATFORM ASKS, THE CUBE AND THE OPERATOR DECIDE.
     The server asks one rung above the class default, never above leap,
     and stores no operator ceilings. If it pre-clamped, every raise an
     operator had set would silently stop working (vector 31).
  4. CORRECTION to R08 F56: placement on the pad takes ~0.40-0.47 s, not
     ~0.1 s. The Qi handshake plus an in-band ID sets the time. A 3-byte
     ID (geometry by index) halves the time an 11-byte ID would take. The
     pad still saves ~0.5 s and the probe tap.
  5. CORRECTION to R08 §04: the pad sags 0.93 mm, not 0.62 mm, once
     elastomer stiffening is counted. Foot v0 is Ø7 × 6 mm, 0.25 MPa
     class. New limit: the pad must not slide on the table during a LEAP.
     That needs foot friction μ ≥ 0.45, and it binds on dusty glass.
  6. R03-R08 put the magnet AND the coil in the stator, then called the
     moving part a "coil former". R09 proposes MOVING MAGNET (D48). The heavy part
     should be the moving part. Then only the cell's leads have to flex,
     and the magnet replaces ~5 g of dead ballast (EST).
  7. A rolling-loop flex for those leads fits under the stator, but the
     window is only 1.3 mm. The rear ToF has no PCB edge to fold from. An
     11-step assembly order exists with no blind connection.
  8. Use Case 09 — THE COFFEE TABLE: an older operator who lives alone,
     with family in their cohort. It is the first use case to set a rule
     for who else may know about the cube: nobody but the operator.

Everything here is analysis or reference code. No hardware exists. No part
has been bought. Inputs marked EST are placeholders for bench measurement.

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Own prior work (read this cycle):
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R08.md   read in full. §02 plunger,
    stator, coil; §03 layout v0.2; §04 pad v0; §05 FSM v0.3; §06 contract
    v0.4; §07 mule plan; §12 D36-D41; §13 the R09 scope that this report
    follows.
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R07.md   §06 decision order (the
    TS port keeps it step for step).
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R05.md   §05 section view v0.1
    (where "STATOR (magnet + coil)" first appears beside a moving "cell in
    former"); §06 flex leads "≥ 1,000,000 cycles at 8 mm".
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R03.md   §02 mass budget v0.1:
    "reaction mass, moving (incl. coil former) 40 g" and "voice-coil
    stator (magnet + coil) 14 g". These two lines disagree, and §06 here
    resolves them.
  Re-run before writing: all 10 earlier CUBIQ scripts exit 0 (R01
    ballistics to R08 layout/pad), including both contract checks (v0.3
    44/44, v0.4 54/54).

LOT® Institute corpus (re-read in the cited sections):
  docs/corporate/LOT-CUBIQ-OPERATOR.md    §04 "AI-Driven Physical Product
                                           Delivery". The AI decides WHAT
                                           and WHEN. R09's encoder rule (§03)
                                           is that sentence written as code:
                                           the platform proposes a gesture,
                                           and it never decides one.
  docs/corporate/LOT-CUBIQ-VISION.md      §05 "Physical products: the
                                           inevitable step". The first
                                           shared code between the LOT®
                                           platform and the object.
  docs/corporate/LOT_QI46_ENGINE.md       Month-12 cube sync: the cube
                                           reports "haptic preference" and
                                           usage back into the Calibration
                                           Loop. §03 F74 sets who may read
                                           that: the operator's own loop,
                                           never the cohort.
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md  "feel the field it sits in".
                                           In Use Case 09 the field is a
                                           family, and the object must
                                           not report on it.
  src/server/utils/rpg-narrative.ts       The platform's achievement model:
                                           5 rarities (common, uncommon,
                                           rare, epic, legendary; 15
                                           definitions). The contract has 2
                                           badge classes. §03 maps them.

PROCESS NOTE — CONTINUITY, S-2 (seventh time)
  This run started on `claude/tender-turing-b3uj90`, cut from `master`,
  which still holds only R01. The R01→R08 chain is on
  `claude/tender-turing-h7z091` (2026-11-21) and was fast-forwarded onto
  this branch, which now holds R01→R09 in order. D0 is still the fix.
  D41 (first spend) got no answer before this run. Scheduled runs
  have no live input, so this report treats D41 as OPEN and spends
  nothing.
  Use-case themes checked across every CUBIQ document and commit on all
  branches (~130 entries): night and bedside, kitchen, shared rooms and
  desks, cohorts, paired cubes, offices, hotels, music, recording, travel,
  Deaf households, low vision, workshops, reading rooms, breath pacing,
  air and windows, naps, classrooms. OLDER OPERATORS LIVING ALONE, and
  family members as cohort senders who must not be able to summon or
  watch them, have not been covered. Use Case 09 is that case.

--------------------------------------------------------------------------------
01 // WHAT CHANGED IN R09
--------------------------------------------------------------------------------

  F62  Platform reference: src/shared/cubiq/signal-contract.ts. decide()
       (v0.4 + v0.5 input rule), validate(), classCeiling(), encoder.
       54/54 v0.4, 59/59 v0.5. tsc --strict clean.                     §02
  F63  Differential fuzz, Python vs TypeScript, 100,000 seeded cases,
       25,105 of them performed. 0 unexplained disagreements.           §02
  F64  Encoder: ask = class default + 1 (max leap). The server stores no
       operator ceilings. TTL per class. 5 rarities map to 2 classes.  §03
  F65  JS prototype names ("constructor", "__proto__", "toString") on the
       wire are unknown names. Pinned by vectors 55-57.                §02
  F66  CORRECTION (v0.4 Python reference): an offset-less not_before
       crashed decide(). v0.5 timestamp profile; integers MUST be JSON
       integers. Vectors 58-59.                                        §02
  F67  CORRECTION to R08 F56: on-pad placement 0.40-0.47 s, not ~0.1 s.
       Pad ID v0 = 3 bytes, geometry by index, no serial number.       §04
  F68  CORRECTION to R08 §04: sag 0.93 mm, not 0.62. Foot v0 Ø7 × 6 mm,
       0.25 MPa class, 15.5 % static strain.                           §05
  F69  Pad slip during a LEAP: needs μ ≥ 0.45 (after lift-off; 0.37 during
       the push). Spec μ ≥ 0.6, dusty glass included.                  §05
  F70  Actuator topology resolved; MOVING MAGNET proposed (D48). Coil and back-iron fixed;
       magnet, cell and ballast move.                                  §06
  F71  Rolling-loop flex for the cell: R 3.0 mm, 19.7 mm long, under the
       stator. Feasible in a 1.3 mm window.                            §06
  F72  ToF tabs: 2 mm static bends fit. The rear tab has no PCB edge and
       needs a ~41 mm floor tail.                                      §06
  F73  Assembly order v0: shell split at z 30, 11 steps, every connector
       made before it is covered.                                      §06
  F74  Device events are OPERATOR-PRIVATE. No cohort member, family or
       otherwise, sees cube state.                                     §03
  F75  PROPOSAL: pad credit also needs the ToF to see the deck's front
       edge where the pad ID says it is (spoof/stale check). Contract
       v0.6, after B31.                                                §04
  F76  Use Case 09 — THE COFFEE TABLE.                                 §10

  Reproduce every number in this report with:
      node scripts/cubiq-r09-contract-check.ts       (TS: 54/54, 59/59, 42/42)
      python3 -I scripts/cubiq-r09-contract-v05.py   (Python: 59/59)
      python3 -I scripts/cubiq-r09-diff-fuzz.py 100000
      python3 -I scripts/cubiq-r09-pad-flex.py
  Node 22 runs the .ts file directly (type stripping), with no install.

--------------------------------------------------------------------------------
02 // F62, F63, F65, F66 — THE PLATFORM REFERENCE AND CONTRACT v0.5
--------------------------------------------------------------------------------

  WHY A SECOND IMPLEMENTATION
    Until now the contract lived in three Python scripts. That is fine for
    a spec, but not for a product: the platform that SENDS signals is
    TypeScript (src/server), and the cube that DECIDES them will be C on
    an MCU. R08 §13 asked for "a reference encoder for contract v0.4 in
    the LOT® server codebase … running the same 54 vectors". This is it.

  WHAT IS IN src/shared/cubiq/signal-contract.ts
    validate()       message checks, in the v0.3 order
    classCeiling()   class default, then operator raise or lower
    decide()         v0.3 decision order + v0.4 pad credit + v0.5 input rule
    platformAsk()    encoder ask per class (§03)
    achievementClass()  platform rarity → contract class (§03)
    encodeSignal()   platform event → v2 wire message, with a ULID id
    Pure functions, no imports, no I/O. It sits in src/shared so that the
    server (encoder) and, later, the client (app preview: "what will my
    cube do with this?") can use the same copy. Nothing imports it yet.

  PORTING HAZARD — PROTOTYPE NAMES (F65)
    In Python, CLASS_CEILING.get("constructor") is None. In JavaScript,
    CLASS_CEILING["constructor"] is a function, and RANK["toString"] is
    truthy. A naive port would accept intent "toString" and fail the RANK
    lookup later. It would read operator_ceilings {"badge_rare":
    "constructor"} as a real gesture, and it would give class "__proto__"
    the ceiling of whatever Object.prototype holds. The reference builds
    every table with a null prototype and reads it through own-key
    checks. Three new vectors pin the behaviour for every future port,
    including the firmware's:
      55  operator_ceilings {badge_rare: "constructor"}  → leap (ignored)
      56  class "__proto__"                              → settle, class_ceiling
      57  intent "toString"                              → rejected, bad_intent
    The v0.4 Python reference passes all three unchanged. They document a
    hazard, not a change in behaviour.

  THE DIFFERENTIAL FUZZ (F63) — scripts/cubiq-r09-diff-fuzz.py
    Seeded generator (seed 20261122): valid and malformed values for every
    signal field and every state flag, pad on and off, operator ceilings
    with real and junk names. Both implementations run on every case.
                                         100,000 cases
      outcome mix (Python v0.5)          rejected 54,582 · performed 25,105
                                         expired 10,479 · held 4,220
                                         safe_hold 2,929 · deferred 2,685
      plain pool                90,116   disagreements 0
      odd-timestamp pool         4,986   disagreements 0 (v0.5)
      integer-as-float pool      4,898   disagreements 4,686 (KNOWN, below)
      v0.4 Python reference crashes on the same inputs: 1,037.  v0.5: 0.

  WHAT THE FUZZ FOUND (F66)
    1. A CRASH IN THE v0.4 REFERENCE. A not_before of "2026-11-22" or
       "2026-11-22T09:00:00" parses in Python as a NAIVE datetime. The
       comparison with the offset-aware `now` then raises TypeError, and
       decide() never returns. On a cube, an exception there means a
       dropped signal at best and a watchdog reset at worst. Every one of
       the 1,037 crashes was this.
    2. THE TWO ISO PARSERS DISAGREE. Python 3.11 fromisoformat() accepts a
       space separator, week dates ("2026-W47-7") and the basic format
       ("20261122T090000Z"). JavaScript's Date.parse() accepts other forms.
       A message one side holds, the other rejects.
    FIX — CONTRACT v0.5 TIMESTAMP PROFILE (one rule, both sides):
         not_before = YYYY-MM-DDTHH:MM[:SS[.ffffff]] then Z or ±HH:MM
       Anything else is rejected as bad_not_before. All 54 v0.4 vectors
       already conform. New vectors:
         58  "2026-11-15T10:00:00"   (no offset)        → rejected, bad_not_before
         59  "2026-11-15 10:00:00Z"  (space separator)  → rejected, bad_not_before
       scripts/cubiq-r09-contract-v05.py wraps the R08 decide() unchanged
       and adds only this check. Earlier field errors still take
       precedence, as in v0.3.
    3. INTEGERS WRITTEN AS FLOATS. JSON has one number type. Python reads
       2.0 as a float and rejects it (type_priority). JavaScript can't tell
       2.0 from 2 and accepts it. A raw-token decoder in C would see "2.0"
       and must pick one. No vector over parsed JSON can express this, so
       it becomes a WIRE RULE:
         ENCODERS MUST write v, priority and ttl_s as JSON integers: no
         fraction, no exponent. DECODERS that see raw tokens (firmware)
         MUST reject a fraction or exponent in those fields.
       The TypeScript encoder only ever writes integers (checked).

  CONTRACT v0.5 — docs/corporate/cubiq/signal-contract-v0.5-vectors.json
    59 vectors: 01-54 are the v0.4 vectors unchanged, 55-59 are new. The
    decision logic is unchanged. Results:
      Python v0.5 reference   59/59
      TypeScript reference    59/59 (and 54/54 on the v0.4 file)
      v0.4 Python reference   57/59: passes 55-57 (no change), crashes on
                              58 (no offset), accepts 59 (space)

--------------------------------------------------------------------------------
03 // F64 + F74 — THE ENCODER: THE PLATFORM ASKS, NOBODY ELSE WATCHES
--------------------------------------------------------------------------------

  THE QUESTION
    Which gesture should the platform put in `intent`? There are two
    obvious answers, and both are wrong.
      · "The class default" (memory_ready → nudge). Then vector 31 can't
        happen. An operator who raised memory_ready to HOP gets a NUDGE
        forever, because the cube only ever lowers an intent. Pre-clamping
        on the server silently disables every operator raise.
      · "The operator's own ceiling, read from their settings". Then the
        server must hold and sync per-user ceilings, and two copies of one
        preference will drift. The cube already holds them
        (state.operator_ceilings, R06 D25).
  THE RULE (F64)
    intent = class default + 1 rung, never above leap.
    That is the most any operator is allowed to have granted (R06 F39:
    one rung up). The cube then clamps by class, by the operator's own
    ceiling, and by every guard. The server stores no ceilings and needs
    no device state.
                    default   platform asks   operator raise reachable
      memory_ready  nudge     hop             hop    (vector 31)
      badge_common  hop       leap            leap
      badge_rare    leap      leap            —      (leap is the max)
      assembly_ph.  settle    nudge           nudge
      cohort_ping   settle    nudge           nudge  (vector 44)
    Cost: an operator who has not raised a class sees downgrade_reason
    "class_ceiling" on nearly every uplink event. The app treats that
    reason as normal, not as a warning.

  RARITY → CLASS
    The platform has 5 achievement rarities (rpg-narrative.ts). The
    contract has 2 badge classes.
      common · uncommon · rare   → badge_common  (HOP by default)
      epic · legendary           → badge_rare    (LEAP)
      anything else / no rarity  → badge_common  (e.g. Badge Codex entries)
    The platform's "rare" is 4 of its 15 definitions. The cube's largest
    gesture should be scarcer than that. Of today's definitions, 3 of 15
    would LEAP.

  TTL PER CLASS (how long the event is still worth a gesture)
      memory_ready 6 h · badge_rare 3 h · badge_common 1 h ·
      assembly_phase 1 h · cohort_ping 15 min
    A cohort ping is about a moment. Fifteen minutes later it is history,
    and the app is the right place for history, not the cube.
  PRIORITY
    0-3, validated, never read by decide(). It orders the cube's queue
    when several signals are waiting. It is not a volume knob. Written
    down because the name invites misuse.
  ID
    "sig_" + ULID (48-bit ms time + 80 random bits, Crockford base32).
    The ids sort by time, which the uplink log needs.

  ENCODER CHECKS (scripts/cubiq-r09-contract-check.ts) — 42/42
    For each class: the message validates; the id is in format; TTL as in
    the table; a clear damped desk gives the class default; the operator's
    one-rung raise takes effect; call_live forces settle; the message is
    expired at TTL + 1 s. The rarity map is checked for all 5 tiers, null
    and an unknown tier.

  F74 — DEVICE EVENTS ARE OPERATOR-PRIVATE
    The uplink (performed / downgraded / pad_on / pad_off / safe_hold /
    fall) goes to the OPERATOR'S app and to their own Calibration Loop
    (QI·46 Month-12 sync), and to nobody else. A cohort member who sends a
    ping sees "sent" and nothing more: not delivered, not felt, not "cube
    off its pad", not "fall". The reason is in Use Case 09: once a
    notification object reports on its owner to the people who notify
    them, it has become a surveillance device. Two consequences:
      · CUBIQ is not, and must never be marketed as, a fall alarm, a
        check-in service or a care device. G8 fall detection protects the
        CUBE (R06), not the person.
      · Any future feature that shares device state (e.g. paired cubes)
        must be opt-in per item, by the operator, and revocable from
        their app alone.

--------------------------------------------------------------------------------
04 // F67 + F75 — PAD ID v0: THE MESSAGE, THE TIME IT TAKES, THE CROSS-CHECK
--------------------------------------------------------------------------------

  WHAT R08 SAID
    "pad ID sent from Qi transmitter to receiver in-band (FSK class):
    model + factory deck geometry", and "placement drops from ~1.0 s to
    ~0.1 s". The second figure left out the time the first one takes.

  HOW SLOW THE PAD-TO-CUBE LINK IS (part A of scripts/cubiq-r09-pad-flex.py)
    Pad → cube is FSK: about one bit per 512 cycles of the power carrier,
    i.e. 3.5-4.7 ms per bit across 110-148 kHz (EST, Qi class). Each byte
    is 11 bits on the wire. Cube → pad is ASK, ~2 kbit/s. Before any of
    that, the pad must ping, and the cube must identify and configure:
    ~196 ms (EST).
                                                   110 kHz  128 kHz  148 kHz
      R08 sketch: model + full deck geometry (11 B)  0.88 s   0.78 s   0.71 s
      R09: model + geometry INDEX + flags (3 B)      0.47 s   0.43 s   0.40 s
    The 0.1 s static look runs in parallel, so the handshake sets the
    total. CORRECTED: on-pad placement takes 0.40-0.47 s. Off the pad it
    takes ~1.0 s (R05). The pad saves ~0.5 s, and it still saves the
    0.5 s probe tap, which is the part anyone can hear.
    Does it matter? Signals are rare and placement is rarer, so not for
    latency. It matters for honesty: R08's "instant" was never true.
    And it matters for Use Case 09, where the cube is lifted and put back
    dozens of times a day.

  PAD ID v0 — PAYLOAD (3 bytes inside one proprietary in-band packet)
    byte 0   pad model                  0x01 = PAD v0
    byte 1   [7:4] deck geometry index  0x1 = 160 × 110 × 12 mm, home spot
                                         rear-centre, 5 mm from the rear edge
             [3:0] hardware revision
    byte 2   flags                      b0 isolated · b1 non-metallic deck ·
                                         b2 v.3 array present (0 on v0) ·
                                         b3-b7 reserved, 0
    + packet header and checksum (Qi framing).
    · The geometry table lives in cube firmware. An index the firmware
      doesn't know gives model_ok = false and no credit until an update.
      The cube never takes a pad's word for a geometry it can't look up.
    · NO SERIAL NUMBER. The ID names a model, not a unit. A per-unit ID
      would let anyone with uplink access tell which pad, and so which
      room, a cube is in. F74 applies to the pad too.

  F75 — PROPOSAL: CHECK THE CLAIM AGAINST WHAT THE CUBE SEES
    A pad ID is a claim. A third-party transmitter could send it, or a
    LOT pad could sit with its deck under a book. Either way the cube
    would use the 60 mm deck runway on a surface that isn't the deck.
    The cube can check physically. From the home spot, the deck's front
    edge (a 12 mm drop) sits 110 mm ahead of the cube's front face
    (160 − 5 − 45). Proposed rule: credit requires model_ok AND
    home_spot AND edge_seen. edge_seen means a 10-14 mm drop at 110 ±8 mm
    in at least 2 forward ToF zones. A mug in front (vector 47) hides
    some zones, not all. If it hides all of them, the cube falls back to
    its own probe and loses only the credit. This enters as contract
    v0.6, `state.pad.edge_seen`, once B31 has measured what the ToF
    actually sees at a 12 mm drop on the deck finish. It is not in v0.5,
    because v0.5 changes inputs and adds no rules.

--------------------------------------------------------------------------------
05 // F68 + F69 — PAD ISOLATORS, PAD RECOIL, PAD SLIP
--------------------------------------------------------------------------------

  SIZING (part B)
    Loaded mass 703.5 g (pad 590 + cube 113.5). For f_n = 20 Hz the feet
    need 2.78 N/mm each, dynamic. Soft viscoelastic polyurethane stiffens
    under fast load by ~1.5× (EST), so the static stiffness is 1.85 N/mm
    per foot.
    CORRECTED: static sag 0.93 mm, not R08's 0.62 mm (g/ω² assumes static
    and dynamic stiffness are equal). Nothing downstream depends on the
    sag. The deck is 0.3 mm lower.
    Load split with the cube on the home spot: CoG 8.5 mm to the rear,
    rear feet 28 % each, front feet 22 % each. Deck tilt 0.05°, against
    a G1 limit of 3°.

    cylinder foot, k = E(1 + 2S²)A/t, S = d/4t        E static, EST
      E MPa  t mm   d mm   t/d   strain   verdict
      0.25   5.0    6.28   0.80  18.6 %   OK
      0.25   6.0    6.96   0.86  15.5 %   OK   ← v0
      0.25   8.0    8.17   0.98  11.6 %   OK
      0.50   5-8    4.6-5.9 >1   —        slender: buckles sideways
    FOOT v0: 4 × Ø7 × 6 mm, 0.25 MPa class viscoelastic PU. The strain
    is mid-band, and the foot is squat enough not to buckle. A stiffer
    compound only works as a foot too thin to stand.

  RECOIL AND SLIP (part C) — A LIMIT R08 DIDN'T MODEL
    R08 modelled the pad's recoil vertically. The thrust line is 30° off
    vertical, so the pad is also pushed BACKWARD.
      during the push   peak 14.3 N → 7.2 N horizontal, 12.4 N vertical.
                        Normal on the feet 19.3 N → needs μ ≥ 0.37
      after lift-off    the cube takes 35 mN·s of forward momentum, and
                        the pad takes the same backward. Pad lateral mode
                        on the feet 11.7 Hz: it sways 0.81 mm, with 2.58 N
                        of foot shear, and only the pad's own weight holds
                        it now → needs μ ≥ 0.45  ← BINDING
    PU on clean glass or lacquer has μ > 1 (EST). On dusty glass it can
    fall toward 0.4 (EST). A pad that slips takes the cube with it. The
    certified deck geometry would no longer match the room.
    SPEC: foot μ ≥ 0.6 on 6 surfaces, dusty glass included (B30, revised).
    The 0.81 mm sway is below what anyone would notice. At ζ 0.1 it
    decays to 1 % in ~0.6 s (~7 cycles).

--------------------------------------------------------------------------------
06 // F70-F73 — INSIDE THE CUBE: TOPOLOGY, LEADS, TABS, ASSEMBLY ORDER
--------------------------------------------------------------------------------

  F70 — WHICH PART OF THE VOICE COIL MOVES?
    R03 lists "voice-coil stator (magnet + coil) 14 g" and "reaction mass,
    moving (incl. coil former) 40 g". R05 and R08 draw "STATOR (magnet +
    coil)" around a moving "cell in former". A coil and a magnet that are
    both fixed don't drive anything, so one of these has to move:
      (a) MOVING COIL    coil wound on the moving former, magnet fixed
      (b) MOVING MAGNET  magnet ring on the moving former, coil fixed
      (c) MOVING IRON    reluctance type, no magnet; non-linear, lower km
    Voice coils are usually moving-coil because the coil is the light
    part, which is right when you want little moving mass. A reaction-mass
    actuator wants the opposite: 40 g moving, most of it tungsten ballast
    (R03). So the heavy part should be the moving part.
    DECISION PROPOSED (D48): (b) MOVING MAGNET.
      · The magnet replaces its own mass in ballast: about −5 g (EST)
        from the cube total, with the moving mass unchanged at 40 g.
      · Only the cell rides the flex. Coil leads stay static: the HOP
        pulse (~1.5 A EST) never crosses a moving joint.
        loop heat at peak: moving magnet 57 mW (1.0 A cell),
                           moving coil 128 mW (1.5 A coil + cell)
      · Cost: B1's candidate list changes. Most catalogue voice coils
        are moving-coil, so moving-magnet linear actuators (haptic LRA
        class, scaled up) must be added. km ≥ 1.5 N/√W still applies (R04).
      · v.3: the magnet's axial position becomes a known, commandable
        variable inside the stator column. The R05 keep-out is unchanged,
        because the magnet travels inside the same column.

  F71 — THE CELL'S ROLLING LOOP (part D)
    Dynamic bend radius, single-sided flex, ½ oz RA copper, IPC-2223
    form: R_min = (c/2)(100/E_B − 1) − D = 2.94 mm at E_B 0.3 % (≥ 10⁶
    cycles). v0: R = 3.0 mm.
    A rolling loop's bend travels half the stroke: 4 mm for 8 mm. It
    hangs below the stator: fixed leg anchored to the stator's bottom
    cap (z 14.4), moving leg to the bottom of the former (z 15.4 at the
    low end, EST).
      loop bottom, low end, must sit in [6.1, 7.4] mm
        (above PCB top 5.6 + 0.5, and low enough that the fixed leg
        stays straight at the top of the stroke)
      → window 1.3 mm. FEASIBLE, not roomy.
      19.7 mm of flex, 6 mm wide (2R), at x +2…+8 mm. The sleeve is at
      x ≤ +0.4 mm at z 14.4, so it is clear. 3 lines: cell +, cell −, NTC
      (for B1b).
    This is the "≥ 1,000,000 cycles at 8 mm" lead R05 asked for, now with
    a place to live. B33 tests it. If the window shrinks (a taller PCB
    stack, a lower stator), the loop goes horizontal in the side pocket
    instead, with a longer flex.

  F72 — ToF FLEX TABS (part E)
    · 2-layer flex, 0.2 mm (EST): static bend R ≥ 2.0 mm. The radial room
      from stator to wall is 8.5 mm, so it fits.
    · FRONT (+x): folds off the PCB edge. The edge must stop at
      x ≤ 18.8 mm. The IMU ends at +17.0, 1.8 mm clear.
    · SIDES (±y): fold off the PCB side edges.
    · REAR (−x): THERE IS NO PCB EDGE. The PCB starts at x −4 (R08 L10),
      because the plunger sleeve runs behind it. The rear tab needs a
      TAIL: from the PCB's −y corner along the floor at y −15 (sleeve
      |y| ≤ 4, yoke at y 0, Qi coil radius 12 around x +8.5), then a 90°
      bend up the −x wall to z 22. That is ~41 mm with a 6 mm service
      fold. It is the longest flex in the cube and the one most likely to
      be pinched at assembly, so B34 tests it.
    · The ack-touch electrode on the top face reaches the PCB as an
      extension of the FRONT tab. A spring contact at the shell split
      joins them. There is no separate 25 mm pogo pin.

  F73 — ASSEMBLY ORDER v0 (box-level; proves a sequence exists, not CAD)
    Shell split at z 30: a deep lower tray holds every ToF window (z
    20-24) and a 16 mm top cap. Tabs are bonded to windows the fitter can
    see. Nothing is aligned blind as a cap comes down.
       1  Tray: feet; Qi RX coil + ferrite on its keyed boss at x +8.5.
       2  Plunger module into the 30° boss: tip rod, spring, floating
          sleeve.
       3  Rear ToF tail laid along the floor at y −15; tab bonded to the
          −x window.
       4  PCB lowered over the sleeve. The cut-out is elongated to 9.2 mm
          in x (8 mm / cos 30°) so the tilted sleeve passes. Front and
          side tabs folded up and bonded. Rear tail into the ZIF at the
          PCB's −y corner.
       5  Cam module (gearmotor, worm, cam, cross-yoke) into the +y
          pocket. Yoke pins engage the tip rod and sleeve. A jig checks
          the ARMED dwell position (R08 F52).
       6  Stator sub-assembly onto its DATUM A pins (R05 L1). Coil and
          back-iron are fixed. Inside: magnet + cell + ballast in the
          former, rolling loop anchored to the bottom cap, static tail
          leaving at −y.
       7  Cell tail into the ZIF at the PCB's −y edge, reached from above
          through the still-empty −y pocket.
       8  Supercap into the −y pocket. This closes access to step 7's ZIF,
          which is why 7 must come first.
       9  CoM check: 20.6 ±0.3 mm on a height gauge (MULE-1: tungsten
          trim).
      10  Top cap: ack-touch electrode; spring contact meets the front
          tab at the split.
      11  Close (adhesive or ultrasonic at z 30), self-test, first Qi
          charge on a PAD v0 (B31 orientation check doubles as end-of-line).
    Rework: removing the top cap gives access to the stator. The cell ZIF
    sits behind the supercap. That is acceptable for v.0 and should be
    revisited before any run of more than a handful.

--------------------------------------------------------------------------------
07 // VALIDATION PLAN — DELTAS TO R08 §07-§08
--------------------------------------------------------------------------------

  B1   REVISED  Candidate list adds moving-magnet linear actuators (F70).
                PASS unchanged: km ≥ 1.5 N/√W, ≥ 4.4 N mean over 8 mm,
                40 g moving.
  B23  REVISED  CI runs, on every change: Python v0.5 59/59, TypeScript
                v0.4 54/54 + v0.5 59/59, encoder 42/42, differential fuzz
                ≥ 20,000 cases with 0 unexplained disagreements and 0
                crashes. All green in this repo today.
  B30  REVISED  Pad isolation + launch share + SLIP. Add dusty glass
                (ISO 12103-1 A2 fine test dust, light film, EST) and
                clean glass to the surfaces. PASS adds: no pad movement
                > 0.5 mm over 50 LEAPs per surface; f_n 17-23 Hz loaded;
                foot μ ≥ 0.6.
  B31  REVISED  Pad ID + orientation key + TIMING. PASS adds: contact →
                model_ok ≤ 0.6 s at both ends of the carrier band; an
                unknown geometry index never gives credit. Record the ToF
                view of the 12 mm deck edge at 110 mm (input to F75).
  B33  NEW      Rolling-loop cell flex, MULE-0 rig: 1,000,000 strokes at
                8 mm, R 3.0 mm, 1.0 A load pulses. PASS: continuity held
                throughout, resistance drift < 10 %, no copper cracks
                under 20× inspection.
  B34  NEW      ToF tab + rear tail through assembly steps 3-4 on 10
                MULE-1 builds, then the B19 drop orientations. PASS: all
                4 ToF enumerate on I²C after every drop; no tail pinch
                marks.
  B35  NEW      Platform encoder against the live achievement model: 15
                rarity definitions → class map, and TTL expiry seen on a
                device clock 5 min slow and 5 min fast. PASS: map as in §03;
                expiry within ±1 s of TTL on the cube's own clock.
  MULE allocation: B33 MULE-0, B34 MULE-1, B35 runs today (no hardware).
  Counting R08's B30-B32 (MULE-0, MULE-0, MULE-1) and R09's B33-B35,
  32 of 36 B-items now run before any custom part (R08's table: 26 of
  30). The four that need one are unchanged: B8, B17, B19, B26.
  Unchanged: everything else in R08 §08 and the R01 500/500 close gate.

--------------------------------------------------------------------------------
08 // MASS BUDGET v0.7
--------------------------------------------------------------------------------

    R08 total (mass budget v0.6)                       113.5 g
    + cell rolling-loop flex, 20 × 6 mm (F71)          + 0.1 g  EST
    + rear ToF tail 41 mm, touch-tail on front tab     + 0.1 g  EST
    ──────────────────────────────────────────────────────────
    R09 total, moving-coil or undecided                113.7 g   margin 6.3 g
    − moving magnet replaces ballast (F70, D48)        − 5.0 g  EST
    ──────────────────────────────────────────────────────────
    R09 total with D48                                 108.7 g   margin 11.3 g
    CoM 20.6 mm, unchanged: the magnet sits in the moving mass on the
    same axis, at the same mean height. The pad (~590 g + 4 feet) is a
    separate object and is not in the cube budget.

--------------------------------------------------------------------------------
09 // ROADMAP CHECK — DOES R09 HELP OR HURT v.1-v.3?
--------------------------------------------------------------------------------

  v.1 LONG JUMP   Helped. 11.3 g of margin (with D48) is the first room
                  the v.1 rocker-folded spring (R08 F51) has had. JUMP
                  stays off the pad (D27). The encoder already caps at
                  leap, so v.1 needs no platform change until D27.
  v.2 SWINGS      Neutral. The rolling loop sits at x +2…+8 under the
                  stator, exactly where a mirrored second plunger would
                  cross. That joins the Qi-coil conflict R08 logged
                  against v.2. Both point to the y-axis launch pair.
  v.3 LEVITATION  Helped, slightly. Pad ID byte 2 reserves "v.3 array
                  present", so a future pad announces itself with no
                  format change. A moving magnet is a dipole whose position
                  the cube already controls. That is a nuisance for an
                  array to reject, or a handle for it to use, and it is
                  known either way.
  PLATFORM        New. The contract now has a home in the LOT® codebase,
                  so every later change ships as a vector, a Python
                  reference and a TypeScript reference together.

--------------------------------------------------------------------------------
10 // CONSUMER USE CASE 09 — THE COFFEE TABLE
--------------------------------------------------------------------------------

(Also appended to LOT-CUBIQ-QUANTUM-CUBE-v0.md §07. Prior entries untouched.)

  Operator profile: Usership tier, 81, widowed, living alone in a
  second-floor flat. They joined LOT® themselves after a grandson showed
  them the morning Memory question. Now they answer it most days on a
  large-text tablet. Their daughter (another city) and the grandson are
  in a three-person LOT® cohort with them. Their phone lives in a kitchen
  drawer: at their age, they say, every buzz might be the one with bad
  news, so they stopped carrying it. Their coffee table is a glass top on
  a chrome frame, the worst furniture the cube has met: it rings like the
  classroom desk (R08) and is slippery besides. They like the cube's
  weight, and they turn it over in their hands while the radio is on.

  08:10. The cube goes back in its pad's recess after a night on the
  bedside shelf. Nothing to hear, nothing to see. Qi couples, the
  3-byte pad ID arrives, and 0.43 s later the cube knows it is on its
  deck (§04). Without the pad, the glass would read resonant (R07), and
  every ballistic gesture would drop to a NUDGE or SETTLE (G6).

  09:00. memory_ready. The platform asks for HOP (§03: one rung above
  the class default). Last month, with the grandson, they raised
  memory_ready to HOP in the app. They wanted to see it from the
  armchair, two metres away, because a NUDGE can only be felt by someone
  touching the table. The pad credit keeps the HOP (glass and chrome
  never feel the knock, R08 §04). The cube rises 10 mm and settles. They
  pick up the tablet.

  11:30. The daughter sends a cohort ping. The platform asks for NUDGE,
  the most a cohort_ping can ever be (vector 44). At that moment the cube
  is in the operator's hands, off the pad, so it is unplaced, and G7
  makes it a SETTLE. A SETTLE is a slow two-second push from the moving
  magnet (F70). On a table it is a whisper. In a palm it is
  unmistakable. They smile and put the cube down. Fifteen minutes later
  the ping's TTL ends. If they had been out of the room, it would have
  expired untouched and waited in the app as history, never as a cube
  gesture repeated later (R03 rule).
  What the daughter sees: "sent". Not "felt", not "delivered", not "cube
  off its pad since 11:30" (F74). She cannot make the cube LEAP. No class
  she can send rises above NUDGE, the server holds no ceiling she could
  change, and the ceiling that matters lives on the operator's device. If
  she wants to know how her mother is, she phones. CUBIQ is a way to say
  "thinking of you", and it is not a way to check up on anyone.

  14:05. Turning the cube over during the news, they drop it on the rug
  from 40 cm. G8 sends it to SAFE-HOLD. The spring was relaxed (R06), so
  nothing could fire. The tablet shows one plain line: put the cube on
  its pad and tap Self-test. They do; it passes. That line went to the
  operator and nobody else. A dropped cube is the cube's problem, not a
  fact about its owner for anyone else to receive (F74).

  19:40. Their 100th Memory answer unlocks an epic achievement, which
  the platform maps to badge_rare (§03). The cube LEAPs ~34 mm across the
  deck. The pad sways 0.8 mm on its feet and grips the glass (μ ≥ 0.6
  spec, §05). The cube lands on the deck, off the home spot, so the next
  signal runs on the cube's own probe and ToF (vector 49). They laugh,
  pick it up, and put it back in the recess, which takes 0.43 s.

  22:00. Quiet hours cap everything at NUDGE. The cube goes to the
  bedside shelf, off any pad. It runs its own placement look (~1.0 s,
  R05) and reads a narrow shelf, so G1 and quiet hours keep it at NUDGE
  or below for the night.

  What Use Case 09 proves that 01-08 did not:
    · The CUBE'S SENDERS can be people who love the operator and would,
      with the best intentions, turn it up. The encoder (ask ≤ class + 1)
      and the operator's on-device ceiling together make that
      impossible. The server holds nothing a sender could change (§03).
    · A notification object must not report on its owner. Device events
      are operator-private (F74). This is the line between CUBIQ and a
      monitoring product, and R09 draws it in the contract, not in
      marketing.
    · The hand is a surface. Lifted, the cube is unplaced and speaks only
      SETTLE, and in a palm that is the clearest gesture it has. The
      moving magnet makes it a push, not a buzz.
    · Glass is the pad's hardest table: resonant AND slippery. The pad
      fixes the first with mass and the second with foot friction, and
      R09 put a number on the second for the first time (μ ≥ 0.45, spec
      0.6).

  Consumer market: older adults who live alone and already use LOT®, and
  their families as cohort senders. More widely, anyone for whom a
  phone's notifications carry dread rather than news: people who want
  contact without being on call. Not a care product, and never sold as
  one (F74).

--------------------------------------------------------------------------------
11 // DECISIONS FOR S-2
--------------------------------------------------------------------------------

  D0  PROCESS: merge one CUBIQ branch (this one: R01 → R09) to master, or
      point the routine at a single long-lived branch. (Seventh time.)
  D41 FIRST SPEND: still open from R08, unchanged. R09 did all the work
      it could without a part. R10 has little left to do on paper (§12).
  D42 Adopt src/shared/cubiq/signal-contract.ts as the platform reference.
      Wire B23 into CI: both references, encoder checks, differential
      fuzz (F62, F63).
  D43 Adopt contract v0.5: 59 vectors, the strict not_before profile, the
      prototype-name vectors, and the integer wire rule for encoders and
      raw decoders (F65, F66).
  D44 Encoder rule: ask = class default + 1 rung (max leap); the server
      stores no operator ceilings; TTL table; priority is queue order
      only; rarity map epic/legendary → badge_rare (F64).
  D45 Device events are operator-private. No cohort visibility of cube
      state. CUBIQ is never positioned as a care, check-in or fall-alarm
      device (F74).
  D46 Pad ID v0: 3-byte payload, geometry by index, no serial number.
      Accept ~0.45 s on-pad placement. Corrects R08 F56 (F67).
  D47 Pad feet v0: 4 × Ø7 × 6 mm, 0.25 MPa class viscoelastic PU, μ ≥ 0.6
      spec incl. dusty glass. Corrects R08 sag figure (F68, F69).
  D48 Actuator topology: MOVING MAGNET. Coil + back-iron fixed; magnet +
      cell + ballast move. B1 candidates widened accordingly (F70).
  D49 Inner layout: cell rolling loop under the stator (R 3.0 mm), rear
      ToF floor tail, shell split at z 30, assembly order v0 (F71-F73).
  Open and compatible: R05 D14, D16-D19; R06 D20, D21, D23-D28; R07
  D29-D35; R08 D36-D40 (D38 pad v0 now carries D46/D47 as detail).

--------------------------------------------------------------------------------
12 // NEXT CYCLE (R10) PROPOSED SCOPE
--------------------------------------------------------------------------------

  · If D41 is approved: MULE-0 results, B1 km first (now with
    moving-magnet candidates), B33 flex rig, B31 pad timing. Replace EST
    inputs in the R04-R09 scripts with measured values and report what
    moved.
  · If not:
      – v.1 rocker-folded spring (deferred from R08). It is the last v.1
        mechanism with no numbers, and D48's margin gives it room.
      – Contract v0.6 draft: pad.edge_seen (F75), with vectors and both
        references, pending B31 data.
      – The v.2 y-axis launch pair. R08 and R09 both pushed v.2 off the x
        axis (Qi coil, rolling loop). That should be decided before the
        x axis fills up further.
  · Platform: a proposal (not code) for where encodeSignal() is called in
    src/server: achievement unlock, memory-question ready, cohort ping,
    assembly phase. Plus the uplink endpoint that keeps device events
    operator-private by construction (D45).
  · Use Case 10, chosen from themes not yet used across all branches.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-R09
================================================================================
