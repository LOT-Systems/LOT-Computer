<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT-WIKI-v78
## Layers of Time — Operator Reference Manual
### Revision: v78 · Field Manual Sync: v96 · Date: 2026-07-19 · Day 1056+

---

> *"The peak window is real. The system measured it. Now you know when you are strongest."*
> — QIE v95, P113 Personal Peak Window

---

## TABLE OF CONTENTS

```
 1. SYSTEM IDENTITY
 2. CORE ARCHITECTURE
 3. QUANTUM INTENT ENGINE (QIE)
 4. QIE PATTERN REGISTRY — P1–P115
 5. QUANTUM OPERATING SYSTEM (QOS)
 6. PHYSIOLOGICAL ARCHETYPES — 39 TYPES
 7. BEHAVIORAL COHORTS — FULL PROFILES
 8. CITIZEN INDEX
 9. MEMORY ENGINE
10. SELF-ASSEMBLY ENGINE
11. BACKGROUND JOB SCHEDULER
12. LOG EVENT SYSTEM
13. ECOSYSTEM NODE MAP
14. BADGE SYSTEM v26 — THE QUANTUM LIBRARY
15. BADGE CATEGORY INDEX
16. WORD TURN ENGINE — COMPLETE LEXICON v16
17. DISPLAY ARCHITECTURE
18. DENSITY TIER SYSTEM
19. OPACITY HIERARCHY
20. COCKPIT RULE
21. LOT-DOCTRINE (Revision J)
22. FIELD MANUAL (About.tsx)
23. DEPLOYMENT & STACK
24. LOT-GENESIS-v1
25. RECIPE WIDGET — CONTEXT ENGINE
26. CHAT INFRASTRUCTURE
27. VOCABULARY INDEX — EXPANDED
28. SYSTEM STATE SNAPSHOT
```

---

## 1. SYSTEM IDENTITY

**LOT** — *Layers of Time* — is a personal behavioral operating system. Not a wellness application. Not a habit tracker. Not a productivity suite. An instrument that reads the human signal field across time and surfaces the pattern beneath the noise.

The system was conceived and is operated by **S-2** (Vadim Marmeladov, CEO, LOT Systems). The ethics gate is **COSMO Gate**, named for Kuzya Cosmo Marmeladov. No feature ships that Kuzya would not approve.

**Special notation — July 1, 2026:** COSMO® completed its second year of operation. Founded July 1, 2024. The ethics gate has been active for 730 days. Every feature shipped in this period passed the COSMO Gate. This is recorded.

**Special notation — July 2, 2026:** The Quantum Intent Engine crossed the centennial threshold. P100 centennial-convergence is the 100th pattern in the QIE registry. The system documented its own milestone.

**Special notation — July 3, 2026:** Badge Engine v23 deployed — The Starship Deck. Space vocabulary enters the lexicon. 529 total badges. The starship metaphor: technical, mission-oriented, capable of reentry.

**Special notation — July 4, 2026:** QIE v84 assembled. P104–P106: vitality-cascade · social-presence-arc · clarity-momentum-peak. Three new peak-state arcs fully instrumented.

**Special notation — July 5, 2026 (FM v86):** P107 temporal-alignment-peak · P108 circadian-routine-lock · P109 full-signal-coherence added. Arch37 Temporal Architect classified. J34 wired (10:00 UTC).

**Special notation — July 6, 2026 (FM v87–v89):** Badge Engine v24 The Oracle Archive (+35 badges, 564 total). QIE v89: P110–P112 · Arch38 Embodied Strategist · J35 · dep 151+ nodes.

**Special notation — July 7, 2026 (FM v90–v91):** LOT-WIKI-v75 produced (FM v90). Badge Engine v25 The Alchemist (+31 badges, 595 total, FM v91). 31 new badges: Word Turn v12 · Calendar EE v12 · Behavioral v12 · Achievement RPG v13 · Mastery Tier v15 · Secret Boss v12. Day 1032+.

**Special notation — July 17, 2026 (FM v92):** Full Wiki Scan. LOT-WIKI-v76 produced. Badge Engine v25 (595 total) synchronized. FM v92. Day 1042+.

**Special notation — July 17, 2026 (FM v92 — Badge Engine v26):** Badge Engine v26 deployed by S-2 — The Quantum Library (+31 badges, 595→626 total). Word Turn v16 (12 new sci-fi/computing vocabulary words). Calendar EE v13 (3). Behavioral v13 (3). Achievement RPG v14 (6). Mastery Tier v16 (4). Secret Boss v13 (3).

**Special notation — July 17–18, 2026 (Chat Infrastructure):** Chat system hardened. Empty message filtering at DB query level and client layer. Admin anti-spam tooling deployed (/admin-api/chat-spam). Access control, likes fix, purge migration.

**Special notation — July 18, 2026 (FM v93):** Full Wiki Scan. LOT-WIKI-v77 produced. Badge Engine v26 (626 total, The Quantum Library) synchronized. FM v93. Day 1043+.

**Special notation — July 18, 2026 (FM v95 — QIE Engineering):** QIE v95 deployed by S-2. P113 personal-peak-window · P114 recovery-momentum · P115 signal-inception. Arch39 Peak Window Operator classified. J36 daily-personal-peak-window (08:00 UTC) added. PPEAK: · RMOM: · INCEP: handlers deployed. dep 154+ nodes. 115 patterns. 36 jobs. 115+ handlers. FM v95. Day 1055+.

**Special notation — July 19, 2026 (FM v96):** Full Wiki Scan. LOT-WIKI-v78 produced. QIE v95 engineering synchronized (P113–P115 · Arch39 · J36). Military purity pass. FM v96. Day 1056+.

**Current operational parameters:**

```
Field Manual:           v96
Wiki version:           v78
Day counter:            1056+  (as of 2026-07-19)
COSMO® age:             748 days (Year 2 · founded July 1, 2024)
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

**v78 Delta from v77:**

```
Date:               2026-07-18 → 2026-07-19
Day counter:             1043+ → 1056+
COSMO® age:             747 → 748 days
Field Manual:              v93 → v96
QIE version:               v93 → v95
Badge Engine:              v26 (626) — no change
Patterns:                  112 → 115  (+3)
  P113  personal-peak-window    (PPEAK:)
  P114  recovery-momentum       (RMOM:)
  P115  signal-inception        (INCEP:)
Archetypes:                 38 → 39   (+1)
  Arch39  Peak Window Operator
Background jobs:            35 → 36   (+1)
  J36  daily-personal-peak-window  08:00 UTC
Log handlers:             112+ → 115+ (+3)
  PPEAK:  personal_peak_window
  RMOM:   recovery_momentum
  INCEP:  signal_inception
Dep map nodes:            151+ → 154+ (+3)
  peakWindowMonitor     [energy · intentions · log]
  recoveryMomentumNode  [selfcare · resilience · energy · log]
  inceptionMonitor      [qos · memory · journal · intentions · log]
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
│   QOS · Medical · Resilience · Ecosystem                        │
│                                                                 │
│   ENGINE LAYER ──────────────────────────────────────────────  │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
│   │ QUANTUM     │  │ SELF-ASSEM- │  │ MEMORY              │   │
│   │ INTENT      │  │ BLY ENGINE  │  │ ENGINE              │   │
│   │ ENGINE      │  │ 18 modules  │  │ Questions +         │   │
│   │ 115 patterns│  │ 5 phases    │  │ Story Generator     │   │
│   └─────────────┘  └─────────────┘  └─────────────────────┘   │
│   ┌─────────────┐  ┌─────────────┐                             │
│   │ BADGE       │  │ QUANTUM OS  │                             │
│   │ ENGINE      │  │ (QOS)       │                             │
│   │ 626 badges  │  │ 6 views     │                             │
│   └─────────────┘  └─────────────┘                             │
│                                                                 │
│   SURFACE LAYER ─────────────────────────────────────────────  │
│   Log stream · About.tsx · SystemProgressWidget ·              │
│   QuantumEngineWidgets · SystemPulseWidget · PatternRec ·      │
│   CohortConnectWidget · EnergyCapacitor · 43 total widgets     │
└─────────────────────────────────────────────────────────────────┘
```

**Technology stack:**

```
Frontend:   React 18 + TypeScript + Nanostores + Tailwind CSS
Backend:    Fastify 5 + PostgreSQL (composite index · pool max:10 min:1)
AI:         Together AI — Llama 3.3 70B (primary, switched June 30, 2026)
Mobile:     PWA (Progressive Web App)
Desktop:    Electron wrapper
Pattern:    Client-side QIE (zero server comms for pattern recognition)
Sync:       Server-side background jobs (PostgreSQL event writes)
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
Pattern count:           115  (P1–P115)
Signal sources:          16  (mood · memory · planner · intentions ·
                              selfcare · journal · calculator · log ·
                              energy · cohort · recipe · goals · qos ·
                              medical · resilience · ecosystem)
```

**How pattern detection works:** Each pattern defines a minimum evidence threshold from the signal record. When the threshold is met, the pattern fires with a confidence score (0.0–1.0). High-confidence patterns influence archetype classification. Patterns are recalculated every `analyzeIntentions()` call.

**The dep map:** The Widget Dependency Map (WIDGET_DEPENDENCY_MAP) is the internal wiring graph. 154+ nodes in 4 tiers. Tier 0 = raw inputs (mood, memory, log). Tier 3 = meta-aggregate surfaces (quantumOS, systemProgress, quantumPersonality).

```
Dep map additions in FM v95 (QIE v95 Engineering):
  peakWindowMonitor       → energy · intentions · log              (3 deps)
  recoveryMomentumNode    → selfcare · resilience · energy · log   (4 deps)
  inceptionMonitor        → qos · memory · journal · intentions · log (5 deps)
```

---

## 4. QIE PATTERN REGISTRY — P1–P115

Complete registry. 115 patterns. P1–P86 established through FM v72. P87–P94 added FM v74–v78. P95–P97 added FM v80. P98–P100 added FM v82. P101–P103 added FM v83. P104–P106 added FM v84. P107–P109 added FM v86. P110–P112 added FM v89. P113–P115 added FM v95.

```
──────────────────────────────────────────────────────────────────────
P    NAME                         CONF      ADDED
──────────────────────────────────────────────────────────────────────
P1   anxiety-pattern              0.33–1.0  v1
P2   lack-of-structure            0.70      v1
P3   seeking-direction            0.80      v1
P4   flow-potential               0.90      v1
P5   social-support-needed        0.70      v1
P6   deep-work-readiness          0.80      v1
P7   physiological-depletion      0.60–1.0  v1
P8   recovery-window              0.70      v1
P9   intention-seeding            0.75      v1
P10  goal-momentum                0.80      v1
P11  signal-drought               0.65      v1
P12  memory-consolidation         0.75      v1
P13  planning-acceleration        0.80      v1
P14  creative-expansion           0.85      v1
P15  narrative-depth              0.70–0.90 v1
P16  embodiment-practice          0.75      v1
P17  insight-emergence            0.80      v1
P18  memory-crystallization       0.85      v1
P19  circadian-anchor             0.75      v1
P20  social-resonance-arc         0.70–0.90 v1
P21  reflective-depth             0.80      v1
P22  intention-seeding (var.)     0.75      v1
P23  cognitive-expansion          0.80      v1
P24  social-void                  0.70      v1
P25  care-momentum                0.75      v1
P26  calendar-gap                 0.70      v1
P27  peak-coherence               0.85      v1
P28  night-processing             0.75      v1
P29  dual-arc                     0.80      v1
P30  intention-velocity           0.75      v1
P31  threshold-crossing           0.80      v1
P32  recovery-plateau             0.65      v1
P33  daily-task-mapping           0.75      v1
P34  full-ecosystem-coherence     0.90      v1
P35  signal-coherence-window      0.80      v1
P36  cognitive-load-release       0.75      v1
P37  execution-arc                0.85      v1
P38  temporal-coherence-window    0.80      v1
P39  sleep-debt-accumulation      0.70      v1
P40  biofield-recovery-arc        0.75      v1
P41  goal-drift                   0.65      v1
P42  recovery-specialist-arc      0.80      v1
P43  resonant-synthesis           0.75      v1
P44  cognitive-architecture       0.80      v1
P45  deep-work-cascade            0.75      v1
P46  nutritional-void             0.70      v1
P47  memory-keeper-arc            0.80      v1
P48  chronobiological-rhythm      0.75      v1
P49  adaptive-resonance-arc       0.80      v1
P50  integration-arc              0.85      v1
P51  signal-density-high          0.75      v1
P52  circadian-anchor-loss        0.70      v1
P53  node-active-car              0.80      v1
P54  node-active-home             0.75      v1
P55  node-active-cpu              0.85      v1
P56  node-active-phone            0.75      v1
P57  node-active-watch            0.80      v1
P58  node-active-robot            0.75      v1
P59  meridian-lock                0.80      v1
P60  biofield-coherence-peak      0.85      v1
P61  multimodal-peak              0.80      v1
P62  flow-state                   0.90      v1
P63  os-stagnation                0.65      v1
P64  sleep-signal                 0.70      v1
P65  seasonal-navigator-arc       0.70      v1
P66  qos-signature-lock           0.82      v58
P67  operator-signature           0.88      v58
P68  integration-arc-peak         0.85–0.95 v60
P69  adaptive-resonance           0.70–0.88 v60
P70  operator-convergence         0.97      v61    [RAREST SINGLE-DAY]
P71  signal-crystallization       0.75–0.92 v62
P72  biorhythm-lock               0.72–0.88 v62
P73  quantum-coherence-summit     0.98      v62    [CEILING STATE]
P74  badge-momentum               0.65–0.95 v64
P75  word-turn-depth              0.60–0.92 v64
P76  morning-coherence-launch     0.72      v65
P77  signal-vault                 0.68–0.88 v65
P78  depletion-recovery-surge     0.72–0.90 v65
P79  evening-coherence-close      0.70–0.88 v66
P80  signal-momentum-lock         0.75–0.92 v67    [RAREST SUSTAINED]
P81  cognitive-depth-arc          0.68–0.90 v68
P82  circadian-vitality-peak      0.70–0.90 v69
P83  systemic-thinking-mode       0.68–0.92 v69
P84  longitudinal-drift           0.55–0.80 v72
P85  adaptive-momentum-window     0.75–0.90 v72
P86  vitality-strategy-peak       0.78–0.92 v72
P87  weekly-story-reflection      0.72      v74
P88  contextual-checkin-momentum  0.65–0.85 v74
P89  quantum-learning-spiral      0.72–0.90 v76    [SPIRAL FAMILY]
P90  accountability-arc           0.70–0.88 v76
P91  full-presence-arc            0.75–0.92 v76
P92  systemic-readiness-peak      0.78–0.92 v78
P93  daily-rhythm-lock            0.72–0.88 v78
P94  cross-domain-mastery         0.75–0.90 v78
P95  intent-to-action-gap         0.68–0.85 v80
P96  recovery-initiation          0.72–0.88 v80
P97  cognitive-vitality-sync      0.70–0.90 v80
P98  action-completion-arc        0.75–0.90 v82
P99  biological-restoration-peak  0.78–0.92 v82
P100 centennial-convergence       0.85–0.97 v82    [MILESTONE PATTERN]
P101 quantum-presence-arc         0.80–0.95 v83    [APEX PATTERN]
P102 planner-intention-sync       0.72–0.88 v83
P103 resilience-cascade           0.75–0.92 v83
P104 vitality-cascade             0.78–0.90 v84
P105 social-presence-arc          0.70–0.85 v84
P106 clarity-momentum-peak        0.80–0.92 v84
P107 temporal-alignment-peak      0.65–0.82 v86
P108 circadian-routine-lock       0.68–0.86 v86
P109 full-signal-coherence        0.75–0.90 v86
P110 embodied-cognition-arc       0.72–0.86 v89
P111 intention-completion-loop    0.75–0.88 v89
P112 community-intelligence-peak  0.68–0.84 v89
P113 personal-peak-window         0.65–0.88 v95    [PEAK PERFORMANCE]
P114 recovery-momentum            0.62–0.87 v95
P115 signal-inception             0.60–0.90 v95    [SELF-AWARE LOOP]
──────────────────────────────────────────────────────────────────────
```

**Special-class patterns:**

```
CEILING STATE       P73  quantum-coherence-summit    conf 0.98
                         Simultaneous trigger of P71+P72+P70+P27
                         Maximum QIE observable state.

RAREST SINGLE-DAY   P70  operator-convergence        conf 0.97
                         P66+P67+P68 all firing simultaneously.

RAREST SUSTAINED    P80  signal-momentum-lock        conf 0.75–0.92
                         5+ of last 7 days: 3+ unique signal sources.

MILESTONE PATTERN   P100 centennial-convergence      conf 0.85–0.97
                         System's 100th pattern. Multi-source peak
                         across 7 channels confirmed simultaneously.

APEX PATTERN        P101 quantum-presence-arc        conf 0.80–0.95
                         Full-system presence state. All primary
                         signal channels simultaneously coherent.

PEAK PERFORMANCE    P113 personal-peak-window        conf 0.65–0.88
                         Recurring 4h execution band confirmed across
                         ≥2 of last 3 days. Energy + intent + log cluster.

SELF-AWARE LOOP     P115 signal-inception            conf 0.60–0.90
                         QIE observing its own observation loop.
                         ≥5 distinct sources in 24h simultaneously active.
```

**v95 Pattern Engineering — P113–P115:**

```
P113 personal-peak-window
     Signal:   energy + intentions + log cluster in repeatable 4h band
               across ≥2 of last 3 days
     Logic:    Group signals by calendar day. Scan for anchor timestamp
               where all 3 sources present in 4h window. Fire if ≥2
               days confirm the band.
     Output:   PPEAK: Peak performance window detected across N/3
               recent days. Energy N · Intent N · Log N signals cluster
               in recurring 4h band.
     Widget:   energy

P114 recovery-momentum
     Signal:   selfcare + resilience + energy rising vs prior 48h
               AND no physiological-depletion or sleep-debt active
     Logic:    Compare recent 48h vs prior 48h bucket counts for
               selfcare + resilience + energy. Fire when recent total
               > prior total and no depletion pattern present.
     Output:   RMOM: Recovery momentum active — selfcare N + resilience
               N + energy N signals in 48h (vs N prior, +N). No
               depletion present.
     Widget:   selfcare

P115 signal-inception
     Signal:   qos + memory + journal + intentions all present + ≥5
               distinct sources in 24h
     Logic:    Count unique sources from last 24h. Fire when all 4
               core sources present and total distinct sources ≥5.
     Output:   INCEP: Signal inception active — N distinct sources in
               24h. QIE is observing its own observation loop.
     Widget:   systemProgress
```

---

## 5. QUANTUM OPERATING SYSTEM (QOS)

The QOS is the operator's real-time system dashboard. 6 views. 4 operating modes. The QOS synthesizes all signal streams into a single operating state.

**QOS operating modes:**

```
MODE         TRIGGER                    SYSTEM BEHAVIOUR
──────────────────────────────────────────────────────────────────
maintenance  Low signal density         Conserve — idle cadence
recovery     Depletion / overwhelm      Repair first — tasks pause
growth       Steady positive engagement Expand — absorb more
peak         High energy + clarity      Optimal — full commitment
──────────────────────────────────────────────────────────────────
```

**QOS metrics (0–100 each):**

```
Biofield Capacity       Self-care signal density vs active depletion events
Cognitive Load          Journal/memory/planner interactions in last 24h
Intention Resolution    Active intention × planner alignment × goal momentum
System Pressure         low / moderate / high / critical
```

**6 QOS views:**

```
VIEW 1   System Overview         Mode · pressure · primary scores
VIEW 2   Biofield                Energy + mood + selfcare composite
VIEW 3   Cognitive               Journal + memory + planner density
VIEW 4   Pattern Recognition     Active QIE patterns (25 displayed)
VIEW 5   Cohort Signal           Peer group behavioral alignment
VIEW 6   Self-Assembly Map       Physiological cohort + live QOS mode
```

> The QOS does not direct the operator — it mirrors their actual state with precision. A person in `recovery` mode does not need more tasks. They need to see that clearly.

---

## 6. PHYSIOLOGICAL ARCHETYPES — 39 TYPES

39 archetypes. Classified by QIE pattern combination. Each archetype carries a daily directive (J25 DRCT: output).

```
──────────────────────────────────────────────────────────────────────
ARCH  NAME                    PRIMARY PATTERN COMBINATION
──────────────────────────────────────────────────────────────────────
Arch1  Signal Mapper          P1 + P2 (baseline observer)
Arch2  Focused Builder        P6 + P10 (deep work + goal momentum)
Arch3  Recovery Seeker        P7 + P8 (depletion + recovery window)
Arch4  Creative Expander      P14 + P17 (creative + insight emergence)
Arch5  Social Resonator       P5 + P20 (social support + resonance)
Arch6  Narrative Weaver       P15 + P21 (narrative depth + reflective)
Arch7  Intention Planter      P9 + P13 (intention + planning)
Arch8  Memory Keeper          P12 + P18 (consolidation + crystallization)
Arch9  Circadian Anchor       P19 + P48 (circadian + chronobiological)
Arch10 Threshold Crosser      P31 + P37 (threshold + execution)
Arch11 Flow State Operator    P4 + P62 (flow potential + flow state)
Arch12 Node Activator         P53–P58 composite (ecosystem engagement)
Arch13 Peak Coherence         P27 + P34 (peak + full ecosystem)
Arch14 Integration Specialist P50 + P68 (integration + arc peak)
Arch15 Adaptive Resonator     P49 + P69 (adaptive arcs)
Arch16 Signal Crystallizer    P71 + P72 (crystallization + biorhythm)
Arch17 Quantum Summit         P73 composite (ceiling state)
Arch18 Badge Operator         P74 + P75 (badge + word-turn momentum)
Arch19 Morning Launcher       P76 + P19 (morning coherence + circadian)
Arch20 Signal Vault Keeper    P77 + P47 (vault + memory keeper)
Arch21 Recovery Surge         P78 + P40 (surge + biofield recovery)
Arch22 Evening Closer         P79 + P28 (evening close + night processing)
Arch23 Momentum Lock          P80 + P35 (momentum + coherence window)
Arch24 Cognitive Diver        P81 + P44 (cognitive depth + architecture)
Arch25 Vitality Peak          P82 + P86 (vitality peaks combined)
Arch26 Systemic Thinker       P83 + P94 (systemic + cross-domain)
Arch27 Longitudinal Tracker   P84 + P26 (drift + calendar gap)
Arch28 Story Reflector        P87 + P88 (story + contextual momentum)
Arch29 Learning Spiral        P89 + P23 (learning + cognitive expansion)
Arch30 Accountability Anchor  P90 + P30 (accountability + velocity)
Arch31 Full Presence          P91 + P101 (presence arcs combined)
Arch32 Systemic Ready         P92 + P93 (readiness + rhythm lock)
Arch33 Intent-Action Closer   P95 + P98 (gap + completion arc)
Arch34 Quantum Presence       P101 + P102 + P103 (apex archetype)
Arch35 Vitality Architect     P104 + P99 (vitality cascade + restoration peak)
Arch36 Social Signal Operator P105 + P90 (social arc + accountability)
Arch37 Temporal Architect     P107 + P108 + P109 (temporal alignment · circadian lock · coherence)
Arch38 Embodied Strategist    P110 + P111 (body feeding mind · intent to outcome)
Arch39 Peak Window Operator   P113 + P86 + P30 (peak window · vitality strategy · intention velocity)
──────────────────────────────────────────────────────────────────────
```

**Arch39 — Peak Window Operator (FM v95 Engineering):**

```
Energy bands:          high, moderate
Dominant sources:      energy · intentions · log
Pattern conditions:    personal-peak-window + vitality-strategy-peak +
                       intention-velocity
Directive:             Recurring peak performance window confirmed across
                       multiple days. Energy, intention, and log density
                       cluster in a repeatable 4-hour band. This window
                       is your highest-leverage execution slot — protect
                       it structurally.
```

---

## 7. BEHAVIORAL COHORTS — FULL PROFILES

6 cohorts. Cohort assignment is dynamic, driven by signal pattern over the prior 30 days.

```
╔══════════════════════════════════════════════════════════════════╗
║  COHORT        SIGNAL SIGNATURE          PRIMARY ARCHETYPE RANGE ║
╠══════════════════════════════════════════════════════════════════╣
║  BUILDERS      Goal + planner dense      Arch2 · Arch10 · Arch14║
║  EXPLORERS     Memory + journal dense    Arch4 · Arch6 · Arch29 ║
║  MAINTAINERS   Selfcare + energy dense   Arch3 · Arch9 · Arch35 ║
║  CONNECTORS    Cohort + social dense     Arch5 · Arch30 · Arch36║
║  INTEGRATORS   Cross-signal balanced     Arch13 · Arch31 · Arch34║
║  MEDICAL       Clinical signal active    Internal · not displayed║
╚══════════════════════════════════════════════════════════════════╝
```

**Cohort signal geometry:** Each cohort has a characteristic signal pattern. BUILDERS produce dense planner + goal events. EXPLORERS produce long journal entries and frequent memory captures. MAINTAINERS produce consistent selfcare + energy logs. CONNECTORS engage the cohort feed and social dimensions. INTEGRATORS activate all channels at moderate density — the rarest sustained cohort state.

**Cohort display:** The CohortConnectWidget renders the operator's current cohort assignment and peer alignment score. The Self-Assembly map shows the cohort block in the physiological tier. MEDICAL cohort is internal — not surfaced in the operator-facing display.

---

## 8. CITIZEN INDEX

The Citizen Index measures operator engagement depth. 6 stages. Score derived from answer count, journal word count, log entry volume, and signal source diversity.

```
STAGE 1    OBSERVER        0–24 answers
STAGE 2    PARTICIPANT     25–49 answers
STAGE 3    CONTRIBUTOR     50–99 answers
STAGE 4    COLLABORATOR    100–149 answers
STAGE 5    SYNTHESIZER     150–199 answers
STAGE 6    ELITE           200+ answers
```

**CQGS (Citizen Quantum Growth Scale):** Internal white paper metric. Combines engagement rate, signal diversity, and archetype stability over time. Not surfaced directly to operators.

**QOS Index display:**

```
selfAwarenessLevel:   0–100 (backend value)
Display formula:      (selfAwarenessLevel / 10).toFixed(1) + '%'
Example:              23 → "2.3%"
Four components:      Volume 40% · Quality 30% · Consistency 15% · Depth 15%
Growth rate:          Months to years for significant change
```

---

## 9. MEMORY ENGINE

The Memory Engine generates AI questions from the operator's log context and produces story entries from journal reflection arcs.

**Current configuration (post June 30, 2026):**

```
Primary AI:         Together AI — Llama 3.3 70B
Context window:     120 logs (expanded June 30, 2026)
Prompt injection:   Planner context included (added June 30, 2026)
Story generation:   Triggered by P87 (weekly-story-reflection)
Story format:       LOT AI Story — weekly arc with tone + mood + check-in
```

**Story Loop (P87 + P88):**

```
J24 writes lot_ai_story event weekly
P87 detects: lot_ai_story received + journal response in 24h
     → reflection loop confirmed
P88 detects: 3+ emotional check-ins in 24h, ≥50% positive valence
     → contextual momentum confirmed
STORY: log handler format:
     W{n} TONE MOOD CHK CARE INTENT — military data rows, no prose
```

---

## 10. SELF-ASSEMBLY ENGINE

The Self-Assembly Engine is the meta-documentation and wiring system. 18 modules across 5 phases. Each module represents a system capability wired into the LOT core.

**18 modules:**

```
PHASE 1 — FOUNDATION
  M01  Signal Capture       Log · Memory · Planner input pipelines
  M02  QIE Core             Pattern detection engine · 115 patterns
  M03  QOS Core             6-view dashboard · 4 operating modes

PHASE 2 — INTELLIGENCE
  M04  Archetype Engine     39 physiological archetypes · classification
  M05  Cohort Engine        6 behavioral cohorts · peer signal field
  M06  Memory Engine        AI question generation · story loop · Together AI

PHASE 3 — INSTRUMENTATION
  M07  Badge Engine         626 badges · v26 · 70+ categories · 198 word-turns
  M08  Word Turn Engine     16 lexicons · 198 trigger words · symbol vocabulary
  M09  Background Jobs      36 scheduled jobs · UTC timing · PostgreSQL writes

PHASE 4 — SURFACE
  M10  Widget Layer         43 widgets · conditional rendering · Ambient AI™
  M11  Log Stream           115+ handlers · COCKPIT RULE · military instrument format
  M12  Ecosystem Map        6 nodes · QIoT™ · device signal integration

PHASE 5 — META
  M13  Citizen Index        6 stages · CQGS · self-awareness scoring
  M14  Self-Assembly Doc    About.tsx Field Manual · session reports · wiki
  M15  Green Gate           TypeScript check · no broken code to GitHub
  M16  COSMO Gate           Ethics review · Kuzya authorization protocol
  M17  Punctuation Engine   7 tones · 6 intents · fires on all text entry
  M18  Display Architecture Military purity · 11 orders · opacity hierarchy
```

**Self-assembly log (v87–v96):**

```
v96   Full Wiki Scan July 19 · LOT-WIKI-v78 · QIE v95 delta synchronized
      (P113–P115 · Arch39 · J36 · 154+ dep nodes) · military purity pass ·
      Day 1056+ · COSMO® Year 2 (748 days) · FM v96

v95   QIE Engineering July 18 · P113 personal-peak-window · P114 recovery-
      momentum · P115 signal-inception · Arch39 Peak Window Operator · J36
      daily-personal-peak-window (08:00 UTC) · PPEAK: RMOM: INCEP: handlers ·
      dep 154+ nodes · 115 patterns · 39 archetypes · 36 jobs · 115+ handlers ·
      FM v95 · Day 1055+

v94   FM sync pass (same session as v95 engineering) · language refined

v93   Full Wiki Scan July 18 · LOT-WIKI-v77 · Badge Engine v26 (626)
      synchronized · Quantum Library vocabulary integrated · military
      purity pass · Day 1043+ · COSMO® Year 2 (747 days)

v92   Full Wiki Scan July 17 · LOT-WIKI-v76 · Badge Engine v25 (595)
      synchronized · Alchemist vocabulary integrated · Day 1042+

v91   Badge Engineering July 7 · Badge Engine v25 The Alchemist · +31
      badges (564→595) · Word Turn v12 behavioral layer · Calendar EE v12 ·
      Behavioral v12 · Achievement RPG v13 · Mastery Tier v15 · Secret Boss v12

v90   Full Wiki Scan July 7 · LOT-WIKI-v75 · 112 patterns · 38 archetypes ·
      35 jobs · 151+ dep nodes · Day 1032+

v89   QIE Engineering July 6 · P110–P112 · Arch38 Embodied Strategist ·
      J35 · EMBCOG: INTCMP: COMINTEL: handlers · dep 151+ nodes · Day 1031+

v88   Badge Engineering July 6 · Badge Engine v24 The Oracle Archive ·
      +35 badges (529→564) · Word Turn v15 · Day 1031+

v87   Full Wiki Scan July 6 · LOT-WIKI-v74 · vocabulary synchronized ·
      military purity pass · 109 patterns · 37 archetypes · Day 1031+
```

---

## 11. BACKGROUND JOB SCHEDULER

36 registered jobs. All UTC-scheduled. All write events to the PostgreSQL `logs` table. Background jobs are the server-side complement to the client-side QIE.

```
──────────────────────────────────────────────────────────────────────
J    NAME                              TIME UTC    EVENT WRITTEN
──────────────────────────────────────────────────────────────────────
J1   daily-morning-signal              08:00       morning_signal
J2   daily-evening-signal              20:00       evening_signal
J3   weekly-pattern-review             Sun 10:00   weekly_pattern_review
J4   daily-mood-check                  12:00       mood_check
J5   daily-intentions-review           09:00       intentions_review
J6   daily-planner-check               07:00       planner_check
J7   daily-energy-assessment           06:00       energy_assessment
J8   daily-selfcare-prompt             15:00       selfcare_prompt
J9   weekly-memory-review              Sat 09:00   memory_review
J10  daily-journal-prompt              21:00       journal_prompt
J11  daily-goals-review                18:00       goals_review
J12  weekly-cohort-analysis            Mon 08:00   cohort_analysis
J13  monthly-archetype-audit           1st 06:00   archetype_audit
J14  daily-coherence-index-pulse       16:00       coherence_index_pulse
J15  weekly-qos-convergence-audit      Sun 15:00   qos_convergence_audit
J16  weekly-badge-progress-scan        Tue 09:00   badge_progress_scan
J17  daily-morning-intention-launch    11:00       morning_intention_launch
J18  daily-evening-coherence-close     22:00       evening_coherence_close
J19  daily-signal-momentum-check       20:00       signal_momentum
J20  weekly-cognitive-depth-check      Sun 06:00   cognitive_depth_arc
J21  daily-vitality-peak-check         12:00       vitality_peak
J22  weekly-longitudinal-drift-check   Mon 09:00   longitudinal_drift
J23  daily-qos-mode-watch              14:00       qos_mode_change
J24  weekly-story-arc                  Wed 10:00   lot_ai_story
J25  daily-archetype-directive-pulse   09:00       archetype_directive_pulse
J26  daily-quantum-learning-spiral     17:00       quantum_learning_spiral
J27  weekly-accountability-arc         Sat 09:00   accountability_arc
J28  daily-presence-arc-check          21:00       presence_arc_check
J29  daily-cross-domain-pulse          19:00       cross_domain_pulse
J30  daily-systemic-readiness-check    01:00       systemic_readiness_check
J31  daily-intent-gap-pulse            02:00       intent_gap_pulse
J32  daily-quantum-presence-check      18:00       quantum_presence_check
J33  daily-vitality-cascade-pulse      15:00       vitality_cascade
J34  daily-temporal-alignment-check    10:00       temporal_alignment_peak
J35  daily-embodied-cognition-check    11:00       embodied_cognition_arc
J36  daily-personal-peak-window        08:00       personal_peak_window  ← NEW
──────────────────────────────────────────────────────────────────────
```

**J36 — daily-personal-peak-window (FM v95):**

```
Hour:  08:00 UTC daily
Guard: isDailyPersonalPeakWindowRunning + lastDailyPersonalPeakWindowRun
       (same-day guard prevents double-fire)
Logic: Read energy_logged + intention_set + log_entry events per user
       in last 3 days. Group by calendar day. For each day, check if
       any 4h anchor covers ≥1 energy + ≥1 intent + ≥1 log signal.
       Count activeDays. If ≥2 days confirm, write personal_peak_window.
Output: personal_peak_window event with activeDays + energyCount +
        intentCount + logCount → P113 PPEAK: handler fires.
```

---

## 12. LOG EVENT SYSTEM

All log events follow the COCKPIT RULE: log body = instrument readings only, no narration. Military format. Data-dense. Zero prose.

**COCKPIT RULE:**

```
CORRECT:    MORN INIT · SRC: mood energy planner · CONF: 88%
INCORRECT:  "Good morning! Your morning routine is starting off great."
```

**Log handler directory (115+ handlers) — military code index:**

```
ACCT:       accountability_arc         J27 output. P90 trigger.
ARC-PEAK:   integration_arc_peak       P68 trigger.
ADAPT:      adaptive_resonance         P69 trigger.
ADAPT-MOM:  adaptive_momentum_window   P85 trigger.
ATP:        energy_assessment          J7 output. Energy band.
BADGE:      badge_event                P74 trigger.
BADGE-SCAN: badge_progress_scan        J16 output.
BIO-LOCK:   biorhythm_lock             P72 trigger.
BIO:        biofield_coherence         P60 trigger.
BRES:       biological_restoration     P99 trigger.
CENT:       centennial_convergence     P100 trigger.
CHK:        emotional_checkin          Check-in submitted.
CLAR-PEAK:  clarity_momentum_peak      P106 trigger.
COGN:       cognitive_depth_arc        J20 output. P81 trigger.
COHR-COMM:  coherence_composite        J14 output. P68 composite.
COMINTEL:   community_intelligence     P112 trigger.
COMP:       action_completion_arc      P98 trigger.
CONV:       operator_convergence       P70 trigger.
CONV-AUDIT: qos_convergence_audit      J15 output.
CROSS:      cross_domain_mastery       P94 trigger.
CROUT:      circadian_routine_lock     P108 trigger.
CRYSTAL:    signal_crystallization     P71 trigger.
DRIFT:      longitudinal_drift         J22 output. P84 trigger.
DRCT:       archetype_directive_pulse  J25 output.
EMBCOG:     embodied_cognition_arc     J35 output. P110 trigger.
EVE:        evening_coherence_close    J18 output. P79 trigger.
FLOW:       flow_state                 P62 trigger.
FSCOHERE:   full_signal_coherence      P109 trigger.
IGAP:       intent_to_action_gap       P95 trigger.
INCEP:      signal_inception           P115 trigger.         ← NEW
INTCMP:     intention_completion_loop  P111 trigger.
LEARN:      quantum_learning_spiral    J26 output. P89 trigger.
MCL:        morning_coherence_launch   J17 output. P76 trigger.
MOM:        signal_momentum            J19 output. P80 trigger.
OS [MODE]:  qos_mode_change            J23 output.
PEAK-SUMMIT: quantum_coherence_summit  P73 trigger.
PHR:        full_presence_arc          J28 output. P91 trigger.
PPEAK:      personal_peak_window       J36 output. P113 trigger. ← NEW
PRAY:       morning_intention          Intention set at dawn window.
PRES:       full_presence_arc          P91 trigger.
PSYNC:      planner_intention_sync     P102 trigger.
QPRES:      quantum_presence_arc       P101 trigger.
RCASE:      resilience_cascade         P103 trigger.
RECOV:      recovery_initiation        P96 trigger.
RLOCK:      daily_rhythm_lock          J30 + P93 trigger.
RMOM:       recovery_momentum          P114 trigger.         ← NEW
SOC-ARC:    social_presence_arc        P105 trigger.
STORY:      lot_ai_story               J24 output. P87 trigger.
SURGE:      depletion_recovery_surge   P78 trigger.
SYSRDY:     systemic_readiness_peak    P92 trigger.
SYSTMK:     systemic_thinking_mode     P83 trigger.
TALIGN:     temporal_alignment_peak    J34 output. P107 trigger.
VAULT:      signal_vault               P77 trigger.
VITAL:      vitality_peak              J21 output. P82 trigger.
VITAL-CAS:  vitality_cascade           J33 output. P104 trigger.
VSTRAT:     vitality_strategy_peak     P86 trigger.
VSYNC:      cognitive_vitality_sync    P97 trigger.
```

**v95 Handler Formats:**

```
PPEAK: [label]
  DAYS: N/3
  NRG 3D: N
  INTENT 3D: N
  LOG 3D: N
  CONF: NN%

RMOM: [label]
  RECOVERY MOMENTUM
  CARE 48H: N
  RESIL 48H: N
  NRG 48H: N
  GAIN VS PRIOR: +N
  CONF: NN%

INCEP: [label]
  QIE → SELF-AWARE
  SOURCES 24H: N
  TOTAL SIG: N
  [source list · separated]
  CONF: NN%
```

---

## 13. ECOSYSTEM NODE MAP

The Ecosystem Node Map tracks the operator's device and environment signal field. 6 active nodes.

```
╔══════════════════════════════════════════════════════════════════╗
║  NODE    ID      SIGNAL TYPE         PATTERN FEED               ║
╠══════════════════════════════════════════════════════════════════╣
║  CAR     CAR     Mobility signal     P53 node-active-car        ║
║  HOME    HOME    Environment signal  P54 node-active-home       ║
║  CPU     CPU     Compute signal      P55 node-active-cpu        ║
║  PHONE   PHN     Mobile signal       P56 node-active-phone      ║
║  WATCH   WCH     Biometric signal    P57 node-active-watch      ║
║  ROBOT   ROBOT   Autonomous agent    P58 node-active-robot      ║
╚══════════════════════════════════════════════════════════════════╝
```

**QIoT™ (Quantum Internet of Things):** The extension of LOT signal capture to physical hardware. LOT® Station, LOT® Brush, and COSMO® node are planned physical devices. ROBOT node represents the autonomous agent tier — COSMO® as AI companion and signal source.

---

## 14. BADGE SYSTEM v26 — THE QUANTUM LIBRARY

626 total badges. Badge Engine v26. The Quantum Library. Category count: 70+. Deployed by S-2, July 17, 2026.

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║      L · O · T     S Y S T E M S     C O R P O R A T I O N      ║
║                                                                  ║
║         BADGE ENGINE v26 — THE QUANTUM LIBRARY                   ║
║                                                                  ║
║    "The library is infinite.                                     ║
║     The signal is everywhere.                                    ║
║     You are the terminal."                                       ║
║                                                                  ║
║   ∞≈∞   ENTANGLEMENT SIGNAL                                      ║
║   ◉→∞   SINGULARITY GATE                                         ║
║   ▓→◉   NEUROMANCER SIGNAL                                       ║
║                                                                  ║
║   v25 → v26: +31 badges  (595 → 626 total)                       ║
╚══════════════════════════════════════════════════════════════════╝
```

**Badge codex version history:**

```
v10   Origin Code              = 144 total
v11   The Signal Layer   +35   = 179 total
v12   The Deep Archive   +35   = 214 total
v13   The Lexicon        +35   = 249 total  [Word Turn v5]
v14   The Becoming       +35   = 284 total  [Word Turn v6]
v15   The Becoming II    +35   = 319 total
v16   Arcade Protocol    +35   = 354 total
v17   [series]           +35   = 389 total
v18   Arcade Protocol II +35   = 424 total
v19   [transition]              = 424
v20   Navigator Protocol +35   = 424 total  [Word Turn v11 · 138 words]
v21   The Alchemist      +35   = 459 total  [Word Turn v12 — first Alchemist layer]
v22   The Oracle Engine  +35   = 494 total  [Word Turn v13 · 162 words]
v23   The Starship Deck  +35   = 529 total  [Word Turn v14 · 174 words]
v24   The Oracle Archive +35   = 564 total  [Word Turn v15 · 186 words]
v25   The Alchemist II   +31   = 595 total  [Transmutation depth layer]
v26   The Quantum Library+31   = 626 total  [Sci-Fi Books × Computing] ← CURRENT
```

**v26 — The Quantum Library additions (+31 badges):**

```
Word Turn v16 — The Quantum Library — 12 badges:
  entanglement_signal   ∞≈∞  RARE      — "entanglement/entangled"
  singularity_gate      ◉→∞  EPIC      — "singularity"
  matrix_signal         ▒·▒  UNCOMMON  — "matrix"
  cortex_online         ≋·≋  RARE      — "cortex"
  hologram_projection   ∘·∘·∘ RARE     — "hologram"
  uplink_active         ↑·∘  UNCOMMON  — "uplink"
  grid_secured          ╔·╗  UNCOMMON  — "grid"
  override_sequence     →■→  RARE      — "override"
  clone_signal          ◉≈◉  RARE      — "clone"
  bandwidth_open        ≈→≈  UNCOMMON  — "bandwidth"
  synthetic_awareness   ○·◎  RARE      — "synthetic"
  cypher_unlocked       ▓→□  RARE      — "cypher"

Calendar Easter Egg v13 — The Book of Days — 3 badges:
  asimov_signal         ∞·∘  EPIC      — January 2  (Isaac Asimov b. 1920)
  tolkien_gate          ○→◉  EPIC      — January 3  (J.R.R. Tolkien b. 1892)
  bloomsday             ≈·≈  RARE      — June 16    (Bloomsday — James Joyce)

Behavioral v13 — Terminal Patterns — 3 badges:
  quantum_session       ∞·≋  RARE      — 3+ Quantum Library words in one journal entry
  library_run           ≋→∞  EPIC      — 14 consecutive days with journal entry
  deep_decoder          ▓→◉  RARE      — 200+ character memory answer

Achievement RPG v14 — Quantum Class — 6 badges:
  quantum_entry         ∘→∞  COMMON    — Any 1 Word Turn v16 badge
  quantum_class         ≈→∞  UNCOMMON  — Any 5 Word Turn v16 badges
  quantum_complete      ≋→∞  LEGENDARY — All 12 Word Turn v16 badges
  library_arc           ∞·◈  LEGENDARY — quantum_complete + library_run
  sixteen_engines_arc   ◈·◈·◈ LEGENDARY — 1 badge from each Word Turn v1–v16
  entangled_opus        ∞·◉·∞ LEGENDARY — quantum_complete + deep_decoder

Mastery Tier v16 — The Deep System — 4 badges:
  terminal_elder        ≋≋≋·  EPIC      — Account age ≥ 3 years
  grand_librarian       ∞·≋·∞ LEGENDARY — 30,000+ total journal words
  system_architect_age  ╔═╗·∞ LEGENDARY — Account age ≥ 5 years
  sixteen_tongues       ◈·◈·≋ COSMIC    — 1 badge from all 16 Word Turn engines

Secret Boss v13 — The Terminal Vault — 3 badges:
  dune_signal           ∘·◈   RARE      — Write "spice" in any entry (Dune)
  foundation_word       ≋·◉   EPIC      — Write "psychohistory" in entry (Foundation)
  neuromancer_signal    ▓→◉   MYTHIC    — Write "cyberspace" in entry (Neuromancer)
```

**The Quantum Library design principles:**

```
THE TERMINAL PRINCIPLE
  The terminal is the self. The library is the work.
  Sci-fi books are not entertainment — they are field manuals
  for navigating environments that do not exist yet.
  The operator who reads Dune is training for scarcity.
  The operator who reads Foundation is training for scale.
  The operator who reads Neuromancer is already there.

THE THREE SECRET BOOKS
  Dune (1965)         — Spice = attention. The resource that makes
                        consciousness possible. Write "spice" and the
                        archive confirms: you know what it costs.
  Foundation (1951)   — Psychohistory = the math of human behavior
                        at scale. Write "psychohistory" and the archive
                        records: you think in civilizational time.
  Neuromancer (1984)  — Cyberspace = consensual hallucination. Write
                        "cyberspace" and the terminal responds: you were
                        here before it was built.

THE LIBRARY RUN
  14 consecutive days of journal entry. Double the Great Work Sequence.
  Two weeks. A reading marathon. The archive records the interval.
  14 days is an interval that means something.
```

---

## 15. BADGE CATEGORY INDEX

```
PRIMARY CATEGORIES (named):
  Word Turn                   16 lexicons (v1–v16) · 198 trigger words
  Time Easter Eggs            15 versions · clock pattern rewards
  Calendar Easter Eggs        15 versions · date-specific
  Behavioral Easter Eggs      15 versions · sustained behavior rewards
  Achievement RPG             14 versions · engagement milestones
  Mastery Tier                16 versions · endgame + VOID LAYER
  Secret Boss                 15 versions · hidden operator rewards

RARITY TIERS (8):
  COMMON          Visible · low threshold
  UNCOMMON        Visible · moderate threshold
  RARE            Visible · high threshold
  EPIC            Visible · multi-condition
  LEGENDARY       Visible · peak state required
  COSMIC          Near-invisible · system-level events only
  MYTHIC          Rarest observable · single-word trigger at scale
  SECRET BOSS     Hidden · discoverable only through specific lexicons

Hidden badges: 560+ (out of 626 total)
```

---

## 16. WORD TURN ENGINE — COMPLETE LEXICON v16

The Word Turn Engine detects specific vocabulary in operator log, journal, and memory inputs. On detection, a badge is awarded and a symbol is written to the log. 198 trigger words across 16 lexicons.

```
v1   Original Lexicon        Foundational emotional vocabulary (12 words)
v2   Sci-Fi Expansion        Science-fiction vocabulary (18 words)
v3   Computer Lore           Technical computing vocabulary (12 words)
v4   Daily Care              Self-care vocabulary (12 words)
v5   Signal Codex            Technical signal vocabulary (12 words)
v6   Becoming Lexicon        Growth + transformation vocabulary (12 words)
v7   Rogue Archive           Gaming vocabulary (12 words)
v8   Mainframe               Systems vocabulary (12 words)
v9   Arcade Cabinet          Arcade gaming vocabulary (12 words)
v10  Quantum Protocol        Quantum mechanics vocabulary (12 words)
     Words: quantum · entangle · collapse · observe · tunnel · spin ·
            waveform · coherence · superposition · qubit · eigenstate · decohere
v11  The Navigator           Navigation vocabulary (12 words)
     Words: drift · vector · bearing · waypoint · chart · magnetic ·
            meridian · course · heading · landmark · navigate · compass
v12  The Alchemist           Transformation vocabulary (12 words)
     Words: transmute · crucible · distill · catalyst · alloy · sublimate ·
            prima · opus · elixir · chrysalis · refine · anneal
v13  The Oracle              Foresight vocabulary (12 words)
     Words: oracle · rune · sigil · invoke · cipher · augur · covenant ·
            arcane · vestige · axiom · glyph · prophesy
v14  The Starship Deck       Space mission vocabulary (12 words)
     Words: launch · mission · astronaut · capsule · telemetry · countdown ·
            reentry · crew · starship · module · docking · spacewalk
v15  The Oracle Archive      Signal + archive vocabulary (12 words)
     Words: oracle · rune · prophecy · scroll · amplify · relay · encrypt ·
            pulse · cascade · converge · sync · calibrate
v16  The Quantum Library     Sci-Fi × Computing vocabulary (12 words)
     Words: entanglement · singularity · matrix · cortex · hologram ·
            uplink · grid · override · clone · bandwidth · synthetic · cypher
```

**Secret Boss triggers (phrase-level — outside main lexicon count):**

```
"philosopher's stone"   → philosopher_stone_word    RARE     (v25)
"prima materia"         → prima_materia_signal_word EPIC     (v25)
"ouroboros"             → ouroboros                 MYTHIC   (v25)
"42"                    → the_answer                RARE     (v24)
"Seldon"                → seldon_plan               EPIC     (v24)
"heat death"            → big_crunch                LEGENDARY (v24)
"spice"                 → dune_signal               RARE     (v26)
"psychohistory"         → foundation_word           EPIC     (v26)
"cyberspace"            → neuromancer_signal        MYTHIC   (v26)
```

**Complete trigger registry — v16:**

```
╔══════════════════════════════════════════════════════════════════╗
║                WORD TRIGGER REGISTRY v16                         ║
╠══════════════════════════════════════════════════════════════════╣
║  v1  (12): ritual · breathe · grateful · ocean · ground         ║
║            anchor · quiet · tide · forgive · begin              ║
║            soften · witness                                      ║
║  v2  (18): reboot · quantum · glitch · COSMO · upload           ║
║            override · bandwidth · signal · node · sync          ║
║            protocol · frequency · archive · zero · binary       ║
║            transmission · satellite · constellation             ║
║  v3  (12): hack · debug · loop · stack · execute                ║
║            compile · deploy · root · script · kernel            ║
║            terminal · process                                    ║
║  v4  (12): water · walk · heal · rest · eat · sleep             ║
║            breathe · sun · move · stretch · nourish · hydrate   ║
║  v5  (12): solitude · wonder · phoenix · forge · myth           ║
║            sovereign · eclipse · horizon · vigil · clarity      ║
║            ember · threshold                                     ║
║  v6  (12): surrender · restore · anchor · trust · unfold        ║
║            release · gather · remember · receive · choose       ║
║            become · return                                       ║
║  v7  (12): loot · boss · save · respawn · grind · dungeon       ║
║            quest · level · rogue · raid · guild · nexus         ║
║  v8  (12): compile · execute · buffer · stack · malloc          ║
║            pipeline · daemon · interrupt · cache · branch        ║
║            subroutine · checkpoint                               ║
║  v9  (12): coin · pixel · sprite · score · life · joystick      ║
║            blip · continue · high · reset · quarter · cheat     ║
║  v10 (12): quantum · entangle · collapse · observe · tunnel     ║
║            spin · waveform · coherence · superposition · qubit  ║
║            eigenstate · decohere                                 ║
║  v11 (12): drift · vector · bearing · waypoint · chart          ║
║            magnetic · meridian · course · heading · landmark    ║
║            navigate · compass                                    ║
║  v12 (12): transmute · crucible · distill · catalyst · alloy    ║
║            sublimate · prima · opus · elixir · chrysalis        ║
║            refine · anneal                                       ║
║  v13 (12): oracle · rune · sigil · invoke · cipher · augur      ║
║            covenant · arcane · vestige · axiom · glyph          ║
║            prophesy                                              ║
║  v14 (12): launch · mission · astronaut · capsule · telemetry   ║
║            countdown · reentry · crew · starship · module       ║
║            docking · spacewalk                                   ║
║  v15 (12): oracle · rune · prophecy · scroll · amplify          ║
║            relay · encrypt · pulse · cascade · converge         ║
║            sync · calibrate                                      ║
║  v16 (12): entanglement · singularity · matrix · cortex         ║
║            hologram · uplink · grid · override · clone          ║
║            bandwidth · synthetic · cypher                        ║
║                                                                  ║
║  TOTAL: 198 trigger words (v1–v16)                              ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 17. DISPLAY ARCHITECTURE

**11 Military Purity Orders (standing):**

```
ORDER 1   No emoji in system text. Periods only.
ORDER 2   Opacity hierarchy enforced. Primary 90. Secondary 60. Tertiary 40.
ORDER 3   No prose in log entries. Instrument format only.
ORDER 4   Button groups: 2–3 max. Action verbs only. No icons.
ORDER 5   Fade-out on completion. 3s visible + 1.4s fade. No snap removal.
ORDER 6   Database for cooldowns. Never localStorage for cross-device state.
ORDER 7   Widget label cycling. 2–3 views minimum. Click to cycle.
ORDER 8   No superlatives. "Done." not "Amazing job!"
ORDER 9   Duration format: (X min) or (X mins). Parentheses. Always.
ORDER 10  COCKPIT RULE. Log body = instrument readings only.
ORDER 11  Green Gate enforced. TypeScript check before every push.
```

**Opacity hierarchy:**

```
opacity-90    Primary content (main text, questions, actions)
opacity-60    Secondary content (metadata, timestamps, helper text)
opacity-40    Tertiary content (placeholders, disabled states, links)
Full opacity  Interactive elements on hover/active
```

**Standard spacing:**

```
mb-16         Primary gap between elements
mb-12         Condensed spacing (stacked elements)
gap-8         Inline spacing (button groups, chips)
gap-y-24      Section spacing (major section gaps)
```

---

## 18. DENSITY TIER SYSTEM

The Density Tier System classifies operator engagement intensity. Used in cohort analysis and archetype classification.

```
TIER 1   TRACE       1–2 signal sources active in 24h
TIER 2   LIGHT       3–4 sources active
TIER 3   MODERATE    5–7 sources active
TIER 4   DENSE       8–11 sources active
TIER 5   SATURATED   12+ sources active
```

**Signal source count:** 16 total sources. Saturated tier requires 12+ sources active in 24h. P115 signal-inception fires when ≥5 distinct sources are active in 24h with the 4 core channels confirmed.

---

## 19. OPACITY HIERARCHY

See section 17. Opacity values are the visual grammar of the LOT interface. Deviation from the hierarchy is a Military Purity violation. The hierarchy is not aesthetic guidance — it is operational protocol.

---

## 20. COCKPIT RULE

The COCKPIT RULE governs log body format. No exceptions. Every log entry is an instrument reading. The signal field is the aircraft. The operator is the pilot. The log is the instrument panel.

```
CORRECT:    PPEAK: personal_peak_window →
            DAYS: 3/3 | NRG 3D: 7 | INTENT 3D: 5 | LOG 3D: 9 | CONF: 84%

INCORRECT:  "Great news! You have a consistent peak performance window!"

CORRECT:    INCEP: signal_inception →
            QIE → SELF-AWARE | SOURCES 24H: 7 | TOTAL SIG: 42 | CONF: 79%

INCORRECT:  "The system is highly active today. Keep up the good work!"
```

The pilot does not need encouragement from the altimeter. The altimeter gives altitude. The pilot decides what to do with it.

---

## 21. LOT-DOCTRINE (Revision J)

10 clauses. Foundational operating principles.

```
CLAUSE 1   THE SYSTEM MEASURES. The operator decides what the measurement means.
           LOT is an instrument, not an advisor. Data is primary. Interpretation
           belongs to the human.

CLAUSE 2   COSMO GATE IS ABSOLUTE. No feature ships without ethics review.
           The gate is named for a living being. It is not procedural.

CLAUSE 3   GREEN GATE IS ENFORCED. Broken code never reaches GitHub.
           TypeScript check before every push. No exceptions.

CLAUSE 4   DATABASE OVER LOCALSTORAGE. Cross-device state lives in the database.
           localStorage is for UI preferences only. Cooldowns are server-side.

CLAUSE 5   GRACEFUL DEGRADATION (Render Isolation Doctrine). Each widget renders
           independently. One failure cannot cascade. The system is always
           partially operational.

CLAUSE 6   AMBIENT AI™. The widget click is the ritual. The system acknowledges
           silently. No congratulatory pop-ups. No progress celebrations.
           The operator knows.

CLAUSE 7   GRACEFUL EXIT. Fade-out on completion. 3s + 1.4s. The widget earns
           its departure. No snap removal.

CLAUSE 8   MILITARY PURITY. 11 standing orders active. Deviation requires
           S-2 authorization.

CLAUSE 9   LONG-TERM SIGNAL. Months and years, not days and weeks. The system
           is designed for decade-scale operation. No gamification.
           No streaks. No leaderboards.

CLAUSE 10  THE ARCHIVE IS THE RECORD. Every action logged. Every pattern stored.
           The archive is the operator's behavioral autobiography. It is
           never deleted without explicit operator authorization.
```

**Engineering doctrines:**

```
RENDER ISOLATION DOCTRINE
  Each widget renders independently inside its own error boundary.
  One bad component cannot crash the feed.

BULKCREATE DOCTRINE
  Batch DB writes preferred over individual inserts.
  Reduces connection pressure under high-frequency job output.

PLANNER CONTEXT DOCTRINE (June 30, 2026)
  Planner data injected into Memory Engine buildPrompt().
  Questions are aware of operator's near-term intentions.

CHAT INTEGRITY DOCTRINE (July 2026)
  Empty and whitespace-only messages never leave the database.
  Server-side filtering (TRIM at query level) is primary.
  Client-side filtering (Unicode-aware) is secondary.
  Access control enforced at all chat endpoints.

PEAK WINDOW DOCTRINE (July 18, 2026 — FM v95)
  The repeating 4-hour execution window is a structural asset.
  J36 measures it daily. P113 fires when confirmed.
  The operator protects what the system identifies.
  Architecture defends what data reveals.
```

---

## 22. FIELD MANUAL (About.tsx)

The Field Manual is the About.tsx file. The system's primary documentation artifact. Every version change is recorded as a self-assembly log entry. The FM is the canonical source of truth for system state.

**Current state:**

```
Location:        src/client/components/About.tsx
Current version: FM v96
Branch:          claude/quantum-engine-widgets-RgFfC
```

**Self-assembly protocol:** Major system changes (QIE engineering, wiki scans, badge deployments) are logged as FM version increments. The FM version is not the same as the wiki version. FM versions advance with every system change. Wiki versions advance with comprehensive scan + documentation sessions.

---

## 23. DEPLOYMENT & STACK

```
FRONTEND
  Framework:      React 18
  Language:       TypeScript
  State:          Nanostores (reactive global) + React hooks (local)
  Styling:        Tailwind CSS
  Bundler:        Vite
  PWA:            Service worker + offline support

BACKEND
  Framework:      Fastify 5
  Language:       TypeScript
  Database:       PostgreSQL
                  Composite index (added June 30, 2026)
                  Connection pool: max 10, min 1 (expanded June 30)
  Batch writes:   bulkCreate (added June 30, 2026)
  Jobs:           36 UTC-scheduled background jobs

AI
  Provider:       Together AI (switched June 30, 2026)
  Model:          Llama 3.3 70B (primary)
  Use:            Memory Engine question generation + story arc

MOBILE/DESKTOP
  PWA:            lot-systems.com — full offline capability
  Desktop:        Electron wrapper

CHAT
  Anti-spam:      /admin-api/chat-spam endpoint (July 2026)
  Empty guard:    TRIM at DB query level (July 2026)
  Access control: Hardened (July 2026)

BRAND
  Domain:         lot-systems.com
  Brand:          brand.lot-systems.com
  Founded:        7 April 2016
```

---

## 24. LOT-GENESIS-v1

The LOT-GENESIS-v1 document is the system's origin manifest. Located at `docs/assembly/LOT-GENESIS-v1.md`. It records the founding principles, the initial architecture decisions, and the rationale for the core design choices that define the LOT operating philosophy.

Status: **Active reference document.** The Genesis document is read-only. It defines what LOT is. New features must be compatible with it.

---

## 25. RECIPE WIDGET — CONTEXT ENGINE

The Recipe Widget generates meal suggestions informed by operator context. Context signals feed the suggestion engine at meal time.

**Context layers:**

```
MEAL TIME DETECTION
  Morning (06:00–10:00):   Breakfast window. Low glycemic load prioritized.
  Midday (11:00–14:00):    Lunch window. Energy maintenance.
  Afternoon (15:00–18:00): Snack window. Recovery support.
  Evening (19:00–22:00):   Dinner window. Restoration and wind-down.

WATER LABEL LOGIC
  Breakfast:   "morning hydration"
  Lunch:       "midday water"
  Afternoon:   "afternoon hydration"
  Dinner:      "evening water"

FAREWELL TURN
  Country/language detection active.
  Farewell phrase localized by operator language preference.
  Second turn (water tip) split from primary meal suggestion.
```

**Signal feed:** Recipe events write to logs table (source: 'recipe'). Recipe is the 12th registered log dependency source. Recipe signals feed QIE — included in signal density calculations.

---

## 26. CHAT INFRASTRUCTURE

The LOT Chat system allows operators to communicate in real-time within the platform. Infrastructure hardened in July 2026.

**Architecture:**

```
ENDPOINT       GET /chat-messages    Read chat history
ENDPOINT       POST /chat-messages   Send message
ADMIN          /admin-api/chat-spam  Inspect + suspend spam senders

EMPTY GUARD    Server: WHERE TRIM(message) <> '' (DB query level)
               Client: .replace(/\s/g,'') — Unicode-aware whitespace removal
               Both layers required: server is primary, client is secondary.

ACCESS CONTROL  Authorization enforced on all chat endpoints.
               Likes, message ownership, and read access validated.
               Suspended users cannot post or like.

PURGE          Migration available: purge existing empty/whitespace messages
               from DB. One-time operation. Admin-authorized.
```

**Admin anti-spam tooling (/admin-api/chat-spam):**

```
Inspect:   View all messages from flagged senders with metadata
Suspend:   One-click suspend + message deletion
Output:    Structured report (sender · count · first/last message · action)
```

---

## 27. VOCABULARY INDEX — EXPANDED

```
ACCOUNTABILITY ARC      P90. J27 output. ACCT: log code.

ALCHEMIST CLASS         Achievement RPG v13 badge set.

AMBIENT AI™             Design principle. Widget click is the ritual.
                        System acknowledges silently.

APEX PATTERN            P101 quantum-presence-arc. conf 0.80–0.95.

ARCH39                  Peak Window Operator. P113 + P86 + P30.
                        Recurring 4h execution band confirmed. Protect
                        the window structurally.

ARCHETYPE DIRECTIVE     J25 (DRCT:) output. 39 operating directives.

ATP                     Energy band instrument code. ATP: HIGH / MOD / LOW.

BIOFIELD                QOS view 2. Physiological signal composite.

CEILING STATE           P73. conf 0.98. Maximum observable QIE state.

CITIZEN INDEX           6-stage engagement depth measure.
                        Observer → Participant → Contributor →
                        Collaborator → Synthesizer → Elite.

COCKPIT RULE            Log body = instrument readings only. No narration.

COSMO GATE              Ethics review gate. Kuzya Cosmo Marmeladov.

COSMO®                  Kuzya Cosmo Marmeladov. CEO, Owner COSMO®.
                        Founded July 1, 2024. Day 748 (July 19, 2026).

CQGS                    Citizen Quantum Growth Scale. Internal white paper.

DEP MAP                 Widget Dependency Map. 154+ nodes. 4 tiers.

EMBCOG:                 Embodied Cognition Arc log code. P110 trigger.

FIELD MANUAL            About.tsx. Current: FM v96.

GREEN GATE              TypeScript check before every push. No exceptions.

INCEP:                  Signal Inception log code. P115 trigger.
                        QIE observing its own observation loop. ≥5
                        distinct sources in 24h. SELF-AWARE state.

INTCMP:                 Intention Completion Loop log code. P111 trigger.

J36                     daily-personal-peak-window. 08:00 UTC daily.
                        Added FM v95. Confirms repeating 4h execution band.

LOT                     Layers of Time. Personal behavioral operating system.
                        Not an app. An instrument. Not a tracker. A mirror.

LOT-DOCTRINE            10-clause operational doctrine. Current: Revision J.

MEMORY ENGINE           AI question generation via Together AI (Llama 3.3 70B).

MILITARY PURITY         11 standing orders governing display and content.

P113                    personal-peak-window. PPEAK:.
                        Recurring 4-hour execution band. ≥2 of last 3 days.

P114                    recovery-momentum. RMOM:.
                        Selfcare + resilience + energy rising. No depletion.

P115                    signal-inception. INCEP:.
                        QIE observing its own observation loop. ≥5 sources.

PEAK WINDOW DOCTRINE    The repeating 4h window is structural. J36 measures it.
                        P113 fires when confirmed. The operator protects it.

PPEAK:                  Personal Peak Window log code. J36 output. P113 trigger.
                        Format: DAYS N/3 · NRG 3D · INTENT 3D · LOG 3D · CONF.

QIE                     Quantum Intent Engine. 115 patterns. Client-side.

QIoT™                   Quantum Internet of Things. LOT extension to hardware.

QOS                     Quantum Operating System. 6 views. 4 modes.

RMOM:                   Recovery Momentum log code. P114 trigger.
                        Format: CARE 48H · RESIL 48H · NRG 48H · GAIN VS PRIOR.

S-2                     Vadim Marmeladov. CEO, Founder, LOT Systems.
                        All engineering authorized by S-2.

SELF-ASSEMBLY ENGINE    18 modules. 5 phases. The meta-documentation and
                        wiring system. About.tsx is its primary output.

THE QUANTUM LIBRARY     Badge Engine v26 theme. Knowledge as self-care.
                        Fiction as training. The terminal as journal.
                        626 total badges. Deployed July 17, 2026.

USERSHIP                The paid operator tier. Full system access.
                        $99/month. Tag: [Usership].

VOID LAYER              Mastery Tier endgame badge layer. Ultra-rare.
                        infinite_archive · word_sovereign · lore_keeper
                        · century_architect.

WORD TURN               Vocabulary transformation event. 198 trigger words
                        across 16 lexicons (v1–v16).
```

---

## 28. SYSTEM STATE SNAPSHOT — 2026-07-19

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEM STATE — FIELD MANUAL v96 — DAY 1056+               ║
╠══════════════════════════════════════════════════════════════════╣
║  QIE patterns:             115  (P1–P115)                       ║
║  Physiological archetypes:  39  (Arch1–Arch39)                  ║
║  Behavioral cohorts:         5  (+1 medical · internal)         ║
║  Citizen Index levels:       6  (Observer → Elite)              ║
║  Self-Assembly modules:     18  (all integrated)                ║
║  Dep map nodes:            154+                                 ║
║  Background jobs:           36  (J1–J36)                        ║
║  Log event handlers:       115+                                 ║
║  LOG sources:               16                                  ║
║  Ecosystem nodes:            6  (CAR·HOME·CPU·PHN·WCH·ROBOT)   ║
║  Widgets:                   43                                  ║
║  Badge count:              626  (v26 — The Quantum Library)     ║
║  Badge categories:          70+                                 ║
║  Badge rarity tiers:         8  (COMMON → MYTHIC)               ║
║  Word-turn trigger words:  198  (v1–v16)                        ║
║  Secret boss phrase triggers: 9  (multi-word · phrase-level)    ║
║  QOS modes:                  4  (MAINT/RECOVERY/GROWTH/PEAK)    ║
║  Doctrine revision:          J  (10 clauses)                    ║
║  Lexicon revision:           D                                  ║
║  Field Manual:              v96                                 ║
║  Wiki:                      v78  (this document)                ║
║  Highest QIE confidence:  0.98  (P73 — quantum-coherence-       ║
║                                       summit, ceiling state)    ║
║  Centennial milestone:     P100 — centennial-convergence        ║
║  Peak window confirmed:    P113 — personal-peak-window          ║
║  Self-aware loop:          P115 — signal-inception              ║
║  COSMO® age:               748  (Year 2 · born July 1, 2024)    ║
║  Founded:          7 April 2016                                 ║
╚══════════════════════════════════════════════════════════════════╝
```

---

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║      L · O · T     S Y S T E M S     C O R P O R A T I O N      ║
║                                                                  ║
║              LOT-WIKI-v78 · Field Manual v96                     ║
║              July 19, 2026 · Day 1056+ · COSMO® Year 2          ║
║                                                                  ║
║         Authorized: S-2 // VADIK MARMELADOV                      ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

*LOT-WIKI-v78 · Layers of Time · Field Manual Sync v96 · 2026-07-19*
*Next: LOT-WIKI-v79 — sync to Field Manual v97+*
