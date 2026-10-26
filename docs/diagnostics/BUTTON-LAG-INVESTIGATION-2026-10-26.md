# Button Lag / Rendering Investigation — 2026-10-26

Automated routine ("Button lag investigation"). Static review only: git history, open issues, current code. No runtime profiling was possible in this environment.

## Summary
- **No open GitHub issues** in `LOT-Systems/LOT-Computer` (0 returned), so there are no fresh user reports to correlate.
- Button lag has been fixed **8+ times between 2026-07-04 and 2026-07-28**. Nothing lag-related has landed since PR #95 (`9364aba`, 2026-07-28).
- The `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md` that commit `be3e8fa` says it applied **is not in the repo**, so the original agent diagnostic and its profiling data are lost.
- Since 2026-07-28 the client has had ~2,500 lines of additions, mostly to the signal-analysis path: `intentionEngine.ts` +507 lines (patterns 145→151) and `badges.ts` +1,170 lines (719→812 badges). These grow the same hot path the earlier lag fixes targeted, with no perf check in the BENCHMARK flow.

## Prior fixes (chronological)
| Date | Commit | Cause → fix |
|---|---|---|
| 07-04 | `bd9ef2a` | New `AudioContext` per click threw once browser cap hit → Planner buttons froze. Reused one context + try/catch. |
| 07-18 | `863b333` | Unbounded `/api/logs` + 30–60s polling starved DB pool. LIMIT 500, 120s polls. |
| 07-18 | `b219cc3` | `analyzeIntentions()`/`recomputeAssembly()` (atom writes) inside `useMemo` in System.tsx → moved to `useEffect`. |
| 07-19 | `ee88f4c`, `6e5007a` | Hidden-but-mounted System widgets kept running intervals/re-rendering; render-phase atom write in PatternRecognitionWidget. Gated on `isRouteActive`, deferred persist + analysis. |
| 07-25 | `b46f1ac` | System tab now fully unmounts when inactive (`unmountWhenInactive`). |
| 07-28 | `9364aba` (#95) | Memoized sort of 1000 signals in SignalStreamWidget, cohort work in UserMetricsWidget. |
| 07-28 | `be3e8fa` (#94) | MemoryWidget render-phase `analyzeIntentions()`; SystemProgressWidget click handler ran pattern scan synchronously. |

## Root-cause pattern
Every `recordSignal` does `intentionEngine.set(...)` (`src/client/stores/intentionEngine.ts:199-229`), which re-renders **every** `useStore(intentionEngine)` subscriber: AIFeedback, PatternRecognition, QuantumEngine, QuantumState, SignalStream, SystemPulse, UserMetrics widgets (7 files). Each fix so far has been whack-a-mole on one widget's per-render cost rather than reducing the fan-out.

## Suspected remaining causes (unverified)
1. **Whole-atom subscription fan-out** (above). Highest likelihood while System is mounted.
2. **`analyzeIntentions()` cost scales with pattern count** (now 151, 6.5k-line file), run on idle callback but still a long main-thread task; any button press landing during it is delayed. `Logs.tsx:3975` (`/qos` trigger) still calls it synchronously on the user action.
3. **System.tsx effect on `[logs]`** (`System.tsx:266-270`) runs `analyzeIntentions()` + `recomputeAssembly()` + `setQuantumState` after every logs change, cascading re-renders in the mounted System tree.
4. **Giant components**: `Logs.tsx` (4,506 lines), `SystemProgressWidget.tsx` (2,513, includes a 1,554-line-deep static changelog and `setInterval` at line 1557), `System.tsx` (1,071). Any state change re-renders large trees without `React.memo` splits.
5. **Permanently-mounted non-System tabs** and unconditional intervals (`TimeWidget` 1s, `MicroGameWidget`, `QuantumRandomWidget`, `System.tsx:98` 500ms dots) — not verified as gated by active route.
6. **CSS**: only 4 `transition-all`/`backdrop-blur` uses client-wide; low suspicion.
7. **Service worker cache** (`public/sw.js`, last bumped 07-25): users on stale bundles may still see already-fixed lag; confirm clients picked up newer builds.

## Next steps
1. Reproduce with Chrome Performance trace on System tab with seeded data (1000 signals, 500 logs) — the harness described in `9364aba` should be committed to `scripts/` so it is repeatable.
2. Replace whole-atom `useStore(intentionEngine)` with `useStore(atom, { keys })` or split `signals` / `patterns` / `state` atoms so pattern writes don't re-render signal consumers.
3. Move `analyzeIntentions()` to a Web Worker, or chunk the pattern scan with scheduler yields; make `/qos` trigger use `deferHeavy`.
4. Audit remaining intervals for `isRouteActive` gating.
5. Add a perf budget (long-task count on a scripted click flow) to the benchmark/green gate, since content-only commits keep growing the hot path.
6. Ask for a concrete repro (which button, which tab, device) — no current report exists.
