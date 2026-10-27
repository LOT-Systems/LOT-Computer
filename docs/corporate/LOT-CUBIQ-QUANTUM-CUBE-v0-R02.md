================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-CUBIQ-QUANTUM-CUBE-v0-R02
TITLE:    LOT® Quantum Cube (CUBIQ™) — v.0 Development Report, Cycle 02
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-27
VERSION:  0.2 — ENGINEERING DERIVATION + BUILD PLAN
STATUS:   v.0 — DESIGN LOCK BLOCKED ON 3 S-2 DECISIONS (SECTION 10)
PARENT:   docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md (cycle 01, 2026-07-28)
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG
--------------------------------------------------------------------------------

Read before writing (this cycle):

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md   (my own cycle-01 spec — re-read in full)
  docs/corporate/LOT-CUBIQ-VISION.md            (anti-feed thesis; Section 05 physical arc)
  docs/corporate/LOT-CUBIQ-OPERATOR.md          (session structure; Index of Systems)
  docs/corporate/LOT_QI46_ENGINE.md             (Layer 0 corpus: piezoelectric, nano-
                                                 ceramic, haptic language; Step 3.3 cube
                                                 sync as INPUT signal)
  docs/corporate/LOT_PTSD_Protocol.md           (trauma-informed adjustment doctrine —
                                                 source for Use Case 02)
  docs/benchmark/LOT-MANIFEST.md                (COSMO® Cube is a separate track; no
                                                 naming collision introduced)

Prior record of CUBIQ™ hardware: ONE document (cycle 01). No firmware, CAD, BOM, or
test data exists anywhere in the repo. Everything below is derivation and plan, not
measurement. Nothing in this report claims a built or tested device.

--------------------------------------------------------------------------------
01 // EXECUTIVE SUMMARY
--------------------------------------------------------------------------------

  1. CYCLE-01 SPEC HAS A PHYSICS ERROR. It specifies THE LEAP as a ~40 mm
     displacement with a 5–15° forward bias off vertical, while THE HOP rises
     <10 mm. These cannot both hold. At 5–15° bias a 40 mm range needs a 37–114 mm
     apex and 47–136 mJ of shell energy. A 40 mm range at a 10 mm apex requires a
     45° launch. The piezo bimorph "bias element" cannot deliver a 45° impulse.
     FIX PROPOSED: Section 03.

  2. MASS BUDGET DID NOT CLOSE. A solid nano-ceramic shell at 2 mm wall is ~60–85 g
     alone — half to three-quarters of the 120 g target. FIX PROPOSED: Section 05.

  3. A 45° LEAP NEEDS FOOT FRICTION μ ≥ ~1.0. The strike axis is held by the ground.
     Glass will fail it. The friction model cannot wait for v.2; it moves into
     v.0 as a measured surface table. Section 04.

  4. PEAK POWER, NOT ENERGY, IS THE ELECTRICAL PROBLEM. One Leap is ~0.2 J (trivial
     for the battery) delivered in ~8 ms (~12–25 W peak). v.0 needs a supercapacitor
     burst stage. Section 05.

  5. LEVITATION: ACOUSTIC IS OUT FOR A 100 g CUBE. Active electromagnetic
     suspension is the only credible v.3 candidate. Section 09.

  6. NEW CONSUMER USE CASE 02 — THE STARTLE-SAFE EVENING CLOSE. It adds a
     consent/quiet-mode requirement set the cycle-01 spec lacked. Section 07.

--------------------------------------------------------------------------------
02 // WHAT CHANGED SINCE CYCLE 01
--------------------------------------------------------------------------------

  ITEM                         CYCLE 01                     CYCLE 02
  ────                         ────────                     ────────
  Leap geometry                5–15° bias, 40 mm            45° off vertical, 40 mm, 10 mm apex
  Directional impulse          piezo bimorph                canted strike axis (D-01)
  Shell                        "nano-ceramic composite"     ceramic-loaded polymer / thin-wall
                                                            ceramic coat, 35–40 g (D-02)
  Power                        Qi charge only               Qi + LiPo + supercap burst stage
  Friction model               v.2                          v.0 surface table (3 surfaces min.)
  Quiet / consent behavior     absent                       first-class (UC-02, Section 07)
  Telemetry                    IMU only                     IMU + pickup/acknowledge latency
  Use cases                    01                           01, 02 (+ queue for 03–07)
  Test plan                    one 500-cycle gate           5-stage bench program, Section 08

--------------------------------------------------------------------------------
03 // GESTURE PHYSICS — RE-DERIVED
--------------------------------------------------------------------------------

Model: point-mass ballistics; internal hammer strikes the shell inelastically
(m_h·v_h = M·v); constant acceleration over the hammer stroke. Lossless — real
numbers will be worse. Reproduce with docs/corporate/cubiq/cubiq_v0_physics.py.

3.1 THE CYCLE-01 SPEC, AS WRITTEN (M = 120 g, range 40 mm)

  Bias off vertical     Apex needed     Shell KE
  5°                    114 mm          136 mJ
  10°                    57 mm           69 mJ
  15°                    37 mm           47 mJ
  Spec says THE HOP rise: <10 mm.   → INCONSISTENT.

3.2 RE-DERIVED v.0 GESTURES (M = 120 g, hammer 30 g, 10 mm stroke)

  Gesture      Launch       Apex    Range   Shell KE   Hammer KE   Stroke F / t    μ needed
  ───────      ──────       ────    ─────   ────────   ─────────   ────────────    ────────
  NUDGE        no liftoff   0       0       —          —           ~1 N, 150–250 Hz burst   —
  HOP          vertical     10 mm   0       11.8 mJ    47 mJ       4.7 N / 11 ms   0
  LEAP         45° off vert 10 mm   40 mm   23.5 mJ    94 mJ       9.4 N / 8 ms    ≈1.0
  SETTLE       held load    0       0       —          —           <0.5 N, 2 s     —

  Landing: a 10 mm drop lands at 0.44 m/s with 11.8 mJ — soft enough for the
  elastomer feet and IMU-based recovery. Both HOP and LEAP share the 10 mm apex,
  so landing loads are identical. That is deliberate: one landing envelope to
  qualify.

  NUDGE note: skin vibrotactile sensitivity peaks roughly in the 150–300 Hz band,
  so the Nudge is a short burst in that band rather than a single pulse. Frequency
  to be tuned on the bench; the band comes from general haptics literature and has
  not been verified against a LOT® Institute source.

3.3 PROPOSED FIX — D-01: CANTED STRIKE AXIS

  Option A (recommended): two orthogonal voice-coil axes, one hammer. Vertical coil
    alone = HOP. Vertical + forward coil firing together at equal amplitude = LEAP
    (45°). Piezo bimorph is retained only as a fine trim / NUDGE-band driver, not
    as the directional source. Costs ~6 g and one driver channel. Gives v.2 its
    second axis early (a bonus, not a commitment).
  Option B: one coil mounted at a fixed 45° canted axis. HOP becomes a lower-
    efficiency compromise (cube always hops forward). Simpler, one fewer part,
    but a "hop in place" no longer exists.
  Option C: keep piezo bias and accept a ~15° Leap with 37 mm apex. Rejected: the
    cube leaves the 40 mm landing radius spec and the edge-detect cone was sized
    for a 10 mm apex.

  RECOMMENDATION: Option A.

--------------------------------------------------------------------------------
04 // FRICTION, LANDING, EDGE SAFETY
--------------------------------------------------------------------------------

  FRICTION GATE
    A 45° strike axis needs μ ≥ tan 45° = 1.0 at the feet or they slide while the
    hammer accelerates, wasting the horizontal component. Dry silicone/TPU on
    glass may or may not clear 1.0; wood and laminate are likely nearer 0.6–0.9
    (my estimates — to be measured, not assumed).
    v.0 DELIVERABLE: a measured μ table for ≥3 surfaces (wood, glass, laminate) and a
    per-surface Leap amplitude lookup. The cube infers surface class during the
    first few Hops (IMU response signature) and degrades the Leap to a Hop-with-
    drift if μ is below threshold. A Leap that slides off a table is worse than
    no Leap.

  EDGE DETECTION (carried from cycle 01, tightened)
    Cycle-01: single forward ToF, 20 mm inhibit. With a Leap that can now go
    ≥40 mm in the commanded direction and a 10 mm apex, the cone must cover the
    FORWARD sector at ≥3× the commanded range (120 mm) plus a downward-looking
    cliff sensor at the base. Inhibit rule: if ANY edge return within 3× range →
    Leap becomes Hop-in-place. 100/100 edge-approach trials remains a ship gate.

  DROP SURVIVAL (new)
    A cube that hops on a desk will eventually fall off one. A 750 mm desk drop
    lands at ~3.8 m/s. v.0 gate: 30 drops (5 per face-up orientation) from 1 m onto
    hardwood with no functional failure. Rated by firmware self-test on next boot.

--------------------------------------------------------------------------------
05 // ARCHITECTURE & BUDGETS
--------------------------------------------------------------------------------

5.1 MASS BUDGET (target ≤120 g; estimates, to be replaced by CAD)

  Shell (ceramic-loaded polymer or 1.5 mm ceramic-coated shell)   35–40 g
  Hammer (brass, ~30 g ≈ 3.5 cm³)                                  30 g
  Two voice-coil axes + magnets (D-01 Option A)                    16 g
  LiPo ~300 mAh                                                     7 g
  Supercap/boost stage                                              4 g
  PCB, MCU, IMU, ToF×2, cliff sensor, capacitive pickup sense       7 g
  Qi receiver coil                                                  4 g
  Elastomer feet ×4                                                 2 g
  Fasteners/misc/margin                                             5 g
  TOTAL                                                       110–115 g

  Check on the shell: 45 mm cube, 2 mm wall → 22.2 cm³ → 56 g at 2.5 g/cm³ or 87 g
  at alumina's ~3.9 g/cm³. A solid ceramic shell does not fit. D-02 asks S-2 to
  accept a ceramic-loaded polymer shell (or ceramic-finished) as "nano-ceramic".

5.2 POWER
  Energy per Leap: ~0.1 J hammer KE at ~50% coil efficiency → ~0.2 J. A 300 mAh
  cell holds ~4 kJ. Energy is a non-issue; 10,000+ gestures per charge.
  Peak: ~94 mJ in 8 ms ≈ 12 W mechanical, ~25 W electrical at 50% efficiency —
  far beyond what a small LiPo should be asked to source repeatedly. Supercapacitor
  burst stage (precharged between gestures) is required.

5.3 CONTROL STATE MACHINE (firmware v.0)

  IDLE ──signal──▶ CHECK_ENV (quiet mode? edge? surface class?)
    │                    │
    │                    ├─ unsafe/quiet ──▶ DOWNGRADE (Leap→Hop→Nudge→Settle)
    │                    ▼
    │                PRE_CUE (UC-02: 3 s ramp-in "knock", skipped only for HOP/LEAP
    │                          in Standard mode)
    │                    ▼
    │                ARM (supercap check, IMU baseline)
    │                    ▼
    │                FIRE (axis timings per gesture)
    │                    ▼
    │                LAND_WATCH (IMU: flight detected? tilt >25°?)
    │                    ▼
    └────────────── RECOVER (righting pulse, max 2 attempts, then park + report)

  Hard rules: never FIRE without a passing edge check; never FIRE in Quiet mode
  except NUDGE/SETTLE; ≥10 s lockout between hop-class gestures.

5.4 LINK
  BLE cube ↔ pad; pad (Wi-Fi) ↔ lot-systems.com. The pad is already the power
  source (Qi) and surface, so it is also the gateway. Signal payload (draft):
  { gesture, intensity 0–1, reason (badge|memory|phase|cohort), quietOverride:false }.
  Server never sends an amplitude above the cube-local cap.

--------------------------------------------------------------------------------
06 // SIGNAL → GESTURE MAP (revised)
--------------------------------------------------------------------------------

  SIGNAL (Index of Systems)       GESTURE   NOTE
  ─────────────────────────       ───────   ────
  Memory question ready           NUDGE     unchanged
  Badge unlocked, common/uncomm.  HOP       unchanged
  Badge unlocked, rare and above  LEAP      now requires surface check (Section 04)
  Assembly phase advanced         SETTLE    unchanged
  Evening close (UC-02)           SETTLE    new: pre-cued, Quiet-mode-safe
  Session ended / pickup          —         new: telemetry only, no motion

--------------------------------------------------------------------------------
07 // CONSUMER USE CASES
--------------------------------------------------------------------------------

Use Case 01 (THE DESK MIGRATION, 2026-07-28) stands unchanged in the parent
document. Cycle 02 adds Use Case 02 below and, per the parent's rule, it is also
appended to Section 07 of the parent file.

  USE CASE 02 — THE STARTLE-SAFE EVENING CLOSE               2026-10-27
  ─────────────────────────────────────────────────────────────────
  Operator profile: Usership tier. Former night-shift ER paramedic, now in
  logistics. Trauma-informed adjustments are active (LOT_PTSD_Protocol.md —
  "adjust approach to be more supportive when patterns emerge"). Lives in a
  one-room flat; the CUBIQ pad sits on the nightstand-height shelf beside the bed.

  THE PROBLEM
    For this operator a phone buzz after dark is not neutral. It lands in the
    same register as a pager. A cube that hops at 22:40 because a rare badge
    unlocked would be a pager with a better industrial design. The cycle-01 spec
    treats motion as universally gentle. For this operator it is not. The anti-
    feed thesis ("presence without spectacle") is the right instinct and
    the wrong sufficiency.

  THE EVENING
    At sunset the cube enters QUIET MODE — driven by the same circadian phase the
    OS already computes (getCircadianPhase in the client) and by the operator's
    trauma-informed flag. In Quiet mode HOP and LEAP are disabled outright, not
    merely softened. The badge that unlocked at 20:15 does not move the cube; it is
    held for morning.

    At 22:00 the Index of Systems fires the evening close (a 3-minute
    grounding: Breathe → Ground → close). The cube does not leap toward the
    bed. It runs PRE_CUE: a barely perceptible rising tremor over three seconds —
    the physical equivalent of knocking before entering. Then a single SETTLE: a
    two-second standing pressure, no movement, no sound. The operator, already
    awake and reading, sets a hand on the cube.

    THE ACKNOWLEDGE GESTURE
    Picking up or covering the cube is the acknowledgment. Capacitive sense plus
    IMU register it; the cube goes still and stays still. No swipe, no screen, no
    "dismiss." The operator opens lot-systems.com only if they want the 3-minute
    close; otherwise the pickup alone is logged as "seen, declined" and the cube
    stays silent until morning. Declining is a first-class outcome, not a failure.

    OUTCOME SIGNAL
    Pickup latency (SETTLE → hand contact) and decline rate feed the QI·46 haptic-
    preference channel (parent doc Section 05; QI46 line 757). A rising decline
    rate is read as "this operator wants less", and the Calibration Loop lowers
    cube cadence instead of escalating — the inverse of every engagement-
    optimizing notification system.

  DERIVED REQUIREMENTS (new, binding on design lock)
    UC02-R1  Quiet mode is hard-disabled motion, enforced in cube firmware, not
             server policy. A compromised server cannot make a Quiet cube hop.
    UC02-R2  PRE_CUE before any non-Nudge gesture in Quiet mode; ≥3 s ramp.
    UC02-R3  Acoustic limit while in Quiet mode: target <30 dBA at 30 cm for
             SETTLE and NUDGE. Threshold is a placeholder; measure and set from data.
    UC02-R4  Capacitive/IMU pickup acknowledge ends any pending notification.
    UC02-R5  Operator-set override: the operator, not QI·46, chooses to lift Quiet
             mode. QI·46 may only recommend lowering cadence.
    UC02-R6  No notification content escalation while declined (no repeat gestures
             for the same signal).

  WHAT THIS USE CASE CHANGES IN THE SPEC
    Section 04's four-gesture vocabulary becomes a mode-dependent vocabulary
    (Standard vs Quiet). Section 5.3's state machine gains CHECK_ENV and PRE_CUE.
    Telemetry gains pickup latency. Non-medical: this is not a diagnostic or
    therapeutic claim — consistent with the PTSD protocol's "not a diagnostic tool".

  USE-CASE LEDGER & QUEUE
  ┌────┬──────────────────────────────┬────────────┬──────────────────────────┐
  │ #  │ NAME                         │ DATE       │ STATUS                   │
  ├────┼──────────────────────────────┼────────────┼──────────────────────────┤
  │ 01 │ The Desk Migration           │ 2026-07-28 │ written (parent doc)     │
  │ 02 │ The Startle-Safe Evening Close│ 2026-10-27 │ written (this report)    │
  │ 03 │ The Fast-Day Marker (Lent    │ queued     │ low-motion Settle on a   │
  │    │   diet, LOT-LENT-DIET doc)   │            │ dietary-discipline day   │
  │ 04 │ The Shared Desk (cohort ping)│ queued     │ two cubes, resonance ping│
  │ 05 │ Bedtime Anchor for a Parent  │ queued     │ child-safe amplitude cap │
  │ 06 │ The Travelling Cube          │ queued     │ hotel-desk surfaces, no  │
  │    │                              │            │ calibrated pad           │
  │ 07 │ Medication & Care Cadence    │ queued     │ regulatory review first  │
  └────┴──────────────────────────────┴────────────┴──────────────────────────┘

--------------------------------------------------------------------------------
08 // BENCH PROGRAM TO CLOSE v.0
--------------------------------------------------------------------------------

Proposed dates are proposals only, pending S-2 approval of the three decisions in
Section 10.

  STAGE  DELIVERABLE                                       GATE                     PROPOSED
  ─────  ───────────                                       ────                     ────────
  M0     Design lock: D-01/02/03 decided; CAD; BOM         S-2 sign-off             Nov 2026
  M1     Single-axis hammer bench rig (no shell)           HOP: 10 ± 3 mm apex,     Dec 2026
                                                           ≥ 95/100 on 1 surface
  M2     Two-axis rig + surface μ table                    LEAP: 40 ± 12 mm on ≥2   Jan 2027
                                                           of 3 surfaces; μ table
                                                           published
  M3     Integrated cube proto: shell, IMU, ToF, cliff,    Edge test 100/100; no    Feb 2027
         supercap, firmware state machine                   unsafe fire
  M4     Quiet-mode & acknowledge firmware (UC-02)         UC02-R1…R6 verified;     Feb 2027
                                                           hard-disable fuzz-tested
                                                           against random BLE input
  M5     500-cycle endurance + 30-drop survival            500/500, 0 off-table,    Mar 2027
                                                           30/30 drops
         → v.0 closed. v.1 opens.

  MEASUREMENT RIG: 240 fps phone camera + scale grid (apex, range), IMU log at
  ≥1 kHz, a force plate or load cell under the pad for impulse. Replace every
  figure in Section 03 with measured values at M1/M2. This cycle's numbers are a
  design target, not evidence.

--------------------------------------------------------------------------------
09 // ROADMAP UPDATE — v.1 → v.3
--------------------------------------------------------------------------------

  v.1 THE LONG JUMP (>150 mm)
    Derived: M = 90 g, 150 mm range, 40 mm apex needs ~1.21 m/s, ~66 mJ shell KE,
    ~239 mJ hammer KE, ~20 N over a 12 mm stroke in ~5.5 ms. That is a ~2.5×
    force and ~2.5× peak power jump from the v.0 Leap and a 0.9 m/s landing.
    v.1 landing needs compliant shell corners or a righting mechanism that survives
    ~66 mJ impacts. Mass reduction to 90 g (from 110–115 g) conflicts with the
    larger hammer. Honest read: 150 mm may need a heavier hammer ratio and a ~100 g
    cube. S-2 should expect the v.1 mass target to be revised.

  v.2 HORIZONTAL SWINGS / TABLE-WALKING
    Largely de-risked by D-01 Option A (second axis exists early) and the v.0
    μ table. Still open: yaw control and path-correction. Gate unchanged
    (200 mm traverse, <15 mm cross-track error, 50/50, zero edge incidents).

  v.2.5 THE FLOAT (new, proposed)
    A pad with embedded electromagnet array partly UNWEIGHTS the cube (reduces
    foot normal force by 30–70%) using a magnet in the cube. Not levitation —
    but it reduces friction and impact loading, and it proves the pad-coil +
    cube-magnet + Hall-feedback loop the v.3 needs. Zero new cube mass beyond
    the magnet.

  v.3 LEVITATION — REVISED RESEARCH POSITION
    (a) ACOUSTIC: published acoustic levitators suspend objects at roughly
        millimetre scale (sub-gram to a few grams) (my recollection of the
        literature — verify before citing). A 100 g cube is about two orders of
        magnitude beyond that. REJECT for the cube; keep as an Institute
        demonstrator for small LOT® objects (not a cube).
    (b) ACTIVE ELECTROMAGNETIC SUSPENSION: by Earnshaw's theorem static magnets
        cannot give stable levitation, so feedback is required: Hall-sensor array
        at 1–5 kHz loop rate driving pad coils against a permanent magnet in the
        cube. Lift needed: 1.18 N (120 g) or 0.88 N (90 g) at a target 5–15 mm
        gap. This is the standard "maglev module" approach and is the only
        candidate this report endorses. Needs a controls hire or partner.
    (c) DIAMAGNETIC: weak forces; not viable at this mass. REJECT.
    SAFETY: the permanent magnet is a high-strength neodymium type. Swallowed
    magnets are a serious pediatric hazard. The v.3 cube needs an interlocked,
    non-removable magnet enclosure and explicit regulatory review before any
    consumer sale.

  REGULATORY LIST TO OPEN (names only — scope not researched this cycle):
    FCC Part 15 (radio), Qi/WPC certification, IEC/UL 62368-1 (product safety),
    UN 38.3 for lithium shipping, CPSC magnet and small-parts rules, CPSIA if
    marketed to children. The phrasing "Quantum Certified Factory" from the CQGS
    snapshot has no bearing on any of these.

--------------------------------------------------------------------------------
10 // DECISIONS REQUESTED FROM S-2
--------------------------------------------------------------------------------

  D-01  Directional impulse: Option A (two orthogonal coils, recommended) /
        B (one canted coil) / C (keep piezo, reduce Leap to ~15°).
  D-02  Shell: accept "ceramic-loaded polymer or ceramic-finished" as meeting the
        nano-ceramic material line, to stay ≤120 g.
  D-03  Approve Quiet mode as hard-disabled motion in firmware (UC02-R1) as a
        design-lock requirement, and the rejection of acoustic levitation for the
        cube.

  If no response, the next cycle proceeds assuming D-01 Option A, D-02 yes,
  D-03 yes, and says so at the top of its report.

--------------------------------------------------------------------------------
11 // NEXT CYCLE (03) PLAN
--------------------------------------------------------------------------------

  1. Read this report + parent first.
  2. Append Use Case 03 to parent Section 07 and this ledger.
  3. Produce CAD-level dimensioned layout for the 45 mm cube (internal volume
     allocation) and a first-pass BOM with named component classes.
  4. Resolve any S-2 decisions; if none, state assumptions.
  5. If hardware parts are available, replace the Section 03 model with measured
     data from M1.

--------------------------------------------------------------------------------
12 // LIMITS OF THIS REPORT
--------------------------------------------------------------------------------

  - Nothing here is measured. All numbers are first-order models or estimates.
  - Material densities, friction coefficients, haptic frequency band, acoustic
    levitation limits, and regulatory names come from general engineering knowledge
    and were not looked up this cycle. The parent doc's LOT® Institute citations
    were re-read and not extended.
  - Schedules are proposals. No hardware, vendor, or budget has been committed.
  - This is a notification device description. No therapeutic or diagnostic claim
    is made anywhere, including in UC-02.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-R02
================================================================================
