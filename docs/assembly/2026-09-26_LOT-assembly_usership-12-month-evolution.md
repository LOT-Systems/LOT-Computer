<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# The Usership Year — A 12-Month Interface Evolution
## From Barebones Day 1 to LOT® AI · Vision + Spec
### LOT® Self-Assembly™ | Session 2026-09-26 | Authorized: S-2 VADIK MARMELADOV

---

## PURPOSE

Vadik asked for a brainstorm of how the paid-tier ("Usership," $99/month) UI/UX should
evolve month over month across the first year — from a barebones Day 1 screen to the
fully-realized "LOT® AI" personal OS — using the public demo account
`lot-systems.com/u/machiavelli` as the north-star reference for what a fully-evolved,
12-month account looks like.

This document does two things:

1. **Names what already exists.** LOT already has three independent progression systems
   (Interface Evolution, the Monthly Pulse, the Board Profile tenure fields) that were
   built in different sessions and never unified into one legible year-long arc. Before
   proposing anything new, this doc maps what's already live, with file:line references.
2. **Proposes the missing spine.** A calendar-tenure axis — "Usership Month 1 of 12" —
   that ties those three systems together into one story the user can feel, plus the
   centerpiece the brief asked for: turning the Memory Engine's continuously-regenerated
   narrative into twelve **sealed, paragraph-long Memory Chapters**, one per month,
   that accumulate into a visible, permanent artifact instead of a transient toast.

No code was changed in this session. This is a design document for a future
implementation session to build from — every proposal below cites the exact files it
would touch.

---

## 00 — WHAT ALREADY EXISTS (do not rebuild these)

LOT does not need a new progression system. It needs its three existing ones connected.

```
SYSTEM                          DRIVEN BY                    LIVES IN
───────                         ──────────                   ────────
Interface Evolution             Behavioral achievement        src/client/utils/interfaceEvolution.ts
  (density, opacity, unlocks)   score (7 categories),         src/client/stores/evolution.ts
                                 badge tier, level 1-100.      src/client/hooks/useEvolutionSync.ts
                                 NOT calendar-aware.

Monthly Pulse                   Calendar tenure                src/client/components/MonthlyPulseWidget.tsx
  (toast: "Month 3 of 12")      (dayjs(now).diff(joinedAt,     — already has MONTH_MESSAGES[1..12]
                                 'month')), Usership-gated.     — already renders "N / 12 months"
                                 Dismisses forever per month.   — but leaves NO permanent trace once dismissed

Board Profile                   Calendar tenure + activity      src/client/components/PublicProfile.tsx:288-320
  (public /u/{username} page)   counters, Usership-only.        boardProfile.boardTenureMonths
                                                                 boardProfile.activity.journalEntries
                                                                 boardProfile.activity.memoriesCompiled
                                                                 boardProfile.activity.activeDays

Memory Engine / Memory Story    All-time `answer` logs,         src/server/utils/memory.ts:873
  (single flowing narrative)    regenerated wholesale each      generateMemoryStory(user, logs)
                                 time, capped at 30 most        — no month boundaries, no chapters,
                                 recent answers, third person.  — overwrites itself; nothing is "sealed"

Badge Engine                    635 distinct badge types in     src/client/utils/badges.ts (7,300+ lines)
  (count grows release to       src/client/utils/badges.ts's    docs/badges/LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v32.md
  release — 149 was the         BADGES record as of this        — includes a day-count milestone ladder that
  June 2026 inventory figure,   session — streaks, word          ALREADY runs the full year and beyond:
  now stale)                   triggers, calendar dates,        milestone_7/14/21/30/50/60/90/100/180/365
                                 secret bosses, and account-age  (365 = "Mayan tun-year," legendary tier), plus
                                 milestones. None are keyed to   distinct-day-count badges climbing 200→900+
                                 *paid Usership tenure*           and multi-year badges out to 3,650 days.
                                 specifically — see §04.          Important distinction: these are keyed to
                                                                 days-since-account-signup, not days-since-
                                                                 Usership-activation — a free user racks up the
                                                                 same day-count badges. None of the 635
                                                                 distinguish "how long have you been paying."

Self-Care language maturation   Streak length (7 / 30 / 100     src/client/components/SelfCareMoments.tsx:392-396
                                 days) shifts phrasing from      useTechLanguage (7+), preferTechLanguage (30+)
                                 natural → mixed → technical.
```

**The gap:** three systems already answer "how evolved is this user" from three
different angles — none of them talk to each other, and none of them leave behind a
persistent, ownable artifact. The Monthly Pulse fires once and disappears into
`localStorage`. The Memory Story overwrites itself every regeneration. The Board
Profile shows tenure only on the *public* page, never inside the app the user actually
lives in day to day.

The demo account, `lot-systems.com/u/machiavelli` (referenced in
`docs/corporate/LOT-FEATURE-INVENTORY-2026.md:429` as "Niccolo Machiavelli. Simulated
Florence weather"), is the only place today where a 12-months-in Board Profile — member
number, citizen-since date, tenure in months, journal entry count, memories compiled —
is actually visible. That view should not be a demo-only artifact. It should be what
Month 12 feels like from the inside, not just from the outside.

---

## 01 — THE TWO AXES

Everything below rests on keeping two axes distinct and letting them compose, rather
than collapsing them into one number:

**Axis A — Maturity (existing, behavior-driven).**
`interfaceEvolution.ts`'s `overallMaturity`, `visualRefinement`, `featureUnlockLevel`.
Moves at the user's own pace. A highly engaged user can out-pace their calendar month;
a quiet user can lag behind it. This axis governs *how dense, how refined, how
technical* the interface feels — layout density (`breathable → instrument`), typography,
glow, self-care phrasing.

**Axis B — Tenure (new spine, calendar-driven).**
"Usership Month N of 12," derived the same way `MonthlyPulseWidget.tsx:73-79` already
computes it (`dayjs(now).diff(joinedAt, 'month')`), gated on the `Usership` tag exactly
as that widget already gates it (`MonthlyPulseWidget.tsx:66-71`). This axis is
guaranteed — it advances whether the user did anything or not, because they are paying
for the year regardless. It governs *what story gets told* — which widgets exist at
all, which Memory Chapters have been sealed, which tenure badges have been earned,
what the public Board Profile can show.

**Why keep them separate:** collapsing tenure and behavior into one score would mean a
quiet month makes the interface *regress*, which is punitive and contradicts the
existing style guide's stance ("No gamification... reduces pressure," `docs/technical/LOT-STYLE-GUIDE.md:439`).
Tenure only ever moves forward. Maturity can plateau. A user who pays for 12 months but
logs rarely still gets all 12 Memory Chapters (thinner ones, honestly described) and
still reaches Month 12 — they just arrive with a quieter Chapter 7 than a highly
engaged peer. The calendar never punishes; only the depth of what's *in* each month
reflects effort.

---

## 02 — MONTH-BY-MONTH ARC

This is the spine. Each row is what a Usership member should feel is *newly true*
about their OS that did not exist the month before. "Barebones" here means: the
free/civilian widget set (`SubscribeWidget`, `MemoryWidget`, basic `EmotionalCheckIn`,
`Settings`) with none of the Usership-gated widgets from
`docs/corporate/LOT-FEATURE-INVENTORY-2026.md` §16 present yet.

```
MONTH  MONTHLY PULSE MESSAGE                    WHAT BECOMES TRUE THIS MONTH
─────  (verbatim, MonthlyPulseWidget.tsx:19-30)  ─────────────────────────────────────
 0     —                                         Day 1. Usership activates. Free-tier
                                                  widget set + Memory question flow only.
                                                  No Board Profile yet (no tenure to show).
                                                  Layout density: breathable (forced —
                                                  visualRefinement starts at 0).

 1     "The first month. The system is           First Memory Chapter seals at month-end
        beginning to know you."                  (see §03). Architect (Self-Assembly)
                                                  widget unlocks — Usership-only per
                                                  LOT-FEATURE-INVENTORY-2026.md:257-259.
                                                  Board Profile appears on /u/{username}
                                                  for the first time, tenure = "1 month."

 2     "Two months in. Patterns are               Chapter 2 seals. Pattern Insights widget
        starting to form."                        candidate (consistency ≥ 0.66 per
                                                  interfaceEvolution.ts:334) — first month
                                                  it's plausible a real streak exists.

 3     "Three months. You have reached            Chapter 3 seals. QR Code / Profile
        Active User status."                      sharing unlocks (Usership + "forming"
                                                  Self-Assembly phase gate, per
                                                  LOT-FEATURE-INVENTORY-2026.md:234-236,427).
                                                  This is the first externally-shareable
                                                  milestone — the user can now show
                                                  someone their /u/ page and it says
                                                  something.

 4     "Four months. The portrait                 Chapter 4 seals. Advanced Memory
        deepens."                                 (depth ≥ 0.33, "Deep Diver") plausible
                                                  for engaged users — deeper follow-up
                                                  questions become the norm, not the
                                                  exception (memory.ts's 3-tier WHAT/HOW/WHY
                                                  depth starts leaning toward HOW/WHY).

 5     "Five months. Consistency is its            Chapter 5 seals. First "Month N Citizen"
        own reward."                              tenure badge (new — see §04) sits
                                                  alongside behavioral badges instead of
                                                  being the only kind of badge in play.

 6     "Six months. The journey is half-           Chapter 6 seals — the midpoint chapter.
        declared."                                Board Profile's activity block
                                                  (journal entries / memories compiled /
                                                  active days) is now a meaningful size,
                                                  not a thin trickle. Self-Assembly phase
                                                  realistically reaches "assembled" for
                                                  consistent users (5-phase progression,
                                                  LOT-FEATURE-INVENTORY-2026.md:55-57).

 7     "Seven months in. The system has            Chapter 7 seals. `preferTechLanguage`
        been listening."                          threshold in SelfCareMoments.tsx:396
                                                  (30+ day streak) is now realistic for a
                                                  consistent user — self-care copy can
                                                  shift fully into systems language for
                                                  the first time this year.

 8     "Eight months. Rare air."                   Chapter 8 seals. Custom theme + Badge
                                                  Selection (any badge tier, `badgeTier
                                                  >= 1`) are long-unlocked by now for
                                                  active users; this month is about the
                                                  Board Profile's "Powering N citizens"
                                                  figure starting to feel substantial.

 9     "Nine months. The self-care                 Chapter 9 seals. `achievementGallery`
        practice is a habit now."                 (exploration >= 1.0, all exploration
                                                  badges) plausible — the achievement
                                                  showcase widget has something to show.

10     "Ten months. Almost there."                 Chapter 10 seals. The Memory Story is
                                                  now backed by 9 sealed chapters plus a
                                                  live 10th — long enough that
                                                  `narrativeReflection` (depth ≥ 0.66,
                                                  level ≥ 30) is realistic: full AI
                                                  narrative synthesis across the whole
                                                  year becomes possible, not just the
                                                  last 30 answers.

11     "Eleven months. One more."                  Chapter 11 seals. Anticipation framing
                                                  only — the Months-Unlocked widget
                                                  (§05) shows 11/12 and nothing else
                                                  changes structurally. Restraint here
                                                  matters: Month 12 should feel earned,
                                                  not diluted by early fanfare.

12     "One year with LOT. The portrait            Chapter 12 seals. The Year Compilation
        is complete — and still evolving."         (§03.3) generates: one AI-authored
                                                  synthesis paragraph across all 12
                                                  Chapters. This is the exact shape of
                                                  what /u/machiavelli shows today —
                                                  Board Member #N, citizen since, tenure
                                                  "12 months," full activity block — made
                                                  visible to the user themselves, not
                                                  just to visitors of their public page.
```

Layout density (Axis A, unaffected by the table above) is expected to correlate loosely
with month number for typical engaged users — `breathable` in month 0-1,
`comfortable`/`compact` by month 3-6, `dense`/`instrument` by month 9-12 — but this is a
correlation, never a rule the tenure axis enforces. A quiet Usership member at month 9
should still see `breathable`. The interface should never lie about maturity to flatter
tenure.

---

## 03 — THE CENTERPIECE: MEMORY CHAPTERS (12-month compressed Story delivery)

This is the part of the brief to weight most heavily: *"focus on 12-month tangibility
of the compressed Memory story delivery."* Today, `generateMemoryStory()`
(`src/server/utils/memory.ts:873-950`) has no concept of a month. It reads the last 30
`answer` logs, asks the AI to synthesize a flowing third-person narrative, and returns
a single string that gets **overwritten** every time it's regenerated. There is no
history. A user who has been on LOT for eight months has, narratively, the same object
as a user on day 30: one paragraph, whatever the AI most recently produced.

### 03.1 — Sealing a chapter

There are two existing scheduled jobs this could hook into, and they are not the same
job — worth being precise:

- **`memory-story-update`** (job `J3` per the wiki job tables, e.g.
  `docs/wiki/LOT-WIKI-v87.md`) runs **daily at 20:00 UTC** and already calls
  `generateMemoryStory()` to regenerate the rolling, all-time narrative
  (`user.metadata.lastMemoryStory`). This is the *closer* hook: it already runs once a
  day, already has the user + logs in scope, and only needs one added check —
  "has this Usership user's tenure crossed a month boundary since their last sealed
  chapter?" — to seal a chapter on the day it happens, rather than waiting for a
  separate monthly cron.
- **Monthly Email Summary** (`docs/corporate/LOT-FEATURE-INVENTORY-2026.md` §12, job
  15, "1st, 09:00 UTC") is calendar-month-boundary-aware but fires for *every* user on
  the 1st — it does not know a given user's personal Usership anniversary day, which
  is what actually defines their "month N" per `MonthlyPulseWidget.tsx:73-79`'s own
  math. Wrong job for this.

Extend `memory-story-update` (daily job) so that instead of only overwriting the
rolling story, it also **calls `generateMemoryStory()` scoped to that calendar month's
logs only** (not the rolling last-30) whenever tenure has just crossed a month
boundary, and writes the result as an immutable record:

```
New Log event type: 'memory_chapter_sealed'
  text:      the AI-generated paragraph (reuse generateMemoryStory's prompt,
             scoped to logs where createdAt falls within [monthStart, monthEnd))
  metadata:  {
               monthNumber: 1-12,          // Usership tenure month, not calendar month
               monthLabel: "Month 3",
               entryCount: number,         // note + answer logs that month
               checkInCount: number,       // emotional_checkin logs that month
               selfCareCount: number,      // self_care_complete logs that month
               tier: 'quiet' | 'steady' | 'deep'   // see 03.2
             }
  createdAt: month-end timestamp
```

This reuses the exact `logs` table and `Log` model already in place
(`docs/assembly/2026-06-30_LOT-assembly_widget-memory-engine-compression-loop.md:264-291`
documents the schema) — no new table, one new `event` value, following the same
pattern as `plan_set` and `emotional_checkin` before it.

**Why sealed, not editable:** a chapter that can still change stops being a milestone.
The whole point is that Month 3 stays Month 3 forever — the tangible, permanent
version of what the still-mutable live Memory Story only gestures at moment to moment.

### 03.2 — Effort-weighted tone, never a penalty

The brief specifically calls out that journal entry volume and check-in/self-care
click counts should shape how the month is celebrated. Rather than gating *whether* a
chapter seals (it always does — tenure never punishes), let volume shape its **tier**
and therefore its **tone**, computed from that month's log counts:

```
tier      threshold (that calendar month)              chapter tone
────      ───────────────────────────────              ────────────
quiet     < 5 note/answer logs                          Short, gentle, present-tense
                                                          observation. No manufactured
                                                          insight where none exists.
                                                          e.g. "This was a quieter month.
                                                          The system noticed, and stayed."

steady    5-20 logs, or a streak ≥ 7 days               Standard paragraph-length
                                                          narrative — the existing
                                                          generateMemoryStory() shape,
                                                          scoped to the month.

deep      20+ logs, or streak ≥ 21 days,                Fuller synthesis, may reference
          or 3+ self-care completions/week averaged     concrete recurring details
                                                          (the existing prompt's "– " bullet
                                                          insights format, memory.ts:920).
```

This directly answers "the amount of journal entries and thoughts put into Log, as
well as regular morning check-ins and self-care button clicks" driving the evolution —
without ever making a quiet month feel like a failure. A `quiet` chapter is still a
chapter. It just tells the truth plainly, in keeping with the style guide's "Technical
accuracy over validation" principle (`LOT-STYLE-GUIDE.md:186`).

There's already a precedent for weighting depth, not just count: `selfAssembly.ts`'s
"Reflection Layer" gives journal entries over 100 words **double** weight toward that
module's assembly threshold. The tier thresholds above should borrow the same idea —
a month with 8 short notes and a month with 8 two-hundred-word entries should not
land in the same tier, even though both clear "5-20 logs."

### 03.3 — The Year Compilation (Month 12)

When Chapter 12 seals, run one additional AI call: feed all 12 sealed chapter texts
(not the raw logs — the already-compressed paragraphs) back through the same engine
with a prompt that asks for a single closing synthesis paragraph — "read these twelve
monthly portraits of the same person and write the one paragraph that describes who
they have become across the year." This is cheap (12 short paragraphs of input, not
360+ days of raw logs) and it is the artifact that should appear on the public
Board Profile as `memoryStory` for a 12-month veteran — this is, concretely, what
`/u/machiavelli`'s public Memory Story text represents today: not day-30 output, but a
year's compression. Making that compilation an explicit, dated step (rather than
whatever the most recent regeneration happened to produce) is what makes it feel
*earned* rather than incidental.

### 03.4 — Where chapters live in the UI

A new widget, **Memory Chapters** (or fold into the existing System Progress widget's
view-cycling pattern, `SystemProgressWidget.tsx`, alongside its existing "OS Journal"
view), following the established clickable-label-cycle convention
(`LOT-STYLE-GUIDE.md:57-77`):

```tsx
<Block label="Chapters:" blockView onLabelClick={cycleView}>
  {sealedChapters.map(ch => (
    <div key={ch.monthNumber} className="flex flex-col gap-y-4 mb-16">
      <div className="opacity-30 tabular-nums">Month {ch.monthNumber}</div>
      <div className="opacity-90">{ch.text}</div>
    </div>
  ))}
  {liveDraftMonth && (
    <div className="opacity-60">
      <div className="opacity-30 tabular-nums">Month {liveDraftMonth.n} — in progress</div>
      {liveDraftMonth.previewText}
    </div>
  )}
</Block>
```

Sealed chapters render at full `opacity-90` (primary content, per the opacity
hierarchy in `LOT-STYLE-GUIDE.md:33-38`); the current unsealed month renders at
`opacity-60` to visually distinguish "written in stone" from "still being written" —
the same distinction the style guide already uses for primary vs. secondary content,
repurposed here to carry real narrative weight (finished vs. in-progress) rather than
just visual hierarchy.

---

## 04 — TENURE BADGES (small addition to an existing system, not a new one)

`badges.ts` already has a day-count milestone ladder that runs the full year and
beyond — `milestone_7, 14, 21, 30, 50, 60, 90, 100, 180, 365` (365 = "Mayan tun-year,"
legendary tier) — plus distinct-day-count and multi-year badges out to 3,650 days. It
would be redundant and confusing to add a second full 12-step ladder on top of that.

The one genuine gap: every one of those 635 badges is keyed to **days since account
signup**, which a free/civilian user accrues identically to a Usership member. None of
them mark *how long someone has been paying*. That distinction — tenure as a Usership
member specifically, starting from Usership activation, not from account creation —
is the only thing worth a new, small, separate category:

```
Month 1    "First Light"        — Usership activates
Month 3    "Active Citizen"     — matches MonthlyPulseWidget's own month-3 language
                                   ("You have reached Active User status")
Month 6    "Half Year"          — midpoint
Month 12   "Year One"           — the rarest of this set; only awarded once per
                                   account, ever, and only at 365 real days of
                                   continuous Usership (no pausing/resubscribing tricks
                                   — check against boardProfile.citizenSince, not just
                                   a rolling tag flag)
```

These are 4 badges, not 12 — deliberately sparse, so they don't compete visually with
the 149 existing badges or turn tenure into a checklist. They exist so the Board
Profile and badge-selection UI (`badgeSelection: badgeTier >= 1`,
`interfaceEvolution.ts:328`) have *something* to point to that says "time served," in
addition to everything that says "effort made."

---

## 05 — THE "MONTHS UNLOCKED: N/12" WIDGET

`MonthlyPulseWidget.tsx` today is a toast: it shows once per calendar month, and once
dismissed (`markDismissed`, line 57-61) it is gone until next month — nothing about it
persists in the always-visible UI. The brief's own suggestion — a standing "Months
unlocked: 3/12" widget — is the fix: keep the existing toast (it's a good, minimal
ritual — don't remove it) but add a small, permanent companion that survives dismissal:

```tsx
// New: MonthsUnlockedWidget.tsx, or fold into EvolutionWidget.tsx's existing
// 'metrics' view (EvolutionWidget.tsx:158-208) as one more row — this widget
// already computes streak/entries/achievements from the same `me`/`logs` data
// this needs, so extending it costs less than a new Block.

<div className="flex items-center gap-8 mt-4">
  <span className="opacity-30">Usership year</span>
  <ProgressBars percentage={(monthNumber / 12) * 100} barCount={12} />
  <span className="tabular-nums">{monthNumber} / 12 months</span>
</div>
```

Reusing `ProgressBars` (already imported in `EvolutionWidget.tsx:15`) with
`barCount={12}` gives one bar per month for free — each filled bar *is* a sealed
Memory Chapter, so the progress bar and the chapter list in §03.4 are reading the same
underlying array, not two separately-maintained counters. Clicking a filled bar could
jump the Chapters widget to that month (nice-to-have, not required for v1).

---

## 06 — WHAT NOT TO DO

- **Do not** make Axis A (behavioral maturity) regress based on calendar tenure, or
  vice versa. They compose; they don't average into one score.
- **Do not** let a quiet month fail to produce a chapter. Tenure never punishes —
  only tone (§03.2) reflects effort, and even the "quiet" tier is honest and kind, not
  empty.
- **Do not** turn the tenure badges (§04) into a 12-badge checklist. Four is the
  right number. The 635 existing badges already cover density; this category covers
  duration.
- **Do not** retroactively backfill chapters for existing Usership members who joined
  before this ships without their sealed history — either seal a "Month 0 — before
  Chapters existed" catch-all from their oldest logs, or start their Chapter count at
  whatever month they're currently in. Never show "Month 1" for someone who joined
  eight months ago; that would be dishonest about tenure, which is the one axis this
  whole design insists on keeping truthful.
- **Do not** surface Chapter tone (`quiet`/`steady`/`deep`) as a visible label in the
  UI. It should shape the AI prompt and the copy's warmth, never appear as a literal
  tag the user reads about themselves — consistent with "No gamification... no
  points, badges, leaderboards" as a *display* philosophy even where the backend now
  tracks tiers (`LOT-STYLE-GUIDE.md:439` vs. the badge engine's actual scale — the
  guide's spirit is "don't make the user feel scored," not "don't track anything").

---

## 07 — IMPLEMENTATION SKETCH (for the next session)

```
1. Migration: none needed — reuses `logs` table, new `event: 'memory_chapter_sealed'`.
2. src/server/utils/memory.ts
   - Add `generateMonthlyChapter(user, logs, monthNumber, monthStart, monthEnd)`
     — same prompt shape as generateMemoryStory(), scoped by date range + tier (§03.2)
   - Add `generateYearCompilation(chapters: string[])` for month-12 synthesis (§03.3)
3. wherever the `memory-story-update` daily job (J3, 20:00 UTC) lives — after its
   existing generateMemoryStory() call, add one check: has this Usership user's
   tenure (dayjs(now).diff(joinedAt,'month'), same math as MonthlyPulseWidget.tsx:73-79)
   just crossed a month boundary since their last 'memory_chapter_sealed' log? If so,
   call generateMonthlyChapter() and Log.create({ event: 'memory_chapter_sealed', ... }).
   Do NOT use the separate Monthly Email Summary job (1st of month, all users) — it
   doesn't know each user's personal Usership-anniversary day.
4. src/client/components/ — extend EvolutionWidget.tsx metrics view (§05) with the
   12-bar progress row; add chapter list either as a new Block or a third view on
   SystemProgressWidget.tsx's existing view-cycle (Chapters alongside OS Journal)
5. src/client/components/PublicProfile.tsx:288-320 — boardProfile already has the
   month-12 shape; wire memoryStory display to prefer the sealed Year Compilation
   (§03.3) over the rolling generateMemoryStory() output once 12 chapters exist
6. docs/badges/ — register the 4 tenure badges (§04) in the next Master Codex version
   bump, following the existing badge-doc versioning pattern
```

---

## 08 — CLOSING

The honest note for this doc: LOT did not need a new gamification layer invented from
scratch. It needed three things that already work — the Monthly Pulse's calendar math,
the Memory Engine's compression prompt, and the Board Profile's tenure fields — wired
into one twelve-beat story with a permanent artifact at the center. `/u/machiavelli`
already shows what "done" looks like from the outside. The job of the next
implementation session is to make the person living through their own Year One able to
watch that same portrait build, chapter by chapter, from the inside.

---

AUTHORIZED BY: S-2 // VADIK MARMELADOV
LOT SYSTEMS CORPORATION | 2026-09-26
