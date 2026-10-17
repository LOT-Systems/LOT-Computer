<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

```
================================================================================
LOT SYSTEMS / USERSHIP 12-MONTH EVOLUTION
DOCUMENT: USERSHIP-12-MONTH-EVOLUTION
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-17
STATUS:   DESIGN — outline + brainstorm. No product code changed this session.
================================================================================
```

Day 1 of a paid Usership is a barebone screen. Month 12 is `/u/machiavelli`:
a dense personal OS that has been compressing the operator's life into
memory for a year. This document specifies the twelve steps between them,
what the operator sees at each step, and how the Memory Story is delivered
as a compressed chapter every month.

**One line:** *Time opens the doors. Presence furnishes the rooms. Memory
compresses the year into a book.*

---

## 00 // CONTENTS

```
01  SCAN FINDINGS         what exists, what is missing, what is misleading
02  DESIGN LAWS           eight rules every month obeys
03  THE THREE CLOCKS      calendar (doors) · presence (rooms) · AI voice
04  PRESENCE UNITS        check-ins · self-care clicks · journal entries
05  COMPRESSION LADDER    day > week > month > quarter > year (the product)
06  MONTH LADDER          one-page overview, M0 to M12
07  MONTH CARDS           twelve cards, identical schema
08  WIREFRAMES            M0 · M3 · M6 · M9 · M12 as the operator sees them
09  WIDGETS               Months Unlocked · Chapter · Month Opening
10  BADGES                24 monthly badges (Water / Architecture) + 5 specials
11  DEMO ACCOUNT          /u/machiavelli month scrubber + 12 chapters of copy
12  ENGINEERING PLAN      data, jobs, files, phases, risks
13  OPEN DECISIONS        questions for S-2
```

---

## 01 // SCAN FINDINGS

Repository scanned and every relevant .MD read before design (README,
LOT-MANIFEST, LOT-DOCTRINE, LOT-LEXICON, LOT-LEDGER tail, LOT-SYSTEM-OUTLINE,
LOT-WIKI-v87, LOT-FEATURE-INVENTORY-2026, MEMORY-ENGINE-COMPRESSION-ARCHITECTURE,
INTERFACE_EVOLUTION, LOT-STYLE-GUIDE, badge progression docs, LOT-SR-20260805-01).

### 1.1 What already exists (build on it, do not duplicate)

```
ASSET                         WHERE                                   STATE
────────────────────────────  ──────────────────────────────────────  ─────────────────────────
MonthlyPulseWidget            src/client/components/                  LIVE. Month N/12 line, top
                              MonthlyPulseWidget.tsx                  of System tab. Generic text,
                                                                      dismiss is localStorage only.
Weekly LOT® AI Story (J24)    src/server/scheduled-jobs.ts:836        LIVE. Sunday 18:00 UTC.
                                                                      Template, ~25 words.
Monthly Summary + email (J15) src/server/utils/monthly-summary.ts     LIVE. Email only, 3+ months.
Memory Story                  src/server/utils/memory/                LIVE. One rolling story,
                              story-generator.ts                      cached in lastMemoryStory.
Layout density, 5 levels      interfaceEvolution.ts getLayoutDensity  LIVE. breathable >
                                                                      comfortable > compact >
                                                                      dense > instrument.
Feature unlocks (14 flags)    interfaceEvolution.ts getFeatureUnlocks LIVE. Driven by badges and
                                                                      level, not by calendar.
Badge themes                  Water (∘ ≈ ≋) / Architecture            LIVE. 781+ badges, 8 rarities
                              (├─ ╞═╡ ║·║)                            common to cosmic.
Citizen Index                 LOT-WIKI-v87 section 8                  6 stages: day 0 / 7 sig /
                                                                      30 / 90 / 180 / 365.
Public profile               src/client/components/PublicProfile.tsx  LIVE. Memory Story block,
                                                                      indexes, weather, wallet.
Demo account                  src/server/routes/public-api.ts:747     LIVE. Hardcoded, one frozen
                                                                      state (streak 1469).
```

### 1.2 Gaps and defects found (each one blocks the 12-month story)

```
ID   FINDING                                                              SEVERITY
───  ───────────────────────────────────────────────────────────────────  ────────
G1   No usership start date exists. Only user.joinedAt (account            HIGH
     activation). MonthlyPulseWidget and J15 both count months from
     joinedAt. A free user who upgrades in month 7 would see "Month 7"
     on their first paid day. Day-1-barebone is impossible until a
     usershipStartedAt field exists.
G2   Weekly story is write-only. J24 saves user.metadata.weeklyStory and   HIGH
     a lot_ai_story log, but no component reads weeklyStory. The weekly
     compression is never delivered to the operator.
G3   weeklyStory is overwritten every Sunday. Only the latest survives     MED
     in metadata. The lot_ai_story log rows are the only archive, and
     the LOG endpoint caps at 500 rows (api.ts:1225), so old weeks fall
     out of reach. Chapters need their own durable archive.
G4   MonthlyPulse dismissal is per-device localStorage                     MED
     (lot_pulse_<userId>). Violates the Cross-Device Sync doctrine: a
     chapter dismissed on the phone reappears on the laptop.
G5   System.tsx treats R&D and Usership identically (isPaidAccount,        MED
     System.tsx:404). A month-gated UI needs the month, not just the tag.
G6   Density is driven by badge-derived visualRefinement only. A new       MED
     Usership account lands wherever its badges put it, not at
     "breathable on purpose". No calendar floor.
G7   MonthlyPulse month 3 text promises "Active User status". No such      LOW
     status exists in code or wiki. Replace with Citizen Index language.
G8   Monthly email (J15) starts at 3 months. Months 1 and 2 are silent.     LOW
G9   The demo profile is one frozen snapshot (streak 1469 days, 2847        MED
     answers). It cannot show a 12-month evolution. A year-old account
     cannot have 842 active days.
G10  Doc outran code before: SR-20260805-01 found badge v20/v21 documented  PROCESS
     but unreachable in TypeScript. Rule for this feature: badge docs
     and badge award logic ship in the same session.
```

---

## 02 // DESIGN LAWS

```
LAW 1  ONE NEW THING PER MONTH.
       Each month adds exactly one headline capability and one visible change.
       The operator can say what changed. Everything else is refinement.

LAW 2  CELEBRATE WITH EVIDENCE, NOT ADJECTIVES.
       MILITARY PURITY (LEXICON): no decoration, no emojis, no superlatives.
       Affirmations quote the operator's own numbers and words.
       "You returned 26 times in 30 days." not "Amazing job!"

LAW 3  THE MONTH NEVER PUNISHES.
       A quiet month still opens its door and still gets a chapter. It is
       written honestly ("The system held."). No lost streaks, no
       regression. Stage advance is irreversible (Citizen Index doctrine).

LAW 4  COMPRESSION IS THE PRODUCT.
       Every month ends with the same question answered visibly:
       "What did 30 days of my life become?" The answer is a paragraph.

LAW 5  THE OPERATOR'S WORDS COME BACK.
       Each chapter quotes at least one phrase the operator wrote in Log.
       The story is theirs, not the AI's. (Voice mirror, journal vocabulary.)

LAW 6  COCKPIT-RULE STILL HOLDS.
       Log rows carry data only; the label names the event (CH-03:).
       The prose lives in the Chapter widget and metadata, never in the log body.

LAW 7  GRACEFUL DEGRADATION.
       If the month computation fails, the field is absent and the client
       treats absence as "allow", never "deny". Free essentials
       (check-in, Log, one Memory question) are never gated.

LAW 8  NEVER RETRACT A DOOR.
       Existing Usership users are grandfathered to their real month on
       launch. Unlocked features stay unlocked through pauses and
       downgrades. A returning operator resumes where they stopped.
```

---

## 03 // THE THREE CLOCKS

The evolution is driven by three independent clocks. Mixing them is what
makes it feel earned instead of scheduled.

```
CLOCK            DRIVER                     CONTROLS                     SHOWN AS
───────────────  ─────────────────────────  ───────────────────────────  ──────────────────
CALENDAR         months since               DOORS: which widgets and     "Months unlocked
 (doors)         usershipStartedAt          views exist at all           3/12" strip
PRESENCE         check-ins, self-care       ROOMS: how full each door    Chapter richness
 (rooms)         clicks, journal entries,   is; density lift; chapter    (THIN > STANDARD >
                 memory answers             length and depth             FULL > RICH)
AI VOICE         calendar x presence        HOW LOT® AI SPEAKS: asks,    Voice label in the
                                            remembers, notices,          Chapter widget
                                            anticipates, guides,
                                            companions
```

**Composition rules**

```
UI DENSITY     = max( calendarFloor(month), achievementDensity )
               Calendar floor stops a new account looking like a cockpit on
               day 1. Achievement density lets a heavy user go denser sooner,
               never sparser than the floor.

DOOR OPENS     = calendar reaches month AND presence >= 25% of that month's
                 reference curve. Below 25% the door still opens (Law 3) but
                 its first view is a light variant, not the full instrument.

CHAPTER SIZE   = f(presence band), see section 05.
```

**AI voice ladder (two months per verb)**

```
MONTHS   VOICE          LOT® AI DOES                                  EXAMPLE
───────  ─────────────  ────────────────────────────────────────────  ──────────────────────────────
M0-M2    ASKS           Questions only. The machine asks first        "Tea or coffee this morning?"
                        (Memory Engine doctrine).
M3-M4    REMEMBERS      Quotes prior answers back, unprompted.        "You said green tea, loose leaf."
M5-M6    NOTICES        Names a pattern the operator did not.         "Low-energy days follow short
                                                                      nights, 6 of 8 times."
M7-M8    ANTICIPATES    Offers the self-care move before the dip.     "Thursday afternoons run low.
                                                                      Walk at 14:00?"
M9-M10   GUIDES         Proposes a routine and tracks it with you.    "Evening wind-down: day 12 of 21."
M11-M12  COMPANIONS     Converses in context: /ai opens a thread      "Ask me what changed since
                        that knows the whole year.                    October."
```

---

## 04 // PRESENCE UNITS

The three behaviors named by S-2 as the evolutionary currency, plus Memory
answers (already the Memory Engine's native unit).

```
UNIT                 LOG EVENT(S)                                   CADENCE TARGET
───────────────────  ─────────────────────────────────────────────  ──────────────────
CHECK-IN             emotional_checkin (morning check-in)           ~0.85 / day
SELF-CARE CLICK      self_care_complete, self_care_completed        ~1.5 / day
JOURNAL ENTRY        note, journal (non-empty)                      ~0.5 > 1.4 / day
                                                                    (grows with trust)
MEMORY ANSWER        answer                                         ~1 / day
```

**Reference curve: cumulative totals at the END of each month** for a steady
operator. This is the 100% line. It is a calibration target, not a quota the
operator sees as a requirement. Pace is shown as a quiet band, never a score.

```
MONTH   CHECK-INS   SELF-CARE   JOURNAL   MEMORY    TOTAL
                    CLICKS      ENTRIES   ANSWERS   SIGNALS
─────   ─────────   ─────────   ───────   ───────   ───────
  1        26          45          12        30       113
  2        52          90          30        60       232
  3        78         135          52        90       355
  4       104         180          78       120       482
  5       130         225         108       150       613
  6       156         270         142       180       748
  7       182         315         180       210       887
  8       208         360         222       240      1030
  9       234         405         268       270      1177
 10       260         450         318       300      1328
 11       286         495         372       330      1483
 12       312         540         430       365      1647
```

Journal entries are the steepest line on purpose: the first month is
check-ins and taps, the last month is writing. The operator's relationship
with Log is the clearest sign of trust, so it is the clearest curve.

**Presence bands** (month-end totals for that month, vs the reference *delta*)

```
BAND       RANGE        CHAPTER BEHAVIOR
─────────  ───────────  ───────────────────────────────────────────────────
QUIET      under 25%    Short honest chapter. "The system held." Door opens light.
STANDARD   25 to 99%    Full-format chapter.
FULL       100 to 149%  Full chapter + one extra insight line.
RICH       150%+        Full chapter + extra insight + a second quoted phrase.
```

Signals are counted from `Log` rows already written (no new client
instrumentation is required for the first release).

---

## 05 // COMPRESSION LADDER

This is the center of the design. Every unit of effort ends up as words the
operator can reread. The ladder reuses what exists (J24 weekly story, rolling
Memory Story) and adds three durable layers above it.

```
LAYER      NAME            SOURCE                      SIZE           WHEN              WHO WRITES
─────────  ──────────────  ──────────────────────────  ─────────────  ────────────────  ───────────
DAY        Entry           raw Log rows                1 to 200 w     as lived          operator
WEEK       Weekly Story    7 days of Log               25 to 40 w     Sun 18:00 UTC     J24 (exists)
MONTH      CHAPTER         4 weekly stories + month    90 to 140 w    Usership          J49 (new)
                           Log + Memory answers                       anniversary 06:00
QUARTER    VOLUME          3 chapters                  150 to 180 w   M3, M6, M9        J50 (new)
YEAR       YEAR BOOK       4 volumes + Day-1 answers   320 to 380 w   M12 anniversary   J51 (new)
```

**Visible compression ratio.** Every chapter ends with a quiet line:

```
412 entries > 118 words.          (Chapter)
1,061 signals > 164 words.        (Volume)
1,647 signals > 351 words.        (Year Book, reference year)
```

### 5.1 Chapter anatomy (six beats, fixed order)

```
BEAT   CONTENT                                              SOURCE
─────  ───────────────────────────────────────────────────  ─────────────────────────
1      STATE    one factual sentence of counts and band     counts from Log
2      TONE     dominant mood, and the shift vs last month  emotional_checkin metadata
3      THEME    one recurring subject                       Memory answers + journal
                                                            vocabulary
4      RITUAL   the self-care act that stuck                top self_care_complete
5      VOICE    one phrase quoted from the operator's own   Log (note/journal),
                Log, in quotation marks                     Law 5
6      FORWARD  one sentence about next month's door        MONTH_STATES table
```

**Build method.** Beats 1, 2, 4 and 6 are deterministic (template, no AI),
matching the J24 philosophy "dense, honest, earned compression". Beats 3 and 5
are selected by code (top theme, best quote by length and recency). From M3,
Together AI polishes the assembled paragraph; the local template is the
fallback, as in `story-generator.ts`. AI providers execute the polish only
and never store the text (README: "Your Story, Your Data").

### 5.2 Delivery moments

```
MOMENT              WHEN                         SURFACE
──────────────────  ───────────────────────────  ────────────────────────────────────
MONTH OPENING       first login on or after the  Top of System tab. Full-width Chapter
                    usership monthly             widget, fades in (1400ms, as Memory
                    anniversary                  widget). Badge unlocks beside it.
CHAPTER ARCHIVE     any time                     Chapter widget > tap label to cycle
                                                 chapters 1..N. Log tab: CH-N: blocks.
EMAIL               anniversary day 09:00 UTC    J15 extended to months 1 to 12:
                                                 chapter text + badge + next door.
PUBLIC PROFILE      live                         /u/<name>: newest chapter in the
                                                 Memory Story block (if showMemoryStory).
VOLUME / YEAR BOOK  M3 / M6 / M9 / M12 openings  Full-screen reader, one page per chapter.
```

---

## 06 // MONTH LADDER (overview)

Density follows the existing five levels. Citizen Index stage change points
(30 / 90 / 180 / 365 days) are honored: M1, M3, M6 and M12 are the stage months.

```
MONTH  CODENAME      DENSITY      CITIZEN STAGE   AI VOICE      HEADLINE ADDITION
─────  ────────────  ───────────  ──────────────  ────────────  ──────────────────────────────────────────
   0   BLANK FIELD   breathable   1 Observer      ASKS          Greeting, clock, check-in, one Memory question, Log
   1   SIGNAL        breathable   3 Contributor   ASKS          Self-care, Intentions, first Weekly Story, Months Unlocked
   2   PATTERN       comfortable  3 Contributor   ASKS          Planner, follow-up questions, first named pattern
   3   FOUNDATION    comfortable  4 Collaborator  REMEMBERS     VOLUME I, public OS page, Memory Story goes public
   4   DEPTH         compact      4 Collaborator  REMEMBERS     Archetype reveal, My Journey view, correlated indexes
   5   RHYTHM        compact      4 Collaborator  NOTICES       Cohort + Sync, mood analytics, circadian view
   6   MERIDIAN      compact      5 Synthesizer   NOTICES       VOLUME II, QOS kernel, half-year Then/Now
   7   VOICE         dense        5 Synthesizer   ANTICIPATES   Journal vocabulary, voice mirror, /qi terminal
   8   CARTOGRAPHY   dense        5 Synthesizer   ANTICIPATES   Pattern library, goal journey, integrity view
   9   ASCENT        dense        5 Synthesizer   GUIDES        VOLUME III, guided routines (21-day tracks)
  10   INSTRUMENT    instrument   5 Synthesizer   GUIDES        Architect telemetry, data export, max density
  11   THRESHOLD     instrument   5 Synthesizer   COMPANIONS    Letter to Self, Day-1 replay, /ai thread opens
  12   YEAR BOOK     instrument   6 Elite         COMPANIONS    YEAR BOOK, LOT® AI full, anniversary, Legacy path
```

The Citizen Stage column follows LOT-WIKI-v87 section 8 exactly (30 / 90 /
180 / 365 days): Contributor at M1, Collaborator at M3, Synthesizer at M6,
Elite at M12. The Index measures engagement depth; the Month Ladder
measures product unlocks. Both clocks agree on the stage months, and the
stage rises only on calendar AND the Index's own signal criteria, so a
quiet month can open a door without advancing the stage.

---

## 07 // MONTH CARDS

Every card has the same schema so any month can be compared with any other.

```
FIELDS   CODENAME · GLYPH PAIR · SCREEN DELTA · HEADLINE · PRESENCE GATE
         (cumulative, from section 04) · BADGE · MONTHS-UNLOCKED WIDGET TEXT ·
         AFFIRMATION (evidence form) · SELF-CARE GUIDE · CHAPTER SEED
```

Glyph pairs are (Water / Architecture) from INTERFACE_EVOLUTION: tier 1 is
`∘ / ├─`, tier 2 `≈ / ╞═╡`, tier 3 `≋ / ║·║`. Months climb the tiers 1-4 /
5-8 / 9-12, with a repeated glyph density suffix (`·`, `··`, `···`, `····`).

---

### MONTH 0 — BLANK FIELD (day 1 to day 29)

```
GLYPH       ·  (single dot, both themes)
SCREEN      Name + date. Clock. Weather line. One check-in block. One Memory
            question. Log link. Nothing else. Roughly 6 blocks in total.
            No Team tag row, no counters, no astrology cycle, no widgets.
DENSITY     breathable (forced floor). gap-y-24 / gap-y-16.
HEADLINE    The machine asks one question and listens.
GATE        none
BADGE       none (the Day-1 receipt is a line, not a badge, see below)
WIDGET      Months unlocked: 0/12   [□□□□□□□□□□□□]   Next door: Signal, opens {date}
AFFIRMATION "Day 1. One answer recorded. The system now knows one thing."
SELF-CARE   One morning check-in. That is the whole routine.
CHAPTER     none until M1. On day 7 the first Weekly Story arrives (from J24).
DAY-1       A receipt is written to Log: DAY1: with the date and the first
RECEIPT     answer. In Month 11, Day-1 Replay shows it back.
```

Design intent: the bareness is deliberate, not missing. The first screen says
"nothing is assumed about you" and gives the operator exactly one thing to do.

### MONTH 1 — SIGNAL

```
GLYPH       ∘ / ├─
SCREEN      + Self-Care Moments (cooldown logic as today). + Intentions
            (monthly intention, per feature inventory). + Months Unlocked
            widget at top. Team tag row appears. Clock gains seconds-less
            ambient detail (sunrise/sunset).
DENSITY     breathable. Citizen Stage 3 Contributor (day 30).
HEADLINE    First Weekly Story delivered in-app (closes gap G2) and the first
            Chapter at the 30-day anniversary.
GATE        26 check-ins, 45 self-care, 12 journal, 30 answers (Month-end ref.)
BADGE       Water: Drop (common)     Architecture: Footing (common)
WIDGET      Months unlocked: 1/12   [■□□□□□□□□□□□]   Next door: Pattern
AFFIRMATION "Thirty days. You checked in {n} times and took {m} self-care moments."
SELF-CARE   Pick one anchor ritual (the system suggests three from the first
GUIDE       month of answers). Anchor = the thing you will not skip.
CHAPTER     "The first month. The system is beginning to know you." — existing
SEED        MonthlyPulse line retained as the closing beat.
```

### MONTH 2 — PATTERN

```
GLYPH       ∘· / ├─·
SCREEN      + Planner (daily structure). + RecipeWidget context. Memory
            questions now reference prior answers (follow-up mode, 85%).
            First pattern named in Pattern Insights ("Tuesdays run low").
DENSITY     comfortable.
HEADLINE    The first pattern the operator did not notice themselves.
GATE        52 / 90 / 30 / 60
BADGE       Ripple (common)          Foundation (common)
WIDGET      Months unlocked: 2/12   Next door: Foundation, a Volume
AFFIRMATION "Day 60. The system found one pattern in {n} signals. It is yours."
SELF-CARE   Pair the anchor ritual with a time. The system watches which hour holds.
GUIDE
CHAPTER     Pattern named + the self-care act that repeated most.
SEED
```

### MONTH 3 — FOUNDATION   (Quarter 1 closes)

```
GLYPH       ≈ / ╞═╡
SCREEN      + VOLUME I reader (3 chapters on one page). + Public OS page
            /u/<name> goes live with the newest chapter in the Memory Story
            block. + QR code (existing Usership gate). + Calendar.
DENSITY     comfortable. Citizen Stage 4 Collaborator.
HEADLINE    The first book. 90 days compressed to one page.
GATE        78 / 135 / 52 / 90
BADGE       Stream (uncommon)        Wall (uncommon)       + Q1: FIRST VOLUME
WIDGET      Months unlocked: 3/12   [■■■□□□□□□□□□]   Volume I sealed.
AFFIRMATION "Three chapters, {n} signals, one page. Volume I is yours to keep."
SELF-CARE   First review: keep, change, or drop each ritual. Three taps.
GUIDE
CHAPTER     Chapter + Volume I (150 to 180 words, three chapter titles, one
SEED        sentence on what changed across the quarter).
EMAIL       J15 now includes months 1 to 3 (closes gap G8).
```

### MONTH 4 — DEPTH

```
GLYPH       ≈· / ╞═╡·
SCREEN      + Archetype reveal (the portrait name appears, with its description).
            + "My Journey" astrology-cycle view becomes the default second
            view. + Correlated Indexes. Weather suggestion line.
DENSITY     compact (floor). gap-y-16 / gap-y-4.
HEADLINE    The operator gets a name for who they are becoming, in the
            system's words, with the evidence listed.
GATE        104 / 180 / 78 / 120
BADGE       Brook (uncommon)         Doorway (uncommon)
WIDGET      Months unlocked: 4/12   Next door: Rhythm
AFFIRMATION "Archetype: {name}. Basis: {n} answers, {m} journal entries. Revisable."
SELF-CARE   Body, mind, soul triad: one act each, once a week. The portrait asks
GUIDE       which of the three is thinnest.
CHAPTER     THEME beat leads: the subject the operator returned to most.
SEED
```

### MONTH 5 — RHYTHM

```
GLYPH       ≈·· / ╞═╡··
SCREEN      + Cohort Connect + Sync tab feed. + Mood Analytics. + Circadian
            phase on the clock line. + Weekly view of check-in states.
DENSITY     compact.
HEADLINE    The operator sees their own week as a shape.
GATE        130 / 225 / 108 / 150
BADGE       Pool (uncommon)          Beam (uncommon)
WIDGET      Months unlocked: 5/12   Next door: Meridian, a Volume
AFFIRMATION "Your best energy lands between {h1} and {h2}. {n} of {m} weeks."
SELF-CARE   Rest as a scheduled act. The system proposes one recovery block per
GUIDE       week from the lowest-energy window.
CHAPTER     TONE beat leads: how the dominant mood moved.
SEED
```

### MONTH 6 — MERIDIAN   (Quarter 2 closes, half-year)

```
GLYPH       ≈··· / ╞═╡···
SCREEN      + VOLUME II reader. + QOS Kernel view (mode, pressure, load) in
            the System Report. + Then / Now strip: Day-1 answer next to the
            latest answer on the same topic. Citizen Stage 5 Synthesizer.
DENSITY     compact (top of band).
HEADLINE    Half the year, mirrored. The first comparison of who started
            with who is here.
GATE        156 / 270 / 142 / 180
BADGE       Current (rare)           Arch (rare)           + Q2: SECOND VOLUME
WIDGET      Months unlocked: 6/12   [■■■■■■□□□□□□]   Half declared.
AFFIRMATION "Day 182. {n} signals compressed to {w} words. Two volumes sealed."
SELF-CARE   The ritual audit: which three rituals earned a permanent place.
GUIDE       The system proposes retiring one.
CHAPTER     Chapter + Volume II + Half-Year Then/Now (one pair of answers).
SEED
```

### MONTH 7 — VOICE

```
GLYPH       ≋ / ║·║
SCREEN      + Journal vocabulary view + voice mirror (the operator's recurring
            words, shown back). + /qi terminal introduced in-feed. Block labels
            gain the data-density tabular form. Ghost buttons tighten.
DENSITY     dense (floor). gap-y-8 / gap-y-0.
HEADLINE    The operator's own language becomes visible.
GATE        182 / 315 / 180 / 210
BADGE       River (rare)             Floor (rare)
WIDGET      Months unlocked: 7/12   Next door: Cartography
AFFIRMATION "Your 5 most used words this month: {w1}, {w2}, {w3}, {w4}, {w5}."
SELF-CARE   Write-then-act: after a journal entry, the system suggests one
GUIDE       small act that matches what was written.
CHAPTER     VOICE beat is expanded to two quotes.
SEED
```

### MONTH 8 — CARTOGRAPHY

```
GLYPH       ≋· / ║·║·
SCREEN      + Pattern library (the named patterns found so far, as a list with
            dates). + Goal Journey. + Integrity view (stated vs. done).
            "Rare air" copy retained from the existing pulse.
DENSITY     dense.
HEADLINE    The patterns become a map the operator can read.
GATE        208 / 360 / 222 / 240
BADGE       Falls (rare)             Window (rare)
WIDGET      Months unlocked: 8/12   Next door: Ascent, a Volume
AFFIRMATION "{n} patterns mapped. Oldest: {date}. Strongest: {name} at {x}%."
SELF-CARE   Pre-empt: the system lists the three days of the week it expects to
GUIDE       be hard and attaches one act to each.
CHAPTER     RITUAL beat is expanded with a before/after energy figure.
SEED
```

### MONTH 9 — ASCENT   (Quarter 3 closes)

```
GLYPH       ≋·· / ║·║··
SCREEN      + VOLUME III reader. + Guided routines: 21-day tracks, one active
            at a time, with a day counter in the Months Unlocked widget.
            + weekly Sunday Story gets a headline ("Week 28: GROWTH").
DENSITY     dense (top of band).
HEADLINE    LOT® AI stops suggesting and starts walking a routine with you.
GATE        234 / 405 / 268 / 270
BADGE       Lake (epic)              Stair (epic)          + Q3: THIRD VOLUME
WIDGET      Months unlocked: 9/12   Routine: Evening wind-down, day {d} of 21
AFFIRMATION "Nine chapters. Three volumes. {n} signals. You have not missed
            a month."   (only when true; otherwise the line is omitted)
SELF-CARE   One 21-day routine, chosen by the operator from three proposals.
GUIDE
CHAPTER     Chapter + Volume III + the routine's day count.
SEED
```

### MONTH 10 — INSTRUMENT

```
GLYPH       ≋··· / ║·║···
SCREEN      Maximum density: every pixel justified, Bloomberg-grade. + Architect
            telemetry widget. + Data export (full Memory Story, JSON + text).
            + keyboard shortcuts overlay.
DENSITY     instrument. gap-y-4 / gap-y-0.
HEADLINE    The screen the operator started with has become an instrument
            panel they built by showing up. Export is the proof it is theirs.
GATE        260 / 450 / 318 / 300
BADGE       Delta (epic)             Dome (epic)
WIDGET      Months unlocked: 10/12   Two doors remain.
AFFIRMATION "Day 304. The interface is {x}% denser than day 1. You earned each row."
SELF-CARE   Self-direction month: the operator edits their own routine list;
GUIDE       the system only observes and reports adherence.
CHAPTER     STATE beat becomes a tabular mini-readout (cockpit form).
SEED
```

### MONTH 11 — THRESHOLD

```
GLYPH       ≋···· / ║·║····
SCREEN      + Letter to Self: the operator writes to Month-12 self; sealed until
            the anniversary. + Day-1 Replay: the Day-1 receipt and first
            answers shown back with today's answers beside them. + /ai thread
            opens (LOT® AI converses, with the whole year in context).
DENSITY     instrument.
HEADLINE    The system turns around and shows the operator where they started.
GATE        286 / 495 / 372 / 330
BADGE       Tide (epic)              Spire (epic)
WIDGET      Months unlocked: 11/12   One door remains. {d} days.
AFFIRMATION "On day 1 you answered: {a1}. Today you answered: {a2}."
SELF-CARE   Gratitude pass: three recorded answers the system surfaces as the
GUIDE       ones that mattered. The operator confirms or swaps.
CHAPTER     Chapter + a 'what changed since month 1' line.
SEED
```

### MONTH 12 — YEAR BOOK

```
GLYPH       ≋····· / ║·║·····   (both pairs complete)
SCREEN      + YEAR BOOK full-screen reader: 12 epigraphs (one line per chapter),
            one 350-word Year Book, Then/Now, Letter to Self unsealed. The
            Months Unlocked widget turns into a 12-cell completed strip, then
            a Legacy line. LOT® AI thread persists. Anniversary email.
DENSITY     instrument. Reader overlay is breathable on purpose.
            Citizen Stage 6 Elite (day 365).
HEADLINE    A year, compressed into one readable object that is the operator's
            and exportable.
GATE        312 / 540 / 430 / 365   (year ref. total 1,647 signals)
BADGE       Ocean / Keystone (legendary) + YEAR BOOK (legendary)
            + TWELVE DOORS (cosmic, only if all 12 months were STANDARD+)
WIDGET      Months unlocked: 12/12   [■■■■■■■■■■■■]   Year Book sealed.
AFFIRMATION "Day 365. {n} signals, {w} words. Legacy review opens next month."
SELF-CARE   Choose the three rituals to carry into year two. They go on the
GUIDE       Year Book's last page.
CHAPTER     The Year Book (section 05) + 12 epigraphs. Legacy candidacy: the
SEED        profile gains the 'Legacy' tag path that /u/machiavelli already shows.
```

---

## 08 // WIREFRAMES

Rendered in the product's own Block grammar (`Label:` + value, no boxes).

### M0 — BLANK FIELD

```
Vadik
Week 42; October 17, Saturday, Florence

Check-in:        How do you feel this morning?
                 calm · tired · hopeful · restless

Memory:          Tea or coffee this morning?

Sky:             Few clouds
```

### M3 — FOUNDATION

```
Vadik
Week 2; January 17, Sunday, Florence

Month 3:         Three months. Volume I is sealed.
                 78 check-ins · 135 self-care · 52 notes
                 Months unlocked: 3/12   [■■■□□□□□□□□□]
                 Next door: Depth, opens Feb 17

Badge:           ≈ Stream   ╞═╡ Wall                    uncommon

Check-in:        ...        Self-care:   ...      Intentions:  ...
Planner:         ...        Memory:      You said green tea, loose leaf.
Team:            Usership   Sky: ...      Temperature: ...
```

### M6 — MERIDIAN

```
Vadik
Week 15; April 17, Saturday, Florence

Month 6:         Half declared. Two volumes sealed.
                 Day 182. 748 signals > 164 words.
                 Months unlocked: 6/12   [■■■■■■□□□□□□]
                 Then (day 1): "Coffee."   Now: "Loose-leaf green, before 7."

Biofield:        Archetype · Cohort · Phase · Confidence · ATP · Clarity
Check-in:        ...        Self-care:   ...      Cohort:  ...      Mood:  ...
```

### M9 — ASCENT

```
Month 9:         Nine chapters. Three volumes.
                 Routine: Evening wind-down  day 12 of 21   [■■■■■■■■■■■■□□□□□□□□□]
                 LOT® AI: Thursday runs low. Walk at 14:00?  [yes] [later]

Weekly:          Week 28 · GROWTH · 7 check-ins · 11 self-care · 4 notes
Table:           Archetype · Cohort · Phase · Confidence · ATP · Clarity · Alignment · Index
```

### M12 — YEAR BOOK

```
Year 1:          Sealed.
                 1,647 signals > 351 words.        Months unlocked: 12/12  [■■■■■■■■■■■■]
                 [ open Year Book ]   [ export ]   [ ask LOT® AI ]

Badges:          ≋····· Ocean   ║·║····· Keystone   YEAR BOOK   TWELVE DOORS
Legacy:          Review opens {date}.
```

---

## 09 // WIDGETS

Three widgets replace and extend `MonthlyPulseWidget`. All use the existing
`Block` grammar, 1400ms fade-in, and `WidgetErrorBoundary`.

### 9.1 MONTHS UNLOCKED  (context widget, always on for Usership)

```
SLOT        System.tsx where MonthlyPulse sits today (top of the paid layout)
STATES      CLOSED        "Months unlocked: 3/12"    strip: ■■■□□□□□□□□□
            NEXT DOOR     "Next door: Depth, opens {date}"   (tap: preview card)
            OPENING       day-of: strip fills the new cell, one badge fades in
            COMPLETE      12/12: strip turns into the Legacy line
TAP         label tap cycles: Strip > Next-door preview > Presence pace band
PACE        a single quiet line, no percent: "Pace: steady" / "Pace: light" /
            "Pace: full". Never red, never a streak count.
LOCKED      a door preview shows its name and one sentence, never a blurred UI.
PREVIEWS    (honesty beats tease: the operator can read what is coming.)
```

### 9.2 CHAPTER  (the compressed Memory delivery)

```
SLOT        directly beneath Months Unlocked on the Month Opening day; after
            that it lives in the Memory block as a cycle view
LABEL       "Chapter 3:"  (label tap cycles Chapter 1..N, newest first)
BODY        the 90 to 140 word paragraph (section 05.1)
FOOTER      "412 entries > 118 words."  then a badge row and [ open Volume ]
            on quarter months
ACTIONS     [ keep ]  [ edit a sentence ]  [ share to profile ]
            Editing a sentence stores operator_edit=true; the AI never
            overwrites an edited chapter. (Law 5: the story is theirs.)
SYNC        dismissal state is server-side (metadata.chapterSeen = N), emitted
            over SSE to the user's other sessions (Cross-Device Sync doctrine).
```

### 9.3 MONTH OPENING  (the ceremony)

```
TRIGGER     first load on or after the usership anniversary (calendar month)
SEQUENCE    1. blank for 400ms   2. Months Unlocked strip fills the new cell
            3. Chapter fades in (1400ms)  4. badge glyph appears with its
            rarity word  5. one dismiss line from the existing set
            ("Onward." "Noted." "The system remembers.")
SOUND       the existing soft chime (sovietChime.ts), muted by sound setting
DURATION    under 6 seconds without interaction; fully skippable
```

---

## 10 // BADGES

Monthly chapter badges follow the operator's chosen badge theme
(`badgeTheme: water | architecture`). Rarity climbs with the year.

```
MONTH  WATER (glyph)    ARCHITECTURE (glyph)   RARITY
─────  ───────────────  ─────────────────────  ─────────
  1    Drop      ∘      Footing       ├─       common
  2    Ripple    ∘·     Foundation    ├─·      common
  3    Stream    ≈      Wall          ╞═╡      uncommon
  4    Brook     ≈·     Doorway       ╞═╡·     uncommon
  5    Pool      ≈··    Beam          ╞═╡··    uncommon
  6    Current   ≈···   Arch          ╞═╡···   rare
  7    River     ≋      Floor         ║·║      rare
  8    Falls     ≋·     Window        ║·║·     rare
  9    Lake      ≋··    Stair         ║·║··    epic
 10    Delta     ≋···   Dome          ║·║···   epic
 11    Tide      ≋····  Spire         ║·║····  epic
 12    Ocean     ≋····· Keystone      ║·║·····  legendary
```

**Specials (theme-independent)**

```
BADGE            CONDITION                                          RARITY
───────────────  ─────────────────────────────────────────────────  ─────────
FIRST VOLUME     Volume I sealed (M3)                               uncommon
SECOND VOLUME    Volume II sealed (M6)                              rare
THIRD VOLUME     Volume III sealed (M9)                             epic
YEAR BOOK        Year Book sealed (M12)                             legendary
TWELVE DOORS     all 12 chapters were STANDARD+ (no QUIET month)    cosmic
```

Quiet months still award the monthly badge (Law 3). Only TWELVE DOORS is
presence-sensitive, and it is the only badge that can be missed.

**Implementation note (G10).** Add the 29 new `BadgeType` entries (24 monthly + 5 specials) and their
`checkAndAwardBadges()` branches in the same session as the codex doc.
Do not repeat the v20/v21 gap.

---

## 11 // DEMO ACCOUNT — `/u/machiavelli` AS THE 12-MONTH REFERENCE

### 11.1 Role of the demo

The live demo profile (`public-api.ts:747`) is a frozen Year-4+ "Legacy"
state (1,469 streak, 2,847 answers, 4,316 total entries, `Legacy` tag).
A real 12-month account cannot hold those numbers, so the two are separated:

```
/u/machiavelli                default. Unchanged Legacy snapshot (Year 4+).
/u/machiavelli?m=0..12        TIME MACHINE. Renders the profile as it looked
                              at month N of a 12-month Usership.
```

**The scrubber.** The public page gains a 13-position control at the bottom
of the profile (`Month: 0 1 2 3 ... 12`). Each position swaps one table:
`DEMO_MONTHS[n]`. Visitors, investors and the S-2 can feel the year in
twelve taps. The same table doubles as the reference fixture for QA.

### 11.2 Machiavelli's 12-month curve (the reference account)

The curve is the 100% line of section 04, rounded for the demo, with
Machiavelli's year placed in Florence. Month-end cumulative totals:

```
MONTH  CHECK-INS  SELF-CARE  JOURNAL  ANSWERS  SIGNALS   BADGES   DENSITY
  1       26         45        12       30       113       1       breathable
  2       52         90        30       60       232       2       comfortable
  3       78        135        52       90       355       4*      comfortable
  4      104        180        78      120       482       5       compact
  5      130        225       108      150       613       6       compact
  6      156        270       142      180       748       8*      compact
  7      182        315       180      210       887       9       dense
  8      208        360       222      240      1030      10       dense
  9      234        405       268      270      1177      12*      dense
 10      260        450       318      300      1328      13       instrument
 11      286        495       372      330      1483      14       instrument
 12      312        540       430      365      1647      17**     instrument
* includes the volume badge   ** 12 monthly + 3 volume + YEAR BOOK + TWELVE DOORS
```

### 11.3 Machiavelli's chapters (demo copy; the compressed Memory delivery)

Written in the six-beat anatomy: STATE, TONE, THEME, RITUAL, VOICE, FORWARD.
Quoted phrases are the demo operator's own Log text. Each chapter is
84 to 118 words. These are fixture text for the scrubber and also the
golden samples the generator is tested against.

**Chapter 1 — SIGNAL.** 26 check-ins, 45 self-care moments, 12 notes. Calm
held most mornings; the first week was restless. The Palazzo's morning
light was the subject that returned. The ritual that stuck was the walk to
the loggia before the petitioners arrive. Niccolò wrote: "I learn the city
by when it wakes." Next month the system looks for the pattern in all of it.
*113 entries > 71 words.*

**Chapter 2 — PATTERN.** 26 check-ins, 45 self-care moments, 18 notes. Energy
dips on Tuesdays, the day of the council, in 6 of 8 weeks. Fortune and
preparation were the recurring words. Cold water at dawn became the ritual.
Niccolò wrote: "A calm mind is a held position." Next month the first
volume closes.
*119 entries > 62 words.*

**Chapter 3 — FOUNDATION (Volume I).** 26 check-ins, 45 self-care, 22
notes. Tone moved from restless to steady across the quarter. The theme was
how to be read and how to read. The ritual that stayed was the dusk walk
along the Arno. Niccolò wrote: "What I do daily is what I am." Volume I
sealed: three months, 355 entries, one page. Next month, a name for the
pattern.
*123 entries > 66 words.*

**Chapter 4 — DEPTH.** The archetype reveal: The Strategist. Basis: 120
answers, 78 notes, sustained observation of power and weather. Tone: calm
with controlled intensity. The ritual was a written reckoning before
sleep. Niccolò wrote: "I would rather be feared for what I know than
loved for what I promise." Next month the system looks at rhythm.
*127 entries > 56 words.*

**Chapter 5 — RHYTHM.** The week has a shape: highest clarity between 06:00
and 09:00, lowest on Thursday afternoons. 26 check-ins, 45 self-care.
Theme: patience as strategy. The ritual was one scheduled rest block a
week. Niccolò wrote: "Haste is the tax paid by the unprepared." Next month
the half-year Volume.
*131 entries > 51 words.*

**Chapter 6 — MERIDIAN (Volume II).** Half the year. Day 1 he answered
"Coffee, standing." Today: "Loose-leaf tea, sitting, before seven." 748
signals compress to one page. Tone: steady with brief storms. Retired ritual:
the late-night letters. Kept: the dawn water, the dusk walk. Niccolò wrote:
"A habit is a decision that stopped needing me." Volume II sealed.
*135 entries > 62 words.*

**Chapter 7 — VOICE.** Five words he used most: order, fortune, patience,
measure, return. His journal grew to 38 notes this month, the longest at
210 words. Theme: how language shapes loyalty. Ritual: reading one page
aloud each morning. Niccolò wrote: "The word chosen is the act half done."
Next month the system draws the map.
*139 entries > 58 words.*

**Chapter 8 — CARTOGRAPHY.** 11 patterns mapped. Strongest: the Tuesday
council dip, now answered by a 13:00 walk, with energy up 14% after.
Theme: stated aims against done aims. Niccolò wrote: "Between the word and
the deed lies the whole of politics." The integrity view found him 82%
aligned. Next month, a routine of 21 days.
*143 entries > 59 words.*

**Chapter 9 — ASCENT (Volume III).** Nine chapters, three volumes, 1,177
signals in 170 words. Routine in progress: the evening wind-down, day 12 of
21. Tone: forward, with one hard week answered by two rest blocks.
Niccolò wrote: "Fortune favors those who have arranged their evenings."
Volume III sealed. Next month, the instrument.
*147 entries > 58 words.*

**Chapter 10 — INSTRUMENT.** The screen is 61% denser than on day 1, and
every row on it has been earned. Export unlocked: the whole story, in his
hands. Theme: authority is what remains when no one is watching.
Self-directed month: 4 rituals edited by him alone. Niccolò wrote:
"Keep what works, cut the rest, answer to no one but the record."
*151 entries > 57 words.*

**Chapter 11 — THRESHOLD.** The Day-1 replay: "Coffee, standing." Then
today: "Tea, before seven, sitting." Letter to Self sealed for month twelve.
LOT® AI thread open. Theme: the man who started and the man now writing.
Niccolò wrote: "I am not who I was, and I kept the receipt." One door
remains.
*155 entries > 58 words.*

**Chapter 12 / YEAR BOOK.** A year in Florence, compressed. 1,647 signals,
351 words. He arrived in a bare room with one question and now keeps an
instrument panel of his own making. Three rituals carry forward: dawn
water, dusk walk, evening wind-down. Twelve chapters, four volumes,
no missed month. "What I do daily is what I am" is the line he kept.
Legacy review opens next month.
*1,647 signals > 351 words (Year Book; abbreviated here).*

---

## 12 // ENGINEERING PLAN

Not built this session. Ordered so every phase ships green and can be
stopped after any step with the product still coherent.

### 12.1 Data

```
FIELD / ARTIFACT                    WHERE                          NOTES
──────────────────────────────────  ─────────────────────────────  ────────────────────────
usershipStartedAt (ISO)             user.metadata                  Set when the Usership tag
                                                                   is granted. Backfill from
                                                                   existing joinedAt for
                                                                   current members (Law 8).
usershipPausedDays (number)         user.metadata                  Pauses extend the clock
                                                                   instead of skipping a month.
chapters[] (N, text, band,          user.metadata.chapters         Durable archive (G3).
 counts, badge ids, edited)         + lot_ai_chapter log row       Log row = data only (Law 6).
volumes[] , yearBook                user.metadata                  Same shape, longer text.
chapterSeen (number)                user.metadata                  Server-side dismiss (G4).
DEMO_MONTHS[0..12]                  src/shared/                    Fixture for the scrubber and
                                                                   for generator golden tests.
MONTH_STATES[0..12]                 src/shared/usership-months.ts  Single source: codename,
                                                                   density floor, unlock flags,
                                                                   badge ids, gate, copy.
```

### 12.2 Code touch-list (by file)

```
FILE                                              CHANGE
────────────────────────────────────────────────  ───────────────────────────────────────
src/shared/usership-months.ts            (new)    MONTH_STATES, getUsershipMonth(user),
                                                  reference curve, presence bands.
src/server/scheduled-jobs.ts                      J49 monthly chapter (06:00 UTC daily,
                                                  runs for anniversaries due today),
                                                  J50 volume (M3/6/9), J51 year book (M12).
                                                  Extend J15 email to months 1-12 (G8).
src/server/routes/api.ts                          Add lot_ai_chapter, lot_ai_volume,
                                                  lot_ai_year to displayableEvents
                                                  (Backend Whitelist Hygiene).
                                                  GET /api/chapters, POST chapter edit,
                                                  POST chapterSeen (+ SSE settings_updated).
src/client/components/MonthlyPulseWidget.tsx      Split into MonthsUnlockedWidget and
                                                  ChapterWidget; month from
                                                  getUsershipMonth, not joinedAt (G1).
src/client/components/System.tsx                  monthGate(feature) wrapper around the
                                                  existing widgets; paid layout selected by
                                                  month; R&D keeps current layout (G5).
src/client/utils/interfaceEvolution.ts            getLayoutDensity takes a calendar floor
                                                  param (G6); getFeatureUnlocks ORs in
                                                  month unlocks.
src/client/utils/badges.ts                        29 BadgeType additions + award branches
                                                  (G10).
src/client/components/PublicProfile.tsx           Latest chapter in Memory Story block;
                                                  badge row; Month scrubber (demo only).
src/server/routes/public-api.ts                   DEMO_MONTHS-driven profile when ?m=N;
                                                  public chapters subset gated by
                                                  privacy.showMemoryStory.
docs/badges/                                      Codex entry for monthly badges, same PR.
docs/wiki/                                        New wiki section "Usership Year".
```

### 12.3 Phases

```
PHASE  SCOPE                                              OUTCOME
─────  ─────────────────────────────────────────────────  ────────────────────────────────
P1     usershipStartedAt + getUsershipMonth + MONTH_STATES  Correct month everywhere.
       + fix MonthlyPulse source + server-side dismiss      Closes G1, G4, G7.
P2     DEMO_MONTHS + /u/machiavelli?m=N scrubber            The whole year is demonstrable
                                                            on day one, before any
                                                            generator exists. Closes G9.
P3     MonthsUnlocked + Chapter widgets reading J24 output  Weekly story finally delivered.
       (render weekly story first; chapter second)          Closes G2.
P4     J49 chapter job + archive + whitelist + email        Real compression, months 1-12.
                                                            Closes G3, G8.
P5     Calendar floor in density + monthGate in System.tsx  The UI visibly evolves.
                                                            Closes G5, G6.
P6     Badges (29) + codex doc + award logic                Tangibility. Closes G10.
P7     J50 Volume + J51 Year Book + readers                 Quarter and year ceremonies.
P8     AI polish (Together AI, template fallback) from M3;  LOT® AI voice ladder.
       /ai thread at M11                                    
```

P1 + P2 are the smallest valuable slice: no new job, no new AI call, and the
demo can show S-2 the entire arc.

### 12.4 Risks and answers

```
RISK                                      ANSWER
────────────────────────────────────────  ───────────────────────────────────────────
Existing members lose UI                  Law 8: grandfather to real month; never retract.
Month calc errors block UI                Law 7: absent field = allow.
Quiet user feels judged                   Law 3 + no percent, no streak count in widgets.
Chapter text sounds generic               Law 5: mandatory operator quote; golden tests.
Log endpoint cap (500) hides history      Chapters live in metadata archive (G3).
AI cost                                   One call per user per month; template fallback.
AI invents facts                          Counts/dates are code-computed and injected;
                                          AI may only polish prose around them.
Privacy                                   Chapters private by default; public only via
                                          existing showMemoryStory switch.
Doc/code drift (G10)                      Badge docs + award logic in one session.
```

### 12.5 Tests / green-gate

```
- getUsershipMonth(): table-driven (day 0, 29, 30, 31, leap day, pause days,
  missing field -> undefined).
- Chapter builder golden tests: DEMO_MONTHS counts -> section 11.3 STATE and
  TONE beats must match exactly; THEME/VOICE selection deterministic by seed.
- Whitelist test: every new event type appears in displayableEvents.
- Render test per month: MONTH_STATES[n] density and widget set snapshot.
- Preview: /u/machiavelli?m=0..12 screenshot per month (Playwright is
  pre-installed in the cloud env).
```

---

## 13 // OPEN DECISIONS FOR S-2

```
D1   Month boundary: usership anniversary (day-of-month) or calendar 1st?
     Recommended: anniversary. Each operator's month 1 starts on their day 1.
D2   Does a paused/lapsed subscription freeze the clock? Recommended: freeze
     (usershipPausedDays), never skip a month.
D3   R&D tier: same Month Ladder, or keep today's full layout?
     Recommended: R&D keeps today's full layout. Ladder is Usership only.
D4   Demo default: stay at the Legacy snapshot, or open at Month 12 with the
     scrubber? Recommended: Legacy default, scrubber visible.
D5   AI polish from M3 uses Together AI. Confirm provider and per-chapter
     token budget (~600 tokens).
D6   Month Ladder stage months now match the Citizen Index (M1/M3/M6/M12).
     Should a stage advance require the Index's signal criteria too, or follow
     the calendar alone? Recommended: both (Index criteria are the guard).
D7   Public chapters: opt-in per chapter, or inherit showMemoryStory?
     Recommended: inherit, with an "edit before it goes public" step.
D8   Existing 781-badge codex: ship monthly badges as codex v33 or a separate
     "Usership Year" set? Recommended: separate set, one line in the codex index.
D9   Month-0 receipt (DAY1:) and Day-1 Replay at M11: enable by default?
     Recommended: yes; it is the strongest payoff in the arc.
```

---

```
AUTHORIZED BY: S-2 // VADIK MARMELADOV
```
