# Button Lag & Rendering — Investigation (scheduled run, 2026-10-22)

Branch: `claude/brave-rubin-a5rfcw` · HEAD `98971f2` (2026-08-05). Static review only: no profiler, no browser run, no user telemetry in this session.

## Summary
Button lag in LOT Computer has been traced repeatedly to **one root pattern**: the `intentionEngine` nanostore atom is written (via `analyzeIntentions()` / `recordSignal`) in render phase or synchronously in click handlers. Every subscriber widget then re-renders and redoes heavy work on the main thread. Five perf passes have shipped; no open GitHub issues mention lag (search returned 0 results). No new fix is pending in the tree.

## Evidence (commit history)
| Commit | Fix |
|---|---|
| `863b333` | Capped logs query, backed off stats polling |
| `b219cc3` | Moved quantum state writes out of `useMemo` |
| `ee88f4c` | Paused System background work off-tab |
| `6e5007a` | Stopped render-phase atom write + off-tab churn |
| `b46f1ac` | Unmount System tab when inactive (tab-switch freeze) |
| `be3e8fa` (PR #94) | `MemoryWidget` store write moved to `useEffect`; `SystemProgressWidget` report build deferred a macrotask |
| `9364aba` (PR #95) | Memoized sort of up to 1000 signals (`SignalStreamWidget`), `UserMetricsWidget` cohort calc; System mount ~118 ms |

Note: `be3e8fa` cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, which is **not in the repo** (never committed). Its findings survive only in commit messages.

## Suspected remaining causes (unverified)
1. **Synchronous `analyzeIntentions()` in handlers**: `Logs.tsx:3975` (`/qos`, `/assembly`), `SystemProgressWidget.tsx:1555`, `System.tsx:268`. ~139+ pattern scan; the 5-min cooldown only helps on a hit.
2. **Component size**: `System.tsx`, `Logs.tsx`, `SystemProgressWidget.tsx`, `About.tsx` are very large single components (see `wc -l`); any state change re-renders a lot. `About.tsx` is mostly static text but grows each release.
3. **Many `setInterval`s** (14 files, e.g. `SystemPulseWidget`, `QuantumRandomWidget`, `TimeWidget`, `Clock`, `ContextualPromptsWidget`). Each tick can set state and re-render; confirm they pause when tab/page hidden.
4. **CSS**: `.grid-fill-hover::before` (`src/client/index.css:102`) paints a gradient layer with `opacity` transition on every primary button in dark theme; `transition-all` on light primary buttons (`Button.tsx:77`). Cheap individually; costly when many buttons are visible or on low-end mobile. `Button` also subscribes to `stores.theme` per instance.
5. **Service worker/PWA cache** (`public/sw.js`) can leave clients on stale, pre-fix bundles until `CACHE_VERSION` bump + reload.

## Next steps
1. Reproduce with Chrome Performance profile on System ↔ Log switching and button clicks using a heavy account (≥1000 signals, ≥500 logs); record long tasks and INP.
2. Add INP/long-task reporting (`PerformanceObserver`) to get real user data.
3. Wrap remaining `analyzeIntentions()` call sites in `useEffect`/`setTimeout(0)` or move to a worker; audit all `useStore(intentionEngine)` consumers for `useMemo`/selectors (nanostores `useStore(atom, {keys})` or computed atoms).
4. Gate intervals on `document.visibilityState`.
5. Split `System.tsx`/`Logs.tsx`; lazy-load `About`.
6. A/B test removing `grid-fill-hover` and `transition-all` on a low-end device.
7. Restore the missing diagnostic doc, or keep this file as its successor.
