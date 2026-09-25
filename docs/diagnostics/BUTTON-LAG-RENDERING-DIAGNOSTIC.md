<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Button Lag / Rendering — Scheduled Investigation

**Trigger**: Scheduled routine "Button lag investigation"
**Date**: 2026-09-25
**Scope**: `src/client` — button/click responsiveness and per-render cost

---

## Summary

No new user reports or open issues/PRs reference button lag as of this run
(GitHub issue and PR search for "button lag rendering performance" in
`LOT-Systems/LOT-Computer` returned zero open items). The known historical
incidents were already root-caused and fixed on `master`. This investigation
re-audited the codebase for the same bug *classes* elsewhere and found two
residual instances that were missed by the earlier passes — documented below
under Suspected Causes #1 and #2. Neither has a user report attached yet;
both are latent based on static analysis and should be verified with a
render-profiling pass before merging fixes.

## Prior Incidents (for context — already fixed on master)

| Commit | Root cause | Fix |
|---|---|---|
| `bd9ef2a` (Jul 4) | `plannerWidget.ts`: `new AudioContext()` created on every click; browsers cap live instances, so once the cap was hit the constructor threw and killed the click handler before `plannerWidget.set()` ran — buttons went fully unresponsive. | Reuse one shared `AudioContext`; wrap the whole sound path in try/catch so audio failure never blocks navigation. |
| `9364aba` (Jul 28) | `SignalStreamWidget` re-sorted up to 1000 signals, and `UserMetricsWidget` re-ran `getUserIndex()` + `classifyPhysiologicalCohort()`, on **every** render — including renders triggered by unrelated `intentionEngine` writes while mounted on the System tab. | Memoized both on `engine.signals` / `engineState.signals`. |
| `be3e8fa` (Jul 28) | `MemoryWidget`: `analyzeIntentions()` (a store **write**) ran inside a `useMemo` — a render-phase atom write that cascades synchronous re-renders across every `intentionEngine` subscriber before the browser can paint. `SystemProgressWidget.handleGenerateReport`: same `analyzeIntentions()` call ran synchronously inside the click handler, so the button didn't visually respond until the ~139-pattern scan finished. | Moved the `MemoryWidget` analysis into a `useEffect` (post-paint) seeded with `useState` for an identical first render — the pattern `System.tsx` already used. Deferred the report build in `SystemProgressWidget` one macrotask (`setTimeout(build, 0)`) so the click paints its response before the scan runs. |

The doctrine that falls out of these three fixes (see `System.tsx:264-270`
for the canonical form):

1. **Never write a nanostore atom during render** (directly, or transitively
   through a helper like `analyzeIntentions()`) — not even inside `useMemo`.
   `useMemo` still executes in the render phase; a write there re-triggers
   subscriber renders before paint. Seed with `useState(() => read())`, do
   the write in `useEffect`.
2. **Never run unbounded/heavy synchronous work inside an `onClick` handler**
   that a store subscriber elsewhere will re-render for. Defer with
   `setTimeout(fn, 0)` (or equivalent) so the click's visual response paints
   first.
3. **Memoize heavy per-render derivations** (array sorts/filters over
   `signals`, cohort classification, etc.) on the narrowest dependency that
   actually changes, not on a whole store object whose reference changes on
   every unrelated write.

## Suspected Causes Found This Run (not yet fixed)

### 1. `PatternRecognitionWidget.tsx:78` — residual render-phase store write

```tsx
const optimal = React.useMemo(() => getOptimalWidget(), [patterns])
```

`getOptimalWidget()` calls `analyzeIntentions()` internally
(`intentionEngine.ts:3667`), which is the same store-writing function called
out in the `be3e8fa` fix. The inline comment here shows the author was aware
of the hazard and memoized on `patterns` to limit *how often* it runs, but
the callback itself still executes in the render phase (React evaluates
`useMemo` synchronously during render, not after paint) — it only avoids
the "every render" case, not the doctrine violation itself. Because
`analyzeIntentions()` has a 5-minute cooldown before it does real work, the
practical impact is bounded (one cascading write roughly every 5 minutes,
on whichever render happens to follow a `recognizedPatterns` update) —
noticeably less severe than the original `MemoryWidget`/`SystemProgressWidget`
cases, but the same class of bug and not yet brought in line with the
`System.tsx` pattern (`useState` seed + `useEffect`).

### 2. `QuantumEngineWidgets.tsx:374-376` — unmemoized heavy classification in render body

```tsx
const live = engineState.signals.length > 0
  ? classifyPhysiologicalCohort(engineState.signals, getUserState(), engineState.recognizedPatterns ?? [])
  : null
```

This duplicate call sits inside an IIFE in the JSX for the `cohort` cycle
view, separate from the already-memoized `cohortDirective` computed above it
(`QuantumEngineWidgets.tsx:201-205`, memoized on `.length` of signals/
patterns) — it exists because the render body also needs `.archetype`, which
`cohortDirective` doesn't expose. Unlike the memoized value, this call is
**not** memoized: it re-runs `classifyPhysiologicalCohort()` (filters up to
1000 signals, then scores every entry in `PHYSIOLOGICAL_ARCHETYPES`, ~51
archetypes per `About.tsx`'s changelog) on every render of
`QuantumEngineWidgets` while the cohort view is showing.

`QuantumEngineWidgets` is not wrapped in `React.memo` and subscribes to the
whole `intentionEngine` store via `useStore(intentionEngine)`
(`QuantumEngineWidgets.tsx:165`), so it re-renders on every signal recorded
anywhere in the app — this is exactly the "heavy work redone on every render
from an unrelated store write" shape that `9364aba` fixed in
`SignalStreamWidget`/`UserMetricsWidget`, just not caught there because it's
inline in JSX rather than a top-level widget computation.

**Proposed fix** (not yet applied — flagging for the next perf pass):
extend the existing `cohortDirective` memo to also return `archetype`, and
use that everywhere in the `cohort` view instead of the second unmemoized
call.

## Areas Ruled Out This Run

- **`ui/Button.tsx`**: no CSS animation, transition, or subscription cost of
  note. `PrimaryBtn`/`SecondaryRoundedBtn` each subscribe to exactly one
  narrow store (`theme`, `isMirrorOn` respectively); plain `secondary`
  buttons have no store subscription at all. Not a suspect.
- **`sound.ts` / `sovietGameSounds.ts` / `sovietKeyboard.ts` / `sovietChime.ts`**:
  each already reuses a single shared `AudioContext` (the same fix pattern
  as `bd9ef2a`) — no repeat of the original Planner bug elsewhere.
- **`Logs.tsx` `qos-report` trigger** and **`System.tsx`**: `analyzeIntentions()`
  calls already run inside a handler / `useEffect`, not render phase — clean.
- No open GitHub issues or PRs currently reference button lag or rendering
  performance in this repo.

## Next Steps

1. Profile `QuantumEngineWidgets` with the System tab open and a seeded
   high-signal-count store (the `9364aba` commit describes a reusable
   headless-Chromium harness seeded with 1000 signals + 500 logs) to confirm
   the `cohort` view's per-render cost before fixing — the `cohortDirective`
   memo may already keep this cheap enough in practice.
2. If confirmed, apply the same `useState` seed + `useEffect` pattern to
   `PatternRecognitionWidget.tsx:78`, and fold the duplicate
   `classifyPhysiologicalCohort()` call in `QuantumEngineWidgets.tsx:374-376`
   into the existing memo.
3. No other candidates surfaced in this pass. If button lag is reported again
   after these two are fixed, the next place to look is any `useMemo`/render
   body anywhere in `src/client/components` that calls into
   `intentionEngine.ts`'s write path (`analyzeIntentions`, `recordSignal`,
   `recordQOSSignal`, etc.) — `grep -rn "analyzeIntentions\(\)" src/client/components`
   is the fastest way to re-check that set as new widgets are added.
