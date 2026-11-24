# LOT® WIDGET HEALTH SCAN — 2026-11-24

```
REPORT ID      LOT-WHS-20261124
TRIGGER        Scheduled routine · widget wiring / UI / lag scan
BRANCH         claude/charming-albattani-5yeb8g  (base = origin/master 9f2b88c)
SCOPE          43 widget surfaces · System tab · QIE · Memory/Story · Log sync · bundle
STATUS         7 DEFECTS FIXED · 1 CRITICAL · BUILD GREEN · 0 NEW TYPE ERRORS
```

---

## 0 · SITREP (read this first)

| # | Sev | Defect | Effect in production | Status |
|---|-----|--------|----------------------|--------|
| 1 | **CRITICAL** | `intentionEngine.ts` Pattern 147 references `dayMs`, which is undefined in `analyzeIntentions()` scope | `analyzeIntentions()` throws `ReferenceError` whenever ≥1 signal exists. `System.tsx` calls it **during render** (`useMemo → getOptimalWidget()`), so for paid accounts the throw goes up to `AppErrorBoundary`. Live since `1846b80` (2026-08-03, QIE v112). Side effect: `lastAnalysis` never advances, so QIE pattern recognition has not completed a run since then. | **FIXED** |
| 2 | HIGH | `UserMetricsWidget` calls `classifyPhysiologicalCohort()` with 0 of its 3 required args | Throws on every render. It sits inside the `Dashboard` error boundary, so UserMetrics + CorrelatedIndexes + SystemProgress + SystemPulse all show the fallback together | **FIXED** |
| 3 | HIGH | QIE sync watermark (`lastSyncedTimestamp`) not persisted | Every page load resets it to 0, so the first sync re-uploads up to 7 days / 1000 signals as **duplicate `quantum_intent_signal` Log rows** | **FIXED** |
| 4 | HIGH | `syncToServer()` writes back a copy of state taken before the `await` | Signals recorded while the sync request is in flight are **silently dropped** | **FIXED** |
| 5 | MED | `/api/me` does not return `joinedAt` | `MonthlyPulseWidget` always computes month 0, so the month-by-month reveal widget **never shows** | **FIXED** |
| 6 | MED | `QuantumEngineWidgets` reads `dimensions.selfcare` (key is `selfCare`) | CARE row always rendered blank | **FIXED** |
| 7 | LOW | Planner click `AudioContext` never `resume()`d | First planner click is silent on iOS Safari / under autoplay policy | **FIXED** |
| 8 | PERF | `SystemProgressWidget` (177 KB, mostly changelog strings) loaded eagerly | Eager JS reduced 1357 KB → 1174 KB (**−183 KB / −13.5%**) via `React.lazy` | **FIXED** |

Type-only corrections: `useCreateMemory` response now declares `insight?` (the server already sends it); signal source union now includes `'micro_game'`.

---

## 1 · Verification

```
tsc --noEmit (client)   104 → 95 errors   (−9, 0 new; remaining 95 are older, mostly badges.ts)
tsc (server build)      0 errors
client:js:build         ✓ Client build completed
server:build            ✓ ESM imports fixed
```

Runtime proofs: the stores were bundled with esbuild and run under Node with a stubbed `window` / `localStorage` / `fetch`.

```
== BEFORE (origin/master)
getOptimalWidget THROWS: dayMs is not defined
classifyPhysiologicalCohort() THROWS: Cannot read properties of undefined (reading 'filter')
dimensions.selfcare → undefined

== AFTER (this branch)
getOptimalWidget OK -> selfcare 6.9ms
classifyPhysiologicalCohort(signals, state, patterns) → { archetype: "Anxious Explorer", dominantModule: "mood" }
signals after sync: 6 | in-flight signal kept: true     (was dropped)
watermark persisted: true                                (was never persisted)
posted batch sizes: [ 5 ]
```

Not verified: I did not run a full in-browser session against a live DB/auth stack. The crash in defect #1 is inferred from the code path (render-time `useMemo` → throw → nearest boundary is `AppErrorBoundary`). The throw itself is reproduced.

---

## 2 · Widget wiring matrix

Legend: **QIE** = writes Quantum Intent Engine signals · **LOG** = writes Log entries directly · **READ** = server queries consumed · ⚠ = finding.

| Widget | QIE signal source | Direct LOG | Reads | Notes |
|---|---|---|---|---|
| TimeWidget | — | — | — | Display only |
| QuantumRandomWidget | `calculator` | — | — | |
| MemoryWidget | `memory` | via `/api/memory/answer` | useMemory | Feeds Memory Story on the Portrait |
| MicroGameWidget | `micro_game` | — | — | Game loop is viewport-gated ✓. Type union was missing source (fixed) |
| MicroCalculatorWidget | `calculator` | — | — | |
| MicroImageWidget | `intentions` | — | — | |
| PlannerWidget | `planner` | ✓ useCreateLog | — | Click sound fixed (#7) |
| RecipeWidget | `selfcare` | ✓ | useLogs | Module-level 5-min `setInterval` (never cleared; harmless singleton) |
| CalendarWidget | `recordCalendarSignal` | ✓ | useLogs | |
| SelfCareMoments | `selfcare` | ✓ | useLogs, check-ins, profile | |
| EmotionalCheckIn | `mood` | via check-in API | useLogs | |
| IntentionsWidget | `intentions` | — | — | 6 localStorage touches, 1 try |
| ContextualPrompts / ChatCatalyst / Interventions | `mood` / `journal` / `mood` | ContextualPrompts → `/api/logs` | AI endpoints | **LOT® AI** surfaces |
| Narrative / GoalJourney / Evolution | `journal` / `intentions` / — | — | useNarrative, useGoalProgression | **Story** surfaces |
| PatternInsights / MoodAnalytics / CohortConnect | `intentions`·`memory`·`mood` / — / `mood` | — | patterns, cohorts | Gated by `$featureUnlocks` |
| QuantumEngineWidgets | `intentions` | — | `/api/user-profile`, energy | LazyMount ✓. CARE key fixed (#6) |
| QuantumState / PatternRecognition / AIFeedback / SignalStream / Integrity | read-only | — | useLogs, OS diagnostics | Depend on `recognizedPatterns`, which was frozen by #1 |
| UserMetricsWidget | `recordOSSignal` | — | OS status/perf/version, `/api/cohorts`, `/api/me` | Crash fixed (#2) |
| CorrelatedIndexes / SystemPulse | — | — | OS indexes, `/api/system/pulse` | Were knocked out by #2 |
| SystemProgressWidget | 15 recorder fns | ✓ feedback | many | Now code-split (#8) |
| ArchitectWidget | — | — | — | Now code-split (shares chunk) |
| MonthlyPulseWidget | — | — | `me.joinedAt` | Revived (#5) |
| CosmicUpdate / QuantumSign / Benchmark | — | — | AI image / logs | |
| Angel / CorporatePlan / DemoDay / Subscribe | — | — | — | Static. Unguarded localStorage (1 each) |

**Totals:** 43 surfaces · 24 write QIE signals · 6 write the Log directly · 13 are pure display containers.

### Wiring to LOT® AI, System tab, Portrait

- **LOT® AI:** the AI surfaces (ContextualPrompts, ChatCatalyst, Interventions, Narrative, CosmicUpdate, Memory answer) are server-backed queries. None of them writes back to the Portrait except the Memory answers, which build `memoryStory`.
- **System tab:** every widget mounts from `System.tsx`. Paid accounts get the full stack. Free accounts get Time, Memory, Game and Subscribe only.
- **Portrait (`PublicProfile.tsx`):** consumes `memoryStory`, `psychologicalProfile.archetype` and badge level. It does **not** consume the client QIE archetype (`classifyPhysiologicalCohort`). The Portrait archetype and the System archetype are computed separately and can disagree. *Recommendation:* persist the QIE archetype into `user.metadata.physiologicalCohort`. That field already exists and the weekly job writes it, so the Portrait could read a single source.

### Wiring to QIE, Memory, Story

- Signals → `recordSignal()` → localStorage (coalesced, 250 ms) → `/api/quantum-intent/sync` → `Log(event='quantum_intent_signal', context=getLogContext())`.
- `getLogContext()` stamps each Log row with weather, city, timezone, local time, moon phase, rokuyo and zodiac. **This already does the "synchronize context and post to the Log" behaviour** for every interactive widget. **Users online is not included in the context.** It would be a one-line addition in `server/utils/logs.ts` if wanted.
- Sync trigger is `signals.length % 10 === 0` AND 5-min cooldown. It is probabilistic: light users can go a long time between syncs. *Recommendation:* also sync on `visibilitychange → hidden` (use `navigator.sendBeacon`).

---

## 3 · Military-format Log posting (proposal, not yet built)

All widget interactions already land as `quantum_intent_signal` rows with full context. To render them in the Log in military communications format, the Log renderer can format each row as:

```
DTG 241432Z NOV26 · SRC MEMORY · ACT ANSWER · WX 4°C OVC · LOC BERLIN · MOON WAX 61% · STATUS LOGGED
```

All fields already exist in `metadata` + `context`, so this is a renderer-only change in `Logs.tsx` with no new storage. It also fits the "monk / transparent lifestyle" principle: each action leaves one plain, timestamped line, and the duplicate rows fixed in #3 were breaking exactly that one-line-per-action record.

---

## 4 · 15-month UI reveal audit

| Mechanism | State |
|---|---|
| `MonthlyPulseWidget` (month counter) | Was **dead** (no `joinedAt`). Revived. Copy caps at month 12, so months 13–15 show "Month 12 / 12". |
| `$layoutDensity` (breathable → instrument) | Live. Driven by interaction level, not calendar month. |
| `$featureUnlocks` (14 gates) | **Only 2 of 14 are read anywhere** (`patternInsights`, `moodPatterns`). The other 12 (`advancedMemory`, `plannerTemplates`, `intentionHistory`, `customThemes`, `widgetArrange`, `exportData`, `narrativeReflection`, …) are computed and never applied. `advancedMemory` is read in MemoryWidget only to add the insight text. |

**Recommendation:** make a month-to-unlock table the single source of truth for the reveal. Example: M1 Time/Memory · M2 Planner · M3 Mood patterns · M4 Portrait depth · M6 Narrative · M9 Pattern insights · M12 Instrument density · M13–15 Architect / QIE cockpit. Extend `MONTH_MESSAGES` to 15. Copy and pacing are product decisions, so I left them unchanged.

---

## 5 · Loading speed

| Metric (minified, app entry) | Before | After |
|---|---|---|
| Entry `app.js` | 1213 KB | 754 KB |
| **Eager JS (entry + static chunks)** | **1357 KB** | **1174 KB** |
| On-demand chunk (SystemProgress + Architect) | — | 177 KB + 8 KB |

Remaining heaviest eager inputs: `badges.ts` 207 KB, `Logs.tsx` 120 KB, `react-dom` 127 KB, `easter-eggs.ts` 24 KB.
Next wins, in order:
1. Split badge *definitions* (static text) from badge *logic*, and lazy-load the definitions (≈ −180 KB).
2. Lazy-load `Logs.tsx` per tab (≈ −120 KB).
3. Move `About.tsx`-style changelog arrays out of components.

---

## 6 · Lag test (static + micro-benchmark)

| Probe | Result |
|---|---|
| `setInterval` without `clearInterval` in components | 0 ✓ |
| `recordSignal` hot path | O(n) copy + filter of ≤1000 signals. Persist and analysis deferred ✓ |
| `getOptimalWidget()` (5 signals, Node) | 6.9 ms. It runs inside a render `useMemo`. *Recommendation:* move it to `useEffect`, like `quantumState` beside it, so the button path never pays for the 150-pattern scan |
| Game render loop | Viewport-gated ✓ |
| Audio | 5 separate `AudioContext` singletons (sound, chime, keyboard, game, planner). Each adds output latency and a resume handshake. *Recommendation:* one shared context in `utils/sound.ts`. Planner resume fixed (#7). |
| Side effects in render | `System.tsx` writes `localStorage` (`selfcare-quantum-reason`, `intentions-quantum-reason`) inside render IIFEs. Minor; move to effects. |
| Dead code | Paid-layout `Subscribe` block can never render: paid ⇔ has subscription. Its `Math.random()` gate would flicker if it ever did. |

I could not run an in-browser lag test (click → paint timings, sound latency): this container has no DB or auth session. The numbers above come from static analysis plus Node micro-benchmarks.

---

## 7 · Widget usage data log

There is no production DB access from this run, so this report has no live usage counts. The data exists: every widget interaction is stored as `Log.event = 'quantum_intent_signal'` with `metadata.source`. The platform-wide usage query (admin):

```sql
SELECT metadata->>'source' AS widget_source,
       COUNT(*)                AS events,
       COUNT(DISTINCT "userId") AS users,
       MAX("createdAt")        AS last_seen
FROM logs
WHERE event = 'quantum_intent_signal'
  AND "createdAt" > now() - interval '30 days'
GROUP BY 1 ORDER BY 2 DESC;
```

⚠ Counts recorded before this fix are inflated by duplicate uploads (#3). Dedupe on `(userId, metadata->>'timestamp', metadata->>'signal')` when reading historical data. *Recommendation:* expose this query on the existing admin `/widget-diagnostic` route.

---

## 8 · Files changed

```
src/client/stores/intentionEngine.ts          #1 dayMs · #3 persisted watermark · #4 fresh-state write · safe localStorage init · micro_game source
src/client/components/UserMetricsWidget.tsx   #2 correct classifyPhysiologicalCohort args + field names
src/server/models/user.ts                     #5 joinedAt in profile view (only consumer: /api/me)
src/shared/types/index.ts                     #5 UserProfile.joinedAt
src/client/components/QuantumEngineWidgets.tsx #6 selfCare key
src/client/stores/plannerWidget.ts            #7 AudioContext resume
src/client/components/System.tsx              #8 React.lazy SystemProgressWidget + ArchitectWidget
src/client/queries.ts                         type: memory answer insight?
```

```
NEXT RUN WATCH-LIST
[ ] Confirm System tab renders for a paid account after deploy
[ ] QIE recognizedPatterns non-empty again (PatternRecognition / QuantumState widgets)
[ ] quantum_intent_signal row rate drops (duplicates gone)
[ ] MonthlyPulse appears for Usership accounts ≥ 1 month old
```
