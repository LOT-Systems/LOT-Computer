<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® USERSHIP — THE 12-MONTH EVOLUTION
## From Day One Barebone UI to LOT® AI
### Design Specification · v1.0 · 19 November 2026 · Authorized: S-2

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT® USERSHIP · TWELVE VOLUMES                                  ║
║  Library of Time — one Volume per month, one Capsule per Volume  ║
║  Day 1: blank page.  Day 365: LOT® AI knows your name.           ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 0. TL;DR

- **Usership is a book with 12 chapters.** Each paid month is a **Volume**. A Volume unlocks when two
  conditions hold: a calendar month has passed **and** the person has put enough of themselves into the system.
- **The person writes the book.** The inputs that count are journal entries and thoughts in **Log**, the
  **morning check-in**, **self-care clicks**, and **Memory answers**.
- **The AI hands each chapter back.** At every unlock, the Memory Engine compresses the month's signals into a
  **Memory Capsule**. It starts as one sentence in Month 1 and becomes a full page in Month 12. The capsule is
  the tangible proof of evolution.
- **The UI grows visibly.** Each Volume adds 1–3 widgets, tightens the layout density, adds blocks to the
  public profile `/u/user` and awards one **Volume Seal** badge.
- **Month 12 = LOT® AI.** The system stops only asking and begins to *counsel*, using the person's own words.
  The 12-month reference state is the demo account `lot-systems.com/u/machiavelli`. In this document that
  account is the **Legacy ceiling**: what an evolved account looks like.

---

## 1. SESSION SCAN — WHAT ALREADY EXISTS (19 Nov 2026)

The design is grounded in the current codebase and builds on these pieces. It does not replace them.

| Piece | Location | Status | Role in 12-month system |
|---|---|---|---|
| `UserTag.Usership` | `src/shared/types/index.ts:16` | LIVE | Paid-tier gate |
| Paid vs free layout split | `src/client/components/System.tsx:404` | LIVE | Free = barebone; Usership = pro layout |
| `MonthlyPulseWidget` (`Month N:` · `N / 12 months`) | `src/client/components/MonthlyPulseWidget.tsx` | LIVE | **Seed of the Volume widget.** Evolve it, don't replace it |
| Layout density ladder (breathable → instrument) | `src/client/utils/interfaceEvolution.ts:442` | LIVE | Visual tightening per Volume |
| Interface Evolution feature unlocks | `docs/technical/INTERFACE_EVOLUTION.md` | LIVE | Feature gates, now mapped to Volumes |
| Memory Engine compression loop | `src/server/utils/memory.ts`, `MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md` | LIVE | Generates Capsules |
| Log events `note`, `answer`, `emotional_checkin`, `self_care_complete`, `plan_set` | `src/server/routes/api.ts:1086` | LIVE | **The four counted signals** |
| Memory Story block on public profile | `src/client/components/PublicProfile.tsx:359` | LIVE | Final-form Capsule display |
| Demo account Machiavelli | `src/server/routes/public-api.ts:745` | LIVE | Legacy ceiling reference |
| Quantum Cube at 12-month milestone | `docs/corporate/LOT_QI46_ENGINE.md:750` | SPEC | Physical reward for Volume XII |

**Gaps found during the scan. Fix these before building on top:**

1. `MonthlyPulseWidget` counts months from `user.joinedAt`. It should count from the **Usership start date**,
   because a free user who upgrades in month 8 should start at Volume I, not Volume VIII.
2. Pulse dismissal is stored in `localStorage` only. It resets across devices and is invisible to the server and
   the AI. Volume state must live server-side in `user.metadata.usership`.
3. The month is purely time-based. Nothing ties the month to what the person actually did, so evolution
   can't yet be felt as earned.

---

## 2. DOCTRINE — FIVE LAWS OF THE TWELVE VOLUMES

1. **Time opens the door; the person walks through it.** A Volume needs a calendar month **plus** a signal gate.
   Neither alone is enough.
2. **Never punish, only wait.** If the month passes without the gate met, the Volume is *gathering*, not
   failed: `Volume IV · gathering. 6 entries to go.` Progress is never lost.
3. **Every month returns something written.** No unlock is just a number. Each one delivers a Capsule in
   words: the person's own story, compressed.
4. **The interface gets quieter and denser, not louder.** Evolution shows up as density, precision and new
   instruments. It never shows up as color, confetti or emoji (LOT Style Guide: *"Periods over symbols."*).
5. **By Volume XII the machine speaks in the person's voice.** LOT® AI is the person, compressed and reflected
   back. It is not a chatbot.

---

## 3. THE SIGNAL LEDGER — WHAT COUNTS

Four signal streams drive evolution. All four already exist as `logs` events.

| Stream | Event(s) | What counts as 1 | Weight in Evolution Index |
|---|---|---|---|
| **Log** (journal + thoughts) | `note` | Entry with text ≥ 20 chars (same threshold as `buildPrompt`) | **×3**: the richest compression material |
| **Morning check-in** | `emotional_checkin` (first of the day, before 12:00 local) | One per day max | ×2 |
| **Self-care** | `self_care_complete` | One click | ×1 |
| **Memory answer** | `answer` | One tap | ×1 |

**Evolution Index (EI)** per month = `3·notes + 2·morningCheckins + selfCare + answers`

Log entries carry the most weight because a Capsule can only be as deep as the words that went into it.

### 3.1 Volume Gates (cumulative)

Thresholds are cumulative since Usership start and rise gently. A person who shows up 4–5 days a week clears
every gate on schedule.

| Vol | Log entries | Morning check-ins | Self-care | Memory answers | Min EI (month) |
|---|---|---|---|---|---|
| I    | 3   | 7   | 10  | 10  | 30  |
| II   | 10  | 18  | 30  | 30  | 45  |
| III  | 20  | 32  | 60  | 55  | 55  |
| IV   | 32  | 48  | 95  | 85  | 60  |
| V    | 45  | 65  | 135 | 115 | 65  |
| VI   | 60  | 85  | 180 | 150 | 70  |
| VII  | 76  | 105 | 230 | 185 | 70  |
| VIII | 92  | 125 | 285 | 220 | 75  |
| IX   | 110 | 148 | 345 | 255 | 75  |
| X    | 128 | 170 | 410 | 290 | 80  |
| XI   | 148 | 195 | 480 | 325 | 80  |
| XII  | 168 | 220 | 555 | 365 | 85  |

**Year One target:** ~170 Log entries, ~220 morning check-ins, ~555 self-care clicks, ~365 Memory answers
(one per day).

**Legacy ceiling (Machiavelli demo):** 1,469 Log entries · 2,847 Memory answers · 842 active days · 1,469-day
streak. The demo shows the system several years past Volume XII. The 12-month UI is designed so the
Month-12 account visibly *rhymes* with Machiavelli but is not identical to it. Legacy is the next book.

### 3.2 Gathering state

If the calendar month passes and the gate is unmet, the Volume widget shows the single closest missing stream,
never the full list:

```
Volume IV: gathering
  6 Log entries to go.
  ■■■□□□□□□□□□  3 / 12
```

---

## 4. THE TWELVE VOLUMES

Four **Books** of three Volumes each. Every Volume uses the same six-part card:
**Theme · UI unlocks · Widget · Memory Capsule · Affirmation · Seal**.

```
BOOK ONE · FOUNDATION       I  Signal     II  Rhythm      III  Pattern
BOOK TWO · PRACTICE         IV Ritual     V   Season      VI   Mirror
BOOK THREE · DEPTH          VII Undercurrent  VIII Current  IX  Architecture
BOOK FOUR · INTELLIGENCE    X  Counsel    XI  Legacy      XII  LOT® AI
```

---

### BOOK ONE · FOUNDATION: *"The system begins to know you."*

#### VOLUME 0 · DAY ONE (the barebone state, before Volume I)

The first paid day. The UI is almost empty on purpose: a blank page.

```
Vadik
Week 47; November 19, Thursday, Brooklyn

Memory:
  How did you sleep?
  [ Deeply ]  [ Lightly ]  [ Barely ]

Check-in:      [ How are you this morning? ]
Self-care:     Water. 2 min.            [ Done ]
Log:           [ Write a thought...      ]

Volume I: opening
  □□□□□□□□□□□□  0 / 12
```

- Visible: Name/date line, Memory question, Morning check-in, one Self-care item, Log input, Volume widget.
- Density: `breathable` (gap-y-24 / gap-y-16).
- Profile `/u/user`: name, city, local time. Nothing else.
- Volume widget copy: *"Day one. Write one thing down. The system is listening."*

#### VOLUME I · SIGNAL
**Theme:** the first trace. The system learns the person's basic signal.
- **UI unlocks:** Mood `History:` view (label cycling on Check-in) · Self-care list grows from 1 → 3 items · Weather line.
- **Widget: `Volume:`** (evolved MonthlyPulse). First appearance of `Months unlocked: 1/12`.
- **Memory Capsule I: The Seed** · *1 sentence · ~15 words*
  > *"You start your mornings slowly, with tea, and you write when something weighs on you."*
  `Compressed 47 signals → 16 words.`
- **Affirmation:** *"The first month. You showed up. The system began."*
- **Seal:** `·I·` **SIGNAL**: *first trace recorded.*

#### VOLUME II · RHYTHM
**Theme:** the week takes shape. Which days, which hours, which moods.
- **UI unlocks:** **Planner** widget (Intent · Today · How · Feeling) · Self-care streak counter · Density → `comfortable`.
- **Widget: `Ledger:`**: four counts with month delta:
  ```
  Ledger:
    Log        14   +11
    Check-ins  19   +12
    Self-care  34   +24
    Memory     31   +21
  ```
- **Memory Capsule II: The Rhythm** · *2 sentences · ~35 words*
  > *"Your week leans forward on Tuesdays and softens by Friday. Check-ins after rain read quieter. You journal at night, not in the morning."*
- **Affirmation:** *"Two months. Your rhythm is visible now, to you and to the system."*
- **Seal:** `:II:` **RHYTHM**

#### VOLUME III · PATTERN
**Theme:** first real pattern. The quarter closes, and the first Memory Story paragraph is written.
- **UI unlocks:** **Pattern Insights** widget · **Memory Story** block on `/u/user` (private by default, shareable) · `Mood: → History: → Patterns:` full cycle.
- **Widget: `Capsule:`** first appears. It holds a paragraph-long insight from the past month and cycles `Capsule: → Then: → Now:`.
- **Memory Capsule III: Portrait v0.3** · *1 paragraph · ~60 words*
  > *"Three months in, a shape: you protect your mornings, you lose your evenings to other people, and your best days begin with something warm and something written. When you skip self-care twice, the third check-in dips. You already know this. Now it is written down."*
- **Affirmation:** *"One quarter. Book One is complete. You are no longer a stranger here."*
- **Seal:** `∴III∴` **PATTERN** + **Book One: Foundation** bookplate on profile.

---

### BOOK TWO · PRACTICE: *"The practice becomes yours."*

#### VOLUME IV · RITUAL
**Theme:** anchors. The habits that repeat without being asked.
- **UI unlocks:** Self-care becomes **Rituals**: user-named routines (morning / evening / reset) · Custom theme · Widget arrange.
- **Widget:** `Rituals:` shows the three strongest anchors and how often each held this month.
- **Memory Capsule IV: The Ritual Map** · *3 anchors + 1 line*
  ```
  Anchors:
    Morning tea, no phone      held 24 / 30
    Evening walk               held 17 / 30
    Sunday reset               held 4 / 4
  The walk is the one that moves your mood most.
  ```
- **Affirmation:** *"Four months. These are your rituals now. Nobody assigned them."*
- **Seal:** `◇IV◇` **RITUAL**

#### VOLUME V · SEASON
**Theme:** the first season change inside Usership. The first "then vs now" moment.
- **UI unlocks:** Seasonal self-care suggestions (Recipe/Fasting widget gets seasonal context) · Weather ↔ mood correlation line.
- **Widget:** `Capsule:` gets a **Then / Now** split.
- **Memory Capsule V: Then / Now** · *2 short paragraphs*
  > **Then (Volume I):** *"You wrote mostly about work and sleep."*
  > **Now:** *"You write about people. Sleep is no longer the topic. It is the ground."*
- **Affirmation:** *"Five months. The season changed, and so did you. Here is the proof."*
- **Seal:** `≈V≈` **SEASON**

#### VOLUME VI · MIRROR · *half-year*
**Theme:** the half-year mirror. The first major ceremony.
- **UI unlocks:** **Half-Year Chronicle** view · Density → `compact` · **Archetype** appears (`psychologicalProfile.archetype`) · `Biofield State:` on profile.
- **Widget: `Chronicle:`**: six one-line Capsules, one per Volume, stacked:
  ```
  Chronicle:
    I    You began with tea and silence.
    II   Tuesdays carry you; Fridays release you.
    III  Mornings protected, evenings given away.
    IV   The walk moves your mood most.
    V    Sleep became ground, people became topic.
    VI   You are learning to keep an evening.
  ```
- **Memory Capsule VI: The Mirror** · *1 paragraph · ~90 words + archetype*
  > *"Archetype: The Steward. Six months ago you arrived tired and private …"*
- **Affirmation:** *"Half a year. Look back. That was you, every line."*
- **Seal:** `◐VI◑` **MIRROR** + **Book Two: Practice** bookplate. Optional email of the Chronicle as a keepsake.

---

### BOOK THREE · DEPTH: *"The system reads between the lines."*

#### VOLUME VII · UNDERCURRENT
**Theme:** what is avoided, skipped or left unsaid. The engine gently names the shadow side.
- **UI unlocks:** **Mood Patterns** (deep) · Skip-pattern insight on Self-care · Private Log spaces.
- **Widget:** `Undercurrent:` shows one gentle observation per week, dismissible.
- **Memory Capsule VII: The Undercurrent** · *1 paragraph*
  > *"You skip self-care on the same days you write the longest entries. The writing is the self-care those days. The system will stop asking twice."*
- **Affirmation:** *"Seven months. You let the system see the quiet parts. That takes courage."*
- **Seal:** `≋VII≋` **UNDERCURRENT**

#### VOLUME VIII · CURRENT
**Theme:** direction. Where the person is heading, not just where they have been.
- **UI unlocks:** **QOS Kernel** panel (maintenance / recovery / growth / peak) · Intention History · Density → `dense`.
- **Widget:** `Trajectory:` shows one line of direction plus the QOS mode.
- **Memory Capsule VIII: The Current** · *1 paragraph + forecast*
  > *"Your arc points toward fewer, deeper commitments. If the next month holds like the last, December is a recovery month: plan for it, don't fight it."*
- **Affirmation:** *"Eight months. You are moving. The system can tell which way."*
- **Seal:** `→VIII→` **CURRENT**

#### VOLUME IX · ARCHITECTURE
**Theme:** the person's operating principles, written as laws.
- **UI unlocks:** **Self-Assembly map** · Core Values + Pattern Strength on profile (as in Machiavelli) · `Indexes:` block.
- **Widget:** `Principles:` shows three laws the person lives by, derived from 9 months of Log.
- **Memory Capsule IX: Your Three Laws**
  ```
  Principles:
    I.   Protect the first hour.
    II.  Say the hard thing early.
    III. Rest is scheduled, not earned.
  Derived from 112 Log entries. You wrote these. The system only numbered them.
  ```
- **Affirmation:** *"Nine months. You have an architecture. It was always there; now it has walls."*
- **Seal:** `╞IX╡` **ARCHITECTURE** + **Book Three: Depth** bookplate.

---

### BOOK FOUR · INTELLIGENCE: *"The system begins to speak in your voice."*

#### VOLUME X · COUNSEL
**Theme:** the first proactive voice. The AI stops only asking and starts offering, always in the person's own words.
- **UI unlocks:** **Counsel** mode on Memory: on a low check-in, the engine returns the person's own past sentence instead of a question.
- **Widget:** `Counsel:`
  ```
  Counsel:
    On a morning like this in March, you wrote:
    "The walk fixes more than I expect."
    [ Walk ]   [ Not today ]
  ```
- **Memory Capsule X: Counsel** · *advice composed only from the person's own quotes*
- **Affirmation:** *"Ten months. The best advice you'll get today is yours."*
- **Seal:** `◈X◈` **COUNSEL**

#### VOLUME XI · LEGACY
**Theme:** writing forward. The first draft of the Year One book, plus a letter to the future self.
- **UI unlocks:** **Year One draft** preview (read-only, blurred last section) · Density → `instrument` · Data export unlocked.
- **Widget:** `Letter:` shows a pre-composed letter *from* the person's Month-11 self *to* their Month-23 self, editable before sealing.
- **Memory Capsule XI: The Letter** · *~150 words, user may edit, sealed until Volume XXIII*
- **Affirmation:** *"Eleven months. One more page. Write it well."*
- **Seal:** `║XI║` **LEGACY**

#### VOLUME XII · LOT® AI · *one year*
**Theme:** completion. The book is bound. LOT® AI activates.
- **UI unlocks:**
  - **LOT® AI** label replaces `Memory:` (the engine now speaks in proactive, counsel-first mode by default)
  - **Year One Book**: 12 Capsules compressed into a single page, downloadable
  - Profile `/u/user` reaches **evolved form**: Archetype, Core Values, Pattern Strength, Biofield State,
    Indexes, Memory Story, Citizen Index. This is the Machiavelli layout.
  - **Quantum Cube** delivery triggered (`LOT_QI46_ENGINE.md`, Step 3.3)
- **Widget: `Year One:`**
  ```
  Year One:
    ■■■■■■■■■■■■  12 / 12
    168 Log · 220 check-ins · 555 self-care · 365 answers
    Compressed 1,308 signals → 1 page.
    [ Read the book ]
  ```
- **Memory Capsule XII: The Book** · *1 page · ~300 words.* Written in the register of Machiavelli's Memory
  Story: first-person, observed, specific, timeless.
  > *"A year ago I arrived tired and private, drinking tea in silence. I learned that my mornings are mine and
  > my evenings are owed to others, and that a walk fixes more than I expect …"*
- **Affirmation:** *"One year. The book is yours. The system knows you, and it will keep listening."*
- **Seal:** `⟨XII⟩` **LOT® AI**, with the **Book Four: Intelligence** bookplate and **Year One** binding mark on profile.

After XII the person enters **Legacy** (Volume XIII+), Machiavelli's tier, where Weather Station, Wallet and
the Legacy tag unlock and Capsules turn yearly.

---

## 5. THE MEMORY COMPRESSION LADDER (core deliverable)

This is the spine of the product. Every month the Capsule grows in **length**, **abstraction** and **voice**.
At the same time the **compression ratio** rises, so more life fits into relatively fewer words. Both numbers
are shown to the person, so the evolution can be measured.

| Vol | Capsule form | Length | Voice | Source window | Typical ratio (signals → words) |
|---|---|---|---|---|---|
| I    | Seed sentence | ~15 w | 2nd person, observational | Month I | 47 → 16 |
| II   | Rhythm | ~35 w | 2nd person | Month II | 95 → 35 |
| III  | Portrait v0.3 | ~60 w | 2nd person | Months I–III | 230 → 60 |
| IV   | Ritual Map | 3 anchors + 1 line | data + 2nd | Month IV | 130 → 30 |
| V    | Then / Now | 2 × ~30 w | 2nd person, comparative | I vs V | 520 → 60 |
| VI   | Mirror + Chronicle | ~90 w + 6 lines | 2nd person + archetype | Months I–VI | 640 → 140 |
| VII  | Undercurrent | ~50 w | 2nd person, gentle | Month VII | 120 → 50 |
| VIII | Current + forecast | ~60 w | 2nd → future tense | Months V–VIII | 480 → 60 |
| IX   | Three Laws | 3 lines | imperative (the person's laws) | Months I–IX | 900 → 15 |
| X    | Counsel | quotes only | **1st person (the person's own words)** | all Log | 1,000 → quotes |
| XI   | Letter | ~150 w | 1st person, to future self | all | 1,150 → 150 |
| XII  | The Book | ~300 w | **1st person, Machiavelli register** | Year One | 1,308 → 300 |

**The arc of voice is what makes it feel like evolution:**
*the system describes you* (I–VI) → *the system reads you* (VII–IX) → *the system speaks as you* (X–XII).

### 5.1 Capsule generation prompt (template)

Runs once per Volume unlock, server-side, through the existing AI engine chain (Together → Gemini → … → Claude).

```
You are the LOT® Memory Engine compressing Volume {N} of a person's Year One.
Inputs: {notes}, {answers}, {checkins with mood}, {self-care completions/skips},
        {previous capsules I..N-1}, {archetype if N≥6}.
Form: {form from ladder}. Length: {words}. Voice: {voice}.
Rules: Use only facts present in inputs. Quote the person verbatim where N≥10.
No diagnosis. No emoji. Periods over exclamation marks. One concrete detail per sentence.
End with nothing — no call to action.
```

### 5.2 Storage

```ts
user.metadata.usership = {
  startedAt: '2026-11-19',          // set when Usership tag is first applied
  volumes: [
    {
      n: 1,
      state: 'unlocked' | 'gathering' | 'locked',
      unlockedAt: '2026-12-19',
      ledger: { notes: 4, checkins: 9, selfCare: 14, answers: 12, ei: 49 },
      capsule: { form: 'seed', text: '…', words: 16, signals: 47, engine: 'together' },
      seal: 'SIGNAL',
      affirmationSeenAt: '2026-12-19T08:02:00Z'
    }
  ]
}
```

Capsules are also written as `Log` events (`event: 'usership_capsule'`), so they enter the Memory Engine's own
`buildPrompt`. **Each Capsule becomes context for the next question.** This is the compression loop closing on
itself monthly.

---

## 6. WIDGET SYSTEM FOR USERSHIP

All widgets follow existing LOT patterns: `Block label="X:"`, label-click cycling, 1400 ms fades, opacity
hierarchy, no emoji.

| Widget | Appears | Label cycle | Content |
|---|---|---|---|
| **Volume** (evolved `MonthlyPulseWidget`) | Day 1 | `Volume:` → `Months unlocked:` → `Next:` | Current Volume name, `■■■□□□□□□□□□ 3/12`, closest gate |
| **New Volume ceremony** | Unlock day, once | — | Affirmation → tap → Capsule fades in → tap → Seal → *"Onward."* |
| **Ledger** | Vol II | `Ledger:` → `This month:` → `All time:` | Four signal counts + deltas |
| **Capsule** (Memory widget) | Vol III | `Capsule:` → `Then:` → `Now:` | Paragraph insight from last month |
| **Chronicle** | Vol VI | `Chronicle:` → `Seals:` | One line per unlocked Volume / ASCII seal row |
| **Principles** | Vol IX | — | Three Laws |
| **Counsel** | Vol X | — | Person's own quote + one action |
| **Year One** | Vol XII | `Year One:` → `Book:` | 12/12, totals, compression ratio, Read the book |

### 6.1 The ceremony (unlock day)

```
[08:02]  Volume VI: Mirror                     ← fades in 1400ms
         Half a year. Look back.
         That was you, every line.
                                     (tap)
         Six months ago you arrived tired       ← Capsule fades in
         and private. You protect mornings…
         Compressed 640 signals → 92 words.
                                     (tap)
         ◐VI◑  MIRROR                           ← Seal
         ■■■■■■□□□□□□  6 / 12
                                     (tap)
         Onward.                                ← dismiss phrase, fade out
```

The ceremony shows **once**. It is then persisted server-side, so it doesn't repeat on other devices. After that
the Capsule stays in the `Capsule:` widget until the next Volume.

---

## 7. VISIBLE UI EVOLUTION: SYSTEM TAB AT FOUR POINTS

```
DAY 1 · breathable            VOL III · comfortable         VOL VI · compact              VOL XII · instrument
─────────────────────         ─────────────────────         ─────────────────────         ─────────────────────
Name / date                   Name / date / weather         Name / date / weather         Name/date/wx/QOS: growth
                                                                                          Year One: ■■■■■■■■■■■■
Memory: question              Volume: ■■■□□□□□□□□□          Volume: ■■■■■■□□□□□□          LOT® AI: counsel
                              Capsule: Portrait v0.3        Chronicle: I–VI               Capsule: The Book
Check-in                      Memory: question              Memory · Archetype            Principles: I II III
                              Check-in · History            Check-in · Patterns           Check-in · Patterns · QOS
Self-care (1)                 Planner                       Planner · Rituals             Planner · Rituals · Trajectory
                              Self-care (3) · streak        Ledger                        Ledger · Self-Assembly
Log                           Log · Ledger                  Log                           Log · Undercurrent
                                                                                          Indexes · Biofield
Volume I: opening             Pattern Insights              Pattern Insights · Mood       Seals: ·I· :II: ∴III∴ … ⟨XII⟩
```

**Density schedule:** I–II `breathable` · III–V `comfortable` · VI–VII `compact` · VIII–X `dense` · XI–XII
`instrument`. Density is still *earned* through `visualRefinement`. Volume sets a **floor**, never a ceiling.

---

## 8. PUBLIC PROFILE `/u/user` EVOLUTION

The personal OS page gains blocks as Volumes unlock. Every block is private by default and the person chooses
what to show.

| Vol | Block added (matching `PublicProfile.tsx`) |
|---|---|
| 0    | Name · City · Local time |
| I    | Weather · Sound |
| III  | **Memory Story** (Portrait v0.3) · Book One bookplate |
| VI   | **Archetype** · **Biofield State** · Book Two bookplate · Seal row |
| IX   | **Core Values** · **Pattern Strength** · **Indexes** · Book Three bookplate |
| XII  | **Citizen Index** · Memory Story = The Book · Book Four + Year One binding mark |
| XIII+ (Legacy) | Weather Station · Wallet · Legacy tag. **= Machiavelli** |

---

## 9. SEALS: BADGE ROW

Twelve Volume Seals plus four Book bookplates. They sit outside the 843-badge Codex as a separate **Usership
track** (proposed for Codex v34). They are rendered ASCII-only, in the existing badge style.

```
·I·  :II:  ∴III∴  ◇IV◇  ≈V≈  ◐VI◑  ≋VII≋  →VIII→  ╞IX╡  ◈X◈  ║XI║  ⟨XII⟩
SIGNAL RHYTHM PATTERN RITUAL SEASON MIRROR UNDERCURRENT CURRENT ARCHITECTURE COUNSEL LEGACY LOT® AI

Bookplates:  [ BOOK ONE · FOUNDATION ]  [ BOOK TWO · PRACTICE ]
             [ BOOK THREE · DEPTH ]     [ BOOK FOUR · INTELLIGENCE ]
Binding:     ═══ YEAR ONE ═══
```

Hidden Usership seals (secret-boss style):
- `PERFECT VOLUME`: every day of a month has a morning check-in.
- `THE SCRIBE`: 31 Log entries in a single Volume.
- `RETURN`: a Volume unlocked after more than 60 days of gathering. This celebrates coming back, never
  punishes the gap.

---

## 10. IMPLEMENTATION PLAN (proposed, not built this session)

| Phase | Scope | Files |
|---|---|---|
| **P1 · Foundation** | `usership.startedAt` set when the tag is applied · `GET /api/usership/journey` (ledger + gates + volumes) · fix MonthlyPulse to use `startedAt` + server dismissal | `src/server/routes/api.ts`, `src/server/models/user.ts`, `MonthlyPulseWidget.tsx` |
| **P2 · Volume widget** | Rename/evolve to `Volume:` with `Months unlocked: N/12`, ASCII bar, gathering state | `MonthlyPulseWidget.tsx` → `UsershipVolumeWidget.tsx` |
| **P3 · Capsule engine** | Scheduled job checks gates daily at the person's local 07:00 · generates Capsule via ladder prompt · writes `usership_capsule` log | `src/server/scheduled-jobs.ts`, `src/server/utils/memory/usership-capsule.ts` |
| **P4 · Ceremony + Capsule widget** | Unlock ceremony, `Capsule:` cycle, Ledger | new client components |
| **P5 · Unlock map** | Volume floors in `$featureUnlocks` + density floor | `src/client/stores/evolution.ts`, `interfaceEvolution.ts` |
| **P6 · Profile + Seals** | Profile block gating, Seal row, Codex v34 entries | `PublicProfile.tsx`, badge engine |
| **P7 · Year One Book** | One-page render + download, Quantum Cube trigger | new route + component |

**Acceptance test of tangibility:** a Volume VI account shown next to a Day 1 account must differ in at least
**six** visible ways: density, widget count, Capsule length, Seal row, profile blocks and voice.

---

## 11. OPEN QUESTIONS FOR S-2

1. Should a Volume stay *gathering* indefinitely, or auto-unlock at 2× the calendar time with a lighter Capsule?
   (Recommended: auto-unlock at 2×, with the Capsule honestly noting the thin month.)
2. Should Capsules be emailed (Resend) on unlock, or remain in-app only? (Recommended: in-app; email only for VI
   and XII.)
3. Should the Machiavelli demo expose a `usership.volumes` array so prospects can see all 12 Seals and Capsules?
   (Recommended: yes. It is the best sales asset for the paid tier.)
4. Codex v34: add the Usership track (12 + 4 + 3 = 19 seals) to the master count?

---

*LOT® · Library of Time. One Volume a month. One page a year. The rest is yours.*
