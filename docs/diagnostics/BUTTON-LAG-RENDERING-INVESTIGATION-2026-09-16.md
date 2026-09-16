# Button Lag / Rendering Investigation — 2026-09-16

Scheduled audit of the "buttons lagging / rendering problems" issue class.
Scope: recent commit history, open issues/PRs, and a fresh grep of the
current codebase for recurrences of the known anti-pattern. No new user
report or open issue triggered this — it is a periodic health check.

## Summary

There is no *currently open* button-lag issue. There is, however, a long
and well-documented **recurring bug class** — render-phase store writes and
unmemoized heavy work re-running on every re-render — that was hit and
re-fixed at least **8 separate times between 2026-06-05 and 2026-07-28**
across the System/Log tab widget tree. The pattern is now codified as the
"Render Isolation" clause in `docs/benchmark/LOT-DOCTRINE.md`, and as of the
last commit on `master` (`98971f2`, 2026-08-05) a full grep of
`src/client/components` finds no remaining instance of it: every
`analyzeIntentions()` / `recomputeAssembly()` call site runs inside a
`useEffect` or an event handler, never inside `useMemo`/render body.

The repository has had **no commits since 2026-08-05** (six weeks of
inactivity as of today), so nothing has changed to reintroduce the bug —
but nothing has been actively re-verified in that window either, and the
`System.tsx` widget tree keeps growing with every self-assembly benchmark
cycle, which is exactly the growth pattern that caused each prior
recurrence.

## Timeline of prior fixes (chronological)

| Date | Commit | Root cause | Fix |
|---|---|---|---|
| 2026-06-05 | `f5eb6a82` | `MemoryWidget` re-rendered on every parent update | Wrapped in `React.memo` |
| 2026-06-09 | `4355723b` | Nav subscribed to whole `me` store; chime toggle not full-row clickable | Narrowed subscription to `isLoggedIn`; full-row `onClick` |
| 2026-06-12 | [`2c0da2ff`](https://github.com/LOT-Systems/LOT-Computer/commit/2c0da2ff9846ed0e3cc9e5fbeacd945e8385be02) | `grid-fill-hover` transitioned `background-image` (two recomputed gradients) — not GPU-accelerable, jittery repaint on hover across all buttons | Replaced with a pre-rendered `::before` pseudo-element, hover toggles opacity (GPU-composited) |
| 2026-06-23 | `ad37d19d` | All 5 `TabPanel`s subscribed to `stores.router`; every route change re-rendered the entire System tree (14+ stores, 40+ widgets) | `active` passed as a prop with custom `React.memo` comparator |
| 2026-06-27 | `b68e8425`/`fafd50e9`, `1271cd3e` | `App` re-rendered on unrelated store changes (`isSoundOn`/`isRadioOn`/etc.), cascading into `TabPanels`; tab switch itself was slow | Memoized `TabPanels`/`DynamicRoutes`/`Logs`/`System`/`Sync`/`Settings` |
| 2026-07-18 | [`b219cc37`](https://github.com/LOT-Systems/LOT-Computer/commit/b219cc37c1acf419c787aa8db44cfbd2ef79012c) | `System.tsx`: `analyzeIntentions()` + `recomputeAssembly()` (both write nanostores atoms) called inside `useMemo` — a render-phase store write scheduling 10 re-renders before paint | Moved to `useEffect`, seeded with `useState` for an identical first paint |
| 2026-07-19 | `ee88f4c8`, `6e5007a4`, `d922509b`, `add997e6` | `PatternRecognitionWidget.getOptimalWidget()` (calls `analyzeIntentions`) ran unmemoized in the render body; several System-only intervals (2min/15s/30s) kept running while on another tab; duplicate `SystemProgressWidget` mount doubled all mount-effect work | Memoized on `recognizedPatterns`; gated intervals on `isRouteActive('system')`; removed duplicate mount |
| 2026-07-25 | [`b46f1ac9`](https://github.com/LOT-Systems/LOT-Computer/commit/b46f1ac9550e5afdeb70f2e057be78096f92325e) | System's ~7 subscriber widgets stayed mounted (`display:none`) after first visit, so *any* signal from *any* tab re-rendered them in the background until the main thread saturated | System now fully unmounts via `unmountWhenInactive` on `TabPanel` when inactive |
| 2026-07-28 (PR #94) | [`be3e8fa`](https://github.com/LOT-Systems/LOT-Computer/commit/be3e8fae8e799944bb35509d28ffd6b4e7c5c582) | `MemoryWidget`: same `useMemo`-writes-atom pattern as System.tsx, missed in the earlier pass; `SystemProgressWidget.handleGenerateReport`: ran a ~139-pattern synchronous scan **inside the click handler**, so the Generate Report button visibly waited before responding | `useEffect` + `useState` seed (matches System.tsx pattern); deferred the whole build one macrotask via `setTimeout(build, 0)` so the click responds instantly |
| 2026-07-28 (PR #95) | [`9364aba`](https://github.com/LOT-Systems/LOT-Computer/commit/9364aba5d89615f7b2d03db0d42fa0cb2829478d) | `SignalStreamWidget` copy+sorted up to 1000 signals every render; `UserMetricsWidget` ran `getUserIndex()`+`classifyPhysiologicalCohort()` unmemoized every render | Memoized both on `engine.signals` |

An older, narrower instance also appears in commit `78745c3c` (2026-06-21,
message: *"Fix Memory button lag: defer recordSignal() via setTimeout(0)"*)
and the diagnostic that seeded PR #94,
`docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md` (referenced by
`be3e8fa`'s commit message; the file itself is no longer present in the
repo — it looks like it was consumed/removed after its fixes landed).

## Root cause pattern (per LOT-DOCTRINE "Render Isolation")

Two variants of the same underlying mistake, repeated across widgets as new
ones were added to the System tab:

1. **Render-phase store writes.** A function that writes a nanostores atom
   (`analyzeIntentions()`, `recomputeAssembly()`, `recordSignal()`) gets
   called from inside `useMemo` or the render body instead of `useEffect`.
   The write schedules re-renders on every subscriber of that atom
   *synchronously, before the browser paints* — so a single state change
   fans out into a burst of re-renders across the whole System widget tree
   before the user sees anything.
2. **Unmemoized heavy work in hot paths.** Sorting/copying large arrays
   (up to 1000 signals) or running multi-hundred-pattern classification
   scans on every render (not just when their inputs change), or — worse —
   synchronously inside a button's `onClick` handler, so the click visibly
   waits for the scan to finish before the UI responds ("click, then a
   beat, then it happens").

Doctrine fix shape is consistent every time: seed a `useState` for the
first paint, do the atom-writing/heavy work in `useEffect` (or
`setTimeout(fn, 0)` for a click handler) so it runs *after* paint, and
memoize expensive derivations on the specific store field that changes
(e.g. `engine.signals`), not the whole store object (which gets a new ref
every write).

## Current state of the codebase (verified 2026-09-16)

Grepped `src/client/components` for every `analyzeIntentions()` /
`recomputeAssembly()` call site:

- `System.tsx:268-269` — inside `useEffect`, `useState` seed present (fixed, `b219cc37`/doctrine pattern).
- `MemoryWidget.tsx:274` — inside `useEffect`, `useState` seed present (fixed, `be3e8fa`).
- `SystemProgressWidget.tsx:1554-1564` — inside a route-gated interval callback, not render/useMemo (fixed, `ee88f4c8`/`b46f1ac9`).
- `SystemProgressWidget.tsx:1622-1633` (`handleGenerateReport`) — wrapped in `setTimeout(build, 0)` inside the click handler (fixed, `be3e8fa`).
- `PatternRecognitionWidget.tsx:73` — `getOptimalWidget()` wrapped in `useMemo` keyed on `patterns`, not raw render body (fixed, `6e5007a4`).
- `QuantumEngineWidgets.tsx:264` — inside `useEffect` with `[]` deps (mount-only).
- `Logs.tsx:3975` — inside an explicit trigger handler (`/qos` slash command), not render path.

**No render-phase (`useMemo`/render-body) store-write instance found.** The
codebase, as it stood at the last commit (`98971f2`, 2026-08-05), is clean
of the specific bug class documented above.

Open PRs: only **#93** (`feat(calendar): time tracking + military-grade
due-event toast`, opened 2026-07-28, last updated 2026-08-05) is open, and
it is unrelated to buttons/rendering by title and scope — not reviewed in
depth here since it doesn't touch the widget files above.

No open GitHub issues match "button lag", "rendering", "slow button", or
"re-render" (search returned zero results).

## Suspected causes if lag resurfaces

Given the recurrence pattern, the most likely reintroduction vectors for a
*future* instance are:

- A newly self-assembled widget (the System tab gains widgets on every
  benchmark cycle — 40+ at last count) calling a store-write function
  (`analyzeIntentions`, `recomputeAssembly`, `recordSignal`,
  `recordQOSSignal`/`recordOSSignal`) from `useMemo` or plain render body
  instead of `useEffect`.
- A new button handler running a synchronous heavy computation (pattern
  scans, large-array sort/copy, JSON.stringify of large localStorage blobs)
  directly in `onClick` instead of deferring via `setTimeout(fn, 0)`.
- A new always-mounted System widget with an ungated interval that keeps
  ticking (and re-rendering / writing atoms) while the user is on another
  tab, bypassing the `isRouteActive('system')` / `unmountWhenInactive` gates
  established in `ee88f4c8` and `b46f1ac9`.

## Next steps

1. **No action needed right now** — the codebase is clean as of the last
   commit and there is no active report to chase.
2. If lag is reported again, first check whether it's on a widget added
   *after* 2026-08-05 (none currently exist since the repo has been quiet),
   since that's the exact pattern behind every prior recurrence.
3. Consider adding a lint rule or code-review checklist item enforcing
   "no store-write calls inside `useMemo`/render body" to catch this class
   before it ships again, rather than relying on repeated manual
   diagnostic/fix cycles (8 rounds so far).
4. The referenced `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md` no
   longer exists in the repo; if kept for provenance in future
   diagnostics, don't delete the diagnostic doc after applying its fixes —
   move it to a `resolved/` subfolder instead so the investigative trail
   isn't lost.
