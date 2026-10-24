# Button Lag & Rendering Investigation — 2026-10-24

Scheduled, read-only code investigation. No runtime profiling was possible (no browser/prod access in this session).

## Summary
Button lag has been addressed by a series of perf commits (Jul 2026). No open GitHub issues mention it, and the only matching PR (#94) is closed/merged. The root-cause class was the same each time: **heavy synchronous work (`analyzeIntentions()`, `recomputeAssembly()`, report builders) that either writes nanostores atoms during render or runs inside click handlers**, causing cascading re-renders across `intentionEngine` subscribers.

## Evidence
| Item | Link / ref | Finding |
|---|---|---|
| Issues | search "button lag slow rendering" | 0 results |
| PR #94 | https://github.com/LOT-Systems/LOT-Computer/pull/94 | Merged fix: MemoryWidget render-phase atom write -> `useEffect`; SystemProgressWidget click handler deferred via `setTimeout` |
| PR #95 | https://github.com/LOT-Systems/LOT-Computer/pull/95 | Memoized heavy per-render work in SignalStreamWidget / UserMetricsWidget (commit 9364aba) |
| Earlier | 863b333, b219cc3, 6e5007a, ee88f4c, b46f1ac, bd9ef2a | Capped logs query, moved atom writes out of useMemo, paused off-tab work, unmount inactive System tab, reused AudioContext (Planner buttons frozen) |
| `src/client/utils/perf.ts` | `window.__LOT_PERF__.getEntries()` | INP/LoAF observer exists; logs interactions >200ms. **No collected data is stored in repo.** |
| Referenced doc | `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md` | Cited by be3e8fa but **not present in tree** |

## Remaining suspected causes (ranked)
1. **Regression risk from QIE growth**: patterns went ~139 -> 151+ (v111–v113) after the last perf pass; `analyzeIntentions()` scan cost grows per release and has not been re-measured. `System.tsx:268` runs it on **every `logs` change** (`useEffect([logs])`), plus `recomputeAssembly()`.
2. **Synchronous `analyzeIntentions()` still on interaction paths**: `Logs.tsx:3975` (`/qos` trigger, inline in submit handler), `SystemProgressWidget.tsx:1555` (mount, inline), `intentionEngine.ts:5126/5130` (`startBackgroundQOSMonitor`, runs on timer even when tab hidden — no `document.hidden` guard).
3. **Timers**: `TimeWidget.tsx:113` runs a 1s interval for chime checks; 16 `setInterval`s in components, several lacking `document.hidden` guards (e.g. TimeWidget, QuantumRandomWidget, ChakraErgonomicsWidget, SystemPulseWidget — verify).
4. **Large components**: `System.tsx` (1071 lines, ~16 store subscriptions) and `SystemProgressWidget.tsx` (2513 lines) re-render wholesale on any atom write.
5. CSS: only 4 `transition-all` and 0 `animate-pulse/spin` usages — unlikely cause.

## Next steps
1. Capture real data: load app, reproduce lag, read `window.__LOT_PERF__.getEntries()` and Chrome Performance trace (React Profiler) on the System tab and Logs submit.
2. Benchmark `analyzeIntentions()` at current pattern count with seeded 1000 signals / 500 logs (the harness used for 9364aba); consider running in `requestIdleCallback`/worker and debouncing the `[logs]` effect in System.tsx.
3. Wrap `/qos` handler (`Logs.tsx:3975`) and the SystemProgressWidget mount call in `deferHeavy`.
4. Add `document.hidden` guard to `startBackgroundQOSMonitor` and the 1s TimeWidget interval.
5. Split `System.tsx` store subscriptions into per-widget selectors / `React.memo` children.
6. Restore or recreate the missing BUTTON-LAG-RENDERING-DIAGNOSTIC.md and open a tracking issue with the user's actual device/browser details (none on record).

## Confidence
Cause attribution is from code/commit review only; unverified at runtime.
