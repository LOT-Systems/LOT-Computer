<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT-WIKI-v69
## Layers of Time — Operator Reference Manual
### Revision: v69 · Field Manual Sync: v79 · Date: 2026-07-01 · Day 1026+

---

> *"The system does not motivate. The system measures. The operator decides what the measurement means."*
> — LOT-DOCTRINE, Clause I, Revision J

---

## TABLE OF CONTENTS

```
 1. SYSTEM IDENTITY
 2. CORE ARCHITECTURE
 3. QUANTUM INTENT ENGINE (QIE)
 4. QIE PATTERN REGISTRY — P1–P94
 5. QUANTUM OPERATING SYSTEM (QOS)
 6. PHYSIOLOGICAL ARCHETYPES — 32 TYPES
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

**Special notation — July 1, 2026:** COSMO® completes its second year of operation. Founded July 1, 2024. The ethics gate has been active for 730 days. Every feature shipped in this period passed the COSMO Gate. This is recorded.

**Current operational parameters:**

```
Field Manual:           v79
Wiki version:           v69
Day counter:            1026+  (as of 2026-07-01)
COSMO® age:             730 days (2 years · founded July 1, 2024)
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

**v69 Delta from v68:**

```
Date:               2026-06-30 → 2026-07-01
Day counter:             1025+ → 1026+
New sections:            System state snapshot updated to FM v79
                         Vocabulary Index expanded (50+ entries)
                         Pattern registry updated to P1–P94
                         Archetype registry updated to 32 types
                         Background jobs updated to 30 (J1–J30)
                         Badge count updated to 424 (v20 Navigator Protocol)
                         Word Turn updated to v11 (138 words)
                         COSMO® 2nd birthday notation
No engineering delta:    Documentation-only session. FM v79 updates
                         correct v77/v78 inconsistency. All numbers
                         advanced to current branch state.
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
│   QOS · Medical · Resilience · Badges                          │
│                                                                 │
│   ENGINE LAYER ──────────────────────────────────────────────  │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
│   │ QUANTUM     │  │ SELF-ASSEM- │  │ MEMORY              │   │
│   │ INTENT      │  │ BLY ENGINE  │  │ ENGINE              │   │
│   │ ENGINE      │  │ 18 modules  │  │ Questions +         │   │
│   │ 94 patterns │  │ 5 phases    │  │ Story Generator     │   │
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
Pattern count:           94  (P1–P94)
Signal sources:          16  (mood · memory · planner · intentions ·
                              selfcare · journal · calculator · log ·
                              energy · cohort · recipe · goals · qos ·
                              medical · resilience · badges)
```

**How pattern detection works:** Each pattern defines a minimum evidence threshold from the signal record. When the threshold is met, the pattern fires with a confidence score (0.0–1.0). High-confidence patterns influence archetype classification. Patterns are recalculated every `analyzeIntentions()` call.

**The dep map:** The Widget Dependency Map (WIDGET_DEPENDENCY_MAP) is the internal wiring graph. 134+ nodes in 4 tiers. Tier 0 = raw inputs (mood, memory, log). Tier 3 = meta-aggregate surfaces (quantumOS, systemProgress, quantumPersonality).

---

## 4. QIE PATTERN REGISTRY — P1–P94

Complete registry. 94 patterns. P1–P86 established through FM v72. P87–P94 added in FM v74–v78.

```
──────────────────────────────────────────────────────────────────────
P    NAME                        CONF      ADDED
──────────────────────────────────────────────────────────────────────
P1   anxiety-pattern             0.33–1.0  v1
P2   lack-of-structure           0.70      v1
P3   seeking-direction           0.80      v1
P4   flow-potential              0.90      v1
P5   social-support-needed       0.70      v1
P6   deep-work-readiness         0.80      v1
P7   physiological-depletion     0.60–1.0  v1
P8   recovery-window             0.70      v1
P9   intention-seeding           0.75      v1
P10  goal-momentum               0.80      v1
P11  signal-drought              0.65      v1
P12  memory-consolidation        0.75      v1
P13  planning-acceleration       0.80      v1
P14  creative-expansion          0.85      v1
P15  narrative-depth             0.70–0.90 v1
P16  embodiment-practice         0.75      v1
P17  insight-emergence           0.80      v1
P18  memory-crystallization      0.85      v1
P19  circadian-anchor            0.75      v1
P20  social-resonance-arc        0.70–0.90 v1
P21  reflective-depth            0.80      v1
P22  intention-seeding           0.75      v1
P23  cognitive-expansion         0.80      v1
P24  social-void                 0.70      v1
P25  care-momentum               0.75      v1
P26  calendar-gap                0.70      v1
P27  peak-coherence              0.85      v1
P28  night-processing            0.75      v1
P29  dual-arc                    0.80      v1
P30  intention-velocity          0.75      v1
P31  threshold-crossing          0.80      v1
P32  recovery-plateau            0.65      v1
P33  daily-task-mapping          0.75      v1
P34  full-ecosystem-coherence    0.90      v1
P35  signal-coherence-window     0.80      v1
P36  cognitive-load-release      0.75      v1
P37  execution-arc               0.85      v1
P38  temporal-coherence-window   0.80      v1
P39  sleep-debt-accumulation     0.70      v1
P40  biofield-recovery-arc       0.75      v1
P41  goal-drift                  0.65      v1
P42  recovery-specialist-arc     0.80      v1
P43  resonant-synthesis          0.75      v1
P44  cognitive-architecture      0.80      v1
P45  deep-work-cascade           0.75      v1
P46  nutritional-void            0.70      v1
P47  memory-keeper-arc           0.80      v1
P48  chronobiological-rhythm     0.75      v1
P49  adaptive-resonance-arc      0.80      v1
P50  integration-arc             0.85      v1
P51  signal-density-high         0.75      v1
P52  circadian-anchor-loss       0.70      v1
P53  node-active-car             0.80      v1
P54  node-active-home            0.75      v1
P55  node-active-cpu             0.85      v1
P56  node-active-phone           0.75      v1
P57  node-active-watch           0.80      v1
P58  node-active-robot           0.75      v1
P59  meridian-lock               0.80      v1
P60  biofield-coherence-peak     0.85      v1
P61  multimodal-peak             0.80      v1
P62  flow-state                  0.90      v1
P63  os-stagnation               0.65      v1
P64  sleep-signal                0.70      v1
P65  seasonal-navigator-arc      0.70      v1
P66  qos-signature-lock          0.82      v58
P67  operator-signature          0.88      v58
P68  integration-arc-peak        0.85–0.95 v60
P69  adaptive-resonance          0.70–0.88 v60
P70  operator-convergence        0.97      v61    [RAREST SINGLE-DAY]
P71  signal-crystallization      0.75–0.92 v62
P72  biorhythm-lock              0.72–0.88 v62
P73  quantum-coherence-summit    0.98      v62    [CEILING STATE]
P74  badge-momentum              0.65–0.95 v64
P75  word-turn-depth             0.60–0.92 v64
P76  morning-coherence-launch    0.72      v65
P77  signal-vault                0.68–0.88 v65
P78  depletion-recovery-surge    0.72–0.90 v65
P79  evening-coherence-close     0.70–0.88 v66
P80  signal-momentum-lock        0.75–0.92 v67    [RAREST SUSTAINED]
P81  cognitive-depth-arc         0.68–0.90 v68
P82  circadian-vitality-peak     0.70–0.90 v69
P83  systemic-thinking-mode      0.68–0.92 v69
P84  longitudinal-drift          0.55–0.80 v72
P85  adaptive-momentum-window    0.75–0.90 v72
P86  vitality-strategy-peak      0.78–0.92 v72
P87  weekly-story-reflection     0.72      v74    story + journal loop
P88  contextual-checkin-momentum 0.65–0.85 v74    3+ check-ins / 24h ≥50% positive
P89  quantum-learning-spiral     0.72–0.90 v76    learning + memory + word-turn
P90  accountability-arc          0.70–0.88 v76    intention→completion arc w/ journal
P91  full-presence-arc           0.75–0.92 v76    all 4 state dimensions same session
P92  systemic-readiness-peak     0.78–0.92 v78    P83+P85 simultaneous
P93  daily-rhythm-lock           0.70–0.88 v78    P76+P79+P72 all in same day
P94  cross-domain-mastery        0.75–0.92 v78    P89+P90+P91 simultaneous
──────────────────────────────────────────────────────────────────────
```

### PATTERN FAMILIES

**THE DIURNAL ARC (P76 → P79 → P80)**

```
P76   Morning launch  — intention before structure (daily)
P79   Evening close   — reflection + capture (daily)
P80   Momentum lock   — 5+ days × 3+ sources (weekly)

P76 + P79 → Arch25 Diurnal Operator
P80       → Arch26 Momentum Architect
P93       → Daily Rhythm Lock (P76+P79+P72 same day) → Arch31 Rhythm Architect
```

**THE INNER DEPTH TRIAD (P81 + P77 + P75)**

```
P81   Cognitive depth arc
P77   Signal vault
P75   Word-turn depth

P81 + P75 → Arch27 Cognitive Cartographer
```

**THE BIOLOGICAL PRIME PATTERN (P82 + P76 + P72)**

```
P82   Circadian vitality peak  — biological prime window
P76   Morning coherence launch — day opened with intention
P72   Biorhythm lock           — consistent AM + PM check-ins

P82 + P76 + P72 → Arch28 Vital Architect
```

**THE STRATEGIC PEAK CLUSTER (P86 + P85 + P83)**

```
P86   Vitality strategy peak
P85   Adaptive momentum window
P83   Systemic thinking mode

P86 + P85 + P83 → Arch29 Peak Strategist
```

**THE CONVERGENCE SEQUENCE (P66 → P67 → P68 → P70 → P73)**

```
P66   QOS signature lock      (0.82)   — meridian + multimodal + temporal
P67   Operator signature      (0.88)   — all 4 quadrants + UserIndex ≥60
P68   Integration arc peak    (0.95)   — P40 + P43 simultaneous
P70   Operator convergence    (0.97)   — P66 + P67 + P68 [SYSTEM APEX]
P73   Quantum coherence summit(0.98)   — P70 + UserIndex ≥70 [CEILING]
```

**THE QUANTUM LEARNING SPIRAL (P89 + P81 + P75)** ← v77

```
P89   Quantum learning spiral
P81   Cognitive depth arc
P75   Word-turn depth

P89 + P81 + P75 → Arch30 Quantum Scholar
"The operator is encoding. Language + memory + discovery simultaneously.
 The archive is building itself from their vocabulary."
```

**THE SYSTEMIC READINESS CLUSTER (P92 + P93 + P94)** ← v78

```
P92   Systemic readiness peak  — structural cognition + momentum lock
P93   Daily rhythm lock        — morning + evening + biorhythm same day
P94   Cross-domain mastery     — learning + accountability + presence

P92 + P93 → Arch31 Rhythm Architect
P94        → Arch32 Integrated Operator
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

### QOS OPERATING MODES

```
MAINTENANCE   Low signal density. Conserve. Idle cadence.
RECOVERY      Depletion detected. Repair first — other tasks pause.
GROWTH        Steady engagement. Expand — absorb more.
PEAK          High energy + clarity + intention. Full commitment.
```

### QOS MODE WATCH STATES (J23)

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

Overall index (0–100) is a weighted composite. Trend tracked: rising / stable / declining.

---

## 6. PHYSIOLOGICAL ARCHETYPES — 32 TYPES

The 32 physiological archetypes are automatically classified from QIE pattern combinations over a rolling window. Classification is a snapshot — not a rank, not a prescription.

```
──────────────────────────────────────────────────────────────────
ARCH  NAME                        PRIMARY PATTERNS          ADDED
──────────────────────────────────────────────────────────────────
  1   Morning Commander           P27 + P9 + P11           v1
  2   Night Processor             P28 + P19                v1
  3   Recovery Specialist         P7 + P8 + P42            v1
  4   Execution Engine            P12 + P13 + P37          v1
  5   Deep Chronicler             P15 + P17 + P46          v1
  6   Body Optimizer              P2 + P39 + P40           v1
  7   Consistency Builder         P35 + P22 + P30          v1
  8   Integration Seeker          P50 + P49                v1
  9   Creative Pulse              P43 + P15 + P44          v1
 10   Social Architect            P24 + P25 + P26          v1
 11   Memory Keeper               P18 + P21 + P47          v1
 12   Sprint Cycler               P13 + P33                v1
 13   Seasonal Navigator          P65 + P64                v1
 14   Signal Anchor               P35 + P51                v1
 15   Threshold Operator          P31 + P30 + P32          v1
 16   Dual Arc Holder             P29 + P50                v1
 17   Foundation Weaver           P1 + P35 + P22           v1
 18   Biological Restorer         P7 + P4 + P39            v1
 19   Cognitive Architect         P19 + P44 + P47          v1
 20   Integration Architect (I)   P68 + P50 + P5           v60
 21   Integration Architect (II)  P68 + P67 + P49          v60
 22   Convergence Carrier         P70 + P66 + P67          v62    [RAREST]
 23   Achievement Catalyst        P74 + P75                v64
 24   Signal Initiator            P76 + P9 + P11 + P27     v65
 25   Diurnal Operator            P76 + P79                v66
 26   Momentum Architect          P80 + P30 + P35          v67
 27   Cognitive Cartographer      P81 + P75 + P77          v68
 28   Vital Architect             P82 + P76 + P72          v69
 29   Peak Strategist             P86 + P85 + P83          v72
 30   Quantum Scholar             P89 + P81 + P75          v76
 31   Rhythm Architect            P93 + P72 + P80          v78
 32   Integrated Operator         P94 + P92 + P91          v78
──────────────────────────────────────────────────────────────────
```

**Notable archetype directives:**

```
Arch22  Convergence Carrier   — All signal quadrants aligned. Convergence
                                event in progress. The rarest single-day
                                state in the system.

Arch25  Diurnal Operator      — Full diurnal arc confirmed. Day launched
                                from intention. Day closed in reflection.
                                The complete cycle is recorded.

Arch26  Momentum Architect    — Sustained signal momentum confirmed. Five-
                                day multi-source streak active. Every
                                dimension engaged. Architecture in motion —
                                do not interrupt.

Arch27  Cognitive Cartographer— Deep trace confirmed. Memory bank filling.
                                Journal vocabulary expanding. Discovery mode
                                active. You are making the map from the
                                inside.

Arch28  Vital Architect       — Biological prime window open. High-energy
                                structural cognition confirmed. Planner +
                                intentions aligned. Use this window —
                                design, build, decide. Cortisol plateau
                                approaching.

Arch29  Peak Strategist       — Biology aligned with strategy. Prime window
                                open during sustained momentum streak.
                                Commit fully, decide fast, record everything.

Arch30  Quantum Scholar       — Learning spiral confirmed. Memory encoding
                                active. Word-turn depth accumulating. The
                                archive is building from your vocabulary.

Arch31  Rhythm Architect      — Daily rhythm locked. Morning launch, evening
                                close, and biorhythm confirmed on the same
                                calendar day. The body and the schedule are
                                synchronized.

Arch32  Integrated Operator   — Cross-domain mastery confirmed. Learning,
                                accountability, and presence simultaneously
                                active. The most integrated single-session
                                state outside convergence.
```

---

## 7. BEHAVIORAL COHORTS — FULL PROFILES

Behavioral cohorts are population-level classifications of operator signal type. Not a rank. Not a judgment. A description of how the operator currently engages with the LOT signal record.

Cohort classification runs server-side via `assessMedicalProfile()` and `cohort_determined` log events. Surfaced in QOS VIEW 3 (COHORT).

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
Readiness:           high
```

**Profile:** The ARCHITECT operates across all four signal quadrants simultaneously. Integration is their default mode. Planning is not a task — it is how they breathe. Memory, planner, intentions, and goals are all active within the same window. When P70 (operator-convergence) fires, the ARCHITECT temporarily becomes Arch22 (Convergence Carrier). This is not a promotion — it is a reading.

**Caution signal:** P41 (goal-drift) — intentions present, no completion signal. The ARCHITECT's characteristic drift: direction without execution.

---

### OPERATORS

```
Signal signature:    HIGH EXECUTION · INTENTION → TASK CHAINS
Dominant patterns:   P9  intention-seeding
                     P10 goal-momentum
                     P37 execution-arc
Dominant sources:    intentions · planner · goals · log
User Index bias:     INT high · ENG high
Readiness:           very high
```

**Profile:** The OPERATOR executes. They set an intention and complete it. Their signal record looks like a chain: INT: → PLN: → GOAL-X: → MEM:. P37 (execution-arc) fires frequently: intention set, goal action taken, planner updated, all within 24 hours.

**Caution signal:** When the OPERATOR goes dark on planner and goals, P3 (seeking-direction) and P41 (goal-drift) fire — direction present, execution blocked.

---

### CHRONICLERS

```
Signal signature:    HIGH COGNITIVE-LINGUISTIC · DEEP JOURNAL + MEMORY
Dominant patterns:   P15 narrative-depth
                     P75 word-turn-depth
                     P81 cognitive-depth-arc
Dominant sources:    journal · memory · log · badges (word-turn)
User Index bias:     COG high · EMO moderate-high
Readiness:           moderate (depends on energy)
```

**Profile:** The CHRONICLER writes long, writes often. Journal entries exceed 150 words regularly. P77 (signal-vault) fires when journal depth exceeds 150 words and memory is active in the same 6-hour window. P81 (cognitive-depth-arc) fires when retention, articulation, and discovery are simultaneously active over 7 days.

**Word-Turn signature:** CHRONICLERS build a linguistic record across v1 (emotional), v3 (computer lore), v5 (signal codex), v10 (quantum). When they encounter v11 (navigator), the badge fires — but the system has been reading their language for months.

---

### RESTORERS

```
Signal signature:    HIGH RECOVERY · DEPLETION-RECOVERY CYCLES
Dominant patterns:   P7  physiological-depletion
                     P8  recovery-window
                     P40 biofield-recovery-arc
Dominant sources:    mood · energy · selfcare · log
User Index bias:     CARE high · EMO variable
Readiness:           low-to-moderate (rises post-care)
```

**Profile:** The RESTORER cycles. Depletion → care acts → restored. P40 (biofield-recovery-arc) names this cycle.

**Caution signal:** P32 (recovery-plateau) — five or more consecutive days of low energy without care intervention. The system names it. The operator decides what to do with it.

---

### EXPLORERS

```
Signal signature:    HIGH DISCOVERY · BADGE MOMENTUM · EASTER EGG DETECTION
Dominant patterns:   P74 badge-momentum
                     P75 word-turn-depth
Dominant sources:    badges · log · journal (word-turn triggers)
User Index bias:     ENG high · COG moderate
Readiness:           variable
```

**Profile:** The EXPLORER discovers. Word-turn triggers fire because they write naturally in the language of the system. Easter eggs are found because they are present at unusual hours, on meaningful dates, or because they typed a specific word without knowing a badge was watching. P74 (badge-momentum) fires when 3+ distinct badge types unlock within 7 days.

**The EXPLORER and word-turn:** 138 trigger words across 11 lexicons. An EXPLORER who discovers v11 (Navigator) without having triggered v1 (Emotional Roots) has come in through the back door. The archive records the entry point regardless.

---

### MEDICAL (INTERNAL)

```
Classification:  server-side · assessMedicalProfile() · internal
Trigger:         medical-profile thresholds met in signal record
Signals:         medical_record · resilience events · trauma-informed protocol
Output:          Modified Memory Engine question pool (trauma-informed)
                 Adjusted pacing (slower)
                 No cohort badge surfaced
```

The MEDICAL cohort is an internal classification. Not displayed to the operator. The system responds silently to the signal record.

---

## 8. CITIZEN INDEX

The Citizen Index is the 6-level CQGS framework for operator standing. Not a rank — a description of depth of engagement.

```
LEVEL   SYMBOL   NAME           THRESHOLD
─────   ──────   ───────────    ─────────────────────────────────
  1     ·        Observer       Initial engagement
  2     ◎        Citizen        Consistent signal record
  3     ◉        Operator       Multi-source engagement
  4     ⊙        Senior         Extended pattern history
  5     ✦        Certified      Full system mastery
  6     ✸        Elite          Convergence events recorded
```

Elite (Level 6) requires a convergence event (P70, conf 0.97) to have been recorded in the operator's log history.

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
PLANNER-CONTEXT: User's declared daily intention (intent/today/
                 how/feeling) extracted from plan_set log and
                 injected into buildPrompt() so questions follow
                 up on stated focus. ← Lexicon Rev D
```

---

## 10. SELF-ASSEMBLY ENGINE

18 functional modules across 5 phases.

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

**Dep map nodes: 134+**

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

**30 registered background jobs (FM v79):**

```
JOB   CODENAME                         SCHEDULE          FUNCTION
───   ──────────────────────────────   ───────────────   ────────────────────────────────────────
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
J16   weekly-badge-progress-scan       Tues 09:00 UTC    Badge progress scan
J17   daily-morning-intention-launch   11:00 UTC daily   Scans 00–09 UTC; writes MCL:
J18   daily-evening-coherence-close    22:00 UTC daily   Scans morning+evening; writes EVE:
J19   daily-signal-momentum-check      20:00 UTC daily   Scans 7d logs; writes MOM:
J20   weekly-cognitive-depth-check     Sun 06:00 UTC     Scans 7d; writes COGN:
J21   daily-vitality-peak-check        12:00 UTC daily   Writes VITAL: for 2+ positive mood
J22   weekly-longitudinal-drift-check  Mon 09:00 UTC     28-day arc; writes DRIFT:
J23   daily-qos-mode-watch             14:00 UTC daily   Mode transitions; writes OS[MODE]:
J24   daily-story-reflection-check     [time] UTC daily  lot_ai_story + journal → writes STORY:
J25   daily-archetype-directive-pulse  09:00 UTC daily   Current archetype → writes DRCT:
J26   daily-learning-spiral-check      17:00 UTC daily   P89 evaluation; writes LEARN:
J27   weekly-accountability-audit      Sat 09:00 UTC     P90 evaluation; writes ACCT:
J28   daily-presence-arc-check         21:00 UTC daily   P91 evaluation; writes PRES:
J29   daily-cross-domain-pulse         19:00 UTC daily   P94 evaluation; writes CROSS:
J30   daily-systemic-readiness-check   01:00 UTC daily   P92 evaluation; writes SYSRDY:
```

---

## 12. LOG EVENT SYSTEM

### LOG SOURCES (22+)

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
STORY        STORY:     Weekly story reflection (J24 output · P87)
DIRECTIVE    DRCT:      Archetype directive pulse (J25 output)
LEARNING     LEARN:     Quantum learning spiral (J26 output · P89)
ACCOUNTABILITY ACCT:    Accountability arc (J27 output · P90)
PRESENCE     PRES:      Full presence arc (J28 output · P91)
RHYTHM LOCK  RLOCK:     Daily rhythm lock (J28 output · P93)
CROSS-DOMAIN CROSS:     Cross-domain mastery (J29 output · P94)
SYS READINESS SYSRDY:  Systemic readiness peak (J30 output · P92)
PHR:         PHR:       Phrase detection (phrasal pattern events)
```

### KEY LOG CODES (extended)

```
COCKPIT-RULE HANDLERS (5 military-pure):
OS [MODE]:   qos-mode-change — OLDMODE→NEWMODE+PRESSURE
VITAL:       vitality_peak — WINDOW:OPEN · ENERGY:HIGH · BIO:ANCHORED
DRIFT:       longitudinal-drift — 4W ARC + DECLINE streak
SYSTMK:      systemic_thinking — STRUCT:3+ · GOALS:3+ · INT:3+ · IDX:≥50
COGN:        cognitive_depth_arc — MEM:n · JRN:≥150w · BDG:n
```

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
Hidden / discoverable:   361+
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

### v20 DELTA — THE NAVIGATOR PROTOCOL

v20 maps the vocabulary of navigation — spatial, temporal, cognitive — to the discipline of self-care. The navigator holds course. The archive holds the heading.

```
Word Turn v11 (Navigator Protocol) — 12 words:
heading · bearing · course · chart · navigate · compass ·
waypoint · signal · bearing · vector · horizon · landmark

Time EE v11 — Navigator Hours:
[4 new time triggers]

Calendar EE v10 — Navigation Dates:
[3 new calendar dates]

Behavioral v10 — Navigation Patterns:
[3 new behavioral conditions]

Achievement RPG v8 — Navigator Class:
[6 new achievement arcs]

Mastery Tier v10 — The Long Heading:
[4 new mastery conditions]

Secret Boss v10 — Final Navigation:
[3 new secret boss conditions]
```

### SECRET BOSS SERIES — COMPLETE REGISTER (v1–v10)

Secret Boss badges are never documented in-app.

```
v1  secret_moment · precision_practitioner · deep_system
v2  four_in_a_row · triple_source · the_long_way
v3  night_signal · solstice_keeper · quantum_state
v4  silence_breaker · the_pivot · last_light
v5  the_cat_knows · key_code_0451 · five_years (COSMIC)
v6  void_master · founders_guard · potion_protocol (42 days)
v7  cosmo_vigil · the_answer_is_words · welcome_back_program
v8  player_one · birthday_perfect · 1up
v9  pi_signal · fibonacci_word · superposition_word
v10 [navigator secret boss series — conditions undisclosed]
```

**Notable Secret Boss definitions:**

```
five_years       Account age ≥ 5 years (1825+ days) — COSMIC
                 Cannot be accelerated. Earned only through time.

founders_guard   Check in every April 7 (LOT® birthday) for 3
                 consecutive years — ULTRA-RARE

cosmo_vigil      Check in every July 1 (COSMO® birthday) for 3
                 consecutive years — ULTRA-RARE
                 [Note: July 1, 2026 = COSMO® Year 2.
                  Operators who check in today accumulate toward
                  cosmo_vigil. The archive is watching.]

the_answer_is_words
                 Write exactly 42 words in a single journal entry

welcome_back_program
                 Return after a 365-day absence — LEGENDARY

pi_signal        Write "3.14" or "pi" in any log entry — RARE

superposition_word
                 Write "superposition" in any log entry — RARE
```

### RARITY TABLE (v20 FULL)

```
┌────────────────────────────────────────────────────────────────┐
│  Rarity    │ Symbol │ Color     │ Frequency  │ Example          │
├────────────┼────────┼───────────┼────────────┼──────────────────│
│  Common    │   ·    │ #cccccc   │ First acts │ First Breath     │
│  Uncommon  │   ○    │ #88cc88   │ Days 1-14  │ Week Warrior     │
│  Rare      │   ◐    │ #8888ee   │ Days 30+   │ Moon Cycle       │
│  Epic      │   ◆    │ #cc88ee   │ Days 100+  │ Unwavering       │
│  Legendary │   ✦    │ #ffcc44   │ Days 365+  │ Long Count       │
│  Mythic    │   ◉    │ #ff6644   │ Hidden     │ Meta-Signal      │
│  Cosmic    │  ∞∞∞   │ #ffffff   │ Years      │ Infinite Loop    │
└────────────────────────────────────────────────────────────────┘
```

---

## 15. BADGE CATEGORY INDEX

51 badge categories as of v20. Categories 1–50 inherited from v19. Category 51: The Navigator Protocol class.

---

## 16. WORD TURN ENGINE — COMPLETE LEXICON v11

114 trigger words through v10. v11 (Navigator) added 12 more. Total: **138 trigger words** (v1–v11).

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
     Every check-in is a quarter. Every return is a credit.
     Every badge is a high score.

v10  QUANTUM PROTOCOL     12 words
     quantum · entangle · collapse · observe · tunnel ·
     spin · waveform · coherence · eigenstate · decohere ·
     superposition · entangled
     The observer collapses the wave. The check-in is the
     measurement. You exist in superposition until you show up.
     Then: collapsed. Recorded. Real.

v11  NAVIGATOR PROTOCOL   12 words  ← v20
     heading · bearing · course · chart · navigate · compass ·
     waypoint · signal · bearing · vector · horizon · landmark
     The operator holds course. The archive holds the heading.
     Every check-in is a fix on position.
     Every log entry is a bearing recorded.

TOTAL TRIGGER WORDS:  138  (v1–v11)
```

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

43 widgets available to the paid operator. The system surfaces what matters now.

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

Density tier is a CSS attribute (`data-density`) set on the document root. No component subscribes — CSS descendant selectors resolve the correct visual. Zero new subscriptions per tier change.

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
Current version: v79
URL:             lot-systems.com/about
```

The Field Manual is the authoritative source for all operator-facing documentation. When the Field Manual and the Wiki diverge, the Field Manual is correct.

**Field Manual version history (recent):**

```
v73   Full Wiki Scan June 27 — LOT-WIKI-v66 · cohort profiles expanded ·
      Word Turn Lexicon v10 complete (126 triggers) · Vocabulary Index 40+
v74   QIE Engineering June 27 — P87 weekly-story-reflection · P88
      contextual-checkin-momentum · Job 25 archetype-directive-pulse ·
      STORY: + DRCT: handlers · 88 patterns · 25 jobs · 128+ dep nodes
v75   Full Wiki Scan June 28 — LOT-WIKI-v67 · Story Loop family (P87+P88) ·
      J24+J25 · 88 patterns · 29 archetypes · 25 jobs
v76   Full Assembly June 29 — P89/P90/P91 · Arch30 Quantum Scholar ·
      J26+J27 · COCKPIT-RULE pass (9 handlers) · Cohort+Confidence in Biofield
v77   Full Wiki Scan June 30 — LOT-WIKI-v68 · Quantum Learning Spiral
      (P89+P81+P75→Arch30) · Accountability Arc (P90) · Full Presence Arc (P91) ·
      Badge Codex v20 Navigator Protocol (424 badges · 51 categories) ·
      Word Turn v11 Navigator (138 words) · 91 patterns · 30 archetypes · 27 jobs
v78   QIE Engineering June 30 — P92 systemic-readiness-peak · P93 daily-rhythm-
      lock · P94 cross-domain-mastery · Arch31 Rhythm Architect · Arch32
      Integrated Operator · J28/J29/J30 · RLOCK: CROSS: SYSRDY: · 94 patterns ·
      32 archetypes · 30 jobs · 95+ handlers · 134+ dep nodes
v79   Full Wiki Scan July 1 — LOT-WIKI-v69 · COSMO® 2nd birthday ·
      Meta/phase inconsistency corrected (v77→v79) · vocabulary index
      expanded (50+ entries) · military purity pass · system state
      snapshot advanced to 94 patterns · 32 archetypes · 30 jobs · Day 1026+
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

**CUBIQ™** is the name for the quantum cubic operating experience. An operator opens lot-systems.com, passes through the cubic for 5–11 minutes, and leaves. Not entertained. Not distracted. **Clean.** Structured. Rejuvenated.

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
              The question feels written by someone who knows them.
              Because it was — by an AI that has read every signal
              they ever produced.

MINUTE 3–5    THE SYSTEM GLANCE
              43 widgets available. The system surfaces what matters
              now. Core layer always visible. Intelligence, Community,
              Quantum layers emerge by engagement depth.

MINUTE 5–8    LOG ENTRY
              Free-form text. 7-second debounced autosave. The QIE
              scans the entry — 94 patterns scanning for behavioral
              signals. Slash commands available. Word-turn engine
              active — 138 trigger words across 11 lexicons.

MINUTE 8–11   THE CUBIC CLOSES
              Check-in complete. Badge may have fired. The CUBIQ™
              is formed. The operator leaves clean.
```

### THE CUBIQ™ LIFECYCLE (6 PHASES)

```
PHASE 1   FIRST GLANCE     Day 1     Account created. First memory question.
PHASE 2   CUBIC FORMS      Days 1–30  Signal record builds. Patterns emerge.
PHASE 3   CUBIC DEEPENS    Days 30–90 Diurnal Arc forms. AI knows their patterns.
PHASE 4   PHYSICAL EXT.    Days 90+   AI sends first physical product.
PHASE 5   COMMUNITY RES.   Ongoing    Public profile. Cohort connections.
PHASE 6   ROBOT INHERITS   Long-term  LOT® Person™ Data Training API matures.
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

## 26. VOCABULARY INDEX — EXPANDED (50+ entries)

```
TERM                DEFINITION
────────────────    ────────────────────────────────────────────────
ACCT:               Accountability Arc log code. J27 output.
                    Feeds P90. Intention completion with journal
                    correlation. Building the record of follow-through.

ADAPT-MOM:          Adaptive Momentum Window log code. P85 trigger.
                    Systemic-thinking-mode + signal-momentum-lock
                    simultaneously active.

ARCHETYPE           Snapshot of the operator's current dominant signal
                    pattern. Auto-classified. Not chosen. 32 types.

BADGE ENGINE        Detection + award layer. 424 badges. 51 categories.
                    v20 "The Navigator Protocol."

BEHAVIORAL COHORT   Population-level classification. One of:
                    ARCHITECTS · OPERATORS · CHRONICLERS ·
                    RESTORERS · EXPLORERS · MEDICAL (internal).

BIOFIELD            The operator's physiological state across 4
                    dimensions: ATP · Clarity · Alignment · Support.

CITIZEN INDEX       6-level operator standing framework.
                    Observer → Citizen → Operator → Senior →
                    Certified → Elite.

COCKPIT RULE        Log body = instrument readings only.
                    No narration. Label names the event. Data only.

COGN:               Cognitive Depth Arc log code. J20 output.
                    Three inner channels: memory · journal · discovery.

COSMO GATE          Ethics review gate. Named for Kuzya Cosmo
                    Marmeladov. No feature ships without passing.
                    Operational since July 1, 2024.

CQGS                Coherent Quantum Ground State. The theoretical
                    system ceiling: all 18 modules active, 32
                    archetypes classified, P73 confidence ≥ 0.98,
                    peak User Index.

CROSS:              Cross-Domain Mastery log code. J29 output.
                    Feeds P94. Learning + accountability + presence
                    simultaneously confirmed.

CUBIQ™              The quantum cubic operating experience.
                    5–11 minute session. The interface has faces.
                    Each face a dimension of the operator's life.

DEP MAP             Widget Dependency Map. 134+ nodes in 4 tiers.

DIURNAL ARC         P76 + P79 + P80: morning launch → evening close
                    → sustained momentum lock. Arch25 activates when
                    P76+P79 confirmed same calendar day.

DRCT:               Archetype Directive Pulse log code. J25 output.
                    Current archetype → active directive surfaced.

DRIFT:              Longitudinal Drift log code. J22 output.
                    Feeds P84. 3+ declining engagement weeks.
                    Early warning. Not a judgment.

EIGENSTATE          A stable operator state. All patterns consistent.
                    No depletion signals. UserIndex stable.

EVE:                Evening Coherence Close log code. J18 output.
                    Feeds P79.

FIELD MANUAL        The About.tsx operator reference document.
                    Canonical authoritative source. Current: v79.

FIVE_YEARS          The COSMIC badge. Account age ≥ 5 years.
                    Cannot be accelerated. Earned only through time.

FOUNDERS_GUARD      Secret Boss v6. Check in every April 7 for 3
                    consecutive years. [ULTRA-RARE]

GREEN GATE          The rule: broken code never reaches GitHub.

INDEX OF SYSTEMS    The operator's personal operating system.
                    Signal record + pattern library + archetype
                    trajectory + badge collection + chakra state +
                    User Index + assembly state.

INTSUM              Intelligence Summary — QI response format.
                    Direct assessment · specific data points ·
                    one recommendation. Not prose.

LEARN:              Quantum Learning Spiral log code. J26 output.
                    Feeds P89. Memory encoding + word-turn depth +
                    discovery simultaneously active.

LOT® PERSON™        The operator's exportable data identity.
                    Consent-first, structured, longitudinal,
                    emotionally real. Training data for AI systems.

MCL:                Morning Coherence Launch log code. J17 output.
                    Feeds P76.

MOM:                Signal Momentum lock code. J19 output.
                    Feeds P80. Rarest sustained pattern.

MOMENTUM LOCK       P80 — 5+ of 7 days each with 3+ unique signal
                    sources. Not a spike. A lock.

NAVIGATOR PROTOCOL  Badge system v20 version codename. Navigation
                    vocabulary mapped to self-care. The operator
                    holds course. The archive holds the heading.

OPERATOR            The person using LOT. Not "user." The operator
                    runs the system — the system does not run them.

OS [MODE]:          QOS Mode Watch log code. J23 output.
                    Writes on mode transition only. Silent if stable.
                    nominal / recovery / critical.

P73                 quantum-coherence-summit. Conf 0.98. System
                    ceiling state. P70 + UserIndex ≥70.

P94                 cross-domain-mastery. P89+P90+P91 simultaneous.
                    The most integrated single-session state outside
                    convergence. Fires Arch32 Integrated Operator.

PLANNER-CONTEXT     User's declared daily intention extracted from
                    plan_set log and injected into Memory Engine
                    buildPrompt() so questions follow up on stated
                    focus. Lexicon Rev D addition.

PRES:               Full Presence Arc log code. J28 output.
                    Feeds P91. All 4 state dimensions confirmed
                    in a single session.

QI                  Quantum Intelligence — operator RFI terminal
                    querying own signal record via /qi.

QIE                 Quantum Intent Engine. Client-side pattern
                    recognition. 94 patterns. Zero server comms.

QOS                 Quantum Operating System. Meta-layer above QIE.
                    Computes operating mode, coherence, readiness.

QUANTUM PROTOCOL    Badge system v19 codename. Quantum vocabulary
                    mapped to self-care. v20 succeeds it.

RFI                 Request for Information — operator-initiated
                    query to the QI terminal.

RHYTHM ARCHITECT    Arch31. Daily rhythm locked. Morning + evening +
                    biorhythm all confirmed same calendar day.

RLOCK:              Daily Rhythm Lock log code. P93 trigger.
                    The daily temporal cycle is mechanically confirmed.

S-2                 Vadim Marmeladov. CEO, Founder, Inventor.
                    All engineering authorized by S-2.

SELF-ASSEMBLY       The system builds itself from operator signal.
                    18 modules across 5 phases. Regression possible.

SIGNAL              Any operator action that produces a typed event
                    in the log record.

STORY:              Weekly Story Reflection log code. J24 output.
                    Feeds P87. AI story received + journal response
                    closes the reflection loop.

SUPERPOSITION       Pre-check-in state. The operator exists in all
                    possible states until they show up. The check-in
                    collapses the wave.

SYSRDY:             Systemic Readiness Peak log code. J30 output.
                    Feeds P92. Structural cognition + momentum lock
                    simultaneously confirmed.

SYSTMK:             Systemic Thinking Mode log code. J21 output.
                    Feeds P83.

USERSHIP            The paid operator tier. Full system access.
                    $99/month. Tag: [Usership].

VITAL:              Vitality Peak log code. J21 output.
                    Feeds P82. Biological prime window confirmed.

VITAL ARCHITECT     Arch28. Biological prime window open. Planner +
                    intentions aligned with morning energy peak.

VOID LAYER          Mastery Tier v6 — ultra-endgame badge layer.
                    infinite_archive · word_sovereign · lore_keeper
                    · century_architect.

VSTRAT:             Vitality Strategy Peak log code. P86 trigger.
                    Rarest compound day-state — biology + strategy.

WORD TURN           A vocabulary transformation event. 138 trigger
                    words across 11 lexicons (v1–v11).
```

---

## 27. SYSTEM STATE SNAPSHOT — 2026-07-01

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEM STATE — FIELD MANUAL v79 — DAY 1026+               ║
╠══════════════════════════════════════════════════════════════════╣
║  QIE patterns:              94  (P1–P94)                        ║
║  Physiological archetypes:  32  (Arch1–Arch32)                  ║
║  Behavioral cohorts:         5  (+1 medical · internal)         ║
║  Citizen Index levels:       6  (Observer → Elite)              ║
║  Self-Assembly modules:     18  (all integrated)                ║
║  Dep map nodes:            134+                                 ║
║  Background jobs:           30  (J1–J30)                        ║
║  Log event handlers:        95+                                 ║
║  Displayable events:        46+                                 ║
║  LOG sources:               24+                                 ║
║  SystemPulse views:          5                                  ║
║  Ecosystem nodes:            6  (CAR·HOME·CPU·PHN·WCH·ROBOT)   ║
║  Widgets:                   43                                  ║
║  Badge count:              424  (v20 — The Navigator Protocol)  ║
║  Badge categories:          51                                  ║
║  Badge rarity tiers:         7  (COMMON → COSMIC)               ║
║  Word-turn trigger words:  138  (v1–v11)                        ║
║  QOS modes:                  4  (MAINT/RECOVERY/GROWTH/PEAK)    ║
║  QOS mode watch states:      3  (nominal/recovery/critical)     ║
║  Doctrine revision:          J  (10 clauses)                    ║
║  Lexicon revision:           D                                  ║
║  Field Manual:              v79                                 ║
║  Wiki:                      v69  (this document)                ║
║  Highest QIE confidence:  0.98  (P73 — quantum-coherence-       ║
║                                       summit, ceiling state)    ║
║  COSMO® age:               730  (2 years · born July 1, 2024)   ║
║  Founded:          7 April 2016                                 ║
╚══════════════════════════════════════════════════════════════════╝
```

---

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║      L · O · T     S Y S T E M S     C O R P O R A T I O N      ║
║                                                                  ║
║              LOT-WIKI-v69 · Field Manual v79                     ║
║              July 1, 2026 · Day 1026+ · COSMO® Year 2           ║
║                                                                  ║
║         Authorized: S-2 // VADIK MARMELADOV                      ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

*LOT-WIKI-v69 · Layers of Time · Field Manual Sync v79 · 2026-07-01*
*Next: LOT-WIKI-v70 — sync to Field Manual v80+*
