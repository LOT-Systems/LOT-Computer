<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Button Lag / Rendering Investigation — 2026-09-22

Scheduled investigation into recurring "buttons lagging / rendering problems"
reports. This is a code + history audit, not a live production profiling
session (no browser access from this environment). No open GitHub issue or
PR currently references button lag — the pattern lives entirely in commit
history from prior self-diagnosed agent sessions.

## Summary

The button-lag bug class is well understood and has been fixed **five
separate times** between late June and late July 2026, always with the same
root shape: a synchronous write to the shared `intentionEngine` nanostore
atom (or a heavy synchronous computation) runs either during React's render
phase or inside a click handler, blocking the browser from painting the
button's own pressed/response state until the work finishes. The fixes are
real and verified (headless-Chromium smoke tests are cited in the commit
messages), but each fix has been *reactive and per-widget* — new widgets
keep getting added (QIE v108 → v113 alone added ~4 new archetypes, patterns,
and a Circadian phase row) without a follow-up perf pass, so the bug class
is structurally likely to recur. This session found one residual redundant
computation (not a regression, but worth cleaning up) and confirms the
architecture that keeps reintroducing this class of bug.

## Confirmed history (git log)

Chronological, oldest first:

| Commit | Date (approx) | Fix |
|---|---|---|
| `bd9ef2a` | late Jun 2026 | Planner buttons frozen — reused `AudioContext` instead of creating one per click, caught sound errors |
| `863b333` | Jul 2026 | Widget lag — capped Logs query size, backed off stats polling |
| `b219cc3` | Jul 2026 | Moved quantum-state atom writes out of a `useMemo` (render phase) to unblock the render pipeline |
| `ee88f4c` | Jul 2026 | Paused System-tab background work when tab inactive — fixed tab-switch freeze |
| `6e5007a` | Jul 2026 | Stopped a render-phase atom write causing tab-switch stall |
| `b46f1ac` | Jul 2026 | Unmounted the System tab entirely when inactive to end background churn |
| `be3e8fa` | 28 Jul 2026 | **`MemoryWidget`**: `analyzeIntentions()` (an atom *write*) was running inside `useMemo(..., [question?.id])` — moved to `useEffect` w/ `useState` seed. **`SystemProgressWidget`**: `handleGenerateReport` ran a ~139-pattern scan synchronously in the click handler — deferred via `setTimeout(build, 0)` so the click responds before the work runs |
| `9364aba` | 28 Jul 2026 | **`SignalStreamWidget`**: unmemoized sort of up to 1000 signals on every render — memoized on `engine.signals`. **`UserMetricsWidget`**: `getUserIndex()` + `classifyPhysiologicalCohort()` ran unmemoized every render — memoized, moved above early returns |

`be3e8fa`'s message references an agent-authored
`docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md` — that file was never
committed to the repo (it was evidently a scratch file in that session's
workspace), so this write-up is the first version of that diagnostic to
actually land in `docs/`.

**No perf-focused commits have landed since `9364aba` (28 Jul 2026).**
Everything after that on `master` is content/feature work: QIE v110–v113
(Arch48–Arch51, patterns P140–P151), the Circadian doctrine, astrology
personalization, and wiki/benchmark checkpoints — none of it re-ran the
lag diagnostic despite adding new subscriber widgets.

## Root cause pattern (the doctrine, as documented in-repo)

`src/client/components/System.tsx:262-271` has the clearest statement of the
now-established fix pattern:

```
// Quantum state - analyze intentions and get current user state
// useEffect (not useMemo) so atom writes happen after paint, not during render.
// Writing to nanostores atoms inside useMemo cascades 10 synchronous re-renders
// before the browser can paint, causing visible UI lag on every logs change.
const [quantumState, setQuantumState] = React.useState(() => getUserState())
React.useEffect(() => {
  analyzeIntentions()
  recomputeAssembly()
  setQuantumState(getUserState())
}, [logs])
```

Two failure modes recur:

1. **Render-phase store write.** `analyzeIntentions()` and friends *write*
   the `intentionEngine` atom. Calling a write function inside `useMemo`
   (or directly in the render body) triggers nanostore's synchronous
   subscriber notification before React can commit/paint — every other
   component subscribed to `intentionEngine` re-renders too, cascading.
2. **Heavy synchronous work in a click handler.** `analyzeIntentions()` on a
   cache-miss runs a full scan over the pattern table (now 51 patterns/
   archetypes as of Arch51). Running it inline in an `onClick` blocks the
   click from visually resolving until the scan finishes — "click, then a
   beat, then it happens."

## Architectural root cause (why this keeps coming back)

`src/client/stores/intentionEngine.ts:96` defines one shared nanostore atom,
`intentionEngine`, holding *all* signals, patterns, and user state for the
whole app. At least seven components subscribe to the entire atom via
`useStore(intentionEngine)`:

- `AIFeedbackWidget.tsx`
- `PatternRecognitionWidget.tsx`
- `QuantumEngineWidgets.tsx`
- `QuantumStateWidget.tsx`
- `SignalStreamWidget.tsx`
- `SystemPulseWidget.tsx`
- `UserMetricsWidget.tsx`

nanostores notifies **all** subscribers on **any** write to the atom —
there's no field-level selector. So every `recordSignal(...)` call anywhere
in the app (49 call sites across `src/client/components/*.tsx`) re-renders
all seven widgets, regardless of whether the fields they actually read
changed. The fixes so far have all been "memoize this widget's expensive
derivation so re-renders are cheap" rather than narrowing what triggers a
re-render in the first place. That means:

- Each new widget added to this subscriber list starts from zero — it has
  to independently rediscover and apply the memoization discipline, and
  several already have (per the comments in `MemoryWidget.tsx` and
  `PatternRecognitionWidget.tsx` explicitly citing this doctrine), but
  there's no lint rule or test enforcing it.
- `System.tsx` alone mounts 30+ widget components when the System tab is
  active (see its import list), several of which are in the subscriber list
  above — this is why "tab-switch stall" was its own separate bug class
  (`ee88f4c`, `b46f1ac`, `6e5007a`) on top of the click-lag bugs.

## Residual finding from this session

`src/client/components/QuantumEngineWidgets.tsx:201-205` and `:373-376`:
`classifyPhysiologicalCohort()` is computed **twice** per render while the
widget's `cohort` view is active — once memoized as `cohortDirective`, and
again unmemoized inline inside the JSX (`live = ... classifyPhysiologicalCohort(...)`).
`classifyPhysiologicalCohort` is a pure read (doesn't write the atom, so it
doesn't cascade re-renders the way the fixed bugs did), and it now scores
against 51 archetype definitions on every call
(`src/client/stores/intentionEngine.ts` `PHYSIOLOGICAL_ARCHETYPES`), so the
duplicate call is a real but modest waste — roughly 2x the cost of that one
computation, only while a user is looking at the cohort view. Not urgent,
but a natural first fix in a follow-up pass: read `live` from `cohortDirective`'s
memo (or fold the JSX branch into the same `useMemo`) instead of recomputing.

## Existing production instrumentation

`src/client/utils/perf.ts`, wired up in `src/client/entries/app.tsx:310`,
already installs a `PerformanceObserver` for `event` timing (INP) and
`long-animation-frame` entries, warning to the browser console for any
interaction over 200ms or frame over 50ms. **It only logs to
`console.warn`** — nothing is sent to a backend or error-tracking service,
and entries are kept in an in-memory ring buffer (`window.__LOT_PERF__`)
that's lost on navigation/reload. This means: there is currently no way to
know whether button lag is happening for real users in production without
someone manually opening devtools, and no historical record once a session
ends. All lag detection to date has come from agents manually reproducing
the issue in headless-Chromium with synthetic signal/log data, not from
production telemetry.

## Suspected causes, ranked

1. **Structural**: shared coarse-grained `intentionEngine` atom + growing
   subscriber count. Confirmed via code; the primary reason this bug class
   recurs across releases rather than a one-time fix.
2. **Process gap**: no automated check (lint rule, test, or CI perf budget)
   enforces the "no atom writes in render phase / useMemo" doctrine that's
   only documented as inline comments in a few files. New widgets can
   silently reintroduce it.
3. **Observability gap**: `perf.ts`'s INP observer never leaves the
   browser console, so regressions between agent-run diagnostic sessions
   (last one: 28 Jul 2026) go undetected until someone notices manually.
4. **Minor/confirmed**: duplicate `classifyPhysiologicalCohort()` call in
   `QuantumEngineWidgets.tsx` (see above) — low severity, easy fix.

## Next steps

- [ ] Run a fresh headless-Chromium repro (as prior sessions did, seeded
      with realistic signal/log volume) against the *current* `master` to
      confirm whether the QIE v110–v113 widgets (Circadian phase row,
      Arch48–51 cohort scoring) introduced any new render-phase writes —
      this audit was static/code-only and could not execute the app.
  This isn't executable from the current environment (no browser); a session
  with dev-server + browser access should do this before further code
  changes.
- [ ] Consolidate the duplicate `classifyPhysiologicalCohort()` call in
      `QuantumEngineWidgets.tsx` (`:201-205` / `:373-376`).
- [ ] Consider narrowing `intentionEngine` subscriptions — either split the
      atom (e.g. separate `signals` from derived `userState`/`patterns`) or
      have the seven direct `useStore(intentionEngine)` consumers select
      only the slice they need, so an unrelated `recordSignal()` call
      doesn't re-render all seven.
  This is the structural fix; it's a larger refactor and should be scoped
  and reviewed before starting, not done opportunistically.
- [ ] Wire `perf.ts`'s collected INP/long-animation-frame entries to an
      actual reporting endpoint (or at minimum persist to `localStorage`/
      send on `visibilitychange`) so future regressions surface without a
      manual repro session.
- [ ] Add a lightweight guard (lint rule or a small `analyzeIntentions`-call
      audit script) against calling known atom-write functions
      (`analyzeIntentions`, `recordSignal`, `recomputeAssembly`, etc.)
      directly inside `useMemo` bodies or top-level render code, to catch
      the render-phase-write bug class before it ships.
