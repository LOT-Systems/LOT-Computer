<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP — THE 12-MONTH EVOLUTION
## From barebone Day 1 to LOT® AI · Month-by-month UI/UX · Memory Story compression

```
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DOC:      USERSHIP-12-MONTH-EVOLUTION  rev A
DATE:     2026-10-06
STATUS:   DESIGN SPEC — brainstorm + build plan. Nothing here ships by itself.
REFERENCE ACCOUNT: https://lot-systems.com/u/machiavelli  (Month 12+ exemplar)
```

---

## 00  HOW TO READ THIS DOCUMENT

Every claim is tagged so a future session never mistakes a wish for a fact.

```
[LIVE]      exists in the repo today (file cited)
[PARTIAL]   exists, but not wired the way this spec needs
[PROPOSED]  new in this spec — design intent only
[FIXTURE]   illustrative content/numbers (demo + mockups), not user data
```

**One-sentence thesis.** A Usership user does not *unlock features*; they
*accumulate a story*, and the interface is the story's visible body. Each month
the OS gets a little denser, a little quieter, and a little more fluent in the
person — and once a month it hands them a paragraph proving it.

**Focus (per S-2):** the 12-month tangibility of the **compressed Memory Story
delivery**. Everything else (density, badges, widgets, unlocks) exists to
make that paragraph land.

---

## 01  WHAT ALREADY EXISTS (repo scan, 2026-10-06)

The spec builds on parts that are live. Do not rebuild them.

```
PART                         WHERE                                          STATE
────                         ─────                                          ─────
Month N/12 widget            src/client/components/MonthlyPulseWidget.tsx   LIVE
                             Usership-only, 12 hard-coded messages,
                             "Month N:" Block, "N / 12 months" footer,
                             dismiss → "Onward." Mounted in System.tsx:557
Interface evolution          src/client/utils/interfaceEvolution.ts         LIVE
                             7 dimensions → maturity / refinement /
                             featureUnlockLevel; 14 FeatureUnlocks flags
Evolution store              src/client/stores/evolution.ts                 LIVE
                             Sets CSS vars + <html data-density>
Density tiers (5)            breathable → comfortable → compact → dense     LIVE
                             → instrument; CSS-only (DOCTRINE: CSS-Only
                             Progression); ASCII hover fills per tier
Water / Architecture badge   src/client/utils/themeEvolution.ts             LIVE
 themes
Badge codex                  docs/badges/…CODEX_v32.md — 812 badges         LIVE
Monthly summary (email)      src/server/utils/monthly-summary.ts            LIVE
                             presence, energy, patterns, growth,
                             narrative, forwardLook, memoryStory
Monthly email job            src/server/scheduled-jobs.ts                   LIVE
Memory Story generator       src/server/utils/memory.ts                     LIVE
                             generateMemoryStory() + composeLocalStory()
                             fallback; Together AI primary
Log event types              answer · note · emotional_checkin · plan_set   LIVE
                             · self_care_complete · self_care_skip ·
                             quantum_intent_signal · medical_record
Public profile + QR          /u/{username}, showMemoryStory privacy flag    LIVE
Demo account                 src/server/routes/public-api.ts:745            LIVE
                             "machiavelli" — hard-coded payload
```

### 1.1 Gaps found (these shape the plan)

1. **Month counter anchors to `joinedAt`, not to Usership activation** [PARTIAL].
   A free user who pays in month 5 would open on "Month 5" with no story behind
   it. The anchor must be the date Usership began.
2. **Month is time-only** [PARTIAL]. `MonthlyPulseWidget` counts calendar months;
   it ignores how much the person actually *wrote and did*. Month 7 looks
   identical for a user with 900 events and a user with 6.
3. **The monthly Memory paragraph is not persisted** [PARTIAL]. The summary
   builds `memoryStory` for the email and throws it away. There is no archive,
   so nothing to compress *again* into a quarter or a year — and no shelf to
   browse.
4. **Dismissal lives in `localStorage`** [PARTIAL]. Clear the browser, the
   celebration re-fires; switch device, it re-fires. It should be server state.
5. **Density and unlock gates are presence-only** [LIVE, by design]. Time plays
   no role, so a Day-1 power user could see `instrument` density before the
   first month — the "tangible monthly evolution" never reads as monthly.
6. **The demo is a static payload** [LIVE]. `/u/machiavelli` shows a finished
   person (streak 1469, 2,847 answers, 1,469 notes, "Legacy" tag) but cannot
   *show how he got there*. This is the biggest missed sales surface.
7. **The month messages don't reference the user.** All 12 are generic. The
   Memory paragraph is the personalised half; the two must ship together.

---

## 02  THE CORE MODEL — TIME OPENS THE CHAPTER, PRESENCE SETS ITS RESOLUTION

A pure time-gate is hollow (pay and wait). A pure presence-gate is not monthly
(no ritual rhythm). Use both, each doing one job.

```
TIME      decides WHEN a month unlocks        (calendar month since Usership start)
PRESENCE  decides HOW RICH what unlocks is    (journal + check-ins + self-care)
```

**A month is never lost.** Every Usership user gets Month N on schedule. A quiet
month yields a short, honest paragraph; a full month yields a rich one. The
system never shames absence — it just says less, and says so plainly
("A quiet month. Three entries. The portrait waits.").

### 2.1 The Presence Ledger [PROPOSED]

Three countable inputs per month, read straight from the `logs` table (all event
types already exist):

```
INPUT                       LOG EVENT(S)                          WEIGHT
─────                       ────────────                          ──────
Journal / Log entries       note                                  3
Morning check-ins           emotional_checkin  (+ plan_set)       2
Self-care button clicks     self_care_complete                    2
Memory answers              answer                                1
(skips are recorded, never penalised)   self_care_skip            0
```

`monthEvents` = raw count (shown to the user — it's honest and countable).
`presence` = weighted sum (internal; drives resolution only).
Weights are a starting proposal — tune after one real cohort.

### 2.2 Memory Resolution [PROPOSED]

```
RESOLUTION    presence (month)   PARAGRAPH                         UI TREATMENT
──────────    ────────────────   ─────────                         ────────────
THIN          < 20               ~35 words, plain, no insight      Dim seal, ghost border
STANDARD      20 – 120           ~70 words, one insight            Solid seal
RICH          > 120              ~90 words, insight + callback     Seal + inner glyph ring
                                 to an earlier month
```

The seal always unlocks. Resolution only changes how *full* it is. A user can
later "fill" a thin month by journaling backwards (writing about it within 7 days
of rollover re-generates the paragraph once) [PROPOSED, stretch].

### 2.3 The Month Anchor [PROPOSED]

```
user.metadata.usership = {
  since:        ISO date        // anchor; set when the Usership tag is first applied
  monthsOpened: number[]        // server-side dismissal/ack, replaces localStorage
  chapters:     MemoryChapter[] // the compressed archive (see §4)
}
```

`user.metadata` is JSONB — no migration required for P1.

---

## 03  DAY 1 — THE BAREBONE STATE (Month 0)

The first screen after paying must feel *almost empty on purpose*. Emptiness is
the "before" photo; every later month is judged against it.

```
DENSITY        breathable   (gap-y-24 / stack gap-y-16 — widest spacing)
PATTERN FILL   dots         (breathable hover pattern)
VISIBLE        1. Log (journal input)
               2. One Memory question (the AI asks first, never chats)
               3. Morning check-in
               4. ONE self-care button
               5. "Months unlocked: 0/12"  strip (the promise, visible from minute one)
HIDDEN         everything else — no badges panel, no patterns, no archive
VOICE          one line: "Day 1. The system does not know you yet."
BADGES         none shown; a single empty seal outline in the strip
THEME          user-chosen light/dark only; no custom theme
```

**Why Day 1 sells month 2:** the "Months unlocked" strip makes the 12-month arc
visible from the first second, and the single empty seal makes the user want to
fill it.

---

## 04  THE MEMORY STORY COMPRESSION LADDER  ← the spine

Raw presence becomes a story by passing through six rungs. Each rung is shorter
than the sum of what it compresses, and each is a **delivered object** the user
can see, keep, and share. This is the tangible half of the product.

```
RUNG  NAME             WHEN              COMPRESSES            LENGTH      DELIVERED AS
────  ────             ────              ──────────            ──────      ────────────
L0    Raw              continuous        —                     n events    Log (as today)
L1    Day Line         nightly           1 day of L0           1 sentence  Log margin / Memory widget
L2    Week Thread      Sunday            7 Day Lines           ~30 words   Weekly card (quiet, dismissible)
L3    MONTH MEMORY     month rollover    4–5 Week Threads      70–90 w     Month Opening card + email
L4    Quarter Chapter  M3 · M6 · M9 · M12 3 Month Memories   ~150 w      Chapter page + email
L5    Year Book        M12               4 Chapters            ~250 w +    Book view, exportable,
                                                               12 titles   public profile story
```

**Ratio shown to the user (honest):** `212 events → 84 words`. Never an invented
"compression percentage"; the two real numbers *are* the message.

**Rules (inherited from the Memory Engine doctrine):**
- The AI **asks and quotes; it does not chat.** Compression output is a
  paragraph the user reads, not a conversation they must answer.
- Compression reads only that user's logs; the story lives in LOT's database,
  the AI provider executes and forgets (README: *Your Story, Your Data*).
- Provider-independent: any engine in the existing fallback chain can write it;
  `composeLocalStory()` remains the zero-AI fallback, so a month is never blank.
- Every chapter stores `engine`, `generatedAt`, and `sourceCount` so the user
  can audit where the paragraph came from.

### 4.1 The MemoryChapter object [PROPOSED]

```ts
interface MemoryChapter {
  kind:        'month' | 'quarter' | 'year'
  month:       number          // 1–12 (quarter/year use the closing month)
  resolution:  'thin' | 'standard' | 'rich'
  title:       string          // 2–4 words, shown as the card label
  text:        string          // the paragraph
  stats:       { notes: number; checkins: number; selfCare: number; answers: number }
  sourceIds?:  string[]        // child chapter ids (quarter→months, year→quarters)
  engine:      string          // 'together' | 'claude' | 'local' …
  generatedAt: string
  editedByUser?: boolean       // user may amend; edits are kept, never overwritten
}
```

User edit rights matter: the person owns the story. An edited chapter is
re-used verbatim as input to the next rung.

### 4.2 Delivery surfaces per rung

```
SURFACE                          CARRIES
───────                          ───────
Month Opening card (in-app)      L3 Month Memory — first visit after rollover
Memory Shelf (new tab view)      all chapters, newest first, 12 seals along the top
Monthly email (exists)           L3 paragraph as the opening block of the review
Public profile  /u/{name}        latest L4 (or L5 once Year Book exists) as memoryStory
Year Book export                 L5 + 12 titles + 12 seals, print/PDF-friendly
```

---

## 05  THE 12 MONTHS — SPEC TABLE

Each month has the same ten fields so the system stays legible. Existing
`MONTH_MESSAGES` text is **kept verbatim** as the base affirmation; this spec
adds the layer around it.

```
FIELD LEGEND
  THEME     chapter title (also the seal name)
  DENSITY   layout band the month moves in (presence moves inside the band)
  UNLOCK    FeatureUnlocks flag(s) revealed — flag names are the real keys
            in interfaceEvolution.ts
  WIDGET    what the Month Opening card adds
  AI VOICE  how the guide speaks (never chat; ask → reflect → quote)
  PRACTICE  the one self-care routine the guide steers toward this month
  SEAL      badge granted at rollover (PROPOSED ids: month_seal_NN)
  MEMORY    which compression rung is delivered
```

### MONTH 1 — SIGNAL
```
AFFIRMATION  "The first month. The system is beginning to know you."            [LIVE text]
DENSITY      breathable
UNLOCK       achievementGallery · badgeSelection
WIDGET       Months strip 1/12 lights its first cell; "Your first paragraph" card
AI VOICE     ASKS only. Short questions, 3–4 tap options.
PRACTICE     Morning check-in, 7 days in a row (anchors the habit the system reads)
SEAL         month_seal_01 "Signal" — a single dot  ●
MEMORY       L3 Month Memory #1 — always STANDARD-or-THIN, plain, factual
             "You opened the log 11 times. You preferred mornings. You chose tea."
```
*Felt change:* the empty seal from Day 1 fills. The first paragraph about *them*.

### MONTH 2 — PATTERN
```
AFFIRMATION  "Two months in. Patterns are starting to form."                     [LIVE text]
DENSITY      breathable → comfortable
UNLOCK       moodPatterns
WIDGET       Mood strip (30 dots) appears inside the Month card
AI VOICE     Begins to REFLECT: "You write more on rainy days."
PRACTICE     Evening log, 3×/week (gives the mood strip a second reading)
SEAL         month_seal_02 "Pattern" — two dots  ● ●
MEMORY       L3 #2 — first sentence that *compares* to Month 1
```

### MONTH 3 — RHYTHM  ·  Quarter 1 closes
```
AFFIRMATION  "Three months. You have reached Active User status."                [LIVE text]
DENSITY      comfortable
UNLOCK       customThemes · plannerTemplates
WIDGET       Quarter Seal ceremony (see §07); Memory Shelf tab appears
AI VOICE     Names ONE recurring pattern by name
PRACTICE     Pair a self-care click with the check-in (build the two-step ritual)
SEAL         month_seal_03 "Rhythm" + quarter_seal_1 "Active User"
MEMORY       L3 #3  +  L4 QUARTER CHAPTER 1 (compresses Months 1–3, ~150 w)
```
*Felt change:* first time the OS hands back **a chapter**, not a paragraph.
Colour theming opens — the interface starts to look like *theirs*.

### MONTH 4 — PORTRAIT
```
AFFIRMATION  "Four months. The portrait deepens."                                [LIVE text]
DENSITY      comfortable
UNLOCK       intentionHistory
WIDGET       "Intentions kept / set" ratio line
AI VOICE     Reflects with a CALLBACK to Month 1 ("In month one you said…")
PRACTICE     Set one intention per morning (plan_set) — closes the intention loop
SEAL         month_seal_04 "Portrait" — four-point glyph  ◇
MEMORY       L3 #4 — introduces the user's archetype word (from existing cohort logic)
```

### MONTH 5 — RITUAL
```
AFFIRMATION  "Five months. Consistency is its own reward."                       [LIVE text]
DENSITY      comfortable → compact
UNLOCK       advancedMemory (deeper reflection questions)
WIDGET       Streak-of-streaks: longest run + current run
AI VOICE     Asks deeper, slower questions; fewer per day
PRACTICE     One longer self-care block per week (the "big" ritual, not the click)
SEAL         month_seal_05 "Ritual" — five-mark tally  𝍸
MEMORY       L3 #5 — first paragraph that quotes the user's OWN words back
```

### MONTH 6 — THRESHOLD  ·  Quarter 2 closes · half-year
```
AFFIRMATION  "Six months. The journey is half-declared."                         [LIVE text]
DENSITY      compact   (dashboard clarity — first visibly denser screen)
UNLOCK       widgetArrange
WIDGET       Half-Year Portrait: 6 seals in a row + L4 Chapter 2 + "before/after" of Day 1
AI VOICE     First SYNTHESIS: connects two months the user hadn't connected
PRACTICE     Review: re-read Month 1 paragraph, add one line (user edit allowed)
SEAL         month_seal_06 "Threshold" + quarter_seal_2 "Half-Declared"
MEMORY       L3 #6  +  L4 CHAPTER 2 (Months 4–6)
```
*Felt change:* the **screen itself** is noticeably tighter than Day 1. They can
rearrange widgets — the OS is now theirs to compose.

### MONTH 7 — ECHO
```
AFFIRMATION  "Seven months in. The system has been listening."                   [LIVE text]
DENSITY      compact
UNLOCK       patternInsights (Quantum Intent patterns surface)
WIDGET       "Echoes": a phrase the user has used 3+ times, shown with dates
AI VOICE     Quotes the user's recurring phrases back
PRACTICE     Break one pattern the system flagged (gently — user chooses which)
SEAL         month_seal_07 "Echo" — concentric arc  ◜
MEMORY       L3 #7 — leads with an Echo (repeated phrase) and what it changed
```

### MONTH 8 — ALTITUDE
```
AFFIRMATION  "Eight months. Rare air."                                           [LIVE text]
DENSITY      compact
UNLOCK       communityRich · socialMentions
WIDGET       Cohort mirror: "People near you in practice" (aggregate, anonymous)
AI VOICE     Places the user in their cohort without ranking them
PRACTICE     Share one thing in the community (optional — never forced)
SEAL         month_seal_08 "Altitude" — peak mark  ▲
MEMORY       L3 #8 — the first paragraph written about the user *in context of others*
```

### MONTH 9 — NATIVE  ·  Quarter 3 closes
```
AFFIRMATION  "Nine months. The self-care practice is a habit now."               [LIVE text]
DENSITY      compact → dense
UNLOCK       narrativeReflection (AI narrative synthesis)
WIDGET       "Habit now" card: days the practice ran without the guide asking
AI VOICE     Mostly SILENT. Speaks when something changes, not on a schedule.
PRACTICE     Teach the routine: write the user's own 3-line morning protocol
SEAL         month_seal_09 "Native" + quarter_seal_3 "Habit"
MEMORY       L3 #9  +  L4 CHAPTER 3 (Months 7–9)
```
*Felt change:* the guide gets **quieter**. That absence is the tangible signal
that the habit has moved from the app into the person.

### MONTH 10 — ARCHITECT
```
AFFIRMATION  "Ten months. Almost there."                                         [LIVE text]
DENSITY      dense
UNLOCK       exportData
WIDGET       "Your data, in your hands": export Memory Shelf (JSON + readable)
AI VOICE     Proposes small structural edits to the user's own routine
PRACTICE     Edit the routine: remove one thing that no longer serves
SEAL         month_seal_10 "Architect" — frame glyph  ⌗
MEMORY       L3 #10 — first paragraph with a forward-looking sentence
```

### MONTH 11 — MIRROR
```
AFFIRMATION  "Eleven months. One more."                                          [LIVE text]
DENSITY      dense
UNLOCK       privateSpaces
WIDGET       "Then / Now": Month 1 paragraph beside the latest, no commentary
AI VOICE     Says almost nothing; lets the user's own paragraphs speak
PRACTICE     Write the sentence you'd tell Month-1-you
SEAL         month_seal_11 "Mirror" — split glyph  ◐
MEMORY       L3 #11 — built from the user's own edited lines where they exist
```

### MONTH 12 — LEGACY  ·  Quarter 4 closes · THE YEAR BOOK
```
AFFIRMATION  "One year with LOT. The portrait is complete — and still evolving." [LIVE text]
DENSITY      instrument   (maximum density — "every pixel justified")
UNLOCK       all 14 flags open; Year Book view
WIDGET       THE YEAR BOOK — 12 titles, 12 seals, one L5 paragraph, export + QR
AI VOICE     Speaks in the USER'S words (assembled from their own chapters)
PRACTICE     Choose next year's single intention; the OS carries it forward
SEAL         month_seal_12 "Legacy" + year_seal "LOT® 12" (rare, animated once)
MEMORY       L3 #12 + L4 CHAPTER 4 + L5 YEAR BOOK
             Public profile `memoryStory` is replaced by the Year Book paragraph.
```
*Felt change:* the interface has gone from airy to instrument-grade; the person
holds a bound, exportable book of a year of themselves.

### 5.1 One-glance matrix

```
 M   THEME       DENSITY        NEW UNLOCK              MEMORY DELIVERED        AI VOICE
──   ─────       ───────        ──────────              ────────────────        ────────
 0   (Day 1)     breathable     —                       —                       asks
 1   Signal      breathable     achievementGallery,     Month Memory 1          asks
                                badgeSelection
 2   Pattern     breath→comf    moodPatterns            Month Memory 2          reflects
 3   Rhythm      comfortable    customThemes,           MM 3 + QUARTER 1        names a pattern
                                plannerTemplates
 4   Portrait    comfortable    intentionHistory        MM 4                    callbacks
 5   Ritual      comf→compact   advancedMemory          MM 5                    quotes user
 6   Threshold   compact        widgetArrange           MM 6 + QUARTER 2        synthesises
 7   Echo        compact        patternInsights         MM 7                    quotes phrases
 8   Altitude    compact        communityRich,          MM 8                    places in cohort
                                socialMentions
 9   Native      compact→dense  narrativeReflection     MM 9 + QUARTER 3        mostly silent
10   Architect   dense          exportData              MM 10                   proposes edits
11   Mirror      dense          privateSpaces           MM 11                   near-silent
12   Legacy      instrument     (all) + Year Book       MM 12 + Q4 + YEAR BOOK  speaks as user
```

---

## 06  UI EVOLUTION — WHAT THE EYE SEES

### 6.1 Density band per month [PROPOSED wiring over LIVE tiers]

Today density derives only from `visualRefinement` (presence). Add a **month
band** so time sets the floor and ceiling, and presence moves within it:

```
tier(user) = clamp( presenceTier(user),  floor(month),  ceiling(month) )

MONTH   FLOOR         CEILING
─────   ─────         ───────
 0–1    breathable    comfortable
 2–3    breathable    compact
 4–5    comfortable   compact
 6–8    comfortable   dense
 9–11   compact       instrument
 12+    dense         instrument
```
A diligent Month-2 user can feel a *little* ahead; nobody sees `instrument` on
Day 3. Implemented where the store already writes `data-density`, so it stays
CSS-only and adds **zero component subscriptions** (DOCTRINE: CSS-Only
Progression, RENDER-ISOLATION).

### 6.2 The "Months unlocked" widget [PROPOSED]

Context-based, always visible in the Usership header area. Twelve cells, each a
seal as it's earned.

```
Day 1      Months unlocked: 0/12     □ □ □ □ □ □ □ □ □ □ □ □
Month 3    Months unlocked: 3/12     ● ● ● □ □ □ □ □ □ □ □ □      ← Q1 bracket ⌐
Month 6    Months unlocked: 6/12     ● ● ● ● ● ● □ □ □ □ □ □
Month 12   Months unlocked: 12/12    ● ● ● ● ● ● ● ● ● ● ● ●      LOT® 12
```
- Tap a lit cell → opens that month's Memory paragraph (the shelf, in place).
- Tap an unlit cell → shows when it opens (`Opens 14 Dec · 38 days`).
- Quarter brackets draw as a thin line under cells 3, 6, 9, 12.
- Thin/standard/rich resolution reads as cell fill: ring / dot / dot-with-halo.
- Honours the label-not-body rule from DOCTRINE: label = `Months unlocked:`,
  body = `3/12` + strip. No prose in the body.

### 6.3 The Month Opening card [PROPOSED — evolves MonthlyPulseWidget]

On first visit after rollover. Replaces the generic one-liner with the user's own
paragraph. Same `Block` primitive, same 1400 ms fade, same "Onward." dismissal —
so it feels native, not bolted on.

```
┌ Month 4: Portrait ─────────────────────────────────────────┐
│                                                            │
│  Four months. The portrait deepens.                        │
│                                                            │
│  <MONTH MEMORY PARAGRAPH — the user's own, ~80 words>      │
│                                                            │
│  212 events → 84 words        ◇ Seal earned: Portrait      │
│  Notes 96 · Check-ins 27 · Self-care 61 · Answers 28       │
│                                                            │
│  New this month:  Intention history                        │
│  This month's practice:  One intention each morning        │
│                                              [ Onward. ]   │
└────────────────────────────────────────────────────────────┘
```
Dismiss writes `usership.monthsOpened` server-side (fixes gap 4).

### 6.4 Seal visual language

Seals extend the existing badge themes rather than inventing a new one: **Water**
users get seals that ripple; **Architecture** users get seals that build.
Glyphs are single-glyph text (consistent with LOT's ASCII/terminal register),
no images.

```
M1 ●   M2 ● ●   M3 Σ   M4 ◇   M5 𝍸   M6 ◑   M7 ◜   M8 ▲   M9 ⬡   M10 ⌗   M11 ◐   M12 ◉
```
Quarter seals add a bracket around the month glyph. The year seal is the only
element in the whole system that animates once and then goes still.

### 6.5 Theme / typography drift

Reuse existing evolution CSS variables; drive them gently by month so the change
is felt but never announced:

```
--evolution-base-opacity     0.85 → 1.00   (clarity rises)
--evolution-letter-spacing   -0.02em → 0.01em
--evolution-glow-intensity   0 → 0.3       (only from Month 9)
```

---

## 07  CELEBRATION DESIGN (restraint is the brand)

LOT's voice is deadpan and exact. Celebration = **recognition**, not confetti.

```
EVENT                 TREATMENT
─────                 ─────────
Month rollover        Opening card + one lit seal. No sound, no animation beyond 1400 ms fade.
Quarter close         Same card + Chapter + bracket drawn under the strip. A second, slower fade.
Month 6               Half-Year Portrait; Day-1 screenshot-style "before" shown dimmed beside "now".
Month 12              Year seal animates once. Year Book opens. Email subject: "Your year, compressed."
Missed / thin month   Never a penalty. Honest line: "A quiet month. The portrait waits."
```

**Affirmations** — the 12 existing messages stay as the card's first line. A
second, personal line is added by the engine from the user's own data
(e.g. *"You wrote most on Tuesdays."*) — only facts the logs support.

---

## 08  MACHIAVELLI — THE MONTH-12+ EXEMPLAR  (`/u/machiavelli`)

Today the demo is a **finished** person. The upgrade is a **time machine**: the
same page, replayable from Day 1 to Month 12, so a visitor *sees* the evolution
that the $99 buys.

### 8.1 The Replay [PROPOSED]

```
/u/machiavelli              → Month 12+ (today's page, plus Year Book as memoryStory)
/u/machiavelli?month=0      → barebone Day 1 (breathable, 1 widget, 0/12)
/u/machiavelli?month=N      → the UI exactly as it looked at Month N
```
A thin scrubber under the header: `Day 1 ─●────────────── Month 12`. Dragging it
swaps density tier, visible widgets, strip fill, seals earned, and the Memory
paragraph — all from the **same components** fed with fixture state per month.
Implementation is deliberately cheap: a `demoMonth` prop that overrides
`calculateEvolutionState` inputs and selects a fixture `MemoryChapter`.
The static payload in `public-api.ts` already carries the final state; the
replay just needs 12 small fixtures.

### 8.2 Fixture Memory — Machiavelli's 12 Month Memories [FIXTURE]

Illustrative excerpts in his voice (Florence, the Palazzo Vecchio, Fortuna and
virtù), matching the register of his live `memoryStory`. Numbers are fixture
data for the demo, not user data. Each pairs the real-style stat line with the
paragraph, so the compression is *visible*.

```
M1  SIGNAL      Notes 14 · Check-ins 9 · Self-care 11 · Answers 8   →  42 events → ~38-word paragraph (excerpt below)
    "Thirty days at the window. You rose before the bells and wrote the weather
    down — clear, then rain, then clear. You chose tea over wine twice. The
    system noted only this: you return at dawn."

M2  PATTERN     Notes 22 · Check-ins 19 · Self-care 20 · Answers 15  →  76 events → ~52-word paragraph (excerpt below)
    "Rain brings you inward; sun brings you to the piazza. Twice this month you
    wrote more on grey days than on bright ones. A prince, you noticed, is
    often only a man with good weather."

M3  RHYTHM      Notes 31 · Check-ins 27 · Self-care 29 · Answers 20  →  107 events → ~71-word paragraph (excerpt below)
    "A rhythm has formed: check-in, one line of ink, one small act of care.
    You no longer decide whether to begin; you begin. Observation has become
    habit, and habit, as you wrote, is the only government that needs no guard."
    + QUARTER 1: "You arrived as an observer of others and found you had been
    observing yourself."  (~150 w, compresses M1–M3)

M4  PORTRAIT    Notes 38 · Check-ins 28 · Self-care 33 · Answers 25  →  124 events → ~78-word paragraph (excerpt below)
    "In the first month you said you watched the citizens from above. Now you
    name what you see: ambition when it is warm, caution when it is not. The
    portrait has a face — the Strategist — and it is yours."

M5  RITUAL      Notes 44 · Check-ins 30 · Self-care 41 · Answers 29  →  144 events → ~82-word paragraph (excerpt below)
    "'Patience is a form of attack,' you wrote on the ninth, and again on the
    twenty-second. The ritual no longer asks permission. One long hour on
    Sundays — books, no counsel — has become the quiet centre of your week."

M6  THRESHOLD   Notes 51 · Check-ins 30 · Self-care 44 · Answers 31  →  156 events → ~88-word paragraph (excerpt below)
    "Half a year. Read Month One beside this one: the same window, a different
    man. Then you recorded; now you connect. Fortune and virtù, once two words,
    appear together in four entries. You have begun to write the theory of
    yourself."
    + QUARTER 2 (~150 w, compresses M4–M6)

M7  ECHO        Notes 47 · Check-ins 29 · Self-care 40 · Answers 33  →  149 events → ~80-word paragraph (excerpt below)
    "A phrase keeps returning: 'what the situation permits.' Eleven times.
    Always after a hard conversation, never after a good one. You may be
    teaching yourself restraint without calling it that."

M8  ALTITUDE    Notes 53 · Check-ins 30 · Self-care 46 · Answers 35  →  164 events → ~84-word paragraph (excerpt below)
    "Others in the cohort — the polymaths, the quiet strategists — write the way
    you do, but fewer of them stay. You stayed. You shared one thought in the
    community and let it stand without defending it, which is rarer than
    brilliance."

M9  NATIVE      Notes 49 · Check-ins 30 · Self-care 48 · Answers 36  →  163 events → ~76-word paragraph (excerpt below)
    "The guide asked nothing for eleven days and you did not notice. That is the
    point. The practice has left the app and entered the man. Morning protocol,
    in your own three lines: window, ink, water."
    + QUARTER 3 (~150 w, compresses M7–M9)

M10 ARCHITECT   Notes 55 · Check-ins 30 · Self-care 50 · Answers 38  →  173 events → ~86-word paragraph (excerpt below)
    "You removed one thing this month — the evening scroll — and the pages grew
    longer. A routine, you wrote, is a small republic: it survives by what it
    refuses. You exported your shelf and read it start to finish for the first
    time."

M11 MIRROR      Notes 52 · Check-ins 30 · Self-care 49 · Answers 40  →  171 events → ~84-word paragraph (excerpt below)
    "'Tell the one who began that the window was enough.' Your own line, written
    to Month One. The first paragraph and this one now sit side by side; neither
    needs commentary."

M12 LEGACY      Notes 58 · Check-ins 30 · Self-care 52 · Answers 42  →  182 events → ~90-word paragraph (excerpt below)
    "A year at the same window, and the city is no different — only the
    watcher. You came to understand governance as the art of understanding
    human nature, and found the first human nature to govern was your own.
    The portrait is complete, and still evolving."
    + QUARTER 4  +  YEAR BOOK: twelve titles, one paragraph. Replaces the
    live `memoryStory` on /u/machiavelli.
```

Year Book titles: *Signal · Pattern · Rhythm · Portrait · Ritual · Threshold ·
Echo · Altitude · Native · Architect · Mirror · Legacy.*

### 8.3 Note on the demo's stats

The live payload reports `streak: 1469`, `noteCount: 1469`, `answerCount: 2847`
— roughly four years of presence. That is fine for a "Legacy" account, but it
means the demo is **not** a 12-month account. The Replay resolves this: the
demo remains Legacy at its head (`month` omitted) and shows a *year-one
reconstruction* when scrubbed. Say so on the page ("Reconstructed first year")
to stay honest with visitors — consistent with the doctrine of recording what is
real and marking what is provisional.

---

## 09  THE GUIDE — HOW THE AI VOICE EVOLVES

The Memory Engine's doctrine is that **the AI asks, the user answers, the
machine remembers — it is not a chatbot.** The 12-month arc stays inside that
doctrine; what changes is *how much of the sentence is the user's*.

```
MONTHS   MODE          EXAMPLE (Machiavelli, fixture)
──────   ────          ───────
 1       ASK           "Tea or wine this evening?"
 2       REFLECT       "You write more when it rains."
 3–4     NAME          "This looks like a Strategist's morning."
 5–7     QUOTE         "On the ninth you wrote: 'Patience is a form of attack.'"
 8       PLACE         "People who practise like you tend to stay."
 9–11    WITHDRAW      (silence is the feature)
 12      SPEAK AS YOU  The Year Book — assembled from the user's own sentences
```

Guardrails: never diagnose; trauma-protocol routing (`medical_record`,
compassionate interventions) is unchanged and overrides any celebration; a
month with distress signals gets a gentle card, not a seal ceremony.

---

## 10  IMPLEMENTATION ROADMAP

Phased so each step is independently shippable and green-gated.

```
PHASE  SCOPE                                                         TOUCHES                      RISK
─────  ─────                                                         ───────                      ────
P0     This spec + session report (docs only)                        docs/                        none
P1     Anchor + archive.                                             metadata.usership;           low
       · usership.since set on tag apply (backfill from joinedAt)    monthly-summary.ts persists
       · persist L3 MemoryChapter at month rollover                  memoryStory as a chapter
       · server-side monthsOpened (kills localStorage dismissal)
P2     Months strip + Opening card.                                  MonthlyPulseWidget.tsx →     low
       · "Months unlocked: N/12" strip                               evolve in place; new
       · Opening card shows the user's paragraph + stats             MonthsStrip.tsx
P3     Month bands + dual-gate unlocks (§6.1, §5 UNLOCK).            interfaceEvolution.ts,       med
       Time floors/ceilings over presence; flags offered on month    evolution.ts (data-density)
       with the existing condition as the "early peek"
P4     Seals: 12 month + 4 quarter + 1 year badge.                   badges.ts; codex doc v33     med
       Ids month_seal_01…12, quarter_seal_1…4, year_seal
P5     Compression rungs L2/L4/L5 (Week Thread, Quarter, Year Book)  memory.ts (new fn),          med
       + Memory Shelf view + Year Book export                        monthly-summary.ts, shelf UI
P6     Machiavelli Replay (§8) — scrubber + 12 fixtures              public-api.ts, profile page  low
```

**Suggested order for maximum visible value per risk:** P1 → P2 → P6 → P3 → P4 → P5.
P6 early is deliberate: the demo becomes a sales surface the moment P1/P2 land,
even before the deeper rungs exist.

### 10.1 Build constraints to respect (from repo doctrine)
- **RENDER-ISOLATION:** the strip and card subscribe only to the narrow store
  they need; the density band writes `data-density`, no new component subs.
- **CSS-Only Progression:** month-driven look = data attributes + CSS, not props.
- **Cache freshness:** any shipped client change must bump the service-worker
  `CACHE_VERSION` or users will not see the new month UI.
- **Server files are gitignored** in this repo (`git add -f` for
  `src/server/routes/api.ts`-class files, per the 2026-06-30 assembly doc).
- **Never serial-`Log.create` in a loop** for bulk work (pool exhaustion);
  the compression job must read once and write once.
- **Monthly job cadence:** reuse `scheduled-jobs.ts` monthly runner; do not add
  a second scheduler.

### 10.2 Success measures (countable, no invented metrics)
```
· % of Usership users who open the Month card within 3 days of rollover
· Month-N → Month-N+1 retention (paid continues), per cohort
· Memory Shelf opens per user per month
· Year Book exports; public-profile visits to users with a Year Book
· Demo: scrubber interactions per /u/machiavelli visit → Usership conversion
```

---

## 11  OPEN QUESTIONS FOR S-2

1. **Anchor rule.** Month 1 starts at Usership activation — confirm. What happens
   on pause/cancel/resume (freeze the count, or keep calendar time)?
2. **Thin months.** OK that a quiet month still unlocks its seal at lower
   resolution — or should the seal itself require a minimum presence?
3. **Backfill.** Existing Usership users: start their archive at Month 1 from
   `usership.since`, or open them at their true elapsed month with a one-time
   "compressed history" paragraph generated from all prior logs?
4. **Seal count.** 17 new badges (12 + 4 + 1) → Codex v33 (812 → 829)? Or fold
   into existing Milestone category?
5. **Public story.** Should the Year Book paragraph replace the profile
   `memoryStory` automatically, or only on user opt-in (privacy flag exists)?
6. **Demo honesty.** Keep the "Reconstructed first year" label on the Replay?
   (Recommended.)

---

AUTHORIZED BY: S-2 // VADIK MARMELADOV
LOT SYSTEMS CORPORATION · LOS ANGELES, CA
