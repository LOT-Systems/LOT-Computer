================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-R10
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report R10
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-23
VERSION:  0.10 — PLATFORM WIRING · CONTRACT v0.6-DRAFT · v.1 SPRING · v.2 YAW
STATUS:   v.0 — PRE-HARDWARE · FIRST SPEND (D41) STILL OPEN
PREDECESSORS: LOT-CUBIQ-QUANTUM-CUBE-v0.md     (R01, 2026-07-28)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R02.md (R02, 2026-11-10)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R03.md (R03, 2026-11-11)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R04.md (R04, 2026-11-13)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R05.md (R05, 2026-11-14)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R06.md (R06, 2026-11-15)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R07.md (R07, 2026-11-20)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R08.md (R08, 2026-11-21)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R09.md (R09, 2026-11-22)
================================================================================

R10 is the tenth development cycle of the v.0 actuated haptic notification
device. D41 (first spend) has still not been answered, so R10 takes R09
§12's "if not" branch. It covers all four of its items: the platform wiring
map, contract v0.6 (edge_seen), the v.1 rocker spring, and the v.2 launch
pair question. There are seven results. Two of them say that something the
programme has been assuming does not exist:

  1. PLATFORM: 2 of the 5 signal classes have no event source in today's
     LOT® server. `achievement_unlocked` is read in two summary files and
     written nowhere, so no epic or legendary achievement ever raises an
     event, and badge_rare (the LEAP) has nothing to fire it. Nothing
     resembling a cohort ping exists either. The other three classes have
     sources, but two of those need one small change each (§03).
  2. PRIVACY BY CONSTRUCTION: cube device events must not live in the
     platform's Log table. Today GET /api/stats/badges shows any signed-in
     user the last 10 badge unlocks of ALL users, with their first names.
     A cube event in that table would be one query away from a public
     ticker. R10 specifies a separate store with an operator-only read path
     (F79, enforcing R09 D45).
  3. CONTRACT v0.6-DRAFT: pad credit now needs edge_seen (R09 F75), and a
     new guard G11 handles MOVING SURFACES. 72 vectors. The Python and
     TypeScript references, written independently, both pass 72/72 and
     agree on 100,000 fuzz cases. v0.6 equals v0.5 exactly when the edge is
     seen and the surface is still. decide() stays at v0.5 until S-2
     adopts it.
  4. MOVING SURFACES: R05's placement routine begins "still for ≥ 2 s".
     On a moored boat that check fails from about ±1° of roll. The cube
     would then be "unplaced" and limited to SETTLE for as long as the
     water moves. R10 changes the check to "still RELATIVE TO THE SURFACE"
     and sets the gesture limits by numbers: HOP and LEAP are unaffected
     by gentle motion; JUMP is not (§05).
  5. v.1 SPRING: the axial spring R06-R08 assumed for the long jump clashes
     with the stator by 7.9-8.6 mm. A rocker with a DOUBLE TORSION SPRING
     driving a guided tip rod fits along the axis, and under the stator
     for a 150 mm jump. A 200 mm jump misses by 0.2-0.8 mm. R08 rejected
     the rocker because a pivot would enter the thrust-line tolerance. With
     a guided rod it does not: the guide sets the direction and the pivot
     only sets the energy (±1 % range).
  6. CORRECTION to R04-R07, v.2: every cross-track run since R04 re-aims
     the cube "with a small yaw step before every hop". R05 F24 removed the
     only yaw mechanism (piezo, 3.2 millidegrees per stroke). Since R05,
     nothing in the layout can turn the cube. R10 proposes a top-cap
     REACTION WHEEL that turns it during the flight of a hop: +6.3 g, up to
     9.9° per 20 mm hop, traverse p98 8.9 mm against the 15 mm gate. The
     y-axis launch pair is rejected (+17 g, and there is no pocket for it).
  7. Use Case 10 — THE MOORING: a liveaboard narrowboat with patchy signal.
     It is the first use case where the surface itself moves, and the
     first where the network is mostly absent.

Everything here is analysis or reference code. No hardware exists. No part
has been bought. Inputs marked EST are placeholders for bench measurement.

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Own prior work (read this cycle):
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R09.md   read in full. §02-§03
    platform reference and encoder; §04 F75 edge_seen proposal; §06 F70
    moving magnet, F71 rolling loop; §08 mass budget v0.7; §11 D41-D49;
    §12 the R10 scope this report follows.
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R08.md   §02 F51 (floating-sleeve
    clash, stator raised 2.9 mm, and the rocker "kept as the v.1
    fallback"); §03 section view (stator bottom z 14.4, PCB top z 5.6, top
    zone 6.6 mm empty); §09 v.2 conflicts on the x axis.
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R07.md   §05 F44 traverse re-run
    (the model §04 here re-runs); §06 decision order.
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R06.md   §02 F31 v.1 energies;
    D28 10 mm v.1 stroke; JUMP rules.
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R05.md   §02 F23 traverse model;
    §03 F24 (piezo yaw dropped) and the G7 placement routine v0.2.
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R04.md   §05 F20 "re-aim with a
    small yaw step before every hop", the assumption §04 corrects.
  Re-run before writing: all 13 earlier CUBIQ Python scripts exit 0, and
    the R09 TypeScript check passes (54/54 v0.4, 59/59 v0.5, encoder
    42/42). So does the R09 differential fuzz.

LOT® Institute corpus (re-read in the cited sections):
  docs/corporate/LOT-CUBIQ-OPERATOR.md    §04 "AI-Driven Physical Product
                                           Delivery": the AI decides WHAT
                                           and WHEN. §03 here maps each WHAT
                                           to the place in the server where
                                           it happens, and finds two places
                                           missing.
  docs/corporate/LOT_Integrated_Resilience_System.md  "Self-Assembly Engine
                                           — 18 modules · 5 phases ·
                                           signal-driven progression". This
                                           is the source of assembly_phase.
                                           Its phase is computed in the
                                           client and posted to /assembly
                                           (§03).
  docs/corporate/LOT_QI46_ENGINE.md       Month-12 cube sync: haptic
                                           preference and usage frequency
                                           flow back into the operator's
                                           Calibration Loop. §03 F79 gives
                                           that flow its own store.
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md  "The object should feel the
                                           field it sits in." In Use Case 10
                                           the field is water. The cube has
                                           to feel it, and must not mistake
                                           it for being picked up.
  docs/corporate/LOT-CUBIQ-VISION.md      §01: "LOT® invests attention and
                                           returns structure". This is the
                                           basis of the screen-first rule
                                           (§03 F77): the cube says nothing
                                           that the screen in front of the
                                           operator has already said.

Platform code read (for §03; nothing in src/server is changed):
  src/server/routes/api.ts          POST /sync-badges (~L674, badge_unlock
                                    log writes ~L704-717), GET /memory
                                    (L1957), GET /cohorts (L3241), POST
                                    /direct-messages (L4021), GET
                                    /stats/badges (L4385), POST /assembly
                                    (L5133, assembly_directive log L5304)
  src/server/utils/weekly-summary.ts:192, monthly-summary.ts:231   read
                                    `achievement_unlocked`
  src/server/utils/rpg-narrative.ts achievement rarity model (5 tiers)
  src/server/scheduled-jobs.ts      hourly job loop (~L5613)

PROCESS NOTE — CONTINUITY, S-2 (eighth time)
  This run started on `claude/tender-turing-5c0bpq`, cut from `master`.
  `master` still holds only R01. The R01→R09 chain is on
  `claude/tender-turing-b3uj90` (2026-11-22). It was fast-forwarded onto
  this branch, which now holds R01→R10 in order. D0 is still the fix.
  D41 got no answer before this run. Scheduled runs have no live input,
  so D41 is OPEN and nothing is spent.
  Use-case themes checked across every CUBIQ document on all branches
  (~130 entries, R09's list plus Use Case 09 itself): night and bedside,
  kitchen, shared rooms and desks, standing desk, cohorts, paired cubes,
  offices, hotels, music, recording, travel, Deaf households, low vision,
  workshops, reading rooms, breath pacing, air and windows, naps,
  classrooms, older operators living alone. "boat", "cabin", "camper" and
  "van" appear in no CUBIQ document on any branch. A MOVING SURFACE has
  never been covered, and neither has an operator who is mostly offline.
  Use Case 10 covers both.

--------------------------------------------------------------------------------
01 // WHAT CHANGED IN R10
--------------------------------------------------------------------------------

  F77  Platform wiring map: source of each class in today's server.
       badge_rare and cohort_ping have NO source; memory_ready and
       assembly_phase each need one small change. Screen-first rule.   §03
  F78  Contract v0.6-draft: pad credit = model_ok AND home_spot AND
       edge_seen, each the literal true. 72 vectors. Python 72/72 and
       TypeScript 72/72, two independent implementations.             §02
  F79  Uplink store: a separate table, not Log; read only as the
       operator; senders see "sent". Reason: /api/stats/badges.         §03
  F80  G11 moving surface: placement "still relative to the surface";
       'gentle' caps JUMP at LEAP; anything else defers like G9.       §02 §05
  F81  v.1 spring: rocker + double torsion spring + guided rod. Fits for
       150 mm; 200 mm misses by 0.2-0.8 mm. Corrects R08 F51's reason
       for rejecting the rocker.                                       §06
  F82  CORRECTION to R04-R07: v.2 has had no yaw actuator since R05 F24.
       Top-cap reaction wheel proposed; y-axis launch pair rejected.   §04
  F83  Use Case 10 — THE MOORING.                                      §10

  Reproduce every number in this report with:
      node scripts/cubiq-r10-contract-check.ts          (54/54, 59/59, 72/72, 59/59 ext, 42/42)
      python3 -I scripts/cubiq-r10-contract-v06.py      (Python: 72/72)
      python3 -I scripts/cubiq-r10-diff-fuzz.py 100000
      python3 -I scripts/cubiq-r10-mechanics.py
  The R09 commands still pass unchanged (decide() is still v0.5).

--------------------------------------------------------------------------------
02 // F78 + F80 — CONTRACT v0.6-DRAFT
--------------------------------------------------------------------------------

  STATUS
    DRAFT. The rules are fixed. Two thresholds are not: what counts as
    "edge seen" on the deck finish (B31) and where 'gentle' ends (B38).
    The TypeScript reference exports a separate function, decideV06Draft().
    decide() is unchanged and still means v0.5, because a draft should not
    become the default by accident.

  RULE 1 — PAD CREDIT NEEDS ITS EVIDENCE (F78, from R09 F75)
    credit = pad.model_ok === true AND pad.home_spot === true
             AND pad.edge_seen === true
    Missing, false, "yes", 1 or null all mean NO credit. A credit without
    its evidence is no credit. The cube then uses its own probe and its
    own runway, exactly as it does off the pad. Note what the rule does:
    the pad's claim is checked against what the cube can see, and it can
    only ever REMOVE a credit, never add one.

  RULE 2 — G11 MOVING SURFACE (F80, §05 for the numbers)
    state.surface_motion is reported by the cube's IMU plus ToF:
      absent / 'still'   unchanged behaviour
      'gentle'           the surface moves as a rigid body, with the cube
                         riding on it (a moored boat, a floating floor). G11
                         caps JUMP at LEAP. Nothing else changes.
      anything else      'rough', or a value the decoder doesn't know:
                         DEFERRED, reason G11_moving_surface, and retried
                         within the TTL like G9. Unknown means rough.
    Position in the decision order (R07 §06 numbering kept):
      validate → expired → held → G8 fall → G9 machine vibration →
      G11 rough (defer) → device → class → call_live → quiet hours →
      G10 hush → G7 unplaced/dirty → G11 gentle (cap leap) → G4b
      cadence → G1 edge/level → G6 resonant
    G9 comes before G11. An engine running is the more specific reason,
    and it is the one the operator can act on.

  THE VECTORS — docs/corporate/cubiq/signal-contract-v0.6-draft-vectors.json
    01-59   the v0.5 vectors. In 45, 46, 47, 50, 51, 52, 53 and 54 (the
            pad was credited in v0.5), state.pad gains edge_seen: true.
            Every expected outcome is unchanged.
    60      pad, edge_seen missing, glass reads resonant, rare badge
            → settle (G1, then G6): the full fall-through without credit
    61      pad, edge_seen false, damped, 60 mm free → nudge (G1)
    62      same with edge_seen true → leap (deck runway 60 mm)
    63      edge_seen "yes" → no credit → settle (G6)
    64      gentle, clear desk, rare badge → LEAP, unchanged
    65      gentle, v1, operator raised badge_rare to jump → leap
            (the class ceiling binds first; G11 would have done the same)
    66      rough → deferred G11
    67      rough + fall → safe_hold G8
    68      rough + engine → deferred G9
    69      surface_motion "banana" → deferred G11 (unknown = rough)
    70      gentle + quiet hours → nudge, reason quiet_hours
    71      rough, but the cohort ping has expired → expired
    72      gentle, credited pad, v1 → leap on the deck runway
    Two expected outcomes written by hand at first (60, 63) were WRONG:
    they left out R03's rule that a NUDGE on a resonant surface becomes a
    SETTLE. The reference was right, and the vectors were corrected. Hand
    arithmetic over a 16-step decision order is exactly what vectors are
    for.

  RESULTS
    Python v0.6-draft (standalone, scripts/cubiq-r10-contract-v06.py)  72/72
    TypeScript decideV06Draft (src/shared/cubiq/signal-contract.ts)    72/72
    TypeScript decide (v0.5, unchanged)            54/54 v0.4 · 59/59 v0.5
    Extension check: on all 59 v0.5 vectors, decideV06Draft with
      edge_seen: true and surface_motion: 'still' equals v0.5 decide  59/59
    Encoder (R09)                                                     42/42
    tsc --strict on signal-contract.ts                                clean

  DIFFERENTIAL FUZZ — scripts/cubiq-r10-diff-fuzz.py, 100,000 cases, seed 20261123
    R09's generators, plus edge_seen (true / false / missing / junk) on
    pads and surface_motion (missing / still / gentle / rough / junk).
      outcome mix        rejected 54,997 · performed 22,863 · expired 10,071
                         deferred 4,897 · held 4,219 · safe_hold 2,953
      G11 decided        2,280 cases
      A. Python v0.6 vs TypeScript v0.6
           plain 90,056   disagreements 0
           odd_ts 4,950   disagreements 0
           float 4,994    disagreements 4,830 (KNOWN, R09 F66 wire rule)
      B. Python v0.6 (v0.5-shaped states) vs the v0.5 Python chain
           plain / odd_ts disagreements 0
      crashes            0
    The Python v0.6 file shares no code with the R07→R08→R09 chain. B is a
    regression test of a rewrite, not a copy compared with itself.

--------------------------------------------------------------------------------
03 // F77 + F79 — PLATFORM WIRING: WHERE EACH SIGNAL COMES FROM
--------------------------------------------------------------------------------

  This is a proposal, not code. Nothing in src/server is changed by R10. It
  is the map that encodeSignal() (R09) needs before it can be called.

  THE MAP (today's server, read this cycle)
    class           source in src/server today            status
    ──────────────  ────────────────────────────────────  ─────────────────
    badge_common    POST /sync-badges writes one Log       EXISTS. Codex ids
                    'badge_unlock' per new badge            carry no rarity →
                    (api.ts ~L704-717)                      badge_common (R09)
    badge_rare      rpg-narrative.ts defines rarity, but    NO SOURCE
                    `achievement_unlocked` is only READ
                    (weekly-summary.ts:192,
                    monthly-summary.ts:231), never written
    memory_ready    GET /memory makes the question when     NO EVENT. The
                    the app asks for it (api.ts L1957)      question doesn't
                                                            exist until the
                                                            app is open
    assembly_phase  POST /assembly gets assemblyState.phase SOURCE, but the
                    from the client; the assembly_directive log keeps percent
                    log keeps assemblyPercent, not phase    and not phase
    cohort_ping     nothing. GET /cohorts and direct        NO SOURCE
                    messages exist; there is no "ping"

  WHAT EACH ONE NEEDS (D53)
    badge_rare    Write `achievement_unlocked` (with rarity) when the
                  narrative model first sees an achievement unlocked. This
                  also fixes the two summaries, which count an event nobody
                  writes. (They also OR in other events, so the bug is
                  quiet, not loud.)
    memory_ready  Change the meaning, not the generator. memory_ready =
                  "today's question window has opened". An hourly job
                  (scheduled-jobs.ts already runs one) fires it at the
                  operator's chosen local hour. The question is still
                  generated lazily when the app opens. This keeps R01's
                  Use Case 01 true without generating questions nobody
                  reads.
    assembly_ph.  Store `phase` in the assembly_directive metadata. Fire
                  when it differs from the last stored phase.
    cohort_ping   An explicit, separate act: "send a thought to their
                  cube". It is NEVER derived from a chat or direct message.
                  Otherwise the cube becomes a message buzzer, the thing
                  CUBIQ exists to replace. Rate limit: one per sender per
                  operator per 3 h (EST, product choice). The sender sees
                  "sent" and nothing more (R09 F74).

  F77 — SCREEN FIRST, CUBE ONLY WHEN THE SCREEN IS AWAY
    POST /sync-badges and POST /assembly are called BY THE APP. So these
    events happen while the operator is looking at the screen. A cube
    that then HOPs repeats what the screen has just said. Rule for the
    encoder's caller: if the event came from the operator's own live app
    session, send nothing. The screen has already told them.
    Consequence: badge_common and assembly_phase reach the cube mainly
    when they are computed server-side (scheduled jobs, the badge_rare fix
    above, a future server-side assembly engine). That is the right
    direction anyway. It also makes the cube rarer, and rarity is the
    point.

  F79 — DEVICE EVENTS DO NOT GO IN THE LOG TABLE
    GET /api/stats/badges (api.ts L4385) returns, to any signed-in user,
    the last 10 'badge_unlock' rows of ALL users, with first names and
    "minutes ago". As a social ticker for badges this is a product choice,
    and R10 does not question it. But it shows what the Log table is:
    a shared stream that cross-user endpoints read. A cube event written
    there ("pad_off", "fall", "performed at 03:12") would be one WHERE
    clause away from being public.
    PROPOSAL (by construction, enforcing R09 D45):
      · Store: `cubiq_device_event` (user_id, cube_model, event,
        downgrade_reason, signal_id, at). No pad serial (R09 F67), no
        location, no free text.
      · Write: POST /api/cubiq/uplink, as the operator's own session (the
        app relays the cube's BLE uplink). The cube queues while offline
        (Use Case 10) and the app flushes the queue on reconnect.
      · Read: GET /api/cubiq/events, WHERE user_id = req.user.id only.
        Admin sees counts per day, never rows. No cohort, public-profile
        or stats endpoint may join this table. That rule goes into the
        security review (docs/security), not only into this report.
      · Senders: the cohort_ping endpoint returns {status: "sent"} and
        stores nothing about delivery.
      · QI·46 Month-12 sync reads the operator's own rows into their own
        Calibration Loop (LOT_QI46_ENGINE.md), and nothing else does.

--------------------------------------------------------------------------------
04 // F82 — v.2 HAS NO WAY TO TURN. A REACTION WHEEL GIVES IT ONE.
--------------------------------------------------------------------------------

  THE GAP (CORRECTION to R04 F20, R05 F23, R07 F44)
    Every v.2 traverse since R04 does the same thing between hops: the cube
    re-aims toward the track "with a small yaw step before every hop",
    clipped to ±20°, with a yaw error of σ 3°. R04 had a mechanism in mind:
    the piezo trim bimorph. R05 F24 showed that piezo yaw manages 3.2
    millidegrees per stroke, and dropped it. Nothing has replaced it. In
    layout v0.2 (R08) the cube can launch along +x, and nothing else. All
    three traverse results are correct as models of a cube that can turn.
    v.0 as drawn cannot turn.

  OPTIONS
    (A) y-axis launch pair (R08/R09 §09). Two more plungers fire left and
        right, so the cube sidesteps instead of turning. EST +17 g (2 ×
        5.5 g modules + a second 6 g cam), and both side pockets are
        already full: the cam is in +y, the supercap in −y (R08 F52). It
        also still cannot turn the cube to face the operator. REJECTED.
    (B) Reaction wheel in the top zone. A flat outrunner whose rotor is a
        thin steel ring sits in the 6.6 mm empty zone above the stator
        (R08 §03, z 38.4-46). The ack-touch electrode stays on the inside
        of the cap above it. PROPOSED (D52).

  HOW IT TURNS (scripts/cubiq-r10-mechanics.py, part F82)
    During a hop the feet leave the table, so there is no friction. Spin
    the wheel up and back to rest, relative to the body, inside the flight.
    The body then turns by exactly wheel angle ÷ (I_body + I_wheel)/I_wheel.
    The count comes from the motor's own commutation, so the turn is
    commanded, not estimated.
      rotor ring Ø30/Ø26 × 2 mm steel  2.8 g   I_w 544 g·mm²
      stator + rotor magnets + driver  3.5 g   EST
      body I_z 38,800 g·mm²   ratio 72.3   cube 115.0 g (cap 120, margin 5.0)
                          flight   turn   wheel     peak rpm   torque     max turn
      HOP in place          90 ms   20°   4.0 rev    6,672    10.5 mN·m    11.4°
      20 mm @60°            84 ms    5°   1.0 rev    1,792     3.0 mN·m     9.9°
      40 mm @60°           119 ms    5°   1.0 rev    1,267     1.5 mN·m    19.7°
      (max turn at 6 mN·m EST; turns use 80 % of the flight)
    The useful fact: max turn per hop ≈ T·t²/(4·I_body). It depends on the
    motor's TORQUE and not on the wheel's inertia, which only sets the
    speed. So the ring is sized light (2.8 g; a 7.7 g ring was tried first
    and left 0.6 g of mass margin), and the motor is sized for torque.
  ON THE TABLE IT CAN'T TURN AT ALL
    Foot friction torque is 10.0 mN·m, more than the motor's 6 mN·m. The
    wheel can't twist the cube on its feet. That is a feature: a cube that
    can't scrub its feet can't scuff a table, and a SETTLE never turns
    into a twitch.
  TRAVERSE, RE-RUN (R07 F44 model: 20 mm hops, ToF σ 5 mm, slip 0.5 mm, N 20,000)
      yaw source                              yaw σ   aim clip  p98 final  p98 worst
      R07 F44 (actuator unspecified)          3.00°   ±20.0°     8.7 mm    11.4 mm
      wheel: landing slip 1.0° + trim 0.3°    1.04°   ± 9.9°     7.0 mm     8.9 mm
      wheel, pessimistic slip 2.0°            2.02°   ± 9.9°     7.2 mm     9.3 mm
    The ±9.9° clip costs nothing, because the R05 aim law rarely asks for
    more. The gate is < 15 mm.
  v.3 LINK
    A levitated cube touches nothing, so nothing stops it spinning. Any
    levitation candidate in R01 §06 needs a yaw actuator that works
    without contact. This is that actuator, and v.2 is where it would be
    proven first.
  RISKS (B37)
    The rotor magnets sit ~2 mm above the moving-magnet stator (R09 D48).
    Use a multipole ring (12-14 poles): its far field falls off much
    faster than a dipole's, which also matters for v.3. Measure the cogging
    torque the stator induces on the wheel, and the force the wheel
    induces on the moving magnet.

--------------------------------------------------------------------------------
05 // F80 — MOVING SURFACES: THE NUMBERS BEHIND G11
--------------------------------------------------------------------------------

  THE PROBLEM
    R05's placement routine v0.2 begins "1. Still for ≥ 2 s (IMU)". The
    assumption is that a table doesn't move. A moored narrowboat rolls a
    little all day. Roll centre ~0.6 m below the table (EST); deck
    acceleration a = h·θa·ω²:
      roll      period   deck a        vs 'still' 0.02 m/s² (EST)   class
      ±0.5°     4.0 s    0.013 m/s²    × 0.6   passes               gentle
      ±1.0°     3.0 s    0.046 m/s²    × 2.3   fails                gentle
      ±2.0°     2.0 s    0.207 m/s²    × 10    fails                gentle
      ±4.0°     2.0 s    0.413 m/s²    × 21    fails                rough
      ±6.0°     1.5 s    1.102 m/s²    × 55    fails                rough
    From about ±1° the cube never counts as placed. G7 then limits it to
    SETTLE, which is the gesture least likely to be felt on a moving deck.

  THE FIX — PLACEMENT v0.3, STEP 1
    "Still RELATIVE TO THE SURFACE for ≥ 2 s": the multizone ToF ranges to
    the table and its edges are steady to within their noise, AND the
    feet aren't sliding. The IMU then classifies the motion it sees:
      still    below the 'still' threshold (unchanged)
      gentle   roll/pitch ≤ ±2°, period ≥ 2 s, no content > 5 Hz (EST, B38)
      rough    anything more (a boat under way in chop, a train table, a
               car seat)
      > 5 Hz   G9 machine vibration, as before (the engine)
    "Being moved" (picked up, carried) is not motion of the surface: the
    ToF ranges change. That is G7 unplaced, as before.

  WHAT GENTLE MOTION DOES TO EACH GESTURE (worst gentle case, ±2° at 2.0 s)
      gesture                 flight   landing shift   tilt change   of 20 mm edge margin
      HOP in place             90 ms     0.8 mm          0.57°          4 %
      LEAP 40 mm @60°         119 ms     1.5 mm          0.75°          7 %
      JUMP 150 mm @60° (v.1)  230 ms     5.5 mm          1.45°         27 %
      JUMP 200 mm @60° (v.1)  266 ms     7.3 mm          1.67°         36 %
    Rule: a gesture whose shift uses more than a quarter of the R02 edge
    margin is capped. Only JUMP crosses that line, so gentle motion caps
    JUMP at LEAP and leaves everything else alone. Rough motion defers,
    because no amount of capping makes a SETTLE perceptible on a train.
    The cube waits, and the TTL decides whether the moment is still worth
    a gesture.

--------------------------------------------------------------------------------
06 // F81 — v.1 LONG JUMP: THE ROCKER AND THE DOUBLE TORSION SPRING
--------------------------------------------------------------------------------

  THE QUESTION
    R08 F51 fixed the v.0 floating-sleeve clash by raising the stator 2.9
    mm. Room along the thrust line is now 16.6 mm. It said a rocker-folded
    spring "is kept as the v.1 fallback, where the stroke is 10 mm (R06
    D28)". R10 runs the numbers. Body masses: 108.7 g (R09 with D48) and
    90 g (v.1 target). Launch 60°, transfer 70 % (R03), music wire.

  (1) AXIAL COMPRESSION SPRING, R08 SCHEME
                      KE       F peak   d        coils   free     floating stack
      108.7 g 150 mm  92 mJ    26.4 N   0.69 mm  12.1    21.3 mm  24.3 mm  CLASH 8.2
      108.7 g 200 mm  123 mJ   35.2 N   0.81 mm  10.6    21.7 mm  24.7 mm  CLASH 8.6
       90.0 g 150 mm  77 mJ    21.8 N   0.63 mm  13.2    21.0 mm  24.0 mm  CLASH 7.9
       90.0 g 200 mm  102 mJ   29.1 N   0.73 mm  11.5    21.4 mm  24.4 mm  CLASH 8.3
    No axial spring fits. The 10 mm stroke alone exceeds half the room.

  (2) ROCKER + TORSION SPRING DRIVING A GUIDED ROD
    A tip rod slides in a PTFE-lined guide on the 30° axis. A rocker arm of
    length L pushes the rod through a roller. A torsion spring on the
    rocker pivot stores the energy. Along the axis only the rod remains:
    10 mm stroke + 4 mm guide engagement + 1 mm roller cap = 15 mm, which
    FITS in 16.6 mm with 0.5 mm clear.
                         arm swing  roller η  spring     d       OD      turns
      108.7 g 150, L 10    57.3°     0.96     137 mJ   1.40 mm  9.8 mm   5.1
      108.7 g 150, L 12    47.7°     0.97     136 mJ   1.49 mm 10.4 mm   4.3
      108.7 g 150, L 16    35.8°     0.98     135 mJ   1.64 mm 11.5 mm   3.3
    (0.55 Sut bending allowance, spring index 6; all four mass/range
    cases are in the script.)
    WHERE IT GOES: under the stator, behind the axis (the plunger side),
    pivot along y. The gap there is 14.4 − 5.6 = 8.8 mm (R08 L7, PCB top).
    The rolling loop (R09 F71) is in front of the axis, at x +2…+8, so the
    two don't meet. A single coil at L 12 is 10.4 mm OD and does not fit. A
    DOUBLE torsion spring (two coils in parallel, each carrying half the
    torque) at L 12:
      108.7 g 150 mm   d 1.17 mm   OD 8.2 mm   fits (0.6 mm spare)
       90.0 g 150 mm   d 1.09 mm   OD 7.7 mm   fits
      108.7 g 200 mm   d 1.29 mm   OD 9.1 mm   CLASH 0.8 mm
       90.0 g 200 mm   d 1.21 mm   OD 8.5 mm   CLASH 0.2 mm
    So 150 mm is a layout fact, and 200 mm is a stretch. It needs one of:
    chrome-silicon wire (a higher allowable stress), the stator raised a
    further 0.8 mm (CoM +0.4 mm at R08's ratio), or the 90 g target met.

  CORRECTION to R08 F51's reason for rejecting the rocker
    R08: a rocker "makes a second load path through a pivot, which is
    exactly what the R05 tolerance stack penalises". That holds when the
    pivot steers the tip. With a guided rod it doesn't: the GUIDE sets the
    thrust direction, and the pivot only sets how far the rod travels.
    0.05 mm of pivot clearance on a 12 mm arm changes the swing by 0.24°,
    which is about 1 % in energy and ~1 % in range, against R04's 10 %
    range σ. The thrust-line stack (R05, R08 F54: 0.72°) is unaffected.
    The guide is the new tolerance item (B36).

  COST: ARMING TIME
    The v.0 cam arms 43 mJ in 1.1 s (R08 FSM v0.3). At the same motor, a
    150 mm v.1 JUMP arms in 2.8-3.4 s, and a 200 mm JUMP in 3.7-4.5 s. JUMP
    is rare and never in quiet hours (R06). The cube arms only on an
    intent that already allows a JUMP (cock-on-intent, R06 F36), so the
    cost is latency, not exposure.

--------------------------------------------------------------------------------
07 // VALIDATION PLAN — DELTAS TO R09 §07
--------------------------------------------------------------------------------

  B23  REVISED  CI adds: Python v0.6-draft 72/72, TypeScript v0.6-draft
                72/72, the extension check 59/59, and the R10 fuzz with
                ≥ 20,000 cases, 0 unexplained disagreements and 0 crashes.
                All green in this repo today.
  B31  REVISED  Also: the edge_seen threshold. Over 200 placements, find the
                drop depth and range window at which the 12 mm deck edge is
                seen in ≥ 2 forward zones, with a mug and with a tea towel
                over the deck front. PASS: no false "seen" with the deck
                covered.
  B36  NEW      Rocker + double torsion spring + guided rod, MULE-0 rig:
                10⁵ v.1 strokes at 150 mm energy. PASS: η ≥ 0.9, energy
                repeatability σ ≤ 2 %, no guide wear > 0.02 mm, thrust
                direction within 0.72° throughout.
  B37  NEW      Reaction-wheel turn-hop on MULE-1 (off-the-shelf gimbal
                outrunner, steel ring): 100 hops at commanded 0°, ±5°,
                ±9°. PASS: yaw error σ ≤ 1.5°; cube never turns on the
                table under full motor torque; stator↔wheel cogging and
                moving-magnet disturbance measured.
  B38  NEW      Moving deck: MULE-1 on a 2-axis tilt table, ±0.5°…±6°,
                1.5-4 s. PASS: placement v0.3 classifies still / gentle /
                rough as §05; HOP and LEAP land within their still-surface
                scatter + the §05 shift; no G7 "unplaced" in gentle motion.
  B39  NEW      Platform wiring (after D53): one test per event source in
                §03, the screen-first rule, the cohort_ping rate limit, and
                a test that no non-operator route can read
                cubiq_device_event. Runs with no hardware.
  MULE allocation: B36 MULE-0, B37-B38 MULE-1, B39 none. 36 of 40 B-items
  now run before any custom part (R09: 32 of 36). The four that need one
  are unchanged: B8, B17, B19, B26.
  Unchanged: everything else in R08 §08, R09 §07, and the R01 500/500
  close gate.

--------------------------------------------------------------------------------
08 // MASS BUDGET v0.8
--------------------------------------------------------------------------------

    R09 total with D48 (v.0)                           108.7 g   margin 11.3 g
    v.0 changes in R10                                   0.0 g   (contract and analysis only)
    ──────────────────────────────────────────────────────────
    v.0 total                                          108.7 g
    v.1: rocker + double torsion + guided rod, in place
         of the axial spring and floating sleeve       ±0.5 g   EST, not yet a line item
    v.2: reaction wheel (ring 2.8 + stator/driver 3.5) + 6.3 g  EST
    ──────────────────────────────────────────────────────────
    v.2 total                                          115.0 g   margin 5.0 g
    The wheel sits on the axis, so CoM x/y is unchanged. It is high, so CoM z
    rises ~1.4 mm (6.3 g at z ≈ 42 mm, EST). The tip-over and thrust-line
    checks get re-run when v.2 is laid out, not now.

--------------------------------------------------------------------------------
09 // ROADMAP CHECK — DOES R10 HELP OR HURT v.1-v.3?
--------------------------------------------------------------------------------

  v.1 LONG JUMP   Helped, and now bounded. The rocker gives v.1 a
                  mechanism with numbers. 150 mm fits the current layout,
                  and 200 mm needs one named change (§06). R06 proposed
                  200 mm as the CAP. R10 suggests 150 mm as the SPEC and
                  200 mm as the stretch (D51).
  v.2 SWINGS      Unblocked. v.2 had no yaw actuator (F82), and now it has
                  one that stays off the crowded x axis. The rolling loop
                  and the Qi coil conflicts (R08, R09) no longer matter for
                  v.2, because there is no second plunger.
  v.3 LEVITATION  Helped. A contactless yaw actuator is a precondition for
                  any levitated cube (§04). G11's motion classifier is the
                  first firmware that tells "the surface moves" apart from
                  "I am moved". A levitating cube needs that distinction
                  continuously.
  PLATFORM        Mapped. Two missing event sources and one privacy rule
                  stand between encodeSignal() and a working cube (§03).
                  None of them needs hardware.

--------------------------------------------------------------------------------
10 // CONSUMER USE CASE 10 — THE MOORING
--------------------------------------------------------------------------------

(Also appended to LOT-CUBIQ-QUANTUM-CUBE-v0.md §07. Prior entries untouched.)

  Operator profile: Usership tier, 38, a freelance translator who lives
  aboard a 57-foot narrowboat as a continuous cruiser: the boat must move
  to a new mooring every fourteen days. Power is solar into a 12 V bank.
  The cube's home pad runs from a USB-C socket by the dinette. The
  dinette table is birch ply on a single steel pedestal: a resonant
  surface, and one that sits on water. Phone signal comes and goes along
  the cut and drops out in the deep cuttings. They are in a three-person
  LOT® cohort with two other liveaboards they met on the towpath. They
  joined LOT® because the phone had become the boat's loudest object,
  buzzing in the one place they had gone to be quiet.

  07:30. Moored above a lock. A hire boat goes past too fast, and its
  wash rocks the narrowboat ±1.5° at about 2.5 s for a minute. Under R05's
  placement routine the cube would have counted itself "unplaced", and
  SETTLE would have been its only word for as long as the water moved
  (§05). With placement v0.3 the ToF ranges to the table edge don't
  change, the feet don't slide, and the IMU reads GENTLE. At 07:30 the
  operator's memory window opens (the hourly job, §03). The platform
  asks for HOP, one rung above the class default (R09 §03). Months ago
  the operator raised memory_ready to HOP in the app, because a NUDGE
  is hard to feel on a deck that is already moving. The cube is in its
  pad's recess. The pad ID arrives, the
  ToF sees the deck's front edge where the ID says it is (edge_seen), and
  the credit stands. G11 leaves HOPs alone, so the cube rises 10 mm and
  lands 0.8 mm from where a still table would have put it. The operator
  makes tea and answers the question.

  09:10. Engine on, ropes off. The diesel's vibration is G9: anything
  that arrives now waits. Through the lock flight and out onto the
  open cut, the boat yaws and rolls in the wind. Roll rises to ±4°, so the
  motion is ROUGH. At 09:40 the weekly achievement pass runs server-side
  (the badge_rare fix, §03) and finds an epic achievement: ninety
  consecutive Memory answers. The platform asks for LEAP with a 3 h TTL.
  The cube DEFERS it: first G9, then G11. Nothing on the table moves.

  10:20. One of the cohort sends a thought to the operator's cube. The
  boat is in a cutting with no signal. The ping reaches the operator's
  phone at 10:50, 30 minutes after its not_before. Its TTL is 15
  minutes, so the cube marks it EXPIRED and never performs it. The app
  will show it as history: "Thinking of you, 10:20". The sender sees
  "sent", as always (F79). Nobody had to design an "offline mode". The
  TTL table (R09 §03) already says how long each kind of moment lasts.

  11:40. Moored again, engine off, still water. To dry two mugs, the
  operator has laid a tea towel across the front of the pad's deck. The
  cube is put back in the recess. The pad ID says "PAD v0, home spot",
  but the ToF cannot find the 12 mm deck edge, because the towel covers
  it. edge_seen is false, so there is NO CREDIT. The deferred epic
  achievement is still inside its TTL. Without credit there is no 60 mm
  deck runway: the LEAP needs 125 mm and has 110, so it becomes a HOP
  (G1). The cube's own probe reads the ply-on-steel table as resonant,
  so the HOP becomes a NUDGE and then a SETTLE (G6): a slow two-second
  press, felt by the hand that is still resting beside it. The uplink,
  queued since 09:40 and flushed now that the phone has signal, shows
  the operator one line: "settle (G1). Pad deck not seen. Clear the
  front of the deck." They move the towel. Contract v0.5 would have taken the pad's word for a
  deck it couldn't see and LEAPed onto a towel and two mugs. v0.6 checks
  the claim against what it can see (F78).

  21:30. The wind picks up, and the boat swings on its ropes at ±3°.
  Quiet hours have begun. At 22:10 a second cohort ping arrives. The
  motion is ROUGH, so the ping is deferred, and at 22:25 it expires.
  Nothing is replayed in the morning (R03 rule). It waits in the app.

  What Use Case 10 proves that 01-09 did not:
    · A surface can move without being unsafe. The cube has to tell
      "the table moves with me" (gentle, keep the gestures) from "I am
      being moved" (unplaced) and from "everything is moving" (rough,
      wait). R05's stillness test could not tell these apart (§05).
    · An object that decides on the device and expires by TTL needs no
      network to stay correct. Patchy signal makes the cube quieter,
      never wrong and never late with a stale gesture.
    · A pad's claim must be checked against what the cube can see. A
      tea towel is the everyday version of R09's spoofed pad.
    · Uplink events can sit in a queue for hours and still be private:
      they go to the operator's own store, and only there (F79).

  Consumer market: liveaboards and boat owners (narrowboats, barges,
  houseboats, floating homes), people in cabins, vans and RVs parked for
  the season, and anyone whose table is not always still. More widely:
  people who live with weak signal by choice and want a notification
  object that works with that, rather than one that punishes it. On a
  train table the cube simply waits (rough → deferred), which is also
  the right behaviour for a commuter who wants the journey to be quiet.

--------------------------------------------------------------------------------
11 // DECISIONS FOR S-2
--------------------------------------------------------------------------------

  D0  PROCESS: merge one CUBIQ branch (this one: R01 → R10) to master, or
      point the routine at a single long-lived branch. (Eighth time.)
  D41 FIRST SPEND: still open from R08. R10 has done the four remaining
      paper items. R11 has little left on paper that doesn't need a
      measured number (§12).
  D50 Contract v0.6 direction: edge_seen is required for pad credit;
      G11 moving surface with gentle → JUMP capped at LEAP, other → defer.
      Thresholds after B31/B38. decide() stays v0.5 until adoption (F78,
      F80).
  D51 v.1 spring: rocker + double torsion spring + guided rod. v.1 range
      SPEC 150 mm, STRETCH 200 mm (needs Cr-Si wire, a 0.8 mm stator
      raise, or the 90 g target) (F81).
  D52 v.2 yaw: top-cap reaction wheel, in-flight turns only. Drop the
      y-axis launch pair (F82).
  D53 Platform wiring as §03: write `achievement_unlocked` with rarity;
      memory_ready = question window opens (hourly job); store assembly
      phase; cohort_ping as an explicit, rate-limited act, never derived
      from messages; screen-first rule (F77).
  D54 Device events in a separate `cubiq_device_event` store with an
      operator-only read path; never in Log; added to the security review
      (F79).
  Open and compatible: R05 D14, D16-D19; R06 D20, D21, D23-D28; R07
  D29-D35; R08 D36-D40; R09 D42-D49.

--------------------------------------------------------------------------------
12 // NEXT CYCLE (R11) PROPOSED SCOPE
--------------------------------------------------------------------------------

  · If D41 is approved: MULE-0 (B1 km with moving-magnet candidates, B33
    rolling-loop flex, B36 rocker rig) and MULE-1 (B31 pad timing and
    edge_seen, B37 wheel, B38 tilt table). Replace EST inputs in the
    R04-R10 scripts with measured values and report what moved.
  · If not:
      – Layout v0.3 for v.2: the wheel in the top zone, with the CoM and
        tip-over re-run (§08), and the ack-touch electrode above it.
      – Firmware-side reference: a C port of decide() (v0.5 + the
        v0.6-draft switch), run against all three vector files and the
        differential fuzz. This is the third implementation the contract
        was always meant to have (R09 §02).
      – If D53/D54 are approved: the platform change itself, as code, on
        its own branch, with B39 as its tests.
  · Use Case 11, chosen from themes not yet used across all branches.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-R10
================================================================================
