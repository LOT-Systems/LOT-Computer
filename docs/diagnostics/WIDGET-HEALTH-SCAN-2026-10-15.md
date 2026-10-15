# LOT® Widget Health Scan — 2026-10-15

Scheduled routine · branch `claude/charming-albattani-5km37o` · scope: widget wiring, data flow, QIE / Memory / Story hooks, month-by-month reveal, load speed, lag surface, usage log.

**Method:** static analysis only (source read, `tsc --noEmit`, esbuild production build, bundle sizes). **No browser/runtime lag test was run** in this environment — the lag section lists what code can be *proven* from source, and what still needs a device test.

## 1. Gate

| Check | Before | After |
|---|---|---|
| `esr client.build.ts -prod` (esbuild) | PASS | PASS (app.js 729,837 → 730,197 B) |
| `npm run server:build` (tsc, server config) | PASS | PASS |
| `tsc --noEmit -p tsconfig.json` (strict, whole repo) | 104 errors | **95 errors** |

esbuild does not type-check, so the "green" build had been hiding real runtime faults (below). The remaining 95 tsc errors are listed in §6.

## 2. Defects found and fixed (this push)

| # | Severity | Where | Fault | Effect | Fix |
|---|---|---|---|---|---|
| F1 | **HIGH** | `stores/intentionEngine.ts:3332` (P147) | `dayMs` referenced outside its scope (defined only in `computeUserIndex`) → `ReferenceError` | Every `analyzeIntentions()` run past the 5-min cooldown aborts at P147. Patterns after it (P148–P151, i.e. the v112–v113 additions) never evaluated; `System.tsx` calls it from a `useEffect` with no try/catch. Present since commit `1846b80` (QIE v112). | Inline `24*60*60*1000` |
| F2 | **HIGH** | `UserMetricsWidget.tsx:98` | `classifyPhysiologicalCohort()` called with 0 args (needs signals, userState, patterns) → `TypeError` in render | Widget throws on mount; it shares the single `Dashboard` error boundary with CorrelatedIndexes, SystemProgress and SystemPulse, so the whole Dashboard stack shows "Failed to load". | Pass `(engineState.signals, getUserState(), engineState.recognizedPatterns ?? [])` |
| F3 | MED | `UserMetricsWidget.tsx:262,272` | Read `.label` / `.dominant`, which don't exist on `PhysiologicalCohortClassification` | Physiology view would render blank Archetype/Dominant fallbacks | → `.archetype` / `.dominantModule` |
| F4 | **MED** | `MonthlyPulseWidget` + `/api/me` | `joinedAt` is not in `UserProfile` and `useProfileView()` never returned it → `monthNumber` always 0 | **Monthly Pulse never shows for anyone.** The month-by-month reveal had no data source. | Added `joinedAt` to `useProfileView()` pick (only caller: `/me`, own user) and to `UserProfile` type |
| F5 | LOW | `MonthlyPulseWidget` | Messages stop at month 12; program is 15 months, label capped at 12 | Months 13–15 showed the generic line | Added messages 13–15, caps raised to 15 |
| F6 | LOW | `QuantumEngineWidgets.tsx:472` | `dimensions.selfcare` (key is `selfCare`) | CARE tile showed empty | Key fixed |
| F7 | LOW | `System.tsx:624` | `weather.humidity` possibly null in comparison | `null >= 50` silently false; TS error | `?? 0` |
| F8 | LOW | `QuantumRandomWidget.tsx` | `setNumber` + `recordSignal` called *inside* a `setState` updater (impure) | StrictMode/concurrent re-invocation can double-record `quantum_random` signals into the QIE; 3 intervals ticking even in hidden tabs | Side effects moved to ref-driven interval; ticks skipped while `document.hidden` |

## 3. Wiring map

Surface = `System.tsx` (paid layout; non-paid users get only Memory / Game / Subscribe). 40 widget files, ~12.4k LOC (`SystemProgressWidget` alone 2,513).

**Error isolation:** 19 `WidgetErrorBoundary` groups. Not isolated: `TimeWidget`, `QuantumRandomWidget` (top-of-page, both timers). Weak point: groups are coarse — Dashboard (4 widgets), Biofield (5), Bioethics (5), Planning (5) each fail as one unit (F2 demonstrated the cost). *Recommendation:* one boundary per widget inside the group.

**Widgets → QIE (`recordSignal`)** — wired: Quantum Engine (16 calls), SystemProgress, Recipe, Planner, CohortConnect, PatternInsights, MicroImage, MicroCalculator, ContextualPrompts, Calendar, QuantumRandom, Narrative, MicroGame, Memory, Interventions, Intentions, GoalJourney, ChatCatalyst, ChakraErgonomics, PatternRecognition.
**Display-only / not feeding QIE or Log:** Angel Investor, Corporate Plan, Demo Day, Architect, CorrelatedIndexes, CosmicUpdate, MonthlyPulse, Subscribe, Time. Acceptable for pure display; `MonthlyPulse` and `CosmicUpdate` are candidates for a signal on interaction (dismiss / token).

**Known type-contract gap:** `MicroGameWidget` emits source `'micro_game'`, and `intentionEngine.ts` passes plain `string`/`'ecosystem'` to a closed union (`IntentionSignal['source']`, 17 values). Works at runtime (no switch rejects it), but the QIE's per-source analytics (`selfcare`, `journal`…) will never bucket it. Decide: add to union or map to `'energy'`.

**LOT® AI / System tab / Portrait:** System tab consumes `getUserState`, `classifyPhysiologicalCohort`, `recomputeAssembly` (effect-driven after paint — good). AI surfaces: ChatCatalyst, Recipe, MonthlyPulse, CosmicUpdate (Together AI token), Memory (`useCreateMemory`). Portrait copy exists in MonthlyPulse messages and Settings; there is no widget-level Portrait writer — Portrait is fed indirectly via logs/signals. `MemoryWidget:65` destructures `insight` from `{response}` (type mismatch) — the "advanced memory insight" branch (`featureUnlocks.advancedMemory`) is dead unless the server returns `insight`; confirm server contract.

**Log sync ("military comms" context line):** Logs already stamp weather/city/humidity on entries (`Logs.tsx` ~4173, `weather_update`), `/qos`, `/assembly`, `/phys`, `/qi` triggers surface QIE state. Missing: a one-line **SITREP** trigger that composes *time · weather · users online · cohort archetype · streak* from the same stores (`stores.usersOnline`, `weather`, `classifyPhysiologicalCohort`, `useLogContext`) and posts it as a single log entry. All inputs exist; it is ~30 lines in `logTriggers.ts` + `Logs.tsx`. Not built in this push (product call: format of the line).

**Monk / purity layer:** `useLogContext` already derives streak, dormant modules, engagement level and `getContextualDirective()`. That is the right seam for a "pure and transparent" daily-rule check (e.g. an evening *Compline* line: modules completed vs dormant). Proposal only.

## 4. 15-month reveal

- Reveal is currently **level-driven** (`interfaceEvolution.ts`: `visualRefinement`, `featureUnlockLevel` 0–5, density levels), **not month-driven**. Only MonthlyPulse is month-based, and it was dead until F4.
- Now live: months 1–15 messaging, gated to Usership tag, one dismiss per month (`localStorage` `lot_pulse_<id>`).
- Gap: no month→widget unlock table. A proposed mapping (needs S-2 sign-off): M1 Time/Memory · M2 Planner/Intentions · M3 Cohort/Patterns (Active User) · M4 Portrait depth · M5–6 Recipe/Calendar/Chakra · M7–9 Narrative/GoalJourney/Evolution · M10–12 Quantum Engine/Biofield · M13–15 Architect/Investor/Benchmark.

## 5. Load speed and lag surface

**Measured:** `app.js` 730 KB minified (+ shared chunks 16/5/4/149/13/195/238/3/20/46 KB; `about.js` 442 KB). All 40 widgets are **statically imported** in `System.tsx`. `LazyMount` defers only *mounting* of `QuantumEngineWidgets` (IntersectionObserver); the code still ships in the main bundle. Per-widget mount time is already recorded to `window.__LOT_WIDGET_PERF__` and warns >50 ms — use it on-device.

**Recommendations (not applied — need a browser to verify, and a bad lazy boundary regresses UX):**
1. `React.lazy` + Suspense for gated/below-fold widgets: Angel Investor, Corporate Plan, Demo Day, Architect, Benchmark, Calendar, SystemProgress (2.5k LOC), MicroGame (988). Expected: meaningful cut of initial JS.
2. `badges.ts` is >7.5k lines and carries 36 type errors incl. a duplicate object key (`badges.ts:6883`) and an esbuild duplicate-key warning (`elixir_found`, line 4825) — later definition silently wins. Lazy-load it.
3. Split the coarse error boundaries (§3).

**Timers / listeners (source-verified):**
| Widget | Timers | Cleanup |
|---|---|---|
| Time | 1 s chime poll + `Clock` 100 ms + rAF stopwatch | ✓ all cleared; chime poll runs only if enabled |
| QuantumRandom | 3 × 1 s/10 s intervals | ✓ cleared; now skips hidden tabs |
| MicroGame | 150 ms loop, viewport-gated | ✓ |
| SystemPulse / ContextualPrompts / ChakraErgonomics / MicroCalculator / SystemProgress | 1 interval each (SystemProgress 60 s, hidden-gated) | ✓ cleared |

No leaked intervals or listeners found in widget code.

**Audio:** 5 independent `AudioContext` creators (`sound.ts`, `sovietChime`, `sovietGameSounds`, `sovietKeyboard`, `plannerWidget`). Chrome allows ~6 live contexts per page; a user who enables ambient sound + chime + keyboard + game + planner is at the cap and the next `new AudioContext` fails. *Recommendation:* one shared context module (`getSharedAudioContext()`), resume on first gesture. `Settings.tsx` already calls `warmAudioContext()` on toggle.

**Needs on-device lag test (not possible here):** button→response latency, keyboard-sound latency, first-sound-after-gesture, Dashboard mount time (`__LOT_WIDGET_PERF__`), scroll jank with all groups mounted (every group stays mounted regardless of scroll).

## 6. Remaining tsc errors touching widgets (open)

`GoalJourneyWidget` implicit `any` ×3 · `MemoryWidget:65` `insight` · `MicroGameWidget:779` source `'micro_game'` · `RecipeWidget:261` `MealTime|null` · `SystemProgressWidget` `version` field ×3 · `intentionEngine` source-union ×9, `'active'` timing ×2 · `punctuationContext:148` unreachable `'call-for-help'` comparison (that branch can never fire) · `router.ts` ×2 · `badges.ts` ×36. None block the build; `punctuationContext:148` and `MemoryWidget:65` are dead-branch logic bugs worth a follow-up.

## 7. Widget usage data log

Per-widget usage is captured in three places: QIE `signals` (client, 7-day retention, server-synced), Log `event` types (server), and `useLogContext` (`widgetDiversity`, `mostUsedWidget`, `leastUsedWidget`, `dormantModules`). There is **no platform-wide aggregate** across users. Recommendation: nightly job reading Log `event` counts grouped by widget → one table (`widget_usage_daily`: date, widget, users, events, p50 mount ms from the client perf map). The data exists; only the aggregation/endpoint is missing. Not built (needs migration + schema decision).

## 8. Follow-ups, ranked

1. Verify F1/F2 on a device: QIE patterns P148+ now fire; Dashboard renders.
2. Per-widget error boundaries.
3. Lazy-load investor/architect/benchmark/calendar/badges.
4. Shared `AudioContext`.
5. SITREP log trigger (S-2 to approve line format).
6. Month→widget unlock table (S-2 to approve).
7. Widget usage aggregate job.
8. Clean the remaining 95 tsc errors; add `tsc --noEmit` to the benchmark gate so faults like F1/F2 can't hide behind a green esbuild build.
