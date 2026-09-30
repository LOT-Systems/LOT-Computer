# Button Lag / Rendering Investigation — 2026-09-30

Scheduled routine "Button lag investigation". Static review only: no runtime profiling was possible in this environment, and no live user data was available.

## Summary

Button lag has been a recurring problem (about 10 perf commits between June and July 2026). Every pass so far found the same root cause: **heavy or store-writing work on the main thread, triggered by a click or by a render.** The main source is the `intentionEngine` nanostore (`src/client/stores/intentionEngine.ts`, 6.5k lines, `analyzeIntentions()` scans about 139 patterns). The last two fixes (PR #94, PR #95, 2026-07-28) closed the paths they found. **No open GitHub issues** exist for lag in `LOT-Systems/LOT-Computer`. There are no new lag commits since 2026-07-28, so the lag may be resolved. I cannot confirm that without field data.

## Evidence reviewed

| Area | Commit / PR | Finding and fix |
|---|---|---|
| Widget lag | `863b333` | Capped the logs query and backed off stats polling |
| Render pipeline | `b219cc3` | Moved quantum state writes out of `useMemo` |
| Planner buttons frozen | `bd9ef2a` | New `AudioContext` created per click. Now reused, and sound errors are caught |
| Tab switch freeze | `ee88f4c`, `6e5007a`, `b46f1ac` | Paused System background work off-tab, stopped a render-phase atom write, and unmounted the System tab when inactive |
| Residual button lag | `be3e8fa` (PR #94) | `MemoryWidget` ran `analyzeIntentions()` (a store write) inside `useMemo`, which caused a cascade of re-renders. `SystemProgressWidget.handleGenerateReport` ran the full analysis synchronously in the click handler. Both fixed |
| Per-render heavy work | `9364aba` (PR #95) | `SignalStreamWidget` sorted 1000 signals on every render, and `UserMetricsWidget` did not memoize its index and cohort work. Both fixed. Measured about 118 ms for a one-time System mount, and cheap after that |
| Crash | `f4ca5a3` | "Cannot access 'userState' before initialization" (prod down). Not lag, but it came from the same refactors |

A client-side INP observer exists in `src/client/utils/perf.ts`. It console-warns on interactions over 200 ms, but it only logs to the console and **nothing reports it to a server**, so there are no field metrics.

`docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md` is referenced by commit `be3e8fa` but **is not present in any branch or in history**. That diagnosis was never committed.

## Suspected remaining causes (ranked)

1. **Synchronous `analyzeIntentions()` callers in the interaction path.**
   - `Logs.tsx:3975`: the `/qos` trigger calls it directly in the submit handler, which is the same pattern fixed in `SystemProgressWidget`.
   - `SystemProgressWidget.tsx:1555` and `:1629`: verify that both are deferred.
   - `System.tsx:268`: verify that it runs in an effect and not during render.
   - `stores/intentionEngine.ts:5126` and `:5130`: the background monitor (30-minute interval) runs the analysis plus a snapshot on the main thread. A click that lands during the run will stall.
2. **Store fan-out.** Any `intentionEngine` write re-renders every subscriber. The fixes so far memoize individual widgets but do not reduce the fan-out. A new widget that subscribes without memoization brings the problem back.
3. **Giant components.** `Logs.tsx` has 4.5k lines, `About.tsx` 4.9k and `System.tsx` 1k. `Logs.tsx` subscribes to `logById` and `logIds`, so any log change re-renders the whole tree. There are about 20 files with `setInterval` (for example `System.tsx`, `SystemPulseWidget`, `TimeWidget`, `Clock`, `MicroGameWidget`), each of which can cause periodic re-renders or long tasks.
4. **`sound.ts`.** Click sounds are a past freeze source. Confirm that the `AudioContext` is still reused and that the `resume()` call cannot block a handler.
5. **CSS.** Only about 5 uses of `transition-all`, `backdrop-blur` or `animate-*` turned up, so this is a low-probability cause.

## Next steps

1. **Collect field data.** Report the INP and long-animation-frame entries from `perf.ts` to the server, tagged by route and target. This is the main gap.
2. **Profile in a browser.** Use a Chromium trace with realistic data (about 1000 signals and 500 logs, as in the PR #95 harness) on these flows: Logs submit with `/qos`, generate report, and Memory question load.
3. **Defer the remaining synchronous `analyzeIntentions()` callers.** Use `deferHeavy` or a macrotask, starting with `Logs.tsx:3975`.
4. **Move analysis off the main thread.** Run `analyzeIntentions()` in a Web Worker, or chunk it with `scheduler.yield`.
5. **Split the atom or use selectors** so widgets subscribe only to the keys they render. Add a lint rule or test against atom writes inside `useMemo` or render.
6. **Ask for user reports.** None were found, and it is unclear which button or screen was laggy after 07-28. Ask for device, tab, and whether the lag is on the first click or after idle.
