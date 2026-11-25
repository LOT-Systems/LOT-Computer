# LOT® WIDGET HEALTH SCAN — 2026-11-25

```
REPORT ID   LOT-WHS-20261125-01
TYPE        Scheduled routine · widget wiring / UI / lag scan
BRANCH      claude/charming-albattani-ayrvlj
BASE        9f2b88c (Badge Codex v33)
STATUS      GREEN BUILD · 2 CRITICAL FIXED · 3 HIGH FIXED · 1 PERF WIN SHIPPED
```

---

## 0 · SITREP (read this first)

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| 1 | **CRITICAL** | `analyzeIntentions()` threw `ReferenceError: dayMs is not defined` on every run for any user with ≥1 signal (since QIE v112, commit `1846b80`, 2026-08-03). Patterns, userState and userIndex never committed, and `lastAnalysis` never advanced, so the 5-min cooldown never engaged: every caller re-ran the full scan and threw. The `System.tsx` effect calls it unguarded, and React passes effect errors up to the nearest boundary. Here that is the app-level `AppErrorBoundary`; not reproduced in a browser this run. | **FIXED**, verified in harness |
| 2 | **CRITICAL** | `UserMetricsWidget` called `classifyPhysiologicalCohort()` with **no arguments** (since `9364aba`) and threw `Cannot read properties of undefined (reading 'filter')` on every render. The `Dashboard` boundary then showed "Dashboard: Failed to load" in place of **UserMetrics + CorrelatedIndexes + SystemProgress + SystemPulse**. It also read `.label` and `.dominant`, which do not exist (correct names: `.archetype` and `.dominantModule`). | **FIXED**, verified in harness |
| 3 | HIGH | **Signal flood:** `QuantumRandomWidget` recorded a `calculator/quantum_random` QIE signal on *every automatic re-roll* (×2 hooks, mean 22.6 s), about 300 signals/hour, including while the tab was hidden. With `MAX_SIGNALS = 1000`, an open tab pushed the user's whole real history (moods, memories, journal) out of the buffer in about 3 h. That broke 30-day patterns and made `calculator` the "dominant module". | **FIXED**: ≤1 signal / 30 min, ticks paused off-tab |
| 4 | HIGH | **Month-to-month reveal was dead:** `MonthlyPulseWidget` reads `me.joinedAt`, but `/api/me` never sent it (`useProfileView()` whitelist). So `monthNumber` was always 0 and the pulse never showed for anyone. | **FIXED**: `/api/me` now returns `joinedAt` |
| 5 | HIGH | **Intentions widget vanished on re-render:** visibility was computed in an IIFE *during render*, and the same render wrote `intentions-last-shown = now`. The next unrelated re-render (users-online tick, weather) saw "cooldown not passed" and unmounted the widget. | **FIXED**: rolled once per mount, stamp moved to an effect |
| 6 | MED | QIE dashboard `CARE` dimension was always blank (`dimensions.selfcare` instead of `selfCare`). | **FIXED** |
| 7 | PERF | `app.js` shipped SystemProgressWidget's ~177 KB changelog text on first load. | **FIXED**: code-split, **app.js 730 KB → 532 KB (−27 %), gzip 184.6 KB → 133.0 KB (−28 %)** |
| 8 | PERF | 7 below-fold stacks (Investor, Biofield Engine, Dashboard, Architect, Stats, Calendar, Benchmark: about 20 widgets) mounted eagerly on every System-tab entry. The tab is `unmountWhenInactive`, so this happened on every tab switch. | **FIXED**: wrapped in the existing `LazyMount` (IntersectionObserver, 200 px margin) |

---

## 1 · Changes in this push

| File | Change |
|------|--------|
| `src/client/stores/intentionEngine.ts` | P147: `now - s.timestamp < dayMs` → `s.timestamp > dayAgo` (uses the in-scope 24 h bound). |
| `src/client/components/UserMetricsWidget.tsx` | `classifyPhysiologicalCohort(signals, userState, recognizedPatterns)`; `.label`→`.archetype`, `.dominant`→`.dominantModule`. |
| `src/client/components/QuantumRandomWidget.tsx` | Signal throttle (30 min, module-scoped); both intervals skip when `document.hidden` or the route isn't `system`. |
| `src/server/routes/api.ts` | `GET /api/me` adds `joinedAt`. |
| `src/shared/types/index.ts` | `UserProfile` gains optional `joinedAt` and `metadata` (both already sent by `/api/me`). |
| `src/client/queries.ts` | `useCreateMemory` response type adds `insight?` (server already sends it). |
| `src/client/components/QuantumEngineWidgets.tsx` | `selfcare` → `selfCare`. |
| `src/client/components/System.tsx` | Intentions visibility moved out of render. `React.lazy` for SystemProgressWidget and ArchitectWidget. `LazyMount` on 7 below-fold stacks. `humidity` null-safe. |

### Verification

```
yarn build                         ✓ client + server green (6.3 s)
tsc -p tsconfig.server.json        ✓ 0 errors
tsc -p tsconfig.json (client)      52 non-badge errors (was 68), all pre-existing type drift
                                   + 36 pre-existing errors in utils/badges.ts (Codex v33 types)
QIE harness, 2 signals             before: THROW ReferenceError dayMs → after: OK, lastAnalysis set
Cohort harness                     before: THROW reading 'filter'    → after: "Anxious Explorer / mood"
```

---

## 2 · Widget wiring matrix

Static scan of every widget mounted from `System.tsx`. Columns are reference counts per file.
**QIE** = intentionEngine / `record*Signal`. **API** = react-query/fetch. **LOG** = writes to the Log.
**LS** = localStorage. **T** = timers.

| Widget | QIE | API | AI | Memory | Story | LOG | LS | T | Role |
|---|---|---|---|---|---|---|---|---|---|
| TimeWidget | – | – | – | – | – | – | – | 1 | display (time, hourly chime) |
| QuantumRandomWidget | ✓ | – | – | – | – | – | – | 2 | display (**fixed flood**) |
| MonthlyPulseWidget | – | – | – | – | – | – | ✓ | 3 | display (**fixed: was never shown**) |
| RecipeWidget | ✓ | ✓ | ✓ | – | – | ✓ | – | 4 | container + Log writer |
| MemoryWidget | ✓ | ✓ | – | ✓✓ | ✓ | ✓ | ✓ | 13 | container (Memory engine) |
| ContextualPromptsWidget | ✓ | ✓ | – | ✓ | ✓ | ✓ | – | 1 | display (QIE-driven) |
| ChatCatalystWidget | ✓ | ✓ | – | – | ✓ | – | – | – | display |
| InterventionsWidget | ✓ | ✓ | – | – | ✓ | – | – | – | display |
| EnergyCapacitor | ✓ | ✓ | – | ✓ | ✓ | – | – | – | display |
| ChakraErgonomicsWidget | ✓ | – | – | – | – | – | – | 1 | display (off-tab gated ✓) |
| NarrativeWidget | ✓ | ✓ | – | – | ✓✓ | – | – | – | display (**Story**) |
| GoalJourneyWidget | ✓ | ✓ | – | – | ✓✓ | – | – | – | display (**Story**) |
| EvolutionWidget | – | ✓ | – | ✓ | ✓ | – | – | – | display |
| InterfaceEvolutionWidget | – | ✓ | – | ✓ | ✓ | – | – | – | display (unlock map) |
| EmotionalCheckIn | ✓ | ✓ | ✓ | – | ✓ | ✓ | – | 4 | container + Log writer |
| SelfCareMoments | ✓ | ✓ | ✓ | – | ✓ | ✓ | ✓ | 4 | container + Log writer |
| IntentionsWidget | ✓ | ✓ | – | – | ✓ | ✓ | ✓ | – | container (**fixed vanish**) |
| PatternInsightsWidget | ✓ | ✓ | – | ✓ | – | – | – | – | display (unlock-gated) |
| MoodAnalytics | – | ✓ | – | – | – | – | – | – | display (unlock-gated) |
| CohortConnectWidget | ✓ | ✓ | – | – | – | ✓ | – | – | container (social) |
| PlannerWidget | ✓ | ✓ | – | – | ✓ | ✓ | – | 3 | container + Log writer |
| MicroCalculatorWidget | ✓ | – | – | – | – | – | – | 2 | interactive (not off-tab gated) |
| MicroGameWidget | ✓ | – | – | – | – | – | – | 1 | interactive (viewport gated ✓, sound) |
| MicroImageWidget | ✓ | ✓ | ✓ | – | – | – | – | – | interactive (see §5 M-2) |
| CosmicUpdateWidget | – | ✓ | ✓✓ | – | – | – | – | – | AI image token |
| QuantumSignWidget | – | ✓ | ✓ | ✓ | – | – | ✓ | – | display |
| QuantumEngineWidgets | ✓✓ | ✓ | – | ✓ | ✓ | ✓✓ | ✓ | – | QIE console (lazy ✓, **fixed CARE**) |
| QuantumStateWidget / PatternRecognition / AIFeedback / SignalStream / Integrity | ✓ | ✓ | ✓ (AIFeedback) | ✓ | ✓ | ✓ (PatternRecog) | – | – | Biofield engine (**now lazy**) |
| UserMetrics / CorrelatedIndexes / SystemProgress / SystemPulse | ✓ | ✓ | ✓ (SP) | ✓ | ✓ | ✓ | – | ✓ | Dashboard (**fixed crash, now lazy + split**) |
| ArchitectWidget | ✓ | – | – | – | ✓ | ✓ | – | – | telemetry (**now lazy + split**) |
| stats/* (6) | – | ✓ | ✓ (MemoryEngineStats) | ✓ | – | – | – | ✓ | display (**now lazy**) |
| CalendarWidget | ✓ | ✓ | – | – | – | ✓ | – | – | container + Log writer (**now lazy**) |
| BenchmarkWidget | ✓ | ✓ | – | – | – | – | – | – | display (**now lazy**) |

### 2.1 · LOT® AI ↔ System tab ↔ Portrait

* **System tab → AI.** Memory (`/api/memory`, `/api/memory/answer`, AI when `memoryEngine === 'ai'`), CosmicUpdate (Together AI image), AIFeedback, MicroImage and SelfCare/EmotionalCheckIn all reach AI routes. They are wired.
* **Portrait (`PublicProfile.tsx`).** It reads `psychologicalProfile.version / streak / patternStrengthIndex / memoryStory`. The server **does send all of these** (`public-api.ts` L1150–1176, L1071–1082). The 5 client type errors are stale typing only. There is no runtime fault.
* **System tab "My OS visitors".** It reads `me.metadata.profileVisits`. `/api/me` sends `metadata`, so it is wired. It is now typed as well.
* **Psychology view** (`Astrology → Psychology → Journey → Biofield` cycle) reads `useProfile()` archetype, coreValues and cohort. This is wired, and its Biofield table depended on fix #1 to show live data.

### 2.2 · QIE ↔ Memory ↔ Story

* Memory answers → `recordSignal('memory', …)` → QIE. MemoryWidget wraps `analyzeIntentions()` in `try`, so it survived bug #1. `System.tsx` and SystemProgressWidget did not.
* **Story.** NarrativeWidget and GoalJourneyWidget read QIE-derived narrative/goal state. The server persists `lastMemoryStory` (versioned) for Portrait.
* **Effect of bug #1 on this chain.** Since 2026-08-03, `recognizedPatterns` stayed frozen at whatever was last committed. Every widget that reads `getOptimalWidget()`, patterns or `userIndex` (ContextualPrompts, Interventions, SelfCare and Intentions routing, Biofield table, QEW) ran on stale or empty state. All of this is restored by the fix.

### 2.3 · Data containers vs displays, and Log posting ("military self-care log")

Widgets that **write to the Log** today: Planner (`plan_set`), Calendar (`calendar_entry`), SelfCare (`self_care`), EmotionalCheckIn (`emotional_checkin`), Recipe, ContextualPrompts. Server-side events also posted to the Log: `answer`, `note`, `intention`, `badge_unlock`, `generated_story`, `users_online`, `users_total`, `live_message`, `community_coherence_pulse` and others.

**Gap:** the ambient context (weather, time, users online, moon/rokuyo) is synced into QIE once a day (`recordAstrologySignal`), but it is **not stamped onto the Log entries** that interactive widgets create. Recommended standard: one shared `withContext()` helper that adds metadata to every widget `createLog` call.

```
metadata.ctx = { t: ISO, tz, wx: 'clear 18℃ 52%', online: 214, moon: 'waxing 63%', rokuyo, circadian }
```

The Log renderer can then print it in the terse comms format already used for QIE events:

```
1432Z · SELF-CARE · COMPLETE · WX CLR 18C · ONL 214 · MOON WAX63 · PHASE AFTN
```

This was not implemented in this run because it is a product-format decision. It is a short follow-up, since every writer already goes through `useCreateLog`.

### 2.4 · Monk lifestyle and transparency

LOT® AI's "pure and transparent" principle needs signals that only show real user intent. This run found and removed **one machine-generated signal source** (QuantumRandom, fix #3). A second is still open (M-2 below). The doctrine going forward: **ambient ticks never write to QIE. Only user acts, or once-per-day context samples, do.**

---

## 3 · 15-month month-to-month reveal (Digital UX routine)

**Current state**

* `MonthlyPulseWidget` is the only month-indexed surface. It was **non-functional for every user** until this push (fix #4). Its copy also **caps at 12 months** (`MONTH_MESSAGES` 1–12, label `Month ${min(n,12)}`, footer `n / 12 months`). Months 13–15 show "Month 12 · 12 / 12".
* Progressive reveal otherwise comes from `$layoutDensity` (spacing) and `$featureUnlocks` (`featureUnlockLevel` 0–5, based on engagement, not calendar time). Only **PatternInsights** and **MoodAnalytics** check unlocks. Every other paid-tier widget (about 45) is visible on day 1.
* **Not found in the codebase:** any 15-month reveal schedule.

**Proposed 15-month map** (decision for S-2, not implemented):

| Month | Reveal |
|---|---|
| M0 | Core: Time, Weather, Astrology, Memory, Check-in, Self-care, Mirror/Sound/Breathe |
| M1 | Intentions, Planner, Recipe/Fasting |
| M2 | Narrative / Story, GoalJourney |
| M3 | Contextual Prompts, Interventions, Energy Capacitor ("Active User") |
| M4 | Pattern Insights, Mood Analytics |
| M5 | Cohort Connect, Chat Catalyst |
| M6 | Chakra Ergonomics, Evolution / Citizen Index |
| M7 | Micro Calculator, Micro Game, Micro Image |
| M8 | Quantum Sign, Cosmic Update |
| M9 | Biofield table (Psychology → Biofield cycle) |
| M10 | QIE Connect console |
| M11 | Biofield Engine stack (QuantumState, PatternRecognition, SignalStream, Integrity) |
| M12 | Dashboard (UserMetrics, CorrelatedIndexes, SystemPulse) |
| M13 | System Progress, Architect |
| M14 | Stats stack, Benchmark |
| M15 | Full instrument density. Pulse copy for months 13–15 |

Implementation sketch: `monthNumber` (now available from `joinedAt`) → `getRevealTier()` in `stores/evolution.ts`, combined with `featureUnlockLevel` by `max(calendar, engagement)`, then a `<Reveal tier={n}>` wrapper in `System.tsx`.

---

## 4 · Loading speed and lag test

### 4.1 · Bundle (production, minified)

| Asset | Before | After |
|---|---|---|
| `app.js` | 730,327 B (gz 184,649) | **532,470 B (gz ~133,000)** |
| SystemProgressWidget chunk | – (inlined) | ~182 KB, loaded only when Dashboard enters the viewport |

The largest remaining modules in `app.js` are `utils/badges.ts` 207 KB (Codex data), `Logs.tsx` 121 KB, react-dom 127 KB and `easter-eggs.ts` 24 KB. **Next win:** move the badge codex *definitions* to a lazily imported data chunk (needs care, because badge checks run on Log input), and lazy-load `Logs.tsx` per tab. Together these are estimated at about −45 % more.

### 4.2 · QIE engine (Node harness, 1000 signals × 15 sources over 30 days)

```
analyzeIntentions   p50 3.3 ms · p95 17.4 ms · 37 patterns
getOptimalWidget    0.011 ms
persist payload     76 KB · stringify 0.2 ms
```

Before fix #1, the same call threw every time with no cooldown. Each widget-triggered analysis re-ran the scan up to the throw.

### 4.3 · Controls / timers audit

| Control / loop | Finding |
|---|---|
| Sound / Radio toggle | 300 ms re-entry guard. OK, no double-fire. |
| Breathe | 100 ms interval while on. Acceptable (only while enabled). |
| TimeWidget chime | 1 s interval, no setState per tick. Visibility catch-up. OK. |
| QuantumRandom | **Was** 2 × 1 s setState + signal writes off-tab. **Fixed.** |
| ContextualPrompts, SystemPulse, EvolutionMilestoneToast, ChakraErgonomics | Off-tab gated ✓ |
| MicroCalculator (10 s check) | Not off-tab gated. Low cost. Follow-up. |
| MicroGame loop | Viewport gated via `pausedRef` ✓ |
| react-query polling | 7 queries at 120 s with `refetchIntervalInBackground: false` ✓ |
| `stores/recipeWidget.ts` | Module-level `setInterval(5 min)` that is never cleared and runs on every tab. Low cost. Follow-up. |

Browser click-latency profiling was **not run**: the routine has no seeded DB or auth session to log in with. The static findings above cover the known lag sources. Add a Playwright run against staging when credentials are available.

---

## 5 · Open items (not fixed this run)

| ID | Sev | Item |
|---|---|---|
| M-1 | MED | Self-care visibility IIFE in `System.tsx` still reads and writes localStorage during render. The writes are idempotent, so it doesn't flicker, but it should move to a memo like Intentions. |
| M-2 | MED | `MicroImageWidget` records an `intentions/microimage_rendered` signal **during render on every mount**. The System tab remounts on every tab switch, which pollutes the `intentions` source. Guard it once per day. |
| M-3 | MED | Subscribe block in the paid layout is dead code: `hasSubscription` is always true there. It is harmless. |
| M-4 | LOW | 36 type errors in `utils/badges.ts`: `'mastery'`/`'ocean_wave'` not in the BadgeType unions, plus a duplicate key at L6883. Codex v33 type drift. A duplicate object key means one badge definition is silently overwritten. Worth checking. |
| M-5 | LOW | QIE source-union drift: `'micro_game'`, `'ecosystem'` and timing `'active'` are not in their type unions (`intentionEngine.ts` L2223/2240/4075, `MicroGameWidget` L779). Runtime is fine. Widen the unions. |
| M-6 | LOW | `WidgetErrorBoundary` timings (`window.__LOT_WIDGET_PERF__`) measure constructor→didMount of the boundary. That is a useful mount cost, but it is never persisted or reported. |
| M-7 | LOW | `convergence` / `ambientIntensity` in `System.tsx` are `useMemo([])`, so they are stale for the life of the mount. |

---

## 6 · Widget usage data log

**What exists:** per-user QIE signal stream (`intentionEngine.signals`, max 1000, synced to the server periodically), the Log table (events in §2.3), and the in-memory `__LOT_WIDGET_PERF__` mount timings.

**What does not exist:** an aggregated, platform-wide widget usage table. This routine runs in an isolated container with no production DB access, so **no live cross-user usage numbers are available in this report**. The data needed to build them is already captured server-side through signal sync and Log events.

**Recommended (follow-up):** a nightly job in `scheduled-jobs.ts` that aggregates `quantum_intent_signal` and Log `event` counts by `source`/`widget` × day into a `widget_usage_daily` table, exposed on `/us`. Then the next health scan can report real usage, dead widgets (0 uses in 30 days) and lag outliers.

---

```
END OF REPORT · LOT-WHS-20261125-01 · build GREEN · pushed to claude/charming-albattani-ayrvlj
```
