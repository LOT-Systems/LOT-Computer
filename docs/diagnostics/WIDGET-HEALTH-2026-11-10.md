# LOT® Widget Health Scan — 2026-11-10 (scheduled run)

Scope: wiring, UI, lag, loading, usage data. Method: static audit of `src/client` + `src/server/routes`, `tsc` diff, production client build. **No live browser/lag run was possible** in this environment (no deployed target, no real audio device); lag items below are structural findings, not measured timings.

## 1. Inventory
- 38 `*Widget*.tsx` components + QuantumEngineWidgets; ~12.4k lines. Largest: SystemProgressWidget (2,513), MicroGameWidget (988), QuantumEngineWidgets (651).
- Every widget imported in `System.tsx` is rendered. No orphan widget files. 
- Two layouts: free (Memory, Game, Subscribe only) and paid/R&D (full stack, grouped under named `WidgetErrorBoundary`s).

## 2. Wiring
| Area | Status | Notes |
|---|---|---|
| Error isolation | OK | All stacks sit inside `WidgetErrorBoundary` (Context, Bioethics, Community, Planning, Biofield, Dashboard, Stats…). Free-tier `TimeWidget` is the only bare widget. |
| Widget → API | OK | Endpoints used by widgets all exist server-side: `/api/system/{pulse,deployment-status,feedback-analytics,my-feedback,submit-feedback}`, `/api/user-profile`, `/api/cohorts`, `/api/logs`, `/api/memory*` (incl. `/memory/story`). |
| Widget → Log | Partial | Only Calendar, Planner, Recipe, ContextualPrompts write to `/api/logs`. Most widgets are display-only or store-local. The "military comms" sync post (weather/time/users-online context line) is **not implemented** — see §6. |
| LOT® AI / System tab / Portrait | OK (static) | Portrait data flows through `useProfile` + `/api/user-profile`; QEW and SystemProgress read it. No broken imports. |
| QIE / Memory / Story | OK (static) | MemoryWidget → `/api/memory`; Story → `/api/memory/story`; QEW subscribes to intentionEngine. |

## 3. Defects found
1. **Interval leak (fixed)** — `initRecipeWidget()` created an uncleared `setInterval` on every call; no guard against double init. Now idempotent and returns a disposer, wired into the `app.tsx` effect cleanup.
2. **LazyMount didn't defer (fixed)** — placeholder had zero height, so all LazyMounts stacked at one y-offset and intersected immediately. Added `minHeight: 160` until mounted.
3. **Eager heavy stacks (fixed)** — Biofield Engine (5 widgets), Dashboard (SystemProgress 2.5k lines + Pulse + Metrics, 6+ fetches) and Stats (6 widgets) mounted on first paint. Now wrapped in `LazyMount` (mount at 200px before viewport).
4. **Open (not changed)** — `System.tsx` also calls `checkRecipeWidget()` on mount while `initRecipeWidget()` already did; harmless duplicate fetch, candidate for removal.
5. **Open** — `SystemProgressWidget` has 3 `setInterval` vs 2 `clearInterval` in code; the third match is inside changelog text (false positive), no real leak.
6. **Open** — `intentionEngine` has a single QOS monitor interval with proper disposer; verify caller invokes it on logout.
7. **Open / pre-existing** — 104 `tsc` errors repo-wide (e.g. `weather.humidity` possibly null at System.tsx:626, `UserProfile.metadata` missing in app.tsx). Build still succeeds (esbuild). Count unchanged by this run (104 → 104).

## 4. 15-month reveal (month-by-month UI build-up)
`density` + `getOptimalWidget`/`shouldShowWidget` drive progressive reveal in `System.tsx`. Static scan shows no widget gated on a month index beyond mastery density; a month 1→15 reveal table is **not codified** — recommend a single `REVEAL_SCHEDULE` map (month → widget ids) so the Digital UX routine can verify each month mechanically.

## 5. Loading speed / lag
- Client bundle: `app.js` 730 KB, `about.js` 441 KB (unminified-size listing from `dist/client/js`; no code-splitting: zero `React.lazy`). Recommendation: `React.lazy` for SystemProgressWidget, MicroGameWidget, QEW (largest).
- `WidgetErrorBoundary` already records mount time (`window.__LOT_WIDGET_PERF__`, warns >50 ms); `initPerfObserver` logs interactions >200 ms (`window.__LOT_PERF__`).
- Sound/controls: sound is centralized (`useSound` in app.tsx); toggles are debounced 300 ms. No per-widget audio leaks found. Real latency of buttons/sounds needs a device run (not measured).

## 6. Data log of widget usage (new)
- Added `src/client/utils/widgetUsage.ts`: per-widget `mounts`, `interactions` (click capture), `lastMountMs`, `maxMountMs`, `lastSeen`; bounded, throttled (2 s) localStorage write; exposed at `window.__LOT_WIDGET_USAGE__.get()`.
- `WidgetErrorBoundary` feeds it via `display: contents` wrapper (no layout change).
- **Next step (not done)**: periodically post a compact `widget_usage_snapshot` event to `/api/logs` (same pattern as `os_vitals_snapshot`) for platform-wide aggregation, and a "context sync" log line (weather · time · users online) in the terse military-comms format. Left unimplemented to avoid new server event types without review.

## 7. Monk-lifestyle / LOT® AI transparency
Free tier is already minimal (Memory, Game, Subscribe, no AI). Recommendation: surface the usage ledger to the user in Portrait ("what I used today") as the transparent self-audit.

## 8. Checks
- `tsc`: 104 errors before and after (no regressions).
- `client:js:build`: green.
- Live lag test, audio test, visual 15-month check: **not run** (needs deployed environment).

## Files changed
`src/client/utils/widgetUsage.ts` (new), `ui/WidgetErrorBoundary.tsx`, `stores/recipeWidget.ts`, `entries/app.tsx`, `components/System.tsx`.
