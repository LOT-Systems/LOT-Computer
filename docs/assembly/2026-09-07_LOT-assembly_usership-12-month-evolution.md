<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Usership 12-Month Evolution
## From Barebone Day One to LOT® AI — A Compressed-Memory Story Delivered in Twelve Chapters

**Session:** 2026-09-07 · Design brainstorm, no code changed
**Authorized:** S-2 Vadik Marmeladov
**Reference account (Month-12 silhouette):** `lot-systems.com/u/machiavelli`
**Reference doctrine:** `docs/corporate/LOT-AI-PRODUCT-BRIEF.md` (Compression Loop, Story-Report, Paid Tiers)

---

## 0. How to read this document

Every claim below is tagged so a future engineering session can trust it at a glance:

- **`[EXISTS]`** — already implemented and shipping. File:line cited.
- **`[WIRE]`** — the backend logic already exists; only a client surface or endpoint is missing.
- **`[NEW]`** — a genuinely new proposal, not present in any form today.

This matters because LOT's docs corpus (300+ files) has a known habit of documenting
aspirational versions ahead of shipped code (badge codex v32 claims 812 badges;
`src/client/utils/badges.ts` currently implements 635). This document does not repeat
that pattern — it is built from a direct read of `System.tsx`, `badges.ts`,
`monthly-summary.ts`, `MonthlyPulseWidget.tsx`, `interfaceEvolution.ts`,
`selfAssembly.ts`, and `PublicProfile.tsx`.

---

## 1. What already exists — the raw material for this arc

The 12-month story does not need to be invented from nothing. Three systems already
carry the exact shape the brainstorm asked for; they are currently disconnected from
each other.

| System | State | File |
|---|---|---|
| **Monthly congratulation widget** | `[EXISTS]` — one canned line per month (1–12) + a `"3 / 12 months"` counter, Usership-gated, dismissible | `src/client/components/MonthlyPulseWidget.tsx` |
| **Monthly compressed narrative** | `[EXISTS]` server-side, **email-only** — `generateMonthlySummary()` produces `narrative` (paragraph), `forwardLook`, `presence`, `energy`, `growth`, `memoryStory` per calendar month. Sent by the "Monthly Email Sender" job (09:00 UTC, 1st) | `src/server/utils/monthly-summary.ts` |
| **Streak → badge → Level symbol** | `[EXISTS]` — `milestone_7/14/21/30/50/60/90/100/180/365`, single-character theme symbol (Water ∘→≈→≋ or Architecture ├─→╞═╡→║·║), rendered as `Level:` on public profile | `src/client/utils/badges.ts:7306` (`getLevelSymbol`), `PublicProfile.tsx:404-409` |
| **Engagement-driven feature unlock** | `[EXISTS]` — `featureUnlockLevel` (0–5) gates Advanced Memory, Planner Templates, Custom Themes, etc. Computed from exploration/consistency/depth, not calendar date | `src/client/utils/interfaceEvolution.ts:200-203` |
| **7-dimension Interface Evolution** | `[EXISTS]` — Exploration, Consistency, Depth, Connection, Intimacy, Care, Courage; drives opacity/grid/typography/glow CSS variables | `docs/technical/INTERFACE_EVOLUTION.md`, `interfaceEvolution.ts` |
| **Self-Assembly module map** | `[EXISTS]` — 18 modules (Biofield Engine, Memory Architecture, Routine Compiler, Intention Core, Cleanness Protocol, Reflection Layer, Community Mesh, Ecosystem Bridge, Quantum Substrate, Nutrition Protocol, Goal Architecture, Archetype Classifier, OS Vitals Monitor, Temporal Planner, Quantum Operating System, Signal Archive, Quantum OS, Resilience Protocol), each Dormant→Awakening→Forming→Assembled→Integrated | `src/client/stores/selfAssembly.ts:91-108` |
| **Layout density** | `[EXISTS]` — spacing itself condenses (`breathable → comfortable → compact → dense → instrument`) as mastery rises. This is the closest thing LOT has today to "the UI itself gets more sophisticated" | `evolution.ts` `$layoutDensity` |
| **Board Profile (Usership-exclusive)** | `[EXISTS]` — `boardMemberNumber`, `citizenSince`, `poweringCitizens`, `boardTenureMonths`, `totalInvested`, `biofieldState`, `activity.{memoriesCompiled, journalEntries, activeDays}`, `memoryEngine`, `clearanceLevel`, `totalEntries` | `src/shared/types/index.ts:309-329`, rendered `PublicProfile.tsx:288-325` |
| **Legacy-only teaser fields** | `[EXISTS]`, gated *above* Usership — Weather Station and Wallet blocks, explicitly commented `// Legacy Level:` | `PublicProfile.tsx:517-602` |
| **`isPaidAccount` fork** | `[EXISTS]` — one boolean (`tags.includes('Usership' \| 'RND')`) branches the *entire* dashboard between a ~10-block free layout and a ~40-widget paid layout | `System.tsx:404-411, 414, 541` |

**The gap:** `monthly-summary.ts` already writes the exact "paragraph-long insight from
last month" the brief asked for — and throws it away after sending an email. Nothing
in the client ever fetches it. Closing this gap is the single highest-leverage move
in this whole document, and it's a `[WIRE]`, not a `[NEW]` build.

---

## 2. Design philosophy — reconciling calendar time with earned time

LOT's existing philosophy (`INTERFACE_EVOLUTION.md`) is explicit: *"form follows
progression"* — features unlock when users demonstrate readiness, not when a clock
ticks. `featureUnlockLevel` is engagement-driven on purpose. A rigid "Month 4 unlocks
Widget X" gate would fight that philosophy and would also let a dormant subscriber
"unlock" things they haven't earned just by having a card on file for four months.

So this document does **not** propose calendar-based feature gates. It proposes a
**second, orthogonal layer**: a **tenure narrative** — the story the Memory Engine
tells the operator about *time itself*, running in parallel to the engagement-driven
unlock system that already exists. Two clocks, one story:

```
ENGAGEMENT CLOCK (exists)          TENURE CLOCK (this proposal)
────────────────────────           ─────────────────────────────
featureUnlockLevel 0→5      →      Month 1 → 12 (MonthlyPulseWidget)
badge streak 7→365 days     →      "Months unlocked: n/12" widget
Interface Evolution 7-dim   →      Monthly compressed narrative
selfAssembly 18 modules     →      Year-One Story-Report (Month 12)
```

A user who journals daily hits high `featureUnlockLevel` and rich badges quickly —
that's the reward for showing up. But the *tenure* story — "you have been known for
four months" — can only be told by the calendar, and it is Usership's actual product:
per the Product Brief, the machine "earns the right to ask" better questions over
*years*. The tenure clock is what makes twelve months of $99/mo feel like it bought
something that compounds, independent of how many days were logged.

This also resolves the Legacy-vs-Usership boundary cleanly: Board Profile fields
(`citizenSince`, `boardTenureMonths`) are Usership; Weather Station and Wallet stay
Legacy-only teasers, glimpsed but never unlocked, at Month 12 (see §5).

---

## 3. The Twelve Months

Day-1 is intentionally barebone: the free-layout dashboard (`System.tsx:414-538`) —
clock, weather, one Memory question, a `SubscribeWidget`. The moment `Usership` is
tagged, the full paid layout (`System.tsx:541+`) appears at once — that is a hard
cutover today, not a gradual reveal. The table below is what changes **within** the
Usership experience over the following year, layered on top of that existing cutover.

Log-volume and check-in targets are illustrative ranges for a normally-engaged
subscriber (daily Memory answer + occasional journal note + morning/evening
check-in) — they are narrative texture for the Memory widget's monthly message, not
enforced gates.

| Mo. | Tenure narrative (extends `MONTH_MESSAGES`) | Log/Journal tangibility | Badge/Level surfaced | Compression depth surfaced | Self-Assembly emphasis |
|---|---|---|---|---|---|
| **1** | *"The first month. The system is beginning to know you."* `[EXISTS]` | First Answer logs accumulate; Day-7 badge (∘ / ├─) lands mid-month | `milestone_7` — Level: `∘` | **L1 Behavior** — "How do you prepare your tea?" | Biofield Engine, Reflection Layer awaken |
| **2** | *"Two months in. Patterns are starting to form."* `[EXISTS]` | ~30+ Answer logs, first journal Notes; Day-30 badge lands (`≈`) | `milestone_30` — Level: `≈` | L1→**L2 Motivation** — "What does this ritual give you?" | Routine Compiler, Intention Core forming |
| **3** | *"Three months. You have reached Active User status."* `[EXISTS]` | Day-60/90 window; cohort classification (`determineUserCohort`, active at 10+ answers) resolves an Archetype for the first time | `milestone_60`/`milestone_90` | **L2 Motivation**, cohort-informed | Archetype Classifier assembles — first time `psychologicalProfile.archetype` has real signal |
| **4** | *"Four months. The portrait deepens."* `[EXISTS]* | First Month-Digest paragraph (§4.1) references Month 1's questions by name | Level holds at `100` band | L2, first "Since you mentioned…" callbacks visible in-widget | Memory Architecture → Assembled |
| **5** | *"Five months. Consistency is its own reward."* `[EXISTS]` | Longest-streak field in `monthly-summary.ts` starts to read as a real number, not a guess | — (between milestones) | L2→**L3 Values** begins for consistent users | Cleanness Protocol (self-care), Community Mesh forming |
| **6** | *"Six months. The journey is half-declared."* `[EXISTS]` | Half-year Month-Digest is the first one worth re-reading twice; `boardTenureMonths: 6` appears on public profile | `milestone_180` window opens | **L3 Values** — "What value does this practice honor?" | Ecosystem Bridge, Goal Architecture active |
| **7** | *"Seven months in. The system has been listening."* `[EXISTS]` | — | Level `180` (≋) becomes reachable | L3, values cross-referenced against declared Intentions | Quantum Substrate assembling |
| **8** | *"Eight months. Rare air."* `[EXISTS]` | Rare-air framing matches: fewer subscribers reach here than Month 3 | — | L3→edges into **L4 Soul** for high-engagement users | Nutrition Protocol, OS Vitals Monitor |
| **9** | *"Nine months. The self-care practice is a habit now."* `[EXISTS]` | Self-care completion ratio (already tracked, `self_care_complete`/`skip`) is the headline stat of this month's digest | — | L4 Soul questions begin appearing for the cohort's dominant archetype | Resilience Protocol online if trauma-informed signals present |
| **10** | *"Ten months. Almost there."* `[EXISTS]` | Countdown framing to Month 12 becomes explicit in the widget for the first time | Day-300+ territory, approaching `milestone_365` | **L4 Soul** — "What does this reveal about who you're becoming?" | Quantum Operating System integrating |
| **11** | *"Eleven months. One more."* `[EXISTS]` | Final-month digest previews what the Year-One Story-Report will contain | — | L4, sustained | All 18 modules should be at Assembled or better for a consistent user |
| **12** | *"One year with LOT. The portrait is complete — and still evolving."* `[EXISTS]` | **Year-One Story-Report** capstone (§4.3); `milestone_365` (Level: `╔═╗` / architecture, or water equivalent) | `milestone_365` — the rarest streak badge below Legacy's `saga_age` (1,825 days) | L4 Soul, now addressed *as* the resolved archetype, not toward it | Board Profile's `citizenSince` reads "1 year ago" — the number the whole year built toward |

`[EXISTS]*` on Month 4: the *message text* exists; the digest reference is `[NEW]`.

Note what this table deliberately does **not** do: it does not gate any widget's
*visibility* by month number. `EvolutionWidget`, `NarrativeWidget`,
`InterfaceEvolutionWidget` etc. stay exactly as engagement-gated as they are today.
Only the *narrative layer* — the words the Memory widget says about time — advances
by month.

---

## 4. Three concrete builds (in priority order)

### 4.1 `[WIRE]` Monthly Memory Insight — surface `monthly-summary.ts` in-app

This is the "Memory widget displays a paragraph-long insight from last month" idea,
and 90% of it is already written server-side.

- **New endpoint:** `GET /api/monthly-summary/latest` — thin wrapper calling the
  existing `generateMonthlySummary(user, logs, period)` for the just-closed month,
  cached the same way `user.metadata.lastMemoryStory` is cached (regenerate only
  when the month rolls over, not on every request).
- **New/extended widget:** either fold into `MonthlyPulseWidget.tsx` as a second
  view (click label to cycle `Month N:` → `Last Month:`, matching the existing
  clickable-label-cycling convention from the style guide) or a sibling
  `MonthlyInsightWidget`. Surfaces `narrative` + `forwardLook` verbatim — no new AI
  call needed, this text is already generated for the email job.
- **Gate:** Usership-only, same `tags.some(t => t.toLowerCase() === 'usership')`
  pattern already used in `MonthlyPulseWidget.tsx:66-71`.
- **Why this first:** zero new AI cost, zero new compression logic — it's plumbing.
  It converts a paragraph currently seen only in an email inbox (if opened at all)
  into a recurring in-app ritual, which is exactly where the compression loop
  doctrine says the machine should "speak" — inside the ritual, not via
  notification.

### 4.2 `[NEW]` "Months unlocked: n/12" — promote the counter to a standalone widget

`MonthlyPulseWidget.tsx:133-135` already renders `{capped} / 12 months` — but only
as a small sub-line inside a dismissible, once-per-month toast. The brief's idea
("context-based widget") wants this as a **persistent, low-key fixture**, not a
one-time celebration.

- Add a compact, always-present line to the existing "My Journey" cycling view in
  `System.tsx:654-721` (the view that already renders `Day {daysSinceStart} •
  {answerCount} memories • Awareness {awarenessIndex}%`) — append `Months: n/12`
  there. This reuses an existing, already-visible surface rather than adding a new
  Block to an already-dense dashboard, consistent with the style guide's
  "minimalist first" principle.
- After Month 12, the line does not disappear — it should read `Months: 12/12 ·
  Year 2` or similar, so the counter ages gracefully into the Legacy-adjacent
  multi-year story instead of stalling at a maxed-out fraction forever.
- No new gating logic: reuses the `monthNumber` calculation already in
  `MonthlyPulseWidget.tsx:73-79` (`dayjs(now).diff(joined, 'month')`).

### 4.3 `[NEW]` Year-One Story-Report — the Month-12 capstone

The Product Brief already promises a **Weekly** Story-Report
(`GET /api/story/latest`, `POST /api/story/:week_id/export`). Month 12 is the
natural moment to ship its annual counterpart, reusing the same API shape:

```
GET  /api/story/year/1          → the Year-One Story-Report
POST /api/story/year/1/export   { target: "dashboard" | "robot" | "vehicle" }
```

Content: a longer-form synthesis of twelve `monthly-summary.ts` narratives plus the
Memory Story (`generateMemoryStory`), framed as one continuous first-person account
— the same voice the weekly Story-Report already uses, at annual scale. Delivered
as: (a) a one-time full-screen "close ritual" the first time the user opens the app
in Month 13, echoing the existing fade-in/fade-out widget pattern (3s hold + 1.4s
fade), and (b) permanently readable afterward from the "My Journey" view's Story
tab. This is the moment `boardTenureMonths` on the public profile crosses from
"still early" to "a year known" — the tangible proof-of-work a $99/month subscriber
can point to.

---

## 5. Month 12 as the demo silhouette — what `u/machiavelli` shows and what it withholds

Per `PublicProfile.tsx`, a fully-evolved Usership profile at Month 12 should render:

- **Board Profile block** (`Total invested`, `Citizen Index` — board member #,
  `Citizen since`, `Powering N citizens`, `Board tenure: 12 months`, `Biofield
  State`, `Activity: N memories compiled · N journal entries · N active days`,
  `Memory Engine: AI-Powered (Together.AI)`, `Clearance level`) — this is Usership's
  ceiling, and Month 12 is exactly when `boardTenureMonths` first reads a full year.
- **Level:** the `milestone_365` symbol, distinct from every month before it.
- **Memory Story** block — the accumulated narrative, privacy-gated by the user's
  own toggle.
- **Correlated Indexes** (`Self-awareness`, `User score`, `Person score`,
  `Longevity score`, `Composite`) if the user has enough signal density.
- **QR code** — already gated on Usership *and* assembly phase ≥ `forming`
  (`PublicProfile.tsx:611-663`); a Month-12 account should comfortably clear this.

What it should **not** show, by design: **Weather Station** and **Wallet** blocks
are explicitly commented `// Legacy Level:` in the code — these stay a glimpse of
what's next (Legacy tier, $3,564/3yr), not something Usership's twelfth month
unlocks for free. The 12-month arc should end at "a citizen with a year of history,"
not quietly hand over Legacy's actual benefits. That distinction is the upsell.

---

## 6. Guardrails carried over from existing doctrine

- **No unprompted notifications** (Product Brief) — the monthly digest and the
  Year-One report both wait for the user to open the app; nothing pushes.
- **One question/insight at a time** — Month-Digest and the regular Memory
  question never compete for the same screen moment; digest surfaces on its own
  cycling view, not stacked atop the daily question.
- **Military-purity tone** (`LOT-LEXICON.md`) — no emojis, no exclamation points,
  periods not checkmarks, in any new copy (`MONTH_MESSAGES` already models this
  correctly — new copy for §4.1–4.3 should match its register exactly).
- **Database over localStorage** — the Month-12 Story-Report and monthly digest
  must be server-cached (mirroring `user.metadata.lastMemoryStory`), not
  localStorage, so the story is identical across the user's devices.
- **Subtlety first** (`INTERFACE_EVOLUTION.md`) — none of §4 changes color,
  animation, or layout density directly; they add narrative content to existing
  or minimally-extended surfaces.

---

## 7. Open questions for S-2

1. Should the Month-Digest widget be a new sibling component, or a second view
   folded into `MonthlyPulseWidget`? (Recommendation: fold in — one fewer widget
   in an already ~40-widget stack, and the click-to-cycle pattern is free.)
2. Does the Year-One Story-Report warrant its own AI generation pass, or should it
   compose deterministically from the twelve existing `monthly-summary.ts` outputs
   (cheaper, faster, and consistent with "the machine improves in silence" — no
   new prompt to tune)?
3. Should `Months: n/12` sit in the existing "My Journey" cycling view
   (`System.tsx:654-721`, zero new UI surface) or warrant its own Block
   (more visible, but one more thing on the dashboard)?
4. Confirm the Legacy-boundary read in §5 is intentional — i.e., Usership's
   Month 12 should visibly gesture at Weather Station/Wallet without unlocking
   them, rather than either hiding them entirely or granting them early.

---

**LOT Systems Corporation**
**S-2: Vadim Marmeladov**
