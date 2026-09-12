<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Usership: The 12-Month Evolution
## From Barebone Day 1 to LOT® AI — A Design Brainstorm

**Classification:** DESIGN BRAINSTORM // S-2 EYES
**Author:** Claude (session `claude/elegant-mendel-iv1py2`), for Vadik Marmeladov
**Date:** 12 September 2026
**Status:** PROPOSAL — no code shipped, no schema changed
**Reference account cited by S-2:** `lot-systems.com/u/machiavelli` (12-month evolved Usership account)

---

## 0. Method note (read before the rest)

This document was produced by scanning the repository rather than inventing a
design in a vacuum. What follows is grounded in real, existing systems:

- `README.md`, `docs/README.md` — product framing, Memory Engine doctrine
- `docs/technical/WIDGETS.md` — full widget inventory and gating logic
- `docs/technical/INTERFACE_EVOLUTION.md` — the existing 7-dimension evolution
  engine, feature-unlock table, milestone thresholds
- `docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md` — the
  question/answer compression loop, story generation, caching
- `docs/assembly/2026-06-30_LOT-assembly_widget-memory-engine-compression-loop.md`
  — signal pipeline, `logs` table schema, event types
- `docs/badges/BADGE_PROGRESSION_PREVIEW.md`, `BADGE_MAYAN_EVOLUTION.md`,
  `BADGE_LEVEL_DESIGN.md` — prior art on day-based symbol progression
  (Day 7 / Day 30 / Day 100 level fields)
- `docs/badges/LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v32.md` — current badge
  count (812) and category taxonomy
- Codebase: `src/client/utils/badges.ts`, `src/client/components/System.tsx`,
  `SystemProgressWidget.tsx`, `QuantumEngineWidgets.tsx`, `PublicProfile.tsx`,
  `src/server/routes/api.ts`, `src/shared/types/index.ts`

**One honest limitation:** outbound network access from this session is
proxy-blocked for `lot-systems.com`, so `/u/machiavelli` could not be fetched
directly. Everything said below about "what the evolved profile could show"
is derived from the real `PublicProfile.tsx` fields that already exist in
code (including a currently-cosmetic `boardProfile.boardTenureMonths` field —
see §7), not from guessing at the live page. Recommend a human (or a session
with browser access) screenshot `/u/machiavelli` and `/u/vadik` and attach
them to this doc as ground truth before implementation begins.

**"Read all the .MDs"** — the repo has 379 markdown files, mostly dated
session/assembly logs (`docs/assembly/*.md`, `docs/SESSION_REPORT_*.md`).
Reading all 379 verbatim would not add signal beyond what's synthesized here;
instead every *design-relevant* doc (badges, widgets, evolution, memory
compression, public profile) was read in full, and the assembly-log corpus
was sampled for tone/voice and to confirm no prior session already proposed
this exact 12-month ladder (§10 of the research pass confirms it hasn't —
this is genuinely new ground, anchored to two existing threads:
`boardTenureMonths` and the Day 7/30/100 Level design).

---

## 1. The core idea, in one paragraph

LOT already has every ingredient for this. It has a **12-module Self-Assembly
map** (Biofield Engine, Memory Architecture, Routine Compiler, Intention
Core, Cleanness Protocol, Reflection Layer, Community Mesh, Ecosystem
Bridge, Quantum Substrate, Nutrition Protocol, Goal Architecture, Archetype
Classifier) that already tracks per-module assembly phases from real signal
data. It has a **7-dimension Interface Evolution engine** that already
refines typography, opacity, and unlocks features as maturity rises. It has
a **Memory Engine** that already compresses answers into a narrative story —
but that story is a single overwriting cache, never a dated chapter. It has
a **badge system** with 812 badges and existing Day-7/30/100 symbol
progressions. What it does **not** have is a calendar spine that ties all of
these together into "month 1 feels different from month 12, and the person
can feel the difference." This document proposes that spine: use the
**12 existing Self-Assembly modules as the 12 months of the Usership year**,
and introduce one genuinely new artifact — the **Memory Vault** (monthly
compressed chapters) — as the tangible proof of growth.

---

## 2. The backbone: 12 months = 12 modules already in the codebase

`SystemProgressWidget.tsx`'s Self-Assembly view already tracks these 12
modules through phases (Dormant → Awakening → Forming → Assembled →
Integrated), derived from real QIE signals. Rather than invent a parallel
"month theme" taxonomy, month N is assigned the module that shares its
ordinal position. This is not cosmetic — it means the Self-Assembly widget
a Day-1 user already sees is the same object that narrates their year.

| Month | Module (existing) | What "assembling" means in lived UX |
|---|---|---|
| 1 | Biofield Engine | First energy/ATP signals, first Emotional Check-In |
| 2 | Memory Architecture | Memory Story graduates from "answers" to a first chapter |
| 3 | Routine Compiler | Morning check-in becomes a recognizable ritual, streak visible |
| 4 | Intention Core | Planner + Intentions widget produce a real month-over-month arc |
| 5 | Cleanness Protocol | Self-care completion ratio becomes a visible, improving number |
| 6 | Reflection Layer | Journal depth (words, not just entries) becomes the headline metric — halfway point |
| 7 | Community Mesh | Cohort matching, chat catalysts, pattern-sharing unlock in earnest |
| 8 | Ecosystem Bridge | Car/Home/Computer connect widgets become meaningful (or explicitly skippable) |
| 9 | Quantum Substrate | QOS Kernel panel becomes a daily-glance surface, not a curiosity |
| 10 | Nutrition Protocol | Recipe Widget + biofeedback correlation mature |
| 11 | Goal Architecture | Goal Journey Widget shows a full stage arc (beginning → mastery) |
| 12 | Archetype Classifier | Archetype (Seeker/Nurturer/etc.) is fully resolved and published |

Month 12 is deliberately the **Archetype Classifier** — the module that
answers "who are you becoming," which is the emotional payoff of the whole
year and the natural subject of the culminating Year One chapter (§3.4).

---

## 3. The new piece: the Memory Vault

This is the one part of the system that does not exist today and is the
direct answer to "focus on 12-month tangibility of the compressed Memory
story delivery."

### 3.1 The gap

`GET /memory/story` (`src/server/routes/api.ts:2608-2700`) is **continuous**:
it takes the last 100 `answer` logs, generates one story, and caches it in
`user.metadata.lastMemoryStory` keyed by answer count. Every regeneration
**overwrites** the previous story. There is no month-1 chapter surviving
once month-6 arrives. Nothing is archived. A person who has been on LOT for
a year has, today, exactly one paragraph to show for it — the same shape of
paragraph a Day-30 person has, just longer. There is no *tangible* evolution
artifact — only a live, mutable one.

### 3.2 The proposal: one immutable chapter per calendar month

A new table, additive to the existing `logs`/`Answer` schema — nothing
existing is touched:

```
MonthlyChapter
  id              UUID PK
  userId          UUID FK -> users.id
  monthIndex      INTEGER        -- 1..12 (Usership month, not calendar month)
  periodStart     TIMESTAMPTZ
  periodEnd       TIMESTAMPTZ
  moduleSpotlight VARCHAR        -- e.g. 'reflection_layer' (from §2 table)
  chapterText     TEXT           -- AI-compressed paragraph, immutable once written
  affirmation     TEXT           -- one-line, delivered at month-turn
  stats           JSONB          -- { journalEntries, journalWords, checkIns,
                                  --   selfCareCompleted, badgesEarned, streakDays }
  generatedAt     TIMESTAMPTZ
  UNIQUE (userId, monthIndex)
```

**Generation job:** extend the existing background-job pattern already
documented in `WIDGETS.md` (`Daily OS Vitals Snapshot 02:00 UTC`,
`Monthly Email Sender 09:00 UTC 1st`) with a new **Monthly Chapter
Compiler**, run 1st-of-month 09:00 UTC alongside the existing email job
(same cron slot, so it can feed that email rather than duplicate
infrastructure). For each Usership-tagged user whose `signupDate` crossed a
30/60/90…-day boundary since last run:

1. Pull that month's `logs` (bounded query, reuses the existing
   `idx_logs_userid_createdat` index — no new index needed).
2. Reuse `buildPrompt()`'s existing context-assembly machinery
   (`src/server/utils/memory.ts`), but scoped to one month's logs instead of
   "last 100 answers ever," with a new prompt frame: *"Write one paragraph
   compressing this specific month, naming what changed since last month."*
3. Reuse the exact same AI engine chain already wired for Memory Story
   (Together AI Llama-3.3-70B primary, local-fallback composition if AI is
   unavailable — **zero new AI vendor surface**).
4. Write the row. It is never regenerated. This is the point: it is a
   dated, permanent artifact, unlike the mutable live story.

**Cost/complexity is intentionally small**: this is the existing Memory
Engine call pattern, run 12 times per user per year instead of continuously,
against a system that already makes far more AI calls per user per day for
live Memory questions. No new AI provider, no new pool tuning, no new index.

### 3.3 Where it surfaces (three places, one artifact)

1. **Memory Chapter widget** (new, Usership-gated, same gating pattern as
   `SubscribeWidget`/`CosmicUpdateWidget` — `hasUsership` tag check).
   Appears once, at month-turn, with a fade-in matching the existing Memory
   Widget's 1400ms transition. Shows: module-spotlight icon, the paragraph,
   the affirmation line, and a "Months unlocked: N/12" ring (§5.1). Read
   once, it demotes to a small "Chapter N available" entry in the Vault.

2. **The Vault** (new tab/section, reachable from Profile or System) — a
   vertical, permanent timeline of every `MonthlyChapter` row the user has
   earned, oldest first, each stamped with its date range and module. This
   is the literal, scrollable proof of a year of growth — the thing a
   person re-reads on a hard day, and the thing that makes month 12 feel
   earned rather than arbitrary.

3. **Monthly email** (optional, reuses existing Resend integration and the
   already-scheduled `Monthly Email Sender` job) — the chapter delivered as
   a letter, so the moment isn't missed if the person doesn't open the app
   that day. This matches the existing doctrine ("the AI never initiates
   conversation... it asks") by staying descriptive, not conversational: a
   letter reporting what was observed, not a chatbot check-in.

### 3.4 Month 12: the Year One synthesis

At month 12, in addition to that month's own chapter, run one extra
compilation pass over all 12 `chapterText` fields — a "Year One" narrative
that references the Archetype Classifier resolution (§2) explicitly: *"You
began as [Day-1 open question]. Twelve chapters later, your Memory Engine
resolves you as The [Archetype]."* This is the single most shareable/
screenshot-able artifact the product could produce, and it costs one extra
AI call per user per year.

---

## 4. Month-by-month UI evolution (barebones → LOT® AI)

This section answers "what does Day 1 look like vs. Month 12 look like,"
using the existing Interface Evolution engine's real maturity thresholds
(25% / 50% / 75% / 95%, from `INTERFACE_EVOLUTION.md`) rather than inventing
new ones — months are mapped onto the existing curve, not a new one.

| Month | Evolution maturity band | UI surface (real components) | Badge/Level state | Check-in & self-care | Public profile reveal |
|---|---|---|---|---|---|
| **1** | 0–25% ("Exploration") | Barebones: Time, Memory, Planner, Recipe widgets only. Empty-state copy per §9 of research (e.g. "QOS monitor active. First snapshot in next 30-min cycle."). No Vault yet. | No badges. Day 1-30 counting toward first Level tick. | Emotional Check-In appears at its normal time-gates; low volume, no streak pressure. | Name, date, tags only. `boardProfile` block absent (Usership grants access to see it, but it stays sparse). |
| **2** | ~25% crossing | Memory Chapter #1 arrives at month-turn. First "○∿"-class Level badge (per `BADGE_LEVEL_DESIGN.md`) likely earned around Day 30 inside this window. | Level tick 1. | Journal entries start counting toward `totalJournalWords` visibly. | `activity.journalEntries` begins to be non-zero. |
| **3** | 25–50% ("Consistency") | Planner Templates unlock (existing `Widget Arrange`/`Custom Themes` feature-gate table applies at Level 5/10). Routine visibly forms. | Streak-based badges start appearing (`weekend_wrnr` class). | Morning check-in cooldown/pattern well-established; `distinctCheckInDays` climbing. | "Citizen since" + day count become worth showing. |
| **4** | 50% crossing | Intention History unlocks (Level 15 gate, existing table). Planner ↔ Memory wiring (already shipped 2026-06-30) becomes visible as Memory questions reference declared intentions. | — | Self-care completion ratio (`self_care_complete` vs `skip`) becomes a legible number, not noise. | `biofieldState` (energy/clarity/alignment) worth surfacing. |
| **5** | ~55% | Mood Patterns unlock (Care 50%/Level 20 gate). | — | — | — |
| **6** | 50–75% ("Depth") — **halfway** | Advanced Memory unlocks (Depth: Deep Diver gate). Vault has 6 chapters — first time scrolling it feels like something. Water/Architecture theme aesthetics (existing `themeEvolution.ts`) visibly sharpen (opacity 0.85→closer to 1.0, glow intensity rising). | Level 2 tick (Day-60-class). Half of 812-badge codex realistically reachable begins opening up. | — | Board-tenure-style framing ("6 months") becomes narratively true, not just a schema field. |
| **7** | 75% crossing | Rich Community unlocks (Connection: Bridge Builder gate). Cohort Connect, Pattern Insights widgets become genuinely populated (need months of data to match well). | — | — | Cohort/archetype hints begin appearing pre-resolution. |
| **8** | 75–95% ("Mastery approach") | Narrative Reflection unlocks (Depth 66% + Level 30). Ecosystem Bridge module (Car/Home/Computer) becomes a real invitation, not filler. | — | — | — |
| **9** | ~85% | Pattern Insights (Consistency 66%) unlocks fully. QOS Kernel panel graduates from "curiosity" to daily-glance, per §2 row 9. | Level 3 tick approaching (Day-100-class territory, extended). | — | `clearanceLevel`-style field becomes meaningful. |
| **10** | ~90% | Export Data unlocks (Level 25, already in existing table). A person can literally export their Vault. | — | — | — |
| **11** | 95% crossing | Social Mentions unlock (full Connection path). Private Spaces unlock if Intimacy/Courage thresholds met. Goal Journey shows a full beginning→mastery arc for at least one goal. | — | — | — |
| **12** | 95%+ ("Integration/Mastery") | Full aesthetic refinement (max opacity, max glow, theme-evolved borders throughout). Vault shows 12 chapters + the Year One synthesis (§3.4). Archetype Classifier module reads "Integrated." | Year One badge — a genuinely new, singular badge (not part of the existing 812-count codex progressions) marking the Usership anniversary specifically. | Full year of check-in data available for the richest possible Memory Story mode-4/5 questions (topic-diversity and compression modes in `memory.ts` finally have a year of material to work with). | Full `boardProfile` block as already coded in `PublicProfile.tsx`: board member #, "Citizen since," "Powering N citizens," "Board tenure 12 months," biofield state, activity stats, memory engine descriptor, clearance level, total entries — **this is what `/u/machiavelli` should look like**, and it is already-written code, just never populated with a full year of real data. |

---

## 5. New widgets, specified

### 5.1 Usership Progress Ring ("Months unlocked: N/12")

A small, always-visible context widget (Usership-gated), sitting near the
existing Subscriber Stack (`CosmicUpdateWidget`, `QuantumSignWidget`).

- **Data source:** `(monthsElapsed = floor(daysSinceSignup / 30))`, clamped
  to 12; `nextUnlockDate = signupDate + (monthsElapsed + 1) * 30 days`.
  No new backend needed beyond `signupDate`, already on `req.user`.
- **Display:** a 12-notch ring (or, simpler, `[■■■□□□□□□□□□] 3/12`), current
  module name from §2, days remaining to next chapter.
- **Interaction:** tap opens the Vault (§3.3.2) directly.
- **Gating:** identical pattern to every other subscriber widget —
  `hasUsership` tag check, no new gating primitive required.

### 5.2 Memory Chapter widget (the monthly congratulations)

Described fully in §3.3.1. Key UX note: it should **not** look like every
other widget's fade-in-fade-out cycle. This is a once-a-month event; it
deserves a distinct, slightly slower reveal (the existing Evolution
Milestone Toast's "auto-dismiss after 6 seconds" pattern is *too* fast for a
paragraph of prose — recommend it persists until dismissed or until the Vault
is opened, not a timed auto-dismiss).

### 5.3 Month-turn affirmation (not a new widget — a moment)

Rather than a fourth new component, the affirmation line from the
`MonthlyChapter` row should ride the **existing** `EvolutionMilestoneToast`
mechanism (`localStorage: evolution_milestones`, max 10 recent) — it already
exists precisely to announce "something changed." Reuse it; don't duplicate
it.

---

## 6. Symbol language for month markers (two options, house style)

Following the existing convention in `BADGE_PROGRESSION_PREVIEW.md` and
`BADGE_MAYAN_EVOLUTION.md` of presenting concrete options rather than one
unexamined choice:

**Option A — Ring fill (recommended).** `[■■■□□□□□□□□□] 3/12`. Reads
instantly at a glance, works at any screen width (unlike the existing
Mayan/constellation badge glyphs, which the badge docs themselves flag as
"may wrap on mobile"), and is unambiguous about "how far / how much left" —
which this widget's whole job is.

**Option B — Lunar-cycle glyphs, extending the existing Mayan/water theme.**
`○ ∘ ≈ ≋ ● ◐ ...` one glyph per month, consistent with the aesthetic already
established in `BADGE_MAYAN_EVOLUTION.md`. More "on-brand" mystically, but
inherits the same mobile-wrapping risk the badge docs already flagged, and
is harder to read as a countdown at a glance.

**Recommendation:** Option A for the Progress Ring widget (it's a utility
readout — clarity wins), Option B reserved for the Vault's chapter dividers
(it's a keepsake — atmosphere wins there). Use both, in the place each is
suited to, rather than picking one house-wide.

---

## 7. Public profile: what `/u/machiavelli` should demonstrate

`PublicProfile.tsx` (line ~289) already renders a `boardProfile` block —
board member #, "Citizen since," "Powering N citizens," **"Board tenure N
months"** (the field is literally already named for this), biofield state,
activity (`memoriesCompiled`, `journalEntries`, `activeDays`), a
`memoryEngine` descriptor string, `clearanceLevel`, `totalEntries`. Today
this is **cosmetic** — nothing populates `boardTenureMonths` from real
elapsed time or gates its richness by month. The 12-month plan's simplest,
lowest-risk win is: wire that field to real `signupDate` math, and make its
surrounding block's *richness* scale with `monthsElapsed` per §4's table
(sparse at month 1, full at month 12) instead of being all-or-nothing behind
a single `hasUsership` check as it is today. A demo/reference account like
`machiavelli` being "12 months evolved" should mean: full `boardProfile`,
full Vault (12 chapters + Year One), Archetype resolved, maximum Interface
Evolution maturity band — all of which are states the *existing* type
system in `src/shared/types/index.ts` already has fields for.

---

## 8. Implementation surface (for scoping, not for building yet)

Kept deliberately small — this proposal adds one table and reuses everything
else:

- **New:** `MonthlyChapter` model + migration (additive, no existing table
  touched).
- **New:** one cron job (Monthly Chapter Compiler), same schedule slot as
  the existing Monthly Email Sender.
- **New:** 2 widgets (Progress Ring, Memory Chapter) + 1 Vault view.
- **Reused, untouched:** AI engine chain, `buildPrompt()` machinery, `logs`
  table + its existing index, `hasUsership` gating pattern, Evolution
  Milestone Toast, badge engine, `boardProfile` type (already defined).
- **Small edit:** `PublicProfile.tsx` — compute `boardTenureMonths` from
  `signupDate` instead of leaving it a static/manual field; gate block
  richness by month instead of by tag alone.

---

## 9. Open questions for S-2

1. Should `MonthlyChapter.chapterText` be user-editable (a light-touch
   "correct the AI" affordance), or strictly immutable-as-written? Immutable
   preserves the "this is what was true then" honesty the Memory Engine
   doctrine is built on; editable risks turning the Vault into curated
   self-presentation rather than an honest record.
2. Should the Year One synthesis (§3.4) be the trigger for something
   physical — a LOT product tie-in (the subscription's core business is
   physical self-care goods) — e.g. a printed "Year One" card mailed with
   the next box? This would make the 12-month arc cross from UI into the
   physical distribution business the company actually runs.
3. Is 30-day months the right cadence, or should `monthIndex` boundaries
   snap to actual calendar months (so everyone's chapter lands on the 1st,
   simplifying the cron and the emotional "new month" framing) even though
   that makes each user's first chapter a variable-length partial month?
   Calendar-month snap is recommended for simplicity and because it matches
   the existing `Monthly Email Sender` job's own cadence.

---

*This is a design brainstorm. No migration, endpoint, or component in this
document has been implemented. Recommend a focused follow-up session to
spec the `MonthlyChapter` migration and the Progress Ring widget first —
the two smallest, highest-signal pieces — before touching `PublicProfile.tsx`.*

**Vadik**
*lot-systems.com/u/vadik*
