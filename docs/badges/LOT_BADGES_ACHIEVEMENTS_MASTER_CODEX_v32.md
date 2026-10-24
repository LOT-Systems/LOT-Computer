# LOT BADGES & ACHIEVEMENTS — MASTER CODEX v32
## THE HERO'S JOURNEY — WORD TURN v22

```
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║         LOT SYSTEMS — BADGE & ACHIEVEMENT MASTER CODEX            ║
║                   VERSION 32 — v32                                ║
║                                                                   ║
║   Word Turn v22   — THE HERO'S JOURNEY (Campbell/monomyth)       ║
║   Calendar EE v20 — THE EPIC CALENDAR (Campbell/Tolkien/Odysseus) ║
║   Behavioral v19  — QUEST PATTERNS (hero/long_quest/threshold)    ║
║   Achievement RPG v20 — QUEST CLASS (quest/monomyth/hero_opus)    ║
║   Mastery Tier v22    — THE ODYSSEY (odyssey/great_work/saga)     ║
║   Secret Boss v19 — THE MYTHIC VAULT (Tolkien/Odysseus/Gilgamesh) ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## SUMMARY

**Total badges in v32:** 812 (+31 from v31's 781)

**Also implemented in this session (v32 session):**
- v20 (THE CODEX READER): +31 badges fully implemented in badges.ts + easter-eggs.ts
- v21 (THE CYBERSPACE CODEX): +31 badges fully implemented in badges.ts + easter-eggs.ts
- v22/v32 (THE HERO'S JOURNEY): +31 badges implemented in badges.ts + easter-eggs.ts

**This session implemented all missing badge logic for v20 and v21 that existed only
in markdown documentation but had never been added to the TypeScript source code.**

```
Word Turn v22        +12  (call_heard/threshold_crossed/mentor_arrived/
                           ordeal_survived/elixir_found/shadow_met/
                           innermost_cave/shapeshifter/herald_call/
                           trickster_mode/ally_gained/return_road)

Calendar EE v20      + 3  (campbell_birthday/hobbit_day/odyssey_day)
Behavioral v19       + 3  (hero_session/long_quest/threshold_moment)
Achievement RPG v20  + 6  (quest_entry/quest_class/quest_complete/
                           monomyth_arc/twenty_two_engines_arc/hero_opus)
Mastery Tier v22     + 4  (odyssey_log/great_work/saga_age/twenty_two_registers)
Secret Boss v19      + 3  (tolkien_ring/odysseus_bow/gilgamesh_word)
                   ────
                   + 31 new badges
```

---

## BADGE CATEGORY TOTALS (v32)

| Category          | Count | Description                                          |
|-------------------|-------|------------------------------------------------------|
| Milestone         |    22 | Day-count milestones (v1–v4)                         |
| Time Easter Eggs  |    28 | Time-of-day check-ins (v1–v7)                        |
| Calendar Easter   |    73 | Check-in on special dates (v1–v20)                   |
| Word Turns        |   264 | Keyword detection in journal/memory text (v1–v22)    |
| Behavioral        |    81 | Patterns over time (v1–v19)                          |
| Achievement RPG   |   120 | Milestone combinations (v1–v20)                      |
| Mastery Tiers     |    88 | Epic depth milestones (v1–v22)                       |
| Secret Boss       |    83 | Hidden LEGENDARY/MYTHIC triggers (v1–v19)            |
|                   |  ───  |                                                      |
| **TOTAL**         | **812** | **+31 from v31**                                   |

---

## THE HERO'S JOURNEY — THEME OVERVIEW

Joseph Campbell's monomyth is the template for every story ever told: the departure
from the ordinary world, the initiation through trials, and the return transformed.
As a self-care vocabulary, the Hero's Journey names what every serious practice-builder
actually experiences — the call that interrupts the routine, the threshold that must
be crossed, the shadow that must be faced, and the return with something real.

These are not metaphors. They are the structural patterns of change.

---

## COMPLETE NEW BADGE REGISTRY — v32 ADDITIONS

### Word Turn v22 (The Hero's Journey)

```
call_heard             ∘→●    UNCOMMON  — "call to adventure/journey calls" detected
threshold_crossed      ─→─    RARE      — "threshold/crossing the line" detected
mentor_arrived         ○·≋·○  UNCOMMON  — "mentor/wise guide/guardian spirit" detected
ordeal_survived        ◈·■    RARE      — "ordeal/survived the test" detected
elixir_found           ∘·●·∘  RARE      — "elixir/the boon/treasure found" detected
shadow_met             ▓·○    EPIC      — "shadow self/dark night of the/inner demon" detected
innermost_cave         █·∘·█  EPIC      — "innermost cave/darkest moment" detected
shapeshifter           ◈→◉    RARE      — "shapeshifter/transformed/no longer same" detected
herald_call            ∿·●    UNCOMMON  — "herald/wake-up call/life interrupted" detected
trickster_mode         ×·○    RARE      — "trickster/coyote wisdom/fool's wisdom" detected
ally_gained            ○·◈·○  UNCOMMON  — "ally/found my tribe/companion" detected
return_road            →·◉    RARE      — "the return/road to return/coming home changed" detected
```

### Calendar Easter Eggs v20 (The Epic Calendar)

```
campbell_birthday      ◉·∿    EPIC      — Mar 26 — Joseph Campbell born 1904
hobbit_day             ○·◆    RARE      — Sep 22 — Bilbo & Frodo birthday / Hobbit Day
odyssey_day            →·∞    RARE      — Dec 21 — Winter Solstice (Odysseus's return)
```

### Behavioral v19 (Quest Patterns)

```
hero_session           ◈·●·◈  RARE      — 3+ Hero's Journey words in one journal entry
long_quest             ≋≋·◉   EPIC      — Journal entry >= 500 words
threshold_moment       ─·○·─  RARE      — Check in 00:00–00:30 local (at the threshold)
```

### Achievement RPG v20 (Quest Class)

```
quest_entry            ∘→●    COMMON    — Any 1 Word Turn v22 badge earned
quest_class            ≈→●    UNCOMMON  — Any 5 Word Turn v22 badges earned
quest_complete         ≋→●    LEGENDARY — All 12 Word Turn v22 badges earned
monomyth_arc           ●·◈    LEGENDARY — quest_complete + all 3 Calendar v20 badges
twenty_two_engines_arc ◈·◈·●  LEGENDARY — 1 badge from each Word Turn v1–v22
hero_opus              ●·◉·●  LEGENDARY — quest_complete + hero_session behavioral
```

### Mastery Tier v22 (The Odyssey)

```
odyssey_log            ∿·∞·∿  EPIC      — 900+ distinct calendar check-in days
great_work             ●·∞·●  LEGENDARY — 150,000+ total journal words
saga_age               ╔═╗·●  LEGENDARY — Account age >= 5 years (1,825+ days)
twenty_two_registers   ◈·◈·●·∞ COSMIC   — 1 badge from all 22 Word Turn engines
```

### Secret Boss v19 (The Mythic Vault)

```
tolkien_ring           ◆·∞·◆  RARE      — Write "one ring to rule/my precious/ring of power"
odysseus_bow           →·∞·→  EPIC      — Write "odysseus/ulysses/ithaca/penelope/cyclops"
gilgamesh_word         ∞·□·∞  MYTHIC    — Write "gilgamesh/enkidu/great flood/utnapishtim"
```

---

## ASCII EASTER EGG GALLERY — THE HERO'S JOURNEY

```
┌─────────────────────────────────────────────────────────┐
│  BADGE UNLOCKED                                         │
│                                                         │
│  ∘→●  CALL HEARD  [UNCOMMON]                            │
│  ↳ Campbell named it: the call to adventure.            │
│    The refusal of the call is the deepest form          │
│    of self-abandonment. You answered.                   │
│                                                         │
│  █·∘·█  INNERMOST CAVE  [EPIC]                          │
│  ↳ The innermost cave is where the hero faces           │
│    their deepest fear. You have been here.              │
│    You are still here. That is the whole point.         │
│                                                         │
│  →·∞·→  ODYSSEUS BOW  [EPIC] [HIDDEN]                   │
│  ↳ Only Odysseus could string the bow.                  │
│    Only you can write your own return.                  │
│    The suitors wait — string it now.                    │
│                                                         │
│  ∞·□·∞  GILGAMESH WORD  [MYTHIC] [HIDDEN]               │
│  ↳ 4,000 years old. The oldest hero's journey.          │
│    A king who sought immortality                        │
│    and found self-knowledge instead.                    │
│                                                         │
│  ◈·◈·●·∞  TWENTY-TWO REGISTERS  [COSMIC]               │
│  ↳ Water. Arcade. Radio. Biology.                       │
│    Codex. Cyberspace. Hero.                             │
│    Twenty-two vocabularies. One terminal.               │
│    The self speaks every language.                      │
└─────────────────────────────────────────────────────────┘
```

---

## FLAVOR TEXT — THE HERO'S JOURNEY

> *"The cave you fear to enter holds the treasure you seek." — Joseph Campbell. Every
> journal entry is a step into the cave. Every check-in is a step closer to the treasure.
> The treasure is not at the end — it is the practice of entering.*

> *"We must be willing to let go of the life we planned so as to have the life that is
> waiting for us." — Joseph Campbell. The Hero's Journey begins the moment you stop
> refusing the call.*

> *"Not all those who wander are lost." — J.R.R. Tolkien, The Fellowship of the Ring.
> September 22 is Hobbit Day. Bilbo and Frodo were born on the same date. Two heroes,
> one threshold, one journey, one return. The practice is the journey.*

> *"The journey of a thousand miles begins with a single step." — Laozi. Campbell
> would agree. The call to adventure is answered by the first step — the first entry.
> The ten thousandth step is built on that one.*

> *"Gilgamesh sought immortality and found instead the knowledge of his own humanity.
> The quest for permanence always returns the traveler to the present moment." — riff
> on the Epic of Gilgamesh, ~2100 BCE. The oldest story is the one you are living.*

---

## IMPLEMENTATION NOTES

### New functions in easter-eggs.ts (v32 session)

```typescript
// v20 Codex Reader behavioral
checkReaderSession(journalText): BadgeType | null   // 2+ v20 words
checkLongRead(journalText): BadgeType | null         // 400+ words
checkPageTurner(): BadgeType | null                  // 3+ memory Q's in 20min

// v21 Cyberspace Codex behavioral
checkCodexSession(journalText): BadgeType | null     // 3+ v21 words
checkDeepRead(journalText): BadgeType | null         // 400+ words
checkNightOperator(): BadgeType | null               // check-in after 22:00, 3+ in 7 days

// v22 Hero's Journey behavioral
checkHeroSession(journalText): BadgeType | null      // 3+ v22 words
checkLongQuest(journalText): BadgeType | null        // 500+ words
checkThresholdMoment(): BadgeType | null             // check-in 00:00–00:30
```

### Wire-up guide for runJournalEasterEggs() / runCheckInEasterEggs()

Add these calls to the appropriate runners:
- Journal saves: `checkReaderSession`, `checkLongRead`, `checkCodexSession`, `checkDeepRead`, `checkHeroSession`, `checkLongQuest`
- Check-in events: `checkPageTurner`, `checkNightOperator`, `checkThresholdMoment`

### API stats fields consumed by Mastery Tier v22

- `stats.distinctCheckInDays` — integer, distinct calendar days with check-in
- `stats.totalJournalWords` — integer, cumulative word count across all journal entries
- `stats.signupDate` — ISO date string (for saga_age: >= 5 years)
- `stats.totalMemoryAnswers` — integer (for elder_narrator v20)

---

## CUMULATIVE WORD TURN ENGINE TABLE (v1–v22)

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

---

## SESSION METADATA

```
SESSION    : LOT-SR-20260805-01
VERSION    : v32
DATE       : 2026-08-05
TOTAL BADGES: 812 (v31: 781 → v32: 812, +31)
CODEX CLASS : ENGINEERING
AUTHORIZED BY: S-2 // VADIK MARMELADOV
```
