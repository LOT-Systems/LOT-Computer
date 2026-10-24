# LOT® Widget Health Scan — 2026-10-24

Scheduled routine · branch `claude/charming-albattani-6a0xoi`

## Method and limits
Static audit of `src/client` plus a production client build and a `tsc` comparison before and after the changes. **Not performed:** live lag tests (button latency, sound latency, control response, real load timings). They need a running server, database and browser session, and this container has none. The lag section lists what to measure instead.

## Verdict
| Area | Status |
|---|---|
| Widget wiring on the System tab | 44 widget mounts, all in `WidgetErrorBoundary` except `TimeWidget` (core, intentionally bare). `QuantumRandomWidget` was unwrapped and is now wrapped. |
| Client build | Pass. `app.js` is 730 KB, the whole `js` dir 1.9 MB, with code splitting. |
| `tsc --noEmit` | 104 errors before and after. All pre-existing, mostly Admin* and others. No new errors from this run. |
| Duplicate badge keys | 2 found in `utils/badges.ts` (see Findings). |
| Background work | 3 intervals ran with no tab-visibility gate. Fixed. |

## Wiring map
- **Data containers vs displays.** Widgets fall into two groups. Containers write to `intentionEngine` through `recordSignal` (28 client files; 7-day retention, capped, persisted debounced, analysis deferred off the interaction tick). Displays only read stores. Examples of displays: SystemPulse, SystemProgress, Benchmark, Architect.
- **LOT® AI, System tab and Portrait.** Widgets feed signals into `intentionEngine`, which drives `getOptimalWidget`, the cohort and archetype classifiers, and the server sync (`syncToServer`). The System tab renders the widgets. I did not trace the Portrait page end to end this run. Open item.
- **QIE, Memory, Story.** `QuantumEngineWidgets` is lazy-mounted via `LazyMount`, so its subscriptions start on first viewport entry. `MemoryWidget` is mounted twice in `System.tsx` (lines 521 and 965), probably as two layout variants. Check that only one is live at a time. Story is surfaced through memory story data (`AdminUser`, `MemoryText`). There is no standalone Story widget.
- **Military-style self-care log.** `SelfCareMoments` already posts `self_care_complete` and `self_care_skip` to the Log with weather context. Time, weather and users-online are **not** attached to the posted log text. Candidate for a synchronized context line, for example `0600Z · clear · 12 online · self-care completed: breathwork`.
- **Monk-lifestyle and LOT® AI.** The signals plus the self-care and check-in loop already provide a transparent daily record. Nothing is missing structurally. The gap is the context line above.
- **15-month reveal.** `stores/evolution.ts` and `utils/interfaceEvolution.ts` implement a phase-based evolution with layout density, feature unlocks and milestones. There is no explicit month-1 to month-15 schedule table. Recommend a single `REVEAL_SCHEDULE` map from month to unlocked widgets, so the reveal can be audited. Open item.

## Changes in this push
1. `ui/WidgetErrorBoundary.tsx`: new persistent **widget usage log**, kept in localStorage under `lot-widget-usage`. It records per-widget mounts, crashes, slowest mount in ms and last seen. Writes are coalesced (one write per second). Read it via `getWidgetUsage()` or `window.__LOT_WIDGET_USAGE__`. This is the client half of the platform-wide usage log.
2. `System.tsx`: `QuantumRandomWidget` wrapped in `WidgetErrorBoundary`.
3. `QuantumRandomWidget.tsx`: the two 1 s countdown timers and the 10 s toggle now pause while the tab is hidden. This also stops background `quantum_random` signals being logged.
4. `MicroCalculatorWidget.tsx`: the 10 s magic-time poll is skipped while the tab is hidden. The fade-out reset timer is now held in a ref and cleared on unmount. An effect-scoped cleanup would have cancelled the timer when `setFading` re-ran the effect.

## Findings (not changed)
- **Duplicate badge keys.** `quarter_drop` is defined at `badges.ts:3214` and `:5501`, and `elixir_found` at `:4825` and `:6883`. The later definition silently wins, so the earlier badges are dead and the badge count is inflated by 2. The earlier badges need renaming or removing, which is a product decision.
- `TimeWidget` runs a 1 s interval for the hourly chime check. The chime window is the first minute of the hour, so a 5 to 10 s poll would be enough. Low gain.
- `System.tsx` is 1073 lines and imports about 45 widgets statically. Only `QuantumEngineWidgets` is lazy. Candidates for `LazyMount` or `React.lazy`, ordered by size: SystemProgressWidget (2.5k lines), MicroGameWidget, PatternRecognitionWidget, SelfCareMoments, and the investor widgets (Angel, CorporatePlan, DemoDay), which are rarely used.
- `intentionEngine.ts` is 6.5k lines inside the main `app.js` chunk. Splitting analysis from recording could cut initial parse cost.
- No server-side widget usage log exists. Next step: a batched `POST` of `getWidgetUsage()` deltas.

## Lag-test checklist (to run live)
1. Button response: time from click to paint on Calculator, Game, SelfCare done and skip. The target is under 100 ms.
2. Sounds: first-play latency, since AudioContext resume after a user gesture adds delay. Also the Soviet chime at the top of the hour.
3. Loading: `window.__LOT_WIDGET_PERF__` already reports mount ms, and the new `__LOT_WIDGET_USAGE__` reports the slowest mount. Anything over 50 ms is already console-warned.
4. Controls: scroll with all widgets mounted, with the tab hidden for 5 minutes, then restore.

## Next scheduled-run priorities
1. Trace the Portrait wiring.
2. Add the synchronized context line to the self-care log.
3. Add the `REVEAL_SCHEDULE` map.
4. Lazy-load heavy widgets, then compare `app.js` size.
