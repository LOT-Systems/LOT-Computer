================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-R02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Engineering Report 02
          Physics Model · Design Review · Test Plan · Use Case 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-05
VERSION:  0.2 — SUPERSEDES NOTHING; EXTENDS LOT-CUBIQ-QUANTUM-CUBE-v0 (0.1)
STATUS:   v.0 — PRE-HARDWARE. DESIGN REVIEW COMPLETE. 5 ERRATA OPENED.
          DESIGN LOCK STILL PENDING — 4 DECISIONS REQUIRED FROM S-2 (§12).
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing, in this order:

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md          (own prior work, 0.1)
    Spec of record for v.0: controlled hop, 45mm cube, <120g, voice-coil +
    piezo bias, IMU + ToF, Qi base, four gestures, roadmap v.0→v.3, Use
    Case 01. Rule inherited from §07: use cases are APPENDED, one per
    cycle, never edited.
  docs/corporate/LOT-CUBIQ-VISION.md        (anti-feed thesis; physical arc)
  docs/corporate/LOT-CUBIQ-OPERATOR.md      (Index of Systems; Phase 4)
  docs/corporate/LOT_QI46_ENGINE.md         (L110 bioelectric domain;
                                              L127 haptic preference as
                                              signal; L750-764 Cube sync)
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md  (L32 Quantum Cube product
                                              row; L180 hardware PLANNED)
  docs/benchmark/LOT-MANIFEST.md            (COSMO® Cube is a separate
                                              hardware track — no overlap)

Finding from the reading: no document in the repository contains a
quantitative model of the cube. Version 0.1 stated targets (40mm, <10mm,
>150mm, <120g) but did not check them against each other. This report does.

HONESTY NOTE
  No hardware exists. Nothing in this report has been bench-tested. Every
  number below is a first-order calculation from ballistics and rough
  component data, labelled CALC (derived) or EST (engineering estimate to be
  confirmed on a bench). Treat them as the test targets for the first
  prototype, not as results.

--------------------------------------------------------------------------------
01 // WHAT THIS CYCLE ADDS
--------------------------------------------------------------------------------

  1. A physics model tying every v.0–v.2 target to energy, launch angle and
     friction (§03).
  2. A design review of 0.1 that found five issues — two of them change the
     hardware (§04).
  3. A revised v.0 reference spec, 0.2 (§05) and gesture parameters (§06).
  4. A test rig and gate plan so "500/500" is measurable (§07).
  5. Levitation triage: one candidate demoted, one promoted (§08).
  6. Safety, regulatory, privacy surface (§09) and risk register (§10).
  7. Use Case 02 — THE BEDSIDE CLOSE (§11).

--------------------------------------------------------------------------------
02 // LOT® INSTITUTE LINEAGE — WHAT THE CUBE INHERITS
--------------------------------------------------------------------------------

  INSTITUTE POSITION                    CUBE CONSEQUENCE
  ─────────────────                     ────────────────
  Anti-feed (VISION §01): invest        Motion is the primary channel; the
  attention, return structure           LED is utility only. No unsolicited
                                        gesture outside the Index signal
                                        table (§06). The cube never "plays".
  Index of Systems is the operator's    Cube telemetry is Index data: stored
  property, exportable (OPERATOR §03)   in the exportable package, deletable,
                                        operator-scoped (§09).
  QI·46 L127: haptic preference         The cube's output is also a
  (pressure, duration, cadence)         measurement: each gesture logs
  is a Calibration Loop signal          amplitude + response so QI·46 can
                                        learn what the operator tolerates.
  QI·46 L110 / CQGS L32: piezo,         v.0 stays inside this named material
  nano-ceramic, haptic language         set (see mass correction, §04 E4).
  Quantum Certified Factory:            Design for repair and measured
  measured cleanness (CQGS §II)         materials; the cube is a hygiene-
                                        grade object, wipeable, sealed.
  Physical products arc                 The cube is a Phase-4 object
  (VISION §05, OPERATOR §04)            delivered by the same AI logic as
                                        the consumables — not a gadget SKU.
  COSMO® Cube is a different track      Naming rule stands: CUBIQ™ is a
  (MANIFEST L31)                        notification body, not a computer.

--------------------------------------------------------------------------------
03 // PHYSICS MODEL (CALC)
--------------------------------------------------------------------------------

Ballistic launch from a flat surface, g = 9.81 m/s², cube mass m, launch
angle θ above horizontal:

    range   R   = v² · sin(2θ) / g
    apex    h   = v² · sin²(θ) / (2g)
    energy  E   = ½ m v²                (kinetic, at lift-off)
    no-slip μ ≥ 1 / tan(θ)              (foot friction needed at launch)

Version 0.1 expressed the Leap's bias as "5–15° off vertical". Off vertical
means θ = 75–85°. Solving for the stated 40mm displacement at m = 120g:

  CASE                m      R      θ     v        E       apex   μ needed
  ────                ─      ─      ─     ─        ─       ────   ────────
  Hop (pure vertical) 120g   ~0     90°   0.44 m/s 11.8 mJ 10 mm  —
  Hop, 5 mm rise      120g   ~0     90°   0.31 m/s  5.9 mJ  5 mm  —
  Leap, 15° off vert  120g   40 mm  75°   0.89 m/s 47 mJ   37 mm  0.27
  Leap, 10° off vert  120g   40 mm  80°   1.07 m/s 69 mJ   57 mm  0.18
  Leap,  5° off vert  120g   40 mm  85°   1.50 m/s 136 mJ  114 mm 0.09
  v.1 long jump 45°   90g   150 mm  45°   1.21 m/s 66 mJ   37 mm  1.00
  v.1 long jump 60°   90g   150 mm  60°   1.30 m/s 76 mJ   65 mm  0.58
  v.1 long jump 30°   90g   150 mm  30°   1.30 m/s 76 mJ   22 mm  1.73
  v.1 stretch 45°     90g   200 mm  45°   1.40 m/s 88 mJ   50 mm  1.00

READINGS
  R1. The Leap is a ~37–57mm vertical rise, not a "<10mm" hop. A 45mm cube
      rises about its own height. The Hop (<10mm) and the Leap are different
      energy classes: 6–12 mJ vs. 47–69 mJ — a 4–6× step, not a dial.
  R2. 5° off vertical is a trap: it needs 136 mJ and 114mm of rise to move
      40mm. The usable bias window is 10–15° off vertical.
  R3. A true "long jump" (v.1) cannot use a near-vertical bias. At 45° it
      needs μ ≥ 1.0 at the foot — elastomer on glass or lacquered wood will
      slip first. 55–60° launch (μ ≈ 0.6) with 76 mJ is the realistic
      envelope. v.1 therefore changes the bias geometry, not just the
      stroke and mass (0.1 said "re-tuned": understated).
  R4. Energy at lift-off is small (≤ 90 mJ for everything through v.1). The
      hard problem is not energy; it is delivering it in ~5–8 ms with the
      right direction, without destroying the shell on landing.

ACTUATOR SIZING (EST)
  Assume 40% electrical→kinetic efficiency (voice-coil + reaction-mass
  impact losses; to be measured):
    Leap  47–69 mJ   → ~120–175 mJ electrical in ~6 ms → ~20–29 W peak
    v.1   76 mJ      → ~190 mJ electrical             → ~30 W peak
  At 3.7 V that is 5–8 A peak. A ~150 mAh LiPo cannot source that safely.
  → v.0 needs a supercapacitor (or ceramic bulk-cap) pulse bank charged
    slowly from the cell. Battery energy is not the constraint (150 mAh ≈
    2 kJ vs. 0.2 J per Leap); pulse current is.

LANDING (CALC)
  Impact speed from a 37mm apex ≈ 0.85 m/s (equivalent to a 37mm drop).
  Low, but a thin rigid ceramic shell corner-landing at 120g is a chipping
  risk. See E4 and the elastomer corner caps in §05.

--------------------------------------------------------------------------------
04 // DESIGN REVIEW OF 0.1 — ERRATA
--------------------------------------------------------------------------------

Each erratum is appended here; the 0.1 text is not edited (see §00 rule).

  E1 — LEAP SPEC INCONSISTENT (affects actuator + gesture table)
    0.1 §03: bias "5–15° off vertical". 0.1 §04: Leap ~40mm displacement.
    §03 above: 5° off vertical needs 136 mJ/114mm rise. RESOLUTION: bias
    window fixed at 10–15° off vertical; Leap energy class 47–69 mJ; Hop
    stays 6–12 mJ. The piezo bimorph alone is unlikely to steer a 120g body
    by 10–15° — see E5 for the geometry alternative.

  E2 — "LANDING RECOVERY BY MICRO-PULSE" IS NOT A RIGHTING MECHANISM
    0.1 §03: if the cube "tips past 25°, a corrective micro-pulse rights
    it". A cube resting on an edge at 25° is not an equilibrium — it falls
    back flat on its own (the tipping point of a cube about an edge is 45°).
    The real failure is TUMBLING: a landing with residual rotation that
    carries the cube past 45° onto an adjacent face. A pulse from a single
    vertical actuator cannot right a cube lying on its side. RESOLUTION:
    recovery becomes PREVENTION — (a) launch with near-zero angular
    momentum (symmetric foot release, pulse centered over the center of
    mass), (b) abort the Leap if pre-launch IMU shows base tilt > 3°,
    (c) accept that a tumble ends the gesture and the cube reports
    "FALLEN" to the Index (an honest signal, not a silent failure).

  E3 — EDGE-DETECTION MARGIN TOO SMALL
    0.1 §03: inhibit if a hop would land within 20mm of an edge. The Leap
    displaces 40mm with landing scatter. If scatter σ is ~10–15mm (EST),
    a 20mm margin puts the 3σ landing past the edge. RESOLUTION: inhibit
    distance = commanded displacement + 3σ(measured) + 10mm. With
    displacement 40mm and σ 12mm that is ≈ 86mm; use 90mm as the v.0
    default for Leap, 30mm for Hop, 0 for Nudge/Settle. The 100/100 edge
    gate (0.1) remains and is tested at the Leap setting. Also: ToF is
    forward-facing only; the bias direction is the only direction the cube
    travels in v.0, so this is sufficient — but the cube must know its
    heading (E2: yaw is passive in v.0, so it is set by how the operator
    places it; see D3).

  E4 — NANO-CERAMIC SHELL BLOWS THE MASS BUDGET
    0.1 §02 shell "nano-ceramic composite", mass <120g. Hollow 45mm cube,
    wall thickness t, ceramic density ρ (alumina ≈ 3.9 g/cm³):
        t = 2.0 mm → ~22 cm³ → ~87 g shell  (alumina)
        t = 1.5 mm → ~17 cm³ → ~66 g
        t = 1.0 mm → ~12 cm³ → ~45 g
    A monolithic ceramic shell consumes 40–70% of the whole budget and is
    brittle on landing. RESOLUTION: shell = polymer or fiber-reinforced
    composite carrying a nano-ceramic surface layer (ρ ≈ 1.8–2.2 g/cm³,
    1.5mm wall → ~30–37 g). The surface remains matte LOT® black and
    ceramic-feeling; ceramic stays the Institute-named material class
    without being the structure. A ceramic shell is retained only for a
    non-jumping display unit (v.0-D, §05).

  E5 — QI CHARGING PAD vs. A CUBE THAT MOVES
    0.1 §02: the Qi pad "IS the table" and the cube hops/swings across it.
    Qi coils tolerate roughly ±5–10mm of misalignment (EST). A 40mm Leap
    leaves the charge field; v.2 walks it away entirely. RESOLUTION: charge
    is a DOCK, not the playfield — a small recessed cradle on the pad that
    the cube hops OUT of (nominal Leap direction away from the cradle) and,
    in v.2, walks back into. In v.0 the cube is returned by hand after a
    Leap; battery life must be sized for that (§05). Independent of E1:
    the 10–15° bias should be produced geometrically (a 10–15° tilted
    actuator axis/foot-cant fixed in the shell) with the piezo used for
    fine trim of the release moment, not as the primary steering force.

  Items E1–E5 are logged as OPEN until a prototype confirms or overturns
  the estimates. None of them is a reason to delay the build; all five are
  cheap to address now and expensive after tooling.

--------------------------------------------------------------------------------
05 // v.0 REFERENCE SPEC — REVISION 0.2
--------------------------------------------------------------------------------

  PARAMETER            0.1                       0.2
  ─────────            ───                       ───
  Form                 45mm cube                 45mm cube (unchanged)
  Shell                nano-ceramic composite    composite structure + nano-
                                                  ceramic surface; 1.5mm wall
  Mass                 <120g                     105 ± 10 g (budget below)
  Feet                 4 elastomer, passive      4 elastomer, cant fixed 10–
                                                  15° (E5); Shore A 40–50
  Corners              —                         12 elastomer edge/corner caps
                                                  (landing protection, E4)
  Actuator             voice-coil + reaction     unchanged; stroke 3–4 mm
                       mass
  Bias                 piezo bimorph             geometric cant (primary) +
                                                  piezo release-timing trim
  Pulse power          unspecified               supercap/bulk-cap bank,
                                                  ≥ 200 mJ usable, 5–8 A peak
  Sensing              IMU + forward ToF         IMU (≥ 1 kHz, logged) +
                                                  forward ToF + base-contact
                                                  proximity (is it on the
                                                  dock / on a surface?)
  Charge               Qi through base           Qi dock cradle (E5), not
                                                  the whole table
  Edge margin          20 mm                     90 mm Leap / 30 mm Hop (E3)
  Radio                —                         BLE to phone/hub; Index
                                                  signal → gesture mapping on
                                                  the device (works offline
                                                  for the last 24h of
                                                  signals)
  Orientation          base face only            DECISION D1 (§12)

  MASS BUDGET (EST)
    Shell + nano-ceramic layer             34 g
    Voice-coil actuator + reaction mass    32 g
    Pulse-cap bank                          8 g
    LiPo ~150 mAh                           4 g
    Qi receiver coil + rectifier            9 g
    MCU/BLE, IMU, ToF, piezo, PCB           8 g
    Feet + corner caps                      5 g
    Fasteners / sealing / margin            5 g
    ───────────────────────────────────────────
    Total                                 105 g   (target 95–115 g)

  UNITS
    v.0-A  Hop/Leap test unit — instrumented, polymer shell, tethered logs
    v.0-B  Operator unit — composite + nano-ceramic surface, sealed
    v.0-D  Display unit — monolithic ceramic, non-actuated (brand object)
           Not a jumping unit; carries the material story without the
           chipping risk.

--------------------------------------------------------------------------------
06 // GESTURE LANGUAGE — 0.2 PARAMETERS
--------------------------------------------------------------------------------

Vocabulary unchanged (0.1 §04). Parameters added so every gesture is a
testable thing. Signal source = Index of Systems (OPERATOR §03).

  GESTURE   SIGNAL                  ENERGY CLASS      EDGE      QUIET RULE
  ───────   ──────                  ────────────      ────      ──────────
  NUDGE     Memory question ready   < 1 mJ, 20–60 Hz  none      allowed in
                                    burst, 0.4 s                  quiet hours
  HOP       Badge: common/uncommon  6–12 mJ           30 mm     blocked in
                                    (5–10 mm rise)              quiet hours
  LEAP      Badge: rare and above   47–69 mJ          90 mm     blocked in
            Session started         (37–57 mm rise)             quiet hours
  SETTLE    Assembly phase advance  hold force only,  none      allowed;
            Day close (UC 02)       ~2 s; no motion              preferred
                                                                 at night

  RULES
    1. One gesture per signal. No repeats, no escalation, no nagging
       (anti-feed). An unacknowledged signal does not become louder; it
       stays queued in the Index until the operator opens it.
    2. Quiet hours (operator-set, default 22:00–07:00): only NUDGE and
       SETTLE run. The cube never makes airborne noise at night.
    3. A rate limit of 6 airborne gestures per hour protects the actuator
       and the operator; excess signals collapse into one NUDGE.
    4. Any inhibit (edge, tilt, off-dock, low charge) downgrades the
       gesture one class and logs the reason. The cube fails quiet, never
       fails loud.
    5. Acoustic target: Hop ≤ 35 dBA at 0.5 m on wood (EST); Nudge
       inaudible beyond 0.3 m. Landing noise is the elastomer feet's job.

--------------------------------------------------------------------------------
07 // TEST PLAN AND GATES
--------------------------------------------------------------------------------

BENCH RIG (v.0-A, build first)
  - Rigid test plate with 3 surface inserts: oak veneer, tempered glass,
    laminate. Edge-less zone for dynamics; separate edge fixture.
  - High-speed camera (≥ 500 fps) from side + top; 1 mm grid.
  - Cube IMU logged at ≥ 1 kHz with the camera synchronized by an LED blink.
  - Load cell under the plate for impulse (force-time) measurement: this is
    the primary measurement of E, not the camera.

TEST STAGES
  T0  Impulse characterization: force-time curve per amplitude step; build
      the E-vs-command lookup. PASS: 10 repeats within ±8% energy.
  T1  Hop: 5/10 mm rise accuracy ±2 mm, zero tilt > 5° on landing; 100
      cycles.
  T2  Leap: displacement 40 ± 12 mm, σ measured (feeds E3); tumble rate.
      PASS: tumble ≤ 1/200 before E2 abort logic is on; 0/500 with it on.
  T3  Edge: 100/100 refusals-to-leap-off at the 90mm Leap margin, from 8
      approach angles; Hop at 30mm. Zero failures allowed.
  T4  Endurance: 500 hop-and-recover cycles (0.1 gate, kept), actuator
      temp < 50 °C at the 6/hour rate limit, then 5,000 cycles for wear
      data on the elastomer feet and corner caps.
  T5  Signal chain: Index signal → phone/hub → BLE → gesture; end-to-end
      latency < 2 s for Nudge/Hop/Leap (EST target); offline replay of the
      last 24 h of signals.
  T6  Surface sweep (wood/glass/laminate) for v.1 friction data, early —
      it is cheap and decides E5/v.1 geometry (R3).

v.0 CLOSE GATE (supersedes 0.1 wording; stricter, same numbers)
  500/500 hop-and-recover cycles, zero off-table landings, zero actuator
  failures, 100/100 edge refusals at the 90mm margin, tumble 0/500,
  displacement 40 ± 12 mm on all three surfaces.

--------------------------------------------------------------------------------
08 // ROADMAP TRIAGE v.1 → v.3
--------------------------------------------------------------------------------

  v.1 THE LONG JUMP     Needs: shell ≤ 90 g (EST — 0.2 reaches 105; the 15 g
                        gap comes from smaller Qi RX, a re-optimized
                        actuator/reaction mass, thinner wall); bias geometry 55–60° (R3); μ ≥ 0.6 feet.
                        Gate (0.1) kept: >150 mm, 9/10 trials, three
                        surfaces, 60 mm target zone. Edge margin scales:
                        150 + 3σ + 10 ≈ 200+ mm — a long jump needs a clear
                        desk. The cube must refuse long jumps on small
                        desks; surface size is sensed by a sweep of the ToF
                        during a calibration "survey" gesture.
  v.2 TABLE WALKING     Unchanged scope (0.1). Added: it also solves E5 —
                        the cube returns itself to the dock. Needs yaw
                        authority (two actuated pads) and 360° ranging
                        (multi-ToF or a scanning ToF).
  v.3 LEVITATION        Triage of the two named directions:
    (a) ACOUSTIC        DEMOTED for the cube itself. Acoustic standing-wave
                        levitation lifts light, small objects (millimeter
                        scale, milligram–gram class). A ~100 g, 45 mm cube is
                        orders of magnitude beyond that regime (EST). Keep
                        only as an Institute display idea — a feather-light
                        token or particle "heartbeat" above the dock — not
                        a cube mechanism.
    (b) MAGNETIC        PROMOTED to the v.3 research candidate. Active
                        electromagnetic suspension with position feedback is
                        an established, demonstrated technique for objects of
                        100s of grams at gaps of 10–30 mm. For a ~100 g cube
                        (weight ≈ 1 N), a HYBRID design is the sensible
                        start: permanent magnets carry the weight; coils trim
                        position, keeping continuous power low (EST: well
                        under 5 W). Open problems: lateral stability, a
                        magnet inside the cube (§09), Qi and levitation
                        sharing the dock, and how "hop" and "float"
                        coexist (a new gesture: THE FLOAT — suspension as
                        the highest-presence SETTLE).
    Pre-v.3 research task (cheap, now): measure how much of the v.0 shell
    and base design is magnet-compatible — keep the cube's lower face free
    of ferrous parts and of a fixed Qi coil position that would block a
    future magnet pocket.

--------------------------------------------------------------------------------
09 // SAFETY · REGULATORY · PRIVACY
--------------------------------------------------------------------------------

  PHYSICAL SAFETY
    - Edge refusal (E3) is a hard gate. Fail-quiet on every inhibit.
    - Pinch/crush: a 120 g body moving at ≤ 1.1 m/s carries < 0.1 J — below
      injury level on skin; no exposed moving parts; sealed.
    - Small-parts/choking: 45 mm cube exceeds the standard small-parts test
      cylinder (~31.7 mm); the corner caps must not be removable. Cube is
      positioned as an adult object, but households have children and pets
      (§10). Child-lock: gestures off when the cube is lifted/handled
      (IMU).
    - Battery: LiPo with protection circuit; pulse bank rated for the peak
      current; UN38.3 transport; no battery access in v.0-B.
    - Magnets (v.3): any neodymium inside the cube changes the risk class
      (ingestion, medical devices). Not a v.0 issue; recorded now.
  REGULATORY (to confirm with a lab before any sales)
    Radio (BLE) and Qi receiver: FCC/CE; electrical/battery product safety
    (e.g. IEC 62368-1 class); whether a motion-active desktop object is
    regulated as a toy in a given market depends on marketing and age
    claims — decision D4. No claims about health effects: the Institute's
    biofield language is brand/research register; the device is marketed
    as a notification object, not a medical or therapeutic device.
  PRIVACY
    - Telemetry = Index data: operator-owned, exportable (FlashDriveManifest
      path), deletable. Cube stores only the signal queue and gesture log.
    - No microphone, no camera in v.0 (ToF and IMU only). The cube does not
      listen to the room. This is a published design promise.
    - BLE pairing is to the operator's account; a second household member
      cannot receive another person's signals.

--------------------------------------------------------------------------------
10 // RISK REGISTER
--------------------------------------------------------------------------------

  ID  RISK                                    L   I   MITIGATION
  ──  ────                                    ─   ─   ──────────
  R1  Cube falls off desk                     M   H   E3 margin; 100/100 gate;
                                                      fail-quiet; dock-first
  R2  Tumble ends on a face with no           H   M   E2 prevention; FALLEN
      sensor/charge access                            signal; D1 (face-agnostic)
  R3  Pet (cat) treats it as a toy / knocks   H   M   IMU "disturbed" mode;
      it off                                          gestures paused; wide
                                                      soft base; honest manual
  R4  Pulse current stresses LiPo             M   H   cap bank; current limit;
                                                      thermal cutoff
  R5  Landing chips surface / damages desk    M   M   Shore 40–50 feet; 3-surface
                                                      test; surface warning
  R6  Novelty decay → drawer object           H   H   Signals only from real
                                                      Index events (no filler);
                                                      UC library below
  R7  Nudge felt as a startle in sleep        M   M   quiet-hours rule; SETTLE
                                                      at night; amplitude cap
  R8  Over-promise (long jump / levitation)   M   H   Gates before claims; §01
                                                      principle: no demo video
  R9  Name/IP collision with COSMO® Cube      L   M   Naming rule (§02)
  R10 Estimates wrong by >2×                  M   M   T0 impulse test first;
                                                      all CALC/EST re-stated
                                                      in R03 with measurements

--------------------------------------------------------------------------------
11 // CONSUMER USE CASES
--------------------------------------------------------------------------------

Per the inherited rule: one new use case per cycle, dated, numbered, never
edited. Use Case 01 lives in LOT-CUBIQ-QUANTUM-CUBE-v0.md §07 (2026-07-28)
and is not repeated. Use Case 02 follows. Capability required is stated so
each case is traceable to a build tier.

  USE CASE 02 — THE BEDSIDE CLOSE                           2026-10-05
  ─────────────────────────────────────────────────────────────────
  Capability tier: v.0 (NUDGE + SETTLE only — no airborne gesture)
  Operator profile: Usership tier, 120+ day engagement, archetype in the
  Diurnal-Arc family (P76 morning-launch · P79 evening-close · P80
  momentum-lock), a shared bedroom, a phone that has lived on the pillow
  for three years.

  THE PROBLEM
    The last screen of the day is the worst one. The operator knows the
    evening close should happen — the LOG entry, the breath, the day's
    last badge check — but the phone is the only door to LOT®, and the
    phone is also the door to the feed. The intention to "do one thing"
    ends forty minutes later in someone else's content.

  WITH CUBIQ v.0
    The cube sits in its dock on the nightstand, at arm's length, with
    the phone charging in the hallway on purpose.
    - 22:10 — the Index detects the evening-close pattern is due (P79:
      time of day, today's log gap, energy capacitor falling). The cube
      performs a SETTLE: a two-second standing pressure from the dock. No
      light, no sound, no motion. Barely a sensation, when the operator
      rests a hand beside it.
    - The operator's partner, asleep six inches away, notices nothing.
      This is the point: the signal exists for one person.
    - The operator reaches over and presses the top face once —
      acknowledging. The cube answers with a single NUDGE through the
      wood. The phone stays in the hallway. The operator speaks
      /breathe aloud to the home hub, or walks to the hallway for ninety
      seconds — a deliberate trip, not a reflex. (Voice/hub path is
      outside v.0 scope; the acknowledge press and the Index signal are
      in scope.)
    - 22:25 — close complete. The cube performs nothing. A closed day
      leaves no residue: no unread count, no streak guilt. The Settle is
      logged as "answered" and the signal queue is empty.

  WHAT HAPPENS ON A SKIPPED NIGHT
    Nothing louder. The Settle does not repeat; the signal waits in the
    Index until morning (RULE 1). The cube never nags a person to bed.

  WHY ONLY THIS CUBE
    A notification you can silence is a notification you still have to
    manage. A light on a nightstand is a screen substitute. A two-second
    pressure that only the person beside it can feel is the anti-feed
    thesis in a form factor: the object invites, the operator decides.

  WHAT THIS CASE REQUIRES FROM v.0
    - SETTLE hold force detectable through a hand at rest, below the
      threshold for waking a sleeper. Test: T0 variant — 12-person
      perception panel, three amplitude steps; target ≥ 90% perceive at
      step 2 with the operator awake, ≤ 5% wake events across the night
      protocol (EST; needs ethics-light protocol, no data leaves the
      panel).
    - Acknowledge input: the top face reads a press via the IMU (tap
      detect) — no new hardware.
    - Quiet-hours rule (§06 RULE 2) enforced on-device.

  LATER TIERS ON THE SAME CASE
    v.2: if the operator leaves the nightstand, the cube can walk to the
    edge nearest the bed — close distance, never leave the surface.
    v.3: THE FLOAT as the closing gesture — the cube hovering a
    centimeter above the dock for the length of the breath, setting down
    when the exercise ends. Not scheduled.

  USE CASE QUEUE (candidate titles for later cycles — not yet written)
    03  THE MEETING TABLE   (focus handoff without a screen, Hop only)
    04  THE KITCHEN HAND-OFF (shared household; two-operator routing)
    05  THE FASTING WINDOW   (Orthodox calendar, Settle at window open)
    06  THE CHILD'S DESK     (guardian-gated; ethics review first)
    07  THE RETURN           (v.2 walk-to-dock after a leap)

--------------------------------------------------------------------------------
12 // OPEN DECISIONS — S-2
--------------------------------------------------------------------------------

  D1  FACE ORIENTATION. A cube has six equal faces; 0.1 puts Qi, ToF and
      LED on one. Either (a) ONE-FACE-DOWN (cheaper; tumbles are fatal to
      function; relies on E2) or (b) FACE-AGNOSTIC (ToF + proximity on four
      sides, Qi coil in the dock center, any face down works; +3–4 g and
      +cost). RECOMMENDATION: (b) for v.0-B, (a) for v.0-A test units.
  D2  SHELL. Accept E4 (composite + ceramic surface) for the operator unit
      and keep monolithic ceramic for the display unit only?
      RECOMMENDATION: yes.
  D3  HEADING. v.0 yaw is passive; direction of a Leap = how the operator
      placed the cube. Accept ("the cube hops away from its marked face")
      or require the dock to set heading by cradle shape?
      RECOMMENDATION: cradle sets heading; Leap points out of the cradle.
  D4  MARKET CLASS. Adult desk object vs. toy-adjacent. Decides labeling,
      test standards and the "child's desk" use case. RECOMMENDATION:
      adult object; no child-targeted claims in v.0.

--------------------------------------------------------------------------------
13 // NEXT CYCLE (R03) — PROPOSED
--------------------------------------------------------------------------------

  1. Decisions D1–D4 recorded.
  2. Replace every CALC/EST in §03 with measured values from the T0 rig, or
     explicitly carry them forward.
  3. Actuator trade study: voice-coil vs. solenoid vs. piezo-stack
     amplified (energy, peak current, acoustic noise, cost).
  4. Firmware spec for the signal→gesture driver (§06 rules as a state
     machine), including the offline queue and rate limiter.
  5. Use Case 03 appended.

--------------------------------------------------------------------------------
APPENDIX A // REPRODUCING THE §03 TABLE
--------------------------------------------------------------------------------

  python3:
    import math
    g = 9.81
    def ball(m, R, th):
        t = math.radians(th)
        v2 = R * g / math.sin(2 * t)           # v^2 from range
        return (v2 ** .5,                       # v   (m/s)
                .5 * m * v2 * 1000,             # E   (mJ)
                v2 * math.sin(t) ** 2 / (2*g) * 1000,   # apex (mm)
                1 / math.tan(t))                # mu needed
    ball(0.12, 0.040, 75)  ->  (0.89, 47, 37, 0.27)

  Vertical hop: v = sqrt(2 g h); E = m g h.
  Shell mass: V = a³ − (a−2t)³, mass = V · ρ, a = 45 mm.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-R02
================================================================================
