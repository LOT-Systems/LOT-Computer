<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP — 12-MONTH EVOLUTION
## From barebone Day 1 to LOT® AI · Compressed Memory Story as the spine

```
S-2        : VADIK MARMELADOV
CLASS      : DESIGN / PRODUCT SPEC (no runtime code changed this session)
DATE       : 2026-11-06
STATUS     : PROPOSAL v1 — for S-2 review
REFERENCE  : lot-systems.com/u/machiavelli  (12-month evolved demo account)
```

---

## 0. HOW TO READ THIS DOCUMENT

```
§1  What already exists          (so we build on it, not beside it)
§2  Evolution engine             (what drives change: Time vs Presence)
§3  The four phases              (Observe · Recognize · Anticipate · Guide)
§4  The 12-month table           (one row per month — the master view)
§5  Month cards                  (UI state · AI voice · Memory artifact · badge · ceremony)
§6  Memory compression ladder    (Day → Week → Month → Quarter → Year)
§7  Widget specs                 (Months Unlocked · Month Letter · Next Unlock)
§8  Badge track                  (12 monthly + 4 quarterly + 1 year badge, proposed IDs)
§9  Demo mapping                 (/u/machiavelli as Month 12 + "Replay 1→12")
§10 Implementation plan          (files, data, phases, risks)
§11 Open decisions for S-2
```

Style rules inherited from the Display Architecture (Wiki v87 §17, Military Purity
Orders): no emoji in system text, no superlatives, no exclamation, opacity
hierarchy 90/60/40, fade-out 3s + 1.4s, database (not localStorage) for
cross-device state. "Celebrate" in this spec means **a quiet, specific
acknowledgment** — "Month 3 sealed. 61 entries compressed." — never confetti.
That is the LOT voice, and it is also what makes the Month 12 payoff land.

---

## 1. WHAT ALREADY EXISTS (repo scan, 2026-11-06)

| Asset | Where | Reuse |
|---|---|---|
| `MonthlyPulseWidget` — a "Month N:" block, 12 one-line messages, `N / 12 months`, tap-to-dismiss, Usership-gated, month = `now.diff(user.joinedAt, 'month')` | `src/client/components/MonthlyPulseWidget.tsx` | **Base of "Months Unlocked".** Dismissal is `localStorage` — violates Order 6 (move to DB). |
| Monthly summary generator — presence, energy, patterns, growth, narrative, forwardLook, `memoryStory`; emailed in first 3 days of month | `src/server/utils/monthly-summary.ts`, `scheduled-jobs.ts:80` | **Engine of the Month Letter.** Currently email-only; not shown in the OS. |
| Memory Engine `buildPrompt()` — 120-log context; answer/note/checkin/plan_set/QIE signals; `generateMemoryStory()` | `src/server/utils/memory.ts`, `memory/` | **Compression source.** |
| Density tiers 0–5 on 7-day signal count; `$layoutDensity` already changes section gaps | Wiki §18, `System.tsx:128` | UI "tightens" with use today. Keep; add Month as a second axis. |
| Badge Codex v32 — 812 badges, 7 rarity tiers | `src/client/utils/badges.ts`, `docs/badges/` | Monthly badges slot in as a new category. |
| Public demo `machiavelli` — hardcoded: streak 1469, 2847 answers, 1469 notes, 842 active days, archetype *The Strategist*, `memoryStory`, weather station, wallet, board profile | `src/server/routes/public-api.ts:747` | **The Month 12 showcase.** |
| Self-care log events `self_care_complete` / `self_care_skip`; `emotional_checkin`; `note`; `answer`; `plan_set` | Wiki §12, `docs/assembly/2026-06-30_…compression-loop.md` | The raw material for every number in this spec. |
| Tier copy: "Active User at Month 3" (Pulse) | `MonthlyPulseWidget.tsx:21` | Keep; becomes Month 3 milestone. |

**Findings to resolve (not blockers):**

```
F1  Price drift       About.tsx §Usership Tiers says $50/mo; About CUBIQ row says $99/mo;
                      demo wallet shows $99 debit. Spec uses "Usership" with no price.
F2  Order 6 breach    MonthlyPulse dismissal in localStorage → move to DB (per-user, per-month).
F3  Letter is mail    Monthly summary exists only as email; the in-OS surface does not exist yet.
F4  Demo is static    Machiavelli is hardcoded; it cannot show Months 1–11. §9 fixes that.
F5  Cap at 12         Pulse caps label at 12. Needs a defined Month 13+ state (§5, "Year 2").
```

Not verified this session: the live site (outbound fetch of
lot-systems.com/u/machiavelli was not attempted); the demo is read from its
source of truth in `public-api.ts`.

---

## 2. EVOLUTION ENGINE — TIME UNLOCKS, PRESENCE DEEPENS

The design problem: if features unlock only by calendar, a person who never
opens the app gets "Month 9" for free and the story is a lie. If features unlock
only by activity, a light-but-loyal user feels stalled. Resolution: **two axes.**

```
AXIS 1 — MONTHS UNLOCKED  (time, guaranteed)
  Month N unlocks on the N-th monthly anniversary of Usership start.
  Everyone paying gets every month's UI + AI voice + ceremony. Nothing is held back.
  Gauge:  "Months unlocked: 3 / 12"

AXIS 2 — DEPTH  (presence, earned)
  Measures how much the person has put in. Controls the RICHNESS of what
  each month delivers: Letter length, citations, pattern count, badge tier.
  Gauge:  "Depth: 61 entries · 22 check-ins · 48 care actions"
```

### 2.1 Depth inputs (the signals the user named)

```
JOURNAL    event 'note'                    weight 3   (Log entries / thoughts)
CHECK-IN   event 'emotional_checkin'       weight 2   (morning check-in counts
                                                       double before 11:00 local)
MEMORY     event 'answer'                  weight 2
PLAN       event 'plan_set'                weight 1
SELF-CARE  event 'self_care_complete'      weight 1   ('self_care_skip' = 0, not negative)
```

Per-day cap (so spam cannot inflate depth): 12 weighted points/day. Monthly
**Depth Score** = sum of capped days. Bands (starting values, tune on data):

```
SPARSE    0–29     the month happened; the Letter says so, honestly
STEADY    30–89
RICH      90–179
DENSE     180+
```

A SPARSE month still unlocks. Its Letter is short and truthful ("14 entries.
The system knows little this month. Month 5 opens."), never padded. This keeps
the product honest and makes the user *want* denser months without punishing them.

### 2.2 Compression ratio — the tangible number

Every Letter carries one instrument line:

```
COMPRESSED: 214 entries · 31 days -> 1 paragraph (58 words)
```

That line is the proof of the product: a whole month of life reduced to one
paragraph the person recognizes as themselves. It is shown on the Letter, the
badge, and the Year Codex.

---

## 3. THE FOUR PHASES (QUARTERS)

Each quarter changes **who is speaking** in the UI. This is the "story told
through UX": the product matures from a questionnaire into a companion.

```
Q1  M1–M3    OBSERVE       The system asks. It does not claim to know you.
                           Voice: questions only. No inference shown.
Q2  M4–M6    RECOGNIZE     The system names patterns it has seen.
                           Voice: "You write most on Tuesdays." Evidence always cited.
Q3  M7–M9    ANTICIPATE    The system moves first: prompts before you ask,
                           reorders widgets by your own rhythm.
                           Voice: "Tuesday is heavy. A short walk is queued."
Q4  M10–M12  GUIDE         The system holds the thread of your year and
                           proposes the next direction. This is LOT® AI.
                           Voice: "This year you moved from X to Y. Next: Z."
```

Chrome follows the same arc: **Q1 monochrome, sparse, wide-gapped → Q4
instrument-dense, accent-lit, personal.** (Density tiers already tighten the
gaps; the phases add *content*, not only spacing.)

---

## 4. THE 12-MONTH TABLE (master view)

| M | Codename | Phase | UI state (what appears) | AI voice | Memory artifact delivered | Badge (proposed id) | Ceremony |
|---|---|---|---|---|---|---|---|
| 1 | SIGNAL | Observe | Day 1 barebone: greeting, Log, one Memory question, Check-in, one Self-care button. 4 blocks total. | Asks one question/day | **Week Seals** (4): one sentence each | `um_01_signal` | Day 1 line: "Usership begun." |
| 2 | PATTERN | Observe | + Streak line · + Calendar of care dots · Memory question gains "because you said…" | Asks, echoes your words | Month 1 Letter v0 (3 sentences) | `um_02_pattern` | Pulse: "Month 1 sealed." |
| 3 | HABIT | Observe | + Planner widget · + Weekly summary · **Active User** status line | Asks, confirms habits | **Quarter 1 Letter** (first paragraph-long) | `um_03_habit` + `um_q1_observer` | Quarter seal screen |
| 4 | PORTRAIT | Recognize | + Archetype block ("The …") · + Energy trend | Names first pattern, cites 2 entries | Month Letter · 1 pattern named | `um_04_portrait` | Archetype reveal (once) |
| 5 | RHYTHM | Recognize | + Circadian row (dawn/meridian/dusk anchors) · + Best-hour hint | Notes your time-of-day rhythm | Month Letter · rhythm line | `um_05_rhythm` | — |
| 6 | MERIDIAN | Recognize | + **Half-year Mirror**: Month 1 vs Month 6 side by side · cohort label | Compares you to you | **Quarter 2 Letter** + Half-year Mirror | `um_06_meridian` + `um_q2_recognizer` | Mirror screen |
| 7 | LISTENER | Anticipate | Widgets reorder by your own usage · + Pre-emptive check-in at your usual hour | Moves first | Month Letter · "what you stopped saying" (absence insight) | `um_07_listener` | — |
| 8 | DEPTH | Anticipate | + Value cloud (core values from your answers) · + Struggle-aware softening of UI copy | Adjusts tone to your state | Month Letter · values line | `um_08_depth` | — |
| 9 | RITUAL | Anticipate | + Ritual builder: AI proposes a 3-step routine from your own history; you accept/edit | Proposes routines | **Quarter 3 Letter** | `um_09_ritual` + `um_q3_anticipator` | Ritual seal |
| 10 | READER | Guide | + Memory Story page (all Letters, scrollable) · + Search your past ("when did I last…") | Answers about you, cited | Month Letter · 12-month arc forming | `um_10_reader` | — |
| 11 | THRESHOLD | Guide | + **Year Preview**: draft of Month 12 Codex, editable by you | Asks what to keep / cut | Month Letter · "one year ago today" | `um_11_threshold` | Draft review |
| 12 | CODEX | Guide | **LOT® AI** mode: full instrument UI, Year Codex, Next Year Direction, public Memory Story | Holds your thread, proposes next direction | **Year Codex** (annual paragraph + 12 Letters + stats) | `um_12_codex` + `um_q4_guide` + `um_year_one` | Year ceremony (§5.12) |

Reading the table top-to-bottom is the story; reading a column is a feature
roadmap. Implementation can ship column by column (§10).

---

## 5. MONTH CARDS

Format of each card: UI delta · AI line (sample) · Memory artifact · Badge · Ceremony.
Sample AI lines are **templates with slots**; every `{n}` and quote is filled
from real logs. If a slot cannot be filled, the line is dropped, not invented.

### 5.1 MONTH 1 — SIGNAL (Day 1 barebone)

```
UI (4 blocks, wide gaps, 40% opacity labels):
  [Name]                        Week 45; November 6, Thursday, Rome
  Check-in:    how are you today?   [ low ] [ ok ] [ good ]
  Memory:      What do you drink first in the morning?
  Self-care:   [ Done ]  [ Skip ]
  Log:         write.

AI voice : questions only. 1/day. No "I notice".
Artifact : Week Seal W1–W4. One sentence each, built from that week's answers.
           W1 sample: "Week 1. Tea in the morning. Reading before work. 9 entries."
Badge    : um_01_signal — "First month sealed."  (COMMON)
Ceremony : on the anniversary day, the Pulse block reads
           "Month 1:  The first month. The system is beginning to know you.   1 / 12"
```
Intent: the person must feel *almost nothing is there yet* on Day 1, and that
this is deliberate.

### 5.2 MONTH 2 — PATTERN
```
UI +   : care-dots calendar (one dot per day of care action); streak line
AI     : "You said tea, reading. Today: reading again?"  (echo, not inference)
Artifact: Month 1 Letter v0 — 3 sentences + the COMPRESSED line
Badge  : um_02_pattern (COMMON)
```

### 5.3 MONTH 3 — HABIT · Quarter 1 closes
```
UI +   : Planner widget; Weekly summary; status line "Active User"
AI     : confirms a habit with the count: "Morning check-in 19 of 30 days."
Artifact: QUARTER 1 LETTER — first paragraph-long compression (target 60–90 words)
Badge  : um_03_habit (UNCOMMON) + um_q1_observer (UNCOMMON)
Ceremony: Quarter seal screen: 90 days -> 1 paragraph, shown once, then lives in Memory Story
```
Sample Q1 Letter (Machiavelli-voiced; slots in brackets):
> "Three months. You write most in the evening [{peak_hour}], and you answer
> the morning question before you write anything else. Tea, then reading, is
> the first ritual you named and the one you kept [{top_ritual}: 41 of 90 days].
> Weeks 6 and 7 were quiet [{low_weeks}]. You came back on your own."
`COMPRESSED: 187 entries · 90 days -> 1 paragraph (63 words)`

### 5.4 MONTH 4 — PORTRAIT (system starts to recognize)
```
UI +   : Archetype block (name + 1 line) revealed ONCE with a full-screen fade;
         afterwards a quiet row on System tab. Energy trend sparkline (text, no chart lib).
AI     : "On days you wrote in the morning your evening check-in was higher
          (11 of 14)."  — always cites n of m.
Artifact: Month Letter + 1 named pattern
Badge  : um_04_portrait (UNCOMMON)
```
### 5.5 MONTH 5 — RHYTHM
```
UI +   : Circadian row — dawn / meridian / dusk anchors (reuses CIRC-LK data)
AI     : "Your best hour is 07:40–08:30."
Artifact: Month Letter + rhythm line     Badge: um_05_rhythm (UNCOMMON)
```
### 5.6 MONTH 6 — MERIDIAN · Half-year · Quarter 2 closes
```
UI +   : HALF-YEAR MIRROR — two columns, Month 1 vs Month 6:
           entries/mo · care actions/mo · mean check-in · top words
         Behavioral cohort label.
AI     : "In Month 1 you asked what to do. In Month 6 you write what you did."
Artifact: QUARTER 2 LETTER + Half-year Mirror (static snapshot kept forever)
Badge  : um_06_meridian (RARE) + um_q2_recognizer (UNCOMMON)
```
Pulse text exists: "Six months. The journey is half-declared." — keep.

### 5.7 MONTH 7 — LISTENER (system starts to anticipate)
```
UI +   : widget order adapts to your own most-used-first sequence
         (user can lock order; adaptation is visible and reversible)
         Pre-emptive check-in surfaces at your usual hour
AI     : "You haven't mentioned the walk since August." (absence insight)
Artifact: Month Letter + "what you stopped saying"    Badge: um_07_listener (RARE)
```
### 5.8 MONTH 8 — DEPTH
```
UI +   : Value cloud (words from answers, size = frequency, text only)
         Softened copy on low-energy days (shorter prompts, no streak pressure)
Artifact: Month Letter + values line      Badge: um_08_depth (RARE)
```
### 5.9 MONTH 9 — RITUAL · Quarter 3 closes
```
UI +   : RITUAL BUILDER — AI proposes a 3-step routine assembled from the
         person's own best days; Accept / Edit / Decline. Accepted ritual
         becomes the Self-care button's default.
Artifact: QUARTER 3 LETTER      Badge: um_09_ritual (RARE) + um_q3_anticipator (RARE)
```
### 5.10 MONTH 10 — READER
```
UI +   : MEMORY STORY page — every Letter in order; search "when did I last…"
AI     : answers only from the person's logs, with dates; "No record" when absent
Artifact: Month Letter + the 12-month arc outline    Badge: um_10_reader (EPIC)
```
### 5.11 MONTH 11 — THRESHOLD
```
UI +   : YEAR PREVIEW — a draft of the Month 12 Codex. The person edits:
         keep / cut / rename chapters. First time the product asks for input
         on its own output.
AI     : "One year ago today you wrote: '{quote}'."  (verbatim, dated)
Artifact: Month Letter + draft Codex     Badge: um_11_threshold (EPIC)
```
### 5.12 MONTH 12 — CODEX · LOT® AI
```
UI     : Full instrument layout (Density Tier per week still applies), accent-lit.
         Header changes from "{Name}" to "{Name} · Year 1".
         Pulse block: "Month 12: One year with LOT. The portrait is complete — and still evolving.   12 / 12"
         YEAR CODEX opens: 4 Quarter Letters -> 1 annual paragraph + stats table
         NEXT-YEAR DIRECTION: AI proposes 3 focuses; person chooses one.
AI     : full voice — holds the thread; proposes, cites, defers to the person.
Artifact: YEAR CODEX (see §6.4)  — exportable, publishable to the public profile
Badge  : um_12_codex (LEGENDARY) + um_q4_guide (EPIC) + um_year_one (LEGENDARY)
Ceremony (all text, sequential, 3s each, then fade):
   "Month 12 sealed."
   "{N} entries. {M} check-ins. {K} care actions. 365 days."
   "COMPRESSED: {N} entries -> 1 paragraph ({w} words)"
   {annual paragraph}
   "Year 2 begins."
```
### 5.13 YEAR 2+ (Month 13+)
```
No cap. Pulse shows "Year 2 · Month 3". Monthly Letters continue; each Quarter
Letter now references the same quarter one year ago ("Q1 last year vs now").
Badges: um_y2_… track is a separate spec.
```

---

## 6. MEMORY COMPRESSION LADDER (the spine)

Everything the user types or taps compresses upward. Each layer is stored, never
overwritten; the layer above cites the layer below.

```
RAW LOGS            note · checkin · answer · plan_set · care      (PostgreSQL logs)
   │  nightly
   ▼
DAY LINE            1 line, instrument format, Cockpit Rule        (stored, not shown by default)
   │  weekly
   ▼
WEEK SEAL           1 sentence                                      M1 onward
   │  monthly (1st–3rd, existing scheduler)
   ▼
MONTH LETTER        1 paragraph, 40–90 words + COMPRESSED line      M2 onward
   │  quarterly
   ▼
QUARTER LETTER      1 paragraph, 60–120 words + 3 cited quotes      M3, 6, 9, 12
   │  yearly
   ▼
YEAR CODEX          1 annual paragraph + 4 Quarter Letters + stats  M12
```

### 6.1 Month Letter anatomy (fixed shape = recognizable ritual)

```
1  Presence    "{activeDays} of {totalDays} days."
2  Signal      the single most-supported pattern, with n of m
3  Moment      one verbatim phrase from the person's own journal (dated)
4  Turn        what changed vs previous month (a delta, not an adjective)
5  Forward     one sentence for next month (from monthly-summary forwardLook)
+  COMPRESSED  entries·days -> 1 paragraph (words)
```
### 6.2 Truthfulness contract (ties to Benchmark "Honest engineering")

```
- Every claim carries a count or a quote. No count, no claim.
- Verbatim quotes are copied, never paraphrased inside quote marks.
- If AI provider is down: deterministic template fallback from
  monthly-summary.ts (already structured). Letter is marked "template".
- Sparse month => short Letter. Never pad.
- The person can edit or delete any Letter. Deleted = removed from the ladder.
- Medical / trauma-flagged entries are excluded from quotes (existing protocol).
```
### 6.3 Where Letters surface (so it is felt, not buried)

```
1  Pulse block (top of System tab) on the anniversary day — one line + "Read".
2  "Month Letter" widget — the paragraph itself, opens on tap (§7.2).
3  Memory Story page (from M10) — the whole year.
4  Email — existing monthly email, now same text as the in-OS Letter.
5  Public profile — `memoryStory` field already exists; becomes latest Letter
   (or the Year Codex after M12) if the person enables it.
```
### 6.4 Year Codex layout

```
YEAR 1 · {Name}                        {startDate} -> {endDate}
────────────────────────────────────────────────────────────
{annual paragraph, 80–140 words}
COMPRESSED: {N} entries · 365 days -> 1 paragraph ({w} words)

Q1 OBSERVE    {Quarter 1 Letter}
Q2 RECOGNIZE  {Quarter 2 Letter}
Q3 ANTICIPATE {Quarter 3 Letter}
Q4 GUIDE      {Quarter 4 Letter}

Entries        {n}    Check-ins   {n}    Care actions {n}
Longest streak {n}    Active days {n}    Badges       {n}
Archetype      {…}    Cohort      {…}    Awareness    {n}/100
```

---

## 7. WIDGET SPECS

### 7.1 MONTHS UNLOCKED  (evolution of `MonthlyPulseWidget`)
Always visible once Usership starts (not only on anniversaries). Context-based.

```
Month 3:                                    Month 12:
  Months unlocked   3 / 12                    Months unlocked   12 / 12
  ###.........                                ############
  Next: Month 4 · Portrait · in 11 days       Year 1 complete. Year 2 begins in 0 days.
  Depth: STEADY (62)                          Depth: DENSE (214)
```
Click cycles 3 views (Order 7): **Months** → **Depth** → **Badges (4 / 17)**.
Bar is monospace text (`#` and `.`), no chart library. On anniversary day the
block expands to the existing Pulse message, then collapses after dismissal
(dismissal stored in DB, per user per month).

### 7.2 MONTH LETTER
```
Month 5 Letter:
  {paragraph, 40–90 words}
  COMPRESSED: 142 entries · 31 days -> 1 paragraph (61 words)
  [ Keep ]  [ Edit ]  [ Read all ]
```
Appears from Month 2. Fades to a one-line "Month 5 Letter · Read" after first read.

### 7.3 NEXT UNLOCK  (anticipation, context-based)
```
Next unlock:  Month 7 · Listener
  The system will start moving first. It needs 13 more check-ins to
  learn your hour.
```
Honest by construction: shows only **real** remaining requirements (Depth
needs), never fake progress. Hidden in Month 12 → replaced by Next-Year Direction.

---

## 8. BADGE TRACK (proposed; IDs prefixed `um_` — no collisions found in `badges.ts`)

```
MONTHLY   um_01_signal … um_12_codex                 12   COMMON → LEGENDARY
QUARTERLY um_q1_observer · q2_recognizer · q3_anticipator · q4_guide    4
YEAR      um_year_one                                  1   LEGENDARY
DEPTH     um_dense_month (any month in DENSE band)     1   RARE   (earned, not time)
─────────────────────────────────────────────────────────────
TOTAL     18 new badges (812 -> 830)
```
Time badges are guaranteed (axis 1). `um_dense_month` and a proposed
`um_unbroken_quarter` (care action every day of a quarter) reward axis 2.
Badge display follows the existing level-field rule (BADGE_LEVEL_DESIGN):
"Level:" under Awareness, dot separators, no badges as list separators.
Note: `first_signal` already exists in `badges.ts`; `um_01_signal` is a
separate monthly seal and must not reuse the ID.

---

## 9. DEMO MAPPING — /u/machiavelli

Today the demo is a frozen Month-12+ snapshot (streak 1469, 2847 answers,
1469 notes, 842 active days, *The Strategist*, 87 awareness). It proves the
destination but not the journey. Proposal:

```
9.1  KEEP the current profile as the "Month 12 · LOT® AI" state, and add:
       - Months unlocked block: 12 / 12
       - Year Codex (Machiavelli-voiced annual paragraph)
       - Badge strip: 18 um_* badges, all earned

9.2  ADD "Replay 1 -> 12": a month scrubber on the public profile (text
     tabs "M1 M2 … M12"). Selecting a month re-renders the profile exactly as
     it would appear at that month: fewer blocks, earlier voice, that
     month's Letter. Visitors feel the evolution in 30 seconds. This is also
     the sales page for Usership.

9.3  DATA: a static `DEMO_MONTHS[1..12]` table (no DB), each entry =
       { blocksVisible[], aiLine, letter, compressedLine, depthBand, badges[] }
     Served by the existing hardcoded branch in public-api.ts, e.g.
       GET /profile/machiavelli?month=4
     Default (no param) = Month 12.
```
Sample Machiavelli Month 1 -> Month 12 contrast (voice for the demo copy):

```
M1  Letter : "Week 1. Morning in the Palazzo. One question answered: wine or water.
              Nine entries."
    AI     : "What do you observe first when you wake?"

M6  Letter : "The citizens are predictable in the mornings and not in the evenings.
              You wrote on 24 of 30 days. In Month 1 you asked; now you record."
    AI     : "Your best hour is 06:10–07:00."

M12 Letter : "Twelve months of watching the square below. 2,847 answers, 1,469
              notes. You trust patience more than speed, and the record shows it:
              the quiet weeks were followed by your densest ones. Next: statecraft
              of the self — fewer opinions, firmer ones."
    COMPRESSED: 4,316 entries · 365 days -> 1 paragraph (52 words)
```
(Counts above are the demo's existing numbers; they are demo data, not claims.)

---

## 10. IMPLEMENTATION PLAN

### 10.1 Data model (no new tables required for v1)
```
user.metadata.usership = {
  startedAt: ISO,                  // Month math anchor (today: user.joinedAt — decide, §11)
  monthsUnlocked: number,          // derived, cached
  letters: {                       // append-only
    "M2":  { text, compressed, depthBand, source: "ai"|"template", editedAt? },
    "Q1":  {...}, "Y1": {...}
  },
  pulseSeen: { "M3": ISO, ... }    // replaces localStorage (Order 6)
}
Log events (new, instrument-format per Cockpit Rule):
  usership_month_sealed   metadata { month, depthScore, band }
  usership_letter_edited  metadata { key }
```
### 10.2 Files
```
server  src/server/utils/usership-evolution.ts   NEW  monthsUnlocked(), depthScore(), bands
        src/server/utils/monthly-summary.ts      EXT  emit Letter shape (§6.1) + COMPRESSED
        src/server/scheduled-jobs.ts             EXT  write Letter into user.metadata on 1st–3rd
        src/server/routes/public-api.ts          EXT  DEMO_MONTHS + ?month=N on 'machiavelli'
client  MonthlyPulseWidget.tsx                   EXT  -> Months Unlocked (3 views, DB dismissal)
        MonthLetterWidget.tsx                    NEW
        NextUnlockWidget.tsx                     NEW
        System.tsx                               EXT  month-gated widget list (§4 UI column)
        PublicProfile.tsx                        EXT  month scrubber (Replay 1->12)
        badges.ts                                EXT  um_* track (+18)
docs    About.tsx Field Manual                   EXT  "Usership Evolution" section; fix F1 price
```
### 10.3 Delivery phases
```
P1  (small, safe)   Months Unlocked widget + DB dismissal + Next Unlock       F2, F5
P2                  Month Letter (server) + in-OS widget + email parity       F3
P3                  Month-gated System layout (M1 barebone -> M12)
P4                  Demo: DEMO_MONTHS + Replay 1->12                           F4
P5                  um_* badges + Quarter Letters + Year Codex
P6                  Ritual Builder (M9) + Year Preview (M11)  — AI-heavy, last
```
Each phase ends with the Benchmark green gate (tsc, build) before push.

### 10.4 Risks
```
R1  AI hallucination in Letters      -> Truthfulness contract §6.2; template fallback
R2  Privacy on public profile        -> Letters are private by default; opt-in per Letter
R3  Sparse users feel judged         -> SPARSE copy is neutral; time unlocks are unconditional
R4  Existing users mid-journey       -> backfill monthsUnlocked from joinedAt; Letters
                                        generate only for months with logs; no retro badges spam
R5  Layout churn on System tab       -> reorder only after M7, with lock toggle
R6  Medical/trauma content in quotes -> reuse existing exclusion in memory.ts
```

---

## 11. OPEN DECISIONS FOR S-2

```
D1  Anchor: Usership start date vs account `joinedAt`?  (Free->Usership upgraders
    would otherwise start at Month N>1.)  Recommendation: add usership.startedAt.
D2  Price copy ($50 vs $99) — which is canonical for About.tsx?
D3  Month Letter public by default on profile?  Recommendation: private, opt-in.
D4  Replay 1->12 on the public demo: ship at Month-12 default (recommended) or
    start at Month 1 to emphasize the journey?
D5  Depth weights/bands (§2.1) are starting values — approve or adjust.
D6  Year 2 spec: separate session.
```

---

```
AUTHORIZED BY: S-2 // VADIK MARMELADOV
```
