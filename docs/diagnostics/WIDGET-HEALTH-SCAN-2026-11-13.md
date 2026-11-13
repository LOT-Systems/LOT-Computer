# LOT® Widget Health Scan — 2026-11-13

**Type:** scheduled routine (Digital UX routine job) · **Branch:** `claude/charming-albattani-1w2fs9` · **Base:** `98971f2` (master, PR #96)
**Scope:** wiring, data storage, testing, LOT® AI / System / Portrait wiring, QIE / Memory / Story wiring, Log sync, 15-month reveal, load speed, lag, usage data log.

---

## 0 · SITREP (bottom line up front)

| # | Status | Item |
|---|---|---|
| 1 | **FIXED** | `QuantumRandomWidget` was flooding the QIE signal bus. It sent **313 signals/hr** into a bus capped at 1,000, so an open tab pushed the user's real journal/mood/self-care history out of the 7-day window in about 3 h. Every signal also re-rendered the 7 widgets that subscribe to the whole `intentionEngine` store. It now sends **4/hr**, and **0/hr** with the tab hidden. |
| 2 | **FIXED** | The `QuantumRandomWidget` counters kept ticking in hidden tabs: **7,367 renders/hr → 1** after the fix. |
| 3 | **FIXED** | The Subscribe widget flickered. Its 20% roll ran again on every System re-render (each `usersOnline`, `liveMessage` or weather push). It now rolls once per mount. |
| 4 | **FIXED** | The Intentions widget vanished right after it appeared. Its cooldown gate wrote `intentions-last-shown` during render, and the next re-render read that value back as "cooldown not passed". The gate is now decided once per mount and written in an effect. |
| 5 | **FIXED** | The Biofield Engine stack (5 store subscribers) and the Stats stack (7 API queries) mounted below the fold on first paint. Both now sit inside `LazyMount`. |
| 6 | OPEN · HIGH | **No widget code-splitting.** The app's critical path is **1.42 MB raw / 381 KB gzip** across 12 files, with **0 dynamic imports** from `app.js`. All 39 `*Widget.tsx` files are imported statically into `System.tsx`. |
| 7 | OPEN · MED | Widgets fetch raw, outside the react-query cache. `UserMetricsWidget` calls `/api/me` and `/api/cohorts`, and `QuantumEngineWidgets` calls `/api/user-profile`. `useProfile` and the cohort hooks already exist in `queries.ts` (lines 70, 314, 362), so these are duplicate requests on every mount. |
| 8 | OPEN · MED | The client creates **5 separate `AudioContext`s**: `sound.ts`, `sovietChime.ts`, `sovietKeyboard.ts`, `sovietGameSounds.ts` and `stores/plannerWidget.ts`. Chrome warns at about 6. Each context adds a resume delay on the first gesture, so the first click sound plays late. |
| 9 | OPEN · MED | **There is no platform-wide widget usage log.** QIE signals live only in each device's `localStorage` and are kept for 7 days. Only 6 widget surfaces write server Log entries. |
| 10 | OPEN · LOW | 104 pre-existing `tsc --noEmit` errors (36 in `badges.ts`). The build is still green. There are 2 duplicate keys in `badges.ts` (`elixir_found` at :4825/:6883, and :5501). |
| 11 | OPEN · DESIGN | **The 15-month reveal is not enforced.** A paid user sees about 45 widget components on day 1, and only 8 components check progression. A proposed M1–M15 map is in §6. |

**Build:** `NODE_ENV=production` client build ✅ green before and after. **tsc:** 104 errors before and after (no new errors).

---

## 1 · Widget inventory and wiring

All 39 `*Widget.tsx` components are mounted from **one parent**: `src/client/components/System.tsx`. `SystemProgressWidget` is also imported by `ArchitectWidget`. No widget is orphaned.

**Free tier** gets the essentials plus `Memory`, `MicroGame` and `Subscribe`.
**Paid tier (Usership / R&D)** gets about 45 components in 13 error-boundary groups.

| Boundary group | Members | Risk |
|---|---|---|
| Context | ContextualPrompts, ChatCatalyst, Interventions | 1 crash hides 3 |
| Bioethics | EnergyCapacitor, ChakraErgonomics, Narrative, GoalJourney, Evolution, InterfaceEvolution, MilestoneToast | 1 crash hides 7 |
| Community | PatternInsights, MoodAnalytics, CohortConnect | 1 crash hides 3 |
| Planning | Planner, Memory, MicroCalculator, MicroGame, MicroImage | **1 crash hides Memory** |
| Investor | AngelInvestor, CorporatePlan, DemoDay, FourDimensionalUI | — |
| Quantum Engine Connect | QuantumEngineWidgets (LazyMount ✓) | — |
| Biofield Engine | QuantumState, PatternRecognition, AIFeedback, SignalStream, Integrity (**LazyMount ✓ new**) | 1 crash hides 5 |
| Dashboard | UserMetrics, CorrelatedIndexes, SystemProgress, SystemPulse | 1 crash hides 4 |
| Stats | IntentionPatterns, CollectiveConsciousness, WellnessPulse, MemoryEngineStats, GrowthMilestones, BadgeUnlockFeed (**LazyMount ✓ new**) | — |
| Single | MonthlyPulse, Recipe, Pulse, Check-in, Self-care, Intentions, Subscribe, Cosmic Update, Quantum Sign, Flash Drive, Architect, Calendar, Benchmark | ✓ isolated |

**Recommendation:** give `MemoryWidget` its own `WidgetErrorBoundary`. Memory is the primary data-entry path into Story, and right now a game or calculator crash takes it down too.

### Per-widget wiring matrix (static scan)

Counts are grep hits per file. **QIE** = `intentionEngine` / `record*Signal` references. **Log** = server `createLog` / `POST /api/logs`.

| Widget | LOC | Timers | Net | localStorage | QIE | Story refs | Log | Sound | Role |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| AIFeedback | 311 | 0 | 0 | 0 | 2 | 0 | – | – | display |
| AngelInvestor | 127 | 0 | 0 | 1 | 0 | 0 | – | – | display |
| Architect | 295 | 0 | 0 | 0 | 2 | 2 | – | – | display |
| Benchmark | 122 | 0 | 0 | 0 | 1 | 0 | – | – | display |
| Calendar | 281 | 0 | 2 | 0 | 2 | 0 | ✓ | – | **container** |
| ChakraErgonomics | 190 | 1 | 0 | 0 | 2 | 0 | – | – | interactive |
| ChatCatalyst | 123 | 0 | 0 | 0 | 2 | 3 | – | – | interactive |
| CohortConnect | 304 | 0 | 0 | 0 | 5 | 0 | – | – | interactive |
| ContextualPrompts | 289 | 1 | 1 | 0 | 3 | 1 | ✓ | – | **container** |
| CorporatePlan | 100 | 0 | 0 | 1 | 0 | 0 | – | – | display |
| CorrelatedIndexes | 159 | 0 | 0 | 0 | 0 | 1 | – | – | display |
| CosmicUpdate | 250 | 0 | 0 | 0 | 0 | 0 | – | ✓ | interactive |
| DemoDay | 114 | 0 | 0 | 1 | 0 | 0 | – | ✓ | display |
| Evolution | 211 | 0 | 0 | 0 | 0 | 5 | – | – | display |
| GoalJourney | 143 | 0 | 0 | 0 | 2 | 11 | – | – | display |
| Integrity | 476 | 0 | 0 | 0 | 4 | 0 | – | – | display |
| Intentions | 296 | 0 | 0 | 6 | 2 | 2 | – | – | **container** (local only) |
| InterfaceEvolution | 185 | 0 | 0 | 0 | 0 | 2 | – | – | display |
| Interventions | 97 | 0 | 0 | 0 | 2 | 3 | – | – | interactive |
| Memory | 400 | 13 | 3 | 4 | 3 | 1 | via `/api/memory` | – | **container** |
| MicroCalculator | 208 | 2 | 0 | 0 | 3 | 0 | – | – | interactive |
| MicroGame | 988 | 1 | 0 | 0 | 2 | 0 | – | ✓✓ | interactive |
| MicroImage | 311 | 0 | 0 | 0 | 3 | 0 | – | – | interactive |
| MonthlyPulse | 142 | 3 | 0 | 3 | 0 | 0 | – | – | display |
| Narrative | 219 | 0 | 0 | 0 | 2 | 33 | – | – | **Story display** |
| PatternInsights | 226 | 0 | 0 | 0 | 4 | 0 | – | – | display |
| PatternRecognition | 561 | 0 | 0 | 1 | 5 | 13 | – | – | display |
| Planner | 300 | 3 | 0 | 0 | 2 | 2 | ✓ | ✓ | **container** |
| QuantumEngineWidgets | 651 | 0 | 1 | 2 | 11 | 5 | – | – | display |
| QuantumRandom | 81 | 2 | 0 | 0 | 2 | 0 | – | – | ambient (**fixed**) |
| QuantumSign | 165 | 0 | 0 | 4 | 0 | 0 | – | – | interactive |
| QuantumState | 244 | 0 | 0 | 0 | 2 | 5 | – | – | display |
| Recipe | 345 | 4 | 0 | 0 | 2 | 0 | ✓ | – | **container** |
| SignalStream | 145 | 1 | 1 | 0 | 3 | 0 | – | – | display |
| Subscribe | 41 | 0 | 0 | 1 | 0 | 0 | – | – | CTA (**fixed**) |
| SystemProgress | 2,513 | 4 | 37 | 1 | 191 | 24 | 1 | – | display + signal hub |
| SystemPulse | 300 | 1 | 1 | 0 | 2 | 0 | – | – | display (10 s poll, hidden-guard ✓) |
| Time | 146 | 1 | 0 | 0 | 0 | 0 | – | – | display (hidden-guard ✓) |
| UserMetrics | 379 | 0 | 2 | 0 | 4 | 0 | – | – | display (raw fetch ⚠) |

---

## 2 · Wiring to LOT® AI, the System tab and Portrait

- **System tab.** Every widget lives here; this is where the single-parent architecture comes from (§1). `System` is `React.memo`, but it subscribes to about 14 stores. `usersOnline`, `liveMessage` and `weather` pushes re-render the whole tree, and that is what exposed bugs #3 and #4.
- **Portrait (`PublicProfile.tsx`).** It is wired to server-side `psychologicalProfile` (archetype) and badges (`utils/badges.ts`). **No widget state reaches the Portrait.** QIE cohort, Story chapter, Memory streak and Calendar don't appear there. That keeps the Portrait private, which suits the monk doctrine. If a public "practice" line is wanted, the source should be the server cohort job (`metadata.physiologicalCohort`), not client QIE.
- **LOT® AI.** The AI surfaces are `MemoryWidget` (`/api/memory`, which generates questions), `CosmicUpdateWidget` (Together AI image token), `MemoryEngineStats` + `useAIUsageStats`, and the server story at `api.ts:5484`. `AIFeedbackWidget` despite its name is a client-only QIE display; it makes no AI call.
- **Raw fetches bypass the cache** (finding #7). `UserMetricsWidget:42,55` and `QuantumEngineWidgets:179` should switch to the existing hooks in `queries.ts`. That removes 3 duplicate requests per System mount.

## 3 · Wiring to the Quantum Intent Engine, Memory and Story

- **Signal producers by source.** `intentions` (QuantumEngineWidgets ×7, MicroImage ×2, GoalJourney, Intentions, PatternInsights), `mood` (CohortConnect ×4, ContextualPrompts ×2, Interventions, EmotionalCheckIn, PatternInsights), `selfcare` (Chakra, Recipe, SelfCareMoments, EnergyCapacitor), `journal` (ChatCatalyst, Narrative), `calculator` (MicroCalculator ×2, QuantumRandom), `planner`, `micro_game` and `memory` (PatternInsights). `SystemProgressWidget` calls 14 typed `record*Signal` helpers.
- **Store fan-out.** 7 widgets call `useStore(intentionEngine)` on the whole store: QuantumState, PatternRecognition, SystemPulse, QuantumEngineWidgets, UserMetrics, AIFeedback and SignalStream. Every `recordSignal` re-renders all 7. **Recommendation:** add `computed()` slices (for example `$signalCount`, `$userState`, `$recognizedPatterns`) and subscribe to those instead.
- **Retention.** The bus keeps `MAX_SIGNALS = 1000` and `SIGNAL_RETENTION = 7 d` (`intentionEngine.ts:76–77`). Because the cap is shared, **any chatty ambient producer evicts behavioral truth.** QuantumRandom was the worst offender and is now throttled to 1 sample per 15 min. **Recommendation:** add a per-source quota, for example a maximum of 50 for ambient sources (`calculator`, `micro_game`).
- **Memory → Story.** Memory answers go to the server log (`event: 'answer'`). From there they feed `journeyData`, the awareness index, `useEvolutionSync` and `NarrativeWidget` (33 Story refs). The chain is intact. Its single point of failure is the shared Planning boundary (§1).

## 4 · Log synchronization in military-comms format (proposal)

**Today:** only Calendar (`calendar_entry`), Planner (`plan_set`), Recipe, ContextualPrompts and SelfCareMoments write to the Log. **No widget attaches ambient context** (time, weather, users online) to its entry.

**Proposed SITREP envelope:** one optional `metadata.sitrep` on each widget-originated log, assembled from stores that `System` already holds, so it costs no extra fetches.

```
SITREP 2026-11-13T07:42Z · WX CLEAR 8°C HUM 61% · SUNRISE 06:51 · NET 14 ONLINE
UNIT  Self-care · ACTION complete · DUR 4m · STATE energy=moderate clarity=high
NOTE  —
```

- **Military self-care framing.** Each self-care, check-in or recipe action is logged as a completed *drill*, and `SITREP` gives the operator an audit trail of their discipline. This should be **opt-in** (a Settings switch), because users-online and location are context the user may not want stored with private entries.

## 5 · Monk doctrine: AI as a pure, transparent practice

What is already aligned:
- the free tier is "no AI, just essentials";
- QIE runs only on the device;
- the Portrait is free of widget telemetry.

Gaps and proposals:
1. **Transparency ledger.** `MemoryEngineStats` already reads `useAIUsageStats`. Add a "What LOT® AI saw today" line: the count of signals by source plus the AI calls made. Transparency is shown, not claimed.
2. **Fewer, quieter widgets.** About 45 components on day 1 works against a monastic rhythm (§6). The 15-month reveal *is* the practice.
3. **No ambient noise in the record.** The QuantumRandom fix in this run is one example: entertainment ticks must not count as behavior.

## 6 · 15-month reveal: audit and proposed map

**Audit.** Only `PatternInsights`, `MoodAnalytics`, `EvolutionMilestoneToast`, `Narrative`, `Memory`, `Intentions` and `InterfaceEvolution` check `isFeatureUnlocked` / `shouldShowWidget` (plus `System` and `Sync`). The other widgets render on day 1 for any paid user. Layout *density* evolves through `$layoutDensity`, but the widget *count* does not.

**Proposed reveal (month index = months since first `answer` log):**

| Month | Reveal | Rationale |
|---|---|---|
| M1 | Time, Weather, Astrology, Breathe, Memory, Check-in | Foundation: presence and one daily question |
| M2 | Self-care, Recipe / Fasting, MonthlyPulse | Body routines |
| M3 | Intentions, Planner, Calendar | Direction |
| M4 | Narrative (Story), GoalJourney | First chapter: enough memory to tell a story |
| M5 | EnergyCapacitor, ChakraErgonomics | Energy literacy |
| M6 | PatternInsights, MoodAnalytics | Patterns need ~5 months of data |
| M7 | Community stack (CohortConnect, ChatCatalyst, Pulse) | Sangha after solitude |
| M8 | Evolution, InterfaceEvolution | Self-observation of growth |
| M9 | QuantumState, SignalStream | QIE made visible |
| M10 | PatternRecognition, AIFeedback, Integrity | Deep engine |
| M11 | QuantumEngineWidgets (device ecosystem) | External integrations |
| M12 | Stats stack, CorrelatedIndexes | One-year review |
| M13 | Micro widgets (Calculator, Game, Image, QuantumRandom) | Play, earned |
| M14 | UserMetrics, SystemPulse, SystemProgress | Operator instrumentation |
| M15 | Architect, Benchmark, Investor stack | Full instrument panel |

**Implementation sketch:** add a `revealMonth` to each `WidgetErrorBoundary` group and gate on `journeyData.daysSinceStart / 30` (already computed in `System.tsx`). Admin / R&D can override. This also reduces day-1 render cost.

## 7 · Load speed (production build, `NODE_ENV=production`)

| Asset | Raw | Gzip |
|---|---:|---:|
| `app.js` (entry) | 730 KB | 184 KB |
| largest shared chunks | 238 / 195 / 149 KB | 58 / 64 / 38 KB |
| **App critical path (12 files, static imports)** | **1,420 KB** | **381 KB** |
| Dynamic imports from `app.js` | **0** | — |

Biggest source contributors to the app graph (unminified source):
- `badges.ts` 347 KB
- `intentionEngine.ts` 307 KB
- `Logs.tsx` 218 KB
- `SystemProgressWidget.tsx` 206 KB (mostly a changelog string array)
- `easter-eggs.ts` 108 KB

**Recommendations, by expected gain:**
1. **Move `SystemProgressWidget`'s changelog data into a JSON file loaded on demand.** About 200 KB of source is text, not code.
2. **Use `React.lazy` + `Suspense` for below-fold groups**: Investor, Biofield, Dashboard, Architect, Stats, Calendar, Benchmark and MicroGame. `LazyMount` already exists to defer mount, and lazy imports would defer download as well. Watch for `SystemProgressWidget`'s `record*Signal` calls on mount: keep it eager or move those calls into a store.
3. **Load `easter-eggs.ts` with a dynamic `import()`** on first trigger.
4. Split `badges.ts`: definitions are needed on the Portrait and in Logs, but not on first paint of System.

**Done this run:** `LazyMount` on Biofield Engine and Stats. That means 5 fewer store subscribers and 7 fewer API queries on first paint.

## 8 · Lag test

**Headless Chromium, `QuantumRandomWidget` in isolation, 1 h simulated clock (`page.clock.runFor`):**

| Version | Tab | QIE signals / h | Block renders / h |
|---|---|---:|---:|
| before | visible | **313** | 7,385 |
| before | hidden | **316** | **7,367** |
| after | visible | **4** | 7,379 |
| after | hidden | **0** | **1** |

In the live app, each of those 313 signals also re-rendered the 7 widgets that subscribe to the whole `intentionEngine` store. That comes to about 2,200 extra widget renders per hour per open tab, which this fix removes.

**Static lag audit:**

| Area | Finding | Severity |
|---|---|---|
| Sound | 5 independent `AudioContext`s; the first gesture pays several `resume()` calls. Consolidate behind `sovietChime`'s `sharedAudioContext`. | MED |
| Sound toggle | A 300 ms `isSoundToggling` lockout on the Sound/Radio block is intentional debounce. The flag is React state, so it adds one extra re-render of all of `System`. Use a ref. | LOW |
| Timers without a hidden-tab guard | `MicroCalculatorWidget` (10 s check), `MicroGameWidget` (gated by viewport ✓), `QuantumRandom` (**fixed**) | LOW |
| Render-time side effects | Self-care IIFE writes/removes `selfcare-quantum-reason` in localStorage on every System render. Move it to an effect. | LOW |
| Loading dots | `LoadingDots` runs a 500 ms interval with no hidden guard (cosmetic) | LOW |
| Polling | `SystemPulseWidget` polls every 10 s with a hidden guard ✓; `TimeWidget` has a hidden guard ✓ | OK |

## 9 · Widget usage data log (platform-wide)

**Finding:** there is **no server-side aggregation of widget usage** across LOT® Systems. The available sources are:
- the per-device QIE `signals` array (localStorage, 7 days, not uploaded);
- server Log events from 6 surfaces;
- `/admin-api/widget-diagnostic` (`admin-api.ts:1783`), which explains why stats widgets are hidden but does not count usage.

**Static usage capability map:** a widget can only appear in the usage data if it emits one of the following.

| Channel | Widgets |
|---|---|
| Server Log (durable, cross-device) | Calendar, Planner, Recipe, ContextualPrompts, SelfCareMoments, Memory (`/api/memory`) |
| QIE only (device-local, 7 d) | ChakraErgonomics, ChatCatalyst, CohortConnect, GoalJourney, Intentions, Interventions, MicroCalculator, MicroGame, MicroImage, Narrative, PatternInsights, QuantumEngineWidgets, QuantumRandom, EmotionalCheckIn, EnergyCapacitor, SystemProgress (14 typed), UserMetrics |
| **Untracked** (no signal, no log) | AIFeedback, AngelInvestor, Architect, Benchmark, CorporatePlan, CorrelatedIndexes, CosmicUpdate, DemoDay, Evolution, Integrity, InterfaceEvolution, MonthlyPulse, PatternRecognition, QuantumSign, QuantumState, SignalStream, Subscribe, SystemPulse, Time |

**Recommendation:** add a privacy-preserving `POST /api/widget-usage`. It would send a daily batched histogram `{widget, interactions, mounts}` with no content, sent once a day from the QIE bus. The admin view can then show real adoption per widget, and the 15-month reveal (§6) can be tuned on evidence.

---

## 10 · Changes in this push

| File | Change |
|---|---|
| `src/client/components/QuantumRandomWidget.tsx` | Side effects moved out of the `setState` updater; ref-driven countdown; ticks skipped while `document.hidden`; QIE signal throttled to 1 per 15 min and recorded from the visible counter only. |
| `src/client/components/System.tsx` | Subscribe 20% roll and Intentions cooldown gate computed once per mount (`useState` initializer + effect). `LazyMount` added to the Biofield Engine and Stats stacks. |
| `docs/diagnostics/WIDGET-HEALTH-SCAN-2026-11-13.md` | This report. |

**Verification:** production client build green · `tsc` 104 → 104 (no new errors) · headless lag test in §8.

## 11 · Next run checklist

- [ ] Code-split below-fold widget groups with `React.lazy` (§7.2) and re-measure the critical path (target < 250 KB gzip).
- [ ] Move `SystemProgressWidget`'s changelog to lazy JSON (§7.1).
- [ ] Replace the 3 raw fetches with `queries.ts` hooks (finding #7).
- [ ] Add `computed()` slices for `intentionEngine` subscribers (§3).
- [ ] Consolidate to 1 `AudioContext` (§8).
- [ ] Give `MemoryWidget` its own error boundary (§1).
- [ ] Decide on the SITREP opt-in (§4) and the widget-usage endpoint (§9).
- [ ] Decide on the M1–M15 reveal gating (§6).
