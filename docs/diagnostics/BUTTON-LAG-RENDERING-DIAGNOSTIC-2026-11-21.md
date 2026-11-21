# Button Lag & Rendering — Diagnostic · 2026-11-21

Scheduled investigation. Scope: button responsiveness and rendering problems in the client (`src/client`). Baseline: `master` @ `9f2b88c` (2026-11-17), the same commit as this branch.

## TL;DR

**Root cause (confirmed): `analyzeIntentions()` throws `ReferenceError: dayMs is not defined` on every call made while the user has at least one signal.** This has been the case since QIE v112 (`1846b80`, 2026-08-03).

- `src/client/stores/intentionEngine.ts:3332` (the P147 block) uses `dayMs`. That constant is only declared inside *other* functions (`:3543`, `:4620`), so it is out of scope here.
- `tsc` confirms it: `intentionEngine.ts(3332,65): error TS2304: Cannot find name 'dayMs'`.
- Nothing caught it because the client is bundled by esbuild (`client:js:build`), which strips types without type-checking. Only the server build runs `tsc`.

Why it causes both lag and rendering failures:

1. **The 5-minute analysis cooldown is broken.** `lastAnalysis` is only written at the very end of `analyzeIntentions()` (`:3442`), and the throw at `:3332` happens before that point. So the cooldown at `:263` never engages, and *every* call re-runs the full ~146-pattern scan before it throws. The scan is about 192 `signals.filter` passes over up to 1000 signals, roughly 12 ms per call in a Node benchmark (see below), and slower on mobile. This undoes the cooldown that the July perf passes (#85, #88, #94, #95) relied on.
2. **Callers with no error handling crash:**
   - `System.tsx:377`: `useMemo(() => getOptimalWidget(), [logs])` calls `analyzeIntentions()` **during render**. System is mounted at `entries/app.tsx:188` with no `WidgetErrorBoundary` around it, so the error should reach `AppErrorBoundary` and show *"Something went wrong. dayMs is not defined"*.
   - `System.tsx:268`: `useEffect` → `analyzeIntentions()`, also unguarded.
   - `PatternRecognitionWidget.tsx:78`: `getOptimalWidget()` in `useMemo`.
   - `intentionEngine.ts:243` (`deferHeavy` → `requestIdleCallback`) and `:5126/5130` (QOS monitor interval) throw uncaught errors. That shows up as console noise, and the wasted scan runs on every 5th signal.
   - `MemoryWidget.tsx:274`, `Logs.tsx:3975` and `SystemProgressWidget.tsx:1629` wrap the call in `try`. They don't crash, but each button press there still pays for the full scan.

**One-line fix:** at `intentionEngine.ts:3332`, replace `dayMs` with `24 * 60 * 60 * 1000`, or declare `const dayMs = 24 * 60 * 60 * 1000` near the top of `analyzeIntentions()`.

## Evidence

| Check | Result |
|---|---|
| `grep -n '\bdayMs\b' intentionEngine.ts` | used at 3332; declared only at 3543 and 4620, both in other functions |
| `tsc --noEmit` on `intentionEngine.ts` | `TS2304: Cannot find name 'dayMs'` at 3332:65 |
| `git log -S daySignals147` | introduced in `1846b80` (QIE v112, P146–P148) |
| Node benchmark, 1000 seeded signals, current code | `ReferenceError: dayMs is not defined`; `lastAnalysis` stays `0` |
| Same benchmark with `dayMs` → `864e5` | runs clean; ~8–14 ms per call (first call 27 ms); 42 patterns; `lastAnalysis` set, so the cooldown works |

The benchmark is a headless Node harness (esbuild bundle, mocked `localStorage`). It does not run a browser. The full-app crash path at `System.tsx:377` comes from reading the code and has **not** been reproduced in a browser, because `node_modules` isn't installed in this container.

## Secondary findings

1. **Blank session-log headers.** In `SystemProgressWidget.tsx`, the `SESSION_REPORTS` entries for `v112`, `v113` and `wiki-v87` (starting around `:1398`) use `{version, title}` instead of the declared `{date, session}`. The renderer at `:1874` shows `{report.session}`, so those rows have empty headings. esbuild doesn't catch this either.
2. **Duplicate React keys.** The `SESSION_REPORTS.map` at `:1871` uses `key={report.date}`, and 21 dates repeat. Opening "Session logs" triggers duplicate-key warnings and can mis-reconcile rows.
3. **Render-time calls added since the last perf pass.** `getCircadianPhase()` is now called in render (`System.tsx` Biofield table, `QuantumEngineWidgets.tsx` cohort view). It's cheap (`new Date().getHours()`), so this is not a lag source, just noted.
4. **New 15-minute astrology tick** (`System.tsx`). It's paused when `document.hidden` and fires once every 15 minutes. Low risk.
5. **P151 ordering assumption.** P151 (`intentionEngine.ts:~3408`) treats `negMood151[0]` as the earliest signal. That only holds if signals are kept in ascending timestamp order. This is a correctness issue, not a performance one.

## Prior work (context)

| PR / commit | What it fixed |
|---|---|
| #85 `ee88f4c` | pause System background work off-tab |
| #88 `6e5007a` | stop render-phase atom write and off-tab churn |
| `b219cc3` | move quantum state writes out of `useMemo` |
| #94 `be3e8fa` | MemoryWidget render-phase `analyzeIntentions`; defer SystemProgress report click |
| #95 `9364aba` | memoize SignalStream sort and UserMetrics index/cohort |
| `bd9ef2a` | Planner buttons frozen (AudioContext reuse) |

All of these assumed that `analyzeIntentions()` would usually return early from its cooldown. The v112 regression breaks that assumption.

Note: commit `be3e8fa` cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, but that file was never committed.

GitHub issues: none open or closed. Open PRs: #93 (calendar time tracking) and #97 (wiki v88 / badge v32). Neither touches `analyzeIntentions`.

## Recommended next steps

1. **Fix `dayMs`** (one line), then check that `lastAnalysis` advances and that the System tab renders with a non-empty `intention-signals` store.
2. **Add a client type-check gate**: `tsc --noEmit -p tsconfig.json` in `build` or CI. It would have caught both this bug and the `SESSION_REPORTS` shape mismatch. Run it once across the client first, because it may surface other latent errors.
3. **Make the cooldown independent of success**: set `lastAnalysis` at the start of `analyzeIntentions()`, or in a `finally` block, so that a single bad pattern can't remove the throttle.
4. **Guard render-time callers**: move `getOptimalWidget()` at `System.tsx:377` into an effect, or read `recognizedPatterns` from the store. Wrap pattern blocks in `try`, and wrap `<System />` in a `WidgetErrorBoundary`.
5. **Fix `SESSION_REPORTS`**: normalize the three entries to `{date, session, assembled}` and use `key={\`${report.date}-${i}\`}`.
6. **Still needs a browser check**: profile one button press on the System tab and one on Memory in Chromium before and after the fix, using a store seeded with 1000 signals, to confirm the user-visible improvement. `window.__LOT_WIDGET_PERF__` already records widget mount timings for this.
