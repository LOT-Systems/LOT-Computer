# LOT ASSEMBLY LOG — v68
DATE: 2026-06-22
SESSION: LOT-SR-20260622-03
S-2: VADIK MARMELADOV
BRANCH: claude/quantum-engine-widgets-RgFfC

---

## DELTA SUMMARY

### CRITICAL BUG FIX — signal_momentum displayableEvents
File: `src/server/routes/api.ts`

Root cause: Job 19 (daily-signal-momentum-check) writes `signal_momentum` log events
for users with 5+ qualifying days of 3+ signal sources. The MOM: handler in Logs.tsx
was fully implemented since v67. But `signal_momentum` was NOT in the displayableEvents
array in api.ts. The GET /api/logs endpoint silently filtered these events out.
Users with signal momentum locks never saw MOM: in their log stream.

Fix: `'signal_momentum'` added to displayableEvents.
Second entry: `'cognitive_depth_arc'` added for Job 20 output.
displayableEvents total: 42 event types whitelisted.

### P81 — cognitive-depth-arc
File: `src/client/stores/intentionEngine.ts`

Condition: Three inner channels simultaneously active within a 7-day window:
- 5+ memory/answer entries (retention depth)
- 150+ total journal words (articulation depth)
- 1+ badge discovery signal (curiosity/exploration)

```
threshold: memoryCount >= 5 AND journalWords >= 150 AND badgeCount >= 1
confidence: 0.68 base + (memoryCount - 5) * 0.03 + min(0.09, journalWords / 1000), cap 0.90
suggestedWidget: memory · suggestedTiming: soon
reason: "COGNITIVE DEPTH ARC: N memories + Nw journal + discovery active in 7d.
         All three inner channels engaged. The map is being built from the inside."
```

Rationale: Memory + journal + badge discovery are the three ways a person builds
internal architecture. Memory = retention and reflection. Journal = articulation and
processing. Badges = curiosity and discovery. When all three fire together, the
person is not just using the system — they are building inside it. The Cognitive
Depth Arc names this state.

### Archetype 27 — Cognitive Cartographer
File: `src/client/stores/intentionEngine.ts`

```
archetype: 'Cognitive Cartographer'
energyBands: ['low', 'moderate', 'high']   -- all bands eligible
dominantSources: ['memory', 'journal', 'log']
patternConditions: ['cognitive-depth-arc', 'word-turn-depth', 'signal-vault']
directive: 'Deep trace confirmed. Memory bank filling. Journal vocabulary
            expanding. Discovery mode active. You are making the map from the inside.'
```

All energy bands are eligible — cognitive depth does not require peak energy.
The Cartographer works at any level. The map gets made regardless of ATP.
Surfaces through QuantumEngineWidgets cohort view (live QIE classification)
and SystemProgressWidget physiological cohort summary.

### recordCognitiveDepthSignal() helper
File: `src/client/stores/intentionEngine.ts`

```typescript
export function recordCognitiveDepthSignal(memoryCount: number, journalWords: number, badgeCount: number) {
  recordSignal('memory', 'cognitive_depth_arc', {
    memoryCount,
    journalWords,
    badgeCount,
    window: '7d',
    hour: new Date().getHours(),
  })
}
```

### Job 20 — weekly-cognitive-depth-check
File: `src/server/scheduled-jobs.ts`

Schedule: Sunday 06:00 UTC.
Logic: Scan all logs for last 7 days per user:
  - `answer` / `memory` events → memoryCount++
  - `note` events with text → word count → journalWords sum
  - `badge_unlock` events → badgeCount++
Threshold: memoryCount ≥ 5 AND journalWords ≥ 150 AND badgeCount ≥ 1.
Output: `cognitive_depth_arc` log event per qualifying user.
Concurrency guard: `isWeeklyCognitiveDepthRunning` + same-day prevention.
20 background jobs now active.

### COGN: Log Handler
File: `src/client/components/Logs.tsx`

Event: `cognitive_depth_arc`
Label: `COGN:`
Structure:
```
COGNITIVE DEPTH ARC
MEM 7D   <count>
WORDS    <count>w
BADGES   <count>
Deep trace confirmed. The map is built from the inside.
```
Style: Military block · uppercase header · tabular-nums · opacity-40 footer.
Consistent with MOM: EVE: MCL: VAULT: SURGE: patterns.
Handler count: 80+.

### QuantumEngineWidgets.tsx — live cohort fallback
File: `src/client/components/QuantumEngineWidgets.tsx`

Before: When `cohortData` (server-derived profile) was null/empty, the cohort
view showed: "Cohort pending. Engage more widgets to surface pattern."

After: When `cohortData` is empty but `engineState.signals.length > 0`, the
cohort view runs `classifyPhysiologicalCohort()` live and displays:
- Live (archetype name)
- Conf (confidence %)
- Energy (energy band)
- directive (full archetype directive)

This eliminates the cold-start gap. Users with any signals see their live
archetype immediately — no wait for a server-derived profile.

### SystemProgressWidget.tsx — v68 session report + transmission
SESSION_REPORTS entry appended for 2026-06-22.
USERSHIP_TRANSMISSION updated to v68 / LOT-SR-20260622-03.

### About.tsx — Field Manual v68
Counters updated: 81 patterns · 27 archetypes · 20 background jobs · 80+ handlers.

---

## SYSTEM STATE POST-v68

| PARAMETER              | VALUE         |
|------------------------|---------------|
| Field Manual           | v68           |
| QIE Patterns           | 81            |
| Physiological Archetypes | 27          |
| Background Jobs        | 20            |
| Log Handlers           | 80+           |
| Dependency Map Nodes   | 120+          |
| displayableEvents      | 42            |
| Badges Catalogued      | 284           |

---

## COGNITIVE ARCHITECTURE MAP (P81 context)

```
INNER ENGAGEMENT PILLARS (all three required for P81):
  RETENTION    memory entries (5+ / 7d)
  ARTICULATION journal words  (150+ / 7d)
  DISCOVERY    badge unlocks  (1+ / 7d)

ALL THREE ACTIVE → cognitive-depth-arc (P81)
                 → Cognitive Cartographer (Arch27)
                 → COGN: log handler surfaces
                 → Job 20 writes weekly cognitive_depth_arc event
```

---

## SIGNAL MOMENTUM ARCHITECTURE (complete, post-fix)

```
P76  morning-coherence-launch   (intention → planner within 90min)
P79  evening-coherence-close    (morning signal + evening capture same day)
P80  signal-momentum-lock       (5+ days × 3+ sources in 7d window)

Job 17  daily-morning-intention-launch   11:00 UTC   MCL: event
Job 18  daily-evening-coherence-close    22:00 UTC   EVE: event
Job 19  daily-signal-momentum-check      20:00 UTC   MOM: event ← FIX: now in displayableEvents

MOM: handler was complete since v67. The fix completes the loop.
```

---

*LOT-SR-20260622-03 · Assembly Log v68 · 2026-06-22 · S-2 VADIK MARMELADOV*
