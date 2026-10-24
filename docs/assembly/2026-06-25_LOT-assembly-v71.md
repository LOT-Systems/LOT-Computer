# LOT SELF-ASSEMBLY LOG — v71
**Date:** 2026-06-25  
**Branch:** claude/quantum-engine-widgets-RgFfC  
**Session:** v71  
**S-2:** VADIK MARMELADOV

---

## ORIENTATION

- FM: v70 (built 2026-06-25 in prior session)
- QIE: P.83 (Archetype 28 — Vital Architect)
- Jobs: 21 registered → 23 after this session
- Handlers: 82 in Logs.tsx → 84 after this session
- Archetypes: 28
- Badges: 354 / 47 categories
- Branch state: up to date with origin

---

## INTAKE — WHAT WAS BUILT

### P.84 — longitudinal-drift (QIE Pattern, Job 22)

**Server — Job 22 (`weekly-longitudinal-drift-check`, Monday 09:00 UTC)**  
File: `src/server/scheduled-jobs.ts`  

Detects users whose weekly engagement has declined for 3+ consecutive weeks.

Algorithm:
- Pull 28 days of logs per user
- Map events to 8 engagement categories (intentions, mood, memory, journal, selfcare, goals, recipe, planner)
- Compute per-week engagement score = days with 3+ unique categories active
- Detect 3 consecutive weeks of decline (weeklyScores[i] < weeklyScores[i-1] for i = 1,2,3)
- Write `longitudinal_drift` event with `{ weeklyScores, declineStreak, window: '28d', date }`

**Client — Log Handler 84 (`DRIFT:` block)**  
File: `src/client/components/Logs.tsx`  

Displays `longitudinal_drift` events:
- Block label: `DRIFT:`
- Header: `LONGITUDINAL DRIFT`
- `4-WEEK ARC`: scores joined with ` → ` (e.g. `7 → 6 → 4 → 2`)
- `DECLINE`: streak count with ↓ arrow
- Copy: `Signal trajectory declining. Review engagement baseline.`

---

### Handler 83 — qos_mode_change (Job 23 + Log Handler)

**Server — Job 23 (`daily-qos-mode-watch`, Daily 14:00 UTC)**  
File: `src/server/scheduled-jobs.ts`  

Detects QOS operating mode transitions between consecutive 24h windows.

Mode derivation (`deriveQOSModeFromLogs`):
- Scans energy_checkin, energy_state, energy_update, mood_checkin, emotional_checkin
- `critical`: depleted energy OR (low energy + 2+ negative mood signals)
- `recovery`: low energy OR 1+ negative mood signal
- `nominal`: default
- `pressure` field: human-readable cause (e.g. "depleted energy", "low mood signal", "system stable")

Compares today (last 24h) vs yesterday (24–48h ago). Writes `qos_mode_change` only on transition.  
Metadata: `{ oldMode, newMode, pressure, date }`

**Client — Log Handler (`OS [MODE]:` block)**  
File: `src/client/components/Logs.tsx`  

Displays `qos_mode_change` events:
- Block label: `OS [MODE]:`
- Header: `OLDMODE → NEWMODE` (uppercase)
- `PRESSURE`: the driving condition
- Copy: `Operating mode transition detected.`

**API allowlist update**  
File: `src/server/routes/api.ts`  
Added `'longitudinal_drift'` and `'qos_mode_change'` to `displayableEvents` array (v71 block).

---

## SCHEDULE REGISTRY UPDATE

| Job | Name | Schedule | Fires |
|-----|------|----------|-------|
| 22 | weekly-longitudinal-drift-check | Monday 09:00 UTC | longitudinal_drift |
| 23 | daily-qos-mode-watch | Daily 14:00 UTC | qos_mode_change |

Hour 14 added to setInterval condition in `initializeScheduledJobs()`.

---

## CHECKS

- `tsc --noEmit`: pre-existing infrastructure errors only (typeRoots/deprecated options), zero new errors ✅
- `tsc --project tsconfig.server.json`: clean compile (deprecated option warnings only) ✅
- `yarn build`: blocked — node_modules not installed in remote container (same environment constraint as all prior sessions) — TypeScript confirms code correctness

---

## FILES CHANGED

| File | Change |
|------|--------|
| `src/server/scheduled-jobs.ts` | +Job 22 (longitudinal drift) +Job 23 (QOS mode watch), registered in checkAndRunScheduledJobs(), initializeScheduledJobs() updated |
| `src/server/routes/api.ts` | Added longitudinal_drift + qos_mode_change to displayableEvents |
| `src/client/components/Logs.tsx` | DRIFT: handler (longitudinal_drift) + OS [MODE]: handler (qos_mode_change) |
| `docs/assembly/2026-06-25_LOT-assembly-v71.md` | This file |
| `docs/benchmark/LOT-SR-20260625-01.md` | Benchmark session report |
| `docs/benchmark/LOT-LEDGER.md` | Appended v71 entry |

---

## NEXT SESSION CANDIDATES

1. **P.85** — `intention-momentum-decay`: user has 3+ consecutive days of intention_set with no follow-through (no plan_set within 2h)
2. **Log handler 85** — `badge_progress_scan` display polish: currently renders as raw text — add structured `BADGE ARC:` block with category breakdown
3. **About.tsx v71** update: document P.84 longitudinal-drift and handler 83 qos_mode_change in the Field Manual QIE section
4. **QIE client-side P.84 detection**: add client-side pattern detector in intentionEngine.ts that fires `quantum_intent_signal` with `pattern: 'longitudinal-drift'` when a `longitudinal_drift` log is detected in the feed

---

AUTHORIZED BY: S-2 // VADIK MARMELADOV
