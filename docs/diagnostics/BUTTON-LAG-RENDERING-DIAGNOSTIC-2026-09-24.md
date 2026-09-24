# Button Lag & Rendering Diagnostic — 2026-09-24

Scheduled investigation ("Button lag investigation" routine). Scope: review
recent history for button-lag / rendering-performance work, re-check the
current codebase for the same class of bug, and record findings.

## 1. Current status: no open issue

- No open GitHub issues or PRs in `LOT-Systems/LOT-Computer` reference button
  lag, rendering performance, or slow UI (`search_issues`/`search_pull_requests`
  both return 0 matches; `list_issues` for the repo returns 0 open issues).
- The branch (`master`, and this session's `claude/brave-rubin-jk1fic`) has
  had no commits since **2026-08-05** (PR #96, `98971f2`) — 7 weeks of
  inactivity as of this run. There is no new code to have regressed the
  earlier fixes.

## 2. History: the issue was diagnosed and fixed on 2026-07-28–08-05

Two PRs on this repo were specifically about button lag / render performance:

### PR #94 — `perf: fix two residual button-lag paths flagged by agent diagnostic`
(commit [`be3e8fa`](../../.git), merged as `e65b1f6`)

Root cause pattern: **render-phase store writes** and **synchronous heavy
work inside click handlers**, both violating what the codebase calls the
"Render Isolation" doctrine (writing to a nanostores atom during render
triggers a cascade of synchronous re-renders across every subscriber before
the browser can paint).

- `MemoryWidget.tsx`: `analyzeIntentions()` (a store write) ran inside a
  `useMemo` keyed on `question?.id` — moved to a `useEffect` (post-paint)
  with a `useState` seed for an identical first render.
- `SystemProgressWidget.tsx`: `handleGenerateReport` ran `analyzeIntentions()`
  (a ~139-pattern scan on a cooldown miss) synchronously inside the button's
  click handler, blocking the click from visibly responding. Deferred the
  build with `setTimeout(build, 0)` so the click responds before the work
  runs.

### PR #96 — `perf: memoize last heavy per-render work in System subscriber widgets`
(commit [`9364aba`](../../.git))

Root cause: two widgets stayed mounted on the System tab and redid **heavy
unmemoized work on every re-render**, including renders triggered by
unrelated `intentionEngine` writes elsewhere on the page.

- `SignalStreamWidget.tsx`: copied + sorted up to 1000 signals every render
  → memoized on `engine.signals`.
- `UserMetricsWidget.tsx`: ran `getUserIndex()` + `classifyPhysiologicalCohort()`
  unmemoized every render → moved into `useMemo` keyed on `engineState.signals`,
  placed before the component's early returns (Rules of Hooks).

Measured effect (from the PR): 5 rapid System↔Log tab switches went from "a
heavy task per switch" to a one-time ~118ms mount cost, then cheap.

A referenced diagnostic, `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`
(described as agent-authored), is not present in the repository — it appears
to have been a scratch file from the authoring session rather than a
committed artifact, so it could not be reviewed directly. The commit messages
above describe its findings in full.

## 3. Re-check: is the same bug class present anywhere else today?

Searched the full `src/client` tree for the two failure modes fixed above:

- **Store writes inside `useMemo`/render body.** Every remaining
  `analyzeIntentions()` call site was checked:
  - `System.tsx:268` and `MemoryWidget.tsx:274` — inside `useEffect`, correct
    pattern (this is in fact the pattern PR #94 copied from `System.tsx`).
  - `SystemProgressWidget.tsx:1555` — inside a mount-only `useEffect`.
  - `PatternRecognitionWidget.tsx:78` — `getOptimalWidget()` (which calls
    `analyzeIntentions()`) is memoized on `patterns`, with a comment
    explicitly citing this exact bug class.
  - `Logs.tsx:3975` — fired from the `/qos` slash-command submit handler, not
    a UI button; also a no-op within its 5-minute cooldown in the common case.
  - No remaining call site runs it directly inside a `useMemo`/render body.
- **Heavy synchronous work inside a click handler.** No `onClick` handler in
  `src/client/components` calls `analyzeIntentions`,
  `classifyPhysiologicalCohort`, `getEnrichedPhysiologicalReport`, or
  `getUserIndex` synchronously — the one prior offender
  (`SystemProgressWidget.handleGenerateReport`) is the deferred version from
  PR #94.
- **Other per-render cost.** Spot-checked `QuantumEngineWidgets.tsx` and the
  System-tab widgets for unmemoized `.sort`/`.filter`/`.map` over large
  arrays; remaining instances operate on small, already-bounded arrays
  (`.slice(0, 4)`–`.slice(0, 6)` views, connection-status booleans) and are
  not re-render hazards on the scale of the fixed 1000-signal sort.
- **Interval timers near buttons.** Two low-frequency `setInterval`s exist
  (`breathe.ts` at 100ms, `System.tsx` loading-dots at 500ms); both only
  update small local state (an animation frame / a dot counter) and are
  unrelated to button responsiveness.

No instance of either fixed bug class remains in the current codebase.

## 4. Conclusion

The two known button-lag root causes (render-phase intention-engine writes,
and synchronous heavy analysis inside click handlers) were diagnosed and
fixed in PRs #94 and #96 (2026-07-28 and 2026-08-05). Re-scanning the current
codebase found no recurrence and no new instance of either pattern. There
have been no commits since, and no new user reports or GitHub issues/PRs
describing button lag or rendering problems.

**Status: no active button-lag issue identified.** Nothing was reproduced,
and no fix was required this cycle.

## 5. Next steps if lag resurfaces

Static review can't catch everything a real session would — in particular it
can't measure actual paint timing or catch new anti-patterns introduced in
future widgets. If a lag report comes in:

1. Reproduce with the headless-Chromium harness pattern used in PR #96
   (seed `intentionEngine` with a large signal/log set, record heavy tasks
   across tab switches / button clicks via the DevTools Performance API).
2. Check whether the report names a specific widget/button; if so, grep that
   file first for `useMemo`/`useState` initializers and `onClick` handlers
   that call into `src/client/stores/intentionEngine.ts` or other files
   under `src/client/stores/`.
3. Since no code has shipped since 2026-08-05, a fresh report at this point
   would most likely point to a device/browser-specific issue, a regression
   in a dependency, or a not-yet-covered widget rather than a repeat of the
   patterns above — worth confirming which widget/action first before
   assuming the same root cause.
