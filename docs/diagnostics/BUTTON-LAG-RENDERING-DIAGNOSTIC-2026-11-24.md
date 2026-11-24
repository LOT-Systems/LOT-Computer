# Button Lag & Rendering Diagnostic: 2026-11-24

A scheduled routine produced this report. It checks `master` @ `9f2b88c`.

## TL;DR

**Root cause found and fixed on this branch.** Since **2026-08-03** (`1846b80`, QIE v112, P147), `analyzeIntentions()` in
`src/client/stores/intentionEngine.ts` throws `ReferenceError: dayMs is not defined` **every time it runs**:

```ts
// line 3332 (master): dayMs is only declared in *later* functions (L3543, L4620)
const daySignals147 = signals.filter(s => now - s.timestamp < dayMs)
```

The throw happens before the `intentionEngine.set({... lastAnalysis: now })` commit at L3448. That causes three problems:

1. **The 5-min cooldown never engages.** Every call re-runs the full ~3,100-line, ~300-`.filter()` pattern scan, then throws.
   Callers include the System render, System effects, `PatternRecognitionWidget`, `recordSignal` (every 5th signal),
   the 30-min QOS monitor, the SystemProgress report button and the `/qos` log trigger.
2. **`recognizedPatterns` is permanently `[]`.** Pattern-driven widgets, cohort classification and "optimal widget"
   suggestions have been running on empty or stale data for about 3.5 months.
3. **Render-phase throw.** `System.tsx:377` calls `getOptimalWidget()` → `analyzeIntentions()` inside a `useMemo`.
   The exception can reach the app-level `ErrorBoundary` (`entries/app.tsx:44`). Other callers swallow it in `try {}` blocks.

### Measured (headless Node, 1,000 synthetic signals, the same harness on both builds)

| Build | Call 1 | Calls 2–6 | Error | Patterns committed |
|---|---|---|---|---|
| master (`9f2b88c`) | 22.8 ms | 8–11 ms **each** | `dayMs is not defined` | 0 |
| fixed (this branch) | 22.6 ms | **0.0 ms** (cooldown) | none | 37 |

Expect these costs to be 3–6× higher on a mid-range phone, roughly 30–100 ms of main-thread work per call. Several calls
happen per log change or tab mount. This matches the "buttons lag" symptom.

**Fix (1 line):** use the in-scope `dayAgo` window, as in
`daySignals147 = signals.filter(s => s.timestamp > dayAgo)`. After the change, `tsc` reports no unresolved names
in the file.

**Why it shipped:** the client bundle is built with esbuild only. `client:build` has no `tsc --noEmit` step, so
`TS2304 Cannot find name 'dayMs'` was never surfaced. `server:build` does run `tsc`, but only on the server project.

## 1. History reviewed

| Ref | Date | Change |
|---|---|---|
| `863b333` | 07-18 | cap logs query + back off stats polling |
| `b219cc3` | 07-18 | move quantum state writes out of `useMemo` |
| `ee88f4c` / [#85](https://github.com/LOT-Systems/LOT-Computer/pull/85) | 07-19 | pause System background work off-tab |
| `6e5007a` / [#88](https://github.com/LOT-Systems/LOT-Computer/pull/88) | 07-19 | stop render-phase atom write |
| `b46f1ac` | 07-25 | unmount System tab when inactive |
| `be3e8fa` / [#94](https://github.com/LOT-Systems/LOT-Computer/pull/94) | 07-28 | MemoryWidget render-phase write; SystemProgress click deferral |
| `9364aba` / [#95](https://github.com/LOT-Systems/LOT-Computer/pull/95) | 07-28 | memoize SignalStream / UserMetrics |
| **`1846b80`** | **08-03** | **QIE v112 P146–P148: introduced the `dayMs` ReferenceError** |
| `d7f076e`, `91e3648`, `9f2b88c` | 08-04 → 11-17 | P149–P151, badges 750→843 (adds per-click cost, see §3) |

- **Issues:** the repository has 0 GitHub issues. There are no user reports or profiling data in the tracker.
- **Open PRs:** [#97](https://github.com/LOT-Systems/LOT-Computer/pull/97) (wiki/badges) and
  [#93](https://github.com/LOT-Systems/LOT-Computer/pull/93) (calendar). Neither touches this path.
- `be3e8fa` cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, but that file was never committed.

## 2. Primary cause: broken QIE analysis (fixed)

See TL;DR. Code: `src/client/stores/intentionEngine.ts` (`analyzeIntentions` spans L258–L3541, the bug is at L3332, the commit is at L3448).

## 3. Secondary contributors (not yet fixed)

| # | Location | Problem | Severity |
|---|---|---|---|
| A | `src/client/components/System.tsx:377` | `useMemo(() => getOptimalWidget(), [logs])` calls `analyzeIntentions()` **during render**, which is a store write. The earlier perf passes removed this pattern elsewhere but missed this call (it dates to `5e8b9af`, 06-30). With the cooldown now working it is usually a no-op, but the first render after each 5-min window still writes the atom mid-render. Move it into the existing `useEffect` at L266 and keep the result in state. | High |
| B | `src/client/components/MemoryWidget.tsx:130` → `utils/easter-eggs.ts:1493` `detectWordTurns` | Runs **synchronously in the answer-button click handler**. It loops 272 word-turn regexes, and each `hasBadge()` does `localStorage.getItem('earned_badges').split(',')` (843 badges). That costs about 7 ms on desktop Node without IO and grows with every badge codex. Fix: read earned badges into a `Set` once per call, and defer the call into the existing `setTimeout(0)` block. | Medium |
| C | `src/client/components/Logs.tsx:222` | `pastLogIds.map(...)` with an approximately **150-branch `if/else` event renderer** runs inline in a component that has **20 `useState`s**. Any state change (prayer/asm loading, input) re-renders up to 500 rows (`/api/logs` `limit: 500`, `server/routes/api.ts:1225`). Extract a `React.memo` `LogRow` keyed on `log` and `dateFormat`, or a lookup table by `log.event`. | Medium |
| D | `src/client/index.css:120` | `.grid-fill-hover::before { will-change: opacity }` promotes a compositor layer for **every** button at rest. On the System tab (dozens of buttons) this increases GPU memory use and can cause mobile jank. Apply `will-change` only on `:hover` or drop it. | Low |
| E | `src/client/components/ui/Button.tsx:77`, `ToggleSection.tsx:65`, `IntegrityWidget.tsx:281`, `SystemProgressWidget.tsx:1987` | `transition-all` animates every property, including layout properties. Narrow it to `transition-[background-color,opacity]`. | Low |
| F | `intentionEngine.ts:2223,2240` | `suggestedTiming: 'active'` is not a valid timing. `getOptimalWidget`'s `timingWeight['active']` is `undefined`, so the sort gets `NaN` and orders suggestions unpredictably. This is a correctness issue, not a perf one. | Low |

## 4. Next steps

1. **Merge the one-line fix** (branch `claude/brave-rubin-dedp96`) and deploy. Then confirm in production DevTools
   that no `dayMs is not defined` errors remain and that pattern widgets populate again.
2. **Add `tsc --noEmit -p tsconfig.json` to `client:build`** (or as a CI step). This would have caught this bug on
   08-03. The client currently has other type errors (`intentionEngine.ts` L2223, 2240, 4079, 4861, 5021, 5232) that
   need cleanup first, or start with `--noEmit` limited to `TS2304` (unresolved names).
3. Fix A (move `getOptimalWidget` out of render), then B (`Set`-based `hasBadge` plus deferral).
4. Profile the Logs tab with a 500-log account (React Profiler plus a Performance trace on a throttled 4× CPU). Then
   decide on the `LogRow` memo or virtualization from C.
5. Instrument interactions: add a `PerformanceObserver` for `event` entries (INP) and long tasks, sampled to the
   existing log/QIE sync. That gives real-user lag data, which does not exist today (0 issues, no metrics).
6. Process: each self-assembly session appends about 3 patterns and 30 badges. Add a smoke test that calls
   `analyzeIntentions()` with a seeded signal set. The harness used for this report is described below.

## Appendix: reproduction harness

The engine was bundled in isolation (`esbuild --bundle --platform=node`, `nanostores` aliased) with stubbed
`window` / `localStorage` / `fetch`. It was seeded with 1,000 signals across 10 sources at 20-minute spacing, and
`analyzeIntentions()` was called 6 times. Before the fix every call throws and none is cached. After the fix only
the first call does work.
