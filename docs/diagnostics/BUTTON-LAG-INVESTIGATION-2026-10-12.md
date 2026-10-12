# Button Lag & Rendering Investigation — 2026-10-12

Scheduled routine "Button lag investigation". Static review only (no profiler/browser run, no field metrics available in repo or GitHub).

## Summary
No open GitHub issues exist in `lot-systems/lot-computer`, and no user reports or profiling traces are stored in the repo. The lag history is entirely in commits. Seven perf commits (Jul 2026) already addressed the root pattern; nothing since 2026-07-28 has been profiled, while ~2,500 lines were added to the engine/UI since.

## Evidence (commits / PRs)
| Commit | PR | Fix |
|---|---|---|
| 863b333 | – | Cap logs query, back off stats polling |
| b219cc3 | – | Move atom writes out of `useMemo` (render-phase writes) |
| ee88f4c | #85 | Pause System background work off-tab (`display:none` tab kept mounted) |
| 6e5007a | #88 | Stop render-phase atom write + off-tab churn |
| b46f1ac | – | Unmount System tab when inactive |
| be3e8fa | #94 | MemoryWidget render-phase write; `SystemProgressWidget` click handler ran `analyzeIntentions()` synchronously (deferred a macrotask) |
| 9364aba | #95 | Memoize `SignalStreamWidget` sort (1000 signals) and `UserMetricsWidget` work; 5 System<->Log switches measured, mount ~118ms |

Note: be3e8fa cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, which is **not in the repo** (never committed) — the original profiling evidence is lost.

## Button component review (`src/client/components/ui/Button.tsx`)
Button itself is lean: `secondary` has no store subscription; `primary` subscribes to `theme`, `secondary-rounded` to `isMirrorOn` only. Handlers are passed straight through. Not a lag source.

CSS (`src/client/index.css:102-160`) `.grid-fill-hover`: each button gets a `::before` with 1–3 stacked gradients, `will-change: opacity`, `isolation: isolate`. Hover only animates opacity (compositor-friendly), but every button holds a promoted layer; on pages with many buttons (System, Logs) that is memory/layer overhead. The `instrument` density uses 4px tiles x3 gradients — most expensive to rasterize. `primary` light theme uses `transition-all`.

## Suspected causes (ranked)
1. **intentionEngine write fan-out** — every atom write re-renders all permanently-mounted System subscribers. `analyzeIntentions()` (`intentionEngine.ts:258`) has only a 5-min cooldown, then scans ~150 patterns over up to 1000 signals. Since 9364aba, `intentionEngine.ts` grew ~537 lines (QIE v111–v113: P143–P151) and `SystemProgressWidget` +127, `PatternRecognitionWidget`/`QuantumEngineWidgets` also grew — none were re-measured. Likely regression source for any current lag.
2. **Sync work in click handlers** — only SystemProgressWidget was audited/deferred. `deferHeavy` exists (`intentionEngine.ts:243`) but other handlers call engine functions (e.g. `intentionEngine.ts:3667`) directly.
3. **Logs.tsx +369 lines** (added after the last perf pass) — unreviewed for memoization of list work.
4. **Stacked gradient `::before` layers** on many buttons (see above) — minor, mostly on low-end/mobile.
5. **Background intervals**: QOS monitor (`startBackgroundQOSMonitor`, 30 min, runs `analyzeIntentions` + snapshot, no `document.hidden` guard) and the System 15-min astrology tick — low frequency, unlikely cause.

## Next steps
1. Re-run the headless-Chromium harness (1000 signals + 500 logs) on HEAD; record long tasks per click and per System<->Log switch. Commit the harness + results (restores the missing diagnostic).
2. Audit onClick handlers in `System.tsx`, `SystemProgressWidget.tsx`, `Logs.tsx`, `QuantumEngineWidgets.tsx` for sync engine calls; route through `deferHeavy`.
3. Add React Profiler / `PerformanceObserver('longtask')` instrumentation behind a debug flag and capture real-user INP for buttons.
4. Try `contain: paint` / drop `will-change` on `.grid-fill-hover::before`, and replace `transition-all` with specific properties.
5. Collect concrete repro: which buttons/pages/devices lag (no issue or report exists — suggest opening a GitHub issue).
6. Guard QOS monitor with `document.hidden` and defer its `analyzeIntentions()`.

## Confidence
Low–medium: code review only. The structural cause (engine write fan-out) is well evidenced by prior commits; the post-07-28 regression is a hypothesis awaiting measurement.
