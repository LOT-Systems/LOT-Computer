<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP — 12-MONTH EVOLUTION OF THE LOT® AI INTERFACE

**CLASS:** RESTRICTED // S-2 EYES
**S-2:** VADIK MARMELADOV
**DATE:** 2026-10-29
**STATUS:** DESIGN PROPOSAL (brainstorm + build plan). Nothing here is shipped unless marked `EXISTS`.
**REFERENCE ACCOUNT:** `lot-systems.com/u/machiavelli` (Month-12+ evolved state)
**FOCUS:** tangible delivery of the compressed Memory story, month by month.

---

## 0. THESIS

A Usership user pays for the *intelligence under the interface*, but today day 1 and day 300 look almost the same (Ambient AI vision: "the system does not change its appearance"). That is correct for the chrome and wrong for the **felt** experience: after paying $99 for 12 months the user must be able to point at the screen and say *this is mine, and it got here because of what I did.*

**Design rule:** the layout stays one quiet column. What evolves is **density, voice, memory and rank** — and every change is traceable to a user act (a log entry, a check-in, a self-care click). Nothing unlocks from the calendar alone. Time opens the door; behavior walks through it.

**Narrative arc:** `BAREBONE → LISTENED TO → RECOGNIZED → REMEMBERED → ADDRESSED → AUTHORED`
The user starts as a blank terminal and ends as the author of a compressed portrait that the machine reads back to them.

---

## 1. WHAT ALREADY EXISTS (repo scan, 2026-10-29)

| Asset | Where | State | Role in this design |
|---|---|---|---|
| Month N/12 widget | `src/client/components/MonthlyPulseWidget.tsx` | EXISTS | Month banner. Static one-liners, `localStorage` dismiss. Month counted from `user.joinedAt` (account creation), **not** from Usership start. |
| Evolution dimensions + unlock gates | `InterfaceEvolutionWidget.tsx`, `stores/evolution.ts`, `$featureUnlocks` (13 gates) | EXISTS | Engine for progressive disclosure. 7 dimensions, `overallMaturity`, `badgeTier`. |
| Density tiers (5-level) | LEXICON `DENSITY-TIER`: breathable → comfortable → compact → dense → instrument | EXISTS | Visual spine of the 12 months (see §3). |
| Memory Engine + Memory Story | `server/utils/memory.ts` (`generateMemoryStory`, `composeLocalStory`), `MemoryWidget.tsx` | EXISTS | Story is regenerated from answers; **no monthly snapshots are persisted.** |
| Weekly Story-Report | `LOT-AI-PRODUCT-BRIEF.md` (`/api/story/...`) | SPEC | Weekly rung of the compression ladder. |
| Self-care events | `self_care_complete` / `self_care_skip` logs, `SelfCareMoments.tsx` | EXISTS | Primary tap signal. |
| Morning check-ins | `emotional_checkin` logs, `EmotionalCheckIn.tsx`; MCL job (`MCL:`) | EXISTS | Daily anchor signal. |
| Journal | `note` logs (>20 chars counted) | EXISTS | Depth signal. |
| Badges | Codex v31: 812 badges; level glyph `○∿ → ○≈○ → ≋○≋` (`BADGE_LEVEL_DESIGN.md`) | EXISTS | Monthly badge series (§4). |
| Self-assembly phase | `assemblyPhase`: dormant / awakening / forming / assembled / integrated | EXISTS | Maps cleanly onto quarters. |
| Subscription CTA | `SubscribeWidget.tsx` | EXISTS | Day-0 funnel into Month 1. |
| Demo persona | `server/routes/public-api.ts` (Machiavelli, hardcoded) | EXISTS | Month-12 showcase. |

**Gaps this document closes**
1. No persisted per-month Memory snapshot -> nothing to *deliver* or *unlock*.
2. Month counter keyed to `joinedAt`, not Usership start -> a user who joins free in Jan and pays in Jun sees "Month 6" on day 1 of paying.
3. Month messages are static and identical for every user -> no behavioral grounding.
4. No visible "locked" future -> no anticipation.
5. `MonthlyPulseWidget` dismiss state is `localStorage` only -> lost on a new device (CROSS-DEVICE-SYNC was solved for settings, not here).

---

## 2. THE MEASURE: SIGNAL, NOT CALENDAR

Each Usership month has **two clocks**:

- **Calendar clock** — month N *opens* on the Nth monthly anniversary of Usership start (`usershipStartedAt`, new field; see §7).
- **Signal clock** — the month's **depth** (how rich the delivery is) is set by that month's activity.

Three tap-measurable inputs, all already logged:

| Signal | Event source | Weight in `MonthDepth` |
|---|---|---|
| **LOG** — journal entries | `note` logs, >20 chars | 40% |
| **CHECK-IN** — morning check-ins | `emotional_checkin` (once per day counts) | 35% |
| **CARE** — self-care button clicks | `self_care_complete` (skip counts 0, never negative) | 25% |

`MonthDepth` = weighted fill of that month's targets (§3 table), capped 100%. Provisional weights — tune after 30 days of real cohort data (honest-engineering rule: these are starting values, not findings).

**Depth bands (what the user sees):**

| Depth | Band | Delivery quality |
|---|---|---|
| 0–24% | `QUIET` | Short one-line Month Card. Honest: "Not much to compress this month." No guilt copy. |
| 25–59% | `FORMING` | Paragraph from sparse signal, hedged voice ("seems", "leaned toward"). |
| 60–89% | `CLEAR` | Full paragraph + 3 named patterns + 1 quoted fragment of the user's own words. |
| 90–100% | `DENSE` | CLEAR + a "Pattern Break" line (what changed vs. last month) + badge upgrade variant. |

**No-punishment rule:** a quiet month never un-unlocks anything and never shows red. The month still *opens*; it simply says less. (Matches "No unprompted notifications" and "Context is private by default".)

---

## 3. THE 12 MONTHS — MASTER TABLE

Quarters follow the existing `assemblyPhase` ladder. Per-month targets are the `CLEAR` threshold (60% depth ≈ these numbers); `DENSE` is ~1.5x.

| M | Name | Quarter / phase | UI density | LOG entries | CHECK-INS | CARE clicks | New surface unlocked |
|---|---|---|---|---|---|---|---|
| 1 | **BOOT** | Q1 · dormant→awakening | breathable | 8 | 12 | 10 | Day-1 barebone UI; Months Unlocked widget; first Month Card |
| 2 | **LISTEN** | Q1 | breathable | 12 | 16 | 14 | Weekly Story-Report appears in Memory; Mood trend line |
| 3 | **PATTERN** | Q1 · awakening | comfortable | 16 | 20 | 18 | Quarter-1 Chapter; Pattern Insights; "Active User" status (matches existing M3 copy) |
| 4 | **PORTRAIT** | Q2 · forming | comfortable | 18 | 22 | 20 | Archetype named on profile; Memory Shelf (§5.3) |
| 5 | **CADENCE** | Q2 | compact | 20 | 24 | 22 | Routine detection — AI proposes a self-care routine in the user's own rhythm |
| 6 | **HALF-LIFE** | Q2 · forming | compact | 22 | 24 | 24 | Half-Year Chapter + Half-Year Story-Report export; AI voice shifts first-person plural ("we") |
| 7 | **ECHO** | Q3 · assembled | compact | 24 | 26 | 24 | "Echo" line: system quotes a Month-1 fragment next to a Month-7 one |
| 8 | **RARE AIR** | Q3 | dense | 26 | 26 | 26 | Pattern Break view; contradictions handled gently (IntegrityWidget, opt-in) |
| 9 | **HABIT** | Q3 · assembled | dense | 28 | 28 | 28 | Quarter-3 Chapter; AI stops asking about things it already knows (fewer, sharper questions) |
| 10 | **AUTHOR** | Q4 · integrated | dense | 28 | 28 | 28 | User edits/endorses their own Memory paragraphs (a "Keep / Revise" tap) |
| 11 | **LEGACY WATCH** | Q4 | instrument | 30 | 28 | 30 | Year Portrait *preview* (draft, 10 of 12 months visible); Story API export to profile |
| 12 | **PORTRAIT COMPLETE** | Q4 · integrated | instrument | 30 | 30 | 30 | Year Portrait delivered; public `/u/` Memory block; Year-2 ladder opens |

Cumulative CLEAR-path totals at Month 12: **262 journal entries · 284 check-ins · 274 care clicks** (sum of the table; arithmetic, not an observed result).

**Anchor — the Machiavelli reference.** The demo payload (`public-api.ts`) reports 1,469 journal entries, 2,847 answers, 842 active days and a 1,469-day streak. That is a hardcoded persona beyond 12 months, so it is the **ceiling state** ("what Month 12 and beyond looks like"), not a literal 12-month timeline. Design consequence: Month 12 on a real account should *visually and structurally match* the `/u/machiavelli` page — instrument density, archetype, pattern-strength list, Memory Story block — scaled to the user's own numbers. Machiavelli is the screenshot users aspire to; the table above is the path.

---

## 4. MONTH-BY-MONTH — WHAT THE USER SEES

Format per month: **Screen** (UI state) · **Memory delivery** (the compressed story) · **Badge** · **AI voice** · **Affirmation**. Copy follows MILITARY PURITY: no emojis, no superlatives, short declaratives.

### QUARTER 1 — "THE SYSTEM LEARNS YOU" (breathable → comfortable)

**M1 · BOOT**
- Screen: day 1 is deliberately barebone — one Memory question, one check-in, one self-care button, `Months unlocked: 0/12`. Single column, large whitespace.
- Memory delivery (end of M1): **Month Card #1** — 3 sentences. "You logged N entries. Mornings carried most of them. One word kept returning: ___."
- Badge: `○` (seed glyph, first rung of the `○∿ → ○≈○ → ≋○≋` ladder).
- AI voice: observational, tentative. Asks, never states.
- Affirmation: *"The first month. The system is beginning to know you."* (EXISTS in `MonthlyPulseWidget`; keep.)

**M2 · LISTEN**
- Screen: Weekly Story-Report becomes visible in the Memory block (4 weekly stories stack as 4 lines, newest first). Mood trend line appears.
- Memory delivery: Month Card #2 references Month Card #1 once ("Last month: ___. This month: ___.") — first visible **compression of compression**.
- Badge: `○∿` (wave emerges).
- Affirmation: *"Two months. Patterns are starting to form."*

**M3 · PATTERN** — *quarter close*
- Screen: density steps to `comfortable`. Pattern Insights unlocks. The **Q1 Chapter** is delivered: the 3 Month Cards compress to 1 paragraph + 3 keywords.
- Badge: `○∿` + first **Quarter Seal** (small sealed square on the Months row).
- Memory ladder: 90 days -> 1 paragraph.
- Affirmation: *"Three months. You have reached Active User status."* (EXISTS.)

### QUARTER 2 — "THE SYSTEM NAMES YOU" (comfortable → compact)

**M4 · PORTRAIT**
- Screen: archetype appears on the user's profile for the first time (the `psychologicalProfile` already computed for 10+ answers). The **Memory Shelf** (§5.3) appears: 4 shelves, 3 slots each.
- Memory delivery: Month Card #4 names what the user is *drifting toward*, not just what they did.
- Badge: first **named badge** from the Codex tied to the archetype (e.g. The Strategist set for Machiavelli).
- Affirmation: *"Four months. The portrait deepens."* (EXISTS.)

**M5 · CADENCE**
- Screen: density `compact`. The AI proposes **one** self-care routine fitted to when the user actually clicks care (time-of-day histogram, already derivable from timestamps). One tap: *Adopt / Not now*.
- Memory delivery: Card #5 includes "Your best hour: ___. Your hardest day: ___."
- Badge: `○≈○` (full tide) once 20 care clicks and the 5-day streak pattern fire.
- Affirmation: *"Five months. Consistency is its own reward."* (EXISTS.)

**M6 · HALF-LIFE** — *half-year*
- Screen: **Half-Year Chapter** — 6 Month Cards compress to 1 paragraph (the user's first long-form "Story"). Export button: *Send to profile / Save*.
- AI voice change: first-person plural. "We noticed…" — the single most felt tonal shift of the year.
- Badge: `○≈○` + **Half Seal**.
- Memory ladder: 180 days -> 1 paragraph + 6 one-liners.
- Affirmation: *"Six months. The journey is half-declared."* (EXISTS.)

### QUARTER 3 — "THE SYSTEM REMEMBERS YOU" (compact → dense)

**M7 · ECHO**
- Screen: the **Echo line** — the Memory block quotes a fragment of the user's own M1 entry beside a M7 entry (with the date). The strongest tangible proof of evolution: *your own words, six months apart.* Only quotes the user's own text, only to the user.
- Badge: Echo mark (two aligned dots).
- Affirmation: *"Seven months in. The system has been listening."* (EXISTS.)

**M8 · RARE AIR**
- Screen: density `dense`. **Pattern Break** view: what changed vs. the previous 3 months (energy up, journal depth down, etc.). Gentle contradiction surfacing (IntegrityWidget, opt-in).
- Badge: first rare badge (rarity tier flagged in Codex).
- Affirmation: *"Eight months. Rare air."* (EXISTS.)

**M9 · HABIT** — *quarter close*
- Screen: **Q3 Chapter** delivered. The Memory Engine stops re-asking known facts; question count per week drops while hit-rate rises (the stated "fewer questions that hit harder" promise, made visible: *"This quarter: 41 questions asked, 17 skipped because we already knew."*).
- Badge: `≋○≈` three-quarter ocean + Q3 Seal.
- Affirmation: *"Nine months. The self-care practice is a habit now."* (EXISTS.)

### QUARTER 4 — "YOU AUTHOR THE SYSTEM" (dense → instrument)

**M10 · AUTHOR**
- Screen: every Month Card gets **Keep / Revise** taps. Revise opens a 1-line edit. The machine now treats the user's edits as ground truth (weighted above its own inference — "Behavioral, not declarative", with the user's explicit corrections as the exception that proves the rule).
- Badge: Author's mark.
- Affirmation: *"Ten months. Almost there."* (EXISTS; consider replacing — see §8 copy notes.)

**M11 · LEGACY WATCH**
- Screen: **Year Portrait preview** — 10 of 12 months filled, 2 shown as `░░░░`. Story API export (`/api/story/latest`) surfaces as a button for users with the API tier.
- Badge: `≋○≋` (ocean depth) awarded at M11 open.
- Affirmation: *"Eleven months. One more."* (EXISTS.)

**M12 · PORTRAIT COMPLETE**
- Screen: density `instrument` — matches `/u/machiavelli`. **Year Portrait** delivered: 1 paragraph (the whole year) + 4 Quarter Chapters + 12 Month one-liners + year stats (entries, check-ins, care clicks, streak, archetype). Public toggle publishes the paragraph to `/u/<name>` as `memoryStory` (the field the Machiavelli page already renders).
- Badge: **Year Seal** (the only badge that is a composite of the previous 11 seals).
- Year-2 hook: Months Unlocked widget flips to `Year 2 · Month 1` and the compression ladder gains a rung: 12 -> 1.
- Affirmation: *"One year with LOT. The portrait is complete — and still evolving."* (EXISTS.)

---

## 5. THE COMPRESSED MEMORY STORY — DELIVERY SYSTEM

The user asked for tangibility of the compressed story. This section is the core.

### 5.1 The compression ladder

```
ACT           log entry / check-in / care click     (raw signal)
   |  24h
DAY LINE      1 line      — Morning Coherence / Evening Close output (MCL / EVE exist)
   |  7d
WEEK STORY    ~80 words   — Weekly Story-Report (spec'd, not yet built)
   |  1 month
MONTH CARD    ~60-120 words (+3 patterns, +1 quote)           <-- NEW, central object
   |  3 months
QUARTER CHAPTER  ~150 words
   |  6 months
HALF-YEAR     ~200 words (first "Story")
   |  12 months
YEAR PORTRAIT ~250 words + 12 one-liners + stats
```

Each rung is generated **from the rung below, not from raw logs**, so cost stays flat and the story literally gets denser. That is the honest meaning of "compression" here: the *input* shrinks as the *meaning* concentrates. (Compression ratio is shown to the user as a plain count: "412 acts -> 1 paragraph". Real numbers only.)

### 5.2 The Month Card (the monthly delivery object)

```
 MONTH 4 / 12                                    CLEAR · 78%
 ──────────────────────────────────────────────────────────
 You wrote 19 entries and checked in 23 mornings. Evenings
 got quiet; mornings got specific. You kept coming back to
 the word "enough."

 PATTERNS     slow mornings · care before work · fewer questions
 YOUR WORDS   "I stopped apologising for the pause."   — Mar 14
 SHIFT        Care clicks +40% vs. month 3.
 ──────────────────────────────────────────────────────────
 412 acts -> 1 paragraph
                                       [ KEEP ]  [ REVISE ]
```

Rules: second person, plain, ≤120 words; exactly one verbatim user quote (private, never exported without explicit action); one numeric `SHIFT` line computed, not generated (so it can't hallucinate); `KEEP/REVISE` appears from Month 10, but stored from Month 1 so history is editable retroactively.

### 5.3 The Memory Shelf

A 12-slot strip under the Memory widget:

```
 MEMORY      [01][02][03]  [04][05][06]  [07][░░][░░]  [░░][░░][░░]
              ■   ■   ■     ■   ■   ■     ■   .   .     .   .   .
 Months unlocked: 7/12
```

- Unlocked slot: solid; tap -> opens that Month Card.
- Current slot: pulses once on open (existing 1400ms fade, no loop).
- Locked slots: `░░` — anticipation without pressure.
- Quarter Seals sit under 3 / 6 / 9 / 12.

### 5.4 The context-based widget: "Months unlocked: N/12"

Extends (does not replace) `MonthlyPulseWidget`. Two states:

- **Resting** (default, always visible to Usership users): one line — `Months unlocked: 3/12` + the shelf strip. Label follows the existing `Block label="Month 3:"` convention.
- **Opening** (first load after an anniversary): full-width celebration block with the affirmation, the new Month Card inline, the badge awarded, and one next-step line ("Month 4 opens Nov 12. Archetype will be named."). Dismiss phrases stay (`Onward.` / `Noted.`) — existing behavior, kept.

Also context-aware: in the last 3 days before an anniversary the resting line becomes `Month 4 opens in 2 days.` — information, not nagging.

### 5.5 "Insight from last month" mini-widget (Memory block)

One paragraph-length insight from the **previous** month surfaced inside the normal Memory widget, once per week, on the weekday of the user's best check-in hour. Never a push. Taps through to the Month Card.

### 5.6 Delivery moments (when it appears)

| Moment | What | Trigger |
|---|---|---|
| Anniversary open | Opening state of the Months widget + new Month Card | first session after `usershipStartedAt + N months` |
| Weekly | Week Story line | Sunday close (existing weekly job slot) |
| Quarter close | Chapter + Seal | M3 / M6 / M9 / M12 |
| Year close | Year Portrait + public publish option | M12 |
| Ambient resurfacing | "Insight from last month" | once/week, during Memory widget view |

---

## 6. BADGES — THE 12-MONTH SERIES

Do not mint 12 new badge families; **reuse Codex v31** and add one *series* that ties to the already-designed level glyph.

| M | Glyph (Level field) | Seal | Notes |
|---|---|---|---|
| 1 | `○` | — | seed |
| 2 | `○∿` | — | wave emerges |
| 3 | `○∿` | Q1 | first seal |
| 4 | `○∿` + archetype badge | — | named badge from Codex |
| 5 | `○≈○` | — | full tide (needs CARE target hit) |
| 6 | `○≈○` | Half | |
| 7 | `○≈○` + Echo mark | — | |
| 8 | `≋○≈` + rare | — | first rare |
| 9 | `≋○≈` | Q3 | |
| 10 | `≋○≈` + Author | — | |
| 11 | `≋○≋` | — | ocean depth |
| 12 | `≋○≋` + Year Seal | Year | composite |

Badge **variants** by `MonthDepth` band: `QUIET`/`FORMING` earn the plain glyph; `CLEAR`/`DENSE` earn the filled glyph. Every user gets every month's glyph (no un-earning); depth only decides how rich the mark looks. Aligns with the no-punishment rule.

---

## 7. IMPLEMENTATION PLAN (proposal — none built in this session)

**New data**
- `User.usershipStartedAt` (nullable timestamp) — set when the Usership tag is first applied; backfill from earliest paid event or `joinedAt`.
- Table `memory_month_cards`: `(user_id, month_index, quarter, depth_pct, band, body, patterns jsonb, quote_log_id, shift_line, signals jsonb {log, checkin, care}, edited_body nullable, kept bool nullable, generated_at)` — unique on `(user_id, month_index)`.
- Same table pattern (or `kind` column) for `week`, `quarter`, `half`, `year` rungs.

**New server pieces**
- Scheduled job (extends `scheduled-jobs.ts`): daily scan, on anniversary generate Month Card from the prior rung via `generateCompletion` (Together AI primary, per the compression architecture); deterministic fallback via a `composeLocalMonthCard` (mirrors `composeLocalStory`) so the card always exists even when the model is down.
- `GET /api/memory/months` -> list + `monthsUnlocked`.
- `POST /api/memory/months/:n/review` -> keep / revise.
- Dismiss state stored server-side (fixes gap 5).

**Client**
- Extend `MonthlyPulseWidget` -> `MonthsUnlockedWidget` (rename optional; keep export name to avoid import churn).
- `MemoryShelf` component, `MonthCard` component, both using `Block` + existing `ProgressBars`.
- Density: map month -> `data-density` tier through `$evolutionState` (already drives `$layoutDensity`), floor-bounded so a user's tier never drops.
- Reuse `useLogContext` for live signal counts.

**Rollout order (smallest tangible slice first)**
1. `usershipStartedAt` + fix month counter (gap 2). Tiny, high correctness value.
2. Months Unlocked resting line + shelf (locked/unlocked visuals only, no AI).
3. Month Card generation (deterministic fallback first, AI second).
4. Anniversary opening state + badge glyph.
5. Quarter/Half/Year rungs.
6. Keep/Revise + public Year Portrait publish.

**Guardrails (from existing doctrine)**
- RENDER-ISOLATION: Months widget subscribes only to `me` and the months query; shelf is a leaf component.
- Whitelist hygiene: any new log event type (`month_card_kept`) must be added to the `displayableEvents` GET whitelist or the write->read loop silently breaks.
- Usership-only generation (Core Principle #3, `MEMORY-ENGINE-CORE-PRINCIPLES-VERIFIED.md`); non-Usership keeps default bank.
- SW cache: any shipped client change needs a `CACHE_VERSION` bump (Client Cache Freshness doctrine).
- Privacy: quotes and cards are private by default; publishing is an explicit user act.

---

## 8. OPEN QUESTIONS FOR S-2

1. **Month origin:** start the clock at Usership activation (recommended) or keep account creation? Existing users already see "Month N" keyed to `joinedAt`.
2. **Retroactive cards:** for current Usership users, backfill Month Cards from historical logs, or start fresh at the next anniversary? (Backfill is a strong launch moment but costs generation calls.)
3. **Pricing language:** Product Brief says Usership is $99/mo; `WIDGETS.md` also lists $99 while `LOT_SYSTEMS_BRIEF.md` says $50/mo — a doc inconsistency to reconcile before any copy mentions price.
4. **Copy upgrade:** several existing monthly one-liners (M10 "Almost there", M11 "One more") are generic. Proposal: ground each in one computed number (e.g. "Ten months. 231 entries. The pattern holds.") while keeping the military-purity tone.
5. **Depth weights** (40/35/25) and per-month targets are placeholders — approve as v0 or supply your own.
6. **Year-2 ladder:** does Month 13+ repeat the table at higher targets, or switch to the Legacy / `/u/machiavelli` ceiling model?
7. **Hardware tie-in:** LOT® Brush care events could count toward CARE automatically once shipping; confirm.

---

## 9. ONE-LINE SUMMARY

Time opens the month, behavior fills it, and every month the machine hands the user one paragraph that is smaller than what they did and larger than what they noticed — twelve of them, then one.

---
*S-2: VADIK MARMELADOV*
*LOT® Founded 7 April 2016 · COSMO® Founded 1 July 2024 · Made in the USA · brand.lot-systems.com*
