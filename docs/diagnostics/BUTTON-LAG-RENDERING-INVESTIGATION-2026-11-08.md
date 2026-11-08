# Button Lag & Rendering Investigation — 2026-11-08

Automated (scheduled) static investigation. No runtime profiling was possible in this environment; no profiling data or user-report issues exist in the repo.

## History of the problem (already addressed)
| Commit | Date | Fix |
|---|---|---|
| 863b333 | 07-18 | cap logs query, back off stats polling |
| b219cc3 | 07-18 | move quantum state writes out of `useMemo` |
| ee88f4c / 6e5007a | 07-19 | pause System background work off-tab; stop render-phase atom write |
| bd9ef2a | 07-04 | Planner buttons frozen: reuse AudioContext |
| b46f1ac | 07-25 | unmount System tab when inactive |
| be3e8fa (PR #94) | 07-28 | MemoryWidget render-phase write -> effect; defer report build off click handler |
| 9364aba (PR #95) | 07-28 | memoize SignalStream / UserMetrics heavy work |

Note: `be3e8fa` cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, which is **not in the repo** — the original diagnostic was never committed.

## Suspected causes still present
1. **Render-phase store write, System.tsx:377** — `useMemo(() => getOptimalWidget(), [logs])`. `getOptimalWidget()` calls `analyzeIntentions()` (stores/intentionEngine.ts:3667), which writes the `intentionEngine` atom (line ~3448) on every cooldown miss (5 min). Write during render re-renders all 7 `useStore(intentionEngine)` subscribers (AIFeedback, PatternRecognition, QuantumEngineWidgets, QuantumState, SignalStream, SystemPulse, UserMetrics). Re-runs whenever `logs` changes.
2. **Same pattern, PatternRecognitionWidget.tsx:78** — `useMemo(() => getOptimalWidget(), [patterns])`. Memo key is the array the call itself replaces, so a write -> new `patterns` ref -> re-memo -> potential repeat.
3. **Growing synchronous cost of `analyzeIntentions()`** — now a ~150-pattern scan in a 6.5k-line file; each QIE release (v110–v113) added ~120–135 lines. Runs on main thread on mount (SystemProgressWidget:1555, System.tsx:268) and on cooldown miss.
4. **Bundle/module size** — Logs.tsx 4.5k lines (+70–100 lines per release), SystemProgressWidget 2.5k lines of static changelog strings, intentionEngine 6.5k lines. Parse/eval cost and large component re-render surface. SystemProgressWidget/Logs gain edits every benchmark run.
5. **Intervals/rAF** — setInterval in ~12 widgets (System.tsx:98 500ms dots, :199; SystemProgressWidget:1557; SystemPulse:94; QuantumRandom x2; TimeWidget rAF). Several are already gated by tab visibility; verify the rest are.

## Not found
No CSS-animation hot spots (`transition-all` only in 2 spots), no obvious slow click handlers beyond those fixed.

## Next steps
1. Move `getOptimalWidget()` in System.tsx:377 and PatternRecognitionWidget:78 into `useEffect` + `useState` (same recipe as MemoryWidget in be3e8fa), or split into a pure read (`getOptimalWidgetFrom(patterns)`) that never writes.
2. Run `analyzeIntentions()` via `requestIdleCallback`/`setTimeout` and split pattern groups into chunks.
3. Capture a real React Profiler / Chrome Performance trace on System tab with ~1000 signals (harness from 9364aba) and add numbers here.
4. Lazy-load (`React.lazy`) Logs, SystemProgressWidget, and move changelog strings to a JSON/markdown asset.
5. Commit the missing original diagnostic or reference this doc instead.
