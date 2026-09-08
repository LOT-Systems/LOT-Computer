# Button Lag / Rendering Diagnostic — 2026-09-08

Scheduled investigation (automated, read-only). No code changes were made — this
is a findings report for follow-up work.

## 1. Background

"Button lag" is a recurring, previously-documented bug class in this codebase:
a click handler calls a signal-recording function (`recordSignal`,
`recordJournalSignal`, `recordLogSignal`, `recordBadgeSignal`,
`recordAstrologySignal`, or `analyzeIntentions()` — all in
`src/client/stores/intentionEngine.ts`) **synchronously**, and that call does
expensive work: a `localStorage.setItem` of a JSON-stringified signal array
(up to `MAX_SIGNALS`), a 100+-pattern scan (`analyzeIntentions`), and a
nanostore atom write (`intentionEngine.set(...)`) that cascades a re-render to
every widget subscribed to that atom (currently at least
`QuantumStateWidget`, `SignalStreamWidget`, `QuantumEngineWidgets`,
`SystemPulseWidget`, `PatternRecognitionWidget`, `AIFeedbackWidget`,
`UserMetricsWidget`). When that work runs before or interleaved with the
button's own visual-feedback `setState`, the paint that should confirm the
click is delayed — this reads to the user as a slow/frozen button.

Documented as doctrine clause 3 in `docs/assembly/LOT-GENESIS-v1.md`:
**ASYNC SIGNAL RECORDING: setTimeout(0) to unblock visual feedback.** Prior
fixes for this exact pattern:

- `docs/benchmark/LOT-SR-20260604-01.md` — "Biofield button lag" in `recordSignal()` itself
- `docs/benchmark/LOT-SR-20260622-01.md` — "Memory button lag" in `MemoryWidget.tsx`
- commit `be3e8fae` (2026-07-28) — `MemoryWidget.tsx` (useMemo → useEffect) and
  `SystemProgressWidget.tsx` (synchronous scan in click handler deferred)

This run re-audited the codebase for the same anti-pattern recurring
elsewhere, since it is a large codebase with ~25 widgets that all call into
the same signal-recording API.

## 2. Core infrastructure — healthy

`recordSignal()` (`src/client/stores/intentionEngine.ts:199-252`) is already
hardened from the prior fixes:

- Persist is coalesced: `schedulePersist()` (line 181) batches rapid calls
  into one deferred `localStorage` write via `setTimeout(write, 250)`,
  instead of stringifying up to 1000 signal objects on every call.
- Pattern analysis is deferred: `deferHeavy(() => analyzeIntentions())`
  (line 243) uses `requestIdleCallback` (falling back to `setTimeout(fn, 0)`)
  so the scan runs off the interaction tick.

The remaining risk is **at the call sites**: widgets that call
`recordSignal`/`analyzeIntentions` directly without deferring around their
own visual-feedback state update, or that bypass `recordSignal`'s internal
scheduling by calling `analyzeIntentions()` themselves.

## 3. Findings — confirmed violations

19 of 23 audited widget files contain at least one instance of the
anti-pattern. Two tiers stood out as more severe than anything in the prior
fixes; the rest match the previously-fixed shape.

### 3.1 Most severe — unconditional re-record on every render, no guard

**`src/client/components/Logs.tsx:2333-2339`** (badge-unlock log renderer):

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

Unlike every other "record on display" instance in this file (which use a
`hasRecordedRef` guard) or the fixed doctrine pattern (`useEffect` + seeded
`useState`), this call has **no guard at all** — it runs directly in the
render body of the log-list map. `Logs.tsx` re-renders on its own 2s
mouse-inactivity timer (`isMouseActive`, lines ~157-163) and on new-log
query invalidation, so any user with a `badge_unlock` entry visible in their
log list re-triggers `recordBadgeSignal` — and its `intentionEngine.set()`
fan-out to 7+ subscriber widgets — repeatedly, indefinitely, for as long as
that entry stays on screen. This is a live perf bug, not just a click-lag
risk, and is the top priority to fix.

### 3.2 `recordSignal` called from inside a `setState` functional updater

`src/client/components/QuantumEngineWidgets.tsx:207-253` — all six
device-toggle handlers (`handleCarConnect`, `handleHomeConnect`,
`handleComputerConnect`, `handlePhoneConnect`, `handleWatchConnect`,
`handleRobotConnect`), e.g.:

```ts
const handleCarConnect = () => {
  setCarConnected((prev) => {
    const next = !prev
    recordSignal('intentions', next ? 'car_connected' : 'car_disconnected', { timestamp: Date.now() })
    return next
  })
}
```

Same shape in `src/client/components/AwarenessDashboard.tsx:44-56`
(`cycleView`), `src/client/components/NarrativeWidget.tsx:32-41`
(`cycleView`), and `src/client/components/QuantumRandomWidget.tsx:38-51`
(inside a `setRemaining` countdown-interval updater, so it fires every tick).

This is worse than "runs before the paint": it runs *inside React's state
resolution itself*. React requires updater functions to be pure, and may
invoke them more than once (React Strict Mode double-invokes in dev;
interrupted/replayed updates) — meaning these signals risk being
double-recorded, in addition to adding synchronous cost to the render that's
supposed to give instant feedback.

### 3.3 Render-time (not click-time) `recordSignal`, unguarded, before the widget's own `return`

Delays first paint of these widgets and can force sibling
`intentionEngine`-subscribers to update mid-render:

- `src/client/components/GoalJourneyWidget.tsx:46-54` — `goals_viewed`
- `src/client/components/CohortConnectWidget.tsx:44-53` — `cohort_widget_viewed`
- `src/client/components/EnergyCapacitor.tsx:50-57` — `energy_${status}`
- `src/client/components/ChakraErgonomicsWidget.tsx:62-72` — `chakra_scan_${weakest.id}`
- `src/client/components/MicroImageWidget.tsx:248-258` — `microimage_rendered`
- `src/client/components/InterventionsWidget.tsx:37-44` — `intervention_${severity}`

### 3.4 Click handler: signal recorded before the handler's own visual feedback

Same shape as the already-fixed `MemoryWidget`/`SystemProgressWidget` bugs,
just not yet fixed here:

| File | Handler | Detail |
|---|---|---|
| `PlannerWidget.tsx:51-59` | `handleSetPlan` | `recordSignal` is the first statement, before `createLog(...)` / `setCompletionMessage(...)` |
| `IntentionsWidget.tsx:73-93` | `handleSetIntention` | `recordSignal` first, before `setIntention`/`setInputValue`/`setView` |
| `CohortConnectWidget.tsx:129-135` | `handleToggleExpand` | `recordSignal` runs before `setExpandedMemberId` (the expand/collapse itself) |
| `SelfCareMoments.tsx:185-218` | `markAsDone` | `recordSignal` (line 193) sits between two feedback state updates (`setCompletedToday` at 188, `setCompletionMessage` at 218) |
| `RecipeWidget.tsx:251-267` | `startFarewell` | `recordSignal` first, before `setFarewell`/`setTurn` |
| `MicroGameWidget.tsx:768-780` | `switchGame` | `recordSignal` last in handler, but still inside the same synchronous batch as the game-switch state updates |
| `MicroImageWidget.tsx:260-266` | `handleRegenerate` | `recordSignal` runs synchronously on every click, no debounce |
| `MicroCalculatorWidget.tsx:125-134` | `equals()` | `recordSignal` on every `=` press, no debounce |
| `ContextualPromptsWidget.tsx:195-222` | `handleAction` | `recordSignal` first, `setDismissedPrompts` (visible dismissal) last |
| `ContextualPromptsWidget.tsx:224-240` | `handleDismiss` | same shape, lower severity (awaits a network call first) |
| `CohortConnectWidget.tsx:109-127` | `handleViewProfile`, `handleSendMessage` | `recordSignal` before `window.location.href` / `stores.goTo('sync')` |
| `ChatCatalystWidget.tsx:49-66` | `handleAction` | `recordSignal` before `window.location.href` |
| `JournalReflection.tsx:20-23` | `handleReflectClick` | `recordSignal` before `stores.goTo('logs')` |
| `PatternInsightsWidget.tsx:92-125` | all three `getPatternActions` handlers | `recordSignal` before each action's navigation/scroll |

## 4. Confirmed still correctly fixed (no action needed)

- `MemoryWidget.tsx` — `onAnswer` (117-159): visual feedback (`setClickedButtonIndex`) first, `recordSignal` deferred via `setTimeout(..., 0)`; `analyzeIntentions()` in a `useEffect` keyed on `question?.id`, seeded via `useState`.
- `SystemProgressWidget.tsx` — `handleGenerateReport` (1621-1642) defers the whole build (`analyzeIntentions()` + report + `recordQOSSignal`) via `setTimeout(build, 0)`.
- `EmotionalCheckIn.tsx` — `handleCheckIn` (178-194) sets feedback state first, defers `recordSignal` via `setTimeout(..., 0)`.
- `Logs.tsx` NoteEditor autosave (~3805-3807) and the `/qos` trigger (~3975) — both run inside debounced/keyed `useEffect`s, not on every render or keystroke.

## 5. Recommended fix pattern (matches existing doctrine)

For click handlers (3.4): do the visual-feedback `setState` first, then wrap
the `recordSignal`/`analyzeIntentions` call in `setTimeout(fn, 0)` —
identical to the `MemoryWidget.tsx`/`EmotionalCheckIn.tsx` fix.

For render-time calls (3.3) and the `Logs.tsx` badge case (3.1): move the
call into a `useEffect` with a `hasRecordedRef` (or a key-based guard so it
fires once per log entry, not once per render) — matching the pattern
already used elsewhere in `Logs.tsx` for other log-display side effects.

For `setState`-updater calls (3.2): move `recordSignal` out of the updater
entirely — compute `next` first with a plain boolean read/toggle, call
`recordSignal` (deferred) alongside `setX(next)`, not inside `setX(prev => ...)`.

## 6. Next steps

1. Fix `Logs.tsx:2333-2339` first — it's a live, unbounded, on-every-render
   bug, not just a click-lag risk.
2. Fix the six `setState`-updater cases in `QuantumEngineWidgets.tsx`,
   plus `AwarenessDashboard.tsx`, `NarrativeWidget.tsx`,
   `QuantumRandomWidget.tsx` — these also carry a correctness risk (possible
   duplicate signal recording under Strict Mode/interrupted renders), not
   just a perf one.
3. Sweep the remaining click-handler and render-time cases in section 3.3/3.4
   using the setTimeout(0)/useEffect pattern in section 5.
4. Consider adding a lint rule or a small wrapper (e.g. `recordSignalDeferred()`)
   that always schedules via `setTimeout(0)` internally, so new call sites
   can't reintroduce this pattern — it has now recurred across at least 4
   separate benchmark sessions (June 4, June 22, July 28, and this run).
5. No profiling/APM data or user-facing bug reports were found for this
   session (no existing GitHub issues matched "button lag"); this diagnostic
   is based on static code audit. A follow-up with React DevTools Profiler
   traces on `Logs.tsx` (with a `badge_unlock` entry visible) would confirm
   the render-cascade cost directly.
