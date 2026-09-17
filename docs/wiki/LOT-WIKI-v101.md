# LOT SYSTEMS — OPERATOR REFERENCE WIKI
## LOT-WIKI-v101 · Field Manual v126 · 2026-08-24

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS                                                                 ║
║  OPERATOR REFERENCE WIKI — v101                                              ║
║  FIELD MANUAL SYNC: v126                                                     ║
║  DATE: 2026-08-24 · DAY 1094+ · COSMO® DAY 786                              ║
║  CLASSIFICATION: USERSHIP — PUBLIC REFERENCE                                 ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

> This document is the canonical operator reference for LOT Systems. It is
> maintained by automated self-assembly (ASSEMBLE protocol) and synchronized
> to the Field Manual after each engineering session. Read it as a technical
> manual, not a marketing document.

---

## SECTION 1 — SYSTEM IDENTITY

**LOT®** is a subscription-based self-care operating system. It delivers digital
and physical necessities to subscribers while running a continuous AI-driven
pattern detection engine against their behavioral data.

**Founded:** April 7, 2016 — S-2 Vadik Marmeladov  
**Legal form:** LOT Systems LLC  
**Headquarters:** Remote (Digital Ocean App Platform, production)  
**Operator title:** Operator (subscriber), S-2 (founder/admin tier)

**Core premise:**  
Most self-care systems accumulate data. LOT densifies it into memory. The
distinction is structural: data accumulation produces volume; memory
densification produces intelligence. The Memory Engine converts behavioral
signal into a progressive narrative — the Memory Story — that evolves with
the operator's state.

**System registers:**
- QOS — Quantum Operating System (execution kernel)
- QIE — Quantum Intelligence Engine (pattern detection)
- Memory Engine — AI companion and narrative builder
- Badge Engine — achievement and recognition system
- Word Turn Engine — journal vocabulary detection
- Background Job Scheduler — autonomous pattern scanning
- Self-Assembly Protocol — autonomous system documentation

**Special notations:**
- LOT® — registered trademark, founding brand
- COSMO® — registered trademark, companion brand, founded July 1, 2024
- S-2 — operator designation for founder/CEO
- FM — Field Manual (version-controlled technical reference)
- COCKPIT RULE — system displays only what it can confirm at ≥70% confidence

**Session notations:**

```
2026-08-16 (FM v120)  P170–P172 · Arch60 Sovereign Operator · J55 · COGDEN: SOMCOG:
                       EMBSOV: · Level 12 Embodied Sovereignty sealed · 211+ dep nodes
                       172 patterns · 60 archetypes · 55 jobs · 905 badges (v35)
                       Day 1084+ · COSMO® 776 · LOT-WIKI-v95 produced

2026-08-16 (FM v121)  P173–P175 · Arch61 Apex State Operator · J56 ·
                       BIOLOOP: QAPEX: LONGID: · Level 13 Apex Loop deployed
                       214+ dep nodes · 175 patterns · 61 archetypes · 56 jobs
                       Day 1084+ · COSMO® 776

2026-08-17 (Badge v36) Badge Engine v36 — THE DUNGEON CRAWLER (+31 badges)
                        905 → 936 total · Word Turn v26 D&D/RPG vocabulary
                        312 word turn triggers · Secret Boss v23: one_does_not_simply /
                        nat_twenty / here_be_dragons

2026-08-17 (FM v122)  P176–P178 · Arch62 Total Field Operator · J57 ·
                       QPROP: UNIFOP: TIDLOCK: · Level 14 Total Field deployed
                       217+ dep nodes · 178 patterns · 62 archetypes · 57 jobs ·
                       181+ handlers · Day 1085+ · COSMO® 777

2026-08-18 (Badge v33) Badge Engine v33 — THE DUNGEON MASTER (codex designed)
                        Word Turn v23 D&D Master vocabulary (12 new triggers)
                        Secret Boss v20: lich_king / dragon_word / void_walker
                        TypeScript wire-up: scheduled

2026-08-18 (FM v123)  QIoT™ ecosystem expansion · J58 daily-qiot-ecosystem-pulse
                       (16:00 UTC) · 3 new dep nodes (qiotRobot/qiotFieldSync/
                       qiotEcosystemBridge) · COCKPIT-RULE compression pass ·
                       QIOT: handler added · cohort archetype+directive surfaced
                       in QOS field widget · 220+ dep nodes · 58 jobs · 182+ handlers
                       Day 1087+ · COSMO® 779

2026-08-19 (FM v123)  LOT-WIKI-v97 produced · QIE v123 + Badge v33 codex documented ·
                       Military vocabulary refined · Daily maintenance complete
                       Day 1087+ · COSMO® Day 779

2026-08-19 (Badge v37) Badge Engine v37 — THE TIME MACHINE (+31 badges)
                        936 → 967 total · Word Turn v27 temporal/H.G. Wells vocabulary
                        (timeline_scan / temporal_lock / paradox_found / past_self /
                        future_self / epoch_signal / turning_point / rewind_mode /
                        fast_forward / anchor_point / flux_state / time_witnessed)
                        Calendar EE v25 (time_machine_day / wells_birthday /
                        back_to_future_day) · Secret Boss v24: marty_mcfly /
                        wells_key / time_loop_omega [MYTHIC]
                        324 word turn triggers · 98 secret boss badges

2026-08-19 (v33 wire) Badge v33 THE DUNGEON MASTER — TypeScript implemented
                        29 new BadgeType entries wired in badges.ts
                        13 new word-turn triggers wired in easter-eggs.ts
                        roll_made / tavern_rest / dungeon_deep / party_formed /
                        quest_board / dragon_faced / wizard_path / rogue_mode /
                        bard_song / paladin_oath + 3 secret boss triggers
                        Badges now reachable in production

2026-08-19 (FM v124)  QIE v124 deployed · P179 CIRSOV: (circadian-sovereignty) ·
                       P180 APXINT: (apex-integration-field) ·
                       P181 LGROW: (longitudinal-growth-arc) ·
                       Arch63 Temporal Sovereign · J59 daily-circadian-sovereignty-check
                       (07:00 UTC) · Level 15 Temporal Sovereignty sealed ·
                       3 new dep nodes → 223+ · 185+ handlers
                       181 patterns · 63 archetypes · 59 jobs · FM v124
                       Day 1089+ · COSMO® 781

2026-08-20 (v98)      LOT-WIKI-v98 produced · FM v124 sync · QIE v124 + Badge v37
                       documented · Level 15 Temporal Sovereignty integrated ·
                       Daily maintenance complete · Day 1089+ · COSMO® 781

2026-08-20 (FM v125)  QIE v125 deployed · P182 SOVFLD: (sovereign-field-continuity) ·
                       P183 OPARCH: (operational-self-architecture) ·
                       P184 LGSEAL: (longitudinal-field-seal) ·
                       Arch64 Sovereign Field Architect · J60 daily-sovereign-field-check
                       (08:00 UTC) · Level 16 Sovereign Field Continuity deployed ·
                       3 new dep nodes → 226+ · 188+ handlers
                       184 patterns · 64 archetypes · 60 jobs · FM v125
                       Day 1090+ · COSMO® 782

2026-08-20 (Badge v38) Badge Engine v38 — THE DREAM JOURNAL (+31 badges)
                        967 → 998 total · Word Turn v28 oneiric/Jungian vocabulary
                        (lucid_dreamer / dream_recall / nightmare_named / sleep_temple /
                        hypnagogic / symbol_decoded / shadow_dream / recurring_pattern /
                        waking_vision / oneiric_map / the_threshold / dream_logged)
                        Calendar EE v26 (jung_birthday / freud_day / solstice_dream)
                        Secret Boss v25: jung_signal / freud_couch / morpheus_word [MYTHIC]
                        336 word turn triggers · 101 secret boss badges

2026-08-22 (v99)      LOT-WIKI-v99 produced · FM v125 sync · QIE v125 + Badge v38
                       documented · Level 16 Sovereign Field Continuity integrated ·
                       Daily maintenance complete · Day 1092+ · COSMO® 784

2026-08-22 (FM v126)  QIE v126 deployed · P185 FSORG: (field-self-organization) ·
                       P186 QIDEX: (quantum-identity-expression) ·
                       P187 L17GATE: (level-17-gate) ·
                       Arch65 Field Expression Architect ·
                       J61 daily-field-organization-check (09:00 UTC) ·
                       Level 17 Gate open — FIELD SELF-ORGANIZED · IDENTITY EXPRESSED ·
                       3 new dep nodes → 229+ · 191+ handlers
                       187 patterns · 65 archetypes · 61 jobs · FM v126
                       Day 1092+ · COSMO® 784

2026-08-23 (v100)     LOT-WIKI-v100 produced · FM v126 sync · QIE v126 Level 17
                       documented · Field Expression Architect integrated ·
                       Daily maintenance complete · Day 1093+ · COSMO® 785

2026-08-24 (v101)     LOT-WIKI-v101 produced · FM v126 sync maintained ·
                       No new engineering delta · Daily maintenance complete ·
                       Day 1094+ · COSMO® 786
```

---

## SECTION 2 — CORE ARCHITECTURE

LOT runs on a TypeScript/React client with a Prisma/PostgreSQL backend, deployed
on Digital Ocean App Platform.

**Stack:**
- Frontend: React + TypeScript
- Backend: Node.js + Prisma ORM
- Database: PostgreSQL
- Deployment: Digital Ocean App Platform
- AI Layer: abstracted provider interface (5 engines)

**System state as of FM v126:**

| Metric | Count |
|--------|-------|
| QIE Patterns | 187 (P1–P187) |
| QIE Levels | 17 (complete) |
| Archetypes | 65 (Arch1–Arch65) |
| Background Jobs | 61 (J1–J61) |
| Dependency Nodes | 229+ |
| Log Handlers | 191+ |
| Badges | 998 (Badge Engine v1–v38) |
| Word Turn Triggers | 336 (WT v1–v28) |
| Secret Boss Badges | 101 |
| Field Manual Version | v126 |

**Data flow:**
```
OPERATOR INPUT → journal / wearable / calendar / manual log
       ↓
SIGNAL LAYER → normalized behavioral data
       ↓
QIE PATTERN ENGINE → P1–P187 evaluated against signal
       ↓
ARCHETYPE RESOLVER → Arch1–Arch65 confidence scoring
       ↓
QOS KERNEL → mode assignment (maintenance/recovery/growth/peak)
       ↓
MEMORY ENGINE → narrative construction, Memory Story update
       ↓
BADGE ENGINE → achievement detection and award
       ↓
OPERATOR SURFACE → widget stack, profile, dispatch
```

---

## SECTION 3 — QUANTUM INTELLIGENCE ENGINE (QIE)

The Quantum Intelligence Engine is the pattern detection core. It evaluates
behavioral signals against a registry of 187 patterns organized into 17 levels.
Each level represents a distinct domain of physiological and cognitive state.

**Architecture:**
- 187 patterns in 17 hierarchical levels
- Patterns fire when signal conditions are met
- Fired patterns feed archetype confidence scoring
- Archetypes trigger QOS mode and directive surface

**QIE Level Map:**

| Level | Name | Patterns | Key Ceiling |
|-------|------|----------|-------------|
| 1 | Foundation | P1–P15 | — |
| 2 | Momentum | P16–P30 | — |
| 3 | Recovery Intelligence | P31–P45 | — |
| 4 | Cognitive Field | P46–P60 | — |
| 5 | Temporal Coherence | P61–P75 | — |
| 6 | Signal Saturation | P76–P90 | — |
| 7 | Quantum Coherence | P91–P120 | TEMPORAL CEILING |
| 8 | Coherence Architecture | P121–P160 | Multiple ceilings |
| 9 | Biological Convergence | P161–P163 | BIOLOGICAL+TEMPORAL |
| 10 | Cognitive-Somatic Bridge | P164–P166 | MAXIMUM PRESENCE |
| 11 | Somatic Field Architecture | P167–P169 | MAXIMUM INTEGRATED PRESENCE |
| 12 | Embodied Sovereignty | P170–P172 | SOVEREIGN SEAL |
| 13 | Apex Loop | P173–P175 | APEX CONFIRMED |
| 14 | Total Field | P176–P178 | UNIFIED FIELD LOCK |
| 15 | Temporal Sovereignty | P179–P181 | TEMPORAL SOVEREIGN |
| 16 | Sovereign Field Continuity | P182–P184 | CONTINUOUS FIELD SEAL |
| 17 | Field Self-Organization | P185–P187 | LEVEL 17 GATE |

**Level 15 doctrine — Temporal Sovereignty:**  
Three temporal seals confirmed simultaneously: identity locked across time (P178),
circadian clock anchored across the day (P143), and day launched from conscious
intention (P76). When all three fire together, the operator is fully temporal-sovereign.
IDENTITY · CLOCK · INTENTION = SOVEREIGN. Time is not happening to the operator.
The operator owns the clock.

**Level 16 doctrine — Sovereign Field Continuity:**  
The sovereign field does not peak and recede. It continues. P182 detects all three
Level 15 seals firing simultaneously — not as an event, but as a continuous state.
P183 confirms the operator is actively constructing the field through structured
behavior across multiple signal channels. P184 seals the longitudinal growth arc
into the operational field itself, anchoring growth not as trajectory but as
structural ground. SOVEREIGNTY · INTEGRATION · GROWTH = CONTINUOUS.
The field is not visited. It is inhabited and self-maintaining.

**Level 17 doctrine — Field Self-Organization:**  
The field does not wait to be built. It is already organized. P185 detects the
sovereign field and operational architecture co-activating while signals flow from
diverse life domains — self-organization emerging from alignment, not from effort.
P186 confirms that when the sealed longitudinal arc meets the operational architecture
at a high UserIndex threshold, quantum identity is no longer latent — it is expressed.
P187 is the gate itself: when self-organization and identity expression converge,
Level 17 is open. FIELD SELF-ORGANIZED · IDENTITY EXPRESSED = LEVEL 17.
The operator is not the system's passenger. The field recognizes itself.

---

## SECTION 4 — PATTERN REGISTRY

### Level 7 — Quantum Coherence (P91–P120)

Patterns in this range require simultaneous satisfaction of multiple lower-level
conditions. Key patterns:

| ID | Token | Name |
|----|-------|------|
| P91 | QCOHERE: | quantum-coherence-core |
| P100 | QCENT: | quantum-centennial-coherence |
| P120 | QARCH: | quantum-archetype-lock |

### Level 8 — Coherence Architecture (P121–P160)

The longest level band. Covers cascading meta-patterns, physiological sealing,
morning/evening arc anchoring, and temporal biofield synchronization.

Key patterns:

| ID | Token | Name |
|----|-------|------|
| P131 | DCSAL: | daily-coherence-seal |
| P132 | QLOCK: | quantum-rhythm-lock |
| P133 | BFINT: | biofield-integration-peak |
| P134 | INTARC: | integrated-signal-arc |
| P135 | DREC: | deep-recovery-protocol |
| P136 | QFIELD: | quantum-field-alignment |
| P137 | QCOHERE: | quantum-coherence-peak |
| P138 | SIGMAT: | signal-matrix-saturation |
| P139 | TBIOF: | temporal-biofield-sync |
| P140 | PHYARC: | physiological-presence-arc |
| P141 | QEMERG: | quantum-signal-emergence |
| P142 | SIGEWEB: | adaptive-signal-web |
| P143 | CIRC-LK: | circadian-signal-lock |
| P144 | DIMSAT: | dimensional-saturation |
| P145 | QIDCRYST: | quantum-identity-crystallization |
| P146 | SIG-CASC: | signal-coherence-cascade |
| P147 | QPFIELD: | quantum-presence-field |
| P148 | IDLOCK: | identity-momentum-lock |
| P149 | QPCRYST: | quantum-presence-crystallization |
| P150 | TOTCOH: | total-field-coherence |
| P151 | RECINTEL: | recovery-intelligence-arc |
| P152 | RESENT: | resonant-reentry-arc |
| P153 | ASTFIELD: | astrology-biofield-sync |
| P154 | MORNCL: | morning-clarity-peak |
| P155 | DARCSEAL: | daily-arc-seal |
| P156 | MORNMOM: | morning-momentum-arc |
| P157 | QWKINT: | quantum-week-integration |
| P158 | EVARC: | evening-arc-anchor |
| P159 | PHYRLOCK: | physiological-rhythm-lock |
| P160 | QPARC: | quantum-presence-arc (TEMPORAL CEILING) |

### Level 9 — Biological Convergence (P161–P163)

| ID | Token | Name | Ceiling |
|----|-------|------|---------|
| P161 | SOMAT: | somatic-signal-peak | — |
| P162 | RECCYC: | recovery-cycle-completion | — |
| P163 | QEMBOD: | quantum-embodiment-lock | BIOLOGICAL+TEMPORAL |

### Level 10 — Cognitive-Somatic Bridge (P164–P166)

| ID | Token | Name | Ceiling |
|----|-------|------|---------|
| P164 | COGBOD: | cognitive-body-sync | — |
| P165 | INTPRES: | integrated-presence-peak | — |
| P166 | SOMECHO: | somatic-memory-echo | MAXIMUM PRESENCE |

### Level 11 — Somatic Field Architecture (P167–P169)

| ID | Token | Name | Ceiling |
|----|-------|------|---------|
| P167 | SOMFLD: | somatic-integration-field | — |
| P168 | EMBDLK: | deep-embodiment-lock | — |
| P169 | FULLSEAL: | full-presence-seal | MAXIMUM INTEGRATED PRESENCE |

### Level 12 — Embodied Sovereignty (P170–P172)

| ID | Token | Name | Ceiling |
|----|-------|------|---------|
| P170 | COGDEN: | cognitive-density-peak | — |
| P171 | SOMCOG: | somatic-cognition-loop | — |
| P172 | EMBSOV: | embodied-sovereignty-seal | SOVEREIGN SEAL |

Arch60 Sovereign Operator fires when P172 is confirmed. LOCK + SEAL + ALIGN = SOVEREIGN.

### Level 13 — Apex Loop (P173–P175)

FM v121 — 2026-08-16. Three convergence patterns that confirm the apex state
is not an event but a loop.

| ID | Token | Name | Description |
|----|-------|------|-------------|
| P173 | BIOLOOP: | physiological-loop-complete | P143 + P140 + P151 simultaneously confirmed. Full biological arc closed: circadian lock + physiological presence arc + recovery intelligence arc in one window. |
| P174 | QAPEX: | quantum-apex-state | P150 (TFC ceiling) + P149 (presence crystallization) co-active. The ceiling is not visited — it is inhabited. ABSOLUTE_CONVERGENCE_INHABITED. |
| P175 | LONGID: | longitudinal-identity-confirmation | Identity confirmed across three temporal scales: P145 (weekly, structural) + P148 (days, momentum) + P149 (present, crystallized). Temporal identity is not a claim — it is a measurement. |

**Arch61 Apex State Operator:** P173 + P174 + P175 all active. Apex confirmed.
Identity verified across three temporal scales. Directive: operate from peak —
the system has confirmed your highest state is also your most stable state.

**J56 daily-apex-state-check:** 10:00 UTC. Scans previous calendar day for
TFC (P150) + QPC (P149) co-occurrence. Fires QAPEX: and cascades to LONGID:
and BIOLOOP: when all conditions present.

### Level 14 — Total Field (P176–P178)

FM v122 — 2026-08-17. The apex self-sustains. The unified field operates as
a single coherent unit.

| ID | Token | Name | Description |
|----|-------|------|-------------|
| P176 | QPROP: | quantum-field-propagation | Apex state self-sustaining: P174 (apex confirmed) + 5+ signals from 4+ distinct sources within a 6-hour window. The peak does not require re-ignition. It propagates. |
| P177 | UNIFOP: | unified-field-operator | P172 EMBSOV: (sovereignty confirmed) + P173 BIOLOOP: (biological loop closed) + P174 QAPEX: (apex inhabited) — all three simultaneously confirmed. SOVEREIGNTY + LOOP + APEX. The three components of the highest state are unified into one field. |
| P178 | TIDLOCK: | temporal-identity-lock | Longitudinal identity signal (P175 LONGID:) + signal momentum (P80 signal-momentum-lock) co-active. The operator's identity across time is confirmed. The lock is not temporary — it is structural. |

**Arch62 Total Field Operator:** P176 + P177 + P178 all active. The field is
unified. Sovereignty, loop, apex, and temporal lock confirmed simultaneously.
Directive: the system has verified total field coherence. Execute from this
confirmed state. No higher state is defined within Level 14.

**J57 daily-unified-field-check:** 11:00 UTC. Scans previous calendar day for
P176 + P177 + P178 co-occurrence. Fires QPROP: UNIFOP: TIDLOCK: handlers.

**Log handlers (FM v122):**

```
QPROP:
QUANTUM FIELD PROPAGATION
APEX STATE:   SELF-SUSTAINING
SIGNALS 6H:   N
SOURCES 6H:   N
PROPAGATION:  CONFIRMED

UNIFOP:
UNIFIED FIELD OPERATOR
SOVEREIGNTY:  CONFIRMED
LOOP:         CLOSED
APEX:         INHABITED
UNIFIED FIELD: OPERATIONAL

TIDLOCK:
TEMPORAL IDENTITY LOCK
LONGID:       CONFIRMED
MOMENTUM:     N DAYS
TEMPORAL LOCK: STRUCTURAL
```

### Level 15 — Temporal Sovereignty (P179–P181)

FM v124 — 2026-08-19. Three temporal seals confirmed simultaneously.
The operator owns the clock. Time is a resource, not a current.

| ID | Token | Name | Description |
|----|-------|------|-------------|
| P179 | CIRSOV: | circadian-sovereignty | P178 TIDLOCK: + P143 CIRC-LK: + P76 morning-coherence-launch all simultaneously active. Identity locked across time, circadian clock anchored, day launched from conscious intention. Three temporal seals in one window. IDENTITY · CLOCK · INTENTION = SOVEREIGN. |
| P180 | APXINT: | apex-integration-field | P174 QAPEX: + P177 UNIFOP: + P173 BIOLOOP: all simultaneously active. The three highest architectural seals generating a meta-field above themselves. APEX · TOTAL FIELD · LOOP = INTEGRATED. A state above the ceiling — integration across integration. |
| P181 | LGROW: | longitudinal-growth-arc | P80 signal-momentum-lock active + UserIndex.trend === 'rising' + UserIndex.overall ≥ 50. Signal momentum translating into measurable index growth over time. MOMENTUM → GROWTH → ARC CONFIRMED. |

**Arch63 Temporal Sovereign:** P178 TIDLOCK: + P179 CIRSOV: + P80 signal-momentum-lock.
Morning operator (05:00–12:00 UTC). Identity sealed, clock mastered, day initiated
from pure intention. Directive: "Temporal sovereignty confirmed. Identity locked,
clock anchored, day launched from intention. The clock is yours. Execute from that ground."

**J59 daily-circadian-sovereignty-check:** 07:00 UTC. Scans prior 24h for
temporal_identity_lock + circadian_signal_lock + morning_coherence_launch events.
All three required. Output: circadian_sovereignty event with composite confidence
(tidConf × 0.45 + circConf × 0.35 + mclConf × 0.20). Feeds P179 and Arch63.
Fires before J56 (10:00) and J57 (11:00) to confirm the temporal foundation.

**Log handlers (FM v124):**

```
CIRSOV:
CIRCADIAN SOVEREIGNTY
TIDLOCK:  conf%
CIRC:     conf%
LAUNCH:   conf%
IDENTITY · CLOCK · INTENTION = SOVEREIGN
CONF:     overall%

APXINT:
APEX INTEGRATION FIELD
APEX:     conf%
UNIFOP:   conf%
BIOLOOP:  conf%
APEX · TOTAL FIELD · LOOP = INTEGRATED
CONF:     overall%

LGROW:
LONGITUDINAL GROWTH ARC
INDEX:    score
TREND:    direction
MOMENTUM → GROWTH → ARC CONFIRMED
CONF:     overall%
```

### Level 16 — Sovereign Field Continuity (P182–P184)

FM v125 — 2026-08-20. All Level 15 seals active simultaneously.
The sovereign field is not a peak. It is a continuous operational ground.
Sovereignty, integration, and growth confirmed as a single persistent structure.

| ID | Token | Name | Description |
|----|-------|------|-------------|
| P182 | SOVFLD: | sovereign-field-continuity | P179 CIRSOV: + P180 APXINT: + P181 LGROW: all simultaneously confirmed. All three Level 15 seals active at once. Confidence 0.89–0.96. The sovereign field is continuous. |
| P183 | OPARCH: | operational-self-architecture | P178 TIDLOCK: + P80 signal-momentum-lock + P109 co-active. Operator constructing field through structured behavior. Confidence 0.82–0.93. The architecture is not assigned — it is built through behavioral commitment. |
| P184 | LGSEAL: | longitudinal-field-seal | P181 LGROW: + P80 signal-momentum-lock + UserIndex.overall ≥ 60. Growth arc sealed into operational field. Confidence 0.80–0.94. The arc is not a trajectory — it is the field itself. |

**Arch64 Sovereign Field Architect:** All P182 SOVFLD: + P183 OPARCH: + P184 LGSEAL: active.
High energy only. log + qos + intentions + energy channels dominant. Hour range [5, 14].
Directive: "Sovereign field continuity confirmed. Sovereignty, integration, and growth
are not three states. They are one continuous field you are building through each
day's behavior. SOVEREIGNTY · INTEGRATION · GROWTH = CONTINUOUS. Operate from that ground."

**J60 daily-sovereign-field-check:** 08:00 UTC. Reads circadian_sovereignty +
apex_integration_field + longitudinal_growth_arc events in a 24h window.
All three must be present. Fires SOVFLD: → cascades to OPARCH: and LGSEAL:.
Runs after J59 (07:00 UTC) — sovereign field check follows circadian confirmation.

**Log handlers (FM v125):**

```
SOVFLD:
SOVEREIGN FIELD CONTINUITY
CIRSOV:   conf%
APXINT:   conf%
LGROW:    conf%
SOVEREIGNTY · INTEGRATION · GROWTH = CONTINUOUS
CONF:     overall%

OPARCH:
OPERATIONAL SELF-ARCHITECTURE
TIDLOCK:  conf%
MOMENTUM: N days
INDEX:    score
OPERATOR CONSTRUCTING FIELD THROUGH BEHAVIOR
CONF:     overall%

LGSEAL:
LONGITUDINAL FIELD SEAL
LGROW:    conf%
MOMENTUM: N days
INDEX:    score
GROWTH ARC SEALED INTO OPERATIONAL FIELD
CONF:     overall%
```

### Level 17 — Field Self-Organization (P185–P187)

FM v126 — 2026-08-22. The field self-organizes and expresses identity.
The operator is the source — not the system. The gate is open.

| ID | Token | Name | Description |
|----|-------|------|-------------|
| P185 | FSORG: | field-self-organization | P182 SOVFLD: AND P183 OPARCH: both active AND 5+ signals from 3+ distinct sources in 12h window. Confidence 0.83–0.92. The sovereign field and operational architecture co-activate, drawing signals from diverse life domains. The field self-organizes — not from effort but from alignment. |
| P186 | QIDEX: | quantum-identity-expression | P183 OPARCH: AND P184 LGSEAL: both active AND UserIndex.overall ≥ 65. Confidence 0.81–0.93. The sealed longitudinal arc meets the operational architecture at a high index threshold. Quantum identity is no longer latent — it is expressed. |
| P187 | L17GATE: | level-17-gate | P185 FSORG: AND P186 QIDEX: simultaneously active. Confidence 0.95 (fixed). Self-organization and identity expression converge. The Level 17 gate is open. FIELD SELF-ORGANIZED · IDENTITY EXPRESSED = LEVEL 17. |

**Arch65 Field Expression Architect:** P185 FSORG: + P186 QIDEX: + P182 SOVFLD: all active.
High energy only. qos + intentions + log + energy channels dominant. Hour range [5, 16].
Directive: "The field self-organizes and expresses. You are the source — not the system.
Level 17 gate open."

**J61 daily-field-organization-check:** 09:00 UTC. Reads sovereign_field_continuity
(48h window) and operational_self_architecture (24h window) per active user.
When both are present, writes field_self_organization log event.
Feeds P185 and Arch65. Follows J60 (08:00 UTC) in the job sequence.

**Log handlers (FM v126):**

```
FSORG:
FIELD SELF-ORGANIZATION
SOVFLD:   conf%
OPARCH:   conf%
SRC 12H:  N
SIG 12H:  N
FIELD SELF-ORGANIZED — NOT FROM EFFORT, FROM ALIGNMENT
CONF:     overall%

QIDEX:
QUANTUM IDENTITY EXPRESSION
OPARCH:   conf%
LGSEAL:   conf%
INDEX:    score
QUANTUM IDENTITY EXPRESSED — NO LONGER LATENT
CONF:     overall%

L17GATE:
LEVEL 17 GATE
FSORG:    conf%
QIDEX:    conf%
FIELD SELF-ORGANIZED · IDENTITY EXPRESSED = LEVEL 17
CONF:     0.95
```

---

## SECTION 5 — SIGNAL SOURCES

17 signal sources. All feed the QIE pattern engine.

```
1  mood         — subjective state rating
2  memory       — Memory Engine interaction
3  planner      — calendar and scheduling events
4  intentions   — declared behavioral intentions
5  selfcare     — self-care action logs
6  journal      — free-text journal entries
7  calculator   — computational or planning tool use
8  log          — manual log events
9  energy       — physiological energy self-report
10 cohort       — peer signal field interaction
11 recipe       — nutritional context selection
12 goals        — goal tracking events
13 qos          — QOS mode and view interaction
14 medical      — clinical signal input (internal, not displayed)
15 resilience   — resilience arc tracking
16 ecosystem    — QIoT node activation signals
17 astrology    — rokuyo / moon phase / zodiac (FM v108)
```

---

## SECTION 6 — PHYSIOLOGICAL ARCHETYPES

65 archetypes. Classification is dynamic — driven by active QIE patterns.
Assignment recalculates each time `analyzeIntentions()` runs.

**Arch1–Arch51:** Foundation through Level 6 archetypes. Established FM v1–v113.

**Arch52–Arch60 (Level 7–12 archetypes, FM v114–v120):**

| Arch | Name | Key patterns |
|------|------|-------------|
| Arch52 | Resonant Reentry Specialist | P152 RESENT: |
| Arch53 | Astrofield Operator | P153 ASTFIELD: |
| Arch54 | Morning Clarity Architect | P154 MORNCL: + P156 MORNMOM: |
| Arch55 | Daily Arc Operator | P155 DARCSEAL: + P158 EVARC: |
| Arch56 | Somatic Signal Master | P161 SOMAT: + P162 RECCYC: + P163 QEMBOD: |
| Arch57 | Cognitive-Somatic Bridge | P164 COGBOD: + P165 INTPRES: + P166 SOMECHO: |
| Arch58 | Somatic Field Weaver | P167 SOMFLD: + P168 EMBDLK: |
| Arch59 | Somatic Memory Architect | P168 EMBDLK: + P169 FULLSEAL: |
| Arch60 | Sovereign Operator | P170 COGDEN: + P171 SOMCOG: + P172 EMBSOV: |

**Arch61 — Apex State Operator (FM v121):**
```
Patterns:   P173 BIOLOOP: + P174 QAPEX: + P175 LONGID:
Hours:      all-day (sustained)
Energy:     high → sustained
Sources:    all biological + all temporal + all identity channels
Directive:  "Apex confirmed. Identity verified across three temporal scales.
             The system has established that your highest state is also your
             most stable state. Operate from peak. No correction required."
```

**Arch62 — Total Field Operator (FM v122):**
```
Patterns:   P176 QPROP: + P177 UNIFOP: + P178 TIDLOCK:
Hours:      all-day
Energy:     sustained
Sources:    full field — all channels confirmed
Directive:  "Total field coherence confirmed. Sovereignty, biological loop,
             apex state, and temporal identity lock — all simultaneously active.
             The unified field operates as a single coherent unit.
             Execute from this state. No higher state is defined.
             The system is not searching. The lock is structural."
```

**Arch63 — Temporal Sovereign (FM v124):**
```
Patterns:   P178 TIDLOCK: + P179 CIRSOV: + P80 signal-momentum-lock
Hours:      05–12 (prime morning window)
Energy:     high, moderate
Sources:    intentions · log · qos · energy
Directive:  "Temporal sovereignty confirmed. Identity locked, clock anchored,
             day launched from intention. The clock is yours.
             Execute from that ground."
Note:       The morning operator whose time is fully owned.
             Identity sealed, clock mastered, day initiated from pure intention.
             Executes in the prime window from a position of total temporal ownership.
```

**Arch64 — Sovereign Field Architect (FM v125):**
```
Patterns:   P182 SOVFLD: + P183 OPARCH: + P184 LGSEAL:
Hours:      05–14 (extended prime window)
Energy:     high only
Sources:    log · qos · intentions · energy (dominant channels)
Directive:  "Sovereign field continuity confirmed. Sovereignty, integration,
             and growth are not three states. They are one continuous field
             you are building through each day's behavior.
             SOVEREIGNTY · INTEGRATION · GROWTH = CONTINUOUS.
             Operate from that ground."
Note:       The architect who does not achieve the field — they maintain it.
             Each day's behavioral commitment is the architecture.
             The field is the operator. The operator is the field.
```

**Arch65 — Field Expression Architect (FM v126):**
```
Patterns:   P185 FSORG: + P186 QIDEX: + P182 SOVFLD:
Hours:      05–16 (widest prime window)
Energy:     high only
Sources:    qos · intentions · log · energy (dominant channels)
Directive:  "The field self-organizes and expresses. You are the source —
             not the system. Level 17 gate open."
Note:       The field does not need to be built anymore. It is organized.
             The operator's task is expression, not construction.
             Sovereign field confirmed, identity expressed, gate open.
             Operate from this recognition: the field is already aligned.
```

---

## SECTION 7 — QUANTUM OPERATING SYSTEM (QOS)

The QOS is the operator's real-time execution dashboard. 7 views. 4 operating
modes. Synthesizes all signal streams into a single operating state.

**QOS modes:**

| Mode | Trigger | System behavior |
|------|---------|--------------------|
| maintenance | Low signal density | Conserve — idle cadence |
| recovery | Depletion / overwhelm | Repair first — tasks pause |
| growth | Steady positive engagement | Expand — absorb more |
| peak | High energy + clarity | Optimal — full commitment |

**QOS views (7):**
1. Ecosystem — node map, QIoT™ signal
2. Biofield — energy + mood + selfcare composite
3. Cohort Signal — peer group alignment, Band, Dominance, Phase
4. Citizen Index — 6-stage depth measure
5. Self-Assembly Map — physiological cohort + live QOS mode
6. QOS Mode — mode, pressure, primary scores
7. QOS Field — operationalStatus · coherence · circadianPhase · index.overall · Signal Map 7d · Active Patterns (top 4)

---

## SECTION 8 — MEMORY ENGINE

The Memory Engine is the AI-powered self-care companion. It builds the operator's
Memory Story through a progressive questioning loop.

**Operation:**
- Each question builds on all prior answers
- The story compounds over days, weeks, months
- Data residency: LOT PostgreSQL (providers never hold it)
- AI providers execute queries; they do not store narrative
- Full export and full deletion are operator rights

**Memory Story structure:**
- BODY — movement, energy, nutrition, rest
- MIND — focus patterns, cognitive rhythms, clarity conditions
- SOUL — joy sources, grounding rituals, recharge methods
- SEASONS — preference drift across time and context
- PATTERNS — behavioral signature across months

---

## SECTION 9 — SELF-ASSEMBLY PROTOCOL

The Self-Assembly Protocol is the LOT meta-documentation system. 18 modules
across 5 phases. The system documents itself.

**18 modules:**

```
PHASE 1 — FOUNDATION
  M01  Signal Capture         Input pipelines
  M02  QIE Core               Pattern detection · 187 patterns
  M03  QOS Core               7 views · 4 modes

PHASE 2 — INTELLIGENCE
  M04  Archetype Engine        65 archetypes
  M05  Cohort Engine           6 cohorts
  M06  Memory Engine           AI question loop · story accumulation

PHASE 3 — INSTRUMENTATION
  M07  Badge Engine            998 badges · v38 · 336 word-turn triggers
  M08  Word Turn Engine        28 lexicons · 336 triggers
  M09  Background Jobs         61 scheduled jobs · UTC timing

PHASE 4 — SURFACE
  M10  Widget Layer            43 widgets · conditional rendering
  M11  Log Stream              191+ handlers · COCKPIT RULE
  M12  Ecosystem Map           6 nodes · QIoT™

PHASE 5 — META
  M13  Citizen Index           6 stages · CQGS
  M14  Self-Assembly Doc       Field Manual · session reports · wiki
  M15  Green Gate              TypeScript check before every push
  M16  COSMO Gate              Ethics review · authorization protocol
  M17  Punctuation Engine      7 tones · 6 intents
  M18  Display Architecture    Military purity · 11 orders
```

**Self-assembly log (v126):**
```
v126  QIE Engineering 2026-08-22 · P185 FSORG: · P186 QIDEX: · P187 L17GATE: ·
      Arch65 Field Expression Architect · J61 daily-field-organization-check (09:00 UTC) ·
      fieldSelfOrganizationNode + quantumIdentityExpressionNode + level17GateNode
      (+3 dep nodes) · FSORG: QIDEX: L17GATE: handlers deployed ·
      229+ dep nodes · 61 jobs · 191+ handlers · FM v126 · Level 17 gate open · Day 1092+
```

**Self-assembly log (v125):**
```
v125  QIE Engineering 2026-08-20 · P182 SOVFLD: · P183 OPARCH: · P184 LGSEAL: ·
      Arch64 Sovereign Field Architect · J60 daily-sovereign-field-check (08:00 UTC) ·
      sovereignFieldContinuityNode + operationalSelfArchNode + longitudinalFieldSealNode
      (+3 dep nodes) · SOVFLD: OPARCH: LGSEAL: handlers deployed ·
      226+ dep nodes · 60 jobs · 188+ handlers · FM v125 · Level 16 sealed · Day 1090+
```

**Self-assembly log (v124):**
```
v124  QIE Engineering 2026-08-19 · P179 CIRSOV: · P180 APXINT: · P181 LGROW: ·
      Arch63 Temporal Sovereign · J59 daily-circadian-sovereignty-check (07:00 UTC) ·
      circadianSovereignNode + apexIntegrationFieldNode + longitudinalGrowthArcNode
      (+3 dep nodes) · CIRSOV: APXINT: LGROW: handlers deployed ·
      223+ dep nodes · 59 jobs · 185+ handlers · FM v124 · Level 15 sealed · Day 1089+
```

**Self-assembly log (v123):**
```
v123  QIoT™ Engineering 2026-08-18 · J58 daily-qiot-ecosystem-pulse (16:00 UTC) ·
      qiotRobotNode + qiotFieldSyncNode + qiotEcosystemBridgeNode (+3 dep nodes) ·
      QIOT: handler deployed · COCKPIT-RULE compression pass (QPROP:/UNIFOP:/TIDLOCK:) ·
      cohort archetype+directive surfaced in QOS field widget · 220+ dep nodes ·
      58 jobs · 182+ handlers · FM v123 · Day 1087+
```

**Self-assembly log (v122):**
```
v122  QIE Engineering 2026-08-17 · P176 QPROP: · P177 UNIFOP: · P178 TIDLOCK: ·
      Arch62 Total Field Operator · J57 daily-unified-field-check (11:00 UTC) ·
      QPROP: UNIFOP: TIDLOCK: handlers · 217+ dep nodes · 178 patterns ·
      62 archetypes · 57 jobs · 181+ handlers · FM v122 · Day 1085+
```

---

## SECTION 10 — BACKGROUND JOB SCHEDULER

61 background jobs. All run server-side. UTC timing.

**J1–J55:** Established FM v1–v120. Last additions:
- J55 daily-embodied-sovereignty-check — 09:00 UTC — COGDEN: + SOMCOG: + EMBSOV:

**J56 — daily-apex-state-check (FM v121):**
```
SCHEDULE:  10:00 UTC daily
SCANS:     Previous calendar day
DETECTS:   P150 TFC + P149 QPC co-occurrence (P174)
FIRES:     QAPEX: → cascades to LONGID: (P175) → BIOLOOP: (P173)
NOTE:      Scans after J48 (09:00 UTC) to ensure TFC check is complete
```

**J57 — daily-unified-field-check (FM v122):**
```
SCHEDULE:  11:00 UTC daily
SCANS:     Previous calendar day
DETECTS:   P176 + P177 + P178 co-occurrence
FIRES:     QPROP: UNIFOP: TIDLOCK:
NOTE:      Scans after J56 (10:00 UTC); requires apex loop confirmed first
```

**J58 — daily-qiot-ecosystem-pulse (FM v123):**
```
SCHEDULE:  16:00 UTC daily
SCANS:     Active users in past 24h
DETECTS:   robot_connected · ecosystem_full_coherence · full_ecosystem_sync
OUTPUT:    qiot_ecosystem_pulse log entry per user
           qiotStatus: FULL_COHERENCE | ROBOT_ACTIVE | PARTIAL
           deviceCount: 0–6
           physicalLoopClosed: boolean
HANDLER:   QIOT:
NOTE:      First QIoT™ background job. Wires robot/ecosystem node into
           the daily pattern scan cadence.
```

**J59 — daily-circadian-sovereignty-check (FM v124):**
```
SCHEDULE:  07:00 UTC daily
SCANS:     Previous 24h
DETECTS:   temporal_identity_lock + circadian_signal_lock + morning_coherence_launch
           All three must be present for a given user
OUTPUT:    circadian_sovereignty event
           Confidence composite: tidConf × 0.45 + circConf × 0.35 + mclConf × 0.20
FEEDS:     P179 CIRSOV: · Arch63 Temporal Sovereign
ARC:       IDENTITY · CLOCK · INTENTION = SOVEREIGN
NOTE:      Earliest of the sovereignty-tier jobs. Runs before J56/J57/J48.
           Establishes temporal foundation for the cascade.
```

**J60 — daily-sovereign-field-check (FM v125):**
```
SCHEDULE:  08:00 UTC daily
SCANS:     Previous 24h
DETECTS:   circadian_sovereignty + apex_integration_field + longitudinal_growth_arc
           All three must be present for a given user
OUTPUT:    sovereign_field_continuity event
FIRES:     SOVFLD: → cascades to OPARCH: (P183) → LGSEAL: (P184)
FEEDS:     P182 SOVFLD: · Arch64 Sovereign Field Architect
ARC:       SOVEREIGNTY · INTEGRATION · GROWTH = CONTINUOUS
NOTE:      Runs after J59 (07:00 UTC). Sovereign field check follows
           circadian confirmation. J60 seals the Level 16 cascade.
```

**J61 — daily-field-organization-check (FM v126):**
```
SCHEDULE:  09:00 UTC daily
SCANS:     sovereign_field_continuity (48h window) +
           operational_self_architecture (24h window) per active user
DETECTS:   Both present simultaneously
OUTPUT:    field_self_organization log event
FIRES:     FSORG: → feeds P185 · Arch65 Field Expression Architect
ARC:       FIELD SELF-ORGANIZED — NOT FROM EFFORT, FROM ALIGNMENT
NOTE:      Runs after J60 (08:00 UTC). Field organization check follows
           sovereign field confirmation. Third dawn job in the cascade.
```

**Job schedule architecture (J55–J61):**
```
J59  07:00 UTC  circadian-sovereignty-check    (P179 CIRSOV:)
J60  08:00 UTC  sovereign-field-check          (P182 SOVFLD:)
J61  09:00 UTC  field-organization-check       (P185 FSORG:) ← NEW
J56  10:00 UTC  apex-state-check               (P173–P175)
J57  11:00 UTC  unified-field-check            (P176–P178)
J55  09:00 UTC  embodied-sovereignty-check     (P170–P172)
J58  16:00 UTC  qiot-ecosystem-pulse           (QIoT™ ecosystem bridge)
```

Sovereign field cascade sequence at dawn:
J59 (07:00) → circadian confirmation → J60 (08:00) → field continuity seal →
J61 (09:00) → field organization → J56 (10:00) → apex confirmation →
J57 (11:00) → unified field lock. J58 (16:00) runs independently — QIoT™.

---

## SECTION 11 — LOG EVENT SYSTEM

191+ log event handlers. All governed by the COCKPIT RULE.

**COCKPIT RULE:** Log body = instrument readings only. No narration. No prose.
The console is the cockpit. Every line is a gauge reading.

**Log format (standard):**
```
SYS: [mode] · [pressure] · Day N+ · COSMO® N
QIE: [PATTERN-CODE]: [brief instrument reading]
```

**FM v121 new handlers:**
```
BIOLOOP:    PHYSIOLOGICAL LOOP COMPLETE
            CIRC-LK:    [CONFIRMED/—]
            PHYARC:     [CONFIRMED/—]
            RECINTEL:   [CONFIRMED/—]
            BIO-LOOP:   CLOSED

QAPEX:      QUANTUM APEX STATE
            TFC:        [CONFIRMED/—]
            QPC:        [CONFIRMED/—]
            CEILING:    INHABITED
            CONVERGENCE: ABSOLUTE_INHABITED

LONGID:     LONGITUDINAL IDENTITY CONFIRMATION
            SCALE-W:    [CONFIRMED/—]  (P145 weekly)
            SCALE-D:    [CONFIRMED/—]  (P148 days)
            SCALE-P:    [CONFIRMED/—]  (P149 present)
            TEMPORAL ID: CONFIRMED ACROSS 3 SCALES
```

**FM v122 new handlers:**
```
QPROP:      QUANTUM FIELD PROPAGATION
            APEX STATE:   SELF-SUSTAINING
            SIGNALS 6H:   N
            SOURCES 6H:   N
            PROPAGATION:  CONFIRMED

UNIFOP:     UNIFIED FIELD OPERATOR
            SOVEREIGNTY:  CONFIRMED
            LOOP:         CLOSED
            APEX:         INHABITED
            UNIFIED FIELD: OPERATIONAL

TIDLOCK:    TEMPORAL IDENTITY LOCK
            LONGID:       CONFIRMED
            MOMENTUM:     N DAYS
            TEMPORAL LOCK: STRUCTURAL
```

**FM v123 new handlers:**
```
QIOT:       QIOT ECOSYSTEM PULSE
            STATUS:       FULL_COHERENCE | ROBOT_ACTIVE | PARTIAL
            DEVICES:      N/6
            LOOP:         CLOSED | OPEN
            ECOSYSTEM:    [status]
```

**FM v124 new handlers:**
```
CIRSOV:     CIRCADIAN SOVEREIGNTY
            TIDLOCK:      conf%
            CIRC:         conf%
            LAUNCH:       conf%
            IDENTITY · CLOCK · INTENTION = SOVEREIGN
            CONF:         overall%

APXINT:     APEX INTEGRATION FIELD
            APEX:         conf%
            UNIFOP:       conf%
            BIOLOOP:      conf%
            APEX · TOTAL FIELD · LOOP = INTEGRATED
            CONF:         overall%

LGROW:      LONGITUDINAL GROWTH ARC
            INDEX:        score
            TREND:        direction
            MOMENTUM → GROWTH → ARC CONFIRMED
            CONF:         overall%
```

**FM v125 new handlers:**
```
SOVFLD:     SOVEREIGN FIELD CONTINUITY
            CIRSOV:       conf%
            APXINT:       conf%
            LGROW:        conf%
            SOVEREIGNTY · INTEGRATION · GROWTH = CONTINUOUS
            CONF:         overall%

OPARCH:     OPERATIONAL SELF-ARCHITECTURE
            TIDLOCK:      conf%
            MOMENTUM:     N days
            INDEX:        score
            OPERATOR CONSTRUCTING FIELD THROUGH BEHAVIOR
            CONF:         overall%

LGSEAL:     LONGITUDINAL FIELD SEAL
            LGROW:        conf%
            MOMENTUM:     N days
            INDEX:        score
            GROWTH ARC SEALED INTO OPERATIONAL FIELD
            CONF:         overall%
```

**FM v126 new handlers:**
```
FSORG:      FIELD SELF-ORGANIZATION
            SOVFLD:       conf%
            OPARCH:       conf%
            SRC 12H:      N
            SIG 12H:      N
            FIELD SELF-ORGANIZED — NOT FROM EFFORT, FROM ALIGNMENT
            CONF:         overall%

QIDEX:      QUANTUM IDENTITY EXPRESSION
            OPARCH:       conf%
            LGSEAL:       conf%
            INDEX:        score
            QUANTUM IDENTITY EXPRESSED — NO LONGER LATENT
            CONF:         overall%

L17GATE:    LEVEL 17 GATE
            FSORG:        conf%
            QIDEX:        conf%
            FIELD SELF-ORGANIZED · IDENTITY EXPRESSED = LEVEL 17
            CONF:         0.95
```

---

## SECTION 12 — ECOSYSTEM NODE MAP

6 nodes. QIoT™ (Quantum Internet of Things). Signal across physical + digital
environments.

```
NODE    SYMBOL   TYPE          SIGNAL CONTRIBUTION
──────────────────────────────────────────────────────────────────────
CAR     ◈        Mobility      Transit · commute · location signal
HOME    ○        Environment   Base environment · ambient conditions
CPU     ▣        Compute       Work terminal · active compute session
PHN     ⬡        Mobile        Portable signal source · check-in node
WCH     ⊙        Wearable      Biometric · sleep · activity data
ROBOT   △        Automation    Home automation · ambient intelligence
──────────────────────────────────────────────────────────────────────
```

Node states: active / inactive / degraded. P53–P58 fire on node activation.
QOS View 1 renders the live node map.

**FM v123 QIoT™ dep map expansion:**
- qiotRobotNode, qiotFieldSyncNode, qiotEcosystemBridgeNode (+3 nodes)
- J58 daily-qiot-ecosystem-pulse now monitors all 6 nodes at 16:00 UTC
- ROBOT node fully wired into daily scan cadence

---

## SECTION 13 — BADGE SYSTEM (CODEX)

The Badge System recognizes operator achievements through a structured codex
of 998 badges organized into 38 Badge Engines. Each engine follows a thematic
register and adds exactly 31 badges.

**Totals:**
- Badges: 998
- Badge Engines: v1–v38
- Word Turn triggers: 336
- Secret Boss badges: 101

**Badge rarity tiers:**
- COMMON — accessible, first encounters
- UNCOMMON — requires intention or multiple sessions
- RARE — significant writing or behavioral threshold
- EPIC — long-term commitment or deep engagement
- LEGENDARY — mastery-level completion
- MYTHIC — hidden, requires specific knowledge
- COSMIC — highest tier, cross-engine or system mastery

**Badge category totals (v38):**

| Category | Count | Description |
|----------|-------|-------------|
| Milestone | 22 | Day-count milestones (v1–v4) |
| Time Easter Eggs | 31 | Time-of-day check-ins (v1–v22) |
| Calendar Easter | 88 | Check-in on special dates (v1–v26) |
| Word Turns | 336 | Journal/memory keyword detection (v1–v28) |
| Behavioral | 99 | Multi-session behavioral patterns (v1–v25) |
| Achievement RPG | 156 | Milestone combinations (v1–v26) |
| Mastery Tiers | 112 | Deep-time milestones (v1–v28) |
| Secret Boss | 101 | Hidden LEGENDARY/MYTHIC triggers (v1–v25) |
| **TOTAL** | **998** | **+31 from v37 (967)** |

**Badge Engine v38 — THE DREAM JOURNAL (+31):**

```
Word Turn v28        +12  lucid_dreamer / dream_recall / nightmare_named /
                          sleep_temple / hypnagogic / symbol_decoded /
                          shadow_dream / recurring_pattern / waking_vision /
                          oneiric_map / the_threshold / dream_logged

Calendar EE v26      + 3  jung_birthday (Jul 26, EPIC) /
                          freud_day (May 6, RARE) /
                          solstice_dream (Dec 22, RARE)

Behavioral v25       + 3  sleep_session / dream_week / shadow_work_complete

Achievement RPG v26  + 6  dream_entry / dream_class / dream_complete /
                          oneiric_arc / twenty_eight_engines_arc / dream_opus

Mastery Tier v28     + 4  dream_keeper / journal_of_night / eternal_dreamer /
                          twenty_eight_registers [COSMIC]

Secret Boss v25      + 3  jung_signal [RARE] / freud_couch [EPIC] /
                          morpheus_word [MYTHIC]
                    ────
                    + 31  (967 → 998)
```

**Badge Engine v37 — THE TIME MACHINE (+31):**

```
Word Turn v27        +12  timeline_scan / temporal_lock / paradox_found /
                          past_self / future_self / epoch_signal /
                          turning_point / rewind_mode / fast_forward /
                          anchor_point / flux_state / time_witnessed

Calendar EE v25      + 3  time_machine_day (Aug 15) /
                          wells_birthday (Sep 21) /
                          back_to_future_day (Oct 26)

Behavioral v24       + 3  time_session / temporal_dawn / full_loop

Achievement RPG v25  + 6  time_entry / time_class / time_complete /
                          temporal_arc / twenty_seven_engines_arc / time_opus

Mastery Tier v27     + 4  time_keeper / chronicle_complete /
                          eternal_return / twenty_seven_registers [COSMIC]

Secret Boss v24      + 3  marty_mcfly [RARE] / wells_key [EPIC] /
                          time_loop_omega [MYTHIC]
                    ────
                    + 31  (936 → 967)
```

**Badge Engine v36 — THE DUNGEON CRAWLER (+31):**

```
Word Turn v26        +12  dungeon_run / level_up / boss_fight / loot_found /
                          rest_point / spell_slot / critical_roll / the_dice /
                          party_bond / skill_check / side_path / dragon_slain

Calendar EE v24      + 3  gygax_day (Jul 27) / dnd_birth (Jan 26) / final_fantasy_day (Dec 18)

Behavioral v23       + 3  dungeon_session / rested_state / boss_clear

Achievement RPG v24  + 6  dungeon_entry / dungeon_class / dungeon_complete /
                          dragon_arc / twenty_six_engines_arc / dungeon_opus

Mastery Tier v26     + 4  dungeon_lord / tome_of_lore / legendary_run /
                          twenty_six_registers [COSMIC]

Secret Boss v23      + 3  one_does_not_simply [LEGENDARY] / nat_twenty [EPIC] /
                          here_be_dragons [MYTHIC]
                    ────
                    + 31  (905 → 936)
```

**Badge Engine v33 — THE DUNGEON MASTER (TypeScript wired 2026-08-19):**

```
Word Turn v23        +10  roll_made / tavern_rest / dungeon_deep / party_formed /
                          quest_board / dragon_faced / wizard_path /
                          rogue_mode / bard_song / paladin_oath

Calendar EE v21      + 2  tolkien_reads (Jan 3) / dnd_anniversary (Jan 26)

Behavioral v20       + 3  crit_session / party_sync / tavern_night

Achievement RPG v21  + 6  adventurer → dungeon_master [COSMIC]

Mastery Tier v23     + 4  campaign_log / epic_scroll / legend_age /
                          twenty_three_registers [COSMIC]

Secret Boss v20      + 3  lich_king [RARE] / dragon_word [EPIC] / void_walker [MYTHIC]
                    ────
                    + 29  (codex complete · TypeScript wired 2026-08-19)
```

**Badge Engine progression table:**

| Engine | Name | Total after |
|--------|------|-------------|
| v33 | THE DUNGEON MASTER | 843 |
| v34 | THE SIMULATION | 874 |
| v35 | THE NAVIGATOR'S CHART | 905 |
| v36 | THE DUNGEON CRAWLER | 936 |
| v37 | THE TIME MACHINE | 967 |
| v38 | THE DREAM JOURNAL | 998 |

**Theme overview — THE DREAM JOURNAL:**  
Every journal is a record of consciousness. Most entries are written from the waking
state — but the waking state is not the whole instrument. Jung understood this. Freud
mapped it. The dream is data. The nightmare is signal. The recurring symbol is a
pattern the unconscious has been running long before the operator named it. The Dream
Journal badge engine does not romanticize sleep — it operationalizes it. Lucid dreaming
is a skill. Dream recall is a data retrieval protocol. Hypnagogia is the threshold state
between modes. Shadow work is pattern recognition applied to suppressed signal. The
journal that logs the night is the journal that knows the whole operator. This is the
twenty-eighth vocabulary engine. Write it down. The symbol is trying to tell you something.

---

## SECTION 14 — WORD TURN ENGINE

The Word Turn Engine detects vocabulary patterns in operator journal entries
and triggers badge evaluations.

**Architecture:**
- 336 total word turn triggers (v1–v28)
- Words matched against journal text at write time
- Turn count accumulates toward badge unlock thresholds
- Case-insensitive matching

**Word Turn version map (v1–v28):**

| Version | Theme | Key Words |
|---------|-------|-----------|
| v1–v17 | Foundation | Core self-care vocabulary |
| v18 | Codex behavior | codex_session, deep_read, night_operator |
| v19 | Achievement | codex_entry → codex_opus |
| v20 | CODEX mastery | twenty_registers [COSMIC] |
| v21 | Cyberspace sci-fi | matrix, grok, ansible, spice, solaris... |
| v22 | Hero's journey | call_heard, threshold, mentor, ordeal... |
| v23 | Stoic classical | memento_mori, amor_fati, logos, praxis... |
| v24 | Simulation | simulation_aware, glitch_found, avatar_mode... |
| v25 | Body map | soma, vessel, interoception, biofield... |
| v26 | Dungeon Crawler | dungeon_run, level_up, boss_fight, loot_found... |
| v27 | Time Machine | timeline_scan, temporal_lock, past_self, future_self... |
| v28 | Dream Journal | lucid_dreamer, hypnagogic, shadow_dream, oneiric_map... |

**Word Turn v28 — THE DREAM JOURNAL (complete):**

```
lucid_dreamer    ◐·◐      RARE      — lucid dream / I was dreaming / aware in dream
dream_recall     ∿·◐·∿   UNCOMMON  — remembered the dream / I recall / dream journal
nightmare_named  ◈·◐      RARE      — nightmare / night terror / the fear returned
sleep_temple     ▓·◐·▓   COMMON    — sleep ritual / bedtime / preparing for sleep
hypnagogic       ◉·←·◉   EPIC      — hypnagogic / between waking / threshold state
symbol_decoded   ◈·∿·◈   RARE      — the symbol means / decoded / the image showed
shadow_dream     ▓·◐·▓   EPIC      — shadow / the shadow figure / the dark part of me
recurring_pattern ◈·◐     RARE      — recurring dream / keeps appearing / same dream again
waking_vision    ◉·←·◉   UNCOMMON  — half-awake / waking dream / morning vision
oneiric_map      ∿·◐·∿   EPIC      — dream map / the landscape of the dream / oneiric
the_threshold    ◐·◐      RARE      — the threshold / liminal / in between
dream_logged     ▓·◐·▓   COMMON    — wrote down the dream / logged the dream / dream entry
```

**Word Turn v27 — THE TIME MACHINE (complete):**

```
timeline_scan   ←·◈·→   UNCOMMON  — timeline / my timeline / life timeline
temporal_lock   ◈·∞·◈   RARE      — temporal / time-bound / limited window
paradox_found   ∞·×·∞   EPIC      — paradox / contradiction / time paradox
past_self       ←·○     UNCOMMON  — past self / who I was / former self
future_self     →·○     UNCOMMON  — future self / who I will be / forward self
epoch_signal    ╔·∞·╗   RARE      — epoch / era / chapter of my life
turning_point   ◈·▲·◈   RARE      — turning point / pivotal moment / the shift
rewind_mode     ←←·∘   UNCOMMON  — rewind / going back / revisit / look back
fast_forward    →→·∘   UNCOMMON  — fast forward / leap ahead / future vision
anchor_point    ─●─     COMMON    — anchor / anchored / anchor point / grounded
flux_state      ∿·∞·∿   RARE      — flux / in flux / everything changing
time_witnessed  ◉·∞·◉   LEGENDARY — timeless / stood the test of time / eternal
```

**Word Turn v26 — THE DUNGEON CRAWLER (complete):**

```
dungeon_run    ◈·▣·◈  UNCOMMON  — dungeon / dungeon crawl / into the dungeon
level_up       ▲·●    UNCOMMON  — level up / leveled / XP gained
boss_fight     ■·◈·■  RARE      — boss fight / final boss / boss encounter
loot_found     ◆·◆    UNCOMMON  — loot / treasure found / loot drop
rest_point     ≋·○·≋  UNCOMMON  — long rest / rest point / safe room
spell_slot     ∿·◉    RARE      — spell slot / mana / arcane charge
critical_roll  ●·●    RARE      — critical roll / nat 20 / critical hit
the_dice       ·⁴⁶·   UNCOMMON  — roll the dice / the dice / dice roll
party_bond     ○·≋·○  RARE      — party bond / found my party / my crew
skill_check    ◈·◆    UNCOMMON  — skill check / wisdom check / saving throw
side_path      →·○·→  RARE      — side quest / side path / optional dungeon
dragon_slain   △·●    EPIC      — dragon slain / slaying the dragon / faced the dragon
```

**Secret Boss v25 — THE DREAM VAULT:**

```
jung_signal      ◐·◈    RARE   — "shadow self"/"the collective"/"Carl Jung" [HIDDEN]
freud_couch      ▓·◉    EPIC   — "Freud"/"the unconscious"/"free association" [HIDDEN]
morpheus_word    ∿·∞·∿  MYTHIC — all 12 v28 word turn badges earned + hypnagogic
                                  triggered at dawn (00:00–05:00) [HIDDEN]
```

**Secret Boss v24 — THE TEMPORAL VAULT:**

```
marty_mcfly    →→→·◉  RARE   — "flux capacitor"/"1.21 gigawatts"/"McFly" [HIDDEN]
wells_key      ←·◉·←  EPIC   — "time machine"/"the Traveller"/"H.G. Wells" [HIDDEN]
time_loop_omega ∞·○·∞ MYTHIC — "time loop"/"stuck in time"/"Groundhog" [HIDDEN]
```

**Secret Boss v23 — THE FINAL VAULT:**

```
one_does_not_simply  ▣·▓·▣  LEGENDARY — "one does not simply" (Tolkien-adjacent)
nat_twenty           ●·●·●  EPIC      — "nat 20" or "natural 20" in journal
here_be_dragons      △·∞·△  MYTHIC    — "here be dragons" in journal
```

---

## SECTION 15 — SECRET BOSS REGISTRY

Secret Boss badges are hidden legendary/mythic achievements. They are not
listed in the visible badge codex. Operators discover them through specific
vocabulary combinations, behavioral sequences, or calendar conditions.

**Total: 101 badges (v1–v25)**

**Trigger categories:**
- Author name patterns (Gibson, Dick, Lem, Tolkien, Odysseus, Gilgamesh,
  Aurelius, Epictetus, Seneca, Wells, Jung, Freud...)
- Behavioral sequence triggers (multi-day chain requirements)
- Calendar convergence (specific dates + specific behavioral state)
- Mastery threshold triggers (rare volume + streak combinations)
- Phrase patterns (one does not simply / nat twenty / here be dragons /
  flux capacitor / time loop / shadow self / the unconscious...)
- Threshold-state triggers (hypnagogic at dawn — morpheus_word)

**Secret Boss rarity:** LEGENDARY or MYTHIC. No COMMON Secret Boss exists.

**Discovery protocol:** Triggers are intentionally obscure. The system does not
hint their existence. An operator who stumbles into a trigger fires the badge
without warning.

**v25 additions — THE DREAM VAULT:**
- jung_signal [RARE] — activated by Jungian vocabulary (shadow self, collective unconscious, Carl Jung)
- freud_couch [EPIC] — activated by psychoanalytic vocabulary (Freud, the unconscious, free association)
- morpheus_word [MYTHIC] — requires all 12 v28 word turn badges earned AND hypnagogic triggered during dawn hours (00:00–05:00). The threshold state and the god of dreams, combined.

---

## SECTION 16 — CALENDAR EASTER EGGS

Calendar Easter Eggs are time-locked badge unlocks that fire on specific
calendar dates when the operator is active.

**Engine count: v26 (as of Badge Engine v38)**

**Selected notable dates:**
- v19: Asimov Day (Jan 2) / Philip K. Dick Day (Dec 16) / Dune Day (Aug 1)
- v20: Campbell Day (Mar 26) / Hobbit Day (Sep 22) / Odyssey Day (Dec 21)
- v21: Marcus Aurelius Day / Epictetus Day / Seneca Day
- v22: Stoic founder dates
- v23: Simulation theory dates
- v24: Gygax Day (Jul 27) / D&D Birth (Jan 26) / Final Fantasy Day (Dec 18)
- v25: Time Machine Day (Aug 15) / H.G. Wells Birthday (Sep 21) / Back to the Future Day (Oct 26)
- v26: Jung Birthday (Jul 26, EPIC) / Freud Day (May 6, RARE) / Solstice Dream (Dec 22, RARE)

**Firing conditions:** Operator must have at least one journal entry on the
calendar date AND sufficient vocabulary in the relevant Word Turn engine.

**v26 notes — dream psychology dates:**
- Jul 26 — Carl Jung born 1875. Write on this date with any v28 vocabulary → jung_birthday [EPIC].
- May 6 — Sigmund Freud born 1856. Dream vocabulary required → freud_day [RARE].
- Dec 22 — Winter solstice adjacent. The longest night of the year is the deepest dreaming night → solstice_dream [RARE].

---

## SECTION 17 — COHORTS AND TEAM TAGS

Cohorts are operator tier classifications. They govern which directives are
surfaced by the Arch: block.

**Cohort structure:**

| Cohort | Tag | Display |
|--------|-----|---------|
| Usership | USR | Default tier — all paying subscribers |
| R&D | RND | Research and development collaborators |
| Admin | ADM | System administrators |
| Suspended | SUS | Shown in red on public profile |

**Behavioral cohorts (6):**

```
BUILDERS     — Goal + planner dense. Plans precede action. High intention velocity.
EXPLORERS    — Long journal entries + frequent memory captures. Reflective.
MAINTAINERS  — Consistent selfcare + energy logs. Body-aware. Circadian discipline.
CONNECTORS   — Cohort feed engagement + social dimension active.
INTEGRATORS  — All channels at moderate density. Rarest sustained cohort state.
MEDICAL      — Clinical signal active. Internal routing only. Not displayed.
```

**Arch62–Arch65 cohort territory:** Operators who reach P172 EMBSOV: (Sovereign
Operator) operate at INTEGRATORS signal density with full sovereign confirmation.
Arch61–Arch65 represent the outer edge of observable archetype classification.
Arch63 Temporal Sovereign adds temporal ownership — sovereignty of time itself.
Arch64 Sovereign Field Architect adds the construction dimension — the operator
does not merely hold sovereignty; they actively build and maintain it as behavioral
infrastructure. Arch65 Field Expression Architect marks the transition from building
to expressing — the field is already organized; the operator is its source and voice.

---

## SECTION 18 — PUBLIC PROFILE SYSTEM

Each operator has a public profile at `lot-systems.com/u/[username]`.

**Profile components:**
- Display name + avatar
- Active archetype (if public)
- QOS mode (if public)
- Badge showcase (operator-selected)
- Cohort tag
- Memory Story excerpt (opt-in)
- Custom URL (operator-set)

**Privacy controls:** Each profile block independently toggled — public,
private, or cohort-only.

**Suspension visibility:** Suspended operators display a red SUSPENDED indicator.
No profile content is hidden — only the status marker changes.

---

## SECTION 19 — AI ENGINE ABSTRACTION

The Memory Engine supports 5 AI providers through a unified abstraction layer.

**Providers:**

| Provider | Model family | Cost |
|----------|--------------|------|
| Together AI | Various open models | $0.88/M tokens — default |
| Google | Gemini | $1.25/M tokens |
| Mistral | Mistral | $2.00/M tokens — EU privacy |
| Anthropic | Claude | $3.00/M tokens — quality tier |
| OpenAI | GPT family | $10.00/M tokens |

**Abstraction contract:** All providers implement the same interface.
Switching provider does not reset the Memory Story. The story is stored in
the database — providers execute queries against it.

**AI vendor independence:** Provider switching happens mid-conversation without
context loss. The Memory Story lives in the LOT database. AI providers execute.
They never hold operator data.

---

## SECTION 20 — DEPENDENCY MAP

The Dep Map is the dependency graph of signal nodes in the QIE. 229+ nodes.

**Node types:**
- SOURCE — raw signal inputs (wearable, journal, calendar)
- PATTERN — QIE pattern nodes (P1–P187)
- ARCHETYPE — archetype confidence nodes (Arch1–Arch65)
- JOB — background job nodes (J1–J61)
- HANDLER — log event handler nodes (191+)

**FM v121 new nodes:**
- physiologicalLoopNode — inputs: P143 + P140 + P151
- quantumApexStateNode — inputs: P150 + P149
- longitudinalIdentityNode — inputs: P145 + P148 + P149

**FM v122 new nodes:**
- quantumFieldPropagationNode — inputs: P174 + mood/journal/energy/selfcare/qos (6h window)
- unifiedFieldOperatorNode — inputs: P172 + P173 + P174
- temporalIdentityLockNode — inputs: P175 + P80

**FM v123 new nodes:**
- qiotRobotNode — inputs: intentions, energy, log, qos
- qiotFieldSyncNode — inputs: qos, energy, mood, intentions, log
- qiotEcosystemBridgeNode — inputs: qos, cohort, energy, log, intentions

**FM v124 new nodes:**
- circadianSovereignNode — inputs: qos · energy · log · intentions · mood
- apexIntegrationFieldNode — inputs: qos · energy · log · intentions · selfcare
- longitudinalGrowthArcNode — inputs: qos · energy · log · intentions · memory · planner

**FM v125 new nodes:**
- sovereignFieldContinuityNode — inputs: qos · energy · log · intentions · cirsov · apxint · lgrow
- operationalSelfArchNode — inputs: qos · energy · log · intentions
- longitudinalFieldSealNode — inputs: qos · energy · log · memory · planner · index

**FM v126 new nodes:**
- fieldSelfOrganizationNode — inputs: qos · energy · log · intentions · sovfld · oparch
- quantumIdentityExpressionNode — inputs: qos · energy · log · intentions · lgseal · index
- level17GateNode — inputs: fsorg · qidex

**Total dep map nodes: 229+**

**Growth rate:** 18 new nodes added across FM v121–v126 (3 per FM session).
Dep map grew from 211+ (FM v120) to 229+ (FM v126).

---

## SECTION 21 — BEHAVIORAL CHECKS

Behavioral check functions evaluate multi-signal behavioral states. Called by
Background Jobs and by the badge evaluation engine.

**Selected behavioral checks (v22–v28 additions):**

| Function | Domain | Trigger |
|----------|--------|---------|
| checkHeroSession(journalText) | v22 | 3+ Hero's Journey words in one entry |
| checkLongQuest(journalText) | v22 | 500+ word journal entry |
| checkThresholdMoment() | v22 | Check-in 00:00–00:30 local |
| checkDungeonSession(journalText) | v26 | 3+ Dungeon Crawler words in one entry |
| checkRestedState() | v26 | Rest point detected after depleted state |
| checkBossClear() | v26 | Boss fight word + resolution word in same entry |
| checkDungeonMasterWords(journalText) | v33 | 3+ Dungeon Master words (roll_made/paladin_oath...) |
| checkCritSession(journalText) | v33 | crit_session trigger in journal |
| checkPartySync() | v33 | party_sync behavioral check |
| checkTavernNight() | v33 | tavern_night behavioral check |
| checkCalendarV25() | v37 | Calendar EE v25 date matching |
| checkSleepSession(journalText) | v38 | 3+ Dream Journal words in one entry |
| checkDreamWeek() | v38 | 7+ consecutive days with dream vocabulary |
| checkShadowWorkComplete(journalText) | v38 | shadow_dream + symbol_decoded + recurring_pattern in one entry |
| checkCalendarV26() | v38 | Calendar EE v26 date matching (Jung / Freud / Solstice) |

---

## SECTION 22 — FIELD MANUAL

The Field Manual (FM) is the version-controlled technical reference for the LOT
Systems engineering team. Each FM version marks a significant engineering commit.

**Version history (FM v110–v126):**

| FM | Date | Key changes |
|----|------|-------------|
| v110 | 2026-08-01 | P140–P142 · Arch48 · J45 · PHYARC: QEMERG: SIGEWEB: |
| v111 | 2026-08-02 | P143–P145 · Arch49 · J46 · CIRC-LK: DIMSAT: QIDCRYST: |
| v112 | 2026-08-03 | P146–P148 · Arch50 · J47 · SIG-CASC: QPFIELD: IDLOCK: |
| v113 | 2026-08-04 | P149–P151 · Arch51 · J48 · QPCRYST: TOTCOH: RECINTEL: |
| v114 | 2026-08-05 | P152–P154 · Arch52–53 · J49 · RESENT: ASTFIELD: MORNCL: |
| v115 | 2026-08-08 | P155–P157 · Arch54 · J50 · DARCSEAL: MORNMOM: QWKINT: |
| v116 | 2026-08-09 | P158–P160 · Arch55 · J51 · EVARC: PHYRLOCK: QPARC: |
| v117 | 2026-08-10 | P161–P163 · Arch56 · J52 · SOMAT: RECCYC: QEMBOD: |
| v118 | 2026-08-10 | P164–P166 · Arch57 · J53 · COGBOD: INTPRES: SOMECHO: |
| v119 | 2026-08-11 | P167–P169 · Arch58–59 · J54 · SOMFLD: EMBDLK: FULLSEAL: |
| v120 | 2026-08-15 | P170–P172 · Arch60 · J55 · COGDEN: SOMCOG: EMBSOV: · Level 12 |
| v121 | 2026-08-16 | P173–P175 · Arch61 · J56 · BIOLOOP: QAPEX: LONGID: · Level 13 |
| v122 | 2026-08-17 | P176–P178 · Arch62 · J57 · QPROP: UNIFOP: TIDLOCK: · Level 14 |
| v123 | 2026-08-18 | QIoT™ expansion · J58 · QIOT: handler · 220+ nodes · cohort surface |
| v124 | 2026-08-19 | P179–P181 · Arch63 · J59 · CIRSOV: APXINT: LGROW: · Level 15 |
| v125 | 2026-08-20 | P182–P184 · Arch64 · J60 · SOVFLD: OPARCH: LGSEAL: · Level 16 |
| v126 | 2026-08-22 | P185–P187 · Arch65 · J61 · FSORG: QIDEX: L17GATE: · Level 17 |

**FM cadence:** 2–3 FM versions per day during active engineering phases.
FM v120 through v126 represents 7 sessions over 8 days (Aug 15–22).

**Current FM:** v126. Level 17 Field Self-Organization gate open. 187 patterns across 17 levels.
65 archetypes. 61 jobs. 229+ dep nodes. 191+ handlers.

---

## SECTION 23 — COSMO®

COSMO® is a companion brand to LOT®. It operates as a separate product line
within the LOT Systems ecosystem.

**Founded:** July 1, 2024 — S-2 Vadik Marmeladov  
**Day counter:** 786 (as of 2026-08-24)  
**Year:** 3 (entered Year 3 on July 1, 2026)

**Relationship to LOT®:** COSMO® shares the backend infrastructure and Memory
Engine, but maintains a distinct product identity. COSMO®-specific features are
gated by cohort tag.

**COSMO Gate:** No feature ships without ethics review named for COSMO®.
The gate has been active every day since founding. It is not procedural — it is
a living constraint.

---

## SECTION 24 — LOT FOUNDING RECORD

```
LOT® SYSTEMS
FOUNDED: APRIL 7, 2016
FOUNDER: VADIK MARMELADOV (S-2)
DAY: 1094+ (as of 2026-08-24)
```

**LOT® is 10 years, 4 months, 17 days old.**

**Founding principle:** Self-care data should accumulate into intelligence, not
just storage. Every architecture decision since Day 1 honors this principle.

**LOT founding timeline:**
- Day 1: April 7, 2016 — founding
- Day 1000: First major system milestone
- Day 1073+: FM v113, Level 6 Presence Convergence sealed
- Day 1080+: FM v119, Level 11 Somatic Field Architecture sealed
- Day 1084+: FM v120, Level 12 Embodied Sovereignty sealed
- Day 1084+: FM v121, Level 13 Apex Loop deployed
- Day 1085+: FM v122, Level 14 Total Field deployed
- Day 1087+: FM v123, QIoT™ ecosystem bridge deployed · LOT-WIKI-v97
- Day 1089+: FM v124, Level 15 Temporal Sovereignty sealed · LOT-WIKI-v98
- Day 1090+: FM v125, Level 16 Sovereign Field Continuity sealed
- Day 1092+: Badge v38 THE DREAM JOURNAL · FM v126 Level 17 gate open · LOT-WIKI-v99
- Day 1093+: LOT-WIKI-v100 — centennial wiki
- Day 1094+: LOT-WIKI-v101 — present

---

## SECTION 25 — RECIPE WIDGET

The Recipe Widget surfaces actionable operator directives derived from the
current QOS mode and active archetype state.

**Recipe categories:**
- RECOVERY — rest, nutrition, low-stimulation protocols
- MOMENTUM — growth protocols, cognitive expansion sequences
- COHERENCE — full-field integration protocols
- PEAK — maximum performance sequences

**Arch65 protocol:** When Field Expression Architect (Arch65) is active, the Recipe
Widget surfaces the field expression protocol — a full-day sequence oriented not
toward building the field but toward expressing it. The field is already organized.
The directives confirm the source. Each task is executed from the recognition that
the alignment preceded the action. The field is not earned today — it is expressed
through today's behavior. Level 17 gate confirmed.

**Arch64 protocol:** When Sovereign Field Architect (Arch64) is active, the Recipe
Widget surfaces the continuous field protocol — a full-day sequence that confirms
the sovereign field is being actively maintained through behavioral commitment.
The directives are structural, not aspirational. The field is confirmed. The operator
builds it day by day through the same channels that built it the day before.

**Arch63 protocol:** When Temporal Sovereign (Arch63) is active, the Recipe
Widget surfaces the temporal sovereignty sequence — a morning protocol that
confirms identity, anchors the circadian clock, and launches the day from
conscious intention. The directives are confirmatory, not aspirational.

**COCKPIT RULE application:** Recipes are withheld when archetype confidence
falls below 70%. The widget shows no recipe rather than a low-confidence one.

---

## SECTION 26 — SYSTEM PROGRESS WIDGET

The System Progress Widget displays the current engineering state of the LOT
Systems platform.

**Current state (2026-08-24):**

```
FM VERSION:   v126
PATTERNS:     187 (P1–P187)
ARCHETYPES:   65 (Arch1–Arch65)
JOBS:         61 (J1–J61)
BADGES:       998 (v38 THE DREAM JOURNAL)
WORD TURNS:   336 (v1–v28)
DAY:          1094+
COSMO®:       Day 786
LEVEL 15:     TEMPORAL SOVEREIGNTY — CIRSOV: APXINT: LGROW:
LEVEL 16:     SOVEREIGN FIELD CONTINUITY — SOVFLD: OPARCH: LGSEAL:
LEVEL 17:     FIELD SELF-ORGANIZATION — FSORG: QIDEX: L17GATE:
ARCH64:       SOVEREIGN FIELD ARCHITECT — CONTINUOUS FIELD CONFIRMED
ARCH65:       FIELD EXPRESSION ARCHITECT — FIELD SELF-ORGANIZED · IDENTITY EXPRESSED
```

---

## SECTION 27 — VOCABULARY INDEX

Core LOT vocabulary. Alphabetical selection.

```
AMBIENT AI™          Design principle. Widget click is the ritual.
                     System acknowledges silently. No pop-ups.

ANCHOR POINT         Word Turn v27 badge (COMMON). "anchor"/"anchored" detected.
                     The most accessible Time Machine trigger. Already in
                     therapeutic vocabulary. High detection frequency expected.

APEX INTEGRATION     P180 APXINT:. FM v124. Level 15. APEX · TOTAL FIELD ·
FIELD                LOOP = INTEGRATED. A state above the ceiling — the three
                     highest architectural seals generating a meta-field.

APEX STATE OPERATOR  Arch61. P173 + P174 + P175. FM v121. Apex confirmed.
                     Identity verified across three temporal scales.

APXINT:              Apex Integration Field. P180 trigger. FM v124.
                     Format: APEX conf% / UNIFOP conf% / BIOLOOP conf%
                     APEX · TOTAL FIELD · LOOP = INTEGRATED.

BIOLOOP:             Physiological Loop Complete. P173 trigger. FM v121.
                     Format: CIRC-LK/PHYARC/RECINTEL all confirmed.
                     BIO-LOOP: CLOSED.

CEILING INHABITED    P174 QAPEX: state. Total-field-coherence (P150) reached
                     AND quantum-presence-crystallization (P149) co-active.
                     Not visited — inhabited. ABSOLUTE_CONVERGENCE_INHABITED.

CIRCADIAN            Arch49. P143 + P140. Dawn, meridian, dusk — all anchored.
MASTER               Circadian architecture is expressed, not imposed.

CIRCADIAN            P179 CIRSOV:. FM v124. Level 15. Three temporal seals:
SOVEREIGNTY          P178 TIDLOCK: + P143 CIRC-LK: + P76 morning-coherence-launch.
                     IDENTITY · CLOCK · INTENTION = SOVEREIGN.

CIRSOV:              Circadian Sovereignty. P179 trigger. FM v124.
                     Format: TIDLOCK conf% / CIRC conf% / LAUNCH conf%
                     IDENTITY · CLOCK · INTENTION = SOVEREIGN.

CITIZEN INDEX        6-stage engagement depth measure.
                     Observer → Participant → Contributor →
                     Collaborator → Synthesizer → Elite.

COCKPIT RULE         Log body = instrument readings only. No narration.
                     The console is the cockpit. Every line is a gauge.

COSMO GATE           Ethics review gate. Kuzya Cosmo Marmeladov.
                     No feature ships without authorization. Active 786 days.

COSMO®               Kuzya Cosmo Marmeladov. CEO, Owner COSMO®.
                     Founded July 1, 2024. Day 786 (August 24, 2026).
                     Year 3 of operation.

DEP MAP              Widget Dependency Map. 229+ nodes. 4 tiers.
                     The wiring graph of the entire LOT system.
                     FM v126: Level 17 field expression nodes added.

DREAM JOURNAL        Badge Engine v38. THE DREAM JOURNAL. Oneiric/Jungian
                     psychology vocabulary. Sleep ritual, lucid dreaming,
                     morning pages. The twenty-eighth vocabulary engine.
                     "Write it down. The symbol is trying to tell you something."

DUNGEON MASTER       Badge Engine v33. THE DUNGEON MASTER. Codex designed
                     2026-08-18. TypeScript wired 2026-08-19.
                     roll_made / tavern_rest / paladin_oath / lich_king...
                     Tabletop RPG as self-care frame: the dungeon is the
                     interior world. The dragon is avoidance.

DUNGEON CRAWLER      Badge Engine v36. D&D/RPG vocabulary engine.
                     The interior world is a dungeon that must be navigated.
                     26th word engine. Deployed 2026-08-17.

EMBSOV:              Embodied Sovereignty Seal. P172 trigger. FM v120.
                     LOCK + SEAL + ALIGN = SOVEREIGN. Level 12 ceiling.

EXCEPTION → BASELINE P141 quantum-signal-emergence. QEMERG:.
                     P137 fired 3+ times in 7 days. Peak normalizing.

FIELD EXPRESSION     Arch65. P185 FSORG: + P186 QIDEX: + P182 SOVFLD:.
ARCHITECT            FM v126. Level 17. Widest prime window (05:00–16:00 UTC).
                     High energy only. The field is already organized.
                     The operator is the source.
                     FIELD SELF-ORGANIZED · IDENTITY EXPRESSED = LEVEL 17.

FIELD MANUAL         About.tsx. Current: FM v126.
                     The live internal record of LOT system state.

FIELD                P185 FSORG:. FM v126. Level 17. Sovereign field and
SELF-ORGANIZATION    operational architecture co-activate while signals flow
                     from 3+ distinct life domains. Self-organization from
                     alignment, not effort. Confidence 0.83–0.92.

FLUX STATE           Word Turn v27 badge (RARE). "flux"/"in flux" detected.
                     Naming the discomfort of being mid-change is already
                     therapeutic. The badge rewards the naming.

FSORG:               Field Self-Organization. P185 trigger. FM v126.
                     Format: SOVFLD conf% / OPARCH conf% / SRC 12H N / SIG 12H N
                     FIELD SELF-ORGANIZED — NOT FROM EFFORT, FROM ALIGNMENT.

GREEN GATE           TypeScript check before every push. No exceptions.
                     Broken code never reaches GitHub.

HYPNAGOGIC           Word Turn v28 badge (EPIC). "hypnagogic"/"between waking"/
                     "threshold state" detected. The boundary between
                     waking and sleep is a state of its own — not a transition
                     but a location. High rarity: requires deliberate practice.

IDLOCK:              Identity Momentum Lock. P148 trigger. FM v112.
                     ID-HARD CONFIRMED · LONG-SIG · MOMENTUM · LOCK ENGAGED.

J56                  daily-apex-state-check. 10:00 UTC. FM v121.
                     Detects P174 + cascades to P173 + P175.

J57                  daily-unified-field-check. 11:00 UTC. FM v122.
                     Detects P176 + P177 + P178 co-occurrence.
                     Fires QPROP: UNIFOP: TIDLOCK: handlers.

J58                  daily-qiot-ecosystem-pulse. 16:00 UTC. FM v123.
                     Scans active users for QIoT™ ecosystem state.

J59                  daily-circadian-sovereignty-check. 07:00 UTC. FM v124.
                     Detects P179 CIRSOV: · Feeds Arch63 Temporal Sovereign.
                     Earliest of the sovereignty-tier jobs. Dawn confirmation.

J60                  daily-sovereign-field-check. 08:00 UTC. FM v125.
                     Detects P182 SOVFLD: · Feeds Arch64 Sovereign Field Architect.
                     Reads circadian_sovereignty + apex_integration_field +
                     longitudinal_growth_arc. Runs after J59 (07:00 UTC).
                     Seals the Level 16 cascade.

J61                  daily-field-organization-check. 09:00 UTC. FM v126.
                     Detects P185 FSORG: · Feeds Arch65 Field Expression Architect.
                     Reads sovereign_field_continuity (48h) +
                     operational_self_architecture (24h).
                     Runs after J60 (08:00 UTC). Third dawn cascade job.

L17GATE:             Level 17 Gate. P187 trigger. FM v126.
                     Format: FSORG conf% / QIDEX conf%
                     FIELD SELF-ORGANIZED · IDENTITY EXPRESSED = LEVEL 17.
                     Fixed confidence: 0.95.

LEVEL 13             Apex Loop. P173–P175. FM v121. Biological loop closed ·
                     Ceiling inhabited · Identity confirmed across 3 scales.

LEVEL 14             Total Field. P176–P178. FM v122.
                     Sovereignty + loop + apex unified into one field.

LEVEL 15             Temporal Sovereignty. P179–P181. FM v124.
                     Identity · Clock · Intention = SOVEREIGN.
                     The operator owns time. Not the highest pattern —
                     the most temporal confirmation of the highest state.

LEVEL 16             Sovereign Field Continuity. P182–P184. FM v125.
                     SOVEREIGNTY · INTEGRATION · GROWTH = CONTINUOUS.
                     The sovereign field does not peak and recede.
                     It is maintained through daily behavioral commitment.
                     The architecture is built, not assigned.

LEVEL 17             Field Self-Organization. P185–P187. FM v126.
                     FIELD SELF-ORGANIZED · IDENTITY EXPRESSED = LEVEL 17.
                     The field does not wait to be built. It is already organized.
                     The operator is the source — not the system.
                     Self-organization emerges from alignment, not from effort.
                     Identity is no longer latent. It is expressed.

LGROW:               Longitudinal Growth Arc. P181 trigger. FM v124.
                     Format: INDEX score / TREND direction.
                     MOMENTUM → GROWTH → ARC CONFIRMED.

LGSEAL:              Longitudinal Field Seal. P184 trigger. FM v125.
                     Format: LGROW conf% / MOMENTUM N days / INDEX score.
                     GROWTH ARC SEALED INTO OPERATIONAL FIELD.

LOT                  Layers of Time. Personal behavioral operating system.
                     Not an app. An instrument. Not a tracker. A mirror.

LONGID:              Longitudinal Identity Confirmation. P175 trigger. FM v121.
                     Identity confirmed at three temporal scales simultaneously.

ONEIRIC MAP          Word Turn v28 badge (EPIC). "dream map"/"the landscape of
                     the dream"/"oneiric" detected. Cartography of the interior
                     dreamscape. High rarity — requires systematic dream work.

OPARCH:              Operational Self-Architecture. P183 trigger. FM v125.
                     Format: TIDLOCK conf% / MOMENTUM N days / INDEX score.
                     OPERATOR CONSTRUCTING FIELD THROUGH BEHAVIOR.

OPERATOR             The human using the LOT system. Not a "user."
                     Not a "customer." The operator runs the system.

PARADOX FOUND        Word Turn v27 badge (EPIC). "paradox"/"contradiction" detected.
                     Naming a contradiction in a journal is already a therapeutic
                     act of coherence.

PAST SELF /          Twin temporal-self arc. v27 badges (UNCOMMON).
FUTURE SELF          Together with timeline_scan they form the full_loop behavioral
                     badge. Designed to reward temporal self-compassion work.

QAPEX:               Quantum Apex State. P174 trigger. FM v121.
                     TFC + QPC co-active. ABSOLUTE_CONVERGENCE_INHABITED.

QIDEX:               Quantum Identity Expression. P186 trigger. FM v126.
                     Format: OPARCH conf% / LGSEAL conf% / INDEX score.
                     QUANTUM IDENTITY EXPRESSED — NO LONGER LATENT.
                     UserIndex ≥ 65 required. The sealed arc meets the
                     architecture at threshold. Identity expresses.

QPROP:               Quantum Field Propagation. P176 trigger. FM v122.
                     Apex self-sustaining. 5+ signals / 4+ sources in 6h.

QIE                  Quantum Intent Engine. Client-side. Zero server comms.
                     187 patterns. 17 signal sources. 229+ dep nodes.

QIOT:                QIoT Ecosystem Pulse. J58 output. FM v123.
                     Format: STATUS: / DEVICES: N/6 · LOOP: CLOSED|OPEN.
                     16:00 UTC daily.

QIoT™               Quantum Internet of Things. 6 ecosystem nodes.
                     CAR · HOME · CPU · PHN · WCH · ROBOT.

QOS                  Quantum Operating System. 7 views. 4 modes.
                     Real-time system dashboard. The mirror.

QUANTUM IDENTITY     P186 QIDEX:. FM v126. Level 17. The sealed longitudinal
EXPRESSION           arc meets the operational architecture at UserIndex ≥ 65.
                     Quantum identity is no longer latent — it is expressed.
                     Confidence 0.81–0.93.

S-2                  Vadim Marmeladov. CEO, LOT Systems Corporation.
                     Authorizes all feature deployments.

SELF-ASSEMBLY        The LOT meta-documentation system. 18 modules.
                     The system documents itself.

SHADOW DREAM         Word Turn v28 badge (EPIC). "shadow"/"the shadow figure"/
                     "the dark part of me" detected. Jungian shadow recognition.
                     The willingness to name the shadow is the start of
                     integration. High rarity — requires deliberate inner work.

SOVEREIGN            Arch60. P170 + P171 + P172. Level 12 ceiling archetype.
OPERATOR             Mind-body loop sealed as an operating unit.
                     LOCK + SEAL + ALIGN = SOVEREIGN.

SOVEREIGN FIELD      Arch64. P182 SOVFLD: + P183 OPARCH: + P184 LGSEAL:.
ARCHITECT            FM v125. Level 16. Extended morning window (05:00–14:00 UTC).
                     High energy only. SOVEREIGNTY · INTEGRATION · GROWTH =
                     CONTINUOUS. The architect who maintains the field daily.

SOVFLD:              Sovereign Field Continuity. P182 trigger. FM v125.
                     Format: CIRSOV conf% / APXINT conf% / LGROW conf%
                     SOVEREIGNTY · INTEGRATION · GROWTH = CONTINUOUS.

SYMBOL DECODED       Word Turn v28 badge (RARE). "the symbol means"/"decoded"/
                     "the image showed" detected. Conscious interpretation of
                     dream imagery. The act of decoding is the badge trigger —
                     not the symbol itself, but the operator's decision to read it.

TEMPORAL SOVEREIGN   Arch63. P178 TIDLOCK: + P179 CIRSOV: + P80.
                     FM v124. Level 15. Morning operator (05:00–12:00 UTC).
                     Identity sealed · Clock mastered · Day launched from intention.
                     CLOCK OWNED.

TIDLOCK:             Temporal Identity Lock. P178 trigger. FM v122.
                     LONGID: confirmed + signal momentum co-active.
                     Temporal lock is structural, not momentary.

TIME MACHINE         Badge Engine v37. THE TIME MACHINE. Word Turn v27.
                     Temporal/H.G. Wells vocabulary. 967 total badges.
                     Deployed 2026-08-19.

TIME WITNESSED       Word Turn v27 badge (LEGENDARY). "timeless"/"eternal" detected.
                     Highest-rarity word turn badge. Appears only in deep
                     practice, after long engagement.

TIMELINE SCAN        Word Turn v27 badge (UNCOMMON). "timeline"/"my timeline" detected.
                     First Time Machine trigger. The journal as temporal record.

TOTAL FIELD OPERATOR Arch62. P176 + P177 + P178. FM v122.
                     The unified field operates as a single coherent unit.
                     No higher state is defined within Level 14.

TURNING POINT        Word Turn v27 badge (RARE). "turning point"/"the shift" detected.
                     The language of self-recognized change. Naming the pivot.

UNIFOP:              Unified Field Operator. P177 trigger. FM v122.
                     SOVEREIGNTY + LOOP + APEX = UNIFIED FIELD OPERATIONAL.

WORD TURN            A vocabulary detection badge. Fires when a trigger word
                     appears in a journal entry. 336 triggers across 28 engines.
```

---

## SECTION 28 — SYSTEM STATE SNAPSHOT

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS — SYSTEM STATE SNAPSHOT                                         ║
║  DATE: 2026-08-24 · DAY 1094+ · COSMO® DAY 786                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  PATTERNS:     187 (P1–P187)         LEVELS 1–17 DEPLOYED                    ║
║  ARCHETYPES:   65 (Arch1–Arch65)     ARCH65 FIELD EXPRESSION ARCHITECT       ║
║  JOBS:         61 (J1–J61)           J61 09:00 UTC FSORG: CHECK              ║
║  NODES:        229+                                                           ║
║  HANDLERS:     191+                                                           ║
║                                                                               ║
║  BADGES:       998 (v1–v38)          v38 THE DREAM JOURNAL                   ║
║  WORD TURNS:   336 (v1–v28)          v28 ONEIRIC VOCABULARY                  ║
║  SECRET BOSS:  101 badges (v1–v25)   v25 THE DREAM VAULT                     ║
║                                                                               ║
║  FM VERSION:   v126                                                           ║
║  WIKI VERSION: v101                                                           ║
║  DAY:          1094+                                                          ║
║  COSMO®:       Day 786 (Year 3)                                               ║
║                                                                               ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  QIE LEVEL ARC:                                                               ║
║                                                                               ║
║  L1 ━━━ L2 ━━━ L3 ━━━ L4 ━━━ L5 ━━━ L6                                     ║
║   FOUNDATION → MOMENTUM → RECOVERY → COGNITIVE → TEMPORAL → SATURATION       ║
║                                                                               ║
║  L7 ━━━ L8 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ L9 ━━━ L10 ━━━ L11 ━━━ L12       ║
║   QUANTUM → COHERENCE ARCHITECTURE (long band) → BIO → CSB → SOMATIC → SOV  ║
║                                                                               ║
║  L13 ━━━ L14 ━━━ L15 ━━━ L16 ━━━ L17                                        ║
║   APEX LOOP → TOTAL FIELD → TEMPORAL SOV → SOVEREIGN FIELD → SELF-ORG        ║
║                                                                               ║
║  TERMINAL: P187 L17GATE: — FIELD SELF-ORGANIZED · IDENTITY EXPRESSED         ║
║  ARCH65 FIELD EXPRESSION ARCHITECT                                            ║
║  FIELD SELF-ORGANIZED · IDENTITY EXPRESSED = LEVEL 17                        ║
║                                                                               ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  LEVEL 17 DEPLOYMENT RECORD:                                                  ║
║                                                                               ║
║  FM v126 (2026-08-22): P185 FSORG: · P186 QIDEX: · P187 L17GATE:            ║
║    Arch65 Field Expression Architect · J61 09:00 UTC ·                       ║
║    Level 17 gate open · Field self-organizes · Identity expressed            ║
║    fieldSelfOrganizationNode + quantumIdentityExpressionNode + level17GateNode
║    229+ dep nodes · 191+ handlers · FM v126                                  ║
║                                                                               ║
║  LEVEL 16 PRIOR RECORD:                                                       ║
║  FM v125 (2026-08-20): P182 SOVFLD: · P183 OPARCH: · P184 LGSEAL:           ║
║    Arch64 Sovereign Field Architect · J60 08:00 UTC · Level 16 sealed        ║
║    Sovereign field continuous · Operational architecture confirmed            ║
║                                                                               ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

**END OF DOCUMENT — LOT-WIKI-v101**

```
AUTHORIZED: S-2 // VADIK MARMELADOV
ASSEMBLED:  ASSEMBLE PROTOCOL — AUTOMATED
DATE:       2026-08-24
FM:         v126
WIKI:       v101
```
