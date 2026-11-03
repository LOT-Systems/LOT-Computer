# Button Lag & Rendering Investigation — 2026-11-03

Scheduled investigation. Static review only (no live profiling, no browser run).

## Summary
Button lag has been addressed in a series of perf commits (Jul 25–28). No open issue or PR reports it (0 open issues; open PRs #93 calendar, #97 wiki). No new perf-relevant `src/client` changes since Jul 28; later commits are QIE patterns, badges, wiki. **No user-facing profiling data or metrics exist in the repo**, so the current state is unverified. The cause was never a button component: `Button.tsx` is light (secondary kind has no store subscription; primary/rounded subscribe only to `theme`/`isMirrorOn`).

## Prior fixes (history)
| Commit | Fix |
|---|---|
| 863b333 | Cap logs query, back off stats polling |
| b219cc3 | Move quantum state writes out of `useMemo` |
| ee88f4c / 6e5007a | Pause System background work off-tab; stop render-phase atom write |
| b46f1ac | Unmount System tab when inactive |
| be3e8fa (#94) | MemoryWidget `analyzeIntentions()` out of `useMemo`; SystemProgressWidget click handler deferred one macrotask |
| 9364aba (#95) | Memoize SignalStreamWidget sort (up to 1000 signals) and UserMetricsWidget index/cohort work |

Note: be3e8fa cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, which is **not in the repo** (not on master or this branch). The original diagnostic is lost; recreate if needed.

## Suspected remaining causes (ranked)
1. **Engine write fan-out.** `intentionEngine.ts` (6.5k lines) is one atom; any write re-renders every subscriber. `analyzeIntentions()` (151 patterns, growing each QIE release) is called from `System.tsx:268`, `SystemProgressWidget.tsx:1555/1629`, `MemoryWidget.tsx:274`, `getOptimalWidget()` (`intentionEngine.ts:3667`) and a 30-min QOS interval (`:5129`). The 5-min cooldown masks cost, but the first call after cooldown runs synchronously on whatever interaction triggered it. Every new pattern (v110–v113 added ~12) raises that spike.
2. **System tab mount cost** (~118 ms measured in #95 with 1000 signals/500 logs) grows with each new widget row/phase; unmounting on tab-off means the cost is paid on every return.
3. **`recomputeAssembly()` every 60 s** on System tab (`SystemProgressWidget.tsx:1557`): heavy, writes the selfAssembly atom.
4. **CSS:** `grid-fill-hover` on all buttons plus `overflow-hidden` and `transition-all` (light primary). Unprofiled; low likelihood.
5. **Unmemoized `getOptimalWidget()`** calls `analyzeIntentions()` from render paths (verify callers).

## Next steps
1. Reproduce with Chrome Performance panel on System tab with realistic data; look for Long Tasks >50 ms at click and tab switch.
2. Add `performance.mark` around `analyzeIntentions()` and `recomputeAssembly()` (log if >50 ms) to get real-user numbers.
3. Move `analyzeIntentions()` into a Web Worker or chunk it via `requestIdleCallback`; split the engine atom (signals vs patterns) or use selector subscriptions (`computed`/`useStore(..., {keys})`).
4. Audit callers of `getOptimalWidget()`.
5. Profile `grid-fill-hover` paint cost on low-end mobile.
6. Ask the owner for symptoms: which button, which tab, which device. Without that, further work is speculative.
