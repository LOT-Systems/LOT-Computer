# Button Lag & Rendering Investigation — 2026-11-18

Scheduled routine run. Read-only code audit; **no fixes applied, no profiling run** (no `node_modules` in the container, no client bundle in `dist/`).

## Summary

Earlier perf passes (PRs #85, #88, #94, #95; commits `b219cc3`, `6e5007a`, `b46f1ac`, `be3e8fa`, `9364aba`) fixed the worst render-phase store writes and off-tab churn. Since then the codebase has kept growing, mostly as data and pattern blocks: `intentionEngine.ts` is now 6.5k lines with 151 patterns, `Logs.tsx` is 4.5k lines, `badges.ts` is 8.1k lines with 843 badges, and `easter-eggs.ts` is 2.7k lines. No new perf work has landed since 2026-07-28.

The audit found render paths that the earlier passes missed and that are still live. Each finding below was checked against the source. The most likely user-visible causes:

- **Lag on System:** a store write and `localStorage` writes during render, combined with a 10 Hz re-render of the whole System tree whenever breathe is on.
- **Lag on Logs:** the full past-log list re-renders whenever the mouse starts moving again.
- **Clicks that "don't register":** after 2 s without mouse movement, the nav is set to `pointer-events-none`.

There are no GitHub issues filed about this. Open PRs: #93 (calendar toast) and #97 (wiki/badges). Neither touches these paths.

## Suspected causes (ranked)

### HIGH

| # | Location | Problem |
|---|----------|---------|
| 1 | `src/client/components/System.tsx:377` | `useMemo(() => getOptimalWidget(), [logs])` → `analyzeIntentions()` (`intentionEngine.ts:3667`) → `intentionEngine.set` plus `localStorage` writes **during render**. This happens once the 5-minute cooldown has expired. It is the same doctrine violation that `be3e8fa` fixed in MemoryWidget, but it was missed here. Same path at `PatternRecognitionWidget.tsx:78`. |
| 2 | `System.tsx:881-913` (Intentions block IIFE) | `Math.random()` cooldown plus `localStorage.setItem('intentions-last-shown')` inside render. Each re-render can flip the show/hide decision, so `IntentionsWidget` mounts and unmounts while the user is clicking it. |
| 3 | `System.tsx:921-941` (Subscribe block), `840-875` (SelfCare block) | `Math.random() < 0.2` in render, so `SubscribeWidget` randomly mounts and unmounts on every System render. SelfCare does `JSON.parse` and `localStorage` writes in render. |
| 4 | `System.tsx:131-132` + `src/client/utils/breathe.ts:112` | `useBreathe` sits at the top of System and runs a 100 ms `setInterval` with a new state object each tick. While breathe is on, the whole ~1000-line System tree (mostly unmemoized children) re-renders **10×/s**. Combined with #2 and #3, Intentions and Subscribe flicker. |
| 5 | `src/client/components/Logs.tsx:54, 147-168` + `utils/hooks.ts:115-144` | `isMouseActive` state lives on top-level Logs and flips whenever the mouse starts moving. That re-renders every past log: about 151 `log.event ===` branches per row, unmemoized `LogContainer` (`Logs.tsx:4438`), and `NoteEditor`s that receive a new `onChange` closure every render (`Logs.tsx:3646`). Each `NoteEditor` carries 4 mutations, about 20 `useState` calls and its own `useBreathe`. This cost lands exactly as the user moves toward a button. |
| 6 | `Logs.tsx:159-162` | After 2 s idle, `#nav` gets `opacity-0 pointer-events-none` and is restored only on `mousemove`. A trackpad tap with no preceding move, or a hybrid touch/mouse device, clicks into a dead nav. |

### MEDIUM

| # | Location | Problem |
|---|----------|---------|
| 7 | `MemoryWidget.tsx:131-135` | `runMemoryAnswerEasterEggs` runs synchronously in the answer click. It goes through `detectWordTurns` (about 272 entries), and each entry calls `hasBadge` → `getEarnedBadges()` (`badges.ts:7177-7208`), which re-reads and splits the ~843-ID `localStorage` string. That is about 272 reads per click. It should be deferred like the `recordSignal` call just below it, and earned badges should be cached in a `Set`. |
| 8 | `QuantumRandomWidget.tsx:38-51` | `recordSignal` is called inside a `setRemaining` updater, a side effect in a state updater that runs twice under StrictMode. Two instances run 1 s ticks. Each signal rewrites the whole `intentionEngine` atom (re-rendering 7 whole-store subscribers) and fills the 1000-signal cap with noise, which makes every analysis and persist slower. |
| 9 | `QuantumEngineWidgets.tsx:207-232, 165, 569` | Same pattern: `recordSignal` inside state updaters. It subscribes to the whole store and calls `getQuantumOS()` inline in JSX. |
| 10 | Whole-store `useStore(intentionEngine)` subscribers: `AIFeedbackWidget.tsx:26`, `QuantumStateWidget.tsx:27`, `PatternRecognitionWidget.tsx:49`, `QuantumEngineWidgets.tsx:165`, `SystemPulseWidget.tsx:46` | These re-render on every signal write. AIFeedback and QuantumState are not memoized. |
| 11 | System mount | `recomputeAssembly()` runs 3× (`System.tsx:269`, `QuantumEngineWidgets.tsx:264`, `SystemProgressWidget.tsx:1554`). `analyzeIntentions()` runs 3+× (`System.tsx:268`, `SystemProgressWidget.tsx:1555`, background monitor at `intentionEngine.ts:5126`). `getEnrichedPhysiologicalReport()` runs synchronously at `SystemProgressWidget.tsx:1556`. All of this lands right after a tab switch, so the first click lags. |
| 12 | `Logs.tsx:3794-3834` | The 7 s debounced autosave runs journal easter eggs (the same `hasBadge` loop) and `journal_dates` JSON parse/stringify synchronously. It can collide with a click. It does not run per keystroke. |

### LOW

- `useLogContext()` (`hooks/useLogContext.ts:23`) is recomputed separately in about 15 widgets on each `logs` change.
- `startBackgroundQOSMonitor` (`intentionEngine.ts:5129`) does not check `document.hidden`.
- `recipeWidget.ts:188` has a 5-minute module-level interval that is never cleared.
- CSS:
  - `transition-all` on the light primary button (`Button.tsx:74`).
  - `ToggleSection.tsx:65` animates `max-h-[2000px]` and keeps its children mounted.
  - `filter` and `box-shadow` animations at `index.css:186-207`, if those classes are used.
  - No 300 ms tap delay: the viewport meta is set.

### Ruled out

- Per-keystroke badge or easter-egg evaluation: per keystroke only `detectNewTriggers` runs, and it is cheap.
- Synchronous analysis inside `record*Signal`: `recordSignal` batches persist behind 250 ms and analysis behind idle time.

## Recommended next steps

1. **Quick wins.** Each is small and matches the existing render-isolation doctrine.
   - Move `getOptimalWidget()` out of `useMemo` into `useEffect` + `useState` (System.tsx:377, PatternRecognitionWidget.tsx:78).
   - Compute the Intentions, Subscribe and SelfCare visibility once per mount or day in an effect, not with `Math.random()` and `localStorage` writes in render.
   - Move `useBreathe` into a small `<BreatheIndicator>` child so the 10 Hz ticks re-render only that child.
   - Move `useMouseInactivity` into a nav-only component, and drop `pointer-events-none`: use opacity only, or restore on `pointerdown`.
   - Defer `runMemoryAnswerEasterEggs` with `setTimeout`, and cache earned badges in an in-memory `Set`.
   - Move `recordSignal` out of state updaters (QuantumRandomWidget, QuantumEngineWidgets), and throttle or drop `quantum_random` signals.
2. **Structural.**
   - `React.memo` `LogContainer` and `NoteEditor`, and use stable `onChange` callbacks.
   - Replace the ~151-branch `log.event` chain with a lookup map.
   - Use selector-based subscriptions (`computed`) instead of whole-store `useStore(intentionEngine)`.
   - Dedupe the triple `recomputeAssembly` and `analyzeIntentions` on System mount.
3. **Measure, since this run did no profiling.**
   - Rerun the headless-Chromium harness from `9364aba` (1000 signals, 500 logs) with breathe on, mouse wiggle on Logs, and a Memory answer click, and record long tasks (`PerformanceObserver('longtask')`).
   - Measure the real cost of `recomputeAssembly` (`selfAssembly.ts:419`) and `getEnrichedPhysiologicalReport`.
   - Check how often `usersOnline` and `liveMessage` update over the socket (`entries/app.tsx:107-113`), since they re-render System.
   - Confirm whether StrictMode is on.
   - Audit click handlers in PlannerWidget, SelfCareMoments, IntentionsWidget and MoodWidget, which were not covered here.

## References

- Prior perf PRs: [#85](https://github.com/LOT-Systems/LOT-Computer/pull/85), [#88](https://github.com/LOT-Systems/LOT-Computer/pull/88), [#94](https://github.com/LOT-Systems/LOT-Computer/pull/94), [#95](https://github.com/LOT-Systems/LOT-Computer/pull/95)
- `be3e8fa` cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, but that file was never committed to the repo.
