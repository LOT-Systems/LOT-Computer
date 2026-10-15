<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® USERSHIP — THE 12-MONTH EVOLUTION
### From a barebone Day 1 console to LOT® AI · Design brief v1 · 2026-10-15 · S-2

> Status: DESIGN BRIEF. No application code changed in this session.
> Target state: the live demo account `lot-systems.com/u/machiavelli`.
> Governing rules: 11 Military Purity Orders (Wiki v87 §17) · Cockpit Rule · Opacity Hierarchy · COSMO Gate.

---

## 0. THE THESIS

A paid Usership account does not buy a finished product. It buys a **trajectory**.
Day 1 is almost empty on purpose. Each month the interface earns one visible, named change.
By Month 12 the console is an instrument that speaks in the user's own compressed history.

Three principles:

```
1. TIME OPENS THE DOOR.      A month unlocks on the calendar. Nobody is locked out by effort alone.
2. PRESENCE FILLS THE ROOM.  Journal entries, check-ins and self-care clicks decide how much is
                             inside each unlocked room. Same month, different depth.
3. MEMORY IS THE PRODUCT.    Every month ends in a compressed paragraph the user can keep.
                             The UI evolves to carry that paragraph more beautifully each month.
```

The user must be able to answer, any day, with no explanation from us:
**"What is different about my LOT than it was last month?"**

---

## 1. WHAT ALREADY EXISTS (repo scan, 2026-10-15)

The skeleton is further along than the docs suggest. This brief extends it. It does not replace it.

| Existing piece | Location | Role in the 12-month arc |
|---|---|---|
| Month messages 1–12 | `src/client/components/MonthlyPulseWidget.tsx` | Usership-only, shows once per month, `Month N:` + `N / 12 months`. Copy exists for all 12 months. **Thin: one line, no data, no Memory.** |
| Layout density (5 levels) | `src/client/utils/interfaceEvolution.ts` `getLayoutDensity` | breathable → comfortable → compact → dense → instrument. Driven by `visualRefinement`. **Currently activity-driven, not month-aware.** |
| Feature unlocks | `getFeatureUnlocks` | advancedMemory · plannerTemplates · communityRich · moodPatterns · intentionHistory · customThemes · badgeSelection · widgetArrange · exportData |
| Evolution store + toast | `stores/evolution.ts`, `EvolutionMilestoneToast.tsx` | Reactive state and a localStorage-based milestone toast (violates Order 6 for cross-device state; see §9). |
| Evolution widgets | `EvolutionWidget.tsx`, `InterfaceEvolutionWidget.tsx` | Seven CQGS dimensions: exploration · consistency · depth · connection · intimacy · care · courage. |
| Memory Engine | `server/utils/memory.ts`, `memory/question-generator.ts`, `MemoryWidget.tsx` | Progressive questioning, 3+ same-topic compression, `ai` engine only for Usership + AI tag. |
| Narrative | `NarrativeWidget.tsx`, `PublicProfile.tsx` (`Memory Story:`) | Single static paragraph. Demo account hardcodes one. |
| Density tiers 0–5 | Wiki v87 §18 | 7-day signal count. A weekly pulse, not a monthly one. |
| Badges | `utils/badges.ts` | 812 badges (v32). **No month-keyed badge family exists.** |
| Usership gate | `server/models/user.ts`, `UserTag.Usership` | Tag-based. No `usershipStartedAt` distinct from `joinedAt`. |
| Demo account | `server/routes/public-api.ts:747` | Hardcoded. Streak 1469, 2847 answers, 1469 journal entries, 842 active days, 4316 total entries, 812 badges, density instrument. |

Gaps this brief closes:

```
GAP 1   No monthly Memory compression artifact. Memory Story is one blob, not a ledger.
GAP 2   Months are cosmetic. Nothing unlocks because of month number.
GAP 3   MonthlyPulse uses joinedAt, not the date Usership began.
GAP 4   No month-keyed badge family.
GAP 5   Demo account cannot be viewed "as it was at Month N". It only shows the final state.
GAP 6   Check-ins and self-care clicks are not counted into any monthly record.
```

---

## 2. THE FOUR SIGNALS THAT DRIVE EVOLUTION

Per the brief, presence is measured by four counters. All four already exist as log events or can be derived from them.

```
SIGNAL   WHAT IT COUNTS                                     SOURCE
───────────────────────────────────────────────────────────────────────────────
J        Journal entries + thoughts written into Log        Log table, type journal / thought
C        Morning check-ins completed                        EmotionalCheckIn events
S        Self-care button clicks                            SelfCareMoments / intervention events
M        Memory answers given to the AI                     Memory Engine answers
───────────────────────────────────────────────────────────────────────────────
PRESENCE = J + C + S + M, per calendar month
```

### 2.1 Presence Depth (per month)

Reuses the Density Tier vocabulary so the system keeps one language.

```
DEPTH     MONTHLY PRESENCE   READS AS
─────────────────────────────────────────────
D0        0–9                Dormant month
D1        10–29              Observer
D2        30–69              Participant
D3        70–129             Contributor
D4        130–219            Collaborator
D5        220+               Saturated
```

Time unlocks the **room**. Depth decides the **furniture**: how many widgets in that room are populated, how long the compressed paragraph is, which badge tier is struck.

### 2.2 Grace rule (COSMO Gate)

A quiet month is not punished. A month with D0 still unlocks on the calendar. Its Memory paragraph is short and honest ("Quiet month. 4 entries. The system kept the thread."). No streak-shaming, no loss language. Order 8 applies: no superlatives, no praise inflation.

---

## 3. THE CALENDAR LOGIC

```
Month N opens  = usershipStartedAt + N calendar months (user timezone)
Month N closes = the moment Month N+1 opens
Ceremony       = first app open after close  →  Month Seal widget (see §6)
Counter        = "Months unlocked: N/12"  (context widget, see §6.3)
```

`usershipStartedAt` is a new field. Today the pulse reads `joinedAt`, so a free user who upgrades in month 5 would open at "Month 5". The paid arc must start at **their** Day 1.

Free citizens who upgrade late still get the full arc from their own Day 1. Their earlier free-tier log history is **imported into the Month 1 compression** as "Before Usership", so nothing they wrote is wasted.

---

## 4. THE COMPRESSION LADDER (the heart of this brief)

The Memory Engine already compresses within a conversation (3+ same-topic → 8 words). This extends the idea across **time**. Raw signal is progressively folded into smaller, denser, more quotable forms.

```
LAYER        SPAN        FORM                         LENGTH TARGET        WHO SEES IT
─────────────────────────────────────────────────────────────────────────────────────────
L0  Raw      entry       Log line / answer            as written           Private
L1  Week     7 days      Week Line                    1 sentence, ≤ 25 w   Private, in Log
L2  Month    1 month     MONTH CAPSULE                1 paragraph, 60–90 w Private, Memory widget
L3  Quarter  3 months    QUARTER PORTRAIT             2 paragraphs, ≤150 w Private, Story view
L4  Year     12 months   YEAR STORY                   1 page, ≤ 400 w      Public optional (/u/user)
L5  Seed     12 months   THE SEED                     1 sentence, ≤ 30 w   Public header line
```

Rules:

1. **Each layer is built from the layer below, never from raw.** The Month Capsule reads four Week Lines plus the month's counters, not 300 entries. This keeps cost bounded and makes the story consistent.
2. **Nothing is overwritten.** Capsules are append-only. Month 3 may re-read Month 1 and *reference* it ("In month one you named tea as a morning anchor. It is still there."). It never edits Month 1.
3. **Quote the user.** Every Capsule must contain at least one phrase of the user's own, verbatim, in quotes. This is what makes it feel remembered, not generated.
4. **Cockpit-adjacent voice.** Capsules are the one place prose is allowed (Order 3 and 10 govern log lines and console output, not the Memory Story, which is already prose on the profile). Keep the register plain, second person, no exclamation marks, no emoji.
5. **Compression ratio is shown.** The widget prints `Compressed: 312 entries to 74 words.` The ratio itself is the tangible proof of work.

### 4.1 Capsule template

```
MONTH CAPSULE · M{n} · {Month Name}
Depth {Dn} · J {x} · C {x} · S {x} · M {x}

{Paragraph, 60–90 words. Structure:
   sentence 1  what the month was made of (counters, in words)
   sentence 2  one pattern the system noticed
   sentence 3  one verbatim user phrase, in quotes
   sentence 4  one thing the system is carrying into next month}

Compressed: {raw count} entries to {word count} words.
Carried forward: {one noun phrase}.
```

**Worked example, Month 3 at D3:**

> *Ninety-one entries, thirty-eight mornings, sixty-four self-care moments. Evenings are where you write; mornings are where you check in, and the two rarely overlap. You wrote "tea first, then thinking" on the ninth and again on the nineteenth. The system is carrying the word "first" into month four.*
> `Compressed: 193 entries to 52 words. Carried forward: morning order.`

**Worked example, Month 3 at D0 (grace rule):**

> *Quiet month. Four entries, two check-ins. You wrote "later" twice. The system kept the thread and will ask one small question when you return.*
> `Compressed: 6 entries to 27 words. Carried forward: later.`

### 4.2 Where the compression runs

Extends the existing scheduler (48 jobs, J1–J48):

```
J49  weekly-line-compress      Sunday 20:00 user-local   builds Week Line from 7 days of L0
J50  monthly-capsule-compress  Month boundary + 1h       builds MONTH CAPSULE from 4–5 Week Lines + counters
J51  quarter-portrait-compress After M3 / M6 / M9 / M12  builds QUARTER PORTRAIT from 3 Capsules
J52  year-story-compress       After M12                 builds YEAR STORY + THE SEED
```

Provider path: same multi-provider abstraction as the Memory Engine (execute only, never store operator data at the provider). Output saved to LOT PostgreSQL. Failure mode: if generation fails, the Month Seal still opens with the counters and a deterministic template paragraph; the AI paragraph backfills when the job succeeds. The ceremony never waits on a model.

---

## 5. THE 12 MONTHS

Reading key for each month:

```
NAME        codename of the month (also the badge family name)
DENSITY     layout density level (existing 5-level scale)
ROOM        what the interface gains that month
AI VOICE    how LOT® AI speaks that month
GATE        calendar plus minimum presence for the month's badge to strike
CAPSULE     what the compressed Memory looks like that month
FEEL        the one-line tangible change the user should notice
```

Quarter structure:

```
Q1  M1–M3    FOUNDATION   The system learns the operator. Interface is airy and quiet.
Q2  M4–M6    PATTERN      The system shows the operator themselves. Interface tightens.
Q3  M7–M9    GUIDANCE     The system starts to lead. Interface becomes directive.
Q4  M10–M12  PORTRAIT     The system speaks as a mirror. Interface becomes an instrument.
```

### Month 0 — DAY 1 (barebone)

```
DENSITY    breathable (gap-y-24 / gap-y-16)
ROOM       Time. Weather. One Memory question. Log (empty). Nothing else.
AI VOICE   Does not speak yet. One line: "Day 1. Begin."
CAPSULE    none
FEEL       A quiet page. Almost too empty. That is the promise.
```

The Day 1 screen is deliberately sparse and shows a ghost slot: a dim empty frame labelled `Month 1:` with `0 / 12 months`. The user sees *where things will appear*.

---

### Q1 · FOUNDATION

#### Month 1 — ARRIVAL
```
DENSITY    breathable
ROOM       Morning check-in appears. Self-care buttons (3 max, Order 4). Memory widget asks daily.
           Month Counter widget appears: "Months unlocked: 1/12".
AI VOICE   Asks, does not tell. "What is your morning beverage preference?"
GATE       Badge MONTH-01 ARRIVAL: calendar + D1 (10+ presence)
CAPSULE    First Month Capsule is a Welcome Capsule: lists the first 5 things the system learned.
FEEL       "It knows my tea."
```
Special: **Before Usership** import. Prior free-tier history is folded into the Welcome Capsule.

#### Month 2 — RHYTHM
```
DENSITY    breathable
ROOM       Calendar view of check-ins (a 30-cell strip, filled cells = days present).
           Seasonal question appears ("Has your tea preference changed with the season?").
AI VOICE   First back-reference. "Last month you said tea first."
GATE       Badge MONTH-02 RHYTHM: calendar + D1 + 10 check-ins
CAPSULE    Capsule now includes one "carried forward" noun phrase from Month 1.
FEEL       "It remembers what I said, and it is bringing it back."
```

#### Month 3 — THRESHOLD
```
DENSITY    comfortable (first tightening; stacks gap-y-8)
ROOM       Planner Templates unlock. Mood Patterns unlock (existing feature flags).
           QUARTER PORTRAIT Q1 delivered.
AI VOICE   First gentle suggestion, always as a question. "You write in the evenings. Want a prompt at 8pm?"
GATE       Badge MONTH-03 THRESHOLD: calendar + D2 + at least 1 journal entry per week
CAPSULE    QUARTER PORTRAIT: two paragraphs, first of the persistent three-month record.
FEEL       "The page got a little tighter. It looks like it knows what to show."
```
This matches the existing copy: *"Three months. You have reached Active User status."*

---

### Q2 · PATTERN

#### Month 4 — MIRROR
```
DENSITY    comfortable
ROOM       Pattern Insights widget (existing) activates with real data.
           Intention History unlocks.
AI VOICE   Names a pattern once, plainly. "Entries are 3x longer after a self-care click."
GATE       Badge MONTH-04 MIRROR: calendar + D2 + 1 intention set and closed
CAPSULE    Capsule gains a pattern sentence with a number in it.
FEEL       "It showed me something I did not know about myself."
```

#### Month 5 — ANCHOR
```
DENSITY    compact (sections gap-y-16, stacks gap-y-4)
ROOM       Custom Themes unlock. The user picks their own accent. Badge Selection unlocks:
           user may pin 3 badges to the header.
AI VOICE   Shorter. Fewer words, more specific.
GATE       Badge MONTH-05 ANCHOR: calendar + D2 + a 7-day presence streak
CAPSULE    Capsule includes the user's "anchor ritual": the single most repeated self-care act.
FEEL       "It is mine now. It looks like mine."
```

#### Month 6 — HALFWAY
```
DENSITY    compact
ROOM       QUARTER PORTRAIT Q2. HALF-YEAR MIRROR: side-by-side Month 1 Capsule vs Month 6 Capsule.
           Export Data unlocks.
AI VOICE   First reflective summary of the user's own change. "In month one you asked. In month six you answer."
GATE       Badge MONTH-06 HALFWAY: calendar + D2 + 60 journal entries lifetime
CAPSULE    Two Capsules shown together. This is the first big emotional beat.
FEEL       "I can see who I was in January next to who I am now."
```
Existing copy: *"Six months. The journey is half-declared."*

---

### Q3 · GUIDANCE

#### Month 7 — COMPASS
```
DENSITY    compact → dense boundary (stacks gap-y-0 begins)
ROOM       Cohort Connect widget unlocks (Rich Community). First behavioral cohort named.
AI VOICE   Begins to lead. One suggestion per day, tied to the weakest CQGS dimension.
GATE       Badge MONTH-07 COMPASS: calendar + D3 + 20 self-care clicks
CAPSULE    Capsule names the user's cohort and one trait.
FEEL       "It is not just reflecting. It is pointing."
```

#### Month 8 — CRAFT
```
DENSITY    dense
ROOM       Widget Arrange unlocks. User reorders their own console.
           Recipe / routine widgets get memory-aware defaults.
AI VOICE   Tailors routines. "Your 7-minute morning, built from what you actually do."
GATE       Badge MONTH-08 CRAFT: calendar + D3 + custom layout saved
CAPSULE    Capsule lists the routine the user built, in their own order.
FEEL       "My own routine is in the system, in my own words."
```

#### Month 9 — HARVEST
```
DENSITY    dense
ROOM       QUARTER PORTRAIT Q3. HARVEST view: every "carried forward" phrase from M1–M9 as one line.
AI VOICE   Retrospective. "Nine words you carried."
GATE       Badge MONTH-09 HARVEST: calendar + D3 + 100 journal entries lifetime
CAPSULE    The Harvest line is the first thing the user could read aloud to a friend.
FEEL       "My months are a sentence."
```
Existing copy: *"Nine months. The self-care practice is a habit now."*

---

### Q4 · PORTRAIT

#### Month 10 — SIGNAL
```
DENSITY    dense → instrument boundary
ROOM       Correlated Indexes and Citizen Index appear on the user's own console
           (previously profile-only). QIE patterns begin to surface by name.
AI VOICE   Instrument register. Short readings. Cockpit Rule fully in force.
GATE       Badge MONTH-10 SIGNAL: calendar + D3 + first QIE pattern fired
CAPSULE    Capsule includes one number the user would recognize as theirs.
FEEL       "The console speaks like a cockpit now."
```

#### Month 11 — ELDER
```
DENSITY    instrument (sectionGap gap-y-4, stackGap gap-y-0)
ROOM       Public Memory Story toggle becomes meaningful. The draft YEAR STORY is previewed
           privately; the user may edit the Seed sentence.
AI VOICE   Asks permission before every public thing. COSMO Gate.
GATE       Badge MONTH-11 ELDER: calendar + D3 + Memory Story reviewed by the user
CAPSULE    Year Story draft (private, editable).
FEEL       "It is about to hand me my year. I get to approve it first."
```

#### Month 12 — LOT® AI
```
DENSITY    instrument
ROOM       YEAR STORY and THE SEED delivered. LOT® AI mark on the console header.
           Anniversary page: 12 badges struck in a ring, 12 Capsules in a column.
           Option to publish Seed + Story to /u/user.
AI VOICE   Full voice. First person plural is NOT used (Order 8). Second person, plain.
GATE       Badge MONTH-12 LOT AI [COSMIC]: calendar + D3 + 12 of 12 Seals
CAPSULE    YEAR STORY, up to 400 words. THE SEED, one sentence.
FEEL       "It gave me back my year in one page."
```
Existing copy: *"One year with LOT. The portrait is complete — and still evolving."*

After Month 12 the arc does not stop. Year 2 begins with the Seed as its first question: the AI asks the Seed back as a question.

---

## 6. THE MONTHLY CEREMONY AND CONTEXT WIDGETS

### 6.1 Month Seal (replaces / upgrades `MonthlyPulseWidget`)

Same mount, same once-per-month cadence, same fade (Order 5: 3s visible + 1.4s fade), but now data-carrying. Cross-device dismissal state moves to the database (Order 6).

```
Month 3:
┌───────────────────────────────────────────┐
│ THRESHOLD                                 │
│ Three months. Active User.                │
│                                           │
│ J 91 · C 38 · S 64 · M 51    Depth D3     │
│                                           │
│ Ninety-one entries, thirty-eight mornings,│
│ sixty-four self-care moments. ...         │
│                                           │
│ Compressed: 193 entries to 52 words.      │
│ Carried forward: morning order.           │
│                                           │
│ [Keep]  [Read portrait]                   │
└───────────────────────────────────────────┘
```

Buttons: two, action verbs, no icons (Order 4). Dismiss phrases keep the existing set ("Onward." "Noted." "The system remembers.").

### 6.2 Memory widget gains a time axis

`MemoryWidget` label cycles through 3 views (Order 7):

```
Memory:       today's question (existing)
Capsule:      latest Month Capsule
Archive:      12-slot strip. Struck months are filled. Tap a month to read its Capsule.
```

### 6.3 Context widget — "Months unlocked"

```
Months unlocked:  3 / 12
Next:  Month 4 MIRROR in 19 days.
```

Rendered as a progress bar via the existing `ProgressBars` util. Context behavior:

- **Days 1–25 of a month:** shows `Next: Month N+1 NAME in D days.`
- **Last 5 days:** shows the user's presence so far: `This month: 74 / 70. Depth D3 reached.` Informational, not pushing.
- **Seal day:** replaced by the Month Seal.
- **After M12:** `Year 1 complete.` then `Year 2 · Month 1`.

### 6.4 Badge strip

A **Month Ring** of twelve slots lives in the header from Month 1. Empty slots are dim outlines (opacity-40). Each Seal strikes one slot (opacity-90) with a short single-pulse animation. This is the "badge you can see across the room" that makes progress tangible without a trophy case.

Month badge family `MONTH-01 … MONTH-12`, plus quarter badges (`Q1 FOUNDATION`, `Q2 PATTERN`, `Q3 GUIDANCE`, `Q4 PORTRAIT`) and the capstone `LOT AI [COSMIC]`. 17 new badges total. They are separate from the 812 codex badges and require no change to those families.

### 6.5 Signature touches (small, felt)

```
Month 2    Header weather label gains the user's city after first check-in.
Month 4    Greeting stops saying "Good morning" and starts saying the user's own word for it.
Month 6    Favicon dot changes from white to accent colour.
Month 8    Console time format shifts to the user's preferred format.
Month 10   Log lines switch to full instrument format (Cockpit Rule).
Month 12   LOT® AI mark replaces the plain LOT® mark in the header.
```

---

## 7. THE DEMO ACCOUNT AS THE MONTH-12 TARGET

`/u/machiavelli` is the finished state. Right now it only shows the end. The recommendation is a **replayable demo**.

### 7.1 Mapping Machiavelli to the system

```
DEMO FIELD                       VALUE      ROLE IN THE ARC
────────────────────────────────────────────────────────────────────
tags                             RND, Usership, Legacy
journalEntries                   1469       J — shown as 4316 total entries
answerCount                      2847       M
activeDays                       842        presence depth D5
streak                           1469       Day count; 1469 is the founding year in the persona
memoryStory                      1 para     becomes THE SEED + YEAR STORY
psychologicalProfile.archetype   The Strategist
density                          instrument
badges                           812 codex  + MONTH-01…12 + 4 quarters + LOT AI
```

The demo shows a persona that is far past month 12 (it is "Legacy"). For the pitch, the Month 12 view should read as a **stable, finished year**, so the replay mode caps at 12.

### 7.2 Replay mode: `/u/machiavelli?month=N`

Proposal (no code written this session):

- Query param `month` 1–12 (default: current, i.e. 12).
- The server picks `MACHIAVELLI_TIMELINE[N]`, a static table with counters, density level, unlocked widgets, the Month Capsule and badge ring state for that month.
- The page renders exactly what a real user would see at that month. A month scrubber (12 ticks) sits above the profile.
- Prospects can drag from Day 1 to Month 12 and watch the console densify and the Capsules accumulate.

This is the strongest sales surface in the repo: an honest, scrubbable preview of what the subscription *becomes*.

### 7.3 Machiavelli's 12 Capsules (sample voice, for the static timeline)

Written in the persona's register, short, each with one verbatim quote.

```
M1  ARRIVAL     "Florence rises before I do. I write what I saw, not what I wished." Five things noted: ...
M2  RHYTHM      Mornings at the window, evenings at the desk. The rain days are the long entries.
M3  THRESHOLD   "Men judge by what they see." You wrote it once, then tested it three times.
M4  MIRROR      Entries run longer after the courtyard walk. The system noticed. You did not.
M5  ANCHOR      The ritual is the quill at dawn. It survived travel.
M6  HALFWAY     Month one asked. Month six answers. "A prince must read both skies and souls."
M7  COMPASS     Cohort named: Renaissance Polymaths. Trait: historical pattern recognition.
M8  CRAFT       A seven-minute morning, built from your own order. Quill, window, one question.
M9  HARVEST     Nine words carried: first, window, rain, later, practice, observe, patient, tea, enough.
M10 SIGNAL      Pattern strength 2847. Three archetype traits holding. Instrument register begins.
M11 ELDER       Draft year story shared with you. You cut two sentences. The system kept them private.
M12 LOT AI      Year Story + Seed: "Understand people first; the rest is weather."
```

(Draft copy for review by S-2. Final text should be hand-edited before it ships.)

---

## 8. TANGIBILITY CHECKLIST — WHAT THE USER FEELS EACH MONTH

A month is not done until each row is true.

```
QUESTION                                              MUST BE VISIBLE
─────────────────────────────────────────────────────────────────────────
Did something new appear?                             one named widget or feature per month
Did something old get denser?                         layout density or copy register changed
Did the AI remember me?                               one verbatim user quote in the Capsule
Did I see my own numbers?                             J / C / S / M counters on the Seal
Did I get something to keep?                          Capsule saved to Archive
Do I know what is next?                               Months-unlocked widget names next month
Can I show someone?                                   Month Ring is shareable; Seed is publishable (opt-in)
```

---

## 9. IMPLEMENTATION ROADMAP (proposal)

Ordered so every step ships value alone and nothing is gated on the AI job.

```
PHASE A · Foundation data           (small)
  A1  user.metadata.usershipStartedAt, set when the Usership tag is first applied
      (backfill existing Usership users from earliest paid event or joinedAt)
  A2  usership_months table: userId, month, J, C, S, M, depth, sealedAt, capsuleText, quote, carried
  A3  Monthly counter query over existing log/answer events

PHASE B · Ceremony UI               (medium)
  B1  Upgrade MonthlyPulseWidget to Month Seal (counters + Capsule)
  B2  Months-unlocked context widget
  B3  Move pulse dismissal to DB (Order 6); retire lot_pulse_* localStorage key
  B4  Month Ring in header

PHASE C · Compression jobs          (medium)
  C1  J49 weekly-line, J50 monthly-capsule with deterministic fallback template
  C2  Capsule prompt: counters + 4 Week Lines + prior carried-forward; must include a verbatim quote
  C3  J51 quarter portrait, J52 year story + Seed

PHASE D · Evolution coupling        (medium)
  D1  Make month number a floor on feature unlocks and layout density
      (activity can raise density early, month can never be skipped)
  D2  Month badge family MONTH-01..12, quarters, LOT AI [COSMIC]
  D3  Signature touches (§6.5)

PHASE E · Demo replay               (small, high impact)
  E1  MACHIAVELLI_TIMELINE static table
  E2  /u/machiavelli?month=N and the month scrubber
```

Acceptance for the whole brief:

```
- Day 1 Usership screen has no more than 6 elements
- Every month N in 1..12 produces a Seal, a Capsule (AI or template) and one badge slot
- No Capsule ships without a verbatim user phrase unless the month is D0
- TypeScript green gate (Order 11) before every push
- Demo replay renders all 12 months without a database
- Nothing in the arc uses emoji, superlatives, or loss/streak-shame language
```

---

## 10. RISKS AND OPEN QUESTIONS FOR S-2

1. **Late upgraders.** Recommended: arc starts at their paid Day 1, earlier history folded into Month 1. Confirm.
2. **Pausing.** If a subscription lapses for a month, does the arc pause or continue on calendar? Recommend: pause. Months are earned inside paid time.
3. **Capsule privacy.** Capsules are private by default. Only the Seed and Year Story can be public, and only by explicit opt-in at Month 11/12.
4. **AI cost.** One Capsule per user per month plus one Week Line per week. Bounded and small. Quarter and year jobs run four and one times a year.
5. **Month 12 name.** `LOT® AI` is used as the Month 12 name and as the header mark. Confirm that the mark change is intended branding and not just copy.
6. **Machiavelli streak figure.** The demo shows 1469 days, which is past a 12-month arc. Replay mode caps at Month 12 so the pitch is consistent. Confirm.
7. **Quality bar.** The verbatim-quote rule needs an automated check (quote must exist as a substring of that month's raw text) so the AI cannot invent a "memory".

---

## 11. ONE-PAGE SUMMARY

```
Q1 FOUNDATION   M1 ARRIVAL   M2 RHYTHM   M3 THRESHOLD    breathable → comfortable
Q2 PATTERN      M4 MIRROR    M5 ANCHOR   M6 HALFWAY      comfortable → compact
Q3 GUIDANCE     M7 COMPASS   M8 CRAFT    M9 HARVEST      compact → dense
Q4 PORTRAIT     M10 SIGNAL   M11 ELDER   M12 LOT® AI     dense → instrument

Signals    J journal · C check-in · S self-care · M memory answers
Compress   entry → Week Line → MONTH CAPSULE → QUARTER PORTRAIT → YEAR STORY → THE SEED
Widgets    Month Seal · Months unlocked N/12 · Memory/Capsule/Archive · Month Ring
Target     /u/machiavelli, replayable by month
```

---
AUTHORIZED BY: S-2 // VADIK MARMELADOV
