# Button Lag / Rendering Investigation — 2026-10-03

Scheduled static investigation (no browser profiling was possible in this run).
Repo: LOT-Systems/LOT-Computer · branch `claude/brave-rubin-mvoe59` @ `98971f2`.

## Summary

No open issues exist for button lag or rendering performance (GitHub issue search: 0 results).
Button lag has been addressed in six perf passes (Jul 19–28). No user reports,
profiling traces, or perf metrics are checked into the repo. The referenced
`docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md` (cited in `be3e8fa`) is **not in the repo**.

The generic `Button` component (`src/client/components/ui/Button.tsx`) is **not** the cause:
secondary buttons have no store subscription; primary/rounded subscribe only to `theme` / `isMirrorOn`.
Hover effect is a 180ms opacity transition on a `::before` pseudo-element (`src/client/index.css:102-125`) — compositor-friendly.

## Perf history (all merged)

| PR / commit | Fix |
|---|---|
| `863b333`, `b219cc3` | Cap logs query, back off stats polling, move quantum writes out of `useMemo` |
| `bd9ef2a` | Planner buttons frozen: reuse AudioContext, catch sound errors |
| [#85](https://github.com/LOT-Systems/LOT-Computer/pull/85) | Pause System background intervals off-tab (`isRouteActive`); defer `recordSignal` persist + analysis |
| [#88](https://github.com/LOT-Systems/LOT-Computer/pull/88) | Stop render-phase atom write in PatternRecognitionWidget; gate 3 more intervals |
| `b46f1ac` | Unmount System tab when inactive |
| [#94](https://github.com/LOT-Systems/LOT-Computer/pull/94) | MemoryWidget `analyzeIntentions` out of `useMemo`; SystemProgressWidget click handler deferred |
| [#95](https://github.com/LOT-Systems/LOT-Computer/pull/95) | Memoize SignalStream / UserMetrics widgets |

## Root-cause model (from prior PRs)

Every `intentionEngine` write re-renders all subscribers; `analyzeIntentions()` is a very large
synchronous scan that writes the atom. Any synchronous call of it in a click handler or render blocks buttons.

## Suspected remaining causes (static review, unverified)

1. **`analyzeIntentions()` keeps growing, after the last perf pass.** `src/client/stores/intentionEngine.ts`
   is 6503 lines; `analyzeIntentions` (line 258 → ~3440) is one synchronous function. After #95 (Jul 28)
   QIE v110–v113 added patterns P140–P151 (≈139 → 151 patterns; +~120–135 lines each release).
   Cost per run grows linearly with each "benchmark" release, and the run also does `computeUserIndex`,
   a `localStorage.setItem` JSON write (line ~3436), and an atom `set`.
2. **Remaining synchronous callers on interaction paths** (not deferred):
   - `Logs.tsx:3975` — `/qos` trigger runs `analyzeIntentions()` inline in the submit handler.
   - `Logs.tsx` has also grown +73–103 lines per release (4506 lines) with new handlers.
   - `System.tsx:268` — runs `analyzeIntentions()` + `recomputeAssembly()` in an effect on every `logs` change
     (post-paint, but still a main-thread long task right after the user's action).
   - `SystemProgressWidget.tsx:1555/1629` — deferred one macrotask in the click handler (fixed by #94), but still a long task.
   Mitigated only by the 5-min cooldown; the first call after cooldown expires pays the full cost.
3. **7 widgets subscribe to the whole `intentionEngine` atom** (`QuantumStateWidget`, `PatternRecognitionWidget`,
   `SystemPulseWidget`, `QuantumEngineWidgets`, `UserMetricsWidget`, `AIFeedbackWidget`, `SignalStreamWidget`).
   Any `recordSignal` (every widget interaction) re-renders all of them. `AIFeedbackWidget`, `QuantumStateWidget`,
   `SystemPulseWidget`, `QuantumEngineWidgets` were not covered by the memoization passes (#88/#95).
4. **Huge components**: `SystemProgressWidget.tsx` (2513 lines, with ever-growing `SESSION_REPORTS` literal rebuilt in module scope) and
   `Logs.tsx` (4506 lines) — large re-render and parse cost; no code-splitting evident.
5. **Tabs stay mounted (`display:none`)** for all visited tabs other than System — per #85 root cause. Other
   hidden widgets with intervals may still run; only 8 `isRouteActive` uses exist.
6. **Lower likelihood**: 4 `transition-all` usages; CSS `isolation` + pseudo-element per hover button (cheap).

## Next steps (recommended, in order)

1. **Measure first**: add a `PerformanceObserver({type:'longtask'})` / `performance.measure` around
   `analyzeIntentions` and `recordSignal`, logging to console in dev. Capture a Chrome Performance trace on a real
   account with ~1000 signals clicking buttons in Planner/Memory/Logs.
2. **Chunk `analyzeIntentions`** — split pattern groups into functions run across `requestIdleCallback` slices,
   or move to a Web Worker; the pattern list is pure over `signals`.
3. **Defer `Logs.tsx:3975`** and the `System.tsx:268` effect via `deferHeavy`/idle callback.
4. **Selector-style subscriptions**: use `useStore(intentionEngine, { keys: [...] })` or derived atoms so widgets
   re-render only for the slice they use; memoize the 4 uncovered widgets.
5. **Add a perf guard to the benchmark skill**: a headless-Chromium smoke test (as used in #94/#95) timing
   `analyzeIntentions` so pattern growth fails the build above a budget (e.g. 50ms).
6. **Re-add the missing diagnostic doc** or update the references to it.
7. Ask for a concrete repro (which button, which tab, device) — no user report exists in the repo or issues.

_Findings are from static code review; nothing was profiled or confirmed at runtime._
