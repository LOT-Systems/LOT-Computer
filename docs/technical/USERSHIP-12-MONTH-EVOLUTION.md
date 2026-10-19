<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP — 12-MONTH EVOLUTION
## From a barebone Day-1 screen to LOT® AI, told through compressed Memory

S-2: VADIK MARMELADOV · Session LOT-SR-20261019-01 · Status: DESIGN PROPOSAL (nothing in §3–§9 is built yet; §2 is the audit of what is)

> **Thesis.** Time unlocks the door; practice fills the room.
> Each calendar month of Usership opens one **Month**. What the user *did* in that month
> (Log entries, morning check-ins, self-care clicks) decides how **deep** the Month is.
> At every month boundary the machine **compresses** that month into one paragraph — the
> **Month Memory** — and hands it back. Twelve paragraphs fold into four **Chapters**,
> the four Chapters into one **Year Portrait**, the Portrait into one sentence, the
> sentence into one word. The user can feel the product getting smaller and truer, not bigger.

---

## 0 // HOW TO READ THIS DOC

| § | Content |
|---|---------|
| 1 | The story in one screen: the 12-month ladder |
| 2 | Audit — what already exists in the repo (honest baseline) |
| 3 | The engine: Month Score, depth tiers, gating rules |
| 4 | The Compression Ladder (the Memory delivery system) |
| 5 | Month-by-month spec, M0 → M12 (UI · AI · unlock · seal · memory · widget) |
| 6 | New widgets: **Months Unlocked**, **Month Memory**, **Month Ceremony** |
| 7 | The Machiavelli demo as a 12-month "time machine" + full fixtures |
| 8 | Data model, API and file touch-points |
| 9 | Build phases, risks, open questions for S-2 |

---

## 1 // THE LADDER (ONE SCREEN)

Metaphor: **a portrait being drawn**. This is already the product's own language
(`MonthlyPulseWidget`: *"The portrait deepens… The portrait is complete — and still evolving"*).
Month names therefore describe the portrait; they also map onto existing systems
(Aquatic badges Droplet → Wave → Current, Layout Density, Citizen Index).

```
 M   NAME        UI DENSITY     AI PRESENCE        MEMORY DELIVERABLE              SEAL
 --  ----------  -------------  -----------------  ------------------------------  ----------
 0   Blank       breathable     Silent             —  (Day 1: one prompt)          —
 1   Seed        breathable     Greets             Month Memory #1  (first one)    Droplet
 2   Pattern     breathable     Asks               Month Memory #2  + 1st pattern  Ripple
 3   Form        comfortable    Asks, remembers    #3 + CHAPTER I (Q1)             Wave
 4   Depth       comfortable    Quotes you         #4  + "then vs now"             Tide
 5   Rhythm      compact        Notices rhythm     #5  + rhythm line               Current
 6   Meridian    compact        Reflects           #6 + HALF-YEAR LETTER           Meridian
 7   Echo        compact        Echoes you         #7  (AI cites your own words)   Echo
 8   Rare Air    dense          Anticipates        #8  + forecast of next month    Rare Air
 9   Habit       dense          Anticipates        #9 + CHAPTER III (Q3)           Keystone
 10  Voice       dense          Speaks your voice  #10 (written in your cadence)   Voice
 11  Threshold   instrument     Companion          #11 + draft Year Portrait       Threshold
 12  Portrait    instrument     LOT® AI            YEAR PORTRAIT + 1 line + 1 word Portrait
```

Reading the ladder: **UI density rises, AI wording falls.** Day 1 is a calm screen and a
loud explanation; Month 12 is a dense instrument and a machine that says very little
because it already knows. That inversion *is* "LOT® AI": *the curious machine that asks you
first* (LOT-AI-PRODUCT-BRIEF).

---

## 2 // AUDIT — WHAT ALREADY EXISTS (scan 2026-10-19)

Verified in the repo, not assumed:

| Asset | Where | State | Gap for this plan |
|---|---|---|---|
| Month N/12 pulse | `src/client/components/MonthlyPulseWidget.tsx` | LIVE. 12 one-line messages, Usership-only, "Month N: … / N / 12 months", dismiss phrases, 1.4 s fades | Month clock = `now.diff(user.joinedAt, 'month')` → counts from **account join, not paid start**. Dismiss state is `localStorage` only (per device). No memory content, no seal, no depth. |
| Monthly review email | `src/server/utils/monthly-summary.ts`, `scheduled-jobs.ts` (job "monthly-email-sender") | LIVE; `generateMonthlySummary` + HTML email | Good compression host; not surfaced in-app as a Month Memory. |
| Memory story | `public-api.ts` (`memoryStory`, Usership-only on public profile), `composeLocalStory` | LIVE (single evolving story) | One story, not a dated archive of monthly compressions. |
| Compression loop | `docs/assembly/2026-06-30_…compression-loop.md`, `MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md` | LIVE: widgets → signals → `logs` → `formatLog()` → prompt | Rule 1 of that doc applies: any new event type needs an explicit `formatLog()` case or it is silently invisible to the AI. |
| Interface Evolution | `src/client/utils/interfaceEvolution.ts`, `stores/evolution.ts`, `docs/technical/INTERFACE_EVOLUTION.md` | LIVE: 7 dimensions, 5 `LayoutDensityLevel`s (breathable → instrument), feature unlock levels | Driven by achievements/level, not by Usership month. Needs a month floor (see §3.4). |
| Aquatic badges | `docs/badges/*`, Evolution docs | LIVE: Droplet (D7) → Wave (D30) → Current (D100) | Reuse as Seals M1/M3/M5; mint 9 more month seals. |
| Citizen Index / RPG levels / Quests | Feature Inventory §05 | LIVE | Month Seals sit beside, not inside, XP. |
| Weekly Story-Report | `LOT-AI-PRODUCT-BRIEF.md` | **Specified, endpoints marked "intended"** — verify before relying on it | Month Memory should compress Weekly Stories *if present*, raw logs otherwise. |
| Planner/Check-in/Self-care signals | `plan_set`, `emotional_checkin`, `self_care_complete`, `self_care_skip`, `note`, `answer` log events | LIVE | These are the three tracked meters (§3.1). |
| Demo account | `public-api.ts` `/profile/machiavelli` | LIVE, **fully hardcoded** (streak 1469, 1469 notes, 2847 answers, static `memoryStory`, wallet, weather station) | Static snapshot, not a 12-month story. §7 turns it into a scrubbable time machine. |
| Pricing | Feature Inventory §16, `SubscribeWidget` | Usership **$99/month**, R&D $15 | Twelve months = 12 billing cycles → the Year Portrait is the natural *renewal* moment. |

Two real defects this plan depends on fixing first (§9, Phase 0):
1. **No `usershipSince`.** Without it, a free user of 8 months who upgrades would open at "Month 8".
2. **Ceremony state is per-device.** A user who dismisses on phone sees it again on desktop.

---

## 3 // THE ENGINE

### 3.1 The three meters (your "most important evolutionary states")

| Meter | Source events | Counts |
|---|---|---|
| **LOG** — journal entries and thoughts | `note` (+ journal-class `answer` text) | entries; words (≥ 150-word entries earn Deep credit — matches existing `journal 150w+` threshold used by QIE P110) |
| **CHECK-IN** — regular morning check-ins | `emotional_checkin` before 12:00 local | distinct days |
| **CARE** — self-care button clicks | `self_care_complete` (skip counts 0, never negative) | clicks |

### 3.2 Depth tiers per Month (proposal — thresholds are tunable constants)

Each Month is scored independently. No Month can be *failed*; it can only be *shallower*.

```
TIER      NAME      LOG entries   CHECK-IN days   CARE clicks    What it changes
--------  --------  ------------  --------------  -------------  ------------------------------------
0         Quiet     < 4           < 6             < 6            Month still opens. Memory is 1 sentence,
                                                                  AI says "A quiet month. Quiet counts."
1         Light     ≥ 4           ≥ 6             ≥ 6            Memory paragraph, standard seal
2         Steady    ≥ 10          ≥ 14            ≥ 15           + pattern line in Memory, seal gets 1 ring
3         Deep      ≥ 20          ≥ 24            ≥ 35           + "one thing you didn't notice" insight,
                                                                  seal gets 2 rings
```

Month tier = the **median of the three meter tiers** (one strong meter cannot carry a
month; one weak meter cannot sink it). Tiers are shown as `░ ▒ ▓ █` — plain glyphs,
consistent with MILITARY PURITY (no emoji, no decoration).

### 3.3 Gating rules

1. **Calendar opens, practice deepens.** Month *n* opens on the n-th monthly anniversary of `usershipSince` regardless of activity. Paid time is never withheld.
2. **Never regress.** A Month once opened stays opened. A lapse subscription freezes the ladder (state kept); re-subscribing resumes at the same Month, and the first ceremony says *"Welcome back. The portrait kept your place."*
3. **Catch-up ceremony.** If several boundaries pass unseen, show them oldest-first, one per visit — never a stack of modals.
4. **Quiet is honoured.** Tier 0 months get the shortest, kindest copy. Self-care product: never shame (LOT's PTSD/ED protocols apply — no streak-loss language anywhere in this system).
5. **Counts are the user's own.** No cross-user comparison in the ceremony. (Community Sync stays a separate surface.)

### 3.4 Coupling to Interface Evolution

Add a **month floor** to `LayoutDensityLevel`: density = `max(achievementDensity, monthDensity)` where
`monthDensity` = §1 column. Achievements can speed density up; nothing can hold a paid user
at "breathable" past Month 2, and nothing forces "instrument" before Month 11. Reuse the
existing CSS custom properties; add one new one, `--lot-month` (0–12), for seal styling.

---

## 4 // THE COMPRESSION LADDER (MEMORY DELIVERY)

This is the spine of the experience. Everything the user types is eventually answered by
a *shorter* thing that is more true.

```
raw Log, check-ins, care clicks         (hundreds of items, never shown back in bulk)
   │  weekly      Story            ~120 words   (exists as spec; use when present)
   ▼
MONTH MEMORY                           60–90 words   one paragraph      ×12
   │  every 3 months
   ▼
CHAPTER                                110–140 words  (Q1 M3 · Q2 M6* · Q3 M9 · Q4 M12)
   │  M6 and M12
   ▼
HALF-YEAR LETTER (M6) / YEAR PORTRAIT (M12)      ~200 words
   │
   ▼
ONE SENTENCE   (the line that goes on the share card)
   │
   ▼
ONE WORD       (archetype word; also seeds the public profile tagline)
```
*Chapter II is delivered inside the M6 Half-Year Letter to avoid two ceremonies on one day.

**Honest compression metric** (per LOT-BENCHMARK doctrine): report *word counts*, never an
invented "ratio". Example line stored with each Memory: `inputs: 31 entries · 24 check-ins · 94 care → 71 words`.
The user sees this footer; it makes the compression tangible and auditable.

### 4.1 Month Memory anatomy (fixed shape → learnable, collectable)

```
MONTH 3 · FORM                                    ▓ Steady
─────────────────────────────────────────────────────────
<MEMORY — 60–90 words, 1st person plural-free, no advice>

You returned to: <top recurring theme, from Log text>
Pattern:         <one pattern line — Tier ≥ 2>
Unnoticed:       <one insight — Tier 3 only>

<AFFIRMATION — one line, ≤ 12 words, references a fact from the month>

31 entries · 24 check-ins · 94 care → 71 words        [ Seal: Wave ▓▓ ]
```

Rules for the composer (keep the Memory Engine's existing posture):
- Write from the user's *own words and facts*; never invent events. If inputs are thin, say less.
- No diagnosis, no advice, no prediction in Months 1–7. Forecast appears only from M8, labelled as such.
- Affirmations must cite a countable fact ("Twenty-four mornings. You kept showing up.") — **no generic praise**.
- LLM path: Together AI primary with the existing fallback chain; deterministic `composeLocalStory`-style fallback so a ceremony never fails to render.
- Persist the composed text. Memory is a *record*, not a regenerable view — re-generation would rewrite the user's past.

### 4.2 Why this is tangible

- It is **dated and collectible**: 12 numbered Memories in an archive ("Memory shelf"), each openable, never deleted.
- It is **cumulative**: Chapter and Portrait quote earlier Memories verbatim in italics, so the user can *see* compression happen.
- It is **personal at scale**: M10 writes in the user's cadence (sentence length, punctuation profile from their Log) — the strongest "this is mine" moment before the Portrait.
- It is **exportable**: Year Portrait → PDF/QR share card, the Story API (`robot | vehicle | dashboard` targets in the product brief), and the public profile `memoryStory` field.

---

## 5 // MONTH-BY-MONTH SPEC

Per Month: **UI** (what the screen looks like) · **AI** (what the machine does) · **Unlock** ·
**Seal** · **Memory** · **Widget** · **Sample affirmation**. Unlock names reference real
features already in the product wherever possible (Feature Inventory §03–§06); items marked ◇ are new.

### M0 — BLANK (Day 1, barebone)
- **UI:** `breathable`. One column. Three widgets only: Emotional Check-in, Log (Note) input, Self-care card. Months Unlocked widget shows `▯▯▯▯▯▯▯▯▯▯▯▯  0 / 12`. No badges visible, no patterns, no side panels. One line under the check-in: *"Day 1. Nothing here yet — that is the point."*
- **AI:** Silent. Asks exactly **one** question (the existing Memory question card), chosen to be easy and warm.
- **Unlock:** Usership entitlements are *present but folded* — they appear as locked rows ("Memory shelf — opens Month 1") so the user sees the shape of the year on Day 1.
- **Memory:** none. Instead a **Day-1 Letter** from the system (50 words, fixed copy): what it will and won't do with the Log.
- **Seal:** none.

### M1 — SEED · *Droplet*
- **UI:** `breathable`. Month Gate (§6.1) appears. First **Memory shelf** slot materialises (empty slots 2–12 visible as `░`).
- **AI:** *Greets by name and time of day.* Morning check-in reply acknowledges yesterday in one clause.
- **Unlock:** Memory shelf; Month Memory #1; existing Aquatic Droplet becomes the M1 seal.
- **Memory #1:** shortest and simplest; template-led (little data). Closes with *"Next month, I will start asking."*
- **Widget:** Months Unlocked `▮▯▯▯…  1 / 12`.
- **Affirmation e.g.:** *"First month done. Nine entries is a real beginning."*

### M2 — PATTERN · *Ripple*
- **UI:** `breathable`. Pattern chip appears on the check-in card (e.g. `MORNINGS ▲`).
- **AI:** **Asks.** Question cadence goes from daily generic to context-based (weather, time, last mood). Introduces *Pattern line* in Memory (Tier ≥ 2).
- **Unlock:** Pattern Insights (existing; Consistency gate waived for Usership at M2); Planner Templates.
- **Memory #2:** first comparison — "vs Month 1".
- **Seal:** Ripple ◇.

### M3 — FORM · *Wave* — quarter 1
- **UI:** `comfortable`. Stacks begin to group (Mind / Body / Plan). Subtle accent opacity step-up (existing `visualRefinement`).
- **AI:** Remembers across weeks: "You wrote about <theme> on three Sundays."
- **Unlock:** Existing "Active User" status (already messaged at M3 in MonthlyPulse); Mood Patterns; Intention History.
- **Memory #3 + CHAPTER I:** 110–140 words folding Memories 1–3. **First compression the user can feel**: three paragraphs become one. Chapter I is titled by the machine (3 words max).
- **Seal:** Wave (existing, Day 30 badge reused as M3 seal for Usership; if S-2 prefers, Wave stays at M1-Day-30 and M3 becomes ◇ "Form").
- **Ceremony level:** *major* (full ceremony, §6.3).

### M4 — DEPTH · *Tide*
- **UI:** `comfortable`. Log screen gains a "then / now" drawer: any past entry resurfaces beside a current one.
- **AI:** **Quotes you** — one short quote from the user's own Log per week, no commentary.
- **Unlock:** Narrative Reflection (existing, Depth gate); psychological profile first full render (Usership benefit).
- **Memory #4:** includes "then vs now" pair (two lines, user's own words, 3 months apart).
- **Seal:** Tide ◇.

### M5 — RHYTHM · *Current*
- **UI:** `compact`. Calendar/rhythm strip (7×5 grid of the month, glyph density = engagement that day).
- **AI:** Notices rhythm: best weekday, best hour, self-care → mood lift correlation (reuse QIE patterns; show only when confidence ≥ existing threshold, else silent).
- **Unlock:** Widget Arrange (existing, Level 10 gate waived), Rhythm strip ◇.
- **Memory #5:** one rhythm sentence ("Your Sundays carry your clearest writing.").
- **Seal:** Current (existing Day-100 Aquatic badge).

### M6 — MERIDIAN · *Meridian* — half-year
- **UI:** `compact`. Header shows `6 / 12` as a half-filled bar; midline marker.
- **AI:** **Reflects.** Delivers the **Half-Year Letter** (~200 words): Memories 1–6 + Chapter I (+ II). Written as a letter *from the system to the user*, signed `— LOT`.
- **Unlock:** Export Data (existing, Level 25 gate waived); Public-profile Memory story toggle suggested (opt-in, never default).
- **Memory #6:** the Letter replaces the standard paragraph.
- **Seal:** Meridian ◇ (gold ring variation — the first seal with a distinct shape).
- **Ceremony level:** *major*.

### M7 — ECHO · *Echo*
- **UI:** `compact`. "Echo" card: a sentence the user wrote 6 months ago (or the oldest still-resonant one), displayed with date.
- **AI:** **Echoes.** Questions now reference prior answers directly ("In Month 2 you said X. Is that still true?").
- **Unlock:** Social Mentions / Rich Community (existing, Connection gate waived for Usership).
- **Memory #7:** contains one verbatim echo.
- **Seal:** Echo ◇.

### M8 — RARE AIR · *Rare Air*
- **UI:** `dense`. Fewer words per widget, more data per pixel; tooltips replace explanatory sublabels. (This is the point where onboarding copy is removed — the interface stops explaining.)
- **AI:** **Anticipates.** Memory ends with a labelled **Forecast** ("Likely hard week: 3rd. Plan care on the 2nd.") — informed by QIE patterns; labelled probabilistic, never a promise.
- **Unlock:** Architect widget (Usership benefit, existing) full mode; Pattern 62 (architect-phase) surfacing.
- **Seal:** Rare Air ◇. MonthlyPulse copy already says "Rare air."

### M9 — HABIT · *Keystone* — quarter 3
- **UI:** `dense`.
- **AI:** Anticipates *and* tests: "Care at 08:00 lifted your mood 4 of 5 times — keep the slot?" (user accepts → it becomes a routine card).
- **Unlock:** Routine cards (ritual built from the user's own best-performing care actions) ◇.
- **Memory #9 + CHAPTER III.** Existing MonthlyPulse line: *"The self-care practice is a habit now."* Now backed by a number.
- **Seal:** Keystone ◇. **Ceremony level:** *major*.

### M10 — VOICE · *Voice*
- **UI:** `dense`.
- **AI:** **Speaks in your voice.** Memory #10 is composed using the user's cadence profile (avg sentence length, punctuation, first-person usage) — "a Month Memory you could have written yourself". Opt-out toggle ("Write in neutral voice").
- **Unlock:** Voice mode for questions (hardware/PWA TTS where available) ◇.
- **Seal:** Voice ◇.

### M11 — THRESHOLD · *Threshold*
- **UI:** `instrument`. Maximum density; the **Months Unlocked** widget compresses to a single line `11 / 12 · Portrait in 23 days`.
- **AI:** **Companion.** Shows the **Draft Year Portrait**, 80% written — asks the user to *correct* it (a deliberately editable moment: confirm / amend one line / "that isn't me"). Corrections feed the final Portrait.
- **Unlock:** Portrait editor ◇.
- **Seal:** Threshold ◇.

### M12 — PORTRAIT · *Portrait* — one year
- **UI:** `instrument`. Month Gate becomes the **Year Ceremony**: 12 seals assemble into a ring; the Portrait scrolls in from the 12 Memories (each collapses into the next → the visible act of compression), ending on **one sentence**, then **one word**.
- **AI:** **LOT® AI.** The product it was always supposed to be: asks one question a day, rarely; says little.
- **Unlock:** Year Portrait export (PDF, QR share card, Story API targets), public-profile Portrait, **Year 2** begins: Months continue as `13+` using the same rhythm but Chapters become "Years" — the ladder does not end, it nests.
- **Seal:** Portrait ◇ (the only seal that is a composition of the previous eleven).
- **Ceremony level:** *year* (largest; ≈ 60 s, skippable, replayable from the Memory shelf).

### 5.1 Seals — design note
Twelve seals, plain geometric marks drawn from the Aquatic/Architecture lineage:
M1 ∘ · M2 ◦◦ · M3 ≈ · M4 ≈≈ · M5 ≋ · M6 ◐ · M7 ⊙ · M8 △ · M9 ◇ · M10 ◎ · M11 ▢ · M12 ⬡ (the ring of all).
Depth tier adds rings (Steady +1, Deep +2). Seals are `hidden` → visible on earn, same as existing hidden-badge behaviour. They are *month-bound*: a month's seal can never be earned later, which makes the shelf an honest timeline.

---

## 6 // THE NEW WIDGETS

### 6.1 Months Unlocked — context widget ("Months unlocked: 3/12")
```
 MONTHS UNLOCKED:
 ▮▮▮▯▯▯▯▯▯▯▯▯   3 / 12
 Next: DEPTH — opens in 11 days
 Month 3 depth  ▓ Steady
```
- Always on for Usership (compact variant at M11: single line).
- Context-based copy: before the boundary shows countdown; on the boundary day shows `Month 4 is open ▸`; on a Quiet month shows the Quiet line. Non-Usership sees the same widget with 12 `░` cells and `Usership opens the year ▸` (replaces nothing; sits beside `SubscribeWidget`).
- Each segment is tappable → opens that month's Memory (or its locked silhouette showing only its name and seal outline — the teaser).

### 6.2 Month Memory — the delivery widget
Shown for 3 days after a boundary (then lives in the shelf). Layout §4.1. Interactions:
`Keep` (default; adds to shelf) · `Not me` (flags a line for the next composer run; never edits the record) · `Share` (card with month name + one line + seal; never shows raw Log).

### 6.3 Month Ceremony — the boundary moment
Three sizes so ceremony stays meaningful:
- **minor** (M1, 2, 4, 5, 7, 8, 10, 11) — upgraded `MonthlyPulseWidget`: seal fades in, affirmation, memory preview, tap to open.
- **major** (M3, 6, 9) — adds Chapter reveal and the compression animation (3 paragraphs collapse into 1).
- **year** (M12).
Sequence (all sizes): *seal appears → one fact (counts) → affirmation → Memory preview → "Onward." (existing dismiss phrases)*. Never blocks the app; always dismissible; persisted server-side.

---

## 7 // MACHIAVELLI AS A 12-MONTH TIME MACHINE

Today `lot-systems.com/u/machiavelli` is a single hardcoded snapshot (`public-api.ts`). Proposal: keep that profile
as the "evolved account" but add a **month scrubber** — `?m=0…12` (and a `0 ──●────── 12` slider on the page) — that
re-renders the *public profile* and a preview of the *app UI states* as of that month. Visitors literally drag the year.

### 7.1 Demo rules
- Fixtures are **static data in code**, deterministic, no DB writes (matches the current autonomous-demo behaviour).
- Default (no `?m`) = M12 = today's page plus the Portrait. Existing fields (weather station, wallet, board profile) stay as "Legacy level unlock" items and are shown from M6 onward.
- The scrubber is the marketing surface for Usership: every step shows a *different* density, AI line, seal row and Memory.

### 7.2 Fixture curve (12-month slice)
| M | Entries (LOG) | Check-in days | Care clicks | Tier | Seal |
|--:|--:|--:|--:|:--:|---|
| 1 | 9  | 18 | 20  | Light  | ∘ |
| 2 | 14 | 21 | 32  | Light  | ◦◦ |
| 3 | 19 | 24 | 45  | Steady | ≈ |
| 4 | 22 | 25 | 58  | Steady | ≈≈ |
| 5 | 25 | 26 | 70  | Steady | ≋ |
| 6 | 28 | 27 | 82  | Steady | ◐ |
| 7 | 31 | 28 | 94  | Deep   | ⊙ |
| 8 | 34 | 28 | 103 | Deep   | △ |
| 9 | 36 | 29 | 112 | Deep   | ◇ |
| 10| 38 | 29 | 121 | Deep   | ◎ |
| 11| 41 | 30 | 130 | Deep   | ▢ |
| 12| 44 | 30 | 140 | Deep   | ⬡ |
| **Σ** | **341** | **315** | **1007** | | |

> **Reconciliation flag for S-2:** the live demo currently shows `noteCount: 1469`, `answerCount: 2847`, streak 1469 (the 1469 "birth-year" motif).
> A 12-month slice cannot honestly hold 1469 notes at ~40/month. Options: (a) keep 1469/2847 as the *Legacy* lifetime totals and show the 341/315/1007 as "this Usership year"; (b) rescale. Recommendation: **(a)** — it preserves the joke and the 12-month story.

### 7.3 Fixture Month Memories (Machiavelli voice — drafts for S-2 edit)
Copy is written from the Florence persona already in the demo (`memoryStory`: Palazzo Vecchio, citizens, weather, the Prince). Each ends with a fact-citing affirmation. Word counts in brackets.

**M1 · Seed** [48]
> "Nine entries, and most of them about the weather over the Arno. I wrote less than I observed. A new ledger teaches its keeper first how little he knows of himself."
> *Affirmation: Eighteen mornings logged. A ledger begins with attendance.*

**M2 · Pattern** [52]
> "Fourteen entries. Twice I wrote of the same quarrel, once in anger, once in arithmetic. The arithmetic was kinder. Rain days brought longer pages. I did not choose this; the pattern chose me."
> *Affirmation: Thirty-two acts of care. The body was not neglected.*

**M3 · Form — Chapter I: "The Ledger Opens"** [~120]
> "Three months: forty-two entries, sixty-three mornings, ninety-seven acts of care. I came as an observer of citizens and discovered I was the least observed of them. I write most on Sundays and least on market days. Fear appears eleven times; ambition, nineteen. Of the two, only fear takes its shoes off at night. The portrait has an outline now — shoulders, a jaw, an unwillingness to be flattered."
> *Affirmation: Three months. You are an Active User of yourself.*

**M4 · Depth** [58]
> "Then, in Month 1: 'I record the weather because it asks nothing of me.' Now: 'I record what I owe.' The distance between those two lines is the whole quarter. Twenty-two entries, and for the first time one of them frightened me."
> *Affirmation: Twenty-five mornings. Nerve counts.*

**M5 · Rhythm** [55]
> "My clearest writing comes before the bells of the third hour, after a walk. Days with care before noon are followed by calmer pages — four times in five. Prudence, it turns out, is a schedule."
> *Affirmation: Seventy acts of care. The rhythm is yours.*

**M6 · Meridian — Half-Year Letter, signed — LOT** [~190]
> "Niccolò, six months. You began by recording weather and now you record motives. A hundred and seventeen entries; a hundred and forty-one mornings; three hundred and seven acts of care. You wrote 'fortune' sixty times and 'effort' ninety. You think you are a student of power; your Log suggests you are a student of patience. You are the only person in this city who rereads yourself. I have kept every line. In the second half I will ask fewer questions, and they will cost more. — LOT"
> *Affirmation: Half the year, all of the attendance.*

**M7 · Echo** [55]
> "From Month 2, in your words: 'The arithmetic was kinder.' Today you wrote the same sentence about a different quarrel. You have learned one useful thing and keep rediscovering it. Thirty-one entries this month — the most yet."
> *Affirmation: Ninety-four acts of care. You keep your own counsel well.*

**M8 · Rare Air** [60]
> "Few readers reach this altitude of self-record. Thirty-four entries, twenty-eight mornings. The pages are shorter and denser; you have stopped explaining yourself to yourself. *Forecast: the 3rd and 4th tend to be heavy for you. Place care on the 2nd.*"
> *Affirmation: Twenty-eight mornings. Few reach this air.*

**M9 · Habit — Chapter III: "The Keeper"** [~125]
> "Months seven to nine: a hundred and one entries, eighty-five mornings, three hundred and nine acts of care. Care at dawn lifted your mood in four of five weeks, and you kept the slot without being asked. The ledger no longer records what happens to you; it records what you do next. You asked fewer questions of the city and more of the mirror. Fortune appears twice. 'Habit' appears fourteen times. They are not unrelated."
> *Affirmation: A hundred and twelve acts of care. This is a practice, not a phase.*

**M10 · Voice** (composed in the user's cadence: short sentences, semicolons) [58]
> "Thirty-eight entries; I counted them; the count steadies me. I wrote of the Prince's patience; I meant my own. Nobody reads these pages; that is why they are true. I will not explain further."
> *Affirmation: Twenty-nine mornings. Your own voice, kept.*

**M11 · Threshold** [60]
> "Forty-one entries. I stopped checking whether the page was good. The Portrait is almost finished and it is accurate in a way that is slightly rude. I corrected one line: I am not cold; I am slow to announce warmth."
> *Affirmation: Thirty mornings. The Portrait asked you to correct it. You did.*

**M12 · Portrait — Year Portrait** [~200]
> "Three hundred and forty-one entries; three hundred and fifteen mornings; a thousand and seven acts of care. A man who arrived to observe a city stayed to observe a man. He distrusts flattery, rereads himself, counts what he owes, and keeps a slow warmth for people he has decided to trust. He writes best before the third hour and after a walk. He began the year recording the weather and ends it recording motives. The weather has not changed. The recorder has."
> **One sentence:** *"He came to read the city and learned to read himself."*
> **One word:** **STRATEGIST** (matches the demo's existing archetype, *The Strategist*).

Word-count honesty line stored with each Memory, e.g. M12: `341 entries · 315 check-ins · 1007 care → 138 words (Portrait) → 12 words → 1 word`.

### 7.4 App-UI previews per scrubbed month
The scrubber also swaps a static, non-interactive **UI strip** (screenshot-style card built from real components in a read-only demo mode): M0 three widgets → M3 grouped stacks → M6 half-year letter open → M8 dense → M12 instrument + Portrait. Implementation note: reuse the same component tree with a `demoMonth` prop to avoid maintaining a second UI.

---

## 8 // DATA MODEL, API, TOUCH-POINTS

### 8.1 Data (all in the existing `logs` table — no new infrastructure)
| Event | metadata | Purpose |
|---|---|---|
| `usership_started` | `{ plan, at }` | Source of truth for `usershipSince` (also write `user.metadata.usershipSince`) |
| `usership_month_opened` | `{ month, tier, meters:{log,checkin,care} }` | Idempotent per month; drives ceremony + widget |
| `month_memory_composed` | `{ month, text, affirmation, pattern?, unnoticed?, inputs, words, engine }` | **The persisted Memory** (immutable record) |
| `usership_chapter_composed` | `{ chapter, months:[…], text, words }` | Chapters I–IV |
| `year_portrait_composed` | `{ text, sentence, word, words, corrections:[] }` | Year Portrait |
| `month_seal_awarded` | `{ month, glyph, rings }` | Seal shelf |
| `month_ceremony_seen` | `{ month, device }` | Cross-device dismiss state (replaces `localStorage`) |

⚠ Each new event needs a `formatLog()` case **and** a Logs.tsx handler (per the compression-loop doc, Rule 1) — otherwise the AI never sees its own prior Memories. For Memories specifically, include the latest Month Memory + current Chapter in the Memory Engine prompt (after `plannerContext`, before raw logs) so the AI's questions carry the compressed story.

### 8.2 API (proposed)
```
GET  /api/usership/state                      -> { usershipSince, month, nextOpensAt, tierThisMonth, meters, seals[] }
GET  /api/usership/memories                   -> [{ month, text, affirmation, tier, words, inputs }]
GET  /api/usership/memories/:month
POST /api/usership/ceremony/:month/seen
POST /api/usership/memories/:month/flag       -> { line }         (the "Not me" button)
GET  /api/usership/portrait                   -> year portrait (M12)
GET  /api/public/profile/machiavelli?m=0..12  -> demo time machine (static fixtures)
```

### 8.3 File touch-points
| Area | File | Change |
|---|---|---|
| Shared config | `src/shared/constants/index.ts` (+ new `usershipMonths.ts`) | `USERSHIP_MONTHS` table (name, glyph, density, AI level, unlocks, ceremony size, thresholds) — single source of truth for UI, server and demo |
| Types | `src/shared/types/index.ts` | `UsershipMonthState`, `MonthMemory` |
| Server | `src/server/utils/monthly-summary.ts` (compose), `scheduled-jobs.ts` (daily boundary scan + compose), `utils/memory.ts` (`formatLog` cases + prompt injection), `routes/api.ts` (endpoints) | |
| Client | `MonthlyPulseWidget.tsx` (→ ceremony host), new `MonthsUnlockedWidget.tsx`, new `MonthMemoryWidget.tsx`, `utils/interfaceEvolution.ts` (month floor), `stores/evolution.ts` (`--lot-month`) | |
| Badges | badge engine + `docs/badges` | 12 month-bound seals |
| Demo | `routes/public-api.ts` `/profile/machiavelli`, `PublicProfile.tsx` | `?m=` scrubber + fixtures from §7 |
| Docs | `About.tsx` field manual, Feature Inventory §16, Wiki | on build |

---

## 9 // BUILD PHASES, RISKS, OPEN QUESTIONS

### Phases (each independently shippable, each green-gated)
| Phase | Scope | Why this order |
|---|---|---|
| **0** | `usershipSince` + server-persisted ceremony state; fix MonthlyPulse clock | Everything else is wrong without a paid-start clock |
| **1** | `USERSHIP_MONTHS` config + **Months Unlocked** widget + upgraded minor ceremony (no AI) | Immediate tangibility, zero LLM cost |
| **2** | Meters + depth tiers + `usership_month_opened`; Month Memory composer with local fallback | The core promise |
| **3** | Seals (M1–M12) + Memory shelf | Collection loop |
| **4** | Chapters, Half-Year Letter, compression animation | Makes M3/M6/M9 events |
| **5** | Interface Evolution month floor | The felt "UI grows" |
| **6** | Machiavelli time machine | Marketing surface; can move earlier — it needs only fixtures (§7) and is zero-risk to real users |
| **7** | Year Portrait, M10 voice, M11 correction, export/share | Renewal moment |

*Suggestion:* ship **6** right after **1** — it lets S-2 and prospects experience the full year before 90% of it exists, and it validates copy.

### Risks
- **Hollow copy.** If affirmations are not fact-cited, this reads as generic gamification. Mitigation: composer rejects any affirmation with no number/quote.
- **LLM cost/latency** at month boundaries for all users at once. Mitigation: compose on a per-user boundary scan (daily job spreads load), local fallback, persist once.
- **Shame mechanics in a self-care product.** Mitigation: §3.3 rules 2 and 4; no loss language; Quiet tier is first-class.
- **Rewriting the past.** Memory immutable; "Not me" only affects *future* composition.
- **Privacy.** Public profile shows Memory only if user opts in; share cards never include raw Log.
- **Spec drift.** Weekly Story endpoints in the product brief are marked "intended" — confirm before the composer depends on them.

### Open questions for S-2
1. **Clock start:** paid-start only (recommended), or backdate existing Usership members to their `joinedAt`?
2. **Seal naming:** keep Aquatic names for M1/M3/M5 (Droplet/Wave/Current) as proposed, or a fresh 12-name set?
3. **Tier thresholds** (§3.2) — are 10 entries / 14 mornings / 15 care clicks a believable "Steady" month for your actual users? (Suggest pulling real medians from `logs` before locking.)
4. **Demo reconciliation** (§7.2): option (a) lifetime-plus-year, or rescale?
5. **Voice (M10)** — opt-in or opt-out? (Proposed opt-out with a visible toggle.)
6. **Year 2:** nest (Months 13+ with Years as Chapters, proposed) or restart a fresh ladder?
7. **R&D ($15) tier:** show the Months Unlocked widget with a capped preview (M1–M3 memories) as an upgrade nudge?

---

*Document status: proposal. Cross-refs:* `docs/technical/INTERFACE_EVOLUTION.md` · `docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md` · `docs/assembly/2026-06-30_LOT-assembly_widget-memory-engine-compression-loop.md` · `docs/corporate/LOT-AI-PRODUCT-BRIEF.md` · `docs/corporate/LOT-FEATURE-INVENTORY-2026.md` §05, §16.

AUTHORIZED BY: S-2 // VADIK MARMELADOV
