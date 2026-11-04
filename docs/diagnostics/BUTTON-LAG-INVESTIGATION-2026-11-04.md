# Button Lag & Rendering Investigation — 2026-11-04

Scheduled investigation (read-only code/history review; no profiler or live metrics were available in this environment, and no GitHub issues were consulted/filed — evidence below is from git history and source).

## Summary

Button lag in LOT Computer has been a **recurring, single-family problem** since June 2026: *synchronous or render-phase work triggered by `recordSignal` / the `intentionEngine` nanostore, fanned out to many permanently-mounted System widgets.* Eight separate perf passes have each removed one path (below). The last fix (PR #95, 2026-07-28) was verified only in a headless-Chromium harness; **no commit since then touches lag**, and no field confirmation exists in the repo that it is resolved. Since 07-28 the System tab has grown (QIE v111–v113, +P140–P151, badge codices), which re-adds load to the same hot path.

## Timeline of related fixes

| Date | Commit / PR | Cause fixed |
|---|---|---|
| 06-04 | d609978 / LOT-SR-20260604-01 | Biofield button: `recordSignal` ran synchronously |
| 06-22 | 78745c3 / LOT-SR-20260622-01 | Memory button blocked by `recordSignal` |
| 07-04 | bd9ef2a | Planner buttons froze: new `AudioContext` per click hit browser cap, threw before state set |
| 07-04 | 89da563 | Logs mouse-inactivity timer made `#nav` `pointer-events-none` on every tab |
| 07-18 | 863b333 | `/api/logs` unbounded; stats polling 30–60s → DB pool starvation (~1 min widget delay) |
| 07-18 | b219cc3 | `analyzeIntentions`/`recomputeAssembly` (atom writes) inside `useMemo` → render-phase writes |
| 07-19 | ee88f4c, 6e5007a (#85, #88) | Background intervals ran on hidden tabs (`document.hidden` never true for in-app tabs); render-phase write in PatternRecognitionWidget; `recordSignal` persist/analyze made deferred |
| 07-25 | b46f1ac | System tab's ~7 `intentionEngine` subscribers kept re-rendering while hidden → now unmounted when inactive |
| 07-28 | be3e8fa (#94) | MemoryWidget render-phase atom write; SystemProgress click handler ran 139-pattern scan synchronously |
| 07-28 | 9364aba (#95) | SignalStream sorted 1000 signals / UserMetrics recomputed per render |

(Note: `be3e8fa` cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, which is **not present** in the repo.)

## Suspected remaining causes (ranked)

1. **intentionEngine fan-out.** Seven components still `useStore(intentionEngine)` whole-atom: `QuantumStateWidget:27`, `PatternRecognitionWidget:49`, `SystemPulseWidget:46`, `QuantumEngineWidgets:165`, `UserMetricsWidget:31`, `AIFeedbackWidget:26`, `SignalStreamWidget:22`. Every `recordSignal` (which creates a new state object and a new `signals` array of up to 1000 items, `intentionEngine.ts:199-229`) re-renders all of them while System is mounted. Fix direction: `useStore(atom, {keys})`/computed atoms or selectors so each widget only re-renders on the slice it uses.
2. **`recordSignal` still does O(n) work synchronously** (spread + filter, and a sort when >MAX_SIGNALS) before returning (`intentionEngine.ts:213-224`). Only persist/analyze are deferred. Cheap at 1000, but runs on every click.
3. **Remaining synchronous heavy calls in handlers/effects:** `Logs.tsx:3975` (`/qos` → `analyzeIntentions()` inline); `SystemProgressWidget.tsx:1554-1555,1564` (mount + 60s `recomputeAssembly`/`analyzeIntentions`); `intentionEngine.ts:5126-5130` (`startBackgroundQOSMonitor` runs `analyzeIntentions` + snapshot synchronously on start and every interval — not gated by `isRouteActive`); `QuantumEngineWidgets.tsx:264` (`recomputeAssembly` on mount). `analyzeIntentions` now scans 150+ patterns (QIE v113 added P149–P151), so its cost grows with each release.
4. **Rendering cost of System itself.** `System.tsx` is 1071 lines and mounts many widgets; a fresh mount measured ~118 ms (commit 9364aba). Remount on every tab re-entry (b46f1ac trade-off) repeats this cost; tab switches into System may feel like "button lag".
5. **CSS / paint.** `Button.tsx` primary uses `transition-all`; `.grid-fill-hover::before` (`index.css:102-145`) paints repeating gradients/`background-size` layers on a pseudo-element per button, animated via opacity (compositor-friendly, but many on-screen buttons × gradient repaint on resize/theme change). `PrimaryBtn` also subscribes to the `theme` store per button instance. Low probability as a main cause; verify with the Performance panel.
6. **Server/DB.** Earlier lag (863b333) was DB pool starvation; pool was raised to 10 (ed8d148). Any new polling or per-signal server writes (QI signals bulkCreate) could reintroduce it.
7. **Audio.** `plannerWidget.ts:246` now reuses one AudioContext; `sovietChime.ts` also has its own — confirm both cannot exceed browser limits or run on a suspended context during click.

## Gaps / what could not be checked

- No profiler traces, RUM, or Web Vitals data in repo; no user-report issues reviewed (GitHub issues not queried in this run).
- Missing referenced doc `BUTTON-LAG-RENDERING-DIAGNOSTIC.md`.
- No lag fixes landed after 07-28; unknown whether users still see lag.

## Next steps

1. Record a Chrome Performance profile on System tab with a seeded 1000-signal/500-log account: click a Memory/Planner/Biofield button, capture long tasks and the React commit list (React DevTools Profiler, "why did this render").
2. Add `performance.mark` around `recordSignal`, `analyzeIntentions`, `recomputeAssembly` and report p95 via the existing stats route / console in dev; set a budget (e.g. <16 ms in click path, <50 ms any task).
3. Convert the 7 whole-atom `useStore(intentionEngine)` subscribers to selector/`keys` subscriptions (biggest expected win).
4. Gate `startBackgroundQOSMonitor` with `isRouteActive('system')`/`document.hidden`, and wrap `Logs.tsx:3975` and mount-time `recomputeAssembly` calls in `deferHeavy`.
5. Consider moving `analyzeIntentions` to a Web Worker as the pattern count keeps growing.
6. Add a lightweight perf smoke test (headless Chromium harness already used in #94/#95) to the benchmark gate so regressions from new QIE versions are caught.
7. Re-create the missing diagnostic doc or point `be3e8fa` at this file.
