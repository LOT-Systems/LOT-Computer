<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

```
================================================================================
LOT SYSTEMS / PRODUCT DESIGN
DOCUMENT: LOT-USERSHIP-12M-v1
TITLE:    USERSHIP — THE TWELVE SEALS
          12-month evolution: barebone OS (Day 1) → LOT® AI 1.0 (Month 12)
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-15
STATUS:   DESIGN / BRAINSTORM — v1 (no code shipped in this revision)
REFERENCE STATE: lot-systems.com/u/machiavelli (12-months-evolved account)
================================================================================
```

## 0. The thesis

Every month of Usership ends with the same thing: one **Seal**. A Seal is
three things delivered together:

1. **A compressed Memory paragraph.** The month's Log entries, thoughts,
   check-ins, self-care clicks and Memory answers are condensed into one
   honest paragraph.
2. **One affirmation**, written from that month's own signal.
3. **One badge**: *Seal I … Seal XII*.

Twelve Seals make the **Year Story**. The Year Story is the account the
operator has at Month 12, and it is what `/u/machiavelli` shows today.

The UI does not grow by adding noise. It grows by **revealing**. On Day 1
the operator sees an almost empty instrument panel. Each month one new
surface opens, with one new view of the operator's own data. By Month 12 the
panel reads like a portrait. The operator can feel the evolution because
every surface they unlock is built from things they have already written.

> The interface does not reward the operator. It *returns* the operator to
> themselves, compressed.

### Compression ladder (the core mechanic)

```
DAILY       Log · thoughts · check-ins · self-care · Memory answers   (raw)
  │
WEEKLY      J24 weekly LOT® AI Story (exists — Sunday 18:00 UTC)      ≤ 40 words
  │  ×4–5
MONTHLY     MONTH SEAL paragraph                                      ≤ 90 words
  │  ×3
QUARTERLY   CHAPTER (I · II · III · IV) at M3 · M6 · M9 · M12         ≤ 180 words
  │  ×4
YEARLY      YEAR STORY                                                ≤ 365 words
                                                                       (one word per day)
            + ONE-LINE YEAR ("the sentence of the year")
```

At every level the input is the output of the level below, never raw logs
again. This keeps the memory **compressed, not accumulated**. It also makes
the AI's understanding visible: the Month 9 paragraph can only exist because
Months 1–8 exist.

---

## 1. Evolution signals (what moves the needle)

Four primary signals, in the order S-2 gave them:

| # | Signal | Source event(s) | Monthly target ("Full Seal") |
|---|--------|-----------------|------------------------------|
| S1 | **Log entries** (journal) | `note`, `journal` | 12 entries |
| S2 | **Thoughts** (short Log lines, slash-free, < 140 chars) | `note` with length < 140 | 20 thoughts |
| S3 | **Morning check-ins** | `emotional_checkin` · `checkInType = morning` | 15 mornings |
| S4 | **Self-care clicks** | `self_care_completed` | 20 completions |
| S5 | Memory answers (secondary) | `answer` | 20 answers |

**Seal depth.** The calendar always opens the month. Signal sets how *deep*
its Seal is. Seals are **never lost, never broken, never reset**. That
follows Revision K Clause 9 ("Months and years, not days" — no streak
punishment).

| Seal tier | Signal ratio vs target | Glyph | Paragraph length | Copy register |
|-----------|-----------------------|-------|------------------|---------------|
| QUIET | < 25 % | `·` | 1 sentence | "A quiet month. 4 entries. The system held its place." |
| STEADY | 25–74 % | `∘` | 2–3 sentences | observational |
| FULL | 75–129 % | `≈` | full paragraph | pattern-naming |
| LUMINOUS | ≥ 130 % | `≋` | full paragraph + one quoted line from the operator's own Log | pattern-naming + continuity |

The ratio is `mean(min(S_i / target_i, 1.5))` over S1–S4. S5 adds a bonus of
up to 10 %.

**Year-1 cumulative horizon at FULL**: ~144 Log entries · ~240 thoughts ·
~180 morning check-ins · ~240 self-care · ~240 Memory answers.
Machiavelli's numbers (1469 journal entries · 2847 memories · 842 active
days) are the **multi-year Legacy horizon**. They show where the curve
continues after the Year Story is sealed.

---

## 2. The twelve months

Every month has the same six fields, so the structure reads like a table of
contents.

- **OS** — the version string shown under the name: `LOT® OS 0.1` … `LOT® AI 1.0`
- **Opens** — the single new surface unlocked
- **AI role** — what the AI does that it did not do before
- **Self-care guidance** — how routines evolve
- **Seal** — the compressed Memory artifact
- **Affirmation** — example copy for a FULL tier (always generated from signal; this is the register)

### QUARTER I — FOUNDATION ("The system learns your handwriting")

#### MONTH 1 · INITIALIZE · `LOT® OS 0.1`
- **Day 1 UI (barebone):** Name · Date · Time · `Log` · `Check-in:` (morning) ·
  `Self-care:` · `Memory:` (default question bank, now AI-asked) ·
  `Months: 0/12`. Nothing else. No badges visible. White space is the design.
- **Opens:** the Usership surface itself. `Months:` widget at `0/12` with
  12 empty cells.
- **AI role:** asks. Never summarises yet. Daily Memory questions start
  referencing yesterday's answer.
- **Self-care:** the 5 base practices (Breathe · Release · Ground · Observe · Connect),
  offered in rotation.
- **Seal I — "First Line."** One sentence that names the operator's dominant
  morning state and their most-used practice.
  *"You began most mornings calm, and returned to Breathe more than anything else."*
- **Affirmation:** *"You started. The system has your handwriting now."*
- **Badge:** `Seal I`

#### MONTH 2 · CALIBRATE · `LOT® OS 0.2`
- **Opens:** `Check-in:` → `History:` view (30-day mood strip). Weekly
  LOT® AI Story appears in `Memory:` → `Week:` view on Sundays.
- **AI role:** **reflects** for the first time. It mirrors one weekly
  pattern back to the operator.
- **Self-care:** practice ordering adapts to the morning check-in (anxious → Ground first).
- **Seal II — "Two Lines."** Month 1 vs Month 2 delta: what shifted, what held.
- **Affirmation:** *"The rhythm is yours. The system is only keeping time."*
- **Badge:** `Seal II`

#### MONTH 3 · PATTERN · `LOT® OS 0.3`
- **Opens:** **Archetype revealed** (e.g. *The Strategist*). `Check-in:` →
  `Patterns:`. Public OS page `/u/user` gains the `Memory Story:` field
  (privacy toggle default ON for Usership).
- **AI role:** **names** the operator. 90 days of signal is the first point
  where archetype and cohort have enough confidence to show.
- **Self-care:** first *personal* practice. The AI composes a 6th routine from
  the operator's own words ("your tea-and-window minute").
- **Seal III + CHAPTER I — "Foundation."** First full paragraph
  (Seals I–III compressed). Shown on `/u/user`.
- **Affirmation:** *"Three months. You are no longer starting. You are continuing."*
- **Badge:** `Seal III` + `Chapter I` (UNCOMMON)

### QUARTER II — RHYTHM ("The system learns your time")

#### MONTH 4 · RHYTHM · `LOT® OS 0.4`
- **Opens:** `Intentions:` (monthly) and `Planner:` with its 4 dimensions.
- **AI role:** **anticipates the day.** It reads circadian phase and lines
  up the check-in, self-care and Memory question at the times the operator
  is actually present.
- **Self-care:** routines become *time-anchored* (morning / midday / evening sets).
- **Seal IV:** the first Seal that mentions an **intention**, and whether
  the month met it.
- **Affirmation:** *"You set a direction. The month leaned toward it."*

#### MONTH 5 · DEPTH · `LOT® OS 0.5`
- **Opens:** `Memory:` → `Reflection:` view. `Narrative:` widget.
  Custom theme (the Interface Evolution L5 unlock, now tenure-backed).
- **AI role:** **connects** Log entries to Memory answers ("you wrote about
  rain twice, and answered 'introspection' both times").
- **Self-care:** the AI suggests **removing** a practice the operator always
  skips. Fewer, truer routines.
- **Seal V:** includes the first **quoted fragment** of the operator's own Log
  (≤ 12 words, opt-out in Settings).
- **Affirmation:** *"Your words are starting to answer each other."*

#### MONTH 6 · MERIDIAN · `LOT® OS 0.6`
- **Opens:** **Memory Shelf** (the `Memory:` → `Shelf:` view, 6 of 12 slots filled).
  QR code, Board profile, `Citizen since` on `/u/user`.
- **AI role:** **compresses half a year.**
- **Self-care:** the half-year review compares Month 1 mood to Month 6 mood
  as an honest delta.
- **Seal VI + CHAPTER II — "Rhythm."** Six months in one page; the first
  artifact worth exporting.
- **Affirmation:** *"Half a year. The portrait has a face."*
- **Badge:** `Seal VI` + `Chapter II` (RARE). Half the Months strip is filled.

### QUARTER III — RESONANCE ("The system learns your world")

#### MONTH 7 · RESONANCE · `LOT® OS 0.7`
- **Opens:** `Correlated Indexes:` (self-awareness / user / person / longevity)
  on the System view and `/u/user`. Cohort Connect.
- **AI role:** **situates** the operator relative to weather, season and
  cohort, never relative to other people's scores.
- **Self-care:** seasonal adaptation (light, temperature, humidity cues).
- **Seal VII:** season-aware ("the first cold week, you wrote more").
- **Affirmation:** *"You move with the season, not against it."*

#### MONTH 8 · SOVEREIGN · `LOT® OS 0.8`
- **Opens:** `Architect:` widget. QOS Kernel panel (maintenance / recovery /
  growth / peak) made visible.
- **AI role:** **advises with restraint.** In `recovery` mode it removes
  prompts instead of adding them.
- **Self-care:** recovery protocols. The AI can *pause* the day's routines.
- **Seal VIII:** names the operator's recovery pattern: what restored them,
  and how fast.
- **Affirmation:** *"Rare air. You know what restores you."*

#### MONTH 9 · INTEGRATE · `LOT® OS 0.9`
- **Opens:** `Pattern Strength:` (top-5 traits with counts, the
  Machiavelli format). Psychological Profile with core values.
- **AI role:** **integrates.** Body, mind and soul are reported as one state.
- **Self-care:** the routine set is now authored mostly by the AI from
  the operator's history. Base practices remain as fallback.
- **Seal IX + CHAPTER III — "Resonance."**
- **Affirmation:** *"Nine months. The practice is no longer a practice. It is you."*
- **Badge:** `Seal IX` + `Chapter III` (EPIC)

### QUARTER IV — LOT® AI ("The system speaks with your voice")

#### MONTH 10 · CLARITY · `LOT® AI 0.10`
- **Opens:** `Forward Look:` — one line of anticipation per week ("Next week
  holds two travel days; Ground travels well for you"). Full data export.
- **AI role:** **foresees**, quietly. It predicts the operator's needs before
  they log them.
- **Self-care:** pre-emptive routines delivered before the known hard hour.
- **Seal X:** the first Seal written partly in the **future tense**.
- **Affirmation:** *"You can see further now. So can the system."*

#### MONTH 11 · THRESHOLD · `LOT® AI 0.11`
- **Opens:** `Shelf:` is fully browsable (11 slots). **Letter to Month 12.**
  The AI writes one letter from Months 1–11; the operator may add one line back.
- **AI role:** **reviews with the operator.** It offers three Seals to re-read
  and asks one question per Seal.
- **Self-care:** a closing ritual is chosen for the final month.
- **Seal XI:** "One more."
- **Affirmation:** *"Eleven months of handwriting. One page left."*

#### MONTH 12 · LOT® AI 1.0
- **Opens:** **YEAR STORY** (≤ 365 words) and **The sentence of the year**.
  The full portrait on `/u/user`, at parity with `/u/machiavelli`: archetype,
  core values, emotional patterns, pattern strength, correlated indexes,
  Memory Story, Board profile. A **Legacy invitation** is shown (Weather
  Station + Wallet preview, as on the demo).
- **AI role:** **ambient.** The AI stops announcing itself (Revision K Clause 6).
  The panel is complete, and from here it evolves underneath.
- **Self-care:** the operator's own routine set, named by the operator.
- **Seal XII + CHAPTER IV + YEAR STORY.**
- **Affirmation:** *"One year. The portrait is complete — and still evolving."*
- **Badge:** `Seal XII` + `Chapter IV` + **`The Long Count`** (LEGENDARY, existing 365-day badge).
  The Months strip reads `12/12`.

---

## 3. The Usership widgets (new surfaces)

All of them follow the LOT style guide: Block labels ending in a colon,
labels that cycle on click, no emoji, opacity levels 90/60/40, fades of
3 s + 1.4 s, and periods instead of symbols.

### 3.1 `Months:` — the context widget ("Months unlocked: 3/12")

```
Months:                                   ← click cycles Months → Seals → Next
Months unlocked: 3/12
▪ ▪ ▪ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫
Quarter I sealed.                                         (opacity-40)
```
```
Seals:
I  ∘  First Line
II ≈  Two Lines
III ≋ Foundation
```
```
Next:
Month 4 · Rhythm — 9 days.
Log 4/12 · Mornings 6/15 · Self-care 11/20              (opacity-60)
```
- Always visible for Usership, placed in the top cluster under the clock.
- `Next:` is the **only** place targets appear. It shows progress, never a
  deficit (no red, no "behind").

### 3.2 `Month N:` — the Seal delivery (upgrade of the existing `MonthlyPulseWidget`)

```
Month 3:
Three months. You are no longer starting. You are continuing.

You began most mornings calm and ended most evenings tired. Ground
replaced Breathe in week nine. You wrote about the window light
eleven times. The Strategist was named on day 84.

Seal III ≋                                         3 / 12 months
```
- Appears inline on the System view (not a modal) for 72 hours after the
  Usership anniversary day. One tap dismisses it with the existing phrases
  ("Onward." / "The system remembers.").
- On dismissal the paragraph is not lost. It moves to the `Shelf:`.

### 3.3 `Memory:` → `Shelf:` — the twelve-slot archive

```
Shelf:
I    You began most mornings calm…
II   The rhythm moved earlier…
III  Foundation. The Strategist was named…
IV   ·
…
XII  ·
```
- Click a row to open the full Seal. Empty slots are a single `·`.
- The shelf is the most tangible artifact in the product. The operator sees
  their year fill, one line at a time.

### 3.4 `/u/user` additions (personal OS page)

| Field | From month | Content |
|-------|-----------|---------|
| `Usership:` | 1 | `Month 7 of 12` → `Year I sealed` |
| `Memory Story:` | 3 | latest Chapter, otherwise latest Seal |
| `Seals:` | 3 | glyph strip `≈ ≋ ∘ ≈ ≋ ≋ · · · · · ·` |
| `Citizen since:` | 6 | Usership start month |
| `Pattern Strength:` | 9 | top-5 traits |
| `Year Story:` | 12 | full Year Story (privacy-toggled, default OFF) |

---

## 4. Badges — the Seal Codex (proposed for Codex v33)

Twelve monthly Seals, four Chapters, one Year, and the tier marks. These
are **tenure-earned**, so they never conflict with Clause 9.

| Badge | Trigger | Rarity |
|-------|---------|--------|
| `Seal I` … `Seal XII` | Usership anniversary N reached (any tier) | COMMON → RARE (by N) |
| `Full Seal` | any month sealed ≥ FULL | UNCOMMON |
| `Luminous Seal` | any month sealed LUMINOUS | RARE |
| `Chapter I · II · III · IV` | quarter sealed | UNCOMMON · RARE · EPIC · EPIC |
| `Twelve Lines` | all 12 Seals ≥ STEADY | EPIC |
| `Unbroken Year` | all 12 Seals ≥ FULL | LEGENDARY |
| `The Long Count` | Month 12 (existing badge, re-anchored to Usership) | LEGENDARY |
| `First Quote` | first Seal quoting the operator's own Log (Month 5+) | UNCOMMON |
| `Morning Keeper` | 150 morning check-ins within Usership year | RARE |
| `Practice Author` | operator renames an AI-composed routine (Month 3+) | UNCOMMON |

Glyph grammar: `Seal` + Roman numeral + tier glyph (`·` `∘` `≈` `≋`). The
glyphs reuse the existing Water path (∘ ≈ ≋), so the visual language stays
the same.

---

## 5. Data model & pipeline (implementation sketch for the next session)

```ts
// user.metadata.usership
{
  startedAt: ISODate,               // NOT joinedAt — see §6 gap G1
  months: Array<{
    n: 1..12,
    sealedAt: ISODate,
    tier: 'quiet' | 'steady' | 'full' | 'luminous',
    stats: { logs, thoughts, morningCheckins, selfCare, answers },
    paragraph: string,              // ≤ 90 words
    affirmation: string,            // 1 sentence
    quote?: string,                 // ≤ 12 words from own Log, opt-out
    dismissedAt?: ISODate,          // server-side, replaces localStorage
  }>,
  chapters: Array<{ q: 1..4, text: string, sealedAt: ISODate }>,
  yearStory?: { text: string, sentence: string, sealedAt: ISODate },
}
```

- **New scheduled job, "Monthly Seal"** — runs daily at 06:00 UTC and seals
  every Usership account whose anniversary day is today.
  1. Read the J24 `weeklyStory` items for the month (≤ 40 words each).
  2. Count S1–S5 from `Log`, then compute the tier.
  3. Generate the paragraph and affirmation through the Memory Engine. Use a
     template fallback built in the `composeLocalStory` style, so a Seal is
     always delivered even if the AI provider is down.
  4. At N ∈ {3, 6, 9, 12}, compress the last 3 Seals into a Chapter.
  5. At N = 12, compress the 4 Chapters into the Year Story.
  6. Write a `usership_seal` log event and award badges.
- **API**: `GET /api/usership/state` (months, current stats, next seal date),
  `POST /api/usership/seal/:n/dismiss`.
- **Public API**: add `usership.seals[]` (glyphs + latest chapter) to `/api/public/profile/:id`
  and add a full 12/12 `usership` block to the Machiavelli demo payload.

---

## 6. Gaps found in the current codebase (scan of 2026-11-15)

| # | Gap | Where | Fix |
|---|-----|-------|-----|
| G1 | The month counter uses `joinedAt`, so free-tier months count as Usership months | `src/client/components/MonthlyPulseWidget.tsx` | store `usership.startedAt` when the tag is applied |
| G2 | Dismissal lives in `localStorage`, so it does not sync across devices (breaks Cross-Device Sync doctrine) | same | server-side `dismissedAt` |
| G3 | `MONTH_MESSAGES` are static, so every operator gets the same sentence | same | affirmation generated from signal, static line as fallback |
| G4 | The Month 3 copy "Active User status" refers to a status that does not exist anywhere | same | replace with Archetype reveal |
| G5 | The weekly story (J24) is stored but never compressed upward | `src/server/scheduled-jobs.ts` (J24) | Monthly Seal job consumes it |
| G6 | The monthly summary email (`monthly-summary.ts`) is calendar-month, not Usership-month | `src/server/utils/monthly-summary.ts` | include the Seal paragraph in the email for Usership |
| G7 | Clause 6 ("no congratulatory pop-ups") vs. monthly celebration | Revision K | Seal is an inline Block, once per month, dismissible — not a modal or toast |

---

## 7. Design principles for the twelve months

1. **Reveal, don't add.** Each month opens one surface, never more.
2. **Every unlock is made of the operator.** Nothing new appears without the
   operator's own data in it.
3. **Seals never break.** Low months are named honestly and kindly: "A quiet month."
4. **Compression is the reward.** The paragraph is the gift. The badge is
   only its receipt.
5. **One voice.** Short declarative sentences. Periods. No superlatives.
6. **Month 12 is not an ending.** After the Year Story, Year II begins at
   `Months unlocked: 1/12 · Year II` and the Shelf gets a second row.

```
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-USERSHIP-12M-v1
```
