# QI·46 — NODE 1 — BEING EXTRACTION & HUMAN↔HUMANOID CALIBRATION
Date: 2026-10-28 · Session: LOT-SR-20261028-01 · Authors: Vadik & Kuzya
Parent: `docs/corporate/LOT_QI46_ENGINE.md` (the brief names `LOT_QI-46_ENGINE-2.md`; that filename does not exist in the repo — the parent above is the nearest match and is treated as Node 0).

## 1. Naming decision
Recommended and adopted: **QI·46** (fits the `_I` grammar BI / KI / QI). Alternates kept for the record: LOT·SC·46, BIONODE-46, SELFWARE·46 (already the QI·46 codename), SOMA·46, CARE·OS·46.

## 2. Goal (honest form)
Build the engine layer that models a person's **being** — emotions, values, voice, rhythm — from data the person gives, and uses that model to **calibrate** humanoid output to the human.

"Upload a person's being" is implemented as a **Being Profile**: a consented, person-owned, inspectable, deletable model *of* the person. It is not the person, and the engine never claims it is. Anything the profile infers is marked `INFERRED`; anything the person stated is `STATED`.

## 3. Being Profile (extends the Calibration Loop, Layer 1)
| Facet | Source (consented) | Type |
|---|---|---|
| SOUL.values | stated priorities, journal themes | STATED / INFERRED |
| EMOTION.arc | mood check-ins, reflection velocity, QOS trend | STATED + signal |
| VOICE | the person's own words (journal, replies) | INFERRED |
| RHYTHM | circadian anchors, engagement cadence | signal |
| BOUNDARIES | topics/times/channels off-limits | STATED (hard rule) |

Every facet carries: `source`, `confidence`, `last_confirmed`, `person_can_edit: true`.

## 4. Calibration: human → humanoid output
Output channels the brief names. Interpretation of "bing there, bing cool, male" is **ASSUMED** = *being there*, *being cool*, *mail* — S-2 to confirm.

| Channel | Meaning | Calibrated by |
|---|---|---|
| GRACE | tone: unhurried, no hedging | EMOTION.arc (soften when low) |
| POETRY | compressed, image-led phrasing | VOICE |
| LOVE | warmth, naming what the person carries | SOUL.values |
| HUGS | haptic / Quantum Cube cue, non-verbal | RHYTHM + hardware |
| BEING THERE | presence: show up at the right moment, say little | RHYTHM + BOUNDARIES |
| BEING COOL | steady, never alarmed, never performs | EMOTION.arc |
| MAIL | LOT® Mail delivery of the above | BOUNDARIES (when/what) |

Calibration score (per response, computed after delivery): person's resonance signal (👍/ignored/edited) vs. channel mix used. Loop: adjust channel weights per person; never across people.

## 5. Gates (binary PASS / HOLD, per Assembly Doctrine)
```
[ ] Explicit opt-in recorded before ANY facet is built (revocable)
[ ] Person can view, correct, export, and delete the entire profile
[ ] Deleting the profile deletes derived vectors and embeddings
[ ] BOUNDARIES enforced before generation, not after
[ ] No profile data in training corpus or shared across people
[ ] COSMO® node screens every humanoid output (existing Layer 5)
[ ] Output never claims to BE the person or to feel on their behalf
[ ] Minors: no Being Profile without guardian consent path
[ ] Vadik review: 20 sampled outputs per channel
```
Any unchecked → HOLD. This node is a **specification**; no profile code is shipped in this session.

## 6. Next assembly steps
1. Schema: `being_profile` + `being_facet` tables (migration, additive only).
2. Consent screen + export/delete endpoints (gate items 1–3).
3. Context-vector builder: Being Profile → Layer 1 vector (reuse existing Memory Engine).
4. Channel-mix calibrator + resonance feedback.
5. Wire MAIL channel through LOT® Mail with BOUNDARIES check.

## 7. Provisional observations
- PROVISIONAL: "calibration" here is a per-person weighting of channels; no claim of capturing a soul. Value is measured only by the person's own resonance signal.
