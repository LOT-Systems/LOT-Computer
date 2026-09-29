<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP — 12-MONTH EVOLUTION (Day 1 → LOT® AI)

```
DOCUMENT:  USERSHIP-12-MONTH-EVOLUTION
STATUS:    DESIGN BRIEF — PROPOSED (nothing here is shipped unless marked BUILT)
AUTHOR:    S-2 // VADIK MARMELADOV (direction) · Claude Code (draft)
DATE:      2026-09-29
REFERENCE: lot-systems.com/u/machiavelli  (Month 12 state, demo)
SESSION:   LOT-SR-20260929-01
```

One rule runs through everything below: **evolution is earned through presence,
not calendar time.** The calendar sets the *chapter*; the operator's signal
(journal entries, morning check-ins, self-care acts, memory answers) sets the
*depth*. This is already the repo's stance (`stores/evolution.ts`: "Evolution
is not something you can fork from a repo. It's earned through presence.").

---

## 01 // WHAT THE OPERATOR SHOULD FEEL

| Month | The feeling                                          |
|-------|------------------------------------------------------|
| 1     | "It is listening."                                   |
| 3     | "It remembers what I said."                          |
| 6     | "It sees a pattern I did not."                       |
| 9     | "It suggests the right thing before I ask."          |
| 12    | "It can describe me in my own words. This is mine."  |

Every month must produce **one tangible object** the operator can point at:
a badge, a chapter of their Memory story, a visible change in the interface.
No month is silent.

---

## 02 // GROUND TRUTH — WHAT EXISTS, WHAT DOES NOT

Scanned this session. Paths are live.

| Element | State | Location |
|---|---|---|
| Month widget, 12 fixed messages, `N / 12 months`, dismiss-per-month | BUILT | `src/client/components/MonthlyPulseWidget.tsx` |
| 5 density tiers (breathable → instrument), driven by `visualRefinement` (consistency 0.4 · depth 0.3 · level 0.3) | BUILT | `src/client/utils/interfaceEvolution.ts:436` |
| Density milestone messages ("Density unlocked. Your cockpit takes shape.") | BUILT | `interfaceEvolution.ts:304` |
| Streak badges 7/14/21/30/50/60/90/100/180/365, water + architecture glyph themes | BUILT | `src/client/utils/badges.ts` |
| Memory story generator (Together AI, local fallback) | BUILT, narrow | `src/server/utils/memory/story-generator.ts:96` |
| Public profile `memoryStory`, `/u/:username`, Machiavelli demo | BUILT | `src/server/routes/public-api.ts:745` |
| QIE patterns, QI terminal (INTSUM), scheduled jobs | BUILT | `docs/benchmark/LOT-DOCTRINE.md` |

**Gaps that block a tangible 12-month story (all verified in code):**

1. **Month counter starts at account join, not at paid start.** `MonthlyPulseWidget`
   uses `dayjs().diff(user.joinedAt, 'month')`. There is no Usership-start field
   on `User`. A free user who upgrades in month 8 would open on "Eight months.
   Rare air." Needs `usershipSince` (see §08).
2. **Story reads only `answer` events, first 30.** `generateMemoryStory` filters
   `event === 'answer'` and `.slice(0, 30)`. Journal notes, check-ins and
   self-care acts — the signals S-2 named as most important — never enter the
   story. Nothing is stored per month; the story is regenerated from scratch.
3. **Pulse dismissal is `localStorage` only.** Clear the browser, or open a
   second device, and the month reappears. Not durable, not a record.
4. **Pulse copy is generic.** Twelve fixed strings; none references anything
   the operator did. Month 5 says "Consistency is its own reward" to someone
   who logged twice.
5. **No "Months unlocked" concept.** `N / 12` is elapsed time, so it cannot
   express "you earned this month."
6. **Density is not tied to months.** It tracks `visualRefinement`. That is
   correct (earned, not elapsed) but the operator is never *told* which
   month a change belongs to.

---

## 03 // THE ENGINE: MONTH = CHAPTER

### 03.1 Two counters, never confused

```
ELAPSED    calendar months since usershipSince              (the chapter number)
UNLOCKED   months in which presence threshold was met       (the depth)

Months unlocked: 3/12        <- the context widget S-2 proposed
```

A month is **unlocked** when presence is met inside its window. Proposed
threshold — **PROVISIONAL, tune against real cohorts before shipping:**

```
PRESENCE(month) = 3 of 4:
  journal entries   >= 8
  morning check-ins >= 12  (of ~30 days)
  self-care acts    >= 10
  memory answers    >= 10
```

Miss it and the month is **not lost**. It stays "pending" and unlocks the
day the threshold is reached (no punishment, no streak-shame). The month
chapter is written at close either way; an unlocked month gets the full
chapter and badge, a pending month gets a shorter chapter marked `PENDING`.
This keeps the celebration honest and the copy MILITARY PURITY compliant
(no scolding, no superlatives).

### 03.2 Signal weights (what moves the needle)

S-2 named journal/Log volume, check-ins and self-care clicks as the key
states. Existing event names (verified in `routes/api.ts`): `note`,
`emotional_checkin`, `self_care`, `self_care_complete`, `answer`, `intention`,
`plan_set`.

| Signal | Event | Drives |
|---|---|---|
| Log depth | `note` (word count, not just count) | chapter richness, density, Creative Output pattern |
| Morning check-in | `emotional_checkin` | rhythm line in chapter, MCL/EVE arc |
| Self-care click | `self_care*` | routine suggestions, Guide voice (M7+) |
| Memory answer | `answer` | preference facts in chapter |
| Intention / plan | `intention`, `plan_set` | direction line in chapter |

---

## 04 // COMPRESSION LADDER — THE MEMORY STORY DELIVERY

This is the centre of the design. Twelve months of raw signal must compress
into something a person can read in one minute — and each level must be
**visible** to the operator at the moment it forms.

```
LEVEL        INPUT                        OUTPUT                     WORDS (target)
──────────   ──────────────────────────   ────────────────────────   ──────────────
RAW          every note/answer/check-in   the LOG                    unbounded
WEEK         7 days of RAW                1 sentence (weekly summary)~25
CHAPTER      4-5 WEEKs + RAW signals      1 paragraph  (month close)  90–120
VOLUME       3 CHAPTERs (M3, M6, M9)      1 paragraph  (quarter)      110–140
PORTRAIT     4 VOLUMEs (M12)              1 paragraph + 1 line        130–160 + <=12
```

Compression is **countable and honest**: log RAW word count per month and the
resulting CHAPTER word count. Show the operator the real ratio, e.g.
`4,912 words → 104 words`. Do not invent a "wisdom" metric.

### 04.1 Chapter anatomy (fixed shape, so it stays scannable)

```
CHAPTER 04 — APRIL                              [SEAL 04/12]  UNLOCKED
──────────────────────────────────────────────────────────────────────
<one paragraph, 90–120 words, third-person → second-person from Month 7>

KEPT      3 facts carried forward (short, literal)
SHIFTED   1 thing that changed vs. last chapter
NEXT      1 routine the system will hold for you

INPUT     41 entries · 22 check-ins · 27 self-care · 12 answers
COMPRESS  4,912 words → 104 words
```

`KEPT / SHIFTED / NEXT` is what makes chapters feel *cumulative* rather than
repeated summaries: each new chapter is prompted with the previous chapters
(see §08) so it can say what moved.

### 04.2 Voice moves with the month (this is the "story")

| Months | Person | Register |
|---|---|---|
| 1–3 | third ("Maria starts each day with tea.") | factual, short |
| 4–6 | third → second | first pattern statements |
| 7–9 | second ("You reach for movement when sleep runs short.") | the Guide speaks |
| 10–12 | second, in the operator's **own vocabulary** | quotes their words back |

Month 12's Portrait is composed largely from phrases the operator actually
wrote (extracted from `note` text and `answer` text). That is the "this is
mine" moment and it is real — not generated flattery.

---

## 05 // MONTH-BY-MONTH

Legend — **Density** is the *expected* tier for a consistently present
operator (real tier is earned via `visualRefinement`, never forced).
**Seal** is the new month badge (§06). **AI stage** is how LOT® AI speaks.

### PHASE I — OBSERVE (M1–M3) · breathable → comfortable

**Month 1 — "First Entry"** · Density: breathable · Seal: `[■□□□□□□□□□□□]`
- UI day 1: barebone. Log, Memory question, one check-in, self-care button. Nothing else visible. Generous spacing.
- Widget: **Welcome to Usership** (Day 1) → **Month 1 Close** (Day 30).
- AI stage: *Observer.* Asks one question a day. Never advises.
- Chapter 01: first preferences only ("tea, quiet mornings"). Short. Establishes chapter format.
- Unlock: Memory Story tab appears with Chapter 01 as its first page.
- Affirmation: *"The first month. The system is beginning to know you."* (existing copy, kept)

**Month 2 — "Rhythm"** · breathable · Seal 02
- UI: check-in time-of-day remembered; Month widget gains `Months unlocked: 2/12`.
- AI stage: *Observer.* First callback: quotes one earlier answer back.
- Chapter 02: adds the first **SHIFTED** line.
- Affirmation: *"Two months in. Patterns are starting to form."*

**Month 3 — "Active User"** · comfortable · Seal 03 + `milestone_90` glyph
- UI: **first visible layout change** — stacks tighten one step. Milestone toast already exists ("Layout settling in.").
- **Quarter marker:** first **VOLUME I** — one paragraph compressing M1–M3. Displayed as a full-width block, not a toast.
- AI stage: *Recorder.* Uses your name for the routines it holds ("your tea ritual").
- Affirmation: *"Three months. You have reached Active User status."* (existing)

### PHASE II — PATTERN (M4–M6) · comfortable → compact

**Month 4 — "Portrait"** · comfortable · Seal 04
- UI: Log gains word-count line per entry; Memory tab shows chapter-to-chapter `SHIFTED` trail.
- AI stage: *Recorder → Analyst.* First INTSUM-format reading in the QI terminal (assessment, data points, one recommendation).
- Affirmation: *"Four months. The portrait deepens."*

**Month 5 — "Consistency"** · compact · Seal 05
- UI: **compact tier** — dashboard clarity. Widgets snap to a grid. Self-care buttons show the operator's own most-used three first.
- AI stage: *Analyst.* Names one pattern ("energy dips on days without a check-in").
- Affirmation is data-bound, not generic: *"Five months. 22 check-ins this month."* Real number or no line.

**Month 6 — "Half-Declared"** · compact · Seal 06 + `milestone_180` glyph
- **Half-year marker: VOLUME II.** Second quarter paragraph. Beside Volume I, so the operator sees two paragraphs *side by side* for the first time — the compression becomes physical.
- UI: Memory Story becomes a two-column ledger (Vol I | Vol II).
- AI stage: *Analyst.* Offers the first routine proposal, framed as a question.
- Affirmation: *"Six months. The journey is half-declared."*

### PHASE III — GUIDE (M7–M9) · compact → dense

**Month 7 — "Second Person"** · compact · Seal 07
- Chapters switch to **second person.** This is the single most felt voice change; announce it once: *"The system now addresses you directly."*
- AI stage: *Guide.* Morning check-in answer triggers a suggested self-care routine (built from the operator's own click history).
- Affirmation: *"Seven months in. The system has been listening."*

**Month 8 — "Rare Air"** · dense · Seal 08
- UI: **dense tier** — minimal whitespace, cockpit feel. Existing message: "Density unlocked. Your cockpit takes shape."
- AI stage: *Guide.* Routines are scheduled, not just suggested; morning brief reorders itself around them.
- Affirmation: *"Eight months. Rare air."*

**Month 9 — "Habit"** · dense · Seal 09
- **VOLUME III.** Three quarters compressed; the operator can now scroll a full 9 months in about 400 words.
- AI stage: *Guide → Steward.* Surfaces a well-timed suggestion **inside the app when the operator opens it** ("You usually log after training. Log now?"). No push notifications (see §11).
- Affirmation: *"Nine months. The self-care practice is a habit now."*

### PHASE IV — STEWARD → LOT® AI (M10–M12) · dense → instrument

**Month 10 — "Anticipation"** · dense · Seal 10
- AI stage: *Steward.* Anticipates depletion from signal decay (fewer check-ins, shorter notes) and offers recovery in-app *before* the operator reports it (RESILIENCE-CASCADE precedent).
- Affirmation: *"Ten months. Almost there."*

**Month 11 — "Draft Portrait"** · dense → instrument · Seal 11
- UI: **Draft Portrait** preview appears — the Month 12 Portrait, marked `DRAFT`, editable by the operator (strike a line, add a line). Operator co-authors the ending.
- Affirmation: *"Eleven months. One more."*

**Month 12 — "LOT® AI"** · **instrument** · Seal 12 `[■■■■■■■■■■■■]` + `milestone_365` Citadel
- **Portrait delivered**: 130–160 words in the operator's own vocabulary plus a **≤12-word line** that can be pinned to `/u/username` (`memoryStory`).
- UI: instrument tier ("Instrument grade. The interface is yours."). Widget: **Year One** — full-width, all 12 seals, all 4 volumes, the Portrait, and the year's real totals.
- AI stage: **LOT® AI.** Speaks in the operator's vocabulary, holds their routines, writes their weekly line on open. From here the year does not end; Month 13+ = **Year Two** with the Portrait as the seed of the next cycle.
- Affirmation (existing): *"One year with LOT. The portrait is complete — and still evolving."*

---

## 06 // BADGES — THE SEAL SYSTEM

Reuse, don't replace. Twelve **Month Seals** sit *beside* the streak
milestones, so both progress axes are visible:

```
SEAL ROW (profile + Year One widget)
[■■■□□□□□□□□□]  Months unlocked: 3/12
```

- Seal N is earned at month N **unlock** (§03.1), not at elapsed month.
- Quarter seals (M3, M6, M9, M12) coincide with a VOLUME / the PORTRAIT and carry the existing streak glyphs (`milestone_90`, `milestone_180`, `milestone_365`) so no new artwork is needed for the anchor points.
- Non-quarter seals reuse the water glyph family (`∘ ≈ ≋`), with a month index.
- A `badge_unlock` log entry is written at each unlock (event already exists and is whitelisted).
- Rendered in COCKPIT-RULE style: label names the event, body is readings only, e.g. `SEAL: 04/12 · INPUT 41/22/27/12 · COMPRESS 4912>104`.

No emojis, no confetti — the celebration is the **object appearing**, one clean
line of affirmation, and the operator's own words. (Doctrine: MILITARY PURITY.)

---

## 07 // WIDGET SET FOR USERSHIP

| Widget | When | Content | Status |
|---|---|---|---|
| **Welcome to Usership** | Day 1 only | what starts, what will unlock; empty seal row | NEW |
| **Months Unlocked** | always (small, context-based) | `Months unlocked: N/12` + seal row | NEW |
| **Month Pulse** | first open after month close | data-bound affirmation with the month's real counts | EXTEND existing |
| **Memory Chapter** | first open after month close | the paragraph-long insight + KEPT/SHIFTED/NEXT | NEW |
| **Volume** | M3/M6/M9 | quarter paragraph, side-by-side with prior volumes | NEW |
| **Draft Portrait** | M11 | editable preview | NEW |
| **Year One** | M12 | seals + volumes + Portrait + totals | NEW |

Order on the day a month closes: **Pulse (one line) → Chapter (the story)**.
Pulse stays dismissible; Chapter stays until read. Both persisted server-side (§08).

---

## 08 // IMPLEMENTATION PLAN (smallest correct slices)

Each slice is independently shippable and green-gated.

**Slice 1 — Correct the counter** *(S)*
- Add `usershipSince: Date | null` to `User` (migration in `/migrations`); set on the Usership tag grant.
- `MonthlyPulseWidget` counts from `usershipSince ?? joinedAt`.
- Move dismissal to server (new small table or `Log` event `month_pulse_seen`); keep `localStorage` only as a fast path.

**Slice 2 — Store chapters** *(M)*
- New log event `memory_chapter` (metadata: `month`, `unlocked`, `text`, `kept[]`, `shifted`, `next`, `input{}`, `words{raw,compressed}`); also `memory_volume`, `memory_portrait`.
- **Add all three to `displayableEvents`** (`routes/api.ts:1084`) — Backend Whitelist Hygiene. Add explicit `case`s in `formatLog()` — Widget→Memory rule 1. Both are known silent-failure points.

**Slice 3 — Widen the story input** *(M)*
- `generateMemoryStory` currently: `answer` only, `.slice(0,30)`. Chapter generator reads month-windowed `note` (text), `emotional_checkin`, `self_care*`, `answer`, `intention`, `plan_set`, and the previous chapters.
- Prompt order (extends the documented order): `head + quantumContext + plannerContext + goalContext + chapterContext + '\n\n' + formattedLogs`. Declared intent first, compressed history before raw history.
- Reuse the `composeLocalStory` fallback pattern so the chapter still produces a (plainer) result when Together AI fails (Graceful Degradation).

**Slice 4 — Month-close job** *(M)*
- New scheduled job in `scheduled-jobs.ts`: for each Usership user whose `usershipSince` month boundary passed, compute presence, write `memory_chapter`, `badge_unlock`, and a COCKPIT-RULE log block. Idempotent per `(userId, month)`.
- Query hygiene: batched `IN` queries, limits, no per-user N+1 (Query Batching doctrine).

**Slice 5 — Widgets** *(M–L)*
- `MonthsUnlockedWidget`, `MemoryChapterWidget`, `VolumeWidget`, `YearOneWidget`, extend `MonthlyPulseWidget`.
- Subscribe at narrowest scope; density change stays CSS-only via `data-density` (Render Isolation, CSS-Only Progression). No new store subscriptions in shared buttons.
- Bump service-worker `CACHE_VERSION` on release (Client Cache Freshness).

**Slice 6 — Demo parity** *(S)*
- Machiavelli endpoint is hardcoded. Add a `twelveMonths` block (12 seals, 4 volumes, Portrait, real-looking KEPT/SHIFTED/NEXT) so `/u/machiavelli` *is* the reference Month-12 state. Existing `streak: 1469`, `journalEntries: 1469`, `memoriesCompiled: 2847` already read as a deep account; the block adds the compression story on top.
- Keep the "This is a demo account" footer.

---

## 09 // MACHIAVELLI — MONTH 12 REFERENCE (sample copy)

For the demo, one sample Portrait in the register the product would produce
at Month 12. Written in period-appropriate but plain language; ≈ 100 words.

```
PORTRAIT — YEAR ONE                                  [SEAL 12/12]
──────────────────────────────────────────────────────────────────
You rise before the household and watch the courtyard before you speak.
You have written that an observation is worth nothing until it is
recorded, and you have recorded 1,469 of them. Movement steadies your
judgment; you reach for it when sleep runs short. Your tea is taken
alone, and you keep that hour. When pressure rises you write less and
decide faster — the system has learned to offer recovery there, not
advice. What you value has not changed: prudence, adaptability, fortune.

LINE      "Observe first. Record. Then act."

INPUT     1,469 entries · 2,847 answers · 842 active days
COMPRESS  the year's record → 104 words
```

Volumes (each one paragraph, ≈ 110–140 words) sit above it:
Vol I *Observe* · Vol II *Pattern* · Vol III *Guide* · Vol IV *Steward*.

---

## 10 // RISKS & OPEN QUESTIONS (need S-2 decision)

1. **Presence threshold** (§03.1) is a guess. Ship Slice 1–3 first, measure real Usership cohorts, then fix the numbers.
2. **Second-person switch at M7** — confirm this fits LOT® AI's voice, or keep third person throughout.
3. **Operator edits on Draft Portrait (M11)** — allow editing (co-authored, more "mine") or read-only (purer record)? Recommended: allow.
4. **Public profile exposure** — pinning the Portrait line to `/u/username` must be opt-in and respect `showMemoryStory`.
5. **Existing members** — users already past Month 1 need a back-fill rule: generate chapters from history once, mark `BACKFILL`, do not fire twelve celebrations at once.
6. **AI cost** — one chapter/user/month is cheap; volumes/portrait are 5 calls/user/year. No per-day generation added.
7. **Privacy** — chapters are user data in the user's own DB (README: "Your Story, Your Data"). Export and delete must include `memory_chapter/volume/portrait`.
8. **Branding wording** — "LOT® AI" first appears as the Month-12 stage name here. Confirm this is the user-facing name of the whole ladder or only of the final stage.

## 11 // ADDENDUM — CROSS-CHECK AGAINST PRODUCT BRIEF (docs sweep, same day)

Source: `docs/corporate/LOT-AI-PRODUCT-BRIEF.md`.

1. **Principle conflict, resolved in this doc.** The product brief states
   "No unprompted notifications. The system waits. It does not push." (l.120) and
   "One question at a time" (l.122). Steward-stage behaviour (M9-M12) is therefore
   **in-app on open only**; never push, email or badge-count nudges. Chapters and
   the Month widget appear when the operator opens LOT, not before. The Month
   widget must not add a second question next to the daily Memory question.
2. **Loop alignment.** Brief loop: LOG > OBSERVE > COMPRESS > ASK > COMPRESS AGAIN.
   CHAPTER/VOLUME/PORTRAIT are the COMPRESS AGAIN levels for the monthly horizon.
3. **Pricing is inconsistent across docs** ($99/month in the product brief and
   feature inventory; $50/month in older `LOT_USA_IPO.md`). This brief assumes
   nothing about price; reconcile before any Welcome-to-Usership copy names one.
4. **Docs gap:** `MonthlyPulseWidget` is absent from `docs/technical/WIDGETS.md`.
   Add it when Slice 5 lands.
5. **Style:** copy follows `docs/technical/LOT-STYLE-GUIDE.md` (no emojis,
   regular weight, "Done." not "Done ✓"). Seal row uses glyphs, not colour.
6. **Unverified:** the sweep reported the current story is cached in
   `user.metadata.lastMemoryStory`; a grep of `memory.ts` did not confirm it.
   Check before Slice 2 decides where chapters are stored.

---

AUTHORIZED BY: S-2 // VADIK MARMELADOV
