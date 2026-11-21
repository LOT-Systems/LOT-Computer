================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-R08
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report R08
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-21
VERSION:  0.8 — LAYOUT FIT · FSM v0.3 · HOME PAD · CONTRACT v0.4 · FIRST ARTICLE
STATUS:   v.0 — PRE-HARDWARE · FIRST SPEND REQUESTED (see §12, D41)
PREDECESSORS: LOT-CUBIQ-QUANTUM-CUBE-v0.md     (R01, 2026-07-28)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R02.md (R02, 2026-11-10)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R03.md (R03, 2026-11-11)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R04.md (R04, 2026-11-13)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R05.md (R05, 2026-11-14)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R06.md (R06, 2026-11-15)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R07.md (R07, 2026-11-20)
================================================================================

R08 is the eighth development cycle of the v.0 actuated haptic notification
device. It covers the scope R07 §13 set: a layout that fits, the firmware
state table, the Qi pad as a known surface, and a first-article bench plan.
Seven results. One corrects R07, one corrects a stale R05 number, and one
asks for the first money:

  1. CORRECTION to R07 F43: the floating sleeve does not fit. It adds
     6.0 mm along the 30° thrust line. Under a stator centred at mid-height
     (R05 §05) the plunger has 13.3 mm of axial room and now needs 16.6 mm.
     It clashes by 3.3 mm. Fix: raise the stator 2.9 mm (top still 6.6 mm
     under the ceiling) and move the snail cam into a SIDE POCKET, parallel
     to the launch plane, acting on the plunger through a yoke. The cam
     can't go on the axis at all.
  2. The Qi receive coil has to move. A centred coil sits where the
     tilted plunger crosses the floor. A 24 mm coil offset 8.5 mm forward
     clears it by 1.8 mm. A useful side effect: the cube now charges only
     when it faces the right way on its pad.
  3. Layout v0.2 passes a box-level interference check: 23 boxes, no
     clash, nothing outside the 45 mm envelope. This is the first time
     every v.0 part has been placed at once.
  4. FSM v0.3 is written as a state table and simulated. All 54 contract
     vectors produce legal traces, and 9 of 9 injected faults end safe. A
     LEAP starts 1.26 s after its signal. The spring holds full energy for
     0.22 s per LEAP, not the 10 s R06 assumed. Gestures downgraded after
     arming were 3.5 s late; overlapping the precharge with the decock
     brings that down to 2.5 s.
  5. The home pad can certify the SURFACE, never the AIRSPACE. A ~600 g
     pad on 20 Hz isolators cuts the landing knock reaching the furniture
     by 25-32 dB. That removes the resonant-shelf penalty (R07: +10-15 dB).
     The cost is launch energy. A sprung pad recoils and takes 14 % of the
     LEAP, so the LEAP is ~34 mm on the pad, still inside B4's 40 ±10 mm.
  6. Contract v0.4 adds the pad credit. 54 vectors, 54/54 pass. The 44
     v0.3 vectors are unchanged and still pass.
  7. 26 of the 30 bench tests can run on 3D-printed mules and catalogue
     parts, before any custom part exists. R08 asks S-2 to approve the first
     spend (D41).

Everything here is analysis. No hardware exists. No part has been bought.
Inputs marked EST are placeholders for bench measurement.

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Own prior work (read this cycle):
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R07.md   read in full: acoustic
    budget, cam-as-latch, floating sleeve, contract v0.3, R08 scope (§13).
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R06.md   D20-D28; mass budget
    v0.4; G8 timing; ToF band at 20-24 mm (D21).
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R05.md   §03 placement look and
    G7 v0.2 (~1 s); §05 section view v0.1 and L1-L6; §06 mass budget.
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R04.md   §02 power path
    (supercap precharge 0.6-1.3 s).
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R03.md   §04 FSM v0.1, §06
    resonance probe.
  Every B-item from R02 to R07 was collected into one list (§07).
  scripts/cubiq-r07-contract-check.py re-run: 44/44 PASS. R08 imports its
    decide() unchanged and wraps it (§06), so v0.3 behaviour can't drift.

LOT® Institute corpus (re-read in the cited sections):
  docs/corporate/LOT-CUBIQ-VISION.md      §05 "Physical products: the
                                           inevitable step". The pad is the
                                           second physical LOT® object, and
                                           the first that never moves.
  docs/corporate/LOT-CUBIQ-OPERATOR.md    §04 AI-driven physical delivery:
                                           the AI decides what and when; the
                                           object decides whether it is
                                           safe. The pad credit keeps that
                                           split (§04).
  docs/corporate/LOT_QI46_ENGINE.md       Month-12 cube sync: "haptic
                                           preference". Pad placement adds
                                           no new field to the uplink.
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md  "feel the field it sits
                                           in". On its own pad the cube
                                           already knows the field, and the
                                           pad shields the room from it.
  R01 §02: "The charging pad IS the table." R08 takes that literally. The
  pad becomes a landing deck, and it is the obvious base for the v.3
  levitation array.

PROCESS NOTE — CONTINUITY, S-2 (sixth time)
  This run started on `claude/tender-turing-h7z091`, cut from `master`,
  which still holds only R01. It scanned every `origin/claude/*` branch.
  The longest chain, R01→R07, is on `claude/tender-turing-6od8bh`
  (2026-11-20) and was fast-forwarded onto this branch. This branch now
  holds R01→R08 in order. D0 is still the fix.
  Use-case themes checked across every CUBIQ document on all branches,
  ~120 entries: night and bedside, kitchen, shared rooms and desks,
  cohorts, offices, hotels, music, recording, travel, Deaf households,
  low vision, workshops, reading rooms, breath pacing, air/windows, naps.
  CLASSROOMS, and children as an audience who can SEE and TOUCH the cube,
  have not been covered. Use Case 08 is that case. It uses this cycle's
  pad, FSM and drop results.

--------------------------------------------------------------------------------
01 // WHAT CHANGED IN R08
--------------------------------------------------------------------------------

  F51  CORRECTION: the floating sleeve clashes with the stator by 3.3 mm on
       the thrust line. Stator raised 2.9 mm; CoM +1.35 mm.             §02
  F52  Snail cam moved into a side pocket parallel to the launch plane;
       yoke drive. A coaxial cam is impossible.                         §02
  F53  Qi RX coil: 24 mm, offset 8.5 mm forward. It clears the plunger
       and keys the cube's orientation on the pad.                      §02
  F54  CORRECTION: R05 L6 "plunger foot ~30 mm from CoM" is stale since
       R06's 30° axis; the real figure is 23.7 mm. Axis tolerance for a
       0.3 mm miss becomes 0.72°.                                       §02
  F55  Layout v0.2: section view + interference check, 23 boxes, PASS.  §03
  F56  Home pad v0: isolation vs. launch-share trade; deck sizing; pad
       credit rule "surface, not airspace".                             §04
  F57  FSM v0.3 state table + simulator; precharge overlaps the decock;
       fall = motor stop, reverse only.                                 §05
  F58  Contract v0.4: pad state, deck runway 60 mm, 54 vectors, 54/54.   §06
  F59  First-article plan: MULE-0 / MULE-1 / MULE-2; 26 of 30 tests run
       before any custom part.                                          §07
  F60  HUSH-LOCK: optional "tap sets, only the app clears", for rooms
       where other hands reach the cube.                                §06
  F61  Use Case 08 — THE CLASSROOM.                                     §11

  Reproduce every number in this report with:
      python3 -I scripts/cubiq-r08-layout-pad.py
      python3 -I scripts/cubiq-r08-fsm-sim.py
      python3 -I scripts/cubiq-r07-contract-check.py     (v0.3 still 44/44)

--------------------------------------------------------------------------------
02 // F51-F54 — THE PLUNGER, THE STATOR AND THE COIL
--------------------------------------------------------------------------------

  THE CONSTRAINT
    The LEAP thrust line runs 30° off vertical (R06 D20) and must pass
    within 0.3 mm of the CoM (R04 F18). The CoM sits on the cube axis,
    inside the stator column. So the line always runs into the stator. The
    only question is how far up the plunger reaches before it does.

  THE PLUNGER, SIZED (v.0 LEAP: 43 mJ over 6 mm, R07 §03)
    spring rate 2.39 N/mm · 6.7 active coils (0.7 mm wire, 5.3 mm mean
    dia., EST) · solid 6.1 mm · free 13.1 mm
    axial stack from the table contact point:
      fixed sleeve     tip 2 + compressed spring 7.1 + cap 1   = 10.1 mm
      floating sleeve  tip 2 + free spring 13.1 + cap 1        = 16.1 mm
    At REST the floating sleeve sits up with the spring relaxed. Its cap is
    one full stroke higher than a fixed sleeve's ever is. R07 F43 counted
    the part but not the length.

  THE CLASH
    R05 stator: OD 26 mm, 24 mm tall incl. stroke, centred at mid-height,
    so its bottom is at z = 11.5 mm. Self-consistent CoM 19.2 mm. Tip
    contact 11.1 mm behind the axis. Room along the axis to the stator:
    13.3 mm.
                       need (+0.5 clear)   room     result
      fixed sleeve          10.6           13.3     fits
      floating sleeve       16.6           13.3     CLASH, 3.3 mm

  THE FIX — RAISE THE STATOR, NOT THE SPRING
    Iterating CoM and tip position together, the floating sleeve clears
    once the stator bottom is at z ≥ 14.4 mm (+2.9 mm).
      CoM              19.20 → 20.56 mm  (+1.35)
      tip contact      −11.1 → −11.9 mm behind the axis
      stator top        38.4 mm, ceiling 45.0: 6.6 mm left for the top
                        face (R05 L5: the ack zone holds nothing)
      static tip-over  46.2° → 44.2° on the 40 mm foot pitch. RECOVER
                        already triggers at 25° (R03), so this is a margin
                        change, not a behaviour change.
    Alternatives rejected:
      · A shorter spring (thicker wire, fewer coils) saves about 1 mm,
        not 3.3. It also raises the wire stress at the same energy.
      · Folding the spring off-axis onto a rocker. That makes a second
        load path through a pivot, which is exactly what the R05 tolerance
        stack penalises. It is kept as the v.1 fallback, where the stroke
        is 10 mm (R06 D28).
      · Dropping the floating sleeve. The cube would sit tilted at rest
        (R07 F43: 8.5°). No.

  F52 — THE CAM CAN'T SIT ON THE AXIS
    R07 drew the drive as gearmotor → worm → cam → follower → spring,
    which reads as a column. On the axis, a Ø20 mm cam above a 16.1 mm
    sleeve needs ~36 mm, against 16.6 mm of room. The cam goes BESIDE the
    stator:
      · Cam disc (two tracks, Ø20 × 2.5 mm) plus worm wheel in the gap
        between the stator (r = 13 mm) and the +y wall (21.5 mm), disc
        plane parallel to the launch plane, axis along y.
      · The follower is a cross-yoke. One pin runs in the spring track and
        pulls the tip rod; a second pin runs in the lock track and drives
        the sleeve. Both cross the plunger at y = 0. The yoke is the one
        new part (+0.2 g EST, §09).
      · The gearmotor and worm lie along x in the same pocket, below the
        cam. The supercap takes the mirror pocket at −y, which keeps the
        lateral CoM centred (R05 L4).
      · Balanced cam (R07 §03) still holds. The yoke pins sit on the cam's
        constant-radius dwell when ARMED, so a drop still puts no torque
        on the cam.

  F53 — THE QI COIL MOVES
    The tilted sleeve (OD 8 mm EST) crosses the floor between x = −16.5
    and −5.3 mm. A centred Qi RX coil covers that band.
      26 mm coil offset +7.5 mm   starts at x −5.5: clash 0.2 mm
      24 mm coil offset +8.5 mm   starts at x −3.5: gap 1.8 mm     ← v0.2
    A 24 mm coil is the wearable class. It is enough for a 150 mAh cell
    at ≤ 1 W, and alignment is set by the pad's home recess (§04).
    SIDE EFFECT, USEFUL: with the coil 8.5 mm off-axis, turning the cube
    180° on its pad moves the coil 17 mm off the transmitter, and 90°
    moves it 12 mm. Both are outside Qi alignment tolerance (~5-8 mm
    EST). So "charging at the home spot" means "facing the deck", and a
    LEAP from the home spot always heads onto the pad, never off its back
    edge (§04).
    v.2 NOTE: a second plunger mirrored at +x would cross this coil. v.2
    needs an annular coil or a launch pair on the y axis. Logged against
    R04 §05; no v.0 impact.

  F54 — R05 L6 WAS STALE
    "Plunger foot ~30 mm from CoM along the thrust line" dates from the
    R02-R05 45° axis (27.2 mm with R05's CoM). On R06's 30° axis it is
    22.2 mm with R05's stator, and 23.7 mm after F51. The R05 tolerance
    stack used 30 mm. Redone at 23.7 mm, a 0.3 mm CoM miss allows 0.72°
    of axis error, not 0.57°. The thrust-line tolerance gets 26 % easier.
    The stack is not rerun here. It improves, and B17 measures it anyway.

--------------------------------------------------------------------------------
03 // F55 — LAYOUT v0.2 (SECTION VIEW) + INTERFERENCE CHECK
--------------------------------------------------------------------------------

  Vertical section through the cube axis in the launch plane, front (+x,
  launch direction) on the RIGHT. z from the table. 45 mm outer, 1 mm
  wall, feet 1 mm. Stacking order to scale, details not.

        z ┌──────────────────────── 45 ────────────────────────┐
     46.0 │ shell · TOP: ack-touch zone (empty, 6.6 mm)          │
     38.4 │        ┌──────────────────────────────┐              │
          │        │  STATOR (magnet + coil) 14 g │              │
          │  ToF ◁═╡   ┌──────────────────────┐   ╞═▷ ToF   z 20-24
          │  tab   │   │ REACTION MASS = cell │   │  tab          │
          │        │   │  in former, 40 g ↕8  │   │               │
     14.4 │        └───┴──────────●CoM 20.6───┴───┘               │
          │            ╱ sleeve top 14.4                          │
          │  [cam Ø20 in +y pocket,  ╱  yoke ──┐                  │
          │   worm + motor below]   ╱          │   [IMU on PCB]   │
      5.6 │                        ╱ PCB (cut-out for sleeve) ═════│
      3.4 │                       ╱   ▓▓▓▓ Qi RX 24 mm @ +8.5 ▓▓▓▓ │
      2.0 │ ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔╱ ▔▔▔▔▔▔▔▔ floor ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔ │
      0.0 └ foot ──────────── tip x −11.9 ───────────────── foot ──┘
                       thrust line 30° off vertical → through CoM

  LAYOUT DECISIONS (v0.2; L1-L6 from R05 stand unless noted)
    L3' IMU on the PCB at x +14..+17 mm, ahead of the Qi coil's centre.
        The lever-arm correction (R05 L3) is unchanged in kind and gets a
        new offset vector.
    L6' Tip → CoM 23.7 mm along the thrust line (F54). Supersedes L6.
    L7  Stator bottom at z 14.4 mm (F51).
    L8  Cam, worm and motor in the +y side pocket; supercap in −y (F52).
    L9  Qi RX coil 24 mm, centre x +8.5 mm (F53).
    L10 PCB starts at x −4 mm, with a cut-out where the sleeve passes.

  INTERFERENCE CHECK (scripts/cubiq-r08-layout-pad.py, part B)
    12 parts, the tilted sleeve modelled as 1 mm slices, 23 boxes in all.
    Envelope: none outside the inner 43 mm cube. Clashes: none, apart from
    the intended sleeve-through-PCB cut-out. PASS.
    What the check is not: it uses boxes, not CAD. It shows the stack is
    possible. It does not prove assembly order, wire routing or the ToF
    flex bend radius. Those go to a CAD pass with MULE-1 (§07).

--------------------------------------------------------------------------------
04 // F56 — THE HOME PAD AS A KNOWN SURFACE
--------------------------------------------------------------------------------

  THE QUESTION (R07 §13)
    Can the home pad carry a factory surface class and edge map, so that
    placement on it is instant?

  WHAT THE PAD CAN AND CAN'T KNOW
    The pad knows itself: its deck size, its edges, its material, its
    isolation. It does not know the table under it, and it does not know
    what's on its deck (a mug, keys, a child's hand). So:
      THE PAD CERTIFIES THE SURFACE (class, edges), NEVER THE AIRSPACE
      (obstacles, windows).
    At the home spot, the cube skips the 0.5 s resonance probe and uses
    the deck's runway figure in place of the table-edge runway. It still
    runs the 0.1 s static look for obstacles, the level check, and the
    dirty-window check. Placement drops from ~1.0 s (R05 G7 v0.2) to
    ~0.1 s. "Instant" is close enough.

  ISOLATION VS. LAUNCH — THE TRADE (part C of the script)
    Putting the pad on soft isolators decouples the knock from the
    furniture. But the LEAP pushes off the pad, and a sprung pad recoils,
    so it takes part of the spring energy. The 2-DOF model has the cube on
    the plunger spring (contact only), and the pad on isolators (ζ 0.10
    EST) to the table. On a rigid table the push lasts 10.8 ms.

    pad mass  f_n    launch share  spring E needed   knock to furniture   sag
                                    for a 40 mm LEAP  @100 Hz   @180 Hz
     250 g    20 Hz    71.7 %        60.0 mJ          −24.6     −31.8 dB  0.62 mm
     400 g    20 Hz    80.4 %        53.5 mJ          −24.6     −31.8 dB  0.62 mm
     600 g    20 Hz    86.1 %        49.9 mJ          −24.6     −31.8 dB  0.62 mm
     600 g    35 Hz    88.9 %        48.4 mJ          −15.9     −25.0 dB  0.20 mm
     900 g    20 Hz    90.3 %        47.6 mJ          −24.6     −31.8 dB  0.62 mm

    · Isolation is set by f_n alone. Launch share is set mostly by pad
      mass: the push is shorter than the isolator's quarter period, so
      the pad acts as a free mass. The free-mass limit m_p/(M + m_p) is
      84.1 % at 600 g, and the isolators add ~2 points on top.
    · v0 DESIGN POINT: 600 g, 20 Hz. 86 % share, −25 / −32 dB, 0.62 mm sag.
      The LEAP on the pad is ~34 mm (0.86 × 40), inside B4's 40 ±10 mm,
      so the spring stays at 43 mJ (R07). The firmware does not
      compensate, because cam angle sets the cock and B3 calibrates one
      stroke. A 900 g pad would gain 4 points of share at 50 % more
      weight to carry. Not worth it for v.0.
    · The knock still radiates from the pad's own deck. A 12 mm stone
      composite deck is small, heavy and stiff, so EST the damped-desk
      class (R07 η 3×10⁻⁵). On a hollow shelf that is a −15 dB swing
      against R07's resonant row. B30 measures it.

  PAD v0 — SPEC (EST)
    deck          160 × 110 × 12 mm, mineral-filled stone composite, LOT®
                  black, ρ ≈ 2.8 → ~590 g. NON-METALLIC: metal near the Qi
                  coil takes eddy losses, and the v.3 track wants the pad
                  free of stray conductors.
    isolators     4 elastomer feet, f_n ≈ 20 Hz loaded, ζ ≈ 0.1.
    home spot     Qi TX at the rear of the deck. A 0.5 mm alignment
                  recess, felt by hand, holds the cube 5 mm from the rear
                  edge, facing the deck (F53).
    pad ID        sent from Qi transmitter to receiver in-band (FSK class):
                  model + factory deck geometry. No BLE, no app pairing,
                  no new radio. A third-party Qi pad charges the cube but
                  sends no LOT ID, so it gets no credit.
    deck runway   p98 cube front after one LEAP from the home spot: 104 mm
                  from the rear edge (40 mm nominal, ±10 % range, 3 mm
                  slip). The 160 mm deck leaves 56 mm. Certified obstacle
                  runway from the home spot: LEAP 60 mm, HOP 20 mm
                  (contract v0.4).
    off the spot  After a LEAP the cube is on the deck but off the Qi
                  spot. Credit ends. The next gesture uses the cube's own
                  probe and ToF, and the 12 mm deck edge reads as an edge
                  (vector 49). The pad never vouches for a place the cube
                  merely thinks it is in.
    pad recoil    on a LEAP landing: 0.73 mm. Below anything felt or seen.

  v.3 LINK
    R01 §06 names the table surface as the v.3 levitation array. A
    non-metallic, isolated, factory-mapped pad is where that array would
    go. Nothing in pad v0 rules it out.

--------------------------------------------------------------------------------
05 // F57 — FIRMWARE FSM v0.3 (STATE TABLE + SIMULATOR)
--------------------------------------------------------------------------------

  STATES (supersedes the R03 §04 diagram; spring energy in brackets)
    IDLE [0]  SETTLE [0]  NUDGE [0]  PRECHARGE [0]  HOP_STROKE [0]
    ARM [rising]  LOCK [full]  ARMED [full]  UNLOCK [full]  DECOCK [falling]
    FIRE → FLIGHT → LAND → RESET → IDLE      RECOVER  SAFE_HOLD [0]

  TABLE (state → allowed next)
    IDLE        → SETTLE · NUDGE · PRECHARGE · ARM · SAFE_HOLD
    PRECHARGE   → HOP_STROKE · NUDGE · IDLE · SAFE_HOLD
    HOP_STROKE  → FLIGHT
    ARM         → LOCK · DECOCK · SAFE_HOLD
    LOCK        → ARMED · UNLOCK · SAFE_HOLD
    ARMED       → FIRE · UNLOCK · SAFE_HOLD      (guards re-checked here)
    UNLOCK      → DECOCK · SAFE_HOLD             (tip lifts clear first)
    DECOCK      → IDLE · PRECHARGE · NUDGE · SETTLE · SAFE_HOLD
    FIRE        → FLIGHT
    FLIGHT      → LAND · SAFE_HOLD
    LAND        → RESET (LEAP) · RECOVER · IDLE (HOP)
    RESET       → IDLE · RECOVER · SAFE_HOLD     (sleeve not flush → hold)
    RECOVER     → RECOVER (≤ 2) · IDLE · SAFE_HOLD
    SAFE_HOLD   → (operator + self-test only, R06 G8)

  TIMING BUDGET (EST; script)
    gesture   first motion   back at rest   notes
    SETTLE      0.00 s         2.00 s
    NUDGE       0.00 s         0.60 s       two-beat (R05)
    HOP         1.00 s         1.10 s       supercap precharge (R04)
    LEAP        1.26 s         1.65 s       ARM 1.1 · LOCK 0.11 · re-check
                                            0.05 · FIRE 0.056 · flight 118 ms
                                            · RESET ≤ 0.2
    The spring is at full energy only from LOCK to FIRE: 0.22 s per
    LEAP. At the G4b cap of 12 LEAPs/day that is 2.6 s/day (0.003 %). R06
    planned for the 10 s ARMED maximum, and R07 then made the armed drop
    harmless anyway. The cube carries stored energy for a quarter of a
    second per gesture.

  RULES THE SIMULATOR FORCED
    · PRECHARGE OVERLAPS DECOCK. When the ARMED re-check fails (a hand
      appears 70 mm ahead) the gesture downgrades to HOP. Run in series,
      the HOP started 3.47 s after the signal. Charging the supercap during
      the decock (the cap is electrical, the cam mechanical) brings that
      to 2.47 s. New budget: a downgraded substitute starts ≤ 3.0 s after
      the signal.
    · FALL = MOTOR STOP; REVERSE ONLY. In ARM the worm self-locks where it
      stops. In ARMED/LOCK the motor may only run backward (UNLOCK →
      DECOCK), which moves the cam away from the drop edge. Forward motor
      commands are blocked from fall detection until the self-test (I6).
      This refines R07 §03 ("reverses the motor to decock"): reversing is
      allowed, never required. A cube in free fall can't fire either way.
    · DECOCK TIME = TIME SPENT ARMING. Abandoning ARM at 0.6 s costs 0.6 s,
      not a full 1.1 s.

  INVARIANTS CHECKED ON EVERY TRACE
    I1 ends at rest (IDLE or SAFE_HOLD) with zero spring energy
    I2 FIRE only on a performed LEAP/JUMP
    I3 ARM only for a LEAP/JUMP intent
    I4 first-motion latency within budget (SETTLE/NUDGE ≤ 0.1 s,
       HOP/LEAP ≤ 1.5 s, downgraded substitute ≤ 3.0 s)
    I5 ARMED ≤ 10 s
    I6 no forward motor command after a fall

  RESULTS
    54/54 contract vectors → legal traces, all invariants hold.
    9/9 fault scenarios:
      f1  fall during ARM            ARM > SAFE_HOLD                   no fire
      f2  fall while ARMED           … ARMED > UNLOCK > DECOCK > HOLD   no fire
      f3  hand ahead at re-check     … DECOCK > PRECHARGE > HOP         2.47 s
      f4  ARMED timeout (not still)  … ARMED > UNLOCK > DECOCK > IDLE   no fire
      f5  tipped 60° on landing      … RESET > RECOVER ×2 > IDLE
      f5b tipped 80°, can't right    … RECOVER ×2 > SAFE_HOLD
      f6  sleeve stuck (B27 fail)    … RESET > SAFE_HOLD
      f7  lifted while ARMED         … UNLOCK > DECOCK > IDLE           no fire
      f8  pad lost mid-ARM           ARM > DECOCK > SETTLE              1.20 s
    What the simulator is not: timings are EST, and the transitions are
    the table above rather than firmware. It checks that the table and the
    contract agree, and that no path reaches FIRE that shouldn't. MULE-1
    replaces the EST times with measured ones.

--------------------------------------------------------------------------------
06 // F58 + F60 — SIGNAL CONTRACT v0.4, HUSH-LOCK
--------------------------------------------------------------------------------

  F58 — v0.4 CHANGES (cube side; wire format unchanged)
    · state.pad = { model_ok, home_spot }, reported by firmware from the Qi
      ID packet and coupling. Uplink: device_event "pad_on" | "pad_off" so
      the app knows; no new QI·46 field.
    · PAD CREDIT applies only when model_ok AND home_spot:
        surface → DAMPED (pad-certified), unless tof_window_dirty
        runway thresholds → LEAP 60 mm, HOP 20 mm (from 125 / 85)
      Nothing else changes. HUSH, quiet hours, G1 level, G4b cadence, G7
      dirty window, G8 fall and G9 vibration all apply on the pad exactly
      as off it.
    · The decision order of v0.3 (R07 §06) is unchanged. The credit acts on
      the INPUTS to steps 13 (G1) and 14 (G6), not as a new step. It can
      only stop a downgrade that the pad's own physics makes unnecessary.
      It never raises a ceiling.
    · JUMP on the pad (it would land off the deck) needs a "pad_deck" cap.
      No class earns JUMP until D27 is decided, so no vector can exercise
      that rule. Following R07's suite rule (every rule gets a vector or it
      isn't in the contract), it stays in prose here and enters the
      contract with D27.

  VECTORS — docs/corporate/cubiq/signal-contract-v0.4-vectors.json (54)
    01-44 are the v0.3 vectors, unchanged. 45-54 are new:
      45  pad credit beats a resonant shelf reading        → leap
      46  deck runway 60 mm is enough                      → leap
      47  mug 40 mm ahead on the deck                      → hop  (G1)
      48  third-party Qi pad on a resonant shelf           → settle (G6)
      49  on the deck after a LEAP: no credit, 30 mm edge  → nudge (G1)
      50  fall on the pad                                  → safe_hold
      51  pad + dirty ToF window                           → settle (G7)
      52  pad + HUSH (credit keeps the NUDGE)              → nudge (G10)
      53  pad + 4° tilt                                    → hop  (G1)
      54  pad + quiet hours, common badge                  → nudge
    scripts/cubiq-r08-fsm-sim.py: 54/54 PASS (contract + FSM trace).
    scripts/cubiq-r07-contract-check.py: 44/44 PASS on the v0.3 file.

  F60 — HUSH-LOCK
    R07 lets a top-face double tap both set and clear HUSH, and says
    only the operator clears it. On a desk other hands can reach (a
    classroom, a shared office, a family table), a tap is not proof of the
    operator. New option, off by default:
      HUSH-LOCK ON → a double tap can SET hush but not CLEAR it. Only the
      app clears it.
    Making the cube quieter is open to anyone; making it louder needs the
    operator's phone. That is R06 F39 applied to hands. Firmware setting
    only, so no contract change. B29 adds a case: 50 clear-taps with
    HUSH-LOCK on, PASS 0 clears.

--------------------------------------------------------------------------------
07 // F59 — FIRST-ARTICLE BENCH PLAN: WHAT A MULE CAN TEST
--------------------------------------------------------------------------------

  MULE-0   bench rigs: catalogue parts and eval boards, no cube shape.
  MULE-1   3D-printed 45 mm shell (PA12 or tough resin, two halves),
           catalogue internals in the layout v0.2 positions. Mass-matched
           to 113.6 g: the printed shell weighs ~12.3 g against the ~30 g
           EST real one, so ~17.7 g of tungsten putty split over the eight
           corners matches both mass and inertia (I = M a²/6, R04). CoM
           set to 20.6 mm with a height gauge.
  MULE-2   needs a custom part: the real coil (km), the final shell
           material, or matched units.

  B-item                                                     MULE  why there
  B1   voice-coil force + km on candidates                     0   incoming test
  B1b  battery-as-reaction-mass, 1,000 HOPs                    0   shaker rig
  B3   snail-cam plunger 32-43 mJ, 200 decocks                 0   SLA cam,
                                                                   catalogue
                                                                   spring + worm
                                                                   gearmotor
  B9   resonance probe, 6 surfaces                             0   exciter + IMU
  B11  supercap pulse path, 20 °C / 0 °C                       0   eval H-bridge
  B12  off-pad idle ≤ 40 µA                                    0   MCU devboard
  B14  v.2 yaw per mm offset                                   0   rig (R04)
  B15  multizone ToF incoming                                  0   eval boards
  B18  ToF grazing floor                                       0   eval boards
  B20  plunger tip μ, 8 surfaces                               0   incline
  B23  contract conformance 54/54                              0   runs today
  B24  knock L200, 6 surfaces                                  0   DROP a mass-
                                                                   matched dummy
                                                                   from the same
                                                                   touchdown
                                                                   height (HOP
                                                                   10, LEAP 17,
                                                                   JUMP 65 mm).
                                                                   No actuator.
  B28  ToF window fouling                                      0   cover-glass
                                                                   samples
  B2   HOP 10 ±3 mm                                            1
  B4   LEAP 40 ±10 mm at 60°                                   1
  B5   landing recovery                                        1
  B6   edge gate 100/100                                       1
  B7   NUDGE felt threshold                                    1
  B10  signal contract on device, 1,000 messages               1
  B13  placement on 6 unseen surfaces                          1
  B16  gesture ID touch/sight, 20 people                       1
  B21  G8 fall detection                                       1
  B22  G9 working benches                                      1
  B25  shared table NUDGE, 20 people                           1
  B27  floating sleeve reset, 1,000 cycles                     1
  B29  HUSH tap (+ HUSH-LOCK case)                             1
  B8   thermal at touch surfaces                               2   real coil +
                                                                   shell
  B17  end-of-line yaw calibration, 10 units                   2   matched units
  B19  drop, 26 orientations                                   2   final shell
  B26  cam shock 1,500 g                                       2   final cam
                                                                   material
  ──────────────────────────────────────────────────────────────────────────
  MULE-0: 13   MULE-1: 13   MULE-2: 4   → 26 of 30 before any custom part.

  NEW for the pad (MULE-0):
    B30  Pad isolation + launch share: pad v0 (cast composite) on 4
         isolators, on a hollow-core door and a bookshelf. Dummy drops
         (B24 method) and B4 LEAPs. PASS: knock at 1.2 m within 3 dB of the
         oak-desk reading; LEAP 30-40 mm on the pad.
    B31  Pad ID + orientation key: 200 placements by hand, random yaw.
         PASS: home_spot asserted only when facing the deck (F53), 0 false
         asserts; third-party Qi pad never asserts model_ok.

  ORDER OF WORK
    1. B23 is already green in this repo. Wire both scripts into CI with
       the platform encoder (R06 D24).
    2. MULE-0 rigs in parallel. B1 (km) is the critical path: if km < 1.0,
       the supercap grows (R04) and the layout changes.
    3. MULE-1 build once B1, B3 and B15 pick parts. B4/B27 first, because
       they test this cycle's corrections (F51, R07 F43) in hardware.
    4. MULE-2 only after B1 freezes the coil.

--------------------------------------------------------------------------------
08 // VALIDATION PLAN — DELTAS TO R07 §08
--------------------------------------------------------------------------------

  B3   REVISED  Snail cam in the SIDE POCKET with the cross-yoke (F52):
                32-43 mJ ±15 %, 200 cycles, 200 decocks; yoke pin wear
                < 0.05 mm.
  B4   REVISED  Add the pad: 40 ±10 mm on 5 surfaces; 30-40 mm on pad v0.
  B17  REVISED  Use the 23.7 mm lever (F54), not 30 mm.
  B23  REVISED  54 v0.4 vectors + FSM invariants I1-I6 in CI. PASS: 54/54.
  B29  REVISED  + 50 clear-taps with HUSH-LOCK on. PASS: 0 clears.
  B30  NEW      Pad isolation + launch share (§07).
  B31  NEW      Pad ID + orientation key (§07).
  B32  NEW      FSM timing on MULE-1: measured first-motion latency for
                each gesture and for f3/f8 downgrades. PASS: within the §05
                budgets (0.1 / 1.5 / 3.0 s).
  Unchanged: B1, B1b, B2, B5-B16, B18-B22, B24-B28 and the R01 500/500
  close gate.

--------------------------------------------------------------------------------
09 // MASS BUDGET v0.6
--------------------------------------------------------------------------------

    R07 total (mass budget v0.5)                       113.6 g
    + cross-yoke, two pins (F52)                       + 0.2 g  EST
    − Qi RX coil 26/30 → 24 mm class (F53)             − 0.3 g  EST
    ±  stator raised 2.9 mm (F51): moves mass, adds none   0.0 g
    ──────────────────────────────────────────────────────────
    R08 total                                          113.5 g   margin 6.5 g
    CoM 20.6 mm (was 19.2). The pad is a separate object (~590 g) and is
    not in the cube budget.

--------------------------------------------------------------------------------
10 // ROADMAP CHECK — DOES R08 HELP OR HURT v.1-v.3?
--------------------------------------------------------------------------------

  v.1 LONG JUMP   Mixed. A 10 mm stroke makes the floating-sleeve clash
                  worse (+10 mm along the axis instead of +6). v.1 is where
                  the rocker-folded spring (F51, rejected for v.0) comes
                  back. JUMP is never credited on the pad (it would leave
                  the deck), which fits the D27 default of "none until
                  asked".
  v.2 SWINGS      One new problem: a mirrored second plunger crosses the
                  offset Qi coil (F53). v.2 needs an annular coil or a
                  y-axis launch pair. The FSM table extends per plunger.
                  The pad deck is a natural v.2 test track (known edges,
                  known μ).
  v.3 LEVITATION  Helped. Pad v0 is non-metallic, isolated and
                  factory-mapped: the platform the v.3 array would sit in.
                  The cube's only magnetic parts stay the stator (inside
                  the R05 keep-out once moved 2.9 mm up, still clear of the
                  Qi ferrite) and the gearmotor at the side pocket.

--------------------------------------------------------------------------------
11 // CONSUMER USE CASE 08 — THE CLASSROOM
--------------------------------------------------------------------------------

(Also appended to LOT-CUBIQ-QUANTUM-CUBE-v0.md §07. Prior entries untouched.)

  Operator profile: Usership tier, a primary-school teacher with a class
  of 27 eight- and nine-year-olds. School policy: phones stay in the
  staff-room locker during lessons. So the LOT® Memory question and the
  cohort signals that arrive during the day reach them at 17:30, all at
  once, on a phone they've avoided all day. Their desk at the front of
  the room is laminate on a steel frame: the hollow, ringing kind (R07:
  resonant). They bought the cube and its home pad to have one quiet
  link to their own day, at a desk where 54 eyes and 270 fingers are
  never far away.

  07:55, before the bell. They set the pad on the desk and the cube in its
  recess. The cube clicks into the home spot by feel; the coil only
  couples when it faces the deck (F53). Qi sends the pad ID, and
  placement takes 0.1 s: a static look, the level, the window check. No
  resonance probe is needed, because the pad is the surface (§04). They
  double-tap the top face. HUSH is on. They also turned on HUSH-LOCK in
  the app last week, after a pupil discovered the double tap.

  10:20, maths. A badge_rare unlock. HUSH caps it at NUDGE (vector 52). On
  the pad, the deck credit keeps it a NUDGE rather than a SETTLE, even
  though the steel desk would ring (vector 45's logic; without the pad,
  vector 36 gives SETTLE). The teacher is at the board, not touching the
  desk, and misses it. That's fine: no repeat, no escalation (R03 rule).
  The children see nothing. Nothing on the cube ever lights up for a
  notification (R05).

  10:45, break. Two pupils stay in to tidy. One of them picks up the cube,
  turns it over, puts it down crooked off the recess, and double-taps it
  as she saw the teacher do. With HUSH-LOCK on, the tap can't clear HUSH
  (F60). Off the home spot the pad credit ends (vector 49). The cube is
  doing nothing at all, and that is the important part: its spring has
  been relaxed all morning (cock-on-intent, R06). It spends 0.22 s per
  LEAP at full energy (§05), and it has had no LEAP today. There is no
  button, no gesture and no tap that makes it jump. A cube that only moves
  for a signal can't be turned into a toy. The second pupil drops it from
  desk height (0.72 m, inside the 1.0 m drop spec, R06 D23). G8 →
  SAFE-HOLD, and the app tells the teacher, in one plain line, to run the
  self-test before it charges again (R06 §06).

  12:30, lunch. The room is empty. The teacher runs the self-test from the
  app (pass), puts the cube back in its recess, and clears HUSH in the
  app. A cohort ping waiting since 11:50 arrives as SETTLE. Then the
  Memory question: memory_ready, raised by the operator one rung to HOP
  (R07 vector 31). The cube hops in place on the stone deck. The knock
  goes into 590 g of isolated composite, not into the steel frame, so the
  desk doesn't ring (−25 to −32 dB, §04). They answer the question in
  the 5-11 minute cubic over their sandwich, which is the session
  LOT-CUBIQ-OPERATOR §02 describes, in a slot the school day actually has.

  13:10, the bell. Double tap: HUSH on. The class comes back to a cube
  that is exactly where it was.

  What Use Case 08 proves that 01-07 did not:
    · The cube's audience can be CHILDREN, who see it and touch it.
      Sound (R07) is not the issue in a classroom; spectacle is. HUSH
      covers it, because a NUDGE is felt and never seen.
    · A tap is not proof of the operator. HUSH-LOCK (F60) lets anyone
      make the cube quieter and only the operator's phone make it
      louder.
    · Cock-on-intent, the cam-as-latch and the no-input rule together
      make the cube safe to leave among children. It has no stored energy
      at rest, a drop can't fire it, and there is no way to ask it to jump.
    · The pad turns a bad surface (a ringing steel desk) into a good one.
      The cube gets back its full vocabulary where the furniture would
      otherwise have taken it away, and it is the pad's mass, not the
      firmware, that does this.

  Consumer market: teachers, teaching assistants, tutors, nursery and
  after-school staff, and university lecturers between seminars. People
  who are on stage all day, can't be seen checking a phone, and have
  something on their desk that the room is always watching.

--------------------------------------------------------------------------------
12 // DECISIONS FOR S-2
--------------------------------------------------------------------------------

  D0  PROCESS: merge one CUBIQ branch (this one: R01 → R08) to master, or
      point the routine at a single long-lived branch. (Sixth time asked.)
  D36 Layout v0.2: stator bottom at z 14.4 mm, cam/worm/motor in the +y
      side pocket with a cross-yoke, supercap in −y, Qi RX 24 mm at
      x +8.5 mm (F51-F53, F55). Corrects R07 F43's fit and R05 L6 (F54).
  D37 FSM v0.3 as the firmware reference: state table, invariants I1-I6,
      precharge overlapping decock, fall = stop/reverse only, downgrade
      latency ≤ 3.0 s (F57).
  D38 Home pad v0: 160 × 110 × 12 mm non-metallic composite, ~590 g, 20 Hz
      isolators, home-spot recess, in-band Qi pad ID. Accept the ~34 mm
      LEAP on the pad, with no firmware compensation (F56).
  D39 Adopt signal contract v0.4 and its 54 vectors. Pad credit = surface,
      never airspace. pad_deck JUMP rule waits on D27 (F58).
  D40 HUSH-LOCK as an option, off by default (F60).
  D41 FIRST SPEND: approve procurement for MULE-0 and MULE-1 (catalogue
      voice-coil candidates, worm gearmotors, springs, 4× multizone ToF
      eval, IMU, BLE MCU devboard, low-ESR supercaps, wearable-class Qi
      RX + TX eval, SLA/PA12 printing, tungsten putty, one cast composite
      pad blank) (F59). Nothing in R01-R08 can advance further on paper
      without measured km (B1) and a measured LEAP (B4).
  Open and compatible: R05 D14, D16-D19; R06 D20, D21, D23-D28 (D27 now
  also gates the pad_deck rule); R07 D29-D35, with D31's sleeve sized by
  D36.

--------------------------------------------------------------------------------
13 // NEXT CYCLE (R09) PROPOSED SCOPE
--------------------------------------------------------------------------------

  · If D41 is approved: MULE-0 results (B1 km first). Replace EST inputs in
    R04-R08 scripts with measured values and report what moved.
  · If not: a CAD-grade pass of layout v0.2 (assembly order, wire routing,
    ToF flex bend radius), and the rocker-folded spring for v.1.
  · Pad v0: isolator selection and the in-band ID message format, and
    whether the pad needs its own BLE at all (current answer: no).
  · Platform side: a reference encoder for contract v0.4 in the LOT®
    server codebase (Index of Systems → signal), running the same 54
    vectors.
  · Use Case 09, chosen from themes not yet used across all branches.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-R08
================================================================================
