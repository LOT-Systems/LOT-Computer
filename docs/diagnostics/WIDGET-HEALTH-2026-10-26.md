# LOT® WIDGET HEALTH SCAN — 2026-10-26

Scheduled routine · branch `claude/charming-albattani-cs3bcd` · base `98971f2`

## 1. Verdict

| Area | Status |
|---|---|
| Widget inventory / mounting | 48 widget-class components scanned; 46 mounted from `System.tsx`, **2 orphans** |
| Crash isolation | 2 unwrapped widgets found → **fixed** |
| Render-time flicker bugs | 2 found (Subscribe, Intentions) → **fixed** |
| Background timers | 5 ungated intervals → **3 gated, 2 left (justified)** |
| Usage data log | **none existed** → added local 14-day log |
| Type check (`tsc --noEmit`) | 111 errors before, 111 after, **0 new** (all pre-existing: badges.ts 36, intentionEngine 11, app.tsx 9 …) |
| Client build (esbuild, prod) | PASS (2 pre-existing duplicate-key warnings in `badges.ts`: `elixir_found` L4825/L6883) |
| Runtime lag test (buttons, sound, load) | **NOT RUN** — see §8 |

## 2. Changes in this push

1. `src/client/utils/widgetUsage.ts` (new): per-widget, per-day record of mounts, mount ms (total/max), slow mounts (>50 ms), crashes, retries. Coalesced `localStorage` write (2 s), 14-day retention, readable at `window.__LOT_WIDGET_USAGE__.get()`. Local only, nothing is sent anywhere.
2. `WidgetErrorBoundary`: feeds the usage log on mount, crash and Retry click.
3. `System.tsx`
   - `TimeWidget` and `QuantumRandomWidget` wrapped in `WidgetErrorBoundary` (both layouts). They were the only mounted widgets outside a boundary, so a throw would have gone to the app-level boundary.
   - **Subscribe widget flicker:** `Math.random() < 0.2` was evaluated in render, so every System re-render (weather, logs, SSE) re-rolled it and the widget could pop in and out. Now rolled once per mount (`useRef`).
   - **Intentions widget flicker:** render wrote `intentions-last-shown`, so the next render read the cooldown as unpassed and, with no stored intention, returned `null`. The cooldown was also re-randomised each render. Now rolled once and latched for the mount.
   - `LazyMount` added around the Investor stack (QuantumState, PatternRecognition, AIFeedback, SignalStream, Integrity) and the Dashboard heavies (SystemProgress at 2,513 lines, SystemPulse). Their store subscriptions and fetches now start only when scrolled to within 200 px. Previously `LazyMount` covered only `QuantumEngineWidgets`.
4. `ui/Clock.tsx`: tick skipped while `document.hidden`, immediate resync on `visibilitychange`. The 100 ms Time clock no longer runs state updates in a background tab.
5. `QuantumRandomWidget`: both 1 s / 10 s intervals skip while hidden. This also stops `recordSignal('calculator','quantum_random')` from firing into the signal store from a background tab.

## 3. Widget wiring map

Every widget below is mounted from `System.tsx` (paid layout unless noted). "Signals" = calls `recordSignal()`, the single sink into the Quantum Intent Engine (`intentionEngine` store → `localStorage intention-signals` → periodic `syncToServer`).

| Layer | Widgets | Wiring |
|---|---|---|
| Container / display only (no signal) | Time, Calendar, SystemPulse, SystemProgress, UserMetrics, CorrelatedIndexes, Benchmark, Architect, AngelInvestor, CorporatePlan, DemoDay, Subscribe, CosmicUpdate, Evolution, InterfaceEvolution, MonthlyPulse, SignalStream, QuantumState, AIFeedback, Integrity | read stores/queries, no write-back to QIE |
| Interactive, **signals to QIE** | QuantumEngineWidgets (7), CohortConnect (4), PatternInsights (3), MicroImage (2), MicroCalculator (2), ContextualPrompts (2), SelfCareMoments, Recipe, Planner, Narrative, Memory, Interventions, Intentions, GoalJourney, EnergyCapacitor, EmotionalCheckIn, ChatCatalyst, ChakraErgonomics, QuantumRandom, MicroGame | `recordSignal(source, signal, meta)` |
| Memory | MemoryWidget → `/api/memory`; signals once | |
| Story | NarrativeWidget (signals once), GoalJourneyWidget (signals once); both are display/derivation over QIE state | |
| AI | AIFeedback, SystemProgress (`/api/system/*`, `/api/user-profile`), QuantumEngineWidgets (`/api/user-profile`) | |
| Profile / "Portrait" | no component or route named *Portrait* exists in `src`; the profile surface is `useProfile()` + `PublicProfile` + `/api/user-profile`, shown in System via the Psychology / My Journey / Biofield cycle row | naming gap, see §7 |

**Orphans (exported, never mounted):** `AwarenessDashboard`, `JournalReflection`. Both call `recordSignal`, so their signal sources are currently dead.

## 4. Timers and background work

23 `setInterval` sites across the client. Widget-level after this push:

| Widget | Interval | Hidden-tab guard |
|---|---|---|
| Time (chime check) | 1 s | no, deliberate: hourly chime must fire; resync on visible exists |
| Clock (ui) | 100 ms in Time widget | **yes (new)** |
| QuantumRandom ×2 | 1 s, 10 s | **yes (new)** |
| MicroCalculator | 10 s | no, cheap clock compare. Left as is |
| MicroGame | game loop | gated by viewport (existing) |
| ChakraErgonomics, ContextualPrompts, EvolutionMilestoneToast, SystemPulse, SystemProgress | various | yes (existing) |

Open item: the Time chime check could drop to a timeout aligned to the next minute boundary instead of a 1 s poll. Not changed here because of chime-miss risk with throttled tabs.

## 5. Bundle / loading

```
dist/client/js (prod, minified, uncompressed)
app.js      730 KB     about.js    441 KB     chunk-IXSBPTWB 238 KB
chunk-S4MW  195 KB     chunk-IYKC  149 KB
```

- `System.tsx` imports all ~48 widgets statically into `app.js`. Converting the below-the-fold stacks to `React.lazy` would cut initial JS; `LazyMount` defers only subscriptions and fetches, not parse cost. **Recommended next step**, not done here because it needs a real browser check.
- `about.js` at 441 KB is dominated by the version-history string rows in `About.tsx` (very long inline literals).
- `badges.ts` is ~8,000 lines with 2 duplicate keys and 36 type errors. It is the largest type-debt file.

## 6. Widget usage data log (new)

Read in the browser console: `__LOT_WIDGET_USAGE__.get()`

```
{ "<Widget>": { "2026-10-26": { mounts, errors, retries, slowMounts, mountMsTotal, mountMsMax } } }
```

Live per-widget mount timings from the existing `__LOT_WIDGET_PERF__` remain. Interaction clicks per widget are **not yet** logged, because the boundary has no DOM wrapper. Next step: a `data-widget` attribute on widget roots plus one delegated listener.

## 7. Gaps against the program

- **15-month reveal:** no calendar-indexed month 1…15 schedule exists. Evolution is behavioural (`$featureUnlocks`, 7 consumers: PatternInsights, MoodAnalytics, EvolutionMilestoneToast, Narrative, Memory, Intentions, InterfaceEvolution). The other ~35 widgets are visible from day 1 for paid users. Proposal: a single `REVEAL_MONTH: Record<WidgetName, 1..15>` table consumed by one `<Reveal widget="…">` gate, keyed to account age.
- **Synced context in the Log ("military comms" post):** the LOG triggers (`/breathe /fast /silent /freeze /phys`) exist, but no widget posts a combined weather + time + users-online status line. Proposal: a `/sitrep` trigger that composes it from `stores.weather`, `usersOnline` and the current `userIndex`.
- **Monk-mode / LOT AI:** `ContextualPrompts`, `Interventions` and `SelfCareMoments` already provide the prompts. There is no single "daily discipline" widget tying fasting, breathe, silent and recipe into one routine. Proposal only.
- **"Portrait" naming** does not exist in code (see §3).
- Render-time `localStorage` writes remain in the Self-care and Intentions IIFEs in `System.tsx`. They are impure but now idempotent. Moving them into effects is a safe follow-up.

## 8. Not tested

No headless runtime lag test was run: the app needs the database, the weather and cohort APIs and an audio device. So button latency, sound latency and real load time are **unmeasured**. The perf observers (`__LOT_PERF__`, `__LOT_WIDGET_PERF__`, `[Perf] … took Nms`) are live in production builds and the new usage log adds a daily rollup. Suggested next run: Playwright against a seeded dev server, recording `getWidgetTimings()` and INP entries.

## 9. Verification

```
tsc --noEmit -p tsconfig.json     : 111 errors before / 111 after, diff of error set = empty
client:js:build (prod)            : PASS
git diff --stat                   : 4 files modified + 1 new + this report
```
