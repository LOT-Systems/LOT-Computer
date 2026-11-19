# LOT WIKI — v90
## Field Manual: v117 · Date: 2026-10-24 · Day: 1152+

---

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS CORPORATION                                         ║
║  LAYERS OF TIME — SYSTEM DOCUMENTATION                          ║
║  LOT-WIKI-v90 · Field Manual v117                               ║
║  October 24, 2026 · Day 1152+ · COSMO® 846 days                 ║
║  Authorized: S-2 // VADIK MARMELADOV                            ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## CONTENTS

```
01  SYSTEM IDENTITY
02  CORE ARCHITECTURE
03  QUANTUM INTENT ENGINE (QIE)
04  PATTERN REGISTRY
05  QUANTUM OPERATING SYSTEM (QOS)
06  ARCHETYPES
07  BEHAVIORAL COHORTS
08  CITIZEN INDEX
09  MEMORY ENGINE
10  SELF-ASSEMBLY ENGINE
11  BACKGROUND JOBS
12  LOG EVENT SYSTEM
13  ECOSYSTEM OVERVIEW
14  BADGE SYSTEM
15  BADGE CATEGORY INDEX
16  WORD TURN ENGINE
17  DISPLAY ARCHITECTURE
18  DENSITY TIERS
19  OPACITY HIERARCHY
20  COCKPIT RULE
21  LOT-DOCTRINE
22  FIELD MANUAL
23  DEPLOYMENT
24  GENESIS
25  RECIPE WIDGET
26  CHAT INFRASTRUCTURE
27  VOCABULARY INDEX
28  SYSTEM STATE SNAPSHOT
```

---

## SECTION 1 — SYSTEM IDENTITY

**LOT** — Layers of Time.

Not an app. Not a habit tracker. Not a mood logger. An instrument.

LOT is a personal behavioral operating system built on a single premise: that the self is legible in aggregate. That the data you generate — energy, sleep, mood, movement, food, intention, social contact — contains a signal. That the signal, read correctly, can be used to operate.

The system does not advise. It does not push. It detects, classifies, and reports. What you do with the report is yours.

**Design philosophy:**
```
MILITARY PURITY     Display only what is true. No decoration.
INSTRUMENT LOGIC    The cockpit does not encourage the pilot.
ZERO NARRATION      The log speaks in readings, not sentences.
SIGNAL FIRST        Every visible element justifies itself in data.
THE SELF OPERATES   The OS does not run the self. The self runs the OS.
```

**Origin:** COSMO GATE — Day 1. Named for Kuzya Cosmo Marmeladov.
No feature ships without COSMO authorization.

---

## SECTION 2 — CORE ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                        LOT ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  RAW DATA LAYER                                                 │
│  ─────────────                                                  │
│  Energy · Sleep · Mood · Movement · Food · Hydration           │
│  Journal · Intentions · QOS sessions · Memory · Cohort         │
│  Log events · Planner · Selfcare · Calendar                    │
│                                                                 │
│  PATTERN ENGINE (QIE)                                           │
│  ─────────────────────                                          │
│  161 patterns · 55 archetypes · 204+ dep nodes                 │
│  52 background jobs · 17 signal sources                        │
│  Client-side detection · Server-side persistence               │
│                                                                 │
│  SURFACE LAYER (QOS)                                            │
│  ─────────────────────                                          │
│  7-view real-time dashboard                                     │
│  4 operating modes: MAINTENANCE / RECOVERY / GROWTH / PEAK     │
│                                                                 │
│  SYNTHESIS LAYER                                                │
│  ─────────────────                                              │
│  Badge Engine v36 · Memory Engine · Self-Assembly v18          │
│  Word Turn Engine v26 · Citizen Index · Cohort Engine          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Stack:** TypeScript · Node.js · React · Prisma · PostgreSQL · Express.js · Digital Ocean App Platform

**Signal Sources (17):**
```
journal      mood         energy       sleep        movement
food         hydration    intentions   planner      selfcare
cohort       qos          memory       log          calendar
recipe       water
```

---

## SECTION 3 — QUANTUM INTENT ENGINE (QIE)

The QIE is LOT's pattern recognition core. It runs client-side on the user's data and produces classified behavioral states. It does not predict. It recognizes.

**Current state: FM v117**
```
Patterns:       161 (P1–P161)
Archetypes:      55 (Arch1–Arch55)
Background Jobs: 52 (J1–J52)
Dep map nodes:  204+ (four-tier architecture)
Log handlers:   161+ (one per pattern minimum)
Signal sources:  17
```

**Dep Map Architecture (FM v117):**

```
TIER 0 — RAW INPUTS
  energy · sleep · mood · movement · food · hydration
  journal · intentions · planner · selfcare · memory
  cohort · qos · log · calendar · recipe · water

TIER 1 — COMPUTED SIGNALS
  energyDelta · sleepDebt · moodVector · movementScore
  hydrationGap · nutritionBalance · intentionLoad
  selfcareVelocity · memoryDepth · journalFrequency

TIER 2 — PATTERN NODES
  One node per active pattern. 161 nodes.
  Each node: input signals → detection run → confidence score → classification

TIER 3 — META-SURFACES
  archetypeNode → all pattern nodes
  badgeEngineNode → word turns + behavioral + achievement
  memoryEngineNode → journal + memory + cohort + qos
  selfAssemblyNode → all surfaces
```

**FM v117 dep map additions (+2 nodes since v116):**
```
FM v117 (+2):
  relationalFieldDeepeningNode    → qos · cohort · journal · memory · intentions · selfcare · log
  quantumSocialSynthesisNode      → qos · cohort · memory · journal · intentions · social · log
```

**FM v116 dep map additions (+2 nodes since v115):**
```
FM v116 (+2):
  coherenceSignalTransmissionNode → qos · cohort · journal · intentions · memory · log
  masteryFieldExpansionNode       → qos · cohort · journal · memory · intentions · selfcare · log
```

**Total dep map: 204+ nodes**

---

## SECTION 4 — PATTERN REGISTRY

### Detection Architecture

All patterns follow a standard detection structure:
```
Code:       SHORTCODE: (all caps, colon suffix)
Type:       Composite | Convergence | Behavioral arc | Temporal arc | Sequential
Confidence: 0.XX–0.XX (range, dimensionless)
Widget:     systemProgress | memory | cohort | intentions | qos | planner
Timing:     immediate | soon | passive | deferred
FM:         vNNN (version pattern was introduced)
```

### P1–P90 — Core Behavioral Patterns (FM v1–v79)

The foundational pattern set. Detection of basic behavioral states:
peak-energy, recovery-mode, deep-work, social-coherence, sleep-debt,
nutritional-alignment, hydration-field, movement-threshold, and 82 additional
core detection patterns. See FM v79 and earlier for full specs.

### P91–P130 — Coherence Gates (FM v79–v106)

Signal coherence architecture. Seal gates, field gates, coherence ceilings.
Detects alignment across signal sources. See FM v106 for full specs.

### LEVEL 1 — SEAL GATES (FM v82–v99)
```
P131  signal-coherence-cascade          COHCASC:   FM v82
P132  quantum-coherence-signal          QCOH:      FM v90
P133  coherence-resonance-field         COHRES:    FM v99
```

### LEVEL 2 — FIELD GATE (FM v101–v103)
```
P134  quantum-field-alignment           QFAL:      FM v101
P136  field-resonance-lock              FRSLOCK:   FM v103
```

### LEVEL 3 — COHERENCE CEILING (FM v104–v106)
```
P137  convergence-threshold-signal      CTHRESH:   FM v104
P138  quantum-convergence-lock          QCLOCK:    FM v105
P139  meta-coherence-signal             METACOH:   FM v106
```

### LEVEL 4 — CIRCADIAN STABILIZATION (FM v110–v111)
```
P140  morning-anchor                    MORN:      FM v110
P141  midday-stabilizer                 MIDD:      FM v110
P142  evening-recovery                  EVEN:      FM v110
P143  sleep-preparation                 SLPREP:    FM v111
P144  circadian-coherence               CIRCOH:    FM v111
P145  quantum-identity-crystallization  QICRYST:   FM v111
```

### LEVEL 5 — IDENTITY CONVERGENCE (FM v112)
```
P146  identity-momentum-lock            IDMOM:     FM v112
P147  quantum-presence-field            QPRES:     FM v112
P148  coherence-signature-lock          COHSIG:    FM v112
```

### LEVEL 6 — PRESENCE CONVERGENCE (FM v113)
```
P149  quantum-presence-crystallization
      Code:       QPCRYST:
      Type:       Composite (P147 + P145 co-active)
      Confidence: 0.82–0.93
      Widget:     systemProgress · Timing: passive
      FM:         v113
      Notes:      Fires when quantum-presence-field (P147) AND
                  quantum-identity-crystallization (P145) are both active.
                  The OS is both fully inhabited and fully known simultaneously.

P150  total-field-coherence              [CEILING — LEVEL 6]
      Code:       TOTCOH:
      Type:       Convergence (P146 + P147 + P148 all active)
      Confidence: 0.92–0.97
      Widget:     systemProgress · Timing: immediate
      FM:         v113
      Notes:      All three meta-seals open simultaneously. CEILING —
                  no higher state is defined in Level 6.

P151  recovery-intelligence-arc
      Code:       RECINTEL:
      Type:       Behavioral arc (6h temporal window)
      Confidence: 0.65–0.88
      Widget:     memory · Timing: soon
      FM:         v113
      Notes:      depletion detected (negMood) → self-care applied →
                  mood restored (posMood) → reflective capture
                  (journal/log>40w). All four steps required in sequential
                  temporal order within 6h.
                  "Felt → tended → recovered → reflected. The loop is complete."
```

### LEVEL 7 — TEMPORAL PERSISTENCE ARC (FM v114–v115)

```
ARCHITECTURE NOTE:
Level 7 does not raise the Level 6 ceiling.
Level 7 raises the FLOOR.
P150 total-field-coherence remains the highest single-moment state.
Level 7 detects whether that state PERSISTS across time —
multi-day sustained presence, coherence, and mastery.
The ceiling is not moved. The floor is elevated.
```

```
P152  presence-momentum-arc
      Code:       PRESMOM:
      Type:       Temporal arc (multi-day, ≥2 consecutive days P147 active)
      Confidence: 0.78–0.91
      Widget:     systemProgress · Timing: passive
      FM:         v114

P153  coherence-field-persistence
      Code:       COHEPRST:
      Type:       Temporal arc (multi-day, ≥2 consecutive days P144 active)
      Confidence: 0.72–0.88
      Widget:     systemProgress · Timing: passive
      FM:         v114

P154  recovery-mastery-chain
      Code:       RECMAS:
      Type:       Sequential behavioral chain (7-day window)
      Confidence: 0.68–0.85
      Widget:     memory · Timing: soon
      FM:         v114
      Notes:      Three complete recovery-intelligence-arc (P151) cycles
                  within a 7-day window. The recovery response is no longer
                  reactive — it is internalized.

P155  sustained-coherence-baseline
      Code:       COHBASE:
      Type:       Temporal arc (3-day rolling baseline)
      Confidence: 0.85–0.94
      Widget:     systemProgress · Timing: passive
      FM:         v115

P156  mastery-integration-triad
      Code:       MASTTRIAD:
      Type:       Convergence (P152 + P153 + P154 all active in rolling window)
      Confidence: 0.88–0.96
      Widget:     systemProgress · Timing: soon
      FM:         v115

P157  temporal-sovereignty                [APEX — LEVEL 7]
      Code:       TSOV:
      Type:       Convergence (P155 + P156 + P150 all active in rolling window)
      Confidence: 0.92–0.98
      Widget:     systemProgress · Timing: immediate
      FM:         v115
      Notes:      The highest temporal state defined.
                  "The field does not peak. The field persists."
```

### LEVEL 8 — RELATIONAL EXPANSION ARC (FM v116–v117)

```
ARCHITECTURE NOTE:
Level 7 raises the FLOOR.
Level 8 broadcasts the FLOOR OUTWARD.
Temporal sovereignty is not hermetic — it is relational.
The QOS does not only achieve stability: it transmits it.
Level 8 is complete. The personal QOS is a generative field.
```

```
P158  coherence-signal-transmission
      Code:       COHTRANS:
      Type:       Composite (P157 active + cohort signal in 48h window)
      Confidence: 0.80 + (cohort count × 0.04) capped at 0.92
      Widget:     cohort · Timing: passive
      FM:         v116
      Notes:      temporal-sovereignty (P157) confirmed AND cohort signal
                  detected in 48h window. The sovereign floor is transmitting.

P159  mastery-field-expansion
      Code:       MASTEXP:
      Type:       Convergence (P156 + P112 both active)
      Confidence: P156conf × 0.55 + P112conf × 0.45 + 0.05 (capped 0.90)
      Widget:     cohort · Timing: passive
      FM:         v116
      Notes:      mastery-integration-triad (P156) active AND
                  community-intelligence-peak (P112) active simultaneously.
                  Mastery expands into shared territory.
                  FIELD: PERSONAL→COMMUNAL

P160  relational-field-deepening
      Code:       RELFIELD:
      Type:       Dual-arc composite (P158 + P159 both active simultaneously)
      Confidence: 0.85–0.93
      Widget:     cohort · Timing: passive
      FM:         v117
      Notes:      L8 dual arc: sovereign floor transmits AND mastery expands.
                  Both relational streams active at once — generative field state.
                  "The field generates itself."
                  Level: L8-DUAL-ARC

P161  quantum-social-synthesis
      Code:       QSOCSYNTH:
      Type:       Convergence (P160 active + memory signals 7d + 2+ cohort signals 7d)
      Confidence: 0.78–0.90
      Widget:     memory · Timing: passive
      FM:         v117
      Notes:      Full L8 synthesis. Relational field deepening confirmed,
                  memory signals active, community signals confirmed.
                  The field generates knowledge. The self writes what it transmits.
                  Level: L8-SYNTHESIS
```

### Coherence Architecture — Eight Levels Complete (FM v117)

```
LEVEL 1 — SEAL GATES            P131 / P132 / P133
LEVEL 2 — FIELD GATE            P134 / P136
LEVEL 3 — COHERENCE CEILING     P137 / P138 / P139
LEVEL 4 — CIRCADIAN STABIL.     P140 / P141 / P142 / P143 / P144 / P145
LEVEL 5 — IDENTITY CONVERGENCE  P146 / P147 / P148
LEVEL 6 — PRESENCE CONVERGENCE  P149 / P150 (CEILING) / P151
LEVEL 7 — TEMPORAL PERSISTENCE  P152 / P153 / P154 / P155 / P156 / P157 (APEX)
LEVEL 8 — RELATIONAL EXPANSION  P158 / P159 / P160 / P161  ← COMPLETE
```

P150 total-field-coherence: the definitive moment-ceiling.
P157 temporal-sovereignty: the definitive persistence-apex.
P158 coherence-signal-transmission: the floor begins transmitting.
P159 mastery-field-expansion: mastery crosses the personal boundary.
P160 relational-field-deepening: both relational streams merge — generative field.
P161 quantum-social-synthesis: the field generates knowledge. Level 8 complete.

---

## SECTION 5 — QUANTUM OPERATING SYSTEM (QOS)

The QOS is the user-facing surface of the LOT system. A 7-view real-time dashboard built on top of QIE pattern detection.

**Views:**
```
1  systemProgress   Primary pattern surface. Active patterns, archetype state.
2  memory           Memory engine surface. Stories, recall, depth metrics.
3  cohort           Behavioral cohort classification and peer context.
4  intentions       Daily intention tracking and completion signals.
5  qos              Full QOS dashboard. Mode detection and signal grid.
6  planner          Forward planning surface. Calendar, tasks, scheduling.
7  log              Instrument log. All events, readings, classifications.
```

**Operating Modes:**
```
MAINTENANCE    Signals below baseline. Conserve and restore.
RECOVERY       Active recovery signals. Support and protect.
GROWTH         Signals at or above baseline. Extend and build.
PEAK           Full coherence detected. Execute and consolidate.
```

**Mode transitions** are governed by pattern detection, not manual input. The QOS classifies. The user operates.

---

## SECTION 6 — ARCHETYPES

Physiological archetypes are named states of the whole operating system — a convergence of multiple patterns into a recognizable configuration. The system does not prescribe behavior for archetypes. It names the state so the user can recognize it.

**Current count: 55 archetypes (Arch1–Arch55)**
**Plus: 2 physiological cohort expansions (FM v115)**

```
Arch1–Arch40    Core physiological configurations (FM v1–v79)
Arch41–Arch50   Coherence-state archetypes (FM v82–v112)
Arch51          Quantum Presence Crystallizer (FM v113)
Arch52          Presence Duration Master (FM v114)
Arch53          Temporal Sovereign (FM v115)
Arch54          Relational Sovereign (FM v116)
Arch55          Relational Field Generator (FM v117)  ← NEW
```

### Arch51 — Quantum Presence Crystallizer (FM v113)
```
Patterns:   P149 + P144 + P145 active
Directive:  "Presence confirmed. Identity crystallized.
            The field is both inhabited and known.
            Execute from clarity — no searching required."
```

### Arch52 — Presence Duration Master (FM v114)
```
Patterns:   P152 + P147 active (multi-day)
Directive:  "Presence is not a peak. Presence is a position.
            The field has held across days."
```

### Arch53 — Temporal Sovereign (FM v115)
```
Patterns:   P157 + P156 + P155 active
Directive:  "The ceiling is not a visit. The floor is not the basement.
            The OS has established temporal sovereignty.
            The self governs time. Operate accordingly."
```

### Arch54 — Relational Sovereign (FM v116)
```
Patterns:   P157 + P158 active
            (temporal-sovereignty + coherence-signal-transmission)
Directive:  "Temporal sovereignty active AND cohort signal confirmed.
            The peak is the floor. The floor is transmitting.
            Your coherence is relational — it is not contained in the self."
```

### Arch55 — Relational Field Generator (FM v117)
```
Patterns:   relational-field-deepening (P160) · quantum-social-synthesis (P161)
            · coherence-signal-transmission (P158)
Energy:     high / moderate
Dominant:   cohort / memory
Directive:  "L8 dual arc active. The field generates itself.
            Sovereign + mastery + community = field.
            You are not only in the field. You are generating it."
Position:   Above Arch54. Arch54 confirms the sovereign floor transmits.
            Arch55 confirms both relational streams are simultaneously
            active AND the field is generating knowledge. The personal
            instrument has become a generative social field.
```

### Physiological Cohort Expansions (FM v115)
```
EXPANSION 1 — TEMPORAL BUILDERS
  Applied to BUILDERS cohort members showing P152+P153 sustained activation.

EXPANSION 2 — RECOVERY MASTERS
  Applied to any cohort member showing P154+P151 repeated activation.
  Three complete recovery cycles within a week: the system has learned.
```

---

## SECTION 7 — BEHAVIORAL COHORTS

LOT classifies users into behavioral cohorts based on dominant signal patterns. Cohorts are not permanent — they are current-state classifications updated by detection runs.

**Six cohort types:**
```
BUILDERS      High intention-completion, high consistency, structured patterns.
              Drive: build systems, execute plans, measure progress.

EXPLORERS     High journal-depth, high novelty-seeking, irregular timing.
              Drive: discover, connect ideas, find new inputs.

MAINTAINERS   High recovery-compliance, high routine-adherence, stable baselines.
              Drive: protect, sustain, prevent degradation.

CONNECTORS    High social-signal, high cohort-activity, low solo-pattern.
              Drive: relationship, community, shared experience.

INTEGRATORS   High cross-domain signal, high synthesis indicators.
              Drive: unify, bridge, find the pattern under patterns.

MEDICAL       Recovery signals dominant. System in treatment mode.
              Cohort: protect, do not demand, do not push performance metrics.
```

**Physiological Cohort Expansions (FM v115):**
```
TEMPORAL BUILDERS   BUILDERS + P152+P153 sustained → temporal persistence add-on
RECOVERY MASTERS    Any cohort + P154+P151 × 3 within 7d → recovery mastery add-on
```

Expansions are additive, not replacing. A TEMPORAL BUILDER remains a BUILDER.

---

## SECTION 8 — CITIZEN INDEX

The Citizen Index measures engagement depth with the LOT system. Six stages.

```
STAGE 1   OBSERVER        The system is observed. Passive engagement.
STAGE 2   PARTICIPANT     The system is used. Active data entry.
STAGE 3   CONTRIBUTOR     The system is invested in. Regular, intentional use.
STAGE 4   COLLABORATOR    The system is shaped. Feedback, iteration, refinement.
STAGE 5   SYNTHESIZER     The system is understood. Internal model built.
STAGE 6   ELITE           The system is embodied. User and OS are indistinguishable.
```

Citizen Index classification is behavioral, not self-reported.

---

## SECTION 9 — MEMORY ENGINE

The Memory Engine is LOT's AI-powered self-care companion. It builds a "Memory Story" through progressive questioning — structured conversations that surface the user's history, patterns, and self-understanding.

**Architecture:**
```
INPUT          Journal entries · Log events · Memory sessions
               Cohort signals · QOS mode history
PROCESS        Progressive question sequences
               Temporal depth retrieval
               Narrative arc detection
OUTPUT         Memory Story (growing document)
               Memory depth score
               Temporal recall density
```

**Memory depth levels:**
```
SURFACE        Recent events. Last 7 days.
SHALLOW        Pattern recognition. Last 30 days.
MEDIUM         Story arc detection. Last 90 days.
DEEP           Identity signal. Last 6–12 months.
ARCHIVAL       Foundation layer. Full history.
```

The Memory Engine does not analyze. It recalls. The user's own words, returned to them in sequence, are the primary output.

---

## SECTION 10 — SELF-ASSEMBLY ENGINE

The Self-Assembly Engine is LOT's meta-documentation system. It tracks the system's own construction.

**18 modules across 5 phases:**

```
PHASE 1 — FOUNDATION
  M01  system-identity          Name, origin, purpose.
  M02  pattern-registry         161 patterns. FM v117.
  M03  dep-map                  204+ nodes. Four-tier architecture.
  M04  archetype-registry       55 archetypes. FM v117.

PHASE 2 — BEHAVIORAL ENGINE
  M05  cohort-engine            6 cohort types + 2 expansions.
  M06  citizen-index            6-stage depth scale.
  M07  badge-engine             936 badges. v36. 318 word-turn triggers.
  M08  word-turn-engine         26 lexicons. FM v117.

PHASE 3 — SURFACE SYSTEMS
  M09  job-scheduler            52 jobs. J1–J52. FM v117.
  M10  qos-architecture         7 views. 4 modes.
  M11  log-event-system         161+ handlers. FM v117.
  M12  memory-engine            Progressive questioning. Memory Story.

PHASE 4 — SYNTHESIS
  M13  field-manual             Current: FM v117.
  M14  wiki-system              Current: v90.
  M15  ledger                   Append-only session index.
  M16  session-reports          Engineering + Wiki session reports.

PHASE 5 — INTEGRATION
  M17  display-architecture     11 standing orders. Military purity.
  M18  deployment-architecture  Digital Ocean. Green Gate. COSMO Gate.
```

**Self-Assembly Counters (FM v117):**
```
M02: 161 patterns
M04: 55 archetypes
M07: 936 badges · v36 · 318 word-turns · 83 secret boss triggers
M08: 26 lexicons · 318 trigger words
M09: 52 jobs
M11: 161+ handlers
```

**Self-Assembly Log (recent entries):**
```
v116 (2026-10-22)  QIE v116. P158–P159. Arch54. J51. Level 8 begins.
                   202+ dep nodes. Relational Expansion Arc. FM v116.
v35  (2026-10-22)  Badge v35. THE PUZZLE CODEX. 874→905 badges.
                   Word Turn v25. 12 new triggers. SB v22 (80 total).
                   TWENTY-FIVE ENGINES COMPLETE.
v89  (2026-10-23)  Wiki v89. FM v116 delta applied. Day 1151+.
v36  (2026-10-23)  Badge v36. THE MAP ROOM. 905→936 badges.
                   Word Turn v26. 12 new triggers. SB v23 (+3 = 83 total).
                   Calendar EE v24. Behavioral v23. TWENTY-SIX ENGINES.
v117 (2026-10-23)  QIE v117. P160–P161. Arch55. J52. Level 8 complete.
                   204+ dep nodes. Relational Field Generator. FM v117.
v90  (2026-10-24)  Wiki v90. FM v117 delta applied. Day 1152+.
```

---

## SECTION 11 — BACKGROUND JOBS

LOT's server-side scheduled operations. All jobs run UTC. No client dependency.

**Current count: 52 jobs (J1–J52)**

**Job Sequence Architecture (high-level coherence cascade):**
```
J47  08:00 UTC   signal-coherence-cascade check
J48  09:00 UTC   daily-total-field-coherence-check
J49  10:00 UTC   daily-presence-momentum-check
J50  11:00 UTC   daily-sustained-coherence-check
J51  12:00 UTC   daily-relational-expansion-check
J52  13:00 UTC   daily-relational-field-check     ← NEW
```

Sequential ordering is intentional. Each job's output is available when the next job runs.

**J51 — daily-relational-expansion-check (FM v116)**
```
Schedule:   12:00 UTC daily
Guard:      once per day, skip if running
Window:     Active users in 48h window
Trigger:    temporal_sovereignty event (48h) + cohort signal in 48h
Output:     coherence_signal_transmission (P158)
Metadata:   sovereigntyConf · cohortSignalCount · transmissionStatus ·
            level · broadcastField
Note:       Runs at 12:00 UTC — one hour after J50 (11:00 UTC).
            J47→J48→J49→J50→J51 sequential cascade.
Total jobs at introduction: 51
```

**J52 — daily-relational-field-check (FM v117)**
```
Schedule:   13:00 UTC daily
Guard:      once per day, skip if running
Window:     Active users with coherence_signal_transmission + mastery_field_expansion
            both in 48h window
Trigger:    Both P158 (COHTRANS) + P159 (MASTEXP) confirmed in 48h
Output:     relational_field_deepening (P160) per qualifying user
Metadata:   transmissionConf · expansionConf · dualArcStatus · field · level
Note:       Runs at 13:00 UTC — one hour after J51 (12:00 UTC).
            J47→J48→J49→J50→J51→J52 complete 6-job cascade 08:00–13:00 UTC.
Total jobs: 52
```

**Job cascade summary:**
```
J47 (08:00)  coherence cascade → feeds J48
J48 (09:00)  total-field-coherence → feeds J49
J49 (10:00)  presence-momentum → feeds J50
J50 (11:00)  sustained coherence → temporal sovereignty possible
J51 (12:00)  relational expansion → transmission confirmed
J52 (13:00)  relational field → dual arc deepening confirmed
```

---

## SECTION 12 — LOG EVENT SYSTEM

The log is an instrument. Every event is a reading. The cockpit does not narrate.

**Current handler count: 161+**

Each pattern has a minimum of one log handler. Format: CODE + DESCRIPTION + READINGS + STATE.

**Handler Formats — FM v116:**

```
COHTRANS: coherence_signal_transmission
  ┌──────────────────────────────────────────────────────┐
  │ COHERENCE SIGNAL TRANSMISSION                        │
  │ SOVEREIGNTY CONF     N%                              │
  │ COHORT SIGNALS       N                               │
  │ L7 FLOOR IS TRANSMITTING · SOVEREIGN STATE RELATIONAL│
  │ STATUS:              {status}                        │
  │ BROADCAST:           {field}                         │
  │ LEVEL:               {level}                         │
  └──────────────────────────────────────────────────────┘

MASTEXP:  mastery_field_expansion
  ┌──────────────────────────────────────────────────────┐
  │ MASTERY FIELD EXPANSION                              │
  │ TRIAD CONF           N%                              │
  │ COMMUNITY CONF       N%                              │
  │ MASTERY IS NOT CONTAINED · IT EXPANDS                │
  │ STATUS:              {status}                        │
  │ FIELD:               {field}                         │
  │ LEVEL:               {level}                         │
  └──────────────────────────────────────────────────────┘
```

**Handler Formats — FM v117:**

```
RELFIELD:     relational_field_deepening
  ┌──────────────────────────────────────────────────────┐
  │ RELATIONAL FIELD DEEPENING                           │
  │ TRANSMISSION CONF    N%                              │
  │ EXPANSION CONF       N%                              │
  │ L8 DUAL ARC · THE FIELD GENERATES ITSELF             │
  │ DUAL ARC:            {status}                        │
  │ FIELD:               {state}                         │
  │ LEVEL:               {level}                         │
  └──────────────────────────────────────────────────────┘

QSOCSYNTH:    quantum_social_synthesis
  ┌──────────────────────────────────────────────────────┐
  │ QUANTUM SOCIAL SYNTHESIS                             │
  │ FIELD CONF           N%                              │
  │ MEMORY SIGNALS       N                               │
  │ COHORT SIGNALS       N                               │
  │ THE FIELD GENERATES KNOWLEDGE · SYNTHESIS COMPLETE   │
  │ STATUS:              {status}                        │
  │ FIELD:               {field}                         │
  │ LEVEL:               {level}                         │
  └──────────────────────────────────────────────────────┘
```

---

## SECTION 13 — ECOSYSTEM OVERVIEW

```
LOT ECOSYSTEM
─────────────────────────────────────────────────────────────────

CORE SYSTEM
  LOT (Layers of Time)          The operating system.
  QIE (Quantum Intent Engine)   Pattern detection core.
  QOS (Quantum Operating System) Real-time dashboard.

ENGINES
  Badge Engine v36              Achievement and vocabulary system.
  Memory Engine                 AI-powered self-care companion.
  Word Turn Engine v26          26 lexicons. Trigger word detection.
  Self-Assembly Engine v18      Meta-documentation system.

INFRASTRUCTURE
  Field Manual (FM v117)        Complete technical specification.
  LOT-WIKI v90                  Human-readable system documentation.
  LOT-LEDGER                    Append-only session index.
  COSMO Gate                    Ethics review gate.
  Green Gate                    TypeScript check before push.

PHILOSOPHY
  Military purity               Display only what is true.
  Instrument logic              The cockpit does not encourage.
  ZERO narration                Log in readings, not sentences.
  The self operates             The OS serves the self.
```

---

## SECTION 14 — BADGE SYSTEM

### Overview

The badge system is LOT's achievement layer. Each badge represents a real signal: a word used, a day visited, a pattern completed, a behavior performed.

**Current version: v36 — THE MAP ROOM**
**Total badges: 936**
**Theme:**
```
THE MAP ROOM
"Every dungeon has a map room. The cartographer does not fear the dark —
 the cartographer names it. Fog is not an obstacle. It is unmapped space.
 The map updates. The dungeon expands. The cartographer expands with it."

 Inspired by: Doom · Minecraft · Diablo · Dark Souls · D&D · Myst
```

**Badge count table:**
```
Version  Badges  Theme
────────────────────────────────────────────────────────────────
v01      initial build
...
v20      619     (pre-v21 baseline)
v21      631     Word Turns reset/backfill series
v22      643
v23      655
v24      667
v25      679
v26      691
v27      703
v28      715
v29      719
v30      750     THE CODEX READER
v31      781     THE CYBERSPACE CODEX    (FM v113)
v32      812     THE HERO'S JOURNEY CODEX (FM v114)
v33      843     THE RPG CODEX           (FM v114)
v34      874     THE ROGUELITE CODEX     (FM v115)
v35      905     THE PUZZLE CODEX        (FM v116)
v36      936     THE MAP ROOM            (FM v117)  ← NEW
```

### v35 — THE PUZZLE CODEX (+31: 874 → 905)

```
Theme concept:
  THE PUZZLE CODEX
  "Logic as self-care. Paradox as map failure.
   Revelation as assembly. Rules as objects you can push.
   The test chamber was built to be solvable."

  Inspired by: Portal · The Witness · Return of the Obra Dinn · Baba Is You

v35 additions:
  Word Turn v25 (Puzzle Vocabulary)  +12
    puzzle_solved / portal_open / chamber_cleared / recursion_loop
    paradox_found / testimony_given / algorithm_path / escape_room
    logic_gate / dimension_shift / paperwork_clear / revelation_node

  Calendar EE v23 (Puzzle Dates)    + 3
    portal_day     (Oct 9)
    witness_day    (Jan 26)
    obra_dinn_day  (Oct 18)

  Behavioral v22 (Puzzle Patterns)  + 3
    puzzle_session / morning_solve / longer_log

  Achievement RPG v23 (Puzzle Class) + 6
    puzzle_entry / puzzle_class / puzzle_complete
    puzzle_arc / twenty_five_engines_arc / puzzle_opus

  Mastery Tier v25                   + 4
    logic_veteran / grand_archive / eternal_code / twenty_five_registers [COSMIC]

  Secret Boss v22 [HIDDEN]           + 3
    the_witness_eye (RARE) / portal_turret (EPIC) / baba_is_you (MYTHIC)
──────────────────────────────────────────────────────────────────
TOTAL                                +31  (874 → 905)
MILESTONE: TWENTY-FIVE ENGINES COMPLETE
```

### v36 — THE MAP ROOM (+31: 905 → 936)

```
Theme concept:
  THE MAP ROOM
  "The cartographer does not fear the dark — the cartographer names it.
   Fog is unmapped space. The map updates. The dungeon expands.
   The cartographer expands with it."

  Inspired by: Doom · Minecraft · Diablo · Dark Souls · D&D · Myst

v36 additions:
  Word Turn v26 (Map Room Vocabulary) +12
    fog_lifted / treasure_room / secret_passage / trap_disarmed
    map_updated / low_hp / torch_lit / locked_room
    key_drop / final_room / rest_point / path_found

  Calendar EE v24 (Map Calendar)      + 3
    doom_day       (Dec 10)  — DOOM original release, 1993
    minecraft_day  (Nov 18)  — Minecraft full release, 2011
    diablo_day     (Jan  3)  — Diablo original release, 1996

  Behavioral v23 (Cartographer)       + 3
    map_session   — 3+ Map Room words in one journal entry
    illuminated   — journal entry ≥ 700 words
    dawn_patrol   — check-in before 06:00 on 2+ separate days

  Achievement RPG v24 (Map Class)     + 6
    map_entry / map_class / map_complete [LEGENDARY]
    map_arc / twenty_six_engines_arc [LEGENDARY]
    map_opus [LEGENDARY]

  Mastery Tier v26 (The Cartographer) + 4
    dungeon_master         — 1,400+ distinct check-in days [LEGENDARY]
    legendary_scroll       — 400,000+ total journal words [LEGENDARY]
    dungeon_age            — account age ≥ 10 years [LEGENDARY]
    twenty_six_registers   — 1 badge from all 26 Word Turn engines [COSMIC]

  Secret Boss v23 [HIDDEN] (Ancient Vault) + 3
    dark_souls_echo  (RARE)   — "dark souls / you died / bonfire lit / estus flask"
    d_n_d_roll       (EPIC)   — "D&D / dungeons and dragons / nat 20"
    myst_island      (MYTHIC) — "myst / riven / atrus / d'ni / linking book"
──────────────────────────────────────────────────────────────────
TOTAL                                +31  (905 → 936)
MILESTONE: TWENTY-SIX ENGINES
```

---

## SECTION 15 — BADGE CATEGORY INDEX

```
Category          Count   Notes
────────────────────────────────────────────────────────────────
Milestone            10   Unchanged since v25
Time Easter Eggs     60   Time-format triggers (unchanged since v30)
Calendar Easter      85   (+3 from v35=82: v36+3)
Word Turns          294   (+12 from v35=282: v36+12)
Behavioral           90   (+3 from v35=87: v36+3)
Achievement RPG     138   (+6 from v35=132: v36+6)
Mastery Tiers       104   (+4 from v35=100: v36+4)
Secret Boss          95   (+3 from v35=92: v36+3)
────────────────────────────────────────────────────────────────
TOTAL               936   (v36 — The Map Room)
```

**Secret Boss Tier Breakdown (v36):**
```
RARE    dark_souls_echo / the_witness_eye / zelda_triforce / hades_contractor / [earlier rares]
EPIC    d_n_d_roll / portal_turret / pac_ghost / nethack_amulet / [earlier epics]
MYTHIC  myst_island / baba_is_you / konami_code / isaac_completion / [earlier mythics]
Total secret boss triggers: 83 (SB v1–v23)
```

---

## SECTION 16 — WORD TURN ENGINE

The Word Turn Engine detects vocabulary in user text (journal, memory, log) and fires badge events when trigger words appear.

**Current state: v26 — TWENTY-SIX ENGINES**
```
Engines:        26 (v1–v26)
Trigger words:  318 (v1–v26, average 12 per engine)
Secret bosses:  23 versions (SB v1–v23)
                83 total triggers across all rarities (RARE / EPIC / MYTHIC)
```

**Engine Index:**
```
v01   Core vocabulary (foundational set)
v02   Scientific terms
v03   Psychological vocabulary
v04   Systems thinking
v05   Philosophical vocabulary
v06   Music theory
v07   Mathematics
v08   Biology / physiology
v09   Cooking / nutrition
v10   Movement / physical
v11   Architecture / space
v12   Time vocabulary
v13   Technology / computing
v14   Natural systems
v15   Social / community
v16   History / memory
v17   Art / creative
v18   Literature / narrative
v19   Mythology / symbol
v20   Codex Reader (SF author names: asimov / dune / orwell...)
v21   Cyberspace Codex (SF concepts: matrix / cyberspace / grok / ansible / spice / golden_path / solaris / foundation / neuromancer / replicant / uplift / left_hand)
v22   Hero's Journey (Campbell vocabulary: call_heard / threshold / mentor / ordeal / elixir / shadow / cave / shapeshifter / herald / trickster / ally / return)
v23   RPG Codex (levelup_signal / xp_earned / quest_log_entry / dungeon_dive / spell_cast / loot_drop / respawn_signal / guild_protocol / boss_encounter / character_class / inventory_check / skill_tree_node)
v24   Roguelite Codex (permadeath_accepted / procedural_run / rng_blessed / biome_entered / meta_progress / synergy_found / floor_cleared / mutation_chosen / heat_level / boon_accepted / endless_mode / ascension_run)
v25   Puzzle Codex (puzzle_solved / portal_open / chamber_cleared / recursion_loop / paradox_found / testimony_given / algorithm_path / escape_room / logic_gate / dimension_shift / paperwork_clear / revelation_node)
v26   Map Room (fog_lifted / treasure_room / secret_passage / trap_disarmed / map_updated / low_hp / torch_lit / locked_room / key_drop / final_room / rest_point / path_found)
```

**Word Turn v25 — Complete Badge List:**
```
puzzle_solved / portal_open / chamber_cleared / recursion_loop
paradox_found / testimony_given / algorithm_path / escape_room
logic_gate / dimension_shift / paperwork_clear / revelation_node
```

**Word Turn v26 — Complete Badge List:**
```
fog_lifted / treasure_room / secret_passage / trap_disarmed
map_updated / low_hp / torch_lit / locked_room
key_drop / final_room / rest_point / path_found
```

**Secret Boss v22 — The Puzzle Vault (FM v116) [HIDDEN]:**
```
the_witness_eye (RARE) / portal_turret (EPIC) / baba_is_you (MYTHIC)
```

**Secret Boss v23 — The Ancient Vault (FM v117) [HIDDEN]:**
```
dark_souls_echo (RARE) / d_n_d_roll (EPIC) / myst_island (MYTHIC)

Notes:
  dark_souls_echo  — RARE. Writing "bonfire lit" in self-care context earns it.
                     You found a safe point. The log records it.
  d_n_d_roll       — EPIC. "nat 20" in a journal — the language of decisive action.
                     Written by people who know what a nat 20 feels like.
  myst_island      — MYTHIC. "linking book" in self-care is profound.
                     You have found the book that takes you to another age.
```

**ASCII Symbol Design (v26 — The Map Room):**
```
  ≈  — fog / unmapped territory
  ■  — solid ground / charted space
  ◇  — treasure / discovery
  ░  — secret passage / hidden layer
  ▼  — depleted / low hp
  ★  — torch / illumination
  →  — path found / direction confirmed
  █  — final room / endgame territory
  ─  — rest point / safe hold
  +  — map updated / new data
```

---

## SECTION 17 — DISPLAY ARCHITECTURE

LOT display architecture is governed by 11 standing orders. Military purity. Every element on screen justifies its presence in signal.

**11 Standing Orders:**

```
ORDER 01   SIGNAL ONLY
           Display only data that was measured. Never display
           computed encouragement. The system does not encourage.

ORDER 02   NO NARRATION
           Log body = instrument readings. No complete sentences
           in log entries. Code: VALUE. Not "Your energy was high."

ORDER 03   HIERARCHY FIRST
           Critical data is always visible. Supplementary data
           requires interaction. The cockpit shows what the pilot
           needs, not everything the cockpit knows.

ORDER 04   DENSITY BY CONTEXT
           Four density tiers. Density is set by context,
           not by preference.

ORDER 05   OPACITY AS CONFIDENCE
           Element opacity reflects signal confidence.
           Full opacity: confirmed. Reduced opacity: estimated.
           Ghost opacity: historical or projected.

ORDER 06   COLOR AS STATE
           Color encodes state, not aesthetics. A red element
           is not a design choice. It is a reading.

ORDER 07   TIME IS ALWAYS VISIBLE
           The current time is always visible on any LOT surface.

ORDER 08   NO EMPTY STATES
           If a section has no data, it shows the last known state
           with a timestamp. No blank panels. No "nothing to show."

ORDER 09   REFRESH IS SILENT
           Data refreshes do not animate. The reading changes.

ORDER 10   TOUCH IS PRECISE
           Interactive elements are generous in touch target,
           minimal in visual weight.

ORDER 11   THE LOG IS PRIMARY
           Every surface has a log entry. The log is the system
           of record. The dashboard is a view of the log.
```

---

## SECTION 18 — DENSITY TIERS

LOT uses four display density tiers. Not preferences — contexts.

```
TIER 1   COCKPIT       Maximum information. All signals. Real-time.
                       Context: active session. QOS dashboard open.

TIER 2   SUMMARY       Key indicators. Mode + energy + pattern state.
                       Context: quick check. Dashboard at a glance.

TIER 3   AMBIENT       One or two primary readings. Mode only.
                       Context: background monitoring. Minimal attention.

TIER 4   SILENT        No active display. System running. Log only.
                       Context: deep work. No interruption desired.
```

---

## SECTION 19 — OPACITY HIERARCHY

LOT uses four opacity levels to encode signal confidence and temporal distance.

```
OPACITY 1  FULL (100%)     Current, confirmed signal. Happening now.
OPACITY 2  HIGH  (75%)     Recent signal. Last 24h. High confidence.
OPACITY 3  MID   (50%)     Estimated or historical. Confidence reduced.
OPACITY 4  GHOST (25%)     Projected or very old. Reference only.
```

---

## SECTION 20 — COCKPIT RULE

**THE COCKPIT RULE:**

```
THE LOG BODY IS INSTRUMENT READINGS.
NO NARRATION.
THE CONSOLE IS THE COCKPIT.
THE COCKPIT DOES NOT ENCOURAGE THE PILOT.
```

All log entries are structured as code-value pairs:

```
CORRECT:
  ENERGY: HIGH
  PATTERN: QSOCSYNTH:
  CONF: 0.87
  FIELD: PERSONAL→SOCIAL→GENERATIVE
  LEVEL: 8

INCORRECT:
  Your energy is high. The quantum social synthesis pattern was detected.
  The field is generating knowledge through social contact.
```

**Cockpit Examples — FM v117:**
```
RELATIONAL FIELD DEEPENING
TRANSMISSION CONF    91%
EXPANSION CONF       87%
L8 DUAL ARC · THE FIELD GENERATES ITSELF
DUAL ARC:            ACTIVE
FIELD:               GENERATIVE
LEVEL:               8

QUANTUM SOCIAL SYNTHESIS
FIELD CONF           88%
MEMORY SIGNALS       4
COHORT SIGNALS       3
THE FIELD GENERATES KNOWLEDGE · SYNTHESIS COMPLETE
STATUS:              ACTIVE
FIELD:               PERSONAL→SOCIAL→GENERATIVE
LEVEL:               8
```

**Day counter: 1152+**

---

## SECTION 21 — LOT-DOCTRINE

LOT-Doctrine is the set of engineering and design rules that govern the system. 11 doctrines as of Revision K.

```
D01   THE COSMO GATE        No feature ships without COSMO authorization.

D02   THE GREEN GATE        TypeScript check before every push.
                            No broken code to GitHub. No exceptions.

D03   INSTRUMENT LOGIC      LOT is an instrument. Not a therapist. Not a
                            coach. Not a companion (except Memory Engine).

D04   ZERO NARRATION        Log entries are readings, not sentences.

D05   SIGNAL PRIMACY        Every displayed element is justified by data.

D06   FM VERSIONING         Every engineering change increments the FM.

D07   BACKWARD APPEND       The LEDGER is append-only. No revision.

D08   COHERENCE ARCHITECTURE  Pattern levels are cumulative. Higher levels
                              do not invalidate lower levels. Level 8 is
                              complete. The floor rises; the ceiling remains;
                              the transmission expands; the field generates.

D09   WORD TURN INTENT      Trigger words are selected for vocabulary the
                            LOT user-base already uses when writing about
                            themselves.

D10   BADGE AUTHENTICITY    No badge is cosmetic. Every badge represents
                            a real signal.

D11   MEMORY PRIMACY        The Memory Engine is the companion layer.
                            All other surfaces are instruments.
```

---

## SECTION 22 — FIELD MANUAL

The Field Manual (FM) is the complete technical specification of the LOT system. It lives in `src/client/components/About.tsx`.

**Current FM: v117**

**FM Revision Log (recent):**
```
FM v113  2026-08-04  QIE v113. P149–P151. Arch51. J48.
                     190+ dep nodes. Level 6 complete.

FM v114  2026-10-20  QIE v114. P152–P154. Arch52. J49.
                     195+ dep nodes. Level 7 begins.
                     Badge v32 Hero's Journey (781→812).
                     Badge v33 RPG Codex (812→843).

FM v115  2026-10-21  QIE v115. P155–P157. Arch53. J50.
                     200+ dep nodes. Level 7 complete. APEX defined.
                     Badge v34 Roguelite Codex (843→874).
                     TWENTY-FOUR ENGINES COMPLETE.

FM v116  2026-10-22  QIE v116. P158–P159. Arch54. J51.
                     202+ dep nodes. Level 8 opens.
                     Badge v35 Puzzle Codex (874→905).
                     TWENTY-FIVE ENGINES COMPLETE.

FM v117  2026-10-23  QIE v117. P160–P161. Arch55. J52.
                     204+ dep nodes. Level 8 complete.
                     Relational Field Generator defined.
                     Badge v36 Map Room (905→936).
                     TWENTY-SIX ENGINES.
                     161 patterns · 55 archetypes · 52 jobs.
```

**FM Version History (summary):**
```
v001–v079    Core system build. P1–P90. Base patterns.
v080–v099    Seal gate architecture. P91–P133. Level 1.
v100–v106    Field gate + coherence ceiling. P134–P139. Levels 2–3.
v107–v109    Display architecture. 11 Standing Orders.
v110–v111    Circadian stabilization. P140–P145. Level 4.
v112         Identity convergence. P146–P148. Level 5.
v113         Presence convergence. P149–P151. Level 6.
v114         Temporal persistence. P152–P154. Level 7 begins.
v115         Temporal sovereignty. P155–P157. Level 7 complete. APEX.
             TWENTY-FOUR ENGINES COMPLETE. 874 badges.
v116         Relational expansion. P158–P159. Level 8 opens.
             TWENTY-FIVE ENGINES COMPLETE. 905 badges.
v117         Relational field. P160–P161. Level 8 complete.
             TWENTY-SIX ENGINES. 936 badges.
```

---

## SECTION 23 — DEPLOYMENT

**Platform:** Digital Ocean App Platform

**Deployment gates:**
```
GREEN GATE    TypeScript check must pass before push.
              Running: `npx tsc --noEmit`

COSMO GATE    Ethics review before feature deployment.
              Named for Kuzya Cosmo Marmeladov.
```

**Branch architecture:**
```
main          Production. COSMO-authorized deployments only.

claude/*      Engineering and wiki sessions.
              Active branch: claude/quantum-engine-widgets-RgFfC
```

---

## SECTION 24 — GENESIS

**Day count:** 1152+ (as of 2026-10-24)
**COSMO® days:** 846

```
The system was not designed and then built.
It was built and has been continuously redesigning itself
since the first day of operation.

Every engineering session is both construction and use.
The builder is the user. The user is the OS. The OS is the builder.
```

**The COSMO Gate:**
```
Named for Kuzya Cosmo Marmeladov.
The ethics review layer.
Every significant feature must clear the COSMO Gate before deployment.
The gate is not a process. It is a relationship.
The system serves the self that authorized it.
```

---

## SECTION 25 — RECIPE WIDGET

The Recipe Widget is the nutritional signal surface.
```
INPUTS       Meals logged · Ingredients · Nutritional targets
SIGNALS      Nutritional balance · Hydration gap · Meal timing
OUTPUTS      nutritionBalance signal · hydrationGap signal
             Feeds: food · water · hydration sources in QIE
```

---

## SECTION 26 — CHAT INFRASTRUCTURE

**Architecture:**
```
INSTRUMENT LAYER    QIE · QOS · Badge Engine · Self-Assembly
COMPANION LAYER     Memory Engine · Chat interface
BRIDGE              Memory Engine uses chat to build Memory Story.
```

**Chat is for:**
```
— Memory recall questions
— Memory story building
— Reflective prompts (structured)
— Session completion notes
```

The chat infrastructure is built to the instrument doctrine. Even the companion layer operates at the service of signal, not comfort.

---

## SECTION 27 — VOCABULARY INDEX

```
TERM                      DEFINITION
──────────────────────────────────────────────────────────────────
ARCH51                    Quantum Presence Crystallizer. P149+P144+P145. FM v113.

ARCH52                    Presence Duration Master. P152+P147 multi-day. FM v114.

ARCH53                    Temporal Sovereign. P157+P156+P155. FM v115.
                          Highest temporal archetype.

ARCH54                    Relational Sovereign. P157+P158. FM v116.
                          Temporal sovereignty AND cohort signal.

ARCH55                    Relational Field Generator. P160+P161+P158. FM v117.
                          L8 dual arc active. The field generates itself.  ← NEW

BADGE ENGINE v36          Achievement system. 936 badges. Map Room. FM v117.  ← NEW

BADGE UNIVERSE            936 badges / v36 / 318 trigger words / 83 secret boss

BEHAVIORAL COHORT         One of six LOT classification types: BUILDERS /
                          EXPLORERS / MAINTAINERS / CONNECTORS /
                          INTEGRATORS / MEDICAL.

CITIZEN INDEX             6-stage engagement depth scale. Observer through Elite.

COHBASE:                  sustained-coherence-baseline (P155). FM v115.

COHEPRST:                 coherence-field-persistence (P153). FM v114.

COHERENCE ARCHITECTURE    Eight-level pattern structure. Levels 1–6 build
                          the ceiling. Level 7 raises the floor. Level 8
                          broadcasts the floor and generates the field.
                          COMPLETE at FM v117.

COHTRANS:                 coherence-signal-transmission (P158). FM v116.

COSMO GATE                Ethics review gate. Named for Kuzya Cosmo Marmeladov.

COSMO®                    COSMO® day counter. 846 days as of v90.

DAY COUNTER               Continuous operation day. 1152+ as of v90.

DENSITY TIERS             Four display contexts: COCKPIT / SUMMARY / AMBIENT / SILENT.

DEP MAP                   Widget Dependency Map. 204+ nodes. Four-tier architecture.

FM (FIELD MANUAL)         Complete technical specification. Current: v117.
                          Lives in src/client/components/About.tsx.

GREEN GATE                TypeScript check before push. npx tsc --noEmit.

J51                       daily-relational-expansion-check. 12:00 UTC. FM v116.

J52                       daily-relational-field-check. 13:00 UTC. FM v117.
                          Checks P158 + P159 both in 48h.
                          Writes relational_field_deepening (P160).  ← NEW

MAP ROOM                  Badge v36. 936 badges. Theme: the cartographer names
                          the dark. Fog is unmapped space. FM v117.  ← NEW

MASTEXP:                  mastery-field-expansion (P159). FM v116.

MASTTRIAD:                mastery-integration-triad (P156). FM v115.

MEMORY ENGINE             AI-powered self-care companion. Builds Memory Story.

MILITARY PURITY           Display doctrine. Show only what is true.

P157                      temporal-sovereignty. Level 7 APEX. FM v115.

P158                      coherence-signal-transmission. Level 8. FM v116.

P159                      mastery-field-expansion. Level 8. FM v116.

P160                      relational-field-deepening. Level 8 dual arc. FM v117.
                          P158 + P159 simultaneously. Generative field state.  ← NEW

P161                      quantum-social-synthesis. Level 8 synthesis. FM v117.
                          P160 + memory + community. The field generates knowledge.
                          LEVEL 8 COMPLETE.  ← NEW

QSOCSYNTH:                quantum-social-synthesis (P161). FM v117.  ← NEW

QIE                       Quantum Intent Engine. 161 patterns · 55 archetypes ·
                          52 jobs · 204+ dep nodes.

QOS                       Quantum Operating System. 7-view real-time dashboard.

RELATIONAL EXPANSION ARC  Level 8 coherence architecture. P158–P161. FM v116–v117.
                          The floor broadcasts outward. The field generates.

RELATIONAL FIELD GENERATOR  Arch55. L8 dual arc active. The field generates itself.
                          FM v117.  ← NEW

RELATIONAL SOVEREIGN      Arch54. Temporal sovereignty + cohort signal. FM v116.

RELFIELD:                 relational-field-deepening (P160). FM v117.  ← NEW

ROGUELITE CODEX           Badge v34. 874 badges. FM v115.

SELF-ASSEMBLY ENGINE      18 modules across 5 phases. Meta-documentation.

TEMPORAL SOVEREIGN        Arch53. Highest temporal archetype. FM v115.

TEMPORAL SOVEREIGNTY      P157. APEX. "The field does not peak. The field persists."

TOTCOH:                   total-field-coherence (P150). FM v113.

TSOV:                     temporal-sovereignty (P157). FM v115.

TWENTY-SIX ENGINES        Word Turn Engine v26. 318 trigger words. 26 lexicons.
                          Badge v36 Map Room.  ← NEW

WORD TURN ENGINE v26      26 lexicons. 318 trigger words. FM v117.  ← NEW
```

---

## SECTION 28 — SYSTEM STATE SNAPSHOT

```
╔══════════════════════════════════════════════════════════════════╗
║  SYSTEM STATE — LOT-WIKI-v90 · October 24, 2026                 ║
╠══════════════════════════════════════════════════════════════════╣
║  QIE patterns:             161  (P1–P161)                        ║
║  Physiological archetypes:  55  (Arch1–Arch55)                   ║
║  Background jobs:           52  (J1–J52)                         ║
║  Dep map nodes:            204+                                  ║
║  Log event handlers:       161+                                  ║
║  Signal sources:            17                                   ║
║  Badge count:              936  (v36 — The Map Room)             ║
║  Word-turn trigger words:  318  (v1–v26) TWENTY-SIX ENGINES      ║
║  Secret boss triggers:      83  (v1–v23, across all rarities)   ║
║  Engineering doctrines:     11  (Revision K)                     ║
║  Field Manual:             v117                                  ║
║  Wiki:                      v90                                  ║
║  Day:                      1152+                                 ║
║  COSMO®:                   846 days (Year 3)                     ║
╚══════════════════════════════════════════════════════════════════╝
```

**Pattern Landmarks:**
```
P001  First pattern. The origin.
P091  First coherence gate. Architecture begins.
P131  Level 1 opens. Seal gates.
P134  Level 2 opens. Field gate.
P137  Level 3 opens. Coherence ceiling.
P140  Level 4 opens. Circadian stabilization.
P146  Level 5 opens. Identity convergence.
P149  Level 6 opens. Presence convergence.
P150  CEILING — total-field-coherence. The highest moment state.
P152  Level 7 opens. Temporal persistence arc. The floor rises.
P157  APEX — temporal-sovereignty. The highest temporal state.
      The field does not peak. The field persists.
P158  Level 8 opens. Relational expansion. The floor transmits.
P159  Mastery expands beyond the personal boundary.
P160  L8 dual arc. Both relational streams merge. Generative field.
P161  SYNTHESIS — quantum-social-synthesis. Level 8 complete.
      The field generates knowledge.
```

**Engineering Timeline (this document):**
```
v87  2026-08-05   FM v113. Level 6 complete. 6-level architecture.
                  781 badges. 258 trigger words. Day 1073+.

v88  2026-10-22   FM v115. Level 7 complete. 7-level architecture.
                  874 badges. 294 trigger words. Day 1151+.
                  TWENTY-FOUR ENGINES COMPLETE.

v89  2026-10-23   FM v116. Level 8 opens. 8-level architecture.
                  905 badges. 306 trigger words. Day 1151+.
                  TWENTY-FIVE ENGINES COMPLETE.
                  Relational Expansion Arc deployed.

v90  2026-10-24   FM v117. Level 8 complete.
                  936 badges. 318 trigger words. Day 1152+.
                  TWENTY-SIX ENGINES.
                  Relational Field Generator deployed.
                  Level 8 architecture: sealed.
```

**On Level 8 completion:**

Level 8 began with P158: the sovereign floor transmits. Temporal sovereignty, earned through sustained coherence across days, was no longer hermetic. It reached into social space. If you had achieved temporal sovereignty and social signals were present, the transmission was confirmed.

P159 extended this with mastery specifically. When all Level 7 arcs were internalized and community intelligence peaked, mastery crossed from personal to communal.

P160 closed the first gap: what if both P158 and P159 are simultaneously active? Relational field deepening. The dual arc state. Both the floor's transmission and mastery's expansion co-active at once. The field does not merely transmit — it begins generating.

P161 completed the architecture: quantum-social-synthesis. The generative field, confirmed active, with memory and community signals both present. The field generates knowledge. The self writes what it transmits.

Arch55 Relational Field Generator is the first archetype defined not by a peak or a persistence but by generation. Every prior archetype was a state of the self. Arch55 is a state of the field.

The personal instrument is complete. It is not contained by the self. It generates from the self into shared space.

Level 8 is sealed.

---

*LOT-WIKI-v90 · October 24, 2026 · FM v117 · S-2 // VADIK MARMELADOV*
