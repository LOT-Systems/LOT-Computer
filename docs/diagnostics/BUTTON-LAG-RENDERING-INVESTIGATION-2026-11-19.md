# Button Lag & Rendering — Investigation · 2026-11-19

Scheduled investigation. Scope: client button responsiveness and rendering on `master` @ `9f2b88c`.

## TL;DR

**Root cause found: `analyzeIntentions()` throws a `ReferenceError` for every user with at least one signal.** The bug has been on `master` since **2026-08-03** (QIE v112, commit [`1846b80`](https://github.com/LOT-Systems/LOT-Computer/commit/1846b80), merged via [PR #96](https://github.com/LOT-Systems/LOT-Computer/pull/96)).

```ts
// src/client/stores/intentionEngine.ts:3332  (P147 quantum-presence-field)
const daySignals147 = signals.filter(s => now - s.timestamp < dayMs)   // dayMs is not declared in this scope
```

`dayMs` exists only as a local inside `computeUserIndex()` and `getPhysiologicalReport()`, not inside `analyzeIntentions()`. The esbuild build has no type-check step, so it bundled cleanly and the "green" gate passed.

### Why this causes both lag and rendering problems

1. **The analysis never commits.** The throw happens before `intentionEngine.set({... lastAnalysis: now })`. So `lastAnalysis` stays `0` and the 5-minute cooldown **never engages**. Every call re-runs the scan of patterns P1–P146, then throws.
2. **It runs on the click path.** `recordSignal()` (called by nearly every widget button) checks `now - state.lastAnalysis >= ANALYSIS_COOLDOWN`, which is now always true. It schedules the full scan every 5th signal. Once a user hits `MAX_SIGNALS = 1000`, `length % 5 === 0` is true on **every** signal.
3. **System tab render-path throws.**
   - `System.tsx:268`: `analyzeIntentions()` in a `useEffect`, with no try/catch.
   - `System.tsx:377`: `getOptimalWidget()` calls `analyzeIntentions()` inside a `useMemo` during render.

   Both bubble to `AppErrorBoundary` (`entries/app.tsx:35`) and can produce the "Something went wrong · dayMs is not defined" screen or a blank or re-mounting System tab.
4. **Pattern-driven UI is empty.** `recognizedPatterns` is never updated, so PatternRecognitionWidget, the QEW pattern list, cohort classification and `getOptimalWidget` all work off stale or empty data.

### Measured (Node 22, headless harness, 1000 seeded signals over 7 days)

| Call | Before fix | After fix |
|---|---|---|
| `analyzeIntentions()` cold | 6.8 ms + **throws** | 8.2 ms, commits |
| `analyzeIntentions()` within cooldown | **6.1 ms + throws (cooldown bypassed)** | **0.00 ms** |
| `recognizedPatterns.length` after call | 0 | 42 |
| `computeUserIndex()` | 0.4 ms | 0.5 ms |
| `classifyPhysiologicalCohort()` | 0.06 ms | 0.05 ms |
| `recordSignal()` | 0.3 ms | 0.5 ms |

Mobile CPUs are usually 3–5× slower than desktop Node, so expect about 20–35 ms per bypassed scan, plus exception and error-boundary overhead on each call.

**Fix (on branch `claude/brave-rubin-mgng2z`, not yet on master):** an inline `24 * 60 * 60 * 1000` at line 3332. After the fix, a TS `--noResolve` pass over the files touched recently found no other undeclared identifiers (TS2304, TS2552, TS2448). Those files are intentionEngine, System, Logs, SystemProgressWidget, QuantumEngineWidgets, MemoryWidget, badges and easter-eggs.

## Secondary findings (not yet fixed)

| # | Area | Finding | Severity |
|---|---|---|---|
| S1 | `stores/intentionEngine.ts` `recordSignal` → `syncToServer` | At the 1000-signal cap, `length % SYNC_INTERVAL === 0` is always true. Until the first sync response lands, each click starts another `JSON.stringify` of up to 1000 signals (on the click tick) plus a POST. A failed sync never advances `lastSyncedTimestamp`, so it retries on every click. Also, `intentionEngine.set({...state, ...})` after the `await` overwrites signals recorded while the request was in flight, so signals can be lost. | Medium |
| S2 | `components/QuantumEngineWidgets.tsx:27-39, 207-255` | `recordSignal()` (a nanostore write) is called inside a React `setState` updater (`setX(prev => { recordSignal(...) })`). Updaters can run during render, and run twice in StrictMode. This is the same render-phase atom-write doctrine violation fixed in #88 and #94. | Medium |
| S3 | All 7 `useStore(intentionEngine)` subscribers (QuantumStateWidget, PatternRecognitionWidget, SystemPulseWidget, QuantumEngineWidgets, UserMetricsWidget, AIFeedbackWidget, SignalStreamWidget) | `recordSignal` writes the atom synchronously on each click, so every subscriber re-renders on every button press. Memo keys on `signals.length` / `signals` recompute `classifyPhysiologicalCohort` and `getPhysiologicalReport` per click. Each is cheap, but together they run on the interaction tick. Use `computed()` slices or selectors. | Low–Med |
| S4 | `analyzeIntentions` body | 6× `computeUserIndex(signals)` per analysis (P54, P67, P137, P138, P142, P144 and the final one). Four were added after the July perf passes. `computeUserIndex.dimensionScore` uses `daySignals.filter(s => relevant.includes(s))`, which is O(n·m). Compute once and reuse. | Low |
| S5 | `components/SystemProgressWidget.tsx:1356-1459` | The v112, v113 and wiki-v87 `SESSION_REPORTS` entries use `{version, title}` instead of `{session}`, so `report.session` at line 1874 renders blank headers. This is a rendering defect, not a perf issue. | Low |
| S6 | `index.css:69-71` | `body` transitions `letter-spacing` / `line-height` over `--evolution-transition-speed` (400ms). Whenever evolution CSS vars change (`stores/evolution.ts:99`), the whole document re-lays out for each frame of the transition. This happens rarely (narrative fetch), so it's a jank spike, not a per-click cost. | Low |

Not a cause: `components/ui/Button.tsx`. Its variants subscribe to at most one store, and `.grid-fill-hover::before` animates only `opacity` with `will-change`.

## History reviewed

- [#85](https://github.com/LOT-Systems/LOT-Computer/pull/85) / `ee88f4c`: pause System background work off-tab
- [#88](https://github.com/LOT-Systems/LOT-Computer/pull/88) / `6e5007a`: stop render-phase atom write and off-tab churn
- `b46f1ac`: unmount System tab when inactive
- [#94](https://github.com/LOT-Systems/LOT-Computer/pull/94) / `be3e8fa`: MemoryWidget render-phase write, SystemProgressWidget click deferral. This commit cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, which was **never committed** to the repo.
- [#95](https://github.com/LOT-Systems/LOT-Computer/pull/95) / `9364aba`: memoize SignalStream and UserMetrics
- [#96](https://github.com/LOT-Systems/LOT-Computer/pull/96) (2026-08-05): includes `1846b80`, which **introduced the regression**.
- GitHub issues: none open or closed. There are no user reports in the tracker.
- Perf telemetry: `utils/perf.ts` (`initPerfObserver`) only logs to the browser console and an in-memory buffer of 50 entries. **No field data is collected server-side**, so there are no real-user INP numbers to confirm against.

## Next steps

1. **Merge the one-line fix to master and deploy** (top priority; it's a production defect).
2. Add a **type-check gate** (`tsc --noEmit`) to the benchmark/build pipeline. esbuild strips types without checking them, which is how both this bug and the earlier `userState` TDZ crash (`f4ca5a3`) shipped.
3. Wrap `analyzeIntentions()` in a top-level try/finally that always advances `lastAnalysis`. Then one bad pattern block can't disable the cooldown or crash the System tab.
4. Fix S1 (sync gating at the cap and the lost-update race) and S2 (move `recordSignal` out of setState updaters).
5. Deeper investigation: run a real-browser INP trace (Playwright + `PerformanceObserver` `event` entries) on System, Logs and Planner buttons with 1000 seeded signals, before and after the fix. Consider posting the `perf.ts` buffer to the server for field INP data.
6. Fix S5 (normalize the `SESSION_REPORTS` entry shape; the TS type would have caught it, see step 2).
