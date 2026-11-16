# Button Lag & Rendering Investigation — 2026-11-16

Scheduled investigation run. Base: `master` @ `98971f2` (no commits since 2026-08-05).
Static code review only. No profiling was run in this pass.

## 1. Summary

Buttons still feel slow, and widgets sometimes flicker or jump on the System tab. Five rounds of perf fixes went in during July 2026 (listed in §2). They removed the render-phase atom writes inside `analyzeIntentions` and stopped work running on hidden tabs. The causes that remain fall into two groups.

1. **High-frequency re-renders of the whole System page.** The Breathe timer (100 ms) and the Radio countdown (1 s) both push state into `System`. `System` has about 40 child widgets, and none of them are memoized (`React.memo`). Every click has to wait behind those renders.
2. **Work done during render on every System mount.** System now unmounts when it is not the active tab (b46f1ac), so this cost is paid on every tab click. It includes atom writes, `localStorage` writes, `Math.random()` and `analyzeIntentions()`.

GitHub has no open issues about lag. The only user reports are the ones described in earlier commit messages. No performance metrics or profiling data are committed to the repo. The diagnostic that PR #94 cites, `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, was never committed.

## 2. Prior work (already merged)

| PR / commit | Fix |
|---|---|
| 863b333 | Capped `/api/logs` at 500 rows and backed off stats polling |
| b219cc3 | `System.tsx`: moved `analyzeIntentions`/`recomputeAssembly` out of `useMemo` |
| [#85](https://github.com/LOT-Systems/LOT-Computer/pull/85) ee88f4c | `isRouteActive` interval gating; `recordSignal` persist is coalesced and analysis is idle-scheduled |
| [#88](https://github.com/LOT-Systems/LOT-Computer/pull/88) 6e5007a | PatternRecognitionWidget: removed the atom write during render; gated more intervals |
| b46f1ac | System tab unmounts when it is inactive |
| [#94](https://github.com/LOT-Systems/LOT-Computer/pull/94) be3e8fa | MemoryWidget: removed the write during render; SystemProgressWidget report click is deferred |
| [#95](https://github.com/LOT-Systems/LOT-Computer/pull/95) 9364aba | SignalStream and UserMetrics are memoized |
| bd9ef2a / 89da563 | Planner AudioContext reuse; Logs nav `pointer-events` fix |

Open PRs: [#93](https://github.com/LOT-Systems/LOT-Computer/pull/93) adds `CalendarEventToast`. It is gated on the System route and is cheap, but its effect depends on `[logs]`, so the 30 s interval is torn down and rebuilt on every logs refetch. That is minor. [#97](https://github.com/LOT-Systems/LOT-Computer/pull/97) is mostly docs and infrastructure.

## 3. Suspected causes (ranked)

### HIGH — verified in code

1. **Breathe causes 10 full renders per second.** `useBreathe` calls `setInterval(updateState, 100)` (`src/client/utils/breathe.ts:112`). `System` consumes it at `src/client/components/System.tsx:132`. While Breathe is on, System and every child widget re-render 10 times a second.
2. **Radio causes 1 full render per second.** `src/client/utils/radio.ts:158-166` calls `stores.radioTrackName.set(\`${name} ${timeStr}\`)` every second. `System` subscribes to it (`System.tsx:126`). The `useRadio` state also lives in `App` (`src/client/entries/app.tsx`), so App re-renders every second as well.
3. **`analyzeIntentions()` runs during render.** `System.tsx:377` is `useMemo(() => getOptimalWidget(), [logs])`. `getOptimalWidget` calls `analyzeIntentions()` (`src/client/stores/intentionEngine.ts:3667`). That runs a scan of about 140 patterns and writes the `intentionEngine` atom during render. This is the same doctrine violation that b219cc3, 6e5007a and be3e8fa fixed elsewhere.
4. **`Math.random()` and `localStorage` writes in System's render body.** The inline IIFEs at `System.tsx:883-941` each run on every render:
   - Intentions draws a random cooldown (line 891).
   - Subscribe uses `Math.random() < 0.2` (line 940).
   - The IIFEs also write `localStorage`.

   Combined with causes 1 and 2, `SubscribeWidget` and `IntentionsWidget` mount and unmount at random. **This is the likely source of the flicker and jumping widgets.**
5. **`recordSignal` is called in render bodies.** Each call is guarded only by a ref. Because System remounts, all of them fire on every System visit:
   - `MicroImageWidget.tsx:248`
   - `ChakraErgonomicsWidget.tsx:62`
   - `CohortConnectWidget.tsx:44`
   - `GoalJourneyWidget.tsx:46`
   - `InterventionsWidget.tsx:37`
   - `EnergyCapacitor.tsx:50`
6. **QuantumRandomWidget floods signals.** Two instances tick every second (`QuantumRandomWidget.tsx:38-49`). Each one calls `recordSignal` inside a `setState` updater about every 10 s. Every call does the following:
   - copies and sorts up to 1000 signals;
   - re-renders the 7 `intentionEngine` subscribers;
   - schedules a `JSON.stringify` of 1000 objects.

   It also pushes real user signals out of the 1000-signal cap.
7. **Memory answer buttons look dead.** `MemoryWidget.tsx:117-127` only marks the clicked index. The question is dismissed in `onSuccess`, after a server (possibly AI) round-trip. The buttons are not disabled in the meantime, so they can be clicked twice.
8. **The service worker can reload the page during a session.** An unguarded `controllerchange` listener calls `location.reload()` (`src/client/entries/app.tsx:100-104`). Together with `skipWaiting` and `clients.claim` (`public/sw.js`), every deploy can reload an open tab mid-session, and clicks are "lost". The template's own listener has a 5 s `pageReady` guard (`templates/generic-spa.ejs`). This one does not.

### MEDIUM — reported by the code sweep, not individually verified

- **Logs tab.** Every log renders a `NoteEditor` that is not memoized (about 30 hooks each).
  - `isMouseActive` is passed to every row, so the whole list re-renders each time the mouse goes idle or becomes active again.
  - `onChangeLog(id)` creates a new closure on every render.
  - The nav fades out with `pointer-events-none` after 2 s idle, which can swallow the first click (`Logs.tsx:158-162, 3646, 3656`).
- **Cost of mounting System.** On every mount:
  - `SystemProgressWidget.tsx:1553-1571` runs `recomputeAssembly()`, `analyzeIntentions()` and `startBackgroundQOSMonitor()`, which includes a `localStorage` parse and stringify.
  - `recomputeAssembly` always calls `selfAssembly.set`, even when nothing has changed (`selfAssembly.ts:419`).
- **Layout transition across the whole page.** `body` transitions `letter-spacing` and `line-height` over 400 ms (`index.css:69-71`). `updateEvolutionState` rewrites root CSS variables on every System mount (`evolution.ts:98-133`), and `$layoutDensity` returns a new object each time.
- **Slow fade cascades.** Buttons fade over 1400 ms with a 120 ms stagger and no `pointer-events-none` while hidden. Affected files: EmotionalCheckIn, MemoryWidget, PlannerWidget, RecipeWidget, SelfCareMoments.
- **Stuck hover overlay on touch.** `.grid-fill-hover::before` (`index.css:107-125`) is on every Button and Block. There is no `@media (hover:hover)` guard and Tailwind has no `hoverOnlyWhenSupported`, so the overlay stays visible after a tap on touch devices.

### LOW

- `transition-all`:
  - PrimaryBtn light theme (`ui/Button.tsx:77`)
  - `ToggleSection.tsx:65` (`max-h-[2000px]`)
  - `SystemProgressWidget.tsx:1987`
  - `IntegrityWidget.tsx:281`
- `MicroGameWidget` calls `getComputedStyle` on every 150 ms tick.
- The `QueryClient` uses defaults: `refetchOnWindowFocus: true` and `staleTime: 0`.
- `GhostButton` drops `props.className` (`ui/Button.tsx:140-155`).
- No 300 ms tap delay: the viewport meta is correct.
- The shared `Button` has no debounce, sound or haptics, so it is not the cause by itself.

Correction to the sweep: `/api/logs` *is* capped at 500 rows (`src/server/routes/api.ts:1225`). Only the comment at `src/client/queries.ts:134` ("has no LIMIT") is out of date.

## 4. Recommended next steps

1. **Isolate the fast timers.** Move the Breathe countdown and the Radio track label into small leaf components that subscribe themselves, so `System` stops re-rendering.
2. **Make System's render pure.**
   - Move `getOptimalWidget()` into an effect with a state seed, the same pattern as b219cc3.
   - Pick the Subscribe and Intentions random gates once per mount with `useState(() => Math.random())` and write `localStorage` in effects.
   - Move the six render-body `recordSignal` calls into `useEffect`.
3. **Stop QuantumRandomWidget recording signals,** or at minimum move the call out of the `setState` updater.
4. **Guard the `controllerchange` reload** at `app.tsx:100` with the same `pageReady` check, or remove it.
5. **Give Memory answers optimistic feedback:** disable the buttons and dim them immediately.
6. **Logs tab:**
   - `React.memo(NoteEditor)` with a stable `onChange`;
   - stop passing `isMouseActive` to past logs;
   - virtualise or paginate the list.
7. **Touch hover:** enable `future.hoverOnlyWhenSupported` and wrap `.grid-fill-hover` in `@media (hover:hover)`.
8. **Selective memoization:** `React.memo` the heaviest System children and skip `selfAssembly.set` when the state is unchanged.

### Needs deeper investigation

- **No runtime measurements exist.** Repeat the headless-Chromium harness from #95 (1000 signals + 500 logs) with Breathe and Radio on. Record:
  - long tasks (>50 ms);
  - React Profiler commit counts per second;
  - INP for a click on System and on Log.
- Confirm whether the reported lag happens mainly with Breathe or Radio on. If it does, causes 1 and 2 are the main ones.
- Measure the real cost of a System remount after b46f1ac, now that mount-time work runs on every tab click.
- Commit profiling output under `docs/diagnostics/` so future runs have a baseline.
