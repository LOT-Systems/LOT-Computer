# Button Lag / Rendering Diagnostic — 2026-09-09

Scheduled investigation (automated, read-only). No code changes were made —
this is a findings report for follow-up work.

## 0. Process finding — read this first

This is the same investigation that has now been run **on at least 8
separate days** (2026-08-29 through 2026-09-08, one run per day, each on its
own throwaway `claude/brave-rubin-*` / `claude/*` branch), each time
re-finding largely the same anti-pattern. None of those runs' branches were
ever opened as a pull request:

```
$ gh search: repo:LOT-Systems/LOT-Computer head:claude/brave-rubin  → 0 PRs, ever
$ 56 claude/brave-rubin-* branches exist on origin, 0 merged, 0 with a PR
```

`master` (the repo's actual default/merge branch — confirmed via
`origin/HEAD` and the one real open PR, #93, which targets `master`) has not
moved since **2026-08-05** (`98971f20`). Every diagnostic doc after that
date — including the most detailed one, `BUTTON-LAG-RENDERING-DIAGNOSTIC-
2026-09-08.md` on branch `claude/brave-rubin-gxaq6p` — was written, committed,
and pushed to a branch that nothing ever consumed. The fixes described in
those reports (e.g. `be3e8fae` "MemoryWidget.tsx useMemo→useEffect" *is* on
master; everything found in the 09-03 through 09-08 reports is not) never
shipped, because the loop this scheduled task runs in stops at "push a
branch" and nothing downstream opens a PR against `master`.

**Net effect:** ~5 weeks of daily automated diagnosis produced zero net
reduction in the actual bug count on the branch users get. This is the
highest-priority finding in this report, independent of the button-lag bug
itself: either this scheduled task needs a step that opens/updates a PR
against `master` so a human can merge it, or the diagnose-only branches
should stop being created. I have not opened a PR here, per this session's
standing instruction not to create one unless explicitly asked — flagging
for the repo owner to decide.

## 1. Background

"Button lag" is a recurring bug class in this codebase: a click handler
calls a signal-recording function (`recordSignal`, `recordJournalSignal`,
`recordLogSignal`, `recordBadgeSignal`, `recordAstrologySignal`, or
`analyzeIntentions()` — all in `src/client/stores/intentionEngine.ts`)
**synchronously**, and that call cascades a nanostore atom write
(`intentionEngine.set(...)`) that re-renders every widget subscribed to it
(`QuantumStateWidget`, `SignalStreamWidget`, `QuantumEngineWidgets`,
`SystemPulseWidget`, `PatternRecognitionWidget`, `AIFeedbackWidget`,
`UserMetricsWidget`, at minimum). When that work runs before or interleaved
with the button's own visual-feedback `setState`, the paint that should
confirm the click is delayed — this reads to the user as a slow/frozen
button.

Documented as doctrine clause 3 in `docs/assembly/LOT-GENESIS-v1.md`:
**ASYNC SIGNAL RECORDING: setTimeout(0) to unblock visual feedback.**

## 2. Core infrastructure — verified healthy on master

`recordSignal()` (`src/client/stores/intentionEngine.ts:199-245`) is
correctly hardened:

- `schedulePersist()` (line 181) coalesces rapid calls into one deferred
  `localStorage` write (`setTimeout(write, 250)`) instead of stringifying
  the signal array on every call.
- `deferHeavy(() => analyzeIntentions())` (line 243) runs the pattern scan
  via `requestIdleCallback` (falling back to `setTimeout(fn, 0)`), off the
  interaction tick.

The bug is entirely at **call sites** that don't defer around their own
visual-feedback state, or that call `analyzeIntentions()` directly.

## 3. Findings — confirmed still present on master (verified by direct read, not by trusting the prior report)

### 3.1 Worst — unconditional re-record on every render, no guard

`src/client/components/Logs.tsx:2333-2339` (badge-unlock log renderer):

```tsx
} else if (log.event === 'badge_unlock') {
  const badge    = log.metadata?.badge as string | undefined
  const category = log.metadata?.category as string | undefined
  const symbol   = log.metadata?.symbol as string | undefined
  if (badge) {
    recordBadgeSignal(badge, category ?? 'unknown')
  }
  return ( /* JSX */ )
}
```

Runs directly in the render body of the log-list `.map()`, with no
`hasRecordedRef`/`useEffect` guard (unlike the sibling `badge_unlock`
renderer at line 1698, and unlike every other "record on display" case in
this file). `Logs.tsx` re-renders on its own 2s mouse-inactivity timer and
on new-log invalidation, so any log list containing a `badge_unlock` entry
re-triggers the signal — and its fan-out to 7+ subscriber widgets —
repeatedly, indefinitely, while that entry is on screen. This is a standing
perf bug, not just click-lag. **Highest-priority fix.**

### 3.2 `recordSignal` called from inside a `setState` functional updater

`src/client/components/QuantumEngineWidgets.tsx:207-253` — all six
device-toggle handlers (`handleCarConnect`, `handleHomeConnect`,
`handleComputerConnect`, `handlePhoneConnect`, `handleWatchConnect`,
`handleRobotConnect`):

```ts
const handleCarConnect = () => {
  setCarConnected((prev) => {
    const next = !prev
    recordSignal('intentions', next ? 'car_connected' : 'car_disconnected', { timestamp: Date.now() })
    return next
  })
}
```

React requires updater functions to be pure and may invoke them more than
once (Strict Mode double-invoke in dev, interrupted/replayed updates), so
this risks double-recording in addition to the lag. Same shape confirmed in
`AwarenessDashboard.tsx:44-56` (`cycleView`), `NarrativeWidget.tsx:32-41`
(`cycleView`), and `QuantumRandomWidget.tsx:38-51` (inside a countdown
interval updater — fires every tick, not just on click).

### 3.3 Render-time (not click-time) `recordSignal`, unguarded

Delays first paint and can force sibling `intentionEngine` subscribers to
update mid-render. Confirmed present (spot-checked a sample, not
individually re-verified line-by-line this run):

- `GoalJourneyWidget.tsx` — `goals_viewed`
- `CohortConnectWidget.tsx` — `cohort_widget_viewed`
- `EnergyCapacitor.tsx` — `energy_${status}`
- `ChakraErgonomicsWidget.tsx` — `chakra_scan_${weakest.id}`
- `MicroImageWidget.tsx` — `microimage_rendered`
- `InterventionsWidget.tsx` — `intervention_${severity}`

### 3.4 Click handler: signal recorded before the handler's own visual feedback

Same shape as the already-fixed `MemoryWidget`/`SystemProgressWidget` bugs
(those two *are* fixed on master), just not yet fixed at these sites:
`PlannerWidget.tsx` (`handleSetPlan`), `IntentionsWidget.tsx`
(`handleSetIntention`), `CohortConnectWidget.tsx` (`handleToggleExpand`,
`handleViewProfile`, `handleSendMessage`), `SelfCareMoments.tsx`
(`markAsDone`), `RecipeWidget.tsx` (`startFarewell`),
`MicroGameWidget.tsx` (`switchGame`), `MicroImageWidget.tsx`
(`handleRegenerate`, no debounce), `MicroCalculatorWidget.tsx` (`equals()`,
no debounce), `ContextualPromptsWidget.tsx` (`handleAction`,
`handleDismiss`), `ChatCatalystWidget.tsx` (`handleAction`),
`JournalReflection.tsx` (`handleReflectClick`), `PatternInsightsWidget.tsx`
(all three `getPatternActions` handlers).

## 4. Correctly fixed on master — no action needed

- `recordSignal()` itself: coalesced persist + deferred analysis
  (section 2).
- `MemoryWidget.tsx`: `useMemo` → `useEffect` (commit `be3e8fae`,
  2026-07-28).
- `SystemProgressWidget.tsx`: synchronous scan moved out of the click
  handler (commit `be3e8fae`).

## 5. Suspected root cause (unchanged from prior runs, now with more evidence)

Not a framework or CSS-animation issue — `Button.tsx`
(`src/client/components/ui/Button.tsx`) itself has no animation or
expensive style computation. The lag is a copy-paste anti-pattern: ~25
widgets each independently learned to call the signal-recording API, and
most copied the "record first, render second" ordering rather than the
`useEffect`-deferred pattern the two already-fixed widgets use. There is no
lint rule or shared hook enforcing the deferred pattern, so each new widget
has about even odds of reintroducing it.

## 6. Recommended next steps

1. **Decide how this scheduled task's output reaches `master`.** Either add
   a step that opens/updates a single long-lived tracking PR from these
   diagnostic runs, or point a human at the existing branch
   `claude/brave-rubin-gxaq6p` (has the most complete file:line inventory,
   2026-09-08) to cherry-pick fixes from. Otherwise this report will read
   the same again in a week.
2. Fix 3.1 (`Logs.tsx` badge_unlock) first — it's a live repeated-fire bug,
   not just a click-feel issue.
3. Introduce a shared `useDeferredSignal(fn)` hook or a lint rule
   (`no-restricted-syntax` on direct `recordSignal`/`analyzeIntentions`
   calls outside `useEffect`/`setTimeout`) so new widgets can't reintroduce
   this — the same 3-line fix has now been independently rediscovered at
   ~20 call sites across 8 audit runs.
4. Add a Playwright/perf regression test that clicks a representative
   button (e.g. the car-connect toggle in `QuantumEngineWidgets.tsx`) and
   asserts the visual state updates within one frame, to catch regressions
   automatically instead of via manual/scheduled code review.

## 7. What still needs deeper investigation

- No profiling data (React DevTools Profiler traces, Core Web Vitals,
  real-user monitoring) exists anywhere in this repo for this bug —
  every finding across all 8 runs, including this one, is from static code
  reading, not measurement. If "buttons lagging" is being reported by real
  users rather than inferred from code, it would be worth adding basic
  interaction-to-next-paint telemetry to confirm these call sites are
  actually the cause versus, e.g., network-bound `fetch` calls in the same
  handlers or unrelated CSS transitions.
