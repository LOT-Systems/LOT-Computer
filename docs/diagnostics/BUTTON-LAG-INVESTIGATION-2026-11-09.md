# Button Lag & Rendering Investigation — 2026-11-09

Scheduled routine "Button lag investigation". Static code/history review only; no live profiling was possible in this environment.

## Summary
- **Open GitHub issues:** none (0 open in LOT-Systems/LOT-Computer). No user reports or profiling traces are stored in the repo.
- **History:** button lag has been fixed repeatedly. Every fix has been the same class of bug: synchronous heavy work in the QIE (`intentionEngine`) store, or atom writes during render, fanning out to all subscribers.
  - `bd9ef2a` Planner buttons frozen: AudioContext reuse
  - `863b333` cap logs query, back off stats polling
  - `b219cc3` move quantum state writes out of useMemo
  - `ee88f4c`, `6e5007a`, `b46f1ac` pause/unmount System tab off-tab; stop render-phase atom write
  - `be3e8fa` (PR #94) MemoryWidget render-phase write; SystemProgressWidget click handler blocked by `analyzeIntentions()`
  - `9364aba` (PR #95) memoize SignalStream / UserMetrics
- **The diagnostic referenced by `be3e8fa`** (`docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`) is **not in the repo**. Its findings exist only in commit messages.

## `Button` component — not the cause
`src/client/components/ui/Button.tsx` is already well isolated: the `secondary` kind has no store subscriptions; `primary` subscribes only to `theme`; `secondary-rounded` only to `isMirrorOn`. CSS hover (`.grid-fill-hover::before`, `src/client/index.css:102-125`) is a 180 ms opacity transition on a pseudo-element, which is cheap. `overflow-hidden` + `isolation: isolate` per button adds a stacking context each, a minor cost only with hundreds of buttons.

## Suspected causes (ranked)
1. **`analyzeIntentions()` is a ~3,200-line synchronous function** (`src/client/stores/intentionEngine.ts:258-3467`) and it writes the shared atom. Its 5-minute cooldown only hides the cost; on a cooldown miss it blocks the main thread. Call sites: `System.tsx:268`, `SystemProgressWidget.tsx:1555,1629`, `MemoryWidget.tsx:274`, `Logs.tsx:3975`, `PatternRecognitionWidget.tsx` (via `getOptimalWidget`). Since PR #95 it has grown: `intentionEngine.ts` +537 lines, patterns 139 → 151 (P149–P151, v111–v113).
2. **Regression risk after the last perf pass.** After `9364aba`, `System.tsx` (+42), `SystemProgressWidget.tsx` (+127), `QuantumEngineWidgets.tsx` (+15), `PatternRecognitionWidget.tsx` (+21) and `Logs.tsx` (+369) changed with no perf check. Each new pattern/phase row in System is another subscriber to the same atom (`System.tsx` has 15 `useStore` calls, 1071 lines).
3. **Large modules parsed/evaluated on load:** `badges.ts` (+1,170 lines, 635 ids, 812 badges) and `easter-eggs.ts` (+307); `checkAndAwardBadges()` is run from `MemoryWidget.tsx:163`. It is async-wrapped, but check that its inner loop doesn't run synchronously in an interaction.
4. **Timers:** `System.tsx:98,199` intervals and the 30-min QOS background monitor. Verify they stop when the tab is unmounted.

## Next steps
1. Profile with Chrome Performance on the System tab with ~1000 signals (the harness used for `9364aba`); record Long Tasks and INP on button clicks.
2. Move `analyzeIntentions()` to a Web Worker, or chunk it with `requestIdleCallback`/`scheduler.postTask`, and split the file by pattern group. Make it return a new array only when patterns actually change.
3. Convert System widgets to `useStore(atom, { keys: [...] })` or derived `computed` atoms so a pattern write doesn't re-render all subscribers.
4. Add a CI perf smoke test (headless Chromium, long-task budget) so regressions from the frequent QIE version bumps are caught.
5. Re-create the missing `BUTTON-LAG-RENDERING-DIAGNOSTIC.md` or link this file from it.
6. Add `web-vitals` INP reporting to collect real user data; none exists today.

## Confidence
Medium-low on cause #1 as the *current* bottleneck: it is inferred from history and code size, not measured.
