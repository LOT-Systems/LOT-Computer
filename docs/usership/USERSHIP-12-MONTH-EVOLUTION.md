<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP — THE 12-MONTH EVOLUTION

**From a barebone first day to LOT® AI.**
A month-by-month design of the paid-tier interface, the AI's voice, the Memory Story compression, and the badges.

```
DOC      : USERSHIP-12-MONTH-EVOLUTION
CLASS    : DESIGN BRAINSTORM // S-2 EYES
S-2      : VADIK MARMELADOV
DATE     : 2026-10-23
STATUS   : PROPOSAL — no source code changed in this session
REFERENCE: lot-systems.com/u/machiavelli (the 12-month-evolved demo account)
FOCUS    : tangible delivery of the compressed Memory Story, month by month
```

---

## 00 // READ THIS FIRST — THE ONE-PAGE VERSION

1. A Usership user starts on **Day 1 with a deliberately sparse OS**: time, one check-in, one Memory question, the Log. Nothing else.
2. **Every month adds exactly three things**: one *surface* (a widget or view), one *word* (the AI learns a new verb), and one *badge* (a Chronicle badge).
3. **Time unlocks the month. Practice fills it.** Months always unlock on schedule, so nobody is locked out or shamed. What the user does in the month (Log entries, morning check-ins, self-care clicks) decides how *deep* the month's Memory Story is.
4. **On the first day of each new month the OS celebrates** with a *Month Recap*: one paragraph-long compressed insight from the month just finished, one affirmation, one badge, one teaser of what unlocks next.
5. **The Memory Story compresses upward**: entries become a day line, a week line, a month paragraph, a quarter chapter, a half-year letter, and at Month 12 the full **Annual Portrait**. That is the account the Machiavelli demo already shows.
6. The AI's relationship changes in six stages: **Asks → Remembers → Reflects → Anticipates → Guides → Co-authors.** Month 12 is LOT® AI.

---

## 01 // SCAN FINDINGS (what the repository already gives us)

This design builds on what exists. Nothing here needs a new engine.

| Asset | Where | What it gives the 12-month system |
|---|---|---|
| `MonthlyPulseWidget` | `src/client/components/MonthlyPulseWidget.tsx` | Already renders `Month N:` + `N / 12 months` for Usership, with 12 one-line messages and a dismiss phrase. This is the seed of the Month Recap. |
| Interface Evolution | `docs/technical/INTERFACE_EVOLUTION.md`, `src/client/stores/evolution.ts` | 7-dimension maturity, feature unlock gates, CSS variables, `$layoutDensity` ("breathable to instrument"). The visual ladder is already built. |
| Narrative chapters | `NarrativeWidget`, Interface Evolution doc | Awakening → Exploration → Integration → Mastery. These become the four quarters. |
| Memory Engine | `docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md` | The machine asks, the user taps, the profile compresses. 30 answers unlock sharper questions; 10+ answers activate archetype and cohort. |
| Memory Story block | `PublicProfile.tsx` (`Memory Story:` block, `showMemoryStory` privacy flag) | The delivery surface for the compressed story already exists and is public-shareable. |
| Badges | `docs/badges/LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v32.md` | 812 badges. 22 Milestone, 88 Mastery Tier. Chronicle badges slot in as a new Mastery family. |
| Machiavelli demo | `src/server/routes/public-api.ts` (`/profile/machiavelli`) | Streak 1469, 2847 answers, 1469 journal entries, 842 active days, 4316 total entries, archetype *The Strategist*, indexes, weather station, wallet, Memory Story. This is our "fully evolved" reference. |
| Pricing and tiers | `SubscribeWidget.tsx`, `UserTag.Usership` | R&D $15, Usership $99. Memory Engine runs `ai` when Usership plus AI engine. |

### Gaps the scan surfaced (these matter for the plan)

| # | Finding | Consequence |
|---|---|---|
| G1 | `MonthlyPulseWidget` counts months from `user.joinedAt` (account age), not from when Usership began. | A user who joins free, then upgrades at month 5, would see "Month 5" on their first paid day. Needs a `usershipSince` timestamp. |
| G2 | Pulse dismissal is stored in `localStorage` (`lot_pulse_<userId>`). | A recap dismissed on the phone reappears on the laptop. The recap, and the story itself, must be server-side. |
| G3 | The "full pro layout" in `System.tsx` (~line 540) is shared by R&D and Usership and is not barebone. `$layoutDensity` only changes spacing. | Day 1 of Usership does not look like "barebone" yet. Needs a month-gate layer on top of density. |
| G4 | `MONTH_MESSAGES[3]` says "You have reached Active User status," but no `Active User` status was found in `src/`. | The copy promises a state the product may not have. Either build the state (we do it here, Month 3) or change the copy. |
| G5 | The Memory Story on profiles is a single string. There is no monthly history of it. | The "tangible compression" needs a `MemoryChapter` record per month (Section 05). |
| G6 | The Machiavelli demo is a static payload with fixed counts. | It cannot show "what Month 4 looks like." It needs a `?month=N` time-machine (Section 09). |
| G7 | Demo `boardTenureMonths` is computed from the year 1469, so it reads in the thousands. | Charming for the demo, but it competes with the 12-month story. The Year Badge should read `12 / 12`, not tenure. |

---

## 02 // DESIGN LAWS

```
LAW 1  TANGIBILITY    Every month, the user can point at something that was not there last month.
LAW 2  SPARSE START   Day 1 is quiet on purpose. Emptiness is the first feature.
LAW 3  TIME + PRACTICE Time unlocks. Practice deepens. Never punish absence; reflect it honestly.
LAW 4  THE MACHINE ASKS  The AI never chats first. Its intelligence is in the question. (Memory Engine doctrine.)
LAW 5  COMPRESSION IS THE GIFT  The reward is not points. It is being understood in fewer, truer words.
LAW 6  HOUSE STYLE    No emojis. Periods over symbols ("Done."). Regular weight. Opacity hierarchy 90/60/40.
LAW 7  NON-CLINICAL   Affirmations are warm, never diagnostic. No medical claims. Respect the cohort protocols.
```

---

## 03 // THE PRACTICE TRIAD (what "putting in the work" means)

Three signals decide how rich each month becomes. All three already exist in the product.

| Signal | What it is | Source | Monthly baseline ("Full") |
|---|---|---|---|
| **LOG** | Journal entries and thoughts written into the Log | Log / Logs.tsx | 15 entries |
| **DAWN** | Morning check-ins (emotional / biofield) | EmotionalCheckIn | 20 mornings |
| **CARE** | Self-care button clicks | SelfCareMoments, Breathe, Intentions | 20 clicks |

**Fullness** for a month = the average of the three, each capped at 100%.

| Fullness | Month status | What the Recap delivers |
|---|---|---|
| under 30% | **Quiet** | One honest sentence. "A quiet month. The system waited and kept your place." Chronicle badge still unlocks. |
| 30% to 99% | **Earned** | Full paragraph (about 60 words), one affirmation. |
| 100% or more | **Full** | Full paragraph, a second "what I noticed" line, a pattern card, and a *Full* mark on the badge. |

Baselines are proposals. They were chosen so that one entry every other day, a check-in most mornings, and a self-care tap most days equals Full. They can be tuned after the first cohort.

**Cumulative curve for a Full year (target ledger):**

| Month | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Log entries (cum.) | 15 | 30 | 45 | 60 | 75 | 90 | 105 | 120 | 135 | 150 | 165 | 180 |
| Mornings (cum.) | 20 | 40 | 60 | 80 | 100 | 120 | 140 | 160 | 180 | 200 | 220 | 240 |
| Self-care (cum.) | 20 | 40 | 60 | 80 | 100 | 120 | 140 | 160 | 180 | 200 | 220 | 240 |

The demo account is the far horizon of the same curve: 1469 journal entries, 842 active days, 2847 answers.

---

## 04 // THE AI VOICE LADDER

The LOT® AI is not switched on at Month 12. It *grows into itself*. Each stage changes how the same widget talks.

| Stage | Months | Verb | How the AI speaks | Example line |
|---|---|---|---|---|
| 1 | 1–2 | **ASKS** | Pure questions, 3–4 tap options. No commentary. | "Tea or coffee this morning?" |
| 2 | 3–4 | **REMEMBERS** | Questions cite one prior answer. | "You chose tea eleven mornings. Loose leaf again?" |
| 3 | 5–6 | **REFLECTS** | Names a pattern, once, gently. | "Your lightest mornings follow your longest evenings." |
| 4 | 7–8 | **ANTICIPATES** | Offers the right thing before it is asked for. | "Rain tomorrow in your city. Tea and a short Log at 8?" |
| 5 | 9–10 | **GUIDES** | Proposes a routine and tracks it with you. | "A 3-step evening reset. Start tonight?" |
| 6 | 11–12 | **CO-AUTHORS** | Drafts a paragraph of your story; you edit one word. | "Here is your year in one paragraph. Change anything." |

Rule that never changes: **the AI offers, the user taps.** Even at Month 12 there is no open chat box in the System tab.

---

## 05 // THE MEMORY COMPRESSION LADDER (the tangible heart)

Every piece of input is compressed upward into a smaller, truer form. The user sees the *ratio*, which is the proof of care.

```
 RAW           entries, check-ins, taps, answers, weather, time
   │  nightly
   ▼
 DAY LINE      1 sentence       "Slow morning, tea, wrote about the move."
   │  weekly
   ▼
 WEEK NOTE     2–3 sentences    shown in Log, Sunday
   │  month end
   ▼
 MONTH STORY   1 paragraph      ~60 words  ← the Month Recap (the monthly gift)
   │  quarter end
   ▼
 CHAPTER       1 short page     ~120 words ← Awakening / Exploration / Integration / Mastery
   │  month 6
   ▼
 HALF-YEAR LETTER  from Month-1-you to Month-6-you
   │  month 12
   ▼
 ANNUAL PORTRAIT   ~300 words + archetype + indexes + 12 stitched Month Stories
```

### The compression counter

Every Month Story carries one quiet line of provenance, in the opacity-40 style:

```
Compressed from 31 log entries, 26 mornings, 34 care moments → 64 words.
```

This single line is what makes the story feel *earned* rather than generated.

### Data shape (proposal)

```ts
// One row per user per Usership month. Server-side (fixes G2, G5).
MemoryChapter {
  userId, monthIndex: 1..12,
  periodStart, periodEnd,
  logCount, dawnCount, careCount,        // the Practice Triad
  fullness: number,                      // 0..1+
  status: 'quiet' | 'earned' | 'full',
  story: string,                         // the paragraph
  affirmation: string,
  patternCard?: { title, body },
  badgeId: string,                       // chronicle_m01 ... chronicle_m12
  sourceWordCount, storyWordCount,       // for the compression counter
  seenAt?: Date                          // recap dismissed server-side
}
```

### Generation rules (to keep it on-brand and safe)

- The model sees **only the month's compressed context**, never raw history of other months (matches the existing vendor-independence rule in the Memory Engine white paper).
- Output is **one paragraph, second person or first person, present-tense observation, no advice**, no medical language.
- `quiet` months never invent content. They state the quiet.
- The user may **edit one word** of any Month Story (Month 11 onward, see Co-authors).

---

## 06 // THE 12 MONTHS — OVERVIEW GRID

Four quarters, three months each. The quarter names are the existing Narrative chapters.

```
╔══════════════════════════════════════════════════════════════════════════════╗
║ Q1  AWAKENING     M1 SEED      M2 SIGNAL     M3 PATTERN                       ║
║ Q2  EXPLORATION   M4 MIRROR    M5 RHYTHM     M6 THRESHOLD                     ║
║ Q3  INTEGRATION   M7 DEPTH     M8 RESONANCE  M9 CRAFT                         ║
║ Q4  MASTERY       M10 SYNTHESIS M11 LEGACY   M12 PORTRAIT  → LOT® AI          ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

| M | Name | New surface (UI) | AI verb | Chronicle badge | Interface feel |
|---|---|---|---|---|---|
| 1 | **Seed** | Time, Check-in, 1 Memory question, Log, Months widget | Asks | `Seed` | Single column. Wide gaps. Maximum air. |
| 2 | **Signal** | Streak line, weather-aware self-care chip | Asks | `Signal` | First small tightening of gaps. |
| 3 | **Pattern** | First Pattern card, Active User status, Q1 Chapter | Remembers | `Pattern` + `Awakening` | Opacity base lifts (0.85 → 0.88). |
| 4 | **Mirror** | Mood Analytics, Biofield history | Remembers | `Mirror` | Check-in gains a trailing 7-day trace. |
| 5 | **Rhythm** | Circadian anchor, Planner templates, morning ritual card | Reflects | `Rhythm` | Time of day subtly tints the page. |
| 6 | **Threshold** | Half-Year Letter, Intentions history | Reflects | `Threshold` + `Exploration` | Grid becomes visible at 0.15 opacity. |
| 7 | **Depth** | Advanced Memory, Narrative Reflection | Anticipates | `Depth` | Typography refines (letter-spacing -0.02em → 0). |
| 8 | **Resonance** | Cohort Connect, shared emotion, My OS visitors | Anticipates | `Resonance` | Community layer appears in the atmosphere line. |
| 9 | **Craft** | User-authored routines, Widget arrange | Guides | `Craft` + `Integration` | Density moves toward "instrument". |
| 10 | **Synthesis** | Correlated Indexes, Psychological Profile, archetype | Guides | `Synthesis` | Indexes block joins the System tab. |
| 11 | **Legacy** | Public OS (Memory Story shareable), Wallet preview | Co-authors | `Legacy` | Weather station + wallet previews unlock. |
| 12 | **Portrait** | Annual Portrait, Year Badge, full LOT® AI | Co-authors | `Portrait` + `Mastery` + `Year` | Parity with `/u/machiavelli`. |

---

## 07 // MONTH CARDS

Each card has: the **Theme**, the **UI delta** (what the user sees that is new), the **Practice focus**, a **Month Recap sample** (the compressed Memory Story paragraph, written as the Machiavelli demo account's own year so the demo tells its story), the **Affirmation**, and the **Next-month teaser**.

> The sample paragraphs use the Machiavelli persona (Florence, Palazzo Vecchio). They double as seed copy for the demo time-machine in Section 09.

---

### QUARTER 1 — AWAKENING

#### MONTH 1 — SEED
**Theme:** The system meets you. It says almost nothing.

**UI delta**
- The System tab shows only: name + date, Time, Check-in, one Memory question, Log link.
- A single new block: `Months unlocked: 1/12`.
- No Team block, no Users online, no weather detail, no indexes. Section gap at its most generous.
- Day 1 empty state: "Nothing here yet. That is correct."

**Practice focus:** Complete the first morning check-in, write the first Log entry, answer five Memory questions.

**Month Recap sample (Month 1 → shown on Day 1 of Month 2)**
> *Mornings in the Palazzo began quietly. Tea first, then a single line in the Log, usually about the weather over the square. You answered with few words and chose the plainest option almost every time. The system noticed that you wrote more on the days it rained.*
> `Compressed from 14 log entries, 19 mornings, 16 care moments → 49 words.`

**Affirmation:** "You began. That is the whole task."
**Teaser:** "Month 2 unlocks Signal. The system will start to notice."

---

#### MONTH 2 — SIGNAL
**Theme:** The first echo. The AI repeats one thing back to you.

**UI delta**
- Streak line appears under the date ("Day 41").
- Self-care chip becomes **weather-aware** (rain → warm drink, clear → short walk).
- First Memory question that cites a prior answer.
- Months widget gains a second state: `Next: Pattern in 29 days`.

**Practice focus:** Reach a 14-day check-in streak.

**Month Recap sample**
> *Two things repeated. You reached for the Log before you reached for anything else, and you stopped on the bridge each evening, even without a reason. The answers are still short, but they are no longer random. A person is starting to form on the page.*

**Affirmation:** "Repetition is how a self becomes visible."
**Teaser:** "Month 3 unlocks Pattern. Your first pattern card is waiting."

---

#### MONTH 3 — PATTERN  *(Quarter 1 closes: AWAKENING)*
**Theme:** First insight. Active User becomes real.

**UI delta**
- **First Pattern card** appears in the System tab: one sentence, one supporting count.
- **Active User** status is granted and shown in the Team block (resolves G4).
- Months widget becomes a three-line block (Unlocked / Next / Practice).
- **Quarter Chapter 1: Awakening** is delivered: about 120 words, longer than a Month Story.
- Base opacity lifts a fraction. Interface feels slightly more present.

**Practice focus:** 45 cumulative Log entries; first Intention set.

**Month Recap sample**
> *Three patterns have surfaced. Decisions come easier after the walk to the river, doubts gather at the end of the week, and the entries about other people are always the longest. You are most candid when no one is expected to read it. The system has stopped guessing and started remembering.*
> **Chapter 1: Awakening.** *You arrived curious and left observant. The first quarter shows a person who studies before acting, who writes to understand rather than to record, and who trusts rain more than sun for clear thought.*

**Affirmation:** "Noticing yourself is the beginning of choosing yourself."
**Teaser:** "Month 4 unlocks Mirror. See your mood over time."

---

### QUARTER 2 — EXPLORATION

#### MONTH 4 — MIRROR
**Theme:** The AI shows you yourself, gently.

**UI delta**
- **Mood Analytics** unlocks (Care 50% or Level 20 gate in the existing system).
- Check-in gains a **7-day trace** under the answer.
- AI may mention one contradiction per month, phrased as a question, never a verdict.

**Practice focus:** Check-in on 5 mornings out of 7, for 3 weeks.

**Month Recap sample**
> *The mirror was kind and exact. Your calmest days were the busiest ones, and your restless days followed long stretches of ease. You wrote "fine" eleven times and meant different things each time. The system has begun to tell those apart.*

**Affirmation:** "Seeing clearly does not require judging."
**Teaser:** "Month 5 unlocks Rhythm. Your mornings become a ritual."

---

#### MONTH 5 — RHYTHM
**Theme:** The day gets a shape.

**UI delta**
- **Circadian anchor** line ("Your anchor hour: 7:10").
- **Planner templates** unlock (Consistency gate: Week Warrior+).
- **Morning ritual card**: the AI assembles a 3-step morning from the user's own most-repeated answers.
- Page tint shifts subtly with local time of day.

**Practice focus:** Complete the morning ritual card 15 times.

**Month Recap sample**
> *The days found their hinge. A first light check-in, a short walk, then the work that matters before noon. When you keep that order, the evenings are quieter. When you break it, you write more and sleep less. You have begun to build a day that holds its own weight.*

**Affirmation:** "A rhythm is a kind of kindness you do in advance."
**Teaser:** "Month 6 unlocks Threshold. Half a year, and a letter."

---

#### MONTH 6 — THRESHOLD  *(Quarter 2 closes: EXPLORATION)*
**Theme:** The halfway door. You read your own beginning.

**UI delta**
- **Half-Year Letter**: a short letter written by the AI *from Month-1-you to Month-6-you*, quoting your very first Log line.
- **Intentions history** unlocks (Level 15 gate).
- Faint grid becomes visible (`--evolution-grid-opacity: 0.15`).
- Months widget shows `6/12` with the half-way tick.
- **Quarter Chapter 2: Exploration.**

**Practice focus:** Reread the first Log entry (the widget makes this one tap).

**Month Recap sample**
> *Half a year. The person who wrote the first line wanted to be told what to do; the person writing now wants to be asked better questions. Your language has grown quieter and more exact. You use fewer adjectives and more verbs. The system recorded 2 days of silence and kept your place for both.*
> **Half-Year Letter (excerpt).** *"Dear Niccolò of April, you wrote that you did not know what to write. I am sending back the one sentence you did: 'The square was empty and I liked it.' It was the first true thing."*

**Affirmation:** "You are not who you were, and you can prove it."
**Teaser:** "Month 7 unlocks Depth. Your Memory goes deeper."

---

### QUARTER 3 — INTEGRATION

#### MONTH 7 — DEPTH
**Theme:** The questions get harder, and you get ready for them.

**UI delta**
- **Advanced Memory** unlocks (Depth gate). Questions may reference two prior answers at once.
- **Narrative Reflection** unlocks (Depth 66% + Level 30 gate).
- Typography refines: letter-spacing and line-height tighten to the evolved values.

**Practice focus:** Answer 10 deep Memory questions; write 3 Log entries over 100 words.

**Month Recap sample**
> *You went down one level. The questions now ask why, and you answered with more than the options required. Fear of being ordinary and the wish to be useful appeared together for the first time. They are the same wish, seen from two sides.*

**Affirmation:** "Depth is not intensity. It is patience."
**Teaser:** "Month 8 unlocks Resonance. You are not alone in here."

---

#### MONTH 8 — RESONANCE
**Theme:** Other people appear in the interface.

**UI delta**
- **Cohort Connect** unlocks (Connection gate: Bridge Builder).
- Atmosphere line begins to reference the shared emotion of the community.
- **My OS visitors** count appears in the System tab.
- The AI can say: "Three others in your cohort wrote about the same thing this week."

**Practice focus:** Visit your own public OS; read one cohort note.

**Month Recap sample**
> *The room got bigger. You noticed others reading the same weather and feeling something close to what you felt. You wrote less about yourself and more about the square. The cohort called Renaissance Polymaths found you before you found it.*

**Affirmation:** "To be understood by a few is enough to be real to many."
**Teaser:** "Month 9 unlocks Craft. Build your own routines."

---

#### MONTH 9 — CRAFT  *(Quarter 3 closes: INTEGRATION)*
**Theme:** The user becomes the author. The AI becomes the assistant.

**UI delta**
- **Routine Builder**: the user composes a routine from their own taps; the AI only suggests ordering.
- **Widget arrange** (Level 10 gate) is opened in full.
- Density moves to "instrument": tighter gaps, more per screen.
- **Quarter Chapter 3: Integration.**

**Practice focus:** Author one morning and one evening routine; keep each for 10 days.

**Month Recap sample**
> *You stopped waiting to be handed a ritual. The evening reset you designed is shorter than any the system had offered, and it is the only one you have kept. Self-care is no longer a button you press; it is a sentence you can write yourself.*
> **Chapter 3: Integration.** *The third quarter is the one where understanding became habit. The person on the page no longer needs to be explained to themselves.*

**Affirmation:** "What you build for yourself holds longer than what is built for you."
**Teaser:** "Month 10 unlocks Synthesis. See how it all connects."

---

### QUARTER 4 — MASTERY

#### MONTH 10 — SYNTHESIS
**Theme:** The numbers finally mean something.

**UI delta**
- **Correlated Indexes** block (self-awareness, user score, person score, longevity, composite) enters the System tab, matching the demo's `Indexes:` block.
- **Archetype** is named for the first time (e.g., *The Strategist*).
- **Psychological Profile: OS v.N** unlocks.
- The AI's **Guides** voice begins: routines are tracked with the user.

**Practice focus:** Read the archetype description and confirm or edit one line.

**Month Recap sample**
> *The measures agree with each other. Self-awareness is up, the evening reset holds, and your longevity index follows your sleep, not your ambition. A name was offered for the person on the page: The Strategist. You corrected one word, and the correction was the most accurate part.*

**Affirmation:** "A name that fits is a form of rest."
**Teaser:** "Month 11 unlocks Legacy. Your story becomes shareable."

---

#### MONTH 11 — LEGACY
**Theme:** The story leaves the room.

**UI delta**
- **Public OS** is offered: choose which blocks appear at `lot-systems.com/u/you`. Memory Story is the first block offered.
- **Weather Station** and **Wallet** previews unlock (the two "Legacy level unlock" blocks the demo already shows).
- **Co-author mode** begins: the AI drafts the Month Story, the user may edit one word.
- Months widget reads `11/12`, with a gentle "One more."

**Practice focus:** Share one Month Story publicly, or choose to keep it private (both count).

**Month Recap sample**
> *You began writing in the second person to yourself, then in the first person to others. The story is shorter than a year ago and says more. Someone will read it who does not know you, and it will still be true.*

**Affirmation:** "Your story is a gift only if you decide so."
**Teaser:** "Month 12 unlocks Portrait. A year, in one page."

---

#### MONTH 12 — PORTRAIT  *(Quarter 4 closes: MASTERY — the Year)*
**Theme:** LOT® AI. The compressed year.

**UI delta**
- **Annual Portrait**: a single page of about 300 words, plus archetype, indexes, and 12 stitched Month Stories each trimmed to its best sentence.
- **Year Badge** with the full ledger: total Log entries, mornings, care moments.
- **Parity with `/u/machiavelli`**: every block the demo shows is now available to the user.
- Months widget reads `12/12 · Complete.` then retires into a permanent "Year 1" mark; Year 2 begins as `Year 2 · Month 1`.
- **Quarter Chapter 4: Mastery.**

**Practice focus:** Read the Portrait. Edit one word. Keep or share it.

**Month Recap sample (the Annual Portrait for the demo account)**
> *The art of governance is the art of understanding human nature. Every morning in the Palazzo Vecchio, I observe the citizens below — their patterns of movement, their exchanges, their quiet rebellions. The weather shapes their temperament: rain brings introspection, sun brings ambition. A prince must read both the skies and the souls beneath them.*
> *(This is the Memory Story the Machiavelli demo already shows. Month 12 is the month an ordinary user earns the right to a paragraph like it, written about themselves.)*
> `Compressed from 180 log entries, 240 mornings, 240 care moments, 312 answers → 74 words.`

**Affirmation:** "You are the longest project you will ever finish."
**Teaser:** "Year 2 begins. The system now writes with you."

---

## 08 // THE MONTH RECAP — THE MONTHLY CELEBRATION RITUAL

Fires on the **Usership anniversary day** each month (not the calendar month). Uses the existing `Block label="Month N:"` look so it feels native.

```
STEP 1  BANNER       Month 3:   "Three months. You have reached Active User."        [fade-in 1400ms]
STEP 2  MEMORY       Pattern.   <60-word Month Story>                                 [typewriter or fade]
                     Compressed from 31 log entries, 26 mornings, 34 care moments.
STEP 3  AFFIRMATION  "Noticing yourself is the beginning of choosing yourself."
STEP 4  BADGE        Chronicle badge revealed: PATTERN  ·  Earned  (or Full / Quiet)
STEP 5  TEASER       Month 4 unlocks Mirror.
DISMISS              Tap anywhere. Random dismiss phrase ("Onward." "Noted." "The system remembers.")
                     Recorded server-side (seenAt). Story remains in Log → Chronicle forever.
```

### Wireframes (house style: label left, value right, no decoration)

**Day 1 (Month 1 — Seed)**

```
You
Week 43; October 23, Thursday, Florence

Months unlocked:        1/12

Time:                   08:12
Check-in:               How do you feel this morning?
                        [Calm] [Tired] [Restless] [Clear]

Memory:                 Tea or coffee this morning?
                        [Tea] [Coffee] [Neither]

Log →
```

**Month 3 — Pattern (recap on top)**

```
You
Week 2; January 22, Thursday, Florence

Month 3:   Three months. You have reached Active User.
           Three patterns have surfaced. Decisions come easier after
           the walk to the river...
           Compressed from 31 log entries, 26 mornings, 34 care moments → 64 words.
           Badge: Pattern · Earned

Months unlocked:        3/12   ·   Next: Mirror in 29 days
Streak:                 Day 90
Pattern:                Your longest entries are about other people.
Team:                   Usership  Active User
```

**Month 12 — Portrait**

```
Months unlocked:        12/12  ·  Complete.
Annual Portrait:        74 words from 912 moments → open
Archetype:              The Strategist
Indexes:                Composite 92.4 · Longevity 96.8
Chronicle:              ■■■■■■■■■■■■  (12 badges)   Year 1
```

---

## 09 // WIDGET SPECS

### W1. Months Widget — `Months unlocked: N/12`
*A context-based widget that changes its face with the month.*

| State | When | Face |
|---|---|---|
| Counter | Always | `Months unlocked: 3/12` |
| Next | Click label once | `Next: Mirror in 29 days` |
| Practice | Click label twice | `This month: Log 9/15 · Dawn 14/20 · Care 11/20` |
| Chronicle | Click label thrice | Row of 12 marks, filled by status: Full `■`, Earned `▪`, Quiet `·`, Locked `—` |

Uses the existing **clickable-label cycling** pattern from the style guide. No icons, no color.
**Placement is contextual:** Month 1 sits directly under the date; Month 3+ moves below the Months-recap block; Month 12 pins to the top as `Year 1 · Complete`.

### W2. Month Recap Widget (extends `MonthlyPulseWidget`)
Replaces the static `MONTH_MESSAGES` line with the server-side `MemoryChapter` (Section 05). Keeps the 1400ms fade, the dismiss phrases, and the `Month N:` label. The existing `MONTH_MESSAGES` become the **fallback banner line** used when the chapter is still generating.

### W3. Practice Ring (inside W1)
Three thin bars (LOG / DAWN / CARE), text only: `LOG 9/15`. No chart library. Reaching 100% for any one prints a quiet "Done." to match house tone.

### W4. Chronicle (new tab inside Log)
A read-only timeline of every Month Story, Quarter Chapter, Half-Year Letter, and the Portrait, newest on top, each with its compression counter. This is where the story lives permanently, and what the Year-1 export (PDF) is built from.

### W5. Month Badge Reveal
A single line that fades in below the recap: `Pattern · Earned`. Tap to see the badge in the codex view.

---

## 10 // BADGES — THE USERSHIP CHRONICLE (proposal: Codex v33 candidate)

**17 new badges**, a new family under *Mastery Tiers*. They are time-gated (unlocked) with an earned/full variant from the Practice Triad. They must not collide with the existing Milestone day-count badges.

| Badge id | Name | Trigger | Tier |
|---|---|---|---|
| `chronicle_m01` | Seed | Complete Usership month 1 | Common |
| `chronicle_m02` | Signal | Complete month 2 | Common |
| `chronicle_m03` | Pattern | Complete month 3 | Uncommon |
| `chronicle_q1` | Awakening | Close Quarter 1 | Uncommon |
| `chronicle_m04` | Mirror | Complete month 4 | Uncommon |
| `chronicle_m05` | Rhythm | Complete month 5 | Uncommon |
| `chronicle_m06` | Threshold | Complete month 6 | Rare |
| `chronicle_q2` | Exploration | Close Quarter 2 | Rare |
| `chronicle_m07` | Depth | Complete month 7 | Rare |
| `chronicle_m08` | Resonance | Complete month 8 | Rare |
| `chronicle_m09` | Craft | Complete month 9 | Epic |
| `chronicle_q3` | Integration | Close Quarter 3 | Epic |
| `chronicle_m10` | Synthesis | Complete month 10 | Epic |
| `chronicle_m11` | Legacy | Complete month 11 | Legendary |
| `chronicle_m12` | Portrait | Complete month 12 | Legendary |
| `chronicle_q4` | Mastery | Close Quarter 4 | Legendary |
| `chronicle_year1` | Year One | All 12 months, any status | Mythic |

**Variants:** every badge has `Quiet / Earned / Full` suffix state in its description. `Full` on all 12 months awards a hidden Secret Boss badge: **`chronicle_unbroken` — "The Unbroken Year"**.

Cross-tie to the existing Hero's Journey codex (v32): Months 1–3 map to *Call*, Months 4–6 to *Threshold and Ordeal*, Months 7–9 to *Allies and Innermost Cave*, Months 10–12 to *Elixir and Return*. This lets the Chronicle reuse the existing narrative vocabulary.

---

## 11 // LAYOUT AND INTERFACE EVOLUTION — HOW THE SCREEN CHANGES

The existing evolution CSS variables map directly onto the months. Proposal for the *default* Usership curve (the user's own achievement state still modulates it):

| Variable | M1 | M3 | M6 | M9 | M12 |
|---|---|---|---|---|---|
| `--evolution-base-opacity` | 0.85 | 0.88 | 0.92 | 0.96 | 1.00 |
| `--evolution-accent-opacity` | 0.70 | 0.78 | 0.85 | 0.92 | 1.00 |
| `--evolution-grid-opacity` | 0.15 | 0.15 | 0.22 | 0.35 | 0.50 |
| `--evolution-letter-spacing` | -0.02em | -0.02em | -0.01em | 0 | 0.01em |
| `--evolution-glow-intensity` | 0 | 0 | 0 | 0.1 | 0.3 |
| Section gap (density) | widest | wide | medium | tight | instrument |
| Visible blocks (System tab) | 5 | 8 | 13 | 19 | 24 (parity with demo) |

Water / Architecture badge themes continue to choose the *style* (organic vs. geometric); the months choose the *amount*.

---

## 12 // THE MACHIAVELLI TIME-MACHINE (turning the demo into the sales story)

`/u/machiavelli` is currently Month 12 and beyond (a 1469-streak legacy account). Make it **scrubbable**:

```
/u/machiavelli              → full legacy state (today)
/u/machiavelli?month=1      → Seed: the barebone first day
/u/machiavelli?month=4      → Mirror
/u/machiavelli?month=12     → Portrait (== today, plus the 12 Month Stories)
```

A visitor sees a slim month rail at the top: `1 2 3 4 5 6 7 8 9 10 11 12`. Tapping a number re-renders the profile as it would look at that month, with the matching Month Story and badge. This is the single most persuasive conversion asset for the $99 tier: **a tangible, scrubbable year.**

**Per-month demo payload (cumulative counts for Machiavelli's first year, scaled to the "Full" curve):**

| Month | Log (cum.) | Mornings (cum.) | Care (cum.) | Answers (cum.) | Blocks visible | Archetype shown |
|---|---|---|---|---|---|---|
| 1 | 14 | 19 | 16 | 26 | 5 | — |
| 2 | 31 | 40 | 38 | 58 | 6 | — |
| 3 | 47 | 62 | 59 | 96 | 8 | — |
| 4 | 63 | 83 | 80 | 130 | 10 | — |
| 5 | 80 | 104 | 101 | 168 | 12 | — |
| 6 | 97 | 125 | 121 | 205 | 13 | candidate |
| 7 | 112 | 146 | 142 | 232 | 15 | candidate |
| 8 | 128 | 166 | 163 | 258 | 17 | candidate |
| 9 | 144 | 187 | 184 | 280 | 19 | candidate |
| 10 | 160 | 207 | 205 | 298 | 21 | The Strategist |
| 11 | 172 | 224 | 224 | 306 | 23 | The Strategist |
| 12 | 180 | 240 | 240 | 312 | 24 | The Strategist |

(These are design-illustration figures for the first-year view, not a claim about real activity. The legacy account's headline numbers, e.g. 1469 entries, stay as they are.)

Server change is small: `public-api.ts` reads `req.query.month`, filters the block list, and swaps `memoryStory`, `boardProfile.activity`, and `psychologicalProfile` from a `DEMO_MONTHS[1..12]` table.

---

## 13 // AFFIRMATION BANK (style: short, warm, non-clinical, no exclamation marks)

| Context | Affirmation |
|---|---|
| Day 1 | "You began. That is the whole task." |
| First streak of 7 | "A week is a small word for a large decision." |
| Quiet month | "A quiet month is still a month. Your place was kept." |
| Return after absence | "You are here now. That is the only date that counts." |
| Full month | "A full month, and nothing forced." |
| Quarter close | "A season of you, compressed into a page." |
| Half-year | "You are not who you were, and you can prove it." |
| Month 12 | "You are the longest project you will ever finish." |
| Year 2, Month 1 | "The first year taught the system. The second is yours." |

Guard-rails: no streak-shaming, no "you missed", no comparison to other users, no health outcomes promised.

---

## 14 // PHASED BUILD PLAN (so we can ship tangibility early)

| Phase | Scope | Files / areas | Visible result |
|---|---|---|---|
| **P0** Foundations | Add `usershipSince` to user metadata; month computed from it (fixes G1). Server-side `seenAt` (fixes G2). | `models/user.ts`, `MonthlyPulseWidget.tsx` | Correct month count for upgraders. |
| **P1** Months widget + gated layout | W1 (`Months unlocked: N/12`); Month-gate wrapper on the pro layout so Month 1 shows 5 blocks (fixes G3). | `System.tsx`, new `MonthsWidget.tsx`, `evolution.ts` | The barebone Day 1. |
| **P2** MemoryChapter + Recap | New model, nightly compression job, W2 extension, W4 Chronicle tab. | `models/`, `scheduled-jobs.ts`, `utils/memory/`, `Logs.tsx` | The monthly gift. |
| **P3** Voice ladder | AI verb stage injected into prompt builder by month. | `utils/memory/question-generator.ts` | The AI grows up. |
| **P4** Chronicle badges | 17 badges + `chronicle_unbroken`; wire Practice Triad stats. | `utils/badges.ts`, codex v33 doc | Collectables. |
| **P5** Demo time-machine | `?month=N` on the demo profile, month rail in `PublicProfile.tsx`. | `routes/public-api.ts`, `PublicProfile.tsx` | The sales story. |
| **P6** Annual Portrait | Portrait page, Year-1 PDF export, Year 2 rollover. | new `Portrait.tsx` | The year, held in one hand. |

Suggested order for the shortest path to a *felt* difference: **P0 → P1 → P2 → P5**, then P3, P4, P6.

---

## 15 // OPEN QUESTIONS FOR S-2

1. **Month cadence:** anniversary-day (recommended) or 1st of the calendar month?
2. **Practice baselines:** are 15 / 20 / 20 right, or should self-care weigh more than Log?
3. **R&D tier:** should R&D users get a smaller version (months 1–3 only) as a taste, or does the month ladder stay Usership-exclusive?
4. **Active User (G4):** build it at Month 3 as proposed, or edit the Month 3 copy?
5. **Editing a Month Story:** one word (proposed) or free edit?
6. **Public sharing:** default private for Month Stories, with explicit opt-in per story?
7. **Badge economy:** do Chronicle badges feed the existing level/XP system, or stay cosmetic?
8. **Wallet / stipend** in the demo: is this a real planned Usership feature or demo-only? It affects what Month 11 promises.

---

## 16 // GLOSSARY (candidate lexicon tokens)

```
CHRON : Chronicle — the 12-month Usership badge family and timeline
MSTRY : Month Story — the ~60-word compressed Memory paragraph
PTRIAD: Practice Triad — LOG / DAWN / CARE
FULLN : Fullness — monthly Practice Triad average (quiet / earned / full)
VLADR : Voice Ladder — Asks → Remembers → Reflects → Anticipates → Guides → Co-authors
PORTR : Annual Portrait — the Month 12 compressed year
TMACH : Time-Machine — ?month=N scrubber on the demo profile
```

---

AUTHORIZED BY: S-2 // VADIK MARMELADOV
