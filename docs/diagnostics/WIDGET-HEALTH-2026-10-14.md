# LOT® Widget Health Scan — 2026-10-14

**Branch:** `claude/charming-albattani-inhjcm` · **Run type:** scheduled routine, automated · **Method:** static code audit + typecheck + production client build.
**Not done:** no live browser session, no database, no real-device timing. Every "lag" statement below is derived from code structure and bundle size, not a stopwatch. Section 7 lists what a live test still needs.

## 0. Verdict

| Area | Status |
|---|---|
| Widget wiring (System / Log / QIE) | 4 real bugs found and **fixed**, 1 more found and **fixed** (display whitelist) |
| Error isolation | OK: every System section sits in a `WidgetErrorBoundary`, but boundaries are coarse (see 2.3) |
| Timers / listeners | OK: all `setInterval` and `addEventListener` calls in widget files have a matching cleanup (the one extra `setInterval` hit in `SystemProgressWidget` is changelog text) |
| Load speed | **Needs work.** 44 widgets mount eagerly and only 1 is lazy-mounted. `app.js` is 730 KB (185 KB gzip) |
| 15-month reveal | **Partially wired.** Monthly Pulse was dead (fixed); copy covers months 1–12 only |
| Typecheck | 135 → 127 errors (all pre-existing, 8 removed, 0 added). Server project: 7 lines, unchanged |
| Build | Client build passes with 2 duplicate-key warnings in `badges.ts` |

## 1. Fixes pushed in this run

| # | File | Defect | Effect before | Fix |
|---|---|---|---|---|
| 1 | `UserMetricsWidget.tsx:98` | `classifyPhysiologicalCohort()` called with **0 args**; the function needs `(signals, userState, patterns)` and reads `signals.filter(...)` | TypeError on every render. The "Dashboard" boundary also wraps CorrelatedIndexes, SystemProgress and SystemPulse, so the whole stack would show the fallback instead of metrics | Pass engine state as every other caller does; null-guard on empty signals. Also fixed the invented fields `.label` → `.archetype` and `.dominant` → `.dominantModule` (they rendered blank) |
| 2 | `MonthlyPulseWidget.tsx` + `/api/me` | Widget reads `user.joinedAt`, but `useProfileView()` never sent it, so `monthNumber` was always 0 | Monthly Pulse could **never** show for anyone | Added `joinedAt` to `useProfileView` pick list and to `UserProfile` type (optional). Own join date only; endpoint is self-scoped |
| 3 | `QuantumEngineWidgets.tsx:472` | `dimensions.selfcare` (key is `selfCare`) | CARE dimension in the QIE UserIndex panel always blank | Corrected key |
| 4 | `intentionEngine.ts` signal source union | `MicroGameWidget` records source `'micro_game'`, which the union did not allow | Type error; signal source undeclared | Added `'micro_game'` to the union |
| 5 | `server/routes/api.ts` `/logs` whitelist | Daily 06:00 UTC job writes `intention_decay_notice`; `Logs.tsx` has a renderer ("INTENT-DECAY:") but the event was not whitelisted | Notice was written to the DB and **never shown**. The renderer was dead code | Added to `displayableEvents` |
| 6 | `queries.ts` | Comment said `/api/logs` has no LIMIT; server caps at 500 | Misleading | Comment corrected |

Verification: `tsc --noEmit` before/after diffed. The only differences are the 8 removed errors and the widened union text. Server tsconfig is unchanged at 7 lines.

## 2. Wiring audit

### 2.1 System tab
`System.tsx` has two layouts. Non-paid accounts get a minimal stack (Time, Memory, Game, Subscribe). R&D and Usership get the full pro stack of about 45 widgets. `MemoryWidget` and `MicroGameWidget` appear twice in the file, but only in different layout branches, so this is **not** a double mount.

### 2.2 Widget inventory (static metrics)
| Widget | Lines | Timers (set/clear) | Listeners (add/rm) | Network calls | Direct Log write (heuristic) | Sound |
|---|---:|---|---|---:|---|---|
| AIFeedbackWidget | 311 | 0/0 | 0/0 | 4 | no | no |
| AngelInvestorWidget | 127 | 0/0 | 0/0 | 0 | no | no |
| ArchitectWidget | 295 | 0/0 | 0/0 | 0 | no | no |
| BenchmarkWidget | 122 | 0/0 | 0/0 | 1 | no | no |
| CalendarWidget | 281 | 0/0 | 0/0 | 3 | yes | no |
| ChakraErgonomicsWidget | 190 | 1/1 | 0/0 | 0 | no | no |
| ChatCatalystWidget | 123 | 0/0 | 0/0 | 1 | no | no |
| CohortConnectWidget | 304 | 0/0 | 0/0 | 5 | no | no |
| ContextualPromptsWidget | 289 | 1/1 | 0/0 | 2 | yes | no |
| CorporatePlanWidget | 100 | 0/0 | 0/0 | 0 | no | no |
| CorrelatedIndexesWidget | 159 | 0/0 | 0/0 | 1 | no | no |
| CosmicUpdateWidget | 250 | 0/0 | 0/0 | 1 | no | yes |
| DemoDayWidget | 114 | 0/0 | 0/0 | 0 | no | yes |
| EvolutionWidget | 211 | 0/0 | 0/0 | 3 | no | no |
| GoalJourneyWidget | 143 | 0/0 | 0/0 | 1 | no | no |
| IntegrityWidget | 476 | 0/0 | 0/0 | 1 | no | no |
| IntentionsWidget | 296 | 0/0 | 0/0 | 1 | no | no |
| InterfaceEvolutionWidget | 185 | 0/0 | 0/0 | 1 | no | no |
| InterventionsWidget | 97 | 0/0 | 0/0 | 1 | no | no |
| MemoryWidget | 400 | 0/0 | 0/0 | 3 | no | no |
| MicroCalculatorWidget | 208 | 1/1 | 0/0 | 0 | no | no |
| MicroGameWidget | 988 | 1/1 | 1/1 | 0 | no | yes |
| MicroImageWidget | 311 | 0/0 | 0/0 | 1 | no | no |
| MonthlyPulseWidget | 142 | 0/0 | 0/0 | 0 | no | no |
| NarrativeWidget | 219 | 0/0 | 0/0 | 2 | no | no |
| PatternInsightsWidget | 226 | 0/0 | 0/0 | 3 | no | no |
| PatternRecognitionWidget | 561 | 0/0 | 0/0 | 2 | no | no |
| PlannerWidget | 300 | 0/0 | 0/0 | 1 | yes | no |
| QuantumEngineWidgets | 651 | 0/0 | 0/0 | 2 | no | no |
| QuantumRandomWidget | 81 | 2/2 | 0/0 | 3 | no | no |
| QuantumSignWidget | 165 | 0/0 | 0/0 | 1 | no | no |
| QuantumStateWidget | 244 | 0/0 | 0/0 | 2 | no | no |
| RecipeWidget | 345 | 0/0 | 0/0 | 2 | yes | no |
| SignalStreamWidget | 145 | 0/0 | 0/0 | 1 | no | no |
| SubscribeWidget | 41 | 0/0 | 0/0 | 0 | no | no |
| SystemProgressWidget | 2513 | 3/2 | 0/0 | 9 | yes | no |
| SystemPulseWidget | 300 | 1/1 | 0/0 | 2 | no | no |
| TimeWidget | 146 | 1/1 | 1/1 | 0 | no | no |
| UserMetricsWidget | 389 | 0/0 | 0/0 | 6 | no | no |
| EnergyCapacitor | 226 | 0/0 | 0/0 | 2 | no | no |
| EmotionalCheckIn | 404 | 0/0 | 0/0 | 1 | no | no |
| SelfCareMoments | 869 | 0/0 | 0/0 | 4 | yes | yes |
| MoodAnalytics | 235 | 0/0 | 0/0 | 1 | no | no |
| FourDimensionalUI | 130 | 0/0 | 0/0 | 0 | no | yes |
| FlashDriveManifest | 120 | 0/0 | 2/2 | 0 | no | no |

The "Direct Log write" column only detects `useCreateLog`/`/api/logs` in the widget file. Widgets that log through stores or the QIE signal path show "no" and are not unlogged.

Largest files: `SystemProgressWidget` (2,513 lines, mostly an embedded changelog), `MicroGameWidget` (988), `QuantumEngineWidgets` (651), `PatternRecognitionWidget` (561).

### 2.3 Error-boundary granularity
Boundaries wrap groups: "Dashboard" holds 4 widgets and "Biofield Engine" holds 5. One throwing child blanks its whole group, which is how bug #1 would have hidden three healthy widgets. **Recommendation:** one boundary per widget inside the group. Cost: about 20 lines.

### 2.4 LOT® AI, System tab and Portrait
- `/api/me` supplies tags, `memoryEngine` (`ai` or `standard`, gated on Usership tag plus an AI key) and metadata. This is the System tab's AI switch. It works.
- `/api/user-profile` feeds `AIFeedbackWidget`, `UserMetricsWidget` and Settings, and carries the Portrait data.
- `MonthlyPulseWidget` copy refers to "the portrait deepens" (month 4). With fix #2 it now connects to the Portrait timeline.
- `PublicProfile.tsx` has 5 pre-existing type errors. Worth a look next scan.

### 2.5 QIE, Memory and Story
- Memory: `useMemory` attaches `qe/qc/qa/qn` (energy, clarity, alignment, needsSupport) from `getUserState()` to `/api/memory`, so question generation is QIE-aware. Good wiring.
- QIE signal sources are a typed union. Several `recordSignal` callers in `intentionEngine.ts` still pass untyped strings or an `'ecosystem'` source (pre-existing TS errors). They work at runtime but bypass type checks.
- Story: the weekly job writes `lot_ai_story` (whitelisted). The on-demand endpoint writes `generated_story` (api.ts ~5594), which is **neither whitelisted nor rendered** in `Logs.tsx`. Decide whether that is intentional (private) or an omission.
- Other written-but-hidden events: `self_care` (still read by server counters), `system_feedback`, `direct_message_sent`. These look intentional (internal).
- `quantum_intent_signal` has a `Logs.tsx` renderer but is deliberately excluded by the endpoint's own comment ("exclude raw QIE signal events"). Leave as is.

## 3. Widget as data container / data display
Classification from code:
- **Pure display (no persistence):** AngelInvestor, CorporatePlan, DemoDay, FourDimensionalUI, FlashDriveManifest, Architect, Benchmark (read event only), Stats stack.
- **Display plus server data (queries):** UserMetrics, SystemPulse, CorrelatedIndexes, CohortConnect, PatternInsights, MoodAnalytics, QuantumState.
- **Interactive containers (write data):** Memory (answers), Planner (`plan_set`), Recipe (`recipe_viewed`), EmotionalCheckIn, SelfCareMoments, Calendar (`calendar_entry`), Intentions, GoalJourney.
- **Interactive, local only:** Time (format/chime in localStorage), MicroGame, MicroCalculator, MicroImage.

## 4. Proposal: synchronized context posts ("military comms" log)
Not implemented. It needs an owner decision on format, so this is the design only.

- **Trigger:** any interactive widget write (Memory answer, Planner set, Self-care complete, Check-in).
- **Context stamp** (already available client-side): `weather` store (sky, temp), `usersOnline`, local time/ISO week, circadian phase (`getCircadianPhase`), QIE `userState`.
- **Format:** one terse line, e.g. `0614L · WK41 · CLR 11C · ONL 38 · CHK-IN: CALM · ACK.` Metadata keeps the structured fields, `text` keeps the line, and the event type is whitelisted.
- **Monk principle:** one line per action, no commentary, no streaks pushed at the user. LOT® AI only echoes and never nags. Implement via the existing `useLogContext` hook, which already assembles context for Memory, so no new data plumbing is needed.
- **Risk:** weather and online-count stamps are shared state. Keep them opt-in per `hideActivityLogs`.

## 5. 15-month UI reveal
- The reveal is **level-based** (`interfaceEvolution.ts`: level 1–100, chapter 1–4, 5 layout-density steps), not calendar-month-based.
- The only calendar-month mechanism is `MonthlyPulseWidget`. It was dead until fix #2. Its `MONTH_MESSAGES` cover months **1–12**; months 13–15 fall to the generic line.
- **Recommendation:** add messages for months 13, 14 and 15, and map month → minimum `featureUnlockLevel` so each month has a defined build-up step. Needs copy from the owner.
- Month gate: `shouldShowPulse` requires `monthNumber >= 1`, Usership only, once per month via localStorage. Fine.

## 6. Load speed and lag

### 6.1 Measured (production build)
| Item | Size |
|---|---|
| `app.js` | 730 KB (185 KB gzip) |
| `about.js` | 442 KB |
| next chunks | 238, 195, 149 KB |
| total JS | 1.9 MB across 19 files |

### 6.2 Findings
1. **Eager mounting.** `LazyMount` (IntersectionObserver, 200 px margin) exists but wraps **only** `QuantumEngineWidgets`. All other pro-stack widgets mount at load and start their queries, intervals and engine subscriptions. `SystemProgressWidget` alone makes 6 network calls and runs an interval.
2. **No code splitting for widgets.** `React.lazy` is not used anywhere. Every widget is in `app.js`. `SystemProgressWidget` (205 KB source) is mostly static changelog strings. It could be a separate chunk or moved to JSON.
3. **Why I did not wrap more widgets in `LazyMount` this run:** several below-fold widgets emit QIE signals **on mount** (e.g. `recordQOSSignal('report_generated')` in SystemProgress, `recordOSSignal('health_check')` in UserMetrics). Deferring them changes signal counts that the pattern engine reads, so users who never scroll would stop emitting. That is a behavior change to data, not a pure optimization. Decide whether signals should fire on mount or on view first.
4. **LazyMount adjacency caveat.** The placeholder has no height, so consecutive lazy blocks all intersect at once when the first nears the viewport. Give it a `minHeight` prop if it is spread to adjacent sections.
5. `/api/logs` is cached 5 min and capped at 500 rows. The GET also **creates an empty note row** when the top row is not empty, which is a write on a read path. Already guarded, but worth knowing for lag and DB growth.
6. Timers: Time, Chakra, ContextualPrompts, MicroCalculator, QuantumRandom (2), SystemPulse and MicroGame all clear their intervals. MicroGame's loop is gated by `useActiveViewport`.
7. Audio: one shared `AudioContext` pattern exists in Planner and `sound.ts`. `MicroGameWidget` has 36 sound references. I did not find an `AudioContext.close()` path in the game widget. Verify no per-sound context creation on a device.

### 6.3 Lag test protocol (needs a live session)
Not run here. Suggested budget: tap-to-visual under 100 ms, tap-to-sound under 50 ms after first gesture, System tab time-to-interactive under 2 s on a mid phone. Measure with `performance.mark` around button handlers in Memory, Planner, Check-in, Game, Settings sound toggle, then log median and p95.

## 7. Usage data log (all widgets)
There is **no single widget-usage log today.** Usage is spread across Log events, QIE signals (client, localStorage) and badge counters. `easter-eggs.ts` already tracks `widgetTypesToday` (journal, mood, self_care, memory).

**Proposal:** one `widget_use` signal, `{ widget, action, ms_to_interactive, ts }`, emitted from a thin wrapper around `WidgetErrorBoundary` (every widget already passes through one). That gives open counts, interaction counts and mount-time lag for all widgets with about 30 lines and no per-widget edits. Not implemented, because it adds a new event type and storage volume, so it needs sign-off.

## 8. Backlog, ordered
1. One error boundary per widget (2.3). Small, safe.
2. Decide mount-signal policy, then wrap below-fold sections in `LazyMount` (6.2.3).
3. Move `SystemProgressWidget` changelog data out of the main bundle.
4. Months 13–15 copy plus month → unlock mapping (5).
5. `widget_use` wrapper (7).
6. Whitelist/render decision for `generated_story` (2.5).
7. Clear the remaining 127 type errors (36 in `badges.ts`, including duplicate keys `quarter_drop` and `elixir_found`, 11 in `intentionEngine.ts`, 9 in `app.tsx`, 8 in `AdminUser.tsx`).
8. Live lag test (6.3).
