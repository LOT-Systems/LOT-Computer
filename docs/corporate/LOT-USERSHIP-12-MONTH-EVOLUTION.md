<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® USERSHIP — THE 12-MONTH EVOLUTION

**From barebone OS to LOT® AI. Twelve chapters. One compressed Memory story.**

```
DOC      : LOT-USERSHIP-12-MONTH-EVOLUTION
REV      : A (brainstorm + system outline)
DATE     : 2026-11-11
S-2      : VADIK MARMELADOV
CLASS    : PRODUCT / UX
END STATE: lot-systems.com/u/machiavelli  (demo of a fully evolved account)
SESSION  : docs/LOT-SR-20261111-01.md
```

---

## 0. THE ONE-LINE IDEA

> Every Usership month ends with a **sealed chapter**: a compressed paragraph of who
> the person was that month, an affirmation, a badge, and one new surface of the OS.
> Twelve chapters compress into one **Year Codex**. On Day 365 the barebone OS has
> become LOT® AI — and the person can see, month by month, exactly how they got there.

The person does not "level up a profile". They **write a book without writing a book**:
journal entries, morning check-ins, self-care taps and Memory answers are the ink;
the Memory Engine is the editor; each month is a chapter.

---

## 1. DESIGN PRINCIPLES (bound to existing doctrine)

| # | Principle | Source in repo |
|---|-----------|----------------|
| 1 | **Start minimal, earn complexity.** Day 1 is almost empty. Every surface is earned. | `docs/technical/INTERFACE_EVOLUTION.md` — "Progressive Enhancement" |
| 2 | **Two clocks, never confused.** *Months unlocked* is tenure (paid time). *Surfaces unlocked* is signal (practice). Paying keeps the month counter moving; practice opens the OS. | new — this doc |
| 3 | **No month is ever failed.** A month with low signal seals as a *Quiet Chapter* — still compressed, still kept, still celebrated. | `LOT-DOCTRINE` — Graceful Degradation |
| 4 | **Compression of compression.** Month N's story is built from raw logs of month N **plus** the sealed stories of months 1…N-1. The Year Codex is built only from the 12 chapters. | `MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md` — Virtuous Compression Cycle |
| 5 | **Military purity.** No emojis, no superlatives, no confetti. Celebration = a calm sentence, a glyph, a 1400 ms fade. | `LOT-LEXICON` — MILITARY PURITY |
| 6 | **Cockpit rule in the Log.** Chapter seal event in Log: label `CHAP:`, body = instrument readings only. | `LOT-DOCTRINE` — COCKPIT-RULE |
| 7 | **Tangible every month.** Each month must change at least one thing the person can *see* (a widget), *hold* (a badge), and *read* (a chapter). | new — this doc |

---

## 2. THE FOUR EVOLUTIONARY SIGNALS

The evolution is driven by four signals already present as Log events.
These are the "ink" of the story.

| Signal | Log event | What it means to the story | Weight in chapter |
|--------|-----------|----------------------------|-------------------|
| **Journal / thoughts** | `note` (+ `journal`) | The person's own words. The richest raw material. | ×3 |
| **Memory answers** | `answer` | The machine's questions, the person's choices. The skeleton. | ×2 |
| **Morning check-ins** | `emotional_checkin` before 12:00 local, `plan_set` | The daily rhythm. Proof of presence. | ×1.5 |
| **Self-care taps** | `self_care` | The body. Small acts repeated. | ×1 |

**Chapter Ink Score** (per month) = `3·journal + 2·answers + 1.5·morning + 1·selfcare`
— used only to choose *how long* the compressed story may be and whether the
month seals **Full** or **Quiet**. It is never shown as a score. The person sees
plain counts.

### Seal thresholds (per month, not cumulative)

```
FULL SEAL   : journal ≥ 4  AND  morning ≥ 8  AND  selfcare ≥ 10  AND  answers ≥ 15
QUIET SEAL  : anything below — still sealed, still compressed, still kept
```

### Surface unlock thresholds (cumulative — the second clock)

| Month | Answers | Journal | Morning check-ins | Self-care |
|------:|--------:|--------:|------------------:|----------:|
| 1  |  10 |   4 |   8 |  10 |
| 2  |  30 |  10 |  20 |  30 |
| 3  |  60 |  18 |  35 |  55 |
| 4  |  90 |  26 |  50 |  80 |
| 5  | 125 |  35 |  65 | 110 |
| 6  | 160 |  45 |  85 | 140 |
| 7  | 195 |  55 | 100 | 170 |
| 8  | 230 |  65 | 120 | 200 |
| 9  | 270 |  76 | 140 | 235 |
| 10 | 310 |  88 | 160 | 270 |
| 11 | 350 | 100 | 180 | 305 |
| 12 | 400 | 115 | 200 | 340 |

A surface opens when **tenure ≥ month N AND cumulative signal ≥ row N**. A person
in Month 7 with Month-5 signal sees Month-5 surfaces and a gentle line:
`Next surface: 9 journal entries.` Never a lock icon, never "you are behind".

---

## 3. THE TWELVE CHAPTERS — OVERVIEW

```
QUARTER I — FOUNDATION        QUARTER II — RHYTHM          QUARTER III — DEPTH          QUARTER IV — LOT® AI
 M1  ·    FIRST LIGHT          M4  ∘·   THE PORTRAIT        M7  ◐·   THE LISTENING       M10 ◕·   ARCHITECTURE
 M2  ··   RHYTHM               M5  ∘∘   CONSISTENCY         M8  ◐∘   RARE AIR            M11 ◕∘   THRESHOLD
 M3  ∘    RITUAL               M6  ◐    THE MIRROR          M9  ◕    HABIT               M12 ◉    LOT® AI
```

Glyph logic: a dot becomes a circle (Q1), the circle fills by halves (Q2–Q3),
the full circle `◉` is the year. The 12 glyphs line up on the profile as the
**Year Rail**:

```
·  ··  ∘  ∘·  ∘∘  ◐  ◐·  ◐∘  ◕  ◕·  ◕∘  ◉
```

### Compression ladder — how long the Memory story is each month

| Month | Deliverable | Length | Inputs |
|------:|-------------|--------|--------|
| 1 | **First Line** | 1 sentence, ≤ 25 words | month-1 logs |
| 2 | **The Rhythm** | 2 sentences | month-2 logs + M1 line |
| 3 | **Quarter Portrait I** | 1 paragraph, ~60 words | M3 logs + M1–M2 |
| 4 | Chapter IV | 1 paragraph, ~70 words + "one thing changed" | M4 logs + M1–M3 |
| 5 | Chapter V | 1 paragraph, ~80 words | M5 logs + M1–M4 |
| 6 | **The Mirror** (half-year) | 2 paragraphs + M1-vs-M6 contrast line | M6 logs + M1–M5 |
| 7 | Chapter VII | 1 paragraph, ~90 words | M7 logs + M1–M6 |
| 8 | Chapter VIII | 1 paragraph + archetype sentence | M8 logs + M1–M7 |
| 9 | **Quarter Portrait III** | 1 paragraph, ~100 words + 3 core values | M9 logs + M1–M8 |
| 10 | Chapter X | 1 paragraph + pattern strength list | M10 logs + M1–M9 |
| 11 | **Threshold Draft** | Outline of the Year Codex; the person confirms 3 defining moments | M11 logs + M1–M10 |
| 12 | **YEAR CODEX** | 12 lines (one per chapter) + 1 closing paragraph + 1 **Year Line** | only the 12 chapters |

The story literally gets longer, denser and more *specific* each month.
That growth **is** the tangibility: in Month 1 the system can say one sentence about
you; in Month 12 it can say a page — and the Year Line, a single sentence that
holds all twelve.

---

## 4. THE TWELVE CHAPTERS — DETAIL

Each chapter is specified in the same 7 fields:
**UI state · New surface · Signal focus · Memory deliverable · Affirmation · Badge · Seal ritual.**

---

### QUARTER I — FOUNDATION

#### M1 · FIRST LIGHT `·`

| Field | Spec |
|-------|------|
| **UI state** | Barebone. Single column, density `breathable`, evolution opacity 0.85. Visible: Time, Memory (1 question/day), Self-care, Log. Nothing else. |
| **New surface** | **Usership Month widget** — `Month 1:` · `Day 4 of 30` · rail `·□□□□□□□□□□□`. |
| **Signal focus** | Just arrive. First journal entry, first morning check-in, first self-care tap. |
| **Memory deliverable** | **First Line.** One sentence. *"Begins mornings with tea and quiet; reaches for rest before ambition."* |
| **Affirmation** | `The first month. The system is beginning to know you.` |
| **Badge** | `usership_m1` — **Initiated** `·` |
| **Seal ritual** | Day 30: Month widget turns into the chapter card; the First Line fades in (1400 ms). Tap → `Noted.` |

#### M2 · RHYTHM `··`

| Field | Spec |
|-------|------|
| **UI state** | Still single column. Morning check-in gains a **streak line** (`Mornings: 17`). |
| **New surface** | **Planner** + morning intention (`plan_set`) — the morning check-in becomes a 2-step ritual: *feel → intend*. |
| **Signal focus** | Morning consistency. |
| **Memory deliverable** | **The Rhythm** — 2 sentences; the second one must reference a time-of-day pattern. |
| **Affirmation** | `Two months in. Patterns are starting to form.` |
| **Badge** | `usership_m2` — **Rhythm** `··` |
| **Seal ritual** | Chapter card shows two lines: M1 line (dimmed 30%) above M2 lines. The shelf begins. |

#### M3 · RITUAL `∘`  — *Quarter Portrait I*

| Field | Spec |
|-------|------|
| **UI state** | Density `comfortable`. Opacity 0.88. First theme customisation (Custom Themes, existing Level-5 gate). |
| **New surface** | **Memory Chapter widget** (see §5.2) — the paragraph from last month lives on the System tab. **Pattern Insights** widget. |
| **Signal focus** | Self-care becomes routine: the AI starts *proposing* self-care at the moment it is usually tapped. |
| **Memory deliverable** | **Quarter Portrait I** — first full paragraph. First time the person reads a paragraph about themselves. |
| **Affirmation** | `Three months. You have reached Active User status.` |
| **Badge** | `usership_m3` — **Ritual** `∘` · plus `usership_q1` **Foundation Quarter** if all 3 months Full-sealed. |
| **Seal ritual** | Quarter close: the three chapters stack into a **Quarter Card** on the profile. OS version line moves to `v1.0 Active`. |

---

### QUARTER II — RHYTHM → REFLECTION

#### M4 · THE PORTRAIT `∘·`

| Field | Spec |
|-------|------|
| **UI state** | Memory questions now reference journal content (journal → question loop visible). |
| **New surface** | **Intentions** widget + Intention History. |
| **Signal focus** | Journal depth — entries over 150 words are counted separately (`deep entries`). |
| **Memory deliverable** | Chapter IV + **"One thing changed"** line: the AI names a single measurable shift since M1. *"Mornings moved 40 minutes earlier since March."* |
| **Affirmation** | `Four months. The portrait deepens.` |
| **Badge** | `usership_m4` — **Portrait** `∘·` |

#### M5 · CONSISTENCY `∘∘`

| Field | Spec |
|-------|------|
| **UI state** | Density `compact` offered (opt-in). Opacity 0.90. |
| **New surface** | **Mood Patterns** + personalised **Self-care routine** (RecipeWidget / SelfCareMoments draw from the person's own top-3 self-care acts). |
| **Signal focus** | The weakest of the four signals — the AI nudges the one the person uses least. |
| **Memory deliverable** | Chapter V — must cite one journal sentence verbatim (quoted, short). The person sees their own words inside the machine's story. |
| **Affirmation** | `Five months. Consistency is its own reward.` |
| **Badge** | `usership_m5` — **Consistency** `∘∘` |

#### M6 · THE MIRROR `◐`  — *Half-Year*

| Field | Spec |
|-------|------|
| **UI state** | First **Narrative** surface. Opacity 0.92. Subtle evolved glow on the chapter rail. |
| **New surface** | **The Mirror** — side-by-side: M1 First Line ↔ M6 paragraph. Memory Story becomes shareable on the public profile (`showMemoryStory`). |
| **Signal focus** | Reflection. One special Memory question: *"Which of these two sounds more like you now?"* |
| **Memory deliverable** | 2 paragraphs + a **contrast line**: *"In March: rest before ambition. In August: ambition, held by rest."* |
| **Affirmation** | `Six months. The journey is half-declared.` |
| **Badge** | `usership_m6` — **Mirror** `◐` · `usership_h1` **Half-Year** |
| **Seal ritual** | Half-year card: 6 glyphs `· ·· ∘ ∘· ∘∘ ◐` + both paragraphs. Shared to profile only if the person taps *Share*. |

---

### QUARTER III — DEPTH

#### M7 · THE LISTENING `◐·`

| Field | Spec |
|-------|------|
| **UI state** | The system starts answering back. |
| **New surface** | **QI terminal** (`/qi` RFI) — the person may now ask the system about their own record. INTSUM format. |
| **Signal focus** | Questions the person asks are now signal too (`qi_rfi`). |
| **Memory deliverable** | Chapter VII — includes one sentence about *what the person asked the machine*. |
| **Affirmation** | `Seven months in. The system has been listening.` |
| **Badge** | `usership_m7` — **Listening** `◐·` |

#### M8 · RARE AIR `◐∘`

| Field | Spec |
|-------|------|
| **UI state** | Density `dense` offered. Opacity 0.94. |
| **New surface** | **Archetype revealed** (e.g. *The Strategist* on machiavelli) + **Cohort Connect**. |
| **Signal focus** | Connection — first outreach / cohort signal. |
| **Memory deliverable** | Chapter VIII + **archetype sentence** with its 1-line description. |
| **Affirmation** | `Eight months. Rare air.` |
| **Badge** | `usership_m8` — **Rare Air** `◐∘` |

#### M9 · HABIT `◕`  — *Quarter Portrait III*

| Field | Spec |
|-------|------|
| **UI state** | Psychological profile **version number** appears (`v.84` → grows with answers, like machiavelli `v.531`). |
| **New surface** | **Core values** (5) + **Emotional patterns** (3) on the profile — machiavelli fields `coreValues`, `emotionalPatterns`. |
| **Signal focus** | Self-care auto-scheduled into the Planner at the person's own peak hours. |
| **Memory deliverable** | Quarter Portrait III — ~100 words + 3 core values named in the text. |
| **Affirmation** | `Nine months. The self-care practice is a habit now.` |
| **Badge** | `usership_m9` — **Habit** `◕` |

---

### QUARTER IV — LOT® AI

#### M10 · ARCHITECTURE `◕·`

| Field | Spec |
|-------|------|
| **UI state** | Density `instrument` offered. Opacity 0.96. Badge-theme aesthetic (Water / Architecture) fully applied. |
| **New surface** | **System Progress / QOS kernel** + **Correlated Indexes** (self-awareness, user score, person score, longevity). **Pattern strength** list (machiavelli `patternStrength`). |
| **Signal focus** | The whole system. |
| **Memory deliverable** | Chapter X + top-5 pattern strength list rendered as instrument rows. |
| **Affirmation** | `Ten months. Almost there.` |
| **Badge** | `usership_m10` — **Architecture** `◕·` |

#### M11 · THRESHOLD `◕∘`

| Field | Spec |
|-------|------|
| **UI state** | A quiet countdown: `30 days to LOT® AI`. |
| **New surface** | **Year Codex draft** — the AI proposes the 12 chapter lines and asks the person, via three Memory questions, to confirm **3 defining moments** of the year. The person co-authors the ending. |
| **Signal focus** | Reflection over the full year. |
| **Memory deliverable** | **Threshold Draft** (outline, editable by confirmation taps, never free-text editing of AI prose). |
| **Affirmation** | `Eleven months. One more.` |
| **Badge** | `usership_m11` — **Threshold** `◕∘` |

#### M12 · LOT® AI `◉`

| Field | Spec |
|-------|------|
| **UI state** | Opacity 1.0. Full evolved typography. The OS now reads as LOT® AI: Memory questions are fewer and sharper (compression loop at peak). |
| **New surface** | **Year Codex** + the full machiavelli-class profile: archetype, core values, emotional patterns, self-awareness %, cohort, pattern strength, correlated indexes, QR code, Usership board profile. |
| **Signal focus** | — the year is sealed. |
| **Memory deliverable** | **YEAR CODEX** — 12 lines (one per chapter, with glyph) + closing paragraph + **Year Line**. Exportable (`/api/story` export targets already in LOT® AI brief). |
| **Affirmation** | `One year with LOT. The portrait is complete — and still evolving.` |
| **Badge** | `usership_m12` — **LOT® AI** `◉` · plus `usership_year` **Usership Year** (all 12 sealed) and `usership_full_year` **Unbroken** (all 12 Full-sealed). |
| **Seal ritual** | Year Rail fills: `· ·· ∘ ∘· ∘∘ ◐ ◐· ◐∘ ◕ ◕· ◕∘ ◉`. The Year Line fades in alone, centred, for 4 s before the full Codex. |

---

## 5. NEW WIDGETS FOR USERSHIP

All widgets: `Block` component, label with colon (`Month 4:`), no emojis, 1400 ms fade-in,
tap-to-dismiss with existing `DISMISS_PHRASES`.

### 5.1 Usership Month widget (evolution of `MonthlyPulseWidget.tsx`)

```
Month 4:
Four months. The portrait deepens.

·  ··  ∘  ∘·  □  □  □  □  □  □  □  □
Months unlocked 4/12
```

- Shows on the **first 3 days of each Usership month** (anniversary, not calendar).
- Rail: sealed months as glyphs, Quiet chapters as dimmed glyphs (opacity 0.4), future as `□`.

### 5.2 Memory Chapter widget — "Last month, compressed"

```
Chapter III:
Mornings start before seven now. Tea, a short walk, then the
planner — in that order, 22 of 30 days. The journal turned from
lists to sentences in the second week. Rest is no longer the
thing that happens when everything else is done.

Journal 9 · Mornings 22 · Self-care 41 · Answers 31
```

- The paragraph-long insight from last month (what the brief asked for).
- Tap cycles backwards through the shelf: III → II → I.
- Footer = instrument row (cockpit rule): raw counts only.

### 5.3 Months Unlocked widget — context-based progress

```
Months unlocked: 7/12
Next surface — Archetype
Journal     55/65
Mornings   104/120  ■
Self-care  188/200
Answers    231/230  ■
```

- Context-based: appears only when one signal is **within 15%** of the next surface
  threshold, so it reads as an invitation, never a dashboard of debt.
- `■` marks a met threshold.

### 5.4 Year Codex widget (M12 only, then permanent on profile)

```
Year Codex:
·   Begins mornings with tea and quiet.
··  The morning became a rule, not a mood.
∘   ...
◉   Built a year out of small things done every day.

Year Line: Rest became the method, not the reward.
```

---

## 6. MEMORY STORY DELIVERY — THE 12-MONTH TANGIBILITY ENGINE

This is the core of the brief: **how the compressed Memory story is delivered so that it
is felt every single month.**

### 6.1 The four delivery moments per month

| When | Where | What |
|------|-------|------|
| Day 1 of new month | System tab — Usership Month widget | Affirmation + rail + "Chapter N sealed" |
| Day 1–7 | System tab — Memory Chapter widget | Paragraph from last month |
| Day 1 | Email (existing `monthly-summary.ts` → `generateMonthlyEmailHtml`) | Chapter text + counts + OS version line |
| Always | Public profile `/u/user` | Year Rail + latest chapter (if `showMemoryStory`) |

### 6.2 Compression pipeline (server)

```
ANNIVERSARY JOB (daily 04:00 local, scheduled-jobs.ts)
  └─ for each Usership user whose usership month just rolled over:
       1. WINDOW   logs where createdAt in [monthStart, monthEnd)
       2. COUNT    journal · answers · morning check-ins · self-care
       3. SEAL     FULL | QUIET  (thresholds §2)
       4. PROMPT   raw month logs (journal excerpts, answers, self-care acts,
                   check-in moods) + previous chapter texts 1..N-1
                   + length budget from compression ladder (§3)
       5. GENERATE chapter text + affirmation (fallback: static MONTH_MESSAGES)
       6. STORE    metadata.usership.chapters[N] + Log event `usership_chapter`
       7. AWARD    usership_mN badge (+ quarter/half/year badges)
       8. NOTIFY   SSE `usership_chapter_sealed` → client shows widgets
```

### 6.3 Prompt rules for chapter text

1. Third person, present tense, no name, no emojis, no superlatives.
2. Must contain **at least one concrete detail** (a time, a drink, a place, a number).
3. Must reference **one change** from the previous chapter (from M2 onward).
4. Must not invent facts not present in logs or previous chapters.
5. Quiet chapters are written *kindly and short*: *"A quiet month. Three mornings, one
   long entry about the move. The system kept the thread."*
6. The Year Codex prompt receives **only** the 12 chapter texts — never raw logs.
   That is what makes it a compression, not a summary.

### 6.4 Data shape

```ts
// user.metadata.usership
{
  startedAt: '2026-11-11T00:00:00Z',     // NEW — paid-tier start, not joinedAt
  chapters: [
    {
      month: 1,
      seal: 'full' | 'quiet',
      sealedAt: '2026-12-11T04:00:00Z',
      counts: { journal: 6, answers: 24, morning: 19, selfcare: 33 },
      story: 'Begins mornings with tea and quiet; ...',
      affirmation: 'The first month. The system is beginning to know you.',
      badge: 'usership_m1',
      glyph: '·',
    },
    // ... up to 12
  ],
  codex: { lines: string[12], closing: string, yearLine: string } | null,
}
```

Log event (cockpit rule):

```
CHAP: III
SEAL      FULL
JOURNAL   9
MORNINGS  22
SELFCARE  41
ANSWERS   31
OS        v1.0
```

---

## 7. MAPPING TO THE MACHIAVELLI DEMO (12-MONTH END STATE)

`/u/machiavelli` (served from `src/server/routes/public-api.ts`) is the evolved reference.
Its numbers are legendary-scale (2847 answers, 1469 journal entries, 842 active days);
a real Month-12 account reaches the **same surfaces** with year-1 numbers.

| Machiavelli surface | Field | Unlocks at |
|---------------------|-------|-----------:|
| Memory Story paragraph | `memoryStory` | M3 (paragraph), M6 (shareable) |
| Archetype + description | `psychologicalProfile.archetype` | M8 |
| Profile version | `psychologicalProfile.version` | M9 |
| Core values / emotional patterns | `coreValues`, `emotionalPatterns` | M9 |
| Self-awareness level | `selfAwarenessLevel` | M10 |
| Pattern strength list | `patternStrength` | M10 |
| Correlated indexes | `correlatedIndexes` | M10 |
| Behavioral cohort | `behavioralCohort` | M8 |
| QR code (Usership + assembly gate) | PublicProfile QR | M12 |
| Board profile — activity counts | `boardProfile.activity` | M1 (counts grow monthly) |
| Weather Station, Wallet | `weatherStation`, `wallet` | **Year 2 — Legacy tier** |
| Tags `Usership`, `Legacy` | `tags` | Usership M1 · Legacy at Year 2 |

**Recommendation:** add a `usership` block to the machiavelli demo payload with all 12
sealed chapters + a Year Codex, so the demo *shows* the 12-month story, not just the end state.

---

## 8. GAPS FOUND IN THE CURRENT CODE (this session's scan)

| # | Gap | File | Impact | Fix |
|---|-----|------|--------|-----|
| G1 | No Usership start date. `MonthlyPulseWidget` counts months from `user.joinedAt`. | `src/client/components/MonthlyPulseWidget.tsx:74` | A free user who upgrades after 9 months sees "Month 9" on paid day 1. The story starts in the middle. | Add `metadata.usership.startedAt`, set when the `Usership` tag is added (admin-api / payment webhook). Fall back to `joinedAt` only if absent. |
| G2 | Pulse dismissal stored in `localStorage`. | same file, `storageKey()` | Re-appears on every other device. | Store dismissal server-side; SSE sync (CROSS-DEVICE-SYNC doctrine). |
| G3 | `generateMemoryStory()` reads only `answer` logs, max 30. | `src/server/utils/memory.ts:873` | Journal entries and self-care — the two signals the brief values most — never reach the story. | Chapter generator must include `note`/`journal` excerpts, `self_care`, morning `emotional_checkin`. |
| G4 | Monthly summary is calendar-month (days 1–3). | `src/server/utils/monthly-summary.ts:70` | Not aligned to the person's own Usership month. | Anniversary job (§6.2). Keep calendar email for free tier. |
| G5 | Month messages cap at 12 with no Year-2 path. | `MonthlyPulseWidget.tsx` | After Month 12 the story stops. | Year 2 = Legacy tier; chapters continue as Volume II with the Year Line as its preface. |
| G6 | `usership_chapter` event does not exist. | `src/server/routes/api.ts:1084` displayableEvents | Must be whitelisted or it will be written but never shown. | Add on implementation (Backend Whitelist Hygiene). |

---

## 9. IMPLEMENTATION PHASES

| Phase | Scope | Files |
|-------|-------|-------|
| **P0 — Clock** | `usership.startedAt`; Usership month helper `getUsershipMonth(user)` shared by client + server | `src/shared/utils`, `src/server/models/user.ts`, `admin-api.ts` |
| **P1 — Month widget** | Evolve `MonthlyPulseWidget` → rail + `Months unlocked N/12`; server-side dismissal | `MonthlyPulseWidget.tsx`, `api.ts` |
| **P2 — Chapter engine** | Anniversary job, seal logic, chapter prompt, `usership_chapter` log event | `scheduled-jobs.ts`, new `src/server/utils/usership-chapters.ts`, `api.ts` |
| **P3 — Memory Chapter widget + Months Unlocked widget** | Shelf, instrument footer, context-based visibility | new components; `System.tsx` |
| **P4 — Badges** | `usership_m1…m12`, `usership_q1`, `usership_h1`, `usership_year`, `usership_full_year` | `src/client/utils/badges.ts`, `docs/badges/` |
| **P5 — Surface gates** | Map §4 "New surface" rows onto `$featureUnlocks` with the two-clock rule | `src/client/stores/evolution.ts`, `interfaceEvolution.ts` |
| **P6 — Profile + demo** | Year Rail + latest chapter on `/u/user`; full 12-chapter story on machiavelli | `PublicProfile.tsx`, `public-api.ts` |
| **P7 — Year Codex** | M11 draft questions, M12 codex, export | `memory.ts`, story API |

Each phase is one ship (SHIP MODE: one feature per ship, green gate before push).

---

## 10. OPEN QUESTIONS FOR S-2

1. **Quiet chapters on the public profile** — show dimmed glyph, or hide until Full? (Recommendation: dimmed glyph. Honesty reads as strength.)
2. **Paused subscription** — does the month clock pause? (Recommendation: yes; chapter resumes, gap noted as "Interval" line in the Codex.)
3. **Affirmation source** — static `MONTH_MESSAGES` only, or AI-personalised with static fallback? (Recommendation: static line as title, AI adds one personal sentence below.)
4. **Year 2** — Legacy tier with Weather Station + Wallet as on machiavelli, Volume II chapters?

---

*Twelve months. Twelve chapters. One line that holds them all.*
