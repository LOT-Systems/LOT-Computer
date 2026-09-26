<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Button Lag / Rendering Diagnostic

## Summary

"Button lag" and tab-switch stutter in this app have a single recurring root
cause, fixed piecemeal across ~8 commits since late July: **a render-phase
write to the shared `intentionEngine` nanostore atom.**

`intentionEngine` (`src/client/stores/intentionEngine.ts`) is subscribed to by
most widgets on the System tab (SignalStreamWidget, UserMetricsWidget,
PatternRecognitionWidget, QuantumEngineWidgets, System.tsx itself, and more).
Any `.set()` on it — via `recordSignal()`, `recordQOSSignal()`,
`analyzeIntentions()`, etc. — triggers a re-render of every one of those
subscribers. When that write happens **during React's render phase**
(component body, or inside `useMemo`) instead of after paint (`useEffect`,
event handler), it cascades a synchronous re-render storm across the whole
System tab before the browser can paint the frame the user's click or tab
switch was waiting on. The visible symptom: "click a button, wait a beat,
then it responds," or a stall on switching to/from the System tab.

A second, related pattern: **heavy synchronous work directly in a click
handler** (e.g. a full pattern re-scan on a cache miss) blocks the click's
own paint until it finishes, even with no store cascade involved.

## Fix history (chronological)

| Commit | Fix |
|---|---|
| `863b333` | Reduce widget lag — cap logs query, back off stats polling |
| `b219cc3` | Move quantum-state writes out of `useMemo` (render-phase atom write) |
| `ee88f4c` | Pause System background work when tab inactive (tab-switch freeze) |
| `6e5007a` | Stop render-phase atom write + off-tab churn (tab-switch stall) |
| `b46f1ac` | Unmount System tab when inactive to end background churn |
| `be3e8fa` | `MemoryWidget`: move `analyzeIntentions()` out of `useMemo` into `useEffect`. `SystemProgressWidget.handleGenerateReport`: defer the heavy report build one macrotask (`setTimeout(fn, 0)`) so the click paints first |
| `9364aba` | `SignalStreamWidget` / `UserMetricsWidget`: memoize heavy per-render derivations (sort of up to 1000 signals; cohort classification) on `engine.signals` so unrelated store writes don't re-trigger them |

Every one of these fixes follows the same shape: **seed state for an
identical first paint, do the store write / heavy compute in an effect or
deferred callback, never in the render body or a bare `useMemo`.**

## New finding — `MicroImageWidget` (unfixed until this pass)

`src/client/components/MicroImageWidget.tsx` (mounted unconditionally inside
`System.tsx:974`) had the exact same doctrine violation as `MemoryWidget`
before `be3e8fa`, just missed by that pass:

```tsx
// Record a signal once when the widget mounts with meaningful context
if (!hasRecordedRef.current && punctuation.sampleSize > 0) {
  recordSignal('intentions', 'microimage_rendered', { ... })   // store WRITE
  hasRecordedRef.current = true
}
```

This runs directly in the component body — a ref guard makes it fire only
once, but the write itself still happens **during render**, on this widget's
first paint inside the System tab. Per the pattern established above, this
cascades a re-render of every `intentionEngine` subscriber mounted on the
System tab at that moment (SignalStreamWidget, UserMetricsWidget,
PatternRecognitionWidget, QuantumEngineWidgets, etc.), stalling the frame the
System tab's own mount/switch was waiting on — the same "tab-switch stall"
class of bug `6e5007a` and `b46f1ac` fixed for other widgets.

**Fix applied in this pass** (branch `claude/brave-rubin-hjxfx5`): moved the
`recordSignal()` call into a `useEffect` keyed on the same values, matching
the `MemoryWidget` / `System.tsx` pattern exactly:

```tsx
React.useEffect(() => {
  if (hasRecordedRef.current || punctuation.sampleSize === 0) return
  hasRecordedRef.current = true
  recordSignal('intentions', 'microimage_rendered', { ... })
}, [punctuation.sampleSize, composition, punctuation.aggregate.tone,
    punctuation.aggregate.intent, punctuation.aggregate.intensity,
    punctuation.callForHelp])
```

Verified: `npx esr ./scripts/build/client.build.ts -prod` builds clean, and
`tsc --noEmit` reports no new errors in this file (the repo currently has a
number of pre-existing, unrelated type errors in other files that this
change does not touch or worsen).

## Areas that look correct (reviewed, not changed)

- `PatternRecognitionWidget.tsx`: `getOptimalWidget()` (which internally
  calls `analyzeIntentions()`) is wrapped in `useMemo(..., [patterns])`,
  keyed on the *already analyzed* pattern list rather than raw signals — so
  it only re-invokes when patterns actually change, not on every render. It
  is still technically a possible-write inside `useMemo`, but
  `analyzeIntentions()` has an internal 5-minute cooldown, so in the common
  case this is a cheap no-op read. Lower priority than the fixed case above,
  but worth revisiting if profiling ever shows it on a hot path.
- `QuantumEngineWidgets.tsx` device-connect handlers (`handleCarConnect` etc.)
  call `recordSignal()` **inside** a `setCarConnected(prev => { ...
  recordSignal(...); return next })` functional state updater. This is a
  side effect inside a state updater function, which React may invoke more
  than once (e.g. under Strict Mode double-invoke), risking a duplicate
  signal write. It is user-click-triggered rather than mount/render-triggered
  so it does not produce visible lag, but it is a minor doctrine deviation
  worth a follow-up cleanup (move `recordSignal` out of the updater, after
  the `setState` call).
- `Logs.tsx:3975` (`analyzeIntentions()` on `/qos` trigger) and
  `SystemProgressWidget`'s deferred report build are both already
  effect/handler-phase, consistent with doctrine.

## Next steps

1. Ship the `MicroImageWidget` fix (this pass) — closes the last known
   render-phase write on the System tab's default-mounted widgets.
2. If lag reports continue after this fix, the next place to look is
   `QuantumEngineWidgets.tsx` (largest remaining subscriber surface, several
   `useMemo`s keyed on `view`/`engineState.signals` that re-run
   `getUserState()`/`getUserIndex()`/`classifyPhysiologicalCohort()` — cheap
   individually, but worth a profile run if the widget cluster grows).
3. Consider adding a dev-only guard (e.g. wrapping `intentionEngine.set` to
   warn via `console.trace` if called while `ReactDOM` is mid-render) so the
   next instance of this exact bug class gets caught at write-time instead of
   requiring another headless-Chromium profiling pass to find.
4. The `setCarConnected` functional-updater side effect above is safe to fix
   opportunistically but is not causing user-visible lag; not blocking.

## How this was verified

- Read the full commit history of every prior "button lag" / "perf" fix on
  this repo (`git log --grep=lag`, `--grep=perf`) to establish the doctrine
  and confirm this fix follows the same shape as the ones that already
  shipped and were verified working.
- Grepped every `recordSignal(`/`recordQOSSignal(`/`analyzeIntentions(` call
  site under `src/client/components` and checked whether each sits in a
  render body, a bare `useMemo`, an effect, or a handler.
- Confirmed `MicroImageWidget` is reachable, live code (`System.tsx:974`),
  not dead/experimental code.
- Ran a full `npm install --legacy-peer-deps` + `tsc --noEmit` +
  `esr scripts/build/client.build.ts -prod` to confirm the fix introduces no
  new type errors and the client bundle still builds.
