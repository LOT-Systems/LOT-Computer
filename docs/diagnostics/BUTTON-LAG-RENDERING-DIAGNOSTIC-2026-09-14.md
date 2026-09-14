<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Button Lag / Rendering — Scheduled Investigation

**Trigger**: Scheduled routine, "investigate the buttons lagging issue and rendering problems"
**Date**: September 14, 2026
**Scope reviewed**: full commit history, all PRs (open + closed), all open issues, current `src/client` code

---

## Summary

There is no *currently open* bug report, issue, or failing check about button lag —
`list_issues` returns zero open issues and the last commit on `master` /
`claude/brave-rubin-dfdmcf` is `98971f2` (2026-08-05), six weeks old. This looks
like a scheduled health-check firing with no new signal since the last fix
landed, not a fresh regression.

However, "buttons lagging" has been a **recurring, multi-round bug class** in
this codebase from **July 4 to July 28, 2026** — 8 separate perf commits, each
fixing a different root cause of the same symptom (UI stops responding to
clicks / tab switches feel frozen). I re-verified today that all of those
fixes are still present and intact in the current code, and checked the
largest post-fix addition (`QuantumEngineWidgets.tsx`, merged Aug 5 via PR #96)
for regressions of the same anti-patterns. One minor code smell was found
there (not confirmed to cause lag) — see **Next steps**.

---

## Timeline of prior button-lag fixes (all merged to master)

| Date | Commit | Root cause | Fix |
|---|---|---|---|
| Jul 4 | `bd9ef2a` | Planner buttons froze | `new AudioContext()` created on every click; hits browser's live-context cap and throws, killing the click handler before state updated. Fixed: one shared `_audioCtx`, try/catch around sound playback. |
| Jul 18 | `863b333` | ~1 min widget response delay | `GET /api/logs` unbounded (30k+ rows for long-term users) starving DB connections; stats polling too aggressive. Fixed: `LIMIT 500`, longer `staleTime`, background-tab poll backoff. |
| Jul 18 | `b219cc3` | Visible lag on every logs change | `analyzeIntentions()` + `recomputeAssembly()` (nanostores atom writes) called inside `useMemo` — a render-phase side effect that cascades ~10 synchronous re-renders before paint. Fixed: moved to `useEffect` + `useState` seed. |
| Jul 19 | `ee88f4c` | Tab-switch freeze | Tabs stay mounted (`display:none`) so System's background work never paused; `document.hidden` doesn't catch in-app tab switches. Fixed: `stores.isRouteActive(route)` gate; deferred `recordSignal`'s localStorage persist + 125-pattern scan off the interaction tick. |
| Jul 19 | `6e5007a` | Progressive stall (freezes after 2-3 tab switches) | `PatternRecognitionWidget` wrote to the intentionEngine atom **during render** (not an effect), cascading fan-out across ~7-9 always-mounted System subscriber widgets. Fixed: memoized, plus gated 3 more ungated intervals on `isRouteActive('system')`. |
| Jul 25 | `b46f1ac` | Freeze required a hard reload to clear | Even with intervals gated, mounted-but-hidden System subscribers still re-rendered on every signal from *any* tab. Fixed: System now fully unmounts (`unmountWhenInactive`) when not the active tab. |
| Jul 28 | `be3e8fa` | 2 residual paths (agent-diagnosed) | `MemoryWidget` ran `analyzeIntentions()` inside `useMemo`; `SystemProgressWidget.handleGenerateReport` ran it synchronously inside a click handler, blocking the button. Fixed: `useEffect`/`useState`, and deferred the report build one macrotask. |
| Jul 28 | `9364aba` | Heavy per-render work on any engine write | `SignalStreamWidget` re-sorted up to 1000 signals every render; `UserMetricsWidget` ran cohort classification unmemoized every render. Fixed: both memoized on stable deps. Verified: 5 rapid tab switches dropped from "heavy task per switch" to one-time ~118ms mount cost. |

The common thread across all 8: **synchronous nanostores atom writes during
React's render phase**, and **always-mounted subscriber widgets** doing
unmemoized heavy work (pattern scans, sorts, localStorage JSON parsing) on
every signal, regardless of which tab was visible. Each round found one more
place the pattern was hiding; the Jul 28 round explicitly says it was
"flagged by agent diagnostic" against a doctrine of render-isolation /
async-signal writes, suggesting the team converged on a documented rule by
the end of this arc (the source diagnostic doc referenced in `be3e8fa`,
`docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, is no longer present in
the repo — likely cleaned up after the fix landed).

---

## Current-state verification (2026-09-14)

Re-checked the live code for the same anti-patterns:

- **No `useMemo` with a store `.set()` call in its body** anywhere under
  `src/client/components` — the render-phase-write class of bug looks fully
  closed.
- `System.tsx:266-271` — `analyzeIntentions()`/`recomputeAssembly()` still
  correctly live in a `useEffect`, not `useMemo`, with a `useState` seed for
  the first render (per `b219cc3`/`be3e8fa`).
- `recordSignal` (`intentionEngine.ts:225-253`) still defers the expensive
  persist + pattern scan (`deferHeavy`, coalesced `schedulePersist`) off the
  interaction tick (per `ee88f4c`).
- `isRouteActive` / `unmountWhenInactive` gating is still wired through
  `router.ts`, `app.tsx`, and all four previously-fixed widgets
  (`SystemProgressWidget`, `SystemPulseWidget`, `EvolutionMilestoneToast`,
  `ChakraErgonomicsWidget`, `ContextualPromptsWidget`).
- `QuantumEngineWidgets.tsx` (651 lines, newest System-tab addition, merged
  Aug 5 via PR #96) has **no `setInterval`/`setTimeout` polling** of its own,
  so it doesn't reintroduce the off-tab-churn class of bug. It's mounted
  inside `System.tsx`, so it inherits the tab-unmount protection.
- No new `new AudioContext()`-per-click sites found anywhere in `src/client`.

## Minor finding (not confirmed to cause lag)

`QuantumEngineWidgets.tsx:207-253` — the six device-connect click handlers
(`handleCarConnect`, `handleHomeConnect`, `handleComputerConnect`,
`handlePhoneConnect`, `handleWatchConnect`, `handleRobotConnect`) call
`recordSignal(...)` **inside** a `setState` updater function:

```tsx
const handleCarConnect = () => {
  setCarConnected((prev) => {
    const next = !prev
    recordSignal('intentions', next ? 'car_connected' : 'car_disconnected', { timestamp: Date.now() })
    return next
  })
}
```

React state updater functions are expected to be pure — React may invoke
them more than once (e.g. React 18 Strict Mode double-invokes state updaters
in development to surface exactly this kind of side effect). `recordSignal`
itself is already cheap on the interaction tick (per `ee88f4c`'s fix, it just
sets the atom and coalesces the heavy work), so this is unlikely to be *the*
cause of any new lag — but it's the same category of bug (a side effect
riding along on state-update plumbing) as several of the entries above, and
would double-fire signals in dev Strict Mode. Straightforward fix: compute
`next` first, call `setCarConnected(next)`, then call `recordSignal` as a
plain statement after — same pattern all six handlers should follow.

---

## Conclusion

No live button-lag regression found as of this scan. If a *new* lag report
comes in, the highest-value first move is a headless-Chromium repro (as used
in `9364aba`/`be3e8fa`) profiling System-tab widgets under rapid clicks/tab
switches, since that's where every prior instance of this bug class lived.

## Next steps / areas for deeper investigation if the issue is reported again

1. Fix the `recordSignal`-inside-`setState`-updater pattern in
   `QuantumEngineWidgets.tsx` (6 handlers) as a preventive cleanup.
2. `Logs.tsx:3975` (`/qos` chat trigger) calls `analyzeIntentions()`
   synchronously inside a `useEffect` fired on every keystroke that matches a
   trigger pattern — low risk (effect, not render; rare trigger) but not
   deferred like the click-handler path in `SystemProgressWidget` was. Worth
   deferring with the same one-macrotask pattern if it's ever implicated.
3. No automated performance regression test exists for this bug class (all
   verification so far has been manual headless-Chromium smoke tests noted
   in commit messages). Consider adding a lightweight perf assertion (e.g.
   "N rapid System-tab signal writes complete render in < X ms") to catch a
   9th recurrence automatically.
4. Recommend re-running the specific headless-Chromium repro harness from
   `9364aba` (1000 signals + 500 logs, 5 rapid System↔Log switches) against
   current `master` to get a fresh baseline number, since none of that
   tooling appears to be checked into the repo as a reusable script.
