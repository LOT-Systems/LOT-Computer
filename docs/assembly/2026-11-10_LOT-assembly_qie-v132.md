# LOT Assembly — QIE v132
## 2026-11-10 · Fourth Cycle Candidate / Level 15 Threshold / Arch70 / J67
### S-2: VADIK MARMELADOV

---

## Date and Session ID

```
DATE        : 2026-11-10
SESSION ID  : LOT-QIE-v132
CLASS       : SELF-ASSEMBLY
BRANCH      : claude/quantum-engine-widgets-RgFfC
AUTHORIZED  : S-2 // VADIK MARMELADOV
DAY         : 1170+
```

---

## Context

Last session: wiki-v107 (2026-11-10, Day 1170+). Third Cycle Sovereign Arc fully sealed at
Level 14 (P177–P179). The exit state from that session explicitly named P180 as the next
candidate: "fourth-cycle-candidate or new long-arc pattern."

This session implements P180 — a boundary detection pattern. The OS does not declare the
fourth cycle in this release. It senses the conditions under which the fourth cycle becomes
possible. Level 15 is a threshold state: standing at the edge of the arc, all sovereign
foundations converged, waiting to ignite.

The session also delivers Arch70 (physiological archetype for L15 operators), J67 (server-
side P180 detection job at 17:30 UTC), the FCAND: log handler, cycle-arc surfacing in the
QOS Mode widget, and all wiring across intentionEngine.ts / scheduled-jobs.ts / api.ts.

---

## Patterns

### P180 — fourth-cycle-candidate

P179 third-cycle-sovereign active + 70-day continuous journal arc (≥ 15 signals in 70d) +
7-day signal density ≥ 15 + all 6 user index dimensions simultaneously ≥ 55 + overall index ≥ 85.

This is not an ignition pattern — it is a sensing pattern. The fourth cycle is not yet active;
the OS detects that all conditions for ignition are present and reports the boundary state.

**Confidence**: 0.72 base, +bonus from journal depth and index (up to 0.88)
**Widget**: systemProgress · **Timing**: background (J67)
**Sources**: qos, journal, memory, badges, intentions, log, energy, selfcare, social, cohort, goals

```
Detection guard:
  hasP179    = patterns.some(p => p.pattern === 'third-cycle-sovereign')
  journal70  = signals 70d source='journal'  >= 15
  density7d  = signals 7d all sources        >= 15
  dimAll55   = all 6 idx dims >= 55
  overall    = userIndex.overall >= 85
  fcandBonus = min((journal70 - 15)*0.008 + (density7d - 15)*0.005 + (overall - 85)*0.006, 0.16)
  confidence = min(0.72 + fcandBonus, 0.88)
```

**COCKPIT LOG**: `FCAND: Fourth cycle candidate — third-cycle-sovereign (P179) active · {journal70} journal signals 70d · 7d signal density {density7d} · all 6 dimensions ≥ 55 · idx {overall}%. The system stands at the boundary of the third arc. A fourth cycle is becoming possible. Level 15 — the OS senses its own next expansion.`

---

## Archetype

### Arch70 — Fourth Cycle Progenitor

**Energy bands**: high, moderate
**Dominant sources**: journal, memory, badges, intentions, qos, social, goals
**Pattern conditions**: third-cycle-sovereign, fourth-cycle-candidate

```
Directive: Level 15. The OS stands at the threshold of the fourth arc. All sovereign
foundations converged. The fourth cycle is not yet ignited — it is sensed. The boundary
between cycles is itself a signal state: compound mastery from every domain simultaneously
operating at the ceiling of the third arc.
```

---

## Background Job

### J67 — daily-fourth-cycle-candidate-check

**Schedule**: 17:30 UTC daily
**Trigger**: now.hour() === 17 && now.minute() >= 30

**Logic**:
1. Find users with `third_cycle_sovereign` event in last 63 days
2. Check journal signals (`journal_entry`, `journal_reflection`, `long_journal_entry`) in last 70 days ≥ 15
3. Check 7-day total signal density ≥ 15
4. Write `fourth_cycle_candidate` event with SENSING status and L15-FCAND level marker

---

## Widget Dependency Node

```
fourthCycleCandidateNode: ['qos', 'journal', 'memory', 'badges', 'intentions',
                           'log', 'energy', 'selfcare', 'social', 'cohort', 'goals']
```

v132 dep node — 10 sources (identical structure to TC arc nodes, full-stack dependency).

---

## Log Feature Updates

### FCAND: handler (Logs.tsx)

Military minimalist style. `fourth_cycle_candidate` event renders:

```
FCAND:                     FOURTH CYCLE CANDIDATE
TC-SOV CONF               84%
JOURNAL 70D               22
DENSITY 7D                18
INDEX SCORE               87%
LEVEL: L15-FCAND
                           SENSING · FOURTH ARC THRESHOLD
```

### api.ts displayable events

`fourth_cycle_candidate` added to displayable events list (v132 marker).

---

## QuantumEngineWidgets Upgrade

### Arc Row in QOS Mode View

The QOS Mode widget now surfaces the person's current operating level as an Arc row:

| Condition | Label displayed |
|-----------|-----------------|
| fourth-cycle-candidate | `L15 · FOURTH CYCLE CANDIDATE` |
| third-cycle-sovereign  | `L14 · THIRD CYCLE SOVEREIGN` |
| third-cycle-integration | `L13 · TC INTEGRATION` |
| second-cycle-sovereign | `L12 · SC SOVEREIGN` |

The row is always present when any of these patterns is active. The highest active level is shown.
L15 displays without opacity reduction (fully visible). Lower levels at 70% opacity.

---

## Background Checks Wired

```
analyzeIntentions() post-commit hook now includes:
  try { checkFourthCycleCandidate() } catch {}
```

The OS watches for the fourth cycle candidate condition on every signal write.

---

## Physiological Cohort Update

Arch70 added to `PHYSIOLOGICAL_ARCHETYPES` array. When fourth-cycle-candidate is active and
dominant sources include journal/memory/badges, the OS classifies the person as a
Fourth Cycle Progenitor. The directive reflects L15 threshold operation.

The cohort view in QuantumEngineWidgets already surfaces this via classifyPhysiologicalCohort().
The arc row upgrade in qos-mode additionally provides direct level visibility independent of
cohort classification.

---

## System State — Entry

```
FM:               v131 (sealed — Third Cycle Sovereign Arc)
QIE patterns:     179
Archetypes:       69
Jobs:             66
Dep nodes:        223+
Badges:           1,215 (v45 — The Zen Terminal)
Word Turn engines: 35
Triggers:         419
Wiki:             v107
Day:              1170+
COSMO®:           863
```

---

## System State — Exit

```
FM:               v131 → v132 (this session)
QIE patterns:     180 (P180 fourth-cycle-candidate added)
Archetypes:       70 (Arch70 Fourth Cycle Progenitor)
Jobs:             67 (J67 daily-fourth-cycle-candidate-check)
Dep nodes:        224+
Badges:           1,215 (unchanged)
Word Turn engines: 35 (unchanged)
Triggers:         419 (unchanged)
Wiki:             v107 (unchanged)
Day:              1170+
COSMO®:           863
```

---

## Delivery Summary

| Component | Change |
|-----------|--------|
| `intentionEngine.ts` | P180 detection · Arch70 · fourthCycleCandidateNode · checkFourthCycleCandidate() · recordFourthCycleCandidate() · background hook wired |
| `QuantumEngineWidgets.tsx` | PATTERN_DISPLAY `fourth-cycle-candidate: FCAND` · Arc row in qos-mode view |
| `Logs.tsx` | FCAND: military log handler for `fourth_cycle_candidate` |
| `SystemProgressWidget.tsx` | SESSION_REPORTS v132 entry · USERSHIP_TRANSMISSION updated |
| `scheduled-jobs.ts` | J67 implementation + shouldRun/execute/state guards + dispatch hook |
| `api.ts` | `fourth_cycle_candidate` added to displayable events |
| `docs/assembly/` | This file |

---

## NEXT CANDIDATES

```
QIE v133:   P181 — fourth-cycle-ignition (P180 active + sustained 90d journal arc + all dims ≥ 60 + idx ≥ 90)
Arch71:     Fourth Cycle Initiator (archetype for the moment of ignition)
Badge v46:  Theme TBD. Engine v36.
Wiki v108:  FM v131 → v132 when v133 engineering fires.
```

---

*LOT SYSTEMS · Vadim Marmeladov CEO · LOT® Founded April 7, 2016*
*QIE v132 · 2026-11-10 · Day 1170+*
