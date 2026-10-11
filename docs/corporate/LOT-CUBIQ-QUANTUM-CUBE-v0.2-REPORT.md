================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0.2-REPORT
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-11
VERSION:  0.2 — ENGINEERING REVIEW OF v0.1 + PHYSICS BUDGET + TEST PLAN
STATUS:   v.0 — PRE-HARDWARE. NO PROTOTYPE EXISTS. ALL FIGURES ARE CALCULATED
          ESTIMATES, NOT MEASUREMENTS.
SUPERSEDES: nothing. Amends LOT-CUBIQ-QUANTUM-CUBE-v0.md (v0.1) in Section 02.
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing (in full unless noted):

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md       (v0.1 — my own prior spec)
  docs/corporate/LOT-CUBIQ-VISION.md                (Section 05, physical arc)
  docs/corporate/LOT-CUBIQ-OPERATOR.md              (Phase 4, Index of Systems; skimmed)
  docs/corporate/LOT_QI46_ENGINE.md                 (lines 105-130, 207, 450-460, 750-764, 947)
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md       (lines 32-34, 180)
  docs/corporate/LOT_ROBOTICS_COSMO.md              (hardware track, COSMO® separation)
  docs/benchmark/LOT-MANIFEST.md, LOT-LEXICON.md, LOT-DOCTRINE.md, LOT-LEDGER.md
  docs/LOT-SR-20260805-01.md                        (last session report; format)

LOT® INSTITUTE BASIS (what the Institute record actually says about the cube)

  - Product line: "Quantum Cube — bioelectric hardware, haptic feedback,
    nano-ceramic, piezoelectric" (CQGS snapshot L32; QI·46 L110).
  - Commercial frame: $399/mo Usership tier is "priority with Quantum Cube
    sync" (CQGS L34; QI·46 L947). Delivery milestone: Month 12 (QI·46 L207, L750).
  - Signal frame: cube returns haptic preference (pressure, duration,
    cadence), usage frequency and pre/post biofield self-report to the
    Calibration Loop (QI·46 L755-760).
  - Voice frame: the cube's arrival must be met "Present. Celebratory.
    Specific to the milestone." (QI·46 L458-460).
  - Status: "Quantum Cube Hardware ... PLANNED" (CQGS L180).

  GAP, STATED PLAINLY: the Institute's own Quantum Cube white paper is
  referenced (QI·46 L311 "/corpus/institute/") but is NOT in this repository.
  Everything below is built on the five Institute lines above plus v0.1.
  If the white paper contains constraints (dimensions, materials, claims),
  they override this report. ACTION: S-2 to drop the white paper into
  docs/corporate/ so the next cycle can reconcile.

--------------------------------------------------------------------------------
01 // FINDINGS — WHAT v0.1 GOT WRONG OR LEFT OPEN
--------------------------------------------------------------------------------

Reviewed v0.1 as an engineer would before cutting metal. Four defects, two
open questions. Defects are corrected in Section 02 and recorded here
rather than silently edited, per the append-only rule of v0.1 Section 07.

  F1  EDGE SENSOR CANNOT SEE EDGES (SAFETY-CRITICAL)
      v0.1 Section 03 specifies a "forward-facing" time-of-flight sensor.
      A horizontal beam over a desk sees nothing at a table edge — the
      surface simply ends and the beam keeps travelling to the far wall.
      It detects obstacles, not cliffs. Cliff detection needs a sensor
      canted DOWN at the surface, where an edge appears as a sudden range
      increase (the method used by robot vacuums).
      FIX: downward-canted cliff sensor(s) (ToF or IR reflective) on the
      leading face, plus a horizontal ToF for obstacles. Two sensors.

  F2  20 mm EDGE-INHIBIT THRESHOLD IS TOO SMALL (SAFETY-CRITICAL)
      v0.1 inhibits the hop at 20 mm from an edge. The Leap travels ~40 mm.
      Geometry (cube 45 mm, centre of mass 22.5 mm behind the front face):
        COM-to-edge after leap = d + 22.5 - L
        where d = front-face-to-edge distance, L = leap displacement.
      Require COM >= 15 mm inside the edge after landing, with L = 40 mm
      nominal + 15 mm scatter allowance (3-sigma, to be measured) = 55 mm:
        d + 22.5 - 55 >= 15   ->   d >= 47.5 mm
      FIX: inhibit threshold 50 mm, not 20 mm. At 20 mm, the cube would
      have launched itself onto the floor, which is the exact failure the
      gate exists to prevent. The 15 mm scatter is an assumption; it is
      replaced by the measured 3-sigma from the first 100 trials.

  F3  VOICE-COIL DIRECT DRIVE IS PROBABLY UNDERSIZED
      See Section 03 energy budget. The Leap needs ~47 mJ delivered in a
      few ms. Direct-driving that from a coil that fits a 45 mm cube is
      at or beyond what small coils deliver. FIX: spring-and-latch.
      Slow actuator charges a spring; a trigger releases it. Power draw is
      decoupled from peak force. Voice coil stays as the fine/quiet
      element (Nudge, Settle, righting pulse).

  F4  PIEZO BIAS ALONE CANNOT SCALE TO v.1
      v0.1 uses a piezo strip for a 5-15° forward bias. Section 04 shows a
      150 mm long jump needs ~45° launch elevation (i.e. 45° off vertical),
      not 5-15°. Bias must become a mechanical strike-axis tilt. v.0 keeps
      the piezo (adequate for 40 mm) but the v.0 chassis must reserve a
      mounting plane for a tilted strike axis, or v.1 means a new chassis.

  Q1  CHARGER AS TABLE vs. DISPLACEMENT
      v0.1 makes the charging pad "the table". A cube that hops 40 mm
      toward the keyboard (v0.1 Use Case 01) is off the pad and stops
      charging. Open question: does the cube return home itself (needs
      v.2 locomotion) or does the operator replace it by hand? v.0 answer:
      hand-return, with the Leap restricted to "away-from-pad then
      stay" only when battery > 40%. Recorded for v.2.

  Q2  ACOUSTICS
      A hammer-strike hop makes a click. v0.1 says nothing about noise,
      yet the product is sold as peripheral, non-demanding presence.
      Open: target <35 dBA at 0.5 m for Nudge/Hop; Leap may be audible.
      Elastomer feet and a damped landing matter. Needs a bench test.

--------------------------------------------------------------------------------
02 // AMENDED v.0 SPECIFICATION (DELTA TO v0.1)
--------------------------------------------------------------------------------

  PARAMETER             v0.1                        v0.2 (THIS REPORT)
  ──────────────        ───────────────────         ───────────────────────────
  Cliff sensing         forward ToF (blind to edge) downward-canted cliff sensor
                                                    + horizontal ToF obstacle
  Edge inhibit          20 mm                       50 mm (recompute after trials)
  Hop drive             voice-coil direct           spring + latch (Leap/Hop);
                                                    voice coil (Nudge/Settle/right)
  Forward bias          piezo only                  piezo; chassis reserves tilt
                                                    plane for v.1 strike axis
  Mass target           <120 g                      <120 g (unchanged; budget below)
  Size                  45 x 45 x 45 mm             unchanged
  Charge                Qi through base             unchanged; hand-return (Q1)
  Gestures              Nudge/Hop/Leap/Settle       unchanged (Section 05 adds
                                                    refusal behavior)
  Shell                 nano-ceramic composite      unchanged (Institute line);
                                                    see risk R3 on mass/fragility

--------------------------------------------------------------------------------
03 // PHYSICS BUDGET (CALCULATED, m = 0.120 kg, g = 9.81 m/s^2)
--------------------------------------------------------------------------------

Ideal projectile, flat surface, no losses, no spin. These are lower bounds
on energy; real hardware needs margin (estimate 2x). They exist to size
components and to catch impossible requirements early, not to promise
performance.

3.1  THE HOP (rise < 10 mm, in place)
      Energy   E = m g h = 11.8 mJ at 10 mm
      Launch v = 0.44 m/s        Impulse p = 0.053 N·s
      Landing speed = launch speed. Gentle; no shell stress concern.

3.2  THE LEAP (40 mm displacement, bias angle off vertical)

      bias     launch v   energy    rise     impulse    flight
      ─────    ────────   ───────   ──────   ────────   ───────
       5°      1.50 m/s   136 mJ    114 mm   0.18 N·s   305 ms
      10°      1.07 m/s    69 mJ     57 mm   0.13 N·s   215 ms
      15°      0.89 m/s    47 mJ     37 mm   0.11 N·s   174 ms
      20°      0.78 m/s    37 mJ     27 mm   0.09 N·s   150 ms

      READING: the v0.1 bias range (5-15°) spans a 3x energy difference.
      A 5° bias makes a 114 mm-tall leap on a 45 mm cube — a spectacle,
      not a notification. DESIGN POINT: 15-20° bias, ~40-47 mJ, rise
      27-37 mm. The "hop that goes forward" stays low and quick.
      At 15° bias the cube covers 40 mm in 0.17 s; the horizontal
      component is only 0.23 m/s, so the motion reads as a deliberate
      step, not a throw.

3.3  ACTUATION SIZING (first-order)
      Reaction hammer 35 g, restitution e ~ 0.5: ground impulse
      ~ m_h * u * (1+e). For 0.11 N·s -> hammer speed u ~ 2.1 m/s,
      hammer energy ~ 77 mJ (the 47 mJ useful + losses/margin).
      Over a 6 mm stroke: average force ~ 13 N. That is the number that
      motivates F3 — a direct-drive coil sized for a 45 mm cube is not
      expected to hold that force over that stroke. A spring storing
      ~80 mJ (e.g. k = 1 N/mm compressed ~12.6 mm — to be redesigned
      against the 6 mm stroke; geometry TBD) charged by a small gear
      motor over ~1 s, released by a latch, moves the peak requirement
      from "13 N coil" to "1 W-class motor + latch".
      STATUS: unverified arithmetic. Bench test of a spring-hammer
      rig (no electronics) is the first physical build task.

3.4  BATTERY
      80 mJ per Leap is negligible. 150 mAh at 3.7 V holds ~2 kJ, i.e.
      ~25,000 Leap-equivalents before motor and idle losses. Battery
      is sized by peak current and idle/BLE draw, not hop energy.
      Idle-draw budget decides runtime; target >7 days between charges
      at 20 notifications/day (to verify).

3.5  v.1 PREVIEW (150 mm long jump) — WHY THE CHASSIS DECISION IS NOW
      m = 120 g:  45° off vertical: 88 mJ, rise 37 mm
                  30° off vertical: 102 mJ, rise 65 mm
                  15° off vertical: 177 mJ, rise 140 mm
      m =  90 g:  45° -> 66 mJ;  30° -> 76 mJ
      Cheapest 150 mm jump is the 45° launch. It needs a tilted strike
      axis (F4) and ~1.4x-1.9x the v.0 Leap energy. The v.0 spring
      should be sized with v.1's ~100 mJ in mind (see 3.3 spring margin).

--------------------------------------------------------------------------------
04 // FIRMWARE ARCHITECTURE (v.0)
--------------------------------------------------------------------------------

State machine (single task, no RTOS needed for v.0):

   IDLE ──signal──▶ GATE_CHECK ──pass──▶ CHARGE_SPRING ──▶ FIRE ──▶ LAND_WAIT
     ▲                  │fail                                          │
     │                  ▼                                              ▼
     │              REFUSE (shudder)                          RIGHT_CHECK (IMU)
     │                                                                 │
     └───────────── LOG_TELEMETRY ◀── tilt>25° → RIGHT_PULSE (max 2) ──┘

GATE_CHECK (all must hold, else REFUSE):
   1. Cliff sensor: surface present at lead edge, range stable ±3 mm
   2. Edge distance >= 50 mm for Hop/Leap; any for Nudge/Settle
   3. Horizontal ToF: no obstacle within 80 mm (a Leap into a mug is a bug)
   4. IMU: cube upright (<5° tilt) and at rest for 300 ms
   5. Battery >= 15% (Leap needs >= 40%, Q1)
   6. Not in Quiet Hours (operator setting; default 22:00-07:00)
   7. Rate limit: max 1 Leap / 10 min, max 6 Hop / hour (anti-feed rule)

REFUSE is a first-class gesture, not an error: a 150 ms shudder, then
silence. A refusal is logged (reason code) and the signal is NOT lost —
it falls back to the software cubic as it does today.

TELEMETRY RECORD (per gesture, to Calibration Loop, QI·46 L755):
   { ts, gesture, signal_id, gate_result, refuse_reason?, tilt_after_deg,
     righting_pulses, displacement_mm?, battery_pct, ack_t? }
   ack_t = time until operator touched / moved cube or opened the cubic.
   This feeds "cadence" and "duration" of the Institute's haptic
   preference signal; "pressure" is not measurable in v.0 (no force
   sensing) and is recorded as NOT AVAILABLE rather than faked.

SIGNAL MAP (software side, no hardware needed to build):
   Index of Systems event           ->  gesture
   memory_question_ready            ->  NUDGE
   badge: common, uncommon          ->  HOP
   badge: rare, epic                ->  LEAP
   badge: legendary, mythic, cosmic ->  LEAP + SETTLE (2 s pause, second LEAP
                                        only if operator is detected present)
   assembly_phase_advanced          ->  SETTLE
   (rarity tiers per src/client/utils/badges.ts:798; v0.1 only mapped
    "rare and above" to one Leap — the three top tiers were unspecified.)

--------------------------------------------------------------------------------
05 // TEST PLAN AND GATES
--------------------------------------------------------------------------------

T0  Bench: spring-hammer rig, no electronics. Measure rise and range vs
    spring preload on a kitchen scale and ruler/phone slow-mo video.
    Exit: reproduce 10 mm Hop and 40 mm Leap with <=20% error vs Section 03.
T1  Mass/volume check of component set vs 45 mm cube, 120 g.
    Exit: CAD volume fits with >=10% free; mass <=110 g (10 g margin).
T2  Cliff test: 100 approaches to a table edge at 5 angles, 3 surfaces.
    Exit: 100/100 inhibits at >=50 mm. 0 launches within 50 mm.
T3  Hop-and-recover soak: 500 cycles (v0.1 gate retained).
    Exit: 0 off-table landings, 0 actuator failures.

STATISTICAL NOTE ON THE 500/500 GATE
    Zero failures in 500 trials proves a failure rate below ~0.6% at 95%
    confidence (rule of three: 3/500). 100/100 proves only <3.0%; 50/50
    only <5.8%. So 100/100 on T2 is a smoke test, NOT evidence that the
    edge gate is safe. The v.1 and v.2 gates in v0.1 (50/50 trials) are
    equally weak statistically and should be read as milestones, not
    safety claims. Safety-critical gate (never falls off the table)
    must be 500/500 minimum before any unit leaves the lab.

--------------------------------------------------------------------------------
06 // ROADMAP — UPDATED
--------------------------------------------------------------------------------

  v.0  Controlled hop. Closed by T0-T3. Scope unchanged from v0.1.
  v.1  Long jump (>150 mm). Needs: 45° strike axis (F4), ~100 mJ spring,
       shell <90 g. Landing zone 60 mm. See 3.5.
  v.2  Table swing/walk. Needs second axis (yaw) + traction pads +
       multi-directional cliff cone (v.0 cliff sensor is lead-face only,
       so v.0 must never hop backwards or sideways; enforced in firmware)
       + hand-free return-to-pad (Q1).
  v.3  LEVITATION. Research track. Assessment from first principles,
       not Institute record (the Institute corpus is silent on mechanism):

       Acoustic (ultrasonic phased array in the pad): published
         acoustic levitators suspend small, light objects (beads,
         droplets, grams-scale), not a 100 g solid. Acoustic radiation
         force scales with array area and drive power; it is a poor fit
         for a 120 g cube. Assessment: NOT VIABLE at v.0 mass.
       Diamagnetic: stable passive levitation exists, but only for very
         light diamagnetic bodies over strong magnet arrays. NOT
         VIABLE at 120 g with useful gap.
       Active electromagnetic (electromagnet in pad, magnet in cube,
         hall-sensor feedback loop): commercially common as "floating
         display" products, which hold hundreds of grams at ~10-30 mm
         gaps. Earnshaw's theorem forbids a purely passive static-magnet
         solution; the active loop is required. ASSESSMENT: the only
         credible route. Cost: a magnet in the cube (mass, and it
         disturbs the IMU magnetometer if one is added — so v.0
         specifies a 6-axis IMU with NO magnetometer, preserving v.3).
       v.3 therefore reads: the pad hosts a servo electromagnet; the cube
       hops (v.0-v.2) on the pad, and "rises" (v.3) when the loop
       engages. Hover gap and sensing are v.3 problems; the v.0
       decisions that protect it are: no magnetometer, mass budget,
       flat ferromagnet-free base face region, pad as power+control
       surface.

--------------------------------------------------------------------------------
07 // RISKS
--------------------------------------------------------------------------------

  R1  Cube leaves the table.            Mitigation: F1+F2, 500/500 gate,
                                        firmware never hops backward/sideways.
  R2  Cube lands on someone's hand / coffee. Mitigation: horizontal ToF,
                                        Quiet Hours, rate limit.
  R3  Nano-ceramic shell cracks on repeated landings (ceramics are hard,
      not tough). Landing speed 0.4-0.9 m/s. Mitigation: elastomer feet
      carry the load path; drop-test the shell at 2x landing energy.
  R4  Noise (Q2).                       Bench test in T0.
  R5  Pinch/mechanical injury (children, pets): internal moving mass is
      fully enclosed; shell has no gaps >1.5 mm at hammer axis.
  R6  Battery safety: Li-ion cell in a unit that is repeatedly shocked.
      Mitigation: certified cell with protection IC, cell mounted off
      the strike axis, shock-test per standard cell-in-product practice.
  R7  Regulatory: wireless charging (Qi) and BLE radio require
      FCC/CE certification before sale; the Institute record ("Made in
      USA") implies US conformity (FCC Part 15). Not started.
  R8  Privacy: the cube is an always-on sensor. v.0 has no camera and
      no microphone; telemetry is gesture-level only. Keep it that way.
  R9  Claim risk: "bioelectric" and "biofield" (Institute vocabulary) are
      not measurable by any v.0 sensor. v.0 makes NO bioelectric
      claim. The cube's data are touch, timing and motion. Marketing
      language is for S-2 to set; engineering will not imply measured
      biofield output the hardware cannot produce.

--------------------------------------------------------------------------------
08 // NEXT CYCLE (v0.3) — PLAN
--------------------------------------------------------------------------------

  1. S-2 supplies the Institute Quantum Cube white paper; reconcile.
  2. Software-only: build mock "CUBIQ driver" (signal -> gesture map,
     gate logic, rate limiter, telemetry schema) in TypeScript with unit
     tests, so Month-12 UI ("Quantum Cube sync UI visible", QI·46 L796)
     can be tested with the mock. No hardware needed.
  3. T0 bench rig bill of materials (spring, 35 g mass, guide, scale).
  4. Decide Q1 (hand-return vs. pad-return) with S-2.

--------------------------------------------------------------------------------
09 // CONSUMER USE CASES
--------------------------------------------------------------------------------

  USE CASE 02 — THE QUIET HOUR                                2026-10-11
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership $399 tier, Month 13, Archetype "Rhythm
  Architect" (rhythm-locked days, 22:00 close). Shares a bedroom with a
  partner who sleeps lightly. The CUBIQ pad sits on the bedside table.

  Phones in the bedroom fail this person twice a day: a late badge ping
  lights the ceiling at 23:10, and a 06:40 reminder buzzes the table
  and wakes the partner before the alarm. The operator has resorted to
  airplane mode, which also silences the one signal they do want — the
  morning memory question, which is how they start the day.

  CUBIQ v.0 handles both with the gate logic of Section 04, not with
  more settings:

   - 23:10 — a rare badge unlocks late. Quiet Hours (default
     22:00-07:00) is active, so the Leap is REFUSED. No shudder, no
     light, no sound. The signal is not lost: it is held and shown in
     the software cubic the next time the operator opens it. The
     refusal is logged with reason QUIET_HOURS.
   - 06:52 — the operator wakes on their own, before the alarm. They
     lift the cube once (the IMU reads a deliberate lift and sets Quiet
     Hours off for 90 minutes — the operator's own gesture, one motion,
     is the "I am awake" signal). The morning memory question becomes
     ready as they wash their face. The cube performs THE NUDGE, a
     sub-threshold tremor on the bedside table, below 35 dBA — felt
     by a hand resting on the wood, inaudible from the pillow.
   - 07:05 — the operator sets the cube back on the pad, which also
     ends the 90-minute window early.

  Why this is a v.0 case and not a v.2 case: it uses only the four v.0
  gestures, the Section 04 gate (Quiet Hours + lift detection from the
  6-axis IMU already in the design) and the pad. No locomotion, no long
  jump.

  What it demonstrates about the product: the best haptic notification
  is often a REFUSAL. A device that knows when not to move, and says
  nothing when it doesn't, is what separates a presence from a gadget.
  It is also the Institute's anti-feed thesis (v0.1 Section 04)
  applied to the hour when feeds do the most damage.

  Telemetry produced: ack_t for the 06:52 Nudge (time from Nudge to
  operator opening the cubic), refusal count at QUIET_HOURS, lift
  events. All three are gesture-level; none identify sleep state.
  The cube makes no claim to measure sleep.

--------------------------------------------------------------------------------
10 // SESSION RECORD
--------------------------------------------------------------------------------

  This session: documentation only. No code or hardware. No tests run
  (nothing to run). Calculations in Section 03 were checked with a
  short projectile script; formula: v = sqrt(R g / sin 2θ), θ = launch
  elevation above horizontal = 90° - bias. Not committed.

  FILES
    NEW     docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.2-REPORT.md
    AMENDED docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md   (Use Case 02
            appended; pointer to this report; no prior text edited)

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0.2-REPORT
================================================================================
