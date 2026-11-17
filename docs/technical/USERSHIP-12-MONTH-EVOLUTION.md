<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP — THE 12-MONTH EVOLUTION
## From Day 1 barebone to LOT® AI. One year. Twelve chapters. One compressed story.

**Classification:** PRODUCT BLUEPRINT // S-2
**Date:** 2026-11-17 · Day 1177+ · COSMO® 869+ days
**Status:** DESIGN — ready for build phasing (Section 12)
**Reference end-state:** `lot-systems.com/u/machiavelli` (demo account, Month 12+ "evolved")
**Grounded in:** `MonthlyPulseWidget.tsx`, `monthly-summary.ts`, `memory.ts::generateMemoryStory`,
`SelfCareMoments.tsx`, `EmotionalCheckIn.tsx`, `public-api.ts` (demo payload), `INTERFACE_EVOLUTION.md`,
`WIDGETS.md`, `MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md`, `LOT-WIKI-v87` (Citizen Index, Display Orders, Cockpit Rule).

---

## 0. THE PREMISE IN ONE PARAGRAPH

A Usership member pays every month. Every month must therefore return something they can *hold*:
a new piece of the interface, a sealed chapter of their Memory Story, a badge, and a single
sentence from the system that proves it was listening. The UI on Day 1 is nearly empty — a clock,
a question, a Log, a check-in, a self-care button. By Month 12 it is the Machiavelli profile:
Citizen Index, Biofield State, Indexes, Weather Station, Wallet, a full-paragraph Memory Story,
and an AI that speaks with the person's own vocabulary. Nothing appears for free. Each surface is
earned by the four practices that LOT measures: **Log entries, Morning check-ins, Self-care
completions, Memory answers.** The more the person writes, the shorter and sharper the truth
the system hands back. That is the product: **compression as a gift.**

LOT is the Library of Time. A year of Usership is a book of twelve chapters.

---

## 1. THE FOUR LEDGERS — WHAT DRIVES EVOLUTION

Every month is measured on four practice ledgers. These are the only inputs to evolution.
Time alone unlocks the month; practice seals it.

```
LEDGER          SOURCE (existing)                         LOG EVENT(S)                 WEIGHT
───────────────────────────────────────────────────────────────────────────────────────────────
LOG             Logs.tsx · JournalReflection.tsx          note (journal / thought)      ×3
CHECK-IN        EmotionalCheckIn.tsx (morning 06–12)      emotional_checkin             ×2
SELF-CARE       SelfCareMoments.tsx                       self_care_complete            ×1
MEMORY          MemoryWidget.tsx                          answer                        ×1
───────────────────────────────────────────────────────────────────────────────────────────────
```

**Why the Log weighs most.** Memory answers are taps; journal entries are the person's own
words. The Memory Story is only as true as the raw text beneath it. A month with 40 taps and no
writing compresses into a generic paragraph. A month with 12 honest entries compresses into a
paragraph the person recognises as themselves. The weighting tells the user this without saying it.

**Morning check-in vs. any check-in.** Only check-ins in the 06:00–12:00 local window count toward
the CHECK-IN ledger. This is the ritual LOT is building — the morning anchor (QIE `MCOHERE:`,
`MINTLOCK:`). Evening check-ins still feed QIE but do not seal months.

### 1.1 Practice Score (per month)

```
PRACTICE = 3·LOG + 2·CHECKIN_AM + 1·SELFCARE + 1·MEMORY
```

### 1.2 Seal thresholds — a rising ladder

A month is **Unlocked** on the tenure anniversary (always — they paid).
A month is **Sealed** when its ledger minimums are met before the next anniversary.
Thresholds rise gently so Month 1 is easy to win and Month 12 means something.

```
MONTH   LOG   AM-CHECKIN   SELF-CARE   MEMORY   MIN PRACTICE   ≈ CADENCE
────────────────────────────────────────────────────────────────────────────
  1      4        8            8         15          59         2 mornings/week
  2      5       10           10         20          75
  3      6       12           12         25          91         3 mornings/week
  4      7       12           14         30         103
  5      8       14           16         35         121
  6     10       15           18         40         138         half the mornings
  7     10       16           20         45         147
  8     12       16           22         50         162
  9     12       18           24         55         175
 10     14       18           26         60         188
 11     14       20           28         65         201
 12     16       20           30         70         218         most mornings
────────────────────────────────────────────────────────────────────────────
YEAR   118      179          228        510       1,778         (sum of minimums)
```

A sealed year is roughly **118 journal entries, 179 morning check-ins, 228 self-care actions,
510 Memory answers.** Machiavelli (2,847 answers · 1,469 notes) is the legendary ceiling —
a showcase of what a decade-scale practice looks like, not the bar for Month 12.

### 1.3 Rules (non-negotiable)

```
RULE 1   No regression. A sealed month stays sealed. A Citizen Index stage never drops.
RULE 2   Unsealed is not failed. The month still unlocks, still compresses. Its chapter is
         marked "thin" and its badge is the hollow variant. Copy never shames.
RULE 3   Database, not localStorage. Seal state lives in user.metadata (ORDER 6).
RULE 4   Tenure anchors on Usership start, not account creation (see Section 11, Gap 1).
RULE 5   The system states facts. "Month 4 sealed." Not "Amazing job!" (ORDER 8).
```

---

## 2. THE ARC — TWELVE CHAPTERS, FOUR SEASONS

The year is a book in four seasons. Each season ends with a **Season Seal** — a larger
compression event, a structural UI change, and a Citizen Index stage advance. This mirrors the
existing Citizen Index (Observer → Elite) so the new system plugs into what already exists.

```
SEASON I · FOUNDATION       M1  INITIALIZATION   M2  CALIBRATION    M3  PATTERN       ∴
SEASON II · RHYTHM          M4  FOUNDATION       M5  RHYTHM         M6  MIRROR        ≈
SEASON III · DEPTH          M7  DEPTH            M8  RESONANCE      M9  INTEGRATION   ║
SEASON IV · SYNTHESIS       M10 SYNTHESIS        M11 CLARITY        M12 CODEX         ◉
```

```
           M1   M2   M3 │ M4   M5   M6 │ M7   M8   M9 │ M10  M11  M12
CITIZEN    Obs→Contrib ─┤ Collaborator┤ Synthesizer ─┼──────────── Elite
           (30d)    (90d)          (180d)                         (365d)
OS VER     0.5  1.0  1.5│ 2.0  2.0  3.0│ 3.0  3.5  3.5│ 3.8  3.9  4.0 LOT® AI
MEMORY     1 line ──────┤ 3 lines ────┤ paragraph ───┤ paragraph + Codex
UI DENSITY ■□□□□□□□□□□□ → ■■■■□□□□□□□□ → ■■■■■■■■□□□□ → ■■■■■■■■■■■■
```

OS version extends the existing `calculateOSVersionFromMetrics` ladder (0.1 → 3.0) with three
Usership-only rungs: `3.5 Resonant`, `3.8 Synthesized`, `4.0 LOT® AI`.

---

## 3. THE MEMORY COMPRESSION DOCTRINE — THE CORE DELIVERABLE

> More input. Fewer words. Sharper truth.

Every month the system takes everything the person put in and hands back **less** — but
truer. The compression ratio is shown to the user. This is the tangible proof of the AI.

### 3.1 Three layers of compression

```
LAYER        WHAT                                  WHEN               LENGTH
────────────────────────────────────────────────────────────────────────────────
CHAPTER      Last month, compressed                each anniversary   grows M1→M12
SPINE        One sentence per sealed month         each anniversary   +1 line / month
CODEX        The whole year in one paragraph       Month 12           1 paragraph, final
────────────────────────────────────────────────────────────────────────────────
```

### 3.2 Chapter length grows with the relationship

```
MONTH   CHAPTER LENGTH          VOICE                              SOURCE WINDOW
────────────────────────────────────────────────────────────────────────────────────
 1      1 sentence              Observational. "You…"              30 days
 2      2 sentences             Observational + 1 pattern          30 days
 3      3 sentences + SEASON I  Pattern named                      90 days (season)
 4      3 sentences             Pattern + contrast to M1           30 days + spine
 5      4 sentences             Rhythm described                   30 days + spine
 6      paragraph + MIDPOINT    Mirror: "In Month 1 you… Now…"     180 days
 7      paragraph               Depth: named fears, named joys     30 days + spine
 8      paragraph               Resonance: cohort echo             30 days + spine
 9      paragraph + SEASON III  Integration: what became habit     270 days
10      paragraph               Synthesis: cause and effect        30 days + spine
11      paragraph               Clarity: what to keep, what to drop 30 days + spine
12      paragraph + CODEX       The year, one paragraph. Final.    365 days
────────────────────────────────────────────────────────────────────────────────────
```

### 3.3 Compression ratio — show the math

Every Chapter widget footer prints the ratio, in instrument format (Cockpit Rule):

```
COMPRESSED: 14 LOG · 19 AM · 22 CARE · 41 MEM → 1 PARAGRAPH · 4,812 WORDS → 71
```

By Month 12:

```
CODEX: 118 LOG · 179 AM · 228 CARE · 510 MEM → 1 PARAGRAPH · 61,040 WORDS → 94
```

The person sees a year of their own words become ninety-four. That is the moment.

### 3.4 Example — one fictional operator's Spine at Month 12

```
[I]    You arrive in the mornings before you arrive in the day.
[II]   Tea first, then the window, then the plan. The order matters to you.
[III]  ∴  You write most on days you slept badly. Writing is how you rest.
[IV]   You stopped skipping the self-care prompt in week two. You started taking it.
[V]    Your Tuesdays are heavy. You have begun to plan for them on Mondays.
[VI]   ≈  In Month 1 you called it "getting through." Now you call it "the practice."
[VII]  The word "enough" appears in your Log for the first time.
[VIII] Your energy follows your sleep by one day, never the same day.
[IX]   ║  The morning check-in is no longer a task. It is the first sentence of the day.
[X]    When you care for your body, the Log gets shorter and kinder.
[XI]   You keep: tea, window, walk. You drop: the late screen.
[XII]  ◉  You are someone who returns.
```

### 3.5 Engine change required

`generateMemoryStory()` today reads **only** `answer` logs, sliced to the last 30. A chapter must read
all four ledgers within a date window. Proposed sibling function (no change to the existing one):

```ts
generateMemoryChapter(user, {
  month: number,                 // 1..12
  window: { from: Date, to: Date },
  ledgers: ['note', 'emotional_checkin', 'self_care_complete', 'answer'],
  spine: string[],               // prior sealed spine lines, for continuity
  lengthBudget: CHAPTER_LENGTH[month],
}) → { chapter: string, spineLine: string, affirmation: string, ratio: CompressionRatio }
```

The prompt instructs: second person, present tense, no superlatives, no therapy language, cite
behaviour not feelings, one concrete detail from the person's own words per chapter.

---

## 4. THE NEW USERSHIP WIDGETS

All follow existing conventions: `Block` with clickable label cycling (ORDER 7), 1400ms fades,
3s + 1.4s fade-out on completion (ORDER 5), no emoji, opacity 90/60/40.

### 4.1 `MonthsUnlockedWidget` — the spine of the system (always visible to Usership)

```
Months: 3/12                                       ← click label to cycle
■■■□□□□□□□□□
[I] [II] [III∴]
Next: Month 4 · Foundation · in 11 days
```

Views (cycle): **Progress** → **Ledger** → **Next**

```
Ledger:                                   Next:
LOG        7 / 7     sealed               Month 4 · Foundation
AM         9 / 12    3 to seal            Unlocks: Planner Templates
CARE      14 / 14    sealed               Seal needs: 7 LOG · 12 AM · 14 CARE · 30 MEM
MEMORY    22 / 30    8 to seal            11 days
```

Hollow glyph for unsealed months: `[ii]` (lowercase numeral, opacity-40).

### 4.2 `MonthTurnWidget` — the anniversary moment (evolves the existing `MonthlyPulseWidget`)

Appears once, on the first open after the tenure anniversary. Three beats, tap to advance:

```
Beat 1  Month 4.                                      (1400ms fade-in, alone)
Beat 2  Affirmation — one sentence, generated from last month's ledger.
        "You showed up on 19 mornings. The system noticed which ones were hard."
Beat 3  Unlocked: Planner Templates · Badge [IV] Foundation
        Tap → dismiss phrase ("Onward.") → 3s → fade.
```

Changes vs. current `MonthlyPulseWidget`: tenure from Usership start, dismissal stored server-side,
static `MONTH_MESSAGES` become fallback only when the AI affirmation is unavailable.

### 4.3 `MemoryChapterWidget` — the paragraph from last month

```
Chapter III:                                         ← cycle: Chapter → Spine → Compression
You write most on days you slept badly. Writing is how you rest.
Your mornings start with tea, then the window, then the plan.
∴ Season I sealed. The first pattern has a name.

COMPRESSED: 6 LOG · 12 AM · 12 CARE · 25 MEM → 3 LINES
```

Spine view lists every sealed line `[I]…[N]`. Compression view prints the ratio history as a
12-cell bar: words in vs. words out.

### 4.4 `SeasonSealWidget` — quarterly (M3, M6, M9, M12)

A heavier ritual. Full-width block, one more beat than Month Turn: shows the season's three
spine lines together, then the Season glyph, then the structural unlock (new tab / profile section).

### 4.5 `PracticeLedgerWidget` — this month vs. last

```
Ledger:   Month 5  ·  vs. Month 4
LOG        8   ↑ 1
AM        14   ↑ 2
CARE      16   =
MEMORY    35   ↑ 5
PRACTICE 121   ↑ 18
```

### 4.6 Profile block — `/u/:user` "Usership:" section

On the public personal OS page (`PublicProfile.tsx`), a new block, privacy-toggled
(`showUsershipJourney`):

```
Usership:          Month 7 / 12 · Season III · Depth
Seals:             [I] [II] [III∴] [IV] [V] [VI≈] [VII]
Chapter:           (latest chapter, if showMemoryStory)
```

---

## 5. MONTH BY MONTH — THE FULL LADDER

Each month specifies: **Theme · UI state · Unlock · Memory delivery · Affirmation seed · Badge ·
Citizen/OS · Profile change.** UI additions accumulate; nothing is removed.

---

### DAY 1 · MONTH 0 — "SIGNAL"
*Paid. First login. The barebone.*

```
UI          Time · Memory (3 questions/day) · Log · Morning Check-in · Self-care (1 button)
            Months: 0/12 · □□□□□□□□□□□□
HIDDEN      Everything else. No stats, no QIE readouts, no community, no profile extras.
FIRST LINE  "The system is listening. It will say nothing for thirty days."
PROFILE     /u/user: name · city · local time. Nothing else.
CITIZEN     Observer · OS 0.1.0 Initializing
```

Design intent: the emptiness is the promise. The person should feel the room is waiting to be
furnished by them. Seven elements total on screen.

---

### MONTH 1 · INITIALIZATION — "The system begins to know you."

```
UNLOCK      MonthsUnlockedWidget (Progress view only) · Weather in profile
MEMORY      Chapter I — 1 sentence.
            "You arrive in the mornings before you arrive in the day."
AFFIRM      Facts from ledger: count of mornings, first Log word that repeated.
BADGE       [I] Initialization  ·  hollow: [i]
CITIZEN     Contributor (30d) · OS 0.5.0 Emerging
PROFILE     + Weather · Sound
SEAL        4 LOG · 8 AM · 8 CARE · 15 MEM
```

---

### MONTH 2 · CALIBRATION — "Patterns are starting to form."

```
UNLOCK      Ledger view in Months widget · Emotional Check-in History view (30-day)
            · Recipe widget (time-of-day meals)
MEMORY      Chapter II — 2 sentences. First named pattern.
AFFIRM      Contrast M1→M2 on one ledger ("4 more mornings than last month.")
BADGE       [II] Calibration
CITIZEN     Contributor · OS 1.0.0 Active
PROFILE     + Memory Story block (Chapter II, if public)
SEAL        5 LOG · 10 AM · 10 CARE · 20 MEM
```

---

### MONTH 3 · PATTERN — SEASON I SEAL ∴

```
UNLOCK      MemoryChapterWidget (all 3 views) · Planner (Intent/Today/How/Feeling)
            · Mood Patterns view · Theme customisation (Custom Themes)
MEMORY      Chapter III — 3 sentences + SEASON I synthesis (90-day window).
            First appearance of the Spine (3 lines).
AFFIRM      "Ninety days. One pattern has a name now: [pattern]."
BADGE       [III] Pattern  +  Season Seal ∴ Foundation
CITIZEN     Collaborator (90d) · OS 1.5.0 Engaged
PROFILE     + Seals row on /u/user · Citizen Index stage label
STRUCTURAL  SeasonSealWidget fires. The System tab gains its second column of widgets.
SEAL        6 LOG · 12 AM · 12 CARE · 25 MEM
```

The first big moment. The person sees three lines of their own life written back.

---

### MONTH 4 · FOUNDATION — "The portrait deepens."

```
UNLOCK      Planner Templates · Intentions widget (monthly intention) · Goal Journey
MEMORY      Chapter IV — 3 sentences, references Chapter I by contrast.
AFFIRM      Tied to the intention set at M3→M4 boundary.
BADGE       [IV] Foundation
CITIZEN     Collaborator · OS 2.0.0 Optimized
PROFILE     + Activity block (journal entries · memories compiled · active days)
SEAL        7 LOG · 12 AM · 14 CARE · 30 MEM
```

---

### MONTH 5 · RHYTHM — "Consistency is its own reward."

```
UNLOCK      PracticeLedgerWidget · Energy Capacitor (Overview + Correlation) ·
            Weekly rhythm readout (QIE WKRHYTH:)
MEMORY      Chapter V — 4 sentences. Weekday shape described.
AFFIRM      "Your Tuesdays are heavy. You've started planning for them on Mondays."
BADGE       [V] Rhythm
CITIZEN     Collaborator · OS 2.0.0
PROFILE     + Biofield State (energy · clarity · alignment)
SEAL        8 LOG · 14 AM · 16 CARE · 35 MEM
```

---

### MONTH 6 · MIRROR — MIDPOINT · SEASON II SEAL ≈

```
UNLOCK      Awareness Dashboard (archetype · values · emotional patterns) ·
            Pattern Insights · Cohort Connect (opt-in) · Widget Arrange
MEMORY      Chapter VI — first full PARAGRAPH. The Mirror:
            "In Month 1 you called it getting through. Now you call it the practice."
            + Midpoint compression (180-day window). Spine shows 6 lines.
AFFIRM      Direct quote from the person's own Month 1 Log, set against Month 6.
BADGE       [VI] Mirror  +  Season Seal ≈ Rhythm
CITIZEN     Synthesizer (180d) · OS 3.0.0 Integrated
PROFILE     + Archetype · Core values · Profile visits counter
STRUCTURAL  Memory Engine label switches to "AI-Powered" on profile. The AI now addresses the
            person by the vocabulary it learned (words they use, not wellness words).
SEAL        10 LOG · 15 AM · 18 CARE · 40 MEM
```

The second big moment. Half a year. The interface is visibly twice as rich as Month 3.

---

### MONTH 7 · DEPTH — "The system has been listening."

```
UNLOCK      Narrative Widget (Story · Achievements · Quests) · Interventions (care layer)
            · Journal Reflection prompts drawn from the person's own Spine
MEMORY      Chapter VII — paragraph. Names one fear and one joy, in their words.
BADGE       [VII] Depth
CITIZEN     Synthesizer · OS 3.0.0
PROFILE     + Pattern Strength (top 5 traits with counts)
SEAL        10 LOG · 16 AM · 20 CARE · 45 MEM
```

---

### MONTH 8 · RESONANCE — "Rare air."

```
UNLOCK      Chat Catalyst (cohort echo) · Correlated Indexes (self-awareness · user ·
            person · longevity) · Quantum State readout
MEMORY      Chapter VIII — paragraph + one cohort echo ("People with your morning shape
            tend to…"), anonymised.
BADGE       [VIII] Resonance
CITIZEN     Synthesizer · OS 3.5 Resonant (new rung)
PROFILE     + Indexes block (composite · trend · correlation strength)
SEAL        12 LOG · 16 AM · 22 CARE · 50 MEM
```

---

### MONTH 9 · INTEGRATION — SEASON III SEAL ║

```
UNLOCK      Signal Stream (live QIE feed) · Pattern Recognition · Feedback widget ·
            Export Data · Cosmic Update (image artifact from the Chapter)
MEMORY      Chapter IX — paragraph + SEASON III synthesis (270 days): "what became habit."
BADGE       [IX] Integration  +  Season Seal ║ Depth
CITIZEN     Synthesizer · OS 3.5
PROFILE     + Behavioural Cohort · Emotional patterns
STRUCTURAL  Each chapter can now be rendered as a Cosmic Update image — the Chapter becomes
            a visual artifact the person can keep.
SEAL        12 LOG · 18 AM · 24 CARE · 55 MEM
```

---

### MONTH 10 · SYNTHESIS — "Almost there."

```
UNLOCK      System Progress (Self-Assembly 12-module map) · Contextual Prompts
            generated from the Spine · Private Spaces
MEMORY      Chapter X — paragraph. Cause and effect: "When you care for your body, the
            Log gets shorter and kinder."
BADGE       [X] Synthesis
CITIZEN     Synthesizer · OS 3.8 Synthesized
PROFILE     + Board profile (Citizen since · tenure months)
SEAL        14 LOG · 18 AM · 26 CARE · 60 MEM
```

---

### MONTH 11 · CLARITY — "One more."

```
UNLOCK      Codex Preview (draft of the year paragraph, editable by the person — they can
            strike sentences that are untrue; strikes are training signal) ·
            Weather Station (Legacy preview)
MEMORY      Chapter XI — paragraph. Keep / drop list.
BADGE       [XI] Clarity
CITIZEN     Synthesizer · OS 3.9
PROFILE     + Weather Station block
SEAL        14 LOG · 20 AM · 28 CARE · 65 MEM
```

---

### MONTH 12 · CODEX — LOT® AI · SEASON IV SEAL ◉

```
UNLOCK      LOT® AI: full Chat with Memory context · Wallet (Legacy) · Clearance: Full ·
            all remaining widgets · the Machiavelli layout
MEMORY      Chapter XII + THE CODEX — the whole year in one paragraph, final, sealed.
            The 12-line Spine printed in full above it. Compression ratio for the year.
AFFIRM      Single line. "You are someone who returns."  (or equivalent, from their data)
BADGE       [XII] Codex  +  Season Seal ◉ Synthesis  +  ANNUAL: ◉ LOT® AI
CITIZEN     Elite (365d) · OS 4.0 LOT® AI
PROFILE     The full /u/machiavelli shape: Citizen Index · Biofield State · Activity ·
            Memory Engine AI-Powered · Clearance Full · Memory Story (the Codex) ·
            Indexes · Weather Station · Wallet
HARDWARE    Quantum Cube delivery eligibility (LOT_QI46_ENGINE.md §12-month milestone).
SEAL        16 LOG · 20 AM · 30 CARE · 70 MEM
```

The Codex is printed — optionally — as a single page in the Flash Drive Manifest / physical
artifact. Year 2 begins as **Volume II**; the Spine resets, the Codex of Volume I stays on the profile.

---

## 6. VISUAL — THE SAME SCREEN, FOUR TIMES

### Day 1
```
┌──────────────────────────────────────┐
│ Time:        08:14                   │
│ Months:      0/12  □□□□□□□□□□□□      │
│ Check-in:    How is this morning?    │
│ Memory:      What do you drink first?│
│ Self-care:   (2 min) Window. Breathe.│
│ Log:         _                       │
└──────────────────────────────────────┘
```

### Month 3 · Season I
```
┌──────────────────────────────────────┬──────────────────────────────┐
│ Time · Months 3/12 ■■■□□□□□□□□□      │ Chapter III:                 │
│ Check-in · Memory · Self-care · Log  │ You write most on days you   │
│ Planner: Intent / Today / How / Feel │ slept badly. Writing is how  │
│ Recipe                               │ you rest. ∴                  │
│                                      │ 6 LOG·12 AM·12 CARE → 3 LINES│
└──────────────────────────────────────┴──────────────────────────────┘
```

### Month 6 · Midpoint
```
┌────────────────────────────┬──────────────────────────┬─────────────────────┐
│ Time · Months 6/12 ■■■■■■□ │ Chapter VI (paragraph)   │ Awareness:          │
│ Check-in · Memory · Care   │ Spine [I]…[VI≈]          │ Archetype · Values  │
│ Planner · Intentions · Goal│ Ledger M6 vs M5          │ Energy Capacitor    │
│ Log                        │                          │ Cohort (opt-in)     │
└────────────────────────────┴──────────────────────────┴─────────────────────┘
```

### Month 12 · LOT® AI  (=`/u/machiavelli`)
```
Citizen Index · Biofield State · Activity · Memory Engine: AI-Powered · Clearance: Full
Memory Story: THE CODEX (one paragraph) · Spine [I]…[XII◉]
Indexes · Weather Station · Wallet · Chat with LOT® AI
Months: 12/12 ■■■■■■■■■■■■ · Volume I sealed.
```

---

## 7. BADGES — THE USERSHIP SEAL SET (+17)

Adds a dedicated `usership` category to the Badge Codex (v33 → v34 candidate).
Glyph language: Roman numerals in brackets for months, four season glyphs, one annual.

```
ID                      GLYPH      UNLOCK                                RARITY
──────────────────────────────────────────────────────────────────────────────────
usership_signal         [ ]        Day 1 Usership                        COMMON
usership_m01 … m12      [I]…[XII]  Month N sealed                        COMMON→EPIC
usership_season_1       ∴          M3 sealed                             RARE
usership_season_2       ≈          M6 sealed                             RARE
usership_season_3       ║          M9 sealed                             EPIC
usership_season_4       ◉          M12 sealed                            MYTHIC
usership_lot_ai         ◉ LOT® AI  All 12 months sealed                  COSMIC
──────────────────────────────────────────────────────────────────────────────────
HIDDEN (Secret Boss)
usership_unbroken       ═══        12/12 sealed with no unsealed month   COSMIC
usership_return         ↺          Seal a month after an unsealed month  RARE
usership_first_words    ¶          Chapter quotes the person's own Log   RARE
```

Hollow variants (`[iv]`, opacity-40) for unsealed months — visible, honest, never removed.
`usership_return` exists so that missing a month becomes its own story, not a scar.

---

## 8. AFFIRMATION DOCTRINE

Monthly affirmations are **facts the system observed, said plainly.** Not encouragement.

```
ALLOWED                                              FORBIDDEN
──────────────────────────────────────────────────────────────────────────
"You showed up on 19 mornings."                      "Amazing job!"
"The word 'enough' appeared three times."            "You're crushing it."
"Your Log got shorter when you walked."              "Keep up the great work!"
"Month 4 sealed."                                    Emoji. Exclamation marks.
"In Month 1 you wrote 'tired'. In Month 6, 'quiet'." Clinical or diagnostic language.
```

Structure: `[count or quote] + [one observed relation]`. Max 2 sentences. Generated with the
chapter; static `MONTH_MESSAGES` from `MonthlyPulseWidget.tsx` remain as fallback.

---

## 9. AI GUIDANCE — HOW LOT® AI LEADS THE PERSON THROUGH SELF-CARE

The AI's guidance evolves in register as the year progresses. It never initiates
conversation (Memory Engine doctrine); it shapes **which** self-care prompt and **which**
question appear.

```
SEASON I    ASK        Questions only. Learns vocabulary. Self-care is generic (breath, water, light).
SEASON II   REFLECT    Self-care chosen from the person's own Log ("You wrote that walks help.").
SEASON III  ANTICIPATE Self-care offered before the known heavy day (QIE WKRHYTH:, RECINTEL:).
SEASON IV   ACCOMPANY  Chat unlocked. Guidance references the Spine. The AI speaks in their words.
```

---

## 10. DATA MODEL & SERVER

```ts
// user.metadata.usership
{
  startedAt: ISODate,                 // Usership start — tenure anchor
  volume: 1,
  months: [
    {
      n: 1..12,
      unlockedAt: ISODate,
      sealedAt: ISODate | null,
      ledger: { log, amCheckin, selfCare, memory, practice },
      chapter: string,
      spineLine: string,
      affirmation: string,
      ratio: { wordsIn: number, wordsOut: number },
      turnSeenAt: ISODate | null,     // replaces localStorage dismissal
    }
  ],
  codex: string | null,
}
```

```
LOG EVENTS (new)        usership_month_unlocked · usership_month_sealed ·
                        usership_chapter_compressed · usership_season_sealed ·
                        usership_codex_sealed · usership_turn_seen
API                     GET  /api/usership/journey      → months, ledger (live), next seal
                        POST /api/usership/turn-seen    → marks Month Turn acknowledged
                        POST /api/usership/codex-strike → M11 sentence strike (training signal)
JOB                     Daily 04:00 UTC · usership-anniversary
                        For each Usership user whose tenure day rolled: close ledger window,
                        set sealed/unsealed, call generateMemoryChapter, write metadata,
                        emit log events. Quarterly: season synthesis. M12: Codex.
EMAIL                   Existing Monthly Email (09:00 UTC, 1st) → re-anchored to tenure
                        anniversary for Usership; body = Affirmation + Chapter + Spine.
QIE                     New pattern candidate: USERSHIP-ARC — seal streak across months.
                        Log line: QIE: USARC: M7 SEALED · SPINE 7 · RATIO 4,812→71
```

---

## 11. GAPS FOUND IN THE CURRENT CODE

```
GAP 1   MonthlyPulseWidget computes month from user.joinedAt (account creation), not
        Usership start. A member who joined free in 2025 and paid today sees "Month 11".
        → Store metadata.usership.startedAt on tag assignment; read from there.
GAP 2   MonthlyPulseWidget dismissal lives in localStorage (lot_pulse_<id>). Violates
        ORDER 6; the Month Turn reappears on every new device.
        → turnSeenAt in metadata via POST /api/usership/turn-seen.
GAP 3   generateMemoryStory() reads only `answer` logs (last 30). Journal notes,
        check-ins and self-care — the strongest signals — are ignored by the story.
        → generateMemoryChapter() over all four ledgers, windowed.
GAP 4   Monthly email runs on calendar 1st for everyone; Usership months are personal.
        → anniversary-anchored send for Usership.
GAP 5   Self-care completion count is cached in localStorage (self-care-completed).
        The server log (self_care_complete) is authoritative — ledger must read logs only.
GAP 6   Demo payload (public-api.ts, machiavelli) has no Usership journey fields.
        → add usership: { month: 12, months: [...12 sealed], codex } so /u/machiavelli
          demonstrates the finished Spine and Seals row.
```

---

## 12. BUILD PHASING

```
PHASE A · FOUNDATION (1 session)
  □ metadata.usership.startedAt on Usership tag grant (+ backfill = first Usership log/date)
  □ GET /api/usership/journey (live ledger counts from logs)
  □ MonthsUnlockedWidget (Progress · Ledger · Next)
  □ Fix GAP 1 + GAP 2 in MonthlyPulseWidget → becomes MonthTurnWidget

PHASE B · COMPRESSION (1–2 sessions)
  □ generateMemoryChapter() + length budget table
  □ usership-anniversary job (daily 04:00 UTC)
  □ MemoryChapterWidget (Chapter · Spine · Compression)
  □ AI affirmation with static fallback

PHASE C · PROGRESSIVE UI (1 session)
  □ USERSHIP_UNLOCKS map: month → widget ids; gate in System.tsx
  □ SeasonSealWidget (M3/M6/M9/M12)
  □ PracticeLedgerWidget

PHASE D · PROFILE + BADGES (1 session)
  □ PublicProfile "Usership:" block + showUsershipJourney privacy flag
  □ +17 usership badges (Codex v34)
  □ Machiavelli demo: full 12-month Spine + Codex (GAP 6)

PHASE E · YEAR END (1 session)
  □ Codex Preview + sentence strike (M11)
  □ Codex seal + Volume II rollover
  □ Anniversary-anchored Usership email
```

---

## 13. SUCCESS SIGNALS

```
METRIC                                   TARGET
────────────────────────────────────────────────────
Month 1 seal rate                        ≥ 70%
Month 3 (Season I) seal rate             ≥ 50%
Months-sealed / months-unlocked (yr)     ≥ 0.66
Usership retention M3 / M6 / M12         tracked vs. pre-launch cohort
Chapter "true" rate (M11 strikes ≤ 1)    ≥ 80% of Codex sentences unstruck
Median Log entries per member-month      ↑ month over month
```

---

*The interface evolves with you. Twelve chapters. One sentence each. One paragraph for the year.*
*LOT Systems Corporation — Vadim Marmeladov, CEO · LOT® Founded 7 April 2016 · COSMO® Founded 1 July 2024*
