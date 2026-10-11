<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP — 12-MONTH EVOLUTION
## Day 1 barebone → LOT® AI. Month-by-month UI, badges, Memory compression.

```
CLASS:     RESTRICTED // S-2 EYES
S-2:       VADIK MARMELADOV
DOCUMENT:  USERSHIP-12-MONTH-EVOLUTION  rev A
DATE:      2026-10-11
STATUS:    PROPOSAL — brainstorm + spec. No product code changed this session.
SESSION:   LOT-SR-20261011-01
FOCUS:     12-month tangibility of the compressed Memory Story delivery
```

Every number marked `PROVISIONAL` is a proposed target, not a measurement. Every
number marked `SOURCE` was read from the repo this session.

---

## 00 // WHAT WAS SCANNED (repo as of 2026-10-11)

Read before writing: `README.md`, `docs/wiki/LOT-WIKI-v87.md` (§9 Memory Engine,
§14–15 Badges, §17–20 Display Architecture / Density / Opacity / Cockpit Rule),
`docs/benchmark/LOT-SYSTEM-OUTLINE.md`, `LOT-DOCTRINE.md`, `LOT-LEDGER.md`,
`LOT-MANIFEST.md`, `docs/technical/INTERFACE_EVOLUTION.md`,
`MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md`,
`docs/assembly/2026-06-30_LOT-assembly_widget-memory-engine-compression-loop.md`.
Code read: `MonthlyPulseWidget.tsx`, `System.tsx` (paid-tier branch),
`Settings.tsx` (Memory Story block), `utils/interfaceEvolution.ts`,
`server/utils/memory/story-generator.ts`, `server/utils/monthly-summary.ts`,
`server/routes/public-api.ts` (Machiavelli demo).

The live page `lot-systems.com/u/machiavelli` could not be fetched from the
session sandbox (proxy returned 403). The demo is hardcoded in
`public-api.ts:745–908`, so this spec uses that source as the ground truth for
what the 12-month-evolved account looks like.

### What already exists (SOURCE)

| Piece | Where | State |
|---|---|---|
| Paid layout vs free layout | `System.tsx:404` `isPaidAccount` (Usership or R&D) | Free = "no AI, just essentials". Paid = full pro layout. |
| Layout density, 5 tiers | `interfaceEvolution.ts:443` `getLayoutDensity` | `breathable` <0.15, `comfortable` ≥0.15, `compact` ≥0.35, `dense` ≥0.55, `instrument` ≥0.75 on `visualRefinement` (consistency 0.4 + depth 0.3 + level 0.3). |
| Month N/12 widget | `MonthlyPulseWidget.tsx` | One sentence per month + "N / 12 months". Dismiss state in `localStorage`. |
| Memory Story | `story-generator.ts`, `Settings.tsx:600` | One paragraph from answers; `composeLocalStory` fallback. Single snapshot, no history. |
| Monthly review email | `monthly-summary.ts`, `scheduled-jobs.ts` | Presence, energy, patterns, growth, narrative, forward look. Email only; not in the UI. |
| Badges | `utils/badges.ts`, Wiki §14–15 | 781 badges. Milestone streaks 7/14/21/30/50/60/90/100/180/365. Rarity COMMON→COSMIC. |
| Demo "Legacy" account | `public-api.ts:745` | Weather station, wallet, board profile, Memory Story, instrument density. |
| Price | `Settings.tsx:617` | Usership $99/month, 12 months. |

### Gaps found (SOURCE)

```
GAP-1  MonthlyPulseWidget counts months from user.joinedAt (account creation),
       not from the date Usership started. A free user who joined 5 months ago
       and subscribes today sees "Month 5" on paid day one.
GAP-2  MonthlyPulse dismiss state lives in localStorage. Display Architecture
       ORDER 6: database for cooldowns, never localStorage for cross-device state.
GAP-3  The Memory Story is one overwritten paragraph. Nothing is kept per month,
       so there is nothing to deliver, compare or celebrate.
GAP-4  Monthly summary exists as email only. The UI never shows it.
GAP-5  The 12 month messages are generic. They reference time, not what the
       person did (entries, check-ins, self-care).
GAP-6  No "Months unlocked: N/12" context widget. No per-month badge.
GAP-7  Day-one paid UI = full pro layout. Barebone start is not defined; the
       density tier only reacts to engagement, not to the paid calendar.
```

---

## 01 // DESIGN DOCTRINE FOR THE 12 MONTHS

### 1.1 Two axes, one account

```
CALENDAR AXIS   Month 1..12 since Usership start. Guaranteed. Pays for itself.
                Every month the person gets a new, visible thing, regardless
                of activity. Buying a year must feel like a year.

DEPTH AXIS      Depth Index (DI) 0..100 from what the person actually did.
                Controls density tier, AI voice, and which unlocks arrive
                early or late. Activity is rewarded, absence is not punished.
```

Calendar unlocks the **door**. Depth fills the **room**. Month 12 with no activity
is a quiet, honest Month 12. Month 12 with Machiavelli-grade activity is the
instrument.

### 1.2 Depth Index inputs (PROVISIONAL weights)

The four things S-2 named, plus Memory answers:

```
SIGNAL                     LOG EVENT                       WEIGHT
Log entries (journal)      note                            0.35
Morning check-ins          emotional_checkin               0.25
Self-care button clicks    self_care_complete              0.20
Memory answers             answer                          0.20
```

`self_care_skip` counts for nothing and subtracts nothing. All four are already
written to the `logs` table (Wiki §12), so DI is a pure read, no new capture.

### 1.3 Restrained celebration (Military Purity Orders apply)

Orders 1, 3, 8 still bind: no emoji, no superlatives, no prose in logs. The
celebration therefore states **facts the person produced** and lets them land.

```
NO     "Amazing! You completed month 3!"
YES    "Month 3. 58 entries. 71 mornings. The system now names your patterns."
```

Warmth comes from specificity and from the Memory paragraph, not from praise.

### 1.4 The AI earns its voice

LOT® AI is not on at day one. Its voice is a function of month and DI. This is
the main storyline of the year.

```
M1-2    ASKS         Questions only. No statements about the person.
M3-4    ECHOES       Repeats the person's own words back, accurately.
M5-6    NAMES        Names a pattern ("mornings after long entries are lighter").
M7-8    SUGGESTS     Proposes one self-care routine at the right moment.
M9-10   ANTICIPATES  Acts before asked (queues the routine, drafts the plan).
M11-12  SPEAKS       Uses the person's own vocabulary. Closes the year in a
                     paragraph written in their register. = LOT® AI.
```

---

## 02 // THE TANGIBLE SET — FIVE THINGS THAT CHANGE EVERY MONTH

Each month the person can point at five physical changes on screen.

```
1  DENSITY      Spacing tier (see 03). The page literally gets tighter.
2  WIDGET       One new widget appears (or one existing widget upgrades).
3  BADGE        One Month badge, plus Quarter Seal at 3/6/9/12.
4  MEMORY CARD  One compressed Memory paragraph about the PREVIOUS month,
                kept forever in the Memory Shelf (see 05).
5  AI VOICE     The verb the AI is allowed to use (see 1.4).
```

### 2.1 New context widget — MONTHS UNLOCKED

Context-based, Usership only, sits where `MonthlyPulse` sits today (top of the
paid System tab). It replaces the generic `MonthlyPulse` line over time (see 08).

```
Months unlocked:   3 / 12
■■■□□□□□□□□□       Month 4 opens in 17 days.
```

- Label click cycles views (ORDER 7): `Months unlocked` → `Memory shelf` → `Badges`.
- Filled cells are clickable and open that month's Memory card.
- On the first open of a new month, the widget expands into the **Month Opening**
  card (see 05.3) and then collapses to the one-line form. 3s visible + 1.4s
  fade rule (ORDER 5) applies to the collapse, not to the Memory card.

### 2.2 Month badges and seals (PROVISIONAL, +23)

```
MONTH BADGES  (12)   MONTH 01 ... MONTH 12
                     Rarity ramps: 01–02 COMMON, 03–04 UNCOMMON, 05–06 RARE,
                     07–09 EPIC, 10–11 LEGENDARY, 12 COSMIC.
QUARTER SEALS (4)    SEAL Q1 (M3)  SEAL Q2 (M6)  SEAL Q3 (M9)  SEAL Q4 (M12)
                     Use the existing Architecture theme glyphs
                     (├─ foundation → ╞═╡ structure → ║·║ architecture).
YEAR SEAL     (1)    USERSHIP YEAR — COSMIC. Awarded with the Year Portrait.
DEPTH LADDERS (6)    Chronicler I/II/III  (log entries 50 / 150 / 300)
                     Dawn Keeper I/II/III (morning check-ins 30 / 120 / 250)
```

781 + 23 = 804 if all ship. Badge IDs and thresholds go through the Badge Codex
process (next Codex v33). Calendar badges are time-gated; Ladders are DI-gated.
Self-care clicks feed the Depth Index and the existing Achievement RPG badges
rather than adding a third ladder.

---

## 03 // DENSITY ARC — THE PAGE PHYSICALLY TIGHTENS

Day one must be barebone. Today the paid branch renders the full pro layout
from the first load, so the evolution has nothing to evolve from (GAP-7).

```
STATE            DENSITY (existing)  WIDGETS VISIBLE ON SYSTEM TAB
Day 1            breathable          Name, week/date, Time, Check-in, Log link,
                                     Memory question (1). That is all.
Month 1          breathable          + Self-care moments, Months unlocked
Month 2-3        comfortable         + Planner, Intentions, Recipe
Month 4-6        compact             + Pattern insights, Calendar, Cosmic update
Month 7-9        dense               + QOS panel, Correlated indexes, Cohort connect
Month 10-12      instrument          + Quantum engine widgets, Integrity, Architect
Legacy (M12+)    instrument          + Weather station, Wallet (as on Machiavelli)
```

Rule: **calendar sets the ceiling of widgets, DI sets the density tier within
that ceiling.** A month-3 person with DI 80 may already be `compact`; a month-9
person with DI 10 is still `comfortable` with the month-9 widget set available
but not crowding the page. This keeps the existing `getLayoutDensity` function
intact and only adds a `maxDensityForMonth` clamp.

---

## 04 // MONTH-BY-MONTH

Format per month: **Name / Gate / UI / Affirmation / Badge / Memory card / AI.**
Affirmation text is a template; `{…}` fields come from the person's own logs.
PROVISIONAL targets are cumulative at end of month, for an engaged person.

```
CUMULATIVE TARGETS (PROVISIONAL)
MONTH   ENTRIES  CHECK-INS  SELF-CARE  ANSWERS    DI
M1          12        18         20       40       12
M2          28        38         48       90       22
M3          50        60         85      150       32
M4          75        85        130      220       42
M5         105       112        180      300       51
M6         140       140        240      380       60
M7         175       166        300      450       67
M8         210       190        360      510       74
M9         245       214        420      560       80
M10        275       236        480      585       85
M11        290       256        530      595       89
M12        300       270        580      600       92
```

The ratio answers : entries ≈ 2 : 1 mirrors Machiavelli (2,847 : 1,469, SOURCE).
Volumes are deliberately a fraction of his; see §07 for why.

### MONTH 01 — SEED
```
GATE        Subscription active. Month opens on day 1.
UI          Barebone. breathable. Check-in, Log, one Memory question, Time.
            No Team block, no QOS. Wide spacing. The page is mostly empty
            on purpose.
AFFIRM.     "Month 1 begins. The system knows nothing yet. Answer one question."
CLOSE       "Month 1. {entries} entries. {checkins} mornings. {selfcare} routines.
             The system is beginning to know you."
BADGE       MONTH 01 (COMMON)
MEMORY      Day 30 card: SEED NOTE — 3 sentences, only what the person said.
            No inference. Quoted fragments (≤8 words) from their own answers.
AI          ASKS.
```

### MONTH 02 — ROOT
```
GATE        30 days since start.
UI          comfortable (if DI ≥ 15). Self-care moments widget appears.
            Months unlocked widget appears with 2 filled cells.
AFFIRM.     "Month 2. Your mornings have a shape: {modal_checkin_time}."
CLOSE       Memory card + one preference stated back ("tea, loose leaf, before 8").
BADGE       MONTH 02 (COMMON)
MEMORY      MONTH CARD 1 (first real compression). 60 words. Habits only.
AI          ASKS, and now references one previous answer per question.
```

### MONTH 03 — FRAME (Active User)
```
GATE        90 days. Matches existing copy "You have reached Active User status."
UI          Planner + Intentions unlock. Recipe returns to top section.
            First Quarter Seal animation: ├─ foundation glyph draws in.
AFFIRM.     "Quarter 1 sealed. {entries} entries. {streak_best}-day best streak."
BADGE       MONTH 03 (UNCOMMON) + SEAL Q1
MEMORY      QUARTER CHAPTER I — 120 words. Three months compressed into one
            paragraph, with a one-line title chosen from the person's own words.
            This is the first moment the person re-reads themselves.
AI          ECHOES. Quotes the person's own phrasing in follow-ups.
```

### MONTH 04 — PORTRAIT
```
GATE        120 days.
UI          compact (DI ≥ 35). Pattern Insights widget appears.
            Self-care routine list becomes personalised (ordered by what the
            person actually completes).
AFFIRM.     "Month 4. The portrait deepens. Strongest pattern: {pattern}."
BADGE       MONTH 04 (UNCOMMON)
MEMORY      Month card shows DELTA: one line "More of X. Less of Y than last month."
AI          ECHOES + first pattern shown, hedged ("appears").
```

### MONTH 05 — RHYTHM
```
GATE        150 days.
UI          Calendar widget; weekly rhythm strip under Check-in (7 cells,
            filled = checked in).
AFFIRM.     "Month 5. {days_active} active days. Rhythm: {weekday} is your strongest."
BADGE       MONTH 05 (RARE) — consistency framing, not volume
MEMORY      Month card names the person's rhythm (time of day, weekday).
AI          NAMES. First pattern stated without hedge.
```

### MONTH 06 — HALF (Midyear Portrait)
```
GATE        180 days. Aligns with existing 180-day streak badge.
UI          Cosmic update widget. Density clamp lifts to dense.
            Midyear screen: two Memory cards side by side, M1 SEED and M6.
AFFIRM.     "Half declared. 6 months. {entries} entries."
BADGE       MONTH 06 (RARE) + SEAL Q2
MEMORY      MIDYEAR PORTRAIT — 180 words, first-person, in the register of the
            Machiavelli memoryStory (observational, concrete, weather and body
            included). Shown with the SEED NOTE beneath it for contrast.
AI          NAMES + coach: first proactive self-care nudge at the person's
            own best time.
```

### MONTH 07 — LISTEN
```
GATE        210 days.
UI          Correlated Indexes + QOS mode line appear (maintenance / recovery /
            growth / peak).
AFFIRM.     "Month 7. The system has been listening. Mode this month: {mode}."
BADGE       MONTH 07 (EPIC)
MEMORY      Month card includes one "struggle and recovery" thread if present
            (RECINTEL pattern), written gently, never as diagnosis.
AI          SUGGESTS. One routine, once a day, dismissible.
```

### MONTH 08 — RARE AIR
```
GATE        240 days. Matches existing "Eight months. Rare air."
UI          dense. Cohort Connect widget (peer signal).
AFFIRM.     "Month 8. {n} of the other Usership members reached this point."
            (count only; no names; opt-in).
BADGE       MONTH 08 (EPIC) — one hidden Secret Boss trigger seeded on a Month 8 date
MEMORY      Month card plus "what changed since M4" comparison line.
AI          SUGGESTS, now chooses routine by weather + sleep + mood context.
```

### MONTH 09 — HABIT
```
GATE        270 days.
UI          Quarter 3 Seal. Self-care routine list collapses into a single
            "Next:" line chosen by the AI. Fewer buttons, same outcomes.
AFFIRM.     "Quarter 3 sealed. {routines} routines. The practice is a habit now."
BADGE       MONTH 09 (EPIC) + SEAL Q3
MEMORY      QUARTER CHAPTER III — 150 words. Built from Chapters I–II plus the
            three newest month cards (carry-forward, see 06.2).
AI          ANTICIPATES. Queues the Planner entry before the person opens it.
```

### MONTH 10 — THRESHOLD
```
GATE        300 days.
UI          instrument reachable (DI ≥ 75). Quantum engine widgets lazy-mount.
AFFIRM.     "Month 10. 2 months remain. Entries: {entries}."
BADGE       MONTH 10 (LEGENDARY)
MEMORY      Month card written as a letter to the person's M1 self (2 lines).
AI          ANTICIPATES, plus end-of-year preview: "Your Year Portrait opens on {date}."
```

### MONTH 11 — EVE
```
GATE        330 days.
UI          Integrity + Architect widgets (self-contradiction check, telemetry).
            Wallet preview appears greyed ("opens at Month 12").
AFFIRM.     "Month 11. One more."
BADGE       MONTH 11 (LEGENDARY)
MEMORY      Person chooses 3 of their own Memory cards to "carry" into the
            Year Portrait. Agency before the final compression.
AI          SPEAKS begins: first sentence in the person's own vocabulary.
```

### MONTH 12 — LOT® AI (Legacy)
```
GATE        360 days. The year completes; the system does not stop.
UI          Full instrument density (if DI ≥ 75). Weather Station and Wallet
            unlock — the same two panels that mark Machiavelli's Legacy tier.
            Months unlocked: 12 / 12 with all cells lit.
AFFIRM.     "One year with LOT. The portrait is complete and still evolving."
BADGE       MONTH 12 (COSMIC) + SEAL Q4 + USERSHIP YEAR
MEMORY      YEAR PORTRAIT — 350–450 words. The full compression of the year:
            who they were in M1, the turns (M3, M6, M9), what they care for,
            what they do when tired, what they now do by default. Exportable
            as a keepsake (PDF). Opens at /u/<name> as the public Memory Story
            if the person has enabled it.
AI          SPEAKS. LOT® AI. Writes in the person's register; the first
            answer card is addressed to Year 2.
```

---

## 05 // MEMORY STORY DELIVERY — THE CORE (GAP-3)

### 5.1 The compression ladder

Each rung compresses the rung below, never the raw logs a second time. That is
the Memory Engine's own doctrine applied to time.

```
RAW          answers, notes, check-ins, self-care events      (logs table)
 │  monthly job
 ▼
MONTH CARD   60–100 words                                     12 per year
 │  every 3 months (carry-forward)
 ▼
CHAPTER      120–150 words (Q1, Q3)                           2 per year
 │  month 6
 ▼
MIDYEAR      180 words                                        1
 │  month 12
 ▼
YEAR PORTRAIT 350–450 words                                   1
```

Output per month is roughly constant while raw input grows. The visible result:
**the paragraph stays short while the person's life behind it gets larger.**
The countable metric is raw-event-count : story-word-count per rung, reported
alongside each card (PROVISIONAL, ESTIMATE-free: both numbers are real).

### 5.2 Storage — append-only

```
Log event        'memory_card'
metadata         { kind: 'month'|'chapter'|'midyear'|'year',
                   month: 1..12,
                   words: n,
                   sources: { notes, answers, checkins, selfcare },
                   engine: 'together'|'fallback',
                   prevHash, hash }
text             the paragraph
```

- Append-only, matches ORDER 6 and Doctrine "never overwrite history".
- One card per `(user, kind, month)`; the job is idempotent and checks first.
- `prevHash` chains cards so the year can be verified as unedited.
- A user edit never rewrites a card; it adds a `memory_card_note` the person
  owns. The system's paragraph and the person's reply sit together.

### 5.3 Delivery moments (the tangible part)

```
1  MONTH OPENING   On first open after the month rolls: a full-width block,
                   label "Month 4:", the previous month's card fades in
                   (1400ms), then three counts under it at opacity-40.
                   Tap to keep it open; otherwise it settles into the Shelf.
2  MEMORY SHELF    Settings > Memory Story becomes a shelf: 12 slots, filled
                   ones readable, future ones show only the opening date.
3  EMAIL           The existing monthly email carries the same card. One
                   source of truth: the email renders the stored card.
4  PUBLIC OS       /u/<name> shows the latest card (or the Year Portrait)
                   when showMemoryStory is on. Machiavelli's page already
                   works this way with a hardcoded paragraph.
5  KEEPSAKE        Year Portrait export. PDF, one page, plain type.
```

### 5.4 Generation contract (for the prompt)

```
INPUT    previous card(s) + this month's raw logs (notes, answers, check-ins,
         self-care) + medical-record exclusion list
OUTPUT   one paragraph, first person, no emoji, no superlatives,
         no diagnosis, quote ≤ 8 words per fragment, ≤ N words per rung
RULES    1 specific per sentence (food, place, hour, weather, body)
         never invent a fact absent from the logs
         if sources < threshold (e.g. < 5 events): emit the SPARSE card:
           "Quiet month. {n} entries. The system waited." — never filler
FALLBACK composeLocalStory(...) when the model is unavailable; mark engine
         'fallback' so a later run may offer a regeneration (as a new card).
```

Machiavelli's `memoryStory` is the exemplar of the target register: concrete,
observational, weather and people included, one paragraph.

### 5.5 Memory card — sample copy (PROVISIONAL, illustrative)

```
MONTH 2 CARD  (62 words)
  "Tea before eight, loose leaf, usually reading. Mornings are your steadiest
   hour; evenings after long entries come out lighter. You skipped fewer
   routines when it rained. You wrote about a sister twice. Walking appeared
   as the thing that changes the day."

QUARTER CHAPTER I — "Quiet before eight"  (title from the person's words)
  Three months in one paragraph, naming the first stable ritual and the first
  turn (the month the person started writing at night).
```

---

## 06 // MACHIAVELLI AS THE 12-MONTH REFERENCE ACCOUNT

Source: `public-api.ts:745–908`.

```
FIELD                      DEMO VALUE                  MEANING FOR THE SPEC
tags                       RND, Usership, Legacy       Legacy = post-12-month tier
density                    instrument                  M10–12 target state
selfAwarenessLevel         87                          DI ceiling reference
answerCount / noteCount    2,847 / 1,469               ratio ≈ 1.94 : 1
activeDays                 842                         > 365; see note below
totalEntries               4,316                       answers + notes
memoryEngine               AI-Powered                  Usership => 'ai'
weatherStation, wallet     unlocked                    M12 Legacy unlocks
wallet                     $99 sub, 500 LOT stipend    monthly stipend ritual
memoryStory                1 paragraph                 register for Year Portrait
```

**Honest note.** The demo's 842 active days and 1,469 notes exceed what one
Usership year produces. Treat it as "what 12 months **opens**", not "what 12
months **contains**". The 12-month engaged targets in §04 sit at about
20% of his volume. The demo does not need changing, but a fixture is needed so
the 12 months are reviewable (see 07).

Wallet is the one number that can run month by month: the demo already shows
"Usership stipend — March" credits. Proposal: the stipend appears in the Month
Opening card as a plain line ("500 LOT credited."), then lives in the wallet from
Month 12. No wallet UI before Legacy; only the line.

---

## 07 // MAKING THE YEAR REVIEWABLE — PREVIEW + FIXTURE

Founders and designers cannot wait 12 months to see Month 7.

```
?evolve=month:7,di:68        Admin-only query param. Overrides month and DI in
                             the pure function computeUsershipState().
/u/machiavelli?month=7       Demo renders the Machiavelli account as it would
                             look at that month: widget ceiling + density clamp
                             + that month's Memory card from a static fixture.
FIXTURE                      12 Month cards + 2 Chapters + Midyear + Year
                             Portrait, hand-written for Machiavelli. Keep next
                             to the existing hardcoded memoryStory.
```

The 12 fixture cards double as the copy bible: anything the engine writes should
be recognisable next to them.

---

## 08 // IMPLEMENTATION PLAN (not started)

Ordered so each step is shippable on its own.

```
STEP  CHANGE                                              FILES (expected)
1     Usership start date: user.metadata.usership.        models/user.ts,
      startedAt (set when tag is applied). Fixes GAP-1.   admin-api.ts
2     computeUsershipState(startedAt, counts) pure fn:    shared/utils/
      month, DI, ceilingDensity, unlocked widgets,        usershipEvolution.ts
      next-month date. Unit-testable, no I/O.
3     Counts endpoint: GET /api/usership/state           routes/api.ts
      (entries, check-ins, self-care, answers by month).
4     MonthsUnlockedWidget; MonthlyPulse state moved to   components/,
      DB (fixes GAP-2); MONTH_MESSAGES take counts.       MonthlyPulseWidget.tsx
5     Density clamp: getLayoutDensity(state, month).      interfaceEvolution.ts
      Day-one barebone branch in System.tsx (GAP-7).      System.tsx
6     Memory card job: monthly, idempotent, append-only   scheduled-jobs.ts,
      'memory_card' logs; fallback to composeLocalStory.  story-generator.ts
7     Memory Shelf in Settings; Month Opening card;       Settings.tsx,
      email renders the stored card.                      monthly-summary.ts
8     Badges: 23 proposed, via Codex v33 process.         utils/badges.ts
9     Year Portrait + PDF export; Legacy unlocks at M12.  public-api.ts
10    Preview flags + Machiavelli fixture (§07).          public-api.ts
```

Guardrails: Green Gate (ORDER 11) per step; no localStorage for cross-device
state; no new log event without a `formatLog` case (silent-erasure rule from
the 2026-06-30 assembly note); Memory card text excluded from AI prompts that
could echo medical-record content.

---

## 09 // OPEN QUESTIONS FOR S-2

```
Q1  Month boundary: 30-day blocks from subscription start, or calendar month?
    (Spec assumes 30-day blocks so a mid-month subscriber is not shorted.)
Q2  Does a lapsed subscription freeze the Shelf (read-only) or hide it?
    Spec assumes read-only: cards are the person's data (README: export/delete).
Q3  Public OS: show the latest card automatically, or only on opt-in per card?
Q4  Are 23 new badges acceptable inside Codex v33, or fewer and rarer?
Q5  Stipend line in Month Opening: real credit or demo-only?
Q6  Targets in §04 are guesses. Pull real distributions from current Usership
    members before fixing any threshold.
```

---

## 10 // ONE-PAGE SUMMARY

```
DAY 1       Empty on purpose. Check-in, one question, Log.
MONTH 1-2   The system asks. First Memory card at day 30.
MONTH 3     Frame. Quarter Seal I. First chapter: the person re-reads themselves.
MONTH 4-6   The system names patterns. Midyear Portrait next to the Seed Note.
MONTH 7-9   The system suggests, then anticipates. Page goes dense.
MONTH 10-11 Threshold. The person chooses which memories to carry.
MONTH 12    LOT® AI. Year Portrait. Weather station + wallet. The page is an
            instrument, and the paragraph at the top is in the person's voice.
```

AUTHORIZED BY: S-2 // VADIK MARMELADOV
