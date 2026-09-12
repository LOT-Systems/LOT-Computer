<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Button Lag & Rendering — Diagnostic Report (2026-09-12 sweep)

**Status**: 🟡 Partially fixed — 5 unfixed instances of an already-known doctrine
violation found in components the previous fix passes did not cover.
**Scope**: `src/client/components/*.tsx`, `src/client/stores/intentionEngine.ts`

---

## 1. Summary

Button lag / tab-switch freeze has been a recurring issue category since at
least **2026-06-03** (per `docs/benchmark/LOT-LEDGER.md`), with fix passes on
06-03, 06-04, 06-05, 06-09, 06-22, 07-18, 07-19, 07-25, and 07-28. Every pass
has traced back to the **same root cause**, codified in
`docs/benchmark/LOT-DOCTRINE.md` under "Render Isolation":

> Work that WRITES to a store must not run inside `useMemo` or the render body
> — the write schedules a re-render of every component subscribed to that
> store before the browser can paint. Move such work to `useEffect` (after
> paint) or defer it off the interaction tick.

The last two fix commits (`be3e8fa`, `9364aba`, 2026-07-28) closed out the
instances an agent diagnostic had flagged at the time in `System.tsx`,
`MemoryWidget.tsx`, `SystemProgressWidget.tsx`, `SignalStreamWidget.tsx`, and
`UserMetricsWidget.tsx`. No commits have touched button/render performance
since (last repo commit overall: `98971f2`, 2026-08-05 — five weeks stale as
of this sweep). GitHub has **no open issues** and **no open PRs** referencing
button lag or rendering; the one open PR (#93, calendar feature) is stale/
conflicted and unrelated.

A fresh sweep of the rest of `src/client/components/` (~40 files not covered
by the 07-28 pass) found the **identical pattern, copy-pasted, in five widgets
that were never audited**:

## 2. Confirmed findings

### 2a. Render-phase `intentionEngine` writes (high severity — reproduces the exact bug class already fixed elsewhere)

`recordSignal()` (`src/client/stores/intentionEngine.ts:199-229`) calls
`intentionEngine.set({...})` **unconditionally and synchronously** on every
invocation (line 226), then schedules a deferred persist + analysis. Calling
it from a component's render body — instead of a `useEffect` or an event
handler — is precisely the "write during render" violation the doctrine
warns about: it fires a re-render of every widget subscribed to
`intentionEngine` (there are ~10+) before the browser can paint the current
frame.

All five below use the identical shape:
`if (!hasRecordedRef.current && <cond>) { recordSignal(...); hasRecordedRef.current = true }`
directly in the component body, guarded only by a ref (not `useEffect`):

| File | Line | Signal |
|---|---|---|
| `src/client/components/CohortConnectWidget.tsx` | 44-53 | `cohort_widget_viewed` |
| `src/client/components/EnergyCapacitor.tsx` | 50-57 | `energy_<status>` |
| `src/client/components/MicroImageWidget.tsx` | 248-258 | `microimage_rendered` |
| `src/client/components/InterventionsWidget.tsx` | 37-44 | `intervention_<severity>` |
| `src/client/components/ChakraErgonomicsWidget.tsx` | 62-72 | `chakra_scan_<id>` |

Note on `ChakraErgonomicsWidget.tsx`: this file's 2-minute recompute
**interval** was already fixed in `6e5007a` (gated on `isRouteActive`), but
this separate render-body `recordSignal` call was missed in that pass — the
interval and the render-body write are two independent violations in the
same file.

**Fix** (matches the established pattern in `MemoryWidget.tsx` from
`be3e8fa`): move each block into `React.useEffect(() => { ... }, [<cond>])`
so the write lands after paint instead of during render.

### 2b. Ungated interval doing unconditional analysis (medium severity)

`startBackgroundQOSMonitor()` (`src/client/stores/intentionEngine.ts:5122-5138`,
started from `SystemProgressWidget.tsx:1571`) runs `analyzeIntentions()` (the
~139-pattern scan) every 30 minutes with **no** `document.hidden` /
`isRouteActive('system')` guard — unlike the sibling interval defined two
lines above it in the same effect block, which does gate. Lower urgency than
2a because it fires only once per 30 minutes rather than per-signal, but it
is inconsistent with the doctrine applied to every other interval in this
file and will do a full analysis pass while the user is on an unrelated tab.

**Fix**: add the same `if (document.hidden || !isRouteActive('system')) return`
guard used elsewhere in this file, inside the interval callback.

### 2c. Lower-severity, informational

- `src/client/components/Logs.tsx:3975` — the `/qos-report` slash command
  calls `analyzeIntentions()` synchronously in its submit handler, unlike
  `SystemProgressWidget.tsx`'s `handleGenerateReport`, which was deferred by
  a macrotask in `be3e8fa` for the same call. Rare user action (a slash
  command), so low real-world impact, but same class of fix if addressed.
- `src/client/stores/recipeWidget.ts:186` (`initRecipeWidget`) — a global
  5-minute interval not gated on tab visibility, but its body is cheap and
  rarely writes its narrow-scope atom. Minimal user-visible impact.

## 3. Files checked and found clean

`QuantumEngineWidgets.tsx`, `PatternRecognitionWidget.tsx`,
`UserMetricsWidget.tsx`, `MicroGameWidget.tsx` (interval correctly gated on
`inViewport`), `StatusPage.tsx`, `About.tsx`, `TimeWidget.tsx`,
`MicroCalculatorWidget.tsx`, `QuantumRandomWidget.tsx`, `NarrativeWidget.tsx`,
`AwarenessDashboard.tsx`, `SelfCareMoments.tsx`, `IntentionsWidget.tsx`,
`RecipeWidget.tsx`, `EmotionalCheckIn.tsx` — all `recordSignal` calls in these
run inside click/change handlers or `useEffect`, not the render body.
`src/client/components/ui/Button.tsx` itself is clean and already optimized
(narrow per-variant store subscriptions, documented inline: `PrimaryBtn`
subscribes to `stores.theme` only, `SecondaryRoundedBtn` to
`stores.isMirrorOn` only, plain `secondary` buttons subscribe to nothing).

## 4. Why this keeps recurring (architectural note)

This is not really nine separate bugs — it is one shared-state architecture
(`intentionEngine`, a single nanostore atom that ~10+ widgets subscribe to)
combined with a widget-authoring pattern (`recordSignal` "once per mount"
guarded by a ref) that is easy to place directly in the render body instead
of a `useEffect`, because both produce the same visual result on a normal
render and the bug only shows up as accumulated lag under repeated
mounts/re-renders. Each fix pass has caught the instances flagged by that
session's specific repro, not the pattern as a class — which is how five more
copies survived the 07-28 pass. A lint rule or a `recordSignalOnMount(cond,
...)` helper hook that enforces the `useEffect` wrapper would close this
class permanently instead of relying on repeated manual sweeps.

## 5. Next steps

1. Apply the `useEffect` fix to the 5 files in §2a (same shape as the
   `MemoryWidget.tsx` fix in `be3e8fa`) — highest-impact, lowest-risk.
2. Gate `startBackgroundQOSMonitor`'s interval (§2b) the same way its sibling
   interval already is.
3. Optional/lower priority: defer `Logs.tsx:3975`'s `/qos-report` handler and
   gate `recipeWidget.ts:186`'s interval (§2c).
4. Consider the lint-rule/helper-hook option in §4 to prevent a sixth
   recurrence — this class of bug has now shipped in three separate PRs
   (07-19, 07-25, 07-28) plus these five newly found instances.
5. No user-facing reports or CI signal currently point at additional causes
   (no open issues/PRs mention it); if lag reports resume in production, the
   next place to look is whichever widget most recently gained a
   `recordSignal`/`hasRecordedRef` block without going through `useEffect`.
