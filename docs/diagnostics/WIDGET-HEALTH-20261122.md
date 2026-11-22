# LOT-WH-20261122 · Widget Health Scan

```
DTG        : 2026-11-22 · scheduled routine (unattended)
BRANCH     : claude/charming-albattani-rrt4uo
SCOPE      : System tab widgets · wiring · storage · lag · reveal schedule · usage log
BUILD      : GREEN (client + server). esbuild duplicate-key warnings 2 → 0
TSC (full) : 104 → 101 errors (pre-existing client type debt, not part of the build gate)
STATUS     : AMBER (wiring sound overall; 3 dead paths; render-lag hotspots remain)
```

---

## 0 · SITREP (read this first)

| # | Finding | Severity | Action this run |
|---|---|---|---|
| 1 | `elixir_found` badge defined twice: the v32 Hero's Journey definition silently overwrote the v25 one | HIGH (data) | **FIXED**: v32 renamed `hero_elixir` |
| 2 | `quarter_drop` badge defined twice: "first easter egg" collided with the midnight check-in badge | HIGH (data) | **FIXED**: the never-awarded one renamed `first_quarter`; stored user badges are untouched |
| 3 | IntentionsWidget saved intentions to localStorage only. The server (`api.ts:4136,4268`), `useLogContext` and the Logs `INTENT:` renderer all expect `event:'intention'` logs | HIGH (wiring) | **FIXED**: now posts to `/api/logs` with server-stamped context |
| 4 | Breathe state sits at the root of System.tsx and called `setState` every 100ms, so the whole tab re-rendered 10 times a second | HIGH (lag) | **FIXED**: identical frames are skipped (about 1 render/s) |
| 5 | 7 stats queries had `refetchInterval` but no `staleTime`, and the System tab unmounts when you leave it, so 7 requests fired on every return to the tab | MED (lag) | **FIXED**: `staleTime: 120000` |
| 6 | Only 1 of about 43 System widgets is viewport-gated, and there is no `React.lazy`, so the System tab ships in a 730 KB main chunk | MED (load) | OPEN, see §5 |
| 7 | No 15-month reveal schedule exists in code; MonthlyPulse stops at month 12 | MED (product) | OPEN, see §6 |
| 8 | Widget usage is logged client-side only (localStorage, 7 days, max 1000); impressions never reach the server | MED (data) | OPEN, see §7 |

---

## 1 · Widget wiring, data storage, testing

Every widget is rendered from `src/client/components/System.tsx`. **All client → server endpoints resolve** to a route in `api.ts` or `os-api.ts`, and all `#client/*` imports resolve.

**Type key:** C = data container (stores user input) · D = display only · I = interactive, nothing persisted.

| Widget | Reads | Writes | AI / QIE / Memory / Story | Type |
|---|---|---|---|---|
| Memory | `GET /api/memory` (AI question) | `POST /api/memory/answer` | AI direct, QIE, feeds Story and Narrative | C |
| EmotionalCheckIn | `/api/emotional-checkins`, logs, weather | `POST /api/emotional-checkin` | QIE | C |
| SelfCareMoments | profile, check-ins, logs | `POST /api/logs` (`self_care_*`), localStorage | QIE, gets the quantum reason | C |
| Planner | plannerWidget store | `POST /api/logs` (`plan_set`) | QIE | C |
| Calendar | logs | `POST /api/logs` (`calendar_entry`) | QIE | C |
| Recipe | `/api/recipe-suggestion` (AI) | `POST /api/logs` (`note`) | AI, QIE | C |
| ContextualPrompts | `/api/contextual-prompts` | `POST /api/logs` | QIE | C |
| **Intentions** | localStorage | localStorage **+ `POST /api/logs` `intention` (new)** | QIE, gets the quantum reason | C |
| SystemProgress | 7+ sources (see §5) | `POST /api/system/submit-feedback` | none | C |
| Narrative / Evolution | `/api/narrative` (rule-based, from answer logs) | none | Story read | D |
| QuantumState / SignalStream / SystemPulse / Integrity / Architect / Benchmark / AIFeedback / PatternRecognition | intentionEngine store, logs | none | QIE read | D |
| EnergyCapacitor / GoalJourney / Interventions / CohortConnect / ChatCatalyst / PatternInsights | rule-based `/api/*` | none | QIE | D/I |
| CosmicUpdate | `POST /api/cosmic-update` (Together AI image) | rewardWidgets localStorage | AI (image) | I |
| Time | persistent atoms (12h format, chime) | nanostores persistent | none | I |
| MicroGame / MicroImage / MicroCalculator / QuantumRandom | local | rewardWidgets localStorage | QIE | I |
| QuantumSign | `me`, logs | localStorage `quantum-sign-action` (**never read**) | none | I |
| MonthlyPulse | `me.joinedAt` | dismiss key | none | D |
| Investor stack (Angel / Corporate / DemoDay) | `lot-investor-mode` | none | none | D |
| stats/* (6 widgets) | `/api/stats/*` | statGrowth snapshot | MemoryEngineStats = AI telemetry | D |

### Dead or broken paths (open)
- `JournalReflection.tsx` is **never rendered**. Nothing imports it, so its `recordSignal('journal', …)` never fires.
- QuantumSignWidget: its 4 action buttons write `quantum-sign-action` (`:126-138`), but nothing reads that key. The buttons have no effect.
- `MemoryWidget.tsx:288` removes `memory-error-${date}`, but nothing ever sets it.
- `SystemProgressWidget.tsx:1577`, `QuantumEngineWidgets.tsx:179` and `UserMetricsWidget.tsx:42,55` call raw `fetch` on endpoints that already have react-query hooks, which duplicates requests and bypasses the cache.

### Testing
- There is no unit or component test suite for widgets. The only automated check is `scripts/tests/test-cold-start.ts`.
- This run's checks were: full client + server build, esbuild warnings, full-project `tsc`, and static wiring analysis.
- **Recommended:** a smoke test that mounts `System` with mocked queries in jsdom, and asserts that every widget renders without throwing and that every `fetch`/`api.*` path matches a registered Fastify route.

---

## 2 · Wiring to LOT® AI, the System tab and the Portrait

- **LOT AI** is called directly by 3 widgets: Memory (question generation), Recipe (suggestion) and CosmicUpdate (image). It is reached indirectly by every widget that calls `recordSignal`: signals sync to `POST /api/quantum-intent/sync`, which stores `quantum_intent_signal` logs, and the Memory question generator reads those (`server/utils/memory/question-generator.ts:903`).
- **Provider split:** Memory, Recipe and Memory Story use the multi-provider `ai-engines.ts`. CosmicUpdate plus the `/qi`, `/assembly`, `/prayer` and `/story` commands are pinned to Together AI, not Anthropic.
- **System tab:** `getOptimalWidget()` (`System.tsx:377`) passes routing reasons to SelfCare and Intentions through localStorage.
- **Portrait (`PublicProfile.tsx`) has no widget wiring.** It reads only `/api/public/profile/:id`. Check-ins, intentions, narrative and QIE archetype never reach it. The Settings "portrait" is the AI Memory Story (`/api/memory/story`).
  - **Recommendation:** add an opt-in `portrait` block to the public-profile payload, covering current intention, archetype, streak and badge tier.

## 3 · Wiring to the Quantum Intent Engine, Memory and Story

- 22 components call `recordSignal`; the top emitters are QuantumEngineWidgets (7), CohortConnect (4) and PatternInsights (3).
- The chain is intact: Memory answer → `answer` log → `/api/memory/story` (AI) and `/api/narrative` (rule-based) → Narrative and Evolution widgets.
- With intentions now logged, the server's `intention` queries (daily directive, QI and assembly context at `api.ts:4963,5172`) receive real data for the first time.

## 4 · Containers vs displays, and military-format sync to the Log

- **Container count:** 9 C, about 20 D, about 14 I (table above).
- The Log already has a terse code format: `INTENT:`, `PLAN:`, `CARE:`, `BIO [0600|1800|SPOT]:`, `MEM:`, `COMM:`, `ENV:`, `POS:`, `TMP:`, `HUM:`, `ASTRO:` (`Logs.tsx:225-1970`).
- `getLogContext()` (`server/utils/logs.ts:25-66`) stamps weather, location, local date and astrology onto every `/api/logs` write. **Users online is not stamped.** It exists only as an SSE value.
  - **Recommendation:** add `context.network = { online, total }` from the SSE counter in `getLogContext`. Every interactive-widget log line could then render as `INTENT: STILLNESS · 12°C · 4/37 ONLINE · 0614L`.
- Interactive-only widgets (QuantumRandom, MicroGame, Chakra, QuantumSign) post nothing to the Log. If they should leave a trace, give them one `SPOT:` log per session, not one per click.

**Monk-lifestyle lens.** The cleanest "pure and transparent" posture would make every container write to one log, in one format, with one context stamp, so nothing lives only in the browser. Intentions were the main violation and are fixed. The remaining browser-only state is SelfCare completion flags, rewardWidgets, QuantumSign and all QIE signals beyond the server sync.

## 5 · Loading speed and lag test

Measured this run (production build):

| Metric | Value |
|---|---|
| `app.js` main chunk | 730 KB raw / 185 KB gzip |
| First-load JS (app + 11 shared chunks) | 1.42 MB raw / 381 KB gzip |
| CSS | 32 KB |
| Client build time | about 2 s |

Lag hotspots, in rank order (static analysis; a runtime profile needs a seeded DB):

1. ~~Breathe re-rendering the tab 10 times a second~~ **fixed**.
2. **QuantumRandomWidget** calls `recordSignal` inside a `setRemaining` updater on 1s timers. Each call re-renders about 6 eager QIE subscribers, some of which sort up to 1000 signals.
   - Fix: throttle to at most one signal per 60s, and wrap the subscribers in `React.memo`.
3. **Remount stampede:** the System tab unmounts on leave (`app.tsx:156-163`). On mount, SystemProgressWidget runs `recomputeAssembly`, `analyzeIntentions` and `getEnrichedPhysiologicalReport` synchronously, plus 4 uncached raw fetches.
   - Fix: defer them with `requestIdleCallback`, and move the fetches to `createQuery`. (The stats `staleTime` part is fixed.)
4. **Eager heavy widgets:** wrap the Biofield, Dashboard, Architect, Stats, Calendar and Benchmark stacks in the existing `<LazyMount>`. Convert SystemProgress, Integrity and PatternRecognition to `React.lazy` so `splitting: true` emits per-widget chunks. Expected effect: roughly −150 KB from first parse.
5. **Websocket pushes** (`usersOnline`, `liveMessage`) re-render the whole unmemoized tree.
   - Fix: move them into leaf components.
6. **`System.tsx:832-917`** calls `localStorage.setItem` and `removeItem` and computes `Math.random()` cooldowns during render.
   - Fix: move this into `useMemo` + `useEffect`.
7. **`getOptimalWidget()`** can run `analyzeIntentions` synchronously inside render and write the atom mid-render.
8. **Sound:** "Sound On" `await`s `POST /api/update-current-sound` before it builds any oscillators (`sound.ts:450`), so the click has audible latency equal to one network round trip.
   - Fix: build the audio nodes first and send the POST without awaiting it.
   - Also: there are 5 separate AudioContexts (sound, sovietGameSounds, sovietKeyboard, sovietChime, planner). Share one, and `suspend()` it when sound is Off.
   - No AudioContext is created per click.

Smaller items:
- `MicroGameWidget` calls `getComputedStyle` on every 150ms tick.
- About 25 timeouts are never cleared on unmount (Memory 13, Recipe 4, Planner 3, SelfCare 3, and others).
- All intervals are cleaned up. QuantumRandom's 1s and 10s intervals have no `document.hidden` gate.

## 6 · 15-month UI reveal (Digital UX routine)

**No month-based widget reveal exists in code.** Gating today comes from four mechanisms that don't share a scale:

1. Paid tier (`System.tsx:405-414`).
2. Time of day, cooldown and random chance (SelfCare, Intentions, Subscribe).
3. Evolution level and dimension unlocks at L5, L10, L15, L20, L25 and L30 (`utils/interfaceEvolution.ts:303-338`).
4. Self-assembly phases at 1, 5, 15 and 30 signals over a rolling 7 days. These are displayed only; they hide nothing.

MonthlyPulse shows text for months 1-12 and is capped at 12. The month 3 text promises "Active User status", but nothing unlocks.

Five different tenure baselines are in use:

| Baseline | Used by |
|---|---|
| `joinedAt` | MonthlyPulse |
| First answer log | System "Day N" counter |
| First log | Benchmark |
| `createdAt` | Server OS version |
| Oldest log | Goal understanding |

**Proposed 15-month schedule** (single baseline `joinedAt`; a widget shows if `monthsSince(joinedAt) >= M`):

| M | Reveal |
|---|---|
| 1 | Time · Memory · EmotionalCheckIn · SelfCare |
| 2 | Intentions · Planner |
| 3 | Recipe · Calendar · MoodAnalytics |
| 4 | Narrative · Evolution |
| 5 | EnergyCapacitor · Interventions |
| 6 | PatternInsights · GoalJourney |
| 7 | CohortConnect · ChatCatalyst |
| 8 | QuantumState · SignalStream |
| 9 | Micro widgets (Calc/Image/Game) · QuantumRandom |
| 10 | QuantumEngine (Biofield) · Chakra |
| 11 | PatternRecognition · Integrity |
| 12 | SystemPulse · UserMetrics · AIFeedback |
| 13 | Stats stack · CorrelatedIndexes |
| 14 | Architect · Benchmark |
| 15 | SystemProgress (full OS view) · Investor stack |

This is a product decision, so it was not implemented this run. It also needs MonthlyPulse extended to 15 messages.

## 7 · Usage data log across LOT® Systems

- **Server (durable):** the `logs` table records explicit actions only. There are about 120 distinct `event` values, although the `LogEvent` type lists 9.
- **Client (ephemeral):** QIE signals live in localStorage under `intention-signals`, kept 7 days, capped at 1000, and partly synced as `quantum_intent_signal`.
- **Impressions:** only 4 view events exist (`cohort_widget_viewed`, `cohort_profile_viewed`, `goals_viewed`, `recipe_viewed`). RecipeWidget never actually emits `recipe_viewed`; Logs.tsx only has a renderer for it.
- **No per-widget usage aggregate exists.** Production DB access was not available to this unattended run, so platform-wide counts could not be pulled.
- **Recommendation:** add `GET /api/admin/widget-usage`, grouping `logs.event` and `quantum_intent_signal.metadata.source` by day. Batch impression pings as one `widget_impressions` signal per session.

---

## 8 · Changes in this push

| File | Change |
|---|---|
| `src/client/utils/badges.ts` | `elixir_found` (v32) → `hero_elixir`; unawarded `quarter_drop` (first easter egg) → `first_quarter` |
| `src/client/utils/easter-eggs.ts` | v32 elixir pattern awards `hero_elixir` |
| `src/client/components/IntentionsWidget.tsx` | Posts an `intention` log with `{intention, monthYear}` metadata |
| `src/client/utils/breathe.ts` | Skips identical frames (render rate 10/s → about 1/s) |
| `src/client/queries.ts` | `staleTime: 120000` on 7 stats queries |

**Verification:** `yarn build` is green, esbuild has 0 warnings, and full-project tsc went from 104 to 101 errors with no new errors. No runtime test was run, because no seeded DB was available.

**Next run priorities:** QuantumRandom throttle and `React.memo` on QIE subscribers · LazyMount the heavy stacks · non-blocking Sound On · render JournalReflection or delete it · wire up or remove the QuantumSign actions · decide on the 15-month schedule.
