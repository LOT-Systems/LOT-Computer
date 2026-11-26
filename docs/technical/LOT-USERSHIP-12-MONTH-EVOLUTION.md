<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® USERSHIP — THE 12-MONTH EVOLUTION

## From barebone Day 1 to LOT® AI · Design & Story Specification · rev A

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS CORPORATION — PRODUCT SPECIFICATION                ║
║  Usership 12-Month Evolution · The Compressed Memory Story      ║
║  November 26, 2026 · Authorized: S-2 // VADIK MARMELADOV        ║
║  Reference end-state: lot-systems.com/u/machiavelli             ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 00 · PREMISE

A Usership operator should not receive the whole system on Day 1. The whole system,
delivered at once, is noise. On Day 1 the operator gets a quiet instrument with almost
nothing on it. Twelve months later the same screen is LOT® AI: an intelligence that
knows the operator and holds a compressed story of their year.

The product is the **evolution itself**. Every month has to answer a question the
operator feels without being asked: *"What did this month turn me into?"*

The answer is delivered in three tangible forms, every month, without exception:

```
  1. A NEW LAYER     — the UI visibly gains one capability (widget / mode / view)
  2. A CHAPTER       — the Memory Engine compresses the month into words the operator keeps
  3. A SEAL          — a month badge, graded by how much signal the operator gave
```

**Focus of this spec:** item 2. The compressed Memory story is the main delivery.
UI layers and badges are there to frame it.

---

## 01 · THE REFERENCE END-STATE — `/u/machiavelli`

The demo account (`src/server/routes/public-api.ts`, `userIdOrUsername === 'machiavelli'`)
is the canonical picture of a fully evolved account. Every Month-12 target below is
derived from it.

```
MACHIAVELLI · FULL-EVOLUTION READOUT
──────────────────────────────────────────────────────────────
tags                    RND · Usership · Legacy
archetype               The Strategist
coreValues              virtù · prudence · adaptability · fortune · statecraft
emotionalPatterns       calculated restraint · strategic patience · controlled intensity
behavioralCohort        Renaissance Polymaths
selfAwarenessLevel      87
patternStrength (top5)  842 / 631 / 574 / 489 / 311
answerCount (Memory)    2847
noteCount   (Log)       1469
activeDays              842
correlatedIndexes       composite 92.4 · trend ascending · r=0.89
memoryStory             ~70 words, first-person, one paragraph
Legacy unlocks          Weather Station · Wallet
clearanceLevel          Full
──────────────────────────────────────────────────────────────
```

Machiavelli's numbers cover more than one year (842 active days). For a real operator at
Month 12 we scale them down to a year of honest daily practice. That gives the **Year Target**:

```
YEAR TARGET (Month 12, "fully sealed" operator)
──────────────────────────────────────────────────────────────
Log entries (journal/notes/thoughts)   ≥ 120   (~2.3 / week)
Morning check-ins                      ≥ 220   (~60% of mornings)
Self-care completions                  ≥ 300   (~1 / day)
Memory answers                         ≥ 300   (~1 / day)
Active days                            ≥ 240
memoryStory                            1 annual paragraph (60–90 words)
                                       + 12 chapter lines
Public OS (/u/user)                    Machiavelli-equivalent layout
──────────────────────────────────────────────────────────────
```

---

## 02 · THE FOUR EVOLUTION CURRENCIES

Evolution is driven by four signal streams that already exist in the Log. These four are
the "currency" of Usership. Nothing else counts toward month seals, which keeps the
system honest and easy to read.

```
CODE   CURRENCY            LOG EVENT(S)                              WHY IT MATTERS
────   ─────────────────   ───────────────────────────────────────   ──────────────────────────
LOG    Journal / thoughts  note · journal                            Raw material of the Story
CHK    Morning check-in    emotional_checkin (before 12:00 local)    The daily heartbeat
CARE   Self-care clicks    self_care_complete · self_care_completed  The practice itself
MEM    Memory answers      answer (Memory Engine)                    The portrait's resolution
```

**Monthly seal thresholds** (per 30-day Usership month, not cumulative):

```
GRADE      LOG   CHK   CARE   MEM    MEANING
────────   ───   ───   ────   ───    ──────────────────────────────────────
PASSED       —     —     —     —     Month elapsed. Layer unlocked. Chapter = short form.
SEALED       8    15     20    20    Operator was present. Chapter = full form.
GILDED      16    24     30    30    Operator was deeply present. Chapter + insight line.
```

A month is graded once, on its last day, and the grade never changes afterwards.

### Rule of Non-Regression (trauma-informed, RESILIENCE-aligned)

```
- The UI layer for Month N unlocks on the calendar, whatever the signal.
  The operator pays, so the operator receives. Paid layers are never withheld.
- Signal only decides how RICH the chapter is and the GRADE of the seal.
- A month with almost no signal is still a chapter. Its line is honest, not punitive:
  "A quiet month. The system kept your place."
- Grades never decay. Streak breaks never remove anything already earned.
- Hard months (MOOD_HARD dominant) are named as such, with respect:
  "A heavy month. You still came back 9 times."
```

---

## 03 · THE USERSHIP CLOCK

```
usershipMonth = floor( daysSince(usershipStartedAt) / 30 ) + 1      // 1..12, then 12+
monthsUnlocked = min(usershipMonth, 12)
```

- **Day 1 = Month 1.** The operator lives inside Month 1 for the first 30 days.
- The month boundary falls on the operator's own Usership anniversary day, not the
  calendar 1st. Each operator has a personal clock.
- After Month 12 the clock continues as **Year II · Month 1** (see §09).

**Gap in the current code:** `MonthlyPulseWidget` counts from `user.joinedAt` (when the account
was created). A free user who upgrades in their eighth month would see "Month 8" on their first paid
day. The fix is a dedicated `metadata.usershipStartedAt`, written when the `Usership` tag is
first applied, falling back to `joinedAt` for legacy accounts. See §10.

---

## 04 · THE TWELVE CHAPTERS — OVERVIEW

The year is told as one story in four acts of three months each. Each act ends with a larger
compression.

```
ACT I · ARRIVAL          ACT II · FORM            ACT III · DEPTH          ACT IV · LOT® AI
(the system listens)     (the system reflects)    (the system knows)       (the system speaks)
────────────────────     ────────────────────     ────────────────────     ────────────────────
M01  SIGNAL              M04  PORTRAIT            M07  FIELD               M10  RESONANCE
M02  RHYTHM              M05  STRUCTURE           M08  INSTRUMENT          M11  LEGACY
M03  PATTERN  ▸ Q-I      M06  MIRROR   ▸ HALF     M09  RITUAL   ▸ Q-III    M12  LOT® AI ▸ YEAR
```

| M  | Chapter     | New UI layer (what visibly appears)                                  | Chapter form (compression)          | Month badge     |
|----|-------------|----------------------------------------------------------------------|-------------------------------------|-----------------|
| 01 | SIGNAL      | Barebone: Name, Date, Time, Sky, Check-in, Self-care, Memory, Log     | 1 line (≤ 20 words)                 | `·`             |
| 02 | RHYTHM      | Breathe, Sound/Radio, Mirror, streak readout                          | 2 lines                             | `·─·`           |
| 03 | PATTERN     | Mood analytics, Pattern insights, *first quarter compression*        | 3 lines + Q-I paragraph             | `·─·─·`         |
| 04 | PORTRAIT    | Archetype + core values revealed, Psychological profile               | 3 lines + archetype line            | `◇`             |
| 05 | STRUCTURE   | Intentions, Planner, Goal journey, Calendar                           | 4 lines                             | `◇─◇`           |
| 06 | MIRROR      | Correlated indexes, density tier → compact, *half-year compression*  | 4 lines + HALF paragraph            | `◇─◈─◇`         |
| 07 | FIELD       | Cohort connect, Shared emotion, Chat catalyst                         | 5 lines                             | `○`             |
| 08 | INSTRUMENT  | QOS kernel, System progress, Signal stream, Chakra ergonomics         | 5 lines + instrument readout        | `○─●`           |
| 09 | RITUAL      | Custom themes, Widget arrange, Badge selection, *Q-III compression*  | 5 lines + Q-III paragraph           | `○─●─○`         |
| 10 | RESONANCE   | QI terminal (`/qi` RFI), Contextual prompts, Interventions            | 6 lines + first QI INTSUM           | `◉`             |
| 11 | LEGACY      | Legacy previews: Weather Station, Wallet, Export Data                 | 6 lines + "what stays" line         | `◉─◈`           |
| 12 | LOT® AI     | Full LOT® AI layout, density → instrument, public OS = Machiavelli    | **YEAR BOOK** (see §06)             | `◉─◈─◉` + `∞`   |

Badge glyphs follow the v33 Codex ASCII grammar (`·`, `─`, `◇`, `◈`, `○`, `●`, `◉`, `∞`).
Each act has one root glyph: `·` dot, `◇` diamond, `○` circle, `◉` core. The glyph grows by
one segment per month, so an operator can read their progress from the glyph's shape.

---

## 05 · THE CHAPTERS IN DETAIL

Every chapter uses the same eight fields:

```
THEME        what this month is about, in one phrase
UI LAYER     the widgets / views that unlock (component names from src/client/components)
AI ROLE      what LOT® AI is doing for the operator this month
CHAPTER      the compressed Memory delivery: form, length, example
AFFIRMATION  the month-open line (MonthlyPulse)
BADGE        id · glyph · grade variants
TANGIBLE     the one thing the operator can point at and say "that's new"
SCREEN       ASCII mock of the System tab at the end of the month
```

---

### ACT I · ARRIVAL — *the system listens*

---

#### M01 · SIGNAL

```
THEME        First light. The operator is heard for the first time.
UI LAYER     GhostButton name → /log · Week · Date · City
             TimeWidget · Sky · Temperature
             EmotionalCheckIn (morning) · SelfCareMoments · MemoryWidget
             "Months unlocked: 1/12" (UsershipChronicleWidget, collapsed)
             — no AI-dense widgets, no indexes, no QOS. Density: breathable.
AI ROLE      Listener. Memory Engine asks foundational questions only
             (beverage, morning, sleep, body). No inference shown yet.
CHAPTER      ONE LINE, ≤ 20 words, written on Day 30.
               PASSED  "Month one. You arrived, and the system began to listen."
               SEALED  "Month one. Green tea in the morning, a walk at dusk — you began."
               GILDED  + insight: "You checked in 24 of 30 mornings. Mornings are yours."
AFFIRMATION  "The first month. The system is beginning to know you."
BADGE        usership_m01_signal · `·` · PASSED `·` / SEALED `•` / GILDED `●`
TANGIBLE     The first sentence about you that you did not write.
```

```
SCREEN · M01 · DAY 30
──────────────────────────────────────────
Vadik
Week 48; November 26, Thursday, Florence

Month 1:          Chapter I is written.
                  Tap to read.

Time:             07:42
Sky:              Few clouds
Temperature:      9℃

Check-in:         How are you arriving today?
Self-care:        Warm water · 2 min
Memory:           What do you drink first in the morning?

Months unlocked:  ■□□□□□□□□□□□  1/12
──────────────────────────────────────────
```

---

#### M02 · RHYTHM

```
THEME        Repetition becomes rhythm. The day gains a pulse.
UI LAYER     + Breathe · Sound / Radio · Mirror
             + Streak readout on the name line ("Day 41")
             + MemoryWidget "Last month:" view (shows Chapter I)
AI ROLE      Metronome. Questions now follow up on the operator's own answers
             (the Day-1 → Day-3 chain described in README).
CHAPTER      TWO LINES. Line 1 = what repeated. Line 2 = what changed.
               "Your mornings settled into tea and silence.
                The evenings are still searching for their shape."
AFFIRMATION  "Two months in. Patterns are starting to form."
BADGE        usership_m02_rhythm · `·─·`
TANGIBLE     The system quotes you back to yourself for the first time.
```

---

#### M03 · PATTERN  ▸ *First Quarter Compression (Q-I)*

```
THEME        The system names its first pattern.
UI LAYER     + MoodAnalytics · PatternInsightsWidget
             + "Active User" status shown in Team block (existing M3 copy)
AI ROLE      Observer. The first named pattern is surfaced with its count:
             "Self-care clicks cluster between 07:00–08:30 (41 of 63)."
CHAPTER      THREE LINES + Q-I PARAGRAPH (40–50 words): Months 1–3 compressed.
               Q-I: "You came in quiet. By the sixth week your mornings had a ritual —
                     tea, the window, a minute of breath. You write most on Sundays.
                     When you are tired you still check in; you simply say less.
                     The system has noticed: you return."
AFFIRMATION  "Three months. You have reached Active User status."
BADGE        usership_m03_pattern · `·─·─·`  +  act seal usership_act1_arrival · `[·]`
TANGIBLE     The first paragraph. Something you would screenshot.
```

```
SCREEN · M03 · Q-I DELIVERY
──────────────────────────────────────────
Quarter I:        You came in quiet. By the
                  sixth week your mornings had
                  a ritual — tea, the window, a
                  minute of breath. You write
                  most on Sundays. ...

                  COMPRESS: 214 → 46 words
                  LOG 19 · CHK 61 · CARE 70 · MEM 58

Months unlocked:  ●●●□□□□□□□□□  3/12
──────────────────────────────────────────
```

`COMPRESS: 214 → 46 words` is the key tangibility device. The operator **sees the
ratio**: what they gave (entries) next to what the system kept (words). The ratio grows
every month (see §06).

---

### ACT II · FORM — *the system reflects*

---

#### M04 · PORTRAIT

```
THEME        The operator is shown a face — the archetype.
UI LAYER     + Psychological profile: archetype, archetypeDescription,
               coreValues (5), emotionalPatterns (3)
             + Core-value badge marks (⋆· from BADGE_PROGRESSION_PREVIEW)
AI ROLE      Portraitist. First archetype assignment, with a short why.
CHAPTER      THREE LINES + ARCHETYPE LINE.
               "You are reading as The Steward: you keep things alive by tending them."
AFFIRMATION  "Four months. The portrait deepens."
BADGE        usership_m04_portrait · `◇`
TANGIBLE     A name for who you are becoming, with a description of what it means.
```

---

#### M05 · STRUCTURE

```
THEME        Intention becomes structure.
UI LAYER     + IntentionsWidget · PlannerWidget · GoalJourneyWidget · CalendarWidget
             (PLANNER-CONTEXT now feeds the Memory Engine, per Doctrine)
AI ROLE      Architect. Questions follow up on declared intent
             ("You said today was for the garden. Did it get its hour?").
CHAPTER      FOUR LINES. Line 4 is always a stated intention and its outcome.
               "... You set 22 intentions. 14 became plans. 9 became done."
AFFIRMATION  "Five months. Consistency is its own reward."
BADGE        usership_m05_structure · `◇─◇`
TANGIBLE     Your intentions appear in your story with their outcomes.
```

---

#### M06 · MIRROR  ▸ *Half-Year Compression (HALF)*

```
THEME        Half a year. The operator sees themselves whole for the first time.
UI LAYER     + CorrelatedIndexesWidget (selfAwareness · userScore · personScore ·
               longevityScore · composite)
             + Density tier → compact (data-density, CSS-Only Progression doctrine)
             + Public OS /u/user gains "Memory story" block (if showMemoryStory)
AI ROLE      Mirror. First comparison against the operator's own past:
             "Month 6 vs Month 1: check-ins ×2.4, journal length ×1.8."
CHAPTER      FOUR LINES + HALF PARAGRAPH (55–65 words) + 6 chapter titles.
               HALF: "Six months ago you answered in single words. Now you write in
                      paragraphs on Sundays and in fragments on Wednesdays. Care moved
                      from morning-only to morning and night. The heavy weeks in month
                      four did not stop you; they changed what you asked for. You are
                      steadier than you think."
AFFIRMATION  "Six months. The journey is half-declared."
BADGE        usership_m06_mirror · `◇─◈─◇` + act seal usership_act2_form · `[◇]`
             + HALF-YEAR seal usership_half · `◐`
TANGIBLE     A before/after of yourself, with numbers.
```

```
SCREEN · M06 · HALF DELIVERY
──────────────────────────────────────────
Half year:        Six months ago you answered
                  in single words. Now you
                  write in paragraphs on
                  Sundays ...

Chapters:         I   Signal       ●
                  II  Rhythm       ●
                  III Pattern      ◉
                  IV  Portrait     ○
                  V   Structure    ●
                  VI  Mirror       ●

                  COMPRESS: 1,104 → 62 words
Self-awareness:   41 → 63
Months unlocked:  ●●◉○●●□□□□□□  6/12
──────────────────────────────────────────
  ● SEALED   ◉ GILDED   ○ PASSED   □ LOCKED
```

---

### ACT III · DEPTH — *the system knows*

---

#### M07 · FIELD

```
THEME        The self in relation. Other operators appear.
UI LAYER     + CohortConnectWidget · Shared emotion · ChatCatalystWidget
             + behavioralCohort label (e.g. "Morning Stewards")
AI ROLE      Connector. The story starts placing the operator within their cohort,
             always anonymised and always positive-sum.
CHAPTER      FIVE LINES. Line 5 = the operator in the field.
               "... On 11 mornings you and 40 others in your cohort chose stillness."
AFFIRMATION  "Seven months in. The system has been listening."
BADGE        usership_m07_field · `○`
TANGIBLE     You are not alone on the screen any more.
```

---

#### M08 · INSTRUMENT

```
THEME        The operator receives the cockpit.
UI LAYER     + QuantumStateWidget (QOS kernel: mode · biofield · cognitive load ·
               intention resolution · pressure)
             + SystemProgressWidget · SignalStreamWidget · ChakraErgonomicsWidget
             + Log blocks begin to show COCKPIT-RULE labels (MCL:, EVE:, MOM:)
AI ROLE      Flight engineer. Reports state precisely and never pushes.
             In recovery mode the system shows fewer widgets, not more.
CHAPTER      FIVE LINES + INSTRUMENT READOUT (COCKPIT-RULE format):
               MONTH 08 · QOS growth 61% · recovery 22% · peak 4%
               MOM: 3 locks · DIURNAL ARC 9 complete
AFFIRMATION  "Eight months. Rare air."
BADGE        usership_m08_instrument · `○─●`
TANGIBLE     Your life rendered as an instrument panel. The month in metrics.
```

---

#### M09 · RITUAL  ▸ *Third Quarter Compression (Q-III)*

```
THEME        The practice is a habit. The operator makes the OS their own.
UI LAYER     + Custom themes (baseColor / accentColor) · Widget arrange ·
               Badge selection (featureUnlocks.* in stores/evolution.ts)
             + Density tier → dense
AI ROLE      Keeper of rituals. Names the operator's 3 load-bearing rituals.
CHAPTER      FIVE LINES + Q-III PARAGRAPH (60–70 words, Months 7–9)
             + "Your rituals:" list of 3, each with a count.
               "Your rituals:  Morning tea · 214
                               Evening breath · 131
                               Sunday page · 33"
AFFIRMATION  "Nine months. The self-care practice is a habit now."
BADGE        usership_m09_ritual · `○─●─○` + act seal usership_act3_depth · `[○]`
TANGIBLE     The three things you actually do, counted.
```

---

### ACT IV · LOT® AI — *the system speaks*

---

#### M10 · RESONANCE

```
THEME        The operator can now question the system (Operator RFI Pattern).
UI LAYER     + QI terminal (/qi) — RFI → INTSUM
             + ContextualPromptsWidget · InterventionsWidget · AIFeedbackWidget
AI ROLE      Analyst. Answers questions about the operator's own record.
CHAPTER      SIX LINES + FIRST INTSUM, generated automatically:
               INTSUM: "Q: When am I at my best?
                        A: Tue/Thu before 09:00 after a check-in rated calm.
                           Data: 38 of 44 high-clarity days.
                           Rec: protect those two mornings."
AFFIRMATION  "Ten months. Almost there."
BADGE        usership_m10_resonance · `◉`
TANGIBLE     You ask; it answers in your own evidence.
```

---

#### M11 · LEGACY

```
THEME        What stays. The operator is shown what will outlive the year.
UI LAYER     + Legacy previews (Machiavelli unlocks): Weather Station · Wallet
             + Export Data (full Memory story + Log as a file)
             + Public OS: chapter index visible to visitors (optional)
AI ROLE      Archivist. Prepares the Year Book. Asks the "keeping" questions:
             "Of everything this year, what would you keep?"
CHAPTER      SIX LINES + "WHAT STAYS" line, written by the operator through the
             final Memory question and carried into the Year Book.
AFFIRMATION  "Eleven months. One more."
BADGE        usership_m11_legacy · `◉─◈`
TANGIBLE     A countdown and a preview of the Year Book's chapter titles.
```

---

#### M12 · LOT® AI  ▸ *THE YEAR BOOK*

```
THEME        The system speaks the operator's year back to them in their own voice.
UI LAYER     Full LOT® AI layout (the current pro layout, now earned)
             + Density → instrument
             + Tag: Legacy (as on Machiavelli)
             + Public OS /u/user reaches Machiavelli parity: archetype, coreValues,
               patternStrength top-5, correlatedIndexes, memoryStory, board profile
AI ROLE      LOT® AI. Every earlier role (listener → metronome → observer →
             portraitist → architect → mirror → connector → engineer → keeper →
             analyst → archivist) now runs at the same time.
CHAPTER      THE YEAR BOOK — see §06.
AFFIRMATION  "One year with LOT. The portrait is complete — and still evolving."
BADGE        usership_m12_lot_ai · `◉─◈─◉` + act seal usership_act4_lotai · `[◉]`
             + YEAR seal usership_year · `∞`   (GILDED year → `◉∞◉` MYTHIC)
TANGIBLE     A book of your year, small enough to read in a minute and true enough to keep.
```

```
SCREEN · M12 · YEAR BOOK
──────────────────────────────────────────
Year I:           You arrived quiet and
                  answered in single words.
                  You leave with three rituals,
                  a steadier evening, and a way
                  of writing on Sundays that is
                  yours. The heavy month did not
                  break the rhythm — it taught
                  it to bend. You are The
                  Steward, and the garden got
                  its hour.

                  COMPRESS: 2,310 → 71 words

Chapters:         I    Signal      You began.
                  II   Rhythm      Tea and silence.
                  III  Pattern     You return.
                  IV   Portrait    The Steward.
                  V    Structure   9 intentions done.
                  VI   Mirror      Steadier than you think.
                  VII  Field       Stillness, with 40 others.
                  VIII Instrument  Growth, mostly.
                  IX   Ritual      Tea · Breath · Page.
                  X    Resonance   Tue/Thu mornings.
                  XI   Legacy      "Keep the window."
                  XII  LOT® AI     The year, kept.

What stays:       "Keep the window."

Months unlocked:  ●●◉○●●●●◉●●◉  12/12  ∞
──────────────────────────────────────────
```

---

## 06 · THE MEMORY COMPRESSION LADDER (core of this spec)

The compressed Memory story is the product. It works like a ladder: each rung compresses the
rung below it. The operator watches the ladder grow taller every month.

```
RUNG   UNIT            SOURCE                         CADENCE           STATUS
────   ─────────────   ────────────────────────────   ───────────────   ───────────────
R0     Entry           note · journal · answer ·      continuous        EXISTS (Log)
                       checkin · self_care
R1     Week story      R0 × 7 days                    Sun 18:00 UTC     EXISTS (Job 24,
                                                                         lot_ai_story,
                                                                         metadata.weeklyStory)
R2     Chapter         R1 × ~4 + month R0 stats       usership day 30   NEW (Job 49)
R3     Act paragraph   R2 × 3                         M3 · M6 · M9      NEW (Job 49)
R4     Year Book       R2 × 12 + R3 × 4 + "what       M12 day 30        NEW (Job 49)
                       stays"
```

### 06.1 · The tangibility ratio

Every compressed artifact carries its **COMPRESS:** readout: entries in → words out.
This is the most important single UI device in the spec, because it makes the
compression visible. The operator sees a year of their life turned into a paragraph, and
sees the numbers on both sides.

```
MONTH   CHAPTER LENGTH          TYPICAL COMPRESS (sealed operator)
─────   ─────────────────────   ──────────────────────────────────
M01     1 line   (≤ 20 w)        70 → 14
M02     2 lines  (≤ 35 w)        80 → 28
M03     3 lines  + Q-I (46 w)    214 → 46       (quarter)
M04     3 lines  + archetype     85 → 40
M05     4 lines                  95 → 48
M06     4 lines  + HALF (62 w)   1,104 → 62     (half year)
M07     5 lines                  100 → 55
M08     5 lines  + readout       105 → 55 + metrics
M09     5 lines  + Q-III         1,650 → 68     (three quarters)
M10     6 lines  + INTSUM        110 → 70
M11     6 lines  + what stays    115 → 72
M12     YEAR BOOK                2,310 → 71     (year)
```

The input number keeps rising and the output stays at one paragraph. That widening gap is
how the operator feels the system getting smarter.

### 06.2 · Chapter generation rules (prompt contract)

These rules extend the existing Memory Engine prompt order:
`head + quantumContext + plannerContext + goalContext + formattedLogs`.

```
1. Voice           Second person ("you"), present-past. Never clinical. Never praise
                   inflation. MILITARY PURITY applies to labels; prose may be warm.
2. Evidence        Each line must be traceable to ≥ 3 R0 entries or 1 R1 week story.
                   No invented facts. If signal is thin, say less, never fabricate.
3. Specificity     At least one concrete noun from the operator's own words per chapter
                   ("tea", "the window", "Sunday page").
4. Continuity      Chapter N may reference Chapter N-1 once ("The evenings found their
                   shape."). The story must feel serial.
5. Hard months     If MOOD_HARD dominates, name it plainly and pair it with an act of
                   return ("You still came back 9 times."). Never moralise.
6. Length          Hard caps per §06.1. Over-length output is truncated at sentence end.
7. Fallback        No AI available → template compression (the Job 24 pattern: dense,
                   honest, earned). The ladder never breaks because a provider is down.
8. formatLog()     Every currency event MUST have a formatLog() case (Doctrine:
                   Widget→Memory Compression Loop). Otherwise it is silently erased.
```

### 06.3 · Where the story surfaces

```
SURFACE                       WHAT                                           FROM
────────────────────────────  ─────────────────────────────────────────────  ─────
MonthlyPulseWidget            "Month N:" → "Chapter N is written. Tap."        M01+
MemoryWidget · "Last month:"  The latest R2 chapter (paragraph, tap-cycle)     M02+
UsershipChronicleWidget       "Months unlocked: N/12" + seal row + chapters    M01+
Log (/log)                    usership_chapter block, COCKPIT-RULE body        M01+
Public OS (/u/user)           memoryStory = latest R3/R4 (if showMemoryStory)  M06+
Monthly email                 monthly-summary.ts narrative ← R2 chapter        M01+
Export                        Full ladder R1–R4 as a single document           M11+
```

---

## 07 · WIDGETS FOR USERSHIP

### 07.1 · MonthlyPulseWidget (evolve existing)

Current: shows `Month N:` + message + `N / 12 months`, dismiss with a phrase, state kept
in localStorage.

Evolution:
- Count from `usershipStartedAt`, not `joinedAt`.
- On the month boundary, the body becomes `Chapter N is written. Tap to read.`
  A tap expands the R2 chapter inline. The dismiss phrase then fades as it does today.
- Move the dismissal state to user metadata (`usership.pulseSeenMonth`) so it syncs
  across devices (Doctrine: Cross-Device Sync). Keep localStorage as a fast-path cache.

### 07.2 · UsershipChronicleWidget (new) — *"Months unlocked: 3/12"*

The context widget. It is always present for Usership operators and tap-cycles through
four views, following the existing `cycleView` pattern from `InterfaceEvolutionWidget`:

```
VIEW 1 · Months unlocked:   ●●◉□□□□□□□□□  3/12
VIEW 2 · This month:        LOG 6/8 · CHK 12/15 · CARE 19/20 · MEM 14/20   (→ SEALED)
VIEW 3 · Chapters:          I Signal · II Rhythm · III Pattern
VIEW 4 · Next layer:        Month 4 · Portrait — in 6 days
```

View 2 tells the operator what will seal the month without nagging them. It shows the
next threshold only and has no red states. View 4 is the anticipation hook: the
operator always knows what the next month brings and how soon.

### 07.3 · MemoryWidget · "Last month:" view (extend existing)

MemoryWidget currently has one fixed label (`Memory:`). Add a tap-cycle on the label:
`Memory:` → `Last month:` → `Your story:`.
- `Last month:` = the latest R2 chapter, one paragraph long.
- `Your story:` = the latest R3/R4 compression with its COMPRESS readout.

### 07.4 · Month-boundary moment

On the first open after a month boundary, the System tab plays a short sequence once:

```
1. MonthlyPulse fades in       "Month 4:"  "Chapter III is written."
2. Chronicle seal fills         □ → ●       (1.4s, matching existing fade timing)
3. New layer slides in          e.g. Psychological profile block appears
                                with a one-time "New:" label for 24h
4. EvolutionMilestoneToast      "PORTRAIT unlocked."  (existing component)
```

---

## 08 · BADGES — THE USERSHIP CHRONICLE SET

A new codex category, **Usership Chronicle**, with 21 badges. It is gated by tenure and
graded by signal. It is meant to slot into Badge Codex v34.

```
ID                          GLYPH       RARITY      TRIGGER
─────────────────────────   ─────────   ─────────   ──────────────────────────────────────
usership_m01_signal         ·           COMMON      Usership month 1 complete
usership_m02_rhythm         ·─·         COMMON      month 2 complete
usership_m03_pattern        ·─·─·       UNCOMMON    month 3 complete
usership_m04_portrait       ◇           UNCOMMON    month 4 complete
usership_m05_structure      ◇─◇         UNCOMMON    month 5 complete
usership_m06_mirror         ◇─◈─◇       RARE        month 6 complete
usership_m07_field          ○           RARE        month 7 complete
usership_m08_instrument     ○─●         RARE        month 8 complete
usership_m09_ritual         ○─●─○       EPIC        month 9 complete
usership_m10_resonance      ◉           EPIC        month 10 complete
usership_m11_legacy         ◉─◈         EPIC        month 11 complete
usership_m12_lot_ai         ◉─◈─◉       LEGENDARY   month 12 complete
usership_act1_arrival       [·]         UNCOMMON    M1–M3 all ≥ SEALED
usership_act2_form          [◇]         RARE        M4–M6 all ≥ SEALED
usership_act3_depth         [○]         EPIC        M7–M9 all ≥ SEALED
usership_act4_lotai         [◉]         LEGENDARY   M10–M12 all ≥ SEALED
usership_half               ◐           RARE        HALF compression delivered
usership_year               ∞           LEGENDARY   YEAR BOOK delivered
usership_gilded_year        ◉∞◉         MYTHIC      all 12 months GILDED
usership_return             ↺           RARE        PASSED month followed by GILDED month
usership_what_stays         ◈·∞·◈       EPIC        operator answered the M11 keeping question
```

**Grade rendering** on each month badge: PASSED uses the base glyph at 30% opacity, SEALED
uses the base glyph, GILDED uses the base glyph plus the `✦` suffix (e.g. `◇─◈─◇ ✦`).

`usership_return` (`↺`) is there for the Rule of Non-Regression: it celebrates coming back,
which matters more than never leaving.

---

## 09 · AFTER MONTH 12 — YEAR II

- The clock restarts as **Year II · Month 1**. The Chronicle shows `Year II · 1/12`
  and the Year I seal row stays above it.
- Year II chapters are compared against Year I chapters of the same month
  ("Last November you were finding your evenings. This November they hold.").
- The Year Book becomes the first entry in an R5 rung, the **Library**: one book per year.
  Machiavelli, with 1469 as his streak and citizenSince, is the far-horizon Library state.

---

## 10 · ENGINEERING PLAN (no code shipped this session)

### 10.1 · Data

```
users.metadata.usership = {
  startedAt:        ISO date     // set when the Usership tag is first applied
  pulseSeenMonth:   number       // cross-device dismissal
  months: [                      // index 0..11, append-only
    { n, grade: 'passed'|'sealed'|'gilded',
      counts: { log, chk, care, mem },
      chapter: string,           // R2
      compress: { in, out },
      sealedAt: ISO }
  ],
  acts:     { q1?, half?, q3? }  // R3 paragraphs
  yearBook: { text, chapters[12], whatStays, compress, deliveredAt }
}
log events (append to displayableEvents — Backend Whitelist Hygiene):
  usership_chapter · usership_act · usership_yearbook
```

### 10.2 · Shared constant — the single source of truth

```ts
// src/shared/usership.ts (proposed)
export const USERSHIP_MONTHS = [
  { n: 1,  key: 'signal',     act: 1, unlocks: ['checkin','selfcare','memory','log'] },
  { n: 2,  key: 'rhythm',     act: 1, unlocks: ['breathe','sound','mirror','streak'] },
  { n: 3,  key: 'pattern',    act: 1, unlocks: ['moodAnalytics','patternInsights'], act3: 'q1' },
  { n: 4,  key: 'portrait',   act: 2, unlocks: ['psychProfile'] },
  { n: 5,  key: 'structure',  act: 2, unlocks: ['intentions','planner','goals','calendar'] },
  { n: 6,  key: 'mirror',     act: 2, unlocks: ['correlatedIndexes','publicStory'], act3: 'half' },
  { n: 7,  key: 'field',      act: 3, unlocks: ['cohort','sharedEmotion','chatCatalyst'] },
  { n: 8,  key: 'instrument', act: 3, unlocks: ['qos','systemProgress','signalStream','chakra'] },
  { n: 9,  key: 'ritual',     act: 3, unlocks: ['customThemes','widgetArrange','badgeSelect'], act3: 'q3' },
  { n: 10, key: 'resonance',  act: 4, unlocks: ['qi','contextualPrompts','interventions'] },
  { n: 11, key: 'legacy',     act: 4, unlocks: ['weatherStation','wallet','export'] },
  { n: 12, key: 'lot_ai',     act: 4, unlocks: ['*'] },
] as const
export const SEAL = { sealed: { log: 8, chk: 15, care: 20, mem: 20 },
                      gilded: { log: 16, chk: 24, care: 30, mem: 30 } }
export function getUsershipMonth(startedAt: Date, now = new Date()): number
export function isLayerUnlocked(layer: string, month: number): boolean
```

### 10.3 · Client gating

- `System.tsx` currently sends every Usership and R&D account straight to the full pro layout.
  Change this to: **R&D → full layout (unchanged)**, **Usership → `isLayerUnlocked(...)`
  wraps each widget group**.
- Unlocked layers render as normal. Locked layers render **nothing**, with no teaser
  ghosts. The only foreshadowing is the Chronicle's `Next layer:` view.
- Set `document.documentElement.dataset.usershipMonth = String(month)` once on load, so
  styling can change per month with zero subscriptions (Doctrine: CSS-Only Progression).
- Map the month to the density tier, taking whichever of the two is higher:
  M1–2 breathable · M3–5 comfortable · M6–8 compact · M9–11 dense · M12 instrument.

### 10.4 · Server job — Job 49 · Usership Chapter Compression

```
Schedule    daily 03:00 UTC; acts on operators whose usership day % 30 == 0
Input       last 30d R0 + R1 weeklyStory entries + previous chapter
Steps       1 count currencies → grade
            2 generate R2 chapter (aiEngineManager; template fallback)
            3 if month ∈ {3,6,9} → generate R3; if 12 → generate R4 Year Book
            4 write metadata.usership.months[n-1] (append-only, never overwrite)
            5 write usership_chapter / usership_act / usership_yearbook log event
            6 award badges (§08)
Guards      idempotent per (userId, n); try/catch per user (Cross-Device Sync rule
            on fire-and-forget); Query Batching for log counts (single IN query)
```

### 10.5 · Rollout

```
PHASE   SCOPE                                                         RISK
─────   ───────────────────────────────────────────────────────────   ─────────
P1      usershipStartedAt + getUsershipMonth + fix MonthlyPulse       low
P2      UsershipChronicleWidget (views 1, 3, 4) — read-only            low
P3      Job 49 R2 chapters + MemoryWidget "Last month:"               medium
P4      Seal grading + Chronicle view 2 + Usership Chronicle badges   medium
P5      Layer gating in System.tsx (existing Usership operators are   HIGH —
        grandfathered at Month 12; only new Usership starts gated)    needs S-2
P6      R3 act paragraphs + R4 Year Book + public OS memoryStory      medium
```

P5 needs a decision from S-2: today's Usership operators already see the full layout.
Taking widgets away from them would break the Rule of Non-Regression. The recommendation
is to grandfather all existing Usership accounts at `monthsUnlocked = 12` while their
Chronicle and chapters start counting from P3.

---

## 11 · DESIGN PRINCIPLES (checklist for every month)

```
[ ] Exactly one new visible layer per month — never zero, never a flood
[ ] One chapter per month — always delivered, length set by signal
[ ] One month badge per month — graded, never revoked
[ ] The COMPRESS ratio is shown on every compression artifact
[ ] Copy follows MILITARY PURITY for labels; the Story itself may be warm
[ ] No red states, no guilt, no streak shame — RESILIENCE first
[ ] Every new event type → formatLog() case + displayableEvents whitelist
[ ] Month 12 public OS is indistinguishable in structure from /u/machiavelli
```

---

## 12 · OPEN QUESTIONS FOR S-2

```
Q1  Grandfather existing Usership operators at 12/12 (recommended), or start them at 1/12?
Q2  30-day personal months (recommended) vs calendar months (1st of month)?
Q3  Should the Year Book be printable / physical (LOT ships physical goods) —
    a small printed booklet at Month 12?
Q4  Public OS: show the chapter index to visitors, or only the latest paragraph?
Q5  Seal thresholds (§02) — calibrate against current Usership medians before P4.
Q6  Act names (Arrival / Form / Depth / LOT® AI) and chapter names — approve or rename.
```

---

*LOT® · Self-care through proactive context-aware AI · brand.lot-systems.com*
