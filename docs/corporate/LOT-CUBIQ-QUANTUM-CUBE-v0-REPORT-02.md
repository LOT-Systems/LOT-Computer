================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-17
VERSION:  0.2 — PHYSICS BUDGET, BOM, TEST PLAN, USE CASE 02
STATUS:   v.0 — PRE-HARDWARE, ANALYTICAL VALIDATION COMPLETE, BENCH BUILD NEXT
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing (in full unless noted):

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md   (REPORT 01 — the spec; this
      report is its engineering continuation. Use Case 01 "The Desk
      Migration" preserved untouched; Use Case 02 is appended there too.)
  docs/corporate/LOT-CUBIQ-VISION.md, LOT-CUBIQ-OPERATOR.md
  docs/corporate/LOT_QI46_ENGINE.md      (cube = Month-12 input device)
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md  (piezo / psychotronic register)
  docs/corporate/LOT-AMBIENT-AI-VISION.md  (Ambient AI™; LOT® Station air
      quality signal; "No alarm. No red badge." — the register for Use Case 02)
  docs/benchmark/LOT-MANIFEST.md   (COSMO® Cube is a separate hardware track)

Between 2026-07-28 and today no hardware artifacts, CAD, firmware or test
data were committed for CUBIQ™. This report therefore does the work that
can honestly be done pre-hardware: it checks whether the REPORT 01 numbers
are physically self-consistent, sets the energy/power budget, and defines
the bench build and tests that close the v.0 gate.

--------------------------------------------------------------------------------
01 // EXECUTIVE SUMMARY
--------------------------------------------------------------------------------

  1. The v.0 architecture (one voice-coil impact actuator + piezo bias +
     IMU + ToF edge gate) is feasible on a <120 g, 45 mm cube.
  2. Three REPORT 01 numbers are NOT mutually consistent as written
     (Section 02). None is fatal; each needs a one-line spec amendment.
     Amendments are proposed in Section 07, not silently applied.
  3. The energy needed is small (~50-70 mJ per full "Leap"). Battery is not
     the constraint; PEAK POWER and IMPACT DURABILITY are.
  4. The v.1 "long jump" (>150 mm) cannot be reached by the piezo bias
     alone; it needs an angled launch mechanism. This changes the v.0 shell
     design now, cheaply, rather than at v.1 expensively.
  5. Use Case 02 ("The Open Window") is added: Ambient AI™ air-quality
     signal from the LOT® Station delivered as a physical gesture.

--------------------------------------------------------------------------------
02 // PHYSICS BUDGET — CHECKING THE v.0 NUMBERS
--------------------------------------------------------------------------------

Assumptions: m = 0.120 kg (REPORT 01 mass target), g = 9.81 m/s², ideal
projectile (no air drag; negligible at these speeds), flat surface, elastic
feet ignored for takeoff. R = horizontal displacement, θoff = launch angle
off vertical (REPORT 01 bias: 5-15°).

  2.1  THE HOP  (<10 mm rise, lands in place)
       E = m·g·h = 0.12 × 9.81 × 0.010 = 11.8 mJ
       Takeoff speed v = √(2gh) = 0.44 m/s; flight time ≈ 90 ms.
       -> Easy. Within a small voice coil's single stroke.

  2.2  THE LEAP  (REPORT 01: ~40 mm displacement, 5-15° bias)
       Range R = v²·sin(2θ)/g with θ = 90° − θoff (angle above horizontal)

       θoff   takeoff v   kinetic E   apex height   flight time
        5°    1.50 m/s    136 mJ      114 mm        305 ms
       10°    1.07 m/s     69 mJ       57 mm        215 ms
       15°    0.89 m/s     47 mJ       37 mm        174 ms

       FINDING A: a 40 mm displacement at a 5-15° bias implies an APEX of
       37-114 mm — the "Leap" is a tall, steep arc, not a skim. REPORT 01
       reads it as a gentle forward hop. Either (a) accept a 40-110 mm-high
       arc (visible, ~0.2 s flight, theatrical, and a bigger landing shock),
       or (b) raise the bias angle to ~30-40° off vertical for a flatter,
       lower arc. Recommendation: (b) — see Section 07, A1.

  2.3  LANDING LOAD
       Dropping from a 57 mm apex gives ~1.06 m/s impact; with a 2 mm elastomer
       stroke that is ≈ 28 g average deceleration (a ~280 m/s² pulse over
       ~4 ms). Electronics must be potted and the IMU must tolerate ≥ 16 g
       range with saturation recovery. Specify a ±16 g part, not ±4 g.

  2.4  V.1 LONG JUMP CHECK  (>150 mm, shell <90 g)
       Needs ~66 mJ at a 45° launch (apex 38 mm), ~77 mJ at 30° off vertical
       (apex 65 mm). With a 5-15° piezo bias the same 150 mm would need
       > 400 mJ and a > 250 mm apex — impractical.
       FINDING B: the v.1 target is only reachable with a genuinely angled
       impulse (30-45° off vertical). Design the v.0 base with a swappable
       or tilt-able strike plate so v.1 reuses the same actuator.

  2.5  ACTUATOR AS DESCRIBED
       REPORT 01 says the reaction mass is driven "down against the base
       face." Pure reaction (accelerating a mass inside a sealed shell)
       produces zero net takeoff until the mass impacts the shell. The
       workable form is an IMPACT (hammer) actuator: the slug accelerates
       over its stroke, strikes the base plate, and transfers momentum in
       ~2 ms.
       Momentum needed for a 10° Leap: p = m·v = 0.12 × 1.07 = 0.128 N·s.
       A 30 g slug must reach ~4.3 m/s; mean force over 2 ms ≈ 64 N.
       Energy stored in the slug ≈ 0.5 × 0.03 × 4.3² = 277 mJ at 100%
       transfer; at an assumed 25-30% end-to-end efficiency, budget
       ~250 mJ electrical per Leap (see Section 03).

--------------------------------------------------------------------------------
03 // POWER BUDGET
--------------------------------------------------------------------------------

  Per Leap, electrical:        ~250 mJ  (conservative, 28% efficiency)
  Per Hop:                     ~60 mJ
  Per Nudge / Settle:          <5 mJ

  Battery: 3.7 V, 120 mAh LiPo ≈ 1.6 kJ -> > 6,000 Leaps per full charge.
  Battery is a non-issue. The constraint is PEAK POWER:
     250 mJ delivered in ~8 ms = ~31 W peak. A 3.7 V cell cannot source
     that cleanly through a small protection circuit.
  -> Use a supercapacitor/ceramic-capacitor bank (e.g. 2 × 0.47 F at 5 V ≈
     11.8 J nominal; only ~3% is used per Leap) charged at ≤ 300 mA, then
     discharged through a MOSFET H-bridge. Charge time between Leaps ≈ 1-2 s.
  -> Qi base-face charging (REPORT 01 §02) must be time-shared: the hop
     driver is INHIBITED while the Qi receiver is in power transfer, or the
     cube will jump off its own charger. (Spec gap, now closed: Section 07, A3.)

--------------------------------------------------------------------------------
04 // v.0 BILL OF MATERIALS (REFERENCE, PROTOTYPE GRADE)
--------------------------------------------------------------------------------

  Block            Part class                          Notes
  ───────────────  ──────────────────────────────────  ──────────────────────
  MCU + radio      Cortex-M4F BLE 5 SoC                Signal in over BLE from
                                                       hub/phone; no Wi-Fi in v.0
  Actuator         Voice-coil impact module, ~30 g     Strike plate is separate
                   slug, 8 mm stroke                   part (v.1 tilt option)
  Bias element     Piezo bimorph, angle-mounted        Fires ~1 ms after release
  Driver           MOSFET H-bridge + gate driver       Current-limited, with
                                                       shoot-through protection
  Energy store     2 × supercap 0.47 F / 5 V           Section 03
  Battery          LiPo 120 mAh + protection IC        Primary store
  Charging         Qi receiver coil, base face         Hop inhibited while charging
  IMU              6-axis, ±16 g / ±2000 dps           Landing detect + righting
  Edge sensor      ToF, 4 m class, forward + 1 rear    Rear added: see A2
  Shell            Nano-ceramic composite, potted      45 mm, <120 g all-in
  Feet             4 × elastomer, Shore 40A            Passive in v.0

  Mass roll-up (target): shell 28 g, slug+coil 42 g, caps+battery 24 g,
  PCB+sensors 12 g, feet+misc 6 g = 112 g. Margin 8 g. Tight but credible.

--------------------------------------------------------------------------------
05 // FIRMWARE ARCHITECTURE
--------------------------------------------------------------------------------

  States: IDLE -> ARMED (caps charged, edge check clear) -> FIRE ->
          FLIGHT (IMU free-fall detect) -> LAND -> VERIFY -> (RIGHT) -> IDLE

  Rules (all HARD gates; any failure aborts to the in-place "shudder"):
    1. Edge gate: no ToF return within 20 mm of any hop vector. No valid
       ToF reading = no hop (fail closed, not open).
    2. Charge gate: not in Qi power transfer.
    3. Tilt gate: IMU gravity vector within 10° of vertical at fire time.
    4. Rate limit: ≤ 1 Leap per 10 s, ≤ 20 per hour. A notification device
       that hammers the desk becomes the thing it replaced.
    5. Quiet hours: honor the Index of Systems schedule; default NUDGE only.
    6. Watchdog: any actuator fire > 15 ms duration is cut in hardware.

  Telemetry returned per event (feeds QI·46 haptic-preference signal,
  LOT_QI46_ENGINE.md line 757): gesture id, fire energy, flight time,
  landing displacement estimate (IMU double-integration, ±20%), righting
  needed (bool), and operator-touch latency (capacitive wake on shell,
  optional).

  Signal mapping (unchanged from REPORT 01 §04): Memory question -> NUDGE;
  badge common/uncommon -> HOP; rare+ -> LEAP; assembly phase -> SETTLE.
  New in Use Case 02: environmental advisory -> "THE LEAN" (Section 08).

--------------------------------------------------------------------------------
06 // TEST PLAN AND GATES
--------------------------------------------------------------------------------

  T0  Bench actuator: slug on a load cell. Measure impulse vs drive voltage;
      target 0.128 N·s ±10% repeatable over 100 shots.
  T1  Tethered hop rig: cube on a linear guide, high-speed camera (≥ 500 fps)
      to confirm rise height and flight time against Section 02 table.
  T2  Free-hop, three surfaces (wood, glass, laminate), 100 shots each.
      Measure displacement and heading scatter. Record elastomer wear.
  T3  Edge gate: 100/100 approach trials at 10 approach angles (REPORT 01
      hard gate). Include glossy black, transparent glass and matte edges;
      ToF performs worst on glass/black — test them first.
  T4  Landing/righting: 500 consecutive hop-and-recover cycles with zero
      off-table landings and zero actuator failures (REPORT 01 v.0 gate).
  T5  Charger interlock: 50 trials proving no hop while on a Qi pad.
  T6  Drop/shock: 1 m drop onto wood, 6 faces, no loss of function.
  T7  Acoustic: Hop < 35 dBA at 30 cm. A quiet room hears a click; the whole
      point is "felt through the desk."

  v.0 CLOSES WHEN T3, T4, T5 pass and T2 shows < 20 mm scatter on all
  surfaces. T6/T7 are required before any unit leaves the lab.

--------------------------------------------------------------------------------
07 // PROPOSED SPEC AMENDMENTS TO REPORT 01  (for S-2 decision)
--------------------------------------------------------------------------------

  A1  Raise the Leap bias from 5-15° to ~30-40° off vertical, giving a flatter
      arc (apex ~15-25 mm for 40 mm range) and making v.1 a tuning step, not
      a redesign. Cost: piezo bimorph alone is insufficient; use an angled
      strike plate with piezo as fine trim.
  A2  Add one rear-facing ToF. A cube that can be nudged or rotate between
      hops can hop backward off an edge; forward-only sensing is not enough
      even in v.0.
  A3  Add the Qi-interlock (Section 03) and the rate limiter (Section 05)
      to the v.0 hard gates.
  A4  Specify IMU range ±16 g (Section 02.3).
  A5  Correct the actuator description from "reaction mass" to
      "impact actuator" (Section 02.5).

--------------------------------------------------------------------------------
08 // CONSUMER USE CASES
--------------------------------------------------------------------------------

  USE CASE 01 — THE DESK MIGRATION                          2026-07-28
  See LOT-CUBIQ-QUANTUM-CUBE-v0.md §07 (unchanged).
  Signal: Memory question ready. Gesture: NUDGE then LEAP toward keyboard.

  USE CASE 02 — THE OPEN WINDOW                             2026-10-17
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier ($99/month) with the LOT® Station on the
  windowsill and a CUBIQ™ on a bedside/work desk in a small apartment.
  Autumn; the heating is on, windows are shut, and the operator is absorbed
  in a long writing session.

  The LOT® Station reports CO₂ climbing past 1,400 ppm (Ambient AI™:
  LOT-AMBIENT-AI-VISION.md, Air Quality Widget). Today that is one quiet
  line of text on a screen the operator is not looking at. In a closed-lid,
  deep-work session it is never seen, and the air keeps getting worse; the
  operator experiences it only as afternoon fatigue they blame on
  themselves.

  With CUBIQ™: the Index of Systems fires an environmental advisory. The
  cube performs THE LEAN — a new, deliberately slow gesture built from the
  existing primitives: a three-beat NUDGE pattern (long-short-long) followed,
  if CO₂ is still above threshold 10 minutes later, by a single HOP in the
  direction of the window (heading from the Station's location, v.2 once
  directed travel exists; in v.0 an in-place HOP plus the pattern).
  No light. No sound. No badge. Repeats at most once per 30 minutes, and
  stops the moment the Station reports CO₂ falling.

  The operator feels the pattern through the desk, recognizes it (they set
  its meaning once during pairing) and opens the window for 30 minutes
  without leaving the work. 20 minutes later the Station reports CO₂ below
  900 ppm and the cube performs a SETTLE: two seconds of light standing
  pressure, the "thank you" of the system, then silence.

  Why this belongs to the cube, not the screen:
    - Environmental hazards are invisible; a physical, peripheral cue is the
      natural match. Same register as Ambient AI™: "A quiet recommendation
      in the same typeface as everything else", translated from typeface
      into touch.
    - It extends the cube from a PERSONAL notifier (Use Case 01: the
      operator's memory) to an ENVIRONMENTAL one, the first step toward the
      QIoT™ direction named in the Ambient AI™ vision.
    - Consumer value is concrete and measurable: time-above-threshold on
      CO₂ before vs. after cube adoption, reported back through the
      Section 05 telemetry loop.

  Open questions for Use Case 02:
    - Do operators habituate to a repeating pattern? Test with the rate
      limiter and a rotating pattern set.
    - Safety escalation (CO, smoke) must NOT ride the cube. It stays on
      certified, audible, life-safety devices. The cube is advisory only.
    - Required sensor data path: Station -> hub -> Index of Systems -> cube.
      v.0 mock: scripted CO₂ trace replayed over BLE to the bench unit.

  USE CASE 03 — TO BE APPENDED NEXT CYCLE.
  Candidates already scoped in the corpus, for next session's pick:
    (a) LOT® Brush: morning-routine completion closes with a SETTLE
        (LOT-AMBIENT-AI-VISION.md, hardware ecosystem).
    (b) Cohort resonance ping: two operators' cubes synchronize NUDGES
        (OPERATOR.md, resonance signals).
    (c) Focus session: cube "sits out" (SETTLE only) during Do-Not-Disturb
        and Pomodoro blocks, announcing only the end of the block.

--------------------------------------------------------------------------------
09 // ROADMAP DELTA AND NEXT ACTIONS
--------------------------------------------------------------------------------

  v.0  Status: analytical validation done. Next: T0 actuator bench (needs one
       voice-coil module, a load cell and a drive board — ~1 week of bench
       time). Decision needed from S-2 on amendments A1-A5.
  v.1  Unchanged target (>150 mm, <90 g). Dependency: A1 angled strike plate.
  v.2  Unchanged. Added dependency: rear/side ToF (A2) and Use Case 02's
       directed HOP both want the v.2 traction model.
  v.3  Levitation: research track unchanged. Practical note — at 112 g, the
       acoustic route (standing-wave node, ~ a few grams max payload in
       published demonstrations) is orders of magnitude short of a 112 g
       cube. Flagging honestly: acoustic levitation of THIS cube is not
       credible without a ≥ 10× mass reduction; the active-magnetic route is
       the only one with a plausible path and needs its own feasibility doc.
       Stated as engineering judgment, not a measured result.

  This session produced no hardware or measured data. Every figure above is
  an analytical estimate from stated assumptions and should be treated as
  such until T0-T2 are run.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
================================================================================
