# LOT® WIDGET HEALTH REPORT — 2026-10-04

**Scope:** widget wiring, data storage, LOT® AI / System / Portrait wiring, QIE / Memory / Story wiring, 15-month reveal, load speed, lag, usage log.
**Method:** static analysis (3 parallel audits) plus `tsc --noEmit`. No browser, profiler or bundle run: `dist/client` is absent and no widget was exercised live.
**Branch:** `claude/charming-albattani-6fb48w`

## 1. BLUF

| Area | Status | Note |
|---|---|---|
| Wiring (System tab) | AMBER | About 55 widgets mounted. Two are orphaned, `shouldShowWidget` is dead, and two widgets had no error boundary. |
| Portrait / Settings | AMBER | Only 4 widgets, none behind an error boundary. |
| LOT® AI chat | GAP | No widget talks to chat directly. Widgets reach AI only through the Memory pipeline and the QIE sync. |
| QIE / Memory / Story | GREEN | Most widgets emit `recordSignal`. Sync goes via `POST /api/quantum-intent/sync`. All client endpoints resolve to server routes. |
| Type health | RED → AMBER | 104 type errors found, 99 after this push. Several were live runtime bugs (section 3). |
| 15-month reveal | GAP | No month-based gating exists. Gating is by achievement and level, and 8 of 14 flags gate nothing. |
| Load speed | RED | No code splitting. All widgets load eagerly. |
| Lag | AMBER | The System component re-renders at 10 Hz from the breathe timer, plus several ungated timers. |
| Widget usage log | GAP | No widget-usage tracking exists. Only the `logs` table records anything. |

## 2. Fixed in this push

| # | File | Defect | Fix |
|---|---|---|---|
| F1 | `stores/intentionEngine.ts:3332` | `dayMs` was never defined. Pattern 147 (Quantum Presence Field) threw a ReferenceError whenever P142 and P137 were both active. That aborted `analyzeIntentions()` for the rest of the pass. | Inlined `24*60*60*1000`. |
| F2 | `UserMetricsWidget.tsx:98` | `classifyPhysiologicalCohort()` was called with no arguments. It threw on `signals.filter`, so the whole Dashboard widget was dead behind its boundary. | Pass `signals`, `getUserState()` and `recognizedPatterns`, as the other 5 call sites do. |
| F3 | `UserMetricsWidget.tsx:259,269` | Read `.label` and `.dominant`, which don't exist on the result type. The Archetype fallback and the Dominant row rendered blank. | Use `.archetype` and `.dominantModule`. |
| F4 | `QuantumEngineWidgets.tsx:472` | `dimensions.selfcare` is the wrong case, so the CARE index always showed empty. | Use `selfCare`. |
| F5 | `System.tsx:443,616` | `TimeWidget` and `QuantumRandomWidget` had no `WidgetErrorBoundary`. A throw there would blank the whole System tab. | Wrapped both. |

Typecheck went from 104 to 99 errors. I did not run the app, so F1–F4 are verified only by the compiler and by reading the code.

## 3. Open defects the typechecker found

Not fixed here. Each needs a decision about intent.

| Sev | Where | Issue |
|---|---|---|
| HIGH | `MonthlyPulseWidget.tsx:74` | `user.joinedAt` is not on the client `UserProfile` type. If `/me` doesn't return it, `monthNumber` is always 0 and the monthly pulse never fires. Needs a check of the `/me` payload. |
| HIGH | `MicroGameWidget.tsx:779` and `intentionEngine.ts:791,1017,1054,2303,2328,4075,5004,5785` | Signal sources (`micro_game`, `ecosystem`, and others) are missing from the `IntentionSignal['source']` union. Types lie, and per-source pattern logic may skip these sources. |
| MED | `intentionEngine.ts:2223,2240` | `suggestedTiming: 'active'` is not a valid value (`immediate`, `soon`, `next-session` or `passive`). Consumers may ignore the suggestion. |
| MED | `MemoryWidget.tsx:65` | `onSuccess` destructures `insight`, but the mutation type returns only `{response}`. The insight is probably never shown. |
| MED | `app.tsx:255,277` | `metadata` is read from `UserProfile`, which lacks it. |
| MED | `PublicProfile.tsx:369-448` | `version`, `streak` and `patternStrengthIndex` are missing from the response type. |
| LOW | `badges.ts` (36 errors, plus the duplicate key at 6883) | Badge `type` values outside the `BadgeType` union. The duplicate object key means one badge definition is silently overwritten. |
| LOW | `Logs.tsx:99,103,3782,3849`, `AdminUser*.tsx`, `GoalJourneyWidget.tsx:94-103`, `Sync.tsx`, `System.tsx:624` | Null-safety and implicit `any`. `weather.humidity` is possibly null at `System.tsx:624`. |

## 4. Wiring map

### 4.1 Where widgets mount
- **System tab (`System.tsx`):** about 55 widgets. Non-paid users get a short stack (Memory, Game, Subscribe, MonthlyPulse, Recipe, Pulse, Time, QuantumRandom). Usership and R&D users get the full stack.
- **Portrait (`Settings.tsx`):** `GrowthMilestones`, `BadgeUnlockFeed`, `InvestmentSwitch`, `ProfileQRCode`. No error boundary around any of them.
- **Orphans (never imported):** `JournalReflection.tsx`, `AwarenessDashboard.tsx`.
- **Dead export:** `shouldShowWidget`. `System.tsx` imports it but never calls it. `getOptimalWidget()` drives only SelfCare and Intentions.
- **Duplicates:** `MemoryWidget`, `MicroGameWidget` and `SubscribeWidget` each mount twice. These are separate layouts, except Subscribe, whose first copy is ungated.
- **Shared boundaries:** the Biofield stack has 5 widgets under one boundary and the Investor stack has 4. One throw blanks the whole stack.

### 4.2 Widget roles
- **Containers (they store data):** Planner (`plan_set`), Calendar (`calendar_entry`), Intentions, Memory, EmotionalCheckIn, SelfCare (`self_care_*`), Recipe.
- **Interactive:** Time, Calculator, Game, Subscribe, CohortConnect, CosmicUpdate, Architect, ChatCatalyst, ContextualPrompts, QuantumSign.
- **Display only:** about 30, mostly the Biofield, Dashboard and Stats stacks.

### 4.3 LOT® AI, System and Portrait
- No widget calls LOT® AI chat directly. The only "LOT AI" text in widgets is a label in `EmotionalCheckIn.tsx`.
- AI context flows in two ways. The Memory widget uses `/api/memory*`, which feeds `question-generator`. The QIE client engine syncs to the server via `/api/quantum-intent/sync`.
- Portrait (Settings and PublicProfile) shows only growth and badge stats. It doesn't show the widget-derived archetype, index or cohort. The data exists (`getUserIndex`, `classifyPhysiologicalCohort`), so that is a wiring gap.

### 4.4 QIE, Memory and Story
- Widgets without any engine signal: Time, Subscribe, MonthlyPulse, Evolution, InterfaceEvolution, CosmicUpdate, QuantumSign, FlashDrive, the Investor stack, CorrelatedIndexes, Stats stack.
- Widgets that write to the Log: Recipe, ContextualPrompts (raw `axios.post`, with no cache invalidation and only skips logged), SelfCare, Planner, Calendar, EmotionalCheckIn (server-side).
- Rule from `LOT-DOCTRINE.md`: a new log event needs an explicit `formatLog()` case in memory question generation, or the Memory engine silently drops it.

### 4.5 Storage hygiene
- `localStorage` is used without try/catch in: `System.tsx` render path (884-911, 871, 928), the Investor widgets, `InvestmentSwitch`, `SelfCareMoments`, `IntentionsWidget`, `QuantumSignWidget` click handlers, `EvolutionMilestoneToast` and `SubscribeWidget`. Private-mode Safari or blocked storage will throw. Boundaries don't catch event-handler throws.
- `SystemPulseWidget`, `SystemProgressWidget` (6 calls), `UserMetricsWidget` and `QuantumEngineWidgets` use raw `fetch`, bypassing the shared axios config in `queries.ts`.

## 5. 15-month reveal

There is no month-based gating anywhere. `interfaceEvolution.ts` unlocks features by level and achievement. Account age is never read. The month labels below are an estimate by the audit. The code defines none.

| Stage | What reveals today |
|---|---|
| M1 | Breathable density, badge selection, custom themes (L5) |
| ~M2–3 | widgetArrange (L10), chapter 2, advancedMemory, plannerTemplates, comfortable density |
| ~M4–6 | intentionHistory (L15), moodPatterns, exportData (L25) |
| ~M7–10 | narrativeReflection (L30), patternInsights, chapter 3, compact density |
| ~M11–15 | socialMentions, privateSpaces, dense density, instrument density, chapter 4 (L60) |

Findings:
1. 8 of 14 flags are computed but gate nothing: plannerTemplates, communityRich, achievementGallery, customThemes, badgeSelection, widgetArrange, exportData, privateSpaces.
2. About 35 mounted widgets have no evolution gate, so a day-1 Usership user sees the full stack.
3. Random and time-based gates (Subscribe `Math.random() < 0.2`, SelfCare time slots) are not progression.
4. Density behaviour is not documented in `INTERFACE_EVOLUTION.md`.
5. There is no "monk lifestyle" text in the doctrine or lexicon. The closest existing pieces are the "Care" dimension, bioethics metrics (Cleanness, Routine, Nutrition, Laughter), COCKPIT-RULE logs (instrument readings only) and visible unlock lists.

## 6. Speed and lag

Earlier perf passes show in the code. Most timers are already gated on `document.hidden` or route, and the System tab unmounts when inactive.

| Sev | Finding | Fix |
|---|---|---|
| HIGH | No `React.lazy` anywhere. `System.tsx` statically imports about 55 widgets (including the 2,513-line SystemProgress and the 6,503-line `intentionEngine`), and `app.tsx` imports all routes eagerly. | Lazy-load below-the-fold widgets and routes. Extend `LazyMount` so it does the `import()` on entering the viewport. |
| HIGH | Only one widget (QuantumEngineWidgets) is viewport-gated. About 20 others mount at once and run their own fetches and intervals. SystemProgress runs three heavy computations on mount. | Wrap them in `LazyMount`. Defer the mount-time work with `requestIdleCallback`. |
| HIGH | `build.config.ts:7` targets `chrome58/safari11`. That bloats the bundle, and it contradicts the ESM `splitting` output. | Target `es2020` or `chrome87/safari14/firefox78`. |
| MED | `breathe.ts:112` runs `setInterval(…,100)` with `setState`, so the whole System component re-renders 10 times a second. | Move the breathe indicator into its own memo component, or write to the DOM via a ref. Skip `setState` when the value is unchanged and pause when hidden. |
| MED | Ungated timers: TimeWidget (1 s), QuantumRandom (two 1 s intervals), MicroCalculator (10 s), `recipeWidget.ts` (5 min, never cleared), `radio.ts` countdown. | A shared `useVisibleInterval` hook. |
| MED | MicroGame loop uses sticky `useInViewport` (never turns false once true). | Use `useActiveViewport`. |
| MED | The TimeWidget stopwatch re-renders on every animation frame. | Update the text via a ref, or throttle. |
| MED | Stat queries poll every 2 min and SystemPulse every 10 s, regardless of viewport. | Add `enabled: inViewport`. Use SSE or 30 s for Pulse. |
| MED | No bundle metafile. Images are inlined as `dataurl`. The service worker is network-first for JS and CSS, and bundle URLs are unhashed. | Emit hashed names, use stale-while-revalidate, and add `analyzeMetafile`. |
| LOW | `will-change: opacity` on every grid-fill button. `PrimaryBtn` uses `transition-all`. | Apply `will-change` on `:hover` only. Use `transition-colors`. |
| LOW | Three `AudioContext`s (Tone, planner, chime), a recursive-`setTimeout` click loop that doesn't pause when hidden, and 38 `console.log` calls in the client. | Share one context with `latencyHint:'interactive'`. Strip logs in production. |

**Lag test status:** not executed. Buttons, sounds, controls and loading need a real browser run. Suggested harness: Playwright (Chromium is in the environment) with `performance.now()` around clicks, the `__LOT_WIDGET_PERF__` mount timings that `WidgetErrorBoundary` already records, and a Lighthouse pass on `/system`.

## 7. Widget usage log and military-style context sync

**Usage log: does not exist.** The only record is the `logs` table (`event`, `metadata` and `context` JSONB), written by `POST /logs`, which requires non-empty `text`, so a pure impression event is rejected. `useLogContext.ts` counts widget diversity from only 6 hard-coded events. Widgets with no emission at all include Time, QuantumRandom, Calculator, Game, CosmicUpdate, QuantumSign, FlashDrive, the Investor stack, SignalStream, Integrity, SystemPulse, Benchmark, MonthlyPulse, Evolution and the Stats stack.

**Proposed design (not built):**
1. A single `trackWidget(name, kind)` helper with `impression | open | interact | dismiss`, batched client-side, with a dedupe and rate limit.
2. Hook it into `WidgetErrorBoundary` and `useInViewport`, so every mount is covered without editing 55 files.
3. A widget registry (`name → minMonths → evolution flag → log event`). The same registry drives the 15-month gating.
4. Allow text-less events through a new endpoint such as `POST /logs/widget-usage`.
5. Retention policy.

**Military-style sync (SITREP):** the pieces exist. `getLogContext()` provides weather, date, moon and zodiac. The SSE `users_online` and `users_total` events provide presence. Logs already use "label: key-value" blocks (COCKPIT-RULE). Missing:
- a single composer that emits a `sitrep` event (context plus users online plus evolution stage plus today's widget events);
- a Logs.tsx renderer labelled `SITREP:`;
- a real-UTC stamp. `Logs.tsx:129` appends a literal `Z` to local time, so it is not actually Zulu.

I recommend it as an explicit, user-triggered action (a `/sitrep` command). I do not recommend an automatic post. That fits the transparent, monk-like intent without silently writing to a user's journal.

## 8. Recommended order

1. Decide the `joinedAt` and `IntentionSignal['source']` type gaps (section 3, HIGH).
2. Isolate the breathe re-render and raise the esbuild target (cheap, high payoff).
3. Add `LazyMount` and `React.lazy` for the heavy widgets.
4. Add the widget registry, `trackWidget` and the month gate.
5. Add `/sitrep` and the true-UTC stamp.
6. Run a browser lag test, then re-baseline this report.

## 9. Limits of this report

- Static analysis only. No runtime, bundle size, FPS or audio-latency numbers.
- Client types were checked by the compiler, but client and server response shapes were not diffed.
- The 15-month stage mapping is an estimate.
- The "no emission" widget list was inferred from the absence of log calls, not checked file by file.
