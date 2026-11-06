================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-06
VERSION:  0.2 — ENERGY BUDGET, STATE MACHINE, SIGNAL CONTRACT, TEST PLAN
STATUS:   v.0 — PRE-HARDWARE. ANALYTICAL WORK ONLY. NOTHING IN THIS REPORT
          HAS BEEN BUILT OR MEASURED.
PARENT:   docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md (v0.1, 2026-07-28)
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing this report:

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md   (my own prior output — v0.1)
    Locks: 45mm cube, <120g, one voice-coil actuator + piezo bias strip,
    IMU landing recovery, ToF edge gate, four gestures (NUDGE / HOP / LEAP /
    SETTLE), roadmap v.0→v.3, Use Case 01 (The Desk Migration).
    Its Section 07 instructs: append one new dated use case per cycle,
    never edit prior entries. This cycle follows that rule (Use Case 02 is
    appended to the parent and written out in full in Section 07 below).

  docs/corporate/LOT-CUBIQ-VISION.md, LOT-CUBIQ-OPERATOR.md
    Anti-feed thesis; Phase 4 "Physical Extension"; AI decides
    WHAT/WHEN/HOW to send and signal.

  docs/corporate/LOT-AMBIENT-AI-VISION.md
    The rule this report leans on hardest: hardware widgets follow
    "one line, no alarm, exact moment." Also defines LOT® Station
    (PM2.5 / CO₂ / VOC / T / RH / pressure / UV) and LOT® Brush (brushing
    events). Both are signal sources the Cube can voice. v0.1 did not
    use them; this report does.

  docs/corporate/LOT_QI46_ENGINE.md (line 110, 750-764),
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md (Products rows)
    LOT® Institute basis: Quantum Cube = bioelectric hardware, haptic
    feedback, nano-ceramic, piezoelectric. Month-12 sync: Cube feeds back
    haptic preference (pressure, duration, cadence), usage frequency,
    biofield self-report. Tier note in the CQGS snapshot: Usership $99/mo
    standard, $399/mo priority WITH Quantum Cube sync.

  docs/benchmark/LOT-MANIFEST.md
    COSMO® Cube is a separate hardware track. CUBIQ™ ≠ COSMO® Cube.
    No naming collision introduced here.

HONESTY NOTE ON SOURCES
  The LOT® Institute corpus in this repo names the technology class
  (piezoelectric, nano-ceramic, haptic) and the signal loop. It does not
  contain actuator specs, jump mechanics, or measurements. Everything
  quantitative below is derived here from first-order physics and is a
  design estimate, not Institute data.

--------------------------------------------------------------------------------
01 // WHAT THIS CYCLE ADDS TO v0.1
--------------------------------------------------------------------------------

  1. An energy/kinematics budget for each gesture (Section 02).
  2. A FINDING that the v0.1 roadmap mixes two incompatible launch
     geometries (Section 03) — needs an S-2 decision.
  3. A gesture state machine with explicit refusal and rate-limit rules
     (Section 04).
  4. A signal contract: Index of Systems / Station / Brush → Cube
     (Section 05).
  5. A v.0 verification plan with pass/fail numbers (Section 06).
  6. Use Case 02 — The Closed-Door Study (Section 07).
  7. Risk register and open questions (Sections 08-09).

--------------------------------------------------------------------------------
02 // ENERGY AND KINEMATICS BUDGET (FIRST-ORDER, NO DRAG, RIGID BODY)
--------------------------------------------------------------------------------

Model: point mass m launched at angle θ above horizontal, flat landing.
  range R = v²·sin(2θ)/g      apex H = v²·sin²(θ)/(2g)
  launch energy E = ½·m·v²    flight time T = 2·v·sin(θ)/g
Launch energy is energy delivered to the shell's centre of mass; actuator
energy must be larger by the inverse of drive efficiency (unknown, see
Section 08).

  GESTURE      m       TARGET            v        APEX     E_launch   FLIGHT
  ───────      ───     ──────            ───      ────     ────────   ──────
  NUDGE        120 g   no liftoff        —        0        <1 mJ(*)   —
  HOP          120 g   10 mm rise        0.44 m/s 10 mm    11.8 mJ    ~0.09 s
  LEAP (v0.1)  120 g   40 mm range,      0.89 m/s 37 mm    47 mJ      ~0.17 s
                       15° off vertical
  LONG JUMP    90 g    150 mm range,     1.21 m/s 37 mm    66 mJ      ~0.17 s
  (v.1), 45°           45° launch
  LONG JUMP    90 g    150 mm range,     1.72 m/s 140 mm   132 mJ     ~0.34 s
  (v.1), 15°           15° off vertical
  off vertical

  (*) NUDGE energy is a sub-threshold design target to be set by the
      perception test in Section 06 (T6), not a computed value.

Derived numbers that matter for design:
  - Landing speed of the LEAP (v0.1 geometry) ≈ 0.85 m/s from a 37 mm
    apex. At one LEAP per day a 3-year Usership is ~1,100 landings;
    badge-heavy days could multiply that. The fatigue gate is therefore
    set at 10,000 landings (T3), roughly 9x the nominal lifetime.
  - Tip-over energy of a 45 mm, 120 g cube about one bottom edge ≈ 11 mJ.
    The HOP (11.8 mJ) therefore carries about the same energy as tipping
    the cube over. Any horizontal velocity component or asymmetric launch
    at HOP amplitude can topple it. Vertical-only HOP must be truly
    vertical: keep lateral impulse well under ~1 mJ-equivalent.
  - Energy per LEAP at an assumed 5% electromechanical efficiency ≈ 1 J.
    A 100 mAh / 3.7 V cell stores ≈ 1.3 kJ, so actuation energy is NOT the
    battery constraint; peak current and thermal load in the coil are.

--------------------------------------------------------------------------------
03 // FINDING — THE v0.1 ROADMAP MIXES TWO LAUNCH GEOMETRIES
--------------------------------------------------------------------------------

v0.1 specifies a launch biased only 5-15° off vertical (piezo bias strip)
and later targets a >150 mm single-bound displacement (v.1) by re-tuning
stroke, mass and piezo timing. The numbers above show those do not
combine cheaply:

  - At 15° off vertical, a 150 mm range requires a ~140 mm apex and
    ~132 mJ at 90 g. That is a 140 mm vertical jump for a 45 mm cube: it
    travels 3x its own height in the air. Landing, tipping, noise and
    hearing-the-impact consequences all change.
  - At a 45° launch, the same 150 mm range needs 37 mm apex and 66 mJ —
    half the energy and a gesture that reads as a "long jump" rather than
    a "rocket". But a 45° launch is not "a vertical actuator with a small
    piezo bias". It needs a canted thrust axis or a tilt mechanism.

  CONSEQUENCE
    "Re-tune the same actuator" (v0.1 Section 06, v.1) is not enough for
    the long jump. Either:
      OPTION A — Canted-axis actuator: mount the voice coil at a fixed
                 launch angle (30-45°) for v.1. Costs: needs a defined
                 "front" face; the cube is no longer symmetric; landing
                 recovery must orient it back. Gains: ~2x energy
                 efficiency for range, low apex.
      OPTION B — Keep vertical axis, accept tall hops, use the piezo only
                 for small steering. Costs: 140 mm hops, 2-3x landing
                 energy, louder, more topple risk.
      OPTION C — Pre-launch tilt: the IMU-guided corrective micro-pulse
                 (already in v0.1 for righting) is reused to pitch the
                 cube onto an edge before the main pulse. Costs: two-stage
                 sequence, needs a long settle window (~200-400 ms),
                 repeatability unproven.

  RECOMMENDATION: Option A for v.1, because the v.2 table-walking mode
  needs a defined heading anyway (yaw, traction pads), so a front face
  will be needed by v.2 regardless. This does not change v.0: v.0
  remains a vertical-axis cube. Cost of deciding now: the v.0 shell
  should reserve an internal mounting plane and a marked (non-visible)
  "front" datum so v.1 doesn't need a new enclosure.
  DECISION REQUIRED FROM S-2: A / B / C or "defer to v.0 test data".

--------------------------------------------------------------------------------
04 // GESTURE STATE MACHINE (v.0 FIRMWARE CONTRACT)
--------------------------------------------------------------------------------

States:  CHARGING → IDLE → ARMED → ACTUATING → LANDING_CHECK → (RECOVER) →
         IDLE;  any state → FAULT_LOCKOUT on trip.

  CHARGING          On pad, Qi coupling detected. NO LEAP or HOP is ever
                    executed while on the pad (the pad is the stage, not
                    the charger-in-use). NUDGE and SETTLE permitted.
  IDLE              Awaiting a signal. IMU confirms flat (<3° tilt).
  ARMED             Signal received and passed policy (below). ToF edge
                    scan complete; IMU flat; battery above floor.
  ACTUATING         Gesture runs. Actuator duty-cycle and coil temp
                    monitored.
  LANDING_CHECK     IMU reads post-landing orientation within 400 ms.
                    Upright (<25°): back to IDLE. Tipped: RECOVER.
  RECOVER           At most ONE corrective micro-pulse. If still tipped:
                    FAULT_LOCKOUT (cube stays quiet and reports
                    "tipped" via LED ring; never retries repeatedly).
  FAULT_LOCKOUT     All actuation disabled until operator resets the cube
                    by hand (place on pad). Reasons: edge gate failure,
                    two consecutive unrecovered tips, coil over-temp,
                    battery under floor, unexpected impact/lift (the cube
                    was picked up).

Policy gates that run before every gesture (all must pass):
  P1  HAND PRESENCE   If the IMU shows the cube was lifted or moved by a
                      person in the last 60 s, no HOP/LEAP (NUDGE only).
  P2  EDGE            ToF edge gate from v0.1 (20 mm). Fail → NUDGE
                      instead; never retry with a bigger gesture.
  P3  QUIET HOURS     Operator-set window. Outside it, only NUDGE and
                      SETTLE are permitted, regardless of signal class.
  P4  RATE LIMIT      Max 1 HOP/LEAP per 10 minutes; max 6 per hour; max
                      NUDGE 3 per hour. Excess signals are DROPPED and
                      counted, not queued (queueing creates bursts when
                      the operator returns — the opposite of the anti-feed
                      thesis).
  P5  ESCALATION CAP  A signal class may use at most TWO consecutive
                      gestures. No third. Unacknowledged signals remain
                      in the software Index of Systems only. The Cube
                      never nags.
  P6  BATTERY FLOOR   Below 15%: NUDGE and SETTLE only. Below 8%: LED
                      only.

Acknowledgement: operator "answers" a gesture by (a) opening lot-systems.com
(software ack), or (b) tapping the top face — detected as a short IMU
spike while stationary (hardware ack). Both clear the pending signal.

--------------------------------------------------------------------------------
05 // SIGNAL CONTRACT — INDEX OF SYSTEMS / STATION / BRUSH → CUBE
--------------------------------------------------------------------------------

New in this report: Station and Brush become voiceable signal sources, in
line with the Ambient AI™ rule "one line, no alarm, exact moment."

  SIGNAL SOURCE                  EVENT                         GESTURE
  ───────────────                ─────                         ───────
  Memory Engine                  Question ready                NUDGE
  Badge engine                   Unlock common/uncommon        HOP
  Badge engine                   Unlock rare and above         LEAP
  Self-Assembly                  Phase advanced                SETTLE
  Station (NEW)                  CO₂ above threshold for       NUDGE, then
                                 >10 min, room occupied        SETTLE at +20
                                                                min if still
                                                                above (cap P5)
  Station (NEW)                  PM2.5 above threshold         NUDGE only
  Brush (NEW)                    Morning brushing completed    SETTLE (2 s)
  Brush (NEW)                    Head replacement due          NUDGE (once
                                                                per day)

Rules:
  - Station/Brush signals NEVER trigger HOP or LEAP. Those are reserved
    for earned events (badges). Environmental and hygiene signals are
    quiet by design. This keeps the gesture hierarchy legible: the harder
    the cube moves, the more the operator achieved, never the more the
    system wants something from them.
  - Air-quality gestures are suppressed if the Station reports the
    window opened (CO₂ falling) — don't nudge about a problem already
    being fixed.

Message shape (cloud → cube, via the operator's LOT® hub/phone over BLE or
Wi-Fi; transport open, see Section 09 Q3):

  {
    "v": 0,
    "id": "<uuid>",               // for ack and dedupe
    "src": "memory|badge|assembly|station|brush",
    "class": "question_ready|badge_common|badge_rare|phase|co2|pm25|
              brush_done|brush_head",
    "gesture": "nudge|hop|leap|settle",   // server SUGGESTS
    "expires_at": "<iso8601>",     // cube drops it after this
    "quiet_override": false        // always false in v.0; field reserved
  }

The cube makes the final decision using its own policy gates (Section 04);
the server cannot force a gesture past P1-P6. Telemetry (cube → cloud):

  { "id": "<uuid>", "gesture_done": "...", "dropped_reason": "edge|quiet|
    rate|hand|battery|null", "tilt_after_deg": 0.0, "ack": "none|tap|app",
    "ack_latency_s": 0 }

This is the "haptic preference — pressure, duration, cadence" return
channel from LOT_QI46_ENGINE.md line 757, made concrete. Privacy note:
the IMU stream stays on the device; only the summary above leaves it.

--------------------------------------------------------------------------------
06 // v.0 VERIFICATION PLAN
--------------------------------------------------------------------------------

Gates from v0.1 stay in force (500/500 hop-and-recover, 100/100 edge
trials). This report adds the tests that make those gates meaningful.
Targets are proposals for S-2 approval, not Institute-validated numbers.

  T1  HOP REPEATABILITY      200 HOPs on 3 surfaces (wood, glass,
                             laminate). Rise 10 mm ±3 mm. Lateral drift
                             <5 mm. Zero topples.
  T2  LEAP ACCURACY          100 LEAPs. Displacement 40 mm ±10 mm. Zero
                             topples; ≤2 recoveries.
  T3  SHELL FATIGUE          10,000 LEAP-amplitude landings. No crack,
                             foot detachment, or >5% loss in rise.
                             (Nano-ceramic is hard but brittle: this test
                             is the one most likely to fail first.)
  T4  EDGE GATE              100 approaches at edge distances 10-60 mm,
                             8 headings. Zero edge falls. Counts false
                             inhibits (target <10%) to avoid a cube that
                             never moves.
  T5  ACOUSTICS              Landing noise ≤35 dB(A) at 0.5 m for HOP,
                             ≤45 dB(A) for LEAP. Proposed from a quiet-
                             office baseline; a cube that clacks is a
                             screen with extra steps.
  T6  NUDGE PERCEPTION       10 volunteers, palm on desk, background
                             work. Find the minimum drive amplitude felt
                             ≥9/10 trials but not heard. This sets the
                             NUDGE spec.
  T7  GESTURE LEGIBILITY     Same 10 volunteers: after a 15-minute
                             training, identify NUDGE/HOP/LEAP/SETTLE
                             unprompted ≥80% accuracy.
  T8  POLICY GATES           Fault-injection: lift cube mid-sequence;
                             pad on/off; battery 20%→7%; 12 signals in
                             10 min. Expect zero HOP/LEAP outside
                             policy and ≤ the P4 rate.
  T9  THERMAL                Coil temp rise at max duty <25 °C above
                             ambient; surface touch temp <43 °C.

Bench-first order: T6 and T1 can run on a rough 3D-printed shell with a
bought voice-coil module; do those before any nano-ceramic work.

--------------------------------------------------------------------------------
07 // CONSUMER USE CASES (THIS CYCLE: USE CASE 02)
--------------------------------------------------------------------------------

(Use Case 01 — The Desk Migration — is on record in the parent document
and unchanged. This entry is also appended there per its instructions.)

  USE CASE 02 — THE CLOSED-DOOR STUDY                       2026-11-06
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, studying for a licensing exam,
  4-6 hour sessions in a small room with the door shut. Owns the LOT®
  Station (shelf) and the Cube (on its pad beside the laptop).

  THE PROBLEM
    CO₂ in a closed small room climbs past ~1,000-1,500 ppm in an hour or
    two. Concentration and decision quality drop, and the person rarely
    notices — the drop feels like "I'm just tired / this chapter is
    hard." A phone alert would break the one resource the person is
    protecting, and a red badge is exactly the alarm Ambient AI™ forbids.

  WHAT HAPPENS
    The Station sees CO₂ over threshold for 10+ minutes with the room
    occupied. The Cube performs a single NUDGE — felt through the desk,
    not heard. The operator, mid-paragraph, registers it as "something is
    waiting" and keeps reading. Nothing lights up.

    Twenty minutes later CO₂ is still high. The Cube performs SETTLE —
    a held, standing pressure for two seconds. It is a second, different,
    calmer signal, and the final one (rule P5: two gestures maximum). The
    operator reaches the end of the chapter, taps the top of the Cube
    (hardware ack), and the software shows the single line from the
    Ambient AI™ air-quality widget: "Air quality: open a window for 30
    minutes." They open the door.

    CO₂ falls. The Station reports it. The Cube does nothing — a problem
    that is being fixed gets no further gesture.

  WHY THE CUBE, NOT A PHONE
    - The sense used (touch via the desk) is not the one the study task
      is consuming (eyes + language).
    - The signal does not live in a feed. If the operator ignores it, it
      does not accumulate into 14 alerts; it expires.
    - The escalation cap makes the Cube trustworthy: it will never
      become the thing the operator learns to resent and mute.

  WHAT THIS USE CASE TESTS (v.0 SCOPE)
    - Gesture hierarchy (Section 05): environmental → quiet gestures only.
    - Policy gates P3, P4, P5 working together.
    - Hardware ack path and its telemetry (ack_latency_s) feeding QI·46.
    - Suppression when the Station shows the problem resolving.

  CAVEATS
    - The threshold values (CO₂ ppm, PM2.5) are Station-team
      decisions; this document does not set them.
    - The Cube does not diagnose health. It repeats the Station's
      existing "open a window" recommendation through a different sense.

  CANDIDATE USE CASES FOR NEXT CYCLES (NOT YET WRITTEN)
    - 03: THE MORNING HANDSHAKE — Brush completion → SETTLE, the day's
          first physical acknowledgment (hygiene as ritual).
    - 04: THE SHARED TABLE — two Cubes (household) with directional
          LEAP toward whoever the badge belongs to (v.2 dependent).
    - 05: THE EVENING CLOSE — Self-Assembly phase advance at end of day;
          Cube returns to pad on its own (v.2 table-walking, pad-seeking).
    - 06: THE GIFT — Legacy-tier Cube shipped pre-paired; first gesture
          is the unboxing greeting.

--------------------------------------------------------------------------------
08 // RISK REGISTER
--------------------------------------------------------------------------------

  R1  Cube falls off a desk                    Severity: HIGH
      Mitigation: ToF gate (T4), P2, FAULT_LOCKOUT. A hard-limit
      mechanical option to evaluate: raised 2-3 mm lip on the pad.
  R2  Child or pet interaction                  Severity: HIGH
      Small 45 mm hard object that moves by itself. Needs a
      small-parts/choking review before any consumer shipment; consider
      oversized-radius variant or a "no-hop" household mode. NOT RESOLVED.
  R3  Actuator efficiency worse than the 5% assumed       Severity: MED
      Moves thermals, not battery. T9 will tell.
  R4  Nano-ceramic brittleness at landing       Severity: MED
      T3. Fallback: ceramic-filled polymer shell with ceramic skin.
  R5  Qi charging pad reliability as stage      Severity: LOW
      Conflict: the pad doubles as the hopping surface. Silicone
      grip layer must not detune charging.
  R6  Noise annoyance                           Severity: MED
      T5. P3 quiet hours. Foot compound selection.
  R7  Over-promising (the "demo video" failure named in v0.1 Section 01)
      Mitigation: no public claim of long jump, table-walking, or
      levitation until the relevant gate passes.
  R8  Pace-of-signal creep
      Product pressure to add more signal classes. Counter: Section 05
      rule — the harder the cube moves, the more the operator achieved.

--------------------------------------------------------------------------------
09 // OPEN QUESTIONS FOR S-2
--------------------------------------------------------------------------------

  Q1  Section 03 geometry decision: A (canted axis), B, C, or defer?
  Q2  Is the $399/mo "priority with Quantum Cube sync" tier (CQGS
      snapshot) the intended delivery channel for v.0 units, versus the
      Month-12 Usership milestone in LOT_QI46_ENGINE.md? The two
      documents differ; this report assumes neither.
  Q3  Transport: BLE to the operator's phone/hub, or direct Wi-Fi? BLE
      keeps the cube low-power; Wi-Fi removes the phone dependency.
  Q4  Household mode (R2): does v.0 ship with a "no-hop, NUDGE-only"
      switch? Recommend yes.
  Q5  Levitation research ownership: which Institute workstream takes the
      v.3 acoustic vs. magnetic study? Not needed for v.0.

--------------------------------------------------------------------------------
10 // NEXT-CYCLE WORK QUEUE
--------------------------------------------------------------------------------

  1. Resolve Q1 and Q4. Update v0.1 spec accordingly.
  2. Bench test plan T6 + T1: source a voice-coil module and a 3D-printed
     45 mm shell; log rise vs. drive pulse.
  3. Write firmware state machine as a pure-function simulator (no
     hardware) so P1-P6 can be unit-tested against synthetic signal
     streams (T8 in software first).
  4. Draft Use Case 03 (The Morning Handshake).
  5. v.3 levitation literature pass (acoustic vs. magnetic), as research
     notes only, no commitments.

================================================================================
PREPARED FOR S-2 REVIEW // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
================================================================================
