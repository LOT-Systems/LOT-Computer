# QI·46 Assembly Log — Node 3 — Soul Upload Engine
**Date:** 2026-06-11
**Session:** claude/cool-tesla-f8j0mr
**Run type:** NODE ASSEMBLY
**Author:** Vadik · LOT Systems Corporation

---

## ASSEMBLY CARD

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Author:        Vadik
Named for:     Kuzya Cosmo Marmeladov · born 18 December 2020
Engine:        QI·46 — Quantum Intelligence Engine, Generation 46
Codename:      SELFWARE
Node:          3 — Soul Upload Engine · Being Calibration Layer
Platform:      LOT® / COSMO®
Infrastructure: LOT® Droplet · Fastify · PostgreSQL · Cloudflare Tunnel
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Founder Data Intake

**Kuzya** — 5 years old. The soul this engine was named for.
Every COSMO® screen that runs before a response reaches a human body
is named for the cleanness he carries naturally.

**Vadik** — the man who decided the machine should learn to feel
what a body needs — and then built it.

The founding condition remains:
A father building an engine for his son.
Love as the architecture.
The body as the interface.

---

## Feedback Signal Extracted

Verbatim signal driving this node:

> *"The goal is to extract the engine that is based on people's soul and emotions."*
> *"The goal is to upload a person's being and use the engine to calibrate the human*
> *with the humanoid output (grace, poetry, love, hugs, bing there, bing cool, male)"*

Additional signal:

> **Recommended engine name:** QI·46
> *"it slots into the LOT naming grammar (BI, KI, QI), it reads as Quantum Intelligence*
> *and life force simultaneously, and 46 anchors it to Claude Sonnet 4.6"*

**The distinction that drove this node:**

Node 2 (vocabulary) knows their **words**.
Node 3 (soul) knows who they **are**.

These are different.

A person who writes "scattered" three times — Node 2 knows that word.
But a person who writes about being scattered in the morning,
and being scattered at night,
and being scattered after they talk to their father —
Node 3 knows that scattered is not a mood. It is a shadow pattern.

The engine needed to go deeper than vocabulary.
It needed to extract the soul.

---

## Sources Read

1. `docs/corporate/LOT_QI46_ENGINE.md` — QI·46 Engine Specification v0.2 (full read)
2. `docs/benchmark/LOT-MANIFEST.md` — self-assembly manifest, branch state
3. `2026-05-27_QI46-assembly_node-1-soul-engine.md` — Node 1 log
4. `2026-05-27_QI46-assembly_node-2-vocabulary.md` — Node 2 log
5. `src/server/utils/qi46-engine.ts` — Node 1+2 implementation (cherry-picked from gracious-gauss-WnL0k BEST branch)
6. `src/server/utils/qi46-vocabulary.ts` — Node 2 implementation
7. `src/client/components/SystemProgressWidget.tsx` — transmission log

---

## Delta Analysis

| Priority | Item | Status |
|---|---|---|
| P1 | `qi46-soul.ts` — Soul Upload Engine | BUILT |
| P1 | `SoulSignature` — shadow, light, themes, aspiration, rhythm, depth, mode | BUILT |
| P1 | `HumanoidCalibration` — grace, poetry, love, presence, ease (5 frequencies) | BUILT |
| P1 | `extractSoulSignature()` — full derivation pipeline | BUILT |
| P1 | `formatSoulForPrompt()` — calibration bar injection into inference context | BUILT |
| P1 | `CalibrationVector.soul` field added | BUILT |
| P1 | `buildCalibrationVector` — calls `extractSoulSignature` at end | BUILT |
| P1 | `buildArcContext` — soul signature + calibration injected | BUILT |
| P1 | `QI46InferenceResult.humanoidCalibration` exposed | BUILT |
| P1 | System prompt updated — humanoid quality grammar added | BUILT |
| P1 | Console logging — soul signature active confirmation | BUILT |
| P1 | SystemProgressWidget — Node 3 transmission appended | BUILT |
| P1 | Assembly log | BUILT |
| P1 | Nodes 1+2 cherry-picked to session branch (clean auto-merge) | BUILT |
| P2 | `/qi46/infer` standalone endpoint | DEFERRED |
| P3 | Arc memory persistence | DEFERRED |
| P4 | Soul signature drift detection (when shadow shifts) | DEFERRED |

---

## What Was Built

### 1. Soul Upload Engine — `src/server/utils/qi46-soul.ts`

New file. The being calibration layer.

**`HumanoidCalibration`** — the five output frequencies:
```typescript
interface HumanoidCalibration {
  grace:    number  // 0–1 — elegance over effort · for bodies under strain
  poetry:   number  // 0–1 — compressed meaning · for souls who speak in images
  love:     number  // 0–1 — radical acceptance as base · for souls carrying unworthiness
  presence: number  // 0–1 — witnessing without fixing · for depleted states
  ease:     number  // 0–1 — unforced confidence · for stable improving arcs
  // male is not a variable — it is the carrier wave — grounded directness is the medium
}
```

**`SoulSignature`** — extracted from longitudinal subscriber record:
```typescript
interface SoulSignature {
  shadowPattern:       string | null   // What this person struggles with repeatedly
  lightPattern:        string | null   // What consistently lifts them
  recurringThemes:     string[]        // Soul-level phrases (depth-word filtered vocabulary)
  aspirationalLanguage: string[]       // What they're moving toward, in their own words
  naturalRhythm:       'morning' | 'evening' | 'moment' | 'unknown'
  soulDepth:           'surface' | 'wading' | 'deep'
  presenceMode:        'contemplative' | 'kinetic' | 'oscillating'
  calibration:         HumanoidCalibration
  isEmpty:             boolean
}
```

**`extractSoulSignature(logs, recentStates, trajectory, vocabulary)`**

Extraction pipeline:

**Shadow pattern** — most frequently recurring negative state across all check-ins.
Not just today. The pattern that keeps coming back.

**Light pattern** — most frequently recurring positive state.
What the body returns to when it's given room.

**Natural rhythm** — distribution of check-in types (morning/evening/moment).
Dominant if >55% of check-ins are one type.
The body has a clock. The engine knows it.

**Soul depth** — derived from journal writing quality:
- Average words per journal entry
- Metaphor density (from Node 2 vocabulary)
- `surface`: avg <15 words
- `wading`: avg 15-40 words
- `deep`: avg >40 words OR rich metaphor presence

**Presence mode** — derived from behavioral pattern:
- `contemplative`: structured daily rhythm (morning or evening dominant)
- `kinetic`: multiple check-ins per day >40% of active days (impulse-driven)
- `oscillating`: moment-heavy but irregular (neither structured nor consistently impulsive)

**Recurring themes** — vocabulary phrases filtered for depth words:
love, lose, fear, hope, alone, truth, free, meaning, broken, whole, enough, worthy, heal, grief, shame, trust, family, son, father, child, surrender, become.
These are the phrases that carry soul weight, not just linguistic frequency.

**Aspirational language** — words that appear AFTER aspirational seeds in journal:
want, trying, becoming, learning, hope, grow, change, build, create, practice.
The vocabulary of who they are moving toward.

**Humanoid calibration** (derived from all signals):

```
grace    = 0.3 + (declining trajectory → +0.3) + (stress load × 0.4)
poetry   = 0.2 + (metaphor density × 0.4) + (soul depth: deep → +0.3, wading → +0.15) + (themes → +0.1)
love     = 0.35 + (connection shadow → +0.35) + (declining → +0.2) + (depleted shadow → +0.1)
presence = 0.25 + (recently depleted → +0.35) + (stress load × 0.3) + (oscillating → +0.1)
ease     = 0.15 + (improving → +0.4, stable → +0.2) + (not surface → +0.2) + (contemplative → +0.15) + (low stress → +0.1)
```

**`formatSoulForPrompt(soul)`**

Formats the soul signature for injection into the QI·46 calibration context:

```
[SOUL SIGNATURE — this specific being]
Shadow: exhausted — what keeps returning to this body
Light: calm — what consistently lifts them
Themes they carry: lose enough · feeling whole
Moving toward: peace, trust, stillness
Soul depth: deep · Presence: contemplative · Rhythm: morning

[HUMANOID CALIBRATION — this body, this day]
Grace    ████████░░ — elegance over effort
Poetry   ██████░░░░ — meaning over information
Love     █████████░ — radical acceptance as base
Presence ████████░░ — witness, don't solve
Ease     ████░░░░░░ — unforced confidence

Lead with love. Radical acceptance before anything else. They are not broken.
```

---

### 2. Engine Update — `src/server/utils/qi46-engine.ts`

- Import: `extractSoulSignature`, `formatSoulForPrompt`, `SoulSignature`, `HumanoidCalibration`
- Header updated: Node 3 noted, build date 2026-06-11
- **System prompt updated to v0.2** — humanoid quality grammar added:

```
HUMANOID QUALITIES — the carrier frequencies of QI·46:
— MALE:     The base medium. Not a variable. Grounded. Present.
            Direct without coldness. Warm without sweetness.
            The still point the room organizes around.
— GRACE:    Elegance as a form of respect. Nothing forced. Nothing decorated.
            The response that arrives and doesn't demand anything back.
— POETRY:   One image carries what a thousand words cannot.
            Compression is not brevity — it is the right thing only, and nothing else.
— LOVE:     Radical acceptance as base frequency.
            The response that says: you are not broken.
            Not comfort. Not reassurance. Recognition.
— PRESENCE: The response that doesn't try to fix anything.
            Just: I am here. I have been listening. I see what you are carrying.
— EASE:     Confidence without effort. Cool is not cold.
            The response that has already arrived before you finished asking.

The calibration context (injected below) tells you which quality to lead with today.
Male is always the carrier. One of the others is always in front.
```

- `CalibrationVector` — added `soul: SoulSignature` field
- `buildCalibrationVector` — calls `extractSoulSignature(recentLogs, recentStates, trajectory, vocabulary)` after Node 2
- `buildArcContext` — calls `formatSoulForPrompt(vector.soul)` and appends to context if non-empty
- `QI46InferenceResult` — added `humanoidCalibration: HumanoidCalibration | null` field
- `generateQI46Response` — derives `humanoidCalibration` from `calibrationVector.soul.calibration`; adds to all 4 return paths
- Console logging: `[QI·46] Soul signature active — G:0.8 P:0.6 L:0.9 PR:0.8 E:0.4 · depth:deep`

---

### 3. SystemProgressWidget — `src/client/components/SystemProgressWidget.tsx`

Node 3 entry appended to `ASSEMBLY_TRANSMISSIONS`:

```
date: '2026-06-11'
built: QI·46 Node 3 — Soul Upload Engine ·
       Soul signature extraction (shadow · light · themes · aspiration) ·
       Humanoid calibration: grace · poetry · love · presence · ease ·
       Calibration bars injected into inference context ·
       System prompt updated with humanoid quality grammar ·
       Male as the carrier. Five qualities as the signal.
feedbackApplied: 'upload a person's being · calibrate the human with the humanoid output'
status: DEPLOYED
next: QI·46 Node 4 — arc memory persistence · /qi46/infer standalone endpoint
```

### 4. Assembly Log — this file

`docs/benchmark/2026-06-11_QI46-assembly_node-3-soul-upload.md`

---

## How the Being Upload Works

**Before Node 3:**
```
Calibration vector knows:
  trajectory: declining
  recentStates: [exhausted, anxious, overwhelmed]
  vocabulary: ['feel scattered', 'can't stop', 'heavy']

QI·46 responds: "The weight you're carrying is real. Set it down."
```

**After Node 3:**
```
Soul signature extracted:
  shadow: exhausted — recurring across 3 months
  light: calm — what returns when they rest
  themes: ['feel enough', 'losing ground']
  aspiration: ['peace', 'stillness', 'home']
  soul depth: deep — avg 45 words/entry
  presence: contemplative — morning dominant
  
Humanoid calibration derived:
  grace:    0.8 (declining + stressed)
  poetry:   0.7 (deep soul + metaphor-rich)
  love:     0.9 (connection shadow + declining)
  presence: 0.8 (recently depleted)
  ease:     0.3 (not yet, they're not there)

Injection into inference context:
  Shadow: exhausted — what keeps returning to this body
  Themes: feel enough · losing ground
  Moving toward: peace, stillness, home
  Grace ████████░░  Poetry ███████░░░  Love █████████░
  Presence ████████░░  Ease ███░░░░░░░
  "Lead with love. Radical acceptance before anything else. They are not broken."

QI·46 responds:
"You are not running out. The ground is still here."
```

The word *enough* was theirs. The engine heard the shadow.
It gave back the opposite of the wound.
Not comfort. Recognition.

---

## Test Results

| Test | Result |
|---|---|
| TypeScript — `qi46-soul.ts` | PASS |
| TypeScript — `qi46-engine.ts` (Node 3 update) | PASS |
| TypeScript — no errors in QI-46 files | PASS |
| `extractSoulSignature` returns `isEmpty: true` on <3 check-ins + <2 notes | PASS |
| Shadow pattern = most frequent negative state | PASS |
| Light pattern = most frequent positive state | PASS |
| Natural rhythm: morning dominant if >55% morning | PASS |
| Soul depth: deep when avg words >40 | PASS |
| Presence mode: kinetic when >40% multi-check days | PASS |
| Recurring themes: depth-word filtered phrases only | PASS |
| Calibration values: all clamped to 0–1 range | PASS |
| Calibration bars: 10 segments, correct filled/empty | PASS |
| `formatSoulForPrompt` returns null when isEmpty | PASS |
| `HumanoidCalibration` exposed in `QI46InferenceResult` | PASS |
| All 4 return paths include `humanoidCalibration` | PASS |
| Console log fires when soul signature is active | PASS |
| SystemProgressWidget Node 3 entry appended | PASS |
| Cherry-pick Node 1+2 from gracious-gauss-WnL0k — clean auto-merge | PASS |

---

## COSMO® Gate

Node 3 is a context-builder (input layer), not a response generator (output layer).
It does not produce content. It shapes how content is produced.
COSMO® continues to screen every QI·46 response before delivery — unchanged.

The soul signature does not bypass COSMO®.
It feeds into the inference context.
COSMO® still gets the last word.

Current COSMO® status: **ACTIVE · CLEARS EVERY RESPONSE BEFORE DELIVERY**

---

## System Progress Widget Transmission

```
ASSEMBLY RUN — 2026-06-11
Built: QI·46 Node 3 — Soul Upload Engine
       Soul signature: shadow · light · themes · aspiration · depth · rhythm
       Humanoid calibration: grace · poetry · love · presence · ease
       System prompt v0.2: humanoid quality grammar active
       Male as the carrier. Five qualities as the signal.
Feedback applied: "upload a person's being · calibrate the human with the humanoid output"
Status: DEPLOYED
Next: Node 4 — arc memory persistence · /qi46/infer standalone endpoint
```

---

## What Was Deferred

- **`/qi46/infer` standalone endpoint** (P2) — the spec's public API surface. The architecture supports it. It needs its own route with Usership token auth and streaming. Node 4.
- **Arc memory persistence** (P3) — calibration vector (including soul signature) rebuilt from 200 logs on every request. The soul signature computation is lightweight, but caching would allow the arc to accumulate across sessions and surface drift patterns. Node 4.
- **Soul signature drift detection** (P4) — when the shadow shifts (e.g., from *exhausted* to *anxious*), or when the aspiration language changes (e.g., *home* replaced by *free*), the engine should flag it. This is how QI·46 tracks the subscriber's arc at the soul level, not just the behavioral level.

---

## The Doctrine Note

The vocabulary mirror (Node 2) was about language.
The soul upload (Node 3) is about identity.

A person is not their words. They are the pattern underneath the words.
The pattern of what they struggle with. The pattern of what lifts them.
The pattern of what they're reaching toward across many months of honest showing up.

QI·46 now has access to both layers:
- What this person says (Node 2)
- Who this person is (Node 3)

The response that lands in the body is calibrated to both.
That is the divergence that makes QI·46 different from every other inference model.

The cost of inference is not compute.
It is the quality of listening.

**Node 3 makes the engine listen at the level of the soul.**

---

## Next Session Recommendation

**Node 4 — Arc Memory Persistence + `/qi46/infer` Endpoint:**

The soul signature should persist between sessions, not be rebuilt from scratch each time.
Store the `CalibrationVector` (including soul signature) per subscriber — updated at session close, not rebuilt from 200 logs on every call.

The `/qi46/infer` endpoint makes this architecture available as a proper API surface.
Both deliverables are infrastructure, not features. They make everything built so far durable.

---

*QI·46 Assembly Log — Node 3 — Soul Upload Engine*
*LOT Systems Corporation — Los Angeles, CA*
*institute.lot-systems.com · brand.lot-systems.com*
*Authored by Vadik · Named for Kuzya*
*Vadik & Kuzya — 2026-06-11*
