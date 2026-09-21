<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Button Lag / Rendering — Diagnostic Report

**Date**: September 21, 2026
**Investigator**: scheduled routine "Button lag investigation" (autonomous)
**Branch**: `claude/brave-rubin-6yzzt7`
**Repo HEAD at time of investigation**: `98971f2` (2026-08-05 — repo has had no new commits in ~6.5 weeks)
**Status**: ⚠️ New root cause identified, not yet fixed — see Recommended Fix below

---

## 1. Summary

No open GitHub issues or bug reports currently reference button lag (`search_issues` for "button lag rendering performance" returned zero results). However, this exact symptom has a well-documented history in this repo: **five prior PRs** (#85, #87, #88, #94, #95, all July 2026) diagnosed and fixed successive waves of the same root cause — heavy, unmemoized work running synchronously during React renders of the always-mounted System-tab widget stack, triggered by every write to the shared `intentionEngine` nanostore.

This investigation found that the same anti-pattern the prior fixes eliminated is **still present and unaudited** in `QuantumEngineWidgets.tsx` — a widget added the same week as the last fix wave, mounted on the same System tab, and containing the literal buttons (Car/Home/Computer/Phone/Watch/Robot connect toggles) most likely to be perceived as "laggy."

## 2. Prior fix history (for context)

All commits/PRs below are merged and on `master`:

| PR | Date | Root cause fixed |
|----|------|-------------------|
| [#85](https://github.com/LOT-Systems/LOT-Computer/pull/85) | 2026-07-19 | Background intervals (`recomputeAssembly` 60s, pulse poll 10s) kept running on off-screen tabs (`display:none`), saturating the main thread regardless of visible tab. `recordSignal` synchronously ran a 125-pattern scan + full `JSON.stringify` of up to 1000 signals on every interaction. |
| [#87](https://github.com/LOT-Systems/LOT-Computer/pull/87) | 2026-07-19 | `SystemProgressWidget` was mounted twice, doubling mount-effect cost (fetch, interval, `analyzeIntentions`). |
| [#88](https://github.com/LOT-Systems/LOT-Computer/pull/88) | 2026-07-19 | `PatternRecognitionWidget.getOptimalWidget()` — which calls `analyzeIntentions()`, a **store write** — ran directly in the render body, cascading synchronous re-renders across all `intentionEngine` subscribers on every signal. Three System-only intervals were ungated from `document.hidden` and kept firing off-tab. |
| [#94](https://github.com/LOT-Systems/LOT-Computer/pull/94) (`be3e8fa`) | 2026-07-28 | `MemoryWidget` ran `analyzeIntentions()` (a store write) inside `useMemo`; `SystemProgressWidget.handleGenerateReport` ran a ~139-pattern scan synchronously inside the click handler, blocking the button until it finished. |
| [#95](https://github.com/LOT-Systems/LOT-Computer/pull/95) (`9364aba`) | 2026-07-28 | `SignalStreamWidget` copied+sorted up to 1000 signals every render; `UserMetricsWidget` ran `getUserIndex()` + `classifyPhysiologicalCohort()` unmemoized every render. Reproduced with a headless-Chromium harness seeded at 1000 signals / 500 logs — confirmed 5 rapid System↔Log tab switches dropped from "a heavy task per switch" to a single one-time cost. |

The commit for #94 references an agent-authored `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`. That file is not present in git history under any path — it appears to have been a working document from that session that was never committed, so its full content could not be recovered here; this report reconstructs the pattern from the fix commits themselves.

## 3. New finding: the same class of bug, unaudited

`src/client/components/QuantumEngineWidgets.tsx` (mounted on the System tab at `System.tsx:1006`) was authored starting **2026-06-29**, with its current form last touched **2026-08-04** (`d7f076e`) — i.e. it existed throughout the entire July fix campaign but was never touched by any of PRs #85/#87/#88/#94/#95. It reintroduces the exact anti-pattern those PRs fixed.

The component calls `useStore(intentionEngine)` (`QuantumEngineWidgets.tsx:165`), so **it re-renders on every signal write anywhere in the app** — the same subscription surface that made `SignalStreamWidget` and `UserMetricsWidget` expensive before PR #95.

Two of its seven view tabs do unmemoized, signal-count-scaling work directly in the render body:

- **`cohort` view** (`QuantumEngineWidgets.tsx:373-377`):
  ```tsx
  const live = engineState.signals.length > 0
    ? classifyPhysiologicalCohort(engineState.signals, getUserState(), engineState.recognizedPatterns ?? [])
    : null
  ```
  `classifyPhysiologicalCohort` (`intentionEngine.ts:4520`) filters the full signal array, builds a source-count map, and scores+sorts every physiological archetype — on every render, while this view is active. Notably, the component *already* memoizes an equivalent call correctly two lines earlier (`cohortDirective`, `QuantumEngineWidgets.tsx:201-205`, `useMemo` keyed on `engineState.signals.length` / `recognizedPatterns.length`) — but that memoized value is only used as a fallback (`cohortDirective ?? live?.directive`); the unmemoized `live` call still runs to get `archetype`, `energyBand`, `dominantModule`, and `confidence`.

- **`qos-field` view** (`QuantumEngineWidgets.tsx:568-613`):
  ```tsx
  {view === 'qos-field' && (() => {
    const qos = getQuantumOS()
    ...
  })()}
  ```
  `getQuantumOS` (`intentionEngine.ts:5212`) filters the signal array once for the trailing 7 days, then filters that result again for each of 10 signal sources (`O(10n)`), on every render, while this view is active.

### Why this reads as "the buttons lag"

The same component that does this expensive re-derivation renders the six device connect/disconnect buttons (`QuantumEngineWidgets.tsx:619-648`). The click handlers (e.g. `handleCarConnect`) call `setCarConnected` **and** `recordSignal(...)`, which writes to `intentionEngine`. Concretely:

1. User is viewing the `cohort` or `qos-field` QOS tab (reached by clicking the block label, which cycles `view`).
2. User taps "connect" on any device button.
3. `recordSignal` writes to `intentionEngine` → `useStore` fires a re-render of `QuantumEngineWidgets`.
4. That re-render re-executes the unmemoized `classifyPhysiologicalCohort` / `getQuantumOS` call before the browser can paint the button's new "disconnect" label.
5. With a realistic signal history (PR #95's own repro used 1000 signals to make this visible), the button visibly lags before flipping state — same symptom, same widget tree, same root cause class as #85/#88/#95, just a different call site.

This is also present, at lower severity, in `IntegrityWidget.tsx:407-424` (`field` view: unmemoized `getUserState()` + `getUserIndex()` + two array `.filter()`s per render). `IntegrityWidget` does not call `useStore(intentionEngine)`, so it only re-renders on `logs` query changes or local `view` state changes rather than on every signal — lower frequency, but the same "unmemoized derived-state-in-render" shape, worth cleaning up in the same pass.

## 4. Profiling / telemetry available

- `src/client/utils/perf.ts` installs a `PerformanceObserver` for `event` timing and Long Animation Frames, and warns to `console.warn` for interactions over 200ms / frames over 50ms. It is **console-only** — nothing is persisted or sent to a backend, and `window.__LOT_PERF__.getEntries()` only holds the last 50 in-memory entries for the current tab session.
- No Sentry, analytics, or server-side performance logging exists in the codebase.
- No GitHub issues currently report this (search returned 0 results), consistent with the observer being console-only and unlikely to have surfaced a report yet.

**Implication**: there is currently no way to confirm this finding against real user telemetry — it is a static-analysis finding backed by the exact pattern and repro methodology (1000-signal seed, headless-Chromium harness) used in PR #95, not a live profiling trace.

## 5. Recommended fix

Mirror the fix already applied to `cohortDirective` in the same file:

```tsx
const cohortClassification = React.useMemo(() => {
  if (engineState.signals.length === 0) return null
  return classifyPhysiologicalCohort(engineState.signals, getUserState(), engineState.recognizedPatterns ?? [])
}, [engineState.signals.length, engineState.recognizedPatterns?.length])
```
and use `cohortClassification` in place of the inline `live` IIFE at `QuantumEngineWidgets.tsx:373-377`.

```tsx
const qosField = React.useMemo(() => getQuantumOS(), [engineState.signals, engineState.userIndex, engineState.recognizedPatterns])
```
and use `qosField` in place of the inline `getQuantumOS()` call at `QuantumEngineWidgets.tsx:569`, gated behind `view === 'qos-field'` only for the render output, not the computation (or keep the `useMemo` cheap by keying narrowly — `getQuantumOS` only needs `signals`, `userIndex`, `recognizedPatterns`, not the whole `engineState`).

Apply the equivalent memoization to `IntegrityWidget.tsx`'s `field` view.

Verification should follow the same methodology as PR #95: seed a headless-Chromium harness with ~1000 signals, switch to the `cohort`/`qos-field` QOS view, click a device connect button repeatedly, and confirm the click-to-repaint time drops to a one-time computation rather than a per-click cost.

## 6. Areas needing deeper investigation

- **No live telemetry exists** to confirm whether this specific path is the one users are currently experiencing, versus a regression elsewhere introduced after the repo's last commit (2026-08-05) that isn't in this checkout — `perf.ts`'s console warnings would need to be wired to a persisted sink (even a `POST /api/logs` SYS: entry, matching the pattern already used elsewhere in the codebase for context capture) to get real signal on this going forward.
- The repo has had no commits since 2026-08-05 (~6.5 weeks as of this report). If "buttons lagging" reports are recent/live, it's worth confirming whether they're against this exact checkout or a deploy with additional uncommitted/unmerged changes.
- A full audit of every `view === '...' && (() => { ... })()` IIFE pattern across `src/client/components/*.tsx` for unmemoized store reads (the same shape found here and in `IntegrityWidget.tsx`) has not been done in this pass — this report covers the two widgets most directly tied to interactive buttons on the System tab, not an exhaustive sweep.
