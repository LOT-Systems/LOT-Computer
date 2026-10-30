<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® USERSHIP — 12-MONTH EVOLUTION
### From a barebone first-day OS to LOT® AI, delivered as a compressed Memory story every month

S-2: VADIK MARMELADOV · Session 2026-10-30 · Class: ENGINEERING (design spec, no code changed)
Status: **PROPOSAL / PROVISIONAL** — numbers marked `PROVISIONAL` must be calibrated against real usage before shipping.

---

## 0. WHAT THIS DOCUMENT IS

A month-by-month design of the paid Usership experience ($99/mo, see `docs/corporate/LOT-AI-PRODUCT-BRIEF.md`).
Day 1 is a quiet, nearly empty screen. Month 12 is the full personal OS shown at `lot-systems.com/u/machiavelli`.
Every month the operator receives one tangible thing: a **Month Seal** and a **compressed Memory story**
(one paragraph, written from their own signals).

Focus of this revision: **12-month tangibility of the compressed Memory story delivery** (Section 3–4).

### 0.1 Repo scan — what already exists (verified this session)

| Piece | Where | State |
|---|---|---|
| Month N/12 banner for Usership | `src/client/components/MonthlyPulseWidget.tsx` | Live. Month = `now.diff(joinedAt,'month')`, static one-line message per month, dismiss stored in `localStorage` (`lot_pulse_<id>`). No story, no earned logic, no badge. |
| Interface evolution (7 dimensions) | `src/client/utils/interfaceEvolution.ts`, `stores/evolution.ts` | Live. Exploration, Consistency, Depth, Connection, Intimacy, Care, Courage → `overallMaturity`, `visualRefinement`. |
| Density ladder | same, `getLayoutDensity` | Live. breathable → comfortable (≥0.15) → compact (≥0.35) → dense (≥0.55) → instrument (≥0.75), applied as `data-density` and `density.sectionGap` in `System.tsx`. |
| Feature unlocks | same, `getFeatureUnlocks` | Live. customThemes L5, widgetArrange L10, intentionHistory L15, exportData L25, narrativeReflection (depth ≥0.66 and L30); story chapters at L10 / L30 / L60. |
| Weekly story | `scheduled-jobs.ts` Job 24 (Sun 18:00 UTC) | Live. Template-based, needs ≥3 logs/week, stored in user metadata `weeklyStory`, log event `lot_ai_story`. |
| Memory story | `src/server/utils/memory/story-generator.ts` | Live. Last 30 `answer` logs → third-person narrative via Together AI, `composeLocalStory` fallback. |
| Monthly email job | `scheduled-jobs.ts` (`executeMonthlyEmailJob`) | Live. Delivery channel already exists. |
| Badge glyph language | `docs/badges/BADGE_PROGRESSION_PREVIEW.md` | Documented (⋆· → ⋆⋆ → ⋆⋆⋆, ◊·◊, ∼·∼ …). Reuse; do not invent a new visual language. |
| Paid layout split | `System.tsx` (`isPaidAccount`) | Live. Non-paid = minimal; R&D + Usership = full pro layout from day 1. |
| Demo account | `src/server/routes/public-api.ts` (`userIdOrUsername === 'machiavelli'`) | Live. Hardcoded profile, tags `RND, Usership, Legacy`, Florence, counter seeded at 1469. |

### 0.2 Gaps this spec closes

1. Usership day 1 already gets the **full** pro layout. There is no barebone start, so nothing is "earned" visually.
2. Month count is **calendar time only** — it ignores whether the operator showed up.
3. The monthly message is a static string. There is **no month Memory paragraph**, no archive, no badge.
4. Weekly stories are produced but never **compressed upward** into a month, quarter, or year.
5. The demo account has no timeline. A visitor cannot see what month 3 vs month 9 looks like.

### 0.3 Honest limits of this session

- `lot-systems.com/u/machiavelli` could not be fetched (sandbox DNS blocked). The demo is described from its server source, not the rendered page. Verify the visual details on the live page.
- `node_modules` is empty in this sandbox and the repo defines no test/lint script; this change is documentation only (no source touched), so there is no build to gate.

---

## 1. PRINCIPLES

1. **Time opens the door. Presence walks through it.** A month *elapses* by calendar; it is *unlocked* by presence.
2. **The Memory story is the product.** Everything else (density, badges, widgets) is scaffolding that makes the story feel earned.
3. **Compression, not accumulation.** Source volume grows each month; the delivered artifact stays one paragraph. The widget shows both numbers (`212 signals → 74 words`). Countable, not mystical.
4. **No pressure, no punishment.** A thin month is still composed from what exists and is labelled honestly. Months are never "lost". (Consistent with the RESILIENCE protocol and "No unprompted notifications" in the Product Brief.)
5. **MILITARY PURITY.** No emojis, no confetti, no superlatives. Celebration = a quiet line, a glyph, a paragraph.
6. **One new thing per month.** A single visible change at each rollover: one widget family, one density step, or one AI capability.

---

## 2. THE MONTH ENGINE

### 2.1 Month boundary

Month N runs from the Usership anniversary day (`joinedAt + N months`), not the 1st of the calendar month.
The first paid day is **Day 1 of Month 1**.

### 2.2 Presence Index (per month) — `PROVISIONAL`

| Signal | Source event | Points | Cap |
|---|---|---|---|
| Journal / Log entry | `note`, `journal` | 3 | 5 per day |
| Morning check-in | `emotional_checkin` | 2 | 1 per day |
| Self-care button click | `self_care_complete(d)` | 1 | 3 per day |
| Memory answer | `answer` | 1 | 2 per day |
| Intention set | `intention` | 1 | 1 per day |

Event names are the ones Job 24 already reads, so no new instrumentation is needed for the first version.

### 2.3 Seal levels

| Seal | Presence Index | Meaning |
|---|---|---|
| OPEN | below 60 | Month elapsed. Story composed from sparse signal, labelled "thin". Not counted as unlocked. |
| SEALED | 60 – 119 | Month unlocked. Counts toward `Months unlocked`. |
| FULL | 120+ | Month unlocked, richest story variant, glyph upgrade. |

A single daily check-in alone yields about 60, so a SEALED month is reachable by light but regular use. FULL needs journal depth.
OPEN months can be **re-opened for 14 days** after rollover: further activity retroactively seals them. This is the no-punishment rule in mechanism form.

### 2.4 Months unlocked (the context widget)

```
Months unlocked:    3/12                       ← sealed months only
Now:                Month 4 · day 11 · 47 pts to seal
```

Rendered with the existing `ProgressBars` (12 segments) used in `InterfaceEvolutionWidget`.

### 2.5 Relationship to existing evolution

- `visualRefinement` (earned, 7 dimensions) keeps driving **density**.
- The **month** sets a *floor on AI capability and widget availability* (Section 5).
- Effect: a new operator cannot buy density; a veteran who stops showing up does not lose features, only stops compressing upward.

---

## 3. THE COMPRESSION CASCADE (focus)

Each layer reads only the layer below it, so cost stays flat and the story gets denser over time.

```
 signals (journal · check-ins · self-care · answers · intentions)
      │  weekly   Job 24, exists            ~40 words      52 / year
      ▼
 WEEK STORY ──×4──► MONTH MEMORY            60–90 words    12 / year
                         │ ×3
                         ▼
                    QUARTER STORY           100–130 words  4 / year   (M3 · M6 · M9 · M12)
                         │ ×2
                         ▼
                    HALF-YEAR PORTRAIT      150–180 words  2 / year   (M6 · M12)
                         │ ×2
                         ▼
                    YEAR STORY              220–260 words  1         (M12)  + 12-glyph signature
```

### 3.1 Rules of the cascade

- **Source of truth stays raw.** Logs are append-only and never rewritten. Stories are derived artifacts, regenerable.
- **Each Month Memory is stored once** (log event `usership_month_memory`, plus a copy in user metadata `usershipMonths[N]`) and then **frozen**. A later month never edits an earlier paragraph; it may *quote* it.
- **Three paragraphs max per delivery:** the Month Memory, the carry-forward line ("what changed since last month"), and one question for next month (LOT® AI "asks first").
- **Voice drifts with tenure** (Section 5): month 1–2 describes (third person, "They"), months 4–8 addresses ("You"), months 9–12 speaks in the operator's own behavioral voice, matching the Product Brief's Story-Report.
- **Honest density metric** shown on every card: `signals_in → words_out`. A rising `signals_in` with flat `words_out` *is* the compression the operator can see.
- **Generation:** template-first (as Job 24), AI-polish second (Together AI, same fallback pattern as `story-generator.ts`). If AI fails, the template ships. A month is never blocked by a model outage.

### 3.2 Delivery moments (all passive, nothing pushed)

| Moment | What the operator sees |
|---|---|
| Rollover, next open of `/` | Month Widget replaces `MonthlyPulseWidget` at top of System: seal glyph, Month Memory paragraph, `Months unlocked`. |
| Dismiss | Existing one-word dismiss phrase, then the card collapses into the **Memory Shelf** (below). |
| Monthly email | Existing monthly job carries the same paragraph. Email is a mirror, never the first delivery. |
| Quarter month (3/6/9/12) | Month card is followed by the Quarter Story, a second card, same widget, different label. |
| Month 12 | Year Story, with the 12-glyph signature and the full Shelf unrolled. |
| API | `GET /api/story/month/:n`, `GET /api/story/year` (extends the Story API in the Product Brief; export targets robot / vehicle / dashboard unchanged). |

### 3.3 The Memory Shelf

A permanent, quiet block in Log (not System): twelve slots, filled left to right.

```
MEMORY SHELF                                      3 / 12 sealed

 M01  ⋆·     Settling.            38 signals → 61 words
 M02  ⋆⋆     Rhythm.             104 signals → 72 words
 M03  ⋆⋆ ◊   Recognition.        161 signals → 78 words   Q1 STORY
 M04  ·      open — day 11 · 47 pts to seal
 M05  ·
 …
```

Tap a row → full paragraph. Tapping `Q1 STORY` opens the quarter compression. Empty slots show only `·`; nothing nags.

---

## 4. THE MONTH WIDGET (replaces `MonthlyPulseWidget`)

Reuses the `Block label=… blockView` pattern and `onLabelClick` cycling that `InterfaceEvolutionWidget` already uses.

```
Month 3:                                    ← label click cycles: Memory · Ledger · Seal
Recognition.

You wrote on 19 days. The mornings you checked in at 8 AM
were the ones you described as "steady". Self-care clicks
doubled after the second week, and the word "slow" stopped
appearing in your log.

161 signals → 78 words                       3/12 months unlocked
```

- **Memory view:** the paragraph + compression line.
- **Ledger view:** counts only (entries, check-in days, self-care clicks, answers), this month vs last.
- **Seal view:** glyph, seal level, Presence Index, days left to re-open (if OPEN).

Implementation note: keep the existing dismiss phrases and `localStorage` convention, keyed by month.

---

## 5. THE 12 MONTHS

### 5.1 Overview

| M | Name | AI stage | Density floor | New visible thing | Seal glyph | Story format |
|---|---|---|---|---|---|---|
| 1 | Install | Observer | breathable | Day-1 core: 5 blocks | `⋆·` | Week-1 echo + Month Memory (descriptive) |
| 2 | Observe | Observer | breathable | Check-in streak line | `⋆⋆` | Month Memory |
| 3 | Recognize | Noticer | comfortable | Pattern line · Quarter 1 | `⋆⋆◊` | Month Memory + **Q1 Story** |
| 4 | Ask | Asker | comfortable | Daily single question | `◊·◊` | Month Memory (second person begins) |
| 5 | Anchor | Asker | compact | Planner + intentions | `◊⋆◊` | Month Memory |
| 6 | Portrait | Companion | compact | Half-year Portrait · Story archive | `∼·∼` | Month Memory + Q2 + **Half-year Portrait** |
| 7 | Guide | Guide | dense | Self-care routine suggestions | `∼⋆∼` | Month Memory + routine recommendation |
| 8 | Anticipate | Guide | dense | Context widgets (sky, circadian) | `▪·▪` | Month Memory |
| 9 | Habit | Navigator | dense | Q3 Story · routines become named | `▪⋆▪` | Month Memory + **Q3 Story** |
| 10 | Navigate | Navigator | instrument | Cohort + community layer | `◇·◇` | Month Memory |
| 11 | Author | Author | instrument | Operator edits next-month intent | `◇⋆◇` | Month Memory + draft Year outline |
| 12 | LOT® AI | LOT® AI | instrument | Year Story · API · full OS | `⋆⋆⋆ ◊ ∼ ▪ ◇` | Month Memory + Q4 + Half + **Year Story** |

Glyphs are drawn only from `BADGE_PROGRESSION_PREVIEW.md` (Option 1 set). Density floors are *floors*: earned `visualRefinement` may exceed them, never fall below.

### 5.2 Month cards

Each card: **screen · unlock · AI behavior · affirmation · ritual**. Widgets named are existing components in `src/client/components/`.

#### M1 — INSTALL (Observer)
- **Screen (day 1, barebone):** name + week/date line · Month Widget (`Months unlocked: 0/12`) · Emotional check-in · one **Self-care** button · Log link. Time and weather only. Five blocks, large gaps. This is the non-paid layout's calm, plus the three habits we need to measure.
- **Unlock:** none by design. Sealing M1 is the first reward.
- **AI:** silent. Observes. Never asks a question this month.
- **Affirmation:** "The first month. The system is beginning to know you." (existing line, kept)
- **Ritual:** day 7, a one-line Week-1 echo (Job 24 already generates it). Day 30, the first Month Memory arrives; it is *short and humble* by design.

#### M2 — OBSERVE (Observer)
- **Screen:** + streak line under the check-in (`11 mornings`). + `Months unlocked` gains its 12-segment bar.
- **AI:** still silent; the Ledger view appears so counts are visible.
- **Affirmation:** "Patterns are starting to form."
- **Ritual:** Memory Shelf appears in Log with two filled slots.

#### M3 — RECOGNIZE (Noticer) · QUARTER 1
- **Screen:** + `PatternInsightsWidget` (one pattern sentence at a time). Density → comfortable.
- **AI:** first *noticing* ("You log more after rain.") with no question attached.
- **Affirmation:** "Three months. You have reached Active User status." (existing)
- **Ritual:** **Q1 Story** — three Month Memories compressed to one 100–130 word paragraph. First time the operator sees compression *of compression*.

#### M4 — ASK (Asker)
- **Screen:** + `MemoryWidget` daily question (one at a time; the Memory Engine already generates these). Voice shifts to "You".
- **AI:** first question, earned: asked only after 3 months of signal.
- **Affirmation:** "The portrait deepens."
- **Ritual:** Month Memory ends with *one question for next month* — the answer folds into M5's story.

#### M5 — ANCHOR (Asker)
- **Screen:** + `PlannerWidget`, `IntentionsWidget`. Density → compact (sections distinct, stacks tight).
- **AI:** ties questions to the declared intention (existing PLANNER-CONTEXT behavior).
- **Affirmation:** "Consistency is its own reward."
- **Ritual:** Month Memory quotes the operator's own intention verbatim.

#### M6 — PORTRAIT (Companion) · HALF-YEAR
- **Screen:** + `NarrativeWidget` (narrative reflection), Memory Shelf archive view, `InterfaceEvolutionWidget` (the 7 dimensions become visible for the first time).
- **AI:** companion voice; refers back to month 1 explicitly ("In month 1 you…").
- **Affirmation:** "Six months. The journey is half-declared." (existing)
- **Ritual:** **Half-year Portrait** — 150–180 words + side-by-side "Month 1 vs Month 6" Ledger. The single most legible *before/after* moment in the product.

#### M7 — GUIDE (Guide)
- **Screen:** + `RecipeWidget`, `SelfCareMoments` suggestions ranked by what the operator actually does. Density → dense.
- **AI:** first self-care routine *recommendation*, built from M1–M6 click history.
- **Affirmation:** "Seven months in. The system has been listening."
- **Ritual:** Month Memory ends with one routine, named after the operator's own behavior, e.g. "Your Tuesday reset".

#### M8 — ANTICIPATE (Guide)
- **Screen:** + sky / circadian / astrology context rows, `QuantumStateWidget`, `GoalJourneyWidget`. Ambient convergence line already in `System.tsx`.
- **AI:** anticipates (asks about rest on overcast mornings — the Product Brief's own example).
- **Affirmation:** "Eight months. Rare air."
- **Ritual:** Month Memory notes one *correct prediction* the system made ("It asked about rest; you had slept four hours").

#### M9 — HABIT (Navigator) · QUARTER 3
- **Screen:** + `MoodAnalytics`, `CorrelatedIndexesWidget`. Routines get names and streaks.
- **AI:** navigator voice: weighs actions above intentions (Product Brief principle).
- **Affirmation:** "Nine months. The self-care practice is a habit now." (existing)
- **Ritual:** **Q3 Story**, plus the first retroactive line: "Habits formed this year: …".

#### M10 — NAVIGATE (Navigator)
- **Screen:** + `CohortConnectWidget`, shared-emotion row, community pulse. Density → instrument.
- **AI:** places the operator inside the collective without exposing private logs.
- **Affirmation:** "Ten months. Almost there."
- **Ritual:** Month Memory names the operator's cohort position in one sentence.

#### M11 — AUTHOR (Author)
- **Screen:** + `exportData`, widget arrangement, custom theme (existing unlocks). Operator can edit the *intent line* that seeds the Year Story.
- **AI:** drafts the Year outline and asks the operator to correct it. First time the operator co-writes the story.
- **Affirmation:** "Eleven months. One more."
- **Ritual:** Year outline appears as 5 bullet lines: *what you started, what you kept, what you dropped, what surprised you, what's next.*

#### M12 — LOT® AI (full)
- **Screen:** the complete OS as seen on `/u/machiavelli`: instrument density, all earned widgets, public OS page, API access.
- **AI:** speaks in the operator's behavioral voice. Story API opens (`GET /api/story/year`; export to robot / vehicle / dashboard when those targets exist).
- **Affirmation:** "One year with LOT. The portrait is complete — and still evolving." (existing)
- **Ritual:** **Year Story** (220–260 words) + the 12-glyph signature. Then month 13 begins with the Shelf *kept*, not reset: year 2 compresses *on top of* year 1.

---

## 6. DEMO ACCOUNT — `/u/machiavelli` AS THE MONTH-12 REFERENCE

The demo is hardcoded server-side, so it needs no real data. Proposed additions (all demo-only, no effect on real users):

1. **Fixture** `MACHIAVELLI_TIMELINE`: twelve entries (month name, seal, signals_in, words_out, paragraph).
2. **Scrubber** `?month=1..12`: renders the profile as it would look at that month (density, widget set, Shelf slots filled). Visitors can drag from barebone to full OS. This is the sales demo for the 12 months.
3. **Months unlocked: 12/12** pinned on the public card, FULL seals on months 3, 6, 9, 12.

### 6.1 Draft fixture — twelve Month Memories (Florence, in character)

Signal counts are **illustrative design targets**, not measured data. Voice shifts per Section 3.1.

| M | Seal | signals → words | Paragraph |
|---|---|---|---|
| 1 | `⋆·` | 38 → 52 | Niccolò opened the system in a rented room above the Arno. He logged little, checked in most mornings, and described the light before he described himself. |
| 2 | `⋆⋆` | 104 → 58 | Mornings took shape. He checked in on 21 days, always before the market opened, and began ending entries with a single observed fact. |
| 3 | `⋆⋆◊` | 161 → 71 | He wrote on 19 days. Entries about the Medici shortened as his self-care clicks doubled. The word "slow" stopped appearing. |
| 4 | `◊·◊` | 188 → 66 | You answered your first question: whether you eat before or after you write. After. The log hasn't skipped a Sunday since. |
| 5 | `◊⋆◊` | 214 → 69 | You declared one intention each morning and closed twelve of them in writing. The ones you closed began with a verb. |
| 6 | `∼·∼` | 236 → 74 | Half a year. In month 1 you described the light. Now you describe what you will do with it. Self-care is no longer an exception to your day; it is the day's first line. |
| 7 | `∼⋆∼` | 251 → 63 | Your Tuesdays run heavy and you rest on Wednesdays without being asked. We named it: the Wednesday reset. It held four weeks in a row. |
| 8 | `▪·▪` | 262 → 60 | On the overcast morning you slept four hours, the system asked about rest, not ambition. You answered in one word: "yes". |
| 9 | `▪⋆▪` | 279 → 77 | Three habits survived the quarter: the morning check-in, the Wednesday reset, the Sunday review. You rarely miss them now, and you stopped counting. |
| 10 | `◇·◇` | 291 → 58 | Your cohort moves slower in November. You wrote more, not less. That is your pattern: when the room quiets, you go inward. |
| 11 | `◇⋆◇` | 304 → 64 | You corrected the outline twice. You kept "patience", dropped "control", and moved "writing" from the second line to the first. |
| 12 | `⋆⋆⋆◊∼▪◇` | 311 → 84 | A year. Started: a morning check-in. Kept: nearly all of it. Dropped: the hour of worry before dawn. Surprised: how much of the prince was just routine. Next: the same, a little deeper. |

Month-12 line doubles as the Year Story seed shown on the public OS page.

---

## 7. BADGES — MONTH SEALS

- Twelve **Month Seals** (one per month), plus four **Quarter marks** (M3, M6, M9, M12) and one **Year mark** (M12).
- Glyph ladder is the existing badge language (Section 5.1). Seal level maps to glyph: OPEN `·`, SEALED base glyph, FULL base glyph with a second mark (`⋆·` → `⋆⋆`).
- Seals live in the Memory Shelf and as a single line on the public OS page (`M01 ⋆· M02 ⋆⋆ M03 ⋆⋆◊ …`).
- Seals never expire and are never removed. Re-opened OPEN months (14-day window) upgrade in place.
- Relationship to existing badge themes (water / architecture): the theme colors the glyph row; it does not change seal logic.

---

## 8. IMPLEMENTATION PLAN

Phased so each step ships and is useful alone. No step touches existing logs.

| Phase | Scope | Files (verify before editing) |
|---|---|---|
| P1 — Month engine | Presence Index + seal calculation (pure function, unit-testable) · `/api/usership/months` returns `{ month, sealed[], index, daysToSeal }` | new `src/server/utils/usership-months.ts`, `routes/api.ts` |
| P2 — Month Widget | Replace `MonthlyPulseWidget` body with 3-view widget + `Months unlocked` bar; keep dismiss pattern | `MonthlyPulseWidget.tsx`, `System.tsx` |
| P3 — Month Memory job | Anniversary-day job: compose Month Memory from 4 week stories + counts (template first, AI polish second); write `usership_month_memory` log + metadata | `scheduled-jobs.ts` (next free job number, last seen is Job 46; verify), `story-generator.ts` |
| P4 — Shelf + Cascade | Memory Shelf in Log; Quarter / Half / Year compression at M3 / M6 / M9 / M12 | `Logs.tsx`, `story-generator.ts` |
| P5 — Barebone Day 1 | Month-gated widget families in the pro layout (Section 5.1). Gate with `month >= unlockMonth`, not new tags | `System.tsx` |
| P6 — Demo scrubber | `MACHIAVELLI_TIMELINE` fixture + `?month=` on public profile | `public-api.ts`, `PublicProfile.tsx` |
| P7 — Story API | `GET /api/story/month/:n`, `/year`, export targets | `routes/api.ts`, `public-api.ts` |

### 8.1 Risks

- **Grandfathering.** Existing Usership users joined at different dates. Backfill: treat historic months as SEALED only where logs exist; never grant or compose retroactive months from nothing.
- **Layout regression.** P5 hides widgets from paying users who see them today. Mitigate: apply month gating only to accounts whose `joinedAt` is after the ship date; existing users keep today's layout.
- **Story quality.** Ten-year continuity (Product Brief) depends on Month Memories not being generic. Keep the template deterministic; log which variant (template vs AI) produced each paragraph.
- **Presence weights are guesses.** Calibrate the 60 / 120 thresholds against the real distribution of the existing Usership cohort before turning seals on.
- **Pressure.** The 14-day re-open window and thin-month labelling are the guardrails; do not add reminders.

---

## 9. OPEN QUESTIONS FOR S-2

1. Should an OPEN month ever count toward `Months unlocked` (e.g. after the 14-day window), or stay strictly earned?
2. Are Legacy / Admin tiers (3 yr / 9 yr) the same cascade extended (Year 2, Year 3 Stories), or a separate track?
3. Should the Year Story be publicly visible on `/u/<user>` by default, or opt-in?
4. Does the email mirror include the full paragraph, or a teaser plus link?
5. Which voice shift (third → second → behavioral) is acceptable for the Story API payloads consumed by robot / vehicle?

---

*LOT® Founded 7 April 2016 · COSMO® Founded 1 July 2024*
*Made in the USA · brand.lot-systems.com*
*AUTHORIZED BY: S-2 // VADIK MARMELADOV*
