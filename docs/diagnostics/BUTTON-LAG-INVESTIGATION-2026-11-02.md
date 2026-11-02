# Button Lag & Rendering Investigation — 2026-11-02

Scheduled routine "Button lag investigation". Static review of git history and code; no live profiling was possible in this environment.

## Summary
Button lag has been addressed in at least 8 perf commits (Jul 4 – Jul 28). **No new lag fixes or reports since 2026-07-28** (PR #95). GitHub issues: none exist (0 total). Since then, ~8 feature commits (QIE v110–v113, patterns 142→151, badges) touched `src/client` — a regression risk, as the engine grew after the last perf pass.

Note: `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, cited in be3e8fa, is not in the repo (never committed).

## Root-cause history (already fixed)
| Commit | Date | Cause fixed |
|---|---|---|
| bd9ef2a | 07-04 | New `AudioContext` per click threw → Planner state never updated |
| 863b333 | 07-18 | Unbounded `/api/logs`, 30–60s stats polling |
| b219cc3 | 07-18 | `analyzeIntentions()`/`recomputeAssembly()` (atom writes) inside `useMemo` → render-phase cascades |
| ee88f4c | 07-19 | Permanently-mounted System widgets ran intervals off-tab; `recordSignal` stringified ≤1000 signals synchronously |
| 6e5007a | 07-19 | Render-phase atom write in PatternRecognitionWidget; ungated intervals |
| b46f1ac | 07-25 | System tab unmounted when inactive (`unmountWhenInactive`) |
| be3e8fa (#94) | 07-28 | MemoryWidget render-phase write; SystemProgressWidget click handler ran pattern scan synchronously |
| 9364aba (#95) | 07-28 | Unmemoized sort of 1000 signals / cohort calcs per render |

## Suspected remaining causes (by likelihood)
1. **Fan-out from `intentionEngine` atom.** Every `recordSignal` (~100 call sites in `src/client/stores/intentionEngine.ts`, ~20 components) re-renders all subscribers. Fixes so far memoize individual widgets rather than narrowing subscriptions (e.g. `useStore(atom, {keys})` or selectors).
2. **`analyzeIntentions()` growth.** One synchronous function (`intentionEngine.ts:258`) scanning all patterns, now ~151 (was ~125 at ee88f4c). It runs deferred via `requestIdleCallback`, but still blocks the main thread when it fires (also in the 30-min QOS monitor, `intentionEngine.ts:~5129`, and on mount). Each new pattern adds cost; no budget/benchmark guards this.
3. **`recordSignal` itself on the click path.** Still does array copy + filter (+ sort when at MAX_SIGNALS=1000) synchronously before `intentionEngine.set`, which then notifies subscribers synchronously.
4. **Always-on timers**: `breathe.ts:112` (100 ms setState loop while enabled), `TimeWidget.tsx:113` (1 s), `sound.ts:384` (10 s), `MicroCalculatorWidget.tsx:71` (10 s), `QuantumRandomWidget.tsx`, `System.tsx:98` (500 ms animation). Not gated on `isRouteActive`.
5. **CSS**: `Button.tsx` uses `transition-all` on light primary buttons (layout-affecting props animate) and `grid-fill-hover::before` (`index.css:~102`) with `will-change: opacity` on every button — many buttons = many composited layers. Minor, unlikely primary cause.
6. **Other tabs stay mounted (`display:none`)** — only System unmounts; other heavy tabs may still subscribe.

## Next steps
1. Capture a real Chrome Performance trace (click → next paint, INP) on System, Log and Planner with a seeded 1000-signal store; the Jul 28 headless harness (mentioned in 9364aba) was not committed — commit it as a regression test.
2. Add `performance.mark` around `analyzeIntentions` and `recordSignal`; log when >50 ms.
3. Change subscribers to selector-based subscriptions; batch/defer `intentionEngine.set` in `recordSignal`.
4. Chunk `analyzeIntentions` (or move to a Web Worker); add a pattern-count perf budget to the benchmark gate.
5. Gate the timers in item 4 on `isRouteActive`/`document.hidden`; replace `transition-all` with specific properties.
6. Ask the user for the specific tab/button/device where lag persists — no reports exist in the repo.
