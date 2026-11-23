# Button Lag & Rendering — Diagnostic (2026-11-23)

Scheduled investigation run. Static code review only: no profiler run, no production telemetry. This follows the July 2026 perf passes.

## 1. Status

- **Open GitHub issues:** none. Nobody has filed a button-lag report on GitHub.
- **Performance metrics / profiling data:** none in the repo. There is no RUM, Web Vitals or INP logging. The only measurement on record is the headless-Chromium harness from PR #95: about 118 ms for the one-time System mount, seeded with 1000 signals and 500 logs. That harness was never committed.
- **Earlier diagnostic:** PR #94 cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, but that file is **not in git** on any branch. It appears to have been lost.

### Prior fixes (already merged)

| PR / commit | Fix |
|---|---|
| [#85](https://github.com/LOT-Systems/LOT-Computer/pull/85) `ee88f4c` | Pause System background work when its tab is not active |
| [#87](https://github.com/LOT-Systems/LOT-Computer/pull/87) `d922509` | Remove duplicate SystemProgressWidget mount |
| [#88](https://github.com/LOT-Systems/LOT-Computer/pull/88) `6e5007a` | Stop the atom write during render and the churn on inactive tabs |
| `b46f1ac` | Unmount the System tab when it is inactive |
| `b219cc3` | Move quantum state writes out of `useMemo` |
| `863b333` | Cap the logs query and back off stats polling |
| `bd9ef2a` | Planner buttons frozen: reuse AudioContext |
| [#94](https://github.com/LOT-Systems/LOT-Computer/pull/94) `be3e8fa` | MemoryWidget atom write during render; defer the SystemProgressWidget report click |
| [#95](https://github.com/LOT-Systems/LOT-Computer/pull/95) `9364aba` | Memoize the SignalStream sort and the UserMetrics index |

The pattern so far: each pass fixed individual widgets. **The structural cause has not been addressed:** one large component re-renders roughly 40 unmemoized child widgets.

## 2. Suspected causes (ranked)

### S1 — HIGH: the Breathe toggle re-renders the whole System tab 10 times a second
- [`src/client/utils/breathe.ts:112`](../../src/client/utils/breathe.ts) runs `setInterval(updateState, 100)` and calls `setState` on every tick.
- The hook is called at the **root** of `System` ([`System.tsx:131-132`](../../src/client/components/System.tsx)), and its output is only shown inside one `<Block label="Breathe:">` ([`System.tsx:509`](../../src/client/components/System.tsx), [`:813`](../../src/client/components/System.tsx)).
- `System` renders about 40 widgets ([`System.tsx:444-1040`](../../src/client/components/System.tsx)). Only `MemoryWidget` uses `React.memo`. The rest re-render on every tick, including `SystemProgressWidget` (2513 lines) and the Biofield and Dashboard stacks.
- **Symptom this explains:** while Breathe is on, every button on the System tab feels sluggish. A click competes with reconciling the full tree every 100 ms.
- **Fix:** move `useBreathe` into a small `<BreatheBlock>` leaf component. It is a few lines and carries little risk.

### S2 — HIGH: SSE and global store pushes re-render the same tree
- `System` subscribes to 14 stores at its root ([`System.tsx:105-129`](../../src/client/components/System.tsx)), including `usersOnline`, `usersTotal`, `liveMessage` and `weather`. The SSE handlers in [`entries/app.tsx:107-113`](../../src/client/entries/app.tsx) write those stores on every server push.
- Each push re-renders all of `System` and its unmemoized children. This produces intermittent lag that is hard to reproduce, because it depends on site traffic.
- **Fix:** move each store subscription into the leaf that displays it, and/or wrap the heavy widgets in `React.memo`. They take no props, so memo is free.

### S3 — MEDIUM: every widget button click writes the `intentionEngine` atom synchronously
- `recordSignal()` ([`stores/intentionEngine.ts:199-229`](../../src/client/stores/intentionEngine.ts)) runs 61 times across components.
- Persistence and analysis are already deferred. However, the array copy, the filter over up to `MAX_SIGNALS = 1000` entries, and `intentionEngine.set(...)` all run **inside the click handler**.
- Every subscriber therefore re-renders in the same tick, and `SignalStreamWidget` re-sorts, because `signals` gets a new reference on every write. The memo added in #95 does not help in this path.
- **Fix:** batch the `set` with the deferred work (`queueMicrotask` / `startTransition`), or keep a ring buffer and only filter on persist.

### S4 — LOW/MEDIUM: CSS
- `Button` primary in light theme uses `transition-all` ([`ui/Button.tsx:77`](../../src/client/components/ui/Button.tsx)). It works, but narrowing it to `transition-colors` avoids transitioning layout properties.
- `.grid-fill-hover::before` sets `will-change: opacity` ([`index.css:120`](../../src/client/index.css)). On a page with many buttons, each one gets a permanent compositor layer, which adds memory and layer pressure on mobile and PWA. Applying it only on `:hover`, or removing it, is better.
- `body` transitions `letter-spacing` and `line-height` ([`index.css:69`](../../src/client/index.css)). When `updateEvolutionState` ([`stores/evolution.ts:99-121`](../../src/client/stores/evolution.ts)) writes the root CSS variables, the whole document gets an animated **re-layout**. This only matters when the values actually change, so it is rare.

### S5 — LOW: other timers
- `TimeWidget` runs a check every second, but it does not set state on every tick.
- `NoteEditor` in Logs ([`Logs.tsx:3711`](../../src/client/components/Logs.tsx)) re-renders at 10 Hz when `/breathe` is active. That re-render stays inside the editor.

## 3. Next steps / deeper investigation

1. **Quick wins** (one PR): fix S1 (breathe leaf), wrap the System child widgets in `React.memo` (part of S2), and fix S3 (defer the atom write).
2. **Measure before and after.** Recreate the #95 headless harness and **commit it** (e.g. `scripts/perf/system-tab.mjs`). Record long tasks and INP for: Breathe on and clicking a toggle; a simulated SSE push burst; 20 rapid widget-button clicks.
3. **Add field telemetry:** log INP and long-task counts (the `web-vitals` `onINP`) to the existing stats endpoint. Without it, we cannot confirm whether users still see lag.
4. **Restore the missing doc** `BUTTON-LAG-RENDERING-DIAGNOSTIC.md` if a copy exists, or treat this file as its replacement.
5. Look further into the `Logs.tsx` render scope (4506 lines). Its keystroke path was not profiled in this run.
