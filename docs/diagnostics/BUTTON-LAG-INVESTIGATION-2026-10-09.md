# Button Lag & Rendering Investigation — 2026-10-09

Automated routine ("Button lag investigation"). Static review only: no live profiling or user reports were available.

## Summary
Button lag has been a recurring problem, and one cause keeps showing up: **heavy synchronous work in `intentionEngine`, run in a click handler or render phase, that then re-renders every subscriber.** Four perf passes have landed since late July. No open issue reports lag now; the issue search returned 0 results.

## Prior fixes (history)
| Commit / PR | Fix |
|---|---|
| `bd9ef2a` | Planner buttons frozen: reuse AudioContext |
| `863b333`, `b219cc3` | Cap logs query, back off stats polling, move quantum state writes out of `useMemo` |
| `ee88f4c`, `6e5007a`, `b46f1ac` | Pause or unmount the System tab off-tab (tab-switch stall) |
| `be3e8fa` (PR #94) | MemoryWidget render-phase `analyzeIntentions()` moved to `useEffect`; SystemProgressWidget report click handler deferred one macrotask |
| `9364aba` (PR #95) | Memoized the sort in SignalStreamWidget and the cohort work in UserMetricsWidget |

`be3e8fa` cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`. That file is **not in the repo**, so the original diagnostic is lost.

## Current state: suspected causes
1. **`analyzeIntentions()` keeps getting heavier.** It scans the patterns on the main thread and writes the atom. Since PR #95, `src/client/stores/intentionEngine.ts` grew by about 537 lines (QIE v111 to v113, now 151 patterns and 6.5k lines). The ~118 ms System mount measured in PR #95 predates that growth, so it is likely higher now.
2. **Synchronous callers are still left.**
   - `Logs.tsx:3975` runs `/qos` as `analyzeIntentions()` inside the submit handler.
   - `SystemProgressWidget.tsx:1555` and `:1629` also call it directly. The `be3e8fa` deferral covers only the report handler.
   - `startBackgroundQOSMonitor()` at `intentionEngine.ts:5126` runs it on the main thread at startup and every 30 minutes. The 30-minute run can land mid-click.
3. **Every atom write re-renders all `intentionEngine` subscribers.** `System.tsx` (1071 lines, 27 hooks) subscribes to the atom. Selectors or atom splitting would limit that.
4. **Many `setInterval` widgets.** 14 components use it, including Clock, TimeWidget, SystemPulse, QuantumRandom and MicroGame. Whether each pauses when hidden or off-tab is unverified.
5. **Hot spots not ruled out.** There are 5 files with `transition-all` or `animate-*` classes, and `Logs.tsx` is very large.

## Next steps
1. Run `analyzeIntentions` in an idle callback or chunked pass, or in a Web Worker. At the least, apply `deferHeavy` to the `Logs.tsx` and `SystemProgressWidget` callers.
2. Profile with `src/client/utils/perf.ts` (INP and long-animation-frame observer). Collect `[Perf] Slow interaction` logs from real devices to find which buttons lag.
3. Re-run the headless-Chromium harness from PR #95 (1000 signals, 500 logs) against the current HEAD.
4. Audit the `setInterval` widgets for visibility and off-tab pausing.
5. Recreate the lost diagnostic doc if the earlier findings are still wanted.
6. Ask the user which button or tab lags, and on which device, since no report exists.

## Caveat
These causes come from static analysis and git history. Nothing was profiled, so none is confirmed.
