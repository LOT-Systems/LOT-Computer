# LOT® Quantum Cube (CUBIQ™) — v.0 Development Report 02

```
DOCUMENT:  LOT-CUBIQ-DEV-REPORT-2026-11-02
CLASS:     RESTRICTED // S-2 EYES
S-2:       VADIK MARMELADOV
DATE:      2026-11-02
CYCLE:     02 (scheduled routine "CUBIQ™")
STATUS:    v.0 — PRE-HARDWARE · ENGINEERING BUDGET CLOSED ON PAPER · DESIGN LOCK STILL PENDING
PARENT:    docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md (cycle 01, 2026-07-28)
```

## 0. Reading log

Read before writing, in order of authority:

| Source | What it contributes |
|---|---|
| `docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md` | Cycle 01 spec: hop primitive, 4 gestures, roadmap v.0–v.3, Use Case 01. Section 07 says each cycle appends one use case and never edits prior entries. |
| `docs/corporate/LOT-CUBIQ-VISION.md`, `LOT-CUBIQ-OPERATOR.md` | Anti-feed thesis; Index of Systems signals; Phase 4 "Physical Extension (Days 90+)". |
| `docs/corporate/LOT_QI46_ENGINE.md`, `CQGS-WHITE-PAPER-SNAPSHOT.md` | LOT Institute corpus: piezoelectric / nano-ceramic / haptic-preference loop. |
| `docs/wiki/LOT-WIKI-v66…v87` §25 | CUBIQ™ as the 5–11 min "quantum cubic experience"; v72 marks it "documentation phase". Nothing in v87 contradicts the hardware track. |
| `docs/assembly/2026-04-21_…v5-accuracy-narrative.md` | Style law: "The levitating Quantum Cube … is the body of the interface." |
| `docs/benchmark/LOT-MANIFEST.md` | COSMO® Cube is a separate computer. Naming stays disjoint. |

No other hardware reports exist in the repo. This is the second CUBIQ hardware document.

## 1. What this cycle did

Cycle 01 stated the architecture and the roadmap in words. Cycle 02 puts numbers under them. The numbers are in `docs/corporate/cubiq/ballistics.py`, which is reproducible: `python3 -I docs/corporate/cubiq/ballistics.py`.

All figures below are ideal-projectile estimates. They assume no drag, no foot slip and no energy loss in the launch mechanism. They are **design budgets, not measurements.** No hardware exists yet.

## 2. Ballistics budget

### 2.1 v.0 gestures (120 g shell, per cycle-01 §02)

| Gesture | Target | Launch speed | Kinetic energy | Impulse |
|---|---|---|---|---|
| THE HOP | 10 mm vertical rise | 0.44 m/s | 11.8 mJ | 0.053 N·s |
| THE LEAP | 40 mm range at 15° off vertical (75° elevation) | 0.89 m/s | 47.1 mJ | 0.106 N·s |

THE LEAP also rises about **37 mm**. Cycle 01 framed it as a "40 mm displacement" without stating the height. It is nearly as tall as it is long, so it is a bound, not a skim. Both the landing-recovery logic and the edge gate should be sized for a 37 mm flight.

### 2.2 Actuator implication

Mean thrust over the launch stroke is F = KE / stroke. For THE LEAP:

| Stroke | Mean force |
|---|---|
| 3 mm | 15.7 N |
| 5 mm | 9.4 N |
| 8 mm | 5.9 N |

A 45 mm cube has a stroke of a few millimetres at most. Sustained 10–15 N from a voice coil in that volume is **a real risk** for the voice-coil choice in cycle 01. **Open item OI-1:** bench-compare a voice coil against a pulsed solenoid or a spring-latch/release mechanism. A spring-latch stores energy slowly and releases it fast, so it needs far less peak electrical power. It is mechanically less quiet and less controllable, which was the reason cycle 01 preferred the voice coil.

### 2.3 Power

A 47 mJ leap at an assumed 30% electrical-to-kinetic efficiency needs about 160 mJ from storage. A 1000 µF capacitor at 20 V holds 200 mJ, so a small boost-charged capacitor can fire a leap without loading the cell. A 300 mAh Li-Po (~4 kJ) holds on the order of 25,000 leaps. **Standby draw from the IMU, time-of-flight sensor and radio will dominate the battery budget, not the actuation.** The wireless-charging pad (cycle 01 §02) reduces the importance of this, but the cube must survive lifting off the pad.

### 2.4 Correction to the v.1 plan

Cycle 01 described v.1 as "same actuator architecture, re-tuned" with a 5–15° piezo bias. The budget shows this does not reach the target:

| v.1 launch elevation | Launch speed | KE (90 g) | Rise | Landing speed |
|---|---|---|---|---|
| 75° (≈ v.0 geometry) | 1.72 m/s | 132 mJ | **140 mm** | 1.66 m/s |
| 60° | 1.30 m/s | 76 mJ | 65 mm | 1.13 m/s |
| 45° | 1.21 m/s | 66 mJ | 37 mm | 0.86 m/s |

Reaching 150 mm range at v.0's near-vertical geometry means a 140 mm flight at 1.7 m/s. That is hard on the shell and the landing logic. **v.1 therefore needs a tiltable thrust axis**, not only a longer stroke. A pivoting kickstand or a hinged internal actuator mount that sets 45–60° elevation would do it. A 45–60° launch costs roughly half the energy of the 75° case. **This amends the roadmap: v.1 is "re-tuned actuator plus a launch-angle mechanism".** Cycle 01's gate (>150 mm in 9/10 trials across wood, glass, laminate) stays unchanged.

## 3. Risks and open items

| ID | Item | Why it matters | Next step |
|---|---|---|---|
| OI-1 | Voice coil vs latch/solenoid | 9–16 N peak force in a 45 mm body | Bench both, 3 prototypes each |
| OI-2 | Foot slip on glass/laminate | Real launch angle will fall below the design angle; the budget assumes none | Friction-coefficient test per surface, feeds the v.2 traction model |
| OI-3 | Flight height 37 mm | Landing recovery and the edge gate see a bigger envelope than cycle 01 assumed | Raise edge inhibit margin from 20 mm to a value derived from the range plus 3σ |
| OI-4 | Acoustic noise | THE HOP and THE LEAP must not wake a sleeper or startle a pet (see Use Case 02) | Add a dB(A) ceiling to the v.0 gate; target below 35 dB(A) at 0.5 m |
| OI-5 | Pets and children | A moving object on a table is a toy to a cat | Add a "quiet hours" and a "do not move" state to the driver |
| OI-6 | Levitation (v.3) | Still a research track, no mechanism chosen | No change this cycle. The pad-as-power-surface choice keeps both candidates open |

## 4. Amendments proposed to the v.0 gate

Cycle 01 gate: 500/500 hop-and-recover cycles with no off-table landings and no actuator failures. Proposed additions, **pending S-2 approval**:

1. Measured flight height and range logged per trial, compared against §2.1.
2. Acoustic ceiling, as in OI-4.
3. A trial set of 100 edge approaches per surface type, not 100 total.

## 5. Consumer use case — cycle 02

### USE CASE 02 — THE QUIET ALARM

Appended to the master document, section 07, in the same words as below.

**Operator profile.** Shares a bedroom. The nightstand has the CUBIQ pad and a glass of water. The phone is in another room, because the operator is working on sleep.

**The problem today.** Phone alarms are sound and light, which are the two channels the sleeping partner also receives. A wake-up that starts as a fixed siren at a fixed time ignores where the operator actually is in their sleep and day cycle. The Diurnal Arc (P76 → P79 → P80, per wiki §25) already models this arc in software, but its output has nowhere gentle to go.

**With CUBIQ v.0.** At the operator's wake window, the cube starts with THE NUDGE: a sub-threshold tremor through the nightstand. It is felt through the mattress frame, not heard. It repeats slowly, with long gaps, and stops the moment the IMU detects the hand touching the cube or the table moving. If the operator is still asleep after a defined escalation period, the cube moves to THE HOP: a single small rise, in place. THE LEAP is never used here, because it travels and the nightstand has edges. The edge gate (OI-3) is the only reason this use case is allowed.

**What the operator experiences.** No light, no sound, no screen. The partner does not wake. The wake-up becomes a gesture the operator learns, not a noise they dread.

**What it demonstrates.** The haptic language works as a *graded* channel, with escalation built from the same four gestures. It also shows the first case where **sound is a failure mode**, which is why OI-4 is now a gate item.

**Risks this case raises.** OI-3 (edge), OI-4 (noise), OI-5 (a cat on the nightstand). **Unproven:** whether the NUDGE amplitude is reliably felt through a typical nightstand and also reliably below the noise ceiling. That is a bench question.

## 6. Status

| Item | State |
|---|---|
| Hardware | None built |
| Ballistics budget | Done, reproducible, ideal-case only |
| Roadmap | v.1 amended to include a launch-angle mechanism |
| Gate | Three additions proposed, awaiting S-2 |
| Use cases | 01 (Desk Migration), 02 (Quiet Alarm) |

Next cycle: pick one of OI-1, OI-2 or OI-4 and write a bench test plan. Add Use Case 03.

```
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-CUBIQ-DEV-REPORT-2026-11-02
```
