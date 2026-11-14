<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® USERSHIP — THE 12-MONTH EVOLUTION

## From a barebone first day to LOT® AI, one compressed month at a time

```
╔══════════════════════════════════════════════════════════════════════╗
║   LOT SYSTEMS — USERSHIP PRODUCT SPEC                                ║
╠══════════════════════════════════════════════════════════════════════╣
║  DOC      : LOT-USERSHIP-12-MONTH-EVOLUTION                          ║
║  DATE     : 2026-11-14                                               ║
║  CLASS    : PRODUCT / UX / MEMORY ENGINE                             ║
║  TIER     : Usership ($99 / month)                                   ║
║  END STATE: lot-systems.com/u/machiavelli (12-month reference)       ║
║  S-2      : VADIK MARMELADOV                                         ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 0. The one-sentence product

> **Each month of Usership ends with a Memory Capsule: one paragraph in which
> the system tells the person who they were that month. Twelve capsules
> compress into four Chapters. Four Chapters compress into one Year. The
> interface grows with each compression, and at Month 12 it is LOT® AI.**

The person should be able to point at the screen and say *"this wasn't here
last month"*, and the reason should always be something they did: what they
wrote, what they answered, the mornings they checked in, the self-care they
completed. Visiting the app is not enough.

---

## 1. Grounding: what already exists in the repo

This spec is built from parts that are already in the codebase. Section 9
lists the few pieces that are new.

| Existing piece | Where | Role in the 12-month system |
|---|---|---|
| `MonthlyPulseWidget` (Month 1–12 messages, `n / 12 months`) | `src/client/components/MonthlyPulseWidget.tsx` | Becomes the **Usership Month widget**, the place each month is celebrated |
| Memory Engine compression loop (5 modes, 4 depth levels) | `docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md` | Supplies the raw material for each **Memory Capsule** |
| Weekly Story-Report | `docs/corporate/LOT-AI-PRODUCT-BRIEF.md` | Weekly Story → Monthly Capsule → Quarterly Chapter → Annual Story |
| Interface Evolution CSS variables (`--evolution-*`) | `docs/technical/INTERFACE_EVOLUTION.md`, `src/client/stores/evolution.ts` | Drives the **visual** maturation month to month |
| Assembly phases `dormant → awakening → forming → assembled → integrated` | `src/server/routes/public-api.ts` | Maps onto Months 1 → 12 |
| Badge Codex v32 — *The Hero's Journey* | `docs/badges/LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v32.md` | The 12-stage monomyth becomes the **12-month narrative spine** |
| Public profile `/u/:user` (psychological profile, board profile, correlated indexes, Legacy widgets) | `src/client/components/PublicProfile.tsx` | The public mirror, which gains one layer per month |
| Demo account Machiavelli | `src/server/routes/public-api.ts` (`userIdOrUsername === 'machiavelli'`) | The **fully evolved reference state** |
| Log events `note`, `answer`, `emotional_checkin`, `self_care_complete` | server logs | The **four evolution signals** |

### 1.1 The reference end-state: `/u/machiavelli`

What a fully evolved account looks like, taken from the demo payload:

```
Archetype ............ The Strategist (+ description)
Core values .......... virtù · prudence · adaptability · fortune · statecraft
Emotional patterns ... calculated restraint · strategic patience · controlled intensity
Self-awareness ....... 87
Behavioral cohort .... Renaissance Polymaths
Pattern strength ..... 5 traits with counts (842 / 631 / 574 / 489 / 311)
Answers .............. 2,847      Journal entries ... 1,469      Active days ... 842
Correlated indexes ... Self 87 · User 94.2 · Person 91.7 · Longevity 96.8 · Composite 92.4 ↑
Board profile ........ memories compiled · journal entries · active days · clearance Full
Memory Story ......... one dense first-person paragraph
Legacy unlocks ....... Weather Station · Wallet
Tags ................. [RND] [Usership] [Legacy]
```

Machiavelli is the ceiling, and it sits a little past Month 12: his 842
active days are more than a calendar year. Month 12 is designed to give a
person **every section of that profile**. Only the volume differs. Legacy
(Weather Station and Wallet) is shown as the next horizon.

---

## 2. The four evolution signals

There are four signals, and each one is a deliberate act by the person.
Passive presence (logins, tab switches) feeds the Memory Engine's context.
It never unlocks a month.

| # | Signal | Log event | Why it matters |
|---|---|---|---|
| **S1** | **Journal / Log entries** | `note` (text > 20 chars) | The most important signal. It is the raw material of the story. |
| **S2** | **Memory answers** | `answer` | Compression. Each tap sharpens the portrait. |
| **S3** | **Morning check-ins** | `emotional_checkin` before 12:00 local | Ritual. The daily anchor. |
| **S4** | **Self-care completions** | `self_care_complete` | Embodiment. The practice becomes physical. |

### 2.1 The month gate ("Months unlocked")

**A calendar month passing does not unlock a Usership month. The person's
evidence does.** This is what makes `Months unlocked: 3/12` mean something.

Each Usership month (30 days from the anniversary of `joinedAt`) is evaluated
on its own window. Totals do not carry over, so a strong Month 2 cannot pay
for an empty Month 3.

| Grade | Rule | Meaning |
|---|---|---|
| `open` | The current month, still in progress | Shown as `▪` with a live progress line |
| `unlocked` | **3 of 4** signals met at *Base* | The month is counted in `Months unlocked: n/12` |
| `sealed` | **4 of 4** signals met at *Full* | The month badge is earned in its luminous form (`◉`) |
| `quiet` | Window closed, gate not met | The month is **not lost**. Its capsule is still written. It can be **re-opened** (§2.3). |

**Base / Full thresholds per 30-day window.** They are tuned for real life,
not for Machiavelli, and they rise gently each quarter so the practice deepens:

| Signal | Q1 (M1–3) Base / Full | Q2 (M4–6) | Q3 (M7–9) | Q4 (M10–12) |
|---|---|---|---|---|
| S1 Journal entries | 6 / 15 | 8 / 20 | 10 / 25 | 12 / 30 |
| S2 Memory answers | 20 / 60 | 25 / 75 | 30 / 90 | 30 / 100 |
| S3 Morning check-ins | 8 / 20 | 10 / 22 | 12 / 24 | 12 / 25 |
| S4 Self-care completions | 10 / 30 | 12 / 35 | 15 / 40 | 15 / 45 |

**Machiavelli pace** (daily rate from the demo account): 3.4 answers and
1.7 journal entries per active day. Over 12 months at about 70% active days,
that comes to roughly **870 answers, 430 journal entries and 255 active
days**. That is the "luminous year", and it clears every *Full* threshold.

### 2.2 The Evolution Score (one number for the curve)

```
EvolutionScore(month) = 0.40·S1 + 0.25·S2 + 0.20·S3 + 0.15·S4    (each normalized to Full = 1.0, capped at 1.2)
```

Journal entries carry the most weight because they hold the most story.
The score sets the capsule's length and tone (§4.3). It also feeds
`--evolution-*` CSS intensity so the interface visibly matures.

### 2.3 Quiet months and re-opening

There is no punishment. A quiet month shows as `○` (hollow) in the strip, and
its capsule is still written in a compassionate register: *"A quieter month.
The system kept the light on."* A quiet month can be re-opened once by
sealing the following month (4/4 signals at Full). The strip then shows `◌→●`
and the capsule gains a closing line: *"…and what followed repaired the
silence."* This follows the Trauma-Informed Protocol in the Memory Engine:
the system never shames absence.

---

## 3. The narrative spine: twelve months as twelve stages

The v32 Badge Codex already uses the monomyth vocabulary (`call_heard`,
`threshold_crossed`, `mentor_arrived`, `innermost_cave`, `ordeal_survived`,
`elixir_found`, `return_road`). The twelve-stage Hero's Journey has the same
number of stages as a year of Usership, so each month gets one stage, and the
months group into four Chapters (one per quarter).

```
                         THE USERSHIP YEAR

   CHAPTER I            CHAPTER II           CHAPTER III          CHAPTER IV
   FOUNDATION           STRUCTURE            DEPTH                INTEGRATION
   "Being known"        "Being built"        "Being seen"         "Becoming"
   ─────────────        ─────────────        ─────────────        ─────────────
   M1  Ordinary World   M4  Tests & Allies   M7  Reward           M10 Road Back
   M2  The Call         M5  Approach         M8  Allies (Sync)    M11 Resurrection
   M3  Threshold        M6  Ordeal ◐         M9  Habit = Self     M12 Elixir → LOT® AI
   ─────────────        ─────────────        ─────────────        ─────────────
   assembly: awakening  assembly: assembled  assembly: integrated assembly: integrated+
            → forming                                             (LOT® AI)
   Seal ◇               Seal ◈               Seal ◆               Seal ⊙ (The Year)
```

### 3.1 Badge glyphs: the Usership Dial

The glyphs come from the two existing badge themes. **Water** (`∘ ≈ ≋`) is
used for the inner months and **Architecture** (`├─ ╞═╡ ║·║`) for the
structural months, so the year has one coherent glyph language.

| Month | Badge ID | Glyph | Name | Chapter seal |
|---|---|---|---|---|
| 1 | `usership_m01_first_light` | `∘` | First Light | |
| 2 | `usership_m02_the_call` | `∘∘` | The Call | |
| 3 | `usership_m03_threshold` | `∘∘∘` | Threshold | `◇` `usership_ch1_foundation` |
| 4 | `usership_m04_foundation` | `├─` | Foundation | |
| 5 | `usership_m05_approach` | `╞═╡` | Approach | |
| 6 | `usership_m06_half_declared` | `◐` | Half-Declared | `◈` `usership_ch2_structure` |
| 7 | `usership_m07_reward` | `≈` | Reward | |
| 8 | `usership_m08_rare_air` | `≋` | Rare Air | |
| 9 | `usership_m09_habit_self` | `║·║` | Habit Becomes Self | `◆` `usership_ch3_depth` |
| 10 | `usership_m10_road_back` | `◎` | The Road Back | |
| 11 | `usership_m11_resurrection` | `◉·` | Resurrection | |
| 12 | `usership_m12_elixir` | `◉` | The Elixir — LOT® AI | `⊙` `usership_year_compressed` |

A **sealed** month (4/4 at Full) shows its glyph at full opacity with an
`--evolution-glow-intensity` halo. An **unlocked** month shows at `opacity-60`.
A **quiet** month shows the hollow form `○`.

---

## 4. Memory compression: the core deliverable

> Focus directive (S-2): **12-month tangibility of the compressed Memory story.**

### 4.1 The compression ladder

```
   LOGS                 ~1,500–4,000 events / year
     │   (daily)
     ▼
   WEEKLY STORY         52 short reflections          (existing LOT® AI Story-Report)
     │   (every 30 days)
     ▼
   MEMORY CAPSULE       12 paragraphs                 ← NEW · the monthly gift
     │   (every 3 months)
     ▼
   CHAPTER              4 paragraphs                  ← NEW · quarterly seal
     │   (Month 12)
     ▼
   THE YEAR             1 paragraph + 12 one-liners   ← NEW · the Elixir
```

The compression is visible to the person. The text gets **shorter and denser**
as it moves up the ladder. Twelve paragraphs become four, and four become one,
while the year's single paragraph says more than any of the twelve did alone.
At the bottom level the person sees their life, and at the top they see what
it amounts to.

### 4.2 Memory Capsule: anatomy

Generated on the first day of each new Usership month, from the closed 30-day
window. Stored as log event `memory_capsule`.

```
┌─ Memory Capsule · Month 4 · Foundation ├─ ──────────────────────────┐
│                                                                      │
│  October was the month you stopped asking whether the morning tea    │
│  mattered. Eleven of your entries began before eight, most in the    │
│  quiet after rain. You wrote about your father twice and about work  │
│  nineteen times, but every self-care you finished was for the body:  │
│  walks, water, sleep. The system noticed that your answers grew      │
│  shorter as they grew more certain. You are building something.      │
│                                                                      │
│  — 22 entries · 78 answers · 23 mornings · 36 self-care · sealed ├─  │
└──────────────────────────────────────────────────────────────────────┘
```

**Rules for writing the capsule (the prompt contract):**

1. **Second person, past tense, one paragraph.** 60–140 words. Length scales
   with `EvolutionScore`.
2. **At least three concrete references** drawn from that month's own logs:
   a recurring word, a time-of-day pattern, a weather correlation, a
   self-care streak. Generic sentences are forbidden, the same rule as Memory
   follow-up mode.
3. **One thread from the previous capsule** carried forward ("…the tea from
   September is still there…"). This is what makes the capsules read as one
   story.
4. **One affirmation sentence at the end.** It is drawn from the month's
   stage (§5) and personalized to the archetype once that is revealed (M3+).
5. **A stats footer** (entries · answers · mornings · self-care · grade glyph).
   The numbers make the paragraph feel earned.
6. **Trauma-informed register** when Source 8 is active: present-tense
   functioning only, no probing, and observational framing.
7. **Privacy:** capsules are private by default. The public profile shows only
   capsules the person marks `public` (§7).

**Payload (log metadata):**

```ts
{
  event: 'memory_capsule',
  metadata: {
    usershipMonth: 4,
    stage: 'foundation',
    grade: 'sealed' | 'unlocked' | 'quiet',
    window: { start: '2026-10-01', end: '2026-10-30' },
    text: '…one paragraph…',
    affirmation: 'You are building something.',
    threads: ['morning tea', 'rain', 'father'],          // carried into next capsule
    stats: { notes: 22, answers: 78, mornings: 23, selfCare: 36, activeDays: 26 },
    evolutionScore: 1.06,
    isPublic: false,
  }
}
```

### 4.3 Capsule register by EvolutionScore

| Score | Length | Register | Example closing |
|---|---|---|---|
| < 0.35 (quiet) | 40–60 words | Gentle, holding | *"A quieter month. The system kept the light on."* |
| 0.35–0.75 (unlocked) | 60–100 words | Observational | *"The pattern is forming. Keep going."* |
| 0.75–1.0 (sealed) | 100–140 words | Specific, warm | *"You are building something."* |
| > 1.0 (luminous) | 120–140 words, plus one **"insight line"** | Revelatory | *"Here is what the year already knows about you: …"* |

### 4.4 Chapter (quarterly)

On Months 3, 6, 9 and 12 the three capsules of the quarter are compressed
into **one Chapter paragraph** (80–120 words). It is titled, sealed with a
glyph (`◇ ◈ ◆ ⊙`), and adds a **"what changed"** line that compares the first
capsule of the quarter with the last.

```
CHAPTER II — STRUCTURE ◈
"In three months you moved from mornings that happened to you to mornings
you designed. …"
What changed: answers 24 words → 9 words · mornings 11 → 22 · self-care for others → for yourself
```

### 4.5 The Year (Month 12)

On the twelfth month the four Chapters compress into **one paragraph,
under 120 words**, plus the **12 one-liners** (one per month, written as each
capsule's thesis sentence). This is the final compression: *the year in one
breath*. It becomes the person's `memoryStory` on `/u/user`, at the same
density as Machiavelli's.

```
THE YEAR ⊙
"You began by writing down the weather. You end by knowing what the weather
does to you. …"

  ∘   I    First Light ....... You arrived and wrote it down.
  ∘∘  II   The Call .......... The questions started to know you.
  ∘∘∘ III  Threshold ......... You became The Seeker.
  ├─  IV   Foundation ........ You stopped asking whether the ritual mattered.
  …
  ◉   XII  The Elixir ........ The machine asks first now. You answer as yourself.
```

---

## 5. Month by month

Each month uses the same seven-part layout:

> **Stage** · **System state** (what the System tab looks like) · **Unlocks** ·
> **Usership Month widget** (the celebration) · **Memory deliverable** ·
> **Badge** · **Public profile layer** (what `/u/user` gains)

---

### CHAPTER I — FOUNDATION · *"Being known"*

#### MONTH 1 · FIRST LIGHT `∘` · *Ordinary World*

- **System state — barebone.** Time, Mood check-in, Self-care, Log, Memory
  (AI questions are active from Day 1 because the person is on Usership).
  Nothing else. `--evolution-base-opacity: 0.85`, no glow, wide letter-spacing.
- **Unlocks:** none. The point of this month is that the interface is quiet.
- **Month widget (Day 1):** `Month 1:` *"Day one. The system is beginning to
  know you."* → strip `▪○○○○○○○○○○○` · `Months unlocked: 0/12`.
  Click the label to cycle to `Next:` *"Write 6 entries, check in on 8 mornings
  — the first month opens."*
- **Mid-month micro-moments:** the 1st journal entry, 7th morning and 10th
  self-care each produce a single fade-in line. No badges yet.
- **Memory deliverable:** at Day 30, **the first Memory Capsule**. This is the
  first moment that shows the product works, so it must be the best
  paragraph the engine writes.
- **Badge:** `∘ First Light`.
- **Public profile layer:** name, city, date, `[Usership]` tag, `Month 1` line.

#### MONTH 2 · THE CALL `∘∘` · *Call to Adventure*

- **System state:** the Memory widget gains a `Capsule:` view (`Memory:` →
  `Capsule:`). Mood gains `History:`.
- **Unlocks:** **Memory Capsule view**, **morning streak line** under Mood
  ("Mornings this month: 11").
- **Month widget:** *"Two months in. The questions have started to know you."*
  It shows the first sentence of Capsule 1 as a quote.
- **Memory deliverable:** Capsule 2, which carries one thread from Capsule 1.
  This is the first time the person sees continuity.
- **Badge:** `∘∘ The Call`.
- **Public profile layer:** `memoryStory` paragraph (if marked public).

#### MONTH 3 · THRESHOLD `∘∘∘` → seal `◇` · *Crossing the Threshold*

- **System state:** assembly phase `forming`. First visible refinement:
  opacity 0.88, letter-spacing tightens.
- **Unlocks:** **Archetype reveal ceremony.** The Memory Engine has had 10+
  answers since Week 2, but the archetype is held back until now and revealed
  as an event: *"Ninety days of answers. The system sees The Seeker."*
  **Custom theme**. **Badge stream** on the System tab.
- **Month widget:** *"Three months. You have crossed the threshold."* The strip
  is now three glyphs, `∘ ∘∘ ∘∘∘`, not dots.
- **Memory deliverable:** Capsule 3 and **Chapter I** (the first compression,
  3 → 1).
- **Badge:** `∘∘∘ Threshold` + **seal `◇ Foundation`**.
- **Public profile layer:** **Archetype + description**, first badge row.

---

### CHAPTER II — STRUCTURE · *"Being built"*

#### MONTH 4 · FOUNDATION `├─` · *Tests, Allies, Enemies*

- **System state:** assembly `assembled` once the 14-day / 50-log gate is met.
  The Architecture theme starts to appear: grid opacity 0.2.
- **Unlocks:** **Planner** and **Intentions** (the person now has enough
  pattern for the system to plan with them). **Pattern Insights** widget.
- **Month widget:** *"Four months. You are no longer visiting. You are
  building."*
- **Memory deliverable:** Capsule 4. **New:** the "you said / you did"
  sentence, which compares a stated intention with logged behaviour.
- **Badge:** `├─ Foundation`.
- **Public profile layer:** **Core values** (5 words).

#### MONTH 5 · APPROACH `╞═╡` · *Approach to the Inmost Cave*

- **System state:** self-care gains `Why This:` with personal reasons drawn
  from the Memory Story ("because rain makes your mornings heavy").
- **Unlocks:** **Correlated Indexes** (Self-awareness · User · Person ·
  Longevity · Composite), shown for the first time as a 5-month timeline.
- **Month widget:** *"Five months. Consistency is its own reward."* It adds
  one index delta: *"Self-awareness +14 since Month 1."*
- **Memory deliverable:** Capsule 5. **New:** one *weather × mood* or
  *time × energy* correlation sentence.
- **Badge:** `╞═╡ Approach`.
- **Public profile layer:** **Emotional patterns** + **Self-awareness** index.

#### MONTH 6 · HALF-DECLARED `◐` → seal `◈` · *The Ordeal*

- **System state:** the midpoint. The **QOS Kernel** panel becomes visible in
  System Progress, and `recovery` mode is surfaced honestly when it applies.
  The design treats the Ordeal as a mirror, not a test the person can fail.
- **Unlocks:** **QOS Kernel**, **Widget Arrange** (the person now shapes their
  own OS).
- **Month widget:** a special half-year form:
  *"Six months. Half the journey, declared."* The strip shows six filled
  glyphs and six hollow ones, the `◐` exactly in the middle.
- **Memory deliverable:** Capsule 6 + **Chapter II** + **"Letter from Month 1"**:
  the first capsule shown side-by-side with the sixth, unedited.
- **Badge:** `◐ Half-Declared` + **seal `◈ Structure`**.
- **Public profile layer:** **Pattern strength** list (top 3 traits with
  counts).

---

### CHAPTER III — DEPTH · *"Being seen"*

#### MONTH 7 · REWARD `≈` · *Seizing the Sword*

- **System state:** assembly `integrated` (30 active days / 150 logs / 8
  event types, long passed). The Water theme appears: softer radius, slower
  transitions.
- **Unlocks:** **Narrative widget** and **Goal Journey** (beginning → struggle
  → breakthrough → integration → mastery), which shows where the person is
  on their primary goal.
- **Month widget:** *"Seven months. The system has been listening — here is
  what it heard."* It is followed by a single **insight line** from the
  capsule.
- **Memory deliverable:** Capsule 7, the first one allowed to write an
  **insight** (a sentence about the person that they did not write
  themselves).
- **Badge:** `≈ Reward`.
- **Public profile layer:** **Behavioral traits**.

#### MONTH 8 · RARE AIR `≋` · *Allies*

- **System state:** **Cohort Connect / Sync**. The person learns they belong
  to a behavioural cohort (*"Renaissance Polymaths"* in Machiavelli's case).
- **Unlocks:** **Cohort Connect**, **Chat Catalyst** prompts.
- **Month widget:** *"Eight months. Rare air — and you are not alone in it."*
- **Memory deliverable:** Capsule 8, plus a **community line**: anonymised
  cohort pulse as context, never private data.
- **Badge:** `≋ Rare Air`.
- **Public profile layer:** **Behavioral cohort**.

#### MONTH 9 · HABIT BECOMES SELF `║·║` → seal `◆` · *Atonement*

- **System state:** `--evolution-glow-intensity` starts (0.1). Typography
  reaches its refined line-height. Self-care now arrives before the person
  asks for it, because the ritual has become predictable.
- **Unlocks:** **Proactive self-care** (the system schedules the next routine
  from the person's own rhythm). **Export data** (the story belongs to the
  person).
- **Month widget:** *"Nine months. The practice is a habit now. The habit is
  you."*
- **Memory deliverable:** Capsule 9 + **Chapter III**.
- **Badge:** `║·║ Habit Becomes Self` + **seal `◆ Depth`**.
- **Public profile layer:** **Correlated Indexes** card with trend arrow.

---

### CHAPTER IV — INTEGRATION · *"Becoming"*

#### MONTH 10 · THE ROAD BACK `◎` · *The Road Back*

- **System state:** **Usership Board profile** activates (member number,
  citizen since, tenure, activity totals, memory engine, clearance).
- **Unlocks:** **Board profile**, **Story API export** (`/api/story/*` toward
  Dashboard / Robot / Vehicle targets as they ship).
- **Month widget:** *"Ten months. The road back runs through everything you
  wrote."* It shows the totals: *"312 entries · 941 answers · 214 mornings."*
- **Memory deliverable:** Capsule 10, which begins to **anticipate** ("by the
  time winter comes, you will want …").
- **Badge:** `◎ The Road Back`.
- **Public profile layer:** **Board profile block**.

#### MONTH 11 · RESURRECTION `◉·` · *Resurrection*

- **System state:** **Before / After mode.** Clicking the Month widget label
  cycles `Month 11:` → `Then:` (Capsule 1) → `Now:` (Capsule 11). The person
  can see how far they have come.
- **Unlocks:** **Before/After**, **Self-assembly map** fully lit.
- **Month widget:** *"Eleven months. One more. Look how far."*
- **Memory deliverable:** Capsule 11 + a **pre-Year draft** of the 12
  one-liners, shown with the twelfth line blank (`XII ...........`) until next
  month.
- **Badge:** `◉· Resurrection`.
- **Public profile layer:** **Month strip** `∘ ∘∘ ∘∘∘ ├─ ╞═╡ ◐ ≈ ≋ ║·║ ◎ ◉· ○`.

#### MONTH 12 · THE ELIXIR `◉` → seal `⊙` · *Return with the Elixir* → **LOT® AI**

- **System state: LOT® AI.** Every part of the OS is present. The machine
  **asks first**: a question, a self-care routine and a capsule line appear in
  the right order for the moment, with no navigation needed. Full
  `--evolution-*` values: opacity 1.0, glow 0.3.
- **Unlocks:** **LOT® AI ambient mode**, **The Year**, and the **Legacy preview**
  (Weather Station and Wallet, as on `/u/machiavelli`) with an invitation to
  the Legacy tier.
- **Month widget — anniversary form:**
  ```
  Month 12:
  One year with LOT. The portrait is complete — and still evolving.
  ∘ ∘∘ ∘∘∘ ├─ ╞═╡ ◐ ≈ ≋ ║·║ ◎ ◉· ◉
  Months unlocked: 12/12 · Chapters sealed: ◇ ◈ ◆ ⊙
  [ Read the Year ]
  ```
- **Memory deliverable:** Capsule 12 + Chapter IV + **The Year** (§4.5). The
  Year replaces `memoryStory` on the public profile, if the person chooses.
- **Badge:** `◉ The Elixir` + **seal `⊙ The Compressed Year`**.
- **Public profile layer:** **Parity with `/u/machiavelli`**: archetype, values,
  patterns, cohort, traits, pattern strength, indexes, board profile, the
  Year as Memory Story, the month strip, and Legacy shown as a preview.

---

## 6. The Usership widgets

All three widgets follow the LOT style guide: Arial, opacity hierarchy, label
cycling, the 1400 ms fade, no emoji, and "periods over symbols".

### 6.1 `Month:` — Usership Month widget (evolves `MonthlyPulseWidget`)

Label cycle: `Month n:` → `Unlocked:` → `Next:` → `Month n:`

```
Month 4:                                   Unlocked:                              Next:
Four months. You are no longer             ∘ ∘∘ ∘∘∘ ├─ ▪ ○ ○ ○ ○ ○ ○ ○            Entries   14 / 8   ·
visiting. You are building.                Months unlocked: 4/12                  Answers   31 / 25  ·
                                           Chapters sealed: ◇                     Mornings   7 / 10
4 / 12 months                                                                     Self-care 12 / 12  ·
                                                                                  3 of 4. The month is open.
```

- **When it shows:** Day 1 of each Usership month, until dismissed (dismissal
  is stored in logs so it works across devices, per the style guide). It also
  shows on any day a gate is crossed ("The month is unlocked.").
- **`Next:`** is the only place targets appear, and the wording is
  encouraging, never a quota warning.

### 6.2 `Capsule:` — Memory widget extension

Memory widget label cycle: `Memory:` → `Capsule:` → `Story:`

- `Capsule:` shows the latest Memory Capsule paragraph and stats footer.
- `Story:` lists the capsules so far as one-liners with glyphs. Clicking a
  line expands its paragraph. On Months 3/6/9/12 a Chapter row appears.

### 6.3 `Months unlocked:` — context widget

A one-line ambient widget that appears when context makes it meaningful:
morning after a journal entry, the evening of a self-care streak, or the day
before a month closes.

```
Months unlocked: 3/12                    (morning, gate already met)
Two mornings left to open Month 5.       (two days before window closes, 3 of 4 met)
```

---

## 7. Public profile `/u/user`: how the mirror evolves

One layer is added per month, so by Month 12 the profile has the same
sections as Machiavelli's. Privacy defaults never change: journal text is
never public, and capsules are public only by explicit opt-in.

| Month | Layer added | Field in `PublicProfile` |
|---|---|---|
| 1 | Name · city · `[Usership]` · Month line | existing |
| 2 | Memory Story (latest public capsule) | `memoryStory` |
| 3 | Archetype + description · first badges | `psychologicalProfile.archetype*` |
| 4 | Core values | `psychologicalProfile.coreValues` |
| 5 | Emotional patterns · self-awareness | `emotionalPatterns`, `selfAwarenessLevel` |
| 6 | Pattern strength | `patternStrength` |
| 7 | Behavioral traits | `behavioralTraits` |
| 8 | Behavioral cohort | `behavioralCohort` |
| 9 | Correlated indexes | `correlatedIndexes` |
| 10 | Board profile | `boardProfile` |
| 11 | Month strip | **new** `usershipJourney.strip` |
| 12 | The Year as Memory Story · Legacy preview | `memoryStory`, **new** `usershipJourney.year` |

Proposed type addition:

```ts
usershipJourney?: {
  currentMonth: number            // 1–12 (13+ = post-year, Legacy horizon)
  monthsUnlocked: number          // 0–12
  grades: Array<'open' | 'unlocked' | 'sealed' | 'quiet'>
  strip: string                   // e.g. "∘ ∘∘ ∘∘∘ ├─ ▪ ○ ○ ○ ○ ○ ○ ○"
  chaptersSealed: Array<'◇' | '◈' | '◆' | '⊙'>
  year?: { paragraph: string; oneLiners: string[] }
}
```

---

## 8. The emotional curve

```
Felt
evolution
   ▲                                                              ◉ LOT® AI
   │                                                    ◉·   ╱
   │                                          ◎      ╱  Before/After
   │                                 ║·║ ◆  ╱  Board
   │                        ≋     ╱  proactive self-care
   │                 ≈    ╱ Cohort
   │          ◐ ◈ ╱ QOS · Letter from Month 1
   │   ╞═╡  ╱ Indexes
   │ ├─  ╱ Planner
   │∘∘∘◇ Archetype reveal
   │∘∘ Capsule view
   │∘ First Capsule
   └──────────────────────────────────────────────────────────────────────▶ months
     1   2   3   4   5   6   7   8   9   10  11  12
```

**Design laws for the curve**

1. **Every month has exactly one "headline" moment** (the first capsule, the
   archetype, the Letter from Month 1, the cohort, Before/After, the Year).
   There is never more than one.
2. **Chapter months (3, 6, 9, 12) are twice as large.** These are the
   compression events.
3. **Nothing unlocks unless the person's own evidence earns it.** Time alone
   never opens a month.
4. **The interface matures quietly** (opacity, spacing, glow) so the person
   *feels* the change before they *notice* it.
5. **Text gets shorter as it moves up the ladder.** Memory questions get
   shorter (Compression Mode 5), and the capsule → chapter → year paragraphs
   get shorter too. The person can see the compression happening.

---

## 9. Implementation roadmap

| Phase | Scope | Files |
|---|---|---|
| **P0 (this session)** | Canonical 12-month config (stages, glyphs, affirmations, gates, `evaluateUsershipMonth`, `buildMonthStrip`). `MonthlyPulseWidget` reads it and shows the stage name, glyph strip and `Months unlocked: n/12`. | `src/shared/constants/usership-journey.ts`, `MonthlyPulseWidget.tsx` |
| **P1** | Server endpoint `GET /api/usership/journey`: counts S1–S4 per 30-day window from `Logs`, returns grades and strip. The widget switches from calendar months to evidence-gated months. Dismissal moves from localStorage to a log. | `src/server/routes/api.ts`, `queries.ts` |
| **P2** | Memory Capsule job: scheduled daily, it writes a capsule for any user whose Usership month closed. Prompt contract §4.2. `memory_capsule` log. Capsule/Story views in `MemoryWidget`. | `scheduled-jobs.ts`, `utils/memory/*`, `MemoryWidget.tsx` |
| **P3** | Chapters + The Year (compression of capsules). Before/After view. | same |
| **P4** | 12 month badges + 4 seals in `badges.ts` (Codex v33 — *The Usership Year*). Public profile `usershipJourney` block and per-month layer gating. | `src/client/utils/badges.ts`, `PublicProfile.tsx`, `public-api.ts` |
| **P5** | Month-based feature gating that ties §5 unlocks to `$featureUnlocks`, and Machiavelli payload extended with `usershipJourney` (12/12, all seals) as the live reference. | `stores/evolution.ts`, `public-api.ts` |

---

## 10. Open questions for S-2

1. **Gate strictness:** is 3-of-4 the right bar for `unlocked`, or should
   journal entries (S1) be mandatory every month, since they matter most?
2. **Month length:** 30-day windows from `joinedAt` (consistent and fair), or
   calendar months (shared moments, e.g. "the November capsule")? This spec
   assumes the anniversary model.
3. **Capsule visibility:** opt-in per capsule (assumed), or one global
   "public story" toggle?
4. **Post-Year:** does Month 13 start Year II with a new 12-stage arc, or move
   to Legacy with Weather Station and Wallet as the next layer?
5. **Machiavelli:** should the demo payload show the `usershipJourney` block at
   12/12 so prospects can see the end state?

---

*This is {Name}'s System powered by LOT.*
