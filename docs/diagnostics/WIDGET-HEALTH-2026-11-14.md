# LOT® Widget Health Scan — 2026-11-14

**Routine:** scheduled widget wiring / UI / lag scan
**Branch:** `claude/charming-albattani-k9nmh0` · **Base:** `98971f2` (master, PR #96)
**Build:** client ✅ · server ✅ · `tsc --noEmit` (client, strict) ⚠️ 101 errors, all pre-existing (104 before this run)
**Runtime lag test:** not run. No Postgres in the routine container (`pg_isready` → no response), so the app could not boot. Every lag finding below comes from reading the code, not from measuring it.

---

## 0. TL;DR

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | `/api/me` never returned `joinedAt`, so **MonthlyPulseWidget (Month N / 12 reveal) never rendered for anyone**. Its month counter was always 0. | 🔴 wiring bug | **FIXED** |
| 2 | The bottom of the System tab (Biofield ×5, Architect, Stats ×6, Calendar, Benchmark) mounted on first paint. That meant 8 extra queries, 7 of them polling every 2 min. | 🟠 load / lag | **FIXED** (deferred until near the viewport) |
| 3 | `badges.ts` (212 KB) + `SystemProgressWidget.tsx` (181 KB) make up about 54% of `app.js` (730 KB min / 184 KB gz). | 🟠 load speed | Recommended (§6) |
| 4 | Duplicate object keys in `badges.ts`: `quarter_drop` (L5501) and `elixir_found` (L6883). The later definition silently wins. | 🟡 data | Open |
| 5 | Widget usage is only logged client-side, in `localStorage['intention-signals']`. There is no log of widget usage across the platform. | 🟡 telemetry gap | Open (§9 proposal) |
| 6 | The reveal arc is **12 months** in code (MonthlyPulse caps at 12). The routine brief calls for **15 months**. | 🟡 product gap | Open (§7) |
| 7 | Only 4 widgets post to the Log through `useCreateLog` (Calendar, Planner, Recipe, Self-care). Interactive widgets such as Game, Calculator, Quantum Sign and Time do not. | 🟡 wiring gap | Open (§4) |

---

## 1. Widgets: wiring, data storage, testing

Static matrix over 54 widget files (counts are grep hits, so treat them as relative signal only):

| Widget | LOC | Storage | Server data | AI | QIE / intentionEngine | Memory | Story | Posts to Log | Sound |
|---|---:|---|---|:-:|:-:|:-:|:-:|:-:|:-:|
| SystemProgressWidget | 2513 | LS | logs, energy, profile | ✓ | ✓✓✓ | ✓ | ✓ | signals | – |
| MicroGameWidget | 988 | – | – | – | ✓ | – | – | – | ✓✓ |
| SelfCareMoments | 869 | LS | logs, profile | – | ✓ | – | – | **✓ createLog** | ✓ |
| QuantumEngineWidgets | 651 | LS | energy, many | – | ✓✓ | – | ✓ | – | – |
| PatternRecognitionWidget | 561 | LS | logs | – | ✓✓ | ✓ | ✓ | – | – |
| IntegrityWidget | 476 | – | logs | – | ✓ | ✓ | – | – | – |
| EmotionalCheckIn | 404 | – | logs | ✓ | ✓ | – | ✓ | **✓ mutation** | – |
| MemoryWidget | 400 | LS | /api/memory | ✓ (engine) | ✓ | ✓✓ | – | **✓ mutation** | – |
| UserMetricsWidget | 379 | – | OS status/perf/version, cohorts | – | ✓ | – | – | OS signal | – |
| RecipeWidget | 345 | store | logs | – | ✓ | – | – | **✓ createLog** | – |
| AIFeedbackWidget | 311 | – | OS diagnostics, profile, logs | ✓ | ✓ | ✓ | – | – | – |
| PlannerWidget | 300 | store | logs | – | ✓ | – | ✓ | **✓ createLog** | – |
| SystemPulseWidget | 300 | – | pulse (10 s, paused off-tab) | – | ✓ | – | – | – | – |
| CalendarWidget | 281 | – | logs | – | ✓ | – | – | **✓ createLog** | – |
| NarrativeWidget | 219 | – | /api/narrative | – | ✓ | – | ✓✓✓ | – | – |
| TimeWidget | 146 | – | – | – | – | – | – | – | ✓ chime |
| stats/* (6) | 550 | – | /api/stats/* (2-min poll) | ✓ usage | – | ✓ | – | – | – |

**Storage model.** There are three tiers:
1. Server `Log` rows: the Log, memory, check-ins, calendar, planner, recipe.
2. Server derived endpoints: `/api/stats/*`, `/api/narrative`, `/api/os/*`, `/api/energy`.
3. Client `localStorage`: intentionEngine signals, user index, dismiss and reveal flags.

Tier 3 never syncs, so it is lost when the device changes or the cache is cleared.

**Error isolation.** All 25 System-tab sections are wrapped in `WidgetErrorBoundary`, so a crash in one widget cannot blank the page. ✅

**Testing.** The repo has **no unit or component tests** (no `*.test.*` or `*.spec.*` files). The only harness is `test:cold-start`, an HTTP smoke test. Widget wiring is therefore verified only by the build and manual QA. A Playwright smoke test for the System tab is recommended once a seeded database is available in CI.

## 2. Wiring to LOT® AI, the System tab and Portrait

- **System tab** (`System.tsx`, 1071 LOC) is the single mount point. It renders a lite layout for non-Usership users and a full pro layout for R&D / Usership, with density driven by `$layoutDensity`.
- **LOT® AI.** AI-backed surfaces are the MemoryWidget (memory engine `'ai' | 'standard'`), EmotionalCheckIn, AIFeedbackWidget (OS diagnostics) and MemoryEngineStats (`/api/stats/ai-usage`). They all reach AI through server routes, never through client keys. ✅
- **Portrait (public profile).** `PublicProfile.tsx` reads `/api/user-profile` (archetype, behavioral cohort). SystemProgressWidget and UserMetricsWidget each fetch the same cohort data separately (`/api/user-profile` and `/api/cohorts`). That is two ad-hoc `fetch()` calls outside react-query, so they are not cached or deduplicated → candidate to move to `useProfile`/`useCohorts`.
- **Type drift.** `PublicProfile.tsx` reads `streak`, which is missing from the profile type (3 TS errors), and `entries/app.tsx` reads `UserProfile.metadata` (4 errors). This is runtime-safe (fields are optional), but the types no longer describe what Portrait actually consumes.

## 3. Wiring to the LOT® Quantum Intent Engine, Memory and Story

- **QIE** (`stores/intentionEngine.ts`): widgets feed it through `record*Signal()` calls. Top emitters are Quantum (6), Journal (6), Log (5), Badge (5), CognitiveDepth (4), QOS/OS/Calendar (2 each). `getOptimalWidget()` picks between Self-care and Intentions, and the reason is passed through `localStorage` (`selfcare-quantum-reason`, `intentions-quantum-reason`). It works, but the hand-off is stringly-typed.
- **Background QOS monitor** starts **only** in `SystemProgressWidget`'s mount effect. That is why the Dashboard stack was deliberately left eager in this run (see §5).
- **Memory** → `/api/memory` and `useCreateMemory`; it invalidates `['/api/memory', date]` correctly. ✅
- **Story** → NarrativeWidget (`/api/narrative`: story / achievements / quests / context views), GoalJourneyWidget (narrative arc) and EnergyCapacitor. ✅
- **Type debt in QIE:** 7 × TS2345, where a `string` is passed where the `WidgetType` union is expected, and 2 × TS2322 (`'active'` is not a valid urgency). These are latent mis-routing risks for `getOptimalWidget()`.

## 4. Data container vs data display, and "military" Log posting

| Class | Widgets |
|---|---|
| **Container** (writes user data) | Memory, EmotionalCheckIn, SelfCare, Planner, Recipe, Calendar, Intentions |
| **Interactive display** (state is local only) | MicroGame, MicroCalculator, MicroImage, QuantumSign, QuantumRandom, TimeWidget, Sound/Radio/Mirror/Breathe toggles, Temperature unit, Sunrise/Sunset |
| **Pure display** | Stats ×6, Biofield ×5, UserMetrics, CorrelatedIndexes, SystemPulse, Architect, Benchmark, CosmicUpdate |

**Gap.** Interactive displays change state but post nothing to the Log, so the context (weather, time, users online, moon phase) is lost.

**Proposal: SITREP log line.** A single `useSitrep()` hook would call `useCreateLog` with `event: 'sitrep'` and a fixed, terse format:

```
SITREP 0714Z · SYS/BREATHE ON · WX 18℃ CLR · USR 42/1,203 · MOON WAXING 61% · HR ARIES
```

Rules: one line, uppercase, UTC "Z" time, nothing personal beyond what the user did, and a debounce of at most 1 per widget per 10 min so the Log stays a clean record rather than noise. This fits the monk/transparent-lifestyle doctrine: every action leaves a brief, honest trace that the user owns, with no hidden analytics.

## 5. Load-speed optimization (applied)

**Change.** `System.tsx` now wraps these sections in the existing `LazyMount` (IntersectionObserver, 200 px margin, mount-once):

| Section | Deferred on first paint |
|---|---|
| Biofield Engine (QuantumState, PatternRecognition, AIFeedback, SignalStream, Integrity) | ~1.6k LOC of render, 1 query (`useOSDiagnostics`) |
| Architect | memo-heavy render |
| Stats ×6 | **7 queries** (`/api/stats/{patterns,collective,wellness,memory-engine,ai-usage,growth,badges}`), each with `refetchInterval: 120000` |
| Calendar | log scan |
| Benchmark | log scan |

**Safety check.** Before deferring, each section's effects were read. None of them write signals, start monitors or post logs at mount. Calendar writes only on user action. **Not deferred:** QuantumEngineWidgets (already lazy) and the **Dashboard stack** (UserMetrics fires `recordOSSignal('health_check')` and SystemProgress starts the background QOS monitor and `recomputeAssembly`). Deferring those would change engine behaviour.

**Expected effect:** about 8 fewer network requests and ~2.5k fewer LOC rendered on System-tab open, and no background polling until the user scrolls to the bottom. This has not been measured in a browser (see header).

## 6. Bundle (load speed): measured

`app.js` is 729,837 B minified / 183,835 B gzip. The top inputs:

| Bytes in output | Module |
|---:|---|
| 212,386 | `utils/badges.ts` |
| 180,936 | `components/SystemProgressWidget.tsx` (mostly changelog string data) |
| 130,035 | react-dom |
| 123,291 | `components/Logs.tsx` |
| 24,218 | `utils/easter-eggs.ts` |
| 21,890 | `SelfCareMoments.tsx` |
| 20,028 | `QuantumEngineWidgets.tsx` |

**Recommendations (not applied, because each needs a design call):**
1. Move SystemProgressWidget's changelog arrays into a JSON file fetched on demand when the user opens the "deployment" view. `ArchitectWidget` imports `USERSHIP_TRANSMISSION` from it, so that constant has to move to a small shared module first. Saving: ~170 KB minified off the critical path.
2. Load the badge catalog with a dynamic `import()` on the first badge evaluation. Saving: ~210 KB minified.

Together these would cut the critical `app.js` roughly in half.

## 7. The 15-month reveal (Digital UX routine)

The code has three reveal mechanisms:
- **MonthlyPulseWidget.** Tied to calendar months since `joinedAt`, Usership only, shown once per month. It was **broken until this run** (finding #1). It caps at **12** (`Math.min(monthNumber, 12)`, `"/ 12 months"`).
- **Interface evolution.** Level-based (1–100) with 4 story chapters (levels 10/30/60) and feature unlocks: themes L5, widget arrange L10, intention history L15, mood patterns L20, export L25, narrative reflection L30+.
- **Layout density.** 5 steps, from breathable to instrument.

**Gap against the 15-month plan.** No month 13–15 messages exist, and the level-based unlocks are not tied to the calendar month, so a user's "month 6" view depends on activity, not tenure. Suggested next step: a single `revealSchedule[1..15]` table that maps each month to the widget(s) first shown, read by both MonthlyPulse and `$featureUnlocks`.

## 8. Lag test (buttons, sounds, controls, loading)

The runtime test was not possible (no database). Static findings:
- **Sounds.** All three audio modules (`sovietChime`, `sovietGameSounds`, `sovietKeyboard`) reuse a singleton `AudioContext`, so no new context is created per click. ✅ The `sound.ts` hook resumes the context on interaction ✅, but leaves `console.log('🎵 AudioContext resumed')` in production (cosmetic).
- **Sound/Radio toggle.** A 300 ms re-entry guard (`isSoundToggling`) prevents double-toggle ✅. Note that it blocks a second tap for 300 ms, which feels like lag on fast taps.
- **Timers.** Every 1 Hz / 10 s / 60 s interval inside widgets checks `document.hidden` or `isRouteActive('system')` (SystemPulse, SystemProgress, astrology tick). ✅ `TimeWidget` runs `checkHour` every 1 s without that guard. This is intentional, because the hourly chime must fire in a background tab, and the check itself is cheap with no setState.
- **Query fan-out.** `useLogs()` has 16 call sites, all sharing one react-query cache key ✅. Seven components subscribe to the whole `intentionEngine` store, so each signal write re-renders all of them. Earlier memoization passes (PR #95) contain the cost.
- **Perf observer.** `utils/perf.ts` logs INP > 200 ms and long animation frames > 50 ms to the console. Wiring it to the §9 log would turn this into a continuous lag test.

## 9. Data log of widget usage across the platform

**Current state.** Platform-wide widget usage is **not recorded**. `admin-api /widget-diagnostic` only checks whether Stats widgets have data. Per-user signals stay in browser `localStorage`.

**Proposal (minimal):** `POST /api/widget-usage`, batched every 60 s from the client, with this row shape:

`{ widget, action: 'mount'|'interact'|'error', ms?, ts }`

- Store it in a dedicated table, not in `Log`, so the user's Log stays personal.
- Add an admin roll-up: widget × day × (mounts, interactions, errors, p75 interaction ms).
- Feed it from the existing `WidgetErrorBoundary` (errors), `LazyMount` (mounts) and `perf.ts` (latency).

---

## Changes in this push

| File | Change |
|---|---|
| `src/server/models/user.ts` | `useProfileView()` now includes `joinedAt`, which revives MonthlyPulseWidget |
| `src/shared/types/index.ts` | `UserProfile.joinedAt?` added (fixes 3 TS errors) |
| `src/client/components/System.tsx` | Biofield, Architect, Stats, Calendar and Benchmark sections wrapped in `LazyMount` |
| `docs/diagnostics/WIDGET-HEALTH-2026-11-14.md` | this report |

## Open items (prioritized)
1. Split `SystemProgressWidget` changelog data and `badges.ts` out of the critical bundle (§6).
2. Remove the duplicate `quarter_drop` / `elixir_found` keys in `badges.ts`.
3. Build the platform widget-usage log (§9) and the SITREP log line (§4).
4. Write the 15-month `revealSchedule` (§7).
5. Clear the QIE `WidgetType` type errors (§3) and the 101 remaining client TS errors.
6. Add a System-tab Playwright smoke test with a seeded database (needed for a real runtime lag test).
