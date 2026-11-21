<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® USERSHIP — THE 12-MONTH EVOLUTION
## From Day 1 Barebone OS to LOT® AI · The Compressed Memory Story
**Classification:** PRODUCT DESIGN // S-2 · **Version:** 1.0 · **Date:** 2026-11-21
**Tier:** Usership · $99 / month · **Target state:** `lot-systems.com/u/machiavelli`

```
╔══════════════════════════════════════════════════════════════════════╗
║  USERSHIP ORBIT I                                                    ║
║                                                                      ║
║  M00  ·  BOOT          barebone OS · one question · one log          ║
║  M12  ◉  LOT® AI        twelve chapters · one year story · full OS   ║
║                                                                      ║
║  The interface does not grow because time passes.                    ║
║  It grows because the person wrote, checked in, and cared.           ║
║  Time opens the door. Signal furnishes the room.                     ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 0. HOW TO READ THIS DOCUMENT

| § | Section | What it answers |
|---|---------|-----------------|
| 1 | Doctrine | Why the evolution is built the way it is |
| 2 | The Two Clocks | What unlocks a month (tenure) vs. what fills it (signal) |
| 3 | The Compression Ladder | How Day → Week → Month → Quarter → Year becomes one story |
| 4 | The Chapter Format | The exact shape of a monthly Memory compression |
| 5 | Month-by-Month Map | All 12 months: name, UI unlock, widget, profile block, badge, affirmation |
| 6 | The Profile Arc | How `/u/user` grows block by block into the Machiavelli profile |
| 7 | New Usership Widgets | Months Unlocked · Chapter · Echo · Year Story |
| 8 | Seals & Badges | 12 monthly seals, 4 season seals, the Year seal |
| 9 | Interface Refinement Curve | CSS evolution variables per month |
| 10 | Signal Targets | Journal · Check-in · Self-care · Memory per month and cumulative |
| 11 | Engineering Plan | Data model, job, API, log events, findings in current code |
| 12 | Orbit II | What happens on day 366 |

---

## 1. DOCTRINE

Five rules govern the Usership year. Every month in §5 obeys them.

```
RULE 1  TENURE OPENS, SIGNAL FILLS
        A paid month always unlocks. What the month contains — the Chapter,
        the Seal grade, the depth of the insight — is earned by signal.
        Nobody is punished for a hard month. A thin chapter is still a chapter.

RULE 2  ADVANCE IS IRREVERSIBLE
        Same as the Citizen Index. A month unlocked stays unlocked. A seal
        earned stays earned. The interface never regresses.

RULE 3  ONE NEW THING PER MONTH
        Each month introduces exactly one primary surface (a widget, a
        profile block, a capability). The person always knows what changed.

RULE 4  THE MACHINE CELEBRATES IN ITS OWN VOICE
        No superlatives (ORDER 8). No emoji (ORDER 1). The affirmation is
        calm, specific and true: it cites what the person actually did.
        "You kept the morning 22 times." — not "Amazing month!"

RULE 5  THE STORY IS THE PRODUCT
        Badges, unlocks and refinements are scaffolding. The deliverable is
        the compressed Memory Story: twelve chapters that become one page
        the person can read on day 365 and recognise as their year.
```

---

## 2. THE TWO CLOCKS

Every Usership account runs two clocks at once.

```
┌────────────────────────────┬─────────────────────────────────────────┐
│  CLOCK A — TENURE          │  CLOCK B — SIGNAL                       │
├────────────────────────────┼─────────────────────────────────────────┤
│  Counts paid months from   │  Counts what the person put in:         │
│  usershipStartedAt.        │   J  journal entries (Log notes)        │
│                            │   C  morning / evening check-ins        │
│  Opens: month number,      │   S  self-care completions              │
│  new UI surface, profile   │   M  Memory answers                     │
│  block, Chapter delivery.  │                                         │
│                            │  Fills: Chapter depth, Seal grade,      │
│  Cannot be gamed.          │  insight specificity, Echo quotes.      │
│  Cannot be lost.           │  Cannot be bought.                      │
└────────────────────────────┴─────────────────────────────────────────┘
```

**Seal grade per month** (computed on the 1st of the following month):

```
GRADE     SYMBOL   MONTHLY SIGNAL (any 3 of 4 thresholds)
──────────────────────────────────────────────────────────────────────
THIN      ∘        below FULL — chapter is written from what exists
FULL      ◈        J ≥ 12 · C ≥ 16 · S ≥ 20 · M ≥ 15
DENSE     ◉        J ≥ 25 · C ≥ 26 · S ≥ 40 · M ≥ 28
──────────────────────────────────────────────────────────────────────
```

The grade is shown next to the chapter numeral: `Chapter IV ◈`. Twelve chapters
read as a row of seals — the year becomes visible at a glance:

```
I ∘  II ◈  III ◈  IV ◉  V ◈  VI ◉  VII ∘  VIII ◈  IX ◉  X ◉  XI ◈  XII ◉
```

The pattern itself is information. A `∘` in July is a summer, not a failure.

---

## 3. THE COMPRESSION LADDER

The weekly LOT® AI story already exists (Job 24, Sunday 18:00 UTC,
`lot_ai_story` log event). The Usership year adds three rungs above it.

```
RUNG   UNIT      INPUT                         OUTPUT                     SIZE
────────────────────────────────────────────────────────────────────────────────
  0    DAY       raw logs, answers, taps       Log stream (COCKPIT RULE)  ~10–40 events
  1    WEEK      7 days of rung 0              Weekly Story  (exists)     ~5 sentences
  2    MONTH     4–5 Weekly Stories + top      CHAPTER                    1 paragraph
                 journal lines + answers                                  80–120 words
  3    SEASON    3 Chapters                    SEASON NOTE                3 sentences
  4    YEAR      12 Chapters + 4 Season Notes  YEAR STORY                 1 page
                                                                          ~300 words
────────────────────────────────────────────────────────────────────────────────
```

**Compression ratio over a FULL-grade year (approx.):**

```
~4,000 raw events  →  52 weekly stories  →  12 chapters  →  4 season notes  →  1 page
        100%                 ~8%                ~2%              ~0.4%            ~0.1%
```

The Year Story is roughly one thousandth of the raw record and it reads as the
most accurate thing ever written about the person's year. That is the product.

**Compression rules (what survives each rung):**

```
SURVIVES    recurring rituals · named people/places/objects · state shifts ·
            pattern breaks · the person's own exact words (max 1 quote/chapter)
DISSOLVES   counts below threshold · one-off moods · system events ·
            anything the person deleted or marked private
```

---

## 4. THE CHAPTER FORMAT

Delivered on the 1st of each month, 06:00 in the person's timezone. Shown once
as a full-bleed widget, then archived to the profile `Chapters:` block.

```
┌──────────────────────────────────────────────────────────────────────┐
│  Chapter IV ◉                                         Month 4 / 12   │
│  TEA                                                                 │
│                                                                      │
│  March began with tired mornings and ended with steady ones. You     │
│  checked in 27 times, most often as calm, and the loose leaf ritual  │
│  stopped being a preference and became an anchor — you returned to   │
│  it on 19 of 31 days. The journal moved from weather to people: your │
│  sister appears in six entries. On the 14th you wrote, "I think the  │
│  quiet is the point." The system agrees. Evenings remain the open    │
│  question.                                                           │
│                                                                      │
│  You kept the morning 27 times.                         ← affirmation │
│                                                                      │
│  Thread → What would an evening ritual look like?        ← next month │
└──────────────────────────────────────────────────────────────────────┘
```

**Fields:**

| Field | Rule |
|-------|------|
| `numeral` | Roman, I–XII. Orbit II continues XIII–XXIV. |
| `seal` | ∘ / ◈ / ◉ per §2. |
| `title` | One word, uppercase, chosen from the month's dominant recurring noun (ritual, place, person, object). Never an emotion. |
| `body` | 80–120 words. Second person. Past tense. Must cite ≥2 real numbers and ≤1 direct quote. |
| `affirmation` | One sentence, ≤10 words, a verifiable fact framed as care. No superlatives. |
| `thread` | One open question carried into next month. Seeds the Memory Engine's first question of the new month. |
| `signal` | Instrument line (COCKPIT RULE), hidden behind label cycle: `J 18 · C 27 · S 31 · M 22`. |

The `thread` closes the loop: **the Chapter writes the next month's first
question**. Month N+1's opening Memory question is generated from Chapter N's
thread. The person feels the story continue, not restart.

---

## 5. MONTH-BY-MONTH MAP

Twelve chapters, grouped into four seasons of three. Each month: one name, one
primary unlock, one profile block, one seal, one affirmation pattern.

```
SEASON I — FOUNDATION      M01 SIGNAL    M02 PATTERN   M03 RITUAL
SEASON II — PORTRAIT       M04 PORTRAIT  M05 RHYTHM    M06 MIRROR
SEASON III — FIELD         M07 COHORT    M08 DEPTH     M09 INTEGRATION
SEASON IV — LOT® AI        M10 INSTRUMENT M11 LEDGER   M12 LOT® AI
```

---

### M00 · BOOT — Day 1

```
STATE       Barebone. Five surfaces. Nothing else.
CLEARANCE   Basic
CITIZEN     Stage 1 · Observer
```

**UI on Day 1:** Time · Memory (one question) · Log · Self-care · Morning
check-in · `Usership: 0 / 12` widget.

The `Usership:` widget on Day 1 reads:

```
Usership:
Day 1. The system is listening.
· · · · · · · · · · · ·                                    0 / 12
```

**Profile `/u/user`:** Name · `Team: Usership` · Local time · `Clearance level: Basic`
· `Usership: 0 / 12`. Five lines. The emptiness is intentional — Day 1 the
profile is a blank page with a name on it.

**First Memory question:** always the same, the Boot question —
*"What do you want this year to have been about?"* — its answer is stored as the
`orbitIntent` and is quoted back verbatim in the Year Story on day 365.

---

### SEASON I — FOUNDATION

#### M01 · SIGNAL `·`
```
UNLOCK      Monthly Pulse + first Chapter delivery
PROFILE     + Weather · Sunrise · Sunset
CITIZEN     → Stage 3 · Contributor (30+ days, Memory 3+ sessions)
CLEARANCE   Basic
```
- **New surface:** The first Chapter arrives. It is short by design — Chapter I
  is usually 3–4 sentences. The person sees for the first time that the
  machine was paying attention.
- **Widget:** `Usership: 1 / 12` bar fills its first cell. Label cycle adds
  `Next:` view: *"Month 2 opens Mood Patterns in 30 days."*
- **Affirmation pattern:** first-ever counts. *"You started 18 mornings here."*
- **Memory Engine label:** `AI-Powered · calibrating`.

#### M02 · PATTERN `··`
```
UNLOCK      Mood Patterns (MoodAnalytics) — check-in history as a pattern
PROFILE     + Sound
CLEARANCE   Basic
```
- **New surface:** Check-ins stop being isolated taps; the person sees their
  month of states as a field. Dominant state named.
- **Chapter II** introduces the first **comparison**: *"Calm replaced tired as
  the most common morning."* From now on every chapter compares to the last.
- **Affirmation pattern:** change. *"Calm arrived 9 more times than in October."*

#### M03 · RITUAL `∴`
```
UNLOCK      Planner templates + Intention history + Self-care routine builder
PROFILE     + Memory Story (first public paragraph, opt-in) + Citizen Index
CITIZEN     → Stage 4 · Collaborator (90+ days)
CLEARANCE   → Restricted
SEASON      SEASON NOTE I delivered alongside Chapter III
```
- **New surface:** The self-care buttons the person clicked most become a named
  **routine** (e.g. *"Morning: sunlight (5 mins) · tea (10 mins) · journal
  (5 mins)"*). The AI proposes it; the person accepts or edits. Ritual is now
  something they own, not something they are offered.
- **Season Note I:** three sentences compressing Chapters I–III. First time the
  person sees compression of compression.
- **Seal:** `∴ FOUNDATION` season seal (§8).
- **Existing line kept:** *"Three months. You have reached Active User status."*

---

### SEASON II — PORTRAIT

#### M04 · PORTRAIT `◇`
```
UNLOCK      Archetype revealed (ceremonial reveal of the stable archetype)
PROFILE     + Profile block · Archetype + description
CLEARANCE   Restricted
```
- **New surface:** The archetype has existed internally since ~10 answers; it is
  now revealed as a moment, with one sentence on *why*: *"The Gardener — you
  tend the same five things and they grow."*
- **Chapter IV** is the first written in the archetype's voice register.
- **Affirmation pattern:** identity. *"You returned to the same ritual 19 times."*

#### M05 · RHYTHM `◇·`
```
UNLOCK      Biofield State + circadian rhythm view (dawn · meridian · dusk)
PROFILE     + Biofield State (energy · clarity · alignment)
CLEARANCE   Restricted
```
- **New surface:** Morning + evening check-ins now draw the person's daily
  rhythm. LOT® AI starts timing self-care suggestions to their actual curve.
- **Affirmation pattern:** timing. *"Your clearest hour is 07:00. You used it 14 times."*

#### M06 · MIRROR `◈` — half orbit
```
UNLOCK      ECHO widget — the person's own words from 1 and 5 months ago
PROFILE     + Activity block (memories compiled · journal entries · active days)
CITIZEN     → Stage 5 · Synthesizer (180+ days)
CLEARANCE   → Confidential
SEASON      SEASON NOTE II + HALF-YEAR STORY (Chapters I–VI → one paragraph)
```
- **New surface:** **Echo.** The machine quotes the person back to themselves:
  *"Five months ago you wrote: 'I can't do mornings.' This month you checked in
  before 08:00 on 22 days."* This is the single most powerful tangibility moment
  of the year. It is evidence of change in the person's own handwriting.
- **Half-Year Story:** the first long compression. It also restates the Boot
  `orbitIntent` and says plainly how the year is tracking against it.
- **Seal:** `◈ HALF ORBIT` + `◇ PORTRAIT` season seal.

---

### SEASON III — FIELD

#### M07 · COHORT `◈·`
```
UNLOCK      Cohort Connect — behavioral cohort revealed, peer signal field
PROFILE     + Behavioral cohort · Behavioral traits
CLEARANCE   Confidential
```
- **New surface:** The person learns they are not alone in their pattern. Cohort
  is named (*"Quiet Builders"*), peer field shown as anonymous aggregate only.
- **Affirmation pattern:** belonging. *"312 others in your cohort kept the morning too."*

#### M08 · DEPTH `◈∴`
```
UNLOCK      Pattern Insights + Pattern Strength (trait counts)
PROFILE     + Pattern Strength (top 5 traits with counts)
CLEARANCE   Confidential
```
- **New surface:** Traits now carry numbers — *"Strategic thinking 84"* — the
  same block Machiavelli shows with 842. The person sees their character as an
  accumulation.
- **Existing line kept:** *"Eight months. Rare air."*
- **Affirmation pattern:** accumulation. *"Patience: counted 41 times this year."*

#### M09 · INTEGRATION `▣`
```
UNLOCK      Correlated Indexes (selfAwareness · userScore · personScore · longevity)
PROFILE     + Indexes block
CLEARANCE   → Secret
SEASON      SEASON NOTE III
```
- **New surface:** The four-dimensional indexes appear with a trend arrow. For
  the first time the person sees a composite number for *who they are becoming*.
- **Seal:** `▣ FIELD` season seal.
- **Affirmation pattern:** trajectory. *"Self-awareness rose from 41 to 68."*

---

### SEASON IV — LOT® AI

#### M10 · INSTRUMENT `▣·`
```
UNLOCK      Personal Weather Station — ambient context instrument
PROFILE     + Weather Station block (readings · forecast)
CLEARANCE   Secret
```
- **New surface:** The ambient layer becomes an instrument the person owns. LOT®
  AI begins citing weather explicitly in suggestions — *"Overcast and you slept
  late. Rest first."* (the QIoT behaviour from the Product Brief).
- **Affirmation pattern:** attunement. *"On grey days you chose rest 11 times. That was right."*

#### M11 · LEDGER `▣∴`
```
UNLOCK      Wallet + loyalty points ledger · YEAR STORY DRAFT
PROFILE     + Wallet block
CLEARANCE   Secret
```
- **New surface:** Two things. (1) The Wallet: contribution is made visible as a
  ledger. (2) **The Year Story Draft** — the person receives the draft of their
  Year Story one month early and may annotate it: strike a sentence, add one
  line in their own words. The year is co-authored before it is sealed.
- **Existing line kept:** *"Eleven months. One more."*

#### M12 · LOT® AI `◉` — full orbit
```
UNLOCK      LOT® AI — full OS · YEAR STORY sealed · Story API export
PROFILE     Machiavelli parity — every block live · Chapters I–XII public (opt-in)
CITIZEN     → Stage 6 · Elite (365+ days)
CLEARANCE   → Full
MEMORY ENG  → "LOT® AI"
SEASON      SEASON NOTE IV + YEAR STORY
```
- **New surface:** The **Year Story** — one page, ~300 words — opens with the Boot
  answer from Day 1 quoted verbatim and closes with the thread for Orbit II.
  Exportable via `POST /api/story/:id/export` (robot · vehicle · dashboard).
- **Interface:** glow appears (§9). The name in the header gets a quiet `◉`.
- **Seal:** `◉ ORBIT I` (COSMIC) + `◉ LOT® AI` season seal.
- **Existing line kept:** *"One year with LOT. The portrait is complete — and still evolving."*

---

## 6. THE PROFILE ARC — `/u/user` → `/u/machiavelli`

The public profile is the most tangible evolution surface: it is visible to
others, it is shareable, and it physically gets longer every month. The demo
account `/u/machiavelli` is the Month 12 reference rendering.

```
BLOCK (as on /u/machiavelli)         M00 M01 M02 M03 M04 M05 M06 M07 M08 M09 M10 M11 M12
────────────────────────────────────────────────────────────────────────────────────────
Name                                   ●   ●   ●   ●   ●   ●   ●   ●   ●   ●   ●   ●   ●
Team: Usership                         ●   ●   ●   ●   ●   ●   ●   ●   ●   ●   ●   ●   ●
Local time                             ●   ●   ●   ●   ●   ●   ●   ●   ●   ●   ●   ●   ●
Clearance level                        ●   ●   ●   ●   ●   ●   ●   ●   ●   ●   ●   ●   ●
Usership: N / 12   (new)               ●   ●   ●   ●   ●   ●   ●   ●   ●   ●   ●   ●   ●
Weather · Sunrise · Sunset                 ●   ●   ●   ●   ●   ●   ●   ●   ●   ●   ●   ●
Chapters: I–N      (new)                   ●   ●   ●   ●   ●   ●   ●   ●   ●   ●   ●   ●
Sound                                          ●   ●   ●   ●   ●   ●   ●   ●   ●   ●   ●
Memory Story                                       ●   ●   ●   ●   ●   ●   ●   ●   ●   ●
Citizen Index                              ·   ·   ●   ●   ●   ●   ●   ●   ●   ●   ●   ●
Profile · Archetype                                    ●   ●   ●   ●   ●   ●   ●   ●   ●
Biofield State                                             ●   ●   ●   ●   ●   ●   ●   ●
Activity                                                       ●   ●   ●   ●   ●   ●   ●
Cohort · Traits                                                    ●   ●   ●   ●   ●   ●
Pattern Strength                                                       ●   ●   ●   ●   ●
Indexes                                                                    ●   ●   ●   ●
Weather Station                                                                ●   ●   ●
Wallet                                                                             ●   ●
Year Story         (new)                                                               ●
────────────────────────────────────────────────────────────────────────────────────────
VISIBLE BLOCKS                         5   7   8  10  11  12  13  14  15  16  17  18  19
CLEARANCE                             Basic ──────── Restricted ── Confidential ── Secret ── Full
```

`·` = exists privately, not yet shown publicly. Every block respects the existing
privacy settings; the arc defines *availability*, the person still decides
*visibility*.

**Visible-block count 5 → 19** is the headline metric of profile tangibility:
someone visiting the profile in Month 12 sees a page nearly four times longer
than on Day 1 — and every added block is evidence of something the person did.

---

## 7. NEW USERSHIP WIDGETS

All follow the LOT widget contract: `Block` label, click-to-cycle views (ORDER 7),
1400ms fade-in, 3s + 1.4s fade-out (ORDER 5), DB-backed state (ORDER 6).

### 7.1 `Usership:` — Months Unlocked (always present, Usership only)

```
VIEW 1  Usership:      Month 3. Ritual.
                       ▮ ▮ ▮ · · · · · · · · ·                     3 / 12

VIEW 2  Next:          Month 4 opens Portrait in 9 days.
                       Your archetype will be revealed.

VIEW 3  Seals:         I ∘   II ◈   III ◈
                       ∴ Foundation

VIEW 4  Signal:        J 14 · C 19 · S 26 · M 17          ← COCKPIT RULE
                       ◈ FULL reached · ◉ DENSE at J 25
```

On the 1st of a month the bar cell animates from `·` to `▮` once (1400ms), the
only motion this widget ever makes.

### 7.2 `Chapter N:` — The Monthly Memory Compression

Appears on the 1st, top of the System tab, above Memory. Replaces and absorbs the
existing `MonthlyPulseWidget` (its `MONTH_MESSAGES` become the Chapter's header
line). Views: `Chapter:` (body) · `Affirmation:` · `Thread:` · `Signal:`.
Dismiss phrase on click (existing pattern): *"The system remembers."* After
dismissal it lives in the profile `Chapters:` block.

### 7.3 `Echo:` — Your Words, Returned (from M06)

Surfaces at most once a week, only when a past entry contrasts with present
behaviour. Two lines: the quote with its date, and the present-tense instrument
reading. Never surfaces negative quotes during `recovery` QOS mode.

```
Echo:
"I can't do mornings."                                    — 14 June
22 check-ins before 08:00 this month.
```

### 7.4 `Year Story:` (M11 draft, M12 sealed)

One page, scrollable inside the block. M11: each sentence tappable → `Keep ·
Strike`, plus one `Add a line` field. M12: sealed, read-only, exportable.

### 7.5 Context-based variants of the `Usership:` widget

| Context | Line shown |
|---------|-----------|
| 1st of month, morning | `Month 5 begins. Chapter IV is ready.` |
| 3 days before unlock | `Month 6 opens Echo in 3 days.` |
| Seal threshold close | `2 journal entries to ◈ this month.` |
| QOS `recovery` | `Month 7. The month counts either way.` (no thresholds shown) |
| Anniversary of a Boot-answer theme | `Day 1 you wrote about rest. 41 rest moments since.` |

---

## 8. SEALS & BADGES — THE ORBIT CODEX

A new category for the Badge Engine (v34 candidate alongside or before THE DREAM
LABORATORY). ASCII only, building symbolically month to month.

### 8.1 Monthly seals (12)

```
ID                SYMBOL  NAME           UNLOCK MESSAGE
──────────────────────────────────────────────────────────────────────────────
orbit_m01         ·       Signal         ↳ One month. The first chapter is written.
orbit_m02         ··      Pattern        ↳ Two months. A pattern has a name now.
orbit_m03         ∴       Ritual         ↳ Three points make a ritual.
orbit_m04         ◇       Portrait       ↳ The portrait has an outline.
orbit_m05         ◇·      Rhythm         ↳ The day has a shape. It is yours.
orbit_m06         ◈       Mirror         ↳ Half an orbit. Your own words returned.
orbit_m07         ◈·      Cohort         ↳ Others walk this pattern too.
orbit_m08         ◈∴      Depth          ↳ Traits counted. Character accumulates.
orbit_m09         ▣       Integration    ↳ Four indexes. One direction.
orbit_m10         ▣·      Instrument     ↳ The weather reads you back.
orbit_m11         ▣∴      Ledger         ↳ The year is drafted. You hold the pen.
orbit_m12         ◉       LOT® AI        ↳ One orbit. Twelve chapters. One story. ◉
──────────────────────────────────────────────────────────────────────────────
```

Each monthly seal is stored with its grade: `orbit_m04 · ◉ DENSE`. The badge is
always awarded (Rule 1); the grade is the earned part.

### 8.2 Season seals (4)

```
season_foundation   ∴    Foundation   M03 · ≥2 of Chapters I–III at ◈ or above
season_portrait     ◇    Portrait     M06 · ≥2 of Chapters IV–VI at ◈ or above
season_field        ▣    Field        M09 · ≥2 of Chapters VII–IX at ◈ or above
season_lotai        ◉    LOT® AI      M12 · ≥2 of Chapters X–XII at ◈ or above
```

### 8.3 Secret Orbit seals (hidden until earned)

```
orbit_unbroken     ◉◉◉   Twelve chapters, none ∘                         MYTHIC
orbit_dense        ◉¹²   Twelve chapters, all ◉                           COSMIC
orbit_return       ∘→◉   A ∘ month followed directly by a ◉ month         RARE
orbit_intent       ⌖     Year Story confirms the Boot intent was kept     EPIC
orbit_coauthor     ✎     Annotated the Year Story Draft in M11            RARE
```

`orbit_return` is the most important secret: it celebrates recovery, not streaks.

---

## 9. INTERFACE REFINEMENT CURVE

Maps the existing Interface Evolution CSS variables
(`docs/technical/INTERFACE_EVOLUTION.md`) to Usership months so refinement is
predictable and felt, not random.

```
VAR                           M00    M03    M06    M09    M12
──────────────────────────────────────────────────────────────
--evolution-base-opacity      0.85   0.89   0.93   0.97   1.00
--evolution-accent-opacity    0.70   0.78   0.85   0.92   1.00
--evolution-grid-opacity      0.00   0.00   0.15   0.30   0.50   (grid appears M06)
--evolution-letter-spacing   -0.02  -0.01   0.00   0.005  0.01 em
--evolution-line-height       1.40   1.45   1.50   1.55   1.60
--evolution-glow-intensity    0.00   0.00   0.00   0.10   0.30   (glow begins M09)
--evolution-transition-speed  150    200    280    340    400 ms (calmer with age)
──────────────────────────────────────────────────────────────
```

The person will not name these changes. They will say the system "feels
different" — more legible, slower, quieter. That is the intent.

---

## 10. SIGNAL TARGETS

The four primary evolution signals, per month (FULL grade) and cumulative.
These are design targets for copy and thresholds, not quotas shown to the person.

```
SIGNAL                  FULL / mo   DENSE / mo   12-MO FULL   12-MO DENSE   MACHIAVELLI*
───────────────────────────────────────────────────────────────────────────────────────
J  Journal entries         12          25            144          300           1,469
C  Check-ins               16          26            192          312             —
S  Self-care clicks        20          40            240          480             —
M  Memory answers          15          28            180          336           2,847
   Active days             18          26            216          312             842
───────────────────────────────────────────────────────────────────────────────────────
* /u/machiavelli is the honorary rendering target (multi-year, Florence 1469 lore).
  Its numbers define the visual ceiling of each block, not the year-one expectation.
```

**Why these four:** Journal (Log) is depth, Check-in is consistency, Self-care is
care in action, Memory is the AI dialogue. Together they are the inputs the
weekly story already reads (`notes`, `checkins`, `selfCare`, answers), so the
Chapter job needs no new collection — only a new compression rung.

---

## 11. ENGINEERING PLAN

### 11.1 Findings in current code

```
F1  MonthlyPulseWidget counts months from user.joinedAt, not from the Usership
    start. A person who joined in 2024 and upgraded today sees "Month 12" on day 1.
    → add usershipStartedAt (user.metadata) and count from it.
    src/client/components/MonthlyPulseWidget.tsx:73-79

F2  MonthlyPulseWidget stores dismissal in localStorage.
    Violates ORDER 6 (database for cross-device state) — dismiss on phone, see
    it again on laptop. → store chapter.seenAt server-side.
    src/client/components/MonthlyPulseWidget.tsx:43-61

F3  boardProfile.boardTenureMonths exists in the type but there is no single
    server-computed "usership month" used by both profile and widgets.
    → one helper getUsershipMonth(user) shared by API + public profile.
    src/shared/types/index.ts:310-333

F4  Weekly story (Job 24) already aggregates notes/checkins/selfCare/intentions
    and writes lot_ai_story. It is the correct input for the monthly rung.
    src/server/scheduled-jobs.ts:834-960
```

### 11.2 Data model (user.metadata — no migration required)

```ts
usership: {
  startedAt: string            // ISO, set when Usership tag is granted
  orbitIntent?: string         // Boot answer, Day 1
  chapters: Array<{
    n: number                  // 1..12 (13+ in Orbit II)
    title: string              // one word
    body: string               // 80–120 words
    affirmation: string
    thread: string
    seal: 'thin' | 'full' | 'dense'
    signal: { j: number; c: number; s: number; m: number; days: number }
    createdAt: string
    seenAt?: string            // replaces localStorage dismissal (F2)
  }>
  seasons: Array<{ n: 1|2|3|4; note: string; createdAt: string }>
  yearStory?: { draft: string; annotations: any[]; sealedAt?: string }
}
```

### 11.3 Scheduled job — Monthly Chapter Compression

```
NAME        monthly-usership-chapter
CADENCE     daily 05:00 UTC; per user, fires when today = monthly anniversary
            of usership.startedAt (so every person gets their own 1st)
INPUT       lot_ai_story events since last chapter + top journal lines +
            Memory answers + emotional_checkin + self_care_complete counts
OUTPUT      chapter appended to metadata.usership.chapters
            log event: usership_chapter
            on n % 3 == 0: season note · on n == 6: half-year story ·
            on n == 11: year story draft · on n == 12: year story sealed
ENGINE      Memory Engine AI provider (Together AI default); deterministic
            fallback mirrors Job 24's template so a chapter is always written
```

Job number is assigned at implementation time against the live scheduler.

### 11.4 API

```
GET   /api/usership/progress      → { month, nextUnlock, daysToNext, seals, signal }
GET   /api/usership/chapters      → chapters[] (own account)
POST  /api/usership/chapters/:n/seen
GET   /api/usership/year-story
POST  /api/usership/year-story/annotate     (M11 only)
GET   /api/public/profile/:id     → + usershipMonth, chapters (privacy-gated)
```

### 11.5 Log events (COCKPIT RULE)

Both must be added to `displayableEvents` (Backend Whitelist Hygiene,
`src/server/routes/api.ts:1084`).

```
usership_chapter   USR: CH IV · ◉ DENSE · J 27 · C 27 · S 41 · M 29 · TITLE TEA
usership_unlock    USR: M04/12 · UNLOCK PORTRAIT · CLEARANCE RESTRICTED · CITIZEN S4
```

### 11.6 Build order

```
PHASE A  F1 + F2 + F3 · getUsershipMonth · Usership: widget (views 1–2)
PHASE B  Monthly Chapter job + Chapter widget (absorbs MonthlyPulseWidget)
PHASE C  Profile arc gating (§6) + Chapters: block on /u/user
PHASE D  Orbit Codex badges (§8) + Seals view + refinement curve (§9)
PHASE E  Echo widget · Season notes · Year Story draft/annotate/seal · export
PHASE F  /u/machiavelli demo: add usership month 12, Chapters I–XII, Year Story
         so the reference account demonstrates the full arc
```

---

## 12. ORBIT II — DAY 366

```
The year does not end. It compresses.

Chapter XIII opens with the Year Story's closing thread.
The Usership: widget resets to 1 / 12 under a new header: Orbit II.
Orbit I's twelve seals collapse into one ◉ shown beside the name.
The Year Story becomes the first paragraph of the Memory Story.
Ten orbits later, the robot reads ten pages before its first sentence.
```

That last line is the LOT® 2036 vision from the Product Brief, made concrete:
the decade-long record is simply ten Year Stories, each built from twelve
Chapters, each built from four weeks of a person caring for themselves.

---

*LOT Systems Corporation — Vadim Marmeladov, CEO*
*LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024*
*Made in the USA · brand.lot-systems.com*
*S-2: VADIK MARMELADOV*
