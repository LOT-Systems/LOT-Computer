# Button Lag & Rendering Investigation — 2026-11-26

Scheduled investigation run. This is static code analysis. No runtime profiling was done because the app needs its backend and DB to run.

## 1. Context: what has already been fixed

| PR / commit | Date | Fix |
|---|---|---|
| `bd9ef2a` | — | Planner buttons froze. Fixed by reusing the AudioContext and catching sound errors. |
| `863b333` | — | Widget lag. Fixed by capping the logs query and backing off stats polling. |
| `b219cc3` | — | Moved quantum-state writes out of `useMemo` so they no longer block the render pipeline. |
| #85 `ee88f4c` | 2026-07-19 | Paused System background work when the tab is not active. |
| #88 `6e5007a` | 2026-07-19 | Stopped a render-phase atom write and off-tab churn. |
| `b46f1ac` | — | The System tab now unmounts when inactive (`src/client/entries/app.tsx:162`). |
| #94 `be3e8fa` | 2026-07-28 | MemoryWidget no longer writes `analyzeIntentions` during render. The SystemProgressWidget report click is deferred. |
| #95 `9364aba` | 2026-07-28 | Memoized the sort in SignalStreamWidget and the index/cohort in UserMetricsWidget. |

Notes:
- Commit `be3e8fa` cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, but that file was **never committed** to the repo.
- There are **no GitHub issues** (0 open or closed). The repo has no user reports, so the evidence here comes from commits and code.
- No perf-related commits have landed since 2026-07-28. Later work covered badges, the wiki and QIE.
- Open PRs: #93 (calendar time tracking) and #97 (wiki/badges). Neither touches buttons or rendering.

## 2. Profiling infrastructure

- `src/client/utils/perf.ts` already watches Event Timing (warns above 200 ms) and Long Animation Frames (warns above 50 ms). It is started from `src/client/entries/app.tsx:310`. It keeps the last 50 entries, readable from `window.__LOT_PERF__.getEntries()`.
- **The data stays in each user's browser console.** Nothing is sent to the server, so no field metrics exist. This is the biggest gap in visibility.

## 3. Suspected remaining causes (ranked)

### S1 — The breathe ticker re-renders huge components 10×/s · HIGH confidence
- `src/client/utils/breathe.ts:112` calls `setInterval(updateState, 100)`, and each tick calls `setState({...})` with a **new object**. React therefore re-renders on every tick, even when the visible text has not changed. The countdown changes about once per second.
- The hook is called at the top level of:
  - `System.tsx:132`, a 1071-line component with 15 `useStore` calls. The whole System tree re-renders 10×/s while `/breathe` is on.
  - `Logs.tsx:3711`, inside the 4506-line `Logs` component. **Logs stays mounted with `display:none` on every other tab** (`app.tsx:167`). If breathe was left on in Logs, the hidden Logs keeps re-rendering 10×/s on every tab.
- Symptom: every button feels sluggish while breathe is active, and after leaving Logs.
- Fix: only call `setState` when `display` changes (compare with the previous value or use a functional update). Move `useBreathe` into a small `<BreatheLine>` leaf component so only that leaf re-renders. Pause it when `document.hidden` or when the tab is inactive.

### S2 — The Logs nav can become unclickable without the mouse moving · HIGH confidence (dead-click)
- `Logs.tsx:147–168` with `hooks.ts:115–143`: after 2 s with no `mousemove` on the logs route, `#nav` gets `opacity-0 pointer-events-none`.
- If the user rests the cursor on a nav button for more than 2 s and then clicks without moving, the click is swallowed. Keyboard focus and clicks are not counted as activity. Each activity toggle also calls `setIsMouseActive`, which re-renders all of Logs.
- Fix: also listen for `pointerdown` and `keydown`, or skip hiding when `#nav:hover`. Use a ref instead of state if `isMouseActive` is not needed for rendering.

### S3 — A synchronous `analyzeIntentions()` call in a Logs command handler · MEDIUM
- `Logs.tsx:3974–3975`: the `qos-report` trigger runs `analyzeIntentions()`, a scan of about 139+ patterns, synchronously in the input handler. This is the same pattern #94 fixed in SystemProgressWidget, and it was missed here.
- Fix: defer it with `setTimeout(…, 0)`, as in `be3e8fa`.

### S4 — Re-entering System re-applies about 20 root CSS variables while the body transitions layout properties · MEDIUM
- System now unmounts off-tab, so each switch back remounts it (about 118 ms measured in #95). On mount, `useEvolutionSync` (`System.tsx:315`) calls `updateEvolutionState`. That function writes every evolution/theme CSS variable to `documentElement` without checking for changes (`stores/evolution.ts:101,112`), rewrites the `<style>` animation tag, and resets `dataset.density`.
- `body` transitions **letter-spacing and line-height** over 400 ms (`index.css:69`). Any change to these variables triggers a 400 ms relayout of the whole document, and any root variable write can trigger a full-document style recalculation.
- Fix: diff the values against the last applied ones before calling `setProperty`. Skip `textContent` when the CSS is unchanged. Consider dropping the `letter-spacing`/`line-height` transitions on `body`.

### S5 — Per-button compositor layers and `transition-all` · LOW–MEDIUM (mainly mobile/low-end GPUs)
- `.grid-fill-hover::before` sets `will-change: opacity` (`index.css:120`), which gives every secondary/ghost button and hover target a permanent compositor layer. Pages with many buttons multiply layer memory and raster cost. The `[data-density]` variants paint repeating gradients.
- The primary button in light theme uses `transition-all` (`ui/Button.tsx:77`).
- Fix: remove `will-change`, or apply it only on `:hover`. Use `transition-colors`.

### S6 — Wide subscriber fan-out to `intentionEngine` · MEDIUM (architectural)
- 7 widgets call `useStore(intentionEngine)` directly: AIFeedback, PatternRecognition, QuantumEngineWidgets, QuantumState, SignalStream, SystemPulse and UserMetrics. Each `recordSignal` (which every button click or log action can fire) re-renders all of them while System is mounted. #95 memoized two of them, but the other five have not been audited.
- Fix: use `computed()` slices (for example `$signals` and `$patterns`) so each widget only subscribes to the part it reads.

## 4. Next steps (deeper investigation)

1. **Measure in a real browser.** Seed a profile (1000 signals and 500 logs, like the #95 harness), then read `window.__LOT_PERF__.getEntries()` with breathe on and off, and while switching between System and Logs. Confirm S1 and S4 with React Profiler commit counts.
2. **Collect field data.** Have `perf.ts` send interactions over 200 ms to a lightweight `/api/perf` endpoint (sampled), so lag reports come with evidence.
3. **Commit the missing diagnostic.** Recover or rewrite `BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, which `be3e8fa` cites.
4. Audit the 5 remaining `intentionEngine` subscribers for unmemoized per-render work (S6).
5. Check whether setting an identical CSS custom-property value invalidates style in Blink and WebKit (S4). If it does not, S4 only matters when values actually change.

## 5. Quick-win patch order
S1 (breathe) → S2 (nav dead-click) → S3 (defer qos-report) → S4 (diff CSS vars) → S5 (CSS). All are small and local, and none needs an architecture change.
