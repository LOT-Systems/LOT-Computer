# LOT-SR-20261027-WIDGET-HEALTH — Widget Health Scan

- **Date:** 2026-10-27
- **Class:** ENGINEERING / AUDIT (scheduled)
- **Branch:** `claude/charming-albattani-v7q6l7`
- **Method:** Static scan of `src/client` and `src/server`. `node_modules` is absent in this environment, so there was no full build, no browser run, and no real timing measurements. Only a syntax check of the edited file was run (0 errors). Items marked **[RUNTIME]** need a live test.

## 1. Inventory

| Metric | Value |
|---|---|
| Component files | 64 |
| `*Widget*.tsx` files | 39 (about 12.4k lines) |
| Largest widgets | SystemProgressWidget 2513 lines, MicroGameWidget 988, QuantumEngineWidgets 651, PatternRecognitionWidget 561 |
| Code splitting (`React.lazy`) | **0 uses**. All widgets are imported eagerly in `System.tsx`. |
| Error isolation | `WidgetErrorBoundary` wraps every stack in `System.tsx`. It also records mount time in `window.__LOT_WIDGET_PERF__`. |
| Viewport gating | `LazyMount` (System.tsx:89) was used only on QuantumEngineWidgets. `useActiveViewport` gates the MicroGame loop. |

## 2. Widget wiring and data storing

- **Data containers (fetch or store):** UserMetrics (`/api/cohorts`, `/api/me`), SystemPulse (`/api/system/pulse`, polled), Memory (3 network calls), Calendar, QuantumEngineWidgets (store subscriptions plus 1 call), SystemProgress (large static changelog, with a few fetches).
- **Store-driven (local state):** Recipe, Planner and Intentions use `stores/*` and `localStorage` cooldowns. Intentions are surfaced by `intentionEngine.getOptimalWidget()`.
- **Pure display:** About-style widgets such as Angel, CorporatePlan, DemoDay, Benchmark, Architect and Evolution.
- **Sync context (weather, time, users online):** `System.tsx` shows Users online, Total users, `TimeWidget` and weather directly from stores. These are not currently written to the Log as a single "status line".
- **AI, System tab and Portrait wiring:**
  - The System tab (`System.tsx`) is the host for all widgets.
  - Log slash-triggers (`utils/logTriggers.ts`: `/how`, `/scan`, `/qos`, `/story`, `/system`, `/freeze` and others) are the bridge into LOT AI.
  - `/how` navigates to the System tab.
  - `freeze-widgets` (🧊) is the existing "monk pause" primitive.

### Gaps

1. **Widget usage is barely logged.** The only widget-originated Log events found in the client are `plan_set`, `self_care_complete`, `self_care_skip`, `calendar_entry`, `health_check` and `report_generated`. Memory, Quantum, Recipe, Game and Calculator interactions are not recorded in Log. The server's `/admin-api/widget-diagnostic` covers only 3 community widgets and only visibility counts, not usage.
2. **No unified widget event.** A single `widget_use` Log event with `{widget, action, ms}` would give the platform-wide usage log requested.
3. **The military-style status line does not exist.** Time, weather and users online are never posted together to the Log. Proposed format:
   `0900Z | WX CLEAR 18C | ONLINE 42 | MOOD 3 | STATUS NOMINAL`
   Wire it to a slash-command such as `/sitrep`. The trigger registry in `logTriggers.ts` makes this a small addition.
4. **Monk-lifestyle and LOT AI transparency.** The `prayer-mode`, `silent-mode`, `night-mode` and `freeze-widgets` triggers already exist. Widgets do not consistently respect them. **[RUNTIME]** Verify that `freeze-widgets` pauses every poller (SystemPulse, ContextualPrompts, ChakraErgonomics, QuantumRandom).

## 3. Quantum Intent Engine, Memory and Story wiring

- `QuantumEngineWidgets` is already viewport-gated, so its intentionEngine and selfAssembly subscriptions start late.
- `MemoryWidget` has 13 `setTimeout` calls and 1 `clearTimeout`. It drives a multi-step typed animation, and most timers are not cancelled on unmount. In React 18 a late `setState` is a harmless no-op, but the timers do hold closures, and rapid remount can replay animation steps. Severity: low.
- `/story` is a log trigger (story-mode), but no Story widget reads the QIE state directly. Story is log-driven only.

## 4. 15-month UI reveal

- `utils/interfaceEvolution.ts` implements 5 layout-density levels (breathable, comfortable, compact, dense, instrument). They are driven by `visualRefinement`, badge tier and level, not by calendar month.
- `MonthlyPulseWidget` handles months 1–12 and caps its copy at 12. Months 13–15 fall back to the generic `Month N. The journey continues.` and the label is capped at "Month 12:".
- **Gap:** there is no explicit month-to-widget reveal table. Months 13–15 have no dedicated copy and the label is wrong. A table like `{month → widgets unlocked}` would make the 15-month plan testable.

## 5. Loading speed

| Finding | Severity | Status |
|---|---|---|
| All 39 widgets are in one eager bundle, and none are lazy. | High | Open. A dynamic import for SystemProgressWidget (2.5k lines, mostly static changelog) is the biggest single win. **[RUNTIME]** Measure with `yarn client:js:build:metafile`. |
| The Biofield and Dashboard stacks were mounted on first paint. They run fetches and a polling interval (SystemPulse) even when far below the fold. | Medium | **FIXED.** Both are now wrapped in `LazyMount` (200px pre-mount margin, mounts once). |
| Other below-fold stacks (Stats, Investor, Community) still mount eagerly. | Low | Open. They are candidates for the same `LazyMount` wrapper. |
| `TimeWidget` polls every 1 s (`checkHour`). | Low | Open. Consider aligning it to minute boundaries. |
| `MicroCalculator` re-creates its 10 s interval whenever `magicTime` or `fading` change. | Low | Open. |

## 6. Lag test (static findings)

- `utils/perf.ts` already observes INP (>200 ms is warned) and long animation frames (>50 ms). `WidgetErrorBoundary` warns when a mount takes over 50 ms. These are the right hooks, but nothing aggregates them to the server.
- Timers without cleanup: MonthlyPulse (3), Planner (3), Recipe (4), Memory (12). All are fade or dismiss timers. Risk is low, but the cleanup should be added.
- Sound: a single `AudioContext` is created lazily and resumed on interaction (`sound.ts`). That is correct for the autoplay policy. **[RUNTIME]** Measure first-tap-to-sound latency.
- Interval cleanup: every `setInterval` has a matching `clearInterval`, except SystemProgress (3 set, 2 cleared). Check line 1557 region.
- **[RUNTIME]** Not possible here: button latency, sound latency, control responsiveness and load times. Open `window.__LOT_WIDGET_PERF__` in a live session for mount timings.

## 7. Change in this push

`src/client/components/System.tsx`: wrapped the **Biofield Engine** stack (5 widgets) and the **Dashboard** stack (UserMetrics, CorrelatedIndexes, SystemProgress, SystemPulse) in the existing `LazyMount`. Effects: network calls and polling start only when the stack nears the viewport, and the initial render and mount work drops. Syntax check: 0 errors. No behavioral change once the stack is visible.

**Side effect to verify [RUNTIME]:** a `LazyMount` wrapper is a 0-height div until mounted, so it adds one flex gap before mount. The same wrapper already exists around QuantumEngineWidgets, so the effect is visually consistent.

## 8. Recommended next steps

1. Add a `widget_use` Log event through a shared `useWidgetLog(name)` hook, and call it from the interactive widgets (Memory, Recipe, Game, Calculator, Quantum).
2. Add a `/sitrep` slash trigger that posts the combined time, weather, online-users and mood line.
3. Make `freeze-widgets` pause all pollers.
4. Add a `MONTH_REVEAL` table for months 1–15 and fix the Month 13–15 copy and label.
5. Lazy-load SystemProgressWidget and wrap Stats and Investor in `LazyMount`.
6. Add timer cleanup to Memory, Planner, Recipe and MonthlyPulse.
7. Run the build and `test:cold-start`, then capture real INP, mount and sound-latency numbers.
