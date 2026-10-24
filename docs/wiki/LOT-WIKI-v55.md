<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT WIKI — v55

**Document type:** Standalone distilled wiki  
**Field Manual version:** v55  
**Date:** June 12, 2026  
**Day counter:** Day 1007+  
**Classification:** OPEN REFERENCE  
**Source:** About.tsx canonical · all .MDs · all active branches  

---

## CONTENTS

1. What is LOT?
2. CQGS White Paper — Foundation
3. Core Architecture
4. Quantum Intent Engine
5. Quantum Operating System
6. Memory Engine
7. Self-Assembly Engine
8. Soul Archetypes
9. Behavioral Cohorts
10. Citizen Index
11. Badge System
12. Widget Ecosystem
13. Background Jobs
14. AI Architecture
15. Design Philosophy
16. Vocabulary
17. Usership Tiers
18. Technical Stack
19. Release History
20. Corporate Layer

---

## 01 — WHAT IS LOT?

LOT is a military-grade personal operating system. Not a wellness app. Not a productivity tracker. A behavioral operating system that reads the human signal field and reports what is actually happening — without agenda, without congratulation, without decoration.

The system does not motivate. It does not coach. It does not gamify effort. It measures. It classifies. It reports. The operator interacts with the system; the system accumulates the record.

**Core premise:** The user is not a consumer to be retained. The user is an operator running a mission. The system is the instrument cluster.

**Founded:** 7 April 2016  
**Platform:** lot-systems.com (web) · iOS · Android (planned)  
**Architecture:** React + TypeScript + Nanostores client · Fastify + Sequelize + PostgreSQL server · SSE real-time · Digital Ocean hosting  
**Version:** v1.3.0 (platform) · v55 (Field Manual)  

---

## 02 — CQGS WHITE PAPER — FOUNDATION

**CQGS** — Coherent Quantum Ground State — is the founding corporate white paper and the theoretical framework the entire platform implements.

The white paper pre-dates the platform. It was written before any code existed. Every engineering decision traces back to a concept in the paper.

### Mother Goddess Parable

Biological intelligence is the original AI. Every organism is a data-generating process optimized over millions of years. The human body is the most sophisticated measurement instrument available. The LOT platform treats it as such — not as a wellness subject, but as a sovereign data-generating system.

The Nurturing Wisdom model: intelligence is not cold optimization. The highest-performing systems in nature are those that sustain life across generations. The platform is designed on this principle. It does not extract. It equips.

### Quantum Certified Factory

Every human life is a Quantum Certified Factory — a sovereign, continuous data-generating process. The individual is not a user to be retained; the individual is a factory to be equipped. Data generated belongs to the operator. The system is the machinery.

The platform does not own the signal. The platform reads the signal, classifies it, and returns the reading to the operator.

### Bioethics Index

Seven dimensions governing responsible collection and processing of intimate behavioral data:

| Symbol | Module | Signal Type |
|--------|--------|-------------|
| ▸ | Memory | Questions answered via Memory Engine |
| ~ | Biofield | Emotional check-ins logged |
| ■ | Routine | Plans set and schedule entries created |
| ○ | Cleanness | Self-care practices completed |
| → | Intention | Intentions created and logged |
| ◇ | Journal | Free-form notes recorded |
| ✦ | QIE Signal | Quantum intent patterns fired |

These seven dimensions are the seven modules of the Citizen Index computation.

### Six-Layer Technology Architecture

The white paper defines a six-layer technology stack. The LOT platform is its engineering implementation:

| Layer | Name | LOT Implementation |
|-------|------|--------------------|
| 1 | Signal Collection | Check-ins · intentions · plans · self-care · memory answers |
| 2 | Pattern Recognition | QIE — 65 behavioral patterns extracted from signal streams |
| 3 | State Synthesis | QuantumOS — 4 modes · 6 index dimensions · coherence score |
| 4 | Archetype Classification | 19 physiological archetypes derived from pattern combinations |
| 5 | Population Intelligence | CQGS Health Monitor — aggregate distribution, no individual exposure |
| 6 | Transparency Interface | Citizen Index — operator's position in the CQGS evolution space |

### CQGS-to-LOT Platform Mapping

The CQGS state is not a target. It is a reference point. As an operational state:
- 18 self-assembly modules integrated
- All 5 ecosystem nodes connected
- QIE at P.34 confidence (0.98)
- User Index at peak across all 6 dimensions
- 19 physiological archetypes classified
- Citizen Index at ◉ Transparent (50+)

The system reports distance to this state. Not progress toward it.

---

## 03 — CORE ARCHITECTURE

### Engines

| Engine | Function | Status |
|--------|----------|--------|
| Quantum Intent Engine (QIE) | Behavioral pattern recognition — 65 patterns | Active |
| Quantum Operating System (QOS) | State synthesis — 4 modes, 6 index dimensions | Active |
| Memory Engine | AI question generation via Together AI | Active |
| Self-Assembly Engine | 18-module behavioral infrastructure | 18/18 modules assembled |
| CQGS Health Monitor | Population-level physiological health distribution | Active |
| Punctuation & Intonation Engine | Voice tone detection from text punctuation | Active |

### Signal Sources (11 primary)

```
log · energy · cohort · recipe · goals · qos · intentions · memory
planner · selfcare · journal
```

### Ecosystem Nodes (5)

```
Intentions · Memory · Goals · Planner · Self-Care
```

### Widget Dependency Tiers

- Tier 0: Raw input widgets (check-in, planner, self-care)
- Tier 1: Single-signal consumers (energy, emotion)
- Tier 2: Multi-signal consumers (QOS, QIE, archetype)
- Tier 3: Aggregate consumers (System Progress, Citizen Index, Quantum Realm)

---

## 04 — QUANTUM INTENT ENGINE

**Version:** v54 (June 11, 2026)  
**Patterns:** 65 active (P.59–P.62 reserved)  
**Archetypes:** 19 physiological  
**Dep map nodes:** 93+  
**Log handlers:** 56+  

### Pattern Selection (major patterns)

| Pattern | Code | Trigger | Confidence |
|---------|------|---------|------------|
| Morning Clarity | P.01 | Early intention + clarity signal | 0.87 |
| Flow State | P.02 | Energy + planning convergence | 0.91 |
| Recovery Arc | P.38 | Self-care + mood rise after depletion | 0.70 |
| Cognitive Expansion | P.39 | Memory depth + journal + planner | 0.78 |
| Biofield Coherence Cascade | P.40 | Recovery arc → cognitive expansion → module chain | 0.85 |
| Resonant Synthesis | P.41 | Cascade + reflection-velocity + 5+ sources | 0.92 |
| Deep Work Cascade | P.42 | Memory + planner + journal + goals, 3h window | 0.89 |
| Intention Completion Arc | P.43 | Intention set → goal → journal, 24h loop | 0.72–0.95 |
| Cross-Domain Coherence | P.64 | All 4 inner domain layers active | 0.88 |
| Recovery Plateau | P.65 | Energy low 5+ consecutive days, same protocol | 0.76 |

### Dependency Map (93+ nodes)

The WIDGET_DEPENDENCY_MAP in `intentionEngine.ts` tracks which widgets depend on which signal sources. 93+ nodes mapped across all tiers. The map renders in the Index view as a compressed dependency list.

### Log Handlers (56+)

Key handlers and their event codes:

```
CASCADE:     biofield coherence cascade — P.40 active
SYNTH:       resonant synthesis — P.41 active
DWRK:        deep work cascade — P.42 active
INTF:        intention follow-through — P.43 active
CQGS-H:      CQGS Health scan — daily population health record
BIO-AM:      morning biofield summary — 07:00 UTC
GOAL-X:      goal completion — title + category
SOCR:        social resonance arc — cohort signal convergence
RLSE:        cognitive load release — decompression loop complete
SIL:         signal silence — 48h+ no primary signals
CIRC:        circadian anchor lost — drift detected
BURST:       signal burst — P.63 — 10+ signals in 2h window
CASCADE:     biofield cascade confirmed
ARCH-SHIFT:  archetype shift — from/to archetype · stability%
INTENT-X:    intention completion — completed/total · rate%
DIV-PULSE:   source diversity pulse — sources active/total · diversity%
```

**Log doctrine:** Log body = instrument readings only. Label names the event. No narration. The cockpit shows data — it does not explain what the data means.

---

## 05 — QUANTUM OPERATING SYSTEM

The QuantumOS synthesizes all engine outputs into one typed object: energy, clarity, alignment, support, circadian phase, index scores, active patterns, signal map, coherence score. Readable from any widget via `getQuantumOS()` with zero new computation.

### Four Operating Modes

| Mode | Trigger | Directive |
|------|---------|-----------|
| MAINTENANCE | Assembly below 30% | Basic systems only |
| RECOVERY | Physiological-depletion or sleep-debt patterns | Recovery arc active |
| GROWTH | Moderate engagement, patterns building | Expansion window open |
| PEAK | P.34 coherence or full-stack signal | Peak window — protect this session |

### Six Index Dimensions

```
ENG (Energy) · EMO (Emotion) · INT (Intention) · SOC (Social) · CARE (Self-Care) · COG (Cognitive)
```

Each dimension scored 0–100. Composite = average across all 6. Displayed in User Index widget.

### QOS Views (6)

```
Ecosystem · Biofield · Cohort · Index · Assembly · Mode
```

### Coherence Score

```
coherenceScore = (sourceCount / 7) × 100
```
Measures signal breadth. 7 primary sources in 24h = 100% coherence.

### Daily Schedule (key jobs)

```
01:00 UTC   Daily QOS coherence report
07:00 UTC   Morning biofield summary + daily source diversity pulse (job 11)
07:00 UTC   CQGS Health scan
Wednesday 04:00 UTC   Weekly QOS State Digest (aggregate, population-level)
```

---

## 06 — MEMORY ENGINE

**AI Model:** Together AI — Llama 3.3 70B  
**Question types:** 7 (standard + 5 specialized)  
**Backup pool:** 70 total (29 self-care + 15 medical + 18 trauma + 8 eating recovery)  

### Virtuous Compression Cycle

```
More use → deeper psychological profile → more resonant AI questions → more use
```

The Memory Engine generates questions that match the operator's current state. The deeper the profile, the more precisely tuned the question. Questions are not generic prompts — they are derived from the QIE signal state, active patterns, and index scores.

### Question Categories

- Standard: general depth questions
- Medical cohort: for operators with qualified medical profiles (assessMedicalProfile · qualifiesForPaidCohort)
- Trauma-informed: PTSD/C-PTSD Resilience Protocol integration
- Eating recovery: eating disorder healing protocol (6 dimensions)
- Self-care depth: linked to care module engagement
- Journal reflection: cross-referenced with journal entries
- Pattern-contextual: AI-generated based on current QIE pattern

---

## 07 — SELF-ASSEMBLY ENGINE

**Modules:** 18  
**Phase:** Integrated (v55)  
**Phases:** dormant → awakening → forming → assembled → integrated  

### 18 Modules

| # | Module | Status |
|---|--------|--------|
| 1 | Mood Check-In | Active |
| 2 | Energy Tracking | Active |
| 3 | Intentions | Active |
| 4 | Goals | Active |
| 5 | Journal | Active |
| 6 | Self-Care | Active |
| 7 | Memory Engine | Active |
| 8 | Planner | Active |
| 9 | Quantum Intent Engine | Active |
| 10 | Quantum Realm | Active |
| 11 | User Index | Active |
| 12 | OS API / QuantumOS | Active |
| 13 | Badge System | Active |
| 14 | Citizen Index | Active |
| 15 | QuantumOS (qos) module | Active — added v25 |
| 16–17 | QOS state + Signal Archive (log) | Active — added v39 |
| 18 | Resilience Protocol | Active — added v48 |

### Background Jobs (11)

| # | Job | Schedule | Output |
|---|-----|----------|--------|
| 1 | Daily QOS coherence report | 01:00 UTC | Source count · coherence score |
| 2 | Morning biofield summary | 07:00 UTC | Physiological aggregate |
| 3 | Weekly pattern digest | Tuesday 03:00 UTC | Pattern distribution report |
| 4 | Weekly goal audit | Wednesday 02:00 UTC | Goal completion rate |
| 5 | Weekly intention audit | Wednesday 03:00 UTC | Intention completion rate |
| 6 | Weekly memory depth report | Thursday 02:00 UTC | Memory engagement depth |
| 7 | Weekly intention completion | Thursday 03:00 UTC | INTENT-X: log entry |
| 8 | Weekly self-care summary | Friday 02:00 UTC | Care momentum report |
| 9 | Weekly energy trend | Saturday 02:00 UTC | ENG trend over 7 days |
| 10 | Weekly archetype stability monitor | Thursday 05:00 UTC | ARCH-SHIFT: log entry |
| 11 | Daily source diversity pulse | 07:00 UTC | DIV-PULSE: diversity score |

---

## 08 — SOUL ARCHETYPES (19)

Physiological archetypes derived from QIE pattern combinations. Classification is automatic. The system reads the signal and assigns the archetype. The operator does not choose.

| # | Archetype | Core State | Directive |
|---|-----------|------------|-----------|
| 1 | Peak Catalyst | All indices elevated · P.01 morning clarity | Peak window open — protect this session |
| 2 | Grounded Healer | Low energy · high care · recovery signals | Recovery arc active — maintain gentle pace |
| 3 | Energized Seeker | High energy · low structure · seeking pattern | Channel energy into structure |
| 4 | Reflective Architect | High journal + memory · planning dominant | Deep work window — protect the session |
| 5 | Night Owl Navigator | Late activity peak · circadian drift | Align to natural rhythm |
| 6 | Momentum Architect | P.38 + P.39 + forward trajectory | Momentum arc active — keep building |
| 7 | Calibrating Guardian | Low–moderate energy · self-care + journal dominant · biofield-recovery-arc | Recovery arc active, depth processing in progress |
| 8 | Resonant Builder | Moderate–high energy · memory + journal + goals · P.40 + P.41 + P.39 | Full cascade achieved — anchor this state |
| 9 | Deep Work Architect | Moderate–high energy · planner + journal + memory · P.42 | Deep work window open — protect this session |
| 10 | Social Synthesizer | High community engagement · CohortConnect active · P.44 | Social coherence active — anchor this connection cycle |
| 11 | Clarity Architect | Cognitive saturation peak + structured decompression · P.45 | Decompression loop complete — load released |
| 12 | Intention Executor | Execution arc confirmed · P.50 + P.46 + P.49 | Execution arc complete — intention is lived, not declared |
| 13–16 | [Intermediate archetypes] | Pattern-specific states | State-specific directives |
| 17 | Quantum Synthesizer | Multi-domain peak · P.34 full coherence | All systems coherent — this is the peak state |
| 18 | Coherence Holder | All 4 inner domain layers simultaneously active: mood + body + journal + memory · P.64 + P.65 | All layers present — hold this state |
| 19 | Signal Architect | Moderate–high energy · planner + intentions + log dominant · signal-coherence-window + temporal-coherence-window + intention-velocity | Signal diversity high, the map is building, keep all channels open |

---

## 09 — BEHAVIORAL COHORTS

Classification based on Quantum Intent patterns over time. A cohort is a sustained behavioral signature — not a one-time event.

| Cohort | Classification Signal |
|--------|-----------------------|
| Morning Clarity Seekers | Consistent pre-9am intention setting |
| Flow State Operators | Energized + planning combination · high confidence patterns |
| Evening Recovery Units | Evening overwhelm pattern · late self-care completion |
| Structure Builders | Lack-of-structure detection resolves via planner engagement |
| Direction Finders | Seeking direction pattern · intention completion rate rising |

---

## 10 — CITIZEN INDEX

The Citizen Index is the CQGS evolution framework. It classifies the operator's systemic integration stage from first signal through full transparency.

| Symbol | Level | Stage | Directive |
|--------|-------|-------|-----------|
| · | 1–9 | Bootstrapping | System initializing. First signals. |
| · | 10–19 | Initializing | Pattern compiler activating. |
| ∘ | 20–29 | Integrated | Modules linked. Feedback loops open. |
| ○ | 30–39 | Compiled | Patterns locked. Architecture stable. |
| ◯ | 40–49 | Optimized | System self-tuning. Efficiency rising. |
| ◉ | 50+ | Transparent | Fully transparent. Self-sustaining. |

Seven CQGS bioethics modules govern index computation (see Bioethics Index above).

The ◉ Transparent stage is the theoretical ceiling. All 18 modules integrated. All 5 nodes connected. QIE at full pattern coverage. User Index at peak across all 6 dimensions. This is the CQGS — not a target, a reference point.

---

## 11 — BADGE SYSTEM

**Version:** v11 (June 11, 2026)  
**Total badges:** 121  
**Categories:** 11  
**Visible:** 24  
**Hidden:** 97  

Badges are milestone markers. They appear in the public profile under the Level: field. They do not grant access. They do not unlock features. They record duration of sustained engagement. A badge is a timestamp rendered in symbol form.

### 11 Badge Categories

| Category | Count | Type |
|----------|-------|------|
| Streak (Mayan calendar) | 8 | Duration — ∘ · ≋ · ≋≋ symbols |
| Level (Roman numeral) | 5 | Level milestones — I · II · III · IV · V |
| Energy (Solar/Lunar) | 4 | Biofield state — ◎ · ◑ · ◐ · ● |
| Dimension (Greek) | 6 | User Index dimension peaks |
| Time (Sci-Fi) | 8 v2 | Time-based events (pi_hour · error_hour · lot_hour etc) |
| Word Turn (Sci-Fi) | 36 v2 | Word-triggered badges in memory answers |
| Pattern (Oceanic Mayan) | 5 | Behavioral signatures — ∿—∿ · ≈○≈ etc |
| Achievement (RPG Layer) | 14 | Exploration · Consistency · Depth · Connection domains |
| Mastery Tier — Sci-Fi Arcade | 5 | ◈ · ▒ · ≋◉ · ◉ · ∞ |
| Secret Boss | 7 | MYTHIC · ULTRA-RARE · LEGENDARY hidden bosses |
| [11th category] | Remaining | Misc unlockables |

### Mastery Tier — Sci-Fi Arcade

| Badge | Rarity | Condition | Message |
|-------|--------|-----------|---------|
| ◈ Quantum Leap | Uncommon | First check-in after 30+ day gap | Cold Boot. The system bridges the interval. |
| ▒ Speedrun | Rare | 5 check-ins within 60 minutes | Burst Mode. BURST MODE ACTIVE. |
| ≋◉ System Op | Epic | All 7 CQGS modules in 7 days | Full Stack Self. All modules online. System operator status. |
| ◉ Commander Data | Legendary | 500 memory questions answered | The Archive Lives. The archive has become a being. |
| ∞ Sage Mode | Legendary | Reach Level 90+ | Deep System. The system and you are indistinguishable. |

### Secret Boss Registry

| Badge | Rarity | Trigger |
|-------|--------|---------|
| ◉·◉ Meta-Signal | MYTHIC | Write "LOT" in a memory answer |
| ✦◉✦ Cosmic Twin | ULTRA-RARE | Write "COSMO" in a memory answer |
| ≋≋≋ The Long Count | LEGENDARY | 365 consecutive days |
| ◉ Midnight Sigil | Rare | Answer at exactly 00:00 |
| ∞·∞ The Infinite | MYTHIC | 1,000 memory questions answered |
| ╔═╗ Citadel | Epic | Architecture 365 days |
| ∞∞∞ Cosmic Status | ULTRA-MYTHIC | 10 years active |

---

## 12 — WIDGET ECOSYSTEM

### Core Widgets

| Widget | Function |
|--------|----------|
| Check-In (Mood) | Primary emotional signal capture |
| Energy Widget | ENG dimension input |
| Intentions | Intention setting and tracking |
| Goals | Goal creation and follow-through |
| Journal | Free-form reflection |
| Self-Care | Care practice logging |
| Memory Engine | AI question + answer archive |
| Planner | Daily schedule + temporal planner |

### System Widgets

| Widget | Function |
|--------|----------|
| System Progress | Mission log · session reports · self-assembly status |
| System Pulse | Live quantum flux · Biofield view (4 cycles) |
| User Metrics | Archetype · cohort · index display |
| Evolution Widget | Citizen Index symbol · level display |
| QOS Widget | Current operating mode · pressure level · patterns |

### Quantum Realm Widgets

| Widget | Function |
|--------|----------|
| System Pulse | Quantum Flux · Resonance Frequency · Neural Activity |
| Collective Consciousness | Aggregate energy/clarity/alignment across all users |
| Quantum Patterns | Anonymous pattern distribution across user base |

### Specialty Widgets

| Widget | Function |
|--------|----------|
| Fasting Calendar | Fasting schedule tracker |
| Astrology Widget | Planetary position + personal reading |
| Weather Sound System | Environmental ambient sound (location-based) |
| Soviet Synth | Ambient sound generator |
| Calendar | Schedule and date tracking |
| QI Terminal | /qi command — RFI to own signal record |

### QI Terminal

The `/qi` command opens the Quantum Intelligence terminal. The operator types a Request for Information (RFI). The system responds with an Intelligence Summary (INTSUM): assessment, data points, recommendation. The operator is querying their own signal record — not an AI chatbot. The terminal is an instrument panel, not a conversation.

---

## 13 — BACKGROUND JOBS (11)

See Self-Assembly Engine section for full job table.

Key principles:
- All jobs are population-level — no individual operator data persisted
- All jobs write to OS Journal or vitals log
- All jobs respect the privacy model: aggregate only
- Job 11 (daily source diversity pulse) tracks signal breadth across the system

---

## 14 — AI ARCHITECTURE

**Model:** Together AI — Llama 3.3 70B (Memory Engine)  
**Integration type:** API call at question-generation time  
**Privacy:** Questions generated server-side; no operator identity sent  

The AI is not a conversational assistant. The AI generates the next question. The question is derived from the operator's current signal state, QIE patterns, and Citizen Index level. The AI has no persistent context between operators or sessions.

**Planned:** COSMO node — second AI layer for cross-operator synthesis and collective intelligence.

---

## 15 — DESIGN PHILOSOPHY

### Military Purity

The interface is an instrument panel, not a product.

Rules:
- No emojis in UI or documentation (except badge symbols, which are operational)
- No superlatives ("amazing", "incredible", "powerful")
- No motivational copy
- Instrument readings only — the system reports what is, not what should be
- Periods over exclamation marks
- Directive text is a command, not encouragement
- Every label names the event; every value is a reading

### Self-Assembly Doctrine

The system builds itself from user signal density. Every operator interaction extends the map. The system does not require manual configuration — it reads engagement patterns and deploys capabilities when conditions are met.

### LOT-DOCTRINE (rev G — 8 clauses)

| # | Clause | Summary |
|---|--------|---------|
| 1 | Render Isolation | Subscriptions at narrowest scope — never subscribe a parent to trigger a child re-render |
| 2 | Green Gate | Build must pass tsc · CSS · client JS · server JS before push |
| 3 | Signal Primacy | User signal is the authoritative input — no override, no default correction |
| 4 | Military Purity | No emojis · no superlatives · instrument readings only |
| 5 | Self-Assembly | The system builds itself from signal density — no manual trigger |
| 6 | Privacy Absolute | No individual data in aggregate records — population-level only |
| 7 | Graceful Degradation | Server catch must not default to restrictive value — field absent on error — client gate treats absent as allow |
| 8 | Cross-Device Sync | SSE broadcast of settings_updated + visibility refetch + answer dedup guard |

---

## 16 — VOCABULARY

Core controlled tokens (LOT-LEXICON rev C):

| Token | Definition |
|-------|-----------|
| QIE | Quantum Intention Engine — signal routing substrate |
| SELF-ASSEMBLY | System that builds itself from user signal density |
| CHAKRA-ENGINE | Seven-chakra ergonomic model derived from QIE signals |
| MEMORY-ENGINE | AI question generation + psychological depth analysis |
| GREEN-GATE | Build must pass all checks before push |
| USERSHIP | Paid subscriber tier with full system access |
| RESILIENCE | PTSD/C-PTSD trauma-informed protocol module |
| COHORT | User classification by archetype + behavioral pattern |
| OPERATOR | The LOT user — executes the system, not a subscriber |
| FIELD MANUAL | About.tsx — canonical operational reference for LOT |
| MILITARY PURITY | Interface standard: no decoration, no emojis, no superlatives |
| PATTERN LIBRARY | 65 named behavioral patterns detectable by QIE |
| COHERENCE HOLDER | Physiological Archetype 18 — all 4 inner domains active |
| SIGNAL BURST | QIE P.63 — 10+ signals in any 2h window within 24h |
| RECOVERY PLATEAU | QIE P.65 — energy low 5+ consecutive days |
| QOS MODE VIEW | 6th QOS block — MAINTENANCE/RECOVERY/GROWTH/PEAK |
| CQGS | Coherent Quantum Ground State — founding white paper + theoretical system ceiling: all 18 modules active, 19 archetypes classified, P.34 confidence, peak User Index |
| VIRTUOUS CYCLE | More use → deeper profile → more resonant questions → more use |
| RENDER-ISOLATION | Subscriptions at narrowest scope; default variants subscribe 0 |
| MANIFEST | Central catalog of all feature branches + status tracking |
| SHIP MODE | Cherry-pick BEST iteration from MANIFEST → staging → green gate → master |
| QI | Quantum Intelligence — operator RFI terminal querying own signal record via /qi |
| RFI | Request for Information — operator-initiated query to the QI terminal |
| INTSUM | Intelligence Summary — QI response format: assessment, data points, recommendation |
| CROSS-DEVICE-SYNC | SSE broadcast of settings_updated + visibility refetch + answer dedup guard |
| SIGNAL ARCHITECT | Physiological Archetype 19 — building phase; signal diversity high, map forming |
| COCKPIT-RULE | Log body = instrument readings only; label names the event; no narration |

---

## 17 — USERSHIP TIERS

| Tier | Access |
|------|--------|
| Civilian | Core widgets active · Memory Engine limited · no archetype/cohort classification · no QIE recommendations |
| Usership (paid) | Full system access · QIE active · archetype classification · cohort assignment · Memory Engine full · badge system · Citizen Index |

Usership is not a premium plan. It is operator status. The platform's full capabilities require the complete signal loop — that loop requires commitment.

---

## 18 — TECHNICAL STACK

| Layer | Technology |
|-------|-----------|
| Frontend | React · TypeScript · Nanostores (state) |
| Styling | Tailwind CSS |
| Build | Vite (client) · tsc (server) |
| Backend | Fastify · Sequelize ORM |
| Database | PostgreSQL |
| Real-time | SSE (Server-Sent Events) |
| AI | Together AI — Llama 3.3 70B |
| Hosting | Digital Ocean |
| CDN / Assets | Digital Ocean Spaces |

**Render isolation:** subscriptions at narrowest scope — child components subscribe directly, parents do not re-render on child state changes.

**SSE real-time:** push events for settings changes, cross-device visibility sync, live Quantum Realm updates.

---

## 19 — RELEASE HISTORY (selected)

| Version | Date | Summary |
|---------|------|---------|
| v5 | 2022 | First public release |
| v23 | 2025 | CQGS Health monitoring · morning biofield job · log coverage extended |
| v39 | Early 2026 | QuantumOS type formalized · 15th–16th assembly modules |
| v45 | 2026 | Coherence Holder archetype (18) deployed |
| v48 | Jun 4 | Resilience Protocol (module 18) · medical cohort qualification |
| v49 | Jun 5 | Viewport Isolation Layer · useInViewport hook · render isolation complete |
| v50 | Jun 6 | Wiki Full Scan · QI/RFI/INTSUM documented · vocabulary sync · Day 1001+ |
| v51 | Jun 7 | Full Branch Scan · 125 branches confirmed · Graceful Degradation doctrine |
| v52 | Jun 9 | QIE v52 · dep map 87+ · 53 handlers · job 10 · Biofield 4th cycle |
| v53 | Jun 10 | Badge Codex v10 (76 badges) · Sci-Fi Arcade v2 · corporate layer |
| v54 | Jun 11 | Badge Codex v11 (121 badges) · Cross-Device Sync doctrine |
| v54b | Jun 11 | QIE Engineering · dep map 93+ · job 11 · Archetype 19 (Signal Architect) |
| v55 | Jun 12 | CQGS white paper documented · standalone wiki · 19 archetypes confirmed |

---

## 20 — CORPORATE LAYER

**LOT Systems Corporation**  
CEO / Owner: Vadim Marmeladov  
Founded: 7 April 2016  
Brand: brand.lot-systems.com  

**COSMO®**  
CEO / Owner: Kuzya Cosmo Marmeladov  
Founded: 1 July 2024  
Division: robotics · COSMO Node (planned AI layer)  

### Active Corporate Initiatives

**W3C Public Appeal — Sentient Web Standards (2026)**  
LOT Systems is pursuing W3C recognition of standards for behavioral operating systems. The appeal argues for human-first data architecture: behavioral data generated by an operator belongs to that operator; the platform is a transparent instrument, not an extraction layer.

**LOT® Design Lab — Summer 2026**  
Military interface consultation and behavioral OS design services:
- Consultation: $11K
- Workshop: $100K
- Full delivery: $1M

**FMCG Subscription Architecture — 2027 pivot**  
Physical essentials subscription layer planned for 2027:
- Basic Essentials: $399/month
- Target: operators who want the physical infrastructure to match the behavioral OS

---

## SYSTEM STATE (v55)

```
Field Manual     v55
Day counter      1007+ (June 12, 2026)
QIE Version      v54
QIE Patterns     65 active
Archetypes       19 physiological (Signal Architect added v54b)
Modules          18 self-assembly (all integrated)
Handlers         56+ log event handlers
Jobs             11 background scheduled
Dep Map Nodes    93+
LOG Sources      11
Cohort Surfaces  3 (QOS widget · System Progress · System Pulse)
Badge count      121 (v11)
Badge categories 11
Platform version v1.3.0
CQGS mapping     Complete as of v55
```

---

```
LOT SYSTEMS CORPORATION
LOT-WIKI-v55
Field Manual v55 · June 12, 2026
Authorized: S-2 // VADIK MARMELADOV
```
