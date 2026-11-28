# Button Lag & Rendering — Diagnostic · 2026-11-28

Scheduled investigation. Baseline: `master` @ [`9f2b88c`](https://github.com/LOT-Systems/LOT-Computer/commit/9f2b88c044d6b0414f21e80713f2466947c64a87). No code was changed in this run.

## TL;DR

1. **There is a live bug that shipped on 2026-08-03 and is probably the main cause.** `analyzeIntentions()` references `dayMs`, a variable that is not declared in its scope, so it throws `ReferenceError: dayMs is not defined` on every scan for any user who has at least one signal. Because the throw happens before `lastAnalysis` is written, the 5‑minute cooldown never takes effect. Every caller therefore runs about 146 pattern checks and then crashes. That can show up as buttons doing nothing, repeated long main-thread tasks, and the System tab falling into the app error screen.
2. Separately, the Logs tab re-renders the whole list of up to 500 entries every time mouse activity changes state, and on every log save. None of the list items are memoized.
3. Smaller issues: `will-change: opacity` on every `.grid-fill-hover` button, and `recordSignal` still doing synchronous array work on each button press.

There are no GitHub issues filed about lag. The two open PRs (#93, #97) do not touch the cause.

---

## 1. CRITICAL: `dayMs` ReferenceError in `analyzeIntentions()` (P147)

**Where:** [`src/client/stores/intentionEngine.ts:3332`](https://github.com/LOT-Systems/LOT-Computer/blob/9f2b88c044d6b0414f21e80713f2466947c64a87/src/client/stores/intentionEngine.ts#L3332)

```ts
const daySignals147 = signals.filter(s => now - s.timestamp < dayMs)   // dayMs is not declared here
```

`analyzeIntentions` covers lines 258–3467. The only `dayMs` declarations are at L3543 and L4620, both in other functions.

**Introduced by:** [`1846b80`](https://github.com/LOT-Systems/LOT-Computer/commit/1846b80) "BENCHMARK: SELF-ASSEMBLY — QIE v112 P146–P148" (2026-08-03). It is still present on `master` and in both open PRs.

**How it was confirmed:**
- `tsc --noEmit` on the file reports `TS2304: Cannot find name 'dayMs'` at (3332,65). This is the only undeclared-identifier error across the files changed since the last perf pass (intentionEngine, System, SystemProgressWidget, Logs, QuantumEngineWidgets, MemoryWidget, badges, easter-eggs).
- I bundled the real module with esbuild, seeded 1000 signals and ran it under Node. It throws `ReferenceError: dayMs is not defined`.
- **Why it shipped:** `client:build` runs esbuild only and does no type checking. `app.yaml` deploys `master` automatically.

**Runtime effect.** `lastAnalysis: now` is written at L3448, after the throw, so it is never updated. As a result:

| Caller | What happens now |
|---|---|
| `recordSignal` → `deferHeavy(analyzeIntentions)` ([L243](https://github.com/LOT-Systems/LOT-Computer/blob/9f2b88c044d6b0414f21e80713f2466947c64a87/src/client/stores/intentionEngine.ts#L243)) | The cooldown gate (`now - lastAnalysis >= ANALYSIS_COOLDOWN`) always passes. Every 5th widget signal runs a full scan (~8–27 ms in Node; probably 30–100 ms+ on mobile), then throws an uncaught error. |
| `SystemProgressWidget.handleGenerateReport` ([L1622–1635](https://github.com/LOT-Systems/LOT-Computer/blob/9f2b88c044d6b0414f21e80713f2466947c64a87/src/client/components/SystemProgressWidget.tsx#L1622)) | The build throws in its `setTimeout`, so `setReport`/`setQos` never run. **The button looks dead.** |
| `SystemProgressWidget` mount effect ([L1555](https://github.com/LOT-Systems/LOT-Computer/blob/9f2b88c044d6b0414f21e80713f2466947c64a87/src/client/components/SystemProgressWidget.tsx#L1555)) | Throws inside the effect, which lands in the nearest error boundary. |
| `System.tsx` effect on `[logs]` ([L267–271](https://github.com/LOT-Systems/LOT-Computer/blob/9f2b88c044d6b0414f21e80713f2466947c64a87/src/client/components/System.tsx#L267)) | Not wrapped in try/catch or a `WidgetErrorBoundary`, so it bubbles to `AppErrorBoundary` ("Something went wrong. dayMs is not defined"). It runs again on every logs change. |
| `getOptimalWidget()` → `PatternRecognitionWidget` useMemo | Throws during render, and the widget crashes. |
| `startBackgroundQOSMonitor` interval ([L5126–5130](https://github.com/LOT-Systems/LOT-Computer/blob/9f2b88c044d6b0414f21e80713f2466947c64a87/src/client/stores/intentionEngine.ts#L5126)) | Throws before `captureQOSSnapshot()`, so QOS snapshots stop being recorded. |
| `MemoryWidget` (L274), `Logs.tsx` (L3975) | Wrapped in try/catch, so nothing crashes, but the full scan still runs on every call because there is no cooldown. |

**Fix (one line).** Not applied in this run.

```ts
const daySignals147 = signals.filter(s => now - s.timestamp < 24 * 60 * 60 * 1000)
```

**Guardrail:** add `tsc --noEmit -p tsconfig.json` (or at least `--noResolve` on `src/client/stores`) to the `client:build` / benchmark green gate, so an undeclared identifier can no longer ship.

---

## 2. HIGH: Logs tab re-renders the entire list on mouse-activity toggles and saves

**Where:** [`src/client/components/Logs.tsx:54, 182–198, 222–3651`](https://github.com/LOT-Systems/LOT-Computer/blob/9f2b88c044d6b0414f21e80713f2466947c64a87/src/client/components/Logs.tsx#L222)

- `isMouseActive` is state on the `Logs` root. `useMouseInactivity(2000, …)` flips it each time the mouse stops for 2 s and again when it moves. Each flip re-renders `Logs` completely.
- That render walks `pastLogIds.map(...)`: up to 500 logs (the server cap since `863b333`) pass through a ~3400-line `if/else` chain of more than 150 event types. Each one creates a fresh `LogContainer`, which is not `React.memo` and calls `dayjs().format()` on every render.
- Past `NoteEditor`s get `onChange={onChangeLog(id)}`, which is a new function on every render, and `NoteEditor` is not memoized either.
- Each save writes a new `logById` object (`onSuccess`, L65–75), which also re-renders the whole list.
- The entire list depends on `isMouseActive`, but only the primary editor's opacity uses it (L4198).

**Suggested fix:** move the per-log branch into a `React.memo(LogItem)` keyed by `log` and `dateFormat`. Drive `isMouseActive` through a CSS class on the container (the nav is already hidden that way) instead of React state, or pass it only to the primary `NoteEditor`. Memoize per-id `onChange` callbacks.

---

## 3. MEDIUM: `will-change: opacity` on every `.grid-fill-hover::before`

**Where:** [`src/client/index.css:107–121`](https://github.com/LOT-Systems/LOT-Computer/blob/9f2b88c044d6b0414f21e80713f2466947c64a87/src/client/index.css#L107)

Every `Button` and `GhostButton` with an `onClick` gets a permanently promoted compositor layer, and its gradient background is repainted per layer. The System tab mounts dozens of these. This adds GPU memory and compositing cost, which matters most on mobile and PWA. Remove `will-change`; a 180 ms opacity transition does not need it.

---

## 4. LOW: `recordSignal` still does synchronous work on each button press

[`intentionEngine.ts:199–252`](https://github.com/LOT-Systems/LOT-Computer/blob/9f2b88c044d6b0414f21e80713f2466947c64a87/src/client/stores/intentionEngine.ts#L199): each call copies and filters up to 1000 signals (and sorts them when over the cap), then `intentionEngine.set(...)`, which re-renders every subscriber widget. This is fine on its own, but it becomes heavier while bug #1 has disabled the cooldown.

---

## Prior work (context)

The July lag passes fixed render-phase atom writes and off-tab churn. They remain in place, and none of them have regressed except through bug #1:

- [#85](https://github.com/LOT-Systems/LOT-Computer/pull/85) `ee88f4c`: pause off-tab intervals; defer persist and analysis
- [#88](https://github.com/LOT-Systems/LOT-Computer/pull/88) `6e5007a`: stop the render-phase atom write in PatternRecognitionWidget
- `b46f1ac`: unmount System when inactive
- [#94](https://github.com/LOT-Systems/LOT-Computer/pull/94) `be3e8fa`: MemoryWidget effect; defer `handleGenerateReport`
- [#95](https://github.com/LOT-Systems/LOT-Computer/pull/95) `9364aba`: memoize SignalStream and UserMetrics
- `bd9ef2a`: Planner buttons froze because of AudioContext exhaustion

`be3e8fa` cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, but that file was never committed.

Open PRs: [#93](https://github.com/LOT-Systems/LOT-Computer/pull/93) (calendar toast; its interval is correctly gated on `isRouteActive`) and [#97](https://github.com/LOT-Systems/LOT-Computer/pull/97) (SystemProgressWidget text). Neither touches the `dayMs` bug.

There are no GitHub issues, no profiling data and no telemetry about lag in the repo. Nothing captures client errors, which is why bug #1 went unnoticed for about 4 months.

## Next steps (priority order)

1. Apply the one-line `dayMs` fix, redeploy, and bump `CACHE_VERSION` in `public/sw.js` so PWA clients pick it up.
2. Add a type check to the build and benchmark gate.
3. Memoize Logs list items and take `isMouseActive` out of root state.
4. Drop `will-change` from `.grid-fill-hover::before`.
5. Deeper investigation:
   - Profile the System tab in production with a real account (Chrome Performance, 4× CPU throttle) after fix #1.
   - Measure `analyzeIntentions` on a mid-range phone, since its pattern count keeps growing about 3 per release.
   - Wrap the `System.tsx` analysis effect in try/catch or a boundary.
   - Add a lightweight `window.onerror` / `unhandledrejection` reporter so errors like this surface.
