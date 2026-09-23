<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Button Lag & Rendering — Diagnostic

**Issue**: Recurring "click, then a beat, then it happens" lag on buttons/widgets
**Date**: 2026-09-23
**Scope**: `src/client/` (React + nanostores atoms), scheduled investigation — no GitHub issue currently open

---

## Summary

There is no new user report and no open GitHub issue for button lag as of this
scan (0 open issues, 1 unrelated open PR — #93, calendar time-tracking,
stale since 2026-07-28). This is a proactive audit prompted by a recurring
history of the same defect class. It found:

- **One confirmed, currently unfixed instance** of the established root
  cause, in `ChakraErgonomicsWidget.tsx`.
- **Two lower-severity, unmemoized-derivation instances** in
  `QuantumEngineWidgets.tsx` (pure reads, not store writes — modest impact).
- **A systemic gap**: the fix has been applied file-by-file four times since
  June, but the unsafe primitive (`analyzeIntentions()` / any store-writing
  "analysis" call) is still exported and callable directly, with no shared,
  structurally-safe wrapper. That is why the same bug keeps reappearing in
  new widgets.

---

## Root cause (established doctrine, confirmed still accurate)

The app's intent/signal store (`src/client/stores/intentionEngine.ts`) is a
shared nanostores atom (`intentionEngine`) subscribed to by many widgets.
Two operations on it are expensive:

- `recordSignal()` — appends a signal, `JSON.stringify`s up to 1000 signals
  to localStorage, and conditionally triggers analysis.
- `analyzeIntentions()` — a ~139-pattern synchronous scan over the signal
  history that also **writes** `state.recognizedPatterns` back into the atom.

Calling either of these **during React's render phase** (component body,
or inside a `useMemo` that isn't a pure derivation) or **synchronously
inside a click handler** causes one of two symptoms:

1. **Render-phase store write** → cascades a synchronous re-render across
   every other widget subscribed to `intentionEngine` before the browser
   can paint the current frame. Feels like the click did nothing, then
   everything updates a beat later.
2. **Synchronous heavy work in the click/effect handler** → the event
   handler doesn't return control to the browser until the scan finishes,
   so the button's own visual feedback (highlight, disabled state, etc.)
   is delayed by the scan's duration.

### Prior occurrences (all previously fixed, chronological)

| Date | Doc | Root cause | Fix |
|---|---|---|---|
| 2026-06-04 | `docs/benchmark/LOT-SR-20260604-01.md` | Biofield button: `recordSignal()` ran synchronous localStorage write + `analyzeIntentions()` before the cascade animation committed | Deferred via `setTimeout(0)` |
| 2026-06-22 | `docs/benchmark/LOT-SR-20260622-01.md` | Memory button: `recordSignal()` called synchronously between the visual-feedback state set and the `createMemory` API call | Same deferral pattern |
| 2026-07-28 | commit `9364aba` | `SignalStreamWidget`/`UserMetricsWidget`: unmemoized sort of up to 1000 signals + unmemoized cohort classification, redone on every render from unrelated store writes | `useMemo` keyed on `engine.signals` |
| 2026-07-28 | commit `be3e8fa` | `MemoryWidget`: `analyzeIntentions()` (a store write) called inside a render-phase `useMemo`; `SystemProgressWidget`: `handleGenerateReport` ran the scan synchronously inside the click handler | `useState` seed + post-paint `useEffect`; `setTimeout(build, 0)` |

Note: commit `be3e8fa`'s message references
`docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md` as the agent-authored
diagnostic that drove that fix, but that file was never actually committed
to the repo — this document is the first checked-in version of it, so the
doctrine now has a durable home instead of living only in commit messages
and scattered inline comments.

`recordSignal()` itself has since been hardened at the source: it now
defers persistence and analysis via an internal `deferHeavy()` helper
(`requestIdleCallback` with a `setTimeout(0)` fallback,
`intentionEngine.ts:168`). That closed the two June bugs structurally.
`analyzeIntentions()` was **not** given the same treatment — it is still a
plain exported function, so every new call site has to remember to defer
it manually. `deferHeavy()` itself is not exported, so component files
can't reuse it; every fix so far has hand-rolled its own
`useState`-seed/`useEffect` or `setTimeout` workaround.

---

## Findings — current scan

### 1. HIGH confidence — `ChakraErgonomicsWidget.tsx:59-70` (unfixed)

```tsx
// Record signal once per mount
if (!hasInitRef.current) {
  const weakest = [...state.chakras].sort((a, b) => a.charge - b.charge)[0]
  if (weakest) {
    recordSignal('selfcare', `chakra_scan_${weakest.id}`, { ... })
  }
  hasInitRef.current = true
}
```

This runs directly in the component render body (guarded by a ref so it
only fires once per mount, not every render), and `recordSignal()`
synchronously does `intentionEngine.set(...)` — a store write during
render, exactly the pattern fixed in `MemoryWidget.tsx` and documented in
`System.tsx`. Notably, the same file already has a comment two lines above
warning about this exact class of bug for `recomputeChakras()`, but the
`recordSignal` call was missed.

**Suggested fix** (matches the established remedy): move the block into
`React.useEffect(() => { ... }, [])` so it runs post-paint instead of
during render.

### 2–3. MEDIUM confidence — `QuantumEngineWidgets.tsx` (pure reads, not writes)

- **L372-374**: `classifyPhysiologicalCohort(...)` called unmemoized inside
  an inline JSX IIFE for the `'cohort'` view, duplicating a nearly-identical
  memoized value (`cohortDirective`, L200-204) computed two lines above with
  the same dependencies. Re-runs the archetype-scoring pass on every render
  while that view is open.
- **L568-569**: `getQuantumOS()` (filters a week of signals across 10
  sources) called unmemoized inside a render-body IIFE for the
  `'qos-field'` view.

Neither writes to the store, so these don't cause the cascade-re-render
symptom — impact is a modest amount of repeated work while those specific
tabs are open, not a click-response delay. Lower priority than #1.

### Checked and already correctly mitigated

`System.tsx`, `MemoryWidget.tsx`, `SystemProgressWidget.tsx`,
`SignalStreamWidget.tsx`, `UserMetricsWidget.tsx`,
`PatternRecognitionWidget.tsx`, and the `/qos`, `/assembly-check` and other
inline-trigger handlers in `Logs.tsx` (L3933+, all inside a post-paint
`useEffect`) all use the established remedies correctly. No action needed.

---

## Next steps

1. **Fix `ChakraErgonomicsWidget.tsx`** — apply the standard `useEffect`
   remedy to the `recordSignal` block (small, isolated, matches an
   established pattern; not applied in this pass since this was scoped as
   an investigation).
2. **Close the systemic gap**: export `deferHeavy()` from
   `intentionEngine.ts` (or add a `analyzeIntentionsDeferred()` wrapper)
   so new widgets get render-isolation safety by default instead of having
   to reinvent it. This is the actual lever — the bug has now recurred four
   times across three months in four different widgets, each requiring a
   dedicated diagnostic + fix pass.
3. **No automated regression coverage exists** for this class of bug (no
   perf/render tests in the repo). A lightweight test that fails if a store
   write happens synchronously within a mocked render pass would catch
   this before merge instead of after a user notices lag.
4. Widgets not yet audited in depth: anything added after 2026-08-05 (the
   repo has had no commits since then as of this scan) should be checked
   against this doctrine before merge.
