# Button Lag & Rendering Investigation — 2026-11-10

Scheduled routine "Button lag investigation". Static code/history review only (no live profiling or user-report data available in the repo; no GitHub issues were checked beyond commit/PR history).

## Summary
Button lag has been a recurring theme since July 2026. Every fix so far targeted the **same root cause class**: the System tab's many `intentionEngine` (nanostores) subscribers re-render on every store write, doing heavy work per render, with store writes sometimes happening in the render phase or click path. Eight perf commits (Jul 4 – Jul 28) addressed specific paths. Generic `Button` (`src/client/components/ui/Button.tsx`) and its CSS (`.grid-fill-hover` in `src/client/index.css:102`) are cheap (opacity-only transition) and are **not** a suspect.

## Timeline of related fixes
| Commit | Date | Fix |
|---|---|---|
| bd9ef2a | Jul 04 | Planner buttons frozen: new `AudioContext` per click threw → reuse one context, try/catch |
| 863b333 | Jul 18 | Unbounded `/api/logs` + aggressive stats polling → LIMIT 500, 120s polls |
| b219cc3 | Jul 18 | `analyzeIntentions()`/`recomputeAssembly()` (atom writes) inside `useMemo` in System.tsx → `useEffect` |
| ee88f4c | Jul 19 | Off-tab intervals gated by `isRouteActive`; `recordSignal` persistence coalesced, analysis via `requestIdleCallback` |
| 6e5007a | Jul 19 | Render-phase atom write in PatternRecognitionWidget; ungated intervals |
| b46f1ac | Jul 25 | System tab unmounts when inactive |
| be3e8fa (#94) | Jul 28 | MemoryWidget render-phase write; SystemProgressWidget click handler blocked on 139-pattern scan → `setTimeout` |
| 9364aba (#95) | Jul 28 | Memoized sort in SignalStreamWidget, derivations in UserMetricsWidget |

## Findings / suspected causes
1. **BUG (new, from 9364aba): Rules of Hooks violation in `SignalStreamWidget`** — `src/client/components/SignalStreamWidget.tsx:39-48`. `React.useMemo` was added *after* `if (engine.signals.length < 3) return null`. When signals cross the 3 threshold the hook count changes between renders → React throws "Rendered more hooks than during the previous render", which the widget error boundary may swallow or crash the System tab (blank/frozen UI that looks like lag). Fix: move the `useMemo` above the early return (guard inside the memo). Not changed in this run (investigation only).
2. **Residual fan-out risk**: `System.tsx:266-270` runs `analyzeIntentions()` + `recomputeAssembly()` on every `logs` change, and `SystemProgressWidget.tsx:1553-1556` runs both on mount. Each write re-renders all mounted intentionEngine subscribers (~7–9 widgets). Still synchronous, heavy (125–139 pattern scan), and not idle-scheduled. Candidate: wrap in `requestIdleCallback` / debounce on `logs`.
3. **Other synchronous callers** of `analyzeIntentions()`: `Logs.tsx:3975` (log-submit path) — verify it isn't on the click path for the Log submit button.
4. **Missing artifact**: commit be3e8fa cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, but that file is not in the repo. The agent diagnostic's data/profiling is therefore unavailable.
5. **Not suspects**: `Button.tsx` (theme `useStore` only), `.grid-fill-hover` (opacity transition, `will-change: opacity`); primary light button uses `transition-all` (minor).

## Evidence gaps
No profiling traces, Lighthouse/Web Vitals data, or user-report issues are stored in the repo. Prior commits cite headless-Chromium harness measurements (e.g. ~118ms System mount with 1000 signals) but the harness isn't committed.

## Next steps
1. Fix the SignalStreamWidget hook-order bug (finding 1) — highest priority, small change.
2. Defer/debounce `analyzeIntentions()`+`recomputeAssembly()` in System.tsx on `logs` changes (idle callback).
3. Commit the headless-Chromium perf harness (seed 1000 signals/500 logs) and record a baseline for click→paint (INP) on Planner, Log submit, and System buttons.
4. Add `React.memo`/selector-style subscriptions (e.g. `nanostores` `computed` slices) so widgets only re-render for the fields they use.
5. Restore or recreate the missing BUTTON-LAG-RENDERING-DIAGNOSTIC.md; ask for current user reports (which tab/button, device) to target profiling.
