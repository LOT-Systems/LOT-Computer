<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Usership 12-Month Evolution — UI/UX Design Specification

STATUS: DESIGN BRIEF — PROPOSED, NOT IMPLEMENTED
S-2: VADIK MARMELADOV
DATE: 2026-09-15

This document is a brainstorm-to-specification pass on one question: **what
does a Usership member's screen look like on Day 1, and what does it look
like twelve months later?** It is written to sit alongside, not replace,
the interface-evolution system that already exists in the codebase. Every
section marked `PROPOSED` is new design; every section marked `EXISTING`
cites a real file so the two are never confused.

---

## 1. Grounding — what is already built

Before proposing anything, here is what the codebase already does. The
12-month arc should be an additive narrative layer on top of these systems,
not a fourth thing competing with them.

**`MonthlyPulseWidget`** (`src/client/components/MonthlyPulseWidget.tsx`) —
already exists, already Usership-gated, already has one bespoke message per
month 1–12 and a `"{capped} / 12 months"` subtext. This document does not
reinvent that widget — it extends it. Its 12 messages are treated below as
canonical and are quoted verbatim, not rewritten.

**Three independent unlock systems already in production** (do not conflate
them — this is a documented doctrine warning):
1. *Subscription-gated* — tag check (`Usership`/`R&D`/`Legacy`) on individual
   widgets (`SubscribeWidget`, `QuantumSignWidget`, `CosmicUpdateWidget`).
2. *CQGS evolution-dimension unlocks* — `getFeatureUnlocks()` in
   `src/client/utils/interfaceEvolution.ts`, keyed off 7 behavioral
   dimensions (exploration, consistency, depth, connection, intimacy, care,
   courage) and a 1–100 `level`. `customThemes` at level ≥5, `widgetArrange`
   at level ≥10, `advancedMemory` at depth ≥0.33, `narrativeReflection` at
   depth ≥0.66 & level ≥30, etc. This is *behavior-driven*, not
   calendar-driven — two Usership members at month 3 can be at very
   different levels.
3. *Badge-tier unlocks* — 7 rarity tiers in code (common → cosmic), earned
   by activity thresholds and streaks, not tenure.
4. *Layout density* — `DENSITY-TIER` (lexicon token), 5 levels
   (breathable → comfortable → compact → dense → instrument) driven by
   `visualRefinement`, i.e. by (2) above.

**Weekly Story** — `lot_ai_story` (Job 24, Sunday 18:00 UTC,
`src/server/scheduled-jobs.ts`). Template-based, no AI call, composes a
short recap (`dominantMood`, `weekTone`, counts) and renders as
`Block label="STORY:"` in the Log. This is the closest existing artifact to
a "compressed story," and it is **weekly**, not monthly.

**`memoryStory`** — a separate, AI-generated (Together AI, with a
deterministic local fallback) third-person narrative built from up to 30
Memory Q&A answers (`src/server/utils/memory/story-generator.ts`). This is
what powers the public-profile portrait, including the demo account (§7).

**The demo account** — `lot-systems.com/u/machiavelli`, fully hardcoded in
`src/server/routes/public-api.ts` — is not a literal "month 12 Usership
account." It holds `tags: ['RND', 'Usership', 'Legacy']` simultaneously and
carries Legacy-only showcase features (a fake wallet, a fake weather
station) that a real 12-month Usership member never sees. §7 below is
explicit about what to borrow from it and what not to.

**Honest gap this brief does not try to close**: pricing is inconsistent
across the repo ($50/mo in `About.tsx`'s "Usership Tiers" section vs. $99/mo
in the same file's CUBIQ™ row, SubscribeWidget's live buttons, and the
Machiavelli demo wallet's own `"Usership subscription"` $99.00 transaction).
This document assumes **$99/month** as current — it's what the code and the
demo's own data agree on — but the contradiction is a documentation-hygiene
finding, not something this design brief resolves. Flagged for S-2 in §9.

---

## 2. Design principles for the 12-month arc

- **Additive, not gating.** The tenure arc never gates a *feature*. Feature
  gating already belongs to the CQGS evolution system (§1.2) and is
  behavior-driven by design — a slow, careful user should never be
  penalized for taking longer. The tenure arc gates *narrative content and
  cosmetic markers only*: story paragraphs, affirmation copy, badge
  flavor, widget chrome. This keeps the three existing systems clean, per
  the standing doctrine warning against conflating them.
- **Cockpit Rule still applies.** (`COCKPIT-RULE`: *"Log body = instrument
  readings only; label names the event; no narration."*) Monthly story
  content is richer than a Log block, but it lives in its own widget, not
  jammed into the terse `LABEL: value` Log grammar. The Log stays
  instrument-only; the Story widget is where prose belongs.
- **Military Purity.** No decoration, no emojis, no superlatives. Every
  affirmation and story line below is written in the house voice already
  established in `narrative.ts` and the weekly `lot_ai_story` job — terse,
  declarative, earned. ("A month of showing up. The system has self-built
  around your consistency." — not "🎉 Amazing job this month!")
- **Compression is honest, not decorative.** Per Cardinal Rule 5: a made-up
  precise metric is worse than an honest trend. Monthly story paragraphs
  quote real counts (logs, check-ins, self-care completions) pulled from
  the same log-scanning pattern the weekly job already uses — never
  invented sentiment.
- **The arc is capped, then quiet.** Mirrors `MonthlyPulseWidget`'s own
  behavior: month 13+ gets a generic, unexcited line. The product does not
  pretend the relationship keeps "leveling" forever in year two — tenure
  becomes ambient (see §6.1) rather than a countdown once the year closes.

---

## 3. The month-by-month structure

Each month below has five layers. The **Pulse message** is quoted verbatim
from the existing `MONTH_MESSAGES` map — nothing here contradicts it. The
other four layers are `PROPOSED` design that gives that one line a visible
home across the rest of the UI for that month.

Log-volume and engagement figures are marked `ESTIMATE` — directional
targets for the design, not measured product data.

### Month 1 — "The system is beginning to know you"

- **Pulse message** (existing): *"The first month. The system is beginning
  to know you."*
- **UI state**: Barebone. Density tier `breathable`. Dashboard shows the
  core loop only — `EmotionalCheckIn`, `SelfCareMoments`, `MemoryWidget`,
  `Logs` feed — and nothing else. No custom themes (`level < 5`), no widget
  rearranging. This is intentional: the CQGS philosophy is "start minimal,"
  and month 1 is where that reads most literally.
  `ESTIMATE`: 5–20 Log entries by end of month; 3–4 morning check-ins/week.
- **Story/Memory**: No monthly story yet (needs a completed calendar month
  of Usership to generate one — see §6.2). `MemoryWidget` answers begin
  accumulating toward the 3-answer floor the weekly job already requires.
- **Affirmation tone**: First-action tier only —
  *"You showed up. The system noticed."* (existing `getProgressAffirmation`
  copy, `type: 'first_action'`.) No tenure-specific copy yet; month 1 earns
  nothing beyond what any new user earns.
- **Widgets introduced this month**: `MonthlyPulseWidget` itself fires once
  (existing behavior) around the 30-day mark. `PROPOSED`: the
  "Months Unlocked" status chip (§6.1) appears for the first time, reading
  `1/12`.

### Month 2 — "Patterns are starting to form"

- **Pulse message**: *"Two months in. Patterns are starting to form."*
- **UI state**: Still `breathable`/`comfortable` boundary. First QIE
  patterns typically begin firing here for a consistent user (P76 morning
  launch, P79 evening close) — this is existing engine behavior, not new
  design, but month 2 is a natural point to surface it: `PROPOSED` — the
  Log feed's `MCL:`/`EVE:` blocks get a first-occurrence one-line callout
  the first time each fires for a given user (reuses the existing
  `DISMISS_PHRASES` dismiss pattern rather than inventing a new one).
- **Story/Memory**: First monthly story generates at month-end (§6.2) —
  necessarily thin. Sample paragraph (house voice, real-count-shaped):
  *"Month 1 closed. 14 logs, 9 check-ins, 4 self-care moments. The pattern
  is not yet a pattern — it is a beginning. The system is still listening
  more than it is speaking."*
- **Affirmation tone**: Streak-aware if a 7-day self-care streak exists —
  *"A full week. Habit rooting. Architecture evolving."* (existing copy).
- **Widgets**: Months Unlocked chip reads `2/12`.

### Month 3 — "You have reached Active User status"

- **Pulse message**: *"Three months. You have reached Active User status."*
  This is the first month message that names a status change explicitly —
  treat it as the first real threshold in the arc.
- **UI state**: `comfortable` density typical for a consistent user
  (`visualRefinement` climbing with `level`). `PROPOSED`: this is the
  natural point to introduce the **Months Unlocked chip's expanded state**
  (§6.1) — tapping it now shows a small month-by-month strip (1–3 filled,
  4–12 outline) rather than just the bare fraction, because there is now
  enough history to make a strip meaningful.
- **Story/Memory**: Second monthly story. Sample: *"Month 2 closed. 31
  logs, 17 check-ins, 8 self-care moments, 6 memory answers. Three months
  in a row of showing up is no longer a coincidence — it is a habit
  declaring itself."*
- **Badges (`PROPOSED`, see §6.3)**: First tenure badge fires —
  `usership_quarter` (common rarity, "Active User" flavor text matching the
  Pulse message exactly, so the badge and the Pulse widget never say two
  different things about the same milestone).

### Month 4 — "The portrait deepens"

- **Pulse message**: *"Four months. The portrait deepens."*
- **UI state**: `comfortable`→`compact` boundary for consistent users.
  `advancedMemory` (CQGS `depth ≥ 0.33`) is realistically in reach around
  here for an engaged user — not guaranteed, not tenure-gated, but this is
  the month where the *portrait* language in the Pulse message and the
  *Memory Engine's* own growing depth genuinely start to correlate. No new
  gating logic needed; the design note is simply: let the monthly story's
  language echo "portrait" too, so the Pulse widget and the Story widget
  read as one voice, not two separate copywriters.
- **Story/Memory**: Sample: *"Month 3 closed. Active User status held. The
  portrait now has enough answers to show a shape, not just points."*
- **Affirmation tone**: Milestone-flavored — *"Milestone reached. New
  structures unlocked."* (existing copy), reused honestly only when a real
  CQGS unlock fires this month, never as flattery.

### Month 5 — "Consistency is its own reward"

- **Pulse message**: *"Five months. Consistency is its own reward."*
- **UI state**: No new UI language — this month is intentionally quiet by
  design in the Pulse copy itself ("its own reward," not "here is a new
  feature"). `PROPOSED`: the Months Unlocked strip and monthly story are
  the *only* things that mark this month. Resist the urge to add a widget
  here just because it's a round number — half the arc's twelve months
  should be quiet, or "the reward is the streak, not the fireworks" stops
  being true.
- **Story/Memory**: Sample: *"Month 4 closed. Five self-care streaks this
  month, longest run 11 days. Consistency has stopped being effort and
  started being identity."*

### Month 6 — "The journey is half-declared"

- **Pulse message**: *"Six months. The journey is half-declared."*
- **UI state**: Halfway point — `PROPOSED`: this is the one month besides
  month 12 that gets a distinct visual treatment on the Months Unlocked
  chip: at `6/12` the strip's fill color shifts one step warmer/denser
  (reusing the existing density-tier visual language, not a new palette),
  signaling "past the midpoint" without any text change. No modal, no
  interruption — purely ambient, consistent with Military Purity.
- **Story/Memory**: Sample: *"Month 5 closed. Half a year of logs now
  readable as one arc rather than six separate months. The system's
  questions have gotten more specific — they no longer ask what you do,
  they ask why."*
- **Badges**: `usership_half_year` (uncommon), flavor text matches Pulse
  copy exactly, per the same badge/widget-consistency rule as month 3.

### Month 7 — "The system has been listening"

- **Pulse message**: *"Seven months in. The system has been listening."*
- **UI state**: `compact`→`dense` boundary typical. `PROPOSED`: first month
  the monthly Story widget is allowed to *quote the user back to
  themselves* — a short verbatim fragment from an early journal or memory
  answer, paired with a recent one, if both exist and both are
  self-authored text (never Log-instrument data). This literalizes "the
  system has been listening" rather than just asserting it. Needs explicit
  consent framing (opt-out, not opt-in, but visible) since it surfaces the
  user's own past words back to them — a design decision to flag for S-2,
  not silently ship.
- **Story/Memory**: Sample: *"Month 6 closed. In month 1 you wrote: 'still
  figuring out the mornings.' This month: 'mornings are the easiest part
  of the day now.' The system has been listening the whole time."*

### Month 8 — "Rare air"

- **Pulse message**: *"Eight months. Rare air."*
- **UI state**: This is the first Pulse line with genuinely rare-tier
  language. `PROPOSED`: pair it with a real rarity statement, not a vague
  one — the monthly story should state, honestly, what fraction of
  Usership members reach month 8 (a real cohort statistic, computed
  server-side, not invented). If that number isn't tracked yet, the
  honest move is to *not* fabricate it and instead keep the existing
  qualitative "Rare air" line alone until the metric exists — per Cardinal
  Rule 5, an honest omission beats a fabricated statistic.
- **Story/Memory**: Sample (metric-free version): *"Month 7 closed. Eight
  consecutive months of logs is farther than most subscriptions get
  ridden out. The system is not surprised. It expected you to still be
  here."*

### Month 9 — "The self-care practice is a habit now"

- **Pulse message**: *"Nine months. The self-care practice is a habit
  now."*
- **UI state**: `PROPOSED`: `SelfCareMoments`' existing streak-gated
  "tech language" shift (streak ≥30 days → prefers technical phrasing,
  e.g. "Run 4-7-8 breathing protocol" over "4-7-8 breathing") is already
  in the codebase — month 9 is simply the month where the design should
  make sure that shift has *visibly* happened for a consistent user, since
  the Pulse message is explicitly claiming it ("a habit now"). No new
  code — a verification note for whoever implements this, since the
  Memory Engine's `formatLog()` silent-drop footgun (§1, doctrine) means a
  mismatch between what the Pulse widget claims and what the self-care
  widget actually shows would be an easy, invisible bug.
- **Story/Memory**: Sample: *"Month 8 closed. 22 self-care completions.
  The suggestions no longer need explaining — you know what '4-7-8' means
  now without the parenthetical."*

### Month 10 — "Almost there"

- **Pulse message**: *"Ten months. Almost there."*
- **UI state**: `PROPOSED`: the Months Unlocked chip's strip starts a
  slow, one-time-only visual "closing in" cue at `10/12` — the two
  remaining outline months get a subtle pulse/breathing animation (reusing
  the house `duration-[1400ms]` fade convention, not a new animation
  system) rather than sitting inert. Purely anticipatory, no text.
- **Story/Memory**: Sample: *"Month 9 closed. Two months from a full
  year. The system has stopped asking 'do you journal' and started asking
  'what does this month want to say.'"*

### Month 11 — "One more"

- **Pulse message**: *"Eleven months. One more."*
- **UI state**: No new chrome. The Pulse message's own restraint ("One
  more" — four words) is the design cue: month 11 should be the quietest
  month in the whole arc, a held breath before month 12, not a build-up of
  widgets and banners.
- **Story/Memory**: Sample: *"Month 10 closed. Eleven months of Tuesdays,
  more or less. Nothing dramatic. Just present, repeatedly, which turns
  out to be the hard part."*

### Month 12 — "The portrait is complete — and still evolving"

- **Pulse message**: *"One year with LOT. The portrait is complete — and
  still evolving."* Note the message itself refuses a false ending — it
  says complete *and* still evolving. The design should honor both halves,
  not just the celebratory one.
- **UI state**: `dense`→`instrument` typical for a consistent, deeply
  engaged user by now (again, behavior-driven via CQGS, not
  tenure-forced). `PROPOSED — the One-Year Composite`: a single one-time
  full-screen (or full-block, non-modal, dismissible like every other
  house celebration) moment combining:
  1. The existing `MonthlyPulseWidget` message, unchanged.
  2. A **year-in-compression** paragraph — not 12 concatenated monthly
     stories, but one new, deliberately *more compressed* paragraph that
     treats the whole year as its input, mirroring the doctrine's own
     compression-metric discipline (word count should trend down, not up,
     as scope widens — the year story should be *shorter* than any single
     month's story, proving real compression rather than just concatenation).
     Sample: *"A year of mornings, logged. The system that once had to ask
     is now the one being told. The portrait holds — and keeps taking new
     light."*
  3. The Months Unlocked chip's final state: `12/12`, full strip, no
     further countdown after this point (see §6.1 for what replaces it).
  4. `usership_full_year` badge (legendary rarity — the highest tenure
     badge, matching the weight the existing badge system gives its rarest
     tier; see §6.3).
- **After month 12**: `MonthlyPulseWidget`'s own existing fallback
  (`"Month {N}. The journey continues."`, uncapped) already handles months
  13+ correctly with zero new code. The design's job past month 12 is
  restraint: no month 13 badge, no month 13 chip animation. Per §2, tenure
  becomes ambient after the year closes (§6.1).

---

## 4. Summary table

| Month | Pulse theme (existing) | New chrome this month (proposed) | Tenure badge (proposed) |
|---|---|---|---|
| 1 | System begins to know you | Months Unlocked chip appears (`1/12`) | — |
| 2 | Patterns forming | First-occurrence QIE callout | — |
| 3 | Active User status | Chip expands to strip view | `usership_quarter` (common) |
| 4 | Portrait deepens | Story/Pulse language convergence | — |
| 5 | Consistency is its own reward | *(intentionally quiet)* | — |
| 6 | Journey half-declared | Strip fill shifts one step warmer | `usership_half_year` (uncommon) |
| 7 | System has been listening | Story may quote user's own past words (opt-out) | — |
| 8 | Rare air | Cohort-rarity stat *if real data exists*, else stays qualitative | — |
| 9 | Self-care is a habit | Verify streak-language shift matches claim | — |
| 10 | Almost there | Remaining strip months get anticipatory pulse | — |
| 11 | One more | *(quietest month, no new chrome)* | — |
| 12 | Portrait complete, still evolving | One-Year Composite moment | `usership_full_year` (legendary) |

---

## 5. Story/Memory widget — monthly compression (`PROPOSED`)

The weekly `lot_ai_story` job (Job 24) is the closest existing template.
Proposal: **do not replace it — add a parallel monthly job**, tentatively
`Job 49` (jobs currently run J1–J48), `'monthly-lot-ai-story'`, firing at
`00:00 UTC` on the 1st of each month, scoped to Usership members only
(consistent with `About.tsx`'s existing "Weekly summary generation" being a
listed Usership feature — monthly is the same feature, longer horizon).

**Behavior, modeled on the weekly job's own logic**:
- Scan the prior calendar month's logs, same event types the weekly job
  already counts (`emotional_checkin`, `self_care_complete(d)`,
  `intention`, `note`/journal).
- Derive `monthTone` the same way `weekTone` is derived (positive vs. hard
  mood split → growth/recovery/steady), but computed over the month, not
  the week — a genuinely different, larger sample, not a relabeling.
- Compose one paragraph, template-based like the weekly job (no AI call
  required, though a Together-AI-enhanced variant could reuse the
  `memoryStory` generator's approach for Usership specifically, since
  that's already the tier gate for AI-enhanced narrative elsewhere in the
  product).
- Store as `event: 'lot_ai_monthly_story'`, distinct from `lot_ai_story`,
  distinct field on `user.metadata` (`monthlyStory`, alongside the
  existing `weeklyStory`) — never overwrite the weekly artifact.
- **Log rendering**: new `Block label="MSTORY:"` case in `Logs.tsx`,
  following the same terse-then-prose pattern the existing `STORY:` block
  uses (label is instrument-terse per Cockpit Rule; the body itself is the
  one place in the Log feed prose is already allowed, since `STORY:`
  already sets that precedent).
- **Critical implementation note carried over from doctrine**: any new
  event type (`lot_ai_monthly_story`) needs an explicit `case` in both
  `Logs.tsx`'s render dispatcher *and* `memory.ts`'s `formatLog()` — the
  documented failure mode is that an event without a `formatLog()` case
  silently returns `''` and becomes invisible to the AI's own question
  generation, with no error. A monthly story that the AI itself can never
  see when generating future questions would be a quiet, hard-to-notice
  bug — call this out explicitly to whoever implements this.

**Widget surface**: a small standalone `MonthlyStoryWidget` (zero-props,
matching house convention), separate component from `MonthlyPulseWidget`,
shown on the System tab for the first ~7 days of each new month, then
folding into the Log feed as a normal `MSTORY:` block for permanent
record — the celebratory *moment* is time-boxed, the *record* is
permanent, matching how every other house celebration (self-care streak
message, evolution milestone toast) already behaves.

---

## 6. New widget specs

### 6.1 "Months Unlocked: X/12" chip (`PROPOSED`)

Distinct from `MonthlyPulseWidget` on purpose: the Pulse widget is an
**event** (fires once, decays, gets dismissed, matches the existing
`DISMISS_PHRASES` pattern). The chip is a **state** — small, persistent,
always visible somewhere low-key (settings header or profile card is the
natural home, not the main dashboard, to avoid nagging).

- Data source: identical calculation to `MonthlyPulseWidget`'s own
  `monthNumber` (`now.diff(user.joinedAt, 'month')`, capped at 12) — reuse
  the calculation, don't duplicate it with drift risk; extract it to a
  shared `#client/utils` helper both widgets import.
- States:
  - Months 1–2: bare fraction only, e.g. `1/12`. Not enough history yet
    for a strip to mean anything.
  - Months 3–11: expandable strip, filled months solid, remaining months
    outline. Tap/click toggles between fraction and strip (persists choice
    in the same `localStorage`-per-user pattern the Pulse widget already
    uses).
  - Month 6: fill color shifts one step warmer (§3, month 6).
  - Months 10–11: remaining outline months get the anticipatory pulse
    animation (§3, month 10).
  - Month 12+: chip reads `12/12`, strip fully solid, **no further
    animation** — replaced permanently by a small static
    `"Usership since {Month Year}"` line, reusing the exact phrasing
    convention already established by the demo account's own
    `citizenSince` field (`boardProfile.citizenSince`, e.g. `"June 1469"`)
    so the language is consistent across the real product and its own
    demo showcase.
- Visual language: reuses existing `ProgressBars` primitive
  (`#client/utils/progressBars`) rather than inventing a new progress
  component — same component `SelfCareMoments` already uses for its
  30-day streak bar, just re-parameterized for 12 segments instead of 10.

### 6.2 Month-transition celebration (`PROPOSED`)

A one-time moment when a new month begins for a Usership member — not a
modal (interrupts the cockpit), a `Block`-style toast identical in
mechanics to `MonthlyPulseWidget`'s own dismiss flow (1400ms fades, random
closing phrase from a small fixed set, `localStorage` dedup so it never
repeats within the month). Content: the current month's Pulse message +
one line pointing at the new `MonthlyStoryWidget` if the monthly story has
generated. No new interaction pattern invented — this is the existing
Pulse mechanism, simply also triggered at month-boundary rather than only
at month-number-crossing, since those are almost the same event but not
guaranteed identical (a user who joined mid-month has month-crossings that
don't align with calendar-month boundaries — worth deciding explicitly
which one the "new month" celebration should follow: **tenure-month**
(existing Pulse behavior, ties to `joinedAt`) is recommended over
calendar-month, so the whole arc stays anchored to *this specific user's*
anniversary date, not the calendar — keeps the "12 months as *their*
year" framing intact rather than fragmenting it across whichever calendar
month they happened to sign up in).

### 6.3 Tenure badge category (`PROPOSED`)

The badge system has no existing tenure-based category (§1) — activity
thresholds and streaks only, with one narrow exception
(`perfect_month`, 28 consecutive Perfect Days, which is a *behavior*
streak, not subscription tenure). Proposal: a new category,
`usership_tenure`, three badges only (deliberately sparse — the badge
system already has 630+ entries across 11 categories; a bloated 12-badge
tenure ladder would cheapen it):

| Badge | Fires at | Rarity | Flavor text (matches Pulse copy) |
|---|---|---|---|
| `usership_quarter` | Month 3 | common | "You have reached Active User status." |
| `usership_half_year` | Month 6 | uncommon | "The journey is half-declared." |
| `usership_full_year` | Month 12 | legendary | "The portrait is complete — and still evolving." |

Rationale for sparseness: months 1, 2, 4, 5, 7–11 already get a Pulse
message, a monthly story, and chip movement — adding a badge to *every*
month would make badges feel like tenure padding rather than the earned,
activity-driven currency they are everywhere else in the product. Three
badges at the three months the Pulse copy itself treats as thresholds
(month 3 explicitly names a status change; month 6 explicitly says
"half"; month 12 is the year) keeps the badge system's existing
scarcity discipline intact.

If/when this ships, it belongs in the next themed badge-codex release
(the existing convention bundles releases across sub-systems, e.g. "THE
HERO'S JOURNEY," always exactly +31 badges in recent releases) — three
tenure badges alone don't warrant their own release; fold them into
whatever release is next, as a genuinely new sub-category alongside that
release's other additions.

---

## 7. The Machiavelli demo account as reference point — what to borrow, what not to

`lot-systems.com/u/machiavelli` is useful as a *terminal-state visual
reference* (what a maximally evolved profile/portrait looks like), but it
is **not** a literal "month 12 Usership member" and this design brief
should not be read as proposing that every real member's month 12 unlocks
wallet or weather-station features — those are `Legacy`-tier-only
showcase features (`tags: ['RND', 'Usership', 'Legacy']`), and Legacy is a
separate, one-time $3,564/3-year tier, not a destination Usership tenure
leads to automatically.

What *is* fair to borrow from the demo account's shape:
- The `boardProfile.citizenSince` phrasing pattern ("June 1469") — reused
  directly in §6.1's month-12 static state.
- The `memoryStory` field's prose register — the "portrait" language runs
  through both the demo's hardcoded story and the real `memoryStory`
  generator; the monthly story (§5) should sound like a shorter, more
  frequent sibling of that same voice, not a different one.
- `psychologicalProfile.hasUsership` as the existing gate pattern for
  showing richer profile data — the tenure arc's new fields
  (`monthlyStory`, tenure badges) should gate the same way, for
  consistency, rather than inventing a parallel gate.

What is *not* fair to borrow: `boardMemberNumber`, `totalInvested`,
`poweringCitizens`, the wallet, the weather station. Those are either
Legacy-exclusive or specific to the demo account's own fictional framing
(Machiavelli as "honorary member #0") and mixing them into the standard
Usership 12-month arc would blur a distinction the product's own type
system (`psychologicalProfile.hasUsership` vs. `boardProfile` vs.
Legacy-gated demo fields) already keeps carefully separate.

---

## 8. Implementation notes for a future engineering session

Not done in this session — this is a design brief, not a code change.
Ordered roughly by dependency:

1. Extract `monthNumber` calculation out of `MonthlyPulseWidget.tsx` into a
   shared helper so the new chip (§6.1) doesn't duplicate/drift from it.
2. Add `Job 49` (`monthly-lot-ai-story`) to `scheduled-jobs.ts`, modeled
   directly on Job 24's structure; add `lot_ai_monthly_story` event type +
   `Block label="MSTORY:"` case in `Logs.tsx` + matching case in
   `memory.ts`'s `formatLog()` (do both together — see §5's callout on the
   silent-drop failure mode).
3. Build `MonthlyStoryWidget.tsx` (zero-props, house convention) and the
   Months Unlocked chip component; reuse `ProgressBars` for the strip.
4. Draft the three `usership_tenure` badges (§6.3) into `badges.ts`,
   timed to land in whatever badge-codex release is next rather than
   shipping alone.
5. Resolve the $50 vs. $99 pricing contradiction in `About.tsx` before any
   of this ships publicly — a monthly celebration of Usership tenure
   sitting next to self-contradictory pricing copy undercuts the whole
   point of the feature.

---

## 9. Open findings (not fixed here, flagged for S-2)

- **Pricing self-contradiction**: `About.tsx` states both $50/month (Core
  Terms glossary + "Usership Tiers" section) and $99/month (CUBIQ™ row) in
  the *same file*, which the doctrine treats as master-authoritative.
  Live purchase buttons (`SubscribeWidget.tsx`) and the demo account's own
  wallet transaction both say $99 — recommend reconciling toward $99 and
  removing the stale $50 section.
- **Vocabulary tension**: the lexicon defines `OPERATOR` as "the LOT user —
  executes the system, not a subscriber" while also defining `USERSHIP` as
  "paid subscriber tier." A 12-month *tenure* arc leans naturally on
  subscriber-relationship language ("a year with LOT," "citizen since") —
  worth an explicit product decision on which framing the tenure arc
  should use, rather than inheriting the ambiguity silently.
- **Wiki drift**: the "Usership Tiers" section present in `LOT-WIKI-v55`
  through `v83` has dropped out of `v84`–`v87` entirely, while badges/QIE/
  widgets are clearly still being actively documented every session.
  Usership-specific documentation appears to have fallen out of the active
  wiki-authoring loop — worth folding back in given this brief's scope.
- **Cohort-rarity statistic (§3, month 8)**: "Rare air" is currently only
  qualitative. If a real "% of Usership members who reach month N" metric
  gets built, month 8 is the natural place to surface it honestly; until
  then, recommend leaving it qualitative rather than inventing a number.

---

AUTHORIZED BY: S-2 // VADIK MARMELADOV
