# Button Lag & Rendering Diagnostic — 2026-11-22

Automated routine investigation. Branch `claude/brave-rubin-0yrlod`.

## TL;DR

The likeliest cause of the current lag is a **runtime `ReferenceError` inside `analyzeIntentions()`**, added in QIE v112 (`1846b80`, P147 "quantum-presence-field", Aug 3 2026). The function reads an undefined variable `dayMs`. That breaks the 5-minute analysis cooldown and throws an error on every call:

- **Fixed on this branch:** a one-line change at `src/client/stores/intentionEngine.ts:3332`.
- It came back after the Jul 28 perf passes (#94, #95) because the client build is esbuild-only and no `tsc` typecheck runs in the build gate.

## 1. History reviewed

| Ref | What | Status |
|---|---|---|
| #88 `6e5007a` | stop render-phase atom write + off-tab churn | merged Jul 19 |
| `b46f1ac` | unmount System tab when inactive | merged |
| `bd9ef2a` | Planner buttons frozen: reuse AudioContext | merged |
| #94 `be3e8fa` | MemoryWidget analyze → useEffect; SystemProgressWidget report deferred | merged Jul 28 |
| #95 `9364aba` | memoize SignalStream sort + UserMetrics index | merged Jul 28 |
| `1846b80` | QIE v112 P146–P148, **adds the `dayMs` bug** | on master since Aug 3 |
| #96 | v113 + Badge v31, merged Aug 5 | merged |
| #97, #93 | open, not related to perf | open |

- **GitHub issues:** none are filed, so there are no user reports on record.
- **Profiling data:** the repo holds no profiling data or perf metrics. The diagnostic that #94 cites (`docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`) was never committed.
- **What changed in client code since #95:** `intentionEngine.ts` (+537 lines, P140–P151), `badges.ts` (+1170), `easter-eggs.ts` (+307), `Logs.tsx` (+369), and `System.tsx` (an astrology tick and a daily `recordAstrologySignal`).

## 2. Primary finding: undefined `dayMs` in `analyzeIntentions()` (CONFIRMED)

```ts
// intentionEngine.ts:3332 (before the fix)
const daySignals147 = signals.filter(s => now - s.timestamp < dayMs)
```

`dayMs` is declared only inside *other* functions (`:3543`, `:4620`). Inside `analyzeIntentions()` (`:258–3467`) it is unbound. If the user has at least one stored signal, the filter callback throws `ReferenceError: dayMs is not defined`.

I reproduced this by bundling `intentionEngine.ts` with esbuild and running it in Node with 1000 synthetic signals:

| | Current master | With fix |
|---|---|---|
| `analyzeIntentions()` with a cold cooldown | ~13 ms, then **throws** | ~16 ms (median; server CPU, so expect 4–10× longer on a phone) |
| 3 back-to-back calls | 3 throws; `lastAnalysis` is never set | 0 throws; calls 2 and 3 return instantly from the cooldown |

### Consequences (traced from the code)

1. **The cooldown is permanently broken.** The function throws before `intentionEngine.set({ lastAnalysis: now })` (`:3441`), so every call reruns the whole ~150-pattern scan. In the browser that is roughly 50–130 ms of main-thread work per call. The #94 fixes assumed `analyzeIntentions()` is "a no-op within its 5-min cooldown", and that assumption is now false. These paths are affected:
   - `recordSignal()` → `deferHeavy(analyzeIntentions)` runs on every 5th signal. Once signals hit the 1000 cap (`length % 5 === 0` is always true), it runs on **every signal-producing button press**, plus an uncaught error in an idle callback.
   - `System.tsx:268`: the `useEffect([logs])` runs on mount and after every log refetch.
   - `SystemProgressWidget.tsx:1555` (mount) and `:1629` (report button).
   - `MemoryWidget.tsx:274` runs on every new question.
   - `Logs.tsx:3975` (`/qos`).
2. **Possible whole-app crash.** `System.tsx:268` calls `analyzeIntentions()` inside a `useEffect` with no try/catch. React sends errors thrown in effects to the nearest error boundary, and for `System` that is `AppErrorBoundary` (`entries/app.tsx:35`), which replaces the whole app. I traced this from the code and did not reproduce it in a running app.
3. **Background QOS monitor never starts.** `startBackgroundQOSMonitor()` calls `analyzeIntentions()` before its `setInterval`, so the throw skips the interval and `captureQOSSnapshot()` never runs.
4. **Stale state.** `recognizedPatterns` and `userIndex` never update, and the post-commit checks (`checkIntentionVelocity`, `checkSignalCoherencePeak`, …) never run. Every widget that reads patterns shows data from before Aug 3.

### Fix (this branch)

```ts
const daySignals147 = signals.filter(s => now - s.timestamp < 24 * 60 * 60 * 1000)
```

After the fix, the harness shows no throws and the cooldown works again.

## 3. Secondary suspects (not yet confirmed as user-visible)

| # | Area | Detail | Est. impact |
|---|---|---|---|
| S1 | `recordSignal()` at the cap | Every press copies, filters and **sorts** 1001 signals synchronously, then `intentionEngine.set` re-renders every subscriber. At the cap, `length % SYNC_INTERVAL === 0` is always true, so `syncToServer()` runs on the first signal after each 5-min cooldown instead of every 10th signal. | ~0.6 ms in Node per press, plus subscriber re-renders |
| S2 | Duplicate heavy work on System mount | `System.tsx:268` and `SystemProgressWidget.tsx:1554` both call `analyzeIntentions()` + `recomputeAssembly()` on mount. Harmless once the cooldown works, but `recomputeAssembly` has no cooldown. | One extra heavy task per mount |
| S3 | `analyzeIntentions` cost keeps growing | It is one 3200-line function with about 245 `.filter` passes over the signal array, and every QIE version adds 3 more patterns. It runs on the main thread. | ~16 ms in Node, maybe 60–150 ms on mobile |
| S4 | Journal easter eggs | `runJournalEasterEggs` runs on every debounced keystroke (`Logs.tsx:3831`). Each check re-reads and splits `localStorage` (`getEarnedBadges`) and keeps growing with each Badge Codex version (843 badges). | Not measured |
| S5 | Render-time calls | `getCircadianPhase()` is called directly in render (`System.tsx:695`, `QuantumEngineWidgets.tsx:379`). It is cheap, but it is non-memoized impure render work. | Negligible |

## 4. Next steps

1. **Ship the one-line fix** to master and deploy. It is the highest-value change.
2. **Add a typecheck gate.** `tsc --noEmit` would have caught `Cannot find name 'dayMs'`. The file also has existing type errors that should be cleaned up first (`suggestedTiming: 'active'` at `:2223`/`:2240`, the `'ecosystem'` source at `:4075`, and `unknown[]` at `:4857`/`:5017`/`:5228`).
3. **Make `analyzeIntentions` resilient.** Wrap each pattern block (or the whole scan) in a try/catch so one bad pattern can't break the cooldown. Set `lastAnalysis` before scanning, not after.
4. **Guard `System.tsx:268`** with a try/catch so a store error can't take down the whole app.
5. **Profile in a real browser.** Use a CPU-throttled Chromium harness (4× slowdown) seeded with 1000 signals and measure INP for Memory answer, Planner, SelfCare and the report button. The previous harness from #95 was not committed, so commit it this time under `scripts/perf/`.
6. **Longer term:** move `analyzeIntentions` into a Web Worker, or build a per-source signal index once per call instead of about 245 linear filters.
7. **Fix the S1 cap modulo logic** by counting signals added since the last analysis or sync instead of using `length % N`.
