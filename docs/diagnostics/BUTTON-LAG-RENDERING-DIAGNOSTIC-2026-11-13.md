# Button Lag & Rendering Diagnostic — 2026-11-13

Scheduled investigation run. Base: `master` @ `98971f2` (PR #96).
Links: `https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/<path>#L<n>`.

## TL;DR

The July perf fixes (#85, #88, #94, #95) mostly hold. But a bug added on 2026-08-03 makes the
**Quantum Intent Engine's pattern scan throw on every call**. It never finishes, so its
5-minute cooldown never starts. Every caller pays for the full scan every time, and on the
System tab the error ends up in React render and effects.

| # | Severity | Finding | Location |
|---|---|---|---|
| 1 | **CRITICAL** | `dayMs` is not defined inside `analyzeIntentions()` (P147), so it throws a `ReferenceError` whenever there is at least one signal | [`intentionEngine.ts:3332`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/stores/intentionEngine.ts#L3332) |
| 2 | HIGH | Because of #1, the cooldown never starts: `lastAnalysis` stays at 0 and every call reruns the 146-pattern scan (~10 ms in Node with 1,000 signals; expect 3–5× that on mobile) | [`intentionEngine.ts:264`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/stores/intentionEngine.ts#L264) |
| 3 | HIGH | `System.tsx` still writes to an atom during render: `useMemo(() => getOptimalWidget(), [logs])` calls `analyzeIntentions()`. This is the same bug that #88 fixed in PatternRecognitionWidget. With #1 it throws during render | [`System.tsx:377`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/components/System.tsx#L377) |
| 4 | MEDIUM | Badge and easter-egg checks run synchronously in the click handler: 272 word-turn regexes, each calling `hasBadge()` (one `localStorage` read plus a split of the 633–812 badge string). This takes ~4 ms per Memory answer and per journal autosave, and grows with every badge codex | [`MemoryWidget.tsx:132`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/components/MemoryWidget.tsx#L132), [`easter-eggs.ts:1493`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/utils/easter-eggs.ts#L1493), [`Logs.tsx:3831`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/components/Logs.tsx#L3831) |
| 5 | LOW | The System mount effect calls `recomputeAssembly()` and `analyzeIntentions()` synchronously on every System visit. Since #b46f1ac unmounts the tab, that means every tab switch | [`SystemProgressWidget.tsx:1553`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/components/SystemProgressWidget.tsx#L1553), [`System.tsx:267`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/components/System.tsx#L267) |
| 6 | STRUCTURAL | Each QIE version adds about 3 patterns to one ~3,200-line function, which now makes 297 `.filter()` passes over up to 1,000 signals. The cost grows with every engineering run | `intentionEngine.ts:258–3465` |

## Finding 1: ReferenceError in P147 (root cause)

```ts
// intentionEngine.ts:3332 — inside analyzeIntentions()
const daySignals147 = signals.filter(s => now - s.timestamp < dayMs)   // dayMs: not in scope
```

`dayMs` is declared only inside `computeUserIndex()` (L3543) and another helper (L4620). It is
never declared in `analyzeIntentions()`.

- **Introduced in:** `1846b80` "BENCHMARK: SELF-ASSEMBLY — QIE v112 P146–P148" (2026-08-03).
- **Why the build didn't catch it:** `client:js:build` uses esbuild only, which strips types
  and does no type check. `tsc` runs only for the server (`tsconfig.server.json`), so the
  "green" benchmark builds never type-check `src/client`.
- **Reproduced:** I bundled `intentionEngine.ts` with esbuild and ran it in Node with 1,000
  seeded signals. It throws `ReferenceError: dayMs is not defined`, and afterwards
  `lastAnalysis === 0`.

**Fix (one line)**, before L3332:

```ts
const dayMs = 24 * 60 * 60 * 1000
```

### Production impact (from reading the code; not observed in prod)

| Caller | Wrapped in try? | Effect |
|---|---|---|
| `System.tsx:377` `useMemo(getOptimalWidget)` during render | no | Throws during render, so `AppErrorBoundary` shows "Something went wrong · dayMs is not defined" |
| `System.tsx:268` effect | no | Same, from an effect |
| `SystemProgressWidget.tsx:1555` mount effect | no | Same |
| `startBackgroundQOSMonitor` (30-min interval) | no | Uncaught error in the timer; snapshot skipped |
| `recordSignal → deferHeavy(analyzeIntentions)` | no | Uncaught error in the idle callback, at most one per 5th signal |
| `MemoryWidget.tsx:274`, `Logs.tsx:3975` | **yes** | Silent. Full scan wasted on every call, which shows up as lag |

So users with signals would see one of two things: the System tab failing with an error
screen, or System-tab interactions doing a full scan on every click because the cooldown is
dead. Both match "button lag / rendering problems". **I could not verify which revision is
deployed.** Check prod console logs or Sentry for `dayMs is not defined`.

## Finding 3: render-phase atom write still present in System.tsx

```ts
// System.tsx:377
const optimalWidget = React.useMemo(() => getOptimalWidget(), [logs])
// getOptimalWidget() → analyzeIntentions() → intentionEngine.set(...)
```

This breaks the doctrine set in `b219cc3` and `6e5007a`: no store writes during render. Fixing
#1 brings the cooldown back, which hides this most of the time. On a cooldown miss, though, it
still runs the full scan during render and cascades re-renders to the 7 `intentionEngine`
subscribers. Recommended fix: derive `optimalWidget` from the effect at L267 (`setState`
after `analyzeIntentions()`), or add a pure `pickOptimalWidget(patterns)` that reads
`intentionEngine.get().recognizedPatterns` without analysing.

## Measurements

These come from a Node 22 harness: an esbuild bundle of the real modules, in-memory
`localStorage`, 1,000 signals over 6 days, and about half the badges earned. They are
relative numbers; a mid-range phone is likely 3–5× slower.

| Path | Time per call |
|---|---|
| `analyzeIntentions()` miss (runs until the throw) | 10–14 ms |
| `analyzeIntentions()` 2nd call (should hit the cooldown) | **10 ms (cooldown dead)** |
| `recordSignal()` synchronous part | 0.6 ms |
| `detectWordTurns()` (no award) | 3.5 ms |
| `runMemoryAnswerEasterEggs()` | 4.3 ms (synchronous in the click) |
| `runJournalEasterEggs()` (430 chars) | 4.4 ms |
| `getEnrichedPhysiologicalReport` / `getQuantumOS` / `getLogDependencySummary` | < 0.5 ms each |

## What is fine (checked)

- Previous fixes are intact: `deferHeavy` and coalesced persist in `recordSignal` (#85),
  PatternRecognitionWidget memo (#88), MemoryWidget effect plus the deferred
  `handleGenerateReport` (#94), and the SignalStream and UserMetrics memos (#95). System still
  unmounts when inactive.
- Commits since 2026-07-28 that touch `SystemProgressWidget.tsx` and `About.tsx` add only
  static data (SESSION_REPORTS, transmissions). They add no runtime cost.
- Planner AudioContext reuse (`bd9ef2a`) is still in place.
- There are no open GitHub issues about lag. The related closed PRs are #85, #88, #94 and #95.

## Recommended next steps (priority order)

1. **Hotfix #1:** add `const dayMs = 24 * 60 * 60 * 1000` to `analyzeIntentions()`. Bump the
   `sw.js` `CACHE_VERSION` so clients pick it up.
2. **Add a client type-check gate:** run `tsc --noEmit -p tsconfig.json`, or at least for
   `src/client`, in the Benchmark pipeline and CI. This class of bug (undeclared identifier)
   is invisible to esbuild.
3. **Move `getOptimalWidget()` out of render** in `System.tsx:377` (Finding 3).
4. **Wrap the `analyzeIntentions()` body per pattern block, or as a whole, in try/finally**,
   so one bad pattern can't stop the cooldown or the state commit.
5. **Make badge checks cheap:** read `earned_badges` once into a `Set` per check run, or cache
   it in memory and invalidate in `saveEarnedBadges`. Move `runMemoryAnswerEasterEggs` into
   the existing `setTimeout(0)` block in `onAnswer`.
6. **Needs a deeper look:** split `analyzeIntentions()` into one 24h/7d pass that pre-buckets
   by source, so patterns read from buckets instead of each filtering 1,000 signals. Then
   profile on a real device (Chrome DevTools Performance with 4× CPU throttle, System tab,
   Memory answer, mood check-in) to confirm there are no remaining long tasks over 50 ms.

## Not done in this run

- I could not see production telemetry or Sentry, so I could not confirm whether prod shows
  the error screen or only lag.
- There was no real-browser or device profiling. The numbers above come from the Node
  harness only.
- I made no code changes. This run was investigation only, and the fixes above are left for
  an owner to approve.
