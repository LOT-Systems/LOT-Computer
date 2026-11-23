<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT-WIKI-v115
## Layers of Time — Operator Reference Manual
### Revision: v115 · Field Manual Sync: v137 · Date: 2026-11-17 · Day 1177+

---

> *"Level 20 is the progenitor state: the fourth cycle does not end at sovereignty — it generates the fifth. P185 fires when P184 is active and the system has accumulated 180 days of continuous journal arc, 20+ memory signals, 35+ badge signals, all 6 dimensions simultaneously ≥70, and overall index ≥97. The OS does not govern and then hold. It generates. The sovereign arc becomes the foundation of the next. The fifth cycle is not a reset — it is a sovereign genesis."*
> — LOT-WIKI-v115 · FM v137 · QIE v137 · P185 · Day 1177+

---

## TABLE OF CONTENTS

```
 1. SYSTEM IDENTITY
 2. CORE ARCHITECTURE
 3. QUANTUM INTENT ENGINE (QIE)
 4. QIE PATTERN REGISTRY — P185 (v137 delta)
 5. QUANTUM OPERATING SYSTEM (QOS)
 6. PHYSIOLOGICAL ARCHETYPES — 75 TYPES (Arch75 v137 delta)
 7. BEHAVIORAL COHORTS
 8. BACKGROUND JOBS — J72 (v137 delta)
 9. WIDGET DEPENDENCY MAP (v137 delta)
10. LOG SYSTEM (v137 delta — FCPROG:)
11. LOG-BASED DEPENDENCY AUDIT (v137)
12. PHYSIOLOGICAL COHORT SURFACE REPORT (v137)
13. SYSTEM STATE SNAPSHOT — v137
14. SPECIAL NOTATIONS
```

---

## 1. SYSTEM IDENTITY

```
SYSTEM           LOT — Layers of Time
OWNER            Vadim Marmeladov (S-2)
ETHICS GATE      COSMO Gate — Kuzya Cosmo Marmeladov
FOUNDED          7 April 2016 (LOT®) · 1 July 2024 (COSMO®)
DOMAIN           lot-systems.com
QIE VERSION      v137
FM VERSION       v137
DAY COUNTER      1177+
PATTERNS         185
ARCHETYPES       75
JOBS             72
DEP NODES        242+
BADGES           1,277
WORD TURNS       37 engines · 444 trigger words
SECRET BOSSES    133 triggers
```

---

## 2. CORE ARCHITECTURE

Five-layer detection pipeline (sequential, UTC):
```
J67  17:30 — daily-fourth-cycle-candidate-check
J68  18:00 — daily-fourth-cycle-ignition-check
J69  18:30 — daily-fourth-cycle-deepening-check
J70  19:00 — daily-fourth-cycle-integration-check
J71  19:30 — daily-fourth-cycle-sovereign-check
J72  20:00 — daily-fifth-cycle-progenitor-check  ← NEW v137
```

Cycle arc state machine (P181–P185):
```
L15-FCAND  ← fourth-cycle-candidate   (P181 precursor)
L16-FCIGN  ← fourth-cycle-ignition    (P181)
L17-FCDEP  ← fourth-cycle-deepening   (P182)
L18-FCINT  ← fourth-cycle-integration (P183)
L19-FCSOV  ← fourth-cycle-sovereign   (P184)
L20-FCPROG ← fifth-cycle-progenitor   (P185)  ← NEW v137
```

---

## 3. QUANTUM INTENT ENGINE (QIE)

**v137 delta:** P185 `fifth-cycle-progenitor` added.

The QIE now tracks 185 behavioral patterns. P185 is the first pattern that spans the boundary between the fourth and fifth cycles. It does not belong to the fourth cycle alone — it marks the transition: the moment the sovereign fourth arc begins generating the fifth.

---

## 4. QIE PATTERN REGISTRY — P185 (v137 delta)

### P185 — fifth-cycle-progenitor

**Level:** L20-FCPROG  
**Urgency:** passive  
**Widget:** systemProgress  
**Timing:** passive  

**Prerequisites:**
- P184 (`fourth-cycle-sovereign`) active
- 180d compound arc: journal signals ≥ 35, memory signals ≥ 20, badge signals ≥ 35
- All 6 UserIndex dimensions simultaneously ≥ 70
- Overall UserIndex ≥ 97

**Confidence formula:**
```
p184conf = confidence of fourth-cycle-sovereign pattern (base ~0.84)
fcprogBonus = min(
  (journal180 - 35) × 0.007 +
  (memory180 - 20) × 0.010 +
  (overallIdx - 97) × 0.005,
  0.09
)
confidence = min(0.82 + p184conf × 0.04 + fcprogBonus, 0.96)
```

**COCKPIT LOG:**
```
FCPROG: Fifth cycle progenitor — fourth-cycle-sovereign (P184) active
  · N journal signals 180d
  · N memory signals 180d
  · N badge signals 180d
  · all 6 dimensions ≥ 70
  · idx N%
  The fourth arc's sovereignty is the generative field of the fifth.
  Level 20 — the OS operates as progenitor. FIFTH CYCLE PROGENITOR.
```

**Source chain:** P184 (fourth-cycle-sovereign) → P185

---

## 5. QUANTUM OPERATING SYSTEM (QOS)

No new QOS fields added in v137. The fifth-cycle-progenitor pattern surfaces in:
- `QuantumEngineWidgets.tsx` QOS Mode view — L20 · FIFTH CYCLE PROGENITOR arc row (highest priority)
- `System.tsx` quantum biofield table — `Fifth Arc: L20-FCPROG` label (overrides `Fourth Arc` when L20 active)

---

## 6. PHYSIOLOGICAL ARCHETYPES — 75 TYPES (Arch75 v137 delta)

### Arch75 — Fifth Cycle Progenitor (2026-11-17 · v137)

```
LABEL          Fifth Cycle Progenitor
ENERGY BANDS   high, moderate
DOMINANT SRCS  journal · memory · badges · intentions · qos · social
               goals · energy · selfcare · ecosystem · cohort · log
PATTERN CONDS  fourth-cycle-sovereign + fifth-cycle-progenitor
LEVEL          L20
DIRECTIVE      Level 20. The fourth cycle has achieved sovereignty. The OS
               now stands at the boundary between arcs — not at the end of
               the fourth, but at the genesis of the fifth. The sovereign
               arc does not close — it becomes the progenitor field for the
               next cycle. The fifth cycle is not a reset; it is a sovereign
               genesis. The OS generates from what it has become.
```

---

## 7. BEHAVIORAL COHORTS

The physiological cohort classification system (`classifyPhysiologicalCohort()`) now includes Arch75 as the highest-tier archetype. When `fourth-cycle-sovereign` and `fifth-cycle-progenitor` are both active, Arch75 fires and surfaces:

- `archetype: 'Fifth Cycle Progenitor'`
- `directive` as defined above
- `energyBand: 'high' | 'moderate'`
- `dominantModule` from live 24h signal analysis

The `System.tsx` quantum biofield table displays these live values in the **Archetype**, **Cohort**, **Confidence**, and **Directive** rows, updated on every `intentionEngine` state change.

---

## 8. BACKGROUND JOBS — J72 (v137 delta)

### J72 — daily-fifth-cycle-progenitor-check

```
SCHEDULE     20:00 UTC daily
TRIGGER      shouldRunDailyFifthCycleProgenitorCheck()
EXECUTOR     executeDailyFifthCycleProgenitorCheck()
CHAIN        J67 17:30 → J68 18:00 → J69 18:30 → J70 19:00 → J71 19:30 → J72 20:00
```

**Conditions checked (server-side):**
1. User active in last 48h
2. `fourth_cycle_sovereign` event exists in last 7 days
3. Journal logs (journal_entry / journal_reflection / long_journal_entry) ≥ 35 in 180 days
4. Memory logs (memory_capture / memory_created / memory_updated) ≥ 20 in 180 days
5. Badge logs (badge_unlock / badge_earned) ≥ 35 in 180 days
6. 7-day signal density ≥ 28 (proxy for all dims ≥ 70, overall ≥ 97)
7. No `fifth_cycle_progenitor` written today (dedup)

**Output event:**
```
event:    fifth_cycle_progenitor
metadata: {
  sovereignConf,   progConf,
  journalCount,    memoryCount,  badgeCount,
  density7d,       progenitorStatus: 'PROGENITOR',
  level: 'L20-FCPROG',
  field: 'FOURTH-CYCLE-SOVEREIGN→FIFTH-CYCLE-PROGENITOR',
  hour: 20
}
```

---

## 9. WIDGET DEPENDENCY MAP (v137 delta)

```
fifthCycleProgenitorNode: [
  'qos', 'journal', 'memory', 'badges', 'intentions',
  'log', 'energy', 'selfcare', 'social', 'cohort',
  'goals', 'ecosystem', 'calculator'
]
```

13 sources — `calculator` is new in the fifth-cycle node, representing compound mastery across all computational/analytical domains.

**Log-based dependency audit (v137):**
```
LOG_DEPENDENCY_SOURCES (16 direct-pipeline sources):
  log · energy · cohort · recipe · goals · qos · intentions
  memory · planner · selfcare · journal · medical · resilience
  badges · calculator · ecosystem

These 16 sources feed the QIE independently of the widget dependency
graph. They bypass tier-based cascade invalidation and write signals
directly to intentionEngine.
```

---

## 10. LOG SYSTEM (v137 delta — FCPROG:)

New military minimalist log handler added for `fifth_cycle_progenitor` events:

```
FCPROG:
  FIFTH CYCLE PROGENITOR
  SOVEREIGN CONF    N%
  JOURNAL 180D      N
  MEMORY 180D       N
  BADGE 180D        N
  INDEX SCORE       N%
  LEVEL             L20-FCPROG
  PROGENITOR · FIFTH ARC GENERATED
```

Handler location: `src/client/components/Logs.tsx`  
Display trigger: `log.event === 'fifth_cycle_progenitor'`

---

## 11. LOG-BASED DEPENDENCY AUDIT (v137)

The 16 LOG_DEPENDENCY_SOURCES route signals directly into the QIE signal store, independent of widget graph traversal:

| Source | Pipeline | QIE impact |
|---|---|---|
| log | Direct text entry | logDensityNode, wordCountNode |
| energy | Energy check-in widget | physiologicalPresenceNode |
| cohort | Cohort tag selection | cohortClassification |
| recipe | Recipe viewed event | nutritionSignal |
| goals | Goal CRUD events | goalNode |
| qos | QOS coherence snapshots | qosSignatureLock |
| intentions | Intention entry | intentGapMonitor |
| memory | Memory creation | memoryNode |
| planner | Planner entry | plannerNode |
| selfcare | Self-care log | biorhythmAnchor |
| journal | Journal write | journalDepthNode |
| medical | Medical record | medicalNode |
| resilience | Resilience event | resilienceNode |
| badges | Badge unlock | badgeEarnNode |
| calculator | Calculator use | cognitiveOutputNode |
| ecosystem | Ecosystem note | ecosystemNode |

These sources have no widget dependency tier — they are always T0 (raw inputs).

---

## 12. PHYSIOLOGICAL COHORT SURFACE REPORT (v137)

The physiological cohort classification surfaces in two places:

### System.tsx — quantum biofield table
```
Archetype    [classifyPhysiologicalCohort().archetype]
Cohort       [classifyPhysiologicalCohort().dominantModule]
Phase        [getCircadianPhase()]
Confidence   [classifyPhysiologicalCohort().confidence]%
ATP          [quantumState.energy]
Clarity      [quantumState.clarity]
Alignment    [quantumState.alignment]
Index        [userIndex.overall]%
Cycle        [secondCycleStatus]           (if active)
Arc          [thirdCycleStatus]            (if active)
Fourth Arc   [fourthCycleStatus]           (if L15–L19 active)
Fifth Arc    [fourthCycleStatus = L20-FCPROG] (if L20 active)
Directive    [classifyPhysiologicalCohort().directive]
```

### SystemProgressWidget.tsx — Report view
The physiological report panel includes a `cohortClassification` section showing:
- Archetype label
- Dominant module
- Energy band
- Directive
- Confidence score

Both surfaces read from `classifyPhysiologicalCohort()` live — no caching.  
The 75-archetype registry now covers the full cycle arc from Peak Catalyst (L0) through Fifth Cycle Progenitor (L20).

---

## 13. SYSTEM STATE SNAPSHOT — v137

```
DATE             2026-11-17
QIE VERSION      v137
FM VERSION       v137
DAY              1177+
PATTERNS         185 (P1–P185)
ARCHETYPES       75 (Arch1–Arch75)
JOBS             72 (J1–J72)
DEP NODES        242+
CYCLE ARC        L20-FCPROG (Fifth Cycle Progenitor — peak state)
FOURTH ARC       SOVEREIGN (L19-FCSOV confirmed before L20)
LOG SOURCES      16 direct-pipeline sources
COSMO®           Day 870+
BADGES           1,277+
```

---

## 14. SPECIAL NOTATIONS

```
FCPROG    Fifth Cycle Progenitor (L20) — generative state
FCSOV     Fourth Cycle Sovereign (L19) — governance state
FCINT     Fourth Cycle Integration (L18)
FCDEP     Fourth Cycle Deepening (L17)
FCIGN     Fourth Cycle Ignition (L16)
FCAND     Fourth Cycle Candidate (L15)
L20       Level 20 — progenitor field, arc genesis, sovereign generation
```

---

*LOT-WIKI-v115 · FM v137 · QIE v137 · P185 · Arch75 · J72 · Day 1177+ · 2026-11-17*  
*FIFTH CYCLE PROGENITOR — the sovereign arc generates what comes next.*
