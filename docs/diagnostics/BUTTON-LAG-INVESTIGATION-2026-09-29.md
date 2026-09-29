# Button Lag & Rendering Investigation — 2026-09-29

Scheduled routine "Button lag investigation". Static review only: no profiler run, no user-report data available in the repo.

## Summary
No open issues exist on GitHub (0 issues). Button lag has been handled through a chain of merged perf PRs (Jul 4 – Jul 28). No lag-related commit has landed since 2026-07-28; every commit after that is badge, wiki, QIE pattern or docs work. Nothing indicates the problem is still active, but nothing confirms it is fixed either, because no post-fix measurements exist.

## History (what was found and fixed)
| Date | Change | Cause fixed |
|---|---|---|
| 07-04 | `bd9ef2a` | Planner buttons froze: new `AudioContext` per click hit the browser cap and threw before state updated |
| 06-04 / 06-22 | SR-20260604-01, SR-20260622-01 | Biofield/Memory buttons: synchronous `recordSignal()` blocked feedback |
| 07-18 | `863b333`, `b219cc3` | Unbounded `/api/logs`, 30–60s stats polling; store writes inside `useMemo` (render phase) |
| 07-19 | PR #85 `ee88f4c`, PR #88 `6e5007a` | System background intervals kept running off-tab; render-phase atom write in PatternRecognitionWidget; `recordSignal` persist/analysis deferred |
| 07-25 | `b46f1ac` | System tab now unmounts when inactive |
| 07-28 | PR #94 `be3e8fa`, PR #95 `9364aba` | MemoryWidget render-phase `analyzeIntentions()`; click-path `analyzeIntentions()` in SystemProgressWidget; unmemoized sort/derivations in SignalStream/UserMetrics |

PRs: #85, #87, #88, #94, #95 (all closed/merged).

## Pattern behind the lag
One shared nanostore, `intentionEngine` (`src/client/stores/intentionEngine.ts`, 6.5k lines), is written by nearly every interaction. Each write re-renders every subscriber. Two things made this costly:
1. Store writes made during render or inside click handlers.
2. Heavy, unmemoized work in subscribers (7 `useStore(intentionEngine)` sites).

## Remaining suspected causes (unverified)
1. **Cost of `analyzeIntentions()` grows with each release.** It scans 125 → 139 → now ~151 patterns (QIE v113) and runs synchronously once the 5-min cooldown lapses. `deferHeavy` moves it off the click, but it still blocks the main thread while running. Any button pressed just after it starts will stall. This is the most likely source of intermittent lag as patterns keep being added.
2. **`recordSignal()` still does O(n) filter/spread work synchronously per call** (`intentionEngine.ts:213-229`, up to 1000 signals). It also calls `intentionEngine.set` on the click tick, which re-renders all mounted subscribers before paint. It is cheap alone but adds up for buttons that record several signals.
3. **Remaining `analyzeIntentions()`/`recomputeAssembly()` callers**: `Logs.tsx:3975` (`/qos` trigger, sync in handler), `SystemProgressWidget.tsx:1554-1564` (mount and interval), `QuantumEngineWidgets.tsx:264`, `System.tsx:268`.
4. **Non-System tabs stay mounted with `display:none`** (only System unmounts). Any other subscriber widget still re-renders on background signals.
5. **`docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`**, cited by PR #94, is not in the repo. The original agent findings cannot be re-checked.

## Next steps
1. Get real data: a Chrome Performance trace or React Profiler of a button press on System, Memory and Planner with 1000 signals seeded. Log `PerformanceObserver` long tasks (>50ms) in production.
2. Time `analyzeIntentions()` against pattern count. Chunk the scan across `requestIdleCallback` slices or move it to a Web Worker.
3. Batch `recordSignal` writes (coalesce store `set` per frame) and keep signals sorted by insertion instead of re-sorting.
4. Replace whole-store subscriptions with `useStore(intentionEngine, {keys:[...]})` or derived atoms.
5. Extend `unmountWhenInactive` to other heavy tabs, or gate their subscribers on `isRouteActive`.
6. Restore or re-create the missing diagnostic doc, and open a GitHub issue to track lag reports (there is none).
