================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-R06
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report R06
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-15
VERSION:  0.6 — LONG JUMP · FRICTION CONE · RUNWAY SENSING · DROP · CONTRACT v0.2
STATUS:   v.0 — PRE-HARDWARE · DESIGN LOCK STILL PENDING (see §11)
PREDECESSORS: LOT-CUBIQ-QUANTUM-CUBE-v0.md     (R01, 2026-07-28)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R02.md (R02, 2026-11-10)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R03.md (R03, 2026-11-11)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R04.md (R04, 2026-11-13)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R05.md (R05, 2026-11-14)
================================================================================

R06 is the sixth development cycle of the v.0 actuated haptic notification
device. It covers the scope set in R05 §11: first numbers for the v.1 long
jump, drop survival, and the signal contract v0.2 written out with test
vectors. Five results, two of which correct earlier cycles:

  1. The v.1 long jump is still a spring problem, not a new mechanism.
     150 mm at a 60° launch costs ~96 mJ at the body of a 112.5 g cube and
     ~137 mJ in the spring. A 10 mm plunger keeps peak force at ~27 N.
  2. CORRECTION to R02/R03: a plunger on a 45° axis needs a tip friction
     of μ ≥ 1.0. On normal surfaces (μ ≈ 0.5) the tip slides and the
     "45° LEAP" actually launches at ~63°. R06 proposes a 30°-off-vertical
     plunger (60° launch). It needs μ ≥ 0.58, and the landing then sticks
     (R04 F19).
  3. CORRECTION to R05 L2: ToF sensors in the base band (4.5 mm up) can
     only confirm ~51 mm of clear table at a usable grazing angle. v.0
     LEAP needs 125 mm. The sensors go back up the face to 20-24 mm.
  4. A 750 mm-1 m fall is survivable on paper if two rules hold: the cell
     never sits between the reaction mass and its end stop, and the LEAP
     spring is never left cocked. R06 proposes COCK-ON-INTENT.
  5. Signal contract v0.2 is written out in full, with 30 test vectors and
     a reference decision function. All 30 vectors pass.

Everything here is analysis. No hardware exists. No part has been bought.
Inputs marked EST are placeholders for bench measurement.

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Own prior work (read this cycle):
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md       R01 — form, gestures,
    QI·46 loop, v.0→v.3 roadmap, Use Cases 01-05 (§07).
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R02.md   R02 — ballistics, hybrid
    drive, edge ladder (125 / 85 mm), quiet hours, v.1 150 mm energy.
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R03.md   R03 — foot-plunger LEAP,
    FSM G1-G6, signal contract v0.1 (§05).
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R04.md   R04 — power path, G4a/G4b,
    G7, landing-stick rule F19, v.2 swing-hop pre-study.
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R05.md   R05 — lateral position
    correction, static multizone look, tolerance stack, first layout,
    mass budget v0.3, NUDGE signature, Use Case 05. Read in full.
  scripts/cubiq-r05-position-look.py — not re-run for new numbers; R06
    uses its outputs as stated in R05.

LOT® Institute corpus (re-read in the cited sections):
  docs/corporate/LOT-CUBIQ-VISION.md      §01 anti-feed: "LOT® invests
                                           attention and returns structure"
  docs/corporate/LOT-CUBIQ-OPERATOR.md    §01 PRESENCE; §03 Index of
                                           Systems signal classes; §04
                                           AI-driven physical delivery
  docs/corporate/LOT_QI46_ENGINE.md       Month-12 cube sync: haptic
                                           preference (pressure, duration,
                                           cadence)
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md  the object should "feel the
                                           field it sits in"

PROCESS NOTE — CONTINUITY, S-2 (fourth time)
  This run also started from `master`, which still holds only R01. It
  scanned all `origin/claude/tender-turing-*` branches, found the R02→R05
  chain on `claude/tender-turing-cjpwpx` (2026-11-14, the newest), and
  fast-forwarded this branch (`claude/tender-turing-t33oga`) onto it. This
  branch now holds R01→R06 in order. Merging it to `master` is still the
  fix (D0).
  Use-case themes were checked against every CUBIQ document on every
  branch (~100 runs). Night, kitchen, shared rooms, cohorts, offices,
  hotels, music, recording, travel and Deaf households have all been
  covered. Workshops and hands-busy craft work have not. Use Case 06 is
  that case, and it exercises the two new safety topics of this cycle
  (drops and stored spring energy) directly.

--------------------------------------------------------------------------------
01 // WHAT CHANGED IN R06
--------------------------------------------------------------------------------

  F31  v.1 long jump first numbers: 150-250 mm at 45° and 60°, 112.5 g
       and 90 g. Spring 120-230 mJ; 10 mm plunger stroke.           §02
  F32  CORRECTION: launch friction cone. A 45° plunger axis slides on
       any surface with μ_tip < 1. Proposed: 30° off vertical (60°
       launch) for LEAP and JUMP.                                    §03
  F33  CORRECTION: runway sensing. Base-band ToF (R05 L2) can't confirm
       the 125 mm v.0 LEAP runway. Move the ToF band to 20-24 mm.    §04
  F34  Landing impact: a 150 mm JUMP lands like a 65 mm drop. JUMP is
       never quiet and needs a DAMPED surface.                       §02
  F35  Drop survival at 750 mm and 1 m: shell corners, the 40 g reaction
       mass, the cell's load path, post-fall firmware (G8).          §06
  F36  Latch under shock: a cocked pawl can be fired by a drop.
       Proposed: COCK-ON-INTENT with a reversible cocking drive.     §06
  F37  Signal contract v0.2 in full + 30 test vectors + reference
       decision function. 30/30 pass.                                §05
  F38  New guard G9: shared-structure vibration DEFERS motion, it never
       escalates it (from Use Case 06).                              §07
  F39  Operator-set ceilings: only the operator, never QI·46, may raise
       a class ceiling, and only by one rung (from Use Case 06).     §07
  F40  Use Case 06 — THE MAKER'S BENCH.                              §10

  Reproduce every number in this report with:
      python3 -I scripts/cubiq-r06-longjump-drop.py
      python3 -I scripts/cubiq-r06-contract-check.py

--------------------------------------------------------------------------------
02 // F31 + F34 — v.1 LONG JUMP: FIRST NUMBERS
--------------------------------------------------------------------------------

  Point-mass ballistics, no drag (a 45 mm cube at ≤ 1.7 m/s loses < 1 %
  to drag). Spring store at 70 % transfer (R03: 60-80 %). Peak force is
  for a linear spring starting from zero preload; preload lowers it.
  Landing slide uses R04 F19 (feet μ 0.5, restitution 0.2, EST).

    mass     range  elev  body KE   rise    flight  spring   peak F       touch-  slide
                                                    @70 %    6 / 10 mm    down vy
    112.5 g  150    45°    82.8 mJ  38 mm   175 ms  118 mJ   39 / 24 N   0.86    12 mm
    112.5 g  150    60°    95.6 mJ  65 mm   230 ms  137 mJ   46 / 27 N   1.13     0 mm
    112.5 g  200    60°   127.4 mJ  87 mm   266 ms  182 mJ   61 / 36 N   1.30     0 mm
    112.5 g  250    60°   159.3 mJ 108 mm   297 ms  228 mJ   76 / 46 N   1.46     0 mm
     90.0 g  150    60°    76.5 mJ  65 mm   230 ms  109 mJ   36 / 22 N   1.13     0 mm
     90.0 g  250    60°   127.4 mJ 108 mm   297 ms  182 mJ   61 / 36 N   1.46     0 mm

    Landing scatter (range σ 10 %, R04): p98 ±31 mm at 150, ±51 mm at 250.

  WHAT IT MEANS
    · The v.1 jump is ~4-5× the v.0 LEAP spring (28-37 mJ, re-run at
      112.5 g). Same plunger, same latch, a bigger spring and a longer
      stroke. R03 §08 said this ("helped, nothing new"), and the numbers
      agree.
    · Use a 10 mm plunger stroke for v.1, not 6 mm. Peak force drops by
      40 %, which means a smaller latch load, a smaller pawl and a lower
      cocking torque. The plunger module grows ~4 mm in length. It fits
      along the 30° axis (§03) inside the base corner.
    · If v.1 ships at 112.5 g instead of the 90 g target, a 150 mm jump
      costs +25 % energy. That's affordable. Mass is no longer what decides
      whether v.1 is possible. It decides how far v.1 can jump.
    · v.1 range cap, proposed: 200 mm. Past that, landing scatter
      (±41 mm at 200) and runway sensing (§04) get worse faster than the
      gesture gets better.

  F34 — LANDING IMPACT
    peak deceleration, linear-spring contact (a = v² / s):

      gesture                 touchdown   same as a     foot compliance
                                          drop of       1 mm    2 mm    4 mm
      v.0 LEAP 40 mm @45°     0.44 m/s     10 mm         20 g    10 g     5 g
      v.1 JUMP 150 mm @60°    1.13 m/s     65 mm        130 g    65 g    32 g
      v.1 JUMP 250 mm @60°    1.46 m/s    108 mm        217 g   108 g    54 g

    Electronics don't care about 65 g. The ear does. A 112 g block
    dropped 65 mm onto a desk is a clear knock, every time. Rules for v.1:
      · JUMP is never allowed in quiet hours (already true for all
        ballistic gestures, R02 §06).
      · JUMP needs surface_class = DAMPED (G6), not only a clear runway.
        A JUMP onto a resonant shelf is a drum hit.
      · Feet: ≥ 2 mm of compliant travel (soft elastomer dome), for the
        knock as much as for the g-load. Acoustic budget is R07 scope.

--------------------------------------------------------------------------------
03 // F32 — CORRECTION: THE LAUNCH FRICTION CONE
--------------------------------------------------------------------------------

  THE ERROR
    R02 chose a ~45° launch for LEAP. R03 put the spring in a foot plunger
    on that axis. Neither cycle checked the plunger TIP. A tip pushing the
    table along an axis φ from vertical needs tangential/normal = tan φ.
    If the surface can't supply that much friction, the tip slides and the
    horizontal impulse is capped at μ_tip × the normal impulse.

    axis off   μ_tip   actual launch   range at same KE
    vertical           elevation       (before slip losses)
    45°        0.3     73°             ×0.55   slides
    45°        0.5     63°             ×0.80   slides
    45°        0.7     55°             ×0.94   slides
    45°        1.0     45°             ×1.00   as designed
    30°        0.3     73°             ×0.64   slides
    30°        0.5     63°             ×0.92   slides
    30°        0.7     60°             ×1.00   as designed

    μ_tip needed: 1.00 for a 45° axis, 0.58 for a 30° axis.

  WHAT IT MEANS
    · On nearly every real desk, the R02/R03 "45° LEAP" would have
      launched at 55-73°, shorter and more variable than specified, and
      it would have lost energy to tip scuffing on top of that. Bench test
      B4 (40 ±10 mm, 3 surfaces) would most likely have failed with no
      clear reason why.
    · The failure is SHORT, never long: tip slip only steepens the launch.
      So the R02 edge ladder was never unsafe. It was just wrong about
      range.
    · PROPOSAL (D20): plunger axis 30° off vertical, a 60° launch, for
      LEAP (v.0) and JUMP (v.1). Then:
        – μ_tip ≥ 0.58 holds on dry wood and laminate with a silicone tip
          (EST; B20 measures it),
        – the landing sticks when μ_feet ≥ 0.48 (R04 F19), so there's no
          post-landing slide,
        – energy cost +15 % over 45° (R04), and
        – the v.2 swing-hop plungers are already 60-70° (R04), so ONE
          plunger geometry now covers v.0, v.1 and v.2.
    · v.0 LEAP 40 mm at 60°, 112.5 g: 25.5 mJ at the body, 32-43 mJ in
      the spring. B3 becomes 32-43 mJ ±15 %.
    · Glass and polished stone (μ_tip ≈ 0.2-0.3 EST) still slide. On those,
      the placement routine's resonance probe can't tell friction, so LEAP
      range there is "short and unknown". It's safe (short), but it isn't
      a promise. That's a firmware note, not a blocker.

--------------------------------------------------------------------------------
04 // F33 — CORRECTION: RUNWAY SENSING NEEDS HEIGHT
--------------------------------------------------------------------------------

  THE ERROR
    R05 L2 moved the four multizone ToF sensors to the base band, 3-6 mm
    above the table, canted down, and found the edge as "the range at
    which the table stops returning". That works only where the beam hits
    the table at a usable angle. A zone that returns table proves table
    only up to the NEAR end of its footprint, d = h / tan(depression).
    Below some grazing angle, matte wood stops returning reliably and a
    2 mm notebook casts a long shadow. R06 takes 5° as the floor (EST;
    B18 measures it).

      base band h = 4.5 mm   →   reliable clear-table reach  51 mm

    The v.0 LEAP edge ladder (R02) needs 125 mm free ahead. So with the
    R05 layout the cube could never PROVE a LEAP runway, and G1 would
    downgrade every LEAP to HOP. That's safe, but it means the gesture
    never happens.

  HOW HIGH, THEN?
    Free table needed = range + p98 scatter + slide + 20 mm margin (R02).

      gesture                 free table   ToF height    slant range
      v.0 LEAP 40 mm          125 mm       ≥ 10.9 mm     125 mm
      v.1 JUMP 150 mm @60°    201 mm       ≥ 17.6 mm     202 mm
      v.1 JUMP 200 mm @60°    261 mm       ≥ 22.8 mm     262 mm
      v.1 JUMP 250 mm @60°    321 mm       ≥ 28.1 mm     323 mm  > 300 mm
                                                                  ToF spec

  DECISION (proposed, D21)
    · Sensor band at 20-24 mm, close to mid-face. That reverses R05 L2 and
      is, a little embarrassingly, where R01 had the sensors. The R05
      static look (F25), the derate rule and the 45° FoV all still hold.
      Only the mounting height changes.
    · 22 mm covers v.0 LEAP with ~2× margin and v.1 jumps up to ~190 mm
      with the R05 300 mm range spec. That supports the 200 mm v.1 cap
      (§02). Longer jumps would need ≥ 400 mm sensors and a 28 mm band.
    · Layout cost: the stator sits at mid-height (R05 §05), so the sensors
      move onto four flex-PCB tabs that wrap the stator to the face
      windows. +0.3 g EST. The base band keeps nothing optical. The Qi
      ferrite and the LED ring stay where they are.
    · The canted-down rows still see the near table, so the "surface stops
      returning" test still works, now at a usable angle.

--------------------------------------------------------------------------------
05 // F37 — SIGNAL CONTRACT v0.2 (INDEX OF SYSTEMS ↔ CUBE), IN FULL
--------------------------------------------------------------------------------

  Principle unchanged from v0.1: the platform sends an INTENT, which is
  a ceiling, not an order. The cube decides the motion. Safety lives on
  the device, and the server never learns about the furniture.

  DOWNLINK — SIGNAL (platform → cube)
    {
      "v": 2,                              // 1 still accepted (no hint)
      "id": "sig_01J…",                    // ULID, idempotency key
      "class": "memory_ready" | "badge_common" | "badge_rare" |
               "assembly_phase" | "cohort_ping",   // unknown → settle
      "intent": "settle" | "nudge" | "hop" | "leap" | "jump",
                                           // "jump" reserved for v.1
      "priority": 0-3,                     // integer; booleans rejected
      "ttl_s": 1-86400,
      "not_before": "2026-11-15T10:00:00Z",
      "ceiling_hint": "call_live"          // OPTIONAL, v2 only (R05 D17)
    }
    Unknown extra fields are IGNORED (forward compatibility), not rejected.

  DOWNLINK — CONFIG (platform → cube, on pairing and on change)
    {
      "v": 2, "type": "config",
      "nudge_gap_ms": 250-600,             // R05 F29 two-beat signature
      "call_live_opt_in": true | false,    // R05 D17, operator choice
      "quiet_hours": {"start": "22:00", "end": "07:00", "tz": "…"},
      "operator_ceilings": {"memory_ready": "hop"}   // F39, see §07
    }

  UPLINK — OUTCOME (cube → platform → QI·46 Calibration Loop)
    {
      "v": 2, "id": "sig_01J…",
      "event": "performed" | "held" | "deferred" | "expired" |
               "rejected" | "safe_hold",
      "performed": "none" | "settle" | "nudge" | "hop" | "leap" | "jump",
      "downgrade_reason": null | "device_capability" | "class_ceiling" |
               "call_live" | "quiet_hours" | "G1_edge_or_level" |
               "G4b_cadence" | "G6_resonant_surface" |
               "G7_unknown_surface" | "G8_fall_recent" |
               "G9_machine_vibration" | <validation error code>,
      "ack": "touch" | "approach" | "none",
      "latency_to_ack_s": 412,
      "surface_class": "damped" | "resonant" | "unknown"
    }

  UPLINK — DEVICE EVENT (unsolicited)
    {"v": 2, "type": "device_event",
     "event": "fall" | "self_test_pass" | "self_test_fail" |
              "placement_done" | "tof_window_dirty"}
    Motion telemetry only. Never audio, never raw sensor streams (v0.1
    rule, unchanged).

  DECISION ORDER (cube side; the first rule that LOWERS records the reason)
     1. validate              → "rejected" + error code, no motion
     2. expired (now > not_before + ttl)  → "expired", silent
     3. now < not_before      → "held"
     4. G8 fall not yet cleared  → "safe_hold"
     5. G9 machine vibration  → "deferred" (kept until TTL)
     6. device capability     (v.0 caps at leap; "jump" → leap)
     7. class ceiling         (R01 §04 map; operator_ceilings may raise
                               one rung, §07)
     8. ceiling_hint call_live → settle (if operator opted in)
     9. quiet hours           → nudge
    10. G7 unplaced off-pad   → settle
    11. G4b cadence           → ballistic gestures down to nudge
    12. G1 edge / level       → one rung down per failed check
                                (jump 201 mm, leap 125 mm, hop 85 mm;
                                 level > 3° blocks leap/jump)
    13. G6 surface            → nudge on resonant/unknown → settle
    The ladder only goes down. Nothing in steps 6-13 can raise a gesture.

  TEST VECTORS
    docs/corporate/cubiq/signal-contract-v0.2-vectors.json — 30 vectors.
    Each one gives a signal, the cube state and the expected outcome.
    scripts/cubiq-r06-contract-check.py runs them against the reference
    decision function. Result this cycle: 30/30 PASS.

    Two vectors failed on the first run and were fixed:
      · #06 ("jump" on v.0): the class ceiling was applied before the
        device ceiling, so the logged reason was wrong. The device ceiling
        now goes first. The platform should learn "this cube can't do
        that", not "this class doesn't allow that".
      · #14 (60 mm shelf): R06's expected value was wrong, not the code.
        R02's ladder takes HOP to NUDGE below 85 mm, and NUDGE doesn't
        travel, so it's correct on a 60 mm shelf. The vector was fixed.

    Open item, on purpose: NO class maps to "jump" in v0.2. Vectors #07
    and #30 show a v.1 cube on a clear runway still performing a LEAP,
    because badge_rare's ceiling is leap. Which signal, if any, earns
    the biggest gesture the cube has is a product decision (D27), not an
    engineering one.

--------------------------------------------------------------------------------
06 // F35 + F36 — DROP SURVIVAL
--------------------------------------------------------------------------------

  A cube that leaps will one day leave the desk, usually because a sleeve
  catches it, not because a jump went wrong. Load cases: a 750 mm table
  and a 1 m bench or counter, onto concrete or tile.

    drop     impact     fall time   cube KE   reaction-mass KE (40 g)
    750 mm   3.84 m/s   391 ms      0.83 J    0.294 J
    1.0 m    4.43 m/s   452 ms      1.10 J    0.392 J

  SHELL
    Corner-first onto concrete. Stopping distance is whatever the shell
    corner crushes:
      0.5 mm → 3,000 g      1.0 mm → 1,500 g      2.0 mm → 750 g  (750 mm)
    Ceramic-filled polymer (R03) is stiffer and more brittle than plain
    polymer. A sharp 1.0 mm corner is the part that fails first.
    REQUIREMENTS: corner radius ≥ 2.5 mm; internal crush ribs at all 8
    corners giving ≥ 1.5 mm of sacrificial crush; the corner ribs double
    as the R03 landing ribs. The look must survive a chipped corner. That
    belongs to the R01 surface-finish spec, not engineering.

  THE 40 g REACTION MASS
    On impact the frame stops in under a millisecond. The 40 g mass keeps
    going, crosses its 4 mm half-stroke, and hits the end stop.

      end-stop elastomer   750 mm drop                  load on cell
      travel               decel     force on stop      alone   if under slug
      1.0 mm               1,500 g   589 N              103 N   589 N
      1.5 mm               1,000 g   392 N               69 N   392 N
      3.0 mm                 500 g   196 N               34 N   196 N

    With battery-as-reaction-mass (R05 D15), what decides the outcome is
    where the cell sits. If the 33 g slug drives the 7 g cell into the
    stop, the pouch takes ~400-600 N in a point load. That's a crush
    event, not a drop event.
    RULE (condition on D15): the slug strikes the end stop directly
    through a stop collar. The cell rides in a cradle that is NEVER in
    the slug-to-stop load path. Then the cell only carries its own 7 g,
    ~70 N at a 1.5 mm stop, spread over its face. Plus ≥ 1.5 mm elastomer
    at both stroke ends.
    Shorting the coil when free fall is detected (H-bridge low side on,
    no energy needed) adds eddy damping c = km². Over the half-stroke it
    takes off 5 % (km 1.0), 12 % (km 1.5) or 21 % (km 2.0) of the mass
    energy. Worth having because it costs nothing, but the elastomer is
    what does the job.

  F36 — THE LATCH UNDER SHOCK
    The LEAP latch is a coil-tripped pawl (R03). It's built to release on
    a milliwatt trigger, so its trip force is small: 1-2 N EST. A 0.3 g
    pawl at 500-1,500 g carries 1.5-4.4 N of its own inertia. So a drop
    can trip a cocked latch. The cube then fires its plunger on the
    floor, or in the hand that just picked it up. With v.1's ~137 mJ
    spring, that's a real hazard.

    PROPOSAL (D22) — COCK-ON-INTENT
      · The spring rests UNCOCKED. Stored energy is zero by default.
      · Cocking starts only after a LEAP/JUMP is accepted and gates G1-G9
        pass. The fire happens within 10 s, or the cube DECOCKS.
      · This needs a reversible cocking drive (gearmotor + cam or lead
        screw), not a one-way ratchet. +0.5 g EST.
      · Latency: R03's 3-5 s cocking time moves before the gesture
        instead of after it. For a non-urgent badge that's invisible, and
        LOT doesn't send urgent signals by design (LOT-CUBIQ-VISION §01).
      · Exposure: 1 LEAP/day × 10 s armed = 0.012 % of the day with stored
        energy; 12/day = 0.14 %. Cocked-and-waiting was 100 %.
      · Free fall while armed (the 0.012 %): short the coil, command
        decock. 331 ms is left after a 60 ms detection, which is probably
        not enough to finish a decock. B19 tests the armed-fall case to
        see whether the pawl holds.
    This also changes the FSM: COCKING moves from after LEAP to before
    it, and the cocked state becomes ARMED (≤ 10 s).

  G8 — AFTER A FALL (firmware)
    · Detection: free fall (|a| < 0.3 g) with no launch commanded in
      the previous 50 ms. At 60 ms it's PROVISIONAL: short the coil and
      start a decock. At ≥ 150 ms it's CONFIRMED as a fall. The cube's
      own flights last 175-300 ms, but it commanded them, so they don't
      count. A 750 mm fall lasts 391 ms.
    · Impact → SAFE-HOLD. Coil shorted, latch decocked, all motion off,
      signals answered "safe_hold". Uplink device_event "fall".
    · Wait to be picked up (lift detect), then placed. G7 placement runs
      from scratch, since it's probably not the old surface.
    · Self-test before G8 clears: coil resistance; a 10 % stroke sweep
      (current vs. position, which shows a bent former or a loose mass);
      latch state; ToF window crosstalk; cell rest voltage and temperature
      over 10 min.
    · Any anomaly (cell temperature rise > 2 K at rest, voltage sag, coil
      or stroke out of band) → "self_test_fail". Qi receive and charging
      are DISABLED and the app tells the operator, in plain words, to
      stop using the cube. A cell that might be damaged is never charged
      again on the cube's own judgment.

  MASS BUDGET v0.4
    R05 with battery-as-reaction-mass       112.5 g
    + ToF flex tabs (F33)                    + 0.3 g
    + reversible cocking drive (F36)         + 0.5 g
    ─────────────────────────────────────────────────
    R06 total                               113.3 g   margin 6.7 g
    (Without D15 it would be 120.3 g, over the 120 g budget. D15 is now
    required, not recommended.)

--------------------------------------------------------------------------------
07 // F38 + F39 — TWO RULES FROM THE WORKSHOP (Use Case 06)
--------------------------------------------------------------------------------

  F38 — G9 SHARED-STRUCTURE VIBRATION: DEFER, NEVER ESCALATE
    When the surface the cube sits on is being worked (clay wedged on it,
    a sander or a router on the same bench, a washing machine on the same
    floor), three things go wrong. A NUDGE can't be felt over the noise.
    The IMU's landing and fall detection get noisy. And a ballistic
    gesture next to a moving tool is a safety problem.
      · Trigger: IMU ambient vibration RMS > 0.05 g over 1 s (EST) while
        the cube itself is still.
      · Action: hold the signal ("deferred"). Nothing moves. The signal
        keeps its TTL, so if the work goes on past the TTL, the signal
        expires silently. That's correct, not a loss.
      · Release: NUDGE/SETTLE after 30 s of quiet; ballistic gestures
        after 120 s of quiet (people put tools down and pick them up).
      · The tempting wrong answer: "it can't be felt, so HOP instead".
        That's an upgrade, and the ladder only goes down.

  F39 — OPERATOR-SET CEILINGS
    For a hands-busy operator, the felt channel mostly fails and the
    visible channel (HOP) is the one that works. Under the R01 map, only
    badges are allowed to be visible. Two options were considered:
      (a) let QI·46 learn to raise memory_ready to HOP when acks are
          slow. REJECTED. That's an engagement optimiser by another
          name, the feed LOT-CUBIQ-VISION §01 says the cube is not.
      (b) let the OPERATOR raise a class ceiling, in the app, by
          exactly one rung (e.g. memory_ready nudge → hop), reversible
          any time. ADOPTED (D25). It travels as config.operator_ceilings.
          QI·46 may LOWER it again (cadence, R04 G4b) but can never set
          it. No class can be raised above leap. jump stays D27.

--------------------------------------------------------------------------------
08 // VALIDATION PLAN — DELTAS TO R05 §08
--------------------------------------------------------------------------------

  B3  REVISED  Spring-latch plunger, 30° axis: 32-43 mJ stored ±15 %,
               200 cycles, no creep; DECOCK 200 cycles without firing.
  B4  REVISED  LEAP at 60° launch: 40 ±10 mm, 100 trials, 5 surfaces
               including laminate and glass. Report measured launch
               elevation per surface.
  B18 NEW      ToF grazing floor: minimum reliable depression angle on
               matte, glossy and dark wood, laminate, glass, cloth.
               Result sets GRAZE_MIN (5° EST) and the band height (F33).
  B19 NEW      Drop: 26-orientation sequence (6 faces, 12 edges,
               8 corners; the transit-drop pattern used in MIL-STD-810
               Method 516) from 1.0 m onto concrete, powered, 3 units.
               PASS: no cell deformation (thickness ± 0.1 mm), no shell
               crack through-wall, self-test passes. Plus 5 drops with
               the latch ARMED: record whether the pawl holds.
  B20 NEW      Plunger tip μ on 8 household surfaces. PASS: ≥ 0.58 on
               dry wood and laminate.
  B21 NEW      G8 fall detection: 50 drops onto foam (100 % detected);
               1,000 commanded HOP/LEAP (0 false falls).
  B22 NEW      G9: 3 working benches (wedging, sanding, hand tools).
               PASS: 0 ballistic gestures during work; deferred signals
               delivered within 2.5 min of quiet or expired.
  B23 NEW      Contract conformance: platform encoder and cube firmware
               both run the 30 v0.2 vectors in CI. PASS: 30/30.
  Unchanged: B1, B1b, B2, B5-B17 and the R01 500/500 close gate.

--------------------------------------------------------------------------------
09 // ROADMAP CHECK — DOES R06 HELP OR HURT v.1-v.3?
--------------------------------------------------------------------------------

  v.1 LONG JUMP   Helped a lot. Energy, stroke, landing and runway now have
                  numbers. Cap proposed at 200 mm. The 30° plunger, the
                  22 mm ToF band and cock-on-intent are all v.1 parts,
                  bought early.
  v.2 SWINGS      Helped. One plunger geometry (60° launch) for v.0, v.1
                  and v.2. Landings stick (F19), so the R05 cross-track
                  model's slip term should drop. To be re-run in R07.
  v.3 LEVITATION  Neutral. The cocking gearmotor adds a small magnet. It
                  must sit OUTSIDE the v.3 keep-out (R05 §05: no ferrous
                  part above the Qi ferrite). Placed at the base corner
                  next to the plunger.

--------------------------------------------------------------------------------
10 // CONSUMER USE CASE 06 — THE MAKER'S BENCH
--------------------------------------------------------------------------------

(Also appended to LOT-CUBIQ-QUANTUM-CUBE-v0.md §07. Prior entries untouched.)

  Operator profile: Usership tier, a studio potter working from a
  converted garage with a concrete floor. They throw on the wheel in the
  morning, trim and glaze in the afternoon, and sell at weekend markets.
  They use LOT® for the Memory Engine and their Assembly. The phone lives
  in a zip bag on a shelf because of clay and silica dust. They don't
  look at it for hours, which they like, and they miss things, which
  they don't. The cube sits on its pad at the far end of the wedging
  bench: thick plywood, 900 mm high.

  08:40. Wedging. The operator is pounding clay on the same bench the
  cube sits on. A memory_ready signal arrives. G9 sees bench vibration
  and DEFERS (F38). A NUDGE couldn't be felt over the wedging anyway,
  and hopping on a bench that's being hit would be both pointless and
  unsafe.

  09:05. Wedging done, the operator crosses to the wheel. After 30 s of
  quiet the cube performs the NUDGE. Nobody's hand is on the bench.
  The signal goes unacknowledged and expires at its TTL. That's how a
  ceiling is meant to work: the cube doesn't escalate to get noticed.
  That evening the operator opens the app and finds that two days of
  memory prompts went unseen. They choose, themselves, to raise
  memory_ready one rung to HOP (F39). QI·46 didn't suggest it, and
  can't.

  11:30, next day. Throwing. memory_ready arrives; the bench is quiet.
  The cube does THE HOP, a 10 mm rise, which the operator sees from the
  wheel 2 m away (~0.3° of their visual field, enough to catch as motion).
  Hands in wet clay, they don't touch the cube. They lean toward it and
  hold a palm 10 cm from the front face: ack = "approach" (ToF). The
  question waits on the studio tablet for the lunch break.

  14:10. A badge_rare unlock (a 30-day Assembly streak). G1-G9 pass. The
  cube cocks only now (F36), 4 s of faint whirr, then LEAPs 40 mm at its
  60° launch and lands without sliding (F32).

  15:45. Reaching past the cube for a sponge, a sleeve hooks the pad
  cable. The cube goes off the bench edge onto concrete: 900 mm, ~430 ms
  in the air. The spring is uncocked, as it is 99.99 % of the day, so
  nothing fires. A corner crush rib takes the hit. G8: SAFE-HOLD, fall
  event uplinked. The operator picks it up and sets it back on the pad.
  The cube runs placement, then its 10-minute self-test: coil, stroke,
  latch, ToF windows, cell temperature. Pass. A small chipped corner is
  the only mark.

  16:30. Trimming throws fine clay dust. A thin film forms on the ToF
  windows, and crosstalk rises. The cube reports tof_window_dirty and
  treats every surface as UNKNOWN (G7). Only SETTLE is allowed until the
  windows are wiped. The app says so in one line. It fails quiet.

  What Use Case 06 proves that 01-05 did not:
    · In a workshop, the felt channel and the touch ack both fail.
      The APPROACH ack and the visible HOP carry the cube instead. The
      contract already had "approach". It was this case that made it
      necessary.
    · Vibration in the shared surface must DEFER motion, never escalate
      it (G9). This is also a safety rule: no ballistic gesture next to a
      tool in use.
    · Benches are 900 mm or higher and floors are concrete. For this
      operator a drop is a monthly event, not an edge case. Cock-on-intent
      (F36) and the cell load-path rule (F35) are what make that drop
      boring.
    · When a channel doesn't reach someone, the operator decides whether
      to make it louder, not the system (F39). That is the anti-feed
      thesis written as a settings rule.

  Consumer market: people who work with their hands where a phone
  can't be: potters, woodworkers, jewellers, bike mechanics, bakers,
  restorers. Their notification problem is the reverse of the office's:
  not too much interruption, but no channel that reaches them at all
  short of taking off gloves and unlocking a screen.

--------------------------------------------------------------------------------
11 // DECISIONS FOR S-2
--------------------------------------------------------------------------------

  D0  PROCESS: merge this branch (R01 → R06) to master, or point the
      routine at one long-lived CUBIQ branch. (Fourth time asked. Each
      run spends its first stage reconstructing the chain.)
  D20 Plunger axis 30° off vertical (60° launch) for LEAP and JUMP;
      supersedes R02 D2's ~45° axis. B3 → 32-43 mJ (F32).
  D21 ToF band at 20-24 mm on flex tabs; supersedes R05 L2 base band
      (F33).
  D22 COCK-ON-INTENT with a reversible cocking drive; ARMED ≤ 10 s
      then decock; FSM updated (F36).
  D23 Drop requirements: 1.0 m / 26 orientations; corner radius
      ≥ 2.5 mm + crush ribs; cell outside the slug-to-stop load path;
      self-test gate before charging resumes (F35, G8).
  D24 Adopt signal contract v0.2 and its 30 vectors as the conformance
      suite for both platform and firmware (F37, B23).
  D25 Operator-set ceilings: +1 rung, operator only, QI·46 may lower,
      never raise (F39).
  D26 G9 vibration deferral (F38).
  D27 Which class, if any, earns JUMP in v.1. Engineering has no
      preference. The anti-feed default would be "none until asked".
  D28 v.1 range cap 200 mm and stroke 10 mm (F31).
  D15 (R05) is now REQUIRED for the mass budget (§06), no longer
      optional. R05 D14 and D16-D19 remain open and compatible. D14's
      sensor HEIGHT is superseded by D21; its sensor type and FoV stand.

--------------------------------------------------------------------------------
12 // NEXT CYCLE (R07) PROPOSED SCOPE
--------------------------------------------------------------------------------

  · Acoustic budget: landing knock SPL for HOP / LEAP / JUMP on damped vs.
    resonant surfaces; foot dome stiffness vs. knock vs. g-load.
  · Reversible cocking drive to part classes: cam profile, gearmotor
    class, cocking energy and time at 32-43 mJ (v.0) and ~137 mJ (v.1),
    and its v.3 keep-out placement.
  · Re-run the R05 v.2 cross-track model with sticking landings (60°
    launch), with the slip term reduced to match.
  · Flex-tab ToF layout and window design for dust (Use Case 06).
  · Use Case 07, chosen from themes not yet used across all branches.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-R06
================================================================================
