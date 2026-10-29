================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-29
VERSION:  0.2 — PHYSICS BUDGET · ARCHITECTURE TRADE · ERRATA · TEST PLAN
STATUS:   v.0 — PRE-HARDWARE, DESIGN LOCK STILL PENDING (see Section 09)
PRIOR:    LOT-CUBIQ-QUANTUM-CUBE-v0.md (v0.1, 2026-07-28) — read in full
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing (in order):

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md       (my own v0.1 spec, 07-28)
    Defines the controlled hop, four-gesture vocabulary, v.0→v.3 roadmap and
    the append-only use-case ledger (Section 07). This report extends it; it
    does not replace it. Where this report corrects it, the correction is
    marked ERRATUM (Section 02) and v0.1 is left untouched on disk.
  docs/corporate/LOT-CUBIQ-VISION.md      Section 05 — physical extension arc.
  docs/corporate/LOT-CUBIQ-OPERATOR.md    Section 04 + Phase 4 (Days 90+).
  docs/corporate/LOT_QI46_ENGINE.md       Line 110 (bioelectric / piezoelectric /
                                          nano-ceramic / haptic feedback
                                          language); Step 3.3 Month-12 cube sync
                                          (haptic preference, usage frequency,
                                          biofield response).
  docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md   "Quantum Cube Hardware — PLANNED".
  docs/corporate/LOT-AMBIENT-AI-VISION.md "Always present, never loud";
                                          Usership row "Hardware: LOT® Station +
                                          LOT® Brush live data".
  docs/corporate/LOT_PTSD_Protocol.md     Lists exaggerated startle and
                                          hypervigilance as core symptoms —
                                          becomes a hard design constraint here.
  docs/benchmark/LOT-MANIFEST.md          COSMO® Cube (general-purpose computer,
                                          brave-lamport-t9z5u8) remains a
                                          separate object. No naming collision.
  docs/benchmark/LOT-LEDGER.md            Session ledger; latest assembly work
                                          is QIE/Badge/Wiki. No hardware
                                          sessions logged since 07-28.

REPO STATE: no CAD, firmware, schematic or driver code for CUBIQ™ hardware
exists in the repository (git ls-files | grep -i cubiq returns only the three
Vision / Operator / v0 documents). Nothing in this report claims a built or
tested unit. Every number below is an engineering estimate from first-principles
physics, to be validated on a bench prototype.

--------------------------------------------------------------------------------
01 // WHAT THIS CYCLE ADDS
--------------------------------------------------------------------------------

v0.1 stated WHAT the cube does. Report 02 answers WHETHER the stated numbers
close, and picks the mechanism:

  02  ERRATA to v0.1 — two mechanisms in v0.1 do not work as written
  03  PHYSICS BUDGET — energy, speed, flight time, impact loads
  04  ACTUATOR TRADE STUDY — voice-coil hammer vs spring-latch vs solenoid
  05  REVISED v.0 ARCHITECTURE (recommended)
  06  FIRMWARE STATE MACHINE + SIGNAL CONTRACT with the Index of Systems
  07  STARTLE-SAFETY / TRAUMA-INFORMED GESTURE RULES (new hard requirement)
  08  BENCH TEST PLAN + GATES
  09  RISK REGISTER, COMPLIANCE FLAGS, DESIGN-LOCK CHECKLIST
  10  v.1 / v.2 / v.3 PHYSICS PREVIEW (long jump, table swing, levitation)
  11  CONSUMER USE CASE 02
  12  NEXT CYCLE

--------------------------------------------------------------------------------
02 // ERRATA TO v0.1
--------------------------------------------------------------------------------

  ERRATUM 1 — "reaction mass driven DOWN against the base face" (v0.1 §03)
    As written this does not launch the cube. A mass accelerated downward
    inside a closed shell pushes the shell UP only while it accelerates; when
    it stops against the base, the momentum it carried goes into the ground
    and the net takeoff is ~zero. Internal forces cannot move the centre of
    mass of the whole body; only an exchange of momentum with something
    external (the ground), or a stored-energy release against the ground, can.
    CORRECTION: a jumping body leaves the ground by one of two valid methods:
      (A) HAMMER STRIKE — slug accelerated UP, strikes the shell's top plate;
          the whole assembly takes the slug's momentum (inelastic).
      (B) SPRING-LATCH — energy stored in a spring/cam and released through a
          pushrod against the base; the ground reaction launches the body.
    Both are carried into the trade study (Section 04).

  ERRATUM 2 — "piezoelectric bimorph biases the leap 5-15° off vertical"
    A piezo bimorph delivers millinewton-to-low-newton forces over micron-to-
    sub-millimetre travel. A 120 g leap carries ~0.1 N·s of momentum. The
    bimorph cannot steer it. CORRECTION: forward bias is set GEOMETRICALLY —
    the strike/push axis is canted 10-15° from the cube's vertical axis (or the
    base feet are asymmetric). Deterministic, zero extra parts, no timing
    jitter. The piezo bimorph is re-scoped to what it IS good at, and which is
    still Institute-named technology (QI46 line 110): a contact/knock sensor
    and a sub-threshold buzz element for THE NUDGE (Section 07).

  ERRATUM 3 — gesture dimensions vs. safety margin (v0.1 §03/§04)
    THE LEAP is specified at ~40 mm displacement. With a 15°-off-vertical
    launch (75° elevation) that implies a ~37 mm apex, not "<10 mm rise"
    (which is correct only for THE HOP). The edge-inhibit margin of 20 mm
    (v0.1 §03) is therefore smaller than the leap's own travel. CORRECTION:
    edge inhibit radius = max predicted displacement + landing scatter
    (3σ) + 15 mm. For the Leap that is ≈ 40 + 20 + 15 = 75 mm. The ToF sensor
    must therefore look forward AND sideways (see §05).

  ERRATUM 4 — Qi wireless charging as the "table"
    Keep as the power architecture, but note: Qi coupling needs the cube's
    receiver within a few mm of the pad coil, and a hopping cube lands with
    ±10-20 mm scatter. The pad cannot be the reliable HOME position unless the
    landing zone is mechanically captured. CORRECTION: pad surface gets a
    shallow (1.5-2 mm) beveled dish so the cube re-seats by gravity on its
    last landing; hops that START from the dish end in the dish for in-place
    gestures (Nudge/Hop/Settle). Only the Leap leaves the dish; the cube
    returns by a dedicated "homing" low-power hop sequence (v.1 scope).

--------------------------------------------------------------------------------
03 // PHYSICS BUDGET (first-principles, M = 0.120 kg, g = 9.81 m/s²)
--------------------------------------------------------------------------------

  GESTURE      TARGET                   TAKEOFF v    ENERGY INTO BODY   FLIGHT
  ───────      ──────                   ─────────    ────────────────   ──────
  THE HOP      10 mm rise, in place      0.44 m/s      11.8 mJ          ~90 ms
  THE LEAP     40 mm range @ 75° launch  0.89 m/s      47 mJ            ~175 ms
               (apex ≈ 37 mm)
  (v.1) LONG   150 mm range @ 45°,       1.21 m/s      66 mJ (M=90 g)   ~175 ms
  JUMP         M = 0.090 kg                                              (apex 37 mm)

  Notes
   • Energies are KINETIC ENERGY AT TAKEOFF. Mechanism losses come on top.
   • A leap of 47 mJ is small — about the energy of a mechanical-pencil click.
     Battery energy is not the constraint. PEAK POWER and PEAK FORCE are:
     47 mJ delivered in a ~5 ms push = ~9 W peak, ~10 N average on 120 g.
   • LANDING LOAD: stopping an 0.89 m/s landing in 1 mm of elastomer-foot
     compression is ≈ 40 g on the cube. Electronics survive this easily; a
     ceramic shell does NOT survive repeated point impacts without the
     elastomer feet and a shell wall of >=2.0 mm. See Risk R4.
   • Mass is expensive in the energy budget: halving mass (120→60 g) halves the
     launch energy for the same range. Every gram justified (v0.1 §02 holds).
   • HAMMER (A) efficiency is bounded by mass ratio. For a 30 g slug in a
     120 g cube, an inelastic strike passes only m_s/M = 25% of slug energy
     into body motion. Leap needs slug KE ≈ 188 mJ (slug at ~3.5 m/s), i.e.
     ~4x the energy a 45 mm voice coil comfortably produces in 5 ms.
   • SPRING-LATCH (B) has no collision loss; ~60% end-to-end efficiency is a
     reasonable planning figure → ~80 mJ stored for a 47 mJ leap. A small
     steel compression spring + cam does this inside a 45 mm cube.

--------------------------------------------------------------------------------
04 // ACTUATOR TRADE STUDY
--------------------------------------------------------------------------------

  OPTION               HOW                     PRO                      CON
  ──────               ───                     ───                      ───
  A  VOICE-COIL        Coil drives slug up     Quiet, tunable amplitude Mass-ratio loss
     HAMMER            into top plate          (great for Nudge/Settle) (25%); coil big
                                                                        for 188 mJ; heat
  B  SPRING-LATCH      Micro-motor + gear      Best energy density;     Gearmotor noise
     (cam + pushrod)   winds spring, cam       repeatable, scales to    (~40-50 dBA)
                       releases → pushrod      v.1 by spring change     during wind-up;
                       strikes base                                     wind time 1-3 s
  C  SOLENOID          Plunger kicks base      Simplest, cheap          Loud click, short
                                                                        stroke, poor
                                                                        amplitude control
  D  HYBRID (B + A)    Spring-latch for        Each actuator does what  Two actuators,
                       Hop/Leap; voice coil    it is best at            more parts, +10 g
                       for Nudge/Settle

  DECISION (recommended, subject to bench validation): OPTION D — HYBRID.
    • SPRING-LATCH carries THE HOP and THE LEAP (the only gestures that leave
      the ground), and is the same mechanism that extends to the v.1 long jump
      by a stiffer spring and longer cam throw.
    • VOICE-COIL (or the piezo element from Erratum 2) carries THE NUDGE and
      THE SETTLE — quiet, no liftoff. This also solves the noise problem: the
      loud mechanism only runs when the signal class (badge rare+) warrants a
      visible gesture; the common signals are silent.
    • Wind-up is done in advance, in a quiet window, and the spring is HELD
      LOADED (latched) so the gesture itself fires with ~0 ms delay. Wind noise
      is thereby decoupled from the notification moment (see Section 07).
    • A latched spring is stored energy in a consumer product → mechanical
      interlock: fail-safe default is UNLATCHED-RELEASE through a slow bleed
      cam (Risk R3).

--------------------------------------------------------------------------------
05 // REVISED v.0 ARCHITECTURE (RECOMMENDED REFERENCE BUILD "R0")
--------------------------------------------------------------------------------

  FORM            45 x 45 x 45 mm. Shell: nano-ceramic composite OR (bench
                  prototype only) matte-black PA12 SLS print; the ceramic shell
                  is gated on Risk R4 drop/landing test.
  MASS BUDGET     (target 120 g)
                    Shell + base plate .................. 28 g
                    LiPo 3.7 V, 150 mAh, protected ...... 4 g
                    Spring-latch module (spring, cam,
                      pushrod, N20-class micro gearmotor) 22 g
                    Voice coil / piezo nudge module ..... 8 g
                    MCU board (nRF5340-class: BLE + 2nd
                      core for control loop) + PMIC ..... 6 g
                    6-axis IMU .......................... <1 g
                    ToF sensors x3 (front, left, right) . 3 g
                    Qi receiver coil + rectifier ........ 5 g
                    Elastomer feet x4 + LED ring ........ 4 g
                    Wiring, fasteners, contingency ...... 9 g
                                              TOTAL ≈ 90 g  → 30 g headroom
                  (headroom is intentionally unallocated; v.1 spends it on a
                  stiffer spring, or v.0 spends it on shell thickness for R4.)
  STRIKE AXIS     Canted 12° from cube vertical → forward bias (Erratum 2).
  SENSING         IMU @ 1 kHz during flight/landing; ToF x3 @ 20 Hz idle,
                  burst on arm; piezo knock sensor for "operator touched me".
  COMMS           BLE 5 to a bridge: phone/PWA (lot-systems.com Web Bluetooth)
                  for v.0 bench; later the LOT® Station (Ambient AI vision).
                  The cube holds NO operator data, only a signed gesture
                  command and a rolling telemetry buffer (privacy: Section 06).
  POWER           Qi pad with beveled dish (Erratum 4). 150 mAh at ~15 gestures
                  per day (mostly silent) is >30 days standby budget; the
                  charge pad is for convenience, not necessity.

--------------------------------------------------------------------------------
06 // FIRMWARE STATE MACHINE + SIGNAL CONTRACT
--------------------------------------------------------------------------------

  STATES
    SLEEP      — deep sleep, BLE advertising 1 Hz, IMU wake-on-motion armed
    IDLE_SAFE  — awake; ToF edge map refreshed; spring UNLOADED
    ARMED      — spring loaded + latched (only entered inside a QUIET WINDOW
                 chosen by the bridge, never at the moment of a notification)
    EXECUTE    — gesture running; edge inhibit re-checked at T-0
    RECOVER    — IMU upright check; corrective action if tilt > 25°
    LOCKOUT    — fault, edge unsure, battery <15%, or Do-Not-Disturb: only
                 silent gestures permitted

  GATING LOGIC (all must hold before a liftoff gesture)
    1. ToF map: no edge within (predicted range + scatter + margin) in the
       strike direction, and none within 60 mm in any other direction.
    2. IMU: base level within ±3° at T-0.
    3. Battery >= 20%.
    4. Operator state != DND / sleep window / 'startle-safe' (Section 07).
    5. Rate limit: at most 3 liftoff gestures per hour, 12 per day (anti-feed).
    Any failure DOWNGRADES to a silent gesture (Nudge) or no-op, never UPGRADES.

  SIGNAL CONTRACT (Index of Systems → bridge → cube)
    Cube command (BLE, 12 bytes, signed with a per-device key):
      { v: 1,
        gesture: NUDGE | HOP | LEAP | SETTLE | HOME,
        intensity: 0..255,          // scales spring preload / coil duty
        valid_until: unix_s,         // stale commands are discarded
        reason: BADGE | MEMQ | ASSEMBLY | EVENING_CLOSE | OTHER,
        nonce: u32 }
    Cube telemetry (cube → bridge, aggregated, no raw IMU leaves the device):
      { gesture_id, executed: bool, downgrade_reason?, tilt_post_deg,
        touch_within_60s: bool, touch_latency_ms }
    Mapping to QI·46 Step 3.3 signals:
      "Haptic preference"   ← touch_latency_ms, duration, cadence of acks
      "Usage frequency"     ← executed gestures/day, acks/day
      "Biofield response"   ← unchanged: still operator self-report, NOT
                              inferred from IMU. The cube does not infer
                              physiology. Claims stay inside what the sensors
                              actually measure.

  PRIVACY: command payload carries a signal CLASS, never memory-question text,
  badge name, or any operator content. The cube is not a data store.

--------------------------------------------------------------------------------
07 // STARTLE-SAFETY / TRAUMA-INFORMED GESTURE RULES  (NEW — HARD REQUIREMENT)
--------------------------------------------------------------------------------

LOT_PTSD_Protocol.md lists exaggerated startle and hypervigilance among core
symptoms, and the Ambient AI vision commits to "always present, never loud".
An unattended object that suddenly moves is, for a hypervigilant person, a
potential trigger rather than a comfort. v.0 must therefore be engineered to
be anticipated, not surprising.

  RULES
    S1  ANTICIPATORY CUE: any liftoff gesture is preceded by a 1.5 s
        precursor — a slow LED-ring breathing fade-in at the base (the one job
        the LED ring is allowed beyond charge state) OR a barely-there Nudge.
        No gesture is ever the first thing the operator perceives.
    S2  OPT-IN LADDER: factory default = silent gestures only (Nudge, Settle).
        Liftoff gestures (Hop, Leap) are enabled by the operator, explicitly,
        per signal class, and can be switched off by a single squeeze/knock
        pattern on the cube itself (piezo knock sensor).
    S3  NO NIGHT MOVEMENT: no liftoff gesture inside the operator's sleep
        window (the OS already knows it — circadian/sleep state).
    S4  NOISE CEILING: <= 35 dBA at 30 cm for any gesture; wind-up happens in
        pre-announced quiet windows (Section 04, ARMED state).
    S5  NO CLOSING-IN: the Leap never travels TOWARD the operator's hand
        automatically in v.0 (v0.1 Use Case 01 describes this closing motion as
        a v.2-class behaviour; in v.0 the Leap is lateral/neutral). Closing
        distance to a person is only permitted with S2 opted-in AND the
        operator's explicit approach signal.
    S6  CADENCE CAP (Section 06 gate 5) is also the anti-habituation guard: a
        cube that jumps constantly becomes a feed.
  The cube is not a therapeutic device and makes no diagnostic or treatment
  claim; these rules exist so that it does not make anything worse.

--------------------------------------------------------------------------------
08 // BENCH TEST PLAN + GATES
--------------------------------------------------------------------------------

  PHASE A — MECHANISM (rig, no electronics)
    A1  Spring-latch release repeatability: 200 releases, takeoff-speed
        coefficient of variation < 8% (high-speed camera, 1000 fps).
    A2  Hammer/voice-coil nudge amplitude linearity vs duty, 5 levels.
    A3  Wind-up acoustic profile: dBA @ 30 cm in a quiet room.
  PHASE B — INTEGRATED CUBE R0 (3D-printed shell)
    B1  HOP: 100 cycles, rise 8-12 mm, zero tip-overs.
    B2  LEAP: 100 cycles on wood / glass / laminate, displacement 40 ± 12 mm,
        3σ scatter measured → feeds the edge margin formula (Erratum 3).
    B3  EDGE GATE: 100 approach trials (v0.1 gate retained): zero liftoffs
        within margin; sensor must catch the edge at 100/100.
    B4  RECOVERY: forced tilt 25-60°, righting success >= 95%.
    B5  FIRMWARE FAULT INJECTION: BLE drop mid-gesture, battery cut during
        ARMED, stale command replay (nonce) → all end in a safe state.
  PHASE C — PRODUCT-GRADE (ceramic shell)
    C1  Landing durability: 5,000 leaps, no crack/delamination (R4).
    C2  v0.1 closing gate retained: 500/500 hop-and-recover, zero off-table
        landings, zero actuator failures.
  EXIT: v.0 closes only when A, B and C all pass. A failed B3 is a stop-ship.

--------------------------------------------------------------------------------
09 // RISK REGISTER, COMPLIANCE FLAGS, DESIGN-LOCK CHECKLIST
--------------------------------------------------------------------------------

  ID   RISK                                    SEV  MITIGATION
  ──   ────                                    ───  ──────────
  R1   Cube leaps off the table                HIGH Edge gate + downgrade-only logic;
                                                    B3 stop-ship; rate limit.
  R2   Startle / distress to the operator      HIGH Section 07 rules S1-S6.
  R3   Loaded spring = stored energy           MED  Slow-bleed fail-safe cam; spring
                                                    only loaded in ARMED; sealed shell.
  R4   Ceramic shell cracks on landing         MED  Elastomer feet, >=2 mm wall, C1 test;
                                                    fallback PA12/ceramic-coat hybrid.
  R5   Noise breaks the "never loud" thesis    MED  Hybrid actuator (silent common path),
                                                    pre-armed spring, S4 ceiling.
  R6   Qi alignment lost after landing         LOW  Beveled dish; HOME gesture (v.1).
  R7   Small-object safety (child/pet access)  HIGH Shell cannot open without tool; no
                                                    loose magnets; small-parts review.
  R8   Mass drift past 120 g                   LOW  30 g headroom; weigh every build.

  COMPLIANCE FLAGS (to verify with counsel / a test lab — not legal advice):
    • FCC Part 15 / ISED for BLE + Qi radiator; CE-RED if sold in the EU.
    • Lithium cell: UL 1642 / IEC 62133, shipping UN 38.3.
    • Product safety: IEC/UL 62368-1; CPSIA / small-parts review because the
      object is cube-sized and desk-toy-adjacent (R7).
    • Any magnet content (v.3 maglev track) triggers loose-magnet consumer
      rules and medical-implant (pacemaker) proximity warnings.

  DESIGN-LOCK CHECKLIST (what must be decided before CAD is frozen)
    [ ] Actuator decision confirmed on Phase A data (Option D or fall back)
    [ ] Shell material (ceramic vs ceramic-coated polymer) on R4 data
    [ ] ToF layout: 3 sensors vs 4 (rear for v.2)
    [ ] BLE bridge: Web Bluetooth PWA first, or LOT® Station first
    [ ] Operator opt-in UX in the LOT® OS settings for Section 07 S2
    [ ] Name of the gesture-opt-in setting in the Terminal Grid copy style

--------------------------------------------------------------------------------
10 // v.1 / v.2 / v.3 PHYSICS PREVIEW
--------------------------------------------------------------------------------

  v.1 LONG JUMP (>150 mm)
    Needs ~66 mJ at takeoff (M = 90 g, 45° launch, v ≈ 1.21 m/s) → ~110 mJ
    stored at 60% efficiency. Roughly 1.4x the v.0 Leap spring — a spring
    swap and a longer cam throw, not a new architecture. This validates the
    choice of Option B/D: the v.0 spring-latch scales. Landing scatter will
    grow with range (scatter ∝ v²); expect to need active in-flight attitude
    trim or a 70 mm landing zone rather than v0.1's 60 mm. Report back after B2.

  v.2 TABLE SWING / WALK
    The cheapest honest path is a STRIDE of small canted hops, each landing on
    the same asymmetric feet, rather than separate traction pads. A 200 mm
    traverse at ~35 mm per hop = ~6 hops; closed-loop heading correction uses
    the IMU yaw and a small off-centre mass shift (reaction wheel < 1 g·cm²).
    v0.1's "actuated traction pads" remain a fallback if stride accuracy is
    below 15 mm cross-track.

  v.3 LEVITATION (research track — recorded honestly)
    ACOUSTIC (v0.1 option a): ultrasonic standing-wave levitation is real but
    suspends objects of order millimetres and milligrams (beads, droplets).
    A 45 mm / ~100 g cube is orders of magnitude beyond it. It could
    still serve a sibling "mote" accessory, not the cube. RECOMMENDATION:
    de-prioritise.
    MAGNETIC (v0.1 option b): actively stabilised electromagnetic levitation
    of a magnet-bearing payload of a few hundred grams over a coil array at
    roughly 10-30 mm gap is demonstrated commercial technology (levitating
    display bases). A 100 g cube at a ~15 mm gap is a credible engineering
    target, with a heavy base unit (the "table" becomes a ~1 kg active pad).
    Diamagnetic and superconducting options need cryogenics or only lift
    grams; not recommended for a consumer desk object.
    Proposed v.3 definition: "LIFT-AND-HOLD" — cube floats 10-15 mm above the
    pad as the new SETTLE gesture and as a "docked" state, with the jump
    gestures retained when off-pad. Gate TBD; not scheduled. The 30 g headroom,
    magnet-free v.0 shell and Qi-less pad slot are all compatible; the one v.0
    commitment needed now is to reserve a 20 mm x 20 mm x 6 mm magnet volume.

--------------------------------------------------------------------------------
11 // CONSUMER USE CASES  (append-only; UC01 is in v0.1 Section 07)
--------------------------------------------------------------------------------

  USE CASE 02 — THE EVENING CLOSE AT THE KITCHEN COUNTER      2026-10-29
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier, a parent of two, QIE archetype "Rhythm
  Architect." Evenings are the only unscheduled hour; the phone is face-down by
  rule. The cube sits in its Qi dish at the end of the kitchen counter, next to
  the kettle. The family's Ambient AI settings include Evening Coherence Close
  (the existing ~22:00 UTC-class job in the QIE ledger, localised to the
  operator's wind-down hour).

  OLD WAY: a notification at wind-down. The phone lights up in the dark
  hallway, competing with the child's night-light, and the operator opens it —
  and ends up in a feed for 25 minutes.

  WITH CUBIQ v.0 (Section 07 rules active; operator opted in to SILENT
  gestures only, and to THE HOP for "Evening Close" only):
    • 20:50 — the bridge schedules a quiet-window arm (S4). The cube winds its
      spring while the dishwasher is running; nobody hears it.
    • 21:00 — a 1.5 s slow LED-ring fade (S1) at the base of the cube. This is
      the only thing the operator perceives first. Then THE HOP: a single
      10 mm rise, in place, in the dish. The cube does not travel; it does not
      move toward anyone (S5).
    • The operator does not pick up the phone. She puts a hand flat on top of the
      cube — the piezo knock sensor registers the touch (touch_latency_ms, 8 s)
      — and the cube goes quiet. The acknowledgment, not a screen, closes the
      loop; QI·46 receives "haptic preference: single touch, 8 s" and the
      Evening Close is delivered later, on her terms, at the lot-systems.com
      cubic session (5-11 min, structured, ends on its own).
    • Next evening she is in a bad mood and the kettle is on; she squeezes the
      cube twice (S2 opt-out gesture). It goes silent for 24 h. The cube does
      not retry; downgrade-only logic (Section 06) means a refused liftoff
      never becomes a nag.
    • After 30 days the operator's feedback in the Section 06 telemetry shows
      acks within seconds on 26 of 30 evenings. The routine is no longer
      "responding to a notification" — it is a household ritual, the way a clock
      chiming is.

  Why this use case matters for v.0: it exercises the parts of the design that
  v0.1 did not, and the parts the first use case could not — a non-solo
  household (child night-light, shared space), quiet-window arming (Section
  04), opt-in ladder and opt-out gesture (Section 07), rate limit (Section 06)
  and a touch acknowledgement that closes the loop without a screen. It also
  corrects v0.1 UC01's one risky element: the cube closing distance toward a
  person is a v.2 behaviour, gated on opt-in (S5).

--------------------------------------------------------------------------------
12 // NEXT CYCLE
--------------------------------------------------------------------------------

  1. Purchase list for Phase A rig (N20 gearmotor, 0.4 mm music-wire springs,
     VCM 10 mm, nRF5340 DK, VL53L4CD x3, ICM-42688 IMU, 150 mAh LiPo), PA12
     SLS shell ×3. Estimated R0 prototype BOM (indicative): USD 180-260 per
     unit at n=3; to be quoted.
  2. Write the BLE command/telemetry schema as a typed module in the LOT
     Computer repo (no hardware dependency) and a mock bridge so the Index of
     Systems → gesture mapping can be tested before any metal is cut.
  3. Add operator opt-in settings spec (Section 07 S2) to the OS settings
     backlog.
  4. Use case 03 candidates: shared-desk team ritual; elder-care hydration
     ping; a child's bedtime countdown; a COSMO®-paired "shared cube" for
     Vadik and Kuzya.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
================================================================================
