# Button Lag & Rendering Investigation — 2026-10-28

Scheduled, read-only investigation (static review of git history, PRs/issues, code). No profiling run; no live metrics available.

## Summary
Button lag has been addressed in **six perf commits (Jul 18–28)**. All share one root cause: the ~6,500-line `src/client/stores/intentionEngine.ts` store (nanostores atom) is **written synchronously** by `analyzeIntentions()` and signal recorders, and ~7 mounted System-tab widgets subscribe to it. Any write → cascading re-renders and/or a ~139-pattern synchronous scan on the main thread, blocking the click→paint path.

No open GitHub issues mention lag (search returned 0). Open PRs: #97 (docs/wiki), #93 (calendar time tracking + due-event toast) — neither touches Button or perf paths directly. The referenced `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md` (cited in be3e8fa) is **not in the repo** on any branch.

## Timeline of fixes
| Commit | Fix |
|---|---|
| 89da563 | Logs mouse-inactivity timer disabled nav across tabs |
| bd9ef2a | Planner buttons frozen: reuse AudioContext |
| 863b333 | Cap logs query, back off stats polling |
| b219cc3 | Move quantum state writes out of `useMemo` |
| ee88f4c / 6e5007a / b46f1ac | Pause/unmount System tab off-tab; remove render-phase atom write |
| be3e8fa (#94) | MemoryWidget render-phase `analyzeIntentions()` → effect; SystemProgressWidget click handler deferred via `setTimeout(0)` |
| 9364aba (#95) | Memoize SignalStream sort (1000 signals) and UserMetrics `getUserIndex`/cohort; 5 tab switches now ~118ms one-time |

## Suspected remaining causes (unverified)
1. **Sync `analyzeIntentions()` / `recomputeAssembly()` on the main thread**: `System.tsx:268` runs both in an effect on every `[logs]` change (after paint, but still a long task that blocks the next click); `SystemProgressWidget.tsx:1555` runs it on mount; `Logs.tsx:3975` runs it synchronously in the `/qos` trigger handler (not deferred, unlike the Generate Report button). On a cooldown miss (>5 min) each is a full pattern scan.
2. **Store fan-out**: every subscriber re-renders on any engine write; only some widgets memoize. `setTimeout(0)` defers but doesn't remove the long task — it still blocks the next input.
3. **Button hover CSS**: `.grid-fill-hover::before` (`src/client/index.css:102`) uses gradient backgrounds with `isolation: isolate`, `overflow-hidden`, and `opacity` transition on every button; `Button.tsx` primary/rounded variants also subscribe to `theme`/`isMirrorOn` stores (cheap, but per-button). Likely minor; check paint cost on low-end/mobile with many buttons visible.
4. **Timers**: 18 `setInterval` usages in client components, plus a 30-min background QOS monitor that pre-triggers `analyzeIntentions()`.
5. **Scale**: `System.tsx` (1k lines), `SystemProgressWidget.tsx` (2.5k), `intentionEngine.ts` (6.5k) — large render trees, growing with every benchmark release (+patterns each version).

## Next steps
- Run Chrome Performance profile (CPU 4x throttle) clicking buttons on System, Logs, Planner; look for long tasks >50ms in `analyzeIntentions`.
- Move `analyzeIntentions()` into a Web Worker or `requestIdleCallback`/chunked scan; make handlers at items 1 above non-blocking.
- Use selector-style subscriptions (`useStore(atom, {keys})` / `computed` atoms) so widgets re-render only on the slices they read.
- Add React Profiler / `PerformanceObserver` (`event` + `longtask`) telemetry, and an INP budget in the benchmark gate.
- Test `.grid-fill-hover` with `content-visibility`/`will-change: opacity` or drop the effect on touch devices.
- Ask reporter for device/browser/tab where lag occurs; restore or recreate the missing diagnostic doc.
