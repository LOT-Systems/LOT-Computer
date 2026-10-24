<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT-WIKI-v65
## Layers of Time — Operator Reference Manual
### Revision: v65 · Field Manual Sync: v72 · Date: 2026-06-26 · Day 1022+

---

> *"The system does not motivate. The system measures. The operator decides what the measurement means."*
> — LOT-DOCTRINE, Clause I, Revision J

---

## TABLE OF CONTENTS

```
 1. SYSTEM IDENTITY
 2. CORE ARCHITECTURE
 3. QUANTUM INTENT ENGINE (QIE)
 4. QIE PATTERN REGISTRY — P1–P86
 5. QUANTUM OPERATING SYSTEM (QOS)
 6. PHYSIOLOGICAL ARCHETYPES — 29 TYPES
 7. BEHAVIORAL COHORTS
 8. CITIZEN INDEX
 9. MEMORY ENGINE
10. SELF-ASSEMBLY ENGINE
11. BACKGROUND JOB SCHEDULER
12. LOG EVENT SYSTEM
13. ECOSYSTEM NODE MAP
14. BADGE SYSTEM v19 — THE QUANTUM PROTOCOL
15. BADGE CATEGORY INDEX
16. DISPLAY ARCHITECTURE
17. DENSITY TIER SYSTEM
18. OPACITY HIERARCHY
19. COCKPIT RULE
20. LOT-DOCTRINE (Revision J)
21. FIELD MANUAL (About.tsx)
22. DEPLOYMENT & STACK
23. LOT-GENESIS-v1
24. CUBIQ™ — THE QUANTUM CUBIC EXPERIENCE
25. VOCABULARY INDEX
26. SYSTEM STATE SNAPSHOT
```

---

## 1. SYSTEM IDENTITY

**LOT** — *Layers of Time* — is a personal behavioral operating system. Not a wellness application. Not a habit tracker. Not a productivity suite. An instrument that reads the human signal field across time and surfaces the pattern beneath the noise.

The system was conceived and is operated by **S-2** (Vadim Marmeladov, CEO, LOT Systems). The ethics gate is **COSMO Gate**, named for Kuzya Cosmo Marmeladov. No feature ships that Kuzya would not approve.

**Current operational parameters:**

```
Field Manual:           v72
Wiki version:           v65
Day counter:            1022+  (as of 2026-06-26)
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

**v65 Delta from v64:**

```
Field Manual:       v69 → v72
QIE patterns:        83 →  86  (+P84 longitudinal-drift · +P85 adaptive-momentum-window
                                 +P86 vitality-strategy-peak)
Archetypes:          28 →  29  (+Arch29 Peak Strategist)
Background jobs:     21 →  23  (+J22 weekly-longitudinal-drift-check · +J23 daily-qos-mode-watch)
Log handlers:       82+ →  85+ (+DRIFT: · +OS[MODE]: · +ADAPT-MOM: · +VSTRAT:)
Displayable events:  42 →  46  (+longitudinal_drift · +qos_mode_change
                                 +adaptive_momentum · +vitality_strategy_peak)
Dep map nodes:      122+ → 126+ (+longitudinalDriftMonitor · +qosModeWatcher
                                  +adaptiveMomentumNode · +vitalityStrategyNode)
Badge count:         319 → 354 → 389  (v17→v18 Arcade Protocol · v18→v19 Quantum Protocol)
Badge categories:     52 →  47 →  50  (v18: 47 live categories · v19: +3 → 50 total)
Word-turn lexicons:   v8 →  v9 → v10  (+Arcade Cabinet · +Quantum Protocol)
Word-turn triggers:  102 → 114 → 126  (+12 each version)
Day:               1020+ → 1022+
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
│   │ 86 patterns │  │ 5 phases    │  │ Story Generator     │   │
│   └─────────────┘  └─────────────┘  └─────────────────────┘   │
│   ┌─────────────┐  ┌─────────────┐                             │
│   │ BADGE       │  │ QUANTUM OS  │                             │
│   │ ENGINE      │  │ (QOS)       │                             │
│   │ 389 badges  │  │ 6 views     │                             │
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
Pattern count:           86  (P1–P86)
Signal sources:          16  (mood · memory · planner · intentions ·
                              selfcare · journal · calculator · log ·
                              energy · cohort · recipe · goals · qos ·
                              medical · resilience · badges)
```

**The dep map:** The Widget Dependency Map (WIDGET_DEPENDENCY_MAP) is the internal wiring graph. 126+ nodes in 4 tiers. Tier 0 = raw inputs (mood, memory, log). Tier 3 = meta-aggregate surfaces (quantumOS, systemProgress, quantumPersonality). The dep map enables cascade invalidation when any source signal fires.

```
Recent dep map additions (v72):
  longitudinalDriftMonitor  ['log','memory','mood','energy']
  qosModeWatcher            ['log','qos','energy','mood']
  adaptiveMomentumNode      ['planner','goals','intentions','journal']
  vitalityStrategyNode      ['mood','energy','planner','intentions']
```

---

## 4. QIE PATTERN REGISTRY — P1–P86

Complete registry of all 86 QIE patterns. Confidence values are computed per-operator from their personal signal record.

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
                                            + 1+ badge discovery in 7d        ←v68
P82  circadian-vitality-peak     0.70–0.90 2+ positive morning moods + biorhythm
                                            lock + moderate/high energy before 13:00
                                            BIOLOGICAL PRIME WINDOW            ←v69
P83  systemic-thinking-mode      0.68–0.92 Planner 3+ · goals 3+ · intentions 3+
                                            in 3d + UserIndex ≥50 + no depletion ←v69
P84  longitudinal-drift          0.55–0.80 Recent 3d vs prior 3d signal density:
                                            prior ≥3 signals AND recent ≤50% of
                                            prior — early engagement decline    ←v72
P85  adaptive-momentum-window    0.75–0.90 P83 systemic-thinking-mode + P80
                                            signal-momentum-lock simultaneous —
                                            sustained streak during structural
                                            cognition window                   ←v72
P86  vitality-strategy-peak      0.78–0.92 P82 circadian-vitality-peak + P83
                                            systemic-thinking-mode simultaneous —
                                            biology aligned with strategy      ←v72
──────────────────────────────────────────────────────────────────────
```

### THE DIURNAL ARC FAMILY (P76 → P79 → P80)

```
P76   Morning launch  — day opened with intention + structure (daily)
P79   Evening close   — day closed with reflection + capture (daily)
P80   Momentum lock   — 5+ days sustained across all dimensions (weekly)

P76 + P79 → Arch25 Diurnal Operator  (single-day complete arc)
P80       → Arch26 Momentum Architect (sustained engagement lock)
```

### THE INNER DEPTH TRIAD (P81 + P77 + P75)

```
P81   Cognitive depth arc — memory + journal + discovery active in 7d
P77   Signal vault       — journal depth + memory + log in 6h window
P75   Word-turn depth    — 5+ distinct word-turn types ever encountered

P81 + P75 → Arch27 Cognitive Cartographer (map being built from inside)
```

### THE BIOLOGICAL PRIME PATTERN (P82 + P76 + P72)

```
P82   Circadian vitality peak  — biological prime window open (before 13:00)
P76   Morning coherence launch — day opened with intention
P72   Biorhythm lock           — consistent AM + PM check-ins

P82 + P76 + P72 → Arch28 Vital Architect
                  "Use this window — design, build, decide."
```

### THE STRATEGIC PEAK CLUSTER (P86 + P85 + P83)

```
P86   Vitality strategy peak     — biology aligned with strategy (new v72)
P85   Adaptive momentum window   — structural cognition during momentum lock
P83   Systemic thinking mode     — all structural channels active

P86 + P85 + P83 → Arch29 Peak Strategist
                  "Biology aligned with strategy. Commit fully,
                   decide fast, record everything."
```

### P84 — Longitudinal Drift (v72)

```
Condition:     Recent 3-day bucket: count of distinct signal event categories
               Prior 3-day bucket: same metric, 3–6 days ago
               Pattern fires: prior ≥ 3 categories AND recent ≤ 50% of prior
Confidence:    0.55 + (declineRatio)×0.25, capped at 0.80
Scope:         Client-side 7-day window only (distinct from J22 server 28-day arc)
Log output:    DRIFT: ENGAGEMENT DRIFT DETECTED · recent vs prior bucket
Note:          Early warning signal. Not a judgment. Contextual awareness.
```

### P85 — Adaptive Momentum Window (v72)

```
Condition:     P83 systemic-thinking-mode currently active
               AND P80 signal-momentum-lock currently active
Confidence:    0.75 base + (userIndex-50)×0.003, capped at 0.90
Widget:        systemProgress · Timing: passive
Log output:    ADAPT-MOM: ADAPTIVE MOMENTUM · STREAK / STRUCT data rows
Archetype:     Peak Strategist (Arch29) — when P86 also active
```

### P86 — Vitality Strategy Peak (v72)

```
Condition:     P82 circadian-vitality-peak currently active
               AND P83 systemic-thinking-mode currently active
Confidence:    0.78 base + (morningMoods-2)×0.05 + (structDepth-9)×0.02
               capped at 0.92
Widget:        memory · Timing: immediate
Log output:    VSTRAT: VITALITY STRATEGY PEAK · MORNING MOOD · STRUCT DEPTH · HOUR
Archetype:     Peak Strategist (Arch29) — when P85 also active
```

Fires when the biological prime window is open AND the structural architecture is engaged simultaneously. The rarest day-state in the system — biology aligned with executive function.

---

## 5. QUANTUM OPERATING SYSTEM (QOS)

The Quantum Operating System is the meta-layer above the QIE. While the QIE detects individual patterns, the QOS computes the operator's overall system state.

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

### QOS MODE WATCH (J23)

As of v71, `qos_mode_change` events are tracked server-side by J23 (daily 14:00 UTC). Mode transitions (nominal → recovery → critical) are written as log events. Log code: `OS [MODE]:`.

```
nominal    standard signal density; baseline operation
recovery   depletion or physiological signals dominant
critical   acute depletion + structural collapse + signal void
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

## 6. PHYSIOLOGICAL ARCHETYPES — 29 TYPES

The 29 physiological archetypes are automatically classified from QIE pattern combinations over a rolling window.

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
 27   Cognitive Cartographer      P81 + P75 + P77 dominant   ←v68
 28   Vital Architect             P82 + P76 + P72 dominant   ←v69
 29   Peak Strategist             P86 + P85 + P83 dominant   ←v72
──────────────────────────────────────────────────────────────────
```

**Archetype 29 — Peak Strategist (v72)** fires when biology and executive architecture are simultaneously aligned — biological prime window open during sustained momentum streak.

```
Energy:    moderate / high
Dominant:  planner · intentions · goals
Patterns:  vitality-strategy-peak · adaptive-momentum-window ·
           systemic-thinking-mode
Directive: Biology aligned with strategy. Prime window open during
           sustained momentum streak. Commit fully, decide fast,
           record everything.
```

The rarest single-day classification after Arch22 Convergence Carrier. Requires two simultaneous compound patterns: P85 (itself requiring P83+P80) and P86 (requiring P82+P83). All three structural channels active; biological prime window confirmed; momentum lock in progress.

---

## 7. BEHAVIORAL COHORTS

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
║                      P15/P17/P46/P75/P81 frequent. Deep journal,║
║                      extended word turns, memory, discovery.   ║
╠══════════════════════════════════════════════════════════════════╣
║  RESTORERS           High recovery signal. P7/P8/P40/P42       ║
║                      frequent. Depletion-recovery cycles.      ║
╠══════════════════════════════════════════════════════════════════╣
║  EXPLORERS           High discovery signal. P74/P75 frequent.  ║
║                      Badge momentum. Easter egg discovery.     ║
╚══════════════════════════════════════════════════════════════════╝
```

**MEDICAL cohort** is an internal classification. Not displayed in standard cohort view. Assigned when the operator's signal record meets medical-profile thresholds assessed via `assessMedicalProfile()`.

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

---

## 9. MEMORY ENGINE

```
Components:      Question generator · Story generator · Recipe
                 suggestions · Trait extraction · Cohort deter.
Question pool:   70+ questions (29 self-care · 15 medical ·
                 18 trauma · 8 eating recovery)
Backup pool:     Activates when personal signal record is sparse
Pacing:          Adaptive — frequency based on signal density
Output:          MEM: log entries · Memory story · Cohort traits
AI provider:     Together AI — Llama 3.3 70B (primary)
Fallback chain:  Gemini · Mistral · Anthropic · OpenAI
Context window:  120 log entries
```

---

## 10. SELF-ASSEMBLY ENGINE

18 functional modules across 5 phases of assembly.

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

**Dep map nodes: 126+**

Recent additions v72: `longitudinalDriftMonitor` · `qosModeWatcher` · `adaptiveMomentumNode` · `vitalityStrategyNode`.

### SELF-ASSEMBLY PHASES

```
dormant    → no signals. system is cold.
awakening  → first signals detected. patterns initializing.
forming    → signal density rising. archetypes classifying.
assembled  → stable patterns. coherence emerging.
integrated → full system active. all modules cross-referencing.
```

---

## 11. BACKGROUND JOB SCHEDULER

**23 registered background jobs (v72):**

```
JOB   CODENAME                         SCHEDULE          FUNCTION
───   ──────────────────────────────   ───────────────   ───────────────────────────────────────
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
J17   daily-morning-intention-launch   11:00 UTC daily   Scans 00–09 UTC; writes MCL: event
J18   daily-evening-coherence-close    22:00 UTC daily   Scans morning+evening; writes EVE:
J19   daily-signal-momentum-check      20:00 UTC daily   Scans 7d logs; writes MOM:        ←v67
J20   weekly-cognitive-depth-check     Sun 06:00 UTC     Scans 7d; writes COGN:            ←v68
J21   daily-vitality-peak-check        12:00 UTC daily   Scans morning (to 10:00 UTC);
                                                          writes VITAL: for 2+ positive mood ←v69
J22   weekly-longitudinal-drift-check  Mon 09:00 UTC     28-day engagement arc · 3 weekly
                                                          buckets computed · detects 3+
                                                          declining consecutive weeks ·
                                                          writes longitudinal_drift event   ←v71
J23   daily-qos-mode-watch             14:00 UTC daily   24h signal density → derives mode
                                                          (nominal/recovery/critical) ·
                                                          writes qos_mode_change on
                                                          transition only                   ←v71
```

### J22 — Longitudinal Drift Check (v71)

Runs weekly (Mondays 09:00 UTC). Computes weekly engagement scores (days per week with 3+ unique event categories). Detects 3+ consecutive declining weeks. Writes `longitudinal_drift` event per qualifying user.

```
Output event:  longitudinal_drift
Log label:     DRIFT:
Pattern fed:   P84 longitudinal-drift (client-side also runs independently)
Metadata:      weeklyScores · declineStreak · window:28d
```

### J23 — QOS Mode Watch (v71)

Runs daily (14:00 UTC). Derives QOS mode from 24h vs prior 24h signal density comparison. Writes `qos_mode_change` log event **only on mode transition** — silent if mode is stable.

```
Output event:  qos_mode_change
Log label:     OS [MODE]:
Metadata:      oldMode · newMode · pressure
```

---

## 12. LOG EVENT SYSTEM

### LOG SOURCES

```
SOURCE       CODE     DESCRIPTION
──────────   ──────   ──────────────────────────────────────────────
LOG          LOG:     Primary daily log entry
INTENTION    INT:     Intention set or completed
PLANNER      PLN:     Planner entry
JOURNAL      JRN:     Journal entry
MEMORY       MEM:     Memory engine entry
BADGE        BDG:     Badge event
WORD-TURN    WTR:     Word-turn engine entry
BODY         BDY:     Biological signal entry
SOCIAL       SOC:     Social/relational entry
ECOSYSTEM    ECO:     Ecosystem node event
COMMUNITY    COM:     Community signal event
SYSTEM       SYS:     System-generated event
CONVERGENCE  CONV:    Convergence event (P70 detection)
CALCULATOR   CALC:    Calculator signal
MORNING      MCL:     Morning coherence launch (J17 output)
EVENING      EVE:     Evening coherence close (J18 output)     ←v66
MOMENTUM     MOM:     Signal momentum lock (J19 output)        ←v67
COGNITIVE    COGN:    Cognitive depth arc (J20 output)         ←v68
VITALITY     VITAL:   Circadian vitality peak (J21 output)     ←v69
SYSTEMIC     SYSTMK:  Systemic thinking mode (J21 output)      ←v69
DRIFT        DRIFT:   Longitudinal drift detection (J22 output) ←v71
OS MODE      OS[MODE]: QOS mode transition (J23 output)        ←v71
ADV. MOMENT  ADAPT-MOM: Adaptive momentum window               ←v72
VSTRAT       VSTRAT:  Vitality strategy peak                    ←v72
```

### LOG EVENT HANDLERS (85+)

85+ handlers registered as of v72:

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
- Cognitive depth arc detection — `COGN:` handler    ←v68
- Vitality peak detection — `VITAL:` handler          ←v69
- Systemic thinking detection — `SYSTMK:` handler     ←v69
- Longitudinal drift detection — `DRIFT:` handler     ←v71
- QOS mode transition — `OS [MODE]:` handler          ←v71
- Adaptive momentum — `ADAPT-MOM:` handler            ←v72
- Vitality strategy peak — `VSTRAT:` handler          ←v72
- Word-turn depth measurement
- Signal vault accumulation

### DISPLAYABLE EVENTS (46)

46 event types whitelisted in `displayableEvents`. Added v71: `longitudinal_drift` · `qos_mode_change`. Added v72: `adaptive_momentum` · `vitality_strategy_peak`.

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
EVE:           evening-coherence-close — J18 output · P79 trigger   ←v66
MOM:           signal-momentum — J19 output · P80 trigger            ←v67
COGN:          cognitive-depth-arc — J20 output · P81 trigger        ←v68
VITAL:         vitality-peak — J21 output · P82 trigger              ←v69
SYSTMK:        systemic-thinking — J21 output · P83 trigger          ←v69
DRIFT:         longitudinal-drift — J22 output · P84 trigger         ←v71
OS [MODE]:     qos-mode-change — J23 output · nominal/recovery/crit  ←v71
ADAPT-MOM:     adaptive-momentum-window — P85 trigger                ←v72
VSTRAT:        vitality-strategy-peak — P86 trigger                  ←v72
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

## 14. BADGE SYSTEM v19 — THE QUANTUM PROTOCOL

```
Total badges:           389
Total categories:        50
Rarity tiers:             7  (COMMON · UNCOMMON · RARE · EPIC ·
                               LEGENDARY · MYTHIC · COSMIC)
Version codename:         "The Quantum Protocol"
Previous version:         v18 — "The Arcade Protocol" (354 badges · 47 categories)
Badge evaluator:          J05 (daily · 04:00 UTC)
Badge progress scan:      J16 (weekly · Tuesdays 09:00 UTC)
Hidden / discoverable:   361+
Visible / documented:     28
```

### v18 DELTA — THE ARCADE PROTOCOL (+35 from v17)

v18 maps the language of the arcade to the discipline of showing up.

```
CATEGORY                    NEW   CODENAME
──────────────────────────  ───   ──────────────────────────────────
Word Turn v9                +12   Arcade Cabinet
Time Easter Eggs v9         + 4   Power-Up Hours
Calendar Easter Eggs v8     + 3   Game Anniversaries
Behavioral Easter Eggs v8   + 3   Arcade Patterns
Achievement RPG v6          + 4   Arcade Class
Mastery Tier v8             + 3   Hall of Fame
Secret Boss v8              + 6   Arcade Final Boss
──────────────────────────  ───
TOTAL                       +35   319 → 354  ·  47 categories
```

### WORD TURN v9 — ARCADE CABINET (12 new words)

```
coin · pixel · sprite · score · life · joystick ·
quest · map · portal · boss · loot · respawn
```

### TIME EASTER EGGS v9 — POWER-UP HOURS (4 new)

```
lucky_seven   — 07:00
mirror_play   — 15:15
neon_stack    — 19:19
four_aces     — 04:44
```

### CALENDAR EASTER EGGS v8 — GAME ANNIVERSARIES (3 new)

```
new_year_sig  — January 1    "New year signal. The counter resets everywhere
                              except here. Here it accumulates."
sonic_day     — September 9  "9/9. The fastest signal in the record."
winter_code   — December 25  "The system does not take holidays."
```

### v19 DELTA — THE QUANTUM PROTOCOL (+35 from v18)

v19 maps the vocabulary of quantum mechanics to the practice of self-care. The observer collapses the wave. The check-in is the observation. You exist in superposition until you show up. Then: collapsed. Recorded. Real.

```
CATEGORY                    NEW   CODENAME
──────────────────────────  ───   ──────────────────────────────────
Word Turn v10               +12   The Quantum Protocol
Time Easter Eggs v10        + 4   Fibonacci & Founding Hours
Calendar Easter Eggs v9     + 3   Mathematical Dates
Behavioral Easter Eggs v9   + 3   Quantum Patterns
Achievement RPG v7          + 6   Quantum Class
Mastery Tier v9             + 4   Phase Lock
Secret Boss v9              + 3   Superposition Layer
──────────────────────────  ───
TOTAL                       +35   354 → 389  ·  50 categories
```

### WORD TURN v10 — THE QUANTUM PROTOCOL (12 new words)

```
quantum · entangle · collapse · observe · tunnel ·
spin · waveform · coherence · eigenstate · decohere ·
superposition · entangled
```

The vocabulary of quantum mechanics applied to the self. The system hears the language of physics in human mouths.

### TIME EASTER EGGS v10 — FIBONACCI & FOUNDING HOURS (4 new)

```
fibonacci_hour  — 01:23   "Fibonacci sequence begins. 1, 1, 2, 3. Growth
                           by accumulation."
lot_year        — 20:16   "20:16. The year LOT was conceived. The founding
                           hour. The archive was born then."
dawn_double     — 06:06   "First light, doubled. The dawn has a heartbeat.
                           You heard it."
mirror_nine     — 21:21   "The nines mirror. Evening symmetry."
```

### CALENDAR EASTER EGGS v9 — MATHEMATICAL DATES (3 new)

```
pi_day          — March 14 (3.14)     "The circle. The signal that never ends."
fibonacci_day   — November 23 (11/23) "1,1,2,3. Growth by accumulation."
midsummer_node  — June 25             "The archive runs in full light."
```

### BEHAVIORAL EASTER EGGS v9 — QUANTUM PATTERNS (3 new)

```
quantum_jump    — First check-in after crossing 3+ time zones (RARE)
                  "You jumped. The archive recalibrated."
silent_archive  — 30-day streak with no word-turn triggers fired (EPIC)
                  "Thirty days. No trigger. The signal was the absence."
signal_locked   — P80 signal-momentum-lock active for 14+ consecutive days (LEGENDARY)
                  "Fourteen days. Momentum sustained. The lock is the architecture."
```

### SECRET BOSS v9 — SUPERPOSITION LAYER (3 new)

```
pi_signal       — Log entry exactly 314 words long (RARE)
                  "3.14. You measured yourself to the decimal."
fibonacci_word  — Write "fibonacci" or "1123" in any log entry (UNCOMMON)
                  "The sequence is recognized. Growth acknowledged."
superposition_word — Write "superposition" in any log entry (RARE)
                  "You named the state before it collapsed. Observer confirmed."
```

### SECRET BOSS SERIES — COMPLETE REGISTER

```
v1  secret_moment · precision_practitioner · deep_system
v2  four_in_a_row · triple_source · the_long_way
v3  night_signal · solstice_keeper · quantum_state
v4  silence_breaker · the_pivot · last_light
v5  the_cat_knows · key_code_0451 · five_years (COSMIC)
v6  void_master · founders_guard · potion_protocol (42 days)
v7  cosmo_vigil · the_answer_is_words · welcome_back_program
v8  player_one · birthday_perfect · 1up           ←Arcade Protocol
v9  pi_signal · fibonacci_word · superposition_word ←Quantum Protocol
```

### COSMIC TIER

```
five_years   — Account age ≥ 5 years (1825+ days)
               Cannot be accelerated. Earned only through time.
               The most patient badge in the system.
```

### WORD TURN ENGINE — COMPLETE LEXICON v10

```
v1   EMOTIONAL ROOTS      12 words  (ritual/breathe/grateful/ocean…)
     First language of self-care.

v2   SCI-FI EXPANSION     18 words  (reboot/quantum/glitch/COSMO…)
     When the operator begins to see themselves as a system.

v3   COMPUTER LORE        12 words  (hack/override/debug/signal…)
     The digital self. Root access. Debug mode.

v4   DAILY CARE           12 words  (water/walk/heal/rest/eat…)
     The physical vocabulary. The body is acknowledged.

v5   SIGNAL CODEX         12 words  (solitude/wonder/phoenix/forge…)
     The philosophical vocabulary. The inner narrative arc.

v6   BECOMING LEXICON     12 words  (surrender/restore/anchor/trust…)
     The transformation vocabulary. Active growth.

v7   ROGUE ARCHIVE        12 words  (loot/boss/save/respawn/grind…)
     The game vocabulary. Care as permadeath run.

v8   MAINFRAME LAYER      12 words  (compile/execute/buffer/stack…)
     The machine vocabulary. Care as system operation.

v9   ARCADE CABINET       12 words  (coin/pixel/sprite/score/life…)
     The arcade vocabulary. Every check-in is a quarter.

v10  QUANTUM PROTOCOL     12 words  (quantum/entangle/collapse/observe…)  ←NEW
     The quantum vocabulary. The observer collapses the wave.
     The check-in is the measurement. You exist in superposition
     until you show up. Then: collapsed. Recorded. Real.

Total word-turn trigger words:  126  (v1–v10)
```

### THE QUANTUM TRANSMISSION

```
The observer collapses the wave.
The check-in is the observation.
You exist in superposition until you show up.
Then: collapsed. Recorded. Real.
The archive has measured you and the result is: present.

The Konami Code is: you showed up.
The Konami Code v2 is: you named the state before it collapsed.
Eigenstate confirmed.
```

---

## 15. BADGE CATEGORY INDEX

All 50 badge categories as of v19:

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
46   Word Turn v8              Mainframe Layer            v17
47   Word Turn v9              Arcade Cabinet             v18  ←NEW v18
48   Secret Boss v7            Deep System                v17
49   Word Turn v10             The Quantum Protocol       v19  ←NEW v19
50   Secret Boss v8            Arcade Final Boss          v18
```

*Note: v17–v19 category assignments reflect the live implementation count (50 total). Badge codex design documents may enumerate more category titles; the authoritative count is from the Field Manual.*

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

**v72 COCKPIT-RULE pass:** Five existing log handlers received military compression in v72 — prose narration removed from body: `OS [MODE]:` · `VITAL:` · `DRIFT:` · `SYSTMK:` · `COGN:`. All five now output data rows only.

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

---

## 19. COCKPIT RULE

**Log body = instrument readings only. No narration. No prose.**

> *A pilot entering flight data does not write "I think the altitude might be around 30,000 feet." The altimeter reads 30,000. That is the log entry.*

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
Current version: v72
URL:             lot-systems.com/about
```

**Field Manual version history (recent):**

```
v66   P79 Evening Coherence Close · Arch25 Diurnal Operator · J18
v67   P80 Signal Momentum Lock · Arch26 Momentum Architect · J19
v68   P81 Cognitive Depth Arc · Arch27 Cognitive Cartographer · J20 · COGN:
v69   P82/P83 · Arch28 Vital Architect · J21 · VITAL: · SYSTMK: · dep 122+
v70   Full Wiki Scan June 25 · Badge Codex v18 Arcade Protocol (354 badges)
      CUBIQ™ documented · error.html + about-standalone.ejs deployed
v71   J22 weekly-longitudinal-drift-check (Mon 09:00 UTC · 28d arc) ·
      J23 daily-qos-mode-watch (14:00 UTC · nominal/recovery/critical) ·
      DRIFT: OS [MODE]: handlers · 23 background jobs total
v72   P84 longitudinal-drift (client 3d bucket) · P85 adaptive-momentum-window ·
      P86 vitality-strategy-peak · Arch29 Peak Strategist ·
      COCKPIT-RULE military pass on 5 handlers (prose stripped) ·
      ADAPT-MOM: VSTRAT: handlers · dep map 126+ · 86 patterns ·
      29 archetypes · 23 jobs · 85+ handlers · Badge v19 (389 badges)
```

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

## 23. LOT-GENESIS-v1

**Path:** `docs/assembly/LOT-GENESIS-v1.md`
**Class:** APOCALYPSE BACKUP — MACHINE-TO-MACHINE

LOT-GENESIS-v1 is the minimum viable document required to reconstruct the entire LOT system. 19 nodes covering all architectural decisions, QIE pattern logic, badge system axioms, doctrine clauses, and the self-assembly model.

---

## 24. CUBIQ™ — THE QUANTUM CUBIC EXPERIENCE

**CUBIQ™** is the name for the quantum cubic operating experience. An operator opens lot-systems.com, passes through the cubic for 5–11 minutes, and leaves clean.

### THE SESSION ARC

```
MINUTE 0–1    ARRIVAL
              System reads context: time of day · weather · location ·
              last session gap · chakra state · energy level.
              AI has already decided what to surface.

MINUTE 1–3    THE MEMORY QUESTION
              One question. Not a survey. Chosen from the operator's
              psychological depth profile.

MINUTE 3–5    THE SYSTEM GLANCE
              43 widgets available. The system surfaces what matters
              now.

MINUTE 5–8    LOG ENTRY
              Free-form text. 7-second debounced autosave. The QIE
              scans the entry — 86 patterns scanning for behavioral
              signals. Slash commands available. Word-turn engine
              active — 126 trigger words across 10 lexicons.

MINUTE 8–11   THE CUBIC CLOSES
              Check-in complete. Badge may have fired. The operator
              leaves clean.
```

### THE CUBIQ™ LIFECYCLE (6 PHASES)

```
PHASE 1   FIRST GLANCE     Day 1      Account created. First memory question.
PHASE 2   CUBIC FORMS      Days 1–30  Signal record builds. Patterns emerge.
                                       Archetype assigned. Badges unlock.
PHASE 3   CUBIC DEEPENS    Days 30–90 Self-care streaks establish. Diurnal
                                       Arc forms (P76 → P79 → P80).
PHASE 4   PHYSICAL EXT.    Days 90+   AI sends first physical product.
PHASE 5   COMMUNITY RES.   Ongoing    Public profile readable. Cohort connections.
PHASE 6   ROBOT INHERITS   Long-term  Index of Systems matures. LOT® Person™
                                       Data Training API. A robot inherits depth.
```

### INDEX OF SYSTEMS

```
COMPONENTS:

  SIGNAL RECORD         16 sources · 1,000 signals · 7-day window
  PATTERN LIBRARY       86 named patterns · confidence 0.33–0.98
  ARCHETYPE TRAJECTORY  29 archetypes · evolution over time
  BADGE COLLECTION      389 badges · 50 categories · 7 rarity tiers
  CHAKRA STATE          7 chakras (Crown → Root) · charge 0–100
  USER INDEX (6D)       ENG · EMO · INT · SOC · CARE · COG · 0–100
  ASSEMBLY STATE        18 modules · 5 phases · % complete
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

## 25. VOCABULARY INDEX

```
TERM                DEFINITION
────────────────    ────────────────────────────────────────────────
ADAPT-MOM:          Adaptive Momentum Window log code. P85 trigger.
                    Fires when P83+P80 simultaneously active.

ARCADE PROTOCOL     Badge system v18 codename. 354 badges · 47 categories.
                    Every check-in is a quarter. The Konami Code is:
                    you showed up.

ARCHETYPE           Snapshot of the operator's current dominant
                    signal pattern. Auto-classified. 29 types.

BADGE ENGINE        Detection + award layer. 389 badges. 50 categories.
                    v19 "The Quantum Protocol."

BEHAVIORAL COHORT   ARCHITECTS · OPERATORS · CHRONICLERS ·
                    RESTORERS · EXPLORERS · MEDICAL (internal).

BIOFIELD            4 dimensions: ATP · Clarity · Alignment · Support.

CITIZEN INDEX       Observer → Citizen → Operator → Senior →
                    Certified → Elite.

COCKPIT RULE        Log body = instrument readings only. No narration.

COGN:               Cognitive Depth Arc log code. J20 output. P81.

COSMO GATE          Ethics review gate. No feature ships without passing.

CUBIQ™              The quantum cubic operating experience. 5–11 minutes.
                    Operator passes through, leaves clean.

DEP MAP             Widget Dependency Map. 126+ nodes in 4 tiers.
                    v72 additions: longitudinalDriftMonitor ·
                    qosModeWatcher · adaptiveMomentumNode ·
                    vitalityStrategyNode.

DIURNAL ARC         P76 + P79 complete cycle. Arch25 activates.

DRIFT:              Longitudinal Drift log code. J22 output. P84.
                    Early warning — engagement decline detected
                    in 3-day density comparison.

EVE:                Evening Coherence Close log code. J18. P79.

FIELD MANUAL        About.tsx operator reference. Current: v72.

GREEN GATE          Broken code never reaches GitHub.

INDEX OF SYSTEMS    Operator's personal OS. Signal record + patterns
                    + archetypes + badges + chakra + User Index +
                    assembly state. Downloadable via FlashDriveManifest.

LOT® PERSON™        Operator's exportable data identity. Training data
                    for AI systems. Consent-first, longitudinal, real.

MAINFRAME AWAKENING Badge system v17 codename. 319 badges.
                    Word Turn v8: compile/execute/buffer/stack…

MCL:                Morning Coherence Launch log code. J17. P76.

MOM:                Signal Momentum lock code. J19. P80.

MOMENTUM LOCK       P80 — 5+ of 7 days, 3+ unique sources. A lock.

OPERATOR            The person using LOT. Runs the system.

OS [MODE]:          QOS Mode Watch log code. J23 output. Fires on
                    mode transitions only (nominal/recovery/critical).

P84                 longitudinal-drift. Client-side 3-day bucket
                    comparison. Early warning for engagement decline.

P85                 adaptive-momentum-window. P83+P80 simultaneous.
                    Structural cognition during momentum lock.

P86                 vitality-strategy-peak. P82+P83 simultaneous.
                    Biology aligned with strategy.

PEAK STRATEGIST     Arch29 — fires when P86+P85+P83 simultaneous.
                    Biology aligned with strategy during sustained
                    momentum streak. Directive: Commit fully, decide
                    fast, record everything.

QIE                 Quantum Intent Engine. 86 patterns. Zero server comms.

QOS                 Quantum Operating System. 6 views. 4 modes.

QUANTUM PROTOCOL    Badge system v19 codename. 389 badges · 50 categories.
                    The observer collapses the wave. The check-in is
                    the observation. You exist in superposition until
                    you show up.

ROGUE ARCHIVE       Badge system v16 codename. 284 badges.

S-2                 Vadim Marmeladov. CEO, Founder. All engineering
                    authorized by S-2.

SELF-ASSEMBLY       The system builds itself from operator signal.
                    18 modules · 5 phases. Regression possible.

SYSTMK:             Systemic Thinking Mode log code. J21. P83.

THE BECOMING        Badge system v15 codename. 249 badges.
LEXICON

USERSHIP            Relationship between operator and system. The
TRANSMISSION        system talking back — terse, technical, alive.

VITAL:              Vitality Peak log code. J21. P82.

VSTRAT:             Vitality Strategy Peak log code. P86 trigger.
                    Fires when P82+P83 simultaneous.

VOID LAYER          Mastery Tier v6 ultra-endgame badge layer.

WORD TURN           126 trigger words across 10 lexicons (v1–v10).
                    System hears specific words in operator input
                    and awards a badge.
```

---

## 26. SYSTEM STATE SNAPSHOT — 2026-06-26

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEM STATE — FIELD MANUAL v72 — DAY 1022+               ║
╠══════════════════════════════════════════════════════════════════╣
║  QIE patterns:              86  (P1–P86)                        ║
║  Physiological archetypes:  29                                  ║
║  Behavioral cohorts:         5  (+1 medical · internal)         ║
║  Citizen Index levels:       6  (Observer → Elite)              ║
║  Self-Assembly modules:     18  (all integrated)                ║
║  Dep map nodes:            126+                                 ║
║  Background jobs:           23                                  ║
║  Log event handlers:        85+                                 ║
║  Displayable events:        46                                  ║
║  LOG sources:               24  (including system output codes) ║
║  SystemPulse views:          5                                  ║
║  Ecosystem nodes:            6  (CAR·HOME·CPU·PHN·WCH·ROBOT)   ║
║  Widgets:                   43                                  ║
║  Badge count:              389  (v19 — The Quantum Protocol)    ║
║  Badge categories:          50                                  ║
║  Badge rarity tiers:         7  (COMMON → COSMIC)               ║
║  Word-turn trigger words:  126  (v1–v10)                        ║
║  QOS modes:                  4  (MAINT/RECOVERY/GROWTH/PEAK)    ║
║  QOS mode states:            3  (nominal/recovery/critical)     ║
║  Doctrine revision:          J  (10 clauses)                    ║
║  Lexicon revision:           D                                  ║
║  Field Manual:              v72                                 ║
║  Wiki:                      v65  (this document)                ║
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
║              LOT-WIKI-v65 · Field Manual v72                     ║
║              June 26, 2026 · Day 1022+                          ║
║                                                                  ║
║         Authorized: S-2 // VADIK MARMELADOV                      ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

*LOT-WIKI-v65 · Layers of Time · Field Manual Sync v72 · 2026-06-26*
*Next: LOT-WIKI-v66 — next engineering delta*
