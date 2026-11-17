# LOT® Widget Health Scan — 2026-11-17

```
SITREP  // WIDGET-HEALTH // 2026-11-17 // ROUTINE (scheduled)
BRANCH  claude/charming-albattani-14ts4m   BASE 98971f2 (master, PR #96)
STATUS  BUILD GREEN · 4 RUNTIME DEFECTS FIXED · 1 PERF FIX · 9 ADVISORIES OPEN
```

## 0. BLUF

1. **The LOT® Quantum Intent Engine pattern recognizer had been down since QIE v112 (commit `1846b80`, 2026-08-03).** `analyzeIntentions()` threw `ReferenceError: dayMs is not defined` at Pattern 147 on every call. So no patterns were committed, `lastAnalysis` was never set, and the 5-minute cooldown never applied: every signal re-ran about 26 ms of analysis and then threw. Widgets that read `recognizedPatterns` (Pattern Recognition, Quantum Engine, System Pulse, Integrity, the optimal-widget picker) showed stale or empty data. **FIXED.**
2. **The CQGS Dashboard stack on the System tab crashed on every render.** `UserMetricsWidget` called `classifyPhysiologicalCohort()` with no arguments, which throws `TypeError: … reading 'filter'`. The `Dashboard` error boundary then hid **User Metrics, Correlated Indexes and System Progress** together. **FIXED.**
3. **The Monthly Pulse widget, the month-to-month reveal, never showed for any user.** It reads `user.joinedAt`, but `/api/me` (`useProfileView`) did not include that field. **FIXED**, and the arc now runs 15 months (it was capped at 12).
4. **The Quantum Engine "CARE" dimension always rendered blank** because of a typo, `selfcare` instead of `selfCare`. **FIXED.**
5. **Sound lag:** four UI sound modules each created their own `AudioContext`. They now share one context. **FIXED.**

## 1. Verification

| Check | Before | After |
|---|---|---|
| `yarn build` (client + server) | green | **green** |
| `tsc --noEmit` errors (repo-wide, pre-existing debt) | 104 | **95** (no new errors; none left in touched files) |
| `analyzeIntentions()` on 1,000 seeded signals | `ReferenceError: dayMs` | **26.3 ms cold → 40 patterns; 0.01 ms in cooldown** |
| `classifyPhysiologicalCohort()` as UserMetrics called it | `TypeError` | **0.08 ms with correct args** |

The QIE benchmark is a Node harness that bundles `src/client/stores/intentionEngine.ts` with esbuild, shims `localStorage`, and seeds 1,000 signals across 15 sources. The pre-fix numbers come from reverting only the one-line `dayMs` fix and running the same harness.

## 2. Widget inventory & wiring matrix

There are 44 widget or data components. "Signals" means the source the widget writes to `recordSignal`. "Log" means the widget posts entries to the Log.

| Widget | Role | QIE signal | Log post | Local storage | Notes |
|---|---|---|---|---|---|
| Time | display | — | — | — | 1 interval, cleaned up |
| QuantumRandom | interactive | calculator | — | — | 2 intervals, cleaned up |
| Memory | container (Memory) | dynamic source | — | guarded | wired to `/api/memory/answer` |
| MicroGame | interactive | `micro_game` | — | — | viewport-gated loop; `micro_game` added to the source union |
| Subscribe | display | — | — | **unguarded** | |
| MonthlyPulse | display (reveal) | — | — | guarded | **was dead** → fixed |
| Recipe | container | selfcare | ✔ | — | |
| Planner | container | planner | ✔ | — | shared audio now |
| Calendar | container | — | ✔ | — | no QIE signal |
| SelfCareMoments | container | selfcare | ✔ | partly guarded | sounds |
| Intentions | container | intentions | — | partly guarded | |
| GoalJourney / Narrative / Evolution / InterfaceEvolution | Story displays | intentions / journal / — | — | — | |
| ContextualPrompts / ChatCatalyst / Interventions | LOT® AI prompts | mood / journal / mood | 1 / — / — | — | |
| ChakraErgonomics / EnergyCapacitor | display | selfcare | — | — | |
| QuantumState / SignalStream / PatternRecognition / PatternInsights | QIE displays | — / — / — / intentions, memory, mood | — | — | read `recognizedPatterns`; were empty before fix #1 |
| QuantumEngineWidgets | QIE display | intentions | — | guarded | CARE typo fixed |
| SystemPulse | QIE display | — | — | — | |
| UserMetrics | display | `health_check` (OS) | — | — | **crashed** → fixed |
| CorrelatedIndexes / SystemProgress | display | — / `report_generated` | — | — | were hidden by the UserMetrics crash |
| AIFeedback / Integrity / Benchmark / Architect / CohortConnect | display / AI | — / — / — / — / mood | — | — | |
| CosmicUpdate / MicroImage | LOT® AI image | — / intentions | — | — | |
| AngelInvestor / CorporatePlan / DemoDay / FourDimensionalUI / InvestmentSwitch | investor mode | — | — | **unguarded** | |
| JournalReflection | — | journal | — | — | **ORPHAN: not mounted anywhere** |

### Wiring to LOT® AI, the System tab and Portrait
- **System tab:** every widget except `JournalReflection` is mounted in `System.tsx`, and each group sits inside a `WidgetErrorBoundary`. Grouping saves markup, but one bad widget hides its whole group, as the Dashboard crash showed. **Advisory A1:** give each widget in the Dashboard and Bioethics stacks its own boundary.
- **Portrait (`PublicProfile`):** no runtime breakage. The server sends `version`, `streak` and `patternStrengthIndex`, but the client type for `psychologicalProfile` doesn't declare them (5 type errors). **A2:** add them to the type.
- **LOT® AI:** CosmicUpdate, MicroImage and ContextualPrompts call generation endpoints. No defects found.

### Wiring to QIE, Memory and Story
- QIE now works end to end again (fix #1).
- **Memory Story:** `useMyMemoryStory()` (`/api/memory/story`) has **no consumer**. A user's own Memory Story only appears on the admin page (`useUserMemoryStory`). **A3:** decide whether a Story display should show it on the System tab or the Portrait.
- `MemoryWidget` reads `insight` from the `/api/memory/answer` response, but the mutation is typed `{ response }`. This is type drift only. **A4.**

## 3. The 15-month reveal (Digital UX routine)

- Before: dead in production (no `joinedAt` in the profile payload), and capped at month 12. Months 13 and later showed a "Month 12" label and "12 / 12".
- After: `joinedAt` is in the `/api/me` profile view. The arc runs `REVEAL_MONTHS = 15`, with messages for months 13–15 in the existing terse voice. The label shows the true month number.
- Month 13: *"The practice keeps itself now."* Month 14: *"Fewer words, clearer signal."* Month 15: *"The full interface is yours. Keep it quiet."*
- **A5:** the reveal is still only a notice. No widget is actually gated by tenure. Gating could hang off the same `joinedAt` month index; this needs a decision from the product owner.

## 4. Context sync & military-format Log ("self-care sitrep")

- Today only 5 widgets post to the Log: Calendar, Planner, Recipe, SelfCareMoments and ContextualPrompts. None of them attach the synced context (weather, local time, users online), even though `System.tsx` already holds all three values.
- **A6 (proposal, not built):** a single `postSitrep(widget, action, ctx)` helper that writes one line per interaction, for example
  `0712L // SELFCARE // BREATH x4 COMPLETE // WX 12°C CLR // 37 ONLINE`.
  Every interactive widget could call it, which makes the Log a transparent, append-only record of practice. That supports the monk / pure-lifestyle principle: one ledger and no hidden state. It needs a design call on Log noise before it gets built.

## 5. Load speed (app.js bundle)

`app.js`: 716 KB minified, **185 KB gzip**. `about.js`: 431 KB / 131 KB gzip.

| Module in app.js | Size |
|---|---|
| `utils/badges.ts` | 207 KB |
| `components/SystemProgressWidget.tsx` (mostly changelog strings) | 177 KB |
| react-dom | 127 KB |
| `components/Logs.tsx` | 120 KB |
| all other first-party widgets | under 25 KB each |

- **A7:** lazy-load `SystemProgressWidget` (saves about 177 KB of initial parse). This first needs `USERSHIP_TRANSMISSION` moved out of the file, because `ArchitectWidget` imports it.
- **A8:** split the badge catalogue (`badges.ts`) into a lazily loaded data chunk. It also has **two duplicate keys** (`quarter_drop`, `elixir_found`), so the later definition silently replaces the earlier one. These keys weren't touched because they may match badges users have already earned.

## 6. Lag test

| Path | Result |
|---|---|
| Button press → `recordSignal` | **1.55 ms** per call (50 runs) |
| Deferred `analyzeIntentions` after a signal | **26 ms cold, then cooldown.** Before the fix, it repeated about 26 ms on every signal and then threw. |
| `getOptimalWidget` / `getUserIndex` / `getUserState` | 0.02 ms or less |
| Sounds | 4 separate `AudioContext`s merged into one (`utils/audioContext.ts`): chime, keyboard, game SFX, planner. `utils/sound.ts` (ambient engine) is left on its own context on purpose. |
| Intervals | every widget `setInterval` has a matching cleanup. MicroGame and SystemProgress pause when off-screen. |

- **A9:** the following read `localStorage` during render without `try/catch`: Subscribe, AngelInvestor, CorporatePlan, DemoDay, FourDimensionalUI, InvestmentSwitch and EvolutionMilestoneToast. In Safari private mode or with storage blocked, reads can throw and fall back to the error boundary.
- Not done this run: a full in-browser timing of buttons and loading. It needs a seeded Postgres and an auth session, which aren't available in this container. A Playwright harness seeded through `/api/sync` is the next step.

## 7. Widget usage data log

There is no per-widget usage telemetry across the platform today. The usage data that exists lives in each browser's QIE signal store, plus the Log rows of the 5 widgets that post. `WidgetErrorBoundary` already exposes `window.__LOT_WIDGET_PERF__` render timings on the client, but nothing collects them. The source map in §2 is the starting inventory. A server-side aggregate over the signal and Log source columns would give the platform-wide usage log; it needs a decision on whether to collect it at all, given the privacy and transparency doctrine.

## 8. Change list (this push)

| File | Change |
|---|---|
| `src/client/stores/intentionEngine.ts` | define the missing `dayMs` for P147 (local `dayMs147`); add `micro_game` to the signal-source union |
| `src/client/components/UserMetricsWidget.tsx` | pass `(signals, userState, patterns)`; use `.archetype` / `.dominantModule` |
| `src/client/components/QuantumEngineWidgets.tsx` | `selfcare` → `selfCare` |
| `src/server/models/user.ts`, `src/shared/types/index.ts` | expose `joinedAt` in the profile view and `UserProfile` |
| `src/client/components/MonthlyPulseWidget.tsx` | 15-month arc and true month label |
| `src/client/utils/audioContext.ts` (new) + `sovietChime`, `sovietKeyboard`, `sovietGameSounds`, `stores/plannerWidget` | shared `AudioContext` |

```
END SITREP // NEXT SCAN: A1 per-widget boundaries · A7 lazy SystemProgress · A9 storage guards · browser lag harness
```
