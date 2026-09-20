# Button Lag / Rendering Diagnostic

Scheduled investigation — 2026-09-20. Recreates the diagnostic that PR #94
referenced (`docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`) but never
actually committed, and extends it with a new finding at current HEAD
(`98971f2`).

## Doctrine

The recurring root cause across every round of this bug is the same:
**a nanostores atom write executed synchronously during React's render
phase.** `analyzeIntentions()`, `recomputeAssembly()`, and any function that
calls them, WRITE to a store. Calling one inside `useMemo`, or inline in a
component body, or unmemoized in a hot render path, forces every subscriber
of that store to re-render before the browser can paint — the classic
"click, then a beat, then it happens" lag. LOT-DOCTRINE calls this
**Render Isolation**: derive-and-write work belongs in `useEffect` (after
paint) or an event handler deferred with `setTimeout(fn, 0)`; anything read
during render must be cheap or memoized on the narrowest dependency that
actually changes.

## Fix history (already shipped, verified against `git log`)

| Commit / PR | Date | What it fixed |
|---|---|---|
| `b219cc3` | 2026-07-18 | `System.tsx`: `analyzeIntentions()` + `recomputeAssembly()` ran inside `useMemo` (render phase), cascading 10 re-renders before paint on every logs change. Moved to `useEffect` + seeded `useState`. Also paused `SystemProgressWidget`'s 60s `recomputeAssembly()` interval when `document.hidden`. |
| `9364aba` (PR #95) | 2026-07-28 | `SignalStreamWidget`: copy+sort of up to 1000 signals ran unmemoized every render → memoized on `engine.signals`. `UserMetricsWidget`: `getUserIndex()` + `classifyPhysiologicalCohort()` ran unmemoized every render → moved into `useMemo` keyed on `engineState.signals`, before the early returns. |
| PR #94 | 2026-07-28 | `MemoryWidget`: `analyzeIntentions()` (a store write) ran inside a `useMemo` keyed on `question?.id` → moved to `useEffect` with a `useState` seed. `SystemProgressWidget.handleGenerateReport`: ran `analyzeIntentions()` + report builders synchronously inside the click handler, blocking the button from responding → deferred the whole build one macrotask (`setTimeout(build, 0)`). |

All three rounds are present and intact at current HEAD. Verified by reading
`System.tsx:262-277`, `MemoryWidget.tsx:264-280`, `SystemProgressWidget.tsx:1552-1567,1618-1634`,
`SignalStreamWidget.tsx`, and `UserMetricsWidget.tsx:90-100` directly — none of
the previously-fixed call sites have regressed.

## New finding: `QuantumEngineWidgets.tsx` still has the same anti-pattern

`src/client/components/QuantumEngineWidgets.tsx:373-376` (the "cohort" view of
the QOS Summary Block, mounted in `System.tsx` via `<QuantumEngineWidgets />`):

```tsx
{(() => {
  const live = engineState.signals.length > 0
    ? classifyPhysiologicalCohort(engineState.signals, getUserState(), engineState.recognizedPatterns ?? [])
    : null
  ...
```

This calls `classifyPhysiologicalCohort()` — a ~55-line scan over the signal
array (recency filtering, per-source counts, archetype scoring; see
`intentionEngine.ts:4520-4574`) — **directly in the render body, unmemoized**,
every time this component renders. The component subscribes to the entire
store at line 165 (`const engineState = useStore(intentionEngine)`), so it
re-renders on **every** `recordSignal()` call anywhere in the app — which
includes routine interactions like device-connect toggles in this same widget
(lines 207-253) and signal recording from other widgets while this one stays
mounted.

Notably, this file already has the correct pattern six lines above: a
memoized `cohortDirective` (`QuantumEngineWidgets.tsx:200-205`) computes the
same classifier's `.directive` field on `[engineState.signals.length,
engineState.recognizedPatterns?.length]`. Line 373-376 duplicates that same
expensive call to also read `.archetype` and `.energyBand`, but without the
memo — this looks like a follow-up addition that didn't reuse the existing
memoized value. This is the exact regression class the three prior PRs were
written to close out, just in a widget none of them touched.

**Effect:** any user sitting on the "cohort" view of the QOS Summary Block
(reached via `onLabelClick={cycleView}`) gets a synchronous
`classifyPhysiologicalCohort()` scan injected into the render of every
subsequent button click / signal write anywhere in the app, for as long as
that view stays selected — reproducing the "click, then a beat" lag the
earlier fixes targeted.

**Suggested fix** (not applied by this diagnostic pass — flagging for
review/implementation): extend the existing `cohortDirective` memo to also
carry `archetype` and `energyBand`, and read those instead of recomputing at
line 375. Rough shape:

```tsx
const liveCohort = React.useMemo(() => {
  if (engineState.signals.length === 0) return null
  return classifyPhysiologicalCohort(engineState.signals, getUserState(), engineState.recognizedPatterns ?? [])
}, [engineState.signals.length, engineState.recognizedPatterns?.length])
```

and use `liveCohort` in both the existing `cohortDirective` derivation and at
line 373-399, dropping the duplicate unmemoized call.

## Swept and confirmed clean

Grepped every render-body call site of the known-heavy functions
(`analyzeIntentions`, `recomputeAssembly`, `classifyPhysiologicalCohort`,
`getEnrichedPhysiologicalReport`, `getQuantumOS`, `getOptimalWidget`) across
`src/client/components/`. All other call sites are one of:

- Inside `useEffect` (after paint) — `System.tsx`, `SystemProgressWidget.tsx`, `QuantumEngineWidgets.tsx:264`.
- Inside a deferred event handler (`setTimeout(fn, 0)`) — `SystemProgressWidget.handleGenerateReport`.
- Already memoized on a narrow dependency — `PatternRecognitionWidget.tsx:78`, `SystemPulseWidget.tsx:62-64`, `UserMetricsWidget.tsx:97-98`, `System.tsx:274-277`, `QuantumEngineWidgets.tsx:201-205,290-293`.
- Cheap O(1) atom reads (`getUserState()`, `getUserIndex()` themselves just return `intentionEngine.get().userState` / `.userIndex` — see `intentionEngine.ts:3659-3661,3705-3707`) called directly in render bodies (`CohortConnectWidget.tsx`, `AIFeedbackWidget.tsx`, `QuantumStateWidget.tsx`, `IntegrityWidget.tsx`, `Logs.tsx`) — not a lag source, no action needed.

No open GitHub issues or PRs currently reference button lag or rendering
performance (checked via `search_issues` / `search_pull_requests` against
`LOT-Systems/LOT-Computer`); the only open PR (#93, calendar time-tracking)
is unrelated.

## Next steps

1. Apply the `QuantumEngineWidgets.tsx` fix above (small, same shape as the
   three prior fixes — low risk).
2. Re-run the headless-Chromium repro used in `9364aba` (seed 1000 signals +
   500 logs, cycle the QOS Summary Block to "cohort", fire rapid
   `recordSignal()` calls) to confirm the fix and to check whether any other
   view of the same block (`qos-mode`, `qos-field`) has a similar unmemoized
   read that the sweep above didn't classify as heavy enough to flag.
3. Given three independent rounds of this exact bug across three different
   files, consider a lint rule or a small `useAtomDerivation`-style helper
   that forces heavy-store-read call sites to declare their memo deps, so
   the next new widget doesn't reintroduce it by hand.
