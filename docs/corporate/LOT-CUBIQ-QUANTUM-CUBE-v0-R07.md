================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-R07
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report R07
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-20
VERSION:  0.7 — ACOUSTIC BUDGET · CAM-AS-LATCH · FLOATING SLEEVE · CONTRACT v0.3
STATUS:   v.0 — PRE-HARDWARE · DESIGN LOCK STILL PENDING (see §12)
PREDECESSORS: LOT-CUBIQ-QUANTUM-CUBE-v0.md     (R01, 2026-07-28)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R02.md (R02, 2026-11-10)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R03.md (R03, 2026-11-11)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R04.md (R04, 2026-11-13)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R05.md (R05, 2026-11-14)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R06.md (R06, 2026-11-15)
================================================================================

R07 is the seventh development cycle of the v.0 actuated haptic notification
device. It covers the scope R06 §12 set: the acoustic budget, the
reversible cocking drive, the v.2 cross-track re-run, and ToF windows for
dust. Six results. Two of them correct earlier cycles, and one deletes a
part:

  1. The surface matters more than the gesture. A HOP on a resonant
     shelf (~60 dB at 1.2 m) is louder than a 150 mm JUMP on a normal desk
     (~58 dB). Every doubling of rise adds only +3 dB. A resonant surface
     adds +10 dB. So the cube's main acoustic control is WHERE it moves,
     not HOW FAR.
  2. In a quiet room (library, ~35 dB) no ballistic gesture is quiet
     enough: even a HOP on a damped desk lands ~10 dB over ambient at the
     neighbour's seat. In an office or a kitchen (45-48 dB) HOP and LEAP on
     a damped desk are masked. Quiet venues therefore need an
     operator-set HUSH (new guard G10). No microphone is added.
  3. The cocking drive should be a self-locking worm plus a SNAIL CAM, and
     the cam's drop edge IS the latch. The R03 coil-tripped pawl goes
     away, and with it R06's open question of whether a drop can trip a
     cocked pawl (B19 armed case). On the dwell the spring load is radial,
     so a drop puts zero torque on the cam.
  4. CORRECTION to R06 D22: in a push plunger, "tip flush with the feet"
     and "spring fully compressed" are the same state. A cube that rests
     UNCOCKED with a fixed plunger sleeve sits on a 6 mm tip and leans
     8.5°. Cock-on-intent therefore needs a FLOATING SLEEVE. That is one
     extra part, and the cube's own weight resets it.
  5. Sticking landings (R06 F32) barely help v.2. They take ≤ 1 mm off the
     p98 cross-track error. Lateral ToF σ ≤ 5 mm (R05) remains the spec
     that decides pass or fail.
  6. CORRECTION to contract v0.2: three rules R06 wrote down never reached
     the reference function or its vectors (operator ceilings,
     JUMP-needs-damped, dirty windows). Contract v0.3 implements them, adds
     G10 hush, and extends G6 to ballistic gestures. 44 vectors, 44/44
     pass. The 30 v0.2 vectors are carried forward unchanged and still
     pass.

Everything here is analysis. No hardware exists. No part has been bought.
Inputs marked EST are placeholders for bench measurement.

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Own prior work (read this cycle):
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md       R01 — form, gestures,
    QI·46 loop, v.0→v.3 roadmap, Use Cases 01-06 (§07).
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R03.md   R03 — G6 as defined
    (NUDGE-only, §05), foot-plunger LEAP, signal contract v0.1.
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R05.md   R05 — cross-track
    model and its noise inputs (§03), static multizone look.
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R06.md   R06 — read in full.
    Long jump, friction cone, runway sensing, drop survival,
    cock-on-intent, contract v0.2, Use Case 06, R07 scope (§12).
  docs/corporate/cubiq/signal-contract-v0.2-vectors.json and
  scripts/cubiq-r06-contract-check.py — re-run: 30/30 PASS. Then read line
    by line against R06 §05 and §07, which is how F46 was found.

LOT® Institute corpus (re-read in the cited sections):
  docs/corporate/LOT-CUBIQ-VISION.md      §01: the multi-sensory cubic
                                           ("keyboard clicks, activation
                                           chimes"). The cube's sound is
                                           part of the LOT® sound world, so
                                           it must be designed, not just
                                           tolerated.
  docs/corporate/LOT-CUBIQ-OPERATOR.md    §01 PRESENCE ("Sound
                                           environment"); §02 the 5-11
                                           minute session as a structured
                                           encounter, not an interruption.
  docs/corporate/LOT_QI46_ENGINE.md       Month-12 cube sync: haptic
                                           preference (pressure, duration,
                                           cadence). No audio channel is
                                           named, and R07 keeps it that way
                                           (D34).
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md  the object should "feel the
                                           field it sits in". R07 reads that
                                           as feeling the room, too.

PROCESS NOTE — CONTINUITY, S-2 (fifth time)
  This run started on `claude/tender-turing-6od8bh`, cut from `master`,
  which still holds only R01. It scanned every `origin/claude/*` branch.
  The longest chain, R01→R06, is on `claude/tender-turing-t33oga`
  (2026-11-15). The R02→R06 files, their scripts, the v0.2 vectors and
  the matching ledger lines were checked out from there onto this branch.
  This branch now holds R01→R07 in order.
  Four later runs (2026-11-16 … 11-19: `an498u`, `u70cjv`, `uijgka`,
  `lxqak9`) also started from `master` and each wrote a fresh "R02". They
  are parallel restarts, not continuations, and are not merged here.
  Their use-case themes (paired cubes, the night face, nap time, the
  silent household) were checked so that Use Case 07 does not repeat them.
  D0 is still the fix: merge one CUBIQ branch to `master`.

  Use-case themes checked across ~100 CUBIQ documents on all branches:
  night, kitchen, shared rooms, cohorts, offices, hotels, music,
  recording, travel, Deaf households, workshops. PUBLIC quiet rooms, where
  the cube's sound reaches strangers and not only the operator, have not
  been covered. Use Case 07 is that case. It exercises this cycle's
  acoustic budget directly.

--------------------------------------------------------------------------------
01 // WHAT CHANGED IN R07
--------------------------------------------------------------------------------

  F41  Acoustic budget: landing-knock energy, foot-dome contact time,
       L200 at the neighbour's seat on damped / normal / resonant
       surfaces; venue check vs. ambient.                              §02
  F42  Cocking drive: self-locking worm + snail cam. The cam's drop edge
       is the latch, so the R03 pawl and trip coil are deleted.        §03
  F43  CORRECTION: floating plunger sleeve, needed for cock-on-intent
       (R06 D22).                                                      §04
  F44  v.2 cross-track re-run with sticking landings: slip is not the
       binding term. ToF σ is.                                         §05
  F45  ToF window for dust: flush window, coated; crosstalk self-check
       on every placement; recess only if B28 asks for it.             §07
  F46  CORRECTION: three contract v0.2 rules never reached the reference
       function. G6 is extended to ballistic gestures.                 §06
  F47  Contract v0.3: operator ceilings implemented, G10 hush,
       tof_window_dirty → G7. 44 vectors, 44/44 PASS.                  §06
  F48  G10 HUSH: operator-set quiet venue, set by a double tap on the top
       face. Only the operator clears it.                              §06
  F49  No microphone in v.0, by decision rather than by omission (D34). §02
  F50  Use Case 07 — THE READING ROOM.                                 §11

  Reproduce every number in this report with:
      python3 -I scripts/cubiq-r07-acoustic-cam.py
      python3 -I scripts/cubiq-r07-contract-check.py

--------------------------------------------------------------------------------
02 // F41 + F49 — ACOUSTIC BUDGET: THE LANDING KNOCK
--------------------------------------------------------------------------------

  MODEL
    · Impact energy = ½ M v_td², M = 113.3 g (R06 mass budget v0.4).
      Touchdown speed from the rise of each gesture at the 60° launch
      (R06 F32).
    · Foot dome sized so the 150 mm JUMP uses exactly its 2 mm of travel
      (R06 F34): k ≈ 36 kN/m over all feet. Contact half-period ≈ 5.6 ms,
      so the force spectrum rolls off above ~180 Hz. That is where the
      soft foot earns its credit: the energy moves below the band where
      the ear and A-weighting care most. The credit is taken as 8 dB EST
      (B24 measures 6-12 dB).
    · A fraction η of the impact energy is radiated as sound (hard
      contact, EST): damped desk 3×10⁻⁵, normal desk 1×10⁻⁴, resonant
      shelf or hollow-core panel 1×10⁻³.
    · Metric: L200, the radiated energy spread over the ear's ~200 ms
      integration window, hemispherical field, at 1.2 m (the next seat at
      a shared table). For clicks shorter than ~200 ms loudness follows
      energy, not peak power. That is why a long ring-down on a resonant
      shelf is as loud as it sounds.

    gesture           rise    v_td     E_imp    dome     L200 @ 1.2 m, soft foot
                                                travel   damped  normal  resonant
    HOP 10 mm rise    10 mm   0.44     11 mJ    0.8 mm   44.7    49.9    59.9 dB
    LEAP 40 mm @60°   17 mm   0.58     19 mJ    1.0 mm   47.0    52.3    62.3 dB
    JUMP 150 mm @60°  65 mm   1.13     72 mJ    2.0 mm   52.8    58.0    68.0 dB
    JUMP 200 mm @60°  87 mm   1.30     96 mJ    2.3 mm   54.0    59.3    69.3 dB

    The absolute numbers sit on the η anchors, which are EST. The relative
    numbers do not depend on them: knock energy scales with rise, so
    LEAP is +2.4 dB over HOP, JUMP 150 +8.1 dB, JUMP 200 +9.4 dB. Moving
    from damped to resonant is +15 dB, and from normal to resonant +10 dB.

  WHAT IT MEANS
    · THE SURFACE DOMINATES. A HOP on a resonant shelf is louder than a
      150 mm JUMP on a damped desk. The cheapest dB the cube can save is
      never landing on a resonant surface at all. R03's G6 only stopped
      the NUDGE on resonant surfaces (a hum through the panel). It let
      every ballistic gesture through. That was the wrong way round, and
      it is corrected in §06 (F46).
    · The JUMP 200 mm dome travel (2.3 mm) slightly exceeds the 2 mm dome.
      That's one more reason for R06's 200 mm cap rather than anything
      above it. At 200 mm the dome bottoms out, and the knock gets a hard
      tail that the model above doesn't include.

  VENUE CHECK — knock L200 at the neighbour minus room ambient
                                     HOP            LEAP           JUMP 150
    venue (ambient, distance)     damped normal  damped normal  damped normal
    library reading room 35 dB, 1.2 m  +9.7 +14.9  +12.0 +17.3   +17.8 +23.0
    home study at night  30 dB, 3.0 m  +6.7 +11.9   +9.1 +14.3   +14.8 +20.1
    open office          48 dB, 1.5 m  −5.3  −0.1   −2.9  +2.3    +2.8  +8.1
    kitchen              45 dB, 2.0 m  −4.8  +0.4   −2.4  +2.8    +3.3  +8.6

    Other sources (EST, at 1.2 m): cocking gearmotor ~20 dB for 1-5 s;
    NUDGE coil beat ~8 dB airborne. Both are below any ambient in the
    table. The NUDGE's structure-borne path, through the shared table, is
    a separate question (B25).

  RULES THAT FOLLOW
    · Office and kitchen: HOP and LEAP on a damped surface are masked or
      close to it. That matches the R01 vocabulary. No change.
    · Night at home: already covered. Quiet hours forbid ballistic
      gestures (R02 §06). The numbers confirm that rule rather than
      relax it: even a damped HOP is ~7 dB over a 30 dB bedroom at 3 m.
    · Quiet public rooms: no ballistic gesture is acceptable. The cube
      can't tell a library from an office by itself. It has no
      microphone, and it should not have one (below). So the OPERATOR
      tells it: G10 HUSH (§06, F48).
    · JUMP (v.1) is ~58 dB at the next seat even on a normal desk, and
      ~68 dB on a resonant one. R06 F34 said JUMP needs DAMPED. Contract v0.3 now enforces that for
      every ballistic gesture.

  F49 — NO MICROPHONE (D34)
    A microphone would let the cube measure ambient and decide by itself
    when it may knock. R07 rejects it:
      · The v0.1 contract rule is that the cube never sends audio and
        never sends raw sensor streams. A microphone that is never sent
        anywhere is still a microphone on a desk, in a bedroom, in a
        library. Operators should not have to trust firmware to know that.
      · The decision it would automate (is this room quiet?) is one the
        operator answers in a second, and answers better. They know
        whether they're in a library.
      · Surface class (the R03 resonance probe, IMU-driven) and HUSH
        (operator) cover the cases. Silence is easier to guarantee with a
        missing part than with a policy.

--------------------------------------------------------------------------------
03 // F42 — THE CAM IS THE LATCH (supersedes the R03 pawl)
--------------------------------------------------------------------------------

  R06 D22 asked for a REVERSIBLE cocking drive, so the spring can be
  decocked when an ARMED gesture is abandoned. R07 proposes:

    micro gearmotor → self-locking worm stage → SNAIL CAM → roller
    follower → plunger spring.

  A snail cam rises slowly over ~300° and then drops off a sharp edge.
  Turning it forward compresses the spring. Just before the edge there is
  a short constant-radius DWELL. Turning it past the edge FIRES. Turning
  it backward DECOCKS under control. So one rotating part does the work
  of the R03 ratchet, pawl and trip coil.

    case            E_spring  stroke  F_peak   cam torque  pressure  cam dia  cock   electrical
    v.0 LEAP         43 mJ     6 mm   14.3 N   16.4 mN·m   16.0°     20 mm    1.1 s   273 mJ
    v.1 JUMP 150    137 mJ    10 mm   27.4 N   52.3 mN·m   20.9°     30 mm    3.5 s   870 mJ
    v.1 JUMP 200    182 mJ    10 mm   36.4 N   69.5 mN·m   20.9°     30 mm    4.6 s  1156 mJ
    (worm η 0.35, motor η 0.45, 0.25 W input, all EST; base radius 4/5 mm)

  WHAT IT MEANS
    · Timing works. v.0 cocks in ~1 s, well inside R06's ARMED ≤ 10 s.
      v.1 at 200 mm takes ~4.6 s, which still fits. The faint whirr is
      ~20 dB at 1.2 m (§02), so cocking can happen in front of a
      neighbour.
    · Energy is negligible: 137 ppm of a 150 mAh cell per v.0 cocking,
      0.16 %/day at the R04 G4b cap of 12 LEAPs/day.
    · v.1's 30 mm cam doesn't fit a 45 mm cube corner. Use a 2:1 follower
      lever. Cam lift falls to 5 mm and diameter to 20 mm, at the same cam
      torque, and the follower pivot then carries ~73 N. That's a v.1
      layout item, not a v.0 one.
    · Pressure angles of 16-21° are under the usual 30° limit for a roller
      follower. No jamming risk at these base radii.

  WHY THIS CLOSES THE R06 DROP QUESTION
    R06 F36 found that a 0.3 g pawl at 500-1,500 g carries more inertial
    force than its 1-2 N trip force, so a drop could fire a cocked latch.
    Cock-on-intent reduced the exposure to ~0.01 % of the day, and B19
    was going to test the rest. With the cam as the latch:
      · ARMED is a stop ON THE DWELL, 20° before the drop edge. On a
        constant radius, the follower pushes straight through the cam
        axis. A 1 g follower at 1,500 g adds 14.7 N of load, all of it
        radial, and 0 mN·m of torque.
      · The cam must be balanced (CoM on its axis), so a linear shock puts
        no torque on it either. The worm is self-locking, so nothing on
        the output side can turn it.
      · Firing needs the motor to turn the cam 20°: ~56 ms at 60 rpm. A
        drop can't supply that rotation. G8's provisional fall detection
        at 60 ms (R06) then reverses the motor to decock.
    The ARMED-drop case of B19 changes from "record whether the pawl
    holds" to "confirm 0 fires in 20 armed drops", which is a pass/fail
    test (B26).

  WHAT IS DELETED
    The R03 coil-tripped pawl, its trip coil and its one-way ratchet. Net
    mass is in §09. One fewer actuator, one fewer failure mode, and one
    fewer part that clicks.

--------------------------------------------------------------------------------
04 // F43 — CORRECTION: COCK-ON-INTENT NEEDS A FLOATING SLEEVE
--------------------------------------------------------------------------------

  THE ERROR
    R06 D22 said "the spring rests UNCOCKED". In a push plunger, the tip
    pushes down on the table while the spring pushes the body up. So when
    the tip is flush with the feet, ready to push, the spring has to be
    compressed by the whole stroke. When the spring is relaxed, the tip
    sticks out of the foot by the whole stroke.
    Uncocked with a fixed sleeve, then:

      v.0 LEAP     tip out 6 mm    cube leans  8.5° on a 40 mm foot pitch
      v.1 JUMP     tip out 10 mm   cube leans 14.0°

    That fails G1's level check (> 3°) all the time, and it looks broken.
    R06 also doesn't say how the plunger, which ends each launch
    extended, gets back in after landing.

  THE FIX — FLOATING SLEEVE
    Put the spring and tip in a SLEEVE that can slide up into the body by
    one stroke. A second track on the same cam locks the sleeve DOWN, or
    leaves it free.
      1. REST: sleeve up (floating), spring relaxed, tip flush. Zero
         stored energy, and the cube sits flat on its four feet.
      2. ARM (sleeve still up): the cam compresses the spring by pulling
         the tip up into the sleeve. The tip lifts off the table, so the
         body is not pushed up.
      3. LOCK: the second cam track drives the sleeve down one stroke.
         The tip is flush again, now cocked. The cam is on the dwell.
      4. FIRE: cam past the drop edge. Launch.
      5. LAND: the cube comes down on its feet and the spent tip. The cam
         has already released the sleeve lock in flight. The cube's own
         weight pushes tip and sleeve up flush. Back to REST.
      DECOCK from ARMED: release the sleeve (tip lifts clear), then run
      the cam backward. Nothing touches the table.

    Sleeve retaining spring: > 0.04 N, so the sleeve stays extended in
    flight at 2 g, and < 0.56 N, so half the cube's weight (1.11 N) can
    reset it on landing. A wide window. ~0.15 N EST is the target.

  WHAT IT CHANGES
    · The FSM gains LOCK and RESET states, both on the cam shaft, so no
      new actuator. Mass +0.4 g EST (§09).
    · Landing first touches the spent tip, so the plunger tip material is
      also a landing pad, and its silicone (R06 B20, μ ≥ 0.58) also helps
      the landing stick.
    · B27 (new): 1,000 launch-and-land cycles. PASS: 1,000 resets to
      flush within 200 ms of touchdown, with level ≤ 1° afterwards.

--------------------------------------------------------------------------------
05 // F44 — v.2 CROSS-TRACK RE-RUN WITH STICKING LANDINGS
--------------------------------------------------------------------------------

  R06 F32 moved the launch to 60°, where landings stick on feet with
  μ ≥ 0.48 (R04 F19). R06 §09 expected that to cut the R05 cross-track
  slip term. Re-run of R05's 200 mm traverse (N = 20,000, yaw σ 3°, range
  σ 10 %, aim gain 0.8) with the slip term at 1.5 (R05), 0.5 (EST,
  sticking) and 0 mm:

    hop     lateral ToF σ   slip σ   p98 final   p98 worst   gate < 15 mm
    20 mm   5 mm            1.5      9.4 mm      12.4 mm     PASS
    20 mm   5 mm            0.5      8.9 mm      11.4 mm     PASS
    20 mm   5 mm            0.0      8.8 mm      11.4 mm     PASS
    20 mm   10 mm           0.5     13.8 mm      17.6 mm     FAIL
    40 mm   5 mm            1.5     11.0 mm      13.7 mm     PASS
    40 mm   5 mm            0.5     10.7 mm      13.1 mm     PASS
    40 mm   10 mm           0.5     17.5 mm      21.2 mm     FAIL
    40 mm   10 mm           0.0     17.4 mm      21.0 mm     FAIL

  WHAT IT MEANS
    · Sticking landings are worth ~0.6-1.0 mm at p98. That's real, but
      small. Even zero slip doesn't rescue σ_ToF = 10 mm.
    · R05's lateral ranging spec (σ ≤ 5 mm at 50-300 mm) remains the
      spec that decides v.2. The ToF band moving up to 22 mm (R06 D21) is
      good for that: the reference (a wall, the pad edge) is seen at a
      steeper angle than from the base band.
    · 40 mm hops now pass at 13.1 mm instead of R05's "thin" 13.9 mm.
      v.2 can keep 40 mm as its long stride.

--------------------------------------------------------------------------------
06 // F46 + F47 + F48 — SIGNAL CONTRACT v0.3
--------------------------------------------------------------------------------

  F46 — WHAT v0.2 SAID BUT DIDN'T DO
    Reading the R06 reference function against R06's own text:
      (a) Decision step 7 says "operator_ceilings may raise one rung"
          (D25). The function used the fixed R01 map, and no vector
          tested it.
      (b) R06 F34 says "JUMP needs surface_class = DAMPED". The function
          applied G6 to NUDGE only, so a JUMP onto a resonant shelf
          passed. So did every LEAP and HOP (§02 says those are the
          loudest cases of all).
      (c) Use Case 06 says dusty ToF windows → UNKNOWN → SETTLE only. The
          state model had no such flag.
    All 30 vectors passed because no vector exercised these paths. The
    lesson for the suite: every rule in the prose needs at least one
    vector, or it isn't part of the contract.

  F47 — v0.3 CHANGES (cube side; wire format unchanged except as noted)
    · config.operator_ceilings — implemented. The operator can raise a
      class ceiling by exactly one rung, never above leap. They can lower
      it to anything. Unknown gesture names are ignored. Lowering by the
      operator logs downgrade_reason "operator_ceiling" (new code).
    · config.hush: true | false — NEW, G10 (F48). Caps every signal at
      nudge. Reason "G10_hush".
    · device_event "tof_window_dirty" now drives state: treated as G7
      (unknown surface) → settle.
    · G6 extended: no hop / leap / jump on a resonant or unknown surface
      (cap at nudge). Then R03's rule takes NUDGE on that surface down to
      SETTLE. Net: on resonant/unknown, the cube only ever SETTLEs, and
      the logged reason says why.
    · device_event gains "hush_on" | "hush_off", so the app reflects a
      tap set on the cube.

  DECISION ORDER v0.3 (first rule that LOWERS records the reason)
     1. validate              → "rejected" + error code
     2. expired               → "expired", silent
     3. now < not_before      → "held"
     4. G8 fall               → "safe_hold"
     5. G9 machine vibration  → "deferred"
     6. device capability
     7. class ceiling, with operator_ceilings (+1 rung max, ≤ leap)
     8. ceiling_hint call_live → settle
     9. quiet hours           → nudge
    10. G10 hush              → nudge                              NEW
    11. G7 unplaced OR tof_window_dirty → settle                   EXTENDED
    12. G4b cadence           → ballistic down to nudge
    13. G1 edge / level       → one rung per failed check
    14. G6 surface            → ballistic on resonant/unknown → nudge;
                                 nudge on resonant/unknown → settle EXTENDED
    Still true: the ladder only goes down.

  TEST VECTORS
    docs/corporate/cubiq/signal-contract-v0.3-vectors.json — 44 vectors.
    01-30 are the v0.2 vectors, unchanged in signal and expectation. They
    all still pass, so v0.3 changes no v0.2 behaviour that was tested.
    31-44 are new:
      31-34, 43-44  operator ceilings: raise one rung; asked two, clamped;
                    lowered; can't unlock jump; unknown name ignored;
                    settle-class raised to nudge
      35-37         hush: caps leap; hush + resonant nudge → settle;
                    quiet hours is reported first when both apply
      38-40         G6 extended: leap on a resonant shelf → settle; hop on
                    unknown → settle; short runway reported before G6
      41            dirty ToF window → settle (G7)
      42            G9 vibration beats hush → deferred
    scripts/cubiq-r07-contract-check.py: 44/44 PASS. The v0.2 runner and
    file are kept as they were, and still give 30/30.

  F48 — G10 HUSH, AND HOW IT IS SET
    · On the cube: a firm DOUBLE TAP on the top face (IMU; taps 150-400 ms
      apart, EST). The cube answers with one SETTLE pulse, felt but not
      heard, and sends device_event "hush_on". Same gesture to clear.
    · In the app: one toggle, mirrored by config.hush.
    · Only the operator clears HUSH. Not QI·46, not a timer, not a change
      of place. Clearing HUSH makes the cube louder, and R06 F39 says only
      the operator does that. Placing the cube back on its home pad does
      NOT clear it. The app shows "Hush is on" in one plain line. Nothing
      blinks.
    · HUSH is not quiet hours. Quiet hours are a time window. HUSH is a
      place the operator is in, for as long as they say.

--------------------------------------------------------------------------------
07 // F45 — ToF WINDOWS AND DUST
--------------------------------------------------------------------------------

  Use Case 06 showed clay dust fouling the windows. R07 keeps the answer
  simple:
    · FLUSH windows, not recessed. A recess shields a window from smears
      but collects dust, and it has to be wider to avoid vignetting (45°
      FoV, 2 mm aperture: 2.0 mm flush, 2.8 mm at 1 mm recess, 3.7 mm at
      2 mm). A flush window wipes clean with a sleeve.
    · Hydrophobic/oleophobic hard coat on the window. Cover glass sits
      directly on the sensor's gasket, with no air gap to collect
      crosstalk (vendor guidance class, EST).
    · Crosstalk self-check at every placement (G7) and every hour on the
      pad. Over threshold → tof_window_dirty → SETTLE only (contract
      v0.3, vector 41). Back under threshold → clears by itself. Clearing
      a fault is not raising a ceiling.
    · B28 (new): calibrated dust film (fine clay, flour, sawdust) to
      crosstalk curve. Sets the threshold. If flush windows foul faster
      than one wipe per week of studio use, B28 reopens the recess
      option.

--------------------------------------------------------------------------------
08 // VALIDATION PLAN — DELTAS TO R06 §08
--------------------------------------------------------------------------------

  B3  REVISED  Snail-cam plunger, 30° axis: 32-43 mJ ±15 %, 200 cycles;
               200 decocks from the dwell without a fire.
  B19 REVISED  Armed-drop case now pass/fail: 20 drops ARMED on the dwell,
               1.0 m, PASS: 0 fires (was "record whether the pawl
               holds"). Rest of B19 unchanged.
  B23 REVISED  Contract conformance: 44 v0.3 vectors in CI, platform and
               firmware. PASS: 44/44.
  B24 NEW      Knock: L200 and A-weighted SEL at 0.3 / 1.2 / 3 m for HOP
               and LEAP on 6 surfaces (solid oak, MDF desk, laminate,
               glass, hollow-core door, bookshelf). Calibrates the η
               anchors and the soft-foot credit (8 dB EST). PASS: the
               resonance probe's RESONANT class captures every surface
               whose HOP L200 at 1.2 m exceeds 55 dB.
  B25 NEW      Shared table: NUDGE felt at the operator's wrist vs. at a
               neighbour seat 1.2 m along a library-class table. PASS:
               ≥ 90 % detection by the operator, ≤ 10 % by the neighbour
               (n = 20 people, blind).
  B26 NEW      Cam shock hold: 1,500 g half-sine on all 3 axes with the
               cam on the dwell. PASS: 0 rotation beyond 1°, 0 fires.
  B27 NEW      Floating sleeve reset: 1,000 launch-and-land cycles. PASS:
               reset to flush ≤ 200 ms after touchdown, level ≤ 1°.
  B28 NEW      ToF window fouling vs. crosstalk (§07).
  B29 NEW      HUSH tap: 200 deliberate double-taps (PASS ≥ 98 % detected)
               and 8 h of normal desk use: typing, mugs set down, a book
               dropped (PASS: 0 false toggles).
  Unchanged: B1, B1b, B2, B4-B18, B20-B22 and the R01 500/500 close gate.

--------------------------------------------------------------------------------
09 // MASS BUDGET v0.5
--------------------------------------------------------------------------------

    R06 total (mass budget v0.4)                       113.3 g
    − R03 pawl, trip coil, ratchet (F42)               − 0.4 g  EST
    + snail cam (two tracks), roller follower (F42)    + 0.3 g  EST
    + floating sleeve + retaining spring (F43)         + 0.4 g  EST
    ──────────────────────────────────────────────────────────
    R07 total                                          113.6 g   margin 6.4 g
    v.1 adds the 2:1 follower lever (+0.3 g EST), outside the v.0 budget.

--------------------------------------------------------------------------------
10 // ROADMAP CHECK — DOES R07 HELP OR HURT v.1-v.3?
--------------------------------------------------------------------------------

  v.1 LONG JUMP   Helped. The cam drive scales to 182 mJ in 4.6 s. Dome
                  travel supports the 200 mm cap. JUMP is now bounded
                  acoustically as well: ~58 dB at the next seat on a
                  normal desk, ~68 dB on a resonant one. With HUSH and quiet hours that makes
                  JUMP an "empty room, good desk" gesture, which suits the
                  open product question D27 (which class earns JUMP).
  v.2 SWINGS      Neutral to helped. Sticking landings take ~1 mm off. The
                  ToF σ spec still decides. The floating sleeve applies to
                  each swing-hop plunger too: one design for all.
  v.3 LEVITATION  Neutral. The worm stage is brass/polymer (non-ferrous,
                  EST). The motor magnet stays at the base corner, outside
                  the R05 keep-out, as R06 already required.

--------------------------------------------------------------------------------
11 // CONSUMER USE CASE 07 — THE READING ROOM
--------------------------------------------------------------------------------

(Also appended to LOT-CUBIQ-QUANTUM-CUBE-v0.md §07. Prior entries untouched.)

  Operator profile: R&D tier, a part-time doctoral student in history who
  works a day job and reads in a university library two evenings a week
  and on Saturdays. Long oak reading tables, eight seats each, about
  1.2 m apart. The room is ~35 dB: page turns, a cough, the HVAC. Their
  phone is the problem. It sits face-down on the table, silenced, and
  they still turn it over every twelve minutes "to check the time". They
  bought the cube to replace that gesture, not to add a new one.

  09:30, Saturday. They sit down, take the cube out of their coat pocket
  (no pad here; off-pad endurance is months, R04) and set it to the
  right of their notebook. The cube runs placement (G7): resonance probe
  (heavy oak: DAMPED), four-ToF edge map, level. Then the operator
  double-taps the top face. One soft SETTLE pulse under their fingertips
  means HUSH is on (G10). Nothing lights up. Nobody else at the table
  notices anything.

  10:47. A badge_rare unlock arrives, a 30-day Memory streak. At home
  this would be a LEAP, 40 mm toward the keyboard. Here the contract caps
  it at NUDGE (vector 35). The knock of that LEAP would have been ~12 dB
  over the room at the next seat (§02). The two-beat NUDGE signature
  (R05) comes through the oak to the operator's wrist, which rests 10 cm
  from the cube. Their neighbour, 1.2 m along the same table, reads on
  (B25 is the test of exactly that). The operator finishes the
  paragraph, then puts a palm over the cube: ack = "touch". The badge
  can wait for the evening session.

  11:15. A memory_ready signal. NUDGE again. This time they don't touch
  the cube. They're in the middle of a hard source, and that's an answer
  too. The signal waits within its TTL. No repeat, no escalation, no
  catch-up burst (R03 contract rule). The cube's only job was to put the
  question within reach without putting the phone within reach.

  12:30. Lunch. They put the cube in their pocket. Lift detected →
  unplaced (G7): nothing moves in a pocket, and the spring has been
  uncocked all morning, as it is whenever no gesture is in progress
  (R06 D22, F43). A coat pocket holds a zero-energy object.

  17:05, home. The cube goes back on its pad on the kitchen table. HUSH
  is still on. Coming home didn't clear it, because only the operator
  makes the cube louder (F48). The app shows one line: "Hush is on." They
  double-tap it off. Over the morning they turned the phone over twice,
  down from roughly twenty. They opened the Memory question in the
  evening session and answered it in the 5-11 minute cubic, where it
  belongs (LOT-CUBIQ-OPERATOR §02).

  What Use Case 07 proves that 01-06 did not:
    · The cube's sound can reach strangers, not only the operator and
      their household. In a public quiet room no ballistic gesture
      passes. The vocabulary collapses to NUDGE and SETTLE, and that is
      enough.
    · The decision "this room is quiet" belongs to the operator (HUSH),
      not to a microphone (D34). The cube already had the felt channel
      for this. What it lacked was a way to be told.
    · The cube's real competitor in the reading room is the habit of
      turning the phone over, not the phone's sound. A felt, private
      signal at the wrist replaces the urge to check, because the operator
      knows the cube will tell them.
    · Surface class carries the acoustic load. On heavy oak the NUDGE
      stays private. On a hollow-core carrel desk the same signal would
      fall to SETTLE (G6), and the operator would get less, but the room
      would get nothing.

  Consumer market: students, researchers, writers, translators and
  lawyers who work in libraries, archives, reading rooms and quiet
  co-working floors. People who already chose the quietest place they
  know and still carry the loudest object they own into it.

--------------------------------------------------------------------------------
12 // DECISIONS FOR S-2
--------------------------------------------------------------------------------

  D0  PROCESS: merge one CUBIQ branch (this one: R01 → R07) to master, or
      point the routine at a single long-lived branch. (Fifth time
      asked. Four runs since R06 restarted at R02 from master.)
  D29 Extend G6: no ballistic gesture on a resonant or unknown surface
      (F41, F46). Supersedes R03 G6's NUDGE-only scope.
  D30 Cam-as-latch: self-locking worm + balanced two-track snail cam;
      ARMED on the dwell 20° before the drop. Deletes the R03 pawl, trip
      coil and ratchet (F42). Implements R06 D22.
  D31 Floating plunger sleeve with a 0.15 N EST retaining spring; FSM
      gains LOCK and RESET (F43). Corrects R06 D22.
  D32 G10 HUSH, set and cleared by the operator only (top-face double tap
      or app); not cleared by place or time (F48).
  D33 Adopt signal contract v0.3 and its 44 vectors as the conformance
      suite (F47, B23). New rule for the suite: every rule in the prose
      gets at least one vector.
  D34 No microphone in v.0, as a design decision (F49).
  D35 v.2 lateral ranging σ ≤ 5 mm (R05) stays binding; sticking landings
      don't relax it (F44).
  Open and compatible from earlier cycles: R05 D14, D16-D19; R06 D20,
  D21, D23-D28. R06 D22 stands as amended by D30 and D31.

--------------------------------------------------------------------------------
13 // NEXT CYCLE (R08) PROPOSED SCOPE
--------------------------------------------------------------------------------

  · Bench-ready drawings: section view v0.2 with the snail cam, worm,
    floating sleeve and 22 mm ToF flex tabs placed (R05 §05 layout
    updated). First check that all of it fits the 45 mm envelope.
  · Firmware FSM v0.3 written as a state table (REST → ARM → LOCK → ARMED
    → FIRE → FLIGHT → LAND → RESET, plus DECOCK and SAFE-HOLD), with
    timing budgets and a simulator run against the 44 contract vectors.
  · Qi pad as a "known surface": can the home pad carry a factory
    surface class and edge map so placement on it is instant?
  · First-article bench plan: which of B1-B29 can run on a 3D-printed
    mule before any custom part exists.
  · Use Case 08, chosen from themes not yet used across all branches.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-R07
================================================================================
