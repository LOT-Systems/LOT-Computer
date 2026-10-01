# Button Lag & Rendering Investigation — 2026-10-01

Automated routine: "Button lag investigation". Static review only (no browser profiling run).

## Summary
No open GitHub issues mention button lag / slow rendering (searched lot-systems/lot-computer). Lag was addressed in
earlier perf passes (PRs #90–#95). No profiling data or user reports are in the repo; the referenced
`docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md` (cited by commit `be3e8fa`) does **not exist** in the tree.
Since 2026-07-29 only QIE/badge/wiki commits touched `src/client` (no new perf fixes).

## Root cause already identified and fixed
Common pattern: `analyzeIntentions()` (`src/client/stores/intentionEngine.ts:258`) writes the `intentionEngine`
nanostore atom and runs a ~139–145 pattern scan. Calling it during render (`useMemo`) or synchronously in a click
handler cascades re-renders / blocks the click.
- `be3e8fa` — MemoryWidget: moved write out of `useMemo` into `useEffect`; SystemProgressWidget `handleGenerateReport`: deferred with `setTimeout(…, 0)`.
- `9364aba` — memoized sort in SignalStreamWidget and getUserIndex/classifyPhysiologicalCohort in UserMetricsWidget.
- Earlier: `f4ca5a3` (userState init crash), System.tsx / Logs.tsx quantumState moved to effects.

## NEW finding (rendering bug introduced by 9364aba)
`src/client/components/SignalStreamWidget.tsx` ~line 52: `React.useMemo` is called **after**
`if (engine.signals.length < 3) return null`. This violates the Rules of Hooks. When signals cross from <3 to ≥3
(first-time user, or cleared data), React throws "Rendered more hooks than during the previous render", which can
blank the System tab. Fix: move the `useMemo` above the early return (guard inside it for length < 3).
(`UserMetricsWidget` was done correctly, placed before its early returns.)

## Remaining suspects (not yet verified)
1. `SystemProgressWidget.tsx:1553-1555` — mount effect runs `recomputeAssembly()`, `analyzeIntentions()` and
   `getEnrichedPhysiologicalReport()` synchronously; plus 3 `setInterval`s in that file. Heavy on System tab mount (~118ms measured in 9364aba).
2. `Logs.tsx:3975` — `/qos` trigger calls `analyzeIntentions()` synchronously in the submit handler (not deferred).
3. `intentionEngine.ts:5126-5130` — background QOS monitor calls `analyzeIntentions()` synchronously on start and every interval; main-thread jank when it fires.
4. Large components (`System.tsx`, `SystemProgressWidget.tsx`, `About.tsx`, `Logs.tsx` ~4k+ lines) — many mounted-but-hidden widgets subscribing to `intentionEngine`; any atom write re-renders all of them.
5. Each QIE release adds more patterns (now 145+ / 51 archetypes) so scan cost grows monotonically.

## Next steps
1. Fix the SignalStreamWidget hook-order bug (small, high confidence).
2. Wrap `/qos` handler and mount effect in `deferHeavy`/`setTimeout` like `handleGenerateReport`.
3. Run a Chrome Performance trace / React Profiler on System tab with 1000 signals; record INP for button clicks. Add a perf-budget test to the benchmark.
4. Use `useStore(atom, {keys})` or selectors so widgets only subscribe to the slice they use; unmount hidden tabs instead of keeping them mounted.
5. Move `analyzeIntentions()` to a Web Worker or chunk it with `requestIdleCallback`.
6. Restore/recreate the missing BUTTON-LAG-RENDERING-DIAGNOSTIC.md and open a tracking issue.
