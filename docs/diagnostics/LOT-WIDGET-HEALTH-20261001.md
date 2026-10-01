# LOT® Widget Health Scan — 2026-10-01

Scheduled routine · branch `claude/charming-albattani-iz78h9` · static analysis only
(no `node_modules` in the runner → no build, no typecheck, no live lag test; see "Not verified").

## 1. Inventory
- 40 widget components in `src/client/components` (+ `QuantumEngineWidgets` bundle of several). Largest: `SystemProgressWidget` 2513 lines, `MicroGameWidget` 988, `QuantumEngineWidgets` 651, `PatternRecognitionWidget` 561, `IntegrityWidget` 476.
- `System.tsx` (1071 lines) mounts ~46 widget instances; ~25 `WidgetErrorBoundary` wrappers. Before this push, 3 instances were unwrapped (`TimeWidget` ×2 in the paid layout path, `QuantumRandomWidget`) → **fixed**, now 0 unwrapped in the paid layout. (`TimeWidget` at ~line 444 in the free layout is still unwrapped.)
- `WidgetErrorBoundary` records mount time to `window.__LOT_WIDGET_PERF__` and warns >50 ms, but **nothing reads it** (`getWidgetTimings` exported, never consumed) — no persisted widget-timing data.

## 2. Wiring
| Path | Status |
|---|---|
| Widgets → QIE (`recordSignal` in `stores/intentionEngine.ts`) | Wired in ~25 components (SystemProgress 12, QuantumEngine 8, CohortConnect 5, About 5 …). Signals stored client-side only: localStorage, 7-day window, ≤1000 signals, persist deferred/coalesced. |
| Widgets → Log (server) | Only Calendar, Planner, Recipe, ContextualPrompts, SystemProgress post `logEvent`-style entries. Most widgets are signal-only (client-local) and never reach the Log. |
| Memory / Story | `MemoryWidget` posts `/api/memory`; story served by `GET /api/memory/story` (api.ts:2610). Wired. |
| Portrait / profile | `GET /api/user-profile` (api.ts:2714) + `useProfile()` in System. Wired. |
| LOT® AI | `/api/stats/ai-usage`, `AIFeedbackWidget`, `PatternRecognition`. AIFeedbackWidget has no direct fetch/signal call of its own (renders from store). |
| Admin diagnostic | `/admin-api/widget-diagnostic` covers only 4 community widgets (IntentionPatterns, CollectiveConsciousness, WellnessPulse, MemoryEngineStats). |

## 3. Findings (ranked)
1. **HIGH — Signal flood from `QuantumRandomWidget`.** It mounts two `useQuantumNumber` hooks, each with a 1 s interval and a countdown drawn from `[1…72]` s, and each rollover calls `recordSignal('calculator','quantum_random')`. ≈ 2 signals / ~21 s ≈ **300+/hour/tab**, even in a hidden tab, saturating `MAX_SIGNALS` (1000) and triggering `analyzeIntentions()` every 5 signals. This displaces real behavioural signals (journal, mood, memory) from the 7-day window and skews QIE pattern output. **Mitigated** this push (hidden-tab pause). **Recommended:** stop emitting a signal per rollover (it is noise, not intent) or throttle to ≤1/min.
2. **MED — No code-splitting.** No `React.lazy`/dynamic `import()` anywhere in `src/client`; every widget (incl. 2.5k-line `SystemProgressWidget`, a large part of which is changelog strings) ships in the main bundle. Only `QuantumEngineWidgets` uses `LazyMount` (viewport-deferred mount, still in bundle). Recommend `React.lazy` + `LazyMount` for below-the-fold/admin-ish widgets: SystemProgress, Architect, Benchmark, Integrity, UserMetrics, CorrelatedIndexes, MicroGame, AngelInvestor/CorporatePlan/DemoDay.
3. **MED — Timers not paused off-tab** (doctrine in System.tsx/SystemProgress says they should be): `QuantumRandomWidget` (2×, **fixed**), `MicroCalculatorWidget` 10 s poll (**fixed**), `MicroGameWidget` game loop (uses `pausedRef`; verify it is set on `visibilitychange`), `stores/recipeWidget.ts:188` `setInterval` created in `initRecipeWidget()` with no handle/cleanup and no hidden check, `TimeWidget` 1 s interval (has visibility catch-up handler; OK).
4. **LOW — `TimeWidget` 1 s tick** runs `checkHour` every second for chime logic; a minute-granularity check suffices.
5. **LOW — Data gap: no platform-wide widget-usage dataset.** Usage can only be inferred from per-user Log events and client-local signals. There is no `widget_usage` event type, table or endpoint (grep: none in `src/` or `prisma/`).
6. **LOW — 15-month reveal is not an explicit calendar.** Reveal/build-up is driven by `EvolutionState` (`featureUnlockLevel` 0–5, `LayoutDensity` breathable→instrument via `visualRefinement`) plus tag gating (Usership/R&D see the full layout; others get the simple one). Progression is earned (levels, streaks, badges), not month-indexed; `daysSinceStart` exists only for Memory journey. No month-1…15 mapping exists to scan against.

## 4. Changes in this push
- `QuantumRandomWidget.tsx`: both intervals skip work when `document.hidden`.
- `MicroCalculatorWidget.tsx`: 10 s magic-time poll skips when hidden.
- `System.tsx`: `TimeWidget` and `QuantumRandomWidget` in the paid-layout block now wrapped in `WidgetErrorBoundary`.

## 5. Proposed program (not implemented — needs owner decision)
- **Widget usage log:** add `widget_event` Log type `{widget, action, ctx}` posted via a single batched helper; aggregate server-side for the admin diagnostic.
- **Military-style context post ("SITREP"):** an interactive widget action can attach a synchronized context stamp — local time (24h), weather description/temp, users online — and post a terse line to the Log, e.g. `1530L | CLR 18C | ONLINE 42 | MEMORY ANSWERED`. All three inputs already exist in `System.tsx` (`weather`, `usersOnline`, `Clock`). Fits the monk/transparency framing: short, factual, no embellishment, written by the operator and read back by LOT® AI.
- **15-month reveal:** define an explicit month→widget table on top of `featureUnlockLevel`, then add a test that asserts which widgets mount at each month.
- **Lag test harness:** read `__LOT_WIDGET_PERF__` + `initPerfObserver` interaction entries (INP>200 ms) and POST aggregates; add Playwright (preinstalled in runner) script for button/sound/load timings.

## 6. Not verified
No build, typecheck, test run or browser lag measurement was possible in this environment (dependencies not installed). Edits are minimal and syntactically simple but untested. Sound controls, button latency and loading speed were reviewed from code only (`sound.ts` uses a single lazily-created AudioContext with cleanup; `sovietKeyboard.ts` throttles to ~55 clicks/s).
