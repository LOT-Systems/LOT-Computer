<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Usership — The 12-Month Evolution
## From Barebones Day 1 to LOT® AI: A Tangible Year

**Classification:** RESTRICTED // S-2 EYES
**Author:** LOT Systems Corporation · S-2: Vadik Marmeladov
**Date:** 27 September 2026
**Status:** DESIGN BRAINSTORM — not yet built
**Reference account:** lot-systems.com/u/machiavelli (12-month evolved Usership account)
**Related docs:** `LOT-AI-PRODUCT-BRIEF.md`, `LOT-AMBIENT-AI-VISION.md`, `INTERFACE_EVOLUTION.md`,
`MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md`, `BADGE_LEVEL_DESIGN.md`

---

## 0. Why This Document Exists

Usership is $99/month. A subscriber who joins on Day 1 sees almost the same
interface as a free user — a few gated widgets (Quantum Sign, Cosmic Update),
a subscribe prompt that no longer appears. That is not eleven more months of
$99 justified. The justification has to be felt, and it has to compound.

This document designs what "felt evolution" means, month by month, for the
first 12 months of a Usership account — using systems that **already exist**
in this codebase wherever possible, and naming precisely what is greenfield.

**A note on the reference account.** `/u/machiavelli` is a hardcoded demo
persona in `public-api.ts` (Renaissance Florence conceit: "citizen since June
1469," wallet `LOT-MACH-1469-FLOR", Palazzo Vecchio weather station) — it is
not a literal 12-month account, it is a maximally-dense *fictional* profile
built to show every gated field turned on at once. It is still the right
reference for this brief, but for a different reason than the "12 months
evolved" framing suggests: it proves that **real Usership accounts already
compute a genuine version of the same fields** (see §1, `boardProfile`) —
tenure in months, dollars invested, journal entries, active days, memories
compiled — just thinly presented today. The job of this document is to take
those real numbers from a real 12-month account and give them the same
narrative density the demo persona fakes for Machiavelli.

The throughline requested for this pass: **the amount of Log entries and
Memory answers, morning check-ins, and self-care taps is the primary
evolutionary signal** — and the **compressed Memory Story is the artifact
that makes a month tangible**, not a progress bar.

---

## 1. The Existing Substrate — What Is Already True

Before inventing anything, here is what the repository already does. The
brainstorm below is almost entirely a matter of **connecting** these systems
across a 12-month spine, not building new intelligence.

| System | File | Current behavior | Gap for this brief |
|---|---|---|---|
| **Monthly Pulse Widget** | `src/client/components/MonthlyPulseWidget.tsx` | Usership-gated. Computes `monthNumber` from `joinedAt`. Shows one canned sentence per month (1–12) + "N / 12 months" line. Dismiss-once-per-month via localStorage. | This is *literally* the "Months unlocked: 3/12" widget already, but the message is generic copy, not derived from the user's own data. No memory paragraph. No badge tie-in. |
| **Monthly Summary Generator** | `src/server/utils/monthly-summary.ts` | Runs server-side, produces a rich `MonthlySummary`: presence/consistency, energy trajectory, dominant themes, breakthroughs, cohort evolution, **and a full `memoryStory` paragraph** via `generateMemoryStory()`. Delivered **only as an HTML email** (Job: Monthly Email Sender, 09:00 UTC, 1st of month). | The richest artifact in the whole system — the actual "paragraph-long insight from last month" the brief asks for — exists today and is thrown away after the email. It is never persisted, never shown in-app, never revisitable. |
| **Weekly Summary Generator** | `src/server/utils/weekly-summary.ts` | Same shape, weekly cadence, surfaced through the Memory Widget on Sun/Mon. | Proves the "surface a generated summary through a widget, not just email" pattern already ships for weekly — it was just never extended to monthly. |
| **Memory Compression Engine** | `src/server/utils/memory.ts`, doc: `MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md` | Full Q&A compression loop, 10 archetypes, 4 question-depth levels, Memory Story generation cached to `user.metadata.lastMemoryStory` (version + answer count only — **one slot, always overwritten**). | No historical archive of Memory Stories. Month 1's story and Month 11's story cannot be compared or replayed because only the *latest* is ever kept. |
| **Badge Milestone Ladder** | `src/client/utils/badges.ts` (`milestone_7/14/21/30/50/60/90/100/180/365`) | Streak-based badges at 7, 14, 21, 30, 50, 60, 90, 100, 180, 365 days. Each has a Water symbol (∘ → ≈ → ≋) and an Architecture symbol (├─ → ╞═╡ → ║·║), per user's chosen aesthetic theme. `milestone_365` is LEGENDARY: "The Long Count" / "Citadel." | **This ladder already IS a 12-month spine** (see §3) — it has simply never been surfaced as one. |
| **Interface Evolution System** | `src/client/utils/interfaceEvolution.ts`, `stores/evolution.ts`, doc: `INTERFACE_EVOLUTION.md` | 7-dimension progression (Exploration, Consistency, Depth, Connection, Intimacy, Care, Courage) drives CSS variables (opacity, grid, glow, letter-spacing) and feature unlocks. Themed Water vs. Architecture aesthetics. | Driven by *level* and *achievement category*, not by *membership month*. Two users at month 3 with different activity look completely different — correct for evolution, but there is no month-anchored "you have been here this long" signal layered on top. |
| **Self-Assembly Engine** | `selfAssembly` nanostore, `SystemProgressWidget.tsx` | 12 modules (Biofield Engine, Memory Architecture, Routine Compiler, Intention Core, Cleanness Protocol, Reflection Layer, Community Mesh, Ecosystem Bridge, Quantum Substrate, Nutrition Protocol, Goal Architecture, Archetype Classifier) each progress Dormant → Awakening → Forming → Assembled → Integrated from real signal. | **12 modules.** Twelve months. The coincidence is too good not to use (§5). Currently these assemble at whatever pace usage dictates — no explicit month pacing exists, nor should it be forced; but the *narrative framing* of "12 months, 12 modules" is free and true today. |
| **Journal / Log** | `Logs.tsx`, `note` events, Word-Turn badges (264 badges keyed to journal text) | Every typed field entry is logged; word count, streaks, and 22 "Word Turn" badge engines already key off cumulative journal text (`great_work`: 150,000+ words; `long_quest`: 500+ words in one entry). | No *month-scoped* journal count is currently surfaced to the user ("You wrote 4,200 words this month" does not exist as a UI line, only as a badge trigger buried in the engine). |
| **Self-Care / Check-Ins** | `SelfCareMoments.tsx`, `EmotionalCheckIn.tsx`, `self_care_complete`/`self_care_skip` events | Time-gated (10–12, 2–5, 7–10) + pattern-gated (anxiety/overwhelm detection). Completion ratio already feeds the Memory Engine's Source 4 (Engagement Analytics). | Ratio is used to *shape questions*, never shown back to the user as "care momentum" — there is a `LOT-assembly_care-momentum.md` design note (2026-05-17) but no shipped widget. |
| **Board Profile** | `src/server/routes/public-api.ts` (~L1240–1300), type `boardProfile` in `shared/types/index.ts` | **Real, computed, already shipping for genuine Usership accounts.** Server-side, for any user with the Usership tag: `boardTenureMonths` (`dayjs().diff(joinDate, 'month')`), `totalInvested` (`tenureMonths × 99`), `citizenSince` (join month/year), sequential `boardMemberNumber` among all Usership users, and an `activity` block with real counts — `journalEntries` (COUNT of `note` logs), `memoriesCompiled` (COUNT of `answer` logs), `activeDays` (COUNT DISTINCT day). Rendered today on `PublicProfile.tsx` (~L289–322) as a handful of plain label:value lines. | This is the single strongest existing precedent for "12-month tangibility" in the whole codebase — real tenure, real dollars, real entry counts, computed server-side, already public. It is presented as a flat stat block, not a story; it has no month-by-month history (only the current snapshot); and it is invisible in-app (`System.tsx`) — a user only sees their own board profile by visiting their own public `/u/[username]` page. |
| **Subscription tiers** | `UserTag.Usership`, `UserTag.RND`, `UserTag.Legacy` | Usership = $99/mo, gates Quantum Sign, Cosmic Update, Monthly Pulse, psychological profile, board profile. No live Stripe enforcement found — tag assignment appears admin/manual (`stripeCustomerId` column exists but no webhook wiring located). | No tier-specific *month-over-month unlock schedule* exists — Usership perks are flat from day 1 of the tag, not staged across the year. |

**Conclusion of the audit:** every ingredient for a tangible 12-month story
already exists. Nothing in this brief requires a new AI capability. It
requires **persistence** (keep what today gets thrown away), **surfacing**
(move server-generated richness from email-only into the living UI), and
**sequencing** (anchor existing systems to the calendar month instead of only
to raw activity level).

---

## 2. Design Philosophy — Extending Ambient AI™ to the Calendar

`LOT-AMBIENT-AI-VISION.md` already states the law: *"Ambient means always
present, never intrusive... It does not alert. It does not badge. It waits."*
The 12-month arc must obey this exactly, or it becomes a subscription-nagging
gamification layer, which is the opposite of the brand.

Three rules govern everything below:

1. **The calendar month is a container, not a countdown.** The system never
   says "11 months left to renew" — it says "eleven months of signal, now
   compressed." Framing is retrospective and reverent, never sales-adjacent.
2. **Celebration is quiet.** `MonthlyPulseWidget`'s existing pattern — a
   single `Block`, dismissible with a click, no confetti, no modal takeover —
   is correct and should be preserved, not "gamified up." The evolution is
   in the *content* getting richer, not the chrome getting louder.
3. **Nothing is displayed unless it is true.** A month with 4 Log entries
   does not get an inflated story. The existing `consistency` classifier in
   `monthly-summary.ts` (exceptional/strong/steady/intermittent/minimal)
   already handles this honestly — a "minimal" month gets "Practice awaits
   your return," not a manufactured achievement. That honesty must carry
   into the in-app capsule verbatim.

---

## 3. The Spine — Streak Milestones Already Map to 12 Months

This is the single most useful finding in this brief. Lay the existing
`badges.ts` milestone ladder against a 12-month calendar:

| Month | ~Day | Badge (Water → Architecture) | Tier | What it should now *also* trigger |
|---|---|---|---|---|
| 1 | 7 | `∘` Droplet → `├─` Foundation | — | First Word-Turn badges, first Memory Story cache, Monthly Pulse Month 1 |
| 1 | 14 | `∘∘` Twin Drop → `├┼` Load-Bearing | — | — |
| 1 | 21 | `∘≈` Proto-Wave → `├═` Deep Foundation | — | — |
| 1–2 | 30 | `≈` Wave → `╞═╡` Structure | — | First **Monthly Capsule** (§6), first anniversary of the Memory compression cycle deepening (10+ answers unlocks archetype/trauma-informed layers per the Memory Engine doc) |
| 2 | 50 | `≈∘` Mid-Current → `╞══` Mid-Structure | — | — |
| 2 | 60 | `≈≈` Dual Wave → `╞═══` Master Frame | — | Month 2 capsule |
| 3 | 90 | `≋∘` Deep Reach → `║═` Inner Wall | — | Month 3 capsule; `MONTH_MESSAGES[3]` already says *"You have reached Active User status"* — now backed by an actual badge instead of a coincidence |
| 3 | 100 | `≋` Current → `║·║` Architecture | — | `practiceLevel` symbol (per `BADGE_LEVEL_DESIGN.md`) advances to its top tier |
| 6 | 180 | `≋≋` Voyager → `║╞║` Wing | — | Month 6 capsule — the "halfway" chapter |
| 12 | 365 | `≋≋≋` The Long Count → `╔═╗` Citadel (**LEGENDARY**) | Highest | **The Year One Book** (§7) |

Months 4, 5, 7, 8, 9, 10, 11 have no dedicated streak badge today — they are
carried by the **Monthly Capsule** alone (§6), which is correct: not every
month needs a badge, but every month needs a story. This asymmetry is a
feature, not a gap — it prevents badge inflation while keeping narrative
continuity unbroken.

---

## 4. Month-by-Month Narrative

Each month below describes the felt state of the UI. "Barebones" and
"evolved" are not new visual redesigns — they are the *existing* Interface
Evolution and Self-Assembly systems, simply narrated against the calendar so
the intent is legible.

### Month 0 — Day 1 (Onboarding)
- UI: exactly what free users see. No Usership-only widgets fire yet
  (`SubscribeWidget` itself doesn't even appear until 10+ Memory answers).
- Memory Engine Mode 1 (First Question) — open, welcoming.
- Self-Assembly: all 12 modules **Dormant**.
- `MonthlyPulseWidget`: silent (`monthNumber < 1`).
- The only thing that marks this account as Usership is the absence of the
  Subscribe prompt and access to Quantum Sign / Cosmic Update, which is
  intentionally invisible — Ambient AI™ rule #3.

### Month 1 (Days 1–30)
- Badges: `milestone_7`, `_14`, `_21`, `_30` fire in sequence — the fastest
  badge cadence of the year, deliberately, per the existing pacing doctrine
  (Day 1 quota 10, tapering to steady state).
- Journal: first Word-Turn badges likely (`quest_entry` — any 1 Hero's
  Journey word detected).
- Self-Assembly: Biofield Engine and Reflection Layer begin **Awakening**.
- `MonthlyPulseWidget` fires for the first time: *"The first month. The
  system is beginning to know you."* — unchanged copy, but now paired with
  the new **Monthly Capsule** (§6): the first real paragraph, likely thin
  ("Limited data this month" honesty path in `monthly-summary.ts`).
- Months Unlocked: `● ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○` — **1 / 12**.

### Month 2 (Days 31–60)
- Badges: `milestone_50`, `milestone_60`.
- Memory Engine: 2+ answers → Follow-Up Mode activates (85% probability) —
  the AI starts referencing specific prior answers by name. This is the
  first month the user *notices* the machine remembering them.
- Self-Assembly: Routine Compiler and Intention Core begin forming if
  Planner/Intentions are used.
- Capsule tone shifts from "beginning" to first named theme (`monthly-summary.ts`
  dominant-theme extraction starts returning something non-trivial once 15+
  logs exist).

### Month 3 (Days 61–90)
- Badges: `milestone_90`, then `milestone_100` — the Water/Architecture
  symbol advances to its highest core tier (`≋` / `║·║`).
- `MONTH_MESSAGES[3]`: *"Three months. You have reached Active User status."*
  — now literally true, gated by the same badge.
- Memory Engine: at 10+ log entries, the Trauma-Informed Protocol and
  Psychological Profile (archetype) activate silently. This is the month the
  Awareness Dashboard's archetype label typically first stabilizes rather
  than flickering between candidates.
- This is the natural point to introduce the **Story Chapter** framing
  (§6.2): Months 1–3 close as "**Departure**" in Hero's Journey vocabulary
  — vocabulary the badge system already uses (`call_heard`, `threshold_crossed`,
  `mentor_arrived`).

### Month 4–5
- No new streak badge (see §3 asymmetry note) — capsule and Word-Turn/
  Behavioral badges carry these months. Likely first `hero_session` or
  `long_quest` badges if journaling depth increases.
- Self-Assembly: Community Mesh and Ecosystem Bridge modules become
  reachable if cohort/community features are touched — the first month
  where "Connection" (one of the 7 evolution dimensions) can move.
- Chapter framing: "**Initiation**" begins (Ordeal / Shadow-work vocabulary)
  — matches the existing Journey-stage taxonomy already used by
  `extractGoals()` (beginning → struggle → breakthrough → integration →
  mastery).

### Month 6 (Days ~180)
- Badge: `milestone_180` — "Voyager" / "Wing." The half-year mark.
- `MONTH_MESSAGES[6]`: *"Six months. The journey is half-declared."*
- This is the first month that deserves slightly more than the standard
  single-`Block` pulse: a **halfway capsule** that explicitly references
  Month 1's capsule for contrast ("compressed against your first month" —
  see §6.3, Capsule Diffing). This is the first moment the product proves
  *longitudinal* memory, not just monthly memory.
- Visual: Interface Evolution's `overallMaturity` milestone thresholds
  (25%/50%/75%/95%, per `INTERFACE_EVOLUTION.md`) plausibly cross 50% around
  here for a consistent user — the CSS evolution (opacity, grid, glow) and
  the calendar month milestone land on the same emotional beat without any
  new engineering; they are simply allowed to coincide.

### Month 7–9
- Chapter framing: "**Deepening**" — Depth and Intimacy dimensions matter
  most here. `Advanced Memory` (Depth: Deep Diver) and `Narrative Reflection`
  (Depth 66% + Level 30) feature-unlocks, already defined in
  `INTERFACE_EVOLUTION.md`, are the natural gates for this stretch.
- Self-Care ratio (completed vs. skipped) becomes a visible **Care Momentum**
  line for the first time (net-new, small — see §8) — this is the stretch
  where habitual users have enough data for the ratio to mean something and
  novelty-only users start to show visible decline, honestly narrated.

### Month 10–11
- Chapter framing: "**Approach**" (pre-Return). Anticipation without
  announcement — the UI does *not* say "one month until your Year One Book."
  Ambient AI™ rule #1: no countdown pressure. The only signal is the
  Months-Unlocked dot row quietly reading `●●●●●●●●●●○○`.
- Legendary-tier badges most likely to be in reach: `great_work` (150,000+
  journal words), `saga_age` requires 5 years so is out of scope, but
  shorter LEGENDARY behavioral badges (`quest_complete`, `monomyth_arc`) are
  realistic 10–11 month territory for a heavy journaler.

### Month 12 (Day 365)
- Badge: `milestone_365` — "The Long Count" / "Citadel." LEGENDARY tier,
  the only LEGENDARY badge in the core milestone ladder.
- `MONTH_MESSAGES[12]`: *"One year with LOT. The portrait is complete — and
  still evolving."*
- Delivery: the **Year One Book** (§7) — a single synthesis screen, not a
  bigger widget. This is the one moment in the entire year that earns a
  dedicated full-screen moment rather than a dismissible `Block`, because it
  is terminal (last of 12) rather than one of a repeating cadence.
- This is what an account like `/u/machiavelli` represents when viewed
  publicly: dense badge line, top-tier practice symbol, an archetype the
  visitor can *feel* was earned across a year, not assigned on day one.

---

## 5. Twelve Months, Twelve Modules — A Free Coincidence Worth Using

The Self-Assembly Engine already tracks exactly 12 modules. Nothing should
be re-engineered to force one module per month — assembly must stay honest
to actual usage, per `LOT-DOCTRINE.md`'s "Graceful Degradation" principle
(never fake a state to hit a narrative beat). But the **narration** of the
System Progress Widget's Self-Assembly view can, for Usership accounts past
Month 1, add a single quiet line connecting the two twelves:

> *"12 modules. 12 months. The system assembles at your pace, not the
> calendar's — but by the time both reach completion, they tend to agree."*

This costs nothing to build (a string), reframes an existing screen, and
plants the "12 and 12" idea without inventing a forced mechanic.

---

## 6. The Core Ask: 12-Month Tangibility of the Compressed Memory Story

This is the section the brief weights most heavily. The mechanism:

### 6.1 Persist the Capsule (net-new, small)

Today `monthly-summary.ts` generates a full `MonthlySummary` — including
`memoryStory` — once a month, for email only, and nothing is kept. Add one
array to `user.metadata`:

```ts
monthlyCapsules: Array<{
  month: number            // 1–12 relative to joinedAt, not calendar month
  year: number
  generatedAt: string
  narrative: string        // MonthlySummary.narrative (the structured recap)
  memoryStory: string | null   // the paragraph-long insight — the "soul" of the month
  badgesUnlocked: string[]     // badge ids earned that month
  osVersion: string
  consistency: MonthlySummary['presence']['consistency']
}>
```

Written by the existing Job 5 (Monthly Email Sender, 09:00 UTC, 1st) at the
same time it composes the email — the email becomes a *side effect* of
capsule generation, not the sole output. This single change turns "a story
that gets emailed and forgotten" into "a story that becomes part of the
permanent record," which is the entire ask.

### 6.2 Surface It In-App — Evolve `MonthlyPulseWidget` → `MemoryCapsuleWidget`

Keep the existing dismissible `Block` pattern exactly as built. Extend the
content:

```
┌─────────────────────────────────────┐
│ Month 6:                             │
│                                       │
│ "You return to the mornings. Twelve  │
│  of the last thirty days opened with │
│  a check-in before nine. The theme   │
│  that would not let go was rest —    │
│  you wrote about it more than any    │
│  other word this month. The Seeker   │
│  in you is quieter than it was in    │
│  March. That is not regression.      │
│  That is integration."               │
│                                       │
│ ●●●●●●○○○○○○  6 / 12 months          │
│                                       │
│ [ view last month's story → ]        │
└─────────────────────────────────────┘
```

- The paragraph **is** `memoryStory` from the persisted capsule (or a
  trimmed excerpt) — no new AI capability, just a new place for the
  existing output to live.
- `●●●●●●○○○○○○` replaces the current plain-text "6 / 12 months" line with
  the dot-row the brief explicitly asked for ("Months unlocked: 3/12"),
  filled dots = past months, using the exact same `capped` variable already
  computed in the component.
- `[ view last month's story → ]` opens the *previous* capsule — the first
  time a user can ever look backward at a Memory Story that isn't the one
  currently cached. This single link is what makes the year feel like a
  book with pages, not a single overwritten note.

### 6.3 Capsule Diffing at the Half-Year and Full-Year Marks

At Month 6 and Month 12 only, the capsule generator additionally receives
Month 1's persisted capsule as context and is asked (same Together AI call
pattern used everywhere else in the Memory Engine, no new model) to note one
concrete continuity or change — the sentence in the mock-up above ("The
Seeker in you is quieter than it was in March") is this mechanism. This is
the only place in the entire 12-month arc where two specific months are
directly compared, and it is reserved for the two moments that structurally
deserve it (midpoint, terminus) so it never feels formulaic.

### 6.4 Chapter Titles — Reuse, Don't Invent

The badge system already ships a full Hero's Journey vocabulary (Badge
Codex v32: `call_heard`, `threshold_crossed`, `mentor_arrived`,
`ordeal_survived`, `shadow_met`, `elixir_found`, `return_road`, etc.) and the
Goal Journey system already has a 5-stage taxonomy (beginning → struggle →
breakthrough → integration → mastery). Rather than inventing new chapter
names, the 12-month arc borrows both, non-exclusively:

| Months | Working chapter name | Drawn from |
|---|---|---|
| 1–3 | Departure | `call_heard`, `threshold_crossed`, `mentor_arrived` |
| 4–6 | Initiation | `ordeal_survived`, `shadow_met`, goal stage "struggle" |
| 7–9 | Deepening | `elixir_found`, goal stage "breakthrough" |
| 10–12 | Return | `return_road`, goal stage "integration"/"mastery" |

No new copy needs to be written from scratch — this is a re-labeling of
vocabulary the system already owns, applied as a light header on the
Capsule Widget ("Departure · Month 2") rather than a new content engine.

---

## 7. The Year One Book (Month 12 Capstone)

A single new page — not a widget — reachable once `monthlyCapsules.length
>= 12` (or `milestone_365` badge unlocked, whichever the assembly confirms
first). Structure:

1. **Cover**: archetype, practice-level symbol (`≋≋≋`), join date, "One
   year." — mirrors the existing `PublicProfile.tsx` Block-row aesthetic
   exactly, no new visual language.
2. **Twelve chapters**: each persisted `monthlyCapsules[i]`, rendered as
   the paragraph + that month's badges, in order. This is literally a
   read of the array added in §6.1 — no new generation, only new rendering.
3. **The Year Story**: one final `generateMemoryStory()` call over the
   *entire year's* logs (the function already accepts arbitrary log
   windows) — the same mechanism, run once, at the largest scope it has
   ever been asked to run at.
4. **Closing line**, honest and unforced, in the same register as every
   other closing line in this system: *"The second year begins the same
   way the first one did — with a question."*

This page is what a public visitor to a densely-evolved profile — the
effect `/u/machiavelli` fakes with hardcoded 1469-era numbers — should be
able to sense on a genuine 12-month account, honestly earned: density, not
decoration. The existing `PublicProfile.tsx` already renders Archetype /
Awareness Level / practice Level / Days of Practice, and — for real
Usership accounts — the real `boardProfile` block (tenure months, dollars
invested, journal entries, memories compiled, active days). The Year One
Book is the private, first-person, narrative expansion of exactly those
same public facts: the public page shows the numbers, the Book shows the
paragraphs those numbers were compressed from.

---

## 8. Journal & Self-Care as the Primary Evolutionary Signal

Per the brief's explicit priority, two counters deserve a quiet, permanent
home *inside the app* — not a new gamified dashboard, one or two lines in
an existing screen. Both already exist as real numbers; they are simply
stranded on the public profile page instead of living where the user
actually spends their day.

- **Log density**: `boardProfile.activity.journalEntries` and
  `.memoriesCompiled` (§1) are computed server-side today, per real user,
  every time `/u/[username]` is requested — they are just never shown to
  the user themself outside that public page. Pipe the same numbers into
  `SystemProgressWidget`'s existing OS Journal view as one line: *"1,842
  field entries this year · 340 memories compiled · rest is the
  most-written word."* The last clause reuses the dominant-theme extraction
  already in `monthly-summary.ts`, applied year-wide instead of month-wide —
  the only net-new computation in this bullet.
- **Care Momentum**: the completed-vs-skipped ratio already computed for
  Memory Engine Source 4 (`self_care_complete` vs. `self_care_skip`) gets a
  single small readout — not a new widget, a line inside the existing
  Self-Care Moments component, shown only to Usership accounts past Month 2
  (before that, the sample size is too small to be honest, per the "nothing
  displayed unless true" rule in §2).

Neither requires a new endpoint. The `boardProfile` query in `public-api.ts`
already does the aggregation (`Log.count` by event type, `COUNT DISTINCT`
active days) — reuse the same query for the authenticated user's own
`/api/me` payload rather than only computing it when a *visitor* loads
their public page.

---

## 9. Free vs. Usership — The Month-Over-Month Contrast

Extending the existing table in `LOT-AMBIENT-AI-VISION.md` §"Usership
Activation" with the calendar dimension specifically:

| | Free / Pre-Usership | Usership, Month 1 | Usership, Month 6 | Usership, Month 12 |
|---|---|---|---|---|
| Monthly capsule | None | Thin, honest ("limited data") | Diffed against Month 1 | Full Year One Book |
| Months-Unlocked widget | Never renders | `●○○○○○○○○○○○` 1/12 | `●●●●●●○○○○○○` 6/12 | `●●●●●●●●●●●●` 12/12 → Book |
| Badge symbol ceiling | Same ladder, same badges | `∘` → `≈` | `≋≋` (Voyager) | `≋≋≋` (Citadel, LEGENDARY) |
| Memory Engine depth | Same compression loop | Mode 1→3 transition | Archetype fully stable | Full-year synthesis pass |
| Care Momentum line | Not shown | Not shown (sample too small) | Shown | Shown, year-scoped |

The point of this table: **Usership does not unlock different features
month to month** — the free/paid split is a single gate (already true
today). What Usership uniquely unlocks is *the right to have the same
year-long signal turned into a keepsake instead of thrown away.* That is
the actual product being sold across 12 months, and it is why this document
is scoped almost entirely to persistence and surfacing rather than new
capability.

---

## 10. Implementation Notes (Sizing, Not a Spec)

Ordered by leverage-to-effort ratio, for whenever this moves from brainstorm
to build:

1. **Persist `monthlyCapsules`** (§6.1) — smallest change, unlocks
   everything else. Touches `scheduled-jobs.ts` (Job 5) and `user.metadata`.
2. **Evolve `MonthlyPulseWidget` → `MemoryCapsuleWidget`** (§6.2) — mostly
   a content change to an existing, working component; dot-row is a small
   render function, not a new dependency.
3. **"View last month's story" link** — trivial once (1) exists; reads
   `monthlyCapsules[monthNumber - 2]`.
4. **Chapter-name header** (§6.4) — pure string mapping, zero new logic.
5. **Care Momentum line + Log density line** (§8) — one sentence each,
   inserted into components that already compute the underlying numbers.
6. **Capsule diffing at Month 6/12** (§6.3) — reuses the existing Together
   AI call pattern with one extra context block; same fallback chain
   (`AI_ENGINE_PREFERENCE`) already governs cost/availability.
7. **Year One Book page** (§7) — the only genuinely new page in this
   entire brief; everything it renders is data already produced by (1)–(3).
8. **"12 modules / 12 months" narration line** (§5) — cosmetic, last,
   optional.

Nothing above requires a new AI model call type, a new badge engine, a new
subscription tier, or a new data source. It requires deciding that data the
system already generates deserves to be kept.

---

## 11. Closing

The machine already knows how to compress a year. It has been doing it
every month, in an email, and deleting the working notes afterward. The
entire brief reduces to one sentence: **stop throwing away the Memory
Story, and let the Months-Unlocked widget point at it.** Everything else —
the badge ladder, the archetype stabilization, the Self-Assembly modules,
the Hero's Journey vocabulary — is already built, already true, and already
running quietly underneath every Usership account today. It has simply
never been allowed to look back at itself.

By Month 12, the operator should not need to be told they have changed.
The Book should simply be there, already written, in their own compressed
voice — the same principle Ambient AI™ already states for every other part
of this system, applied for the first time to the shape of a year instead
of the shape of a day.

---

*LOT® Founded 7 April 2016 · COSMO® Founded 1 July 2024*
*Made in the USA · brand.lot-systems.com*
*S-2: VADIK MARMELADOV*
