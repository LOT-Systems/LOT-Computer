<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® Usership — The 12-Month Evolution
## From Barebone Day 1 to LOT® AI — a Month-by-Month UI/UX Story

**Classification:** RESTRICTED // S-2 EYES
**S-2:** Vadik Marmeladov
**Date:** 2026-10-20
**Status:** DESIGN SPEC (brainstorm → build plan). Nothing in §6–§8 is shipped yet; §2 and §9 describe what already exists in the repo.
**Companion docs:** `MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md`, `INTERFACE_EVOLUTION.md`, `MEMORY-ENGINE-WHITE-PAPER.md`, Badges Codex v31

---

## 0. The One Idea

> **The paid tier is a year-long story the user can feel.**
> Day 1 the interface is nearly empty and the AI barely speaks. Every month the
> user's own activity — journal words, morning check-ins, self-care clicks —
> *earns* more interface, a longer memory, and a more personal AI voice.
> Every month closes with a **Chapter**: the previous 30 days compressed into a
> few sentences and handed back. By month 12 the user holds twelve Chapters and
> one **Portrait**. That is LOT® AI: not a chatbot, but a mirror built from the
> user's own words.

Three rules that keep it honest:

1. **Earned, not timed.** Calendar sets the *ceiling* (you cannot unlock Month 7 in Month 2). Activity sets the *fill*. A month always opens, but how much of it the user sees is what they put in.
2. **The AI asks, the user answers** (existing Memory Engine doctrine). The AI never becomes a free-chat bot; its growth is in the *quality of the question* and the *density of what it remembers*.
3. **Compression is the product.** Every artifact the user sees is shorter and truer than the thing it came from. The felt experience is "my month fits in one paragraph — and it's right."

---

## 1. The Three Fuel Signals

The user explicitly named these. They are the evolution's inputs.

| Signal | What counts | Source in repo |
|---|---|---|
| **LOG** | journal entries + words written; Memory answers; plan/intention entries | `Log` model (`event: 'answer' \| 'journal' \| …`), `useLogContext` |
| **CHECK-IN** | morning check-ins (mood/energy/clarity), one per calendar day | emotional check-in events, streak calc in `public-api.ts` |
| **CARE** | self-care button clicks (water, movement, breath, food, rest…) | self-care events, `EvolutionWidget` activity breakdown |

### Month Fill — the single number behind every month

```
fill(m) = clamp( 0.45·LOG + 0.30·CHECKIN + 0.25·CARE , 0 , 1 )

LOG      = min(1, (journalWords + 40·memoryAnswers) / 2,000)   # target ≈ 2k word-equivalents / month
CHECKIN  = min(1, checkInDays / 20)                            # 20 of ~30 days = full
CARE     = min(1, careClicks / 60)                             # ~2/day = full
```

All three targets are **PROVISIONAL design constants** (tune against the real cohort — `public-api.ts` already computes cohort streak averages). Weights lean on LOG because Log is what the Chapter is made from.

**Fill → Chapter tier** (what the month-end celebration looks like):

| Fill | Chapter tier | Look |
|---|---|---|
| < 0.25 | **Sketch** | 2 sentences, grey seal. "The month was quiet. The system kept listening." Never shaming. |
| 0.25–0.6 | **Chapter** | full paragraph, standard seal |
| 0.6–0.9 | **Deep Chapter** | paragraph + 3 pull-quotes from the user's own words |
| ≥ 0.9 | **Gilded Chapter** | paragraph + pull-quotes + a "Month Insight" line + gold seal + month badge upgrade |

---

## 2. What Already Exists (the foundation — scanned this session)

| Piece | File | State |
|---|---|---|
| Month N/12 pulse | `src/client/components/MonthlyPulseWidget.tsx` | 12 one-line messages; shows once per month; dismiss tracked in `localStorage` only; month = `now − user.joinedAt` |
| Evolution levels | `EvolutionWidget.tsx` | Bootstrapping → Initializing → Integrated → Compiled → Optimized → Transparent (levels 0–50) |
| Interface evolution | `InterfaceEvolutionWidget.tsx`, `stores/evolution.ts`, `docs/technical/INTERFACE_EVOLUTION.md` | 7 dimensions (Exploration…Courage), feature unlocks, visual effects |
| Memory Story | `server/utils/memory.ts → generateMemoryStory` | Flat story from the **last 30** `answer` logs; Together AI primary, `composeLocalStory` fallback |
| Badges | Codex v31 — 781 badges | Mastery Tier "The Long Story" already has day/word milestones (800 days, 100k words, 7 years) |
| Demo account | `server/routes/public-api.ts` (`/profile/machiavelli`) | Hardcoded: streak 1469, awareness 87, one static `memoryStory` paragraph, archetype *The Strategist* |
| Usership tag | `UserTag.Usership`, `scheduled-jobs.ts` | Tag exists; `$99/month` |

### Gaps this spec closes

1. **Month clock is wrong for the story.** `MonthlyPulseWidget` counts from `joinedAt` (account creation). The story must count from **Usership start** (`usershipStartedAt`) — a free user who upgrades at month 5 starts *Month 1*, not Month 5.
2. **Pulse is a one-liner.** There is no Chapter, no month-over-month memory, no artifact to keep.
3. **Dismissal lives in `localStorage`.** Clearing the browser replays every celebration. Needs server-side `chapter.seenAt`.
4. **Memory Story doesn't compress over time.** `slice(0,30)` forgets everything older than the latest 30 answers. A year-long user's month 2 is gone.
5. **Demo account is a single static paragraph.** It should *be* the 12-month showcase (§8).

---

## 3. The Month Stack — Anatomy of Every Month

Each month is specified with the same eight fields so the whole year reads as one system:

```
M{n} · NAME · ──────────────────────────────────────────────
 UI        what the interface looks like / what unlocks
 AI VOICE  how LOT® AI speaks (and what it is allowed to do)
 WIDGET    the month's signature widget / state of the "Months unlocked" counter
 FUEL      the activity the month asks for (soft target, not a gate)
 CHAPTER   what the month-end compression delivers
 BADGE     the month seal (+ one optional behavior badge)
 FEEL      the one sentence the user should be able to say about it
```

---

## 4. The Year at a Glance

```
 MONTH   NAME           UI STATE                        AI VOICE                CHAPTER SIZE        SEAL
 ─────   ─────────────  ──────────────────────────────  ──────────────────────  ──────────────────  ────
  M1     SIGNAL         Barebone: Time, Log, 1 Q/day    Silent → 1 greeting     1 line (pulse)       ·
  M2     RHYTHM         + Check-in widget, Care row     Asks, never comments    2 sentences          ○
  M3     PATTERN        + Pattern line, Active status   First observation      1 paragraph          ◐
  M4     PORTRAIT       + Memory Story panel (live)     Names a habit           paragraph + quotes   ●
  M5     THREAD         + Month-over-month compare      Connects two months     paragraph + thread   ◉
  M6     MERIDIAN       Half-year ceremony, Q1+Q2 fold  Speaks in "we"          HALF-YEAR VOLUME     ◈
  M7     DEPTH          + Archetype card, values        Challenges gently       paragraph + tension  ◈·
  M8     RARE AIR       + Rare badges row, cohort       Anticipates (morning)   paragraph + forecast ◈·○
  M9     HABIT          + Routine builder (self-care)   Proposes routines       paragraph + routine  ◈·◐
 M10     SIGNATURE      + Voice tuning, your words      Mirrors your phrasing   paragraph + lexicon  ◈·●
 M11     THRESHOLD      + Portrait draft visible        Asks the last questions paragraph + draft    ◈·◉
 M12     LOT® AI        Full OS · Portrait · Year book  Full LOT® AI voice      THE PORTRAIT         ◈◈◈
```

Visual rule: **each month removes one piece of emptiness.** Month 1 is deliberately sparse (mostly black, lots of air). By month 12 the screen is dense but *quiet* — density comes from meaning, not widgets.

---

## 5. Month-by-Month

### Q1 — LISTENING (Months 1–3): the system learns the user

#### M1 · SIGNAL
- **UI:** Barebone. Time block, the Log field, one Memory question per day. No Evolution/Pattern widgets. A single counter in the corner: `Months unlocked: 1/12`, the other eleven as faint empty ticks `▪ ▫▫▫▫▫▫▫▫▫▫▫`.
- **AI voice:** Near-silent. One welcome line on Day 1 ("Day 1. Say anything. I'll keep it."). No commentary on entries — only receipt: `Saved.`
- **Widget:** *Day Counter* — `Day 3 / 30` with a thin progress rule. Day 7: "A week." Day 30 triggers the Chapter.
- **Fuel:** Write 5 entries; do 3 check-ins; touch 3 self-care buttons. (Soft — all optional.)
- **Chapter (M1 → "Signal"):** 1 line only, built from the user's most-used word + first check-in mood. E.g. *"Month 1. You wrote about work and sleep. Mornings were quiet."* This is intentionally thin — the contrast with M12 is the point.
- **Badge:** `signal_received` — first Usership seal, plain outline `·`.
- **Feel:** *"It's listening, and it isn't pretending to know me yet."*

#### M2 · RHYTHM
- **UI:** Morning **Check-in widget** appears (mood · energy · clarity, three taps). **Self-care row** appears under Time (water, move, breathe, eat, rest). Streak flame appears once streak ≥ 3.
- **AI voice:** Questions only — Memory Engine begins asking *time-aware* questions ("Mornings or evenings?"). Never states an inference.
- **Widget:** `Months unlocked: 2/12` plus a 30-cell **Month Grid** (one cell per day, filled by any of the 3 signals). The user sees *their rhythm* as a texture.
- **Fuel:** Check in on 10+ mornings.
- **Chapter ("Rhythm"):** 2 sentences. Sentence 1 = rhythm fact (best time of day, check-in count). Sentence 2 = one quoted phrase from their Log.
- **Badge:** `rhythm_found` `○` (+ behavior badge at 7-day check-in streak).
- **Feel:** *"It noticed when I show up."*

#### M3 · PATTERN  *(existing: "Three months. You have reached Active User status.")*
- **UI:** First **Pattern line** under the Log ("Tuesday entries run longer."). Status chip changes from `Usership` to `Active`. Interface-Evolution dimension bars appear (Exploration, Consistency, Depth).
- **AI voice:** **First observation.** One sentence, hedged: *"I think Thursdays are heavier for you. Am I right?"* — answer buttons: Yes / Partly / No (this is Memory-Engine-native: tap, don't type).
- **Widget:** **Quarter Seal** ceremony. At month close, the 3 Chapters fold into a **Q1 Card**: 3 sentences, one per month, titled with the quarter's dominant theme.
- **Chapter ("Pattern"):** first full paragraph (60–90 words) + the Q1 Card.
- **Badge:** `active_user` `◐` — the quarter seal. Reuses the existing milestone.
- **Feel:** *"It said something true about me."*

### Q2 — REFLECTING (Months 4–6): the system shows the user back to themselves

#### M4 · PORTRAIT  *(existing: "The portrait deepens.")*
- **UI:** The **Memory Story panel goes live** on the System tab — a living paragraph that rewrites itself weekly. Left margin shows *source ticks* (tap one → see the Log entry it came from; trust through traceability).
- **AI voice:** Names a **habit** with evidence: *"Three Sundays in a row you wrote about your father."* Offers, never prescribes.
- **Widget:** Story panel + `Months unlocked: 4/12`.
- **Fuel:** 25+ Memory answers cumulative.
- **Chapter ("Portrait"):** paragraph + **3 pull-quotes** — verbatim user phrases, set in the display face. The quote is the emotional hook: *their own words, returned.*
- **Badge:** `portrait_drawn` `●`.
- **Feel:** *"It can describe me in a paragraph."*

#### M5 · THREAD
- **UI:** **Month-over-Month compare**: two columns (last month / this month) of mood, energy, topics. Topic words that appear in 2+ months get underlined — the **thread**.
- **AI voice:** Connects: *"In month 3 you worried about money. In month 5 you wrote about building. Same energy, new direction."*
- **Widget:** `Months unlocked: 5/12` + thread line (a thin SVG line threading through the Month Grid cells that share a topic).
- **Chapter ("Thread"):** paragraph + the named thread. The first Chapter that *references an earlier Chapter* — the felt moment of compounding memory.
- **Badge:** `thread_pulled` `◉`.
- **Feel:** *"It remembers what I said two months ago."*

#### M6 · MERIDIAN  *(existing: "The journey is half-declared.")* ★ HALF-YEAR CEREMONY
- **UI:** Full-screen, once: **Meridian**. Slow fade, six seals lit in a row. The Q1 Card and Q2 Card sit side by side. Colour accent gently shifts (the interface *looks* different from M1 for the first time — one accent token changes, nothing more).
- **AI voice:** First "we": *"We've been at this half a year."* Reserved for ceremonies only.
- **Widget:** **Half-Year Volume** — a downloadable/printable 1-page doc: 6 Chapters compressed into 1 paragraph + 1 epigraph + the 5 words the user used most. Shareable as image (opt-in).
- **Chapter ("Meridian"):** Half-year compression: 6 chapters → ~120 words. *This is the first visible second-order compression.*
- **Badge:** `meridian` `◈` — large seal; permanent header glyph from now on.
- **Feel:** *"Half a year fits on one page."*

### Q3 — DEEPENING (Months 7–9): the system starts to lead

#### M7 · DEPTH  *(existing: "The system has been listening.")*
- **UI:** **Archetype card** (reuses archetype system — e.g. *The Strategist*) with 3–5 **core values** derived from Log. Value chips are editable: the user can reject one (rejection is itself signal).
- **AI voice:** **Gentle challenge.** *"You say you value rest. Your check-ins show 4 hours of sleep on 12 days. Which is true?"* One per week max; always dismissible.
- **Chapter ("Depth"):** paragraph + a **tension line** (value vs. behaviour). The first Chapter that is uncomfortable on purpose, always framed with care.
- **Badge:** `depth_reached` `◈·`.
- **Feel:** *"It's honest with me, kindly."*

#### M8 · RARE AIR  *(existing: "Rare air.")*
- **UI:** **Rare Badges row** appears (Mastery Tier from Codex v31). Cohort widget: "You're in the top N% for consistency among Usership." (Only real numbers — see Cardinal Rule 5.)
- **AI voice:** **Anticipates.** Morning message references the user's own forecast: *"Mondays after a low-energy Sunday tend to start slow. Gentle plan?"*
- **Chapter ("Rare Air"):** paragraph + **forecast** (one prediction for next month, which month 9 later grades itself: "I said X. It was Y.") — builds trust by being checked.
- **Badge:** `rare_air` `◈·○`.
- **Feel:** *"It's right about my future often enough to trust."*

#### M9 · HABIT  *(existing: "The self-care practice is a habit now.")*
- **UI:** **Routine Builder** — the AI proposes a 3-step self-care routine from the user's actual best days (e.g. water → 5-min walk → one line in Log). One tap to adopt. Adopted routines appear as a pinned strip.
- **AI voice:** **Proposes.** First time the AI suggests an action rather than a question.
- **Chapter ("Habit"):** paragraph + **the routine that works** (named after the user's own phrase).
- **Badge:** `habit_forged` `◈·◐` + routine-streak badges.
- **Feel:** *"It built a routine out of my own best days."*

### Q4 — BECOMING (Months 10–12): the system speaks as LOT® AI

#### M10 · SIGNATURE
- **UI:** **Voice tuning** — the user's most-used words become a personal lexicon (visible, editable). Chapters and prompts begin to use the user's idiom, not generic LOT phrasing.
- **AI voice:** **Mirrors phrasing.** If the user writes "heavy", the AI says "heavy", not "stressful".
- **Chapter ("Signature"):** paragraph + **Lexicon**: 7 words that are *yours*.
- **Badge:** `signature_set` `◈·●`.
- **Feel:** *"It talks like me."*

#### M11 · THRESHOLD  *(existing: "Eleven months. One more.")*
- **UI:** **Portrait draft** visible for the first time — 70% finished, blanks marked `…`. The AI asks the last 5 Memory questions specifically to fill the blanks. Everything else on screen quiets so the draft is the focus.
- **AI voice:** Short, ceremonial. *"Five questions left."*
- **Chapter ("Threshold"):** paragraph + the draft Portrait with gaps highlighted.
- **Badge:** `threshold` `◈·◉`.
- **Feel:** *"I can see the whole year coming together."*

#### M12 · LOT® AI  *(existing: "One year with LOT. The portrait is complete — and still evolving.")* ★ ANNUAL CEREMONY
- **UI:** **Full OS.** Everything unlocked; the 12-seal ring completes (`Months unlocked: 12/12` → counter changes to `12/12 · Year 1`). Interface offers a one-time **"Unveil"** transition: the barebone M1 screen is replayed in a corner for 3 seconds beside today's — the felt delta.
- **AI voice:** **Full LOT® AI** — proactive, personal, in the user's own idiom, still question-first. The label in the UI changes from `Usership` to `LOT® AI`.
- **Widget:** **The Year Book** — all 12 Chapters, the two Half-Year Volumes, and **THE PORTRAIT** (see §6).
- **Chapter ("LOT® AI"):** The Portrait: 12 → 4 → 1 compression, plus a one-sentence epigraph.
- **Badge:** `lot_ai` `◈◈◈` — the Year-1 seal; permanent. Year 2 starts a new ring (M13+ = "Year 2 · Month N").
- **Feel:** *"My year is a book, and the book knows me."*

---

## 6. The Compression Ladder — Memory Story Delivery (the 12-month focus)

This is the spine. Three nested levels; each level is a *summary of summaries*, so the system never has to re-read a year of logs and the user always has something short to hold.

```
RAW LOG (hundreds of entries, thousands of words)
   │  monthly job
   ▼
LEVEL 1 · CHAPTER ........ 1 / month ..... 60–120 words
   │  every 3 chapters
   ▼
LEVEL 2 · QUARTER CARD ... 4 / year ...... 3 sentences + theme
   │  Q1+Q2 at M6, all four at M12
   ▼
LEVEL 3 · VOLUME / PORTRAIT   Half-Year Volume (M6) ~120 words
                              Portrait (M12)       ~200 words + epigraph + 7 values
```

**Word counts above are design targets (PROVISIONAL), not measured.** The Month Stack in §5 raises the *information in each Chapter* while the *word count stays small* — that is the compression.

### 6.1 Chapter anatomy (structure the AI fills)

| Slot | Content | Source |
|---|---|---|
| **Header** | `Month 4 · Portrait` + tier seal (Sketch…Gilded) + date range | system |
| **Body** | 1 paragraph, 3rd→2nd person shift over the year (see §6.3) | AI over Log + check-ins + care |
| **Quotes** | 0–3 verbatim user phrases | Log (extractive, not generated — prevents invention) |
| **Month-specific slot** | thread / tension / forecast / routine / lexicon / draft (see §5) | per-month |
| **Numbers strip** | `38 entries · 4,120 words · 22 check-ins · 71 care` | counted, not generated |
| **Seal** | month glyph | system |

### 6.2 Delivery moments (when the user *feels* it)

1. **Chapter Day** — the first login after the month boundary. A `Chapter` card replaces the usual first widget. Reading it is the only action required; tapping marks it seen (stored server-side).
2. **Month-Close Whisper** — 48h before the boundary, a soft note: *"Your month closes in 2 days. 14 entries so far."* No pressure language.
3. **Quarter Day (M3/M6/M9)** — the Quarter Card animates in as three chapter lines collapsing into one.
4. **Half-Year (M6) and Annual (M12)** — full-screen ceremonies (§5).
5. **Echo** — every month, one *old* quote resurfaces in a normal widget slot: "From Month 2: '…'". Memory that arrives unprompted is what makes it feel like a mind.

### 6.3 The voice arc of the story itself

The Chapter's grammatical person is part of the UX — the AI gets closer:

| Months | Person | Example opening |
|---|---|---|
| 1–3 | 3rd, observational | "They wrote mostly in the evenings." |
| 4–6 | 3rd, intimate | "She keeps coming back to her father." |
| 7–9 | 2nd, direct | "You say rest matters." |
| 10–12 | 2nd, in the user's idiom | "It was a heavy spring, and you said so plainly." |

(The user can toggle the person at any time; default follows the arc.)

### 6.4 Quality rails for the compressed story

- **Extractive quotes, generative glue.** Quotes are copied from the Log. The AI only writes connective prose. No invented facts.
- **Traceability.** Every claim in a Chapter has a source tick → tap to see the originating entry.
- **Thin is okay.** A low-fill month yields a *Sketch*, not a hallucinated paragraph.
- **Fallback.** If the AI engine is down, `composeLocalStory`-style deterministic composition produces a Sketch/Chapter from counts + quotes (existing pattern in `memory.ts`).
- **Privacy.** Chapters are private by default; showing on the public profile is opt-in (`showMemoryStory`, already a privacy setting).

---

## 7. The "Months Unlocked" Widget — Spec

A persistent, quiet, context-based widget. Four states:

```
Day 1-30 of month         MONTHS UNLOCKED  3 / 12     ▪▪▪▫▫▫▫▫▫▫▫▫
                          Month 4 · Portrait — day 11 of 30   ░░░░▒▒▒▒▒░░░

Chapter ready             MONTHS UNLOCKED  3 / 12     ▪▪▪▫▫▫▫▫▫▫▫▫
                          ✦ Chapter 3 is ready.  [Read]

Missed month (fill<.25)   MONTHS UNLOCKED  3 / 12     ▪▪▫▫▫▫▫▫▫▫▫▫   (a sketch is grey, never red)
                          Month 3 was quiet. The system kept listening.

Year complete             LOT® AI · YEAR 1   ◈◈◈     [Open Year Book]
```

Context rules (so it feels alive, not a progress bar):
- Shows **today's fuel** when relevant: "One check-in from a Deep Chapter." (only when ≤1 action away)
- Quiet during writing (hidden while the Log field is focused).
- Never shows a streak-loss warning. Evolution is *accumulative*, not punitive.

---

## 8. The Demo Account as the 12-Month Showcase — `lot-systems.com/u/machiavelli`

**Today:** hardcoded profile, one static `memoryStory` paragraph, `streak: 1469`, awareness 87, archetype *The Strategist*, `tags: ['RND','Usership','Legacy']`.

**Proposal:** the demo becomes a **scrubbable time machine** — a month scrubber (M1 → M12) at the top of `/u/machiavelli`. Visitors drag through the year and watch *the same user's* UI evolve. Prospect-facing, no login. This is the product's best sales page.

### 8.1 The Machiavelli year (invented, in-character, internally consistent)

Machiavelli is a 16th-century statesman using LOT® as a personal OS in the Palazzo Vecchio. Chapters should be written in the `memoryStory` register already live on the profile (observation of citizens, weather shaping temperament).

| M | Seal / name | Chapter (demo copy — draft) |
|---|---|---|
| 1 SIGNAL | `·` | *"Month 1. He wrote of the weather and of debts. Mornings were quiet."* |
| 2 RHYTHM | `○` | *"He keeps his hours before the bells. Eleven mornings of record. 'A prince who wakes late is already behind,' he wrote."* |
| 3 PATTERN | `◐` | *"Thursdays run long, the day the Signoria meets. He asked the system if it was right; he tapped 'Partly'."* |
| 4 PORTRAIT | `●` | *"A man who studies faces for a living, he is now being studied back. Three phrases recur: 'fortune', 'patience', 'the people below'."* |
| 5 THREAD | `◉` | *"In Month 3 he feared the Medici; in Month 5 he wrote of building. The thread is the same: how power survives weather."* |
| 6 MERIDIAN | `◈` | **Half-Year Volume:** *"Half a year of watching citizens from a window. Rain brings introspection, sun brings ambition. He has learned his own weather too."* |
| 7 DEPTH | `◈·` | *"Archetype: The Strategist. Values: virtù, prudence, adaptability. Tension: he praises patience and writes at midnight."* |
| 8 RARE AIR | `◈·○` | *"Top of the cohort for consistency. Forecast: a difficult week in the Signoria; the system suggests short entries, not long ones."* |
| 9 HABIT | `◈·◐` | *"A routine from his best days: water, the loggia walk, one line of ledger-honest writing."* |
| 10 SIGNATURE | `◈·●` | *"His words, kept: virtù, fortuna, restraint, ledger, citizens, weather, patience."* |
| 11 THRESHOLD | `◈·◉` | *"The portrait is nearly drawn. Five questions remain."* |
| 12 LOT® AI | `◈◈◈` | **The Portrait:** *"The art of governance is the art of understanding human nature…"* (the current live `memoryStory` becomes the Portrait's body — it already reads as an annual synthesis.) |

### 8.2 Making the demo coherent with the real engine

- **One source of truth.** Build the 12 demo Chapters as a typed fixture (`DEMO_YEAR_ONE`) with the *same schema* real Chapters use (§9). The demo then exercises the real renderer — no fork of the UI.
- **Honest numbers.** The current profile mixes real cohort counts with a fixed `streak: 1469` (≈ 4 years). For the Year-1 showcase use a Year-1 snapshot (e.g. M12 = ~365 days) and keep `1469` for a separate "Legacy" view. *Decision for S-2.*
- **Badges per month** shown from Codex v31 names and glyphs, so the demo is cross-linked to the badge system.
- Public profile continues to show `showMemoryStory: true`; the Portrait is the headline.

---

## 9. Build Plan (engineering path from today's repo)

Ordered so each step is shippable and green on its own:

| # | Step | Touches | Size |
|---|---|---|---|
| 1 | **Usership clock.** Add `usershipStartedAt` (set when tag first applied); `monthNumber` derives from it. Backfill = `joinedAt`. | `models/user.ts`, migration, `MonthlyPulseWidget` | S |
| 2 | **Month Fill.** Server function `computeMonthFill(userId, month)` from Log (journal words, answers, check-ins, care clicks). Unit-testable, pure. | `server/utils/memory/` new `monthFill.ts` | S |
| 3 | **Chapter model.** `chapters(userId, month, tier, body, quotes[], slot, numbers, sealedAt, seenAt)` + migration. | `models/`, `migrations/` | M |
| 4 | **Chapter generator.** Monthly cron job: select that month's logs → LOT-owned prompt (§6.4 rails) → engine → store. Deterministic `composeLocalChapter` fallback. | `scheduled-jobs.ts`, `memory.ts` | M |
| 5 | **Months-Unlocked widget** (4 states) + `GET /api/chapters`. Replace `MonthlyPulseWidget` localStorage dismissal with server `seenAt`. | new widget, `System.tsx`, `api.ts` | M |
| 6 | **Month-gated UI.** `isMonthUnlocked(n)` helper beside `isFeatureUnlocked`; gate the widgets per §4. Extend `evolution.ts` feature unlocks with a `usershipMonth` input. | `stores/evolution.ts`, `System.tsx` | M |
| 7 | **Quarter Card / Half-Year Volume / Portrait** second- and third-order compression jobs. | `memory.ts`, jobs | M |
| 8 | **Year Book view** + share-as-image (opt-in). | new route/component | M |
| 9 | **Demo time machine** on `/u/machiavelli` with `DEMO_YEAR_ONE` fixture. | `PublicProfile.tsx`, `public-api.ts` | M |
| 10 | **Badge wiring** — month seals + 12 behavior badges into the Codex (v32 candidate). | `docs/badges/`, badge engine | S |

**Instrumentation to learn from (so tuning is real, not guessed):** Chapter-open rate, time-on-Chapter, fill distribution per month, % who reach M3 / M6 / M12, upgrade→M2 retention. These are the only numbers the next session should quote.

---

## 10. Open Decisions for S-2

1. **Month clock origin** — Usership start (recommended) vs. account `joinedAt` (current).
2. **Free-tier tease** — should free users see a locked Month-1 Chapter preview (conversion lever)? Recommended: yes, one blurred sample.
3. **Fill weights/targets** — accept §1 defaults for the pilot, retune after 60 days of real data?
4. **Pause/lapse behaviour** — if a user cancels and returns, do they resume at their month or restart? Recommended: resume; Chapters never deleted.
5. **Demo year** — Year-1 snapshot (365 days) vs. keep Legacy (1469 days) as the headline.
6. **Naming** — "Chapter / Portrait / Year Book" vs. LOT-native terminology (e.g. "Log Block / Memory Block"). Keep the user-facing words plain; LOT terms for internals.
7. **Label change at M12** — `Usership` → `LOT® AI` as a user-visible tag? (Brand impact; needs corporate sign-off.)

---

## 11. Why This Works (design rationale, brief)

- **Tangibility:** every month changes *something visible* (one widget, one voice change, one artifact).
- **Compression as reward:** the reward for writing more is a *smaller, truer* thing back.
- **No dark patterns:** no streak-loss panic; low months become Sketches, not failures.
- **Honest to the engine:** every month maps to signals LOT already records; the only net-new infrastructure is the month clock, the Chapter store, and the compression jobs.
- **Self-selling:** the demo account turns the year into a 60-second walkthrough.

---

AUTHORIZED BY: S-2 // VADIK MARMELADOV
