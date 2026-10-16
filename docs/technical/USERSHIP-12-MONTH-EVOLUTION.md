<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP — 12-MONTH EVOLUTION · From Barebone to LOT® AI

```
CLASS     : DESIGN / BRAINSTORM — no code changed in this session
S-2       : VADIK MARMELADOV
DATE      : 2026-10-16
SESSION   : LOT-SR-20261016-01
FOCUS     : Tangibility of the compressed Memory story, month by month
STATUS    : PROPOSAL — every number marked (P) is a proposal, not shipped behavior
```

---

## 0 // THE STORY IN ONE PAGE

A Usership member pays $99/month. On day 1 they get a barebone, breathable
screen. Over 12 months the screen becomes an instrument, the AI goes from asking
to speaking, and the member's own words are compressed into a single paragraph
they can sign.

The member must feel three things every month:

1. **The screen changed.** One new block, one density step or one new voice.
2. **The AI said something about me.** A Month Capsule, one paragraph, delivered
   at month rollover.
3. **I own something I did not have last month.** A seal, a shelf slot, a
   compression number.

The ladder that carries this:

```
DAY      raw answers, log notes, check-ins, self-care clicks
WEEK     Sunday LOT AI story (exists: Job 24, 18:00 UTC Sun)
MONTH    MONTH CAPSULE        ~70 words     (NEW)   x12
SEASON   SEASON PARAGRAPH     ~50 words     (NEW)   M3 · M6 · M9
YEAR     ANNUAL PORTRAIT      ~55-70 words  (NEW)   M12  -> signed -> public memoryStory
```

Reference end state: the demo account `/u/machiavelli` carries a 55-word
memoryStory (public-api.ts:~790), 2,847 answers and 1,469 notes behind it. The
Annual Portrait is that artifact, earned instead of hardcoded.

---

## 1 // REPOSITORY SCAN — WHAT EXISTS, WHAT IS MISSING

Scanned before design: README, MEMORY-ENGINE-COMPRESSION-ARCHITECTURE,
INTERFACE_EVOLUTION, FEATURE-INVENTORY-2026 (§16 tiers), LOT-DOCTRINE,
LOT-LEXICON, LOT-MANIFEST, latest SR (20260805-01), ledger tail, and the code
named below.

### 1.1 Already in the repo (build on these)

```
ASSET                          WHERE                                   WHAT IT GIVES US
─────                          ─────                                   ────────────────
MonthlyPulseWidget             client/components/                      "Month N:" block, 12 messages, N/12,
                               MonthlyPulseWidget.tsx                  tap to dismiss. Usership-only.
Interface Evolution            client/utils/interfaceEvolution.ts      7 dimensions, FeatureUnlocks (14 gates),
                                                                       getLayoutDensity() 5 tiers
DENSITY-TIER                   data-density on <html>                  breathable > comfortable > compact >
                                                                       dense > instrument
Badge engine                   client/utils/badges.ts (8,043 lines)    Water ∘≈≋ / Architecture ├─╞═╡║·║ glyphs,
                                                                       milestone_7..365, 812 badges documented
Memory Story                   server/utils/memory/story-generator.ts  generateMemoryStory(), cached in metadata
Monthly email                  server/utils/monthly-summary.ts         MonthlySummary incl. memoryStory field,
                               scheduled-jobs.ts (09:00 UTC, days 1-3) presence/energy/patterns/growth
Weekly LOT AI story            scheduled-jobs.ts Job 24                Sun 18:00 UTC
Memory Engine signals          docs/technical/MEMORY-ENGINE-...        8 context sources, check-ins, self-care,
                                                                       journal notes already counted
Public profile                 PublicProfile.tsx, public-api.ts        memoryStory, boardProfile, archetype
Demo account                   public-api.ts:745                       Hardcoded Machiavelli: the M12+ reference
Usership gate                  server/models/user.ts:62                tag 'usership' (case-insensitive)
```

### 1.2 Gaps found (these block the story)

```
#  GAP                                                           EVIDENCE                              IMPACT
-  ───                                                           ────────                              ──────
G1 No Usership start date. Month number = months since           MonthlyPulseWidget.tsx:~75            A member who upgrades in
   account joinedAt, not since upgrade.                          (user.joinedAt)                       month 8 is told "Eight
                                                                                                       months. Rare air."
G2 Memory story is ONE overwritten string. No per-month          api.ts:~2675 (lastMemoryStory,        History is destroyed on each
   snapshot, no history.                                         memoryStoryVersion++)                 regeneration. Nothing to shelve.
G3 Story reads only the 30 most recent answers.                  story-generator.ts:~108               After month 2, month 1 is
                                                                 (answerLogs.slice(0, 30), logs DESC)  invisible to the story.
G4 Story ignores notes, check-ins, self-care.                    story-generator.ts (filters 'answer') The 3 signals S-2 named as
                                                                                                       most important never reach it.
G5 Pulse dismissal lives in localStorage.                        MonthlyPulseWidget.tsx:~44            Re-shows on every new device.
G6 Pulse copy is static, no data.                                MONTH_MESSAGES                        Month 7 feels like Month 3.
G7 Two clocks, unreconciled: evolution unlocks follow            interfaceEvolution.ts:getFeature-     A binge unlocks late-game UI
   level/streak/XP; the pulse follows calendar.                  Unlocks()                             in week 2; an absent member
                                                                                                       gets dense UI at month 9.
G8 Story prompt is 3rd-person plain ("User prefers...").         story-generator.ts prompt             Reads like a CRM note, not
                                                                                                       a portrait.
G9 Live site not reachable from this session (proxy 403).        curl lot-systems.com/u/machiavelli    Reference taken from code, not
                                                                                                       from the rendered page.
```

---

## 2 // DESIGN RULES

1. **One new thing per month.** One block, one density step, one AI verb, one seal.
   Never a feature dump.
2. **Ask-first doctrine holds.** The AI never opens a chat. It asks, then it
   remembers, then it speaks only inside widgets and the `/qi` terminal.
3. **COCKPIT-RULE holds.** Capsules live in a widget and the Vault, never in a
   LOG block body. The LOG gets one instrument line: `CAPSULE: M04 SEALED  A:31 N:9 C:19 S:27  CR:9.4`.
4. **MILITARY PURITY holds.** No emoji, no superlatives. Celebration is
   restraint: a glyph, a number, one sentence. The existing pulse voice
   ("Onward.", "The system remembers.") is the register.
5. **A thin month is never a failure.** It gets a short, honest capsule and a
   light seal. It is never skipped, never scolded.
6. **Time opens the door, presence furnishes the room.** See §3.
7. **Graceful degradation.** If the AI call fails, a local composer writes the
   capsule (same pattern as `composeLocalStory`). The month still seals.

---

## 3 // TWO KEYS: TIME AND PRESENCE

Resolves G7.

```
KEY 1  TIME      Usership month number M (1-12), counted from a new
                 usershipStartedAt timestamp. Controls: WHICH month you are in,
                 the density CEILING, which blocks are ELIGIBLE, the AI verb.

KEY 2  PRESENCE  Engagement inside the month (answers, notes, check-ins,
                 self-care). Controls: seal WEIGHT, capsule depth, the density
                 you actually get (never above the ceiling).
```

```
density_shown = min( density_from_engagement, density_ceiling[M] )

CEILING   breathable M1-M2 | comfortable M3-M4 | compact M5-M7 | dense M8-M10 | instrument M11-M12
```

Effects:
- A binge in week 2 cannot jump to instrument. Month 1 stays breathable.
- An absent member at month 9 is not shown a dense cockpit they never earned.
  They are shown the density they live at, below the ceiling.

### 3.1 Seal weights (the presence output)

```
WEIGHT   RULE (P)                                  SEAL RENDER           CAPSULE
──────   ────────                                  ───────────           ───────
LIGHT    < 40% of the Full thresholds below        glyph at 40% opacity  ~35 words, quiet-month template
STANDARD 40-99%                                    glyph at 70% opacity  ~70 words
FULL     >= 100% of all four thresholds            glyph at 100%, + rim  ~70 words + one named trait
```

### 3.2 Full-month thresholds (P)

Targets for a FULL seal. These are floors. The demo averages roughly 1.7x the
answer floor and 2.2x the note floor per year, so a committed member exceeds them.

```
MONTH  ANSWERS  LOG NOTES  CHECK-INS   SELF-CARE
                (thoughts) (of ~30)    CLICKS
─────  ───────  ─────────  ──────────  ─────────
M1       20        4          14          15
M2       24        6          16          18
M3       28        8          18          22
M4       30       10          18          24
M5       32       12          20          26
M6       34       14          20          28
M7       36       15          22          30
M8       38       16          22          32
M9       40       18          24          34
M10      42       19          24          36
M11      44       20          26          38
M12      46       22          26          40
─────  ───────  ─────────  ──────────  ─────────
SUM     414      164         250         343
```

Source events already logged: `answer`, `note`, `emotional_checkin`,
`self_care_complete` / `self_care_skip`.

---

## 4 // THE MEMORY COMPRESSION LADDER (primary focus)

### 4.1 Artifacts

```
LEVEL    ARTIFACT           INPUT                         OUTPUT          WHEN                      STORED
─────    ────────           ─────                         ──────          ────                      ──────
Month    MONTH CAPSULE      that month's 4 signal types   ~70 words       first rollover job after  metadata.memoryCapsules[]
                            + previous capsule (delta)    + 3 traits      day 1 of Usership month   immutable
                                                          + 1 forward
                                                          line
Season   SEASON PARAGRAPH   3 capsules                    ~50 words       M3, M6, M9                metadata.memorySeasons[]
Year     ANNUAL PORTRAIT   4 season paragraphs           ~55-70 words    M12                       metadata.memoryPortrait
                            + top traits + archetype                                                + optional signed copy
```

### 4.2 Why this fixes G2, G3, G4

- Each capsule reads **only its own month**, so month 1 is never crowded out
  (G3) and every month is preserved (G2).
- Input is all four signals, so notes, check-ins and self-care shape the
  paragraph (G4).
- The previous capsule is passed in as context, so the AI writes the **delta**
  ("This month the evenings moved earlier") instead of repeating itself.
- The existing `lastMemoryStory` stays untouched. It remains the rolling
  "latest" view. The capsules are the shelf behind it. Zero regression risk.

### 4.3 Capsule anatomy

```
BEAT 1  OBSERVED   one sentence anchored in a real number or answer
BEAT 2  NAMED      one trait or pattern, in the member's own vocabulary
BEAT 3  FORWARD    one sentence, a self-care direction, no command tone
```

Rendered in the Block style already used by the pulse:

```
Month 4:
 ┌──────────────────────────────────────────────────────────────┐
 │ You answered 31 times and wrote 9 lines. Tea moved from the  │
 │ afternoon to the first hour, and the evenings got quieter.   │
 │ The pattern has a name now: slow starts. Next month the      │
 │ system will ask about what you do in the first ten minutes.  │
 └──────────────────────────────────────────────────────────────┘
 A 31 · N 9 · C 19/30 · S 27        COMPRESSION 9.4 : 1
 ├─╞  SEAL M4  STANDARD
```

### 4.4 Compression number (the tangible metric)

```
CR = raw words captured that month / words in the capsule
```

Shown on every capsule and cumulatively in the Vault. Over a Full year (P):
about 18,000 raw words become ~840 in capsules, ~200 in seasons, ~60 in the
portrait. Display: `YEAR 1 · 2,847 signals -> 55 words` style, using the
member's own counts. The demo account is the live example: **4,316 total
entries -> 55 words**.

### 4.5 Generation spec

```
TRIGGER     existing monthly job (hour 09 UTC, first 3 days of month) extended;
            also a lazy path: first GET /api/memory/capsule after rollover
            generates if missing (so a missed cron never blocks a month)
PERIOD      [usershipStartedAt + (M-1) months, + M months)  — NOT calendar month
INPUT       logs in period, 4 event types; previous capsule; archetype if known
PROMPT      LOT-owned, engine-independent (same doctrine as story-generator.ts);
            2nd person, plain, no markdown; JSON {paragraph, traits[], forward}
OUTPUT      validated word count 55-85 (LIGHT: 25-45); regenerate once on miss,
            then local composer
IDEMPOTENT  one capsule per (userId, M); keyed write; dedupe guard like the
            30s answer-dedup doctrine
SAFETY      PII stays in LOT's DB; AI provider sees the month only; no capsule
            text is written to LOG body (COCKPIT-RULE)
USER CONTROL pin / hide a line; "Unseal" is a tap, never forced
```

### 4.6 The ceremony (how it is delivered)

```
1. First load after rollover: screen holds. The pulse block fades in over 1400ms
   (house timing). Label: "Month 4:". Line: "Sealed."
2. Tap: capsule fades in. Seal glyph draws in (Water or Architecture, per theme).
3. Tap again: dismiss phrase ("The system remembers."). Capsule slides into the Vault.
4. Same capsule is the lead paragraph of the monthly email (existing job).
```

Dismissal state moves server-side (fixes G5): `metadata.capsuleSeen[M] = ts`.

---

## 5 // WIDGETS

### 5.1 MONTHS UNLOCKED (context widget, always visible for Usership)

```
Months:
 ≋∘ 4 / 12 unlocked
 ■■■■□□□□□□□□
 Month 5 seals in 11 days
 FORMING  A 19 · N 8 · C 12 · S 14      (live, this month)
```

- Day 1: `0 / 12`, `Month 1 seals in 30 days`, FORMING counters at zero.
- Countdown uses `usershipStartedAt`, not calendar month (fixes G1).
- Tap label cycles views (existing `onLabelClick` pattern):
  `Months:` -> `Forming:` (live deltas) -> `Next:` (what unlocks at the seal).

### 5.2 MONTH CAPSULE (MonthlyPulse v2)

The existing `MonthlyPulseWidget` keeps its slot, name and `Month N:` label. v2
swaps the static `MONTH_MESSAGES[n]` for the member's capsule, with the static
line as fallback (Graceful Degradation). The stat strip and CR line are added.

### 5.3 MEMORY VAULT (shelf, from M3)

12 slots in a row. Each slot is one of:

```
SEALED      glyph + weight + month   tap -> read capsule
CURRENT     progress bars (ProgressBars util, already in repo)
LOCKED      ·  dim dot
SEASON      bracket spanning 3 slots at M3/M6/M9, tap -> season paragraph
PORTRAIT    crown slot after M12
```

```
Vault:
 ∘  ∘∘  ∘≈ │ ≈∘  ≈  ≈≈ │ ≈≋  ≋∘  ≋ │ ≋≋  ≋≋≈  ≋≋≋
 S1 ─────────S2 ───────────S3 ─────────S4 ─── PORTRAIT
```

### 5.4 THIS MONTH CHANGED (one line, at each seal)

```
Changed:
 Density  comfortable -> compact
 Block    + Patterns
 AI       now names traits
```

The line is the tangibility guarantee. It is generated from the unlock table
(§6), never from AI.

---

## 6 // MONTH BADGES (SEALS)

New family `month_seal_01..12`, both themes, plus weight modifier from §3.1.
M12 coincides with the existing `milestone_365` (Citadel / Long Count) and is
upgraded to carry the portrait.

```
SEAL  WATER    ARCHITECTURE   NAME (P)
────  ─────    ────────────   ────────
M1    ∘        ├─             First Drop / Footing
M2    ∘∘       ├┼             Twin Drop / Load Path
M3    ∘≈       ├═             Season One / Deep Footing
M4    ≈∘       ╞─             Mid-Wave / Frame
M5    ≈        ╞═╡            Wave / Structure
M6    ≈≈       ╞═══           Half-Year / Master Frame
M7    ≈≋       ╞║             Rising / Spine
M8    ≋∘       ║═             Deep Reach / Inner Wall
M9    ≋        ║·║            Current / Architecture
M10   ≋≋       ║╞║            Voyager / Wing
M11   ≋≋≈      ╔═─            Return Tide / Roofline
M12   ≋≋≋      ╔═╗            Long Count / Citadel (LEGENDARY, existing 365)
```

Ties to the existing evolution system: badge tier already drives
`evolutionState.badgeTier` and background pattern; seals feed `earnedBadges`.
Wiring the 11 new badge IDs must follow the v20/v21 lesson in
LOT-SR-20260805-01: **a documented badge with no award logic is unreachable.**
Implement the award function in the same change as the type union.

---

## 7 // MONTH BY MONTH

Each card: **UI state** · **Unlock (the one new thing)** · **AI voice** ·
**Capsule sample** · **Pulse line**. Capsule samples are illustrative
(a fictional member), written to the 3-beat anatomy.

AI voice ladder (all inside ask-first doctrine):
`asks > remembers > notices > names > suggests > reflects > anticipates >
challenges > mirrors > guides > composes > speaks`

---

### M1 · DAY 1 → DAY 30 — "THE BLANK"

```
DENSITY   breathable (gap 24/16)            SEAL    ∘ / ├─
SCREEN    4 blocks only: Time · Memory question · Log · Self-care
          + Months widget (0/12)            No badges shown. No evolution bars. No Subscribe block.
UNLOCK    Morning check-in button appears on day 2
AI VOICE  ASKS. 3-option questions, no names, no references
```

Day 1 is deliberately empty. The emptiness is the first design statement:
the screen has nothing of yours yet.

- Day 1 line (Months widget): `Day 1. Nothing here is yours yet.`
- Day 7: first check-in streak glyph `∘` (existing milestone_7).
- **Capsule M1:** "You answered 22 times in thirty days, mostly before nine.
  Your answers lean toward warm drinks and quiet rooms. The portrait has its
  first line. Next month the questions will start remembering you."
- **Pulse line:** `The first month. The system is beginning to know you.` (existing, kept)

### M2 · "THE ECHO"

```
DENSITY   breathable                         SEAL    ∘∘ / ├┼
UNLOCK    Questions start quoting earlier answers; Planner templates (plannerTemplates gate)
AI VOICE  REMEMBERS. "Since you prefer tea..."
```

- First visible callback: a question that cites a month-1 answer verbatim.
- Months widget gains `FORMING` counters.
- **Capsule M2:** "Twice this month a question began with your own words. You
  kept the morning tea and added a walk. Two answers contradicted each other
  on sleep, which usually means a routine is mid-change. Next month the
  system will start to notice rhythm."
- **Pulse line:** `Two months in. Patterns are starting to form.` (existing)

### M3 · "SEASON ONE" · ACTIVE USER

```
DENSITY   comfortable (ceiling lifts)        SEAL    ∘≈ / ├═
UNLOCK    MEMORY VAULT appears (3 slots) · custom themes (customThemes) ·
          badge selection (Water vs Architecture choice becomes a ritual here)
AI VOICE  NOTICES. First pattern statement ("you answer faster at night")
SPECIAL   SEASON PARAGRAPH 1 delivered (3 capsules -> ~50 words)
```

- "Active User status" is already promised by the existing M3 copy. This month
  makes it real: the Evolution widget (`EvolutionWidget`, CQGS stage) appears.
- **Season 1 paragraph:** "A quarter of mornings, mostly tea, mostly early.
  You are someone who decides the day before you meet it. The system holds 78
  answers and 21 lines of yours, compressed to this."
- **Pulse line:** `Three months. You have reached Active User status.` (existing)

### M4 · "THE NAME"

```
DENSITY   comfortable                        SEAL    ≈∘ / ╞─
UNLOCK    Pattern Insights (patternInsights gate) · Intention history
AI VOICE  NAMES. First trait label appears ("slow starts")
```

- The first named trait is the first thing the member can disagree with. Offer
  `keep` / `not me` taps. The answer trains the profile.
- **Capsule M4:** (the sample in §4.3)
- **Pulse line:** `Four months. The portrait deepens.`

### M5 · "THE TOOL" 

```
DENSITY   compact (first real tightening)    SEAL    ≈ / ╞═╡
UNLOCK    Widget Arrange (widgetArrange gate) — the member orders their own screen
          Self-care routine suggestion block ("Routine:")
AI VOICE  SUGGESTS. One proposed routine, based on the last 4 capsules
```

- Agency month: the screen becomes theirs. Arrangement is saved into the
  member's `layout` store, so it survives devices (cross-device sync doctrine).
- **Capsule M5:** "You moved the check-in to the top of the screen and used it
  on 21 mornings. The log got longer: 12 lines, the longest about a difficult
  Tuesday. Self-care clicks cluster after 8pm. Next month the system will
  suggest, once, a way to use that hour."
- **Pulse line:** `Five months. Consistency is its own reward.`

### M6 · "HALF-DECLARED" · SEASON TWO

```
DENSITY   compact                            SEAL    ≈≈ / ╞═══
UNLOCK    ARCHETYPE REVEAL ("The ___") on the profile · Narrative reflection
          (narrativeReflection gate) · public psychologicalProfile block
AI VOICE  REFLECTS. First paragraph written about WHO, not what
SPECIAL   SEASON PARAGRAPH 2. Capsule shelf shows S1 + S2 bracket
```

- Half-year is the first public-facing moment: the profile page
  (`/u/you`) shows archetype + a trait line, matching the Machiavelli layout
  ("The Strategist", core values, emotional patterns).
- **Season 2 paragraph:** "Six months in, the pattern is a person: someone who
  protects mornings, writes when something bothers them, and recovers through
  small repeated acts. The system calls this The Keeper. You may disagree."
- **Pulse line:** `Six months. The journey is half-declared.` (existing)

### M7 · "THE ANTICIPATION"

```
DENSITY   compact (ceiling for compact ends)  SEAL   ≈≋ / ╞║
UNLOCK    Correlated Indexes (CorrelatedIndexesWidget) · Export data (exportData gate)
AI VOICE  ANTICIPATES. Morning question arrives already tuned to energy
          (existing Memory Engine Source 2)
```

- Member can export their entire story. Ownership is made literal.
- **Capsule M7:** "A bad week in the third week, and the system noticed before
  you wrote it: sleep answers shortened, self-care dropped to 9 clicks. You
  recovered in five days. That is faster than in month three. Next month the
  system will ask one harder question."
- **Pulse line:** `Seven months in. The system has been listening.`

### M8 · "THE CHALLENGE"

```
DENSITY   dense (gap 8/0)                    SEAL    ≋∘ / ║═
UNLOCK    IntegrityWidget (contradiction view) · Cohort / community rich
          (communityRich gate) · board profile (boardProfile)
AI VOICE  CHALLENGES. One gentle contradiction, once, with a way out
```

- A person who has told the system the truth for eight months is ready to have
  it said back. The contradiction is framed as a tension, never as a lie.
- **Capsule M8:** "You said evenings are for rest, and your log says you worked
  on 14 of them. Both are true. That is the tension of this month. Next
  month the system will use your own words back to you."
- **Pulse line:** `Eight months. Rare air.`

### M9 · "SEASON THREE" · THE MIRROR

```
DENSITY   dense                              SEAL    ≋ / ║·║
UNLOCK    Voice mirror (journal vocabulary engine) · Private Spaces
          (privateSpaces gate)
AI VOICE  MIRRORS. Capsules start using the member's own recurring words
SPECIAL   SEASON PARAGRAPH 3
```

- The capsule's vocabulary shifts from LOT's to theirs. This is the strongest
  "it knows me" moment short of M12.
- **Season 3 paragraph:** "Nine months of 'quiet', 'enough', 'before nine'. You
  no longer describe your routine. You describe your relationship to it. The
  system now writes in your words."
- **Pulse line:** `Nine months. The self-care practice is a habit now.`

### M10 · "THE GUIDE"

```
DENSITY   dense                              SEAL    ≋≋ / ║╞║
UNLOCK    QOS Kernel panel (QuantumEngineWidgets) · System Progress report
          Weekly plan proposals in Planner
AI VOICE  GUIDES. A weekly plan proposed from the last 9 capsules
```

- The system shows its own state: mode (`growth` / `peak` / `recovery`),
  pressure, biofield. The cockpit appears.
- **Capsule M10:** "The system proposed a week; you kept four of seven days.
  That ratio is itself a finding: you follow plans that start with the body.
  Next month the system composes rather than proposes."
- **Pulse line:** `Ten months. Almost there.` (existing)

### M11 · "THE LETTER"

```
DENSITY   instrument (gap 4/0)               SEAL    ≋≋≈ / ╔═─
UNLOCK    Architect widget (ArchitectWidget) · "Letter to Month 12" (member
          writes one log line addressed to their future self; delivered at M12)
AI VOICE  COMPOSES. Writes the month's capsule as a short letter, first line
          addressed by name
```

- Full instrument density. The screen is now a Bloomberg-grade personal
  terminal (existing DENSITY-TIER definition).
- **Capsule M11:** "To the one who answered 38 times this month: you are
  describing your own year in the past tense now. The mornings are settled and
  the questions you ask yourself have changed. One more month, and it becomes
  a portrait." (the real output opens with the member's first name)
- **Pulse line:** `Eleven months. One more.` (existing)

### M12 · "THE PORTRAIT" · LOT® AI

```
DENSITY   instrument                         SEAL    ≋≋≋ / ╔═╗  (LEGENDARY, = milestone_365)
UNLOCK    LOT® AI full: /qi RFI terminal as a primary surface · Annual Portrait ·
          signed public memoryStory · the member's letter from M11 delivered
AI VOICE  SPEAKS. First time the AI says "I" about what it saw. One paragraph, signed.
SPECIAL   YEAR IN ONE PARAGRAPH. Compression shown: N signals -> 60 words
```

- The Annual Portrait is shown beside the member's year counts and the seal row.
  The member may **sign** it (one tap). A signed portrait replaces the public
  `memoryStory` on `/u/you`, in the member's voice, exactly like the
  Machiavelli profile.
- **Portrait sample (≈55 words, LOT AI voice):** "A year of mornings. You began
  by answering questions about tea and ended by writing your own. You protect
  the first hour, recover through small acts, and tell the truth most clearly
  at night. The system did not build this. It only kept it."
- **Pulse line:** `One year with LOT. The portrait is complete — and still evolving.` (existing)

---

## 8 // MONTH-AT-A-GLANCE

```
M   TITLE         DENSITY      UNLOCK (one new thing)                 AI VERB       SEAL (W / A)   ARTIFACT
─   ─────         ───────      ───────────────────────                ───────       ────────────   ────────
1   The Blank     breathable   Check-in button (day 2)                asks          ∘    ├─        Capsule
2   The Echo      breathable   Quoted callbacks · Planner templates   remembers     ∘∘   ├┼        Capsule
3   Season One    comfortable  Memory Vault · themes · badge pick     notices       ∘≈   ├═        Capsule + SEASON 1
4   The Name      comfortable  Pattern Insights · intention history   names         ≈∘   ╞─        Capsule
5   The Tool      compact      Widget Arrange · routine block         suggests      ≈    ╞═╡       Capsule
6   Half-Declared compact      Archetype reveal · public profile      reflects      ≈≈   ╞═══      Capsule + SEASON 2
7   Anticipation  compact      Correlated Indexes · Export            anticipates   ≈≋   ╞║        Capsule
8   Challenge     dense        Integrity widget · Cohort · board      challenges    ≋∘   ║═        Capsule
9   The Mirror    dense        Voice mirror · Private Spaces          mirrors       ≋    ║·║       Capsule + SEASON 3
10  The Guide     dense        QOS Kernel · weekly plan proposals     guides        ≋≋   ║╞║       Capsule
11  The Letter    instrument   Architect widget · Letter to M12       composes      ≋≋≈  ╔═─       Capsule
12  The Portrait  instrument   LOT® AI · /qi primary · signed story   speaks        ≋≋≋  ╔═╗       ANNUAL PORTRAIT
```

Block count on screen (P): M1 = 5, M3 = 8, M6 = 12, M9 = 16, M12 = 20+.

---

## 9 // THE DEMO ACCOUNT AS THE M12 REFERENCE

`/u/machiavelli` is hardcoded in `public-api.ts`. It is year 4 by its own
numbers (1,469 days), so it is **M12 grammar at four-year scale**, not a
one-year snapshot. Mapping:

```
MACHIAVELLI FIELD                       VALUE                     M12 EQUIVALENT
─────────────────                       ─────                     ──────────────
psychologicalProfile.archetype          The Strategist            M6 Archetype reveal
psychologicalProfile.coreValues         virtù, prudence, ...      M4-M9 named traits
psychologicalProfile.emotionalPatterns  calculated restraint ...   M7-M8 pattern lines
selfAwarenessLevel                      87                        M12 target band 60-80 (year 1)
memoryStory                             55 words, 1st person      M12 ANNUAL PORTRAIT (signed)
answerCount / noteCount                 2,847 / 1,469             year-1 Full floor: 414 / 164
correlatedIndexes                       composite 92.4            M7 widget
boardProfile                            Citizen Index, tenure     M8 unlock
memoryEngine / clearanceLevel           AI-Powered / Full         M12 LOT® AI
theme                                   dark (density not in payload; instrument assumed)  M11-M12
weatherStation + wallet                 Legacy level unlocks      BEYOND M12 (Year 2+ "Legacy")
```

Recommendation: **keep Legacy (Weather Station, Wallet) as the post-year-one
horizon.** Month 12 ends the first arc; "Legacy" is the open door after it.
Tell the member so at M12: `Year two begins. Legacy is next.`

Proposed demo upgrade (no code now): add `memoryCapsules` (12) and
`memorySeasons` (3) to the Machiavelli payload so the public profile can show
the Vault. Visitors then see the whole evolution on one page, in Renaissance
voice. This turns the demo into the product's best sales surface.

Suggested Machiavelli capsule voice (M1 and M12 only, for the demo):
- M1: "In the first month you wrote little and watched much. The courtyard at
  dawn, the sound of the fountain. You asked the system nothing."
- M12: the existing 55-word memoryStory, unchanged.

---

## 10 // BUILD PLAN (not started)

Phased so each phase ships alone, green, and is felt by a member.

```
PHASE  NAME                    CHANGE                                                      FILES (verify before editing)
─────  ────                    ──────                                                      ─────
P0     Clock fix               Add metadata.usershipStartedAt on tag grant; backfill from  models/user.ts, admin-api.ts,
       (fixes G1, G5)          first usership-gated answer log; pulse uses it; seen state  MonthlyPulseWidget.tsx, migrations/
                               moved to metadata.capsuleSeen
P1     Capsule engine          generateMonthCapsule() in memory/ + local composer; store   memory/capsule-generator.ts (new),
       (fixes G2,G3,G4,G8)     memoryCapsules[]; idempotent; GET /api/memory/capsules       routes/api.ts, scheduled-jobs.ts
P2     Months Unlocked +       New widget; MonthlyPulse v2 reads capsule, keeps static     MonthsUnlockedWidget.tsx (new),
       Capsule ceremony        fallback; LOG instrument line CAPSULE:                      MonthlyPulseWidget.tsx, System.tsx
P3     Seals                   month_seal_01..12 types + award logic IN THE SAME CHANGE   utils/badges.ts, easter-eggs.ts
P4     Two keys                density ceiling by month; unlock table; "Changed:" line     utils/interfaceEvolution.ts,
       (fixes G7)                                                                          stores/evolution.ts
P5     Vault + Seasons         Vault widget; season jobs at M3/M6/M9                       MemoryVaultWidget.tsx (new)
P6     Portrait + sign         Annual Portrait; sign -> public memoryStory                 PublicProfile.tsx, public-api.ts
P7     Demo upgrade            Machiavelli gets capsules + seasons                         public-api.ts
```

Gates for each phase (LOT-benchmark): `tsc --noEmit` on touched files, lint,
build, and a render check at each density. Doctrine to respect:
Render Isolation (Vault and Months widgets subscribe narrowly),
Backend Whitelist Hygiene (add `memory_capsule` to `displayableEvents` if logged),
Graceful Degradation (capsule absent = static message, never a blocked UI),
Cross-Device Sync (SSE `settings_updated` on capsule seen / sign).

Cost note (P): one capsule is ~1,500 input tokens at 70B pricing from the
feature inventory ($0.88/M tokens) = well under $0.01 per member per month.
13 AI calls per member per year (12 capsules + portrait) plus 3 seasons.

---

## 11 // OPEN QUESTIONS FOR S-2

1. **Voice of the capsule.** 2nd person ("You answered...") as drafted, or
   3rd person like today's story ("They..."), or 1st person like Machiavelli's?
   Recommendation: 2nd person for capsules, 1st person only for the signed portrait.
2. **Month = 30 days from upgrade, or calendar month?** Recommendation: 30-day
   anniversary from `usershipStartedAt`. Calendar months make Month 1 a partial
   month for most members.
3. **Lapsed members.** If Usership lapses at M6 and returns at M9: freeze the
   counter, or resume? Recommendation: freeze; the shelf keeps what was sealed.
4. **Should the density ceiling be visible?** A "Next:" line telling the member
   density tightens at M5 makes the future tangible. Recommendation: yes.
5. **Is Month 1 allowed any badge UI at all?** Draft says no. Day 1 stays blank.
6. **Public by default?** The Vault on `/u/you` is strong social proof but the
   capsules are intimate. Recommendation: private by default, per-capsule
   publish toggle, Annual Portrait public only when signed.
7. **Cadence of the 12 AI verbs.** Each is one sentence in the AI prompt.
   Approve the ladder, or reorder (e.g., Challenges earlier)?

---

```
AUTHORIZED BY: S-2 // VADIK MARMELADOV
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
```
