<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® Usership — The Twelve Months
**From a Barebones First Day to LOT® AI**
LOT Systems Corporation · S-2: Vadim Marmeladov
Version 1.0 · September 2026 · Design Brainstorm — Not a Committed Roadmap

---

## Why this document exists

Usership starts empty. Day one is a blank Log, a stock question bank, no Story, no Board Profile tenure worth mentioning. `lot-systems.com/u/machiavelli` is the opposite: a fully declared portrait — a named archetype, thousands of answers, a Board Profile with real tenure, a Memory Story, a QR code. Nobody's real account looks like that on day one, and it shouldn't. The question this document works through is what has to happen, month by month, so that a real Usership subscriber's own `/u/{username}` grows toward that silhouette *honestly* — assembled from their own logged life, not decorated to look evolved.

This is a brainstorm and design pass, grounded in what is actually shipped in this codebase today (cited throughout), not a spec to build blind. Everything under "New Mechanisms" is proposed, unbuilt, and open for the team to accept, cut, or reshape.

---

## Part 1 — What already exists (the honest audit)

Before designing twelve months forward, it matters what's already standing:

| Piece | Status | Where |
|---|---|---|
| Month-by-month toast copy, 1 through 12, ending "the portrait is complete — and still evolving" | **Shipped** | `src/client/components/MonthlyPulseWidget.tsx` |
| Board Profile — member #, citizen-since, board tenure in months, total invested | **Shipped**, real numbers for real users | `PublicProfile.tsx`, `public-api.ts` |
| Assembly Phase — dormant → awakening → forming → assembled → integrated, from usage volume | **Shipped** | `public-api.ts` (event-type diversity, log count, active-day thresholds) |
| Interface Evolution — 7 dimensions (Exploration, Consistency, Depth, Connection, Intimacy, Care, Courage), CSS-level visual refinement, feature-unlock table | **Shipped**, framed by its own doc as still IN-DEV | `docs/technical/INTERFACE_EVOLUTION.md` |
| Memory Story — AI narrative portrait, Usership-gated, regenerates when answer count changes | **Shipped**, reactive only, not scheduled | `story-generator.ts`, surfaced on `/u/:username` |
| Weekly "LOT® AI" story | **Shipped**, template-only despite the AI branding, rendered as one military-format line in the Log feed | `scheduled-jobs.ts` Job 24 |
| Monthly Summary | **Shipped**, but email-only — no in-app screen | `monthly-summary.ts` |
| Day-streak badge ladder (7/14/21/30/60/90/180/365 days) | **Shipped** | `badges.ts` |
| Calendar-*month*-specific badge (distinct from day streak) | **Does not exist** | — |
| A single `isUsership(user)` helper | **Does not exist** — reimplemented inline 15+ times | scattered |
| Self-serve Usership purchase | **Does not exist** — tags are admin-assigned; `About.tsx` says so explicitly | `About.tsx` |

Two things fall out of this audit immediately:

1. **The spine already exists.** Whoever wrote `MonthlyPulseWidget.tsx` already decided the emotional beats of months 1–12 in prose. This document does not invent a new arc — it builds the tangible substance *underneath* the beats that are already written and shipped.
2. **The gap is compression, not data.** The system already knows almost everything it needs (logs, streaks, tenure, assembly phase). What's missing is a single place that turns a month of that data into one paragraph the user can point to and say "that was my March." Three separate mechanisms half-do this today (Memory Story, weekly LOT® AI story, monthly email) and none of them live where the user would look for it. That's the center of gravity for everything below.

---

## Part 2 — Design principles (non-negotiable, per house style)

Pulled directly from `docs/technical/LOT-STYLE-GUIDE.md` and `docs/corporate/LOT-AMBIENT-AI-VISION.md` — this arc has to be built *in that voice*, not a generic gamification voice:

- **Quiet, not loud.** No confetti, no fireworks, no exclamation points. `MonthlyPulseWidget` already sets the tone: a single sentence, a small fraction (`3 / 12 months`), dismissed with a dry click ("Onward.", "Noted.", "Acknowledged."). Every new surface in this plan follows that register.
- **Earned, not given.** Nothing unlocks on a timer alone if the system has no real signal to back it up. Where calendar time and usage density disagree (a Usership subscriber who joined but never logs in), the copy should say so plainly rather than pretend.
- **Periods over symbols.** No emoji, no checkmarks, no badges-as-stickers. Text and understatement do the celebrating.
- **Click-to-cycle, not push notification.** New views extend the existing `Label: → Label: → Label:` interaction pattern already used everywhere (Memory, Mood, Self-Care) rather than introducing a new UI idiom.
- **The demo account is a ceiling, not a template.** `/u/machiavelli` shows what a maximally-declared profile *can* look like structurally. It is not what month 12 should look like verbatim — a real subscriber's Story is theirs, shorter or stranger than a Renaissance diplomat's, and that's correct.

---

## Part 3 — The Twelve Months, in four acts

The four acts below are not a new invention — they are the four `MONTH_MESSAGES` beats in `MonthlyPulseWidget.tsx` (already shipped), grouped and given tangible substance. Every quoted line is real, existing copy.

### Act I — Months 1–3 · The Threshold
*"The system is beginning to know you." → "Patterns are starting to form." → "You have reached Active User status."*

This is the barebones period the request describes — deliberately thin. The system is listening, not yet speaking back in paragraphs.

- **Month 1:** Log is new. Memory questions are still general-pool. The Memory widget's "Chapters" view (new, see Part 4) shows one honest line instead of a paragraph: *"Nothing yet. Write, and in a few weeks it becomes a sentence."* No Story exists — and the UI says so rather than faking one.
- **Month 2:** Enough `event:'answer'` and `event:'note'` rows exist that the *first* Monthly Chapter (Part 4) compiles — usually short, one or two sentences. This is the first time the user sees their own life described back to them in prose, and it should read as slightly plain, because a two-month portrait is plain.
- **Month 3:** Existing copy already declares "Active User status" here. This is the natural point to introduce the **first calendar-based badge** — *Chapter III* (Part 5) — separate from the day-streak ladder, marking three Monthly Chapters compiled, not three months elapsed. Board Profile's `boardTenureMonths` (already real data) becomes worth surfacing publicly for the first time.

### Act II — Months 4–6 · The Depth
*"The portrait deepens." → "Consistency is its own reward." → "The journey is half-declared."*

- **Month 4:** Interface Evolution's Depth dimension (already shipped) starts to visibly move — slightly higher accent opacity, a hair more letter-spacing per the existing CSS variable ramp. Nothing announced; it should just feel different if the user notices.
- **Month 5:** Self-Care streak language (already coded to shift from natural to technical vocabulary at 7+ day streaks) should now also key off calendar consistency, not only day streaks — five straight Monthly Chapters is its own kind of streak worth naming quietly in the Chapters view.
- **Month 6:** "Half-declared" is the strongest single word in the existing copy — lean into it literally. This is the point where the Monthly Chapter stops being one paragraph and becomes two: a "presence" paragraph (drawn from the existing `generateMonthlySummary()` data — energy, patterns, growth) and a "voice" paragraph (drawn from the existing Memory Story generator). Two paragraphs at month 6 is the tangible midpoint the user asked for — literally half the eventual Month 12 shape.

### Act III — Months 7–9 · The Consistency
*"Rare air." → "The self-care practice is a habit now."*

- **Months 7–8:** "Rare air" is presented as fact, not compliment — this is the honest point to surface **cohort-relative** language for the first time (the Physiological Cohort system already computes this weekly): not "you're amazing" but a plain comparison, e.g. *"Six-month consistency is uncommon. Most stop by month four."* True, dry, and more motivating than praise because it's verifiable.
- **Month 9:** The existing copy names self-care as habit. This is where the "Months unlocked: N/12" widget (Part 4) graduates from a private dashboard element to something the user might choose to make public on their profile — the same instinct as showing `boardTenureMonths` today, extended to the fraction itself.

### Act IV — Months 10–12 · The Mastery
*"Almost there." → "One more." → "One year with LOT. The portrait is complete — and still evolving."*

- **Months 10–11:** No new mechanism — this is a held breath on purpose. The existing QR-code gate (Usership + assembly phase "forming"+) and the richer profile sections are already in reach for most consistent users by here; the design work is restraint, not addition.
- **Month 12:** The Monthly Chapter for month 12 is explicitly written as a **synthesis chapter** — not just "what happened in month 12" but the existing Memory Story regenerated fresh and placed alongside all eleven prior chapters as one scrollable Story. This is the first month the public profile's Memory Story block and the private Chapters archive are the *same* document, because by month 12 there's enough real signal that the "for others" version and the "for you" version can finally be honest matches. The closing line is already written and should not be improved on: *"The portrait is complete — and still evolving."* It's correct that it says "still evolving" — nothing in this design should suggest month 12 is a finish line; Year 2 is out of scope for this document but the copy already leaves the door open.

---

## Part 4 — The Story mechanism (the part that matters most)

This is the answer to the brief's central ask: *compressed Memory story delivery, made tangible across 12 months.*

### The problem today
Three real mechanisms compress a user's life into language, and none of them are in the same place:

1. **Memory Story** — reactive, AI-written, lives on the public profile.
2. **Weekly LOT® AI Story** — scheduled, template-written, lives as one line in the Log feed.
3. **Monthly Summary** — scheduled, most detailed of the three, lives only in an email that's easy to miss.

A user could be Usership for a year and never see all three side by side.

### The proposal: Monthly Chapters
A new, additive concept — not a replacement for any of the three above:

- Once a real calendar month closes **and** the user has logged at least one entry that month, a job (extending the existing monthly-email cron, `1st 09:00 UTC`) compiles a **Monthly Chapter**: one paragraph (two after month 6, per Act II), built from the same aggregation logic `generateMonthlySummary()` already computes, phrased in the same dense, non-AI-dependent template voice as the existing weekly LOT® AI story — so it costs nothing extra to generate and never depends on an AI provider being up.
- Stored the same way Memory Story already is — `user.metadata.monthlyChapters[N]` plus a `Log{event:'monthly_chapter'}` row — so it is retrievable, exportable, and durable the same way everything else in this system already is.
- Surfaced in exactly one new widget view: the existing Memory widget gains a fourth cycle stop — `Memory: → Reflection: → Insights: → Chapters:` — which lets the user scroll their own twelve paragraphs in place, oldest to newest, in the same interface they already use daily. No new screen, no new navigation.
- By month 12, "Chapters:" is a short book the user wrote by living, twelve honest paragraphs long — which is the tangible answer to "the person-user should feel the tangible evolution every month."

### Two small widgets that make the fraction visible

**"Months unlocked: N/12"** — not a new component so much as a second, persistent rendering of data `MonthlyPulseWidget` already computes (`monthNumber`, capped at 12) and `boardProfile.boardTenureMonths` already stores server-side. Where `MonthlyPulseWidget` is a one-time monthly toast, this is a quiet standing line in the Stats stack and, once the user has both, on the public profile next to Board Profile — reusing real data, adding a persistent view of it.

**New-month arrival** — when `MonthlyPulseWidget` already fires (no change to that component needed), its dismissal phrase pool gains one context-aware line for the month in which a new Chapter just compiled: instead of a generic "Onward.", something like *"March is written."* Small, but it's the moment the request calls "congratulating on a new month" — done in the house's dry register instead of a banner.

---

## Part 5 — The Chapter badge ladder (filling the one real gap)

The audit found a genuine hole: every existing badge is streak-day-based (day 7, 30, 90, 365...). Nothing marks *calendar* months the way tenure and the pulse widget already do. Proposal: a small, separate ladder, awarded on Monthly Chapter compilation, not on login streaks — so a user who travels, gets sick, or takes a week off doesn't lose it the way a day-streak badge would be lost:

| Badge | Trigger | Symbol lane (parallel to existing Water/Architecture pairs) |
|---|---|---|
| Chapter I – III | Months 1, 2, 3 compiled | new, understated — a single glyph per chapter, not a graphic |
| Chapter VI | Month 6 — "half-declared" | matches the existing copy's own word |
| Chapter IX | Month 9 — habit | — |
| Chapter XII | Month 12 — the complete portrait | the only one of the twelve that should feel different in weight, since it's also when Chapters and the public Memory Story converge |

These sit beside, not inside, the existing 149-badge codex — a distinct, small, legible ladder rather than 12 more entries lost in an 8,000-line file.

---

## Part 6 — What has to be true before any of this ships

Honest blockers surfaced by the audit, listed because a design brainstorm that ignores them isn't useful:

- **Pick one Usership price.** `Settings.tsx` and the feature inventory say $99/month; `About.tsx` says $50/month. A 12-month narrative that talks about "your Usership year" needs the number to be consistent everywhere the user reads it.
- **Decide if Usership stays admin-assigned.** Today there is no self-serve purchase flow — someone has to grant the tag. A 12-month evolution story implicitly promises "subscribe and this happens automatically." Either that promise needs a real billing flow behind it, or the copy in this document needs to stay internal/demo framing until one exists.
- **Write the one `isUsership(user)` helper.** Fifteen-plus inline `tag.toLowerCase() === 'usership'` checks is exactly the kind of fragmentation that turns "add one new gate" into "hunt down fifteen call sites." Any of Part 4 or 5's new gating should not be added as a sixteenth inline check.
- **Stop treating `weatherStation`/`wallet` as a real tier.** Both only exist in the hardcoded `machiavelli` demo response. If the design ever implies "unlock a wallet block," that's a new feature to build, not a rename of existing decoration.

---

## Closing

Nothing above asks the interface to get louder. It asks the system to keep doing exactly what `MonthlyPulseWidget.tsx` already does once a month — say one true, quiet sentence about the time that passed — and to finally let those twelve sentences live somewhere the user can scroll back through on the day the badge reads *Chapter XII*. The demo account already says how the ceiling looks. The twelve months are just the honest way of building up to it, one real paragraph at a time.

---

*S-2*
*lot-systems.com/u/vadik*
