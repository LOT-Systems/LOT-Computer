# LOT® Widget Health Scan: 2026-11-16

**Routine:** scheduled widget health scan (wiring · data · UI · lag)
**Branch:** `claude/charming-albattani-0q7cq3` · **Base:** `master@98971f2`
**Status:** GREEN. Client and server builds pass, the `yarn test:qie` regression test passes, and TypeScript errors went from 104 to 100 (no new ones).

---

## 0. SITREP (summary)

| # | Severity | Finding | Status |
|---|---|---|---|
| 1 | **CRITICAL** | `analyzeIntentions()` threw `ReferenceError: dayMs is not defined` (pattern P147) every time it ran with at least one signal. This has been true since QIE v112 (`1846b80`, 2026-08-03). Pattern recognition never finished, `lastAnalysis` never advanced, and every caller (System tab mount, the QOS monitor, `getOptimalWidget`, SystemProgress mount) re-ran the full scan and threw again. | **FIXED** |
| 2 | HIGH | QuantumRandomWidget recorded a `calculator/quantum_random` QIE signal on every countdown from both counters. That was about 320 signals/hour, ungated by tab visibility, and it filled the 1000-slot signal buffer in about 3 hours. Real user signals (mood, memory, planner…) were evicted, and Memory, Story and pattern input were polluted. | **FIXED** |
| 3 | HIGH | `syncToServer()` race: after `await fetch` it wrote back the **pre-await snapshot**, so signals recorded during the POST were deleted. It also set the watermark to `now`, so anything newer than the sent batch was marked synced without being sent. | **FIXED** |
| 4 | MEDIUM | 6 widgets wrote to the shared `intentionEngine` atom **during render** (React "cannot update a component while rendering a different component"; duplicate writes under concurrent render). | **FIXED** |
| 5 | MEDIUM | Load speed: 154 KB of static `SESSION_REPORTS` text shipped in the eager `app.js`. | **FIXED** (lazy chunk) |
| 6 | LOW | 3 session-log entries (v112, v113, wiki-v87) used `title:` instead of `session:`, so their headers rendered blank in System Progress → Session logs. | **FIXED** |
| 7 | LOW | 5 separate `AudioContext`s (sound.ts, sovietChime, sovietGameSounds, sovietKeyboard, plannerWidget). | Open (recommendation) |
| 8 | LOW | 2 orphan components (`JournalReflection`, `AwarenessDashboard`) are never mounted. | Open (decide: wire or delete) |
| 9 | INFO | 100 pre-existing TypeScript errors (36 in `badges.ts`). esbuild doesn't typecheck, so these never block a build. The `dayMs` bug was one of them. | Open |

---

## 1. Fixes applied (this push)

### 1.1 QIE pattern engine: undefined `dayMs` (CRITICAL)
`src/client/stores/intentionEngine.ts` (P147 Quantum Presence Field)
```diff
- const daySignals147 = signals.filter(s => now - s.timestamp < dayMs)
+ const p147DayMs = 24 * 60 * 60 * 1000
+ const daySignals147 = signals.filter(s => now - s.timestamp < p147DayMs)
```
`dayMs` exists only inside `computeUserIndex()`, not in `analyzeIntentions()`. Reproduced in Node before the fix: `THROW ReferenceError dayMs is not defined`. After the fix it returns 16 patterns on a 40-signal fixture.

**Downstream impact while it was broken (≈105 days):** `recognizedPatterns` stayed frozen, `userState` and `userIndex` were not refreshed by analysis, and widget suggestions (`getOptimalWidget`) failed. Memory and Story context built from QIE patterns was stale.

### 1.2 QuantumRandomWidget: signal flood (HIGH)
`src/client/components/QuantumRandomWidget.tsx`
- Ticks pause when `document.hidden` or when the System tab is not active (same off-tab rule as SystemPulse and SystemProgress).
- One `quantum_random` signal per 60 s at most, shared across both counters. That caps it at ≤60/h, and only while the user is viewing.
- The side effect moved out of the `setState` updater, which StrictMode double-invokes.

Average countdown is (1+2+3+5+7+10+15+20+30+45+60+72)/12 = 22.5 s, with 2 counters → ~320 signals/h before the fix.

### 1.3 `syncToServer()` race (HIGH)
After the POST it now re-reads the store (`intentionEngine.get()`), and the watermark is the newest **sent** signal timestamp. Signals recorded mid-flight stay unsynced and go out on the next sync.

### 1.4 Render-phase store writes (MEDIUM)
`recordSignal()` moved into `useEffect` (still once per mount, ref-guarded) in:
`ChakraErgonomicsWidget`, `CohortConnectWidget`, `MicroImageWidget`, `EnergyCapacitor`, `GoalJourneyWidget`, `InterventionsWidget`.
In the last three, the effect is declared **above** the `isLoading` / `!data` early returns, so hook order stays stable.

### 1.5 Load speed: SESSION_REPORTS lazy chunk (MEDIUM)
- `SESSION_REPORTS` moved to `src/client/components/systemProgressSessionReports.ts`. **Future assembly runs: append new session entries in that file.** A pointer comment is left in `SystemProgressWidget.tsx`.
- It loads on `requestIdleCallback` (5 s timeout), or right away when "Session logs" is opened. While loading it shows `Loading…`.

| Bundle (prod, minified) | Before | After | Δ |
|---|---|---|---|
| `app.js` raw | 730,292 B | 581,210 B | **−20.4%** |
| `app.js` gzip | 184,773 B | 142,758 B | **−22.7%** |
| new lazy chunk | — | 149,799 B | off critical path |

Headless Chromium (4× CPU throttle, localhost, 7 runs, median load event): 274 ms before, 280 ms after. That is within noise, so local parse time didn't change measurably. The gain is transfer on slow or mobile networks.

### 1.6 Session log data (LOW)
`title:` changed to `session:` on 3 entries. `SessionReport` type now has optional `version`.

### 1.7 Regression test (new)
`yarn test:qie` → `scripts/tests/test-qie-health.ts`
```
PASS  analyzeIntentions() completes — 16 patterns
PASS  in-flight signal kept in buffer
PASS  in-flight signal still unsynced
ALL GREEN
```
Against the pre-fix store, all 3 fail. Run this test on every future scan.

---

## 2. Widget inventory and wiring matrix

The System tab mounts **43 widget components** under **25 `WidgetErrorBoundary`** groups. `sig` is the QIE signal source the widget writes. `Log` means it posts to `/api/logs` (`useCreateLog`). `AI/Mem` means it calls an AI, Memory or Narrative endpoint.

| Widget | QIE sig | Log | AI / Memory / Story | Data hooks | Type |
|---|---|---|---|---|---|
| MemoryWidget | – | – | **Memory** | queryClient | container |
| NarrativeWidget | journal | – | **Story/Narrative** | useNarrative | display |
| EvolutionWidget | – | – | **Narrative** | useLogs, useNarrative | display |
| ChatCatalystWidget | journal | – | **AI** | useChatCatalysts | interactive |
| AIFeedbackWidget | – | – | – | useLogs, useOSDiagnostics, useProfile | interactive |
| PlannerWidget | planner | ✅ | – | — | container |
| SelfCareMoments | selfcare | ✅ | – | useLogs, useProfile | container |
| CalendarWidget | – | ✅ | – | useLogs | container |
| RecipeWidget | selfcare | ✅ | – | useLogs | interactive |
| IntentionsWidget | intentions | – | – | localStorage | container |
| QuantumEngineWidgets | intentions | – | – | useEnergy | display |
| PatternInsightsWidget | intentions/memory/mood | – | – | usePatterns, useCohorts | display |
| PatternRecognitionWidget | – | – | – | useLogs | display |
| QuantumStateWidget | – | – | – | useLogs | display |
| QuantumSignWidget | – | – | – | useLogs | display |
| QuantumRandomWidget | calculator | – | – | — | display |
| MicroCalculatorWidget | calculator | – | – | — | interactive |
| MicroGameWidget | micro_game | – | – | — | interactive + sound |
| MicroImageWidget | intentions | – | – | usePunctuationContext | display |
| ChakraErgonomicsWidget | selfcare | – | – | store | display |
| EnergyCapacitor | selfcare | – | – | useEnergy | display |
| EmotionalCheckIn | mood | – | – | useLogs | container |
| InterventionsWidget | mood | – | – | useInterventions | display |
| CohortConnectWidget | mood | – | – | useCohorts, useEnergy, useProfile | display |
| ContextualPromptsWidget | mood | – | – | log context | display |
| GoalJourneyWidget | intentions | – | – | useGoalProgression | display |
| CorrelatedIndexesWidget | – | – | – | useOSIndexes | display |
| UserMetricsWidget | – | – | – | useOSPerformance/Status/Version | display |
| SystemProgressWidget | – | – | – | useEnergy, useLogs (33 net calls) | display |
| SystemPulseWidget | – | – | – | 10 s poll | display |
| CosmicUpdateWidget | – | – | – | useCosmicUpdate | display + sound |
| TimeWidget | – | – | – | 1 s tick (chime) | display + sound |
| IntegrityWidget, BenchmarkWidget, MoodAnalytics | – | – | – | useLogs | display |
| MonthlyPulse, DemoDay, AngelInvestor, CorporatePlan, Subscribe, Architect, InterfaceEvolution, SignalStream | – | – | – | static / localStorage | display |
| *JournalReflection* (orphan) | journal | – | – | — | **not mounted** |
| *AwarenessDashboard* (orphan) | mood | – | – | useProfile | **not mounted** |

**Wiring gaps**
- **Log:** only 4 of 43 widgets post to the Log. Interactive widgets (Intentions, MicroCalculator, MicroGame, ChatCatalyst, EmotionalCheckIn) write QIE signals but leave no Log entry. That is the main gap against "every interactive action posts to the Log".
- **Portrait (public profile):** only `memoryStory` is exposed (`PublicProfile.tsx:357`, behind `privacySettings.showMemoryStory`). No widget state reaches the Portrait directly.
- **Signal source typing:** `micro_game` and `ecosystem` are not in the `IntentionSignal['source']` union, which accounts for several of the TS errors. QuantumRandom uses the `calculator` source, so random-number noise is mixed with real calculator use. Recommendation: give it its own `ambient` source.

---

## 3. Lag audit (buttons · sounds · controls · loading)

| Area | Observation | Verdict |
|---|---|---|
| Intervals | ChakraErgonomics (2 min), ContextualPrompts (15 s), SystemPulse (10 s), SystemProgress (60 s) and MicroGame already pause when off-tab or hidden. **QuantumRandom (3 × 1 s) did not.** Now fixed. | ✅ |
| `System.tsx` astrology tick (15 min) | Pauses on `document.hidden` but not on other in-app tabs | minor |
| TimeWidget | 1 s `checkHour` with no setState (ref only) | ✅ cheap |
| `recordSignal` hot path | Persist and analysis already deferred (`schedulePersist`, `deferHeavy`) | ✅ |
| Analysis cost | Before fix #1, every call re-ran the full 150-pattern scan (the cooldown never armed). Now the 5 min cooldown works, which removes repeated heavy work on each `logs` change. | ✅ big win |
| Sounds | 5 separate `AudioContext` singletons, created lazily. The first press per context pays create + `resume()` latency. Recommendation: one shared context in `utils/audio.ts`. | open |
| Error isolation | 25 boundaries cover all 43 widgets | ✅ |
| Live in-browser lag test | Not run: needs a seeded DB and an authenticated session. Bundle load was measured headless instead (§1.5). | gap |

---

## 4. 15-month reveal (Digital UX build-up)

**Current state:** the code has **no month gate**. All 43 widgets mount on day 1, with visibility depending only on data (`isLoading` / `!data`) and tags. `daysSinceStart` is computed in `System.tsx:250` (from the first Memory answer) but only displayed.

**Proposed reveal map** (gated on `daysSinceStart`, so 1 month ≈ 30 days). This is a proposal and has not been implemented. It is a product decision.

| Month | Reveal | Rationale |
|---|---|---|
| M1 | Time, Weather/Context, Memory, Emotional Check-in, Planner | Base routine: observe, record, plan |
| M2 | SelfCare Moments, Recipe, Calendar | Body and day structure |
| M3 | Intentions, Narrative (Story) | First 60 days of Memory feed the Story |
| M4 | Energy Capacitor, Chakra Ergonomics | Needs 3+ months of mood/selfcare signal |
| M5 | Pattern Insights, Mood Analytics | Patterns need volume |
| M6 | Goal Journey, Interventions | Half-year review |
| M7 | Cohort Connect, Chat Catalyst | Social layer after self layer |
| M8 | Quantum State / Sign / Engine | QIE output once the signal base is stable |
| M9 | Pattern Recognition, Evolution | Long-horizon |
| M10 | Correlated Indexes, Integrity | 4-D weekly indexes |
| M11 | Micro Image, Micro Game, Calculator, Quantum Random | Play layer |
| M12 | Monthly Pulse, Benchmark | Year close |
| M13 | System Pulse, User Metrics | Operator telemetry |
| M14 | System Progress, Architect, Interface Evolution | Build transparency |
| M15 | Corporate / Angel / Demo Day / Subscribe | Full system |

Gating would also make cold loads faster: each locked widget could be `React.lazy` and never fetched until its month opens.

---

## 5. Military log protocol and monk lifestyle

The aim is a pure, transparent record: every interactive widget action becomes one terse, timestamped Log line with its synchronized context. That goes together with *no noise signals*. Fix #2 removes about 320 synthetic signals/hour that were posing as user behavior.

Proposed line format (proposal, not implemented):
```
[1432Z] SITREP · WX +12°C CLR · ONLINE 07 · UNIT planner · ACT set "Deep work" · QIE focus/0.82
```
- Context fields (`WX` weather, `ONLINE` users online from SystemPulse, `Z` time) come from state the System tab already holds.
- One helper (`postWidgetSitrep(unit, act, payload)`) wrapping `useCreateLog`, called from the 5 interactive widgets that don't log yet (§2).
- Transparency: show the user their own QIE signal ledger (source · signal · time) in Settings. The data is already in `intentionEngine.signals`.

---

## 6. Widget usage data log (platform-wide)

**Not collected this run.** Platform-wide usage lives server-side (rows synced through `POST /api/quantum-intent/sync`), and this routine has no production DB access. The static source map in §2 is the instrumentation baseline. To produce real usage counts in future runs, either:
1. Add an admin endpoint `GET /api/admin/widget-usage?days=30` that aggregates synced signals by `source/signal`, or
2. Give the routine read-only DB credentials.

**Caveat for any historical analysis:** signals synced between 2026-06-29 (`1f58084`) and 2026-11-16 are inflated by `calculator/quantum_random` (fix #2) and may be missing in-flight signals (fix #3). Exclude `signal = 'quantum_random'` before drawing conclusions.

---

## 7. Verification log

```
yarn client:js:build            → Client build completed (2 pre-existing duplicate-key warnings in badges.ts)
yarn server:build               → EXIT 0
npx tsc --noEmit                → 100 errors (baseline 104; 0 introduced)
yarn test:qie                   → 3/3 PASS (3/3 FAIL on pre-fix code)
headless load (4× CPU, n=7)     → 274 ms → 280 ms median (noise)
```

## 8. Next scan checklist
- [ ] `yarn test:qie` green
- [ ] Wire `postWidgetSitrep` into the 5 non-logging interactive widgets
- [ ] Consolidate AudioContexts
- [ ] Decide: mount or delete `JournalReflection` / `AwarenessDashboard`
- [ ] Add `micro_game`, `ecosystem` and `ambient` to the signal source union
- [ ] Get usage data access (§6)
- [ ] Pay down `badges.ts` TS errors (36)
