# Button Lag & Rendering Diagnostic — 2026-11-15

Scheduled investigation of the button lag and rendering problems. Scope: recent commits, PRs and issues; profiling; root-cause candidates. **No application code was changed by this run.** The fixes below are proposals.

Base: `master` @ `98971f2` (PR #96, merged 2026-08-05).

---

## TL;DR

1. **CONFIRMED P0: `analyzeIntentions()` throws `ReferenceError: dayMs is not defined` on every call made after its cooldown.**
   - Introduced in QIE v112 (`1846b80`, 2026-08-03), Pattern 147 block, `src/client/stores/intentionEngine.ts:3332`.
   - `dayMs` is only declared inside *other* functions (`computeUserIndex` at L3543, and L4620). It is never declared in `analyzeIntentions` (L258–L3467).
   - The throw happens **before** the state commit at L3442–L3449, so `lastAnalysis` never updates. That means the 5-min cooldown at L263 never engages. Every caller re-runs about 146 patterns of scanning work and then throws.
   - It also throws **during render** via `getOptimalWidget()` (L3667), which runs inside `useMemo` in `System.tsx:377` and `PatternRecognitionWidget.tsx:78`. A throw in a render-phase `useMemo` in `System` (which has no `WidgetErrorBoundary` around itself) goes up to `AppErrorBoundary` (`src/client/entries/app.tsx:35`). For any user with stored signals, this probably means a "Something went wrong — dayMs is not defined" screen when they open System. Production still needs to confirm this; see *Verification* below.
2. **HIGH (Log tab button/nav lag): the whole `Logs` list re-renders on every mouse active↔idle switch.** `setIsMouseActive` (`Logs.tsx:158/161`, driven by `useMouseInactivity(2000, …)` at L168) is state on the root `Logs` component. When the mouse first moves after 2s idle, all of these re-render: the 149-branch `else if (log.event === …)` chain, up to 500 rows (the `/api/logs` LIMIT), and every unmemoized `NoteEditor` / `LogContainer`. That move is usually the one heading for a button.
3. The earlier perf passes (PRs #85, #88, #94, #95, and `b46f1ac`) still hold. No regressions were found in `Button.tsx` or the `.grid-fill-hover` CSS.

---

## 1. History reviewed

| Date | Ref | What it fixed |
|---|---|---|
| 07-04 | `bd9ef2a` | Planner buttons frozen: a new `AudioContext` per click hit the browser cap |
| 07-18 | `863b333` | Unbounded `/api/logs` → `LIMIT 500`; stats polling backed off |
| 07-18 | `b219cc3` | `analyzeIntentions`/`recomputeAssembly` moved out of render-phase `useMemo` in `System.tsx` |
| 07-19 | `ee88f4c` (PR #85) | Off-tab interval gating (`isRouteActive`); `recordSignal` persist coalesced; analysis moved to `requestIdleCallback` |
| 07-19 | `6e5007a` (PR #88) | Render-phase atom write in `PatternRecognitionWidget`; 3 ungated intervals |
| 07-25 | `b46f1ac` | System tab unmounts when inactive |
| 07-28 | `be3e8fa` (PR #94) | `MemoryWidget` render-phase write; `SystemProgressWidget` click handler deferred |
| 07-28 | `9364aba` (PR #95) | Memoized sort and UserIndex in `SignalStreamWidget` / `UserMetricsWidget` |
| **08-03** | **`1846b80`** | **QIE v112 (P146–P148). Introduced the `dayMs` ReferenceError** |

- **Issues:** the repo has 0 GitHub issues. There are no user reports on file.
- **Open PRs:**
  - #97 (wiki/docs, Badge Codex v32): the first page of its file list is all docs/config.
  - #93 (Calendar time tracking): adds `CalendarEventToast` with a 30s gated poll. Its pattern looks fine.
- **Missing doc:** PR #94 cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, but that file was never committed. This report takes its place.

Changes since the last perf fix (`9364aba..HEAD`, client): `intentionEngine.ts` +537, `Logs.tsx` +369, `System.tsx` +42 (15-min astrology tick, a once-daily `recordAstrologySignal`, inline `getCircadianPhase()`), and `SystemProgressWidget.tsx` (static data only). `getCircadianPhase()` is a cheap hour switch, so it is not a cause.

---

## 2. Evidence: `dayMs` ReferenceError

```ts
// src/client/stores/intentionEngine.ts:3328-3333 (inside analyzeIntentions)
const hasPresenceP142 = patterns.some(p => p.pattern === 'adaptive-signal-web')
const hasPresenceP137 = patterns.some(p => p.pattern === 'quantum-coherence-peak')
const daySignals147 = signals.filter(s => now - s.timestamp < dayMs)   // ← dayMs undeclared
```

Reproduced in a Node harness: the real module, bundled with esbuild, with a localStorage shim and 1,000 seeded signals.

```
UNPATCHED  err: dayMs is not defined
           throws 10/10 · lastAnalysis still 0 · ms 31.2 11.6 9.7 18.2 10.6 8.8 7.3 7.9 7.7 6.6
           getOptimalWidget throws: dayMs is not defined
PATCHED    analyzeIntentions ms: 22.1 13.6 9.4 12.2 10.2 8.1 7.6 7.6 7.6 6.8   (then cooldown holds)
```

These timings are from a server CPU. Mobile is typically 4–8× slower, so expect about **30–150 ms per scan** there.

### Why this shows up as lag and broken rendering

Every path below now runs a full scan, throws, and leaves the cooldown unset:

| Caller | Location | Effect |
|---|---|---|
| `recordSignal` → `deferHeavy(analyzeIntentions)` | `intentionEngine.ts:243` | Uncaught error in an idle callback after every 5th signal, from any widget button |
| `startBackgroundQOSMonitor` | `intentionEngine.ts:5126/5130` | Throws on mount and on every tick. `captureQOSSnapshot()` after it never runs |
| `getOptimalWidget()` in `useMemo` | `System.tsx:377`, `PatternRecognitionWidget.tsx:78` | **Render-phase throw.** The System one reaches `AppErrorBoundary` |
| `useEffect` on `[logs]` | `System.tsx:268` | Throws, so `recomputeAssembly()` / `setQuantumState` after it never run |
| Mount effect + "Generate report" | `SystemProgressWidget.tsx:1555`, `:1629` | The report never builds, so the button looks dead |
| `MemoryWidget`, Logs `/qos` | `MemoryWidget.tsx:274`, `Logs.tsx:3975` | Wrapped in try/catch, so they fail silently. The scan still costs CPU every time |

`recognizedPatterns`, `userState`, and `userIndex` also stay frozen at whatever was persisted before 2026-08-03. Widgets that depend on them show stale data.

### Process root cause

The build gate is `npm run build` (esbuild), which **does not type-check**. `tsc --noEmit` already has a baseline of about 101 errors and is not enforced, so the new `TS2304: Cannot find name 'dayMs'` blended into the noise.

### Proposed fix (one line)

```diff
- const daySignals147 = signals.filter(s => now - s.timestamp < dayMs)
+ const daySignals147 = signals.filter(s => now - s.timestamp < 24 * 60 * 60 * 1000)
```

Hardening (recommended):

- Wrap the pattern scan so that a failing pattern block cannot skip the state commit. Either use a per-block try/catch, or set `lastAnalysis` in a `finally`.
- Make `getOptimalWidget()` safe to call in render: wrap it in try/catch and return `null`.
- Add a CI step that fails on **new** tsc errors, either by comparing the error count to the baseline or by checking `TS2304`/`TS2552` only.

---

## 3. Evidence: Logs tab full re-render on mouse activity

- `src/client/components/Logs.tsx:54`: `const [isMouseActive, setIsMouseActive] = useState(true)` on the root `LogsInner`.
- `Logs.tsx:168`: `useMouseInactivity(2000, …)` flips that state at each idle↔active switch. The route guard at L154 keeps it to the Log tab.
- `Logs.tsx:222–3652`: `pastLogIds.map(...)` over up to 500 logs. Each row walks a chain of **149** `else if (log.event === …)` branches.
- `NoteEditor` (L3656) and `LogContainer` (L4438) are **not** `React.memo`. `onChange={onChangeLog(id)}` (L3646) makes a new closure per row on every render, so a plain `memo` would not help by itself.
- Only the NoteEditors actually use `isMouseActive` (L4198 `sm:opacity-0`), but every row pays the re-render cost.
- Each autosave to the primary log also does `localStore.logById.set(...)`, which re-renders the whole list in the same way.

Proposed fix:

- Move `isMouseActive` into a tiny nanostore atom, or toggle a CSS class or `data-mouse-idle` attribute on the container, the same way `#nav` is already toggled. Then style `[data-mouse-idle] .note-meta { opacity: 0 }`.
- Wrap `NoteEditor` and `LogContainer` in `React.memo`, with a stable per-id `onChange` (cache it in a `Map` ref).
- Extract the 149-branch renderer into a `memo`'d `LogRow({ log, dateFormat })` keyed on `log` identity.
- Optional: window or virtualize past logs, for example rendering the first 50 and adding more as the user scrolls.

---

## 4. Checked and ruled out

- `ui/Button.tsx`: each variant subscribes to at most one store; the secondary variant has no subscriptions. Fine.
- `.grid-fill-hover` (`index.css:102`): an opacity-only transition on `::before` with `will-change: opacity`. Cheap.
- `getCircadianPhase()` and the astrology 15-min tick: negligible.
- `recordSignal` persist coalescing and idle deferral (from PR #85): intact.

---

## 5. Next steps

1. **Ship the one-line `dayMs` fix plus the hardening.** Bump `CACHE_VERSION` in `public/sw.js` so clients pick it up, as `b46f1ac` did.
2. **Verify in production:** open System with existing signals and check the console for `dayMs is not defined`, or check whether the AppErrorBoundary screen appears. Confirm `intentionEngine.get().lastAnalysis` advances after the fix.
3. **Logs tab:** apply the §3 render isolation. Then profile with React DevTools Profiler (500 logs, mouse idle → move) before and after.
4. **CI:** add a tsc "no new errors" gate.
5. **Deeper investigation (not yet measured):**
   - Mobile-device timing of the patched `analyzeIntentions()` at 1,000 signals. If it is over 50 ms, chunk it or move it to a Web Worker. It still runs on the main thread through `requestIdleCallback` with `timeout: 2000`, which forces a run.
   - The cost of `recomputeAssembly()`.
   - The service-worker cache: whether clients are still on pre-08-05 bundles.

Harness scripts (scratch, not committed): `bench.ts`, `bench2.ts` (patched copy), and `bench3.ts`. They bundle `src/client/stores/intentionEngine.ts` with esbuild and shim `localStorage`/`window`/`fetch`.
