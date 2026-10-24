<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT-WIKI-v72
## Layers of Time — Operator Reference Manual
### Revision: v72 · Field Manual Sync: v84 · Date: 2026-07-04 · Day 1029+

---

> *"The system does not motivate. The system measures. The operator decides what the measurement means."*
> — LOT-DOCTRINE, Clause I, Revision J

---

## TABLE OF CONTENTS

```
 1. SYSTEM IDENTITY
 2. CORE ARCHITECTURE
 3. QUANTUM INTENT ENGINE (QIE)
 4. QIE PATTERN REGISTRY — P1–P106
 5. QUANTUM OPERATING SYSTEM (QOS)
 6. PHYSIOLOGICAL ARCHETYPES — 36 TYPES
 7. BEHAVIORAL COHORTS — FULL PROFILES
 8. CITIZEN INDEX
 9. MEMORY ENGINE
10. SELF-ASSEMBLY ENGINE
11. BACKGROUND JOB SCHEDULER
12. LOG EVENT SYSTEM
13. ECOSYSTEM NODE MAP
14. BADGE SYSTEM v23 — THE STARSHIP DECK
15. BADGE CATEGORY INDEX
16. WORD TURN ENGINE — COMPLETE LEXICON v14
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

**Special notation — July 1, 2026:** COSMO® completed its second year of operation. Founded July 1, 2024. The ethics gate has been active for 730 days. Every feature shipped in this period passed the COSMO Gate. This is recorded.

**Special notation — July 2, 2026:** The Quantum Intent Engine crossed the centennial threshold. P100 (centennial-convergence) is the 100th pattern in the QIE registry. The system documented its own milestone. The archive holds the reading.

**Special notation — July 3, 2026:** Badge Engine v23 deployed — The Starship Deck. Space vocabulary enters the lexicon. 529 total badges. The starship metaphor: technical, mission-oriented, capable of reentry.

**Special notation — July 4, 2026:** QIE v84 assembled. P104 vitality-cascade, P105 social-presence-arc, P106 clarity-momentum-peak. Three new peak-state arcs fully instrumented. 106 patterns confirmed operational.

**Current operational parameters:**

```
Field Manual:           v84
Wiki version:           v72
Day counter:            1029+  (as of 2026-07-04)
COSMO® age:             733 days (Year 2 · founded July 1, 2024)
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

**v72 Delta from v71:**

```
Date:               2026-07-03 → 2026-07-04
Day counter:             1028+ → 1029+
Field Manual:              v83 → v84
QIE patterns:              103 → 106  (P104 vitality-cascade        ←v84
                                        P105 social-presence-arc     ←v84
                                        P106 clarity-momentum-peak   ←v84)
Physiological archetypes:   34 → 36   (Arch35 Vitality Architect    ←v84
                                        Arch36 Social Signal Operator ←v84)
Background jobs:            32 → 33   (J33 daily-vitality-cascade-pulse ←v84)
Log handlers:              103+ → 106+ (VITAL-CAS: SOC-ARC: CLAR-PEAK:)
Dep map nodes:            142+ → 145+ (vitalityCascadeNode ·
                                        socialPresenceArcNode ·
                                        clarityMomentumNode)
Badge system:               v22 → v23 (The Starship Deck · 529 total ·
                                        Word Turn v14 · 12 new words ·
                                        bug fix: sputnik_signal rename)
Word Turn:                 v13 → v14  (Starship Deck · 12 new words ·
                                        174 total trigger words)
New PATTERN_DISPLAY:          — VIT CASCADE · SOC PRES · CLAR PEAK
New pattern families:         — VITALITY CASCADE (P104) ←v84
                              — SOCIAL PRESENCE ARC (P105) ←v84
                              — CLARITY MOMENTUM PEAK (P106) ←v84
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
│   │ 106 patterns│  │ 5 phases    │  │ Story Generator     │   │
│   └─────────────┘  └─────────────┘  └─────────────────────┘   │
│   ┌─────────────┐  ┌─────────────┐                             │
│   │ BADGE       │  │ QUANTUM OS  │                             │
│   │ ENGINE      │  │ (QOS)       │                             │
│   │ 529 badges  │  │ 6 views     │                             │
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
Pattern count:           106  (P1–P106)
Signal sources:          16  (mood · memory · planner · intentions ·
                              selfcare · journal · calculator · log ·
                              energy · cohort · recipe · goals · qos ·
                              medical · resilience · ecosystem)
```

**How pattern detection works:** Each pattern defines a minimum evidence threshold from the signal record. When the threshold is met, the pattern fires with a confidence score (0.0–1.0). High-confidence patterns influence archetype classification. Patterns are recalculated every `analyzeIntentions()` call.

**The dep map:** The Widget Dependency Map (WIDGET_DEPENDENCY_MAP) is the internal wiring graph. 145+ nodes in 4 tiers. Tier 0 = raw inputs (mood, memory, log). Tier 3 = meta-aggregate surfaces (quantumOS, systemProgress, quantumPersonality).

```
Dep map additions in v84:
  vitalityCascadeNode    → energy · selfcare · mood · journal · log     (5 deps)
  socialPresenceArcNode  → cohort · intentions · journal · memory · log (5 deps)
  clarityMomentumNode    → planner · intentions · memory · energy · log (5 deps)
```

---

## 4. QIE PATTERN REGISTRY — P1–P106

Complete registry. 106 patterns. P1–P86 established through FM v72. P87–P94 added in FM v74–v78. P95–P97 added FM v80. P98–P100 added FM v82. P101–P103 added FM v83. P104–P106 added FM v84.

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
P104 vitality-cascade             0.78–0.90 v84    ← NEW
P105 social-presence-arc          0.70–0.85 v84    ← NEW
P106 clarity-momentum-peak        0.80–0.92 v84    ← NEW
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

**Pattern families (v84 additions):**

```
VITALITY CASCADE (P104)
  Detection:  energy=high + selfcare 3+ in 24h + positive mood + journal entry
  Log code:   VITAL-CAS:
  Instrument: ATP: {energyBand} | CARE 24H: {count} | CONF: {pct}%
  Widget:     selfcare
  Meaning:    Sustained peak vitality with active maintenance confirmed.

SOCIAL PRESENCE ARC (P105)
  Detection:  cohort signal 1+ + outreach 1+ + intention 1+ in 48h
  Log code:   SOC-ARC:
  Instrument: COHORT 48H: {count} | INTENT 48H: {count} | CONF: {pct}%
  Widget:     cohort
  Meaning:    Social dimension fully active. Signal going out.

CLARITY MOMENTUM PEAK (P106)
  Detection:  clarity=focused + planner 2+ + memory 2+ + intentions 2+ in 24h
  Log code:   CLAR-PEAK:
  Instrument: CLR: {clarity} | PLAN 24H: {count} | MEM 24H: {count} | CONF: {pct}%
  Widget:     memory
  Meaning:    Cognitive performance at structural peak. All three
              channels — planning, memory, intention — confirmed.
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

**PATTERN_DISPLAY abbreviations (v84 additions):**

```
VIT CASCADE     vitality-cascade          (P104) ← new
SOC PRES        social-presence-arc       (P105) ← new
CLAR PEAK       clarity-momentum-peak     (P106) ← new
```

---

## 6. PHYSIOLOGICAL ARCHETYPES — 36 TYPES

Archetypes are the system's classification of the operator's dominant behavioral signature. Classification is driven by QIE pattern confidence scores combined with energy band and signal source weighting. 36 archetypes total.

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
35    Vitality Architect       vitality-cascade + care-momentum        ← NEW
36    Social Signal Operator   social-presence-arc + accountability    ← NEW
──────────────────────────────────────────────────────────────────────
```

**Arch35 — Vitality Architect (deployed v84):**

```
Energy:     high + moderate
Sources:    selfcare · mood · energy
Patterns:   vitality-cascade · care-momentum · biological-restoration-peak · biorhythm-lock
Directive:  Sustained vitality confirmed. Selfcare momentum active at peak capacity.
            Protect recovery rhythms — this is peak maintenance mode.
```

**Arch36 — Social Signal Operator (deployed v84):**

```
Energy:     moderate + high
Sources:    cohort · intentions · journal
Patterns:   social-presence-arc · accountability-arc · social-resonance-arc · intention-velocity
Directive:  Social arc live. Community, connection, and direction all confirmed in 48h.
            The signal is going out. Anchor the response.
```

**Arch34 — Quantum Presence (deployed v83 · apex):**

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
║                  Outreach + community      Integrated Operator   ║
╠══════════════════════════════════════════════════════════════════╣
║  OPERATOR        Selfcare + Energy heavy   Vitality Architect    ║
║                  Physiological focus       Rhythm Architect      ║
║                  Recovery + maintenance    Vital Architect       ║
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
  M02  QIE Core             Pattern detection engine · 106 patterns
  M03  QOS Core             6-view dashboard · 4 operating modes

PHASE 2 — INTELLIGENCE
  M04  Archetype Engine     36 physiological archetypes · classification
  M05  Cohort Engine        6 behavioral cohorts · peer signal field
  M06  Memory Engine        AI question generation · story loop · Together AI

PHASE 3 — INSTRUMENTATION
  M07  Badge Engine         529 badges · v23 · 51+ categories · 174 word-turns
  M08  Word Turn Engine     14 lexicons · 174 trigger words · symbol vocabulary
  M09  Background Jobs      33 scheduled jobs · UTC timing · PostgreSQL writes

PHASE 4 — SURFACE
  M10  Widget Layer         43 widgets · conditional rendering · Ambient AI™
  M11  Log Stream           106+ handlers · COCKPIT RULE · military instrument format
  M12  Ecosystem Map        6 nodes · QIoT™ · device signal integration

PHASE 5 — META
  M13  Citizen Index        6 stages · CQGS · self-awareness scoring
  M14  Self-Assembly Doc    About.tsx Field Manual · session reports · wiki
  M15  Green Gate           TypeScript check · no broken code to GitHub
  M16  COSMO Gate           Ethics review · Kuzya authorization protocol
  M17  Punctuation Engine   7 tones · 6 intents · fires on all text entry
  M18  Display Architecture Military purity · 11 orders · opacity hierarchy
```

**Abbreviated self-assembly log (v73–v84):**

```
v84   QIE Engineering July 3 — P104 vitality-cascade · P105 social-presence-arc
      · P106 clarity-momentum-peak · Arch35 Vitality Architect · Arch36 Social
      Signal Operator · J33 daily-vitality-cascade-pulse (15:00) · VITAL-CAS:
      SOC-ARC: CLAR-PEAK: handlers · dep map 145+ · 106 patterns · 36 archetypes
      · 33 jobs · 106+ handlers · Badge v23 Starship Deck (529 total)
v83   QIE Engineering July 2 — P101 quantum-presence-arc · P102 planner-intention-sync
      · P103 resilience-cascade · Arch34 Quantum Presence · J32 (18:00)
      · QPRES: PSYNC: RCASE: handlers · dep map 142+ · 103 patterns · 32 jobs
v82   QIE Engineering July 2 — P98 action-completion-arc · P99 biological-restoration-peak
      · P100 centennial-convergence (milestone) · COMP: BRES: CENT: handlers
      · P100 indicator in QOS view · dep map 139+
v80   QIE Engineering July 1 — P95 intent-to-action-gap · P96 recovery-initiation
      · P97 cognitive-vitality-sync · Arch33 Dynamic Responder · J31 (02:00)
      · IGAP: RECOV: VSYNC: handlers · dep map 136+
v79   Full Wiki Scan July 1 — LOT-WIKI-v69 · COSMO® 2nd birthday · 94 patterns
v78   QIE Engineering June 30 — P92/P93/P94 · Arch31 Rhythm Architect · Arch32
      Integrated Operator · J28+J29+J30 · RLOCK: CROSS: SYSRDY: handlers
v77   Full Wiki Scan June 30 — LOT-WIKI-v68 · Badge Codex v20 Navigator Protocol
      (424 badges · 51 categories) · Word Turn v11 Navigator (138 words)
v76   Full Assembly June 29 — P89/P90/P91 · Arch30 Quantum Scholar · J26+J27
v75   Full Wiki Scan June 28 — LOT-WIKI-v67 · Story Loop family (P87+P88) · J24+J25
v74   QIE Engineering June 27 — P87 weekly-story-reflection · P88 contextual-checkin
      · Job 25 archetype-directive-pulse · STORY: + DRCT: handlers
v73   Full Wiki Scan June 27 — LOT-WIKI-v66 · cohort profiles · Word Turn v10
```

---

## 11. BACKGROUND JOB SCHEDULER

33 registered jobs. All UTC-scheduled. All write events to the PostgreSQL `logs` table. Background jobs are the server-side complement to the client-side QIE.

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
J33  daily-vitality-cascade-pulse      15:00       vitality_cascade          ← NEW
──────────────────────────────────────────────────────────────────────
```

**J33 — daily-vitality-cascade-pulse (deployed v84):**

```
Time:    15:00 UTC daily
Logic:   Reads 24h logs per active user.
         Confirms: high energy + 3+ selfcare acts + positive mood + journal entry.
         Writes vitality_cascade event on confirmation.
Purpose: Server-side verification of sustained vitality maintenance.
         Closes the vitality-cascade arc at the log layer.
```

---

## 12. LOG EVENT SYSTEM

All log events follow the COCKPIT RULE: log body = instrument readings only, no narration. Military format. Data-dense. Zero prose.

**COCKPIT RULE:**

```
✅ MORN INIT · SRC: mood energy planner · CONF: 88%
❌ "Good morning! Your morning routine is starting off great."
```

**Log handler directory (106+ handlers) — military code index:**

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
CLAR-PEAK:  clarity_momentum_peak      P106 trigger.          ← NEW
COGN:       cognitive_depth_arc        J20 output. P81 trigger.
COHR-COMM:  coherence_composite        J14 output. P68 composite.
COMP:       action_completion_arc      P98 trigger.
CONV:       operator_convergence       P70 trigger.
CONV-AUDIT: qos_convergence_audit      J15 output.
CROSS:      cross_domain_mastery       P94 trigger.
CRYSTAL:    signal_crystallization     P71 trigger.
DRIFT:      longitudinal_drift         J22 output. P84 trigger.
DRCT:       archetype_directive_pulse  J25 output.
EVE:        evening_coherence_close    J18 output. P79 trigger.
FLOW:       flow_state                 P62 trigger.
IGAP:       intent_to_action_gap       P95 trigger.
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
SOC-ARC:    social_presence_arc        P105 trigger.          ← NEW
STORY:      lot_ai_story               J24 output. P87 trigger.
SURGE:      depletion_recovery_surge   P78 trigger.
SYSRDY:     systemic_readiness_peak    P92 trigger.
SYSTMK:     systemic_thinking_mode     P83 trigger.
VAULT:      signal_vault               P77 trigger.
VITAL:      vitality_peak              J21 output. P82 trigger.
VITAL-CAS:  vitality_cascade           J33 output. P104 trigger. ← NEW
VSTRAT:     vitality_strategy_peak     P86 trigger.
VSYNC:      cognitive_vitality_sync    P97 trigger.
```

**Standard COCKPIT-RULE instrument format:**

```
VITAL-CAS:    vitality_cascade → ATP: {energyBand} | CARE 24H: {n} | CONF: {pct}%
SOC-ARC:      social_presence_arc → COHORT 48H: {n} | INTENT 48H: {n} | CONF: {pct}%
CLAR-PEAK:    clarity_momentum_peak → CLR: {clarity} | PLAN 24H: {n} | MEM 24H: {n} | CONF: {pct}%
QPRES:        quantum_presence_arc → SRC: {n} | CONF: {pct}% | CHANNELS: {list}
PSYNC:        planner_intention_sync → PLAN: {n} | INTENT: {n} | SYNC: confirmed
RCASE:        resilience_cascade → RECOV: {n} | ENERGY: {band} | CONF: {pct}%
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

**Ecosystem as LOG source:** `ecosystem` is the 16th log dependency source. Added FM v83. Ecosystem events write to the standard logs table and feed QIE pattern detection.

---

## 14. BADGE SYSTEM v23 — THE STARSHIP DECK

529 total badges. Badge Engine v23. Category count: 65+. The badge system rewards operator behavior through word recognition, time pattern detection, calendar events, and behavioral milestones.

**Badge codex version history:**

```
v10   Origin Code        +35   = 144 total
v11   The Signal Layer   +35   = 179 total
v12   The Deep Archive   +35   = 214 total
v13   The Lexicon        +35   = 249 total  [Word Turn v5]
v14   The Becoming       +35   = 284 total  [Word Turn v6]
v15   The Becoming II    +35   = 319 total
v16   [series]           +35   = 354 total  [Arcade Protocol]
v17   [series]           +35   = 389 total
v18   Arcade Protocol    +35   = 354→389→424 total
v19   [transition]              = 424
v20   Navigator Protocol +35   = 424 total  [Word Turn v11 · 138 words]
v21   The Alchemist      +35   = 459 total  [Word Turn v12]
v22   The Oracle Engine  +35   = 494 total  [Word Turn v13 · 162 words]
v23   The Starship Deck  +35   = 529 total  [Word Turn v14 · 174 words]  ← CURRENT
```

**v23 — The Starship Deck additions:**

```
Word Turn v14 — The Starship Deck (12 badges):
  launch/launched/launching    launch_confirmed     ↑·↑·◉
  mission/missions             mission_active       ◉→∞
  astronaut/astronauts         astronaut_mode       ○·∗·○
  capsule/capsules             capsule_entry        ─╗─
  telemetry                    telemetry_live       ▒·▒·▒
  countdown/countdowns         countdown_initiated  3·2·1
  reentry / re-entry           reentry_burn         ≋·∞·≋
  crew                         crew_signal          ○·○·○
  starship/starships           starship_mode        ≋→∞
  module/modules               module_locked        ╔·╗
  docking                      docking_complete     ◉=◉
  spacewalk/spacewalks         spacewalk_mode       ○·∗

Time Easter Egg v14 — Mission Control Hours (4 badges):
  07:07   lucky_pair           ∗·∗
  20:20   vision_year          ◎·◎
  02:22   binary_triple        ○·○·○
  15:45   signal_nine          ─∘─

Calendar Easter Egg v13 — Space Firsts (3 badges):
  April 12     gagarin_day        First human in space, 1961
  November 20  zarya_signal       ISS Zarya launch, 1998
  February 18  pluto_discovered   Pluto discovered, 1930

Behavioral v13 — Astronaut Patterns (3 badges):
  morning_mission      ∴·∴·∴    7 consecutive mornings before 09:00
  sustained_transmission ≋≋≋   250+ word journal 3 consecutive days
  rapid_orbit          ○→○→○    3 check-ins under 4 hours same day

Achievement RPG v11 — Mission Commander Class (6 badges)
Mastery Tier v13 — The Infinite Mission (4 badges)
Secret Boss v13 — Final Transmission (3 badges)

Bug fix: sputnik_signal rename
  first_signal key collision resolved. Calendar v9 Sputnik badge
  renamed sputnik_signal. Achievement RPG v3 first_signal unaffected.
```

---

## 15. BADGE CATEGORY INDEX

```
PRIMARY CATEGORIES (named):
  Word Turn                   14 lexicons (v1–v14) · 174 trigger words
  Time Easter Eggs            14 versions · clock pattern rewards
  Calendar Easter Eggs        13 versions · date-specific rewards
  Behavioral Easter Eggs      13 versions · sustained behavior rewards
  Achievement RPG             11 versions · engagement milestones
  Mastery Tier                13 versions · endgame + VOID LAYER
  Secret Boss                 13 versions · hidden operator rewards

RARITY TIERS:
  COMMON          Visible · low threshold
  UNCOMMON        Visible · moderate threshold
  RARE            Visible · high threshold
  EPIC            Visible · multi-condition
  LEGENDARY       Visible · peak state required
  COSMIC          Near-invisible · system-level events only
  SECRET BOSS     Hidden · discoverable only through specific lexicons

Hidden badges: 430+ (out of 529 total)
```

---

## 16. WORD TURN ENGINE — COMPLETE LEXICON v14

The Word Turn Engine detects specific vocabulary in operator log, journal, and memory inputs. On detection, a badge is awarded and a symbol is written to the log. 174 trigger words across 14 lexicons.

```
v1   Original Lexicon        Foundational vocabulary (8 words)
v2   Expansion               Extended vocabulary (8 words)
v3   Deep Archive            Introspective vocabulary (8 words)
v4   Nerd & Cosmic           Science + cosmic vocabulary (8 words)
v5   Signal Codex            Technical signal vocabulary (12 words)
v6   Becoming Lexicon        Growth + transformation vocabulary (12 words)
v7   [series]                (12 words)
v8   [series]                (12 words)
v9   Arcade Cabinet          Gaming vocabulary (12 words)
v10  Navigator               Navigation vocabulary (12 words)
     Words: drift · vector · bearing · waypoint · chart · magnetic
            · meridian · course · heading · landmark · navigate · compass
v11  Navigator (expanded)    Navigator Protocol (12 words)
v12  Alchemist Engine        Transformation vocabulary (12 words)
v13  Oracle Engine           Foresight vocabulary (12 words)
v14  Starship Deck           Space mission vocabulary (12 words)   ← NEW
     Words: launch · mission · astronaut · capsule · telemetry
            · countdown · reentry · crew · starship · module · docking · spacewalk
```

**Total trigger words by version:**

```
v1–v4:    ~32 words   (8 per lexicon)
v5–v14:   142 words   (12 per lexicon × 10 versions + v10 base)
Total:    174 words
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

**Signal source count:** 16 total sources. Saturated tier requires 12+ sources active in 24h — extremely rare. Signals from: log · energy · cohort · recipe · goals · qos · intentions · memory · planner · selfcare · journal · medical · resilience · badges · calculator · ecosystem.

---

## 19. OPACITY HIERARCHY

See section 17. Opacity values are the visual grammar of the LOT interface. Deviation from the hierarchy is a Military Purity violation.

---

## 20. COCKPIT RULE

The COCKPIT RULE governs log body format. No exceptions. Every log entry is an instrument reading. The signal field is the aircraft. The operator is the pilot. The log is the instrument panel.

```
CORRECT:    VITAL-CAS: vitality_cascade → ATP: HIGH | CARE 24H: 4 | CONF: 87%
INCORRECT:  "Your vitality is looking great today! You've done 4 selfcare activities."

CORRECT:    QPRES: quantum_presence_arc → SRC: 7 | CONF: 92% | CHANNELS: all
INCORRECT:  "You're in a state of quantum presence. All your channels are aligned."
```

**Log triggers:** Every significant operator action logs an event. Pattern fires, job outputs, badge awards, check-ins, story completions — all instrument readings. The log is the system's memory. The COCKPIT RULE keeps it readable.

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
Location:       src/client/components/About.tsx
Current version: FM v84
Lines:           4823+
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
  Jobs:           33 UTC-scheduled background jobs

AI
  Provider:       Together AI (switched June 30, 2026 from prior provider)
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

## 25. CUBIQ™ — THE QUANTUM CUBIC EXPERIENCE

CUBIQ™ is the LOT visual experience layer. A three-dimensional interface expression of the signal field. Still in documentation phase. The cubic metaphor: each face of the cube represents a different signal dimension. Rotation reveals hidden signal relationships.

**Current status:** Documented in FM v70. Interface specification in progress. Not yet deployed as interactive component.

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

ARCH35                  Vitality Architect. Sustained peak vitality with
                        active maintenance. Selfcare momentum confirmed.
                        Protection of recovery rhythms.

ARCH36                  Social Signal Operator. Social dimension fully
                        active. Community + connection + direction in 48h.

ARCHETYPE DIRECTIVE     J25 (DRCT:) output. 29 operating directives,
                        one per archetype. Tells the operator what their
                        current classification means for today's action.

ATP                     Energy band instrument code. Appears in vitality
                        log entries: ATP: HIGH / ATP: MOD / ATP: LOW.

BIOFIELD                QOS view 2. Physiological signal composite.
                        Energy + mood + selfcare. The body layer.

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

COSMO GATE              Ethics review gate. Kuzya Cosmo Marmeladov.
                        No feature ships without passing.

COSMO®                  Kuzya Cosmo Marmeladov. CEO, Owner COSMO®.
                        Founded July 1, 2024. 2nd birthday July 1, 2026.
                        The ethics authority for all LOT features.

CQGS                    Citizen Quantum Growth Scale. Internal white paper.
                        Composite engagement metric.

DEP MAP                 Widget Dependency Map. Internal wiring graph.
                        145+ nodes. 4 tiers. Tier 0 = raw inputs.
                        Tier 3 = meta-aggregate surfaces.

DRCT:                   Archetype Directive log code. J25 output.
                        ARCH: {name} | DIRECTIVE: {text}.

ECOSYSTEM               QOS view 1. 6 device nodes: CAR · HOME · CPU
                        · PHN · WCH · ROBOT. The 16th LOG source.

FIELD MANUAL            About.tsx. The system's primary documentation
                        artifact. Current: FM v84.

FM                      Field Manual abbreviation. Version tracker.

GREEN GATE              TypeScript check before every push.
                        Broken code never reaches GitHub.

IGAP:                   Intent-to-Action Gap log code. P95 trigger.
                        Gap between stated intention and observable action.

J33                     daily-vitality-cascade-pulse. 15:00 UTC daily.
                        Confirms high energy + selfcare + mood + journal.
                        Writes vitality_cascade event.

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

NAVIGATOR ACCORD        P92+P93+P94 family. Arch31+Arch32 trigger.
                        Systemic readiness + daily rhythm + cross-domain.

P104                    vitality-cascade. Energy=high + 3+ selfcare + mood
                        + journal in 24h. conf 0.78–0.90. VITAL-CAS:.

P105                    social-presence-arc. Cohort + outreach + intention
                        in 48h. conf 0.70–0.85. SOC-ARC:.

P106                    clarity-momentum-peak. Clarity=focused + planner 2+
                        + memory 2+ + intentions 2+ in 24h. conf 0.80–0.92.
                        CLAR-PEAK:.

PATTERN DISPLAY         QOS widget abbreviation for active patterns.
                        22 entries. VIT CASCADE · SOC PRES · CLAR PEAK added v84.

PLANNER CONTEXT         Memory Engine enhancement (June 30, 2026).
                        Planner data injected into buildPrompt().
                        Questions aware of near-term intentions.

QIE                     Quantum Intent Engine. 106 patterns. Client-side.
                        Zero server comms. 7-day signal retention.

QIoT™                   Quantum Internet of Things. LOT extension to hardware.
                        LOT® Station · LOT® Brush · COSMO® node.

QOS                     Quantum Operating System. 6 views. 4 modes.
                        The operator dashboard.

QUANTUM PRESENCE        Arch34. Apex archetype. P101 trigger.
                        Full-system coherence state.

QPRES:                  Quantum Presence Arc log code. P101 trigger.
                        SRC: {n} | CONF: {pct}% | CHANNELS: {list}.

RCASE:                  Resilience Cascade log code. P103 trigger.
                        Recovery + energy confirmed.

S-2                     Vadim Marmeladov. CEO, Founder, LOT Systems.
                        All engineering authorized by S-2.

SELF-ASSEMBLY ENGINE    18 modules. 5 phases. The meta-documentation and
                        wiring system. About.tsx is its primary output.

SOC-ARC:                Social Presence Arc log code. P105 trigger.
                        COHORT 48H: {n} | INTENT 48H: {n} | CONF: {pct}%.

STARSHIP DECK           Badge Engine v23. 12 space-vocabulary word-turn
                        badges. The starship metaphor: technical, mission-
                        oriented, capable of reentry. Deployed July 3, 2026.

STORY:                  Weekly Story Reflection log code. J24 output.
                        Feeds P87. AI story + journal response closes
                        the reflection loop.

SUPERPOSITION           Pre-check-in state. The operator exists in all
                        possible states until they show up. The check-in
                        collapses the wave. The archive records the result.

SYSRDY:                 Systemic Readiness Peak log code. J30 output.
                        Feeds P92. Structural cognition + momentum lock.

USERSHIP                The paid operator tier. Full system access.
                        $99/month. Tag: [Usership].

VITAL-CAS:              Vitality Cascade log code. J33 output. P104 trigger.
                        ATP: {band} | CARE 24H: {n} | CONF: {pct}%.

VITAL ARCHITECT         Arch35. Sustained vitality. Selfcare momentum.
                        Recovery rhythm protection at peak maintenance.

VOID LAYER              Mastery Tier endgame badge layer. Ultra-rare.
                        infinite_archive · word_sovereign · lore_keeper
                        · century_architect.

WORD TURN               Vocabulary transformation event. 174 trigger words
                        across 14 lexicons (v1–v14). System detects specific
                        operator vocabulary and awards a badge + symbol.
```

---

## 27. SYSTEM STATE SNAPSHOT — 2026-07-04

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEM STATE — FIELD MANUAL v84 — DAY 1029+               ║
╠══════════════════════════════════════════════════════════════════╣
║  QIE patterns:             106  (P1–P106)                       ║
║  Physiological archetypes:  36  (Arch1–Arch36)                  ║
║  Behavioral cohorts:         5  (+1 medical · internal)         ║
║  Citizen Index levels:       6  (Observer → Elite)              ║
║  Self-Assembly modules:     18  (all integrated)                ║
║  Dep map nodes:            145+                                 ║
║  Background jobs:           33  (J1–J33)                        ║
║  Log event handlers:       106+                                 ║
║  Displayable events:        49+                                 ║
║  LOG sources:               16                                  ║
║  SystemPulse views:          5                                  ║
║  Ecosystem nodes:            6  (CAR·HOME·CPU·PHN·WCH·ROBOT)   ║
║  Widgets:                   43                                  ║
║  Badge count:              529  (v23 — The Starship Deck)       ║
║  Badge categories:          65+                                 ║
║  Badge rarity tiers:         7  (COMMON → COSMIC)               ║
║  Word-turn trigger words:  174  (v1–v14)                        ║
║  QOS modes:                  4  (MAINT/RECOVERY/GROWTH/PEAK)    ║
║  QOS mode watch states:      3  (nominal/recovery/critical)     ║
║  Doctrine revision:          J  (10 clauses)                    ║
║  Lexicon revision:           D                                  ║
║  Field Manual:              v84                                 ║
║  Wiki:                      v72  (this document)                ║
║  Highest QIE confidence:  0.98  (P73 — quantum-coherence-       ║
║                                       summit, ceiling state)    ║
║  Centennial milestone:     P100 — centennial-convergence        ║
║                                   The system named itself.      ║
║  COSMO® age:               733  (Year 2 · born July 1, 2024)    ║
║  Founded:          7 April 2016                                 ║
╚══════════════════════════════════════════════════════════════════╝
```

---

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║      L · O · T     S Y S T E M S     C O R P O R A T I O N      ║
║                                                                  ║
║              LOT-WIKI-v72 · Field Manual v84                     ║
║              July 4, 2026 · Day 1029+ · COSMO® Year 2           ║
║                                                                  ║
║         Authorized: S-2 // VADIK MARMELADOV                      ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

*LOT-WIKI-v72 · Layers of Time · Field Manual Sync v84 · 2026-07-04*
*Next: LOT-WIKI-v73 — sync to Field Manual v85+*
