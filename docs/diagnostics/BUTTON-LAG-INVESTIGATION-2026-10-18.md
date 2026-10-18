# Button Lag & Rendering Investigation — 2026-10-18

Scheduled routine "Button lag investigation". Static review only: no profiler or browser run, no user telemetry in the repo.

## Summary
Button lag has been addressed in a series of perf commits (Jul 2026). No open GitHub issues mention it (search: lag/button/slow/rendering → 0). The only open PR is #93 (calendar), unrelated to perf. The `Button` component itself (`src/client/components/ui/Button.tsx`) is cheap. The lag history points at **synchronous work on the main thread triggered by nanostore writes (`intentionEngine`, `selfAssembly`)**, not at the button.

Note: commit be3e8fa cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, but that file is **not in the repo** (never committed). Its findings survive only in the commit message.

## History (all merged)
| Commit / PR | Fix |
|---|---|
| bd9ef2a | Planner buttons frozen: reuse a single AudioContext, catch sound errors |
| 863b333 | Cap logs query, back off stats polling |
| b219cc3 | Move quantum state writes out of `useMemo` |
| ee88f4c, 6e5007a, b46f1ac | Pause/unmount System tab off-tab; stop render-phase atom write |
| be3e8fa (PR #94) | MemoryWidget render-phase `analyzeIntentions()`; SystemProgressWidget click handler ran it synchronously |
| 9364aba (PR #95) | Memoize SignalStream sort (≤1000 signals) and UserMetrics cohort work |

Recurring pattern: store write inside render/click path → cascade re-render of every `intentionEngine` subscriber.

## Suspected remaining causes (ranked, unverified)
1. **`recomputeAssembly()` is uncooled and heavy** — `System.tsx:~266` runs `analyzeIntentions()` + `recomputeAssembly()` in an effect on every `logs` change (`analyzeIntentions` has a 5-min cooldown, `recomputeAssembly` does not; it writes the `selfAssembly` atom and re-renders subscribers). Any log submit/poll refresh triggers it while System is mounted.
2. **Sync store work in click handlers** — `Logs.tsx:3975` (`/qos` trigger) calls `analyzeIntentions()` synchronously in submit; same class as the SystemProgressWidget bug fixed in be3e8fa. Defer one macrotask.
3. **Giant files / many subscribers** — System.tsx (1071 lines), Logs.tsx (4506), SystemProgressWidget.tsx (2513), About.tsx (4889, huge static strings). 7 files subscribe to `intentionEngine`; 18 `setInterval` usages in components. Each unguarded interval that writes an atom re-renders subscribers.
4. **Hover CSS** — `.grid-fill-hover::before` (`src/client/index.css:102-160`) paints multi-layer gradients / repeating 45° patterns per button with `will-change: opacity` (a compositor layer per button). Likely minor, but on pages with dozens of buttons in `dense`/`instrument` density it adds paint/memory cost. `Button` secondary kind has no store subscription; primary/rounded subscribe only to theme/mirror (fine).
5. **Mobile/PWA** — service-worker cache issues have caused stale bundles (see `docs/diagnostics/PWA-CACHE-FIX-DIAGNOSTIC.md`); stale clients may still show old lag.

## Not found
No profiling data, Lighthouse/Web Vitals output, or user reports in repo or issues. Cannot confirm which device/tab users see lag on.

## Next steps
1. Reproduce with Chrome Performance profile (CPU 4x throttle) on System tab: click button, record INP; look for long tasks from `recomputeAssembly` / `analyzeIntentions`.
2. Add cooldown or `requestIdleCallback`/`setTimeout` deferral to `recomputeAssembly()`; debounce the System.tsx `[logs]` effect.
3. Defer `Logs.tsx` `/qos` handler work.
4. Audit the 18 `setInterval` sites for off-tab/hidden-tab guards (pattern already used in SystemProgressWidget).
5. Add `web-vitals` INP reporting to collect real user data; ask users for device/tab when reporting lag.
6. Try A/B: disable `.grid-fill-hover::before` `will-change` and measure paint.
7. Re-create the missing BUTTON-LAG-RENDERING-DIAGNOSTIC.md or link this doc from it.
