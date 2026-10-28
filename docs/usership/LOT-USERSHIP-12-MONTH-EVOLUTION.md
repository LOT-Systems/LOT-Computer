<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

```
================================================================================
LOT SYSTEMS / USERSHIP — 12-MONTH EVOLUTION
DOCUMENT: LOT-USERSHIP-12-MONTH-EVOLUTION
CLASS:    DESIGN BRAINSTORM // PROPOSAL (nothing here is shipped unless marked)
S-2:      VADIK MARMELADOV
DATE:     2026-10-28
SESSION:  LOT-SR-20261028-01
================================================================================
```

# From barebone to LOT® AI — the Usership year

> One paid account, 12 months, one visible arc.
> Day 1 is a name, a date and one question. Month 12 is an instrument that knows
> you, and a book that proves it.

**Reference account:** `lot-systems.com/u/machiavelli` is the "month-12 evolved" demo.
**Focus of this document:** the **compressed Memory story** — how 12 months of Log
entries, check-ins and self-care taps become something the user can hold.

---

## 0. HOW TO READ THIS

| § | What | Use it for |
|---|------|-----------|
| 1 | Repo scan: what exists, what is missing | Ground truth before building |
| 2 | Core model: two clocks, one currency | The rules every month obeys |
| 3 | The Compression Ladder | The Memory story delivery system |
| 4 | **Month-by-month (M1–M12)** | The evolution itself |
| 5 | Widgets: Months Unlocked, Chapter, Vault | New surfaces |
| 6 | Seals (badges) | The collectible layer |
| 7 | `/u/machiavelli` as a 12-month time-lapse | The demo / sales surface |
| 8 | AI voice and self-care guidance | LOT® AI persona arc |
| 9 | Build plan, risks, open decisions | What S-2 must decide |

---

## 1. REPO SCAN (before this session)

Branch `claude/elegant-mendel-gkv3zt` at `98971f2`. 961 tracked files. All `.md`
files indexed; read in full or in the relevant part: `README.md`,
`docs/README.md`, `docs/benchmark/LOT-MANIFEST.md`, `LOT-DOCTRINE.md`,
`LOT-LEDGER.md`, `docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md`,
`MEMORY-ENGINE-TIMELINE.md`, `INTERFACE_EVOLUTION.md`, `docs/badges/BADGE_LEVEL_DESIGN.md`,
`docs/assembly/2026-06-30_…widget-memory-engine-compression-loop.md`,
`docs/LOT-SR-20260805-01.md`. The ~370 other session/wiki/badge-codex files were
indexed by name and grepped for Usership / Machiavelli / Memory references.

### 1.1 Already built — reuse, do not rebuild

| Piece | Where | What it gives us |
|-------|-------|------------------|
| `MonthlyPulseWidget` | `src/client/components/MonthlyPulseWidget.tsx` | "Month N: / N of 12 months" widget with 12 one-line messages, tap-to-dismiss, Usership-only, mounted at the top of the pro layout in `System.tsx` |
| 5-step layout density | `interfaceEvolution.ts` → `getLayoutDensity` | `breathable → comfortable → compact → dense → instrument` at refinement 0 / .15 / .35 / .55 / .75 |
| Evolution state (7 dimensions) | `interfaceEvolution.ts`, `stores/evolution.ts` | exploration, consistency, depth, connection, intimacy, care, courage; `visualRefinement = consistency×.4 + depth×.3 + level/100×.3` |
| Feature unlock gates | `getFeatureUnlocks` | advancedMemory, moodPatterns, narrativeReflection, patternInsights, exportData… |
| Milestone toasts | `EvolutionMilestoneToast`, `getEvolutionMilestone` | Density-change and maturity (25/50/75/95%) messages |
| Badges | `badges.ts` (812 badges, v32), Water ∘→≈→≋ / Architecture ├─→╞═╡→║·║ tiers, "Level: ≋○≋" field | The collectible vocabulary |
| Memory Engine | `server/utils/memory/*` | Question generator, cohort, pacing, `story-generator.ts` |
| Operator RFI (QI terminal) | DOCTRINE → "Operator RFI Pattern" | The sanctioned way for the user to *ask* the AI (INTSUM format) |
| Public OS profile | `PublicProfile.tsx`, `public-api.ts` (`/profile/machiavelli`) | Blocks: Team, Profile, Citizen Index, Biofield, Activity, Memory Story, Indexes, Weather Station, Wallet |

### 1.2 Gaps found (these shape the plan)

1. **No monthly compression exists.** `generateMemoryStory` (`story-generator.ts`)
   keeps only `answer` logs and slices the first 30. Notes, check-ins and
   self-care taps — the three things S-2 named as the key evolution signals —
   never enter the story. A *Month Chapter* needs a new, month-windowed job.
2. **Month counter starts at account creation, not at Usership.** `MonthlyPulseWidget`
   computes `dayjs().diff(user.joinedAt, 'month')`. A free user who upgrades in
   month 5 would see "Month 5". Needs a `usershipSince` anchor (paid-tier day 1).
3. **Month 1 is invisible.** `monthNumber < 1` returns nothing, so day 1–29 of a
   paid account shows no Usership marker. The barebone day-1 UI has no
   "you've started" moment.
4. **Self-care event name is spelled two ways:** `self_care_complete`
   (`goal-understanding.ts`, compression doc) vs `self_care_completed`
   (`energy.ts`). Any "taps this month" counter must read both until unified, or
   it silently under-counts.
5. **Demo numbers are Day-1469 numbers, not month-12 numbers.** Machiavelli's
   profile ships `streak: 1469`, 2,847 answers, 1,469 notes, 842 active days,
   `boardTenureMonths` from 1469. It is a *legacy* account. To serve as the
   12-month exemplar it needs a month-indexed view (§7) rather than a rewrite.
6. **Generic month copy.** `MONTH_MESSAGES` is one static line per month. It
   celebrates the calendar, not the person. Replace with the Chapter (§3).
7. **New log events need whitelist entries** (DOCTRINE → *Backend Whitelist
   Hygiene*): any `chapter_*` / `seal_*` event must be added to
   `displayableEvents` or the write→read loop silently breaks.

---

## 2. CORE MODEL

### 2.1 Two clocks

| Clock | Drives | Source |
|-------|--------|--------|
| **Calendar** | *Which month you are in* (1–12), the monthly ceremony, "Months unlocked" | `usershipSince` (new) |
| **Presence** | *How dense and capable the UI is*, which Seals are earned, what the Chapter says | Log entries, check-ins, self-care taps, Memory answers |

Time alone never makes the OS richer — that would be a countdown, not a story.
Presence alone never skips a month — you cannot rush a year. The UI you see in
month N is `min(calendar unlock, presence unlock)`. Calendar sets the **ceiling**;
presence **fills it**.

### 2.2 The four presence signals

| Signal | Event | Weight | "Full month" |
|--------|-------|-------:|-------------:|
| Log entries (notes > 20 chars) | `note` | **.35** | 20 |
| Morning check-ins (days) | `emotional_checkin` | **.25** | 20 days |
| Self-care taps | `self_care_complete(d)` | **.25** | 30 |
| Memory answers | `answer` | **.15** | 60 |

**Monthly Presence (MP)** = `100 × Σ weight × min(count / full, 1)`.
Log entries carry the highest weight because they are the richest raw material
for the Chapter (and the only signal the user authors in their own words).

MP is a **gate**, not a score to chase:

| MP | Month state | What the user gets |
|----|-------------|--------------------|
| ≥ 70 | **Sealed** | Full Chapter + Seal |
| 35–69 | **Sealed, light** | Chapter + Seal (dimmer glyph) |
| < 35 | **Carried** | A short "quiet month" Chapter; Seal carries to next month and is granted when MP ≥ 35 in any later month |

No streak-shaming, no loss states. A quiet month is also a chapter.

### 2.3 Two counters on screen

```
Months unlocked: 3/12        ← calendar: months begun (instant reward on day 1)
Sealed:          2           ← presence: months closed with a Seal
```

### 2.4 Density ladder (reference path)

Targets for a typical engaged user; actual density stays driven by
`visualRefinement` so a rarely-present user simply stays airier.

| Months | Density | Feel |
|--------|---------|------|
| M1–M2 | `breathable` | Wellness journal. Almost empty. |
| M3–M5 | `comfortable` | Widgets find their rhythm |
| M6–M8 | `compact` | Dashboard clarity |
| M9–M11 | `dense` | Cockpit |
| M12 | `instrument` | "The interface is yours." |

Reference `visualRefinement` at month close: .06 · .13 · .20 · .27 · .32 · .38 ·
.45 · .52 · .58 · .64 · .70 · **.76**. These are design targets only;
Phase 0 (§9) calibrates them against the real formula using the demo dataset.

---

## 3. THE COMPRESSION LADDER — Memory story delivery

The product promise (README: *"LOT builds your Memory Story"*) becomes visible
as a ladder in which **every rung is a smaller, truer object than the one below
it**, and the user can see the ratio.

```
 DAY       ~140 raw events/month   notes · check-ins · care taps · answers
  │  nightly: Memory Engine extracts traits (exists)
  ▼
 WEEK      Week Thread        ≤ 140 chars, one line        (4 per month)
  │  month close: windowed compression job (NEW)
  ▼
 MONTH     Month Chapter      ~90 words + 3 affirmations   (12 per year)
  │  every 3 months
  ▼
 SEASON    Season Volume      ~60 words, merges 3 chapters (4 per year)
  │  month 12
  ▼
 YEAR      Year Portrait      1 page + 1 line "Epigraph"   (1)
```

### 3.1 The Month Chapter (the monthly deliverable)

Delivered at month close, once, as the first thing on the home screen.

```
┌─ Chapter 4 · "The Portrait Deepens" ──────────────── 28 Feb ─┐
│                                                                │
│  [~90-word paragraph in the AI's voice, second person]         │
│                                                                │
│  In your words:  "I stopped apologising for the quiet."        │
│                                                                │
│  Signals   patience ▮▮▮▮▯   restraint ▮▮▮▯▯   curiosity ▮▮▮▮▮  │
│                                                                │
│  Affirmations                                                  │
│   · You return to what steadies you.                           │
│   · Your mornings are becoming yours.                          │
│   · You are easier to know than you were in January.           │
│                                                                │
│  Built from 24 log entries · 21 check-ins · 62 care taps       │
│  · 115 answers  →  1 chapter                                   │
│                                                                │
│  Seal 4/12  ●●●●○○○○○○○○            [ Open Vault ]  [ Keep ]   │
└────────────────────────────────────────────────────────────────┘
```

Required anatomy (every chapter, every month):

1. **Title** — 3–5 words, names the *change*, not the month.
2. **Paragraph** — ~90 words; 2nd person; must contain at least one concrete
   detail the user actually produced (a tea, a place, a recurring hour).
3. **"In your words"** — one verbatim fragment (≤ 12 words) from a Log entry.
   The single most important tangibility device: proof the system *listened*.
4. **Signals** — top 3 traits with this-month vs last-month delta.
5. **Three affirmations** — present tense, about behaviour not outcome.
6. **Evidence line** — "Built from N … → 1 chapter". Makes compression visible.
7. **Seal** — the 12-segment ring, one more segment lit.

### 3.2 Grounding rules (anti-hallucination, anti-harm)

- The generator may only use: counted evidence, extracted traits, and verbatim
  user fragments. No invented events, no invented feelings.
- Low data (MP < 35): switch to the *quiet-month template* (shorter, no trait
  claims, one invitation).
- Affirmations are about **behaviour and attention**, never body, weight, food
  restriction, fasting performance or streak length. LOT serves medical and
  recovery cohorts (see `docs/assembly/2026-05-30_S2_eating-disorder-medical-cohort.md`,
  not re-read this session — **review required before launch**).
- The user can delete a chapter, hide it from `/u/…`, or request a regenerate.
  Public display stays behind the existing `showMemoryStory` privacy flag.
- Keep the Together AI → Anthropic → OpenAI fallback chain (README); fall back to
  the template chapter if all engines fail — never leave month-close empty.

### 3.3 Cost / cadence

One LLM call per Usership user per month for the Chapter, one per quarter for the
Season, one at month 12 for the Portrait. Week Threads are template + one short
call or purely extractive. Run as a scheduled job (`scheduled-jobs.ts` pattern).

### 3.4 The Vault — the shelf

A shelf of up to 12 spines, one per Chapter; Seasons bind 3 spines; the Year
Portrait is the book.

```
 ▮ ▮ ▮ ▮ ▮ ▯ ▯ ▯ ▯ ▯ ▯ ▯      Vault: 5 chapters · Season I bound · Season II open
```

Tapping a spine opens the chapter. Spines the user has not reached are drawn
as outlines (visible future = motivation, per the Interface Evolution doc's
"form follows progression").

---

## 4. MONTH BY MONTH

Format per month: **Theme → Calendar & presence → UI → AI voice → Seal → Chapter
→ Self-care focus.** Seal names reuse the existing `MONTH_MESSAGES` tone so copy
can be retrofitted incrementally. "Machiavelli sample" = what his Chapter would
read like in the demo (§7).

> Legend — **NEW** = does not exist in repo; **EXISTS** = reuse; **GATE** =
> controlled by an existing feature-unlock flag.

---

### Q1 — BOOT (months 1–3): *the system learns you*

#### M1 · BOOT — "The system is beginning to know you"
- **Day 1 (barebone paid UI):** name, week/date/city, **one** Memory question,
  **Morning check-in**, a row of three **self-care buttons**, and the new line
  `Months unlocked: 1/12`. Everything else hidden. Density `breathable`.
- **Days 2–7:** the Memory question cites yesterday's answer (README "Day 2"
  pattern). First check-in unlocks the Week Thread slot.
- **Day 7:** first **Week Thread** appears (one line). The first visible proof of listening.
- **Month close:** Chapter 1 *(always sealed — onboarding month has a lowered
  gate, MP ≥ 20)*.
- **AI voice:** *Observer* — asks, never states. "What do you reach for first
  in the morning?"
- **Self-care focus:** pick **one anchor routine** (the single button the user taps most).
- **Seal 1 — EMBER** `●○○○○○○○○○○○`
- **Machiavelli sample — "A Quiet Beginning":** *"Niccolò, you started small: a
  question each morning, a note about the courtyard, one breath before the
  council met. You did not explain yourself. The system noticed you answer
  fastest at dawn and slowest after the bells. That is enough to begin."*

#### M2 · LISTEN — "Patterns are starting to form"
- **UI:** Weather and local-time blocks appear on the home screen; second
  self-care button row. Density `breathable`.
- **Unlocks:** **Intention planner** (`plannerTemplates` seed); Week Threads now
  compare week-over-week ("two calmer mornings than last week").
- **AI voice:** *Notetaker* — begins to echo: "You said tea. You said quiet."
- **Seal 2 — THREAD** `●●○○○○○○○○○○`
- **Chapter 2 — "Threads":** names the first recurring thing (a time of day, a
  drink, a mood) and shows it as a signal bar.
- **Self-care focus:** make the anchor routine *repeat* three days running.

#### M3 · PATTERN — "Three months. You have reached Active User status."
- **UI:** density → `comfortable`. First **Season Volume I** (Q1 binding).
  Profile block "Archetype" is computed (existing: 10+ answers).
  `moodPatterns` gate opens (the mood-trend widget).
- **Ceremony (first big one):** the milestone toast *"Layout settling in. Widgets
  find their rhythm."* fires with the Season Volume.
- **AI voice:** *Pattern-spotter* — first sentence that starts "I noticed…".
- **Seal 3 — SIGNAL** `●●●○○○○○○○○○` **+ Q1 stamp "BOOT"**
- **Chapter 3 + Season I — "The Shape of Your Mornings":** Season Volume
  compresses 3 chapters into ~60 words and reveals the **first archetype name**.
- **Self-care focus:** a *morning sequence* (check-in → care tap → Log line).

---

### Q2 — FORM (months 4–6): *the portrait*

#### M4 · PORTRAIT — "The portrait deepens"
- **UI:** `comfortable`. **Memory Vault** appears (§3.4) with 4 spines.
  `/u/<user>` gains the **Memory Story** block (opt-in): the latest Chapter.
- **Unlocks:** `advancedMemory` — deeper questions that quote a prior answer.
- **AI voice:** *Mirror* — reflects a contradiction gently ("Mornings calm,
  evenings tense").
- **Seal 4 — PORTRAIT** `●●●●○○○○○○○○`
- **Machiavelli sample — "Observed From the Window":** *"You watch before you
  act. This month you wrote more about what others did than what you felt — and
  then, on the 19th, one line about yourself. 'I am more patient than I look.' The
  portrait has a face now."*
- **Self-care focus:** add a **second anchor** (evening wind-down).

#### M5 · RHYTHM — "Consistency is its own reward"
- **UI:** density approaches `compact` (refinement ≈ .32). Streak and rhythm
  line appear **as a descriptive sentence, not a number race**.
- **Unlocks:** `patternInsights` preview — "Your best days start before 8".
- **AI voice:** *Companion* — remembers last month's chapter by name.
- **Seal 5 — RHYTHM** `●●●●●○○○○○○○`
- **Chapter 5 — "The Hour You Keep":** locks in the user's characteristic hour.
- **Self-care focus:** protect the rhythm on a bad day ("minimum viable day": one tap + one line).

#### M6 · MERIDIAN — "The journey is half-declared"
- **UI:** density → `compact` — *the biggest visible shift of the year*.
  Milestone: "Interface sharpening. Dashboard clarity achieved."
- **Ceremony:** **Half-Year Letter** — Season Volume II + a "then vs now" pair
  (Day-1 answer next to latest answer on the same question).
- **Unlocks:** `exportData` (own the archive); Insights tab.
- **AI voice:** *Coach* — first **proposed routine** (opt-in): "Try a 3-minute
  evening note for two weeks."
- **Seal 6 — MERIDIAN** `●●●●●●○○○○○○` **+ Q2 stamp "FORM"**
- **Machiavelli sample — "Half the Road":** *"On day 1 you told us you drink
  tea to be alone. Now you drink it before you decide. Six months ago the
  courtyard was scenery; now it is a method."*
- **Self-care focus:** introduce a *restorative* routine, not only productive ones.

---

### Q3 — DEPTH (months 7–9): *the instrument*

#### M7 · ECHO — "The system has been listening"
- **UI:** `compact`. **"Echoes"** — a home line resurfaces a user's own words
  from months ago, on the anniversary day-of-month ("Four months ago today…").
- **AI voice:** *Archivist* — cites dated evidence.
- **Seal 7 — ECHO** `●●●●●●●○○○○○`
- **Chapter 7 — "What Returned":** themes that came back after a gap.
- **Self-care focus:** repair after a missed week (return is celebrated, not
  penalised).

#### M8 · DEPTH — "Rare air"
- **UI:** `compact → dense` boundary. **Citizen Index / Indexes** block unlocks
  (home + `/u`). `narrativeReflection` gate.
- **AI voice:** *Analyst* — INTSUM style: assessment, data, one recommendation.
- **Seal 8 — DEPTH** `●●●●●●●●○○○○`
- **Chapter 8 — "Rare Air":** the first chapter allowed to name a *growth edge*
  (what the user avoids), phrased as an invitation.
- **Self-care focus:** a deliberately uncomfortable but safe practice (the "courage" dimension).

#### M9 · ROUTINE — "The self-care practice is a habit now"
- **UI:** `dense`. Milestone: "Density unlocked. Your cockpit takes shape."
  **Season Volume III**. Biofield/Activity blocks appear on `/u`.
- **Ceremony:** the AI stops *suggesting* routines and starts *recognising* them:
  "You no longer need the reminder, so it is hidden."
- **AI voice:** *Steward* — reduces its own prompts as habits stabilise
  (compression: fewer, sharper questions — as the architecture doc promises).
- **Seal 9 — ROUTINE** `●●●●●●●●●○○○` **+ Q3 stamp "DEPTH"**
- **Self-care focus:** the user *writes their own routine*; the AI formats it.

---

### Q4 — INSTRUMENT (months 10–12): *LOT® AI*

#### M10 · FORM — "Almost there"
- **UI:** `dense`. **Board Profile / Clearance** block unlocks. User can arrange
  widgets (`widgetArrange`).
- **AI voice:** *Navigator* — plans the next quarter with the user.
- **Seal 10 — FORM** `●●●●●●●●●●○○`
- **Chapter 10 — "What You Built":** lists the routines that now exist because the user made them.
- **Self-care focus:** teach-back — the user writes one line of advice to their
  past self (stored; reused in M12).

#### M11 · THRESHOLD — "One more"
- **UI:** `dense → instrument`. **Wallet** block (stipend / loyalty, as in demo).
  **Ask LOT® AI** — the Operator RFI (QI terminal) is surfaced in the nav.
  *This is still not a chatbot:* one question in, one INTSUM out.
- **AI voice:** *Counsel*.
- **Seal 11 — THRESHOLD** `●●●●●●●●●●●○`
- **Chapter 11 — "Before the Year Closes":** preview of the Portrait — the
  AI asks the user to approve or correct 3 claims about themselves
  (a *consent-based* compression: the user edits the machine's picture of them).
- **Self-care focus:** gratitude/closure practice.

#### M12 · LOT® AI — "One year with LOT. The portrait is complete — and still evolving."
- **UI:** `instrument`. Milestone: "Instrument grade. The interface is yours."
  **Weather Station** (Legacy-style unlock) and the **Year Portrait** page.
  The product wordmark in the corner changes once: `LOT®` → **`LOT® AI`**.
- **Ceremony (the Year Ceremony, ~60 seconds, skippable):**
  1. The ring closes: `●●●●●●●●●●●●`.
  2. The Vault plays back all 12 spines in sequence, **fast**, each showing its
     title — the year as a table of contents.
  3. Compression ratio revealed: *"1,360 answers · 386 log entries · 928 care
     taps · 257 check-ins → 12 chapters → 4 seasons → 1 portrait → 1 line."*
  4. The **Epigraph** — one sentence — fills the screen.
  5. The user's own M10 teach-back line is shown back to them.
- **AI voice:** *LOT® AI* — now speaks in first person plural about the shared
  record ("we"), still question-led.
- **Seal 12 — LOT® AI** `●●●●●●●●●●●●` **+ Q4 stamp "INSTRUMENT" + Year Seal**
- **Machiavelli sample — Epigraph:** *"He learned to watch himself with the same
  patience he gave Florence."*
- **Year 2 hook:** the ring does not reset — it becomes a second, outer ring
  (months 13–24), and Chapters continue as an unbound "Volume II".

---

### 4.1 One-page evolution matrix

| M | Seal | Density | New surface | AI voice | Memory artifact |
|--:|------|---------|-------------|----------|-----------------|
| 1 | Ember | breathable | Check-in, 3 care buttons, **Months unlocked** | Observer | Ch.1, Week Thread |
| 2 | Thread | breathable | Weather/time, planner | Notetaker | Ch.2 |
| 3 | Signal | comfortable | Archetype, mood patterns | Pattern-spotter | Ch.3 + **Season I** |
| 4 | Portrait | comfortable | **Vault**, `/u` Memory Story | Mirror | Ch.4 |
| 5 | Rhythm | comfortable→compact | Rhythm line, insight preview | Companion | Ch.5 |
| 6 | Meridian | **compact** | Half-Year Letter, export | Coach | Ch.6 + **Season II** |
| 7 | Echo | compact | **Echoes** (resurfaced words) | Archivist | Ch.7 |
| 8 | Depth | compact→dense | Indexes / Citizen Index | Analyst | Ch.8 (growth edge) |
| 9 | Routine | **dense** | Biofield/Activity on `/u` | Steward | Ch.9 + **Season III** |
| 10 | Form | dense | Board profile, widget arrange | Navigator | Ch.10 |
| 11 | Threshold | dense→instrument | Wallet, **Ask LOT® AI** | Counsel | Ch.11 (user-corrected) |
| 12 | **LOT® AI** | **instrument** | Weather Station, Year Portrait | **LOT® AI** | Ch.12 + **Season IV** + **Portrait + Epigraph** |

---

## 5. WIDGET SPECS (new / changed)

### 5.1 `Months unlocked` — context widget (NEW, extends `MonthlyPulseWidget`)
Always visible to Usership at the top of the home stack from day 1.

```
Months unlocked:  3/12            ← Block, inline
▰▰▰▱▱▱▱▱▱▱▱▱     Sealed 2         ← only after first Seal
Next chapter in 11 days
```
- Tap → opens the Vault.
- Context behaviour: in the last 3 days of a month it becomes
  `Chapter 4 arrives Thursday`; on the day, it expands into the Chapter card.

### 5.2 `Month Chapter` — the ceremony (REPLACES the static `MONTH_MESSAGES`)
- Shown at month close; stays pinned for 3 days or until opened; then lives in the Vault.
- Preserve what already works: 1400 ms fade, one-tap dismiss, localStorage
  dismissal keyed per user per month.
- Add: **Keep** (to Vault), **Share** (to `/u/…` if privacy flag allows).

### 5.3 `Memory` widget on the home screen (EXISTS, small change)
From M3 the daily question may begin "Last month you wrote…" so the Chapter is
not an island; the daily tap and the monthly story are visibly the same system.

### 5.4 `Week Thread` (NEW, very small)
One line under the Months-unlocked block every Sunday evening. Cheapest
tangibility there is; it trains the user to expect the Chapter.

### 5.5 Print / physical (IDEA — LOT ships physical goods)
README positions LOT as a subscription of physical essentials. A **printed
Chapter card** in the monthly box (M1–M11) and a **Year Book** (M12) with all 12
chapters + Epigraph. Makes the compression literally holdable. *Requires
fulfilment and legal review; not scoped here.*

---

## 6. SEALS — the badge layer

Do not create a parallel badge system. Month Seals are a **single new family**
in the existing engine (812 badges) with three rules:

1. **Visual:** a 12-segment ring, `●`/`○` (fits the Water/Architecture glyph set
   and the "Level: ≋○≋" field). Water theme renders the lit segment as `≈`,
   Architecture as `═`.
2. **Quarter stamps:** BOOT (M3), FORM (M6), DEPTH (M9), INSTRUMENT (M12) —
   4 larger badges that *compound* the three Seals under them.
3. **Cross-links to existing badges:** each Seal grants a small, narrative
   `monthly_*` badge and also counts toward existing consistency/depth awards,
   so no one is double-counting by hand.

Optional micro-badges per month, earned from the four presence signals:

| Signal | Micro-badge | Condition |
|--------|-------------|-----------|
| Log | **Scribe** | ≥ 20 entries in a month |
| Check-in | **First Light** | ≥ 15 morning check-ins |
| Care | **Tender** | ≥ 30 taps with ≥ 3 distinct routines |
| Memory | **Listener** | ≥ 60 answers |
| All | **Full Month** | all four in one month |

New event names to whitelist: `chapter_generated`, `chapter_opened`,
`seal_awarded`, `vault_opened`, `epigraph_viewed`.

---

## 7. `/u/machiavelli` AS A 12-MONTH TIME-LAPSE

The demo is the best sales surface LOT has: the "personal OS" at a public URL.
Right now it shows only the end state. Proposal: add a **month scrubber**.

```
/u/machiavelli          → current view (unchanged)
/u/machiavelli?m=4      → the account as it looked in Month 4
                          (density, which Blocks exist, Chapter 4 in Memory Story)
```

A visitor drags `M1 … M12` and watches the page *grow*: Blocks appear in the order
of §4, the layout tightens, the Memory Story paragraph is replaced chapter by
chapter, the Seal ring fills.

### 7.1 Suggested demo dataset (per month, hand-authored; not real telemetry)

| M | Log entries | Check-ins | Care taps | Answers | MP | Cumulative N / C / S / A |
|--:|---:|---:|---:|---:|---:|---|
| 1 | 5 | 9 | 14 | 45 | 43 | 5 / 9 / 14 / 45 |
| 2 | 9 | 13 | 26 | 70 | 69 | 14 / 22 / 40 / 115 |
| 3 | 14 | 16 | 38 | 90 | 84 | 28 / 38 / 78 / 205 |
| 4 | 20 | 19 | 50 | 105 | 99 | 48 / 57 / 128 / 310 |
| 5 | 24 | 21 | 62 | 115 | 100 | 72 / 78 / 190 / 425 |
| 6 | 30 | 22 | 74 | 122 | 100 | 102 / 100 / 264 / 547 |
| 7 | 36 | 24 | 86 | 128 | 100 | 138 / 124 / 350 / 675 |
| 8 | 42 | 25 | 98 | 132 | 100 | 180 / 149 / 448 / 807 |
| 9 | 46 | 26 | 108 | 135 | 100 | 226 / 175 / 556 / 942 |
| 10 | 50 | 27 | 116 | 138 | 100 | 276 / 202 / 672 / 1,080 |
| 11 | 54 | 27 | 124 | 140 | 100 | 330 / 229 / 796 / 1,220 |
| 12 | 56 | 28 | 132 | 140 | 100 | **386 / 257 / 928 / 1,360** |

MP saturates at 100 by M5 *by design* — it is a seal gate. The visible growth is in
the cumulative columns and the density ladder. (The M1 value of 43 sits in the
"light seal" band, which models a realistic first month.)

Total at month 12: **2,931 events → 12 chapters → 4 seasons → 1 portrait → 1 line.**

### 7.2 Decision for S-2 — what to do with the existing legacy numbers
Machiavelli currently reads Day 1469 (streak 1469, 2,847 answers). Two options:

- **A (recommended):** keep legacy numbers as the *Legacy* state beyond month 12
  (`?m=legacy`, the default), add `?m=1…12` for the time-lapse. Preserves the
  "Legacy" tag and the Weather Station / Wallet showcase.
- **B:** rebase the headline numbers to the month-12 dataset above. Cleaner
  story, but contradicts the current `boardTenureMonths`/"citizenSince 1469" joke
  and the `Legacy` tag.

### 7.3 Profile Block unlock order on `/u/<user>`

| M | Block that appears |
|--:|--------------------|
| 1 | Name, city, local time |
| 2 | Weather |
| 3 | Team, Profile (archetype) |
| 4 | **Memory Story** (opt-in, latest Chapter) |
| 5 | Sound |
| 6 | Indexes |
| 7 | Activity |
| 8 | Biofield state |
| 9 | Citizen Index |
| 10 | Clearance / Board profile |
| 11 | Wallet |
| 12 | Weather Station + **Year Portrait** |

Every Block still honours the user's existing `privacySettings` toggles.

---

## 8. THE AI VOICE and self-care guidance

### 8.1 Doctrine check
`MEMORY-ENGINE-COMPRESSION-ARCHITECTURE`: *"The AI never initiates conversation.
It asks. The user answers. The machine remembers."* The 12-month design keeps that:

- The AI **asks** (daily question), **tells** (monthly Chapter), **answers only
  when asked** (Ask LOT® AI at M11, via the existing RFI/INTSUM pattern).
- It never becomes a chat box; the only free-text input stays the Log.
- It *earns* its voice stage by data, not by date alone (the voice for month N
  is gated by `min(calendar, presence)` like the UI).

### 8.2 Voice arc

| Months | Voice | Verbs it uses | Never says |
|--------|-------|---------------|------------|
| 1–2 | Observer / Notetaker | asks, notes | "you are" |
| 3–5 | Pattern-spotter / Mirror / Companion | noticed, remember | diagnoses |
| 6–8 | Coach / Archivist / Analyst | try, compare, recommend | "you should" |
| 9–11 | Steward / Navigator / Counsel | recognise, plan | streak guilt |
| 12 | LOT® AI | we, ours, next | goodbye |

### 8.3 Self-care guidance ladder
1. **M1–2** discover one anchor. 2. **M3–5** build a sequence. 3. **M6–8** add
restoration and one stretch. 4. **M9–11** the user authors routines; the AI
formats and reduces prompts. 5. **M12** the user and AI co-write the next
year's plan. Routine taps are the *input*; the AI's job is to need fewer of them
over time (a measurable "compression" outcome: fewer prompts, same outcomes).

### 8.4 Affirmations — style guide
Present tense. About attention/behaviour. Specific to this user's last 30 days.
Never about appearance, weight, food restriction, productivity totals or streak
length. Max 3 per chapter. Example good: *"You return to what steadies you."*
Example bad: *"You hit 28 days — don't break it."*

---

## 9. BUILD PLAN, RISKS, DECISIONS

### 9.1 Phases (each independently shippable)

| Phase | Scope | Touches (verify before editing) |
|-------|-------|--------------------------------|
| **0** | Calibrate: compute reference refinement curve with the demo dataset; add `usershipSince`; unify `self_care_complete(d)` readers | `interfaceEvolution.ts`, `models/user.ts`, `energy.ts`, `goal-understanding.ts` |
| **1** | **Months unlocked** block from Day 1 + Month-1 barebone layout; fix invisible month 1 | `MonthlyPulseWidget.tsx`, `System.tsx` |
| **2** | Month window query + **Chapter job** + `chapters` storage + whitelist new events | `server/utils/memory/` (new `chapter-generator.ts`), `scheduled-jobs.ts`, `routes/api.ts` |
| **3** | Chapter card + Vault UI + Week Thread | new components; reuse `Block`, fade classes |
| **4** | Seals + micro-badges in `badges.ts`; quarter stamps | `badges.ts` |
| **5** | Season Volumes + Year Ceremony + Epigraph | generator + new ceremony component |
| **6** | Demo scrubber `?m=` + `/u` block unlock order | `public-api.ts`, `PublicProfile.tsx` |
| **7** | Ask LOT® AI nav entry (RFI) at M11; wordmark swap at M12 | QI terminal wiring |

Suggested first shipment: **Phase 0 + 1 + 6** — cheap, no LLM cost, and it makes
the *story visible* on the demo immediately.

### 9.2 Metrics (instrument with the new events)

Chapter open rate · Keep/Share rate · Seal rate by month · month-to-month
retention (M3, M6, M12 cliffs) · % users who write a Log entry within 24 h of
opening a Chapter · prompts per user per month (should *fall* after M6).

### 9.3 Risks

| Risk | Mitigation |
|------|-----------|
| Generated Chapter feels generic | Mandatory verbatim user fragment; reject drafts without one |
| Hallucinated personal claims | Evidence-only prompt; M11 user-correction step |
| Sensitive content (health / recovery cohorts) | Safety pass + affirmation style guide (§8.4) + manual review of cohort rules |
| Quiet users feel judged | Carried-seal model; quiet-month template |
| LLM cost/outage at month close | One call/user/month; template fallback; jittered schedule |
| Invisible month 1 / wrong anchor | Phase 0 fixes (`usershipSince`) |
| Demo contradicts live product | Scrubber uses the same components with fixture data |

### 9.4 Open decisions for S-2

1. Demo handling: **Option A (legacy + scrubber)** or B (rebase to M12)? (§7.2)
2. Do Month Seals count toward the existing level/badge totals, or live in a separate display only?
3. Is `LOT® AI` the product wordmark at M12 only, or the global brand?
4. Printed Chapter card / Year Book — in scope for fulfilment? (§5.5)
5. Month-1 lowered Seal gate (MP ≥ 20) — acceptable?
6. Public `/u/…` Memory Story default: opt-in (recommended) or opt-out?

---

## 10. ONE-LINE SUMMARY

> **Calendar opens the door; presence furnishes the room; every month the
> room is compressed into a paragraph the user recognises as themselves — and
> after twelve of them, there is a book, and one sentence that is true.**

```
================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
================================================================================
```
