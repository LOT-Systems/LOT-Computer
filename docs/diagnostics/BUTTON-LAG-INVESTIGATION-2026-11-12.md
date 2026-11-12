# Button Lag & Rendering — Investigation Report

**Date:** 2026-11-12 · **Type:** Scheduled routine (read-only analysis, no code changed)
**Base:** `master` @ [`98971f2`](https://github.com/LOT-Systems/LOT-Computer/commit/98971f204cf2f58f63ccd13fac3613bf50a6b5ca) (last code change 2026-08-05)

---

## 1. Summary

Buttons are still lagging, mostly on the **System** tab, and the cause is structural. Every button press records a signal into the `intentionEngine` nanostore. That write happens **synchronously in the click tick**, and it re-renders every widget subscribed to the store. Several of those widgets still do O(signals) work or call heavy engine functions inline. Separately, the QIE pattern scan (`analyzeIntentions`) has grown from ~125 to **151 patterns / ~3,200 lines** with no profiling since the July perf passes. It still runs **synchronously** from a few callers that are not deferred.

Four perf PRs in July fixed the most visible paths. Since then (P140–P151, Aug 1–5) only features have landed, with no perf work. No GitHub issues are filed, and there is no captured profiling data in the repo.

## 2. Prior work (context)

| PR | Merged | What it fixed |
|---|---|---|
| [#85](https://github.com/LOT-Systems/LOT-Computer/pull/85) `ee88f4c` | Jul 19 | Pause System background work when the tab is off-screen (tab-switch freeze) |
| [#88](https://github.com/LOT-Systems/LOT-Computer/pull/88) `6e5007a` | Jul 19 | Removed a render-phase atom write and off-tab churn |
| `b46f1ac` | Jul | Unmount the System tab when it's inactive |
| `b219cc3` / `863b333` | Jul | Moved quantum writes out of `useMemo`; capped the logs query; backed off polling |
| [#94](https://github.com/LOT-Systems/LOT-Computer/pull/94) `be3e8fa` | Jul 28 | MemoryWidget render-phase `analyzeIntentions()`; deferred the SystemProgressWidget report click |
| [#95](https://github.com/LOT-Systems/LOT-Computer/pull/95) `9364aba` | Jul 28 | Memoized SignalStreamWidget sort + UserMetricsWidget index/cohort |
| `bd9ef2a` | earlier | Planner buttons frozen: reuse the AudioContext |

⚠️ Commit `be3e8fa` cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md` as its source, but **that file is not in the repo**. The original diagnostic was never committed.

Open PRs: none are perf-related ([#93](https://github.com/LOT-Systems/LOT-Computer/pull/93) calendar, [#97](https://github.com/LOT-Systems/LOT-Computer/pull/97) wiki/badges). **Issues: 0 open or closed.** No user reports exist on GitHub.

## 3. Metrics / profiling available

- An INP + Long-Animation-Frame observer exists: [`src/client/utils/perf.ts`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/utils/perf.ts). It is initialized in `entries/app.tsx:310`, logs `[Perf] Slow interaction` (>200 ms) to the console, and exposes `window.__LOT_PERF__.getEntries()`.
- **Gap:** the data never leaves the browser, so no field metrics exist. The only measured numbers in history are from #95's headless harness (1000 signals + 500 logs, System mount ≈ 118 ms).

## 4. Suspected causes (ranked)

### S1 — Synchronous store write on every button press → fan-out re-render  *(high)*
[`intentionEngine.ts:205-229`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/stores/intentionEngine.ts#L205-L229) `recordSignal()` builds a new `signals` array (spread + `filter` over up to 1000 items, plus a `sort` when over the cap). It then calls `intentionEngine.set()` **inside the click handler**. Persist and analysis are deferred, but the set is not. Every `useStore(intentionEngine)` subscriber re-renders before the button can paint its pressed state:

`QuantumStateWidget`, `PatternRecognitionWidget`, `SystemPulseWidget`, `AIFeedbackWidget`, `SignalStreamWidget`, `UserMetricsWidget`, plus `QuantumEngineWidgets` once it has scrolled into view.

The `signals` reference changes on each press, so memos keyed on `engine.signals` re-run on every click. That includes the SignalStream sort that #95 memoized ([`SignalStreamWidget.tsx:45`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/components/SignalStreamWidget.tsx#L45)) and the UserMetrics index/cohort. #95 only removed the cost for *pattern-only* writes.

### S2 — `analyzeIntentions()` is large and still runs synchronously from some callers  *(high)*
The function body spans [`intentionEngine.ts:258-3466`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/stores/intentionEngine.ts#L258), with ~297 `.filter()` passes over the signal arrays and 5 `localStorage` reads. It went from 139 to 151 patterns after the last profiling. The 5-minute cooldown hides the cost most of the time, but every cooldown miss is a long task. These callers are **not** deferred:
- [`System.tsx:267-271`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/components/System.tsx#L267-L271): a `useEffect([logs])` that runs `analyzeIntentions()` + `recomputeAssembly()` + `setQuantumState` back to back. It fires on every logs change, i.e. right after a widget submit, so the *next* click waits behind it. `getUserIndex()` memoized on `[logs]` (L281) adds more.
- [`SystemProgressWidget.tsx:1555`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/components/SystemProgressWidget.tsx#L1555): the mount effect runs `recomputeAssembly()` + `analyzeIntentions()` synchronously.
- [`Logs.tsx:3975`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/components/Logs.tsx#L3975): the `/qos` trigger runs it in the submit handler.
- [`intentionEngine.ts:5126-5131`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/stores/intentionEngine.ts#L5126): the 30-minute background QOS monitor runs it in a plain interval. This can land mid-interaction.

Every cooldown miss then ends with one more `intentionEngine.set()` ([L3443](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/stores/intentionEngine.ts#L3443)), which repeats the S1 fan-out.

### S3 — Remaining unmemoized heavy work in render  *(medium)*
- [`QuantumEngineWidgets.tsx:374`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/components/QuantumEngineWidgets.tsx#L374): `classifyPhysiologicalCohort(...)` is called inline in JSX (cohort view) on every store write. This duplicates the memo at L203.
- [`QuantumEngineWidgets.tsx:569`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/components/QuantumEngineWidgets.tsx#L569): `getQuantumOS()` + sort run inline in JSX (qos-field view).
- [`PatternRecognitionWidget.tsx:58`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/components/PatternRecognitionWidget.tsx#L58): `getQOSHistory()` (`JSON.parse` of `localStorage`) re-runs on every pattern change.
- [`QuantumStateWidget.tsx:111-113`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/components/QuantumStateWidget.tsx#L111): sort over signals; its memo deps change on every click (see S1).

### S4 — Bundle and parse weight growth  *(low–medium, affects first interaction)*
`SystemProgressWidget.tsx` is 2,513 lines, mostly static `SESSION_REPORTS` string data. `About.tsx` and `badges.ts` (+1,170 lines in v32) are also large. `Logs.tsx` gains ~90 lines of handlers per QIE version. All of it ships in the main bundle and adds parse/compile time before buttons become interactive, which matters most on mobile and PWA cold start.

### S5 — CSS  *(low)*
`ui/Button.tsx` uses `transition-all` on the primary light-theme button, as do `ToggleSection`, `SystemProgressWidget` and `IntegrityWidget`. That's minor, but `transition-all` animates layout-affecting properties. Button itself is render-isolated (it subscribes only to `theme`). **The button component is not the bottleneck.**

## 5. Recommended fixes (not applied, for review)

1. **Defer the `recordSignal` store write.** Batch writes in a microtask or `requestAnimationFrame`, or wrap subscriber updates in `React.startTransition`, so the press paints first. Biggest single win for S1.
2. **Move `analyzeIntentions()` off the main thread or chunk it.** Short term: route every caller through `deferHeavy()` (System.tsx L268, SystemProgressWidget L1555, Logs L3975, QOS monitor). Long term: move it into a Web Worker (it's pure over `signals`), or bucket signals by `source` once per run instead of ~300 full `.filter()` scans.
3. **Hoist** the inline `classifyPhysiologicalCohort` and `getQuantumOS` calls in QuantumEngineWidgets into `useMemo`.
4. **Split static data** (`SESSION_REPORTS`, badge codex, About rows) into lazily imported chunks.
5. Replace `transition-all` with `transition-colors` on buttons.

## 6. Needs deeper investigation

- **Reproduce with numbers.** Rerun the #95 headless-Chromium harness (1000 signals, 500 logs) on current master. Measure INP for a Mood, Self-care or Planner button press and the wall time of a cooldown-miss `analyzeIntentions()` at 151 patterns. This run could not execute it because `node_modules` isn't installed in the routine container.
- **Field telemetry.** Ship `__LOT_PERF__` entries (sampled, no PII) to an endpoint, so "buttons lag" can be confirmed per tab and per device.
- **Recover or recreate `BUTTON-LAG-RENDERING-DIAGNOSTIC.md`** referenced by `be3e8fa`.
- Check whether the lag also occurs on **non-System tabs**. If it does, S1 alone (store write plus Logs re-render) is the prime suspect rather than the widget stack.
- Audit `recomputeAssembly()` ([`selfAssembly.ts:419`](https://github.com/LOT-Systems/LOT-Computer/blob/98971f2/src/client/stores/selfAssembly.ts#L419)) cost and its `selfAssembly` subscribers.
- Mobile Safari: confirm no 300 ms tap delay or `:hover` sticky-state issues on the touch PWA.
