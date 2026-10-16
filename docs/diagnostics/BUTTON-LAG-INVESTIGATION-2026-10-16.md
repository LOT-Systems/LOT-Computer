# Button Lag / Rendering Investigation — 2026-10-16

Scheduled routine "Button lag investigation". Static review only (no profiler, no browser run, no user reports available).

## Summary
No open issues; the only open PR (#93, calendar toast) is unrelated to lag. Lag has been addressed in six perf passes between 07-04 and 07-28. No new lag reports exist in the repo or tracker after that. Since the last pass (07-28, `9364aba`), ~500 lines of new patterns (P143–P151) were added to `analyzeIntentions()` in `src/client/stores/intentionEngine.ts`, and nobody has re-profiled it.

## History (root cause → fix)
| Date | Commit | Cause | Fix |
|---|---|---|---|
| 07-04 | `bd9ef2a` | New `AudioContext` per click throws at browser cap, freezes Planner buttons | Shared context + try/catch |
| 07-04 | `89da563` | Logs mouse-inactivity timer set `pointer-events-none` on nav for all tabs | Guard to logs route |
| 07-18 | `863b333` | Unbounded `/api/logs`, aggressive stats polling | LIMIT 500, 120s polling |
| 07-18 | `b219cc3` | Atom writes inside `useMemo` (render phase) in System.tsx | Moved to `useEffect` |
| 07-19 | `ee88f4c`, `6e5007a` | Permanently mounted System widgets + intervals + render-phase write in PatternRecognitionWidget | `isRouteActive` gating, memoization, deferred persist/analysis |
| 07-25 | `b46f1ac` | System subscriber widgets re-rendering from background signals | System unmounts when inactive |
| 07-28 | `be3e8fa`, `9364aba` | Render-phase write in MemoryWidget; sync `analyzeIntentions()` in click handler; unmemoized sort of 1000 signals | Effects, deferral, memoization |

Note: `be3e8fa` cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, which is not in the repo. Its findings are only recoverable from the commit message.

## Remaining suspects (unverified)
1. **`analyzeIntentions()` cost growth** (`intentionEngine.ts:258`). Pure CPU scan over up to 1000 signals; 507 lines added since 07-28. Still runs synchronously from:
   - `System.tsx:266-270` (`useEffect` on `[logs]`, after paint but blocks the main thread; the 5-min cooldown only helps after the first run)
   - `Logs.tsx:3975` (`/qos` trigger)
   - `intentionEngine.ts:5126,5130` (`startBackgroundQOSMonitor`, startup + every 30 min)
   - `SystemProgressWidget.tsx:1555` (mount)
   Only `recordSignal` defers it (`deferHeavy`).
2. **Single `intentionEngine` atom fan-out.** Every `set` re-renders all subscribers. Fixed for off-tab, but while System is open every signal (any button press that records one) still re-renders ~7–9 widgets.
3. **Stale service worker.** `public/sw.js` `CACHE_VERSION` is still `v2026-07-25-001`; 2,500+ lines of client code changed since. PWA users may still run a pre-fix bundle and report lag that is already fixed. Bump it on the next client release.
4. **Intervals:** 26 `setInterval` sites in `src/client`; only some are gated by `isRouteActive`. Audit the rest.
5. `SystemProgressWidget.tsx` grew +127 lines; `recomputeAssembly()` runs on mount and every 60s while active.
6. CSS transitions/animations were not examined.

## Next steps
1. Profile in Chrome DevTools (Performance, 6x CPU throttle) on System tab with ~1000 signals: time `analyzeIntentions()` and measure INP on widget buttons. Add `performance.measure` around it.
2. Run `analyzeIntentions()` via `deferHeavy` (or chunk it) in all callers; optionally split into a pure function plus a single atom write.
3. Split the atom or use `useStore(atom, { keys })` / selectors so widgets only re-render for their slice.
4. Bump `CACHE_VERSION` in `public/sw.js`.
5. Restore the missing diagnostic doc, and ask the user for the device/tab/button where lag is currently seen — no current report exists.
6. Audit remaining `setInterval`s and CSS animations.
