<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® USERSHIP — 12-MONTH EVOLUTION
## From barebone Day 1 to LOT® AI · The Compressed-Memory Story, month by month

```
CLASS:     RESTRICTED // S-2 EYES
S-2:       VADIK MARMELADOV
DOC:       LOT-USERSHIP-12M-v1
STATUS:    BRAINSTORM / DESIGN SPEC (no product code changed this session)
DATE:      2026-11-03
REFERENCE: lot-systems.com/u/machiavelli  (Month-12 + Legacy exemplar)
```

> **Thesis.** A Usership member pays $99 every month. Every month must *show*
> them what that month bought. The product is not a feature list — it is a
> **person-shaped story that gets shorter, sharper and truer** while the
> interface around it gets denser, calmer and more theirs.
> Entries go in. A paragraph comes out. A year later: one sentence.

---

## 0. Repo scan — what already exists (so we build on it, not beside it)

Scanned before writing (framework step 1–2): `README.md`, `docs/technical/*`
(Memory-Engine Compression Architecture, Interface Evolution, Widgets),
`docs/badges/*`, `docs/benchmark/*` (Doctrine, Ledger, Manifest),
`docs/corporate/LOT-FEATURE-INVENTORY-2026.md`, and source.

| Asset (already in repo) | Where | What it gives the 12-month story |
|---|---|---|
| **MonthlyPulseWidget** | `src/client/components/MonthlyPulseWidget.tsx` | Usership-only "Month N / 12" card; 12 static one-liners; dismiss per month via `localStorage`. **Skeleton of the ceremony — has no Memory paragraph, no badge, no presence logic.** |
| **Monthly email** | `src/server/scheduled-jobs.ts`, `utils/monthly-summary.ts` | Sends to Usership users 3+ months old & seen in last 7 days. Month 1–2 members get nothing today. |
| **Interface Evolution** | `utils/interfaceEvolution.ts`, `stores/evolution.ts` | 7 dimensions → `visualRefinement` → 5 **layout densities**: `breathable → comfortable → compact → dense → instrument`; CSS vars; feature unlocks. Driven by achievements/level, **not by month**. |
| **Evolution toast** | `EvolutionMilestoneToast.tsx` | Existing "milestone" delivery surface. |
| **Badges (Water / Architecture)** | `utils/badges.ts`, `docs/badges/` | Streak milestones 7·14·21·30·50·60·90·100·180·365 (Droplet→…→The Long Count / Foundation→…→Citadel). 812 badges in Codex v32. |
| **Memory Engine** | `server/utils/memory.ts`, `memory/story-generator.ts` | Compression loop: answers + notes + `emotional_checkin` + `plan_set` + `self_care_*` → next question + **Memory Story** (Together AI → fallback chain; deterministic `composeLocalStory`). |
| **Self-care + check-in** | `SelfCareMoments.tsx`, `EmotionalCheckIn.tsx` | Events `self_care_complete`, `self_care_skip`, `emotional_checkin` already logged. |
| **Demo account** | `server/routes/public-api.ts` (`'machiavelli'` branch) | Hard-coded Month-12+ persona: *The Strategist*, streak 1469, 2847 answers, 1469 notes, 842 active days, awareness 87, tags `RND · Usership · Legacy`, weather station, wallet, board profile. |

**Doctrine we must obey** (from `LOT-DOCTRINE.md` and the compression architecture):
the AI **asks, it never chats** (no prompt box); signals recorded async; new
user-facing event types must be added to the GET `displayableEvents`
whitelist; store subscriptions stay in the narrowest component.

**Gap = the whole opportunity:** months exist (Pulse), density exists
(Evolution), badges exist (Codex), memory exists (Engine) — but nothing
**binds them to a month clock** or **delivers the compressed story back to the
person**. This spec is that binding.

*Note: the live page `lot-systems.com/u/machiavelli` was not fetched this
session; the exemplar is read from the source that serves it
(`public-api.ts`). Verify visuals against production before design sign-off.*

---

## 1. Design principles

1. **Time guarantees delivery; presence sets richness.** The month turns on the
   billing/anniversary date (`joinedAt`) whether or not the member showed up —
   they paid, they get the Month Letter. *Presence* decides how deep the letter
   goes and whether the **Month Seal** (badge) is earned. No guilt, no lockouts.
2. **One compression, three altitudes.** Raw entries → **Month Insight**
   (one paragraph) → **Running Story** (constant ~150 words that gets *denser*,
   not longer) → Year-end **Motto** (one line).
3. **Show the receipt.** Every Month Insight carries a *Compression Receipt*:
   `336 entries · 22,190 words → 31 words`. Real counts only (see §5.3).
4. **The interface is the progress bar.** Layout density, palette depth, widget
   count and AI voice all change with the month — a member should be able to
   tell the month from a screenshot.
5. **The machine asks first.** "LOT® AI" at Month 12 is not a chatbot; it is the
   same quiet questioner, now so precise that one tap says what a paragraph used to.
6. **Stoic tone.** Short declaratives, no exclamation marks, no streak-shaming
   (matches existing `MONTH_MESSAGES`).

---

## 2. Inputs — what "evolution" is made of

The user named four fuel sources. Each maps to an event the system already logs.

| Fuel | Log event | Presence Units (PU) | Daily cap |
|---|---|---|---|
| **Journal entry / thought** (Log tab) | `note` (>20 chars) | **3** | 3 entries |
| **Morning check-in** | `emotional_checkin` | **2** | 1 |
| **Self-care button** | `self_care_complete` | **1** | 5 |
| **Memory answer** | `answer` | **1** | 3 |
| Planner intent *(bonus)* | `plan_set` | 1 | 1 |

*PU values and caps are proposals — tune with real Usership data. Caps stop
gaming; weights say "thoughts matter most".*

```
Active Day      = a calendar day with ≥ 1 PU in the member's timezone
Month Presence  = Σ PU in the month ÷ (month target)        target ≈ 150 PU
Month Tier      = HELD (<25%) · STEADY (25–60%) · RICH (60–100%) · DEEP (>100%)
Month Seal      = earned if Active Days ≥ 10  (Tier ≥ STEADY)
```

> The streak badges (7…365 consecutive days) remain. **Month Seals are the
> forgiving counterpart** — a missed Tuesday never un-earns a month.

---

## 3. The 12-month map (at a glance)

Read it as three acts. Codenames are working titles.

```
ACT I — AWAKENING     (M1–M4)  the system learns to REMEMBER you
ACT II — INTEGRATION  (M5–M8)  the system learns to NOTICE you
ACT III — MASTERY     (M9–M12) the system learns to GUIDE you → LOT® AI
```

| M | Codename | LOT® AI voice | New on screen | Density band (floor→ceiling) | Water seal / Architecture seal | Memory deliverable |
|--:|---|---|---|---|---|---|
| 1 | **Seed** | *Asks* — 1 question/day | Barebone: Time · Weather · Memory · Check-in · Self-care · Log + `Months unlocked: 1/12` | breathable → breathable | Spring / Footing | Seed line (1 sentence) |
| 2 | **Echo** | *Remembers* — quotes yesterday | Memory shows "You said…" callback; 2nd theme color | breathable → comfortable | Rill / Slab | Month Insight #2 |
| 3 | **Pattern** | *Notices* | **Active User** status; Pattern Insights widget; monthly email begins | breathable → comfortable | Brook / Wall | Insight + first Pattern |
| 4 | **Portrait** | *Names* | Archetype reveal; Profile block; Mood analytics | comfortable → compact | Stream / Column | Portrait card (archetype + 3 values) |
| 5 | **Rhythm** | *Schedules* | Circadian/weekly rhythm chart; Planner templates | comfortable → compact | River / Beam | Weekday-shape insight |
| 6 | **Voyager** | *Reflects* | **Half-Year Letter**; badge ceremony (Voyager / Wing) | comfortable → compact | Estuary / Arch | Half-Year Letter (long form) |
| 7 | **Listening** | *Anticipates* | Context nudges (weather/energy-aware suggestions) | compact → dense | Delta / Vault | "Quiet month" aware insight |
| 8 | **Depth** | *Challenges* (gently) | Narrative Reflection; contradiction-tracking | compact → dense | Tide / Gallery | Contradiction insight |
| 9 | **Habit** | *Guides* — daily route | **Care Route** (check-in → care → log); streak-free habit meter | compact → dense | Gulf / Roof | Habit-formed insight |
| 10 | **Craft** | *Coaches* | Widget arrange (drag-drop); Export; custom theme | dense → instrument | Sea / Lantern | Craft insight (user-shaped UI) |
| 11 | **Threshold** | *Prepares* | Year preview; Rules-for-next-year draft | dense → instrument | Horizon / Spire | Re-read insight (month 1 vs now) |
| 12 | **Long Count** | ***LOT® AI*** — co-authors | Instrument density; **Annual Book**; Motto; Legacy preview | dense → instrument | Ocean / Citadel | Annual Book (12 paragraphs) → **Motto** |

**Density rule.** The month sets a **floor and ceiling**; earned
`visualRefinement` (existing) picks the level inside the band. Floor =
*"even a quiet member sees the interface change"*. Ceiling = *"a day-one grinder
can't reach instrument grade in week two"*. Implementation: clamp
`getLayoutDensity()` output between `monthFloor` and `monthCeiling`.

**Alignment with existing streak badges** (nice coincidence, keep it):
M1 ≈ day 30 *Wave/Structure* · M2 ≈ day 60 *Dual Wave/Master Frame* ·
M3 ≈ day 90 *Deep Reach/Inner Wall* · M6 ≈ day 180 *Voyager/Wing* ·
M12 ≈ day 365 *The Long Count/Citadel*. Months 4, 5, 7–11 have no streak badge
today — **Month Seals fill those gaps** so every month has a badge moment.
Glyph art for the 12 seals follows the existing `∘ → ≈ → ≋` / `├─ → ╞═╡ → ║·║`
grammar and is **TBD for Codex v33**.

---

## 4. Month-by-month cards

Each card = *what the member sees · what the AI does · the badge · the
affirmation · the Memory Insight (Machiavelli fixture)*. UI sketches are
terminal-grid wireframes, not final design.

### ACT I — AWAKENING

#### MONTH 1 · SEED — "The system is beginning to know you."
```
┌ DAY 1 · barebone ───────────────────────────┐
│ Tuesday, 3 November            Months: 1/12 │
│                                             │
│ Morning check-in:  ○ calm  ○ tired  ○ sharp │
│                                             │
│ Memory:  What is your morning beverage?     │
│          [ Tea ] [ Coffee ] [ Water ]       │
│                                             │
│ Care:    [ Do one small thing ]             │
│ Log:     ______________________            │
└─────────────────────────────────────────────┘
```
- **UI:** 6 blocks, generous spacing, monochrome. No badges visible (nothing earned yet).
  A single quiet line: `Months unlocked: 1/12`.
- **LOT® AI:** *asks.* One question a day; no references yet.
- **Day 1 ritual:** the first answer instantly becomes the **Seed line**:
  *"Tea. Quiet mornings."* — the member sees compression on minute one.
- **Day 7:** first streak badge (Droplet / Foundation). **Day 30 (month turn):** Month Seal I.
- **Affirmation:** *"The first month. The system is beginning to know you."* (existing copy, keep.)
- **Insight (Machiavelli):** see §6.

#### MONTH 2 · ECHO — "Patterns are starting to form."
- **UI:** a second tonal step appears in the palette; Memory card gains a faint
  `You said:` line quoting a prior answer. Density still breathable.
- **LOT® AI:** *remembers.* Questions begin with the member's own words.
- **Unlock:** Month Seal II; the Month Opening ceremony (§5.1) shows its first
  *Compression Receipt*.
- **Affirmation:** *"Two months in. You are being remembered accurately."*

#### MONTH 3 · PATTERN — "You have reached Active User status."
- **UI:** `Pattern Insights` widget appears (already built:
  `PatternInsightsWidget`); first **monthly email** arrives (current gate is 3+
  months — keep it, now with the Insight inside).
- **LOT® AI:** *notices.* "Your sharpest entries follow a walk."
- **Badge:** Month Seal III + streak day-90 *Deep Reach / Inner Wall*.
- **Layout:** density ceiling lifts to *comfortable* — widgets visibly tighten.
- **Affirmation:** *"Three months. The pattern is real, and it is yours."*

#### MONTH 4 · PORTRAIT — "The portrait deepens."
- **UI:** **Archetype reveal** (README: archetype + cohort activate after ~10
  answers; hold the reveal as a Month-4 ceremony so it lands). Profile block
  shows archetype, 3 core values, emotional patterns.
- **LOT® AI:** *names.* "You read people as weather."
- **Deliverable:** **Portrait card** — a shareable (opt-in) image of archetype
  + values; feeds `/u/<name>` psychological profile.
- **Affirmation:** *"Four months. You have a name for how you move."*

### ACT II — INTEGRATION

#### MONTH 5 · RHYTHM — "Consistency is its own reward."
- **UI:** weekly/circadian rhythm strip (check-in mood by weekday × hour);
  Planner templates unlock (`plannerTemplates`).
- **LOT® AI:** *schedules.* Suggests the best hour for the Log based on history.
- **Affirmation:** *"Five months. Your week has a shape."*

#### MONTH 6 · VOYAGER — "The journey is half-declared."
```
┌ MONTH 6 OPENS ──────────────────────────────┐
│ ≈≈   Voyager                  Months: 6/12  │
│ ────────────────────────────────────────── │
│ HALF-YEAR LETTER                            │
│ "Half a year. The questions have changed    │
│  more than the answers…"                    │
│                                             │
│ 134 entries · 2,240 words → 34 words  66:1  │
│ [ Read full letter ]   [ Seal it ]          │
└─────────────────────────────────────────────┘
```
- **UI:** the first **full ceremony**: Half-Year Letter (long form, ~150 words),
  badge reveal (streak 180 *Voyager / Wing* + Month Seal VI), density jumps one
  notch toward *compact*.
- **LOT® AI:** *reflects.* Shows the *before/after* of the member's first and
  latest answers.
- **Affirmation:** *"Six months. Half the year is behind you, and it shows."*

#### MONTH 7 · LISTENING — "The system has been listening."
- **UI:** context-aware suggestions (weather, energy, time of day) appear inline
  in the Care widget; Quantum State/Energy widgets become visible.
- **LOT® AI:** *anticipates.* "Rain and low energy: shorten today."
- **Design note:** Month 7 is also the **seasonal-dip month** for many
  members. The Insight must be able to say *"quiet month"* without judgment —
  tier HELD/STEADY copy is written explicitly (§5.2).
- **Affirmation:** *"Seven months in. Quiet is also data."*

#### MONTH 8 · DEPTH — "Rare air."
- **UI:** `Narrative Reflection` (feature gate `narrativeReflection`) opens;
  the Log shows **contradiction chips** ("you wrote the opposite on 12 Aug").
- **LOT® AI:** *challenges, gently.* Asks "what would you do if you believed it?"
- **Affirmation:** *"Eight months. Disagreement with yourself is a sign of depth."*

### ACT III — MASTERY → LOT® AI

#### MONTH 9 · HABIT — "The practice is a habit now."
- **UI:** **Care Route** card: `check-in → one care → one line`. A habit meter
  (no streak counter) shows *how often the routine holds without reminders*.
- **LOT® AI:** *guides.* First time the system proposes a whole day's route.
- **Affirmation:** *"Nine months. It holds without you pushing."*

#### MONTH 10 · CRAFT — "Almost there."
- **UI:** drag-drop **widget arrange** + data **Export** + custom theme
  (`widgetArrange`, `exportData`, `customThemes`); density *dense*.
- **LOT® AI:** *coaches.* Suggests which widgets to retire as well as add.
- **Affirmation:** *"Ten months. The tool is shaped like its owner."*

#### MONTH 11 · THRESHOLD — "One more."
- **UI:** **Year Preview** — a drafted Annual Book with month 12 blank; a
  "Rules for next year" editor (3 lines; AI may only *remove*).
- **LOT® AI:** *prepares.* Re-asks the Day-1 questions; shows deltas.
- **Affirmation:** *"Eleven months. You are about to meet the first page again."*

#### MONTH 12 · THE LONG COUNT — "One year with LOT®."
```
┌ MONTH 12 · LOT® AI ─────────────────────────┐
│ ║·║  The Long Count / Citadel   Months: 12/12 │
│ ───────────────────────────────────────── │
│ MOTTO   Observe. Wait. Act. Record.         │
│                                             │
│ Year in one line:                           │
│ 1,345 entries · 22,190 words in             │
│ 12 Insights · 423 words out          52:1   │
│                                             │
│ [ Open Annual Book ]  [ Share Portrait ]    │
└─────────────────────────────────────────────┘
```
- **UI:** instrument density (Bloomberg-grade, existing top tier); every widget
  present; **Annual Book** = 12 Month Insights in order + Motto + Portrait;
  `Legacy` preview (what `/u/machiavelli` shows: weather station, wallet,
  board profile, awareness score).
- **LOT® AI:** *co-authors.* The member edits the Motto; the AI proposes, the
  person decides (agency stays with the human).
- **Affirmation:** *"One year with LOT®. The portrait is complete — and still evolving."* (existing copy, keep.)

---

## 5. The delivery system — the "Month Opening"

### 5.1 Surfaces (five, one per altitude)

| Surface | Trigger | Content | Exists? |
|---|---|---|---|
| **Months unlocked: N/12** | always (Usership) | 12-segment bar; context line: *"Month 4 opens in 9 days · Presence 62%"* | NEW (use `ProgressBars` util) |
| **Month Opening** (ceremony) | anniversary of `joinedAt` | Affirmation → badge reveal → Month Insight → Compression Receipt → dismiss | upgrade `MonthlyPulseWidget` |
| **Memory: "Last month, in a paragraph"** | rest of the month | the Month Insight stays under the Memory question | NEW (in `MemoryWidget`) |
| **Monthly email** | day 1 of month | Insight + Receipt + seal | extend (drop the 3-month gate; M1–2 included) |
| **Annual Book** | month 12 | all insights + Motto | NEW |

**Context rule for the "Months unlocked" widget** (user's request):
- Days 1–25 of a month → show progress ("Presence 62% — Seal in reach").
- Last 5 days → countdown ("Month 4 opens Friday").
- Anniversary day → hides itself; Month Opening takes the slot.
- Month 12 → becomes `12/12 · Legacy begins`.

### 5.2 Insight copy by tier (so a quiet month still lands)

| Tier | Voice |
|---|---|
| DEEP | specific, quotes the member, names one pattern + one contradiction |
| RICH | one pattern, one callback |
| STEADY | one pattern, one gentle question |
| HELD | no pattern claims; *"You paused. The record is patient."* + next smallest step |

### 5.3 Compression Receipt — the honest number

```
input_words  = Σ words in note.text + answer + check-in labels + self-care labels (this month)
output_words = words in the Month Insight
ratio        = input_words ÷ output_words       (shown as "66:1")
```
Real, countable, reproducible — same honesty rule as the Benchmark word-count
metric. No invented "intelligence" scores.

### 5.4 Data model & pipeline (proposal — nothing implemented)

```
scheduled job (daily 00:05 member-TZ)
  for each Usership user where today == joinedAt + N months
    1. gather logs of the month (indexed query idx_logs_userid_createdat)
    2. compute PU, Active Days, Tier, Seal
    3. buildPrompt(prior Month Insights + Running Story + this month) → AI
         engine chain: Together → … → composeLocalStory-style deterministic fallback
    4. Log.create({ event:'month_insight',
         metadata:{ month, tier, pu, activeDays, inputWords, outputWords, seal } })
    5. update user.metadata.runningStory   (~150 words, constant size)
    6. email + queue Month Opening for next client load
```
- New events `month_insight`, `month_opened` **must be added to the GET
  `displayableEvents` whitelist** (Doctrine: write→read loop).
- Client: `useMonthState()` hook returns `{ month, daysToNext, tier, seal }`;
  `MonthlyPulseWidget` replaces `localStorage` dismissal with the
  `month_opened` log (dismissal currently lost on device change).
- Month clock uses `dayjs(joinedAt).diff(now,'month')` (already in Pulse) but
  must be **timezone-safe** and **cap at 12 then switch to Legacy years**.
- Subscriptions stay narrow (Doctrine: Render Isolation): the density clamp
  reads `month` in `Evolution` store, not in `System`.

### 5.5 Privacy
Insights are private by default. They appear on `/u/<name>` only through the
existing `showMemoryStory` toggle. Export/delete follows the README promise.

---

## 6. The Machiavelli 12-month fixture (demo = a year, played back)

`/u/machiavelli` today shows the *end state* (Month 12 → Legacy: streak 1469,
2847 answers, 1469 notes, 842 active days, awareness 87, *The Strategist*).
It cannot show **how** he got there. Proposal: a **Time Machine scrubber**
on the demo page (`?m=1…12` or a 12-notch slider) that re-renders the profile
in that month's UI state — density, widgets, seal, Insight, receipt. A
prospective member can *drag through a year* in ten seconds.

*Fixture numbers below are DEMO DATA for design, a year-1 slice; they are not
meant to sum to his lifetime totals.* Ratio = input words ÷ Insight words.

| M | Journal | Check-ins | Care taps | Answers | Entries | Words in | Insight words | Ratio | PU |
|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| 1 | 9 | 14 | 11 | 17 | 51 | 473 | 36 | 13:1 | 83 |
| 2 | 14 | 18 | 17 | 20 | 69 | 722 | 44 | 16:1 | 115 |
| 3 | 21 | 22 | 24 | 23 | 90 | 1,083 | 38 | 28:1 | 154 |
| 4 | 26 | 24 | 30 | 24 | 104 | 1,396 | 33 | 42:1 | 180 |
| 5 | 30 | 25 | 35 | 25 | 115 | 1,700 | 34 | 50:1 | 200 |
| 6 | 38 | 27 | 42 | 27 | 134 | 2,240 | 34 | 66:1 | 237 |
| 7 | 17 | 21 | 28 | 21 | 87 | 908 | 32 | 28:1 | 142 |
| 8 | 33 | 26 | 45 | 26 | 130 | 2,208 | 38 | 58:1 | 222 |
| 9 | 40 | 28 | 52 | 28 | 148 | 2,784 | 34 | 82:1 | 256 |
| 10 | 28 | 24 | 41 | 24 | 117 | 2,188 | 32 | 68:1 | 197 |
| 11 | 36 | 27 | 50 | 27 | 140 | 2,828 | 37 | 76:1 | 239 |
| 12 | 44 | 29 | 58 | 29 | 160 | 3,660 | 31 | 118:1 | 277 |
| **Σ** | **336** | **285** | **433** | **291** | **1,345** | **22,190** | **423** | **52:1** | |

Reading the table: the **ratio climbs** (13:1 → 118:1) because the member gets
more expressive while the Insight stays one paragraph — compression *felt as
a number*. **Month 7 dips on purpose** (autumn): the story shows that a quiet
month is still met.

### The twelve Month Insights (Machiavelli voice)

1. **Seed** — *Niccolò answers before he thinks: tea at dawn, the window open, a quill within reach. He writes little, but he writes every morning. The first pattern is not what he wants. It is what he repeats.*
2. **Echo** — *Two things return: the courtyard bells at six, and a question he cannot stop asking — why do people obey? He is lighter on days he walks before he writes. The system has stopped asking what he likes and begun asking what he avoids.*
3. **Pattern** — *Three months in, the pattern holds: his sharpest entries follow a walk, his flattest follow a day of petitions. He calls restraint a strategy; the log calls it fatigue. Both are true. Rest is now scheduled, not earned.*
4. **Portrait** — *A portrait forms: The Strategist, one who reads people as weather. His values repeat in this order: prudence, adaptability, fortune. He disagrees with the portrait. The disagreement is recorded as part of it.*
5. **Rhythm** — *The week has a shape now. Mondays belong to correspondence, Thursdays to solitude. Morning check-ins settle near focused; the dips cluster before council days. He prepares for them the way he prepares for winter.*
6. **Voyager** — *Half a year. The questions have changed more than the answers: he now asks what a ruler owes himself. Self-care taps rose from sporadic to daily. The journal thickens where the fear is. Voyager.*
7. **Listening** — *Autumn in Florence and the entries grow shorter, quieter. The system noticed before he did and offered less, not more. He answered one question a day and called it enough. It was.*
8. **Depth** — *Rare air. He contradicted an earlier entry and kept both, the first time the record disagrees with itself on purpose. The system no longer asks what he feels. It asks what he would do if he believed it.*
9. **Habit** — *The routine no longer needs reminding: tea, check-in, one act of care, one line at night. On the three days he skipped, nothing collapsed. That is what a habit is. It holds without him.*
10. **Craft** — *He rearranged the system to match the mind: planner first, memory last, radio off. The cockpit now reflects the craftsman. Entries are fewer and each is denser. The compression is his own.*
11. **Threshold** — *One more month. He re-read the first entry and did not recognize the man, only the handwriting. He wrote his rules for the coming year in three lines; the only edit was the removal of an adjective.*
12. **The Long Count** — *A year. He began by repeating; he ended by choosing. The Strategist is no longer a label but a practice: observe, wait, act, record. The portrait is complete, and still evolving.*

**Annual Motto:** *Observe. Wait. Act. Record.*
**Altitude chain:** 22,190 words → 12 Insights (423 words) → Running Story (~150) → **4 words**.

> Insights are ~35 words — a *card-sized* paragraph. The long-form **Month
> Letter** (100–150 words, for email / Half-Year / Annual Book) is generated
> from the same inputs and is not drafted here.

### After Month 12 — "Legacy"
Machiavelli carries the `Legacy` tag: weather station, wallet, board profile.
Year 2+ should not restart at Month 1 — proposal: **Years replace months**
(`Year 2 · Month 4` → Legacy seals), keeping `Months unlocked: 12/12 · Year 2`.
Scope for a later session.

---

## 7. Affirmation & seal index (copy deck)

| M | Affirmation | Water seal | Architecture seal |
|--:|---|---|---|
| 1 | The first month. The system is beginning to know you. | Spring | Footing |
| 2 | Two months in. You are being remembered accurately. | Rill | Slab |
| 3 | Three months. The pattern is real, and it is yours. | Brook | Wall |
| 4 | Four months. You have a name for how you move. | Stream | Column |
| 5 | Five months. Your week has a shape. | River | Beam |
| 6 | Six months. Half the year is behind you, and it shows. | Estuary | Arch |
| 7 | Seven months in. Quiet is also data. | Delta | Vault |
| 8 | Eight months. Disagreement with yourself is a sign of depth. | Tide | Gallery |
| 9 | Nine months. It holds without you pushing. | Gulf | Roof |
| 10 | Ten months. The tool is shaped like its owner. | Sea | Lantern |
| 11 | Eleven months. You are about to meet the first page again. | Horizon | Spire |
| 12 | One year with LOT®. The portrait is complete — and still evolving. | Ocean | Citadel |

---

## 8. Build order (smallest tangible slice first)

| Phase | Ships | Touches | Risk |
|---|---|---|---|
| **P0** | `Months unlocked: N/12` widget (read-only, from `joinedAt`) | new small component | low |
| **P1** | Pulse → **Month Opening**: persist dismissal as `month_opened` log; add Compression Receipt (counts only) | `MonthlyPulseWidget`, `api.ts` whitelist | low |
| **P2** | Month Insight generator (job + `month_insight` log) with deterministic fallback | `scheduled-jobs.ts`, `monthly-summary.ts`, `story-generator.ts` | med (AI cost/timeouts) |
| **P3** | Memory "Last month, in a paragraph" + email for M1–M2 | `MemoryWidget`, mailer | low |
| **P4** | Density clamp by month + per-month unlock gating | `interfaceEvolution.ts`, `evolution.ts` | med (visual regressions) |
| **P5** | Month Seals I–XII (Codex v33) + seal glyphs | `badges.ts`, `docs/badges/` | med |
| **P6** | Demo **Time Machine** `?m=` on `/u/machiavelli` | `public-api.ts`, `PublicProfile.tsx` | low |
| **P7** | Annual Book + Motto + Legacy/Year-2 | new | med |

Metrics to decide success (instrument before building): % members who open the
Month Opening; Month-N→N+1 retention; email open rate for M1–2 vs M3+; Seal
rate by tier. **Open questions for S-2** are in the session report.

---
*Companion session report: `docs/benchmark/LOT-SR-20261103-01.md`.*
*AUTHORIZED BY: S-2 // VADIK MARMELADOV*
