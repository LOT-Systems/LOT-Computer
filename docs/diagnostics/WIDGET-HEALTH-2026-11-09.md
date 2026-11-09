# Widget Health Scan — 2026-11-09 (scheduled routine)

**Branch:** claude/charming-albattani-f7f4m6
**Method:** static source scan (grep/read) of `src/client/components/*Widget*.tsx`, `System.tsx`, `ui/Clock.tsx`, `ui/WidgetErrorBoundary.tsx`, build config.
**Not performed:** build, typecheck, runtime lag test, sound latency test — the container has no `node_modules`/browser session against the app. Lag numbers below are code-level estimates, NOT measurements.

## 1. Inventory
- 41 widget components (~12.4k lines). `SystemProgressWidget` is 2,513 lines (20% of all widget code), 33 network/API references, 3 intervals — the heaviest widget and the main loading-speed candidate.
- `MicroGameWidget` 988 lines (36 sound refs), `QuantumEngineWidgets` 651, `PatternRecognitionWidget` 561.
- Esbuild uses `splitting: true` with 7 entries, but there is **no `React.lazy`** anywhere; every widget is statically imported into `System.tsx` (1,071 lines). Only `QuantumEngineWidgets` is deferred, via `LazyMount` (viewport-gated).

## 2. Wiring / resilience
- Error isolation: every widget in `System.tsx` is inside a `WidgetErrorBoundary` (directly or via a group such as Bioethics / Biofield Engine / Dashboard / Stats). **Gap fixed:** `TimeWidget` (x2) and `QuantumRandomWidget` were bare in the core layouts → now wrapped.
- Boundary timing hook exists (`window.__LOT_WIDGET_PERF__`) — usable for the lag log, but nothing persists it.
- Log wiring (`useCreateLog` / `POST /api/logs`): only Planner, Calendar, Recipe, ContextualPrompts, SelfCareMoments post to the Log. Time, weather, users-online, astrology, Memory, Game, QuantumState etc. do **not** post synchronized context. The "military-communications" synced status post (time + weather + users online + widget state) is not implemented.
- AI wiring: AI references appear in SystemProgress (10), AIFeedback, CorporatePlan, Cosmic, Recipe. No single shared widget→AI context channel was found in this scan; Portrait/Settings page mounts a "Stats Widgets" section (Settings.tsx ~633). Deeper trace of Portrait/QIE/Memory/Story data flow: NOT done this run.
- Local persistence: `localStorage` in Intentions (6), Memory (4), QuantumSign (4), MonthlyPulse (3), others 1–2. Not wrapped consistently in try/catch (not audited per key).

## 3. Lag / performance findings
| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | `Clock` ran a 100 ms interval (TimeWidget) formatting dayjs even in hidden tabs | Low–Med | **Fixed**: skips when `document.hidden`, resyncs on `visibilitychange` |
| 2 | `QuantumRandomWidget` runs 3 timers (2×1 s + 10 s) with no off-tab pause | Low | Open |
| 3 | `SystemProgressWidget` 2.5k-line eager import in main app chunk | Med (load time) | Open — candidate for `React.lazy` + `LazyMount` |
| 4 | Pro layout mounts ~40 widgets eagerly; only QuantumEngine is lazy | Med | Open — extend `LazyMount` to below-fold stacks (Biofield Engine, Dashboard, Stats) |
| 5 | Widgets with timers lacking cleanup: none found by grep (all setInterval users have clearInterval) | OK | — |
| 6 | `TimeWidget` rAF `tick` closes over stale `isRunning`; works only because the effect re-schedules | Low | Open (works, fragile) |

## 4. 15-month UI reveal
`interfaceEvolution.ts` has no month-based (1–15) reveal schedule keyed on the string "month"; progression is mastery/density based (`density.sectionGap`). A month-by-month widget unlock map is **not present**; needs a spec from S-2 before implementing.

## 5. Changes in this push
- `src/client/components/System.tsx`: wrap TimeWidget ×2 and QuantumRandomWidget in `WidgetErrorBoundary`.
- `src/client/components/ui/Clock.tsx`: pause ticking when tab hidden; resync on visibility.
- Not built/typechecked (no deps installed) — changes are small and syntactically straightforward; run `yarn build` before deploy.

## 6. Recommended next runs
1. Install deps; run build + Playwright lag harness (click→paint, sound start latency, widget mount times from `__LOT_WIDGET_PERF__`).
2. Lazy-load SystemProgress + below-fold stacks.
3. Add a widget usage-event logger (mount, interact, error) → server table, to satisfy "data log of all widget usage".
4. Define synced "status post" (time/weather/online/sky) for the Log.
5. Spec the 15-month reveal map.
