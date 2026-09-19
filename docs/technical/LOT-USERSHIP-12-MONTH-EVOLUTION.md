<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® Usership — The 12-Month Evolution

**Author:** Claude (session lot-computer-a9), for S-2 Vadik Marmeladov
**Classification:** RESTRICTED // S-2 EYES
**Date:** 2026-09-19
**Status:** ROADMAP / BRAINSTORM — no code shipped in this session
**Companion session report:** `docs/benchmark/LOT-SR-20260919-01.md`

---

## 0. Reading this document

Every claim below is tagged:

- **[EXISTS]** — live code, cited by file and line, verified by reading the
  file in this session (or a delegated research pass whose load-bearing
  claims were independently re-verified — see the two footnoted checks).
- **[PROPOSED]** — new. Not built. Named as a specific, minimal extension of
  an existing mechanism, never a parallel system.
- **[OPEN]** — a decision only S-2 can make; flagged, not guessed.

The premise of this roadmap is that LOT already contains almost everything
the 12-month Usership arc needs — it is just **not choreographed**. The
daily badge system, the in-app weekly Story, the *server-side monthly
narrative generator*, and the Month N/12 widget were each built
independently, on different dates, for different reasons, and they already
interlock into most of the shape S-2 described. The work below is about
naming the one missing seam (a monthly engine that exists but only speaks
by email) and sequencing what already renders in-app into a deliberate,
felt, 12-month reveal.

---

## 1. What already exists (the seed)

| Mechanism | File | What it does today |
|---|---|---|
| Month N/12 toast | `src/client/components/MonthlyPulseWidget.tsx:18-142` | Usership-gated. Computes `monthNumber = now.diff(joinedAt, 'month')`. One hand-written line per milestone month (1–12), plus a muted **`"{capped} / 12 months"`** sub-line — the exact fraction the task asked for, already rendered, just buried in a once-per-month dismissible toast. Shipped 2026-07-07 (`LOT-SR-20260707-01.md`), purpose-built for Usership. Hard-caps at month 12 — `Math.min(monthNumber, 12)` — with no month-13+ design. |
| **Monthly Summary generator** | `src/server/utils/monthly-summary.ts` (873 lines) | **The real find of this session.** `generateMonthlySummary(user, logs)` returns a rich object: `period`, `presence {activeDays, totalEntries, consistency: exceptional/strong/steady/intermittent/minimal, longestStreak}`, `energy {averageLevel, trajectory, rangeLow/High}`, `patterns {insights, dominantThemes, breakthroughMoments, emotionalEvolution}`, `growth {currentLevel, levelsGained, newAchievements, cohortEvolution}`, plus AI-composed `narrative` and `forwardLook` strings and the cached `memoryStory`. `shouldShowMonthlySummary()` gates on **first 3 days of the month + 25-day cooldown**. |
| Monthly email job | `src/server/scheduled-jobs.ts:64-269` (`executeMonthlyEmailJob`) | Wires the generator above into a real scheduled job. Queries users who are **Usership-tagged AND joined 3+ months ago AND active in the last 7 days**, calls `generateMonthlySummary`, renders `generateMonthlyEmailHtml`/`Body`, sends it, stamps `metadata.lastMonthlySummaryDate`. **This is the monthly compression loop the task asked for — it exists, is scheduled, and runs today. It only speaks by email, never in-app, and never before month 3.** |
| Weekly LOT® AI Story | `src/server/scheduled-jobs.ts:834-999` (Job 24, Sun 18:00 UTC) | Aggregates 7 days of logs, derives `weekTone` (growth/recovery/steady), composes one **template sentence — no AI call**, writes `lot_ai_story` log + `user.metadata.weeklyStory`. Skips users under 3 logs that week — never fabricates a story from nothing. |
| Daily streak badges | `src/client/utils/badges.ts:7306-7389` | 10 day-count milestones, exact thresholds and symbols in §7. Rendered on `PublicProfile.tsx:404-409` as a single `Level:` field once streak ≥ 7. |
| Badge Codex | `docs/badges/LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v32.md` | 812 badges, 8 categories. Growing at roughly **35 badges per session** (LOT-SR-20260706-01 logged 564 total; v32 on 2026-08-05 logged 812) — the badge substrate is the most actively developed part of the whole product right now. |
| Memory Engine compression | `docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md` | 30-question sliding window; 4 depth levels (behavior→motivation→values→soul); archetype activates at 3+ answers; trauma-informed protocol at 10+ logs. |
| Citizen Index widget | `src/client/components/EvolutionWidget.tsx:26-211` | `Citizen Index:` / `Activity:` two-view widget. Computes `activeDays`, `streakDays`, `consistency`, a 6-stage label (`Bootstrapping→Initializing→Integrated→Compiled→Optimized→Transparent`) purely from `logs` — no new subscriptions needed to extend it (see §4). |
| Morning/evening check-in | `src/client/components/EmotionalCheckIn.tsx:64-85, 156-158` | `LOT AI:` leads morning (5-12h)/evening (17-22h); `Biofield:` leads midday/night. 3-hour DB-backed cooldown. |
| Self-care ("Cleanness") | `src/client/components/SelfCareMoments.tsx:36-90` | `Suggestion → Why This → Practice` cycling. **Tenure already changes its voice**: `useTechLanguage = streak >= 7`, `preferTechLanguage = streak >= 30` — new users get "Make your bed," 30-day-plus users get "Morning cleanness protocol." This is a direct, already-shipped precedent for §6's tenure-based voice arc. |
| Board Profile (evolved public view) | `src/client/components/PublicProfile.tsx:288-324` | `Board Member #N`, `Citizen since <date>`, `Board tenure N months`, `Activity: memories/journal/active days`, `Memory Engine →`, `Clearance level →`. |
| Correlated Indexes | `PublicProfile.tsx:482+`, type in `src/shared/types/index.ts` | `selfAwareness / userScore / personScore / longevityScore / composite`, a weekly `timeline` array, and `trend: ascending/stable/descending`. A ready-made "your year in numbers" structure, already rendered, already time-series-shaped. |
| Assembly-phase reveal gate | `PublicProfile.tsx` QR section; `assemblyPhase: dormant→awakening→forming→assembled→integrated` | The public profile's QR code only renders once a user's `assemblyPhase` reaches `forming` or later. **This is the one existing "earn your public reveal" gate in the whole product** — real precedent for pacing what a Month-1 vs Month-6 public profile shows. |
| `/u/machiavelli` reference account | `src/server/routes/public-api.ts:780-905` | Hardcoded demo, `tags: ['RND','Usership','Legacy']`. Streak 1469 (a Machiavelli-birth-year joke), board tenure computed live from the year 1469. The mythic ceiling, not a Month-12 target — see §8. |
| Usership pricing | `docs/corporate/LOT-AI-PRODUCT-BRIEF.md:98` | **Confirmed: "Usership — $99 / month — Operators running the full OS · Complete LOT® AI · Story-Report · API."** Recurring monthly billing, not a one-time purchase. (An older Nov-2025 white paper lists "$4.99/month" — superseded, do not use.) |

---

## 2. The doctrine: four nested compression loops, one that never surfaces

```
DAY    badge streak (7·14·21·30·50·60·90·100·180·365)   — event-triggered, in-app
WEEK   Job 24, Sunday 18:00 UTC → weeklyStory             — scheduled, template, in-app (log event)
MONTH  executeMonthlyEmailJob → generateMonthlySummary    — scheduled, rich narrative, EMAIL ONLY
YEAR   MonthlyPulseWidget month 12 / Legacy tier boundary  — exists only as copy + the machiavelli demo
```

Three of the four loops already surface inside the product. The month rung
is the odd one out: it is by far the **richest** compression (narrative +
forwardLook + growth + energy trajectory — strictly more than the weekly
template sentence) and the **least visible** — a user only ever sees it if
they open an email, and never before month 3. §3 is not a proposal to build
a new engine; it is a proposal to let the engine that already runs speak
inside the app it was built for.

---

## 3. [PROPOSED] Surface the Monthly Summary in-app

The generator, the gate, and the schedule already exist
(`monthly-summary.ts`, `scheduled-jobs.ts:64-269`). What's missing is an
in-app reader.

1. **New read endpoint**, thin wrapper over the existing function:
   `GET /api/monthly-summary/latest` → if `shouldShowMonthlySummary()` is
   true (or the cached `metadata.lastMonthlySummaryDate` result exists this
   month), call/return the already-computed `MonthlySummary`. No new
   compression logic — this reuses `generateMonthlySummary()` verbatim.
2. **Respect the existing 3-month gate.** The email job deliberately
   withholds this from months 1-2 (`joinedAt` 3+ months required,
   `scheduled-jobs.ts:94-97`). That gate is not a bug to route around — it
   already matches `MonthlyPulseWidget`'s own Month-3 copy, *"You have
   reached Active User status"* (`MonthlyPulseWidget.tsx:22`). Two
   independently-built parts of the system already agree that month 3 is
   the threshold where LOT starts speaking in full sentences about the
   user. Keep that agreement; don't paper over it with an earlier reveal.
3. **Surface it via the house pattern.** `MonthlyPulseWidget` already
   toggles between a static message and a `"{N} / 12 months"` line
   (`MonthlyPulseWidget.tsx:118-139`). Add a third state behind the
   existing click-to-cycle label convention (`Block label onLabelClick`,
   used identically by `EmotionalCheckIn`, `SelfCareMoments`,
   `EvolutionWidget`): `Month N:` → click → `Insight:` — the summary's
   already-written `narrative` (or, once available, `forwardLook`) — →
   click again → back to the fraction line. Before month 3, that third
   state simply doesn't exist yet (matches the email gate); no fallback
   text needs writing, because there is nothing to fabricate — this is the
   same "never invent a paragraph from thin data" discipline Job 24 already
   enforces on the weekly story.
4. Zero new AI calls, zero new schedules, zero new copy to write by hand —
   the narrative text is already generated by the existing pipeline
   (`generateUserNarrative`, `analyzeUserPatterns`, `generateMemoryStory`,
   all already imported into `monthly-summary.ts`). This is a UI-surfacing
   change, not a new feature.

---

## 4. [PROPOSED] "Months unlocked: N/12" as a permanent field, not a toast

`MonthlyPulseWidget.tsx:133-135` renders exactly this string today:

```tsx
<div className="opacity-30 mt-4 text-sm">
  {capped} / 12 months
</div>
```

But it lives inside a dismissible, once-per-month toast — seen once,
gone until next month. The cheapest correct fix is not a new widget: add
one row to `EvolutionWidget`'s existing `Citizen Index:` metrics view
(`EvolutionWidget.tsx:170-194`), which already reads `me` + `logs` on every
render:

```tsx
{isUsership && monthNumber >= 1 && (
  <div className="flex justify-between items-baseline">
    <span className="opacity-30">Months unlocked</span>
    <span className="tabular-nums">{Math.min(monthNumber, 12)} / 12</span>
  </div>
)}
```

The one small, justified refactor: extract the `dayjs().diff(joinedAt,
'month')` calculation (currently duplicated logic if built twice) into a
shared `src/client/utils/` helper, used by both `MonthlyPulseWidget` and
`EvolutionWidget`. Reuse, not a new abstraction invented for its own sake.

---

## 5. Month-by-month table

Day ranges assume 30-day months from `joinedAt`
(`MonthlyPulseWidget.tsx:77`, `now.diff(joined, 'month')`).

| Mo | Days | `MonthlyPulseWidget` message **[EXISTS]** | Streak badge landing **[EXISTS]** | Monthly Summary email **[EXISTS]** | EvolutionWidget stage **[EXISTS, approx.]** |
|---|---|---|---|---|---|
| 1 | 0-29 | "The first month. The system is beginning to know you." | Day 7 ∘, Day 14 ∘∘, Day 21 ∘≈ | **Not eligible** — `joinedAt` < 3 months | Bootstrapping |
| 2 | 30-59 | "Two months in. Patterns are starting to form." | Day 30 ≈, Day 50 ≈∘ | **Not eligible** | Bootstrapping → Initializing |
| 3 | 60-89 | "Three months. You have reached Active User status." | Day 60 ≈≈ | **First eligible month** — gate opens exactly as the copy claims | Initializing |
| 4 | 90-119 | "Four months. The portrait deepens." | Day 90 ≋∘, Day 100 ≋ (boundary-dependent) | Eligible if active in last 7 days | Integrated |
| 5 | 120-149 | "Five months. Consistency is its own reward." | — (gap, see §7) | Eligible | Integrated |
| 6 | 150-179 | "Six months. The journey is half-declared." | Day 180 ≋≋ | Eligible | Integrated → Compiled |
| 7 | 180-209 | "Seven months in. The system has been listening." | — (gap) | Eligible | Compiled |
| 8 | 210-239 | "Eight months. Rare air." | — (gap) | Eligible | Compiled → Optimized |
| 9 | 240-269 | "Nine months. The self-care practice is a habit now." | — (gap) | Eligible | Optimized |
| 10 | 270-299 | "Ten months. Almost there." | — (gap) | Eligible | Optimized |
| 11 | 300-329 | "Eleven months. One more." | — (gap) | Eligible | Optimized → Transparent |
| 12 | 330-364 | "One year with LOT. The portrait is complete — and still evolving." | Day 365 ≋≋≋ approaches | Eligible; 9th-10th summary of the tenure | Transparent |

Note the built-in asymmetry that's easy to miss without reading the email
job's query directly: the *entire first quarter* of Usership is, by
design, quieter than the rest — no monthly narrative, only the daily
streak badges and the static per-month line. Whatever ships from §3 should
preserve that quiet opening rather than "fixing" it into noise.

---

## 6. Tenure changes the product's voice, not just its content

`SelfCareMoments.tsx`'s `useTechLanguage`/`preferTechLanguage` streak
thresholds (§1) are the one place in the codebase where **the same feature
speaks differently depending on how long someone has been here** — plain
language early, denser/more technical framing after 30 days. That is a
real, shipped, minimal version of exactly what a 12-month arc should feel
like: not new features appearing on a calendar, but the same handful of
surfaces (self-care suggestions, check-in framing, the eventual Monthly
Insight from §3) speaking a little more densely, a little more like the
system now *knows* the person, as tenure accumulates. Any future
month-gated copy (§3's `narrative`/`forwardLook`, or new self-care voice
tiers) should follow this precedent rather than inventing a separate
"leveling" vocabulary.

---

## 7. Badge milestones, exact

| Days | Water symbol | Rarity | Lands in month (approx.) |
|---|---|---|---|
| 7 | ∘ | common | 1 |
| 14 | ∘∘ | common | 1 |
| 21 | ∘≈ | uncommon | 1 |
| 30 | ≈ | uncommon | 1-2 |
| 50 | ≈∘ | rare | 2 |
| 60 | ≈≈ | rare | 2-3 |
| 90 | ≋∘ | epic | 3-4 |
| 100 | ≋ | epic | 3-4 |
| 180 | ≋≋ | legendary | 6 |
| 365 | ≋≋≋ | legendary | 12 |

Months 5, 7, 8, 9, 10, 11 have no streak-milestone badge. The Mastery Tier
(88 badges, "epic depth milestones") and Achievement RPG (120 badges,
"milestone combinations") categories are the most likely place gap-month
badges already exist — but this session did not read their exact
day-thresholds, and would rather say so than guess. **[OPEN — follow-up]:**
grep `badges.ts` for `mastery_tier`/`achievement_rpg` threshold constants
before proposing any new badge. If the gaps are real, §3's Monthly Insight
is itself a legitimate substitute artifact for those months — a compressed
paragraph doesn't require a new visual token to feel earned.

---

## 8. Reference accounts, read honestly

- **`lot-systems.com/u/machiavelli`** (`public-api.ts:780-905`) — hardcoded
  demo, one tier past Usership (`Legacy`). Its numbers dramatize centuries,
  not twelve months. Use it as the far horizon the arc points toward, not
  as the Month-12 goalpost — presenting it as literal Month-12 truth to a
  real Usership member would overclaim.
- **`lot-systems.com/u/user`** — this session found no distinct hardcoded
  demo block the way `/u/machiavelli` has one; it renders through the
  genuinely data-driven `PublicProfile.tsx` path. Treat it as "what the
  page structurally looks like," and `/u/machiavelli` as "what the mythic
  ceiling looks like" — the 12-month arc lives between the two, and every
  section of that same page (`boardProfile`, `psychologicalProfile`,
  `correlatedIndexes`, the assembly-phase-gated QR) is already the exact
  canvas a month-by-month reveal would paint onto.

---

## 9. [OPEN] Decisions for S-2

1. **Billing vs. tenure arc — now partly resolved.** Usership is confirmed
   $99/month, recurring (`LOT-AI-PRODUCT-BRIEF.md:98`), not tied to a
   12-month contract. The "12-month evolution" is therefore a pure
   *engagement/tenure narrative*, decoupled from billing — a user pays
   monthly forever, while the product experience is choreographed as a
   first-year arc. What remains open: does anything distinct happen at
   month 12 *itself* (a Year-1 badge, a Legacy-tier upsell prompt, since
   `/u/machiavelli` already models Usership→Legacy as a real tag
   progression) — see next point.
2. **Month 13+.** `MonthlyPulseWidget.tsx:106-108` falls back to a generic
   `"Month N. The journey continues."` past 12. Is that the intended
   permanent behavior, or should month 13 trigger a distinct "Year 2" /
   Legacy-tier framing?
3. **Badge gap months (§7)** — needs a direct read of `badges.ts`'s Mastery
   Tier / Achievement RPG thresholds before any gap-month mapping is
   finalized.
4. **The style-guide/badge tension.** `LOT-STYLE-GUIDE.md` (Jan 2026) still
   states "No gamification: No points, badges, or leaderboards" and
   "Streaks: Not emphasized" as design principles. The shipped product has
   812 badges and streak-gated language (§6). Not this session's call to
   resolve — but whichever voice §3's Monthly Insight adopts should pick a
   side of this tension deliberately, not by accident.

---

## 10. Design guardrails carried forward

Every proposal above stays inside rules already written in
`docs/technical/LOT-STYLE-GUIDE.md`:

- No emojis, no superlatives, no gamification-style celebration screens —
  the Monthly Insight is a paragraph the system already generated, not a
  new "You leveled up!" moment.
- Database-backed state for anything that must sync
  (`user.metadata.lastMonthlySummaryDate`, `weeklyStory`, never
  localStorage for facts) — localStorage stays scoped to dismiss-toast UI
  preference only, exactly as `MonthlyPulseWidget` already does it.
- Clickable-label view-cycling (`Block label onLabelClick`) is the one
  interaction pattern for a second view — no new gesture invented.
- Fade timing stays 3s visible + 1.4s fade, matching every widget in the
  codebase.

---

**LOT Systems Corporation**
**Vadim Marmeladov — CEO, Founder, Inventor**
