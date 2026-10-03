# LOT® Widget Health Scan — 2026-10-03

Scheduled static audit. Branch `claude/charming-albattani-gj1tak` @ `98971f2` (= `master`).
**Method:** source reading and grep only. `node_modules` is absent in this environment, so there was no build, typecheck, runtime profiling or browser lag test. Every "lag" item below is a code-level risk, not a measurement. Runtime items are listed under *Not verifiable here*.

**Code changes in this push: none.** The scan is read-only. Fixes are proposed and left for review because they change user-facing behaviour.

## 1. Inventory

| Item | Count / state |
|---|---|
| Components in `src/client/components` | 64 files, about 40 widget components |
| Widgets mounted by `System.tsx` | about 50 (1071 lines) |
| `WidgetErrorBoundary` wrappers in `System.tsx` | 51 |
| Largest widget | `SystemProgressWidget.tsx`, 2513 lines |
| Others over 500 lines | `MicroGameWidget` 988, `SelfCareMoments` 869, `QuantumEngineWidgets` 651, `PatternRecognitionWidget` 561 |
| Code splitting | esbuild `splitting: true`, but **0 widget `import()` / `React.lazy` / `Suspense`**. |
| Perf instrumentation | `WidgetErrorBoundary` records mount time in `window.__LOT_WIDGET_PERF__` and warns above 50 ms. It is a dev aid and is not reported anywhere. |

## 2. Wiring

### 2.1 LOT® AI, System tab, Portrait (profile)
- `System.tsx` is the single mount point. Widgets read `me` / `useProfile` / `useLogs`, `intentionEngine` (client signals) and `useEvolutionSync`.
- Ambient context (hourly zodiac, moon phase, Rokuyo, weather, users online, circadian phase) is computed in `System.tsx` on a 15 min tick and fed to the Intention engine via `recordAstrologySignal`.
- `getOptimalWidget()` / `shouldShowWidget()` pick the "optimal" widget per user state (AI-driven reveal). Only one widget at a time can win this gate.
- `startBackgroundQOSMonitor()` (30 min, idempotent) and `recomputeAssembly()` (60 min tick, paused when the tab is hidden or off-route) feed SystemProgress, Integrity and Portrait-style readouts.
- **Gap:** I found no direct Portrait-to-widget write path in the client. Portrait data arrives only via `/api/user-profile` and the logs. If widgets are meant to write to Portrait, that wiring is implicit.

### 2.2 Quantum Intent Engine, Memory, Story
- `QuantumEngineWidgets`, `QuantumStateWidget`, `QuantumSignWidget` and `QuantumRandomWidget` sit in separate boundaries ("Quantum Engine Connect", "Biofield Engine", "Quantum Sign"). **`QuantumRandomWidget` and both `TimeWidget` mounts (`System.tsx:444`, `:616`) have no `WidgetErrorBoundary`.** A throw in them propagates to the app-level boundary.
- `MemoryWidget` is mounted twice (`System.tsx:521` and `:965`). It is wrapped both times, but a second mount means two query/state instances. Confirm this is intentional.
- Story: the only Story-like widget is `NarrativeWidget`. I found no `/api/story*` client call.

## 3. Data container vs. display, and log sync (the "military comms" model)

- **Containers (write to `/api/logs` via `useCreateLog`):** Planner, SelfCareMoments, Calendar, Recipe, EmotionalCheckIn, ContextualPrompts.
- **Pure displays:** Time, QuantumRandom, MonthlyPulse, SystemPulse, SystemProgress, UserMetrics, Correlated, Integrity.
- **Event names emitted by the client:** only `self_care_skip`, `self_care_complete`, `report_generated`, `plan_set`, `health_check`, `calendar_entry`. Most widget interactions log free text with no `event` key. That makes aggregate analytics hard.
- **No context stamp.** No widget attaches weather, local time, or users-online to its log post. Nothing implements the proposed standard report line.
- **Inconsistent write path:** `ContextualPromptsWidget.tsx:232` posts raw `axios.post('/api/logs', { text })` with no `event` or metadata and bypasses `useCreateLog`. `queries.ts:135` already notes problems with duplicate empty logs. This path is also invisible to the query cache.
- **No platform-wide usage log.** `rg widget_usage|widget_view|trackWidget` finds nothing. Only `CohortConnectWidget` records a `*_widget_viewed` signal, and only to the client-side intention engine.

**Proposed spec ("Sitrep" line)**, one shared helper `logWidgetEvent(widget, action, meta)`:
```
event: 'widget_<action>'   // widget_open | widget_submit | widget_skip | widget_error
metadata: { widget, action, ts, tz, localHour, weather, usersOnline, tab: 'system', month: <months since join> }
text: 'WIDGET <name> <action> | <local time> | <weather> | <N> online'
```
This gives the transparent "monk" ledger: every interaction leaves one terse, timestamped, context-stamped line, and LOT® AI can read it back. Make it opt-in or visible to the user, in keeping with the transparent-lifestyle intent.

## 4. 15-month reveal scan

- `MonthlyPulseWidget` handles months 1–12 and **caps at 12** (`Math.min(monthNumber, 12)`, label `x / 12 months`). Months 13–15 fall back to a generic line, and the counter pins at "12 / 12". This does not match a 15-month programme.
- UI reveal is currently driven by `visualRefinement` → `getLayoutDensity()` (5 steps: breathable ≥0, comfortable ≥0.15, compact ≥0.35, dense ≥0.55, instrument ≥0.75). It is **achievement-driven, not calendar-driven**. No month→widget manifest exists. Widget visibility in `System.tsx` is mostly tag, intention-engine and time-of-day gating.
- Account age is `dayjs().diff(joinedAt,'month')`. `public-api.ts:1159` also derives the OS version from months, which is a separate consistent definition.
- **Recommendation:** add `WIDGET_REVEAL_MONTH: Record<WidgetName, 0..15>` in `#shared/constants`, one gate helper `isRevealed(widget, monthsSinceJoin)`, and extend `MONTH_MESSAGES` to 15. A dry-run flag should list "revealed this month" widgets for the Digital UX routine.

## 5. Loading speed

| # | Finding | Risk | Fix |
|---|---|---|---|
| L1 | About 50 widgets are statically imported in `System.tsx`; `SystemProgressWidget` alone is 2513 lines. `splitting: true` has nothing to split. | High: the initial JS includes everything. | `React.lazy` the heavy and below-fold widgets (SystemProgress, MicroGame, SelfCare, QuantumEngine, PatternRecognition, Investor/Plan/DemoDay/FourD, Architect, Benchmark). Wrap each in the existing boundary plus `Suspense`. |
| L2 | `useInViewport` exists and `System.tsx` uses it once (line 91). Most widgets still mount and fetch eagerly. | Medium | Gate fetches (`enabled: inViewport`) in below-fold widgets. |
| L3 | `useLogs` fetches `/api/logs` with no LIMIT, per `queries.ts:136`. Many widgets depend on it. | High for heavy users | Add server-side limit or pagination plus `select` per widget. |
| L4 | Investor, corporate and demo widgets are in the same bundle for all users. | Low–Med | Lazy-load or tag-gate the import. |

## 6. Lag audit (code-level)

**Good (already fixed):** `SystemPulseWidget` polls at 10 s (was 1 s) and pauses on a hidden tab or off-route. `ContextualPromptsWidget`, `SystemProgressWidget` and `System` astrology tick all pause when hidden or off-route. `queries.ts` uses long `staleTime` and `refetchOnWindowFocus:false`. Every `setInterval` found has a matching `clearInterval`, except the one noted below.

**Risks:**
- **P1 `useBreathe`** (`utils/breathe.ts`) runs a 100 ms interval with `setState` on every tick when enabled. It is mounted in `System.tsx:132` and `Logs.tsx:3711`, so 10 re-renders/s of a large host component while `/breathe` is on. Fix: gate on `isRouteActive`, set state only when `display` changes, and move the host to a small child component.
- **P2 `TimeWidget`** polls every 1 s (needed for the chime). It does not pause when hidden; the `visibilitychange` catch-up already exists, so the interval could skip when `document.hidden`. It is two mounts, hence two intervals. Mount it once, or share the chime clock.
- **P3 `initRecipeWidget`** (`recipeWidget.ts:186`) calls `setInterval` with no handle, never cleared and with no hidden-tab guard. It is called once from `app.tsx:307`, so the leak is bounded. It will, however, duplicate if re-initialised (HMR, re-login). Store the handle.
- **P4 `sound.ts`** recomputes sound context every 10 s with an effect dependency array containing `context.*`. The effect tears down and recreates the interval whenever the context changes, which is harmless but noisy. Audio contexts are lazy and resumed on gesture, which is correct for keyboard/chime. Three separate `AudioContext` owners exist (sound, keyboard, chime/radio), and browsers cap contexts (about 6). Consolidate into one shared context.
- **P5 `MicroCalculatorWidget`** polls every 10 s and `QuantumRandomWidget` runs two intervals. Neither is gated by visibility. Low impact.
- **P6** `SystemProgressWidget` is a 2513-line single component with large static text tables; it rebuilds heavy arrays on render unless memoised. It has only three memo hooks (3 of 2513 lines). Split and memoise.
- **P7** `useMemo`/`useCallback` coverage is light outside `System`, `Settings`, `Logs`. Not a defect on its own.

## 7. Not verifiable here (needs a run with a browser)
Button-press latency, sound onset latency, first-load time per widget, real bundle sizes (`yarn client:js:build:metafile`), and Lighthouse/INP. Suggested one-shot probe: read `window.__LOT_WIDGET_PERF__` after load and log any widget above 50 ms.

## 8. Recommended actions (priority order)
1. Add `logWidgetEvent` helper with the Sitrep context stamp; route ContextualPrompts through it (§3).
2. Lazy-load the heavy widgets (§5 L1).
3. Wrap `TimeWidget` and `QuantumRandomWidget` in `WidgetErrorBoundary` (§2.2).
4. Extend monthly reveal to 15 and add the reveal manifest (§4).
5. Throttle `useBreathe` and pause `TimeWidget` when hidden (§6 P1–P2).
6. Limit `/api/logs` (§5 L3).

No alert-level failures were found: no crash paths, no leaked polling loops beyond the bounded P3.
