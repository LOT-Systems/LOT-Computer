# Button Lag & Rendering Investigation — 2026-10-11

Scheduled automated review (static, code/history only; no runtime profiling available in this environment).

## Summary
Button lag has been fixed repeatedly (Jun 30 → Jul 28). No new lag-related commits since 2026-07-28 (`9364aba`); no open GitHub issues; no profiling data or user reports in repo. Root cause class is consistent: **intentionEngine nanostore writes / heavy `analyzeIntentions()` scans on or near the interaction path, cascading re-renders across ~7 subscriber widgets in System.** No single active regression is identifiable statically.

## History (relevant commits)
| Commit | Date | Fix |
|---|---|---|
| `bd9ef2a` | 07-04 | Planner buttons frozen: reuse AudioContext, catch sound errors |
| `89da563` | 07-04 | Logs mouse-inactivity timer disabled nav on all tabs |
| `863b333` | 07-18 | Cap logs query, back off stats polling |
| `b219cc3` | 07-18 | Move quantum state writes out of `useMemo` |
| `ee88f4c`, `6e5007a` | 07-19 | Pause System background work off-tab; stop render-phase atom write |
| `b46f1ac` | 07-25 | Unmount System tab when inactive |
| `be3e8fa` (PR #94) | 07-28 | MemoryWidget render-phase write → `useEffect`; defer report build in click handler |
| `9364aba` (PR #95) | 07-28 | Memoize heavy work in SignalStreamWidget / UserMetricsWidget |

## Suspected causes still present (ranked)
1. **Remaining synchronous `analyzeIntentions()` callers** (full ~139-pattern scan on cooldown miss, writes atom):
   - `src/client/components/SystemProgressWidget.tsx:1555` – mount effect, also runs `getEnrichedPhysiologicalReport()` synchronously.
   - `src/client/components/System.tsx:268` – runs on every `logs` change (effect, post-paint, but still blocks main thread and triggers subscriber re-renders).
   - `src/client/components/Logs.tsx:3975` – `/qos`-style triggers in log submit path.
   - `src/client/stores/intentionEngine.ts:5126,5130` – background monitor (30 min) – low risk.
2. **Every intentionEngine write re-renders all subscribers.** Per-widget `useStore` without selectors (`useStore(store, {keys})`/computed atoms) means one signal write fans out. Memoization (9364aba) mitigates cost but not frequency.
3. **26 `setInterval` sites in `src/client`** – verify each is gated on tab visibility/active tab (done for System only per commit messages).
4. **Button.tsx** – every primary button subscribes to `stores.theme` (`PrimaryBtn`); cheap but N subscribers. `.grid-fill-hover::before` uses `will-change: opacity` per button (index.css:102-126) – many buttons = many compositor layers; low-moderate risk on mobile/PWA.
5. **Docs gap:** `be3e8fa` cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, which is not in the tree (never committed). Recommend restoring or treating this file as its successor.

## Not found
No CSS animation/transition on buttons beyond 180ms opacity; no `backdrop-filter` usage in client; no slow handlers in `ui/Button.tsx`.

## Next steps
1. Capture real data: Chrome Performance trace + React Profiler on System tab with 1000 signals/500 logs (the 9364aba harness) clicking Report, Memory, Planner buttons; record long tasks (>50ms) and INP.
2. Add `web-vitals` INP reporting to production to get real user numbers.
3. Move `analyzeIntentions()` in SystemProgressWidget mount effect and System.tsx logs effect behind `deferHeavy`/`requestIdleCallback`.
4. Introduce selector-based subscriptions (computed atoms) for intentionEngine consumers.
5. Audit the 26 `setInterval` sites for visibility/tab gating.
6. Ask the reporter which tab/button lags, and device/PWA vs browser, to narrow scope.
