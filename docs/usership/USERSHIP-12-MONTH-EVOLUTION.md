<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP · 12-MONTH EVOLUTION → LOT® AI

**Class:** DESIGN SPEC / BRAINSTORM · **S-2:** Vadik Marmeladov
**Session date:** 2026-10-26 · **Branch:** `claude/elegant-mendel-j65q4y`
**Focus:** tangibility of the compressed **Memory Story** delivery across 12 months
**Status:** PROPOSAL. No product code changed this session. Section 9 lists what to build.

> Day 1 is a barebone terminal with one question. Month 12 is a personal OS
> that finishes your sentences. The user must be able to point at any month
> and say what changed.

---

## 0. Scan & read log (framework steps 1–2)

| Step | Result |
|------|--------|
| Repo scan | `LOT-Computer` @ `98971f2` (Badge Codex v32, 812 badges, Wiki v87). Stack: Fastify + Sequelize + React/nanostores. |
| MDs read | `README.md`, `docs/README.md`, `technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md`, `technical/WIDGETS.md`, `technical/LOT-STYLE-GUIDE.md`, `corporate/LOT-FEATURE-INVENTORY-2026.md`, `wiki/LOT-WIKI-v87.md` (Citizen Index), `badges/…CODEX_v31.md` (tiers). |
| Code read | `MonthlyPulseWidget.tsx`, `SubscribeWidget.tsx`, `InterfaceEvolutionWidget.tsx`, `NarrativeWidget.tsx`, `utils/interfaceEvolution.ts`, `server/utils/monthly-summary.ts`, `server/utils/memory.ts` (Usership gating), `routes/public-api.ts` (demo account). |
| Not done | I did **not** load the live page `lot-systems.com/u/machiavelli`. The demo is derived from its server source (`public-api.ts`, hardcoded, tags `RND · Usership · Legacy`, Florence, `showMemoryStory: true`). Verify visually before building. |

### What already exists (we extend it, we do not restart)

| Asset | Where | Reuse |
|-------|-------|-------|
| Month counter, 12 one-liners, "N / 12 months", fade + dismiss phrases | `MonthlyPulseWidget.tsx` | Becomes the **Month Seal** ceremony (§5). Month = `now.diff(joinedAt,'month')`, Usership-gated, dismiss stored in `localStorage` per user/month. |
| 5 layout densities `breathable → comfortable → compact → dense → instrument`, driven by `visualRefinement` | `interfaceEvolution.ts` | The **visual spine** of the 12 months (§3). |
| Feature unlock gates (`customThemes` L5, `widgetArrange` L10, `intentionHistory` L15, `exportData` L25, `narrativeReflection` depth≥.66 & L30 …) | `getFeatureUnlocks` | Month-to-feature mapping (§4). |
| Citizen Index, 6 stages: Observer, Participant (7d), Contributor (30d), Collaborator (90d), Synthesizer (180d), Elite (365d) | Wiki v87 | **Quarter boundaries**: 30 / 90 / 180 / 365 already land on M1 / M3 / M6 / M12. |
| Memory Engine thresholds: archetype at 3+ answers, trauma-informed layer at 10+ logs, back-references at 30 answers, depth ladder Behavior → Motivation → Values → Soul | Compression Architecture §2, §5, §7 | The **content spine** of the story (§2). |
| Usership gets AI-generated questions (others get static) | `memory.ts:122`, `api.ts:2075` | Usership is already "the AI tier". We make that visible. |
| Monthly email summary (`MonthlySummary`: presence, energy, patterns, growth, `narrative`, `forwardLook`, `memoryStory`) | `monthly-summary.ts` | **Source data for every Chapter.** The email and the in-app chapter must be the same text. |
| Public Memory Story block (`showMemoryStory`) | `PublicProfile.tsx:356` | The demo's shop window; shows the Volume (§6). |
| Pricing: R&D $15, Usership $99 | `SubscribeWidget.tsx` | Month 12 is the renewal moment (§8). |

**Gap:** the 12 months exist as a counter and a sentence. Nothing *changes* on screen, and no month produces a compressed artifact the user keeps. That is the whole brief.

---

## 1. Design doctrine

1. **Presence is the currency, the calendar is the clock.** A month *unlocks* on the calendar date; its **Seal quality** (Bronze → Onyx) reflects presence: Log entries, morning check-ins, self-care clicks. Nobody is locked out for a bad month.
2. **Compression is the product.** 30 days of signals become **one paragraph**. 3 paragraphs become **one Act**. 12 become **one Volume** of three sentences. The user feels the story getting *shorter and truer*, not longer.
3. **The machine asks, the machine remembers.** (Memory Engine doctrine.) The AI never opens a chat box. It shows up as better questions, a quieter UI, and once a month, a paragraph.
4. **Subtraction as reward.** LOT style is minimalist. Evolution means *density and precision*, not decoration. Early UI is airy; late UI is an instrument. No emojis, periods over symbols (Style Guide).
5. **Tangible = visible, countable, collectible, shareable.** Every month leaves four things: a changed layout, a badge, a paragraph, a number.
6. **Compassion clause.** Low months get a *Quiet Chapter* (shorter, gentler, trauma-informed tone from Memory Engine Source 8). Never a streak-loss shaming screen. Evolution is irreversible (Citizen Index rule).

---

## 2. The Compression Ladder (the core mechanic)

```
 SIGNALS            raw: logs, check-ins, self-care clicks, Q&A taps
    │  daily        ~ 40–120 events/day
    ▼
 ANSWERS            Memory Engine Q&A pairs, traits, archetype
    │  weekly       "Week line"  — 1 sentence, shown in Log footer
    ▼
 CHAPTER            1 per month — ONE paragraph (≈ 60–90 words)   ← the monthly delivery
    │  quarterly
    ▼
 ACT                1 per quarter — 3 sentences + archetype delta
    │  yearly
    ▼
 VOLUME             1 per year — 3 sentences + one-line thesis    ← what machiavelli's page shows
```

| Level | Cadence | Length | Input | Where it lives | Keepsake |
|-------|---------|--------|-------|----------------|----------|
| Week line | Sun | 1 sentence | 7 days of signals | Log footer, Memory widget | none (ephemeral) |
| **Chapter** | Month turn | 1 paragraph | `MonthlySummary` + last 30 Q&A + month's journal excerpts | Memory Chapter widget, email, Story archive | Month Seal badge |
| Act | M3 / M6 / M9 / M12 | 3 sentences | 3 Chapters | Act card, public profile | Quarter badge |
| **Volume** | M12 | 3 sentences + thesis | 4 Acts | Public Memory Story, PDF/print | Onyx Year badge |

**Chapter template** (stable structure so the user learns to read it):

```
CHAPTER 07 — "<title, 2–4 words>"
<sentence 1: what you did>        (presence: entries / check-ins / care)
<sentence 2: what it revealed>    (pattern or trait, cites a specific prior answer)
<sentence 3: what changed vs last month>  (delta, never absolute)
<sentence 4: one thing to carry forward>  (forwardLook)
```

Rules: always cites one concrete user choice ("you chose loose-leaf green again"), always includes one delta, never more than one number, never diagnoses. Generated server-side with the existing `memoryStory` + `forwardLook` fields; the engine keeps data in the user's DB (README privacy promise).

---

## 3. The visual spine: one UI, twelve states

Reuse `LayoutDensity` and add a **Month Skin** layer (accent opacity, grid, glow from `VisualEvolutionEffects`). Density is driven by `visualRefinement`, so heavy users advance faster and quiet users stay airy longer: both are legitimate.

| Phase | Months | Density | Feel | Header tag |
|-------|--------|---------|------|------------|
| **I. Seed** | 1–2 | breathable | Journal. One question, huge whitespace. | `OBSERVER` |
| **II. Rhythm** | 3–4 | comfortable | Stacks begin to form. | `PARTICIPANT → CONTRIBUTOR` |
| **III. Pattern** | 5–7 | compact | Dashboard clarity. Patterns surface. | `CONTRIBUTOR` |
| **IV. Voice** | 8–10 | dense | The AI speaks first, in short lines. | `COLLABORATOR → SYNTHESIZER` |
| **V. Instrument** | 11–12 | instrument | Bloomberg-grade cockpit. Every pixel earned. | `SYNTHESIZER → ELITE` |

A thin **Month Rail** under the clock shows `■■■□□□□□□□□□` (one cell per month). It is the single constant element; everything else morphs around it.

---

## 4. Month-by-month map

Legend. **UI**: what visibly changes. **AI**: what the Memory Engine does differently. **Widget**: new/changed surface. **Badge**: Month Seal + milestone. **Gate**: soft presence target for full-quality Seal (not a lock).

### PHASE I — SEED (breathable)

#### M0 · Day 1 (paid tier, barebone)
- **UI:** Clock, one Memory question, one Log field, Month Rail `□□□□□□□□□□□□`. Label `Usership:` with a single line, "Day 1. The system does not know you yet."
- **AI:** First-question mode (open, welcoming). Static-feeling, no back-references.
- **Widget:** *Months unlocked: 0/12* (Ledger, §5.2).
- **Badge:** `usership_day_one` (Bronze). Welcome affirmation: "Begin anywhere."
- **Gate:** none.

#### M1 · "First Light"
- **UI:** Month Rail fills 1 cell. Custom themes unlock (L5). Self-care buttons appear in the morning slot. First **Week line** at the Log footer.
- **AI:** Archetype activates (3+ answers). Questions begin with "Since you said…".
- **Chapter 01** delivered on Day 30: 3 sentences allowed (short, it is the first).
- **Badge:** `seal_m01` Bronze · **Gate:** ≥ 10 Log entries, ≥ 7 check-ins, ≥ 15 self-care clicks.

#### M2 · "Habit Forming"
- **UI:** Morning check-in becomes a pinned strip (one tap, 4 states). Streak shown as a *rhythm dot row*, not a number.
- **AI:** Weekend mode visible (lighter questions Sat/Sun), the user notices tone shifts.
- **Widget:** *Weekly Echo* (week line card).
- **Badge:** `seal_m02`. **Gate:** 25 / 14 / 30 cumulative.

### PHASE II — RHYTHM (comfortable)

#### M3 · "Active" — **Act I closes**
- **UI:** Density → comfortable; widgets group into semantic stacks. Existing pulse line ("You have reached Active User status") gets the first **Seal ceremony** (§5.1).
- **AI:** Trauma-informed layer and topic-diversity guard are live (10+ logs). Questions reference two prior months.
- **Widget:** **Act I card**, 3 sentences, archetype named for the first time: "Working archetype: The Philosopher."
- **Badge:** `act_i_seed` (Silver). Citizen Index → Collaborator at day 90.
- **Gate:** 60 entries / 40 check-ins / 80 care.

#### M4 · "Portrait" (existing line: "The portrait deepens")
- **UI:** **Portrait panel**: three traits (e.g., "reflective, ritual-driven, evening-leaning") as quiet text, replaces generic Memory header.
- **AI:** Follow-up depth reaches Level 3 (Values) on repeat topics.
- **Widget:** Mood Patterns unlocks (care ≥ .5).
- **Badge:** `seal_m04`.

### PHASE III — PATTERN (compact)

#### M5 · "Consistency"
- **UI:** Density → compact. Planner Templates (consistency ≥ .33) appear. Month Rail glows on current cell.
- **AI:** Compressed follow-up becomes noticeable: shorter questions on well-known topics (8 words or fewer). The user *feels* the AI knowing them.
- **Widget:** *Compression Meter*: "Questions per insight: 9 → 5."
- **Badge:** `seal_m05` + `compression_first`.

#### M6 · "Half-Declared" — **Act II closes**
- **UI:** Halfway ceremony: the Month Rail splits into two rows of six. Widget Arrange (L10) and Pattern Insights (consistency ≥ .66) unlock.
- **AI:** First **cross-Act comparison**: "In Act I you answered at night; Act II shifted to morning."
- **Widget:** **Act II card** with an *archetype delta* line. Citizen Index → Synthesizer at day 180.
- **Badge:** `act_ii_rhythm` (Gold). Optional keepsake: print-ready half-year page.
- **Gate:** 180 entries / 120 check-ins / 240 care.

#### M7 · "Listening"
- **UI:** First **AI-first line**: one sentence at the top of System tab, e.g., "Evenings run heavy on Thursdays." Dismissible, never a chat.
- **AI:** Intention History (L15), Quantum Intent patterns cited in questions.
- **Badge:** `seal_m07`.

### PHASE IV — VOICE (dense)

#### M8 · "Rare Air"
- **UI:** Density → dense; whitespace cut, but each widget gains a one-line "why now" caption.
- **AI:** Predictive nudges: care suggestion at the hour you usually skip it.
- **Widget:** *Self-Care Forecast*. **Badge:** `seal_m08`.

#### M9 · "Habit Complete" — **Act III closes**
- **UI:** The interface starts ordering itself: the widget the user touches most moves to the top (Widget Arrange auto-suggest, accept/decline).
- **AI:** Narrative Reflection unlocks (depth ≥ .66, L30). Chapters now quote the user's own journal words (max 12 words, user-controlled).
- **Widget:** **Act III card** + *Quote Back*.
- **Badge:** `act_iii_voice` (Platinum). Export Data (L25) prompted: "Your story is yours."

#### M10 · "Almost There"
- **UI:** Month Rail shows 10 filled + 2 outlined; the last two cells pulse softly.
- **AI:** Begins drafting the **Volume** privately; user can preview a *one-line thesis candidate*.
- **Badge:** `seal_m10`.

### PHASE V — INSTRUMENT (instrument)

#### M11 · "Last Chapter"
- **UI:** Density → instrument at `visualRefinement ≥ .75` (earned, not automatic). Chapter archive becomes a scrollable *Ledger* with all 10 prior paragraphs.
- **AI:** Asks the **Soul-level** question (Depth Level 4) once: "What does this year reveal about who you're becoming?" One tap, four options, plus free text optional.
- **Badge:** `seal_m11`.

#### M12 · "The Portrait Is Complete — And Still Evolving"
- **UI:** Full ceremony (§5.1). Month Rail completes; **Volume I** is unveiled. The Elite stage unlocks at day 365 with the final badge.
- **AI:** Volume = 3 sentences + thesis, published to the public profile (Memory Story block) if the user opts in.
- **Widget:** **Volume I card**, **Year in Ledger** (numbers: entries, check-ins, care clicks, badges).
- **Badge:** `volume_i_onyx` (Onyx, hidden until earned) + `usership_year_one`.
- **Offer:** renew for Year 2 (Volume II begins as an *empty* ledger with the old one preserved). See §8.

---

## 5. New surfaces

### 5.1 Month Seal (evolves `MonthlyPulseWidget`)
A once-per-month ceremony, shown on first load after the month turns.

```
┌─ Month 6: ─────────────────────────────────────────────┐
│  SEAL ■■■■■■□□□□□□                          GOLD       │
│                                                         │
│  CHAPTER 06 — "Half-Declared"                          │
│  <paragraph, 60–90 words>                              │
│                                                         │
│  184 entries · 121 check-ins · 247 care   (+22% vs M5) │
│  [ Keep ]   [ Read full ]   [ Share ]                  │
└─────────────────────────────────────────────────────────┘
```
- Keep the existing 1400 ms fade-in and dismiss phrases ("Onward.", "The system remembers.").
- **Seal tiers** by presence: Bronze / Silver / Gold / Platinum / Onyx → maps to badge rarity ladder.
- Dismiss writes to the server (not only `localStorage`) so the Chapter appears on every device exactly once.
- Replaces the generic line with the AI Chapter; the 12 existing one-liners stay as the *fallback* if generation fails.

### 5.2 Months Unlocked widget (the user's idea)
```
Months unlocked:  3 / 12
■■■□□□□□□□□□
Next: Month 4 in 11 days · Portrait
```
- Click the label to cycle: `Months unlocked` → `Next unlock` → `Seals` (the badge shelf). Matches the Clickable Label Cycling pattern.
- Context-based: before M1 shows "Day N of 30"; after M12 shows `Year 2: 0/12`.

### 5.3 Memory Chapter widget
The paragraph itself, on the System tab for 72 h after the month turns, then archived. Cycles: `Chapter:` → `Act:` → `Volume:` → `Archive:`.

### 5.4 Compression Meter
One line, appears M5+: "Questions per insight 9 → 5." It makes the invisible compression *countable*, which is the headline differentiator vs chat apps.

### 5.5 Affirmations (monthly, AI-written from the user's own data)
Short, concrete, never generic. Pattern: `<delta> + <identity statement>`.
- M2: "Two mornings in a row you checked in before noon. Begin anywhere. You did."
- M6: "Six months. You said 'quiet' eleven times. It is who you are now."
- M12: "You asked for less noise all year. This year gave you a signal."

---

## 6. Demo account design: `lot-systems.com/u/machiavelli` as the Month-12 state

The demo is the *marketing proof* that month 12 is worth $99. Today it is a hardcoded profile (Florence weather, wallet, visit counter). Proposed additions, all server-hardcoded in `public-api.ts` like the rest:

- **Month Rail 12/12** and `Elite` Citizen stage.
- **Volume I** in the Memory Story block (three sentences + thesis).
- **Chapter archive**, 12 titles visible, 3 expandable (public-safe).
- **Seal shelf**: 12 seals + 4 Acts + `volume_i_onyx`.
- **Year in Ledger**: sample numbers.
- A "Scrub the year" control: tapping M1…M12 morphs the page density from breathable to instrument, so a visitor *sees the evolution in 10 seconds*. This is the single most persuasive interaction we can ship.

### Sample Chapters (voice reference, Niccolò Machiavelli, Florence)

| M | Title | Chapter paragraph (draft) |
|---|-------|---------------------------|
| 1 | First Light | You wrote nine times and checked in on seven mornings. You chose black coffee over wine before noon, small, but you chose it. This is a first month of listening, not acting. Carry one question forward: what do you actually want from the morning? |
| 2 | Habit Forming | Two weeks of mornings before 8:00. Your entries turned from plans into observations. That is the shift: you stopped drafting the day and started watching it. |
| 3 | Active | Three months and a pattern: you act best when the day is written the night before. Your working archetype is **The Philosopher**. Your care clicks cluster after hard conversations, which is a healthy habit worth naming. |
| 4 | Portrait | Reflective, ritual-driven, evening-leaning. You tapped *quiet* over *social* eleven times. The portrait is not fixed; this month it softened toward warmth. |
| 5 | Consistency | The same questions now take fewer words. You answer in two seconds what took ten in month one. That is compression: the system is learning you faster than you explain yourself. |
| 6 | Half-Declared | Half a year. In Act I you reflected at night; in Act II you reflect at dawn. You moved your hardest thinking to your clearest hour. Keep it. |
| 7 | Listening | Thursdays run heavy. You noticed before the system did, then the system said it first. Care clicks on Thursdays are up 40% — you are building a counterweight. |
| 8 | Rare Air | Fewer entries, longer ones. You wrote less and meant more. The system noticed the same drop in noise. |
| 9 | Habit Complete | Nine months: the practice is no longer effort. Your own words this month: "I stopped negotiating with the morning." Act III closes on a person who keeps promises to himself. |
| 10 | Almost There | A rough week, a fast recovery, and no skipped check-ins. Recovery used to take six days; it took two. That is the clearest sign of growth in the ledger. |
| 11 | Last Chapter | The soul-level question: *What does this year reveal about who you're becoming?* You chose "someone who finishes." That is the thread through every Chapter. |
| 12 | The Portrait | **Volume I.** A man who began by drafting his days and ended by living them. Mornings first, evenings reflective, care as a counterweight. *Thesis: finished, not perfected.* |

(Tone note: Machiavelli persona gives a dry, strategic voice; real users get the same *structure* in their own words.)

---

## 7. Badge & collectible system for the 12 months

- **12 Month Seals** (`seal_m01 … seal_m12`) × 5 quality tiers. Bronze for showing up, Onyx for peak presence. One collectible slot per month, which is always visible as an empty ring until earned.
- **4 Act badges** (Seed, Rhythm, Voice, Instrument) at M3/M6/M9/M12, from the existing Silver → Platinum range.
- **Volume badge** `volume_i_onyx` MYTHIC, hidden until M12 (matches the Codex hidden-badge pattern: 121 hidden vs 28 visible today).
- **Presence badges** tied to the user's own call-outs: Log (`first_ten_entries`, `hundred_entries`, `five_hundred_entries`), check-ins (`seven_mornings`, `hundred_mornings`), self-care (`care_x50`, `care_x250`). Reuse the Codex v32 "Hero's Journey" register for names.
- Badge drops land through the existing `EvolutionMilestoneToast`; ceremony badges (Seal, Act, Volume) get the full-card treatment only.

### Reference presence targets (cumulative, tunable)

| Month | Log entries | Morning check-ins | Self-care clicks | Seal tier at target |
|------:|------------:|------------------:|-----------------:|---------------------|
| 1 | 10 | 7 | 15 | Bronze |
| 3 | 60 | 40 | 80 | Silver |
| 6 | 180 | 120 | 240 | Gold |
| 9 | 330 | 220 | 450 | Platinum |
| 12 | 520 | 340 | 700 | Onyx |

Half the target earns the tier below; no target earns Bronze. **Time alone always yields a Chapter and a Bronze Seal.**

---

## 8. Business hooks (Usership $99)

- **Month 1 email** doubles as the receipt of value: Chapter 01 + Month Rail screenshot.
- **Month 12** is the renewal: "Volume II starts empty. Volume I stays yours." Offer print/PDF of Volume I as a keepsake (export is already gated at L25).
- **Referral**: the shareable Month Seal card (image of the Chapter, no personal data beyond what the user picks) is the organic growth loop.
- **Churn-risk guard**: a month with low presence gets a *Quiet Chapter* instead of silence. Silence is when users cancel.
- **Free → Usership upsell**: free tier sees the Month Rail greyed out with one locked sample Chapter, never a nag.

---

## 9. Build plan (smallest steps first)

| # | Task | Files | Size |
|---|------|-------|------|
| 1 | `MonthlyPulseWidget` → Month Seal: read Chapter text from API, tier from presence | `MonthlyPulseWidget.tsx`, new `useChapter()` in `queries.ts` | S |
| 2 | **Months unlocked** widget with label cycling | new `MonthsUnlockedWidget.tsx` | S |
| 3 | `chapter` generator reusing `generateMonthlySummary` + `memoryStory`/`forwardLook`; persist to user metadata (`chapters[]`) | `monthly-summary.ts`, `routes/api.ts`, `models/user.ts` | M |
| 4 | Server-side dismiss/seen state per month | `routes/api.ts` | S |
| 5 | Presence counters (entries / check-ins / care) from existing log event types | `utils/logs.ts` | S |
| 6 | Seal + Act + Volume badges in Codex engine | badge engine + `docs/badges` | M |
| 7 | Month → density mapping floor (min month for each density) | `interfaceEvolution.ts` | S |
| 8 | Act (quarter) and Volume (year) compression jobs | `scheduled-jobs.ts`, `monthly-summary.ts` | M |
| 9 | Machiavelli Month-12 payload + "scrub the year" control | `public-api.ts`, `PublicProfile.tsx` | M |
| 10 | Compression Meter + Weekly Echo | new widgets | S |

**Suggested first slice:** items 1, 2, 4, 5 — gives every Usership user a visible month ceremony and a counter within one release, with the AI paragraph falling back to today's 12 one-liners.

---

## 10. Open questions for S-2

1. **Chapter length**: one paragraph (60–90 words) as written, or a hard 40-word cap for phone-widget fit?
2. **Seal tiers**: presence-based (proposed) or purely calendar-based (simpler, less motivating)?
3. **Density floor**: should Month 1–2 *force* `breathable` for everyone, even heavy users? Proposal: yes for M1–2, afterwards presence decides.
4. **Public Volume**: opt-in at M12 (proposed) or default-on for Usership like `showMemoryStory`?
5. **Existing users**: backfill Chapters from `joinedAt` (they may already be months in) or start the ladder from the deploy date?
6. **Year 2**: a fresh Rail with a persistent Volume shelf, or a continued 24-month Rail?
7. Sample targets in §7 are placeholders: calibrate against real Usership cohort medians before shipping.

---

## 11. Session record

- **Deliverable:** this document (`docs/usership/USERSHIP-12-MONTH-EVOLUTION.md`). Index line added to `docs/README.md`.
- **Code changes:** none. No build run (docs-only).
- **Next session:** confirm §10 answers, then build slice 1 (items 1, 2, 4, 5).
