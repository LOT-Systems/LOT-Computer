<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Button Lag & Rendering — Investigation (2026-09-19)

## Scope

Scheduled watchdog pass over `master` (HEAD `98971f2`, last commit 2026-08-05,
~6 weeks stale relative to this run) looking for causes of button-click lag
and rendering stalls: commit/PR history, open issues, event-handler and
re-render hygiene in `src/client/components`, and CSS transitions/animations
around interactive controls.

## Findings

### 1. The lag has an extensive, already-merged fix history

Ten commits between 2026-07-25 and 2026-08-05 (`863b333` → `9364aba`) worked
this exact class of bug, root-caused as **render-phase store writes** and
**synchronous heavy work inside click handlers**, both against the
`intentionEngine` nanostore (`src/client/stores/intentionEngine.ts`), which
every System-tab widget subscribes to:

| Commit | Fix |
|---|---|
| `863b333` | Capped Logs query size, backed off stats polling |
| `b219cc3` | Moved quantum-state writes out of a render-phase `useMemo` |
| `ee88f4c` | Paused System background work when the tab isn't visible |
| `6e5007a` | Stopped a render-phase atom write causing tab-switch stalls |
| `b46f1ac` | Unmounted the System tab entirely while inactive |
| `be3e8fa` | **MemoryWidget**: `analyzeIntentions()` (an atom write) ran inside a `useMemo` keyed on `question?.id`, cascading re-renders to every subscriber on each new Memory question. Moved to `useEffect` + `useState` seed. **SystemProgressWidget**: `handleGenerateReport` ran a ~139-pattern `analyzeIntentions()` scan synchronously inside the click handler, blocking the button from visibly responding until it finished. Deferred one macrotask so the click paints first. |
| `9364aba` | **SignalStreamWidget**: memoized the sort of up to 1000 signals on `engine.signals` instead of redoing it every render. **UserMetricsWidget**: memoized `getUserIndex()` / `classifyPhysiologicalCohort()` the same way, moved above the early returns per Rules of Hooks. |

PR #94 (`perf: fix two residual button-lag paths flagged by agent
diagnostic`) references this exact filename as its source — that prior
diagnostic was authored and consumed within a single session and never
committed, so this file did not previously exist in history despite being
cited. This version replaces it with the current state.

### 2. Current state: no reopened lag reports

- No open GitHub issues or PRs on `lot-systems/lot-computer` mention button
  lag, rendering, or performance. The one open PR (#93, calendar time
  tracking) is unrelated and does not touch the intentionEngine hot path.
- Re-auditing every `analyzeIntentions()` call site on current `master`: all
  click-adjacent and render-phase call sites from the table above are now
  behind `useEffect`, `useState`-seeded first renders, or an explicit
  macrotask defer (`SystemProgressWidget.tsx:1622-1629`). The only
  synchronous call left is `Logs.tsx:3975`, fired from the `/qos` text
  command in the log composer — a deliberate on-demand action, not a button,
  and not on a hot re-render path.
- `Button.tsx` itself is already architected to avoid the original failure
  mode: `PrimaryBtn` and `SecondaryRoundedBtn` each subscribe to exactly one
  narrow nanostore (`theme`, `isMirrorOn`) rather than the app's larger
  stores, and the default `secondary` kind has no store subscription at all.
- CSS around buttons (`index.css`) uses short, GPU-friendly transitions
  (`background-color`, `opacity`, `box-shadow`, 180–400ms) — nothing here
  should cause input lag; these run independently of the JS main-thread
  work above.

### 3. Residual / lower-priority item

`Logs.tsx:3975` — the `/qos` command still calls `analyzeIntentions()`
synchronously on the composer's submit path. Low priority: it's a rare,
explicit power-user command (not a repeatedly-clicked button), and a
cache-hit is a no-op per the 5-minute `ANALYSIS_COOLDOWN`
(`intentionEngine.ts:240`). Worth the same macrotask-defer treatment as
`SystemProgressWidget.handleGenerateReport` if it's ever reported as
sluggish.

## Next steps if lag resurfaces

1. Confirm which surface is lagging (System tab widgets vs. a specific
   button elsewhere) — the historical bug was isolated to
   `intentionEngine` subscribers mounted on the System tab, not global.
2. Grep for new `useMemo`/render-body calls into `intentionEngine.ts`
   exports (`analyzeIntentions`, `getUserIndex`, `classifyPhysiologicalCohort`,
   `getOptimalWidget`) added by widgets built after `9364aba` — these are
   the three doctrine violations that recurred repeatedly and are the most
   likely regression vector.
3. Reproduce with the same method the prior sessions used: headless-Chromium
   smoke test seeded with a large signal/log set (~1000 signals / 500 logs),
   profiling rapid tab switches and rapid clicks on the same button.
4. If a new widget is implicated, apply the same two fixes as `be3e8fa`:
   move store writes out of render/`useMemo` into `useEffect`, and defer any
   heavy synchronous work in a click handler by one macrotask/`requestIdleCallback`
   so the click's visual response isn't gated on it.

## Conclusion

No active button-lag regression found on current `master`. The known root
causes (render-phase store writes, synchronous heavy scans in click
handlers, unmemoized per-render sorts/derivations) were systematically
fixed across 10 commits ending 2026-08-05, and no new reports, issues, or
PRs have surfaced since. This diagnostic doc is the durable record the
earlier PRs referenced but never actually committed.
