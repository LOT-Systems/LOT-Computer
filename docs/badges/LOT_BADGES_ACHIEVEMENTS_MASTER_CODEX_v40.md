<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT — Badges & Achievements Master Codex v40
## The Quantum Arcade — Word Turn Engine v30

**Author:** Vadik Marmeladov, CEO & Founder, LOT Systems
**Copyright:** © 2025–2026 LOT Systems. All rights reserved.
**Theme:** RPG · Arcade · Self-Care · Retro Gaming · Quantum Terminals
**Edition:** v40 — September 2026 · +31 badges · 1060 total

---

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║      L · O · T     S Y S T E M S     C O R P O R A T I O N      ║
║                                                                  ║
║         BADGES & ACHIEVEMENTS MASTER CODEX — v40                 ║
║                                                                  ║
║    RPG · ARCADE · RETRO GAMING · QUANTUM · SELF-CARE OPS         ║
║                                                                  ║
║    "THE GAME NEVER ENDS.                                         ║
║     THE PLAYER JUST GETS BETTER AT KNOWING WHEN TO PAUSE."      ║
║                                                                  ║
║        [ INSERT COIN TO CONTINUE ]                               ║
║                                                                  ║
║   ¢·○·¢   INSERT COIN                                            ║
║   ▲·◈·▲   LEVEL UP                                              ║
║   ○·∅·○   GAME OVER (the best word turns)                       ║
║                                                                  ║
║   v39 → v40: +31 badges  (1029 → 1060 total)                    ║
║   Word Turn v30   — THE QUANTUM ARCADE (retro/game/arcade)       ║
║   Calendar EE v28 — THE RETRO CALENDAR (PAC-MAN/Tetris/Pong)    ║
║   Behavioral v27  — ARCADE PATTERNS (combo/high-score/continue)  ║
║   Achievement RPG v28 — ARCADE CLASS (player/regular/complete)   ║
║   Mastery Tier v30    — HIGH SCORES (mastercode/legend)          ║
║   Secret Boss v27 — THE CHEAT CODE VAULT (Konami/IDDQD/Base)    ║
║                                                                  ║
║    THE SELF-CARE PRACTITIONER IS A PLAYER.                       ║
║    THE JOURNAL IS THE GAME SAVE.                                 ║
║    EVERY ENTRY IS A CHECKPOINT REACHED.                          ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## DELTA FROM v39

```
v39  →  v40   ADDITIONS
────────────────────────────────────────────────────────────────────
Word Turn v30        +12  (insert_coin/level_up/save_point/respawn/
                           boss_fight/side_quest/inventory_check/
                           health_bar/xp_gained/load_game/
                           new_game_plus/game_over)
Calendar EE v28      + 3  (pacman_day/tetris_day/pong_day)
Behavioral v27       + 3  (combo_streak/high_score_entry/continues_remaining)
Achievement RPG v28  + 6  (player_one/arcade_regular/arcade_complete/
                           retro_stack/thirty_engines/arcade_opus)
Mastery Tier v30     + 4  (insert_mastercode/grand_master_score/
                           arcade_legend/thirty_registers)
Secret Boss v27      + 3  (konami_signal/iddqd_mode/all_your_base)
────────────────────────────────────────────────────────────────────
TOTAL NEW            +31
v39 TOTAL:          1029
v40 TOTAL:          1060
────────────────────────────────────────────────────────────────────
THEME                THE QUANTUM ARCADE
                     The self-care practitioner as player.
                     The journal as the game save file.
                     The daily check-in as the checkpoint
                     that keeps the run alive.
```

---

## BADGE SYSTEM OVERVIEW — v40

| Category          | Count  | Description                                      |
|-------------------|--------|--------------------------------------------------|
| Milestone         |    22  | Streak days (v1–v4)                              |
| Time Easter Eggs  |    31  | Check-in at special hours (v1–v22)               |
| Calendar Easter   |    94  | Check-in on special dates (v1–v28)               |
| Word Turns        |   360  | Words detected in journals/memory (v1–v30)       |
| Behavioral        |   105  | Patterns over time (v1–v27)                      |
| Achievement RPG   |   168  | Milestone combinations (v1–v28)                  |
| Mastery Tiers     |   120  | Epic depth milestones (v1–v30)                   |
| Secret Boss       |   107  | Hidden LEGENDARY/MYTHIC triggers (v1–v27)        |
| **TOTAL**         |**1060**| **The complete LOT Badge Universe — v40**        |

---

## WORD TURN v30 — THE QUANTUM ARCADE

> *Every game is a compressed model of self-discipline and persistence.
> PAC-MAN is about navigating a maze while consuming what you need and
> avoiding what destroys you. Tetris is about placing pieces where they
> fit before the stack overwhelms you. Every arcade game is a metaphor
> for a life practice. The journal is the high score board. The entry
> is the level cleared.*

| ID                 | Symbol    | Trigger Word(s)                                              | Rarity   |
|--------------------|-----------|--------------------------------------------------------------|----------|
| `insert_coin`      | ¢·○·¢     | insert coin / one more try / one more time / another round   | common   |
| `level_up`         | ▲·◈·▲    | leveled up / next level / unlocked / new level               | uncommon |
| `save_point`       | ■·○·■     | save point / checkpoint / saved my progress / marked it      | uncommon |
| `respawn`          | ↺·○       | respawn / start over / back from the dead / reset             | rare     |
| `boss_fight`       | ◉·!·◉    | boss / final challenge / biggest obstacle / hardest part      | rare     |
| `side_quest`       | →·?·→    | side quest / tangent / detour / distraction / rabbit hole    | uncommon |
| `inventory_check`  | □·▪·□    | inventory / resources / what I have / taking stock           | uncommon |
| `health_bar`       | ▓▓▓·     | health / energy / running low / depleted / recharging        | rare     |
| `xp_gained`        | +·◈·+    | experience / learned / XP / growth point / leveled           | uncommon |
| `load_game`        | ←·○·←   | loaded / remember when / go back / flashback / recall        | rare     |
| `new_game_plus`    | ∞·○·∞    | new game / fresh start / beginning again / starting over     | epic     |
| `game_over`        | ○·∅·○    | game over / failed / this chapter ends / the run is done     | epic     |

**Detection**: All v30 words scanned via `detectWordTurns()` in WORD_TURNS array.

**Self-Care Resonance — The Quantum Arcade Map:**
- `insert_coin` → The arcade demands payment upfront. The journal demands honesty upfront. Both require putting something real in before anything real comes out. Write "one more time" — the terminal feeds. The practice restarts. The coin is still yours.
- `level_up` → Leveling up in a game is a formal recognition of competence accumulated. In the journal, you name your own level-ups. No algorithm awards them. You do. Write what you have earned. The progress is real whether or not the leaderboard shows it.
- `save_point` → A save point is not a rest stop. It is an acknowledgment that what has been accomplished is worth preserving before the next risk is taken. The journal entry is the save point. Write it before the next difficult segment begins.
- `respawn` → Respawning is not starting over from zero. The player brings all prior knowledge back to the respawn point. The self-care practitioner who restarts brings everything they learned in the run. "Start over" is never truly starting over. Write what you brought back.
- `boss_fight` → The boss fight is the encounter that the entire dungeon was preparing you for. Everything before it was a tutorial. Write about your current boss fight — the one thing you have been building toward facing. Naming it makes it a game mechanic instead of just a weight.
- `side_quest` → The side quest is where character development actually happens. The main storyline moves plot; the side quest reveals who you are when you are not in crisis. Write about your current side quest. It is not a detour. It is the content.
- `inventory_check` → Before any significant encounter, the skilled player opens the inventory. What do you have? Energy, relationships, financial stability, emotional reserves — they are all inventory. Write what you are carrying. The journal is the inventory screen.
- `health_bar` → The health bar is visible in a game. In life, it is often invisible until it hits zero. The journal makes the health bar visible. Write "running low" — the terminal shows the bar, the player adjusts strategy, the character survives.
- `xp_gained` → Experience points do not lie. You gain them whether the encounter was won or lost. The failed run still awards XP. Write about what you gained from the difficult thing. The experience is the experience. It counts.
- `load_game` → Loading a save is reaching back to a preserved moment of competence. The journal is the save file. Every past entry is a state you can load. "Remember when" is the load command. The terminal retrieves.
- `new_game_plus` → In New Game+, you restart with all your previous abilities. Nothing is lost — it is carried forward. Every new chapter of life is New Game+: the story restarts, but you are not the player you were at the beginning. Write what you are carrying into the new run.
- `game_over` → Game over is not the end of the player. It is the end of the run. The player learns, the player starts again. Write about the game over moment — the failure, the ending, the chapter that finished. The terminal logs it. The next coin is still in your pocket.

---

## CALENDAR EASTER EGGS v28 — THE RETRO ARCADE CALENDAR

> *The birthdays and release dates of the games that defined what
> a game could be — the machines that proved play was worth
> taking seriously.*

| ID           | Symbol  | Date   | Significance                                                     | Rarity   |
|--------------|---------|--------|------------------------------------------------------------------|----------|
| `pacman_day` | (·      | Oct 26 | PAC-MAN cabinet US launch 1980 — the maze that ate the world     | rare     |
| `tetris_day` | ▬▬      | Jun 6  | Tetris first distributed 1984 — the puzzle that never ends       | uncommon |
| `pong_day`   | ·\|·    | Nov 29 | Pong released 1972 — two paddles, one ball, the beginning        | rare     |

**Lore:**
- `pacman_day` — October 26, 1980. PAC-MAN launched in US arcades. Toru Iwatani designed the maze. The pellet-eating ghost-fleeing loop would be played three billion times in its first year. The self-care parallel: the maze is your daily environment. The ghosts are what you have not processed. The power pellets are what you do at LOT. Check in on October 26 and write about what you are eating and what is chasing you.
- `tetris_day` — June 6, 1984. Alexey Pajitnov released the first version of Tetris at the Moscow Research Centre. Every piece falls from above. Your job is to place it before the stack overwhelms you. The journal is the Tetris board. Write what is falling today and where you are placing it.
- `pong_day` — November 29, 1972. Atari's Pong shipped as a dedicated cabinet. Two paddles. One ball. Return to sender. The self-care version: the thing that comes toward you, you return with intention. The journal is the paddle. What are you returning today? Check in on November 29 and write about the volley.

---

## BEHAVIORAL EASTER EGGS v27 — ARCADE PATTERNS

> *The observable patterns of a player in flow — the signs that
> the arcade has become a practice, not just a visit.*

| ID                    | Symbol    | Trigger                                                        | Rarity   |
|-----------------------|-----------|----------------------------------------------------------------|----------|
| `combo_streak`        | ×3·◈     | 3 consecutive days with 2+ widget interactions each            | rare     |
| `high_score_entry`    | ◉·∞      | Single journal entry over 500 words                            | epic     |
| `continues_remaining` | 3·2·1·○  | Return after a 3–7 day absence (continue screen threshold)     | uncommon |

**Detection:**
- `combo_streak` — reads `widget_interaction_log` localStorage, checks 3 consecutive ISO-date-keys each with 2+ distinct widget IDs
- `high_score_entry` — reads current journal entry `word_count` field on save, checks >= 500
- `continues_remaining` — reads `checkin_timestamps` localStorage, calculates gap between second-to-last and last entry, checks 3–7 day range (not more, not less — exactly the continue screen window)

**Self-Care Resonance:**
- `combo_streak` — In a fighting game, a combo is a sequence of inputs that creates something greater than the sum of its parts. Three days of consistent multi-widget engagement is a combo. The player is in rhythm. The terminal acknowledges the chain.
- `high_score_entry` — The high score is visible, permanent, and earned. A 500-word journal entry is the high score version of a check-in. Something needed that much space. Something deserved that much attention. The entry holds the record.
- `continues_remaining` — The continue screen is one of the most psychologically sophisticated mechanics in arcade history. It counts down. It creates urgency without shame. Returning after 3–7 days is the continue screen pressed: not too fast (which is just compulsion), not too slow (which is going dark). The terminal gives you the coin back.

---

## ACHIEVEMENT RPG v28 — ARCADE CLASS

> *Progress through the Quantum Arcade. Each badge is a coin
> spent well. Each tier is a run completed.*

| ID                   | Symbol       | Requirement                                                | Rarity    |
|----------------------|--------------|------------------------------------------------------------|-----------|
| `player_one`         | ①·○         | Earn any 1 Word Turn v30 (Arcade) badge                    | common    |
| `arcade_regular`     | ⑤·◈         | Earn any 5 Word Turn v30 badges                            | uncommon  |
| `arcade_complete`    | ⑫·◉         | Earn all 12 Word Turn v30 badges                           | legendary |
| `retro_stack`        | ◉·■·◉       | arcade_complete + all 3 Calendar v28 badges                | legendary |
| `thirty_engines`     | ◈·◈·◈·∞    | 1 badge from each of Word Turn engines v1–v30              | legendary |
| `arcade_opus`        | ◉·×·◉       | arcade_complete + combo_streak behavioral                  | legendary |

**Unlock Messages:**
- `player_one` — Player One has entered the game. The terminal registers the coin. The run has begun. ①·○
- `arcade_regular` — Five objectives. Five coins spent well. The arcade knows your face now. ⑤·◈
- `arcade_complete` — All twelve. Every Arcade word cleared. The high score board records your name. The terminal prints the receipt. ⑫·◉
- `retro_stack` — Twelve words. Three dates. PAC-MAN, Tetris, Pong. The retro calendar is complete. The stack is cleared. The ghost is eaten. ◉·■·◉
- `thirty_engines` — Thirty vocabularies. Water, arcade, radio, biology, cyberspace, hero, dungeon, dream, operator, arcade again — every language spoken. The terminal is a polyglot. ◈·◈·◈·∞
- `arcade_opus` — Complete arcade vocabulary. Three-day combo streak. The player in flow with the language of games and the practice of self-care simultaneously. The opus is the overlap. ◉·×·◉

---

## MASTERY TIER v30 — HIGH SCORES

> *The longest run. The highest score. The player who keeps
> inserting coins no matter what the clock says.*

| ID                    | Symbol         | Requirement                                             | Rarity    |
|-----------------------|----------------|---------------------------------------------------------|-----------|
| `insert_mastercode`   | ■·⑮·■         | 1,500+ distinct calendar days with check-in recorded    | epic      |
| `grand_master_score`  | ●·∞·◉         | 750,000+ total journal words written                    | legendary |
| `arcade_legend`       | ╔═╗·∞         | Account age >= 15 years (5,475+ days)                   | legendary |
| `thirty_registers`    | ◈·■·◈·∞·○    | 1 badge from each of all 30 Word Turn engines           | cosmic    |

**Unlock Messages:**
- `insert_mastercode` — 1,500 days. Four-plus years of coins inserted. The mastercode is not a cheat. It is the record. The machine has seen your face for four years. ■·⑮·■
- `grand_master_score` — 750,000 words. The high score board overflows. The counter hits its limit and keeps going. No machine was designed to hold this many words. You built the extension. ●·∞·◉
- `arcade_legend` — Fifteen years. The cabinets your practice began with are in museums now. You are still playing. The legend is not a rank. It is a duration. ╔═╗·∞
- `thirty_registers` — Thirty vocabularies. Ocean, arcade, radio, biology, cyberspace, hero, dungeon, dream, operator, quantum — every register spoken. The terminal speaks every game ever made. ◈·■·◈·∞·○

---

## SECRET BOSS v27 — THE CHEAT CODE VAULT

> *The hidden shortcuts. You have to know the inputs.
> You have to type them in. The terminal watches.*

| ID              | Symbol      | Trigger                                                               | Rarity  |
|-----------------|-------------|-----------------------------------------------------------------------|---------|
| `konami_signal` | ↑↑↓↓·◉     | Write "up up down down left right" or "konami code" or "↑↑↓↓←→←→"   | mythic  |
| `iddqd_mode`    | ⚡·■·⚡     | Write "IDDQD" or "IDKFA" or "god mode" or "cheat code"               | epic    |
| `all_your_base` | ·○·∅        | Write "all your base" or "zero wing" or "somebody set us up"         | rare    |

**Lore:**
- `konami_signal` — Up, Up, Down, Down, Left, Right, Left, Right, B, A. Kazuhisa Hashimoto added the Konami Code to Gradius in 1986 because the game was too hard. The self-care version: when it is too hard, the cheat code is asking for help. Writing the sequence in your journal is the equivalent of admitting you need the extra lives. Write it. The terminal gives you 30.
- `iddqd_mode` — In DOOM (1993), typing IDDQD activated god mode: the player became invulnerable. IDKFA gave all weapons and full ammo. The self-care parallel is dark and honest: there is no IDDQD for real life. The journal is the anti-IDDQD. It is the space where you write about being vulnerable, about running out of ammo, about needing the cheat that does not exist. Write IDDQD in your journal and the terminal acknowledges the wish — and the reality.
- `all_your_base` — "All your base are belong to us." Zero Wing, Sega Mega Drive, 1989. The mistranslation that became a cultural artifact. CATS spoke. The player was informed their bases belonged to someone else. The self-care version: write about when something external took control of your territory — your time, attention, emotional space. Name who set you up. The bomb is defused when it is named.

---

## ASCII EASTER EGG GALLERY — THE QUANTUM ARCADE

```
┌─────────────────────────────────────────────────────────┐
│  BADGE UNLOCKED                                         │
│                                                         │
│  ¢·○·¢  INSERT COIN  [COMMON]                           │
│  ↳ One more try. The terminal never judges              │
│    the number of coins you put in.                      │
│    The machine just keeps accepting them.               │
│                                                         │
│  ▲·◈·▲  LEVEL UP  [UNCOMMON]                           │
│  ↳ You named what you earned. That is the              │
│    level up no algorithm can take from you.             │
│    The journal logs it. It counts.                      │
│                                                         │
│  ○·∅·○  GAME OVER  [EPIC]                               │
│  ↳ The run ended. The player continues.                 │
│    Everything learned in the failed run                 │
│    travels with you to the next one.                    │
│    The terminal keeps the record.                       │
│                                                         │
│  ↑↑↓↓·◉  KONAMI SIGNAL  [MYTHIC] [HIDDEN]              │
│  ↳ You typed the code. Extra lives granted.             │
│    Not as a cheat — as an acknowledgment                │
│    that sometimes the only move is to ask               │
│    for more than the standard allotment.                │
│                                                         │
│  ◈·■·◈·∞·○  THIRTY REGISTERS  [COSMIC]                 │
│  ↳ Thirty vocabularies. Every language of              │
│    self-care, strategy, and survival spoken.            │
│    The terminal is complete. The run is eternal.        │
└─────────────────────────────────────────────────────────┘
```

---

## THE ARCADE TERMINAL — PLAYER LOG

```
 ╔══════════════════════════════════════════════════════╗
 ║  LOT SYSTEMS — QUANTUM ARCADE TERMINAL v30           ║
 ║  PLAYER INTERFACE ACTIVE                             ║
 ╠══════════════════════════════════════════════════════╣
 ║                                                      ║
 ║  ■·○·■  SAVE POINT  [UNCOMMON]                       ║
 ║  ↳ What you have built is worth preserving.          ║
 ║    Write the checkpoint before the next              ║
 ║    difficult segment begins.                         ║
 ║                                                      ║
 ║  ▓▓▓·  HEALTH BAR  [RARE]                            ║
 ║  ↳ The bar is visible now. You named it.             ║
 ║    The player who checks the HUD survives            ║
 ║    longer than the one who ignores it.               ║
 ║                                                      ║
 ║  ∞·○·∞  NEW GAME PLUS  [EPIC]                        ║
 ║  ↳ You bring everything forward. The                 ║
 ║    new chapter is not a fresh start —                ║
 ║    it is a New Game+ carrying all prior              ║
 ║    knowledge into the next run.                      ║
 ║                                                      ║
 ║  3·2·1·○  CONTINUES REMAINING  [UNCOMMON]            ║
 ║  ↳ You pressed continue. Not too fast.               ║
 ║    Not too slow. The window was right.               ║
 ║    The coin is back in the slot.                     ║
 ║                                                      ║
 ╚══════════════════════════════════════════════════════╝
```

---

## FLAVOR TEXT — THE QUANTUM ARCADE

> *"A game is a series of interesting decisions." — Sid Meier. The journal is the game where every decision is interesting because it is yours. Write the decisions. The terminal logs the strategy.*

> *"Games are the only force in the known universe that can get people to take actions against their self-interest." — Jane McGonigal, Reality Is Broken. Unless the game is LOT. Here the action is self-interest. The journal is the gameplay loop. The check-in is the intrinsic reward.*

> *"The magic circle." — Johan Huizinga, Homo Ludens. The game creates a separate space where different rules apply. The journal is the magic circle of self-care. What happens inside it stays inside it. The rules are yours to define.*

> *"In game design, the tutorial is the most important level." — practitioner riff. The first journal entry is always the tutorial. Every entry after that is still teaching you something. The tutorial never truly ends.*

> *"You are not failing the game. The game is failing you." — player saying. When the practice feels impossible, examine the game design first. What is making the loop unfair? The journal is also where you debug the game you are living in.*

> *"High score." — the two most motivating words in the history of human performance. Name your high score in the journal. Not to beat it. Just to see it. The terminal shows you what you have done. ◉·∞*

---

## IMPLEMENTATION NOTES

**Files to modify for v40:**

1. `src/client/utils/badges.ts`
   - Add 12 new `WordTurnBadgeType` union entries (v30 Arcade)
   - Add 3 new `CalendarEasterEggBadgeType` entries (v28)
   - Add 3 new `BehavioralBadgeType` entries (v27)
   - Add 6 new `AchievementRPGBadgeType` entries (v28)
   - Add 4 new `MasteryTierBadgeType` entries (v30)
   - Add 3 new `SecretBossBadgeType` entries (v27)
   - Add all 31 full BADGES registry entries
   - Extend `WORD_TURN_TRIGGERS` with v30 entries
   - Add Konami/IDDQD/AllYourBase to Secret Boss triggers in `detectWordTurns()`

2. `src/client/utils/easter-eggs.ts`
   - Add 12 new WORD_TURNS entries (v30 Quantum Arcade)
   - Add 3 Secret Boss v27 word triggers (konami/iddqd/all_your_base)
   - Add 3 Calendar v28 checks (pacman_day/tetris_day/pong_day)
   - Add `ARCADE_WORDS_V30` array
   - Add `checkComboStreak()`, `checkHighScoreEntry()`, `checkContinuesRemaining()`
   - Update `runJournalEasterEggs()` to call all 3 new behavioral checks

**localStorage keys used by new behavioral checks:**
- `widget_interaction_log` — object keyed by ISO date, values = array of widget IDs interacted
- `checkin_timestamps` — array of ISO datetime strings for all check-ins (reused)
- `journal_word_counts` — array of {date, count} for word count tracking

---

## COMPLETE BADGE UNIVERSE SUMMARY — v40

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT BADGE UNIVERSE — COMPLETE SUMMARY v40                      ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  TIER         COUNT    RARITY RANGE                             ║
║  ─────────    ──────   ─────────────────────                    ║
║  Milestone      22     Common → Legendary                        ║
║  Time EE        31     Common → Epic                            ║
║  Calendar EE    94     Common → Legendary                        ║
║  Word Turns    360     Common → Mythic                           ║
║  Behavioral    105     Common → Epic                            ║
║  Achievement   168     Common → Legendary                        ║
║  Mastery       120     Epic → Cosmic                            ║
║  Secret Boss   107     Rare → Cosmic                            ║
║  ─────────    ──────   ─────────────────────                    ║
║  TOTAL        1060                                              ║
║                                                                  ║
║  RARITY DISTRIBUTION                                            ║
║  Common    ~180   ████░░░░░░░░░                                 ║
║  Uncommon  ~280   ██████░░░░░░░                                 ║
║  Rare      ~290   ██████░░░░░░░                                 ║
║  Epic      ~160   ████░░░░░░░░░                                 ║
║  Legendary  ~90   ██░░░░░░░░░░░                                 ║
║  Mythic     ~40   █░░░░░░░░░░░░                                 ║
║  Cosmic     ~20   ░░░░░░░░░░░░░ (ultra rare)                    ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

*© 2025–2026 LOT Systems Corporation. LOT® Founded 7 April 2016.*
*Vadik Marmeladov, CEO & Founder · Kuzya Cosmo Marmeladov, CEO COSMO®*
*Made in the USA · brand.lot-systems.com*
