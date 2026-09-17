<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Button Lag / Rendering — Investigation (2026-09-17)

Scheduled audit. No live bug report triggered this — it's a periodic check on the
button-lag class of issue that this codebase has hit repeatedly since June 2026.

## Status: no open lag issue found

- No open GitHub issue or PR mentions button lag, slowness, or rendering
  performance (`search_issues` for `button lag OR slow OR render OR performance`,
  state=OPEN, on `LOT-Systems/LOT-Computer`: 0 results).
- Last commit on `master` is `98971f2` (2026-08-05). The repo has had **no commits
  in ~6 weeks** as of this audit (2026-09-17) — unusual against the near-daily
  cadence visible in the history. Not a lag cause by itself, but it means nothing
  has been verified against real usage since Aug 5.
- Static re-audit of the current tree (see "What was checked" below) found no
  regression against the fixes already landed.

## History: this has been a recurring class of bug, now fixed 4 times over

| Date | Commit | Root cause | Fix |
|---|---|---|---|
| 2026-06-04 | session `LOT-SR-20260604-01` | `recordSignal()` ran synchronous `localStorage` serialization + `analyzeIntentions()` before React committed the click's visual feedback | Deferred via `setTimeout(0)` |
| 2026-06-22 | session `LOT-SR-20260622-01` | Memory widget: `recordSignal` blocking visual feedback on click | Same async-defer pattern applied to Memory |
| 2026-07-27 | `b219cc3` perf: unblock render pipeline | Quantum state writes running inside `useMemo` (render phase) | Moved writes out of `useMemo` into `useEffect` |
| 2026-07-27 | `6e5007a`, `ee88f4c`, `b46f1ac` | System tab background work (QOS monitor, interval polling) kept running / re-rendering while the System tab was inactive, causing a stall on tab-switch back | Pause/unmount background work off-tab |
| 2026-07-28 | `be3e8fa` perf: fix two residual button-lag paths | **MemoryWidget**: `analyzeIntentions()` (a store *write*) called inside `useMemo(..., [question?.id])` — a render-phase atom write that cascaded re-renders across every `intentionEngine` subscriber. **SystemProgressWidget**: `handleGenerateReport` ran a ~139-pattern synchronous scan directly in the click handler, so the button visibly waited a beat before responding | MemoryWidget: seed state via `useState`, run `analyzeIntentions()` in a post-paint `useEffect`. SystemProgressWidget: `setTimeout(build, 0)` so the click paints before the scan runs |
| 2026-07-28 | `9364aba` perf: memoize last heavy per-render work | `SignalStreamWidget` re-sorted up to 1000 signals on every render; `UserMetricsWidget` re-ran `getUserIndex()` + `classifyPhysiologicalCohort()` unmemoized on every render | Memoized both on `engine.signals` / `engineState.signals` |

The doctrine that came out of this arc is codified as **Clause 5 — Graceful
Degradation (Render Isolation Doctrine)** in the wiki ("each widget renders
independently; one failure cannot cascade") and an earlier **Clause 1 — Render
Isolation** ("subscriptions at narrowest scope — never subscribe a parent to
trigger a child re-render", `LOT-WIKI-v55`/`v56`/`v58`/`v59`).

Note: the `be3e8fa` commit message cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`
as the agent-authored source of its fixes, but that file was never actually
committed to the repo (`git log --all` for the path returns nothing). This
document fills that gap and extends it with the current audit.

## What was checked in this audit (2026-09-17)

1. **Every `analyzeIntentions()` call site** (`src/client/stores/intentionEngine.ts`,
   and all component call sites) — confirmed each is now inside a `useEffect`,
   behind `deferHeavy()` (which prefers `requestIdleCallback`, falls back to
   `setTimeout`), behind a 5-minute cooldown-gated interval, or inside a
   `setTimeout`-deferred click handler. No render-phase or direct-click-handler
   synchronous call remains.
2. **`useMemo` bodies across `src/client`** — grepped for memo callbacks that
   invoke known store-write functions (`analyzeIntentions`, `recordQOSSignal`,
   `recordAstrologySignal`, `setUserState`, `record*Signal`). Zero matches.
3. **`onClick` handlers** — no JSX `onClick` inline-calls a `Generate*` /
   `Export*` / `Recompute*` / `Analyze*` / `Compute*` function directly; all such
   work goes through `useCallback` handlers that follow the defer pattern above.
4. **Persistence path** — `schedulePersist()` in `intentionEngine.ts` coalesces
   rapid signal writes into a single deferred `localStorage` write instead of
   stringifying up to 1000 objects synchronously per `recordSignal` call.
   Comment in source explicitly documents this was the original 2026-06-04 bug
   class.
5. **Widget re-render scope** — widgets read from `@nanostores/react`'s
   `useStore`, which subscribes at atom granularity (only re-renders on a
   change to the specific atom read), rather than relying on `React.memo`.
   Only `MemoryWidget` uses `React.memo` explicitly; this is consistent with
   the nanostores-based narrow-subscription model, not a gap.
6. **CSS** — no `transition: all` on button/`.btn` classes, no
   `backdrop-filter` usage that could cause paint jank.
7. **Open PRs** — one open PR (`#93`, calendar time-tracking, last updated
   2026-08-05) is unrelated to buttons/rendering and has been idle the same
   ~6 weeks as the rest of the repo.

## Suspected residual risk (not a confirmed bug — flagged for next deeper pass)

- `src/client/stores/intentionEngine.ts` is now **6,503 lines**; `badges.ts` is
  **8,149 lines**; `easter-eggs.ts` is **2,717 lines**. All three have grown by
  several hundred to ~1,200 lines per recent BENCHMARK/badge-codex commit
  (e.g. `91e3648` added 1,170 lines to `badges.ts` in one commit). None of this
  showed up as a *runtime* re-render problem in this audit (their exports are
  read through the same deferred/memoized paths above), but a monolithic
  store/catalog of this size does grow parse/eval cost on initial load, which
  can present to a user as "the app feels laggy" even when no single click
  handler is blocking. Worth a bundle-size / Time-to-Interactive profile next,
  since that's outside what a static code read can confirm.
- No headless-Chromium smoke test or profiling run was performed in this
  audit (this was a static/code-history review only) — the 2026-07-28 fixes
  were verified that way per their commit messages, but nothing has re-verified
  against real interaction since.

## Next steps if button lag is reported again

1. Get a concrete repro: which widget/button, cold load vs. warm, tab that was
   active before the click (matches the tab-switch-stall class from 2026-07-27).
2. Profile with Chrome DevTools Performance panel on the click — look for a
   long task starting at the `pointerup`/`click` event, same shape as the
   `handleGenerateReport` bug.
3. Check whether the click touches `analyzeIntentions()`, `recomputeAssembly()`,
   or any `badges.ts` scan — those are the three heavy, signal-count-scaling
   computations in this codebase and have caused every prior instance of this
   bug class.
4. If it's a *new* code path, apply the same doctrine: no store write in
   render phase (`useMemo`/render body), no heavy synchronous work directly in
   an event handler — defer one macrotask or move to `useEffect`.
