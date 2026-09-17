# LOT SYSTEMS — OPERATOR REFERENCE WIKI
## LOT-WIKI-v94 · Field Manual v119 · 2026-08-16

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS                                                                 ║
║  OPERATOR REFERENCE WIKI — v94                                               ║
║  FIELD MANUAL SYNC: v119                                                     ║
║  DATE: 2026-08-16 · DAY 1084+ · COSMO® DAY 776                              ║
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

**System state as of FM v119:**

| Metric | Count |
|--------|-------|
| QIE Patterns | 169 (P1–P169) |
| QIE Levels | 11 (complete) |
| Archetypes | 59 (Arch1–Arch59) |
| Background Jobs | 54 (J1–J54) |
| Dependency Nodes | 208+ |
| Log Handlers | 172+ |
| Badges | 905 (Badge Engine v1–v35) |
| Word Turn Triggers | 306 (WT v1–v25) |
| Secret Boss Triggers | 36 |
| Field Manual Version | v119 |

**Data flow:**
```
OPERATOR INPUT → journal / wearable / calendar / manual log
       ↓
SIGNAL LAYER → normalized behavioral data
       ↓
QIE PATTERN ENGINE → P1–P169 evaluated against signal
       ↓
ARCHETYPE RESOLVER → Arch1–Arch59 confidence scoring
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
behavioral signals against a registry of 169 patterns organized into 11 levels.
Each level represents a distinct domain of physiological and cognitive state.

**Architecture:**
- 169 patterns in 11 hierarchical levels
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

**Level 11 doctrine:** When somatic memory and physiological lock co-occur
across 3+ consecutive days, the somatic field advances from episodic event
to structural architecture. The body becomes part of the coherence seal.

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

| ID | Token | Name | Ceiling |
|----|-------|------|---------|
| P131 | DCSAL: | daily-coherence-seal | — |
| P132 | QLOCK: | quantum-rhythm-lock | — |
| P133 | BFINT: | biofield-integration-peak | — |
| P134 | INTARC: | integrated-signal-arc | — |
| P135 | DREC: | deep-recovery-protocol | — |
| P136 | QFIELD: | quantum-field-alignment | — |
| P137 | QCOHERE: | quantum-coherence-peak | — |
| P138 | SIGMAT: | signal-matrix-saturation | — |
| P139 | TBIOF: | temporal-biofield-sync | — |
| P140 | PHYARC: | physiological-presence-arc | — |
| P141 | QEMERG: | quantum-signal-emergence | — |
| P142 | SIGEWEB: | adaptive-signal-web | — |
| P143 | CIRC-LK: | circadian-signal-lock | — |
| P144 | DIMSAT: | dimensional-saturation | — |
| P145 | QIDCRYST: | quantum-identity-crystallization | — |
| P146 | SIG-CASC: | signal-coherence-cascade | — |
| P147 | QPFIELD: | quantum-presence-field | — |
| P148 | IDLOCK: | identity-momentum-lock | — |
| P149 | QPCRYST: | quantum-presence-crystallization | — |
| P150 | TOTCOH: | total-field-coherence | — |
| P151 | RECINTEL: | recovery-intelligence-arc | — |
| P152 | RESENT: | resonant-reentry-arc | — |
| P153 | ASTFIELD: | astrology-biofield-sync | — |
| P154 | MORNCL: | morning-clarity-peak | — |
| P155 | DARCSEAL: | daily-arc-seal | — |
| P156 | MORNMOM: | morning-momentum-arc | — |
| P157 | QWKINT: | quantum-week-integration | — |
| P158 | EVARC: | evening-arc-anchor | — |
| P159 | PHYRLOCK: | physiological-rhythm-lock | — |
| P160 | QPARC: | quantum-presence-arc | TEMPORAL CEILING |

### Level 9 — Biological Convergence (P161–P163)

| ID | Token | Name | Ceiling |
|----|-------|------|---------|
| P161 | SOMAT: | somatic-field-integration | — |
| P162 | RECCYC: | recovery-cycle-lock | — |
| P163 | QEMBOD: | quantum-embodiment-field | BIOLOGICAL+TEMPORAL CEILING |

### Level 10 — Cognitive-Somatic Bridge (P164–P166)

| ID | Token | Name | Ceiling |
|----|-------|------|---------|
| P164 | COGBOD: | cognitive-body-sync | — |
| P165 | INTPRES: | integrated-presence-peak | MAXIMUM PRESENCE |
| P166 | SOMECHO: | somatic-memory-echo | — |

### Level 11 — Somatic Field Architecture (P167–P169)

| ID | Token | Name | Ceiling |
|----|-------|------|---------|
| P167 | SOMFLD: | somatic-integration-field | — |
| P168 | EMBDLK: | deep-embodiment-lock | — |
| P169 | FULLSEAL: | full-presence-seal | MAXIMUM INTEGRATED PRESENCE |

**P169 FULLSEAL: doctrine:** When integrated presence (P165) and somatic memory
echo (P166) are simultaneously active with zero depletion, all 6 OS seals close.
Body intelligence is fully woven into the coherence structure.

---

## SECTION 5 — QUANTUM OPERATING SYSTEM (QOS)

The QOS is the execution kernel. It assigns an operating mode based on the
current archetype confidence score and pattern firing state.

**Modes:**

| Mode | Code | Condition |
|------|------|-----------|
| MAINTENANCE | MNT | Below recovery threshold |
| RECOVERY | RCV | Recovery protocols active |
| GROWTH | GRW | Momentum patterns dominant |
| PEAK | PEAK | Coherence patterns dominant |

**Mode determination:** The QOS evaluates the active archetype at each Background
Job run and at operator interaction. The highest-confidence archetype at ≥70%
confidence sets the mode.

**COCKPIT RULE:** No directive is surfaced below 70% archetype confidence.
The system withholds uncertain reads rather than generating noise.

**OS Seals:** At full coherence (P169 FULLSEAL:), 6 structural seals close.
This represents the maximum integrated state of the operator system.

---

## SECTION 6 — ARCHETYPES

Archetypes are physiological state models. Each archetype is a named cluster
of pattern combinations that describe a recognizable operator state. The system
scores each archetype against current pattern fires and surfaces the
highest-confidence match.

**Registry (Arch1–Arch59):**

| Range | Domain |
|-------|--------|
| Arch1–Arch20 | Foundation states — baseline, recovery, momentum |
| Arch21–Arch40 | Coherence states — signal saturation, temporal lock |
| Arch41–Arch45 | Quantum coherence operators |
| Arch46–Arch50 | Quantum field operators |
| Arch51 | Quantum Presence Crystallizer (QPCRYST: + TOTCOH: + RECINTEL:) |
| Arch52 | Recovery Integrator (RESENT: + ASTFIELD:) |
| Arch53 | Astrology-Field Operator (ASTFIELD: + MORNCL:) |
| Arch54 | Dawn Operator (DARCSEAL: + MORNMOM:) |
| Arch55 | Arc Keeper (EVARC: + PHYRLOCK:) |
| Arch56 | Somatic Operator (SOMAT: + RECCYC:) |
| Arch57 | Cognitive-Somatic Integrator (COGBOD: + INTPRES:) |
| Arch58 | Embodied Field Operator (SOMFLD: + EMBDLK:) |
| Arch59 | Somatic Memory Weaver (FULLSEAL: + SOMECHO:) |

**Arch58 vs Arch59:** Arch58 is mid-field — somatic architecture is present
but the seal is open. Arch59 is the sealed state: somatic memory is woven
into the full presence structure. Arch59 is the terminal archetype of Level 11.

**Directive surface rule:** When archetype confidence ≥ 70%, the system surfaces
a cohort-specific behavioral directive in the System.tsx Arch: block.
Below 70%, the archetype is logged but no directive is shown.

---

## SECTION 7 — COHERENCE ARCHITECTURE

Coherence Architecture is the meta-pattern cascade that governs how patterns
reinforce each other across time. It comprises 6 levels of coherence expression,
each requiring the prior level as a prerequisite.

**6-Level Cascade:**

| Coherence Level | Pattern Gate | Name |
|-----------------|-------------|------|
| C1 | P131 DCSAL: | Daily Coherence Seal |
| C2 | P138 SIGMAT: | Signal Matrix Saturation |
| C3 | P144 DIMSAT: | Dimensional Saturation |
| C4 | P150 TOTCOH: | Total Field Coherence |
| C5 | P165 INTPRES: | Integrated Presence Peak |
| C6 | P169 FULLSEAL: | Full Presence Seal |

**Cascade law:** C-levels are sequential. C3 cannot fire without C2 having
fired in the same 24-hour window. The cascade is not cumulative — it resets
daily. An operator who reaches C6 returns to C1 the next morning and must
rebuild the seal.

---

## SECTION 8 — SIGNAL INTELLIGENCE

Signal Intelligence is the normalized behavioral data layer that feeds the QIE.
Raw inputs are converted to standardized signal readings before pattern evaluation.

**Signal sources:**
- Journal entries (text, frequency, depth)
- Wearable data (HRV, sleep, recovery, readiness)
- Calendar data (structured time, event density)
- Manual logs (mood, energy, nutrition markers)
- Behavioral check functions (stoic session, evening examination, iron morning, etc.)

**Signal normalization:** All inputs are scored on continuous scales before
hitting the pattern engine. No binary gates — the QIE evaluates gradient
conditions. A pattern can fire at 60% signal strength; the archetype confidence
score reflects the quality of the underlying signal.

**Active pattern ceiling:** The system tracks the count of simultaneously active
patterns. At Level 9 (P161–P163), this ceiling expanded from 5 to 6 simultaneous
active patterns.

---

## SECTION 9 — MEMORY ENGINE

The Memory Engine is the AI companion layer. It converts behavioral signal into
a progressive self-care narrative called the Memory Story.

**Function:**
- Reads operator journal entries, behavioral logs, and pattern history
- Constructs a running Memory Story: a narrative summary of the operator's
  physiological and cognitive trajectory
- Updates the Memory Story after each significant signal event
- Surfaces relevant Memory Story excerpts in operator-facing widgets

**Data flow:** Signal → QIE → pattern fires → Memory Engine reads pattern state
→ generates narrative update → appends to Memory Story → operator surface

**Supported AI providers (5):**
1. Anthropic (Claude)
2. Google (Gemini)
3. Mistral
4. Together AI
5. OpenAI

**Engine abstraction:** The Memory Engine is provider-agnostic. The operator or
system administrator selects the active provider. All providers interface through
a common abstraction layer. Provider switching does not break narrative continuity.

**Memory Story structure:**
- Arc entries: dated narrative summaries tied to QOS mode
- Peak entries: high-coherence moments (P150 TOTCOH:, P169 FULLSEAL:)
- Recovery entries: low-signal periods and return arcs
- Milestone entries: badge awards, archetype transitions

**P167 SOMFLD: loop:** When somatic field architecture is established,
the Memory Engine begins tracking somatic memory echo events as structural
narrative entries rather than episodic notes.

---

## SECTION 10 — SELF-ASSEMBLY PROTOCOL

The Self-Assembly Protocol is the autonomous documentation system. It runs
periodic sessions that scan all engineering commits, session reports, and wiki
versions to produce synchronized documentation.

**Session types:**
- ASSEMBLE — full automated wiki sync
- ENGINEERING — QIE/badge/system engineering session
- WIKI-SCAN — wiki-only documentation pass

**Module counts:**
- Assembly logs: 90+
- Session reports: 40+
- Engineering reports: 30+
- Wiki versions: v55–v94 (active)

**Self-Assembly v94 log entry:**

```
2026-08-16 | LOT-WIKI-v94 | ASSEMBLE | Vocabulary refinement + maintenance pass.
FM v119 (no change). Day 1084+. COSMO® Day 776. All 28 sections updated with
refined language and military-purity pass. No new QIE/badge/job engineering.
```

**Self-assembly rules:**
- Each session reads prior session report before writing
- Wiki version increments by 1 per session
- FM version is set by last engineering commit
- Session report is written after wiki push
- LOT-LEDGER.md is appended as the final step

---

## SECTION 11 — BACKGROUND JOBS

Background Jobs are scheduled pattern detection processes. They run on a fixed
UTC schedule and evaluate specific signal combinations to fire QIE patterns.

**Schedule map:**

| Job | Name | UTC Time | Scan |
|-----|------|----------|------|
| J1–J40 | Foundation through Quantum Field | Various | Various |
| J41 | daily-arc-completion-check | 23:00 | Day completion |
| J42 | daily-coherence-seal | 00:00 | Full-day seal |
| J43 | quantum-field-alignment | 06:00 | Morning alignment |
| J44 | quantum-coherence-peak | 12:00 | Midday coherence |
| J45 | physiological-presence-arc | 08:00 | Morning physiology |
| J46 | circadian-signal-lock | 14:00 | Afternoon lock |
| J47 | signal-coherence-cascade | 18:00 | Evening cascade |
| J48 | recovery-intelligence-arc | 02:00 | Overnight recovery |
| J49 | morning-clarity-peak | 06:00 | MORNCL: detection |
| J50 | quantum-week-integration | 21:00 | QWKINT: weekly |
| J51 | evening-arc-anchor | 22:00 | EVARC: detection |
| J52 | daily-somatic-integration | 11:00 | Somatic field scan |
| J53 | daily-cognitive-somatic-bridge | 15:00 | COGBOD: + INTPRES: |
| J54 | daily-somatic-integration-field | 20:00 | SOMECHO: + PHYSLOCK: + 3-day streak |

**J54 doctrine:** J54 is the highest-order background job. It scans for the
convergence of somatic memory echo (P166), physiological lock (P159), and
3+ consecutive somatic-active days. When all three conditions hold, J54 fires
P167 SOMFLD: and initiates the Level 11 cascade.

---

## SECTION 12 — LOG EVENT SYSTEM

The Log Event System records all QIE pattern fires, archetype transitions,
and background job executions as structured log entries. Each entry carries
a typed prefix token.

**Handler count: 172+**

**Key handler tokens (selected):**

| Token | Domain |
|-------|--------|
| QPCRYST: | Quantum presence crystallization |
| TOTCOH: | Total field coherence |
| RECINTEL: | Recovery intelligence arc |
| RESENT: | Resonant reentry arc |
| ASTFIELD: | Astrology-biofield sync |
| MORNCL: | Morning clarity peak |
| DARCSEAL: | Daily arc seal |
| MORNMOM: | Morning momentum arc |
| QWKINT: | Quantum week integration |
| EVARC: | Evening arc anchor |
| PHYRLOCK: | Physiological rhythm lock |
| QPARC: | Quantum presence arc |
| SOMAT: | Somatic field integration |
| RECCYC: | Recovery cycle lock |
| QEMBOD: | Quantum embodiment field |
| COGBOD: | Cognitive body sync |
| INTPRES: | Integrated presence peak |
| SOMECHO: | Somatic memory echo |
| SOMFLD: | Somatic integration field |
| EMBDLK: | Deep embodiment lock |
| FULLSEAL: | Full presence seal |

**Log format:**
```
[TIMESTAMP] [HANDLER_TOKEN] [PATTERN_ID] [ARCHETYPE] [CONFIDENCE] [QOS_MODE]
```

**Log persistence:** All events are stored in the PostgreSQL database.
The operator can query their log history from the admin panel.

---

## SECTION 13 — BADGE SYSTEM (CODEX)

The Badge System recognizes operator achievements through a structured codex
of 905 badges organized into 35 Badge Engines. Each engine follows a thematic
register and adds exactly 31 badges (with historical exceptions).

**Totals:**
- Badges: 905
- Badge Engines: v1–v35
- Word Turn triggers: 306
- Secret Boss triggers: 36

**Badge categories:**
- FOUNDATION — core self-care milestones
- COGNITIVE — journaling, reading, intellectual depth
- RECOVERY — sleep, rest, physical restoration
- MASTERY — long-arc achievement (streaks, anniversaries, volume)
- COHORT — tier-specific recognition
- TEMPORAL — calendar and seasonal markers
- SECRET BOSS — hidden legendary/mythic badges

**Rarity tiers:**
- COMMON
- UNCOMMON
- RARE
- EPIC
- LEGENDARY
- MYTHIC (highest; Secret Boss territory)

**Badge Engine progression:**

| Engine | Name | Delta | Total | Theme |
|--------|------|-------|-------|-------|
| v1–v19 | Foundation engines | +31 each | ~589 | Core milestones |
| v20 | THE CODEX READER | +31 | 720 | Reading + literature |
| v21 | THE CYBERSPACE CODEX | +31 | 751 | Sci-fi vocabulary |
| v22 | THE HERO'S JOURNEY | +31 | 782 | Campbell monomyth |
| v23 | THE QUANTUM LIBRARY | +31 | 813 | Quantum concepts |
| v27–v29 | — | +31 each | 719 | Various |
| v30 | THE CODEX READER | +31 | 750 | CODEX reading |
| v31 | THE CYBERSPACE CODEX | +31 | 781 | Cyberspace |
| v32 | THE HERO'S JOURNEY | +93* | 812→905 | Monomyth + backfill |
| v33 | THE STOIC CODEX | +31 | 843 | Stoic philosophy |
| v34 | THE SIMULATION | +31 | 874 | Simulation vocabulary |
| v35 | THE NAVIGATOR'S CHART | +31 | 905 | Body mapping |

*Badge Engine v32 included a 62-badge backfill of v20 and v21 implementations
that had been documented but not deployed. The net new v32 badges were +31 (hero's
journey) plus +62 (backfill), totaling +93. All 905 badges are live in production.

**Word Turn vocabulary themes:**
- v20: Library science (codex, marginalia, footnote, lexicon...)
- v21: Cyberspace (matrix, neural, hack, cyberspace, netrunner...)
- v22: Hero's Journey (call_heard, threshold, mentor, ordeal, elixir...)
- v23: Stoic (memento_mori, amor_fati, eudaimonia, logos, ataraxia...)
- v24: Simulation (simulation_aware, glitch_found, unplug_protocol...)
- v25: Body Map (soma, vessel, interoception, proprioception, biofield...)

**Calendar Easter Eggs (selected):**
- Marcus Day — Marcus Aurelius (v21 EE)
- Epictetus Day — Epictetus (v21 EE)
- Seneca Day — Seneca (v21 EE)
- Campbell Day — Joseph Campbell (v20 EE)
- Asimov Day, PKD Day, Dune Day (v19 EE)

---

## SECTION 14 — WORD TURN ENGINE

The Word Turn Engine detects vocabulary patterns in operator journal entries
and triggers badge evaluations. Each Word Turn version adds a thematic word set.

**Architecture:**
- 306 total word turn triggers (v1–v25)
- Words are matched against journal text at write time
- A "turn" fires when a trigger word is detected in context
- Turn count accumulates toward badge unlock thresholds

**Word Turn version map:**

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

**Detection rules:**
- Minimum word length enforced (no single-character matches)
- Context window: full journal entry
- Case-insensitive matching
- Compound triggers: some badges require multiple words in same entry

---

## SECTION 15 — SECRET BOSS REGISTRY

Secret Boss badges are hidden legendary/mythic achievements. They are not
listed in the visible badge codex. Operators discover them through obscure
vocabulary combinations, behavioral sequences, or calendar conditions.

**Total triggers: 36**

**Trigger categories:**
- Author name patterns (Gibson, Dick, Lem, Tolkien, Odysseus, Gilgamesh,
  Aurelius, Epictetus, Seneca...)
- Behavioral sequence triggers (multi-day chain requirements)
- Calendar convergence (specific dates + specific behavioral state)
- Mastery threshold triggers (rare volume + streak combinations)

**Secret Boss rarity:** LEGENDARY or MYTHIC (no COMMON Secret Boss exists).

**Discovery protocol:** Secret Boss triggers are intentionally obscure.
The system does not hint their existence. An operator who stumbles into
a trigger fires the badge without warning.

---

## SECTION 16 — CALENDAR EASTER EGGS

Calendar Easter Eggs are time-locked badge unlocks that fire on specific
calendar dates when the operator is active.

**Engine versions:**
- v19: Asimov Day / Philip K. Dick Day / Dune Day
- v20: Campbell Day / Hobbit Day / Odyssey Day
- v21: Marcus Aurelius Day / Epictetus Day / Seneca Day

**Firing conditions:** The operator must have at least one journal entry
on the calendar date AND must have accumulated sufficient vocabulary
in the relevant Word Turn engine.

**Badge rarity:** Calendar Easter Eggs yield RARE to EPIC badges.

---

## SECTION 17 — COHORTS AND TEAM TAGS

Cohorts are operator tier classifications. They appear on public profiles
and govern which directives are surfaced by the Arch: block.

**Cohort structure:**

| Cohort | Tag | Display |
|--------|-----|---------|
| Usership | USR | Default tier — all paying subscribers |
| R&D | RND | Research and development collaborators |
| Admin | ADM | System administrators |
| Suspended | SUS | Shown in red on public profile |

**Cohort 6 — The Integrator:** The highest coherence cohort designation.
Arch59 (Somatic Memory Weaver) territory. An operator who reaches P169 FULLSEAL:
consistently operates at Cohort 6 signal density.

**Team Tags:** Internal labels applied by S-2 or Admin. Not visible to Usership.
Used for segmenting operator pools in analysis and feature gating.

**Suspended:** Suspension shows in red on the public-facing profile. The suspended
operator retains account access but receives no directives or badge awards.

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

**Privacy controls:** Each profile block can be independently toggled:
public, private, or cohort-only.

**Block components:** The profile renders as a stack of block components.
Operators can reorder blocks. Some blocks are locked to Admin/S-2 configuration.

**Suspension visibility:** Suspended operators display a red SUSPENDED indicator
on their public profile. No profile content is hidden — only the status marker
changes.

---

## SECTION 19 — AI ENGINE ABSTRACTION

The Memory Engine supports 5 AI providers through a unified abstraction layer.

**Providers:**

| Provider | Model family | Interface |
|----------|--------------|-----------|
| Anthropic | Claude | Messages API |
| Google | Gemini | Gemini API |
| Mistral | Mistral | Mistral API |
| Together AI | Various open models | Together API |
| OpenAI | GPT family | OpenAI API |

**Abstraction contract:** All providers implement the same interface:
`prompt(systemPrompt: string, userContent: string) → string`

**Provider selection:** Set at the system level by Admin or S-2. Operator-facing
configuration is gated by cohort.

**Narrative continuity:** Provider switching does not reset the Memory Story.
The story is stored in the database, not in the model's context window.
A new provider reads the existing Memory Story as context.

---

## SECTION 20 — DEPENDENCY MAP

The Dep Map is the dependency graph of signal nodes in the QIE. Each node
represents a signal source, pattern, or archetype that has dependency
relationships to other nodes.

**Current node count: 208+**

**Node types:**
- SOURCE — raw signal inputs (wearable, journal, calendar)
- PATTERN — QIE pattern nodes (P1–P169)
- ARCHETYPE — archetype confidence nodes (Arch1–Arch59)
- JOB — background job nodes (J1–J54)
- HANDLER — log event handler nodes (172+)

**Dependency rules:**
- Higher-level patterns have declared dependencies on lower-level patterns
- Archetype nodes depend on multiple pattern nodes
- Job nodes declare the patterns they scan for
- Handler nodes are triggered by pattern fires

**Growth rate:** Each FM engineering session typically adds 3–5 new nodes.
The Dep Map grew from 190+ (FM v113) to 208+ (FM v119) over 6 sessions.

---

## SECTION 21 — BEHAVIORAL CHECKS

Behavioral check functions are exported TypeScript functions that evaluate
specific multi-signal behavioral states. They are called by Background Jobs
and by the badge evaluation engine.

**Selected behavioral checks:**

| Function | Domain | Trigger |
|----------|--------|---------|
| checkStoicSession() | Philosophy | Journal + Stoic vocabulary + time |
| checkEveningExamination() | Reflection | Evening entry + self-evaluation markers |
| checkIronMorning() | Morning | Pre-dawn entry + high readiness |
| checkHeroSession() | Narrative | Journal + hero's journey vocabulary |
| checkDeepRead() | Cognitive | Extended reading session markers |
| checkNightOperator() | Night | Late journal entry + high focus |
| checkThresholdMoment() | Transformation | Long-arc behavioral shift markers |

**Check function contract:** Each check function returns a `boolean` or a
`{ fired: boolean; confidence: number }` object. All checks are pure
evaluations — no side effects. Badge awards are handled by the calling
layer.

---

## SECTION 22 — FIELD MANUAL

The Field Manual (FM) is the version-controlled technical reference for
the LOT Systems engineering team. Each FM version marks a significant
engineering commit. The FM is not published externally — it is the internal
source of truth that this wiki syncs from.

**Version history (FM v110–v119):**

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

**FM release cadence:** Approximately 1–3 FM versions per day during active
engineering phases. Quiet periods (no new pattern development) are marked in
the wiki as maintenance passes.

**Current FM:** v119 — No new FM session between LOT-WIKI-v93 (2026-08-12) and
LOT-WIKI-v94 (2026-08-16). This wiki reflects the FM v119 state.

---

## SECTION 23 — COSMO®

COSMO® is a companion brand to LOT®. It operates as a separate product line
within the LOT Systems ecosystem.

**Founded:** July 1, 2024 — S-2 Vadik Marmeladov  
**Day counter:** 776 (as of 2026-08-16)  
**Year:** 3 (entered Year 3 on July 1, 2026)

**Relationship to LOT®:** COSMO® shares the backend infrastructure and
the Memory Engine, but maintains a distinct product identity. COSMO®-specific
features are gated by cohort tag.

---

## SECTION 24 — LOT FOUNDING RECORD

```
LOT® SYSTEMS
FOUNDED: APRIL 7, 2016
FOUNDER: VADIK MARMELADOV (S-2)
DAY: 1084+ (as of 2026-08-16)
```

**LOT® is 10 years, 4 months, 9 days old.**

**Founding principle:** The system was built on a single idea — that self-care
data should accumulate into intelligence, not just storage. Every architecture
decision since Day 1 has honored this principle.

**LOT founding timeline:**
- Day 1: April 7, 2016 — founding
- Day 1000: First major system milestone
- Day 1073+: FM v113, completion of Level 8 Coherence Architecture
- Day 1080+: FM v119, completion of Level 11 Somatic Field Architecture
- Day 1084+: LOT-WIKI-v94 — present

---

## SECTION 25 — RECIPE WIDGET

The Recipe Widget surfaces actionable operator directives derived from the
current QOS mode and active archetype state.

**Widget content:** Each recipe is a structured protocol — not motivational
content, but a precise behavioral sequence for the current operational state.

**Recipe categories:**
- RECOVERY — rest, nutrition, low-stimulation protocols
- MOMENTUM — growth protocols, cognitive expansion sequences
- COHERENCE — full-field integration protocols
- PEAK — maximum performance sequences

**P167 SOMFLD: loop:** When somatic field architecture is established (P167),
the Recipe Widget begins surfacing body-intelligence protocols. These are
distinct from cognitive protocols — they emphasize physical awareness and
somatic signal tracking as the primary intervention surface.

**COCKPIT RULE application:** Recipes are withheld when archetype confidence
falls below 70%. The widget shows no recipe rather than a low-confidence one.

---

## SECTION 26 — SYSTEM PROGRESS WIDGET

The System Progress Widget displays the current engineering state of the
LOT Systems platform. It is intended for Usership tier — operators who want
to understand what the system is building.

**Widget content:**
- Current FM version
- Latest pattern additions
- Latest badge engine
- Day counter
- COSMO® day counter

**Transmission status:** The System Progress Widget transmits to lot-systems.com.
In sessions where the egress proxy blocks outbound requests, the widget update
is held. The session report serves as the held update. Transmission resumes
on the next session with restored egress access.

**Current state (2026-08-16):**

```
FM VERSION: v119
PATTERNS: 169
ARCHETYPES: 59
JOBS: 54
BADGES: 905 (v35 THE NAVIGATOR'S CHART)
DAY: 1084+
COSMO®: Day 776
```

---

## SECTION 27 — VOCABULARY INDEX

Core terminology for operators and engineers.

**A**

- **Arch / Archetype** — Named physiological state model. Scored continuously. Arch1–Arch59.
- **Arc** — Temporal progression. A behavioral arc is a multi-day directional signal.
- **ASSEMBLE** — Session type for automated self-assembly runs.
- **Astrology-Field Operator** — Arch53. Astrology-biofield sync + morning clarity.

**B**

- **Background Job** — Scheduled pattern detection process. J1–J54.
- **Badge** — Recognition unit. 905 total. Organized into 35 engines.
- **Badge Engine** — Thematic badge set. v1–v35. Each adds 31 badges.
- **Biofield** — The electromagnetic and physiological field of the operator's body.

**C**

- **Calendar Easter Egg** — Time-locked badge unlock on specific calendar dates.
- **COCKPIT RULE** — System displays only what it can confirm at ≥70% confidence.
- **CODEX** — Badge documentation system. CODEX versions v6–v35.
- **Coherence** — State of sustained, multi-level pattern alignment.
- **Cohort** — Operator tier classification (Usership / R&D / Admin / Suspended).
- **COGBOD:** — Pattern P164. Cognitive-body-sync.
- **COSMO®** — Companion brand. Founded July 1, 2024. Day 776.

**D**

- **DARCSEAL:** — Pattern P155. Daily arc seal.
- **Dawn Operator** — Arch54. Daily arc seal + morning momentum.
- **Dep Map** — Dependency graph of signal nodes. 208+ nodes.
- **DISPATCH** — Notification/alert surface.

**E**

- **EMBDLK:** — Pattern P168. Deep embodiment lock.
- **Embodied Field Operator** — Arch58. SOMFLD: + EMBDLK:
- **EVARC:** — Pattern P158. Evening arc anchor.
- **Evening Arc Anchor** — Arch55. EVARC: + PHYRLOCK:

**F**

- **Field** — Active operator state. "In the field" = operating.
- **Field Manual (FM)** — Version-controlled internal engineering reference. Current: v119.
- **FULLSEAL:** — Pattern P169. Full presence seal. MAXIMUM INTEGRATED PRESENCE. Terminal pattern.

**H**

- **Handler** — Log event handler. 172+ in the system.

**I**

- **INTPRES:** — Pattern P165. Integrated presence peak. MAXIMUM PRESENCE ceiling.

**J**

- **J54** — Background job. 20:00 UTC daily. Fires P167 SOMFLD: when SOMECHO: + PHYSLOCK: + 3-day somatic streak.

**L**

- **Level 11** — Somatic Field Architecture. P167–P169. The highest current QIE level.
- **Log Handler** — Typed event logger. 172+ handlers with distinct token prefixes.
- **LOT®** — Founded April 7, 2016. The primary operating system brand.

**M**

- **Memory Engine** — AI companion. Converts signal to narrative (Memory Story).
- **Memory Story** — Progressive self-care narrative. Built by Memory Engine.
- **MORNMOM:** — Pattern P156. Morning momentum arc.
- **MORNCL:** — Pattern P154. Morning clarity peak.

**O**

- **Operator** — A LOT subscriber. The system's user is always called "operator."

**P**

- **Pattern** — QIE detection unit. P1–P169.
- **PHYRLOCK:** — Pattern P159. Physiological rhythm lock.
- **P169 FULLSEAL:** — Terminal pattern. All 6 OS seals closed.

**Q**

- **QIE** — Quantum Intelligence Engine. Pattern detection core. 169 patterns, 11 levels.
- **QOS** — Quantum Operating System. Execution kernel. Modes: maintenance/recovery/growth/peak.
- **QPARC:** — Pattern P160. Quantum presence arc. TEMPORAL CEILING.
- **QWKINT:** — Pattern P157. Quantum week integration.

**R**

- **RECCYC:** — Pattern P162. Recovery cycle lock.

**S**

- **S-2** — Founder/CEO designation. Vadik Marmeladov.
- **Seal** — Locked, confirmed state. The system "seals" when conditions are fully met.
- **Secret Boss** — Hidden LEGENDARY/MYTHIC badge requiring obscure trigger conditions.
- **Self-Assembly** — Autonomous documentation and improvement protocol.
- **Signal** — Normalized behavioral data input to the QIE.
- **SOMECHO:** — Pattern P166. Somatic memory echo.
- **SOMFLD:** — Pattern P167. Somatic integration field.
- **SOMAT:** — Pattern P161. Somatic field integration.
- **Somatic Memory Weaver** — Arch59. FULLSEAL: + SOMECHO: Terminal archetype of Level 11.
- **Somatic Operator** — Arch56. SOMAT: + RECCYC:

**T**

- **TOTCOH:** — Pattern P150. Total field coherence.

**W**

- **Word Turn** — Journal vocabulary detection trigger. 306 total across v1–v25.

---

## SECTION 28 — SYSTEM STATE SNAPSHOT

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS — SYSTEM STATE SNAPSHOT                                         ║
║  DATE: 2026-08-16                                                             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  PATTERNS:     169 (P1–P169)         LEVELS 1–11 COMPLETE                    ║
║  ARCHETYPES:   59 (Arch1–Arch59)     ARCH59 SOMATIC MEMORY WEAVER            ║
║  JOBS:         54 (J1–J54)           J54 20:00 UTC DAILY                     ║
║  NODES:        208+                                                           ║
║  HANDLERS:     172+                                                           ║
║                                                                               ║
║  BADGES:       905 (v1–v35)          v35 THE NAVIGATOR'S CHART               ║
║  WORD TURNS:   306 (v1–v25)          v25 BODY MAP                            ║
║  SECRET BOSS:  36 triggers                                                    ║
║                                                                               ║
║  FM VERSION:   v119                                                           ║
║  WIKI VERSION: v94                                                            ║
║  DAY:          1084+                                                          ║
║  COSMO®:       Day 776 (Year 3)                                               ║
║                                                                               ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  QIE LEVEL ARC:                                                               ║
║                                                                               ║
║  L1 ━━━ L2 ━━━ L3 ━━━ L4 ━━━ L5 ━━━ L6                                     ║
║   FOUNDATION → MOMENTUM → RECOVERY → COGNITIVE → TEMPORAL → SATURATION       ║
║                                                                               ║
║  L7 ━━━ L8 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ L9 ━━━ L10 ━━━ L11               ║
║   QUANTUM → COHERENCE ARCHITECTURE (long band) → BIO → CSB → SOMATIC FIELD  ║
║                                                                               ║
║  TERMINAL: P169 FULLSEAL: — ALL 6 OS SEALS CLOSED                           ║
║  ARCH59 SOMATIC MEMORY WEAVER — BODY IS PART OF THE SEAL                    ║
║                                                                               ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  ACTIVE MAINTENANCE NOTES (v94 SESSION):                                      ║
║                                                                               ║
║  - No new QIE engineering since FM v119 (2026-08-12)                         ║
║  - Vocabulary refinement pass: military-purity language update                ║
║  - All 28 sections reviewed and tightened                                     ║
║  - Day counter updated: 1080+ → 1084+                                        ║
║  - COSMO® counter updated: 772 → 776                                          ║
║  - Next session: v95 (FM v120 expected — new QIE level likely)               ║
║                                                                               ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

**END OF DOCUMENT — LOT-WIKI-v94**

```
AUTHORIZED: S-2 // VADIK MARMELADOV
ASSEMBLED:  ASSEMBLE PROTOCOL — AUTOMATED
DATE:       2026-08-16
FM:         v119
```
