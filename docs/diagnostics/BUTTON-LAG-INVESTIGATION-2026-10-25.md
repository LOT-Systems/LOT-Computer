# Button Lag & Rendering — Investigation (2026-10-25)

Automated scheduled investigation. Static review of git history, PRs, issues and code; **no runtime profiling was possible** in this environment.

## Summary
Button lag has been a recurring theme and has been fixed in several passes. No open GitHub issues mention it (searched `lot-systems/lot-computer`). The only related PR found is #94. Root-cause pattern in every fix: **synchronous or render-phase writes to the `intentionEngine` nanostore atom, and the heavy `analyzeIntentions()` scan, running on the interaction tick**, which re-renders all subscribers.

## History of perf fixes
| Commit | Fix |
|---|---|
| 863b333 | Cap logs query, back off stats polling |
| b219cc3 | Move quantum state writes out of `useMemo` |
| ee88f4c / 6e5007a | Pause System background work off-tab; stop render-phase atom write |
| b46f1ac | Unmount System tab when inactive |
| be3e8fa (PR #94) | MemoryWidget render-phase `analyzeIntentions()` -> `useEffect`; SystemProgressWidget click handler deferred one macrotask |
| 9364aba (PR #95) | Memoize SignalStream sort (1000 signals) and UserMetrics cohort work |

Note: commit be3e8fa references `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, which is **not in the repo** (never committed). This file replaces it as the record.

## What changed since the last perf fix (9364aba -> HEAD)
Not perf-reviewed, and all feed the hot path:
- `src/client/stores/intentionEngine.ts`: +537 lines (patterns P143-P151, archetypes, handlers). Every new pattern makes each `analyzeIntentions()` scan slower (~139 -> 151 patterns).
- `Logs.tsx` +369, `SystemProgressWidget.tsx` +127, `System.tsx` +42, `PatternRecognitionWidget.tsx` +21, `QuantumEngineWidgets.tsx` +15, `badges.ts` +1170 (812 badges), `easter-eggs.ts` +307.
- `System.tsx`: new 15-min astrology tick re-computes and re-renders the whole System component; new effect writes to the QIE bus (`recordAstrologySignal`) + localStorage on mount.

## Suspected causes (ranked)
1. **`analyzeIntentions()` synchronous callers** — still called directly (not deferred) at:
   - `Logs.tsx:3975` (`/qos` trigger, in submit handler)
   - `System.tsx:268` (effect on every `[logs]` change; runs after paint but still blocks the main thread, then `recomputeAssembly()` + `setQuantumState`)
   - `SystemProgressWidget.tsx:1555`
   - `intentionEngine.ts:5126/5130` (QOS monitor, startup + every interval)
   Only `recordSignal` uses `deferHeavy()` (`intentionEngine.ts:243`). Pattern count keeps growing, so cost grows with each QIE version.
2. **Atom-write fan-out**: every `analyzeIntentions()` write notifies all `intentionEngine` subscribers (System widgets, Logs, Memory, Integrity). Subscribers should use selectors/`computed` slices rather than the whole atom.
3. **Logs.tsx growth (+369 lines, ~4000-line file)**: large single component; check for unmemoized derived data and handlers re-created each render.
4. **`ui/Button.tsx:77`** uses `transition-all` (primary button) — minor; animates layout properties. Prefer `transition-colors`.
5. **badges.ts (812 badges)**: any per-render badge evaluation would be O(n); verify it is memoized/off interaction path.

## Not verified
- No profiling data, INP logs, or user reports are in the repo. `src/client/utils/perf.ts` already logs `[Perf] Slow interaction` (>200ms) and long animation frames to the console — **but nothing collects them**.

## Next steps
1. Add a beacon from `perf.ts` (INP > 200ms, target + route) to the server/log so real-world data exists.
2. Wrap remaining direct `analyzeIntentions()` calls in `deferHeavy()`/`requestIdleCallback`; consider chunking the pattern scan or a Web Worker.
3. Reproduce with the headless-Chromium harness used in 9364aba (1000 signals + 500 logs), now with 151 patterns, and Chrome trace the Logs submit + System tab switch.
4. Audit `intentionEngine` subscribers for `useStore(atom, {keys})` selectors.
5. Swap `transition-all` -> `transition-colors` in Button.
6. Commit a perf budget test (analyzeIntentions < N ms at 1000 signals) so new QIE versions can't regress silently.
