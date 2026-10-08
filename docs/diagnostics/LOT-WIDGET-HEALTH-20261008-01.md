# LOT® WIDGET HEALTH SCAN — 2026-10-08 · Report 01

**Mode:** scheduled static scan (read-only; no code changed)
**Branch:** `claude/charming-albattani-6bb94s` @ `98971f2`
**Scope:** wiring, storage, AI/System/Portrait links, QIE/Memory/Story links, Log sync, 15-month reveal, load speed, lag, usage log.

## 0. Limits of this scan (read first)

| Item | Status |
|---|---|
| `node_modules` / build | **Not present — build, typecheck, bundle-size and runtime lag NOT run.** |
| `dist/client` | Absent (only `dist/server`) — no bundle metrics. |
| Automated widget tests | **None exist** (`scripts/tests/` = cold-start, db, email, env only). |
| Lag test (buttons/sounds/controls) | **Not measurable here.** Code-level risks only (§6). Needs a browser run (Playwright + Chromium is available in this env once deps are installed). |

Everything below is from reading source. Counts are grep-verified.

## 1. Inventory

- 40 widget files in `src/client/components` (12,438 lines). `SystemProgressWidget` is 2,513 lines (20%).
- 38 are statically imported by `System.tsx` (lines 30–81). **0 uses of `React.lazy`/`Suspense` in the client.**
- Error isolation: `WidgetErrorBoundary` is used **only in `System.tsx`**. Good coverage there (≈20 boundaries), but `<TimeWidget />` is mounted bare at `System.tsx:444` and `:616`, and `<QuantumRandomWidget />` at `:617`.
- Storage: widget state lives in nanostores (`intentionEngine`, `evolution`, `selfAssembly`, `plannerWidget`, `recipeWidget`, `rewardWidgets`), react-query (`/api/logs`, 5 min stale), and `localStorage` (12 widgets). Server holds the durable copy via `/api/logs`.

## 2. Wiring: LOT® AI · System tab · Portrait

| Link | State |
|---|---|
| System tab hosts all widgets | OK — single mount point (`System.tsx`). |
| AI (Memory/Story/narrative/interventions) | Wired via server utils: `memory`, `rpg-narrative`, `compassionate-interventions`, `cohort-chat-catalyst`, `contextual-prompts` (routes in `api.ts`, `/memory/story` at `:2610`). |
| Portrait (personal profile page) | **Weak.** Only `MonthlyPulseWidget`, `CosmicUpdateWidget`, `Settings` mention it. `PublicProfile.tsx` (673 lines) mounts **no widgets**. Portrait is fed indirectly via logs/signals, not by widget wiring. |
| Gating by evolution | Only 4 widgets read `$featureUnlocks` (`PatternInsights`, `Narrative`, `MoodAnalytics`, toast). Most other unlock flags (`plannerTemplates`, `communityRich`, `widgetArrange`, `exportData`, `privateSpaces`, `achievementGallery` …) have 0–1 reader references outside `interfaceEvolution.ts` — likely unenforced, needs a manual check (`achievementGallery` has none). |

## 3. Wiring: Quantum Intent Engine · Memory · Story

- QIE: `recordSignal()` is the bus (`intentionEngine.ts:199`). Cheap on the hot path — persistence and the 125-pattern analysis are deferred (`schedulePersist`, `deferHeavy`); 7-day / 1000-signal cap. Healthy design.
- 19 of 40 widgets emit signals. **20 silent** (display-only or unwired): AIFeedback, AngelInvestor, Architect, Benchmark, Calendar, CorporatePlan, CorrelatedIndexes, CosmicUpdate, DemoDay, Evolution, Integrity, InterfaceEvolution, MonthlyPulse, QuantumSign, QuantumState, SignalStream, Subscribe, SystemPulse, Time, UserMetrics.
  - **Gap:** `CalendarWidget`, `QuantumStateWidget`, `QuantumSignWidget`, `MonthlyPulseWidget` are interactive yet emit no signal → QIE never learns from them.
- Memory/Story: `MemoryWidget` emits signals + calls `/api` (3 net sites, 13 timeouts, only 1 cleanup — see §6).
- Only **3 widgets write to the Log** (`useCreateLog`: Calendar, Planner, Recipe). All others are signal-only (browser-local, 7-day retention, periodic server sync).

## 4. Log sync ("military self-care" context post)

**Not implemented.** No widget posts a combined context line (weather + time + users online) to the Log. The ingredients exist separately: weather (`stores/state.ts`, System.tsx), time (`TimeWidget`), users online (`/api/visitor-stats`). No SITREP-style formatter exists (`sitrep` appears only in `SystemProgressWidget` / `About`).

**Proposal — SITREP line**, posted via `useCreateLog` with `event: 'widget_sitrep'` whenever an interactive widget is used (throttled, e.g. ≤1 per widget per 10 min):

```
SITREP 0332Z | WX 54F CLR | ONLINE 7 | PLANNER: TASK DONE | STATUS: NOMINAL
```

Monk-lifestyle / transparency rule: one terse line, no editorializing, same fields every time, AI never rewrites the entry — it only reads it.

## 5. 15-month month-by-month reveal

- **Not implemented as a calendar.** Interface evolution is maturity-gated (badges/level/streak → `featureUnlockLevel` 0–5), not time-gated.
- Only calendar logic is `MonthlyPulseWidget`: `dayjs().diff(joinedAt,'month')`, Usership-tag users only, messages for months 1–12 and a generic fallback beyond. **Months 13–15 have no dedicated message**, and nothing reveals UI per month.
- Recommend a single `MONTH_REVEAL` table (month 1…15 → widget ids), read by `System.tsx`, composed with the existing maturity gate. Draft:

| Mo | Reveal | Mo | Reveal |
|---|---|---|---|
| 1 | Time, Memory, Pulse | 9 | Pattern Recognition, Signal Stream |
| 2 | Planner, Recipe | 10 | Integrity, AI Feedback |
| 3 | Intentions, Calculator (Active User) | 11 | Quantum Engine widgets |
| 4 | Portrait deepens: Narrative | 12 | Architect, Benchmark (portrait complete) |
| 5 | Pattern Insights | 13 | Evolution, Interface Evolution |
| 6 | Cohort Connect, Chat Catalyst | 14 | Correlated Indexes, Cosmic |
| 7 | Goal Journey, Interventions | 15 | Full cockpit / instrument density |
| 8 | Chakra Ergonomics, Quantum State | | |

(Mapping is a proposal for S-2 to approve, not derived from existing code.)

## 6. Load speed & lag findings (ranked)

| # | Sev | Finding | Where |
|---|---|---|---|
| 1 | **High** | No code-splitting: all 38 widgets + 2.5k-line `SystemProgressWidget` + 6.5k-line `intentionEngine` ship in the initial bundle, though most are hidden by gating. Lazy-load behind the gate. | `System.tsx:30–81` |
| 2 | Med | `QuantumRandomWidget` runs **three** timers (two 1 s countdowns + 10 s toggle) and re-renders every second; **not paused** when tab hidden or off-System (other polling widgets already do this). | `QuantumRandomWidget.tsx:39,65` |
| 3 | Med | `TimeWidget` ticks every 1 s all the time (also unbounded off-tab); cheap if it doesn't setState each tick, but add the same `document.hidden` guard. | `TimeWidget.tsx:113` |
| 4 | Med | `MicroGameWidget` interval has a `pausedRef` but no `document.hidden`/route check; 36 sound references — audio on a hidden tab. | `MicroGameWidget.tsx:790` |
| 5 | Med | **Un-cleaned timeouts** that can `setState` after unmount: Monthly (3), Planner (3), Recipe (4), MicroCalculator (1), Memory (13 timeouts / 1 clear). | see grep |
| 6 | Low | `SystemProgressWidget` makes 6 raw `fetch` calls (no react-query dedupe, no abort, no staleTime): `/api/user-profile`, logs, deployment-status, my-feedback, feedback-analytics. | `:1577–1680` |
| 7 | Low | `/api/logs` is fetched unbounded (comment in `queries.ts:136` admits no LIMIT); 11 widgets call `useLogs()` (shared cache — OK) but payload grows with account age. | `queries.ts:134` |
| 8 | Low | `new QueryClient()` with defaults (retry ×3, refetchOnWindowFocus) except where overridden. | `entries/app.tsx:119` |
| 9 | Info | Already good: `SystemPulse`, `SystemProgress`, `Chakra`, `ContextualPrompts` pause when hidden/off-tab; `recordSignal` defers heavy work. |

Sound: two audio paths — `utils/sound.ts` (652 lines, `useSound`) and `utils/sovietChime.ts` + `plannerWidget.ts` each build their own `AudioContext` → up to 3 contexts; browsers cap them and need a gesture to resume. Consolidate into one shared context.

## 7. Widget usage data log

**None exists.** There is no `widget_*` event, table, or counter. Signals are local/7-day; Log writes are 3 widgets. To log usage across the platform: add a `trackWidget(id, action)` helper that (a) calls `recordSignal`, (b) batches into one `POST /api/logs` `event:'widget_usage'` per 10 min, (c) feeds the SITREP line (§4). This also closes the 20 silent widgets (§3).

## 8. Action list (priority order)

1. `React.lazy` + `Suspense` for gated and below-fold widgets (largest load win).
2. Add `document.hidden`/`isRouteActive` guard to `QuantumRandom`, `Time`, `MicroGame`; wrap `TimeWidget`/`QuantumRandom` in `WidgetErrorBoundary`.
3. Cleanup refs for timeouts in Monthly/Planner/Recipe/Calculator/Memory.
4. `trackWidget()` usage log + SITREP line (§4, §7).
5. Audit the barely-read unlock flags (§2); wire or delete.
6. `MONTH_REVEAL` table for months 1–15; add month 13–15 messages.
7. Mount a Portrait widget strip on `PublicProfile`/Portrait.
8. Move `SystemProgressWidget` fetches to react-query with `staleTime`; add `?limit` to `/api/logs`.
9. Add a Playwright smoke + lag test (click-to-paint timing, sound latency, mount time via existing `[Perf]` hook in `WidgetErrorBoundary`).

## 9. Verdict

**YELLOW.** Nothing observed broken at the source level, and the hot paths (signals, polling) are already well-behaved. But the requested capabilities — Log sync, month-by-month reveal, usage log, lag tests — are **not built**, and load speed is unoptimized (no splitting). No build or runtime check was possible in this run.
