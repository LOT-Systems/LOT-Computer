<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Button Lag / Rendering Diagnostic — September 7, 2026

**Issue investigated**: Reports of button lag and rendering problems (recurring theme; not a new isolated report)
**Scope**: `src/client/components/**` — System dashboard, Logs, and widgets added since the last confirmed fix
**Method**: Scheduled automated audit — git/PR history review + targeted static audit of the "render isolation" doctrine (see `docs/wiki` invariant #7) across all widget files, with each finding independently re-verified against source before being recorded here.

---

## 1. History: this bug has already been fixed at least twice

Button lag on this codebase traces to one recurring root cause: `analyzeIntentions()` in
`src/client/stores/intentionEngine.ts` is a large (~3,200-line), synchronous function that
scans every recorded signal against 125+ patterns and — on a cooldown miss — **writes** the
shared `intentionEngine` nanostores atom (`intentionEngine.set(...)`, lines 133/143/226/3443/
3756/3775). Any code path that calls it (directly, or via `getOptimalWidget()`,
`classifyPhysiologicalCohort()`, etc.) either:

- **(a)** during React's render phase (component body or a `useMemo` keyed on a fast-changing
  value like the whole `engine`/`logs` object) → a render-phase store write that cascades
  synchronous re-renders across every `useStore(intentionEngine)` subscriber on the page, or
- **(b)** synchronously inside an `onClick` handler → blocks the click from visually
  responding until the scan finishes.

Prior fixes for this exact pattern (all merged, see `git log --oneline | grep -iE
"button|lag|render|perf"`):

| Commit | Fix |
|---|---|
| `ee88f4c`, `6e5007a`, `b46f1ac` | Paused/unmounted System-tab background work when the tab is inactive; moved a render-phase atom write out of render (tab-switch stall) |
| `863b333`, `b219cc3` | Capped logs query size, backed off stats polling, moved quantum-state writes out of `useMemo` |
| `be3e8fa` (PR #94) | `MemoryWidget`: moved `analyzeIntentions()` out of a `useMemo` into a `useEffect`; `SystemProgressWidget.handleGenerateReport`: deferred the scan one macrotask via `setTimeout(build, 0)` so the click responds instantly |
| `9364aba` (PR #95) | `SignalStreamWidget`/`UserMetricsWidget`: memoized heavy per-render work (`getUserIndex()`, cohort classification) keyed on `engine.signals` instead of the whole engine object |

No `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md` file (referenced by the `be3e8fa`
commit message) is actually present in history — it appears to have been an agent-session
working note that was never committed. This doc replaces it with a version that is committed
and dated.

Since PR #95 (Jul 28), the `claude/quantum-engine-widgets` branch has landed **~17 more merged
PRs** (#83–#96) adding a large number of new widgets (`QuantumEngineWidgets.tsx`,
`ArchitectWidget.tsx`, `BenchmarkWidget.tsx`, astrology/circadian signal handlers, etc.) and a
`System.tsx` merge-conflict resolution (`73edd95`) that combined two divergent widget branches.
**No new benchmark session report (`docs/benchmark/*.md`) mentions lag/freeze/stall since
`LOT-SR-20260719-01.md`** (Jul 19) — i.e. no fresh *user-reported* recurrence is on record as of
this audit. This diagnostic was triggered proactively (scheduled review), not by a new
complaint, given the volume of widget churn in the affected area since the last fix.

---

## 2. Findings — confirmed regressions of the same anti-pattern

All four findings below were independently re-verified by reading the current source (not just
taken from the audit pass) before being recorded.

### 2.1 `System.tsx:377` — render-phase store write reintroduced (HIGH)
```tsx
const optimalWidget = React.useMemo(() => getOptimalWidget(), [logs])
```
`getOptimalWidget()` (`intentionEngine.ts:3666`) calls `analyzeIntentions()` directly with no
deferral. This is the exact pattern `be3e8fa` fixed in `MemoryWidget` and that
`PatternRecognitionWidget.tsx:73-78` explicitly guards against (see its own inline comment).
It resurfaced in the main `System` dashboard's render body, keyed on `logs` — which changes
often — so on any render where the 5-minute cooldown has lapsed, this writes the shared atom
mid-render and cascades re-renders across every subscriber on the page (SignalStreamWidget,
PatternRecognitionWidget, QuantumEngineWidgets, SystemPulseWidget, …). `optimalWidget` is
genuinely consumed later (System.tsx:860-908) to drive suggestions, so the call can't simply be
deleted — it needs the same `useEffect` + `useState`-seed treatment `be3e8fa` used for
`MemoryWidget`, or a memo key on a stable derivative (e.g. `logs.length` / recognized-patterns
ref) instead of the whole `logs` array.

### 2.2 `UserMetricsWidget.tsx:98` — wrong-arity call, throws during render (HIGH — correctness, not just lag)
```tsx
const qieCohort = React.useMemo(() => classifyPhysiologicalCohort(), [engineState.signals])
```
`classifyPhysiologicalCohort(signals, userState, recognizedPatterns)` requires three
arguments with no defaults (`intentionEngine.ts:4520`); calling it with zero throws
(`signals.filter` on `undefined`) every time this memo re-runs — i.e. on every new signal.
Confirmed wired live at `System.tsx:1025` inside `<WidgetErrorBoundary name="Dashboard">`
(`System.tsx:1021-1029`), which also wraps `CorrelatedIndexesWidget` and
`SystemProgressWidget` — so this doesn't just lag, it can take down the entire Dashboard
widget group on the System tab. Note line 97, immediately above, already has the *correct*
pattern (`getUserIndex()` keyed on `engineState.signals`, not the whole engine object) — this
looks like a copy/paste of that memo shape with a different, incompatible function dropped in
without updating its call signature or the `.label`/`.dominant` field accesses at lines
259/269/271 (actual return shape is `{archetype, energyBand, dominantModule, directive,
confidence}`).

### 2.3 `Logs.tsx:3975` — heavy scan not deferred from a keystroke-driven effect (MEDIUM-HIGH)
```tsx
} else if (trigger === 'qos-report') {
  try { analyzeIntentions() } catch {}
```
Reached from `detectNewTriggers`, which runs in a `useEffect` on every keystroke once a
trigger phrase (e.g. `/qos`) is typed (`Logs.tsx:3936`). Unlike the sibling call in
`SystemProgressWidget.tsx:1621-1641`, which explicitly defers via `setTimeout(build, 0)` — with
a comment describing exactly this class of lag — this call is synchronous and runs right after
the keystroke's render commits, which can visibly stall the next paint/typing frame when the
cooldown hasn't lapsed. Fix: wrap in the same one-macrotask deferral.

### 2.4 `QuantumEngineWidgets.tsx:373-376` — redundant unmemoized render-body call (LOW-MEDIUM)
```tsx
const live = engineState.signals.length > 0
  ? classifyPhysiologicalCohort(engineState.signals, getUserState(), engineState.recognizedPatterns ?? [])
  : null
```
Runs on every render while `view === 'cohort'`, duplicating work already correctly memoized
three lines above as `cohortDirective` (lines 201-205, keyed on `.length`). Not the giant
`analyzeIntentions` scan (impact is modest — a filter + short sort), but it's unmemoized
render-phase work that should just reuse `cohortDirective` instead of recomputing.

### 2.5 `QuantumRandomWidget.tsx:39-53` — background interval missing the established visibility guard (LOW)
A 1s interval calls `recordSignal('calculator', ...)` with no `document.hidden` /
`isRouteActive('system')` guard, unlike `ChakraErgonomicsWidget`, `ContextualPromptsWidget`,
`EvolutionMilestoneToast`, and `SystemPulseWidget`, which all check it. Largely mitigated
because `System` is wrapped by `unmountWhenInactive` (`app.tsx:187`), which clears the interval
on in-app tab switch — but it still writes to the store while the *browser* tab is backgrounded,
inconsistent with the established pattern.

---

## 3. Checked and clean (no action needed)

- `src/client/components/ui/Button.tsx` — the shared Button primitive already isolates its
  store subscription to only what each variant needs (`PrimaryBtn` subscribes to `theme` only,
  etc.); no heavy transitions or unmemoized handlers found here. Button lag is not a shared-
  component problem — it's localized to the widget call sites above.
- `PatternRecognitionWidget.tsx:55-78`, `SystemProgressWidget.tsx:1621-1641`,
  `UserMetricsWidget.tsx:97`, `BenchmarkWidget.tsx`, `EmotionalCheckIn.tsx:191-193` — all follow
  the correct deferred/memoized pattern, several with explicit comments documenting why.
- `CalendarWidget.tsx`, `RecipeWidget.tsx`, `MicroImageWidget.tsx`, `SelfCareMoments.tsx`,
  `ContextualPromptsWidget.tsx`, `MicroGameWidget.tsx` — click handlers only call lightweight
  `recordSignal`/`recordXSignal` wrappers, which already defer `analyzeIntentions` internally
  via `deferHeavy()` (`intentionEngine.ts:242-243`).

---

## 4. Recommended next steps

1. **Fix 2.2 first** (`UserMetricsWidget.tsx:98`) — it's a live crash, not just lag, and takes
   the whole Dashboard widget group down with it via the shared error boundary.
2. Fix 2.1 (`System.tsx:377`) the same way `be3e8fa` fixed `MemoryWidget` — move the
   `getOptimalWidget()` call to a `useEffect` with a `useState` seed, or key the memo on a
   stable value instead of `logs`.
3. Fix 2.3 (`Logs.tsx:3975`) by wrapping in `setTimeout(..., 0)`, matching
   `SystemProgressWidget`'s established pattern.
4. Fix 2.4/2.5 as low-priority cleanup in the same pass, for consistency with the render-
   isolation doctrine.
5. Longer term: the repeat regressions all involve a *new* call site being added to
   `analyzeIntentions()`/`classifyPhysiologicalCohort()` without going through the two safe
   wrappers (`deferHeavy()`, or a stable-keyed memo). Consider making the raw functions
   `@internal`-only exports and only exposing pre-deferred wrapper hooks (e.g. a
   `useOptimalWidget()` hook that owns the `useEffect`/`useState` dance) so future widgets
   can't reintroduce this by construction rather than by convention.
6. No fresh user report of lag is on record since Jul 19 — this diagnostic was produced by a
   proactive scheduled audit given the volume of widget churn (PRs #83–#96) in the affected
   area since the last confirmed fix (PR #95, Jul 28). If a new user-facing lag report comes
   in, check it against §2.1 and §2.2 first — both are on the main System dashboard and would
   affect essentially all users.
