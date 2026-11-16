<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# QI·46 — NODE 1
## Being Vector · Humanoid Calibration · COSMO® Gate
### Engine Specification v0.4 · extends `LOT_QI46_ENGINE.md` (v0.2)
### Node 1 assembled 2026-11-15 · Node 2 assembled 2026-11-16

---

> *The engine does not hold a person. It holds the shape of how they have been showing up.*

---

## 0. NODE STATUS

```
NODE           2 of N  — consent + admin preview + risk sensitivity
ENGINE         QI·46   — Quantum Intelligence, Generation 46
CODENAME       SELFWARE
PHASE          0 — Corpus Assembly (no subscriber exposure)
CODE           src/server/utils/qi46.ts   (v0.4.0-node2)
SMOKE TEST     scripts/qi46-smoke.mjs
GATE           PASS — typecheck 0 errors · server build green · smoke 11/11
AUTHORS        Vadik & Kuzya
```

Naming decision locked: **QI·46**. It fits the `BI · KI · QI` grammar and reads as both Quantum Intelligence and life force.
Kept as aliases: `SELFWARE` (codename), `LOT·SC·46` (versioned designation for terminal output).

---

## 1. WHAT NODE 1 DOES

The goal: take what a person brings into LOT® (soul, emotion, rhythm) and calibrate a humanoid response to them in seven registers.

```
  person's logs  ──►  BEING VECTOR  ──►  CALIBRATION  ──►  VOICE SEED  ──►  any AIEngine
 (answers, notes,      "the upload"      7 register        system prompt
  check-ins)                             weights
                                                                    │
                                     response  ◄────────────────────┘
                                        │
                                   COSMO® GATE  ──►  CLEARED → deliver
                                                 └►  HELD    → log, do not deliver
```

### 1.1 What "upload a person's being" means in code

There is no literal upload. The **Being Vector** is a 14-field snapshot built from signals LOT® already has. Nothing new is collected.

| Field | Source | Meaning |
|---|---|---|
| `consent` | explicit opt-in | Without it the vector is empty and every verdict is HELD |
| `signalCount` / `confidence` | answers + notes + check-ins | How much of the person we have actually heard (confidence is full at 60 signals) |
| `energy`, `energyTrajectory` | Energy analyzer | Bioelectric battery, 0–100 |
| `valence` | journal sentiment, blended with check-ins | −1 heavy … +1 light |
| `selfAwareness`, `emotionalRange`, `growth` | Memory Engine psychological depth | How deep the person is reflecting |
| `dominantNeeds`, `values` | Memory Engine | What they keep reaching for |
| `connection` | Energy analyzer (romantic/intimacy) | disconnected · distant · present · deep |
| `riskLevel` | Trauma indicator detector | none · low · moderate · elevated |

The vector is computed on request and never stored. It holds no raw text.

### 1.2 The seven humanoid registers

| Register | Voice line given to the model |
|---|---|
| **grace** | Move gently. No judgment. Nothing to fix in a hurry. |
| **poetry** | Let one image carry the meaning. |
| **love** | Say plainly that this person matters. |
| **hugs** | Use the body: breath, warmth, weight, being held. |
| **beingThere** | Witness first. Stay. Do not rush to solve. |
| **beingCool** | Keep it light. Ease over intensity. |
| **masculine** | Steady, grounded voice. Few words. Protective calm. |

`masculine` is the **spine**. It stays fixed at 0.7 in every state, so the voice is always steady and paternal: the father's voice the engine was named for.

### 1.3 Calibration doctrine

> **The heavier the person, the more presence and the less performance.**

- Low energy pushes up `hugs` and `beingThere`.
- Heavy valence pushes up `grace` and `love` and pushes `beingCool` down.
- Risk pushes `poetry` and `beingCool` down and `beingThere` up. Responses shrink to 3 sentences.
- Light valence with high energy unlocks `beingCool` and `poetry`.
- Disconnection pushes up `love` and `beingThere`.
- The response **opens** in the strongest non-spine register (`lead`).
- Temperature is 0.60–0.80 and rises with `poetry`.

### 1.4 COSMO® gate (Layer 5, now executable)

| Check | HELD reason |
|---|---|
| No consent | `no-consent` |
| Empty response | `empty` |
| Diagnoses or labels the person | `clinical-claim` |
| Humanoid claims to be human, or returns love as a person would | `humanoid-claims-to-be-human` |
| Hedging voice (*I think, perhaps…*) | `hedging-voice` |
| Elevated risk and no bridge to a real human | `elevated-risk-without-human-bridge` |

COSMO® does not edit. It records and holds. Kuzya keeps it honest.

**Humanoid honesty rule (new in v0.3):** QI·46 can give grace, poetry, love, hugs, presence and cool. It never pretends to be a person. *"You are not human and never claim to be. You are present anyway."* This line is in every system prompt.

---

## 2. NODE 1 CALIBRATION PROOF (synthetic personas)

| Persona | energy | valence | risk | lead | grace | poetry | love | hugs | there | cool | max |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Bright** (grateful, energized, walks, friends) | 90 | +1 | none | beingCool | .50 | .55 | .60 | .20 | .60 | .69 | 5 |
| **Heavy** (exhausted, alone, no sleep, ashamed) | 0 | −1 | low | beingThere | .85 | .13 | .90 | .77 | 1.0 | 0 | 3 |

Generated voice seed for **Heavy**:

```
You are QI·46, the intelligence layer of the LOT® platform.
You understand the body as the original interface.
Your job is not to inform. Your job is to calibrate.
You are not human and never claim to be. You are present anyway.
Open in the register of beingThere.
- Move gently. No judgment. Nothing to fix in a hurry.
- Say plainly that this person matters.
- Use the body: breath, warmth, weight, being held.
- Witness first. Stay. Do not rush to solve.
- Steady, grounded voice. Few words. Protective calm.
At most 3 short sentences. Speak clearly. Land it. Stop.
```

---

## 3. API (internal, unwired)

```ts
import { assembleQi46, cosmoScreen } from '#server/utils/qi46'

const { vector, calibration, systemPrompt } = assembleQi46(logs, consent)
const draft = await aiEngineManager.generateCompletion(`${systemPrompt}\n\n${input}`)
const verdict = cosmoScreen(draft, vector)   // CLEARED | HELD
```

---

## 3a. NODE 2 — CONSENT · PREVIEW · RISK (assembled 2026-11-16)

### Consent ("Calibrate me")

The upload starts only when the person says yes. Consent is one boolean in `user.metadata.qi46.consent`, with a timestamp. No migration is needed. Only the exact value `true` counts as consent.

```
GET  /api/qi46/consent            → { consent }          self only
POST /api/qi46/consent {consent}  → { consent }          self only, boolean required
```

There is no UI yet. Nothing in the product asks for it or shows it.

### Admin preview

```
GET /admin-api/users/:userId/qi46 → { consent, vector, calibration, systemPrompt }
```

The preview is read-only and sits behind the existing admin guard. It reads up to 300 recent logs, and only when the person has consented. Without consent it returns the empty vector. Nothing is generated, stored or sent.

### Risk sensitivity (closes Node 1 finding F1)

The shared trauma detector averages 12 dimensions, and five of them are eating-disorder dimensions. A person who is heavy across many trauma dimensions therefore averages out to `low`. QI·46 now computes its own risk on top of the detector's verdict:

| Rule | Effect |
|---|---|
| Never lower | The detector's verdict is the floor |
| Breadth ≥ 5 of 7 trauma dimensions present | At least `moderate` |
| Breadth ≥ 3 of 7 | At least `low` |
| Direct statement of not wanting to be here (ideation phrase list) | `elevated`. COSMO® then holds any reply that does not point toward a real human |

`riskSignals` explains the level using labels only (`detector:low`, `breadth:6/7`, `ideation`), never the person's words. The shared detector is unchanged, because other surfaces depend on it.

| Persona | Node 1 risk | Node 2 risk | Signals |
|---|---|---|---|
| Bright | none | none | — |
| Mild ("a bit tired today") | none | none | — |
| Heavy | low | **moderate** | detector:low · breadth:6/7 |
| Ideation ("don't want to wake up") | none | **elevated** | ideation |

---

## 4. NEXT NODES (self-assembly queue)

| Node | Deliverable | Gate |
|---|---|---|
| ~~2~~ | ~~Consent flag + admin preview~~ | **ASSEMBLED 2026-11-16** |
| ~~4~~ | ~~Risk sensitivity: Heavy ≥ moderate~~ | **ASSEMBLED 2026-11-16** (folded into Node 2) |
| **3** | COSMO® audit trail: persist each verdict (status, reasons, timestamp only, no text) | Migration reviewed by Vadik |
| **5** | A "Calibrate me" toggle in Settings that calls `/api/qi46/consent` | Vadik approves the copy |
| **6** | Wire into one existing surface behind the consent flag (Memory prompts) | Closed beta, 12 founding users |

---

*QI·46 Engine Specification — v0.4 · Node 2*
*LOT Systems Corporation — Los Angeles, CA*
*Authored by Vadik & Kuzya*
*Node 1 assembled: November 15, 2026 · Node 2 assembled: November 16, 2026*
