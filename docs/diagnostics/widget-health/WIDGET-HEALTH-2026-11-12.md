# LOT® Widget Health — Scan 001

```
ROUTINE   LOT® Widget Health (scheduled)
FIRED     2026-11-12 03:43 UTC
BASE      master @ 98971f2 (PR #96 merge)
BRANCH    claude/charming-albattani-5iv7df
SCOPE     51 widget containers · System tab · QIE · Memory/Story · Log · Portrait
STATUS    GREEN after fixes (build ✓ · tsc 104 → 96, 0 new · harness ✓)
```

---

## 0 · SITREP (top line)

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| 1 | **CRITICAL** | `analyzeIntentions()` references an undefined `dayMs` (P147, added in `1846b80c`, QIE v112). It throws a `ReferenceError` on every scan once a user has ≥1 signal. `System.tsx` calls `getOptimalWidget()` → `analyzeIntentions()` during render, so **for any paid (R&D/Usership) user with signals, the whole System tab crashes into the App error boundary.** It also means `recognizedPatterns` and `lastAnalysis` were never updated, so the 5-min cooldown never kicked in and every call ran the full 147-pattern scan. | **FIXED** |
| 2 | **HIGH** | `UserMetricsWidget` calls `classifyPhysiologicalCohort()` with no arguments (`signals.filter` on `undefined`), and reads `.label` / `.dominant`, which don't exist. It threw on every render, and because the **Dashboard** stack shares one error boundary it took down CQGS Health, Correlated Indexes, System Progress and System Pulse with it. | **FIXED** |
| 3 | **HIGH** | `usePunctuationContext` defaults `logs = []`, a fresh array on every render while `/api/logs` is loading. The store's empty branch always wrote a new object, so the two fed each other in an **infinite render loop (React #185)**. That crashed `MicroImageWidget` (which takes down the whole **Planning** stack: Planner · Memory · Calculator · Game · Image) and `CohortConnectWidget` (which takes down the **Community** stack). | **FIXED** |
| 4 | **HIGH** | Rules-of-Hooks violations: `SignalStreamWidget` (crashes when signals go from fewer than 3 to 3) and `QuantumStateWidget` (crashes on the first signal) returned early **before** `useMemo`. Each one crashed the whole **Biofield Engine** stack. Both came from the same perf commit `9364aba5`. | **FIXED** |
| 5 | **MED** | `/api/me` (`useProfileView`) never sent `joinedAt`, so `MonthlyPulseWidget` always computed month 0 and **never rendered**. This is the month-by-month reveal widget. | **FIXED** |
| 6 | **MED** | Gating side effects ran inside render in `System.tsx`. The Intentions gate stamped `intentions-last-shown` during render, so the next store tick unmounted the widget (it showed for a moment, then vanished). The Subscribe gate re-rolled `Math.random() < 0.2` on every render, so it flickered. | **FIXED** (snapshot per mount) |
| 7 | **MED** | Eight shared error boundaries each wrapped 3–6 widgets, so one crash blanked the whole stack. | **FIXED** (36 per-widget boundaries, outer ones kept as a net) |
| 8 | LOW | QIE dimension key typo `selfcare` vs `selfCare` meant the QIE Connect "CARE" row always rendered empty. | **FIXED** |
| 9 | MED | 16 of 51 widgets crash when an API returns `{}` or a partial payload (`.length` / `.toFixed` / `.toLocaleString` on undefined). They are now isolated per widget, but the null-guards are still missing. | **OPEN**, see §8 |
| 10 | MED | Load weight: widgets are 436 KB of the 1,215 KB main `app.js` (36%; 323 KB gzip in total). Everything is eager, so free-tier users download the whole pro stack. | **PARTIAL** (LazyMount added to Biofield Engine + Stats; code-split is open) |

**Net effect, measured in the full-System-tab harness (paid user, 6 signals, mocked API):**

| | Baseline `98971f2` | This branch |
|---|---|---|
| System tab | **APP CRASH** (`dayMs is not defined`), 9 chars rendered | Renders, 3,735 chars |
| Render loops (#185) | 2 | 0 |
| Hook-order crashes | latent (fire on signal transitions) | 0 |
| Blast radius of one widget crash | whole stack (up to 6 widgets) | 1 widget |

---

## 1 · Method

1. **Static wiring scan** (`scripts/tests/widget-health/scan.py`). For each widget it counts timers and listeners (set vs clear), API endpoints, `localStorage`, QIE `record*Signal` calls, Memory/Story/Log references, sound use, whether it is mounted in `System.tsx` and its boundary coverage.
2. **Typecheck** (`tsc --noEmit`). There were 104 errors on the baseline, mostly type drift, but several were real runtime bugs (items 1, 2, 5, 8 above).
3. **Isolated widget harness** (`widgets.entry.tsx` + `run-widgets.cjs`). It mounts all 51 widget containers in headless Chromium, each in its own boundary, with every `/api/*` mocked. It records crashes, render counts and console errors, then fires 0 → 1 → 5 QIE signals to exercise transitions, then clicks up to 4 controls per widget and times click → second animation frame.
4. **Full System tab harness** (`system.entry.tsx` + `run-system.cjs`). It mounts `<System />` as a Usership user with `joinedAt` 400 days ago and 6 signals, and reads `window.__LOT_WIDGET_PERF__` mount timings plus any "Failed to load" boundaries.
5. **Bundle metafile.** An esbuild production build of `app.tsx`, with per-input byte attribution.
6. Before/after: the same harness ran against `git stash` (baseline) and the patched tree.

Re-run any time: `bash scripts/tests/widget-health/run.sh [outdir]` (needs `yarn install` and `yarn client:css:build`).

---

## 2 · Widget wiring · data storing · testing

### 2.1 Inventory (51 containers mounted by `System.tsx`)

Legend: **C** = data container (writes signals, logs or storage on interaction) · **D** = data display (reads only, cycles views) · QIE = emits `record*Signal` · LOG = writes `/api/logs` · LS = `localStorage` keys touched.

| Widget | Kind | QIE | LOG | LS | Timers set/clear | Harness `{}` payload |
|---|---|---|---|---|---|---|
| TimeWidget | D | – | – | – | 1/1 | ok |
| MemoryWidget | C | ✓ | via `/api/memory` | 4 | 13/1 ⚠ | ok |
| MicroGameWidget | C | ✓ | – | – | 1/1 | ok |
| SubscribeWidget | C | – | – | 1 | – | ok |
| MonthlyPulseWidget | C | – | – | 3 | 3/0 ⚠ | ok (now renders) |
| RecipeWidget | C | ✓ | ✓ | – | 4/0 ⚠ | ok |
| ContextualPromptsWidget | C | ✓ | ✓ | – | 1/1 | ok |
| ChatCatalystWidget | C | ✓ | – | – | – | **crash** `.length` |
| InterventionsWidget | C | ✓ | – | – | – | **crash** `.length` |
| EnergyCapacitor | C | ✓ | – | – | – | ok |
| ChakraErgonomicsWidget | C | ✓ | – | – | 1/1 | ok |
| NarrativeWidget | D | ✓ | – | – | – | ok |
| GoalJourneyWidget | C | ✓ | – | – | – | ok |
| EvolutionWidget | D | – | – | – | – | ok |
| InterfaceEvolutionWidget | D | – | – | – | – | ok |
| EmotionalCheckIn | C | ✓ | via `/api/emotional-checkins` | – | 4/0 ⚠ | **crash** `.length` |
| SelfCareMoments | C | ✓ | ✓ | 7 | 4/1 ⚠ | **crash** `.dominantMood` |
| IntentionsWidget | C | ✓ | – | 6 | – | ok |
| PatternInsightsWidget | D | ✓ | – | – | – | ok (gated: `patternInsights`) |
| MoodAnalytics | D | – | – | – | – | **crash** `.length` |
| CohortConnectWidget | C | ✓ | – | – | – | ok (loop fixed) |
| PlannerWidget | C | ✓ | ✓ | – | 3/0 ⚠ | ok |
| MicroCalculatorWidget | C | ✓ | – | – | 1/1, 1/0 | ok |
| MicroImageWidget | C | ✓ | – | – | – | ok (loop fixed) |
| CosmicUpdateWidget | C | – | – | – | – | ok |
| QuantumSignWidget | C | – | – | 4 | – | ok |
| FlashDriveManifest | D | – | – | 1 | – | ok |
| Angel/Corporate/DemoDay/4D UI | D | – | – | 1 each | – | ok |
| QuantumEngineWidgets | C | ✓ (7) | – | 2 | – | ok |
| QuantumStateWidget | D | – | – | – | – | ok (hooks fixed) |
| PatternRecognitionWidget | D | – | – | 1 | – | ok |
| AIFeedbackWidget | D | – | – | – | – | **crash** `.replace` |
| SignalStreamWidget | D | – | – | – | 1/1 | ok (hooks fixed) |
| IntegrityWidget | D | – | – | – | – | ok |
| UserMetricsWidget | D | ✓ (OS) | – | – | – | **crash** `.toLocaleString` (payload; arg bug fixed) |
| CorrelatedIndexesWidget | D | – | – | – | – | **crash** `.toFixed` |
| SystemProgressWidget | C | ✓ (30) | ✓ | 1 | 1/1, 1/0 | **crash** `.length` |
| SystemPulseWidget | D | – | – | – | 1/1 | **crash** `.toFixed` |
| ArchitectWidget | D | – | – | – | – | ok |
| CalendarWidget | C | ✓ | ✓ | – | – | ok |
| BenchmarkWidget | D | – | – | – | – | ok |
| Stats ×6 (Collective · Wellness · MemoryEngine · Growth · Patterns · Badges) | D | – | – | – | – | **all 6 crash** on `{}` |

⚠ = `setTimeout` without matching cleanup. These are all fade-in/fade-out sequences inside handlers or effects. React 18 no longer warns on them, so they are harmless at unmount, but a fast hide→show within 100 ms can leave `isShown` stale. Low priority.

### 2.2 Testing

- No unit or component tests exist for any widget (`*.test.*` count = 0). The only automated test is `test:cold-start` (server).
- **New:** `scripts/tests/widget-health/` is now the regression harness. It caught 5 of the 8 fixed bugs that `tsc` alone did not flag as fatal.

---

## 3 · Wiring with LOT® AI, the System tab and Portrait

- **System tab**: all 51 containers mount from `System.tsx`. Free tier gets the simple layout (Time · Memory · Game · Subscribe). R&D/Usership get the full pro layout. Before this fix the pro layout was **unreachable** for any user with signals (Finding 1).
- **LOT® AI paths** are server-side: `/api/memory` (questions), `/api/memory/story`, `/api/narrative`, `/api/contextual-prompts`, `/api/interventions`, `/api/chat-catalysts`. In the client, 10 widgets reference Memory/Story/Narrative. AIFeedbackWidget is display-only and crashes on a partial payload (§8).
- **Portrait (PublicProfile.tsx)** shows archetype, cohort, badges, memory and story, read from server-derived data. It is not coupled to client QIE state, so Finding 1 did not affect it. Gap: the client archetype (`classifyPhysiologicalCohort`) and the server archetype (`/api/user-profile.archetype`) can disagree. UserMetricsWidget now falls back to the client value correctly (`.archetype`, not the non-existent `.label`).

## 4 · Wiring with the Quantum Intent Engine, Memory and Story

- 23 of 51 widgets emit QIE signals (`record*` calls). `WIDGET_DEPENDENCY_MAP` declares 177 dependency edges.
- **Integrity issue (fixed):** since `1846b80c` (2026-08-03) the QIE has produced **zero** recognized patterns for any user with signals, because the scan threw before it could commit. Every pattern-driven surface was effectively blind for about 3 months: `getOptimalWidget` → Self-care/Intentions suggestions, PatternRecognition, the QIE Connect archetype and the `lastAnalysis` cooldown. Verified after the fix: `getOptimalWidget()` returns `{widget: 'intentions', …}` with patterns committed.
- `analyzeIntentions()` is now a 147-pattern, ~3,000-line function. **Recommendation:** wrap the per-pattern blocks in a guarded runner (`try { patternN() } catch { report }`) so that one bad pattern degrades one signal, not the whole engine.
- Memory → QIE: MemoryWidget calls `analyzeIntentions()` inside `try/catch`, which is why the Memory widget itself survived Finding 1.

## 5 · Interactive widgets → context sync → Log (military-format)

- Only **6 of the 23 signal-emitting containers** post to the Log: Calendar, ContextualPrompts, Planner, Recipe, SelfCare and SystemProgress. The other 17 write QIE signals only. Those signals are synced in batches to the server (`syncToServer`, every `SYNC_INTERVAL` signals) but never appear as Log entries.
- None of the Log payloads attach ambient context: weather, local time or circadian phase, users online. System.tsx already has all three (`stores.weather`, `getCircadianPhase()`, `stores.usersOnline`).
- **Proposed military self-care log line** (one shared helper, opt-in per widget, not implemented this run):
  ```
  [0412Z] SELF-CARE · BREATH-4×4 · COMPLETE · WX CLR 12°C · PHASE DAWN · NET 37 ONLINE · QIE CALM/ALIGNED
  ```
  Format: `[HHMMZ] DOMAIN · ACTION · STATUS · WX · PHASE · NET · QIE-STATE`. It is terse, timestamped and auditable, which fits the transparency principle in §6.

## 6 · Monk lifestyle · LOT® AI as a pure, transparent routine

What a monastic, transparent widget layer looks like here:

1. **Nothing hidden from the user.** Several gates silently read and write `localStorage` (`intentions-last-shown`, `self-care-last-interaction`, `subscribe-clicked`, …). A single "Rule" view (what was shown, why, and the next eligible time) would make the rhythm visible. The QIE `reason` strings already exist for this.
2. **No randomness in the rule.** The Subscribe 20% roll and the Intentions 2–3-day random cooldown are now stable per visit. Next step: replace the randomness with a fixed cadence (the Rule of the day), which a monastic rhythm implies.
3. **Fewer, steadier surfaces.** The pro layout mounts up to 51 containers at once. A daily office of 3–5 widgets chosen by `getOptimalWidget` (now working again), with the rest folded, matches the "pure" intent better than density.

## 7 · 15-month UI reveal (month-to-month build-up)

**There is no month-indexed reveal schedule in code.** Progression today is achievement-based (`getFeatureUnlocks`: depth/consistency/level thresholds), and only two widgets honour it (PatternInsights → `patternInsights`, MoodAnalytics → `moodPatterns`). The only month-aware widget, MonthlyPulse, was dead until this run (Finding 5).

Now that `joinedAt` reaches the client, a reveal ladder can key off `monthNumber`. Here is a proposed 15-month map, built from widgets that already exist:

| Month | Reveal | Month | Reveal |
|---|---|---|---|
| 0 | Time · Memory · Recipe · Check-in | 8 | Biofield Engine (State · Signal Bus) |
| 1 | Monthly Pulse · Planner | 9 | Pattern Recognition · AI Feedback |
| 2 | Intentions · Self-care | 10 | Correlated Indexes · CQGS Health |
| 3 | Energy Capacitor · Mood Analytics | 11 | QIE Connect · Quantum Sign |
| 4 | Narrative · Goal Journey | 12 | Integrity · System Pulse |
| 5 | Pattern Insights · Cohort Connect | 13 | System Progress · Architect |
| 6 | Chakra · Evolution · Interface Evolution | 14 | Stats stack · Benchmark |
| 7 | Micro Calc · Game · Image · Calendar | 15 | Full instrument density (`$layoutDensity` = instrument) |

This is not implemented. It changes what users see, so it needs a product decision. Implementation sketch: `getRevealMonth(widget)` plus a `<Reveal month={n}>` wrapper alongside `LazyMount`.

## 8 · Loading speed · lag test

### 8.1 Bundle (production, minified)

| Item | Size |
|---|---|
| `app.js` | 1,215 KB (323 KB gzip) |
| of which: widgets | 436 KB (36%) |
| `badges.ts` | 207 KB |
| `SystemProgressWidget.tsx` | 177 KB (single largest widget, mostly embedded changelog strings) |
| `Logs.tsx` | 120 KB |
| Dynamic imports in client | 1 (`intentionEngine`, which is also statically imported, so the split is ineffective) |

**Done this run:** `LazyMount` (IntersectionObserver, 200 px margin) now also wraps the **Biofield Engine** and **Stats** stacks. These are display-only, below the fold and emit no signals, so their subscriptions and the 6 stat fetches no longer run on first paint. Earlier only QIE Connect was lazy.

**Open (largest win):** `React.lazy` code-split the pro layout. `SystemProgressWidget` alone is 177 KB, and free-tier users never render it. One blocker: `ArchitectWidget` statically imports `USERSHIP_TRANSMISSION` from `SystemProgressWidget`. Move that constant to a shared module first. Estimated saving for free-tier first load is about 430 KB minified.

### 8.2 Mount timing (full System tab harness, `__LOT_WIDGET_PERF__`)

All boundaries mounted within **≤ 22 ms** of System start (first boundary 22.1 ms, last 1.9 ms; cumulative, headless, mocked API). No boundary exceeded the built-in 50 ms `[Perf]` warning.

### 8.3 Lag test: controls (click → 2nd animation frame)

Across 18 interactive widgets and 31 controls, **every control repainted within 2 frames (33–34 ms)**, which is the measurement floor at 60 Hz. In one earlier run MicroGameWidget hit 49 ms (one extra frame), but the final run did not reproduce it (34 ms). Nothing is close to the 200 ms INP threshold.

### 8.4 Sounds

There are **5 independent `AudioContext` instances**: ambient (`sound.ts`), chime (`sovietChime.ts`), game (`sovietGameSounds.ts`), keyboard (`sovietKeyboard.ts`) and planner click (`plannerWidget.ts`). Browsers cap concurrent contexts, and each one needs its own user-gesture `resume()`, so the first sound per module can lag or stay silent. **Recommendation:** one shared `getAudioContext()` in `utils/sound.ts`, warmed once by `warmAudioContext()`. That function already exists in `sovietChime`.

### 8.5 Partial-payload fragility (Finding 9, open)

16 widgets crash on `{}` or partial JSON: ChatCatalyst, Interventions, EmotionalCheckIn, SelfCareMoments, MoodAnalytics, AIFeedback, UserMetrics, CorrelatedIndexes, SystemProgress, SystemPulse and all 6 Stats. In production this happens on a 200 with an error body, a deploy-window schema mismatch or an empty account. Since this run each one fails alone with "Failed to load · Retry". The fix is mechanical (`?? []`, `?? 0`, optional chaining at the read site) and suits the next run.

## 9 · Data log of widget usage across the platform

- **No per-widget usage telemetry exists.** There is no `widget_usage` event and no endpoint. Usage can only be inferred from QIE signal `source` and `signal` names (client, 7-day retention, max 1,000) and the 6 widgets that write Log entries.
- `window.__LOT_WIDGET_PERF__` (mount ms per boundary) exists client-side but is never reported.
- **Proposed:** piggyback on the existing `syncToServer` batch by adding `{widget, action, ts}` counts. Show them as a "Widget Usage" table in the admin `/us` view and in this report's future runs. Not implemented: it adds a new data flow, so it needs owner sign-off.

---

## 10 · Changes in this push

| File | Change |
|---|---|
| `src/client/stores/intentionEngine.ts` | P147: define local `dayMs147` (fixes the ReferenceError and the System tab crash) |
| `src/client/components/UserMetricsWidget.tsx` | Pass `(signals, getUserState(), patterns)` to `classifyPhysiologicalCohort`; `.label`→`.archetype`, `.dominant`→`.dominantModule` |
| `src/client/hooks/usePunctuationContext.ts` | Stable `EMPTY_LOGS` default (breaks the #185 loop) |
| `src/client/stores/punctuationContext.ts` | Skip the write when already at the empty baseline |
| `src/client/components/SignalStreamWidget.tsx` | Early return moved below all hooks |
| `src/client/components/QuantumStateWidget.tsx` | Early return moved below all hooks |
| `src/server/models/user.ts`, `src/shared/types/index.ts` | `joinedAt` included in `/api/me` profile view (own user only; `useProfileView` has a single caller) |
| `src/client/components/QuantumEngineWidgets.tsx` | `dimensions.selfcare` → `selfCare` |
| `src/client/components/System.tsx` | Per-mount snapshots for the Intentions cooldown and the Subscribe roll; 36 per-widget `WidgetErrorBoundary`s; `LazyMount` on Biofield Engine + Stats |
| `scripts/tests/widget-health/*` | Reusable static scanner + Chromium harness (`run.sh`) |

**Verification:** `yarn build` ✓ (client + server) · `tsc --noEmit` 104 → 96 errors, **0 new** · widget harness: 0 render loops, 0 hook-order errors, 0 transition crashes · System harness: renders (baseline: app crash).

**Not done / needs a decision:** the 15-month reveal ladder (§7), the usage telemetry flow (§9), React.lazy code-split (§8.1), shared AudioContext (§8.4), and null-guards for 16 widgets (§8.5). The last one is the recommended first task for the next run.
