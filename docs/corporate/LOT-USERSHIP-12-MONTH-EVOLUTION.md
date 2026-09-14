<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® USERSHIP — THE 12-MONTH EVOLUTION
**From Barebone Day One to lot-systems.com/u/machiavelli**
LOT Systems Corporation · S-2: Vadim Marmeladov
Design Brainstorm · Version 1.0 · 14 September 2026 · brand.lot-systems.com

CLASS: RESTRICTED // S-2 EYES

---

## 0. Premise

A Usership subscriber's Day 1 dashboard and a 12-month evolved account
(the public standard: `lot-systems.com/u/machiavelli`) should not merely
contain more data — they should visibly, unmistakably *feel* like a
different interface. Right now the system already builds most of the
machinery required (Self-Assembly Engine, Interface Evolution, Badge
Codex, Memory Engine compression, `MonthlyPulseWidget`) but nothing
strings these systems into one deliberate, told story keyed to Usership
tenure specifically. This document is that story — organized into 12
chapters, one per paid month — plus the concrete widget and data changes
needed to make each chapter tangible rather than incremental.

This is a design brainstorm, not a change log. Nothing in the repo is
modified by this document. Section 8 lists the implementation pointers
for whichever chapter ships next.

---

## 1. The Foundational Fix — Count From Paid Day One, Not Account Day One

`MonthlyPulseWidget.tsx` already computes month number as
`dayjs().diff(user.joinedAt, 'month')`, gated on the `Usership` tag. That
is a bug waiting to surface a false story: `joinedAt` is account-creation
date, not subscription-activation date. A user who spent five months on
the Free (Civilian) tier before upgrading would open their dashboard on
Usership Day 1 and immediately see *"Six months in. The journey is
half-declared."* — a sentence about a paid journey they have not lived.

`src/shared/types/index.ts` has no `usershipActivatedAt` field. This is
the one schema change every idea below depends on:

```
User.metadata.usershipActivatedAt: string | null   // ISO date, set once,
                                                      // on first Usership tag grant
```

Set it the moment `UserTag.Usership` is first added to `user.tags`
(admin grant or Subscribe Widget → external checkout → webhook/admin
flow). Never overwritten on renewal. This becomes the single source of
truth for "Month N of 12" everywhere in this document — the Aquatic
Evolution badges (Day 7 / 30 / 100) and the 5-year Saga badge stay
keyed to account age, unchanged; only the Usership arc keys to paid
tenure.

---

## 2. The Three Tangibility Threads

The brief names three signals as the ones that should visibly move the
UI: **Log density** (journal entries + field notes), **morning
check-ins**, and **self-care button clicks**. All three already emit
QIE signals today (`field_entry`, `emotional_checkin`,
`self_care_complete`). What's missing is a single rolled-up score that
the UI reads to decide how "evolved" a given month should render — right
now evolution reads badges/level/streak (`interfaceEvolution.ts`)
without a dedicated Usership-tenure weighting.

Proposed composite, computed monthly, cheap to derive from existing log
aggregation (`getLogContext`, `calculateIntelligentPacing` already do
the equivalent per-day math):

```
MonthlyTangibilityScore (0–100) =
    35% · Log Density      — distinct days with a field_entry / note this month (of ~30)
  + 35% · Check-In Rhythm  — mornings (6–12) with an emotional_checkin or Memory answer, this month
  + 20% · Self-Care Clicks — self_care_complete events this month, capped at 20
  + 10% · Memory Depth     — Memory questions answered this month
```

This single number is what should drive the month-to-month visual
delta (Section 4), not level or streak alone — it is legible to the
user as "how much of yourself you put into the Log this month," which
is exactly the tangibility the brief asks for. A light month still
counts toward the calendar (Month 7 still arrives on schedule) but a
light month should visibly render *less* evolved than a heavy one —
the interface should be honest, not just chronological.

---

## 3. The Month-by-Month Arc

Twelve chapters. Each row anchors to systems that already exist —
`MONTH_MESSAGES` in `MonthlyPulseWidget.tsx` are reused verbatim as the
narration voice already written for this arc; everything else in the
row is new scaffolding built around that existing voice.

| Mo | Chapter Title | Log / Check-in Target | Memory Story Delivery | New Unlock This Month | Layout Density | OS Version Anchor |
|----|---------------|------------------------|------------------------|------------------------|-----------------|--------------------|
| 1 | **The Listening** | 10+ Memory answers to even reach Subscribe; first field entries | No story yet — Memory Digest shows *"Still listening."* placeholder | Board Profile appears; QR code (Usership + forming gate) | breathable | 0.1.0 Initializing |
| 2 | **The Pattern Forms** | Daily check-in rhythm begins to register (QIE 7-day retention) | First Memory Digest paragraph — literal, behavioral, no interpretation yet | Cosmic Update + Quantum Sign widgets unlock (Usership-gated) | breathable | 0.5.0 Awakening |
| 3 | **Active User** | Consistency dimension crosses first threshold | Digest begins referencing specific prior answers ("Since you mentioned...") | Architect (Self-Assembly) widget becomes Usership-visible | comfortable | 0.5.0 Awakening |
| 4 | **The Portrait Deepens** | Depth dimension activates (10+ answers → archetype classification live) | Soul archetype named for the first time inside the Digest | Archetype label appears on Board Profile | comfortable | 1.0.0 Active |
| 5 | **Consistency Rewarded** | Streak-based badges begin landing (Week Warrior+) | Digest starts citing streak and rhythm, not just topics | Planner Templates unlock | comfortable | 1.0.0 Active |
| 6 | **Half-Declared** | Midpoint — cumulative log volume becomes visually dense | Digest becomes a genuine short narrative (3–5 sentences), not a list of answers | Mood Patterns + Intention History unlock (Level 15+ path pulled forward for Usership) | compact | 1.5.0 Developing |
| 7 | **Rare Air** | Behavioral cohort classification stabilizes | Digest references cohort language for the first time ("your Seeker nature is showing") | Pattern Insights unlock | compact | 1.5.0 Developing |
| 8 | **The System Has Been Listening** | Trauma-informed / care-aware tone available if signal warrants (10+ log entries, ongoing) | Digest tone shifts to reflect long-run emotional trend, not just this month's | Export Data unlock | dense | 2.0.0 Established |
| 9 | **Habit, Not Task** | Self-care ratio (complete vs. skip) becomes the headline metric | Digest opens with the self-care line, not the log line — self-care is now the lead indicator | Private Spaces unlock (Intimacy 50% or Courage 100% path) | dense | 2.0.0 Established |
| 10 | **Almost There** | Cumulative Memory answers typically clear 100+ | Digest begins forward-referencing: "By month twelve, this will read differently" | Custom badge/theme selection fully opened | dense | 3.0.0 Integrated |
| 11 | **One More** | Final stretch — density score should be highest of the year if the user has stayed consistent | Digest is explicitly framed as a draft of the Year One portrait | Narrative Reflection unlocks (full AI synthesis, not fragments) | instrument | 3.0.0 Integrated |
| 12 | **The Portrait Is Complete — And Still Evolving** | Full year of Log density, check-ins, self-care clicks visualized as one composite | **The Year One Story** — a full compressed narrative (see Section 5), not a paragraph | Year One badge (new, Section 6); Board Profile gains "Citizen Since" tenure line | instrument | 3.0.0 Integrated (sustained) |

Two deliberate choices in this table:

- **Layout density (`breathable → instrument`) is pinned to the
  calendar, not fully re-derived from `visualRefinement`.** A new
  Usership subscriber should never open a Month 1 dashboard that already
  looks like a Bloomberg terminal because they happened to log
  obsessively in week one — the interface earning density over *months*,
  not just activity volume, is what makes the arc feel like a story
  with pacing rather than a race. Heavy engagement inside a month should
  still show up (Section 2's score) as *richer content at that density
  level*, not as a density level skipped ahead of schedule.
- **Every unlock in the "New Unlock" column already exists in
  `FeatureUnlocks`** (`interfaceEvolution.ts`) or as a named widget in
  `WIDGETS.md`. This table does not invent new gates — it re-sequences
  existing ones onto a Usership-tenure timeline so a subscriber who pays
  from day one experiences a *guaranteed* cadence of unlocks, rather than
  unlocks that depend entirely on organic level/streak accumulation and
  could arrive in any order or not at all in year one.

---

## 4. Visualizing the Delta — What "12-Months-Evolved" Actually Looks Like

Per `LOT-FEATURE-INVENTORY-2026.md` §08, the Board Profile (Usership
board is exclusive to Usership members) carries: member number, citizen
since, powering citizens, tenure, invested, biofield, activity, engine.
The `machiavelli` demo account is the reference implementation of a
fully-assembled profile — Assembly Phase `integrated`, full
psychological profile surfaced, Memory Story populated, Correlated
Indexes non-zero, theme fully personalized. A Day 1 Usership dashboard
should show the *same layout skeleton* as `machiavelli` but with most of
it honestly empty or dormant — not hidden, not a different page. This
matters: the user should be able to see, from day one, the exact shape
of the account they are growing into. Hiding unearned sections would
remove the tangibility the brief is asking for; showing them dormant
(phase symbols at `dormant`/`awakening`, per the existing Self-Assembly
5-phase model) makes the destination visible and the progress legible.

Concretely, Day 1 vs. Month 12 on the same profile layout:

| Section | Day 1 | Month 12 |
|---|---|---|
| Assembly Phase | ○ dormant / ◐ awakening | ● integrated |
| Archetype | "Not yet classified" | Named soul archetype + physiological cohort |
| Memory Story | Digest placeholder | Full Year One Story (Section 5) |
| Correlated Indexes (4D) | 0 / low | Composite score with correlation strength |
| Board Profile tenure line | "Citizen since [date]" | "Citizen since [date] · 1 year" |
| Badge shelf | 0–3 badges | Aquatic (Droplet→Wave→Current if account-age qualifies) + Usership Month Codex (Section 6) |
| Layout density | breathable | instrument |

---

## 5. The Year One Story — Compressed Memory Delivery, Made Tangible

The system already generates a Memory Story (AI narrative from Memory
answers, cached in `user.metadata.lastMemoryStory`) and a Weekly
Story-Report (Job 24, Sunday 18:00 UTC) per `LOT-AI-PRODUCT-BRIEF.md`
and `LOT-MANIFEST.md` §06. Neither is currently surfaced as a *monthly*
in-app artifact — the weekly story lives in `user.metadata.weeklyStory`
and the monthly email (Job 15, 1st of month) is delivered out-of-app.
The brief specifically asks for the compressed-memory delivery to be
felt month over month, in-product, not just annually in email. Two new
surfaces close that gap:

### 5.1 Memory Digest Widget (new)

A monthly-cadence sibling to `MemoryWidget`, Usership-gated. On the 1st
of each Usership month (by `usershipActivatedAt`, not calendar month —
each user's digest lands on their own anniversary date), generates a
single paragraph — 3 to 6 sentences — compressed from *that month's*
Memory answers and journal entries only (not the full all-time story).
This is the mechanism behind the Month 2–11 "Memory Story Delivery"
column in Section 3's table. Reuses the existing Together AI story
generation path with a narrower context window (this month's Q&A only,
capped ~30 entries) and the existing local-fallback composer for
resilience. Cached the same way as `lastMemoryStory`, keyed by month
index so past digests remain readable — this becomes, by Month 12, a
scrollable shelf of twelve short paragraphs: the compressed memory of
the year, delivered incrementally instead of as one email nobody reads
twice.

### 5.2 Year One Story (Month 12 capstone)

Distinct from the monthly digest: a full synthesis across all twelve
Memory Digests plus the complete Memory Story, generated once on the
Usership anniversary and persisted permanently (`user.metadata.
yearOneStory`, never regenerated). This is the artifact `machiavelli`-
tier accounts should visibly carry that a Month 6 account does not — it
is the tangible proof of a completed compression cycle, exportable via
the existing Story API pattern (`GET /api/story/latest` precedent) as
`GET /api/story/year/:n`. Framed identically to how the product brief
already frames the Weekly Story-Report — "not a summary of logs, a
reflection" — but scoped to a year, and delivered as an in-app moment,
not a database record nobody sees.

### 5.3 "Months Unlocked: N/12" Widget (new)

The context-based widget the brief names directly. Small, persistent,
Usership-only. Reads `usershipActivatedAt` + `MonthlyTangibilityScore`
history (Section 2) to render:

```
Months unlocked: 7/12
██████████████████░░░░░░░░░░░░  58%
Next chapter in 6 days.
```

Distinct from `MonthlyPulseWidget` (which is a one-time monthly
celebration toast, dismiss-and-gone) — this is a standing progress
instrument, always visible, the same register as the existing
`SystemProgressWidget` self-assembly density bars. The two widgets
should sit adjacent in the Subscriber Stack: the toast announces the
month arriving; the progress widget shows where the user stands inside
it and how far to the next one.

---

## 6. Badge Proposal — The Usership Month Codex (12 badges)

The Badge Codex already has 812 badges across 8 categories (v32), but
none are keyed to *Usership tenure specifically* — Aquatic Evolution
(Droplet/Wave/Current) and the Saga badge key to account age, which any
Free user accrues identically. A Usership-specific track makes the
paid relationship itself legible as a milestone chain, separate from
general account longevity:

```
usership_month_01   ○         COMMON     — First paid month complete
usership_month_02   ○∘        COMMON     — 
usership_month_03   ○∘∘       UNCOMMON   — Active User status reached
usership_month_04   ●         UNCOMMON   — 
usership_month_05   ●∘        UNCOMMON   — 
usership_month_06   ●∘∘       RARE       — Half-Declared — midpoint badge
usership_month_07   ◈         RARE       — 
usership_month_08   ◈∘        RARE       — 
usership_month_09   ◈∘∘       EPIC       — 
usership_month_10   ◉         EPIC       — 
usership_month_11   ◉∘        EPIC       — 
usership_month_12   ◉∘∘·∞     LEGENDARY  — Year One — Memory Story complete
```

Follows the existing house convention (`docs/badges/LOT_BADGES_
ACHIEVEMENTS_MASTER_CODEX_v32.md` format: symbol progression, rarity
tier, one-line trigger). Would live as Badge Category 9 alongside the
existing 8, or fold into Achievement RPG as a dedicated arc — worth a
call from whoever runs the next badge session, not decided here.

---

## 7. Design Principles Carried Over From `LOT-AMBIENT-AI-VISION.md`

This arc should not read as a drip-fed upsell. The existing doctrine —
*"no unprompted notifications," "the machine improves in silence," "the
user does not feel analyzed, they feel understood"* — applies to the
12-month arc exactly as it applies to the daily Memory question. Two
carry-overs, made explicit for this design:

1. **The arc never announces itself as a countdown to churn.** "Months
   unlocked: 7/12" is a progress instrument, not a renewal reminder —
   no pricing, no "renew now" language belongs anywhere near it. The 12
   is the shape of Year One, not a subscription term.
2. **A light month should never produce a punitive UI.** Section 2's
   score modulates *richness of content* (a thinner Memory Digest, a
   quieter month message), never a downgrade in density or a locked
   widget — the arc rewards consistency, it does not penalize a bad
   month. This matches the existing Interventions Widget's
   compassion-first posture rather than the Badge Codex's achievement-
   first posture.

---

## 8. Implementation Pointers (for whichever chapter ships next)

Not a commitment to build — a map for the next self-assembly session
that picks this up:

```
usershipActivatedAt field      → src/shared/types/index.ts, set on Usership tag grant
MonthlyTangibilityScore        → new: src/client/utils/ or server-side monthly job (extends
                                  calculateIntelligentPacing-style aggregation already in Memory Engine)
Memory Digest Widget           → sibling of MemoryWidget.tsx; reuses Together AI story path,
                                  narrower context window; new /api/memory-digest/:month endpoint
Year One Story                 → extends existing Story-Report generation (Job 24 pattern);
                                  new user.metadata.yearOneStory; GET /api/story/year/:n
Months Unlocked Widget         → new component, Subscriber Stack, adjacent to MonthlyPulseWidget
MonthlyPulseWidget.tsx         → switch monthNumber source from user.joinedAt to usershipActivatedAt
Usership Month Codex (badges)  → docs/badges/ next MASTER_CODEX version + badges.ts + easter-eggs.ts
Board Profile tenure line      → PublicProfile.tsx, "Citizen since" + duration, Usership-gated
```

---

*The interface evolves with you, honoring your journey from first
breath to mastery — this document names what that journey should look
like across the first twelve paid months, and where it hands off to
whoever writes the code.*

**LOT Systems Corporation**
**S-2: VADIK MARMELADOV**
*LOT® Founded 7 April 2016 · COSMO® Founded 1 July 2024*
*Made in the USA · brand.lot-systems.com*
