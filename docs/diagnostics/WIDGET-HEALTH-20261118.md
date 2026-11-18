# LOT® Widget Health Scan — 2026-11-18

**Routine:** scheduled widget health scan (wiring · data · UI · lag)
**Branch:** `claude/charming-albattani-zw6yy4`
**Baseline:** `9f2b88c` (Badge Codex v33)
**Method:** static analysis of `src/client/components/**` + `queries.ts` + server log routes, production esbuild bundle measurement with metafile, and a full client and server type-check. No live database was available in this container, so there was **no runtime click-through or production usage query**. Every lag figure below comes from reading the code or measuring the bundle, not from a profiler trace.

---

## 0 · SITREP (BLUF)

| Item | Status |
|---|---|
| Client build | 🟢 GREEN (esbuild, 1.6 s) |
| Server type-check | 🟢 0 errors |
| Client type-check | 🟡 103 errors, all pre-existing (was 104; this run fixed 1, added 0) |
| `app.js` initial bundle | 🟢 **730 KB → 540 KB (−26 %)** |
| Duplicate network requests on System mount | 🟢 2 removed (`/api/user-profile` ×2) |
| Render-loop visibility bugs | 🟢 2 fixed (Subscribe flicker, Intentions vanishing) |
| Display bugs | 🟢 1 fixed (QIE `CARE` dimension always blank) |
| Badge registry collisions | 🔴 2 open (`elixir_found`, `quarter_drop`), not fixed because it needs a product decision |
| Widget → Log usage coverage | 🔴 only 4 of ~54 widgets write interactions to the Log |

---

## 1 · Changes shipped in this push

### 1.1 Fix: render-time randomness and storage writes (`System.tsx`)
`System` re-renders on every SSE tick (`users_online`, `weather`, `live_message`). Three gates were computed **inside render**:

- **Subscribe** re-rolled `Math.random() < 0.2` on every render, so the widget flickered in and out every time someone came online. It now rolls once per mount (`subscribeRoll`).
- **Intentions** set `intentions-last-shown = now` during render. On the next render the cooldown read as "not passed", so the widget **unmounted itself on the next SSE tick** unless the user already had an intention saved. The cooldown gate is now frozen per mount (`intentionsCooldownPassed`), and the original write condition is kept.
- **All render-time `localStorage` access** (Self-care, Intentions, Subscribe) now goes through `readStorage` / `writeStorage`, which wrap the calls in try/catch. Before this, blocked site data or a private window made the call throw, and the `WidgetErrorBoundary` then removed the whole section.

### 1.2 Speed: code-split `SystemProgressWidget` (−177 KB from the critical path)
- `SystemProgressWidget` (2,513 lines, mostly the deployment and session-report history) is now loaded with `React.lazy` inside `LazyMount` + `Suspense`, as its own 181 KB chunk.
- `USERSHIP_TRANSMISSION` moved to `components/usershipTransmission.ts`. `ArchitectWidget` imports it from there, so it no longer pulls the whole widget into the main bundle. `SystemProgressWidget` still re-exports it.
  **Assembly-run note:** when you update the transmission after a run, edit `usershipTransmission.ts`, not `SystemProgressWidget.tsx`.
- `startBackgroundQOSMonitor()` used to start only when the widget mounted. It now starts from `System` on mount (the function is idempotent), so the 30-minute QOS snapshots keep their schedule even though the widget mounts later.
- The **Stats** stack (6 widgets × 2-minute polling queries) is wrapped in `LazyMount`, so its six `/api/stats/*` polls start only when the stack scrolls into view.

### 1.3 Fix: duplicate `/api/user-profile` fetches
`QuantumEngineWidgets` and `SystemProgressWidget` each made a raw, uncached `fetch('/api/user-profile')` on mount, in addition to the cached `useProfile()` query already used by `System`. Both now read from `useProfile()`, which shares the react-query cache with a 2-minute stale time.

### 1.4 Fix: QIE `CARE` dimension blank
In `QuantumEngineWidgets.tsx:469` the code read `userIndex.dimensions.selfcare`, but the field is named `selfCare`. The CARE row has always rendered empty. Corrected.

---

## 2 · Widget wiring matrix

Legend: ● = wired · ◐ = server-derived or partial (LLM use not verified this run) · **AI** = server LLM-backed endpoint · **QIE** = `stores/intentionEngine` · **MEM** = Memory · **STORY** = narrative/story · **PORT** = `/api/user-profile` (Portrait/psych profile) · **LOG✍** = writes to the Log · **LOG👁** = reads Logs.

| Widget | Kind | AI | QIE | MEM | STORY | PORT | LOG✍ | LOG👁 | Lazy |
|---|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| TimeWidget | display | | | | | | | | |
| MonthlyPulseWidget | display | | | | | | | | |
| RecipeWidget | interactive | | ● | | | | ● | ● | |
| EmotionalCheckIn | interactive | ◐ | ● | | | | ● (server `emotional_checkin`) | ● | |
| SelfCareMoments | interactive | | ● | | | ● | ● | ● | |
| IntentionsWidget | interactive | | ● | | | | ◐ (localStorage only) | | |
| ContextualPromptsWidget | display | ◐ | ● | | | | | ● | |
| ChatCatalystWidget | display | ◐ | ● | | | | | | |
| InterventionsWidget | display | ◐ | ● | | | | | | |
| EnergyCapacitor | display | | ● | | | | | | |
| ChakraErgonomicsWidget | display | | ● | | | | | | |
| NarrativeWidget | display | ◐ | ● | | ● | | | | |
| GoalJourneyWidget | display | ◐ | ● | | ● | | | | |
| EvolutionWidget | display | | | | ● | | | ● | |
| InterfaceEvolutionWidget | display | | | | | | | | |
| PatternInsightsWidget | display (unlock-gated) | | ● | | | | | | |
| MoodAnalytics | display (unlock-gated) | | | | | | | ● | |
| CohortConnectWidget | interactive | | ● | | | ● | | | |
| PlannerWidget | interactive | | ● | | | | ● | | |
| MemoryWidget | interactive | ● | ● | ● | | | ● (server `answer`) | | |
| MicroCalculator / Game / Image | interactive | | ● | | | | | | |
| CosmicUpdateWidget | interactive | ● (Together AI) | | | | | | | |
| QuantumSignWidget | interactive | | | | | | | ● | |
| FlashDrive / Investor stack | display | | | | | | | | |
| QuantumEngineWidgets | display | | ● | | | ● | | | ✅ |
| QuantumState / PatternRecognition / AIFeedback / SignalStream / Integrity | display | ◐ | ● | | | ● (AIFeedback) | | ● | |
| UserMetricsWidget | display | | ● | | | | | | |
| CorrelatedIndexesWidget | display | | | | | | | | |
| SystemProgressWidget | interactive | | ● | | | ● | ● (feedback) | ● | ✅ (new) |
| SystemPulseWidget | display | | ● | | | | | | |
| ArchitectWidget | display | | ● | | | | | | |
| Stats ×6 | display (2 min poll) | ◐ (AI usage) | | ◐ | | | | | ✅ (new) |
| CalendarWidget | interactive | | ● | | | | ● | ● | |
| BenchmarkWidget | display | | ● | | | | | ● | |

### Wiring findings
1. **QIE is the backbone.** About 35 widgets read `intentionEngine`, but only the System tab feeds it signals. Story (`useNarrative`, `useStoryGeneration`) reaches only 3 widgets. **Memory → Story → QIE** is a one-way chain with no loop back into what widgets display.
2. **Portrait (`/api/user-profile`)** is consumed by 5 widgets, but nothing on the Portrait/`PublicProfile` page reflects widget activity. The profile page doesn't read widget-generated logs (`self_care`, `plan_set`, `calendar_entry`).
3. **`UserMetricsWidget`** still makes raw `fetch('/api/cohorts')` and `fetch('/api/me')` calls, duplicating `useCohorts()` and the `me` store. *Next candidate for dedup; not changed this run because the merge order of the two responses matters.*
4. **`LogEvent` type drift.** `shared/types` declares 9 events, while the server and client write more than 25 (`plan_set`, `calendar_entry`, `self_care_*`, `badge_unlock`, `qi_rfi`, `assembly_directive`, `quantum_intent_signal`, …). It's typed as `string`, so nothing breaks, but there's no registry of events.

---

## 3 · Context synchronization and military-format Log posting

`POST /api/logs` already stamps every entry with `getLogContext()`: **temperature, humidity, weather, city/country, timezone, local DTG, rokuyo, moon phase and illumination, hourly zodiac, western zodiac**.

**Gap:** **users online** isn't captured in log context, even though `User.countOnline()` exists and is already computed for SSE.

**Gap:** only **4 client widgets** post interactions (`CalendarWidget`, `PlannerWidget`, `RecipeWidget`, `SelfCareMoments`), and each uses its own text format (`[SCHEDULE] …`, `Self-care completed: …`, free text).

**Proposal: unified widget transmission format** (one helper, `postWidgetLog(widget, action, payload)`, with event `widget_<id>`):

```
DTG 181432L NOV26 · STN NYC · WX 4°C CLR · NET 7 ONLINE
FM  SELF-CARE  TO LOG
ACT COMPLETE — 4-7-8 BREATH · 3 MIN
QIE STATE calm · CARE 62
// END
```

- Context fields come from the server context, so the client stays thin.
- The Monk-Mode principle (below) means **one line per act, no embellishment**. The log is the confessional record, not a feed.

## 4 · Monk lifestyle / transparency lens

The aim is a pure, transparent life with LOT® AI as the witness:

- **What's already right:** context is attached server-side, so the record can't be curated after the fact. Self-care *skips* are logged alongside completions (`self_care_skip`), which is an honest record.
- **What breaks it:**
  - A hidden `aria-hidden` "genesis" text block is rendered in both System layouts (`System.tsx`). That's invisible content in a transparency product. Move it to an HTML comment or the About page.
  - Randomized gating (the 20 % Subscribe roll, the 2–3-day random Intentions cooldown) is opaque to the user. If it stays, say so in the widget (e.g. "appears every 2–3 days").
  - Most interactive widgets (Micro Game, Calculator, Quantum Sign, Cohort Connect, Memory skip) leave **no trace in the Log**, so the record is incomplete.
- **Rule of the order:** *every interaction gets one line; displays write nothing.* That keeps the Log as a ledger of acts, not views.

---

## 5 · 15-month month-to-month UI reveal audit

**Finding:** there is **no calendar-based reveal** in the code. Reveal is level- and exploration-based (`utils/interfaceEvolution.ts → getFeatureUnlocks`), and **only 2 widgets** honour it (`PatternInsightsWidget`, `MoodAnalytics`). Pro users (R&D / Usership) get roughly 45 widgets on day 1. The basic layout shows Time, Memory, Game and Subscribe.

**Proposed 15-month build-up** (each month unlocks one stack, driven by `accountAgeMonths` or a `featureUnlockLevel` floor):

| Mo | Reveal | Widgets |
|---|---|---|
| M1 | Ground | Time, Weather, Memory, Recipe/Fasting |
| M2 | Breath | Check-in, Self-care, Breathe |
| M3 | Direction | Intentions, Planner |
| M4 | Context | Contextual Prompts, Interventions |
| M5 | Body | Energy Capacitor, Chakra Ergonomics |
| M6 | Story | Narrative, Goal Journey |
| M7 | Community | Pattern Insights, Mood Analytics, Cohort Connect, Chat Catalyst |
| M8 | Play | Micro Calculator / Game / Image |
| M9 | Calendar | Calendar, Monthly Pulse |
| M10 | Quantum I | Quantum Engine Connect, Quantum Sign |
| M11 | Quantum II | Biofield stack (State, Pattern Recognition, Signal Stream, Integrity, AI Feedback) |
| M12 | Instrument | User Metrics, Correlated Indexes, System Pulse |
| M13 | Collective | Stats ×6 |
| M14 | Architect | System Progress, Architect, Benchmark |
| M15 | Cosmos | Cosmic Update, Flash Drive, Investor stack, 4D UI |

A side benefit: a month-1 user would mount about 6 widgets instead of about 45, which is the biggest possible load-time saving.

---

## 6 · Lag test (static)

| Surface | Finding | Severity |
|---|---|---|
| Initial JS | `app.js` was 730 KB: badges.ts 207 KB, SystemProgressWidget 177 KB, intentionEngine 140 KB, Logs 120 KB. SystemProgressWidget is split now. | fixed partly |
| Further splits | `badges.ts` (207 KB static registry) and `Logs.tsx` (120 KB, a separate route) are the next lazy-load candidates, worth another ~300 KB. | 🟡 |
| Re-render storm | `System` subscribes to more than 15 stores, and every SSE tick re-runs all the IIFE gates. The gates are cheap now that they're stabilized, but the remaining widgets aren't memoized. | 🟡 |
| Eager mounts | Only QIE Connect, SystemProgress and Stats are viewport-deferred. Biofield (5 widgets) and Dashboard are next. | 🟡 |
| Polling | 7 queries poll every 2 minutes (`/api/stats/*`, AI usage). They're now deferred to the viewport, with `refetchIntervalInBackground: false`. ✅ | 🟢 |
| Sounds | 4 separate `AudioContext` instances (`sound.ts`, `sovietChime.ts`, `sovietGameSounds.ts`, `sovietKeyboard.ts`). Browsers cap concurrent contexts, and each one needs its own resume after a user gesture, so the first click can lag. Consolidate into one shared context. | 🟡 |
| Timers | `MemoryWidget` has 13 `setTimeout` calls against 1 `clearTimeout`; `EmotionalCheckIn`, `RecipeWidget` and `PlannerWidget` have 3–4 each with no cleanup. That risks setState after unmount (harmless on React 18) and stray UI transitions when switching tabs quickly. | 🟢 low |
| Intervals | Every `setInterval` across widgets has a matching `clearInterval`. ✅ | 🟢 |
| Listeners | Every `addEventListener` has a matching `removeEventListener`. ✅ | 🟢 |
| Controls | The sound toggle debounces with `isSoundToggling` (300 ms) ✅. Breathe and Radio toggles are synchronous state flips ✅. | 🟢 |

---

## 7 · Data storing and testing

- **localStorage without try/catch:** still unguarded in `IntentionsWidget` (5 accesses), `QuantumSignWidget` (4), `InvestmentSwitch` (5), `SubscribeWidget`, `AngelInvestorWidget`, `CorporatePlanWidget`, `DemoDayWidget`, `FourDimensionalUI`, `FlashDriveManifest`, `EvolutionMilestoneToast`. The same fix as §1.1 applies; the next run should use a shared `safeStorage` helper.
- **Badge registry collisions (🔴):** `elixir_found` is defined at `badges.ts:4825` and `:6883`, and `quarter_drop` at `:3214` and `:5501`. In each case the later definition silently replaces the earlier one, so one "Quarter Drop" (first easter egg) and one "Elixir Found" variant **can never unlock**. The esbuild build warns about both. Rename one of each, for example `quarter_drop_midnight`. This needs a product decision.
- **Stale data:** `USERSHIP_TRANSMISSION` is still dated **2026-08-05 / Badge v31 / 781 badges**, while the Codex is at v33 / 843 (SR-20261117). Widgets show stale copy.
- **Tests:** the repo has no unit or integration tests for widgets; `test:cold-start` is the only automated check. Recommendation: one Playwright smoke test that loads `/` with a seeded user and asserts every `WidgetErrorBoundary` rendered without falling back.
- **Client type debt:** 103 errors, of which 36 are in `badges.ts` (category literals `mastery`, `behavioral`, `calendar_easter_egg` missing from the `BadgeCategory` union) and 11 in `intentionEngine.ts`. They don't block the build (esbuild strips types), but they do hide real bugs, like the `selfcare` one fixed here.

---

## 8 · Widget usage data log, platform-wide

There was no production DB access from this container, so **these counts aren't measured**. This is the instrumentation coverage that a usage report would depend on:

| Event (Log `event`) | Writer | Widget |
|---|---|---|
| `emotional_checkin` | server | EmotionalCheckIn |
| `self_care_complete` / `self_care_skip` / `self_care` | client/server | SelfCareMoments |
| `plan_set` | client | PlannerWidget |
| `calendar_entry` | client | CalendarWidget |
| `note` (recipe) | client | RecipeWidget |
| `answer` | server | MemoryWidget |
| `intention` | server | IntentionsWidget (server path) |
| `quantum_intent_signal` | server | QIE |
| `generated_story` | server | Narrative/Story |
| `system_feedback` | server | SystemProgressWidget |
| `badge_unlock` | server | Badges |
| `os_vitals_snapshot` / `os_signal_report` | server | SystemProgress OS Journal |

**SQL for the next run (needs DB):**
```sql
SELECT event, COUNT(*) AS n, COUNT(DISTINCT "userId") AS users,
       MAX("createdAt") AS last_seen
FROM logs
WHERE "createdAt" > now() - interval '30 days'
GROUP BY event ORDER BY n DESC;
```

---

## 9 · Next-run queue (priority order)

1. 🔴 Resolve the `elixir_found` / `quarter_drop` badge collisions.
2. 🔴 Add `postWidgetLog()` (military format, §3) and instrument the ~10 interactive widgets that leave no trace.
3. 🟡 Put `usersOnline` into `getLogContext()`.
4. 🟡 Lazy-split `Logs.tsx` and `badges.ts`, and add `LazyMount` to the Biofield and Dashboard stacks.
5. 🟡 Merge the 4 AudioContexts into 1.
6. 🟡 Add a `safeStorage` helper across the remaining 10 widgets.
7. 🟢 Implement the 15-month reveal gate (§5).
8. 🟢 Refresh `USERSHIP_TRANSMISSION` to v33.

// END TRANSMISSION
