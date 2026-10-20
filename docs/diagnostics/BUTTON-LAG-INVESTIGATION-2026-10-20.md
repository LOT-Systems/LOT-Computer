# Button Lag / Rendering Investigation — 2026-10-20

Automated routine run ("Button lag investigation"). Static review only: no live profiling or user-report data was available in the repo or issue tracker.

## Summary
- No open or closed GitHub issues match button lag / freeze / rendering. Only open PR is #93 (calendar), which is unrelated.
- Button lag has been handled through a series of perf commits (July 2026). The latest was 2026-07-28.
- `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md` is cited by commit `be3e8fa` but is not in the repo, so its original evidence is lost.
- Since the last perf fix (`9364aba`), the QIE (`intentionEngine.ts`) has kept growing: about +537 lines, patterns went from 139 to 151, plus +1170 lines in `badges.ts`. All of it runs inside `analyzeIntentions()` or on System-tab mount. This is the main regression risk.

## Perf history (what's already fixed)
| Commit | Fix |
|---|---|
| bd9ef2a | Planner buttons frozen: reuse AudioContext |
| 863b333 | Cap logs query, back off stats polling |
| b219cc3 | Move quantum state writes out of useMemo |
| ee88f4c / 6e5007a | Pause System background work off-tab; stop render-phase atom write |
| b46f1ac | Unmount System tab when inactive (`unmountWhenInactive`) |
| be3e8fa | MemoryWidget render-phase `analyzeIntentions()` moved to effect; SystemProgressWidget report build deferred one macrotask |
| 9364aba | Memoize SignalStreamWidget sort (up to 1000 signals) and UserMetricsWidget cohort work |

## Suspected causes (ranked)
1. **`analyzeIntentions()` cost growth.** It is a synchronous scan of 151 patterns over up to 1000 signals. It writes the `intentionEngine` atom, which re-renders about 7 subscriber widgets. Call sites: `intentionEngine.ts:243` (deferred via `deferHeavy`), `System.tsx:268` (effect on every `logs` change, synchronous), `SystemProgressWidget.tsx:1555` (mount), `MemoryWidget.tsx:274`, and the click handler (deferred one macrotask only, not chunked). Each new pattern batch (v111–v113) adds to this unprofiled cost.
2. **`System.tsx:268` effect.** It runs `analyzeIntentions()` plus `recomputeAssembly()` synchronously after every `logs` change. This blocks the main thread right after interactions that add logs.
3. **Subscriber re-render fan-out.** `PatternRecognitionWidget`, `QuantumEngineWidgets`, `SystemProgressWidget` (about 127 changed lines) and others re-render on every engine write. `SystemProgressWidget` is the largest, and it has 4 interval/animation hits.
4. **Bundle and parse weight.** `badges.ts` (+1170), `easter-eggs.ts` (+307) and `intentionEngine.ts` (about 5100 lines) inflate the main bundle and first-load parse time.
5. **Minor.** `Button.tsx` is a thin wrapper that uses `useStore`. Its CSS has no heavy transitions. This is unlikely to be the cause.

## Not verified
- No profiling data for the post-July-28 builds. `src/client/utils/perf.ts` logs slow interactions (>200ms INP) and long animation frames to the console only. Nothing is aggregated or sent anywhere.
- Whether the lag is still being reported by users (no issues filed).

## Next steps
1. Reproduce with the headless-Chromium harness used for `9364aba` (1000 signals, 500 logs), measuring button-click INP on the current HEAD.
2. Time `analyzeIntentions()` at 151 patterns. If it takes more than 50ms, chunk it (`scheduler.yield` or `requestIdleCallback`) or move it to a Web Worker.
3. Defer or coalesce the `System.tsx:268` effect (`deferHeavy`, debounce on `logs`).
4. Narrow subscriptions with `useStore(intentionEngine, { keys })` or selectors, so pattern-only writes don't re-render signal-list widgets.
5. Ship `perf.ts` slow-interaction records to the server (or a debug panel) to get real user data.
6. Add a perf budget check (analyzeIntentions ms, bundle size) to the benchmark green gate so pattern growth can't silently regress this.
