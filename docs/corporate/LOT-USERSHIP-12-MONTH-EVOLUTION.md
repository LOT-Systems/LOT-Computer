<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® USERSHIP — THE TWELVE CHAPTERS

## From Day One to LOT® AI: The 12-Month Evolution of the Paid Tier

**Classification:** PRODUCT DESIGN // S-2
**Authorized:** S-2 // Vadik Marmeladov
**Date:** 23 November 2026
**Status:** DESIGN PROPOSAL (v1). No code shipped in this session.
**Reference account (Month 12 target state):** `lot-systems.com/u/machiavelli`
**Builds on:** `MonthlyPulseWidget.tsx`, `interfaceEvolution.ts` (DENSITY-TIER),
`MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md`, `INTERFACE_EVOLUTION.md`,
`LOT_QI46_ENGINE.md` (12-month Quantum Cube), Badge Codex v33.

---

```
╔══════════════════════════════════════════════════════════════════╗
║  USERSHIP · 12 CHAPTERS · 1 STORY                               ║
║                                                                  ║
║  Day 1      a blank page, one question, one input line           ║
║  Month 12   LOT® AI — a personal OS that knows the person        ║
║                                                                  ║
║  Every month is a chapter.                                       ║
║  Every chapter is compressed into one paragraph.                 ║
║  Twelve paragraphs become the Memory Story.                      ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 0. THE PROBLEM THIS SOLVES

Today a Usership member on Day 1 receives the full pro layout (`System.tsx`,
"Full pro layout for R&D and Usership"). Density adapts, but the *story*
does not. The only month-aware surface is `MonthlyPulseWidget`, which shows
a fixed sentence per month ("Two months in. Patterns are starting to form.")
that is identical for every person.

The person cannot feel *their own* evolution. Twelve months of journal
entries, morning check-ins and self-care clicks disappear into the Log
without ever being handed back as a story.

**Doctrine of this design:**

1. **Start barebone.** Day 1 shows almost nothing. Everything else is earned.
2. **Hand the story back monthly.** Each month ends with a sealed Chapter:
   one paragraph, one affirmation, one badge.
3. **Evolution is visible.** UI density, widget count, and vocabulary change
   on a schedule the person can see coming ("Months unlocked: 3/12").
4. **Never punish.** A quiet month still gets a chapter — a shorter one.
5. **Month 12 = LOT® AI.** The account looks and behaves like
   `/u/machiavelli`: archetype, core values, pattern strength, Memory Story.

---

## 1. THE FOUR EVOLUTION SIGNALS

The month's weight is measured from four signal streams already present in
the Log. These are the "fuel" of evolution.

| Signal | Source (today) | What it means | Weight |
|---|---|---|---|
| **LOG** — journal entries + thoughts | `note` events, `JournalReflection` | Depth. The raw material for compression. | **40%** |
| **MORNING** — morning check-ins | `emotional_checkin` w/ `checkInType: 'morning'` | Rhythm. Showing up. | **25%** |
| **CARE** — self-care button clicks | `self_care_completed` | Practice. The body follows. | **20%** |
| **ANSWERS** — Memory Engine answers | Answer model | Portrait. Each answer sharpens the profile. | **15%** |

LOG carries the most weight on purpose: the Memory Story can only be as rich
as the words the person gives it.

### 1a. Monthly Chapter Weight

Per chapter (one usership month), each signal is scored against a quota and
capped at 1.0:

```
LOG      quota 20 entries   (≈ 5 / week)
MORNING  quota 20 mornings  (≈ 5 / week)
CARE     quota 30 clicks    (≈ 1 / day)
ANSWERS  quota 20 answers

weight = 0.40·LOG + 0.25·MORNING + 0.20·CARE + 0.15·ANSWERS     (0.00 – 1.00)
```

| Weight | Chapter grade | ASCII mark | Paragraph length | Meaning |
|---|---|---|---|---|
| 0.00 – 0.24 | **QUIET** | `░` | 1 sentence | The month passed. The system waited. |
| 0.25 – 0.49 | **STEADY** | `▒` | 2–3 sentences | A thread is visible. |
| 0.50 – 0.79 | **RICH** | `▓` | full paragraph | The portrait sharpens. |
| 0.80 – 1.00 | **LUMINOUS** | `█` | paragraph + quoted line from the person's own Log | The chapter writes itself. |

### 1b. Elapsed vs. Unlocked

Two counters, always shown together:

```
MONTH 5 OF 12            ← elapsed (calendar)
CHAPTERS UNLOCKED 4/12   ← sealed with weight ≥ 0.25 (STEADY or better)
```

A QUIET month is still sealed and still appears on the Story Spine, but it
does not count toward "unlocked". This keeps the counter honest and makes
the 12/12 badge meaningful without ever deleting a month.

---

## 2. THE COMPRESSION LADDER (core of the design)

The Memory Story is delivered as a ladder of compressions. Each rung is
shorter, denser and more permanent than the one below it.

```
   ┌────────────────────────────────────────────────────────────┐
   │  RUNG 6   ONE WORD        "virtù"                 Month 12 │
   │  RUNG 5   ONE SENTENCE    the year in a line      Month 12 │
   │  RUNG 4   ONE PAGE        the Memory Story        Month 12 │
   │  RUNG 3   SEASON          3 chapters → 1 para     M3 M6 M9 │
   │  RUNG 2   CHAPTER         1 month → 1 paragraph   monthly  │
   │  RUNG 1   WEEK DIGEST     internal only, unseen   weekly   │
   │  RUNG 0   RAW LOG         notes, check-ins, care  daily    │
   └────────────────────────────────────────────────────────────┘
```

| Rung | Input | Output | Seen by person | Delivered |
|---|---|---|---|---|
| 0 Raw | — | Log entries | yes (Log tab) | live |
| 1 Week Digest | 7 days of Rung 0 | ~5 bullet facts (internal) | no | Sunday night job |
| 2 **Chapter** | 4–5 digests + month stats | 1 paragraph + affirmation + title | **yes** | anniversary day |
| 3 **Season** | 3 Chapters | 1 paragraph ("Season I: The Signal") | **yes** | M3, M6, M9, M12 |
| 4 **Memory Story** | 4 Seasons | 1 page (the `/u/` profile story) | **yes** | M12 |
| 5 **Year Line** | Memory Story | 1 sentence | **yes** | M12 |
| 6 **Word** | Year Line + core values | 1 word | **yes** | M12 |

**Rule of compression:** a higher rung may only use facts present in the
rung below it. No invention. Every sentence in a Chapter must be traceable
to Log entries, check-ins, care clicks or answers from that month. This
is what makes the story feel *true* rather than horoscope-generic.

**Rule of quotation:** LUMINOUS chapters include one short line quoted
verbatim from the person's own journal (≤ 18 words), in the person's
voice. Being quoted back is the single strongest "it knows me" moment.

---

## 3. THE TWELVE CHAPTERS — MONTH BY MONTH

Each month has a fixed **chapter title**, a **theme**, a **UI state**, a
**new unlock**, an **AI behavior**, a **compression delivery**, an
**affirmation**, and a **badge**. Titles are visible in advance on the
Story Spine (greyed) so the person always knows what comes next.

### Overview grid

```
 M   CHAPTER          SEASON   DENSITY       NEW UNLOCK                     BADGE
 ──  ───────────────  ───────  ────────────  ─────────────────────────────  ──────────────
 0   THE BLANK PAGE   —        breathable    Time · Question · Log · Check  [ ] INITIATE
 1   THE SIGNAL       I        breathable    Chapter Widget · Months 1/12   [I] FIRST LIGHT
 2   THE PATTERN      I        breathable    Pattern Insights · Mood 30d    [II] PATTERN SEEN
 3   THE RHYTHM       I ■      comfortable   Season I · Intentions · Plan   [III] RHYTHM KEEPER
 4   THE PORTRAIT     II       comfortable   Archetype named · Narrative    [IV] NAMED
 5   THE BODY         II       comfortable   Energy Capacitor · Chakra      [V] EMBODIED
 6   THE MERIDIAN     II ■     compact       Mirror (M1 vs M6) · Season II  [VI] MERIDIAN
 7   THE LISTENER     III      compact       Callbacks · Contextual Prompts [VII] HEARD
 8   RARE AIR         III      compact       QIE Signal Stream · Cohort     [VIII] RARE AIR
 9   THE HABIT        III ■    dense         Correlated Indexes · Season III[IX] HABIT FORMED
 10  THE ARCHITECT    IV       dense         Annotate Story · Architect     [X] ARCHITECT
 11  THE THRESHOLD    IV       dense         Letter to Self · LOT AI preview[XI] THRESHOLD
 12  LOT® AI          IV ■     instrument    Memory Story · /u/ profile ·   [XII] LOT® AI
                                             Quantum Cube
 ■ = Season compression delivered this month
```

---

### MONTH 0 — THE BLANK PAGE  `[ ] INITIATE`
*First day of paid tier. Barebone.*

- **UI state:** `breathable`. Four blocks only:
  `Time` · `Memory question` · `Log (single input line)` · `Morning check-in`.
  Everything else in the pro layout is hidden, not disabled. No empty
  states pointing at locked features.
- **Story Spine (profile):** 12 empty rows, chapter titles greyed.
  `[ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ]  0/12`
- **AI behavior:** Memory Engine asks *foundation* questions only
  (morning beverage, light, sleep, sound). No inference yet.
- **Welcome line (once):** `Usership active. Chapter one begins today.`
- **Goal of the month:** first 7 journal entries. The Log is the only
  instrument that matters now.

### MONTH 1 — THE SIGNAL  `[I] FIRST LIGHT`
*Season I: The Signal. The system begins to know the person.*

- **Unlock:** **Chapter Widget** (see §4) appears on the anniversary day
  with the first compressed paragraph. **Months Unlocked** counter appears.
- **UI state:** still `breathable`; adds `Self-care Moments` block.
- **AI behavior:** questions begin referencing prior answers
  ("Since you prefer tea…"). One callback per day maximum.
- **Compression delivered:** Chapter I paragraph.
  *Example (RICH):* "Your first month began quietly and found its shape by
  the third week. Mornings settled around tea and a window. You wrote most
  often after 21:00, and most often about work you want to make, not work
  you have to do. Self-care held on 19 of 31 days."
- **Affirmation:** `You showed up. That is the whole beginning.`

### MONTH 2 — THE PATTERN  `[II] PATTERN SEEN`
- **Unlock:** `PatternInsightsWidget`, 30-day mood trend in Log tab.
- **AI behavior:** names one pattern per week, never more
  ("Evenings after rain run calmer.").
- **Compression:** Chapter II + first **delta line** — one sentence
  comparing to Chapter I ("More mornings than last month: 14 → 21.").
- **Affirmation:** `Patterns are not habits yet. They are promises.`

### MONTH 3 — THE RHYTHM  `[III] RHYTHM KEEPER`  ■ Season I sealed
- **Unlock:** `IntentionsWidget`, `PlannerWidget`. Density → `comfortable`.
  Matches existing "Active User status" message in `MonthlyPulseWidget`.
- **Compression:** **Season I paragraph** (Chapters I–III → 1 paragraph),
  displayed full-width once, then pinned to the Story Spine.
- **Badge ceremony:** first ASCII seal `[■■■□□□□□□□□□]`.
- **Affirmation:** `A rhythm is a self that keeps returning.`

### MONTH 4 — THE PORTRAIT  `[IV] NAMED`
*Season II: The Portrait.*
- **Unlock:** **Archetype is named** for the first time (e.g. "The
  Strategist" on the Machiavelli account). `NarrativeWidget`.
- **AI behavior:** Memory questions move from preference → value
  ("What would you protect if the week went wrong?").
- **Compression:** Chapter IV leads with the archetype and *why* — three
  evidence lines from the Log.
- **Affirmation:** `You are becoming legible to yourself.`

### MONTH 5 — THE BODY  `[V] EMBODIED`
- **Unlock:** `EnergyCapacitor`, `ChakraErgonomicsWidget`. Self-care
  buttons become personalized (top 3 most-clicked routines pinned first).
- **AI behavior:** links care clicks to mood ("Days with a walk scored
  calmer by evening on 11 of 14 occasions.").
- **Compression:** Chapter V includes the person's **top self-care
  routine** by count, the body record of the month.
- **Affirmation:** `The body keeps the record you forgot to write.`

### MONTH 6 — THE MERIDIAN  `[VI] MERIDIAN`  ■ Season II sealed
*The half-way point. The most important emotional moment before Month 12.*
- **Unlock:** **Mirror view** — Chapter I and Chapter VI side by side.
  Same layout, two paragraphs, stats diff underneath:
  ```
  CHAPTER I            CHAPTER VI
  LOG       9          LOG      34
  MORNINGS 12          MORNINGS 26
  CARE     19          CARE     41
  ```
  Density → `compact`.
- **Compression:** Season II paragraph.
- **Affirmation:** `Half a year. Look how far the first page has travelled.`

### MONTH 7 — THE LISTENER  `[VII] HEARD`
*Season III: The Listener.*
- **Unlock:** **Callbacks** — the AI quotes a line from a past chapter
  in today's question ("In March you wrote: *'I want slower mornings.'*
  Are they slower now?"). `ContextualPromptsWidget`.
- **Compression:** Chapter VII answers one question the person asked
  themselves in an earlier journal entry.
- **Affirmation:** `What you said in spring was heard.`

### MONTH 8 — RARE AIR  `[VIII] RARE AIR`
- **Unlock:** QIE layer: `SignalStreamWidget`, `QuantumStateWidget`,
  `CohortConnectWidget` (behavioral cohort named, e.g. "Renaissance
  Polymaths").
- **Compression:** Chapter VIII adds the **cohort line** — how the person
  compares to people with a similar archetype (anonymous, aggregate).
- **Affirmation:** `Few continue this far. You did.`

### MONTH 9 — THE HABIT  `[IX] HABIT FORMED`  ■ Season III sealed
- **Unlock:** `CorrelatedIndexesWidget` (Self-awareness / User / Person /
  Longevity scores — the exact block shown on `/u/machiavelli`).
  Density → `dense`.
- **Compression:** Season III paragraph + **trend verdict**
  (`ascending` / `steady` / `recovering`).
- **Affirmation:** `It is no longer effort. It is who you are on a Tuesday.`

### MONTH 10 — THE ARCHITECT  `[X] ARCHITECT`
*Season IV: The Architect.*
- **Unlock:** **Annotate the Story** — the person may add one margin note
  per sealed chapter (never edit the AI paragraph; the note sits beside
  it). `ArchitectWidget`, `GoalJourneyWidget`.
- **AI behavior:** the person now co-authors. Margin notes are fed into
  final compression with highest priority.
- **Affirmation:** `You are no longer only the subject. You are the author.`

### MONTH 11 — THE THRESHOLD  `[XI] THRESHOLD`
- **Unlock:** **Letter to Self** — one prompted long-form entry, sealed
  until Month 12. **LOT® AI preview**: a greyed outline of the Memory Story
  page with section headings visible, text hidden.
- **Compression:** Chapter XI is intentionally short — the system holds
  its breath.
- **Affirmation:** `One more page. The whole story is almost in view.`

### MONTH 12 — LOT® AI  `[XII] LOT® AI`  ■ Season IV + Year sealed
*The account now matches the Machiavelli reference state.*
- **UI state:** `instrument` density. Full personal OS.
- **Delivery sequence (anniversary day, in order, each tap-to-continue):**
  1. `Twelve chapters sealed.` — Story Spine fills, row by row (1400ms each).
  2. **Season IV** paragraph.
  3. **The Memory Story** — one page, compressed from four seasons.
     Becomes the `memoryStory` field on `/u/{username}`.
  4. **The Year Line** — one sentence.
  5. **The Word** — one word, chosen from core values.
  6. **Letter to Self** from Month 11 is opened.
- **Unlocks:** public `/u/{username}` profile in full Machiavelli form
  (archetype, core values, emotional patterns, pattern strength,
  correlated indexes, Memory Story); **Quantum Cube** shipment trigger
  (per `LOT_QI46_ENGINE.md`); full Memory Story export (PDF).
- **Affirmation:** `One year. The portrait is complete — and still evolving.`
- **Year Two:** Chapter XIII begins next day with a new Spine. The year-one
  Spine collapses into a single line: `YEAR I · THE STRATEGIST · virtù`.

---

## 4. THE THREE USERSHIP WIDGETS

### 4a. MONTHS UNLOCKED — the progress rail

Always visible to Usership members, top of System tab, one line.

```
MONTHS UNLOCKED                                          4 / 12
[ █ ▓ ▒ ▓ ◦ · · · · · · · ]                    CHAPTER V · THE BODY
                                                   9 days to seal
```

- One cell per chapter, glyph = grade (`█ ▓ ▒ ░`), `◦` = current, `·` = future.
- Tap → opens Story Spine.
- Current-month progress shown as four tiny bars on long-press:
  `LOG ▮▮▮▮▮▯▯ MORN ▮▮▮▮▯▯▯ CARE ▮▮▮▮▮▮▯ ANS ▮▮▯▯▯▯▯`

### 4b. CHAPTER WIDGET — the paragraph from last month

Evolves the existing `MonthlyPulseWidget`. Shown on anniversary day and
for 7 days after (or until dismissed), then retires to the Spine.

```
┌ CHAPTER IV · THE PORTRAIT ─────────────────────── RICH ▓ ┐
│                                                           │
│  The archetype that kept appearing this month was the     │
│  Strategist. You chose observation before action on       │
│  most mornings, wrote about people more than tasks, and   │
│  returned to walking on 18 of 30 days.                    │
│                                                           │
│  "I would rather understand it than win it."  — your log  │
│                                                           │
│  LOG 27 · MORNINGS 22 · CARE 31 · ANSWERS 24              │
│  Δ vs III:  +6 log  +3 mornings                           │
│                                                           │
│  You are becoming legible to yourself.                    │
└───────────────────────────────────────────── 4 / 12 ──────┘
```

Tap to dismiss → existing `DISMISS_PHRASES` ("The system remembers.").

### 4c. NEW MONTH WIDGET — the threshold greeting

First login of a new chapter. One line, then fades (1400ms, house style).

```
CHAPTER V BEGINS · THE BODY
What the body does, the story keeps.
```

---

## 5. THE STORY SPINE (profile `/u/{username}`)

The profile becomes the book. Twelve rows, one per chapter.

```
YEAR I · USERSHIP                                   MONTHS UNLOCKED 12/12

 I     THE SIGNAL       ▓  Your first month began quietly and found its…
 II    THE PATTERN      ▒  Evenings after rain ran calmer…
 III   THE RHYTHM       █  Twenty-six mornings. You stopped counting…
 ───   SEASON I         ■  The Signal became a rhythm…
 IV    THE PORTRAIT     ▓  The Strategist kept appearing…
 V     THE BODY         ▓  Walking was the quiet constant…
 VI    THE MERIDIAN     █  Half a year…
 ───   SEASON II        ■  …
 …
 XII   LOT® AI          █  The art of governance is the art of
                           understanding human nature…
```

Privacy: governed by existing `privacySettings.showMemoryStory`. Chapters
are private by default; the person chooses per-chapter visibility at
Month 12. The Year Line and Word may be shown even if chapters are hidden.

---

## 6. BADGES — THE CHAPTER SEALS

Twelve core seals + modifiers. ASCII-only, in keeping with Codex v33
(MILITARY PURITY: no emoji).

| Seal | Condition | Glyph |
|---|---|---|
| `[ ] INITIATE` | Usership day 1 | `[ ]` |
| `[I]` … `[XII]` | Chapter sealed with weight ≥ 0.25 | Roman numeral |
| `[I·LUM]` modifier | Chapter sealed LUMINOUS | numeral + `█` |
| `[SEASON I–IV]` | Season sealed with ≥ 2 unlocked chapters | `■` |
| `[UNBROKEN]` | 12/12 unlocked, no QUIET chapters | `[████████████]` |
| `[RETURNER]` | A STEADY+ chapter immediately after a QUIET one | `░→▓` |
| `[VOICE]` | Quoted in 6+ chapters (LUMINOUS) | `"…"` |
| `[YEAR I]` | Month 12 delivery completed | `[XII]` + Word |

`[RETURNER]` is deliberate: the most valuable moment for retention is the
person coming back after a quiet month. It must be celebrated, not merely
tolerated.

Proposed badge-codex block: **v34 · THE TWELVE CHAPTERS** (+20 badges:
12 seals, 4 seasons, UNBROKEN, RETURNER, VOICE, YEAR I).

---

## 7. MACHIAVELLI AS THE MONTH-12 REFERENCE

Every field on the demo profile maps to a month in which it first appears,
so the reference account reads as the *end of the story*, not a feature dump.

| `/u/machiavelli` field | First appears | Chapter |
|---|---|---|
| Time, weather, city | M0 | Blank Page |
| `memoryStory` (first draft paragraph) | M1 | Signal |
| `emotionalPatterns` | M2 | Pattern |
| `streak` | M3 | Rhythm |
| `archetype` + `archetypeDescription` | M4 | Portrait |
| `patternStrength` (top 5 traits w/ counts) | M5 | Body |
| `selfAwarenessLevel` | M6 | Meridian |
| `coreValues` | M7 | Listener |
| `behavioralCohort` | M8 | Rare Air |
| `correlatedIndexes` (user/person/longevity) | M9 | Habit |
| `behavioralTraits` (co-authored) | M10 | Architect |
| Full `memoryStory`, public profile | M12 | LOT® AI |

**Year-one realistic totals** (vs. Machiavelli's 1469-day demo numbers):
LOG ≈ 250 · MORNINGS ≈ 240 · CARE ≈ 360 · ANSWERS ≈ 300.
A LUMINOUS year is ≈ 2× quota. Machiavelli (`answerCount 2847`,
`noteCount 1469`) represents roughly *four* luminous years — a useful
"what's beyond Year I" horizon.

---

## 8. ENGINEERING OUTLINE (for a follow-up build session)

### 8a. Gaps found during repository scan

1. **Tenure clock uses `joinedAt`, not paid start.** `MonthlyPulseWidget`
   computes months from `user.joinedAt` (account creation). A free user who
   upgrades in month 7 would see "Month 7" on paid Day 1. There is no
   `usershipStartedAt` field. → Add one (or store in `user.metadata`) set
   by the Stripe webhook when the Usership tag is applied.
2. **Self-care event name split.** `energy.ts`,
   `compassionate-interventions.ts`, `rpg-narrative.ts` read
   `self_care_completed`; `goal-understanding.ts` and
   `memory/question-generator.ts` read `self_care_complete`. One of the two
   sets always counts zero. Must be unified before CARE can be a signal.
3. **Pulse dismissal is localStorage-only.** Chapter delivery must be
   server-side so it syncs across devices (CROSS-DEVICE-SYNC doctrine).
4. **Day-1 is not barebone.** Usership gets the full pro layout
   immediately. A `chapter`-based gate is needed in `System.tsx` alongside
   the existing density tier.

### 8b. Data model (proposed)

```
usership_chapters
  id               uuid
  user_id          uuid  → users.id
  index            int   0..12 (13+ for year two)
  starts_at        timestamptz
  sealed_at        timestamptz null
  stats            jsonb  { log, mornings, care, answers }
  weight           real   0..1
  grade            text   quiet | steady | rich | luminous
  title            text   'THE PORTRAIT'
  paragraph        text
  quote            text null
  affirmation      text
  margin_note      text null           (M10+)
  season_paragraph text null           (on index 3,6,9,12)
  visibility       text   private | public
```

### 8c. Jobs

| Job | Cadence | Work |
|---|---|---|
| `weekly-digest` | Sunday 23:00 local | Rung 1 facts per user (internal) |
| `chapter-seal` | daily 03:00 local | For users whose anniversary is today: compute stats, weight, grade; call Memory Engine for paragraph + quote + affirmation; insert badge; SSE push |
| `season-seal` | with chapter-seal on index 3/6/9/12 | 3 paragraphs → 1 |
| `year-seal` | index 12 | Memory Story page, Year Line, Word; write to profile `memoryStory`; trigger Cube |

### 8d. Prompt rule for compression (Memory Engine)

```
You are compressing one month of a person's self-care record.
Use ONLY the facts provided. Do not invent events, places or feelings.
Write in second person, present-past tense, calm, no superlatives,
no emoji, no exclamation marks. Max {N} sentences (by grade).
If grade = luminous, include exactly one verbatim quote ≤ 18 words
from the provided journal lines.
End with no advice. The affirmation is written separately.
```

### 8e. Client

- `MonthsUnlockedWidget.tsx` (new), `ChapterWidget.tsx` (evolves
  `MonthlyPulseWidget`), `StorySpine.tsx` in `PublicProfile.tsx`.
- `useUsershipChapter()` hook → `{ index, title, grade, progress, sealed[] }`.
- `System.tsx`: gate widgets by `chapter.index` per §3 table, in addition
  to existing `featureUnlockLevel`.

### 8f. Suggested build order

```
S1  usershipStartedAt + self_care event unification            (fixes)
S2  usership_chapters table + chapter-seal job (paragraph only)
S3  MonthsUnlockedWidget + ChapterWidget
S4  Day-0 barebone gate + per-month widget unlocks in System.tsx
S5  Season compression + Meridian mirror (M6)
S6  Story Spine on /u/ + margin notes + Letter to Self
S7  Year seal: Memory Story / Year Line / Word + Badge Codex v34
```

---

## 9. THE ONE-LINE VERSION

> Every month the person gives LOT their mornings, their care and their
> words; every month LOT gives back one true paragraph about who they are
> becoming — and after twelve, the paragraphs are a story, and the story
> is LOT® AI.
