# LOT® WIDGET HEALTH SCAN — 2026-11-23

```
SCAN ID      WHS-20261123-01
BRANCH       claude/charming-albattani-ql4hko  (base: master 9f2b88c)
SCOPE        src/client/components/** · src/client/stores/** · /api routes
OPERATOR     scheduled routine (automated, no live user)
BUILD        yarn build ............................ PASS
TYPECHECK    tsc server ............................ PASS (0 errors)
TYPECHECK    tsc client ............................ 95 errors (baseline 104, −9; all pre-existing, non-blocking)
STATUS       GREEN · 7 defects fixed · 6 findings open
```

---

## 0 · SITREP

| # | Severity | Widget / Area | Defect | Status |
|---|----------|---------------|--------|--------|
| 1 | **CRITICAL** | `UserMetricsWidget` (CQGS Dashboard) | `classifyPhysiologicalCohort()` called with **no arguments** → `signals.filter` TypeError on every render. Because it sits in the `Dashboard` error boundary, it also hid **CorrelatedIndexes, SystemProgress and SystemPulse**. | FIXED |
| 2 | **HIGH** | `MonthlyPulseWidget` (15-month reveal) | `/api/me` never returned `joinedAt` → `monthNumber` always 0 → the monthly pulse **never fired** for any user. | FIXED |
| 3 | HIGH | `/api/export/all-logs` | Advertised on the API page (“Complete activity log”) but **no server route existed** (404). This is the platform's full widget-usage data log. | FIXED (route added) |
| 4 | MED | `MemoryWidget` | Double-tap within 30 s → server returns `{ok, duplicate}` with no `response` → widget rendered the literal string **"undefined"** above the stoic reflection. | FIXED |
| 5 | MED | `UserMetricsWidget` physiology view | Read `qieCohort.label` / `.dominant` — fields don't exist (`archetype` / `dominantModule`). Rows rendered blank. | FIXED |
| 6 | MED | `QuantumEngineWidgets` user index | `dimensions.selfcare` vs real key `selfCare` → **CARE** row always blank. | FIXED |
| 7 | LOW | `System.tsx` weather | `humidity` null → rendered `null%`. | FIXED (`—%`) |
| P1 | PERF | `useBreathe` (System tab + Log) | 100 ms tick called `setState` with a new object every tick → whole System tab re-rendered **10×/s** while Breathe was on. Now deduped (re-renders only when the visible frame changes). | FIXED |
| P2 | PERF | Initial bundle | `SystemProgressWidget` (~181 KB of changelog data) + `ArchitectWidget` now `React.lazy` + `Suspense`. | FIXED |

---

## 1 · Widgets wiring, data storing, testing

64 component files; 46 widget mount points in `System.tsx`, wrapped by 25 `WidgetErrorBoundary` groups.

| Data layer | Widgets |
|---|---|
| **Server (react-query → `/api`)** | Memory, Calendar, Planner, Recipe, EmotionalCheckIn, SelfCareMoments, CohortConnect, ContextualPrompts, ChatCatalyst, Interventions, GoalJourney, PatternInsights, CorrelatedIndexes, CosmicUpdate, UserMetrics, AIFeedback, Evolution, Narrative, Integrity, Benchmark, QuantumSign, SystemProgress, EnergyCapacitor |
| **QIE store (localStorage `intention-signals` + `/api/quantum-intent/sync`)** | IntentionsWidget, MicroCalculator, MicroGame, MicroImage, QuantumRandom, SignalStream, SystemPulse, ChakraErgonomics, Architect |
| **Pure display / static** | TimeWidget, Subscribe, AngelInvestor, CorporatePlan, DemoDay, MonthlyPulse (needs `me.joinedAt`) |

**Route audit** — every `/api/*` string in the client was matched against Fastify routes. 70 client paths, 1 unmatched in the authenticated API: `/api/export/all-logs` (now added). The three `/api/public/*` “misses” are false positives (registered under the `/api/public` prefix).

**Testing** — the repo has no unit-test runner (only `test:cold-start`, which needs a live host). Verification this run = full production build + server/client `tsc` + bundle metafile analysis. *No browser click-through was possible: no database in the container.* **Recommendation:** add a Vitest smoke that mounts each widget with a mocked `queryClient` — finding #1 would have been caught on day one.

**Dead files** — `JournalReflection.tsx` and `AwarenessDashboard.tsx` aren't imported anywhere (AwarenessDashboard also has a TS error). Candidates for removal or re-wiring.

---

## 2 · Wiring with LOT® AI, the System tab and Portrait (profile)

- **System tab** — fixing #1 brings the CQGS Dashboard group back (UserMetrics → CorrelatedIndexes → SystemProgress → SystemPulse). This was the largest outage found.
- **LOT® AI** — Memory answers return `response` and, for 10+ answers, a pattern `insight` (shown only when `advancedMemory` is unlocked). The client mutation type said `{ response }` only. It now declares `insight`/`duplicate` too.
- **Portrait (`PublicProfile.tsx`)** — 5 open TS errors: it reads `version`, `streak` and `patternStrengthIndex`, but the usership type doesn't declare them. Runtime falls back with `?.`, so these are type drift, not crashes. **OPEN — align the `/api/public/profile` response type.**

## 3 · Wiring with LOT® Quantum Intent Engine, Memory and Story

- 27 of 46 widgets emit QIE signals (`recordSignal` and its variants), so QIE input coverage is healthy.
- `MicroGameWidget` records with source `'micro_game'`, which isn't in the QIE source union (TS error). This works at runtime but isn't typed. **OPEN.**
- Story/Narrative reads `useNarrative()` plus `featureUnlocks.narrativeReflection` (evolution store). It's wired.
- `badges.ts` has **duplicate keys** `quarter_drop` and `elixir_found` (esbuild warning). The later definition silently overrides the earlier one, so one badge of each pair is unreachable. **OPEN — needs a codex decision, not auto-fixed.**

## 4 · Data container vs. data display → context sync → Log

| Posts to the Log (server) | Signal-only (QIE, local + sync) | Display-only |
|---|---|---|
| SelfCare (`self_care_complete/skip`), Calendar (`calendar_entry`), Planner (`plan_set`), Recipe, Memory (answers), EmotionalCheckIn | Intentions, Micro*, Chakra, Interventions, Prompts, Cohort, Goal, Narrative, PatternInsights/Recognition, QuantumRandom, EnergyCapacitor | Time, Weather block, SystemPulse, Subscribe, investor cards, MonthlyPulse |

**Military-format context sync — proposal (not built this run).** Interactive widgets that post today send free text only. A standard context envelope would make every post self-describing:

```
LOG · 2026-11-23 07:14 · SELF-CARE · COMPLETE
CTX  WX +4°C OVC 81% · T 07:14 LOCAL · ONLINE 12 · ATP 64 · PHASE MORNING
```

The data is already client-side: `stores.weather`, `me.usersOnline`, `getCircadianPhase()` and `getUserState()`. One helper `withContext(log)` in `useCreateLog` would cover all 6 posting widgets at once.

## 5 · Monk lifestyle / pure, transparent operation

Transparency means the user can see and take everything the system knows about them. Before this run, the “Complete activity log” export was a dead link. It now returns a full CSV (`Date,Time,Event,Text,Context`, capped at 50k rows, user-scoped). Next step: add an export of the QIE local signal store (`intention-signals`), which currently stays in the browser only.

## 6 · 15-month UI reveal (month-to-month build-up)

- `MonthlyPulseWidget` messages cover months 1–12, then fall back to a generic line. With `joinedAt` now in `/me`, months 1–15 resolve correctly. **OPEN: write copy for months 13–15** to finish the 15-month arc.
- The feature-unlock gates (`$featureUnlocks`: patternInsights, moodPatterns, narrativeReflection, advancedMemory, intentionHistory) are driven by `useEvolutionSync` (usage level). They don't depend on calendar months, so reveal speed follows engagement, not tenure. This is a design note; it's consistent with the doctrine.

## 7 · Widget loading speed

| Asset | Before | After | Δ |
|---|---|---|---|
| `app.js` (min) | 730,033 B | 532,102 B | **−27%** |
| `app.js` (gzip) | 184,584 B | 132,948 B | **−28%** |

Top remaining weight in the initial bundle: `utils/badges.ts` 212 KB · `Logs.tsx` 123 KB · `intentionEngine` 143 KB (shared chunk). **Next candidate:** split the `BADGES` table out of `badges.ts` so `app.tsx` imports only `hydrateBadgesFromServer`. That's roughly another 200 KB.

## 8 · Lag test (buttons · sounds · controls · loading)

| Item | Finding |
|---|---|
| Timers | All widget `setInterval`s have a matching `clearInterval`, except `initRecipeWidget` (5 min, app-lifetime, intentional). TimeWidget 1 s, LoadingDots 500 ms, MicroCalculator 10 s are OK. |
| Breathe | 10 Hz full-tab re-render → fixed (P1). |
| SystemProgress | The 60 s assembly recompute already pauses off-tab and when the page is hidden. Good. |
| **Sounds** | **5 separate `AudioContext`s** (`sound.ts`, `sovietChime`, `sovietKeyboard`, `sovietGameSounds`, `plannerWidget`). Each one has wake-up latency on first tap, and iOS limits concurrent contexts. **OPEN — consolidate into one shared context.** |
| Buttons | Memory double-submit fixed (#4). The server-side 30 s dedupe stays as the backstop. |

## 9 · Data log of widget usage across the platform

- Server: `GET /api/export/all-logs` (new) returns every Log event per user.
- Server: `POST /api/quantum-intent/sync` receives QIE signal snapshots.
- No per-widget open/impression counter exists yet. **OPEN — proposal:** have `WidgetErrorBoundary` emit a lightweight `widget_view` signal on mount. That gives a platform-wide usage heat-map with no per-widget code.

---

## Files changed

```
src/client/components/UserMetricsWidget.tsx   cohort call args + field names (#1, #5)
src/server/models/user.ts                     useProfileView picks joinedAt (#2)
src/shared/types/index.ts                     UserProfile.joinedAt (#2)
src/server/routes/api.ts                      GET /export/all-logs (#3)
src/client/components/MemoryWidget.tsx        duplicate/empty response guard (#4)
src/client/queries.ts                         memory answer response type (#4)
src/client/components/QuantumEngineWidgets.tsx selfCare key (#6)
src/client/components/System.tsx              humidity null (#7) · lazy SystemProgress/Architect (P2)
src/client/utils/breathe.ts                   setState dedupe (P1)
docs/diagnostics/WIDGET-HEALTH-20261123.md    this report
```

## Open queue (next run)

1. Vitest widget mount smoke suite.
2. Shared AudioContext.
3. Split `BADGES` table out of the initial bundle.
4. Resolve badge duplicate keys `quarter_drop` / `elixir_found`.
5. Portrait public-profile type drift (5 errors) and the QIE `'micro_game'` source type.
6. Monthly Pulse copy for months 13–15.
7. `withContext()` military log envelope and `widget_view` usage signal.
