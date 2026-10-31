# LOT® Widget Health Scan — 2026-10-31

Scheduled routine scan. Branch `claude/charming-albattani-qf65y1`. Method: static analysis, `tsc --noEmit`, production client build and bundle measurement. **No live browser or lag run was possible** (no running server, DB or auth in this sandbox), so lag items are marked *not measured* rather than estimated.

## 1. Verdict

| Area | Status |
|---|---|
| Server type-check (`tsconfig.server.json`) | GREEN, 0 errors |
| Client type-check | AMBER, 104 → 97 errors after this push (all pre-existing; esbuild ignores types, so the build passes) |
| Client production build | GREEN, with 2 duplicate-key warnings in `badges.ts` |
| Widget error isolation | GREEN, mounted widgets in `System.tsx` sit in `WidgetErrorBoundary` |
| Timer/listener hygiene | GREEN, no leaked intervals |
| 15-month reveal | **RED → fixed** (see 3.1) |
| Load speed | AMBER, no code splitting |
| Widget usage telemetry | RED, none exists (see 6) |

## 2. Fixed in this push

1. **Monthly Pulse never rendered.** `/api/me` (`useProfileView`) did not return `joinedAt`, so `monthNumber` was always 0 and `MonthlyPulseWidget` never showed. Added `joinedAt` to the profile pick (`src/server/models/user.ts`) and to `UserProfile` (`src/shared/types/index.ts`). The month-1…12 reveal messages should now fire for Usership users.
2. **`UserMetricsWidget` crashed on mount.** It called `classifyPhysiologicalCohort()` with no arguments (signature takes signals, userState and patterns), so `signals.filter` threw. It also read the non-existent fields `.label` and `.dominant`. Now passes the same arguments as `System.tsx`/`SystemPulseWidget` and reads `.archetype` and `.dominantModule`. Before this, the error boundary hid the widget silently.
3. **`MemoryWidget` type.** `useCreateMemory` typed its response as `{response}` while the widget reads `insight`. Added the optional `insight` field. Type-only.

## 3. Findings not fixed (need a decision)

### 3.1 The 15-month build-up is only partly wired
- `MonthlyPulseWidget` messages stop at month 12 (`MONTH_MESSAGES` has keys 1–12), so months 13–15 get only the generic line.
- No central month-to-widget gate exists. Widget visibility comes from the intention engine (`getOptimalWidget`/`shouldShowWidget`) and per-widget conditions, not from account age. A month-by-month reveal schedule would need a single `REVEAL_SCHEDULE: month → widgets[]` consumed by `System.tsx`. Recommended as a follow-up.

### 3.2 Load speed
- No `React.lazy` or `Suspense` anywhere in `src/client`. Every widget ships in `app.js` (730 KB raw, about 185 KB gzip). `about.js` is 441 KB (131 KB gzip). Total `dist/client/js` is 1.9 MB.
- Best lazy-load candidates by size (lines): `SystemProgressWidget` 2513, `MicroGameWidget` 988, `QuantumEngineWidgets` 651, `PatternRecognitionWidget` 561. All are below the fold or user-triggered.
- ~15 widgets each call `useLogs()`. They share one react-query key and `staleTime` is 5 min, so this is one request, not 15. The server caps it at 500 rows, but the comment in `queries.ts` ("no LIMIT") is stale.
- Event filter list in `GET /api/logs` is a hand-maintained allow-list of ~100 event names. Every new QIE event needs an entry or it silently never reaches the client.

### 3.3 Timers and listeners (clean)
- Intervals in 12 components, all paired with cleanup. A grep mismatch in `SystemProgressWidget` was changelog text, not code.
- `stores/layout.ts` has one `addEventListener` with no removal. It is a module-level media-query listener that lives for the app's life, so it is not a leak.
- `MicroGameWidget` pauses its loop off-screen (`useActiveViewport`).

### 3.4 Remaining type errors (97)
Concentrated in `badges.ts` (36), `intentionEngine.ts` (11), `entries/app.tsx` (9), `AdminUser.tsx` (8), plus smaller ones in `Logs.tsx`, `GoalJourneyWidget` (implicit any), `SystemProgressWidget` (`version` field on changelog entries), `QuantumEngineWidgets:472` (`selfcare` vs `selfCare` key; likely a real undefined read), `MicroGameWidget:779` (`'micro_game'` not in the widget-id union), `RecipeWidget:261`, and `System.tsx:624` (`weather.humidity` possibly null).
- **Duplicate keys in `badges.ts`: `quarter_drop` (line 5501) and `elixir_found` (line 6883).** The later entry silently overrides the earlier one. Worth deduplicating.
- Badge types `mastery`, `calendar_easter_egg`, `behavioral` and `ocean_wave` are used but not in the `BadgeType` union.

## 4. Wiring map (what exists today)

- **LOT® AI / System tab:** `System.tsx` composes the widgets; `SystemProgressWidget`, `SystemPulseWidget`, `AIFeedbackWidget`, `UserMetricsWidget` read OS diagnostics, logs and QIE state.
- **Portrait / profile:** `PublicProfile.tsx`, `MemoryWidget` and `GoalJourneyWidget` draw on memory answers and goals. `joinedAt` is now available client-side for tenure displays.
- **Quantum Intent Engine:** `stores/intentionEngine.ts` (signals, patterns, cohorts) feeds `QuantumStateWidget`, `QuantumEngineWidgets`, `SignalStreamWidget`, `CorrelatedIndexesWidget` and `ChakraErgonomicsWidget`.
- **Memory and Story:** `MemoryWidget` calls `/api/memory`; story generation is server-side (`utils/memory/story-generator.ts`).
- **Widgets that post to the Log:** only `CalendarWidget` (`calendar_entry`), `PlannerWidget` (`plan_set`), `RecipeWidget` (`recipe_viewed`), `SelfCareMoments` (`self_care_*`), `ContextualPromptsWidget`, `EmotionalCheckIn` and the Memory answer path. Time, weather and users-online are display-only.

## 5. Proposal: monk-style synchronized context log

Not implemented, since it changes the data model. Sketch:
- On any interactive widget action, write one log line, `event: 'widget_action'`, with `metadata: {widget, action, ctx: {localTime, circadianPhase, weather, usersOnline}}`.
- Render it in the Log as a terse, fixed-format line: `0742Z · CALENDAR · ENTRY ADDED · CLR 12°C · 214 ONLINE`.
- `getCircadianPhase()`, weather (already in `System.tsx`) and users-online are all available client-side, so the context snapshot costs no new requests.
- Add `widget_action` to the `/api/logs` allow-list (see 3.2) or it will not display.

## 6. Widget usage data log

No widget-level usage telemetry exists. The intention engine records signals locally, and logs record only the widgets in §4. Platform-wide usage data therefore can't be produced today. Recommended: the `widget_action` event above, plus an admin aggregate endpoint (count per widget per day, no content) so usage can be reported without exposing user text.

## 7. Not measured (needs a live environment)

Button, sound and control latency, widget load times and Lighthouse/TTI numbers. The `npm run test:cold-start:prod` script exists and should be run against production from a networked machine.

## 8. Recommended next pushes (priority order)

1. Lazy-load the four heavy widgets.
2. Add the `widget_action` log event and its allow-list entry.
3. Add a central `REVEAL_SCHEDULE` for months 1–15.
4. Dedupe badge keys and fix `QuantumEngineWidgets:472`.
5. Burn down the remaining type errors so `tsc` can gate CI.
