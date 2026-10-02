# Button Lag & Rendering Investigation — 2026-10-02

Automated routine run ("Button lag investigation"). Static review only: no live profiling or user-report data was available, and no code was changed.

## Summary

Button lag has been addressed in a series of perf PRs since mid-July. No open issues report lag (GitHub search for lag/slow/performance returned 0 results; the only open PR is #93, calendar, unrelated). The main causes found so far were synchronous work on the click path and render-phase writes to the shared `intentionEngine` atom, which re-rendered every subscribing widget. The latest fixes landed Jul 28. Several structural risks remain and the last 8 days of releases have added to them.

## Fix history (most recent first)

| Commit / PR | Change |
|---|---|
| 9364aba (PR #95) | Memoized heavy per-render work in System subscriber widgets |
| be3e8fa (PR #94) | MemoryWidget: `analyzeIntentions()` moved from `useMemo` to `useEffect`. SystemProgressWidget: report build deferred out of the click handler with `setTimeout(0)` |
| b46f1ac | Unmount System tab when inactive, ending background re-renders from hidden widgets |
| 6e5007a (PR #88) | Stopped render-phase atom write and off-tab churn |
| ee88f4c (PR #85) | Paused System background work off-tab |
| b219cc3 | Moved quantum state writes out of `useMemo` |
| 863b333 | Capped logs query, backed off stats polling |
| bd9ef2a | Planner buttons frozen: reuse AudioContext, catch sound errors |

`src/client/utils/perf.ts` has an INP / long-animation-frame observer that logs slow interactions (>200 ms) to the console. It does not report anywhere, so nothing is collected from real users.

## Suspected causes still open

1. **Shared-atom fan-out.** 7 widgets call `useStore(intentionEngine)` with no selector: QuantumStateWidget, PatternRecognitionWidget, SystemPulseWidget, QuantumEngineWidgets, UserMetricsWidget, AIFeedbackWidget, SignalStreamWidget. Any `recordSignal` re-renders all of them. Selector-based subscriptions (e.g. `useStore(store, {keys})` or computed atoms) would cut this.
2. **Growing synchronous scan.** `analyzeIntentions()` (`src/client/stores/intentionEngine.ts:258`) is a single linear function with about 150 patterns. The engine file is 6.5k lines and grows with each release (QIE v110→v113 added about 120 lines each). The 5-minute cooldown hides the cost until a cache miss. Cache misses happen on first load, on the 30-min monitor, and on any click that reaches it. `SystemProgressWidget.tsx:1555` still calls it synchronously in a mount effect. `startBackgroundQOSMonitor` (~5126) calls it synchronously with no `deferHeavy`.
3. **Release-by-release additions to hot files.** Each QIE benchmark release adds about 40 lines to `SystemProgressWidget.tsx` (now 2.5k lines) and about 100 lines to `Logs.tsx` (4.5k lines). These are mostly static data but cost parse and render time. The badge catalog (`utils/badges.ts`, 8.1k lines, 812 badges) was extended on Aug 3 and 5. Check that badge evaluation does not run on interaction.
4. **Timers.** About 20 `setInterval` sites across components. `TimeWidget` runs a 1 s interval and `System.tsx` a 500 ms one. These should be confirmed paused when the tab or window is hidden.
5. **Fixed doc is missing.** Commit be3e8fa cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, but that file is not in the repo. The original diagnostic should be recovered or its content re-created.

## Next steps

1. Get real data. Ask for the console `[Perf] Slow interaction` output, or add a beacon from `perf.ts` to the server. Record which button, which tab, and which device.
2. Profile in headless Chromium with seeded data (1000 signals / 500 logs, as in the 9364aba harness) after the QIE v113 changes. Compare the tab-switch and click-to-paint times.
3. Add selectors to the 7 `intentionEngine` subscribers, or split the atom.
4. Move `analyzeIntentions()` to a worker or to idle callbacks (`requestIdleCallback`) and chunk the pattern scan. Wrap the remaining direct calls in `deferHeavy`.
5. Lazy-load `badges.ts`, and split the data-heavy parts of `SystemProgressWidget`, `Logs`, and `intentionEngine` with dynamic imports.
6. Audit CSS: `transition-all`, `backdrop-blur`, and animations on frequently re-rendering elements. This was not covered in this run.

## Confidence

Fix-history findings are confirmed from commits. The open-cause list is hypothesis from static reading, not measured.
