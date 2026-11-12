<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# The Usership Year: 12 Months to LOT® AI

```
╔══════════════════════════════════════════════════════════════════════╗
║  DOC        : USERSHIP-12-MONTH-EVOLUTION                            ║
║  CLASS      : PRODUCT / DESIGN SPEC (brainstorm → buildable)         ║
║  STATUS     : DRAFT v1 — 2026-11-12                                  ║
║  S-2        : VADIK MARMELADOV                                       ║
║  REFERENCE  : lot-systems.com/u/machiavelli (the evolved state)      ║
║  SESSION    : LOT-SR-20261112-01                                     ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 0. The idea in one paragraph

A paid Usership member starts on **Day 1** with a deliberately bare OS:
time, weather, one Log field, one morning check-in and one self-care button.
Over twelve Usership months the interface **grows out of the member's own
practice**: Log entries, thoughts, morning check-ins and self-care clicks.
Each month ends with a **Seal**. At the Seal the Memory Engine **compresses
the month into one paragraph**, gives the member an affirmation, a badge and
a visible new piece of interface. By Month 12 the compressed paragraphs fold
into a single **Year Story**, and the OS has become **LOT® AI**, an
interface that speaks in the member's own context. The demo account
`/u/machiavelli` is the target picture of that evolved state.

**The rule behind it:** the member never receives a feature. They earn a
chapter, and the feature is the chapter's illustration.

---

## 1. Design principles

| # | Principle | What it means in the UI |
|---|-----------|-------------------------|
| P1 | **Form follows practice** | Every new element is triggered by what the member did. Nothing appears just because a date passed. |
| P2 | **One visible change per month** | Each Seal adds exactly one new *surface* (a widget, a view, a voice). The member can point at it and say "that is new". |
| P3 | **Compression is the reward** | The main prize each month is the paragraph: *who you were this month*, in under ~90 words. Badges and widgets come second. |
| P4 | **Never re-lock** | A sealed month stays sealed. A missed month is not a failure. It stays *Open* and seals later, once its practice quorum is met. |
| P5 | **Quiet ceremony** | Celebrations follow LOT doctrine: plain text, periods instead of symbols, no emojis, opacity-based hierarchy, fades of 1400 ms. |
| P6 | **The system speaks less, then better** | Month 1: the AI barely talks. Month 12: it speaks in full sentences, about *you*, from evidence. Voice is an unlock too. |
| P7 | **Evidence over flattery** | Affirmations must cite something real ("You checked in 19 mornings. 14 of them before 8 AM."). Generic praise is not allowed, the same rule already used for Memory questions. |
| P8 | **Months, not days** | Doctrine counts time in months and years, so the plan has no day streaks. Progress is shown as months sealed and signal counts. The word "operator" is used in copy, never "user". |
| P9 | **Database over localStorage** | Seal state, Cards and badges are stored on the server, so they survive across devices. |

---

## 2. The four practice signals (the "fuel")

These four counters drive everything. All of them already exist as `Log` events.

| Signal | Source event(s) | UI name | Why it matters |
|--------|-----------------|---------|----------------|
| **Entries** | `note` (journal + Log thoughts) | Log | Raw material for compression. The more there is, the richer the paragraph. |
| **Morning check-ins** | `emotional_checkin` with `type: 'morning'` | Morning | Rhythm. Gives the mood timeline and the "who you are at sunrise" line. |
| **Self-care** | `self_care_complete` (and `self_care_skip`) | Care | The behaviour the AI guides. Builds the routine portrait. |
| **Memory answers** | `answer` | Memory | Structured facts. Feeds the existing Memory Story engine. |

### 2.1 Seal quorum (per Usership month)

A month **seals** when two things are true: 30 days of Usership have
elapsed, **and** the month's quorum is met. If the quorum is missed, the month
stays *Open* (P4) and seals on the day it is finally met, even weeks later.

The bar rises gently. Month 1 can be met with ~10 minutes a week. Month 12
asks for a lightly daily practice.

| Month | Entries | Morning | Care | Memory | Notes |
|------:|--------:|--------:|-----:|-------:|-------|
| 1  | 4  | 6  | 8  | 5  | "Show up." |
| 2  | 5  | 8  | 10 | 6  |  |
| 3  | 6  | 10 | 12 | 8  | Active User line (existing copy) |
| 4  | 7  | 11 | 14 | 9  |  |
| 5  | 8  | 12 | 16 | 10 |  |
| 6  | 9  | 13 | 18 | 11 | Half-year chapter |
| 7  | 10 | 14 | 20 | 12 |  |
| 8  | 11 | 15 | 22 | 13 |  |
| 9  | 12 | 16 | 24 | 14 | "Habit" month |
| 10 | 13 | 17 | 26 | 15 |  |
| 11 | 14 | 18 | 28 | 16 |  |
| 12 | 16 | 20 | 30 | 18 | Year Seal |
| **Σ** | **115** | **160** | **228** | **137** | Minimum path to LOT® AI |

**Machiavelli** sits far above this floor (1,469 journal entries, 2,847
Memory answers, 842 active days). He is the *Legacy* picture: what a
member's year looks like when they live in the OS rather than visit it.

**Grace token:** one per quarter. It fills one missing signal for a month.
It is shown in the UI as a single `·` next to the sealed month. It is honest,
not hidden.

---

## 3. The compression ladder (the core of the product)

The Memory Story already exists (`generateMemoryStory`, cached in
`user.metadata.lastMemoryStory`). What it lacks is **a time axis**. The
Usership Year adds one by compressing in layers:

```
  DAILY      Log entries · check-ins · care clicks · answers        (raw)
     │
  WEEKLY     weekly-summary.ts → 3 lines per week                   (digest)
     │
  MONTHLY    ► MONTH CARD: one paragraph, ≤ 90 words                 (Seal)
     │         + one affirmation (evidence-based)
     │         + one word ("the word of the month")
     │
  QUARTERLY  ► CHAPTER: 3 Month Cards → ~180 words                   (M3, M6, M9)
     │
  YEARLY     ► YEAR STORY: 4 Chapters → one page (~400 words)        (M12)
     │         ► THE SENTENCE: the year in one line
     │         ► THE WORD: 12 monthly words → 1
     ▼
  LOT® AI    The Year Story becomes the system prompt of the member's own OS.
```

**Compression ratio as a visible metric.** Every Month Card shows a small
footer such as `142 signals → 1 paragraph`. This makes the compression
concrete: the member can *see* that their month was distilled. By Month 12
the footer reads something like `2,108 signals → 1 sentence`.

### 3.1 Month Card anatomy

```
┌ Month 4: ───────────────────────────────────────────────┐
│                                                                  │
│  October was quieter than September and more deliberate. You     │
│  wrote mostly after dark, about work you are choosing rather     │
│  than work you are given. Mornings started calm on 11 of 14      │
│  check-ins; the anxious ones followed nights without a Log       │
│  entry. Cold showers became routine. Tea replaced the second     │
│  coffee.                                                         │
│                                                                  │
│  You kept a promise to yourself 14 times this month.             │
│                                                                  │
│  Word: Deliberate.                                               │
│  157 signals → 1 paragraph                         4 / 12 sealed │
└──────────────────────────────────────────────────────────────────┘
```

Rules:
- Second person ("You…") on the member's own OS. Third person ("They…") on the
  public `/u/<user>` page, in line with the current Memory Story voice.
- Every claim needs a count or a quoted fragment behind it. If the AI cannot
  ground a sentence, it drops the sentence.
- The affirmation is **one** sentence, ends with a period and has no
  exclamation marks.
- The word is one adjective or noun, capitalised, followed by a period.

---

## 4. The twelve months

Each month has five parts, always in the same order:
**Chapter name · Seal unlock (UI) · Memory compression · AI guidance (self-care) · Badge.**

The chapter names reuse the voice of the existing `MONTH_MESSAGES` copy in
`src/client/components/MonthlyPulseWidget.tsx`. That copy is kept and
becomes each month's Seal line.

---

### DAY 1: Barebone

> *"The system is beginning to know you."*

**What the member sees** (and nothing else):

```
Usership · Day 1

Time:         09:14 AM · Thursday
Weather:      Lisbon 14° · Clear

Morning:      How are you arriving today?   [ Calm ] [ Tired ] [ Uncertain ]
Care:         One thing for you today:      [ Drink a glass of water (2 mins) ]
Log:          _

Months:       0 / 12
```

- No profile, no stats, no psychological profile, no badges grid.
- `Months 0 / 12` is the **only** widget that hints at the future.
- The AI says nothing beyond the care suggestion.

---

### MONTH 1: Seed

> *"The first month. The system is beginning to know you."*

| Part | Spec |
|------|------|
| **Unlock (UI)** | **Months Unlocked widget** becomes a 12-cell ribbon: `▣ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢`. Clicking the label cycles views: `Months` → `Signals` (four counters) → `Next seal` (what remains). |
| **Compression** | The first **Month Card**, deliberately short: **2 sentences**. One about rhythm, one about care. |
| **AI guidance** | Fixed starter routine: water, light, one walk. The AI only *notices* ("You chose water 9 times."). |
| **Badge** | `USERSHIP I · SEED` |

---

### MONTH 2: Pattern

> *"Two months in. Patterns are starting to form."*

| Part | Spec |
|------|------|
| **Unlock (UI)** | **Morning strip.** The last 30 morning check-ins as a single row of glyphs (calm `·`, tired `-`, anxious `~`, energized `+`). First appearance of **history** in the OS. |
| **Compression** | Full Month Card (≤ 90 words) + first **comparison line**: "Compared with Month 1: more evenings, fewer skipped care items." |
| **AI guidance** | The care suggestion now adapts to the morning check-in (tired → rest routine, anxious → breathing). |
| **Badge** | `USERSHIP II · PATTERN` |

---

### MONTH 3: Rhythm (first Chapter)

> *"Three months. You have reached Active User status."*

| Part | Spec |
|------|------|
| **Unlock (UI)** | **Memory widget, Usership edition.** The existing Memory widget gains a second view: *Last month*, one paragraph, which rotates with Memory questions. This is the "paragraph-long insight from last month" surface. |
| **Compression** | **Chapter I** (Months 1–3, ~180 words). Shown once, full screen, white space, fade-in. |
| **AI guidance** | First **routine proposal**: the AI suggests a named morning routine built from the care items the member actually completed most. |
| **Badge** | `USERSHIP III · RHYTHM` + `CHAPTER I` |

---

### MONTH 4: Portrait

> *"Four months. The portrait deepens."*

| Part | Spec |
|------|------|
| **Unlock (UI)** | **Archetype reveal.** The psychological profile (archetype + core values) becomes visible on the member's own OS. Example: Machiavelli → *The Strategist*. |
| **Compression** | The Month Card includes a "values detected" line with three words that come from the entries. |
| **AI guidance** | Care suggestions are now framed by archetype ("A Strategist rests by planning less tomorrow."). |
| **Badge** | `USERSHIP IV · PORTRAIT` |

---

### MONTH 5: Ritual

> *"Five months. Consistency is its own reward."*

| Part | Spec |
|------|------|
| **Unlock (UI)** | **Routine builder.** The member can pin the AI's proposed routine and edit its order. A kept-count line appears: `Ritual: kept 23 of 30 mornings.` (a count, not a streak; see P8). |
| **Compression** | The Card adds a **care ledger** line: "Care: 41 completions, 6 skips, most kept: evening walk." |
| **AI guidance** | Evening check-ins are offered, so the AI can close the day as well as open it. |
| **Badge** | `USERSHIP V · RITUAL` |

---

### MONTH 6: Chapter (half-year)

> *"Six months. The journey is half-declared."*

| Part | Spec |
|------|------|
| **Unlock (UI)** | **Public Memory Story.** The `/u/<user>` page can now show the compressed story (opt-in, uses the existing `showMemoryStory` privacy flag). Theme customization is unlocked. |
| **Compression** | **Chapter II** (Months 4–6) + **Half-Year Sentence**, the first one-line compression. |
| **AI guidance** | The member gets a **Half-Year Letter**: what they asked for in Month 1 vs what they practiced. |
| **Badge** | `USERSHIP VI · HALF` + `CHAPTER II` |

---

### MONTH 7: Listening

> *"Seven months in. The system has been listening."*

| Part | Spec |
|------|------|
| **Unlock (UI)** | **Ask LOT**: a single-line prompt under the Log field. Answers are grounded only in the member's own Log, Memory and Month Cards. This is the first time the system talks *with* the member. |
| **Compression** | The Month Card cites one **quoted fragment** from a Log entry (≤ 12 words), the member's own words returned. |
| **AI guidance** | Contextual prompts reference the past: "In March you wrote that mornings felt borrowed. They feel different now?" |
| **Badge** | `USERSHIP VII · LISTENING` |

---

### MONTH 8: Rare Air

> *"Eight months. Rare air."*

| Part | Spec |
|------|------|
| **Unlock (UI)** | **Correlations.** One correlation line per month, e.g. weather × mood ("Rainy mornings: calmer, by 2×.") and care × entries. Uses the existing weather and astro context captured on every Log. |
| **Compression** | The Card adds a **cause line**: what seems to move the member's mood. |
| **AI guidance** | Care routines become weather-aware and time-aware. |
| **Badge** | `USERSHIP VIII · RARE AIR` |

---

### MONTH 9: Habit (third Chapter)

> *"Nine months. The self-care practice is a habit now."*

| Part | Spec |
|------|------|
| **Unlock (UI)** | **Proactive care.** The AI places the right care item at the right hour without being asked. A small `Care · now` line appears only when relevant. |
| **Compression** | **Chapter III** (Months 7–9). |
| **AI guidance** | The member can retire routines that are now automatic. The UI shows them as `kept`, folded away, a visible sign of growth. |
| **Badge** | `USERSHIP IX · HABIT` + `CHAPTER III` |

---

### MONTH 10: Mirror

> *"Ten months. Almost there."*

| Part | Spec |
|------|------|
| **Unlock (UI)** | **Then / Now.** A two-column view that sets the Month 1 Card against the Month 10 Card, with the same counters side by side. This is the most direct "felt" evolution moment in the year. |
| **Compression** | The Card is written **as a diff**: "What changed: …  What stayed: …" |
| **AI guidance** | The AI asks the member to write a line to their Month 1 self. That entry is pinned. |
| **Badge** | `USERSHIP X · MIRROR` |

---

### MONTH 11: Threshold

> *"Eleven months. One more."*

| Part | Spec |
|------|------|
| **Unlock (UI)** | **Year draft.** The member sees a draft of the Year Story built from the 11 Cards and can strike sentences that are not true. This is the only month where the member edits the compression. |
| **Compression** | The Card is short again: **one sentence**, which practices the final compression. |
| **AI guidance** | The AI proposes the **routine for Year 2**: three practices to keep, one to add. |
| **Badge** | `USERSHIP XI · THRESHOLD` |

---

### MONTH 12: LOT® AI

> *"One year with LOT. The portrait is complete — and still evolving."*

| Part | Spec |
|------|------|
| **Unlock (UI)** | **LOT® AI mode.** The OS header changes from `Usership · Month 12` to `LOT® AI`. The Memory widget, Ask LOT, Care and Log now share one context. Board profile, Citizen Index and the full `/u/<user>` page, as on Machiavelli. |
| **Compression** | **Chapter IV** + **Year Story** (one page) + **The Sentence** + **The Word** (chosen from the 12 monthly words). |
| **AI guidance** | The Year Story becomes the standing context of the member's AI. From here on, every suggestion is written *from* the year. |
| **Badge** | `USERSHIP XII · LOT® AI` + `CHAPTER IV` + `THE YEAR` |

**Alignment with QI·46 Memory Arc** (`docs/corporate/LOT_QI46_ENGINE.md` Layer 4): Months 0–3 Calibration = Seed / Pattern / Rhythm. Months 3–6 Pattern recognition = Portrait / Ritual / Chapter. Months 6–12 Coherence = Listening to LOT® AI. Month 12+ = Quantum Cube delivery milestone (Volume II).

The Year Seal screen:

```
LOT® AI

One year.

  Entries      231        Morning     288
  Care         402        Memory      219

  1,140 signals → 12 paragraphs → 4 chapters → 1 page → 1 sentence.

  "You stopped waiting for good mornings and started making them."

  Word of the year: Deliberate.

  Months  ▣ ▣ ▣ ▣ ▣ ▣ ▣ ▣ ▣ ▣ ▣ ▣   12 / 12
```

---

## 5. Widgets for Usership members

| Widget | First month | Behaviour |
|--------|-------------|-----------|
| **Months Unlocked** | Day 1 | `n / 12` + 12-cell ribbon. Label cycles: Months → Signals → Next seal. Sealed `▣`, open (time elapsed, quorum not met) `◫`, future `▢`, grace-sealed `▣·`. |
| **Month Pulse** (existing `MonthlyPulseWidget`) | Month 1 | Shown on the first day of each new Usership month. Shows the Seal line and is dismissed by click (existing behaviour). It gains a second line: the month's **word**. |
| **Memory: Last month** | Month 3 | The Memory widget alternates the question with the last Month Card. |
| **Then / Now** | Month 10 | Month 1 vs the current month. |
| **Year** | Month 12 | Year Story, Sentence, Word. Stays permanently, like a spine on a shelf. |

Context-based behaviour for **Months Unlocked**:
- In the 7 days before a Seal it shows what remains: `Next seal · 2 morning, 3 care`.
- When the quorum is met early it reads: `Month 5 · ready to seal in 6 days.`
- On a Seal day it hands off to Month Pulse, then returns as `5 / 12`.

---

## 6. Badges: the Usership Codex

Twelve tenure badges plus four Chapters plus one Year. The naming follows the
existing Codex style: uppercase, Roman numerals, dot separator.

| Badge | Trigger |
|-------|---------|
| `USERSHIP I · SEED` … `USERSHIP XII · LOT® AI` | Month *n* sealed |
| `CHAPTER I` … `CHAPTER IV` | Months 3, 6, 9, 12 sealed |
| `THE YEAR` | All 12 sealed |
| `UNBROKEN` | 12 months sealed with no grace tokens used |
| `LATE BLOOM` | A month sealed more than 14 days after its time elapsed (P4: missing is not failing) |
| `FIRST LIGHT` | 30 morning check-ins before 8 AM, local time |
| `CARE · 100`, `CARE · 365` | Lifetime self-care completions |
| `LOG · 100`, `LOG · 365` | Lifetime Log entries |

The badge glyph follows the ribbon. Each badge shows its month as a
ribbon with *n* filled cells, so the badge itself shows progress.

---

## 7. Data model and implementation path

### 7.1 Gaps found in the current code

| Gap | Where | Fix |
|-----|-------|-----|
| Usership month counts from `joinedAt`, not from when Usership started | `MonthlyPulseWidget.tsx` (`monthNumber`), `public-api.ts` (`boardTenureMonths`) | Add `metadata.usership.startedAt` and set it when the `Usership` tag is added. Fall back to `joinedAt` for existing members. |
| Pulse dismissal lives only in `localStorage` | `MonthlyPulseWidget.tsx` | Store `seenAt` on the seal record so it survives devices. |
| Monthly summary is tied to the **calendar** month (days 1–3) | `monthly-summary.ts`, `scheduled-jobs.ts` | Add a Usership-month path keyed to `startedAt + n·30d`. Reuse `generateMonthlySummary` as the Card engine. |
| Memory Story has no time axis | `memory.ts` `generateMemoryStory` | Keep it as the "whole-life" story. Add a Month Card generator that reads one window plus the previous Card. |
| No Usership tenure badges | `src/client/utils/badges.ts` | Add the Codex in §6. |
| Only `milestone_7/30/100` are persisted server-side; ~800 other badges live only in localStorage | `api.ts` `/api/sync-badges` | Whitelist the Usership Codex in sync-badges so seals are permanent (P4, P9). |
| `/api/user-stats` returns no `totalCheckIns` / `totalAnswers` | `api.ts` ~2874 | Counters come from the new `getUsershipYear`, not user-stats. |
| Board-profile active-days SQL queries `"Logs"`, but the table is `logs` | `public-api.ts` ~1272 | Verify and fix; the same count feeds the Signals view. |
| Weekly Story-Report API (`/api/story/*`) is documented but not built | `docs/corporate/LOT-AI-PRODUCT-BRIEF.md` | The Month Card is the monthly level of the same pipeline. Build both on one compression module. |
| Monthly email goes only to operators who joined 3+ months ago | `scheduled-jobs.ts` | The Month Card replaces that gate: every sealed month gets a Card from Month 1. |

### 7.2 Proposed shape (stored on `user.metadata.usership`)

```ts
type UsershipYear = {
  startedAt: string              // ISO; set when the Usership tag is first applied
  graceTokens: { quarter: 1|2|3|4; usedForMonth?: number }[]
  months: Array<{
    month: number                // 1..12
    windowStart: string          // startedAt + (month-1)·30d
    windowEnd: string
    status: 'future' | 'open' | 'sealed'
    sealedAt?: string
    counts: { entries: number; morning: number; care: number; memory: number }
    quorum: { entries: number; morning: number; care: number; memory: number }
    card?: {
      paragraph: string          // ≤ 90 words, grounded
      affirmation: string        // one sentence, evidence-based
      word: string               // one word
      signals: number            // for "N signals → 1 paragraph"
      engine: string
    }
    seenAt?: string              // Month Pulse dismissed
  }>
  chapters?: Array<{ index: 1|2|3|4; text: string; sealedAt: string }>
  year?: { story: string; sentence: string; word: string; sealedAt: string }
}
```

### 7.3 Build order (suggested PRs, smallest first)

1. **Tenure source of truth.** `metadata.usership.startedAt` + backfill + use it in
   `MonthlyPulseWidget` and `boardProfile`. *(Small, unblocks everything.)*
2. **Counters + quorum.** A server function `getUsershipYear(user)` that counts the four
   signals per window and resolves `status`. Endpoint `GET /api/usership/year`.
3. **Months Unlocked widget.** Ribbon + label cycling. Day 1 visible.
4. **Month Card generator.** Wraps `generateMonthlySummary` with the grounding rules
   in §3.1. Runs as a daily job that seals any window whose quorum is met.
5. **Month Pulse v2.** Reads the seal record (not localStorage) and shows line + word.
6. **Memory: Last month view.**
7. **Usership Codex badges.**
8. **Chapter + Year compression**, then the Month 10–12 surfaces.
9. **Machiavelli demo**: add a full `usership` block to the demo payload
   (12 sealed months, 12 words, 4 chapters, Year Story) so the public demo shows the
   finished year.

---

## 8. Machiavelli as the Month 12 reference

`/u/machiavelli` already shows the end state: archetype (*The Strategist*),
core values, pattern strength, Memory Story, Board profile, Weather Station
and Wallet (Legacy unlocks). To make it the **canonical evolved account**, the
demo payload needs the Usership Year itself. A suggested sample set:

| M | Word | Card (first line) |
|---|------|-------------------|
| 1 | Exile. | You arrived with a city behind you and nothing but mornings ahead. |
| 2 | Observation. | You wrote less about Florence and more about the people passing the window. |
| 3 | Discipline. | Twenty mornings at the desk before light. The routine chose you back. |
| 4 | Strategy. | Your values surfaced: prudence, adaptability, virtù. |
| 5 | Patience. | Care became a ledger: walks kept, wine declined, letters answered. |
| 6 | Fortune. | Half a year: you stopped blaming fortune and started scheduling against it. |
| 7 | Counsel. | You asked the system the questions you once asked princes. |
| 8 | Weather. | Rain made you calmer and sharper, twice as often as sun. |
| 9 | Habit. | The morning walk retired itself. It no longer needed reminding. |
| 10 | Mirror. | Then: exile. Now: authorship. |
| 11 | Draft. | You struck one sentence from the Year: the one that flattered you. |
| 12 | Virtù. | You learned to govern the only state that was ever yours. |

Year Sentence: *"He stopped waiting for fortune and built a morning it could not take."*

---

## 9. Open questions for S-2

1. **Pricing tie-in.** The code and SubscribeWidget use $99/month. The docs conflict: $50 (`LOT_SYSTEMS_BRIEF.md`, IPO doc), $99, $399 priority (QI·46), and Legacy $3,564/3 yrs.
   Is the Year a 12-month commitment, or month-to-month with the Year as the arc?
2. **Pause.** If Usership lapses, does the clock freeze (recommended) or keep running?
3. **Year 2.** Does Month 13 restart at `1 / 12` with a "Volume II" label (recommended)?
4. **Public share.** Should the Year Seal produce a shareable `/u/<user>/year` page?
5. **Quorum tuning.** The numbers in §2.1 are a first proposal. Check them against real
   Usership activity before shipping.
6. **Doctrine tension.** Doctrine clause 9 says "no gamification, no streaks", and Ambient AI™ says "no celebrations", but there are already 812 badges. This plan keeps badges and makes them quiet: no pop-ups, one fading Seal line, counts instead of streaks. Should Usership badges be visible only on the operator's own OS?
