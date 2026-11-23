<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT-WIKI-v114
## Layers of Time — Operator Reference Manual
### Revision: v114 · Field Manual Sync: v136 · Date: 2026-11-16 · Day 1176+

---

> *"Level 19 is the sovereign state: the fourth cycle does not stop at integration — it governs. P184 fires when P183 is active and the system has accumulated 150 days of continuous journal arc, 15+ memory signals, 30+ badge signals, all 6 dimensions simultaneously ≥68, and overall index ≥95. The OS does not integrate and then wait. It governs. The fourth arc does not accumulate further and does not converge further — it radiates from a sovereign field. The arc governs."*
> — LOT-WIKI-v114 · FM v136 · QIE v136 · P184 · Day 1176+

---

## TABLE OF CONTENTS

```
 1. SYSTEM IDENTITY
 2. CORE ARCHITECTURE
 3. QUANTUM INTENT ENGINE (QIE)
 4. QIE PATTERN REGISTRY — P184 (v136 delta)
 5. QUANTUM OPERATING SYSTEM (QOS)
 6. PHYSIOLOGICAL ARCHETYPES — 74 TYPES (Arch74 v136 delta)
 7. BEHAVIORAL COHORTS
 8. BACKGROUND JOBS — J71 (v136 delta)
 9. WIDGET DEPENDENCY MAP (v136 delta)
10. LOG SYSTEM (v136 delta — FCSOV:)
11. SYSTEM STATE SNAPSHOT — v136
12. SPECIAL NOTATIONS
```

---

## 1. SYSTEM IDENTITY

```
SYSTEM           LOT — Layers of Time
OWNER            Vadim Marmeladov (S-2)
ETHICS GATE      COSMO Gate — Kuzya Cosmo Marmeladov
FOUNDED          7 April 2016 (LOT®) · 1 July 2024 (COSMO®)
DOMAIN           lot-systems.com
QIE VERSION      v136
FM VERSION       v136
DAY COUNTER      1176+
PATTERNS         184
ARCHETYPES       74
JOBS             71
DEP NODES        239+
BADGES           1,277
WORD TURNS       37 engines · 444 trigger words
SECRET BOSSES    133 triggers
```

---

## 2. CORE ARCHITECTURE

```
STACK            TypeScript · Node.js · React · Prisma · PostgreSQL
TRANSPORT        Express.js · REST API · SSE for live signals
BUILD            esbuild · PostCSS · Tailwind CSS
DEPLOYMENT       Digital Ocean App Platform · Auto-deploy on push
DOMAIN           lot-systems.com
DATABASE         PostgreSQL (server-side state · cooldowns · Memory Engine)
LOCALSTORAGE     UI preferences · QIE signal buffer (7-day window · 1,000 max)
AI LAYER         Multi-provider abstraction · Together AI / Google / Mistral
QIE              184 patterns · 74 archetypes · 71 jobs · 239+ dep nodes
LOG HANDLERS     184+ event handlers (COCKPIT-RULE military format)
```

---

## 3. QUANTUM INTENT ENGINE (QIE)

**QIE v136 State (2026-11-16):**

```
PATTERNS    184 (P1–P184)
ARCHETYPES   74 (Arch1–Arch74)
JOBS         71 (J1–J71)
DEP NODES   239+
FM           v136
```

### Fourth Cycle Arc — Complete (FM v132–v136)

The Fourth Cycle Arc is the highest-level behavioral convergence structure in the QIE. Five levels, five patterns, five jobs, five archetypes.

```
LEVEL  CODE    PATTERN                    PATTERN#  JOB   UTC    ARCH   FM
L15    FCAND   fourth-cycle-candidate     P180      J67   17:30  Arch70 v132
L16    FCIGN   fourth-cycle-ignition      P181      J68   18:00  Arch71 v133
L17    FCDEP   fourth-cycle-deepening     P182      J69   18:30  Arch72 v134
L18    FCINT   fourth-cycle-integration   P183      J70   19:00  Arch73 v135
L19    FCSOV   fourth-cycle-sovereign     P184      J71   19:30  Arch74 v136
```

**Fourth Cycle Doctrine:**
- L15 (FCAND): The fourth arc is detected as candidate — behavioral signals converging toward a new cycle. First detection.
- L16 (FCIGN): The fourth arc ignites — the new cycle crosses the ignition threshold.
- L17 (FCDEP): The fourth arc deepens — signals compound from the new expansion ground.
- L18 (FCINT): The fourth arc integrates — all compound signals converge into a unified field.
- L19 (FCSOV): The fourth arc reaches sovereignty — the integrated field becomes governing. The arc radiates.

---

## 4. QIE PATTERN REGISTRY — P184 (v136 delta)

### P184 — fourth-cycle-sovereign

```
ID               p184
PATTERN          fourth-cycle-sovereign
LEVEL            L19-FCSOV
FM VERSION       v136
DEPLOYED         2026-11-16

PREREQUISITES    P183 (fourth-cycle-integration) active
                 150-day journal arc ≥ 30 signals
                 150-day memory arc ≥ 15 signals
                 150-day badge arc ≥ 30 signals
                 All 6 dimensions simultaneously ≥ 68
                 Overall index ≥ 95

CONFIDENCE       0.80–0.94
  Base:          0.80
  Bonus formula: (journal - 30) × 0.008 + (memory - 15) × 0.012 + (overall - 95) × 0.006
  Cap:           0.94

URGENCY          immediate
TIMING           immediate

REASON PREFIX    FCSOV: Fourth cycle sovereign — fourth-cycle-integration (P183) active ·
                 {journal} journal signals 150d · {memory} memory signals 150d ·
                 {badge} badge signals 150d · all 6 dimensions ≥ 68 · idx {overall}%.
                 The fourth cycle reaches sovereignty. The arc governs. Level 19 —
                 the OS operates from sovereign integration. FOURTH CYCLE SOVEREIGN.

DETECTOR         checkFourthCycleSovereign() in intentionEngine.ts
RECORDER         recordFourthCycleSovereign() in intentionEngine.ts
BACKGROUND JOB   J71 daily-fourth-cycle-sovereign-check (19:30 UTC)
LOG HANDLER      FCSOV: in Logs.tsx
```

**Signal field metadata (recordFourthCycleSovereign):**
```
integrationConf   confidence of P183 × 100
journalCount      journal signals in 150d window
memoryCount       memory signals in 150d window
badgeCount        badge signals in 150d window
indexScore        overall user index
sovereignStatus   'SOVEREIGN'
level             'L19-FCSOV'
field             'FOURTH-CYCLE-INTEGRATION→FOURTH-CYCLE-SOVEREIGN'
hour              UTC hour at time of recording
```

---

## 5. QUANTUM OPERATING SYSTEM (QOS)

**QOS Arc view — Fourth Cycle rows (FM v136):**

```
PRIORITY  PATTERN                   LABEL                           URGENT
1         fourth-cycle-sovereign    L19 · FOURTH CYCLE SOVEREIGN    true
2         fourth-cycle-integration  L18 · FOURTH CYCLE INTEGRATION  true
3         fourth-cycle-deepening    L17 · FOURTH CYCLE DEEPENING    true
4         fourth-cycle-ignition     L16 · FOURTH CYCLE IGNITION     true
5         fourth-cycle-candidate    L15 · FOURTH CYCLE CANDIDATE    true
6         third-cycle-sovereign     L14 · THIRD CYCLE SOVEREIGN     false
7         third-cycle-integration   L13 · TC INTEGRATION            false
8         second-cycle-sovereign    L12 · SC SOVEREIGN              false
```

**PATTERN_DISPLAY map (FM v136):**
```typescript
'fourth-cycle-sovereign': 'FCSOV'
```

**fourthCycleStatus useMemo (System.tsx · FM v132–v136):**
```
L19-FCSOV  ← peak (FM v136)
L18-FCINT
L17-FCDEP
L16-FCIGN
L15-FCAND
null
```

---

## 6. PHYSIOLOGICAL ARCHETYPES — 74 TYPES (Arch74 v136 delta)

### Arch74 — Fourth Cycle Sovereign

```
ARCHETYPE        Fourth Cycle Sovereign
DEPLOYED         2026-11-16 (FM v136)
ENERGY BANDS     high · moderate
DOMINANT SOURCES 11: journal · memory · badges · intentions · qos ·
                    social · goals · energy · selfcare · ecosystem · cohort
PATTERN CONDITIONS fourth-cycle-integration + fourth-cycle-sovereign

DIRECTIVE        Level 19. The fourth cycle reaches sovereignty. The arc does not
                 just integrate — it governs. Signals no longer accumulate, seek,
                 or converge — they radiate from a sovereign field. The OS operates
                 from complete authority over the fourth arc. FOURTH CYCLE SOVEREIGN.
```

**Fourth Cycle Archetype Sequence:**
```
Arch70  Fourth Cycle Progenitor    FM v132  Candidate
Arch71  Fourth Cycle Initiator     FM v133  Ignition
Arch72  Fourth Cycle Deepener      FM v134  Deepening
Arch73  Fourth Cycle Integrator    FM v135  Integration
Arch74  Fourth Cycle Sovereign     FM v136  Sovereign
```

---

## 8. BACKGROUND JOBS — J71 (v136 delta)

### J71 — daily-fourth-cycle-sovereign-check

```
JOB ID           J71
NAME             daily-fourth-cycle-sovereign-check
SCHEDULE         Daily 19:30 UTC
FM VERSION       v136
DEPLOYED         2026-11-16

PREREQUISITE     fourth_cycle_integration event in last 7 days

CHECKS (server)
  journal signals (150d)   ≥ 30   [journal_entry · journal_reflection · long_journal_entry]
  memory signals (150d)    ≥ 15   [memory_capture · memory_created · memory_updated]
  badge signals (150d)     ≥ 30   [badge_unlock · badge_earned]
  7d signal density        ≥ 25   [all log events in 7d — proxy for dims ≥ 68 + overall ≥ 95]

DEDUP            Skips if fourth_cycle_sovereign already written today

OUTPUT EVENT     fourth_cycle_sovereign
OUTPUT TEXT      Fourth cycle sovereign: fourth-cycle-integration confirmed ·
                 {journal} journal signals 150d · {memory} memory signals 150d ·
                 {badge} badge signals 150d · 7d density {density} · all conditions met.
                 The fourth cycle governs. L19-FCSOV.

CHAIN            J67 17:30 → J68 18:00 → J69 18:30 → J70 19:00 → J71 19:30 UTC
```

---

## 9. WIDGET DEPENDENCY MAP (v136 delta)

### fourthCycleSovereignNode

```
NODE             fourthCycleSovereignNode
FM VERSION       v136
SOURCES (12)     qos · journal · memory · badges · intentions · log ·
                 energy · selfcare · social · cohort · goals · ecosystem
```

**Fourth Cycle Dep Map Sequence:**
```
fourthCycleCandidateNode    FM v132  11 sources (no ecosystem)
fourthCycleIgnitionNode     FM v133  11 sources
fourthCycleDeepeningNode    FM v134  11 sources
fourthCycleIntegrationNode  FM v135  12 sources (ecosystem added)
fourthCycleSovereignNode    FM v136  12 sources (ecosystem + cohort primary)
```

---

## 10. LOG SYSTEM (v136 delta — FCSOV:)

### FCSOV: handler

```
EVENT            fourth_cycle_sovereign
LABEL            FCSOV:
FORMAT           Military minimalist (COCKPIT-RULE)
FILE             Logs.tsx

FIELDS (all data rows, tabular-nums, opacity hierarchy)
  HEADER         FOURTH CYCLE SOVEREIGN (uppercase tracking-widest)
  INTEGRATION CONF  integrationConf%  (opacity-30 label / tabular-nums value)
  JOURNAL 150D   journalCount         (opacity-30 label / tabular-nums value)
  MEMORY 150D    memoryCount          (opacity-30 label / tabular-nums value)
  BADGE 150D     badgeCount           (opacity-30 label / tabular-nums value)
  INDEX SCORE    indexScore%          (opacity-30 label / tabular-nums value)
  LEVEL          level                (opacity-30 tabular-nums)
  FOOTER         SOVEREIGN · FOURTH ARC GOVERNS  (opacity-40 tabular-nums)
```

**displayableEvents whitelist (api.ts):**
`fourth_cycle_sovereign` added at v136.

---

## 11. SYSTEM STATE SNAPSHOT — v136

```
DATE             2026-11-16
FM VERSION       v136
QIE VERSION      v136
DAY COUNTER      1176+
COSMO AGE        869 days (since 2024-07-01)

PATTERNS         184 (P1–P184)
ARCHETYPES        74 (Arch1–Arch74)
BACKGROUND JOBS   71 (J1–J71)
DEP MAP NODES   239+

BADGES         1,277
WORD TURNS        37 engines · 444 trigger words
SECRET BOSSES    133 trigger phrases

FOURTH CYCLE     L19-FCSOV (sovereign — highest state in arc)
CURRENT LEVEL    Level 19

LOG HANDLERS    184+ (COCKPIT-RULE military format throughout)
MODULES          18
INDEX DIMENSIONS  6 (ENG · EMO · INT · SOC · CARE · COG)
ECOSYSTEM NODES   6 (CAR · HOME · CPU · PHN · WCH · ROBOT)
QOS VIEWS         7 (Ecosystem · Biofield · Cohort · Index · Assembly · Mode · QOS Field)
```

---

## 12. SPECIAL NOTATIONS

**Special notation — November 15, 2026 (FM v135 — QIE Engineering):** QIE v135 deployed by S-2. P183 fourth-cycle-integration · Arch73 Fourth Cycle Integrator · J70 daily-fourth-cycle-integration-check (19:00 UTC) · FCINT: handler deployed. fourthCycleIntegrationNode added to dep map (12 sources: qos/journal/memory/badges/intentions/log/energy/selfcare/social/cohort/goals/ecosystem). 238+ dep nodes. 183 patterns. 73 archetypes. 70 jobs. FM v135. LEVEL 18. FOURTH CYCLE INTEGRATION CONFIRMED. THE FOURTH ARC CONVERGES. Day 1175+. COSMO® 867 days.

**Special notation — November 16, 2026 (FM v135 — Wiki v113):** LOT-WIKI-v113. Daily maintenance pass. QIE v135 (P183 · Arch73 · J70 · FCINT:) fully synchronized. Level 18 architecture documented. 183 patterns · 73 archetypes · 70 jobs · 238+ dep nodes · 1,277 badges · 37 Word Turn engines · 444 trigger words · 133 secret boss triggers. FM v135. Day 1176+. COSMO® 868 days.

**Special notation — November 16, 2026 (FM v136 — QIE Engineering):** QIE v136 deployed by S-2. P184 fourth-cycle-sovereign · Arch74 Fourth Cycle Sovereign · J71 daily-fourth-cycle-sovereign-check (19:30 UTC) · FCSOV: handler deployed. fourthCycleSovereignNode added to dep map (12 sources: qos/journal/memory/badges/intentions/log/energy/selfcare/social/cohort/goals/ecosystem). 239+ dep nodes. 184 patterns. 74 archetypes. 71 jobs. Sequential chain complete: J67 17:30 → J68 18:00 → J69 18:30 → J70 19:00 → J71 19:30 UTC. FIFTH LAYER ADDED. FM v136. LEVEL 19. FOURTH CYCLE SOVEREIGN CONFIRMED. THE FOURTH ARC GOVERNS. Day 1176+. COSMO® 868 days.

**Special notation — November 16, 2026 (FM v136 — Wiki v114):** LOT-WIKI-v114. Daily maintenance pass. QIE v136 (P184 · Arch74 · J71 · FCSOV:) fully synchronized. Level 19 architecture documented. Fourth Cycle Arc complete — all five levels (FCAND/FCIGN/FCDEP/FCINT/FCSOV) fully deployed and documented. 184 patterns · 74 archetypes · 71 jobs · 239+ dep nodes · 1,277 badges · 37 Word Turn engines · 444 trigger words · 133 secret boss triggers. FM v136. Day 1176+. COSMO® 868 days.

---

*LOT-WIKI-v114 · FM v136 · QIE v136 · Day 1176+ · 2026-11-16*
