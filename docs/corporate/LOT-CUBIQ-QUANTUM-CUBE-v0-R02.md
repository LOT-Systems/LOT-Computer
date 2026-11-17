================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-R02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report 02
          Mechanism Review, Energy Budgets, Architecture Revision A
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-17
VERSION:  0.2 — DEVELOPMENT CYCLE 02
PARENT:   docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md (v0.1, 2026-07-28)
STATUS:   v.0 — PRE-HARDWARE · ARCHITECTURE REV A PROPOSED · DESIGN LOCK PENDING
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG — WHAT THIS CYCLE WAS BUILT ON
--------------------------------------------------------------------------------

Read in full before writing, in this order:

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md         (v0.1 — cycle 01, own prior work)
    The parent spec. Locks: 45mm cube, <120g, nano-ceramic shell,
    Qi charging pad = the table, voice-coil + piezo-bias "controlled hop",
    6-axis IMU landing recovery, ToF edge gate, four-gesture language
    (NUDGE / HOP / LEAP / SETTLE), roadmap v.0 → v.3, Use Case 01
    ("The Desk Migration"). Section 07 instructs every future cycle to
    append one new consumer use case without editing prior ones.

  docs/corporate/LOT-CUBIQ-VISION.md
    Anti-feed thesis: "LOT® invests attention and returns structure."
    Physical products as the completion of the cubic, not a pivot.

  docs/corporate/LOT-CUBIQ-OPERATOR.md
    §03 Index of Systems (signal source). §04 AI-driven physical product
    delivery — WHAT / WHEN / HOW. §07 Phase 4 "Physical Extension".

  docs/corporate/LOT_QI46_ENGINE.md
    LOT® Institute corpus line items: "piezoelectric mechanics,
    nano-ceramic architecture, biofield theory, haptic feedback
    language" (l.110). Quantum Cube sync = Month-12 milestone; cube
    reports haptic preference (pressure, duration, cadence) (l.750-764).
    /corpus/institute/ and /corpus/bioelectric/ are the filing targets
    for Institute material.

  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md
    institute.lot-systems.com white paper. "Quantum Cube — bioelectric
    hardware, haptic feedback, nano-ceramic, piezoelectric" (l.32).
    "Quantum Cube Hardware — PLANNED" (l.180). Quantum Certified Factory:
    the object should feel the field it sits in.

  docs/corporate/LOT-AMBIENT-AI-VISION.md
    LOT® hardware ecosystem already named: LOT® Station (weather + air
    quality) and LOT® Brush (connected toothbrush). QIoT™ = physical
    signal fused with behavioral signal. Hardware rule: "one line, no
    alarm, exact moment." Ambient AI "does not send push notifications.
    It waits." — CUBIQ™ is the one sanctioned physical exception, and
    only because motion at the edge of awareness is not a push.

  docs/corporate/LOT_ROBOTICS_COSMO.md
    COSMO® robotics is a separate brand (Kuzya). CUBIQ™ is a
    notification body, not a robot and not a computer. Confirmed: no
    naming or scope collision introduced this cycle.

New in this cycle: no prior document contains energy, force, stroke,
or mass-budget numbers for the cube. Cycle 02 supplies them and, in
doing so, finds one problem in the v0.1 mechanism that must be fixed
before design lock (Section 02).

--------------------------------------------------------------------------------
01 // CYCLE 02 SUMMARY — FIVE LINES
--------------------------------------------------------------------------------

  1. v0.1's "reaction mass driven DOWN against the base" cannot lift the
     shell efficiently. Rev A replaces it with a base-face THRUST FOOT.
  2. Required jump energies are tiny (12 mJ hop, 47 mJ leap, 88 mJ long
     jump) but the 10-14 ms takeoff window needs 15-35 N — beyond any
     voice coil that fits a 45mm cube. Rev A stores energy in a spring
     and releases it with a cam: a CAM-SNAP CATAPULT.
  3. The voice coil stays — repurposed for NUDGE, SETTLE and a NEW
     fifth gesture, THE DRIFT: stick-slip horizontal motion. Horizontal
     surface swings start in v.0, not v.2.
  4. A small yaw REACTION WHEEL footprint is reserved in v.0 so that
     spin-in-place, self-righting and v.2 directed swings need no
     re-layout.
  5. Levitation research narrows to ACTIVE MAGNETIC levitation over the
     pad (feasible at 120g / 10-20mm with known consumer-grade methods).
     Acoustic levitation of the full cube is ruled out; ultrasonic
     SQUEEZE-FILM glide is kept as a v.2 friction-killer.

--------------------------------------------------------------------------------
02 // MECHANISM REVIEW — WHY v0.1 MUST CHANGE
--------------------------------------------------------------------------------

  v0.1 TEXT
    "A single vertical linear actuator ... drives a spring-loaded
    internal reaction mass downward against the base face. Newton's
    third law does the rest — the shell leaps."

  THE PROBLEM
    While the cube sits on the table, pushing an internal mass DOWN
    pushes the shell UP — but the table is already under the shell, so
    the downward stroke ends when the mass hits the base, and the
    momentum is dumped into the table. Nothing leaves the surface. To
    leap with an internal mass, the mass must move UP and strike a top
    stop (impact-driven jumping). That works, but its efficiency is
    bounded by the mass ratio:

        fraction of mass energy that becomes jump energy = m_mass / M_total

    With a 30g mass in a 120g cube: 25%. The other 75% is noise and heat
    in the shell — the opposite of "quiet, controllable".

  REV A — THE THRUST FOOT
    A 10g foot plate sits flush in the base face. The actuator drives it
    DOWN, through the base, against the table. The table pushes back on
    the 110g body directly. When the foot reaches its end stop it is
    dragged along. Efficiency bound:

        fraction ≈ (M_total − m_foot) / M_total  ≈  110 / 120  ≈  92%

    This is how small jumping robots and jumping insects work: push the
    ground, don't shake the body. The foot plate also doubles as the
    Qi receive-coil carrier (Section 06), so it costs almost no mass.

  BIAS (FORWARD COMPONENT)
    The v0.1 angled piezo bimorph is kept, but its job changes. Instead
    of firing "a millisecond after release" (too late — takeoff lasts
    only ~10-14 ms, Section 03), the bimorph TILTS THE FOOT PLATE 5-15°
    BEFORE release. The thrust vector is then off-vertical from the
    first microsecond. Piezo bimorphs are slow-force / fast-response —
    exactly right for pre-positioning, wrong for propulsion. This keeps
    the Institute's named piezoelectric technology in the cube doing the
    work it is good at.

--------------------------------------------------------------------------------
03 // ENERGY AND FORCE BUDGET (BALLISTIC, NO DRAG)
--------------------------------------------------------------------------------

  Constants: g = 9.81 m/s². Thrust stroke s = 6 mm. Mass M = 120g (v.0)
  and 90g (v.1 target). Takeoff time t ≈ 2s / v.

  GESTURE / TARGET              ANGLE   v_takeoff  KE @120g  KE @90g  APEX   t_off
  ────────────────              ─────   ─────────  ────────  ───────  ────   ─────
  HOP   — 10 mm rise            90°     0.44 m/s   12 mJ     9 mJ     10mm   27 ms
  LEAP  — 40 mm displacement    75°     0.89 m/s   47 mJ     35 mJ    37mm   14 ms
  LONG  — 150 mm (v.1)          45°     1.21 m/s   88 mJ     66 mJ    38mm   10 ms
  RIGHTING — roll over an edge  —       —          11 mJ     8 mJ     —      —

  Notes:
    - A 150mm long jump at 45° has the same apex height (~38mm) as the
      40mm LEAP. The long jump is not "higher", it is "flatter". This
      means v.1 ToF edge-gating looks the same distance up, but 4× as
      far forward.
    - Long-jump flight time ≈ 175 ms. Slow enough to be seen, fast
      enough to read as deliberate. Good for the "peripheral vision"
      principle.

  FORCE
    Average thrust over 6mm = KE / s + body weight:
        LEAP  ≈ 47 mJ / 6 mm + 1.2 N ≈  9 N
        LONG  ≈ 88 mJ / 6 mm + 1.2 N ≈ 16 N  (peak ≈ 2× average)
    A voice coil that fits a 45mm cube produces low single-digit
    newtons continuous. It can do HOP. It cannot do LEAP reliably and
    cannot do LONG at all. Energy is not the constraint; POWER over
    10 ms is.

  REV A — CAM-SNAP CATAPULT
    A compression spring under the thrust foot stores the energy slowly;
    a cam releases it all at once.
        Spring sized for 100 mJ at 6mm   → k ≈ 5.6 N/mm, peak 33 N
        Charge time with a micro gearmotor at ~0.1 W mechanical → ~1 s
    A micro gearmotor turns a single-lobe cam. The cam compresses the
    spring as it turns and drops off its edge at top-dead-centre: the
    spring fires. No latch, no solenoid, no extra part to fail. Jump
    strength is set by WHERE the cam is allowed to stop before release
    (partial-lobe profile) — one motor, continuous amplitude from HOP to
    LONG. The 1 s charge is not a defect: it is the cube "taking a
    breath" before it moves, which the notification language uses
    (Section 05).

  BATTERY
    At ~25% wall-to-jump efficiency, a LONG costs ~0.35 J. A 300 mAh
    3.7V cell holds ~4,000 J → >10,000 long jumps per charge. Standby
    (BLE + IMU wake-on-motion) dominates the budget, not motion. The
    cube lives on its charging pad; battery size is set by
    "off-pad for one day", not by jump count.

--------------------------------------------------------------------------------
04 // ARCHITECTURE REV A — STACK
--------------------------------------------------------------------------------

        TOP FACE   ┌──────────────────────────────┐
                   │ reserved: magnet volume (v.3)│  ← 8mm, kept empty in v.0
                   │ yaw reaction wheel footprint │  ← populated v.0b / v.2
                   │ MCU + BLE · 6-axis IMU (CoM) │
                   │ LiPo 300 mAh                 │
                   │ voice coil (NUDGE/DRIFT)     │  ← horizontal, angled 20°
                   │ gearmotor + single-lobe cam  │
                   │ compression spring           │
                   │ piezo bimorph tilt flexure   │
        BASE FACE  │ thrust foot + Qi coil · ToF  │
                   └──────────────────────────────┘

  MASS BUDGET (v.0 target 120g)
    Shell (core + ceramic coating) ...... 38g
    Battery ............................. 7g
    PCB + MCU/BLE + IMU + ToF ........... 9g
    Gearmotor + cam + spring ............ 16g
    Thrust foot + Qi coil ............... 10g
    Voice coil + moving magnet .......... 14g
    Piezo bimorph + flexure ............. 4g
    Elastomer feet, fasteners, wiring ... 8g
    Reserve (reaction wheel v.0b) ....... 14g
    ─────────────────────────────────────────
    TOTAL ............................... 120g

  SHELL MATERIAL — DECISION NEEDED
    v0.1 specifies nano-ceramic. Monolithic ceramic is brittle; the v.0
    gate is 500 landings. Rev A recommendation: glass-filled polymer
    core (impact) + nano-ceramic surface coating (feel, look, Institute
    material line). The ceramic is the skin the operator touches; the
    polymer is the skeleton that survives the landing. If S-2 requires
    solid ceramic, the 500-cycle gate must be re-run with drop data
    before design lock.

  IMU — STAY 6-AXIS
    v0.1 chose 6-axis (no magnetometer). Rev A confirms this as a
    deliberate choice: the v.3 levitation magnet and the Qi coil would
    corrupt a magnetometer anyway. Heading for v.2 comes from gyro
    integration + ToF landmarking against the pad.

--------------------------------------------------------------------------------
05 // HAPTIC NOTIFICATION LANGUAGE — v0.2
--------------------------------------------------------------------------------

  The four v0.1 gestures are kept unchanged in meaning. One is added.
  Each gesture now names its actuator.

  GESTURE      ACTUATOR             MOTION                           TRIGGER SIGNAL
  ───────      ────────             ──────                           ──────────────
  THE NUDGE    voice coil           sub-threshold tremor, felt        memory question
                                    through the desk, not seen         ready
  THE HOP      cam-snap (25%)       <10 mm vertical, lands in place   badge (common/uncommon)
  THE LEAP     cam-snap (55%)       ~40 mm forward bias               badge (rare+)
                + piezo tilt
  THE SETTLE   voice coil (DC hold) 2 s standing pressure, no motion  assembly phase advanced
  THE DRIFT    voice coil           stick-slip glide, 1-3 mm/s,        ambient / QIoT signal
   (NEW)        (sawtooth drive)    up to 30 mm, silent               (LOT® Station, Brush)

  THE BREATH (not a gesture — a preamble)
    The ~1 s cam charge before HOP / LEAP is audible only as a very
    faint motor hum. Firmware precedes every jump with a NUDGE so the
    operator's body knows motion is coming. Nothing leaves the table
    without a warning felt through it.

  WHY THE DRIFT MATTERS
    Stick-slip drive: the voice coil pushes the internal magnet slowly
    one way (static friction holds the cube) and snaps it back fast
    (inertia overcomes friction, the cube slips). Net result: a slow,
    silent glide across the table. This is the first horizontal
    surface-swing capability, available in v.0 with no new part. It is
    the gesture for signals that should be noticed hours later, not
    seconds later: the cube is simply somewhere slightly different on
    the desk than where you left it. Ambient AI's "it waits" — made
    physical.

  RATE LIMIT (HARD)
    ≤ 1 airborne gesture per 20 minutes, ≤ 6 per day, zero between the
    operator's sleep window (from circadian data) unless they opt in.
    A cube that jumps every time a badge unlocks becomes a toy, then an
    annoyance, then a drawer object. Scarcity is the feature.

--------------------------------------------------------------------------------
06 // CHARGING PAD = THE TABLE — REV A DETAILS
--------------------------------------------------------------------------------

    Pad diameter      160 mm (gives a 150mm v.1 long jump a landing zone
                      only if the cube starts at the pad edge — v.1 will
                      need a larger "field" pad or desk-surface landing)
    Pad surface       micro-textured, known friction coefficient — the
                      DRIFT gesture is calibrated against the pad first,
                      against wood/glass/laminate second
    Pad edge          raised 1.5 mm lip, IR-reflective — gives the ToF
                      sensor a guaranteed edge return even on glass desks
    Dock alignment    the cube re-docks itself after a DRIFT or LEAP:
                      Qi coupling strength is the "am I home" signal
    Reserved          coil volume under the pad for v.3 levitation array

--------------------------------------------------------------------------------
07 // FIRMWARE — v.0 STATE MACHINE
--------------------------------------------------------------------------------

    DOCKED_IDLE ──signal──▶ ARBITRATE ──denied (rate/sleep)──▶ QUEUE
                                │                                │
                             allowed                     re-evaluate on
                                ▼                        next window
                           PRE-NUDGE (warning)
                                │
                                ▼
                         EDGE_CHECK (ToF) ──fail──▶ DOWNGRADE to NUDGE
                                │ pass
                                ▼
                       CHARGE (cam) / DRIVE (coil)
                                │
                                ▼
                          FLIGHT / GLIDE (IMU log 1 kHz)
                                │
                                ▼
                          LAND ──tilt>25°──▶ RIGHT (coil pulse / wheel)
                                │
                                ▼
                       TELEMETRY → QI·46 Calibration Loop
                                │
                                ▼
                       RE-DOCK (DRIFT toward Qi max) → DOCKED_IDLE

  LINK
    BLE to the operator's LOT® app session; the app forwards Index of
    Systems signals as {signal_class, priority, ttl}. The cube decides
    gesture locally — the server never says "jump", it says "something
    rare happened". This keeps the safety gates and rate limits on the
    device, where they cannot be bypassed by a server bug.

  TELEMETRY PAYLOAD (per gesture → QI·46 "haptic preference", l.757)
    gesture, amplitude, takeoff_ms, flight_ms, landing_tilt_deg,
    displacement_mm, operator_touch_within_s (IMU detects a pick-up),
    time_to_session_open_s. The last two are the real signal: did the
    gesture bring the operator back, and did they reach for the object.

--------------------------------------------------------------------------------
08 // LEVITATION RESEARCH TRACK — v.3 NARROWED
--------------------------------------------------------------------------------

  (a) ACOUSTIC LEVITATION OF THE WHOLE CUBE — RULED OUT
      Standing-wave acoustic levitation holds objects much smaller than
      the wavelength (mm-scale, gram-scale). A 45mm, 120g cube is far
      outside that regime. Closed for the full-body case.

  (a') ULTRASONIC SQUEEZE-FILM — KEPT, RE-SCOPED TO v.2
      A flat plate vibrating ultrasonically against a flat surface
      floats on a micron-scale air film. If the cube's base (or the
      pad) is driven this way, friction drops toward zero and the
      DRIFT gesture becomes a true glide. Not levitation to the eye —
      but it is the first time the cube will not be touching the table.
      This is the most honest bridge from v.2 to v.3, and it reuses
      piezoelectric drive — Institute material line again.

  (b) ACTIVE MAGNETIC LEVITATION — PRIMARY v.3 DIRECTION
      A permanent magnet in the cube's top/bottom reserved volume,
      an electromagnet array + Hall sensors in the pad, closed-loop
      control at kHz rates (a static magnet arrangement alone can never
      be stable — Earnshaw's theorem — so active control is mandatory).
      Consumer levitating objects of a few hundred grams at 10-20mm gaps
      exist; 120g at 15mm is inside that envelope. Wireless power at a
      15mm gap is also established. Open questions for the Institute:
        - Can the cube leave the levitation field (jump) and be
          RE-CAPTURED mid-air? (Landing into levitation.)
        - Does the pad magnet array interfere with Qi charging?
          (Time-multiplex or resonant power at a different frequency.)
        - Stray field safety near cards, pacemakers, watches: define
          a max field at 50mm from the pad surface before any prototype.

  (c) DIAMAGNETIC — PARKED
      Passive diamagnetic levitation of a 120g object needs impractical
      field strength at room temperature. Parked, not deleted.

  DECISION FOR S-2
    Approve (b) as the v.3 mechanism of record and (a') as a v.2
    research task. This lets v.0 freeze the 8mm magnet volume and the
    pad coil volume with a specific purpose instead of "just in case".

--------------------------------------------------------------------------------
09 // v.0 PROTOTYPE PLAN — P0 → P2
--------------------------------------------------------------------------------

  P0  BENCH RIG (no shell)       Thrust foot + spring + cam on a rail.
                                  Measure KE vs cam stop angle. Prove
                                  HOP→LEAP range on one motor.
                                  EXIT: 12 mJ and 47 mJ hit ±10%, 50/50.
  P1  OPEN-FRAME CUBE            3D-printed frame, real mass budget,
                                  IMU, ToF, voice coil. First NUDGE,
                                  DRIFT and HOP on the pad.
                                  EXIT: DRIFT ≥ 20 mm on pad, 20/20;
                                  edge gate 100/100 (v0.1 hard gate).
  P2  SHELLED CUBE               Coated shell, Qi, BLE, firmware state
                                  machine, real Index of Systems signals
                                  from a test operator account.
                                  EXIT: v0.1 gate — 500/500 hop-and-
                                  recover, zero off-table, zero actuator
                                  failures — PLUS 500 landings with no
                                  shell chip.

--------------------------------------------------------------------------------
10 // RISK REGISTER
--------------------------------------------------------------------------------

  ID   RISK                                   LIKELIHOOD  IMPACT  MITIGATION
  ──   ────                                   ──────────  ──────  ──────────
  R1   Spring fatigue drifts jump energy      MED         MED     IMU closes the loop: measured
                                                                   flight time trims cam stop angle
  R2   Ceramic shell chips on landing         HIGH        HIGH    polymer core + ceramic skin (§04)
  R3   DRIFT fails on glass / high-friction   MED         LOW     calibrate per surface; pad first
  R4   Cam motor noise breaks "quiet"         MED         MED     pre-NUDGE masks it; damped gearbox
  R5   Cube leaves desk                       LOW         HIGH    ToF gate, pad lip, rate limit,
                                                                   on-device authority (§07)
  R6   Notification fatigue → drawer object   HIGH        HIGH    hard rate limits, DRIFT as default
  R7   Child / pet treats cube as toy         MED         MED     pick-up detection pauses airborne
                                                                   gestures 10 min; no small parts
  R8   Levitation magnet vs Qi vs IMU         MED         MED     6-axis IMU (no mag); reserved
                                                                   volumes fixed now (§04, §08)

--------------------------------------------------------------------------------
11 // CONSUMER USE CASES — CUMULATIVE LOG
--------------------------------------------------------------------------------

  01  THE DESK MIGRATION      2026-07-28  Home desk · Memory question ·
                                           NUDGE → LEAP            (see v0 §07)
  02  THE NAP-TIME TABLE      2026-11-17  Kitchen table · QIoT air
                                           quality + self-care · DRIFT → SETTLE
                                                                   (this cycle)

  USE CASE 02 — THE NAP-TIME TABLE                          2026-11-17
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, parent of an 8-month-old, Archetype
  "Quiet Keeper", works part-time at the kitchen table during the
  baby's two afternoon naps. LOT® Station on the windowsill. LOT® Brush
  in the bathroom. Phone face-down on silent — any sound can wake the
  baby, and every app on the phone knows only one way to get attention:
  sound, buzz, light.

  14:10. The baby goes down. The operator opens the laptop. The CUBIQ
  pad sits by the fruit bowl, the cube docked on it.

  14:52. LOT® Station reports CO₂ climbing past threshold — the
  kitchen is closed up for warmth, two people breathing in it for hours.
  The Ambient AI™ rule says one line, no alarm. On screen, the Air
  Quality widget would say "open a window for 30 minutes" — but the
  operator is not looking at LOT®, they are in a spreadsheet.

  The cube performs THE DRIFT. No hop — airborne gestures are blocked
  because firmware knows (from the operator's own nap-window setting)
  that this is a quiet window. Silently, over about twenty seconds, it
  glides 25 mm off its dock, toward the window side of the pad. No
  sound. No light. The operator does not notice it happen.

  15:05. They reach for an apple and see the cube is off its dock,
  angled toward the window. They know what that means — they set the
  meaning themselves during onboarding: "drift to the window = air."
  They crack the window. Done. The cube, sensing Qi coupling drop and
  no new signal, drifts itself home.

  15:40. A second signal: the self-care module notes the morning LOT®
  Brush event never arrived — the morning was chaotic; it happens. This
  is not urgent and not shameful. The cube performs THE SETTLE: two
  seconds of standing pressure, felt only if a hand is on the table.
  The operator's hand is on the table. They smile, finish the paragraph,
  and when the baby wakes at 16:00 they brush their teeth while the
  baby watches from the bouncer — which, it turns out, the baby loves.

  What the telemetry loop learns (§07): DRIFT → action in 13 minutes;
  SETTLE → action in 20 minutes; zero airborne gestures; zero sounds.
  QI·46 records "quiet-window parent: prefers DRIFT, tolerates SETTLE,
  never LEAP before 16:00." The next day the cube is already quieter.

  WHAT THIS USE CASE PROVES FOR v.0
    - The most valuable v.0 gesture for this operator is the one with
      no liftoff at all. Horizontal surface motion (DRIFT) is not a v.2
      luxury; it is a v.0 requirement. This is why Rev A adds it.
    - The cube is the first LOT® hardware OUTPUT for LOT® Station and
      LOT® Brush signals — QIoT™ closing a loop into the physical room
      without a screen.
    - The operator-assigned meaning ("drift to the window = air") shows
      the notification language must support per-operator DIRECTIONAL
      semantics. v.0 firmware stores up to 4 direction→meaning pairs
      relative to the pad's ToF-visible lip marker.
    - Speaks directly to LOT-CUBIQ-VISION §04's "real fathers and
      mothers feel of being needed": an object that helps a tired
      parent take care of the room and themselves without ever making
      a sound near a sleeping child.

--------------------------------------------------------------------------------
12 // DECISIONS REQUESTED FROM S-2
--------------------------------------------------------------------------------

  D1  Approve Rev A thrust foot + cam-snap catapult (replaces v0.1
      reaction-mass mechanism).                                   [ ]
  D2  Approve THE DRIFT as the fifth v.0 gesture.                  [ ]
  D3  Shell: polymer core + nano-ceramic skin, or solid ceramic
      with extra drop testing.                                     [ ]
  D4  Reserve reaction-wheel footprint (14g) in v.0.               [ ]
  D5  Levitation mechanism of record = active magnetic (b);
      squeeze-film (a') moves to v.2 research.                     [ ]
  D6  Hard rate limits (§05) as non-overridable firmware policy.   [ ]

--------------------------------------------------------------------------------
13 // NEXT CYCLE (03) — PLANNED SCOPE
--------------------------------------------------------------------------------

  - P0 bench-rig drawing set: cam profile (stop angle → energy curve),
    spring selection, thrust-foot guide geometry.
  - Stick-slip DRIFT model: drive waveform vs. friction coefficient
    for pad / wood / glass / laminate.
  - Signal schema draft: Index of Systems → {signal_class, priority,
    ttl} map, and where it lives in the LOT® server.
  - Use Case 03 — a new operator, a new room, a new signal.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-R02
================================================================================
