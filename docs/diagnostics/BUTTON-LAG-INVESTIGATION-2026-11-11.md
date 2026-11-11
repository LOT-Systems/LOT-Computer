# Button Lag & Rendering — Investigation (2026-11-11)

Scheduled investigation run. Static code review plus commit/PR/issue history. **No code changed** in this pass, and nothing was profiled at runtime (see Next steps).

## TL;DR

- **No open GitHub issues** mention lag, freezing, or rendering. There are no open PRs about performance. The last perf work was merged on 2026-07-28 (PR #94, #95). Nothing on `master` has changed since 2026-08-05.
- The lag that users reported in July (frozen buttons, a stall when switching tabs, slow widgets) went through **six fix passes**. Each one found a real root cause, and the System tab is now **unmounted when it is not the active tab**.
- I found **no single remaining smoking gun**. I did find **4 residual suspects**, in priority order below. None of them is proven yet. Each needs a profiler trace to confirm.
- `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md` is cited by commit `be3e8fa`, but it was **never committed**. It is not in any branch or in git history.

## History of the issue (already fixed)

| Date | Commit / PR | Root cause fixed |
|---|---|---|
| 07-04 | `bd9ef2a` | Planner buttons froze. A new `AudioContext` was created on every click, the browser cap was hit, and the constructor threw. |
| 07-04 | `89da563` | Logs' mouse-inactivity timer set `pointer-events-none` on `#nav` from hidden tabs, so nav buttons became unclickable. |
| 07-18 | `863b333` | `/api/logs` was unbounded and stats polling was aggressive. This starved the DB, and widgets took about 1 minute to respond. |
| 07-18 | `b219cc3` | `System.tsx` wrote atoms inside `useMemo`, during render. |
| 07-19 | `ee88f4c` / [#85](https://github.com/LOT-Systems/LOT-Computer/pull/85) | Off-tab intervals kept running (`document.hidden` was the only guard). `recordSignal` persisted and analysed synchronously. |
| 07-19 | `6e5007a` / [#88](https://github.com/LOT-Systems/LOT-Computer/pull/88) | `PatternRecognitionWidget` wrote the store during render. Three System intervals had no guard. |
| 07-25 | `b46f1ac` | System stayed mounted (`display:none`) after a visit, so every signal from any tab re-rendered about 7 widgets. Fixed by unmounting System when it is inactive. |
| 07-28 | `be3e8fa` / [#94](https://github.com/LOT-Systems/LOT-Computer/pull/94) | `MemoryWidget` called `analyzeIntentions()` inside `useMemo`. The SystemProgress report button ran the scan synchronously. |
| 07-28 | `9364aba` / [#95](https://github.com/LOT-Systems/LOT-Computer/pull/95) | `SignalStreamWidget` sorted 1000 signals on every render. `UserMetricsWidget` did cohort work without memoization. |

Recurring pattern: **work keyed to `intentionEngine` fans out to every subscriber**. Every `recordSignal()` call writes the atom **synchronously** ([`stores/intentionEngine.ts:228`](../../src/client/stores/intentionEngine.ts)), and that re-renders all 7 `useStore(intentionEngine)` widgets. 36 click handlers in `components/` call `recordSignal`.

## Residual suspects (current `master`)

### S1 — Cohort view in `QuantumEngineWidgets` does unmemoized cohort work on every render (high confidence, low effort)
[`src/client/components/QuantumEngineWidgets.tsx:372-378`](../../src/client/components/QuantumEngineWidgets.tsx): when `view === 'cohort'`, the render body calls `classifyPhysiologicalCohort(engineState.signals, …)`. That call filters up to 1000 signals and scores every archetype, and it runs again on **every** intentionEngine write. The same result is already memoized in `cohortDirective` (line 201). Lines 355-358 also filter the whole `signals` array on every render. This is the same class of bug that #95 fixed in `SignalStreamWidget` and `UserMetricsWidget`, in the one widget #95 did not touch.
**Fix:** reuse the memoized result, or wrap it in `useMemo([engineState.signals, engineState.recognizedPatterns])`.

### S2 — Clicking a button re-renders all 7 intentionEngine subscribers synchronously (medium confidence, medium effort)
`recordSignal()` defers the persist and the analysis, but the `intentionEngine.set({...signals})` call itself runs during the click. The subscribers are `QuantumStateWidget`, `PatternRecognitionWidget`, `SystemPulseWidget`, `QuantumEngineWidgets`, `UserMetricsWidget`, `AIFeedbackWidget` and `SignalStreamWidget`, and each one re-renders before paint. Each widget is now cheap on its own, but on the System tab every click still pays for 7 widget renders.
**Options:**
- Narrow the subscriptions with `computed()` slices, so a widget that only shows patterns doesn't re-render when a signal is appended.
- Or batch the signal append with `requestAnimationFrame` / `startTransition`, so the button's own visual state paints first.

### S3 — `useEvolutionSync` rewrites root CSS variables and a `<style>` tag on every System mount (medium confidence)
[`src/client/hooks/useEvolutionSync.ts:37-84`](../../src/client/hooks/useEvolutionSync.ts) → [`stores/evolution.ts:98-131`](../../src/client/stores/evolution.ts).
- System now unmounts when inactive, so this effect runs again on **every switch to System**, and again whenever `logs.length` changes.
- Each run sets about 20 `--evolution-*` and `--theme-*` properties on `<html>`. It also rewrites `#theme-evolution-animations.textContent`, which forces the whole stylesheet to be parsed again and the whole document's style to be recalculated.
- `body` transitions `letter-spacing` and `line-height` ([`index.css:69-71`](../../src/client/index.css)). If those values actually change, the whole page re-lays out every frame for 400 ms. That would show up as "buttons lag right after I open System or log something".

**Fix:** skip the write when the values haven't changed (compare with the previous state), and skip the `textContent` write when the CSS is the same. Consider removing the layout-property transitions from `body`.

### S4 — Hover-only `::before` grid on every button (low confidence)
`.grid-fill-hover::before` ([`index.css:102-160`](../../src/client/index.css)) draws 1–2 gradient layers and fades their opacity on hover. That part is cheap and compositor-friendly. But `isolation: isolate` on every button creates a stacking context for each one, and `PrimaryBtn` uses `transition-all`. This only matters on long lists of buttons and on low-end mobile devices. Profile it before changing anything.

### Not suspects (checked)
- `Button.tsx`: memo-light, and it subscribes to at most one store (`theme` or `isMirrorOn`). Fine.
- AudioContext: both `plannerWidget.ts` and `utils/sovietChime.ts` reuse one shared context. Fine.
- Ungated 1 s intervals (`TimeWidget`, `QuantumRandomWidget`, `Clock`) each re-render only their own small component. They are acceptable.
- `getUserState()` only reads the atom, so it is cheap.

## Next steps (need deeper investigation)

1. **Get a fresh symptom report.** No issue is filed, so it isn't clear which buttons lag, on which tab or device, or whether it is the PWA. Open a GitHub issue to track this.
2. **Re-run the headless-Chromium harness from #95** (seed: 1000 signals, 500 logs). Record a Performance trace of:
   - a click on a System widget button, for S1 and S2;
   - a switch from Log to System, for S3.

   Long tasks over 50 ms confirm a suspect.
3. Turn on the React Profiler "why did this render" view for the 7 subscriber widgets during a single click.
4. Apply S1 (safe, small) and S3's no-op guard. Measure before and after.
5. If S2 is confirmed, design `computed()` store slices for the intentionEngine subscribers.
6. Commit the missing `BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, or remove the reference to it.
