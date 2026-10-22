```
================================================================================
LOT SYSTEMS / USERSHIP
DOCUMENT: LOT-USERSHIP-12-MONTH-EVOLUTION
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-22
STATUS:   DRAFT — design spec, no code shipped in this session
SESSION:  LOT-SR-20261022-01
================================================================================
```

# Usership: 12 months from barebone to LOT® AI

Day 1 of the paid tier is a quiet screen. Day 365 is the personal OS at
`lot-systems.com/u/machiavelli`. This document defines the thirteen states in
between (Stage 0 to Stage 12), what the operator sees at each one, and how the
compressed Memory Story is delivered at every monthly seal.

Scope: outline and brainstorm. Nothing here is wired yet. Section 10 lists the
files that would change.

---

## 0. Scan findings (what exists today)

Repository scanned before writing; all 7 doc roots and the Benchmark set
(MANIFEST, DOCTRINE, LEXICON, LEDGER) read; technical docs read for Memory
Engine compression, Interface Evolution, Style Guide.

```
EXISTS                                  WHERE                                         LIMIT FOR THIS SPEC
──────────────────────────────────────  ────────────────────────────────────────────  ─────────────────────────────────────────
MonthlyPulseWidget (Month N/12 line)    client/components/MonthlyPulseWidget.tsx      one sentence per month; no Memory content
Month anchor = dayjs(joinedAt)          same, monthNumber memo                        joinedAt is signup, not Usership start
Dismissal in localStorage               same, lot_pulse_<userId>                      per device; violates CROSS-DEVICE-SYNC
Month 0 renders nothing                 same, monthNumber < 1 -> return               Day 1 to Day 30 of the paid tier is silent
Interface Evolution (7 dimensions)      client/utils/interfaceEvolution.ts            driven by achievements + level, not tenure
Layout density, 5 levels                same, getLayoutDensity()                      breathable -> instrument, from visualRefinement
Feature unlocks (14 flags)              same, getFeatureUnlocks()                     same driver
Memory Story generator                  server/utils/memory/story-generator.ts        one rolling story; no per-month snapshots
Local story fallback                    composeLocalStory()                           lists answers; no compression
Monthly summary (email)                 server/utils/monthly-summary.ts               presence/energy/patterns/growth data ready
Weekly story pattern                    QIE P87 weekly-story-reflection               feeds the month roll-up
Self-care widget                        client/components/SelfCareMoments.tsx         click count not persisted as a month metric
Time-based badges                       client/utils/badges.ts (anniversary,          no 1..12-month badges
                                        cartographer 2y, triennial 3y ...)
Demo account                            server/routes/public-api.ts :745              static; no stage or month scrubber
```

Defects noticed while scanning (not fixed here):

1. `MonthlyPulseWidget` keys on `joinedAt`. A free user who upgrades in month 8
   would open Usership at "Month 8". The anchor must be the Usership start date.
2. Demo `boardTenureMonths` is computed from `1469-06-03`; it returns roughly
   6,000. For a 12-month showcase the displayed value must be capped at 12.
3. Demo wallet transactions are dated March 2026; stale.
4. Dismissal state is device-local, so a second device re-shows the pulse.

---

## 1. Design principles

```
P1  TENURE UNLOCKS, PRESENCE DEEPENS.
    The calendar opens each month. Activity decides how rich the month's
    compression is. A quiet month is never locked out and never shamed.

P2  THE AI ASKS, THEN IT REMEMBERS.
    Memory Engine doctrine holds: no chat. What changes across 12 months is
    the specificity of the question and the quality of the recall, not the
    amount of talking.

P3  EVERY SEAL CHANGES SOMETHING YOU CAN POINT AT.
    One layout step, one widget, one badge, one compressed paragraph. If a
    month leaves no visible difference, the month is not designed yet.

P4  MILITARY PURITY STILL APPLIES.
    No emojis, no superlatives, no exclamation marks. Celebration is a
    period and a number. COCKPIT-RULE: log bodies are instrument readings.
    The one exception is the Memory paragraph, which is prose by definition.

P5  GRACEFUL DEGRADATION.
    If compression fails (AI down, no signals), the month still seals with the
    deterministic local card. The client treats an absent card as "not
    computed", never as "denied".
```

---

## 2. Vocabulary (candidate LEXICON tokens)

```
TOKEN          MEANING
─────────────  ──────────────────────────────────────────────────────────────
STAGE          UI state of the account. Stage N = N monthly seals completed.
               Stage 0 is Day 1. Stage 12 is LOT® AI.
SEAL           The monthly event: Day 1 of Usership month N+1. Delivers Card N.
CARD           The compressed Memory Story for one month (paragraph + readings).
SPINE          Rolling summary of all prior cards, 120 words max. Input to the
               next compression so cost stays flat.
FIDELITY       THIN / STANDARD / RICH. How much signal the month contained.
               Changes card depth only. Never gates a stage.
YEAR BOOK      Stage 12 artifact: Spine + 12 cards, exportable.
```

---

## 3. The model

### 3.1 Stage and seal numbering

```
Day 1                 Stage 0   barebone UI     Months unlocked: 0/12
Day 1 + 1 month       SEAL 1    Card 1 delivered, Stage 1 opens
Day 1 + 2 months      SEAL 2    Card 2 delivered, Stage 2 opens
...
Day 1 + 12 months     SEAL 12   Year Book delivered, Stage 12 = LOT® AI
```

This matches the existing `MonthlyPulseWidget`: "Month N" is N completed months.
Thirteen stages, twelve seals.

### 3.2 Anchor date

`usership.startedAt`: set when the Usership tag is first granted (Stripe
webhook or admin). Fallback: `joinedAt`. Seals fire on the monthly anniversary
of that date in the operator's timezone. Month length varies; use
`dayjs().diff(start, 'month')`, as the pulse does today.

### 3.3 Fidelity targets (per period, proposed placeholders)

Calibrate against real cohort data before shipping. Thresholds: RICH >= 100% of
all three targets averaged, STANDARD >= 50%, THIN below.

```
        LOG ENTRIES        MORNING CHECK-INS      SELF-CARE CLICKS
SEAL    period   cumul.    days/30   cumul.       period   cumul.
─────   ──────   ──────    ───────   ──────       ──────   ──────
 1        25       25        12        12           15       15
 2        35       60        16        28           25       40
 3        50      110        17        45           35       75
 4        60      170        17        62           40      115
 5        70      240        18        80           45      160
 6        80      320        20       100           50      210
 7        90      410        20       120           55      265
 8       100      510        20       140           60      325
 9       110      620        20       160           65      390
10       120      740        20       180           70      460
11       130      870        20       200           75      535
12       130     1000        20       220           80      615
```

Machiavelli demo reads 4,316 total entries and 2,847 answers: RICH on every
seal by a wide margin. Fine for a showcase; see section 8.

### 3.4 What fidelity changes

```
THIN       30-45 words. States the record is short. No pattern claims.
           "Few signals this month. The record is short. It is enough to begin."
STANDARD   60-75 words. One named pattern, one carry-forward line.
RICH       80-100 words. One named pattern, one Echo (a quote or fact from an
           earlier card), one carry-forward line, badge gets the Rich mark (+).
```

No thin-month penalty. A returning operator after a gap gets a RE-ENTRY card
(one line: what the system kept while they were away).

---

## 4. Month-by-month

Columns per stage: theme, interface change, new surface, AI behaviour, badge.
Density follows the existing five levels.

```
STAGE  THEME           DENSITY       ARRIVES WITH THE SEAL
─────  ──────────────  ────────────  ───────────────────────────────────────────────
  0    Baseline        breathable    Greeting, Log, one daily Memory question,
                                     Self-care button, Team tag, Months unlocked 0/12
  1    Orientation     breathable    Card 1 shelf in Memory tab; MonthlyPulse becomes
                                     the Month Gate (section 5); morning check-in
                                     prompt appears
  2    Rhythm          breathable    Check-in streak line; Self-care shows today
                                     count; Months unlocked bar gains next-seal date
  3    Pattern         comfortable   First quarter: Q1 card (months 1-3 folded);
                                     Active User status; first named pattern in Memory
  4    Portrait        comfortable   Archetype line appears (existing Cohort engine);
                                     System label gains a section head
  5    Constancy       comfortable   Journal Reflection surfaces; weekly story visible
  6    Meridian        compact       Half-year: Q2 card; widget arrange unlocks; mid-year
                                     letter from the system; Spine becomes viewable
  7    Echo            compact       Memory questions begin quoting earlier answers;
                                     Echo line on every card
  8    Altitude        compact       /qi terminal introduction; Goal Journey surfaces
  9    Habit           dense         Q3 card; self-care suggestions reorder by what
                                     the operator actually completes
 10    Threshold       dense         Year Book draft opens (read-only, 10 of 12 pages);
                                     Months unlocked bar goes full-width
 11    Eve             dense         Letter to month 12: operator writes one line, the
                                     system seals it for the anniversary
 12    LOT® AI         instrument    Year Book, Q4 card, full instrument density,
                                     AI blocks relabelled "LOT® AI:", export
```

### 4.1 Detail per stage

**Stage 0. Baseline (Day 1).** Four things on screen. The operator learns the
loop: answer one question, press Self-care, write a Log line. Months unlocked:
0/12 with the line "Month 1 seals in 30 days." Nothing hidden, nothing locked
that looks locked; absent widgets simply are not there.

**Stage 1. Orientation.** First card. The Month Gate plays once. Check-in
prompt starts appearing at the local morning window (existing contextual timing).
Badge `usership_m01`.

**Stage 2. Rhythm.** The first thing the system measures is regularity, so it
shows regularity: a single line, `Check-ins: 16/30 days`. Badge `usership_m02`.

**Stage 3. Pattern.** First quarter fold. The Q1 card is longer than a month
card (one extra paragraph) and names the first pattern the system found.
Existing copy for Month 3 already says "Active User status"; keep it.
Badge `usership_m03` (uncommon).

**Stage 4. Portrait.** The archetype the Cohort engine has settled on appears
as a single line under the greeting. This is the first time the interface
says who the system thinks the operator is. Operator can correct it
(one tap: "Not quite"), which feeds the next question.

**Stage 5. Constancy.** Weekly stories (P87) become visible as a shelf under
the month. Four small cards feed one big card, so the operator sees the
compression pipeline working.

**Stage 6. Meridian.** Half-year. Widget arrange unlocks (existing
`widgetArrange` flag). The Spine becomes readable: 120 words that are the
system's running understanding. The operator can edit one sentence of it.
Badge `usership_m06` (rare).

**Stage 7. Echo.** Memory questions start referencing earlier answers by date
("In month 2 you said mornings were the hardest hour."). This is the first
moment the product feels like it remembers. Every card from here on carries an
Echo line.

**Stage 8. Altitude.** `/qi` terminal is introduced by a single card line.
Goal Journey surfaces. The AI starts proposing the next month's one focus in
the carry-forward line.

**Stage 9. Habit.** Self-care button reorders suggestions by completion
history. Q3 card. Badge `usership_m09` (epic). Existing pulse copy for Month 9
("The self-care practice is a habit now.") becomes literally true here.

**Stage 10. Threshold.** Year Book draft opens, 10 of 12 pages readable,
two pages shown as blank ruled lines. The Months bar widens.

**Stage 11. Eve.** The operator writes one line to themselves. It is sealed and
delivered inside the Year Book at the anniversary.

**Stage 12. LOT® AI.** Instrument density. AI-authored blocks change their
label from `System:` to `LOT® AI:`. Year Book delivered and exportable.
Badge `usership_m12` (legendary). This is the Machiavelli account.

---

## 5. Memory compression delivery (the focus)

### 5.1 Pipeline

```
raw signals ──> daily Memory answers + Log + check-ins + self-care
      │
      v
weekly story (P87, existing) x ~4
      │
      v
MONTH CARD  = f( weekly stories, month readings, SPINE_(n-1) )
      │
      v
SPINE_n     = compress( SPINE_(n-1) + CARD_n )  ->  <= 120 words
      │
      v
Q-CARD (seals 3, 6, 9, 12)  = f( 3 cards, SPINE )
      │
      v
YEAR BOOK (seal 12)         = SPINE_12 + 12 cards + 4 quarter cards
```

Rolling input keeps token cost flat: the prompt for seal 12 is no bigger than
seal 2. Reuse `generateMemoryStory` for the prompt scaffold, `monthly-summary.ts`
for readings, Together AI primary, deterministic fallback below.

### 5.2 Card anatomy

```
MEMORY / MONTH 04 / PORTRAIT
period        03 Jun — 02 Jul
fidelity      RICH +
entries 62    check-ins 19/30    self-care 44
──────────────────────────────────────────────
[ one paragraph, 80-100 words, first person ]
──────────────────────────────────────────────
echo          month 2: "mornings are the hardest hour"
carry         One walk before the first screen.
badge         usership_m04
```

Readings are instrument data (COCKPIT-RULE). The paragraph is the only prose.

Voice decision D1: first person, matching the existing public `memoryStory`.
Alternative: third person, matching `composeLocalStory`. First person is
proposed because the card is the operator's own record, not a report about them.

### 5.3 The Month Gate (replaces the pulse line)

Three beats, each 1,400 ms fades (existing house timing), all dismissible:

```
BEAT 1   Pulse        "Month 4. The portrait deepens."          (existing copy)
BEAT 2   Unfold       Card fades in line by line; readings first, paragraph last
BEAT 3   Seal         Badge glyph appears; "Months unlocked: 4/12"; "Noted."
```

Dismissal writes to the server (`usership.seenSeal = 4`), not localStorage, so
the second device does not replay it. Card is then filed on the Memory tab
shelf, newest on top, twelve slots drawn from Day 1 (empty slots visible as
ruled lines, so the operator can see the year as a shelf to fill).

### 5.4 Context widgets

```
MONTHS UNLOCKED  (always on from Stage 0)
Months unlocked:
■■■■□□□□□□□□   4 / 12
Month 5 seals in 11 days.

THIS MONTH       (Stage 2+; shows live fidelity pacing, no pressure copy)
This month:
Entries 18 / 60    Check-ins 7 / 17    Self-care 12 / 40
Pacing: STANDARD

LAST MONTH       (Stage 1+; Memory widget variant)
Last month:
One paragraph from Card N-1, tap to open the card. Rotates the Echo line
daily so the widget is not static between seals.

QUARTER / SPINE  (Stage 3 / 6)
Quarter 2 sealed. The Spine is 118 words. Read.
```

Use the existing `ProgressBars` util for the bar. "Pacing" is a reading, not a
nudge; it never turns red and never says "behind".

### 5.5 Other delivery channels

- Email: extend the monthly job in `scheduled-jobs.ts` to attach the card to
  the existing plain-text monthly summary.
- Public profile: `/u/<name>` shows the latest card when `showMemoryStory` is on,
  plus `Months: N/12`.
- Export: Year Book as Markdown and PDF at Stage 12 (`exportData` flag exists).

### 5.6 Deterministic fallback card

When AI fails, build from readings only:

```
Month 4. 62 entries, 19 of 30 check-ins, 44 self-care acts. Most active hour:
07:00. Dominant theme: <top theme from patterns.ts>. The record continues.
```

No apology text, no error state. Fidelity label is still shown.

---

## 6. Badges

Twelve seal badges, one per month. Glyph is a ring that accumulates marks until
it closes at month 12. A Rich seal adds `+`.

```
ID             GLYPH           NAME        RARITY      CONDITION
─────────────  ──────────────  ──────────  ──────────  ────────────────────────
usership_m01   ○               Baseline    common      Seal 1
usership_m02   ○·              Rhythm      common      Seal 2
usership_m03   ○·○             Pattern     uncommon    Seal 3 (Q1)
usership_m04   ○·○·            Portrait    uncommon    Seal 4
usership_m05   ○·○·○           Constancy   uncommon    Seal 5
usership_m06   ○·○·○·          Meridian    rare        Seal 6 (Q2)
usership_m07   ○·○·○·○         Echo        rare        Seal 7
usership_m08   ○·○·○·○·        Altitude    rare        Seal 8
usership_m09   ○·○·○·○·○       Habit       epic        Seal 9 (Q3)
usership_m10   ○·○·○·○·○·     Threshold   epic        Seal 10
usership_m11   ○·○·○·○·○·○    Eve         epic        Seal 11
usership_m12   ◉              LOT® AI     legendary   Seal 12 (Q4, Year Book)
```

Companion badges (candidates): `usership_full_year_rich` (RICH on all 12),
`usership_comeback` (RE-ENTRY then RICH next seal), `usership_letter` (wrote the
Month 11 line). Check against Codex v32 (812 badges) for collisions before wiring.

The badge shelf is a row of twelve slots on the Months surface, so the year
reads left to right as a filling ring.

---

## 7. How the interface feels at each third of the year

```
MONTHS 0-2   Wellness journal. Large gaps, four widgets, the system asks one
             thing a day. The only thing that changes is that it remembers.
MONTHS 3-6   Dashboard. Sections distinct, first named pattern, archetype line,
             the shelf of cards fills. Widget arrange gives control back.
MONTHS 7-9   Cockpit. Memory quotes the operator. Self-care learns the
             operator's actual routine. /qi opens.
MONTHS 10-12 Instrument. Every pixel justified. The Year Book is the only
             thing on screen that is allowed to be slow.
```

Stage-to-density wiring: stage floors the density. `density = max(achievement
derived, stage floor)`, with floors at Stage 3 comfortable, 6 compact, 9 dense,
12 instrument. Tenure alone moves the UI; mastery can move it faster, never slower.

---

## 8. Machiavelli as the Stage 12 reference

The demo at `/u/machiavelli` is the answer to "what does month 12 look like".
Proposed upgrades, in order:

1. Show `Months unlocked: 12/12` (capped) and the twelve-slot badge ring.
2. Add a stage scrubber, client-only: `/u/machiavelli?stage=N`. It renders the
   Stage N interface and Card N from the seed set below. No auth, no writes.
   This doubles as the sales demo: a prospective Usership member can drag from
   Day 1 to Day 365 in one minute.
3. Fix tenure display (defect 2) and refresh wallet dates (defect 3).
4. Replace the single `memoryStory` string with `monthlyCards[12]` plus `spine`;
   keep `memoryStory` as the Spine for backward compatibility.

### 8.1 Seed cards (illustrative copy, first person, Florence)

Fidelity RICH unless noted. Written to the voice rules: short, no superlatives,
no exclamation marks.

```
M01 BASELINE     I began by writing down what I saw from the window. Twenty-five
                 lines, most of them about the piazza and who crossed it. The
                 system asked one question a day and I answered plainly. It did
                 not praise me. I found that restful.

M02 RHYTHM       Mornings became a fixed point. I wrote before I spoke to anyone,
                 sixteen days of thirty. The days I skipped were the days I was
                 asked for opinions too early. A man should know which hours
                 belong to him.

M03 PATTERN      Three months, and the first pattern has a name: I observe more
                 than I act. The system did not say this was wrong. It showed me
                 the proportion. Ninety observations to every decision. I will
                 test whether the ratio shifts when I write the decision down
                 first.

M04 PORTRAIT     The archetype it chose is the Strategist. I marked it not quite;
                 I am more patient than the word allows. The next question asked
                 how long I wait before I act. I said: until the other party
                 has shown their hand. The portrait corrected itself.

M05 CONSTANCY    Weekly pages now stack under the month. Reading four of them in
                 a row, I saw that my worst days follow my longest councils.
                 This is not fortune. This is scheduling. I moved the long
                 councils to the afternoon.

M06 MERIDIAN     Half the year. The Spine is a hundred and eighteen words and I
                 changed one sentence of it, because it said I distrust people.
                 I distrust incentives. The system accepted the edit and did not
                 argue. I rearranged the screen so the weather sits first.

M07 ECHO         Today it quoted me from the second month: mornings are the
                 hardest hour. I had forgotten writing it. They are no longer.
                 A record that returns your own words is more persuasive than
                 any adviser I have employed.

M08 ALTITUDE     I asked it directly for the first time. One line back: what I
                 had done, what the numbers said, one recommendation. No
                 flattery, no hedging. I have known secretaries who could not do
                 as much.

M09 HABIT        The self-care button now offers what I actually finish. Walk
                 first, then the cold water, then the page. I stopped
                 negotiating with myself about it. A habit is a decision made
                 once and honoured daily.

M10 THRESHOLD    The Year Book is open to the tenth page. Two pages are left
                 blank on purpose. I read the first month again and did not
                 recognise the man who wrote about the piazza. He was looking
                 out. I am now looking at the pattern.

M11 EVE          I wrote the line for the last month: Keep what is useful,
                 discard what is decorative. It is sealed until the
                 anniversary. I have written longer letters to princes with
                 less to say.

M12 LOT® AI      One year. Eleven hundred observations compressed into a page I
                 can carry. The system speaks in fewer words than it did in
                 the first month, and says more. The portrait is complete and
                 still evolving. It asks tomorrow's question now.
```

Seed numbers inside the copy (25 lines, 16 days) match the targets in 3.3 so the
demo is internally consistent. M12 says "eleven hundred" against a 1,000 target;
change it if the target moves.

---

## 9. AI behaviour across the year

The AI does not become chattier. It becomes more specific.

```
STAGE   QUESTION STYLE                   RECALL                         LABEL
─────   ───────────────────────────────  ─────────────────────────────  ───────────
 0-2    Broad, 3-4 tap options          None                           System:
 3-5    Pattern-aware                   This month                     System:
 6-8    Quotes earlier answers          Spine + Echo                   System:
 9-11   Adapts to completion history    Full-year, 3 quarters          System:
 12     Anticipates next-day question   Year Book                      LOT® AI:
```

The relabel at Stage 12 is the whole reveal. By then the operator has used the
product for a year without it calling itself an AI.

---

## 10. Implementation map

```
PHASE  SCOPE                                              FILES
─────  ─────────────────────────────────────────────────  ───────────────────────────────────────────────
  1    Anchor + Months unlocked widget + Stage 0          shared/types (usership.startedAt),
                                                          server/models/user.ts, server/routes/api.ts,
                                                          client/components/MonthsUnlockedWidget.tsx (new),
                                                          client/components/System.tsx
  2    Month Gate (server-persisted) replaces pulse       MonthlyPulseWidget.tsx, routes/api.ts
  3    Compression pipeline + card store                  server/utils/memory/month-compression.ts (new),
                                                          scheduled-jobs.ts (new job), routes/api.ts
                                                          (displayableEvents + GET /api/usership/months)
  4    Stage -> density floor + stage widgets              client/stores/evolution.ts,
                                                          client/utils/interfaceEvolution.ts, System.tsx
  5    Badges usership_m01..m12                           client/utils/badges.ts, easter-eggs.ts
  6    Demo scrubber + seed cards                         routes/public-api.ts, PublicProfile.tsx
  7    Year Book export                                   client + server export route
```

Notes for implementers:

- Card store is a log event `month_compression` with metadata
  `{ month, periodStart, periodEnd, fidelity, counts, paragraph, echo, carry,
  spine, badge }`. It MUST be added to `displayableEvents` (Backend Whitelist
  Hygiene) or the write-read loop silently breaks.
- Scheduled job guards: `isRunning` flag as in the monthly email job; idempotent
  on `(userId, month)`; every `process.nextTick` body try/catch wrapped.
- Client reads cards via React Query with `staleTime` 5 min; subscribe in the
  leaf component only (Render Isolation).
- Service worker `CACHE_VERSION` bump on the deploy that ships phase 2.
- Run the full Benchmark pipeline on each phase; this session did not build.

---

## 11. Decisions for S-2

```
D1   Card voice: first person (proposed) or third person?
D2   Anchor: usership.startedAt from Stripe webhook, or admin-set only?
D3   Fidelity thresholds in 3.3: accept as placeholders, or supply cohort data?
D4   Stage 12 relabel to "LOT® AI:" on AI blocks everywhere, or Memory tab only?
D5   Rich seal mark "+" on the badge: yes / no?
D6   Public scrubber on /u/machiavelli: open to everyone or Usership-only?
D7   Email the card at each seal, or only at quarter seals (3, 6, 9, 12)?
D8   Is a pause (vacation) allowed to freeze the seal clock?
```

Recommended defaults if no answer: D1 first person, D2 webhook with admin
override, D3 as written, D4 everywhere, D5 yes, D6 open, D7 every seal,
D8 yes, 30 days max per year.
