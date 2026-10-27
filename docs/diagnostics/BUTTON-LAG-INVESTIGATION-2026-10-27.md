# Button Lag & Rendering Investigation — 2026-10-27

Scheduled routine "Button lag investigation". Static code/history review only; no browser profiling was run.

## Summary
- **Open GitHub issues:** none. No user reports of button lag are tracked.
- **Open PRs:** #97 (docs/assembly), #93 (calendar time tracking) — neither is a perf change.
- **No profiling data in repo.** `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md` is referenced by commit be3e8fa but is not committed.
- Lag has been addressed repeatedly; the last perf fix landed 2026-07-28 (PR #94, #95). No lag-related commits since (only docs/badges/QIE feature work), so the fixes are unconfirmed in production.

## Fix history (button lag / rendering)
| Commit | Change |
|---|---|
| bd9ef2a | Planner buttons frozen: reuse AudioContext, catch sound errors |
| 863b333 | Cap logs query, back off stats polling |
| b219cc3 | Move quantum state writes out of useMemo |
| ee88f4c / 6e5007a / b46f1ac | Pause/unmount System tab background work off-tab (tab-switch freeze) |
| be3e8fa (PR #94) | MemoryWidget render-phase store write -> useEffect; SystemProgressWidget click handler deferred via setTimeout |
| 9364aba (PR #95) | Memoize sorts/derivations in SignalStreamWidget, UserMetricsWidget |

## Dominant root-cause pattern
`analyzeIntentions()` (`src/client/stores/intentionEngine.ts`) writes the shared intentionEngine atom and runs a ~139-pattern scan. Any call on the render or click path re-renders every subscriber and blocks the main thread.

## Suspected remaining causes
1. **`PatternRecognitionWidget.tsx:~73`** — `useMemo(() => getOptimalWidget(), [patterns])` still calls `analyzeIntentions()` (a store write) during render. Memo key `patterns` can change as a result of that write -> possible re-render loop/cascade. Move to an effect.
2. **`SystemProgressWidget.tsx:~1555`** — mount effect runs `recomputeAssembly()`, `analyzeIntentions()`, and the enriched report synchronously; a click in the first frames after tab open can feel laggy. Defer/idle-callback it.
3. **`Logs.tsx:~3975`** — `/qos` trigger runs `analyzeIntentions()` synchronously in the submit handler (same pattern as the fixed SystemProgressWidget click).
4. **Many always-mounted widgets subscribe to the intentionEngine atom** — any write fans out. Use selector-style subscriptions (`useStore(atom, {keys})` / computed atoms) instead of whole-atom.
5. **~17 `setInterval`s across widgets** (e.g. TimeWidget 1s tick, System.tsx 500ms dots, SystemPulse, QuantumRandom). Verify each is paused when hidden/off-tab and doesn't trigger store writes.
6. **CSS:** `Button.tsx` uses `.grid-fill-hover::before` (`src/client/index.css:102-160`) with gradient backgrounds and a 180ms opacity transition on every button; PrimaryBtn uses `transition-all`. Low risk alone, but many buttons + `.evolved-blur` filter (`index.css:186`) can add paint cost on low-end devices. `Button` itself is not memoized and subscribes to `theme`/`isMirrorOn` stores (cheap).

## Next steps
1. Commit the missing diagnostic or capture a real Chrome Performance trace on the System tab (click -> next paint; look for long tasks >50ms and `analyzeIntentions` frames). Add React Profiler "why did render" for the intentionEngine subscribers.
2. Fix items 1-3 above (small, same pattern as PR #94).
3. Audit intentionEngine subscribers; narrow subscriptions.
4. Audit intervals for visibility gating.
5. Ask the reporter for device/browser and which button lags (Planner, Memory, System report?) to target profiling.
