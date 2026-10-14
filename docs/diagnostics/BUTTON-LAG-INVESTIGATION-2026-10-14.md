# Button Lag & Rendering Investigation — 2026-10-14

Scheduled routine: "Button lag investigation". Static review only (no runtime profiling in this run).

## Summary
Button lag has been a recurring problem (6 prior fix passes since June). The latest two fixes (PR #94, #95, Jul 28) removed the last known synchronous-in-click and render-phase-write paths. **No open GitHub issues** mention lag/slow/render/button, and **no commits since Jul 28 touch lag** — the last 10 commits are benchmark/wiki/QIE pattern additions. No evidence of an unresolved regression, but no runtime metrics exist to confirm.

## History (links = repo paths / commits)
| Date | Ref | Fix |
|---|---|---|
| 2026-06-04 | docs/benchmark/LOT-SR-20260604-01.md | Biofield button lag |
| 2026-06-09 | docs/benchmark/LOT-SR-20260609-02.md | Nav lag (Settings tab) |
| 2026-06-22 | docs/benchmark/LOT-SR-20260622-01.md | Memory button lag (recordSignal blocking feedback) |
| 2026-07-19 | docs/benchmark/LOT-SR-20260719-01.md | Widget lag: /api/logs LIMIT 500, useLogs staleTime |
| 2026-07-25 | b46f1ac | Unmount System tab when inactive |
| 2026-07-28 | be3e8fa (PR #94) | MemoryWidget render-phase `analyzeIntentions()` write -> useEffect; SystemProgressWidget report build deferred off click |
| 2026-07-28 | 9364aba (PR #95) | Memoize SignalStreamWidget sort, UserMetricsWidget index/cohort |

Note: be3e8fa cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, which is not in the repo (never committed). This file replaces it as the reference.

## Root-cause pattern (recurring)
Everything fixed so far is one family: **the single `intentionEngine` atom (src/client/stores/intentionEngine.ts, 6.5k lines) is written by `recordSignal`/`analyzeIntentions`, and many widgets subscribe to it**. Any write re-renders all subscribers; heavy per-render work or sync pattern scans (125-145 patterns) in a click path = perceived lag.

## Current state (verified in code)
- `recordSignal` (intentionEngine.ts:199) now defers persist (coalesced 250ms `schedulePersist`) and analysis (`deferHeavy`). Good.
- `analyzeIntentions` has a 5-min cooldown (line ~263); the miss path is a full synchronous scan.
- Remaining sync call sites: `Logs.tsx:3975` (`/qos` trigger, user-initiated, runs analysis in the submit handler); `System.tsx:268`.
- `recordSignal` still does an O(n) copy + filter (+ sort over MAX_SIGNALS) and `intentionEngine.set` on every call, which notifies every subscriber synchronously.

## Suspected remaining causes (ranked)
1. **Broad atom subscription**: subscribers re-render on every signal write, even ones using only `signals` or only `patterns`. Fix: split atom or use selector-based subscriptions.
2. **`/qos` handler in Logs.tsx:3975** runs `analyzeIntentions()` synchronously; wrap in `deferHeavy`.
3. **Huge components**: Logs.tsx (4.5k lines), SystemProgressWidget.tsx (2.5k lines, 3 timers incl. one at ~line 1557) re-render wholesale; large static data arrays likely live in render scope.
4. **Intervals**: System.tsx (2), QuantumRandomWidget (2), SystemProgressWidget (1 active) tick state while mounted; confirm they're cleaned up and don't set state needlessly.
5. **PWA/service-worker cache** serving stale bundles (see docs/diagnostics/PWA-CACHE-FIX-DIAGNOSTIC.md) can make "fixed" lag appear persistent.

## Not found
No profiling data, perf metrics, or user reports in the repo or issue tracker beyond the SR docs above. CSS animations were not audited.

## Next steps
1. Get a reproduction: which button, which page, device (user reports are the missing input).
2. Record a Chrome/React Profiler trace of that interaction; look for tasks > 50ms (Long Tasks) after click.
3. Defer `/qos` analysis (item 2) — small, safe change.
4. Add `performance.mark` around `recordSignal`/`analyzeIntentions` and log durations when > 16ms, to produce real data.
5. Plan atom split / selectors (item 1) if the profile confirms render cascades.
6. Audit CSS `transition`/`animation` on buttons (`transition: all`, box-shadow/filter animations).
