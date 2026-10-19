# Button Lag & Rendering — Investigation (2026-10-19)

Scheduled, read-only code/history review. No profiler or runtime metrics were run; no code changed.

## Summary
Button lag has been addressed in **7+ prior perf passes** (Jul–Aug 2026). Issue tracker has **0** lag/slow/freeze issues; no user reports in repo. The latest perf commit (`9364aba`, PR #95) reported System<->Log switching down to a one-time ~118ms mount. No commits touch perf after Aug 5 (only badges/wiki/QIE feature work), so **no new regression is evidenced**, but QIE feature growth keeps adding work to the same hot path.

## History (perf commits)
| Commit | Fix |
|---|---|
| 863b333 | cap logs query, back off stats polling |
| b219cc3 | move quantum state writes out of useMemo |
| ee88f4c / 6e5007a / b46f1ac | pause System background work off-tab; stop render-phase atom write; unmount System tab when inactive |
| be3e8fa (#94) | Memory: `analyzeIntentions()` out of useMemo; SystemProgress click handler deferred a macrotask |
| 9364aba (#95) | memoize SignalStream sort (1000 signals) and UserMetrics cohort work |
| f4ca5a3 | prod crash `userState` TDZ (related fallout of perf refactor) |

Note: `be3e8fa` cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, which **is not in the repo** — the diagnostic was never committed.

## Root-cause pattern (recurring)
`analyzeIntentions()` (`src/client/stores/intentionEngine.ts:258`, 6.5k-line file, 139+ pattern scan) **writes the `intentionEngine` atom**. Every widget subscribed to that atom re-renders. Any call on the click/render path blocks the button.

## Suspected remaining causes
1. **Synchronous `analyzeIntentions()` on interaction paths** — `Logs.tsx:3975` (`/qos` trigger, inline in submit handler); `System.tsx:268` and `SystemProgressWidget.tsx:1555` (mount effects, run on paint-adjacent tick). Candidates for `deferHeavy`, as `recordSignal` already does (`intentionEngine.ts:243`).
2. **Monolithic components** — `Logs.tsx` 4506 lines, `System.tsx` 1071, `SystemProgressWidget.tsx` 2513 (mostly static changelog strings re-created per render). Any state change re-renders huge trees; little `React.memo` isolation.
3. **`useBreathe` 100ms interval** (`utils/breathe.ts:112`) re-renders `System`/`Logs` 10x/sec while enabled — likely contributor to hover/click jank when Breathe is on. Only update state when displayed value changes.
4. **Many timers** (~25 `setInterval`s, e.g. `TimeWidget` 1s, `Clock`, `QuantumRandomWidget`); most lack `document.hidden` guards.
5. **CSS**: `Button.tsx` uses `transition-all` on primary buttons (line 77) — animates layout properties; use `transition-colors`. `grid-fill-hover` class cost not inspected.
6. `Logs.tsx` effect runs `analyzeIntentions(); recomputeAssembly()` on **every `logs` change** (`System.tsx:265-270` equivalent pattern) — fine after paint, but heavy on large logs.

## Next steps
1. Capture a real Chrome Performance trace on a seeded account (1000 signals / 500 logs): click a Button with Breathe on/off; look for long tasks > 50ms (the earlier headless harness used in 9364aba can be reused).
2. Add `React.Profiler`/why-did-you-render on `Logs`, `System`, `SystemProgressWidget`.
3. Defer the three sync `analyzeIntentions()` call sites; gate `useBreathe` re-renders; swap `transition-all`.
4. Split `SystemProgressWidget` static changelog out of the component (module constant / lazy chunk).
5. Ask the reporter which button/tab/device lags — no reproduction details exist, so cause is unconfirmed.
