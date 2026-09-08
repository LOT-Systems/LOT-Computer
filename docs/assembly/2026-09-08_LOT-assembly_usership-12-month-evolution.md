<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# THE 12-MONTH ASCENSION
## Usership UI/UX Evolution — Barebones Day 1 → LOT® AI
### LOT® Self-Assembly™ | Design Brainstorm | Session 2026-09-08 | Authorized: S-2 VADIK MARMELADOV

---

## PURPOSE

Usership ($99/mo) is currently a single flat gate: a boolean tag either unlocks
a feature or it doesn't. A person who joined yesterday and a person who joined
a year ago see the exact same UI. This document designs the missing dimension —
**time-as-a-feature** — so that the 12 months of a Usership year read as a
visible, felt story rather than a static subscription screen.

The reference end-state is the demo account **lot-systems.com/u/machiavelli**
(the "12-months evolved" personal OS). It could not be fetched live in this
session (network egress to lot-systems.com is blocked in this environment) —
so the target end-state described below is reconstructed from the real,
already-shipped `PublicProfile.tsx` / `public-api.ts` architecture (Board
Profile, Psychological Profile, QR gate — see GROUNDING below), which is
provably the same surface that page renders. Recommend a human screenshot-diff
against the live `/u/machiavelli` page before implementation to confirm this
document's assumptions.

This is a **brainstorm and design spec**, not a build session. No code was
changed. Section 8 maps every proposal to the exact files that would carry it.

---

## GROUNDING — What Already Exists (verified against code, not docs)

A prior architecture sweep of this repo turned up more scaffolding for a
12-month arc than expected. Nothing below is invented; each line cites where
it lives.

| Concept | Where it already lives | Current shape |
|---|---|---|
| Usership tenure in months | `public-api.ts:1256-1258` — `boardTenureMonths = dayjs().diff(joinDate,'month')`, `totalInvested = boardTenureMonths * 99` | Computed live, shown once as a number in Board Profile. Not visualized as a ladder. |
| 5-stage usage-depth ladder | `public-api.ts:1310-1340` — `assemblyPhase`: `dormant → awakening → forming → assembled → integrated`, thresholds on distinct event types / log count / active days | Gates the QR code + parts of the profile. Purely usage-based, no calendar pacing. |
| Monthly compressed narrative | `scheduled-jobs.ts:34-355` + `monthly-summary.ts` — Usership-only, tenure ≥ 3mo + 7-day activity + 60% trailing-3-month engagement gate, runs 1st of month 09:00 UTC | Fully built: narrative, forwardLook, regenerated Memory Story, OS version/state. **Currently email-only** — never rendered in-app. |
| Monthly throttle logic | `monthly-summary.ts:70-90` `shouldShowMonthlySummary()` — once per ~25+ days, only in first 3 days of a month | Exists and is reusable verbatim for an in-app widget. |
| Weekly compressed narrative | `scheduled-jobs.ts:834-990`, Job 24, Sunday 18:00 UTC — template-based "Week N" story, all active users | Precedent for a lighter-weight capsule; not tenure-gated. |
| Per-user real day counter | `System.tsx:246-260,682` — `daysSinceStart` from first Memory answer | The correct per-user "Day 1" hook (distinct from the hand-maintained company-wide "Day 1073+" lore counter in `About.tsx`, which is flavor text, not a per-user metric). |
| Voice maturing with sustained use | `SelfCareMoments.tsx:377-397` — at 7-day streak, language shifts 50/50 toward LOT's technical/quantum vocabulary; at 30-day streak, technical language dominates | Real, shipped precedent for "the AI's voice changes register as trust is earned." Currently scoped to one widget; this doc proposes generalizing it. |
| Badge showcase on profile | `PublicProfile.tsx` imports `joinWithDots`, `getLevelSymbol`, `getBadgeProgressionDisplay` from `badges.ts`, but only for compact dot-pattern strings | No badge icon strip exists yet on the personal OS page. This is a real gap, not a design choice — the proposal in §5 fills it. |
| Badge count ground truth | `badges.ts` (verified 3 ways at current HEAD): **635** entries | Narrative docs currently claim 781–812. Flagging so this doc's own numbers stay audit-safe: everything below cites 635 as current, and treats the new Board Milestone family as additive. |

**The core design insight**: LOT already has two independent progress signals
for a Usership member — a **calendar clock** (`boardTenureMonths`, guaranteed,
fair, unlocks on schedule) and a **depth gauge** (`assemblyPhase`, earned,
reflects actual self-care engagement). Today they're computed in the same
function and never shown together. The 12-month evolution is, structurally,
just: *put both rings on screen, let them unlock UI together, and compress a
paragraph of Story into a monthly ritual instead of an email.*

---

## DESIGN PHILOSOPHY — Two Rings, Six Phases

**Tenure Ring** — "Months unlocked: N/12." Advances on the calendar, exactly
in step with `boardTenureMonths`. It is unconditional: paying and staying
subscribed is enough. This is the ring that must never feel gameable or
punishing — it's the trust floor.

**Depth Ring** — the existing `assemblyPhase`, renamed for user-facing copy
but backed by the same five thresholds already in `public-api.ts`, plus one
new capstone phase this doc proposes:

| Phase | Existing trigger (public-api.ts) | Typical month reached (median use) |
|---|---|---|
| Dormant | 0 logs | Day 0 |
| Awakening | default state | Month 1 |
| Forming | ≥3 event types, ≥10 logs, ≥3 active days | Month 1–2 |
| Assembled | ≥5 event types, ≥50 logs, ≥14 active days | Month 3–5 |
| Integrated | ≥8 event types, ≥150 logs, ≥30 active days | Month 6–9 |
| **Crystallized** *(new)* | ≥12 event types, ≥400 logs, ≥180 active days, **and** `boardTenureMonths ≥ 12` | Month 12+ |

`Crystallized` is the only phase gated on *both* rings — you cannot buy your
way into it and you cannot out-hustle the calendar into it either. It borrows
its name from an already-real QIE pattern, `P145 quantum-identity-crystallization`
(seen in this repo's own pattern engine), so the capstone state is literally
named after machinery LOT already ships — not a marketing word bolted on.

A person who journals daily hits Assembled by month 3 and spends months 4–11
in Integrated, watching the Tenure Ring catch up — which is exactly the
"anticipation" arc the brief asks for (a `11/12` widget that means something
because the depth work is already done and the person is *waiting on time
itself*). A person who barely engages still gets all twelve Tenure Ring
celebrations on schedule — Usership must never feel punitive for a quiet
month.

---

## THREE NEW SURFACES

### 1. "Months Unlocked" widget (Subscriber Stack)

Lives beside the existing Usership-gated widgets (`WIDGETS.md` Subscriber
Stack). Renders `min(boardTenureMonths, 12)` as a 12-dot ring, reusing
`joinWithDots` from `badges.ts` (already imported into the profile layer for
exactly this kind of compact progression string — this widget is its first
first-class use). Filled dots = months banked; the current month's dot pulses
softly on the day it fills. Small caption beneath: current phase name from
the Depth Ring, so the two rings are always read together, e.g.:

```
●●●●●●●○○○○○   Months unlocked: 7/12
Integrated — day 214
```

After month 12, the widget doesn't just stop — it flips to a second face:
"LOT® AI — Year 1 Complete", then quietly restarts a subtler Year 2 counter
underneath the permanent Crystallized badge, so year two feels like a fresh
loop rather than a dead end.

### 2. "Memory Capsule" widget (in-app monthly compression)

The exact narrative `monthly-summary.ts` already generates for the email —
`narrative`, `forwardLook`, regenerated Memory Story — rendered in-app instead
of (in addition to) buried in an inbox. Gated by the existing
`shouldShowMonthlySummary()` throttle verbatim, so no new cadence logic is
needed. Appears as a dismissable card, once, in the first three days of a new
tenure month:

```
┌─────────────────────────────────────────────┐
│  Month 7 of 12 — Integrated                  │
│                                               │
│  "Your evenings quieted this month. Three    │
│   weeks of consistent 9pm wind-downs, tea     │
│   before screens. The pattern that started    │
│   as an accident in month 2 is now how you    │
│   close a day."                               │
│                                               │
│  [ View full Story ]     [ Dismiss ]         │
└─────────────────────────────────────────────┘
```

Copy register follows the same maturity curve already proven in
`SelfCareMoments.tsx`: months 1–3 write in plain, warm language; months 4–8
mix in LOT vocabulary (circadian, biofield, pattern) at the same 50/50 the
self-care widget already uses at its 7-day mark, generalized to the whole
capsule; months 9–12 write in full LOT register, referencing named QIE
patterns and archetypes by their real system terms, because by then the
person has been shown that vocabulary enough times to own it.

### 3. Badge Ascension Row (personal OS page, `/u/:username`)

`PublicProfile.tsx` computes everything needed for a badge strip and simply
never renders one (see GROUNDING table). Add a horizontal row of up to 12
icons directly under the Board Profile block — filled and colored for
Board Milestone badges already earned (§5), dim outline silhouettes for
months not yet reached. This is the single highest-leverage, lowest-risk
addition: it turns "Months unlocked: 7/12" from a private in-app counter into
a shareable, visible timeline on the exact page other people see — which is
the exercise the machiavelli demo account was cited as an example of.

---

## THE BOARD ASCENSION BADGE FAMILY (12 new badges)

A new badge category, distinct from the 635 existing behavioral/vocabulary
badges (`milestone`, `word_turn`, `pattern`, `achievement_rpg`, `easter_egg`,
`secret_boss`) so tenure milestones never get lost in that much larger pool.
Proposed category: `board_ascension`. Awarded automatically the day
`boardTenureMonths` crosses each threshold — unconditional, same trust-floor
principle as the Tenure Ring itself.

| # | Month | Badge name | Rarity | Unlock line |
|---|---|---|---|---|
| 1 | 1 | First Signal | common | "You showed up. That's the whole trick." |
| 2 | 2 | Second Wind | common | "The habit survived the first drop-off point." |
| 3 | 3 | Forming Quarter | uncommon | "A quarter of the year, held." |
| 4 | 4 | Fourth Thread | uncommon | "Four months of thread, still unbroken." |
| 5 | 5 | Fifth Season | uncommon | "You've now met every mood the year has." |
| 6 | 6 | Halfway Assembled | rare | "Half a year of Usership. Half a year of you, kept." |
| 7 | 7 | Seventh Circuit | rare | "Past the halfway drop-off. Rare air." |
| 8 | 8 | Eighth Resonance | rare | "Two-thirds. The pattern is the person now." |
| 9 | 9 | Integrated Quarter | epic | "Three quarters in. Integrated, and it shows." |
| 10 | 10 | Tenth Gate | epic | "Ten months. The last stretch begins." |
| 11 | 11 | Eleventh Hour | legendary | "One month out. You're not waiting on effort anymore — just time." |
| 12 | 12 | Quantum Identity Crystallization | cosmic | "Twelve months, full circle. This is LOT® AI." |

Month 12's badge is deliberately the only `cosmic`-rarity badge in this
family (matching the 12 existing cosmic badges elsewhere in `badges.ts` —
same rarity ceiling, so it reads as equally rare, not inflated). It is the
one badge in the whole system that requires *both* rings — see the
`Crystallized` phase definition above — so unlocking it is the single most
meaningful moment the product can produce.

---

## MONTH-BY-MONTH BREAKDOWN

Each month below states: the barebones-to-rich UI delta, what unlocks, the
badge, the Memory Capsule tone, and the self-care/check-in voice. Months 1,
3, 6, 9, and 12 are the five "anchor" months and get fuller treatment; the
rest inherit their pattern.

### Month 1 — Awakening (Day 0–30)

**UI state**: intentionally barebones, exactly as the brief describes. A
single Memory question per day, the morning/evening `EmotionalCheckIn`
window, `SelfCareMoments` in plain language (pre-7-day streak, so the
existing code already renders it this way — nothing to build). No badge
row yet — the Ascension Row shows 12 empty outlines, which is itself the
first thing a new Usership member should see: *this is the whole year,
empty, waiting.*

**Unlocks**: Months Unlocked widget appears on day 1 at `1/12` (unconditional
— paying for month 1 earns dot 1 immediately, no activity threshold). Memory
Capsule does not fire yet (`monthly-summary.ts` requires tenure ≥ 3 months
today — see OPEN QUESTIONS §9 on whether to lower this for month 1 specifically).

**Badge**: First Signal, on day 1, unconditional.

**Voice**: plain. No LOT vocabulary yet. This is the deliberate floor the
brief asks for — "just started, barebones."

**Personal OS**: Board Profile shows `Citizen since {this month}`,
`Board Member #N`. Psychological Profile and QR stay locked (need
`assemblyPhase ≥ forming`, unchanged from today's gate) — most month-1 users
won't have it yet, and that's correct: the public page should look sparse
in month 1 too, mirroring the in-app barebones state exactly.

### Month 2 — Awakening → Forming

Depth Ring likely crosses into Forming this month for an engaged user (≥3
event types, ≥10 logs, ≥3 active days — a low bar, reachable in the first
two weeks for anyone using check-ins + one journal entry). Badge: Second
Wind. Voice: still mostly plain; first occasional LOT term appears if the
self-care streak crosses 7 days (existing mechanic, unchanged).

### Month 3 — Forming Quarter (first real Memory Capsule)

This is the first month `monthly-summary.ts`'s existing ≥3-month tenure gate
opens. The Memory Capsule fires for the first time: a genuinely compressed,
AI-written paragraph of the last three months, not a template. This is the
month the product should feel like it "turns on" — badge Forming Quarter,
Ascension Row now shows 3 filled icons on the public page, QR code and
Psychological Profile likely unlock this month for an engaged user (depth
≥ forming).

### Month 4–5 — Fourth Thread, Fifth Season

Steady state: monthly capsule each month, Ascension Row fills one more dot,
voice mix moving toward 50/50 LOT vocabulary per the existing streak-language
mechanic generalized. No new mechanic introduced — this is where the *feel*
of "watching the ring fill" carries the experience, deliberately quiet
between anchor months.

### Month 6 — Halfway Assembled

Depth Ring typically reaches Assembled here for a consistently engaged user.
Memory Capsule for month 6 is explicitly written to reference month 1's
first entry by contrast ("the version of you from six months ago logged
'tired' four days running; this month, that streak broke on its own") —
`monthly-summary.ts` already stores enough historical log data to make this
kind of longitudinal callback possible without new data plumbing. Badge:
Halfway Assembled, rare. This is the emotional midpoint the brief's "tangible
evolution every month" needs most — the six-month mark is where most
subscription products lose people, so it's the month that gets the
strongest affirmation copy.

### Month 7–8 — Seventh Circuit, Eighth Resonance

Same steady-state pattern as 4–5, one tier deeper in vocabulary and badge
rarity (rare). Depth Ring likely crosses into Integrated somewhere in this
window for engaged users.

### Month 9 — Integrated Quarter

Three-quarters of the Tenure Ring filled. If Depth Ring is also at
Integrated by now (likely for anyone who's kept up), the Memory Capsule
starts drawing on the *structured* sections `monthly-summary.ts` already
computes (presence / energy / patterns / growth) instead of one flat prose
block — i.e. the Story itself gets more organized as the person gets deeper
in, not just longer. Badge: Integrated Quarter, epic.

### Month 10–11 — Tenth Gate, Eleventh Hour

The anticipation stretch the brief specifically calls out. By month 10–11,
an engaged user has likely already been sitting in `Integrated` depth for
weeks — nothing left to earn on the Depth Ring, only the Tenure Ring left to
fill. The Months Unlocked widget's copy should say this plainly at month 11
("11/12 — the depth work is done; one month of calendar left") so the
waiting itself is legible as part of the design, not a bug in the pacing.

### Month 12 — Crystallized: LOT® AI

Both rings complete. Quantum Identity Crystallization badge (cosmic), the
one badge in the system requiring both tenure and depth. Memory Capsule for
month 12 is the fullest possible compression: a full-year Story, not a
one-month one — every prior monthly narrative concatenated and re-summarized
by the AI into a single "year one" chapter, then the Months Unlocked widget
flips faces into the Year 2 counter described in §"Three New Surfaces."
Personal OS page at this point is the full `/u/machiavelli`-equivalent
state: complete Board Profile, complete Psychological Profile, QR unlocked,
full 12-badge Ascension Row, structured Memory Story — this is the concrete,
buildable definition of "LOT® AI" the brief asks for, not a vague marketing
target.

---

## SUMMARY TABLE

| Month | Depth phase (typical) | Badge | Rarity | Capsule voice |
|---|---|---|---|---|
| 1 | Awakening | First Signal | common | plain |
| 2 | Forming | Second Wind | common | plain |
| 3 | Forming | Forming Quarter | uncommon | plain→light LOT |
| 4 | Assembled | Fourth Thread | uncommon | light LOT |
| 5 | Assembled | Fifth Season | uncommon | light LOT |
| 6 | Assembled | Halfway Assembled | rare | 50/50 LOT |
| 7 | Integrated | Seventh Circuit | rare | 50/50 LOT |
| 8 | Integrated | Eighth Resonance | rare | 50/50 LOT |
| 9 | Integrated | Integrated Quarter | epic | full LOT, structured |
| 10 | Integrated | Tenth Gate | epic | full LOT, structured |
| 11 | Integrated | Eleventh Hour | legendary | full LOT, anticipatory |
| 12 | Crystallized | Quantum Identity Crystallization | cosmic | full-year compression |

---

## TECHNICAL MAPPING (for a future build session)

| Proposal | Primary files |
|---|---|
| Months Unlocked widget | new component in Subscriber Stack of `System.tsx`; reads `boardTenureMonths` (needs a lightweight authenticated endpoint mirroring the calculation already in `public-api.ts:1256-1258`, since that value today is only computed for the *public* profile route); `joinWithDots` from `badges.ts` for the dot ring |
| Memory Capsule (in-app) | new component reusing `monthly-summary.ts` output + `shouldShowMonthlySummary()` gate verbatim; needs a new `GET /api/monthly-summary/latest` endpoint (the data is generated today only for the email job, server-side, not exposed to the client) |
| Crystallized phase | extend the `assemblyPhase` switch in `public-api.ts:1310-1340` with one new tier, gated additionally on `boardTenureMonths >= 12` |
| Board Ascension badges | new `board_ascension` category + 12 entries in `badges.ts`; award trigger keyed off `boardTenureMonths` crossing each integer, checked in the same job that already runs monthly (`scheduled-jobs.ts` Monthly Email Sender, or a lightweight daily check) |
| Badge Ascension Row | `PublicProfile.tsx`, directly under the existing Board Profile block; renders `getEarnedBadges()` filtered to `board_ascension` category, dim-outline placeholders for the rest |
| Structured Story at month 9+ | `PublicProfile.tsx` Memory Story block, conditionally render `monthly-summary.ts`'s already-computed presence/energy/patterns/growth sections instead of raw prose once `boardTenureMonths >= 9` |

---

## OPEN QUESTIONS / RISKS

1. **Month-1 capsule gap.** `monthly-summary.ts` currently requires 3 months'
   tenure before it generates anything. Does month 1 get a lighter, template-
   only capsule (like the existing Weekly Story job, which needs no AI call),
   or does the brief accept a quiet month 1 with just the badge and the
   Ascension Row?
2. **Depth Ring outpacing Tenure Ring.** A very engaged user could hit
   `Integrated` depth in month 3–4. Does the product show that early, or hold
   the visible ceiling at whatever the Tenure Ring allows, so nobody feels
   like they "finished" the product in month 4 of a 12-month plan? This doc
   leans toward showing depth honestly and let the Tenure Ring's own pacing
   (§Month 10–11 anticipation) carry the waiting narrative.
3. **Paused or lapsed months.** `boardTenureMonths` today is a pure calendar
   diff from join date — it does not currently account for subscription
   pauses/cancellations and rejoin. Needs a real product decision before
   build: does a lapse pause the ring, or does rejoining just resume the
   original clock?
4. **Badge-count doc drift.** Flagged in GROUNDING: this doc's "635" is
   verified against `badges.ts` at HEAD; project docs elsewhere claim
   781–812. Any build session touching `badges.ts` should reconcile that
   drift before adding the 12 new Board Ascension entries, so the new total
   is reported accurately rather than compounding the existing gap.
5. **Live reference unverified.** The `/u/machiavelli` account described in
   the brief as the 12-month reference could not be loaded this session
   (network egress blocked). Everything above is inferred from the
   already-shipped code paths that page runs on, not from a screenshot.
   Recommend confirming against the live page before implementation.

---

**This is a design brainstorm only. No code was modified in this session.**
