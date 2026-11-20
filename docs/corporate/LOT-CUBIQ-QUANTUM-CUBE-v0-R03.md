================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-R03
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report R03
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-11
VERSION:  0.3 — MECHANISM CORRECTION · MASS BUDGET · FIRMWARE · SIGNAL CONTRACT
STATUS:   v.0 — PRE-HARDWARE · DESIGN LOCK STILL PENDING (see §10)
PREDECESSORS: LOT-CUBIQ-QUANTUM-CUBE-v0.md (R01, 2026-07-28)
              LOT-CUBIQ-QUANTUM-CUBE-v0-R02.md (R02, 2026-11-10)
================================================================================

R03 is the third development cycle of the v.0 actuated haptic notification
device. R01 fixed the product shape. R02 put ballistics under it. R03 checks
the one thing R02 took for granted — HOW the cube pushes off the table — and
finds that R01's reaction-mass description points the wrong way and R02's
actuator force target is about 2-4× too low. Both are fixed on paper below.
R03 then delivers the scope R02 §12 asked for: a mass budget / BOM v0.1, the
firmware state machine, and the Index-of-Systems → cube message contract.

Everything here is analysis. No hardware exists. No part has been bought.

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Own prior work (read in full):
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md       R01 — form, four-gesture
    language, QI·46 loop, v.0→v.3 roadmap, Use Cases 01-02.
  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R02.md   R02 — hybrid drive,
    two launch profiles, edge degradation ladder, quiet hours, v.3 narrowed
    to active magnetic levitation, bench plan B1-B8, Use Case 02.
  scripts/cubiq-ballistics.py                        R02 numbers — re-run
    this cycle, all R02 tables reproduce exactly.

LOT® Institute corpus (re-read in the cited sections):
  docs/corporate/LOT-CUBIQ-VISION.md      §01 anti-feed thesis; §05 physical
                                           products as "completion of the cubic"
  docs/corporate/LOT-CUBIQ-OPERATOR.md    §03 Index of Systems signal classes;
                                           §04 AI-driven physical delivery;
                                           §07 Phase 4 physical extension
  docs/corporate/LOT_QI46_ENGINE.md       piezo / nano-ceramic / haptic corpus;
                                           Month-12 Quantum Cube sync (haptic
                                           preference: pressure, duration,
                                           cadence)
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md  "Quantum Cube Hardware —
                                           PLANNED" row; psychotronic-sensor
                                           register ("feel the field it sits in")

PROCESS FINDING — READ THIS FIRST, S-2
  This routine has fired roughly a hundred times since 2026-07-28. Every run
  started from `master`, where only R01 exists, so every run wrote its own
  "R02" and its own "Use Case 02" on a separate `claude/*` branch. None of
  them was merged. A sweep of those branches finds 95+ copies of Use Case
  01 and 60+ different Use Case 02s (Bedside Settle, Silent Alarm, Open
  Window, Breath Pacer, Entangled Pair, Kitchen Counter, and many more).
  The work kept starting over instead of building up.

  R03 breaks the loop on this branch: it cherry-picks the most recent R02
  (commit d410330, branch claude/tender-turing-egiuxh, 2026-11-10) as its
  predecessor and builds on it. For the series to keep adding up, R02 + R03
  (this branch) need to be merged to `master`, or the routine needs to point
  at one long-lived branch. Until that happens, the next run will again see
  only R01. See §10 D0.

  Use-case themes already used on those branches were checked so Use Case 03
  below is new: no prior entry covers resonant furniture, musical
  instruments, or the cube's vibration turning into audible sound.

--------------------------------------------------------------------------------
01 // WHAT CHANGED IN R03
--------------------------------------------------------------------------------

  F7   R01's reaction-mass hop points the wrong way; R02's B1 force
       target assumes 100 % momentum transfer. Real transfer is m_r/M.  §02
  F8   A solid nano-ceramic shell eats a third to half of the mass budget.
       Ceramic-filled polymer or a coated core is required.             §03
  F9   LEAP moves to a spring-driven FOOT PLUNGER that pushes on the
       table directly, not on an internal mass.                         §02
  F10  The NUDGE band (80-250 Hz) overlaps the resonances of common
       furniture and instruments — the "felt, not heard" promise can
       fail. New gate: surface resonance probe.                         §06
  F11  Firmware state machine v0.1.                                     §04
  F12  Index-of-Systems → cube signal contract v0.1.                    §05
  F13  Use Case 03 — THE PRACTICE PIANO.                                §09

  Reproduce every number in this report with:
      python3 -I scripts/cubiq-r03-budget.py

--------------------------------------------------------------------------------
02 // F7 + F9 — HOW THE CUBE ACTUALLY LEAVES THE TABLE
--------------------------------------------------------------------------------

  THE ERROR IN R01 §03
    R01: "drives a spring-loaded internal reaction mass downward against
    the base face … the shell leaps." It doesn't. The reaction mass and the
    base belong to the same body; pushing one down against the other is an
    internal force, and internal forces cancel. A closed box can't lift
    itself by hitting its own floor.

  WHAT WORKS — two physically different launch paths
    (a) INTERNAL REACTION MASS, stroked UP. The coil drives the mass upward;
        the reaction presses the shell down into the table, and the table
        pushes back (the only external force). At the top of the stroke the
        mass hits an end-stop and the whole cube moves up together. Momentum
        is conserved through that impact; kinetic energy is not. Fraction of
        the moving mass's energy that becomes hop energy = m_r / M.
    (b) EXTERNAL FOOT PLUNGER. A foot pushes directly on the table and the
        whole body accelerates. There's no inelastic impact inside the cube;
        what you lose is spring hysteresis and foot compliance (estimated
        60-80 % transfer).

  REACTION-MASS HOP — 10 mm rise, M = 120 g (11.8 mJ needed at the body)

    m_r     transfer   mass KE    mean F @ 5 mm   mean F @ 8 mm
    20 g      17 %     70.6 mJ       14.1 N           8.8 N
    30 g      25 %     47.1 mJ        9.4 N           5.9 N
    40 g      33 %     35.3 mJ        7.1 N           4.4 N
    60 g      50 %     23.5 mJ        4.7 N           2.9 N

    R02 §08 B1 set PASS at "≥2.4 N mean over 5 mm". That's the figure for
    100 % transfer, which only a massless shell would get. With a realistic
    40 g moving mass the real target is 7.1 N over 5 mm or 4.4 N over 8 mm.

  R03 DECISIONS
    · HOP, NUDGE, SETTLE stay on the voice coil (path a). Stroke grows to
      8 mm; moving mass 40 g. B1 is re-specified in §07.
    · Option worth testing: make the LiPo cell part of the moving mass
      (battery-as-reaction-mass). It turns 7 g of dead weight into useful
      inertia. Risk: flex-cable fatigue over tens of thousands of strokes.
      Bench it before anyone relies on it.
    · LEAP (and every later v.1 JUMP) moves to path (b): a spring-latch
      FOOT PLUNGER on R02's ~45° axis, released by the voice coil as a
      trigger. Numbers at 45°, 40 mm:
        body KE 23.5 mJ → spring store 29-39 mJ (80-60 % transfer)
        6 mm plunger stroke → spring rate ~1.6-2.2 N/mm, peak ~10-13 N
      That spring is small and cheap. Putting it in the foot is also what
      makes v.2 work: two angled plungers are the start of directed
      swing-hops.
    · R02's "hybrid drive" (D1) is therefore confirmed, but with a new
      geometry: the spring pushes the TABLE, not an internal mass.

--------------------------------------------------------------------------------
03 // F8 — MASS BUDGET AND BOM v0.1 (CLASSES, NOT PART NUMBERS)
--------------------------------------------------------------------------------

  SHELL — six 45 mm faces, 121.5 cm² of wall
    Material                          1.0 mm wall    1.5 mm wall
    alumina-class ceramic (ρ≈3.9)       47.4 g         71.1 g
    zirconia-toughened comp. (ρ≈3.0)    36.5 g         54.7 g
    ceramic-filled polymer (ρ≈1.9)      23.1 g         34.6 g
    PC core + 0.1 mm ceramic coat       16.4 g         24.6 g

  A solid ceramic shell would use 30-60 % of the 120 g budget before
  anything moves. The "nano-ceramic architecture" named in LOT_QI46_ENGINE.md
  survives as a surface and as a filler, not as solid walls. Recommendation:
  ceramic-filled polymer, 1.0 mm, ribbed inside at the edges (the R02 §04
  landing load case).

  MASS BUDGET v0.1 (estimates)
    shell, ceramic-filled polymer 1.0 mm          23 g
    internal frame + fasteners                     8 g
    voice-coil stator (magnet + coil)             14 g
    reaction mass, moving (incl. coil former)     40 g
    spring-latch foot-plunger module               9 g
    LiPo 300 mAh                                   7 g   (0 if it becomes the reaction mass)
    PCB: MCU + BLE + H-bridge + boost              5 g
    Qi receiver coil + ferrite                     4 g
    IMU (6-axis) + ToF + shell temp sensor         1 g
    piezo bimorph angle trim                       2 g
    elastomer feet ×4                              2 g
    v.3 magnet-volume reserve (empty, no ferrous)  0 g
    ──────────────────────────────────────────────────
    TOTAL                                        115 g   margin 5 g vs. 120 g

  A 5 g margin is thin. If B1 shows the stator has to grow, the battery-as-
  reaction-mass option (§02) is the first lever (+7 g); a coated-core shell
  is the second (+7 g).

  BOM CLASSES v0.1
    Actuation   moving-mass linear voice coil, 8 mm stroke; H-bridge driver
                with current sense; spring-latch plunger, coil-released pawl
    Trim        piezo bimorph, ±5° launch-angle trim (R02 §04)
    Sensing     6-axis IMU at centroid; forward + rear ToF (rear added for
                v.2 readiness); shell thermistor
    Compute     BLE-class low-power MCU; motion primitives run locally, so
                the cube never needs the network to stay safe
    Power       300 mAh LiPo; Qi-class receiver; boost rail for coil peaks
    Feedback    base LED ring (pairing/charge only, per R01 §02)

--------------------------------------------------------------------------------
04 // F11 — FIRMWARE STATE MACHINE v0.1
--------------------------------------------------------------------------------

                 ┌──────────── charge pad lost / tilt > 10° ─────────────┐
                 ▼                                                       │
   ┌────────┐ signal  ┌────────┐ guards ok  ┌────────┐ fired  ┌────────┐ │
   │  IDLE  │───────▶│ ARMED  │──────────▶│  FIRE  │──────▶│ FLIGHT │ │
   └────────┘        └────────┘            └────────┘       └────────┘ │
       ▲  ▲              │ guard fails          │                │      │
       │  │              ▼                      │ (NUDGE/SETTLE) │ land │
       │  │        ┌───────────┐                ▼                ▼      │
       │  │        │ DOWNGRADE │──▶ FIRE    ┌────────┐     ┌─────────┐  │
       │  │        └───────────┘ lower      │SETTLED │◀────│ RECOVER │──┘
       │  │                      gesture    └────────┘ ok  └─────────┘
       │  └── COCKING (spring re-arm, 3-5 s, LEAP unavailable) ◀──┘
       └──────────── SAFE-HOLD (fault, thermal, tilt) ── operator reset

  GUARDS ON ARMED → FIRE (all must pass, evaluated locally, no network)
    G1  surface ladder (R02 §05): ToF free distance ≥ gesture requirement
    G2  at rest: tilt < 10°, IMU still for ≥ 500 ms
    G3  quiet hours: only NUDGE/SETTLE inside the window (R02 §06)
    G4  thermal: shell < 41 °C, coil duty within cap (≤1 LEAP / 5 s,
        ≤12 LEAP / h)
    G5  latch cocked (LEAP only)
    G6  surface resonance class (NEW, §06): NUDGE only on a surface
        classified DAMPED; otherwise SETTLE
  Any guard fails → DOWNGRADE to the next-lower gesture
  (LEAP → HOP → NUDGE → SETTLE → no-op). Nothing ever upgrades on its own.
  The rule from R02: fail quiet, never fail forward.

  RECOVER: if post-landing tilt > 25°, up to 2 corrective coil pulses; if
  still tipped, SAFE-HOLD and report. A cube that can't right itself stops
  moving.

--------------------------------------------------------------------------------
05 // F12 — SIGNAL CONTRACT v0.1 (INDEX OF SYSTEMS → CUBE)
--------------------------------------------------------------------------------

  The platform asks for an INTENT. The cube decides the motion. This keeps
  safety on the device and keeps the server ignorant of the furniture.

  DOWNLINK (platform → cube, BLE via the operator's paired device or pad)
    {
      "v": 1,
      "id": "sig_01J…",                 // idempotency key, ULID
      "class": "memory_ready" | "badge_common" | "badge_rare" |
               "assembly_phase" | "cohort_ping",
      "intent": "nudge" | "hop" | "leap" | "settle",   // ceiling, not order
      "priority": 0-3,
      "ttl_s": 3600,                    // expire silently, never queue-storm
      "not_before": "2026-11-11T06:50:00Z"
    }

  UPLINK (cube → platform → QI·46 Calibration Loop)
    {
      "v": 1, "id": "sig_01J…",
      "performed": "settle",            // after downgrade, if any
      "downgrade_reason": "G6_resonant_surface" | null,
      "ack": "touch" | "approach" | "none",   // IMU-detected hand contact /
                                               // ToF-detected approach
      "latency_to_ack_s": 412,
      "surface_class": "damped" | "resonant" | "unknown"
    }

  RULES
    · Mapping class → intent ceiling follows R01 §04 (memory_ready→nudge,
      badge_common→hop, badge_rare→leap, assembly_phase→settle).
      cohort_ping → settle until cohort semantics are specified.
    · At most one pending signal per class; a newer one replaces an older
      one. The cube must never "catch up" with a burst of motion after
      being off the pad — that's what a feed does.
    · "ack" and "latency_to_ack_s" are the haptic-preference signal QI·46
      already expects at Month 12 (pressure, duration, cadence). The uplink
      carries motion telemetry only, never audio and never raw sensor
      streams.

--------------------------------------------------------------------------------
06 // F10 — SURFACE RESONANCE: WHEN "FELT" BECOMES "HEARD"
--------------------------------------------------------------------------------

  R02 B7 says NUDGE must be "perceived through the desk and not heard at
  1 m", in an 80-250 Hz band. A 40 g moving mass is a perfectly good shaker.
  Put it on a hollow-core desk, a thin shelf, or a piano lid, and the
  furniture turns into a loudspeaker. The low modes of many such surfaces
  plausibly sit inside that band (placeholder figures in the script, to be
  measured, not quoted).

  NEW: SURFACE RESONANCE PROBE (runs at placement and once per hour)
    1. Coil emits a 20 ms chirp across 80-250 Hz at 10 % amplitude,
       below the felt threshold.
    2. IMU records the ring-down. Long ring-down / sharp peak → RESONANT.
       Fast decay → DAMPED. Noisy or inconclusive → UNKNOWN.
    3. On DAMPED surfaces NUDGE runs as specified. On RESONANT surfaces
       NUDGE is either shifted to a frequency at least an octave off the
       measured peak (if that stays felt) or downgraded to SETTLE (G6).
       UNKNOWN counts as RESONANT.

  This is the CQGS register taken literally: the object feels the surface
  it sits on before it speaks through it.

--------------------------------------------------------------------------------
07 // VALIDATION PLAN — DELTAS TO R02 §08
--------------------------------------------------------------------------------

  B1  REVISED  Voice-coil force/stroke with a 40 g moving mass.
               PASS: ≥4.4 N mean over 8 mm (or ≥7.1 N over 5 mm).
               Measure transfer: HOP rise vs. coil energy; expect ≈33 %.
  B1b NEW      Battery-as-reaction-mass flex test: 50,000 strokes, no
               resistance drift >10 % on the cell flex.
  B3  REVISED  Spring-latch FOOT PLUNGER: 29-39 mJ stored, ±15 %, 200
               cycles, no creep; delivered body KE ≥23.5 mJ at 45°.
  B9  NEW      Surface resonance probe: 6 surfaces (solid oak, hollow-core
               door, glass, laminate shelf, upright piano lid, MDF
               nightstand). PASS: classification matches a reference
               accelerometer + mic measurement on 6/6, and NUDGE on a
               DAMPED-classified surface is ≤ ambient + 3 dB(A) at 1 m.
  B10 NEW      Signal contract: 1,000 downlink messages with random TTL,
               duplicates, and off-pad gaps. PASS: zero motion bursts
               after reconnect; every expired signal silently dropped.
  Unchanged: B2, B4-B8, and the R01 500/500 close gate.

--------------------------------------------------------------------------------
08 // ROADMAP CHECK — DOES R03 HELP OR HURT v.1-v.3?
--------------------------------------------------------------------------------

  v.1 LONG JUMP   Helped. 150 mm @ 45° = 66 mJ at the body (R02) →
                  ~83-110 mJ stored in the same plunger architecture, a
                  bigger spring and nothing new. Shell target <90 g now
                  needs the coated-core shell (−7 g) and battery-as-mass.
  v.2 SWINGS      Helped. Two angled foot plungers plus the rear ToF are
                  the minimum hardware for directed swing-hops. Reserve
                  their mounting bosses in the v.0 frame now.
  v.3 LEVITATION  Neutral. The magnet-volume reserve and the no-ferrous
                  rule near the base are kept. The voice-coil stator magnet
                  will interact with an under-pad electromagnet array;
                  whoever designs v.3 needs it placed as far from the base
                  as the frame allows. Recorded, not solved.

--------------------------------------------------------------------------------
09 // CONSUMER USE CASE 03 — THE PRACTICE PIANO
--------------------------------------------------------------------------------

(Also appended to LOT-CUBIQ-QUANTUM-CUBE-v0.md §07. Prior entries untouched.)

  Operator profile: Usership tier, adult returning to piano after twenty
  years. Practices 40 minutes most evenings on an upright at home. Phone
  goes in a drawer during practice, because one lit screen on the music
  desk ends the session. Self-care in the Index of Systems includes a
  "practice" ritual the operator added themselves.

  Placement: the CUBIQ™ pad sits on the closed top lid of the upright, the
  only flat surface in reach. The lid is about 250 mm deep. That's enough
  for HOP, and LEAP would pass the edge ladder in one direction.

  On placement the cube runs its resonance probe (§06). The upright's lid
  and soundboard ring long and low: RESONANT. The cube makes three
  decisions without being told:
    · NUDGE is downgraded to SETTLE. At 120 Hz the coil would have played
      a faint B-flat through the soundboard in the middle of a scale.
    · HOP and LEAP are inhibited during the ritual window. A landing thump
      on a piano lid is a drum hit.
    · The uplink reports surface_class = "resonant", so QI·46 learns this
      operator's evening surface is an instrument.

  19:40 — the practice ritual starts. Nothing happens. That's the point.
  20:20 — the 40-minute block ends. The cube does one SETTLE: two seconds of
  standing pressure that comes through the lid as a faint felt weight, not
  as a note. The operator notices it only because their hand is resting on
  the lid between pieces. They play one more piece anyway. The cube doesn't
  repeat itself; ttl and one-pending-per-class (§05) forbid it.
  20:31 — the operator lifts the cube off the lid. The IMU records a
  "touch" ack (latency 11 min). The Memory Engine question that has been
  waiting since 19:55 is held until now. Its delivery hint is "after
  practice", learned from tonight's ack pattern, not from a setting.

  What Use Case 03 proves that 01 and 02 did not: the cube can be WRONG
  about a surface in a way that's audible, and the fix isn't a quieter
  motor. The fix is a cube that listens to the furniture first. Use Case 02
  showed the value of refusing to jump. Use Case 03 shows the value of
  refusing to buzz. It also opens a market adjacent to LOT®'s self-care
  base: musicians, recording-adjacent home studios, and anyone whose desk is
  also an instrument — people for whom every existing notification
  (chime, vibration, light) is the wrong channel.

  Forward note for v.2: on a resonant lid, a slow directed swing that
  ends at the operator's hand would still be "presence without spectacle"
  if it runs only between pieces (IMU sees no keyboard vibration for ≥5 s).
  Recorded as a v.2 gesture candidate: THE INTERVAL.

--------------------------------------------------------------------------------
10 // DECISIONS FOR S-2
--------------------------------------------------------------------------------

  D0  PROCESS — merge R02 + R03 (this branch) to master, or point the
      routine at one long-lived CUBIQ branch. Without this, cycle 04 will
      start again from R01.
  D1' Approve the corrected hybrid drive: voice-coil reaction mass (UP
      stroke, 8 mm, 40 g) for HOP/NUDGE/SETTLE; spring-latch FOOT PLUNGER
      for LEAP/JUMP. Supersedes R01 §03 mechanism text.
  D6  Approve ceramic-filled polymer shell (ceramic as filler/surface).
  D7  Approve surface resonance probe as guard G6 and test B9.
  D8  Approve signal contract v0.1, including "intent is a ceiling" and
      "no catch-up bursts".
  R02 D2-D5 remain open and are compatible with all of the above.

--------------------------------------------------------------------------------
11 // NEXT CYCLE (R04) PROPOSED SCOPE
--------------------------------------------------------------------------------

  · Candidate part shortlist per BOM class, with masses checked against §03.
  · Coil thermal model: duty cap from G4 checked against an 8 mm, 40 g
    moving-mass coil.
  · v.2 pre-study: two-plunger swing-hop kinematics and cross-track error
    budget toward the R01 v.2 gate (<15 mm over 200 mm).
  · Use Case 04 — to be chosen next cycle from themes not yet used.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-R03
================================================================================
