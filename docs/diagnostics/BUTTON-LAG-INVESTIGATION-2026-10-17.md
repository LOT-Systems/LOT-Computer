# Button Lag & Rendering — Investigation (2026-10-17)

Automated scheduled investigation. Static review of git history, GitHub PRs/issues, and code. No runtime profiling was possible in this environment.

## Summary
Button lag has been a recurring theme (~10 perf commits since July 2026). The root pattern each time: **synchronous `analyzeIntentions()` / quantum-state atom writes (intentionEngine nanostore) triggered during render or inside click handlers**, fanning out re-renders to every subscriber. Most paths have been fixed. No open GitHub issues exist for button lag; the only related PR is #94 (closed/merged).

## History (most recent first)
| Commit / PR | Fix |
|---|---|
| 9364aba (#95) | Memoize heavy work in SignalStreamWidget (sort of 1000 signals) and UserMetricsWidget |
| be3e8fa (#94) | MemoryWidget: moved `analyzeIntentions()` from `useMemo` to `useEffect`; SystemProgressWidget: deferred report build one macrotask out of click handler |
| b46f1ac | Unmount System tab when inactive (ends background churn) |
| 6e5007a / ee88f4c | Stop render-phase atom write; pause System background work off-tab |
| b219cc3 | Move quantum state writes out of `useMemo` |
| 863b333 | Cap logs query, back off stats polling |
| bd9ef2a | Planner buttons frozen: reuse AudioContext |
| 89da563 | Logs mouse-inactivity timer was disabling nav on all tabs |

Note: commit be3e8fa references `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, which is **not in the repo** (never committed). This file replaces it as the record.

## Code review of the Button component (`src/client/components/ui/Button.tsx`)
- Not a cause: `secondary` has no store subscription; `primary` / `secondary-rounded` subscribe to only `theme` / `isMirrorOn` (already split to limit re-renders).
- Hover effect `.grid-fill-hover::before` (`src/client/index.css:102-160`) uses an opacity transition (180ms, compositor-friendly) over a `repeating-linear-gradient` background; one pseudo-element per button. Cheap individually, but pages with many buttons (Logs, System, Settings) paint many gradient layers; `dense`/`instrument` density variants (diagonal repeating gradients, `index.css:140+`) are the heaviest.
- `Button` is not memoized and spreads `props` (new `onClick` closures each parent render), so any parent re-render re-renders every button.

## Suspected remaining causes (ranked)
1. **`analyzeIntentions()` still called synchronously from several event paths**: `Logs.tsx:3975` (`/qos` trigger, inside submit handler), `System.tsx:268` (effect on every `logs` change, followed by `recomputeAssembly()`), `SystemProgressWidget.tsx:1555` (mount). Each can write the intentionEngine atom and cascade to all subscribers.
2. **Giant components**: Logs.tsx (4.5k lines), SystemProgressWidget (2.5k), About (4.9k), System (1.1k) — large render trees without memo boundaries; any state change re-renders buttons inside them.
3. **26 `setInterval` sites** in client code — some may still run while hidden/off-tab (only System's was audited).
4. **Hover paint cost** of density-pattern gradients on button-dense screens.
5. Audio/PWA: prior freezes came from AudioContext creation and service-worker cache staleness (see `PWA-CACHE-FIX-DIAGNOSTIC.md`); worth ruling out if lag is only on first click.

## Next steps
1. Reproduce with React DevTools Profiler / Chrome Performance on Logs and System with realistic data (1000 signals, 500 logs); record long tasks on click.
2. Defer `/qos` handler in Logs.tsx and the `System.tsx` effect with `setTimeout`/`requestIdleCallback` as done in #94.
3. Wrap `Button` in `React.memo` and audit hot callers for unstable handlers.
4. Audit the 26 `setInterval` calls for visibility/tab gating (`grep -rn setInterval src/client`).
5. Test with `data-density` set to `dense`/`instrument` and with hover gradient disabled to quantify CSS cost.
6. Add a lightweight `PerformanceObserver` (longtask/event timing, INP) to collect field data — none exists today.
7. Ask the reporter for device/browser/tab where lag occurs; no user reports are on file in GitHub issues.
