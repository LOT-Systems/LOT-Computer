# Button Lag & Rendering Investigation — 2026-11-07

Scheduled, read-only code/history investigation. No runtime profiling was possible (no browser session or user telemetry available). Repo has no open GitHub issues.

## Summary
Button lag has been addressed in six perf passes (Jul 18–28). No fix since 2026-07-28; later commits (QIE v110–v113, Badge Codex) only grew the code feeding the same hot path. No new user reports are on file. The lag is most likely **mitigated but structurally recurring**: each new QIE version adds patterns to a synchronous scan driven by a shared store.

## History (commits)
| Commit | Date | Fix |
|---|---|---|
| 863b333 | 07-18 | Cap logs query, back off stats polling |
| b219cc3 | 07-18 | Move quantum state writes out of `useMemo` |
| bd9ef2a | 07-04 | Planner buttons frozen: reuse AudioContext |
| ee88f4c / 6e5007a | 07-19 | Pause System background work off-tab; stop render-phase atom write |
| b46f1ac | 07-25 | Unmount System tab when inactive |
| be3e8fa (PR #94) | 07-28 | MemoryWidget write moved to effect; SystemProgressWidget click handler deferred |
| 9364aba (PR #95) | 07-28 | Memoize heavy per-render work in System subscribers |

Note: be3e8fa cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`, which is **not in the repo** (never committed). Its findings survive only in commit messages.

## Suspected causes (ranked)
1. **Shared `intentionEngine` atom** (`src/client/stores/intentionEngine.ts`, 6.5k lines). 7 components use `useStore(intentionEngine)`; every `recordSignal`/`analyzeIntentions` write re-renders all of them. Past lag came from exactly this.
2. **Synchronous `analyzeIntentions()` scan** (~145+ patterns after QIE v111–113, up from 139 when deferred in be3e8fa). Still run inline wherever not yet deferred; cost grows with each QIE release. Re-audit callers: `grep -rn "analyzeIntentions()" src/client`.
3. **Giant components**: `SystemProgressWidget.tsx` (2.5k lines, 3 `setInterval`s) and `System.tsx` (1k lines, 2 intervals) re-render wholesale.
4. **Button hover CSS** (`src/client/index.css:102-160`, `.grid-fill-hover::before`): per-button gradient pseudo-element with opacity transition; `calc()` on CSS vars and 45° repeating gradients in dense/instrument density modes are costlier to paint on low-end/mobile. Plausible for hover jank, not click lag. `Button.tsx` itself is clean (store subscriptions are scoped to primary / secondary-rounded only).
5. **Synchronous localStorage JSON.stringify**: signals persist is already coalesced (`schedulePersist`), but `user-index` (line ~3436) and QOS snapshot (~5097) writes are not verified as coalesced.
6. 12 components hold `setInterval`s; verify each is cleared/paused when off-tab.

## Not found
No profiling data, perf metrics, or user reports exist in repo/issues. Items 1–2 are inferred from history, not measured.

## Next steps
1. Reproduce with Chrome Performance profile on System tab with 1000 signals + 500 logs; record INP and long tasks (>50ms) on button clicks.
2. Replace `useStore(intentionEngine)` with `useStore(intentionEngine, {keys:[...]})` or derived atoms/selectors in the 7 subscribers.
3. Run `analyzeIntentions()` in `requestIdleCallback`/a worker; chunk the pattern scan.
4. Add a CI perf smoke (the headless-Chromium harness used for 9364aba) with a click-latency budget, so QIE growth can't silently regress.
5. Test `.grid-fill-hover` with `will-change: opacity` / simpler gradients on dense modes; check on a mobile device.
6. Recover or recreate the missing BUTTON-LAG-RENDERING-DIAGNOSTIC.md.
