```
╔══════════════════════════════════════════════════════════════════════╗
║            LOT SYSTEMS — WIDGET HEALTH SCAN (SCHEDULED)              ║
╠══════════════════════════════════════════════════════════════════════╣
║  ID       : LOT-WIDGET-HEALTH-20261017-01                            ║
║  DATE     : 2026-10-17                                               ║
║  CLASS    : DIAGNOSTIC + FIX                                         ║
║  BRANCH   : claude/charming-albattani-tz2niz                         ║
║  S-2      : VADIK MARMELADOV                                         ║
╚══════════════════════════════════════════════════════════════════════╝
```

## SCOPE & METHOD

Static audit of `src/client` (45 widget components, `System.tsx` mount tree, `intentionEngine` store, `queries.ts`, sound utils), a `tsc --noEmit` pass, and an esbuild production build with a metafile bundle breakdown.

**Not done** (no browser, no running server in this environment): real-device lag measurement, live endpoint tests, audible sound checks. The "Lag test" section is therefore a code-level risk review, not a stopwatch run. `yarn test:cold-start` needs a live server and was not run.

---

## 1. EXECUTIVE SUMMARY

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| F1 | `analyzeIntentions()` throws `ReferenceError: dayMs` on every uncached run (QIE P147, added v112) | **CRITICAL** | **FIXED** |
| F2 | `UserMetricsWidget` called `classifyPhysiologicalCohort()` with 0 args → `TypeError` on render; also read non-existent `.label` / `.dominant` | **HIGH** | **FIXED** |
| F3 | `QuantumEngineWidgets` read `dimensions.selfcare` (real key `selfCare`) → CARE row showed blank | MEDIUM | **FIXED** |
| F4 | `MemoryWidget` reads `insight` from the answer response; type omitted it | LOW (types) | **FIXED** |
| F5 | Main `app.js` was 730 KB; `SystemProgressWidget` (177 KB) + `ArchitectWidget` shipped eagerly | PERF | **FIXED** (-27%) |
| F6 | `weather.humidity` null comparison in `System.tsx` | LOW | **FIXED** |
| F7 | Duplicate `elixir_found` key in `badges.ts` (lines 4825 and 6883); second silently wins | MEDIUM | OPEN |
| F8 | No server-side widget usage log; signals live in localStorage (max 1000) | GAP | OPEN |
| F9 | 15-month reveal is level-based (1–100), not calendar-month based | GAP | OPEN (proposal §6) |
| F10 | Five independent `AudioContext`s | RISK | OPEN |
| F11 | Interactive widgets that emit no signal | GAP | OPEN |
| F12 | `setTimeout`s without cleanup in several widgets | LOW | OPEN |
| F13 | `punctuationContext` "call-for-help" branch is dead code (type has no such intent) | LOW | OPEN |

Type-check: 104 → **97** errors (all remaining are pre-existing, mostly `badges.ts` category literals and Admin/Logs typings). Client build: passes.

---

## 2. FIXES IN THIS PUSH

### F1 — QIE pattern engine crash (CRITICAL)
`src/client/stores/intentionEngine.ts:3332` used `dayMs`, but `const dayMs` is declared later in the same function (line 3543). That is a temporal-dead-zone `ReferenceError`. It sits outside any `if`, so it runs on every non-cooldown `analyzeIntentions()` call, before the patterns are committed to the store. Introduced by commit `1846b80` (QIE v112, P146–P148).

**Impact:** `recognizedPatterns` could not update after v112. That starves `getOptimalWidget()`, Pattern Recognition, the Quantum Engine widgets, QOS snapshots, and the cohort classification that feeds LOT® AI suggestions. Two call sites wrap it in `try/catch` (`MemoryWidget`, `Logs`), which hides the error. This is why no UI crash was visible.

**Fix:** use the inline 24 h literal at that line.

### F2 — UserMetricsWidget (System tab → Dashboard stack)
`classifyPhysiologicalCohort(signals, userState, recognizedPatterns)` was called with no arguments. It now gets the live engine state, and the display fields are corrected to `archetype` and `dominantModule`. It was caught by `WidgetErrorBoundary("Dashboard")`, which meant the entire Dashboard stack (UserMetrics, CorrelatedIndexes, SystemProgress, SystemPulse) could be replaced by a fallback.

### F3 / F4 / F6
`selfcare` → `selfCare`; `insight?: string` added to the `useCreateMemory` response type; humidity null-guard.

### F5 — Loading speed
`SystemProgressWidget` is 177 KB of minified changelog data and sits at the bottom of the System tab. `ArchitectWidget` imported a constant from it, which forced it into the main bundle. Both are now `React.lazy` with `Suspense fallback={null}` in `System.tsx`. The `USERSHIP_TRANSMISSION` constant deliberately **stays in `SystemProgressWidget.tsx`**, because the assembly routine documented across ~70 reports edits it there.

| Bundle | Before | After |
|--------|--------|-------|
| `app.js` (minified) | 729,837 B | 531,943 B (**-198 KB, -27%**) |

Remaining heavy items in the eager bundle: `badges.ts` 207 KB, `intentionEngine.ts` 140 KB, `Logs.tsx` 120 KB, `easter-eggs.ts` 24 KB. Next candidates: lazy-load `Logs.tsx` by route; split `badges.ts` into definitions (lazy) and the unlock-check path.

---

## 3. WIDGET WIRING MATRIX

Legend: **SIG** = emits `recordSignal` to the QIE; **LOG** = writes to `/api/logs`; **BND** = wrapped in `WidgetErrorBoundary` in `System.tsx`; **INT** = interactive.

| Widget | INT | SIG | LOG | Note |
|--------|-----|-----|-----|------|
| Memory | ✔ | ✔ | via answer API | 13 `setTimeout` / 1 cleared |
| Planner | ✔ | ✔ | ✔ | |
| Recipe | ✔ | ✔ | ✔ | |
| Intentions | ✔ | ✔ | — | |
| SelfCareMoments | ✔ | ✔ | ✔ | |
| EmotionalCheckIn | ✔ | ✔ | — | |
| JournalReflection | ✔ | ✔ | — | |
| EnergyCapacitor | ✔ | ✔ | — | |
| Calendar | ✔ | ✔ | ✔ | |
| ContextualPrompts / ChatCatalyst / Interventions | ✔ | ✔ | partial | LOT® AI surface |
| Cohort / PatternInsights / PatternRecognition | ✔ | ✔ | — | |
| QuantumEngineWidgets (8 sig) | ✔ | ✔ | — | QIE display |
| MicroGame / MicroCalculator / MicroImage | ✔ | ✔ | — | Game: 35 sound calls |
| QuantumRandom | ✔ | ✔ | — | |
| **QuantumSign** | ✔ (5 click) | ✘ | — | interactive, no signal |
| **CosmicUpdate** | ✔ (3 click) | ✘ | — | astrology tier-0 is recorded elsewhere |
| **Architect** | ✔ | ✘ | — | paid-only telemetry |
| **MonthlyPulse** | ✔ | ✘ | — | |
| **Subscribe** | ✔ | ✘ | — | |
| Time | ✔ (toggle/chime) | ✘ | — | weather/time context not logged |
| SystemProgress | ✔ (feedback) | ✔ (29) | ✔ | |
| SystemPulse, UserMetrics, CorrelatedIndexes, QuantumState, SignalStream, Evolution, InterfaceEvolution, Integrity, Benchmark, AIFeedback | display | mixed | — | data displays |
| AngelInvestor / CorporatePlan / DemoDay | display | — | — | static |

Observations:
- Error isolation is good: the `System.tsx` stacks are wrapped by `WidgetErrorBoundary`. `TimeWidget` (line ~444) and `QuantumRandomWidget` (~616) are rendered unwrapped.
- Signals are throttled correctly: persistence is coalesced (250 ms) and analysis is deferred via `requestIdleCallback` (`intentionEngine.ts` ~165–260).
- Minor: once the signal array is capped at `MAX_SIGNALS = 1000`, `length % 5 === 0` stays true, so analysis is attempted on every signal (the 5-min cooldown still bounds it).

## 4. LOT® AI · SYSTEM TAB · PORTRAIT · QIE · MEMORY · STORY

- **QIE → System tab:** `getOptimalWidget()` and `classifyPhysiologicalCohort()` feed `System.tsx`, `SystemPulse`, `QuantumEngineWidgets`, and now `UserMetrics`. F1/F2 were silently breaking this chain; it is restored by this push.
- **Memory:** `MemoryWidget` → `/api/memory/answer` → badge unlock + signal. The `insight` field was untyped (fixed).
- **Story:** `NarrativeWidget` and `/story` log trigger exist; no wiring defects found.
- **Portrait / public profile:** `PublicProfile.tsx` carries 5 pre-existing type errors, and `app.tsx` reads `metadata` / `joinedAt` that are not on `UserProfile`. These are probable runtime `undefined` reads. Recommend a follow-up that aligns the `UserProfile` type with the server response.
- **Sync model (weather / time / users online → Log):** the `/qos`, `/phys`, `/sil`, `/story`, `/how` log triggers (`logTriggers.ts`) are the existing "military comms" channel. No widget currently posts a combined context line (weather · time · users online) to the Log. Proposed format (not implemented):

```
SITREP 0700Z · CLR 12°C · 7 ONLINE · QOS 74 · CARE 61 · ATP HIGH · STATUS NOMINAL
```

## 5. MONK / PURE-AND-TRANSPARENT MODE

Proposal only: LOT® AI would emit a daily terse check (ATP · sleep · fast · journal · silence), logged through the same SITREP line, with no gamified nags. Existing hooks that already support this: `silent-mode`, `prayer-mode`, `breathe`, `fasting.ts`, `selfCare.tsx`, `freeze-widgets`.

## 6. 15-MONTH UI REVEAL AUDIT

`interfaceEvolution.ts` and `evolution.ts` drive reveal by **level (1–100), a 0–5 feature-unlock level, and 5 density tiers** (breathable → instrument). There is **no calendar-month schedule**. Proposed M1–M15 mapping (not implemented):

| Month | Surface revealed |
|-------|------------------|
| M1 | Time, Memory, Log |
| M2 | Planner, Recipe |
| M3 | Intentions, Check-in, Self-care |
| M4 | Journal, Energy |
| M5 | Calendar, Mood analytics |
| M6 | Pattern Insights, Cohort |
| M7 | Quantum Random / Sign |
| M8 | QIE widgets (State, Signal Stream) |
| M9 | Goal Journey, Narrative |
| M10 | Evolution, Interface Evolution |
| M11 | Micro tools (Calc / Image / Game) |
| M12 | Cosmic Update, Chakra |
| M13 | Correlated Indexes, Integrity |
| M14 | System Progress, Benchmark |
| M15 | Full instrument density, Architect |

## 7. LAG / LOAD / SOUND RISK REVIEW

- **Loading:** `app.js` -27% (see F5). All 40+ widgets were statically imported in `System.tsx`; only the two heaviest are lazy now.
- **Network:** `useLogs` fetches `/api/logs` with **no LIMIT** (noted in `queries.ts:136`), and 16 components consume it. This is the main scaling risk as logs grow; recommend server pagination and a windowed client query.
- **Polling:** the 2-minute `refetchInterval`s set `refetchIntervalInBackground: false`. Good. `SystemProgressWidget` has 3 `setInterval` / 2 cleared; verify the third.
- **Timers:** `setTimeout` without cleanup: MemoryWidget (13/1), MonthlyPulse (3/0), Planner (3/0), Recipe (4/0), EmotionalCheckIn (4/0), SelfCareMoments (4/1), MicroCalculator (1/0). Low risk (unmount mid-animation), but can emit setState-after-unmount.
- **Sound:** five separate `AudioContext` constructions (`sound.ts`, `sovietGameSounds.ts`, `sovietKeyboard.ts`, `sovietChime.ts`, `plannerWidget.ts`). Browsers cap concurrent contexts (~6 in Chromium). Recommend one shared lazily-resumed context.
- **Rendering:** zero `backdrop-filter` or blend-mode usage, so no GPU hot spots. Only `MemoryWidget` uses `React.memo`.

## 8. WIDGET USAGE DATA LOG

No server table records widget usage. The QIE keeps the last 1000 signals / 7 days in localStorage and syncs batches via `syncToServer()` (every 10 signals, 5-min cooldown). Static map of signal producers is §3. Recommended next step: a `WidgetUsage` log event (`event: 'widget_use'`, `metadata.widget`, `metadata.action`) written through the existing `useCreateLog` path, so the Log is the single audit trail. Not implemented in this push because it changes the stored-data schema and needs owner sign-off.

## 9. OPEN ITEMS (ranked)

1. F7: pick the canonical `elixir_found` definition in `badges.ts` and delete the other. The later one currently wins; the earlier uses a different symbol and trigger words.
2. F10: shared `AudioContext`.
3. F8 / §8: widget usage log event.
4. `/api/logs` pagination.
5. F11: add signals to QuantumSign, CosmicUpdate, MonthlyPulse, Architect, Subscribe, TimeWidget.
6. Type-health: `badges.ts` category union, `UserProfile` shape, `AdminUser(s)`, `Logs.tsx`.
7. F13: dead `call-for-help` branch.
8. Timer cleanup (§7).

## 10. VERIFICATION

```
tsc --noEmit -p tsconfig.json : 104 → 97 errors (all pre-existing; none introduced)
tsc server project            : 0 errors
client production build       : PASS
app.js                        : 729,837 → 531,943 bytes
Runtime/browser tests         : NOT RUN (no browser or live server in this environment)
```

Files changed: `stores/intentionEngine.ts`, `components/UserMetricsWidget.tsx`, `components/QuantumEngineWidgets.tsx`, `components/System.tsx`, `queries.ts`, this report.
