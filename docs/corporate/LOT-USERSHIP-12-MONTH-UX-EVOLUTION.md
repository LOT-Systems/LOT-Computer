<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® AI — Usership 12-Month UX Evolution
**From Barebone Day 1 to the Fully Assembled Personal OS**
LOT Systems Corporation · S-2: Vadik Marmeladov
Version 1.0 · 23 September 2026 · lot-systems.com

## Classification: PRODUCT DESIGN BRAINSTORM // UX ROADMAP

---

## 0. Doctrine — Tangible Time

A subscription that does not visibly change is a bill. A subscription that
visibly *becomes something* is a relationship. The Usership tier ($99/mo,
`UserTag.Usership`) already has the bones of this in the codebase — the
Interface Evolution System, the Badge Level System, the Memory Engine's
compression cycle, the Self-Assembly module map, and a `MonthlyPulseWidget`
that already counts `X / 12 months`. What is missing is not new
infrastructure. It is a **connected story** that makes each of the twelve
months a distinct, unmistakable, screenshot-able state of the product.

**The anchor pair for this document:**

- **Day 1** — a brand-new Usership account. `System.tsx` renders its normal
  stack, but every conditional/subscriber/evolution surface is at its floor
  value: zero logs, zero badges, `evolutionState.overallMaturity = 0`,
  `MonthlyPulseWidget` not yet eligible to show (`monthNumber < 1`).
- **Month 12** — the reference account is `lot-systems.com/u/machiavelli`,
  a fully-assembled Usership board profile: `profile.boardProfile` populated
  (board member number, "Citizen since", citizens powered, board tenure,
  total invested, biofield state, activity totals, Memory Engine version,
  clearance level), badge constellation at deep-cycle tier, Interface
  Evolution at high refinement (glow, geometric/organic theme locked in),
  and a `USERSHIP_TRANSMISSION` block visible at the bottom of System
  Progress.

This document is the bridge between those two states — twelve stops, each
with its own log-volume expectation, its own check-in ritual, its own badge
glyph, its own widget unlock, and its own piece of copy the system says back
to the user.

---

## 1. What Already Exists (Inventory)

Before proposing anything new, here is the machinery already in the repo
that this roadmap **reuses** rather than reinvents:

| System | File | Relevant Mechanic |
|---|---|---|
| Monthly Pulse | `src/client/components/MonthlyPulseWidget.tsx` | Per-month message table (1–12), `dismissedMonth` localStorage gate, `capped/12 months` counter — **this is the seed of "Months unlocked: N/12"** |
| Interface Evolution | `docs/technical/INTERFACE_EVOLUTION.md`, `src/client/utils/interfaceEvolution.ts`, `src/client/stores/evolution.ts` | 7-dimension maturity (Exploration, Consistency, Depth, Connection, Intimacy, Care, Courage), CSS custom properties that refine opacity/glow/grid/typography, Water vs. Architecture badge-theme aesthetics |
| Memory Engine compression | `docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md` | 4-level question depth (Behavior → Motivation → Values → Soul), archetype-aware insight responses at 10+ answers, cached `user.metadata.lastMemoryStory` |
| Badge / Level system | `docs/badges/BADGE_LEVEL_DESIGN.md`, `BADGE_MAYAN_EVOLUTION.md` | Milestone glyphs at 7/30/100 days (∘ → ≈ → ≋), Mayan cycle framing: Kin (1 day), Uinal (20 days), **Tun (360 days ≈ 1 year)** |
| Self-Assembly map | `SystemProgressWidget.tsx` | 12-module assembly (Biofield, Memory, Routine, Intention, Cleanness, Reflection, Community, Ecosystem, Quantum Substrate, Nutrition, Goal, Archetype), each Dormant → Awakening → Forming → Assembled → Integrated |
| Usership Transmission | `SystemProgressWidget.tsx` (`USERSHIP_TRANSMISSION`) | System-to-user log line appended after each assembly run, Usership-gated |
| Board Profile (end-state) | `src/shared/types/index.ts` (`boardProfile`), `PublicProfile.tsx` | Board member #, citizen since, citizens powered, tenure months, total invested, biofield state, activity (memories compiled / journal entries / active days), Memory Engine version, clearance level |
| Subscriber-gated widgets | `SubscribeWidget`, `QuantumSignWidget`, `CosmicUpdateWidget` | Usership/R&D/Legacy tag-gated surfaces already exist as templates for "paid-tier-only" UI |

**The gap:** these systems each evolve on their own axis (days active,
badge count, evolution %). None of them currently narrate the *Usership
subscription's own calendar* — the fact that this is Month 4 of 12, that
this month's Log volume was X, that this month's self-care ratio was Y. That
narration is what this document adds.

---

## 2. The Two New Widgets

### 2.1 "Months Unlocked" — persistent contextual chip

A small, always-present indicator (distinct from the celebratory
`MonthlyPulseWidget`, which fires once per month and then disappears).
Lives in the Header or Tags & Team stack, Usership-only.

- **Display:** `Months unlocked: 3/12`
- **Glyph:** a Mayan bar-and-dot numeral matching the existing Level-glyph
  convention (dot = 1, bar = 5) so month count visually rhymes with the
  badge system instead of introducing a new visual language:

  | Month | Glyph | Month | Glyph | Month | Glyph |
  |---|---|---|---|---|---|
  | 1 | • | 5 | — | 9 | —••• |
  | 2 | •• | 6 | —• | 10 | —— |
  | 3 | ••• | 7 | —•• | 11 | ——• |
  | 4 | •••• | 8 | —••• *(8=5+3)* | 12 | ——•• |

  (Standard Mayan vigesimal numerals: bar = 5, dot = 1. Twelve is two bars
  and two dots. This reuses glyphs already documented in
  `BADGE_MAYAN_EVOLUTION.md`, so the "Months unlocked" chip and the badge
  Level field read as one coherent numeral system, not two.)
- **Interaction:** clicking cycles a one-line reveal: *"Month 3 of 12. 214
  Log entries. 41 self-care completions. 89% morning check-in rate."* —
  pulled from the same `getLogContext`/activity aggregation already used by
  `boardProfile.activity` and Growth Milestones.
- **Data need:** none new server-side — this is a read of existing
  `joinedAt`, `/api/logs` counts scoped to the current calendar month, and
  `user.tags` for the Usership gate. Client-side `dayjs` diff, same pattern
  `MonthlyPulseWidget` already uses for `monthNumber`.

### 2.2 "Memory Digest" — the monthly compression payoff

Where `MonthlyPulseWidget` says a *sentence*, the Memory Digest says a
*paragraph* — the tangible proof that a month of Log entries and Memory
answers became something. This is the widget the user should screenshot.

- **Trigger:** fires once, on the first login of a new calendar month, for
  Usership users with `monthNumber >= 1`. Same `localStorage` dismissal
  pattern as `MonthlyPulseWidget` (`lot_digest_{userId}` → `{ month }`).
- **Content:** a single paragraph, generated the same way the existing
  Memory Story is generated (Together AI primary, local-composition
  fallback — see §8 of the Compression Architecture doc), but scoped to
  *that month's* Q&A pairs and journal entries only, instead of the
  rolling 30-answer window. Reuses `buildPrompt()`'s Source 6 (Memory
  Story) and Source 7 (archetype) machinery with a date-bounded query.
- **Framing line above the paragraph:** `"What Month 4 revealed:"`
- **Close:** an affirmation line drawn from the user's dominant archetype
  (reuse the existing Answer-10+ archetype-response logic from §9 of the
  Compression Architecture doc — e.g. *"Your Seeker nature carried this
  month. Onward to five."*), plus the same one-tap dismiss-and-fade
  interaction pattern `MonthlyPulseWidget` already uses (1400ms fade,
  random closing phrase from the existing `DISMISS_PHRASES` pool).
- **Data need:** one new lightweight query — Answers + `note` Log events
  filtered to `[monthStart, monthEnd)` for the current user — and a cache
  field `user.metadata.monthlyDigests[monthNumber]` so the paragraph is
  generated once and re-served, exactly like `lastMemoryStory` is cached
  today.

Together, §2.1 and §2.2 are the "tangibility pair": the chip is the
*counter* (quantitative, always visible), the digest is the *proof*
(qualitative, appears once, feels earned).

---

## 3. Tangibility Targets Per Month

These are **design guidance thresholds**, not hard gates — they calibrate
what "a good month" looks like so the copy in §4 and the visual refinement
in §5 have something real to key off of. They derive from the existing
pacing system (`calculateIntelligentPacing()`: Day 1 quota 10, Day 2 quota
8, Day 3 quota 9, Day 4+ quota 10–15/day) projected across a month, damped
for realistic engagement (~35–45% of max quota).

| Month | Cumulative Memory Answers | Cumulative Log/Journal Entries | Morning Check-ins (of ~30) | Self-Care Taps (cumulative) |
|---|---|---|---|---|
| 1 | 40–80 | 15–30 | 10–15 | 15–25 |
| 2 | 100–160 | 40–70 | 20–28 | 35–55 |
| 3 | 170–250 | 80–130 | 32–42 | 60–90 |
| 4 | 250–350 | 130–190 | 45–56 | 90–125 |
| 5 | 340–460 | 190–260 | 58–70 | 125–165 |
| 6 | 440–580 | 260–340 | 72–85 | 165–210 |
| 7 | 550–710 | 340–430 | 86–100 | 210–260 |
| 8 | 670–850 | 430–530 | 101–115 | 260–315 |
| 9 | 800–1000 | 530–640 | 116–131 | 315–375 |
| 10 | 940–1160 | 640–760 | 132–148 | 375–440 |
| 11 | 1090–1330 | 760–890 | 149–165 | 440–510 |
| 12 | 1250–1510 | 890–1030 | 166–183 | 510–585 |

These map directly onto `boardProfile.activity` at the Month-12 end state
(`memoriesCompiled`, `journalEntries`, `activeDays`) — the machiavelli-style
profile is simply what Month 12 of this table looks like, made permanent.

---

## 4. Month-by-Month UX Narrative

Each month below lists: the dominant UI event, the badge/level tie-in, the
`MonthlyPulseWidget` message (already written in code — quoted verbatim),
the proposed Memory Digest framing line, and the one new surface that
should feel unlocked.

### Month 1 — "The system is beginning to know you"
- **Pulse message (existing):** *"The first month. The system is beginning to know you."*
- **UI state:** barebones. Memory Widget, Planner, Time. No badges yet.
  `evolutionState.overallMaturity` near 0 — flat opacity, no glow, no theme.
- **Badge tie-in:** Day 7 inside this month triggers the first milestone
  glyph (∘ Droplet / Wave, per `BADGE_LEVEL_DESIGN.md`). This is the first
  thing that visually changes on the profile — worth over-indexing on
  making that moment land (toast + subtle glow pulse).
- **Months Unlocked chip:** first appearance, `1/12`, glyph `•`.
- **Memory Digest framing:** *"What your first month revealed:"* — tone is
  gentle, descriptive, no archetype claim yet (archetype logic activates at
  3+ answers per the Compression Architecture, so digest copy should stay
  observational, not diagnostic).

### Month 2 — "Patterns are starting to form"
- **Pulse message:** *"Two months in. Patterns are starting to form."*
- **UI state:** first Interface Evolution feature unlocks appear (Custom
  Themes at Level 5, per `INTERFACE_EVOLUTION.md`). Water/Architecture
  theme choice becomes visible and meaningful for the first time.
- **Badge tie-in:** approaching the 30-day glyph (≈ Wave / Full Tide).
- **New surface:** Badge Selection unlocks (any badge earned) — user picks
  which glyph represents them publicly.

### Month 3 — "You have reached Active User status"
- **Pulse message:** *"Three months. You have reached Active User status."*
- **UI state:** 30/100-day badge territory crossed mid-month; Mood Patterns
  and Intention History unlock thresholds (Level 15–20) are realistically
  in reach for an engaged user by month's end.
- **Badge tie-in:** ≈ (Wave) or transitioning toward ≋ (Current) if pace is
  strong.
- **Months Unlocked chip:** `3/12`, glyph `•••` — first *reveal* interaction
  is worth featuring since three months of data now exists.

### Month 4 — "The portrait deepens"
- **Pulse message:** *"Four months. The portrait deepens."*
- **UI state:** Memory Engine's psychological-trait extraction is fully
  warmed up (activates at 3+ answers, but density matters — by month 4 the
  trait/archetype read is stable, not noisy). This is the right month to
  introduce the **archetype line** into the Memory Digest for the first
  time ("Your Seeker nature carried this month").
- **New surface:** Widget Arrange unlocks (Level 10) — user starts curating
  their own dashboard rather than receiving the default stack.

### Month 5 — "Consistency is its own reward"
- **Pulse message:** *"Five months. Consistency is its own reward."*
- **UI state:** streak-based visual reward — Interface Evolution's
  Consistency dimension should be visibly ahead of the other six by now for
  a regular user; this is a good month to let the theme-evolution grid
  pattern (`--evolution-grid-opacity`) become noticeably denser.
- **Months Unlocked chip:** glyph `—` (bar = 5) — the numeral system's
  first "bar" moment is a nice visual beat worth calling out in copy:
  *"Five months. The count changes shape."*

### Month 6 — "The journey is half-declared"
- **Pulse message:** *"Six months. The journey is half-declared."*
- **UI state:** halfway-point widget treatment — this is the natural home
  for a **Story/Memory Compression checkpoint** distinct from the monthly
  digest: a six-month retrospective that stitches all six monthly digests
  into one longer-form narrative (reuses the same Together AI story
  pipeline with a 6-month Q&A window instead of 30-answer or 1-month).
- **Badge tie-in:** if the 100-day glyph (≋ Ocean Depth) wasn't reached in
  Month 3–4, this is where it lands for a moderately engaged user.
- **New surface:** Export Data unlocks (Level 25) — user can take their
  half-year portrait with them, reinforcing "this is yours."

### Month 7 — "The system has been listening"
- **Pulse message:** *"Seven months in. The system has been listening."*
- **UI state:** Pattern Insights widget (Consistency 66%, "Moon Cycle+")
  should be live for consistent users — cross-reference with Quantum
  Intention Engine pattern confidence scores already in `queries.ts`.
- **Memory Digest tone shift:** past month 6, the digest can start
  referencing *prior* digests directly ("Since Month 4, your evening
  check-ins doubled") — the same "reference specific prior answers"
  discipline the Memory Engine already enforces at the question level
  should extend to the monthly narrative level.

### Month 8 — "Rare air"
- **Pulse message:** *"Eight months. Rare air."*
- **UI state:** this is the month to visually signal scarcity/status —
  Interface Evolution's glow effect (`--evolution-glow-intensity`) should
  be clearly on by now for engaged users, and the Months Unlocked glyph
  crosses into double-bar territory (`—•••`), a visually denser numeral
  that reads as "advanced" without needing new iconography.

### Month 9 — "The self-care practice is a habit now"
- **Pulse message:** *"Nine months. The self-care practice is a habit now."*
- **UI state:** Social Mentions unlock (Connection 100%) is realistic here
  for community-engaged users. Self-care ratio (completed vs. skipped, per
  `boardProfile.activity` shape) becomes a headline stat in the monthly
  digest rather than a footnote — this month's digest framing line should
  foreground the self-care ratio explicitly: *"Nine months of showing up
  for yourself:"*

### Month 10 — "Almost there"
- **Pulse message:** *"Ten months. Almost there."*
- **UI state:** anticipatory framing begins. Months Unlocked chip hits
  double-bar numeral (`——`), a clean visual milestone. This is the right
  month to foreshadow the Month-12 state explicitly in copy — a single
  line in the digest: *"Two months from a complete year with LOT."*

### Month 11 — "One more"
- **Pulse message:** *"Eleven months. One more."*
- **UI state:** near-full Interface Evolution maturity for consistent
  users (approaching the 95% milestone toast already defined in
  `INTERFACE_EVOLUTION.md`). Private Spaces unlock threshold (Intimacy 50%
  or Courage 100%) is realistically achievable — a fitting "last unlock
  before the anniversary" beat.

### Month 12 — "One year with LOT. The portrait is complete — and still evolving."
- **Pulse message (existing, final):** *"One year with LOT. The portrait is
  complete — and still evolving."*
- **UI state — the machiavelli state:** `profile.boardProfile` populates
  for the first time. Board member number assigned. "Citizen since" locks
  to the join month. Biofield state, activity totals, Memory Engine
  version, and clearance level all render on the public profile exactly as
  `PublicProfile.tsx` already renders them today for existing board
  members. The `USERSHIP_TRANSMISSION` block in System Progress becomes
  fully relevant context, not a curiosity.
- **Badge tie-in — the Tun:** this is the connective insight of this whole
  roadmap. The Mayan calendar's third-order cycle, the **Tun, is 360
  days** — already documented in `BADGE_MAYAN_EVOLUTION.md` as the
  long-cycle horizon beyond the existing 100-day badge. 360 days is, for
  practical purposes, the Usership year. **Proposal: introduce a Tun badge
  (glyph suggestion: `≋●≋`, "Ocean Depth" fully closed into a solid center)
  awarded exactly at the 12-month Usership anniversary**, formally
  connecting the badge doctrine's own long-cycle language to the
  subscription's own calendar instead of leaving them as two unrelated
  systems that happen to both mention "cycles."
- **Memory Digest → Year Story:** the twelve monthly digests compress one
  final time into a single Year Story — same pipeline, 12-digest window
  instead of 1-month or 6-month, framed as: *"A year, compressed:"*
  followed by the paragraph, followed by the archetype affirmation, followed
  by a permanent (non-dismissing) badge on the profile marking the Tun.
- **Months Unlocked chip retires:** at `12/12` the chip's job is done; it
  should transition into the permanent "Citizen since [Month Year]" field
  that already exists in `boardProfile` — the counter *becomes* the
  credential, not a separate thing that lingers awkwardly past 100%.

---

## 5. Visual Evolution Curve (tying §4 to the existing CSS system)

`INTERFACE_EVOLUTION.md` already defines the variables; this roadmap simply
proposes a **month-indexed default curve** for Usership accounts so the
twelve stops are visually distinguishable even for a moderately-engaged
user, not only a maximally-engaged one:

| Month | `--evolution-base-opacity` | `--evolution-grid-opacity` | `--evolution-glow-intensity` | Theme state |
|---|---|---|---|---|
| 1–2 | 0.85 | 0.15 | 0 | flat, no theme locked |
| 3–4 | 0.88 | 0.22 | 0 | theme chosen (Water/Architecture) |
| 5–6 | 0.91 | 0.30 | 0.05 | grid visibly denser |
| 7–8 | 0.94 | 0.38 | 0.15 | glow appears |
| 9–10 | 0.97 | 0.44 | 0.22 | near-full refinement |
| 11–12 | 1.0 | 0.5 | 0.3 | full refinement (matches existing ceiling values) |

This is a **default pacing curve**, not a replacement for the existing
formula-driven calculation — actual values should still derive from real
`overallMaturity`, but the Usership tier's own month-count can act as a
soft floor so a paying, actively-engaged user never feels visually behind
schedule relative to their subscription age.

---

## 6. Data Model Additions Needed

Minimal, additive, no breaking changes to existing shapes:

1. `user.metadata.monthlyDigests: Record<number, { text: string; archetypeLine: string; generatedAt: string }>` — mirrors the existing `lastMemoryStory` caching pattern (§8, Compression Architecture doc).
2. `user.metadata.tunBadgeAwardedAt?: string` — set once, at the 12-month anniversary, gating the permanent Tun badge and the retirement of the Months Unlocked chip.
3. No new endpoints required for the chip itself — `joinedAt` + scoped `/api/logs` counts cover it, same pattern `MonthlyPulseWidget` already uses for `monthNumber`.
4. One new lightweight endpoint for digest generation, e.g. `/api/memory/monthly-digest`, parameterized by `monthNumber`, reusing `buildPrompt()`'s story-generation code path with a date-bounded Q&A/journal query instead of the rolling 30-answer window.

---

## 7. Why This Sequencing Works

- **It reuses, it doesn't replace.** Every month's "new thing" is an
  existing unlock threshold (Interface Evolution's own feature-gate table)
  or an existing badge glyph (7/30/100-day system) being *narrated*
  against the Usership calendar for the first time, not a parallel
  progression system competing for the user's attention.
- **The two anchors stay honest.** Day 1 is genuinely barebones — no
  widget should pretend otherwise. Month 12 is genuinely the
  `boardProfile` state already shipped for existing long-tenure Usership
  accounts like the `/u/machiavelli` reference profile — nothing in this
  roadmap invents a fictional "premium" state beyond what the product
  already renders for its most tenured members.
- **The Tun connection is the spine.** Tying the 360-day Mayan cycle
  already present in the badge doctrine directly to the 12-month
  subscription anniversary turns two previously-separate metaphors (badge
  cycles, subscription months) into one coherent piece of world-building —
  the kind of detail that makes the product feel authored rather than
  templated.

---

**LOT Systems Corporation**
**Vadim Marmeladov — CEO, Founder, Inventor**
