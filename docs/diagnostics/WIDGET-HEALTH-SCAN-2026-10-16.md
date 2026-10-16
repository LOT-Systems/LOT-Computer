# LOT® Widget Health Scan — 2026-10-16

```
CLASS     : ENGINEERING / DIAGNOSTIC (scheduled routine)
BRANCH    : claude/charming-albattani-boadp3
BASE      : 98971f2 (PR #96 merge)
SCOPE     : widget wiring · data storing · LOT® AI / System / Portrait wiring ·
            QIE / Memory / Story wiring · Log sync · 15-month reveal ·
            load speed · lag · usage data log
```

## 0. Verdict

| Area | Status |
|---|---|
| Widget wiring to QIE signal bus | AMBER — 29 components emit QIE signals; ~13 are pure display (by design, §3); 1 invalid signal source fixed |
| Month-to-month reveal (Monthly Pulse) | **RED → FIXED** — widget could never appear (server never sent `joinedAt`) |
| QIE correctness | **RED → FIXED** — `ReferenceError` in Pattern 147 inside `analyzeIntentions()` |
| Load speed | **AMBER → IMPROVED** — initial `app.js` 729,837 → 532,233 B (−27%) |
| Lag / render stability | AMBER → IMPROVED — Intentions flicker removed, 3 off-tab timers paused |
| Widget usage data log | **RED (gap)** — no persisted, platform-wide widget usage log exists (see §7) |
| Type safety | 104 → 98 client `tsc` errors (server: 0 → 0). Remaining 98 are pre-existing, listed in §9 |

Verification actually run: `tsc --noEmit` (client + server), production client build,
and a synthetic Node benchmark of the QIE (§6). **Not run:** a real browser pass
(button/sound latency was reviewed in code, not measured on a device) and anything
against the production DB. No test suite exists in the repo (`package.json` has only
`test:cold-start`, which needs a running server).

## 1. Fixes pushed in this commit

| # | Severity | File | Problem | Fix |
|---|---|---|---|---|
| 1 | High | `src/server/models/user.ts`, `src/shared/types/index.ts` | `GET /api/me` (`useProfileView`) never returned `joinedAt`. `MonthlyPulseWidget` computes `monthNumber` from `user.joinedAt`, so it was always 0 and the widget never rendered for anyone. | Added `joinedAt` to the profile pick and to `UserProfile`. Only the authenticated user receives their own value. |
| 2 | High | `src/client/stores/intentionEngine.ts:3332` | Pattern 147 used an undeclared `dayMs` (the `const dayMs` at :3543 lives in a different function). Once P142 + P137 were both active, `analyzeIntentions()` threw. It runs from a `useEffect` in `System.tsx` on every `logs` change. | Replaced with the literal `24 * 60 * 60 * 1000`. |
| 3 | Medium | `QuantumEngineWidgets.tsx:472` | `userIndex.dimensions.selfcare` is `undefined`; the key is `selfCare`. The CARE row in the index card was blank. | Corrected key. |
| 4 | Medium | `System.tsx` (Intentions block) | Visibility was decided in render and wrote `intentions-last-shown` as a side effect, so the *next* re-render saw a fresh cooldown and unmounted the widget (flicker). The 2–3 day jitter was also re-rolled with `Math.random()` on every render. | Decision latched in a ref once per mount; jitter rolled once. |
| 5 | Medium | `System.tsx` | `SystemProgressWidget` (~180 KB of build-record text) and `ArchitectWidget` shipped in the initial bundle, at the bottom of the tab. | `React.lazy` + `Suspense`, inside the existing `WidgetErrorBoundary`. Mounted as soon as the chunk arrives (not viewport-gated) so `startBackgroundQOSMonitor()` still starts. |
| 6 | Low | `QuantumRandomWidget.tsx`, `MicroCalculatorWidget.tsx` | 1 s countdown, 10 s toggle and 10 s magic-time poll kept running in background tabs. | `document.hidden` guards, matching the existing off-tab doctrine. |
| 7 | Low | `intentionEngine.ts:29` | `MicroGameWidget` emitted source `'micro_game'`, which is not in `IntentionSignal['source']`. | Added to the union. |
| 8 | Feature | `MonthlyPulseWidget.tsx` | Reveal was capped at month 12. | Extended to a 15-month arc (`MAX_REVEAL_MONTH = 15`, messages for months 13–15, label "N / 15 months"). Month 16+ keeps the generic "journey continues" line. |

**Convention note:** `USERSHIP_TRANSMISSION` was deliberately *not* moved out of
`SystemProgressWidget.tsx`. Prior assembly routines append to it there. Instead
`ArchitectWidget` (its only other importer) was lazy-loaded alongside it.

## 2. Widget inventory (46 components scanned)

Columns: `useStore` subscriptions · `setInterval` count · off-tab guard present ·
signal emitters (`recordSignal`-family call sites) · Log writes (`useCreateLog` or `/api/logs`).

| Widget | Lines | Stores | Timers | Off-tab | Signals | Log writes |
|---|---|---|---|---|---|---|
| SystemProgressWidget | 2513 | 2 | 3 | yes | 29 | 1 |
| MicroGameWidget | 988 | 0 | 1 | yes | 2 | 0 |
| SelfCareMoments | 869 | 1 | 0 | – | 2 | 2 |
| QuantumEngineWidgets | 651 | 2 | 0 | – | 8 | 0 |
| PatternRecognitionWidget | 561 | 1 | 0 | – | 1 | 0 |
| IntegrityWidget | 476 | 0 | 0 | – | 0 | 0 |
| EmotionalCheckIn | 404 | 1 | 0 | – | 2 | 0 |
| MemoryWidget | 400 | 1 | 0 | – | 2 | 0 |
| UserMetricsWidget | 379 | 1 | 0 | – | 2 | 0 |
| RecipeWidget | 345 | 3 | 0 | – | 2 | 2 |
| MicroImageWidget | 311 | 0 | 0 | – | 3 | 0 |
| AIFeedbackWidget | 311 | 1 | 0 | – | 0 | 0 |
| CohortConnectWidget | 304 | 1 | 0 | – | 5 | 0 |
| PlannerWidget | 300 | 1 | 0 | – | 2 | 2 |
| SystemPulseWidget | 300 | 1 | 1 | yes | 0 | 0 |
| IntentionsWidget | 296 | 1 | 0 | – | 2 | 0 |
| ArchitectWidget | 295 | 2 | 0 | – | 0 | 0 |
| ContextualPromptsWidget | 289 | 0 | 1 | yes | 3 | 1 |
| CalendarWidget | 281 | 0 | 0 | – | 2 | 3 |
| CosmicUpdateWidget | 250 | 1 | 0 | – | 0 | 0 |
| QuantumStateWidget | 244 | 1 | 0 | – | 0 | 0 |
| MoodAnalytics | 235 | 1 | 0 | – | 0 | 0 |
| EnergyCapacitor | 226 | 0 | 0 | – | 2 | 0 |
| PatternInsightsWidget | 226 | 1 | 0 | – | 4 | 0 |
| NarrativeWidget | 219 | 1 | 0 | – | 2 | 0 |
| EvolutionWidget | 211 | 1 | 0 | – | 0 | 0 |
| MicroCalculatorWidget | 208 | 0 | 1 | now yes | 3 | 0 |
| ChakraErgonomicsWidget | 190 | 1 | 1 | yes | 2 | 0 |
| InterfaceEvolutionWidget | 185 | 3 | 0 | – | 0 | 0 |
| QuantumSignWidget | 165 | 1 | 0 | – | 0 | 0 |
| CorrelatedIndexesWidget | 159 | 0 | 0 | – | 0 | 0 |
| MonthlyPulseWidget | 148 | 1 | 0 | – | 0 | 0 |
| TimeWidget | 146 | 2 | 1 | own visibility handler | 0 | 0 |
| SignalStreamWidget | 145 | 1 | 0 | – | 0 | 0 |
| GoalJourneyWidget | 143 | 0 | 0 | – | 2 | 0 |
| AngelInvestorWidget | 127 | 0 | 0 | – | 0 | 0 |
| ChatCatalystWidget | 123 | 1 | 0 | – | 2 | 0 |
| BenchmarkWidget | 122 | 0 | 0 | – | 0 | 0 |
| FlashDriveManifest | 120 | 1 | 0 | – | 0 | 0 |
| EvolutionMilestoneToast | 125 | 1 | 1 | yes | 0 | 0 |
| DemoDayWidget | 114 | 0 | 0 | – | 0 | 0 |
| CorporatePlanWidget | 100 | 0 | 0 | – | 0 | 0 |
| InterventionsWidget | 97 | 0 | 0 | – | 2 | 0 |
| QuantumRandomWidget | 81 | 0 | 2 | now yes | 2 | 0 |
| JournalReflection | 80 | 0 | 0 | – | 2 | 0 |
| SubscribeWidget | 41 | 0 | 0 | – | 0 | 0 |

Widgets in `System.tsx` are wrapped in `WidgetErrorBoundary` (a few inline blocks, e.g. the
Time/weather rows, are not). Of the 39 `*Widget*` files, only 1 uses `React.memo` — see §6.

## 3. Data container vs. data display

| Class | Widgets | Persistence |
|---|---|---|
| **Container** (writes durable data) | Memory (`/api/memory/answer`), Planner (`plan_set`), Recipe, SelfCareMoments (`self_care_*`), Calendar (`calendar_entry`), EmotionalCheckIn, ContextualPrompts, journal/Log tab | Server `logs` table via `/api/logs` |
| **Container, device-local** | Intentions, SelfCare cooldowns, MonthlyPulse dismiss, Time/Mirror/Sound/Radio/Temp prefs | `localStorage` |
| **QIE signal emitters** | 29 components → `recordSignal()` | `intentionEngine` store, **7-day retention, 1000-signal cap, client only** |
| **Pure display** | AngelInvestor, CorporatePlan, DemoDay, CorrelatedIndexes, CosmicUpdate, Subscribe, Benchmark, FlashDriveManifest, IntegrityWidget, SignalStream, QuantumState, Evolution, InterfaceEvolution | derived from logs/stores |

Signal volume by QIE source across all call sites: energy 26 · intentions 24 ·
selfcare 15 · journal 13 · qos 12 · mood 11 · planner 7 · log 7 · memory 6 ·
cohort 5 · calculator 3 · recipe 2 · goals 2 · badges 2 · resilience 1 ·
astrology 1 · micro_game 1.

## 4. Wiring: LOT® AI, System tab, Portrait

- **System tab → AI:** `System.tsx` reads `useLogs()` and `useProfile()`; on each `logs`
  change an effect runs `analyzeIntentions()` → `recomputeAssembly()` → `getUserState()`.
  This path is healthy and rate-limited (5 min analysis cooldown). Fix #2 removes the one
  known throw in it.
- **Portrait (`PublicProfile.tsx`) → profile API:** five properties are read that the
  response type does not declare (`version` :369, `streak` :404/:407, `patternStrengthIndex`
  :448 — server field is `patternStrength`). `patternStrengthIndex` likely renders blank.
  *Not changed:* needs a decision on the intended field name from the server side.
- **MemoryWidget:** `onSuccess` destructures `insight` from `{ response: string }`
  (`MemoryWidget.tsx:65`). If the server returns `insight`, the type should say so; if it
  does not, the branch is dead. *Not changed — needs a look at `/api/memory/answer`.*
- **Memory → Story:** Story generation (`story-generator.ts`) reads `joinedAt` server-side
  and is unaffected by fix #1.

## 5. LOT® Quantum Intent Engine wiring

- Signals are a **client-only** ring buffer. Nothing in the signal bus is sent to the server,
  so QIE state is per-device.
- `LOG_DEPENDENCY_SOURCES` includes `'ecosystem'`, which is not in the
  `IntentionSignal['source']` union (`intentionEngine.ts:4075`) — type error, harmless at
  runtime, but no widget emits it.
- `suggestedTiming: 'active'` (`:2223`, `:2240`) is outside the declared timing union.
  Any consumer switching on timing will fall through for those two patterns.
- Pattern 147 `ReferenceError` fixed (§1 #2).

## 6. Load speed and lag

**Bundle (production esbuild, same config as `yarn client:build`):**

| | Before | After |
|---|---|---|
| `app.js` | 729,837 B | 532,233 B (−197,604 B, −27.1%) |
| New lazy chunk | – | `SystemProgressWidget` + `ArchitectWidget` (~182 KB) |

Largest remaining modules in the app entry (minified bytes): `badges.ts` 212 KB ·
`Logs.tsx` 123 KB · `easter-eggs.ts` 24 KB · `SelfCareMoments` 22 KB ·
`QuantumEngineWidgets` 20 KB · `PatternRecognitionWidget` 18 KB.
**Next candidates:** `Logs.tsx` (route-level split; note it deliberately stays mounted,
so needs a keep-alive decision) and `badges.ts` (5 importers; a lazy `checkAndAwardBadges`
call site would remove ~200 KB).

**Synthetic QIE benchmark** (Node 22, desktop CPU, random signals, `analyzeIntentions` with
cooldown bypassed): 

| Signals | analyzeIntentions (cold) | recomputeAssembly |
|---|---|---|
| 100 | 1.97 ms | 0.70 ms |
| 500 | 5.33 ms | 2.33 ms |
| 1000 (cap) | 9.41 ms | 4.82 ms |

Worst case is ~14 ms per logs change on desktop; expect roughly 4–6× on a mid-range phone.
No QIE-induced lag found. `getUserState`/`getUserIndex`/`getOptimalWidget` are < 0.05 ms.

**Render/lag findings:**
- Fixed: Intentions flicker (§1 #4); three always-on timers now pause off-tab.
- Open: `QuantumRandomWidget` calls `recordSignal()` inside a `setRemaining` updater
  (impure; double-fires under StrictMode dev).
- Open: 38 of 39 `*Widget*` files are not `React.memo`'d and `System` re-renders on every
  `logs`/`weather`/store change. Cheap win: wrap the top 10 by size.
- Open: the non-paid and pro layouts both mount `SubscribeWidget`; in the pro layout the
  Subscribe block is unreachable (it returns early for any R&D/Usership user) and also
  uses `Math.random() < 0.2` in render, which would flicker if it were ever reachable.
- `useLogs` stale time is 5 min. Seven stats queries poll every 120 s with
  `refetchIntervalInBackground: false`.

**Buttons, sounds, controls (code review only, not device-measured):**
- `Block` click handling walks the DOM tree per click (`Block.tsx:64–80`): O(depth), cheap.
- Sound toggle has a 300 ms re-entry lock (`isSoundToggling`) — good against double-fire,
  but it also swallows a legitimate second tap inside 300 ms.
- `useSound` creates the `AudioContext` in an effect after enabling, then resumes it in a
  second effect. On iOS the resume must originate from a user gesture; if the toggle is
  restored from `localStorage` at load, audio will stay suspended until the first tap.
  *Worth a device test.*
- `useSound` logs 4–6 `console.log` lines per context change; harmless but noisy in prod.

## 7. Data log of widget usage — gap

There is **no platform-wide, persisted widget-usage log.** What exists:

1. Server `logs` rows for ~8 container widgets (§3).
2. The client-only QIE ring buffer (7 days, 1000 signals, per device).
3. `getWidgetsDependingOn()` / `getLogDependencySummary()` — static dependency maps.

So "which widgets are used how often across all users" cannot be answered from data today.
**Recommendation (not built — needs your call on privacy scope):**
a `widget_events` table (`userId`, `widget`, `action`, `createdAt`, no free text) fed by a
single `trackWidget(name, action)` helper, rate-limited client-side and batched through the
existing `/api/logs` pipeline with `event: 'widget_usage'`. Aggregate only; no content.
This fits the "pure and transparent" principle: the user could view their own usage in the
Portrait.

## 8. LOT® AI as a monk-lifestyle companion · Log sync in military-comms form

Review of what already supports this, and the smallest additions I'd suggest:

- **Already there:** Recipe/fasting degradation on Christian fasting days, SelfCare windows
  (10–12, 14–17, 19–22), Breathe, hourly chime, Calendar T-minus alerts, QIE "directive" in
  the Biofield table.
- **Context sync → Log:** weather, time and users-online are shown in System but never
  written to the Log. A single daily **SITREP** line (`event: 'sitrep'`, format
  `0600Z · CLR 12°C · 31 ONLINE · MOON WANING · STATUS NOMINAL`) written once per local
  morning would give the Log a transparent, comparable ambient record, and give Memory and
  Story a stable anchor. *Proposed, not implemented.*
- **Interactive widgets** (Planner, Intentions, SelfCare, Check-in) already emit signals;
  attaching the same ambient snapshot to their `metadata` is a one-line change each.

## 9. Fifteen-month reveal audit

- Existing progression is **maturity-based, not calendar-based**: `featureUnlockLevel`
  (0–5, from exploration + maturity), `$layoutDensity` (5 levels), Evolution gates on six widgets.
- The only calendar-based element was Monthly Pulse (months 1–12) — and it was dead (§1 #1).
  It is now live and runs months 1–15.
- Not yet tied to months: widget unlock order. Suggested schedule, using what already
  exists, for S-2 to confirm before wiring:

| Month | Reveal |
|---|---|
| 1 | Time, Memory, Recipe, Mirror/Sound/Breathe |
| 2 | Planner, Intentions, SelfCare |
| 3 | Check-in, Mood analytics (Active User) |
| 4 | Portrait deepens: Narrative, GoalJourney |
| 5 | Chakra/Biofield capacitor |
| 6 | Pattern Insights, Cohort Connect |
| 7–8 | Quantum Engine widgets, Signal stream |
| 9 | Integrity, Pattern Recognition |
| 10–11 | Correlated indexes, Interface Evolution |
| 12 | Architect + System Progress |
| 13–15 | Full arc: Calendar, Benchmark, investor stack; Monthly Pulse closes at 15 |

## 10. Remaining `tsc` errors (98, pre-existing)

Mostly `utils/badges.ts` (category literals `'mastery'`, `'calendar_easter_egg'`,
`'behavioral'` missing from the category union; `'ocean_wave'` missing from `BadgeType`)
plus `AdminUser(s)`, `Logs.tsx`, `PublicProfile.tsx`, `GoalJourneyWidget`,
`EmotionalCheckIn`. **One is behavioural:** `badges.ts` defines `elixir_found` twice
(lines 4825 and 6883); the later definition silently wins. The build succeeds because
esbuild does not typecheck. Not touched — badge content/category changes belong to the
badge-codex routine.

## 11. Follow-ups for S-2

1. Confirm the month-to-widget schedule (§9) before it is wired.
2. Approve (or reshape) the `widget_events` usage log (§7) and the daily SITREP line (§8).
3. Decide the `patternStrengthIndex` vs `patternStrength` and `insight` contract mismatches (§4).
4. Test sound resume on a real iPhone (§6).
5. Next speed pass: split `Logs.tsx` and `badges.ts`.
