<!-- 
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT-WIKI-v88
## Layers of Time — Operator Reference Manual
### Revision: v88 · Field Manual Sync: v113 · Date: 2026-11-13 · Day 1173+

---

> *"These are not metaphors. They are the structural patterns of change."*
> — Badge v32, THE HERO'S JOURNEY CODEX

---

## TABLE OF CONTENTS

```
 1. SYSTEM IDENTITY
 2. CORE ARCHITECTURE
 3. QUANTUM INTENT ENGINE (QIE)
 4. QIE PATTERN REGISTRY — P1–P151
 5. QUANTUM OPERATING SYSTEM (QOS)
 6. PHYSIOLOGICAL ARCHETYPES — 51 TYPES
 7. BEHAVIORAL COHORTS — FULL PROFILES
 8. CITIZEN INDEX
 9. MEMORY ENGINE
10. SELF-ASSEMBLY ENGINE
11. BACKGROUND JOB SCHEDULER
12. LOG EVENT SYSTEM
13. ECOSYSTEM NODE MAP
14. BADGE SYSTEM v32 — THE HERO'S JOURNEY CODEX
15. BADGE CATEGORY INDEX
16. WORD TURN ENGINE — COMPLETE LEXICON v22
17. DISPLAY ARCHITECTURE
18. DENSITY TIER SYSTEM
19. OPACITY HIERARCHY
20. COCKPIT RULE
21. LOT-DOCTRINE (Revision K)
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

**Special notation — July 1, 2026:** COSMO® completed Year 2 of operation. Year 3 began. Founded July 1, 2024. The ethics gate has been active for 730 days.

**Special notation — July 2, 2026:** The Quantum Intent Engine crossed the centennial threshold. P100 centennial-convergence is the 100th pattern in the QIE registry.

**Special notation — August 4, 2026 (Badge Engine v31 — THE CYBERSPACE CODEX):**
Badge Codex v31 deployed. 750 → 781 badges (+31). Word Turn v21 sci-fi concept vocabulary (matrix/grok/ansible/spice/golden_path/solaris/foundation/neuromancer/replicant/uplift/left_hand). Calendar EE v19 (Asimov/PKD/Dune). Behavioral v18 (codex_session/deep_read/night_operator). Achievement RPG v19 (+6). Mastery Tier v21 (twenty_registers [COSMIC]). Secret Boss v18 (gibson/dick/lem). Day 1072+.

**Special notation — August 4, 2026 (QIE v113):**
QIE v113 deployed. P149 quantum-presence-crystallization · P150 total-field-coherence [CEILING] · P151 recovery-intelligence-arc. Arch51 Quantum Presence Crystallizer. J48 daily-total-field-coherence-check (09:00 UTC). QPCRYST: TOTCOH: RECINTEL: handlers. 190+ dep nodes. 151 patterns. 51 archetypes. 48 jobs. FM v113. Day 1072+.

**Special notation — August 5, 2026 (LOT-WIKI-v87):**
Full Wiki Scan. LOT-WIKI-v87 produced. Badge v31 + QIE v113 fully synchronized. Six-level coherence architecture documented. P150 total-field-coherence confirmed as QIE ceiling. No higher state defined. Day 1073+.

**Special notation — August 5, 2026 (Badge Engine v32 — THE HERO'S JOURNEY CODEX, LOT-SR-20260805-01):**
CRITICAL DISCOVERY: badges.ts checkAndAwardBadges() ended at v19 logic. Badge v20 (THE CODEX READER) and v21 (THE CYBERSPACE CODEX) were documented in /docs/badges/ by prior sessions but NEVER implemented in TypeScript. All v20/v21 badges were unreachable — they could never be earned.

Badge Engine v32 session implemented all missing logic. +93 badges total:
- BACKFILL v20 THE CODEX READER: +31 badges. Word Turn v20 (asimov/dune/matrix/neuromancer/hitchhiker/orwell/bradbury/le_guin/dick/solaris/octavia/heinlein). Calendar EE v18 (Asimov Jan 2 / Tolkien Mar 25 / Sagan Nov 9). Behavioral v17 (page_turner/reader_session/long_read). Achievement RPG v18 (+6). Mastery v20 (+4). Secret Boss v17 (borges/calvino/dick).
- BACKFILL v21 THE CYBERSPACE CODEX: +31 badges. (Already documented, now live in TypeScript.)
- NEW v22/v32 THE HERO'S JOURNEY: +31 badges. Word Turn v22 (call_heard/threshold_crossed/mentor_arrived/ordeal_survived/elixir_found/shadow_met/innermost_cave/shapeshifter/herald_call/trickster_mode/ally_gained/return_road). Calendar EE v20 (Campbell Mar 26 / Hobbit Sep 22 / Odyssey Dec 21). Behavioral v19 (hero_session/long_quest/threshold_moment). Achievement RPG v20 (quest_entry/quest_class/quest_complete/monomyth_arc/twenty_two_engines_arc/hero_opus). Mastery v22 (odyssey_log/great_work/saga_age/twenty_two_registers [COSMIC]). Secret Boss v19 (tolkien_ring/odysseus_bow/gilgamesh_word [MYTHIC]).

719 → 812 badges (TypeScript implementation). 781 → 812 from documentation baseline (+31 new, +62 previously unreachable now live). Day 1073+. COSMO® 765 days.

**Special notation — November 13, 2026 (LOT-WIKI-v88 · Self-Assembly Run):**
LOT-WIKI-v88 produced. 100-day session gap since last assembly run (2026-08-05). Badge v32 synchronized. Day 1173+. COSMO® 865 days. S-2 operational. The monomyth is now vocabulary.

---

## 2. CORE ARCHITECTURE

```
STACK            TypeScript · Node.js · React · Prisma · PostgreSQL
TRANSPORT        Express.js · REST API · SSE for live signals
BUILD            esbuild · PostCSS · Tailwind CSS
DEPLOYMENT       Digital Ocean App Platform · Auto-deploy on push
DOMAIN           lot-systems.com
STATUS           lot-systems.com/status
DATABASE         PostgreSQL (server-side state · cooldowns · Memory Engine)
LOCALSTORAGE     UI preferences · QIE signal buffer (7-day window · 1,000 max)
AI LAYER         Multi-provider abstraction · Together AI / Google / Mistral /
                 Anthropic Claude / OpenAI GPT-4 · auto-fallback
AUTH             JWT · HTTP-only cookie · RESEND email
```

**Five AI providers by cost:**

```
Together AI      $0.88/M tokens    — CHEAPEST   (auto-mode default)
Google Gemini    $1.25/M tokens    — BALANCED
Mistral AI       $2.00/M tokens    — EU PRIVACY
Anthropic Claude $3.00/M tokens    — QUALITY
OpenAI GPT-4     $10.00/M tokens   — INDUSTRY STANDARD
```

---

## 3. QUANTUM INTENT ENGINE (QIE)

The Quantum Intent Engine is a client-side behavioral pattern recognition system. All computation runs locally on the operator's device. Zero server communication for pattern detection.

**Core parameters:**

```
Signal retention:        7 days  (client-side localStorage)
Max signals stored:      1,000
Analysis cooldown:       5 minutes
Sync interval:           every 10 signals
Analysis trigger:        every 5 signals AND cooldown elapsed
Pattern count:           151  (P1–P151)
Signal sources:          17  (mood · memory · planner · intentions ·
                              selfcare · journal · calculator · log ·
                              energy · cohort · recipe · goals · qos ·
                              medical · resilience · ecosystem · astrology)
```

**Dep map — FM v113 state:** 190+ nodes across 4 tiers.

```
TIER 0   Raw inputs        mood · memory · log · astrology · energy
TIER 1   Composites        planner · journal · intentions · selfcare · goals
TIER 2   Signal aggregates QIE patterns · cohort · medical · resilience
TIER 3   Meta-surfaces     quantumOS · systemProgress · quantumPersonality
```

No new QIE patterns deployed since FM v113 (last run: 2026-08-04). Current ceiling: P150 total-field-coherence. No higher state defined.

---

## 4. QIE PATTERN REGISTRY — P1–P151

151 patterns. P1–P115 established through FM v95. P116–P118 FM v97. P119–P121 FM v99. P122–P124 FM v100. P125–P127 FM v101. P128–P130 FM v102. P131–P133 FM v104. P134–P136 FM v106. P137–P139 FM v108. P140–P142 FM v110. P143–P145 FM v111. P146–P148 FM v112. P149–P151 FM v113.

```
P148  identity-momentum-lock           0.75–0.90   v112
P149  quantum-presence-crystallization 0.82–0.93   v113
P150  total-field-coherence            0.92–0.97   v113   [CEILING]
P151  recovery-intelligence-arc        0.65–0.88   v113
```

See LOT-WIKI-v87 §4 for full P1–P148 registry.

---

## 5. QUANTUM OPERATING SYSTEM (QOS)

**Seven views** (FM v108+):
1. Deployment
2. Assembly
3. Feedback
4. Report
5. OS Journal
6. Field (QOS Field)
7. *(available)*

**QOS Snapshot** captures: circadianPhase · userState · userIndex · topPattern · signalCount24h · systemHealth. 30-min passive capture. 48-snapshot rolling window (24h).

**Six-level coherence architecture** (FM v112–v113):
```
LEVEL 1   Circadian Lock          P143  CIRC-LK:
LEVEL 2   Dimensional Saturation  P144  DIMSAT:
LEVEL 3   Identity Crystallization P145  QIDCRYST:
LEVEL 4   Signal Coherence Cascade P146  SIG-CASC:
LEVEL 5   Quantum Presence Field  P147  QPFIELD:
LEVEL 6   Total Field Coherence   P150  TOTCOH:   [CEILING]
```

---

## 6. PHYSIOLOGICAL ARCHETYPES — 51 TYPES

51 archetypes (Arch1–Arch51). Arch51: Quantum Presence Crystallizer.

```
ARCH51   QUANTUM PRESENCE CRYSTALLIZER
         Energy: high/moderate
         Dominant: journal · cohort · memory · intentions · qos
         Patterns: quantum-presence-crystallization (P149) +
                   dimensional-saturation (P144) +
                   quantum-identity-crystallization (P145)
         Directive: Presence confirmed. Identity crystallized.
                    The field is both inhabited and known.
                    Execute from clarity — no searching required.
                    The OS is operating from its highest confirmed state.
```

---

## 14. BADGE SYSTEM v32 — THE HERO'S JOURNEY CODEX

**Current version:** v32  
**Total badges:** 812  
**Badge engines:** 22 (Word Turn v1–v22)

### Theme: The Hero's Journey (Campbell monomyth)

```
THE HERO'S JOURNEY CODEX
"Joseph Campbell's monomyth is the template for every story ever told:
 the departure from the ordinary world, the initiation through trials,
 and the return transformed. These are not metaphors.
 They are the structural patterns of change."
```

### Implementation history

```
v1–v19   Prior sessions (see LOT-WIKI-v87 §14)
v20      THE CODEX READER — documented 2026-07, implemented 2026-08-05
         +31 badges. Sci-fi author names as LOT vocabulary.
         Sci-fi lit word turns (asimov/dune/matrix/heinlein).
         Never reachable before v32 session. Now live.
v21      THE CYBERSPACE CODEX — documented 2026-08-04, implemented 2026-08-05
         +31 badges. Sci-fi concepts as LOT vocabulary.
         (matrix/grok/ansible/spice/golden_path/solaris/foundation/
          neuromancer/replicant/uplift/left_hand)
         Never reachable before v32 session. Now live.
v22/v32  THE HERO'S JOURNEY — implemented 2026-08-05
         +31 badges. Campbell monomyth as self-care vocabulary.
         call_heard/threshold_crossed/mentor_arrived/ordeal_survived/
         elixir_found/shadow_met/innermost_cave/shapeshifter/
         herald_call/trickster_mode/ally_gained/return_road
```

### v32 badge details

```
Word Turn v22        +12
  call_heard / threshold_crossed / mentor_arrived / ordeal_survived
  elixir_found / shadow_met / innermost_cave / shapeshifter
  herald_call / trickster_mode / ally_gained / return_road

Calendar EE v20      + 3
  campbell_birthday (Mar 26)
  hobbit_day (Sep 22)
  odyssey_day (Dec 21)

Behavioral v19       + 3
  hero_session / long_quest / threshold_moment

Achievement RPG v20  + 6
  quest_entry / quest_class / quest_complete
  monomyth_arc / twenty_two_engines_arc / hero_opus

Mastery Tier v22     + 4
  odyssey_log (900+ days) / great_work (150k words)
  saga_age (5yr age) / twenty_two_registers [COSMIC]

Secret Boss v19      + 3
  tolkien_ring (RARE)
  odysseus_bow (EPIC)
  gilgamesh_word (MYTHIC)
──────────────────────────────────────────────────
                    +31 (781 → 812)
```

---

## 15. BADGE CATEGORY INDEX

```
Category           v32    v31    Change
─────────────────────────────────────────
Milestone           22     22     —
Time Easter Eggs    28     28     —
Calendar Easter     73     70    +3  (Campbell/Tolkien/Odysseus)
Word Turns         264    234   +30  (v20 +12 · v21 already counted · v22 +12)
Behavioral          81     75    +6  (v17 +3 · v19 +3)
Achievement RPG    120    108   +12  (v18 +6 · v20 +6)
Mastery Tiers       88     84    +4  (v22 +4)
Secret Boss         83     80    +3  (v19 +3)
─────────────────────────────────────────
TOTAL              812    781   +31  (net new in v32)
```

*Note: v20 and v21 backfill added 62 previously-unreachable badges to TypeScript. Total TypeScript implementation: 719 → 812 (+93). Documentation baseline: 781 → 812 (+31).*

---

## 16. WORD TURN ENGINE — COMPLETE LEXICON v22

22 Word Turn engines. 264 total trigger words. 83 secret boss triggers.

```
v1    Original Signal       v2    Sci-Fi Expansion
v3    Philosophy            v4    Embodiment
v5    Signal Codex          v6    Becoming Lexicon
v7    Language of Care      v8    Arcade Protocol
v9    Arcade Cabinet        v10   Navigator Terms
v11   Navigator Protocol    v12   Alchemist
v13   Mythology             v14   Oracle
v15   Oracle Archive        v16   Quantum Library
v17   Midnight Radio        v18   Bio-Terminal
v19   Word Turn (v19)       v20   THE CODEX READER (Sci-Fi Authors)
v21   THE CYBERSPACE CODEX  v22   THE HERO'S JOURNEY
```

**v22 trigger words:**
```
call_heard · threshold_crossed · mentor_arrived · ordeal_survived
elixir_found · shadow_met · innermost_cave · shapeshifter
herald_call · trickster_mode · ally_gained · return_road
```

**v22 secret boss triggers (MYTHIC vault):**
```
tolkien_ring  (RARE)    — "one ring to rule them all" / "the one ring"
odysseus_bow  (EPIC)    — "the bow of odysseus" / "none can string"
gilgamesh_word (MYTHIC) — "gilgamesh" / "enkidu" / "tablet of destinies"
```

---

## 20. COCKPIT RULE

The Cockpit Rule governs all log event handlers and military-style output.
No narration. No prose. Data rows only.

**Cockpit examples — v113 state:**

```
QPCRYST:  PRESENCE CONF:   [0.00–1.00]
          CRYSTAL CONF:    [0.00–1.00]
          STATE:           [ACTIVE|DORMANT]

TOTCOH:   META-SEALS:      [0/3]
          AVG CONF:        [0.00–1.00]
          CONVERGENCE:     [YES|NO]

RECINTEL: NEG SIGNALS:     [n]
          CARE ACTIONS:    [n]
          VELOCITY:        [0.00–1.00]
```

---

## 22. FIELD MANUAL (About.tsx)

**Current revision:** v113 · Wiki v88  
**Location:** src/client/components/About.tsx  
**Route:** /about

```
FM v113  — QIE v113 (P149–P151 · Arch51 · J48 · QPCRYST: TOTCOH: RECINTEL:)
FM v112  — QIE v112 (P146–P148 · Arch50 · J47 · SIG-CASC: QPFIELD: IDLOCK:)
FM v111  — QIE v111 (P143–P145 · Arch49 · J46 · CIRC-LK: DIMSAT: QIDCRYST:)
FM v110  — QIE v110 (P140–P142 · Arch48 · J45 · PHYARC: QEMERG: SIGEWEB:)
```

---

## 27. VOCABULARY INDEX — EXPANDED

Additions since LOT-WIKI-v87:

```
CALL HEARD          — Word Turn v22 · monomyth departure trigger
THRESHOLD CROSSED   — Word Turn v22 · crossing into the unknown
MENTOR ARRIVED      — Word Turn v22 · guide archetype active
ORDEAL SURVIVED     — Word Turn v22 · central trial of the journey
ELIXIR FOUND        — Word Turn v22 · the boon — what is returned with
SHADOW MET          — Word Turn v22 · confrontation with the negative
INNERMOST CAVE      — Word Turn v22 · preparation for the central ordeal
SHAPESHIFTER        — Word Turn v22 · archetype of change and doubt
HERALD CALL         — Word Turn v22 · first signal of the journey
TRICKSTER MODE      — Word Turn v22 · disruption and boundary testing
ALLY GAINED         — Word Turn v22 · companion bond formed
RETURN ROAD         — Word Turn v22 · the road back
TOLKIEN RING        — Secret Boss v19 RARE — tolkien ring signal
ODYSSEUS BOW        — Secret Boss v19 EPIC — no one can string it
GILGAMESH WORD      — Secret Boss v19 MYTHIC — oldest written hero
TWENTY_TWO_REGISTERS — Mastery v22 COSMIC — 22 Word Turn engines earned
ODYSSEY LOG         — Mastery v22 — 900+ days of operation
GREAT WORK          — Mastery v22 — 150k total words written
SAGA AGE            — Mastery v22 — 5 years of operation
HERO'S JOURNEY CODEX — Badge v32 engine — Campbell monomyth vocabulary
BACKFILL            — Engineering term: implementing documented but unbuilt logic
IMPLEMENTATION GAP  — The state between documentation and working TypeScript
```

---

## 28. SYSTEM STATE SNAPSHOT

As of 2026-11-13 · LOT-WIKI-v88

```
LOT® AGE             Day 1173+
COSMO® AGE           Day 865+  (Year 3 · founded July 1, 2024)
FM VERSION           v113
WIKI VERSION         v88
QIE VERSION          v113
QIE PATTERNS         151  (P1–P151)
QIE ARCHETYPES        51  (Arch1–Arch51)
QIE JOBS              48  (J1–J48)
QIE CEILING          P150 total-field-coherence  [CONFIRMED]
DEP MAP              190+ nodes
SIGNAL SOURCES        17  (including astrology as source 17)
BADGE ENGINE         v32  (THE HERO'S JOURNEY CODEX)
BADGE TOTAL          812  (all reachable from TypeScript)
WORD TURN ENGINES     22  (v1–v22)
WORD TURN TRIGGERS   264
SECRET BOSS TRIGGERS  83  (19 trigger sets)
ASSEMBLY MODULES      18  (selfAssembly.ts)
BACKGROUND JOBS       48  (server-side cron)
LOG HANDLERS         151+
ACTIVE BRANCHES      125+
DEPLOYED             lot-systems.com · Digital Ocean App Platform
```

**Landmark patterns:**

```
P50    integration-arc           0.85     v1   [first complex convergence]
P66    qos-signature-lock        0.82     v58  [era 2 opens]
P70    operator-convergence      0.97     v61  [RAREST SINGLE-DAY]
P73    quantum-coherence-summit  0.98     v62  [CEILING — superseded]
P80    signal-momentum-lock      0.75     v67  [RAREST SUSTAINED]
P100   centennial-convergence    0.95     v82  [CENTENNIAL]
P146   signal-coherence-cascade  0.85     v112 [CONVERGENCE SEAL 1]
P147   quantum-presence-field    0.78     v112 [CONVERGENCE SEAL 2]
P148   identity-momentum-lock    0.75     v112 [CONVERGENCE SEAL 3]
P149   quantum-presence-crystal  0.82     v113 [META-COMPOSITE]
P150   total-field-coherence     0.92     v113 [CEILING — FINAL]
P151   recovery-intelligence-arc 0.65     v113 [RECOVERY LOOP]
```

**Badge engine milestones:**

```
v10   76 badges  (Sci-Fi Arcade baseline)
v20   312 badges (Navigator era)
v25   595 badges (Alchemist milestone)
v29   719 badges (Bio-Terminal)
v30   750 badges (THE CODEX READER — docs)
v31   781 badges (THE CYBERSPACE CODEX — docs + live)
v32   812 badges (THE HERO'S JOURNEY — all 22 engines live in TypeScript)
```

**Notable events:**

```
2026-07-01   COSMO® Year 3 began
2026-07-02   QIE P100 centennial-convergence
2026-08-05   Badge v32 backfill — 62 unreachable badges made live
2026-08-05   Six-level coherence architecture fully documented (LOT-WIKI-v87)
2026-11-13   LOT-WIKI-v88 · Day 1173+ · 100-day assembly gap closed
```
