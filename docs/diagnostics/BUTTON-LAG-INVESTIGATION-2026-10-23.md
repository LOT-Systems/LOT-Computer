# Button Lag / Rendering Investigation — 2026-10-23

Automated routine ("Button lag investigation"). Static review only: no browser profiling was run and no field perf data (INP logs) was available to this session.

## Summary

Button lag has been fixed in repeated rounds (Jul 4 – Jul 28). Every fix targets the same family of cause: **main-thread saturation from the `intentionEngine` nanostore fan-out** — each store write re-renders all subscribed System widgets, and the work behind those writes (`analyzeIntentions`) is heavy. The last perf commit is `9364aba` (2026-07-28). Since then ~2,500 lines have been added to the same hot path (+537 in `intentionEngine.ts`, +127 in `SystemProgressWidget.tsx`, +42 in `System.tsx`, +21 in `PatternRecognitionWidget.tsx`) with **no perf pass or measurement**. Regression risk is the main concern.

No open GitHub issues exist (0 open), so there are no fresh user reports in the tracker. No `.md` perf profile or INP data is committed.

## Timeline of related commits

| Date | Commit | Change |
|---|---|---|
| 07-04 | bd9ef2a | Planner buttons frozen: new `AudioContext` per click threw once cap hit → shared context + try/catch |
| 07-18 | 863b333 | Cap `/api/logs` at 500, back off stats polling to 120s |
| 07-18 | b219cc3 | Moved store writes (`analyzeIntentions`, `recomputeAssembly`) out of `useMemo` in System.tsx |
| 07-19 | ee88f4c | Gated System intervals on active route (`isRouteActive`); deferred persist + analysis in `recordSignal` |
| 07-19 | 6e5007a | Removed render-phase atom write in PatternRecognitionWidget; gated 3 more intervals |
| 07-25 | b46f1ac | System tab now **unmounts** when inactive (`unmountWhenInactive`, app.tsx:148-187) |
| 07-28 | be3e8fa | MemoryWidget render-phase write → effect; SystemProgressWidget report click deferred a macrotask |
| 07-28 | 9364aba | Memoized sort in SignalStreamWidget and cohort calc in UserMetricsWidget |

Note: `be3e8fa` cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, which is **not in the repo** (never committed). Its analysis is lost; this file partly replaces it.

## Suspected causes (ranked)

1. **`analyzeIntentions()` cost keeps growing, and still runs on the main thread.** `intentionEngine.ts` is 6,503 lines; patterns grew 125 → 151+ (P149–P151 in `d7f076e`). It is deferred via `requestIdleCallback` (`intentionEngine.ts:~190, 236-243`) but a single long task there can still block the next click. It is triggered every 5th signal after a 5-minute cooldown, plus directly from `Logs.tsx:3975`, `MemoryWidget.tsx:274`, `System.tsx:268`, `SystemProgressWidget.tsx:1555,1629`. The final `intentionEngine.set` then re-renders every subscriber.
2. **Subscriber fan-out remains.** 7 components subscribe to `intentionEngine` (QuantumState, PatternRecognition, SystemPulse, QuantumEngineWidgets, UserMetrics, AIFeedback, SignalStream). Any write — including `recordSignal` on every button press — re-renders all of them while System is open. Only two were memoized (9364aba); the rest were not audited.
3. **Unreviewed additions since the last fix** (`SystemProgressWidget.tsx` +127, `PatternRecognitionWidget.tsx` +21, `QuantumEngineWidgets.tsx` +15, System.tsx `getCircadianPhase()` called inline in render, new astrology 15-min tick/effect with `localStorage` read). `recordAstrologySignal` and new P143–P151 handlers add more writes to the same atom.
4. **System remount cost.** Unmounting System (b46f1ac) fixed background churn but moves the cost to tab entry (measured ~118 ms one-time mount in 9364aba; likely higher now with more widgets and 812 badges in `badges.ts`).
5. **Other tabs stay mounted** (`display: contents/none`) — Logs.tsx is very large; its own state updates and `analyzeIntentions` call (line 3975) are untested for off-tab work.
6. **Lower likelihood:** `recordSignal` copies and filters the signal array (≤1000) per call; `schedulePersist` JSON-stringifies up to 1000 objects every 250 ms burst; sound/AudioContext (fixed in bd9ef2a, only `plannerWidget.ts` and `sovietChime` use it).

CSS animation/backdrop-filter was grepped in `src/client` and `public`; no clear culprit was found, but this was not profiled.

## Next steps

1. **Profile before changing code.** Record a Chrome Performance trace on System with 1000 seeded signals + 500 logs; click widget buttons and look for long tasks. `src/client/utils/perf.ts` already logs INP > 200 ms and long animation frames to the console — collect these from a real device (the PWA) and check them.
2. **Time `analyzeIntentions()`** with `performance.measure` and log it; if > 50 ms, move it to a Web Worker or chunk it across idle slices (`scheduler.yield`).
3. **Cut fan-out:** replace whole-atom `useStore(intentionEngine)` with `useStore(intentionEngine, { keys: [...] })` or split atoms (signals / patterns / userIndex); skip `set` when patterns are deep-equal.
4. **Audit the post-07-28 diffs** (`git diff 9364aba HEAD -- src/client`) for render-phase writes and un-memoized derived work, especially SystemProgressWidget and PatternRecognitionWidget.
5. **Add a perf budget to the benchmark gate** (e.g. headless-Chromium script from 9364aba: 5 rapid System↔Logs switches, fail on any task > 100 ms).
6. **Restore the missing `BUTTON-LAG-RENDERING-DIAGNOSTIC.md`** if it exists elsewhere, and ask for a concrete repro (which button, which tab, device) since no open issue describes the current symptom.
