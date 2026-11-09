<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP — 12-MONTH EVOLUTION SYSTEM

```
CLASS     : PRODUCT DESIGN // BRAINSTORM + SPEC
S-2       : VADIK MARMELADOV
DATE      : 2026-11-09
STATUS    : PROPOSAL — nothing in this file is implemented yet
REFERENCE : lot-systems.com/u/machiavelli  (the Month-12+ "Legacy" account)
```

> **One sentence:** Day 1 of paid Usership is a nearly empty page with one clock, one question
> and one button. Twelve months later it is Niccolò Machiavelli's cockpit — and every month in
> between, the user opens LOT and *feels* that something has been added, tightened or
> remembered on their behalf.

---

## 0. What the repo scan found (so we build on it, not beside it)

| Existing piece | Where | What it already does | Gap for this plan |
|---|---|---|---|
| `MonthlyPulseWidget` | `src/client/components/MonthlyPulseWidget.tsx` | Usership-only card "Month N: …" + `N / 12 months`; 12 one-line messages; dismiss state in `localStorage` | Lines are generic. No memory content. Dismiss is per-device. Month counted from `joinedAt`, not from paid start. |
| Interface Evolution | `src/client/utils/interfaceEvolution.ts`, `docs/technical/INTERFACE_EVOLUTION.md` | 7 score dimensions, 4 story chapters, 5 layout densities (`breathable → instrument`), feature unlocks, CSS variables, milestone toasts | Driven by *scores*, not by *calendar*. A light user may see nothing change for months. |
| Memory Engine | `docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md`, `src/server/utils/memory/story-generator.ts` | Question → tap → compress → sharper question. `generateMemoryStory()` makes one running story. | Story is one rolling blob. No **per-month sealed chapter**, no compression ratio shown to the user. |
| Monthly review | `src/server/utils/monthly-summary.ts`, `scheduled-jobs.ts` | Plain-text monthly email: presence, energy, patterns, growth, narrative, forward look | Lives in email only. Not stored per month. Not shown in the OS. |
| Badges | `src/client/utils/badges.ts` (812 badges, v32) | Streak / word-turn / codex badges; a few "three-month", "perfect month" badges | No **Month Seal** series tied to the 12-month track. |
| Demo account | `src/server/routes/public-api.ts` (`machiavelli`) | Hard-coded Legacy profile: 1469-day streak, 2,847 answers, 1,469 notes, 4,316 total entries, one `memoryStory` paragraph | Shows only the *end state*. Nothing shows *how it got there*. |

**Design consequence:** we do not invent a new engine. We add a **calendar spine (12 Months)** on top of
the existing **depth engine (scores, densities, badges, Memory)** and make the Memory Engine *publish a
sealed chapter every month*.

---

## 1. Core model — two axes

```
                    DEPTH (what you put in)  →
                    Seed          Sprout        Bloom
   MONTH (time)   ┌─────────────┬─────────────┬─────────────┐
   M1 … M12  ↓    │ chrome ✓    │ chrome ✓    │ chrome ✓    │
                  │ short chron.│ full chron. │ rich chron. │
                  │ matte seal  │ inked seal  │ gilt seal   │
                  └─────────────┴─────────────┴─────────────┘
```

* **Month axis = what gets unlocked (chrome).** Time alone opens the month. A quiet user is never
  locked out of Month 4; the paid promise ("12 months, 12 unlocks") stays true.
* **Depth axis = how rich it feels.** Log entries, morning check-ins, self-care clicks and Memory
  answers decide Seed / Sprout / Bloom for that month. Depth sets the **length and specificity of the
  Chronicle**, the **finish of the Seal**, and how far the **layout density** can go.
* **Quiet month ≠ failed month.** A Seed month gets a "Chronicle of Quiet" — short, warm, no guilt.
  (Consistent with `compassionate-interventions.ts`.)

### 1.1 The signals that drive Depth

| Signal | Source event | Weight in month Depth score |
|---|---|---|
| **Log entries** (journal + thoughts, text > 20 chars) | `note` | **40%** — the most important evolutionary state |
| **Morning check-ins** | `emotional_checkin` (morning window) | **25%** |
| **Self-care button clicks** | `self_care_complete` (skips count 0, never negative) | **20%** |
| **Memory answers** | Memory Engine taps | **15%** |

`monthDepth = Σ weight × min(1, actual / monthTarget)` → **Seed < 0.5 ≤ Sprout < 1.0 ≤ Bloom**
(Bloom = hit ≥ 100% of the weighted target).

### 1.2 Proposed cumulative targets (calibrate with real telemetry — these are design-time guesses)

| End of | Log entries | Check-ins (days) | Self-care clicks | Memory answers |
|---|---:|---:|---:|---:|
| M1 | 20 | 10 | 30 | 25 |
| M2 | 50 | 24 | 80 | 60 |
| M3 | 90 | 40 | 150 | 110 |
| M4 | 140 | 58 | 240 | 170 |
| M5 | 200 | 78 | 350 | 240 |
| M6 | 270 | 100 | 480 | 320 |
| M7 | 350 | 124 | 630 | 410 |
| M8 | 440 | 150 | 800 | 510 |
| M9 | 540 | 178 | 990 | 620 |
| M10 | 650 | 208 | 1,200 | 740 |
| M11 | 770 | 240 | 1,430 | 870 |
| **M12** | **900** | **275** | **1,700** | **1,010** |

Machiavelli (1,469 notes · 2,847 answers · 842 active days) is the **Legacy ceiling** — what year 2, 3
and beyond look like. A faithful 12-month user lands at roughly 60% of him on Log depth, and that is
exactly the point: *the demo is where you are going, not where you must be by December.*

---

## 2. The 12-month map at a glance

Four quarters = the four existing story chapters. Five layout densities spread across the year.

```
 Q1 · AWAKENING          Q2 · EXPLORATION        Q3 · INTEGRATION        Q4 · MASTERY
 M1  SIGNAL              M4  PORTRAIT            M7  RESONANCE           M10 ARCHITECT
 M2  ECHO                M5  RHYTHM              M8  ALTITUDE            M11 THRESHOLD
 M3  PATTERN  ◆ Active   M6  MERIDIAN  ◆ Half    M9  RITUAL              M12 CODEX    ◆ Portrait

 density: breathable ─── comfortable ───────── compact ───────────── dense ────────── instrument
          (M1–M2)         (M3–M5)               (M6–M8)               (M9–M11)         (M12)
```

| # | Month | Quarter | Density | One-line feel | Seal |
|--:|---|---|---|---|---|
| 1 | SIGNAL | Awakening | breathable | "I am here." The page wakes up. | `▰▱▱▱▱▱▱▱▱▱▱▱` |
| 2 | ECHO | Awakening | breathable | The system repeats *your* words back. | `▰▰▱▱▱▱▱▱▱▱▱▱` |
| 3 | PATTERN ◆ | Awakening | comfortable | First pattern named. **Active User.** | `▰▰▰▱▱▱▱▱▱▱▱▱` |
| 4 | PORTRAIT | Exploration | comfortable | A first sketch of *you*. | `▰▰▰▰▱▱▱▱▱▱▱▱` |
| 5 | RHYTHM | Exploration | comfortable | The day gets a shape. | `▰▰▰▰▰▱▱▱▱▱▱▱` |
| 6 | MERIDIAN ◆ | Exploration | compact | Halfway. The interface re-arranges itself. | `▰▰▰▰▰▰▱▱▱▱▱▱` |
| 7 | RESONANCE | Integration | compact | LOT starts to speak first. | `▰▰▰▰▰▰▰▱▱▱▱▱` |
| 8 | ALTITUDE | Integration | compact | Rare air. Instruments appear. | `▰▰▰▰▰▰▰▰▱▱▱▱` |
| 9 | RITUAL | Integration | dense | Self-care is a habit; the UI is built around it. | `▰▰▰▰▰▰▰▰▰▱▱▱` |
| 10 | ARCHITECT | Mastery | dense | You edit the OS, not just use it. | `▰▰▰▰▰▰▰▰▰▰▱▱` |
| 11 | THRESHOLD | Mastery | dense | The Year Story is being drafted. | `▰▰▰▰▰▰▰▰▰▰▰▱` |
| 12 | CODEX ◆ | Mastery | instrument | The Portrait is sealed. Welcome to Legacy. | `▰▰▰▰▰▰▰▰▰▰▰▰` |

The Seal bar **is** the "Months unlocked: N/12" widget (see §5). One glyph system, used everywhere:
widget, badge, email subject, public-profile header.

---

## 3. Month-by-month spec

Each month is defined by the same seven fields so the whole year reads as one system:

`UI STATE` (what appears on the 1st) · `NEW` (unlocks) · `LOG GATE` (Bloom threshold that month) ·
`AI VOICE` · `AFFIRMATION` (said once, on the 1st). `LOG GATE` figures are **per-month increments**; cumulative totals are in §1.2.
Fields: `AI VOICE` · `AFFIRMATION` (said once, on the 1st) · `BADGE` · `CHRONICLE` (example, written in
Machiavelli's voice so it can seed the demo).

### Q1 — AWAKENING  *(breathable → comfortable)*

#### M1 · SIGNAL  `▰▱▱▱▱▱▱▱▱▱▱▱`
* **DAY 1 (the barebone UI):** black page · clock · weather line · **one** Memory question ·
  **one** Log field ("What's on your mind?") · **one** self-care button · Seal widget `0 / 12 → Month 1`.
  Nothing else renders. No sidebar, no stats, no badges shelf.
* **UI STATE:** maximum whitespace; text at 85% opacity; no grid.
* **NEW:** Morning check-in (one tap, 3 options) appears on Day 2; Log history list appears after entry #3.
* **LOG GATE (Bloom):** 20 entries · 10 check-ins · 30 self-care clicks · 25 answers.
* **AI VOICE:** quiet, asks, never explains. *"Good morning. How does today feel?"*
* **AFFIRMATION:** *"You started. That is the hardest month and it is already behind you."*
* **BADGE:** `Seal I — Signal`.
* **CHRONICLE (M1):** *"Florence woke slowly. I wrote down only what I could not forget: the bells at six,
  a promise made to myself in the cold, the first citizen who looked at me and saw no prince. I asked
  little of the day and it gave me exactly that — a beginning with nothing to prove."*

#### M2 · ECHO  `▰▰▱▱▱▱▱▱▱▱▱▱`
* **UI STATE:** the Log list now shows **"You said…"** — a one-line echo of an entry from 7+ days ago.
* **NEW:** Memory questions begin referencing prior answers by name ("Since you prefer tea…"). Self-care
  button becomes a **row of 3** (body · mind · soul). Weekly "Compressing…" state on Sunday evening.
* **LOG GATE:** 30 new entries (50 cum.) · 14 check-ins · 50 clicks.
* **AI VOICE:** reflective; first direct quotation of the user.
* **AFFIRMATION:** *"The system is learning your voice. Keep speaking."*
* **BADGE:** `Seal II — Echo`.
* **CHRONICLE (M2):** *"I heard myself returned to me. The line about patience — I wrote it in anger, and
  it came back in calm. A man's words are a mirror held at a different hour. I began to notice which
  mornings I tell the truth and which I merely perform."*

#### M3 · PATTERN ◆ *Active User*  `▰▰▰▱▱▱▱▱▱▱▱▱`
* **UI STATE:** density → **comfortable**. A thin hairline grid appears. The Seal widget gains a
  subtitle: **"Active User."** First **Quarter Digest** (see §4.3).
* **NEW:** Pattern Insights widget (first named pattern, e.g. *"You write most when it rains."*) ·
  Mood Analytics · Streak counter · Badges shelf (first 3 slots).
* **LOG GATE:** 40 new (90 cum.) · 16 check-ins · 70 clicks.
* **AI VOICE:** names things. *"I notice you…"*
* **AFFIRMATION:** *"Three months. You are not trying LOT — you are using it."*
* **BADGE:** `Seal III — Pattern` **+ Quarter Seal Q1 "Awakened"** (first badge with a gilt edge possible).
* **CHRONICLE (M3):** *"Rain brings introspection; sun brings ambition. I did not decide this — I found it
  written in my own hand, nine times, on nine different days. A pattern is only a habit that has been
  noticed. Now that I see it, I may use it."*

### Q2 — EXPLORATION  *(comfortable → compact)*

#### M4 · PORTRAIT  `▰▰▰▰▱▱▱▱▱▱▱▱`
* **UI STATE:** the first **Portrait card** pins to the top: archetype (provisional), 3 values, 1 emotional
  pattern. Label reads *"Sketch — 40% confident"*. Confidence rises monthly.
* **NEW:** Psychological profile preview · Intention widget · Planner.
* **LOG GATE:** 50 new (140) · 18 check-ins · 90 clicks.
* **AI VOICE:** hypotheses, hedged. *"It may be that you…"*
* **AFFIRMATION:** *"A portrait begins as a few strokes. Yours already has a face."*
* **BADGE:** `Seal IV — Portrait`.
* **CHRONICLE (M4):** *"The system named me The Strategist and I laughed, then checked the evidence. It was
  there: in the way I wait, in the questions I ask before I answer. I disagreed with one line, and the
  disagreement taught me more than the agreement."*

#### M5 · RHYTHM  `▰▰▰▰▰▱▱▱▱▱▱▱`
* **UI STATE:** the page re-times itself to the user's day — morning layout (check-in first), midday
  (Log first), evening (reflection first). The order of widgets follows *their* hours.
* **NEW:** Circadian view · Energy capacitor · "Best hour to write" hint · self-care suggestions by time.
* **LOG GATE:** 60 new (200) · 20 check-ins · 110 clicks.
* **AI VOICE:** practical coach. *"You are sharpest at 9. Protect it."*
* **AFFIRMATION:** *"Consistency is not discipline. It is the day finally having a shape."*
* **BADGE:** `Seal V — Rhythm`.
* **CHRONICLE (M5):** *"Dawn is mine. By the third hour of light my thinking is a clean blade; after supper
  it is a tired dog. I stopped scheduling hard letters for the evening and the letters improved."*

#### M6 · MERIDIAN ◆ *Half-declared*  `▰▰▰▰▰▰▱▱▱▱▱▱`
* **UI STATE:** density → **compact**. The widgets **re-arrange once, visibly** (animated 1.4 s reflow) and
  a banner reads *"Layout upgraded."* This is the biggest single "the app changed" moment of the year.
* **NEW:** Widget arrange (drag) · Data export · **Half-Year Story** (6 chronicles → 1 paragraph) ·
  Public profile page switch-on offer (`/u/you`).
* **LOG GATE:** 70 new (270) · 22 check-ins · 130 clicks.
* **AI VOICE:** retrospective. First *"In Month 2 you wrote… now you wrote…"* comparison.
* **AFFIRMATION:** *"Six months. Half the portrait is painted — and it is unmistakably you."*
* **BADGE:** `Seal VI — Meridian` + **Quarter Seal Q2 "Explorer"**.
* **CHRONICLE (M6):** *"Halfway, I looked back and could not find the man who began. Not because he vanished
  — because he was folded into me. The first month's doubts are now load-bearing walls."*

### Q3 — INTEGRATION  *(compact → dense)*

#### M7 · RESONANCE  `▰▰▰▰▰▰▰▱▱▱▱▱`
* **UI STATE:** LOT **speaks first** for the first time: a context card at the top *before* the user acts
  ("Rain, Tuesday, low energy last 2 days — a slow morning?").
* **NEW:** Proactive context cards · Signal stream · Weather-aware prompts · Cohort connect.
* **LOG GATE:** 80 new (350) · 24 check-ins · 150 clicks.
* **AI VOICE:** anticipatory, still brief.
* **AFFIRMATION:** *"The system has been listening for seven months. Today it speaks first."*
* **BADGE:** `Seal VII — Resonance`.
* **CHRONICLE (M7):** *"A message arrived before I had asked: the day was grey, I had slept badly, would I
  like a slow morning? It was right. To be known in advance is both a comfort and a small vertigo."*

#### M8 · ALTITUDE  `▰▰▰▰▰▰▰▰▱▱▱▱`
* **UI STATE:** **instrument strip** appears (a single thin top bar: QOS mode · energy · streak ·
  Seal). Rare-air treatment: a few "Rare" badges unlock, glow starts (`--evolution-glow-intensity` > 0).
* **NEW:** Correlated indexes (selfAwareness, longevity) · QOS mode readout · weather station teaser.
* **LOG GATE:** 90 new (440) · 26 check-ins · 170 clicks.
* **AI VOICE:** concise, numerate. *"Self-awareness index: 58 (+6)."*
* **AFFIRMATION:** *"Eight months. Few people reach this altitude. You are not here by accident."*
* **BADGE:** `Seal VIII — Altitude` (rarity: Rare).
* **CHRONICLE (M8):** *"At this height the air is thin and the numbers are honest. Self-awareness, they say,
  has risen by six. I do not trust numbers, but I trust that I wanted to see them."*

#### M9 · RITUAL  `▰▰▰▰▰▰▰▰▰▱▱▱`
* **UI STATE:** density → **dense**. The self-care row becomes the visual centre: a **Ritual dock** that
  remembers the user's three most-clicked care actions and puts them one tap away, always.
* **NEW:** Ritual dock · **Quarter Digest Q3** · Story/Narrative widget · Private spaces.
* **LOG GATE:** 100 new (540) · 28 check-ins · 190 clicks.
* **AI VOICE:** ceremonial, warm. *"Your evening ritual: nine times this month."*
* **AFFIRMATION:** *"The practice is a habit now. The interface is built around it."*
* **BADGE:** `Seal IX — Ritual` + **Quarter Seal Q3 "Integrated"**.
* **CHRONICLE (M9):** *"I no longer decide to care for myself; the day arranges itself around it. Tea, then
  the page, then walking the ramparts. A ritual is a decision made once and honored daily until it
  becomes the shape of the man."*

### Q4 — MASTERY  *(dense → instrument)*

#### M10 · ARCHITECT  `▰▰▰▰▰▰▰▰▰▰▱▱`
* **UI STATE:** the user can now **edit the OS**: choose which 5 widgets are "Core", pin the Seal,
  pick badge metaphor (Water ∘≈≋ / Architecture ├╞║). The page offers *"Design your cockpit."*
* **NEW:** Custom themes · Widget arrange (full) · Badge selection · Cohort leadership view.
* **LOG GATE:** 110 new (650) · 30 check-ins · 210 clicks.
* **AI VOICE:** collaborator. Asks the user's *opinion* on its own suggestions.
* **AFFIRMATION:** *"You are no longer a user of this system. You are its architect."*
* **BADGE:** `Seal X — Architect`.
* **CHRONICLE (M10):** *"I rearranged the rooms of my own mind this month — removed three habits, promoted
  one. It felt less like tidying and more like governing. The state of a man, like a state, is mostly
  decided by what he refuses to maintain."*

#### M11 · THRESHOLD  `▰▰▰▰▰▰▰▰▰▰▰▱`
* **UI STATE:** the page begins to **quote the whole year**: the Seal widget shows a 11-chronicle
  "spine" (one word per month). A "Year Story — drafting…" card appears with a visible compression
  counter climbing ("3,914 signals → ? words").
* **NEW:** Year Story preview (private) · Weather station · Wallet/Legacy preview · invitation to
  choose what the public profile may show.
* **LOG GATE:** 120 new (770) · 32 check-ins · 230 clicks.
* **AI VOICE:** intimate, almost silent. Fewer words, more weight.
* **AFFIRMATION:** *"One more month. Everything you wrote is about to become one page."*
* **BADGE:** `Seal XI — Threshold`.
* **CHRONICLE (M11):** *"I stood at the door of the year and read my own handwriting from the start. It was
  not the record of a successful man — it was the record of an attentive one, and that, I think, is
  rarer and more useful."*

#### M12 · CODEX ◆ *Portrait complete*  `▰▰▰▰▰▰▰▰▰▰▰▰`
* **UI STATE:** density → **instrument** — the Machiavelli cockpit: instrument strip, correlated
  indexes, weather station, wallet, full badge shelf, public profile live. The **Year Story** unseals
  as a full-screen, one-paragraph reveal, then settles into the permanent **Codex** shelf.
* **NEW:** Year Story · Codex shelf (12 sealed chronicles + 4 digests + 1 year paragraph) ·
  **Legacy** track (Weather Station, Wallet) · printable/exportable Year Book · `/u/you` public mirror.
* **LOG GATE:** 130 new (900 cum.) · 35 check-ins · 270 clicks · 1,010 answers.
* **AI VOICE:** the full LOT® AI — knows, anticipates, defers.
* **AFFIRMATION:** *"One year with LOT. The portrait is complete — and still evolving."*
  (existing `MONTH_MESSAGES[12]` — keep it.)
* **BADGE:** `Seal XII — Codex` + **Quarter Seal Q4 "Master"** + **Year Seal "Legacy"** (gilt, animated).
* **CHRONICLE / YEAR STORY (M12):** *"Twelve months ago I wrote one line and did not know who was reading.
  I now know: it was the man I was becoming. The art of governance is the art of understanding human
  nature, and I began, at last, with my own. The portrait is complete. The painter, fortunately, is not."*

---

## 4. Memory compression delivery — the 12-month tangible spine

> The product promise: **"Everything you give LOT comes back to you smaller, truer, and yours."**

### 4.1 Compression ladder (what the user literally sees)

```
 signals (Log, check-ins, care, answers)
        │  month ends                       ratio shown on card
        ▼
  MONTH CHRONICLE   ~60–90 words            "412 signals → 74 words"
        │  every 3 months
        ▼
  QUARTER DIGEST    ~60 words (3→1)         "3 chapters → 1 paragraph"
        │  M6 (half) + M12 (year)
        ▼
  HALF-YEAR / YEAR STORY   ~90 words (6→1 / 12→1)
        │
        ▼
  CODEX SHELF  — 12 sealed chronicles, 4 digests, 1 year paragraph
```

The **ratio line** is the product's most honest flex: the user watches 3,914 raw signals become
one paragraph. Compression *is* the value.

### 4.2 Month Chronicle — anatomy (one card, fixed layout)

```
┌──────────────────────────────────────────────────────────┐
│  MONTH 4 · PORTRAIT                    ▰▰▰▰▱▱▱▱▱▱▱▱ 4/12  │
│                                                            │
│  The system named me The Strategist and I laughed, then    │
│  checked the evidence. It was there: …                     │
│                                                            │
│  ▸ From Month 2: "I wrote it in anger, it returned calm."  │
│  218 signals → 74 words           depth: SPROUT  ◈ inked   │
│                                                            │
│  "A portrait begins as a few strokes. Yours has a face."   │
│  [ Keep ]   [ Read the whole month ]   [ Share quietly ]  │
└──────────────────────────────────────────────────────────┘
```

Rules for the generator (extends `generateMemoryStory`):
1. **One paragraph, first person, ≤ 90 words.** No bullets. No advice.
2. **Must quote or reference at least one earlier month** (continuity → the year feels cumulative).
3. **Cite depth honestly:** Seed months are short and gentle; Bloom months are specific (times, weather, words).
4. **Never invent facts.** Only things present in the month's logs/answers.
5. **Privacy:** story is stored in the user's DB; AI provider only executes (per README doctrine).
6. **Voice drift:** tone matures with the month (M1 hesitant → M12 sovereign) — a style parameter, not a rewrite.

### 4.3 Delivery moments

| Moment | Where | What |
|---|---|---|
| **Day 1 of month N+1, first open** | Top of OS | Chronicle card for month N + Seal tick + affirmation. Blocks nothing; one tap to dismiss. |
| **Day 1, 08:00 local** | Email (existing monthly job) | Same paragraph + ratio line. Subject: `LOT · Month 4 · ▰▰▰▰▱▱▱▱▱▱▱▱` |
| **Mid-month (day 15)** | Seal widget | One-line "whisper": next unlock + depth progress. |
| **Last 3 days** | Seal widget | "Compressing…" state; counter ticks up; makes the chronicle feel *earned*. |
| **M3 / M6 / M9 / M12** | Fullscreen card | Quarter Digest / Half-Year Story / Year Story. |
| **Any time** | Codex shelf (`/story`) | Re-read all sealed chapters, scrub through the year. |

### 4.4 Data shape (proposal)

```ts
// src/shared/types — proposed
interface UsershipChronicle {
  month: number                 // 1..12
  periodStart: string           // ISO date, month boundary from usershipSince
  status: 'drafting' | 'sealed'
  depth: 'seed' | 'sprout' | 'bloom'
  signals: { logs: number; checkins: number; selfCare: number; answers: number }
  text: string                  // ≤ 90 words
  callback: { fromMonth: number; quote: string } | null
  ratioLine: string             // "412 signals → 74 words"
  affirmation: string
  sealedAt?: string
}
interface UsershipJourney {
  usershipSince: string         // paid-start date — NOT joinedAt
  monthsUnlocked: number        // 0..12, derived from calendar
  chronicles: UsershipChronicle[]
  digests: { quarter: 1|2|3|4; text: string }[]
  yearStory?: string
}
```

---

## 5. The "Months unlocked" widget (replaces / extends `MonthlyPulseWidget`)

Context-based: it changes its **content** by where you are in the month, not just its number.

| When | Reads |
|---|---|
| Day 0 (paid, first open) | `Months unlocked: 0/12 · Day 1 — ▱▱▱▱▱▱▱▱▱▱▱▱` |
| Day 1 of month N | `Months unlocked: N/12` + Chronicle N−1 card |
| Mid-month | `Months unlocked: 3/12 · Month 4 in 11 days · depth 62%` |
| Last 3 days | `Months unlocked: 3/12 · compressing Month 3… 218 signals` |
| Quiet month | `Months unlocked: 5/12 · a quiet month. It is kept.` |
| Month 12 | `Months unlocked: 12/12 · Codex sealed` → collapses to Seal glyph forever |

Implementation notes (derived from the scan):
* Count from **`usershipSince`**, not `joinedAt` (a free user who upgrades in month 5 must start at Month 0).
* Persist dismissal **server-side** (`localStorage` is per-device today).
* Reuse `Block`, the 1400 ms fade, and the existing `DISMISS_PHRASES`.

---

## 6. UI evolution mechanics — what visibly changes, in one table

| Layer | M1–2 | M3–5 | M6–8 | M9–11 | M12 |
|---|---|---|---|---|---|
| **Layout density** | breathable | comfortable | compact | dense | instrument |
| **Visible widgets (approx.)** | 3 | 6 | 10 | 14 | all unlocked |
| **Grid hairline** | none | faint | visible | structured | precise |
| **Text opacity** | 0.85 | 0.90 | 0.95 | 0.98 | 1.0 |
| **Glow** | 0 | 0 | trace | subtle | `0.3` |
| **AI voice** | asks | names | anticipates | collaborates | knows & defers |
| **Memory question depth** | surface | referenced | cohort | soul | personal-archetype |
| **Badges shelf slots** | 0 | 3 | 8 | 20 | full (812-badge codex) |
| **Seal finish** | matte | inked | inked+edge | gilt edge | animated gilt |
| **Top chrome** | none | none | none → **instrument strip (M8)** | strip + indexes | strip + indexes + Legacy |

Map to code: `visualRefinement` gets a **time floor** (`monthFloor(N)`) so density can never be *below* the
month's band, while Depth (Log/check-ins/care) can lift it **one band above** the floor and drives glow &
Chronicle richness. That keeps "tangible every month" true without making it purely calendar-driven.

---

## 7. Badges — the Month Seal series (proposal for Codex v33)

| Group | Badges | Notes |
|---|---|---|
| **Month Seals** | 12 (`seal_01_signal` … `seal_12_codex`) | Awarded on the 1st of the *next* month; finish = depth (matte / inked / gilt) |
| **Quarter Seals** | 4 (`Awakened`, `Explorer`, `Integrated`, `Master`) | At M3 / M6 / M9 / M12 |
| **Year Seal** | 1 (`Legacy`) | M12 only, animated gilt |
| **Depth variants** | 3 per Month Seal | Seed / Sprout / Bloom finish → collecting the "Bloom" set is the optional challenge |
| **Behaviour badges** | `first_echo`, `first_pattern_named`, `first_unprompted_card`, `ritual_dock_set`, `cockpit_designed` | Tie to M2, M3, M7, M9, M10 events |

= **17 canonical + 36 finish variants.** The codex currently holds 812; this adds a coherent, time-bound
series rather than more random volume.

---

## 8. Demo account — make `/u/machiavelli` tell the story

Today the demo shows only the end state. Proposal, in order of value:

1. **Month Scrubber (the killer demo device).** A slider on the public profile, M1 → M12. Dragging it
   re-renders the Machiavelli cockpit as it looked in that month: density, widgets, Seal, Chronicle,
   AI voice. A prospect *watches the OS grow* in ten seconds.
2. **`journey` object in the demo payload** (`public-api.ts` ~line 745): 12 chronicles (§3 text),
   4 digests, the Year Story, `monthsUnlocked: 12`, per-month signal counts that sum to the existing
   demo totals (2,847 answers · 1,469 notes · 842 active days).
3. **Codex shelf section** on the public profile: 12 Seals in a row, sealed-chronicle on tap.
4. **Machiavelli stays "Legacy"**: M12 is his *first* year; the wallet, weather station and
   1,469-day streak are what year 4 looks like. The scrubber could extend past 12 → "Year 2…4".

---

## 9. Edge cases & principles

* **Skipped weeks** → "Chronicle of Quiet", Seed finish, no shaming copy. Seal still awarded.
* **Pause/cancel & resume** → counter freezes; resume continues, never resets (the Memory is theirs).
* **Late upgrade** → Month 0 starts on payment date; earlier free-tier history is *quoted* in Chronicle 1
  ("Before you subscribed you wrote…") so history isn't wasted.
* **Mental-health safety** → any Seed month with distress keywords routes via
  `detectSemanticStruggle` — the Chronicle becomes supportive, never celebratory.
* **Subtlety first** (INTERFACE_EVOLUTION principle 1): one *loud* moment per quarter (M3, M6, M9, M12),
  quiet increments otherwise.
* **Never gamify guilt.** Depth changes richness, not access.

---

## 10. Build order (if approved)

| # | Item | Size | Where |
|--:|---|---|---|
| 1 | Add `usershipSince`; derive `monthsUnlocked` server-side | S | `models/user.ts`, `shared/types` |
| 2 | `UsershipChronicle` table + monthly sealing job (reuse `monthly-summary.ts` + `story-generator.ts`) | M | `scheduled-jobs.ts`, new `chronicle.ts` |
| 3 | Months-unlocked widget v2 (supersedes `MonthlyPulseWidget`) + server-side dismiss | S | `components/MonthlyPulseWidget.tsx` |
| 4 | `monthFloor()` + density bands in `interfaceEvolution.ts` | S | `utils/interfaceEvolution.ts` |
| 5 | Month-gated barebone → full widget registry | M | `System.tsx` |
| 6 | Month Seal badges (Codex v33) | M | `utils/badges.ts` |
| 7 | Demo `journey` payload + Month Scrubber on `/u/machiavelli` | M | `public-api.ts`, `PublicProfile.tsx` |
| 8 | Codex shelf `/story` + Year Book export | M | new component |

Open questions for S-2 are listed in the session report.

---

*The interface evolves with you — one month, one seal, one paragraph at a time.*
