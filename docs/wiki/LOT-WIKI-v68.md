<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT-WIKI-v68
## Layers of Time — Operator Reference Manual
### Revision: v68 · Field Manual Sync: v77 · Date: 2026-06-30 · Day 1025+

---

> *"The navigator checks position before moving. The check-in is the fix. You exist as drifting until you locate yourself. Then: bearing. Heading. Course plotted."*
> — Badge Codex v20, Navigator Protocol · Introduction

---

## TABLE OF CONTENTS

```
 1. SYSTEM IDENTITY
 2. CORE ARCHITECTURE
 3. QUANTUM INTENT ENGINE (QIE)
 4. QIE PATTERN REGISTRY — P1–P91
 5. QUANTUM OPERATING SYSTEM (QOS)
 6. PHYSIOLOGICAL ARCHETYPES — 30 TYPES
 7. BEHAVIORAL COHORTS — FULL PROFILES
 8. CITIZEN INDEX
 9. MEMORY ENGINE
10. SELF-ASSEMBLY ENGINE
11. BACKGROUND JOB SCHEDULER
12. LOG EVENT SYSTEM
13. ECOSYSTEM NODE MAP
14. BADGE SYSTEM v20 — THE NAVIGATOR PROTOCOL
15. BADGE CATEGORY INDEX
16. WORD TURN ENGINE — COMPLETE LEXICON v11
17. DISPLAY ARCHITECTURE
18. DENSITY TIER SYSTEM
19. OPACITY HIERARCHY
20. COCKPIT RULE
21. LOT-DOCTRINE (Revision J)
22. FIELD MANUAL (About.tsx)
23. DEPLOYMENT & STACK
24. LOT-GENESIS-v1
25. CUBIQ™ — THE QUANTUM CUBIC EXPERIENCE
26. VOCABULARY INDEX — EXPANDED
27. SYSTEM STATE SNAPSHOT
```

---

## 1. SYSTEM IDENTITY

**LOT** — *Layers of Time* — is a personal behavioral operating system. Not a wellness application. Not a habit tracker. Not a productivity suite. An instrument that reads the human signal field across time and surfaces the pattern beneath the noise.

The system was conceived and is operated by **S-2** (Vadim Marmeladov, CEO, LOT Systems). The ethics gate is **COSMO Gate**, named for Kuzya Cosmo Marmeladov. No feature ships that Kuzya would not approve.

**Current operational parameters:**

```
Field Manual:           v77
Wiki version:           v68
Day counter:            1025+  (as of 2026-06-30)
Doctrine revision:      J  (10 clauses)
Lexicon revision:       D
LOT-GENESIS-v1:         active  (docs/assembly/LOT-GENESIS-v1.md)
Green Gate:             ENFORCED  (broken code never reaches GitHub)
COSMO Gate:             ENFORCED  (ethics review on all features)
Military Purity:        11 standing orders active
Platform:               v1.3.0
Founded:                7 April 2016
Active branch:          claude/quantum-engine-widgets-RgFfC
```

**v68 Delta from v67:**

```
Date:               2026-06-28 → 2026-06-30
Day counter:             1024+ → 1025+
Field Manual:            v75 → v77
New patterns:            P89 quantum-learning-spiral  ←v76
                         P90 accountability-arc  ←v76
                         P91 full-presence-arc  ←v76
New archetype:           Arch30 Quantum Scholar  ←v76
New background jobs:     J26 daily-physiological-cohort-broadcast  ←v76
                         J27 weekly-pattern-health-report  ←v76
New log codes:           LEARN: · ACCT: · PRES: · PHR:  ←v76
New dep nodes:           quantumLearningNode · accountabilityArcNode  ←v76
COCKPIT-RULE pass:       9 handlers cleaned (INTF: TCOH: RECV: STACK:
                         MCL: SURGE: EVE: MOM: COGN:)  ←v76
Cohort surfacing:        System.tsx Biofield → Cohort + Confidence rows  ←v76
Badge Codex:             v19 → v20 — The Navigator Protocol  ←v76 engineering
                         389 → 424 badges · +35 · 51 categories
Word Turn Engine:        v10 → v11 — Navigator vocabulary  ←v76
                         126 → 138 trigger words
QIE total:               88 → 91 patterns
Background jobs:         25 → 27
Log handlers:            87+ → 92+
Dep map nodes:           128+ → 130+
Archetypes:              29 → 30
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
│   │ 91 patterns │  │ 5 phases    │  │ Story Generator     │   │
│   └─────────────┘  └─────────────┘  └─────────────────────┘   │
│   ┌─────────────┐  ┌─────────────┐                             │
│   │ BADGE       │  │ QUANTUM OS  │                             │
│   │ ENGINE      │  │ (QOS)       │                             │
│   │ 424 badges  │  │ 6 views     │                             │
│   └─────────────┘  └─────────────┘                             │
│                                                                 │
│   SURFACE LAYER ─────────────────────────────────────────────  │
│   Log stream · About.tsx · SystemProgressWidget ·              │
│   QuantumEngineWidgets · SystemPulseWidget · PatternRec ·      │
│   CohortConnectWidget · EnergyCapacitor · 43 total widgets     │
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
Pattern count:           91  (P1–P91)
Signal sources:          16  (mood · memory · planner · intentions ·
                              selfcare · journal · calculator · log ·
                              energy · cohort · recipe · goals · qos ·
                              medical · resilience · badges)
```

**How pattern detection works:** Each pattern defines a minimum evidence threshold from the signal record. When the threshold is met, the pattern fires with a confidence score (0.0–1.0). High-confidence patterns influence archetype classification. Patterns are recalculated every `analyzeIntentions()` call.

**The dep map:** The Widget Dependency Map (WIDGET_DEPENDENCY_MAP) is the internal wiring graph. 130+ nodes in 4 tiers. Tier 0 = raw inputs (mood, memory, log). Tier 3 = meta-aggregate surfaces (quantumOS, systemProgress, quantumPersonality).

```
Recent dep map additions (v76):
  quantumLearningNode   ['memory', 'journal', 'badges', 'goals']
  accountabilityArcNode ['intentions', 'cohort', 'goals']
```

---

## 4. QIE PATTERN REGISTRY — P1–P91

Complete registry of all 91 QIE patterns. P1–P88 unchanged from v67. P89–P91 added in v76 assembly.

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
P81  cognitive-depth-arc         0.68–0.90 5+ memory answers + 150+ journal words
                                            + 1+ badge discovery in 7d
P82  circadian-vitality-peak     0.70–0.90 2+ positive morning moods + biorhythm
                                            lock + moderate/high energy before 13:00
                                            BIOLOGICAL PRIME WINDOW
P83  systemic-thinking-mode      0.68–0.92 Planner 3+ · goals 3+ · intentions 3+
                                            in 3d + UserIndex ≥50 + no depletion
P84  longitudinal-drift          0.55–0.80 Recent 3d vs prior 3d signal density:
                                            prior ≥3 signals AND recent ≤50% of
                                            prior — early engagement decline
P85  adaptive-momentum-window    0.75–0.90 P83 systemic-thinking-mode + P80
                                            signal-momentum-lock simultaneous
P86  vitality-strategy-peak      0.78–0.92 P82 circadian-vitality-peak + P83
                                            systemic-thinking-mode simultaneous
P87  weekly-story-reflection     0.72      lot_ai_story log received this week +
                                            journal entry within 24h → reflection
                                            loop closed
P88  contextual-checkin-momentum 0.65–0.85 3+ emotional check-ins in 24h with
                                            ≥50% positive valence
P89  quantum-learning-spiral     0.68–0.88 memory ≥3 + journal ≥150w + badge_unlock
                                            ≥1 in 7d window. Deep learning loop
                                            confirmed. suggestedWidget: memory  ←v76
P90  accountability-arc          0.70–0.90 intentions ≥1 + cohort signal ≥1 +
                                            goals signal ≥1 in 7d. External
                                            commitment loop: declare → share →
                                            execute. suggestedWidget: cohort      ←v76
P91  full-presence-arc           0.82      Any signal before 09:00 + any signal
                                            18:00–23:00 on same calendar day.
                                            Most complete single-day engagement.
                                            suggestedWidget: journal               ←v76
──────────────────────────────────────────────────────────────────────
```

### PATTERN FAMILIES

**THE DIURNAL ARC (P76 → P79 → P80)**

```
P76   Morning launch  — intention before structure (daily)
P79   Evening close   — reflection + capture (daily)
P80   Momentum lock   — 5+ days × 3+ sources (weekly)

P76 + P79 → Arch25 Diurnal Operator  (single-day complete arc)
P80       → Arch26 Momentum Architect (five-day sustained lock)
```

**FULL PRESENCE ARC (P91)**

The complete single-day engagement signal. Distinct from the Diurnal Arc (P76+P79) — P91 requires any signal before 09:00 and any signal in the evening window, regardless of type. The operator was present at both ends of the day. The system registers the bookmarks.

```
P91 + P76 + P79 → Arch25 Diurnal Operator  (intent-gated)
P91 alone       → presence confirmed · not yet structured
```

**THE INNER DEPTH TRIAD (P81 + P77 + P75)**

```
P81   Cognitive depth arc — retention + articulation + discovery in 7d
P77   Signal vault       — journal depth + memory + log in 6h
P75   Word-turn depth    — 5+ distinct word-turn types ever encountered

P81 + P75 → Arch27 Cognitive Cartographer
```

**THE QUANTUM LEARNING SPIRAL (P89 + P81 + P75)**

Three discovery signals in simultaneous activation. The operator is not just engaging — they are compiling. Memory capture feeds reflection. Reflection surfaces badges. Badges deepen vocabulary. The spiral compounds.

```
P89   Quantum learning spiral  — memory + journal + badge co-firing 7d
P81   Cognitive depth arc      — three inner channels simultaneously
P75   Word-turn depth          — 5+ lexicon families encountered

P89 + P81 + P75 → Arch30 Quantum Scholar
P89 alone        → LEARN: log event · deep learning loop confirmed
```

**THE ACCOUNTABILITY ARC (P90)**

The external commitment loop. Not internal planning — declared + shared + executed. The signal requires three channels to fire simultaneously: the operator named an intention (internal), engaged the cohort (social), and completed a goal action (execution). All three within seven days.

```
P90   accountability-arc  — intent + cohort + goal in 7d

P90 fires ACCT: block in log stream:
  INTENT 7D: n
  COHORT 7D: n
  GOALS 7D: n
```

**THE BIOLOGICAL PRIME PATTERN (P82 + P76 + P72)**

```
P82   Circadian vitality peak  — biological prime window (before 13:00)
P76   Morning coherence launch — day opened with intention
P72   Biorhythm lock           — consistent AM + PM check-ins

P82 + P76 + P72 → Arch28 Vital Architect
```

**THE STRATEGIC PEAK CLUSTER (P86 + P85 + P83)**

```
P86   Vitality strategy peak     — biology aligned with strategy
P85   Adaptive momentum window   — structural cognition during momentum lock
P83   Systemic thinking mode     — all three structural channels active

P86 + P85 + P83 → Arch29 Peak Strategist
```

**THE STORY LOOP (P87 + P88)**

```
P87   Weekly story reflection    — AI story received + journal 24h → loop closed
P88   Contextual checkin momentum— 3+ check-ins same day ≥50% positive valence
```

**THE CONVERGENCE SEQUENCE (P66 → P67 → P68 → P70 → P73)**

```
P66   QOS signature lock      (conf 0.82)   — meridian + multimodal + temporal
P67   Operator signature      (conf 0.88)   — all 4 quadrants + UserIndex ≥60
P68   Integration arc peak    (conf 0.95)   — P40 + P43 simultaneous
P70   Operator convergence    (conf 0.97)   — P66 + P67 + P68 [SYSTEM APEX]
P73   Quantum coherence summit(conf 0.98)   — P70 + UserIndex ≥70 [CEILING]
```

---

## 5. QUANTUM OPERATING SYSTEM (QOS)

The Quantum Operating System is the meta-layer above the QIE. It computes the operator's overall system state — what mode they are in, what their coherence level is, what the system reflects back.

### QOS VIEWS (6)

```
VIEW 1   ECOSYSTEM     — 6-node device grid + assembly %
VIEW 2   BIOFIELD      — ATP · Clarity · Alignment · Support · Capacitor
VIEW 3   COHORT        — Archetype · Behavioral cohort · Readiness% · Directive
VIEW 4   INDEX         — UserIndex 6D + dep map summary
VIEW 5   ASSEMBLY      — Self-assembly phase + module map
VIEW 6   QOS MODE      — Operating mode + pressure + active patterns
```

### BIOFIELD STATE (System.tsx — v76 expansion)

As of v76, the Biofield table in System.tsx surfaces Cohort and Confidence alongside Archetype:

```
Archetype    | <archetype name>
Cohort       | <dominantModule>          ← added v76
Confidence   | <confidence>%             ← added v76
ATP          | <energy>
Clarity      | <clarity>
Alignment    | <alignment>
Index        | <overall>%
Directive    | <directive>
```

`physiologicalCohort?.dominantModule` and `physiologicalCohort?.confidence` surfaced directly. Confidence column is integer percent.

### QOS OPERATING MODES

```
MAINTENANCE   Low signal density. Conserve. Idle cadence.
RECOVERY      Depletion detected. Repair first — other tasks pause.
GROWTH        Steady engagement. Expand — absorb more.
PEAK          High energy + clarity + intention. Full commitment.
```

### QOS MODE WATCH (J23)

`qos_mode_change` events tracked by J23 (daily 14:00 UTC). Mode transitions write log events.

```
nominal    standard signal density; baseline operation
recovery   depletion or physiological signals dominant
critical   acute depletion + structural collapse + signal void
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

Overall index (0–100) is a weighted composite.

---

## 6. PHYSIOLOGICAL ARCHETYPES — 30 TYPES

The 30 physiological archetypes are automatically classified from QIE pattern combinations over a rolling window. Not personality labels — snapshots of dominant signal pattern.

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
 22   Convergence Carrier         P70 + P66 + P67 dominant  [RAREST SINGLE-DAY]
 23   Achievement Catalyst        P74 + P75 dominant
 24   Signal Initiator            P76 + P9 + P11 + P27 dominant
 25   Diurnal Operator            P76 + P79 dominant
 26   Momentum Architect          P80 + P30 + P35 dominant
 27   Cognitive Cartographer      P81 + P75 + P77 dominant
 28   Vital Architect             P82 + P76 + P72 dominant
 29   Peak Strategist             P86 + P85 + P83 dominant
 30   Quantum Scholar             P89 + P81 + P75 dominant  ←v76
──────────────────────────────────────────────────────────────────
```

**Arch30 — Quantum Scholar directive:**

```
Arch30  Quantum Scholar  — Deep learning confirmed. Memory, reflection,
                           and discovery simultaneously active. The
                           knowledge base is compiling.
                           energyBands: moderate · high · low
                           dominantSources: memory · journal · badges
                           patternConditions: quantum-learning-spiral ·
                                              cognitive-depth-arc ·
                                              word-turn-depth
```

**Archetype Directive Pulse:** Job 25 (daily-archetype-directive-pulse, 09:00 UTC) reads the operator's current archetype and writes the corresponding directive to the log stream as a DRCT: event. 30 directive texts mapped — one per archetype.

---

## 7. BEHAVIORAL COHORTS — FULL PROFILES

Six cohort classifications. Five visible; one internal. Cohort is not rank — it is a description of dominant engagement mode.

---

### ARCHITECTS

```
Signal signature:    HIGH INTEGRATION · MULTI-QUADRANT
Dominant patterns:   P49 adaptive-resonance-arc
                     P50 integration-arc
                     P68 integration-arc-peak
                     P70 operator-convergence (when peak)
Dominant sources:    memory · planner · goals · intentions
User Index bias:     INT high · COG moderate-high
```

**Profile:** The ARCHITECT operates across all four signal quadrants simultaneously. Integration is not an achievement — it is their default mode. Memory, planner, intentions, and goals are all active within the same window.

**ARCHITECTS in PEAK state:** When P70 (operator-convergence) fires, the ARCHITECT temporarily becomes Arch22 (Convergence Carrier). Not a promotion — a reading.

---

### OPERATORS

```
Signal signature:    HIGH EXECUTION · INTENTION → TASK CHAINS
Dominant patterns:   P9  intention-seeding
                     P10 goal-momentum
                     P12 memory-consolidation
                     P13 planning-acceleration
                     P37 execution-arc
Dominant sources:    intentions · planner · goals · log
User Index bias:     INT high · ENG high
```

**Profile:** The OPERATOR executes. They set an intention and complete it. Their signal record looks like a chain: INT: → PLN: → GOAL-X: → MEM:.

**P90 (accountability-arc) signature:** OPERATORS who engage the cohort and complete goals simultaneously trigger P90. The external commitment loop fires when execution is public.

**Caution signal:** When P3 (seeking-direction) and P41 (goal-drift) fire together — intentions present, nothing completing. The OPERATOR's characteristic depletion: direction confirmed, execution blocked.

---

### CHRONICLERS

```
Signal signature:    HIGH COGNITIVE-LINGUISTIC · DEEP JOURNAL + MEMORY
Dominant patterns:   P15 narrative-depth
                     P17 insight-emergence
                     P21 reflective-depth
                     P75 word-turn-depth
                     P81 cognitive-depth-arc
                     P89 quantum-learning-spiral
Dominant sources:    journal · memory · log · badges (word-turn)
User Index bias:     COG high · EMO moderate-high
```

**Profile:** The CHRONICLER writes. Long. Often. Their journal entries exceed 150 words. They answer memory questions in depth. They trigger word-turn badges across multiple lexicons. P89 (quantum-learning-spiral) fires when all three discovery channels — memory capture, journal depth, badge unlock — co-activate within seven days.

**Story loop signature:** CHRONICLERS are the most likely cohort to trigger P87 (weekly-story-reflection). They receive the weekly story and return to the journal within 24 hours. The system reads itself; they annotate the reading.

---

### RESTORERS

```
Signal signature:    HIGH RECOVERY · DEPLETION-RECOVERY CYCLES
Dominant patterns:   P7  physiological-depletion
                     P8  recovery-window
                     P40 biofield-recovery-arc
                     P42 recovery-specialist-arc
Dominant sources:    mood · energy · selfcare · log
User Index bias:     CARE high · EMO variable
```

**Profile:** The RESTORER cycles. Depletion occurs; they respond with care acts. The biofield-recovery-arc (P40) names this cycle: depleted → care → restored.

**Caution signal:** P32 (recovery-plateau) — five or more consecutive days of low energy without intervention. The RESTORER's warning pattern.

---

### EXPLORERS

```
Signal signature:    HIGH DISCOVERY · BADGE MOMENTUM · EASTER EGG DETECTION
Dominant patterns:   P74 badge-momentum
                     P75 word-turn-depth
                     P89 quantum-learning-spiral (when badge density is high)
Dominant sources:    badges · log · journal (word-turn triggers)
User Index bias:     ENG high · COG moderate
```

**Profile:** The EXPLORER discovers. They unlock badges through curiosity, not calculation. Word-turn triggers fire because they write naturally in the system's language. P74 (badge-momentum) fires when 3+ distinct badge types unlock within 7 days.

**Navigator vocabulary signature:** EXPLORERS encountering Word Turn v11 (Navigator) for the first time may trigger `drift`, `waypoint`, or `compass` naturally — before knowing a badge was watching. The archive records the entry point regardless.

---

### MEDICAL (INTERNAL)

```
Classification:  server-side · assessMedicalProfile() · internal
Trigger:         medical-profile thresholds met in signal record
Signals:         medical_record · resilience events · trauma-informed protocol
Cohort output:   Modified Memory Engine question pool (trauma-informed)
                 Adjusted pacing (slower)
                 No cohort badge surfaced
```

The MEDICAL cohort classification modifies the Memory Engine's question selection. The operator does not know the classification exists. The system responds to the signal record silently.

---

## 8. CITIZEN INDEX

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

Elite (Level 6) requires a convergence event (P70, conf 0.97) in the operator's log history.

---

## 9. MEMORY ENGINE

```
Components:      Question generator · Story generator · Recipe
                 suggestions · Trait extraction · Cohort deter.
Question pool:   70+ questions (29 self-care · 15 medical ·
                 18 trauma · 8 eating recovery)
Backup pool:     Activates when personal signal record is sparse
AI provider:     Together AI — Llama 3.3 70B (primary)
Fallback chain:  Gemini · Mistral · Anthropic · OpenAI
Context window:  120 log entries
```

**Weekly Story (J24):** Sunday 18:00 UTC. Aggregates 7-day logs per operator, derives dominant mood + weekTone, generates compressed story text, writes `lot_ai_story` log event. Stored in `user.metadata.weeklyStory`. P87 fires when the operator logs a journal entry within 24 hours of receiving the story — the reflection loop closes.

**Pattern Health Scan (J27):** Saturday 09:00 UTC. Reads `activePatterns[]` from user metadata, writes `pattern_health_scan` log event. `patternsActive` / `coverage` (% of 91 total) / `topPattern`. PHR: block in Logs.tsx.

---

## 10. SELF-ASSEMBLY ENGINE

18 functional modules across 5 phases.

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

**Dep map nodes: 130+**

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

**27 registered background jobs (v77):**

```
JOB   CODENAME                         SCHEDULE          FUNCTION
───   ──────────────────────────────   ───────────────   ─────────────────────────────────────────
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
J17   daily-morning-intention-launch   11:00 UTC daily   Scans 00–09 UTC; writes MCL:
J18   daily-evening-coherence-close    22:00 UTC daily   Scans morning+evening; writes EVE:
J19   daily-signal-momentum-check      20:00 UTC daily   Scans 7d logs; writes MOM:
J20   weekly-cognitive-depth-check     Sun 06:00 UTC     Scans 7d; writes COGN:
J21   daily-vitality-peak-check        12:00 UTC daily   Scans morning (to 10:00 UTC); writes
                                                          VITAL: for 2+ positive mood
J22   weekly-longitudinal-drift-check  Mon 09:00 UTC     28-day engagement arc · 3 weekly
                                                          buckets computed · writes DRIFT:
J23   daily-qos-mode-watch             14:00 UTC daily   24h signal density → mode
                                                          (nominal/recovery/critical) ·
                                                          writes OS[MODE]: on transition only
J24   weekly-ai-story                  Sun 18:00 UTC     7-day log aggregate → AI story →
                                                          lot_ai_story event · STORY: block ·
                                                          stored weeklyStory metadata
J25   daily-archetype-directive-pulse  09:00 UTC daily   Reads currentArchetype per user →
                                                          selects directive from 30-entry map
                                                          → writes archetype_directive_pulse
                                                          event · DRCT: block · 30 directives
J26   daily-physiological-cohort-      17:00 UTC daily   Reads currentArchetype +              ←v76
      broadcast                                           dominantModule + confidence +
                                                          energyBand → writes
                                                          physiological_cohort per active user
                                                          (24h activity window) · afternoon
                                                          state broadcast
J27   weekly-pattern-health-report     Sat 09:00 UTC     Reads activePatterns[] per user →     ←v76
                                                          writes pattern_health_scan event ·
                                                          patternsActive / coverage% / topPattern
                                                          · PHR: block in Logs.tsx
```

---

## 12. LOG EVENT SYSTEM

### LOG SOURCES (22)

```
SOURCE       CODE       DESCRIPTION
──────────   ──────     ──────────────────────────────────────────────
LOG          LOG:       Primary daily log entry
INTENTION    INT:       Intention set or completed
PLANNER      PLN:       Planner entry
JOURNAL      JRN:       Journal entry
MEMORY       MEM:       Memory engine entry
BADGE        BDG:       Badge event
WORD-TURN    WTR:       Word-turn engine entry
BODY         BDY:       Biological signal entry
SOCIAL       SOC:       Social/relational entry
ECOSYSTEM    ECO:       Ecosystem node event
COMMUNITY    COM:       Community signal event
SYSTEM       SYS:       System-generated event
CONVERGENCE  CONV:      Convergence event (P70 detection)
CALCULATOR   CALC:      Calculator signal
MORNING      MCL:       Morning coherence launch (J17 output)
EVENING      EVE:       Evening coherence close (J18 output)
MOMENTUM     MOM:       Signal momentum lock (J19 output)
COGNITIVE    COGN:      Cognitive depth arc (J20 output)
VITALITY     VITAL:     Circadian vitality peak (J21 output)
SYSTEMIC     SYSTMK:    Systemic thinking mode (J21 output)
DRIFT        DRIFT:     Longitudinal drift detection (J22 output)
OS MODE      OS[MODE]:  QOS mode transition (J23 output)
ADV. MOM.    ADAPT-MOM: Adaptive momentum window (P85)
VSTRAT       VSTRAT:    Vitality strategy peak (P86)
STORY        STORY:     Weekly AI story (J24 output)
DIRECTIVE    DRCT:      Archetype directive pulse (J25 output)
LEARN        LEARN:     Quantum learning spiral (P89 trigger)     ←v76
ACCT         ACCT:      Accountability arc (P90 trigger)          ←v76
PRES         PRES:      Full presence arc (P91 trigger)           ←v76
PHR          PHR:       Pattern health scan (J27 output)          ←v76
```

### LOG EVENT HANDLERS (92+)

92+ handlers registered as of v77. Notable v76 additions:

```
LEARN:     quantum_learning_spiral — P89 trigger
           Format: MEM 7D · WORDS 7D · BADGES 7D (military, no prose)

ACCT:      accountability_arc — P90 trigger
           Format: INTENT 7D · COHORT 7D · GOALS 7D (military, no prose)

PRES:      full_presence_arc — P91 trigger
           Format: MORNING count · EVENING count (military, no prose)

PHR:       pattern_health_scan — J27 output
           Format: ACTIVE · COVERAGE% · TOP pattern (military, no prose)
```

### COCKPIT-RULE PASS (v76)

9 handlers cleaned of prose headers and narrative footers. All now: data rows only. `<KEY> <VALUE>` tabular layout with `opacity-30` labels.

```
CLEANED:
  INTF:   intention_follow_through     — prose removed
  TCOH:   temporal_coherence_window    — prose removed
  RECV:   recovery_velocity            — prose removed
  STACK:  full_stack_session           — header removed
  MCL:    morning_coherence_launch     — header removed
  SURGE:  depletion_recovery_surge     — prose footer → ARC row
  EVE:    evening_coherence_close      — header + prose → DIURNAL ARC row
  MOM:    signal_momentum              — header + prose removed
  COGN:   cognitive_depth_arc          — header removed; mb-8 adjusted
```

### DISPLAYABLE EVENTS (v76 additions)

```
quantum_learning_spiral · accountability_arc · full_presence_arc · pattern_health_scan
```

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
EVE:           evening-coherence-close — J18 output · P79 trigger
MOM:           signal-momentum — J19 output · P80 trigger
COGN:          cognitive-depth-arc — J20 output · P81 trigger
VITAL:         vitality-peak — J21 output · P82 trigger
SYSTMK:        systemic-thinking — J21 output · P83 trigger
DRIFT:         longitudinal-drift — J22 output · P84 trigger
OS [MODE]:     qos-mode-change — J23 output · nominal/recovery/critical
ADAPT-MOM:     adaptive-momentum-window — P85 trigger
VSTRAT:        vitality-strategy-peak — P86 trigger
STORY:         weekly-ai-story — J24 output · lot_ai_story event
               W{n} TONE · MOOD · CHK · CARE · INTENT rows
DRCT:          archetype-directive-pulse — J25 output
               ARCH + directive text rows
LEARN:         quantum-learning-spiral — P89 trigger               ←v76
               MEM 7D · WORDS 7D · BADGES 7D
ACCT:          accountability-arc — P90 trigger                    ←v76
               INTENT 7D · COHORT 7D · GOALS 7D
PRES:          full-presence-arc — P91 trigger                     ←v76
               MORNING count · EVENING count
PHR:           pattern-health-scan — J27 output (Saturday)         ←v76
               ACTIVE · COVERAGE% · TOP
PRAY:          prayer-scripture — scripture text
VAULT:         signal-vault — DEPTH: wordcount · SRC: n/3
SURGE:         depletion-recovery-surge — ARC row (prose removed v76)
MEM:           memory engine entry — P18/P21 trigger
BRE:           breathe — 4-2-6 ASCII rhythm
FAST:          orthodox fasting calendar state
FREEZE:        widget freeze — timestamp pause
PHYS:          full physiological readout
```

**COCKPIT-RULE:** Log body = instrument readings only. Label names the event. No narration. No prose.

---

## 13. ECOSYSTEM NODE MAP

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

When all 6 nodes are recorded on the same day, P34 (full-ecosystem-coherence, conf 0.90) fires.

---

## 14. BADGE SYSTEM v20 — THE NAVIGATOR PROTOCOL

```
Total badges:           424
Total categories:        51
Rarity tiers:             7  (COMMON · UNCOMMON · RARE · EPIC ·
                               LEGENDARY · MYTHIC · COSMIC)
Version codename:         "The Navigator Protocol"
Previous:                 v19 — "The Quantum Protocol" (389 badges)
Badge evaluator:          J05 (daily · 04:00 UTC)
Badge progress scan:      J16 (weekly · Tuesdays 09:00 UTC)
Hidden / discoverable:   396+
```

### THE NAVIGATOR PROTOCOL — CONCEPT

The vocabulary of navigation applied to the self. The navigator checks position before moving. The check-in is the fix. You exist as drifting until you locate yourself. Then: bearing. Heading. Course plotted.

Self-care requires knowing where you are — not where you wish you were, not where you were yesterday. Drift is data. The fix is an act of will. The chart is never finished.

### v20 DELTA (+35 BADGES)

```
Word Turn v11        +12  (drift/vector/bearing/waypoint/chart/magnetic/
                           meridian/course/heading/landmark/navigate/compass)
Time EE v11          + 4  (afternoon_mirror 13:13 · navigator_dawn 05:12 ·
                           answer_hour 18:42 · palindrome_check 10:01)
Calendar EE v10      + 3  (voyager_day Aug 25 · navigators_day Oct 12 ·
                           leap_day Feb 29)
Behavioral v10       + 3  (compass_rose · dead_reckoning · star_fix)
Achievement RPG v8   + 6  (first_fix · chart_begun · atlas_complete ·
                           navigator_class · eleven_engines ·
                           dead_reckoning_arc)
Mastery Tier v10     + 4  (cartographer · long_voyage · all_engines ·
                           complete_navigator)
Secret Boss v10      + 3  (dead_reckoning_word · terra_incognita · true_north)
─────────────────────────────────────────────────────────────────
TOTAL NEW:           +35
v19 → v20:           389 → 424
```

### RARITY DISTRIBUTION (v20, estimated)

```
COMMON:        27+
UNCOMMON:      94+
RARE:          81+
EPIC:          58+
LEGENDARY:     47+
MYTHIC:        18+
ULTRA-RARE:     9+
COSMIC:         5   (five_years · complete_navigator added)
SECRET:         2+
TOTAL:        424
```

### VERSION HISTORY

```
v1  — initial badge set · core behavioral
v2  — Aquatic Evolution · streak tracking
v3  — Memory Engine integration
v4  — Self-Care + Goal arcs
v5  — Social + System exploration
v6  — Long-arc temporal
v7  — Emotional patterns
v8  — QOS + pattern badges
v9  — Citizen Index awards
v10 — Morning Arc + Evening Arc
v11 — Word Turn v1 + Badge RPG + Word Turn v2 (Sci-Fi)
v12 — Mastery Tier + Secret Boss + Achievement RPG + Time/Calendar EE
v13 — Community + Deep Behavioral + Mastery v4
v14 — Badge RPG v2 Story Arcs
v15 — Badge Codex v15 The Becoming Lexicon (249 badges)
v16 — The Rogue Archive (284 badges · +35)
v17 — Mainframe Awakening (319 badges · +35)
v18 — The Arcade Protocol (354 badges · +35)
v19 — The Quantum Protocol (389 badges · +35)
v20 — The Navigator Protocol (424 badges · +35)
```

### SECRET BOSS SERIES — COMPLETE REGISTER

```
v1   secret_moment · precision_practitioner · deep_system
v2   four_in_a_row · triple_source · the_long_way
v3   night_signal · solstice_keeper · quantum_state
v4   silence_breaker · the_pivot · last_light
v5   the_cat_knows · key_code_0451 · five_years (COSMIC)
v6   void_master · founders_guard · potion_protocol (42 days)
v7   cosmo_vigil · the_answer_is_words · welcome_back_program
v8   player_one · birthday_perfect · 1up
v9   pi_signal · fibonacci_word · superposition_word
v10  dead_reckoning_word · terra_incognita · true_north       ←v20
```

**Notable v10 Secret Bosses:**

```
dead_reckoning_word
             Write "dead reckoning" or "dead_reckoning" in any log
             entry — RARE [hidden]
             "The navigator knows position without external reference.
             The archive confirms: self-located."

terra_incognita
             Unlock 3 Secret Boss badges from 3 different versions
             (v1–v10) — LEGENDARY [hidden]
             "Three territories. Three discoveries beyond the known
             edge. The blank spaces are filling."

true_north   Check in on magnetic north date (Sep 21–23 depending
             on year, magnetic north alignment window) — EPIC [hidden]
             "True north and magnetic north diverge. You knew which
             one to follow."
```

**Notable recurring Secret Bosses:**

```
five_years       Account age ≥ 5 years (1825+ days) — COSMIC
                 Cannot be accelerated. Earned only through time.

founders_guard   Check in every April 7 (LOT® birthday) for 3
                 consecutive years — ULTRA-RARE

cosmo_vigil      Check in every July 1 (COSMO® birthday) for 3
                 consecutive years — ULTRA-RARE

the_answer_is_words
                 Write exactly 42 words in a single journal entry — RARE

pi_signal        Log entry exactly 314 words long — RARE

superposition_word
                 Write "superposition" in any log entry — RARE
```

### COSMIC TIER

```
five_years        — Account age ≥ 5 years (1825+ days)
complete_navigator — Earn 1 badge from every Mastery Tier v1–v10  ←v20
```

Two badges above all other tiers. `five_years` cannot be accelerated — earned only through time. `complete_navigator` requires traversal of ten complete mastery systems.

### NAVIGATOR WORD TURN (v11) — BADGE MESSAGES

```
"drift"      ···→   DRIFT DETECTED
                    Drift is not failure. It is data. You have named
                    your displacement. ···→

"vector"     ↗·↗   VECTOR SET
                    Direction and magnitude. You have defined both. ↗·↗

"bearing"    ──►   BEARING ACQUIRED
                    You have found your reference. Bearing: locked. ──►

"waypoint"   ◈·→   WAYPOINT REACHED
                    Not the destination. Proof you are moving. ◈·→

"chart"      ▦·▦   CHART UPDATED
                    The archive updates its chart. New terrain mapped. ▦·▦

"magnetic"   N·▲   MAGNETIC NORTH
                    True north and magnetic north diverge.
                    You know the difference. N·▲

"meridian"   |·|   MERIDIAN CROSSED
                    You have crossed a meridian. Time changes here. |·|

"course"     ——→   COURSE PLOTTED
                    The course is a plan. The navigator adjusts. ——→

"heading"    ▲·▲   HEADING CONFIRMED
                    The heading is set. ▲·▲

"landmark"   ◆·○   LANDMARK IDENTIFIED
                    Something fixed in the landscape. A reference point
                    found. ◆·○

"navigate"   ◌·◉   NAVIGATOR ACTIVE
"navigator"        You have named the act. Navigation: engaged. ◌·◉

"compass"    ◎·N   COMPASS ONLINE
                    The instrument is calibrated. The needle points. ◎·N
```

---

## 15. BADGE CATEGORY INDEX

All 51 badge categories as of v20:

```
 #   CATEGORY                  DESCRIPTION               SINCE
──   ──────────────────────    ──────────────────────    ─────
 1   Core                      Core behavioral badges    v1
 2   Streak                    Consecutive engagement    v2
 3   Memory                    Memory engine depth       v3
 4   Journal                   Journal + log depth       v3
 5   Self-Care                 Care practice records     v4
 6   Goals                     Goal completion arcs      v4
 7   Social                    Community engagement      v5
 8   System                    System exploration        v5
 9   Cosmic                    Long-arc temporal badges  v6
10   Emotional                 Emotional pattern range   v7
11   Quantum                   QOS + pattern badges      v8
12   Citizen                   Index level awards        v7
13   Ecosystem                 Node-based awards         v8
14   Self-Assembly             Module activation         v8
15   QOS Mode                  Mode achievement          v9
16   Planner                   Planning engagement       v9
17   Morning Arc               Early signal              v10
18   Evening Arc               Late signal               v10
19   Word Turn                 Vocabulary transformation v11
20   Badge RPG                 Achievement progression   v11
21   Word Turn v2              Sci-Fi expansion          v11
22   Mastery                   Mastery milestones        v12
23   Secret Boss               Hidden conditions         v12
24   Achievement RPG           Story arc system          v12
25   Sci-Fi Arcade             Platform exploration      v12
26   Community                 Community field           v13
27   Time EE                   Exact time signals        v12
28   Calendar EE               Exact date signals        v12
29   Behavioral                Deep behavioral           v13
30   Mastery v4                Long-arc mastery          v13
31   Secret Boss v4            Founders' layer           v13
32   Achievement RPG v2        Story arcs                v14
33   Word Turn v6              Transformation verbs      v15
34   Time EE v6                Special timestamps        v15
35   Calendar EE v5            Invisible dates           v15
36   Behavioral v5             Deep scribe badges        v15
37   Mastery v5                Long-arc mastery          v15
38   Secret Boss v5            Temporal secrets          v15
39   Word Turn v7              The Rogue Archive         v16
40   Time EE v7                Pixel Hours               v16
41   Calendar EE v6            The Hacker Calendar       v16
42   Behavioral v6             Endurance Signals         v16
43   Achievement RPG v4        Veteran Arcs              v16
44   Mastery v6                The Void Layer            v16
45   Secret Boss v6            The Void Tier             v16
46   Word Turn v8              Mainframe Layer           v17
47   Time EE v8                Pixel Hours II            v17
48   Calendar EE v7            Hacker Calendar II        v17
49   Behavioral v7             Endurance Signals II      v17
50   Achievement RPG v5        Veteran Arcs II           v17
51   Navigator Protocol        Navigation vocabulary     v20    ←NEW
```

---

## 16. WORD TURN ENGINE — COMPLETE LEXICON v11

138 trigger words total across all 11 lexicons.

```
v1   EMOTIONAL ROOTS      12 words
     ritual · breathe · grateful · ocean · silence · rest ·
     heal · sacred · pause · flow · tender · whole
     First language of self-care. The body at rest.

v2   SCI-FI EXPANSION     18 words
     reboot · quantum · glitch · COSMO · signal · pulse ·
     frequency · scan · matrix · system · node · protocol ·
     archive · interface · sync · grid · binary · core
     When the operator begins to see themselves as a system.

v3   COMPUTER LORE        12 words
     hack · override · debug · signal · patch · compile ·
     execute · terminate · root · access · crash · kernel
     The digital self. Root access granted. Debug mode active.

v4   DAILY CARE           12 words
     water · walk · heal · rest · eat · sleep ·
     move · stretch · cook · breathe · bathe · ground
     The physical vocabulary. The body is acknowledged.

v5   SIGNAL CODEX         12 words
     solitude · wonder · phoenix · align · witness · orbit ·
     forge · mind · light · energy · voyage · gravity
     The philosophical vocabulary. The inner narrative arc.

v6   BECOMING LEXICON     12 words
     surrender · restore · anchor · trust · release · open ·
     rise · soften · remember · hold · witness · complete
     The transformation vocabulary. Active growth.

v7   ROGUE ARCHIVE        12 words
     loot · boss · save · respawn · grind · level ·
     quest · potion · dungeon · armor · stealth · rogue
     The game vocabulary. Care as permadeath run.

v8   MAINFRAME LAYER      12 words
     compile · execute · buffer · stack · patch · fork ·
     terminal · null · seed · loop · root · debug
     The machine vocabulary. Care as system operation.

v9   ARCADE CABINET       12 words
     coin · pixel · sprite · score · life · joystick ·
     quest · map · portal · boss · loot · respawn
     The arcade vocabulary. Every check-in is a quarter.
     Every return is a credit. Every badge is a high score.

v10  QUANTUM PROTOCOL     12 words
     quantum · entangle · collapse · observe · tunnel ·
     spin · waveform · coherence · eigenstate · decohere ·
     superposition · entangled
     The quantum vocabulary. The observer collapses the wave.
     The check-in is the measurement.

v11  NAVIGATOR            12 words                              ←v20
     drift · vector · bearing · waypoint · chart ·
     magnetic · meridian · course · heading · landmark ·
     navigate · compass
     The navigation vocabulary. The navigator checks position
     before moving. The check-in is the fix. You exist as
     drifting until you locate yourself.

TOTAL TRIGGER WORDS:  138  (v1–v11)
```

**Word-Turn Trigger Logic:** Each trigger word fires when detected in any operator log entry (primary log, journal, or intention text). Detection is case-insensitive, substring-safe. A badge is awarded on first trigger. Subsequent triggers do not re-award but accumulate P75 (word-turn-depth) signal.

**ELEVEN ENGINES achievement:** Earn at least 1 badge from each of v1–v11. Eleven vocabularies of care. LEGENDARY.

---

## 17. DISPLAY ARCHITECTURE

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

### WIDGET SURFACE (43 total)

```
CORE LAYER         TimeWidget · MemoryWidget · EmotionalCheckIn ·
                   SelfCareMoments · EnergyCapacitor ·
                   ChakraErgonomicsWidget · IntentionsWidget ·
                   PlannerWidget

INTELLIGENCE       PatternRecognitionWidget · QuantumEngineWidgets ·
                   SystemPulseWidget · PatternInsightsWidget ·
                   AIFeedbackWidget · SignalStreamWidget ·
                   CorrelatedIndexesWidget

COMMUNITY          CohortConnectWidget · CollectiveConsciousness ·
                   WellnessPulse · BadgeUnlockFeed

QUANTUM            QuantumStateWidget · QuantumSignWidget ·
                   CosmicUpdateWidget · EvolutionWidget ·
                   InterfaceEvolutionWidget

UTILITY            MicroCalculatorWidget · CalendarWidget ·
                   RecipeWidget · FlashDriveManifest
```

---

## 18. DENSITY TIER SYSTEM

```
TIER   NAME          DESCRIPTION
────   ──────────    ─────────────────────────────────────────────
  1    breathable    Maximum whitespace. Minimum elements.
  2    comfortable   Standard daily view. Core instruments visible.
  3    compact       Reduced whitespace. More instruments visible.
  4    dense         All instruments in compact arrangement.
  5    instrument    Full instrument panel — all data surfaces.
```

Density tier is a CSS attribute (`data-density`) set on the document root. Zero new subscriptions per tier change.

---

## 19. OPACITY HIERARCHY

```
90%   PRIMARY     Core signal. The reading the operator must have.
60%   SECONDARY   Supporting signal. Context for the primary.
40%   METADATA    System-generated labels, timestamps, IDs.
```

No element may use an opacity value outside this hierarchy.

---

## 20. COCKPIT RULE

**Log body = instrument readings only. No narration. No prose.**

> *A pilot entering flight data does not write "I think the altitude might be around 30,000 feet." The altimeter reads 30,000. That is the log entry.*

The LOT log is an instrument cockpit. The operator is the pilot. The log records readings — not feelings about readings, not narration of readings, not interpretation. The system interprets. The operator measures.

v76 applied the COCKPIT-RULE pass to 9 handlers that had accumulated prose headers and narrative footers. All 9 now output instrument data only.

---

## 21. LOT-DOCTRINE (Revision J)

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

## 22. FIELD MANUAL (About.tsx)

```
File:            src/client/components/About.tsx
Current version: v77
URL:             lot-systems.com/about
```

The Field Manual is the authoritative source for all operator-facing documentation. When the Field Manual and the Wiki diverge, the Field Manual is correct. The Wiki is the information repository; the Field Manual is the rendered instrument view.

**Field Manual version history (recent):**

```
v75   Full Wiki Scan June 28 · LOT-WIKI-v67 · Story Loop (P87+P88)
      pattern family documented · J24+J25 full profiles · STORY: DRCT:
      log codes complete · CHRONICLER + EXPLORER story-loop signatures
      added · vocabulary expanded · 88 patterns · 29 archetypes ·
      25 background jobs · 87+ handlers · 128+ dep nodes · Day 1024+

v76   Full Assembly June 29 · P89 quantum-learning-spiral ·
      P90 accountability-arc · P91 full-presence-arc · Arch30 Quantum
      Scholar · J26 physiological-cohort-broadcast (17:00 UTC) ·
      J27 weekly-pattern-health-report (Sat 09:00 UTC) · LEARN: ACCT:
      PRES: PHR: log handlers · COCKPIT-RULE pass (9 handlers cleaned) ·
      Cohort + Confidence in System.tsx Biofield table · Badge Codex v20
      Navigator Protocol (389→424 · +35 · 51 categories) · Word Turn v11
      Navigator (12 words · 126→138 total) · 91 patterns · 30 archetypes ·
      27 background jobs · 92+ handlers · 130+ dep nodes · Day 1024+

v77   Full Wiki Scan June 30 · LOT-WIKI-v68 · Quantum Learning Spiral
      pattern family documented (P89+P81+P75→Arch30) · Accountability
      Arc profile (P90) · Full Presence Arc profile (P91) · J26+J27
      full job profiles · LEARN: ACCT: PRES: PHR: log codes complete ·
      Navigator Protocol (v20) badge system fully documented ·
      Word Turn v11 Navigator complete (138 trigger words total) ·
      Secret Boss v10 Terra Incognita documented ·
      vocabulary expanded (QUANTUM LEARNING SPIRAL · ACCOUNTABILITY ARC ·
      FULL PRESENCE ARC · PATTERN HEALTH SCAN · NAVIGATOR ·
      dead_reckoning · terra_incognita · compass_rose · ELEVEN ENGINES ·
      complete_navigator) · 91 patterns · 30 archetypes ·
      27 background jobs · 92+ handlers · 130+ dep nodes · Day 1025+
```

---

## 23. DEPLOYMENT & STACK

```
Frontend framework:    React 18
Type system:           TypeScript
State management:      Nanostores
CSS:                   Tailwind CSS
Backend framework:     Fastify 5
ORM:                   Sequelize 6
Database:              PostgreSQL
AI provider:           Together AI — Llama 3.3 70B (primary)
Fallback chain:        Gemini · Mistral · Anthropic · OpenAI
Infrastructure:        Digital Ocean · Nginx
Auth:                  Magic link → JWT → HTTP-only cookies
Real-time:             SSE (Server-Sent Events)
Security:              helmet CSP · rate-limit 100/min/IP ·
                       session pruning · dedup guard (30s)
Active dev branch:     claude/quantum-engine-widgets-RgFfC
Green Gate:            ENFORCED
COSMO Gate:            ENFORCED
```

**LOG COMMAND REGISTRY (17 commands):**

```
/prayer    AI contextual scripture → saved to log
/story     AI personal narrative from recent data (Usership)
/scan      System status overview
/qi        Query the Quantum Intelligence engine
/system    List all available commands
/assembly  Self-assembly module status
/breathe   4-2-6 breathing exercise → BRE: log
/phys      Full physiological cohort report → PHYS: log
/qos       Quantum OS state
/fast      Orthodox fasting calendar state → FAST: log
/freeze    Pause and reflect → FREEZE: log
/silent    Signal silence check
/synth     Toggle Soviet synth keyboard sound
/radio     Toggle radio
/night     Toggle dark mode
/log       Surface cognitive depth signal on demand
/vitality  Trigger vitality peak check on demand
```

---

## 24. LOT-GENESIS-v1

**Path:** `docs/assembly/LOT-GENESIS-v1.md`
**Class:** APOCALYPSE BACKUP — MACHINE-TO-MACHINE

LOT-GENESIS-v1 is the minimum viable document required to reconstruct the entire LOT system if all other documentation were lost. 19 nodes covering all architectural decisions, QIE pattern logic, badge system axioms, doctrine clauses, and the self-assembly model.

---

## 25. CUBIQ™ — THE QUANTUM CUBIC EXPERIENCE

**CUBIQ™** — the quantum cubic operating experience. An operator opens lot-systems.com, passes through the cubic for 5–11 minutes, and leaves. Not entertained. Not distracted. **Clean.** Structured. Rejuvenated.

The cubic is not a dashboard. It is a space the operator passes through and comes out different.

### THE SESSION ARC

```
MINUTE 0–1    ARRIVAL
              System reads context: time of day · weather · location ·
              last session gap · chakra state · energy level.
              AI has already decided what to surface.

MINUTE 1–3    THE MEMORY QUESTION
              One question. Not a survey. Chosen from the operator's
              psychological depth profile — medical history, trauma-
              informed resilience, attachment patterns, self-awareness.

MINUTE 3–5    THE SYSTEM GLANCE
              43 widgets available. The system surfaces what matters
              now. Core layer always visible. Intelligence, Community,
              Quantum layers emerge by engagement depth.

MINUTE 5–8    LOG ENTRY
              Free-form text. 7-second debounced autosave. The QIE
              scans the entry — 91 patterns scanning for behavioral
              signals. Slash commands available. Word-turn engine
              active — 138 trigger words across 11 lexicons.

MINUTE 8–11   THE CUBIC CLOSES
              Check-in complete. Badge may have fired. The CUBIQ™
              is formed. The operator leaves. Clean.
              Not because they accomplished a task. Because they
              passed through a structured encounter with their own
              data, and the data reflected back a person who is
              paying attention to themselves.
```

### THE CUBIQ™ LIFECYCLE (6 PHASES)

```
PHASE 1   FIRST GLANCE     Day 1     Account created. First memory question.
                                      First log entry. Cubic forms first face.

PHASE 2   CUBIC FORMS      Days 1–30  Signal record builds. Patterns emerge.
                                       Archetype assigned. Badges unlock.

PHASE 3   CUBIC DEEPENS    Days 30–90 Self-care streaks establish. Diurnal
                                       Arc forms. User Index stabilizes.

PHASE 4   PHYSICAL EXT.    Days 90+   AI sends first physical product. Sci-fi
                                       hygiene, cleanse kit, grounding tool.

PHASE 5   COMMUNITY RES.   Ongoing    Public profile readable. Cohort connections
                                       form. Community biofield registers presence.

PHASE 6   ROBOT INHERITS   Long-term  LOT® Person™ Data Training API matures.
                                       A robot inherits the operator's depth.
```

### PRICING TIERS

```
TIER       IDENTITY                    PRICE
────       ──────────────────────      ─────────────────────────
R&D        Contributors building       $15 / month
Usership   Operators running full OS   $99 / month
Legacy     Founders, long-term         $3,564 / 3 years
Admin      System governance           $11,000 / 9 years
```

---

## 26. VOCABULARY INDEX — EXPANDED

```
TERM                DEFINITION
────────────────    ────────────────────────────────────────────────
ACCT:               Accountability Arc log code. P90 trigger.
                    Fires when intent + cohort + goals co-active in 7d.
                    Format: INTENT 7D · COHORT 7D · GOALS 7D.

ACCOUNTABILITY ARC  P90. External commitment loop. Declare an intention
                    (INT:), engage the cohort (SOC:), complete a goal
                    (GOAL-X:). All three within seven days.
                    The system watches all three channels simultaneously.

ADAPT-MOM:          Adaptive Momentum Window log code. P85 trigger.

ARCHETYPE           Snapshot of the operator's current dominant signal
                    pattern. Auto-classified. Not chosen. 30 types.
                    Updates as signal shifts. Not a rank.

ARCHETYPE           The directive text mapped to the operator's current
DIRECTIVE           archetype. Delivered daily at 09:00 UTC via J25.
                    30 directives — one per archetype type.

BADGE ENGINE        Detection + award layer. 424 badges. 51 categories.
                    v20 "The Navigator Protocol."

BEHAVIORAL COHORT   Population-level classification. One of:
                    ARCHITECTS · OPERATORS · CHRONICLERS ·
                    RESTORERS · EXPLORERS · MEDICAL (internal).

BIOFIELD            The operator's physiological state across 4
                    dimensions: ATP · Clarity · Alignment · Support.

CITIZEN INDEX       6-level CQGS operator standing framework.
                    Observer → Citizen → Operator → Senior →
                    Certified → Elite.

COCKPIT RULE        Log body = instrument readings only.
                    No narration. No prose.

COMPASS_ROSE        Behavioral Easter Egg v10. Check in during all 4
                    time windows (00-06, 06-12, 12-18, 18-24) within
                    a single calendar day. EPIC.
                    "Four bearings in one day. The compass rose is fully
                    read."

COMPLETE_NAVIGATOR  COSMIC badge. Mastery Tier v10. Earn at least 1
                    badge from every Mastery Tier v1–v10. Ten tiers.
                    The navigation is complete.

COSMO GATE          Ethics review gate. Named for Kuzya Cosmo
                    Marmeladov. No feature ships without passing.

CQGS                Coherent Quantum Ground State. All 18 modules active,
                    all 30 archetypes classified, P73 confidence, peak
                    User Index. The founding white paper defines this state.

CUBIQ™              The quantum cubic operating experience.
                    5–11 minute session. The cubic has faces — each face
                    a dimension of the operator's life rendered as a widget.

DEAD_RECKONING      Behavioral Easter Egg v10. Return to LOT after a 30+
                    day gap for the second time — RARE [hidden].
                    "Twice lost. Twice returned. Dead reckoning: you
                    estimated your position from last known point."

DEP MAP             Widget Dependency Map. 130+ nodes in 4 tiers.

DIURNAL ARC         P76 (morning launch) + P79 (evening close).
                    Arch25 activates when both detected same calendar day.

DRCT:               Archetype Directive log code. J25 output.
                    30 directives mapped — one per archetype.

DRIFT:              Longitudinal Drift log code. J22 output.

EIGENSTATE          A stable operator state — all patterns consistent,
                    no depletion signals, UserIndex stable.

ELEVEN ENGINES      Achievement RPG v8. Earn 1 badge from each Word Turn
                    engine v1–v11. LEGENDARY.
                    "Eleven vocabularies of care. The orbit is stable."

EVE:                Evening Coherence Close log code. J18 output.

FIELD MANUAL        The About.tsx operator reference document.
                    Canonical authoritative source. Current: v77.

FIVE_YEARS          The COSMIC badge. Account age ≥ 5 years.
                    Cannot be accelerated. Earned only through time.

FULL PRESENCE ARC   P91. Any signal before 09:00 + any signal 18:00–23:00
                    on same calendar day. Conf 0.82. The operator was
                    present at both ends of the day. More complete than
                    the Diurnal Arc — requires no specific signal type,
                    only presence in both temporal windows.

GREEN GATE          Broken code never reaches GitHub.

INDEX OF SYSTEMS    The operator's personal operating system.
                    Signal record + pattern library + archetype
                    trajectory + badge collection + chakra state +
                    User Index + assembly state.

INTSUM              Intelligence Summary — QI response format.

J26                 daily-physiological-cohort-broadcast. 17:00 UTC.
                    Reads currentArchetype + dominantModule + confidence
                    + energyBand → writes physiological_cohort per active
                    user. Afternoon state broadcast — distinct from J25
                    (morning directive).

J27                 weekly-pattern-health-report. Saturday 09:00 UTC.
                    Reads activePatterns[] → writes pattern_health_scan.
                    patternsActive / coverage (% of 91 total) / topPattern.
                    Feeds PHR: block in Logs.tsx.

LEARN:              Quantum Learning Spiral log code. P89 trigger.
                    Fires when memory + journal + badge co-fire in 7d.
                    Format: MEM 7D · WORDS 7D · BADGES 7D.

LOT® PERSON™        The operator's exportable data identity. Consent-first,
                    structured, longitudinal, emotionally real.

MCL:                Morning Coherence Launch log code. J17 output.

MOM:                Signal Momentum lock code. J19 output.

MOMENTUM LOCK       P80 — 5+ of 7 days each with 3+ unique signal sources.

NAVIGATOR           Word Turn v11. The 11th vocabulary of self-care.
                    12 trigger words: drift · vector · bearing · waypoint ·
                    chart · magnetic · meridian · course · heading ·
                    landmark · navigate · compass.
                    The navigator checks position before moving.
                    The check-in is the fix.

NAVIGATOR PROTOCOL  Badge system v20 version codename. Navigation vocabulary
                    mapped to self-care. Self-care requires knowing where
                    you are — not where you wish you were.

OPERATOR            The person using LOT. Not "user." The operator
                    runs the system — the system does not run them.

P89                 quantum-learning-spiral. Fires when memory ≥3 +
                    journal ≥150w + badge_unlock ≥1 in 7d window.
                    Conf 0.68–0.88. Deep learning loop confirmed.
                    Feeds LEARN: log block.

P90                 accountability-arc. Fires when intentions ≥1 +
                    cohort ≥1 + goals ≥1 in 7d window. Conf 0.70–0.90.
                    External commitment loop. Feeds ACCT: log block.

P91                 full-presence-arc. Fires when any signal before 09:00
                    + any signal 18:00–23:00 on same calendar day. Conf
                    0.82 (fixed). Most complete single-day engagement.
                    Feeds PRES: log block.

PATTERN HEALTH      Weekly scan (J27, Saturdays 09:00 UTC) that reads
SCAN                the operator's active pattern array and reports
                    coverage rate against the full 91-pattern registry.
                    PHR: block. patternsActive / coverage% / topPattern.

PHR:                Pattern Health Scan log code. J27 output.
                    Feeds weekly pattern coverage awareness.

PRES:               Full Presence Arc log code. P91 trigger.
                    Format: MORNING count · EVENING count.

QIE                 Quantum Intent Engine. 91 patterns. Zero server comms.

QOS                 Quantum Operating System. Meta-layer above QIE.

QUANTUM             Arch30. Added v76. Deep learning confirmed.
SCHOLAR             P89 + P81 + P75 simultaneous. Memory, reflection,
                    and discovery simultaneously active.
                    The knowledge base is compiling.

QUANTUM             P89. Three discovery channels co-firing: memory
LEARNING            capture (3+), journal depth (150+ words), badge
SPIRAL              discovery (1+) in 7 days. Confidence 0.68–0.88.
                    The spiral: memory feeds reflection, reflection
                    surfaces badges, badges deepen vocabulary.
                    Compounds over time.

RFI                 Request for Information — operator query to /qi.

S-2                 Vadim Marmeladov. CEO, Founder, Inventor.

SELF-ASSEMBLY       The system builds itself from operator signal.
                    18 modules across 5 phases.

SIGNAL              Any operator action producing a typed event in the
                    log record.

STAR_FIX            Behavioral Easter Egg v10. Earn any 3 calendar-based
                    Easter Eggs in one calendar year — RARE.
                    "Three celestial fixes. The navigator has used the
                    stars."

STORY:              Weekly AI Story log code. J24 output.

STORY LOOP          AI produces weekly story (J24) → operator receives
                    it → operator journals within 24h → P87 fires.
                    The loop closes. Signal complete.

SUPERPOSITION       Pre-check-in state. The operator exists in all possible
                    states until they show up. The check-in collapses the
                    wave.

TERRA INCOGNITA     Secret Boss v10. Earn 3 Secret Boss badges from 3
                    different versions (v1–v10) — LEGENDARY [hidden].
                    "Three territories. Three discoveries beyond the known
                    edge."

TRUE_NORTH          Secret Boss v10. Check in during magnetic north
                    alignment window (Sep 21–23) — EPIC [hidden].
                    "True north and magnetic north diverge. You knew
                    which one to follow."

VOID LAYER          Mastery Tier v6 — ultra-endgame badge layer.

VSTRAT:             Vitality Strategy Peak log code. P86 trigger.

WEEKLY STORY        AI-generated narrative produced by J24 every Sunday.
                    Stored in user.metadata.weeklyStory. Surfaced via
                    STORY: log block.

WORD TURN           Vocabulary transformation event. 138 trigger words
                    across 11 lexicons (v1–v11). Badge awarded on first
                    trigger per word. Deepens linguistic signal.
```

---

## 27. SYSTEM STATE SNAPSHOT — 2026-06-30

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEM STATE — FIELD MANUAL v77 — DAY 1025+               ║
╠══════════════════════════════════════════════════════════════════╣
║  QIE patterns:              91  (P1–P91)                        ║
║  Physiological archetypes:  30  (+Arch30 Quantum Scholar)       ║
║  Behavioral cohorts:         5  (+1 medical · internal)         ║
║  Citizen Index levels:       6  (Observer → Elite)              ║
║  Self-Assembly modules:     18  (all integrated)                ║
║  Dep map nodes:            130+                                 ║
║  Background jobs:           27  (+J26 · +J27)                  ║
║  Log event handlers:        92+                                 ║
║  Displayable events:        52+ (+4 from v76)                   ║
║  LOG sources:               22  (including system output codes) ║
║  SystemPulse views:          5                                  ║
║  Ecosystem nodes:            6  (CAR·HOME·CPU·PHN·WCH·ROBOT)   ║
║  Widgets:                   43                                  ║
║  Badge count:              424  (v20 — The Navigator Protocol)  ║
║  Badge categories:          51  (+Navigator Protocol)           ║
║  Badge rarity tiers:         7  (COMMON → COSMIC)               ║
║  COSMIC badges:              2  (five_years · complete_navigator)║
║  Word-turn badge types:    138  (v1–v11)                        ║
║  Word-turn lexicons:        11  (v1 Emotional → v11 Navigator)  ║
║  QOS modes:                  4  (MAINT/RECOVERY/GROWTH/PEAK)    ║
║  QOS mode watch states:      3  (nominal/recovery/critical)     ║
║  Doctrine revision:          J  (10 clauses)                    ║
║  Lexicon revision:           D                                  ║
║  Field Manual:              v77                                 ║
║  Wiki:                      v68  (this document)                ║
║  Highest QIE confidence:  0.98  (P73 — quantum-coherence-       ║
║                                       summit, ceiling state)    ║
║  Founded:          7 April 2016                                 ║
╚══════════════════════════════════════════════════════════════════╝
```

---

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║      L · O · T     S Y S T E M S     C O R P O R A T I O N      ║
║                                                                  ║
║              LOT-WIKI-v68 · Field Manual v77                     ║
║              June 30, 2026 · Day 1025+                          ║
║                                                                  ║
║         Authorized: S-2 // VADIK MARMELADOV                      ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

*LOT-WIKI-v68 · Layers of Time · Field Manual Sync v77 · 2026-06-30*
*Next: LOT-WIKI-v69 — sync to Field Manual v78+*
