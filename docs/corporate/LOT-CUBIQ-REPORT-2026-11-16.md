================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-REPORT-2026-11-16
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-16
CYCLE:    02 (previous: 01 — LOT-CUBIQ-QUANTUM-CUBE-v0.md v0.1, 2026-07-28)
SPEC:     docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md → bumped to v0.2
STATUS:   v.0 — ACTUATOR ARCHITECTURE REVISED, ENERGY BUDGET CLOSED ON PAPER,
          FIRMWARE + PROTOCOL v0 DEFINED, STILL PRE-HARDWARE
================================================================================

  Every number in this report is a first-principles paper estimate. No
  prototype exists yet. Nothing here has been measured on a bench. Where a
  number is a target rather than a result, it is labelled TARGET.

--------------------------------------------------------------------------------
00 // READING LOG — WHAT WAS READ BEFORE WRITING
--------------------------------------------------------------------------------

  OWN PRIOR WORK
    docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md (v0.1, 2026-07-28)
      The v.0 spec from cycle 01. 45mm cube, <120g, voice-coil reaction
      mass + piezo bias, four-gesture language (NUDGE / HOP / LEAP /
      SETTLE), IMU landing recovery, ToF edge gate, v.0→v.3 roadmap, Use
      Case 01 "The Desk Migration". This report audits it, corrects it
      where the physics did not hold, and extends it.

  LOT® INSTITUTE CORPUS (institute.lot-systems.com, as mirrored in repo)
    docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md
      Quantum Cube = "bioelectric hardware, haptic feedback, nano-ceramic,
      piezoelectric". Usership tiers: $399/mo priority tier carries
      "Quantum Cube sync". Quantum Cube hardware row: PLANNED, Month 12+.
    docs/corporate/LOT_QI46_ENGINE.md
      Layer 0 corpus includes "LOT® Institute white papers — CQGS, Quantum
      Cube, bioelectric philosophy" and "haptic feedback language".
      Step 3.3: Quantum Cube delivered at month 12; returns haptic
      preference (pressure, duration, cadence), usage frequency, biofield
      response into the Calibration Loop.
    docs/corporate/LOT-CUBIQ-VISION.md
      §05: physical products are "the completion of the cubic".
    docs/corporate/LOT-CUBIQ-OPERATOR.md
      §03 Index of Systems — 15 signal sources incl. "cohort".
      §07 Phase 5 "Community Resonance" — "they are not alone in the
      cubic". This is the hook for Use Case 02 below.
    docs/corporate/LOT_ROBOTICS_COSMO.md
      COSMO® — Kuzya's robotics line. CUBIQ™ stays a notification body,
      not a robot; but the parent/child lineage informs Use Case 02.
    docs/technical/WIDGETS.md
      Software Quantum Cube is already "the system heartbeat" of the
      Self-Assembly view. Hardware heartbeat should mirror that state.

--------------------------------------------------------------------------------
01 // CYCLE 02 SUMMARY — WHAT CHANGED SINCE v0.1
--------------------------------------------------------------------------------

  #   CHANGE                                              EFFECT ON SPEC
  ──  ──────────────────────────────────────────────────  ──────────────
  1   Hop mechanism corrected: "mass driven DOWN against   §03 revised
      base" does not by itself lift the shell. Replaced
      by an UPWARD-STRIKE internal mass (§02 here).
  2   Direct voice-coil drive cannot meet the LEAP energy  §03 revised
      budget in a 45mm cube. Split actuation:
      SPRING-LATCH for HOP/LEAP, VOICE-COIL for
      NUDGE/SETTLE/recovery.
  3   New safety rule: ZERO STORED ENERGY AT REST. The     §03 added
      spring is only wound in the ~1.5s before a jump.
  4   Forward bias by piezo "kick" retired as primary;     §03 revised
      bias comes from a 6° tilted strike axis. Piezo
      kept as the NUDGE/texture emitter.
  5   v.0 gains an INPUT gesture: THE TAP (IMU tap         §04 added
      detection). Needed for Use Case 02.
  6   Firmware state machine + CUBIQ-LINK v0 packet        §05 added
      format defined.
  7   Levitation track down-selected: ACTIVE ELECTRO-      §06 revised
      MAGNETIC levitation is primary; acoustic retired
      for a ~100g body. v.0 reserves mass + volume for it.
  8   Use Case 02 — THE PAIRED CUBES.                      §07 appended

--------------------------------------------------------------------------------
02 // ACTUATION PHYSICS — THE ENERGY BUDGET
--------------------------------------------------------------------------------

  2.1  WHY v0.1 NEEDED CORRECTING
    A closed body cannot move its centre of mass without an external
    force. The only external force available on a table is the table's
    normal reaction (and friction). v0.1 described a mass driven DOWNWARD
    against the base face. That pushes the cube into the table and stops;
    no net upward momentum results unless the mass then rebounds.

    The working principle (used in published internal-mass hopping
    robots) is the reverse:

      1. Internal reaction mass m_r sits at the BOTTOM of its stroke.
      2. It is accelerated rapidly UPWARD. Reaction pushes the shell DOWN
         into the table; the table pushes back. The floor impulse is what
         adds upward momentum to the system.
      3. The mass hits an upper hard-stop. The collision couples mass and
         shell; the whole cube leaves the table at
             v_launch = (m_r / M) · v_r
         where M is total mass and v_r the mass speed at impact.
      4. Energy efficiency of that inelastic coupling ≈ m_r / M.

  2.2  REFERENCE NUMBERS (M = 120 g, m_r = 40 g, η_couple ≈ 0.33)

    GESTURE   TARGET MOTION              v_launch  KE_cube  KE_mass needed
    ────────  ─────────────────────────  ────────  ───────  ──────────────
    HOP       10 mm vertical rise        0.44 m/s   12 mJ    ≈ 35 mJ
    LEAP      40 mm forward, 75° launch  0.89 m/s   47 mJ    ≈ 141 mJ
              (apex ≈ 37 mm)
    v.1 JUMP  150 mm, 45° launch,         1.21 m/s   66 mJ    ≈ 150 mJ
              M = 90 g, m_r = 40 g                             (η ≈ 0.44)
              (apex ≈ 37 mm)

    Read-across: the v.1 long jump needs roughly the SAME stored energy as
    the v.0 LEAP, because the v.1 shell is lighter and launches at 45°.
    The v.0 spring is therefore sized once, for ~160 mJ, and carried
    forward. This is the "nothing in v.0 is thrown away" principle made
    numerical.

  2.3  WHY NOT VOICE-COIL DIRECT DRIVE FOR LEAP
    LEAP: m_r must reach 2.66 m/s within an ~8 mm stroke.
      average acceleration ≈ v² / 2s ≈ 440 m/s² (≈45 g)
      average force         ≈ 0.04 kg × 440 ≈ 18 N, peak higher
    A voice coil that fits a 45mm cube alongside battery and electronics
    is realistically a few newtons. Direct drive is short by ~5×.

  2.4  v0.2 ACTUATOR ARCHITECTURE — SPLIT ACTUATION
    A. SPRING-LATCH (HOP, LEAP)
       - Compression spring, k ≈ 5,000 N/m, 8 mm working stroke
         → ½kx² ≈ 160 mJ max; HOP uses partial wind (~3.5 mm).
       - Wound by a micro gear-motor + lead screw over ~1.0–1.5 s.
       - Released by a latch pin (solenoid or SMA-wire release).
       - Wind depth = amplitude control. Firmware sets it per gesture.
    B. VOICE-COIL (NUDGE, SETTLE, landing recovery)
       - Low-force, high-bandwidth. Drives the same reaction mass for
         sub-liftoff tremors and the 2s standing-pressure SETTLE.
       - Corrective "righting" pulse after an off-axis landing.
    C. PIEZO BIMORPH (texture)
       - Demoted from launch-bias to texture emitter: high-frequency
         grain on top of NUDGE, so two NUDGE patterns can be told apart
         by touch. Keeps the Institute-named piezoelectric element in the
         product for the right job.

  2.5  FORWARD BIAS
    The strike axis is tilted 6° from vertical inside the shell. Launch
    angle then falls out of geometry, not timing. Direction is fixed in
    v.0 (the cube's "face"). v.2 rotates the cube in yaw before jumping
    to aim, which is the bridge to table-walking.

  2.6  LANDING
    LEAP descends from ~37 mm → impact ≈ 0.85 m/s.
    Four elastomer feet (Shore ~40A) + internal mass returning on its
    damper. TARGET: impact noise ≤ 45 dBA at 1 m on solid wood; no
    bounce > 3 mm; upright landing ≥ 95% before righting pulse, 100%
    after.

--------------------------------------------------------------------------------
03 // SAFETY DOCTRINE (v0.2 ADDITIONS)
--------------------------------------------------------------------------------

  S1  ZERO STORED ENERGY AT REST
      The spring is never left wound. Wind → fire happens inside one
      gesture window (< 2 s). If the fire is inhibited after winding, the
      motor UNWINDS; the latch is never released into an inhibited state.
  S2  EDGE GATE (from v0.1, unchanged)
      Forward ToF; no hop if landing zone is within 20 mm of an edge.
      Substitute: NUDGE. 100/100 edge-approach trials to pass.
  S3  HAND / LIFT GATE
      IMU detects "held" (no stable gravity vector, or rotation). All
      launch gestures inhibited while held or within 3 s of being set
      down. A cube must never jump out of a hand.
  S4  SURFACE GATE
      Launch only from a level surface (tilt < 5°) that has been still
      for ≥ 10 s. Car dashboards, laps, beds → NUDGE only.
  S5  QUIET HOURS
      Operator-set window; launch gestures downgraded to SETTLE. Default
      22:00–07:00 local.
  S6  CHILD-SAFE SHELL
      No pinch points; spring and latch fully enclosed; battery behind a
      second wall. 45 mm cube exceeds small-parts choke threshold; no
      detachable feet.

--------------------------------------------------------------------------------
04 // HAPTIC LANGUAGE v0.2 — OUTPUT + ONE INPUT
--------------------------------------------------------------------------------

  OUTPUT (unchanged list, revised actuators)
  GESTURE     ACTUATOR            MOTION                     TRIGGER
  ──────────  ──────────────────  ─────────────────────────  ─────────────────
  NUDGE       voice-coil + piezo  felt, not seen             memory question
  HOP         spring (partial)    ≤10 mm in place            badge (common/unc.)
  LEAP        spring (full)       ~40 mm forward              badge (rare+)
  SETTLE      voice-coil          2 s standing pressure       assembly phase up
  PULSE ★new  voice-coil          2 soft NUDGEs, 600 ms apart cohort resonance /
                                                              paired cube (§07)

  INPUT ★new
  TAP         IMU                 1 or 2 knuckle taps on top  acknowledge /
                                  face (accel spike, no       send presence to
                                  displacement)               paired cube

  THE PRINCIPLE (extended)
    v0.1 made the cube something that speaks without a screen. v0.2 lets
    it answer without a screen. A tap is the smallest possible reply:
    one bit, no words, no feed.

--------------------------------------------------------------------------------
05 // FIRMWARE + PROTOCOL v0
--------------------------------------------------------------------------------

  5.1  STATE MACHINE

    SLEEP ──(radio wake / tap)──▶ IDLE
    IDLE ──(gesture packet)──▶ GATE CHECK (S2–S5)
        GATE FAIL ──▶ substitute (NUDGE or SETTLE) ──▶ REPORT
        GATE PASS, voice-coil gesture ──▶ PLAY ──▶ REPORT
        GATE PASS, spring gesture ──▶ WIND ──▶ RE-CHECK GATES
            RE-CHECK FAIL ──▶ UNWIND ──▶ substitute ──▶ REPORT
            RE-CHECK PASS ──▶ FIRE ──▶ AIRBORNE ──▶ LAND
                LAND upright ──▶ REPORT
                LAND off-axis ──▶ RIGHT (voice-coil) ──▶ REPORT
    REPORT ──▶ IDLE ──(30 s no activity)──▶ SLEEP

  5.2  CUBIQ-LINK v0 — GESTURE PACKET (platform → cube, BLE GATT write)

    byte  field        values
    ────  ───────────  ───────────────────────────────────────────────
    0     version      0x00
    1     gesture      0 NUDGE · 1 HOP · 2 LEAP · 3 SETTLE · 4 PULSE
    2     amplitude    0–255 (spring wind depth / coil drive)
    3     source       Index of Systems signal source id (0–14, §03 of
                       LOT-CUBIQ-OPERATOR.md) · 0xFF paired cube
    4–5   ttl_s        seconds the gesture is still worth playing
    6–7   seq          sequence number (dedupe, ack)

  5.3  TELEMETRY PACKET (cube → platform, BLE notify)

    seq · gesture_requested · gesture_played · gate_result ·
    flight_ms · landing_tilt_deg · righted (bool) · tap_count ·
    ms_to_first_touch · battery_pct

    ms_to_first_touch is the new "haptic preference" signal for QI·46
    Step 3.3: how long after a gesture the operator physically responds.
    Only timings and counts leave the cube. No audio. No camera. No
    location.

  5.4  PATH TO THE PLATFORM
    Cube ↔ (BLE) ↔ charging pad hub ↔ (Wi-Fi) ↔ lot-systems.com.
    The pad is the always-powered radio so the cube can sleep. Fallback
    for v.0 bench work: Web Bluetooth direct from the browser.

--------------------------------------------------------------------------------
06 // MASS, POWER, BOM — v.0 PAPER BUDGET
--------------------------------------------------------------------------------

  6.1  MASS (TARGET ≤ 120 g)
    shell, nano-ceramic composite, 1.2 mm wall ........ 28 g
    reaction mass (tungsten-loaded) ..................... 40 g
    spring + latch + lead screw + gear-motor ............ 14 g
    voice-coil ............................................ 8 g
    LiPo 150 mAh ........................................... 4 g
    PCB: BLE SoC, IMU, ToF, drivers, Qi Rx coil .......... 9 g
    feet, fasteners, damper ................................ 5 g
    RESERVED — v.3 levitation ring magnet slot ........... 0 g (volume only)
    ───────────────────────────────────────────────────────
    TOTAL ................................................ 108 g  (12 g margin)

  6.2  POWER
    Battery 150 mAh × 3.7 V ≈ 0.55 Wh ≈ 2,000 J.
    One LEAP ≈ 160 mJ spring / ~30% wind efficiency ≈ 0.5 J electrical.
    Sleep + periodic BLE ≈ 0.15 mA average (TARGET).
    → ~1,000 h standby; jumps are not the battery problem, idle radio is.
    Lives on the Qi pad most of the time; off-pad TARGET: 7 days at
    20 gestures/day.

  6.3  COMPONENT CLASSES (no vendor lock yet)
    BLE 5 SoC · 6-axis IMU · single-zone ToF · H-bridge for gear-motor ·
    coil driver · piezo driver (boost) · Qi receiver + charger IC ·
    latch release (solenoid or SMA).

--------------------------------------------------------------------------------
07 // LEVITATION TRACK (v.3) — DOWN-SELECT
--------------------------------------------------------------------------------

  v0.1 left two candidates open. Cycle 02 narrows it:

  (a) ACOUSTIC LEVITATION — RETIRED AS PRIMARY
      Phased ultrasonic arrays levitate small, light objects (beads,
      droplets, gram-scale). A ~100 g, 45 mm cube is far outside that
      envelope with any desk-safe array power. Kept only as a texture /
      mid-air-haptics idea for the pad, not for lifting the cube.

  (b) PASSIVE DIAMAGNETIC — RETIRED
      Earnshaw's theorem rules out stable static levitation with fixed
      magnets alone; diamagnetic stabilization only carries very light
      bodies. Not viable at 100 g.

  (c) ACTIVE ELECTROMAGNETIC LEVITATION — PRIMARY
      Pad contains an electromagnet array + Hall sensors in a fast
      feedback loop; cube carries a permanent ring magnet. This class
      already floats consumer objects of a few hundred grams a
      centimetre or two above a base. It needs the pad, not the cube, to
      do the heavy work — consistent with the v0.1 decision that the pad
      IS the table.

  v.0 CONSEQUENCES (recorded now, so v.0 does not foreclose v.3)
    - Reserve a central ring-magnet volume in the shell (§6.1).
    - Keep ferrous parts out of the shell's centre axis.
    - Qi Rx coil placement must tolerate a magnet nearby; verify in the
      first bench build.
    - Open question: can a levitating cube still be inductively charged
      across the gap? Research item, not a claim.

--------------------------------------------------------------------------------
08 // CONSUMER USE CASE 02 — THE PAIRED CUBES                    2026-11-16
--------------------------------------------------------------------------------

  Operator profile: Usership $399/mo priority tier (Quantum Cube sync),
  Phase 5 "Community Resonance", a parent who travels for work for two
  weeks of every month. Their child, nine, has a second CUBIQ™ on a
  bedroom desk, paired to the parent's cube as a cohort of two.

  The parent is in a hotel twelve hours away. A phone call has to be
  scheduled across the time difference; a text has to be read; a video
  call has to be watched. Every channel between them demands a screen
  and the same moment.

  At 07:40 the child's time the child finishes the morning self-check on
  lot-systems.com — the DIURNAL ARC's morning launch (P76). The Index of
  Systems fires a cohort signal. On the hotel desk the parent's cube
  performs THE PULSE: two soft nudges, felt through the desk, 600 ms
  apart. Nothing lights up. The parent is mid-meeting prep and does not
  stop. They know what it means — the kid is up, the kid did the thing.

  When the meeting ends the parent taps the top of their cube twice with
  a knuckle. THE TAP is relayed. On the child's desk, quiet hours are
  over, the gates pass, and the child's cube performs THE HOP — a small
  jump in place, ten millimetres, a sound like a coin set down. The child
  is brushing their teeth in the next room and hears it. They come back,
  see the cube sitting where it was, and tap it once in return.

  No words crossed the ocean. No messages to read. No feed to scroll. Two
  bits, two gestures, and the parent and child both had the same feeling
  at different hours of the same day: someone on the other side of the
  planet just checked on me.

  WHY THIS USE CASE MATTERS FOR v.0
    - It is the first case where the cube is an INPUT as well as an
      OUTPUT. THE TAP (§04) is promoted to a v.0 requirement.
    - It exercises every safety gate with a child operator: S3 (the child
      picks the cube up — no launch), S5 (bedtime — PULSE downgrades to
      SETTLE), S1 (no wound spring left in a child's room).
    - It is the physical realisation of LOT-CUBIQ-OPERATOR.md Phase 5:
      "They are not alone in the cubic."
    - Privacy floor: the only payload is gesture + seq. Neither cube
      knows where the other is, what time it is there, or anything else
      about the other operator. Parent controls the pairing.

  MEASURABLE ACCEPTANCE (v.0 field trial, TARGET)
    - End-to-end latency, tap → paired gesture: ≤ 5 s median.
    - Operator survey after 30 days: "felt connected" ≥ 4/5 for both
      sides of the pair.
    - Zero safety-gate violations across the trial.

--------------------------------------------------------------------------------
09 // v.0 TEST PLAN — UPDATED GATES
--------------------------------------------------------------------------------

  ID    TEST                                          PASS CRITERION
  ────  ────────────────────────────────────────────  ────────────────────
  T01   HOP-and-recover cycles (from v0.1)            500/500, 0 off-table
  T02   Edge-approach inhibit (from v0.1)             100/100
  T03   Wind-then-inhibit → unwind (S1)               200/200, latch never
                                                      released
  T04   Held / lift inhibit (S3)                      100/100
  T05   Tilted / moving surface inhibit (S4)          100/100
  T06   Landing noise on wood, glass, laminate        ≤ 45 dBA @ 1 m
  T07   Upright landing before righting pulse         ≥ 95%
  T08   TAP detection: true-positive / false-positive ≥ 95% / ≤ 1 per day
        (desk knocks, typing, cups set down)
  T09   Paired latency tap → gesture                  ≤ 5 s median
  T10   Off-pad endurance at 20 gestures/day          ≥ 7 days

--------------------------------------------------------------------------------
10 // RISKS
--------------------------------------------------------------------------------

  R1  Spring wind time (~1.5 s) adds latency before HOP/LEAP. Mitigation:
      NUDGE plays immediately while winding — the cube "inhales" before
      it jumps. This may become a signature, not a defect.
  R2  45 dBA landing target may be hard on glass. Mitigation: softer
      feet trade against bounce; test early (T06).
  R3  TAP false positives from desk activity. Mitigation: double-tap
      template + require still-period before and after.
  R4  Nano-ceramic shell impact durability after thousands of landings
      is unknown. Mitigation: drop tests on first shells; fallback to
      ceramic-coated polymer.
  R5  Levitation magnet vs. Qi coil interaction (§07). Bench item.

--------------------------------------------------------------------------------
11 // NEXT CYCLE (03) — PROPOSED
--------------------------------------------------------------------------------

  1. Bench rig v.0: 3D-printed 45mm shell, off-the-shelf spring + latch,
     dev-board electronics; measure real v_launch vs §2.2.
  2. Write CUBIQ-LINK v0 against Web Bluetooth so lot-systems.com can
     fire a gesture from the browser (no app needed for bench work).
  3. Decide the latch: solenoid vs. SMA (speed, noise, energy).
  4. Use Case 03.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-REPORT-2026-11-16
================================================================================
