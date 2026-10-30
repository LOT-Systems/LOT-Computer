# Button Lag & Rendering Investigation — 2026-10-30

Scheduled routine "Button lag investigation". Static review only (no live profiling).

## Summary

Button lag has been addressed in six perf commits (Jul 24 – Jul 28). No lag or perf issue
is open on GitHub (issue search returned 0 hits) and no commits since Jul 28 touch perf or
`Button.tsx`. Open PRs (#93 calendar toast, #97 wiki v88) are not perf-related. The cause was
the intentionEngine nanostore: `analyzeIntentions()` writes the store, and any write
re-renders every subscriber, so heavy or render-phase calls froze the UI.

## Fixes already landed

| Commit | Fix |
|---|---|
| b219cc3 | Moved quantum state writes out of `useMemo` |
| ee88f4c | Paused System background work off-tab |
| 6e5007a | Stopped render-phase atom write + off-tab churn (tab-switch stall) |
| b46f1ac | Unmount System tab when inactive |
| be3e8fa (PR #94) | `MemoryWidget` store write moved to `useEffect`; `SystemProgressWidget` report click deferred one macrotask |
| 9364aba (PR #95) | Memoized `SignalStreamWidget` sort (1000 signals) and `UserMetricsWidget` index/cohort work. 5 rapid tab switches dropped to one ~118ms mount |

## Button component review (`src/client/components/ui/Button.tsx`)

Healthy. `secondary` has no store subscription; `primary` subscribes only to `stores.theme`;
`secondary-rounded` only to `stores.isMirrorOn`. Not a re-render source.
Hover uses `.grid-fill-hover::before` (`src/client/index.css:102-160`): an opacity transition
(180ms) on a pseudo-element with gradient backgrounds. Compositor-friendly, but the large
`repeating-linear-gradient` density variants may repaint on low-end devices.

## Remaining suspects (unverified)

1. **`analyzeIntentions()` on interaction paths.** Still called synchronously in
   `Logs.tsx:3975` (`/qos` trigger), `System.tsx:268`, `SystemProgressWidget.tsx:1555/1629`,
   and by `startBackgroundQOSMonitor()` every 30 min (`intentionEngine.ts:5120`). Each is a
   ~150-pattern scan plus store write, with all subscribers re-rendering.
2. **Giant components.** `Logs.tsx` (4506 lines), `SystemProgressWidget.tsx` (2513),
   `System.tsx` (1071): any state change re-renders large trees; few visible memo boundaries.
3. **Always-on timers.** `TimeWidget.tsx:113` checks every 1s; ~18 `setInterval` usages in
   client code, not all gated on `document.hidden` (`System.tsx:199` is).
4. **Missing referenced diagnostic.** Commit be3e8fa cites
   `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, which is not in the repo
   (`docs/diagnostics/` has no such file). The original evidence is not preserved.
5. **Perf observer data not collected.** `src/client/utils/perf.ts` logs INP > 200ms and
   long animation frames to the console only; nothing is aggregated or shipped.

## Next steps

1. Ask the reporter for the repro: which button, which tab, device/browser, and whether it
   still happens after the Jul 28 deploy (PRs #94/#95).
2. Capture a Chrome Performance profile or read the `[Perf] Slow interaction` console warnings on the affected tab.
3. Defer `analyzeIntentions()` in `Logs.tsx:3975` and other click paths (`setTimeout 0` /
   `requestIdleCallback`), as done in be3e8fa.
4. Convert `intentionEngine` subscribers to `useStore(atom, { keys })` or selector atoms so
   pattern-only writes don't re-render everything.
5. Gate `TimeWidget` 1s timer and other intervals on `document.hidden`.
6. Test on a low-end device with `.grid-fill-hover` density variants disabled to rule out paint cost.
7. Optionally pipe `perf.ts` INP entries to the server for real-user metrics.

No clear active cause was found in code; remaining items need runtime profiling.
