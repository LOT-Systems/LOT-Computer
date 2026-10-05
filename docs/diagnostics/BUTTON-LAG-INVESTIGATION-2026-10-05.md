# Button Lag & Rendering Investigation — 2026-10-05

Scheduled routine "Button lag investigation". Static review only: no profiler or
runtime metrics were available in this environment (no user-report issues exist;
`list_issues` returns 0 open issues; only open PR is #93, calendar toast, unrelated).

## Summary
Button lag has been a recurring defect, fixed 8+ times (history below). The
last perf fixes landed 2026-07-28 (PR #94, #95). Nothing since has been
perf-reviewed, yet ~2,600 lines were added to client code (QIE patterns
139→151, badges 719→812, Logs.tsx +369, intentionEngine.ts +537). No new open
reports, so the status is "no confirmed live regression; high regression risk".

Note: commit be3e8fa cites `docs/diagnostics/BUTTON-LAG-RENDERING-DIAGNOSTIC.md`,
which is not in the repo (never committed). Its findings survive only in the commit message.

## History of fixes
| Date | Commit | Cause |
|---|---|---|
| 2026-06-04 | d609978 / SR-20260604-01 | Biofield `recordSignal()` synchronous |
| 2026-06-09 | SR-20260609-02 | Nav lag |
| 2026-06-22 | 78745c3 / SR-20260622-01 | Memory button blocked by `recordSignal` |
| 2026-07-04 | bd9ef2a | Planner froze: new `AudioContext` per click threw |
| 2026-07-18 | 863b333, b219cc3 | Unbounded `/api/logs`; atom writes inside `useMemo` |
| 2026-07-19 | ee88f4c, 6e5007a | Off-tab System intervals; render-phase atom write |
| 2026-07-25 | b46f1ac | System tab now unmounts when inactive |
| 2026-07-28 | be3e8fa (#94), 9364aba (#95) | Memory `useMemo` store write; sync `analyzeIntentions` in click handler; unmemoized sort/index |

## Root-cause pattern (consistent across all fixes)
`intentionEngine` (nanostore) is written by `recordSignal`/`analyzeIntentions`;
every mounted subscriber re-renders, and heavy synchronous work (pattern scan,
JSON persist, sort of up to 1000 signals) runs on the click/render path.

## Suspected remaining causes (unverified, by code review)
1. **`analyzeIntentions()` cost grows with every QIE release.** Now 151+ patterns in a
   6,503-line file (`src/client/stores/intentionEngine.ts:258`). It is still run
   synchronously from: `SystemProgressWidget.tsx:1555` (mount effect, together with
   `recomputeAssembly` and `getEnrichedPhysiologicalReport`), `System.tsx:268`
   (effect on every `logs` change), `Logs.tsx:3975` (`/qos` trigger),
   `startBackgroundQOSMonitor` (`intentionEngine.ts:5126`, 30-min interval).
   Only `recordSignal` defers it (`deferHeavy`, line 243).
2. **System unmount trade-off (b46f1ac).** Since System fully unmounts off-tab,
   the SystemProgressWidget mount effect (item 1) plus ~7 widget mounts now run on
   *every* System tab open, so "button/tab press then a beat" is likely on System.
   #95 measured ~118ms mount with 1000 signals/500 logs, before QIE v110–v113 additions.
3. **System.tsx effect keyed on `[logs]`** runs `analyzeIntentions()` + `recomputeAssembly()`
   (both store writes) on every logs change, re-rendering all subscribers each time.
4. **Logs.tsx (4,506 lines) and badges.ts (8,149 lines)** — `checkAndAwardBadges`
   / `getEarnedBadges` evaluation on journal/memory answers (`MemoryWidget.tsx:22`,
   `Logs.tsx:35`). 93 badges added Aug 5; check evaluation is not sync in click paths.
5. `playClickSound` (`plannerWidget.ts:259`) fixed; no other `new AudioContext` found.
6. 16 `setInterval`s in components; 5 files use `animate-*`/`backdrop-blur`/`transition-all`
   (CSS animation cost not profiled).

## Next steps
1. Capture a Chrome Performance profile (Planner/Memory/Mood button click, System tab open)
   on a heavy account; look for Long Tasks >50ms. Add `performance.mark` around
   `analyzeIntentions`, `recomputeAssembly`, `checkAndAwardBadges`.
2. Move `analyzeIntentions()` calls in items 1 and 3 behind `deferHeavy`/`requestIdleCallback`,
   or into a Web Worker; add a CI micro-benchmark (1000 signals) with a time budget so
   QIE growth cannot silently regress.
3. Re-run the headless-Chromium harness from #95 against current master.
4. Commit the missing BUTTON-LAG-RENDERING-DIAGNOSTIC.md or drop references to it.
5. Ask the reporter which buttons lag, on which tab, device and account size; none are on file.
