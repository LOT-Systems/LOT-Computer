# LOT® WIDGET HEALTH SCAN — 2026-10-22 (scheduled run)

**Class:** DIAGNOSTIC + minor ENGINEERING · **Branch:** `claude/charming-albattani-luvoj0`
**Method:** static audit of `src/client` + `src/server/routes/api.ts`. **Not run:** `tsc`, esbuild build, browser/lag tests — `yarn install` failed with `ECONNRESET` against the npm registry in this sandbox, so no dependencies were available. Only the new file was type-checked, standalone.

## 1. Inventory

- 43 widget components (`*Widget*.tsx`) plus `EmotionalCheckIn`, `SelfCareMoments`, `MoodAnalytics`, `EnergyCapacitor`, `FourDimensionalUI`, `FlashDriveManifest` and the `stats/*` blocks.
- All are mounted from `System.tsx` (1071 lines). Each mount is wrapped in a `WidgetErrorBoundary` (55 boundary usages). **No orphaned widgets** (every widget file has ≥1 mount in System).
- Largest: `SystemProgressWidget` 2513 lines, `MicroGameWidget` 988, `QuantumEngineWidgets` 651, `PatternRecognitionWidget` 561.

## 2. Wiring

| Surface | State |
|---|---|
| **LOT® AI / Intention Engine** | `getOptimalWidget()` drives Self-Care and Intentions visibility; reason passed to widgets via `localStorage` keys (`selfcare-quantum-reason`, `intentions-quantum-reason`). Works, but see F2. |
| **System tab** | Single render root; subscriptions mostly narrowed (per Doctrine "Render Isolation"). |
| **Portrait (profile)** | Only MonthlyPulse mentions "portrait" (copy). No widget-side Portrait wiring found in client code; public profile is a separate entry (`public-profile.tsx`). **Gap.** |
| **QIE / Memory / Story** | `QuantumEngineWidgets` (LazyMount), `MemoryWidget` (fetch+store), `NarrativeWidget` (store) wired. Memory/Narrative are not lazily mounted. |
| **Context sync → Log** | Weather/time/users-online exist (`stores.weather`, `usersOnline` via SSE, `TimeWidget`) and feed the sound system, but **no widget posts a combined "context stamp" to the Log**. Only Calendar, Planner, Recipe, SelfCare, ContextualPrompts post log events. **Gap** (see §6). |
| **Log whitelist** | Client log events checked against `displayableEvents` (api.ts:1084): no write→read loss found. `health_check` / `report_generated` in intentionEngine.ts are internal types, not posted. |

## 3. Findings

- **F1 (fixed) — Subscribe widget flicker.** `Math.random() < 0.2` evaluated inside render in `System.tsx`; every System re-render re-rolled, so the widget could appear/disappear. Now a single roll per mount (`useRef`).
- **F2 (open) — side effects in render.** Intentions block (System.tsx ~L886–915) and Self-Care block (~L870) call `localStorage.setItem/removeItem` and `Math.random()` for cooldown during render. Violates the Doctrine rule against writes in render phase; cooldown can re-randomise per render and widgets can toggle. Recommend moving to a `useMemo`/`useEffect` pair seeded once.
- **F3 (open) — no code splitting of widgets.** 50 widgets are statically imported in System.tsx; `LazyMount` defers *mounting* of only `QuantumEngineWidgets`, but its code still ships in the main chunk. `SystemProgressWidget` (2.5k lines, mostly changelog strings), `MicroGameWidget`, `IntegrityWidget`, `PatternRecognitionWidget` are good `React.lazy` candidates (esbuild already has `splitting: true`).
- **F4 (open) — below-fold widgets all mount eagerly.** Biofield, Dashboard, Stats and Investor stacks mount and subscribe on first paint. Wrap in `LazyMount` (already exists).
- **F5 (info) — 15-month reveal is not calendar-based.** UI evolution (`interfaceEvolution.ts`, `evolution.ts`) is driven by level/achievements/streak. `MonthlyPulseWidget` has distinct copy for months 1–11, message index clamped at 12, no 13–15 entries. There is no month-by-month widget unlock table; recommended: add a `WIDGET_REVEAL_SCHEDULE` (month → widgets) consumed by `getFeatureUnlocks`.
- **F6 (gap) — no widget usage data existed.** Only in-memory mount timings (`__LOT_WIDGET_PERF__`) lost on reload. Addressed partially, see F7.
- **F7 (added) — local widget usage ledger.** `src/client/utils/widgetLedger.ts`: per-widget counts of mount / error / interact, max mount ms, last-seen; debounced write to `localStorage` (`lot-widget-ledger`), capped at 120 widgets, `window.__LOT_WIDGET_LEDGER__.snapshot()`. Hooked into `WidgetErrorBoundary` (mount + crash). Local only; no server upload yet. `interact` is not wired to any widget yet.
- **F8 (ok) — timers.** All widget `setInterval`s have matching `clearInterval`. (SystemProgressWidget grep hits for `setInterval` besides L1557 are changelog strings.)
- **F9 (ok) — error isolation.** A crash in one widget shows "Failed to load / Retry" instead of taking down the app.

## 4. Lag / sound / controls

Not measurable here (no browser run). Existing tooling: `utils/perf.ts` (INP >200 ms warn, LoAF), mount time >50 ms warn in `WidgetErrorBoundary`. Sound stack: `sound.ts` (hemi-sync, context aware), `sovietKeyboard.ts`, `sovietGameSounds.ts`, `sovietChime.ts`. **Next run should:** build, serve, and use Playwright (Chromium is preinstalled) to read `__LOT_WIDGET_PERF__`, `__LOT_PERF__`, and the new ledger.

## 5. Monk-lifestyle / LOT® AI

Direction is consistent with existing design: cooldown-gated widgets (Intentions 2–3 d, Subscribe 10 d, Self-Care 3 h) already ration attention. Recommendation: fix F2 so rationing is deterministic and auditable.

## 6. Proposed "military self-care" context stamp

On widget interaction, post a single `context_stamp` log (UTC time, weather, users online, active widget, mood if known) in a SITREP style. Requires adding `context_stamp` to `displayableEvents` (api.ts:1084). Not implemented — product decision for S-2.

## 7. Changes in this push

- `src/client/components/System.tsx` — Subscribe roll stabilised (F1)
- `src/client/utils/widgetLedger.ts` — new (F7)
- `src/client/components/ui/WidgetErrorBoundary.tsx` — records mount/error to ledger
- `docs/LOT-WIDGET-HEALTH-20261022-01.md` — this report

## 8. Verification status

- New file: standalone `tsc --noEmit` PASS.
- Full `tsc`, build, tests, lag test: **NOT RUN** (dependencies could not be installed). Treat the two edited files as unverified until CI/build.
