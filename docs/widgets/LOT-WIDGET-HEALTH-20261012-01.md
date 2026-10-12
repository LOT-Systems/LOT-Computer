# LOT® Widget Health Scan — 2026-10-12 · Run 01

Scheduled scan · branch `claude/charming-albattani-r80elp` · Method: **static analysis + production build + `tsc`** (no browser/runtime lag test was possible in this sandbox; see §9).

## 0. Verdict

| Area | Status |
|---|---|
| Client production build (esbuild) | GREEN (`app.js` 730 KB min / **184 KB gz**, `about.js` 441 KB / 130 KB gz) |
| `tsc --noEmit` | RED — 104 errors before, **102 after** this run's fixes (none introduced). 36 in `badges.ts`, 11 in `intentionEngine.ts`, 9 in `app.tsx`. esbuild ignores types, so the build is green anyway. |
| Widget mounting | 40/40 widget files are mounted in `System.tsx`; none orphaned |
| Crash isolation | 37 of 40 mounts wrapped in `WidgetErrorBoundary`; `TimeWidget` ×2 and `QuantumRandomWidget` are not |
| Widget usage log | **Did not exist** → added (§6) |
| 15-month reveal | **MonthlyPulse never fired** (broken wiring) → fixed (§3) |

## 1. Fixes pushed in this run

1. **MonthlyPulseWidget never displayed** — it computes month number from `me.joinedAt`, but `User.useProfileView()` (`src/server/models/user.ts`) never returned `joinedAt` and the client `UserProfile` type omitted it, so `monthNumber` was always 0 and `shouldShowPulse` always false. Added `joinedAt` to the profile view and to `UserProfile` (`src/types.ts`). Only caller is the user's own `/api/me`; no cross-user exposure.
2. **Quantum Engine "CARE" dimension rendered blank** — `QuantumEngineWidgets.tsx` read `dimensions.selfcare`; the field is `selfCare`.
3. **Breathe re-rendered System.tsx 10×/s** — `useBreathe` set a new state object every 100 ms even when the text was unchanged (it changes about once per second). The hook lives in the 1000-line `System` component, so the whole System tab re-rendered ten times a second while Breathe was on. Now bails out when unchanged and skips ticks while the tab is hidden.
4. **MicroGame signals typed out** — `recordSignal('micro_game', …)` was outside the `IntentionSignal['source']` union. Added `'micro_game'`.
5. **Widget usage log** (§6).

## 2. Wiring map

`System.tsx` has two layouts. Non-paid accounts get a minimal layout (Time, Memory, Game, Subscribe, no AI). R&D and Usership get the full layout, with density evolving with mastery.

- **LOT® AI / System tab:** Context stack (ContextualPrompts, ChatCatalyst, Interventions), Bioethics stack (ChakraErgonomics, Narrative, GoalJourney, Evolution, InterfaceEvolution), Check-in, Self-care, Intentions, Community (PatternInsights, CohortConnect).
- **Quantum Intent Engine:** `QuantumEngineWidgets` (LazyMount), Biofield stack (QuantumState, PatternRecognition, AIFeedback, SignalStream, Integrity), UserMetrics, CorrelatedIndexes. All read the `intentionEngine` store (6,503 lines). Widgets feed it with `recordSignal(source, signal, meta)`.
- **Memory & Story:** `MemoryWidget` → `/api/memory`, `/api/memory/answer`. Story generation is server-side (`utils/memory/story-generator.ts`).
- **Portrait / personal profile:** `selfAwarenessLevel` on the System tab, `PublicProfile.tsx`, and `/user-profile` (cohort profile after Memory answers).
- **Investor/demo:** AngelInvestor, CorporatePlan, DemoDay.

Gaps found:
- `MemoryWidget` reads `insight` from the answer response, but `useCreateMemory` types the response as `{response: string}`. The server may send `insight`; the contract is undocumented (type error TS2339).
- `intentionEngine.ts` records signals with source `'ecosystem'`, which is not in the union (TS2322, pre-existing, not fixed).
- `UserMetricsWidget` has 3 type errors (`PhysiologicalCohortClassification` has no `label`/`dominant`; a call is missing 3 arguments). It likely shows blanks. Needs an owner decision.
- `app.tsx` reads `profile.metadata`, which is not on the profile view, in 4 places (lines 255–278). These feature gates may silently be off.
- `System.tsx:624` reads `weather.humidity` unguarded (possible null crash, caught only by the app-level boundary).
- `SystemProgressWidget.tsx` (2,513 lines, 33 fetch/api references) is the largest widget and carries changelog data inline; 3 entries have a `version` field outside their declared type.

## 3. 15-month reveal (digital UX routine)

- There is **no month-indexed reveal table** in code. Reveal is gated by `level >= N` in `interfaceEvolution.ts` (e.g. `intentionHistory: level >= 15`, which is a level, not a month).
- Only `MonthlyPulseWidget` is month-based, and its copy table (`MONTH_MESSAGES`) stops at month 12 and caps with `Math.min(monthNumber, 12)`. Months 13–15 get the generic "Month N. The journey continues." line. Writing the month 13/14/15 copy is a content decision for S-2.
- The widget was dead until this run's `joinedAt` fix. The `lot_pulse_<userId>` dismissal key is per user, once per month.

## 4. Data storing

- Client: `localStorage` (nanostores persistent for Time, Recipe, Planner; `lot_pulse_*`; engine signals pruned by a cutoff in `intentionEngine.ts:130`). Server: `/api/logs`, `/api/memory*`.
- `localStorage` is used throughout without a universal try/catch; the new usage log is wrapped.

## 5. Load speed

- All 40 widgets are statically imported by `System.tsx` into `app.js` (730 KB min, 184 KB gz). Only `QuantumEngineWidgets` is deferred, and only its mount (viewport LazyMount), not its code. The one dynamic chunk is `intentionEngine`.
- **Recommendation (not applied, needs a browser to verify):** `React.lazy` + `LazyMount` for below-the-fold, rarely-used widgets (Investor trio, Benchmark, Architect, Calendar, SystemProgress, Integrity, MicroGame). Estimated saving is mostly from `SystemProgressWidget` and `MicroGameWidget` (~3.5 K lines).
- `WidgetErrorBoundary` already records mount time per widget in `window.__LOT_WIDGET_PERF__` and warns above 50 ms.

## 6. Widget usage log (new)

`WidgetErrorBoundary` now persists per-widget `{mounts, crashes, lastMountAt, lastMountMs, maxMountMs}` to `localStorage['lot_widget_usage_v1']`, mirrored to `window.__LOT_WIDGET_USAGE__`, and exported as `getWidgetUsageLog()` from `#client/components/ui`. It is **per-browser only**. Platform-wide logging (all users) needs a server endpoint. Proposed: batch `getWidgetUsageLog()` into `/api/logs` once per session. Not built, since it is a schema decision.

## 7. Timers and lag audit

| Source | Cadence | Hidden-tab pause | Note |
|---|---|---|---|
| `useBreathe` | 100 ms | **added this run** | was re-rendering System 10×/s |
| TimeWidget `checkHour` | 1 s | no (intentional, chime catch-up) | cheap |
| QuantumRandomWidget | 2 intervals | no | verify cost |
| `sound.ts` context | 10 s | no | effect deps include context fields, so the interval is torn down/recreated on each change |
| MicroCalculatorWidget | 10 s | no | |
| Recipe store | 5 min, module-level, never cleared | no | |
| QOS monitor | 30 min | no | singleton-guarded |
| Contextual/Chakra/Pulse/Progress/Toast | various | **yes** | |

Sounds: `sound.ts`, `sovietChime/GameSounds/Keyboard`, `radio.ts`. Not latency-tested.

## 8. LOT® AI / monk-lifestyle / military-comms sync

Not implemented as a feature: no widget posts a synchronized context line (weather + time + users online) to the Log. The ingredients exist (`sun.ts` weather, `Users online` in System, `/api/logs`, `useLogContext`). Suggested format for S-2 approval: `[HH:MM Z] SITREP · sky/temp · N online · widget=<name> · action=<verb>`, written only on user interaction. Not built (product decision on log schema and privacy).

## 9. Not verified

No browser/runtime lag test (buttons, sounds, controls, loading) was run: this needs a running app with a database and a user session. Button/sound latency, real mount times, and the lazy-load savings in §5 are **unmeasured**. `WidgetErrorBoundary` timings plus `utils/perf.ts` (INP observer) are the instruments to read in a real session.

## 10. Next run

1. Decide on months 13–15 copy; confirm MonthlyPulse now shows.
2. Fix `app.tsx` `metadata` gate and `UserMetricsWidget` type errors.
3. Pick widgets to lazy-load and measure in a browser.
4. Approve usage-log server schema and the SITREP format.
