# Button Lag & Rendering — Investigation (2026-11-05)

Scheduled investigation. Static code/history review only: no live profiling,
no user reports, and no open GitHub issues were available (issue tracker is empty).

## Summary
Button lag has been reported and "fixed" repeatedly (at least 10 times since June 2026).
The recurring root cause is always the same shape: **synchronous heavy work inside a
click handler or render, driven by the `intentionEngine` nanostore** (`src/client/stores/intentionEngine.ts`,
~5,400 lines). The most recent passes (PR #94, #95) closed the remaining known paths.
No *new* regression since PR #95 (2026-07-28) was found in the commit history; the only later
client changes touching hot files are feature additions (QIE v111 rows in `System.tsx`, merge 73edd95).
Whether lag persists in production is **unverified** — needs live profiling.

## History (button-lag / render-perf fixes)
| Date | Ref | Fix |
|---|---|---|
| 2026-06-04 | SR-20260604-01 | Biofield button lag: `recordSignal()` ran synchronously |
| 2026-06-22 | SR-20260622-01 | Memory button lag (`recordSignal` blocking visual feedback) |
| Jun–Jul | bd9ef2a | Planner buttons frozen: new AudioContext per click |
| Jul | 863b333, b219cc3 | Cap logs query, back off stats polling; move quantum writes out of `useMemo` |
| 2026-07-19 | ee88f4c (#85), 6e5007a (#88) | Pause System background work off-tab; remove render-phase atom write |
| 2026-07-25 | b46f1ac | Unmount System tab when inactive |
| 2026-07-28 | be3e8fa (#94) | `MemoryWidget` render-phase `analyzeIntentions()`; `SystemProgressWidget` click handler ran it synchronously |
| 2026-07-28 | 9364aba (#95) | Memoize `SignalStreamWidget` sort of 1000 signals, `UserMetricsWidget` index calc |

Note: commit be3e8fa cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md` as its source,
but that file was never committed. This file now fills that slot.

## Suspected causes (still plausible)
1. **`analyzeIntentions()` is a single huge synchronous task** (`intentionEngine.ts:258` to ~3467, ~3,200 lines,
   ~139 patterns). `recordSignal` now defers it via `requestIdleCallback` (timeout 2000ms), but idle
   callbacks still block input once they start; a 100ms+ run that begins just before a tap still delays it.
   It is also called from `System.tsx:268`, `Logs.tsx:3975`, `SystemProgressWidget.tsx:1555,1629`,
   `PatternRecognitionWidget` (via `getOptimalWidget`), and `MemoryWidget.tsx:274`.
2. **Whole-atom fan-out.** `intentionEngine.set({...state})` notifies every `useStore(intentionEngine)`
   subscriber on any signal/pattern write. Widgets that subscribe to the full atom re-render even when
   their slice is unchanged. Fix pattern: `useStore(atom, { keys })` or `computed` slices.
3. **Every widget tap writes the atom** (`recordSignal` does `[...signals, new]` + filter over up to 1000 signals
   synchronously at `intentionEngine.ts:199-230`) — O(n) on the click tick; cheap-ish but it triggers (2).
4. **Hover paint cost:** `.grid-fill-hover::before` (`src/client/index.css:102-160`) paints gradient layers with
   `will-change: opacity` on *every* button (every instance promotes a compositor layer). Dense "instrument"
   density uses 3 stacked gradients at 4px size — many buttons on screen (System tab) means many layers. Likely
   minor, but worth checking in the Layers panel.
5. **`Button.tsx`**: `PrimaryBtn`/`SecondaryRoundedBtn` each call `useStore` on theme/mirror — fine; `transition-all`
   on primary light buttons animates layout-affecting properties (4 `transition-all` uses in client).
6. **Large components:** `System.tsx` (1,071 lines, 15 `useStore` calls) and `SystemProgressWidget.tsx`
   (2,513 lines, mostly static changelog strings) re-render as a unit; static data should be hoisted/memoized.
7. **Audio:** several sound utils create `AudioContext` (`sound.ts`, `sovietGameSounds.ts`, `sovietKeyboard.ts`,
   `sovietChime.ts`, `plannerWidget.ts`); only the Planner was fixed to reuse a single context. Verify the others.

## Not found
- No performance metrics, Lighthouse/trace data, or user-report issues in repo or GitHub (0 issues).
- No evidence of a regression after PR #95.

## Next steps
1. Reproduce with Chrome Performance panel on the System tab with realistic data (≥500 signals): record a button
   tap, look for Long Tasks > 50ms and attribute to `analyzeIntentions` vs. React commit vs. style/paint.
2. Add `performance.measure` around `analyzeIntentions` and `recordSignal`; log p95 in prod (Web Vitals INP).
3. Chunk `analyzeIntentions` (yield between pattern groups with `scheduler.yield()`/`setTimeout`) or move to a Web Worker.
4. Replace full-atom subscriptions with keyed/computed slices; run React Profiler to rank re-render counts.
5. A/B disable `will-change` + `transition-all` on buttons to rule out paint cost.
6. Audit remaining `new AudioContext` call sites; share one context.
7. Ask the owner for concrete repro: which tab, device/browser, and whether lag is on tap, hover or tab switch.
