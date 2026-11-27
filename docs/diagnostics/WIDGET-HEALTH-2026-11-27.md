# LOT® Widget Health Scan — 2026-11-27

**Run:** scheduled routine · branch `claude/charming-albattani-118wsp` · base `9f2b88c` (master)
**Scope:** widget wiring, data storing, QIE / Memory / Story / AI / Log / Portrait wiring, 15-month reveal, load speed, lag, usage log
**Status:** GREEN BUILD · 7 lag fixes + 1 bundle split shipped · type-error count unchanged (104 → 104, pre-existing)

---

## 0. SITREP

| Item | Before | After | Delta |
|---|---|---|---|
| `app.js` (minified, raw) | 729,837 B | 539,894 B | **−26%** |
| `app.js` (gzip -9) | 183,835 B | 134,026 B | **−27% (−49.8 KB)** |
| SystemProgressWidget | in main bundle | own chunk (181 KB raw / 47 KB gz), loads when scrolled near | deferred |
| Breathe re-renders of System tree | 10/s | only when display text changes (~1/s) | ~−90% |
| `tsc --noEmit` errors | 104 | 104 | 0 new |
| esbuild client build | green | green | — |

Platform-wide widget usage data (production DB) was **not reachable** from this environment, so the "usage log" section below is a static inventory of every event and signal widgets emit, not live counts. See §6.

---

## 1. Fixes shipped this run

| # | File | Problem | Fix |
|---|---|---|---|
| F1 | `components/System.tsx`, `components/SystemProgressWidget.tsx`, new `components/usershipTransmission.ts`, `components/ArchitectWidget.tsx` | SystemProgressWidget (2.5k lines of session-report history) was **13% of app.js** and blocked first paint of the System tab. ArchitectWidget imported `USERSHIP_TRANSMISSION` from it, which pinned it into the main bundle. | Moved `USERSHIP_TRANSMISSION` to its own module (re-exported from SPW, so old imports still work). SPW is now `React.lazy` + `Suspense` inside `LazyMount`. **Assembly runs: edit `usershipTransmission.ts` from now on.** |
| F2 | `utils/breathe.ts` | A fresh state object every 100 ms re-rendered the ~50-widget System tree 10×/s while Breathe was on, and kept running in hidden tabs. | Functional `setState` bails out when phase/count/display are unchanged; tick is skipped while `document.hidden`. |
| F3 | `components/System.tsx` | Subscribe widget rolled `Math.random() < 0.2` **during render**, so it blinked in and out on every System re-render (weather, users online, logs refetch). | One roll per mount (`useState(() => Math.random() < 0.2)`). |
| F4 | `components/ChakraErgonomicsWidget.tsx`, `GoalJourneyWidget.tsx`, `InterventionsWidget.tsx` | `recordSignal()` wrote the `intentionEngine` atom **during render**, which re-renders every QIE subscriber mid-mount. | Deferred with `queueMicrotask`, still once per mount (ref-guarded). |
| F5 | `components/QuantumRandomWidget.tsx` | Side effects (`setNumber`, `recordSignal`) ran inside a `setState` updater, so StrictMode doubled QIE signals. Timers (3 of them) never paused off-tab. | Countdown moved to a ref, side effects run once per rollover, and ticks skip while hidden. |
| F6 | `components/MicroGameWidget.tsx` | The 150 ms canvas loop pauses off-viewport, but not in a hidden tab. | `document.hidden` guard added to the tick. |
| F7 | `components/MemoryWidget.tsx` | Answer buttons fade out but stay clickable until `onSuccess`, so a **double tap posted two Memory answers**. | Per-question ref guard in `onAnswer`. |

---

## 2. Lag test: open findings (not fixed this run)

Ranked by how much a user would notice. All paths are under `src/client/`.

| P | Location | Issue | Proposed fix |
|---|---|---|---|
| P1 | `System.tsx` Intentions IIFE (~L886–915) | Reads localStorage, rolls a random cooldown and **writes `intentions-last-shown` during render**. The next render then sees the cooldown and hides the widget, so it can unmount after one frame. | Decide once (`useState` or `useMemo`) and move the `setItem` calls to `useEffect`. Behaviour-sensitive, so it needs owner review. |
| P2 | `System.tsx` Self-care IIFE (~L851–886) | 2× `getItem`, `JSON.parse` and `setItem`/`removeItem` on every render. | Same pattern as P1. |
| P3 | `hooks/useLogContext.ts` | A heavy `useMemo([logs])` (streaks, dayjs parsing) runs separately in **15 widgets**, so every `createLog` triggers 15 full passes. | Cache in a module-level `WeakMap<Log[], Ctx>` keyed by the react-query array reference, keeping the hour-dependent fields outside the cache. |
| P4 | `QuantumEngineWidgets.tsx:179`, `SystemProgressWidget.tsx:~1577`, `UserMetricsWidget.tsx:42,55` | Raw `fetch()` of `/api/user-profile`, `/api/cohorts` and `/api/me`, even though cached hooks exist. `/api/user-profile` is requested 3× on load. | Use `useProfile()`, `useCohorts()` and `useStore(stores.me)`. |
| P5 | Planner, Calendar, Recipe, SelfCare `createLog` buttons | No `isLoading`/disabled guard, so double submits are possible (same class as F7). Only EmotionalCheckIn guards correctly. | `disabled={isLoading}` plus an early return. |
| P6 | `ui/Clock.tsx:26`, `MicroCalculatorWidget.tsx:71`, `stores/recipeWidget.ts:188`, `utils/selfCare.tsx:362`, `stores/intentionEngine.ts:5129` | Intervals that ignore `document.hidden`. | Add the off-tab guard (doctrine already used in SystemPulse, SystemProgress and ChakraErgonomics). |
| P7 | Sound: `utils/sound.ts:342`, `sovietChime.ts:35`, `sovietGameSounds.ts:17`, `sovietKeyboard.ts:33`, `stores/plannerWidget.ts` | **Five separate AudioContexts.** The first click in each module pays creation + `resume()` latency (tens of ms on mobile), and Safari caps concurrent contexts. No sound preloading. `createClickSymphony` (`sound.ts:278`) is dead code. | One shared `getAudioContext()`, warmed on the first `pointerdown`. |
| P8 | Below-the-fold stacks in `System.tsx` | Only QuantumEngineWidgets and (now) SystemProgress are lazy-mounted. Biofield, Dashboard, Architect, Stats, Calendar and Benchmark all mount eagerly. | Wrap them in `<LazyMount>`. Costs a small layout shift on scroll. |
| P9 | Server: `src/server/index.ts:140` | The gzip route is commented out ("TEMPORARILY DISABLED"), and the Caddyfile has no `encode`. Unless the hosting edge compresses, **540 KB of JS ships uncompressed**. | Verify `content-encoding` on production `/js/app.js`. If missing, add `encode zstd gzip` to Caddy or `@fastify/compress`. |

---

## 3. Data integrity findings

| Item | Detail |
|---|---|
| Duplicate badge key | `utils/badges.ts`: `elixir_found` is defined at L4825 **and** L6883. The second definition silently overwrites the first, so one badge is unreachable. |
| Duplicate badge key | `quarter_drop` is also duplicated (esbuild `duplicate-object-key` warning). |
| Badge type drift | 36 TS errors in `badges.ts`: categories `behavioral`, `mastery`, `calendar_easter_egg` and type `ocean_wave` are used but missing from the `BadgeType` / category unions. They work at runtime but have no type safety. |
| Pre-existing TS debt | 104 errors in total: badges 36, intentionEngine 11, entries/app 9, AdminUser 8, the rest ≤5 each. The esbuild build does not type-check, so this debt is invisible in CI. |

---

## 4. Wiring matrix (QIE / Memory / Story / AI / Log / Portrait)

> **Follow-up push:** the full per-widget wiring matrix and the 15-month reveal map are being finalized and will be appended to this report in the next commit.

Confirmed so far:

- **QIE signal bus** (`stores/intentionEngine.recordSignal`): written by **22 of 68** widget/stat components. The remaining 46 are pure DISPLAY widgets or don't feed QIE.
- **Log events** emitted by the platform: 50+ distinct `event:` types, led by `emotional_checkin` (9 call sites), `answer` (9), `note` (7), `intention` (6), `quantum_intent_signal` (4) and `badge_unlock` (4).
- **No generic `widget_interaction` event exists.** Widget usage is only recoverable indirectly, from domain events and QIE signals (see §6).

---

## 5. Doctrine notes: "military self-care" Log protocol and monk lifestyle

The Log already has a military interface (CARE / PLAN / INTENT / MOOD / BIO / MEM / CFG / SYS / LOG, per the SPW session records). Proposal, aligned with a monk-like, transparent practice:

1. **Every interactive widget posts a sitrep line.** Format: `[HHMM Z] CARE · SELF-CARE COMPLETE · 4°C CLEAR · 12 ONLINE`. That is the action plus the synced context (time, weather, users online), so the Log becomes one honest, append-only record of the day.
2. **Display widgets stay silent.** They read the record and never write to it; that keeps the Log pure.
3. **One event shape.** Add `widget_interaction { widget, action, ctx: { t, tempC, online } }` to `LogEvent`, posted through a single `useWidgetLog()` hook with dedupe. That would also close the usage-telemetry gap in §6.
4. **LOT AI as witness, not driver.** AI reads the Log and reflects it back (Story / Memory). It should never silently write to it, so the person can always see what they did versus what the system inferred.

---

## 6. Widget usage data log (static inventory)

Live counts need production DB access, which this run did not have. Source-level emitters:

| QIE category | `recordSignal` call sites |
|---|---|
| energy | 26 |
| intentions | 24 |
| selfcare | 15 |
| journal | 13 |
| qos | 12 |
| mood | 11 |
| planner | 7 |
| log | 7 |
| memory | 6 |
| cohort | 5 |
| calculator | 3 |
| recipe, goals, badges | 2 each |
| resilience, micro_game, astrology | 1 each |

**Recommendation:** add the `widget_interaction` event (§5.3) and a nightly admin aggregate, so the next scan can report real per-widget usage across the platform.

---

## 7. Verification

- `yarn client:js:build` (production) → `Client build completed`, no errors. The only warnings are the two duplicate badge keys from §3.
- `tsc --noEmit -p tsconfig.json` → 104 errors before, 104 after. Per-file diff is empty, so no new errors.
- CSP: `script-src 'self'` already covers the new lazy chunk, which is served from `/js/` by the same static handler.
- **Not run:** live browser lag test against a running app. That needs the DB and auth, which aren't available here. The numbers above come from build output and static analysis.

## 8. Next scan

1. P1/P2: get owner sign-off, then move the render-time localStorage logic in the System IIFEs into effects.
2. P3 `useLogContext` memo cache · P4 dedupe raw fetches · P5 button guards.
3. P7 shared AudioContext · P9 verify compression on production.
4. Fix the duplicate badge keys (`elixir_found`, `quarter_drop`).
