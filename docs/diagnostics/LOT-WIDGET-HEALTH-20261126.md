# LOT® Widget Health Scan — 2026-11-26

> Scheduled routine · branch `claude/charming-albattani-guuj99` · base `master@9f2b88c`
> Scope: widget wiring, data storage, LOT® AI / System / Portrait wiring, QIE · Memory · Story wiring, 15-month reveal, load speed, lag, usage data log.

---

## 0 · SITREP (read this first)

| | |
|---|---|
| **Status before fix** | 🔴 **RED: the whole app crashes on master** for any user with stored QIE signals |
| **Status after fix** | 🟢 GREEN: 0 runtime crashes, 0 API errors, 52 System-tab widget labels rendered (was 0) |
| **Fixes on this branch** | 10 defects fixed across 12 files, plus 2 reusable test scripts |
| **Needs you** | Open a PR / merge to `master` to ship. Nothing is deployed by this routine |

**Headline defect.** `src/client/stores/intentionEngine.ts:3332` (Pattern 147 "Quantum Presence Field", added in QIE v112, commit `1846b80`) references `dayMs`, a variable that only exists in *other* functions. `lastAnalysis` boots at `0`, so the first `analyzeIntentions()` after page load always reaches this line. `System.tsx` then calls `getOptimalWidget()` during render with no guard. The result is `ReferenceError: dayMs is not defined`, then the App-level error boundary shows **"Something went wrong · dayMs is not defined"** in place of the entire System tab. This was reproduced live in Chromium against a local production build. The QIE benchmark also reproduces it on its own.

---

## 1 · Method

| Layer | What was run |
|---|---|
| Static | Per-widget scan of 50 widget components: timers set vs cleared, listeners, QIE `recordSignal` calls, Log writes, data hooks, error-boundary placement, lazy mounting |
| Types | `tsc --noEmit` client (104 → 98 errors, all remaining ones pre-existing) and server (0) |
| Bundle | esbuild metafile, production minify, gzip size per input |
| Engine | `scripts/tests/qie-bench.ts`: QIE hot path at 100 / 500 / 1000 signals |
| Live | Local Postgres 16 + migrations + production server + Playwright: `scripts/tests/widget-health-lag.cjs` (500 seeded QIE signals, a 14-month Usership test user, click→paint latency, request fan-out, console/runtime errors) |
| Build | `NODE_ENV=production npm run build`: **green** |

> No production data is reachable from this sandbox, so the usage numbers in §9 describe the *instrumentation*, not real traffic.

---

## 2 · Defects found and fixed

| # | Sev | Where | Defect | Fix |
|---|---|---|---|---|
| 1 | 🔴 P0 | `stores/intentionEngine.ts:3332` | `dayMs` not in scope, so the **entire app crashes**. Also, because analysis never completed, the 5-min cooldown never engaged: a full 151-pattern scan ran on every call, then threw | Local `dayMs147` constant |
| 2 | 🔴 P0 | `components/System.tsx` | `getOptimalWidget()` / `analyzeIntentions()` ran unguarded in render/effect, so one bad QIE pattern could take down the whole System tab | `try/catch` with `console.warn` |
| 3 | 🟠 P1 | `components/EvolutionWidget.tsx` | `useMemo` sat **after** an early `return null`, causing React #310 "Rendered more hooks". It crashed the **whole Bioethics group**: Chakra, Narrative/Story, GoalJourney, Evolution, InterfaceEvolution, MilestoneToast | Hoisted the hook above the early return |
| 4 | 🟠 P1 | `hooks/usePunctuationContext.ts` | `data: logs = []` gave a new array every render. The effect writes the store unconditionally, so render → new `[]` → effect → … → React #185 "Maximum update depth". It crashed the **Community group** (PatternInsights, CohortConnect) and looped MicroImageWidget | Effect only runs on real react-query data |
| 5 | 🟠 P1 | `components/System.tsx` | Same `= []` shape on a `[logs]` effect that runs `analyzeIntentions` + `setQuantumState`, so it re-ran every render while logs were loading or errored | Module-level `EMPTY_LOGS` |
| 6 | 🟠 P1 | `components/UserMetricsWidget.tsx:98` | `classifyPhysiologicalCohort()` called with **0 of 3 args**: `TypeError` on `signals.filter`, in the Dashboard group | Passes `signals, getUserState(), recognizedPatterns` |
| 7 | 🟠 P1 | `server/routes/api.ts` `/stats/badges` | `include: User` on `Log`, but no association exists: `SequelizeEagerLoadingError`, **always 500**. BadgeUnlockFeed never rendered | Batched `User.findAll` by `userId` |
| 8 | 🟠 P1 | `server/routes/api.ts` `/community-emotion` | Selected a non-existent `emotionalState` column (it lives in `metadata`), **always 500**. The "Shared emotion:" toggle sat on "Calculating..." forever | Reads `metadata.emotionalState` |
| 9 | 🟡 P2 | `entries/app.tsx` + `server/index.ts` | **Request storm.** One System-tab load = **106–121 requests** (≈45 API plus static chunks), against a global **100/min per-IP** limit, so **30 × 429**. react-query's default 3 retries turned each 429 into 4 requests (the stats endpoints showed exactly 4×) | Never retry 4xx, retry 5xx/network ≤ 2. `/js/` and `/css/` bundles exempt from the limiter (API ceiling unchanged) |
| 10 | 🟡 P2 | `server/models/user.ts` + `shared/types` | `/api/me` omitted `joinedAt`, so `MonthlyPulseWidget` month = 0 forever. **The month-to-month reveal pulse never appeared for anyone** | `joinedAt` added to the self-only profile view |
| 11 | 🟡 P2 | `components/QuantumEngineWidgets.tsx:472` | `dimensions.selfcare` (should be `selfCare`), so the CARE row was always blank | Key corrected |
| 12 | 🟢 P3 | `components/QuantumRandomWidget.tsx` | `recordSignal()` + `setNumber()` inside a `setState` updater (runs during render), causing "Cannot update a component while rendering a different component" every cycle | Ref-driven tick, side effects outside the updater |

### Before → after (live, production build, same seeded user)

| Metric | master (before) | this branch (after) |
|---|---|---|
| App state | **Crashed** (`dayMs is not defined`) | Renders |
| System tab visible | never (20 s timeout) | ~0.85 s from navigation |
| Widget labels rendered | **0** | **52** |
| Crashed widget groups | entire app | 0 |
| API responses 4xx/5xx | n/a (app dead); 30 × 429 + 2 × 500 once crash #1 was patched | **0** (45–49 × 200) |
| Runtime errors / React warnings | 2 | 0 (only CSP inline-style notices, see §8) |
| FCP / DCL | 144 / 120 ms | 168 / 145 ms |
| Long tasks during load | n/a | 1 × ~115 ms |

---

## 3 · Lag test (buttons · sounds · controls · loading)

Click → next paint, 5 samples each, headless Chromium, production build:

| Control | p50 | max | Verdict |
|---|---|---|---|
| Users online ⇄ Shared emotion | 13.6 ms | 14.2 ms | ✅ ≤ 1 frame |
| Breathe | 14.3 ms | 14.4 ms | ✅ |
| Sound / Radio | 14.8 ms | 15.2 ms | ✅ |
| Sky (weather) | 14.1 ms | 14.6 ms | ✅ |
| Time (12/24h) | 14.1 ms | 18.9 ms | ✅ |

All interactive Blocks respond within one 60 Hz frame (~16.7 ms). On master these could not be measured because nothing rendered.

**QIE engine hot path** (`scripts/tests/qie-bench.ts`, Node, desktop CPU):

| Signals | `recordSignal` (button press) | `analyzeIntentions` cold (151 patterns) | `getOptimalWidget` cold |
|---|---|---|---|
| 100 | 0.05 ms | 5.7 ms | 3.0 ms |
| 500 | 0.04 ms | 7.9 ms | 6.1 ms |
| 1000 (cap) | 0.6 ms | 8.1 ms | 7.9 ms |

Button presses are cheap. Persistence is already coalesced (250 ms). A full analysis costs about 8 ms on desktop, roughly 30–40 ms on a mid-range phone. That is acceptable now that the 5-minute cooldown works again (it was bypassed while bug #1 was live).

**Sounds.** No widget plays audio directly. Sound is centralised in `utils/sound.ts` (System "Sound:" Block + TimeWidget hourly chime). The toggle measured 14.8 ms p50. No lag issue.

---

## 4 · Loading speed

Critical JS for the System tab (production, minified): **1,356 KB / 361 KB gzip in 3 chunks**.

| Top inputs | KB (min) |
|---|---|
| `utils/badges.ts` | 207 |
| `components/SystemProgressWidget.tsx` | 177 |
| `stores/intentionEngine.ts` | 140 |
| `react-dom` | 127 |
| `components/Logs.tsx` | 120 |
| All widget components together | 424 |

**Code-splitting attempt: reverted.** `React.lazy()` on SystemProgressWidget + ArchitectWidget cut the critical path by **−183 KB min / −46 KB gzip (−13%)** in the metafile. In the browser, though, it failed with `Dynamic require … is not supported`. The cause is `scripts/build/build.config.ts`, which targets `chrome58 / firefox57 / safari11`: those browsers predate dynamic `import()`, so esbuild cannot emit lazy chunks. The change was reverted and is **not shipped**.

**Recommendation (needs your call):** raise the build target to `chrome63 / firefox67 / safari11.1` or later. ESM `<script type=module>` already requires about chrome61 / safari11. That unlocks lazy-loading SystemProgressWidget (177 KB, mostly static assembly history), Logs.tsx and the badge codex, for roughly −25–30% on the critical path.

Already in place: `LazyMount` (viewport-deferred mount) wraps only `QuantumEngineWidgets`. Candidates to wrap next: IntegrityWidget, PatternRecognitionWidget, SystemProgressWidget and the Stats group, all below the fold.

---

## 5 · Widget wiring matrix

Legend: **S** = writes QIE signals · **L** = writes Log entries (server) · **AI** = backed by an LLM-calling endpoint · **M/St** = Memory / Story (narrative) wiring · **P** = reads the profile / Portrait (`useProfile`).

| Widget | Data hooks / endpoints | S | L | AI | M/St | P | Boundary group |
|---|---|---|---|---|---|---|---|
| Time | local clock | | | | | | — |
| QuantumRandom | local | ✅ | | | | | — |
| Memory | `/api/memory` (+ create) | ✅ | ✅ answers | ✅ (Usership AI engine) | M | | Memory / Planning |
| MicroGame | local | ✅ | | | | | Game / Planning |
| Subscribe | — | | | | | | Subscribe |
| MonthlyPulse | `me.joinedAt` (**fixed**) | | | | | | MonthlyPulse |
| Recipe | logs | ✅ | ✅ | | | | Recipe |
| ContextualPrompts | `/api/contextual-prompts` | ✅ | | ✅ | M | | Context |
| ChatCatalyst | `/api/chat-catalysts` | ✅ | | ✅ | St | | Context |
| Interventions | `/api/interventions` | ✅ | | ✅ | St | | Context |
| ChakraErgonomics | local | ✅ | | | | | Bioethics |
| Narrative | `/api/narrative` | ✅ | | ✅ | **St** | | Bioethics |
| GoalJourney | `/api/goal-progression` | ✅ | | | St | | Bioethics |
| Evolution | narrative + logs | | | | St | | Bioethics (**fixed #3**) |
| InterfaceEvolution | evolution store | | | | St | | Bioethics |
| EmotionalCheckIn | `/api/emotional-checkins` | ✅ | ✅ | | | | Check-in |
| SelfCareMoments | logs, check-ins, profile | ✅ | ✅ | | | ✅ | Self-care |
| Intentions | log context | ✅ | | | | | Intentions |
| PatternInsights | `/api/patterns`, cohorts | ✅ | | | | | Community (**fixed #4**) |
| CohortConnect | `/api/cohorts`, energy, profile | ✅ | | | | ✅ | Community (**fixed #4**) |
| Planner | logs | ✅ | ✅ | | | | Planning |
| MicroCalculator | local | ✅ | | | | | Planning |
| MicroImage | punctuation ctx | ✅ | | | | | Planning (**fixed #4**) |
| CosmicUpdate / QuantumSign | logs / local | | | | | | own |
| FlashDrive / Investor ×3 | static | | | | | | own |
| QuantumEngineWidgets | QIE store (LazyMount) | | | | | | own (**fixed #11**) |
| QuantumState / PatternRecognition / SignalStream / Integrity | QIE store + logs | | | | M | | Biofield Engine |
| AIFeedback | logs + profile | | | ✅ | | ✅ | Biofield Engine |
| UserMetrics | `/api/os/*` | ✅ | | | | | Dashboard (**fixed #6**) |
| CorrelatedIndexes | `/api/os/indexes` | | | | | | Dashboard |
| SystemProgress | deployment, feedback, logs (read) | ✅ | | | M/St | | Dashboard |
| SystemPulse | `/api/system/pulse` | | | | | | Dashboard |
| Architect | static transmission | | | | | | Architect |
| Stats ×6 | `/api/stats/*` | | | | M | | Stats (**fixed #7**) |
| Calendar | logs | ✅ | ✅ | | | | Calendar |
| Benchmark | logs | | | | | | Benchmark |

**LOT® AI wiring.** The LLM-backed endpoints are `/user-profile` (Portrait), `/narrative` (Story), `/chat-catalysts`, `/contextual-prompts`, `/interventions`, and `/memory` (Usership AI engine). All of them answered 200 in the live run.

**Portrait.** `useProfile` → `/api/user-profile` is read by AIFeedback, CohortConnect and SelfCare. It was rate-limited (429) before fix #9.

**Structural risk.** Widgets share error boundaries in groups of up to 6, so one defect blanks the whole group. Bugs #3, #4 and #6 show the cost. **Recommendation:** one `WidgetErrorBoundary` per widget (cheap) so failures stay isolated.

### Data storage

| Store | Where | Retention |
|---|---|---|
| QIE signals | `localStorage['intention-signals']`, batched sync → server Log `quantum_intent_signal` | 7 days / 1000-signal cap, persist coalesced at 250 ms |
| User index / patterns | `localStorage['user-index']` + atom | recomputed (5-min cooldown) |
| Widget prefs (time format, chime, sound, theme) | nanostores persistent → `localStorage` | indefinite |
| Answers, plans, check-ins, self-care, recipes, calendar | server `logs` / `answers` tables | indefinite |
| MonthlyPulse dismissal | `localStorage['lot_pulse_<userId>']` | per month |

---

## 6 · 15-month month-to-month reveal

**What the code actually does today.** The UI reveal is driven by **level, streak and achievements**, not by calendar month (`utils/interfaceEvolution.ts → getFeatureUnlocks`). The only calendar-month component is **MonthlyPulseWidget**, and it was dead until fix #10. Two gaps remain:

1. **MonthlyPulse caps at 12.** A 14-month user sees "Month 12 · One year with LOT" again (verified live). The fallback `Month N. The journey continues.` is unreachable because of `Math.min(monthNumber, 12)`. Months 13–15 need copy, which is left for you rather than invented here.
2. **8 of 14 evolution unlocks gate nothing.** InterfaceEvolutionWidget advertises them, but no widget reads them: `plannerTemplates`, `communityRich`, `customThemes`, `badgeSelection`, `widgetArrange`, `exportData`, `privateSpaces`, `achievementGallery`. Six are real gates: `advancedMemory`, `moodPatterns`, `intentionHistory`, `narrativeReflection`, `patternInsights`, `socialMentions`.

**Proposed 15-month map** (draft for review, not implemented): add `monthsSinceJoin` (from `me.joinedAt`) as an input to `getFeatureUnlocks`, OR-ed with the existing level gates so early power users are not held back.

| Month | Reveal |
|---|---|
| 0 | Time · Sky · Users online · Memory · Breathe |
| 1 | Planner · Recipe · Self-care |
| 2 | Emotional check-in · Mood patterns |
| 3 | Intentions history · Narrative (Story) |
| 4 | Portrait depth (AIFeedback) · Cohort connect |
| 5 | Pattern insights · Energy capacitor |
| 6 | Custom themes · Badge selection |
| 7 | QIE dashboard (QuantumEngineWidgets) |
| 8 | Biofield Engine group |
| 9 | Widget arrange |
| 10 | Correlated indexes · System pulse |
| 11 | Private spaces |
| 12 | Export data · Year-one Portrait |
| 13 | Social mentions |
| 14 | Architect / System progress (full transparency) |
| 15 | Instrument density, all unlocks |

---

## 7 · Interactive context → Log ("military comms" self-care)

**Today.** 22 widgets emit QIE signals, and 6 write first-class Log entries (Memory, Recipe, Planner, SelfCare, EmotionalCheckIn, Calendar). 28 components are display-only: no signal, no Log.

**Interactive but silent.** MonthlyPulse (dismiss), TimeWidget (format/chime toggle) and the Integrity / Evolution / SystemPulse view cycles change state but leave no trace.

**Recommendation.** Add one helper, `logWidgetEvent(widget, action, extra?)`, that stamps synchronized context and writes a terse log line, so every interaction reads like a radio check:

```
0342Z · SYS/MEMORY · ACK · SKY CLEAR +12C · ONLINE 3 · QIE 0.71
0815Z · SYS/PLANNER · SET "deep work" · ONLINE 5
```

Context sources already in memory: `stores.weather`, `stores.usersOnline`, the clock, `getUserIndex().overall`. The helper should batch through the existing QIE sync to stay under the rate limit (§2 #9).

**Monk / transparency lens.** Signal data stays on the device (7-day, 1000-cap ring) until sync, and `useProfileView` exposes only self fields. To make LOT® AI fully transparent, add a log line whenever an AI-backed endpoint answers (`AI · NARRATIVE · consulted`), so the user can see each time the machine thought about them.

---

## 8 · Remaining issues (not fixed in this run)

| Sev | Item |
|---|---|
| 🟡 | **98 pre-existing TS errors** (badges.ts 36: badge `category` union missing `behavioral`/`calendar`; QIE `source` union missing `micro_game`/`ecosystem`; AdminUser typing; PublicProfile fields). These are type-only, but #1 and #6 above were both flagged by tsc. **Recommend making `tsc --noEmit` a CI gate.** |
| 🟡 | **Duplicate badge keys**: `quarter_drop` (badges.ts:3214 & 5501) and `elixir_found` (4825 & 6883). The later definition silently wins, so the earlier badge is unreachable. Needs an owner decision on which to keep or rename |
| 🟡 | Even with static assets exempt, about 45 API calls per load means 2 quick reloads inside a minute still hit 429 (seen during testing). Users behind shared NAT share the budget. Consider a per-user (session) key and a higher authenticated ceiling, or consolidate `/api/os/*` + `/api/stats/*` into one batched endpoint |
| 🟢 | CSP `style-src` blocks some inline `style=` attributes. These are cosmetic console noise, but those styles do not apply |
| 🟢 | `npm ci` fails on a peer conflict (`@nanostores/react@0.4.1` vs `nanostores@0.9.5`). Docker uses yarn, so production is unaffected, but local npm users need `--legacy-peer-deps` |
| 🟢 | `setTimeout` without cleanup in Memory (13/1), EmotionalCheckIn (4/0), Recipe (4/0), Planner (3/0), MonthlyPulse (3/0). Harmless in React 18, but tidy them for StrictMode |
| 🟢 | 7 queries poll every 2 min (background-paused), which is reasonable |

---

## 9 · Usage data log

There is no cross-user widget-usage aggregate on the server today. Per-user evidence exists as Log rows (`quantum_intent_signal`, `answer`, `plan_set`, `emotional_checkin`, `self_care_complete`, `badge_unlock`, …). `/admin-api/widget-diagnostic` only checks whether stats widgets have data.

**Recommendation.** Add `/admin-api/widget-usage?days=30`, which groups `quantum_intent_signal` rows by `metadata.source` / `signal` plus first-class events, giving DAU per widget. The next run of this routine can then report real platform usage. This sandbox has no production DB access.

---

## 10 · Files changed

```
src/client/stores/intentionEngine.ts         #1  dayMs ReferenceError
src/client/components/System.tsx             #2 #5 guards + stable EMPTY_LOGS
src/client/components/EvolutionWidget.tsx    #3  hooks order
src/client/hooks/usePunctuationContext.ts    #4  infinite update loop
src/client/components/UserMetricsWidget.tsx  #6  cohort classifier args
src/server/routes/api.ts                     #7 #8 badges + community-emotion 500s
src/client/entries/app.tsx                   #9  react-query retry policy
src/server/index.ts                          #9  static bundles exempt from limiter
src/server/models/user.ts                    #10 joinedAt in /me
src/shared/types/index.ts                    #10 UserProfile.joinedAt
src/client/components/QuantumEngineWidgets.tsx #11 selfCare key
src/client/components/QuantumRandomWidget.tsx  #12 side effects out of updater
scripts/tests/widget-health-lag.cjs          new: live lag/health harness
scripts/tests/qie-bench.ts                   new: QIE hot-path benchmark
```

**Gates:** client tsc 104 → 98 (no new errors) · server tsc 0 · `npm run build` green · live Playwright run: 0 crashes, 0 API errors, 52 widgets.

**Re-run:**
```
APP_HOST=http://localhost:4400 AUTH_TOKEN=<session> node scripts/tests/widget-health-lag.cjs
npx esbuild scripts/tests/qie-bench.ts --bundle --platform=node --format=esm \
  --alias:#client=./src/client --alias:#shared=./src/shared --outfile=/tmp/qb.mjs && node /tmp/qb.mjs
```
