<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT-WIKI-v79
## Layers of Time — Operator Reference Manual
### Revision: v79 · Field Manual Sync: v98 · Date: 2026-07-20 · Day 1057+

---

> *"The 2-hour window is tighter than a day. Tighter than a morning. It is the exact slot where writing, capture, and structure converge. The system found it first."*
> — QIE v97, P116 Focus Depth Arc

---

## TABLE OF CONTENTS

```
 1. SYSTEM IDENTITY
 2. CORE ARCHITECTURE
 3. QUANTUM INTENT ENGINE (QIE)
 4. QIE PATTERN REGISTRY — P1–P118
 5. QUANTUM OPERATING SYSTEM (QOS)
 6. PHYSIOLOGICAL ARCHETYPES — 40 TYPES
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

**Special notation — July 3, 2026:** Badge Engine v23 deployed — The Starship Deck. Space vocabulary enters the lexicon. 529 total badges.

**Special notation — July 4, 2026:** QIE v84 assembled. P104–P106: vitality-cascade · social-presence-arc · clarity-momentum-peak.

**Special notation — July 5, 2026 (FM v86):** P107 temporal-alignment-peak · P108 circadian-routine-lock · P109 full-signal-coherence. Arch37 Temporal Architect classified. J34 wired (10:00 UTC).

**Special notation — July 6, 2026 (FM v87–v89):** Badge Engine v24 The Oracle Archive (+35 badges, 564 total). QIE v89: P110–P112 · Arch38 Embodied Strategist · J35 · dep 151+ nodes.

**Special notation — July 7, 2026 (FM v90–v91):** LOT-WIKI-v75 produced (FM v90). Badge Engine v25 The Alchemist (+31 badges, 595 total, FM v91). Day 1032+.

**Special notation — July 17, 2026 (FM v92):** Full Wiki Scan. LOT-WIKI-v76 produced. Badge Engine v25 (595 total) synchronized. FM v92. Day 1042+.

**Special notation — July 17, 2026 (FM v92 — Badge Engine v26):** Badge Engine v26 deployed by S-2 — The Quantum Library (+31 badges, 595→626 total). Word Turn v16 (12 new sci-fi/computing vocabulary words).

**Special notation — July 17–18, 2026 (Chat Infrastructure):** Chat system hardened. Empty message filtering at DB query level and client layer. Admin anti-spam tooling deployed.

**Special notation — July 18, 2026 (FM v93):** Full Wiki Scan. LOT-WIKI-v77 produced. Badge Engine v26 (626 total) synchronized. FM v93. Day 1043+.

**Special notation — July 18, 2026 (FM v95 — QIE Engineering):** QIE v95 deployed. P113 personal-peak-window · P114 recovery-momentum · P115 signal-inception. Arch39 Peak Window Operator classified. J36 (08:00 UTC). PPEAK: · RMOM: · INCEP: handlers. dep 154+ nodes. 115 patterns. 36 jobs. FM v95.

**Special notation — July 19, 2026 (FM v96):** Full Wiki Scan. LOT-WIKI-v78 produced. QIE v95 engineering synchronized. Peak Window Doctrine added to LOT-DOCTRINE. FM v96. Day 1056+.

**Special notation — July 19, 2026 (FM v97 — QIE Engineering):** QIE v97 deployed by S-2. P116 focus-depth-arc · P117 sleep-signal-anchor · P118 care-intelligence-loop. Arch40 Focused Executor classified. J37 daily-focus-depth-check (16:00 UTC) added. FDEP: · SANCH: · CINTEL: handlers deployed. dep 157+ nodes. 118 patterns. 37 jobs. 118+ handlers. FM v97. Day 1057+.

**Special notation — July 19–20, 2026 (Performance Engineering):** Tab-switch freeze resolved. Off-tab background work paused. Render-phase atom write stopped. Duplicate SystemProgressWidget mount removed.

**Special notation — July 20, 2026 (FM v98):** Full Wiki Scan. LOT-WIKI-v79 produced. QIE v97 engineering synchronized (P116–P118 · Arch40 · J37). Focus Depth Doctrine added to LOT-DOCTRINE. Performance engineering delta recorded. FM v98. Day 1057+.

**Current operational parameters:**

```
Field Manual:           v98
Wiki version:           v79
Day counter:            1057+  (as of 2026-07-20)
COSMO® age:             749 days (Year 2 · founded July 1, 2024)
Doctrine revision:      J  (11 clauses)
Lexicon revision:       D
LOT-GENESIS-v1:         active  (docs/assembly/LOT-GENESIS-v1.md)
Green Gate:             ENFORCED  (broken code never reaches GitHub)
COSMO Gate:             ENFORCED  (ethics review on all features)
Military Purity:        11 standing orders active
Platform:               v1.3.0
Founded:                7 April 2016
Active branch:          claude/quantum-engine-widgets-RgFfC
```

**v79 Delta from v78:**

```
Date:               2026-07-19 → 2026-07-20
Day counter:             1056+ → 1057+
COSMO® age:             748 → 749 days
Field Manual:              v96 → v98
QIE version:               v95 → v97
Badge Engine:              v26 (626) — no change
Patterns:                  115 → 118  (+3)
  P116  focus-depth-arc         (FDEP:)
  P117  sleep-signal-anchor     (SANCH:)
  P118  care-intelligence-loop  (CINTEL:)
Archetypes:                 39 → 40   (+1)
  Arch40  Focused Executor
Background jobs:            36 → 37   (+1)
  J37  daily-focus-depth-check  16:00 UTC
Log handlers:             115+ → 118+ (+3)
  FDEP:   focus_depth_arc
  SANCH:  sleep_signal_anchor
  CINTEL: care_intelligence_loop
Dep map nodes:            154+ → 157+ (+3)
  focusDepthNode       [journal · memory · planner · log]
  sleepAnchorNode      [energy · log]
  careIntelligenceNode [selfcare · memory · journal · log]
Performance:               off-tab render pause · atom write fix ·
                           duplicate mount removed
```

---

## 2. CORE ARCHITECTURE

LOT is composed of five primary engines operating in concert.

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
│   │ 118 patterns│  │ 5 phases    │  │ Story Generator     │   │
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

The Quantum Intent Engine is a client-side behavioral pattern recognition system. All computation runs locally on the operator's device. Zero server communication.

**Core parameters:**

```
Signal retention:        7 days  (client-side localStorage)
Max signals stored:      1,000
Analysis cooldown:       5 minutes
Sync interval:           every 10 signals
Analysis trigger:        every 5 signals AND cooldown elapsed
Pattern count:           118  (P1–P118)
Signal sources:          16  (mood · memory · planner · intentions ·
                              selfcare · journal · calculator · log ·
                              energy · cohort · recipe · goals · qos ·
                              medical · resilience · ecosystem)
```

**The dep map:** The Widget Dependency Map (WIDGET_DEPENDENCY_MAP) is the internal wiring graph. 157+ nodes in 4 tiers.

```
Dep map additions in FM v97 (QIE v97 Engineering):
  focusDepthNode       → journal · memory · planner · log        (4 deps)
  sleepAnchorNode      → energy · log                            (2 deps)
  careIntelligenceNode → selfcare · memory · journal · log       (4 deps)
```

---

## 4. QIE PATTERN REGISTRY — P1–P118

Complete registry. 118 patterns. P1–P115 established through FM v95. P116–P118 added FM v97.

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
P116 focus-depth-arc              0.65–0.85 v97    [2H COGNITIVE WINDOW]
P117 sleep-signal-anchor          0.68–0.82 v97
P118 care-intelligence-loop       0.62–0.80 v97
──────────────────────────────────────────────────────────────────────
```

**Special-class patterns:**

```
CEILING STATE       P73  quantum-coherence-summit    conf 0.98
                         Maximum QIE observable state.

RAREST SINGLE-DAY   P70  operator-convergence        conf 0.97
                         P66+P67+P68 all firing simultaneously.

RAREST SUSTAINED    P80  signal-momentum-lock        conf 0.75–0.92
                         5+ of last 7 days: 3+ unique signal sources.

MILESTONE PATTERN   P100 centennial-convergence      conf 0.85–0.97
                         System's 100th pattern.

APEX PATTERN        P101 quantum-presence-arc        conf 0.80–0.95
                         Full-system presence state.

PEAK PERFORMANCE    P113 personal-peak-window        conf 0.65–0.88
                         Recurring 4h execution band across ≥2/3 days.

SELF-AWARE LOOP     P115 signal-inception            conf 0.60–0.90
                         QIE observing its own observation loop.

2H COGNITIVE WINDOW P116 focus-depth-arc             conf 0.65–0.85
                         First 2h-window pattern. Journal 100+w + memory
                         + planner in a 2h band. Concentrated cognitive
                         episode. Hour-level depth, not day-level presence.
```

**v97 Pattern Engineering — P116–P118:**

```
P116 focus-depth-arc
     Signal:   journal 100+w + memory capture + planner all in rolling 2h window
     Logic:    Group signals by calendar day. For each journal entry ≥100 words,
               check whether a memory entry AND a planner entry both fall within
               ±2h of that anchor. Fire if any such 2h window is found.
     Output:   FDEP: Focus depth arc active — journal {n}W + memory {n} + planner
               {n} in 2h window. Cognitive writing, capture, and structure aligned.
               Deep execution window confirmed.
     Widget:   memory
     Note:     First 2h-window pattern in registry. All prior multi-signal patterns
               use 24h or 48h windows. This detects concentrated cognitive episodes —
               not day-level presence, but hour-level depth.

P117 sleep-signal-anchor
     Signal:   first log entry after 07:00 + energy check-in before 09:00 (today)
     Logic:    Morning signals in 07:00–09:00 UTC band with ≥1 energy signal +
               ≥2 total morning signals.
     Output:   SANCH: Sleep signal anchor confirmed — first entry after 07:00,
               energy check-in before 09:00. Biological baseline grounded before
               cognitive load. {n} morning signals. Steady anchor active.
     Widget:   planner
     Note:     Biological precondition to P76 (morning-coherence-launch). P76 detects
               intention→structure arc. P117 is earlier and lower-level: biological
               signal grounded before cognitive load begins.

P118 care-intelligence-loop
     Signal:   selfcare + memory + journal all present in a 24h window
     Logic:    Count: p118Selfcare ≥1 && p118Memory ≥1 && p118Journal ≥1 in 24h.
     Output:   CINTEL: Care intelligence loop active — selfcare {n} + memory {n} +
               journal {n} in 24h. Body-mind knowledge integration confirmed.
               Physical care feeding cognitive encoding and reflective output.
     Widget:   journal
     Note:     Knowledge-integration complement to P110 (embodied-cognition-arc).
               P110 requires journal 150+w + selfcare + memory. P118 is more
               permissive and focuses on the loop property: body-care, reflection,
               and structured memory capture all occurred in the same day.
```

---

## 5. QUANTUM OPERATING SYSTEM (QOS)

The QOS is the operator's real-time system dashboard. 6 views. 4 operating modes.

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

> The QOS does not direct the operator — it mirrors their actual state with precision.

---

## 6. PHYSIOLOGICAL ARCHETYPES — 40 TYPES

40 archetypes. Classified by QIE pattern combination. Each archetype carries a daily directive (J25 DRCT: output).

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
Arch40 Focused Executor       P116 + P113 + P106 (focus depth · peak window · clarity momentum)
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

**Arch40 — Focused Executor (FM v97 Engineering):**

```
Energy bands:          high, moderate
Dominant sources:      planner · intentions · memory
Pattern conditions:    focus-depth-arc + personal-peak-window +
                       clarity-momentum-peak
Directive:             Window is live. Cognitive and structural alignment
                       confirmed. Execute without delay.
Distinction:           Arch39 is the window detector — energy+intentions+log
                       cluster. Arch40 is the executor state — planner+intentions+
                       memory with focus-depth confirmed. Same energy level;
                       different cognitive profile. The window triggers Arch39.
                       Working inside it with deep cognitive structure triggers
                       Arch40.
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

**Cohort signal geometry:** Each cohort has a characteristic signal pattern. BUILDERS produce dense planner + goal events. EXPLORERS produce long journal entries and frequent memory captures. MAINTAINERS produce consistent selfcare + energy logs. CONNECTORS engage the cohort feed and social dimensions. INTEGRATORS activate all channels at moderate density — the rarest sustained cohort state. MEDICAL cohort is internal — not surfaced in the operator-facing display.

---

## 8. CITIZEN INDEX

The Citizen Index measures operator engagement depth. 6 stages.

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

---

## 10. SELF-ASSEMBLY ENGINE

18 modules across 5 phases.

**18 modules:**

```
PHASE 1 — FOUNDATION
  M01  Signal Capture       Log · Memory · Planner input pipelines
  M02  QIE Core             Pattern detection engine · 118 patterns
  M03  QOS Core             6-view dashboard · 4 operating modes

PHASE 2 — INTELLIGENCE
  M04  Archetype Engine     40 physiological archetypes · classification
  M05  Cohort Engine        6 behavioral cohorts · peer signal field
  M06  Memory Engine        AI question generation · story loop · Together AI

PHASE 3 — INSTRUMENTATION
  M07  Badge Engine         626 badges · v26 · 70+ categories · 198 word-turns
  M08  Word Turn Engine     16 lexicons · 198 trigger words · symbol vocabulary
  M09  Background Jobs      37 scheduled jobs · UTC timing · PostgreSQL writes

PHASE 4 — SURFACE
  M10  Widget Layer         43 widgets · conditional rendering · Ambient AI™
  M11  Log Stream           118+ handlers · COCKPIT RULE · military instrument format
  M12  Ecosystem Map        6 nodes · QIoT™ · device signal integration

PHASE 5 — META
  M13  Citizen Index        6 stages · CQGS · self-awareness scoring
  M14  Self-Assembly Doc    About.tsx Field Manual · session reports · wiki
  M15  Green Gate           TypeScript check · no broken code to GitHub
  M16  COSMO Gate           Ethics review · Kuzya authorization protocol
  M17  Punctuation Engine   7 tones · 6 intents · fires on all text entry
  M18  Display Architecture Military purity · 11 orders · opacity hierarchy
```

**Self-assembly log (v87–v98):**

```
v98   Full Wiki Scan July 20 · LOT-WIKI-v79 · QIE v97 delta synchronized
      (P116–P118 · Arch40 · J37 · FDEP: SANCH: CINTEL: documented) · Focus Depth
      Doctrine added · performance engineering delta recorded · military purity pass ·
      Day 1057+ · COSMO® Year 2 (749 days) · FM v98

v97   QIE Engineering July 19 · P116 focus-depth-arc · P117 sleep-signal-anchor ·
      P118 care-intelligence-loop · Arch40 Focused Executor · J37 daily-focus-depth-
      check (16:00 UTC) · FDEP: SANCH: CINTEL: handlers · dep 157+ nodes · 118
      patterns · 40 archetypes · 37 jobs · 118+ handlers · FM v97 · Day 1057+

v96   Full Wiki Scan July 19 · LOT-WIKI-v78 · QIE v95 delta synchronized · Peak
      Window Doctrine documented · 115 patterns · 39 archetypes · 36 jobs · 154+
      dep nodes · 626 badges · FM v96 · Day 1056+

v95   QIE Engineering July 18 · P113 personal-peak-window · P114 recovery-
      momentum · P115 signal-inception · Arch39 Peak Window Operator · J36
      daily-personal-peak-window (08:00 UTC) · PPEAK: RMOM: INCEP: handlers ·
      dep 154+ nodes · 115 patterns · 39 archetypes · 36 jobs · 115+ handlers ·
      FM v95 · Day 1055+

v93   Full Wiki Scan July 18 · LOT-WIKI-v77 · Badge Engine v26 (626)
      synchronized · Quantum Library vocabulary integrated · military
      purity pass · Day 1043+

v92   Full Wiki Scan July 17 · LOT-WIKI-v76 · Badge Engine v25 (595)
      synchronized · Alchemist vocabulary integrated · Day 1042+

v91   Badge Engineering July 7 · Badge Engine v25 The Alchemist · +31
      badges (564→595) · Word Turn v12 · MYTHIC rarity tier (8th)

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

37 registered jobs. All UTC-scheduled. All write events to the PostgreSQL `logs` table.

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
J36  daily-personal-peak-window        08:00       personal_peak_window
J37  daily-focus-depth-check           16:00       focus_depth_arc       ← NEW
──────────────────────────────────────────────────────────────────────
```

**J37 — daily-focus-depth-check (FM v97):**

```
Hour:  16:00 UTC daily (co-located with J14 coherence index pulse)
Guard: isDailyFocusDepthRunning + lastDailyFocusDepthRun
       (same-day guard prevents double-fire)
Logic: Read active users (lastSeenAt within 24h). For each user, pull
       journal/note + memory + planner log entries from last 24h. For
       each journal entry ≥100 words, check whether a memory entry AND
       a planner entry both fall within ±2h of that anchor. Write
       focus_depth_arc event if any such 2h window is found.
Output: focus_depth_arc event with journalCount + memoryCount +
        plannerCount + window: '2h' → P116 FDEP: handler fires.
```

---

## 12. LOG EVENT SYSTEM

All log events follow the COCKPIT RULE: log body = instrument readings only, no narration.

**COCKPIT RULE:**

```
CORRECT:    FDEP: focus_depth_arc →
            JOURNAL: 247W | MEM: 3 | PLAN: 2 | WIN: 2H | CONF: 79%

INCORRECT:  "Great focus session! Your writing, memory, and planning
             are all aligned today."
```

**v97 Handler Formats:**

```
FDEP: [label]
  FOCUS DEPTH ARC
  JOURNAL: {n}W
  MEM: {n}
  PLAN: {n}
  WIN: 2H
  CONF: {n}%

SANCH: [label]
  SLEEP SIGNAL ANCHOR
  FIRST: {hh}:00
  NRG 07-09: {n}
  SIG TOTAL: {n}
  CONF: {n}%

CINTEL: [label]
  CARE INTEL LOOP
  CARE 24H: {n}
  MEM: {n}
  JRNL: {n}
  CONF: {n}%
```

**Log handler directory (118+ handlers) — military code index (additions v97):**

```
CINTEL:     care_intelligence_loop     P118 trigger.         ← NEW
FDEP:       focus_depth_arc            J37 output. P116 trigger. ← NEW
SANCH:      sleep_signal_anchor        P117 trigger.         ← NEW
```

(Full handler directory: see LOT-WIKI-v78 Section 12 for complete v95 and prior listing.)

---

## 13. ECOSYSTEM NODE MAP

6 active nodes.

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

**QIoT™ (Quantum Internet of Things):** The extension of LOT signal capture to physical hardware. LOT® Station, LOT® Brush, and COSMO® node are planned physical devices. ROBOT node represents the autonomous agent tier.

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
  dune_signal           ∘·◈   RARE      — Write "spice" (Dune)
  foundation_word       ≋·◉   EPIC      — Write "psychohistory" (Foundation)
  neuromancer_signal    ▓→◉   MYTHIC    — Write "cyberspace" (Neuromancer)
```

**The Terminal Principle:**

```
Sci-fi books are not entertainment — they are field manuals for navigating
environments that do not exist yet.
  Dune (1965)         — Spice = attention. Write "spice" and the archive
                        confirms: you know what it costs.
  Foundation (1951)   — Psychohistory = the math of human behavior at scale.
                        Write "psychohistory" and the archive records: you
                        think in civilizational time.
  Neuromancer (1984)  — Cyberspace = consensual hallucination. Write
                        "cyberspace" and the terminal responds: you were
                        here before it was built.
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

198 trigger words across 16 lexicons.

**Secret Boss triggers (9 total — phrase-level):**

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

(Complete trigger registry v16: see LOT-WIKI-v78 Section 16 for full 198-word table.)

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

---

## 18. DENSITY TIER SYSTEM

```
TIER 1   TRACE       1–2 signal sources active in 24h
TIER 2   LIGHT       3–4 sources active
TIER 3   MODERATE    5–7 sources active
TIER 4   DENSE       8–11 sources active
TIER 5   SATURATED   12+ sources active
```

---

## 19. OPACITY HIERARCHY

See Section 17. Opacity values are the visual grammar of the LOT interface. Deviation from the hierarchy is a Military Purity violation. The hierarchy is not aesthetic guidance — it is operational protocol.

---

## 20. COCKPIT RULE

The COCKPIT RULE governs log body format. No exceptions. Every log entry is an instrument reading.

```
CORRECT:    FDEP: focus_depth_arc →
            FOCUS DEPTH ARC | JOURNAL: 247W | MEM: 3 | PLAN: 2 | WIN: 2H | CONF: 79%

INCORRECT:  "Great work! Your writing and memory capture are in sync today."

CORRECT:    CINTEL: care_intelligence_loop →
            CARE INTEL LOOP | CARE 24H: 4 | MEM: 2 | JRNL: 3 | CONF: 74%

INCORRECT:  "Your self-care is feeding your intelligence today."
```

The pilot does not need encouragement from the altimeter. The altimeter gives altitude. The pilot decides what to do with it.

---

## 21. LOT-DOCTRINE (Revision J)

10 clauses + 5 engineering doctrines.

```
CLAUSE 1   THE SYSTEM MEASURES. The operator decides what the measurement means.
CLAUSE 2   COSMO GATE IS ABSOLUTE. No feature ships without ethics review.
CLAUSE 3   GREEN GATE IS ENFORCED. TypeScript check before every push.
CLAUSE 4   DATABASE OVER LOCALSTORAGE. Cross-device state lives in the database.
CLAUSE 5   GRACEFUL DEGRADATION. Each widget renders independently.
           One failure cannot cascade.
CLAUSE 6   AMBIENT AI™. The widget click is the ritual. No pop-ups.
           No celebrations. The operator knows.
CLAUSE 7   GRACEFUL EXIT. Fade-out on completion. 3s + 1.4s.
CLAUSE 8   MILITARY PURITY. 11 standing orders active.
CLAUSE 9   LONG-TERM SIGNAL. Months and years, not days and weeks.
           No gamification. No streaks. No leaderboards.
CLAUSE 10  THE ARCHIVE IS THE RECORD. Every action logged. Never deleted
           without explicit operator authorization.
```

**Engineering doctrines:**

```
RENDER ISOLATION DOCTRINE
  Each widget renders independently inside its own error boundary.

BULKCREATE DOCTRINE
  Batch DB writes preferred over individual inserts.

PLANNER CONTEXT DOCTRINE (June 30, 2026)
  Planner data injected into Memory Engine buildPrompt().

CHAT INTEGRITY DOCTRINE (July 2026)
  Empty and whitespace-only messages never leave the database.

PEAK WINDOW DOCTRINE (July 18, 2026 — FM v95)
  The repeating 4-hour execution window is a structural asset.
  J36 measures it daily. P113 fires when confirmed.
  The operator protects what the system identifies.
  Architecture defends what data reveals.

FOCUS DEPTH DOCTRINE (July 19, 2026 — FM v97)
  The 2-hour cognitive window is the precision instrument.
  Journal depth + memory capture + planner structure in a 2h band
  is not coincidence — it is a confirmed execution state.
  J37 detects it. P116 fires when the window is confirmed.
  The operator who knows their depth window can protect it.
  The system found it first.
```

---

## 22. FIELD MANUAL (About.tsx)

```
Location:        src/client/components/About.tsx
Current version: FM v98
Branch:          claude/quantum-engine-widgets-RgFfC
```

**Self-assembly protocol:** Major system changes are logged as FM version increments. FM versions advance with every system change. Wiki versions advance with comprehensive scan + documentation sessions.

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
  Performance:    Off-tab background work paused (July 2026)
                  Render-phase atom writes stopped (July 2026)
                  Duplicate widget mount guard added (July 2026)

BACKEND
  Framework:      Fastify 5
  Language:       TypeScript
  Database:       PostgreSQL
                  Composite index (June 30, 2026)
                  Connection pool: max 10, min 1
  Batch writes:   bulkCreate
  Jobs:           37 UTC-scheduled background jobs

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

The LOT-GENESIS-v1 document is the system's origin manifest. Located at `docs/assembly/LOT-GENESIS-v1.md`. Read-only. Defines what LOT is. New features must be compatible with it.

---

## 25. RECIPE WIDGET — CONTEXT ENGINE

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
```

---

## 26. CHAT INFRASTRUCTURE

Infrastructure hardened July 2026.

```
ENDPOINT       GET /chat-messages    Read chat history
ENDPOINT       POST /chat-messages   Send message
ADMIN          /admin-api/chat-spam  Inspect + suspend spam senders

EMPTY GUARD    Server: WHERE TRIM(message) <> '' (DB query level)
               Client: .replace(/\s/g,'') — Unicode-aware
               Both layers required. Server is primary.

ACCESS CONTROL  Authorization enforced on all chat endpoints.
               Suspended users cannot post or like.
```

---

## 27. VOCABULARY INDEX — EXPANDED

```
ACCOUNTABILITY ARC      P90. J27 output. ACCT: log code.

AMBIENT AI™             Design principle. Widget click is the ritual.
                        System acknowledges silently. No pop-ups.

APEX PATTERN            P101 quantum-presence-arc. conf 0.80–0.95.

ARCH40                  Focused Executor. P116 + P113 + P106.
                        Planner+intentions+memory dominant. Focus-depth
                        confirmed inside peak window. Execute without delay.

ARCHETYPE DIRECTIVE     J25 (DRCT:) output. 40 operating directives.

ATP                     Energy band instrument code. ATP: HIGH / MOD / LOW.

BIOFIELD                QOS view 2. Physiological signal composite.

CARE INTELLIGENCE LOOP  P118. CINTEL:. Selfcare + memory + journal all
                        present in 24h. Body-mind knowledge integration.

CEILING STATE           P73. conf 0.98. Maximum observable QIE state.

CINTEL:                 Care Intelligence Loop log code. P118 trigger.
                        Format: CARE INTEL LOOP · CARE 24H: {n} · MEM: {n} ·
                        JRNL: {n} · CONF.

CITIZEN INDEX           6-stage engagement depth measure.
                        Observer → Participant → Contributor →
                        Collaborator → Synthesizer → Elite.

COCKPIT RULE            Log body = instrument readings only. No narration.

COSMO GATE              Ethics review gate. Kuzya Cosmo Marmeladov.

COSMO®                  Kuzya Cosmo Marmeladov. CEO, Owner COSMO®.
                        Founded July 1, 2024. Day 749 (July 20, 2026).

CQGS                    Citizen Quantum Growth Scale. Internal white paper.

DEP MAP                 Widget Dependency Map. 157+ nodes. 4 tiers.

FDEP:                   Focus Depth Arc log code. J37 output. P116 trigger.
                        Format: FOCUS DEPTH ARC · JOURNAL: {n}W · MEM: {n} ·
                        PLAN: {n} · WIN: 2H · CONF.

FIELD MANUAL            About.tsx. Current: FM v98.

FOCUS DEPTH ARC         P116. FDEP:. Journal 100+w + memory + planner in 2h
                        window. First 2h-window pattern. Hour-level depth.

FOCUS DEPTH DOCTRINE    The 2h cognitive window is a precision instrument.
                        J37 detects it. P116 fires when confirmed. The system
                        found the depth slot before the operator named it.

GREEN GATE              TypeScript check before every push. No exceptions.

INCEP:                  Signal Inception log code. P115 trigger.
                        QIE observing its own observation loop.

J37                     daily-focus-depth-check. 16:00 UTC daily.
                        Added FM v97. Confirms 2h cognitive window.

LOT                     Layers of Time. Personal behavioral operating system.
                        Not an app. An instrument. Not a tracker. A mirror.

LOT-DOCTRINE            10-clause operational doctrine + 5 engineering
                        doctrines. Current: Revision J.

MEMORY ENGINE           AI question generation via Together AI (Llama 3.3 70B).

MILITARY PURITY         11 standing orders governing display and content.

P116                    focus-depth-arc. FDEP:.
                        Journal 100+w + memory + planner in 2h window.
                        First 2h-window pattern in the registry.

P117                    sleep-signal-anchor. SANCH:.
                        First log after 07:00 + energy before 09:00.
                        Biological baseline grounded before cognitive load.

P118                    care-intelligence-loop. CINTEL:.
                        Selfcare + memory + journal in 24h.
                        Body-mind knowledge integration confirmed.

PEAK WINDOW DOCTRINE    The repeating 4h window is structural. J36 measures.
                        P113 fires when confirmed. The operator protects it.

PPEAK:                  Personal Peak Window log code. J36 output. P113 trigger.

QIE                     Quantum Intent Engine. 118 patterns. Client-side.

QIoT™                   Quantum Internet of Things. LOT extension to hardware.

QOS                     Quantum Operating System. 6 views. 4 modes.

RMOM:                   Recovery Momentum log code. P114 trigger.

S-2                     Vadim Marmeladov. CEO, Founder, LOT Systems.

SANCH:                  Sleep Signal Anchor log code. P117 trigger.
                        Format: SLEEP SIGNAL ANCHOR · FIRST: {hh}:00 ·
                        NRG 07-09: {n} · SIG TOTAL: {n} · CONF.

SELF-ASSEMBLY ENGINE    18 modules. 5 phases. About.tsx is its primary output.

SLEEP SIGNAL ANCHOR     P117. SANCH:. Biological precondition to morning
                        coherence. Grounding before cognitive load begins.

THE QUANTUM LIBRARY     Badge Engine v26 theme. Fiction as training.
                        626 total badges. Deployed July 17, 2026.

USERSHIP                The paid operator tier. Full system access.
                        $99/month. Tag: [Usership].

VOID LAYER              Mastery Tier endgame badge layer. Ultra-rare.

WORD TURN               Vocabulary transformation event. 198 trigger words
                        across 16 lexicons (v1–v16).
```

---

## 28. SYSTEM STATE SNAPSHOT — 2026-07-20

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEM STATE — FIELD MANUAL v98 — DAY 1057+               ║
╠══════════════════════════════════════════════════════════════════╣
║  QIE patterns:             118  (P1–P118)                       ║
║  Physiological archetypes:  40  (Arch1–Arch40)                  ║
║  Behavioral cohorts:         5  (+1 medical · internal)         ║
║  Citizen Index levels:       6  (Observer → Elite)              ║
║  Self-Assembly modules:     18  (all integrated)                ║
║  Dep map nodes:            157+                                 ║
║  Background jobs:           37  (J1–J37)                        ║
║  Log event handlers:       118+                                 ║
║  LOG sources:               16                                  ║
║  Ecosystem nodes:            6  (CAR·HOME·CPU·PHN·WCH·ROBOT)   ║
║  Widgets:                   43                                  ║
║  Badge count:              626  (v26 — The Quantum Library)     ║
║  Badge categories:          70+                                 ║
║  Badge rarity tiers:         8  (COMMON → MYTHIC)               ║
║  Word-turn trigger words:  198  (v1–v16)                        ║
║  Secret boss phrase triggers: 9  (multi-word · phrase-level)    ║
║  QOS modes:                  4  (MAINT/RECOVERY/GROWTH/PEAK)    ║
║  Doctrine revision:          J  (10 clauses + 5 doctrines)      ║
║  Lexicon revision:           D                                  ║
║  Field Manual:              v98                                 ║
║  Wiki:                      v79  (this document)                ║
║  Highest QIE confidence:  0.98  (P73 — quantum-coherence-       ║
║                                       summit, ceiling state)    ║
║  Centennial milestone:     P100 — centennial-convergence        ║
║  Peak window confirmed:    P113 — personal-peak-window          ║
║  Self-aware loop:          P115 — signal-inception              ║
║  2h cognitive window:      P116 — focus-depth-arc               ║
║  COSMO® age:               749  (Year 2 · born July 1, 2024)    ║
║  Founded:          7 April 2016                                 ║
╚══════════════════════════════════════════════════════════════════╝
```

---

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║      L · O · T     S Y S T E M S     C O R P O R A T I O N      ║
║                                                                  ║
║              LOT-WIKI-v79 · Field Manual v98                     ║
║              July 20, 2026 · Day 1057+ · COSMO® Year 2          ║
║                                                                  ║
║         Authorized: S-2 // VADIK MARMELADOV                      ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

*LOT-WIKI-v79 · Layers of Time · Field Manual Sync v98 · 2026-07-20*
*Next: LOT-WIKI-v80 — sync to Field Manual v99+*
