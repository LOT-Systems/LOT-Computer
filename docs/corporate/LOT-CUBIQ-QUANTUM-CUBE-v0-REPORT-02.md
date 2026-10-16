================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report 02
          Physics validation · Spec errata · Design-lock candidate
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-16
VERSION:  0.2 — DESIGN-LOCK CANDIDATE (PRE-HARDWARE)
STATUS:   v.0 — ANALYSIS COMPLETE · BENCH BUILD NOT STARTED
SUCCEEDS: LOT-CUBIQ-QUANTUM-CUBE-v0 (v0.1, 2026-07-28) — not edited, only
          extended. Errata are recorded here (Section 03), per the append-only
          rule v0.1 set for itself.
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing (all in this repository):

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md   My own v0.1 spec. The base.
  docs/corporate/LOT-CUBIQ-VISION.md            §05 physical products arc.
  docs/corporate/LOT-CUBIQ-OPERATOR.md          §04 AI-driven delivery,
                                                §07 Phase 4 "Physical Extension".
  docs/corporate/LOT_QI46_ENGINE.md             Layer 0 corpus (l.110: piezo-
                                                electric, nano-ceramic, haptic);
                                                Step 3.3 Quantum Cube sync
                                                (Month 12, haptic-preference signal).
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md   Products row "Quantum Cube —
                                                bioelectric hardware, haptic
                                                feedback, nano-ceramic,
                                                piezoelectric"; status PLANNED.
  docs/corporate/LOT_ROBOTICS_COSMO.md          COSMO® robotics line (separate).
  docs/benchmark/LOT-MANIFEST.md                COSMO® Cube computer track and
                                                the 2026-05 software "Quantum Cube
                                                heartbeat" sessions (src side).
  src/client/stores/intentionEngine.ts          getCircadianPhase() (l.5049) —
                                                the signal source Use Case 02
                                                depends on.

Basis in LOT® Institute work. The Institute corpus names four things this
device is built from: piezoelectric mechanics, nano-ceramic architecture,
haptic feedback language, and the Calibration Loop. Nothing in this report
adds a material or mechanism the corpus does not already name, except where
physics forces it (Section 03) — each such case is marked INSTITUTE-GAP.

Honesty note on sources. The CQGS / Institute papers are a design register
(the object should feel the field it sits in), not engineering validation.
Every number below comes from first-principles mechanics, reproducible with
scripts/cubiq/hop_physics.py. No hardware exists yet. Nothing here is a
measured result.

--------------------------------------------------------------------------------
01 // WHERE v.0 STANDS
--------------------------------------------------------------------------------

  v0.1 (07-28)   Defined the Controlled Hop, four gestures, edge-detection gate,
                 roadmap v.0→v.3, Use Case 01.
  v0.2 (this)    Checks v0.1's numbers against Newtonian mechanics before any
                 part is ordered. Result: the hop is sound; two of v0.1's claims
                 are not. Net effect is a smaller, more honest v.0 and a
                 clearer v.1 prerequisite.

  Verdict by gesture:

    THE NUDGE    Feasible as specified.
    THE HOP      Feasible as specified. 31 mJ hammer energy, ~3 N average force.
    THE SETTLE   Feasible as specified. Power-limited only.
    THE LEAP     NOT feasible as specified (40 mm in one actuator). Re-baselined
                 to 20 mm for v.0; 40 mm moves to the v.1 spring-cam module.

--------------------------------------------------------------------------------
02 // PHYSICS VALIDATION
--------------------------------------------------------------------------------

Model: an internal hammer (mass mr) strikes the shell; momentum is shared
inelastically, so the whole body (M = 120 g) leaves the table at
V = mr·vr/M. Only mr/M of the hammer's kinetic energy ends up in the body, so
hammer energy = body energy × M/mr. Flat surface, no drag, ballistic flight.
M = 120 g (v0.1 target), mr = 45 g (reaction mass).

  GESTURE        RANGE  BIAS  LIFTOFF  APEX  FLIGHT  BODY E  HAMMER E  F_AVG
  ─────────────  ─────  ────  ───────  ────  ──────  ──────  ────────  ──────
  HOP 5 mm         —     0°   0.31 m/s  5 mm   64 ms   5.9 mJ   15.7 mJ  1.6 N*
  HOP 10 mm        —     0°   0.44 m/s 10 mm   90 ms  11.8 mJ   31.4 mJ  3.1 N*
  LEAP (v0.1)    40 mm   5°   1.50 m/s 114 mm 305 ms   136 mJ    362 mJ  24 N**
  LEAP (v0.1)    40 mm  10°   1.07 m/s  57 mm 215 ms    69 mJ    184 mJ  12 N**
  LEAP (v0.1)    40 mm  15°   0.89 m/s  37 mm 174 ms    47 mJ    126 mJ  8.4 N**
  SHORT LEAP     20 mm  25°   0.51 m/s  11 mm  94 ms    15 mJ     41 mJ  4.1 N*
  LONG JUMP v.1 150 mm  35°   1.25 m/s  54 mm 209 ms    70 mJ    141 mJ  7.0 N†
                       (M = 90 g)
  * over a 10 mm stroke   ** over 15 mm   † over 20 mm

Reference for "is that force available": small voice-coil actuators in a
13–16 mm class deliver roughly 1 N continuous and 4–5 N peak for milliseconds.
That puts the Hop and Short Leap inside one voice coil's envelope, and the
v0.1 Leap (8–24 N) well outside it. Confirm with a vendor curve at bench.

  Other numbers the design must respect:

    Cube moment of inertia (45 mm, 120 g)      I ≈ 4.05e-5 kg·m²
    Flight-tumble budget (< 10° in flight)     ω ≤ ~1.9 rad/s, ~78 µN·m·s
    ⇒ Line of action must pass within          ≤ 1.2 mm of the centre of mass
    Foot friction needed at 25° bias           µ ≥ tan 25° = 0.47 (else the feet
                                               slide during the push)
    Landing speed, 10 mm hop                   0.44 m/s (elastomer feet absorb)
    Battery 3.7 V / 150 mAh                    ~2,000 J; at 30 % drive
                                               efficiency, ~1,200 hops/charge
    Settle (2 s at ~0.5 W)                     ~1 J — cheap, not a constraint

--------------------------------------------------------------------------------
03 // ERRATA TO v0.1 — FOUR FINDINGS
--------------------------------------------------------------------------------

v0.1 stays as written (it is the record). These findings supersede it where
they conflict.

  E-01  THE LEAP OVERSHOT ONE ACTUATOR                              [BLOCKING]
        v0.1 asked for ~40 mm displacement from a 5–15° bias. A 5–15°
        off-vertical launch is a 75–85° launch angle, and 40 mm of range at
        that angle costs 47–136 mJ of body energy (apex 37–114 mm, i.e. up to
        2.5 cube-heights of flight). The single voice coil cannot deliver the
        8–24 N required.
        RESOLUTION: v.0 Leap = SHORT LEAP: 20 mm, 25° bias, ~11 mm apex,
        41 mJ hammer energy, ~4 N. Same actuator, same primitive. The 40 mm
        Leap and the 150 mm Long Jump both need a stored-energy mechanism
        (spring + cam released by a catch, wound by a micro gearmotor).
        That module is a v.1 requirement — pull a bench rig of it forward to
        v.0 so v.1 does not start from zero (Section 06, B-5).

  E-02  PIEZOELECTRIC BIAS ELEMENT CANNOT STEER THE HOP             [INSTITUTE-GAP]
        v0.1 used a piezoelectric bimorph firing after release to tilt the
        launch 5–15°. A bimorph moves micrometres and delivers negligible
        impulse next to a ~0.05 N·s hop. Piezo is the Institute-named
        material, so it is kept — but in a role it can do (Section 04):
        landing detection and the Nudge, not steering.
        RESOLUTION: bias is geometric. Tilt the actuator axis 25° off the face
        normal, with the line of action through the centre of mass. No second
        part, no torque, no tumble.

  E-03  A SHELL OF SOLID NANO-CERAMIC DOES NOT FIT THE MASS BUDGET  [BLOCKING]
        A 45 mm cube with 2 mm solid alumina walls is ~86 g by itself —
        72 % of the 120 g budget, leaving 34 g for the actuator, battery and
        electronics. v0.1's "nano-ceramic composite" must therefore be a
        1.5 mm printed polymer shell (PA12, ~17 g) with a nano-ceramic-loaded
        finish or coating (≈ +3 g). It keeps the matte LOT® black surface and
        the Institute material line without the mass penalty.

  E-04  A FALLEN CUBE HAS NO ANSWER IN v0.1                         [HIGH]
        v0.1's "corrective micro-pulse" only rights a tilt below 25°. A cube
        on a side face is as stable as one on its base (a cube's tipping
        angle is 45°), and the single axial actuator now points sideways.
        RESOLUTION: define a FALLEN state (tilt > 45° after landing). In
        FALLEN the cube does nothing mechanical, signals once over BLE, and
        the software shows "CUBIQ is down" in the Index. Mechanical
        self-righting is a v.1 research item (an off-centre ballast cannot
        fix it for a cube; a flip pulse from a second actuator can).

  Also noted (not errata):

  N-01  v0.1 puts the charge pad "as the table" yet Use Case 01 has the cube
        crossing 40 mm of desk toward the keyboard. v.0 resolves this: the
        pad is 200 × 200 mm with a 3 mm raised rim; the cube starts at the
        centre (77 mm to the rim on every side). Leaving the pad is v.2.
  N-02  The v0.1 edge sensor was a single forward ToF. A ToF at the face
        cannot see a table edge ahead, and common parts blind below ~40 mm
        (VL53L1X class). Section 04 replaces it with the pad's geometric
        rim plus down-angled short-range sensors.

--------------------------------------------------------------------------------
04 // v.0 DESIGN-LOCK CANDIDATE
--------------------------------------------------------------------------------

Locked in, pending S-2 approval of Section 08.

  MASS BUDGET — 110 g design, 120 g ceiling
  ─────────────────────────────────────────────────────────────
  Shell: PA12, 1.5 mm walls + nano-ceramic-loaded finish     20 g
  Reaction mass (hammer): tungsten alloy                      45 g
  Voice-coil stator + magnet + guide                          14 g
  LiPo 3.7 V / 150 mAh                                         5 g
  PCB: MCU (BLE), IMU, motor driver, sensors                   8 g
  Qi receiver coil + ferrite                                   4 g
  Piezo disc (landing sensor / Nudge)                          2 g
  Elastomer feet (4)                                           2 g
  Hammer return spring, wiring, fasteners                     10 g
  ─────────────────────────────────────────────────────────────
  Total                                                      110 g   (+10 g margin)

  ACTUATION
    One voice-coil actuator, axis tilted 25° from the base-face normal, line
    of action through the centre of mass (≤ 1.2 mm offset, tested with a
    ballistic pendulum, see Section 05).
    Nudge:  actuator driven below liftoff threshold (< ~1 mJ), 2–4 pulses.
    Hop:    31 mJ hammer, axis vertical (tilt mechanism not engaged — two
            mounting positions, or the Hop is simply fired at reduced energy
            and accepts the 25° tilt; decide at bench, B-2).
    Short Leap: 41 mJ hammer, 25° axis.
    Settle: standing coil bias, no motion, 2 s.

  SENSING
    6-axis IMU at the centre of mass (landing detect, tilt, tumble rate).
    Piezo disc: impact signature on landing, and a second, independent
      "did we actually leave the table" confirmation.
    Edge: the pad's 3 mm rim is the primary, passive barrier. Secondary: four
      down-angled short-range IR/ToF sensors (VL6180X class, 5–100 mm), one
      per side face, watching 10–20 mm beyond the footprint. Edge seen ⇒
      hop inhibited, Nudge substituted. Hard gate: 100/100 edge-approach
      trials, as in v0.1.
    Surface class: pad ID via NFC/magnet code ⇒ PAD / SMALL-SURFACE (Use Case 02).

  FIRMWARE STATES
    IDLE → ARMED → {NUDGE | HOP | SHORT_LEAP | SETTLE} → FLIGHT →
    LAND_DETECT → ASSESS → {OK → IDLE | TILT<25° → RIGHT(≤1 try) → ASSESS |
    FALLEN → notify, lock} ; any state → EDGE_INHIBIT (substitute Nudge).
    Rate limits: default ≤ 1 hop / 60 s, ≤ 40 hops / day (actuator life),
    quiet hours from the Index's circadian phase (Use Case 02).

  HOST CONTRACT (BLE → LOT® Index)
    signal  →  { "class": "memory_question" | "badge_common" | "badge_rare"
                          | "assembly_phase", "ts": ISO8601, "quiet": bool }
    telemetry ← { "gesture", "peak_g", "flight_ms", "tilt_deg_post",
                  "edge_inhibit": bool, "operator_ack_ms" }
    The telemetry feeds the Step 3.3 haptic-preference signal in QI·46
    (pressure, duration, cadence); operator_ack_ms (time from gesture to the
    operator opening the cubic) is the new, easily measured, preference proxy.

  SAFETY / COMPLIANCE (to confirm with a lab, not claims)
    Li-ion: UN 38.3 transport, IEC 62133. Electronics: FCC Part 15 (BLE, Qi RX),
    IEC 62368-1. Not a toy: no marketing to children, and no small-part risk
    claim is made until a pinch/ingestion review is done. Noise targets:
    Nudge < 30 dBA, Hop < 45 dBA, measured at 0.5 m.

--------------------------------------------------------------------------------
05 // TEST PLAN AND GATES
--------------------------------------------------------------------------------

  T-1  Actuator force/stroke curve vs vendor datasheet, 3 candidates.
  T-2  Ballistic pendulum: impulse and line-of-action offset (≤ 1.2 mm).
  T-3  Hop height 10 ± 2 mm on wood, glass, laminate (high-speed video, 960 fps).
  T-4  Short Leap 20 ± 5 mm displacement, cross-track < 8 mm, µ ≥ 0.47 verified
       per surface; slide ⇒ feet compound change.
  T-5  Tumble: post-landing tilt < 10° in ≥ 99/100 hops.
  T-6  Edge: 100/100 approach trials at 20 mm, zero off-pad events, with the
       rim removed (sensors alone) and with sensors disabled (rim alone).
  T-7  Endurance: 500/500 hop-and-recover cycles (v0.1 gate retained),
       zero actuator failures, then 5,000 as stretch.
  T-8  Noise: dBA at 0.5 m per gesture.
  T-9  Qi: charge while idle, no thermal rise > 10 °C in 4 h.
  T-10 End-to-end: Index signal ⇒ gesture ⇒ telemetry ⇒ Index, 50 round trips.

  v.0 CLOSED when T-1…T-10 pass. Fail on T-6 blocks any shipment.

--------------------------------------------------------------------------------
06 // BUILD BACKLOG — THIS CYCLE → NEXT
--------------------------------------------------------------------------------

  B-1  Order three 13–16 mm voice-coil candidates; run T-1.
  B-2  Bench rig (not a cube): vertical hammer in a 45 mm test frame, 25° and
       0° mounts. Settle the Hop-axis question.
  B-3  Print PA12 shell, 1.5 mm; coating trial with nano-ceramic finish; weigh.
  B-4  Firmware skeleton for Section 04's state machine; simulate on a laptop.
  B-5  Spring-cam bench module (gearmotor + catch + 2–6 N·cm spring) sized
       for 141 mJ — the v.1 Long Jump prerequisite. No cube integration.
  B-6  Pad: 200 × 200 mm, 3 mm rim, Qi TX, NFC pad-ID tag.
  B-7  Software side (lot-systems.com): `cubiq.signal` emitter off the existing
       badge / memory / assembly events; telemetry ingest. Not started —
       needs S-2 go-ahead because it touches production code.

--------------------------------------------------------------------------------
07 // ROADMAP — CLARIFIED
--------------------------------------------------------------------------------

  v.0  Nudge · Hop · Short Leap (20 mm) · Settle. Single VCA. Pad is the table.
  v.1  THE LONG JUMP. Adds the spring-cam module (B-5). Shell < 90 g. Targets
       40 mm Leap and 150 mm Long Jump (141 mJ hammer, ~7 N-equivalent over
       20 mm stroke). Adds FALLEN self-righting research (E-04).
  v.2  TABLE-WALKING. Two options, not one — pick at v.1 close:
       (A) Onboard traction pads, as in v0.1: adds mass and a gait model.
       (B) Pad-driven: an electromagnet grid under the pad slides a magnet-
           bearing cube in 2-D with no onboard drive (prior art: MIT Media
           Lab "Actuated Workbench", "Zooids", magnetic tabletop movers).
           Shifts complexity into the pad, which already sits on mains, and
           frees cube mass. Leaves the pad only via (A).
  v.3  LEVITATION — feasibility, stated honestly:
       - Acoustic standing-wave levitation (v0.1 option a): practical for
         particles up to about half the wavelength — ~4.3 mm at 40 kHz. A
         45 mm, 110 g cube is out of reach. Drop option (a) as a full-body
         method.
       - Near-field acoustic levitation (squeeze-film, flat plate): lifts flat
         objects of hundreds of grams on a ~10–100 µm air film. This is not
         visible levitation, but it is nearly frictionless, and it is a real
         tool for v.2 sliding.
       - Active magnetic levitation (v0.1 option b): consumer levitating
         products already float masses of this order at 20–40 mm gaps using
         Hall-sensor feedback and an electromagnet in the base. This is the
         credible path to the named horizon; the pad is already the base.
       Recommendation: v.3 = active magnetic levitation, researched by the
       Institute as a pad-and-cube pair; keep the cube's mass < 120 g and add
       a magnet cavity now so the shell is not redesigned.

--------------------------------------------------------------------------------
08 // DECISIONS REQUESTED FROM S-2
--------------------------------------------------------------------------------

  D-1  Approve the re-baseline: v.0 Leap = 20 mm; 40 mm Leap moves to v.1.
  D-2  Approve PA12 + nano-ceramic finish in place of solid ceramic (E-03).
  D-3  Approve the geometric bias (tilted axis) over the piezo bimorph (E-02).
  D-4  Approve B-7 (touching production code) — or keep v.0 software-free until
       T-1…T-9 pass.
  D-5  Pick v.2 path A or B at v.1 close; B-6 pad layout assumes (B) is open.

--------------------------------------------------------------------------------
09 // CONSUMER USE CASES — THIS CYCLE
--------------------------------------------------------------------------------

Each report adds one new use case. The running list lives in
LOT-CUBIQ-QUANTUM-CUBE-v0.md §07 (append-only); Use Case 02 below is also
appended there.

  USE CASE 01 — THE DESK MIGRATION (2026-07-28, v0.1)  [see v0.1 §07]

  USE CASE 02 — THE SHARED-ROOM NUDGE                          2026-10-16
  ─────────────────────────────────────────────────────────────────────
  Operator profile: Usership tier. Works nights as an ICU nurse, sleeps
  from about 09:00 to 16:00 in a one-bedroom flat shared with a partner who
  wakes at 06:30. Phone is on do-not-disturb all day; the previous
  year's alarm-and-notification setup repeatedly woke the partner.

  The problem. The Index of Systems wants to put one thing in front of this
  operator each day: the memory question, timed to their wake window.
  The software-only cubic cannot do that. A phone buzz is audible, and
  a silent phone is invisible. Both fail the same person for opposite
  reasons.

  With CUBIQ™ v.0: the cube sits on the nightstand pad. The pad's NFC tag
  tells it this is a SMALL-SURFACE: Hop and Short Leap are disabled — a
  nightstand has an edge, a glass of water and a lamp, and the cube refuses
  to leap (Section 04). The Index reads the operator's circadian phase
  (getCircadianPhase) and the shift pattern the Memory Engine has learned.
  At 15:40 — twenty minutes before the usual wake — the cube performs THE
  NUDGE: two sub-threshold pulses, under 30 dBA, felt through the nightstand
  and the mattress frame, inaudible across the room. The operator surfaces,
  sees nothing lit, and the partner, who is awake, hears nothing.
  The Nudge repeats once ten minutes later, never a third time (rate limit).
  On the operator's first morning of the week, it is THE SETTLE instead:
  a two-second standing pressure, no motion at all, the cube saying "assembly
  phase advanced" without waking anyone.

  What the loop learns. operator_ack_ms (how long until the cubic is opened)
  falls from 14 minutes in week 1 to 4 minutes in week 3, and QI·46 shortens
  the lead time from 20 to 12 minutes. The operator never set a preference.

  What this use case forces into the spec: a surface-class mode (v.0 Section
  04), quiet-hours logic keyed to circadian phase, a hard cap of two Nudges per
  signal, and a noise gate in the test plan (T-8). It is also the first
  consumer for whom the cube is an accessibility device as much as a
  notification: the same Nudge serves anyone who cannot rely on sound,
  light or a worn device.

--------------------------------------------------------------------------------
10 // RISKS
--------------------------------------------------------------------------------

  R-1  Voice-coil force at this size may fall short of Section 02 numbers.
       Mitigation: T-1 first; Short Leap is already the low end.
  R-2  The 25° axis may reduce hop repeatability. Mitigation: B-2.
  R-3  Nano-ceramic finish may add mass or crack on landing. Mitigation: B-3.
  R-4  Noise from the hammer strike. Mitigation: damped stop; T-8.
  R-5  The Index emits too many signals and the cube becomes the notification
       feed LOT® exists to replace. Mitigation: rate limits (Section 04) and
       one gesture per signal class, no stacking.
  R-6  Li-ion on a nightstand. Mitigation: IEC 62133 cells, charge-current cap,
       thermal cutoff, T-9.

--------------------------------------------------------------------------------
11 // NEXT CYCLE
--------------------------------------------------------------------------------

  Report 03 will contain: T-1 vendor-curve selection, B-2 rig design, a
  firmware state-machine simulation, and Use Case 03. Candidate for 03:
  a COSMO®-adjacent family case (shared object between parent and child),
  held until the COSMO Gate is consulted.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
================================================================================
