# Button Lag & Rendering Investigation — 2026-10-29

Scheduled investigation. Static review only (no live profiling, no browser run).

## Summary
Button lag has been addressed in at least 8 perf commits since July 2026. No open GitHub issues
match (search: "button lag slow rendering performance" → 0 results). No profiling data is checked in;
`src/client/utils/perf.ts` logs INP >200ms and long animation frames to the console only, so field data is not persisted anywhere.
The earlier report `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md` (cited in be3e8fa) is **not in the repo**.

## Prior fixes (history)
| Commit | Fix |
|---|---|
| 863b333 | cap logs query, back off stats polling |
| b219cc3 | move quantum state writes out of `useMemo` |
| bd9ef2a | Planner buttons frozen: reuse AudioContext |
| ee88f4c / 6e5007a | pause System background work off-tab; stop render-phase atom write |
| b46f1ac | unmount System tab when inactive |
| be3e8fa (PR #94) | MemoryWidget write → `useEffect`; SystemProgressWidget report build deferred a macrotask |
| 9364aba (PR #95) | memoize SignalStreamWidget sort and UserMetricsWidget index/cohort |

Pattern: the dominant cause has been **intentionEngine store writes / `analyzeIntentions()` (~145-pattern scan) running on the
interaction tick or during render**, cascading re-renders to every `useStore(intentionEngine)` subscriber (7 components).

## Suspected remaining causes
1. **Render-phase store writes still present** (`getOptimalWidget()` → `analyzeIntentions()` → atom write, inside `useMemo`):
   - `src/client/components/System.tsx:377` — `useMemo(() => getOptimalWidget(), [logs])`
   - `src/client/components/PatternRecognitionWidget.tsx:78` — `useMemo(..., [patterns])` (comment claims it cannot write, but `getOptimalWidget` calls `analyzeIntentions()` unconditionally at `stores/intentionEngine.ts:3667`; cooldown only helps if it early-returns).
   Same anti-pattern fixed in MemoryWidget (be3e8fa). 
2. **Synchronous analysis on click**: `Logs.tsx:3975` (`/qos` trigger) and `SystemProgressWidget.tsx:1555` call `analyzeIntentions()` directly in handlers (not deferred).
3. **Monolithic components**: `Logs.tsx` (4.5k lines), `System.tsx` (1k lines, many widgets) — any subscribed state change re-renders large trees; no `React.memo` boundaries evident.
4. **Startup/background**: `startBackgroundQOSMonitor` runs `analyzeIntentions()` synchronously at start and every interval; 23 `setInterval` sites client-wide.
5. **CSS**: `transition-all` on `ui/Button.tsx:77` (and a few widgets) — minor; only 5 backdrop/transition-all/will-change hits, unlikely primary.

## Next steps
1. Move `getOptimalWidget()` calls (System.tsx:377, PatternRecognitionWidget.tsx:78) to a read-only variant that does not call `analyzeIntentions()`, or compute from `engine.recognizedPatterns`.
2. Wrap click-path `analyzeIntentions()` calls (Logs.tsx:3975, SystemProgressWidget.tsx:1555) in `deferHeavy`.
3. Reproduce with the headless-Chromium harness (1000 signals + 500 logs) and record Chrome trace / INP per tab; persist INP from `perf.ts` to a server endpoint for real-user data.
4. Add `React.memo` / selector-based subscriptions (`useStore(engine, {keys})`) for the 7 intentionEngine subscribers.
5. Ask the reporter for device/browser, which button(s), and which tab, to narrow scope.
