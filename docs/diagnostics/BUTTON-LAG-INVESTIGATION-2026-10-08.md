# Button Lag & Rendering Investigation — 2026-10-08

Automated routine ("Button lag investigation"), static review only (no live profiling run).

## Summary
No open issue or PR reports button lag (GitHub issue search: 0 hits; only open PR is #93, calendar feature). The lag has a documented history across ~10 perf commits (Jul 19–28 2026); all identified causes were fixed. **No new regression found in HEAD (98971f2).** One residual risk remains (below).

## History (link = commit)
| Commit | Cause fixed |
|---|---|
| bd9ef2a | Planner buttons frozen — AudioContext recreated per click, sound errors uncaught |
| 863b333 | Widget lag — uncapped logs query, aggressive stats polling |
| b219cc3 | Quantum state writes inside `useMemo` blocking render pipeline |
| ee88f4c / 6e5007a | Tab-switch freeze — render-phase atom write in PatternRecognitionWidget; ungated intervals |
| b46f1ac | System tab kept mounted (`display:none`), ~7 intentionEngine subscribers re-rendering on every write → now unmounted when inactive |
| be3e8fa | MemoryWidget render-phase `analyzeIntentions()`; SystemProgressWidget click handler ran ~139-pattern scan synchronously (click → delay → action) |
| 9364aba | Heavy per-render work in SignalStreamWidget / UserMetricsWidget memoized |

Note: `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, referenced by be3e8fa, is not in the repo.

## Root-cause pattern
`intentionEngine` is a single nanostore atom; every `analyzeIntentions()` write re-renders all subscribers, and the scan itself is synchronous and heavy. Lag = main-thread blocked by (a) that scan in click/render paths, (b) fan-out re-renders.

## Button component (`src/client/components/ui/Button.tsx`)
Healthy: `secondary` has no store subscription; `primary`/`secondary-rounded` subscribe to one tiny store each. Hover uses a `::before` opacity transition (`index.css:102-126`, `will-change: opacity`) — compositor-only, cheap. Minor: `will-change` on every button adds a layer per button on pages with hundreds (Logs).

## Suspected remaining risks
1. **Sync `analyzeIntentions()` still on interaction paths**: `SystemProgressWidget.tsx:1555` (a second call site next to the deferred one at ~1629 — verify it's not click-bound) and `Logs.tsx:3975` (log `/qos` trigger). Defer via `setTimeout`/`requestIdleCallback` as done in be3e8fa.
2. **`startBackgroundQOSMonitor` (intentionEngine.ts:5120-5129)** and `TimeWidget.tsx:113` (1s interval) run regardless of route; confirm they're cheap/gated.
3. **Ungated intervals**: MicroGameWidget:790, QuantumRandomWidget:39/65, MicroCalculatorWidget:71 — check whether they are route-gated.
4. **Logs page**: very large file (Logs.tsx) with many buttons/handlers; list virtualization not verified.
5. `perf.ts` INP observer exists (logs >200ms interactions to console) but nothing aggregates it — no field data available to this review.

## Next steps
- Collect real data: ship INP/long-animation-frame samples from `utils/perf.ts` to the server (or ask affected users for console `[Perf] Slow interaction` lines + device/page).
- Run the headless-Chromium harness used in 9364aba (1000 signals + 500 logs) against Logs and Planner, not just System.
- Defer remaining sync `analyzeIntentions()` call sites (item 1); gate intervals (items 2–3).
- Ask the reporter which button/page lags — no current report identifies one.
