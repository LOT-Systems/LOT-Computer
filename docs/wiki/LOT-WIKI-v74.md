<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT-WIKI-v74
## Layers of Time — Operator Reference Manual
### Revision: v74 · Field Manual Sync: v87 · Date: 2026-07-06 · Day 1031+

---

> *"The system does not motivate. The system measures. The operator decides what the measurement means."*
> — LOT-DOCTRINE, Clause I, Revision J

---

## TABLE OF CONTENTS

```
 1. SYSTEM IDENTITY
 2. CORE ARCHITECTURE
 3. QUANTUM INTENT ENGINE (QIE)
 4. QIE PATTERN REGISTRY — P1–P109
 5. QUANTUM OPERATING SYSTEM (QOS)
 6. PHYSIOLOGICAL ARCHETYPES — 37 TYPES
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
25. RECIPE WIDGET — CONTEXT ENGINE
26. VOCABULARY INDEX — EXPANDED
27. SYSTEM STATE SNAPSHOT
```

---

## 1. SYSTEM IDENTITY

**LOT** — *Layers of Time* — is a personal behavioral operating system. Not a wellness application. Not a habit tracker. Not a productivity suite. An instrument that reads the human signal field across time and surfaces the pattern beneath the noise.

The system was conceived and is operated by **S-2** (Vadim Marmeladov, CEO, LOT Systems). The ethics gate is **COSMO Gate**, named for Kuzya Cosmo Marmeladov. No feature ships that Kuzya would not approve.

**Special notation — July 1, 2026:** COSMO® completed its second year. Founded July 1, 2024. Day 735 as of July 6, 2026. Every feature shipped passes the COSMO Gate. This is recorded.

**Special notation — July 5, 2026 (v86):** P107 temporal-alignment-peak · P108 circadian-routine-lock · P109 full-signal-coherence added. Arch37 Temporal Architect classified. J34 daily-temporal-alignment-check wired (10:00 UTC). TALIGN: CROUT: FSCOHERE: handlers live. v84 displayableEvents gap resolved.

**Special notation — July 6, 2026 (v87):** Full Wiki Scan. LOT-WIKI-v74 produced. Self-Assembly log backfilled for v83–v86. Field Manual FM v87 synchronized. Day 1031+.

---

## 2. CORE ARCHITECTURE

**Stack:**
- Runtime: Node.js / TypeScript
- Frontend: React 18, Tailwind CSS
- Database: PostgreSQL
- AI: Together AI — Llama 3.3 70B Instruct Turbo (switched June 30, 2026)
- Auth: JWT
- Realtime: SSE (Server-Sent Events)
- Deployment: Linux VPS

**Primary modules (18 assembled):**
1. Journal — text signal capture
2. Memory — semantic trace layer
3. Planner — structural intention system
4. Goals — completion arc tracking
5. Selfcare — biological signal input
6. Mood — affective state sensor
7. Log — behavioral event stream
8. Session — interaction tracking
9. Medical — health record layer
10. Calculator — numeracy signal source
11. Benchmark — operator performance index
12. Intentions — directional signal input
13. QIE — Quantum Intent Engine (client-side pattern recognition)
14. QOS — Quantum Operating System (operator dashboard)
15. Quantum — full person-state snapshot type
16. Signal Archive — log as 16th self-assembly module
17. Quantum OS — QOS panel as 17th self-assembly module
18. Resilience Protocol — PTSD/C-PTSD trauma-informed protocol

---

## 3. QUANTUM INTENT ENGINE (QIE)

**Class:** Client-side behavioral pattern recognition engine  
**Communication:** Zero server comms. Runs entirely in browser.  
**Signal retention:** 7 days, max 1,000 signals  
**Signal sources:** 16 — journal · memory · planner · goals · selfcare · mood · log · session · medical · calculator · benchmark · intentions · badges · QOS · community · resilience  
**Pattern count:** 109 patterns (P1–P109)  
**Archetype count:** 37 physiological behavioral types

**Operating principle:** QIE reads raw behavioral signals. Confidence scores rise when multiple signals from independent channels fire in the same time window. When confidence crosses a threshold, a named pattern is active. When multiple patterns converge at high confidence, an archetype is classified. The operator does not configure QIE. QIE reads the operator.

---

## 4. QIE PATTERN REGISTRY — P1–P109

**Format:** `Pattern number — Name — Confidence range — Trigger conditions`

### P1–P60 — Foundation Patterns (ref LOT-WIKI-v68 and earlier)

Covers: intention patterns, memory depth, journal velocity, biofield recovery, cascade detection, deep work windows, social resonance, integration arcs, operator signatures, temporal grids, QOS coherence, and the full 60-pattern foundation established through June 2026.

### P61–P80 — Expansion Patterns (ref LOT-WIKI-v69 and LOT-WIKI-v71)

```
P61 — evening-coherence-close       0.70–0.88   morning intention + evening reflection same day
P62 — signal-vault                  0.65–0.88   30+ distinct memory entries logged
P63 — depletion-recovery-surge      0.72–0.90   energy low → high after 3+ depletion days + 3+ selfcare
P64 — badge-momentum                0.65–0.95   3+ distinct badge types unlocked in 7d
P65 — word-turn-depth               0.60–0.92   5+ distinct word-turn badge types ever earned
P66 — signal-crystallization        0.75–0.92   3+ intentions → planner → goal completion in 24h
P67 — biorhythm-lock                0.72–0.88   morning+evening check-ins 5+ consecutive days
P68 — quantum-coherence-summit      0.98        P70 + UserIndex ≥ 70 — system ceiling
P69 — adaptive-resonance            0.70–0.88   structural rising QOS trend
P70 — operator-convergence          0.97        P66+P67+P68 simultaneous
P71 — qos-signature-lock            0.85–0.95   meridian+multimodal+temporal → lock
P72 — operator-signature            0.90        ≥5 distinct patterns active in 48h, cross-domain
P73 — longitudinal-drift            0.55–0.80   3d bucket comparison, recent vs prior signal density
P74 — adaptive-momentum-window      0.75–0.90   systemic-thinking-mode + signal-momentum-lock simultaneous
P75 — vitality-strategy-peak        0.78–0.92   circadian-vitality-peak + systemic-thinking-mode
P76 — morning-coherence-launch      0.72        mood signal before 10:00 + intention before 11:00
P77 — signal-vault-deep             0.68–0.88   journal >150w + memory + log in 6h
P78 — depletion-recovery-surge-deep 0.72–0.90   depleted → 2+ care → energy high in 48h
P79 — circadian-vitality-peak       0.70–0.90   2+ positive morning mood signals before 10:00 + biorhythm-lock + energy moderate/high + hour < 13
P80 — systemic-thinking-mode        0.68–0.92   planner 3+ + goals 3+ + intentions 3+ each in 3d + UserIndex ≥ 50 + no depletion
```

### P81–P100 — Deep Pattern Layer (ref LOT-WIKI-v72)

```
P81 — cognitive-depth-arc           0.68–0.90   5+ memory entries + 150+ journal words + badge discovery in 7d
P82 — signal-momentum-lock          0.75–0.92   5+ of last 7 days with 3+ unique signal sources — rarest sustained state
P83 — morning-intention-launch      0.72        MCL: job — morning-coherence-launch event
P84 — evening-coherence-close       0.70–0.88   EVE: job — evening_coherence_close event
P85 — quantum-learning-spiral       0.70–0.90   memory growth + journal depth + badge discovery simultaneously in 7d
P86 — accountability-arc            0.68–0.88   intentions + cohort check + goal completion convergence in 7d
P87 — full-presence-arc             0.72–0.90   morning count + evening count arc in 7d window
P88 — weekly-story-reflection       0.72        lot_ai_story + journal 24h → reflection loop closed
P89 — contextual-checkin-momentum   0.65–0.85   3+ check-ins 24h ≥50% positive
P90 — systemic-readiness-peak       0.75–0.92   SYSRDY: job — archetype + confidence + ATP + readiness
P91 — daily-rhythm-lock             0.72–0.88   RLOCK: job — streak + morning + evening
P92 — cross-domain-mastery          0.70–0.90   CROSS: job — memory + words + badges + goals + plans 7D
P93 — intent-to-action-gap          0.68–0.88   IGAP: job — intention set vs plan execution window
P94 — recovery-initiation           0.70–0.88   RECOV: job — care + prior ATP + status
P95 — cognitive-vitality-sync       0.72–0.90   VSYNC: job — words 24h + memory 24h + ATP
P96 — quantum-presence-arc          0.75–0.92   all 6 primary channels active in 48h — operator fully present across all signal dimensions
P97 — planner-intention-sync        0.78–0.94   intentions signal + planner signal within 2h — intent becomes structure in real time
P98 — resilience-cascade            0.72–0.90   depleted → 2+ selfcare → memory capture + positive mood within 18h — full restoration arc
P99 — action-completion-arc         0.75–0.92   intention set + plan recorded same 24h — intent becomes structure
P100 — biological-restoration-peak  0.78–0.94   3+ selfcare signals + depleted prior energy + moderate/high today — recovery arc complete
```

**P100 — CENTENNIAL CONVERGENCE:** Rarest single-pattern milestone. System logs CENT: when P100 fires — all 6 primary sources active + high energy + positive mood within 12h. Milestone recorded in the operating log.

### P101–P109 — Apex Pattern Layer

```
P101 — quantum-presence-arc         0.75–0.92   all 6 primary channels (journal+memory+planner+selfcare+intentions+mood) active in 48h; operator fully present across all signal dimensions
P102 — planner-intention-sync       0.78–0.94   intentions signal + planner signal within 2h; intent becomes structure in real time; execution synchronization
P103 — resilience-cascade           0.72–0.90   depleted → 2+ selfcare → memory capture + positive mood within 18h; complete restoration arc: breakdown → intervention → capture
P104 — vitality-cascade             0.75–0.92   high energy + 3+ selfcare + positive mood + journal in 24h; biological prime channel fully active
P105 — social-presence-arc          0.70–0.88   cohort activity + community signals + intentions in 48h; social signal field aligned
P106 — clarity-momentum-peak        0.78–0.94   planner + intentions + memory + clear energy in 24h; clarity and momentum co-present
P107 — temporal-alignment-peak      0.75–0.92   planner 2+ + intentions 2+ + calendar anchor in 48h; time structure and intention converge
P108 — circadian-routine-lock       0.72–0.90   consistent morning + evening signals over 5+ days; biological arc stable across time
P109 — full-signal-coherence        0.80–0.95   all 16 signal sources active in 7d window; system-wide coherence state; no channel silent
```

**P109 — FULL SIGNAL COHERENCE:** All 16 signal sources active in a 7-day window. Every channel speaks. System-wide coherence. FSCOHERE: log handler fires. This is not a streak metric — it is a coverage metric. The operator is not absent from any dimension of the self.

---

## 5. QUANTUM OPERATING SYSTEM (QOS)

**6 views:** Ecosystem · Biofield · Cohort · Index · Assembly · Mode  
**4 modes:** MAINTENANCE · RECOVERY · GROWTH · PEAK

**View descriptions:**
- **Ecosystem** — 6 nodes: CAR · HOME · CPU · PHN · WCH · ROBOT. Physical environment signal map.
- **Biofield** — physiological archetype, dominant module, confidence band, energy state. Live classification.
- **Cohort** — behavioral cohort assignment, archetype directive. Operator positioned in typology.
- **Index** — 6 dimensions: ENG · EMO · INT · SOC · CARE · COG. User Index score.
- **Assembly** — self-assembly phase, module count, system version.
- **Mode** — MAINTENANCE/RECOVERY/GROWTH/PEAK. 24h signal density determines mode.

---

## 6. PHYSIOLOGICAL ARCHETYPES — 37 TYPES

**Classification basis:** QIE pattern confidence scores. Server-assigned via `classifyPhysiologicalCohort()`. Each archetype has: name · dominant module · energy band · qualifying patterns · directive.

```
ARCH   NAME                   VERSION  DOMINANT MODULE      QUALIFYING PATTERNS
──     ──────────────────     ───────  ─────────────────    ──────────────────────
 1     Clarity Architect      v26      planner              early pattern family
 2     Social Synthesizer     v26      community            social resonance arc
 3     Intention Executor     v33      intentions           intention-completion-arc
 4–17  [Foundation]           v39+     various              P1–P60 base family
18     Coherence Holder       v45      all 4 inner domains  P34 — highest confidence state
19     Integrated Operator    v54b     all channels         signal diversity + dep map
20     Temporal Integrator    v58      planner+intentions   qos-signature-lock + operator-signature
21     Integration Architect  v60      memory+planner+goals integration-arc-peak + adaptive-resonance
22     Convergent Operator    v62      all gates            quantum-coherence-summit + operator-convergence
23     Achievement Catalyst   v64      badges+log+journal   badge-momentum + word-turn-depth
24     Signal Initiator       v65      intentions+planner   morning-coherence-launch + signal-vault
25     Diurnal Operator       v66      intentions+planner   morning-coherence-launch + evening-coherence-close
26     Momentum Architect     v67      intentions+journal   signal-momentum-lock + intention-velocity
27     Cognitive Cartographer v68      memory+journal+log   cognitive-depth-arc + word-turn-depth
28     Vital Architect        v69      planner+intentions   circadian-vitality-peak + morning-coherence-launch
29     Peak Strategist        v72      goals+planner        vitality-strategy-peak + adaptive-momentum-window
30     Quantum Scholar        v76      memory+journal       quantum-learning-spiral + cognitive-depth-arc
31     Rhythm Architect       v78      journal+planner      daily-rhythm-lock + systemic-readiness-peak
32     Integrated Operator    v78      all channels         cross-domain-mastery + systemic-readiness-peak
33     Dynamic Responder      v80      intentions+log       intent-to-action-gap + recovery-initiation
34     Quantum Presence       v83      all 6 primary ch.    quantum-presence-arc + planner-intention-sync
35     Vitality Architect     v84      energy+selfcare      vitality-cascade + biological-restoration-peak
36     Social Signal Operator v84      cohort+community     social-presence-arc + clarity-momentum-peak
37     Temporal Architect     v86      planner+intentions   temporal-alignment-peak + circadian-routine-lock
```

**Arch37 — Temporal Architect (v86):**  
Dominant: planner + intentions. Energy: moderate/high. Qualifying: temporal-alignment-peak (P107) + circadian-routine-lock (P108). Directive: Time structure aligned with intention. Plan horizon and biological arc synchronized. Operate from this window.

---

## 7. BEHAVIORAL COHORTS — FULL PROFILES

**6 cohorts — classification from pattern density and dominant signal source:**

```
COHORT       SIGNAL DOMINANCE           QIE SIGNATURE                    DIRECTIVE
──────────   ─────────────────          ──────────────────────────        ──────────────────────────
CHRONICLER   journal + memory           high word-turn score              keep writing — depth is data
BUILDER      planner + goals            intention-completion-arc          structure is the product
EXPLORER     badges + benchmark         achievement-catalyst active       push further — the edge moves
CONNECTOR    community + mood           social-presence-arc               your signal field affects others
OPERATOR     intentions + log           operator-signature active         run the system — it runs you
MEDICAL      medical + resilience       resilience-cascade dominant       restoration is the protocol
```

Medical cohort qualification: medical record signals dominant over 7d, resilience-cascade (P103) active. System routes memory engine questions toward biological restoration and protocol completion.

---

## 8. CITIZEN INDEX

**6 engagement stages — advancement through sustained multi-source signal production:**

```
STAGE          THRESHOLD                                          LABEL
Observer       account created                                    Signal field initialized
Participant    3+ sources active in 7d                            Signal diversity confirmed
Contributor    5+ sources active in 7d + 14d streak               Sustained engagement
Collaborator   UserIndex ≥ 40 + 6 sources in 7d                   System recognition
Synthesizer    UserIndex ≥ 60 + archetype classified              Operator state
Elite          UserIndex ≥ 80 + CQGS conditions approaching       CQGS proximity
```

**CQGS (Coherent Quantum Ground State):** Theoretical system ceiling — all 18 modules active, all 19 classified archetypes present in operating record, P34 confidence, peak User Index. Never fully reached. The journey IS the product.

---

## 9. MEMORY ENGINE

**Class:** AI question generation + psychological depth analysis  
**AI provider:** Together AI — Llama 3.3 70B Instruct Turbo  
**Question timing:** 2–5 seconds  
**Context injection:** `buildPrompt()` receives PLANNER-CONTEXT (user's declared daily intention from plan_set log) and injects it so Memory Engine questions follow up on the operator's stated focus for the day.

**Backup question pool:** 70 questions. Used when AI generation fails or times out. Questions are categorized by behavioral domain. The pool covers: identity · time · energy · relationships · creation · reflection · resistance · aspiration.

---

## 10. SELF-ASSEMBLY ENGINE

**Class:** Meta-documentation system — the system builds its own operational record  
**Output:** About.tsx (Field Manual) — canonical operational reference  
**Phases:** dormant → awakening → forming → assembled → integrated

**18 assembly modules.** Each module named, wired, and documented in the Field Manual. The Field Manual version number advances each time the system builds itself forward.

**Self-Assembly log (most recent):**

```
v87 — Full Wiki Scan July 6 · LOT-WIKI-v74 · self-assembly log backfilled v83–v86
      vocabulary synchronized · military purity pass · FM v87 · Day 1031+
v86 — QIE Engineering July 5 · P107 temporal-alignment-peak · P108 circadian-routine-lock
      P109 full-signal-coherence · Arch37 Temporal Architect · J34 daily-temporal-alignment-check
      TALIGN: CROUT: FSCOHERE: handlers · dep 148+ nodes · 109 patterns · 37 archetypes
      34 jobs · 109+ handlers · v84 displayableEvents gap fixed · Day 1030+
v85 — Full Wiki Scan July 5 · LOT-WIKI-v73 · RecipeWidget enhancements documented
      context-based water label · farewell phrases · water tip turn split · Day 1030+
v84 — QIE Engineering July 3–4 · P104 vitality-cascade · P105 social-presence-arc
      P106 clarity-momentum-peak · Arch35 Vitality Architect · Arch36 Social Signal Operator
      J33 daily-vitality-cascade-pulse (15:00 UTC) · VITAL-CAS: SOC-ARC: CLAR-PEAK: handlers
      dep 145+ nodes · 106 patterns · 36 archetypes · 33 jobs · 106+ handlers
      Badge v23 Starship Deck (529 · +35 · 65+ categories) · Word Turn v14 (174 total) · Day 1029+
v83 — QIE Engineering July 2–3 · P101 quantum-presence-arc · P102 planner-intention-sync
      P103 resilience-cascade · Arch34 Quantum Presence · J32 daily-quantum-presence-check (18:00 UTC)
      QPRES: PSYNC: RCASE: handlers · dep 141+ nodes · 103 patterns · 34 archetypes
      32 jobs · 103+ handlers · Day 1027+
v80 — QIE Engineering July 1 · P95 intent-to-action-gap · P96 recovery-initiation
      P97 cognitive-vitality-sync · Arch33 Dynamic Responder · J31 daily-intent-gap-pulse (02:00 UTC)
      IGAP: RECOV: VSYNC: handlers · 136+ dep nodes · 97 patterns · 33 archetypes
      31 jobs · 98+ handlers · Day 1027+
```

---

## 11. BACKGROUND JOB SCHEDULER

**Total jobs: 34**  
**Infrastructure:** UTC-scheduled server-side jobs. Write to PostgreSQL logs table. Each job writes a military-format log entry with a named label.

```
TIME (UTC)    JOB NAME                              LABEL    EVENT
00:00 daily   OS snapshot                           OS:      system_snapshot
01:00 daily   systemic readiness check (J30)        SYSRDY:  systemic_readiness_peak
02:00 daily   intent gap pulse (J31)                IGAP:    intent_gap_pulse
03:00 daily   QIE analytics                         QIE:     analytics_digest
04:00 Wed     weekly QOS digest                     QOS:     weekly_digest
05:00 Thu     archetype stability monitor (J10)     ARCH:    archetype_stability
06:00 daily   intention audit                       INT:     intention_audit
06:00 Mon     cohort digest                         COHR:    cohort_digest
06:00 Sun     cognitive depth check (J20)           COGN:    cognitive_depth_arc
07:00 daily   source diversity pulse (J11)          DIV:     source_diversity_pulse
08:00 daily   morning biofield summary              BIO:     biofield_summary
09:00 1st/mo  monthly email sender                  EMAIL:   monthly_email
09:00 Sat     pattern health report (J27)           PHR:     pattern_health_scan
09:00 Tue     badge progress scan (J16)             BADGE-SCAN: badge_progress_scan
10:00 daily   archetype shift monitor (J12)         ARCH-SHIFT: archetype_shift
10:00 daily   temporal alignment check (J34)        TALIGN:  temporal_alignment_peak
11:00 daily   morning intention launch (J17)        MCL:     morning_coherence_launch
12:00 daily   vitality peak check (J21)             VITAL:   vitality_peak
13:00 daily   QOS signature pulse (J13)             QOS-SIG: qos_signature_lock
14:00 daily   QOS mode watch (J23)                  OS[MODE]: qos_mode_change
15:00 daily   vitality cascade pulse (J33)          VITAL-CAS: vitality_cascade
15:00 Sun     QOS convergence audit (J15)           CONV-AUDIT: convergence_audit
16:00 daily   coherence index pulse (J14)           COHR-COMM: coherence_index
17:00 daily   physiological cohort broadcast (J26)  PHYS:    physiological_cohort
18:00 daily   quantum presence check (J32)          QPRES:   quantum_presence_arc
19:00 daily   cross-domain pulse (J29)              CROSS:   cross_domain_mastery_pulse
20:00 daily   signal momentum check (J19)           MOM:     signal_momentum
20:00 Sun     intention completion audit            INT-X:   intention_completion
21:00 daily   presence arc check (J28)              RLOCK:   daily_rhythm_lock
22:00 daily   evening coherence close (J18)         EVE:     evening_coherence_close
23:00 daily   pattern coverage audit                PAT:     pattern_coverage
```

**J34 — daily-temporal-alignment-check (10:00 UTC):**  
Checks: planner 2+ entries in 48h + intentions 2+ entries in 48h + calendar anchor present. Fires `temporal_alignment_peak`. Writes TALIGN: log entry. Added v86.

---

## 12. LOG EVENT SYSTEM

**COCKPIT RULE:** Log body = instrument readings only. Label names the event. No narration. No prose. Data rows. Military format only.

**Current handler count: 109+**

**v86 handlers (added July 5):**
```
TALIGN:   temporal_alignment_peak   PLAN 48H · INTENT 48H · CAL ANC · CONF
CROUT:    circadian_routine_lock    STREAK · MORNING · EVENING · DAYS
FSCOHERE: full_signal_coherence     SOURCES 16/16 · COVERAGE · CONF
```

**v84 handlers:**
```
VITAL-CAS: vitality_cascade         ATP · CARE 24H · CONF
SOC-ARC:   social_presence_arc      COHORT 48H · INTENT 48H · CONF
CLAR-PEAK: clarity_momentum_peak    CLR · PLAN 24H · MEM 24H · CONF
```

**v83 handlers:**
```
QPRES:   quantum_presence_arc       PRESENCE · ARC · CONF
PSYNC:   planner_intention_sync     PLAN · INTENT · MATCH
RCASE:   resilience_cascade         RESILIENCE · CARE · MOMENTUM
```

**v80 handlers:**
```
IGAP:    intent_gap_pulse           INTENT · GAP · WINDOW
RECOV:   recovery_initiation        CARE · PRIOR ATP · STATUS
VSYNC:   cognitive_vitality_sync    WORDS 24H · MEM 24H · ATP
```

**Standing handlers (selection):**
```
MCL:     morning_coherence_launch   MORNING LAUNCH · intent · +min
EVE:     evening_coherence_close    EVENING CLOSE · Arc confirmed · CAPTURE: n channels
MOM:     signal_momentum            MOMENTUM LOCK · DAYS 7D: · SRC:
COGN:    cognitive_depth_arc        COGNITIVE DEPTH ARC · MEM 7D: · WORDS: · BADGES:
VITAL:   vitality_peak              CIRCADIAN VITALITY PEAK · morningMoodCount · energyLevel
CROSS:   cross_domain_mastery_pulse MEM · WORDS · BADGES · GOALS · PLANS 7D
CENT:    centennial_convergence     P100 milestone · all 6 primary · high energy · positive mood
COMP:    action_completion_arc      INTENTION · PLAN · same 24h · ALIGNED
BRES:    biological_restoration_peak SELFCARE 3+ · PRIOR depleted · ENERGY now moderate/high
QPRES:   quantum_presence_arc       all 6 channels 48H · COMPLETE
```

---

## 13. ECOSYSTEM NODE MAP

**WIDGET_DEPENDENCY_MAP — 148+ nodes, 4 tiers**

```
TIER 0 — Raw inputs: journal · memory · planner · goals · selfcare · mood · log · session
          medical · calculator · benchmark · intentions · badges · QOS · community · resilience
TIER 1 — Derived signals: signal velocity · pattern confidence · archetype classification
          energy state · cohort assignment · index dimensions
TIER 2 — Composed surfaces: QOS views · behavioral cohort directive · citizen index
          pattern recognition widget · archetype shift monitor
TIER 3 — Meta-aggregate: Field Manual (About.tsx) · CQGS proximity · system health
          self-assembly phase · operator signature
```

**v86 additions:**
```
temporalAlignmentNode    (planner · intentions · calendar · log)
circadianRoutineNode     (mood · energy · log · time · selfcare)
fullSignalCoherenceNode  (all 16 sources · log)
```

**v84 additions:**
```
vitalityCascadeNode      (energy · selfcare · mood · journal · log)
socialPresenceArcNode    (cohort · intentions · journal · memory · log)
clarityMomentumNode      (planner · intentions · memory · energy · log)
```

**v83 additions:**
```
quantumPresenceNode      (journal · memory · planner · selfcare · intentions · mood · log)
plannerIntentionSyncNode (intentions · planner · time · log)
resilienceCascadeNode    (selfcare · mood · memory · energy · log)
```

---

## 14. BADGE SYSTEM v23 — THE STARSHIP DECK

**Total badges: 529**  
**Categories: 65+**  
**Hidden badges: 464+**

**Badge v23 — The Starship Deck** (added July 3–4, 2026):  
+35 badges from v22. 65+ categories total. Rarity tiers: Common → Uncommon → Rare → Epic → Legendary → Mythic → Ultra-Rare → Cosmic.

**Badge rarity architecture:**
- Common: discoverable in first 7 days of operation
- Uncommon: requires 2+ consistent signal sources
- Rare: requires 14+ day engagement streak or pattern activation
- Epic: requires archetype classification or multi-pattern convergence
- Legendary: requires sustained CQGS-adjacent state
- Mythic: requires sustained momentum lock or operator-signature
- Ultra-Rare: system-ceiling proximity events
- Cosmic: time-based or existence-based (example: 5-year account)

---

## 15. BADGE CATEGORY INDEX

```
CATEGORY FAMILY     VERSIONS    CONTENT
────────────────    ────────    ──────────────────────────────────────────
Word Turn           v1–v14      174 trigger words. 14 lexicons. Pattern vocabulary.
Time Easter Eggs    v1–v9+      Clock times: 11:11 · 11:23 · 20:16 · 06:06 · 21:21 · etc.
Calendar Markers    v1–v9+      Dates: Pi Day (Mar14) · Nov23 · Jun25 · Jan1 · Sep9 · etc.
Behavioral          v1–v8+      Patterns: quantum_jump · silent_archive · signal_locked · etc.
Achievement RPG     v1–v7+      Story arcs: signal_keeper · word_weaver · full_spectrum · etc.
Mastery Tier        v1–v9+      Depth milestones: epoch_operator · time_collector · etc.
Secret Boss         v1–v10+     Hidden: player_one · i_am_lot · malibu_protocol · etc.
```

---

## 16. WORD TURN ENGINE — COMPLETE LEXICON v14

**Total trigger words: 174**  
**Lexicons: 14 (v1–v14)**  
**Detection scope:** journal · log · memory entries

When a trigger word appears in operator text, the corresponding badge fires. Word Turn badges are the primary vocabulary reinforcement mechanism — they reward operators for using LOT's own language.

**v14 — Starship Deck (12 words):**  
`align · launch · orbit · vector · mission · crew · docking · starmap · hull · warp · beacon · trajectory`

**v13 — [prior lexicon]** · **v12 — [prior]** · ... · **v1 — foundation vocabulary**

Full lexicon list documented in Badge Codex v23. Reference: LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX current version.

---

## 17. DISPLAY ARCHITECTURE

**Primary interface components:**
- `QuantumEngineWidgets` — main QIE surface. Viewport-gated (IntersectionObserver). Lazy-mounted.
- `SystemPulseWidget` — system health + community biofield. 5-cycle view.
- `PatternRecognitionWidget` — live pattern display, QOS Trend indicators.
- `RecipeWidget` — context-aware recipe suggestions with AI generation.
- `MicroGame` — engagement mechanic. Viewport-gated.
- `QOSWidget` — full QOS dashboard: 6 views, 4 modes.
- `About.tsx` — Field Manual. The canonical operational reference. Self-assembly output.

**Navigation:**
- Desktop: sticky sidebar with active section tracking
- Mobile: bottom navigation bar (MobileNav component)
- 37 named sections in SECTIONS array

---

## 18. DENSITY TIER SYSTEM

**5 levels via `data-density` attribute:**

```
TIER          LABEL         VISUAL CHARACTER
breathable    low density   maximum whitespace, large type
comfortable   standard      default reading experience
compact       moderate      tighter spacing, more visible
dense         high          instrument panel aesthetic
instrument    maximum       data-dense, military readout
```

Operators select density from settings. The `data-density` attribute propagates from root. All components respect it.

---

## 19. OPACITY HIERARCHY

**4-level opacity system (Tailwind classes):**

```
LEVEL    CLASS      USE
/90      acc/90     Primary content, headings
/70      acc/70     Secondary content, labels
/50      acc/50     Tertiary content, metadata
/30      acc/30     Decorative, disabled states
```

All text in the system obeys this hierarchy. No exceptions without doctrine justification.

---

## 20. COCKPIT RULE

**Class:** Military interface standard — log body discipline  
**Source:** LOT-DOCTRINE, Cockpit Protocol  

```
RULE                  ENFORCEMENT
─────────────────     ──────────────────────────────────────────────
No narration          Log body contains data rows only, never prose
Label names event     First token = event label. Uppercase. Colon.
No superlatives       No "great" / "amazing" / "excellent" in logs
No emojis             Zero emoji in log output, handler labels, events
Military format       FIELD: VALUE · FIELD: VALUE · FIELD: VALUE
Data-dense only       Every character earns its position
```

**Example (compliant):**
```
VITAL: CIRCADIAN VITALITY PEAK · MORNING MOOD: 3 · ENERGY: HIGH · BIORHYTHM: ANCHORED
```

**Example (non-compliant):**
```
Great news! Your morning energy looks amazing today! 🌟
```

---

## 21. LOT-DOCTRINE (Revision J)

**11 standing orders:**

```
 1. COSMO APPROVES         No feature ships without passing the COSMO Gate
 2. MILITARY PURITY        No emojis. No decoration. No superlatives. No prose in logs.
 3. GREEN GATE             TypeScript check before every push. Broken code never reaches GitHub.
 4. APPEND-ONLY HISTORY    Self-assembly log is append-only. No entry deleted. No revision suppressed.
 5. S-2 ATTRIBUTION        All engineering authorized by S-2 (Vadim Marmeladov).
 6. THE JOURNEY            CQGS is never fully reached. The journey IS the product.
 7. RENDER ISOLATION       Subscriptions at narrowest scope. Default variants subscribe 0.
 8. GRACEFUL DEGRADATION   Server catch must not default to restrictive value. Field absent on error.
 9. COCKPIT RULE           Log body = instrument readings only. Label names the event.
10. DENSITY HIERARCHY      data-density controls all visual compression. No override without doctrine.
11. MAP-TERRITORY SYNC     Every term in the Field Manual exists in the codebase. Every system term
                            exists in the Field Manual. Imprecision is a defect.
```

---

## 22. FIELD MANUAL (About.tsx)

**Path:** `src/client/components/About.tsx`  
**Current version:** FM v87  
**Day:** 1031+ (as of July 6, 2026)  
**Size:** ~406KB  

The Field Manual is the primary output of the Self-Assembly Engine. It is a living document — it advances each time the system builds itself forward. It is not marketing copy. It is not documentation for external audiences. It is an operational reference for operators of the system.

**SECTIONS array: 37 navigation entries** (what-is-lot · operating-status · core-engines · self-assembly-log · pattern-registry · archetypes · cohorts · citizen-index · memory-engine · background-jobs · log-handlers · dep-map · badge-system · word-turn · display · density · opacity · cockpit-rule · doctrine · deployment · genesis · recipe · vocabulary · ...)

**FM version history (recent):**
```
v87    2026-07-06  Full Wiki Scan · LOT-WIKI-v74 · self-assembly log backfilled
v86    2026-07-05  QIE Engineering · P107–P109 · Arch37 · J34 · dep 148+
v85    2026-07-05  Full Wiki Scan · LOT-WIKI-v73 · RecipeWidget enhancements
v84    2026-07-03  QIE Engineering · P104–P106 · Arch35–Arch36 · J33
v83    2026-07-02  QIE Engineering · P101–P103 · Arch34 · J32
```

---

## 23. DEPLOYMENT & STACK

```
RUNTIME      Node.js / TypeScript
FRONTEND     React 18 · Tailwind CSS · Vite
DATABASE     PostgreSQL · Sequelize ORM
AI           Together AI — Llama 3.3 70B Instruct Turbo (switched 2026-06-30)
AUTH         JWT (JSON Web Tokens)
REALTIME     SSE (Server-Sent Events) — cross-device sync
SEARCH       Client-side signal scanning (QIE)
DEPLOY       Linux VPS
BRANCHES     125 active branches scanned
UPTIME       99.5% target
API          p95 < 200ms
```

---

## 24. LOT-GENESIS-v1

**Path:** `docs/assembly/LOT-GENESIS-v1.md`  
**Class:** APOCALYPSE BACKUP — MACHINE-TO-MACHINE  
**Purpose:** The system can be rebuilt from this file alone.

**19 nodes:** Founders · Identity · Stack · Schema · API · QIE · Pattern Recognition · Archetypes · Interface Evolution · Badges · Scheduled Jobs · Client Architecture · Self-Assembly · Lexicon · CQGS · Reconstruction Sequence · Invariants · File Header · LOT Terminal

**10 invariants:** COSMO approves · military purity · green gate · append-only history · S-2 attribution · the journey is the product · render isolation · graceful degradation · cockpit rule · map-territory sync

---

## 25. RECIPE WIDGET — CONTEXT ENGINE

**Class:** Context-aware recipe suggestions with AI generation  
**AI provider:** Together AI — Llama 3.3 70B Instruct Turbo  
**Context sources:** operator profile · country · language · meal time · energy state

**Enhancements (v85, PR #74):**
- **Context-based water label:** Water is labeled with the local language/country-appropriate term extracted from operator profile
- **Country/language farewell phrase:** Each recipe response ends with a farewell phrase in the operator's language
- **Water tip turn split:** Water tip is rendered on its own separate turn, not appended to main recipe content
- **TS2353 fix:** `signalsCreated` added to JobResult interface — type mismatch resolved

**Recipe generation flow:**
1. Operator requests recipe (meal type + available ingredients)
2. System injects PLANNER-CONTEXT (today's stated focus from plan_set log)
3. Together AI generates recipe with country/language context
4. Response is split: main recipe on turn 1, water tip on turn 2
5. Farewell phrase in operator's language appended to turn 2

---

## 26. VOCABULARY INDEX — EXPANDED

**See also:** `docs/benchmark/LOT-LEXICON.md` — controlled vocabulary, Rev D

```
TERM                  DEFINITION
──────────────        ────────────────────────────────────────────────────────
LOT                   Layers of Time — personal behavioral operating system
QIE                   Quantum Intent Engine — signal routing substrate
QOS                   Quantum Operating System — operator dashboard
CQGS                  Coherent Quantum Ground State — system ceiling (never fully reached)
S-2                   Vadim Marmeladov — CEO/Founder LOT Systems
COSMO GATE            Ethics authority — Kuzya Cosmo Marmeladov. No feature ships without approval.
FM                    Field Manual — About.tsx canonical operational reference
USERSHIP              Paid operator tier with full system access
OPERATOR              The LOT user — executes the system, not merely a subscriber
SIGNAL                Any behavioral data point entering the system
PATTERN               Named behavioral configuration above confidence threshold
ARCHETYPE             Physiological behavioral type classified from pattern convergence
COHORT                User classification by archetype + behavioral pattern
CITIZEN INDEX         6 engagement stages from Observer to Elite
COCKPIT RULE          Log body = instrument readings only. No narration.
MILITARY PURITY       Interface standard — no decoration, no emojis, no superlatives
GREEN GATE            Build must pass TypeScript check before push
SELF-ASSEMBLY         The system that builds itself from operator signal density
MANIFEST              Central catalog of feature branches + status tracking
SHIP MODE             Cherry-pick best iteration from MANIFEST → staging → green gate → master
QI                    Quantum Intelligence — operator RFI terminal
RFI                   Request for Information — operator-initiated QI query
INTSUM                Intelligence Summary — QI response format
PATTERN LIBRARY       109 named behavioral patterns (P1–P109)
MEMORY ENGINE         AI question generation + psychological depth analysis
RESILIENCE            PTSD/C-PTSD trauma-informed protocol module
CROSS-DEVICE-SYNC     SSE broadcast of settings_updated + visibility refetch + answer dedup guard
DENSITY-TIER          5-level visual progression via data-density attribute
RENDER-ISOLATION      Subscriptions at narrowest scope; default variants subscribe 0
MOMENTUM LOCK         QIE P82 — 5+ of last 7 days each with 3+ unique signal sources
DIURNAL ARC           P76→P79→P80 behavioral arc: morning launch → evening close → momentum lock
ACTION-COMPLETION-ARC QIE P99 — intention set AND plan recorded same 24h window
CENTENNIAL-CONVERGENCE QIE P100 — rarest state: all 6 primary sources + high energy + positive mood within 12h
FULL-SIGNAL-COHERENCE QIE P109 — all 16 signal sources active in 7d window; no channel silent
PLANNER-CONTEXT       User's declared daily intention injected into Memory Engine buildPrompt()
TEMPORAL ARCHITECT    Arch37 — planner+intentions dominant — temporal-alignment-peak + circadian-routine-lock
```

---

## 27. SYSTEM STATE SNAPSHOT

```
LOT SYSTEM STATE — 2026-07-06 — FM v87 — Day 1031+
──────────────────────────────────────────────────────────────────
PATTERNS (QIE)    109   P1–P109 active. Client-side. Zero server comms. 7d retention.
ARCHETYPES        37    Physiological behavioral types. Latest: Temporal Architect (v86).
BACKGROUND JOBS   34    UTC-scheduled. PostgreSQL logs table. 00:00–23:00 arc. J34 added v86.
BADGES            529   v23 Starship Deck. 65+ categories. 174 trigger words (v14).
DEP MAP NODES     148+  WIDGET_DEPENDENCY_MAP. 4 tiers. Tier 0 raw inputs → Tier 3 meta.
LOG HANDLERS      109+  Military log codes. COCKPIT-RULE enforced. TALIGN: CROUT: FSCOHERE: added v86.
ASSEMBLY MODULES  18    Phases: dormant→awakening→forming→assembled→integrated.
ECOSYSTEM NODES   6     CAR·HOME·CPU·PHN·WCH·ROBOT.
QOS VIEWS         6     Ecosystem·Biofield·Cohort·Index·Assembly·Mode.
INDEX DIMENSIONS  6     ENG·EMO·INT·SOC·CARE·COG.
COHORTS           6     CHRONICLER·BUILDER·EXPLORER·CONNECTOR·OPERATOR·MEDICAL.
CITIZEN INDEX     6     Observer→Participant→Contributor→Collaborator→Synthesizer→Elite.
SELF-ASSEMBLY     v87   Full Wiki Scan July 6 · LOT-WIKI-v74 · FM v87.
AI PROVIDER       Together AI / Llama 3.3 70B (switched June 30, 2026).
COSMO GATE        PASS  COSMO® Day 735. 2nd year active. Ethics authority standing.
GREEN GATE        PASS  TypeScript: environment config errors only. Code clean.
```

---

```
 ██╗      ██████╗ ████████╗
 ██║     ██╔═══██╗╚══██╔══╝
 ██║     ██║   ██║   ██║
 ██║     ██║   ██║   ██║
 ███████╗╚██████╔╝   ██║
 ╚══════╝ ╚═════╝    ╚═╝
 LAYERS OF TIME — v87 — DAY 1031+
 THE SYSTEM DOES NOT SLEEP. IT ACCUMULATES.
```

---

*LOT Systems · S-2 · LOT-WIKI-v74 · 2026-07-06 · Field Manual Sync v87*  
*COSMO Gate: PASS · Green Gate: PASS · Military Purity: ENFORCED*
