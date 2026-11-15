# LOT® Widget Health Scan — 2026-11-15

**Type:** Scheduled routine (widgets wiring · UI · lag)
**Branch:** `claude/charming-albattani-5xmz2g`
**Build:** GREEN. `client:js:build` ✓ · `client:css:build` ✓ · `server:build` ✓
**Typecheck:** client `tsc --noEmit` 104 → **98** errors (6 fewer, 0 new) · server **0**
**Runtime test:** not run. The app needs Postgres and a signed-in session, and neither exists in this container. All findings below come from reading the code, the build output and a synthetic benchmark.

---

## 0. SITREP

```
STATUS     GREEN (build)    AMBER (load weight)
FIXED      7 defects        (3 dead/blank widget fields · 2 render flickers · 2 dup fetches)
PERF       useLogContext    367.6ms → 24.5ms per logs update (3,000 logs, 15 widgets)
OPEN       9 items          (see §9 backlog)
```

---

## 1. Fixes shipped this push

| # | Widget / file | Defect | Effect on users | Fix |
|---|---|---|---|---|
| F1 | `hooks/useLogContext.ts` | 15 widgets each re-ran the full log-analytics pass (370-line `useMemo`). The `logs = []` default also made a new array on every render, so the memo never held while logs were loading. | About 368 ms of main-thread work each time logs change (3,000 logs). Shows up as lag after any log post. | Shared module-level cache keyed by the `logs` reference and the current hour, plus a stable `EMPTY_LOGS`. One pass now serves all 15 widgets. |
| F2 | `System.tsx` → Subscribe | `Math.random() < 0.2` ran inside render. | The widget **flickered in and out** on every System re-render (weather, users online, live message, breathe ticks). | The roll now happens once per mount (`subscribeRoll`). |
| F3 | `System.tsx` → Intentions | The 2–3 day cooldown was re-randomised on each render, and `localStorage` was written during render. The next render saw the fresh timestamp and **hid the widget again**. | Intentions showed for about one frame, then disappeared. Users without a saved intention effectively never saw it. | Visibility is computed in a `useMemo` and latched per mount. `localStorage` writes moved into a `useEffect`. |
| F4 | `QuantumEngineWidgets.tsx:470` | Read `dimensions.selfcare`, but the field is `selfCare`. | The QIE Index "CARE" row was always blank. | Corrected the key. |
| F5 | `UserMetricsWidget.tsx` (Physiology view) | Read `qieCohort.label` and `.dominant`, which do not exist on `PhysiologicalCohortClassification`. | "Archetype" was blank (when there was no server cohort) and "Dominant" was always blank. | Now reads `archetype` / `dominantModule`. |
| F6 | `MonthlyPulseWidget.tsx` + `user.ts` | `/api/me` (`useProfileView`) never sent `joinedAt`, and the widget returns early without it. | **The widget could never render.** It was dead for every user. | Added `joinedAt` to the profile view and the shared type. |
| F7 | `MonthlyPulseWidget.tsx` | The label was capped at 12 months, and the program had only 12 messages. | From month 13 on, users would get "Month 12" again every month. | Shows the real month number, adds messages for months 13–15, and the progress counter now reads `n / 15`. |
| F8 | `QuantumEngineWidgets` + `SystemProgressWidget` | Each widget made its own `fetch('/api/user-profile')`, bypassing react-query. | 2 extra profile requests per System mount, on top of `useProfile()`. | Both now use the shared `useProfile()` cache, the same key as the System tab and Portrait. |

---

## 2. Widget wiring inventory (System tab)

**Columns:** **LS** = number of `localStorage` uses · **Store** = number of nanostore subscriptions · **Timer** = number of `setInterval` calls · **Log↑** = writes to Log · **Data in** = where the widget's data comes from

| Widget | Role | Data in | LS | Store | Timer | Log↑ | Boundary |
|---|---|---|---|---|---|---|---|
| MonthlyPulse | Display | `me.joinedAt` | 3 | 2 | – | – | own |
| Recipe | Interactive | logs, stores | – | 4 | – | ✓ | own |
| Pulse (convergence) | Display | community pulse | – | – | – | – | own |
| Time | Display/sound | stores | – | 3 | 1 | – | none |
| QuantumRandom | Display | `useQuantumNumber` | – | – | 2 | – | none |
| Weather/Sky/Sun blocks | Display/toggle | `stores.weather` | – | – | – | – | none |
| Astrology/Psych/Journey/Biofield | Cycle display | profile, QIE | – | – | – | – | none |
| ContextualPrompts · ChatCatalyst · Interventions | Display | `useLogContext` | – | 0–2 | 1 | ✓/– | shared "Context" |
| EnergyCapacitor · ChakraErgonomics · Narrative · GoalJourney · Evolution · InterfaceEvolution · MilestoneToast | Display | `useLogContext`, `useNarrative`, stores | 0–2 | 0–4 | 0–1 | – | shared "Bioethics" |
| EmotionalCheckIn | Interactive | `useCreateEmotionalCheckIn` | – | 2 | – | ✓ (server) | own |
| SelfCareMoments | Interactive | logs, profile, weather | 7 | 2 | – | ✓ | own |
| Intentions | Interactive | `useLogContext`, LS | 6 | 2 | – | ✓ (server) | own |
| Subscribe | CTA | – | 1 | – | – | – | own |
| PatternInsights · MoodAnalytics · CohortConnect | Display | patterns, cohorts, logs | – | 2 | – | – | shared "Community" |
| Planner · Memory · MicroCalculator · MicroGame · MicroImage | Interactive | `useMemory`, `useCreateLog` | 0–4 | 0–2 | 0–1 | ✓ | shared "Planning" |
| CosmicUpdate · QuantumSign · FlashDrive | Display | stores, logs | 0–4 | 2 | – | – | own |
| AngelInvestor · CorporatePlan · DemoDay · 4D UI | Display | LS switch | 1 | – | – | – | shared "Investor" |
| QuantumEngineWidgets | Interactive | QIE, profile | 2 | 3 | – | – | own + **LazyMount** |
| QuantumState · PatternRecognition · AIFeedback · SignalStream · Integrity | Display | `useLogContext`, logs | 0–1 | 0–2 | – | – | shared "Biofield" |
| UserMetrics · CorrelatedIndexes · SystemProgress · SystemPulse | Display | `/api/me`, `/api/cohorts`, `/api/system/*` | 0–1 | 2–3 | 0–3 | ✓ | shared "Dashboard" |
| Architect | Display | self-assembly | – | 3 | – | – | own |
| Stats ×6 | Display | badge/pattern/AI usage stats | – | – | – | – | shared "Stats" |
| Calendar | Interactive | logs | – | – | – | ✓ | own |
| Benchmark | Display | logs | – | – | – | – | own |

**Counts:** about 50 widgets mount on the paid ("pro") layout. The free layout mounts 3 (Memory, Game, Subscribe). Only **1 of about 50** is lazy-mounted.

**Isolation risk:** 8 stacks share one `WidgetErrorBoundary`. If one widget in a stack throws, the whole stack disappears (for example, one throw in Bioethics hides 7 widgets).

---

## 3. Wiring with LOT® AI, the System tab and Portrait

- **System tab ↔ Portrait (`PublicProfile`)** both read `/api/user-profile` (`useProfile`). After F8, that is one cache entry for the whole tab.
- **Portrait** also reads fields from the public API (`psychologicalProfile.version`, `.streak`, `.patternStrengthIndex`) that the `useProfile` type does not declare. The server *does* send them (`routes/public-api.ts:1166-1188`), so this is a type gap, not a runtime bug. Backlog B6.
- **LOT® AI:** the client sees it only through `memoryEngine` on `/api/me` and through `MemoryEngineStats` (`useAIUsageStats`). AI-generated content (memory questions, story, narrative) comes from the server. No widget calls an AI provider directly. That is correct for transparency: one auditable path.
- `UserMetricsWidget` still makes raw `fetch('/api/me')` and `fetch('/api/cohorts')` calls even though the `me` store and `useCohorts()` already hold the same data. Backlog B3.

## 4. Wiring with the Quantum Intent Engine, Memory and Story

- **QIE** (`stores/intentionEngine.ts`, about 4,600 lines) is the signal bus. System calls `getOptimalWidget()` to gate Self-care and Intentions, and widgets call `classifyPhysiologicalCohort()`, `getUserIndex()` and `record*Signal()`. F4 and F5 fixed two broken reads from QIE outputs.
- **Memory:** `MemoryWidget` → `/api/memory` (question) → `/api/memory/answer` writes a log with server-side context.
- **Story:** `/api/memory/story` (Portrait) and `/api/narrative` (`useNarrative`) feed NarrativeWidget and EvolutionWidget. `POST /api/story` writes a `generated_story` log.
- `getOptimalWidget()` is memoised on `[logs]` only, so a time-of-day change does not re-evaluate it until the next log.

## 5. Context sync → Log ("military communications" format)

**What exists:** every server-side log write (`POST /api/logs`, check-ins, memory answers, and more; 18 call sites) stamps a `context` with **time, timezone, city, weather (temperature, humidity, description), moon phase, rokuyo and zodiac**, through `server/utils/logs.ts:getLogContext`. This is good.

**Gaps:**
- `usersOnline` is not in `context`, although `/api/me` already computes it. Add `usersOnline` to `LogContext` so every entry records "who else was here".
- Client log text is free-form (`Self-care skipped: …`, `Intent: … • Today: …`, `[SCHEDULE] …`).

**Proposed entry format (monk / military self-care: terse, timestamped, signed with context):**

```
[2026-11-15 0742L] SELF-CARE // COMPLETE // "Cold water, 2 min"
  WX 4℃ 81% overcast · MOON waning 23% · ONLINE 14 · STREAK D12
```

Rules: `[date time-local] MODULE // STATUS // payload`, then one context line. No adjectives and no exclamation marks. A user can read back a month of entries and audit their own life.

This proposal is not implemented. It changes the text users see in the Log, so it needs your sign-off.

## 6. Monk lifestyle: LOT® AI as a transparency layer

What already fits: AI runs server-side and every AI artifact becomes a log the user can see; the free layout is reduced to 3 widgets; widgets have cooldowns (self-care 3 h, intentions 2–3 days, subscribe 10 days plus 20%).

What works against it:
1. Day 1 on the paid layout shows **about 50 widgets at once**. That is the opposite of a quiet cell.
2. Hidden state lives in `localStorage` (8+ keys: self-care, intentions, subscribe, quantum reasons, pulse). The user cannot see it and it does not follow them across devices. Fix: move cooldown and dismissal state into `user.metadata` so it is transparent, portable and auditable.

## 7. The 15-month reveal (Digital UX routine)

**Current reality:** no month-based gating exists. Widgets are gated by tier (free/paid), level (`interfaceEvolution` `featureUnlockLevel` 0–5, density 5 steps) and time-of-day or cooldown. MonthlyPulse was the only month-aware widget, and it was dead (F6).

**Proposed reveal map** (a new `$monthIndex` derived from `joinedAt` would gate each stack):

| Month | Reveal | Stack |
|---|---|---|
| 1 | Time, Weather, Memory, Check-in | core |
| 2 | Self-care, Intentions | care |
| 3 | Recipe/Fasting, Planner | routine |
| 4 | Astrology / Psychology / Journey cycle | mirror |
| 5 | Narrative, GoalJourney | story |
| 6 | Context stack (prompts, catalyst, interventions) | AI context |
| 7 | Community stack | community |
| 8 | EnergyCapacitor, Chakra | biofield |
| 9 | Evolution, InterfaceEvolution | growth |
| 10 | Micro widgets (calculator, game, image) | play |
| 11 | QuantumSign, CosmicUpdate | QIE surface |
| 12 | QuantumEngineWidgets, Biofield engine | QIE full |
| 13 | Dashboard (UserMetrics, Correlated, SystemPulse) | instrument |
| 14 | Stats, Benchmark, Calendar | data |
| 15 | Architect, Investor | full reveal |

MonthlyPulse now counts `n / 15` and has messages for months 13–15 (F7), ready to announce each reveal. The gating itself is not implemented; it needs a product decision.

## 8. Loading speed and lag test

**Bundle (production build):**

| Asset | Raw | gzip |
|---|---|---|
| `app.js` | 730 KB | 185 KB |
| `app.js` plus its static chunks (first load) | **1.42 MB** | **381 KB** |
| Widgets split into dynamic chunks | **0** | – |

**Timers that live while the System tab is mounted:** at least 16 `setInterval` calls (Time 1, QuantumRandom 2, SystemProgress 3, SystemPulse 1, Chakra 1, ContextualPrompts 1, MicroCalc 1, MicroGame 1, MilestoneToast 1, System 2, plus store-level QIE 2, recipe 1, sun 2, breathe 1, sound 1, radio 1). Only MicroGame pauses when it is off-screen (`useActiveViewport`).

**Lag results:**

| Probe | Result | Verdict |
|---|---|---|
| `useLogContext` with 3,000 logs (synthetic, Node) | 24.5 ms per pass. Old: ×15 = **367.6 ms**. New: **24.5 ms** | ✅ fixed (F1) |
| Same at the server cap (`GET /api/logs` limit 500) | about 4 ms per pass. Old about 60 ms, new about 4 ms (scaled linearly) | ✅ |
| Subscribe/Intentions re-render | flicker on every tick | ✅ fixed (F2, F3) |
| Sound toggle | 300 ms debounce guard (`isSoundToggling`) | OK |
| Buttons (`Block onClick`) | plain state toggles, no async on the click path | OK |
| Self-care IIFE | reads 2 `localStorage` keys and writes 1 on every System render | ⚠ B2 |
| Perf telemetry | `window.__LOT_WIDGET_PERF__` (mount ms) and `window.__LOT_PERF__` (INP > 50 ms) already exist | use in the browser |

To get live numbers in production, run `window.__LOT_WIDGET_PERF__` in the console on the System tab.

## 9. Widget usage data log (platform-wide)

**Events widgets write today** (read from the code, not production counts; no DB access from this container):

| Event | Source widget(s) |
|---|---|
| `answer` | Memory |
| `emotional_checkin` | EmotionalCheckIn |
| `self_care`, `self_care_complete`, `self_care_skip` | SelfCareMoments |
| `intention` | Intentions |
| `plan_set` | Planner |
| `calendar_entry` | Calendar |
| `system_feedback`, `report_generated`, `health_check` | SystemProgress |
| `quantum_intent_signal`, `assembly_directive` | QIE / Architect |
| `generated_story` | Story |
| `badge_unlock` | Badges |
| `note` | Log |

**Gap:** about 35 display widgets (views cycled, cards opened, dismissed) leave **no usage trace**. Only the 9 widgets that create content are measurable. There is no `widget_usage` event. **Proposal:** add one batched `widget_view` event per session, with metadata `{ widget: count }` flushed on `visibilitychange`. That is one row per session, not one per click, which keeps logs clean. This needs your sign-off, since it adds a new log type visible to users.

---

## 10. Backlog (not done this push)

| ID | Item | Impact | Effort |
|---|---|---|---|
| B1 | Wrap below-the-fold stacks (Bioethics, Community, Biofield, Dashboard, Stats, Investor) in `LazyMount` plus `React.lazy` | First-load JS −30–50%, fewer timers at boot | M |
| B2 | Move the Self-care visibility IIFE into a hook (same pattern as F3) | Removes render-time `localStorage` I/O | S |
| B3 | `UserMetricsWidget`: replace raw `/api/me` and `/api/cohorts` fetches with the `me` store and `useCohorts()` | −2 requests per mount | S |
| B4 | One `WidgetErrorBoundary` per widget inside each stack | A crash costs 1 widget, not up to 7 | S |
| B5 | Pause intervals when off-screen (`useActiveViewport`) for SystemPulse, SystemProgress, Chakra, ContextualPrompts | Less CPU and battery | S |
| B6 | Add `version`, `streak` and `patternStrengthIndex` to the `useProfile` type; clear the other 98 TS errors | Type safety | M |
| B7 | Add `usersOnline` to `LogContext` | Completes context sync | S |
| B8 | Military log format (§5), 15-month gating (§7), `widget_view` telemetry (§9) | Product | needs sign-off |
| B9 | Fix the stale comment at `queries.ts:136` ("/api/logs has no LIMIT"); the server caps it at 500 | Docs | XS |

---

## 11. Files changed

```
src/client/hooks/useLogContext.ts              F1
src/client/components/System.tsx               F2 F3
src/client/components/QuantumEngineWidgets.tsx F4 F8
src/client/components/UserMetricsWidget.tsx    F5
src/client/components/MonthlyPulseWidget.tsx   F6 F7
src/server/models/user.ts                      F6
src/shared/types/index.ts                      F6
src/client/components/SystemProgressWidget.tsx F8
docs/diagnostics/WIDGET-HEALTH-SCAN-2026-11-15.md
```
