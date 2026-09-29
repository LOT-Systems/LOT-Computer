# QI·46 Assembly Log — Node 2 — Journal Vocabulary Extractor
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
Node:          2 — Journal Vocabulary Extractor (Mirror Layer)
Platform:      LOT® / COSMO®
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Feedback Signal Extracted

> *"Node 2 recommendation — YES"*

The mirror layer. The engine learns the subscriber's language.

When someone writes "I feel scattered" three times —
the engine says "scattered" back. Not "overwhelmed."
The word that belongs to them.

---

## Sources Read

Prior node output fully absorbed. Additional references:
- `src/shared/types/index.ts` — `Log` type, `LogEvent` ('note', 'emotional_checkin')
- `src/server/utils/qi46-engine.ts` — Node 1 architecture (updated in this node)
- `src/server/routes/api.ts` — Usership routing (updated to surface vocabularySize)

---

## Delta Analysis

| Priority | Item | Status |
|---|---|---|
| P1 | `qi46-vocabulary.ts` — Journal Vocabulary Extractor | BUILT |
| P1 | Stop word filter (200+ words) — signal vs noise | BUILT |
| P1 | Body metaphor detection (40 seeds) | BUILT |
| P1 | N-gram extraction (2-gram + 3-gram phrases) | BUILT |
| P1 | Recency weighting — last 30 days full, decays to 0.2 at 180 days | BUILT |
| P1 | `CalibrationVector.vocabulary` field added | BUILT |
| P1 | `buildArcContext` — lexicon injected into calibration context | BUILT |
| P1 | `QI46InferenceResult.vocabularySize` exposed | BUILT |
| P1 | API metadata updated — vocabularySize surfaced | BUILT |
| P1 | SystemProgressWidget — Node 2 transmission appended | BUILT |
| P1 | Assembly log | BUILT |
| P2 | QI·46 `/qi46/infer` standalone endpoint | DEFERRED |
| P3 | Arc memory persistence (cache calibration vector) | DEFERRED |
| P4 | Vocabulary drift detection (phrases that stopped appearing) | DEFERRED |

---

## What Was Built

### 1. Journal Vocabulary Extractor — `src/server/utils/qi46-vocabulary.ts`

New file. The mirror layer.

**`extractPersonalVocabulary(logs)`**
Parses all subscriber-authored text — `note` events and `emotional_checkin` metadata notes.

Pipeline:
1. **Text extraction** — collects all `note` (>15 chars) and `emotional_checkin` notes (>10 chars)
2. **Normalization** — lowercase, punctuation stripped (apostrophes preserved: *can't*, *don't*)
3. **Tokenization** — splits on whitespace, minimum 3 chars, stop words removed
4. **Stop word filter** — 200+ words covering articles, prepositions, conjunctions, common verbs, temporal markers, check-in boilerplate
5. **N-gram extraction** — 2-grams and 3-grams from filtered tokens
6. **Keyword extraction** — single distinctive words (excluding body metaphors, handled separately)
7. **Body metaphor detection** — 40 seed terms: *heavy, light, stuck, flow, scattered, grounded, drifting, burning, frozen, empty, full, broken, whole, tight, open, closed, spinning, sinking, floating, sharp, numb, raw...* Detected via whole-word regex against raw normalized text.
8. **Recency weighting** — full weight (1.0) for last 30 days; linear decay to 0.2 at 180 days; floor at 0.2. Score = sum of weighted occurrences.
9. **Frequency gate** — only entries appearing at least twice make the cut
10. **Output** — top 6 phrases, top 8 keywords, top 4 metaphors (all score-sorted)

Returns `PersonalVocabulary`:
- `phrases: VocabEntry[]` — recurring 2–3 word phrases
- `keywords: VocabEntry[]` — distinctive single words
- `metaphors: string[]` — body/emotional metaphor frames
- `corpusSize: number` — total notes analyzed
- `isEmpty: boolean` — true when subscriber has no meaningful text yet

**`formatVocabularyForPrompt(vocab)`**
Formats the personal lexicon for injection into the QI·46 calibration context:
```
[SUBSCRIBER PERSONAL LEXICON]
Corpus: 47 journal entries analyzed
Their recurring phrases: "can't slow down", "feels heavy", "need more space"
Their distinctive words: scattered, depleted, momentum, rhythm
Their body metaphors: heavy, scattered, stuck
Mirror their language when it fits. Never force it.
```

### 2. Engine Update — `src/server/utils/qi46-engine.ts`

- Import: `extractPersonalVocabulary`, `formatVocabularyForPrompt`, `PersonalVocabulary`
- `CalibrationVector` — added `vocabulary: PersonalVocabulary` field
- `buildCalibrationVector` — calls `extractPersonalVocabulary(recentLogs)` at end
- `buildArcContext` — calls `formatVocabularyForPrompt` and appends to context if non-empty
- `QI46InferenceResult` — added `vocabularySize: number` field
- All 4 return paths updated with `vocabularySize`
- Console log on active vocabulary: `[QI·46] Personal lexicon active — 14 vocab entries · 47 journal notes`

### 3. API Update — `src/server/routes/api.ts`

- `qi46Meta` now includes `vocabularySize` — surfaced to client in response

### 4. SystemProgressWidget — `src/client/components/SystemProgressWidget.tsx`

Node 2 entry appended to `ASSEMBLY_TRANSMISSIONS` (2026-05-27).

### 5. Assembly Log — this file

`2026-05-27_QI46-assembly_node-2-vocabulary.md`

---

## How the Mirror Works

**Before Node 2:**
```
Subscriber writes: "everything feels so heavy right now, can't stop the weight"
QI·46 responds: "Rest. The limit has been reached."
```

**After Node 2:**
```
Subscriber writes: "everything feels so heavy right now, can't stop the weight"
Calibration vector includes: metaphors: ['heavy'], phrases: ["can't stop"], keywords: ['weight']
QI·46 now calibrates: "The weight you're carrying is real. Set it down. Not later."
```

The word *heavy* was theirs. The engine gives it back.

---

## Test Results

| Test | Result |
|---|---|
| TypeScript check — `qi46-vocabulary.ts` | PASS |
| TypeScript check — `qi46-engine.ts` (updated) | PASS |
| TypeScript check — `api.ts` (vocabularySize) | PASS |
| `extractPersonalVocabulary([])` returns `isEmpty: true` | PASS |
| Stop word filter excludes 'the', 'and', 'feeling', 'morning' | PASS |
| N-grams only from filtered tokens (no stop-word pairs) | PASS |
| Metaphor detection uses whole-word regex | PASS |
| Recency weight: 30-day = 1.0, 180-day = 0.2 | PASS |
| Frequency gate: phrases/keywords appear ≥ 2 times | PASS |
| `formatVocabularyForPrompt` returns null on empty vocab | PASS |
| `CalibrationVector` includes `vocabulary` field | PASS |
| `QI46InferenceResult` includes `vocabularySize` | PASS |
| ASSEMBLY_TRANSMISSIONS Node 2 entry appended | PASS |

---

## System Progress Widget Transmission

```
ASSEMBLY RUN — 2026-05-27
Built: QI·46 Node 2 — Journal Vocabulary Extractor · Personal lexicon · Body metaphor detection · Mirror layer
Feedback applied: "the engine speaks back in the subscriber's own language"
Status: DEPLOYED
Next: Node 3 — standalone /qi46/infer endpoint · arc memory persistence
```

---

## What Was Deferred

- **`/qi46/infer` standalone endpoint** (P2) — the public API surface specified in the engine spec. Node 3.
- **Arc memory persistence** (P3) — calibration vector rebuilt on every request from 200 logs. Future node: cache the vector, update incrementally on each session.
- **Vocabulary drift detection** (P4) — detect when phrases the subscriber used frequently have stopped appearing. A signal that something has shifted. Worth surfacing.

---

## Next Session Recommendation

**Node 3 — Standalone `/qi46/infer` Endpoint + Arc Memory Persistence:**
The spec defines `POST https://qi.lot-systems.com/v1/inference` as the engine's public API surface.
Build the route. Add arc memory caching — vector stored per subscriber, updated at session close.
The engine stops rebuilding from scratch. It remembers where it left off.

---

*QI·46 Assembly Log — Node 2 — Journal Vocabulary Extractor*
*LOT Systems Corporation — Los Angeles, CA*
*Authored by Vadik · Named for Kuzya*
*2026-05-27*
