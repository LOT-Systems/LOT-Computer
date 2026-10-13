# Button Lag / Rendering Investigation — 2026-10-13

Automated routine run ("Button lag investigation"). Static review only: no runtime profiling was possible in this environment.

## Summary
- No open issues or user reports on button lag. A GitHub issue search returned 0 results.
- The only related PR is #94, "perf: fix two residual button-lag paths" (merged). PR #95 followed it.
- Four perf commits have landed since 2026-07-25. No perf commits and no new lag reports since.
- `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md` is cited in `be3e8fa`, but it is **not in the repo**. Either it was never committed or it was removed. The original diagnostic evidence is lost.
- No profiling data or metrics are stored in the repo. The only measurement on record is the ~118ms System mount in the `9364aba` message.

## Past fixes (already applied)
| Commit | Fix |
|---|---|
| `b46f1ac` | System tab now unmounts when inactive (`TabPanel unmountWhenInactive`, `src/client/entries/app.tsx`). It was stopping background re-renders from intentionEngine writes. |
| `be3e8fa` (PR #94) | MemoryWidget: `analyzeIntentions()` moved out of `useMemo` (a render-phase store write) into `useEffect`. SystemProgressWidget `handleGenerateReport` deferred with `setTimeout(0)`. |
| `9364aba` (PR #95) | Memoized the 1000-signal sort in SignalStreamWidget. Memoized `getUserIndex`/`classifyPhysiologicalCohort` in UserMetricsWidget. |
| `intentionEngine.ts` `schedulePersist` | Coalesced localStorage writes at 250ms instead of stringifying up to 1000 signals per call. |

## Suspected remaining causes (not verified at runtime)
1. **The `intentionEngine` store is the fan-out point.** About 36 components reference it, and the file is 6.5k lines. Any `recordSignal` or `analyzeIntentions` write re-renders every subscriber. The fixes so far memoize individual widgets rather than narrowing subscriptions. Selector-level subscriptions are the structural fix.
2. **Synchronous heavy work in click handlers.** Only `handleGenerateReport` was deferred. Other handlers that call `analyzeIntentions()` or `recordSignal` inline are unaudited, notably in `SystemProgressWidget.tsx` (2.5k lines) and `System.tsx` (1k lines).
3. **Recurring timers.** About 15 `setInterval` timers run across components. Some are gated on `document.hidden` or `isRouteActive('system')` (e.g. `SystemProgressWidget.tsx:1557`). Others are not: `TimeWidget.tsx:113` (1s), `QuantumRandomWidget.tsx`, `ChakraErgonomicsWidget.tsx`, `ContextualPromptsWidget.tsx` and `MicroGameWidget.tsx:790`. Each one forces a render while its component is mounted.
4. **Bundle growth.** Each Badge/QIE release adds code. `badges.ts` gained 1170 lines and `easter-eggs.ts` 307 lines in `91e3648`. Badge evaluation cost per signal is unmeasured.
5. **CSS.** `transition-all`/`will-change` appear in only 5 places and animation classes in ~19, so CSS is a low-probability cause.

## Next steps
1. Reproduce on a real device with a Chrome Performance trace. Click each button, and check for long tasks or INP > 200ms. Seed 1000 signals + 500 logs, as `9364aba` did.
2. Restore or recreate the missing diagnostic doc.
3. Audit click handlers for synchronous `analyzeIntentions`/`recordSignal`/badge-evaluation calls, and defer them.
4. Move high-fan-out widgets to selector-based subscriptions, or split the atom into signals vs. derived patterns.
5. Gate the remaining intervals on `document.hidden` and route activity.
6. Add React Profiler render counts, or a dev-only INP logger, so future lag reports come with data.
