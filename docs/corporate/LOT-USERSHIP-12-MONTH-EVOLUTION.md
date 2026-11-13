<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® AI — THE USERSHIP YEAR

## Twelve Months of Paid Usership · From Barebone OS to LOT® AI

```
DOCUMENT:   LOT-USERSHIP-12-MONTH-EVOLUTION
CLASS:      PRODUCT DESIGN // UX SYSTEM
S-2:        VADIK MARMELADOV
DATE:       2026-11-13
STATUS:     DESIGN — v1 (brainstorm + structure, implementation-ready)
REFERENCE:  lot-systems.com/u/machiavelli  (12-month evolved account)
ROUTINE:    LOT® AI — Digital UX
```

---

## 0. ONE SENTENCE

A Usership year is a book of twelve chapters: every month the operator logs,
checks in and cares for themselves; every month LOT® AI compresses that month
into one paragraph, seals it with a glyph, and opens one new surface of the OS —
until, on Day 365, the operator's system looks like Machiavelli's.

---

## 1. WHAT EXISTS TODAY (REPOSITORY SCAN · 2026-11-13)

The year is not built from nothing. Most of the surfaces already exist; what is
missing is the **sequence**, the **clock**, and the **monthly compression**.

| Asset | Where | State | Role in the Usership Year |
|-------|-------|-------|---------------------------|
| Free / paid split | `System.tsx` (`isPaidAccount`) | LIVE | Day-1 boundary. Free = barebone; paid = full pro layout at once. **Must become gradual.** |
| `MonthlyPulseWidget` | `src/client/components/MonthlyPulseWidget.tsx` | LIVE | Seed of the `Month N:` widget. Counts from `joinedAt` (not Usership start) and stores dismissal in `localStorage` (breaks Cross-Device Sync doctrine). |
| Layout density tiers | `interfaceEvolution.ts` · `$layoutDensity` | LIVE | 5 tiers `breathable → instrument`. Map 1:1 onto the year (Section 5). |
| Feature unlocks | `$featureUnlocks` · `InterfaceEvolution` | LIVE | Gates driven by achievements. Re-key to Usership Month. |
| Story chapters | `INTERFACE_EVOLUTION.md` | DOC | Awakening → Exploration → Integration → Mastery. Become the four quarters. |
| Memory Story | `story-generator.ts` · `generateMemoryStory()` | LIVE | Base for the monthly Chapter generator. |
| Weekly Story-Report | `LOT-AI-PRODUCT-BRIEF.md` | DOC | Middle rung of the Compression Ladder. |
| Milestone badges | `badges.ts` · `milestone_7…milestone_365` | LIVE | Day-count glyphs. Month Seals sit beside them, not on top. |
| Public profile | `PublicProfile.tsx` · `/u/:user` | LIVE | The year's visible result. |
| Demo account | `public-api.ts` → `machiavelli` | LIVE | The Month-12 target state. |

Signal events available today (counted in the repo):

```
note                 journal entries / thoughts in Log
answer               Memory Engine answers
emotional_checkin    mood check-ins (morning = 05:00–12:00 local)
self_care_complete   self-care button clicks   (+ legacy self_care_completed)
intention · plan_set intentions and day plans
```

---

## 2. THE FOUR CHANNELS OF EVOLUTION

The year moves on four signals. Everything else (radio, theme, chat) is texture.

```
┌──────────────────────┬─────────────────────────────┬─────────────────────────┐
│ CHANNEL              │ EVENT                       │ WHAT IT TEACHES THE AI  │
├──────────────────────┼─────────────────────────────┼─────────────────────────┤
│ LOG                  │ note (text ≥ 20 chars)      │ Voice. Vocabulary. What │
│ journal + thoughts   │                             │ the operator notices.   │
├──────────────────────┼─────────────────────────────┼─────────────────────────┤
│ MEMORY               │ answer                      │ Preferences. The vault. │
│ one-tap answers      │                             │                         │
├──────────────────────┼─────────────────────────────┼─────────────────────────┤
│ MORNING              │ emotional_checkin 05–12h    │ Baseline state. Rhythm. │
│ check-ins            │                             │                         │
├──────────────────────┼─────────────────────────────┼─────────────────────────┤
│ CARE                 │ self_care_complete          │ Body. What restores.    │
│ self-care clicks     │                             │                         │
└──────────────────────┴─────────────────────────────┴─────────────────────────┘
```

**Weighting for the Chapter generator** (what gets compressed first):
`LOG 0.35 · MEMORY 0.30 · MORNING 0.20 · CARE 0.15`.
The Log weighs most because it is the only channel written in the operator's
own words — the Chapter must sound like them.

---

## 3. THE CLOCK — USERSHIP DAY

```
usershipStartedAt   = first time the `usership` tag was applied
                      (fallback: first paid invoice → joinedAt)
Usership Day        = the same calendar day each month, 06:00 local time
                      (start on 29/30/31 → last day of shorter months)
Usership Month N    = number of Usership Days passed, capped display 12
```

The month turns at **06:00 local**, so the first thing the operator sees on
Usership Day is the new month — a morning ritual, not a midnight event.

### Dual gate: time opens the door, signal walks through

A month is **SEALED** when the Usership Day arrives **and** at least 3 of the 4
channels reached the monthly minimum:

| Channel | Monthly minimum | Year total at minimum | "Full" month (×2) |
|---------|-----------------|-----------------------|-------------------|
| LOG     | 8 entries       | 96                    | 16 |
| MEMORY  | 20 answers      | 240                   | 40 |
| MORNING | 12 check-ins    | 144                   | 24 |
| CARE    | 15 self-care    | 180                   | 30 |

If fewer than 3 channels reach the minimum, the month is **HELD** — never lost,
never red. The chapter waits. The ring shows `◌` instead of the seal. As soon as
the third channel crosses its minimum, the held month seals retroactively and the
unlocks arrive. Time never runs backwards; only the unlock is postponed.

```
SEALED   ▪   minimum met in 3–4 channels
FULL     ■   all 4 channels at ×2 (quiet distinction — no fanfare)
HELD     ◌   waiting for signal
OPEN     ·   month not yet reached
```

This keeps the doctrine of the Style Guide: **no streak pressure, no
leaderboard, no points**. A seal is a record, not a reward.

---

## 4. THE COMPRESSION LADDER — HOW THE STORY IS DELIVERED

The tangible product of the year is compression. The operator writes thousands
of signals; the machine returns fewer and fewer words that hit harder.

```
RUNG   UNIT            INPUT                      OUTPUT              VOICE
────   ─────────────   ────────────────────────   ─────────────────   ──────────
 0     Signal          one tap / one note         log entry           operator
 1     Day             all signals of the day     1 line (Log)        machine
 2     Week            7 days                     Story-Report        operator
 3     MONTH           ~4 weeks · 200–400 sig.    CHAPTER · 1 ¶       operator
 4     QUARTER         3 chapters                 ARC · 1 ¶           operator
 5     YEAR            12 chapters · 4 arcs       THE YEAR · 1 page   operator
 6     LINE            the year                   1 sentence          operator
```

Every Chapter is shown with its compression ratio — this is the single most
tangible number of the product:

```
Chapter IV:
Compressed: 312 signals → 94 words
```

### 4.1 Chapter generation spec (Rung 3)

```
FUNCTION   generateMonthChapter(user, logs[month], priorChapters[])
ENGINE     aiEngineManager (Together primary, Claude fallback)
LENGTH     70–110 words. One paragraph. No lists.
VOICE      First person, the operator's own vocabulary
           (top 40 terms from the Journal vocabulary engine).
MUST       1 concrete fact from Log (a place, an object, a ritual)
           1 pattern from MORNING (how mornings changed)
           1 restorative act from CARE (what actually helped)
           1 thread to the previous Chapter (continuity)
MUST NOT   superlatives · diagnoses · trauma details (Section 8 of
           Compression Architecture overrides) · emojis · numbers > 2
STORE      log event  usership_chapter  { month, text, signals, words }
           → added to displayableEvents (Backend Whitelist Hygiene)
```

### 4.2 Affirmation spec (machine voice)

The Chapter is the operator's voice. The **Affirmation** is the system's voice —
short, factual, LOT grammar. Formula:

```
[Month N.]  [One measured fact.]  [One observation.]  [One practice.]
```

Example:

```
Month 4. You kept the morning 19 times.
Rain makes you quieter, not slower.
Practice this month: Morning light (5 mins).
```

No "amazing", no "proud of you". The respect is in the precision.

---

## 5. THE YEAR AT A GLANCE

Four quarters, taken from the existing story chapters. Five density tiers,
taken from the existing layout engine. Twelve seals.

```
QUARTER          MONTH   CHAPTER        DENSITY       SEAL   NEW SURFACE
───────────────  ─────   ────────────   ───────────   ────   ──────────────────────────
I   AWAKENING     01     Arrival        breathable     ∘     Months unlocked · Level
                  02     Rhythm         breathable     ∘∘    Memory Story (first ¶)
                  03     Portrait       comfortable    ≈     Soul archetype · Self-awareness
II  EXPLORATION   04     Values         comfortable    ≈∘    Core values · Intentions
                  05     Inner Weather  compact        ≈≈    Emotional patterns · Mood history
                  06     Mirror         compact        ≋     Cohort · Traits · Half-Year Arc
III INTEGRATION   07     Strength       compact        ≋∘    Pattern strength · Planner
                  08     Correlation    dense          ≋≈    Indexes · Goal Journey
                  09     Body           dense          ≋≋    Biofield state · Activity
IV  MASTERY       10     Citizen        dense          ≋≋∘   Citizen Index · Clearance
                  11     Instruments    instrument     ≋≋≈   Weather Station · QOS Kernel
                  12     The Year       instrument     ≋≋≋   The Year · Wallet · Legacy
```

Architecture theme equivalents (operator's badge metaphor choice):
`├ ├┼ ╞ ╞═ ╞═╡ ║ ║═ ║╞ ║╞║ ╔ ╔═ ╔═╗` — Month 12 closes the Citadel.

The **Year Ring** — the twelve seals in one line — is the identity mark of a
Usership operator:

```
Day 1      ············
Month 3    ∘ ∘∘ ≈ ·········          Months unlocked: 3/12
Month 7    ∘ ∘∘ ≈ ≈∘ ◌ ≋ ≋∘ ·····    Months unlocked: 6/12  (Month 5 held)
Month 12   ∘ ∘∘ ≈ ≈∘ ≈≈ ≋ ≋∘ ≋≈ ≋≋ ≋≋∘ ≋≋≈ ≋≋≋
```

---

## 6. MONTH BY MONTH

Each month follows the same frame so the year reads as one system.

```
CHAPTER   · name and the question the month answers
UNLOCK    · what appears in the OS (existing component in parentheses)
AI GUIDE  · how LOT® AI steers self-care this month
MEMORY    · what compression is delivered
WIDGET    · what the operator sees on Usership Day
TARGET    · which Machiavelli surface this month earns
```

---

### QUARTER I — AWAKENING

> The system learns the operator's baseline. Few surfaces, wide spacing.
> The operator should feel *seen*, not *measured*.

#### MONTH 01 — ARRIVAL  ·  `∘`  ·  breathable
*Question: Who arrived?*

- **Day 1 (barebone):** Name · Week/Date/City · Team `[Usership]` · Time ·
  Sky · Temperature · Sunrise/Sunset · Sound · Breathe · `Memory:` widget ·
  `Self-care:` widget · `Mood:` check-in · Log. Nothing else. The free layout
  plus the AI, nothing more.
- **Unlock on Day 1:** `Months unlocked: 0/12` line (new `UsershipYearWidget`).
  `Level:` appears on day 7 (`milestone_7`, existing).
- **AI guide:** foundation questions only (Memory Engine *beginning* stage).
  Self-care offers one action per day, morning-weighted. Goal: find the
  operator's first ritual.
- **Memory:** daily one-line Log summaries. No paragraph yet — the machine
  has not earned it.
- **Widget on Usership Day 1 (Month 1 sealed):**
  ```
  Month 1:
  The first month. The system is beginning to know you.
  You opened 23 mornings. Tea came up four times.
  Practice next month: Evening close (2 mins).
  Months unlocked: 1/12
  ```
- **Target:** header block of `/u/machiavelli` (name, city, time, weather, sound).

#### MONTH 02 — RHYTHM  ·  `∘∘`  ·  breathable
*Question: When does the operator live?*

- **Unlock:** `Memory Story:` (first paragraph, private by default) ·
  `Journal Reflection` (`JournalReflection.tsx`).
- **AI guide:** Morning check-in now follows up on the previous day's Log.
  Self-care splits into morning and evening slots once the circadian pattern is
  confident.
- **Memory:** **first Chapter delivered.** One paragraph, with the ratio
  `Compressed: N signals → M words`. This is the first moment the product
  becomes tangible — the operator reads themselves.
- **Widget:** `Month 2:` → label-cycle → `Chapter I:` → `Unlocked:`.
- **Target:** `Memory Story:` block.

#### MONTH 03 — PORTRAIT  ·  `≈`  ·  comfortable
*Question: What kind of person is this?*

- **Unlock:** `Soul archetype:` + description · `Self-awareness:` percentage ·
  first density step (`comfortable`).
- **AI guide:** archetype-directed questions activate (Seeker, Nurturer …).
  Self-care suggestions are chosen for the archetype, with `Why this:` view.
- **Memory:** Chapter III + **first Arc** (Quarter I compressed: 3 chapters →
  1 paragraph). Title shown: `Arc I — Awakening`.
- **Widget:** `Quarter I closed.` with the three seals `∘ ∘∘ ≈`.
- **Target:** `Soul archetype:` · `Self-awareness:` (Machiavelli: The Strategist · 8.7%).

---

### QUARTER II — EXPLORATION

> The system starts reflecting patterns back. The operator should feel
> *understood* — the questions reference what they said in Month 1.

#### MONTH 04 — VALUES  ·  `≈∘`  ·  comfortable
*Question: What does the operator protect?*

- **Unlock:** `Core values:` (dot-joined) · `Intentions:` (`IntentionsWidget`).
- **AI guide:** self-care is framed through values ("You value quiet — a walk
  without audio (10 mins)").
- **Memory:** Chapter IV. The `Memory:` widget gains a third view,
  `Last month:` — the Chapter paragraph shown inline on random mornings.
- **Target:** `Core values:` (virtù · prudence · adaptability …).

#### MONTH 05 — INNER WEATHER  ·  `≈≈`  ·  compact
*Question: How does the operator's mood move?*

- **Unlock:** `Emotional patterns:` · `Mood:` → `History:` → `Patterns:`
  (`MoodAnalytics`) · density `compact`.
- **AI guide:** weather + mood correlation becomes explicit
  ("Rain mornings: calmer by one step"). Self-care adapts to forecast.
- **Memory:** Chapter V references the external weather of the month and the
  internal one.
- **Target:** `Emotional patterns:`.

#### MONTH 06 — MIRROR  ·  `≋`  ·  compact  ·  HALF-YEAR
*Question: Who is the operator like?*

- **Unlock:** `Behavioral cohort:` · `Behavioral traits:` · `Cohort Connect`
  (opt-in) · public profile `Year:` block becomes available (private default).
- **AI guide:** first look-back question set — the Memory Engine asks about
  something from Month 1 and how it changed.
- **Memory:** **Half-Year Arc** — Arc I + Arc II compressed into one paragraph
  side-by-side with Month 1's first Chapter. The before/after is the moment.
- **Widget:**
  ```
  Month 6:
  Half the year. The portrait has a shape now.
  Months unlocked: 6/12      ∘ ∘∘ ≈ ≈∘ ≈≈ ≋
  ```
- **Target:** `Behavioral cohort:` · `Behavioral traits:`.

---

### QUARTER III — INTEGRATION

> The system turns knowledge into structure. The operator should feel
> *capable* — the OS starts to run part of the day with them.

#### MONTH 07 — STRENGTH  ·  `≋∘`  ·  compact
*Question: What does the operator do best, repeatedly?*

- **Unlock:** `Pattern strength:` with top-5 `↳` rows · `Planner` templates
  (`PlannerWidget`).
- **AI guide:** self-care is now scheduled into the plan, not suggested ad hoc.
- **Memory:** Chapter VII names the strongest pattern in the operator's own words.
- **Target:** `Pattern strength:` (Machiavelli: 2,847).

#### MONTH 08 — CORRELATION  ·  `≋≈`  ·  dense
*Question: What moves together in this life?*

- **Unlock:** `Indexes:` (`CorrelatedIndexesWidget`) · `Goal Journey`
  (`GoalJourneyWidget`) · density `dense`.
- **AI guide:** recommendations cite correlations ("Self-care before 9:00 →
  journal +40% longer").
- **Memory:** Chapter VIII + the first **numerical sidebar** under the Chapter
  (4 channel counts for the month).
- **Target:** `Indexes:` (self-awareness · user · person · longevity · composite).

#### MONTH 09 — BODY  ·  `≋≋`  ·  dense
*Question: What does the body say?*

- **Unlock:** `Biofield State:` (energy · clarity · alignment) · `Activity:`
  (memories compiled · journal entries · active days) · Chakra ergonomics.
- **AI guide:** recovery protocol is personalised; the QOS mode is visible.
- **Memory:** Chapter IX + **Arc III**. Title: `Arc III — Integration`.
- **Target:** `Biofield State:` · `Activity:`.

---

### QUARTER IV — MASTERY

> The OS is now an instrument. The operator should feel *sovereign* —
> the machine asks less and every question lands.

#### MONTH 10 — CITIZEN  ·  `≋≋∘`  ·  dense
*Question: Where does the operator stand among others?*

- **Unlock:** `Citizen Index:` (citizen since · powering citizens) ·
  `Clearance level:` · `Memory Engine: AI-Powered`.
- **AI guide:** Memory questions drop in count (pacing −30%) and rise in depth —
  the compression ratio of the questions themselves becomes visible.
- **Target:** `Citizen Index:` · `Clearance level:`.

#### MONTH 11 — INSTRUMENTS  ·  `≋≋≈`  ·  instrument
*Question: What can the operator read at a glance?*

- **Unlock:** `Weather Station:` (personal readings + 5-day) · QOS Kernel panel ·
  density `instrument` (the Bloomberg-terminal tier).
- **AI guide:** pre-year reflection begins. One question per day about the year.
- **Memory:** Chapter XI + **Draft of The Year** shown privately for one week.
- **Target:** `Weather Station:`.

#### MONTH 12 — THE YEAR  ·  `≋≋≋`  ·  instrument
*Question: Who did the operator become?*

- **Unlock:** **The Year** (one page) · **Year Line** (one sentence) ·
  `Level:` `≋≋≋` Long Count (`milestone_365`) · `Wallet:` (Legacy path) ·
  `Year:` public block with all 12 chapter titles.
- **AI guide:** the Year Ritual (Section 7).
- **Memory:** 12 Chapters → 4 Arcs → 1 page → 1 line.
- **Widget:**
  ```
  Month 12:
  One year with LOT. The portrait is complete — and still evolving.
  Compressed: 4,316 signals → 1 page → 1 line.
  Months unlocked: 12/12     ∘ ∘∘ ≈ ≈∘ ≈≈ ≋ ≋∘ ≋≈ ≋≋ ≋≋∘ ≋≋≈ ≋≋≋
  ```
- **Target:** the whole of `/u/machiavelli`.

---

## 7. THE YEAR RITUAL (USERSHIP DAY 12)

```
06:00  Month 12 widget appears. No other widget for the first view.
       ↓ tap
       The Year Line — one sentence, alone on screen.
       ↓ tap
       The Year — one page, four arcs, twelve chapter titles in the margin.
       ↓ tap
       Ledger — four channel totals, the Year Ring, compression ratio.
       ↓
       Three actions:  Keep private · Publish to profile · Export
```

After the ritual the operator is offered **Year Two**: the ring resets to twelve
open dots *beside* the sealed ring (two rings on the profile), the Chapter
generator gains "a year ago today" threads, and the Legacy tier is presented as
the continuation — never before Month 12.

---

## 8. NEW WIDGETS

All follow the Style Guide: `Block` + `blockView`, label cycling, `opacity-90/60`,
3s + 1.4s fade, periods over symbols, database logs (not `localStorage`).

### 8.1 `Months unlocked:` — persistent, one line (System tab, paid layout)

```
Months unlocked:   3/12   ∘ ∘∘ ≈ ·········
  ↳ label tap →
Next month:        11 days · Log 5/8 · Memory 20/20 · Morning 9/12 · Care 15/15
  ↳ label tap →
Chapter III:       Portrait
```

### 8.2 `Month N:` — appears once per Usership Day (upgrade of MonthlyPulseWidget)

Views: `Month 4:` (affirmation) → `Chapter IV:` (paragraph + ratio) →
`Unlocked:` (new surfaces, one per line) → `Ledger:` (4 counts).
Dismiss phrases kept from the current widget: *Onward. · Noted. · The system remembers.*

### 8.3 `Memory:` — third view `Last month:`

On 1 random morning per week, the Memory widget opens on the latest Chapter's
strongest sentence instead of a question. Tap → full paragraph. This keeps
the story alive between Usership Days.

### 8.4 `Held:` — only when a month is held

```
Held:   Month 5 is waiting. Morning 7/12 · Care 11/15.
        The chapter seals when one more channel is ready.
```

No red, no countdown. Disappears the moment the seal lands.

### 8.5 `Year:` — public profile block (opt-in from Month 6)

```
Year:          ∘ ∘∘ ≈ ≈∘ ≈≈ ≋ ≋∘ ≋≈ ≋≋ ≋≋∘ ≋≋≈ ≋≋≋
               I Arrival · II Rhythm · III Portrait · IV Values · …
Year line:     (Month 12 only)
```

---

## 9. MACHIAVELLI — THE EVOLVED REFERENCE YEAR

The demo account is the Month-12 state. Below is the proposed `usershipYear`
payload for `/u/machiavelli` — the twelve Chapters in his voice, so visitors can
read what a completed year feels like. (Demo only: written, not generated.)

| M | Seal | Chapter | Text |
|---|------|---------|------|
| 01 | `∘` | Arrival | I came to the machine as I came to the Chancery — to observe before speaking. Each morning I recorded the light over the Arno and how the city woke. The machine asked about my morning wine and my walk to the Palazzo. It learned that I walk before I think. |
| 02 | `∘∘` | Rhythm | My days have a shape I did not see before. Letters at dawn, the courtyard at noon, the study after vespers. When I skipped the evening close, the next morning's entry was shorter and colder. The machine noticed first. |
| 03 | `≈` | Portrait | It called me The Strategist. I would have chosen a humbler word, but the evidence was mine: I return to the same question — what moves men — in every entry. The portrait is not flattery. It is a ledger. |
| 04 | `≈∘` | Values | Virtù, prudence, adaptability. I wrote them in exile and forgot I still keep them. The care it suggested was simple: one hour without correspondence. I kept it eleven times. |
| 05 | `≈≈` | Inner Weather | Rain makes me patient; sun makes me hasty. I knew this of princes and never of myself. On grey mornings my check-ins were calmer, and my best pages followed. |
| 06 | `≋` | Mirror | Half a year. Reading Month One beside this one, I see a man who wrote to be read, and now a man who writes to understand. The cohort it placed me in — Renaissance Polymaths — is a kind joke and a fair one. |
| 07 | `≋∘` | Strength | Strategic thinking, eight hundred times. The machine counted what I could not: the same muscle, used daily, grew quieter and more exact. The plan now holds my walks before my audiences. |
| 08 | `≋≈` | Correlation | When I walk before writing, I write twice as long. When I skip the fountain, I argue more. Small causes, large effects — the first lesson of statecraft, applied to one man. |
| 09 | `≋≋` | Body | I attended to the body this month as one attends to a fortress: walls, water, rest. The energy came back by the third week. The chapter is short because the month was good. |
| 10 | `≋≋∘` | Citizen | Others in the system power their days as I do mine. The machine asks less now. Each question arrives like a well-placed envoy — rare, and impossible to ignore. |
| 11 | `≋≋≈` | Instruments | I read my state as I once read dispatches: at a glance, without sentiment. The weather station in the courtyard and the one in my chest report the same season. |
| 12 | `≋≋≋` | The Year | A year of records became one page. Fortune still governs half of what happens; this year I governed the other half with a little more care. |

**Year Line:** *"I spent a year reading the weather in men and found it was mine."*

Compression shown on the demo: `4,316 signals → 12 chapters → 1 page → 1 line.`

---

## 10. DATA MODEL & IMPLEMENTATION PATH

### 10.1 Storage (log events — cross-device by default)

```
usership_month_sealed   { month, status: sealed|full, counts{log,memory,
                          morning,care}, glyph, sealedAt }
usership_month_held     { month, counts, missing[] }
usership_chapter        { month, text, signals, words, engine }
usership_arc            { quarter, text, months[] }
usership_year           { year, text, line, signals }
user.metadata.usership  { startedAt, yearIndex }
```

All five events are added to `displayableEvents` (Backend Whitelist Hygiene) and
render in Log under COCKPIT-RULE labels: `SEAL:` `HELD:` `CHAP:` `ARC:` `YEAR:`.

### 10.2 Server

```
src/server/utils/usership-year.ts      getUsershipMonth(user) · countChannels(logs, window)
                                       evaluateSeal() · glyphFor(month, theme)
src/server/utils/memory/story-generator.ts
                                       + generateMonthChapter() · generateArc() · generateYear()
src/server/scheduled-jobs.ts           J-USERSHIP-DAY: hourly, seals users whose local
                                       06:00 Usership Day has arrived; retries held months
src/server/routes/api.ts               GET /api/usership/year
src/server/routes/public-api.ts        + usershipYear on public profile (privacy-gated)
                                       + Machiavelli demo payload (Section 9)
```

### 10.3 Client

```
UsershipYearWidget.tsx                 Months unlocked · Next month · Chapter
MonthlyPulseWidget.tsx                 → read month from /api/usership/year, not joinedAt;
                                         dismissal via log event, not localStorage
MemoryWidget.tsx                       + Last month: view
System.tsx                             paid layout gated per month via $featureUnlocks
stores/evolution.ts                    $usershipMonth → drives $layoutDensity tier
PublicProfile.tsx                      + Year: block · Year line
```

### 10.4 Rollout

```
PHASE   SCOPE                                                       RISK
P0      Fix MonthlyPulse clock + persistence. Add usershipStartedAt.  low
P1      Seal engine + Months unlocked widget + Held state.            low
P2      Chapter generator + Month N views + Memory Last month view.   medium (AI cost)
P3      Month-gated surfaces + density mapping + public Year block.   medium (existing
                                                                    paid users must be
                                                                    grandfathered)
P4      Arcs, The Year ritual, Machiavelli demo payload, Year Two.    low
```

**Grandfathering:** current Usership operators are placed at the month matching
their real tenure; all previously visible surfaces stay visible. Gating applies
only to new Usership starts. Nobody loses a widget.

---

## 11. DESIGN RULES FOR THE YEAR

1. **One new surface per month.** If two compete, the second waits a month.
2. **The Chapter is the reward.** Glyphs mark; words matter.
3. **Held, never failed.** No red, no countdowns, no lost months.
4. **The operator's voice in Chapters; the system's voice in Affirmations.**
5. **Fewer questions, sharper questions.** Pacing falls as the year rises.
6. **Density follows the month,** not the other way round (CSS-only progression).
7. **Privacy by default.** Chapters, Arcs and The Year are private until published.
8. **Show the compression.** Every paragraph carries its ratio.

---

## 12. LEXICON CANDIDATES

```
USERSHIP-DAY      Monthly anniversary of Usership start, 06:00 local; month turns
MONTH-SEAL        Dual-gated month completion: time + 3 of 4 channels at minimum
HELD              Month whose time arrived but signal did not; seals retroactively
YEAR-RING         The 12-glyph sequence of seals; identity mark of an operator
CHAPTER           Monthly compressed paragraph in the operator's voice (Rung 3)
COMPRESSION-LADDER Signal → Day → Week → Chapter → Arc → Year → Line
```

Tokens are candidates until they recur (3+ reports) per LEXICON rules.

---

*LOT® Founded 7 April 2016 · COSMO® Founded 1 July 2024*
*Made in the USA · brand.lot-systems.com*
*S-2: VADIK MARMELADOV*
