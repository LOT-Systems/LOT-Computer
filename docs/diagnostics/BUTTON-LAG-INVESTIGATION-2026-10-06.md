# Button Lag / Rendering Investigation — 2026-10-06

Scheduled routine "Button lag investigation". Static code and history review only; no runtime profiling was possible.

## Summary
Button lag and tab-switch freezes were repeatedly traced to one pattern: **CPU fan-out from `intentionEngine` atom writes**. Many always-mounted System widgets subscribe to that atom, and a write during render, a synchronous heavy scan, or a background interval re-rendered all of them. Seven perf commits (2026-07-18 → 07-28) fixed the known paths. No open GitHub issues mention lag (searched LOT-Systems/LOT-Computer). No reports or profiling data have arrived since 07-28, so the issue is likely resolved but **unverified in production**.

## Fix history (all on master)
| Date | Commit | Cause → fix |
|---|---|---|
| 07-18 | 863b333 | Unbounded `/api/logs` + 30s polling → `LIMIT 500`, polls backed off to 120s |
| 07-18 | b219cc3 | `analyzeIntentions()`/`recomputeAssembly()` (atom writes) inside `useMemo` in System.tsx → moved to `useEffect` |
| 07-19 | ee88f4c | Hidden tabs kept running intervals (`document.hidden` is false for in-app tabs) → `stores.isRouteActive()`; `recordSignal` persistence coalesced, scan via `requestIdleCallback` |
| 07-19 | 6e5007a | PatternRecognitionWidget wrote the atom during render; 3 ungated intervals → memoized / gated |
| 07-25 | b46f1ac | System tab unmounts when inactive (`TabPanel unmountWhenInactive`, `src/client/entries/app.tsx:148`) |
| 07-28 | 9364aba | SignalStreamWidget sorted 1000 signals per render; UserMetricsWidget unmemoized → memoized |
| 07-28 | be3e8fa | MemoryWidget render-phase write; SystemProgressWidget click handler ran a ~139-pattern scan synchronously → effect / deferred a macrotask |

be3e8fa cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`. That file is **not in the repo** (never committed), so this document is its replacement.

## Remaining suspects (not yet fixed)
1. **`analyzeIntentions()` is still a synchronous ~150-pattern scan on several user-triggered paths**: `Logs.tsx:3975` (`/qos` trigger), `SystemProgressWidget.tsx:1554-1555` and `:1629`, and the 30-min `startBackgroundQOSMonitor` interval (`intentionEngine.ts:5126-5130`) which runs it plus `captureQOSSnapshot()` on the main thread. The pattern count keeps growing (P149–P151 in v113), so cost rises with every QIE release.
2. **Pattern count growth is unguarded.** There is no timing budget or test for `analyzeIntentions()`; each new version (v110–v113) adds patterns.
3. **Always-mounted tabs (Logs, Sync, Settings, API) still use `display:none`.** Logs is large (>3900 lines); any `intentionEngine`/log state change re-renders it even when hidden.
4. **Ungated intervals** in components without `isRouteActive`: `TimeWidget.tsx:113` (1s), `ui/Clock.tsx:26`, `MicroGameWidget.tsx:790`. Most are likely System-only and so are now covered by unmounting; verify `ui/Clock` and `TimeWidget` are cheap (1s tick setState).
5. **7 components subscribe to the whole `intentionEngine` store** (QuantumStateWidget, PatternRecognitionWidget, SystemPulseWidget, QuantumEngineWidgets, UserMetricsWidget, AIFeedbackWidget, SignalStreamWidget). Each write re-renders all of them while System is open; selector-based subscriptions (`useStore(store, {keys})` or derived atoms) would cut this.
6. `System.tsx` (1071 lines) mounts every widget at once on tab open (~118 ms measured mount); lazy-mount below-the-fold widgets.

## Next steps
1. Confirm with the owner whether lag still occurs post-07-28 (PWA service worker `CACHE_VERSION` bumped in b46f1ac, so stale clients should have updated). Ask which button and tab.
2. Capture a Chrome Performance profile (click → long task) on System and Logs with 1000 signals / 500 logs; the headless harness used in 9364aba should be committed under `scripts/` so it can be rerun.
3. Move `analyzeIntentions()` off the click path in Logs `/qos` and SystemProgressWidget (defer a macrotask or `requestIdleCallback`), and chunk the pattern scan.
4. Add a perf-budget check (time `analyzeIntentions()` with seeded data) to the benchmark/build gate.
5. Convert the 7 whole-store subscribers to selector subscriptions; gate or unmount hidden Logs work.
