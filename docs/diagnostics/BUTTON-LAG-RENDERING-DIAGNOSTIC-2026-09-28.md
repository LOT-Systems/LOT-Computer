# Button Lag / Rendering Diagnostic — 2026-09-28

Scheduled investigation ("Button lag investigation" routine). No live user
report triggered this — it is a periodic health check of the button-lag
class of bug that has recurred in this codebase several times before.

## Summary

No new button-lag regression found. Every previously-diagnosed cause is
already fixed and merged. No open GitHub issue or PR currently references
button lag, rendering lag, or widget freeze. A spot-check of components not
covered by the prior fixes found no new instances of the same anti-pattern.

## Prior history (all merged, in chronological order)

This is a recurring bug class in LOT-Computer, rooted in the `intentionEngine`
nanostore being a single shared atom that many widgets subscribe to. Every
prior fix falls into one of two doctrine violations, now codified as
**CLAUSE 5 (Render Isolation Doctrine)** in `docs/wiki/LOT-WIKI-v87.md`
("Each widget renders independently. One failure cannot cascade."):

| Commit | Date | Cause | Fix |
|---|---|---|---|
| `863b333` | 2026-07-18 | Unbounded logs query + aggressive stats polling | Capped logs query, backed off polling interval |
| `b219cc3` | 2026-07-18 | Quantum state store **write** running inside `useMemo` (render phase) | Moved write to `useEffect` (post-paint) |
| `ee88f4c` | 2026-07-19 | Background work (QOS monitor, etc.) kept running on inactive tabs, causing tab-switch freeze | Paused background work when the System tab is not active |
| `9364aba` | 2026-07-28 | `SignalStreamWidget` re-sorted up to 1000 signals every render; `UserMetricsWidget` recomputed cohort classification every render | Memoized both on `engine.signals` ref |
| `be3e8fa` | 2026-07-28 | `MemoryWidget`: `analyzeIntentions()` (a store write) called inside `useMemo`; `SystemProgressWidget.handleGenerateReport`: ~139-pattern scan ran synchronously inside the click handler, blocking the click | Moved analysis to `useEffect`; deferred the report build one macrotask (`setTimeout(fn, 0)`) so the click responds before the heavy work runs |

The `be3e8fa` fix was itself produced from an agent-authored diagnostic doc
(`docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`), which was later
removed from the tree once its findings were applied and distilled into the
wiki doctrine — this is the expected lifecycle for a diagnostic doc, not a
loss of information.

**Root cause pattern, distilled:** a click handler or a render-phase hook
(`useMemo`) triggers `analyzeIntentions()` or another `intentionEngine` write
synchronously. Because the store is shared, the write cascades a re-render
to every mounted subscriber before the browser can paint the click's own
visual response — "click, then a beat, then it happens."

## Current-state check (this run)

- `git log` / `git show`: confirmed all five fixes above are on `master`,
  most recently merged via PR #94 (2026-07-28) and PR #95/#96 (2026-08-05
  wiki sync, no further code fix).
- GitHub `search_issues` / `list_issues` for the repo: **0 open issues**,
  none mentioning lag/rendering/freeze.
- GitHub `search_pull_requests` for "button lag / rendering / perf": only
  the already-merged/closed PR #94 matches; no open PR touches this area.
- `grep` across `src/client/components` for `analyzeIntentions()` call
  sites: all remaining call sites are either in effects/handlers already
  deferred (`System.tsx`, `Logs.tsx`, `SystemProgressWidget.tsx`,
  `MemoryWidget.tsx`) or inside `intentionEngine.ts` itself behind
  `deferHeavy(...)`. No render-phase (`useMemo`) call sites remain.
- `grep` for `useMemo` combined with `analyze|record|Signal|Write` across
  components: all matches (`QuantumStateWidget`, `System.tsx`,
  `UserMetricsWidget`, `ArchitectWidget`, `SignalStreamWidget`) are pure
  *reads* memoized for perf, not writes — consistent with the doctrine fix.
- Spot-checked `ArchitectWidget.tsx` and `QuantumEngineWidgets.tsx` click
  handlers (`handleCarConnect`, `handleHomeConnect`, `handleComputerConnect`,
  `handlePhoneConnect`, `handleWatchConnect`, `handleRobotConnect`): all are
  simple state toggles, no heavy synchronous work.

## Suspected causes (if lag is reported again)

None currently observed, but if a fresh report comes in, check first:

1. A new widget added since 2026-08-05 that subscribes to `intentionEngine`
   and does a `useMemo`/render-phase read+derive without memoizing on the
   store's array/object ref (same shape as the `9364aba` bug).
2. A new click handler that calls `analyzeIntentions()`,
   `getEnrichedPhysiologicalReport()`, or any other function that scans the
   full signal/log history synchronously, without deferring via
   `setTimeout`/`requestIdleCallback`.
3. CSS-only causes (transition/animation jank, layout thrash) — not
   investigated this run since every prior incident traced to
   JS/store-write causes, not CSS. Worth a dedicated profiling pass if a
   future report explicitly describes visual (not click-response) jank.

## Next steps

- No action needed — the known bug class is fully patched and no new
  reports exist.
- Not done this run (out of scope for a periodic grep-level check): a live
  Chromium performance-trace capture across all widget-bearing routes.
  Prior fixes used a headless-Chromium harness seeded with synthetic
  signals/logs (per `be3e8fa`/`9364aba` commit messages) — if a future run
  wants hard numbers instead of static analysis, reuse that harness rather
  than building a new one.
