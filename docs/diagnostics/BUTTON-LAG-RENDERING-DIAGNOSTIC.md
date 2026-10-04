# Button Lag & Rendering — Investigation Summary

Date: 2026-10-04 · Branch: `claude/brave-rubin-gbsrwq` · Method: static review of git history, PRs/issues, and current code (no live profiling in this run).

## 1. Status

Eight perf/lag commits landed between 2026-07-04 and 2026-07-28. No open issue or PR reports button lag (issue search: 0 results; only open PR is #93 calendar feature). No profiler traces or user reports are checked into the repo. The most recent fix (be3e8fa, 07-28) cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, but that file was never committed — this document fills that slot. No lag-related commits since 07-28, so the issue is likely resolved or unreported.

## 2. Timeline of fixes (root causes already addressed)

| Date | Commit | Cause → Fix |
|---|---|---|
| 07-04 | bd9ef2a | `new AudioContext()` per click; hit browser cap, threw, froze Planner buttons → shared context + try/catch (`stores/plannerWidget.ts`) |
| 07-04 | 89da563 | Logs mouse-inactivity timer set `pointer-events-none` on `#nav` for all tabs → scoped to logs route (`Logs.tsx`) |
| 07-18 | 863b333 | Unbounded `/api/logs`, 30–60s polling → `LIMIT 500`, 120s polls, no background polling (`queries.ts`, `api.ts`) |
| 07-18 | b219cc3 | `analyzeIntentions()`/`recomputeAssembly()` (atom writes) inside `useMemo` → moved to `useEffect` (`System.tsx`) |
| 07-19 | ee88f4c | Hidden-but-mounted System kept running timers → `isRouteActive()` gating; deferred persist/analysis in `recordSignal` |
| 07-19 | 6e5007a | Render-phase atom write in PatternRecognitionWidget; ungated intervals → memoized/gated |
| 07-25 | b46f1ac | System's 7 store-subscriber widgets re-rendered on every signal from any tab → `unmountWhenInactive` TabPanel |
| 07-28 | be3e8fa | MemoryWidget render-phase atom write; SystemProgressWidget click handler ran `analyzeIntentions()` synchronously → effect / deferred macrotask |
| 07-28 | 9364aba | SignalStream sorted 1000 signals per render; UserMetrics recomputed per render → `useMemo` |

Common pattern: **nanostore writes (`intentionEngine`) fan out to many subscribers, plus heavy synchronous work in render or click handlers.**

## 3. Remaining suspected causes (current code, unverified by profiling)

1. **Fan-out on every `recordSignal`.** It always creates a new `signals` array and calls `intentionEngine.set` (`src/client/stores/intentionEngine.ts:199`), re-rendering all 7 `useStore(intentionEngine)` subscribers while System is visible (QuantumState, PatternRecognition, SystemPulse, QuantumEngineWidgets, UserMetrics, AIFeedback, SignalStream). Any button that records a signal pays this cost. Mitigation: per-field selectors (`useStore(atom, {keys})` / `computed`) or throttled batch updates.
2. **`analyzeIntentions()` is still synchronous and large.** It's in a 6,503-line store (125+ patterns); deferred via `deferHeavy` from `recordSignal`, but still runs on the main thread in one chunk when it fires (every 5th signal after cooldown), and synchronously from `Logs.tsx:3975` (`/qos` trigger) and `System.tsx:268`. A long task can still land during a button press. Consider chunking across idle slices or a Web Worker.
3. **`recordSignal` correctness/cost quirk.** When signals exceed `MAX_SIGNALS`, it sorts descending and slices, which reverses the array order; subsequent appends then mix orderings. Also copies/filters up to 1000 items per call. Harmless for lag mostly, but worth normalizing (append + `slice(-MAX)`).
4. **Persistent mount of heavy tabs.** Logs (4,506 lines) and other tabs stay mounted with `display:none`; only System unmounts. Their own store subscriptions/effects still run in the background. Audit Logs/Planner/others for ungated intervals (`grep setInterval` shows 179 sites in `src/client/components`; the 3 System ones were gated, the rest were not audited).
5. **Giant component files.** `SystemProgressWidget.tsx` (2,513 lines), `System.tsx` (1,071), `About.tsx` (4,889) with static content arrays recreated per render and large inline lists; first-mount of System was measured at ~118 ms (9364aba). Hoist constants, lazy-load `About`/System via `React.lazy`.
6. **Service-worker/PWA staleness.** b46f1ac needed a `CACHE_VERSION` bump to deliver fixes; clients on stale bundles would still show old lag. Verify `public/sw.js` version bumps ship with perf fixes (see `docs/diagnostics/PWA-CACHE-FIX-DIAGNOSTIC.md`).
7. **CSS.** No `backdrop-filter`/`backdrop-blur` usage in `src/client`; 5 `transition-all`/`animate-*` occurrences — low suspicion.

## 4. Next steps

1. Get real data: reproduce on the affected device/tab with Chrome Performance panel + React Profiler; record which button, which tab, and long-task attribution. Add a `PerformanceObserver({type:'longtask'})` + INP logging (web-vitals) to production and report to an endpoint.
2. Ask the reporter (S-2) which buttons/tabs still lag and on which browser/PWA version; confirm the client is on the post-07-28 build.
3. Implement fan-out reduction (item 1) and chunked `analyzeIntentions` (item 2) — highest expected payoff.
4. Audit remaining `setInterval`/store subscriptions in always-mounted tabs (item 4); gate with `isRouteActive`.
5. Add a headless-Chromium regression harness (as used in 9364aba) to CI: seed 1000 signals + 500 logs, assert no long task > 50 ms on tab switch and button click.

## 5. Links

- Fix commits: [bd9ef2a](../../commit/bd9ef2a), [89da563](../../commit/89da563), [863b333](../../commit/863b333), [b219cc3](../../commit/b219cc3), [ee88f4c](../../commit/ee88f4c), [6e5007a](../../commit/6e5007a), [b46f1ac](../../commit/b46f1ac), [be3e8fa](../../commit/be3e8fa), [9364aba](../../commit/9364aba)
- PRs: #85, #88, #90, #94, #95 (merged); #93 (open, unrelated)
- Related docs: `docs/assembly/2026-05-29_LOT-session_tab-switching-fix.md`, `docs/diagnostics/PWA-CACHE-FIX-DIAGNOSTIC.md`
