# Button Lag & Rendering Diagnostic — 2026-11-17

Scheduled investigation, run automatically. I read the code only (static analysis). I did not profile the live app in this run.

## 1. Status of prior work

| Ref | Change | State |
|---|---|---|
| [#85](https://github.com/LOT-Systems/LOT-Computer/pull/85) `ee88f4c` | Pause System background work off-tab | merged |
| [#87](https://github.com/LOT-Systems/LOT-Computer/pull/87) `d922509` | Remove duplicate SystemProgressWidget mount | merged |
| [#88](https://github.com/LOT-Systems/LOT-Computer/pull/88) `6e5007a` | Stop render-phase atom write + off-tab churn | merged |
| `b46f1ac` | Unmount System tab when inactive | merged |
| [#94](https://github.com/LOT-Systems/LOT-Computer/pull/94) `be3e8fa` | MemoryWidget render-phase write → effect; defer SystemProgress report build | merged |
| [#95](https://github.com/LOT-Systems/LOT-Computer/pull/95) `9364aba` | Memoize SignalStream sort + UserMetrics index | merged |
| `bd9ef2a` | Planner buttons frozen: reuse AudioContext | merged |

- **GitHub issues:** none open or closed. No user reports were filed on GitHub.
- **Open PRs:** [#93](https://github.com/LOT-Systems/LOT-Computer/pull/93) (calendar) and [#97](https://github.com/LOT-Systems/LOT-Computer/pull/97) (wiki/badges). Neither touches the render hot paths.
- **Missing doc:** commit `be3e8fa` cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, but that file was never committed to any branch. This report replaces it.
- **No performance metrics or profiling data** are committed. The only numbers are in commit messages (for example, `9364aba`: about 118 ms for the one-time System mount with 1000 signals and 500 logs).

## 2. The button component is not the cause

`src/client/components/ui/Button.tsx` is already render-isolated:
- secondary buttons subscribe to no store;
- primary buttons subscribe only to `theme`;
- rounded buttons subscribe only to `isMirrorOn`.

The hover effect (`.grid-fill-hover::before`, `src/client/index.css:102-160`) animates only `opacity` over 180 ms. That runs on the compositor and is cheap.

When a button feels slow, the main thread is busy with something else at the moment of the click. The causes below are what keep it busy.

## 3. Suspected causes (new, not addressed by earlier PRs)

### S1 — HIGH: Breathe mode re-renders the whole System tab 10 times a second
- `src/client/utils/breathe.ts:112`: `setInterval(updateState, 100)` calls `setState({phase, count, display})` with a **new object** on every tick. React cannot skip the update, even when `display` has not changed.
- `src/client/components/System.tsx:131-132` calls `useBreathe(isBreatheOn)` at the **top of the System component**, which is about 1070 lines. Only lines 510 and 814 read the value.
- Effect: while Breathe is on, the whole System tree re-renders about 10 times a second. Only 6 components in the codebase use `React.memo`, so almost every child widget re-renders too. A click that lands during one of these renders waits for it to finish. This matches the "buttons lag on System" reports.
- Fix:
  1. Move the Breathe block into its own small `<BreatheBlock/>` component that owns `useBreathe`.
  2. In `updateState`, skip `setState` when `display` is unchanged. The display changes at most a few times a second.

### S2 — MEDIUM: `QuantumRandomWidget` sends a stream of writes to `intentionEngine`
- `src/client/components/QuantumRandomWidget.tsx:38-55` runs two independent hooks. Each ticks every second and calls `recordSignal('calculator','quantum_random')` every 1–72 s.
- That call is made **inside a `setRemaining` updater function**. That is a side effect in an updater: StrictMode calls updaters twice, which records duplicate signals.
- Each `recordSignal` (`src/client/stores/intentionEngine.ts:199-229`):
  - copies and filters up to 1000 signals;
  - once the 1000-signal cap is reached, **sorts 1001 items on every call**;
  - calls `intentionEngine.set(...)`.
- Seven widgets subscribe to the **whole** `intentionEngine` atom: QuantumState, PatternRecognition, SystemPulse, QuantumEngineWidgets, UserMetrics, AIFeedback, SignalStream. Every write re-renders all seven.
- Side effect on data: this ambient noise pushes real user signals out of the 1000-signal / 7-day window. That weakens the QIE pattern analysis, and the cap is reached sooner, so the sort runs more often.
- Fix:
  1. Stop recording `quantum_random` as a signal, or record it only when the user clicks.
  2. Move the side effect out of the updater.
  3. Pause the 1 s tick when `document.hidden`.

### S3 — LOW-MEDIUM: whole-atom subscriptions to `intentionEngine`
- All seven subscribers above use `useStore(intentionEngine)` with no selector, so any field change re-renders all of them. #95 memoized the heavy work inside them, but they still re-render.
- Fix: use `computed()` slices, or `useStore(intentionEngine, { keys: [...] })` for map atoms, so each widget re-renders only for the fields it reads.

### S4 — LOW: the QOS monitor runs analysis on the main thread
- `src/client/stores/intentionEngine.ts:5129-5132`: every 30 min, `analyzeIntentions()` (a scan of 150+ patterns) and `captureQOSSnapshot()` run synchronously in the interval callback. They are not wrapped in `deferHeavy`.
- Effect: a click that coincides with this run can stall. This is rare, but it is a long task you can reproduce.
- Fix: wrap the callback body in `deferHeavy(...)`.

### Correctness bug found along the way
- `src/client/components/SystemPulseWidget.tsx:62-69`: `cohortClassification` is memoized on `engineState.signals.length`. At the 1000-signal cap the length never changes, so the cohort view goes **stale for good**. Key the memo on `engineState.signals` (the array reference) instead.

## 4. Checked and ruled out
- `Clock` (60 s / 5 s), `TimeWidget` chime check (1 s, does not call `setState`), `LoadingDots` (isolated component), `SystemPulseWidget` polling (gated on tab and route), `MicroGameWidget` (gated on viewport): all fine.
- `recordSignal` already defers its persist and analysis work through `requestIdleCallback`.

## 5. Next steps
1. Fix S1. It is small and has the most impact. Then fix S2.
2. Verify with the headless-Chromium harness used in `9364aba`. Turn Breathe on, record a 10 s performance trace, and count React commits and long tasks (>50 ms) before and after the fix.
3. Add real measurement, because the repo has none: a `PerformanceObserver('longtask')` and INP sampler, sent to the existing `/api/system/pulse` endpoint or to logs.
4. Then do S3 (store slicing) and S4 (defer the QOS monitor).
5. Ask users to file lag reports as GitHub issues, saying which tab they were on and which modes were on (Breathe, Radio, Mirror). There are no issues today.
