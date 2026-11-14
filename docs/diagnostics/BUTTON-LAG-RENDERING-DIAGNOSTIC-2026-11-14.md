# Button Lag & Rendering Diagnostic — 2026-11-14

Scheduled investigation run. Base: `master` @ `98971f2` (PR #96, 2026-08-05). No commits have landed on `master` since then.
Links: `https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/<path>#L<n>`.

## TL;DR

**Nothing has changed since yesterday's diagnostic, and that is the finding.** This routine has
now reported the same root cause on 6 consecutive days (11-09 → 11-14). The fix has existed on at
least **3 unmerged branches since 2026-09-30**, but `master` still has the bug. Until one of those
fixes (or the one-line hotfix below) is merged and deployed, users will keep seeing lag on System-tab
buttons, or an error screen.

| # | Severity | Finding | Location | Status vs 11-13 |
|---|---|---|---|---|
| 1 | **CRITICAL** | `analyzeIntentions()` reads `dayMs`, which is never declared in that function (P147). It throws a `ReferenceError` whenever there is at least one signal | [`intentionEngine.ts:3332`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/stores/intentionEngine.ts#L3332) | **Still on master** |
| 2 | HIGH | The throw happens before `lastAnalysis` is set, so the 5-minute cooldown never starts. Every call reruns the full ~146-pattern scan | [`intentionEngine.ts:258`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/stores/intentionEngine.ts#L258) | Still on master |
| 3 | HIGH | Atom write during render: `useMemo(() => getOptimalWidget(), [logs])` calls `analyzeIntentions()`. With #1 it throws during render, so `AppErrorBoundary` takes over | [`System.tsx:377`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/components/System.tsx#L377) | Still on master |
| 4 | MEDIUM | `runMemoryAnswerEasterEggs()` (272 regexes, each calling `hasBadge()`, which reads `localStorage`) runs synchronously in the Memory answer click, before the `setTimeout` defer | [`MemoryWidget.tsx:132`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/components/MemoryWidget.tsx#L132) | Still on master |
| 5 | LOW | The System mount effect runs `analyzeIntentions()` and `recomputeAssembly()` synchronously. System unmounts when inactive (`b46f1ac`), so this cost is paid on every tab switch | [`System.tsx:267`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/components/System.tsx#L267) | Still on master |
| 6 | PROCESS | The client is never type-checked. `client:js:build` is esbuild only, and `tsc` runs only on `tsconfig.server.json`. This is why #1 shipped "green" | [`package.json:32`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/package.json#L32) | Still open |

## Fixes already written but not merged

| Branch | Date | What it contains |
|---|---|---|
| `origin/claude/charming-albattani-3necy8` (`e5c5895`) | 2026-09-30 | P147 `dayMs` fix, QIE sync dup/drop fix, lazy-loading of heavy widgets |
| `origin/claude/charming-albattani-39adwr` (`4f815f8`) | 2026-10-25 | P147 `dayMs` fix, UserMetrics cohort crash fix, `joinedAt` in `/api/me` |
| `origin/claude/charming-albattani-fppzpd` (`bcc5a43`) | 2026-11-02 | P147 `dayMs` fix, UserMetrics crash fix, MonthlyPulse fix, lazy-loaded SystemProgress (−27% `app.js`) |
| `origin/claude/charming-albattani-k9nmh0` (`0d60389`) | 2026-11-14 | Lazy-mounts the System tail widgets and fixes MonthlyPulse (`joinedAt`). Does **not** contain the `dayMs` fix |

None of these has an open PR. The only open PRs are #97 (wiki/badges) and #93 (calendar), and
neither touches this bug. There are no GitHub issues about lag; the issue tracker is empty.

The branches overlap and will conflict with each other. **The smallest safe action is the
one-line hotfix below, applied directly to `master`.** The larger branches can then be rebased
and reviewed on their own merits.

## Recommended hotfix (owner approval needed)

```ts
// src/client/stores/intentionEngine.ts, inside analyzeIntentions(), before L3332
const dayMs = 24 * 60 * 60 * 1000
```

Then bump `CACHE_VERSION` in `public/sw.js` (currently `'v2026-07-25-001'`) so installed PWAs
pick up the new build.

## Why this explains "button lag"

The bug produces three different symptoms, depending on which caller hits the throw first:

- **System tab error screen.** The throw happens during render in `System.tsx:377`.
- **Slow buttons where the caller wraps the call in try/catch.** `MemoryWidget` and `Logs.tsx`
  swallow the error, but every click still pays the full scan because the cooldown is dead.
- **Uncaught errors from idle callbacks and timers.** `recordSignal` calls `deferHeavy` and the
  QOS monitor runs every 30 minutes. Their errors end up in the console, and the work is wasted.

The 11-13 Node harness measured the scan at 10–14 ms per call with 1,000 signals. Expect 3–5× that
on a mid-range phone. That cost is paid on every call, plus about 4 ms of synchronous badge and
easter-egg regex work per Memory answer.

## What I checked in this run

- `git log master`: no new commits since `98971f2` (2026-08-05). PRs #85, #88, #94 and #95 are
  merged and their fixes are intact.
- `intentionEngine.ts:3332` still references `dayMs`, and no declaration is in scope inside
  `analyzeIntentions()` (L258 onward). The only `*TodayMs` locals belong to other patterns.
- `System.tsx:377` still calls `getOptimalWidget()` inside `useMemo`.
- `MemoryWidget.tsx:132` still runs `runMemoryAnswerEasterEggs()` synchronously.
- I searched every remote branch with `git log --all -S` to find the fix commits.

## Limits of this run

- `node_modules` is not installed in this container, so I did no runtime repro or profiling. This
  run's evidence comes from reading the code. The runtime repro is in the 11-13 report on
  `origin/claude/brave-rubin-qd8lfh`.
- I could not see production telemetry or Sentry, and I could not verify which revision is
  deployed. Check the prod console for `dayMs is not defined`.
- I made no code changes, in keeping with the routine's investigate-only scope.

## Next steps (priority order)

1. **Merge the hotfix above to `master` and deploy.** It is one line plus the `sw.js` bump.
2. **Add a client type-check gate** (`tsc --noEmit -p tsconfig.json`) to the Benchmark pipeline
   and CI. Any undeclared identifier fails `tsc`, so it would have caught this bug.
3. Move `getOptimalWidget()` out of render (`System.tsx:377`). Derive it inside the existing
   effect at L267.
4. Wrap the body of `analyzeIntentions()` in `try/finally` so that `lastAnalysis` and the state
   commit always happen.
5. Defer `runMemoryAnswerEasterEggs()` into the existing `setTimeout` in `onAnswer`, and cache
   earned badges in a `Set` in memory.
6. **Deeper look:** pre-bucket signals once per run (24h/7d by source) instead of making
   about 297 `.filter()` passes. Then profile on a device with 4× CPU throttle.
7. **Routine hygiene:** this daily report keeps landing on a new throwaway branch with no PR, so
   its findings never reach `master`. Consider pointing the routine at one stable branch with a
   standing PR, or pausing it until #1 is merged.
