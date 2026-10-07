# Button Lag & Rendering Investigation — 2026-10-07

Automated routine "Button lag investigation". Static review only: no profiler or
runtime metrics were available in this environment, and no user reports were found.

## Summary

- **Open issues:** none. **Open PRs:** #93 (calendar toast) only, nothing perf-related.
- Button lag has been fixed in 8+ perf commits (2026-07-04 to 2026-07-28). The last fix (PR #95, `9364aba`) is 10 weeks old.
- No new lag reports, and no perf commits since. Commits since 07-28 added QIE patterns (P140-P151, up from ~125 at the time of the earlier fixes), badges, and wiki/docs.
- `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, which `be3e8fa` cites, is **not in the repo**. Its findings survive only in commit messages.

## Prior fixes (root causes already addressed)

| Commit | Cause | Fix |
|---|---|---|
| `bd9ef2a` | `playClickSound` created a new `AudioContext` per click, so the constructor threw and the Planner froze | Shared context plus try/catch |
| `89da563` | Logs mouse-inactivity timer set `pointer-events-none` on `#nav` for all tabs | Guard to logs route plus cleanup |
| `863b333` | Unbounded `/api/logs`, 30-60s stats polling, DB starvation | `LIMIT 500`, 120s polling, no background polling |
| `b219cc3` | `analyzeIntentions()`/`recomputeAssembly()` (atom writes) inside `useMemo` during render | Moved to `useEffect` |
| `ee88f4c` | Hidden-but-mounted tabs ran intervals; `recordSignal` did sync `JSON.stringify` and a pattern scan | `isRouteActive` gating, coalesced persist, `requestIdleCallback` |
| `6e5007a` | Render-phase atom write in `PatternRecognitionWidget`, ungated intervals | Memoized and gated |
| `b46f1ac` | System widgets kept re-rendering in the background | `unmountWhenInactive` for System |
| `be3e8fa` | `MemoryWidget` render-phase write; `SystemProgressWidget` ran a pattern scan inside a click handler | `useEffect`, deferred one macrotask |
| `9364aba` | `SignalStreamWidget` sorted 1000 signals every render; `UserMetricsWidget` unmemoized | `useMemo` |

## Suspected remaining causes (ranked, unverified)

1. **Store fan-out.** `recordSignal` (`src/client/stores/intentionEngine.ts:199`) does `intentionEngine.set(...)` synchronously, with 190 call sites in `src/client`. Every subscriber re-renders on every signal. The expensive parts are deferred, but the `set` itself is not. Widgets that subscribe to the whole atom and not a slice re-render on any signal.
2. **Idle work blocking input.** `deferHeavy` uses `requestIdleCallback` with `timeout: 2000`. After 2s the scan runs regardless of user activity. `analyzeIntentions` is a single synchronous scan over ~151 patterns. It is not chunked, so it can still produce a long task that lands on a click.
3. **Pattern growth.** QIE v111-v113 added P143-P151 plus new `record*` handlers, and `intentionEngine.ts` is now 6.5k lines. The 07-28 timings predate these additions and have not been re-measured.
4. **`recordSignal` hot path.** It copies, filters and, past `MAX_SIGNALS`, sorts the whole signals array synchronously on every call. That costs O(n) per click, with n up to 1000.
5. **System.tsx size.** It is 1071 lines with 43 hooks, and is imported by merge-heavy changes (see `73edd95`). Subscriptions in it should be re-audited after the recent QIE phase-row additions.
6. **CSS (low).** `.grid-fill-hover::before` uses a 180ms opacity transition on a gradient layer. `isolation: isolate` is applied per button, and `PrimaryBtn` in light theme uses `transition-all`. This is minor and unlikely to be the cause.
7. **Logs.tsx (4.5k lines)** has its own mouse-activity handling (`utils/hooks.ts:138`, a document `mousemove` listener). It stays mounted when the tab is not active; the route guard from `89da563` should be re-verified.

## Next steps

1. Get a real signal: record a Chrome Performance trace on the System and Log tabs with a seeded account (1000 signals, 500 logs), and look for long tasks over 50ms near clicks. Reuse the headless-Chromium harness from `9364aba`; it is not committed, so commit it.
2. Ask the owner (S-2) which button, which tab and which device/PWA state lag occurs on. There is no concrete report to anchor to.
3. Restore or recreate the missing `BUTTON-LAG-RENDERING-DIAGNOSTIC.md`.
4. Batch `recordSignal` writes (one `set` per animation frame or per burst), and give widgets selector-based subscriptions (e.g. `computed` or `useStore(..., {keys})`) instead of whole-atom ones.
5. Chunk `analyzeIntentions` (or move it to a Web Worker), and use `scheduler.yield` or `isInputPending` so it yields to input.
6. Add a perf budget to the benchmark gate (a long-task count in the smoke test).

## Verdict

No clear current cause found. The known causes were fixed. What remains is a hypothesis list for step 1 to confirm or kill.
