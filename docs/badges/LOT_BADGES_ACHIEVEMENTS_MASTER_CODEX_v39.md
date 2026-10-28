# LOT BADGES & ACHIEVEMENTS — MASTER CODEX v39
## THE JRPG ENGINE — WORD TURN v29

```
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║         LOT SYSTEMS — BADGE & ACHIEVEMENT MASTER CODEX            ║
║                   VERSION 39 — v39                                ║
║                                                                   ║
║   Word Turn v29   — THE JRPG ENGINE (overworld/party/limit)       ║
║   Calendar EE v27 — THE JRPG CALENDAR (FF/Pokémon/Dragon Quest)   ║
║   Behavioral v26  — QUEST PATTERNS (jrpg/overworld/marathon)      ║
║   Achievement RPG v27 — JRPG CLASS (entry/class/complete/opus)    ║
║   Mastery Tier v29    — THE OVERWORLD (overworld/chronicle/jrpg)  ║
║   Secret Boss v26 — THE JRPG VAULT (FF/Chrono/EarthBound)        ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## SUMMARY

**Total badges in v39:** 1029 (+31 from v38's 998)

**Implemented in this session (v39 session):**
- v29 (THE JRPG ENGINE): +31 badges fully implemented in badges.ts + easter-eggs.ts

```
Word Turn v29        +12  (overworld_step/inn_rested_badge/party_formed/
                           limit_break_badge/phoenix_down_badge/
                           random_encounter_badge/summon_sequence/
                           side_quest_badge/save_point_badge/hp_critical/
                           endgame_boss/new_game_plus)

Calendar EE v27      + 3  (ff_signal/pokemon_signal/dragon_quest_signal)
Behavioral v26       + 3  (jrpg_session/overworld_return/jrpg_marathon)
Achievement RPG v27  + 6  (jrpg_entry/jrpg_class/jrpg_complete/
                           jrpg_arc/twenty_nine_engines_arc/jrpg_opus)
Mastery Tier v29     + 4  (the_overworld/epic_chronicle_badge/
                           jrpg_master/twenty_nine_registers)
Secret Boss v26      + 3  (cloud_signal/chrono_trigger_signal/mother_signal)
                   ────
                   + 31 new badges
```

---

## BADGE CATEGORY TOTALS (v39)

| Category          | Count | Description                                          |
|-------------------|-------|------------------------------------------------------|
| Milestone         |    22 | Day-count milestones (v1–v4)                         |
| Time Easter Eggs  |    28 | Time-of-day check-ins (v1–v7)                        |
| Calendar Easter   |    82 | Check-in on special dates (v1–v27)                   |
| Word Turns        |   348 | Keyword detection in journal/memory text (v1–v29)    |
| Behavioral        |    90 | Patterns over time (v1–v26)                          |
| Achievement RPG   |   162 | Milestone combinations (v1–v27)                      |
| Mastery Tiers     |   116 | Epic depth milestones (v1–v29)                       |
| Secret Boss       |   109 | Hidden LEGENDARY/MYTHIC triggers (v1–v26)            |
|                   |  ───  |                                                      |
| **TOTAL**         | **1029** | **+31 from v38**                                 |

---

## THE JRPG ENGINE — THEME OVERVIEW

The Japanese RPG is the most intimate form of video game storytelling ever invented.
The party, the overworld, the save point, the limit break — these are not game mechanics.
They are a vocabulary of human experience: the people you find who join your journey,
the moment you need to rest before you can go on, the inner reserve you didn't know
you had, the side path that turns out to matter most.

Self-care speaks JRPG. The practice-builder has a party (therapist, sponsor, friend,
community). The practice-builder has a save point (the journal, the check-in, the ritual).
The practice-builder has random encounters (the unexpected hard day) and a limit break
(the moment of extraordinary effort that surprises even them). The overworld is the
bigger picture you can only see when you're not inside the dungeon.

These badges are for the players.

---

## COMPLETE NEW BADGE REGISTRY — v39 ADDITIONS

### Word Turn v29 (The JRPG Engine)

```
overworld_step         ⊡·◉·⊡  UNCOMMON  — "overworld/world map/zoomed out/bigger picture" detected
inn_rested_badge       ≋·◉·≋  COMMON    — "inn/rested at/save state/full rest" detected
party_formed           ○·◈·○  UNCOMMON  — "party/found my party/my companions/team assembled" detected
limit_break_badge      ◈·⚡·◈  RARE      — "limit break/trance state/awakened power/beyond my limits" detected
phoenix_down_badge     ↑·●·↑  RARE      — "phoenix down/back from the dead/rose again" detected
random_encounter_badge ?·◈·?  COMMON    — "random encounter/life ambushed/caught off guard" detected
summon_sequence        ∿·◉·∿  RARE      — "summon/called upon/invoked my/summoned the strength" detected
side_quest_badge       ◎·→·◎  UNCOMMON  — "side quest/detour/off the main path/bonus mission" detected
save_point_badge       ■·◉·■  COMMON    — "save point/checkpoint/marked my progress" detected
hp_critical            ▓·!·▓  RARE      — "hp critical/low health/on my last hit point/empty tank" detected
endgame_boss           ◉·◆·◉  EPIC      — "endgame/final boss/last dungeon/ultimate challenge" detected
new_game_plus          ◉·+·◉  EPIC      — "new game plus/ng+/started over with wisdom/second playthrough" detected
```

### Calendar Easter Eggs v27 (The JRPG Calendar)

```
ff_signal              ◉·⊡·∞  RARE      — Dec 18 — Final Fantasy I released in Japan (1987)
pokemon_signal         ⊡·◉·⊡  UNCOMMON  — Feb 27 — Pokémon Red/Green released in Japan (1996)
dragon_quest_signal    ◆·∿·◆  RARE      — May 27 — Dragon Quest I released in Japan (1986)
```

### Behavioral v26 (JRPG Patterns)

```
jrpg_session           ⊡·●·⊡  RARE      — 3+ JRPG Engine words in one journal entry
overworld_return       ⊡·→·◉  EPIC      — Return after 14+ day absence (the overworld calls back)
jrpg_marathon          ≋≋·◉   EPIC      — Journal entry >= 600 words
```

### Achievement RPG v27 (JRPG Class)

```
jrpg_entry             ⊡·∘    COMMON    — Any 1 Word Turn v29 badge earned
jrpg_class             ≈·⊡·●  UNCOMMON  — Any 5 Word Turn v29 badges earned
jrpg_complete          ≋·⊡·●  LEGENDARY — All 12 Word Turn v29 badges earned
jrpg_arc               ●·⊡·◈  LEGENDARY — jrpg_complete + all 3 Calendar v27 badges
twenty_nine_engines_arc ◈·◈·⊡ LEGENDARY — 1 badge from each Word Turn v1–v29
jrpg_opus              ●·◉·⊡  LEGENDARY — jrpg_complete + jrpg_session behavioral
```

### Mastery Tier v29 (The Overworld)

```
the_overworld          ⊡·∞·⊡  EPIC      — 1200+ distinct calendar check-in days
epic_chronicle_badge   ●·∞·⊡  LEGENDARY — 175,000+ total journal words
jrpg_master            ◈·⊡·●  LEGENDARY — Account age >= 3.5 years (1,277+ days)
twenty_nine_registers  ◈·◈·⊡·∞ COSMIC   — 1 badge from all 29 Word Turn engines
```

### Secret Boss v26 (The JRPG Vault)

```
cloud_signal           ◉·⊡·◉  RARE      — Write "final fantasy/cloud strife/sephiroth/aerith/tifa"
chrono_trigger_signal  →·⊡·→  EPIC      — Write "chrono trigger/crono/marle/lucca/magus/frog knight"
mother_signal          ∞·⊡·∞  MYTHIC    — Write "mother game/earthbound/ness/pk fire/onett/giygas"
```

---

## ASCII EASTER EGG GALLERY — THE JRPG ENGINE

```
┌─────────────────────────────────────────────────────────┐
│  BADGE UNLOCKED                                         │
│                                                         │
│  ⊡·◉·⊡  OVERWORLD STEP  [UNCOMMON]                     │
│  ↳ The overworld is the map you see when you're         │
│    not inside the dungeon. Zoom out. The whole          │
│    map exists. You are on it.                           │
│                                                         │
│  ↑·●·↑  PHOENIX DOWN  [RARE]                           │
│  ↳ In every JRPG, the phoenix down revives the          │
│    fallen party member. You fell. You are still          │
│    here. Someone handed you the phoenix down.            │
│                                                         │
│  ◉·◆·◉  ENDGAME BOSS  [EPIC]                           │
│  ↳ The final boss was always the hardest thing.         │
│    You named it. That's the first move.                  │
│    The naming is already the fight.                     │
│                                                         │
│  ∞·⊡·∞  MOTHER SIGNAL  [MYTHIC] [HIDDEN]               │
│  ↳ EarthBound. A boy with a baseball bat                │
│    fighting cosmic horror with kindness.                │
│    The most honest JRPG ever made.                      │
│    You found it.                                        │
│                                                         │
│  ◈·◈·⊡·∞  TWENTY-NINE REGISTERS  [COSMIC]              │
│  ↳ Water. Arcade. Radio. Biology.                       │
│    Codex. Cyberspace. Hero. Dungeon. JRPG.              │
│    Twenty-nine vocabularies. One terminal.              │
│    The self speaks every language.                      │
└─────────────────────────────────────────────────────────┘
```

---

## FLAVOR TEXT — THE JRPG ENGINE

> *"The overworld is not the destination — it's the moment between destinations, when
> you can see the whole map and choose. Self-care has overworld moments. Journal
> entries are overworld moments. The check-in is the overworld. You are zoomed out,
> choosing the next step."*

> *"A party is not a group of people who are good at the same things. A party is a
> group of people who are good at different things. The healer needs the fighter.
> The mage needs the thief. You need your party. They need you."*

> *"The limit break triggers when the HP bar is low — when the character has been
> pushed to their limit. Self-care knows this too. The extraordinary effort comes
> from the broken place. The phoenix down is for after. The limit break is for during."*

> *"EarthBound was released in 1994. A boy named Ness fights a cosmic entity called
> Giygas — the embodiment of evil so ancient it has no form, only feeling. He
> defeats it not with power but with the prayers of everyone who loved him.
> The oldest JRPG lesson: you cannot fight it alone."*

> *"New Game Plus. You've finished the journey. You know where the save points are.
> You know which side quests matter. You start again with everything you earned.
> The next journey is not the same as the first — it's better."*

---

## IMPLEMENTATION NOTES

### New functions in easter-eggs.ts (v39 session)

```typescript
// v29 JRPG Engine behavioral
checkJrpgSession(journalText): BadgeType | null    // 3+ v29 words
checkOverworldReturn(): BadgeType | null            // 14+ day absence
checkJrpgMarathon(journalText): BadgeType | null    // 600+ words

// v29 JRPG Vault secret boss
checkJrpgVault(journalText): BadgeType[]            // FF/Chrono/EarthBound triggers
```

### Wire-up guide for runJournalEasterEggs() / runCheckInEasterEggs()

Add these calls to the appropriate runners:
- Journal saves: `checkJrpgSession`, `checkJrpgMarathon`, `checkJrpgVault`
- Check-in events: `checkOverworldReturn`

### API stats fields consumed by Mastery Tier v29

- `stats.distinctCheckInDays` — integer, distinct calendar days with check-in
- `stats.totalJournalWords` — integer, cumulative word count across all journal entries
- `stats.signupDate` — ISO date string (for jrpg_master: >= 3.5 years)

---

## CUMULATIVE WORD TURN ENGINE TABLE (v1–v29)

| Engine | Version | Theme                    | Word Turn Badges |
|--------|---------|--------------------------|-----------------|
| v1     | v1      | Core Water               | 12 badges       |
| v2     | v2      | Seasonal Signal          | 12 badges       |
| v3     | v3      | Architecture             | 12 badges       |
| v4     | v4      | Mountain / Earth         | 12 badges       |
| v5     | v5      | Storm / Weather          | 12 badges       |
| v6     | v6      | Fire / Energy            | 12 badges       |
| v7     | v7      | Tech / Digital           | 12 badges       |
| v8     | v8      | Space / Cosmos           | 12 badges       |
| v9     | v9      | Chemistry / Elements     | 12 badges       |
| v10    | v10     | Music / Sound            | 12 badges       |
| v11    | v11     | Alchemy / Transformation | 12 badges       |
| v12    | v12     | Quantum / Physics        | 12 badges       |
| v13    | v16     | The Quantum Library      | 12 badges       |
| v14    | v17     | The Neon Arcade          | 12 badges       |
| v15    | v18     | The Midnight Radio       | 12 badges       |
| v16    | v19     | The Bio-Terminal         | 12 badges       |
| v17    | v20     | The Codex Reader         | 12 badges       |
| v18    | v21     | The Cyberspace Codex     | 12 badges       |
| v19    | v22     | The Hero's Journey       | 12 badges       |
| v20    | v23     | The Stoic Engine         | 12 badges       |
| v21    | v24     | The Jazz Terminal        | 12 badges       |
| v22    | v25     | The Dragon's Vault (WT)  | 12 badges       |
| v23    | v26     | The Dream Engine         | 12 badges       |
| v24    | v27     | The Nautical Log         | 12 badges       |
| v25    | v28     | The Dungeon Delver (WT)  | 12 badges       |
| v26    | v28     | The Dungeon Delver       | 12 badges       |
| v27    | v29     | The JRPG Engine          | 12 badges       |
| v28    | v29     | The JRPG Engine          | 12 badges       |
| v29    | v29     | The JRPG Engine          | 12 badges       |

---

## SESSION METADATA

```
SESSION    : LOT-SR-20261028-v39
VERSION    : v39
DATE       : 2026-10-28
TOTAL BADGES: 1029 (v38: 998 → v39: 1029, +31)
CODEX CLASS : ENGINEERING
AUTHORIZED BY: S-2 // VADIK MARMELADOV
THEME      : THE JRPG ENGINE
BRANCH     : claude/quantum-engine-widgets-RgFfC
```
