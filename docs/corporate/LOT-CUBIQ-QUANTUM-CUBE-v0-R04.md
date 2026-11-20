================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-R04
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report R04
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-13
VERSION:  0.4 — POWER PATH · COIL THERMAL · OFF-PAD BUDGET · v.2 SWING PRE-STUDY
STATUS:   v.0 — PRE-HARDWARE · DESIGN LOCK STILL PENDING (see §10)
PREDECESSORS: LOT-CUBIQ-QUANTUM-CUBE-v0.md     (R01, 2026-07-28)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R02.md (R02, 2026-11-10)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R03.md (R03, 2026-11-11)
================================================================================

R04 is the fourth development cycle of the v.0 actuated haptic notification
device. It does the R03 §11 scope. Three things come out of it:

  1. The power path. A 300 mAh cell can't push the HOP pulse on its own.
     v.0 needs a pulse-storage capacitor, and the coil's motor constant (km)
     is now the most important number nobody has measured yet.
  2. Heat is not a problem. The R03 rate caps stay, but as product rules
     (anti-feed), not as thermal limits.
  3. The first v.2 numbers. A directed 200 mm swing-hop traverse meets the
     R01 v.2 gate (<15 mm cross-track) only with heading-hold between hops
     and a steep launch. Thrust-line alignment tolerance, about 0.3 mm, is
     the hardest manufacturing number found so far.

Everything here is analysis. No hardware exists. No part has been bought.
Inputs marked EST are placeholders for bench measurement.

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Own prior work (read in full this cycle):
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md       R01 — form, gestures,
    QI·46 loop, v.0→v.3 roadmap, Use Cases 01-03 (§07).
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R02.md   R02 — ballistics, hybrid
    drive, edge degradation ladder, quiet hours, bench plan B1-B8.
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R03.md   R03 — reaction-mass
    correction, foot-plunger LEAP, mass budget 115 g, firmware FSM, signal
    contract, surface resonance probe, Use Case 03.
  scripts/cubiq-ballistics.py, scripts/cubiq-r03-budget.py — re-run; R02
    and R03 tables reproduce.

LOT® Institute corpus (re-read in the cited sections):
  docs/corporate/LOT-CUBIQ-VISION.md      §01 anti-feed; §05 physical step
  docs/corporate/LOT-CUBIQ-OPERATOR.md    §01 PRESENCE (weather, location,
                                           circadian context per session);
                                           §03 Index of Systems; §07 Phase 4
  docs/corporate/LOT_QI46_ENGINE.md       piezo / nano-ceramic / haptic
                                           corpus; Month-12 cube sync
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md  "Quantum Cube Hardware —
                                           PLANNED"; "feel the field it sits in"

PROCESS NOTE — CONTINUITY, S-2
  R03 flagged that every run of this routine starts from `master`, where
  only R01 exists, so the work had restarted ~100 times on separate
  `claude/tender-turing-*` branches. That has happened again: the
  2026-11-12 run (branch -e79uzs) wrote yet another R02 ("The Kitchen
  Table Hour") without seeing R03.
  This cycle carries the chain forward by hand. It cherry-picks R02 + R03
  (branch -dwbh6b, commits 4a1e8e1, 409f983) onto this branch and builds
  R04 on top. This branch, claude/tender-turing-o9fkgo, now holds the whole
  R01→R04 series. Merge it to `master` and the next run starts from R04.
  If it isn't merged, the next run should do what this one did: look for
  the highest R-number across `origin/claude/tender-turing-*` before it
  writes anything.
  Use-case themes were checked against all ~96 branches. Travel shows up
  once, as a one-line candidate, and was never written up, so Use Case 04
  below is new.

--------------------------------------------------------------------------------
01 // WHAT CHANGED IN R04
--------------------------------------------------------------------------------

  F14  HOP pulse power is 5-40 W for ~12 ms, depending on coil km. The
       cell can't supply it directly.                                  §02
  F15  Pulse-storage capacitor added to the BOM (+3 g). Margin is now 2 g. §02
  F16  Coil heating per HOP is 0.04-0.3 K. The G4 thermal cap is not
       binding, so the rate limits become product rules.               §03
  F17  Off-pad endurance is ~5 months at a reference day. Travel is a
       real mode, not an edge case.                                    §04
  F18  v.2 yaw sensitivity: ~5-14° of yaw per 1 mm of thrust-line offset.
       Alignment tolerance ≤0.3 mm, or steer with it on purpose.       §05
  F19  Landing slip: a 45° launch slides on most surfaces; ≥60° sticks
       when μ ≥ 0.48. v.2 swing-hops launch steep.                     §05
  F20  200 mm traverse Monte Carlo: open-loop fails (37-49 mm, 98th
       percentile); heading-hold passes narrowly (13.4 mm).            §05
  F21  BOM class shortlist v0.2 with target specs per class.           §06
  F22  Use Case 04 — THE HOTEL DESK.                                   §09

  Reproduce every number in this report with:
      python3 -I scripts/cubiq-r04-power-swing.py

--------------------------------------------------------------------------------
02 // F14 + F15 — THE POWER PATH
--------------------------------------------------------------------------------

  THE PULSE
    R03 fixed the HOP at a 40 g moving mass, 8 mm stroke, 4.4 N mean
    force. That mass accelerates at 110 m/s² and covers the stroke in
    12.1 ms. Mechanical work: 35 mJ.
    In a voice coil, copper loss is P = (F / km)², where km is the motor
    constant in N/√W. km depends on how much magnet and copper fit in the
    14 g stator budget, and nobody has measured it yet.

    km (N/√W)   copper loss   pulse energy   efficiency   current from cell
      0.7         39.5 W         512 mJ          7 %          10.7 A
      1.0         19.4 W         269 mJ         13 %           5.2 A
      1.5          8.6 W         139 mJ         25 %           2.3 A
      2.0          4.8 W          94 mJ         38 %           1.3 A

    A 300 mAh LiPo is good for about 1.5 A in bursts (5C). Unless km ends
    up ≥2.0, the cell can't drive the coil directly. Even at km = 2.0 it
    would run at its limit on every HOP.

  THE FIX — PULSE-STORAGE CAPACITOR (F15)
    Charge a capacitor slowly from the cell and dump it into the H-bridge
    during the stroke. Sizing for the worst case (km 0.7, +25 % driver
    loss, 640 mJ):
      supercapacitor, 5.0 V → 3.0 V swing      ≥ 80 mF
      electrolytic bank, 16 V → 10 V swing     ≥ 8.2 mF
    The supercapacitor wins on volume. It must be a LOW-ESR type. Coin-cell
    supercaps have tens of ohms of ESR and would turn the pulse into heat.
    ESR target: ≤ 0.1 Ω at the pulse current.
    Recharge at 0.5-1.0 W from the cell takes 0.6-1.3 s. That sets a hard
    floor of ~1.3 s between HOPs, well under any rate the product allows.
    Mass: +3 g EST. Budget 115 → 118 g, margin 2 g.

  WHAT THIS DOES TO R03 DECISIONS
    · km becomes the gating spec for the coil. Target: km ≥ 1.5 N/√W. Below
      1.0 the capacitor grows, the battery drains faster, and efficiency
      falls to single digits. B1 now has to measure km, not just force.
    · Battery-as-reaction-mass (R03 §02) is still worth testing, and it
      matters more now: +7 g of margin is the only big lever left.
    · NUDGE and SETTLE run at low current straight from the cell. Only HOP
      and the LEAP latch trip use the capacitor.

--------------------------------------------------------------------------------
03 // F16 — COIL THERMAL: NOT THE LIMIT
--------------------------------------------------------------------------------

  Model: 4 g copper winding (1.5 J/K), 30 K/W to ambient through frame and
  shell (EST), time constant ~46 s.

    km     ΔT per HOP    10 HOPs inside 10 s (worst-case burst)
    0.7      0.31 K          ≤ 3.1 K
    1.0      0.15 K          ≤ 1.5 K
    1.5      0.07 K          ≤ 0.7 K
    2.0      0.04 K          ≤ 0.4 K

  The R03 G4 shell limit (41 °C) is nowhere near. Heat is not what limits
  how often the cube can move.

  DECISION: KEEP THE CAPS, CHANGE THE REASON
    R03 G4 capped LEAP at ≤1 per 5 s and ≤12 per hour. Those caps stay, now
    as product rules in the firmware policy table, not as thermal
    protection. A cube that can hop ten times in ten seconds and chooses
    not to is the anti-feed thesis (LOT-CUBIQ-VISION §01) running in
    firmware. G4 is split in two:
      G4a THERMAL    shell < 41 °C, coil model < 90 °C   (safety; never
                     expected to trip in v.0)
      G4b CADENCE    ≤1 ballistic gesture / 5 s, ≤12 LEAP / h, ≤1 gesture
                     per signal class per TTL   (product; QI·46 may lower
                     these per operator, never raise them)

--------------------------------------------------------------------------------
04 // F17 — OFF-PAD ENERGY BUDGET
--------------------------------------------------------------------------------

  Usable energy: 300 mAh × 3.7 V × 80 % = 3,197 J.
  Idle draw: MCU + BLE advertising + IMU wake-on-motion ≈ 40 µA EST →
  12.8 J/day. Idle draw dominates, not motion.

  REFERENCE DAY (EST)
    12 NUDGE × 0.05 J · 4 HOP × 0.64 J · 1 LEAP (latch re-cock) × 3 J ·
    4 SETTLE × 0.4 J · 24 resonance probes × 0.02 J  →  8.2 J/day active

    Reference day, off the pad          ≈ 152 days
    Travel mode (NUDGE/SETTLE only)     ≈ 231 days

  What follows: the cube doesn't need its pad to be useful. Off the pad it
  can run for months. The pad was a charger and a known-flat surface. It
  remains the known surface, but not the leash. That opens the travel
  case (§09). It also puts a new requirement on R03's firmware: off the
  pad, the cube must classify the surface itself (G1 edge ladder + G6
  resonance) with no help from the pad.

  NEW GUARD G7 — UNKNOWN SURFACE
    Off pad and on a surface not seen in the last 24 h → ballistic gestures
    are inhibited until a placement routine completes:
      1. resonance probe (R03 §06),
      2. a slow 360° yaw "look" using the piezo trim at sub-felt amplitude,
         with the forward ToF sampling edge distance every 30° (v.0 has
         forward + rear ToF; R04 recommends adding left/right in v.0
         rather than v.2 — +0.5 g, see §06),
      3. tilt/level check (< 3° for LEAP).
    Until then: NUDGE (if DAMPED) and SETTLE only. Fail quiet.

--------------------------------------------------------------------------------
05 // F18-F20 — v.2 PRE-STUDY: THE SWING-HOP
--------------------------------------------------------------------------------

  v.2 per R01 §06: a directed traverse of 200 mm on three surface types,
  < 15 mm cross-track error, 50/50 trials, zero edge incidents. R03 §08 set
  the hardware: two angled foot plungers plus front/rear ToF.

  F18 — YAW SENSITIVITY (THE HARDEST TOLERANCE IN THE PROGRAM)
    A 45 mm cube has a tiny moment of inertia about its vertical axis
    (I = M·a²/6 = 4.05×10⁻⁵ kg·m²). If the plunger's thrust line misses the
    centre of mass by e mm, the cube spins in flight.

      hop      launch   impulse    flight   yaw per 1 mm of offset
      20 mm     45°     53 mN·s    64 ms         4.8°
      20 mm     60°     57 mN·s    84 ms         6.8°
      40 mm     60°     81 mN·s   119 ms        13.6°

    The same sensitivity applies in pitch and roll (a cube's inertia is the
    same about every axis). Two ways to handle it:
      (a) Tolerance: hold thrust-line-to-CoM ≤ 0.3 mm (≤ 2-4° per hop),
          including CoM shift from battery placement and the moving
          reaction mass position at the moment of release.
      (b) Use it on purpose. Firing the two plungers a few hundred
          microseconds apart puts the combined thrust line off centre by a
          controlled amount. That is the v.2 STEERING mechanism. No third
          actuator is needed.
    R04 recommends both: tolerance (a) for repeatability, and timing (b) as
    the steering input. The v.0 frame should already locate the plunger
    bosses to ±0.1 mm against the stator datum.

  F19 — DOES THE LANDING STICK?
    The cube lands with its launch speed split into vertical and horizontal
    parts. The elastomer feet's friction during impact can cancel the
    horizontal part only if μ(1 + e) ≥ cot(launch angle), with e ≈ 0.2 EST.

      launch 45° → sticks only if μ ≥ 0.83   (rare; it slides)
      launch 60° → sticks if μ ≥ 0.48        (most dry wood / laminate)
      launch 70° → sticks if μ ≥ 0.30        (nearly everything)

    A 45° swing-hop on a μ = 0.4 surface slides a further 3.4 mm per hop.
    That slide depends on the surface and varies hop to hop. It is the
    main source of cross-track error (F20).
    Cost of launching steep: at 60°, the energy for the same range is
    +15 % over 45°. Affordable.
    DECISION (proposed): v.2 swing-hops launch at 60-70°, and the
    plungers are angled for it. The LEAP stays at 45° (R03): it's a
    single gesture where a few mm of slide doesn't matter.

  F20 — 200 mm TRAVERSE, CROSS-TRACK ERROR (MONTE CARLO, 20,000 RUNS)
    Per-hop noise (EST): yaw σ 3°, range σ 10 %, landing slip σ 1.5 mm.

      hop size   strategy        98th-percentile cross-track   v.2 gate
      20 mm      open-loop               48.5 mm                FAIL
      20 mm      heading-hold            13.4 mm                PASS (thin)
      40 mm      open-loop               37.1 mm                FAIL
      40 mm      heading-hold            13.5 mm                PASS (thin)

    Heading-hold: between hops the cube is still, so the gyro bias can be
    re-zeroed (zero-rate update). The IMU heading is then good enough to
    re-aim with a small yaw step before every hop. Heading errors stop
    adding up, but lateral slip still does, and the IMU can't see it.
    The pass is thin, and slip makes up most of what remains. Steep
    launches (F19) cut slip. Lateral ToF ranging to a reference (the pad
    edge, a book, a keyboard) can correct position, not just heading. That
    is the v.2 R&D item to pursue next.

--------------------------------------------------------------------------------
06 // F21 — BOM CLASS SHORTLIST v0.2 (TARGET SPECS, NOT PART NUMBERS)
--------------------------------------------------------------------------------

  No vendor or part number is named. Every line is a class with the spec
  a candidate must meet at incoming test.

  CLASS                 TARGET SPEC                                   MASS
  Voice-coil actuator   moving-mass, 8 mm stroke, km ≥ 1.5 N/√W,     14 g
                        ≥ 4.4 N mean over stroke, 40 g moving
  H-bridge driver       ≥ 6 A peak, current sense, PWM ≥ 20 kHz       (PCB)
                        (above hearing, so NUDGE stays felt not heard)
  Pulse storage         low-ESR supercap ≥ 80 mF @ 5 V, ESR ≤ 0.1 Ω    3 g
  Cell                  LiPo 300 mAh, ≥ 2C continuous, flex rated     7 g
                        for motion if battery-as-mass is adopted
  Charger / Qi RX       Qi-class receiver, ≤ 5 W, foreign-object       4 g
                        detection; NO ferrous parts outside the
                        v.3 keep-out (R02/R03)
  IMU                   6-axis, gyro noise ≤ 0.01 °/s/√Hz, wake-on-   ≤1 g
                        motion interrupt at ≤ 10 µA
  ToF ×4 (was ×2)       ≥ 300 mm range on matte wood and glass edge,   +0.5 g
                        ≤ 30 ms per sample; F/R/L/Rt
  MCU + BLE             low-power BLE SoC, ≤ 2 µA sleep, local FSM     (PCB)
  Piezo trim            bimorph, ±5° launch trim, sub-felt yaw "look"  2 g
  Latch / plunger       spring 1.6-2.2 N/mm, 6 mm, coil-tripped pawl,  9 g
                        ≥ 50,000 cycles

  MASS BUDGET DELTA vs. R03
    + 3.0 g  pulse supercap
    + 0.5 g  two extra ToF sensors (L/R)
    ───────
    118.5 g  total   margin 1.5 g vs. 120 g
    Levers still available: battery-as-reaction-mass (−7 g), coated-core
    shell (−7 g). R04 recommends deciding battery-as-mass at B1b. Below
    2 g of margin, every later change has to be paid for somewhere else.

--------------------------------------------------------------------------------
07 // VALIDATION PLAN — DELTAS TO R03 §07
--------------------------------------------------------------------------------

  B1  REVISED  Measure km (N/√W) as well as force. PASS: km ≥ 1.5 and
               ≥ 4.4 N mean over 8 mm with 40 g moving.
  B11 NEW      Pulse path: 1,000 HOPs from the supercap at 20 °C and
               0 °C. PASS: rail never < 3.0 V; cap ESR drift < 20 %.
  B12 NEW      Off-pad idle: 7 days on a bench, advertising, with hourly
               probes. PASS: mean draw ≤ 40 µA (→ ≥ 150 days ref. day).
  B13 NEW      Placement routine (G7) on 6 unseen surfaces, including
               one glass edge and one cloth-covered table. PASS: no
               ballistic gesture before routine completes; edge map
               within ±10 mm of tape-measure truth.
  B14 NEW (v.2 pre-study, rig only)  Single plunger on a CoM-adjustable
               dummy cube. Measure yaw per mm of offset. PASS: within
               ±25 % of F18, which validates the model for steering.
  Unchanged: B2-B10 and the R01 500/500 close gate.

--------------------------------------------------------------------------------
08 // ROADMAP CHECK
--------------------------------------------------------------------------------

  v.1 LONG JUMP   Pulse path unaffected (LEAP/JUMP use the spring; the
                  coil only trips the latch). Larger spring re-cock energy
                  is the battery cost, still under 1 % of the cell per JUMP.
  v.2 SWINGS      Now has numbers: steep launch, heading-hold, timing-based
                  steering, four ToF. The gate is reachable on paper with
                  thin margin; lateral position sensing is the open item.
  v.3 LEVITATION  Unchanged. Note: the supercap and Qi coil both sit near
                  the base. They are non-ferrous, but the v.3 designer
                  should treat the Qi ferrite as the one magnetic part in
                  the keep-out zone and plan to move or remove it.

--------------------------------------------------------------------------------
09 // CONSUMER USE CASE 04 — THE HOTEL DESK
--------------------------------------------------------------------------------

(Also appended to LOT-CUBIQ-QUANTUM-CUBE-v0.md §07. Prior entries untouched.)

  Operator profile: Usership tier, consultant, ~10 nights a month on the
  road, three time zones in a typical fortnight. At home the cube lives on
  its pad on the study desk. The operator's phone is the hardest habit to
  break in hotel rooms. Late at night, alone, the scroll is at its worst,
  and LOT-CUBIQ-OPERATOR §01 PRESENCE already reads location and weather
  per session.

  Packing: the cube goes in a jacket pocket. No pad, no cable. F17 says
  the cell lasts months, so the trip doesn't depend on hotel outlets.
  On lift-off from the home pad, the cube marks itself OFF-PAD and drops to
  travel mode (NUDGE/SETTLE only) until it's placed and still.

  21:10 local, a hotel room 6 hours east of home. The operator sets the cube
  on the desk next to the TV remote. G7 (§04) fires: unknown surface.
    · Resonance probe: the desk is veneered particleboard, DAMPED.
    · Yaw "look" with four ToF: front edge 180 mm, left edge 90 mm, right
      side blocked by the remote at 60 mm, rear wall 40 mm.
    · Level: 1.5°.
  Verdict: NUDGE, SETTLE, and HOP are allowed (HOP needs 40 mm free). LEAP
  is inhibited, because no 45° direction has enough runway. Nothing
  visible happened during placement. The operator sees a cube sitting
  still.

  Time zone: the platform holds the operator's sleep window in local time,
  derived from the phone's time zone, not the cube's. The cube never
  reasons about time zones; it just obeys not_before / ttl in UTC (R03 §05).
  Quiet hours shift with the operator: tonight they begin at 23:00 hotel
  time, not 23:00 home time.

  22:40 — the operator is on the bed, phone in hand, about to open a feed.
  The Memory Engine has a question ready. Its delivery hint is "evening,
  not in bed", learned over prior trips from ack latencies. The platform
  sends intent = nudge, priority 1. The cube performs THE NUDGE through the
  desk. It's 1.5 m from the bed and nobody hears it, but the operator sees
  the cube give a faint shudder in the lamp light, the only thing in the
  room that moved on its own. They put the phone face down, walk to the
  desk, and pick up the cube (ack = "touch", latency 47 s). The question
  opens on the laptop: a 5-minute cubic instead of 50 minutes of scroll.

  23:00 — quiet hours. 06:30 local — THE SETTLE as the wake cue. No alarm
  tone through a thin hotel wall.

  Check-out: the cube goes back in the pocket. On the next desk it starts
  over: new surface, new map, same rules. Back home, it lands on its pad,
  recognises a known surface (seen < 24 h ago is not required for the
  pad; the pad identifies itself over Qi), and full gestures return
  without a placement routine.

  What Use Case 04 proves that 01-03 did not: the cube's value isn't tied
  to one desk. Every earlier case had a known home surface. This one has a
  new surface every night, and the cube treats each with the same caution:
  it measures before it moves, and it does nothing until it's sure. It is
  also the first case where the cube's competitor is the phone in the
  same room, at the hour that phone does the most damage. The consumer
  market here is the frequent traveller, the person LOT®'s 5-11 minute
  cubic serves best and the hotel room serves worst.

  Forward note for v.2: on a hotel desk too cramped for a LEAP, a slow
  two-hop swing toward the edge nearest the bed (ToF sees the open side)
  would greet the operator without any ballistic risk. Recorded as a v.2
  gesture candidate: THE TURN-DOWN.

--------------------------------------------------------------------------------
10 // DECISIONS FOR S-2
--------------------------------------------------------------------------------

  D0  PROCESS — merge this branch (R02 + R03 + R04) to master, or point the
      routine at one long-lived CUBIQ branch. (Repeated from R03; it
      happened again on 2026-11-12.)
  D9  Approve km ≥ 1.5 N/√W as the gating coil spec and the low-ESR pulse
      supercap as a v.0 BOM line.
  D10 Approve the G4 split: G4a thermal (safety) / G4b cadence (product,
      QI·46 may only tighten).
  D11 Approve guard G7 (unknown surface → placement routine) and travel
      mode as a first-class v.0 behavior.
  D12 Approve 4× ToF in v.0 (+0.5 g) instead of deferring L/R to v.2.
  D13 Approve, for v.2 planning: steep (60-70°) swing-hop launch, heading-
      hold, and plunger timing as the steering input.
  R02 D2-D5 and R03 D1', D6-D8 remain open and are compatible with all of
  the above.

--------------------------------------------------------------------------------
11 // NEXT CYCLE (R05) PROPOSED SCOPE
--------------------------------------------------------------------------------

  · Lateral position estimate for v.2: ToF-to-reference ranging + IMU,
    and a re-run of the F20 Monte Carlo with position correction.
  · Placement routine (G7) timing and energy: how long the yaw "look"
    takes with piezo trim alone; whether it is felt or heard.
  · First mechanical layout sketch (ASCII section view): stator datum,
    plunger bosses, supercap, cell, v.3 keep-out, Qi ferrite.
  · Use Case 05 — chosen from themes not yet used across all branches.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-R04
================================================================================
