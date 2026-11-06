# Button Lag & Rendering Investigation — 2026-11-06

Scheduled, read-only investigation (code + git history + GitHub). No runtime profiling was possible in this environment, so findings are static-analysis and history based.

## Summary

Button lag has been addressed through a **series of 9 perf/fix commits (2026-07-04 → 2026-07-28)**. The recurring root cause is **CPU fan-out from the `intentionEngine` nanostore**: any write re-renders every mounted subscriber widget, and several widgets did heavy work (or *wrote the atom*) during render or inside click handlers. No open GitHub issues exist for lag, and no open PR touches the performance paths. No lag-related commits landed after 2026-07-28 (HEAD work is badges/wiki docs only), so the last fixes appear to be holding, but there is no field verification in the repo.

**Note:** commit `be3e8fa` cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md` as its source, but that file is **not in the repo** (never committed). Its findings survive only in the commit message.

## Timeline of related changes

| Date | Commit | Cause found / fix |
|---|---|---|
| 07-04 | `bd9ef2a` | Planner buttons froze: new `AudioContext` per click hit browser cap, threw before state update. Now shared + try/catch (`stores/plannerWidget.ts:244-261`). |
| 07-04 | `89da563` | Logs mouse-inactivity timer kept running while hidden, adding `pointer-events-none` to nav on all tabs. |
| 07-18 | `863b333` | Unbounded `/api/logs` + 30–60s polling → DB starvation (~1 min widget delay). Added LIMIT 500, 120s polls. |
| 07-18 | `b219cc3` | `analyzeIntentions()`/`recomputeAssembly()` (atom writes) inside `useMemo` in `System.tsx` → render-phase cascades. Moved to effect. |
| 07-19 | `ee88f4c` | Hidden-but-mounted tabs kept running intervals; added `stores.isRouteActive()`; deferred persist + `analyzeIntentions` in `recordSignal`. |
| 07-19 | `6e5007a` | `PatternRecognitionWidget` wrote atom during render; 3 ungated intervals. |
| 07-25 | `b46f1ac` | System tab now fully unmounts when inactive (`entries/app.tsx` `unmountWhenInactive`); SW cache bumped. |
| 07-28 | `be3e8fa` (PR #94) | `MemoryWidget` render-phase atom write; `SystemProgressWidget.handleGenerateReport` ran ~139-pattern scan synchronously in click handler (now `setTimeout 0`). |
| 07-28 | `9364aba` (PR #95) | `SignalStreamWidget` sorted 1000 signals per render; `UserMetricsWidget` unmemoized derivations. 5 rapid tab switches: heavy task per switch → one ~118ms mount. |

## Suspected remaining causes (ranked)

1. **Other click-path synchronous engine calls.** `Logs.tsx:3975` calls `analyzeIntentions()` directly (log triggers `/qos`, `/assembly`); `System.tsx:268-269` and `QuantumEngineWidgets.tsx:264` call engine writes in effects on mount. Any handler doing sync engine work repeats the `handleGenerateReport` pattern. Audit every `onClick` / `onSubmit` that reaches `recordSignal*`/`analyzeIntentions`.
2. **Other tabs remain permanently mounted** (`display: contents/none` TabPanel). Only System opts into unmount. Logs (4,506 lines, subscribes to `logById`/`logIds`) and other tabs still re-render on store changes while hidden. Logs' own hidden timer already caused one bug (`89da563`).
3. **Always-on intervals not gated by `isRouteActive`** (only 8 usages vs 26 `setInterval` sites): `TimeWidget.tsx:113` (1s), `utils/breathe.ts:112` (100ms), `QuantumRandomWidget.tsx:39,65`, `MicroCalculatorWidget.tsx:71` (10s), `MicroGameWidget.tsx:790`, `intentionEngine.ts:5129` (30-min QOS monitor), `utils/sound.ts:384` (10s). Each is a main-thread wake-up and potential `setState` re-render; verify which ones set state when not visible.
4. **Mega-components.** `SystemProgressWidget.tsx` (2,513 lines, large inline static data arrays re-created per render?), `Logs.tsx`, `About.tsx` (4,889 lines). Large render bodies amplify any extra re-render.
5. **Button styling.** `ui/Button.tsx` is already store-isolated per kind (good). Light theme uses `transition-all` and `grid-fill-hover` is used on dark; `relative overflow-hidden` + pseudo-element backgrounds are low risk but unprofiled. Low priority.
6. **Network/DB.** Polling was backed off, but only the logs query was capped; verify other list endpoints are bounded.

## Next steps

1. Re-create the missing diagnostic file or record its contents; commit profiling harness (the headless-Chromium seeded-signals harness used for `9364aba` is not in the repo).
2. Capture a real Chrome Performance trace with a seeded account (1000 signals / 500+ logs) while clicking buttons on Log, Planner, Memory, System; look for long tasks (>50ms) and INP > 200ms. Add `web-vitals` INP reporting to collect field data.
3. Add a dev-only warning when an atom `.set` occurs during React render (would have caught `b219cc3`, `6e5007a`, `be3e8fa`).
4. Audit click handlers for synchronous engine calls (cause 1) and gate/pause the intervals in cause 3 with `isRouteActive`.
5. Consider `unmountWhenInactive` for Logs, or `React.memo` + selector-based subscriptions (`computed`/`useStore(store,{keys})`) for engine consumers.
6. Ask the reporter for specifics (which button, which tab, device, time-since-load); there are zero open issues with this info.

## Open items checked
- Open issues: none. Open PRs: #97 (docs/wiki), #93 (calendar feature, adds a toast polling the Log feed — watch for extra poll cost). Neither is a perf fix.
