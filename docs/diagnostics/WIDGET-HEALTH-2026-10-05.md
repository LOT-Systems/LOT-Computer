# LOT® WIDGET HEALTH REPORT — 2026-10-05

CLASS: INTERNAL // S-2 EYES · RUN: scheduled routine · BRANCH: `claude/charming-albattani-c8itks`
SCOPE: widget wiring, UI, lag, data logging across the System tab. Static audit plus typecheck and production build. **No live browser or lag run was possible** (no running app or DB in the routine sandbox), so lag items are static findings.

## 0. BLUF

| | |
|---|---|
| Fixed this push | 6 defects (below) |
| `tsc --noEmit` errors | 111 → 103 (pre-existing debt, none introduced) |
| Client prod build | PASS (`app.js` 730 KB / 185 KB gz, plus a shared 1.17 MB chunk, 192 KB gz) |
| Open, needs S-2 decision | 7 items (§6) |

## 1. Fixed in this push

| # | Widget | Defect | Fix |
|---|---|---|---|
| 1 | **Intentions** (System.tsx) | Visibility was decided in render and `intentions-last-shown` was stamped in that same render. The next System re-render saw the cooldown and unmounted the widget (unless the user had already saved an intention). | Cooldown roll decided once per mount; widget stays shown once shown; stamp deferred out of render. |
| 2 | **Subscribe** (System.tsx) | `Math.random() < 0.2` ran on every render, so the widget flickered in and out. | Rolled once per mount. |
| 3 | **Monthly Pulse** (month-by-month reveal) | Reads `user.joinedAt`, but `/api/me` never returned it, so `monthNumber` was always 0 and the pulse could never fire for anyone. | `joinedAt` added to `useProfileView()` and the `UserProfile` type. |
| 4 | **Dashboard / UserMetrics** | `classifyPhysiologicalCohort()` was called with 0 args (it needs 3) and read non-existent `.label` / `.dominant`. Throws on mount, which falls back the whole Dashboard boundary (UserMetrics, Correlated Indexes, System Progress, System Pulse). | Correct args; uses `.archetype` / `.dominantModule`. |
| 5 | **Quantum Engine / Index view** | CARE row read `dimensions.selfcare`; the key is `selfCare`, so the row was always blank. | Key corrected. |
| 6 | **Quantum Engine + System Progress** | Both fetched `/api/user-profile` independently on mount. The endpoint runs trait extraction on every call and logs the user's email. | Shared in-flight and 60 s cached fetch (`utils/userProfileCache.ts`). |

Also fixed: `weather.humidity` null-safety in System.tsx (typecheck).

## 2. Wiring map

**System tab → widgets.** `System.tsx` mounts about 45 widgets in `WidgetErrorBoundary` stacks (Check-in, Self-care, Intentions, Subscribe, Community, Planning, Cosmic, Quantum Sign, Investor, Quantum Engine Connect, Biofield Engine, Dashboard, Architect, Stats, Calendar, Benchmark).
- Error isolation is good: a crash is contained per stack, and mount timings are exposed on `window.__LOT_WIDGET_PERF__`.
- Isolation is coarse, though: one bad widget blanks its whole stack (see fix 4). Per-widget boundaries inside the Dashboard, Biofield and Stats stacks are recommended.

**Widgets → LOT® AI / Memory / Story / QIE.**
- QIE (`stores/intentionEngine.ts`, 5000+ lines) is the hub. Widgets feed it through `recordSignal(source, signal, meta)`, and it persists to localStorage (debounced `schedulePersist`).
- Memory widget → `/api/memory*`; Story and Portrait come from server `memory/*` utils.
- Portrait/profile cohort is server-derived at `/api/user-profile` (Usership-gated). The client QIE classification is the fallback.

**Context sync → Log (military comms).**
- Log triggers (`utils/logTriggers.ts`): `/qos`, `/assembly`, `/phys`, `/sil`, `/qi`, `/silent`, `/freeze`, 🕯️ prayer, 🌙 night, etc.
- `Logs.tsx` has military handlers (REC, BADGE, COHORT, VITALS, SYNC, SIG-RPT).
- Server writes `os_vitals_snapshot` (daily 02:00 UTC) and `os_signal_report`.
- **Gap:** weather, time and users-online are displayed but are not posted to the Log as a sync event for interactive widgets. See §6-A.

## 3. Lag / loading

| Item | Finding |
|---|---|
| Polling | 25 `setInterval` sites, every one has a matching `clearInterval`. 12 files guard on `document.hidden` (Time, SystemPulse, SystemProgress, Chakra, ContextualPrompts, sse, sun…). |
| Lazy mount | Only `QuantumEngineWidgets` is behind `LazyMount` (IntersectionObserver). **~44 other widgets mount eagerly.** Candidates: Stats stack, Investor stack, Biofield stack, Calendar, Benchmark. Estimated large first-render win; changing it affects subscription timing, so it was not done blind. |
| Bundle | `app.js` 730 KB (185 KB gz); `about.js` 441 KB; shared chunk 1.17 MB. `badges.ts` is 8,149 lines, imported by app, Logs, Memory and PublicProfile; code-split candidate. |
| Render cost | `System.tsx` is 1,071 lines with many `useStore` subscriptions (weather, users, sound, radio…). Any store tick re-renders the entire tab. |
| Sound/button lag | Sound toggle is debounced 300 ms (`isSoundToggling`). Signal persist is already deferred off the interaction tick. No synchronous heavy work found in click paths. **Needs a real-device INP run**; `utils/perf.ts` already logs interactions over 200 ms. |
| Network | Duplicate `/api/user-profile` removed (fix 6). `UserMetricsWidget` still fetches `/api/cohorts` and `/api/me` directly (candidate for the react-query hooks). |

## 4. 15-month UI build-up

There is **no explicit month-indexed reveal**. Progression is score-based: `interfaceEvolution.ts` (`featureUnlockLevel` 0–5, `layoutDensity`, 4 chapters), driven by achievements, level and streak. Time-since-join only appears in `MonthlyPulseWidget`, which was dead until fix 3. Recommendation: define a month 1–15 reveal table (widget → first month visible), gate it on `joinedAt` months, and take the max of the time floor and the score. See §6-B.

## 5. Data log of widget usage

- Widget interactions are recorded **client-side only** (QIE `recordSignal`, localStorage, 7-day retention, 1000-signal cap).
- There is no server-side per-widget usage log. `os-api.ts` has "widget usage variety" heuristics, but they infer from generic logs.
- Recommendation: batch `widget_interaction` events (widget id, action, ms-to-interactive, tab-visible) into the existing `/api/logs` pipeline, which also gives the lag-test data stream. See §6-C.

## 6. Open items for S-2 (not changed)

- **A. Context-sync post.** Add a "SITREP"-style Log entry (time, weather, users online, active widget) when an interactive widget is used. Format and cadence need a decision.
- **B. 15-month reveal table.** Needs the product schedule.
- **C. Widget usage log.** Add server table or log event type (schema/privacy decision; monk/transparent-lifestyle principle suggests user-visible and exportable).
- **D. Eager mounting** of about 44 widgets. Extend `LazyMount` to the Stats, Investor, Biofield, Calendar and Benchmark stacks.
- **E. Duplicate object keys in `utils/badges.ts`:** `elixir_found` (lines 4825, 6883) and `quarter_drop` (3214, 5501). The later definition silently wins; one of each pair is dead content.
- **F. PII in server logs:** `console.log` with `user.email` in `/user-profile` (api.ts), `memory.ts:151`, `memory.ts:1781`. Recommend user id instead.
- **G. Typecheck debt:** 103 remaining errors (badges.ts 36, intentionEngine.ts 11, app.tsx 9, AdminUser 8, 7 in server). The production build still succeeds because esbuild does not typecheck.

## 7. Verification

- `tsc --noEmit`: 111 → 103 errors, no new errors in touched files.
- `npm run client:js:build`: succeeds (2 duplicate-key warnings, §6-E).
- Not run: lag test in a browser, DB-backed endpoints, unit tests (none exist for widgets).
