# LOT® Quantum Cube (CUBIQ™) — v.0 Development Report 02

| Field | Value |
|---|---|
| Document | LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02 |
| Class | RESTRICTED // S-2 EYES |
| S-2 | Vadik Marmeladov |
| Date | 2026-11-08 |
| Cycle | 02 (follows spec v0.1 of 2026-07-28) |
| Scope | Energy budget, actuator sizing, test protocol, risk register, Use Case 02 |
| Status | v.0 — PRE-HARDWARE. Numbers below are first-order physics, not measurements. |

---

## 00 // Reading log

Read before writing, in this order:

1. `docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md` — the v0.1 spec (hop primitive, 4-gesture language, v.0→v.3 roadmap, Use Case 01).
2. `docs/corporate/LOT-CUBIQ-VISION.md` and `LOT-CUBIQ-OPERATOR.md` — the software cubic and the Phase 4 "Physical Extension".
3. `docs/corporate/LOT_QI46_ENGINE.md` — cube as input device (Month 12), piezo/nano-ceramic material line.
4. `docs/corporate/CQGS-WHITE-PAPER-SNAPSHOT.md` — "Quantum Cube Hardware: PLANNED".
5. `docs/corporate/LOT_ROBOTICS_COSMO.md` — COSMO® robotics lineage; CUBIQ™ stays a notification body, not a robot or computer.
6. My own prior output: the v0.1 spec above. No earlier cycle report exists, so this is Report 02 of the series; Use Case 01 stands untouched.

**Brief:** v.0 of an actuated haptic notification device capable of long jumps, horizontal surface swings/jumps, and eventually levitation. The v0.1 spec already assigns these to v.1 (long jump), v.2 (table-walking) and v.3 (levitation research). This report does not change that ordering. It makes v.0 buildable by putting numbers on it.

---

## 01 // What this cycle adds

The v0.1 spec defined *what* the cube does. It gave no energy, force or timing figures, so a hardware engineer could not size a part from it. This cycle adds:

- an energy budget for every motion class (Section 02);
- actuator sizing for the v.0 voice-coil reaction-mass design (Section 03);
- a correction to the spec's piezo-bias mechanism (Section 04);
- a test protocol that turns the existing gates into runnable procedures (Section 05);
- a risk register (Section 06);
- Use Case 02 (Section 08).

---

## 02 // Energy budget (first-order, ideal)

Method: ballistic flight on a flat surface, no air drag, no landing losses. Real units need a multiplier for actuator efficiency (assume 25–40%, a typical range for voice-coil/spring impulse devices; **to be measured**).

| Motion | Mass | Target | Launch speed | Kinetic energy at liftoff |
|---|---|---|---|---|
| v.0 HOP | 120 g | 10 mm rise | 0.44 m/s | 11.8 mJ |
| v.0 soft hop | 120 g | 5 mm rise | 0.31 m/s | 5.9 mJ |
| v.0 LEAP | 120 g | 40 mm range at 45° | 0.63 m/s | 23.5 mJ |
| v.1 LONG JUMP | 90 g | 150 mm range at 45° | 1.21 m/s | 66 mJ |
| v.1 LONG JUMP (flatter) | 90 g | 150 mm range at 30° | 1.30 m/s | 77 mJ |
| v.1 stretch | 90 g | 200 mm range at 45° | 1.40 m/s | 88 mJ |

Reading the table:

- The v.0 LEAP needs about 2× the energy of the hop, and the v.1 long jump about 3× the LEAP. The "long jump" is a power problem, not just a tuning problem. The v0.1 claim that v.1 is a re-tune of the same actuator holds only if the v.0 actuator is sized with that headroom from the start.
- **Design rule:** size the v.0 actuator and spring for ≥100 mJ delivered at the shell, even though v.0 uses ≤24 mJ. This is the cheapest way to keep "nothing in v.0 is thrown away."
- With 25–40% efficiency, 100 mJ delivered means 250–400 mJ drawn from storage per jump. A 300 mAh / 3.7 V cell holds about 4 kJ, so cell capacity is not the constraint. The limit is the peak current of the cell and the capacitor or boost stage that delivers a ~10–30 ms pulse.
- A 200 mm traverse (v.2) is a 1.4 m/s launch. That is only reachable as repeated smaller hops if edge-safety margins are to hold. Plan v.2 as multi-hop, not one big bound.

---

## 03 // Actuator sizing, v.0 reference

Momentum conservation for an internal reaction mass: the shell (mass M minus reaction mass m) recoils against the reaction mass moving at v_r.

- Reaction mass: **25 g** (about 21% of the 120 g budget; tungsten-loaded slug).
- Required reaction-mass speed for the 90 g, 1.3 m/s long-jump case: roughly **1.8 m/s** over the stroke.
- Stroke: **8 mm**. Reaching 1.3 m/s over 8 mm implies about 105 m/s² (≈11 g) average acceleration. This is moderate for a voice coil. The hard part is the *peak* current and keeping the pulse short and repeatable.
- Spring pre-load stores most of the energy (charged slowly by the coil at low power, released fast). A latch-and-release topology is quieter and more repeatable than driving the whole impulse electrically.
- Shell weight on the table is 1.18 N (120 g). The impulse must overcome this plus the elastomer-foot stiction, so the foot compound is a first-class design parameter.

**Open item:** none of the above is validated. The first bench build is a single-axis test rig (coil + slug + spring, shell mocked as a 120 g block) used only to measure delivered energy per pulse.

---

## 04 // Correction to v0.1: the forward-bias mechanism

The v0.1 spec uses a piezo bimorph fired a millisecond after release to bias the hop 5–15° forward. This report flags that as **unlikely to work as written**: a small bimorph moves on the order of tens of micrometres and delivers a small fraction of a millijoule, against a 12–24 mJ hop. It cannot steer the impulse by 5–15°.

Proposed replacements, in order of preference for the v.0 bench:

1. **Tilted actuator axis.** Mount the coil axis 5–15° off the cube's vertical. The forward component then comes free from geometry. This is mechanically boring, which fits the v.0 principle.
2. **Asymmetric feet.** Different foot stiffness front and back shapes the pivot at liftoff.
3. **Piezo kept for what it does well:** sub-threshold tremor (THE NUDGE), landing detection (as a contact sensor), and fine trim, not the main steering force. This also keeps the Institute-named piezoelectric technology in the design (LOT_QI46_ENGINE.md, line 110).

A tilted axis makes direction a property of how the cube is placed on the pad. That fits the table-as-charging-pad design; the pad can carry a keyed outline so the cube always sits in the same heading. v.2 later adds yaw control.

This is a spec amendment, not an edit to the prior file. The v0.1 text stays as written; this report supersedes Section 03's bias paragraph once S-2 approves.

---

## 05 // Test protocol (turns the v0.1 gates into procedures)

| ID | Test | Method | Pass |
|---|---|---|---|
| T1 | Hop height | High-speed camera (≥240 fps), 20 trials | 8–10 mm, σ < 1.5 mm |
| T2 | Leap displacement | Grid mat, 20 trials | 40 mm ± 10 mm |
| T3 | Landing recovery | Drop from 5 mm at 0–40° tilt, 50 trials | Rights itself when tilt > 25° |
| T4 | Edge inhibit | Approach table edge at 8 headings, 100 trials | 100/100 inhibited within 20 mm of edge (**hard gate**) |
| T5 | Endurance | Hop-and-recover cycles | 500/500, zero off-table, zero actuator faults |
| T6 | Surface sweep | Wood, glass, laminate | T1/T2 hold on all three |
| T7 | Acoustic | Measured at 300 mm | THE NUDGE inaudible (< 25 dBA); THE HOP below conversational level |
| T8 | Thermal | 50 hops in 10 minutes | Coil < 60 °C at the shell surface (touchable) |

A cube that fails T4 does not move on to any other test; it does not leave the bench.

---

## 06 // Risk register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Piezo bias too weak (Section 04) | High | Medium | Tilted-axis design, piezo demoted |
| R2 | Hop height varies with battery state | High | Medium | Capacitor-bank release at a fixed voltage; calibrate on each charge |
| R3 | Surface variance (stiction, glass vs. wood) | High | Medium | Foot-compound study; IMU measures liftoff and adapts amplitude |
| R4 | Cube leaves the desk | Low if T4 holds | **High** | Hard edge gate; inhibit by default if the ToF sensor is blind |
| R5 | Noise: a hopping cube can be annoying | Medium | High | Latched-spring design, soft foot pads, user quiet hours |
| R6 | Child or pet interaction | Medium | Medium | Small energy cap (v.0 under 25 mJ); no pinch points; no small loose parts |
| R7 | Wireless-charging heating of the coil/magnet | Low | Medium | Keep the Qi coil's eddy-current zone away from the slug; shielding |
| R8 | Levitation claims outrunning evidence | Medium | Reputational | No levitation claim in any consumer material until a lab result exists |

---

## 07 // Roadmap status

| Tier | Capability | Status after this cycle |
|---|---|---|
| v.0 | Controlled hop, 4 gestures, edge gate | Sized on paper; bench rig is the next step |
| v.1 | Long jump >150 mm | Needs ≥66–77 mJ at the shell; actuator headroom specified (Section 02) |
| v.2 | Table swings/walking | Plan as multi-hop with yaw control; needs a friction model |
| v.3 | Levitation | Research only. Honest note: acoustic levitation is real but carries grams-scale loads at small distances; a 90–120 g cube is far outside demonstrated acoustic levitation, so magnetic levitation of a magnet-bearing shell is the more plausible candidate, and it needs a powered table. Neither is committed. |

---

## 08 // Consumer use cases

Use Case 01 (THE DESK MIGRATION, 2026-07-28) is recorded in `LOT-CUBIQ-QUANTUM-CUBE-v0.md`, Section 07, and is unchanged. This cycle's entry follows; it is also appended there.

### USE CASE 02 — THE BEDSIDE CHECK-IN (2026-11-08)

**Operator profile:** Usership tier, shift worker (nurse, nights), sleeps in daylight hours with the phone in another room by choice. Lives with a partner who sleeps at night.

**Problem today:** A phone alarm or notification is loud, lights up a dark room, and wakes the partner. Silencing it altogether means missing the one thing that matters: the evening Memory Engine check-in that anchors the operator's rhythm before a shift, and the "assembly phase advanced" signal.

**With CUBIQ v.0:** The cube sits on its charging pad on the nightstand. At the operator's chosen wake window the cube runs THE NUDGE: a sub-threshold tremor through the nightstand, inaudible at 300 mm (T7). If the operator is already awake and has not touched it after a few minutes, it escalates once to THE HOP (≤10 mm). It never escalates to THE LEAP in this mode, because the nightstand has an edge and the cube is always inside the 20 mm inhibit zone, so the edge gate (T4) holds it to in-place gestures by design. The operator reaches over, rests a palm on the cube, and the gesture stops. The IMU reads that touch as acknowledgement ("seen"), so nothing further fires. No light, no sound, no partner woken.

**Why this is a v.0 use case:** it needs only the hop primitive, the IMU, and the edge gate, with no long jump or table-walking. It leans on the safety gate rather than fighting it.

**What QI·46 gets back:** time-to-touch and escalation count, folded into the "haptic preference" signal (LOT_QI46_ENGINE.md, line 757). Over a few weeks the cube learns that this operator wakes at the first nudge and stops escalating.

**Failure modes to test:** nightstand surfaces that are soft or cluttered (a book or a glass nearby changes landing; T6 must include a cloth-covered surface), and a partner's hand brushing the cube (must not count as acknowledgement; needs a touch-pattern check).

---

## 09 // Next steps

1. S-2 approval of the Section 04 bias-mechanism amendment.
2. Single-axis bench rig; measure delivered energy per pulse against Section 02.
3. Foot-compound shortlist for T6.
4. Prototype the ToF edge gate first, since it is the one hard gate.
5. Next cycle: Use Case 03 and the bench results.

---

AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02
