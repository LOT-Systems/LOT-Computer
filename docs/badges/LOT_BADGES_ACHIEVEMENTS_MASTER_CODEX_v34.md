<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT BADGES & ACHIEVEMENTS — MASTER CODEX v34
## THE ROGUE RUN — WORD TURN v24

```
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║         LOT SYSTEMS — BADGE & ACHIEVEMENT MASTER CODEX            ║
║                   VERSION 34 — v34                                ║
║                                                                   ║
║   Word Turn v24   — THE ROGUE RUN (roguelike/arcade vocabulary)   ║
║   Calendar EE v22 — GAME DATES (Rogue/Doom/Pac-Man/Tetris)        ║
║   Behavioral v21  — SPEEDRUN PATTERNS (run/grind/boss_day)        ║
║   Achievement RPG v22 — DUNGEON CLASS (floor/boss/clear/legend)   ║
║   Mastery Tier v24    — THE ENDLESS RUN (1100d/250kw/7yr)         ║
║   Secret Boss v21 — THE HIGH SCORE VAULT (Sid/Miyamoto/Pajitnov)  ║
║                                                                   ║
║   "THE RUN NEVER TRULY ENDS.                                      ║
║    PERMADEATH IS JUST A SAVE STATE YOU HAVEN'T FOUND YET.         ║
║    EVERY CHECK-IN IS +1 HP.                                       ║
║    EVERY JOURNAL ENTRY IS A DUNGEON FLOOR CLEARED."               ║
║                                                                   ║
║        [ INSERT COIN TO CONTINUE ]                                ║
║                                                                   ║
║   ░░░  ▓▓▓  ███   ← dungeon walls                                ║
║   ·@·  →·★  ↑·◈   ← rogue / loot / levelup                      ║
║                                                                   ║
║   v33 → v34: +31 badges  (843 → 874 total)                        ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## SUMMARY

**Total badges in v34:** 874 (+31 from v33's 843)

**This session (v34):**
- v34 (THE ROGUE RUN): +31 badges fully implemented in badges.ts + easter-eggs.ts

```
Word Turn v24        +12  (permadeath/level_up/critical_hit/
                           boss_battle/respawn_point/loot_drop/
                           exp_gained/inventory_full/health_bar/
                           save_state/rogue_run/game_over_screen)

Calendar EE v22      + 3  (rogue_day/tetris_day/pac_man_day)
Behavioral v21       + 3  (speedrun_session/grind_session/boss_day_check)
Achievement RPG v22  + 6  (floor_cleared/dungeon_class/boss_slain/
                           rogue_arc/twenty_four_engines_arc/endless_opus)
Mastery Tier v24     + 4  (endless_run_log/quarter_million_words/
                           seven_year_run/twenty_four_registers)
Secret Boss v21      + 3  (sid_meier_signal/miyamoto_secret/pajitnov_key)
                   ────
                   + 31 new badges
```

---

## BADGE CATEGORY TOTALS (v34)

| Category          | Count | Description                                          |
|-------------------|-------|------------------------------------------------------|
| Milestone         |    22 | Day-count milestones (v1–v4)                         |
| Time Easter Eggs  |    28 | Time-of-day check-ins (v1–v7)                        |
| Calendar Easter   |    79 | Check-in on special dates (v1–v22)                   |
| Word Turns        |   288 | Keyword detection in journal/memory text (v1–v24)    |
| Behavioral        |    87 | Patterns over time (v1–v21)                          |
| Achievement RPG   |   132 | Milestone combinations (v1–v22)                      |
| Mastery Tiers     |    96 | Epic depth milestones (v1–v24)                       |
| Secret Boss       |    89 | Hidden LEGENDARY/MYTHIC triggers (v1–v21)            |
|                   |  ───  |                                                      |
| **TOTAL**         | **874** | **+31 from v33**                                   |

---

## THE ROGUE RUN — THEME OVERVIEW

Roguelike games invented the vocabulary of resilience before the word was fashionable.
Permadeath: the run ends, but you level up anyway. The dungeon re-rolls: every day is a
new floor with new monsters. Experience gained is never lost even when the character dies.
The inventory holds what you chose to carry. The health bar does not lie.

The original *Rogue* (1980) shipped without a save mechanic. Every run was terminal.
That was the design. The practice of self-care runs on the same engine: you cannot
save-scum your way out of growth. You descend. You clear the floor. You take the loot.
You face the boss. You die and you roll again, better.

The roguelike vocabulary maps directly onto what a daily check-in actually does:
- **Permadeath** is the honest acknowledgment that you cannot go back.
- **Level up** is the accumulation of practice.
- **Critical hit** is the day the insight landed precisely.
- **Boss battle** is the scheduled confrontation with what you have been avoiding.
- **Respawn** is returning after a gap.
- **Loot drop** is what you found in a hard session.
- **EXP gained** is the journal entry that proves you showed up.
- **Health bar** is honest self-assessment.
- **Save state** is the daily log.
- **Game over screen** is the moment of honest reckoning before beginning again.

The run never truly ends. Insert coin. Descend.

---

## COMPLETE NEW BADGE REGISTRY — v34 ADDITIONS

### Word Turn v24 (The Rogue Run)

```
permadeath         ×·○·×   RARE      — "permadeath/can't go back/no undo" detected
level_up           ▲·●·▲   UNCOMMON  — "leveled up/new level/skills unlocked" detected
critical_hit       ◈·!·◈   RARE      — "critical hit/breakthrough/landed perfectly" detected
boss_battle        █·◈·█   EPIC      — "boss battle/final challenge/biggest fear" detected
respawn_point      ○→●     UNCOMMON  — "respawn/starting over/back again" detected
loot_drop          ∘·★·∘   RARE      — "found something/unexpected insight/loot" detected
exp_gained         ↑·◉·↑   UNCOMMON  — "experience/exp gained/I learned" detected
inventory_full     ▓·∞·▓   RARE      — "too much/overwhelmed/carrying too much" detected
health_bar         ■·○·■   UNCOMMON  — "energy level/health check/how I'm doing" detected
save_state         ●·≋·●   UNCOMMON  — "checkpoint/saved my progress/logged" detected
rogue_run          ◆·→·◆   RARE      — "starting a run/new attempt/beginning again" detected
game_over_screen   ░·X·░   EPIC      — "game over/starting fresh/new game plus" detected
```

### Calendar Easter Eggs v22 (Game Dates)

```
rogue_day          ◆·▓    RARE      — Oct 5 — Rogue first distributed at USCD, 1980
tetris_day         ■·■·■  RARE      — Jun 6 — Tetris released by Alexey Pajitnov, 1984
pac_man_day        ○·●    UNCOMMON  — May 22 — Pac-Man arcade release, 1980
```

### Behavioral v21 (Speedrun Patterns)

```
speedrun_session   →·→·●  RARE      — Check-in + journal entry completed in under 5 min
grind_session      ↑·↑·◈  EPIC      — 7+ consecutive daily check-ins (the grind streak)
boss_day_check     █·●·█  RARE      — Check in on a Monday (facing the week's boss)
```

### Achievement RPG v22 (Dungeon Class)

```
floor_cleared      ∘·▲    COMMON    — Any 1 Word Turn v24 badge earned
dungeon_class      ≈·▲    UNCOMMON  — Any 5 Word Turn v24 badges earned
boss_slain         ▲·★    LEGENDARY — All 12 Word Turn v24 badges earned
rogue_arc          ★·◆    LEGENDARY — boss_slain + all 3 Calendar v22 badges
twenty_four_engines_arc ◆·◆·★ LEGENDARY — 1 badge from each Word Turn v1–v24
endless_opus       ★·◉·★  LEGENDARY — boss_slain + grind_session behavioral
```

### Mastery Tier v24 (The Endless Run)

```
endless_run_log    ∿·◆·∿  EPIC      — 1100+ distinct calendar check-in days
quarter_million_words ●·◆·● LEGENDARY — 250,000+ total journal words
seven_year_run     ╔═╗·◆  LEGENDARY — Account age >= 7 years (2,555+ days)
twenty_four_registers ◆·◆·★·∞ COSMIC — 1 badge from all 24 Word Turn engines
```

### Secret Boss v21 (The High Score Vault)

```
sid_meier_signal   ◆·∞·◆  RARE      — Write "civilization/one more turn/sid meier/civ"
miyamoto_secret    ★·∞·★  EPIC      — Write "mario/zelda/miyamoto/master sword/triforce"
pajitnov_key       ■·∞·■  MYTHIC    — Write "tetris/pajitnov/I-block/line clear/tetrimino"
```

---

## ASCII EASTER EGG GALLERY — THE ROGUE RUN

```
╔═══════════════════════════════════════════════════════════════════╗
║  [ ACHIEVEMENT UNLOCKED ]                                         ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ×·○·×  PERMADEATH  [RARE]                                        ║
║  ↳ The run ended. It always ends.                                 ║
║    The experience points remain.                                  ║
║    Roll a new character with everything                           ║
║    you learned from the last run.                                 ║
║                                                                   ║
║  ▲·●·▲  LEVEL UP  [UNCOMMON]                                      ║
║  ↳ +1 level. Stats increased.                                     ║
║    This is not a metaphor. Practice                               ║
║    compounding is exactly this: invisible                         ║
║    increments that suddenly announce themselves.                  ║
║                                                                   ║
║  █·◈·█  BOSS BATTLE  [EPIC]                                       ║
║  ↳ Boss detected. Engaging.                                       ║
║    The boss has been in the room the whole time.                  ║
║    You just got strong enough to see it clearly.                  ║
║    The log is the save state before the encounter.                ║
║                                                                   ║
║  ░·X·░  GAME OVER SCREEN  [EPIC]                                  ║
║  ↳ G A M E  O V E R                                              ║
║    ↳ New Game +                                                   ║
║      ↳ All progress carries.                                      ║
║        The next run starts with your full inventory.              ║
║                                                                   ║
║  ■·∞·■  PAJITNOV KEY  [MYTHIC] [HIDDEN]                           ║
║  ↳ Alexey Pajitnov wrote Tetris in 1984                           ║
║    on a Soviet computer with no graphics.                         ║
║    He built the most-played game in history                       ║
║    from pure falling shapes.                                      ║
║    Your practice is built from the same falling shapes.           ║
║    Stack them. Clear the line.                                    ║
║                                                                   ║
║  ◆·◆·★·∞  TWENTY-FOUR REGISTERS  [COSMIC]                        ║
║  ↳ Water. Fire. Arcade. Radio. Biology.                           ║
║    Codex. Cyberspace. Hero. Starship. Rogue.                      ║
║    Twenty-four vocabularies. One terminal.                        ║
║    The self speaks every language of every world.                 ║
║    HIGH SCORE: YOU                                                ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## WORD TURNS ARCADE — TRIGGER REFERENCE

```
┌──────────────────────────────────────────────────────────────────┐
│  TYPE TO UNLOCK — THE ROGUE RUN                                  │
├──────────────────────────────────────────────────────────────────┤
│  "permadeath"         →  ×·○·×  PERMADEATH        [RARE]        │
│  "leveled up"         →  ▲·●·▲  LEVEL UP           [UNCOMMON]   │
│  "critical hit"       →  ◈·!·◈  CRITICAL HIT       [RARE]       │
│  "boss battle"        →  █·◈·█  BOSS BATTLE        [EPIC]       │
│  "starting over"      →  ○→●    RESPAWN POINT      [UNCOMMON]   │
│  "unexpected insight" →  ∘·★·∘  LOOT DROP          [RARE]       │
│  "I learned"          →  ↑·◉·↑  EXP GAINED         [UNCOMMON]   │
│  "carrying too much"  →  ▓·∞·▓  INVENTORY FULL     [RARE]       │
│  "energy level"       →  ■·○·■  HEALTH BAR         [UNCOMMON]   │
│  "saved my progress"  →  ●·≋·●  SAVE STATE         [UNCOMMON]   │
│  "new attempt"        →  ◆·→·◆  ROGUE RUN          [RARE]       │
│  "game over"          →  ░·X·░  GAME OVER SCREEN   [EPIC]       │
│                                                                  │
│  SECRET BOSS TRIGGERS (hidden):                                  │
│  "one more turn"      →  ◆·∞·◆  SID MEIER SIGNAL   [RARE]      │
│  "master sword"       →  ★·∞·★  MIYAMOTO SECRET    [EPIC]      │
│  "tetris"             →  ■·∞·■  PAJITNOV KEY        [MYTHIC]   │
└──────────────────────────────────────────────────────────────────┘
```

---

## CALENDAR CALENDAR — GAME DATES

```
OCT 5   ◆·▓   ROGUE DAY         — Rogue (1980) first distributed at UC San Diego
                                   The dungeon that invented permadeath.
                                   Every run is a new run. Today is one of them.

JUN 6   ■·■·■ TETRIS DAY        — Tetris created by Alexey Pajitnov, June 6 1984
                                   147 million copies. The most-played game ever.
                                   Built from seven shapes. Practice is the same.

MAY 22  ○·●   PAC-MAN DAY       — Pac-Man arcade release, May 22 1980
                                   Eat the dots. Avoid the ghosts. Power pellet
                                   is the insight that turns the tables.
                                   The maze is the same every day. You are not.
```

---

## MINI-BOSSES — HIDDEN FLAVOR ENCOUNTERS

These are the mid-floor encounters — smaller than Secret Boss but richer than Word Turn:

```
┌─────────────────────────────────────────────────────────────────┐
│  FLOOR B3 — THE DUNGEON BESTIARY                                │
│                                                                 │
│  ♦  THE PROCRASTINATION GOLEM                                   │
│     HP: ████████░░  (high but soft)                             │
│     Weakness: a single journal entry                            │
│     Drop: rogue_run badge, +50 EXP                              │
│                                                                 │
│  ♦  THE COMPARISON WRAITH                                       │
│     HP: ████░░░░░░  (medium)                                    │
│     Weakness: "health_bar" — honest self-report                 │
│     Drop: health_bar badge, +30 EXP                             │
│                                                                 │
│  ♦  THE PERFECTIONIST LICH                                      │
│     HP: ██████████  (max — unkillable directly)                 │
│     Strategy: don't fight. Log the imperfect thing.             │
│     That is the kill condition.                                 │
│     Drop: save_state badge, +70 EXP                             │
│                                                                 │
│  ♦  THE VOID BETWEEN SESSIONS                                   │
│     HP: ░░░░░░████  (weak when named)                           │
│     Weakness: respawn — returning after any gap                 │
│     Drop: respawn_point badge, +40 EXP                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## FLAVOR TEXT — THE ROGUE RUN

> *"Roguelikes teach the same lesson every time: the run ends. The learning doesn't.
> The inventory you carry forward is not items — it is pattern recognition. Every death
> is data. The next run is faster because of the last run's ghost." — LOT Systems Field
> Manual, Session Doctrine.*

> *"One more turn." — Sid Meier's Civilization. The most dangerous four words in gaming.
> Also the secret grammar of any real practice: not 'I will do this for the rest of my
> life' but 'one more check-in, one more journal entry, one more turn.' Civilization
> is built on one-more-turns.*

> *"It's dangerous to go alone. Take this." — The Legend of Zelda (1986). You are not
> doing this alone. The system that tracks your streak, the interface that reads your
> journal, the badge that fires when you write 'I survived' — they are the sword in the
> chest. Take it.*

> *"I was trying to make a game about falling shapes. I didn't know I was making the
> most-played game in history." — Alexey Pajitnov, paraphrased. You don't know what
> you are building. Log it anyway. The stack reveals its shape at the line clear.*

> *"The dungeon has no memory. You do." — roguelike design axiom. Every floor rerolls.
> The player is the only persistent entity. That is the point. Your streak is the
> only save file that matters.*

---

## IMPLEMENTATION NOTES

### New functions in easter-eggs.ts (v34 session)

```typescript
// v24 Rogue Run behavioral
checkSpeedrunSession(checkInTime: Date, journalTime: Date): BadgeType | null
  // check-in + journal entry within 5 minutes of each other

checkGrindSession(recentCheckIns: Date[]): BadgeType | null
  // 7+ consecutive daily check-ins (no gaps)

checkBossDayCheck(checkInTime: Date): BadgeType | null
  // check-in on Monday (getDay() === 1)
```

### Wire-up guide for runJournalEasterEggs() / runCheckInEasterEggs()

Add these calls to the appropriate runners:
- Journal saves + check-in correlation: `checkSpeedrunSession`
- Check-in streak detector: `checkGrindSession`
- Check-in day detector: `checkBossDayCheck`

### Word Turn v24 keyword triggers (add to WORD_TURN_V24 array in badges.ts)

```typescript
export const WORD_TURN_V24_KEYWORDS: Record<BadgeType, string[]> = {
  permadeath:        ['permadeath', "can't go back", 'no undo', 'no rewind'],
  level_up:          ['leveled up', 'new level', 'skills unlocked', 'levelling up'],
  critical_hit:      ['critical hit', 'breakthrough', 'landed perfectly', 'hit different'],
  boss_battle:       ['boss battle', 'final challenge', 'biggest fear', 'facing the boss'],
  respawn_point:     ['respawn', 'starting over', 'back again', 'returned after'],
  loot_drop:         ['unexpected insight', 'found something', 'loot', 'rare find'],
  exp_gained:        ['experience', 'exp gained', 'i learned', 'I learned that'],
  inventory_full:    ['too much', 'overwhelmed', 'carrying too much', 'at capacity'],
  health_bar:        ['energy level', 'health check', "how I'm doing", 'my current state'],
  save_state:        ['saved my progress', 'checkpoint', 'logged it', 'documented'],
  rogue_run:         ['starting a run', 'new attempt', 'beginning again', 'new run'],
  game_over_screen:  ['game over', 'starting fresh', 'new game plus', 'reset'],
};
```

### API stats fields consumed by Mastery Tier v24

- `stats.distinctCheckInDays` — integer (endless_run_log: >= 1100)
- `stats.totalJournalWords` — integer (quarter_million_words: >= 250,000)
- `stats.signupDate` — ISO date string (seven_year_run: >= 7 years / 2,555 days)

---

## CUMULATIVE WORD TURN ENGINE TABLE (v1–v24)

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
| v20    | v23     | The Starship Log         | 12 badges       |
| v21    | v24     | The Rogue Run            | 12 badges       |

---

## THE COMPLETE BADGE UNIVERSE — v34 SNAPSHOT

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT BADGE UNIVERSE — FULL ACCOUNTING                           ║
║  v34 — October 2026                                             ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  MILESTONE       ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  22 badges            ║
║  TIME EE         ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  28 badges       ║
║  CALENDAR EE     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  79 badges  ║
║  WORD TURNS      ████████████████████████████████████████████   ║
║                  ████████████████████████████  288 badges       ║
║  BEHAVIORAL      ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  87       ║
║  ACHIEVEMENT RPG ████████████████████████████████████  132      ║
║  MASTERY TIER    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  96       ║
║  SECRET BOSS     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  89           ║
║                                                                  ║
║  ══════════════════════════════════════════════════════         ║
║  TOTAL: 874 BADGES                    HIGH SCORE: YOU           ║
║                                                                  ║
║       INSERT COIN   ▶   CONTINUE                                ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## SESSION METADATA

```
SESSION    : LOT-SR-20261006-CODEX-v34
VERSION    : v34
DATE       : 2026-10-06
TOTAL BADGES: 874 (v33: 843 → v34: 874, +31)
CODEX CLASS : ENGINEERING
THEME       : THE ROGUE RUN — Roguelike / Arcade Self-Care Vocabulary
AUTHORIZED BY: S-2 // VADIK MARMELADOV
WORD TURN   : v24
```
