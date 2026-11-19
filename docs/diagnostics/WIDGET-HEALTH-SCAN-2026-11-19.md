# LOT® Widget Health Scan — 2026-11-19

Scheduled routine · branch `claude/charming-albattani-bdmcek` · first run of this program.

```
STATUS     GREEN BUILD · 3 FIXES SHIPPED · 0 NEW TS ERRORS
SCOPE      49 widget surfaces mounted in System.tsx (40 *Widget + 9 stack/stat components)
BUNDLE     app.js 729.8 KB → 539.7 KB raw  ·  183.8 KB → 133.9 KB gzip  (−27%)
VERIFIED   client esbuild prod build ✓ · tsc 104 errors before / 104 after (all pre-existing)
NOT RUN    live lag test in a browser (needs DB + server + paid session) — static analysis only
```

---

## 0. Fixes shipped in this push

| # | Severity | File | Defect | Fix |
|---|---|---|---|---|
| F1 | **HIGH — data loss** | `src/client/components/QuantumRandomWidget.tsx` | Two countdown hooks (1–72 s, avg ≈22 s) each called `recordSignal('calculator','quantum_random')` on every cycle → ≈5 signals/min ≈ 300/hour. `MAX_SIGNALS = 1000` (`stores/intentionEngine.ts:77`) means an open System tab evicted the **entire 7-day QIE signal history** (memory answers, check-ins, self-care, intentions) in ~3 h, and forced a 1000-object `JSON.stringify` persist on every tick. Nothing reads `quantum_random` (dependency map entry is `[]`). | Signal recorded only from the primary hook and at most once per 15 min. Display unchanged. |
| F2 | **MED — UI flicker / broken widget** | `src/client/components/System.tsx` (Intentions block) | Visibility evaluated during render: it re-rolled `Math.random()` cooldown **and** wrote `intentions-last-shown = now` on the first render. Next re-render (any `usersOnline` / weather / log tick) saw a fresh timestamp → returned `null`. Users without a saved intention saw Intentions appear then vanish within seconds. | Cooldown rolled once per mount (`useState` initializer). |
| F3 | **MED — UI flicker** | `src/client/components/System.tsx` (Subscribe block) | `Math.random() < 0.2` evaluated every render → Subscribe prompt blinked in/out on every SSE tick. | Roll once per mount (`subscribeRoll`). |
| F4 | **PERF** | `System.tsx`, `SystemProgressWidget.tsx`, `ArchitectWidget.tsx`, new `usershipTransmission.ts` | `SystemProgressWidget` is 181 KB minified (changelog + assembly map) and sat in the initial `app.js`. `ArchitectWidget` imported a constant from it, pinning it there. | `USERSHIP_TRANSMISSION` moved to its own module (re-exported for compatibility); `SystemProgressWidget` now `React.lazy` + `Suspense`. Still mounted eagerly so its 30-min background QOS monitor starts on load as before. |
| F5 | **PERF** | `System.tsx` | Biofield Engine stack (5 widgets) and Stats stack (6 widgets, 7 `/api/stats/*` requests) mounted at first paint although they sit at the bottom of the page. | Wrapped in the existing `LazyMount` (IntersectionObserver, 200 px margin). Verified these 11 components have no mount-time writes (no `recordSignal`, `mutate`, `setItem`). |

Bundle measured with a clean `dist/client/js` both times (`NODE_ENV=production`).

---

## 1. Widget wiring · data storing · testing

**Mount map.** Every widget is statically imported into `System.tsx`, which is the only consumer (Architect also embeds the transmission). Paid tags (Usership / R&D) get the full layout. Everyone else gets the minimal layout: Time, Memory, Game, Subscribe. Every block sits inside a `WidgetErrorBoundary` ✓.

**Persistence classes**

| Class | Widgets |
|---|---|
| Server log (`POST /api/logs`, server attaches `getLogContext`) | Calendar (`calendar_entry`), Planner (`plan_set`), SelfCare (`self_care_skip/complete`), Recipe (`note`) |
| Dedicated API + log | EmotionalCheckIn (`/api/emotional-checkin` → `emotional_checkin`), Memory (`/api/memory/answer` → `answer`/`medical_record`/`weekly_summary_response`), SystemProgress (`/api/system/submit-feedback`), CosmicUpdate (`/api/cosmic-update`) |
| Device-only (localStorage / nanostores) | Intentions (`current-intention`, **not synced to server**), ChakraErgonomics, QuantumSign, MicroImage, reward widgets, self-assembly, investor stack, Subscribe |
| Display-only | EnergyCapacitor, CohortConnect, PatternInsights, GoalJourney, ContextualPrompts, ChatCatalyst, Interventions, Narrative, Evolution, MoodAnalytics, CorrelatedIndexes, SystemPulse, UserMetrics, AIFeedback, QuantumEngine, stats/*, Benchmark, Integrity, QuantumState, PatternRecognition, SignalStream, Architect, InterfaceEvolution, MonthlyPulse |

**Findings**
- ⚠ **Intentions live only in localStorage.** A user's intention is lost on device change or cleared storage. It only reaches the server indirectly as a QIE `intention_set` signal. *Recommend:* write an `intention_set` log with the text.
- ⚠ **Render-phase localStorage writes remain** in the Self-care and Intentions blocks (`*-quantum-reason`). They are deterministic, so they cause no flicker, but they should move to an effect.
- ⚠ **Duplicate badge keys** in `src/client/utils/badges.ts`: `quarter_drop` (3214 and 5501) and `elixir_found` (4825 and 6883). In both cases the later definition silently overrides the earlier one, so two badge definitions are dead. These are the only esbuild warnings.
- ⚠ **There is no automated test suite for widgets.** The only test script is `test:cold-start`. `tsc` reports 104 pre-existing errors, including `System.tsx:645` (`weather.humidity` possibly null) and three `version` field errors in `SystemProgressWidget.tsx` at lines 1397, 1419 and 1441.

## 2. Wiring with LOT® AI, the System tab and Portrait

- **AI (LLM) call sites that feed widgets:**
  - `/api/memory` (question generation) → MemoryWidget
  - `/api/recipe-suggestion` → RecipeWidget
  - `/api/cosmic-update` (Together image) → CosmicUpdateWidget
- **Engines.** Six engines live in `server/utils/ai-engines.ts`: Claude, OpenAI, Together, Gemini, Mistral and Ollama. Usage is tracked by `AIUsageTracker` and shown in `stats/MemoryEngineStats`.
- **Heuristic, not AI** (despite "AI" naming in the UI): Narrative, ContextualPrompts, Interventions, ChatCatalyst, Energy, AIFeedback (`/api/user-profile` → `extractUserTraits`).
- **Portrait.** No component or route is named "Portrait". The personal profile page is `PublicProfile.tsx` (`/u/:user`, `GET /api/public/profile/:id`).
  - **Shared with the System tab:** correlated indexes, archetype/cohort traits, memory story, weather.
  - **Gated by** the Settings privacy toggles.
  - ⚠ The LLM **memory story is not surfaced on the System tab.** It appears only in Settings and Portrait.
  - *Recommend* naming the profile surface "Portrait" in code, or confirming which page the term refers to.

## 3. Wiring with Quantum Intent Engine · Memory · Story

- **QIE path.** `recordSignal` → localStorage `intention-signals` → `syncToServer` (every 5 min or more) → `POST /api/quantum-intent/sync` → logs with event `quantum_intent_signal` (server context attached). This is the **only** path that brings widget interaction to the server for most widgets.
- **Feeders (22):** Memory, EmotionalCheckIn, SelfCare, EnergyCapacitor, Chakra, Recipe, Intentions, GoalJourney, MicroImage, Planner, Calendar, Narrative, ChatCatalyst, ContextualPrompts, CohortConnect, Interventions, PatternInsights, MicroCalculator, QuantumRandom (throttled now, F1), MicroGame, QuantumEngine, UserMetrics/SystemProgress.
- **Read-only consumers:** AIFeedback, Architect, Benchmark, Integrity, QuantumState, PatternRecognition, SignalStream, SystemPulse.
- **Disconnected (no QIE read or write):** Time, MonthlyPulse, CosmicUpdate, QuantumSign, Subscribe, investor stack, CorrelatedIndexes, Evolution, InterfaceEvolution, MoodAnalytics, stats/*. Of these, **CosmicUpdate, QuantumSign and MoodAnalytics are interactive** and should emit signals.
- **Memory → Story.** MemoryWidget feeds QIE and writes `answer` logs. The Story widgets (Narrative/Evolution) read heuristic `/api/narrative`. The LLM `/api/memory/story` is a separate pipeline. ⚠ Two different "story" systems exist and are not cross-linked.

## 4. Data container vs data display · context sync · military-style Log posting

- **Server context exists.** The server's `getLogContext` already stamps every log with weather, humidity, city/country, time zone, local date, moon, rokuyo and zodiac ✓.
- **Online/total counts are not stamped.** `usersOnline` / `usersTotal` (SSE `/api/sync`) are **never** recorded with any log.
- **`useLogContext` is read-only** (client analytics over logs). It attaches nothing.
- **Gaps for "military comms" posting:**
  1. Display widgets (Time, Sky/Weather, Users online, Number) have no "post to Log" action.
  2. There is no terse fixed-format entry type.
- **Proposed spec** (not built this run — needs product sign-off on format):
  ```
  SITREP 1430L · SKY CLEAR 18℃ H42% · ONLINE 37/3,980 · ATP HIGH · STATUS NOMINAL
  ```
  - One `event: 'sitrep'` log.
  - Tapping a display widget's label composes it from stores.
  - Server context covers the rest.
  - This is the natural "military self-care" check-in: a short, repeatable status report rather than a journal.

## 5. Monk lifestyle · LOT® AI as transparency instrument

Assessment against the "pure and transparent" principle:
- ✓ **Context comes from the server, not the client,** so logs can't be spoofed by widget code.
- ✗ **Opacity:** there are 22 silent signal writers, and users never see what the engine recorded about them. *Recommend* a read-only "Ledger" view of the last N `quantum_intent_signal` entries per day, so the engine's record is visible to the person it describes.
- ✗ **Noise:** randomness-driven appear/disappear (F2/F3) and ambient signal floods (F1) cut against a calm, monastic surface. F1–F3 remove the worst offenders.
- ⚠ **Too many surfaces:** 49 widgets on one tab is the opposite of a monk cadence. See §6 for a reveal schedule.

## 6. 15-month month-to-month UI reveal audit

- **Current gating:**
  - Paid tag (binary)
  - MonthlyPulse (the **only** month-based gate, month ≥1)
  - Evolution levels / `featureUnlockLevel` 0–5 (only PatternInsights and InterfaceEvolution read `$featureUnlocks`; `isFeatureUnlocked` is never called)
  - Reward widgets (milestone, weekly)
  - `$layoutDensity` (spacing only)
- **Verdict:** ✗ **No 15-month reveal schedule exists in code.** A paid user sees roughly 45 widgets on day 1.
- **Proposed schedule,** keyed on months since `joinedAt` and enforced in `System.tsx` (a future build, pending approval):

| Month | Reveal |
|---|---|
| 1 | Time, Weather, Memory, Check-in, Self-care, Recipe |
| 2 | Intentions, Planner, Calendar |
| 3 | Narrative, GoalJourney, EnergyCapacitor |
| 4 | Contextual Prompts, Interventions, Chakra |
| 5 | Pattern Insights, Mood Analytics |
| 6 | Cohort Connect, Chat Catalyst |
| 7 | Evolution, Interface Evolution, Correlated Indexes |
| 8 | Quantum State, Pattern Recognition, Signal Stream |
| 9 | AI Feedback, Integrity |
| 10 | Quantum Engine Connect, Quantum Sign |
| 11 | Stats stack |
| 12 | User Metrics, System Pulse |
| 13 | System Progress, Benchmark |
| 14 | Architect |
| 15 | Full instrument density, Investor stack (if switched on) |

## 7. Loading speed

| Metric | Before | After |
|---|---|---|
| `app.js` raw | 729,837 B | 539,731 B |
| `app.js` gzip | 183,835 B | 133,893 B |
| Static-import closure (app + eager chunks) | 1,419,895 B | 1,239,831 B |
| Widgets mounted at first paint (paid layout) | ~45 | ~34 (Biofield + Stats deferred; QIE Connect already deferred) |
| `/api/stats/*` requests at first paint | 7 | 0 (fire on scroll) |

**Next candidates** (not done):
- `utils/badges.ts`: 212 KB in the initial bundle, the largest single input.
- `Logs.tsx`: 123 KB, a separate tab; it could be route-split.
- `SelfCareMoments`: 22 KB.

## 8. Lag test (static)

| Control | Observation |
|---|---|
| Buttons / toggles | Sound/Radio toggle has a 300 ms re-entry guard. Fine. |
| Sound | Hourly chime check runs `setInterval` at 1 s (TimeWidget). Cheap, but it could align to the next minute instead. |
| Intervals on tab | QuantumRandom 3 × 1 s/10 s, Time 1 s, SystemPulse 10 s, MicroCalculator 10 s, ContextualPrompts 15 s, SystemProgress 60 s, Chakra 2 min, astrology 15 min (paused off-tab). MicroGame pauses off-viewport ✓. |
| Re-render fan-out | ⚠ `System` re-renders on every `usersOnline` / weather / liveMessage SSE tick, and its ~45 children are not memoized. F2/F3 removed the visible symptom. Memoizing heavy children is the next step. |
| Loading | `WidgetErrorBoundary` logs a warning when a widget mounts slower than 50 ms. Timings sit in `window.__LOT_WIDGET_PERF__`, but nothing reads or ships them. |

A live browser lag measurement was **not run**: it needs a DB-backed server and a paid session.

## 9. Data log of widget usage across LOT® Systems

- **Current state:** ✗ there is **no widget usage telemetry**.
  - No server endpoint records impressions or interactions.
  - `getWidgetTimings()` is never called.
  - The nearest proxy is `quantum_intent_signal` logs. Only 3 of them are view events: `cohort_widget_viewed`, `goals_viewed`, `microimage_rendered`.
- **Proposed** (needs approval, because it adds a data-collection surface):
  - Batch `{widget, action: view|tap|submit, ms_to_mount}` into the existing 5-min QIE sync as a new signal source `widget`.
  - Add an admin aggregate at `/api/stats/widget-usage`.
- **Until then:** platform-wide per-widget usage cannot be reported. Per-user `useLogContext` "most/least used widget" covers only the 4 log-writing widgets.

---

## Files changed

- `src/client/components/QuantumRandomWidget.tsx`: F1
- `src/client/components/System.tsx`: F2, F3, F4 (lazy), F5
- `src/client/components/SystemProgressWidget.tsx`: F4 (re-export)
- `src/client/components/ArchitectWidget.tsx`: F4 (import path)
- `src/client/components/usershipTransmission.ts`: F4 (new)
- `docs/diagnostics/WIDGET-HEALTH-SCAN-2026-11-19.md`: this report

**Note for future assembly runs:** update `USERSHIP_TRANSMISSION` in `src/client/components/usershipTransmission.ts`, no longer in `SystemProgressWidget.tsx`.
