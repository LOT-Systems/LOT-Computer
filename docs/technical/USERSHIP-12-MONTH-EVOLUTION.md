<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP · THE 12-MONTH EVOLUTION → LOT® AI

```
DOC      : USERSHIP-12-MONTH-EVOLUTION
CLASS    : PRODUCT DESIGN / ROADMAP (design-only, no code changed)
DATE     : 2026-11-02
S-2      : VADIK MARMELADOV
STATUS   : DRAFT v1 — for S-2 review
FOCUS    : Tangibility of the compressed Memory Story, delivered monthly
```

---

## 0 · THE IDEA IN ONE PARAGRAPH

A Usership ($99/mo) subscriber opens LOT on **Day 1** to a nearly empty screen: a name, a date, a check-in, one question. Twelve months later the same screen is a dense, quiet instrument that *speaks in the user's own compressed words*. The interface does not get "more features" — it gets **more of the user in it**. Every month the AI closes a chapter: it compresses ~30 days of journal entries, check-ins, answers and self-care clicks into one paragraph, awards a **Month Seal**, and unlocks one new capability. By Month 12 the paragraphs are compressed again into **The Portrait** — one page, then one line. `lot-systems.com/u/machiavelli` is what Month 12 looks like.

**Design law:** *one month = one paragraph = one seal = one unlock.* If the user can't point at what changed this month, we haven't shipped the month.

---

## 1 · REPO SCAN — WHAT ALREADY EXISTS (so we build on it, not beside it)

| Asset | File | What it does today | Role in the 12-month system |
|---|---|---|---|
| Monthly Pulse | `src/client/components/MonthlyPulseWidget.tsx` | Usership-only. One line per month (1–12), `n / 12 months`, dismiss → "Onward." Uses `joinedAt` calendar months, state in `localStorage`. | **Seed of "Months Unlocked: n/12".** Upgrade, don't replace. |
| Interface Evolution | `src/client/utils/interfaceEvolution.ts`, `stores/evolution.ts`, `docs/technical/INTERFACE_EVOLUTION.md` | 7-dim evolution state (exploration…courage), feature unlock flags, 5 density levels `breathable → comfortable → compact → dense → instrument`, CSS vars. | **The engine for visible change.** Density + unlocks are currently driven by achievements/level, *not* by month. Month becomes a floor on top. |
| Evolution / InterfaceEvolution widgets | `EvolutionWidget.tsx`, `InterfaceEvolutionWidget.tsx` | Dimension bars, unlock list, effects. | Becomes the "how" panel behind each month. |
| Memory Story | `src/server/utils/memory/story-generator.ts` | Builds one narrative from the **latest 30 answers only** (`slice(0, 30)`); third person; en-dash insight list. | **Gap:** no time axis, no compression ladder. Core of this doc. |
| Memory Engine | `docs/technical/MEMORY-ENGINE-WHITE-PAPER.md`, `MemoryWidget.tsx` | Q&A that compounds ("Day 1 tea → Month 2 seasonal"). | Source signal #1 (answers). |
| Monthly email | `src/server/scheduled-jobs.ts` | Sends to Usership, joined ≥3 months, seen ≤7 days. | Delivery channel #2 for the Month Paragraph. See risk R2. |
| Check-in / Self-care | `EmotionalCheckIn.tsx`, `SelfCareMoments.tsx` (cooldown 3h, `self-care-completed` in `localStorage`) | Daily mood + self-care buttons. | Signal #2/#3. **Self-care clicks are client-only today** → not countable server-side (R3). |
| Badges | `docs/badges/…CODEX_v32`, 812 badge types in `badges.ts` | Rich RPG/arcade badge layer, Water ∘→≈→≋ / Architecture ├─→╞═╡→║·║ themes. | Month Seals ride this theme system. |
| Usership gating | `UserTag.Usership`; tiers in `docs/corporate/LOT-FEATURE-INVENTORY-2026.md §16` | $99: AI questions, memory story, profile, QR, theme, board profile, architect widget, monthly email. | Month system is Usership-only; free tier keeps current `System.tsx` minimal layout. |
| Demo account | `src/server/routes/public-api.ts` (`/profile/machiavelli`) | Hardcoded: 2,847 answers, 1,469 notes, 842 active days, streak 1,469, `memoryStory` (1 paragraph), archetype *The Strategist*, wallet, weather station. | **Month 12 reference render.** See §6. |

> Note on the live demo: `lot-systems.com` was not reachable from this session (network allowlist). Demo facts above come from the hardcoded API source, which is what the page renders.

---

## 2 · THE MODEL — HOW A MONTH IS "EARNED"

### 2.1 Calendar month **and** activity (the "Months Unlocked" rule)

Today the Pulse is pure calendar (`now.diff(joinedAt,'month')`). That lets a silent user "unlock" Month 7. Proposed rule:

```
Month N is OPEN       when  calendar ≥ N months since Usership start
Month N is UNLOCKED   when  OPEN  AND  activity floor met in that month
Month N is SEALED     when  UNLOCKED AND user has opened the Month Paragraph
Missed floor          →  month shows "Gathering… 14/20" (never punitive; can be
                         completed during the following month — "catch-up seal")
```

Activity floor is deliberately modest and scales with the journey (so Month 1 is easy, Month 12 reflects a real practice):

| Months | Floor (per month) |
|---|---|
| 1–3 | 8 active days · 5 Log entries · 6 check-ins |
| 4–6 | 12 active days · 12 Log entries · 10 check-ins · 10 self-care clicks |
| 7–9 | 15 active days · 20 Log entries · 14 check-ins · 20 self-care clicks |
| 10–12 | 18 active days · 25 Log entries · 18 check-ins · 30 self-care clicks |

**Context widget — `Months Unlocked: 3/12`** (the S-2 idea). Terminal-style, matches existing `Block`:

```
Months unlocked:   ■■■□□□□□□□□□   3 / 12
Month 4 · day 11 of 30 · gathering 17/25 entries
```

### 2.2 The four signals (the user's "raw material")

```
LOG ENTRIES      journal / notes             → weight 1.0 (depth)
CHECK-INS        morning emotional check-in  → weight 0.6 (rhythm)
SELF-CARE CLICKS Self-care Moments buttons   → weight 0.4 (care)
MEMORY ANSWERS   Memory Engine Q&A           → weight 0.8 (identity)
```

The **Month Score** (0–100) is shown to the user as *Depth of month*, never as a grade. It decides the **length and richness** of that month's paragraph (a thin month gets a shorter, honest paragraph — see §3.4).

### 2.3 The AI guide — voice progression

The AI's *relationship* is the plot. Same engine (`generateMemoryStory` family), different register by phase:

| Phase | Months | AI voice | Pronoun | Example |
|---|---|---|---|---|
| **Observer** | 1–3 | Asks, notes, rarely claims | "I noticed…" | "You wrote *tired* four mornings. I'm only noticing." |
| **Companion** | 4–6 | Names patterns, suggests routines | "we" | "Your Tuesdays hold you up. Protect them." |
| **Guide** | 7–9 | Proposes a direction, calls back to old words | "you, then / now" | "In March you said *quiet*. In September you chose it." |
| **Mirror** | 10–12 | Quotes the user back, brief, confident | the user's own words | "You already know." |

---

## 3 · THE MEMORY COMPRESSION LADDER (focus of this session)

This is what makes the evolution *tangible*: the user watches their own life get shorter and truer.

### 3.1 The ladder

```
RAW            every entry / answer / check-in / click          (thousands of words)
  ↓ nightly
DAY SEED       1 line, auto, shown in Log margin                ~15 words
  ↓ weekly (Sun)
WEEK THREAD    2 lines, "what repeated"                         ~35 words
  ↓ monthly  ★ MONTH PARAGRAPH — the celebrated artifact        ~90–120 words
  ↓ every 3 months
CHAPTER        1 paragraph + 3 strands + 1 contradiction        ~180 words   (M3, M6, M9)
  ↓ M6 / M12
VOLUME         half-year, two chapters folded                   ~220 words   (M6 = Vol. I, M12 = Vol. II)
  ↓ M12
THE PORTRAIT   1 page: who you were → are, values, rituals      ~300 words
  ↓
THE EPIGRAPH   1 line. The whole year.                          ≤ 20 words
```

**Compression is visible:** each artifact shows its ratio — `4,812 words → 104 words (46:1)` — and *which of the user's own phrases survived* (highlighted). Survival is the proof the AI listened.

### 3.2 Monthly Memory Paragraph — spec

Delivered **on the 1st day of the new month** (user's timezone) or first login after; also by email (existing job, extended).

Structure (fixed so it feels like a ritual):

```
1. OPENING IMAGE       1 sentence — the month in the user's own words
2. THE PATTERN         1–2 sentences — what repeated (data-grounded: "11 of 24 mornings")
3. THE SHIFT           1 sentence — what changed vs last month (calls back to prior paragraph)
4. THE QUESTION        1 line — carried into next month ("Why Tuesdays?")
```

Rules: second person from Month 4 (third person earlier is cold); every claim cites a count; **never invents** — if the month is thin, say so; quote ≥1 verbatim user phrase; never diagnostic or medical.

### 3.3 Where it appears (four surfaces, escalating)

1. **Month Card** (top of `System.tsx`, replaces today's one-liner): 3-second celebratory reveal → tap to expand paragraph.
2. **Memory Widget · "Last month:"** — the paragraph stays pinned until Day 10, then collapses to its first sentence.
3. **Archive** `/log` → *Months* tab: 12 slots; sealed months show seal + paragraph, future months show a faint outline (anticipation).
4. **Email** — same paragraph, plain, with the seal glyph. (Reuses `scheduled-jobs.ts`; remove the ≥3-month gate for the new job.)

### 3.4 Honest thin months

If Month Score < 25: *"A quiet month. 3 entries. I kept them: 'tired but kept walking.' That's enough to carry."* — seal is still awarded (**no shame mechanics**), but the paragraph is short and the unlock is deferred one week.

### 3.5 Data the compression needs (new)

```
MemoryCompression {
  userId, level: 'day'|'week'|'month'|'chapter'|'volume'|'portrait'|'epigraph',
  periodStart, periodEnd, text, sourceCounts{log,checkin,selfcare,answer},
  sourceWords, outWords, survivingPhrases[], strands[], question, monthScore,
  generatedBy ('ai'|'standard'), createdAt
}
```
Generation is idempotent per (userId, level, periodStart). Higher levels compress the **level below**, never raw — cheap, and guarantees the ladder is internally consistent.

---

## 4 · THE 12 MONTHS — ORGANIZED

Each month card uses the same 8 fields so the document (and later the UI config) stays scannable.

Legend → **UI** what the screen looks like · **Unlock** the one new capability · **AI** what it does · **Seal** badge · **Paragraph** the Month Paragraph (written here in Machiavelli's voice, as the demo-account example) · **Ceremony** the 1st-of-month moment.

Seal glyphs follow the existing badge themes: Water `∘ → ≈ → ≋`, Architecture `├─ → ╞═╡ → ║·║`; one glyph pair per quarter-step so the *year reads as a single growing mark*.

### ◼ PHASE I — OBSERVER · "THE SYSTEM LEARNS YOU"  (density: `breathable`)

#### MONTH 1 — **ARRIVAL**
```
UI        Barebone. Name, week/date, Check-in, one Memory question, Log. 4 blocks. Lots of air.
Unlock    Months-Unlocked counter appears (1/12, rest outlined). Custom theme.
AI        Silent mostly. Asks ONE question/day. Never interprets.
Seal      ∘  "DROPLET" / ├─ "FOUNDATION"        (first seal, plain)
Paragraph "The month began with a question about mornings. I answered tea; later, quiet. 
           Eleven mornings I wrote almost nothing, and I think that was also an answer."
Ceremony  Day 30: the empty 12-slot row gets its first filled slot. Soft, no confetti.
```
#### MONTH 2 — **ECHO**
```
UI        Same layout. "Last month:" paragraph pinned under Memory.
Unlock    Week Thread (Sunday 2-line summary) in Log margin.
AI        Starts callbacks: "Since you said tea…" (README Day-1→Month-2 promise made real).
Seal      ∘∘ "TWO DROPS" / ├─┤
Paragraph "Tea became a ritual with a book. The rain days were the loud days; sun days I wrote 
           less and did more. Something in me prefers weather to be a verdict."
Ceremony  First time AI quotes the user's old words back — highlighted.
```
#### MONTH 3 — **FIRST CHAPTER**  ★ quarter
```
UI        Density → `comfortable`. Check-in + Self-care become a visible pair.
Unlock    Badge Selection (Water vs Architecture). Monthly email begins (matches existing 3-mo job).
AI        Delivers first CHAPTER: 3 months → 1 paragraph + 3 strands + 1 contradiction.
Seal      ≈  "WAVE" / ╞═╡ "STRUCTURE"  — Chapter I seal, larger, animated once
Chapter   Strands: MORNINGS · WEATHER · RESTRAINT. Contradiction: "I ask for quiet and fill it."
Ceremony  Full-screen 6-second Chapter reveal (dismissible). Share-card export (optional).
```

### ◼ PHASE II — COMPANION · "THE SYSTEM WORKS WITH YOU"  (density: `comfortable`)

#### MONTH 4 — **PATTERN**
```
UI        Mood Patterns widget appears (calendar heat of check-ins).
Unlock    Pattern Insights (Consistency ≥ 66% path; month grants early access).
AI        Moves to second person. First routine suggestion tied to a pattern.
Seal      ≈· 
Paragraph "You check in hardest on Mondays and recover by Thursday. The pattern isn't the 
           problem — the Sunday night is. You tried a walk twice; both times it held."
Ceremony  Self-care button order re-sorts to YOUR most-used (visible, small, personal).
```
#### MONTH 5 — **ROUTINE**
```
UI        Planner Templates unlocked; Intentions widget pinned.
Unlock    Intention History.
AI        Proposes a 3-step "Evening" routine from your own clicks. Asks permission.
Seal      ≈≈ 
Paragraph "Five months. Evening is where I keep my promises: tea, ten minutes, the same chair. 
           Skipping once cost me two days. Consistency is cheaper than recovery."
Ceremony  Streak glow appears in header (evolved-glow), only if streak ≥ 7.
```
#### MONTH 6 — **HALF-DECLARED**  ★ half-year
```
UI        Density → `compact`. Stacks become tight semantic groups (Care / Mind / Community).
Unlock    Export Data. Narrative Reflection (AI synthesis on demand).
AI        VOLUME I = Chapter I + Chapter II folded. First "then / now" side-by-side.
Seal      ≋  "CURRENT" / ║·║ "ARCHITECTURE" — Volume I seal (gilded edge)
Volume    Compression shown: "5,900 words → 220 (27:1)". Surviving phrases lit.
Ceremony  Month Card turns from 6/12 to "Half". AI says one sentence only. Then silence for a day.
```

### ◼ PHASE III — GUIDE · "THE SYSTEM LEADS GENTLY"  (density: `compact` → `dense`)

#### MONTH 7 — **MEMORY OPENS**
```
UI        Memory Archive tab exposes all prior paragraphs, searchable by phrase.
Unlock    Advanced Memory (deep reflection questions). Private Spaces.
AI        Asks questions only the history can ask: "In month 2 you said X. Still true?"
Seal      ≋· 
Paragraph "Seven months and the system asks me things only I could have taught it. I answered 
           'still true' to four and 'no' to one — the one that mattered."
```
#### MONTH 8 — **CONTRADICTION**
```
UI        Dense. Pattern Recognition + Correlated Indexes join the main column.
Unlock    Correlated Indexes (self-awareness, composite).
AI        Surfaces your contradictions, kindly. Never resolves them for you.
Seal      ≋≈ 
Paragraph "I want solitude and I schedule company. The data doesn't call it hypocrisy; it calls 
           it two needs on different days. That reframing alone was worth the month."
```
#### MONTH 9 — **CHAPTER III** ★ quarter
```
UI        Density → `dense`. Header gains a one-line "state of you" ticker.
Unlock    Social Mentions; Cohort Connect (people with adjacent patterns).
AI        CHAPTER III + the first FORECAST ("Your autumn pattern suggests…").
Seal      ≋≋ "DEEP CURRENT" / ║·║· — Chapter III seal
Ceremony  The 3 chapters shown as three stacked paragraphs shrinking: 180 → 120 → 60 words.
```

### ◼ PHASE IV — MIRROR · "THE SYSTEM IS YOU, COMPRESSED"  (density: `dense` → `instrument`)

#### MONTH 10 — **VOICE**
```
UI        The AI's text now uses the user's own vocabulary and cadence (style-matched).
Unlock    Widget Arrange (drag-drop) — the user composes their own OS.
AI        Speaks in short lines; quotes more than it explains.
Seal      ║·║≈ 
Paragraph "It writes like me now. Shorter. It stopped explaining and started remembering."
```
#### MONTH 11 — **ARCHITECT**
```
UI        Architect widget + Board profile fully populated (/u/you becomes presentable).
Unlock    Public Profile showcase (Memory Story, archetype, Weather Station preview).
AI        Drafts your public Memory Story for approval (user edits; never auto-publishes).
Seal      ║·║≋ 
Paragraph "Eleven months. I could hand someone this page and they'd know me. I'd rather they 
           knew me than liked me — a prince's principle, applied to a diary."
```
#### MONTH 12 — **THE PORTRAIT**  ★ year
```
UI        `instrument` density. Everything justified. Months row 12/12 lit.
Unlock    LOT® AI mode: proactive, context-aware guidance across the whole OS; annual Portrait.
AI        VOLUME II + THE PORTRAIT (1 page) + THE EPIGRAPH (1 line).
Seal      ║·║ ≋  "THE YEAR" — dual-theme seal, only awardable once (Year 1, Year 2…)
Epigraph  "Read the sky, then the souls beneath it."   ← Machiavelli's one line
Ceremony  12-step replay: each Month Paragraph fades in, compresses, becomes the Portrait,
          then the Epigraph. 45 seconds. Shareable card. This is the screenshot moment.
```

---

## 5 · THE UI/UX EVOLUTION AT A GLANCE

```
MONTH   1   2   3   4   5   6   7   8   9  10  11  12
DENSITY ░░░░░░░░ ▒▒▒▒▒▒▒▒ ▓▓▓▓▓▓ ▓▓▓▓ ████ ████████
        breathable comfortable compact  dense  instrument
BLOCKS  4   5   6   8  10  12  14  16  18  20  22  24      (visible on main screen)
AI VOICE  observer ───── companion ───── guide ───── mirror
ARTIFACT  P   P   C   P   P   V   P   P   C   P   P   VOL+PORTRAIT+EPIGRAPH
          (P = Month Paragraph · C = Chapter · V = Volume)
SEAL      ∘  ∘∘  ≈  ≈· ≈≈  ≋  ≋· ≋≈ ≋≋ ║≈ ║≋  ║·║≋
```

**What the user feels:** M1 *"it's calm and empty."* · M3 *"it remembers me."* · M6 *"it's organizing my life."* · M9 *"it sees my contradictions."* · M12 *"it sounds like me."*

**Principles**
1. **Density follows trust, not time.** Month sets a *floor* for density; `visualRefinement` can raise it. Never lower it automatically.
2. **Reveal, don't add.** Prefer revealing what the user already created (old words, patterns) over new chrome.
3. **No streak shame.** Missing a month never removes a seal; it delays the unlock.
4. **Silence is a feature.** After a ceremony the AI stays quiet for a day.
5. **Every claim cites a count.** The AI's credibility is its arithmetic.

---

## 6 · MACHIAVELLI = MONTH 12 REFERENCE

`/u/machiavelli` already shows: archetype *The Strategist*, 2,847 answers, 1,469 notes, 842 active days, 1,469 streak, 87 self-awareness, one-paragraph `memoryStory`, wallet, weather station.

**Inconsistency to resolve:** a 1,469-day streak is ~48 months, but the product spec is a 12-month arc. Recommendation: keep the lore number (1469 is the founding year) but **present the demo as "Year 1 · Complete"** and add the new surfaces:

- **Months row** `■■■■■■■■■■■■ 12 / 12` with all 12 seals clickable.
- **Month Paragraph carousel** with the 12 paragraphs in §4 (Machiavelli voice) — hover/tap compresses to Chapter → Volume → Portrait → Epigraph, so a visitor *experiences* the ladder in 10 seconds.
- **Demo scrubber** `?month=1…12`: visitors drag from Month 1 (barebone) to Month 12 (instrument) and watch the density, widgets and AI voice change. This is the single best sales tool for the paid tier: *the product demos its own evolution.*
- Replace the single `memoryStory` string with `memoryLadder: { epigraph, portrait, volumes[2], chapters[4], months[12] }`.

---

## 7 · IMPLEMENTATION MAP (not done this session — design only)

| # | Work | Files | Size |
|---|---|---|---|
| 1 | `MemoryCompression` model + migration | `src/server/models/`, `migrations/` | M |
| 2 | Ladder generators (day/week/month/chapter/volume/portrait/epigraph); reuse `aiEngineManager`; **do not** use `slice(0,30)` | `src/server/utils/memory/story-generator.ts` → new `compression.ts` | L |
| 3 | Signals aggregator (log, check-in, answer, self-care) | `src/server/utils/logs.ts` | M |
| 4 | **Persist self-care clicks server-side** (today `localStorage` only) | `SelfCareMoments.tsx`, `api.ts` | S |
| 5 | Months state API `GET /api/months` (open/unlocked/sealed, floor progress) | `routes/api.ts` | M |
| 6 | Upgrade `MonthlyPulseWidget` → Month Card + `Months unlocked: n/12`; move dismiss state from `localStorage` to server | `MonthlyPulseWidget.tsx` | M |
| 7 | Month-driven density floor in `interfaceEvolution.ts` | `interfaceEvolution.ts`, `stores/evolution.ts` | S |
| 8 | 12 Month Seals + Year seal in badge system (new BadgeTypes; theme glyph map) | `badges.ts`, `docs/badges/` | M |
| 9 | Archive tab (Months) + Memory widget "Last month:" | `Logs.tsx`, `MemoryWidget.tsx` | M |
| 10 | Email: new "Month Paragraph" job, no 3-month gate | `scheduled-jobs.ts` | S |
| 11 | Demo: `memoryLadder` + `?month=N` scrubber | `public-api.ts`, `PublicProfile.tsx` | M |

**Suggested build order:** 4 → 3 → 1 → 2(month level only) → 5 → 6 → 9 → 10 → 7 → 8 → rest of ladder → 11. Ship **Month Paragraph + Months Unlocked** first; it's the smallest slice that makes the story tangible.

---

## 8 · RISKS / FLAGS FOUND IN THE SCAN

- **R1 · Calendar-only pulse.** `MonthlyPulseWidget` counts months from `joinedAt` (account creation), not Usership start, and has no activity floor → a user who joined free 8 months ago and upgrades today would see "Month 8". Needs a `usershipStartedAt`.
- **R2 · Tag case sensitivity.** `scheduled-jobs.ts` queries `tags @> ['usership']` (case-sensitive Postgres array containment) while the rest of the codebase compares case-insensitively and the enum value is `Usership`. The `db:admin add-tag … usership` CLI writes lowercase, so it likely works today, but any user tagged `Usership` (as via the enum/admin UI) would be silently skipped. **Verify production tag casing before relying on the email.**
- **R3 · Self-care is client-only.** Floors and the "self-care clicks" signal are not countable until they are logged server-side.
- **R4 · Story generator truncation.** Only the latest 30 answers feed the story, so a Month-12 story would forget Months 1–10. The ladder fixes this by design.
- **R5 · Wellness-claims line.** Month paragraphs must stay reflective, non-diagnostic; add a guard in the prompt and a post-filter.
- **R6 · Cost.** 1 paragraph/user/month + weekly/daily seeds on the Together AI Llama 3.3 70B tier is small; day seeds can be rule-based (no LLM) to keep cost ~0.

---

## 9 · OPEN QUESTIONS FOR S-2

1. Does Month 1 start at **Usership purchase** or at account creation for existing users? (Recommend purchase date.)
2. Should the Year Seal be **purchasable as a physical item** (LOT subscription ships physical goods) — e.g. a printed Portrait card in the box?
3. Is the public profile allowed to show a user's Month Paragraphs, or only Portrait + Epigraph by default? (Recommend: Epigraph public, rest opt-in.)
4. Water vs Architecture: let the user choose at Month 3 (as spec'd), or assign from behavior?
5. Past Month 12: Year 2 = "Volumes" (12→24, yearly Portrait stacking) — green-light to design?

---

```
AUTHORIZED BY: S-2 // VADIK MARMELADOV
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
```
