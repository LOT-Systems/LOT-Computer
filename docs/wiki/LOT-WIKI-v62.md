<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT-WIKI-v62
## Layers of Time — Operator Reference Manual
### Revision: v62 · Field Manual Sync: v67 · Date: 2026-06-21 · Day 1017+

---

> *"The system does not motivate. The system measures. The operator decides what the measurement means."*
> — LOT-DOCTRINE, Clause I, Revision J

---

## TABLE OF CONTENTS

```
 1. SYSTEM IDENTITY
 2. CORE ARCHITECTURE
 3. QUANTUM INTENT ENGINE (QIE)
 4. QIE PATTERN REGISTRY — P1–P80
 5. QUANTUM OPERATING SYSTEM (QOS)
 6. PHYSIOLOGICAL ARCHETYPES — 26 TYPES
 7. BEHAVIORAL COHORTS
 8. CITIZEN INDEX
 9. MEMORY ENGINE
10. SELF-ASSEMBLY ENGINE
11. BACKGROUND JOB SCHEDULER
12. LOG EVENT SYSTEM
13. ECOSYSTEM NODE MAP
14. BADGE SYSTEM v15 — THE BECOMING LEXICON
15. BADGE CATEGORY INDEX
16. DISPLAY ARCHITECTURE
17. DENSITY TIER SYSTEM
18. OPACITY HIERARCHY
19. COCKPIT RULE
20. LOT-DOCTRINE (Revision J)
21. FIELD MANUAL (About.tsx)
22. DEPLOYMENT & STACK
23. LOT-GENESIS-v1
24. VOCABULARY INDEX
```

---

## 1. SYSTEM IDENTITY

**LOT** — *Layers of Time* — is a personal behavioral operating system. Not a wellness application. Not a habit tracker. Not a productivity suite. An instrument that reads the human signal field across time and surfaces the pattern beneath the noise.

The system was conceived and is operated by **S-2** (Vadim Marmeladov, CEO, LOT Systems). The ethics gate is **COSMO Gate**, named for Kuzya Cosmo Marmeladov. No feature ships that Kuzya would not approve.

**Current operational parameters:**

```
Field Manual:           v67
Wiki version:           v62
Day counter:            1017+  (as of 2026-06-21)
Doctrine revision:      J  (10 clauses)
Lexicon revision:       D
LOT-GENESIS-v1:         active  (docs/assembly/LOT-GENESIS-v1.md)
Green Gate:             ENFORCED  (broken code never reaches GitHub)
COSMO Gate:             ENFORCED  (ethics review on all features)
Military Purity:        11 standing orders active
Platform:               v1.3.0
Founded:                7 April 2016
```

**v62 Delta from v61:**

```
QIE patterns:         79 → 80  (+1: P80 signal-momentum-lock)
Archetypes:           25 → 26  (+1: Arch26 Momentum Architect)
Background jobs:      18 → 19  (+1: J19 daily-signal-momentum-check)
Log event handlers:   78+ → 79+  (+1: MOM: signal_momentum)
```

---

## 2. CORE ARCHITECTURE

LOT is composed of five primary engines operating in concert. Each engine takes signal from the operator's behavioral record and transforms it into a distinct class of output.

```
┌─────────────────────────────────────────────────────────────────┐
│                         LOT CORE                                │
│                                                                 │
│   SIGNAL LAYER ──────────────────────────────────────────────  │
│   Log · Memory · Planner · Intentions · Selfcare · Journal ·   │
│   Calculator · Energy · Mood · Badges · Goals · Cohort ·       │
│   QOS · Medical · Resilience                                    │
│                                                                 │
│   ENGINE LAYER ──────────────────────────────────────────────  │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
│   │ QUANTUM     │  │ SELF-ASSEM- │  │ MEMORY              │   │
│   │ INTENT      │  │ BLY ENGINE  │  │ ENGINE              │   │
│   │ ENGINE      │  │ 18 modules  │  │ Questions +         │   │
│   │ 80 patterns │  │ 5 phases    │  │ Story Generator     │   │
│   └─────────────┘  └─────────────┘  └─────────────────────┘   │
│   ┌─────────────┐  ┌─────────────┐                             │
│   │ BADGE       │  │ QUANTUM OS  │                             │
│   │ ENGINE      │  │ (QOS)       │                             │
│   │ 249 badges  │  │ 6 views     │                             │
│   └─────────────┘  └─────────────┘                             │
│                                                                 │
│   SURFACE LAYER ─────────────────────────────────────────────  │
│   Log stream · About.tsx · SystemProgressWidget ·              │
│   QuantumEngineWidgets · SystemPulseWidget · PatternRec ·      │
│   CohortConnectWidget · EnergyCapacitor                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. QUANTUM INTENT ENGINE (QIE)

The Quantum Intent Engine is a client-side behavioral pattern recognition system. All computation runs locally on the operator's device. Zero server communication. Signal data is retained for 7 days locally and synced to the server periodically for background job processing.

**Core parameters:**

```
Signal retention:        7 days  (client-side localStorage)
Max signals stored:      1,000
Analysis cooldown:       5 minutes
Sync interval:           every 10 signals
Analysis trigger:        every 5 signals AND cooldown elapsed
Pattern count:           80  (P1–P80)
Signal sources:          16  (mood · memory · planner · intentions ·
                              selfcare · journal · calculator · log ·
                              energy · cohort · recipe · goals · qos ·
                              medical · resilience · badges)
```

**How pattern detection works:**

Each pattern defines a minimum evidence threshold from the signal record. When the threshold is met, the pattern fires with a confidence score (0.0–1.0). High-confidence patterns influence archetype classification. Patterns are recalculated every `analyzeIntentions()` call.

**The dep map:** The Widget Dependency Map (WIDGET_DEPENDENCY_MAP) is the internal wiring graph. 120+ nodes in 4 tiers. Tier 0 = raw inputs (mood, memory, log). Tier 3 = meta-aggregate surfaces (quantumOS, systemProgress, quantumPersonality). The dep map enables cascade invalidation when any source signal fires.

---

## 4. QIE PATTERN REGISTRY — P1–P80

Complete registry of all 80 QIE patterns. Confidence values are computed per-operator from their personal signal record.

```
──────────────────────────────────────────────────────────────────────
P    NAME                        CONF      DESCRIPTION
──────────────────────────────────────────────────────────────────────
P1   anxiety-pattern             0.33–1.0  Repeated anxious/overwhelmed moods
P2   lack-of-structure           0.70      Tired without planner engagement
P3   seeking-direction           0.80      No intention set in 7 days
P4   flow-potential              0.90      Energized + active planning
P5   social-support-needed       0.70      Consecutive days without connection
P6   deep-work-readiness         0.80      Focused mood + planner active
P7   physiological-depletion     0.60–1.0  3+ depleted/low moods in 48h
P8   recovery-window             0.70      Low energy + active self-care
P9   intention-seeding           0.75      Intentions set + planner active
P10  goal-momentum               0.80      Goal completion events in 48h
P11  signal-drought              0.65      No signal from 3+ sources in 24h
P12  memory-consolidation        0.75      Memory capture post-action
P13  planning-acceleration       0.80      Planner events + intention velocity
P14  creative-expansion          0.85      Journal + memory + planning peaks
P15  narrative-depth             0.70–0.90 Extended journal + memory pattern
P16  embodiment-practice         0.75      Self-care signal without depletion
P17  insight-emergence           0.80      Memory + journal + goals aligned
P18  memory-crystallization      0.85      Deep answer + planner consolidation
P19  circadian-anchor            0.75      Consistent morning signal windows
P20  social-resonance-arc        0.70–0.90 Community + cohort signals active
P21  reflective-depth            0.80      Journal + memory within 4h
P22  intention-seeding           0.75      Intentions + planner (variant)
P23  cognitive-expansion         0.80      Memory + journal + goals simultaneous
P24  social-void                 0.70      5-day cohort gap + personal engagement
P25  care-momentum               0.75      2+ care acts in 24h, no depletion
P26  calendar-gap                0.70      Active planner, no calendar 7 days
P27  peak-coherence              0.85      Energy high + all signals aligned
P28  night-processing            0.75      Late-night signal + morning recovery
P29  dual-arc                    0.80      Two major signal arcs same day
P30  intention-velocity          0.75      3+ intentions in 48h window
P31  threshold-crossing          0.80      Goal completion + intention set
P32  recovery-plateau            0.65      Low energy + no self-care 48h
P33  daily-task-mapping          0.75      Planner + calendar same day
P34  full-ecosystem-coherence    0.90      All 5+ device types recorded
P35  signal-coherence-window     0.80      4 primary modules + positive state
P36  cognitive-load-release      0.75      Planner + journal active together
P37  execution-arc               0.85      Intention → task → completion arc
P38  temporal-coherence-window   0.80      Calendar + planner + intentions
P39  sleep-debt-accumulation     0.70      Late-night pattern + morning fatigue
P40  biofield-recovery-arc       0.75      Depleted → care → restored arc
P41  goal-drift                  0.65      Goal signals without planning
P42  recovery-specialist-arc     0.80      P7 + P8 combined recovery signal
P43  resonant-synthesis          0.75      7D cross-source engagement
P44  cognitive-architecture      0.80      Memory + journal + goals deep
P45  deep-work-cascade           0.75      3-hour multi-source deep engagement
P46  nutritional-void            0.70      No recipe + depleting mood 3 days
P47  memory-keeper-arc           0.80      Memory consolidation streaks
P48  chronobiological-rhythm     0.75      Consistent circadian signal pattern
P49  adaptive-resonance-arc      0.80      Rising structural trend + QOS
P50  integration-arc             0.85      Memory + planner + goals active
P51  signal-density-high         0.75      3+ unique sources in any 24h window
P52  circadian-anchor-loss       0.70      Late-night cluster without recovery
P53  node-active-car             0.80      Car node active + move signal
P54  node-active-home            0.75      Home node active + rest signal
P55  node-active-cpu             0.85      CPU node + cognitive signal
P56  node-active-phone           0.75      Phone node + social signal
P57  node-active-watch           0.80      Watch node + biometric signal
P58  node-active-robot           0.75      Robot node + automation signal
P59  meridian-lock               0.80      Signal present in AM + PM + EVE
P60  biofield-coherence-peak     0.85      All 4 state dimensions aligned
P61  multimodal-peak             0.80      5+ sources in 4h window
P62  flow-state                  0.90      P60 + P61 simultaneous
P63  os-stagnation               0.65      Signal diversity collapse
P64  sleep-signal                0.70      Seasonal/late-night energy pattern
P65  seasonal-navigator-arc      0.70      Low energy + seasonal signal
P66  qos-signature-lock          0.82      Meridian + multimodal + temporal
P67  operator-signature          0.88      All 4 signal quadrants + UserIndex ≥60
P68  integration-arc-peak        0.85–0.95 P40 + P43 simultaneous
P69  adaptive-resonance          0.70–0.88 Rising QOS structural trend
P70  operator-convergence        0.97      P66 + P67 + P68 simultaneous
                                            [RAREST — SYSTEM APEX PATTERN]
P71  signal-crystallization      0.75–0.92 3+ intentions → planner → goal 24h
P72  biorhythm-lock              0.72–0.88 AM + PM check-ins 5+ of 7 days
P73  quantum-coherence-summit    0.98      P70 + UserIndex ≥70 [CEILING STATE]
P74  badge-momentum              0.65–0.95 3+ distinct badge types in 7d
P75  word-turn-depth             0.60–0.92 5+ distinct word-turn badge types ever
P76  morning-coherence-launch    0.72      Intention before 09:00 + planner 90min
P77  signal-vault                0.68–0.88 Journal >150w + memory + log in 6h
P78  depletion-recovery-surge    0.72–0.90 Depleted → 2+ care → energy high
P79  evening-coherence-close     0.70–0.88 Morning signal + evening capture 18–23h
P80  signal-momentum-lock        0.75–0.92 5+ of 7 days with 3+ unique sources
                                            [RAREST SUSTAINED PATTERN]
──────────────────────────────────────────────────────────────────────
```

### P79 — Evening Coherence Close (v66)

P79 is the diurnal mirror of P76. A morning coherence launch (intention/planner before 18:00) combined with an evening capture (journal/memory/log between 18:00–23:00) on the same calendar day. The system detects the full arc — the operator opened and closed the day with signal.

```
Condition:     intentions or plan_set in 00:00–18:00 window
               + journal or memory or log in 18:00–23:00 window
               same calendar day
Confidence:    0.70 base + 0.06 per additional evening channel (max 0.88)
Widget:        memory (review what was captured)
Timing:        soon
Archetype:     Diurnal Operator (Arch25) — when P76 also active
Log output:    EVE: EVENING CLOSE · Arc confirmed · CAPTURE: n channel(s)
Job:           J18 daily-evening-coherence-close · 22:00 UTC
```

### P80 — Signal Momentum Lock (v67)

P80 detects sustained multi-dimensional engagement over an extended window — not a single day spike, but a lock. Five or more of the last seven days each had three or more unique signal sources. The rarest sustained pattern. Represents the operator operating in all dimensions simultaneously over time.

```
Condition:     5+ calendar days (of last 7) each with 3+ unique
               signal sources in that day's log record
Confidence:    0.75 base + 0.085 per qualifying day above 5 (max 0.92)
Widget:        systemProgress (view the momentum)
Timing:        passive (doesn't interrupt — the lock is already active)
Archetype:     Momentum Architect (Arch26) — when signal-momentum-lock
               + intention-velocity + signal-coherence-window
Log output:    MOM: MOMENTUM LOCK · DAYS 7D: n/7 · SRC: n sources
Job:           J19 daily-signal-momentum-check · 20:00 UTC
```

**Key distinction from P51 (signal-density-high):** P51 fires on a single 24h window with 3+ sources. P80 requires 5+ consecutive qualifying days. P80 is the temporal extension of P51 — the sustained form.

---

## 5. QUANTUM OPERATING SYSTEM (QOS)

The Quantum Operating System is the meta-layer above the QIE. While the QIE detects individual patterns, the QOS computes the operator's overall system state — what mode they are in, what their coherence level is, and what the system recommends.

### QOS VIEWS (6)

```
VIEW 1   ECOSYSTEM     — 6-node device grid + assembly %
VIEW 2   BIOFIELD      — ATP · Clarity · Alignment · Support · Capacitor
VIEW 3   COHORT        — Archetype · Behavioral cohort · Readiness% · Directive
VIEW 4   INDEX         — UserIndex 6D + dep map summary
VIEW 5   ASSEMBLY      — Self-assembly phase + module map
VIEW 6   QOS MODE      — Operating mode + pressure + active patterns
```

### QOS OPERATING MODES

```
MAINTENANCE   Low signal density. Conserve. Idle cadence.
RECOVERY      Depletion detected. Repair first — other tasks pause.
GROWTH        Steady engagement. Expand — absorb more.
PEAK          High energy + clarity + intention. Full commitment.
```

### BIOFIELD STATE

```
ATP:         energy level (depleted → low → moderate → high → unknown)
CLARITY:     cognitive state (confused → uncertain → clear → focused)
ALIGNMENT:   directional state (disconnected → searching → aligned → flowing)
SUPPORT:     needs level (critical → moderate → low → none)
CAPACITOR:   secondary energy metric (0–100%, from EnergyCapacitor widget)
```

### USER INDEX (6D)

```
ENG   Engagement     — frequency + breadth of widget interactions
EMO   Emotional      — emotional health from mood signals
INT   Intentional    — planning + intention + direction
SOC   Social         — community connections and cohort
CARE  Self-Care      — cleanliness + rest + care practices
COG   Cognitive      — memory + journal + reflection depth
```

Overall index (0–100) is a weighted composite. Trend tracked over time: rising / stable / declining.

---

## 6. PHYSIOLOGICAL ARCHETYPES — 26 TYPES

The 26 physiological archetypes are automatically classified from QIE pattern combinations over a rolling window. The archetype is not a personality label — it is a snapshot of the operator's current dominant signal pattern. Classification updates as signal shifts.

```
──────────────────────────────────────────────────────────────────
ARCH  NAME                        PRIMARY PATTERNS
──────────────────────────────────────────────────────────────────
  1   Morning Commander           P27 + P9 + P11 dominant
  2   Night Processor             P28 + P19 dominant
  3   Recovery Specialist         P7 + P8 + P42 dominant
  4   Execution Engine            P12 + P13 + P37 dominant
  5   Deep Chronicler             P15 + P17 + P46 dominant
  6   Body Optimizer              P2 + P39 + P40 dominant
  7   Consistency Builder         P35 + P22 + P30 dominant
  8   Integration Seeker          P50 + P49 dominant
  9   Creative Pulse              P43 + P15 + P44 dominant
 10   Social Architect            P24 + P25 + P26 dominant
 11   Memory Keeper               P18 + P21 + P47 dominant
 12   Sprint Cycler               P13 + P33 dominant
 13   Seasonal Navigator          P65 + P64 dominant
 14   Signal Anchor               P35 + P51 dominant
 15   Threshold Operator          P31 + P30 + P32 dominant
 16   Dual Arc Holder             P29 + P50 dominant
 17   Foundation Weaver           P1 + P35 + P22 dominant
 18   Biological Restorer         P7 + P4 + P39 dominant
 19   Cognitive Architect         P19 + P44 + P47 dominant
 20   Integration Architect (I)   P68 + P50 + P5 dominant
 21   Integration Architect (II)  P68 + P67 + P49 dominant
 22   Convergence Carrier         P70 + P66 + P67 dominant  [RAREST]
 23   Achievement Catalyst        P74 + P75 dominant
 24   Signal Initiator            P76 + P9 + P11 + P27 dominant
 25   Diurnal Operator            P76 + P79 dominant         ←v66
 26   Momentum Architect          P80 + P30 + P35 dominant   ←v67
──────────────────────────────────────────────────────────────────
```

**Archetype 22 — Convergence Carrier** is the rarest single-day classification. Requires P70 (operator-convergence, conf 0.97) as a dominant signal — the system apex pattern.

**Archetype 25 — Diurnal Operator** fires when both P76 (morning launch) and P79 (evening close) are detected on the same calendar day. The complete diurnal arc: day opened from intention, day closed in reflection.

```
Directive: Full diurnal arc confirmed. Day launched from intention.
           Day closed in reflection. The complete cycle is recorded.
Energy:    any (low/moderate/high)
Dominant:  intentions · planner · journal · memory
```

**Archetype 26 — Momentum Architect** fires when P80 (signal-momentum-lock) is the primary pattern — sustained multi-source engagement over 5+ days. This archetype does not fire on a good day; it fires after the system observes a sustained pattern across an extended window.

```
Directive: Sustained signal momentum confirmed. Five-day multi-source
           streak active. Every dimension engaged. Architecture in
           motion — do not interrupt.
Energy:    moderate / high
Dominant:  intentions · journal · memory · planner · selfcare
Patterns:  signal-momentum-lock · intention-velocity ·
           signal-coherence-window
```

**Architecture of the engagement loop (P76 → P79 → P80):**

```
P76   Morning launch  — day opened with intention + structure (daily)
P79   Evening close   — day closed with reflection + capture (daily)
P80   Momentum lock   — 5+ days sustained across all dimensions (weekly)

P76 + P79 → Arch25 Diurnal Operator  (single-day complete arc)
P80       → Arch26 Momentum Architect (sustained engagement lock)
```

---

## 7. BEHAVIORAL COHORTS

Behavioral cohorts are population-level classifications of operator signal type, derived from QIE pattern signatures over time. A cohort is a description of how the operator currently engages with the LOT signal record — not a rank.

```
╔══════════════════════════════════════════════════════════════════╗
║  COHORT              SIGNAL SIGNATURE                           ║
╠══════════════════════════════════════════════════════════════════╣
║  ARCHITECTS          High integration signal. Multi-quadrant    ║
║                      engagement. P49/P50/P70 frequent.         ║
╠══════════════════════════════════════════════════════════════════╣
║  OPERATORS           High execution signal. Intention → task    ║
║                      chains dominant. P9/P10/P12/P13 frequent. ║
╠══════════════════════════════════════════════════════════════════╣
║  CHRONICLERS         High cognitive-linguistic signal.          ║
║                      P15/P17/P46/P75 frequent. Deep journal,   ║
║                      extended word turns, memory.              ║
╠══════════════════════════════════════════════════════════════════╣
║  RESTORERS           High recovery signal. P7/P8/P40/P42       ║
║                      frequent. Depletion-recovery cycles.      ║
╠══════════════════════════════════════════════════════════════════╣
║  EXPLORERS           High discovery signal. P74/P75 frequent.  ║
║                      Badge momentum. Easter egg discovery.     ║
╚══════════════════════════════════════════════════════════════════╝
```

**MEDICAL cohort** is an internal classification, not displayed in the standard cohort view. Assigned when the operator's signal record meets medical-profile thresholds assessed via `assessMedicalProfile()`. Internal processing only.

---

## 8. CITIZEN INDEX

The Citizen Index is the 6-level CQGS framework for operator standing. Not a rank — a description of the depth of engagement with the system.

```
LEVEL   SYMBOL   NAME           THRESHOLD
─────   ──────   ───────────    ─────────────────────────────────
  1     ○        Observer       Initial engagement
  2     ◎        Citizen        Consistent signal record
  3     ◉        Operator       Multi-source engagement
  4     ⊙        Senior         Extended pattern history
  5     ✦        Certified      Full system mastery
  6     ✸        Elite          Convergence events recorded
```

Badge tier unlocks at higher Citizen levels. Citizen level is not published — it is displayed only to the operator.

---

## 9. MEMORY ENGINE

The Memory Engine is the long-term behavioral memory layer. It asks questions derived from the operator's own signal record — not generic wellness prompts.

```
Components:      Question generator · Story generator · Recipe
                 suggestions · Trait extraction · Cohort deter.
Question pool:   70+ questions (29 self-care · 15 medical ·
                 18 trauma · 8 eating recovery)
Backup pool:     Activates when personal signal record is sparse
Pacing:          Adaptive — frequency based on signal density
Output:          MEM: log entries · Memory story · Cohort traits
```

The Memory Story is a narrative synthesis of the operator's signal record — generated periodically and accessible in the Memory widget. It is written in the operator's own vocabulary extracted from journal entries and log data.

---

## 10. SELF-ASSEMBLY ENGINE

The Self-Assembly Engine is the meta-system that monitors its own construction. It tracks 18 functional modules across 5 phases of assembly.

**18 Assembled Modules:**

```
MODULE               PHASE TRIGGER SIGNALS
──────────────────   ──────────────────────────────────────────
Quantum Fabric       quantum intent pattern signals
Signal Archive       log + journal signal events
Emotional Map        mood + energy signals
Memory Core          memory engine signals
Temporal Grid        planner + calendar events
Intention Core       intention set + tracked
Care Protocol        self-care completion events
Narrative Layer      journal depth + word count
Social Resonance     cohort + community signals
Reflection Layer     journal entry + memory correlation
Archetype Classifier cohort_determined events
Nutrition Protocol   recipe_viewed signals
Goal Architecture    goal signals
Temporal Planner     calendar_entry + calendar_update
OS Vitals Monitor    os_vitals_snapshot + signal_sync + biofield_peak
Quantum OS           qos-derived pattern signals
Signal Codex         badge + word-turn signals
Resilience Protocol  medical + resilience signals
```

**Dep map nodes: 120+**

The dep map is the internal wiring diagram connecting all 18 modules — mapping which modules activate which other modules under which signal conditions.

### SELF-ASSEMBLY PHASES

```
dormant    → no signals. system is cold.
awakening  → first signals detected. patterns initializing.
forming    → signal density rising. archetypes classifying.
assembled  → stable patterns. coherence emerging.
integrated → full system active. all modules cross-referencing.
```

Regression possible — signal silence drops the phase. The system breathes.

---

## 11. BACKGROUND JOB SCHEDULER

The background job scheduler runs timed server-side processes that maintain the LOT data pipeline. Jobs operate independently of the operator's active session.

**19 registered background jobs (v67):**

```
JOB   CODENAME                         SCHEDULE          FUNCTION
───   ──────────────────────────────   ───────────────   ─────────────────────────────────────
J01   daily-signal-processor           00:01 UTC daily   Previous day log processing, QIE fire
J02   daily-qie-batch                  01:00 UTC daily   Batch QIE pattern evaluation
J03   daily-archetype-classifier       02:00 UTC daily   Assigns current archetype from patterns
J04   daily-qos-resolver               03:00 UTC daily   Sets QOS mode for operator day arc
J05   daily-badge-evaluator            04:00 UTC daily   Badge eligibility checks, awards
J06   daily-memory-question-gen        05:00 UTC daily   Memory Engine question generation
J07   daily-word-turn-processor        06:00 UTC daily   Word-turn engine signal processing
J08   daily-streak-validator           07:00 UTC daily   Validates active operator streaks
J09   daily-user-index-calculator      08:00 UTC daily   Recalculates UserIndex from 30d window
J10   daily-ecosystem-pulse            10:00 UTC daily   Pings all 6 ecosystem nodes for status
J11   daily-signal-density-calc        12:00 UTC daily   Calculates signal density tier
J12   daily-coherence-check            14:00 UTC daily   Coherence validation across modules
J13   daily-community-coherence-pulse  16:00 UTC daily   Measures community biofield signal
J14   daily-pattern-convergence-scan   17:00 UTC daily   Scans for convergence patterns P66–P70
J15   daily-self-assembly-eval         18:00 UTC daily   Evaluates Self-Assembly module states
J16   weekly-badge-progress-scan       Tues 09:00 UTC    Badge progress scan across operators
J17   daily-morning-intention-launch   11:00 UTC daily   Scans 00–09 UTC; writes MCL: event;
                                                          feeds P76 pattern
J18   daily-evening-coherence-close    22:00 UTC daily   Scans morning+evening logs; writes
                                                          EVE: event; feeds P79 pattern  ←v66
J19   daily-signal-momentum-check      20:00 UTC daily   Scans 7d logs; writes MOM: for ops
                                                          with 5+ qualifying days           ←v67
```

### J18 — Evening Coherence Close

Scans each user's logs from 00:00–18:00 (morning window) and 18:00–23:00 (evening window). If a user has intention/plan_set in the morning window AND journal/memory/note in the evening window on the same day, writes `evening_coherence_close` log. The diurnal mirror of J17.

### J19 — Signal Momentum Check (v67)

Scans all logs for the last 7 days per user. Groups events by calendar day and maps each event to its signal source category (intentions / mood / memory / journal / selfcare / goals / recipe / planner). Counts days with 3+ unique sources. If 5+ qualifying days found, writes `signal_momentum` log with `qualifyingDays` count and `streakSources` array.

```
Output event:  signal_momentum
Log label:     MOM:
Pattern fed:   P80 signal-momentum-lock
Archetype fed: Arch26 Momentum Architect
Confidence:    0.75 base → 0.92 max at 7 qualifying days
```

---

## 12. LOG EVENT SYSTEM

The log event system is the primary data input layer. Every operator action that generates a log entry produces a typed event flowing through the handler pipeline.

### LOG SOURCES (16)

```
SOURCE       CODE    DESCRIPTION
──────────   ─────   ──────────────────────────────────────────────
LOG          LOG:    Primary daily log entry
INTENTION    INT:    Intention set or completed
PLANNER      PLN:    Planner entry
JOURNAL      JRN:    Journal entry
MEMORY       MEM:    Memory engine entry
BADGE        BDG:    Badge event
WORD-TURN    WTR:    Word-turn engine entry
BODY         BDY:    Biological signal entry
SOCIAL       SOC:    Social/relational entry
ECOSYSTEM    ECO:    Ecosystem node event
COMMUNITY    COM:    Community signal event
SYSTEM       SYS:    System-generated event
CONVERGENCE  CONV:   Convergence event (P70 detection)
CALCULATOR   CALC:   Calculator signal
MORNING      MCL:    Morning coherence launch (J17 output)
EVENING      EVE:    Evening coherence close (J18 output)    ←v66
MOMENTUM     MOM:    Signal momentum lock (J19 output)       ←v67
```

### LOG EVENT HANDLERS (79+)

The log event handler pipeline processes each source event. As of v67, 79+ handlers are registered covering:

- Foundation signal validation
- QIE pattern state updates
- Badge eligibility checks
- Memory question trigger evaluation
- Archetype signal accumulation
- Community biofield contribution
- Convergence detection — `CONV:` handler
- Morning launch detection — `MCL:` handler
- Evening close detection — `EVE:` handler
- Signal momentum detection — `MOM:` handler
- Word-turn depth measurement
- Signal vault accumulation

### DISPLAYABLE EVENTS (38)

38 event types are flagged as displayable — visible to the operator in the log stream and system event history.

### KEY LOG CODES

```
CASCADE:       biofield coherence cascade
SYNTH:         resonant synthesis
DWRK:          deep work cascade
BIO:           biological state / energy update
BIO-AM:        morning biofield summary (08:00 UTC)
GOAL-X:        goal completion
ARCH-SHIFT:    archetype shift — from/to + stability %
INTENT-X:      intention completion — rate %
DIV-PULSE:     source diversity pulse
QOS-SIG:       qos-signature-lock (P66)
OP-SIG:        operator-signature (P67)
ARC-PEAK:      integration-arc-peak (P68)
ADAPT:         adaptive-resonance (P69)
COHR-COMM:     community-coherence-pulse — IDX: % · topMood · ACTIVE:
CONV:          operator-convergence — P70 · CONF: 0.97 · P66·P67·P68
MCL:           morning-coherence-launch — J17 output · P76 trigger
EVE:           evening-coherence-close — J18 output · P79 trigger  ←v66
MOM:           signal-momentum — J19 output · P80 trigger          ←v67
PRAY:          prayer-scripture — scripture text
VAULT:         signal-vault — DEPTH: wordcount · SRC: n/3
SURGE:         depletion-recovery-surge — state→HIGH · CARE 6H:
MEM:           memory engine entry — P18/P21 trigger
BRE:           breathe — 4-2-6 ASCII rhythm
FAST:          orthodox fasting calendar state
FREEZE:        widget freeze — timestamp pause
PHYS:          full physiological readout
```

**COCKPIT-RULE:** Log body = instrument readings only. Label names the event. No narration.

---

## 13. ECOSYSTEM NODE MAP

LOT tracks the operator's signal across six hardware/environment nodes.

```
╔══════════════════════════════════════════════════════════════════╗
║  NODE    CODE    DESCRIPTION                                     ║
╠══════════════════════════════════════════════════════════════════╣
║  CAR     CAR ·   Vehicle environment. Movement, transit signal.  ║
╠══════════════════════════════════════════════════════════════════╣
║  HOME    HOME ·  Primary living environment. Rest, recovery,     ║
║                  biological signal origin.                       ║
╠══════════════════════════════════════════════════════════════════╣
║  CPU     CPU ·   Primary compute node. Execution, focus,         ║
║                  cognitive work signal.                          ║
╠══════════════════════════════════════════════════════════════════╣
║  PHN     PHN ·   Mobile device. Social, communication,           ║
║                  distributed signal capture.                     ║
╠══════════════════════════════════════════════════════════════════╣
║  WCH     WCH ·   Wearable. Biometric continuous stream.          ║
║                  Body signal at highest resolution.              ║
╠══════════════════════════════════════════════════════════════════╣
║  ROBOT   ROBOT · Automation node. Home automation, scheduled     ║
║                  environment management, autonomous signal.      ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 14. BADGE SYSTEM v15 — THE BECOMING LEXICON

```
Total badges:           249
Total categories:       38
Rarity tiers:           7  (COMMON · UNCOMMON · RARE · EPIC ·
                            LEGENDARY · SECRET · COSMIC)
Version codename:       "The Becoming Lexicon"
Badge evaluator:        J05 (daily · 04:00 UTC)
Badge progress scan:    J16 (weekly · Tuesdays 09:00 UTC)
```

### COSMIC TIER

The COSMIC rarity tier is above all other tiers. Currently one badge:

```
five_years   — Account age ≥ 5 years (1825+ days)
               Cannot be accelerated. Earned only through time.
               The most patient badge in the system.
```

---

## 15. BADGE CATEGORY INDEX

```
 #   CATEGORY         DESCRIPTION               SINCE
──   ─────────────    ──────────────────────    ─────
 1   Core             Core behavioral badges    v1
 2   Streak           Consecutive engagement    v2
 3   Memory           Memory engine depth       v3
 4   Journal          Journal + log depth       v3
 5   Self-Care        Care practice records     v4
 6   Goals            Goal completion arcs      v4
 7   Social           Community engagement      v5
 8   System           System exploration        v5
 9   Cosmic           Long-arc temporal badges  v6
10   Emotional        Emotional pattern range   v7
11   Quantum          QOS + pattern badges      v8
12   Citizen          Index level awards        v7
13   Ecosystem        Node-based awards         v8
14   Self-Assembly    Module activation         v8
15   QOS Mode         Mode achievement          v9
16   Planner          Planning engagement       v9
17   Morning Arc      Early signal              v10
18   Evening Arc      Late signal               v10
19   Word Turn        Vocabulary transformation v11
20   Badge RPG        Achievement progression   v11
21   Word Turn v2     Sci-Fi expansion          v11
22   Mastery          Mastery milestones        v12
23   Secret Boss      Hidden conditions         v12
24   Achievement RPG  Story arc system          v12
25   Sci-Fi Arcade    Platform exploration      v12
26   Community        Community field           v13
27   Time EE          Exact time signals        v12
28   Calendar EE      Exact date signals        v12
29   Behavioral       Deep behavioral           v13
30   Mastery v4       Long-arc mastery          v13
31   Secret Boss v4   Founders' layer           v13
32   Achievement RPG v2 Story arcs              v14
33   Word Turn v6     Transformation verbs      v15
34   Time EE v6       Special timestamps        v15
35   Calendar EE v5   Invisible dates           v15
36   Behavioral v5    Deep scribe badges        v15
37   Mastery v5       Long-arc mastery          v15
38   Secret Boss v5   Temporal secrets          v15
```

---

## 16. DISPLAY ARCHITECTURE

### MILITARY PURITY ORDERS (11)

```
ORDER 01  No decoration that does not carry signal.
ORDER 02  No animation that does not indicate state change.
ORDER 03  Typography is hierarchy — size communicates rank.
ORDER 04  Color is state — not aesthetics.
ORDER 05  Whitespace is silence — use it deliberately.
ORDER 06  Every element must earn its presence.
ORDER 07  The operator reads the instrument; the instrument
           does not perform for the operator.
ORDER 08  Simplicity is not minimal — it is precise.
ORDER 09  The interface recedes; the data advances.
ORDER 10  No feature ships that S-2 has not signed.
ORDER 11  No feature ships that COSMO Gate has not passed.
```

### SYSTEM PULSE VIEWS (5)

```
VIEW 1   METRICS       — operator-level signal metrics
VIEW 2   ACTIVITY      — recent log event activity stream
VIEW 3   USERLOAD      — system load across operator base
VIEW 4   COHORT        — behavioral cohort distribution
VIEW 5   COMMUNITY     — Community Biofield coherence field
```

---

## 17. DENSITY TIER SYSTEM

```
TIER   NAME          DESCRIPTION
────   ──────────    ─────────────────────────────────────────────
  1    breathable    Maximum whitespace. Minimum elements.
  2    comfortable   Standard daily view. Core instruments visible.
  3    compact       Reduced whitespace. More instruments visible.
  4    dense         All instruments in compact arrangement.
  5    instrument    Full instrument panel — all data surfaces.
```

---

## 18. OPACITY HIERARCHY

```
90%   PRIMARY     Core signal. The reading the operator must have.
60%   SECONDARY   Supporting signal. Context for the primary.
40%   METADATA    System-generated labels, timestamps, IDs.
```

No element may use an opacity value outside this hierarchy.

---

## 19. COCKPIT RULE

**Log body = instrument readings only. No narration. No prose.**

> *A pilot entering flight data does not write "I think the altitude might be around 30,000 feet." The altimeter reads 30,000. That is the log entry.*

The LOT log is an instrument cockpit. The operator is the pilot. The log records readings — not feelings about readings, not narration of readings, not interpretation. The system interprets. The operator measures.

---

## 20. LOT-DOCTRINE (Revision J)

```
CLAUSE  I    The system measures. The operator decides.
CLAUSE  II   Signal before narration. Data before feeling.
CLAUSE  III  Time is the only irreducible resource.
CLAUSE  IV   The system does not motivate. It records.
CLAUSE  V    Pattern recognition requires patience.
              Short windows produce noise.
CLAUSE  VI   The operator is not the user. The operator
              is the system's primary instrument.
CLAUSE  VII  Every feature that adds complexity must
              remove more complexity than it adds.
CLAUSE  VIII No badge, no archetype, no pattern is a
              prescription. Each is a description.
CLAUSE  IX   The community biofield is signal, not
              comparison. No operator is ranked against
              another.
CLAUSE  X    The system is never finished. It assembles.
```

---

## 21. FIELD MANUAL (About.tsx)

```
File:            src/client/components/About.tsx
Current version: v67
URL:             lot-systems.com/about
```

The Field Manual is the authoritative source for all operator-facing documentation. When the Field Manual and the Wiki diverge, the Field Manual is correct. The Wiki is the information repository; the Field Manual is the rendered instrument view.

---

## 22. DEPLOYMENT & STACK

```
Frontend framework:    React 18
Type system:           TypeScript
State management:      Nanostores
CSS:                   Tailwind CSS
Backend framework:     Fastify 5
ORM:                   Sequelize 6
Database:              PostgreSQL
AI provider:           Together AI — Llama 3.3 70B (primary)
Infrastructure:        Digital Ocean · Nginx
Auth:                  Magic link → JWT → HTTP-only cookies
Real-time:             SSE (Server-Sent Events)
Security:              helmet CSP · rate-limit 100/min/IP ·
                       session pruning · dedup guard (30s)
Active dev branch:     claude/quantum-engine-widgets-RgFfC
Green Gate:            ENFORCED
COSMO Gate:            ENFORCED
```

---

## 23. LOT-GENESIS-v1

**Path:** `docs/assembly/LOT-GENESIS-v1.md`
**Class:** APOCALYPSE BACKUP — MACHINE-TO-MACHINE

LOT-GENESIS-v1 is the minimum viable document required to reconstruct the entire LOT system if all other documentation were lost. 19 nodes covering all architectural decisions, QIE pattern logic, badge system axioms, doctrine clauses, and the self-assembly model.

---

## 24. VOCABULARY INDEX

```
TERM                DEFINITION
────────────────    ────────────────────────────────────────────────
ARCHETYPE           Snapshot of the operator's current dominant
                    signal pattern. Auto-classified. Not chosen.
                    26 types. Updates as signal shifts.

BADGE ENGINE        Detection + award layer. 249 badges. 38
                    categories. v15 "The Becoming Lexicon."

BEHAVIORAL COHORT   Population-level classification. One of:
                    ARCHITECTS · OPERATORS · CHRONICLERS ·
                    RESTORERS · EXPLORERS · MEDICAL (internal).

BIOFIELD            The operator's physiological state across 4
                    dimensions: ATP · Clarity · Alignment · Support.

CITIZEN INDEX       6-level CQGS operator standing framework.
                    Observer → Citizen → Operator → Senior →
                    Certified → Elite.

COCKPIT RULE        Log body = instrument readings only.
                    No narration. Label names the event.

COSMO GATE          Ethics review gate. Named for Kuzya Cosmo
                    Marmeladov. No feature ships without passing.

DEP MAP             Widget Dependency Map. 120+ nodes in 4 tiers.
                    Maps signal cascade paths.

DIURNAL ARC         The complete daily signal cycle: morning launch
                    (P76) + evening close (P79). Arch25 activates
                    when both detected.

EPOCH               A signal sequence that spans multiple days and
                    produces a distinct archetype transition.

EVE:                Evening Coherence Close log code. J18 output.
                    Feeds P79 detection.

FIELD MANUAL        The About.tsx operator reference document.
                    Canonical authoritative source.

GREEN GATE          The rule: broken code never reaches GitHub.
                    Checks must pass before any push.

MCL:                Morning Coherence Launch log code. J17 output.
                    Feeds P76 detection.

MOM:                Signal Momentum lock code. J19 output.
                    Feeds P80 detection. Rarest sustained pattern.

MOMENTUM LOCK       P80 — 5+ of 7 days each with 3+ unique signal
                    sources. Sustained multi-dimensional engagement.
                    Not a spike. A lock.

OPERATOR            The person using LOT. Not "user." The operator
                    runs the system — the system does not run the
                    operator.

QIE                 Quantum Intent Engine. Client-side pattern
                    recognition. 80 patterns. Zero server comms.

QOS                 Quantum Operating System. Meta-layer above QIE.
                    Computes operating mode, coherence, readiness.

QOS SNAPSHOT        30-min interval capture of full operator state:
                    circadian phase · userState · userIndex ·
                    topPattern · signalCount24h · systemHealth.

S-2                 Vadim Marmeladov. CEO, Founder, Inventor.
                    All engineering authorized by S-2.

SELF-ASSEMBLY       The system builds itself from operator signal.
                    18 modules across 5 phases. Regression possible.

SIGNAL              Any operator action that produces a typed event
                    in the log record.

USERSHIP            The relationship between the operator and the
TRANSMISSION        system. The system talking back — terse,
                    technical, alive.

WORD TURN           A vocabulary transformation event. The operator
                    uses a specific word; the system recognizes it
                    and awards a badge. Deepens linguistic signal.
```

---

*LOT-WIKI-v62 · Revision: v62 · Field Manual Sync: v67 · 2026-06-21 · S-2: VADIK MARMELADOV*
*Authorized by S-2 // VADIK MARMELADOV · LOT Systems Corporation · lot-systems.com*
