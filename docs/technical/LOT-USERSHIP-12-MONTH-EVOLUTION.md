<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® Usership — 12-Month Evolution

### From barebone Day 1 to LOT® AI · Month-by-month UI, Memory compression and badges

**S-2:** VADIK MARMELADOV
**Class:** ENGINEERING / DESIGN SPEC · **Status:** PROPOSED (design brainstorm — nothing in this file is shipped unless marked EXISTS)
**Date:** 2026-10-04 · **Session:** S-2 scheduled brief, "12-month paid tier"
**Reference account:** `lot-systems.com/u/machiavelli` (Month-12 exemplar)

---

## 0. THE THESIS IN FOUR LINES

```
Day 1      A paid user opens a nearly empty screen. One question. One button.
Month 6    The screen is a dashboard that knows their name for things.
Month 12   The screen is an instrument — and the machine can recite them back to themselves.
Always     Time opens the door. Practice walks through it. Memory proves it happened.
```

The paid tier is not a feature list that appears on payment. It is a **year-long
story the interface tells with itself**. The user must be able to point at the
screen on any day of any month and say: *this is different from last month.*

---

## 1. FRAMEWORK COMPLIANCE (S-2 session rules)

| # | Rule | Done |
|---|------|------|
| 1 | Scan the repository before every session | Tree scanned: 379 .md files, 60+ client widgets, `public-api.ts` demo block, `interfaceEvolution.ts`, `monthly-summary.ts`, `story-generator.ts` |
| 2 | Read all of the .MDs | Read in full or by relevance-ranked section: README, `docs/README`, `LOT-AI-PRODUCT-BRIEF`, `INTERFACE_EVOLUTION`, `MEMORY-ENGINE-COMPRESSION-ARCHITECTURE`, `LOT-STYLE-GUIDE`, `WIDGETS`, `LOT-FEATURE-INVENTORY-2026`, `BADGE_MAYAN_EVOLUTION`, `BADGE_PROGRESSION_PREVIEW`, `BADGE_LEVEL_DESIGN`, LOT-WIKI-v87 §1/§9/§18–20, `lot-benchmark` skill, LEDGER. The remaining ~350 files (96 assembly reports, 32 badge codices, 33 wiki revisions, 79 session reports) were indexed by name and spot-checked, not read line by line — see §12 Honest Limits. |
| 3 | Push the session with a detailed .MD | This file + `docs/benchmark/LOT-SR-20261004-01.md` + LEDGER append |
| 4 | Focus on 12-month tangibility of compressed Memory story delivery | §5 (Compression Ladder), §6 (twelve deliveries), §7 (Memory widget) |

---

## 2. WHAT ALREADY EXISTS (build on it, don't reinvent)

```
EXISTS   MonthlyPulseWidget        Usership-only. "Month N:" + one line + "N / 12 months".
                                   Dismiss once per month (localStorage `lot_pulse_<id>`).
                                   Month = dayjs().diff(joinedAt,'month'). Calendar-only.
EXISTS   Interface Evolution       7 dimensions -> visualRefinement -> LayoutDensity
                                   breathable(<.15) comfortable(.15) compact(.35)
                                   dense(.55) instrument(.75). Earned, not timed.
EXISTS   Evolution milestones      EvolutionMilestoneToast, localStorage, max 10.
EXISTS   Memory Engine             Question -> tap -> compress loop; generateMemoryStory().
EXISTS   Monthly email             scheduled-jobs.ts + monthly-summary.ts (presence,
                                   energy, patterns, growth, narrative, forwardLook).
EXISTS   Badges                    Water / Mayan glyph ladder (∘ → ∘∘ → ≈ → ≋ → ○).
EXISTS   Public profile /u/<x>     Memory Story, archetype, board profile, QR, weather
                                   station, wallet. Demo = machiavelli (hardcoded).
EXISTS   Usership perks            $99/mo: AI questions, memory story, psych profile,
                                   QR, custom theme, board profile, architect, email.
MISSING  A single object that says "this is where you are in the year" and ties
         Time + Practice + Memory together. MonthlyPulse knows only the calendar.
MISSING  A visible, per-month Memory delivery (the story exists; its cadence doesn't).
MISSING  A way for a visitor to SEE the evolution (demo is frozen at Month 12+).
```

The design below is therefore **mostly a wiring and pacing spec**, not new
engines: it gives the existing pieces one spine — the **Month Index**.

---

## 3. THE SPINE — THE MONTH INDEX

Every Usership account carries one derived object (no new DB table required for
v1; computed from `joinedAt` + logs):

```
MonthIndex {
  calendarMonth   0..12+   dayjs().diff(joinedAt,'month')          (EXISTS)
  practiceScore   0..∞     weighted count of earned actions         (NEW)
  monthsUnlocked  0..12    highest N where calendar>=N AND PS>=gate(N)
  monthPending    bool     calendar>N but practice gate unmet
}
```

### 3.1 Why a dual gate (Time AND Practice)

- **Time alone** (today's MonthlyPulse) congratulates a user who never logged in.
  That is a lie the interface should not tell — and "Months unlocked: 3/12"
  would read as a billing counter.
- **Practice alone** lets a power user burn through the story in week two and
  destroys the *tangible slowness* that makes a year feel like a year.
- **Both** gives every unlock meaning: the calendar is the floor, the practice
  is the key.

### 3.2 Practice Score (PS) — the three things S-2 named

| Action | Source event (already logged) | Weight | Daily cap |
|--------|-------------------------------|--------|-----------|
| Journal entry in **Log** (text > 20 chars) | `note` | **3** | 3 entries |
| Morning check-in | `emotional_checkin` before 12:00 local | **2** | 1 |
| Any other check-in | `emotional_checkin` | 1 | 2 |
| Self-care button click (Done) | `self_care_complete` | **2** | 3 |
| Self-care skip | `self_care_skip` | 0 (logged, never punished) | — |
| Memory answer | `answer` | 1 | 5 |
| Planner set | `plan_set` | 1 | 1 |

Daily cap = 20 PS max. Caps prevent grinding and keep the score about *rhythm*.

### 3.3 Gates — cumulative PS to unlock month N (median-engaged pacing)

```
Month  1    2    3    4    5     6     7     8     9     10    11    12
Gate   40   110  200  310  430   560   700   850   1000  1160  1330  1500
Δ/mo   40   70   90   110  120   130   140   150   150   160   170   170
≈/day  1.3  2.3  3.0  3.7  4.0   4.3   4.7   5.0   5.0   5.3   5.7   5.7
```

Reading: ~6 PS/day by the end = one journal line + a morning check-in + one
self-care click. **That is the whole ask of the user.** The curve rises gently so
Month 1 is forgiving (setup, curiosity) and Month 12 is a real practice.
Gates are PROPOSED numbers — tune against real Usership cohort data before ship.

### 3.4 Pending is not failure — the "Month opens when you do" state

If `calendarMonth > monthsUnlocked`, the Month widget does **not** show red,
a streak-loss message, or a countdown. It shows:

```
Month 4:
Pending.  The system is waiting. 74 / 110 practice.
```

Style-guide compliant: periods over symbols, opacity-60 helper line, no emoji.
Doctrine alignment: *No unprompted notifications. The system waits.*

---

## 4. FOUR LAYERS THAT EVOLVE EVERY MONTH

Each month moves four dials. Together they are what the user *feels*.

```
LAYER 1  LAYOUT      Density: breathable -> comfortable -> compact -> dense -> instrument
LAYER 2  WIDGETS     Which blocks exist on System tab (earned, never removed)
LAYER 3  VOICE       How LOT® AI speaks: Observer -> Companion -> Guide -> Mirror
LAYER 4  MEMORY      The compressed Story delivered at month close (the main event)
(+ SEAL) BADGE       One water glyph per unlocked month, worn on the profile
```

### 4.1 Density ladder (maps 1:1 to existing `getLayoutDensity` thresholds)

```
Months   Density       visualRefinement   sectionGap  stackGap   Feel
1–2      breathable    < 0.15             gap-y-24    gap-y-16   Wellness journal. Air.
3–5      comfortable   0.15 – 0.35        gap-y-24    gap-y-8    Stacks begin to form.
6–8      compact       0.35 – 0.55        gap-y-16    gap-y-4    Dashboard clarity.
9–11     dense         0.55 – 0.75        gap-y-8     gap-y-0    Cockpit.
12       instrument    >= 0.75            gap-y-4     gap-y-0    Bloomberg-grade. Earned.
```

Implementation note: v1 can *floor* `visualRefinement` by month
(`max(computed, monthFloor)` with floors 0 / 0.15 / 0.35 / 0.55 / 0.75 at months
1 / 3 / 6 / 9 / 12) so the user always sees density step up at the right
anniversary, while genuine mastery can still push it further ahead.
The user should never see density **decrease**.

### 4.2 Voice ladder (LOT® AI)

```
M1–2    OBSERVER    Asks. Never claims. "What is your morning like?"
M3–5    COMPANION   Starts referencing. "You said tea. It's been cold all week."
M6–8    GUIDE       Suggests routines. "Three mornings of silence — try the 4-min reset?"
M9–11   MIRROR      Names patterns. "You journal more after you skip self-care."
M12     OPERATOR    Speaks as a stable signature. Recites the year. Asks fewer, harder questions.
```

This is the Product Brief's compression promise made visible:
*"Over weeks, the questions become fewer and hit harder."* The **number of
questions per day falls** across the year while their specificity rises
(M1: 5/day, M6: 3/day, M12: 1–2/day). The screen gets denser; the AI gets quieter.

### 4.3 Alignment with the existing QI·46 arc (do not fork the doctrine)

```
QI·46 ARC (existing)        THIS SPEC                     VOICE / PHASE
0–3 months  calibration     Months 1–3   Phases I–II      Observer -> Companion
3–6 months  pattern recog.  Months 3–6   Phases II–III    Companion -> Guide
6–12 months coherence       Months 6–12  Phases III–V     Guide -> Mirror -> Operator
12+ months  Quantum Cube    Month 12     Year-2 track     "hardware" arc state
```

Usership is sold as **$99/month for 12 months** (Settings copy), so the twelve
cards are literally the contract term. The Month-12 unlock list therefore also
carries the **Quantum Cube delivery milestone** (QI·46 Step 3.3) — the physical
object arrives the month the Portrait completes. The UI should say so plainly in
the Month-12 ceremonial block; hardware logistics are out of scope here.

---

## 5. THE COMPRESSION LADDER (the heart of the brief)

The Memory Story is the product's proof of work. It must be delivered on a
**fixed, visible cadence** so the user feels the year *accumulate into
something*. Every rung compresses the one below.

```
RUNG        INPUT                         OUTPUT                      DELIVERED
─────────   ───────────────────────────   ─────────────────────────   ────────────────────────
Day         taps, notes, check-ins        one-line "Today:" reading   Cockpit log (EXISTS)
Week        7 days of Day lines           Weekly Story (3–4 lines)    Sunday close (Brief: P87)
MONTH       4 Weekly Stories + Log        MONTH INSIGHT (1 paragraph, Month widget + email
            + check-in arc                ~60–90 words) + 1 Phrase   (EXISTS: email; widget NEW)
Quarter     3 Month Insights              CHAPTER (2 paragraphs)      M3 / M6 / M9 / M12
Half        2 Chapters                    HALF-YEAR MIRROR            M6
Year        4 Chapters                    THE PORTRAIT (1 paragraph   M12 -> public
                                          + 1 sentence "Seal")        Memory Story on /u/<x>
```

### 5.1 Anatomy of a Month Insight (the unit of delivery)

```
MONTH INSIGHT  (generated at month close, ~60–90 words)
  1. WHAT HAPPENED     the dominant pattern, one concrete reference ("12 mornings of tea + silence")
  2. WHAT CHANGED      delta vs last month's Insight (the model is given the previous one)
  3. WHAT IT MEANS     one honest interpretation, hedged where evidence is thin
  4. WHAT'S NEXT       one self-care direction for the coming month (the guide function)
PHRASE (<= 6 words)    the month's name, reusable as a badge caption: "The Quiet Mornings."
```

Rules inherited from the Memory Engine docs: the **previous Insight is part of
the next prompt** (that is what makes it compression and not a recap); data
lives in LOT's DB, providers never remember; the user can export or delete.
Style-guide rules: no emoji, periods over symbols, first-person *behavioral*
voice only in the Month-12 Portrait.

### 5.2 Measured, not claimed

Compression is reported honestly (Benchmark Cardinal Rule 5): show **inputs
counted**, not an invented ratio.

```
Month 3 Insight:  built from 47 journal lines · 63 check-ins · 91 self-care clicks
```

That single provenance line is the most trust-building UI element in the year.

### 5.3 Delivery moments (when the user *receives* it)

1. **Month close (calendar + gate met):** Month widget flips from "Month N:" to the
   Insight, with 1400 ms fade-in, tap to continue (dismiss phrase retained from
   `MonthlyPulseWidget`).
2. **Email (EXISTS):** same text, plain LOT style, first of the month.
3. **Memory widget label cycle:** `Memory:` → `Reflection:` → **`Months:`** — a new
   third view that scrolls the unlocked Insights, newest first (style-guide
   Clickable Label Cycling pattern).
4. **Public profile:** the latest Insight is the `memoryStory` (privacy toggle
   `showMemoryStory` already exists).
5. **Quarter/half/year:** a full-screen-ish Block (same widget, larger copy) —
   the only moments the UI is allowed to be ceremonial.

---

## 6. THE TWELVE MONTHS

Card schema:

```
SEAL       water glyph earned           DENSITY / VOICE   layout + AI persona
UNLOCK     new widget or capability      PRACTICE GATE     cumulative PS (§3.3)
UI STATE   what the screen looks like    MEMORY DELIVERY   sample Month Insight
SELF-CARE  what the AI guides them to    CELEBRATION       the month-close moment
```

Sample Insights are **illustrative copy for tone**, written for a hypothetical
user; Month 12 is the Machiavelli exemplar.

### Seal ladder (existing water/Mayan vocabulary; 12 × 30 days = 360 = one Tun)

```
 M1 ∘     M2 ∘∘    M3 ∘≋    M4 ≈∘≈   M5 ∿—∿   M6 ○◐○
 M7 ≈○≈   M8 —○—   M9 ○∴○   M10 ○≈○  M11 ≋≋    M12 ≋○≋

 droplet -> two droplets -> droplet+wave -> wave in tide -> balanced tide ->
 half-turn (M6) -> ... -> full tide (M10) -> deep current (M11) -> ocean depth (M12)
```

---

### PHASE I — OBSERVER · Months 1–2 · *"The system is beginning to know you."*

#### MONTH 1 — ARRIVAL
```
SEAL ∘   DENSITY breathable   VOICE Observer   GATE 40
UI STATE   Day 1: one column. Time. Memory (one question). Self-care (one button).
           System tab shows 3 blocks only. Nothing is greyed out or locked-looking —
           absent, not disabled. Month widget: "Month 0: Day 1." then "Day 7. Day 14…"
UNLOCK     Log (journal) · Morning check-in · Self-care button · Month widget
SELF-CARE  One routine only: the 2-minute morning reset. Same one every day. Repetition
           is the product here.
MEMORY     Week 1 closes with the first Weekly Story (3 lines). Month Insight is the
DELIVERY   first Month paragraph — deliberately modest, mostly mirrors answers:
           "You started the month answering mornings, not evenings. Tea, quiet, and
            early light came up most. You skipped self-care twice, both on days you
            logged late. Next month: keep the morning, and notice the evening."
           Provenance: 22 journal lines · 28 check-ins · 31 self-care clicks.
CELEBRATE  Seal ∘ appears on the profile. Dismiss phrase: "The system remembers."
```

#### MONTH 2 — RHYTHM
```
SEAL ∘∘   DENSITY breathable   VOICE Observer   GATE 110
UI STATE   Same airy layout; a fourth block arrives: "Streak:" (days present, no loss
           messaging — it only ever shows the longest).
UNLOCK     Planner widget · Evening check-in prompt (soft)
SELF-CARE  Adds an evening routine. AI proposes, user chooses; one skip is free.
MEMORY     "Two rhythms are forming: tea at dawn and silence after dinner. Your
DELIVERY   check-ins are calmer on days you finish the morning reset. The evening is
           still undefined. Next month: give the evening one fixed act."
CELEBRATE  Months unlocked: 2/12 appears in the footer of the Month widget (§7.2).
```

### PHASE II — COMPANION · Months 3–5 · *"Patterns are starting to form."*

#### MONTH 3 — ACTIVE USER (first Chapter)
```
SEAL ∘≋   DENSITY comfortable   VOICE Companion   GATE 200
UI STATE   FIRST VISIBLE LAYOUT SHIFT. Semantic stacks form: Time+Weather group;
           Check-in+Self-care group; Memory alone. The user feels the screen tighten.
UNLOCK     Pattern Insights widget · Cohort matching · QUARTER CHAPTER #1
SELF-CARE  First *adaptive* suggestion: routine timing shifts to when they actually
           complete things (not when they said they would).
MEMORY     CHAPTER 1 (2 paragraphs) — the first piece that references the previous
DELIVERY   Insights by name: "Months 1 and 2 were about mornings. Month 3 was the
           first month the evening held."
CELEBRATE  Ceremonial block (one-time, ~12 s): seal ∘≋ draws in. "Three months.
           You have reached Active User status."  (existing MONTH_MESSAGES[3])
```

#### MONTH 4 — THE PORTRAIT DEEPENS
```
SEAL ≈∘≈   DENSITY comfortable   VOICE Companion   GATE 310
UNLOCK     Mood Patterns widget · Archetype name appears (psychological profile v1)
UI STATE   Profile gains first line of identity: archetype + cohort.
MEMORY     "Your energy peaks late morning and dips Wednesday — every Wednesday this
DELIVERY   month. On the Wednesdays you journaled before noon, the dip was shallower.
           Journaling is acting as a pressure valve. Next month: protect Wednesday."
CELEBRATE  Archetype reveal inside the Month widget, not a modal.
```

#### MONTH 5 — CONSISTENCY
```
SEAL ∿—∿   DENSITY comfortable   VOICE Companion   GATE 430
UNLOCK     Custom theme (Level 5 gate satisfied by practice) · Intention History
UI STATE   The user can finally *restyle* the product — the reward for having an
           opinion about it.
SELF-CARE  Routine stacking: AI links two existing acts into one flow.
MEMORY     "Five months in, the mornings are automatic — you no longer need the
DELIVERY   prompt. The system has stopped asking about them. What it asks about now
           is what you avoid. Next month: one honest question per week."
           (This is the visible *compression*: the AI stops asking solved questions.)
CELEBRATE  The first question the user notices is *missing* — noted in the Insight.
```

### PHASE III — GUIDE · Months 6–8 · *"The journey is half-declared."*

#### MONTH 6 — THE HALF-TURN (Half-Year Mirror)
```
SEAL ○◐○   DENSITY compact   VOICE Guide   GATE 560
UI STATE   SECOND LAYOUT SHIFT. Dashboard clarity: sections distinct, tight stacks,
           badge row visible on System tab.
UNLOCK     Widget arrange (Level 10) · Narrative Reflection · HALF-YEAR MIRROR
SELF-CARE  AI shifts from "do this" to "here is what works for you": a personal
           routine list ranked by *their* completion + mood-lift data.
MEMORY     HALF-YEAR MIRROR — the first reflective piece that quotes the user to
DELIVERY   themselves: opens with their own Month-1 words next to this month's.
           "In month one you wrote 'tired, but fine.' Last week you wrote 'tired, and
            I know why.' That sentence is the half-year."
CELEBRATE  Ceremonial block, side-by-side then/now. Seal ○◐○. Phrase: "Half-declared."
```

#### MONTH 7 — LISTENING
```
SEAL ≈○≈   DENSITY compact   VOICE Guide   GATE 700
UNLOCK     Memory "Months:" view (full archive, newest first) · Export data (Level 25)
UI STATE   Memory widget gains its third label. History becomes browsable.
MEMORY     "You are most honest in the first ten minutes after waking and the last
DELIVERY   ten before sleep. The system has been listening to those windows. Next
           month: it will ask only in them."
```

#### MONTH 8 — RARE AIR
```
SEAL —○—   DENSITY compact   VOICE Guide   GATE 850
UNLOCK     Social mentions · Private spaces (opt-in)
UI STATE   The product opens outward — safely. Cohort connection with context.
MEMORY     "Eight months: your longest silence (4 days) came after a hard conversation,
DELIVERY   and you returned with the shortest entry of the year: three words. The
           system did not push. You came back on your own. That is the pattern."
```

### PHASE IV — MIRROR · Months 9–11 · *"The system has been listening."*

#### MONTH 9 — THE THIRD CHAPTER
```
SEAL ○∴○   DENSITY dense   VOICE Mirror   GATE 1000
UI STATE   THIRD LAYOUT SHIFT. Cockpit: minimal whitespace; log body in instrument
           readings (Cockpit Rule). The screen now looks like a tool, not a journal.
UNLOCK     Architect widget · Pattern correlations · CHAPTER #3
MEMORY     CHAPTER 3 names two cross-month patterns (e.g. "skipped self-care →
DELIVERY   longer journal entry, next day") and states which one the user can use.
```

#### MONTH 10 — CORRELATION
```
SEAL ○≈○   DENSITY dense   VOICE Mirror   GATE 1160
UNLOCK     Correlated Indexes (self-awareness / composite) become visible to the user
UI STATE   Numbers appear for the first time — only after the story has earned them.
MEMORY     "Your self-awareness score rose most in the months you wrote least. Fewer,
DELIVERY   truer entries. The system will now weight depth over count."
```

#### MONTH 11 — ONE MORE
```
SEAL ≋≋    DENSITY dense   VOICE Mirror   GATE 1330
UNLOCK     Portrait preview (draft of Month 12 Portrait, editable by the user)
UI STATE   The user co-authors: they may strike or confirm lines of the draft.
MEMORY     "Here is the draft of your year. Strike what is untrue."
DELIVERY   (Compression with consent: the user's edits become the highest-weight data.)
```

### PHASE V — OPERATOR · Month 12 · *"The portrait is complete — and still evolving."*

#### MONTH 12 — INSTRUMENT (Portrait & Seal)
```
SEAL ≋○≋   DENSITY instrument   VOICE Operator   GATE 1500
UI STATE   Maximum density. Every pixel justified. The screen the visitor sees at
           /u/machiavelli.
UNLOCK     Full LOT® AI · Story-Report API export · Portrait on public profile ·
           Quantum Cube delivery milestone (QI·46 Step 3.3) · Year-2 track begins (Seal ladder resets into a second, deeper tide)
SELF-CARE  The AI hands the routines back: "These are yours now." Suggestions become
           rare and exact.
MEMORY     THE PORTRAIT — one paragraph + one sentence Seal. Exemplar (live today on
DELIVERY   /u/machiavelli, from public-api.ts):
           "The art of governance is the art of understanding human nature. Every
            morning in the Palazzo Vecchio, I observe the citizens below — their
            patterns of movement, their exchanges, their quiet rebellions. The weather
            shapes their temperament: rain brings introspection, sun brings ambition.
            A prince must read both the skies and the souls beneath them."
CELEBRATE  Year-end ceremonial Block; 12 seals fan into one row; "One year with LOT.
           The portrait is complete — and still evolving." (EXISTS: MONTH_MESSAGES[12])
```

---

## 7. THE WIDGETS (UI specs, style-guide compliant)

All widgets: `<Block label="…:" blockView>`, regular weight, no emoji, periods
over symbols, opacity 90/60/40 hierarchy, 1400 ms fade, 3 s + 1.4 s dismissal.

### 7.1 Month Widget (upgrade of EXISTS `MonthlyPulseWidget`)

```
 ┌──────────────────────────────────────────────────┐
 │ Month 3:                                         │   <- label (click = cycle view)
 │                                                  │
 │ Three months. You have reached Active User       │   <- opacity-90
 │ status.                                          │
 │                                                  │
 │ ∘ ∘∘ ∘≋  · · · · · · · · ·                       │   <- seals earned, rest as dots
 │ Months unlocked: 3/12                            │   <- opacity-30 (existing style)
 └──────────────────────────────────────────────────┘
 Views via label click:  Month N:  ->  Insight:  ->  Practice:
```

- **`Insight:`** the Month Insight paragraph + provenance line (§5.2).
- **`Practice:`** `Journal 41 · Check-ins 58 · Self-care 77 · 214 / 310` — a gauge,
  never a streak-shame.

### 7.2 "Months unlocked: N/12" (the context widget S-2 proposed)

A context-based line, not a permanent block. Appears:
- inside the Month widget footer (always);
- as a one-line toast the moment a gate is crossed (reusing `EvolutionMilestoneToast`);
- on the public profile as `Months: 12/12 ≋○≋` (Usership badge row).

Pending variant (§3.4): `Months unlocked: 3/12 · Month 4 pending (74/110)`.

### 7.3 Memory Month Widget (the "paragraph-long insight from last month")

```
 ┌──────────────────────────────────────────────────┐
 │ Last month:                                      │
 │                                                  │
 │ Your energy peaks late morning and dips          │
 │ Wednesday. On the Wednesdays you journaled       │
 │ before noon, the dip was shallower. Journaling   │
 │ is acting as a pressure valve. Next month:       │
 │ protect Wednesday.                               │
 │                                                  │
 │ Built from 47 journal lines · 63 check-ins ·     │   <- opacity-40
 │ 91 self-care clicks.                             │
 └──────────────────────────────────────────────────┘
 Appears: first 7 days after month close, morning only. Then folds into Memory: Months.
```

### 7.4 Self-Care Guide strip (AI guidance function)

One button. One sentence of *why*. The label cycle `Self-care: → Why This: → Practice:`
already exists; the Voice ladder (§4.2) changes only the **copy** by month, not the
component. M1 "Begin." → M6 "Your best: 4-min reset." → M12 "Yours."

### 7.5 Ceremonial Block (quarter, half, year only — 4 times a year)

Same Block, larger copy, slower fade (2000 ms), seal glyph drawn in. Four times a
year is the **maximum**. Celebration that happens every day is wallpaper.

---

## 8. THE DEMO — MAKING `/u/machiavelli` A TIME-LAPSE

Today the demo is frozen at a very late state: `streak: 1469`, `answerCount: 2847`,
`noteCount: 1469`, `boardTenureMonths` computed from 1469 AD. That reads as
*four years of use* and breaks the "12-month evolved account" premise.

### 8.1 Proposed

1. **Month-12 reference numbers** (what a fully-practiced year looks like):

```
                         DEMO TODAY      MONTH-12 TARGET (honest year)
streak (longest)         1469            ~310
answers (Memory)         2847            ~1,100
journal entries (notes)  1469            ~330
active days              842             ~330
check-ins (morning)      —               ~300
self-care clicks         —               ~600
practiceScore            —               1,500 +
monthsUnlocked           —               12/12
seal                     —               ≋○≋
```

(Keep the Renaissance flavor in copy; only the *counts* need to match a year.)

2. **`/u/machiavelli?month=N` scrubber** — a prospective Usership buyer drags
   1 → 12 and watches the *same page* go breathable → instrument, widgets appear,
   seals accrue, the Memory Story changes from a 3-line mirror to the Portrait.
   This is the single most persuasive sales surface the product can have, and
   it needs no user data: twelve hardcoded states in `public-api.ts`.
3. Scrubber is Usership-agnostic (public) and clearly labelled **"Demo."**

### 8.2 Twelve demo states (data to author)

For each N: `density`, `visibleWidgets[]`, `sealCount`, `memoryStory` (use §6
Insights, with the Machiavelli voice), `counts{}`. Author once, store as a typed
constant.

---

## 9. IMPLEMENTATION MAP (what touches what)

| Phase | Work | File(s) | Size |
|-------|------|---------|------|
| A | `practiceScore` + `monthsUnlocked` derivation (pure fn, unit-testable) | new `src/shared/utils/monthIndex.ts`; consumed by client + server | S |
| A | MonthlyPulse reads `monthsUnlocked`; adds footer + pending state | `MonthlyPulseWidget.tsx` | S |
| B | Floor `visualRefinement` by month | `interfaceEvolution.ts` (`getLayoutDensity`) | S |
| B | Month-gated widget visibility on System tab | `System.tsx` | M |
| C | Month Insight generator (prev-Insight in prompt; 4 sections; provenance counts) | `story-generator.ts`, `monthly-summary.ts` | M |
| C | Persist Insights (user metadata JSON v1, table later) | `models/user.ts` metadata | S |
| C | Memory `Months:` view + Last-month widget | `MemoryWidget.tsx` + new widget | M |
| D | Seal glyphs on badge row + public profile | badge utils, `PublicProfile.tsx` | S |
| D | Demo scrubber + 12 states | `public-api.ts`, `PublicProfile.tsx` | M |
| E | Quarter/half/year Chapter generation + ceremonial Block | scheduled job + widget | M |

Suggested order: **A → C → D → B → E.** A+C deliver the user-visible *story*
(the S-2 priority) with no layout risk; D sells it; B/E polish it.

Build gate for each: `npm run client:build`, `npm run server:build` green before push
(Benchmark protocol). This session is docs-only.

---

## 10. RISKS AND GUARDRAILS

| Risk | Guardrail |
|------|-----------|
| Streak-shame, gamification pressure on a self-care product | Skips weigh 0; pending state has no loss language; longest streak only; COSMO Gate review before ship |
| Over-claiming AI insight | Provenance line on every Insight; hedge language when evidence is thin; user can strike lines (M11) |
| Practice gates exclude low-energy users | Gates are floor-level (≈1.3 → 5.7 PS/day); a user in `recovery` QOS mode gets a **hold**, not a miss (calendar still advances, PS needed halves) — PROPOSED, needs S-2 call |
| Density jump disorients | Density steps at M3/M6/M9/M12 only, with a one-time explanatory line; never decreases |
| LLM cost of monthly + chapter generation | Together AI primary (≈$0.88/M tokens): ~13 generations/user/year ≈ negligible |
| Privacy | Insights stored in LOT DB; providers stateless; export/delete; public display gated by existing `showMemoryStory` |
| Demo/real divergence | Demo states typed against the same `MonthIndex` interface |

---

## 11. SUCCESS METRICS (instrument readings, not vanity)

```
M1 retention to Month 2 unlocked      target: majority of paid starts
Median PS/day at M6                   target: 4.3 (gate-derived)
Insight read-rate (dismiss/open)      ≥ 70%
Insight "strike" rate (M11)           tracked; high = prompt quality problem
Churn at M3 / M6 / M12 anniversaries  compare vs pre-spec baseline
Demo scrubber -> Usership click       conversion of /u/machiavelli?month=N
```

---

## 12. HONEST LIMITS OF THIS SESSION

- **.MD coverage:** 379 files exist; the ~30 most relevant were read directly. The
  rest (assembly reports, 32 badge-codex versions, wiki v55–v87, session reports)
  were indexed and spot-checked, not read end-to-end. A grep for
  `12 month|twelve month|months unlocked` found **no month-by-month UI spec**, but
  did surface two existing anchors this file now honors: the QI·46 arc in
  `docs/corporate/LOT_QI46_ENGINE.md` / `About.tsx` (0–3 calibration, 3–6 pattern
  recognition, 6–12 coherence, 12+ Quantum Cube delivery) and the Usership term
  copy in `Settings.tsx` ("$99/month, 12 months"). See §4.3.
- **Gate numbers (§3.3), caps (§3.2) and Month-12 targets (§8.1) are PROPOSED**,
  not derived from cohort data. Tune before ship.
- **Sample Insights are tone copy**, not model output.
- **Nothing here was built or run.** Docs-only session; no code or build changes.
- I could not open `https://lot-systems.com/u/machiavelli` from this environment;
  the exemplar is taken from the hardcoded demo in `src/server/routes/public-api.ts`.
  The live page may have changed since that code was read.

## 13. DECISIONS NEEDED FROM S-2

1. Ship **dual gate** (Time AND Practice) or calendar-only with practice as a *bonus*?
2. Confirm PS weights (journal 3 / morning check-in 2 / self-care 2).
3. Reset Machiavelli counts to a "year" (§8.1) and add the `?month=N` scrubber?
4. Quarter/half/year **ceremonial** blocks: approve max-4-per-year rule?
5. QOS `recovery` mode = pace hold (compassion) — yes/no?

---

*Time opens the door. Practice walks through it. Memory proves it happened.*

**AUTHORIZED BY: S-2 // VADIK MARMELADOV**
