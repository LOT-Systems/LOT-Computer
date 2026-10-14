<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP — 12-MONTH EVOLUTION

## From a barebone Day 1 to LOT® AI. One sealed Memory per month.

**Class:** DESIGN / PRODUCT ARCHITECTURE (no runtime code changed in this session)
**S-2:** Vadik Marmeladov
**Date:** 2026-10-14
**Status:** PROPOSAL v1 — for S-2 review
**Reference account:** `lot-systems.com/u/machiavelli` (demo, treated as the Month 12 end-state)
**Related docs:** `INTERFACE_EVOLUTION.md` · `MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md` · `LOT-STYLE-GUIDE.md` · `WIDGETS.md` · `MEMORY-ENGINE-WHITE-PAPER.md`

---

## 0. TL;DR

A Usership member should be able to *feel* the year. Three things make it tangible:

1. **A visible clock.** `Months: 3/12`. Twelve segments, one unlocks every month, forever visible.
2. **A sealed Memory every month.** On the monthly anniversary the AI compresses the member's last month (journal entries, morning check-ins, self-care clicks, Memory answers) into **one paragraph**, stamps it with a numbered seal `[III]`, and files it in a growing Memory Book.
3. **An interface that changes shape.** Day 1 is six calm widgets with generous spacing. Month 12 is a dense personal OS with an AI that speaks in the member's own words. Nothing is bought; everything is accumulated.

The compression is the story. By Month 12 the member can hold the whole year in one line:

```
1,447 signals  →  12 sealed paragraphs  →  4 chapters  →  1 portrait  →  1 line
```

---

## 1. What the repo already gives us (scan results, 2026-10-14)

This proposal extends existing machinery rather than inventing parallel systems.

| Asset | Location | What it does today | Gap for the 12-month story |
|-------|----------|-------------------|---------------------------|
| `MonthlyPulseWidget` | `src/client/components/MonthlyPulseWidget.tsx` | Usership-only. Shows a static line per month 1–12 plus "N / 12 months". Dismiss once per month (localStorage). | Messages are generic; no personal content; month computed from `joinedAt` (account creation), not Usership start; no archive of past months. |
| `generateMonthlySummary` | `src/server/utils/monthly-summary.ts` | Builds last-month stats, narrative, forward look, memory story, emailed in the first 3 days of a month. | Not persisted as a browsable archive; not shown in the UI; not tied to a seal or badge. |
| `generateMemoryStory` | `src/server/utils/memory/story-generator.ts` | Condenses **only the last 30 answers** into a narrative. Cached by answer count. | Cannot represent a year. Needs hierarchical compression (month → chapter → year) that carries prior seals forward. |
| Interface Evolution | `src/client/utils/interfaceEvolution.ts`, `stores/evolution.ts` | 7 dimensions, level 1–100, 4 story chapters, feature unlocks, 5 layout densities (breathable → instrument). | Driven by level/achievements, not by time as a Usership member. Two gating systems must be reconciled (see §9). |
| Memory Engine | `docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md` | Eight context sources, virtuous compression cycle, "the machine asks, never chats". | Doctrine is correct and is preserved here. |
| Badges | `src/client/utils/badges.ts`, `docs/badges/*` | 812 badges, glyph families (water `∘ ≈ ≋`, architecture `├─ ╞═╡ ║·║`). | No badge family tied to calendar months of Usership. |
| Demo account | `src/server/routes/public-api.ts` (`machiavelli`) | Hardcoded profile: Legacy tag, streak 1469, 2847 answers, weather station, wallet. | Shows "very old account", not "12 months evolved". No month scrubber. |
| Style guide | `docs/technical/LOT-STYLE-GUIDE.md` | Label-colon blocks, opacity hierarchy, 1400ms fades, periods over symbols, no emojis. | All proposals below obey it. |

**Doctrine kept intact:** the AI never opens a chat. It asks, the member taps, the machine remembers. The 12-month arc changes *how much the AI knows and how it speaks*, never *whether it interrupts*.

---

## 2. The framework: three axes

```
         SIGNAL                  COMPRESSION                 SURFACE
   what the member feeds    what the AI makes of it    what the member sees
   ─────────────────────    ───────────────────────    ────────────────────
   Log / journal entries    Day line   (≤140 chars)    Layout density
   Morning check-ins        Week thread (≤280 chars)   Widget manifest
   Self-care clicks         Month Seal (~90 words)     AI voice stage
   Memory answers           Chapter    (~150 words)    Badges + Seal row
                            Half-year  (~200 words)    Months widget
                            Portrait   (~350 words)    Celebration ritual
                            Epigraph   (≤12 words)
```

- **Signal** is the member's contribution. It is the most important evolutionary variable and is visible to them as the monthly **Fill** score.
- **Compression** is the AI's contribution. Every level is built from the level below *plus the previous seal*, so the story is continuous, not 12 unrelated summaries.
- **Surface** is what makes it tangible. It is a pure function of (Usership month, Fill history).

### 2.1 Two locks: time seals the month, signal fills it

| Lock | Rule | Why |
|------|------|-----|
| **Calendar lock** | Month *n* seals on the n-th monthly anniversary of the Usership start date. Cannot be rushed or bought. | Time is the one thing a competitor cannot copy. It makes `Months: 3/12` honest. |
| **Signal fill** | Each month earns a Fill % from the member's activity. Fill decides the **depth tier** of the seal, not whether it arrives. | Members who miss a week are never locked out or shamed; they get a quieter, honest seal. |

**Fill formula (per month, each term capped at 1.0):**

```
Fill = 0.35 · min(1, journalEntries / 12)
     + 0.30 · min(1, checkInDays    / 20)
     + 0.20 · min(1, selfCareClicks / 24)
     + 0.15 · min(1, memoryAnswers  / 20)
```

| Fill | Seal tier | Seal glyph suffix | Copy register |
|------|-----------|-------------------|---------------|
| < 35% | **Faint** | `[III]·` | "A quiet month. The system kept what it could." |
| 35–69% | **Clear** | `[III]` | Balanced reflection |
| 70–94% | **Vivid** | `[III]+` | Specific quotes and moments |
| ≥ 95% | **Luminous** | `[III]*` | Richest paragraph, quotes the member verbatim |

Targets are intentionally **flat across the year** (about one entry every 2–3 days, a check-in on two of three mornings, almost a self-care click a day). The member never has to escalate; the interface does the escalating.

---

## 3. The Months widget (context-based: "Months unlocked: 3/12")

A permanent Usership widget, present from Day 1.

```
Months:
Months unlocked: 3/12
▮▮▮▯▯▯▯▯▯▯▯▯
Month 4 seals in 9 days.
This month: 72% filled.
```

Label-cycling per the style guide (`Months:` → `Seals:` → `Story:`):

| View | Content |
|------|---------|
| `Months:` | Count, 12-segment bar (reuses `ProgressBars`), days to next seal, current Fill % |
| `Seals:` | Row `[I] [II] [III] ░ ░ ░ ...` — tap a seal to open its paragraph |
| `Story:` | The Memory Book reader (see §5). Scrolls month by month, newest first |

**Context behaviour:** the widget rewrites its own second line from member state — "Month 4 seals in 9 days", "Your quietest month so far is behind you", "Two more entries fill this month". One line, never a nag, no exclamation marks.

**Month 0 (free tier teaser):** a dimmed `Months: 0/12` with "Usership begins the count." No fake data.

---

## 4. The Seal ceremony (month turn)

Replaces the static `MonthlyPulseWidget` message with a real, personal event. Sequence on the day of the anniversary (triggered by the first app open after the seal job runs):

| Step | Time | What the member sees |
|------|------|----------------------|
| 1 | 0.0s | Other widgets dim to 60% opacity (existing opacity hierarchy). |
| 2 | 0.1s | Block fades in at top, 1400ms: label `Month 3:` and the month's fixed **affirmation** (§6). |
| 3 | tap | Reveals the **Seal paragraph** — the AI's compression of last month. |
| 4 | tap | The numeral stamps: `[III]*` and the line `412 signals → 1 paragraph`. |
| 5 | tap | Teaser for what this month unlocked: "Month 3 opens: Planner. Intentions." |
| 6 | dismiss | Existing dismiss phrases ("Onward.", "The system remembers.") then 1400ms fade. |

**Delivery redundancy:** the same Seal goes into the existing monthly email (`monthly-summary.ts` already carries `memoryStory`), so the ritual survives a missed login.

**Never miss a seal:** if the AI call fails, a deterministic template composed from stats ships instead (marked Clear tier at most). The seal is idempotent: re-running the job for the same (user, month) is a no-op.

**Affirmation vs Seal:** the affirmation is *fixed copy* (cheap, brand-controlled, same for everyone). The Seal paragraph is *generated* (personal). Both are shown; the first is the greeting, the second is the gift.

---

## 5. The compression ladder (the focus)

### 5.1 Levels

| Level | Built from | Cadence | Length | Visible to member as |
|-------|-----------|---------|--------|----------------------|
| **L0 Signals** | raw logs, check-ins, self-care, answers | continuous | — | Log widget |
| **L1 Day line** | that day's L0 | nightly (only on active days) | ≤140 chars | `Story:` day dots |
| **L2 Week thread** | 7 day lines + previous week thread | weekly | ≤280 chars | `Story:` week marks |
| **L3 Month Seal** | 4–5 week threads + all month answers + **previous Seal** | monthly | ~70–110 words | Seal ceremony, `Seals:` |
| **L4 Chapter** | 3 Seals + previous Chapter | months 3, 6, 9, 12 | ~150 words | Chapter card + chapter mark |
| **L5 Half-year** | Chapters I–II | month 6 | ~200 words | Narrative widget unlock |
| **L6 Portrait** | Chapters I–IV | month 12 | ~350 words | Year Portrait + LOT® AI reveal |
| **L7 Epigraph** | Portrait | month 12 | ≤12 words | Profile headline |

Each level is **map-reduce with memory**: `Seal(n) = compress(weekThreads(n), answers(n), Seal(n-1))`. Feeding the previous Seal forward is what makes the year read like one continuous life rather than 12 reports.

### 5.2 Visible compression ratio

Every Seal and chapter shows what it compressed. This is the tangible proof that the machine *remembers*:

```
Month 3  ·  104 signals  →  1 paragraph
Chapter I ·  253 signals  →  3 seals  →  1 chapter
Year      · 1,447 signals →  12 seals →  4 chapters  →  1 portrait  →  1 line
```

### 5.3 The one-line-per-month Year (L7 view)

At Month 12 the member can read their year as twelve epigraphs, top to bottom. This is the screenshot-worthy artifact. See §8.4 for Niccolò's.

### 5.4 Voice rules for Seal text

- **Second person** to the member in the private UI ("You began the month…"). The public profile Memory Story stays in the existing third-person/first-person voice already used by `showMemoryStory`. *(Decision D3, §12.)*
- Quote the member verbatim from Luminous/Vivid months (short fragments only, never full entries).
- Name one thing that *changed* from last month. Without a delta it is a summary, not a story.
- End with a **forward hook** that the next month's UI will actually deliver ("Next month you will see this pattern on a calendar.").
- Faint months: never apologise, never moralise. State what was kept.
- No emojis. Periods, not symbols. Matches `LOT-STYLE-GUIDE.md`.

### 5.5 Data model (proposal)

Stored under `user.metadata.usership` (JSON; no schema migration required):

```ts
type UsershipYear = {
  startedAt: string                 // ISO; set when Usership tag is first granted
  months: Record<number, {          // 1..12
    sealedAt: string
    signals: { entries: number; checkIns: number; selfCare: number; answers: number }
    fill: number                    // 0..1
    tier: 'faint' | 'clear' | 'vivid' | 'luminous'
    paragraph: string               // L3
    epigraph: string                // ≤12 words, feeds L7
    badgeIds: string[]
    affirmationId: number
    engine: 'together-llama-3.3-70b' | 'template'  // provenance; template = fallback
  }>
  chapters: Record<1|2|3|4, { sealedAt: string; text: string }>
  halfYear?: { sealedAt: string; text: string }
  portrait?: { sealedAt: string; text: string; epigraph: string }
  ui: { airy?: boolean }            // member override of density floor
}
```

Privacy is unchanged: the story lives in LOT's database; AI providers only execute the prompt and never retain it.

---

## 6. The 12-month map

Quarter names echo the existing theme systems: **I Foundation · II Structure · III Current · IV Portrait.** They map 1:1 onto the four story-arc `chapter` values already in `EvolutionState`.

### 6.0 Overview

| # | Month | Chapter | AI stage | New on screen | Density floor | Badge |
|---|-------|---------|----------|---------------|---------------|-------|
| 1 | **Signal** | I Foundation | Listens | Six core widgets, Months widget | breathable | `[I]` |
| 2 | **Pattern** | I | Notices | Mood history, week threads | breathable | `[II]` |
| 3 | **Rhythm** | I | Remembers | Planner, Intentions, "You said" callbacks | comfortable | `[III]` + Chapter I |
| 4 | **Texture** | II Structure | Connects | Pattern Insights, Calendar | comfortable | `[IV]` |
| 5 | **Depth** | II | Anticipates | Goal Journey, Memory-powered Recipes | compact | `[V]` |
| 6 | **Mirror** | II | Reflects | Narrative Reflection, Evolution widget, Half-year | compact | `[VI]` + Chapter II |
| 7 | **Friction** | III Current | Challenges | Energy / Quantum State | compact | `[VII]` |
| 8 | **Craft** | III | Guides | Interventions (proactive routines) | dense | `[VIII]` |
| 9 | **Current** | III | Accompanies | Correlated Indexes, Awareness | dense | `[IX]` + Chapter III |
| 10 | **Voice** | IV Portrait | Speaks in your words | Public profile + QR, story sharing | dense | `[X]` |
| 11 | **Authorship** | IV | Drafts, you edit | Story editor (keep / cut moments) | dense | `[XI]` |
| 12 | **Portrait** | IV | **LOT® AI** | Year Portrait, label becomes `LOT® AI:` | dense | `[XII]` + Chapter IV + Year |

`instrument` density (the Bloomberg-grade tier) is deliberately **withheld until Year 2** so the second year has a reward of its own.

### 6.1 Month-by-month specification

Each month defines: **Theme · Interface · AI voice · Memory deliverable · Badges · Affirmation · Retention beat.**

#### Month 1 — SIGNAL  *(Chapter I · Foundation)*
- **Theme:** Day 1 is barebone on purpose. The first month is about giving the system something to hear.
- **Interface:** Breathable density. Six widgets: `Time`, `Memory`, `Self-care`, `Check-in` (morning), `Log`, `Months`. No charts, no scores, no badges visible except the empty seal row.
- **AI voice:** *Listens.* Only asks Memory questions. Never references past answers (it has none).
- **Memory deliverable:** Day lines begin quietly. At the anniversary: **Seal `[I]`** — a paragraph built mainly from the *first* answers and the first journal entry. This is the seed of the whole book.
- **Badges:** `us_seal_01` (Month seal), `us_first_entry`, `us_first_checkin`, `us_first_selfcare`.
- **Affirmation:** "The first month. The system is beginning to know you." *(kept from existing copy)*
- **Retention beat:** Day-1 `Months: 0/12 — Month 1 seals in 30 days` creates a visible goal immediately. Day 7: first Week thread appears ("One week. Here is what it heard."). This is the first proof of compression and the most important churn defence.

#### Month 2 — PATTERN
- **Theme:** The first patterns. "You check in on mornings after you journal."
- **Interface:** Breathable. Mood widget gains a `History:` view. Week threads become visible as marks in `Story:`.
- **AI voice:** *Notices.* First time it names a pattern, tentatively ("It looks like…").
- **Memory deliverable:** **Seal `[II]`** — leads with the first *delta* from Month 1.
- **Badges:** `us_seal_02`, `us_streak_07` (7-day check-in streak), `us_entries_10`.
- **Affirmation:** "Two months in. Patterns are starting to form."
- **Retention beat:** *Novelty-cliff defence.* Month 2 is when free trials die. The first named pattern is the hook that the product is not a diary.

#### Month 3 — RHYTHM  *(closes Chapter I)*
- **Theme:** Habit becomes visible as a rhythm.
- **Interface:** Density floor → **comfortable**. Planner and Intentions widgets appear. The first **"You said"** callback: Memory questions begin quoting the member's earlier answers.
- **AI voice:** *Remembers.* Explicitly references something from Month 1 for the first time — the single most powerful "it knows me" moment of the quarter.
- **Memory deliverable:** **Seal `[III]`** **and Chapter I — Foundation** (L4): three Seals fused into one ~150-word chapter with its own mark.
- **Badges:** `us_seal_03`, `us_chapter_1`, `us_checkins_30`.
- **Affirmation:** "Three months. A quarter of the year, sealed."
- **Retention beat:** The first **Quarter Card**: `Chapter I · 253 signals → 3 seals → 1 chapter`. Share-worthy.

#### Month 4 — TEXTURE  *(Chapter II · Structure)*
- **Theme:** Detail. The system starts to understand *how* you do things, not just what.
- **Interface:** Pattern Insights and Calendar widgets appear. Self-care widget starts suggesting an order for the day.
- **AI voice:** *Connects.* Links two unrelated signals ("Your best mornings follow your longest evenings of journaling").
- **Memory deliverable:** **Seal `[IV]`**, written with the opening line "Chapter II begins."
- **Badges:** `us_seal_04`, `us_entries_50`.
- **Affirmation:** "Four months. The details are where you live."
- **Retention beat:** *Plateau defence #1.* New widgets arrive exactly when novelty fades.

#### Month 5 — DEPTH
- **Theme:** The shift from tracking to wanting.
- **Interface:** Density floor → **compact**. Goal Journey widget; Recipe suggestions powered by Memory preferences ("Since you prefer green loose-leaf…").
- **AI voice:** *Anticipates.* Memory questions now arrive at the hour the member usually answers.
- **Memory deliverable:** **Seal `[V]`**.
- **Badges:** `us_seal_05`, `us_goal_first`, `us_selfcare_100`.
- **Affirmation:** "Five months. Consistency is its own reward." *(kept)*
- **Retention beat:** *Plateau defence #2.* Compaction is the first time the layout visibly tightens — the member sees the OS "grow up".

#### Month 6 — MIRROR  *(closes Chapter II)*
- **Theme:** The half-year. The system holds up a mirror.
- **Interface:** **Narrative Reflection** and the **Evolution widget** (7 dimensions) unlock. The member can finally *see* their own growth chart.
- **AI voice:** *Reflects.* Shows the Month 1 Seal next to the Month 6 Seal under "Then / Now."
- **Memory deliverable:** **Seal `[VI]`**, **Chapter II — Structure**, and the **Half-year reflection** (L5, ~200 words).
- **Badges:** `us_seal_06`, `us_chapter_2`, `us_half_year`.
- **Affirmation:** "Six months. The journey is half-declared." *(kept)*
- **Retention beat:** The **Then / Now** card — the strongest renewal moment of the year (annual-plan conversion point).

#### Month 7 — FRICTION  *(Chapter III · Current)*
- **Theme:** Honesty. Real life interrupts; the dip is *expected* and designed for.
- **Interface:** Energy Capacitor and Quantum State widgets appear. If Fill drops, the Months widget softens rather than scolds.
- **AI voice:** *Challenges, gently.* Surfaces a contradiction in the member's own words ("You wrote 'rest' twice and logged none.").
- **Memory deliverable:** **Seal `[VII]`**. If the month was quiet, the Seal is explicit that quiet is data.
- **Badges:** `us_seal_07`, `us_comeback` (returns to ≥3 check-ins/week after a Faint month).
- **Affirmation:** "Seven months in. The system has been listening." *(kept)*
- **Retention beat:** *The mid-year dip.* Historically the highest-risk month. The Faint-tier copy and the `us_comeback` badge convert a lapse into a story beat.

#### Month 8 — CRAFT
- **Theme:** The member begins editing their own routine.
- **Interface:** Density floor → **dense**. Interventions widget: the AI proposes one tiny routine change per week; the member taps keep or skip.
- **AI voice:** *Guides.* Suggestions, always optional, always one tap.
- **Memory deliverable:** **Seal `[VIII]`** with a "what you changed" line.
- **Badges:** `us_seal_08`, `us_routine_kept`.
- **Affirmation:** "Eight months. Rare air." *(kept)*
- **Retention beat:** Ownership. The member is now co-authoring the system.

#### Month 9 — CURRENT  *(closes Chapter III)*
- **Theme:** Flow. Signals and outcomes visibly correlate.
- **Interface:** Correlated Indexes and Awareness Dashboard unlock.
- **AI voice:** *Accompanies.* Speaks in "we" for the first time, once, in the Seal.
- **Memory deliverable:** **Seal `[IX]`** and **Chapter III — Current**.
- **Badges:** `us_seal_09`, `us_chapter_3`.
- **Affirmation:** "Nine months. The self-care practice is a habit now." *(kept)*
- **Retention beat:** Three-quarters mark. The Chapter III card reads `Chapter III · 334 signals → 3 seals → 1 chapter` (Niccolò: months 7–9), and the Months bar is visibly most of the way full.

#### Month 10 — VOICE  *(Chapter IV · Portrait)*
- **Theme:** The member's own words become the product.
- **Interface:** Public profile and QR enable; the member chooses which Seal paragraphs appear under `showMemoryStory`.
- **AI voice:** *Speaks in your words.* Seals now quote the member more than they paraphrase.
- **Memory deliverable:** **Seal `[X]`**.
- **Badges:** `us_seal_10`, `us_profile_live`, `us_entries_250` (Niccolò crosses 250 cumulative entries here).
- **Affirmation:** "Ten months. Almost there." *(kept)*
- **Retention beat:** Social proof — the member shows their story to someone. The profile page becomes the acquisition loop.

#### Month 11 — AUTHORSHIP
- **Theme:** The member edits the book.
- **Interface:** **Story editor** — each Seal is shown with its sourced moments; the member can mark *keep*, *soften*, *cut*. The AI re-compresses accordingly.
- **AI voice:** *Drafts; you decide.*
- **Memory deliverable:** **Seal `[XI]`** plus the **draft Portrait** shown early (read-only teaser).
- **Badges:** `us_seal_11`, `us_editor`.
- **Affirmation:** "Eleven months. One more." *(kept)*
- **Retention beat:** Sunk-cost of the good kind: the member has *authored* something they will not abandon before the final page.

#### Month 12 — PORTRAIT  *(closes Chapter IV · the year)*
- **Theme:** The year, compressed into one portrait and one line.
- **Interface:** The Memory widget's label becomes **`LOT® AI:`**. The Months bar completes `12/12`. The Seal row is full. All 12 epigraphs read as a poem. Density stays **dense**; `instrument` is announced for Year 2.
- **AI voice:** **LOT® AI.** Names itself for the first and only time and offers the Portrait.
- **Memory deliverable:** **Seal `[XII]`**, **Chapter IV — Portrait**, **Year Portrait** (L6, ~350 words) and **Epigraph** (L7). A downloadable **Memory Book** (PDF) of all 12 Seals + Portrait.
- **Badges:** `us_seal_12`, `us_chapter_4`, `us_year_one` *(the Year badge — rarest in the family)*.
- **Affirmation:** "One year with LOT. The portrait is complete — and still evolving." *(kept)*
- **Retention beat:** Renewal. The Memory Book is something the member *owns*; leaving feels like leaving a book half-written, and Year 2 opens with `instrument`.

---

## 7. Interface evolution layers (summary)

| Layer | Months 1–2 | 3–4 | 5–7 | 8–12 | Year 2+ |
|-------|-----------|-----|-----|------|---------|
| Layout density floor | breathable | comfortable | compact | dense | **instrument** |
| Widget count (visible) | 6 | 9–11 | 13–15 | 16–19 | 20+ |
| Months widget | bar + countdown | + `Seals:` | + `Story:` | + Then/Now | + Year compare |
| AI language | questions only | questions + callbacks | + anticipation | + guidance | + authorship |
| Seal row | 1–2 filled | 3–4 + chapter mark | 5–7 + 2 chapters | 8–12 + 4 chapters | Year 2 row opens |
| Visual refinement | base | +opacity clarity | +subtle glow | full | full |

**Density floor** is implemented as a minimum on `visualRefinement` from `interfaceEvolution.ts`:

| Month | `visualRefinement` floor | Resulting density (existing thresholds) |
|-------|-------------------------|------------------------------------------|
| 1–2 | 0.00 | breathable |
| 3–4 | 0.15 | comfortable |
| 5–7 | 0.35 | compact |
| 8–12 | 0.55 | dense |
| 13+ | 0.75 | instrument |

A Settings toggle, **"Keep it airy"** (`ui.airy`), lets any member opt out of the tightening. Evolution must feel earned, not imposed.

### 7.1 Day 1 wireframe — barebone

```
Time:      Tue 14 Oct · 08:12 · Florence 14°C

Months:    Months unlocked: 0/12
           ▯▯▯▯▯▯▯▯▯▯▯▯
           Month 1 seals in 30 days.

Check-in:  How are you this morning?
           [Calm] [Tired] [Wired] [Low]

Self-care: Drink a glass of water.
           [Done] [Skip]

Memory:    What is your morning beverage?
           [Tea] [Coffee] [Water] [Nothing]

Log:       _
```

Plenty of air. No numbers other than the count. Nothing to decode.

### 7.2 Month 6 wireframe — Mirror

```
Months:    Months unlocked: 6/12      [I][II][III][IV][V][VI] ░ ░ ░ ░ ░ ░
           ▮▮▮▮▮▮▯▯▯▯▯▯              Chapters: I Foundation · II Structure

Then/Now:  [I]  "You answered in single words."
           [VI] "You write whole paragraphs before 9am."

Evolution: Exploration ▮▮▮▮▮▮▮▯▯▯  Consistency ▮▮▮▮▮▮▯▯▯▯  Depth ▮▮▮▮▯▯▯▯▯▯ ...
Planner · Intentions · Pattern Insights · Calendar · Goal Journey · Recipe
```

### 7.3 Month 12 wireframe — LOT® AI

```
LOT® AI:   Months unlocked: 12/12        [I][II][III][IV][V][VI][VII][VIII][IX][X][XI][XII]
           ▮▮▮▮▮▮▮▮▮▮▮▮                  I Foundation · II Structure · III Current · IV Portrait
           "A strategist who learned to rest on schedule."          ← epigraph (L7)

Portrait:  <350-word year portrait, tap to open the Memory Book>
Seals:     12 sealed · 1,447 signals → 12 → 4 → 1 → 1
Next:      Year 2 opens: Instrument density.
```

---

## 8. Reference account: `/u/machiavelli` as the Month 12 state

### 8.1 Reconciling the existing demo

The demo today asserts `streak: 1469`, `answerCount: 2847`, `noteCount: 1469`, `citizenSince: 'June 1469'`, Legacy tag, weather station and wallet. That is a **Legacy** (multi-year) story. It is charming lore (1469 is Machiavelli's birth year) but it does not tell the *12-month* story.

**Recommendation (Decision D1, §12):** keep the Legacy lore fields, and add a new **Usership Year** band at the top of the profile that is the member-facing 12-month state, with a **month scrubber** (`?m=1…12`, default 12). This makes the demo account do double duty: Month 12 for prospects who want to see the destination, and Months 1–11 for those who want to see the journey.

### 8.2 What the scrubber shows

| Scrubber | Shown to a visitor |
|----------|--------------------|
| `m=1` | The barebone Day-1 layout, `Months: 1/12`, Seal row `[I]` only |
| `m=3` | Comfortable density, Chapter I mark, first "You said" callback |
| `m=6` | Compact density, Then/Now card, Half-year reflection |
| `m=9` | Dense, Chapter III, Correlated Indexes |
| `m=12` | Full OS, `LOT® AI:` label, Year Portrait, 12 epigraphs |

The scrubber is read-only and renders from a static fixture; no real data is touched.

### 8.3 Niccolò's signal curve (Usership year, calibrated)

Counts per month. Month 7 is **deliberately a quiet month** (travel to the Republic's frontier) — an honest dip makes the profile credible and demonstrates the Clear-tier copy and `us_comeback`.

| Month | Entries | Check-in days | Self-care | Answers | Signals | Fill | Tier | Cumulative signals |
|------:|--------:|--------------:|----------:|--------:|--------:|-----:|------|-------------------:|
| 1 | 9 | 14 | 21 | 17 | 61 | 77% | Vivid | 61 |
| 2 | 16 | 21 | 29 | 22 | 88 | 100% | Luminous | 149 |
| 3 | 22 | 24 | 34 | 24 | 104 | 100% | Luminous | 253 |
| 4 | 27 | 26 | 38 | 25 | 116 | 100% | Luminous | 369 |
| 5 | 31 | 27 | 41 | 25 | 124 | 100% | Luminous | 493 |
| 6 | 35 | 28 | 44 | 26 | 133 | 100% | Luminous | 626 |
| 7 | 6 | 11 | 14 | 8 | 39 | 52% | **Clear** | 665 |
| 8 | 41 | 29 | 48 | 27 | 145 | 100% | Luminous | 810 |
| 9 | 44 | 29 | 50 | 27 | 150 | 100% | Luminous | 960 |
| 10 | 47 | 30 | 52 | 28 | 157 | 100% | Luminous | 1,117 |
| 11 | 50 | 30 | 54 | 28 | 162 | 100% | Luminous | 1,279 |
| 12 | 53 | 30 | 56 | 29 | 168 | 100% | Luminous | **1,447** |

Year totals: **381 journal entries · 299 check-in days · 481 self-care clicks · 286 Memory answers.** *(Fill uses the §2.1 formula with each term capped at 1.0; Month 1 = 0.35·0.75 + 0.30·0.70 + 0.20·0.875 + 0.15·0.85 = 77%.)*

### 8.4 Niccolò's twelve epigraphs (the Year in 12 lines)

| # | Epigraph |
|---|----------|
| I | Learned to answer before the day answered for him. |
| II | Noticed he writes best when the room is cold. |
| III | The morning became a habit instead of a decision. |
| IV | Began to see which evenings cost him the next day. |
| V | Stopped counting tasks; started choosing them. |
| VI | Wrote in paragraphs. Used to write in orders. |
| VII | Went quiet. The quiet was information. |
| VIII | Changed one habit a week and kept three. |
| IX | Sleep, ink and temper began to move together. |
| X | Heard his own phrases come back, and agreed. |
| XI | Cut the flattering lines from his own story. |
| XII | A strategist who learned to rest on schedule. |

### 8.5 Sample sealed paragraphs (demo copy)

These are the proposed **fixture texts** for the demo's `memoryStory` seals. Written in the second person, ~70–110 words, with a delta and a forward hook.

**Seal [I] · Vivid · 61 signals → 1 paragraph**
> You began the month answering in single words: tea, early, quiet. By the second week you were writing sentences. The first entry you kept was about the courtyard before the bells, and it set the tone for everything after: you are someone who needs the day to be observed before it is lived. Fourteen mornings you checked in; the three you skipped were the three you skipped writing. Next month the system will start showing you what you do on the mornings that go well.

**Seal [III] · Luminous · 104 signals → 1 paragraph**
> You said, in month one, that you read while the tea steeps. This month you did it nineteen times and logged every one. It has stopped being a preference and become a hinge: the days that begin with the page end with a clean log. You kept your planner two weeks in a row, which you told yourself you never would. The quarter closes with a shape: a morning ritual, an evening review, and a gap on Thursdays. Chapter II will start with the gap.

**Seal [VII] · Clear · 39 signals → 1 paragraph**
> A quiet month. You checked in eleven times and wrote six entries, three of them from the road. The system kept what it could: you wrote "rest" twice and logged none, and on the one morning you were home you did four self-care actions in a row. That is not a failure; it is a pattern with a cause. Nothing about the quiet month changed what you answered. When you are back, the Interventions widget will offer one small thing a week, not twelve.

**Seal [XII] · Luminous · 168 signals → 1 paragraph**
> Twelve months ago you answered "tea" and nothing else. This month you wrote fifty-three entries, checked in every morning, and edited your own story by cutting the flattering lines. The year's shape is clear: you started as a man who observes, became a man who plans, and ended as a man who rests deliberately. Your quietest month taught the system the most. Here is the book, in your words, and the year in one line. Year two opens at a tighter focus.

**Year Portrait · Epigraph:** *A strategist who learned to rest on schedule.* · **1,447 signals → 12 seals → 4 chapters → 1 portrait → 1 line**

*(The remaining eight Seals are generated by the same pipeline from the §8.3 curve; they are not hand-written here so the demo stays honest about what the engine produces.)*

### 8.6 Profile fields that change for the demo (when implemented)

| Field (in `public-api.ts` machiavelli block) | Today | Proposal |
|----------------------------------------------|-------|----------|
| New `usershipYear` | — | `{ monthsUnlocked: 12, seals: [12], chapters: [4], portrait, epigraph, curve }` |
| `?m=` query handling | — | Returns the state for month *m* from the fixture |
| `psychologicalProfile.answerCount` | 2847 | Keep as Legacy lore **or** switch to 286 *(Decision D1)* |
| `boardProfile.memoriesCompiled` | 2847 | Keep **or** 286 *(D1)* |
| `boardProfile.activity.journalEntries` | 1469 | Keep **or** 381 *(D1)* |
| `showMemoryStory` | true | true — shows Portrait + epigraph |

---

## 9. Reconciling with the existing Interface Evolution gates

There are now two drivers of "what is unlocked":

1. **Level-based** (existing): `Advanced Memory`, `Planner Templates`, `Mood Patterns`, `Export Data`, … from `getFeatureUnlocks`.
2. **Month-based** (this proposal): the §6.0 widget manifest.

**Rule: a Usership member sees the *union*.** The month manifest is a *floor*: a paid member never opens the app and finds a widget their month promised locked behind a level they have not reached. The level system still gates *depth inside* widgets and the free tier. Implementation: a pure `getUsershipUnlocks(month): FeatureUnlocks` merged with `getFeatureUnlocks(state)` using logical OR, plus the `visualRefinement` floor from §7.

---

## 10. Badge family: "Usership Year" (32 badges)

Glyph convention: `[ROMAN]` + tier suffix (`·` faint, none clear, `+` vivid, `*` luminous). Chapter marks use the existing theme glyphs: I `∘`, II `≈`, III `≋`, IV `║·║`.

| Group | Count | IDs |
|-------|------:|-----|
| **Month Seals** | 12 | `us_seal_01` … `us_seal_12` |
| **Chapter marks** | 4 | `us_chapter_1` (Foundation `∘`), `us_chapter_2` (Structure `≈`), `us_chapter_3` (Current `≋`), `us_chapter_4` (Portrait `║·║`) |
| **Year** | 2 | `us_half_year` (Month 6), `us_year_one` (Month 12, rarest) |
| **Signal firsts** | 3 | `us_first_entry`, `us_first_checkin`, `us_first_selfcare` |
| **Signal ladders** | 8 | `us_entries_10/50/250`, `us_streak_07`, `us_checkins_30`, `us_selfcare_100`, `us_goal_first`, `us_routine_kept` |
| **Narrative** | 3 | `us_comeback`, `us_profile_live`, `us_editor` |

Total 32 (12 + 4 + 2 + 3 + 8 + 3). No IDs collide with the existing 812 (`us_` prefix verified absent in `badges.ts`). Month Seals are **calendar-awarded** (cannot be missed); all other groups are **signal-awarded**.

---

## 11. Implementation roadmap

Phased so each phase ships value alone and is safe behind the Usership tag.

| Phase | Deliverable | Files (expected) | Risk |
|------:|-------------|------------------|------|
| **0** | This document + session report | `docs/technical/USERSHIP-12-MONTH-EVOLUTION.md`, `docs/LOT-SR-20261014-01.md`, ledger | none |
| **1** | `usership.startedAt` + `useUsershipMonth()` hook; **Months widget** (`Months:` view only) | `src/shared/types`, `src/client/hooks`, new `MonthsWidget.tsx`, `System.tsx` | low |
| **2** | **Seal job**: nightly L1 day lines, weekly L2, monthly L3 with fallback template; persist under `metadata.usership` | `scheduled-jobs.ts`, `utils/usership-seal.ts`, extend `monthly-summary.ts` | medium (AI cost, idempotency) |
| **3** | **Seal ceremony**: evolve `MonthlyPulseWidget` to read the archive; `Seals:` and `Story:` views | `MonthlyPulseWidget.tsx`, `MonthsWidget.tsx` | low |
| **4** | **Month manifest** + density floors + "Keep it airy" | `interfaceEvolution.ts`, `stores/evolution.ts`, `Settings.tsx` | medium (layout regressions) |
| **5** | **Badges** (32) + award logic | `badges.ts`, codex doc | low |
| **6** | **Chapters, Half-year, Portrait, LOT® AI label**, Memory Book PDF | `usership-seal.ts`, new PDF script | medium |
| **7** | **Demo scrubber** on `/u/machiavelli` from static fixture | `public-api.ts`, `PublicProfile.tsx` | low |

**Cost note:** one L3 call per Usership member per month, one L2 per week, one L4 per quarter — roughly 12 + 48 + 4 + 2 calls a year per member on the existing 70B model. L1 day lines can be deterministic templates.

**Tests that matter:** seal idempotency; Faint-month fallback; month boundary on 29–31 day months (use anniversary-day clamp, e.g. start on the 31st seals on the last day of shorter months); timezone of the member's `context.timeZone` for the seal moment; the union rule in §9.

**Metrics to watch:** Seal open rate; Fill distribution per month; Month 2 and Month 7 retention; share rate of Chapter cards; Month 11 editor usage; Year 1 → Year 2 renewal.

---

## 12. Decisions needed from S-2

| # | Decision | Recommendation |
|---|----------|----------------|
| **D1** | Demo account: keep Legacy lore (1469 / 2847) and add a Usership Year band, or rescale to the 12-month numbers? | **Keep lore + add band + scrubber.** Both stories stay true. |
| **D2** | Month clock origin: account `joinedAt` (what the widget uses today) or a new `usership.startedAt`? | **New `startedAt`.** Paid-tier month 1 must begin at purchase, not sign-up. |
| **D3** | Seal voice: second person (private) vs the existing third-person story voice? | **Second person in the app; third person on the public profile.** |
| **D4** | Should Month 12 be the only place the name "LOT® AI" appears? | **Yes.** The name is the reward; use it nowhere earlier. |
| **D5** | Should signal Fill ever gate the *arrival* of a month? | **No.** Fill gates depth, not arrival. Never lock a paying member out. |
| **D6** | Withhold `instrument` density until Year 2? | **Yes.** Gives Year 2 its own unlock. |

---

## 13. Why this works (one paragraph)

Retention in self-care products dies at the novelty cliff (month 2), the plateau (months 4–5) and the mid-year dip (month 7). Each of those months in this map has a specific counter-move: the first named pattern, a fresh widget, and a dip that is turned into a story beat with its own badge. Meanwhile the compression ladder turns every month of effort into something that gets *denser and more precious* the longer the member stays — which is exactly the promise of the Memory Engine: not a record of what you did, but a book that knows you.

---

*LOT SYSTEMS CORPORATION · Made in the USA · S-2 Vadik Marmeladov*
