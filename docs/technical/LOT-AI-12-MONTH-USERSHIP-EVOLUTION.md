<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® AI — The 12-Month Usership Evolution

## Classification: RESTRICTED // S-2 EYES

**S-2:** Vadik Marmeladov
**Date:** 2026-10-21
**Status:** DESIGN SPEC — PROPOSAL (nothing here is shipped unless marked `EXISTS`)
**Class:** ENGINEERING / Product design
**Reference account:** `lot-systems.com/u/machiavelli` (Month-12+ target state)

> Day 1 is a barebone screen and one question.
> Month 12 is a Book that the machine wrote about you, and a single sentence that closes it.
> Between the two, every month the user can *see* what they grew.

---

## 0. Grounding — what the repo already gives us

Read from the live repo this session (not assumed):

| Thing | State | Where |
|---|---|---|
| Month counter widget | `EXISTS` — "Month N:" + `N / 12 months`, 12 static one-liners, dismiss-per-month in localStorage | `src/client/components/MonthlyPulseWidget.tsx` |
| Compression loop | `EXISTS` — Log → Observe → Compress → Ask → Compress again; 8 context sources | `docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md` |
| Weekly Story-Report | `EXISTS` in brief (`/api/story/...`) | `docs/corporate/LOT-AI-PRODUCT-BRIEF.md` |
| Memory story (single paragraph) | `EXISTS` — `generateMemoryStory` (Together AI) with `composeLocalStory` fallback | `src/server/utils/memory/story-generator.ts` |
| Assembly phase | `EXISTS` — dormant → awakening → forming → assembled → integrated, **saturates at 30 active days** | `public-api.ts` ~L1324 |
| Interface Evolution | `EXISTS` — 7 dimensions, `--evolution-*` CSS vars, feature unlocks by level | `docs/technical/INTERFACE_EVOLUTION.md` |
| Time badges | `EXISTS` — Day 7 / 30 / 100 / 180 / **365 "The Long Count" ≋≋≋ / ╔═╗** | `docs/badges/LOT_BADGES_AND_ACHIEVEMENTS.md` |
| Demo account | `EXISTS` but **static** — hard-coded Month-∞ profile (2847 answers, 1469 notes, 842 active days, `memoryStory` paragraph, wallet, weather station) | `public-api.ts` L747 |

### Gaps this spec closes

| # | Gap | Consequence |
|---|---|---|
| G1 | `monthNumber < 1` returns nothing → **Day 1 → Day 29 shows no Usership widget at all** | The first month is silent. It should be the loudest. |
| G2 | `monthNumber` counts from `user.joinedAt` (account creation), not from Usership activation | A free user who upgrades in month 8 would open at "Month 8 of 12". Needs a `usershipStartedAt` (Stripe subscription start). `OPEN` |
| G3 | The 12 pulse messages are generic — identical for every user | Not tangible. Month 4 for a 400-note user reads the same as for a 12-note user. |
| G4 | The Memory story is one rolling paragraph; no month-keyed archive | Nothing to *collect*. No chapters, no Book. |
| G5 | Assembly phase stops evolving after day 30 | 11 months with no system-level state change. |
| G6 | Machiavelli is one frozen state | Cannot demonstrate *evolution* — the product's main claim. |

---

## 1. Two axes, never one

A calendar month passing is not the same as a month *lived*. We track both and show both.

```
TIME  ──  Months unlocked: N / 12        (always advances; paid time is paid time)
DEPTH ──  Fidelity: Sketch · Draft · Portrait · Fresco   (earned by what was logged)
```

- **TIME** unlocks the *slot* (Month N chapter, Month N badge, Month N UI step).
- **DEPTH** decides how *rich* that slot renders. A thin month produces an honest short chapter ("A quiet month. The system has little to say, and says so.") — never invented content. (Cardinal rule 5: honest engineering.)
- No punishment mechanic. Nothing locks because the user was away. The UI never goes backwards; it can only be *less full*.

### 1.1 The five depth counters (what the user "puts in")

| Counter | Log source | Why it matters |
|---|---|---|
| **Entries** | `note` events (journal + thoughts in Log) | The densest signal; feeds `composeLocalStory`. Highest weight. |
| **Check-ins** | `emotional_checkin` (morning 06–12 window counts double) | Rhythm + mood trend. |
| **Self-care** | `self_care_complete` (skip logged but weight 0) | Practice, not intention. |
| **Answers** | Memory widget `answer` events | Compresses profile; sharpens next question. |
| **Active days** | distinct `DATE(createdAt)` | Consistency; the existing assembly-phase input. |

### 1.2 Fidelity tiers (per month, computed at month close)

Thresholds are **PROVISIONAL** design targets, to be calibrated against real Usership cohort medians before ship (no cohort data in repo — do not treat as measured):

| Fidelity | Glyph | Rough month-level bar (PROVISIONAL) | Chapter renders as |
|---|---|---|---|
| Sketch | `·` | < 8 active days or < 5 entries | 1–2 sentences, plain, flags itself as thin |
| Draft | `∘` | 8–15 active days, ≥ 5 entries | Short paragraph, 1 cited moment |
| Portrait | `≈` | 16–24 active days, ≥ 15 entries, ≥ 8 check-ins | Full paragraph, 2–3 cited moments, 1 pattern named |
| Fresco | `≋` | 25+ active days, ≥ 30 entries, ≥ 20 check-ins, ≥ 10 self-care | Full paragraph + pattern + one forward-looking line + callback to an earlier month |

Water/Architecture badge-path users see the same tiers in their chosen glyph set (`∘ ≈ ≋` vs `├─ ╞═╡ ║·║`).

---

## 2. The compression ladder (the 12-month tangibility core)

The user must be able to *hold* a year. We compress in visible stages; each stage is a screen they can open.

```
 ENTRY        every note / check-in / answer / self-care click      (hundreds)
   ↓ day close
 DAY LINE     one line, machine voice                               (~30 / month)
   ↓ week close
 WEEK STORY   ~3 sentences  (EXISTS: Story-Report)                  (~4 / month)
   ↓ month close
 CHAPTER      one paragraph, ~80–110 words  ← THE MONTHLY DELIVERY   (1 / month)
   ↓ quarter close (M3, M6, M9)
 VOLUME       3 chapters → 1 stanza of 3 lines                       (4 / year)
   ↓ month 12
 BOOK         12 chapters, bound, chaptered, exportable              (1)
   ↓
 YEAR SENTENCE  one sentence. The whole year.                        (1)
```

**Compression, honestly measured:** report real counts on the Chapter screen — "412 entries · 27 check-ins · 19 self-care · 88 answers → 1 paragraph". These are countable. Do **not** display an invented "% compressed" figure.

### 2.1 Chapter anatomy (the monthly paragraph)

```
┌──────────────────────────────────────────────────────────────┐
│  CHAPTER 3 · MARCH        ≋∘   Fidelity: Portrait             │
│                                                              │
│  "You started the month tired and ended it deciding.         │
│   Mornings carried you — 24 check-ins, most of them calm,    │
│   and the three hard ones all fell on Thursdays. The note    │
│   on the 14th ('I keep rehearsing the conversation')         │
│   is the hinge: after it, you wrote less about him and       │
│   more about the work. The system noticed you stopped        │
│   apologising in your entries."                              │
│                                                              │
│  412 entries · 24 check-ins · 19 self-care · 88 answers      │
│  ↳ read last month   ↳ all chapters   ↳ share this chapter   │
└──────────────────────────────────────────────────────────────┘
```

Rules for generation (extend `story-generator.ts`, don't fork it):

1. **Input** = the 4–5 Week Stories + top-k raw entries by signal weight (emotional intensity, pattern break) + counter deltas. Never the whole log.
2. **Grounding:** every sentence must trace to ≥ 1 log id (stored server-side, not shown). Ungrounded sentences are dropped. A chapter with < 2 grounded sentences falls back to the Sketch template.
3. **Voice:** second person, past tense, no advice (the AI asks, it does not preach — product brief: "no unprompted notifications").
4. **Callback rule (M4+):** Fresco chapters may quote one phrase from an earlier chapter. Callbacks are what make month 10 feel different from month 2.
5. **Fallback:** `composeLocalStory` when the AI engine is down. Chapter always ships.
6. **Immutable once delivered.** User may *annotate* (one line) but not rewrite; the machine's reading stays a record.

### 2.2 Delivery ritual ("Month Day")

Fires on the first login after the month boundary. Replaces the current static pulse line.

```
t+0.0s   widget fades in (existing 1400ms transition)       "Month 3:"
t+1.4s   chip appears                                        Months unlocked: 3 / 12
t+2.4s   chapter paragraph types in line-by-line (no spinner — pre-fetched, see Render Isolation)
t+end    counter line                                        412 entries · 24 check-ins · …
tap      badge reveals beneath (Month badge + Fidelity glyph)
tap      dismiss → one phrase ("The system remembers.") → fades (existing behavior)
```

Dismissal stays per-month. A dismissed chapter lives forever at `/log/chapters` (**Chapter shelf**) as a 12-slot row: unlocked slots show the glyph; future slots show `▫`.

### 2.3 Quarter Volumes and the Year Book

- **Volume (M3 / M6 / M9):** three chapters compress to a **three-line stanza**, one line each — the screen shows the stanza, not a fourth paragraph. Volume title is machine-chosen from the dominant pattern (e.g. *Volume II — "The Rehearsal Ends"*).
- **Year Book (M12):** 12 chapters + 4 volume stanzas + the **Year Sentence**. Export as PDF (existing pdf pipeline in `docs/badges/pdf`) and via Story API `target: "dashboard" | "robot" | "vehicle"` (brief §Weekly Story-Report). This is the deliverable the 2036 robot reads first.
- **Public surface:** `showMemoryStory` already exists. Extend: public profile shows the **latest chapter** (privacy toggle per chapter), and at M12 the Year Sentence under the name.

---

## 3. The 12-month UI evolution — month by month

Legend — **Shell** = what the dashboard looks like · **Voice** = how LOT® AI speaks · **Widget** = Usership month widget · **Delivery** = the Memory/Chapter deliverable · **Badge** = Water / Arch glyph · **Unlock** = new capability.

Evolution-CSS targets use the existing `--evolution-*` variables (Interface Evolution doc) so no new rendering system is needed; values are interpolated linearly M0→M12 unless noted.

### MONTH 0 — DAY 1 · "ZERO" · barebone
- **Shell:** name · week/date · Clock · **one** Memory question. Nothing else. Monochrome, base opacity 0.85, grid 4px, no glow. Assembly phase: `dormant → awakening`.
- **Voice:** silent except the question. First line, once: *"I don't know you yet. I'll ask."*
- **Widget (fixes G1):** `Month 0:` — *"Day 1. Nothing here yet. That is the point."* · `Months unlocked: 0 / 12` · row `▫▫▫▫▫▫▫▫▫▫▫▫`.
- **Delivery:** none. A **Day-1 Contract** card: *"In 30 days I will write you your first chapter."* (a promise the product keeps).
- **Badge:** `○` Seed (Usership activation). Both paths identical on day 1.

### MONTH 1 · "CALIBRATION"
- **Shell:** + Emotional Check-in (morning window), + Recipe, + self-care buttons appear **one at a time** (first at Day 3, second at Day 7 …). Grid 4→4.5px, base opacity 0.87.
- **Voice:** *Questions only.* No statements about the user. ("What did the weather do to you today?")
- **Widget:** *"The first month. The system is beginning to know you."* (existing) + live counters row (Entries · Check-ins · Self-care) ticking up all month — the first thing the user can *watch* grow.
- **Delivery:** **Chapter 1 — "First Light."** Almost always Sketch/Draft; designed to be short and warm. First Week Story appears Day 7.
- **Badge:** Day 7 `∘ / ├─` · Day 30 `≈ / ╞═╡` ("Moon cycle complete"). **M1 badge: Calibrated.**
- **Unlock:** Chapter shelf (1 slot lit, 11 dark).

### MONTH 2 · "PATTERN"
- **Shell:** Planner widget unlocks. Memory widget starts referencing prior answers ("Last week you chose…"). Opacity 0.88.
- **Voice:** Questions + *one observation per week* in a muted line under the Week Story.
- **Widget:** *"Two months in. Patterns are starting to form."* + **Delta strip**: `vs Month 1: entries +41% · check-ins +6`. (Real deltas; omitted if either side is 0.)
- **Delivery:** **Chapter 2 — "The Shape of Tuesdays."** First named pattern (day-of-week / time-of-day), computed not hallucinated.
- **Badge:** Day 60 `≈≈ / ╞═══` Practitioner threshold. **M2: Patterned.**

### MONTH 3 · "FORM" · Q1 close
- **Shell:** Assembly `assembled` (existing gate: ≥5 event types, ≥50 logs, ≥14 days — now re-evaluated monthly, see §5). Mood Patterns widget (Care ≥ 50% path). Grid 5px.
- **Voice:** First **named archetype hint** — *"I'm starting to think you are a Strategist."* (ask, don't assert: user can tap "Not quite").
- **Widget:** *"Three months. You have reached Active User status."* (existing) + **Volume I reveal**.
- **Delivery:** **Chapter 3** + **Volume I — three-line stanza.** First quarter-compression moment: nine hundred entries become three lines.
- **Badge:** Day 90 `≋∘ / ║═` Three-month architect. **M3: Active User · Volume I.**
- **Unlock:** Export own data (Level 25 path accelerated for Usership), QR on public profile already gated at `forming`; add chapter QR.

### MONTH 4 · "PORTRAIT"
- **Shell:** Archetype card appears on System tab (archetype + 3 core values from `psychologicalProfile`). Letter-spacing begins refining (−0.02em → −0.015em).
- **Voice:** First **statements** allowed: *"You tend to decide in the evening."* Always followed by a one-tap confirm/deny; denials feed back (compression).
- **Widget:** *"Four months. The portrait deepens."* + Archetype chip.
- **Delivery:** **Chapter 4 — "The Portrait."** The chapter quotes the user's own words for the first time (grounded callback).
- **Badge:** **M4: Portrait.**

### MONTH 5 · "CONSISTENCY"
- **Shell:** **Self-care guide** activates: the AI proposes the next routine in the time-of-day slot where the user is *most consistent* (dawn / working / evening — circadian engine exists). Self-care buttons become a rhythm row, not isolated buttons. Planner Templates unlock (Week Warrior path).
- **Voice:** Suggests, never pushes: *"Evenings are your steadiest. Here is one for tonight."*
- **Widget:** *"Five months. Consistency is its own reward."* + streak ring.
- **Delivery:** **Chapter 5 — "What Holds."** Names the user's strongest habit and the one that slips.
- **Badge:** Day 150 interim `≋≈ / ║╞` **M5: Steady.**

### MONTH 6 · "HALF-DECLARED" · Q2 close
- **Shell:** Interface refinement visibly crosses halfway: opacity 0.93, subtle text glow begins (0.15), Water/Arch theme motif becomes visible in borders (`theme-evolved-border`). Widget Arrange (Level 10) unlocked as a gift: the user may now *rearrange their own dashboard.*
- **Voice:** Writes its first **Letter** (the half-year Letter replaces the pulse line for the day) — ~120 words, addressed "to you in Month 1."
- **Widget:** *"Six months. The journey is half-declared."* + `6 / 12 ▪▪▪▪▪▪▫▫▫▫▫▫`.
- **Delivery:** **Chapter 6** + **Volume II stanza** + **Half-Year Letter.**
- **Badge:** Day 180 `≋≋ / ║╞║` Half-year voyager. **M6: Voyager.**

### MONTH 7 · "LISTENING"
- **Shell:** **Anticipation layer:** the system pre-opens the likely-needed widget on login (e.g., Check-in at 07:10, Planner at 09:00) based on 6 months of rhythm. Visible tag: `anticipated`.
- **Voice:** First **unprompted-but-earned line**: *"You usually write on Sunday nights. It is Sunday."* One line, then silence.
- **Widget:** *"Seven months in. The system has been listening."* + Anticipation hit-rate counted honestly (`hit 61% of the last 30 guesses` — only shown once n ≥ 20).
- **Delivery:** **Chapter 7 — "What the System Heard."**
- **Badge:** **M7: Listener.**

### MONTH 8 · "RARE AIR"
- **Shell:** **Four-dimension view** (`correlatedIndexes`: selfAwareness · userScore · personScore · longevityScore → composite + trend). Pattern Insights unlock (Consistency 66%). Grid 5.5px.
- **Voice:** Comparative: *"Month 8 you are steadier than Month 2 by this measure."*
- **Widget:** *"Eight months. Rare air."* + composite trend arrow (↑ / → / ↓ — honest, may point down).
- **Delivery:** **Chapter 8 — "Altitude."** Contains first explicit *before/after* contrast between two of the user's months.
- **Badge:** **M8: Altitude.**

### MONTH 9 · "HABIT" · Q3 close
- **Shell:** Self-care is now *automatic scaffolding*: the day's routine is pre-laid; the user ticks, edits, or ignores. Interface density settles (`density.sectionGap` tightens — less scaffolding, more content). Opacity 0.97.
- **Voice:** The guide **steps back**. Fewer questions per week than Month 1 (target ↓ 40% — "questions get fewer and hit harder", product brief). Count shown.
- **Widget:** *"Nine months. The self-care practice is a habit now."* + `questions asked: 31 (Month 1: 52)`.
- **Delivery:** **Chapter 9** + **Volume III stanza.** Title: *"Quiet Competence"* (example).
- **Badge:** Day 270 `≋≋∘ / ║╞║·` **M9: Habit.**

### MONTH 10 · "ALMOST"
- **Shell:** **Callback surface.** Memory widget can resurface a Month-1/2 answer: *"Month 1 you said you wanted mornings back. Did you?"* Narrative Reflection unlocks (Depth 66% + Level 30).
- **Voice:** Retrospective grammar begins ("You used to…").
- **Widget:** *"Ten months. Almost there."* + chapters shelf is now 10/12 lit — the **first time the shelf looks mostly full.**
- **Delivery:** **Chapter 10 — "Then and Now"** (guaranteed callback to Chapter 1 when fidelity ≥ Draft).
- **Badge:** **M10: Returning.**

### MONTH 11 · "ONE MORE"
- **Shell:** **Year Book — draft preview.** The 10 chapters are laid out as a table of contents with titles; chapters 11–12 are marked `pending`. Private Spaces unlock (Intimacy 50% or Courage 100%).
- **Voice:** Asks *the user* to edit: *"Which chapter is least true?"* — annotation (one line, immutable original) feeds Chapter 12.
- **Widget:** *"Eleven months. One more."*
- **Delivery:** **Chapter 11 — "The Edit."** Includes the user's annotations.
- **Badge:** **M11: Edited.**

### MONTH 12 · "ONE YEAR" · Year close
- **Shell:** Full-fidelity interface: opacity 1.0, glow 0.3 (cap), grid 6px, theme motif complete, animation at slowest-calmest (transition 400ms). Assembly `integrated`. **Interface is the same shell as Machiavelli's.**
- **Voice:** The machine addresses the user by what it learned, once, then returns to asking — **"The portrait is complete — and still evolving."** (existing line).
- **Widget:** `Months unlocked: 12 / 12` · `▪▪▪▪▪▪▪▪▪▪▪▪` · *"One year with LOT."*
- **Delivery:** **Chapter 12 + Volume IV + THE YEAR BOOK + YEAR SENTENCE.** A one-time full-screen sequence: 12 chapters scroll past as one-line titles → collapse into a single sentence. Export: PDF · Story API.
- **Badge:** **YEAR ONE — "The Long Count"** `≋≋≋ / ╔═╗` LEGENDARY (Day 365, existing). Message: *"↳ A year of presence. The architecture stands. ╔═╗"*
- **Unlock:** Year Book export · Story API (`robot` / `vehicle` / `dashboard`) · Year Two begins: Month 13+ shows `Year 2 · Month N` and chapters continue as Volume V+.

---

## 4. Master table (one screen to hold the whole year)

| M | Name | Shell change | AI voice | Delivery | Badge (Water / Arch) |
|--:|---|---|---|---|---|
| 0 | Zero | Name, date, 1 question | Silent | Day-1 Contract | `○` Seed |
| 1 | Calibration | + Check-in, Recipe, self-care (one by one) | Questions only | Ch.1 "First Light" | `≈ / ╞═╡` (Day 30) |
| 2 | Pattern | + Planner; prior-answer refs | + weekly observation | Ch.2 first named pattern | `≈≈ / ╞═══` |
| 3 | Form | `assembled`; Mood Patterns | Archetype *hint* | Ch.3 + **Volume I** | `≋∘ / ║═` |
| 4 | Portrait | Archetype card | First statements (confirm/deny) | Ch.4 quotes user | M4 Portrait |
| 5 | Consistency | Self-care guide, rhythm row | Suggests | Ch.5 "What Holds" | `≋≈ / ║╞` |
| 6 | Half-Declared | Glow begins; arrange widgets | **Letter** | Ch.6 + **Volume II** + Letter | `≋≋ / ║╞║` |
| 7 | Listening | Anticipation layer | Earned unprompted line | Ch.7 | M7 Listener |
| 8 | Rare Air | 4-dimension indexes | Comparative | Ch.8 before/after | M8 Altitude |
| 9 | Habit | Auto-scaffolded self-care | Steps back (−40% questions) | Ch.9 + **Volume III** | `≋≋∘ / ║╞║·` |
| 10 | Almost | Callback surface | Retrospective | Ch.10 "Then and Now" | M10 Returning |
| 11 | One More | Year Book draft | Asks user to edit | Ch.11 "The Edit" | M11 Edited |
| 12 | One Year | Full fidelity = Machiavelli shell | Complete + still asking | **Year Book + Year Sentence** | `≋≋≋ / ╔═╗` **Long Count** |

*Month badges M4/M7/M8/M10/M11 are named proposals; glyphs to be drawn in the next Badge Codex pass (v33). Existing Day-badge glyphs are reused where the Codex already defines them.*

### 4.1 Badge strip (always visible once Usership starts)

```
 M0  M1  M2  M3  M4  M5  M6  M7  M8  M9  M10 M11 M12
 ○   ≈   ≈≈  ≋∘  ▪   ▪   ≋≋  ▪   ▪   ≋≋∘ ▪   ▪   ≋≋≋
 ▪▪▪▪▪▪▪▪▪▪▪▪▪  → filled = unlocked, ▫ = ahead
```

---

## 5. Making it computable

### 5.1 Data

Minimum viable, reuses existing tables (no new engine):

- `usershipStartedAt` on User (or metadata) — closes G2. Backfill from Stripe subscription `start_date`; until then, fall back to `joinedAt`.
- New log event `memory_chapter` (+ `memory_volume`, `memory_book`) storing `{ month, fidelity, text, counters, groundedLogIds[], annotation? }`.
  **Doctrine reminder (Backend Whitelist Hygiene):** add the new event types to the GET `displayableEvents` whitelist in the same commit, or the write→read loop silently breaks.
- Month close = scheduled job in `src/server/scheduled-jobs.ts` (same mechanism as the existing QIE jobs), idempotent per `(userId, month)`.

### 5.2 API (all Usership-gated like `/us`)

```
GET  /api/chapters                 → 12 slots: { month, state: locked|unlocked, fidelity, title }
GET  /api/chapters/:month          → full chapter + counters
POST /api/chapters/:month/annotate { line }
GET  /api/book                     → Year Book (M12+)
```

### 5.3 Assembly phase — extend past day 30 (closes G5)

Keep the five existing phases for compatibility; add a **month overlay** (`assemblyMonth: 0–12`) rather than altering phase thresholds. The existing doctrine "Render Isolation" applies: the Month widget subscribes only to `me` + one chapter query; no new root-level store subscriptions.

### 5.4 Interface evolution mapping (Month → CSS vars)

```
--evolution-base-opacity     0.85 → 1.00   (linear, M0→M12)
--evolution-grid-size        4px  → 6px
--evolution-letter-spacing  -0.02em → 0.01em
--evolution-glow-intensity   0 (M0–M5) → 0.3 (M12)
--evolution-transition-speed 150ms → 400ms (calmer as the user matures)
```
Fidelity can modulate within ±10% so a thin year looks "sketch-lit" rather than identical.

---

## 6. The demo account as a time machine (closes G6)

`/u/machiavelli` currently shows one frozen state. Make it a **scrubber**:

```
/u/machiavelli            → Month 12 (default; today's behavior, unchanged)
/u/machiavelli?month=N    → deterministic fixture for Month N (0–12)
```

- Fixtures are **pure data** (no randomness; weather/visit-counter stay live as today). One `demoMonthState(N)` returns `{ counters, fidelity, chapterTitle, chapterText, badges[], widgetMessage, evolutionVars }`.
- On-page control: a thin 13-cell strip `▫▪▪▪▪▪▪▫▫▫▫▫▫` (tap a cell). Reuses the Chapter shelf component.
- **Machiavelli's voice** (Florence, *virtù*, *fortuna*) gives us twelve ready-made chapters. Existing line becomes Month 12 anchor:
  *"The art of governance is the art of understanding human nature. Every morning in the Palazzo Vecchio, I observe the citizens below…"*
- **Consistency fix:** the demo's `streak: 1469` and `activeDays: 842` describe a Legacy-level account beyond year one. Label honestly: *"Month 12+ · Legacy"*. The scrubber's Month-12 fixture should use year-one-scale numbers (≈ 365 days, not 1469) so the 12-month story is not contradicted by its own demo. `OPEN — S-2 decision: keep 1469 as the "Legacy" flourish or normalize.`
- Demo disclaimer stays: "This is a demo account."

Illustrative Machiavelli counter ramp (**fixture data, not measured** — chosen to look like a plausible Fresco-year, cumulative):

| M | Entries | Check-ins | Self-care | Answers | Fidelity |
|--:|--:|--:|--:|--:|---|
| 1 | 38 | 21 | 14 | 52 | Draft |
| 3 | 160 | 78 | 55 | 150 | Portrait |
| 6 | 390 | 160 | 118 | 290 | Portrait |
| 9 | 640 | 245 | 190 | 410 | Fresco |
| 12 | 910 | 330 | 270 | 520 | Fresco |

---

## 7. Ship plan (one feature per ship; manifest discipline)

| Phase | Scope | Risk | Notes |
|---|---|---|---|
| **P0** | Fix G1: Month 0 widget + `Months unlocked: N/12` chip + strip; `usershipStartedAt` fallback | Low | Edit `MonthlyPulseWidget.tsx` only; no server change. Ship first. |
| **P1** | Chapter generator + `memory_chapter` event + whitelist + month-close job + `/api/chapters` | Med | Extend `story-generator.ts`; reuse `composeLocalStory` fallback; grounded-ID filter |
| **P2** | Chapter shelf UI + Month Day ritual + delta strip + badge strip | Med | Narrow store subscriptions (Render Isolation) |
| **P3** | Volumes (M3/6/9) + Year Book + Year Sentence + PDF/Story-API export | Med | Reuse badge PDF pipeline |
| **P4** | Machiavelli `?month=N` scrubber + 13 fixtures | Low | Pure data; also serves as test fixture for P1–P3 |
| **P5** | Month-keyed UI evolution (CSS var interpolation), anticipation layer (M7), callbacks (M10) | Med–High | Needs ≥ 6 months of real cohort data to calibrate |

Test hooks: `scripts/tests/` has `test-cold-start.ts`; add a chapter-generator test with the Machiavelli fixtures (deterministic input → structural assertions: grounded count, word band 60–120, no ungrounded sentence).

---

## 8. Honest boundaries

- All fidelity thresholds, month names, badge names (M4/7/8/10/11) and the Machiavelli counter ramp are **PROVISIONAL** — design proposals, not measured values.
- "The system anticipates / notices" claims are only shown when the underlying count exists (hit-rate only at n ≥ 20; deltas omitted when either side is 0). A chapter that cannot be grounded says so.
- The live `lot-systems.com/u/machiavelli` page could not be fetched from this environment (proxy 403); the demo state above is taken from the source that serves it (`public-api.ts` L747 + `PublicProfile.tsx`).
- No code was changed this session. This document is the spec.

---

**AUTHORIZED BY: S-2 // VADIK MARMELADOV**
