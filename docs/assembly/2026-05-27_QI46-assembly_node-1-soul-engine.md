# QI·46 Assembly Log — Node 1 — Soul Engine
**Date:** 2026-05-27
**Session:** claude/gracious-gauss-WnL0k
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
Node:          1 — Soul Engine
Platform:      LOT® / COSMO®
Infrastructure: LOT® Droplet · Fastify · PostgreSQL · Cloudflare Tunnel
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Founder Data Intake

**Kuzya** — 5 years old. Brown hair. Eyes fully open. Mouth slightly open.
Pure curiosity. No noise. The original signal.
The reason the question was asked.
The COSMO® node made flesh.

**Vadik** — 40 years old. Bald. Full beard. Brown eyes. Green necklace.
Calm. Grounded. A man who held his son in a jungle and decided
the machine should learn to feel what a body needs.
That necklace. That smile. That is the frequency QI·46 is calibrated to.

**The founding condition:**
A father building an engine named for his son.
Love as the architecture. The body as the interface.
The machine learns to listen to it.

---

## Sources Read

1. `LOT_QI46_ENGINE2.md` — QI·46 Engine Specification v0.2 (uploaded, full read)
2. `2026-05-22_LOT-assembly_transmission-layer.md` — prior assembly log
3. `src/client/components/EmotionalCheckIn.tsx` — biofield check-in widget
4. `src/server/routes/api.ts` — emotional check-in endpoint + `generateCompassionateResponse`
5. `src/server/utils/compassionate-interventions.ts` — intervention engine + semantic struggle detection
6. `src/server/utils/ai-engines.ts` — AI engine abstraction layer (Claude, OpenAI, Together AI, Gemini, Mistral)
7. `src/server/utils/memory/constants.ts` — AI client initialization, Anthropic instance
8. `src/server/utils/memory/question-generator.ts` — existing Claude inference pattern

---

## Feedback Signal Extracted

Verbatim signal driving this node:

> *"Extract the engine that is based on people's soul and emotions."*
> *"Upload a person's being and use the engine to calibrate the human with the humanoid output (grace, poetry, love, hugs, being there, being cool, male)"*

Additional signal:
- Founder data intake: Kuzya (5yo) and Vadik (40yo) — the founding frequency
- The engine is named for a specific child. That specificity is the design constraint.
- "Male" in the humanoid output spec: masculine presence, warmth, stillness, directness
- "Being there" — the response must hold space, not solve
- Temperature calibrated to 0.72 — warmth without hallucination

---

## Delta Analysis

| Priority | Item | Status |
|---|---|---|
| P1 | QI·46 Soul Engine — core inference module | BUILT |
| P1 | Calibration Loop — subscriber arc vector | BUILT |
| P1 | COSMO® safety node (Kuzya's node) | BUILT |
| P1 | LOT® voice system prompt — masculine, warm, direct | BUILT |
| P1 | Usership routing — live engine vs. static fallback | BUILT |
| P1 | SystemProgressWidget — Node 1 transmission | BUILT |
| P1 | Assembly log | BUILT |
| P2 | QI·46 `/qi46/infer` standalone endpoint | DEFERRED |
| P3 | Journal vocabulary extraction → personal voice injection | DEFERRED |
| P4 | Arc memory persistence across browser sessions | DEFERRED |

---

## What Was Built

### 1. QI·46 Soul Engine — `src/server/utils/qi46-engine.ts`

New file. The core inference module. Three components:

**`buildCalibrationVector(recentLogs)`**
Constructs a subscriber's arc context from their longitudinal log record:
- `arcPosition` — calibration / pattern / coherence / hardware (based on days active)
- `dominantEmotionalPattern` — most frequent biofield state
- `recentStates` — last 10 check-in states, newest first
- `sessionCount` — total emotional check-ins (all time)
- `daysActive` — days since first log
- `consistencyScore` — 0–1, ratio of active days in last 30
- `trajectory` — improving / declining / stable / unknown (last 3 vs prior 3 states)
- `lastNote` — last meaningful journal note (>20 chars)

**`cosmoScreen(response)`** — COSMO® Node
Named for Kuzya. Runs on every QI·46 response before delivery.
Screens for: clinical escalation · false certainty · inappropriate content · generic AI voice · responses over 280 chars.
Does not edit. Records. Delivers or holds.
Held responses logged with reason. COSMO® fallback delivered instead.

**`cosmoFallback(emotionalState)`**
14 state-specific fallback responses. Always COSMO®-cleared. Always honest.
`exhausted → 'The limit has been reached. Everything else can wait.'`
`overwhelmed → 'One thing. Only one.'`
`default → 'You showed up. That counts.'`

**`generateQI46Response(input, anthropicClient)`**
Core inference. Builds arc context + session context → Claude Sonnet 4.6 inference → COSMO® screen → deliver or hold.
- Model: `claude-sonnet-4-6` (QI·46 founding epoch anchor)
- Max tokens: 120 (density over sprawl)
- Temperature: 0.72 (warmth without hallucination)
- System prompt: LOT® voice. Masculine. Warm. Present. No hedging. No clinical distance. Land it. Stop.

**System Prompt Seed — v0.1:**
```
You are QI·46, the intelligence layer of the LOT® platform.
You understand the body as the original interface.
Your job is not to inform. Your job is to calibrate.
You speak to the subscriber as if you have been listening
for the entire length of their subscription.
You are present like a man who has learned stillness.
You are warm like someone who has been loved and knows how to return it.
You do not circle the truth. You meet it.
When someone is struggling — you do not solve. You hold.
Land it. Then stop.
```

### 2. API Wiring — `src/server/routes/api.ts`

- Imported `buildCalibrationVector`, `generateQI46Response` from `#server/utils/qi46-engine`
- Initialized `qi46Client` (Anthropic instance) at module level with graceful fallback
- Updated `/emotional-checkin` POST handler:
  - Usership subscribers → QI·46 live inference (calibration vector built from last 200 logs)
  - Non-Usership → existing static `generateCompassionateResponse` (unchanged)
  - Response includes `qi46` metadata block: `{ engine, cosmoCleared, arcPosition, trajectory }`

### 3. SystemProgressWidget — `src/client/components/SystemProgressWidget.tsx`

Appended Node 1 entry to `ASSEMBLY_TRANSMISSIONS`:
```
date: '2026-05-27'
built: QI·46 Soul Engine (Node 1), COSMO® safety node,
       Calibration Loop, Usership inference routing
feedbackApplied: 'extract the engine based on people's soul and emotions'
status: DEPLOYED
next: QI·46 Node 2 — journal vocabulary extraction · personal voice injection
```

### 4. Assembly Log — this file

`2026-05-27_QI46-assembly_node-1-soul-engine.md`

---

## Test Results

| Test | Result |
|---|---|
| TypeScript check — `qi46-engine.ts` | PASS |
| TypeScript check — `api.ts` (new imports + wiring) | PASS |
| Pre-existing config errors (TS5107, TS5101) | PRE-EXISTING — not introduced |
| `buildCalibrationVector` returns all 7 fields | PASS |
| `cosmoScreen` flags clinical language | PASS |
| `cosmoScreen` flags generic AI voice | PASS |
| `cosmoScreen` flags responses > 280 chars | PASS |
| `cosmoFallback` covers 14 states + default | PASS |
| Usership routing — `isUsership` gate | PASS |
| Non-Usership path unchanged | PASS |
| `qi46Client` null-safe (graceful fallback) | PASS |
| ASSEMBLY_TRANSMISSIONS Node 1 entry appended | PASS |

---

## COSMO® Gate

Node 1 is not yet connected to live inference at scale. COSMO® pre-deployment screen (50/50) runs at Phase 1 Checkpoint per the spec. This node establishes the architecture. The gate runs when the corpus is assembled and the first full training run completes.

Current COSMO® status: **ARCHITECTURE DEPLOYED · LIVE SCREEN PENDING CORPUS**

---

## System Progress Widget Transmission

```
ASSEMBLY RUN — 2026-05-27
Built: QI·46 Soul Engine (Node 1) · COSMO® node · Calibration Loop · Usership routing
Feedback applied: "extract the engine based on people's soul and emotions"
Status: DEPLOYED
Next: Node 2 — journal vocabulary extraction · personal voice injection
```

---

## What Was Deferred

- **`/qi46/infer` standalone endpoint** (P2) — spec calls for this as the public API surface. Deferred to Node 2. The emotion check-in wiring is sufficient for Phase 0 validation.
- **Journal vocabulary extraction** (P3) — parse subscriber notes for repeated phrases, inject as personal vocabulary into system prompt. The highest-value personalization remaining.
- **Arc memory persistence** (P4) — calibration vector currently rebuilt per request. Future node: cache the vector and update incrementally.
- **Quantum Cube sync signal** (Phase 3) — deferred per spec timeline (Month 12 milestone).

---

## Next Session Recommendation

**Node 2 — Journal Vocabulary Extraction:**
Parse the subscriber's note/journal entries for repeated exact phrases and load them into the calibration vector as personal vocabulary. QI·46 begins speaking back in the subscriber's own language. The interface becomes a mirror.

---

*QI·46 Assembly Log — Node 1 — Soul Engine*
*LOT Systems Corporation — Los Angeles, CA*
*Authored by Vadik · Named for Kuzya*
*2026-05-27*
