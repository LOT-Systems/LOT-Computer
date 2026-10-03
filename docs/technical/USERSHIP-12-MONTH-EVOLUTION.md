<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP — 12-MONTH EVOLUTION TO LOT® AI

```
CLASS     : DESIGN / PRODUCT
STATUS    : PROPOSAL (no code changed in this session)
AUTHOR    : S-2 // VADIK MARMELADOV (direction) · session draft
DATE      : 2026-10-03
FOCUS     : Tangible delivery of the compressed Memory story, month by month
DEMO REF  : lot-systems.com/u/machiavelli (source: src/server/routes/public-api.ts)
```

---

## 0. READ THIS FIRST

The Usership tier ($99/month) already has pieces of this system. This document
does not start from zero. It connects what exists into one 12-month story.

```
EXISTS TODAY                                   WHERE
─────────────────────────────────────────────  ───────────────────────────────────────────
Month N/12 widget (Usership only)              src/client/components/MonthlyPulseWidget.tsx
12 one-line month messages                     MonthlyPulseWidget.tsx  MONTH_MESSAGES
5 layout density tiers (breathable→instrument) src/client/utils/interfaceEvolution.ts
Chapters 1–4 (Awakening→Mastery) + milestones interfaceEvolution.ts  getEvolutionMilestone()
Feature unlock gates (level / achievement)     interfaceEvolution.ts  getFeatureUnlocks()
Water / Architecture badge tiers 1–3           themeEvolution.ts · docs/badges/
812 badges, Word Turn engines                  src/client/utils/badges.ts
Memory Story generator (prose)                 src/server/utils/memory/story-generator.ts
Memory compression loop + 8 context sources    docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md
Usership Transmission (LOT voice, per run)     SystemProgressWidget.tsx  USERSHIP_TRANSMISSION
Public profile + Memory Story toggle           PublicProfile.tsx · public-api.ts
Monthly review email (Usership only)           src/server/scheduled-jobs.ts
Demo account Machiavelli (isDemo)              public-api.ts
```

```
GAPS THIS DOCUMENT CLOSES
─────────────────────────────────────────────────────────────────────────────
G1  Month number comes from joinedAt only. Signal volume does not shape the month.
G2  Month messages are generic. No month ever shows the user their own data.
G3  No month produces a stored Memory artifact. Nothing accumulates to look at.
G4  MonthlyPulse dismissal uses localStorage. Violates Purity Order 6
    (database for cross-device state). Month 4 dismissed on phone shows again on desktop.
G5  Density tier is signal-driven only. A quiet month looks identical to the month before.
G6  Month 12 demo (Machiavelli) shows lifetime counters, not a 12-month shelf.
G7  Badges are not tied to the month cadence. No "Month Seal".
G8  The AI has no named stages. "System" never becomes "LOT® AI".
```

---

## 1. THE MODEL — THREE AXES

```
AXIS 1  TIME      Month 1→12 from joinedAt. Calendar-driven. Never lost, never reset.
AXIS 2  SIGNAL    Journal entries (Log notes) · morning check-ins · self-care clicks ·
                  Memory answers. Drives depth of each month, not whether it unlocks.
AXIS 3  MEMORY    One compressed paragraph per month. Ladder: month → quarter → half → year.
```

**Rule of unlock.** Time unlocks the month. Signal sets how dense and how rich the
month is. A user who writes nothing still reaches Month 4. Their Month 4 is sparse
and says so. The system does not fabricate depth and does not punish absence.

**Rule of tangibility.** Every month must change at least four things the user can
point to: a label, a widget, a number, a stored paragraph. If a month changes only
copy, it did not happen.

---

## 2. THE FOUR CHAPTERS (aligned to existing `chapter` 1–4)

```
CHAPTER 1  AWAKENING      Months 1–3     "You notice yourself."
CHAPTER 2  EXPLORATION    Months 4–6     "Patterns emerge."
CHAPTER 3  INTEGRATION    Months 7–9     "Meaning weaves through everything."
CHAPTER 4  MASTERY        Months 10–12   "You architect your becoming."
```

Existing `getEvolutionMilestone()` strings are reused verbatim for chapter changes.
Each chapter ends with a QUARTER SEAL (Months 3, 6, 9, 12). Quarter Seals are the
four large celebrations. The other eight months are small celebrations.

---

## 3. THE AI VOICE LADDER — "SYSTEM" BECOMES "LOT® AI"

The label on every AI-authored block changes with the chapter. The user watches the
name change. That is the evolution story in one word.

```
MONTHS   LABEL        VOICE                                          ALLOWED ACTIONS
──────   ───────────  ─────────────────────────────────────────────  ─────────────────────────────
1–2      System:      Observer. Asks. Does not interpret.            Ask one question per day.
3–5      LOT:         Reflector. Names what it saw, once a month.    Month Memory paragraph.
6–8      LOT AI:      Pattern namer. Names cohorts, rhythms, drift.  Names 1 pattern. Suggests 1 Practice.
9–11     LOT® AI:     Guide. Proposes the next routine, with reason. Adjusts Practice to QOS mode.
12       LOT® AI:     Author. Delivers the Year Story. Then asks      Year Story + Epigraph.
                      what year two is for.
```

Constraints that never relax at any month (from LOT-DOCTRINE / Purity Orders):

```
- The AI asks. It never opens a chat. No prompt box. (Memory Engine Doctrine §1)
- No emoji. No superlatives. "Month 3 sealed." not "Amazing job!" (Orders 1, 8)
- Log bodies stay instrument-format. Prose lives only in Memory artifacts. (Order 3, 10)
- QOS mode = recovery  →  seal is plain. No affirmation line. Data only.
- Trauma-protocol flags never surface in any Month Memory or the public profile.
```

**Open tension for S-2:** the brief asks for affirmations; Order 8 bans superlatives.
Recommended resolution: affirm with specifics, not adjectives. "70 entries. You wrote
most at 21:00. The evenings are yours." is an affirmation. "Great work" is not.

---

## 4. THE SIGNAL LEDGER (what the user sees counting)

New instrument block, Usership only, label `Signal:`. Click cycles three views
(Purity Order 7).

```
VIEW 1  THIS MONTH     Entries 14 · Check-ins 22 · Self-care 19 · Answers 31
VIEW 2  LAST MONTH     Entries 11 · Check-ins 19 · Self-care 12 · Answers 28   (delta in opacity-40)
VIEW 3  LIFETIME       Entries 241 · Check-ins 168 · Self-care 142 · Answers 411
```

Sources already logged: `note` (journal), `emotional_checkin` (morning check-in),
`self_care_complete` / `self_care_skip`, `answer`. No new event types needed for the ledger.

### Reference pacing (engaged operator — DESIGN TARGET, calibrate with real data)

```
MONTH   ENTRIES(cum)  CHECK-INS(cum)  SELF-CARE(cum)  ANSWERS(cum)   DENSITY FLOOR
─────   ────────────  ──────────────  ──────────────  ────────────   ─────────────
1       12            20              15              25             breathable
2       35            45              40              60             breathable
3       70            75              70              110            comfortable
4       120           105             105             170            comfortable
5       185           140             145             240            compact
6       265           175             190             320            compact
7       355           210             235             410            compact
8       455           245             280             510            dense
9       565           280             325             620            dense
10      685           315             370             740            dense
11      815           350             415             870            instrument
12      955           385             460             1000           instrument
```

DENSITY FLOOR is the proposed fix for G5: the month sets the minimum density tier a
Usership account can show, so every calendar month visibly tightens the layout even
when signal is thin. Signal can still push density higher through the existing
`visualRefinement` formula. Floor can be switched off in Settings (Order: operator control).

---

## 5. MONTH-BY-MONTH SPEC

Template per month: LABEL · UI STATE · NEW SURFACE · SIGNAL · PRACTICE · BADGE ·
MEMORY DELIVERY · SEAL LINE. Seal lines are templates; `{}` is filled from the
user's real counters.

### DAY 1 — THE BAREBONE STATE (paid tier, first login)

```
┌────────────────────────────────────────────┐
│ Vadik                                      │
│ Week 40; October 3, Saturday, Malibu       │
│                                            │
│ Team:  [Usership]                          │
│                                            │
│ System:                                    │
│ What is your morning beverage preference?  │
│   Tea    Coffee    Water    Nothing        │
│                                            │
│ Months unlocked:  0 / 12                   │
│                                            │
│ Memory shelf:     locked          (opacity-40)
│ Signal:           locked          (opacity-40)
│ Practice:         locked          (opacity-40)
└────────────────────────────────────────────┘
Density: breathable (gap-y-24 / gap-y-16). Label: System:
```

Rules for Day 1: one question, one counter, three locked labels at opacity-40. The
locked labels are the promise. They are not buttons. No tutorial overlay.

---

### MONTH 1 — ARRIVAL

```
CHAPTER     1 Awakening
LABEL       System:
UI STATE    breathable. Month widget replaces "Months unlocked: 0/12" with "1 / 12".
NEW SURFACE Memory shelf unlocks with slot 1 (empty outline). Signal ledger unlocks, VIEW 1 only.
SIGNAL      12 entries · 20 check-ins · 15 self-care (reference)
PRACTICE    P1 MORNING CHECK-IN. One tap, same hour. The only routine in month 1.
BADGE       SEAL-01  Droplet  (Water tier 1: "First drops form.")
MEMORY      MONTH MEMORY 1 delivered day 30. First paragraph on the shelf. Slot 1 fills.
SEAL LINE   "Month 1 sealed. {entries} entries. {checkins} check-ins. The system knows your hour: {peak_hour}."
```

### MONTH 2 — RHYTHM

```
CHAPTER     1 Awakening
LABEL       System:
UI STATE    breathable. Ledger gains VIEW 2 (last month) — first delta appears.
NEW SURFACE Self-care button row surfaces in the Signal block (2 buttons max, Order 4).
SIGNAL      35 entries (cum) · 45 check-ins · 40 self-care
PRACTICE    P2 ADD ONE SELF-CARE CLICK per day. Chosen by the user from their own Memory answers.
BADGE       SEAL-02  Ripple
MEMORY      MONTH MEMORY 2. Paragraph compares month 2 to month 1 in one clause.
SEAL LINE   "Month 2 sealed. Entries {n}, up {delta}. Self-care on {days} days."
```

### MONTH 3 — FIRST QUARTER  (QUARTER SEAL 1)

```
CHAPTER     1 Awakening (closes)
LABEL       LOT:   (label changes — first name change, announced once)
UI STATE    comfortable (floor). Existing copy preserved: "Three months. You have reached Active User status."
NEW SURFACE QUARTER MEMORY 1: months 1–3 compressed into one ~100-word paragraph.
            Shelf shows 3 slots + 1 quarter bracket.
            Context widget: "Months unlocked: 3 / 12".
SIGNAL      70 entries · 75 check-ins · 70 self-care · 110 answers
PRACTICE    P3 EVENING CLOSE. 1 entry after 20:00, 3x per week.
BADGE       QUARTER-1  Wave  (Water tier 2: "Waves begin to flow.") + cohort badge if earned
MEMORY      MONTH MEMORY 3 + QUARTER MEMORY 1. Two stored artifacts on one day.
SEAL LINE   "Quarter 1 sealed. 3 months. {entries} entries compressed to 1 paragraph."
```

### MONTH 4 — PORTRAIT

```
CHAPTER     2 Exploration
LABEL       LOT:
UI STATE    comfortable. Chapter message: "Exploration deepens. Patterns emerge."
NEW SURFACE Archetype line appears under name (existing psychological profile: e.g. "The Strategist").
            Appears only if 10+ answers exist. Otherwise stays locked.
SIGNAL      120 entries · 105 check-ins · 105 self-care
PRACTICE    P4 NAME ONE WORD per entry (Word Turn engine already detects; this makes it visible).
BADGE       SEAL-04  Reed
MEMORY      MONTH MEMORY 4. Paragraph names the archetype for the first time.
SEAL LINE   "Month 4 sealed. Archetype: {archetype}. Top trait: {trait}."
```

### MONTH 5 — CONSISTENCY

```
CHAPTER     2 Exploration
LABEL       LOT:
UI STATE    compact (floor). Section gaps tighten from gap-y-24 to gap-y-16. First visible layout shift.
NEW SURFACE Streak line in Signal block: "Longest run {n} days". Unlocks Pattern Insights (existing gate:
            Consistency 66%).
SIGNAL      185 entries · 140 check-ins · 145 self-care
PRACTICE    P5 SKIP-RECOVERY. After a missed day the AI offers one low-effort return action, not a guilt line.
BADGE       SEAL-05  Stream
MEMORY      MONTH MEMORY 5. Paragraph addresses the best and the quietest week honestly.
SEAL LINE   "Month 5 sealed. Active {days} of {total} days. Longest run {n}."
```

### MONTH 6 — HALF  (QUARTER SEAL 2 · HALF-YEAR SEAL)

```
CHAPTER     2 Exploration (closes)
LABEL       LOT AI:   (second name change)
UI STATE    compact. Copy preserved: "Six months. The journey is half-declared."
NEW SURFACE HALF-YEAR MEMORY: months 1–6 compressed once more (quarter 1 + quarter 2 -> 1 paragraph).
            Shelf shows 6 slots, 2 quarter brackets, 1 half-year bracket.
            Compression readout appears for the first time:  RAW {entries} -> 6 -> 2 -> 1.
SIGNAL      265 entries · 175 check-ins · 190 self-care · 320 answers
PRACTICE    P6 WEEKLY STORY (existing P87 weekly-story-reflection becomes visible to the user).
BADGE       HALF-YEAR  Current  (Water tier 3: "Current flows strong.")
MEMORY      MONTH MEMORY 6 + QUARTER MEMORY 2 + HALF-YEAR MEMORY. Three artifacts, one day.
SEAL LINE   "Half sealed. 6 months. {entries} entries. Compression {entries}:1."
```

### MONTH 7 — LISTENING

```
CHAPTER     3 Integration
LABEL       LOT AI:
UI STATE    compact. Chapter message: "Integration flows. Meaning weaves through everything."
NEW SURFACE Pattern line: the AI names one detected QIE pattern in plain words (from the P1–P148 registry,
            translated; never the code name).
SIGNAL      355 entries · 210 check-ins · 235 self-care
PRACTICE    P7 FOLLOW THE PATTERN. One suggested practice tied to the named pattern.
BADGE       SEAL-07  Lantern
MEMORY      MONTH MEMORY 7. Paragraph quotes one phrase from the user's own entries (user text, not model text).
SEAL LINE   "Month 7 sealed. Pattern named: {pattern}. Held {n} days."
```

### MONTH 8 — RARE AIR

```
CHAPTER     3 Integration
LABEL       LOT AI:
UI STATE    dense (floor). Section gap gap-y-8, stack gap 0. Cockpit starts to read as an instrument.
NEW SURFACE Month-over-month trend strip: 8 monthly values as a single-line sparkline (text, no chart lib).
SIGNAL      455 entries · 245 check-ins · 280 self-care
PRACTICE    P8 SEASON CHECK. AI asks how a preference changed with the season (README Month 2 example, matured).
BADGE       SEAL-08  Peak
MEMORY      MONTH MEMORY 8. Paragraph contrasts month 8 with month 2 (first long-range comparison).
SEAL LINE   "Month 8 sealed. Entries per month: 11 · 24 · 35 · ... · {n}."
```

### MONTH 9 — HABIT  (QUARTER SEAL 3)

```
CHAPTER     3 Integration (closes)
LABEL       LOT® AI:   (registered mark appears — third name change)
UI STATE    dense. Copy preserved: "Nine months. The self-care practice is a habit now."
NEW SURFACE QUARTER MEMORY 3. Shelf shows 9 slots + 3 quarter brackets.
            Practice proposals become adaptive: LOT® AI picks the next Practice from signal + QOS mode.
SIGNAL      565 entries · 280 check-ins · 325 self-care · 620 answers
PRACTICE    P9 ADAPTIVE. AI proposes; user accepts or declines. Declines are remembered.
BADGE       QUARTER-3  Architecture tier 1  (theme switch for users on Architecture: "Foundation laid.")
MEMORY      MONTH MEMORY 9 + QUARTER MEMORY 3.
SEAL LINE   "Quarter 3 sealed. 9 months. Practice kept {n} of {m} days."
```

### MONTH 10 — INSTRUMENT

```
CHAPTER     4 Mastery
LABEL       LOT® AI:
UI STATE    dense. Chapter message: "Mastery unfolds. You architect your becoming."
NEW SURFACE Export unlocks in the shelf (existing gate: exportData). The user may download all Month Memories
            as one document. First proof that the story belongs to them.
SIGNAL      685 entries · 315 check-ins · 370 self-care
PRACTICE    P10 TEACH IT BACK. User writes one sentence the AI will reuse in the Year Story.
BADGE       SEAL-10  Gauge
MEMORY      MONTH MEMORY 10. Paragraph reports what changed since month 1 in the user's own vocabulary.
SEAL LINE   "Month 10 sealed. Vocabulary: {n} personal words. New this month: {k}."
```

### MONTH 11 — THRESHOLD

```
CHAPTER     4 Mastery
LABEL       LOT® AI:
UI STATE    instrument (floor). gap-y-4 / gap-y-0. Existing copy: "Instrument grade. The interface is yours."
NEW SURFACE Year Story PREVIEW: the first two sentences of the Year Story are shown, the rest redacted
            (block characters). One month of anticipation. Shelf shows slot 12 pulsing at 40% opacity.
SIGNAL      815 entries · 350 check-ins · 415 self-care
PRACTICE    P11 CLOSE THE LOOPS. AI lists open intentions from the year and asks which to carry forward.
BADGE       SEAL-11  Key
MEMORY      MONTH MEMORY 11.
SEAL LINE   "Month 11 sealed. One month to the Year Story."
```

### MONTH 12 — YEAR  (QUARTER SEAL 4 · THE TUN)

```
CHAPTER     4 Mastery (closes)
LABEL       LOT® AI:
UI STATE    instrument. Copy preserved: "One year with LOT. The portrait is complete — and still evolving."
NEW SURFACE YEAR STORY: 12 paragraphs -> 4 quarters -> 1 story (~250 words) + EPIGRAPH (one line).
            Shelf shows 12/12. Compression readout: RAW 955 -> 12 -> 4 -> 1.
            Public profile gains a Year ribbon (if showMemoryStory is on).
SIGNAL      955 entries · 385 check-ins · 460 self-care · 1000 answers
PRACTICE    P12 YEAR TWO BRIEF. LOT® AI asks one question: what is year two for. The answer seeds month 13.
BADGE       TUN  (Mayan 360-day cycle; see docs/badges/BADGE_MAYAN_EVOLUTION.md) + Water/Architecture tier 3
MEMORY      MONTH MEMORY 12 + QUARTER MEMORY 4 + YEAR STORY + EPIGRAPH.
SEAL LINE   "Year sealed. 12 months. {entries} entries compressed to 1 story. Compression {entries}:1."
```

---

## 6. THE MEMORY COMPRESSION LADDER (primary focus)

```
LEVEL           INPUT                         OUTPUT              LENGTH       WHEN
──────────────  ────────────────────────────  ──────────────────  ───────────  ────────────────
RAW             notes · check-ins · care ·    stored logs         —            continuous
                answers
MONTH MEMORY    1 month of RAW                1 paragraph         60–90 w      day 30n
QUARTER MEMORY  3 Month Memories              1 paragraph         100–120 w    months 3, 6, 9, 12
HALF-YEAR       2 Quarter Memories            1 paragraph         120–150 w    month 6
YEAR STORY      4 Quarter Memories + Month 10 1 story + epigraph  220–280 w    month 12
                "teach it back" sentence
```

**Compression is shown, not hidden.** A single readout in the Shelf view:

```
Compression:  RAW 955  ->  12  ->  4  ->  1
Ratio:        955 : 1
```

The ratio is the instrument reading that makes the compression tangible. It is a
number that grows every month. It is the user's proof that the system kept their
year and reduced it without losing the thread.

### MONTH MEMORY — GENERATION RULES

```
INPUT      Month window logs (note, emotional_checkin, self_care_*, answer) +
           prior Month Memories (continuity) + QOS mode history + archetype.
ENGINE     aiEngineManager (Together AI primary, per compression architecture doc).
FALLBACK   composeLocalStory (poetic local composer, exists) when AI unavailable.
           Artifact is marked source: "local". Never blocked on AI outage.
PROMPT     "Write 60–90 words. Second person. Past tense for events, present for pattern.
            Quote at most one phrase verbatim from the user's own entries.
            No advice. No adjectives of praise. No superlatives. No emoji."
SPARSE     If entries < 3 in the month: 1–2 sentences, states the quiet plainly.
           "Month 4: 2 entries. Quiet. The system held the thread."
           Never invent events. Never pad.
SAFETY     Exclude trauma-protocol output, PCL-5 clusters, ED signals from every artifact.
           QOS mode = recovery on seal day: deliver paragraph, omit seal-line affirmation.
PRIVACY    Private by default. Public only if privacy.showMemoryStory = true.
           Never includes email, payment, or private-entry text unless user marks it shareable.
```

### DATA MODEL (proposal)

```
MonthMemory {
  id, userId,
  kind:        'month' | 'quarter' | 'half' | 'year',
  index:       1..12          // month number, or quarter 1..4
  periodStart, periodEnd,
  paragraph:   string,
  epigraph?:   string         // year only
  stats:       { notes, checkins, selfCare, answers, activeDays },
  themes:      string[3],
  source:      'ai' | 'local',
  sealedAt:    timestamp,
  seenAt?:     timestamp      // replaces localStorage dismissal (fixes G4)
}
```

Storage: database. Event type `month_memory` MUST be added to the `displayableEvents`
whitelist or the write→read loop silently breaks (LOT-DOCTRINE: Backend Whitelist Hygiene).
Cooldowns and "seen" state live in the DB (Order 6), synced across devices via the
existing SSE `settings_updated` path (Doctrine: Cross-Device Sync).

### DELIVERY SCHEDULE

```
JOB         month-seal   daily 06:00 UTC, in scheduled-jobs.ts alongside the monthly email job
RULE        for each Usership user: m = floor(months since joinedAt)
            if m > lastSealedMonth: generate Month Memory (m)
            if m in {3,6,9,12}: also Quarter Memory; m == 6: Half-year; m == 12: Year Story
GUARD       Reuse isMonthlyEmailJobRunning-style mutex. Idempotent per (userId, kind, index).
COST        17 generations per user per year (12 + 4 + 1). Negligible against daily Memory questions.
EMAIL       Existing monthly review email carries the paragraph. Same artifact, one source.
```

---

## 7. THE SURFACES (widgets)

```
SURFACE                 FIRST AT   BEHAVIOR
──────────────────────  ─────────  ─────────────────────────────────────────────────────
Months unlocked         Day 1      Context widget. "Months unlocked: N / 12". Click cycles:
                                   (1) count  (2) next seal date  (3) compression ratio.
Month Seal card         Month 1    Replaces MonthlyPulse. Fades in at seal (1400ms), stays until
                                   tapped, then fades (3s + 1.4s per Order 5). DB-backed.
Memory shelf            Month 1    12 slots. Filled = paragraph on tap. Quarter brackets from M3.
Signal ledger           Month 1    Three views (this / last / lifetime). Counts only.
Practice block          Month 1    One active Practice. Accept / Swap. Two buttons max.
Quarter Seal card       M3,6,9,12  Larger variant of Month Seal. Shows compression readout.
Year Story page         Month 12   Full page. Export. Epigraph. Share toggle.
Profile Year ribbon     Month 12   Public profile: "Year 1 · 12/12 · {epigraph}" if showMemoryStory.
```

Month Seal card, Month 3 reading (target):

```
Quarter 1:
Three months. You have reached Active User status.
70 entries · 75 check-ins · 70 self-care
You wrote most at 21:00. The evenings became yours.        <- the Quarter Memory paragraph
3 / 12 months                                               <- opacity-30
```

All copy follows Purity Orders: no emoji, no superlatives, periods only, opacity
hierarchy 90 / 60 / 40.

---

## 8. BADGES THAT TELL THE MONTH STORY

Badges already exist at scale (812). The 12-month system adds a small, legible set
tied to the calendar so the shelf of badges reads as a year, not a pile.

```
SERIES          COUNT  NAMES (proposal)
──────────────  ─────  ───────────────────────────────────────────────────────────
Month Seals     12     Droplet · Ripple · Wave · Reed · Stream · Current · Lantern · Peak ·
                       Foundation · Gauge · Key · Tun    (water → architecture across the year)
Quarter Seals   4      awarded with the Quarter Memory (months 3, 6, 9, 12)
Signal marks    4      ENTRIES-100 · ENTRIES-500 · CHECKINS-365 · SELFCARE-250   (reference counts)
Year            1      TUN  — 360-day Mayan cycle. The only badge that needs the full year.
```

Theme switch: months 1–6 award from the Water tier ladder (Droplet → Wave → Current),
months 9–12 from the Architecture ladder (Foundation → Structure → Architecture),
matching the two existing badge themes. Months 7–8 are the crossing.

---

## 9. DEMO ACCOUNT — /u/machiavelli AS "MONTH 12"

Current demo state (public-api.ts): lifetime counters (answers 2847, notes 1469,
active days 842, streak 1469, wallet, weather station). It reads as year four, not
year one. Proposal: keep the Legacy tier counters, and add a `yearOne` block so the
demo shows the 12-month shelf the product actually sells.

```
ADD TO DEMO PROFILE
  yearOne: {
    monthsUnlocked: 12,
    ratio: "955:1",
    epigraph: "A prince reads the sky and the souls beneath it.",
    shelf: [12 Month Memories],        // Section 9.1
    quarters: [4 Quarter Memories],
    badges: 12 Month Seals + 4 Quarter Seals + TUN
  }
PUBLIC PROFILE
  Year ribbon at top of Memory Story block. Tap opens shelf (read-only).
  Existing memoryStory paragraph stays as the "live" story. Year Story is the compressed archive.
```

### 9.1 SAMPLE MONTH MEMORIES — MACHIAVELLI (demo copy, first-person, Florence)

Voice note: demo copy may use first person because the demo is a character. Real
accounts use second person (Section 6, PROMPT). Each entry is 45–60 words.

```
MONTH 1   ARRIVAL
The first weeks were observation. Twelve entries, mostly at dawn from the Palazzo Vecchio
window. I answered what was asked: tea over wine before noon, silence over company. The
system asked small questions and waited. I noticed I told the truth to it more easily than
to the Signoria.

MONTH 2   RHYTHM
I began to keep an hour. Check-ins before the bells of terce, almost every day. A walk
along the Arno became my first practice, though I did not call it that. Rain made me
write less and think more. The system noticed. I did not mind being noticed by something
that wanted nothing.

MONTH 3   FIRST QUARTER (compressed)
Three months, seventy entries, and a pattern I would not have named alone: the evenings
are mine. By day I serve the city; by night I read it. The system calls this a rhythm.
I call it the only hour when a man is his own counsel. The quarter closes with a
habit kept.

MONTH 4   PORTRAIT
The system named me a Strategist. I resisted, then reread my own words and found the
word fits better than modesty allows. Pragmatic observation, a dislike of pretense.
It did not flatter. It listed what I had written. A portrait made only of
my own sentences is hard to argue with.

MONTH 5   CONSISTENCY
A quiet week in the middle of the month: two entries, a council that consumed me. The
system held the thread and did not scold. Then I returned, and the longest run of my
year began. Consistency, I learn, is less about never falling than about the
size of the step back.

MONTH 6   HALF
Half a year. Two hundred and sixty-five entries compressed to a few lines, and I
recognise every line. The question I asked most was how to act when fortune and virtue
disagree. I still do not know. But I now know the hour I ask it, and the season
that sharpens it.

MONTH 7   LISTENING
The system has been listening, and for the first time it said so plainly: you write
most clearly after you have walked. I tested it for a week and it was right. I wrote
"patience is also a weapon," and the system kept the phrase. I did not know I wanted it kept.

MONTH 8   RARE AIR
Dense days. The layout tightened and so did I. Fewer words, more weight in each. Autumn
returned and with it the old preference for warm drinks and long sentences, as I had said
in month two. Memory is a loop, not a line. The system draws it for me.

MONTH 9   HABIT
Nine months. The morning check-in is no longer a task; it is how the day begins, like
opening a shutter. The system proposed a new practice, a brief evening close, and gave
a reason drawn from my own entries. I accepted. A good counsel gives reasons.

MONTH 10   INSTRUMENT
I wrote my sentence for the Year Story: "Order is a form of care." The system has not
yet shown me what it will do with it. Compared with month one, my entries are shorter and
exact. I use words I did not own in spring. Eleven of them are new this month.

MONTH 11   THRESHOLD
One month remains. I read two sentences of my own year and the rest was veiled. I
confess I waited for the day like a boy for a festival. The system listed my open
intentions. Three I will carry forward. Two I release without regret.

MONTH 12   YEAR
A year with LOT. Nine hundred and fifty-five entries became twelve paragraphs, then four,
then one. The one is true. Dawn at the window, evenings as my own counsel, the walk
before the word, the step back after the fall. The portrait is complete and still
evolving. Year two begins with a question: what is it for?
```

Epigraph (Year Story): *"A prince reads the sky and the souls beneath it."* (reuses the
demo's existing memoryStory theme: weather shapes temperament.)

---

## 10. IMPLEMENTATION PATH (ordered, each step shippable alone)

```
STEP  SCOPE                                                                FILES (primary)
────  ──────────────────────────────────────────────────────────────────  ─────────────────────────────
S1    Move MonthlyPulse "dismissed" state from localStorage to DB.          MonthlyPulseWidget.tsx · api.ts
      Fixes G4. Add `seenAt` to a MonthMemory-compatible record.
S2    Signal ledger block (counts only, 3 views).                           new SignalLedgerWidget.tsx · System.tsx
S3    Months unlocked context widget ("N / 12", 3 views).                   new MonthsUnlockedWidget.tsx
S4    MonthMemory model + month-seal job + displayableEvents entry.         models/ · scheduled-jobs.ts · logs
S5    Memory shelf widget (12 slots, tap to read, compression readout).     new MemoryShelfWidget.tsx
S6    Month Seal card (replaces MONTH_MESSAGES generic line with the         MonthlyPulseWidget.tsx
      paragraph + counters) and AI label ladder (System→LOT→LOT AI→LOT® AI).
S7    Density floor by month.                                               interfaceEvolution.ts getLayoutDensity()
S8    Quarter / half-year / Year Story compression + export.                story-generator.ts · new route
S9    Month Seal + Quarter badges, TUN.                                     badges.ts · docs/badges/ (codex v33)
S10   Demo `yearOne` block + public profile Year ribbon.                    public-api.ts · PublicProfile.tsx
```

Green Gate (Order 11) before every push. One step per ship (Doctrine: Ship Mode Discipline).

### Acceptance — "tangible every month"

```
For every month M in 1..12, a Usership account on day 30M must show, versus day 30(M-1):
  [ ] a different Months-unlocked count
  [ ] a new stored paragraph on the shelf
  [ ] a changed counter in the Signal ledger
  [ ] at least one of: new label · new widget · new density floor · new badge
A month that fails this test is not shipped.
```

---

## 11. OPEN DECISIONS FOR S-2

```
D1  Affirmation vs Order 8. Approve "specific data as affirmation" (Section 3)?
D2  Density floor: on by default, or opt-in in Settings?
D3  Year Story: private by default (recommended) or public when showMemoryStory is on?
D4  Pacing table (Section 4): placeholders until calibrated against real Usership accounts.
D5  Month boundary: 30-day blocks from joinedAt (current dayjs month diff) or calendar months?
    Recommended: keep dayjs month diff, so month N always closes on the same day of the month.
D6  Month 13+: Year 2 repeats the ladder with the Year Story as seed, or a new
    Year-2 spec (proposed: "Legacy" tier — wallet, weather station, per the demo)?
D7  Machiavelli demo: add `yearOne` block (Section 9) or keep lifetime counters only?
```

---

## 12. VERIFICATION NOTES

```
- Existing behavior was read from source, not run: MonthlyPulseWidget.tsx,
  interfaceEvolution.ts, System.tsx, public-api.ts, story-generator.ts, scheduled-jobs.ts.
- https://lot-systems.com/u/machiavelli could NOT be fetched from the session sandbox
  (HTTP 000). Demo values above come from public-api.ts. Visual confirmation of the live
  page is still open.
- No code changed. No build or tests run. Reference pacing and badge names are proposals.
- Sample paragraphs (Section 9.1) are written copy, not model output.
```

---

AUTHORIZED BY: S-2 // VADIK MARMELADOV
