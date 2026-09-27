<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Widget Health Scan — 2026-09-27

Scheduled diagnostic pass over widget wiring, data persistence, error handling, test
coverage, loading performance, and interaction logging across the System tab. Five
read-only investigative passes over the codebase, followed by two small, low-risk
fixes. No test runner exists in this repo, so no automated regression check backs
these fixes beyond manual review — see §5.

## 1. Widget inventory — data wiring, persistence, error isolation

~50 widget components live under `src/client/components/*Widget*.tsx`. Sampled 13
directly (full list not read in full — representative spread of store-only,
API-backed, and static-content widgets).

| Widget | Data source | Persisted? | Error boundary | Tests |
|---|---|---|---|---|
| QuantumStateWidget | `intentionEngine` store (client) | localStorage | Yes | No |
| MonthlyPulseWidget | `stores.me` → `/api/me` | Postgres (`User`, Sequelize) | Yes | No |
| MemoryWidget | mixed stores | localStorage + server sync | Yes | No |
| PlannerWidget | `plannerWidget` store | localStorage | Yes | No |
| RecipeWidget | `recipeWidget` store + weather | localStorage; weather in DB | Yes | No |
| CalendarWidget | `intentionEngine` only | **localStorage only, no server round-trip** | not directly checked | No |
| UserMetricsWidget | `/api/cohorts`, `/api/me` | Postgres | Yes | No |
| SystemPulseWidget | `/api/system/pulse` | server-computed | Yes | No |
| CorrelatedIndexesWidget | `/api/os/indexes` | server-computed from Log history | Yes | No |
| ArchitectWidget | `selfAssembly` store + `intentionEngine` | localStorage | Yes | No |
| CorporatePlanWidget | static/mock, gated by `localStorage['lot-investor-mode']` | none | Yes | No |
| DemoDayWidget | static, same investor-mode gate | none | Yes | No |
| SubscribeWidget | static copy | click timestamp in localStorage | Yes | No |

**Findings:**
- No dead-route fetches found in the sample — every `/api/...` call site checked
  (`/api/me`, `/api/cohorts`, `/api/system/pulse`, `/api/os/indexes`,
  `/api/quantum-intent/sync`) matches a real server route.
- `CalendarWidget` never leaves the browser: it only calls `recordCalendarSignal`
  into the localStorage-backed `intentionEngine` store. A cleared browser or a
  device switch loses calendar entries, unlike Memory and quantum-intent signals
  which do sync server-side.
- `CorporatePlanWidget` / `DemoDayWidget` are fully hardcoded `[TBD]`/`[Demo]` pitch
  content, gated only by a client-side `localStorage` flag — trivially toggleable,
  no server-side authorization. Fine for a pitch widget, worth knowing it isn't a
  real access gate.
- `TimeWidget` and `QuantumRandomWidget` were rendered in `System.tsx` **outside**
  any `WidgetErrorBoundary`, unlike every other widget in the file. **Fixed in this
  pass** — see §6.
- `prisma/schema.prisma` defines zero models (15 lines of generator/datasource
  boilerplate only). Prisma is installed but entirely unused for persistence — all
  real DB access goes through hand-rolled Sequelize models in
  `src/server/models/*.ts` (`Log`, `User`, `WeatherResponse`, …). Any doc or mental
  model that assumes "Prisma-backed widget data" is wrong; follow the Sequelize
  models instead.
- **No test suite exists anywhere in the repo.** No `test` script in `package.json`,
  no Vitest/Jest/Playwright/Cypress dependency, no `*.test.ts(x)`/`*.spec.ts(x)`
  file, no e2e directory. `npm test` fails immediately with
  `Missing script: "test"`. The only thing resembling a test is
  `scripts/tests/test-cold-start.ts`, an API/server smoke script with no widget
  coverage. This is the single biggest structural risk in the "testing" pillar of
  this scan — see §7 for a proposed minimal starting point.

## 2. LOT AI, the System tab, and Portrait

- **"LOT AI" is not a distinct assistant/chat surface.** It is a text label
  (`EmotionalCheckIn.tsx:158,208`) applied to the existing `EmotionalCheckIn`
  check-in widget only during morning/evening time windows (`isLOTAIMoment`). The
  `/how` terminal command (`Logs.tsx:4141,4148`) claims to "open LOT AI check-in"
  but only switches to the System tab — if the user isn't in a morning/evening
  window, `EmotionalCheckIn` won't show the "LOT AI:" label at all, so the command's
  description and its actual behavior disagree. There is no dedicated `/api/chat` or
  LLM-completion endpoint behind this label; the only real LLM usage in the
  codebase is the separate Memory feature.
- **The System tab** (`System.tsx`, ~1070 lines) is not internally tabbed — it's one
  long gated vertical scroll rendering ~45 widgets, each conditionally shown via
  `shouldShowWidget`/`LazyMount` (viewport-based mount gating, not code-splitting).
  It fetches profile/logs/community-emotion itself (`useProfile`, `useLogs`,
  `useCommunityEmotion`) but most child widgets independently re-fetch their own
  data via `#client/queries` hooks rather than consuming what the parent already
  holds — a duplicated-fetch pattern, not a hard bug, but worth flattening later.
  It fully unmounts when the tab is inactive, a documented workaround for an
  `intentionEngine` subscriber performance issue.
- **"Portrait" as a personal profile page does not exist.** No file, component, or
  route named `Portrait` exists anywhere in `src/client` or `src/server`. The router
  only defines `system | logs | sync | settings | api`. "Portrait" only appears as
  narrative copy — `MonthlyPulseWidget.tsx:22,30` ("the portrait deepens" / "the
  portrait is complete"), `Settings.tsx:616` ("the system builds your portrait from
  what you share"), and literal AI-image-generation prompt strings in
  `CosmicUpdateWidget.tsx:40-48`. If a dedicated profile page was intended, it was
  never built — only alluded to in copy across three unrelated widgets.

## 3. Quantum Intent Engine, Memory, Story

- **QIE is 100% client-side.** `src/client/stores/intentionEngine.ts` (~5500 lines)
  ingests `recordSignal()` calls, persists to localStorage, and derives patterns,
  cohort classification, and the "QOS index" via pure client functions. The server
  never recomputes QIE state — `memory.ts`'s `buildPrompt()` only accepts an
  already-computed `quantumState` object from the client as prompt flavor text.
  `QuantumSignWidget.tsx` (date-seeded string arrays) and `QuantumRandomWidget.tsx`
  (`Math.random()`) are UI shells dressed in "quantum" framing with no backend
  computation behind them — cosmetic, not a bug, but worth knowing when reasoning
  about what's "real" quantum-engine output vs. decorative copy.
- **Dead code:** `forceSyncToServer()` (`intentionEngine.ts:3772`) posts to
  `/api/quantum-intent/sync` — a route that does not exist under
  `src/server/routes/`. The function itself also has zero callers anywhere in the
  client. Dead function calling a dead route; safe to delete, or worth wiring up if
  the sync behavior was intended to exist.
- **Dead code, larger:** `src/server/utils/memory/` (question-generator.ts,
  trait-extraction.ts, story-generator.ts, cohort-determination.ts, pacing.ts,
  recipe-suggestions.ts, index.ts) is a full modular rewrite of the legacy
  monolithic `src/server/utils/memory.ts`. Nothing in the repo imports any of these
  files — `api.ts` imports exclusively from the legacy monolith. This looks like an
  abandoned refactor (`admin-api.ts` even has a `/memory-debug` endpoint that
  inspects the compiled `dist/` output of this dead module, documenting "Phase 1
  Complete" of a refactor that never went live).
- **Memory** is real and durable: `POST /api/memory` → `buildPrompt` +
  `completeAndExtractQuestion` (legacy `memory.ts`) → answer round-trips through
  `POST /api/memory/answer`, both persisted as `Log` rows (Sequelize, not Prisma).
- **Story** resolves to two unrelated features sharing the word "story" — worth
  flagging as a naming collision for anyone auditing by keyword search:
  1. Memory Story (`generateMemoryStory`/`composeLocalStory`,
     `GET /api/memory/story`) — an AI-generated (Together AI, with local
     fallback) narrative summary of a user's memory answers, shown in Settings and
     the public profile.
  2. `NarrativeWidget.tsx` ("Arc:") — an unrelated XP/quest/level gamification
     feature (`GET /api/narrative`), nothing to do with Memory.

## 4. Context sync and interaction logging

- **Weather** is a real, live integration: Open-Meteo forecast + geocoding + a
  geonames timezone lookup, server route `GET /weather`, cached in a
  `WeatherResponse` DB table, with a live health check in `public-api.ts`. (One
  unrelated decorative "Simulate Florence weather" demo endpoint exists in the same
  file — don't confuse it with the real path.)
- **Circadian phase** (`getCircadianPhase`, `intentionEngine.ts:5049`) is genuinely
  computed live from the browser's clock each call, used across System.tsx and
  several widgets — real, if simplistic (it isn't cross-referenced with the user's
  actual geo-timezone from the weather data).
- **"Users online"** is real and DB-backed: `User.countOnline()` counts rows with a
  recent `lastSeenAt`, updated via ping/deferred-ping, exposed over SSE. Polling +
  a timestamp column, not a websocket presence system, but not simulated either.
- **Cohort matching** (`CohortConnectWidget`) is also real — it queries actual
  `Log` rows and other real users' activity, not mock data.
- **Interaction logging is the weakest link.** `recordSignal()` writes to an
  in-memory store and localStorage immediately, but only reaches the server in
  throttled batches via `syncToServer()` → bulk insert into the `Log` table. A
  single isolated interaction (one click, tab closed before the sync threshold) can
  be lost entirely — there is no synchronous "log this now" endpoint.
- A dedicated `audit_logs` table exists in the DB schema (migration
  `20260410120100_add-audit-log-table.cjs`, with event/userId/ip/userAgent/details
  columns, indexed) but has **zero** references anywhere in application code — no
  model, no writes, no reads. It's fully provisioned and fully unused.
- **Sound** is a real, hand-written Web Audio implementation
  (`src/client/utils/sound.ts`, 652 lines) — genuine oscillator synthesis, varied by
  weather condition, temperature, humidity, pressure, and users-online count. Not
  decorative; it's actually driven by the same live context data described above.

**Verdict on the "military communications Log" framing**: widget interactions do
become durable records, but on a delay and best-effort, not per-action and
guaranteed. If the intent is a real always-on activity log, the unused
`audit_logs` table is the natural place to wire up — it already has the right
shape and just needs a writer.

## 5. 15-month UI reveal roadmap

No document describing a 15-month phased UI rollout was found anywhere in the
repo. The closest real precedent is a **12-month** milestone system:
`MonthlyPulseWidget.tsx`'s `MONTH_MESSAGES` map (Month 1 → Month 12, capped, "One
year with LOT. The portrait is complete"), driven off `user.joinedAt`. A separate
business-doctrine document (`docs/corporate/LOT_QI46_ENGINE.md`) describes a
Month 0–3 / 3–6 / 6–12 / 12+ narrative, but that's engine doctrine, not a UI build
schedule, and nothing in either totals 15 months. If a 15-month widget-reveal
roadmap is wanted, it doesn't exist yet and would need to be authored — the
12-month `MonthlyPulseWidget` pattern is the only reusable precedent in the repo.

## 6. Loading speed and fixes applied this pass

- Widgets are **not** code-split. The client bundler
  (`scripts/build/client.build.ts`) splits across its 7 page entry points
  (`app.tsx`, `login.tsx`, etc.) but not per-widget — zero `React.lazy` usage
  anywhere in `src/client/components`, and `app.tsx` imports all ~45 System-tab
  widgets synchronously into one eager bundle. True lazy-loading per widget would
  be new work, not a quick fix, and risks regressions without a test suite backing
  it (see §7) — not attempted in this pass.
- **Fixed in this pass:** `TimeWidget` and `QuantumRandomWidget` in `System.tsx`
  were the only two widgets rendered outside a `WidgetErrorBoundary`. Wrapped both
  (two call sites — the normal layout and the mirror-mode layout) in
  `<WidgetErrorBoundary name="Time">` / `<WidgetErrorBoundary name="Quantum
  Random">`, matching the existing pattern used by every other widget in the file.
  This is a pure isolation fix (contains a render error to that widget instead of
  the parent boundary/app) — no behavior change when nothing throws.
- No `dist/client/` build output exists in this checkout to measure real bundle
  size; `client:js:build:metafile` (already in `package.json`) is the existing tool
  to run for that when wanted.

## 7. Lag / performance testing — infrastructure gap

No Playwright, Cypress, Vitest, or Jest exists in this repo (`package.json` has no
test script, no test-framework dependency, no config file for any of the four).
`src/client/utils/perf.ts` is a real runtime instrument — a `PerformanceObserver`
tracking Interaction-to-Next-Paint and long animation frames, exposed at
`window.__LOT_PERF__` — but it's a diagnostic, not an automated test; nothing
asserts against it or fails a build on a regression. Building real "lag tests" for
buttons/sounds/controls/loading, as the scan brief asked for, means standing up a
test runner from scratch first. Given the scale of that (new dependency, new CI
step, first test file in the repo's history) it was left out of this pass rather
than rushed in without review — flagging it here as the top follow-up.

## Summary — top items if prioritizing follow-up work

1. Stand up a minimal test runner (Playwright is the natural fit given the
   perf.ts INP hook already exists to build on) — currently zero coverage.
2. Wire the unused `audit_logs` table to a real writer, or drop it — right now it's
   dead schema next to a best-effort, delayed logging path through `Log`.
3. Delete the dead `src/server/utils/memory/` modular rewrite and the dead
   `forceSyncToServer()` / `/api/quantum-intent/sync` pairing, or finish wiring
   them — both are unreferenced today.
4. Decide whether "Portrait" and a true 15-month roadmap are still wanted features;
   neither exists today beyond narrative copy.
5. `CalendarWidget` losing data on browser clear is the one persistence gap found
   in the widget sample — worth a server round-trip if calendar entries matter
   long-term.

Fixes applied this pass: `src/client/components/System.tsx` — wrapped `TimeWidget`
and `QuantumRandomWidget` in `WidgetErrorBoundary` at both render sites.
