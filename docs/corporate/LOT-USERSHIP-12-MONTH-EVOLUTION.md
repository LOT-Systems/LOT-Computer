<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® USERSHIP — THE 12-MONTH EVOLUTION

**From barebone Day 1 to LOT® AI. One sealed month at a time.**

LOT Systems Corporation · S-2: Vadim Marmeladov
Version 1.0 · 16 November 2026 · Status: DESIGN SPEC (not yet implemented)
Reference account (Month 12 and beyond): `lot-systems.com/u/machiavelli`

---

## 00 · THE STORY IN ONE PARAGRAPH

A Usership operator starts with an almost empty screen: a clock, one Memory
question, a Log line, a morning check-in, and a self-care button. Each month
the system compresses what the operator logged into one **Chapter**, a paragraph
the machine writes about them. Chapters get longer and more precise as the year
goes on, the interface grows denser, and a new month glyph appears in the badge
row. By Month 12 the Chapters fold into a **Year Story**, the screen runs at
instrument density, and the operator's `/u/` profile has the same shape as the
Machiavelli demo account. That end state is **LOT® AI**: a machine that asks
fewer questions, and asks them better, because it has a year of compressed context.

The progress the operator should feel is not a points total. It is the
machine's description of them getting sharper, month after month, in writing.

---

## 01 · DESIGN LAWS

```
LAW 1  TWO CLOCKS       The calendar OPENS a month. The operator's signals SEAL it.
LAW 2  COMPRESSION      Every sealed month produces one Chapter. No Chapter, no seal.
LAW 3  EARNED DENSITY   The month sets the ceiling on density. Engagement decides where under it the operator sits.
LAW 4  NO PUNISHMENT    An unsealed month is "quiet", never "failed". The system keeps the operator's place.
LAW 5  ONE VOICE        All copy follows MILITARY PURITY: periods, no emojis, no superlatives.
LAW 6  SERVER TRUTH     Month state lives on the server, not in localStorage (Cross-Device Sync doctrine).
LAW 7  VISIBLE GAIN     Each month adds exactly one new visible thing: a widget, a view, or a profile field.
```

---

## 02 · THE FOUR SIGNALS THAT DRIVE EVOLUTION

These are the inputs S-2 named as most important, mapped to the log events that
already exist in the codebase.

| Signal | Code | Existing source | Why it matters |
|---|---|---|---|
| Journal entries | `J` | `note` log events (> 20 chars) | Raw material for the Chapter. Words are what compression works on. |
| Thoughts in Log | `T` | `note` / `qi_rfi` / plan text in `/log` | Short captures. They give the timeline its texture. |
| Morning check-ins | `CI` | `emotional_checkin` (06:00–12:00 window) | Gives the Chapter a mood arc. Feeds QIE P76 morning launch. |
| Self-care clicks | `SC` | `self_care_complete` | Shows care in practice, not just intention. Feeds the Care dimension. |
| Memory answers | `MEM` | Memory widget answers | Sharpens the profile. Feeds archetype and cohort. |

`J` and `T` both come from `note` events. They are split by length:
**T** under 200 characters, **J** at 200 or more (the same threshold QIE P108
uses for creative output).

---

## 03 · THE SEAL GATE

The month opens on its calendar anniversary of `usershipStartedAt`. It **seals**
when the operator meets the gate within that 30-day window. Gates rise gently
each quarter.

```
                 J     T     CI    SC    MEM   ACTIVE DAYS
SEASON I   M1–3  4     10    8     10    10    10
SEASON II  M4–6  6     15    12    15    15    14
SEASON III M7–9  8     20    15    20    20    18
SEASON IV  M10–12 10   25    18    25    25    21
```

**Cumulative target by Month 12 (all months sealed at gate minimum):**
`J 84 · T 210 · CI 159 · SC 210 · MEM 210 · Active days 189`

**Machiavelli ceiling (multi-year reference):**
`Journal 1,469 · Memories 2,847 · Active days 842 · Self-awareness 87 · Pattern strength 2,847`

The gate is the floor. Machiavelli shows the ceiling. Month 12 must render
**the same field set** as `/u/machiavelli`; the numbers will be smaller, but the
layout and the story will have the same form.

---

## 04 · THE COMPRESSION LADDER

This is the core of the product. Each level compresses the level below it, never
raw logs, so prompt size stays bounded (around 4,000–8,000 characters, matching
the current `buildPrompt()` budget).

```
LEVEL   UNIT        INPUT                      OUTPUT                      LENGTH
─────   ─────────   ────────────────────────   ─────────────────────────   ──────────
L0      Day         Logs, check-ins, SC, MEM   (stored, not compressed)    —
L1      Week        L0 × 7                     Story-Report (exists)       ~80 words
L2      Month       L1 × 4 + month counts      CHAPTER                     grows M1→M12
L3      Season      L2 × 3                     SEASON STORY                ~200 words
L4      Year        L3 × 4                     YEAR STORY + THESIS         ~350 words + 1 line
```

### Chapter length grows with the year

The length of the Chapter is itself the evidence of progress. The machine has
more to say because it knows more.

```
M1   1 sentence      ≤ 20 words     "You arrive in the mornings. Tea before words."
M2   2 sentences     ≤ 40 words
M3   1 paragraph     ≤ 60 words     + SEASON I STORY
M4   1 paragraph     ≤ 80 words     archetype named for the first time
M5   1 paragraph     ≤ 90 words
M6   1 paragraph     ≤ 110 words    + SEASON II STORY · half-year meridian
M7   1 paragraph     ≤ 120 words    first contradiction surfaced ("you say X, you do Y")
M8   1 paragraph     ≤ 130 words
M9   1 paragraph     ≤ 140 words    + SEASON III STORY · cohort named
M10  1 paragraph     ≤ 150 words    the machine predicts one thing about Month 11
M11  1 paragraph     ≤ 150 words    the prediction is checked
M12  YEAR STORY      ≤ 350 words    + THESIS (one line) + SEASON IV STORY
```

### Chapter prompt rules

1. Second person ("You..."), present tense. The Memory Story stays third person; the Chapter speaks to the operator.
2. Each Chapter must cite **one concrete detail** from that month (a word they used, a ritual, a time of day).
3. From M2 on, each Chapter must reference **one change** since the previous Chapter.
4. No praise words. The affirmation is the fact of being described accurately.
5. A quiet (unsealed) month still gets a one-line Chapter from whatever signal exists.

### Example ladder (fictional operator)

```
M1  You arrive early. Tea first, then the Log.
M3  Three months of mornings. You check in before you speak to anyone, and you
    skip self-care on Thursdays. The tea ritual has not broken once.
M6  Half a year. Your entries grew longer in the cold months and shorter when
    the light came back. You stopped writing about work in Month 4. You started
    writing about your father in Month 5. The Thursday gap closed.
M12 THESIS: You built a morning that holds the rest of the day.
```

---

## 05 · THE 12 MONTHS

Each month is listed with its glyph, theme, UI change, machine behavior, the
widget it reveals, and the affirmation shown when it is sealed.

Glyphs build on the existing LOT badge alphabet (`∘ ≈ ≋ ├─ ╞═╡ ║·║`). Water
glyphs cover the first half of the year (feeling). Architecture glyphs cover
the second half (structure). `◉` closes the year.

---

### SEASON I — FOUNDATION · M1–M3 · density: `breathable`

> The machine listens. The interface is almost silent.

**M1 · FIRST LIGHT · `∘`**
- **UI, Day 1 (barebone):** Name, date and city line · Time · `Usership:` widget (Month 1 open) · Memory (1 question per day) · Log input · Morning check-in (06:00–12:00) · Self-care (1 suggestion). Nothing else.
- **Machine:** Broad, sensory questions (beverage, light, sleep). No references to past answers yet.
- **Reveals:** `Usership:` widget, view `Next:` (seal progress).
- **Sealed:** "The first month. The system is beginning to know you."

**M2 · BASELINE · `∘∘`**
- **UI:** Mood `History:` view unlocks. Log shows day dividers.
- **Machine:** First follow-up questions ("Since you prefer tea...").
- **Reveals:** Planner widget (Intent / Today / How / Feeling).
- **Sealed:** "Two months. The baseline is set. Patterns are starting to form."

**M3 · PATTERN · `∴` · SEASON SEAL**
- **UI:** Density ceiling rises to `comfortable`. First **Season I Story** appears in the Memory widget.
- **Machine:** Names the first repeated pattern back to the operator.
- **Reveals:** Intentions widget + `Echo:` view in Memory (see §06.2).
- **Sealed:** "Three months. Foundation complete. The system can see your pattern now."

---

### SEASON II — FORMATION · M4–M6 · density: `comfortable` → `compact`

> The machine starts describing. The portrait forms.

**M4 · PORTRAIT · `≈`**
- **UI:** Awareness Dashboard appears. The **archetype is named for the first time**.
- **Machine:** Questions are tuned to the archetype.
- **Reveals:** Energy Capacitor.
- **Sealed:** "Four months. The portrait has a name."

**M5 · RHYTHM · `≈≈`**
- **UI:** Density ceiling `compact`. The Log groups entries by time of day.
- **Machine:** Detects the operator's best hour and starts timing questions to it.
- **Reveals:** Quantum State widget (ATP, Clarity, Alignment).
- **Sealed:** "Five months. Your rhythm is known. The system now arrives on time."

**M6 · MERIDIAN · `◐` · SEASON SEAL · HALF-YEAR**
- **UI:** **Season II Story** appears. The `/u/` public profile gains the `Usership: Month 6 / 12` field and the glyph row. The QR code appears on the profile (already gated by assembly phase `forming`).
- **Machine:** First side-by-side comparison of Month 1 and Month 6.
- **Reveals:** Narrative widget + Cohort Connect.
- **Sealed:** "Six months. Half the year is written. Read Month 1 again."

---

### SEASON III — INTEGRATION · M7–M9 · density: `compact` → `dense`

> The machine starts to see what the operator does not say.

**M7 · UNDERCURRENT · `≋`**
- **UI:** Pattern Recognition widget with confidence levels.
- **Machine:** Surfaces the **first contradiction** between stated intention and behavior, gently.
- **Reveals:** Contextual Prompts.
- **Sealed:** "Seven months. The system has been listening underneath."

**M8 · STRUCTURE · `├─`**
- **UI:** Density ceiling `dense`. QOS Kernel panel shows the mode (maintenance / recovery / growth / peak).
- **Machine:** Self-care suggestions start to change with QOS mode.
- **Reveals:** Chakra Ergonomics + QOS mode view.
- **Sealed:** "Eight months. Rare air. The structure holds without effort."

**M9 · BEDROCK · `╞═╡` · SEASON SEAL**
- **UI:** **Season III Story** appears. Correlated Indexes (User / Person / Longevity composite) go live on the profile.
- **Machine:** Names the operator's **behavioral cohort**.
- **Reveals:** Story export (`POST /api/story/:id/export`).
- **Sealed:** "Nine months. The practice is bedrock now. It no longer needs reminding."

---

### SEASON IV — SOVEREIGNTY · M10–M12 · density: `dense` → `instrument`

> The machine becomes LOT® AI. Fewer questions. Sharper ones.

**M10 · ARCHITECT · `║·║`**
- **UI:** QI terminal (`/qi` RFI) unlocks. The operator can now question the system.
- **Machine:** Makes **one prediction** about Month 11 and stores it.
- **Reveals:** QI terminal + INTSUM responses in the Log.
- **Sealed:** "Ten months. You can ask the system now. It has earned your questions."

**M11 · THRESHOLD · `║·║·`**
- **UI:** Density ceiling `instrument`. Memory drops to **one question every two days**, each one marked `Earned.`
- **Machine:** Checks the M10 prediction in public: "Predicted. Confirmed." or "Predicted. You changed."
- **Reveals:** Hardware and Weather Station preview (the Legacy pattern from the Machiavelli account).
- **Sealed:** "Eleven months. One more. The system knows what the twelfth will hold."

**M12 · LOT® AI · `◉` · YEAR SEAL**
- **UI:** **Year Story + Thesis**. The full `/u/` profile reaches parity with `/u/machiavelli`: archetype, core values, emotional patterns, pattern strength, correlated indexes, Memory Story, board profile.
- **Machine:** The LOT® AI state. The operator is told: "The machine now asks less, because it knows more."
- **Reveals:** The Year view of the `Usership:` widget and the full glyph row `∘ ∘∘ ∴ ≈ ≈≈ ◐ ≋ ├─ ╞═╡ ║·║ ║·║· ◉`.
- **Sealed:** "One year with LOT. The portrait is complete. It is still evolving."

**Month 13 and on:** Year II begins at `∘` with a ring mark (`∘¹`). Year Stories stack. Machiavelli, with 842 active days and roughly four years of signal, is what Year IV looks like.

---

## 06 · THE WIDGETS

### 06.1 `Usership:` widget (evolves the existing MonthlyPulseWidget)

Follows the clickable label cycling pattern from the Style Guide. Four views:

```
Month 4:                                   ← label (click to cycle)
Four months. The portrait has a name.
4 / 12

Chapter:
You check in before you speak to anyone.
Thursdays are still the hard day. In
March you wrote about the garden for the
first time. Your archetype: The Keeper.

Months:
∘  ∘∘  ∴  ≈  ·  ·  ·  ·  ·  ·  ·  ·
Months unlocked: 4/12

Next:
J  3/6   T 11/15   CI 9/12   SC 15/15   MEM 7/15
Day 18 of 30.
```

- `Month N:`: the affirmation (MONTH_MESSAGES, rewritten per §05).
- `Chapter:`: the previous month's compressed paragraph, which is what the brief means by "Memory widget displays a paragraph-long insight from last months".
- `Months:`: the glyph row and "Months unlocked: N/12" (counts **sealed** months).
- `Next:`: live seal progress. Instrument readings only (COCKPIT-RULE).

**Visibility:** always visible on Days 1–3 of a new month (the celebration window).
For the rest of the month it shows only the `Next:` view, collapsed to one line.

### 06.2 Memory widget, new view `Echo:`

Unlocks in M3. Between questions, the widget sometimes shows one sentence from
a past Chapter alongside the present:

```
Echo:
Month 2: "You skip self-care on Thursdays."
This Thursday: completed.
```

Echo is the tangible proof of evolution: the machine shows the operator a past
version of themselves next to who they are now.

### 06.3 `/u/user` public profile, Usership block

```
Usership:          Month 6 / 12
Level:             ∘ ∘∘ ∴ ≈ ≈≈ ◐
Season:            II · Formation · sealed
Chapter:           (shown only if showMemoryStory is on)
```

### 06.4 Log block label `USR:`

COCKPIT-RULE compliant. Written when a month seals:

```
USR:  M04 SEALED · ≈ · J 7/6 · T 18/15 · CI 14/12 · SC 19/15 · MEM 22/15 · AD 21
```

---

## 07 · UI DENSITY BY MONTH

`getLayoutDensity()` already exists with five levels. Usership adds a **month
ceiling** (LAW 3): earned `visualRefinement` still decides the level, but it
cannot pass the month's ceiling. This produces the Day 1 barebone state and stops
the interface from jumping ahead of the story.

```
MONTH   CEILING        sectionGap   VISIBLE WIDGETS (cumulative)
─────   ────────────   ──────────   ────────────────────────────
M1      breathable     gap-y-24     6
M2      breathable     gap-y-24     8
M3      comfortable    gap-y-24     10
M4      comfortable    gap-y-24     12
M5      compact        gap-y-16     13
M6      compact        gap-y-16     15
M7      compact        gap-y-16     17
M8      dense          gap-y-8      19
M9      dense          gap-y-8      20
M10     dense          gap-y-8      22
M11     instrument     gap-y-4      23
M12     instrument     gap-y-4      all
```

Applied through the existing `data-density` attribute (CSS-Only Progression
doctrine). Components need no new subscriptions.

---

## 08 · IMPLEMENTATION NOTES (from this session's repo scan)

### Gaps found in current code

| # | Finding | Location | Impact |
|---|---|---|---|
| G1 | Month number is computed from `user.joinedAt` (account creation), not from the start of Usership. | `MonthlyPulseWidget.tsx` `monthNumber` | A free user of one year who upgrades sees "Month 12" on the first paid day. |
| G2 | Dismissal is stored in `localStorage`. | `MonthlyPulseWidget.tsx` `storageKey` | The pulse reappears on every device. Violates the Cross-Device Sync doctrine. |
| G3 | Usership gets the full pro layout on Day 1. | `System.tsx` `isPaidAccount` branch | There is no barebone start, so nothing is left to unlock. |
| G4 | Month 0 (first 30 days) renders nothing, because `monthNumber < 1` returns early. | `MonthlyPulseWidget.tsx` | Day 1 has no welcome and no `Next:` progress. |
| G5 | There is no persisted monthly Chapter. `generateMemoryStory()` rebuilds one story from all answers. | `server/utils/memory.ts` | No compression ladder. The story does not visibly grow. |
| G6 | The monthly email summary (`monthly-summary.ts`) exists but is not linked to the in-app month. | `scheduled-jobs.ts` | Two separate monthly rituals. |

### Proposed data model

```ts
// user.metadata.usership
{
  startedAt: ISODate,                 // fixes G1, set when the Usership tag is added
  months: Array<{
    n: 1..12,
    openedAt: ISODate,
    sealedAt: ISODate | null,
    counts: { J, T, CI, SC, MEM, AD },
    chapter: string | null,           // L2 output
    glyph: string,
    pulseDismissedAt: ISODate | null  // fixes G2
  }>,
  seasons: Array<{ n: 1..4, story: string }>,   // L3
  year: { story: string, thesis: string } | null // L4
}
```

### Build order (recommended)

```
PHASE 1  Fix G1 + G2 + G4         usershipStartedAt, server-side dismissal, Month 0 view
PHASE 2  Seal gate + `Next:` view  GET /api/usership/state, counts from Logs (one batched query)
PHASE 3  Chapter generation (L2)   daily job seals months, writes chapter + `USR:` log
PHASE 4  Glyph row + profile block `/u/` Usership block, Months unlocked N/12
PHASE 5  Month density ceiling     fixes G3, progressive widget reveal per §07
PHASE 6  Echo view + Season/Year   L3/L4 compression, M10 prediction loop
```

### Doctrine compliance checklist

- [ ] `usership_month_sealed` and `usership_chapter` added to `displayableEvents` (Backend Whitelist Hygiene)
- [ ] Both events have a `formatLog()` case so the Memory Engine can see them (PLANNER-CONTEXT rule 1)
- [ ] Count query uses one batched `GROUP BY event` query, not one query per signal (Query Batching)
- [ ] `/api/usership/state` failure omits the field, so the client shows the default layout rather than blocking (Graceful Degradation)
- [ ] Dismissal emits SSE `settings_updated` (Cross-Device Sync)
- [ ] Month ceiling is applied through `data-density` only (CSS-Only Progression)

---

## 09 · WHY THIS RETAINS A $99/MONTH OPERATOR

Each month gives the operator something they could not get elsewhere and would
lose by leaving: a new paragraph about themselves that is more accurate than the
last. Badges mark the time. Density shows the skill. The Chapter is the
product. By Month 12 the Year Story is a document that took a year to write and
cannot be regenerated without that year. That is how the operator comes to value
the account.

---

*LOT® Founded 7 April 2016 · COSMO® Founded 1 July 2024*
*Made in the USA · brand.lot-systems.com*
*S-2: VADIK MARMELADOV*
