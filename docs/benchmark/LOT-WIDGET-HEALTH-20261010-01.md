# LOT® WIDGET HEALTH SCAN — 2026-10-10 (scheduled run #01)

Branch: `claude/charming-albattani-a24id5` · Method: static scan of `src/client` + typecheck + production client build. **No browser/runtime lag test was run** (no device, no network to prod) — runtime items are marked `NOT MEASURED` and need a device pass.

## 1. Verdict

| Check | Result |
|---|---|
| Client production build (esbuild) | PASS (0.9 s) |
| `tsc --noEmit` | **104 errors, all pre-existing** (0 introduced by this run). 36 in `badges.ts`, 11 `intentionEngine.ts`, 9 `app.tsx`, 8 `AdminUser.tsx`; ~10 in widgets |
| Widgets in `components/` | 40 `*Widget*.tsx` (+ `QuantumEngineWidgets`), ≈12.4k lines |
| Widgets wrapped in `WidgetErrorBoundary` | All 51 mount sites in `System.tsx` — good isolation |
| Timer hygiene | Every `setInterval` has a matching `clearInterval` (11 files checked). No leaks found |

## 2. Fixes applied this run

1. **`UserMetricsWidget` called the wrong endpoint.** It fetched `/api/cohorts` (returns `{matches}` and runs a 100-log pattern analysis server-side) but reads `archetype` / `behavioralCohort`, which only `/api/user-profile` returns. The widget's cohort line was silently never populated, and each mount cost a wasted DB query. `SystemProgressWidget` already got this same fix earlier. → now `/api/user-profile`.
2. **Widget usage data log (new)** — `src/client/utils/widgetUsage.ts`, hooked into `WidgetErrorBoundary` (single choke point for all 51 widgets). Records per widget per day: mounts, crashes, retries, mount ms (total/max). Content-free, local only, 30-day cap, one debounced write. Console: `__LOT_WIDGET_USAGE__()`. Covers the "data log of all widget usage" item for the client; **server-side aggregation is not built** (see §7).

## 3. Wiring map

| Area | Widgets | Data source | Status |
|---|---|---|---|
| LOT® AI | AIFeedback, ChatCatalyst, ContextualPrompts, Interventions | `/api/logs`, local stores | wired; no shared "AI state" store — each fetches independently |
| System tab / Portrait | System.tsx, SystemProgress (2513 lines, 35 `/api/` refs, mostly changelog strings), SystemPulse (`/api/system/pulse`), UserMetrics (`/api/user-profile`, `/api/me`) | `useProfile`, `useLogs` | wired; UserMetrics fixed |
| Quantum Intent Engine | QuantumEngineWidgets (`/api/user-profile`), QuantumState, QuantumSign, QuantumRandom, PatternRecognition, SignalStream, Integrity | `intentionEngine` store | wired; first two behind `LazyMount` |
| Memory | MemoryWidget (`/api/memory` ×2, react-query, `React.memo`) | server memory engine | wired; only memoized widget |
| Story | NarrativeWidget, GoalJourney, MonthlyPulse | local + `$featureUnlocks` | wired; `GoalJourney` has 3 implicit-any TS errors, `MonthlyPulse` 3 TS errors |
| Data containers (no network) | Angel/Corporate/DemoDay, Benchmark, Correlated, Subscribe | static | OK |

## 4. Interactivity → Log ("military comms" context posting)

Only a few widgets (Calendar, Planner, Recipe, ContextualPrompts) reference the Log API at all; `Logs.tsx` renders `weather_update` and `usersOnline` (L1835, L4013), but **no generic "post widget context (weather / time / users online) to Log" helper exists**. Widgets don't emit a standard SITREP line. Proposal (not built — needs S-2 sign-off on the format): one `postWidgetSitrep(widget, action)` helper that appends `{widget, action, time, weather, usersOnline}` to the log on user-initiated interaction only. Monk-mode principle: log what the operator *did*, never infer what they *are*.

## 5. 15-month reveal

**Gap.** `getFeatureUnlocks` (`utils/interfaceEvolution.ts:303`) gates on level / badge-tier / dimension scores (13 flags), not on calendar months. No month-1…month-15 schedule exists in code; "15-month" appears only in badge/wiki docs. Reveal is therefore earned-progress, not time-driven. If a month-indexed build-up is wanted, add `monthsSinceSignup` to `EvolutionState` and OR it into the gates; mapping of widget → month still needs to be defined by S-2.

Widgets with **no** gate (always visible): Time, Calendar, Benchmark, Architect, Investor trio, Cosmic Update, Quantum Sign, Biofield group. Gated: Memory, Intentions, Narrative, PatternInsights, MoodAnalytics, InterfaceEvolution.

## 6. Performance / lag findings

| # | Finding | Severity | Action |
|---|---|---|---|
| P1 | `System.tsx` statically imports ~45 widgets; bundle `app.js` = **730 KB**, `about.js` = 441 KB, 3 shared chunks 150–240 KB (minified, unzipped) | Med | Convert below-fold groups (Investor, Biofield, Dashboard, Architect, Benchmark, Calendar) to `React.lazy` + existing `LazyMount`. Not done: needs a runtime check that suspense fallbacks don't shift layout |
| P2 | `TimeWidget` runs a **1 s** interval (`checkHour`) always | Low | Align to minute boundary |
| P3 | `SystemProgressWidget` is 2.5k lines, mostly static changelog strings in the JS bundle | Med | Move to JSON fetched on demand when the changelog view opens |
| P4 | Only 1 of 40 widgets uses `React.memo`; `System` has 15 `useStore` subscriptions so child widgets re-render on any of them | Med | Memoize leaf widgets that take no props |
| P5 | `LazyMount` covers only QuantumEngineWidgets (+ SystemProgress); QuantumState/PatternRecognition were meant to be too (manifest "Viewport Isolate") | Low | Verify against manifest |
| P6 | `MicroGameWidget` 988 lines, 36 audio refs | Low | Only loop is viewport-gated (OK per changelog) |
| P7 | Button hover perf: manifest lists "GPU-composited ::before" as READY, not SHIPPED | Info | Confirm merged |
| — | Buttons / sounds / controls / loading latency | **NOT MEASURED** | `utils/perf.ts` already logs interactions >200 ms and long frames >50 ms to console; `__LOT_WIDGET_PERF__` holds mount times. Run on a device and paste output |

## 7. Defects found, not fixed (outside scope or needs a decision)

- `badges.ts`: duplicate object keys `elixir_found` (L4825 vs L6883, different rarity/hidden — **the later silently wins**) and `quarter_drop` (L3214 vs L5501). Also `'ocean_wave'` (L7587) is not in `BadgeType` and several badge `category` values (`mastery`, `behavioral`, `calendar_easter_egg`) are not in the category union. Needs S-2 to pick the canonical definitions.
- 104 typecheck errors overall (list: `tsc` run, top files above). `Logs.tsx` L99/L103 `never` typing, `AdminUser.tsx` tag typing, `intentionEngine.ts` (11).
- **Server-side widget usage log:** none. `os-api.ts` mentions "imbalanced widget usage" but derives it from action logs, not widget views. Needs an endpoint + schema decision (privacy: counts only).

## 8. Next scheduled-run checklist

1. Pull `__LOT_WIDGET_USAGE__()` from a real device; list widgets with crashes>0 or mountMsMax>50.
2. Decide on SITREP log format (§4) and month schedule (§5).
3. Land P1/P3 behind a runtime check.

— Generated by scheduled routine · Terminal Grid style report
