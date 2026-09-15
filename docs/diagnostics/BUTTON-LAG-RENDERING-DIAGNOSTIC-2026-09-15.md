# Button Lag / Rendering Diagnostic — 2026-09-15

Scheduled investigation into reported button lag and rendering problems.
This is a status audit of prior fixes plus a forward-looking risk check,
not a fresh incident — no new user-facing report exists at the time of
this scan.

## 1. This is a recurring, previously-diagnosed issue

Five merged PRs specifically targeted button lag / tab-switch stalls
between 2026-07-19 and 2026-07-28, all against `System.tsx` and its
subscriber widgets:

| PR | Root cause | Fix |
|----|-----------|-----|
| [#85](https://github.com/LOT-Systems/LOT-Computer/pull/85) | Every visited tab stays mounted (`display:none`); background intervals (60s `recomputeAssembly`, 10s pulse poll) kept running off-tab and saturated the main thread. `document.hidden` didn't catch in-app tab switches. | Added `stores.isRouteActive(route)` gate; coalesced `recordSignal` localStorage writes; moved `analyzeIntentions()` off the interaction tick via `requestIdleCallback`. |
| [#87](https://github.com/LOT-Systems/LOT-Computer/pull/87) | `SystemProgressWidget` was mounted twice (duplicate error-boundary instance), doubling mount-effect cost (`recomputeAssembly`, `analyzeIntentions`, 60s interval, a fetch). | Removed the stray mount. |
| [#88](https://github.com/LOT-Systems/LOT-Computer/pull/88) | `PatternRecognitionWidget` called `getOptimalWidget()` (which writes the `intentionEngine` atom) **in the render body**, cascading re-renders on every signal. Three System-only intervals were ungated. | Memoized on `recognizedPatterns`; gated `ChakraErgonomics`/`ContextualPrompts`/`EvolutionMilestoneToast` intervals on `isRouteActive('system')`. |
| [#94](https://github.com/LOT-Systems/LOT-Computer/pull/94) | `MemoryWidget` ran `analyzeIntentions()` (a store write) inside a `useMemo` — a render-phase atom write. `SystemProgressWidget.handleGenerateReport` ran a ~139-pattern scan synchronously inside the click handler, blocking the click response ("click, then a beat, then it happens"). | Moved to `useEffect` with a seeded `useState` for identical first paint; deferred the report build one macrotask off the click path. |
| [#95](https://github.com/LOT-Systems/LOT-Computer/pull/95) | `SignalStreamWidget` re-sorted up to 1000 signals every render; `UserMetricsWidget` ran `getUserIndex()` + `classifyPhysiologicalCohort()` unmemoized every render. | Memoized both on stable atom refs. Verified: 5 rapid System↔Log switches went from a heavy task per switch to a one-time ~118ms mount. |

**Current state: all five fixes are intact on `main`** (verified by reading
`System.tsx:262-271`, `MemoryWidget.tsx:266-275`,
`PatternRecognitionWidget.tsx:71-80`, and
`SystemProgressWidget.tsx:1621-1629` directly — the guarding comments and
`useEffect`/`useMemo` structure from each PR are all present, including
through the later `System.tsx` merge-conflict resolution commit
(`73edd95`)).

Note: the `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md` file that
PR #94's description says it was applying fixes "from" does not exist in
the repository (not in the current tree, not in git history under any
path). Either it lived only in that session's local/ephemeral state and
was never committed, or it was written to a location outside this repo.
Worth a quick check with whoever ran that session if the source diagnostic
is needed for reference.

## 2. Forward-looking risk: unbounded growth of the pattern-matching scan

The mechanism `analyzeIntentions()` in
[`intentionEngine.ts`](../../src/client/stores/intentionEngine.ts) is the
common thread in nearly every fix above — it's a synchronous scan over
every defined "intention pattern," called on a 5-minute cooldown, gated by
`requestIdleCallback`/`useEffect` so it no longer blocks paint directly.

That scan has grown substantially since it was last performance-validated:

- PR #85 (2026-07-19): scan sized at **125 patterns**.
- PR #94 (2026-07-28): scan sized at **139 patterns**.
- Current `main` (2026-08-05, commit `d7f076e`): **151 patterns**
  (`src/client/stores/intentionEngine.ts` is now 6,503 lines; the last
  three added patterns, P149-151, are composite patterns that reference
  several prior patterns' outputs each).

This growth comes from the recurring "BENCHMARK" self-assembly sessions,
which add 2-3 new patterns roughly every one to two days with no
accompanying re-profiling step in their own session reports (checked
`docs/LOT-SR-*.md` and the wiki-scan reports — the benchmark gate is
`tsc --noEmit` + `npm run build`, not a runtime perf check).

Why this matters: `requestIdleCallback`/`setTimeout(0)` (`deferHeavy()`,
`intentionEngine.ts:168-175`) only delays *when* `analyzeIntentions()`
starts — it does not chunk the work. Once triggered, the full scan across
all 151 (and counting) patterns still runs synchronously to completion in
one turn of the event loop. `requestIdleCallback` typically only
guarantees a ~50ms idle budget per frame; if a single pass now exceeds
that (plausible given the pattern count has grown ~21% since the last
benchmarked timing of "~118ms" for a full System mount, which itself
already included pattern analysis), the browser will drop frames and
queued input (including button clicks) stalls until the scan finishes —
which is exactly the symptom the five prior PRs fixed, just reintroduced
by scale rather than by a code-level regression.

This hasn't been reproduced with fresh profiling in this session (no
browser/profiler available here), so it's a suspected risk based on the
trendline, not a confirmed live bug.

## 3. One user-triggered synchronous call worth a second look

[`Logs.tsx:3975`](../../src/client/components/Logs.tsx#L3975): the
`/qos` command trigger calls `analyzeIntentions()` directly, synchronously,
on submit — not deferred like every other call site in the codebase (all
others go through `deferHeavy()` or a `useEffect`). It's a deliberate
on-demand action rather than a background interval, so the blast radius is
smaller, but on a cache-miss (>5 min since last analysis) it will block
the input's response for however long the now-151-pattern scan takes,
same class of issue as the one fixed in PR #94 for the report-generation
button.

## 4. Currently open PR to watch

[#93](https://github.com/LOT-Systems/LOT-Computer/pull/93) (open, not yet
merged) adds `CalendarEventToast.tsx`, a new component mounted in
`System.tsx` with a 30-second poll interval. It already gates correctly
on `document.hidden` and `isRouteActive('system')`, matching the pattern
from PR #85/#88 — no issue found — but given this exact file
(`System.tsx`) and exactly this bug class (ungated interval on a
permanently-mounted widget) is the repeat offender above, it's worth a
deliberate re-check at merge time rather than assuming past fixes
generalize.

## Suspected causes, ranked

1. **Not currently broken** — the five documented lag paths are correctly
   fixed on `main` as of this scan.
2. **Rising risk** — `analyzeIntentions()`'s pattern count has grown ~21%
   past its last profiled baseline with no re-profiling cadence; likely to
   cross the idle-callback frame budget if not already close, given each
   new pattern composes on top of several prior ones.
3. **Minor, contained** — the `/qos` command's un-deferred synchronous
   call is the one remaining call site that doesn't follow the
   defer-off-the-click-path convention established by PR #94.

## Next steps (not yet done — no code changes made this session)

- Get a fresh Chromium profiling run (the same headless-Chromium harness
  used in PR #95, seeded with realistic signal/pattern volume) to measure
  current `analyzeIntentions()` wall-clock time and confirm/refute whether
  it now exceeds the idle-callback budget.
- If confirmed, chunk the pattern scan (e.g. process patterns in batches
  across multiple idle callbacks, or short-circuit composite patterns that
  depend on inputs that haven't changed) rather than continuing to add
  patterns to an ever-growing single-pass scan.
- Add a lightweight perf regression check to the benchmark session
  protocol (`docs/assembly/`) — e.g. assert `analyzeIntentions()`
  completes under a fixed budget with N signals — so pattern growth stops
  silently eroding the headroom the last five perf PRs bought back.
- Defer the `/qos` trigger in `Logs.tsx` the same way PR #94 deferred
  `handleGenerateReport`, for consistency and to close the one remaining
  un-deferred call site.
- At PR #93's merge time, re-confirm `CalendarEventToast`'s gating still
  holds after any rebase, since this is precisely the file/pattern history
  where gating has previously been dropped silently.
