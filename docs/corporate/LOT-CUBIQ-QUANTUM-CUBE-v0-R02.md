# LOT® Quantum Cube (CUBIQ™) — v.0 Development Report R02

| Field | Value |
|---|---|
| Document | LOT-CUBIQ-QUANTUM-CUBE-v0-R02 |
| Class | RESTRICTED // S-2 EYES |
| S-2 | Vadik Marmeladov |
| Date | 2026-10-14 |
| Supersedes | Nothing. Extends `LOT-CUBIQ-QUANTUM-CUBE-v0.md` (R01, 2026-07-28) |
| Status | v.0 — ENGINEERING VALIDATION PASS (pre-hardware, design lock still pending) |
| Scope | Jumps (long), horizontal surface swings/jumps, levitation horizon |

> R01 set the architecture and the roadmap. R02 does the arithmetic R01 did not.
> It tests R01 against physics, corrects what does not hold, derives requirements
> from consumer use cases, and defines the build/test plan to reach design lock.

---

## 00 // Reading log

Read before writing (all in `docs/corporate/` unless noted):

| Source | Taken from it |
|---|---|
| `LOT-CUBIQ-QUANTUM-CUBE-v0.md` (R01, own prior work) | Architecture, 4-gesture language, v.0→v.3 roadmap, Use Case 01 |
| `LOT-CUBIQ-VISION.md` §05 | Physical products are "the completion of the cubic", not a pivot |
| `LOT-CUBIQ-OPERATOR.md` §04, §07 Phase 4 | AI decides what/when/how physical objects reach the operator; Day 90+ |
| `LOT_QI46_ENGINE.md` L108–110, L750–764 | Institute corpus names piezoelectric mechanics, nano-ceramic architecture, haptic feedback language; cube as Month-12 input device |
| `CQGS-WHITE-PAPER-SNAPSHOT.md` | Institute (institute.lot-systems.com) research register; Quantum Cube hardware row = PLANNED |
| `docs/benchmark/LOT-MANIFEST.md` | COSMO® Cube is a separate hardware track — no naming collision |
| `docs/README.md`, `docs/benchmark/*` | Doc conventions; report-per-cycle practice |

Branch check: only `master` and this branch exist remotely; no other CUBIQ hardware
documents are in flight.

---

## 01 // Executive summary

1. **R01's direct-drive voice-coil is not credible as written.** A 40 mm "Leap" needs
   ~0.106 N·s of impulse. Delivered in ~5 ms that is a ~21 N average force, ~32 W
   peak electrical-equivalent, from a coil that fits in a 45 mm cube. **Correction:
   store energy in a spring over seconds, release it with a small latch.** Peak power
   drops from tens of watts to ~0.5 W average charge draw.
2. **Hop/Leap/Long-jump all cost under 0.1 J.** A 100 mAh cell holds ~1.3 kJ. Energy
   is not the constraint; *peak power, noise and mechanical reliability* are.
3. **Acoustic levitation (R01 v.3 option a) cannot lift a 90–120 g cube.** Estimated
   radiation force from a ~20 cm² array at 160–170 dB SPL is 0.06–0.6 N versus a
   ~1.0–1.2 N weight. Acoustic is viable only for a sub-10 g object.
   **Magnetic servo-levitation (option b) is promoted to primary.**
4. **A new intermediate milestone, v.2.5 "Hover-Assist", is proposed:** the table
   surface carries electromagnets that *unload* part of the cube's weight, which
   makes table-walking easier and is the first hardware step toward levitation.
5. **New requirement from Use Case 02:** the Nudge must stay under **30 dBA at 0.5 m**.
   R01 had no acoustic budget.
6. Design lock is **not** declared. The first physical task is a 3-day bench rig
   (§08) that measures real impulse before any shell is made.

---

## 02 // Physics validation of R01

Constants: g = 9.81 m/s². All values are first-order estimates on a rigid cube,
no drag, no spring losses — to be replaced by bench data (§08).

### 2.1 Energy and impulse per gesture

| Gesture | Mass | Target | Take-off speed | Take-off KE | Impulse (m·v) |
|---|---|---|---|---|---|
| Nudge | 120 g | no liftoff | — | — | sub-threshold, felt not seen |
| Hop | 120 g | 10 mm rise | 0.44 m/s | 11.8 mJ | 0.053 N·s |
| Leap (R01) | 120 g | 40 mm range @ 75° elevation (15° bias) | 0.89 m/s | 47 mJ | 0.106 N·s |
| Long jump (v.1) | 90 g | 150 mm range @ 45° | 1.21 m/s | 66 mJ | 0.109 N·s |

Findings:

- **Leap also rises ~37 mm.** R01 describes Hop as "<10 mm rise" and Leap as "~40 mm
  displacement"; with a 15° off-vertical bias the Leap's *height* (≈37 mm) is nearly
  its *range*. That is a fine, readable gesture but it is a jump, not a skid.
- **Long jump is not a bigger Leap.** Range of 150 mm needs a ~45° launch, i.e. a
  **different bias angle**, not a stronger identical pulse. R01 §06 v.1 ("re-tuned stroke,
  lighter shell") omitted this. Launch angle becomes an adjustable parameter
  (see §03.3).
- Impulse for Leap and Long jump is nearly identical (~0.11 N·s). A single actuator
  capable of Leap covers v.1 if launch angle is adjustable and mass drops to 90 g.

### 2.2 Why direct drive fails

Delivering 0.106 N·s in a 5 ms stroke ⇒ F_avg ≈ 21 N (≈ 18× the cube's weight),
peak ≈ 40 N, with ~47 mJ of useful KE over 5 ms ≈ 9 W useful, ~30 W electrical at
a realistic 30% coil efficiency. A coil sized for a 45 mm cube would saturate and
overheat, and the battery would sag under the pulse.

### 2.3 Landing loads

Falling 37 mm → 0.85 m/s at touchdown. Arresting over 2 mm of elastomer compliance:
a ≈ 180 m/s² ≈ **18 g**. Survivable for a MEMS IMU and a sealed cell; the weak points
are the shell corners and the actuator mount. Elastomer corner bumpers are required,
not cosmetic. Target: 20,000 landings without corner crack or mount loosening.

---

## 03 // Corrected actuation architecture (supersedes R01 §03 mechanism only)

### 3.1 Spring-store / latch-release ("Cocked Hop")

```
 charge phase (2–6 s, silent)       release phase (<2 ms)
 ┌───────────────────────┐          ┌───────────────────────┐
 │ micro gear-motor winds │          │ latch (SMA wire or    │
 │ a spring against a     │  ──────▶ │ miniature solenoid)   │
 │ reaction mass; latch   │          │ lets mass strike base │
 │ holds                  │          │ → shell leaps         │
 └───────────────────────┘          └───────────────────────┘
```

- Stored energy target: **160 mJ** (Leap 47 mJ at an assumed ~30% mass-strike
  transfer efficiency, plus margin). Spring + 25–30 g reaction mass.
- Charge draw: ~0.2–0.5 W for a few seconds. Release draw: millijoules.
- Side benefit: **the charge sound (soft gear whine) can be masked or scheduled**,
  while the release click is brief. Compare to a 30 W voice-coil slam.
- The cube is "cocked" ahead of time. The AI layer (Index of Systems) can pre-charge
  when it predicts a signal, trading a little idle power for zero-latency response.
- The Nudge becomes a **partial-energy release** or a fast low-amplitude latch
  oscillation, not a separate mechanism.
- Voice-coil is retained *only* as an optional micro-actuator for Nudge/Settle
  (low force, fine control), where its quietness is a virtue.

### 3.2 Launch-angle mechanism (needed for v.0.5 → v.1)

R01 uses a piezo bimorph "fired a millisecond after release". A piezo bimorph tip
force is typically in the 0.1–1 N range; it can deflect a *light* strike point but
cannot add meaningful impulse next to 0.1 N·s. Redefined role:

- **Primary angle control:** reaction-mass strike point is on a tilting yoke (±30°)
  driven by a small hobby-class servo or a shape-memory actuator, set *before* the
  release. Ground truth angle read from the IMU during the charge phase.
- **Piezo bimorph:** retained as a *fine trim / tap* element and as a **contact and
  landing sensor** (it generates charge on impact), reusing the Institute-named
  component class (piezoelectric mechanics, `LOT_QI46_ENGINE.md` L110) in a role it
  is actually suited to.

### 3.3 Parameters exposed by the actuator

| Parameter | v.0 | v.1 | v.2 |
|---|---|---|---|
| Stored energy | 160 mJ fixed | 160–220 mJ stepped | stepped |
| Launch angle | 75° ±5° fixed | 45–80° adjustable | adjustable + yaw |
| Mass | ≤120 g | ≤90 g | ≤100 g (traction pads) |
| Strike points | 1 | 1 (tilting) | 1 + 2 lateral |

### 3.4 Edge safety (unchanged goal, extended)

R01's forward ToF gate stands: no v.0 unit ships without 100/100 edge-approach
trials. Additions:

- Four-direction ToF is deferred to v.2, but v.0 gets a **"cliff check at wake"**: the
  cube pings its ToF sensors in all four directions by rotating a servo-mounted
  sensor, or uses a 4-zone multizone ToF part, before charging the spring. If any
  direction reads an edge within 60 mm, the cube refuses Leap and substitutes a Hop
  (in-place). This costs nothing extra if a multizone ToF is chosen on day 1.
- **Pad-edge lip:** the charging pad (the "table", R01 §02) gets a 3 mm raised rim.
  Cheap, passive, and makes the hard gate easier to pass.
- **Fail-safe default:** loss of ToF reading, IMU fault or battery <15% ⇒ Nudge only.

---

## 04 // Horizontal surface swings / jumps (v.2 research opened)

R01 left friction undefined. First-pass model:

- Elastomer on wood, μ ≈ 0.5–0.7; on glass ≈ 0.3–0.5 (dry), laminate ≈ 0.4–0.6.
  A 15°-biased Leap has horizontal speed ≈ 0.23 m/s and vertical ≈ 0.86 m/s; it is
  airborne ~0.17 s, so friction is irrelevant in flight and **dominates at
  touchdown**: a glass surface at μ=0.3 will skate the cube 5–15 mm further after
  landing than wood. Accept ±15 mm across materials for v.0/v.1; calibrate by
  **landing-slide measurement from the IMU** on the first hop (a "feeler hop")
  and correct the energy of the next one.
- **Swing-hop concept (v.2):** an off-center yaw-biased strike combined with two
  actuated traction pads allows the cube to pivot about one corner each hop. A
  sequence of 3–5 such hops yields a controlled arc of 50–200 mm. This is
  "table-walking" without wheels or feet that scrape.
- **Closed loop:** IMU gyro-z + optical flow chip on the base (PMW-class mouse
  sensor, ~$3) gives displacement and heading. This gives path correction without
  the operator's hardware.
- **Acceptance (unchanged from R01):** 200 mm directed traverse, <15 mm cross-track,
  50/50 trials, 3 surfaces, zero edge incidents.

### 4.1 New: v.2.5 "Hover-Assist" (proposed milestone)

Embed 4–6 small electromagnets in the pad under the cube. Pulse them in anti-phase
with the hop to *cancel 30–60% of the cube's effective weight during friction-critical
moments* (touchdown and traction contact). Result:
- Smaller hops produce the same displacement (quieter).
- Lower landing energy → longer shell life.
- The cube carries a small NdFeB magnet (≤5 g); this does not violate the mass budget
  and doubles as the **seed of v.3 magnetic levitation**.
- Data from v.2.5 (coil currents vs. cube pose) directly seeds the v.3 control model.

---

## 05 // Levitation horizon (v.3) — corrected

| Option | Physics | Verdict for 90–120 g cube |
|---|---|---|
| (a) Acoustic standing-wave | Radiation force F ≈ (acoustic energy density ≈ p²/ρc²) × area. At 160 dB (2 kPa rms) ≈ 28 Pa; ×20 cm² ≈ 0.06 N. At 170 dB ≈ 0.6 N. | **Not feasible** at this mass. Ear-damaging SPL even if reached. Valid only for sub-10 g objects. |
| (b) Active magnetic servo (EM array + permanent magnet in cube) | Weight 1.0–1.2 N. Gap 10–20 mm. Closed-loop position control at ≥1 kHz with Hall sensing. Power on the order of a few W continuous, tens of W for 3-DoF stability. | **Feasible** with known (Earnshaw-constrained) control. Primary v.3 track. |
| (c) Diamagnetic (pyrolytic graphite / superconducting) | Passive, no power for graphite at very small masses; superconductor needs cryo. | Not viable for consumer; graphite lifts only sub-gram plates. Out of scope. |

Notes:
- **Earnshaw's theorem** forbids static passive magnet levitation; control (b) is
  active servo. Requires 3-axis position sensing and a fast loop — achievable with
  an MCU, Hall array, and 4–6 coils.
- **Acoustic is not abandoned** — it gets a sub-brand opportunity: the **Satellite**,
  a ≤8 g companion shell (sold as a desk charm) that can hover in an acoustic node.
  That is a gesture, not a Quantum Cube. Recorded, not scheduled.
- **v.3 gate (first draft):** 60 s unattended hover at 10 mm gap, ±1 mm position
  error, three consecutive power cycles, with cube mass ≤ 120 g. Entry criterion:
  v.2.5 pose-vs-current dataset exists.
- Safety: levitating device must degrade to a *controlled drop* onto the pad
  (soft-landing coil sequence), not a free fall.

---

## 06 // Haptic language — revisions

R01's 4 gestures stay. Parameters added:

| Gesture | Mechanism now | Acoustic limit | Latency from signal |
|---|---|---|---|
| Nudge | voice-coil or latch micro-oscillation | **≤30 dBA @ 0.5 m** (NEW) | <200 ms |
| Hop | cocked spring, partial energy | ≤48 dBA @ 0.5 m | <500 ms (pre-charged) |
| Leap | cocked spring, full energy | ≤55 dBA @ 0.5 m | <500 ms (pre-charged) |
| Settle | coil holds 2 s | ≤25 dBA | <200 ms |

New gestures proposed (all are variants of the existing primitive):

- **The Lean** (v.1): servo-tilts the strike yoke, shifting the cube's resting attitude
  a few degrees — a held angle, no motion. Gentle "attention".
- **The Pivot** (v.2): a single yaw-biased hop turning ≈ 30° in place — "turn toward".

---

## 07 // Consumer use cases (cumulative)

Use cases are appended each cycle, never edited. Each use case lists a **derived
requirement** so the case drives engineering, not just narrative.

### Use Case 01 — The Desk Migration (2026-07-28, R01)
See `LOT-CUBIQ-QUANTUM-CUBE-v0.md` §07. Nudge felt through the desk; Leap closes
40 mm toward the keyboard when a session begins.
**Derived requirements (retroactively logged):** nudge amplitude above skin
vibrotactile threshold (~0.1 g at 150–250 Hz through desk), Leap directional
accuracy ±20 mm.

### Use Case 02 — The Evening Close (2026-10-14, R02)

**Operator:** Usership tier, parent of a young child, Archetype "Steward".
Works days, uses the evening as the only quiet window. The cube lives on the
bedside table next to the charging pad. The child sleeps in the next room with
the door ajar.

**Problem today.** The operator's phone is banned from the bedroom after 21:00
because it lights up and chimes. That also removes the one useful thing the phone
did at that hour: telling them the day is ready to close (the LOT® Evening
Coherence Close, a 5–11 minute structured check from the software cubic).

**With CUBIQ v.0.** At the operator's chosen wind-down hour, the Index of Systems
raises the *Evening Close* signal. The cube:

1. Pre-charges its spring at 20:55 (silent below ambient room noise).
2. At 21:00 performs **The Settle** (2 s of standing pressure, imperceptible to the
   eye, 25 dBA) — the lowest-profile gesture in the vocabulary.
3. If the operator has not acknowledged within 10 minutes (the IMU detects the
   operator tapping the cube — piezo contact sensor), it escalates **once** to
   **The Nudge** (≤30 dBA, felt in the table, not heard in the next room).
4. It *never* escalates to Hop/Leap after sunset unless the operator opts in.
   The cube does not wake a child.

When the operator picks up the cube and lays it on the pad, QI·46 receives the
"acknowledged" haptic signal (pressure, duration — `LOT_QI46_ENGINE.md` L757) and
the Evening Close opens on the phone **in the next room or on the nightstand**,
the cube having done its job as a doorbell, not a screen.

**Why this is a good consumer case.**
- It sells the *quiet* property, which no smartwatch or phone can claim.
- It demonstrates the "anti-feed" thesis (R01 §04): the cube *reduces* the screen
  presence in the bedroom.
- It gives the Month-12 hardware-delivery moment (QI·46) a tangible reason to be
  placed on a nightstand, not a desk.
- It is reachable at **v.0**: it uses only Nudge, Settle, and the IMU/piezo contact
  sense — no long jump, no table-walking, no levitation.

**Derived requirements (new, gating):**

| ID | Requirement | Gate |
|---|---|---|
| UC02-R1 | Nudge ≤30 dBA @ 0.5 m, Settle ≤25 dBA | Measured in a <25 dBA room, 20/20 trials |
| UC02-R2 | Charge-phase (spring wind) ≤22 dBA, or scheduled ahead of use | Pre-charge scheduler implemented |
| UC02-R3 | Time-of-day gesture ceiling (user-configurable quiet hours: max gesture = Nudge) | Firmware config + app setting |
| UC02-R4 | Pick-up detection (IMU lift + piezo contact) as acknowledgment | ≥98% true-positive, ≤1% false-positive over 7 days |
| UC02-R5 | Single-escalation policy (no repeats after Nudge) | Unit test on gesture scheduler |
| UC02-R6 | Operates from a dark room: LED ring off unless charging/pairing | Verified |

### Use Case 03 — (reserved)
Next cycle appends here. Candidate directions already identified:
(a) **The Long Jump as shared-table courier** — two operators' cubes on one shared
cohort desk (Cohort Resonance); (b) **Table-walking to the hand** for the elderly /
low-vision operator; (c) **Hover-Assist dock** as a living-room object.

---

## 08 // Build plan to design lock

| # | Task | Output | Gate |
|---|---|---|---|
| T1 | Bench impulse rig: spring + reaction mass + latch on a force plate or high-speed phone video (240 fps) | Measured impulse, KE, transfer efficiency | Efficiency ≥ 25% else redesign |
| T2 | 3D-printed 45 mm shell (resin), 120 g ballasted, no electronics, dropped from rig | Landing survivability (corner, mount) | 1000 landings, no crack |
| T3 | Electronics board v0: MCU (BLE), 6-axis IMU, 4-zone ToF, piezo ADC, motor driver, 100 mAh LiPo, Qi RX | Board bring-up | Boots, streams IMU at ≥500 Hz |
| T4 | Firmware: gesture scheduler, quiet-hours policy, edge gate, fail-safe | Passing unit tests | UC02-R3, R5 pass |
| T5 | Edge-approach test (pad with rim) | 100/100 trials | **Hard gate** |
| T6 | Cycle test | 500/500 hop-and-recover (R01 gate) | Zero off-table, zero actuator fail |
| T7 | Acoustic test (anechoic closet or <25 dBA room) | dBA per gesture | UC02-R1 |
| T8 | Pick-up detection pilot, 3 devices, 7 days | UC02-R4 stats | Meets gate |
| T9 | Design lock review (S-2) | Signed spec | All above green |

### Indicative bill of materials (v.0 prototype, single unit)

| Item | Role | Est. cost |
|---|---|---|
| BLE MCU module | Control | $4–8 |
| 6-axis IMU | Pose, landing recovery, pick-up | $2–4 |
| 4-zone ToF | Edge gate | $6–12 |
| Piezo disc + ADC | Contact/landing sense | $1 |
| Gear-motor + spring + latch + reaction mass | Cocked Hop | $10–20 |
| Voice-coil micro-actuator | Nudge/Settle | $5–10 |
| 100 mAh LiPo + charger IC + Qi RX | Power | $8–12 |
| Resin/composite shell + elastomer bumpers | Body | $10–30 (proto) |
| **Prototype subtotal** | | **≈ $45–100** |

(Estimates only, no quotes obtained; pricing is for a one-off prototype and is not
a production cost.)

---

## 09 // Risk register

| ID | Risk | L | I | Mitigation |
|---|---|---|---|---|
| R-1 | Mass-strike efficiency lower than 25% | M | H | T1 bench test first; fallback: bigger spring, 140 g mass budget |
| R-2 | Noise exceeds bedside budget | H | H | Latch dampers, rubber-mount, pre-charge schedule, quiet-hours default |
| R-3 | Cube leaves table | M | Critical | Rim lip, 4-zone ToF, fail-safe Nudge-only, hard gate T5 |
| R-4 | Drop damages shell/IMU | M | M | Corner bumpers, 20k landing life test |
| R-5 | Surface variance exceeds ±15 mm | H | M | Feeler-hop calibration; document surface list |
| R-6 | Magnetic levitation power budget too high | M | M | v.2.5 data; allow powered "dock" form factor |
| R-7 | Child/pet safety (small parts, battery) | M | Critical | Sealed shell, UL/CE-class battery protection, no user-openable seams, compliance review before any consumer unit ships |
| R-8 | Qi pad heats the cube's magnet/cell | L | M | Thermal cutoff at 45 °C |
| R-9 | Brand overlap with COSMO® Cube | L | M | Naming rule: CUBIQ™ = notification body; COSMO® Cube = computer |

---

## 10 // Decisions and open questions

**Decisions taken in R02**
1. Spring-store/latch-release replaces direct-drive voice-coil as the primary
   jump mechanism (R01 §03 amended; the rest of R01 §03 stands).
2. Magnetic servo-levitation is the primary v.3 track; acoustic reserved for a
   sub-10 g Satellite accessory.
3. v.2.5 Hover-Assist added to the roadmap.
4. Quiet-hours ceiling and acoustic budgets become v.0 requirements.

**Open questions for S-2**
1. Is "Satellite" a desired accessory line, or is acoustic dropped entirely?
2. Should v.0 target Qi (power only) *or* also use the pad as a data/position
   reference (e.g., fiducial coils)? Affects v.2 closed-loop design.
3. Do we pursue a 4-zone ToF on day 1 (recommended) or add sensors at v.2?
4. Are we shipping bedroom use as an official positioning (UC02) given child-safety
   compliance obligations (R-7)?

---

## 11 // Changelog

| Version | Date | Change |
|---|---|---|
| R01 / v0.1 | 2026-07-28 | Initial v.0 architecture, gesture language, roadmap, UC01 |
| R02 / v0.2 | 2026-10-14 | Physics validation, actuator correction, v.2.5, levitation correction, UC02, build plan, risks |

---

**AUTHORIZED BY:** S-2 // VADIK MARMELADOV
*END LOT-CUBIQ-QUANTUM-CUBE-v0-R02*
