# Button Lag & Rendering — Investigation (2026-09-13)

Scheduled audit. No live bug report triggered this — this is a periodic sweep
of commit/PR/issue history and current source for the button-lag class of
defect that has recurred several times in this codebase.

## 1. Current repo state

- `master` HEAD: `98971f2` (merge of PR #96), dated 2026-08-05.
- No commits on any branch since 2026-08-05 — over five weeks of inactivity
  as of this audit.
- No open GitHub issues in `LOT-Systems/LOT-Computer`.
- One open PR: **#93** `feat(calendar): time tracking + military-grade
  due-event toast` (stale since 2026-08-05, unrelated to buttons/rendering).
- **No new or open button-lag report exists right now.** This audit found no
  active incident — see "Conclusion" below.

## 2. History of the button-lag class of bug

This exact failure mode ("click, then a beat, then it happens") has been
fixed in this codebase at least nine times, each time in a different
component, following the same root cause: **synchronous heavy work
(pattern analysis, sorting, atom writes) running either in the render phase
or directly inside a click handler, blocking the paint that gives the click
its visual response.**

Chronological (oldest → newest):

| Date | Commit | Fix |
|---|---|---|
| 2026-02-10 | `ecb4682` | Memory widget button fade cascade |
| 2026-04-11 | — | Micro-game controller/button layout passes (cosmetic, not perf) |
| 2026-06-01 | `2966592` | First benchmark pass: tab-switch ref/state fix, memory button `invalidateQueries` fix |
| 2026-06-02 | `13b2692` | **Eliminate tab switch latency** — `React.memo` on tab panels, `NavButton` memoized, `content-visibility: hidden` on inactive panels, `touch-action: manipulation`, added the `window.__LOT_PERF__` INP/LoAF observer (`src/client/utils/perf.ts`) |
| 2026-06-03 | `4d48dfb` | **Button.tsx subscription reduction** — split `Button` into kind-specific sub-components so the default `secondary` button has *zero* store subscriptions; minted the "Subscription Minimization" doctrine clause |
| 2026-06-05 | `26f8009` | Biofield check-in cascade — moved a state update out of an API `onSuccess` callback so the animation starts on click, not after the round-trip |
| 2026-06-12 | `2c0da2f` | **CSS hover lag** — `grid-fill-hover` was transitioning `background-image` (two recomputed linear-gradients, not GPU-compositable). Replaced with a pre-rendered `::before` pseudo-element toggled by `opacity` |
| 2026-06-21 | `78745c3` | Memory button lag — deferred `recordSignal()` via `setTimeout(0)` so React commits the visual click feedback before the synchronous localStorage + pattern-analysis work |
| 2026-07-04 | `bd9ef2a` | **Planner buttons frozen** — `playClickSound()` created a new `AudioContext()` per click; once the browser's live-instance cap was hit the constructor threw, killing the handler before the state write. Fixed with one shared, reused `AudioContext` + a try/catch around the whole sound body |
| 2026-07-28 | `9364aba`, `be3e8fa` | Most recent pass (PR #94, #95): `SignalStreamWidget`/`UserMetricsWidget` redid heavy sort/classify work on every render from *any* `intentionEngine` write (fixed with `useMemo` keyed on `engine.signals`); `MemoryWidget` ran the store-writing `analyzeIntentions()` inside a `useMemo` (render-phase atom write cascading re-renders); `SystemProgressWidget.handleGenerateReport` ran a ~139-pattern scan synchronously inside the click handler (deferred one macrotask via `setTimeout`) |

That last pass explicitly says it was applying fixes from an
"agent-authored" `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md` — that
file was never committed to the repo (checked full history, all branches),
so whatever diagnostic produced it lived outside version control.

## 3. Standing infrastructure against this bug class

Two things this codebase already has in place specifically to catch this:

- **`window.__LOT_PERF__`** (`src/client/utils/perf.ts`, added 2026-06-02):
  a `PerformanceObserver` on `event` (INP-style, >50ms durationThreshold) and
  `long-animation-frame` entries. Logs a `console.warn` for any interaction
  over 200ms and keeps the last 50 entries in memory via
  `getPerfEntries()`. **It does not persist or transmit anything** — it's a
  devtools-console aid only, so it can't tell us whether real users are
  currently hitting slow interactions; someone has to have devtools open
  when it happens.
- **Doctrine clauses** ("Render Isolation", "Subscription Minimization")
  referenced in commit messages as a standing design rule: store writes
  belong in effects/handlers, never in render/`useMemo`; components should
  subscribe to the narrowest store slice they need.

## 4. Audit performed now

Grepped the current `src/client` tree for the two known anti-patterns:

1. `analyzeIntentions()` calls (the store-writing, pattern-scanning
   function at the center of every recent fix) — found in `System.tsx`,
   `Logs.tsx`, `SystemProgressWidget.tsx`, `MemoryWidget.tsx`, and
   `intentionEngine.ts` itself. Checked each call site:
   - `System.tsx:268` — inside `useEffect`, not `useMemo` (correct, matches
     the fixed pattern).
   - `MemoryWidget.tsx:274` — inside `useEffect` (fixed in `be3e8fa`,
     still correct).
   - `SystemProgressWidget.tsx:1629` — deferred via `setTimeout` inside the
     click handler (fixed in `be3e8fa`, still correct).
   - `Logs.tsx:3975` — inside a slash-command trigger handler (`qos-report`),
     not a direct button `onClick`; not part of the fixed set and not an
     obviously blocking path, but worth a closer look if this specific
     trigger is ever reported as slow (see Next steps).
   - `intentionEngine.ts:5126/5130` — inside `startBackgroundQOSMonitor`'s
     interval callback, not on any click path.
2. `Button.tsx` — confirmed it still has no `useMemo`/`useEffect`/store-write
   calls of its own, consistent with the subscription-minimization fix.

No new instance of the previously-fixed anti-patterns was found in the
current tree.

## 5. Conclusion

There is currently **no active, reported button-lag issue** in this
repository: no open issue, no open PR, and the last four fix cycles (PRs
#90, #92, #94, #95) already walked the codebase's widgets and closed every
known instance of the pattern. The repo has also had no commits in five
weeks, so there's no recent change that could have reintroduced a
regression.

This document exists to record that the sweep ran and came back clean, and
to leave a trail for whoever investigates the next real report.

## 6. Next steps if a new report comes in

- **Wire `window.__LOT_PERF__` to persistence.** Right now a slow
  interaction only surfaces if someone has devtools open at the moment it
  happens. Even a low-effort `navigator.sendBeacon` to an existing log
  endpoint on entries over the INP threshold would turn this from a manual
  aid into an actual early-warning signal.
- **Add a regression guard.** Nine separate fixes for the same failure mode
  suggests a Playwright/headless-Chromium smoke test that seeds
  `intentionEngine` with a realistic signal/log count (as the 2026-07-28
  fixes did manually) and asserts click-to-paint time on the System/Log
  tab buttons stays under a fixed budget — so the next instance of this
  pattern fails CI instead of shipping.
- **`Logs.tsx:3975`** (`qos-report` trigger) is the one `analyzeIntentions()`
  call site not covered by an existing fix commit. It doesn't sit behind a
  literal button `onClick`, but if a slash-command submit is ever reported
  as sluggish, start there.
