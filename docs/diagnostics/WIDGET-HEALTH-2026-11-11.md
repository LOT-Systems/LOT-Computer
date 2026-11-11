<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® Widget Health Scan — 2026-11-11

```
ROUTINE ........ LOT® Widget Health (scheduled)
FIRED .......... 2026-11-11 03:46 UTC
BASE ........... master @ 98971f2 (last change 2026-08-05)
BRANCH ......... claude/charming-albattani-pslkc1
SCOPE .......... 55 widget components · 34 API endpoints · 109 server routes
BUILD .......... GREEN (yarn build, client + server)
SERVER TSC ..... 0 errors
CLIENT TSC ..... 104 → 96 errors (−8, 0 new; esbuild does not type-check)
STATUS ......... 2 × P0 runtime crashes found and FIXED · 1 × P1 dead widget FIXED
```

---

## 0. Situation report (read this first)

| # | Sev | Finding | Status |
|---|-----|---------|--------|
| 1 | **P0** | `analyzeIntentions()` threw `ReferenceError: dayMs is not defined` (Pattern 147, `intentionEngine.ts:3332`, added 2026-08-03 in 1846b80). **Every user with ≥1 QIE signal.** The QIE pattern scan never completed, so `recognizedPatterns` never refreshed. `System.tsx` calls it inside a `useEffect`, so the throw also goes up to the error boundary. | **FIXED**, repro'd in Node before and after |
| 2 | **P0** | `UserMetricsWidget` called `classifyPhysiologicalCohort()` with **no arguments**, which throws `Cannot read properties of undefined (reading 'filter')` while rendering. The shared `Dashboard` error boundary then hides **all 4 Dashboard widgets** (UserMetrics, CorrelatedIndexes, SystemProgress, SystemPulse). It also read `.label` / `.dominant`, which do not exist (the real fields are `archetype` / `dominantModule`). | **FIXED** |
| 3 | **P1** | `MonthlyPulseWidget` (the month-to-month reveal widget) reads `me.joinedAt`, but `/api/me` never returned it, so `monthNumber` was always 0 and **the widget never appeared for anyone**. | **FIXED** (`joinedAt` added to `useProfileView()` + `UserProfile` type) |
| 4 | P2 | QIE Connect "CARE" dimension read `dimensions.selfcare` (the field is `selfCare`), so it always rendered blank. | **FIXED** |
| 5 | P2 | The Subscribe prompt rolled `Math.random()` **inside render**, so it flickered in and out on every System re-render (weather, users-online, logs ticks). | **FIXED**: rolled once per mount |
| 6 | P2 | Only 1 of ~50 System-tab widgets was lazy-mounted. The `LazyMount` placeholder had 0 height, so a stack of them would all intersect at once and the deferral would not work. | **FIXED**: placeholder `minHeight`, and Biofield, Architect, Stats, Calendar and Benchmark are now lazy-mounted |
| 7 | P3 | 5 investor widgets + Subscribe + QuantumSign accessed `localStorage` with no guard during render or click. That throws in Safari private mode, sandboxed iframes and when storage is blocked. | **FIXED**: new `#client/utils/safeStorage` |
| 8 | P3 | The 2 orphan widgets (`AwarenessDashboard`, `JournalReflection`) are not mounted anywhere. | Reported |
| 9 | P3 | Nested animation `setTimeout` chains are never cancelled on unmount (MemoryWidget 13 set / 1 cleared, EmotionalCheckIn 4/0, Planner 3/0, Recipe 4/0, MonthlyPulse 3/0). | Reported (low impact under React 18) |

---

## 1. Widget wiring, data storing, testing

### 1.1 Inventory (static scan of `src/client/components/**`)

Legend: ● = wired · `·` = not wired. *Kind* is heuristic: **data container** writes to the Log, **data display** only reads an API, **interactive** has controls but no persistence, **display** is static or local.

| Widget | LOC | API endpoints | Mounted in | QIE | Memory | Log write | Context (wx/online/time) | Kind | Timer hygiene |
|---|---:|---|---|:-:|:-:|:-:|:-:|---|---|
| AIFeedbackWidget | 311 | `/api/logs`, `/api/os/diagnostics`, `/api/user-profile` | System | ● | · | · | ·/·/· | data display | ok |
| AngelInvestorWidget | 128 | — | System | · | · | · | ·/·/· | display | ok |
| ArchitectWidget | 295 | — | System | ● | · | · | ·/·/· | interactive | ok |
| AwarenessDashboard | 179 | `/api/user-profile` | **orphan** | ● | · | · | ·/·/● | data display | ok |
| BenchmarkWidget | 122 | `/api/logs` | System | ● | · | · | ·/·/● | data display | ok |
| CalendarWidget | 281 | `/api/logs` | System | ● | · | ● | ·/·/● | data container | ok |
| ChakraErgonomicsWidget | 190 | — | System | ● | · | · | ·/·/· | display | ok |
| ChatCatalystWidget | 123 | `/api/chat-catalysts` | System | ● | · | · | ·/·/● | interactive | ok |
| CohortConnectWidget | 304 | `/api/cohorts`, `/api/energy`, `/api/user-profile` | System | ● | · | · | ·/·/● | interactive | ok |
| ContextualPromptsWidget | 289 | `/api/contextual-prompts`, `/api/logs` | System | ● | ● | ● | ·/·/● | data container | ok |
| CorporatePlanWidget | 101 | — | System | · | · | · | ·/·/· | display | ok |
| CorrelatedIndexesWidget | 159 | `/api/os/indexes` | System | · | ● | · | ·/·/· | data display | ok |
| CosmicUpdateWidget | 250 | `/api/cosmic-update` | System | · | · | · | ·/·/· | interactive | ok |
| DemoDayWidget | 115 | — | System | · | · | · | ·/·/· | display | ok |
| EmotionalCheckIn | 404 | `/api/emotional-checkin`, `/api/emotional-checkins`, `/api/logs` | System | ● | ● | · | ●/·/● | interactive | timeouts 4 set / 0 cleared |
| EnergyCapacitor | 226 | `/api/energy` | System | ● | · | · | ·/·/● | data display | ok |
| EvolutionMilestoneToast | 125 | — | System | · | · | · | ·/·/· | display | ok |
| EvolutionWidget | 211 | `/api/logs`, `/api/narrative` | System | · | ● | · | ·/·/● | data display | ok |
| FlashDriveManifest | 121 | — | System | · | · | · | ·/·/· | display | ok |
| FourDimensionalUI | 131 | — | System | · | ● | · | ·/·/· | display | ok |
| GoalJourneyWidget | 143 | `/api/goal-progression` | System | ● | ● | · | ·/·/● | data display | ok |
| IntegrityWidget | 476 | `/api/logs` | System | ● | · | · | ·/·/● | data display | ok |
| IntentionsWidget | 296 | — | System | ● | ● | · | ·/·/● | interactive | ok |
| InterfaceEvolutionWidget | 185 | — | System | · | ● | · | ·/·/· | display | ok |
| InterventionsWidget | 97 | `/api/interventions` | System | ● | · | · | ·/·/● | data display | ok |
| InvestmentSwitch | 62 | — | Settings | · | · | · | ·/·/· | display | ok |
| JournalReflection | 80 | — | **orphan** | ● | · | · | ·/·/● | display | ok |
| MemoryWidget | 400 | `/api/memory`, `/api/memory/answer` | System | ● | ● | · | ·/·/● | interactive | timeouts 13 set / 1 cleared |
| MicroCalculatorWidget | 208 | — | MicroImageWidget, System | ● | · | · | ·/·/● | interactive | ok |
| MicroGameWidget | 988 | — | MicroImageWidget, System, SystemProgressWidget | ● | · | · | ·/·/● | interactive | ok |
| MicroImageWidget | 311 | — | System | ● | · | · | ·/·/● | interactive | ok |
| MonthlyPulseWidget | 142 | — | System | · | · | · | ·/·/● | interactive | timeouts 3 set / 0 cleared |
| MoodAnalytics | 235 | `/api/emotional-checkins`, `/api/logs` | System | · | · | · | ·/·/● | data display | ok |
| NarrativeWidget | 219 | `/api/narrative` | System | ● | ● | · | ·/·/● | data display | ok |
| PatternInsightsWidget | 226 | `/api/cohorts`, `/api/pattern-evolution`, `/api/patterns` | System | ● | · | · | ·/·/● | interactive | ok |
| PatternRecognitionWidget | 561 | `/api/logs` | About, System, SystemProgressWidget | ● | ● | · | ·/·/· | data display | ok |
| PlannerWidget | 300 | `/api/logs` | System | ● | · | ● | ·/·/● | data container | timeouts 3 set / 0 cleared |
| QuantumEngineWidgets | 651 | `/api/energy`, `/api/user-profile` | About, System, SystemProgressWidget | ● | · | · | ·/·/· | interactive | ok |
| QuantumRandomWidget | 81 | — | System | ● | · | · | ·/·/· | display | ok |
| QuantumSignWidget | 166 | `/api/logs` | System | · | · | · | ·/·/● | interactive | ok |
| QuantumStateWidget | 244 | `/api/logs` | System | ● | ● | · | ·/·/· | data display | ok |
| RecipeWidget | 345 | `/api/logs` | About, System | ● | · | ● | ●/·/● | data container | timeouts 4 set / 0 cleared |
| SelfCareMoments | 869 | `/api/emotional-checkins`, `/api/logs`, `/api/user-profile` | System | ● | · | ● | ●/·/● | data container | timeouts 4 set / 1 cleared |
| SignalStreamWidget | 145 | — | System | ● | · | · | ·/·/● | display | ok |
| SubscribeWidget | 42 | — | System | · | · | · | ·/·/· | interactive | ok |
| SystemProgressWidget | 2513 | `/api/energy`, `/api/logs`, `/api/system/deployment-status`, `/api/system/feedback-analytics`, `/api/system/my-feedback`, `/api/system/submit-feedback`, `/api/user-profile` | About, ArchitectWidget, System | ● | ● | ● | ●/·/● | data container | ok |
| SystemPulseWidget | 300 | `/api/system/pulse` | System, SystemProgressWidget | ● | · | · | ·/·/· | data display | ok |
| TimeWidget | 146 | — | System | · | · | · | ·/·/● | display | ok |
| UserMetricsWidget | 382 | `/api/cohorts`, `/api/me`, `/api/os/performance`, `/api/os/status`, `/api/os/version` | System | ● | · | · | ·/·/● | data display | ok |
| BadgeUnlockFeed | 54 | `/api/stats/badges` | Settings, System | · | · | · | ·/·/· | data display | ok |
| CollectiveConsciousness | 63 | `/api/stats/collective` | System | · | · | · | ·/·/· | data display | ok |
| GrowthMilestones | 137 | `/api/stats/growth` | Settings, System | · | · | · | ·/·/· | data display | ok |
| IntentionPatterns | 48 | `/api/stats/patterns` | System | · | · | · | ·/·/· | data display | ok |

**Totals:** 55 widgets · 33 emit QIE signals · 14 reference Memory/Story · **6 write to the Log** · 4 read weather · **0 read users-online** · 21 interactive · 2 orphans.

### 1.2 Endpoint integrity
Every one of the 34 distinct endpoints the widgets call resolves to a registered Fastify route (scan of 109 routes in `src/server/routes`). **No dead endpoints.**

### 1.3 Data storage
- **Server (Postgres `logs` table)** holds the Log (`/api/logs`), Memory answers (`/api/memory/answer`), emotional check-ins, and QIE signals, which are bulk-inserted through `/api/quantum-intent/sync`.
- **Client (localStorage)** holds the QIE signal buffer (capped at 1000, coalesced persist), widget cooldowns, investor mode, and the Monthly Pulse dismissal. After this run every storage access in the investor, Subscribe and QuantumSign widgets goes through `safeStorage`.

### 1.4 Testing
- The repo has **no unit or component test suite**. `yarn test:cold-start` is an HTTP smoke test against a running server.
- This run added two throwaway harnesses (not committed). They bundle `intentionEngine.ts` for Node and run it on seeded signals:
  - `analyzeIntentions()` before the fix: **`ReferenceError: dayMs is not defined`**. After the fix: OK, 23 patterns.
  - `classifyPhysiologicalCohort()` called with no args: **throws**, which confirms finding #2.
- **Recommendation:** commit a minimal `vitest` suite for `intentionEngine.ts`, starting with "analyzeIntentions does not throw on N seeded signals". Both P0s in this report would have been caught by that one assertion. 96 client TS errors remain and include more of the same class (see §9).

---

## 2. LOT® AI · System tab · Portrait

| Surface | Widgets wired | Notes |
|---|---|---|
| **System tab** (`System.tsx`) | 50 of 55 | Free accounts get a minimal layout (Time, Memory, Game, Subscribe). R&D and Usership accounts get the full stack of ~50 widgets **all at once**, with no time-gated reveal (see §6). |
| **LOT® AI** | MemoryWidget (`/api/memory`, AI engine when Usership + key present), AIFeedbackWidget (`/api/os/diagnostics`, `/api/user-profile`), ContextualPrompts, Narrative, PatternInsights, MemoryEngineStats (`/api/stats/ai-usage`) | AI is reached only through server routes; no widget calls a model directly. Good. |
| **Portrait** (`PublicProfile.tsx`) | **0 widgets** | Portrait renders badges only (`#client/utils/badges`). No archetype, Monthly Pulse month, Memory Story or QIE index. **Gap:** the cohort archetype (`classifyPhysiologicalCohort().archetype`) and `monthNumber` are cheap and private-safe candidates for Portrait. |

---

## 3. LOT® Quantum Intent Engine · Memory · Story

- **QIE:** 33 of 55 widgets emit signals. With finding #1 fixed, pattern recognition (P1–P151) runs again. Before the fix, every scan aborted at Pattern 147 for any user with signals.
- **Memory:** MemoryWidget → `/api/memory` + `/api/memory/answer`. Signals feed QIE (`recordSignal('memory', …)`).
- **Story:** `/api/memory/story` (`useMyMemoryStory`) is consumed **only by Settings**. No widget, and not Portrait, shows the user's Story. **Gap:** a read-only "Story" display widget on the System tab or Portrait would close the Memory → Story loop the program describes.

---

## 4. Context sync → Log ("military self-care" comms)

Today **only 6 widgets write to the Log** (Calendar, ContextualPrompts, Planner, Recipe, SelfCare, SystemProgress), and the entries are free prose. Context is barely captured: **4** widgets read weather, **0** read users-online, and none stamps the context onto the Log entry.

**Proposed protocol (not implemented; needs a product decision).** Each interactive widget action posts one terse SITREP line through `useCreateLog` with `event: 'widget'`, and the structured context goes in `metadata`:

```
0347Z · SELF-CARE · COMPLETE · "Box breathing 4×4" · WX 11°C CLEAR · ONLINE 42 · CIRC MORNING · ATP MOD
0912Z · PLANNER · SET · INTENT "Ship QIE fix" · WX 14°C CLOUDS · ONLINE 57
1830Z · RECIPE · VIEWED · DINNER "Lentil soup" · FAST DAY NO
```

`metadata = { widget, action, wx: {tempC, desc}, online, circadian, energyBand }`. The data already exists in `stores.weather`, `stores.usersOnline`, `getCircadianPhase()` and `getUserState()`. A single `logWidgetAction()` helper in `#client/utils/logTriggers.ts` would wire all 21 interactive widgets with no new endpoints. In "monk" terms: one line per act, timestamped, nothing hidden, which is the transparent ledger of §5.

---

## 5. Monk lifestyle / LOT® AI as transparent practice

Observations against that principle:
- **Transparent:** QIE runs fully client-side and is inspectable (`window.__LOT_PERF__`, `window.__LOT_WIDGET_PERF__`). AI is invoked only server-side, through explicit routes.
- **Not yet transparent:** the user cannot see *why* a widget appeared. `getOptimalWidget()` returns a `reason`, but it is shown only in PatternRecognition. Surfacing the one-line reason beneath each conditionally shown widget (Self-care, Intentions, Recipe) would make the engine's decisions legible.
- **Noise vs. silence:** ~50 simultaneous widgets for paid users is the opposite of a monk's cell. The reveal plan in §6 handles this.

---

## 6. 15-month month-to-month UI reveal (Digital UX routine)

**Current state:** there is **no reveal schedule**. The only month-aware widget is MonthlyPulseWidget (messages for months 1–12 only), and it was broken (finding #3). Paid accounts receive every widget on day 1, and `$layoutDensity` only changes spacing.

**Proposed schedule** (keyed on `monthNumber = now − joinedAt` in months, which works now that `/api/me` returns `joinedAt`):

| Month | Reveal | Widgets |
|---:|---|---|
| 0 | Core | Time, Weather, Memory, Recipe, Breathe, Sound |
| 1 | Reflection | EmotionalCheckIn, SelfCareMoments, MonthlyPulse |
| 2 | Intent | Intentions, Planner |
| 3 | Patterns | PatternInsights, MoodAnalytics |
| 4 | Energy | EnergyCapacitor, ChakraErgonomics |
| 5 | Story | Narrative, GoalJourney |
| 6 | Community | CohortConnect, ChatCatalyst, CommunityPulse |
| 7 | Guidance | ContextualPrompts, Interventions |
| 8 | Evolution | Evolution, InterfaceEvolution, MilestoneToast |
| 9 | Tools | MicroCalculator, MicroImage, MicroGame |
| 10 | Quantum I | QuantumState, QuantumRandom, QuantumSign, SignalStream |
| 11 | Quantum II | QuantumEngineWidgets, PatternRecognition, AIFeedback, Integrity |
| 12 | Dashboard | UserMetrics, CorrelatedIndexes, SystemPulse, Stats stack |
| 13 | Calendar / Cosmic | Calendar, CosmicUpdate |
| 14 | Architect | SystemProgress, Architect, Benchmark |
| 15 | Complete | All. MonthlyPulse needs messages for 13–15. |

Implementation is one `revealMonth(widget)` map plus a guard in `System.tsx`. Not shipped in this run, because it changes what paying users see today and needs an explicit decision.

---

## 7. Widget loading speed

### 7.1 Bundle (production `app` entry, minified, all chunks)

| Total JS | `app.js` | `app.js` gzip |
|---:|---:|---:|
| 1.39 MB | 730 KB | 184 KB |

Largest contributors (bytes in output):

| Module | Bytes | Share | Why |
|---|---:|---:|---|
| `utils/badges.ts` | 212 KB | 15.3 % | 812-badge codex as inline data |
| `components/SystemProgressWidget.tsx` | 181 KB | 13.1 % | Changelog / transmission text inlined in the component |
| `stores/intentionEngine.ts` | 143 KB | 10.3 % | 151 pattern rules |
| react-dom | 130 KB | 9.4 % | — |
| `components/Logs.tsx` | 123 KB | 8.9 % | — |

**Recommendations, biggest win first:**
1. Move SystemProgressWidget's changelog arrays to a JSON file fetched on expand, or a dynamic `import()`. That saves about 13 % of JS.
2. Code-split the badge codex: keep the `id → symbol` index eager and lazy-load descriptions. That saves up to about 15 %.
3. Turn below-the-fold widgets into `React.lazy` chunks. `splitting: true` is already enabled in esbuild. LazyMount now defers mounting, but the code still ships in `app.js`.

### 7.2 Mount deferral (shipped this run)
- `LazyMount` now reserves `minHeight` until it intersects. Without that, the collapsed placeholders stacked at one y-offset and would all mount together.
- Newly deferred stacks: **Biofield Engine** (5 widgets, 4 API calls), **Stats** (6 widgets, 7 API calls), **Architect**, **Calendar**, **Benchmark**. That is about 11 fewer network requests and component mounts on first paint for paid users.
- **Kept eager on purpose:** the Dashboard stack, because `SystemProgressWidget` starts the background QOS monitor on mount.

---

## 8. Lag test (buttons · sounds · controls · loading)

Live browser lag testing was **not possible** in this container: there is no database and there are no app credentials. Engine hot paths were benchmarked in Node instead. These are the same functions widget buttons and System renders call (desktop-class CPU; expect roughly 4–6× slower on mobile).

| Function (signals = 1000, the buffer cap) | p50 | p95 | Budget |
|---|---:|---:|---|
| `analyzeIntentions()` (cold) | 6.1 ms | 6.9 ms | runs in `requestIdleCallback` on signal writes ✅, but **synchronously** in a System `useEffect` on every logs change ⚠️ |
| `recomputeAssembly()` | 3.2 ms | 3.4 ms | same effect ⚠️ |
| `classifyPhysiologicalCohort()` | 0.03 ms | 0.05 ms | ✅ |
| `getOptimalWidget()` / `getUserState()` / `getUserIndex()` | <0.01 ms | 0.04 ms | ✅ |

At 100 and 500 signals: analyze 1.4 / 3.8 ms, assembly 0.4 / 1.7 ms.

- **Buttons:** `recordSignal` defers persist and analysis off the click tick. ✅ The Sound toggle has a 300 ms debounce. ✅
- **Sounds:** a single shared `AudioContext` (`sovietChime.getAudioContext`) with `warmAudioContext()` on gesture. ✅ No per-click context creation.
- **Controls:** ~9 ms of synchronous engine work in the System logs effect. On mid-range mobile that becomes 40–55 ms, close to a long frame. **Recommendation:** wrap that effect body in the existing `deferHeavy()`.
- **Loading:** the Subscribe flicker is fixed. The remaining risk is uncancelled animation timers (finding #9).
- **Runtime telemetry already in place:** `window.__LOT_PERF__.getEntries()` logs interactions over 50 ms and warns over 200 ms (INP). `window.__LOT_WIDGET_PERF__` records mount time per error boundary.

---

## 9. Data log of widget usage across the platform

**Not produced.** This sandbox has no `DATABASE_URL` or production access, so the platform-wide usage aggregate could not be queried. The data exists: QIE signals land in the `logs` table through `/api/quantum-intent/sync`, keyed by `source` (= widget). Query to run against production (read-only):

```sql
SELECT metadata->>'source' AS widget,
       COUNT(*)                     AS signals_30d,
       COUNT(DISTINCT "userId")     AS users_30d,
       MAX("createdAt")             AS last_seen
FROM logs
WHERE event = 'quantum_intent_signal' AND "createdAt" > now() - interval '30 days'
GROUP BY 1 ORDER BY 2 DESC;
```

*(Event name and `metadata.source` key confirmed in `api.ts:3677`.)* If that query shows zero signals since 2026-08-03 for pattern-driven surfaces, that is consistent with finding #1.

### Remaining client type errors worth a follow-up (likely runtime-visible)
- `MemoryWidget.tsx:65`: `insight` is not on the `useCreateMemory` response type. Check whether the server returns it; if not, the advanced-memory insight never shows.
- `System.tsx:624`: `weather.humidity` can be null.
- `intentionEngine.ts`: 6 × `recordSignal` with a `source` outside the `WidgetType` union (`micro_game`, `ecosystem`, …), and 2 × invalid `suggestedTiming: 'active'`.
- `badges.ts:5501`, `badges.ts:6883`: **duplicate object keys** (`quarter_drop`, `elixir_found`). The later definition silently overwrites the earlier badge.

---

## 10. Changes in this push

| File | Change |
|---|---|
| `src/client/stores/intentionEngine.ts` | P147: replace undefined `dayMs` with `24 * 60 * 60 * 1000` |
| `src/client/components/UserMetricsWidget.tsx` | pass `(signals, getUserState(), recognizedPatterns)`; use `archetype` / `dominantModule` |
| `src/client/components/QuantumEngineWidgets.tsx` | `dimensions.selfcare` → `selfCare` |
| `src/server/models/user.ts`, `src/shared/types/index.ts` | expose `joinedAt` on the user's own `/api/me` profile |
| `src/client/components/System.tsx` | guard the QIE effect with try/catch; roll Subscribe once per mount; `LazyMount` minHeight; lazy-mount Biofield, Architect, Stats, Calendar, Benchmark |
| `src/client/utils/safeStorage.ts` (new) | `safeGetItem` / `safeSetItem` / `isInvestorMode` |
| Angel/CorporatePlan/DemoDay/FlashDrive/FourDimensional/Subscribe/QuantumSign widgets | storage access through `safeStorage` |

**Verification:** `yarn build` green · server `tsc` 0 errors · client `tsc` 104 → 96 with no new errors · Node repro of `analyzeIntentions()` passes after the fix.
**Not verified:** in-browser rendering of the System tab, because no app or database runs in this environment.
