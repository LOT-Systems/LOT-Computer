# Button Lag & Rendering — Investigation (2026-10-15)

Scheduled, read-only investigation. No application code was changed.

## Summary
Button lag in LOT Computer has been addressed in at least **eight perf commits** (Jul 2026), and no open issues or PRs remain. The recurring root cause is the **intentionEngine nanostore (`src/client/stores/intentionEngine.ts`, ~5,100+ lines)**: `analyzeIntentions()` runs a ~139-pattern scan and **writes an atom**, which re-renders every subscriber. When it runs in a render phase or a click handler, the UI stalls. The `<Button>` component itself is clean.

No profiling data, user reports, or issues exist in the repo. `src/client/utils/perf.ts` logs interactions >200ms and long frames to the console only; nothing is persisted or collected, so there is no field data confirming current state.

## Evidence (history)
| Commit / PR | What it fixed |
|---|---|
| 863b333 | Capped logs query, backed off stats polling |
| b219cc3 | Moved quantum state writes out of `useMemo` |
| ee88f4c (#85) | Paused System background work off-tab |
| 6e5007a (#88), b46f1ac | Removed render-phase atom write; unmount System tab when inactive |
| bd9ef2a | Planner buttons frozen: reused AudioContext |
| 89da563 | Logs mouse-inactivity timer disabled nav across tabs |
| be3e8fa ([#94](https://github.com/LOT-Systems/LOT-Computer/pull/94)) | MemoryWidget render-phase atom write; SystemProgressWidget `handleGenerateReport` blocking click |
| 9364aba (#95) | Memoized sort/index work in SignalStreamWidget, UserMetricsWidget |

Note: #94 cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, which is **not in the repo** (never committed on any branch). Its findings are only recoverable from the commit message.

## Code review of current state
- `src/client/components/ui/Button.tsx` — store subscriptions are isolated per kind (primary→theme, secondary-rounded→mirror, secondary→none). Not a cause.
- `src/client/index.css:102-126` `.grid-fill-hover` — hover animates only `opacity` (180ms) on a `::before` with `will-change: opacity`. Cheap per button, but `will-change` promotes a compositor layer for every button on the page, and `isolation: isolate` creates a stacking context each; pages with many buttons (System, About, Logs) pay in memory/layer count. Low-risk suspect.
- `Button.tsx` BASE uses `transition-all` on the light primary button (animates layout-affecting props if any change). Minor.
- `src/client/components/Logs.tsx` — 4,506 lines, ~20 `useState`. Effect at ~System.tsx:265 (`[logs]` → `analyzeIntentions()` + `recomputeAssembly()` synchronously after paint) runs the heavy scan on **every logs change**, e.g. each submitted entry; a button click that adds a log will immediately block the main thread.
- `Logs.tsx:3975` — `/qos` trigger calls `analyzeIntentions()` synchronously in a submit handler (same pattern #94 fixed in SystemProgressWidget; not yet deferred).
- `SystemProgressWidget.tsx:1555/1629` — mount-time `recomputeAssembly()` + `analyzeIntentions()` and interval work; guarded off-tab, but runs fully on mount.
- ~20 files use `setInterval` (Clock, TimeWidget 1s tick, System, QuantumRandom, MicroGame, etc.); tab-visibility guards exist only in some.

## Suspected causes (ranked)
1. **Synchronous `analyzeIntentions()` / `recomputeAssembly()` on the interaction path** (Logs `/qos` handler; `[logs]` effect in System.tsx) — heavy scan + atom write → cascading re-renders.
2. **Wide subscriber fan-out on the intentionEngine/selfAssembly atoms** — any write re-renders all System widgets; only a few are memoized.
3. **Giant components** (Logs.tsx 4.5k lines, System.tsx 1k lines) re-rendering wholesale on any state change.
4. **Many always-on intervals** across widgets competing on the main thread.
5. **Per-button compositor layers** from `will-change` + `isolation` (minor).

## Next steps
1. Recover/rewrite the missing BUTTON-LAG-RENDERING-DIAGNOSTIC.md or link it from the PR.
2. Defer `analyzeIntentions()` in `Logs.tsx:3975` (`setTimeout`/`requestIdleCallback`) as #94 did; debounce the `[logs]` effect in System.tsx and move the scan into `requestIdleCallback`.
3. Profile with Chrome DevTools Performance (6x CPU throttle) on System and Logs: click a button, check long tasks and the "Event: click" INP breakdown. Use the existing `initPerfObserver` and persist slow-interaction entries (e.g. send to the existing stats endpoint) to get real field data.
4. Use React Profiler to count re-renders per intentionEngine write; split atom into `signals` / `patterns` slices or use `useStore(atom, {keys})`.
5. Audit `setInterval` users for `document.hidden` and active-tab guards; consolidate into one scheduler.
6. Try removing `will-change: opacity` from `.grid-fill-hover` and check layer count in DevTools Layers.
7. Gather concrete reports: which button, which tab, which device/browser — none are recorded anywhere.
