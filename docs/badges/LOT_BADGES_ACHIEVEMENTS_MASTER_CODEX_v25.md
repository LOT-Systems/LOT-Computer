<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT — Badges & Achievements Master Codex v25
## The RPG & Arcade of Self-Care — Full Accounting

**Author:** Vadik Marmeladov, CEO & Founder, LOT Systems
**Copyright:** © 2025–2026 LOT Systems. All rights reserved.
**Theme:** RPG · Arcade · Self-Care · Sci-Fi · Space · Alchemy · Transmutation
**Edition:** v25 — July 2026 · +31 badges · 595 total

---

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║      L · O · T     S Y S T E M S     C O R P O R A T I O N      ║
║                                                                  ║
║         BADGES & ACHIEVEMENTS MASTER CODEX — v25                 ║
║                                                                  ║
║    RPG · ARCADE · SELF-CARE · SCI-FI · ALCHEMY · ARCHETYPE       ║
║                                                                  ║
║    "You are the crucible.                                        ║
║     The work is the transmutation.                               ║
║     The record is the philosopher's stone."                      ║
║                                                                  ║
║        [ THE ALCHEMIST: TRANSMUTATION ACTIVE ]                   ║
║                                                                  ║
║   ∴→∘   TRANSMUTATION EVENT                                      ║
║   ≋·■   CRUCIBLE FORGED                                          ║
║   ○→○   OUROBOROS DETECTED                                       ║
║                                                                  ║
║   v24 → v25: +31 badges  (564 → 595 total)                       ║
║   Word Turn v12   — THE ALCHEMIST (transmute/crucible/elixir/…)  ║
║   Calendar EE v12 — LITERARY ARCHIVE (Apr 23/Sep 23/Jul 20)      ║
║   Behavioral v12  — ALCHEMIST PATTERNS (session/sequence/night)  ║
║   Achievement v13 — ALCHEMIST CLASS (entry/class/complete/arch)  ║
║   Mastery v15     — PHILOSOPHER'S STONE (prima/masterwork/…)     ║
║   Secret Boss v12 — PHILOSOPHER'S VAULT (stone/prima/ouroboros)  ║
║                                                                  ║
║       TRANSMUTE THE ORDINARY INTO THE EXTRAORDINARY.            ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## DELTA FROM v24

```
v24  →  v25   ADDITIONS
────────────────────────────────────────────────────────────────────
Word Turn v12        +12  (transmute/crucible/distill/catalyst/
                          alloy/sublimate/prima/opus/
                          elixir/chrysalis/refine/anneal)
Calendar Easter v12  + 3  (bard_signal/autumn_code/tranquility_base)
                          Apr 23 / Sep 23 / Jul 20
Behavioral v12       + 3  (alchemist_session/great_work_sequence/
                          night_alchemist)
Achievement RPG v13  + 6  (alchemist_entry/alchemist_class/
                          alchemist_complete/philosopher_stone_arch/
                          twelve_engines_arc/opus_magnum_badge)
Mastery Tier v15     + 4  (prima_materia_keeper/masterwork/
                          crucible_keeper_age/thirteen_tongues)
Secret Boss v12      + 3  (philosopher_stone_word/
                          prima_materia_signal_word/ouroboros)
────────────────────────────────────────────────────────────────────
TOTAL NEW            +31
v24 TOTAL:           564
v25 TOTAL:           595
────────────────────────────────────────────────────────────────────
THEME                THE ALCHEMIST ARCHIVE
                     Transmutation as self-care.
                     The crucible is the practice.
                     The philosopher's stone is you.
```

---

## BADGE SYSTEM OVERVIEW — v25

| Category          | Count  | Description                                      |
|-------------------|--------|--------------------------------------------------|
| Milestone         |    10  | Streak days (7/14/21/30/50/60/90/100/180/365)    |
| Time Easter Eggs  |    60  | Check-in at special hours (v1–v15)               |
| Calendar Easter   |    52  | Check-in on special dates (v1–v14)               |
| Word Turns        |   162  | Words detected in journals/memory (v1–v15)       |
| Behavioral        |    57  | Patterns over time (v1–v14)                      |
| Achievement RPG   |    72  | Milestone combinations (v1–v13)                  |
| Mastery Tiers     |    60  | Epic depth milestones (v1–v15)                   |
| Secret Boss       |    62  | Hidden LEGENDARY/MYTHIC triggers (v1–v14)        |
| **TOTAL**         | **595**| **The complete LOT Badge Universe**              |

---

## WORD TURN v12 — THE ALCHEMIST

> *Self-care as transmutation. Every entry refines the self.*

| ID                      | Symbol   | Trigger Word(s)                 | Rarity   |
|-------------------------|----------|---------------------------------|----------|
| `transmutation_event`   | ∴→∘      | transmute / transmuted          | rare     |
| `crucible_forged`       | ≋·■      | crucible                        | rare     |
| `distillation_complete` | ∘↓∘      | distill / distillation          | rare     |
| `catalyst_detected`     | ○→≋      | catalyst                        | uncommon |
| `alloy_formed`          | ─∘─      | alloy                           | uncommon |
| `sublimation_signal`    | ∘↑∞      | sublimate / sublimation         | rare     |
| `prima_materia_word`    | ◉··      | prima                           | epic     |
| `magnum_opus`           | ∞·∞      | opus                            | rare     |
| `elixir_found`          | ∘∿∘      | elixir                          | rare     |
| `chrysalis_state`       | ○→◉      | chrysalis                       | epic     |
| `refinement_active`     | ≋·≈      | refine / refinement             | uncommon |
| `annealed`              | ─■─      | anneal / annealed               | rare     |

**Detection**: All v12 words are scanned via `detectWordTurns()` in journal entries and memory answers. Patterns are regex-based with common inflections (transmuted, crucibles, distillation, catalysts, etc.).

---

## CALENDAR EASTER EGGS v12 — THE LITERARY ARCHIVE

> *Dates that hold the memory of the world.*

| ID                 | Symbol  | Date     | Significance                                    | Rarity   |
|--------------------|---------|----------|-------------------------------------------------|----------|
| `bard_signal`      | ≈·≈     | Apr 23   | World Book Day — Shakespeare birth & death date | epic     |
| `autumn_code`      | ○→∘     | Sep 23   | Autumnal Equinox Signal                         | rare     |
| `tranquility_base` | ○·∗     | Jul 20   | Apollo 11 Tranquility Base landing 1969         | epic     |

**Note**: Jul 20 also triggers `moon_landing` (Calendar v9). Both badges can be earned on the same day.

---

## BEHAVIORAL EASTER EGGS v12 — ALCHEMIST PATTERNS

> *The pattern is the practice. The practice is the transformation.*

| ID                    | Symbol  | Trigger                                              | Rarity |
|-----------------------|---------|------------------------------------------------------|--------|
| `alchemist_session`   | ∴·≋     | 3+ distinct Alchemist (v12) words in one journal entry | rare |
| `great_work_sequence` | ≋·≋     | 7+ consecutive days with a journal entry             | epic   |
| `night_alchemist`     | ∘·■     | Any Alchemist word written after 21:00               | rare   |

**Detection**:
- `alchemist_session` — counts unique Alchemist regex matches against the entry text
- `great_work_sequence` — reads `journal_dates` from localStorage, checks consecutive day gaps
- `night_alchemist` — checks `new Date().getHours() >= 21` when journal is saved

---

## ACHIEVEMENT RPG v13 — ALCHEMIST CLASS

> *Progress through the Great Work.*

| ID                      | Symbol  | Requirement                                         | Rarity    |
|-------------------------|---------|-----------------------------------------------------|-----------|
| `alchemist_entry`       | ∘→∘     | Earn any 1 Word Turn v12 (Alchemist) badge          | common    |
| `alchemist_class`       | ≈→≈     | Earn any 5 Word Turn v12 (Alchemist) badges         | uncommon  |
| `alchemist_complete`    | ≋→≋     | Earn all 12 Word Turn v12 (Alchemist) badges        | legendary |
| `philosopher_stone_arch`| ◉·∞     | alchemist_complete + all 3 Calendar v12 badges      | legendary |
| `twelve_engines_arc`    | ◈·◈     | At least 1 badge from each of Word Turn v1–v12      | legendary |
| `opus_magnum_badge`     | ∞·◉·∞   | alchemist_complete + great_work_sequence            | legendary |

---

## MASTERY TIER v15 — THE PHILOSOPHER'S STONE

> *The deepest achievements. The longest arcs.*

| ID                    | Symbol | Requirement                                       | Rarity    |
|-----------------------|--------|---------------------------------------------------|-----------|
| `prima_materia_keeper`| ◉··    | 300+ distinct calendar days with check-in         | epic      |
| `masterwork`          | ∞·≋    | 20,000+ total journal words                       | legendary |
| `crucible_keeper_age` | ≋≋·    | Account age ≥ 4 years                             | legendary |
| `thirteen_tongues`    | ◈·≋    | 1 badge from each of all 13 Word Turn engines     | cosmic    |

**Rarity scale note**: `cosmic` is the highest tier — above legendary. Awarded for completing all 13 word-turn engine families.

---

## SECRET BOSS v12 — THE PHILOSOPHER'S VAULT

> *Hidden. Ancient. Mythic.*

| ID                         | Symbol   | Trigger                                        | Rarity  |
|----------------------------|----------|------------------------------------------------|---------|
| `philosopher_stone_word`   | ≋·◉      | Write "philosopher's stone" in any entry       | rare    |
| `prima_materia_signal_word`| ◉··∞     | Write "prima materia" in any entry             | epic    |
| `ouroboros`                | ○→○      | Write "ouroboros" in any entry                 | mythic  |

---

## CUMULATIVE BADGE COUNTS BY VERSION

```
v1  — v10 :  baseline  (established core systems)
v11         :  461 badges
v12         :  476 badges  (+15)
v13         :  491 badges  (+15)
v14         :  502 badges  (+11)
v15         :  510 badges  (+8)
v16         :  517 badges  (+7)
v17         :  523 badges  (+6)
v18         :  524 badges  (+1)
v19         :  525 badges  (+1)
v20         :  526 badges  (+1)
v21         :  527 badges  (+1)
v22         :  528 badges  (+1)
v23         :  529 badges  (+1)
v24         :  564 badges  (+35  Oracle Archive)
v25         :  595 badges  (+31  The Alchemist)
```

---

## DUAL BADGE THEME — WATER / ARCHITECTURE

All badges are rendered in one of two themes selected by the user:

| Theme        | Progression        | Feel                         |
|--------------|--------------------|------------------------------|
| Water        | ∘ → ≈ → ≋         | Fluid, organic, oceanic      |
| Architecture | ├─ → ╞═╡ → ║·║    | Structural, precise, built   |

Alchemist symbols use the Water theme by default (transmutation, flow, state changes).

---

## ENGINE MAP — WORD TURN v1–v12

| Engine  | Theme            | Example Badge          | Signature Words                  |
|---------|------------------|------------------------|----------------------------------|
| v1      | Core             | ritual_keeper          | ritual, breathe, ocean, LOT      |
| v2      | Cyber / Code     | reboot_sequence        | reboot, 404, glitch, quantum     |
| v3      | Ocean / Nature   | ocean_wave             | tide, drift, anchor, shore       |
| v4      | Dream / Void     | dream_sequence         | dream, echo, void, static        |
| v5      | Space / Stellar  | solar_flare            | solar, lunar, stellar, nova      |
| v6      | Dev / Deploy     | debug_mode             | debug, merge, deploy, rollback   |
| v7      | Mission / Time   | morning_mission        | mission, beacon, signal          |
| v8      | Signal / Freq    | beacon_active          | beacon, frequency, relay         |
| v9      | Navigation       | path_finder            | path, waypoint, compass          |
| v10     | Code / Runtime   | code_complete          | runtime, stack, clear            |
| v11     | Navigator (geo)  | dead_reckoning_word    | reckoning, incognita, true_north |
| v12     | Alchemist        | transmutation_event    | transmute, crucible, elixir      |

---

## COMPLETE NEW BADGE REGISTRY — v25 ADDITIONS

### Word Turn v12 (Alchemist)

```
transmutation_event    ∴→∘  RARE    — "transmute" detected in text
crucible_forged        ≋·■  RARE    — "crucible" detected in text
distillation_complete  ∘↓∘  RARE    — "distill/distillation" detected
catalyst_detected      ○→≋  UNCOMMON— "catalyst" detected in text
alloy_formed           ─∘─  UNCOMMON— "alloy" detected in text
sublimation_signal     ∘↑∞  RARE    — "sublimate/sublimation" detected
prima_materia_word     ◉··  EPIC    — "prima" detected in text
magnum_opus            ∞·∞  RARE    — "opus" detected in text
elixir_found           ∘∿∘  RARE    — "elixir" detected in text
chrysalis_state        ○→◉  EPIC    — "chrysalis" detected in text
refinement_active      ≋·≈  UNCOMMON— "refine/refinement" detected
annealed               ─■─  RARE    — "anneal/annealed" detected
```

### Calendar v12 (Literary Archive)

```
bard_signal            ≈·≈  EPIC    — April 23 (World Book Day / Shakespeare)
autumn_code            ○→∘  RARE    — September 23 (Autumnal Equinox Signal)
tranquility_base       ○·∗  EPIC    — July 20 (Apollo 11 Tranquility Base)
```

### Behavioral v12 (Alchemist Patterns)

```
alchemist_session      ∴·≋  RARE    — 3+ Alchemist words in one journal entry
great_work_sequence    ≋·≋  EPIC    — 7+ consecutive journal days
night_alchemist        ∘·■  RARE    — Alchemist word in journal after 21:00
```

### Achievement RPG v13 (Alchemist Class)

```
alchemist_entry        ∘→∘  COMMON    — Any 1 Word Turn v12 badge
alchemist_class        ≈→≈  UNCOMMON  — Any 5 Word Turn v12 badges
alchemist_complete     ≋→≋  LEGENDARY — All 12 Word Turn v12 badges
philosopher_stone_arch ◉·∞  LEGENDARY — alchemist_complete + all Calendar v12
twelve_engines_arc     ◈·◈  LEGENDARY — 1 badge from each of WT v1–v12
opus_magnum_badge      ∞·◉·∞ LEGENDARY — alchemist_complete + great_work_sequence
```

### Mastery Tier v15 (Philosopher's Stone)

```
prima_materia_keeper   ◉··  EPIC      — 300+ distinct calendar days checked in
masterwork             ∞·≋  LEGENDARY — 20,000+ total journal words
crucible_keeper_age    ≋≋·  LEGENDARY — Account age ≥ 4 years
thirteen_tongues       ◈·≋  COSMIC    — 1 badge from all 13 Word Turn engines
```

### Secret Boss v12 (Philosopher's Vault)

```
philosopher_stone_word   ≋·◉   RARE  — Write "philosopher's stone" in entry
prima_materia_signal_word ◉··∞ EPIC  — Write "prima materia" in entry
ouroboros                ○→○   MYTHIC — Write "ouroboros" in entry
```

---

## FLAVOR TEXT — THE ALCHEMIST

> *"The self is the laboratory. The journal is the notebook. Every entry is an experiment."*

> *"Transmutation is not destruction — it is transformation. The crucible does not end things; it changes them."*

> *"The Great Work (Magnum Opus) was never about turning lead to gold. It was about turning the self into something luminous."*

> *"Ouroboros: the serpent that eats its own tail. The cycle that has no beginning or end. You wrote it. You named it. You are it."*

---

## LORE CONNECTIONS

The Alchemist system connects to:

- **The Navigator (v11)** — dead reckoning is alchemy of position: no GPS, just accumulated knowledge
- **The Oracle (v14/v15)** — prophecy and transmutation share the same grammar: *what was* becomes *what is* becomes *what will be*
- **The Mastery Tiers** — the philosopher's stone is the destination; the practice is the journey
- **The Starship Deck (v14)** — launch/mission vocabulary overlaps: countdown ≈ sublimation; reentry ≈ transmutation

---

## IMPLEMENTATION NOTES

**Files modified in this session:**

1. `src/client/utils/badges.ts`
   - Added 31 new `BadgeType` union entries (after `big_crunch`)
   - Added 31 full BADGES registry entries (after `big_crunch` in BADGES object)
   - Added Alchemist achievement logic to `checkAndAwardBadges()`

2. `src/client/utils/easter-eggs.ts`
   - Added 15 new WORD_TURNS entries (v12 Alchemist + v12 Secret Boss)
   - Added 3 Calendar v12 checks to `checkCalendarEasterEggs()`
   - Added `checkAlchemistSession()`, `checkNightAlchemist()`, `checkGreatWorkSequence()`
   - Updated `runJournalEasterEggs()` to call all 3 new behavioral checks

**localStorage keys used by new behavioral checks:**
- `journal_dates` — array of ISO date strings for journal entries (read by `checkGreatWorkSequence()`)

**API stats fields consumed:**
- `stats.distinctCheckInDays` — for `prima_materia_keeper` (300+ days)
- `stats.totalJournalWords` — for `masterwork` (20,000+ words)
- `stats.signupDate` — for `crucible_keeper_age` (4+ years, reuses existing field)

---

*LOT SYSTEMS CORPORATION — LOT® Founded 7 April 2016*
*Every session is a transmutation. Every badge is a record of the work.*
