# QI·46 — NODE 01 — BEING CALIBRATION

**LOT® Systems Corporation · S-2: VADIK MARMELADOV · Named for Kuzya**
**Date:** 2026-10-12 · **Class:** SELF-ASSEMBLY · **Status:** SPEC (PROVISIONAL — nothing in this file is built yet)
**Parent node:** `docs/corporate/LOT_QI46_ENGINE.md` (the requested `LOT_QI-46_ENGINE-2.md` does not exist in the repo; the corporate file is treated as node 0)

---

## 0. NAMING

Engine name resolved: **QI·46** (Quantum Intelligence, Generation 46). It slots into the `_I` grammar (BI, KI, QI). Alternates considered and parked: LOT·SC·46, BIONODE-46, SELFWARE·46 (kept as codename), SOMA·46, CARE·OS·46.

## 1. GOAL (as stated by S-2)

Extract an engine grounded in people's soul and emotion. Take a person's being as input, and calibrate the human to the humanoid output: grace, poetry, love, hugs, being there, being cool, male.

## 2. HONEST BOUNDARY

What can be built: a **Being Profile**. It is a structured, consented, user-owned representation of a person's expressed emotional and behavioral patterns. It is used to condition QI·46 output so that responses are warm, specific and in that person's register.

What cannot be claimed: that a person's soul or being is "uploaded". A profile is a model of what someone has *expressed* on the platform. It is lossy and it can be wrong. Every user-facing and investor-facing surface must say "calibrated to you", never "is you". Marked `PROVISIONAL`: any stronger claim.

## 3. THE BEING PROFILE (BP)

Built on the existing Layer 1 Calibration Loop and Layer 4 Memory Arc. It adds one object, the BP, with six channels.

| CHANNEL | SOURCE (already in LOT) | USED FOR |
|---|---|---|
| VOICE | journal text, chat turns | register, rhythm, vocabulary the person actually uses |
| FEELING | emotional_checkin logs, mood analytics | current and baseline affect |
| BODY | biofield self-reports, consumable cadence | the "body as interface" signal |
| RHYTHM | engagement timing, drop-off, reorder velocity | when to speak, when to stay quiet |
| WANTS | plan_set, goals, declared intent | what the person says they are moving toward |
| BOUNDS | explicit user settings, COSMO® holds | what must never be said or stored |

Prompt assembly order follows doctrine: declared intent (WANTS) first, then inferred patterns (FEELING, RHYTHM), then raw history. BOUNDS is applied last as a hard filter.

## 4. HUMANOID OUTPUT MODES (calibration targets)

Each mode is a style target selected by the BP, not a persona the engine pretends to have.

| MODE | WHAT IT MEANS IN OUTPUT |
|---|---|
| GRACE | unhurried, no pressure, no fix-it reflex |
| POETRY | one concrete image over an abstraction; short lines |
| LOVE | name what the person did well or survived; no flattery |
| HUG | presence without advice; few words; white space |
| BEING THERE | reference real arc history ("three weeks ago you said...") |
| COOL | relaxed, dry, no hype, no exclamation |
| MALE | masculine register available as an opt-in tone preset (plain, steady, protective). User-selected only; never inferred from gender |

Rule: mode selection is a **user preference first, inference second**. The engine may suggest a mode, never impose one.

## 5. CALIBRATION LOOP (human ↔ humanoid)

```
BP(t) --> select MODE --> generate --> COSMO® node --> deliver
  ^                                                      |
  |         felt-right signal (CLOSE / NO)               |
  +------------------ update BP <------------------------+
```

- Feedback is one tap: CLOSE (felt right) or NO (missed). It is the only training signal that changes MODE weights.
- Drift guard: BP changes are logged as a diff. The user can view, edit, export and delete the BP at any time.
- COSMO® node still runs on every response (honest? safe for a child? safe for a body under stress?).

## 6. CONSENT AND SAFETY (non-negotiable gates)

1. **Opt-in per channel.** No channel is read without an explicit toggle. Default is off for VOICE and BODY.
2. **User-owned.** One-click export (JSON + .MD) and one-click hard delete, including derived vectors.
3. **No cross-user training** on a BP without a separate, explicit, revocable consent.
4. **Minors:** no BP creation under the platform age floor; COSMO® child-safety check applies to all output.
5. **Distress path:** if FEELING crosses a crisis threshold, GRACE/HUG modes yield to the existing RESILIENCE protocol and human-support resources. The engine never plays therapist.
6. **No impersonation of a real person** (living or dead) from another person's BP. A BP only calibrates output *to* its owner.

## 7. BUILD PLAN (proposed, not started)

| STEP | DELIVERABLE | GATE |
|---|---|---|
| N01.1 | `BeingProfile` schema + migration (six channels, per-channel consent flags) | migration applies and rolls back clean |
| N01.2 | BP builder reading existing logs into channel summaries | unit test: empty history yields empty BP, no crash |
| N01.3 | MODE selector + prompt-assembly hook (WANTS → FEELING/RHYTHM → history → BOUNDS) | golden-prompt snapshot test |
| N01.4 | CLOSE/NO feedback tap + BP diff log | diff visible to user |
| N01.5 | Export / delete endpoints | delete verified by re-query |
| N01.6 | COSMO® + RESILIENCE integration test | crisis fixture routes to RESILIENCE |

Each step is a separate benchmark session. A failed gate is a checkpoint, not a failure.

## 8. OPEN QUESTIONS FOR S-2 (judgment, not mechanism)

1. Confirm the age floor and the crisis threshold values (this node proposes none).
2. Is MALE a tone preset available to all users, or one of several named presets (e.g. STEADY, PLAIN)? Proposal: ship as one of several.
3. Provide `LOT_QI-46_ENGINE-2.md` if it exists outside this repo; this node should be reconciled against it.

---
AUTHORIZED BY: S-2 // VADIK MARMELADOV
