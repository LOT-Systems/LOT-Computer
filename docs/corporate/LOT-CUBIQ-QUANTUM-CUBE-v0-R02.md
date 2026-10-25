================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-R02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Engineering Report R02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-25
VERSION:  0.2 — ENERGY / MOMENTUM BUDGET, TEST PLAN, LEVITATION FEASIBILITY
STATUS:   v.0 — PRE-HARDWARE, DESIGN LOCK PENDING
PARENT:   docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md (R01, 2026-07-28)
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing (per R01 Section 07 protocol):

  LOT-CUBIQ-QUANTUM-CUBE-v0.md   R01 spec: hop primitive, 4 gestures, roadmap
  LOT-CUBIQ-VISION.md            anti-feed thesis; physical products as the
                                 completion of the cubic (Sect. 05)
  LOT-CUBIQ-OPERATOR.md          Index of Systems signals; Phase 4 physical
  LOT_QI46_ENGINE.md             piezoelectric / nano-ceramic / haptic line;
                                 Month-12 cube sync (input device)
  CQGS-WHITE-PAPER-SNAPSHOT.md   Institute philosophy; cube = PLANNED row
  LOT-AMBIENT-AI-VISION.md       QIoT™, LOT® Station, LOT® Brush: existing
                                 hardware signals that can drive the cube
  LOT_ROBOTICS_COSMO.md          COSMO® lineage; "no verified LOT profile,
                                 no activation" rule
  LOT-MANIFEST.md                COSMO® Cube is a separate track; no naming
                                 collision

R01 stated targets (hop <10mm, leap ~40mm, long jump >150mm) but did not
check them against physics. R02 does. Two R01 assumptions do not survive
the check; they are flagged in Sections 02 and 05 and corrected here.

--------------------------------------------------------------------------------
01 // ENERGY BUDGET — WHAT EACH MOTION COSTS
--------------------------------------------------------------------------------

Ballistic model, flat surface, launch and landing at same height, no drag.
Mass is the fully assembled cube. g = 9.81 m/s².

  MOTION              MASS   LAUNCH ANGLE   LIFT-OFF SPEED   KE REQUIRED   APEX
  ──────              ────   ────────────   ──────────────   ───────────   ────
  THE HOP (10mm)      120g   90° (vertical)  0.44 m/s         11.8 mJ       10 mm
  THE LEAP (40mm)     120g   75° (15° bias)  0.89 m/s         47.1 mJ       37 mm
  v.1 LONG JUMP 150   120g   45°            1.21 m/s         88.3 mJ       38 mm
  v.1 LONG JUMP 150    90g   45°            1.21 m/s         66.2 mJ       38 mm
  v.1 LONG JUMP 150    90g   35°            1.25 m/s         70.5 mJ       26 mm

FINDING 1 — THE LEAP IS NOT A "<10mm" EVENT.
  R01 describes THE LEAP as "full-amplitude hop with forward bias, ~40mm
  displacement." A 40mm range at a 15°-off-vertical bias implies an apex of
  ~37mm, not 10mm. Its energy is 4x the hop's. The R01 gesture table stands,
  but the actuator must be sized for the LEAP (47 mJ at the shell), not the
  HOP. Apex ≈ 37mm is also a design input to the edge-detect margin.

FINDING 2 — MECHANICAL EFFICIENCY, NOT BATTERY, IS THE LIMIT.
  Battery energy is not binding (a 100 mAh / 3.7 V cell holds ~1.3 kJ; a
  v.1 jump is ~0.07-0.09 J). The constraint is peak power and conversion:
  88 mJ delivered in a 5 ms stroke is ~18 W peak. A voice coil cannot be fed
  that from a small LiPo directly; v.0 adds a small supercapacitor / buffer
  stage charged between gestures. Design rule: size stored energy at
  >= 2.5x the KE figures above (assumes ~40% end-to-end efficiency):

      THE HOP    >= 30 mJ stored
      THE LEAP   >= 120 mJ stored
      v.1 JUMP   >= 220 mJ stored (120g) / 165 mJ (90g)

--------------------------------------------------------------------------------
02 // MOMENTUM BUDGET — CORRECTION TO R01 ACTUATION
--------------------------------------------------------------------------------

R01 Section 03 drives an internal reaction mass against the base. The
momentum bookkeeping matters:

  - If the reaction mass strikes the shell and sticks (inelastic), the
    whole cube leaves at v = m_r * v_r / (M_total), and most of the
    spring energy is lost as heat and sound. That also makes the cube LOUD.
  - If the stored energy E is split between a shell (M) and an internal
    mass (m_r) pushed apart by a spring and then arrested by a stop, the
    shell-only velocity is v_s = sqrt(2E / (M (1 + M/m_r))).

  Worked case, 70g shell + 50g internal mass:

      E = 47 mJ  -> v_s = 0.75 m/s   (LEAP needs 0.89: SHORT)
      E = 88 mJ  -> v_s = 1.02 m/s   (v.1 needs 1.21: SHORT)

  I.e. a 50g reaction mass does not leave enough velocity on the table unless
  the stored energy is >= ~70 mJ for the LEAP and ~125 mJ for the 150mm jump
  at 120g. Consistent with the 2.5x rule in Section 01.

  DESIGN DECISIONS (v.0 R02):
    D1. Treat internal reaction mass as >= 40% of total mass (>= 48g of 120g).
        Tungsten-alloy slug, not ceramic; the shell stays nano-ceramic.
    D2. Launch by RELEASE of a preloaded spring (latch + voice-coil release),
        not by driving the coil through the whole stroke. A coil only
        releases and re-cocks; the spring delivers the impulse. Quieter,
        repeatable, and gives a flat, characterisable impulse curve.
    D3. Elastomer stop plus a damped slug return path so the arrest does not
        ring through the shell; target < 45 dBA at 300mm for THE LEAP.
    D4. The piezo bias strip (R01) is retained for trajectory shaping only.
        At ~1-5 mN·s of impulse, a bimorph cannot supply the 15° forward
        component alone; the bias is mainly mechanical (angled latch axis,
        fixed at 15°). Piezo is reserved for micro-trim of ±3°.

--------------------------------------------------------------------------------
03 // LANDING AND UPRIGHTING
--------------------------------------------------------------------------------

A cube has 6 stable faces; LOT® needs only the base face to carry the
charging coil, ToF sensor and LED ring. Plan:

  - IMU at geometric centre; 1 kHz sampling during flight and landing.
  - Flight detection: free-fall (|a| < 0.2 g) -> cut all other loads.
  - Land detection: impact spike -> settle window 150 ms -> attitude check.
  - R01 "tilt > 25° triggers corrective pulse" is under-specified for a cube:
    a cube at rest is never between 0° and 90° except on an edge. Rule R02:
    resting on an EDGE (45° about a horizontal axis) -> up-righting pulse.
    Resting on a non-base FACE -> flip sequence of up to 3 pulses with the
    slug moved to the former top face (CoM shifter: slug rides on a short
    rail; two-axis shift allows the cube to "tip" toward a face).
  - If upright not achieved in 3 attempts: stop, indicate by LED ring only,
    and report via QIoT™ ("operator assist"). It does not keep jumping.

--------------------------------------------------------------------------------
04 // SAFETY GATES (HARD — NO SHIP WITHOUT PASS)
--------------------------------------------------------------------------------

  G1  EDGE.   Multi-zone ToF (4 sides, 8x8). Forward hop displacement
              (up to 45mm, v.0) requires >= 80mm clearance on the travel
              side, i.e. margin of ~2x displacement, not the 20mm in R01.
              Apex 37mm + 150mm skid on landing is the worst case.
              Pass: 100/100 edge-approach trials; 0 off-table events.
  G2  HAND.   If ToF/capacitive sense detects a hand within 60mm above the
              cube at cock/release, gesture inhibited. A cocked spring is a
              pinch hazard; the latch is mechanical and fail-safe-released
              at power loss in a controlled direction (spring unloads into
              the stop, not into the shell).
  G3  CHILD.  v.0 is an adult-desk product. Small-parts and pinch review
              before any child-facing SKU (COSMO® lineage use). Cube shell
              seam gap < 0.5mm. Voice is not required for a hop.
  G4  QUIET HOURS. Gesture inhibit window follows Index of Systems "night
              mode"; a cube must never jump at 03:00 because a badge unlocked.
  G5  ACTIVATION. No verified LOT® profile, no activation (COSMO® rule,
              LOT_ROBOTICS_COSMO.md). Cube pairs to a profile or stays inert.
  G6  THERMAL. Release-coil duty cycle capped; surface temp <= 40°C.
  G7  BATTERY. Cell protection, UN38.3 transport test, Qi receive coil
              shielded from the slug's magnetic field.

--------------------------------------------------------------------------------
05 // GESTURE REVISIONS (R01 TABLE, UPDATED)
--------------------------------------------------------------------------------

  GESTURE     MOTION                          TRIGGER SIGNAL (R01 + R02 ADD)
  ───────     ──────                          ───────────────────────────────
  THE NUDGE   sub-threshold tremor, no lift   memory question ready;
                                              + QIoT: Brush event missing by 10:00
  THE HOP     <10mm rise, in place            badge (common/uncommon)
  THE LEAP    ~37mm apex, ~40mm forward       badge (rare+); R02: Station air
                                              quality crosses VOC threshold
  THE SETTLE  2s light pressure               assembly phase advanced;
                                              + R02: Brush streak completed

  R02 ADDS "THE KNOCK": two sub-threshold pulses 400 ms apart. Meaning:
  something in the Index of Systems needs a decision, not just attention.
  Frees the HOP/LEAP for celebration vs. request, so the cube does not blur
  the two (R01 conflated "good news" and "needs you").

--------------------------------------------------------------------------------
06 // TEST PLAN — v.0 CLOSURE GATE
--------------------------------------------------------------------------------

  T1  Impulse characterisation: 200 releases on a force plate; mean impulse
      within ±5% of target, coefficient of variation < 4%.
  T2  Hop/leap repeatability on 3 surfaces (wood, glass, laminate), 100 trials
      each; displacement within ±8mm of nominal for LEAP.
  T3  Landing: 500 cycles with zero off-table events and zero failures
      (R01 gate retained).
  T4  Upright recovery: all 6 start faces x 20 trials; success within 3 pulses
      in >= 95%.
  T5  Edge approach: 100/100 inhibits at 80mm margin, both sides.
  T6  Acoustic: <= 45 dBA at 300mm during LEAP; NUDGE below 25 dBA (felt, not
      heard).
  T7  Thermal and battery: 1,000 gestures/day for 5 days at 25°C, no
      thermal trip, charge from pad between sessions.
  T8  Telemetry round-trip: gesture request -> IMU confirmation -> QI·46
      "haptic preference" record in < 2 s.

--------------------------------------------------------------------------------
07 // BILL OF MATERIALS (v.0 PROTOTYPE, ORDER OF MAGNITUDE)
--------------------------------------------------------------------------------

  Shell (nano-ceramic, 4 mm wall)                    machined proto
  Tungsten-alloy slug 48-55 g, rail + stops          off-shelf bar stock
  Release mechanism: voice coil + mechanical latch   custom, 3D-printed proto
  Drive spring (steel, preload ~100-150 mJ)          catalog
  Piezo bimorph trim element                         catalog
  IMU 6-axis (1 kHz), multi-zone ToF, hall sensors   catalog
  Cell (LiPo ~100 mAh) + supercap buffer + Qi RX     catalog
  MCU + BLE                                          catalog
  Elastomer feet x4 (v.0 passive)                    catalog

  Target proto mass: 115-125 g. Slug is ~45% of mass: this budget consumes the
  weight headroom R01 hoped for; v.1's <90g target needs a 40g slug plus a
  stronger spring, not a lighter shell alone.

--------------------------------------------------------------------------------
08 // v.1 AND v.2 — WHAT THE NUMBERS SAY
--------------------------------------------------------------------------------

  v.1 LONG JUMP (>150mm).
    Needs ~88 mJ at the shell (120g) or ~66 mJ (90g) at 45°; at 2.5x that is
    165-220 mJ stored. A 1 mm-wire steel spring of that energy fits in 45mm
    only if the stroke is >= 12mm. Feasible; the cube's internal height
    becomes the main constraint. Recommendation: keep 45mm cube for v.0, allow
    v.1 to grow to 50 mm (+35% volume) if the stroke cannot be won back.
    Landing accuracy +-30mm at 150mm range requires closed-loop launch angle;
    the angled latch axis is therefore adjustable in v.1 (2 positions).

  v.2 SURFACE SWINGS / TABLE-WALKING.
    R01 proposed two actuated feet driven out of phase with the vertical
    stroke. Preferred alternative for v.2 study: a stick-slip "inchworm"
    drive using two piezo-actuated edge pads and an anisotropic-friction
    base (directional micro-fibre elastomer). Moves a cube 1-5 mm/s with no
    jumping, silent, and without needing the edge-detect margin of a hop.
    Hop remains the "attention" mode; inchworm is the "approach" mode.
    LOT Institute piezoelectric corpus already covers the actuator class.

--------------------------------------------------------------------------------
09 // LEVITATION — FEASIBILITY (v.3, RESEARCH TRACK)
--------------------------------------------------------------------------------

  Weight to lift: 120 g -> 1.18 N.

  (a) ACOUSTIC (R01 candidate). Required radiation pressure over a 45x45mm
      face: ~580 Pa. Practical standing-wave levitators hold sub-gram
      particles; levitating 120g needs on the order of 170 dB SPL, well beyond
      safe exposure and beyond ultrasound array capability at this scale.
      R02 VERDICT: not viable for a 120 g cube. Remains valid only for a
      decorative element (e.g. a sub-gram ceramic spark above the cube).

  (b) ACTIVE MAGNETIC. 1.18 N at a 5-10mm gap with a permanent-magnet (NdFeB)
      cube-side element and a table-side electromagnet array (4-6 coils) with
      Hall-effect position feedback at >= 1 kHz. Steady-state power is low
      because a permanent magnet carries the bias; coils only stabilise.
      Known in hobbyist and commercial "maglev display" products at similar
      masses. Constraint: the Qi charging coil and levitation coils share
      the table; levitation hold time, not charging, is the energy cost.
      R02 VERDICT: viable research target. A bench rig (4 coils, Hall array,
      1 kHz controller) is scoped for v.3.0 before any cube-side redesign.
      v.0 compliance: keep the base-face magnet-clear zone in the shell so
      the same cube can float on the v.3 rig without remanufacture.

  (c) DIAMAGNETIC (pyrolytic graphite / superconductor). Passive but needs
      cryogenics or strong field gradients; not a consumer path. Recorded
      only so later sessions do not re-open it.

--------------------------------------------------------------------------------
10 // OPEN QUESTIONS FOR S-2
--------------------------------------------------------------------------------

  Q1  Approve 50 mm cube for v.1? (45 mm held for v.0.)
  Q2  Approve the KNOCK gesture (Sect. 05) as a fifth R02 gesture?
  Q3  Tungsten slug: OK to treat as a regulated-material BOM line?
  Q4  Is the LOT® Brush -> Cube linkage (Use Case 02) in scope for v.0, or
      held until the Station/Brush ship cycle completes?

--------------------------------------------------------------------------------
11 // CONSUMER USE CASES (SUMMARY; FULL TEXT IN R01 SECTION 07)
--------------------------------------------------------------------------------

  UC-01  THE DESK MIGRATION               2026-07-28 (R01)
  UC-02  THE MORNING HANDSHAKE            2026-10-25 (R02, this report)

  USE CASE 02 — THE MORNING HANDSHAKE                         2026-10-25
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, owns the LOT® Station (bathroom shelf)
  and LOT® Brush; CUBIQ sits on its Qi pad on the kitchen counter next to
  the coffee machine. Phone stays in the bedroom; the operator is trying to
  leave the house without opening a screen.

  At 07:40 the Brush has logged a 2-minute brushing event. QIoT™ fuses that
  with the Station's reading that the bathroom VOC and humidity are normal and
  with the operator's calendar-free morning pattern (QI·46 Calibration Loop).
  The system decides the self-care loop is closed and the day can start.
  The cube performs THE SETTLE — two seconds of light standing pressure the
  operator feels as they put the mug down on the counter. No light, no chime.

  On the day the Brush event is MISSING by 10:00 and the operator's pattern
  says they usually brush before leaving, the cube performs THE NUDGE once.
  They notice it as they reach for their keys. They go back, brush; the Brush
  event arrives; the cube answers with THE HOP (a small acknowledgement).
  No streak counter, no guilt screen.

  What changed against UC-01: the trigger is a PHYSICAL event (Brush), not a
  platform event (Memory Engine question). That is the first case in which
  hardware talks to hardware through the cubic, with the cube as the quiet
  voice. It is also the first loop in which the notification is subtracted
  from the phone: the morning routine completes with the screen never lit.

--------------------------------------------------------------------------------
12 // NEXT SESSION
--------------------------------------------------------------------------------

  - Append USE CASE 03 (suggested: a shared-desk / two-operator case, or the
    "Kuzya" bedtime SETTLE under the G3 child review).
  - Resolve Q1-Q4, then freeze D1-D4 into a v.0 mechanical drawing set.
  - Open docs/technical/ CUBIQ-PROTO-BOM.md with real part numbers.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-R02
================================================================================
