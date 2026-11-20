# LOT® Widget Health Scan — 2026-11-20

Scheduled routine · branch `claude/charming-albattani-ord6up` · base `9f2b88c`

```
STATUS ........ GREEN (build passes, no new type errors)
FIXES PUSHED .. 4
OPEN ISSUES ... 7 (need owner decision or larger work)
LAG TEST ...... static analysis only (no live server/DB in this container)
```

---

## 1. Executive summary

| # | Finding | Severity | Action |
|---|---|---|---|
| F1 | `QuantumRandomWidget` wrote a QIE signal every 1–72 s with no user action (~320/h). Every signal re-renders the 7 `intentionEngine` subscriber widgets, and the 1000-signal buffer filled in ~3 h, evicting real user signals (mood, memory, check-ins) | **High** (lag + data quality) | **Fixed** — throttled to 1 per 10 min, visible tab only |
| F2 | `SystemProgressWidget` (~180 KB minified, mostly static changelog text) was in the initial app bundle | Medium (load speed) | **Fixed** — code-split with `React.lazy` together with `ArchitectWidget` |
| F3 | `RecipeWidget` auto-log posted as event `note`, but the Log `NUTR:` handler, `scheduled-jobs.ts` source maps and `/api` assembly map expect `recipe_viewed` | Medium (wiring) | **Fixed** — posts `event: 'recipe_viewed'` + `{ mealType, recipeName }` |
| F4 | Duplicate badge keys `quarter_drop`, `elixir_found` in `BADGE_DEFINITIONS`; the first definitions were silently overwritten (esbuild warnings + TS1117) | Low | **Fixed** — dead first definitions removed (runtime behavior unchanged) |
| F5 | `BadgeDefinition.category` type lacked `'behavioral'` and `'calendar'` (15 badges use them) | Low | **Fixed** — type widened; client type errors 104 → 86 |
| O1 | **LOT® AI: `ClaudeEngine` and `memory.ts` user summary pin `claude-3-5-sonnet-20241022`, a retired model.** Every call to it fails; the admin user summary (`memory.ts:1095`) has no fallback | **High** | **Not changed** — model choice and cost are the owner's decision (see §3) |
| O2 | `/api/export/all-logs` is listed on the API page (`ApiPage.tsx:62`) but no server route exists → 404 | Medium | Open |
| O3 | `POST /api/logs` accepts any `event` string from the client, so a client can write `badge_unlock`, `goal_complete`, etc. | Medium (integrity) | Open — add an allow-list of client-writable events |
| O4 | 7 of 14 "feature unlocks" are shown as unlocked in `InterfaceEvolutionWidget` but gate nothing (`plannerTemplates`, `communityRich`, `customThemes`, `badgeSelection`, `widgetArrange`, `exportData`, `privateSpaces`); `achievementGallery` is never read | Medium (UX honesty) | Open |
| O5 | No month-based (15-month) reveal exists; gating is engagement-score based and touches only 5 widgets | Product | Proposal in §6 |
| O6 | No widget-usage telemetry exists anywhere on the platform (no view/interaction events) | Product | Proposal in §8 |
| O7 | Log context stamps time, city, timezone and weather, but **not users online** | Low | Open |

---

## 2. Widget wiring, data storage, testing

**Inventory:** 64 component files; 49 widgets mounted on the System tab (`System.tsx`), every stack wrapped in a `WidgetErrorBoundary`.

| Storage layer | Widgets |
|---|---|
| Server (`/api/*`, react-query) | Memory, Narrative/Story, Energy, Planner, Calendar, Recipe, SelfCare, Check-in, Cohort, Chat Catalyst, Interventions, Contextual Prompts, Stats ×6, System Pulse/Progress, Cosmic Update |
| Client atom `intentionEngine` (localStorage `intention-signals`, 7-day / 1000-signal cap) | QuantumState, PatternRecognition, AIFeedback, SignalStream, SystemPulse, QuantumEngine, UserMetrics |
| localStorage only | Intentions, QuantumSign, MonthlyPulse, Subscribe, Investor stack (Angel/Corporate/DemoDay) |
| Ephemeral (no storage) | Time, QuantumRandom, MicroCalculator, MicroGame, MicroImage |

- All 46 distinct `/api/...` endpoints the widgets call exist on the server, except `/api/export/all-logs` (O2).
- `/api/logs` GET is bounded (`limit: 500`); the client comment in `queries.ts:136` saying "no LIMIT" is out of date.
- **Testing:** the repo has no unit or component tests for widgets (only `scripts/tests/test-cold-start.ts`). Verification this run was: production client build, `tsc` client + server, bundle-graph inspection.

## 3. Wiring with LOT® AI, System tab, Portrait

- AI engine fallback order: `ollama → together → gemini → mistral → claude → openai` (`ai-engines.ts:585`). `isAvailable()` only checks that a key is set, so a configured Claude key with a retired model fails at call time, not selection time.
- **O1, retired model references:** `server/utils/ai-engines.ts:139`, `server/utils/memory.ts:1095`, `server/routes/public-api.ts:706`. The other engines are also old: `gpt-4-turbo-preview` (`:189`), `gemini-1.5-pro` (`:368`). Suggested replacement for the Claude paths is `claude-sonnet-5-5` (current Sonnet, same tier as the existing code) or `claude-opus-5-5` (current default). Swap the model string; the `messages.create` call shape works as is. Confirm cost tier first.
- AI-backed widget routes: Memory questions/story, Narrative, Cosmic Update (Together image), Contextual Prompts, Interventions, `/world/generate-element`.
- **Portrait (`PublicProfile.tsx`)** reads `/api/public/...` profile data only. No System widget writes to the Portrait directly. Shared data comes through the profile and logs.

## 4. Wiring with Quantum Intent Engine, Memory and Story

- 36 `recordSignal` call sites across components. 7 widgets subscribe to the whole atom with `useStore(intentionEngine)`, so any signal re-renders all 7 (F1 was the worst trigger).
- Persistence is already coalesced (`schedulePersist`, 250 ms) and idle-scheduled. Good.
- Memory → Story: `/api/memory`, `/api/memory/answer`, `/api/memory/story` (limit 100) and `/api/story` (limit 200). Wiring is intact.
- Suggestion: subscribe to a `computed()` slice (for example signal count or the last N) instead of the full atom, so widgets that only show counts re-render less.

## 5. Widgets as data containers / displays → military Log posts

Widgets that post to the Log today:

| Widget | Event | Military handler |
|---|---|---|
| Calendar | `calendar_entry` | yes |
| Planner | `plan_set` | yes |
| SelfCare | `self_care_complete` / `self_care_skip` | yes |
| Recipe | `recipe_viewed` *(fixed today, was `note`)* | `NUTR:` |
| Contextual Prompts (skip) | `note` (untyped, "Skipped prompt: …") | no. Suggest `prompt_skip` with a `PRMT:` handler |

The server stamps context on every log in `getLogContext`: time, city, timezone, temperature, humidity, weather description. Missing: **users online** (O7). That count is already computed in `/api/me` (`User.countOnline()`).

*Monk / self-care doctrine note:* posts are one line, typed, and timestamped with environment context, which fits the "transparent ledger" approach. The gaps are untyped `note` posts from automation (fixed for Recipe, still open for Contextual Prompts) and the open `event` field (O3).

## 6. 15-month UI reveal (Digital UX routine)

There is currently **no calendar-based reveal**. The reveal is driven by `calculateEvolutionState` (level, depth, consistency, connection…), and only Memory, Narrative, MoodAnalytics, PatternInsights and EvolutionMilestoneToast read `$featureUnlocks`. Proposed month map, using `daysSinceStart` already computed in `System.tsx:258`:

| Month | Reveal |
|---|---|
| 1 | Time, Weather, Memory, Check-in, Self-care |
| 2 | Recipe, Planner, Intentions |
| 3 | Calendar, Mood Analytics |
| 4 | Narrative / Story, Goal Journey |
| 5 | Cohort Connect, Chat Catalyst |
| 6 | Energy Capacitor, Chakra Ergonomics |
| 7 | Pattern Insights, Contextual Prompts |
| 8 | Quantum State, Signal Stream |
| 9 | Pattern Recognition, AI Feedback |
| 10 | Integrity, Correlated Indexes |
| 11 | User Metrics, System Pulse |
| 12 | Quantum Engine Connect |
| 13 | Interface Evolution + real `widgetArrange` |
| 14 | `exportData` (needs O2) + `privateSpaces` |
| 15 | System Progress / Architect (full telemetry) |

## 7. Loading speed

Production client build (`NODE_ENV=production`), app entry plus statically imported chunks:

| | Minified | Gzip |
|---|---|---|
| Before | 1,419,895 B | 380,579 B |
| After | 1,230,427 B | 332,388 B |
| **Δ** | **−189 KB (−13 %)** | **−48 KB (−13 %)** |

Largest remaining contributors in the app graph: `utils/badges.ts` 212 KB (badge copy text), `stores/intentionEngine.ts` 148 KB, react-dom 130 KB, `Logs.tsx` 123 KB.
Next wins: move badge `description` / `unlockMessage` text into a lazily loaded JSON, and code-split `Logs.tsx` per tab.

## 8. Lag test (static)

| Area | Result |
|---|---|
| Timers | TimeWidget, ChakraErgonomics, ContextualPrompts, SystemPulse and SystemProgress gate on tab visibility ✔. QuantumRandom (3 intervals, 1 s / 1 s / 10 s), MicroCalculator (10 s) do not. Browser throttling limits the cost, and F1 removes the expensive part |
| Game loop | MicroGame runs only in the viewport ✔ |
| Sounds | 5 separate `AudioContext` singletons (`sound.ts`, `sovietChime`, `sovietKeyboard`, `sovietGameSounds`, `plannerWidget`). Each is lazily created and reused ✔. Browsers cap concurrent contexts, so consolidating into one shared context is recommended |
| Tab switch | System tab unmounts when inactive (`app.tsx:157`) ✔ |
| Polling | Stats queries refetch every 2 min, not in background ✔ |

**Widget usage data log (O6):** nothing records widget views or interactions today. Proposal: a `recordWidgetUsage(widget, action)` helper that batches into one `widget_usage` log per session (counts per widget), surfaced as a `USE:` military row and an admin aggregate.

---

## 9. Verification

```
client build (prod) ...... PASS (duplicate-key warnings: 2 → 0)
tsc client ............... 104 → 86 errors (0 new; remaining are pre-existing)
tsc server ............... 0 errors
runtime smoke test ....... NOT RUN (no DB/server in routine container)
```

Files changed: `System.tsx`, `QuantumRandomWidget.tsx`, `RecipeWidget.tsx`, `utils/badges.ts`.
