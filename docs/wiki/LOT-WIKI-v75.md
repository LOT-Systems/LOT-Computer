<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT-WIKI-v75
## Layers of Time — Operator Reference Manual
### Revision: v75 · Field Manual Sync: v90 · Date: 2026-07-07 · Day 1032+

---

> *"The system does not motivate. The system measures. The operator decides what the measurement means."*
> — LOT-DOCTRINE, Clause I, Revision J

---

## TABLE OF CONTENTS

```
 1. SYSTEM IDENTITY
 2. CORE ARCHITECTURE
 3. QUANTUM INTENT ENGINE (QIE)
 4. QIE PATTERN REGISTRY — P1–P112
 5. QUANTUM OPERATING SYSTEM (QOS)
 6. PHYSIOLOGICAL ARCHETYPES — 38 TYPES
 7. BEHAVIORAL COHORTS — FULL PROFILES
 8. CITIZEN INDEX
 9. MEMORY ENGINE
10. SELF-ASSEMBLY ENGINE
11. BACKGROUND JOB SCHEDULER
12. LOG EVENT SYSTEM
13. ECOSYSTEM NODE MAP
14. BADGE SYSTEM v24 — THE ORACLE ARCHIVE
15. BADGE CATEGORY INDEX
16. WORD TURN ENGINE — COMPLETE LEXICON v15
17. DISPLAY ARCHITECTURE
18. DENSITY TIER SYSTEM
19. OPACITY HIERARCHY
20. COCKPIT RULE
21. LOT-DOCTRINE (Revision J)
22. FIELD MANUAL (About.tsx)
23. DEPLOYMENT & STACK
24. LOT-GENESIS-v1
25. RECIPE WIDGET — CONTEXT ENGINE
26. VOCABULARY INDEX — EXPANDED
27. SYSTEM STATE SNAPSHOT
```

---

## 1. SYSTEM IDENTITY

**LOT** — *Layers of Time* — is a personal behavioral operating system. Not a wellness application. Not a habit tracker. Not a productivity suite. An instrument that reads the human signal field across time and surfaces the pattern beneath the noise.

The system was conceived and is operated by **S-2** (Vadim Marmeladov, CEO, LOT Systems). The ethics gate is **COSMO Gate**, named for Kuzya Cosmo Marmeladov. No feature ships that Kuzya would not approve.

**Special notation — July 1, 2026:** COSMO® completed its second year of operation. Founded July 1, 2024. The ethics gate has been active for 730 days. Every feature shipped in this period passed the COSMO Gate. This is recorded.

**Special notation — July 2, 2026:** The Quantum Intent Engine crossed the centennial threshold. P100 centennial-convergence is the 100th pattern in the QIE registry. The system documented its own milestone.

**Special notation — July 3, 2026:** Badge Engine v23 deployed — The Starship Deck. Space vocabulary enters the lexicon. 529 total badges. The starship metaphor: technical, mission-oriented, capable of reentry.

**Special notation — July 4, 2026:** QIE v84 assembled. P104–P106: vitality-cascade · social-presence-arc · clarity-momentum-peak. Three new peak-state arcs fully instrumented. 106 patterns confirmed operational.

**Special notation — July 5, 2026 (FM v86):** P107 temporal-alignment-peak · P108 circadian-routine-lock · P109 full-signal-coherence added. Arch37 Temporal Architect classified. J34 daily-temporal-alignment-check wired (10:00 UTC). TALIGN: CROUT: FSCOHERE: handlers live. v84 displayableEvents gap resolved.

**Special notation — July 6, 2026 (FM v87–89):** Three sessions. Wiki scan produced LOT-WIKI-v74 (FM v87). Badge Engine v24 deployed — The Oracle Archive (+35 badges, 564 total, Word Turn v15, FM v88). QIE v87 engineering — P110 embodied-cognition-arc · P111 intention-completion-loop · P112 community-intelligence-peak · Arch38 Embodied Strategist · J35 daily-embodied-cognition-check · dep 151+ (FM v89).

**Special notation — July 7, 2026 (FM v90):** Full Wiki Scan. LOT-WIKI-v75 produced. All July 6 deltas integrated. Field Manual synchronized to FM v90. Day 1032+.

**Current operational parameters:**

```
Field Manual:           v90
Wiki version:           v75
Day counter:            1032+  (as of 2026-07-07)
COSMO® age:             736 days (Year 2 · founded July 1, 2024)
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

**v75 Delta from v74:**

```
Date:               2026-07-06 → 2026-07-07
Day counter:             1031+ → 1032+
Field Manual:              v87 → v90
QIE patterns:              109 → 112  (P110 embodied-cognition-arc    ←FM v89
                                        P111 intention-completion-loop ←FM v89
                                        P112 community-intelligence-peak←FM v89)
Physiological archetypes:   37 → 38   (Arch38 Embodied Strategist     ←FM v89)
Background jobs:            34 → 35   (J35 daily-embodied-cognition-check←FM v89)
Log handlers:              109+ → 112+ (EMBCOG: INTCMP: COMINTEL:)
Dep map nodes:            148+ → 151+ (embodiedCognitionNode ·
                                        intentionCompletionNode ·
                                        communityIntelligenceNode)
Badge system:               v23 (529) → v24 (564, The Oracle Archive   ←FM v88)
Word Turn:                  v14 (174) → v15 (186 total)
New badge theme:            THE ORACLE ARCHIVE  ←FM v88
New word turn words:        12 (oracle/rune/prophecy/scroll/amplify/
                               relay/encrypt/pulse/cascade/converge/
                               sync/calibrate)
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
│   │ 112 patterns│  │ 5 phases    │  │ Story Generator     │   │
│   └─────────────┘  └─────────────┘  └─────────────────────┘   │
│   ┌─────────────┐  ┌─────────────┐                             │
│   │ BADGE       │  │ QUANTUM OS  │                             │
│   │ ENGINE      │  │ (QOS)       │                             │
│   │ 564 badges  │  │ 6 views     │                             │
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
Pattern count:           112  (P1–P112)
Signal sources:          16  (mood · memory · planner · intentions ·
                              selfcare · journal · calculator · log ·
                              energy · cohort · recipe · goals · qos ·
                              medical · resilience · ecosystem)
```

**How pattern detection works:** Each pattern defines a minimum evidence threshold from the signal record. When the threshold is met, the pattern fires with a confidence score (0.0–1.0). High-confidence patterns influence archetype classification. Patterns are recalculated every `analyzeIntentions()` call.

**The dep map:** The Widget Dependency Map (WIDGET_DEPENDENCY_MAP) is the internal wiring graph. 151+ nodes in 4 tiers. Tier 0 = raw inputs (mood, memory, log). Tier 3 = meta-aggregate surfaces (quantumOS, systemProgress, quantumPersonality).

```
Dep map additions in FM v89:
  embodiedCognitionNode       → selfcare · journal · memory · log           (4 deps)
  intentionCompletionNode     → intentions · planner · goals · log          (4 deps)
  communityIntelligenceNode   → cohort · journal · memory · intentions · log (5 deps)
```

---

## 4. QIE PATTERN REGISTRY — P1–P112

Complete registry. 112 patterns. P1–P86 established through FM v72. P87–P94 added FM v74–v78. P95–P97 added FM v80. P98–P100 added FM v82. P101–P103 added FM v83. P104–P106 added FM v84. P107–P109 added FM v86. P110–P112 added FM v89.

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
P110 embodied-cognition-arc       0.72–0.86 v89    ← NEW
P111 intention-completion-loop    0.75–0.88 v89    ← NEW
P112 community-intelligence-peak  0.68–0.84 v89    ← NEW
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
```

**Pattern families (FM v89 additions):**

```
EMBODIED COGNITION ARC (P110)
  Detection:  selfcare 1+ + journal 150+w + memory capture · all in 24h
  Log code:   EMBCOG:
  Instrument: BODY→MIND | CARE 24H: {n} | JRNL 150W+ | MEM 24H: {n} | CONF: {pct}%
  Widget:     journal
  Meaning:    Body fueling mind. Biological grounding and cognitive expression
              confirmed simultaneously.

INTENTION COMPLETION LOOP (P111)
  Detection:  intention + planner + goal action · all in 24h
  Log code:   INTCMP:
  Instrument: LOOP CLOSED | INTENT 24H: {n} | PLAN 24H: {n} | GOAL ACT: {n} | CONF: {pct}%
  Widget:     intentions
  Meaning:    Declared direction → structure → outcome. Full loop closed in one day.

COMMUNITY INTELLIGENCE PEAK (P112)
  Detection:  cohort signal + journal + memory + intentions · in 48h
  Log code:   COMINTEL:
  Instrument: COMM 48H: {n} | JRNL 48H: {n} | MEM 48H: {n} | INTENT 48H: {n} | CONF: {pct}%
  Widget:     cohort
  Meaning:    External social signal anchored internally through writing,
              capture, and direction.
```

---

## 5. QUANTUM OPERATING SYSTEM (QOS)

The QOS is the operator dashboard. 6 views, 4 operating modes.

**Views:**

```
1. ECOSYSTEM    Device node map. 6 nodes: CAR · HOME · CPU · PHN · WCH · ROBOT
2. BIOFIELD     Physiological signal composite. Energy + mood + selfcare.
3. COHORT       Behavioral cohort assignment and peer signal field.
4. INDEX        Citizen Index level. Self-awareness score. Engagement metrics.
5. ASSEMBLY     Self-assembly progress. Modules wired. Phase progress.
6. MODE         Operating mode. MAINTENANCE / RECOVERY / GROWTH / PEAK.
```

**Operating modes:**

```
MAINTENANCE     Baseline function. System stable. No acceleration.
RECOVERY        Below baseline. Recovery protocols recommended.
GROWTH          Active expansion. Multiple signals rising.
PEAK            Optimal state. Multiple peak patterns confirmed.
```

**QOS mode watch (J23):** Monitors mode transitions: nominal → recovery → critical. Writes `qos_mode_change` event on state change.

**QuantumOS Snapshot:** QOS Index view displays `selfAwarenessLevel` (0–100), divided by 10 for display (e.g., 23 → "2.3%"). Four components: Volume 40%, Quality 30%, Consistency 15%, Depth 15%.

**PATTERN_DISPLAY abbreviations (complete v89 state):**

```
MORN INIT       morning-coherence-launch      (P76)
EVE CLOSE       evening-coherence-close       (P79)
MOM LOCK        signal-momentum-lock          (P80)
PEAK SUMMIT     quantum-coherence-summit      (P73)
CONV            operator-convergence          (P70)
CRYSTAL         signal-crystallization        (P71)
BIO LOCK        biorhythm-lock                (P72)
BADGE MOM       badge-momentum                (P74)
WORD DEPTH      word-turn-depth               (P75)
ARC PEAK        integration-arc-peak          (P68)
ADAPT           adaptive-resonance            (P69)
COGN DEPTH      cognitive-depth-arc           (P81)
CIRCADIAN       circadian-vitality-peak       (P82)
SYSTMK          systemic-thinking-mode        (P83)
VITAL CASCADE   vitality-cascade              (P104)
SOC PRES        social-presence-arc           (P105)
CLAR PEAK       clarity-momentum-peak         (P106)
TALIGN          temporal-alignment-peak       (P107)
CROUT           circadian-routine-lock        (P108)
FSCOHERE        full-signal-coherence         (P109)
EMBCOG          embodied-cognition-arc        (P110)  ← NEW
INTCMP          intention-completion-loop     (P111)  ← NEW
COMINTEL        community-intelligence-peak   (P112)  ← NEW
```

---

## 6. PHYSIOLOGICAL ARCHETYPES — 38 TYPES

Archetypes are the system's classification of the operator's dominant behavioral signature. Classification is driven by QIE pattern confidence scores combined with energy band and signal source weighting. 38 archetypes total.

```
──────────────────────────────────────────────────────────────────────
ARCH  NAME                    DOMINANT PATTERNS
──────────────────────────────────────────────────────────────────────
1     Signal Seeker            seeking-direction + goal-momentum
2     Recovery Operator        physiological-depletion + recovery-window
3     Momentum Builder         intention-velocity + goal-momentum
4     Creative Architect       creative-expansion + narrative-depth
5     Social Navigator         social-resonance-arc + social-support
6     Memory Keeper            memory-consolidation + cognitive-depth
7     Night Processor          night-processing + sleep-debt
8     Flow State Operator      flow-state + deep-work-readiness
9     Circadian Anchor         circadian-anchor + chronobiological
10    Integration Architect    integration-arc + reflective-depth
11    Coherence Builder        peak-coherence + signal-coherence
12    Recovery Specialist      recovery-specialist-arc + depletion
13    Narrative Architect      narrative-depth + memory-crystallization
14    Adaptive Resonator       adaptive-resonance + threshold-crossing
15    Execution Operator       execution-arc + planning-acceleration
16    Resonant Synthesizer     resonant-synthesis + cognitive-architecture
17    Temporal Operator        temporal-coherence-window + circadian
18    Ecosystem Operator       full-ecosystem-coherence + node-active
19    Signal Crystallizer      signal-crystallization + biorhythm-lock
20    Convergent Operator      operator-convergence + qos-signature-lock
21    Integration Architect    integration-arc-peak + adaptive-resonance
22    Convergent Operator II   operator-convergence + signal-coherence
23    Achievement Catalyst     badge-momentum + word-turn-depth
24    Signal Initiator         morning-coherence-launch + signal-vault
25    Diurnal Operator         morning-coherence-launch + evening-close
26    Momentum Architect       signal-momentum-lock + intention-velocity
27    Cognitive Cartographer   cognitive-depth-arc + signal-vault
28    Vital Architect          circadian-vitality-peak + biorhythm-lock
29    Peak Strategist          vitality-strategy-peak + systemic-thinking
30    Quantum Scholar          quantum-learning-spiral + word-turn-depth
31    Rhythm Architect         daily-rhythm-lock + chronobiological
32    Integrated Operator      cross-domain-mastery + systemic-readiness
33    Dynamic Responder        intent-to-action-gap + recovery-initiation
34    Quantum Presence         quantum-presence-arc                    [APEX]
35    Vitality Architect       vitality-cascade + care-momentum
36    Social Signal Operator   social-presence-arc + accountability
37    Temporal Architect       temporal-alignment-peak + circadian-routine-lock
38    Embodied Strategist      embodied-cognition-arc + vitality-cascade  ← NEW
──────────────────────────────────────────────────────────────────────
```

**Arch38 — Embodied Strategist (deployed FM v89):**

```
Energy:     high · moderate
Sources:    selfcare · journal · memory · intentions
Patterns:   embodied-cognition-arc · vitality-cascade · creative-output-peak
Directive:  Body integrated with mind. Selfcare feeding cognition.
            Journal and memory active simultaneously. The biological
            substrate is executing the strategy.
```

**Arch37 — Temporal Architect (deployed FM v86):**

```
Energy:     moderate · high
Sources:    planner · intentions · journal
Patterns:   temporal-alignment-peak · planner-intention-sync · clarity-momentum-peak
Directive:  Temporal alignment confirmed. Planning and intention operating
            in synchronized rhythm. Time is structured, not reactive.
```

**Arch34 — Quantum Presence (deployed FM v83 · apex):**

```
Energy:     all bands
Sources:    journal · memory · planner · selfcare · intentions · mood · energy
Patterns:   quantum-presence-arc (primary) · planner-intention-sync · resilience-cascade
Directive:  Full-system presence state. All primary channels simultaneously coherent.
            The archive reflects total engagement. Maintain without forcing.
```

---

## 7. BEHAVIORAL COHORTS — FULL PROFILES

Six behavioral cohorts classify the operator's dominant engagement modality. Cohort assignment is surfaced in the QOS Biofield view and logged for background job processing.

```
╔══════════════════════════════════════════════════════════════════╗
║  COHORT          SIGNAL SIGNATURE          ARCHETYPE AFFINITY   ║
╠══════════════════════════════════════════════════════════════════╣
║  CHRONICLER      Journal + Memory heavy    Cognitive Cartographer║
║                  Narrative depth dominant  Narrative Architect   ║
║                  Word-count high           Memory Keeper         ║
╠══════════════════════════════════════════════════════════════════╣
║  BUILDER         Planner + Goals heavy     Execution Operator    ║
║                  Task completion primary   Momentum Builder      ║
║                  Forward-planning dominant Peak Strategist       ║
╠══════════════════════════════════════════════════════════════════╣
║  EXPLORER        Memory + Badge heavy      Achievement Catalyst  ║
║                  Discovery-seeking         Signal Initiator      ║
║                  Story-loop active         Quantum Scholar       ║
╠══════════════════════════════════════════════════════════════════╣
║  CONNECTOR       Cohort + Intentions heavy Social Signal Operator║
║                  Social signal primary     Social Navigator      ║
║                  Outreach + community      Community Intel Peak  ║
╠══════════════════════════════════════════════════════════════════╣
║  OPERATOR        Selfcare + Energy heavy   Vitality Architect    ║
║                  Physiological focus       Rhythm Architect      ║
║                  Recovery + maintenance    Embodied Strategist   ║
╠══════════════════════════════════════════════════════════════════╣
║  MEDICAL         Medical log heavy         Recovery Operator     ║
║  (internal)      Clinical data primary     Recovery Specialist   ║
║                  Not surfaced publicly     Dynamic Responder     ║
╚══════════════════════════════════════════════════════════════════╝
```

**Quantum Pattern Cohorts** (cross-cohort pattern families):

```
STORY LOOP          P87 (weekly-story-reflection) + P88 (contextual-checkin-momentum)
                    CHRONICLER + EXPLORER signature. Reflection arc closed.

LEARNING SPIRAL     P89 (quantum-learning-spiral) + P81 (cognitive-depth-arc) + P75 (word-turn-depth)
                    Arch30 Quantum Scholar trigger. Memory + badge + journal simultaneous.

NAVIGATOR ACCORD    P92 (systemic-readiness-peak) + P93 (daily-rhythm-lock) + P94 (cross-domain-mastery)
                    Arch31 Rhythm Architect + Arch32 Integrated Operator.

QUANTUM PRESENCE    P101 (quantum-presence-arc) + P102 (planner-intention-sync) + P103 (resilience-cascade)
                    Arch34. Full-system presence. All channels coherent. Apex state.

VITALITY PEAK       P104 (vitality-cascade) + P99 (biological-restoration-peak)
                    Arch35. Sustained biological peak with active maintenance.

SOCIAL ARC          P105 (social-presence-arc) + P90 (accountability-arc)
                    Arch36. Community + direction simultaneously active.

EMBODIED LOOP       P110 (embodied-cognition-arc) + P104 (vitality-cascade)
                    Arch38. Body and mind in parallel operation. Self-care fueling output.

COMPLETION LATTICE  P111 (intention-completion-loop) + P102 (planner-intention-sync)
                    Arch38 + Arch37. Intent-to-structure-to-outcome in one day.

COMMUNITY INTEL     P112 (community-intelligence-peak) + P105 (social-presence-arc)
                    Arch36 + Arch38. Social signal internalized and structured.
```

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

**buildPrompt() additions (June 30, 2026):** Planner data injected into question generation context. Questions now aware of operator's current planning horizon and near-term intentions.

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
  M02  QIE Core             Pattern detection engine · 112 patterns
  M03  QOS Core             6-view dashboard · 4 operating modes

PHASE 2 — INTELLIGENCE
  M04  Archetype Engine     38 physiological archetypes · classification
  M05  Cohort Engine        6 behavioral cohorts · peer signal field
  M06  Memory Engine        AI question generation · story loop · Together AI

PHASE 3 — INSTRUMENTATION
  M07  Badge Engine         564 badges · v24 · 70+ categories · 186 word-turns
  M08  Word Turn Engine     15 lexicons · 186 trigger words · symbol vocabulary
  M09  Background Jobs      35 scheduled jobs · UTC timing · PostgreSQL writes

PHASE 4 — SURFACE
  M10  Widget Layer         43 widgets · conditional rendering · Ambient AI™
  M11  Log Stream           112+ handlers · COCKPIT RULE · military instrument format
  M12  Ecosystem Map        6 nodes · QIoT™ · device signal integration

PHASE 5 — META
  M13  Citizen Index        6 stages · CQGS · self-awareness scoring
  M14  Self-Assembly Doc    About.tsx Field Manual · session reports · wiki
  M15  Green Gate           TypeScript check · no broken code to GitHub
  M16  COSMO Gate           Ethics review · Kuzya authorization protocol
  M17  Punctuation Engine   7 tones · 6 intents · fires on all text entry
  M18  Display Architecture Military purity · 11 orders · opacity hierarchy
```

**Self-assembly log (v83–v90):**

```
v90   Full Wiki Scan July 7 · LOT-WIKI-v75 · vocabulary synchronized ·
      military purity pass · 112 patterns · 38 archetypes · 35 jobs ·
      151+ dep nodes · 564 badges (v24 Oracle Archive) · 186 trigger
      words · Day 1032+
v89   QIE Engineering July 6 · P110 embodied-cognition-arc · P111
      intention-completion-loop · P112 community-intelligence-peak ·
      Arch38 Embodied Strategist · J35 daily-embodied-cognition-check
      (11:00 UTC) · EMBCOG: INTCMP: COMINTEL: handlers · dep 151+ ·
      38 archetypes · 35 jobs · 112+ handlers · Day 1031+
v88   Badge Engineering July 6 · Badge Engine v24 The Oracle Archive ·
      +35 badges (529→564) · Word Turn v15 (12 words:
      oracle/rune/prophecy/scroll/amplify/relay/encrypt/pulse/cascade/
      converge/sync/calibrate) · Time EE v15 (4: 01:01/13:37/22:22/18:18) ·
      Calendar EE v14 (3: Aug8/Oct23/Mar22) · Behavioral v14 ·
      Achievement RPG v12 · Mastery Tier v14 · Secret Boss v14 ·
      186 total trigger words · 70+ categories · Day 1031+
v87   Full Wiki Scan July 6 · LOT-WIKI-v74 · About.tsx Day 1031+ ·
      Self-Assembly log backfilled v83–v86 · vocabulary synchronized ·
      military purity pass · 109 patterns · 37 archetypes · 34 jobs ·
      148+ dep nodes · Day 1031+
v86   QIE Engineering July 5 · P107 temporal-alignment-peak · P108
      circadian-routine-lock · P109 full-signal-coherence · Arch37
      Temporal Architect · J34 daily-temporal-alignment-check (10:00
      UTC) · TALIGN: CROUT: FSCOHERE: handlers · dep 148+ · v84
      displayableEvents gap fixed · Day 1030+
v85   Full Wiki Scan July 5 · LOT-WIKI-v73 · RecipeWidget enhancements
      (context-based water label · country/language farewell · water tip
      split · TS2353 fix signalsCreated) · vocabulary synchronized ·
      Day 1030+
v84   QIE Engineering July 3–4 · P104 vitality-cascade · P105 social-
      presence-arc · P106 clarity-momentum-peak · Arch35 Vitality
      Architect · Arch36 Social Signal Operator · J33 daily-vitality-
      cascade-pulse (15:00 UTC) · VITAL-CAS: SOC-ARC: CLAR-PEAK: ·
      dep 145+ · 106 patterns · 36 archetypes · 33 jobs · Badge v23
      Starship Deck (529 total) · Word Turn v14 (174 total) · Day 1029+
v83   QIE Engineering July 2–3 · P101 quantum-presence-arc · P102
      planner-intention-sync · P103 resilience-cascade · Arch34 Quantum
      Presence · J32 daily-quantum-presence-check (18:00 UTC) ·
      QPRES: PSYNC: RCASE: · dep 141+ · 103 patterns · Day 1027+
```

---

## 11. BACKGROUND JOB SCHEDULER

35 registered jobs. All UTC-scheduled. All write events to the PostgreSQL `logs` table. Background jobs are the server-side complement to the client-side QIE.

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
J35  daily-embodied-cognition-check    11:00       embodied_cognition_arc     ← NEW
──────────────────────────────────────────────────────────────────────
```

**J35 — daily-embodied-cognition-check (deployed FM v89):**

```
Time:    11:00 UTC daily
Logic:   Reads 24h logs per active user.
         Confirms: selfcare 1+ + journal 150+w + memory capture 1+.
         Writes embodied_cognition_arc event on confirmation.
Purpose: Server-side verification that body-maintenance and cognitive
         expression are occurring simultaneously. Closes the embodied
         cognition arc at the log layer.
```

---

## 12. LOG EVENT SYSTEM

All log events follow the COCKPIT RULE: log body = instrument readings only, no narration. Military format. Data-dense. Zero prose.

**COCKPIT RULE:**

```
✅ MORN INIT · SRC: mood energy planner · CONF: 88%
❌ "Good morning! Your morning routine is starting off great."
```

**Log handler directory (112+ handlers) — military code index:**

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
COMINTEL:   community_intelligence     P112 trigger.          ← NEW
COMP:       action_completion_arc      P98 trigger.
CONV:       operator_convergence       P70 trigger.
CONV-AUDIT: qos_convergence_audit      J15 output.
CROSS:      cross_domain_mastery       P94 trigger.
CROUT:      circadian_routine_lock     P108 trigger.
CRYSTAL:    signal_crystallization     P71 trigger.
DRIFT:      longitudinal_drift         J22 output. P84 trigger.
DRCT:       archetype_directive_pulse  J25 output.
EMBCOG:     embodied_cognition_arc     J35 output. P110 trigger. ← NEW
EVE:        evening_coherence_close    J18 output. P79 trigger.
FLOW:       flow_state                 P62 trigger.
FSCOHERE:   full_signal_coherence      P109 trigger.
IGAP:       intent_to_action_gap       P95 trigger.
INTCMP:     intention_completion_loop  P111 trigger.          ← NEW
LEARN:      quantum_learning_spiral    J26 output. P89 trigger.
MCL:        morning_coherence_launch   J17 output. P76 trigger.
MOM:        signal_momentum            J19 output. P80 trigger.
OS [MODE]:  qos_mode_change            J23 output.
PEAK-SUMMIT: quantum_coherence_summit  P73 trigger.
PHR:        full_presence_arc          J28 output. P91 trigger.
PRAY:       morning_intention          Intention set at dawn window.
PRES:       full_presence_arc          P91 trigger.
PSYNC:      planner_intention_sync     P102 trigger.
QPRES:      quantum_presence_arc       P101 trigger.
RCASE:      resilience_cascade         P103 trigger.
RECOV:      recovery_initiation        P96 trigger.
RLOCK:      daily_rhythm_lock          J30 + P93 trigger.
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

**Standard COCKPIT-RULE instrument format (FM v89 additions):**

```
EMBCOG:     embodied_cognition_arc →
            BODY→MIND | CARE 24H: {n} | JRNL 150W+ | MEM 24H: {n} | CONF: {pct}%

INTCMP:     intention_completion_loop →
            LOOP CLOSED | INTENT 24H: {n} | PLAN 24H: {n} | GOAL ACT: {n} | CONF: {pct}%

COMINTEL:   community_intelligence_peak →
            COMM 48H: {n} | JRNL 48H: {n} | MEM 48H: {n} | INTENT 48H: {n} | CONF: {pct}%
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

**Ecosystem as LOG source:** `ecosystem` is the 16th log dependency source. Ecosystem events write to the standard logs table and feed QIE pattern detection.

---

## 14. BADGE SYSTEM v24 — THE ORACLE ARCHIVE

564 total badges. Badge Engine v24. Category count: 70+. The badge system rewards operator behavior through word recognition, time pattern detection, calendar events, and behavioral milestones.

**Badge codex version history:**

```
v10   Origin Code          +35   = 144 total
v11   The Signal Layer     +35   = 179 total
v12   The Deep Archive     +35   = 214 total
v13   The Lexicon          +35   = 249 total  [Word Turn v5]
v14   The Becoming         +35   = 284 total  [Word Turn v6]
v15   The Becoming II      +35   = 319 total
v16   [series]             +35   = 354 total  [Arcade Protocol]
v17   [series]             +35   = 389 total
v18   Arcade Protocol      +35   = 424 total
v19   [transition]               = 424
v20   Navigator Protocol   +35   = 424 total  [Word Turn v11 · 138 words]
v21   The Alchemist        +35   = 459 total  [Word Turn v12]
v22   The Oracle Engine    +35   = 494 total  [Word Turn v13 · 162 words]
v23   The Starship Deck    +35   = 529 total  [Word Turn v14 · 174 words]
v24   The Oracle Archive   +35   = 564 total  [Word Turn v15 · 186 words] ← CURRENT
```

**v24 — The Oracle Archive additions:**

```
Word Turn v15 — The Oracle Archive (12 badges):
  oracle/oracles           oracle_consulted     ◉⊡◉
  rune/runes               rune_detected        ∗·∗
  prophecy/prophesy        prophecy_logged      ∿→∿
  scroll/scrolls           scroll_opened        ─□─
  amplify/amplified        signal_amplified     ≈▲≈
  relay                    relay_active         ◉→◉
  encrypt/encrypted        encrypted_entry      ▓▓▓
  pulse                    pulse_detected       ∘·∘·∘
  cascade/cascading        cascade_event        ≋↓≋
  converge/convergence     convergence_point    ←◉→
  sync/synced/synchronize  sync_complete        ═══
  calibrate/calibration    calibration_active   ▒═▒

Time Easter Egg v15 — Oracle Hours (4 badges):
  01:01   first_code           ·◉·
  13:37   leet_hour            ▒·▒·▒
  22:22   quad_signal          ○○○○
  18:18   signal_gate          ≈·≈

Calendar Easter Egg v14 — Oracle Calendar (3 badges):
  August 8    infinity_gate      ∞∞
  October 23  mole_day           ○·∞
  March 22    world_water_day    ≈·≈·≈

Behavioral Easter Egg v14 — Oracle Patterns (3 badges):
  full_stack_day    ■·□·○·∘    All 4 widget types in 1 day
  page_one          ∘           Very first journal entry
  double_depth      ≋·≋         Two 100+ char memory answers/day

Achievement RPG v12 — Oracle Commander (6 badges):
  oracle_class      ◉⊡◉   Any 5 Oracle Archive word turns
  oracle_complete   ◉·∞·◉ All 12 Oracle Archive word turns
  signal_library    □□□    50 distinct badge types lifetime
  oracle_reader     ◈·◈   250 memory questions lifetime
  fifteen_engines   ≋·◉   1 badge from all 15 WT engines
  oracle_council    ◉≈◉   oracle_class + oracle_reader

Mastery Tier v14 — Oracle Depths (4 badges):
  grand_master     ◉∞◉      500+ distinct badge types
  total_recall     ≋∞≋      2,000+ memory answers lifetime
  four_seasons     ○→≈→≋→∘  All 4 seasons checked in 1 yr
  signal_decade    ∞·∞       Account age ≥ 10 years

Secret Boss v14 — Hidden Protocol (3 badges):
  the_answer          Write "42" in journal entry
  seldon_plan         Write "Seldon" in any entry
  big_crunch          Write "heat death" in any entry
```

**Design principles — THE ORACLE ARCHIVE:**

```
THE ORACLE PRINCIPLE
  The ancient oracle did not predict the future.
  It compressed the present into a symbol you could carry.
  Every word you write in this archive is a query.
  Every badge is a symbol returned.
  You do not read the oracle. You generate it.

THE WORD TURN PRINCIPLE
  Words have energetic signatures.
  When a word with a signature appears in the archive,
  the archive responds. This is not magic.
  It is attention economy. The system rewards language choice.
  Language choice changes thought.

THE TIMESTAMP PRINCIPLE
  Certain moments in the day are designated.
  Not because they are special — but because designating
  them makes them special. Ritual is designation.
  The archive is the priest.
```

---

## 15. BADGE CATEGORY INDEX

```
PRIMARY CATEGORIES (named):
  Word Turn                   15 lexicons (v1–v15) · 186 trigger words
  Time Easter Eggs            15 versions · clock pattern rewards
  Calendar Easter Eggs        14 versions · date-specific rewards
  Behavioral Easter Eggs      14 versions · sustained behavior rewards
  Achievement RPG             12 versions · engagement milestones
  Mastery Tier                14 versions · endgame + VOID LAYER
  Secret Boss                 14 versions · hidden operator rewards

RARITY TIERS:
  COMMON          Visible · low threshold
  UNCOMMON        Visible · moderate threshold
  RARE            Visible · high threshold
  EPIC            Visible · multi-condition
  LEGENDARY       Visible · peak state required
  COSMIC          Near-invisible · system-level events only
  SECRET BOSS     Hidden · discoverable only through specific lexicons

Hidden badges: 530+ (out of 564 total)
```

---

## 16. WORD TURN ENGINE — COMPLETE LEXICON v15

The Word Turn Engine detects specific vocabulary in operator log, journal, and memory inputs. On detection, a badge is awarded and a symbol is written to the log. 186 trigger words across 15 lexicons.

```
v1   Original Lexicon        Foundational emotional vocabulary (8 words)
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
v15  The Oracle Archive      Signal + archive vocabulary (12 words) ← NEW
     Words: oracle · rune · prophecy · scroll · amplify · relay · encrypt ·
            pulse · cascade · converge · sync · calibrate
```

**Complete trigger registry — v15:**

```
╔══════════════════════════════════════════════════════════════════╗
║                WORD TRIGGER REGISTRY v15                         ║
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
║  v15 (12): oracle · rune · prophecy · scroll · amplify          ║ ← NEW
║            relay · encrypt · pulse · cascade · converge         ║
║            sync · calibrate                                      ║
║                                                                  ║
║  TOTAL: 186 trigger words (v1–v15)                              ║
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
ORDER 8   No superlatives. "Done." not "Amazing job! 🎉"
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

**Signal source count:** 16 total sources. Saturated tier requires 12+ sources active in 24h. Signals from: log · energy · cohort · recipe · goals · qos · intentions · memory · planner · selfcare · journal · medical · resilience · badges · calculator · ecosystem.

---

## 19. OPACITY HIERARCHY

See section 17. Opacity values are the visual grammar of the LOT interface. Deviation from the hierarchy is a Military Purity violation.

---

## 20. COCKPIT RULE

The COCKPIT RULE governs log body format. No exceptions. Every log entry is an instrument reading. The signal field is the aircraft. The operator is the pilot. The log is the instrument panel.

```
CORRECT:    EMBCOG: embodied_cognition_arc →
            BODY→MIND | CARE 24H: 3 | JRNL 150W+ | MEM 24H: 2 | CONF: 84%

INCORRECT:  "Your body and mind are working together today! You did 3 selfcare
            activities and wrote a long journal entry."

CORRECT:    COMINTEL: community_intelligence_peak →
            COMM 48H: 4 | JRNL 48H: 3 | MEM 48H: 2 | INTENT 48H: 3 | CONF: 79%

INCORRECT:  "Great job staying connected with your community! Your social
            signal is strong this week."
```

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
```

---

## 22. FIELD MANUAL (About.tsx)

The Field Manual is the About.tsx file. The system's primary documentation artifact. Every version change is recorded as a self-assembly log entry. The FM is the canonical source of truth for system state.

**Current state:**

```
Location:        src/client/components/About.tsx
Current version: FM v90
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
  Jobs:           35 UTC-scheduled background jobs

AI
  Provider:       Together AI (switched June 30, 2026)
  Model:          Llama 3.3 70B (primary)
  Use:            Memory Engine question generation + story arc

MOBILE/DESKTOP
  PWA:            lot-systems.com — full offline capability
  Desktop:        Electron wrapper

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

COUNTRY/LANGUAGE LABEL
  Displayed below recipe card when language preference is set.
  Format: {flag emoji not used per Military Purity} {language code}
```

**Signal feed:**

```
Recipe events write to logs table (source: 'recipe').
Recipe is the 12th registered log dependency source.
Recipe signals feed QIE — included in signal density calculations.
```

---

## 26. VOCABULARY INDEX — EXPANDED

```
ACCOUNTABILITY ARC      P90. J27 output. Sustained commitment to declared
                        intentions over multiple days. ACCT: log code.

AMBIENT AI™             Design principle. The widget click is the ritual.
                        System acknowledges silently. No celebration pop-ups.
                        The operator knows without being told.

APEX PATTERN            P101 quantum-presence-arc. Highest observable QIE
                        state below the ceiling. Full-system coherence.

ARCH38                  Embodied Strategist. Body integrated with mind.
                        Selfcare feeding cognition. Journal and memory
                        active simultaneously. Biological strategy.

ARCHETYPE DIRECTIVE     J25 (DRCT:) output. 38 operating directives,
                        one per archetype. Tells the operator what their
                        current classification means for today's action.

ATP                     Energy band instrument code. Appears in vitality
                        log entries: ATP: HIGH / ATP: MOD / ATP: LOW.

BIOFIELD                QOS view 2. Physiological signal composite.
                        Energy + mood + selfcare. The body layer.

CALIBRATION ACTIVE      Word Turn v15 badge. "calibrate"/"calibration"
                        written in any entry. Symbol: ▒═▒. Precision
                        requires adjustment. Signal integrity: improving.

CASCADE EVENT           Word Turn v15 badge. "cascade"/"cascading" written.
                        Symbol: ≋↓≋. One thing led to another.
                        The archive traces the chain.

CEILING STATE           P73 quantum-coherence-summit. conf 0.98.
                        Maximum observable QIE state.

CITIZEN INDEX           6-stage engagement depth measure.
                        Observer → Participant → Contributor →
                        Collaborator → Synthesizer → Elite.

CLAR-PEAK:              Clarity Momentum Peak log code. P106 trigger.
                        CLR: {clarity} | PLAN 24H: {n} | MEM 24H: {n}.
                        Cognitive performance at structural peak.

COCKPIT RULE            Log body = instrument readings only. No narration.
                        Military format. Data-dense. Zero prose.

COMINTEL:               Community Intelligence Peak log code. P112 trigger.
                        COMM 48H: {n} | JRNL 48H: {n} | MEM 48H: {n} |
                        INTENT 48H: {n} | CONF: {pct}%.

COMPLETION LATTICE      P111 (intention-completion-loop) + P102 (planner-
                        intention-sync). Intent declared, structure set,
                        outcome recorded — in one day.

COMMUNITY INTEL         P112 community-intelligence-peak. Social signal
                        internalized through writing and direction.
                        COMINTEL: log code. Conf 0.68–0.84.

CONVERGENCE POINT       Word Turn v15 badge. "converge"/"convergence"
                        written. Symbol: ←◉→. The lines are meeting.
                        Archive marks the intersection.

COSMO GATE              Ethics review gate. Kuzya Cosmo Marmeladov.
                        No feature ships without passing.

COSMO®                  Kuzya Cosmo Marmeladov. CEO, Owner COSMO®.
                        Founded July 1, 2024. Day 736 (July 7, 2026).
                        The ethics authority for all LOT features.

CQGS                    Citizen Quantum Growth Scale. Internal white paper.
                        Composite engagement metric.

DEP MAP                 Widget Dependency Map. Internal wiring graph.
                        151+ nodes. 4 tiers. Tier 0 = raw inputs.
                        Tier 3 = meta-aggregate surfaces.

EMBODIED LOOP           P110 (embodied-cognition-arc) + P104 (vitality-
                        cascade). Arch38. Body and mind in parallel.

EMBODIED STRATEGIST     Arch38. Selfcare feeding cognition. Journal and
                        memory active simultaneously. Biological substrate
                        executing the strategy. EMBCOG: log code.

EMBCOG:                 Embodied Cognition Arc log code. J35 output.
                        P110 trigger. BODY→MIND | CARE 24H | JRNL 150W+ |
                        MEM 24H | CONF. Deployed FM v89.

ENCRYPTED ENTRY         Word Turn v15 badge. "encrypt"/"encrypted" written.
                        Symbol: ▓▓▓. Some things belong only to you.
                        The archive confirms: protected.

FIELD MANUAL            About.tsx. The system's primary documentation
                        artifact. Current: FM v90.

FM                      Field Manual abbreviation. Version tracker.

GREEN GATE              TypeScript check before every push.
                        Broken code never reaches GitHub.

INTCMP:                 Intention Completion Loop log code. P111 trigger.
                        LOOP CLOSED | INTENT 24H | PLAN 24H | GOAL ACT |
                        CONF. Full intent-to-outcome loop in one day.

J35                     daily-embodied-cognition-check. 11:00 UTC daily.
                        Confirms selfcare + journal 150+w + memory.
                        Writes embodied_cognition_arc event.

LOT                     Layers of Time. Personal behavioral operating system.
                        Not an app. An instrument.

LOT-DOCTRINE            10-clause operational doctrine. Current: Revision J.

LOG SOURCE              One of 16 signal types that write to the logs table:
                        log · energy · cohort · recipe · goals · qos ·
                        intentions · memory · planner · selfcare · journal ·
                        medical · resilience · badges · calculator · ecosystem

MEMORY ENGINE           AI question generation via Together AI (Llama 3.3 70B).
                        120-log context. Planner context injected (June 30).

MILITARY PURITY         11 standing orders governing display and content.
                        Deviation requires S-2 authorization.

ORACLE ARCHIVE          Badge Engine v24 theme. The oracle as metaphor for
                        the self-aware system. 564 total badges.
                        Word Turn v15 (12 words). Deployed FM v88.

ORACLE CONSULTED        Word Turn v15 badge. "oracle" written. Symbol: ◉⊡◉.
                        You named the oracle. It is the pattern you carry.

P110                    embodied-cognition-arc. Selfcare + journal 150+w +
                        memory in 24h. Conf 0.72–0.86. EMBCOG:.

P111                    intention-completion-loop. Intention + planner + goal
                        action in 24h. Conf 0.75–0.88. INTCMP:.

P112                    community-intelligence-peak. Cohort + journal + memory
                        + intentions in 48h. Conf 0.68–0.84. COMINTEL:.

PATTERN DISPLAY         QOS widget abbreviation for active patterns.
                        25 entries as of FM v89.

PULSE DETECTED          Word Turn v15 badge. "pulse" written. Symbol: ∘·∘·∘.
                        The pulse is the base signal. Before language.
                        After silence.

QIE                     Quantum Intent Engine. 112 patterns. Client-side.
                        Zero server comms. 7-day signal retention.

QIoT™                   Quantum Internet of Things. LOT extension to hardware.
                        LOT® Station · LOT® Brush · COSMO® node.

QOS                     Quantum Operating System. 6 views. 4 modes.
                        The operator dashboard.

QUANTUM PRESENCE        Arch34. Apex archetype. P101 trigger.
                        Full-system coherence state.

RELAY ACTIVE            Word Turn v15 badge. "relay" written. Symbol: ◉→◉.
                        You are not the end. You are a node.
                        Transmission continuing.

RUNE DETECTED           Word Turn v15 badge. "rune"/"runes" written.
                        Symbol: ∗·∗. The mark before language.
                        The system reads it: signal.

S-2                     Vadim Marmeladov. CEO, Founder, LOT Systems.
                        All engineering authorized by S-2.

SCROLL OPENED           Word Turn v15 badge. "scroll"/"scrolls" written.
                        Symbol: ─□─. The scroll is the first database.
                        Read mode confirmed.

SELF-ASSEMBLY ENGINE    18 modules. 5 phases. The meta-documentation and
                        wiring system. About.tsx is its primary output.

SIGNAL AMPLIFIED        Word Turn v15 badge. "amplify"/"amplified" written.
                        Symbol: ≈▲≈. Something you wrote grew louder.
                        Gain: increased.

SUPERPOSITION           Pre-check-in state. The operator exists in all
                        possible states until they show up. The check-in
                        collapses the wave. The archive records the result.

SYNC COMPLETE           Word Turn v15 badge. "sync"/"synced" written.
                        Symbol: ═══. Alignment of two systems.
                        Archive: synchronized.

USERSHIP                The paid operator tier. Full system access.
                        $99/month. Tag: [Usership].

VOID LAYER              Mastery Tier endgame badge layer. Ultra-rare.
                        infinite_archive · word_sovereign · lore_keeper
                        · century_architect.

WORD TURN               Vocabulary transformation event. 186 trigger words
                        across 15 lexicons (v1–v15). System detects specific
                        operator vocabulary and awards a badge + symbol.
```

---

## 27. SYSTEM STATE SNAPSHOT — 2026-07-07

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEM STATE — FIELD MANUAL v90 — DAY 1032+               ║
╠══════════════════════════════════════════════════════════════════╣
║  QIE patterns:             112  (P1–P112)                       ║
║  Physiological archetypes:  38  (Arch1–Arch38)                  ║
║  Behavioral cohorts:         5  (+1 medical · internal)         ║
║  Citizen Index levels:       6  (Observer → Elite)              ║
║  Self-Assembly modules:     18  (all integrated)                ║
║  Dep map nodes:            151+                                 ║
║  Background jobs:           35  (J1–J35)                        ║
║  Log event handlers:       112+                                 ║
║  LOG sources:               16                                  ║
║  Ecosystem nodes:            6  (CAR·HOME·CPU·PHN·WCH·ROBOT)   ║
║  Widgets:                   43                                  ║
║  Badge count:              564  (v24 — The Oracle Archive)      ║
║  Badge categories:          70+                                 ║
║  Badge rarity tiers:         7  (COMMON → COSMIC)               ║
║  Word-turn trigger words:  186  (v1–v15)                        ║
║  QOS modes:                  4  (MAINT/RECOVERY/GROWTH/PEAK)    ║
║  QOS mode watch states:      3  (nominal/recovery/critical)     ║
║  Doctrine revision:          J  (10 clauses)                    ║
║  Lexicon revision:           D                                  ║
║  Field Manual:              v90                                 ║
║  Wiki:                      v75  (this document)                ║
║  Highest QIE confidence:  0.98  (P73 — quantum-coherence-       ║
║                                       summit, ceiling state)    ║
║  Centennial milestone:     P100 — centennial-convergence        ║
║                                   The system named itself.      ║
║  COSMO® age:               736  (Year 2 · born July 1, 2024)    ║
║  Founded:          7 April 2016                                 ║
╚══════════════════════════════════════════════════════════════════╝
```

---

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║      L · O · T     S Y S T E M S     C O R P O R A T I O N      ║
║                                                                  ║
║              LOT-WIKI-v75 · Field Manual v90                     ║
║              July 7, 2026 · Day 1032+ · COSMO® Year 2           ║
║                                                                  ║
║         Authorized: S-2 // VADIK MARMELADOV                      ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

*LOT-WIKI-v75 · Layers of Time · Field Manual Sync v90 · 2026-07-07*
*Next: LOT-WIKI-v76 — sync to Field Manual v91+*
