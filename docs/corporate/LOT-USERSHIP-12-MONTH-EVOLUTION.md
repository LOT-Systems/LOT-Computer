<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® USERSHIP — THE TWELVE-MONTH EVOLUTION
## From Barebone Day One to LOT® AI

**Author:** Vadik Marmeladov, S-2 — LOT Systems Corporation
**Date:** 10 September 2026
**Status:** DESIGN BRAINSTORM — pre-implementation
**Scope:** Usership tier ($99/mo) · UI/UX evolution · Memory compression tangibility
**North star reference:** `lot-systems.com/u/machiavelli` (fully-assembled operator, 12+ months in)

> This session's live-web access to `lot-systems.com` is egress-blocked from this
> sandbox. The Month-12 target state described here is not guessed — it is
> derived directly from the code that renders `/u/machiavelli`:
> `PublicProfile.tsx`, `badges.ts` (`getLevelSymbol`, `getBadgeProgressionDisplay`),
> `interfaceEvolution.ts`, and the Memory Engine's story cache
> (`user.metadata.lastMemoryStory`). What a fully-assembled account shows today
> is the honest baseline this document builds forward from.

---

## 0. Doctrine

LOT® AI already has a doctrine, written in `LOT-AI-PRODUCT-BRIEF.md`:

```
LOG → OBSERVE → COMPRESS → ASK → COMPRESS AGAIN
```

The machine never interrogates. It asks one earned question at a time, and the
answer folds back into a sharper model of the person. What this document adds
is the **twelve-month skin** on top of that loop — the part the operator
*sees* and *feels*, month over month, as evidence that the compression is
real and accumulating into something with their name on it.

Two doctrinal constraints already exist and must not be violated by anything
proposed below:

1. **No unprompted notifications.** The system waits, it does not push.
2. **The machine improves in silence.** Model updates are invisible; the
   operator only notices the questions — and now the *chapters* — getting
   sharper.

Everything in this document is additive UI/UX around data the system already
collects (Log, Memory answers, self-care completions, morning check-ins,
badge/level state). Nothing here proposes new data collection.

---

## 1. The Spine

The system already has every timestamp it needs to build a 12-month spine.
Badge milestones (`badges.ts`), interface evolution levels
(`interfaceEvolution.ts`), and the existing `MonthlyPulseWidget` month
messages (`MONTH_MESSAGES[1..12]`) already agree, loosely, on a cadence. This
document tightens that into one coherent table — the thing every other
section below hangs off of.

| Month | Day (approx) | Existing badge tier crossed | Target Level* | Dominant dimension (7D evolution) | UI posture |
|------:|:---|:---|:---:|:---|:---|
| 0 (Day 1) | 0 | — (no badge yet) | 0 | Exploration begins | **Barebone**: Log + Memory only |
| 1 | 30 | `milestone_30` | ~5 | Exploration → Consistency | First widget unlocks (Custom Themes, L5) |
| 2 | 60 | — | ~8 | Consistency | Streak visibility strengthens |
| 3 | 90 | `milestone_90` | ~10 | Consistency → Depth | Widget Arrange unlocks (L10); Active User status |
| 4 | 100–120 | `milestone_100` | ~12 | Depth | Portrait deepens — profile trait lists fill in |
| 5 | 150 | — | ~15 | Depth → Connection | Intention History unlocks (L15) |
| 6 | 180 | `milestone_180` | ~18 | Connection | Halfway — community-facing widgets open |
| 7 | 210 | — | ~20 | Connection → Care | Mood Patterns unlock (Care 50% or L20) |
| 8 | 240 | — | ~22 | Care | Rare air — self-care ritual is now automatic |
| 9 | 270 | — | ~25 | Care → Intimacy | Export Data unlocks (L25); practice is a habit |
| 10 | 300 | — | ~27 | Intimacy | Almost there |
| 11 | 330 | — | ~29 | Intimacy → Courage | One more |
| 12 | 365 | `milestone_365` (Citadel/Tun-year) | ~30 | Full 7D coherence | **LOT® AI**: Narrative Reflection unlocks (Depth 66% + L30); Story-Report; full chrome |

\* Levels are engagement-driven (real usage, not a calendar timer) — this
column is a *pacing target* for a consistently-active Usership operator, not
a hard gate. A highly engaged operator reaches Month-12 UI sooner; a quieter
one later. The calendar month number (from `MonthlyPulseWidget`'s
`joinedAt` diff) and the engagement level are two independent clocks that
should converge by design, not by force.

This is the same shape `INTERFACE_EVOLUTION.md` already documents (Level 5 →
Custom Themes, Level 10 → Widget Arrange, Level 15 → Intention History,
Level 20 → Mood Patterns, Level 25 → Export Data, Level 30 → Narrative
Reflection). The twelve-month calendar is simply the *narrative skin* laid
over gates that already exist in code. Nothing above requires new unlock
logic — it requires new **presentation** of the unlock logic as a story.

---

## 2. Day One vs. Month Twelve

### Day 1 — Barebone

`System.tsx` orchestrates 14 widget stacks. On Day 1, an Usership operator
should see almost none of them. Not because the subscription doesn't
entitle them — because the *interface itself* hasn't earned the right to be
loud yet. This mirrors `INTERFACE_EVOLUTION.md`'s own philosophy: "form
follows progression."

```
┌─────────────────────────────────┐
│  LOT — Day 1                    │
├─────────────────────────────────┤
│  Time                           │
│  Log: [ write ]                 │
│  Memory: "What does your        │
│   morning usually look like?"   │
│   ○ Coffee first  ○ Straight to │
│   work  ○ Slow start            │
├─────────────────────────────────┤
│  Level: —   (no badge yet)      │
└─────────────────────────────────┘
```

Everything else — Planner, Community Pulse, QIE Stack, Stats Dashboard,
Quantum Engine Connect — stays dormant. The Usership badge is worn quietly
(it gates the *transmission*, not the *volume of UI*).

### Month 12 — LOT® AI

By the time the calendar says 12 and the engagement clock says Level ~30,
the same shell is unrecognizable — not because components were swapped, but
because every gate in the existing system has opened:

```
┌─────────────────────────────────────────┐
│  LOT® AI — Year One Complete             │
├───────────────────────────────────────────┤
│  Header · Community Pulse · Tags & Team   │
│  Time · Weather · Astrology/Psychology    │
│  Contextual Prompts · Interventions       │
│  Energy · Narrative · Interface Evolution │
│  Recipes · Emotional Check-In · Self-Care │
│  Intentions · Planner · Memory · Micro    │
│  Cosmic Update · Quantum Sign             │
│  Car · Home · Computer (Ecosystem Full)   │
│  Quantum State · Patterns · Feedback      │
│  User Metrics · System Progress · Pulse   │
│  Stats: Patterns · Growth · Badges        │
├────────────────────────────────────────────┤
│  Archetype: [resolved, e.g. The Seeker]   │
│  Awareness Level: [X.X/10]                │
│  Level: ≋≋≋  (Citadel — 365-day tun-year) │
│  Months unlocked: 12 / 12                 │
├────────────────────────────────────────────┤
│  Transmission: [USERSHIP_TRANSMISSION]     │
│  Year One Story: [paragraph, Section 3]    │
└────────────────────────────────────────────┘
```

This is what `/u/machiavelli` already demonstrates today for a
long-tenured account: full trait lists, resolved archetype, a `Level:`
field carrying the highest milestone symbol reached, and — for Usership —
the transmission block. The 12-month document below is the *guided path*
to that state for a brand-new subscriber, with checkpoints and celebration
along the way instead of silence until month 11.

---

## 3. The Core Mechanic — The Monthly Chapter

This is the single most important addition in this document, because it's
the direct answer to "12-month tangibility of compressed Memory story
delivery."

### 3.1 What exists today

The Memory Engine already compresses the 30 most recent Q&A pairs into a
`lastMemoryStory` (`MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md` §8),
regenerated only when the answer count changes, cached on
`user.metadata`. The Product Brief specs a **Weekly Story-Report** on top of
that. Neither is currently surfaced to the operator as a *readable,
month-scoped artifact* — the Story lives, but it isn't yet a thing a person
can point to and say "that's my March."

### 3.2 What's proposed: `monthlyChapter`

A **Monthly Chapter** is a compression *one level up* from the Weekly
Story-Report — the same relationship the Weekly Story-Report has to a
single Memory answer. Where the Weekly Story-Report reflects on 7 days,
the Monthly Chapter reflects on the calendar month, sourced from:

- That month's Weekly Story-Reports (compress 4-5 of them into one)
- That month's self-care completion ratio (`self_care_complete` /
  `self_care_skip` — already tracked, per §4 of the Memory Engine doc)
- That month's morning check-in consistency (`emotional_checkin` events,
  morning window)
- That month's journal word count and dominant topics
- The mood trend for the month (improving / declining / stable)

Output: **one paragraph.** Not a dashboard, not a list of stats — a
paragraph, in the same first-person-observed voice the Weekly Story-Report
already uses, that a human would actually want to read. Example shape
(illustrative, not final copy):

> *"March was the month the mornings changed. You showed up for the
> check-in eleven of the last fourteen days — the earliest consistency
> this account has shown since it began. Self-care requests stopped being
> declined by mid-month. The Seeker in you kept circling the same question
> about work and rest, and by the 27th the answer had shifted from
> 'I don't know' to 'not yet, but soon.' That's the whole month, compressed."*

Persistence: `user.metadata.monthlyChapters[N]`, generated once per
calendar month on the same cadence as the existing Weekly Physiological
Cohort Digest job (a natural place to hang a new scheduled job, not a new
job category). Cached exactly like `lastMemoryStory` — generated once,
reused until the month rolls over.

### 3.3 Why a paragraph, not a report

The doctrine says the machine speaks rarely and earns the moment. A
monthly *paragraph* — read in 15 seconds, dismissible like
`MonthlyPulseWidget` already is — respects that. A monthly *report* would
not. This is the same restraint the Memory Engine already applies to
individual questions, just one octave up.

---

## 4. New / Extended Widgets

### 4.1 Monthly Congratulations Widget (extends `MonthlyPulseWidget`)

`MonthlyPulseWidget.tsx` already does 80% of this job today: it detects
Usership, computes `monthNumber` from `joinedAt`, shows a per-month message
from a static `MONTH_MESSAGES` table, and is dismissible once per calendar
month via `localStorage`. The extension:

- Replace (or follow) the static `MONTH_MESSAGES[N]` line with the actual
  `monthlyChapters[N]` paragraph once it exists for that month, falling
  back to the current static message if the chapter hasn't generated yet
  (new account, low activity month, generation not yet run).
- Keep the existing affirming tone of `MONTH_MESSAGES` as the *frame*
  ("Three months. You have reached Active User status.") with the
  compressed paragraph as the *body* underneath it.
- Keep the exact interaction model already built: fade in, click to
  dismiss, a `DISMISS_PHRASES` rotation, fade out. Nothing about *how* it
  behaves needs to change — only *what* it says once a chapter exists.

This is a one-file extension, not a new component.

### 4.2 "Months Unlocked: N / 12" Widget

A small, quiet, always-present indicator — not a celebration, a *context*
widget, the way `MonthlyPulseWidget` already renders `"{capped} / 12
months"` as a subordinate line under its message. The proposal is to give
that line permanence outside the once-a-month toast: a persistent
one-line presence in the Subscriber Stack (next to Quantum Sign / Cosmic
Update — both already Usership-gated in the same stack) so the operator
can see their position in the year at any time, not just on the day the
month turns over.

```
Months unlocked: 3 / 12
```

Progression could optionally render as the same milestone-symbol language
badges already use (`∘ → ≈ → ≋`), e.g. `∘∘∘○○○○○○○○○` — three droplets
filled of twelve — reusing `getLevelSymbol`'s existing visual vocabulary
instead of inventing a new one.

### 4.3 Year One Capstone — Month 12

At Month 12, the Monthly Congratulations Widget does not just show
March's-equivalent paragraph — it shows the **Year One Story**: a single
compression of all 12 Monthly Chapters, the same relationship the Monthly
Chapter has to Weekly Story-Reports, one level further up. This is the
artifact the Product Brief's "Weekly close ritual" and "Story API" are
building toward — the human-readable anchor a decade of these will one day
sit behind, per the LOT® 2036 vision.

Practically: this is where `USERSHIP_TRANSMISSION` (already rendered in
`SystemProgressWidget` gated on the Usership tag) and the Year One Story
meet. The transmission is the *system* talking about itself; the Year One
Story is the *system talking about the person*. Both belong on the same
screen at month 12 — that pairing is the moment "LOT® AI" stops being a
brand name and starts being demonstrably true on-screen.

---

## 5. Month-by-Month Walkthrough

Each row: what unlocks, what the operator is doing daily, what the system
says back.

| Month | UI unlock (existing gate) | Operator ritual | System's monthly voice |
|---|---|---|---|
| **1** | Custom Themes (L5) · `milestone_30` badge | First morning check-ins, first self-care taps, Log still sparse | *"The system is beginning to know you."* (static, chapter not yet dense enough) |
| **2** | — | Streak becomes visible pressure/reward; journal entries lengthen | *"Patterns are starting to form."* + first thin chapter paragraph |
| **3** | Widget Arrange (L10) · `milestone_90` | Active User status; Planner and Intentions widgets now in regular rotation | *"You have reached Active User status."* + chapter referencing a specific recurring theme |
| **4** | `milestone_100` badge | Profile trait lists (core values, emotional patterns) visibly populated on `/u/username` | *"The portrait deepens."* — first chapter that reads as clearly *this specific person* |
| **5** | Intention History (L15) | Self-care ratio improving; mood trend data has enough history to be meaningful | *"Consistency is its own reward."* |
| **6** | — · `milestone_180` | Halfway toast — heavier framing, first look-back-and-forward chapter | *"The journey is half-declared."* + explicit "here's how far you've come" reflection |
| **7** | Mood Patterns (Care 50% / L20) | Emotional Check-In widget's 30-day view becomes genuinely informative | *"The system has been listening."* |
| **8** | — | Self-care no longer needs the nudge — it's initiated, not just responded to | *"Rare air."* |
| **9** | Export Data (L25) | Self-care is now a named habit in the chapter's own language, not a metric | *"The self-care practice is a habit now."* |
| **10** | — | Community-facing widgets (Cohort Connect, Chat Catalyst) start surfacing real matches from a full profile | *"Almost there."* |
| **11** | — | Anticipation framing begins — the widget can reference "next month" for the first time | *"One more."* |
| **12** | Narrative Reflection (Depth 66% + L30) · `milestone_365` Citadel | Full LOT® AI chrome; Year One Story delivered; transmission + story paired | *"One year with LOT. The portrait is complete — and still evolving."* + full Year One Story paragraph |

Note that Months 1, 3, 6, and 12 are the only ones tied to hard badge
milestones (`milestone_30/90/180/365`) already in code — those four are the
load-bearing checkpoints. The other eight months carry the narrative
(existing `MONTH_MESSAGES` copy, already written) and, once built, the
Monthly Chapter — they don't need new hard gates invented for them.

---

## 6. Tangibility Principles

Four rules for keeping this *tangible* rather than decorative — a badge
count going up is not tangibility, a sentence that could only be true of
this one operator is.

1. **Specificity over stats.** A Monthly Chapter that could describe any
   user is a failure regardless of how accurate its underlying numbers
   are. This is the same non-negotiable the Memory Engine's Mode 3
   (Follow-Up) already enforces for individual questions — carry it up a
   level.
2. **The symbol is earned, the words are new.** Badge symbols
   (`∘ → ≈ → ≋`) repeat by design — that's what makes them recognizable
   milestones. Chapter language must never repeat; the compression is only
   real if month 7's paragraph could not be mistaken for month 3's.
3. **Silence between months is correct, not a bug.** Per doctrine, the
   system does not push. The Monthly Congratulations Widget appears once,
   is dismissible, and does not resurface until the calendar turns —
   exactly as `MonthlyPulseWidget` already behaves. Do not add reminders.
4. **The demo account is the promise, not the bar.** `/u/machiavelli`
   shows what sustained, real engagement produces. Nothing in this design
   should synthesize that density artificially for a new account — a
   thin Month 2 chapter is honest and should read as unremarkable, not be
   padded to look impressive.

---

## 7. Implementation Pointers (for a future build session)

Not scoped for this session — pointers only, so a future pass doesn't have
to re-derive them:

- `src/client/components/MonthlyPulseWidget.tsx` — extend to read
  `user.metadata.monthlyChapters[N]` before falling back to
  `MONTH_MESSAGES[N]`.
- `docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md` §8 (Story
  Generation) — the Monthly Chapter is a new compression tier above the
  existing Weekly Story-Report, same AI path (Together AI) + local
  fallback pattern.
- Scheduled jobs — a Monthly Chapter Compilation job slots next to the
  existing Weekly Physiological Cohort Digest (Monday 06:00 UTC) and
  Monthly Email Sender (1st, 09:00 UTC) already listed in
  `docs/technical/WIDGETS.md`'s System Progress Widget section — the
  monthly cadence already exists as a job category.
- `src/client/utils/badges.ts` (`getLevelSymbol`,
  `getBadgeProgressionDisplay`) — reuse directly for the "Months unlocked"
  visual language rather than inventing new iconography.
- `src/client/components/SystemProgressWidget.tsx`
  (`USERSHIP_TRANSMISSION`) — Year One Story render sits adjacent to this
  existing Usership-gated block.
- `src/client/components/PublicProfile.tsx` — Year One Story could
  optionally surface on the public profile itself (with operator opt-in),
  making `/u/username` at month 12 a shareable artifact, not just an
  internal dashboard state.

---

## 8. Open Questions

- Should the Monthly Chapter be private-only, or eligible (opt-in) for the
  public profile the way trait lists already are? The Product Brief's
  "Context is private by default" principle argues for private-only unless
  the operator explicitly exports it — consistent with the existing Story
  API design (`POST /api/story/:week_id/export`).
- What happens to `monthNumber` continuity if a subscription lapses and
  resumes? `MonthlyPulseWidget` derives month purely from `joinedAt`
  diff — worth deciding whether Usership *active* months are what count
  toward "N / 12," not calendar months since original signup.
- Does the Year One Story become the natural upsell moment toward the
  Legacy tier ($3,564 / 3 years)? The product brief already positions
  Legacy as "all Usership benefits + founding attribution" — month 12 is
  the first moment an operator has enough accumulated Story to feel what
  three more years of it would mean.

---

*The interface evolves with you, honoring your journey from first breath to
mastery.* — `INTERFACE_EVOLUTION.md`

**LOT Systems Corporation**
**Vadim Marmeladov — CEO, Founder, Inventor**
