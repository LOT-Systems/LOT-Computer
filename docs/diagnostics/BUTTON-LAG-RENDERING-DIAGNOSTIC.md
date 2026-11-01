# Button Lag & Rendering Investigation

Date: 2026-11-01 · Branch: `claude/brave-rubin-4kkspx` · Type: read-only code/history review (no profiler run, no code changed)

## Summary
Button lag has been a recurring issue, fixed piecemeal 7+ times (Jun-Jul 2026). No open GitHub issues report it. Open PRs: #97 (wiki/docs) and #93 (calendar toast); neither touches rendering paths. Latest fixes (#94, #95, Jul 28) appear to have closed the known paths. No lag-related commits since. No profiling data or user reports are in the repo besides the commit messages below.

## History (code links)
| Date | Commit | Cause -> fix |
|---|---|---|
| Jun 4 | SR-20260604-01 (`docs/benchmark/LOT-SR-20260604-01.md`) | Biofield: sync `recordSignal()` in click (~1.5s) -> deferred |
| Jun 22 | SR-20260622-01 | MemoryWidget: `recordSignal` (localStorage stringify of 1000 signals + analysis) before API call -> `setTimeout(0)` |
| Jul | bd9ef2a | Planner frozen: AudioContext recreated per click -> reused |
| Jul | 863b333, b219cc3, 6e5007a, ee88f4c, b46f1ac | Widget lag: render-phase atom writes in `useMemo`, polling, off-tab System churn -> effects, unmount inactive System tab |
| Jul 28 | be3e8fa (#94) | MemoryWidget `analyzeIntentions()` in useMemo; SystemProgressWidget report build in click handler -> effect / deferred |
| Jul 28 | 9364aba (#95) | SignalStreamWidget sort of 1000 signals per render; UserMetricsWidget unmemoized derivations -> useMemo |

Note: `be3e8fa` cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md` as its source, but that file was never committed; this document replaces it.

## Root-cause pattern
All fixes share one cause: heavy synchronous work on the interaction tick or render phase, centered on `src/client/stores/intentionEngine.ts`:
- `recordSignal()` (L199) now persists via coalesced `schedulePersist()` and defers analysis via `deferHeavy()` (good), but still does an O(n) filter and copy of up to 1000 signals and an atom `set` synchronously, which re-renders every subscribed component.
- `analyzeIntentions()` writes the same atom. Any call during render or click re-renders every subscriber.
- Subscribers: ~11 components read the store (System, SystemProgressWidget, Logs, IntegrityWidget, PatternRecognitionWidget, QuantumEngineWidgets, SignalStreamWidget, UserMetricsWidget, etc.).

## Remaining suspects (unverified)
1. **Pattern-count growth.** Scan cost scales with patterns: ~125 (Jul) -> 151 (QIE v113, Aug 4). Perf fixes in #94/#95 predate v111-v113 (P143-P151), added in PatternRecognitionWidget/QuantumEngineWidgets/System.tsx. No perf re-test since.
2. **Synchronous `analyzeIntentions()` in handlers:** `Logs.tsx:3975` (`/qos` trigger, in-handler), `SystemProgressWidget.tsx:1555`. Unlike L1629 these are not deferred.
3. **Wide subscription fan-out.** Widgets use `useStore(intentionEngine)` whole-atom; each `recordSignal` re-renders all mounted ones. Narrow with `computed`/selectors or `React.memo`.
4. **Monolith components:** Logs.tsx (4.5k lines), SystemProgressWidget.tsx (2.5k), System.tsx (1k) - large re-render surface; 19 `setInterval` uses across components/stores.
5. **CSS:** only ~5 `transition-all` / `backdrop-blur` / `animate-*` usages; low likelihood.
6. **Server-side:** `/api/logs` cap and stats polling backoff were added (863b333); not re-measured.

## Next steps
1. Reproduce on a mid-range mobile device: Chrome Performance trace of Memory/Mood/Planner button taps; look for tasks >50ms after click and Long Animation Frames. Re-use the headless harness from #95 (1000 signals + 500 logs).
2. Measure `analyzeIntentions()` at 151 patterns; if >30ms, time-slice it or run it in a Web Worker.
3. Defer `Logs.tsx:3975` and SystemProgressWidget L1555 off the click path; make `recordSignal` set the atom inside `deferHeavy` or batch.
4. Add React Profiler / `performance.mark` around button handlers and report INP via web-vitals to get field data (none exists today).
5. Ask the reporter which button/device/tab lags - no issue currently identifies one.
