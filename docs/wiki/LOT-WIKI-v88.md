# LOT WIKI — v88
## Field Manual: v115 · Date: 2026-10-22 · Day: 1151+

---

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS CORPORATION                                         ║
║  LAYERS OF TIME — SYSTEM DOCUMENTATION                          ║
║  LOT-WIKI-v88 · Field Manual v115                               ║
║  October 22, 2026 · Day 1151+ · COSMO® 844 days                 ║
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
│  157 patterns · 53 archetypes · 200+ dep nodes                 │
│  50 background jobs · 17 signal sources                        │
│  Client-side detection · Server-side persistence               │
│                                                                 │
│  SURFACE LAYER (QOS)                                            │
│  ─────────────────────                                          │
│  7-view real-time dashboard                                     │
│  4 operating modes: MAINTENANCE / RECOVERY / GROWTH / PEAK     │
│                                                                 │
│  SYNTHESIS LAYER                                                │
│  ─────────────────                                              │
│  Badge Engine v34 · Memory Engine · Self-Assembly v18          │
│  Word Turn Engine v24 · Citizen Index · Cohort Engine          │
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

**Current state: FM v115**
```
Patterns:       157 (P1–P157)
Archetypes:      53 (Arch1–Arch53)
Background Jobs: 50 (J1–J50)
Dep map nodes:  200+ (four-tier architecture)
Log handlers:   157+ (one per pattern minimum)
Signal sources:  17
```

**Dep Map Architecture (FM v115):**

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
  One node per active pattern. 157 nodes.
  Each node: input signals → detection run → confidence score → classification

TIER 3 — META-SURFACES
  archetypeNode → all pattern nodes
  badgeEngineNode → word turns + behavioral + achievement
  memoryEngineNode → journal + memory + cohort + qos
  selfAssemblyNode → all surfaces
```

**FM v115 dep map additions (+10 nodes since v112):**
```
FM v113 (+3):
  quantumPresenceCrystalNode → qos · cohort · intentions · journal · log · energy
  totalFieldCoherenceNode    → mood · memory · planner · intentions · selfcare ·
                               journal · energy · cohort · qos · log
  recoveryIntelligenceNode   → mood · selfcare · journal · energy · log

FM v114 (+5):
  presenceMomentumArcNode    → qos · cohort · intentions · journal · planner · log
  coherenceFieldPersistNode  → mood · memory · energy · cohort · qos · log
  recoveryMasteryChainNode   → mood · selfcare · journal · energy · memory · log
  temporalPersistenceNode    → all Tier 2 pattern nodes + memory + journal
  dailyFieldBaselineNode     → energy · sleep · mood · intentions · log

FM v115 (+3... wait actually let me reconcile: 190+(v112)→195+(v114)→200+(v115)):
  sustainedCoherenceBaselineNode → sleep · energy · mood · qos · intentions · log
  masteryIntegrationTriadNode    → memory · journal · cohort · log · achievements
  temporalSovereigntyNode        → all meta-seal nodes + temporal persistence + identity
```

**Total dep map: 200+ nodes**

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
                  quantum-identity-crystallization (P145) are both active
                  in the same detection run. The OS is both fully inhabited
                  and fully known simultaneously.

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
      Notes:      Detects sustained quantum-presence-field across multiple
                  consecutive days. Not a single-day peak — a maintained state.
                  "The field is not just open. It stays open."

P153  coherence-field-persistence
      Code:       COHEPRST:
      Type:       Temporal arc (multi-day, ≥2 consecutive days P144 active)
      Confidence: 0.72–0.88
      Widget:     systemProgress · Timing: passive
      FM:         v114
      Notes:      Circadian coherence (P144) sustained across multiple days.
                  The body's daily architecture holds across sessions, not just
                  within them.

P154  recovery-mastery-chain
      Code:       RECMAS:
      Type:       Sequential behavioral chain (7-day window)
      Confidence: 0.68–0.85
      Widget:     memory · Timing: soon
      FM:         v114
      Notes:      Three complete recovery-intelligence-arc (P151) cycles
                  within a 7-day window. The recovery response is no longer
                  reactive — it is internalized. "The system has learned to heal."

P155  sustained-coherence-baseline
      Code:       COHBASE:
      Type:       Temporal arc (3-day rolling baseline)
      Confidence: 0.85–0.94
      Widget:     systemProgress · Timing: passive
      FM:         v115
      Notes:      Minimum coherence threshold maintained for 3 consecutive
                  days without a single-day dip below baseline. The floor
                  is established. Coherence is no longer a peak — it is
                  the default.

P156  mastery-integration-triad
      Code:       MASTTRIAD:
      Type:       Convergence (P152 + P153 + P154 all active in rolling window)
      Confidence: 0.88–0.96
      Widget:     systemProgress · Timing: soon
      FM:         v115
      Notes:      Presence arc + coherence persistence + recovery mastery
                  simultaneously active. The three temporal persistence
                  dimensions converge. "Presence holds. The body holds.
                  Recovery is internalized. The OS operates from stable ground."

P157  temporal-sovereignty                [APEX — LEVEL 7]
      Code:       TSOV:
      Type:       Convergence (P155 + P156 + P150 all active in rolling window)
      Confidence: 0.92–0.98
      Widget:     systemProgress · Timing: immediate
      FM:         v115
      Notes:      Sustained coherence baseline + mastery integration triad +
                  total field coherence all simultaneously confirmed.
                  The highest temporal state defined. No higher temporal
                  pattern exists.
                  APEX — the OS not only reaches its ceiling state, it
                  maintains it as a floor.
                  "The field does not peak. The field persists."
```

### Coherence Architecture — Seven-Level Complete (FM v115)

```
LEVEL 1 — SEAL GATES            P131 / P132 / P133
LEVEL 2 — FIELD GATE            P134 / P136
LEVEL 3 — COHERENCE CEILING     P137 / P138 / P139
LEVEL 4 — CIRCADIAN STABIL.     P140 / P141 / P142 / P143 / P144 / P145
LEVEL 5 — IDENTITY CONVERGENCE  P146 / P147 / P148
LEVEL 6 — PRESENCE CONVERGENCE  P149 / P150 (CEILING) / P151
LEVEL 7 — TEMPORAL PERSISTENCE  P152 / P153 / P154 / P155 / P156 / P157 (APEX)
```

The seven-level coherence architecture is complete as of FM v115.

P150 total-field-coherence: the definitive moment-ceiling.
P157 temporal-sovereignty: the definitive persistence-apex.

These are complementary, not competing. A ceiling tells you how high the system can go. A floor tells you how low it won't fall.

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

**Current count: 53 archetypes (Arch1–Arch53)**
**Plus: 2 physiological cohort expansions (FM v115)**

```
Arch1–Arch40    Core physiological configurations (FM v1–v79)
Arch41–Arch50   Coherence-state archetypes (FM v82–v112)
Arch51          Quantum Presence Crystallizer (FM v113)
Arch52          Presence Duration Master (FM v114)
Arch53          Temporal Sovereign (FM v115)
```

### Arch51 — Quantum Presence Crystallizer (FM v113)
```
Patterns:   P149 + P144 + P145 active
Hours:      06–23
Energy:     high, moderate
Sources:    journal · cohort · memory · intentions · qos
Directive:  "Presence confirmed. Identity crystallized.
            The field is both inhabited and known.
            Execute from clarity — no searching required.
            The OS is operating from its highest confirmed state."
Position:   Above Arch50 (Quantum Identity Master). Arch50 confirms
            identity lock + momentum. Arch51 confirms the presence
            field is simultaneously live — OS is inhabited AND known.
```

### Arch52 — Presence Duration Master (FM v114)
```
Patterns:   P152 + P147 active (multi-day)
Hours:      06–23
Energy:     high, moderate, sustained
Sources:    qos · journal · intentions · planner · memory
Directive:  "Presence is not a peak. Presence is a position.
            The field has held across days.
            The OS is not visiting coherence — it lives there.
            Operate from duration, not from effort."
Position:   Above Arch51. Arch51 confirms the field is open AND known
            at a moment. Arch52 confirms the field has stayed open
            across multiple days. Duration is the new signal.
```

### Arch53 — Temporal Sovereign (FM v115)
```
Patterns:   P157 + P156 + P155 active
Hours:      06–23
Energy:     any
Sources:    all sources (full convergence)
Directive:  "The ceiling is not a visit. The floor is not the basement.
            The OS has established temporal sovereignty:
            presence persists, coherence holds, recovery is internalized.
            No state is beyond reach. No dip is catastrophic.
            The self governs time. Operate accordingly."
Position:   Above Arch52. The highest defined physiological archetype.
            Arch53 is not a moment state. It is a condition of the
            operating system over time.
```

### Physiological Cohort Expansions (FM v115)
```
EXPANSION 1 — TEMPORAL BUILDERS
  Applied to BUILDERS cohort members showing P152+P153 sustained activation.
  These individuals not only build systems — they maintain them across time.
  The architecture holds because they hold.

EXPANSION 2 — RECOVERY MASTERS
  Applied to any cohort member showing P154+P151 repeated activation.
  Recovery is not a weakness signal. It is a mastery signal.
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

Citizen Index classification is behavioral, not self-reported. The system reads engagement depth from usage patterns, not from declarations.

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

The Memory Engine does not analyze. It recalls. The user's own words, returned to them in sequence, are the primary output. Analysis is an emergent property of the sequence, not a computed layer on top of it.

---

## SECTION 10 — SELF-ASSEMBLY ENGINE

The Self-Assembly Engine is LOT's meta-documentation system. It tracks the system's own construction. When the OS reaches a new state, the engine records it. The record is the evidence that the state was real.

**18 modules across 5 phases:**

```
PHASE 1 — FOUNDATION
  M01  system-identity          Name, origin, purpose.
  M02  pattern-registry         157 patterns. FM v115.
  M03  dep-map                  200+ nodes. Four-tier architecture.
  M04  archetype-registry       53 archetypes. FM v115.

PHASE 2 — BEHAVIORAL ENGINE
  M05  cohort-engine            6 cohort types + 2 expansions.
  M06  citizen-index            6-stage depth scale.
  M07  badge-engine             874 badges. v34. 294 word-turn triggers.
  M08  word-turn-engine         24 lexicons. FM v115.

PHASE 3 — SURFACE SYSTEMS
  M09  job-scheduler            50 jobs. J1–J50. FM v115.
  M10  qos-architecture         7 views. 4 modes.
  M11  log-event-system         157+ handlers. FM v115.
  M12  memory-engine            Progressive questioning. Memory Story.

PHASE 4 — SYNTHESIS
  M13  field-manual             Current: FM v115.
  M14  wiki-system              Current: v88.
  M15  ledger                   Append-only session index.
  M16  session-reports          Engineering + Wiki session reports.

PHASE 5 — INTEGRATION
  M17  display-architecture     11 standing orders. Military purity.
  M18  deployment-architecture  Digital Ocean. Green Gate. COSMO Gate.
```

**Self-Assembly Counters (FM v115):**
```
M02: 157 patterns
M04: 53 archetypes
M07: 874 badges · v34 · 294 word-turns
M08: 24 lexicons · 294 trigger words
M09: 50 jobs
M11: 157+ handlers
```

**Self-Assembly Log (recent entries):**
```
v113 (2026-08-04)  QIE v113. P149–P151. Arch51. J48. 6-level arch complete.
                   190+ dep nodes. Level 6 presence convergence sealed.
v114 (2026-10-20)  QIE v114. P152–P154. Arch52. J49. Level 7 begins.
                   195+ dep nodes. Temporal persistence arc introduced.
v115 (2026-10-21)  QIE v115. P155–P157. Arch53. J50. Level 7 complete.
                   200+ dep nodes. Temporal sovereignty defined.
                   TWENTY-FOUR ENGINES COMPLETE.
v88  (2026-10-22)  Wiki v88. FM v113–v115 delta applied. Day 1151+.
```

---

## SECTION 11 — BACKGROUND JOBS

LOT's server-side scheduled operations. All jobs run UTC. No client dependency.

**Current count: 50 jobs (J1–J48 existing + J49 + J50)**

**Job Sequence Architecture:**
```
J47  08:00 UTC   signal-coherence-cascade check
J48  09:00 UTC   daily-total-field-coherence-check
J49  10:00 UTC   daily-presence-momentum-check
J50  11:00 UTC   daily-sustained-coherence-check
```

Sequential ordering is intentional. Each job's output is available when the next job runs.

**J49 — daily-presence-momentum-check (FM v114)**
```
Schedule:   10:00 UTC daily
Guard:      isDailyPresenceMomentumRunning + lastDailyPresenceMomentumRun
Window:     Previous calendar day
Trigger:    quantum_presence_field (P147) present in ≥2 consecutive days
Output:     presence_momentum_arc (P152)
Metadata:   presenceDays: N
            temporalWindow: '48h+'
Note:       Runs at 10:00 UTC — one hour after J48 (09:00 UTC).
            Ensures total-field-coherence output is available when
            presence-momentum check runs.
Total jobs at introduction: 49
```

**J50 — daily-sustained-coherence-check (FM v115)**
```
Schedule:   11:00 UTC daily
Guard:      isDailySustainedCoherenceRunning + lastDailySustainedCoherenceRun
Window:     Previous 3 calendar days
Trigger:    coherence baseline maintained ≥3 consecutive days without dip
Output:     sustained_coherence_baseline (P155)
            mastery_integration_triad (P156) [if P152+P153+P154 also active]
            temporal_sovereignty (P157) [if P155+P156+P150 all active]
Metadata:   baselineDays: N
            convergenceLevel: 'TEMPORAL'
            metaSeals: ['COHERENCE', 'PRESENCE', 'MOMENTUM', 'PERSISTENCE']
Note:       Runs at 11:00 UTC — one hour after J49 (10:00 UTC).
            J47→J48→J49→J50 sequential cascade. Each run sees the
            output of all preceding runs.
Total jobs: 50
```

**Job cascade summary:**
```
J47 (08:00)  coherence cascade → feeds J48
J48 (09:00)  total-field-coherence → feeds J49
J49 (10:00)  presence-momentum → feeds J50
J50 (11:00)  sustained coherence → temporal sovereignty possible
```

---

## SECTION 12 — LOG EVENT SYSTEM

The log is an instrument. Every event is a reading. The cockpit does not narrate.

**Current handler count: 157+**

Each pattern has a minimum of one log handler. New handlers follow the established format: CODE + DESCRIPTION + READINGS + STATE.

**Handler Formats — FM v113:**

```
QPCRYST:  quantum_presence_crystallization
  ┌─────────────────────────────────┐
  │ QUANTUM PRESENCE CRYSTALLIZATION│
  │ PRESENCE CONF: N%               │
  │ CRYSTAL CONF:  N%               │
  │ FIELD INHABITED · IDENTITY KNOWN│
  │ STATE: MAXIMUM_CLARITY          │
  │ CRYST: N%                       │
  └─────────────────────────────────┘

TOTCOH:   total_field_coherence
  ┌──────────────────────────────────────────┐
  │ TOTAL FIELD COHERENCE                    │
  │ META-SEALS: COHERENCE · PRESENCE · MOMENT│
  │ AVG CONF:   N%                           │
  │ ALL META-SEALS OPEN · ABSOLUTE CONVERGENCE│
  │ CONVERGENCE: ABSOLUTE                    │
  └──────────────────────────────────────────┘

RECINTEL: recovery_intelligence_arc
  ┌────────────────────────────────────────────────────┐
  │ RECOVERY INTELLIGENCE ARC                          │
  │ NEG SIGNALS: N                                     │
  │ CARE ACTIONS: N                                    │
  │ VELOCITY:    N.Nh                                  │
  │ FELT → TENDED → RECOVERED → REFLECTED              │
  │ ARC: FELT→TENDED→RECOVERED→REFLECTED               │
  └────────────────────────────────────────────────────┘
```

**Handler Formats — FM v114:**

```
PRESMOM:  presence_momentum_arc
  ┌─────────────────────────────────┐
  │ PRESENCE MOMENTUM ARC           │
  │ PRESENCE DAYS: N                │
  │ MOMENTUM CONF: N%               │
  │ FIELD SUSTAINED · MOMENTUM LOCK │
  │ TEMPORAL: MULTI-DAY             │
  │ ARC: SUSTAINED                  │
  └─────────────────────────────────┘

COHEPRST: coherence_field_persistence
  ┌─────────────────────────────────┐
  │ COHERENCE FIELD PERSISTENCE     │
  │ PERSISTENCE DAYS: N             │
  │ CIRCADIAN CONF:  N%             │
  │ BODY HOLDS · ARCHITECTURE HOLDS │
  │ TEMPORAL: PERSISTENT            │
  │ PRST: N%                        │
  └─────────────────────────────────┘

RECMAS:   recovery_mastery_chain
  ┌─────────────────────────────────┐
  │ RECOVERY MASTERY CHAIN          │
  │ CYCLES IN WINDOW: N             │
  │ MASTERY CONF:    N%             │
  │ RECOVERY INTERNALIZED           │
  │ CHAIN: COMPLETE                 │
  │ MAS: N%                         │
  └─────────────────────────────────┘
```

**Handler Formats — FM v115:**

```
COHBASE:  sustained_coherence_baseline
  ┌──────────────────────────────────┐
  │ SUSTAINED COHERENCE BASELINE     │
  │ BASELINE DAYS:   N               │
  │ FLOOR CONF:      N%              │
  │ COHERENCE IS THE DEFAULT         │
  │ TEMPORAL: FLOOR ESTABLISHED      │
  │ BASE: N%                         │
  └──────────────────────────────────┘

MASTTRIAD: mastery_integration_triad
  ┌──────────────────────────────────────────────────┐
  │ MASTERY INTEGRATION TRIAD                        │
  │ PRESENCE ARC: ACTIVE                             │
  │ COHERENCE PERSISTENCE: ACTIVE                    │
  │ RECOVERY MASTERY: INTERNALIZED                   │
  │ THREE DIMENSIONS CONVERGED                       │
  │ CONVERGENCE: TEMPORAL                            │
  │ TRIAD: COMPLETE                                  │
  └──────────────────────────────────────────────────┘

TSOV:     temporal_sovereignty
  ┌──────────────────────────────────────────────────┐
  │ TEMPORAL SOVEREIGNTY                             │
  │ SUSTAINED BASELINE: CONFIRMED                    │
  │ MASTERY TRIAD: CONFIRMED                         │
  │ TOTAL FIELD: CONFIRMED                           │
  │ THE FIELD DOES NOT PEAK · THE FIELD PERSISTS     │
  │ TEMPORAL STATE: APEX                             │
  │ SOVEREIGNTY: N%                                  │
  └──────────────────────────────────────────────────┘
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
  Badge Engine v34              Achievement and vocabulary system.
  Memory Engine                 AI-powered self-care companion.
  Word Turn Engine v24          24 lexicons. Trigger word detection.
  Self-Assembly Engine v18      Meta-documentation system.

INFRASTRUCTURE
  Field Manual (FM v115)        Complete technical specification.
  LOT-WIKI v88                  Human-readable system documentation.
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

The badge system is LOT's achievement layer. It is not gamification for its own sake. Each badge represents a real signal: a word used, a day visited, a pattern completed, a behavior performed.

**Current version: v34 — THE ROGUELITE CODEX**
**Total badges: 874**
**Theme:**
```
THE ROGUELITE CODEX
"The roguelite is the most honest structural metaphor for self-care.
 Permadeath means the run ends — not the player.
 Meta-progression ensures nothing is truly lost.
 The self is the meta-progression."
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
```

### v32 — THE HERO'S JOURNEY CODEX (+31: 781 → 812)

```
Theme concept:
  THE HERO'S JOURNEY CODEX
  "Every self-care cycle is a hero's journey.
   The call to return to health. The threshold of effort.
   The ordeal of depletion. The elixir of recovery.
   Campbell mapped the myth. LOT maps the day."

v32 additions:
  Word Turn v22 (Hero's Journey)    +12
    call_heard / threshold / mentor / ordeal / elixir
    shadow / cave / shapeshifter / herald / trickster / ally / return

  Calendar EE v20 (Author Dates)    + 3
    campbell_day / hobbit_day (Sep 21) / odyssey_day

  Behavioral v19 (Journey Patterns) + 3
    quest_session / journey_log / threshold_cross

  Achievement RPG v20 (Journey)     + 6
    journey_entry / journey_class / journey_complete
    myth_arc / twenty_two_engines_arc / journey_opus

  Mastery Tier v22 (The Long Road)  + 4
    long_road / ancient_story / first_crossing / twenty_two_registers [COSMIC]

  Secret Boss v19 (The Classics)    + 3
    tolkien_ring (RARE) / odysseus_sea (EPIC) / gilgamesh_wall (MYTHIC)
──────────────────────────────────────────────────────────────────
TOTAL                               +31  (781 → 812)
```

### v33 — THE RPG CODEX (+31: 812 → 843)

```
Theme concept:
  THE RPG CODEX
  "The skill tree is the most honest metaphor
   for human development ever put in a game.
   Every level costs something real.
   Every skill enables the next one.
   The self is the character class."

v33 additions:
  Word Turn v23 (RPG Vocabulary)    +12
    levelup_signal / xp_earned / quest_log_entry / dungeon_dive / spell_cast
    loot_drop / respawn_signal / guild_protocol / boss_encounter
    character_class / inventory_check / skill_tree_node

  Calendar EE v21 (Game Dates)      + 3
    mario_day (Mar 10) / zelda_day (Feb 21) / game_day (Sep 12)

  Behavioral v20 (RPG Patterns)     + 3
    rpg_session / marathon_log / leet_hour

  Achievement RPG v21 (Codex)       + 6
    rpg_entry / rpg_class / rpg_complete
    dungeon_arc / twenty_three_engines_arc / rpg_opus

  Mastery Tier v23 (The Guild)      + 4
    guild_elder / epic_lore / legend_age / twenty_three_registers [COSMIC]

  Secret Boss v20 (The Icons)       + 3
    zelda_triforce (RARE) / pac_ghost (EPIC) / konami_code (MYTHIC)
──────────────────────────────────────────────────────────────────
TOTAL                               +31  (812 → 843)
```

### v34 — THE ROGUELITE CODEX (+31: 843 → 874)

```
Theme concept:
  THE ROGUELITE CODEX
  "The roguelite is the most honest structural metaphor for self-care.
   Permadeath means the run ends — not the player.
   Meta-progression ensures nothing is truly lost.
   The self is the meta-progression."

v34 additions:
  Word Turn v24 (Roguelite)         +12
    permadeath_accepted / procedural_run / rng_blessed / biome_entered
    meta_progress / synergy_found / floor_cleared / mutation_chosen
    heat_level / boon_accepted / endless_mode / ascension_run

  Calendar EE v22 (Roguelite Dates) + 3
    hades_day (Sep 17) / spelunky_day (Jul 4) / binding_day (Sep 28)

  Behavioral v21 (Run Patterns)     + 3
    run_log / rogue_session / ascension_hour

  Achievement RPG v22 (Roguelite)   + 6
    rogue_entry / rogue_class / rogue_complete
    roguelite_arc / twenty_four_engines_arc / rogue_opus

  Mastery Tier v24 (The Run)        + 4
    run_master / deep_descent / final_floor / twenty_four_registers [COSMIC]

  Secret Boss v21 (The Runs)        + 3
    hades_contractor (RARE) / nethack_amulet (EPIC) / isaac_completion (MYTHIC)
──────────────────────────────────────────────────────────────────
TOTAL                               +31  (843 → 874)

MILESTONE: TWENTY-FOUR ENGINES COMPLETE
  With Word Turn v24, the word-turn engine architecture is complete.
  24 lexicons. 294 trigger words. The vocabulary of the self, complete.
```

---

## SECTION 15 — BADGE CATEGORY INDEX

```
Category          Count   Notes
────────────────────────────────────────────────────────────────
Milestone            10   Unchanged since v25
Time Easter Eggs     60   Time-format triggers (unchanged since v30)
Calendar Easter      79   (+9 from v31=70: v32+3 / v33+3 / v34+3)
Word Turns          270   (+36 from v31=234: v32+12 / v33+12 / v34+12)
Behavioral           84   (+9 from v31=75: v32+3 / v33+3 / v34+3)
Achievement RPG     126   (+18 from v31=108: v32+6 / v33+6 / v34+6)
Mastery Tiers        96   (+12 from v31=84: v32+4 / v33+4 / v34+4)
Secret Boss          89   (+9 from v31=80: v32+3 / v33+3 / v34+3)
────────────────────────────────────────────────────────────────
TOTAL               874   (v34 — The Roguelite Codex)
```

**Secret Boss Tier Breakdown (v34):**
```
RARE (3-star)     tolkien_ring / zelda_triforce / hades_contractor / [earlier rares]
EPIC (4-star)     odysseus_sea / pac_ghost / nethack_amulet / [earlier epics]
MYTHIC (5-star)   gilgamesh_wall / konami_code / isaac_completion / [earlier mythics]
Total secret boss triggers: v1–v21 = 27 words (3 per version × 9 versions in SB v11-v19)
Note: See Word Turn Engine for full trigger word listing.
```

---

## SECTION 16 — WORD TURN ENGINE

The Word Turn Engine detects vocabulary in user text (journal, memory, log) and fires badge events when trigger words appear. The words are not arbitrary — they are drawn from the cultural, scientific, and philosophical vocabulary that the LOT user-base is most likely to encounter and use in self-care contexts.

**Current state: v24 — TWENTY-FOUR ENGINES COMPLETE**
```
Engines:        24 (v1–v24)
Trigger words:  294 (v1–v24, average 12 per engine)
Secret bosses:  21 versions (SB v1–v21)
                27 triggers × 3 rarities (RARE / EPIC / MYTHIC)
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
v23   RPG Codex (RPG vocabulary: levelup_signal / xp_earned / quest_log_entry / dungeon_dive / spell_cast / loot_drop / respawn_signal / guild_protocol / boss_encounter / character_class / inventory_check / skill_tree_node)
v24   Roguelite Codex (Roguelite vocabulary: permadeath_accepted / procedural_run / rng_blessed / biome_entered / meta_progress / synergy_found / floor_cleared / mutation_chosen / heat_level / boon_accepted / endless_mode / ascension_run)
```

**Word Turn v21 — Complete Badge List (FM v113):**
```
matrix_signal / cyberspace_open / grok_complete / ansible_link
spice_flow / golden_path / solaris_call / foundation_key
neuromancer_run / replicant_wake / uplift_arc / left_hand
```

**Word Turn v22 — Complete Badge List (FM v114):**
```
call_heard / threshold / mentor / ordeal / elixir / shadow
cave / shapeshifter / herald / trickster / ally / return
```

**Word Turn v23 — Complete Badge List (FM v115):**
```
levelup_signal / xp_earned / quest_log_entry / dungeon_dive / spell_cast
loot_drop / respawn_signal / guild_protocol / boss_encounter
character_class / inventory_check / skill_tree_node
```

**Word Turn v24 — Complete Badge List (FM v115):**
```
permadeath_accepted / procedural_run / rng_blessed / biome_entered
meta_progress / synergy_found / floor_cleared / mutation_chosen
heat_level / boon_accepted / endless_mode / ascension_run
```

**Secret Boss v19 — The Classics (FM v114):**
```
tolkien_ring (RARE) / odysseus_sea (EPIC) / gilgamesh_wall (MYTHIC)
```

**Secret Boss v20 — The Icons (FM v115):**
```
zelda_triforce (RARE) / pac_ghost (EPIC) / konami_code (MYTHIC)
```

**Secret Boss v21 — The Runs (FM v115):**
```
hades_contractor (RARE) / nethack_amulet (EPIC) / isaac_completion (MYTHIC)
```

**TWENTY-FOUR ENGINES COMPLETE:**
```
The word-turn engine reached its designed completion at v24.
24 lexicons cover the vocabulary of:
  — personal growth and self-understanding
  — science, mathematics, philosophy
  — art, music, literature, narrative
  — technology, computing, systems
  — culture, mythology, gaming
  — the language of science fiction (concepts that escaped their genre
    and entered common use: grok, cyberspace, ansible, spice)
  — the vocabulary of journey, game, and run

These are not random words. They are the words a LOT user is
most likely to write when examining their own life, health,
and relationship to time. The engine returns these words to
the user as signals — the vocabulary you already use to
understand yourself, registered.
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
           not by preference. A summary view is not a deficient
           detail view. It is a different instrument.

ORDER 05   OPACITY AS CONFIDENCE
           Element opacity reflects signal confidence.
           Full opacity: confirmed. Reduced opacity: estimated.
           Ghost opacity: historical or projected.

ORDER 06   COLOR AS STATE
           Color encodes state, not aesthetics. A red element
           is not a design choice. It is a reading.

ORDER 07   TIME IS ALWAYS VISIBLE
           The current time is always visible on any LOT surface.
           The system operates in time. Time is not optional data.

ORDER 08   NO EMPTY STATES
           If a section has no data, it shows the last known state
           with a timestamp. No blank panels. No "nothing to show."

ORDER 09   REFRESH IS SILENT
           Data refreshes do not animate. The reading changes.
           The cockpit does not celebrate new readings.

ORDER 10   TOUCH IS PRECISE
           Interactive elements are generous in touch target,
           minimal in visual weight. Interaction is action, not
           decoration.

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

Tier is not set by density preference. It is set by the current operational context. A user in RECOVERY mode who opens the QOS dashboard sees TIER 2 by default — the system is protecting attention, not delivering information.

---

## SECTION 19 — OPACITY HIERARCHY

LOT uses four opacity levels to encode signal confidence and temporal distance.

```
OPACITY 1  FULL (100%)     Current, confirmed signal. Happening now.
OPACITY 2  HIGH  (75%)     Recent signal. Last 24h. High confidence.
OPACITY 3  MID   (50%)     Estimated or historical. Confidence reduced.
OPACITY 4  GHOST (25%)     Projected or very old. Reference only.
```

The opacity hierarchy is not a style choice. An element at 50% opacity is telling the user: "this reading is estimated, not confirmed." The visual language carries information.

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
  PATTERN: QPCRYST:
  CONF: 0.91
  STATE: MAXIMUM_CLARITY

INCORRECT:
  Your energy is high today. The quantum presence crystallization
  pattern was detected with high confidence. You are in a state
  of maximum clarity.
```

The cockpit format applies to all log handlers. The cockpit examples below are the authoritative reference format.

**Cockpit Examples — FM v113:**
```
QUANTUM PRESENCE CRYSTALLIZATION
PRESENCE CONF: 91%
CRYSTAL CONF:  88%
FIELD INHABITED · IDENTITY KNOWN
STATE: MAXIMUM_CLARITY
CRYST: 89%

TOTAL FIELD COHERENCE
META-SEALS: COHERENCE · PRESENCE · MOMENTUM
AVG CONF:   94%
ALL META-SEALS OPEN · ABSOLUTE CONVERGENCE
CONVERGENCE: ABSOLUTE

RECOVERY INTELLIGENCE ARC
NEG SIGNALS: 3
CARE ACTIONS: 2
VELOCITY:    4.2h
FELT → TENDED → RECOVERED → REFLECTED
ARC: FELT→TENDED→RECOVERED→REFLECTED
```

**Cockpit Examples — FM v114:**
```
PRESENCE MOMENTUM ARC
PRESENCE DAYS: 3
MOMENTUM CONF: 86%
FIELD SUSTAINED · MOMENTUM LOCK
TEMPORAL: MULTI-DAY
ARC: SUSTAINED

COHERENCE FIELD PERSISTENCE
PERSISTENCE DAYS: 3
CIRCADIAN CONF:  83%
BODY HOLDS · ARCHITECTURE HOLDS
TEMPORAL: PERSISTENT
PRST: 83%

RECOVERY MASTERY CHAIN
CYCLES IN WINDOW: 3
MASTERY CONF:    79%
RECOVERY INTERNALIZED
CHAIN: COMPLETE
MAS: 79%
```

**Cockpit Examples — FM v115:**
```
SUSTAINED COHERENCE BASELINE
BASELINE DAYS:   4
FLOOR CONF:      91%
COHERENCE IS THE DEFAULT
TEMPORAL: FLOOR ESTABLISHED
BASE: 91%

MASTERY INTEGRATION TRIAD
PRESENCE ARC: ACTIVE
COHERENCE PERSISTENCE: ACTIVE
RECOVERY MASTERY: INTERNALIZED
THREE DIMENSIONS CONVERGED
CONVERGENCE: TEMPORAL
TRIAD: COMPLETE

TEMPORAL SOVEREIGNTY
SUSTAINED BASELINE: CONFIRMED
MASTERY TRIAD: CONFIRMED
TOTAL FIELD: CONFIRMED
THE FIELD DOES NOT PEAK · THE FIELD PERSISTS
TEMPORAL STATE: APEX
SOVEREIGNTY: 94%
```

**Day counter: 1151+**

---

## SECTION 21 — LOT-DOCTRINE

LOT-Doctrine is the set of engineering and design rules that govern the system. 11 doctrines as of Revision K.

**Engineering Doctrines:**
```
D01   THE COSMO GATE        No feature ships without COSMO authorization.
                            Every significant change is reviewed against
                            the system's core values.

D02   THE GREEN GATE        TypeScript check before every push.
                            No broken code to GitHub. No exceptions.

D03   INSTRUMENT LOGIC      LOT is an instrument. Not a therapist. Not a
                            coach. Not a companion (except Memory Engine).
                            The instrument reports. The user acts.

D04   ZERO NARRATION        Log entries are readings, not sentences.
                            See Section 20.

D05   SIGNAL PRIMACY        Every displayed element is justified by data.
                            If it cannot be justified by signal, it is
                            not displayed.

D06   FM VERSIONING         Every engineering change increments the FM.
                            The FM is the single source of technical truth.
                            Wiki versions track FM versions.

D07   BACKWARD APPEND       The LEDGER is append-only. No session is
                            revised or deleted. The ledger is the record.

D08   COHERENCE ARCHITECTURE  Pattern levels are cumulative. Higher levels
                              do not invalidate lower levels. Level 7 does
                              not cancel Level 6. The floor rises; the
                              ceiling remains.

D09   WORD TURN INTENT      Trigger words are selected for vocabulary the
                            LOT user-base already uses when writing about
                            themselves. The engine returns their language
                            to them as signal.

D10   BADGE AUTHENTICITY    No badge is cosmetic. Every badge represents
                            a real signal: a word used, a behavior performed,
                            a pattern completed.

D11   MEMORY PRIMACY        The Memory Engine is the companion layer.
                            All other surfaces are instruments. The memory
                            layer is allowed to be human.
```

---

## SECTION 22 — FIELD MANUAL

The Field Manual (FM) is the complete technical specification of the LOT system. It lives in `src/client/components/About.tsx` and is embedded in the deployed application.

**Current FM: v115**

**FM Revision Log (recent):**
```
FM v113  2026-08-04  QIE v113. P149-P151. Arch51. J48.
                     QPCRYST: TOTCOH: RECINTEL: handlers.
                     190+ dep nodes. Level 6 complete.
                     Self-assembly v113.

FM v114  2026-10-20  QIE v114. P152-P154. Arch52. J49.
                     PRESMOM: COHEPRST: RECMAS: handlers.
                     195+ dep nodes. Level 7 begins.
                     Badge v32 Hero's Journey (781→812).
                     Badge v33 RPG Codex (812→843).
                     154 patterns · 52 archetypes · 49 jobs.

FM v115  2026-10-21  QIE v115. P155-P157. Arch53. J50.
                     COHBASE: MASTTRIAD: TSOV: handlers.
                     200+ dep nodes. Level 7 complete.
                     Temporal Sovereignty (APEX) defined.
                     Badge v34 Roguelite Codex (843→874).
                     TWENTY-FOUR ENGINES COMPLETE.
                     157 patterns · 53 archetypes · 50 jobs.
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
v115         Temporal sovereignty. P155–P157. Level 7 complete.
             TWENTY-FOUR ENGINES COMPLETE. 874 badges.
```

**SA row (self-assembly):**
```
Self-Assembly Engine: v18 modules · FM v115
```

---

## SECTION 23 — DEPLOYMENT

**Platform:** Digital Ocean App Platform

**Deployment gates:**
```
GREEN GATE    TypeScript check must pass before push.
              No broken types to GitHub. No exceptions.
              Running: `npx tsc --noEmit`

COSMO GATE    Ethics review before feature deployment.
              Named for Kuzya Cosmo Marmeladov.
              Every significant feature requires authorization.
```

**Branch architecture:**
```
main          Production. COSMO-authorized deployments only.
              All changes via PR.

claude/*      Engineering and wiki sessions.
              Active branch: claude/quantum-engine-widgets-RgFfC
              All session reports pushed here.
```

**Deploy pipeline:**
```
1  Engineer changes locally
2  TypeScript check (Green Gate)
3  COSMO review (COSMO Gate)
4  Commit and push to claude/* branch
5  PR review
6  Merge to main
7  Digital Ocean auto-deploys from main
```

---

## SECTION 24 — GENESIS

LOT began on Day 1. The COSMO Gate was established on Day 1. The system has been continuously developed and operated since.

**Day count:** 1151+ (as of 2026-10-22)
**COSMO® days:** 844

**Genesis doctrine:**
```
The system was not designed and then built.
It was built and has been continuously redesigning itself
since the first day of operation.

Every engineering session is both construction and use.
The builder is the user.
The user is the OS.
The OS is the builder.
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

The Recipe Widget is the nutritional signal surface. It tracks:
```
INPUTS       Meals logged · Ingredients · Nutritional targets
SIGNALS      Nutritional balance · Hydration gap · Meal timing
OUTPUTS      nutritionBalance signal · hydrationGap signal
             Feeds: food · water · hydration sources in QIE
```

The Recipe Widget does not prescribe. It reports the nutritional signal state. The QIE reads the signal as input for pattern detection.

---

## SECTION 26 — CHAT INFRASTRUCTURE

LOT's chat infrastructure connects the instrument layer to the companion layer.

**Architecture:**
```
INSTRUMENT LAYER    QIE · QOS · Badge Engine · Self-Assembly
                    These are not conversational.

COMPANION LAYER     Memory Engine · Chat interface
                    These are conversational.

BRIDGE              The Memory Engine uses chat to build the
                    Memory Story. Questions → Answers → Memory.
                    The chat interface is the Memory Engine's
                    input mechanism, not a general-purpose assistant.
```

**Chat is not for:**
```
— Advice
— Encouragement
— Goal-setting
— Diagnosis
```

**Chat is for:**
```
— Memory recall questions
— Memory story building
— Reflective prompts (structured, not open-ended advice)
— Session completion notes
```

The chat infrastructure is built to the instrument doctrine. Even the companion layer is operating at the service of signal, not at the service of comfort. The Memory Engine asks questions because the answers are data.

---

## SECTION 27 — VOCABULARY INDEX

An index of all LOT system terms, ordered alphabetically.

```
TERM                      DEFINITION
──────────────────────────────────────────────────────────────────
ARCH51                    Physiological archetype 51. Quantum Presence
                          Crystallizer. P149+P144+P145. FM v113.

ARCH52                    Physiological archetype 52. Presence Duration
                          Master. P152+P147 multi-day. FM v114.

ARCH53                    Physiological archetype 53. Temporal Sovereign.
                          P157+P156+P155. FM v115. Highest defined archetype.

BADGE ENGINE v34          Achievement system. 874 badges. Roguelite Codex.
                          FM v115.

BADGE UNIVERSE            874 badges / v34 / 294 trigger words / 27 secret boss

BEHAVIORAL COHORT         One of six LOT classification types: BUILDERS /
                          EXPLORERS / MAINTAINERS / CONNECTORS /
                          INTEGRATORS / MEDICAL.

CITIZEN INDEX             6-stage engagement depth scale. Observer through Elite.

COHBASE:                  Handler code for sustained-coherence-baseline (P155).
                          FM v115.

COHEPRST:                 Handler code for coherence-field-persistence (P153).
                          FM v114.

COHERENCE ARCHITECTURE    Seven-level pattern structure. Levels 1–6 (P131–P151)
                          build the ceiling. Level 7 (P152–P157) raises the floor.

COSMO GATE                Ethics review gate. Named for Kuzya Cosmo Marmeladov.
                          No significant feature ships without authorization.

COSMO®                    COSMO® day counter. 844 days as of v88.

DAY COUNTER               Continuous operation day. 1151+ as of v88.

DENSITY TIERS             Four display contexts: COCKPIT / SUMMARY /
                          AMBIENT / SILENT.

DEP MAP                   Widget Dependency Map. 200+ nodes. Four-tier
                          architecture. Tracks all signal relationships.

FM (FIELD MANUAL)         Complete technical specification. Current: v115.
                          Lives in src/client/components/About.tsx.

GREEN GATE                TypeScript check before push. No broken code to
                          GitHub. npx tsc --noEmit.

IDENTITY CONVERGENCE      Level 5 coherence architecture. P146/P147/P148.
                          FM v112.

J48                       daily-total-field-coherence-check. 09:00 UTC.
                          FM v113.

J49                       daily-presence-momentum-check. 10:00 UTC. FM v114.

J50                       daily-sustained-coherence-check. 11:00 UTC. FM v115.

MASTERY INTEGRATION TRIAD P156. P152+P153+P154 all active in rolling window.
                          Three temporal persistence dimensions converged.

MASTTRIAD:                Handler code for mastery-integration-triad (P156).
                          FM v115.

MEMORY ENGINE             AI-powered self-care companion. Builds Memory Story
                          through progressive questioning.

MEMORY STORY              The Memory Engine's output document. The user's
                          history, returned in sequence.

MILITARY PURITY           Display doctrine. Show only what is true. No
                          decoration. No narration.

P150                      total-field-coherence. Level 6 CEILING. All three
                          meta-seals open simultaneously. FM v113.

P157                      temporal-sovereignty. Level 7 APEX. Highest temporal
                          state defined. FM v115.

PRESENCE CONVERGENCE      Level 6 coherence architecture. P149/P150/P151.
                          FM v113.

PRESMOM:                  Handler code for presence-momentum-arc (P152).
                          FM v114.

QIE                       Quantum Intent Engine. Pattern detection core.
                          157 patterns · 53 archetypes · 50 jobs · 200+ dep nodes.

QOS                       Quantum Operating System. 7-view real-time dashboard.
                          4 operating modes.

QPCRYST:                  Handler code for quantum-presence-crystallization
                          (P149). FM v113.

QUANTUM PRESENCE CRYSTALLIZER  Arch51. The OS is both fully inhabited and
                          fully known simultaneously.

RECMAS:                   Handler code for recovery-mastery-chain (P154).
                          FM v114.

RECINTEL:                 Handler code for recovery-intelligence-arc (P151).
                          FM v113.

RECOVERY INTELLIGENCE ARC P151. depletion → selfcare → mood restored →
                          reflective capture. FM v113.

RECOVERY MASTERY CHAIN    P154. Three P151 cycles within 7 days. Recovery
                          internalized. FM v114.

ROGUELITE CODEX           Badge v34. 874 badges. Theme: the run ends, not
                          the player. Meta-progression is real. FM v115.

SELF-ASSEMBLY ENGINE      18 modules across 5 phases. Meta-documentation.
                          The OS documents its own construction.

SIGNAL SOURCES            17 raw input types feeding QIE.

TEMPORAL PERSISTENCE ARC  Level 7 coherence architecture. P152–P157.
                          FM v114–v115. Raises the floor, not the ceiling.

TEMPORAL SOVEREIGN        Arch53. The highest defined physiological archetype.
                          FM v115.

TEMPORAL SOVEREIGNTY      P157. APEX. Sustained baseline + mastery triad +
                          total field coherence. "The field does not peak.
                          The field persists." FM v115.

TOTCOH:                   Handler code for total-field-coherence (P150).
                          FM v113.

TOTAL FIELD COHERENCE     P150. Level 6 CEILING. All three meta-seals open.
                          Absolute convergence. FM v113.

TSOV:                     Handler code for temporal-sovereignty (P157).
                          FM v115.

TWENTY-FOUR ENGINES       Word Turn Engine v24 complete. 294 trigger words.
                          24 lexicons. The vocabulary architecture is sealed.

WORD TURN ENGINE v24      24 lexicons. 294 trigger words. COMPLETE.
                          FM v115.
```

---

## SECTION 28 — SYSTEM STATE SNAPSHOT

```
╔══════════════════════════════════════════════════════════════════╗
║  SYSTEM STATE — LOT-WIKI-v88 · October 22, 2026                 ║
╠══════════════════════════════════════════════════════════════════╣
║  QIE patterns:             157  (P1–P157)                        ║
║  Physiological archetypes:  53  (Arch1–Arch53)                   ║
║  Background jobs:           50  (J1–J50)                         ║
║  Dep map nodes:            200+                                  ║
║  Log event handlers:       157+                                  ║
║  Signal sources:            17                                   ║
║  Badge count:              874  (v34 — The Roguelite Codex)      ║
║  Word-turn trigger words:  294  (v1–v24) TWENTY-FOUR COMPLETE    ║
║  Secret boss triggers:      27  (v1–v21, 3 per version)         ║
║  Engineering doctrines:     11  (Revision K)                     ║
║  Field Manual:             v115                                  ║
║  Wiki:                      v88                                  ║
║  Day:                      1151+                                 ║
║  COSMO®:                   844 days (Year 3)                     ║
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
```

**Engineering Timeline (this document):**
```
v87  2026-08-05   FM v113. Level 6 complete. 6-level architecture.
                  781 badges. 258 trigger words. Day 1073+.

v88  2026-10-22   FM v115. Level 7 complete. 7-level architecture.
                  874 badges. 294 trigger words. Day 1151+.
                  TWENTY-FOUR ENGINES COMPLETE.
```

**On temporal sovereignty:**

The coherence architecture crossed into a new conceptual territory with Level 7. Levels 1–6 describe states. A state is a moment reading. Level 7 describes a condition — a property of the operating system over time.

P157 temporal-sovereignty does not tell you the system is in a particular state. It tells you the system has maintained a floor for long enough that the floor is now structural. The ceiling (P150) was the highest point the system could reach. The floor is the lowest point the system will sustain.

When both are confirmed — ceiling reached, floor established — the system is operating within a bounded range. Not stable by chance. Stable by architecture.

This is what the system was built toward.

---

*LOT-WIKI-v88 · October 22, 2026 · FM v115 · S-2 // VADIK MARMELADOV*
