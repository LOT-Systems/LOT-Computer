<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Button Lag / Rendering Diagnostic — 2026-09-10

**Date**: September 10, 2026
**Scope**: `src/client/components/System.tsx` and the ~39 `*Widget.tsx` components it mounts, all subscribers of the `intentionEngine` nanostore
**Status**: 🟡 Two confirmed live bugs found, unfixed as of `98971f2` (current `master`/HEAD)
**Trigger**: Scheduled investigation into "buttons lagging" + "rendering problems"

---

## 🔍 Summary

This codebase has a well-documented history of "button lag" bugs, all traced to the same
architectural hazard: ~39 widgets under `src/client/components/` stay permanently mounted
on the System tab and subscribe to one shared `intentionEngine` atom. Three prior PRs
(#88 `6e5007a`, #95 `9364aba`, #94 `be3e8fa`) fixed six separate instances of the same two
root causes:

1. **Render-phase store writes** — a widget calls `analyzeIntentions()` (which internally
   calls `intentionEngine.set()`) synchronously inside `useMemo`/render, instead of in a
   `useEffect` after paint. Because every subscriber re-renders on any `intentionEngine`
   write, this cascades a synchronous re-render storm across every other mounted widget
   before the browser can paint — the "click, then a beat, then it happens" symptom.
2. **Unmemoized/ungated heavy work** — sorting/copying large signal arrays, running
   classification functions, or firing `setInterval`s every render/every tick regardless
   of which tab is active.

This pass re-audited all subscriber widgets against those two patterns (plus two related
ones: synchronous heavy work in click handlers, and stale `useMemo` dependency arrays) to
see whether the fixes actually eliminated the class of bug, or just the six known instances.

**They did not eliminate the class.** One of the exact previously-fixed anti-patterns is
still present, unfixed, in the very file (`System.tsx`) that documents the fix for it two
blocks above. A second widget has a plain correctness bug (wrong function arity) that
currently blanks a whole dashboard section behind an error boundary — a rendering problem,
not just lag.

---

## 🚨 Finding 1 (primary suspect) — `System.tsx:377` reproduces the render-phase atom write

```ts
// System.tsx:262-271 — the CORRECT pattern, with its own explanatory comment:
// useEffect (not useMemo) so atom writes happen after paint, not during render.
// Writing to nanostores atoms inside useMemo cascades 10 synchronous re-renders
// before the browser can paint, causing visible UI lag on every logs change.
const [quantumState, setQuantumState] = React.useState(() => getUserState())
React.useEffect(() => {
  analyzeIntentions()
  recomputeAssembly()
  setQuantumState(getUserState())
}, [logs])

// ...115 lines later, the SAME file:
// System.tsx:377
const optimalWidget = React.useMemo(() => getOptimalWidget(), [logs])
```

`getOptimalWidget()` (`src/client/stores/intentionEngine.ts:3666`) opens with
`const patterns = analyzeIntentions()` — the exact store-writing call the comment above
warns about — but it's called from inside `useMemo`, not `useEffect`. `analyzeIntentions()`
only writes when its 5-minute cooldown has lapsed (`intentionEngine.ts:258-263`), so this
doesn't fire on every render, but whenever `logs` changes after the cooldown expires, the
render pass:

1. Runs a full ~139/151-pattern scan synchronously, in the render phase.
2. Writes `intentionEngine.set()` mid-render.
3. Cascades a re-render of every other `intentionEngine` subscriber on the System tab
   (`QuantumStateWidget`, `PatternRecognitionWidget`, `SystemPulseWidget`,
   `QuantumEngineWidgets`, `UserMetricsWidget`, `AIFeedbackWidget`, `SignalStreamWidget`,
   plus `System.tsx` itself) before the browser can paint the current interaction.

This is the most likely explanation for residual "buttons lagging" reports: it is on the
main `System.tsx` render path (not a rarely-hit widget), it fires on `logs` changes (which
happen on almost every user action — new check-in, new answer, new signal), and it is
literally the same bug the file's own doctrine comment describes two screens above.

**Suggested fix** (mirrors the existing `quantumState` pattern immediately above it):
seed `optimalWidget` with a `useState` computed from `getUserState()`/cached patterns, and
move the `getOptimalWidget()` call into the same `useEffect` block that already runs
`analyzeIntentions()` on `[logs]`, so the scan-and-write happens once, after paint.

---

## 🚨 Finding 2 — `UserMetricsWidget.tsx:98` calls `classifyPhysiologicalCohort()` with no arguments

```ts
// intentionEngine.ts:3520-3524 — the function signature (no default params):
export function classifyPhysiologicalCohort(
  signals: IntentionSignal[],
  userState: UserState,
  recognizedPatterns: IntentionPattern[]
): PhysiologicalCohortClassification { ... }

// UserMetricsWidget.tsx:98 — called with zero arguments, above the component's early returns:
const qieCohort = React.useMemo(() => classifyPhysiologicalCohort(), [engineState.signals])
```

`classifyPhysiologicalCohort` immediately does `signals.filter(...)` — with `signals`
`undefined`, this throws `TypeError: Cannot read properties of undefined (reading 'filter')`
on every render of `UserMetricsWidget`. Correct call sites exist right next to this one
(`System.tsx:277`, `SystemPulseWidget.tsx:64-68`) passing all three arguments — this call
site was just never updated to match.

Because the `useMemo` sits *above* the component's `if (!status) return null` early return
(intentionally, per Rules of Hooks — see the comment at line 95-97), it runs on every
render where the component gets past its hooks, i.e. essentially always once `status` has
loaded. `UserMetricsWidget` is wrapped by `<WidgetErrorBoundary name="Dashboard">` in
`System.tsx:1022`, alongside `CorrelatedIndexesWidget` and `SystemProgressWidget`
(`System.tsx:1022-1032+`). `WidgetErrorBoundary` (`ui/WidgetErrorBoundary.tsx:60-68`)
renders `"Dashboard: Failed to load."` with a manual retry button in place of its children
once it catches — and since the throw is deterministic, retry does not help.

**User-visible symptom**: the entire Dashboard block (bioethics/performance/version
metrics, the four-dimensional weekly index, and the deployment/session-log panel) is
replaced by a single "Failed to load." message, on every load, for any user whose
`intentionEngine` has signals recorded. This reads as a "rendering problem" — the
dashboard silently not rendering — rather than lag, and is likely a larger source of user
complaints than lag itself if it has been live since the call site was introduced
(`e9eee35`, 2026-06-30) and survived a later perf-only refactor of the same line
(`9364aba`, 2026-07-28) without the arguments being corrected.

**Suggested fix**: pass the three arguments, matching the working call sites:
`classifyPhysiologicalCohort(engineState.signals, engineState.userState, engineState.recognizedPatterns)`.

---

## 🟢 Minor / low-priority

- **`QuantumEngineWidgets.tsx:373-376`** — inside the `view === 'cohort'` branch, an inline
  IIFE recomputes `classifyPhysiologicalCohort(...)` (correctly, with all 3 args) directly
  in JSX on every render, duplicating the already-memoized `cohortDirective` a few lines
  above (201-205) in the same file. The function itself is cheap (small array filters), so
  this is a redundancy/cleanliness issue, not a perceptible lag source.
- **`SystemProgressWidget.tsx`**: the `SESSION_REPORTS` constant (used for the "Session
  logs" disclosure panel) has grown to 100+ entries / ~2,500 lines in the file via routine
  BENCHMARK commits and is bundled into the client JS unconditionally, though it only
  renders when the user expands `showSessionLogs`. Not a render-time cost today, but worth
  watching — either paginating the panel or moving the log text to a fetched JSON file
  would cap the bundle-size growth if this keeps compounding.

## ✅ Not findings — already correctly fixed, verified as reference patterns

`MemoryWidget.tsx:267-276`, `SystemPulseWidget.tsx:62-107` (interval gated by
`document.hidden` + `isRouteActive('system')`), `PatternRecognitionWidget.tsx:55-78`,
`QuantumStateWidget.tsx`, `SignalStreamWidget.tsx`, `ChakraErgonomicsWidget.tsx`,
`ContextualPromptsWidget.tsx`, `EvolutionMilestoneToast.tsx` — all memoize on stable
primitive fields (`.signals`, `.signals.length`, `logs`) rather than the whole `engine`
object, and all intervals are route-gated. `ui/Button.tsx` itself is clean: each `kind`
subscribes only to the one store it needs, class-name computation is cheap string
concatenation, and there is no store write or heavy work on the click path.

---

## 📋 Next steps

1. Fix `System.tsx:377` — move `getOptimalWidget()` off the render path into the existing
   `[logs]` `useEffect`, matching `quantumState` immediately above it.
2. Fix `UserMetricsWidget.tsx:98` — pass the three required arguments to
   `classifyPhysiologicalCohort`.
3. After both fixes, re-run the same headless-Chromium smoke test used in `be3e8fa`/`9364aba`
   (rapid System-tab switches + a `logs` mutation) to confirm the render-phase write is gone
   and the Dashboard block renders instead of "Failed to load."
4. Given this is the second time the render-phase-write pattern reappeared after being
   "fixed," consider a lint rule or a thin wrapper (e.g. `useAfterPaintEffect`) that makes
   calling `analyzeIntentions()`/`getOptimalWidget()` from `useMemo` a build-time error,
   rather than relying on comments and manual review to catch every call site.
5. No profiling/APM tooling or open GitHub issues were found describing button lag
   directly — this diagnostic is based on static analysis of the store-write and
   memoization patterns, not on captured performance traces. If lag reports continue after
   fixing Finding 1, capturing a real Chrome performance trace during a reported lag
   episode would help confirm whether another, not-yet-identified path is also involved.
