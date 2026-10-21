# Button Lag & Rendering Investigation — 2026-10-21

Scheduled routine "Button lag investigation". Static review only (no profiler/runtime data available in this environment).

## Summary
Button lag has been addressed in a series of perf passes (Jul 2026). No open GitHub issues mention button lag. No new lag-related commits since PR #95 (2026-07-28); everything since is badge/QIE/wiki work (PR #96) that grows `System.tsx` / `SystemProgressWidget.tsx` and could reintroduce the problem.

## History (PRs / commits)
| Ref | Fix |
|---|---|
| 863b333 | Cap logs query, back off stats polling |
| b219cc3 | Move quantum state writes out of `useMemo` |
| ee88f4c / PR #85 | Pause System background work off-tab |
| 6e5007a / PR #88 | Stop render-phase atom write + off-tab churn |
| b46f1ac | Unmount System tab when inactive |
| be3e8fa / PR #94 | MemoryWidget `analyzeIntentions()` out of `useMemo`; SystemProgressWidget report build deferred via `setTimeout(0)` |
| 9364aba / PR #95 | Memoize heavy per-render work in System subscriber widgets |

Open PR: #93 (calendar time tracking + due-event toast) — touches rendering, not yet reviewed for perf.

Note: commit be3e8fa cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, which is **not in the repo** (never committed, not in any ref). Its findings are only preserved in the commit message.

## Code reviewed
- `src/client/components/ui/Button.tsx`: well isolated. Only `primary` / `secondary-rounded` subscribe to one store each; `secondary` has none. Not a suspect.
- `src/client/index.css:102-160` `.grid-fill-hover`: opacity-only transition (180ms) on a `::before` with `will-change: opacity`. Cheap per button, but gradient backgrounds (`instrument` density: 3 stacked gradients at 4px tiles) are costly to rasterize, and `will-change` promotes a compositor layer for every button on screen. Many buttons on the System page => many layers + large gradient textures. **Moderate suspect**, esp. on mobile/PWA.
- `System.tsx` (1071 lines): ~15+ `useStore` subscriptions in one component, plus 2 `setInterval`s. Any store tick re-renders the whole tree unless children are memoized.
- `SystemProgressWidget.tsx` (2513 lines): 3 `setInterval`s, large synchronous builders (`getEnrichedPhysiologicalReport`, `analyzeIntentions` ~145-pattern scan). `setTimeout(0)` fix only moves the work after paint; it still blocks the main thread so the *next* interaction can stall.
- 12 components run `setInterval`s (About, Chakra, ContextualPrompts, MicroCalculator, MicroGame, QuantumRandom, StatusPage, SystemPulse, TimeWidget, ...). Unknown whether all are paused when off-screen.

## Suspected causes (ranked)
1. **Main-thread blocking from synchronous intention/QIE analysis** growing with each QIE version (P140→P151, 139→151 patterns, 50 archetypes). `setTimeout(0)` defers but doesn't remove the jank. Fix: chunk work (`requestIdleCallback`/scheduler), memoize on input hash, or move to a Web Worker.
2. **Store fan-out re-renders** in `System.tsx` and widgets subscribing to `intentionEngine` atoms — any write cascades.
3. **Per-button `will-change` + gradient pseudo-elements** — GPU layer/memory pressure with many buttons.
4. **Timer accumulation** across 12 components if not cleared/paused off-tab.
5. Recent growth: PR #96 added 93 badges (719→812); badge feed/list rendering (`stats/BadgeUnlockFeed.tsx`) may be unvirtualized.

## Next steps
1. Capture a real Chrome Performance profile (click on SystemProgressWidget "generate report" and on a generic button; CPU 4x throttle). Look for long tasks >50ms and Recalculate Style / Layout cost. Add `PerformanceObserver({type:'longtask'})` + `event` timing (INP) logging in prod.
2. React Profiler on `System.tsx` to count re-renders per store tick; wrap children in `React.memo` and split `System.tsx` subscriptions.
3. Remove `will-change: opacity` from `.grid-fill-hover::before` (apply only on `:hover`) and A/B on a low-end device.
4. Audit the 12 `setInterval` sites for visibility/off-tab pausing (`document.visibilityState`).
5. Move `analyzeIntentions` / report builders to a worker or idle-chunked execution.
6. Check badge list virtualization post-PR #96; review PR #93 for perf before merge.
7. Restore/recreate the missing `BUTTON-LAG-RENDERING-DIAGNOSTIC.md`; ask the reporter which device/page/button still lags (no user reports exist in issues).

## Confidence
Cause not conclusively identified — no profiling data or user reports available. Items above are code-review hypotheses.
