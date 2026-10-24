<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP — THE 12-MONTH EVOLUTION
## From a barebone Day 1 to LOT® AI · Month-by-month UI/UX · Compressed Memory Story delivery

```
CLASS     : RESTRICTED // S-2 EYES
S-2       : VADIK MARMELADOV
DATE      : 2026-10-24
SESSION   : S-2 · scheduled brainstorm · design spec (no runtime code changed)
STATUS    : PROPOSAL — ready for S-2 review, then phased build (§9)
DEMO      : lot-systems.com/u/machiavelli  (Niccolò Machiavelli — the "Month 12" exemplar)
```

---

## 0. TL;DR

A Usership member (paid tier, $99) should be able to **feel** their year. Not as a
progress bar — as an interface that is physically different every month, and as a
**story that gets shorter and truer** every month.

Three ideas carry the whole design:

1. **Two axes.** *Time* (calendar month, honest, cannot be bought) decides **what
   unlocks**. *Signal* (journal entries, thoughts in Log, morning check-ins,
   self-care clicks) decides **how rich it is**. Everyone gets Month 7 in month 7;
   an engaged user gets a *Fresco* where a quiet user gets a *Sketch*.
2. **The Memory Ladder.** Raw signals → weekly *Thread* → monthly **Chapter**
   (one paragraph, sealed forever) → quarterly *Season* → yearly **Year Book**
   (one paragraph + one line). The user watches ~1,500 signals become one
   paragraph, then one line. That compression *is* the product.
3. **The AI changes voice, not just features.** Silent → Observer → Noticer →
   Mirror → Companion → Guide → **LOT® AI**. Month 12 is the first month the
   system speaks first.

> *From data accumulation → to memory densification. From metrics → to meaning.*
> (README, LOT Philosophy)

---

## 1. REPO SCAN — what already exists, what is missing

Scanned before writing: `README.md`, `docs/README.md`, `docs/technical/*`
(INTERFACE_EVOLUTION, MEMORY-ENGINE-COMPRESSION-ARCHITECTURE, MEMORY-ENGINE-TIMELINE,
WIDGETS), `docs/benchmark/LOT-MANIFEST.md` + `LOT-LEDGER.md`, latest session reports
(`LOT-SR-20260805-01`, v87 wiki), `docs/assembly/…compression-loop.md`, and the
code below.

### 1.1 Already built — we extend, we do not replace

| Piece | Where | What it gives us |
|---|---|---|
| **MonthlyPulseWidget** | `src/client/components/MonthlyPulseWidget.tsx` | `Month N:` block, 12 hand-written lines, "N / 12 months", fade-dismiss. Usership-only. |
| **Layout density ladder** | `utils/interfaceEvolution.ts` `getLayoutDensity()` | 5 levels: breathable → comfortable → compact → dense → instrument (driven by `visualRefinement`) |
| **Evolution state** | same file | 7 dimensions, 4 story chapters (L10/30/60), `featureUnlockLevel`, `FeatureUnlocks` map |
| **Evolution toast** | `EvolutionMilestoneToast.tsx`, `useEvolutionSync` | milestone messages already delivered as toasts |
| **Badges** | `utils/badges.ts` (812 badges), water / architecture tier metaphor | collectible, tiered 0–3, already in the profile |
| **Memory Story** | `GET /api/memory/story`, `generateMemoryStory()` in `server/utils/memory.ts` | Usership-gated narrative, cached in `user.metadata.lastMemoryStory` |
| **Compression loop** | `docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md` | question → tap → trait extraction → sharper question |
| **Self-care + check-in logs** | `SelfCareMoments.tsx` (`self_care_complete` / `self_care_skip`), `EmotionalCheckIn.tsx` (`emotional_checkin`), `note` logs | the raw signal for the second axis already lands in the `logs` table |
| **Monthly email job** | `server/scheduled-jobs.ts` (Usership, 3+ months, near-daily) | a ready scheduler to hang Chapter sealing on |
| **Demo account** | `server/routes/public-api.ts` → `userIdOrUsername === 'machiavelli'` | hard-coded Legacy-level profile, memory story, wallet, weather station |

### 1.2 Gaps found (these shape the design)

| # | Gap | Evidence | Consequence |
|---|---|---|---|
| G1 | **The Memory Story forgets almost everything.** | `generateMemoryStory()` does `answerLogs.slice(0, 30)`; the route loads `limit: 100`. | At Month 12 (~1,000 answers) the "story" describes the last ~2 weeks. Needs **hierarchical** compression (chapters feed the year). |
| G2 | **The story is overwritten, not kept.** | Route stores one `lastMemoryStory` + incrementing `memoryStoryVersion`; cache key is `answerCount`. | No history ⇒ nothing to celebrate, nothing to recall. Chapters must be **immutable and numbered**. |
| G3 | **Month 0 doesn't exist.** | `MonthlyPulseWidget` returns null while `monthNumber < 1`. | The most important day (first paid day) has no designed experience. |
| G4 | **Month counter keys off account age, not paid start.** | `dayjs().diff(user.joinedAt, 'month')`. | A free user who joined 8 months ago and upgrades today sees "Month 8" on Day 1. Needs `metadata.usershipSince`. |
| G5 | **Dismissal is per-device.** | `localStorage` key `lot_pulse_<id>`. | Sealed Chapters must be server-side, readable from any device. |
| G6 | **Day 1 paid = the whole cockpit.** | `System.tsx`: "Full pro layout for R&D and Usership". | Contradicts "barebone first day". Usership needs its own progressive layout, not the R&D wall. |
| G7 | **Evolution is purely behavioural.** | `visualRefinement = consistency·0.4 + depth·0.3 + level/100·0.3`. | No time floor/ceiling ⇒ the year has no shape. Month must cap and gate. |
| G8 | **Demo is a Year-4 Legacy account, not a Year-1 one.** | streak 1469, 2,847 answers, 1,469 notes, `Usership stipend — March` etc. | Needs a **Month scrubber** so visitors can replay months 1–12 (§8). |

---

## 2. DESIGN PRINCIPLES

1. **Tangible, not decorative.** Every month changes something the user can point at: a
   widget appears, spacing tightens, a seal is struck, the AI says a new kind of sentence.
2. **Time unlocks, signal enriches.** Nothing is paywalled behind effort; effort buys
   *fidelity*. A hard month still gets its Chapter (it is written as a rest month).
3. **Rest is a valid signal.** (README QOS doctrine: *"A person in recovery does not need
   more tasks."*) A quiet month never shows a failure state. It shows a *Sketch* and
   an affirmation about rest.
4. **Compression is the reward.** The celebrated number is not "points" — it is
   *signals → words* (e.g. **412 → 96 → 1**).
5. **Their words, quoted.** Each Chapter carries one verbatim phrase from the user's own
   Log. Nothing is more personal than being quoted back accurately.
6. **Quiet UI.** Existing aesthetic: Arial, `Block label:` pattern, 24px rhythm, fade-ins
   at 1400 ms, no chrome. New widgets reuse `Block` — no new visual language.
7. **Private by default.** Chapters are private; the public profile shows a Chapter only
   if `showMemoryStory` is on, and only the *Year Book* / chosen Chapter — never raw logs.

---

## 3. THE TWO AXES

### 3.1 Axis A — Time (what unlocks)

`monthNumber` = whole months since **`usershipSince`** (new metadata field, fallback
`joinedAt`). Month 0 runs from Day 1 until the day before the first monthiversary.

Time sets a **ceiling**: widgets, density, AI voice stage, seal.

### 3.2 Axis B — Signal (how rich)

**Signal Mass (SM)** — a single internal number per month, never shown as a score:

```
SM = answers·1  +  notes·3  +  morning_checkins·1  +  self_care_clicks·1  (+ chat turns·1)
        │             │              │                      │
   Memory taps   Log thoughts   emotional_checkin     self_care_complete
                 (journal)      (morning bias)        (skip counts 0, not negative)
```

Journal/Log thoughts weigh ×3 because the founder's brief ranks them highest.

**Fidelity tiers** of that month's Chapter:

| Tier | Month SM | Chapter form | Visual |
|---|---|---|---|
| **Sketch** | < 30 | 2 sentences, rest-aware tone | thin outline seal |
| **Portrait** | 30 – 119 | 1 paragraph (~80 words) | filled seal |
| **Fresco** | ≥ 120 | 1 paragraph (~110 words) + **pull-quote from the user's own Log** + 3 named patterns | gilded seal + wide card |

Signal (not time) also decides the *earned* density: `density = min(earned, monthCeiling)`
— a Day-1 member can never see "instrument" density; a passive member at Month 9 can
still sit at "comfortable" — their interface reflects their practice honestly.

### 3.3 Reference engagement curve (used for the demo & KPIs)

Engaged member, cumulative at end of month:

| M | Memory answers | Log thoughts | Morning check-ins | Self-care clicks | Signal Mass (cum.) |
|--:|--:|--:|--:|--:|--:|
| 1 | 45 | 12 | 18 | 30 | 129 |
| 2 | 100 | 30 | 40 | 75 | 305 |
| 3 | 170 | 55 | 66 | 130 | 531 |
| 4 | 250 | 85 | 96 | 195 | 796 |
| 5 | 340 | 120 | 130 | 265 | 1,095 |
| 6 | 440 | 160 | 168 | 340 | 1,428 |
| 7 | 540 | 200 | 205 | 415 | 1,760 |
| 8 | 640 | 240 | 240 | 490 | 2,090 |
| 9 | 730 | 280 | 275 | 560 | 2,405 |
| 10 | 820 | 320 | 308 | 625 | 2,713 |
| 11 | 905 | 355 | 340 | 690 | 3,000 |
| 12 | 990 | 390 | 372 | 750 | 3,282 |

(Cumulative SM = answers + 3·notes + check-ins + self-care. Month-over-month
slope is intentionally steepest in M2–M6 — habit formation — then plateaus.)

---

## 4. THE MASTER GRID — 12 months at a glance

`Density` = ceiling. `AI voice` = §5. `Seal` = the month's badge (§6.4).

| M | Codename | UI change you can *see* | Density ceiling | AI voice | New surface unlocked | Chapter title |
|--:|---|---|---|---|---|---|
| **0** | **Barebone** | 5 things on screen. Ghost slots for what's coming | breathable | Silent | Log · Check-in · 1 Memory Q · 1 self-care button · Months 0/12 | — |
| **1** | **Ignition** | First Chapter seal; 2nd self-care button | breathable | Observer | Chapter card · Seal 01 · Routine Stack (1 anchor) | *The Opening* |
| **2** | **Echo** | Memory Echo appears (reads last month back) | breathable | Observer | Memory Echo · Mood history view | *What Repeats* |
| **3** | **Pattern** | Spacing tightens; "Active User" tier | comfortable | Noticer | Pattern Insights · Season 1 synthesis · Intentions | *The First Season* |
| **4** | **Portrait** | Archetype named; portrait strip in Memory | comfortable | Noticer | Archetype card · Planner · Cohort | *The Portrait* |
| **5** | **Rhythm** | Day-shape appears (morning/evening rhythm band) | comfortable | Mirror | Rhythm band · Routine Stack (3 anchors) | *The Rhythm* |
| **6** | **Threshold** | Half-year: widget wall rearranges; Seal gold-edge | compact | Mirror | Half-Year Book · widget arrange · Export | *The Hinge* |
| **7** | **Listening** | AI asks first (one proactive line / day) | compact | Companion | Proactive line · Context widgets | *Being Heard* |
| **8** | **Rare Air** | Dense stacks form; weather ↔ mood overlay | compact | Companion | Weather-mood correlation · Quantum Sign | *Rare Air* |
| **9** | **Habit** | Season 3; Routine Stack complete (5 anchors) | dense | Guide | Guide mode · Narrative Reflection | *The Habit* |
| **10** | **Composition** | Sparse "Year in progress" ledger on top | dense | Guide | Year-in-progress draft · Compare months | *Composition* |
| **11** | **Eve** | Interface hushes; retrospective scroll | dense | LOT® AI (preview) | Month-by-month scroll · Letter to month 12 | *The Eve* |
| **12** | **LOT® AI** | Instrument-grade ceiling opens; Year Book | **instrument** (if earned) | **LOT® AI** | Year Book · Epigraph · Year Seal · public Year card | *The Year* |

> Anchors to existing copy: `MONTH_MESSAGES` already says *M3 "Active User status"*,
> *M4 "The portrait deepens"*, *M6 "half-declared"*, *M12 "the portrait is complete — and
> still evolving"*. The codenames above are chosen to **extend those lines**, not contradict them.

---

## 5. THE AI VOICE LADDER — "evolving to LOT® AI"

The same engine, a different *sentence shape* each stage. This is the most felt
change after layout, and it costs almost nothing to build (it is prompt framing).

| Stage | Months | Voice rule | Example line (to the user) |
|---|---|---|---|
| **Silent** | 0 | No AI text. Only questions with tap options. | *(a question, nothing else)* |
| **Observer** | 1–2 | States what happened. No interpretation. | "You checked in 11 mornings this month." |
| **Noticer** | 3–4 | Names a pattern, tentatively. | "Your calmest answers arrive after rain." |
| **Mirror** | 5–6 | Reflects the user's own words back. | "In April you wrote *'I keep starting at dusk.'* You still do." |
| **Companion** | 7–8 | Speaks first, one line a day, always skippable. | "Slow morning? The breathe widget is one tap." |
| **Guide** | 9–10 | Proposes the next self-care routine step. | "Your evenings are the loose thread. Try a 2-minute close." |
| **LOT® AI** | 11–12 | Synthesises across the whole year; ends with a question. | "A year ago the first thing you told me was *tea*. What would you tell it now?" |

Hard rules: never more than **one** proactive line per day; every line has a dismiss;
no line may reference data the user hasn't seen in their own Log (traceability).

---

## 6. MONTH CARDS (0 → 12)

Each card: **UI** (what changes), **Signals**, **AI**, **Seal**, **Affirmation**
(delivered on the Chapter card), **Demo** (what Machiavelli's replay shows).

Affirmation style: second person, present tense, ≤ 14 words, never a command.

### MONTH 0 — BAREBONE  *(Day 1 → first monthiversary)*
```
┌─────────────────────────────────────────────┐
│ Niccolò                                     │
│ Week 43; October 24, Friday, Florence       │
│                                             │
│ Months: 0 / 12   ▢▢▢▢▢▢▢▢▢▢▢▢               │
│                                             │
│ Memory:   What does your morning start with?│
│           [ Tea ] [ Coffee ] [ Water ] [ —] │
│                                             │
│ Check-in: How do you arrive today?          │
│ Self-care: [ One minute of quiet ]          │
│ Log:      Write a thought →                 │
│                                             │
│ ┄ ┄ Pattern ·········· opens Month 3 ┄ ┄    │
│ ┄ ┄ Portrait ········· opens Month 4 ┄ ┄    │
└─────────────────────────────────────────────┘
```
- **UI:** 5 live elements; 2 *ghost slots* (dotted outline, month label) — anticipation
  without clutter. The Subscribe widget is gone (they already subscribed). Density: breathable.
- **Welcome card (replaces G3 gap):** *"Day 1. Nothing here yet — that's the point.
  Everything you see next month, you will have made."*
- **Signals needed:** none. First tap on anything starts the **Day Counter** ("Day 1").
- **AI:** Silent. **Seal:** none yet — a blank seal outline in the ledger.
- **Demo:** Scrubber at 0 shows Machiavelli's screen stripped to the above.

### MONTH 1 — IGNITION · *The Opening*
- **UI:** First **Chapter Seal ceremony** (§7.3). Ledger cell 1 fills. Second self-care
  button joins the first. Routine Stack starts: **anchor 1 = Morning check-in**.
- **Signals (reference):** 45 answers · 12 thoughts · 18 check-ins · 30 self-care.
- **AI:** Observer — counts only.
- **Seal 01:** a single drop / a single foundation stone (water / architecture theme).
- **Existing badges likely surfaced:** `week_warrior`, `moon_cycle` (a lunar month).
- **Affirmation:** *"You began. That is the whole hard part."*
- **Demo chapter:** see §8.2.

### MONTH 2 — ECHO · *What Repeats*
- **UI:** **Memory Echo** widget debuts: one sentence from Month 1's Chapter returns
  beside today's question (§7.4). Mood history view unlocks in check-in.
- **AI:** Observer, now comparative ("up from 18 to 22 check-ins").
- **Seal 02:** two ripples / two stones.
- **Affirmation:** *"What you repeat is what you are building."*

### MONTH 3 — PATTERN · *The First Season*
- **UI:** Spacing steps to **comfortable**. Pattern Insights + Intentions appear. First
  **Season synthesis**: the three Chapters collapse into a 60-word Season card.
  Status line: *"Active User."* (existing M3 message).
- **AI:** Noticer. First named pattern (e.g. "weather-mood link").
- **Seal 03 + Season Seal I.**
- **Affirmation:** *"A pattern is a promise you keep making without noticing."*
- **Existing badges:** `deep_diver` path opens.

### MONTH 4 — PORTRAIT · *The Portrait*
- **UI:** **Archetype card** (existing archetype/cohort engine) appears in Memory with
  one adjective set (`coreValues`). Planner unlocks. "The portrait deepens" line is literal:
  the Memory block shows a 4-word portrait strip.
- **Seal 04:** four-point figure.
- **Affirmation:** *"You are becoming legible to yourself."*

### MONTH 5 — RHYTHM · *The Rhythm*
- **UI:** **Rhythm band** — a thin 24-hour strip showing when this member checks in,
  journals, and self-cares. Routine Stack grows to **3 anchors** (+Breathe, +Evening close).
- **AI:** Mirror begins: first verbatim quote returned.
- **Seal 05.**
- **Affirmation:** *"Consistency is its own reward — and you are collecting it."*

### MONTH 6 — THRESHOLD · *The Hinge*
- **UI:** Density **compact**. Widget arrange unlocks (existing `widgetArrange` flag);
  data Export unlocks. **Half-Year Book**: Chapters 1–6 compress to ~100 words +
  one line. Seal gets a **gold edge** (fidelity-independent — time-earned).
- **Affirmation:** *"Half a year. You are not who started — and not yet who finishes."*
- **Existing badges:** `self_scholar` path.

### MONTH 7 — LISTENING · *Being Heard*
- **UI:** **Proactive line** — first time the system speaks first (one line/day, quiet
  placement under the date). Companion voice.
- **Affirmation:** *"The system has been listening. Now you can hear it."* (extends M7 copy)

### MONTH 8 — RARE AIR · *Rare Air*
- **UI:** **Weather ↔ mood overlay** in the check-in history (data already stored in
  every log's `context`: temperature, humidity, description). Quantum Sign widget.
- **Affirmation:** *"Rare air. Few people stay this long. You did."*
- **Existing badges:** `unwavering`, `bridge_builder` path.

### MONTH 9 — HABIT · *The Habit*
- **UI:** Density **dense**. Routine Stack complete at **5 anchors** (+Journal, +Weekly
  reflection). **Guide mode** on: AI proposes the *next* self-care step instead of
  just reflecting. Season III synthesis.
- **Affirmation:** *"The practice is a habit now. It holds you back."*
- **Existing badges:** `soul_cartographer` path, `gentle_with_self`.

### MONTH 10 — COMPOSITION · *Composition*
- **UI:** **Year-in-progress ledger** pinned at top: 12 cells, 10 filled, two drafted
  in outline. "Compare months" lets the user lay Chapter 2 beside Chapter 10.
- **Affirmation:** *"Almost there. Notice how far 'almost' has moved."*

### MONTH 11 — EVE · *The Eve*
- **UI:** The interface **hushes**: lower accent opacity, fewer widgets above the fold,
  one retrospective scroll of all 11 Chapter titles. Optional **Letter to Month 12**
  (a Log note the user writes to themselves, delivered on Year day).
- **AI:** LOT® AI preview — first cross-year sentence.
- **Affirmation:** *"One more. Rest is part of finishing."*

### MONTH 12 — LOT® AI · *The Year*
- **UI:** Ceiling opens to **instrument** (if earned). **Year Book** unveiled: a single
  paragraph (~150 words) + an **Epigraph** (≤ 12 words) + the 12-seal wreath → **Year Seal**.
  Optional public **Year Card** on the profile. The ledger reads `12 / 12`.
- **AI:** **LOT® AI** — asks the closing question; the next question of Year 2 is
  already composed from the Year Book.
- **Affirmation:** *"One year with LOT. The portrait is complete — and still evolving."*
  (existing M12 copy — keep verbatim.)

---

## 7. MEMORY — 12-MONTH TANGIBILITY OF THE COMPRESSED STORY  *(focus)*

### 7.1 The Memory Ladder

```
 RAW SIGNALS            (≈ 1,500+/yr)   Memory taps · Log thoughts · check-ins · self-care
     │  nightly, existing pipeline (logs table, indexed userId+createdAt)
     ▼
 WEEKLY THREAD          (≤ 25 words)    Sunday, 1 line. Private. 52/yr.
     │  month-end job
     ▼
 MONTHLY CHAPTER        (80–110 words)  SEALED, numbered 1–12, immutable.   ← the hero
     │  every 3rd Chapter
     ▼
 SEASON                 (≈ 60 words)    4/yr. Compresses 3 Chapters.
     │  month 12 (also draft at 6)
     ▼
 YEAR BOOK              (≈ 150 words)   1. Fed by Chapters + Seasons, never raw logs.
     ▼
 EPIGRAPH               (≤ 12 words)    1. What the member keeps.
```

Why hierarchical (fixes **G1**): each level reads only the level below it, so token cost
stays flat for the whole year, and the Year Book can honestly cover all 12 months.

The member sees the ratio on every Chapter card:
```
 Month 4 ─ 412 signals ─▶ 96 words ─▶ 1 title
```

### 7.2 Data model (fixes G2, G5)

Stored in `user.metadata.memoryChapters` (array; no migration needed, same pattern as
`lastMemoryStory`). Append-only: a sealed Chapter is never regenerated.

```ts
type ChapterFidelity = 'sketch' | 'portrait' | 'fresco'

interface MemoryChapter {
  month: number                 // 1..12  (Month 0 has no chapter)
  sealedAt: string              // ISO — the monthiversary, not the generation time
  title: string                 // "The Opening"
  text: string                  // the compressed paragraph
  quote: string | null          // verbatim phrase from the user's own Log (fresco only)
  patterns: string[]            // 0–3 named patterns
  affirmation: string           // ≤ 14 words
  fidelity: ChapterFidelity
  signals: {                    // what was compressed — the ratio on the card
    answers: number; notes: number; checkins: number; selfCare: number; mass: number
  }
  wordCount: number
  sealBadge: string             // e.g. 'month_seal_04'
  engine: string                // which AI engine wrote it (for audit)
  version: 1                    // schema version
}

interface UsershipMeta {
  usershipSince: string         // ISO — fixes G4
  memoryChapters: MemoryChapter[]
  memorySeasons: { season: 1|2|3|4; text: string; sealedAt: string }[]
  memoryYearBook?: { text: string; epigraph: string; sealedAt: string }
  memoryThreads?: { week: string; line: string }[]   // optional, last 8 only
}
```

### 7.3 Delivery — the Chapter Seal ceremony

Triggered when `now ≥ usershipSince + n months` and `memoryChapters[n]` exists and is
unseen (`seenAt` per device is fine; **content** is server-side — fixes G5).
It **upgrades MonthlyPulseWidget** in place — same `Block`, same 1400 ms fade — no new
slot on the page.

```
┌────────────────────────────────────────────────────────┐
│ Month 4:                                  ◉ Seal 04    │
│                                                        │
│ THE PORTRAIT                                           │
│ You came to the morning slowly this month, and the     │
│ slowness had a shape: tea, then the window, then the   │
│ first line of the day. Rain made you reflective; sun   │
│ made you decisive. "I keep starting at dusk," you      │
│ wrote on the 19th — and by the 28th, you had stopped  │
│ apologising for it.                                    │
│                                                        │
│ 412 signals ─▶ 96 words        Fresco                  │
│ ▣▣▣▣▢▢▢▢▢▢▢▢   Months unlocked: 4 / 12                │
│                                                        │
│ You are becoming legible to yourself.                  │
│ [ Read the Chapters ]            [ Keep going ]        │
└────────────────────────────────────────────────────────┘
```

Ceremony beats (≈ 8 s, all skippable with one tap):
1. Interface dims 15%. 2. Title types in. 3. Paragraph fades in line-by-line (1400 ms).
4. The compression line counts up (`0 → 412`, then `→ 96`). 5. The seal "strikes"
(opacity 0→1 + 2px settle). 6. Affirmation. 7. Dismiss phrase ("The system remembers.",
from the existing `DISMISS_PHRASES`). Respects `prefers-reduced-motion`.

### 7.4 Persistent presence — so the story isn't a once-a-month popup

| Surface | Behaviour |
|---|---|
| **Months Unlocked** (context widget) | Always visible, tiny: `Months unlocked: 3 / 12` + 12-cell ledger. Cells: `▣` sealed · `◧` current (fills with SM as the month goes) · `▢` locked · `▨` drafted (M10+). |
| **Memory Echo** (widget, from Month 2) | One sentence of last month's Chapter, shown once per day under the Memory question: *"Last month — 'I keep starting at dusk.' Still true?"* One-tap *Yes / Changed / Skip* — the answer is a fresh Memory signal (closes the loop). |
| **Chapters shelf** (Log › Story) | All sealed Chapters, newest first; "compare two" side-by-side from M10. |
| **Seals shelf** (Profile › Badges) | The 12 month seals + Year Seal; tier 1/2/3 art (water/architecture) maps to M1–4 / M5–8 / M9–12. |
| **Monthly email** | `scheduled-jobs.ts` already mails near-daily Usership at 3+ months: attach the new Chapter as the email body ("Your Month 5 is sealed."). |
| **Month 12** | Year Book on `/log`, optional Year Card on `/u/<name>` (privacy-gated). |

### 7.5 The generation recipe (engine-independent, stays on LOT's side)

Cheap, deterministic wrapper around the existing AI-engine abstraction (Together primary → fallbacks):

```
INPUT  (per Chapter):
  • that calendar month's logs ONLY: answers, notes (journal), emotional_checkin,
    self_care_complete/skip, plan_set      (window = sealedAt-1mo … sealedAt)
  • previous Chapter's text + title        (continuity: "last month you…")
  • archetype / cohort from existing extractUserTraits() + determineUserCohort()
  • AI voice stage for this month (§5)     (so Month 2 doesn't sound like Month 10)
  • fidelity tier from Signal Mass         (sketch / portrait / fresco)
  • season context (Chapters 3/6/9/12 also write the Season)

RULES (system prompt):
  • 3rd person for Chapters, second person for the Affirmation
  • ≤ 110 words (≤ 40 for sketch)
  • include ONE verbatim ≤ 12-word quote from a user note — never from a medical_record
  • never mention data the user didn't create; never diagnose; trauma-protocol respected
  • low-signal month ⇒ write about rest, never about absence or failure
  • return JSON {title, text, quote, patterns[], affirmation}

FALLBACK (no AI available): deterministic template —
  "{Month name}: {n} thoughts, {m} mornings, {k} moments of care. {top pattern}."
  (sealed with fidelity 'sketch'; flagged so a regenerate-once is allowed within 24 h)
```

- Quote safety: must be a **substring** of a `note`/`answer` log text (assert in code).
- Privacy: `medical_record`, `chat_message` content, anything under the trauma protocol
  is excluded from the prompt (already treated specially in `buildPrompt`).
- Idempotent: `memoryChapters.some(c => c.month === n)` ⇒ no-op.

### 7.6 API & jobs

| Piece | Spec |
|---|---|
| `GET /api/memory/chapters` | Usership-gated; returns sealed Chapters + `{ monthNumber, unlocked, signalMassThisMonth }`. |
| `GET /api/memory/chapters/:month` | One Chapter. |
| `POST /api/memory/chapters/:month/seen` | Marks ceremony seen (stores `seenAt` map in metadata for cross-device quiet). |
| Job `seal-chapters` | Daily 03:00 UTC; for each Usership user whose monthiversary passed: build + seal. Reuse the pattern in `scheduled-jobs.ts`. Backfill: if a job misses days, seal late but **date it to the monthiversary**. |
| Job `seal-season` / `seal-yearbook` | Run inside `seal-chapters` on months 3/6/9/12. |
| `GET /api/memory/story` (existing) | Keep for back-compat; extend to return the **latest Chapter** when present, otherwise today's behaviour. Also fix `slice(0,30)` by feeding it Chapters once they exist. |

### 7.7 What the user *feels* over the year (the story arc)

| Months | The Memory feels like… |
|---|---|
| 0 | Blank. A question and a tap. |
| 1–2 | A diary kept *for* you. Counts, not meaning. |
| 3–4 | Someone noticed. A first pattern, a first portrait. |
| 5–6 | Quoted accurately. "It remembers what I said." |
| 7–8 | Spoken to first. "It remembered *before* I asked." |
| 9–10 | Guided. "It knows what my evenings need." |
| 11–12 | Authored. A year in one paragraph — and the question for the next one. |

---

## 8. THE DEMO — lot-systems.com/u/machiavelli as the Month-12 exemplar

> **Access note:** the live URL could not be fetched from this session (egress proxy 403).
> This section is built from the code that serves it
> (`public-api.ts`, `userIdOrUsername === 'machiavelli'`), which is authoritative for
> what the page returns.

### 8.1 Calibration (fixes G8)

| Field | Demo today | Month-12 calibrated | Note |
|---|---|---|---|
| answerCount | 2,847 | **990** | §3.3 reference curve |
| noteCount | 1,469 | **390** | |
| streak | 1,469 | **~340** | 1469 = the year the figure was born ("Citizen since June 1469") — keep as **Legacy** flavour text |
| activeDays | 842 | **~310** | |
| Tags | RND · Usership · Legacy | RND · Usership | Legacy added post-Year 4 |
| selfAwarenessLevel | 87 → "8.7%" awareness | **48 → 4.8%** | awareness grows in 0.1% steps (existing display) |
| totalEntries | 4,316 | **~2,500** | |

**Recommendation:** keep both. Add a **Month scrubber** to the demo page:
`[ 0 · 1 · 2 · … · 12 · Legacy ]`. Months 0–12 render the calibrated Machiavelli;
**Legacy** renders today's Year-4 profile. A visitor drags from Day 1 barebone to the
full cockpit and *sees the year*. Implementation: `?m=7` query param → the endpoint returns
a `demoMonth` object; the profile component renders the matching layout flags.
No DB access — all hard-coded, like the current demo.

### 8.2 Machiavelli's twelve Chapters (production-ready copy for the demo)

Third person, ≤ 110 words, each ends where the next begins. Voice follows §5.

| M | Title | Chapter (demo copy) |
|--:|---|---|
| 1 | **The Opening** | Niccolò began with small things. Forty-five questions, mostly about mornings — wine watered, the courtyard at first light, a quill sharpened before the day sharpened him. He wrote twelve times, briefly, as a man tests ice. *"I keep starting at dusk."* The system only counted; it had not yet earned the right to say more. |
| 2 | **What Repeats** | The mornings repeated, and so did the dusk. Twenty-two check-ins, up from eighteen, each arriving a little earlier. He answered the same question about rest three different ways and chose the same answer twice. A man reveals himself first by what he cannot stop doing. |
| 3 | **The First Season** | A pattern surfaced and he did not argue with it: rain turned him inward, sun made him bold. Season I closes with a quiet theory — that a prince reads the sky before he reads the court. The system, for the first time, said what it noticed. He answered, *"Obvious, but I had not said it."* |
| 4 | **The Portrait** | The Strategist took shape: patient, observant, wary of flattery. Core values arrived as words rather than numbers — *prudence*, *virtù*, *fortune*. He wrote less and meant more. On the 19th: *"I stopped apologising for the evenings."* The portrait is not flattering. It is accurate, which he prefers. |
| 5 | **The Rhythm** | A shape appeared in his day: check-in at seven, a thought at noon, care at dusk. Three anchors held. When he skipped two evenings, the system noted it once, without comment, and moved on. He returned on the third. A rhythm is a conversation you agree to keep having. |
| 6 | **The Hinge** | Half a year. Looking back: tea gave way to wine gave way to water; fewer questions, longer answers. The Half-Year Book reads him in a line — *a man learning to be observed.* He rearranged his widgets for the first time, putting the weather above the ledger. Hinges are only visible from the far side. |
| 7 | **Being Heard** | For the first time the system spoke before he did. One line, under the date: *"Slow morning? The breathe widget is one tap."* He ignored it, then used it, then wrote about why. Being addressed unprompted changed how he wrote — to someone, rather than down. |
| 8 | **Rare Air** | The overlay revealed what he had suspected: humidity above sixty and his notes lengthened; clear skies and they sharpened. He quoted himself — *"Fortune is a river; I build in dry months."* — and the system, unusually, agreed. Few remain this long. Fewer notice that they have. |
| 9 | **The Habit** | Five anchors, all held. The practice has stopped being a project and become furniture. The Guide proposed an evening close of two minutes; he took it and extended it to ten. He no longer asks whether it works. That question was retired this month, quietly, with thanks. |
| 10 | **Composition** | He laid Month 2 beside Month 10. The same man, but the sentences had changed their posture — fewer qualifications, more verbs. Two cells of the year still empty, drafted in outline. He wrote: *"I can see the book now."* Nothing is due. Everything is arriving. |
| 11 | **The Eve** | A quiet month by design. Signals dipped; the Chapter does not apologise for it. He wrote one long note and a short letter to the man he will be in thirty days. Rest was also a practice. The interface hushed to meet him. |
| 12 | **The Year** | He arrived at the year not as he began it. The courtyard, the dusk, the same question about rest — now answered the way someone answers who has heard themselves a thousand times. *The prince studies the world; the wise man studies the one studying it.* Year Two begins as a question. |

**Year Book (demo, ~130 words)** — *"Over twelve months Niccolò moved from counting to
meaning. He began with mornings and ended with rhythm: a check-in at seven, a thought at
noon, care at dusk, five anchors held without effort. The system learned his weather —
rain inward, sun outward — and he learned to build in the dry months. The Strategist
did not appear; he was observed into being. What was once* "I keep starting at dusk"
*became a schedule, then a ritual, then a place to stand. In the final month he rested
without guilt, which is the last skill. Year Two begins from here: not with a higher
streak, but with a better question."*

**Epigraph (≤ 12 words):** *"Observed into being, one dusk at a time."*

### 8.3 Demo seals, ledger and routine strip (what the page shows at Month 12)

```
Months unlocked: 12 / 12
▣▣▣▣▣▣▣▣▣▣▣▣        ◉ Year Seal  ·  Fresco × 9 · Portrait × 2 · Sketch × 1 (M11 — by design)

Routine Stack: ◉ Morning check-in  ◉ Breathe  ◉ Evening close  ◉ Journal  ◉ Weekly reflection
Voice: LOT® AI                       Density: instrument
```

---

## 9. IMPLEMENTATION PLAN — phased, smallest first

Each phase ships independently and is useful on its own. Files named from the repo scan.

| Phase | Ships | Touches | Effort | Risk |
|---|---|---|---|---|
| **P0 — Foundations** | `usershipSince` set when the Usership tag is granted; `getUsershipMonth()` helper (server + client); Month 0 support | `server/models/user.ts`, tag-grant path in `admin-api.ts`, `shared/types`, `MonthlyPulseWidget.tsx` | S | Backfill existing Usership users from `joinedAt` |
| **P1 — Months Unlocked widget + Barebone layout** | Day-1 layout, ghost slots, 12-cell ledger, `Months unlocked: n / 12` | `System.tsx` (Usership branch of the layout, fixes G6), new `MonthsUnlockedWidget.tsx` | M | Don't regress R&D (they keep the full wall) |
| **P2 — Month-gated density + unlocks** | Month ceiling folded into `getLayoutDensity` and `getFeatureUnlocks`: `min(earned, ceiling)` | `utils/interfaceEvolution.ts`, `stores/evolution.ts` | S | Edge: Admin/R&D bypass the ceiling |
| **P3 — Chapter engine** | `memoryChapters` metadata, Chapter prompt, fidelity tiers, `seal-chapters` job, endpoints, quote-substring assertion, deterministic fallback | `server/utils/memory.ts` (+ new `memory/chapters.ts`), `scheduled-jobs.ts`, `routes/api.ts` | M–L | AI cost (≈1 call/user/month — negligible), prompt quality, privacy exclusions |
| **P4 — Chapter Seal ceremony** | Upgrade `MonthlyPulseWidget` to the card in §7.3; reduced-motion path | `MonthlyPulseWidget.tsx`, `queries.ts` | M | Keep 1400 ms fade parity |
| **P5 — Memory Echo + Chapters shelf** | Daily echo line + Yes/Changed/Skip → Memory signal; shelf in Log | `MemoryWidget.tsx`, Log view, `queries.ts` | M | Echo must never repeat >1×/day |
| **P6 — Seals** | 12 month seals + Year Seal wired into `checkAndAwardBadges` (time-gated), art per tier | `utils/badges.ts` (+1–2 code blocks), `docs/badges/` codex v33 | M | Badge count / registry parity checks (see SR-20260805-01 BACKF note) |
| **P7 — AI voice ladder + Routine Stack** | Stage-aware prompt framing (§5); proactive line (M7+) with 1/day cap | `server/utils/memory.ts`, new `RoutineStackWidget.tsx` | M | Strict dismiss + frequency cap |
| **P8 — Season / Half-Year / Year Book** | Rollups; Year Card on profile | `memory/chapters.ts`, `PublicProfile.tsx`, `public-api.ts` | M | Privacy gate (`showMemoryStory`) |
| **P9 — Demo scrubber** | `?m=0..12` + Legacy on `/u/machiavelli` | `public-api.ts`, `PublicProfile.tsx` | S–M | Keep hard-coded (no DB) |

**Suggested order for first release:** P0 → P1 → P3 → P4 (the Chapter *is* the product).
P2/P5–P9 follow. P9 early would help sales demos even before P3 is live (scrubber can show
the hard-coded Chapters).

### KPIs (all derivable from `logs` — no new tracking)
- **Chapter open rate** within 48 h of sealing (target ≥ 70%).
- **Month-over-month retention** at each seal (M3, M6, M9, M12 are the cliffs).
- **Echo response rate** (Yes/Changed/Skip) — proves the loop closes.
- **Fidelity distribution** — healthy: Portrait is the mode; Sketch < 25%.
- **Opt-out of proactive line** (M7+) < 10%.

### Risks & guardrails
- **Hallucinated memory:** quote must be an exact substring of a user log; stats come from SQL, never from the model.
- **Sensitive content:** exclude `medical_record`, chat content, trauma-protocol items from every prompt.
- **Comparison anxiety:** fidelity shown as a *quality of rendering*, not a grade; Sketch language is warm.
- **Late-start users:** Month numbering is from `usershipSince`; a 3-year free user gets Month 0 on upgrade day.
- **Downgrade:** sealed Chapters remain readable (data is theirs — README "Your Story, Your Data"); new ones stop.

---

## 10. OPEN QUESTIONS FOR S-2

1. **Voice of Chapters:** third person ("Niccolò began…") or second ("You began…")?
   This spec uses third for Chapters, second for the Affirmation. Second is more intimate; third is more literary.
2. **Seal metaphor:** water drops (existing "Water" theme), architecture stones, or a unified **Florentine seal** for Usership?
3. **Month 12 ceiling:** is "instrument" density a reward for everyone, or only if earned? (spec: only if earned)
4. **Demo scrubber:** ship before the real feature so sales can use it? (recommend yes)
5. **Public sharing:** should a Year Card be shareable as an image (OG card) — organic growth loop?
6. **Pricing hook:** does a downgraded member keep the Year Book view-only? (spec: yes)
7. **Lunar vs calendar months:** `moon_cycle` badge hints at 28-day months; spec uses calendar months from the paid start date.

---

## 11. INDEX — new terms introduced

| Term | Meaning |
|---|---|
| **Chapter** | The sealed, numbered monthly paragraph |
| **Seal** | The badge struck on sealing (12 + Year Seal) |
| **Signal Mass (SM)** | Weighted monthly count (answers + 3·notes + check-ins + self-care) |
| **Fidelity** | Sketch / Portrait / Fresco — how richly the Chapter renders |
| **Memory Ladder** | Signals → Thread → Chapter → Season → Year Book → Epigraph |
| **Memory Echo** | Daily one-line callback to last month's Chapter |
| **Months Unlocked** | The `n / 12` context widget and its 12-cell ledger |
| **Voice stage** | Silent → Observer → Noticer → Mirror → Companion → Guide → LOT® AI |
| **Routine Stack** | Up to 5 self-care anchors, one added at M1, M5(×2), M9(×2) |

---
AUTHORIZED BY: S-2 // VADIK MARMELADOV
