<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

```
================================================================================
LOT SYSTEMS / PRODUCT SPEC
DOCUMENT: USERSHIP-12-MONTH-EVOLUTION  rev A
TITLE:    Usership Year One — 12-month UI evolution to LOT® AI
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-27
STATUS:   DESIGN PROPOSAL — nothing in sections 03-09 is shipped unless marked EXISTS
================================================================================
```

Companion file: `USERSHIP-MACHIAVELLI-YEARBOOK.md` (sample copy + demo fixture).

---

## 00 // THE STORY IN ONE PAGE

A Usership operator pays $99/month for 12 months. On day one they get a bare
instrument: four widgets, wide spacing, one quiet sentence. Twelve months later
they own a dense personal OS and a **Year Book** — twelve compressed chapters of
their own life, written by the machine from what they logged.

The product promise, in the operator's terms:

```
  DAY 1      "It is empty. It is waiting."
  MONTH 3    "It has noticed me."
  MONTH 6    "It can describe me."
  MONTH 9    "It asks me better questions than I ask myself."
  MONTH 12   "It remembers my year in one sentence — and it is right."
```

Mechanism = the existing Compression Loop (LOT-AI-PRODUCT-BRIEF):

```
  LOG -> OBSERVE -> COMPRESS -> ASK -> COMPRESS AGAIN
```

Stretched across a year, the loop becomes four quarters:

```
  Q1  M1-M3    OBSERVE   the machine learns you        (it mostly listens)
  Q2  M4-M6    MIRROR    the machine reflects you      (it describes)
  Q3  M7-M9    GUIDE     the machine asks you first    (it asks)
  Q4  M10-M12  CARRY     the machine carries you       (it remembers + exports)
```

---

## 01 // DESIGN RULES

```
R1  CALENDAR SETS THE CEILING, BEHAVIOR SETS THE RICHNESS.
    A month unlocks on its date; it cannot be rushed. What the month contains
    (chapter depth, density, badges) is earned from entries, check-ins, self-care.
R2  NEVER FABRICATE. A quiet month yields a short, honest chapter, not filler.
R3  NO PUSH. LOT® AI speaks only inside the OS (widgets, ceremony). Per brief:
    "The system waits. It does not push."
R4  ONE VOICE CHANGE PER QUARTER. The AI's register shifts at M1, M4, M7, M10.
R5  EVERY MONTH LEAVES A KEEPSAKE: one chapter, one seal, one line.
R6  COUNTABLE EVERYWHERE. Show real numbers ("212 signals -> 84 words"), never
    a made-up score.
R7  MILITARY PURITY (lexicon): no emojis, no superlatives, no decoration.
```

---

## 02 // INPUTS: WHAT THE USER FEEDS THE MACHINE

Three countable streams. Together: **Month Mass** (proposed).

```
STREAM           SOURCE (EXISTS)                        WEIGHT
───────────────  ─────────────────────────────────────  ──────
Log entries      Logs tab: note / journal / thoughts     1
Check-ins        EmotionalCheckIn (morning biofield)     2
Self-care        SelfCareMoments button clicks           1

MONTH MASS = entries + 2*check-ins + self-care           (PROPOSED weights)
```

Chapter depth is chosen from Month Mass (PROPOSED thresholds, tune on real data):

```
MASS        CHAPTER TYPE   LENGTH     TONE
─────────   ────────────   ────────   ──────────────────────────────────────
  0-14      SKETCH         <= 35 w    "A quiet month. The system waited."
 15-59      CHAPTER        <= 90 w    standard reflection
 60-149     DEEP CHAPTER   <= 140 w   adds a pattern + a contradiction
150+        FULL CHAPTER   <= 180 w   adds a thread to a prior month
```

### Log Mass ladder (lifetime entries — the tangible "journal grows" meter)

```
ENTRIES   UNLOCKS IN THE LOG TAB (PROPOSED)                 TYPICAL MONTH
───────   ────────────────────────────────────────────────  ────────────
   1      Seal: FIRST LINE
  10      Entry count shown ("10 lines")                     M1
  30      Search + date jump                                 M1-M2
  75      Tag cloud of recurring words                       M3
 150      ECHOES: an old entry resurfaces ("90 days ago")    M4-M5
 300      THREADS + QUOTE MODE: themes link; AI quotes you   M6-M7
 600      CONCORDANCE: your own vocabulary, ranked           M9
1000      FULL RECALL: whole-corpus retrieval for the AI     M12
```

### Habit ladders

```
MORNING CHECK-IN STREAK   7 / 21 / 50 / 100 / 200 / 365      -> seals
SELF-CARE CLICKS          10 / 50 / 150 / 300 / 500          -> seals
ACTIVE DAYS               matches assembly phase thresholds  (EXISTS, see 03)
```

---

## 03 // WHAT ALREADY EXISTS (reuse, do not rebuild)

```
ASSET                         WHERE                                  USE HERE
────────────────────────────  ─────────────────────────────────────  ───────────────────
MonthlyPulseWidget            client/components/MonthlyPulseWidget   M1-M12 one-liners,
                              Usership-only, "Month N:" block        dismiss phrases.
                                                                     Becomes Chapter card.
Layout density, 5 levels      utils/interfaceEvolution.ts            breathable ->
                              visualRefinement = 0.4*consistency     comfortable ->
                              + 0.3*depth + 0.3*level                compact -> dense ->
                              thresholds .15/.35/.55/.75             instrument
Assembly phase                routes/public-api.ts ~L1324            dormant -> awakening
                              (events, logs, active days)            -> forming ->
                                                                     assembled -> integrated
Monthly summary generator     server/utils/monthly-summary.ts        Chapter source data
                              (873 lines, email-oriented)            (presence, energy,
                                                                     patterns, narrative)
Story generator               server/utils/memory/story-generator    Compression prompt
Weekly Story (P87)            QIE P87 weekly-story-reflection        Feeds monthly rollup
Usership gating               tags includes 'usership'               All surfaces below
Badges + codex                client/utils/badges.ts, docs/badges    Month Seals attach
Feature gates                 "Evolution Gates" (MANIFEST: READY)    Month-gated widgets
Public OS                     /u/<user> PublicProfile.tsx            Year Book showcase
Demo account                  public-api.ts L747, isDemo:true        Month-12 reference
```

### Assembly phase <-> month mapping (so the two systems tell one story)

```
PHASE        THRESHOLD (EXISTS)                          EXPECTED MONTH
───────────  ──────────────────────────────────────────  ──────────────
awakening    >=1 log                                     M1
forming      3 event types, 10 logs, 3 active days       M1 (week 1-2)
assembled    5 event types, 50 logs, 14 active days      M2-M3
integrated   8 event types, 150 logs, 30 active days     M4+
```

Note: "integrated" is reached early (month 4). Phases describe engagement, months
describe the paid journey. They are independent clocks; the UI shows both.

---

## 04 // THE MONTH-BY-MONTH MAP

Legend: DENSITY uses the existing 5 levels. ROW = one month. Every month adds
exactly one **surface** (new UI), one **voice line** (AI), one **keepsake**.

```
 #   QTR      CODENAME     DENSITY       NEW SURFACE                  KEEPSAKE
───  ───────  ───────────  ────────────  ───────────────────────────  ─────────────
 1   OBSERVE  SIGNAL       breathable    Months Unlocked 1/12         Seal 01
 2   OBSERVE  RHYTHM       breathable    Morning ritual card          Seal 02
 3   OBSERVE  PATTERN      comfortable   Quarter Verse + Echoes*      Seal 03 + Q1
 4   MIRROR   PORTRAIT     comfortable   Portrait card (who I am)     Seal 04
 5   MIRROR   RETURN       compact       Relapse-proof streak view    Seal 05
 6   MIRROR   HALF         compact       Half-Year Letter             Seal 06 + Q2
 7   GUIDE    ASK          compact       First "AI asks first" slot   Seal 07
 8   GUIDE    COMPASS      dense         Direction widget (intent)    Seal 08
 9   GUIDE    PRACTICE     dense         Personal routine builder     Seal 09 + Q3
10   CARRY    DEPTH        dense         Full Recall in Log           Seal 10
11   CARRY    LEGACY       instrument    Year Book preview            Seal 11
12   CARRY    YEAR         instrument    Year Book + Story export     Seal 12 + YEAR
```
`*` Echoes unlock by entry count (150), not by date, per R1.

### Month detail cards

Each card: what the screen looks like, what the AI says, what the user holds.

```
--------------------------------------------------------------------------------
DAY 1 // BAREBONE                                       density: breathable
--------------------------------------------------------------------------------
SCREEN      Date line. Check-in. Self-care. Log prompt. Months Unlocked: 1/12.
            Nothing else. Wide spacing. One quiet sentence from the system.
AI VOICE    "Day 1. I do not know you yet. Tell me one thing."
SEAL        none
GOAL        first log entry + first check-in inside 24 hours (activation)
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
M01 SIGNAL                                              density: breathable
--------------------------------------------------------------------------------
THEME       The machine listens. It asks nothing it cannot earn.
SURFACE     Months Unlocked 1/12 (12-segment bar). Log count visible ("17 lines").
AI VOICE    Observational. One line per day, statements not questions.
            "You write at night. You check in at 08:10."
CLOSE       First Chapter. Always a SKETCH or CHAPTER; framed as "first read."
            Affirmation: "One month. The first signal is yours."
SEAL        01 + FIRST LINE + 7-DAY CHECK-IN
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
M02 RHYTHM                                              density: breathable
--------------------------------------------------------------------------------
SURFACE     Morning Ritual card: check-in -> one self-care -> one line. Three
            steps, one tap each. Shows streak as days, not as pressure.
AI VOICE    Names the user's rhythm back. "Your best entries come after rain."
CLOSE       Chapter 2 references Chapter 1 in one clause (first compress-again).
SEAL        02 + 21-DAY CHECK-IN
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
M03 PATTERN                                             density: comfortable
--------------------------------------------------------------------------------
SURFACE     Quarter marker on the bar. Tag cloud of recurring words (75 entries).
            Existing msg: "Three months. You have reached Active User status."
CLOSE       QUARTER VERSE (<=40 w) distilled from Chapters 1-3. Ceremony is
            longer: the three monthly lines are shown, then fold into the verse.
AI VOICE    Shifts from statement to pattern: "Three times this month you
            wrote about leaving."
SEAL        03 + QUARTER I: OBSERVE
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
M04 PORTRAIT                                            density: comfortable
--------------------------------------------------------------------------------
THEME       Voice change: the machine begins to mirror.
SURFACE     Portrait card: archetype, core values, 3 emotional patterns (the
            fields the psychologicalProfile already holds). Editable: user can
            mark a line "not me" — correction feeds the model.
CLOSE       Chapter opens with "Here is who you were this month."
SEAL        04
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
M05 RETURN                                              density: compact
--------------------------------------------------------------------------------
SURFACE     Streak view that survives breaks: "Returned after 6 days" is
            rewarded as its own event (Return count), not punished.
AI VOICE    Compassionate on gaps (reuse compassionate-interventions).
CLOSE       Chapter must name one return, if any occurred.
SEAL        05 + 50-DAY CHECK-IN
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
M06 HALF                                                density: compact
--------------------------------------------------------------------------------
SURFACE     Half-Year Letter: 6 monthly lines -> 1 quarter verse each -> a
            <=120 w letter addressed to the user. Printable / exportable.
            Existing msg: "Six months. The journey is half-declared."
AI VOICE    First direct second-person address: "You."
SEAL        06 + QUARTER II: MIRROR + HALF YEAR
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
M07 ASK                                                 density: compact
--------------------------------------------------------------------------------
THEME       Voice change: the machine asks first.
SURFACE     "Ask Slot": one question per day, chosen from the user's own
            vocabulary (Memory widget evolves into this). Max one. Skippable.
AI VOICE    Questions only, ranked by resonance; deferred if two compete.
CLOSE       Chapter lists the 3 questions that landed hardest.
SEAL        07
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
M08 COMPASS                                             density: dense
--------------------------------------------------------------------------------
SURFACE     Compass widget: intentions vs actions. Shows the gap (reuse
            intent-to-action P95). Dense layout begins; whitespace drops.
AI VOICE    Names contradictions gently ("You say rest; you log work at 23:00").
SEAL        08 + 100-DAY CHECK-IN
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
M09 PRACTICE                                            density: dense
--------------------------------------------------------------------------------
SURFACE     Routine Builder: AI proposes a 3-step self-care routine from what
            the user actually does; user edits; routine becomes the Morning
            Ritual card. The machine designs; the user signs.
CLOSE       QUARTER VERSE III. Existing msg: "The self-care practice is a habit now."
SEAL        09 + QUARTER III: GUIDE
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
M10 DEPTH                                               density: dense
--------------------------------------------------------------------------------
THEME       Voice change: the machine speaks in the user's compressed voice.
SURFACE     Quote Mode (300+ entries): AI quotes the user's own earlier words,
            with date, in answers. Concordance unlocks at 600 entries.
AI VOICE    Quotes. "On March 4 you wrote: ..."
SEAL        10 + CONCORDANCE
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
M11 LEGACY                                              density: instrument
--------------------------------------------------------------------------------
SURFACE     Year Book preview: 11 chapters bound, month 12 slot shown locked.
            Interface at instrument density: "The interface is yours."
AI VOICE    Retrospective. "Eleven months. One more."
SEAL        11
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
M12 YEAR                                                density: instrument
--------------------------------------------------------------------------------
SURFACE     Year Book unlocked. Year Sentence (<=25 w). Story export: dashboard
            now; robot/vehicle targets per brief when hardware exists.
            Existing msg: "One year with LOT. The portrait is complete —
            and still evolving."
CLOSE       Longest ceremony. 12 lines -> 4 verses -> 1 sentence, shown folding.
SEAL        12 + QUARTER IV: CARRY + YEAR RING
--------------------------------------------------------------------------------
```

---

## 05 // MEMORY COMPRESSION DELIVERY (the centerpiece)

### 05.1 The Compression Ladder

Each rung is generated from the rung below plus prior rungs, so a chapter in
month 9 can legitimately refer to something from month 2.

```
RUNG              INPUT                          OUTPUT            WHEN
────────────────  ─────────────────────────────  ────────────────  ────────────
SIGNAL            raw log / check-in / self-care  1 row             continuous
WEEK STORY        7 days of signals               ~60 w (EXISTS)    weekly
MONTH CHAPTER     weeks + prior Month Lines       <=35..180 w       month close
MONTH LINE        Month Chapter                   <=12 w            month close
QUARTER VERSE     3 Month Lines + 3 Chapters      <=40 w            M3 M6 M9 M12
HALF-YEAR LETTER  2 Quarter Verses                <=120 w           M6
YEAR SENTENCE     4 Quarter Verses                <=25 w            M12
STORY PAYLOAD     all rungs, structured           JSON (API)        on export
```

### 05.2 The ratio is shown, honestly

Ceremony footer prints real counts:

```
  212 signals  ->  84 words  ->  11 words
  (entries 131 · check-ins 24 · self-care 57)
```

No invented compression percentage (benchmark rule 5). Counts only.

### 05.3 Month-Close Ceremony (3 beats, ~25 seconds, dismissible)

Replaces/extends MonthlyPulseWidget's block at the top of the System tab.

```
BEAT 1  COUNTER      Months unlocked: 3/12      ▰▰▰▱▱▱▱▱▱▱▱▱
                     Seal 03 stamps in.         [ 03 ]
BEAT 2  CHAPTER      Month 3: PATTERN
                     (typed out, <=90 w, in the operator's behavioral voice)
BEAT 3  AFFIRM       One affirmation, one intention for next month.
                     Dismiss: "Onward." / "Noted." / "The system remembers."
```

Where it lives afterwards: Log tab -> **Chapters** view. 12 slots; unlocked
slots show codename, line, seal; locked slots show "unlocks 2027-03-14".

### 05.4 Context widgets (always-on, Usership only)

```
WIDGET             SHOWS                                         EXISTS?
─────────────────  ────────────────────────────────────────────  ───────
Months Unlocked    "Months unlocked: 3/12" + 12-segment bar      NEW
                   + days to next month
Last Month Memory  paragraph-long insight from last Chapter,     NEW
                   visible for first 7 days of the new month
Echo               one old entry resurfaced                      NEW
Ask Slot (M7+)     the one question of the day                   Memory
                                                                 widget evolves
Month Pulse        ceremony                                      EXISTS
```

### 05.5 Data model (PROPOSED)

```
MemoryChapter {
  id, userId, monthIndex (1..12), periodStart, periodEnd,
  type: 'sketch'|'chapter'|'deep'|'full',
  text, line,                      // chapter + <=12 w line
  counts: { entries, checkins, selfcare, activeDays },
  sources: string[],               // weekly story ids used
  priorRefs: number[],             // monthIndex of chapters referenced
  generatedAt, engine, userEdited: boolean
}
QuarterVerse { quarter 1..4, text, sources: monthIndex[] }
YearBook    { text (sentence), letter, chapters[], verses[], exportedAt }
```
Chapters are generated once, stored, and never silently regenerated (history is
append-only, matching the benchmark doctrine). The user may annotate; edits are
flagged `userEdited`.

### 05.6 Failure modes (decide now, not in production)

```
CASE                        BEHAVIOR
──────────────────────────  ───────────────────────────────────────────────
AI engine unavailable       fall back to local compose (composeLocalStory
                            exists) and mark chapter `engine: local`
Month Mass < 15             SKETCH, honest tone; never pad
User paused / skipped month chapter still generated from whatever exists
Subscription lapses         chapters remain readable; no new months unlock
Clock skew / timezone       month boundary computed server-side
```

---

## 06 // BADGES: THE TANGIBLE LAYER

Principle: time badges are free of effort-gaming (calendar), behavior badges are
earned. Both appear in the same row so the user sees *time* and *work*.

```
FAMILY           COUNT   RULE                                 DISPLAY
───────────────  ──────  ───────────────────────────────────  ──────────────────
MONTH SEAL       12      month closes (calendar)              [ 01 ] .. [ 12 ]
QUARTER MARK     4       M3 M6 M9 M12 close                   OBSERVE MIRROR
                                                              GUIDE CARRY
YEAR RING        1       M12 close                            closed ring
LOG MASS         7       1/10/30/75/150/300/600/1000 entries  FIRST LINE .. RECALL
CHECK-IN STREAK  6       7/21/50/100/200/365 days             streak seals
SELF-CARE        5       10/50/150/300/500 clicks             care seals
RETURN           3       came back after 3/7/14 day gap       RETURN I-III
```
Total proposed: ~38 year-one badges, a deliberately small, readable set on top
of the existing 812-badge codex (v32). Month Seals are NEW and should be
registered in `client/utils/badges.ts` + codex v33; IDs not assigned here.

Seal glyph: a 12-segment ring, month N lights N segments. Same glyph scales
from a 12px inline mark to the profile hero. (Water/Architecture theme variants
per INTERFACE_EVOLUTION are optional - see Open Questions.)

```
  M01 ▰▱▱▱▱▱▱▱▱▱▱▱     M07 ▰▰▰▰▰▰▰▱▱▱▱▱
  M03 ▰▰▰▱▱▱▱▱▱▱▱▱     M09 ▰▰▰▰▰▰▰▰▰▱▱▱
  M06 ▰▰▰▰▰▰▱▱▱▱▱▱     M12 ▰▰▰▰▰▰▰▰▰▰▰▰
```

---

## 07 // THE AI VOICE ARC

One register per quarter. Same engine, different stance. All copy is
statement-first, short, no exclamation marks, no superlatives (MILITARY PURITY).

```
QTR     STANCE       GRAMMAR                 SAMPLE
──────  ───────────  ──────────────────────  ──────────────────────────────
Q1      OBSERVER     "You ..." facts         "You write after midnight."
Q2      MIRROR       "You are ... when ..."  "You are steadier after walking."
Q3      GUIDE        questions               "What would rest cost you?"
Q4      CARRIER      quotes + "we"           "On March 4 you wrote: ..."
```

Affirmations are tied to *evidence*, not flattery: every affirmation cites a
count or a dated entry ("Nine mornings in a row. That is a practice.").

---

## 08 // THE DEMO ACCOUNT AS MONTH-12 REFERENCE

`lot-systems.com/u/machiavelli` is served by a hardcoded block in
`src/server/routes/public-api.ts` (L747). (The live URL was not reachable from
the authoring sandbox; this section is derived from the source, not a visual
inspection. Re-verify against production.)

### 08.1 Current state vs. the Year-One story

```
FIELD                  TODAY (source)                 YEAR-ONE TARGET
─────────────────────  ─────────────────────────────  ─────────────────────────
streak                 1469 days (~4 years)           372 (a year + a week)
memoryStory            1 paragraph                    Year Sentence + 12 chapters
months                 not shown                      Months unlocked: 12/12
density                n/a on public view             "instrument" tag on card
badges                 not enumerated                 12 seals + 4 marks + ring
tags                   RND, Usership, Legacy          keep (Legacy = 3-yr tier)
```
Tension to decide: 1469 days reads "Legacy, four years"; the user brief wants
"12 months evolved." Recommendation: keep Legacy tag, set streak to the
Year-One fixture, state "Year One" explicitly on the card.

### 08.2 Time-travel preview (recommended)

A "Preview month: 1 2 3 ... 12" scrubber on the demo profile that re-renders
the OS as it appears at that month (density, widgets, chapters visible, seals
lit). This is the single strongest sales surface: a prospect sees the whole
year in under a minute. Pure client state over fixture data; no auth needed.

### 08.3 Fixture

Twelve chapters, twelve lines, four verses, the Year Sentence and the month
by month counts are in `USERSHIP-MACHIAVELLI-YEARBOOK.md`.
Fixture is clearly labelled demo (`isDemo: true` already exists).

---

## 09 // GAPS FOUND IN THE REPO (honest list)

```
#  FINDING                                                        IMPACT
─  ─────────────────────────────────────────────────────────────  ───────────
1  Month index derives from user.joinedAt (MonthlyPulseWidget).   Month 1 starts
   No subscription-start field exists in src/ or prisma/.         at signup, not
                                                                  at payment. An
                                                                  early signup who
                                                                  upgrades late
                                                                  starts at month N.
                                                                  Needs `usershipSince`.
2  Pulse dismissal stored in localStorage per device.             Reappears on new
                                                                  device. Move to
                                                                  server (chapter
                                                                  `seenAt`).
3  Pulse copy is static per month; carries no user data.          The core gap this
                                                                  spec closes.
4  monthly-summary.ts is built for email, not persisted.          No stored Chapters.
5  Month capped at 12 in UI; "Month 13+" falls to a generic       Decide post-year
   line.                                                          arc (Year Two).
6  Settings copy: "$99/month, 12 months" - consistent with brief  none
7  Density is driven by behavior only; not month-ceilinged.       A fast user could
                                                                  hit "instrument"
                                                                  in month 2.
                                                                  Add month ceiling
                                                                  (R1).
8  Assembly "integrated" reachable ~month 4 (150 logs, 30 days).  Fine, but label
                                                                  as engagement,
                                                                  not journey.
```

Recommended density ceiling by month (R1):

```
MONTH   1-2        3-4          5-7       8-10     11-12
CEIL    breathable comfortable  compact   dense    instrument
```
Effective density = min(behavior-derived level, month ceiling).

---

## 10 // IMPLEMENTATION ROADMAP (PR-sized, in order)

```
STEP  DELIVERABLE                                        TOUCHES                 RISK
────  ─────────────────────────────────────────────────  ──────────────────────  ────
 R0   This spec + yearbook fixture                       docs only               none
 R1   `usershipSince` field + migration + month math     prisma, migrations,     med
      (server-side, timezone-safe) + backfill rule        shared/types
 R2   Months Unlocked widget (static copy, real month)   client/components      low
 R3   MemoryChapter table + monthly job generating       server/models,          med
      Chapter+Line from monthly-summary + story-gen      scheduled-jobs
 R4   Month-Close Ceremony replaces Pulse body;          MonthlyPulseWidget,     low
      Log tab "Chapters" view                            Logs
 R5   Month density ceiling                              stores/evolution        low
 R6   Seals + Quarter marks + Year Ring in badge engine  utils/badges, codex v33 low
 R7   Quarter Verse, Half-Year Letter, Year Sentence     server memory/          med
 R8   Log Mass ladder (Search, Echoes, Threads, Recall)  Logs                    med
 R9   Ask Slot (M7) + Compass (M8) + Routine Builder     Memory widget           med
 R10  Machiavelli Year-One fixture + month scrubber      public-api, PublicProf  low
 R11  Story export payload (dashboard first)             routes/api              med
```
Cheapest path to *felt* value: R1 -> R2 -> R3 -> R4. After those four, the
operator sees a real, personal chapter at the end of month one.

---

## 11 // OPEN QUESTIONS FOR S-2

```
Q1  Month clock: start at payment (recommended) or at signup (current)?
Q2  Water vs Architecture theme variants for Month Seals, or one neutral ring?
Q3  Chapter voice: operator's behavioral voice (brief) or machine's voice?
    Spec assumes operator's voice, with the AI stance shifting by quarter.
Q4  May the user edit a Chapter? Spec: annotate only; original kept.
Q5  Demo streak: reset to Year-One (372) or keep 1469 (Legacy)?
Q6  What happens after month 12: Year Two arc, or renewal ceremony?
Q7  Month Seal pricing hook: does a lapsed subscriber keep seals visible?
```

---
*Provisional where marked PROPOSED. Numeric thresholds are starting points to be
tuned against real cohort data before shipping.*

AUTHORIZED BY: S-2 // VADIK MARMELADOV
