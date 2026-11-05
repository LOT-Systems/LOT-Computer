# LOT® Widget Health Scan — 2026-11-05

Scheduled routine · branch `claude/charming-albattani-82jw3p` · method: **static analysis only**
(`node_modules` absent in the sandbox, so no build, typecheck, browser or runtime lag test was run — see Limits).

## 1. Inventory
- 40 `*Widget*.tsx` files (12.4k lines) + 6 sibling widgets (EmotionalCheckIn, SelfCareMoments, EnergyCapacitor, MoodAnalytics, FlashDriveManifest, FourDimensionalUI) + 6 `stats/*` blocks, all mounted from `components/System.tsx`.
- Every widget in System.tsx sits inside `WidgetErrorBoundary` (crash isolation + mount timing exposed at `window.__LOT_WIDGET_PERF__`, warns >50 ms). **Healthy.**
- Largest: SystemProgressWidget 2513 lines (changelog data inline, 33 fetch/api refs), MicroGameWidget 988, PatternRecognitionWidget 561.

## 2. Wiring
| Surface | Status | Evidence |
|---|---|---|
| LOT® AI (check-in, AIFeedback, Contextual prompts, Interventions) | Wired | `/api/contextual-prompts`, `/api/interventions`, `/api/stats/ai-usage`; `/how`, `/scan` log triggers |
| System tab | Wired | 40+ widgets in System.tsx; density/evolution stores gate reveal |
| Portrait (profile) | Partial | `useProfile`/`/api/user-profile` feed System; "portrait" is only copy text in Settings, no dedicated Portrait component found — **gap to confirm** |
| Quantum Intent Engine | Wired | `intentionEngine` store (4.7k lines), `recordSignal` called from 31 sites, `/api/qi`, `/qi` `/qos-report` triggers |
| Memory / Story | Wired | `MemoryWidget` → `/api/memory`, `/api/memory/answer`, `/api/memory/story`; `/api/story`; `/story` trigger |
| Log posting of widget context | Partial | Log triggers exist (`logTriggers.ts`); no widget→Log "sitrep" poster (weather/time/users online) |

## 3. Findings
- **F1 (usage log gap, medium):** 20 of 40 widgets never call `recordSignal`: AIFeedback, AngelInvestor, Architect, Benchmark, Calendar, CorporatePlan, CorrelatedIndexes, CosmicUpdate, DemoDay, Evolution, Integrity, InterfaceEvolution, MonthlyPulse, QuantumSign, QuantumState, SignalStream, Subscribe, SystemPulse, Time, UserMetrics. No server-side widget-usage table exists (only `/api/stats/ai-usage`). A platform-wide widget usage log is **not yet possible**.
- **F2 (perf, fixed):** Stats stack (6 widgets, 6 `/api/stats/*` fetches), Calendar and Benchmark mounted eagerly at the page bottom. Now wrapped in `LazyMount` (deferred until within 200 px of viewport).
- **F3 (idle CPU, fixed):** `QuantumRandomWidget` ran two 1 s timers + a 10 s timer re-rendering even when tab hidden. Added `document.hidden` guard.
- **F4 (remaining perf):** No `React.lazy`/dynamic import anywhere — all 40 widgets ship in the `app` entry chunk (esbuild `splitting` is on but unused). Biofield (5 widgets), Dashboard (4), Investor (4), Planning (5) still mount eagerly. SystemProgressWidget starts assembly/QOS monitors on mount, so lazy-mounting it needs dependency review first.
- **F5 (timers):** TimeWidget 1 s interval and MicroCalculator 10 s check run with no hidden/route guard (cheap, but could use `isRouteActive('system')`). Other pollers (SystemPulse 10 s, Contextual 15 s, Chakra 2 m, SystemProgress 60 s) already guard on `document.hidden` + route. **Healthy.**
- **F6 (caching):** React-Query `staleTime` 2–60 min on most queries; 7 queries poll every 2 min with `refetchIntervalInBackground:false`. **Healthy.**

## 4. Lag test (button / sound / control / load)
Not executable here. Existing instrumentation to read in production: `initPerfObserver` (INP >200 ms, LoAF >50 ms, `utils/perf.ts`) and `__LOT_WIDGET_PERF__`. Sound paths: `sound.ts`, `sovietChime.ts` (1 s hour check), `sovietKeyboard.ts`, `sovietGameSounds.ts` (MicroGame: 50 audio refs) — highest audio-lag risk is MicroGame.

## 5. 15-month UI reveal
`$layoutDensity` + `InterfaceEvolutionWidget` + `intentionEngine` drive progressive reveal; per-widget month gating was not audited line by line — **next-run item**.

## 6. Monk-lifestyle / military self-care sync (proposal)
Add a `/sitrep` log trigger that posts one terse line (time · weather · users online · AI state) to the Log, built from existing stores (`weather`, `usersOnline`, `Clock`). Not implemented this run (needs product wording sign-off).

## 7. Changes in this push
- `components/System.tsx`: `LazyMount` on Stats, Calendar, Benchmark.
- `components/QuantumRandomWidget.tsx`: hidden-tab timer guard.
Unverified by build/typecheck (no deps installed); changes are 1:1 uses of the existing `LazyMount` helper and a boolean early-return.

## 8. Next run
1. `yarn install && yarn build`, record bundle size; `npm run test:cold-start`.
2. Add `trackWidget(name)` (client) + `/api/widget-usage` (server) → resolves F1.
3. Dynamic-import Investor/Planning/Biofield stacks.
4. Playwright lag pass on System tab (click latency, sound start).
5. Confirm Portrait component location.
