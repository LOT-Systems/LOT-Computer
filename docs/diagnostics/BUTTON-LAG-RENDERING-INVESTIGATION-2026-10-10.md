# Button Lag & Rendering Investigation — 2026-10-10

Scheduled, read-only code/history review (no profiler or live user data available in this environment; no GitHub issues were consulted).

## Summary
Button lag has been a recurring theme (Jul 4 – Jul 28). Every instance traced to the same root pattern: **the `intentionEngine` nanostore (`src/client/stores/intentionEngine.ts`) is written to synchronously (during render, in click handlers, or on intervals), and ~7 System-tab widgets subscribe to it and redo heavy un-memoized work on every write.** Seven perf passes have addressed individual paths; no commits since 2026-07-28 touch this, and no open lag report was found in the repo after that date.

## History (commits)
| Date | Commit | Fix |
|---|---|---|
| 07-04 | bd9ef2a | Planner buttons froze: `new AudioContext()` per click threw at browser cap → shared context + try/catch |
| 07-04 | 89da563 | Logs mouse-inactivity timer set `pointer-events-none` on nav across all tabs |
| 07-18 | 863b333 | Unbounded `/api/logs` (LIMIT 500), stats polling 30–60s→120s, no background polling |
| 07-18 | b219cc3 | `analyzeIntentions()`/`recomputeAssembly()` (atom writes) inside `useMemo` in System.tsx → `useEffect` |
| 07-19 | ee88f4c | Gated 60s/10s System intervals on `isRouteActive`; `recordSignal` persist coalesced, analysis via `requestIdleCallback` |
| 07-19 | 6e5007a | PatternRecognitionWidget render-phase store write; 3 ungated intervals |
| 07-25 | b46f1ac | System tab unmounts when inactive (`TabPanel unmountWhenInactive`, app.tsx:187) |
| 07-28 | be3e8fa | MemoryWidget render-phase atom write; SystemProgressWidget click handler ran full scan synchronously |
| 07-28 | 9364aba | Memoized SignalStream sort (1000 signals) and UserMetrics index/cohort work |

Note: be3e8fa cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, which is **not in the repo** (never committed on any branch). Its findings survive only in the commit message.

## Suspected remaining causes (from current code)
1. **Background QOS monitor runs heavy work on the main thread, ungated.** `startBackgroundQOSMonitor()` (intentionEngine.ts ~5122) calls `analyzeIntentions()` + `captureQOSSnapshot()` synchronously on mount and each interval, with no `isRouteActive`/`document.hidden` check and no idle deferral. Any click landing during it stalls. It is started from `SystemProgressWidget.tsx:1571` and stopped on unmount, so since b46f1ac it only runs while System is open — but while System is open it still blocks clicks.
2. **Synchronous `analyzeIntentions()` still in handlers:** `Logs.tsx:3975` (`/qos` trigger) and `SystemProgressWidget.tsx:1555` (mount effect). Same class as the fix in be3e8fa, not yet applied there.
3. **Store fan-out remains the architecture.** Subscribers: QuantumStateWidget, PatternRecognitionWidget, SystemPulseWidget, QuantumEngineWidgets, UserMetricsWidget, AIFeedbackWidget, SignalStreamWidget. Any `recordSignal` (from any tab) re-renders all mounted ones. Unmounting off-tab hides this, but **on the System tab every button press that records a signal re-renders all seven**, and most remain un-memoized (only SignalStream/UserMetrics/PatternRecognition were fixed).
4. **Mount cost on tab switch:** System mount measured at ~118 ms (9364aba) and Logs.tsx is 4.5k lines, System/SystemProgressWidget 1–2.5k lines each with large inline data; remounting System on every visit repeats this.
5. **Global handlers:** `useMouseInactivity` adds a `document` `mousemove` listener that clears/sets a timer on every move (hooks.ts:125); cheap, but combined with callback state changes can re-render Logs. `TimeWidget` runs a 1s interval (`checkHour`) that stays mounted.
6. **Minor inconsistency:** System.tsx:199 comment says the 15-min astrology tick is paused off-tab but only checks `document.hidden` (harmless now that System unmounts).
7. CSS: only 4 files use `transition-all`; no `backdrop-blur`. Not a likely cause.

## Next steps
1. Profile on a real device (Chrome Performance, 4x CPU throttle): click buttons on System with 1000 signals/500 logs seeded; look for long tasks tied to `analyzeIntentions`, `captureQOSSnapshot`, `recomputeAssembly`.
2. Confirm where `startBackgroundQOSMonitor` is called; gate on `isRouteActive('system')` and wrap in `requestIdleCallback`.
3. Defer `analyzeIntentions()` in `Logs.tsx:3975` like be3e8fa did.
4. Replace whole-atom `useStore(intentionEngine)` with `useStore(atom, {keys})`/selectors or `React.memo` on the remaining subscribers.
5. Add React Profiler / `performance.measure` around recordSignal and capture a baseline; check users' reports (issues tracker) for post-07-28 lag.
6. Recover/recommit the missing BUTTON-LAG diagnostic doc.
