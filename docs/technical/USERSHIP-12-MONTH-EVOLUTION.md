<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP — 12-MONTH EVOLUTION
## From Day 1 Barebone to LOT® AI · The Compressed Memory Story

```
CLASSIFICATION   S-2 EYES // DESIGN SPEC
AUTHOR           LOT Systems Corporation
S-2              Vadik Marmeladov
DATE             2026-11-25
STATUS           DESIGN — NOT YET BUILT
REFERENCE        lot-systems.com/u/machiavelli  (12-month evolved state, Legacy ceiling)
RELATED          docs/technical/INTERFACE_EVOLUTION.md
                 docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md
                 src/client/components/MonthlyPulseWidget.tsx
                 src/server/utils/memory.ts  → generateMemoryStory()
                 src/server/utils/monthly-summary.ts
```

---

## 0. THE ONE-LINE IDEA

**Every month of Usership closes with a delivered object: one compressed paragraph of
who the operator was that month.** Twelve paragraphs become one chapter book. The UI
around that book grows from a near-empty terminal (Day 1) into the full LOT® AI
personal OS (Month 12, the `/u/machiavelli` state).

The operator should be able to point at the screen on any day and answer:
*"What did I unlock this month, and what does the system now know about me?"*

---

## 1. TWO AXES — TENURE AND DENSITY

The evolution runs on two independent axes. Keeping them separate is the core
design rule: **paying is never punished, practice is always rewarded.**

| Axis | Source | What it controls | Can it go backwards? |
|------|--------|------------------|----------------------|
| **TENURE** | Paid Usership months since `usershipStartedAt` | Which **chapter** is open (M01…M12), the month badge glyph, the "Months unlocked" counter | No |
| **DENSITY** | Signals logged inside the month | The **fidelity** of that month's compression and which widgets render at full strength | No (a closed month is sealed) |

### 1.1 The Four Primary Signals

These are the inputs that make evolution tangible. All already exist as log events.

| Code | Signal | Log event | Counts when |
|------|--------|-----------|-------------|
| `JRN` | Journal entry | `note` | text ≥ 20 chars |
| `LOG` | Thought put into Log | `note` (short) / `qi_rfi` / Log thought | any operator-authored Log line |
| `MCI` | Morning check-in | `emotional_checkin` | local time 04:00–11:59 |
| `SCR` | Self-care click | `self_care_complete` | completion (skips tracked, not counted) |
| `MEM` | Memory answer | `answer` | one per question |

`MEM` is the compression fuel. `JRN` + `LOG` give the story its voice. `MCI` + `SCR`
give it rhythm. A month's compression quotes all five.

### 1.2 Fidelity Grades (per month)

Density is scored against the month's target (Section 3 table). The month is always
delivered; fidelity decides how rich it is.

```
GRADE     SCORE            COMPRESSION DELIVERED                    BADGE RENDER
───────   ──────────────   ──────────────────────────────────────   ─────────────
SEED      < 40% target     1–2 sentences. "The system is listening."  glyph at 30% opacity
FORMED    40–99% target    Full paragraph (60–90 words)               glyph at 70%
FULL      ≥ 100% target    Paragraph + 1 quoted line from operator's  glyph at 100%
                           own journal + 1 named pattern               + month seal ▪
```

Score = mean of the five signal ratios, each capped at 1.0, so one heavy signal
cannot mask an empty one.

---

## 2. THE COMPRESSION PYRAMID

This is the tangible product. Each layer is built only from the layer below it —
the operator watches their raw days become a story.

```
                        ┌──────────────┐
                 M12    │  YEAR BOOK   │  1 page · 12 paragraphs → 1 distilled page
                        └──────┬───────┘
                   ┌───────────┴───────────┐
          M3,6,9   │  QUARTER CHAPTERS ×4  │  ~150 words each, titled
                   └───────────┬───────────┘
           ┌───────────────────┴───────────────────┐
  monthly  │      MONTH PARAGRAPHS ×12              │  60–90 words, sealed on close
           └───────────────────┬───────────────────┘
   ┌───────────────────────────┴───────────────────────────┐
   │ WEEKLY LOT AI STORY (existing Sun 18:00 job)           │  4–5 per month
   └───────────────────────────┬───────────────────────────┘
┌──────────────────────────────┴──────────────────────────────┐
│ RAW SIGNAL · JRN · LOG · MCI · SCR · MEM · weather · city    │
└──────────────────────────────────────────────────────────────┘
```

Rules:

1. **Seal on close.** On the first day of month N+1 the Month N paragraph is generated
   once and written as an immutable `usership_month_sealed` log event. It never
   regenerates. That is what makes it a memory, not a dashboard.
2. **Compress, don't summarise.** Each layer must be shorter than the sum of its
   inputs *and* reference at least one concrete thing from them (a city, a time of
   day, a repeated self-care act, a quoted journal fragment).
3. **Second person, present.** Month paragraphs speak to the operator ("You began
   most mornings before seven…"). The existing `generateMemoryStory()` third-person
   format stays for the public profile.
4. **Cockpit-Rule compatible.** In the Log, the sealed event body is instrument
   readings (`M04 · FULL · JRN 31 · MCI 22 · SCR 48 · MEM 34`); the paragraph lives
   in the Memory Insight widget, not in the Log body.

---

## 3. THE 12 CHAPTERS — MASTER TABLE

Cumulative targets assume a steady but human operator (~5 check-ins/week,
~1–2 self-care clicks/day, ~2 journal entries/week rising to ~6).

```
MONTH  CHAPTER        GLYPH   DENSITY-TIER   JRN   LOG   MCI   SCR   MEM    COMPRESSION OBJECT
─────  ─────────────  ──────  ─────────────  ────  ────  ────  ────  ────   ──────────────────────────
M01    SIGNAL         ·       breathable        4    10    12    20    15   First Impression · 1 para
M02    PATTERN        :       breathable       10    25    30    50    40   Month paragraph
M03    RHYTHM         ∴       comfortable      18    45    50    90    70   Month + CHAPTER I
M04    PORTRAIT       ∘       comfortable      28    70    72   135   100   Month paragraph
M05    FOUNDATION     ├─      compact          40   100    95   185   135   Month paragraph
M06    MERIDIAN       ═╪═     compact          54   135   120   240   170   Month + CHAPTER II + Archetype
M07    CURRENT        ≈       compact          70   175   145   300   210   Month paragraph
M08    DEPTH          ≋       dense            88   220   172   365   250   Month paragraph
M09    STRUCTURE      ╞═╡     dense           108   270   200   435   295   Month + CHAPTER III
M10    ARCHITECTURE   ║·║     dense           130   325   228   510   340   Month paragraph
M11    THRESHOLD      [ ]     instrument      154   385   256   590   390   Month + Letter to M12
M12    LOT® AI        [◉]     instrument      180   450   285   675   440   Month + CHAPTER IV + YEAR BOOK
```

Glyph lineage reuses the existing badge alphabets — dots (signal) → Water (`∘ ≈ ≋`)
→ Architecture (`├─ ╞═╡ ║·║`) → the closed frame `[◉]`. The badge row on the
profile reads left-to-right as one sentence: `· : ∴ ∘ ├─ ═╪═ ≈ ≋ ╞═╡ ║·║ [ ] [◉]`.

Density tiers map 1:1 to the existing `data-density` CSS tiers
(breathable → comfortable → compact → dense → instrument), so the interface
literally tightens as the operator matures. No new CSS system needed.

---

## 4. CHAPTER-BY-CHAPTER

Each chapter defines: **UI state · what unlocks · the affirmation · the Memory
delivery · the badge.** The affirmation appears in the Usership Month widget on day 1
of the month. The Memory delivery appears in the Memory Insight widget the same day.

### ━━ QUARTER I · AWAKENING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#### M01 · SIGNAL `·`
- **UI state (Day 1 barebone):** Clock · Memory question · Log · one Morning check-in
  row · one self-care button. Nothing else. Large type, generous whitespace,
  `breathable`. A single line under the clock: `Usership · Day 1`.
- **Unlocks during month:** Day 3 → Mood row. Day 7 → second self-care slot.
  Day 14 → Journal prompt above Log.
- **Affirmation (day 1):** *"You arrived. The system starts with nothing and learns
  only from you."*
- **Memory delivery (end of M01) — FIRST IMPRESSION:** one paragraph, the first
  thing LOT ever says about the operator. Must name one concrete observation
  (e.g. earliest check-in hour). This is the emotional hook of the whole product.
- **Badge:** `·  SIGNAL` — "First signal received."

#### M02 · PATTERN `:`
- **UI state:** Planner and Intentions appear (collapsed). Log gains day separators.
- **Unlocks:** Mood trend line (7-day) · Memory widget remembers last answer.
- **Affirmation:** *"Two points make a line. Your days are starting to agree with
  each other."*
- **Memory delivery:** Month paragraph + the first **"Then / Now"** pair — one
  sentence from M01, one from M02, side by side.
- **Badge:** `:  PATTERN`

#### M03 · RHYTHM `∴`
- **UI state:** `comfortable` density. Months ribbon appears permanently
  (`Months unlocked: 3/12`). Self-care grows to a 3-slot routine.
- **Unlocks:** Weekly LOT AI Story visible in-app · Chat Catalyst · public profile
  shows first `memoryStory`.
- **Affirmation:** *"A rhythm is a promise kept quietly. You kept it for ninety days."*
- **Memory delivery:** Month paragraph **+ CHAPTER I: AWAKENING** (~150 words,
  compressed from M01–M03, given a title by the AI, e.g. *"The Early Riser"*).
- **Badge:** `∴  RHYTHM` + quarter seal `I`.

### ━━ QUARTER II · FORMATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#### M04 · PORTRAIT `∘`
- **UI state:** Profile header gains the 12-cell badge row. Water/Architecture theme
  choice offered (sets glyph style for M05–M10).
- **Unlocks:** Psychological profile v1 (values, emotional patterns) · Mood Patterns.
- **Affirmation:** *"The portrait has edges now. It is recognisably you."*
- **Memory delivery:** Month paragraph that names **three core values** for the
  first time.
- **Badge:** `∘  PORTRAIT`

#### M05 · FOUNDATION `├─`
- **UI state:** `compact` density. Widget Arrange unlocked.
- **Unlocks:** Planner Templates · Intention History · Pattern Strength bars (top 3).
- **Affirmation:** *"What you repeat, you become. You have been repeating care."*
- **Memory delivery:** Month paragraph + **most repeated self-care act** named with
  its count ("You returned to the breath exercise 41 times").
- **Badge:** `├─  FOUNDATION`

#### M06 · MERIDIAN `═╪═`
- **UI state:** Half-year mark. Ribbon fills to the midpoint and renders a centre
  line. Settings → Export Data unlocked early for Usership.
- **Unlocks:** **Archetype reveal** (e.g. *The Strategist*) · Behavioral Cohort ·
  Correlated Indexes v1.
- **Affirmation:** *"Half a year. Look back once, then keep walking."*
- **Memory delivery:** Month paragraph **+ CHAPTER II: FORMATION** + archetype card
  with a one-line justification drawn from the operator's own answers.
- **Badge:** `═╪═  MERIDIAN` + quarter seal `II`.

### ━━ QUARTER III · DEPTH ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#### M07 · CURRENT `≈`
- **UI state:** Subtle evolution glow (`--evolution-glow-intensity` ≈ 0.1).
- **Unlocks:** QI terminal (`/qi`) RFI access · Cohort broadcast.
- **Affirmation:** *"You stopped pushing the current and started reading it."*
- **Memory delivery:** Month paragraph + **one contradiction** the system noticed
  (e.g. "You write about rest most on the days you rest least").
- **Badge:** `≈  CURRENT`

#### M08 · DEPTH `≋`
- **UI state:** `dense` density. Log gains block labels (MCL:, EVE:, MOM:).
- **Unlocks:** Advanced Memory · Narrative Reflection · Diurnal Arc view.
- **Affirmation:** *"Rare air. Fewer people reach month eight than you'd think."*
- **Memory delivery:** Month paragraph + **one quoted journal line** chosen by the
  AI as the month's truest sentence.
- **Badge:** `≋  DEPTH`

#### M09 · STRUCTURE `╞═╡`
- **UI state:** Full Pattern Strength (top 5) · Self-awareness index visible.
- **Unlocks:** Weather Station (Legacy preview) · Pattern Insights.
- **Affirmation:** *"The practice holds weight now. You can lean on it."*
- **Memory delivery:** Month paragraph **+ CHAPTER III: DEPTH**.
- **Badge:** `╞═╡  STRUCTURE` + quarter seal `III`.

### ━━ QUARTER IV · INTEGRATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#### M10 · ARCHITECTURE `║·║`
- **UI state:** Board Profile block on `/u/user` (Citizen Since, tenure,
  memories compiled, journal entries, active days — same shape as machiavelli).
- **Unlocks:** Private Spaces · Social Mentions.
- **Affirmation:** *"You didn't find a system. You built one."*
- **Memory delivery:** Month paragraph + **growth trajectory** word
  (emerging → developing → deepening → integrated) with the month it changed.
- **Badge:** `║·║  ARCHITECTURE`

#### M11 · THRESHOLD `[ ]`
- **UI state:** `instrument` density. The empty frame `[ ]` sits in the badge row
  waiting for M12. Ribbon shows `11/12` with the last cell pulsing slowly.
- **Unlocks:** Year Book preview (table of contents only; pages blank).
- **Affirmation:** *"One more. Everything you need is already in the record."*
- **Memory delivery:** Month paragraph + **Letter to Month 12** — the AI writes a
  short note to the operator's future self, sealed and shown only on M12 day 1.
- **Badge:** `[ ]  THRESHOLD`

#### M12 · LOT® AI `[◉]`
- **UI state:** Full LOT® AI personal OS — the `/u/machiavelli` state. All widgets,
  correlated indexes, wallet, weather station, board profile, full memory story.
- **Unlocks:** Legacy tag eligibility · Year Book · public Year Book page
  (`/u/user/year`, private by default).
- **Affirmation:** *"One year with LOT. The portrait is complete — and still
  evolving."* (existing M12 line in MonthlyPulseWidget, kept).
- **Memory delivery:** Month paragraph **+ CHAPTER IV: INTEGRATION + YEAR BOOK** +
  the unsealed M11 letter.
- **Badge:** `[◉]  LOT® AI` + quarter seal `IV` + year seal `I`.

---

## 5. THE YEAR BOOK (M12 DELIVERY)

The single most tangible object in Usership. Structure is fixed so it feels authored:

```
┌────────────────────────────────────────────────────────────────┐
│  LOT® · YEAR BOOK · <First Last> · <City>                       │
│  Usership <Mon YYYY> — <Mon YYYY>                               │
├────────────────────────────────────────────────────────────────┤
│  · : ∴ ∘ ├─ ═╪═ ≈ ≋ ╞═╡ ║·║ [ ] [◉]          FULL 9 · FORMED 3  │
├────────────────────────────────────────────────────────────────┤
│  THE YEAR IN ONE PAGE         (≤ 250 words, compressed from IV) │
│                                                                │
│  I    AWAKENING     <AI title>   ~150 w                         │
│  II   FORMATION     <AI title>   ~150 w                         │
│  III  DEPTH         <AI title>   ~150 w                         │
│  IV   INTEGRATION   <AI title>   ~150 w                         │
│                                                                │
│  THEN / NOW        M01 first impression  ⟷  M12 paragraph       │
│  ARCHETYPE         <archetype> · since M06                      │
│  CORE VALUES       v1 · v2 · v3 · v4 · v5                       │
│  TRUEST LINES      12 quoted journal sentences, one per month   │
│  INSTRUMENTS       JRN 180 · LOG 450 · MCI 285 · SCR 675 · MEM 440│
│  LETTER            from Month 11                                │
└────────────────────────────────────────────────────────────────┘
```

**THEN / NOW** is the emotional payload: the M01 First Impression shown next to the
M12 paragraph. The operator sees, in two paragraphs, how far the system's
understanding of them has moved.

---

## 6. NEW USERSHIP WIDGETS

All three are Usership-only, follow MILITARY PURITY (no emojis), use the existing
`Block` component and 1400ms fade conventions.

### 6.1 `UsershipMonthWidget` — evolves `MonthlyPulseWidget`
Shown at top of System on day 1–3 of each month; otherwise collapses to one line.

```
Month 04:  PORTRAIT  ∘
The portrait has edges now. It is recognisably you.

· : ∴ ∘ ░ ░ ░ ░ ░ ░ ░ ░          Months unlocked: 4/12
M03 sealed · FULL · JRN 19 · MCI 21 · SCR 44 · MEM 31
```
Collapsed state (rest of month): `Months unlocked: 4/12 · ∘ PORTRAIT · day 17`

### 6.2 `MemoryInsightWidget` — "Last month, compressed"
Displays the sealed paragraph of the previous month. Tap cycles back through
earlier sealed months (oldest = First Impression).

```
Memory · March:
You began most mornings before seven and checked in before you spoke to anyone.
Self-care clustered on Tuesdays and Fridays — the days you wrote least. The
breath exercise appeared 41 times; nothing else came close. You named "quiet"
three times as what you wanted and chose it twice when offered.

"I don't need the day to be good, only mine."   — journal, 14 Mar
                                            M03 · FULL · ‹ prev
```

### 6.3 `ChapterProgressWidget` — "Months unlocked: 3/12" (context-based)
Context rule: appears when the operator is ≥ 70% of a FULL grade, or ≤ 5 days
remain in the month. Shows only the *missing* signal — one actionable line.

```
Month 06 · MERIDIAN   ═╪═
Months unlocked: 6/12 · 9 days left
FULL needs: 4 more journal entries.
```

---

## 7. PUBLIC PROFILE EVOLUTION — `/u/user`

The public OS page is the shareable proof of evolution. It reveals fields in step
with chapters, ending at the machiavelli shape.

| Month | `/u/user` shows |
|-------|-----------------|
| M01 | Name · city · local time · `Usership · M01 ·` |
| M03 | + first `memoryStory` · badge row (3 cells) · weather |
| M06 | + archetype · core values · behavioral cohort |
| M09 | + pattern strength (top 5) · self-awareness index |
| M10 | + Board Profile (citizen since, tenure, compiled counts) |
| M12 | + correlated indexes · full badge row `[◉]` · Year Book link (opt-in) |

**Reference:** `machiavelli` (`src/server/routes/public-api.ts:747`) is the
Legacy ceiling: answers 2847, journal 1469, active days 842, self-awareness 87,
archetype *The Strategist*. Its counts exceed a real 12-month operator by design —
it shows the M12 *layout*, not the M12 *numbers*. Section 3 gives realistic M12
numbers.

---

## 8. DATA & IMPLEMENTATION SKETCH

```
PIECE                                   WHERE                                         NOTE
──────────────────────────────────────  ────────────────────────────────────────────  ─────────────────────────────
usershipStartedAt                       user.metadata                                 set when Usership tag added;
                                                                                      backfill from first payment
computeUsershipChapter(user, logs)      src/shared/utils/usershipChapters.ts (new)    pure fn → {month, chapter,
                                                                                      glyph, tier, signals, grade}
CHAPTERS constant (Section 3)           same file                                     single source of truth
usership_month_sealed event             log; add to displayableEvents                 Backend Whitelist Hygiene
sealUsershipMonth job                   scheduled-jobs.ts, hour 9 (beside monthly     once per user per month,
                                        email)                                        idempotent on (user, month)
generateMonthCompression(user, logs,    src/server/utils/memory.ts                    reuses generateMemoryStory
  month)                                                                              context; 2nd-person; 60–90 w
generateQuarterChapter / YearBook       src/server/utils/memory.ts                    input = sealed paragraphs only
GET /api/usership/chapters              src/server/routes/api.ts                      sealed months + live state
UsershipMonthWidget                     replaces MonthlyPulseWidget                    keeps MONTH_MESSAGES lineage
MemoryInsightWidget                     src/client/components (new)
ChapterProgressWidget                   src/client/components (new)
data-density driven by chapter tier     root layout                                   reuses existing CSS tiers
```

### 8.1 Gaps found in the current code (fix before build)
1. `MonthlyPulseWidget` counts months from `user.joinedAt`, not from Usership start.
   A free user who upgrades in their 8th month would open at "Month 8". Needs
   `usershipStartedAt`.
2. Pulse dismissal is stored in `localStorage` only — fine for dismissal, but the
   sealed month **must** live server-side (log event) so it survives devices and
   cross-device sync.
3. `generateMemoryStory()` uses at most 30 `answer` logs and ignores
   journal/self-care/check-ins. Month compression needs all five signals scoped to
   the month window.
4. `generateMemoryStory()` returns the string `"No Memory story yet…"` when empty —
   month compression must instead return a SEED-grade line, never an empty state
   (Graceful Degradation doctrine).

### 8.2 Build order (suggested sessions)
```
S1  usershipStartedAt + computeUsershipChapter + unit tests           (no UI)
S2  UsershipMonthWidget (ribbon, glyph row, affirmation)              (visible win)
S3  sealUsershipMonth job + generateMonthCompression + whitelist
S4  MemoryInsightWidget (reads sealed months)
S5  ChapterProgressWidget + density tier binding
S6  Quarter chapters (M3/6/9) + archetype card at M6
S7  Year Book + Letter to M12 + /u/user reveal schedule
```

---

## 9. DESIGN PRINCIPLES FOR THIS SYSTEM

1. **One delivered object per month.** Never just a number going up.
2. **Sealed means sealed.** Past months don't regenerate; that's what makes them memories.
3. **Tenure unlocks, density enriches.** A quiet month is a SEED month, not a lost month.
4. **Show the missing signal, not the score.** One actionable line beats a dashboard.
5. **Then / Now everywhere.** Evolution is only felt in comparison.
6. **Quote the operator.** The truest proof the system listened is their own sentence returned.
7. **The interface tightens as the person matures.** breathable → instrument.

---

*Twelve paragraphs. Four chapters. One page. The operator's year, compressed.*
