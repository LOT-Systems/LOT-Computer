# Button Lag & Rendering — Investigation (2026-10-31)

Scheduled, read-only investigation. No application code changed. No live profiling
was possible (static review + git/PR history only).

## Summary

Button lag in LOT Computer has been addressed in **seven perf passes since July 2026**.
Every one traced to the same class of cause: **the `intentionEngine` nanostore fan-out**.
Many permanently-mounted widgets subscribe to it, and each write re-renders all of them,
so any heavy work in render, or a store write during a click, makes the UI feel frozen.

No open issues, no open perf PR, and no user report newer than the 2026-07-28 fixes.
Nothing here is confirmed as a *current* regression. The remaining risks below are
code-review hypotheses, not measured.

Note: PR #94 / commit `be3e8fa` cite this file as an "agent-authored" diagnostic, but it was
never committed. This file now fills that gap (it is a fresh analysis, not the original).

## History (all merged)

| Date | Ref | Cause → fix |
|---|---|---|
| ~Jul 2026 | `bd9ef2a` | Planner buttons frozen: new `AudioContext` per click → reuse context, catch sound errors |
| | `89da563`, `c6c3c2a`, `f6c7caf` | Logs mouse-inactivity timer disabled nav on all tabs → guard by route |
| | `863b333` | Widget lag: uncapped logs query, aggressive stats polling → cap + back off |
| | `b219cc3` | Quantum state writes inside `useMemo` blocking render → moved out |
| 2026-07-19 | PR [#85](https://github.com/LOT-Systems/LOT-Computer/pull/85) `ee88f4c` | Hidden-but-mounted tabs kept running System intervals; `document.hidden` doesn't cover in-app tabs → `isRouteActive()`; `recordSignal` persist coalesced, `analyzeIntentions` idle-deferred |
| 2026-07-19 | PR [#87](https://github.com/LOT-Systems/LOT-Computer/pull/87) | `SystemProgressWidget` mounted twice → removed |
| 2026-07-19 | PR [#88](https://github.com/LOT-Systems/LOT-Computer/pull/88) | Atom write during render in `PatternRecognitionWidget`; 3 ungated intervals → memoize / gate |
| 2026-07-25 | `b46f1ac` | System tab unmounted when inactive (the "definitive" tab-switch freeze fix) |
| 2026-07-28 | PR [#94](https://github.com/LOT-Systems/LOT-Computer/pull/94) `be3e8fa` | `MemoryWidget` render-phase `analyzeIntentions()`; `SystemProgressWidget` report build sync in click handler → effect / `setTimeout(0)` |
| 2026-07-28 | PR [#95](https://github.com/LOT-Systems/LOT-Computer/pull/95) `9364aba` | `SignalStreamWidget` sorted 1000 signals per render; `UserMetricsWidget` unmemoized index/cohort → `useMemo` (5 tab switches: heavy task per switch → one ~118 ms mount) |

Open PR [#93](https://github.com/LOT-Systems/LOT-Computer/pull/93) (calendar time tracking + toast) adds a Log-feed
poller; not perf-related but should be profiled once merged. There are no open issues.

## Evidence available

- `src/client/utils/perf.ts` — `PerformanceObserver` for `event` (INP) and `long-animation-frame`;
  warns on interactions >200 ms; exposes `window.__LOT_PERF__.getEntries()` (last 50 >50 ms).
  **Production data from this was never collected into any file or issue.**
- Headless-Chromium harness numbers quoted in PR #95 (seeded 1000 signals / 500 logs). The harness itself is not in the repo.

## Findings in the current code

`Button` (`components/ui/Button.tsx`) is **not** the cause: it is a thin wrapper with one
small store subscription (`theme`) and CSS-only hover (`grid-fill-hover`, an opacity transition on a `::before`).
The lag is in what handlers/renders do around it.

1. **`recordSignal` still swaps the whole signals array on every call** (`stores/intentionEngine.ts:199`).
   `[...state.signals, newSignal]` + filter (+ sort when over `MAX_SIGNALS`) creates a new `signals` ref per signal,
   so every `useMemo` keyed on `engine.signals` (the #95 fixes) recomputes, and all 36 components that import the
   engine re-render per recorded signal. Persist and analysis are deferred, but the O(n) copy/filter and the
   subscriber fan-out are still synchronous on the click path wherever `recordSignal` is called from a handler.
   **Highest-value suspect.**
2. **`recordOSSignal` / `recordQOSSignal` / `recordXSignal` helpers** (`intentionEngine.ts` ~4745–4831) call `recordSignal`
   directly, so any button handler that logs a signal pays #1 on the click.
3. **Always-mounted-after-first-visit tabs.** Other tabs (Logs ~3.6k lines, Sync, Settings…) stay mounted with `display:none`
   after #85/#88 fixed only System. Logs re-renders its whole tree on each mouse start/stop transition
   (`Logs.tsx:147–168`, `setIsMouseActive`) even though the only consumer is one opacity class (`:4198`); the nav is
   already toggled via direct DOM classList. Cheap to isolate.
4. **Body-level transitions on CSS variables** (`index.css:69`): `letter-spacing`/`line-height` transitions on `body`
   trigger layout of the entire document whenever the evolution variables change. Low frequency but expensive when it fires.
5. **Remaining ungated `setInterval`s** (26 total; 10 `isRouteActive` call sites). Not yet audited: `QuantumRandomWidget` (2),
   `System.tsx` (2), `MicroGameWidget`, `MicroCalculatorWidget`, `TimeWidget`, `Clock`, `StatusPage`, `About`, `selfCare`, `radio`, `sun`.
6. **Process gap:** the "fix" claims in #94/#95 were verified by synthetic harness only; no field INP data confirms them.

## Suspected causes (ranked)

1. `intentionEngine` fan-out from `recordSignal` during click handlers (finding 1–2).
2. Whole-component re-renders in large, permanently mounted tabs (Logs) for cosmetic state (3).
3. Residual ungated timers re-rendering hidden tabs (5).
4. Document-wide layout from body transitions (4).

## Next steps

1. **Measure first.** Ask for a `window.__LOT_PERF__.getEntries()` dump (or ship it to a log) from a device that still reports lag,
   with the exact button and tab. Decide using INP, not guesses.
2. In `recordSignal`, make the append O(1) amortized (mutate a ring buffer, bump a version counter, or keep a separate
   `signalsVersion` atom) so `useMemo` consumers don't resort per signal; and defer the store `set` itself off the click via
   `queueMicrotask`/idle.
3. Convert subscribers to selected slices (`computed`/`useStore(store, { keys })`) so widgets re-render only for fields they read.
4. Move `isMouseActive` in `Logs.tsx` into a tiny child or a ref/CSS class — stop re-rendering the 3.6k-line component.
5. Audit the ungated intervals listed in finding 5 with `isRouteActive` + `document.hidden`.
6. Commit the headless-Chromium harness used for #95 under `scripts/` and run it in CI as a regression gate.
7. Re-profile after PR #93 (calendar poller) lands.

## Confidence

History and code locations: verified from git/PRs. Causes 1–4: **plausible, unmeasured**.
