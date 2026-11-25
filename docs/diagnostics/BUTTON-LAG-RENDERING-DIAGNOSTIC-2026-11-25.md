# Button Lag & Rendering Diagnostic — 2026-11-25

Scheduled investigation. Code reviewed at `master` @ [`9f2b88c`](https://github.com/LOT-Systems/LOT-Computer/commit/9f2b88c044d6b0414f21e80713f2466947c64a87).
No source changes were made. This file only records what was found.

`BASE` below = `https://github.com/LOT-Systems/LOT-Computer/blob/9f2b88c044d6b0414f21e80713f2466947c64a87`

---

## TL;DR

1. **Critical: there is a ReferenceError in the QIE scan.** Since QIE v112 ([`1846b80`](https://github.com/LOT-Systems/LOT-Computer/commit/1846b80), 2026-08-03), `analyzeIntentions()` reads `dayMs` at P147, but `dayMs` is never declared in that function ([`intentionEngine.ts:3332`](https://github.com/LOT-Systems/LOT-Computer/blob/9f2b88c044d6b0414f21e80713f2466947c64a87/src/client/stores/intentionEngine.ts#L3332)). `tsc` confirms it: `TS2304: Cannot find name 'dayMs'`. The client is bundled by esbuild, which does not typecheck, so the error shipped.
   - The throw happens **after** almost the full ~146-pattern scan has run and **before** the `intentionEngine.set({... lastAnalysis: now })` at [L3443](https://github.com/LOT-Systems/LOT-Computer/blob/9f2b88c044d6b0414f21e80713f2466947c64a87/src/client/stores/intentionEngine.ts#L3443). Because of that, the 5-min cooldown never takes effect. Every call pays for the full scan and then throws.
   - `System.tsx` calls it **during render**: `React.useMemo(() => getOptimalWidget(), [logs])` at [`System.tsx:377`](https://github.com/LOT-Systems/LOT-Computer/blob/9f2b88c044d6b0414f21e80713f2466947c64a87/src/client/components/System.tsx#L377), and `getOptimalWidget()` calls `analyzeIntentions()`. `<System />` is not inside an error boundary ([`entries/app.tsx:188`](https://github.com/LOT-Systems/LOT-Computer/blob/9f2b88c044d6b0414f21e80713f2466947c64a87/src/client/entries/app.tsx#L188)). So for any user with ≥1 stored signal, the System tab render should throw, and React then unmounts the root. Expected result: a blank or frozen app on the System tab.
   - The other callers swallow the error or run it deferred: the `recordSignal` → `deferHeavy` path ([L243](https://github.com/LOT-Systems/LOT-Computer/blob/9f2b88c044d6b0414f21e80713f2466947c64a87/src/client/stores/intentionEngine.ts#L243)), the QOS monitor ([L5126](https://github.com/LOT-Systems/LOT-Computer/blob/9f2b88c044d6b0414f21e80713f2466947c64a87/src/client/stores/intentionEngine.ts#L5126)), MemoryWidget, SystemProgressWidget and PatternRecognitionWidget. Those produce repeated wasted idle-time scans plus console errors, not a crash.
   - **Fix (one line):** declare `const dayMs = 24 * 60 * 60 * 1000` inside `analyzeIntentions()` before L3332, or replace it with the literal.
   - *Caveat:* I could not observe production directly. The crash comes from code reading, a `tsc` check and a node reproduction. It has not been confirmed on the live site. If prod is running this commit and users see a blank System tab, this is the cause.

2. **High: a render-phase store write remains in `System.tsx:377`.** It is the same pattern that [#88](https://github.com/LOT-Systems/LOT-Computer/pull/88) and [#94](https://github.com/LOT-Systems/LOT-Computer/pull/94) removed from MemoryWidget and SystemProgressWidget. This one has been there since 2026-06-30 (`5e8b9af`). On mount, and on every `logs` change after the cooldown ends, the full scan plus an atom write runs inside render. That synchronously re-renders all 7 `useStore(intentionEngine)` subscribers before paint. It also makes the post-paint `useEffect` at [L267–271](https://github.com/LOT-Systems/LOT-Computer/blob/9f2b88c044d6b0414f21e80713f2466947c64a87/src/client/components/System.tsx#L267) redundant, because the render-phase call has already used up the cooldown.
   - Fix: read `getOptimalWidget()` from state that a `useEffect` sets, like `quantumState` at L266. Alternatively, make `getOptimalWidget()` take the already-computed `recognizedPatterns` and never call `analyzeIntentions()`.

3. **Medium: the Logs list re-renders in full and is not virtualized.** [`Logs.tsx:222`](https://github.com/LOT-Systems/LOT-Computer/blob/9f2b88c044d6b0414f21e80713f2466947c64a87/src/client/components/Logs.tsx#L222) maps every past log through a 149-branch `if/else` chain inline, with no memoized row component. It re-renders on:
   - every mouse-inactivity toggle on the Logs route (`setIsMouseActive`, [L147–166](https://github.com/LOT-Systems/LOT-Computer/blob/9f2b88c044d6b0414f21e80713f2466947c64a87/src/client/components/Logs.tsx#L147))
   - every autosave `onSuccess` (`logById` replaced, [L70](https://github.com/LOT-Systems/LOT-Computer/blob/9f2b88c044d6b0414f21e80713f2466947c64a87/src/client/components/Logs.tsx#L70))
   - the 7 s push-down refetch

   The cost grows with log count and with each QIE release, since each one adds about 3 handlers.

---

## Measurements

I ran a node micro-benchmark on `analyzeIntentions()` with 1000 synthetic signals (the `MAX_SIGNALS` cap), 11 sources and the cooldown reset before each run. I used a locally patched copy with `dayMs` defined so the scan could finish. Nothing was committed.

| Build | Result |
|---|---|
| As shipped | `ReferenceError: dayMs is not defined` at P147 (reproduced) |
| Patched | min 7.5 ms · **median 10.5 ms** · max 40.1 ms · 45 patterns matched |

These numbers come from a desktop-class server CPU. Mid-range phones are usually 4–6× slower, so each render-phase scan would be roughly 40–60 ms, which counts as a long task. The cascading re-renders of the 7 subscribers come on top of that.

---

## Review of recent history

| Date | Ref | What it fixed |
|---|---|---|
| 07-07 | `bd9ef2a` | Planner buttons frozen. Reused the AudioContext. |
| 07-07 | `89da563` | Logs inactivity timer was disabling nav on all tabs |
| 07-1x | `863b333`, `b219cc3` | Capped the logs query. Moved quantum writes out of `useMemo`. |
| 07-19 | [#85](https://github.com/LOT-Systems/LOT-Computer/pull/85) `ee88f4c` | Paused System background work when off-tab |
| 07-19 | [#88](https://github.com/LOT-Systems/LOT-Computer/pull/88) `6e5007a` | Stopped render-phase atom write in PatternRecognitionWidget |
| 07-25 | `b46f1ac` | Unmount System tab when it is inactive |
| 07-28 | [#94](https://github.com/LOT-Systems/LOT-Computer/pull/94) `be3e8fa` | MemoryWidget render-phase write. SystemProgressWidget sync scan in click handler. |
| 07-28 | [#95](https://github.com/LOT-Systems/LOT-Computer/pull/95) `9364aba` | Memoized SignalStream sort and UserMetrics index |

The client code changed after #95 only through QIE v110–v113 and the astrology work: about +537 lines in `intentionEngine.ts` (P140–P151) and +369 in `Logs.tsx`. The v112 change introduced the `dayMs` bug. No new perf work has landed since 07-28.

- **GitHub issues:** none exist. Lag reports have been coming in through sessions, not the issue tracker.
- **Open PRs:** [#97](https://github.com/LOT-Systems/LOT-Computer/pull/97) (wiki/badges) and [#93](https://github.com/LOT-Systems/LOT-Computer/pull/93) (calendar). Neither touches these paths.
- **Missing doc:** commit `be3e8fa` cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, but that file was never committed.

---

## Areas checked that look fine

- **`recordSignal`** ([L199–252](https://github.com/LOT-Systems/LOT-Computer/blob/9f2b88c044d6b0414f21e80713f2466947c64a87/src/client/stores/intentionEngine.ts#L199)): persist is coalesced and analysis is deferred through `requestIdleCallback`. The synchronous `intentionEngine.set` still re-renders all 7 subscribers on each button-press signal, but they are memoized after #95.
- **Astrology tick** (15 min, paused while the tab is hidden) and the daily signal write run in effects. Both are fine.
- **`analyzeIntentions` post-commit checks** run in `setTimeout(0)`, which is fine. The `localStorage.setItem('user-index')` call inside the scan is synchronous but small.
- **CSS animations:** no new hover or animation work since `60bccff`. Not investigated further.

---

## Next steps (in priority order)

1. **Fix `dayMs`** at `intentionEngine.ts:3332`, then confirm in prod or staging that the System tab renders for a user who has stored signals.
2. **Add a client typecheck to the build gate**, for example `tsc --noEmit -p tsconfig.json` before `client:build`. The server build already runs `tsc`; the client does not. This would have caught v112.
3. **Wrap `<System />` (and the other TabPanels) in `WidgetErrorBoundary`** so that one QIE throw cannot blank the whole app.
4. **Remove the render-phase `getOptimalWidget()`** at `System.tsx:377` (see item 2 in the TL;DR). Make `getOptimalWidget` pure: it should take patterns and not call `analyzeIntentions`.
5. **Logs list:** pull the 149-branch renderer out into a `React.memo` `LogRow` keyed on `log` and `dateFormat`. Consider windowing or pagination for long histories. Keep `isMouseActive` from reaching past rows.
6. **Profile on a real mobile device** (Chrome DevTools Performance plus React Profiler) after steps 1–4, to see whether any button lag remains: tab switch, Memory answer, Planner, SelfCare buttons.
