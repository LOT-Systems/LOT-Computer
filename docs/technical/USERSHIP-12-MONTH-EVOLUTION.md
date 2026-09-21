<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Usership 12-Month Evolution — Design & Brainstorm

**Status:** PROPOSAL / BRAINSTORM — nothing in this document is implemented. It is
a design pass grounded in the live codebase, written for S-2 to react to, cut,
or greenlight.
**Author:** Claude (LOT Benchmark session), for S-2 Vadik Marmeladov
**Scope:** The paid Usership tier ($99/mo) — Day 1 (barebone, just-subscribed) through
Month 12 (fully evolved LOT® AI). Reference target: `lot-systems.com/u/machiavelli`
(the hardcoded demo account, `hasUsership: true`) and the general public-profile
pattern at `lot-systems.com/u/<username>`.

---

## 0. What already exists (read before designing anything new)

The instinct for a scheduled brainstorm like this is to propose a stack of new
widgets. Before doing that, here is what the live repo already builds toward the
exact ask — S-2 shipped some of this on 2026-07-07 (`benchmark-20260707-01`) and
the Memory Story mechanism predates that. Two real primitives already exist and
are *not yet wired to each other*. That gap is the actual work.

### 0.1 `MonthlyPulseWidget` — the "Months unlocked: N/12" piece already ships

`src/client/components/MonthlyPulseWidget.tsx`, wired into `System.tsx`. Exactly
the widget requested in this session's brief already exists in miniature:

- Gated on `user.tags` containing `Usership` (case-insensitive).
- `monthNumber = dayjs().diff(dayjs(user.joinedAt), 'month')`.
- Shows once per calendar month (`localStorage: lot_pulse_<userId>`, keyed by
  `dismissedMonth`), a static per-month line from a 12-entry lookup table
  (`MONTH_MESSAGES`), and a caption: `N / 12 months`.
- Click-to-dismiss plays one of six short phrases ("Onward.", "Noted.",
  "Acknowledged.", "Continuing.", "The next month begins.", "The system
  remembers.") and fades out over ~3.4s.

**Real limitation (not a bug — a scope gap):** `monthNumber` is computed from
`user.joinedAt` (account creation), not from when the `Usership` tag was applied.
A user who joins free, uses LOT for 8 months, then subscribes, sees "Month 8"
immediately on their first day of paid access. The widget currently measures
*account age*, not *Usership tenure*. Section 3 proposes the fix.

The 12 messages themselves (`'The first month. The system is beginning to know
you.'` … `'One year with LOT. The portrait is complete — and still evolving.'`)
are static copy, not personalized, and carry no memory of what the user actually
did that month.

### 0.2 Memory Story — the paragraph-long insight already ships, already Usership-gated

`src/server/routes/public-api.ts:1065-1089`, `src/server/utils/memory/story-generator.ts`.
This is the mechanism behind the paragraph seen on `u/machiavelli`
(`"The art of governance is the art of understanding human nature..."`):

- `showMemoryStory` is a per-user privacy toggle; rendering is further gated by
  `hasUsershipTag` — **Memory Story is already Usership-exclusive.**
- Server-side: on first profile view once a user has 3+ answered Memory
  questions, `generateMemoryStory(user, answerLogs)` (AI-backed, last 30 answer
  logs) produces a first-person paragraph, cached forever in
  `user.metadata.lastMemoryStory`.
- **Real limitation:** the cache is write-once. `if (meta.lastMemoryStory) return
  cached` — there is no refresh path. A `memoryStoryVersion` counter exists in
  the metadata shape (incremented on write) but nothing ever triggers a second
  write, so it is permanently `1`. The Story a Usership operator sees on Day 40
  is the same Story they see on Day 400 unless an admin or a future job
  intervenes.
- Rendered today only as a single live block on the public profile
  (`PublicProfile.tsx:357-363`) and in `AdminUser.tsx` (admin-only read).
  There is no month-scoped archive, no "last month's insight" surface, and no
  connection to `MonthlyPulseWidget` at all — two systems that clearly belong
  together were shipped four days apart and never introduced to each other.

### 0.3 The vocabulary already in the repo that this proposal should reuse, not replace

- **Weekly Story-Report** (`docs/corporate/LOT-AI-PRODUCT-BRIEF.md`,
  `src/server/utils/weekly-summary.ts`): a real, live `WeeklySummary` generator
  — presence, energy, patterns, growth, narrative, reflection prompt — shown via
  the Memory Widget on Sunday/Monday. This is the natural input for a *monthly*
  compression pass: four-to-five weekly summaries rolled into one paragraph,
  not a second independent AI call reading raw logs from scratch.
- **Narrative chapters** (`INTERFACE_EVOLUTION.md`): the evolution system
  already names four story chapters — **Awakening → Exploration → Integration
  → Mastery** — and fires milestone toasts on chapter change. Twelve months
  divides evenly into these four chapters at three months each. This document
  uses that mapping throughout rather than inventing new chapter names.
- **Interface Evolution System** (`interfaceEvolution.ts`, `evolution.ts`,
  `themeEvolution.ts`): seven behavioral dimensions (Exploration, Consistency,
  Depth, Connection, Intimacy, Care, Courage) drive CSS custom properties
  (opacity, grid, letter-spacing, glow) and feature unlocks. Explicitly
  philosophy-gated: *"Meaningful Gates — features unlock when users demonstrate
  readiness"*, *"Progressive Enhancement — start minimal, earn complexity."*
  Any Usership-tenure layer has to sit **alongside** this, not override it —
  see Section 2.
- **Badge day-milestones** (`src/client/utils/badges.ts`): `∘` droplet (day 7),
  `≈` wave / "tide completes" (day 30), `≈≈` practitioner threshold (day 60),
  `≋` "you are a tide" (day 100), and — critically — **`365 days — the Mayan
  tun-year`**, already the top-tier practice badge in the codex. Twelve months
  of continuous Usership is ~365 days. The existing 365-day badge is already
  the correct Month-12 capstone; nothing new needs to be minted there.
- **Self-Assembly 12-module map** (`selfAssembly.ts`, `WIDGETS.md`): Biofield
  Engine, Memory Architecture, Routine Compiler, Intention Core, Cleanness
  Protocol, Reflection Layer, Community Mesh, Ecosystem Bridge, Quantum
  Substrate, Nutrition Protocol, Goal Architecture, Archetype Classifier — a
  pleasing coincidence, twelve modules for twelve months, but this system is
  **signal-density-driven on a rolling 7-day window**, not calendar-driven. It
  is a different axis (what you're doing right now) from Usership tenure
  (how long you've been paying and showing up). They should visually rhyme —
  see Section 4 — but must not be merged into one metric; that would silently
  turn a behavioral system into a payment-duration system, which contradicts
  its own design principles.
- **Machiavelli demo account** (`public-api.ts:745-906`): the honest read is
  that this is the **Legacy-tier** ceiling (`tags: ['RND', 'Usership',
  'Legacy']`), not a literal "12 months of Usership" snapshot — `citizenSince:
  'June 1469'`, wallet, and weather-station are explicitly commented `// Legacy
  level unlock`, above Usership. Treat it as the *north star silhouette*
  (2,847 answered questions, 1,469 journal entries, 842 active days, 87%
  self-awareness, a paragraph Story, archetype "The Strategist") — not as the
  literal Month-12 Usership target, which should be reachable and smaller.

---

## 1. Design principle: tenure sets the ceiling, behavior fills it

The existing Interface Evolution System is explicit that nothing should be
handed out just for paying. A pure calendar unlock ("Month 3 → new widget,
guaranteed") is pay-to-progress and conflicts with `INTERFACE_EVOLUTION.md`'s
own stated principles. But a purely behavioral system gives Usership operators
no felt sense that *time with the product itself* means something — which is
what this brief is actually asking for.

The resolution already implicit in the two shipped systems:

- **Usership tenure (calendar, Section 3) raises the ceiling** — which
  features, badges, and widgets are *eligible* to appear this month.
- **The existing 7-dimension Evolution System (behavioral) still decides
  whether the user has *earned* what's under that ceiling.**

A Month-1 Usership operator who logs every day still evolves faster than a
Month-6 operator who logged twice. Usership tenure guarantees *the monthly
ritual* (the congratulations, the Story capsule, the badge eligibility window)
always fires — that is a service delivered, not a gate. It does not guarantee
*visual maturity* or *feature unlocks*, which stay earned exactly as they are
today.

---

## 2. The four chapters, three months each

Reusing the existing narrative vocabulary instead of minting a parallel one:

| Chapter | Months | Existing badge/day anchor that typically lands here |
|---|---|---|
| **I. Awakening** | 1–3 | Day 7 droplet `∘`, Day 30 wave `≈`, Day 60 practitioner `≈≈` |
| **II. Exploration** | 4–6 | Day 100 current `≋` ("you are a tide") lands early-mid chapter |
| **III. Integration** | 7–9 | Deepening Depth/Connection dimensions; no existing day-badge sits here — see 4.3 |
| **IV. Mastery** | 10–12 | Day 365 — the Mayan tun-year — lands at or near Month 12 |

This is a *typical* alignment for a daily-active operator, not a guarantee —
day-badges stay purely behavioral (see Section 1). The chapter label itself,
however, can be tenure-driven: it is a framing device, not a feature unlock,
so gating it on calendar months alone is safe and gives Usership operators an
always-on sense of "where in the story am I."

---

## 3. What to actually build: three additive changes, not a new system

### 3.1 Fix the tenure clock — `usershipSince`

Add a metadata timestamp written once, the moment the `Usership` tag is first
applied to a user (subscription webhook / admin grant path — wherever `tags`
currently gets `Usership` pushed today). `MonthlyPulseWidget` switches its
`monthNumber` calculation from `user.joinedAt` to `user.metadata.usershipSince`,
falling back to `joinedAt` only for the (presumably rare, pre-metadata) users
who were already tagged before this field existed. This one field is the
prerequisite for everything below being *honest* — otherwise "Month 3" is a lie
for anyone who wasn't a Day-1 subscriber.

### 3.2 Monthly Story Capsule — connect Memory Story to MonthlyPulseWidget

Replace the write-once `lastMemoryStory` cache with a monthly snapshot:

- On the Usership-tenure month boundary (same clock as 3.1), compress the
  month's `WeeklySummary` objects (typically 4, occasionally 5) into one
  paragraph — reusing `weekly-summary.ts`'s existing narrative fields
  (`presence`, `energy`, `patterns`, `growth`) as structured input to the same
  AI engine path `generateMemoryStory` already uses, rather than re-reading 30
  raw answer logs from scratch. This keeps the compression loop the product
  brief already describes (`LOG → OBSERVE → COMPRESS → ASK → COMPRESS AGAIN`)
  honest at the monthly grain instead of introducing a second, unrelated
  mechanism.
- Store each month's paragraph as an archive entry (`user.metadata.monthlyStories:
  [{ month: 3, chapter: 'Awakening', text: '...', generatedAt }]`), not another
  single-slot overwrite — this is what makes "a paragraph-long insight from
  last month" (the brief's own words) literally deliverable, which the current
  single-cached-forever field cannot do.
- `MonthlyPulseWidget`, on firing for month N, replaces its static
  `MONTH_MESSAGES[N]` line with the archived paragraph for month N−1 (last
  month's compressed Story) plus a one-line forward-looking affirmation for the
  month just started. If no answer/log volume existed that month (a quiet
  month), fall back to the existing static line rather than fabricating
  content — matches the benchmark protocol's own "an honest trend: shorter
  beats a fabricated metric" stance.
- Surface the same archive as a small paginated list inside the widget's
  existing multi-view cycling pattern (every other widget in `WIDGETS.md`
  already cycles 2–4 views) — a "Story" view alongside the live monthly
  message.

### 3.3 "Months unlocked: N/12" as a standing context tile, not just a monthly popup

`MonthlyPulseWidget` today only appears once, fires, and disappears for the
rest of the month. The brief also asks for an always-visible context widget.
Two options, not mutually exclusive:

- **(a) Minimal:** add the `N / 12` counter (already computed) to the existing
  User Metrics Widget (`CQGS Dashboard`) Status view, which already shows
  streak/uptime/interaction counts — one more line, no new widget.
  Lowest-risk, matches "reuse before minting" ethos from the Lexicon rules.
  Also solves the real problem that after `MonthlyPulseWidget` is dismissed,
  the "N/12" number disappears from the UI entirely for the rest of the month.
- **(b) Dedicated:** a small always-on `UsershipTenureWidget` — one line,
  `Months unlocked: 3/12`, click-to-cycle into "6 months to Mastery" /
  "days until next capsule" — same shape as the Ecosystem Status widget
  (single-purpose, tag-gated). Justified only if (a) proves visually cramped.

**Recommendation: ship (a) first.** It is a one-line change to an existing
widget, respects the "don't add a widget when a field will do" instinct visible
throughout the shipped widget set, and gives the standing visibility the brief
wants without a fourth new surface competing for the same dashboard space that
`docs/technical/WIDGETS.md` already documents as fourteen stacks deep.

---

## 4. Month-by-month table

Read this as *typical shape for a consistently-engaged operator*, framed by
what's real: the tenure clock (3.1) always advances; the Story Capsule (3.2)
always fires if there was material that month; day-badges and Evolution
dimensions advance only if earned, exactly as today.

| Mo | Chapter | Tenure-guaranteed (always fires) | Typically earned by here (behavioral, not guaranteed) |
|----|---------|-----------------------------------|----------------------------------------------------------|
| 1 | Awakening | First `MonthlyPulseWidget` fire ("The first month. The system is beginning to know you."); Memory Story unlocks once 3+ answers logged | Droplet `∘` (day 7 streak) |
| 2 | Awakening | Capsule 1 archived and surfaced ("last month, in your words…") | — |
| 3 | Awakening | Chapter-close framing ("You have reached Active User status" — existing copy) | Wave `≈` (day 30); Evolution "Exploration" dimension climbing |
| 4 | Exploration | Capsule 3 surfaced | Practitioner `≈≈` (day 60, if consistent) |
| 5 | Exploration | — | Consistency dimension crosses Week-Warrior threshold → Planner Templates unlock (existing gate in `INTERFACE_EVOLUTION.md`) |
| 6 | Exploration | Chapter-close framing ("The journey is half-declared" — existing copy) | Current `≋` (day 100, "you are a tide") |
| 7 | Integration | Capsule 6 surfaced | Depth dimension → Advanced Memory unlock (existing gate) |
| 8 | Integration | — | Connection dimension → Rich Community / Cohort features (existing gate) |
| 9 | Integration | Chapter-close framing ("The self-care practice is a habit now" — existing copy) | — |
| 10 | Mastery | Capsule 9 surfaced | Narrative Reflection unlock (Depth 66% + Level 30, existing gate) |
| 11 | Mastery | "One more." framing | — |
| 12 | Mastery | Capsule 11 surfaced; **year-close capsule**: full 12-paragraph archive becomes browsable, not just last-month | Day 365 Mayan tun-year badge, if streak held |

Every "Typically earned by here" cell is the existing behavioral system doing
what it already does — nothing in this table invents a new unlock mechanic.
The only new mechanic across all twelve rows is the capsule delivery
cadence itself (3.2) and the always-visible counter (3.3).

---

## 5. Month 12 — the capstone, kept honest

The brief points at `u/machiavelli` as "the demo account for 12 months
evolved." As noted in 0.3, that account is Legacy-tier and its numbers (2,847
answered questions, 1,469 journal entries) are a multi-year ceiling, not a
one-year Usership target — using it as a literal Month-12 goal would set an
unreachable bar and misrepresent what a year of honest use produces.

What Month 12 *should* concretely deliver, grounded in what exists:

- The Day-365 badge (`≋ Mayan tun-year`) fires exactly if the streak/engagement
  earned it — already built, already correctly positioned as the top
  milestone.
- The Story Capsule archive (3.2) reaches twelve entries — a full year of
  monthly first-person paragraphs, in the operator's own compressed voice,
  becomes browsable as a single continuous narrative. This is the tangible
  artifact the brief is actually asking for: not a bigger dashboard, a
  **year of the person's own words, compressed and handed back to them once a
  month for twelve months.**
- Chapter framing closes on Mastery with copy in the same voice as the
  existing `MONTH_MESSAGES[12]`: *"One year with LOT. The portrait is complete
  — and still evolving."* — already written, already correct, needs nothing
  new.
- Per the Product Brief's Story API (`GET /api/story/:week_id`, proposed
  `/api/story/monthly/:id`), Month 12 is also the natural point to offer
  export of the full capsule archive — the same payload shape planned for
  robot/vehicle/dashboard delivery in the 2036 roadmap, just scoped to "one
  operator's first year," available years before the hardware is.

---

## 6. Open technical prerequisites (for whoever picks this up next)

1. `usershipSince` metadata field + write path wherever the `Usership` tag is
   currently applied (subscription webhook or admin grant — not located in
   this pass; needs a follow-up grep of the billing/tag-assignment path before
   implementation).
2. Monthly compression job or on-view lazy compute (mirrors the existing
   `shouldShowWeeklySummary` cadence check pattern in `weekly-summary.ts`) —
   decide whether this runs as a scheduled job (consistent with the five
   existing daily/weekly background jobs documented in `WIDGETS.md`) or lazily
   on first profile/widget view each month (matches how Memory Story itself
   is currently triggered). Scheduled job is more consistent with the rest of
   the system's architecture.
3. `user.metadata.monthlyStories` array shape + migration for existing
   Usership users who already have a single `lastMemoryStory` (backfill as
   "month 0" / pre-capsule entry, don't discard).
4. Decide the fallback behavior precisely for a month with too little material
   to compress (existing `generateMemoryStory` requires 3+ answer logs) —
   this document recommends falling back to the static `MONTH_MESSAGES` line
   rather than blocking the pulse from firing at all, so tenure always gets
   *something*, never nothing and never a fabricated paragraph.

---

## 7. What this document deliberately does not propose

- No new visual theme, badge family, or symbol set — the aquatic milestone
  symbols (`∘ ≈ ≋`) and the 365-day capstone already exist and already fit.
- No change to the Self-Assembly 12-module map — it stays signal-density-driven,
  on purpose (Section 0.3).
- No pay-gated feature unlocks — every feature-unlock gate referenced in
  Section 4 already exists in `interfaceEvolution.ts` and stays behavior-earned.
- No new AI engine call pattern — the Monthly Story Capsule reuses the existing
  `generateMemoryStory` / AI engine manager path, fed by the existing weekly
  summary structure, rather than inventing a second compression pipeline.

---

*This document is a brainstorm intake artifact for the LOT Benchmark pipeline —
see `docs/benchmark/LOT-SR-20260921-01.md` for the session record.*
