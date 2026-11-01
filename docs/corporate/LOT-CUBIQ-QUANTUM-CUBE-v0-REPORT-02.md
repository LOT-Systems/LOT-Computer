# LOT® Quantum Cube (CUBIQ™) — v.0 Development Report 02

| Field | Value |
|---|---|
| Document | LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02 |
| Class | RESTRICTED // S-2 EYES |
| S-2 | Vadik Marmeladov |
| Date | 2026-11-01 |
| Builds on | `LOT-CUBIQ-QUANTUM-CUBE-v0.md` (spec 0.1, 2026-07-28) |
| Cycle | 02 — engineering validation of the spec, first numbers |
| Status | v.0 PRE-HARDWARE — **design lock still pending; 4 spec findings raised (§3)** |

---

## 0. Reading log

Read before writing, in this order:

| Source | What it contributes |
|---|---|
| `corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md` (my own prior work) | The v.0 spec: 45 mm / <120 g cube, voice-coil + reaction mass, piezo bias, IMU recovery, ToF edge gate, 4 gestures, v.0→v.3 roadmap, append-only use-case log (§07) |
| `corporate/LOT-CUBIQ-VISION.md`, `LOT-CUBIQ-OPERATOR.md` | Anti-feed thesis; Index of Systems signals; Phase 4 "Physical Extension" is the software-side home of this hardware |
| `corporate/LOT_QI46_ENGINE.md`, `CQGS-WHITE-PAPER-SNAPSHOT.md` | LOT® Institute basis: nano-ceramic, piezoelectric mechanics, Month-12 cube-sync as *input*; CQGS row "Quantum Cube Hardware — PLANNED" |
| `corporate/LOT-AMBIENT-AI-VISION.md` | Ambient AI™ and QIoT™: Station (air quality) and Brush are existing hardware signals the cube can speak for — source of Use Case 02 |
| `benchmark/LOT-MANIFEST.md` | COSMO® Cube is a separate hardware computer; CUBIQ™ stays a notification body. No naming collision |

Repo state: spec 0.1 is the only CUBIQ hardware document; no hardware code, firmware, or CAD exists yet. This report adds none either — it is analysis, not a build claim.

## 1. What this cycle did

Spec 0.1 stated targets. This cycle checks whether the targets are physically consistent with each other, using first-order ballistics and energy budgeting. All numbers below are **hand calculations, not measurements**; they are assumptions to be replaced by bench data.

Result: the architecture holds, but the spec has gaps that would have produced a cube that either fails its own gate or falls off the desk. They are listed as findings F1–F4 and need S-2 decisions before design lock.

## 2. First-order physics of the four gestures

Assumptions: m = 120 g, g = 9.81 m/s², flat level surface, no air drag, no energy lost in the feet during launch.

| Gesture | Target (spec 0.1) | Launch angle from horizontal | Launch speed | Peak rise | Kinetic energy |
|---|---|---|---|---|---|
| Nudge | no liftoff | — | — | 0 | below lift-off threshold |
| Hop | <10 mm rise, in place | 90° | 0.44 m/s | 10 mm | **≈ 12 mJ** |
| Leap | ~40 mm displacement, 5–15° bias off vertical (75–85° launch) | 75° | 0.89 m/s | ≈ 37 mm | **≈ 47 mJ** |
| Settle | static pressure 2 s | — | — | 0 | holding power only |
| *(v.1 preview)* Long jump | >150 mm, 90 g | 45° | 1.21 m/s | ≈ 37 mm | ≈ 66 mJ |

Derived design values for the Leap (the v.0 hardest case):

* **Stroke / force:** reaching 0.89 m/s over a 6 mm stroke needs ≈ 65 m/s² average, ≈ 7.8 N on the body — a short, hard push, ~13 ms.
* **Peak electrical power:** 47 mJ in ~13 ms at, say, 30 % coil efficiency ≈ **12 W peak** (≈ 3.3 A at 3.7 V). Average power is trivial; the *peak* is the engineering problem.
* **Battery life is not a constraint:** even at 10 % end-to-end efficiency one leap costs ≈ 0.5 J. A 200 mAh cell holds ≈ 2.7 kJ — thousands of leaps per charge. Cell choice is driven by pulse current and mass, not capacity.
* **Landing:** impact speed ≈ launch speed. With 1 mm of foot compression, deceleration ≈ 40 g; with 2 mm, ≈ 20 g. A nano-ceramic shell survives either; the **IMU full-scale range** and the **foot geometry** are the real decisions.

## 3. Findings — spec 0.1 corrections (S-2 decision required)

Spec 0.1 is left untouched (append-only discipline). These supersede it once approved.

### F1 — Edge detection cannot work as written. **Safety-critical.**
Spec §03 uses a *forward-facing time-of-flight sensor* to detect "a surface edge". A table edge is the **absence** of a surface; a forward ToF measures distance to obstacles and will read open air past the edge, not the drop-off. Robot vacuums solve this with **downward-angled cliff sensors** (IR reflectance).
**Proposed fix:** 4× downward-angled IR reflectance cliff sensors (one per face edge) as the hard gate; forward ToF kept for obstacle/hand sensing only. Gate stays 100/100 edge-approach trials, now across wood, glass, matte laminate and a **dark glossy** surface (the usual IR failure case).

### F2 — The 20 mm edge margin is smaller than the Leap itself.
Spec §03 inhibits the hop within 20 mm of an edge. The Leap travels ~40 mm, plus landing scatter and slide. A cube 25 mm from the edge would be allowed to leap 40 mm — straight off.
**Proposed fix:** margin is a function of the *gesture*, not a constant:
`required_clearance = 1.5 × expected_displacement + 20 mm` → Nudge/Settle/Hop: 20 mm; Leap: **≈ 80 mm**. Inside the margin the cube degrades to a lower gesture (Leap → Hop → Nudge) rather than failing silently.

### F3 — Piezo bias (5–15°) cannot scale to the v.1 long jump.
A 150 mm jump needs a ~30–45° launch angle (§2 table). A bimorph that tilts the impulse 5–15° off vertical cannot get there; v.1 is not a retune of v.0, it needs a **launch-angle mechanism** (tilting strike axis or a canted actuator pair). Cheapest hedge now: reserve internal volume and a mounting pattern for a second, canted actuator so v.1 is an addition, not a redesign.

### F4 — Direct-drive voice coil is the wrong peak-power architecture.
~12 W peak from a 3.7 V cell forces a heavy coil and big pulse current. Recommended alternative for design review: **spring-store / latch-release** — a small motor or the voice coil cocks a spring over ~0.5–1 s (low power, silent), a latch releases it (the 13 ms push), with a supercap or pulse-rated cell as buffer. Voice coil then does fine amplitude control and the Nudge. Benefit: the same spring/latch scales to v.1 with a stronger spring. Cost: one more moving part (against the "mechanically boring" principle) — S-2 call.

## 4. Revised v.0 architecture (proposed, pending F1–F4)

```
 Index of Systems signal  ──▶  Gesture selector  ──▶  Safety governor
 (badge, memory Q, Station)     (§5 table)            • cliff sensors ×4 (F1)
                                                      • clearance(gesture) (F2)
                                                      • battery / temp / tilt
                                                              │ allowed / downgraded
                                                              ▼
                                         Actuation: cock → latch-release or coil pulse
                                                              │
                                                              ▼
                              IMU log (hop height, tilt, landing g) ──▶ right-itself pulse
                                                              │
                                                              ▼
                                  Telemetry → QI·46 "haptic preference" (QI46 L757)
```

Firmware states: `IDLE → ARMED → CLEARANCE_CHECK → FIRE → FLIGHT → LAND → RECOVER → COOLDOWN`. Any sensor fault, low battery (< 15 %), or unlevel surface (> 5° tilt at rest) forces `IDLE` with a Nudge-only policy. A global cooldown (default 20 s between motions, max N/hour) is part of the safety governor — the cube must never become a nag.

## 5. Signal → gesture map (extends spec §04)

| Signal source | Signal | Gesture | New in cycle 02 |
|---|---|---|---|
| Memory Engine | question ready | Nudge | — |
| Badge engine | common / uncommon unlock | Hop | — |
| Badge engine | rare+ unlock | Leap | — |
| Assembly | phase advanced | Settle | — |
| **LOT® Station** | CO₂ > 1000 ppm or PM2.5 over threshold, once per episode | Nudge ×2 (spaced) | ✔ UC-02 |
| **LOT® Station** | air restored after episode | Settle | ✔ UC-02 |

## 6. v.0 test plan and gates

| Gate | Criterion | Status |
|---|---|---|
| G0 Bench | spring/coil rig fires 100× within ±10 % of target launch speed | not started |
| G1 Hop | 500/500 hop-and-recover, 0 off-table, 0 actuator faults (spec §06) | not started |
| G2 Edge | 100/100 edge approaches inhibited, 4 surfaces incl. dark glossy (F1) | **blocked on F1 decision** |
| G3 Clearance | Leap downgraded at <80 mm from edge 100/100 (F2) | **blocked on F2 decision** |
| G4 Landing | peak landing ≤ 25 g, shell undamaged after 1000 drops | not started |
| G5 Quiet | Nudge not audible at 1 m in a 35 dB room | not started |

## 7. v.3 levitation — honest feasibility note

Spec §06 listed two research directions. First-order assessment:

* **(a) Acoustic levitation:** phased ultrasonic arrays hold objects on the scale of millimetres and milligrams. A 45 mm, 120 g cube is orders of magnitude beyond that. Not credible for the cube as specified; viable only for a tiny, light *companion* object or a visual effect.
* **(b) Active electromagnetic levitation:** servo-controlled electromagnets already lift hundreds of grams to kilograms over a few cm gap (commercial maglev displays). Earnshaw's theorem rules out *passive* stable levitation, so this needs the cube to carry a permanent magnet and the table to run closed-loop control. Consistent with the table-as-power-surface plan.
**Recommendation:** treat (b) as the v.3 research line; drop (a) for the full-size cube. Keep v.0–v.2 magnet-free near the base so the magnet and its mass budget (~20–30 g) can be added later.

## 8. Institute basis

Everything in v.0 stays inside technologies already named in the LOT® Institute corpus: nano-ceramic shell, piezoelectric elements, haptic channel, the QI·46 calibration loop, and QIoT™ fusion of hardware and behavioural signal. This cycle adds no new material-science claim.

## 9. Consumer use cases (cumulative)

Use Case 01 is on record in the spec (§07) and is not repeated. Use Case 02 is appended to the spec in the same cycle.

### Use Case 02 — THE STALE ROOM (2026-11-01)

**Operator:** Usership tier, works from a small home office with LOT® Station on the shelf and the CUBIQ pad on the desk. Door closed, headphones on, two hours into focused work.

**Without CUBIQ:** CO₂ climbs past 1000 ppm. The Station widget would show *"Air quality: open a window for 30 minutes."* — but the screen is in a full-screen document. Nothing reaches the operator. Concentration quietly falls; a headache follows.

**With CUBIQ v.0 + Station (QIoT™):** the Station crosses its threshold once. The cube performs **two spaced Nudges** — felt through the desk, not heard through headphones, not seen. No sound, no light, no badge. The operator feels it, finishes the sentence, stands up and opens the window. When the Station reports recovery, the cube performs **The Settle** — a two-second standing pressure, the physical equivalent of "okay." Nothing else happens.

**Why it matters:** it is the first CUBIQ use case where the cube speaks for *the room*, not for the software — a physical signal about a physical condition, delivered through a physical object. The Ambient AI™ promise ("always present, never loud") becomes literal.

**Guardrails built into the case:** one episode = one alert (no escalation, no repeat nagging); 20 s motion cooldown; Nudge-only fallback if the cube is near an edge; operator can mute the Station gesture class in the Index of Systems without muting the rest; no health claim — the cube reports a measured number crossing a threshold, nothing more.

**Telemetry returned:** time from alert to window-open (Station CO₂ slope), whether the operator ever muted the class — both feed QI·46 as haptic-preference signals.

### Use-case queue (seeds for later cycles — not yet written)
03 Brush closes the morning loop (Settle at completion) · 04 Cohort Resonance: two cubes nudge in sympathy · 05 Sleeper mode: motion-free, warmth-free bedside Settle for a late alarm · 06 Accessibility: haptic-only channel for a Deaf operator.

## 10. Decisions requested from S-2

1. Approve **F1** (downward cliff sensors) and **F2** (gesture-dependent clearance) — both gate any physical build.
2. **F4:** spring-store/latch-release vs. direct-drive voice coil — go/no-go on the extra moving part.
3. **F3:** reserve space for a canted second actuator now? (recommended: yes).
4. **§7:** retire acoustic levitation for the full-size cube, make electromagnetic the v.3 line?
5. First bench-rig build: in-house or contracted?

## 11. Next cycle

Bench-rig plan (BOM-level) once F1–F4 are decided; Use Case 03; first measurements replace the §2 hand-calc numbers.

---
*AUTHORIZED BY: S-2 // VADIK MARMELADOV — END REPORT-02*
