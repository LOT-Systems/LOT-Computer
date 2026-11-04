# Widget Health Scan — 2026-11-04

Scheduled routine scan of all LOT® System-tab widgets: wiring, UI, lag, usage log.
S-2: VADIK MARMELADOV · Branch `claude/charming-albattani-yogfbi` · Base `98971f2`

## Method and limits (honest)

- STATIC scan of `src/client/components/*Widget*.tsx`, `System.tsx`, stores and `src/server/routes/api.ts`, plus two production builds and a bundle-size read.
- NOT done: runtime lag measurement in a browser. The app needs auth and a database that this sandbox does not have, so button / sound / control latency was reviewed in code only. Numbers below are bundle sizes and counts, not milliseconds.
- Wiring tags (kind, surfaces, reveal month) in `widgetRegistry.ts` are PROVISIONAL, assigned from names and `docs/technical/WIDGETS.md`.

## Inventory

39 widget components are mounted in `System.tsx` (38 files + `QuantumEngineWidgets`), 39 entries in the new registry, 0 orphans.
Largest: SystemProgressWidget 2513 LOC (mostly embedded changelog text), MicroGameWidget 988, QuantumEngineWidgets 651, PatternRecognitionWidget 561, IntegrityWidget 476.

## Findings

| # | Sev | Finding | Status |
|---|-----|---------|--------|
| 1 | MED | `TimeWidget` (x2) and `QuantumRandomWidget` mounted without `WidgetErrorBoundary`; a crash there takes down the whole System tab | FIXED |
| 2 | MED | No data log of widget usage anywhere in the client (`widget_usage`, `trackWidget` etc. absent) | FIXED locally (`widgetUsage.ts`: mount / error / interact ring buffer, 300 events, localStorage, `window.__LOT_WIDGET_USAGE__()`); server persistence NOT done |
| 3 | MED | All 39 widgets mounted eagerly on System tab; only `QuantumEngineWidgets` was `LazyMount`ed | FIXED partly: Dashboard, Architect, Stats, Calendar, Benchmark, Investor stacks now defer mount until near viewport |
| 4 | HIGH (product) | No month-by-month (15-month) reveal exists. Gating today is intentionEngine `getOptimalWidget` plus the evolution `featureUnlockLevel` (0-5), not account age | OPEN: registry holds a month 0-15 per widget and `isWidgetRevealed()`; NOT enforced. Needs S-2 decision |
| 5 | LOW | `MemoryWidget`, `MicroGameWidget`, `SubscribeWidget` are each mounted twice in `System.tsx` (different branches) | OPEN: confirm the branches are mutually exclusive |
| 6 | LOW | Fire-and-forget `setTimeout` without cleanup in RecipeWidget (4), PlannerWidget (3), MonthlyPulseWidget (3), MemoryWidget (13 vs 1 clear) | OPEN: harmless in React 18 but sloppy on fast unmount |
| 7 | LOW | `badges.ts` has a duplicate key `elixir_found` (lines 4825 and 6883); the later one silently wins | OPEN |
| 8 | INFO | Client `tsc --noEmit`: 104 errors (baseline, 36 in badges.ts); server 0 with the lockfile's fastify 5.6.1. Typecheck is not part of the build, so this debt is invisible to the gate | OPEN |
| 9 | INFO | `app.js` is 730 KB raw / 185 KB gzip. `badges.ts` (~7k lines) and the SystemProgressWidget changelog text are data, not logic | OPEN: lazy chunk candidates |
| 10 | INFO | Timer hygiene: every real `setInterval` has a matching `clearInterval` (checked by the new test). MicroGameWidget already pauses its loop off-screen | OK |

## Surfaces

- LOT AI: Memory, Intentions, ContextualPrompts, PatternInsights, Interventions, ChatCatalyst, AIFeedback, Integrity. Server: `/api/memory`, `/api/logs`.
- System tab: all 39 (the scan scope). Portrait / profile: Memory, Narrative, GoalJourney, Evolution, InterfaceEvolution, CohortConnect, QuantumSign, UserMetrics. Endpoint `/api/user-profile` is used by SystemProgressWidget and System.tsx.
- Quantum Intent Engine: QuantumState, PatternRecognition, SignalStream, Integrity, QuantumEngineWidgets, Intentions, Planner (`plan_set` signal), CosmicUpdate.
- Memory and Story: Memory, MonthlyPulse, Narrative, GoalJourney, Evolution, InterfaceEvolution, QuantumEngineWidgets.
- Endpoints referenced by widgets, all found in `api.ts`: `/memory`, `/logs`, `/user-profile`, `/me`, `/cohorts`, `/system/pulse`, `/system/deployment-status`, `/system/my-feedback`, `/system/submit-feedback`, `/system/feedback-analytics`.

## Synchronized context and the Log ("military self-care")

Today only the Log slash-triggers (`logTriggers.ts`: `/system`, `/qos`, `/phys`, `/story`, `/how` ...) bridge Log and System state. Proposal, NOT implemented: a `/sitrep` trigger that posts one fixed-format line to the Log, for example `SITREP 14:05 · clear 18C · 212 online · energy 62% · intent: ...`, built from the time, weather and users-online context that Time, Sky, Users-online and Capacitor already hold. Fixed format, no free text, one line, user-initiated: monk discipline over noise. LOT® AI would read the line like any other log.

## Recommended next steps (ranked)

1. S-2 decision on enforcing the 15-month reveal; if yes, wrap mounts in `isWidgetRevealed(id, monthsSince(me.createdAt))`.
2. Server-side widget usage ingestion (aggregate counts only, opt-in, no content), then an admin view.
3. Move the SystemProgressWidget changelog and `badges.ts` into lazily imported chunks.
4. Add `tsc --noEmit` baseline-ratchet to the gate so error count can only fall.
5. Browser lag harness (Playwright against a seeded dev instance): time-to-interactive, click-to-sound latency, scroll jank on System tab.

## Reproduce

`yarn test:widgets` — static wiring check (boundary coverage, registry parity, month range, timer hygiene). Negative control run: against the pre-fix `System.tsx` it reports RED (3).
