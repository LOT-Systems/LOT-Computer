<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP — 12-MONTH EVOLUTION · From Barebone to LOT® AI

```
CLASS      : DESIGN / PRODUCT BLUEPRINT (brainstorm + outline, no code shipped)
S-2        : VADIK MARMELADOV
DATE       : 2026-11-01
SESSION    : LOT-SR-20261101-01
REFERENCE  : lot-systems.com/u/machiavelli  (the "Month 12+" end-state)
FOCUS      : Tangible delivery of the compressed Memory Story, month by month
```

---

## 0. THE IDEA IN ONE SCREEN

A paid Usership account does not start with a finished dashboard. It starts with a
**quiet, barebone screen** and a single question. Every month the account is
alive, the interface visibly **earns** something: a denser layout, a new widget,
a new badge glyph, a longer Memory Story, and a more intimate AI voice.

By Month 12 the person is looking at **LOT® AI**: a dense instrument that has
compressed a year of their journal entries, morning check-ins and self-care
clicks into one page they can read, print and keep.

```
 DAY 1                    MONTH 3                   MONTH 6                    MONTH 12
 ┌──────────────┐         ┌──────────────┐          ┌──────────────┐           ┌──────────────┐
 │ LOT®         │         │ LOT®         │          │ LOT® A       │           │ LOT® AI      │
 │              │         │ ▸ Month 3    │          │ ▸ Month 6    │           │ ▸ Codex      │
 │  one         │         │ ▸ Check-in   │          │ ▸ Check-in   │           │ ▸ 12/12 ████ │
 │  question    │         │ ▸ Self-care  │          │ ▸ Self-care  │           │ ▸ Story      │
 │              │         │ ▸ Memory     │          │ ▸ Memory     │           │ ▸ Patterns   │
 │  [ Log ]     │         │ ▸ Log        │          │ ▸ Patterns   │           │ ▸ Integrity  │
 │              │         │              │          │ ▸ Intent…    │           │ ▸ Cohort …   │
 └──────────────┘         └──────────────┘          └──────────────┘           └──────────────┘
   breathable               comfortable               compact                    instrument
   ∘  Droplet               ≈  Wave                   ≋≋ Voyager                 Year Seal
```

The user should be able to **feel** the difference between any two months without
reading a changelog: spacing, number of widgets, badge glyph, AI sentence length.

---

## 1. WHAT ALREADY EXISTS (repo scan, 2026-11-01)

This blueprint is built on parts that are already in the codebase. Nothing here
requires a rewrite; most of it is wiring and one new server job.

| Existing piece | File | What it gives us |
|---|---|---|
| Month N/12 pulse for Usership | `src/client/components/MonthlyPulseWidget.tsx` | 12 one-line messages, `dayjs.diff(joinedAt,'month')`, per-user dismissal in `localStorage` (`lot_pulse_<id>`), "N / 12 months" caption |
| 5-level layout density | `src/client/utils/interfaceEvolution.ts` | `breathable → comfortable → compact → dense → instrument`, plus 4 story chapters (Awakening/Exploration/Integration/Mastery) |
| Feature unlock flags | same | 14 booleans (advancedMemory, moodPatterns, narrativeReflection, patternInsights, exportData …) |
| Evolution CSS variables | `docs/technical/INTERFACE_EVOLUTION.md` | opacity, grid, glow, letter-spacing, transition speed — all CSS-driven |
| Water / Architecture glyph ladder | `docs/badges/LOT_BADGES_AND_ACHIEVEMENTS.md` | `∘ ≈ ≋` and `├─ ╞═╡ ║·║`, extended milestones day 7 → 180 |
| 812 badges | `docs/badges/…MASTER_CODEX_v32.md` | Milestone, Word-Turn, Behavioral, Mastery, Secret Boss |
| Memory Engine + compression loop | `docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md` | question → answer → trait extraction → sharper question; Together AI primary |
| Memory Story categories | `docs/wiki/LOT-WIKI-v87.md` §9 | BODY · MIND · SOUL · SEASONS · PATTERNS |
| Usership-only transmission | `SystemProgressWidget.tsx` (`USERSHIP_TRANSMISSION`) | proves the gating pattern for Usership-only copy |
| Public Memory Story | `PublicProfile.tsx` + `public-api.ts` (`showMemoryStory`, `memoryStory`) | the surface where the story is shown to others |
| Demo account | `public-api.ts` `userIdOrUsername === 'machiavelli'` | hardcoded "Month 12+" persona (see §2) |

### Gaps this blueprint closes

1. **MonthlyPulse is generic.** It says "Four months. The portrait deepens." to
   everyone, using no data from the person's own month. It never shows a story.
2. **Month is counted from `joinedAt`**, not from when Usership started. A free
   user who upgrades in month 5 would open on "Month 5". Needs a `usershipSince`.
3. **No monthly compression artifact exists.** Memory Story is live-composed, not
   a stored, dated, per-month paragraph.
4. **Density/unlock are driven by badge level, not by month.** Month progress is
   not visible as a *place* anywhere in the UI.
5. **The demo account is static.** Machiavelli shows the end-state but gives a
   visitor no way to see the road. (Solved by the Time-Travel Scrubber, §8.)

---

## 2. THE REFERENCE PERSONA — `/u/machiavelli` AS MONTH-12+

The demo account is the proof of the destination. Its numbers (from
`public-api.ts`) define what "evolved" looks like:

| Signal | Machiavelli value |
|---|---|
| Archetype | The Strategist |
| Journal entries (`noteCount`) | 1,469 |
| Memory answers (`answerCount`) | 2,847 |
| Active days | 842 |
| Streak | 1,469 |
| Self-awareness | 87 |
| Composite correlated index | 92.4, trend ascending |
| Pattern-strength index | 2,847 across 5 traits |
| Cohort | Renaissance Polymaths |
| Unlocks | Weather Station, Wallet (LOT balance + loyalty points), Board profile |
| Memory Story | one 70-word paragraph |
| Total entries | 4,316 |

Machiavelli is a **multi-year legacy** account. A 12-month account will not reach
those numbers, and should not be promised them. We therefore define two things:

- **The 12-month target (§4)** — achievable, calibrated to a normal paid user.
- **The Legacy horizon (§9)** — where Month 12 hands off to, and where Machiavelli lives.

> **Honesty rule for the demo:** the page must say it is a demo of an *evolved*
> account. The Time-Travel Scrubber (§8) re-renders the same persona at each
> month's *scaled-down* numbers so a visitor sees the real curve, not a
> 1,469-entry wall on day one.

---

## 3. THE TWO CLOCKS · HOW A MONTH UNLOCKS

The user's brief says the evolution is driven by **journal entries and thoughts
in Log**, **morning check-ins**, and **self-care button clicks**. Time alone
should not make a person feel evolved; but punishing quiet months is cruel and
bad for a wellness product. So there are **two clocks**:

```
CLOCK 1 · CALENDAR      Month N opens on usershipSince + N months.        ← the container
CLOCK 2 · DEPTH         Log entries · check-ins · self-care clicks.       ← the contents
```

- **Time opens the month.** "Months unlocked: 3/12" is a pure calendar counter.
  It always advances. Nobody is locked out of their own year.
- **Depth fills the month.** What the Month Card contains — the Seal tier, the
  length of the Story, the number of badges — is determined by what the person
  actually did.

### 3.1 The Seal tiers (what each month is "stamped" with)

| Seal | Meaning | Rule (tunable) | Story output |
|---|---|---|---|
| `○` Quiet | Barely present | < 6 active days | 1 sentence, kind, no guilt |
| `◐` Steady | Present | 6–15 active days | short paragraph |
| `●` Full | Engaged | 16–24 active days **and** ≥ 8 log entries | full paragraph + 1 pattern |
| `◉` Deep | Immersed | ≥ 25 active days **and** ≥ 20 entries **and** ≥ 20 check-ins | paragraph + pattern + 1 quote of the user's own words |

Copy rule: a Quiet month is never called "failed." The AI says: *"A quiet month
is also data. I kept the thread."* The Memory Engine's doctrine is that it
*asks*, never scolds.

### 3.2 The three raw signals

These already flow as `log` events, so no new instrumentation is needed:

| Signal | Event / source | Weight in month score |
|---|---|---|
| Journal entries / thoughts | `note` log events (> 20 chars) | 0.45 |
| Morning check-ins | `emotional_checkin` events | 0.30 |
| Self-care clicks | `self_care_complete` (skip counts 0, but is logged) | 0.25 |

```
monthDepth = 0.45·min(notes/20,1) + 0.30·min(checkins/25,1) + 0.25·min(selfcare/30,1)
```

---

## 4. THE 12-MONTH CURVE · TARGETS

Cumulative targets for a **normal paid user** (all numbers are starting
hypotheses; tune from real Usership data after the first cohort passes Month 3).

| Month | Chapter | Cumulative notes | Cumulative check-ins | Cumulative self-care | Story length | Density | Water glyph |
|:--:|---|--:|--:|--:|---|---|:--:|
| 1  | Awakening   | 12  | 18  | 25  | 1 sentence      | breathable  | `∘` Droplet |
| 2  | Awakening   | 30  | 40  | 60  | 2 sentences     | breathable  | `∘≈` |
| 3  | Awakening   | 55  | 65  | 100 | 40 words        | comfortable | `≈` Wave |
| 4  | Exploration | 85  | 95  | 150 | 55 words        | comfortable | `≈∘` |
| 5  | Exploration | 120 | 125 | 205 | 60 words        | comfortable | `≈≈` |
| 6  | Exploration | 160 | 155 | 260 | 70 words        | compact     | `≋∘` |
| 7  | Integration | 205 | 185 | 320 | 70 words        | compact     | `≋` Current |
| 8  | Integration | 250 | 215 | 380 | 75 words        | compact     | `≋` |
| 9  | Integration | 300 | 245 | 445 | 80 words        | dense       | `≋≋` |
| 10 | Mastery     | 350 | 275 | 510 | 85 words        | dense       | `≋≋` |
| 11 | Mastery     | 405 | 305 | 580 | 90 words        | dense       | `≋≋∘` |
| 12 | Mastery     | 460 | 335 | 650 | 90 words **+ Year Codex** | instrument | `≋≋≋` Year Seal |

> Glyph column is a **proposal**. The documented extended milestones stop at
> Day 180 (`≋≋`); Day 270 and Day 365 are new rungs introduced here.
> The existing day-based badges (7/14/21/30/50/60/90/100/180) still fire on
> their own day counts — the month glyph is the *seal on the card*, not a
> replacement.

**Compression ratio, made visible.** Each Month Card prints one line such as
`164 entries · 22 check-ins · 41 self-care → 1 paragraph`. At Month 12 the
Codex prints `460 entries · 335 check-ins · 650 self-care → 1 page`. The
compression is the product, so the ratio is shown, not hidden.

---

## 5. MONTH-BY-MONTH BLUEPRINT

Each month has the same card layout so the document stays scannable:

```
┌─ MONTH N · NAME ──────────────────────────────────────────────────────────┐
│ UI STATE    density · what appears/changes on screen                      │
│ WIDGETS     newly unlocked (mapped to existing components)                │
│ AI VOICE    how LOT® AI speaks this month                                 │
│ CEREMONY    what the Month Card does                                      │
│ STORY       what the compressed Memory delivers                           │
│ BADGES      glyph + unlock                                                │
│ WATCH       the one behavior the AI quietly steers toward                 │
└───────────────────────────────────────────────────────────────────────────┘
```

Existing `MONTH_MESSAGES` copy is **kept** as the headline of each card, so the
current widget is upgraded, not replaced.

---

### Q1 · AWAKENING (Months 1–3) — `breathable → comfortable`
*The system learns your name for things.*

#### MONTH 1 · SIGNAL — "The first month. The system is beginning to know you."
```
UI STATE   Day 1 is deliberately barebone: wordmark LOT®, ONE Memory question,
           the Log field, nothing else. Lots of air. Dark, quiet, no chrome.
           By day 7 the Morning Check-in appears. By day 14, Self-care Moments.
WIDGETS    Time · Emotional Check-in · Self-care Moments · Memory (1 Q/day) · Log
AI VOICE   Silent-asker. Only questions. Never longer than 12 words.
CEREMONY   First-week mini-seal ∘ (Day 7 badge "First drops form").
           End of month: first Month Card — a single sentence.
STORY      "You like tea in the morning, and you wrote 12 times." (1 sentence)
BADGES     ∘ Droplet (Day 7) · Day 14 · Day 21 · "Month 1 Seal"
WATCH      Open the Log once. Anything. A word counts.
```
Counter widget appears at day 1: **Months unlocked: 0/12** → turns **1/12** on
the anniversary. First view of the counter is the promise of the whole year.

#### MONTH 2 · RHYTHM — "Two months in. Patterns are starting to form."
```
UI STATE   Still breathable. Log tab gains month dividers ("— MONTH 2 —").
WIDGETS    Intentions · Planner (light) · Calendar
AI VOICE   First callback: quotes one of your own prior answers back to you.
CEREMONY   Month Card gains the compression line: "30 entries → 2 sentences".
STORY      2 sentences, one detail from Month 1 carried forward
           ("Last month: tea. This month: tea and silence before work.")
BADGES     ≈ Wave approach (Day 30 "Moon cycle") · Day 50 "Halfway current"
WATCH      Check in at the same hour three days in a row (rhythm).
```

#### MONTH 3 · PATTERN — "Three months. You have reached Active User status."
```
UI STATE   LAYOUT SHIFT #1 (felt). Density → comfortable. Widgets begin to stack
           in semantic groups: [Body] [Mind] [Soul]. Gentle grid appears.
WIDGETS    Recipe · Energy Capacitor · Mood Analytics · MonthlyPulse "Quarter Card"
AI VOICE   Names its first pattern out loud: "You write most when it rains."
CEREMONY   QUARTER 1 CHAPTER: "Awakening". Longer Month Card + Chapter Page
           (one 40-word paragraph compressing all of Q1). Confetti-free;
           a single slow wave glyph ≈ draws itself.
STORY      40-word Month Insight + Chapter I title.
BADGES     ≈ Wave (Day 90 "Three-month architect" ties here) · Active User
WATCH      Do one self-care click on a day you did NOT check in.
```
Month 3 is the **first retention hinge**: the point where a person decides the
product knows them. It gets the first real ceremony.

---

### Q2 · EXPLORATION (Months 4–6) — `comfortable → compact`
*The system starts predicting; you start noticing.*

#### MONTH 4 · PORTRAIT — "Four months. The portrait deepens."
```
UI STATE   Density stays comfortable but type tightens (letter-spacing -0.01em).
WIDGETS    Pattern Insights · Narrative (read-only) · Correlated Indexes (1 dim)
AI VOICE   Starts predicting: "Tuesdays are your lowest energy. Plan light."
CEREMONY   Month Card shows first PORTRAIT: archetype name (e.g. "The Observer")
           appears with a confidence bar. Archetype is private, tappable to hide.
STORY      55 words. Includes ONE trait (Body, Mind, Soul, Seasons or Patterns).
BADGES     ≋ Current (Day 100 "Ocean depth") · first Word-Turn badge from a
           journal keyword
WATCH      Answer 3 Memory questions in a row (feeds archetype confidence).
```

#### MONTH 5 · CADENCE — "Five months. Consistency is its own reward."
```
UI STATE   Streak ribbon appears under the wordmark (calm, not gamified-loud).
WIDGETS    Interventions · Cohort Connect (read-only first)
AI VOICE   Begins to be PROACTIVE: suggests a self-care action at the right hour
           ("It's 3pm and your energy usually dips. Two minutes outside?")
CEREMONY   Month Card adds "Your best day this month: <date>" with the log
           line that day, verbatim.
STORY      60 words with one quoted phrase from the user's own journal.
BADGES     Behavioral badge (consistency family) · "Week Warrior"+
WATCH      Accept one proactive self-care suggestion.
```

#### MONTH 6 · MERIDIAN — "Six months. The journey is half-declared."
```
UI STATE   LAYOUT SHIFT #2 (felt). Density → compact. Wordmark morphs
           "LOT®" → "LOT® A" (the AI letter arrives, dimmed — the first hint).
WIDGETS    Intention History · Mood Patterns · Export (data ownership)
AI VOICE   MID-YEAR LETTER: the AI writes in second person, ~120 words,
           looking back at Months 1–6 and forward to 7–12.
CEREMONY   QUARTER 2 CHAPTER: "Exploration" + HALF-YEAR SEAL. Months unlocked:
           6/12 ring is exactly half filled — the most photographed state.
STORY      70 words + Chapter II (Q2 compression, 60 words).
BADGES     ≋ + half-year voyager (Day 180) · Q2 chapter badge
WATCH      Re-read your Month 1 sentence. (Link included. Powerful contrast.)
```
Month 6 is the **shareable moment**: a Half-Year card sized for social/story export.

---

### Q3 · INTEGRATION (Months 7–9) — `compact → dense`
*The system reads you back; contradictions become useful.*

#### MONTH 7 · ECHO — "Seven months in. The system has been listening."
```
UI STATE   Compact. The Log tab gains a right-hand "Echo" margin: the AI
           surfaces earlier entries that rhyme with today's.
WIDGETS    Integrity (lie-detector, shown as "Consistency check", gentler name)
AI VOICE   Gently names a contradiction: "You say mornings matter most, but you
           check in at night." Always as a question.
CEREMONY   Month Card shows "Then / Now" pair — one line from Month 1 beside
           one from this month.
STORY      70 words with a Then/Now contrast.
BADGES     Secret-Boss hint tier: a locked silhouette appears; no name.
WATCH      Move one habit to match what you say you value.
```

#### MONTH 8 · ALTITUDE — "Eight months. Rare air."
```
UI STATE   Compact+. Fewer words, more numbers. A small sparkline row beneath
           the check-in (8 months of mood, one dot per month).
WIDGETS    Quantum State · Signal Stream (read-only) · Correlated Indexes (4-dim)
AI VOICE   Terse. Only says what changed. "Energy +9% vs Month 5."
CEREMONY   "Rare air" micro-moment: percentile line ("Top 12% of Usership
           on consistency") — opt-in, privacy-safe, aggregate only.
STORY      75 words; explicitly names the year's PEAK week.
BADGES     Mastery-tier badge candidate · Cohort badge
WATCH      Set one Intention that spans the rest of the year.
```

#### MONTH 9 · RITUAL — "Nine months. The self-care practice is a habit now."
```
UI STATE   LAYOUT SHIFT #3 (felt). Density → dense. Chrome recedes; the AI's
           suggestions now come BEFORE the user asks (pre-asked Memory Qs).
WIDGETS    Narrative Reflection (AI synthesis) · Pattern Recognition dashboard
AI VOICE   Anticipatory: answers questions you have not asked yet.
CEREMONY   QUARTER 3 CHAPTER: "Integration". The UI shows a ritual timeline —
           the 3 practices the person has done most (their personal liturgy).
STORY      80 words + Chapter III (Q3 compression, 70 words).
BADGES     Ritual badge family · "habit now" Behavioral set
WATCH      Teach the system one rule ("never ask me before 8am").
```

---

### Q4 · MASTERY (Months 10–12) — `dense → instrument`
*The system and the person speak in one voice.*

#### MONTH 10 · THRESHOLD — "Ten months. Almost there."
```
UI STATE   Dense. A visible "2 months to Codex" countdown quietly replaces the
           caption; the 12-segment ring has 10 lit.
WIDGETS    Architect view (read-only self-assembly telemetry)
AI VOICE   Mentor: teaches the user about THEIR OWN pattern library.
CEREMONY   "Threshold Page" — three things you have stopped doing, three you
           have started. Autogenerated from log deltas.
STORY      85 words.
BADGES     Hero's Journey set: "Threshold crossed" (v32 Word Turn)
WATCH      Write the first line of your own Year Letter (draft, private).
```

#### MONTH 11 · VIGIL — "Eleven months. One more."
```
UI STATE   Dense. Almost no decoration. Month Card is a single quiet line,
           deliberately understated — the calm before the Codex.
WIDGETS    Co-author Memory (user edits the AI's compressed paragraphs)
AI VOICE   Co-author: shows its draft story and asks "Does this sound like you?"
CEREMONY   Editing ceremony — user may revise any of the 11 monthly paragraphs
           before they are bound into the Codex. Ownership moment.
STORY      90 words. Last month before the full year compression.
BADGES     "Elixir found" (v32) · Codex Eve
WATCH      Approve or edit every month's paragraph.
```

#### MONTH 12 · CODEX — "One year with LOT. The portrait is complete — and still evolving."
```
UI STATE   LAYOUT SHIFT #4. Density → instrument (Bloomberg-terminal grade).
           Wordmark finishes: "LOT® AI" at full opacity. 12/12 ring closes with
           a single slow draw. Year Seal replaces the Month glyph.
WIDGETS    Everything unlocked, including Year Codex and Time-Travel Scrubber
AI VOICE   Speaks in the user's own cadence (style-matched from their Log).
CEREMONY   YEAR CODEX — a one-page, print-ready document:
             · 12 monthly paragraphs (the edited ones)
             · 4 chapter titles (Awakening/Exploration/Integration/Mastery)
             · archetype portrait + 5 Memory Story categories
             · compression line: 460 entries · 335 check-ins · 650 self-care → 1 page
             · the Month 1 sentence and the Month 12 sentence, side by side
           Offered as private page, PDF and (opt-in) public profile.
STORY      90-word Month Insight + 400-word Year Codex summary.
BADGES     ≋≋≋ Year Seal · "Great Work" / "Odyssey Log" (v22 Mastery) · Legacy hand-off
WATCH      Choose: renew Year II, or open the Legacy horizon (§9).
```

---

## 6. THE MONTH CARD · CEREMONY SPEC

The Month Card is the evolution of `MonthlyPulseWidget`. It fires on the **first
login after the monthly anniversary** and has exactly three beats (≤ 20 seconds):

```
BEAT 1 · SEAL         Glyph draws itself. "MONTH 6 · MERIDIAN"   (1.4s fade, reuses existing)
BEAT 2 · COMPRESSION  "164 entries · 22 check-ins · 41 self-care → "
                      then the Story types in (30 ms/char), user's own phrase in italics
BEAT 3 · AFFIRMATION  one line + "Next: Month 7 · ECHO unlocks <date>" + dismiss phrase
```

- **Dismiss** reuses the existing phrases ("Onward.", "The system remembers.").
- **Re-readable** from the Months Unlocked widget (tap segment N → past card).
- **Sound**: reuse `sovietChime.ts` at Beat 1 only; respect the user's sound setting.
- **Accessibility**: `prefers-reduced-motion` → no typing, no glyph draw.

### 6.1 Affirmation bank (by seal, not by month)

| Seal | Example affirmation |
|---|---|
| ○ Quiet | "A quiet month is also data. I kept the thread." |
| ◐ Steady | "You showed up. That is most of it." |
| ● Full | "This month had a shape. You gave it one." |
| ◉ Deep | "You did not just live this month. You wrote it down." |

Affirmations are a single sentence, no exclamation marks, no gamified language —
consistent with `LOT-STYLE-GUIDE.md`.

---

## 7. NEW WIDGETS & DATA

### 7.1 "Months Unlocked" — the context-based widget (requested)

```
 Months unlocked: 3/12        ← label
 ● ● ● ○ ○ ○ ○ ○ ○ ○ ○ ○      ← 12 segments; ● = opened, ◉ = current, tap = card
 Month 4 · PORTRAIT unlocks in 9 days
```

- Appears on **Day 1** at `0/12`. A person sees the whole year on their first
  screen — the promise is visible before the first achievement.
- Visible only with the `Usership` tag (same gating as `MonthlyPulseWidget`).
- Tap a segment to reopen that month's Card and Story.
- At 12/12 it **becomes the Year Codex entry point**.

### 7.2 "Last Month's Insight" — the Memory widget (requested)

A paragraph-long compressed insight from the previous month, shown in the
Memory widget slot for the first 3 days of a new month, then collapsing to a
one-line "Read last month →" link. This is the *daily-visible* echo of the
monthly ceremony.

### 7.3 Storage shape (proposed)

Stored in user metadata (no new table for v1):

```ts
metadata.usership = {
  since: '2026-11-01T00:00:00Z',        // Usership start, NOT joinedAt
  months: [{
    n: 1,
    name: 'SIGNAL',
    seal: 'steady',                      // quiet | steady | full | deep
    stats: { notes: 12, checkins: 18, selfCare: 25, activeDays: 14 },
    story: '…compressed paragraph…',     // AI-generated
    storyEdited: null,                   // user's Month-11 edit, if any
    quote: '…user phrase…',
    generatedAt: '…',
    chapter: 1,
  }],
  codex: null,                           // set at Month 12
}
```

### 7.4 Compression job (the one new server piece)

A scheduled job in `src/server/scheduled-jobs.ts`:

1. For each Usership user whose anniversary passed and `months[n]` is empty.
2. Collect that month's `note`, `emotional_checkin`, `self_care_complete` logs.
3. Compute stats + seal (pure TypeScript, no AI).
4. Call the existing **Together AI (primary) → Anthropic fallback** path with a
   prompt bounded by the table in §4 (word cap per month).
5. Persist to `metadata.usership.months[n]`; push an SSE "month_ready" event.

Cost: 12 generations per user per year — negligible next to the Memory Engine's
10–15 questions per day.

Prompt skeleton:

```
You are LOT® AI, writing a private monthly memory for one person.
Voice: calm, second person, no exclamation marks, no clichés.
Input: <month stats>, <prior month stories>, <this month's notes, check-ins, self-care>.
Write <N> words. Include exactly one phrase quoted from the person's own notes.
Name at most one pattern. If the month was quiet, say so kindly and keep the thread.
Never invent events that are not in the input.
```

The last line is the safety rule: the story must be **grounded** in logged text,
otherwise tangibility turns into fabrication.

---

## 8. THE DEMO · TIME-TRAVEL SCRUBBER ON `/u/machiavelli`

Machiavelli already shows the end-state. To tell the **evolution story**, add a
12-notch scrubber to the public demo profile:

```
 /u/machiavelli
 ┌────────────────────────────────────────────────────────────┐
 │  ◀  MONTH  1  2  3  4  5  6  7  8  9  10  11  12  ▶   (drag) │
 └────────────────────────────────────────────────────────────┘
```

Dragging re-renders the **same persona** with that month's scaled-down numbers
(§4), density level, glyph, and Story. A visitor sees day-1 barebone become
Month-12 instrument in ten seconds — that is the sales story.

Implementation sketch: `?month=N` query param → `public-api.ts` demo branch
returns the §4 row instead of the 1,469 legacy values; `PublicProfile.tsx`
applies the density class for that month.

Sample Machiavelli Memory Stories (voice-matched; he is writing from the
Palazzo Vecchio — all fictional demo content, clearly a demo):

| Month | Story |
|:--:|---|
| 1  | *"I ask the morning one question, and it asks me one back."* |
| 3  | *"Three months of notes: I write most when it rains. The citizens below are not so different from me — all of us weather-driven. I took the cold seriously and rested."* |
| 6  | *"Half a year. I no longer record only what happened; I record what I expected to happen, and compare. The gap between the two is where I live. The Strategist is a person who closes that gap on purpose."* |
| 9  | *"Rituals have replaced decisions. The courtyard at six, tea, three lines in the Log, and one honest self-care. The system asks before I do. I am less surprised, and more precise."* |
| 12 | *"The art of governance is the art of understanding human nature. A year ago I could not name my own pattern. Now it names itself, and I edit it. 460 entries compressed into one page — and the page is mine."* |

Month 12's last line is deliberately close to the existing `memoryStory` in
`public-api.ts`, so the demo's current copy becomes the *end of a journey*
instead of a standalone paragraph.

---

## 9. BEYOND MONTH 12 · THE LEGACY HORIZON

Month 12 does not end the story; it hands off.

| Stage | Name | What changes |
|---|---|---|
| Year I (Months 1–12) | Usership | this document |
| Year II+ | **Legacy** | Weather Station, Wallet (LOT balance + loyalty), Board profile (Machiavelli unlocks) |
| Year III+ | **Chronicle** | Yearly Codex stack; the AI cross-references Year I vs Year II |

The month counter keeps counting past 12 (the existing widget caps at 12 and
says "Month N. The journey continues." beyond that); from Year II the ring
becomes a **spiral**, one turn per year.

---

## 10. IMPLEMENTATION ROADMAP

Smallest-first so each phase is shippable and visible.

| Phase | Deliverable | Files | Effort |
|---|---|---|---|
| **P0** | This blueprint | `docs/technical/USERSHIP-12-MONTH-EVOLUTION.md` | done |
| **P1** | Months Unlocked widget (client-only; 12-ring, tap to read, counter from `usershipSince`) | new `MonthsUnlockedWidget.tsx`, `System.tsx` | S |
| **P2** | Real stats on the Month Card (notes / check-ins / self-care counts from `useLogs`) + Seal tier | extend `MonthlyPulseWidget.tsx` | S |
| **P3** | `usershipSince` field; stop counting from `joinedAt` | `user.ts` model, admin tag grant, `MonthlyPulseWidget` | S |
| **P4** | Month → density/unlock mapping table (overrides badge-level driver for Usership) | `interfaceEvolution.ts` | M |
| **P5** | Monthly compression job + storage + SSE `month_ready` | `scheduled-jobs.ts`, `memory/…`, `api.ts` | M |
| **P6** | Last Month's Insight in Memory widget; re-readable cards | `MemoryWidget.tsx` | S |
| **P7** | Time-Travel Scrubber on demo (`?month=N`) | `public-api.ts`, `PublicProfile.tsx` | M |
| **P8** | Month 11 editing ceremony + Month 12 Year Codex (page, PDF, public) | new `YearCodex.tsx` | L |
| **P9** | Wordmark morph `LOT®` → `LOT® AI` | header component + CSS var | S |

Recommended first PR: **P1 + P2 + P3** — one visible change, no AI cost, and it
fixes the `joinedAt` gap.

---

## 11. OPEN QUESTIONS FOR S-2

1. **Day-1 barebone, how bare?** Strict (wordmark + one question + Log) or keep
   the Time widget? Proposal: strict. The contrast is the story.
2. **Seal thresholds** (§3.1) are guesses. Approve as v1 and tune at Month 3 of
   the first cohort?
3. **Month 8 "percentile"**: opt-in aggregate line, or drop it as too
   competitive for a self-care product?
4. **Integrity widget** is currently framed as a "lie detector." Month 7
   proposes a gentler public name ("Consistency check"). Approve rename?
5. **Wordmark morph to "LOT® AI"** — the user-visible brand moment. Land it at
   Month 6 (hint), Month 12 (solid) as drafted, or earlier?
6. **User edits to Story (Month 11)** — stored in `storyEdited` and used by the
   Codex; does the AI also learn from the edit? Proposal: yes, as a style signal.
7. **Existing users already past Month 1**: backfill `usershipSince` from tag
   grant date, or start everyone at Month 1 on release day?

---

## 12. THE STORY THE UI TELLS · ONE-LINE-PER-MONTH INDEX

```
 1  SIGNAL     ∘   a question                      (1 sentence)
 2  RHYTHM     ∘≈  your words come back            (2 sentences)
 3  PATTERN    ≈   the first pattern, spoken        (Quarter I · Awakening)
 4  PORTRAIT   ≈∘  an archetype appears
 5  CADENCE    ≈≈  it nudges you
 6  MERIDIAN   ≋∘  the mid-year letter · LOT® A     (Quarter II · Exploration)
 7  ECHO       ≋   your past rhymes with now
 8  ALTITUDE   ≋   fewer words, more signal
 9  RITUAL     ≋≋  it asks before you do           (Quarter III · Integration)
10  THRESHOLD  ≋≋  it teaches you your own library
11  VIGIL      ≋≋∘ you edit its pen
12  CODEX      ≋≋≋ one page, LOT® AI                (Quarter IV · Mastery)
```

---

*Compression is the product. The user should be able to hold a whole year in one page.*
