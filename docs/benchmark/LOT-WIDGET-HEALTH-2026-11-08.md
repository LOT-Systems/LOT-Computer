# LOT Widget Health Scan — 2026-11-08

Scheduled run, branch `claude/charming-albattani-rrgux1`. Method: static source scan plus a production client build and a full `tsc` pass. **No live browser, server or database was available, so the lag test is not measured.** Anything about runtime speed below is inferred from code and marked as such.

## 1. Summary

| Area | Status |
|---|---|
| Client production build | PASS (`app.js` 730 KB, `about.js` 442 KB, 19 files in `dist/client/js`) |
| Type check | 104 errors before and after this change (pre-existing, e.g. `RecipeWidget.tsx:261`); none introduced |
| Error isolation | Mostly good, 2 gaps (see 3) |
| Widget usage log | **Was missing. Added** (`src/client/utils/widgetUsage.ts`) |
| Timers | 1 leak fixed (`initRecipeWidget`); others clean |
| 15-month reveal | **Not implemented as a schedule** (see 6) |
| Runtime lag test | NOT RUN (needs browser against a live server) |

## 2. Inventory

40 widget components, ~12.4k lines in `src/client/components`. All are imported eagerly in `System.tsx` (no `React.lazy`), including `SystemProgressWidget.tsx` (2,513 lines, 233 mentions of quantum/QIE terms) and `MicroGameWidget.tsx` (988 lines). Reward widgets (Game, Image, Cosmic, Planner) are already gated by milestone and weekly cooldown (`stores/rewardWidgets.ts`), which limits render cost but not bundle cost.

## 3. Wiring and UI health

- **Server-wired widgets** (call the API): Memory, QuantumEngineWidgets, SystemProgress (6 calls), SystemPulse, UserMetrics. Everything else derives from client stores (`intentionEngine`, `selfAssembly`, `chakraErgonomics`) and the user's log entries.
- **LOT® AI / Portrait:** AIFeedback, PatternRecognition, ContextualPrompts and Integrity reference Memory/QIE data but do so through client stores, not their own endpoints. Data flows one way, from logs to stores to widgets.
- **QIE / Memory / Story:** Memory widget (26 memory references, 1 API call) and QuantumEngineWidgets (1 API call) are the only direct server links. Story generation lives server side (`utils/memory/story-generator.ts`), with no dedicated widget of its own.
- **Error boundaries:** every `System.tsx` section except two is inside `WidgetErrorBoundary`. **Gap:** `TimeWidget` (lines 444, 616) and `QuantumRandomWidget` (617) render unwrapped, so a throw there reaches the app-level boundary. Recommend wrapping.
- **Log posting:** only Calendar, Planner, Recipe, ContextualPrompts and SystemProgress write to the Log. The other widgets are display-only. There is no shared "sitrep" that stamps weather, local time and users-online onto an interaction (the requested military-style synchronized context line). Proposed in section 8.

## 4. Lag / performance (code-level)

- Router isolation, store-subscription cuts and memoization from W23 are in place and intact.
- Polling is well behaved: `SystemPulse` polls every 10 s but skips when the tab is hidden or off the system route. `TimeWidget` ticks at 1 s (cheap, visibility catch-up included). `MicroGame` pauses off-screen.
- **Fixed:** `initRecipeWidget()` is called inside a `useEffect` with no cleanup and created a new 5-minute interval on every call, so re-mounts or StrictMode stacked timers. It is now idempotent.
- **Open:** `QuantumRandomWidget` has two intervals (lines 39, 65) and `MicroCalculatorWidget` polls every 10 s. Neither checks `document.hidden`. Low cost, but worth gating.
- **Open (largest win):** lazy-load `SystemProgressWidget`, `MicroGameWidget`, `MicroImageWidget`, `CosmicUpdateWidget` and the Investor widgets (Angel, Corporate, Demo). They are gated or below the fold, so they are not needed for first paint. Estimated effect on `app.js` size is unmeasured.
- **Sounds:** MicroGame (36 audio references), MicroCalculator (8), Cosmic (5) and the TimeWidget hourly chime. No central audio unlock or latency measurement exists. Existing instrumentation: `window.__LOT_WIDGET_PERF__` (mount time per section, warns above 50 ms) and `window.__LOT_PERF__` (slow interactions above 200 ms).

## 5. Data log of widget usage (added this push)

`src/client/utils/widgetUsage.ts` records per widget: mounts, errors, retries, total visible time, last mount time, plus a 200-event ring buffer. It is hooked into `WidgetErrorBoundary`, so every boundary-wrapped section is covered with no per-widget changes.

- Storage: `localStorage` key `lot-widget-usage-v1`, writes debounced to 2 s, failures swallowed.
- Read: `window.__LOT_WIDGET_USAGE__.get()`.
- **Local only.** Nothing is sent to the server. Platform-wide aggregation across users would need an ingest endpoint and a consent decision, which this run did not make for you.
- Not yet covered: the two unwrapped widgets above, and interaction counts inside widgets (clicks, answers). Those need explicit `recordWidgetEvent` calls.

## 6. 15-month reveal

Interface evolution (`stores/evolution.ts`, `utils/interfaceEvolution.ts`) is driven by achievements, level, streak, badges and entries. **No month-based reveal exists** that stages widgets across 15 months. A time-based schedule would need a product decision on which widget appears in which month; I did not invent one. A suggested shape: a `WIDGET_REVEAL_MONTH: Record<WidgetName, 0..14>` table checked against account age, combined with the existing achievement gates.

## 7. Monk / transparency principle

The AI-facing widgets are read-only views over the user's own data, which fits the "pure and transparent" intent. The new usage log follows the same rule: local, inspectable by the user, and not transmitted.

## 8. Recommended next pushes (in order)

1. Wrap `TimeWidget` and `QuantumRandomWidget` in `WidgetErrorBoundary`.
2. Lazy-load the five heavy or gated widgets; re-measure bundle with `-metafile`.
3. Add a shared `sitrep()` helper (time, weather, users online, widget name) used when an interactive widget posts to Log.
4. Gate `QuantumRandom` and `MicroCalculator` polling on `document.hidden`.
5. Decide on the 15-month table; then implement.
6. Decide on server-side usage ingest (consent, retention).
7. Run an in-browser lag pass (Playwright is available in the cloud image) against a seeded dev server.

## 9. Changes in this push

- `src/client/utils/widgetUsage.ts` (new)
- `src/client/components/ui/WidgetErrorBoundary.tsx` (usage events)
- `src/client/stores/recipeWidget.ts` (idempotent timer)
