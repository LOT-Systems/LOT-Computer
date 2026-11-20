# Button Lag & Rendering — Diagnostic · 2026-11-20

Scheduled investigation. This is a static code review of `master` at `9f2b88c`. No live profiling was run, and there are no production metrics or user reports in the repo or on GitHub.

## TL;DR

The July perf passes (PRs #85, #88, #94, #95) fixed most of the render-phase store writes and the unmemoized heavy work. **Three paths of the same kind are still there**, and the QIE has grown from 139 to 151 patterns and 51 archetypes since then, so each one costs more than it did:

| # | Severity | Where | Problem |
|---|----------|-------|---------|
| 1 | **High** | `src/client/components/System.tsx:377` | `useMemo(() => getOptimalWidget(), [logs])`. `getOptimalWidget()` calls `analyzeIntentions()`, which on a cooldown miss runs the full 151-pattern scan, writes localStorage and calls `intentionEngine.set(...)`. That is a **store write during render**, and it re-renders all 7 `useStore(intentionEngine)` subscribers before paint. The comment at `System.tsx:262-265` says this was fixed, but only the first call site was moved to `useEffect`. |
| 2 | **High** | `src/client/components/QuantumEngineWidgets.tsx:207-255` | All six device-connect buttons (`handleCarConnect` and the others) call `recordSignal(...)` **inside the `setState(prev => …)` updater**. Updaters run while React processes the render, so this is a store write in the render phase (and it runs twice under StrictMode). Each click re-renders every intentionEngine subscriber synchronously before the toggle can paint. |
| 3 | Medium | `src/client/components/QuantumEngineWidgets.tsx:373-375` | The cohort view runs `classifyPhysiologicalCohort(engineState.signals, …)` in an inline IIFE on **every render**. That is a filter over up to 1000 signals plus scoring and sorting 51 archetypes, and it repeats work already memoized as `cohortDirective` (L201). Any intentionEngine write anywhere re-runs it. |
| 4 | Medium | `src/client/components/Logs.tsx:204-3640` | The whole past-log list is rendered inline in one `pastLogIds.map` with a ~150-branch `if/else` chain. There is no per-row memoized component. Any change to Logs state re-renders every row: the `isMouseActive` toggle (2 s mouse inactivity, L147-166), each `updateLog` success (L72), and each refetch. The chain grew by +366 lines (v110–v113 handlers) since the July fixes. |
| 5 | Low | `src/client/components/QuantumEngineWidgets.tsx:190-204` | The memos and effects are keyed on `engineState.signals.length`. Once `MAX_SIGNALS = 1000` is reached the length stops changing, so `readiness` and `cohortDirective` **go stale**. This is a correctness bug, not a lag bug, but it hides work (and it is why #3 "works"). |
| 6 | Low | `src/client/components/ui/Button.tsx:132-157` | `GhostButton` throws away the caller's `className`. This is cosmetic, but it can make a ghost button look unresponsive (no expected hover or active styles). |

## Ruled out / looks healthy

- **Shared `Button` component** (`ui/Button.tsx`): it has no heavy logic. Store subscriptions are split by kind (theme and mirror only), and it uses no `transition-all` except on the light-theme primary button.
- **CSS**: `.grid-fill-hover` (`index.css:102-160`) animates only `opacity` on a `::before` layer, which is compositor-friendly. There is no `backdrop-filter` or `will-change` misuse.
- **AudioContext**: `plannerWidget`, `sound`, `sovietChime`, `sovietKeyboard` and `sovietGameSounds` all reuse a single cached context (the fix from `bd9ef2a` holds).
- **`recordSignal()`** (`intentionEngine.ts:199-253`): persist and analysis are already deferred (`schedulePersist` and `deferHeavy`). The only synchronous cost is one `intentionEngine.set`, which is fine when it is called from an event handler and not from an updater (see #2).
- **Badges**: `getEarnedBadges()` reads localStorage and is called in only one place (a Logs trigger). It is not on a render path.
- `getCircadianPhase()` (added in v111 to System and QEW) is cheap.

## Timeline of prior work

| PR / commit | What it fixed |
|-------------|---------------|
| `863b333` | Capped the logs query and backed off stats polling |
| `b219cc3` | Moved quantum state writes out of `useMemo` |
| #85 `ee88f4c` | Paused System background work off-tab |
| #88 `6e5007a` | Stopped a render-phase atom write and off-tab churn |
| `b46f1ac` | Unmounted the System tab when inactive |
| #94 `be3e8fa` | MemoryWidget render-phase write; SystemProgressWidget sync click handler |
| #95 `9364aba` | Memoized SignalStream sort and UserMetrics index/cohort |

Commit `be3e8fa` cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, but **that file was never committed**. This document replaces it.

Since #96 (2026-08-05) no perf work has landed. The only `src/` changes since then are QIE v110–v113 content (patterns, Logs handlers, badges). There are no GitHub issues, and the open PRs (#93 calendar toast, #97 wiki) don't touch these paths. PR #93 adds a toast and should get a quick render check before it merges.

## Suggested fixes (not applied)

1. `System.tsx:377`: derive the value from patterns that are already analyzed, as `PatternRecognitionWidget.tsx:78` does. Either memoize on `engine.recognizedPatterns`, or compute `optimalWidget` inside the existing `useEffect` at L267 and keep it in state.
2. `QuantumEngineWidgets.tsx:207-255`: compute `next = !current` from the current value, call `setX(next)`, then call `recordSignal(...)` in the handler body, outside the updater.
3. `QuantumEngineWidgets.tsx:373`: reuse a single `useMemo` for the classification, keyed on `engineState.signals` (the reference) and `engineState.recognizedPatterns`.
4. `Logs.tsx`: move the per-log branch into a `React.memo(LogRow)` keyed on the `log` object, so that `isMouseActive` and saves re-render only the primary editor. Consider rendering only the visible window, since the list is long.
5. Key on the array reference instead of `.length` (fixes #5).
6. `GhostButton`: merge `props.className` with `cn(...)`.

## Next steps: deeper investigation

- **Profile in the real app.** Reuse the headless-Chromium harness from #95 (seeded with 1000 signals and 500 logs). Record INP and long tasks for (a) clicking a QEW device toggle, (b) a System re-render after the 5-min cooldown expires, and (c) idle mouse on Logs with 500 logs.
- **Measure `analyzeIntentions()` at 151 patterns** with 1000 signals. Each pattern does its own `signals.filter`, so the cost is about O(patterns × signals). One pass that pre-buckets signals by source and time window could cut it by a large factor.
- **Field telemetry.** Nothing measures interaction latency in production. Add a `PerformanceObserver` for `event` and `longtask` entries and log a p75 INP to `/api/…`, so that future "lag" reports can be confirmed with data.
- Check whether the 30-min `startBackgroundQOSMonitor` interval (`intentionEngine.ts:5121`) fires a synchronous scan while the user is interacting. Consider using `requestIdleCallback`.
