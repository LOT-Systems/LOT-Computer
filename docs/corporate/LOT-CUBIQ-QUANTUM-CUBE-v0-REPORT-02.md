================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
TITLE:    LOT® Quantum Cube (CUBIQ™) v.0 — Engineering Report 02
          Design Review · Physics Budget · Signal Contract · Test Plan
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-07
VERSION:  0.2 — DEVELOPMENT CYCLE 02 (supersedes nothing; extends 0.1)
STATUS:   PRE-HARDWARE. NO PROTOTYPE EXISTS. EVERY NUMBER IN THIS REPORT IS A
          FIRST-ORDER CALCULATION OR A PLANNING ESTIMATE, NOT A MEASUREMENT.
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read in full before writing (per the reading log convention in the v0 spec):

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md      (cycle 01 spec, 2026-07-28,
                                                    commit 2cce5a9) — my own
                                                    prior output. The base this
                                                    report reviews.
  docs/corporate/LOT-CUBIQ-VISION.md               Sec. 05 "Physical Products"
  docs/corporate/LOT-CUBIQ-OPERATOR.md             Sec. 02-04, Phase 4
  docs/corporate/LOT_QI46_ENGINE.md                L110 (nano-ceramic,
                                                    piezoelectric, haptic),
                                                    L750-764 (Cube sync)
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md      Products row: Quantum Cube
  docs/corporate/LOT-TERMINAL-M2M.md               Device data-intake formats
  docs/corporate/LOT_ROBOTICS_COSMO.md             COSMO® boundary (not CUBIQ™)
  docs/benchmark/LOT-MANIFEST.md, LOT-LEDGER.md    Lineage + ledger format
  src/client/utils/badges.ts                       Rarity ladder (7 tiers)

Findings from the read:

  1. The v0 spec is the ONLY hardware document on the Cube. The LOT® Institute
     corpus names the technologies (nano-ceramic, piezoelectric, haptic
     feedback) but contains no physics, mass, or energy figures. Cycle 02 is
     therefore the first document that puts numbers on the object.
  2. The spec's convention stands: Section 07 of the v0 spec accumulates one
     consumer use case per cycle, append-only. USE CASE 02 is in Section 11
     below and is also appended to the v0 spec Section 07.
  3. QI·46 line 757 defines the Cube's uplink as "haptic preference —
     pressure, duration, cadence" and "biofield response (pre/post session
     self-report)". The hardware measures MECHANICAL quantities only (IMU,
     timing, touch). It makes no biofield measurement. Biofield data enters
     the loop solely as operator self-report. This report keeps that line
     clean.

--------------------------------------------------------------------------------
01 // EXECUTIVE SUMMARY
--------------------------------------------------------------------------------

Cycle 01 locked the PRODUCT intent: one hop primitive, four gestures, a
roadmap to long jumps, table-walking and levitation. Cycle 02 does the first
engineering pass on that intent and finds that three of the cycle 01
mechanism choices do not survive first-order physics. None of them break the
product; all of them have a straightforward fix that stays inside the
Institute-named technology set.

  DR-01  The "voice-coil drives a reaction mass downward" mechanism cannot
         lift the shell. Replace with spring-latch launch (Leap/Hop) and keep
         the voice coil for Nudge/Settle/recovery.            [SEC 03]
  DR-02  The piezoelectric bimorph cannot supply the forward-bias impulse
         (about 100x short). Move bias to a mechanical launch angle; keep the
         piezo as sensor and fine-haptic element.              [SEC 03]
  DR-03  A forward-facing time-of-flight sensor sees walls, not table edges.
         The edge guard needs downward-looking cliff sensing on all four
         sides.                                                [SEC 04]
  DR-04  A Leap displaces the cube about 40mm off the Qi coil, outside
         inductive alignment tolerance. v.0 needs a return path.[SEC 05]
  DR-05  THE SETTLE ("pressure, no visible motion") is imperceptible unless
         touched. Redefine as contact-answered.                [SEC 06]
  DR-06  The 100/100 edge gate proves only >=97% reliability at 95%
         confidence. Propose 300/300 across four approach headings.
                                                               [SEC 08]

Delivered this cycle: physics and energy budget (02-03), mass budget (03),
edge-safety architecture (04), dock/return strategy (05), gesture vocabulary
v0.2 (06), hardware signal contract (07), firmware state machine (07),
prototype and test plan (08), regulatory checklist (09), v.1-v.3 feasibility
numbers (10), USE CASE 02 (11), next-cycle queue (12).

--------------------------------------------------------------------------------
02 // PHYSICS BUDGET — WHAT EACH GESTURE COSTS
--------------------------------------------------------------------------------

All figures: m = 0.120 kg (v.0 ceiling), g = 9.81 m/s², flat rigid surface,
no air drag. Computed with a short script (kept in the session scratchpad,
reproduced here by formula: R = v² sin(2θ)/g ; apex = v² sin²θ / 2g ;
E = ½ m v²; θ = launch elevation from horizontal).

  THE HOP    10 mm rise
             E = m g h = 11.8 mJ kinetic.

  THE LEAP   40 mm displacement. The cycle 01 spec biases the launch 5-15°
             OFF VERTICAL, i.e. elevation 75-85°. That is a steep launch and it
             has a consequence the spec did not state:

             bias off vertical   elevation   launch v    apex rise   KE needed
             ─────────────────   ─────────   ────────    ─────────   ─────────
             15°                 75°         0.89 m/s     37 mm       47 mJ
             10°                 80°         1.07 m/s     57 mm       69 mJ
              5°                 85°         1.50 m/s    114 mm      136 mJ

             → A 40mm Leap is a 37-57mm TALL hop, 4-6x the rise of THE HOP.
               Operators will read it as "jumped", not "scooted". Keep
               bias at 10-15° off vertical. Below 10° the cube leaves the
               desk-top envelope (>100mm rise) and the landing becomes the
               hazard.
             → Slip check: horizontal/vertical force ratio at launch is
               cot(θ). Required friction coefficient: 0.27 at 75°, 0.18 at
               80°. Any elastomer foot on wood, glass or laminate clears
               this. (Becomes binding in v.1 — see SEC 10.)

  RIGHTING   A cube resting on a side face is 45° past tipping and must be
             rolled over an edge: CoM lift 9.3mm, about 11 mJ, comparable to
             one Hop. The cycle 01 "tips past 25° → micro-pulse" covers
             ROCKING; a SIDE LANDING needs a full self-right pulse and a
             proper detector (see SEC 07, state RECOVER).

  ENERGY AT THE BATTERY
    At a conservative 25% battery-to-kinetic efficiency for the launch chain:
      Hop   ~0.05 J    Leap ~0.19-0.28 J    Self-right ~0.05 J
    A 200 mAh / 3.7 V cell holds ~2,660 J. Actuation is NOT the battery
    problem: even 50 Leaps a day is ~14 J/day. Standby (BLE, IMU wake-on-
    motion, Qi sense) is the real budget; target <150 µA average so the cube
    survives a week off the pad.

--------------------------------------------------------------------------------
03 // MECHANISM REVIEW — DR-01 AND DR-02
--------------------------------------------------------------------------------

DR-01  VOICE-COIL "DOWNWARD REACTION MASS" DOES NOT LAUNCH

  Cycle 01 (SEC 03): a voice coil drives an internal reaction mass DOWNWARD
  against the base face; "Newton's third law does the rest."

  The error: a mass pushed down into a shell that is already sitting on the
  table transfers its momentum to the table. The table's normal force
  increases; the shell does not leave it. Internal forces cannot change the
  system's centre-of-mass momentum; only the ground reaction can, and a
  resting plunger is not a leg.

  Two topologies that DO work, with the cost of each:

    (A) HAMMER — coil accelerates the mass UPWARD into the top stop; the
        inelastic impact lifts the shell. Efficiency is capped by the mass
        ratio. With a 30g slug in a 120g body, only ~25-28% of the slug's
        energy becomes shell momentum. For a 40mm Leap the slug needs
        3.5-4.3 m/s and 190-275 mJ. Over a 10mm stroke that is 630-920 m/s²
        — a 19-28 N peak force on the slug. No voice coil that fits in a
        45mm cube delivers that. REJECTED for the Leap.

    (B) SPRING-LATCH LEG — a micro gear-motor slowly cams a spring to
        70-140 mJ; a latch releases it; a short plunger ("leg") pushes
        against the table. Energy is stored over seconds, so peak motor
        power is milliwatts; the launch is passive and quiet until impact.
        This is the topology used by published small jumping robots, and
        the energy budget closes with margin. ADOPTED for HOP and LEAP.

  v0.2 ACTUATOR SPLIT
    Spring-latch leg ......... HOP, LEAP, SELF-RIGHT (the launches)
    Voice coil + 8-12g slug .. NUDGE, contact-answer SETTLE (no liftoff; tens
                               of mN·s impulses, 80-250 Hz — see SEC 06)
    Piezo disc ×2 ............ impact/landing sensing, tap detect, fine
                               haptic texture
  This is still "mechanically boring" in the cycle 01 sense: two proven
  actuator classes, no exotic parts, and it removes the one thing that
  could never have worked.

DR-02  PIEZO BIAS CANNOT SUPPLY THE FORWARD COMPONENT

  Cycle 01 used an angle-mounted piezo bimorph to bias the hop 5-15°
  off vertical a millisecond after release.

  Required lateral impulse for a 15° bias: m·v·sin15° = 0.12 × 1.07 × 0.259
  ≈ 33 mN·s. A small bimorph tip delivers on the order of 0.3 N for ~1 ms
  = 0.3 mN·s. That is ~100x short. The piezo is physically fine for
  sensing and texture; it is not a launch actuator.

  Fix: bias is geometric. The leg axis is canted 10-15° off the cube's
  vertical axis, so the Leap launches along it with zero extra parts. To
  jump the other way (DR-04), mount a SECOND canted leg seat or a
  swappable wedge foot — decision pending prototype A (SEC 08).
  The piezo stays in the stack and keeps its Institute lineage (QI46 L110,
  CQGS snapshot L32).

MASS BUDGET (grams, planning estimates — validate in CAD)
  Shell, ceramic-loaded polymer, 0.8mm walls (1)      17.5
  Chassis/frame                                       12.0
  Spring-latch leg: motor, cam, spring, latch, plunger 22.0
  Voice coil + 10g slug                               18.0
  LiPo 3.7 V, 200 mAh                                  5.0
  Qi receiver coil + IC + ferrite shield               5.5
  PCB: BLE SoC, drivers, PMIC, passives                6.0
  IMU + 4× cliff/ToF sensors                           3.0
  Piezo discs ×2 + harness                             2.0
  Feet ×4, LED ring, fasteners, adhesive               6.0
  ─────────────────────────────────────────────────────
  Subtotal                                            97.0
  15% contingency                                     14.5
  ─────────────────────────────────────────────────────
  Projected                                          111.5   ceiling 120

  (1) MATERIAL NOTE. A SOLID nano-ceramic shell is not viable: 121 cm² of
      surface at 1 mm and ρ≈3 g/cc is ~36 g, a third of the whole budget.
      "Nano-ceramic composite" must mean a ceramic-LOADED polymer or a
      ceramic COATING on a thin polymer shell (ρ≈1.8, ~17 g). This keeps the
      Institute material line while holding the mass target.
  Volume sanity: 45mm cube = 91 cm³ outer, ~82 cm³ inner. Average internal
  density ~1.2 g/cc at ~50% packing — plausible, tight.
  v.1 target <90g is NOT reachable by trimming this stack alone: it needs
  the voice coil gone (-18 g, Nudge moves to piezo) — noted in SEC 10.

--------------------------------------------------------------------------------
04 // EDGE-SAFETY ARCHITECTURE — DR-03
--------------------------------------------------------------------------------

Cycle 01 requires: "Time-of-flight sensor, base face, forward-facing…
inhibit if within 20mm of a detected surface edge… 100/100 trials."

Two defects:
  (1) A ToF sensor looking horizontally measures obstacles (walls, a laptop),
      not drop-offs. An edge is the ABSENCE of a surface below.
  (2) "Forward-facing" assumes a known heading. After any Leap the cube may
      have yawed; the next gesture can aim anywhere.

v0.2 EDGE GUARD
  SENSORS   Four down-angled (30-45°) cliff sensors, one per lateral face
            (IR reflectance or short-range ToF, 0.4-0.6 g each), plus the
            launch-axis heading from IMU gyro integration. A hop is ~0.5 s,
            so gyro drift is negligible within a gesture; heading is
            re-anchored every time the cube is on the pad (known geometry).
  RULE      Along the launch vector, if ANY sensor reports no surface within
            (planned displacement + 20 mm margin) → inhibit launch.
  LADDER    LEAP → HOP → NUDGE. Never "try anyway".
  FAIL-SAFE Any sensor fault, stale reading (>50 ms), or low battery
            (<15%) disables ALL launches; Nudge/Settle remain available.
  DOCK-RELATIVE SHORTCUT  While on the pad the cube knows where it is. The
            hub registers pad bounds as a "play zone" with a mandatory
            margin; Leaps are only planned INTO the zone. Cliff sensing is
            the second, independent layer — never the only one.
  HAZARDS  Pets and children. The cube is not a toy: age-gate 14+ (SEC 09),
            and a launch is inhibited whenever IMU reports the cube being
            carried (sustained non-gravity acceleration while off the pad).

--------------------------------------------------------------------------------
05 // DOCK AND RETURN — DR-04
--------------------------------------------------------------------------------

Qi receiver coils tolerate roughly ±8 mm of lateral misalignment (planning
figure; certify against the chosen coil). A 40mm Leap lands well outside it.
Cycle 01's "charging pad IS the table" never said how the cube gets home.

OPTIONS
  (a) LEAP-AND-RETURN PAIR ("THE TIDE") — a second canted leg seat gives a
      reverse launch. Cube leaps out on the signal, returns when the operator
      acknowledges (touch, or timeout). Adds ~1.5 g and a latch seat.
  (b) MAGNETIC SNAP — ferrite-free pad magnets pull a landing cube into
      alignment from ≤10 mm. Does not solve a 40mm excursion; solves final
      alignment after (a). Cube-side magnet must stay clear of the IMU and be
      sized for the pacemaker-distance guidance (SEC 09).
  (c) OPERATOR RETURNS IT — acceptable for the pre-hardware prototypes only.

RECOMMENDATION  (a)+(b). The cube treats the dock as home; every excursion has
a return; the pad's play-zone margins (SEC 04) are sized for the round trip.
The return hop is itself a gesture the operator learns: the cube "goes back
to bed".

--------------------------------------------------------------------------------
06 // GESTURE VOCABULARY v0.2
--------------------------------------------------------------------------------

Cycle 01 vocabulary is kept. Changes are in ACTUATOR and PERCEPTION notes.

  GESTURE  ACTUATOR        PHYSICS                         NOISE TARGET*
  ───────  ──────────────  ──────────────────────────────  ─────────────
  NUDGE    voice coil      3 pulses, 80-250 Hz, force      <25 dBA @0.5m
                           kept below 1 N (no liftoff).
                           200-250 Hz sits at the skin's
                           peak vibrotactile sensitivity.
  HOP      spring-latch    ≈12 mJ, ≤10 mm rise              <35 dBA @0.5m
  LEAP     spring-latch    47-69 mJ, 37-57 mm rise,         <40 dBA @0.5m
           + canted leg    ~40 mm displacement
  SETTLE   voice coil      CONTACT-ANSWERED (DR-05): when   <20 dBA @0.5m
                           IMU/piezo detects a palm on the
                           shell, 2 s of 20-60 Hz standing
                           pressure.
  *targets, unmeasured. Bedroom use (USE CASE 02) depends on them.

DR-05  CYCLE 01 SETTLE: "light standing pressure for 2 s, no visible motion."
  A constant force on a cube sitting on a desk is felt by nobody. It is
  imperceptible by construction. Redefined: SETTLE is the cube's ANSWER to
  being touched — presence acknowledged, not presence broadcast. Trigger
  stays "Assembly phase advanced"; delivery is deferred until the operator
  next touches the cube (TTL 6 h, then dropped). This keeps the cycle 01
  intent ("presence without spectacle") and makes it real.

DEGRADATION LADDER (quiet hours, low battery, edge inhibit)
  LEAP → HOP → NUDGE → (queue until contact) SETTLE-on-touch → drop at TTL

RARITY MAP (badge rarity has 7 tiers; spec mapped only "rare and above")
  common, uncommon ............ HOP
  rare, epic .................. LEAP
  legendary, mythic, cosmic ... LEAP, then SETTLE coda on touch   [PROPOSAL —
                                needs S-2 ratification; changes vocabulary]

--------------------------------------------------------------------------------
07 // SIGNAL CONTRACT AND FIRMWARE
--------------------------------------------------------------------------------

TOPOLOGY (recommendation, pending S-2)
  LOT cloud ──WSS──▶ PAD HUB (Wi-Fi, Qi TX, always on)
                         │ BLE 5 LE
                         ▼
                       CUBE
  Reason for a hub: it is mains-powered, always connected, knows pad
  geometry (SEC 04), and avoids depending on browser Bluetooth (not
  available on iOS). The cube never holds a cloud credential; the hub holds
  the device token. Aligns with the M2M authenticate-and-assign-device_id
  intake in LOT-TERMINAL-M2M.md.

DOWNLINK (cloud → hub → cube), M2M-style:
  {
    "device_id": "cubiq-0001",
    "operator": "S-2-username",
    "cmd": "gesture",
    "gesture": "LEAP",              // NUDGE | HOP | LEAP | SETTLE
    "signal": "badge_unlock",       // badge_unlock | memory_question
                                    // | assembly_phase | session_start
    "rarity": "rare",
    "ttl_s": 600,                   // stale notifications are DROPPED
    "quiet_ok": false,              // may it degrade? always true except test
    "ts": "2026-10-07T21:50:00Z"
  }
  TTL rule: a badge hop three hours late is spam. Expired → dropped, never
  replayed on reconnect.

UPLINK (cube → hub → cloud), M2M Format 2 style:
  {
    "device_id": "cubiq-0001",
    "operator": "S-2-username",
    "metric": "gesture_result",
    "gesture": "LEAP", "executed": "HOP", "inhibit": "edge_n",
    "rise_mm_est": 8, "landing_tilt_deg": 4, "recovered": false,
    "ack": "touch", "latency_to_ack_s": 47,
    "battery_pct": 82, "ts": "2026-10-07T21:50:02Z"
  }
  Feeds QI·46's "haptic preference — pressure, duration, cadence" (L757)
  and "usage frequency". Contains NO location and NO audio. Operator-
  readable and operator-deletable like any LOT® signal.

STATE MACHINE (cube firmware v0.2)
  DOCKED ─cmd─▶ ARMED ─guard ok─▶ FIRE ─▶ FLIGHT ─▶ LANDED ─▶ ASSESS
     ▲             │ guard fail                         │
     │             ▼                                    ├─ tilt ≤ 25° ─▶ REPORT
     │         DEGRADE (ladder)                         ├─ 25-45° ─▶ MICRO-PULSE
     │                                                  └─ >45° ─▶ SELF-RIGHT
     └────── RETURN ◀── ack / timeout ◀── REPORT ◀──────────┘
  Invariants: no FIRE without a fresh guard result; two failed SELF-RIGHT
  attempts → LOCKOUT (all launches off, Nudge only, flag to operator);
  FLIGHT is detected by IMU free-fall (<0.3 g) — no free-fall within
  100 ms of FIRE means the launch failed.

--------------------------------------------------------------------------------
08 // PROTOTYPE AND TEST PLAN
--------------------------------------------------------------------------------

STAGES (durations are planning estimates, not commitments)
  PROTO A  "PROOF OF HOP" (~4 wk)  Bench rig, off-the-shelf parts, printed
           45mm shell, no battery miniaturisation. Exit: measured rise and
           displacement for HOP and LEAP match SEC 02 within ±25%.
  PROTO B  "INTEGRATED" (~6 wk)    Custom PCB, Qi Rx, real battery, four
           cliff sensors, firmware state machine. Exit: SEC 07 invariants
           pass in fault-injection.
  PROTO C  "DESIGN LOCK CANDIDATE" (~6 wk)  Production-intent shell and
           materials, mass ≤120 g measured. Exit: gates G-0.1 to G-0.4.

EXPERIMENTS (Proto A)
  E1 spring energy vs launch energy (efficiency of the leg chain)
  E2 canted-leg angle vs measured displacement, 3 surfaces
  E3 landing: foot elastomer vs bounce/tumble rate
  E4 yaw scatter after Leap (decides how strict the 4-sensor guard must be)
  E5 Nudge perception threshold, 8-person bench panel, through wood desk
  E6 SETTLE touch-answer detectability (IMU vs capacitive shell)
  E7 noise at 0.5 m, 3 rooms
  E8 Qi alignment tolerance of the chosen coil on the real pad

INSTRUMENTATION  1000 fps camera, calibrated grid, IMU log at 1 kHz, sound
level meter, 3 surfaces (wood, glass, laminate).

GATES (cycle 01 gates kept; amendments PROPOSED, pending S-2)
  G-0.1  500 hop-and-recover cycles, 0 off-table landings, 0 actuator
         failures. KEEP. (0/500 failures = ≥99.4% reliability at 95% conf.)
  G-0.2  Edge guard. Cycle 01: 100/100. 0/100 failures proves only ≥97.0%
         at 95% conf. For a device that can fall off a desk onto a floor
         near children or pets, propose 300/300 (≥99.0%) with approaches
         at four headings and three speeds.                       [DR-06]
  G-0.3  Mass ≤120 g measured, Nudge ≤25 dBA, Leap ≤40 dBA @0.5 m.   [NEW]
  G-0.4  Return-to-dock: 50/50 within ±8 mm of Qi centre.            [NEW]

--------------------------------------------------------------------------------
09 // REGULATORY AND SAFETY CHECKLIST
--------------------------------------------------------------------------------

To be confirmed with a certification lab and counsel; nothing below is a
claim of compliance.

  Wireless power ... Qi (WPC) certification for pad and receiver; FCC Part 15
                     and CE RED for BLE and the inductive transmitter.
  Battery .......... Li-ion/LiPo cell: UN 38.3 transport, IEC 62133 cell
                     safety. Hop/landing shock on the cell must be
                     qualified (not assumed). Over-temperature cut-off.
  Product safety ... IEC 62368-1 (audio/IT/ICT equipment) as the baseline.
  Age / toy status . Not a toy. Label 14+. A 45mm cube is larger than the
                     small-parts cylinder, but detachable feet, LED lens and
                     shell halves must pass pull/torque tests.
  Magnets .......... Any cube/pad magnet: keep-away statement for implanted
                     cardiac devices (commonly cited ≥10 cm for strong
                     magnets), swallow hazard if a magnet detaches.
  Privacy .......... No microphone, no camera, no location in the cube. IMU
                     data leaves the device only as the gesture_result
                     summary in SEC 07.

--------------------------------------------------------------------------------
10 // v.1 / v.2 / v.3 FEASIBILITY NUMBERS
--------------------------------------------------------------------------------

v.1 LONG JUMP — >150 mm single bound, m = 90 g (cycle 01 target)
  elevation   launch v   apex rise   KE needed   friction μ needed
  45°         1.21 m/s    38 mm       66 mJ       1.00
  55°         1.25 m/s    54 mm       71 mJ       0.70
  60°         1.30 m/s    65 mm       77 mJ       0.58
  Energy is NOT the hard part — 66-77 mJ is the same class as a v.0 Leap.
  The hard part is GRIP. At 45° the foot must hold μ ≈ 1.0 at the instant of
  launch; silicone on glass can be below that. Choose launch elevation
  55-60° and the gate (9/10 on wood, glass, laminate) becomes reachable;
  at 45° it likely is not. Mass: the <90 g target needs the voice coil
  removed (SEC 03).

v.2 TABLE-WALKING — 200 mm directed traverse, <15 mm cross-track
  ≈4-5 chained 40-50 mm leaps ≈ 0.3-0.4 J out, ~1.5 J electrical per
  traverse. Energy is trivial; the problem is DIRECTION. Cross-track error
  accumulates from yaw scatter at each landing (E4). Needs per-hop heading
  correction from the IMU and a yaw actuator. Yaw scatter data from Proto A
  decides whether v.2 is a cantilever-foot design or needs a reaction wheel.

v.3 LEVITATION — RESEARCH TRACK. FIRST NUMBERS FOR THE TWO CANDIDATES
  (a) ACOUSTIC — REJECTED FOR THE FULL CUBE.
      To hold 1.18 N on a 45×45 mm face by radiation pressure takes ~580 Pa,
      i.e. ~100 kW/m² intensity, ~6.4 kPa rms ≈ 170 dB SPL at 40 kHz. That is
      tens of dB beyond published ultrasonic exposure guidance and the cube
      (45 mm) is ~5x the wavelength (≈8.6 mm), outside the small-particle
      regime where acoustic levitators work. Acoustic levitation remains
      interesting ONLY for a sub-gram inner element ("mote"), not the cube.
  (b) MAGNETIC — OPEN, MOST PROMISING.
      Desktop active-magnetic levitation modules in this payload class
      (hundreds of grams, tens of mm gap) are commercially available, so the
      mass is not the blocker. Three consequences for v.0-v.2 design:
        1. The levitating cube is PASSIVE. It carries a magnet, not a
           battery-driven launch chain; power and control live in the pad.
           Plan a "CUBIQ passive core" variant, not a levitating v.2.
        2. Qi charging does not work across a 20 mm levitation gap. The
           pad-as-power-surface needs a resonant long-range scheme or the
           cube lands to charge.
        3. A phased pad coil array gives YAW for free — the cube can turn to
           face the operator. That is the v.2 yaw problem solved on the pad
           side, not the cube side.
      Decision for S-2: scope the passive-core levitation variant as its own
      Institute research item. Do not couple it to the v.0 critical path.
  Reserve v.0 PCB area for a hall sensor and an IMU axis reading sanity so a
  magnetic cube variant reuses the same board.

--------------------------------------------------------------------------------
11 // CONSUMER USE CASE 02 — THE EVENING CLOSE            2026-10-07
--------------------------------------------------------------------------------

Operator profile: Usership tier with Quantum Cube sync, archetype
"Diurnal Operator" (the evening-close archetype in the QIE ledger), a father
of a young child. The CUBIQ pad sits on the kitchen counter, 90 mm from the
counter's edge, charging. The child is asleep. The house has one rule: no
phones after 21:00.

This use case is the opposite pole of USE CASE 01. There the cube was a
daytime desk presence at the edge of attention. Here it must be a NIGHT
presence with no sound, in a room next to a sleeping child, and it must
refuse to jump.

  21:50  Evening-coherence close is due (the QIE evening job). The operator's
         phone is in the hallway. A push notification would be a screen
         lighting a dark kitchen.
         The cube receives gesture=SETTLE, signal=assembly_phase with TTL
         6 h. The local-time schedule is applied by the hub (the platform's
         job clock is UTC; the cube never reasons about time zones).
  21:50  The cube does nothing visible. SETTLE is contact-answered (DR-05):
         it waits.
  21:58  The operator puts a hand on the cube while waiting for the kettle.
         The cube answers with two seconds of low standing pressure under the
         palm. No light, no sound, no motion. They understand the day is
         ready to close.
  21:59  A memory question is also ready. The hub knows quiet hours are on
         (set by the operator at install): NUDGE is allowed at reduced
         amplitude, HOP and LEAP are not. The cube performs one soft NUDGE
         through the counter. The operator feels it; the child's door, ten
         metres away, does not.
  22:03  The operator opens the cubic on the laptop, answers the question,
         writes two sentences in the LOG. An uncommon badge unlocks. Quiet hours are on, so HOP degrades to NUDGE per the
         ladder in SEC 06. The cube does not hop. It does not mention that
         it did not.
  NEXT MORNING  Out of curiosity, with quiet hours off, the operator sets the
         cube down 30 mm from the counter's edge and triggers a LEAP from
         the test menu. The cube shudders in place instead: the edge guard
         (SEC 04) inhibited the launch. The operator reads this as the
         product telling them something true about the counter, not as a
         failure.
  LOG    The cube reports gesture_result for the morning test: requested
         LEAP, executed NUDGE, inhibit edge_n, ack touch. QI·46 gets the haptic-preference signal:
         this operator takes SETTLE-on-touch at night and accepts NUDGE;
         the next evening's SETTLE is delivered earlier.

Why this is a v.0 use case: it needs only the gestures v.0 ships (NUDGE,
SETTLE, the degraded HOP), the hub schedule, and the edge guard. It exercises
the three things v.0 must get right before it jumps anywhere:
  1. Silence on demand (G-0.3: Nudge ≤25 dBA, Settle ≤20 dBA).
  2. Graceful refusal (degradation ladder, edge inhibit).
  3. Presence without a screen — the anti-feed thesis in a room where a
     screen would be wrong.

Acceptance criteria for this scenario:
  - Quiet hours on: no launch gesture occurs, measured by IMU over 14 nights.
  - SETTLE detectable by touch in 20/20 trials in E6.
  - 0 sound events above 25 dBA at 0.5 m across 14 nights.
  - 100% of expired (>TTL) notifications dropped, none replayed.

--------------------------------------------------------------------------------
12 // OPEN DECISIONS FOR S-2 AND NEXT-CYCLE QUEUE
--------------------------------------------------------------------------------

DECISIONS REQUESTED
  D1  Adopt DR-01/DR-02: spring-latch launch, geometric bias, voice coil
      for Nudge/Settle only.
  D2  Adopt hub topology (SEC 07) instead of direct cube-to-phone.
  D3  Ratify gate amendments G-0.2 (300/300), G-0.3, G-0.4.
  D4  Ratify SETTLE as contact-answered (DR-05).
  D5  Rarity map extension for legendary/mythic/cosmic (SEC 06 proposal).
  D6  Open "passive-core levitation" as a separate Institute research item.

NEXT-CYCLE QUEUE (one consumer use case per cycle, append-only)
  UC 03  Shared household — two operators, one cube, whose signal wins
         (arbitration, per-operator gestures, privacy of the haptic signal)
  UC 04  Travel — hotel desk, unfamiliar surface, no pad: low-power mode,
         surface auto-detect (friction), first-use edge calibration
  UC 05  Focus session — the operator invites the cube to guard a deep-work
         block; Settle as a timer, Nudge as a boundary
  UC 06  Gift/onboarding — Month-12 unboxing as the first gesture the
         operator ever receives (ties to QI·46 L750 milestone)
  Engineering: Proto A bill of materials and bench schedule; E1-E8 raw
  data template; hub firmware stub and signal-contract schema in src/ once
  D2 is ratified.

--------------------------------------------------------------------------------
13 // BRAND
--------------------------------------------------------------------------------

LOT® Quantum Cube         The object
CUBIQ™                    The experience — software and hardware
LOT®† CUBIQ®              The combined mark
COSMO® Cube               A separate product track. Not this object.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
================================================================================
