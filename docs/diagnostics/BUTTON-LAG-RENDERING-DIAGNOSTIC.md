<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Button Lag / Rendering Diagnostic — Scheduled Investigation

**Run date:** 2026-09-27
**Trigger:** scheduled investigation task ("buttons lagging / rendering problems")
**Scope:** `src/client/components/*.tsx`, `src/client/stores/intentionEngine.ts`, git/PR history

## Summary

No currently open issue, failing check, or reproducible lag was found on `HEAD`
(`98971f2`, PR #96 merged 2026-08-05). This has been a recurring class of bug —
seven prior perf PRs (#85, #88, #90, #94, #95, plus the standalone commits
below) each fixed a distinct instance of the same underlying anti-pattern. All
previously identified instances remain fixed as of this run. This report
re-documents the pattern (the original diagnostic doc it's named after was
referenced in commit `be3e8fa` but never actually committed to the repo — this
fills that gap) so the next widget that reintroduces it is easier to catch.

## Root cause pattern ("Render Isolation Doctrine" violations)

The app centers on one large shared store, `intentionEngine.ts` (6,503 lines),
read by `System.tsx` and ~35 widgets mounted under it. Two variants of the same
mistake have repeatedly caused "click, then a beat, then it happens" lag:

1. **Store writes during the render phase.** Calling a function that writes to
   the shared store (`analyzeIntentions()`, `recordXSignal()`, etc.) from
   inside `useMemo`/render body causes synchronous cascading re-renders across
   every subscriber *before the browser can paint*. Fix pattern: seed a
   `useState` with a pure read, then do the write in a `useEffect` (after
   paint).
2. **Heavy synchronous work inside `onClick`.** Calling an expensive function
   (pattern scans, cohort classification, report building) directly in a
   click handler blocks the click's visual response until it finishes. Fix
   pattern: defer the expensive body with `setTimeout(fn, 0)` so the click
   feedback paints first.
3. **Unmemoized heavy per-render work in non-`React.memo` widgets.** A widget
   that copies/sorts large arrays or recomputes a classification on every
   render — combined with re-rendering on *any* engine write, not just the
   slice it cares about — repeats that cost far more often than needed.

## History of fixes (chronological)

| Commit | PR | Fix |
|---|---|---|
| `bd9ef2a` | — | Planner buttons frozen — reuse `AudioContext`, catch sound errors |
| `863b333` | — | Reduce widget lag — cap logs query and back off stats polling |
| `b219cc3` | — | Unblock render pipeline — move quantum-state store writes out of `useMemo` |
| `ee88f4c` | #85 | Pause System background work off-tab (tab-switch freeze) |
| `6e5007a` | #88 | Stop render-phase atom write + off-tab churn (tab-switch stall) |
| `b46f1ac` | — | Unmount System tab when inactive to end background churn |
| `f4ca5a3` | — | Fix TDZ crash in `analyzeIntentions()` Pattern 135 (prod-down, not lag, but same function) |
| `be3e8fa` | #94 | `MemoryWidget`: move `analyzeIntentions()` out of `useMemo` into `useEffect`; `SystemProgressWidget.handleGenerateReport`: defer heavy build with `setTimeout(fn, 0)` |
| `9364aba` | #95 | `SignalStreamWidget`/`UserMetricsWidget`: memoize sort/classification on `engine.signals` instead of redoing it every render |

All of the above are present on `HEAD`. Verified by re-reading each patched
file (`MemoryWidget.tsx`, `SystemProgressWidget.tsx`, `SignalStreamWidget.tsx`,
`UserMetricsWidget.tsx`) — the fixes are intact, not regressed.

## What was checked this run (all clean)

- **`useMemo` calling a store-write function** — grepped every component for
  `analyzeIntentions`/`record*Signal` inside `useMemo`. Only remaining
  occurrence is the code comment in `System.tsx:263` documenting *why* it was
  moved out — no live violation.
- **Synchronous heavy work in `onClick`** — grepped for
  `analyzeIntentions()`, `getEnrichedPhysiologicalReport()`,
  `classifyPhysiologicalCohort()`, `getUserIndex()` directly inside click
  handlers. None found outside the already-deferred `setTimeout` call in
  `SystemProgressWidget.tsx`.
- **CSS jank sources** — no `transition: all`, no `backdrop-filter`,
  no unbounded `will-change` on button/interactive classes in
  `src/client/index.css` (421 lines total, lean).
- **New widgets added since the last perf pass** (`9364aba`, 2026-07-28) —
  diffed `src/client/components/` against that commit. Only additions are
  data-table entries (`SESSION_REPORTS`, pattern display names) and one new
  read-only call site, `getCircadianPhase()` in `System.tsx`, called directly
  in the render body — but it's a pure `Date`-based lookup with no store
  write and no loop, so it's not a violation.
- **GitHub** — no open issues or PRs mention button lag, rendering, or
  performance. Last activity in that area is the already-merged PR #95.

## Areas that still warrant a closer look (not confirmed as bugs)

- `intentionEngine.ts` has no explicit subscription/selector mechanism — every
  consumer re-reads the whole store on whatever cadence its own
  `useState`/`useEffect` polling triggers, rather than subscribing to a
  narrow slice. This is why the same class of bug keeps recurring in new
  widgets: there's no structural guard, only per-widget memoization
  discipline. A `useSyncExternalStore`-based selector hook (subscribe to
  `engine.signals` or similar, only re-render on shallow change) would remove
  the need to manually catch this in review each time. Worth a follow-up if
  another widget reports lag.
- `SignalStreamWidget`, `UserMetricsWidget`, and `SystemProgressWidget` are
  **not** wrapped in `React.memo`, unlike `MemoryWidget` and `System` itself.
  They currently avoid cost via internal `useMemo`, so this isn't causing
  visible lag today, but it means every parent re-render still runs their
  function body (cheap post-memoization) rather than bailing out early.
  Low priority; flagging for consistency.

## Conclusion

No active button-lag defect found on `HEAD`. The known-bad patterns are all
fixed and verified intact. If lag is being observed in production right now,
the next step is to get a specific repro (which tab/widget, cold vs. warm
session, device) since none of the previously-fixed triggers reproduce
locally — a headless-Chromium smoke test on `System.tsx` with a seeded
1,000-signal / 500-log store (same harness used in `9364aba`) would be the
fastest way to confirm or rule out a new instance.
