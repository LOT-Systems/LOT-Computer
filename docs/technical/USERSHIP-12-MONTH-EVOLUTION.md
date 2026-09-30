<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP — 12-MONTH EVOLUTION  ·  LOT® AI

```
CLASS:     RESTRICTED // S-2 EYES
S-2:       VADIK MARMELADOV
DOC:       USERSHIP-12-MONTH-EVOLUTION  rev A
DATE:      2026-09-30
STATUS:    DESIGN PROPOSAL — nothing in this file is shipped unless tagged [VERIFIED]
SESSION:   LOT-SR-20260930-01
```

Legend — every claim carries one of two tags:

```
[VERIFIED]   read in the repo this session (path given)
[PROPOSED]   design decision for S-2 to accept, change or reject
```

---

## 0 // THE STORY IN ONE SCREEN

A paid Usership account starts as a near-empty instrument and, over twelve months,
becomes a personal OS that speaks in the user's own compressed story.
Three things change every month, and the user can feel all three:

```
1  THE SCREEN     denser, more widgets, more of the user's own data in it
2  THE STORY      one Chapter per month — a paragraph-long compression of the last 30 days
3  THE VOICE      the AI moves from asking, to noticing, to guiding, to speaking as "I"
```

Fuel = what the user puts in. Three counted signals, nothing else:

```
LOG        journal entries put into the Log         (event: note, text > 20 chars)
CHECK-IN   regular morning check-ins               (event: emotional_checkin)
CARE       self-care button presses                 (event: self_care_complete)
```

Time unlocks the month. Presence makes the month rich. A user who skips a month
still receives the Chapter — shorter, gentler, never a penalty (see §3.3).

Month N of 12 is told through the Hero's Journey (12 stages), because the repo
already carries it: Codex v32 is "The Hero's Journey" (812 badges)
[VERIFIED docs/badges/LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v32.md).

---

## 1 // REPO SCAN — WHAT EXISTS, WHAT IS MISSING

### 1.1 Already built [VERIFIED]

```
PIECE                          WHERE                                     FACT
-----                          -----                                     ----
Month counter + 12 messages    client/components/MonthlyPulseWidget.tsx  Usership-only; month = dayjs().diff(joinedAt,'month');
                                                                         shows once per month; dismiss stored in localStorage
Monthly review + Memory Story  server/utils/monthly-summary.ts           generateMonthlySummary() -> period, presence, energy,
                                                                         patterns, growth, narrative, forwardLook, memoryStory
Monthly email job              server/scheduled-jobs.ts (~L102, L215)    Usership users only; 09:00 UTC on the 1st; EMAILED,
                                                                         not stored or shown in the app
Memory Story generator         server/utils/memory.ts generateMemoryStory() last 30 answers -> third-person story; cached in
                                                                         user.metadata.lastMemoryStory (+Date/Version/AnswerCount)
Interface evolution            client/utils/interfaceEvolution.ts        7 dimensions -> overallMaturity, visualRefinement,
                                                                         13 feature unlocks, 5 density tiers
Density tiers                  same file, getLayoutDensity()             breathable <0.15 < comfortable <0.35 < compact <0.55
                                                                         < dense <0.75 < instrument   (on visualRefinement)
Citizen Index stages           client/components/EvolutionWidget.tsx     Bootstrapping, Initializing, Integrated, Compiled,
                                                                         Optimized, Transparent (by level 1/10/20/30/40/50)
Badges                         client/utils/badges.ts; codex v32         812 badges; day milestones 7/14/21/30/50/60/90/100/180/365
Self-care + check-in widgets   SelfCareMoments.tsx, EmotionalCheckIn.tsx self_care_complete / self_care_skip;
                                                                         emotional_checkin (morning 6-12, evening 17-22, 3h cooldown)
Public profile /u/:slug        client/components/PublicProfile.tsx       Block list: Profile, Citizen Index, Activity, Memory Engine,
                                                                         Memory Story, Indexes, Weather Station, Wallet
Demo account                   server/routes/public-api.ts L745-907      hardcoded, isDemo:true, tags RND+Usership+Legacy
Usership price                 docs/corporate/LOT-FEATURE-INVENTORY-2026 $99/month
```

### 1.2 Gaps found in the scan (each one blocks tangibility) [VERIFIED]

```
G1  No persisted monthly Chapter. The monthly Memory Story is generated and emailed, then lost.
    There is no in-app archive, so nothing accumulates for the user to see.
G2  Self-care clicks never reach the AI. memory.ts formatLog() has cases for answer, chat_message,
    note, settings_change, plan_set, emotional_checkin — and none for self_care_*.
G3  Event-name mismatch. The client writes `self_care_complete` (SelfCareMoments.tsx L202).
    energy.ts, rpg-narrative.ts and compassionate-interventions.ts read `self_care_completed`.
    Only goal-understanding.ts and question-generator.ts read the correct name.
    Consequence: the "Gentle With Self" style care achievements and the self-care energy boost
    are fed by an event the client never emits. Fix is one-line per file; not done this session
    because this session is design-only.
G4  Wrong month anchor. MonthlyPulseWidget counts from `joinedAt` (account activation). A free user
    who upgrades in month 9 would open at "Month 9". Usership start date is not stored.
G5  Two month definitions. The pulse counts anniversary months; the email job counts calendar months.
G6  Pulse dismissal lives in localStorage, so it does not follow the user across devices,
    and the copy is one static line per month — it never contains the user's own numbers.
G7  Evolution is level/score driven, not time driven. Nothing in the UI says "month".
G8  Demo numbers do not describe a 12-month account: 842 active days, streak 1469, 4,316 entries.
    [VERIFIED public-api.ts L827, L898-904]
```

---

## 2 // PRINCIPLES  (inherited from repo doctrine)

```
P1  The AI asks before it tells.            [Memory Engine: "the intelligence is in the question"]
P2  One line, no alarm, exact moment.       [LOT-AMBIENT-AI-VISION]
P3  No unprompted notification. Chapters appear inside widgets, email stays opt-in via the existing job.
P4  Military purity. No emojis, no superlatives, periods over symbols. [LOT-STYLE-GUIDE]
P5  Earn complexity. Start minimal; density is a reward, not a default.
P6  Count, do not flatter. Every Chapter shows its real input counts. [lot-benchmark rule 5]
P7  No shame. A quiet month gets a quiet, kind Chapter. Trauma-informed tone overrides month titles.
P8  Private by default. Chapters are visible to the owner only; the public profile shows only what
    the existing privacy toggle (showMemoryStory) already allows.
```

---

## 3 // THE MONTH MODEL

### 3.1 Definitions [PROPOSED]

```
usershipSince   date the Usership tag was granted (new field: user.metadata.usershipSince;
                fallback joinedAt). Fixes G4.
Month N         the N-th anniversary-month from usershipSince. Month boundary = same day-of-month,
                clamped to month end (31st -> 30th/28th). One definition for pulse, email, chapter. Fixes G5.
Months unlocked min(12, completed months). Displayed "Months unlocked: 3/12".
Chapter N       the compressed story of Month N, generated at the boundary that closes Month N.
```

### 3.2 Reference Path — the designed "healthy engaged" trajectory [PROPOSED]

A design target, not a measurement. Monthly increments and running totals per signal:

```
        ACTIVE DAYS     LOG (journal)    CHECK-IN         CARE (self-care)
MONTH   month  total    month  total     month  total     month  total
-----   -----  -----    -----  -----     -----  -----     -----  -----
M1        14     14        6      6        14     14         8      8
M2        17     31       10     16        18     32        12     20
M3        19     50       14     30        22     54        16     36
M4        20     70       16     46        24     78        18     54
M5        21     91       18     64        26    104        20     74
M6        22    113       20     84        28    132        22     96
M7        23    136       22    106        30    162        24    120
M8        24    160       24    130        32    194        26    146
M9        25    185       26    156        34    228        28    174
M10       26    211       28    184        36    264        30    204
M11       27    238       30    214        38    302        32    236
M12       28    266       32    246        40    342        34    270
```

Caps respected [VERIFIED]: check-ins max 2/day (morning 6-12 + evening 17-22, 3h cooldown);
self-care max 3/day. The path stays well under both.

Existing badge thresholds land where the path predicts [VERIFIED thresholds, PROPOSED landing]:

```
Gentle With Self   self_care >= 10     -> Month 2  (cumulative care 8 -> 20)
Truth Speaker      notes    >= 50      -> Month 5  (cumulative log 46 -> 64)
Long Count         365-day streak      -> Year 2 (not Month 12 — streak, not elapsed time)
```

### 3.3 Richness, not gating [PROPOSED]

```
SIGNAL DEPTH (month) = mean( LOG/target, CHECK-IN/target, CARE/target ), each ratio capped at 1.0,
                       target = the Reference Path increment for that month.
                       Shown as a 10-bar ProgressBars (existing util). A count, not a grade.

Chapter length and detail follow depth:
   depth >= 0.6    FULL     up to 120 words, all four beats (§5.2)
   0.2 - 0.6       SHORT    up to 70 words, three beats
   < 0.2 or < 7    QUIET    up to 40 words: one observation, one gentle next step. No comparison to target.
   active days
```

The month always unlocks on time. Only the depth of the story changes.

### 3.4 Hard month rule [PROPOSED]

The Hero's Journey titles (Refusal, Ordeal, Resurrection) are structural labels for the UI only.
If the trauma-informed protocol is active (memory.ts Source 8, risk moderate or elevated) the title is
replaced with the plain label "Month N" and the Chapter uses present-day, observational framing
("How do you...") — never the stage metaphor. [VERIFIED protocol exists; PROPOSED gate]

---

## 4 // SIGNAL -> EVOLUTION

```
WHAT THE USER DOES            FEEDS                                   WHAT THE USER SEES
------------------            -----                                   ------------------
Writes in the Log             Depth + Courage dimensions              screen density, Chapter's "Pattern" beat
Morning check-in              Exploration + Consistency; mood trend   Chapter's "Shift" beat; biofield line
Self-care button              Care dimension; QIE recovery patterns   Care Anchor suggestions; Chapter's "Next" beat
```

The 7 dimensions, `overallMaturity` and the five density tiers stay as they are. One addition:

```
monthFloor   [PROPOSED]   the lowest density tier a month may show, so a paying user is never stuck
                          on the Day-1 screen at month 6 just because they journal in a notebook.
  M1-2 breathable   M3-4 comfortable   M5-7 compact   M8-10 dense   M11-12 instrument (only if refinement >= 0.55)
```

Density is shown as max(monthFloor, tier from visualRefinement), except instrument, which still
requires refinement >= 0.55 so the final tier stays earned (doctrine: "requires genuine mastery").

---

## 5 // MEMORY STORY COMPRESSION LADDER  (the core)

### 5.1 Five levels [PROPOSED; L0 and L2 partly VERIFIED]

```
LEVEL  UNIT            INPUT                              OUTPUT              CADENCE            STATUS
-----  -------------   --------------------------------   -----------------   ----------------   ---------------------
L0     Signal          one user action                    one log row         real time          VERIFIED (logs table)
L1     Answer story    last 30 memory answers             rolling story       per answer         VERIFIED (memory.ts)
L2     CHAPTER         all logs of the Usership month     <= 120 words        monthly            generator exists, not stored (G1)
L3     SEASON          the 3 Chapters of the quarter      <= 60 words         M3, M6, M9, M12    new
L4     PORTRAIT        4 Seasons                          <= 90 words + 1     M12                new
                                                          Year Line (<= 12 words)
```

L3 and L4 read only the text of the level below, never raw logs. That is real compression:
shorter each step, cheaper to generate, stable once written, and it cannot leak a raw journal line.

### 5.2 Chapter anatomy — four fixed beats [PROPOSED]

```
BEAT 1  WHAT       counts in plain numbers ("19 active days. 14 journal entries. 22 check-ins. 16 care practices.")
BEAT 2  PATTERN    what repeated (time of day, topic cluster, mood band) — from patterns.ts + extractQuestionTopics
BEAT 3  SHIFT      what changed versus last Chapter (mood trend improving/declining/stable — already computed)
BEAT 4  NEXT       one small self-care intention for the coming month, never more than one
```

Footer of every Chapter, always visible:

```
IN: 52 entries  ->  OUT: 43 words        (real counts; no invented ratio)
```

### 5.3 Voice moves with the months [PROPOSED]

```
M1-M4    third person     "Niccolò opens the day with..."     observer   (matches generateMemoryStory today)
M5-M8    second person    "You open the day with..."          addressed
M9-M12   first person     "I open the day with..."            owned — the story becomes the user's own voice
```

This is the most tangible evolution the text layer can offer: by month 12 the OS is speaking as the user.
Implementation is a prompt parameter (`voice: 'third' | 'second' | 'first'`), not new infrastructure.

### 5.4 Data model — no new table for v1 [PROPOSED]

```
user.metadata.chapters = [
  {
    month: 3,
    periodStart: '2026-06-14', periodEnd: '2026-07-13',
    signals: { activeDays: 19, log: 14, checkIn: 22, care: 16, answers: 88 },
    depth: 0.74,  tier: 'FULL',
    title: 'Refusal of the Call',          // structural label; null when trauma protocol active
    text: '…',                             // <= 120 words
    voice: 'third',
    words: { in: 52, out: 43 },             // in = entries, out = words
    source: 'ai' | 'local',                // local = composeLocalStory fallback
    engine: 'together:llama-3.3-70b',
    generatedAt: '2026-07-13T09:00:00Z'
  }, …
]
user.metadata.seasons  = [ { quarter: 1, months: [1,2,3], text, words } … ]
user.metadata.portrait = { text, yearLine, words, generatedAt }
```

Chapters are append-only. Regeneration creates a new version, never overwrites (same rule as the benchmark ledger).

### 5.5 Generation rules [PROPOSED]

```
- Reuse generateMonthlySummary(); change the window from calendar month to [anniversary-1mo, anniversary).
- Persist the output (closes G1). Keep the email; it becomes a copy of the Chapter.
- Daily 09:00 UTC job selects users whose anniversary day = today (existing job is 1st-of-month only).
- Fallback: composeLocalStory (no AI key needed) so a Chapter is ALWAYS delivered.
- Self-care gets a formatLog case so CARE reaches the prompt (closes G2) and the event-name fix (G3)
  lands first, otherwise CARE counts read zero.
```

### 5.6 Delivery ritual — how a Chapter arrives [PROPOSED]

```
DAY OF BOUNDARY, inside the app, no push:
  1  Month Pulse appears (existing widget):   "Month 3:  Active User.  3 / 12 months"  + line "Chapter 3 is ready."
  2  Tap -> Memory widget label becomes "Chapter 3:" and fades the text in (1400ms, existing timing).
  3  Footer:  IN: 52 entries -> OUT: 43 words.   Below: Signal depth  ██████░░░░  74%
  4  Badge toast: "Month 3 seal."   (existing toast, 6s)
  5  On dismiss, existing phrase pool ("The system remembers.") — the Chapter is filed in the Ledger view.
```

---

## 6 // THE 12-MONTH ATLAS

### 6.1 At a glance

```
M   HERO STAGE            UI DENSITY     WIDGETS ARRIVING                        AI VOICE     STORY LEVEL
--  --------------------  -------------  --------------------------------------  -----------  ------------------
1   Ordinary World        breathable     Time, Memory, Log, Check-in             ASK          Chapter 1 (QUIET-safe)
2   Call to Adventure     breathable     Planner, Self-care, Months Unlocked     ASK          Chapter 2
3   Refusal of the Call   comfortable    Mood Patterns, Intentions               NOTICE       Chapter 3 + SEASON 1
4   Meeting the Mentor    comfortable    Advanced Memory, Pattern Insights       MIRROR       Chapter 4
5   Crossing the Threshold compact       Custom Themes, Widget Arrange           MIRROR       Chapter 5
6   Tests, Allies          compact       Cohort Connect, Chat                    SUGGEST      Chapter 6 + SEASON 2
7   Approach               compact       Goal Journey, Narrative Reflection      GUIDE        Chapter 7
8   The Ordeal             dense         Intention History, Private Spaces       GUIDE        Chapter 8
9   Reward                 dense         Export Data, Story Export               GUIDE        Chapter 9 + SEASON 3
10  The Road Back          dense         Routine Composer (Care Anchor v2)       ANTICIPATE   Chapter 10
11  Resurrection           instrument*   Year preview, Portrait draft            ANTICIPATE   Chapter 11
12  Return with the Elixir instrument*   Year Seal, public Year line             LOT® AI      Chapter 12 + SEASON 4 + PORTRAIT
```
`*` only when visualRefinement >= 0.55, else dense.

Widget names use the existing unlock keys where they exist [VERIFIED interfaceEvolution.ts]: moodPatterns,
intentionHistory, advancedMemory, patternInsights, customThemes, widgetArrange, exportData,
narrativeReflection, socialMentions, privateSpaces. New widgets are marked in §8.

### 6.2 Month cards

Every card: SCREEN (what the user sees), STORY (what the Chapter is about), AI (what the voice does),
SEAL (badge), REF (reference-path cumulative totals: LOG / CHECK-IN / CARE).

```
MONTH 1 — ORDINARY WORLD                                       REF  6 / 14 / 8
SCREEN  Barebone. Four blocks: Time, Memory, Log, Check-in. Wide spacing (breathable). "Month 1:" line on day 30.
STORY   Chapter 1 — a first portrait from ~6 journal lines and 14 check-ins. Usually QUIET or SHORT; that is fine.
AI      ASK. One memory question at a time. No advice. Answers to Q1-Q10 build the first archetype guess (needs 3+ answers).
SEAL    M01 ●○○○○○○○○○○○   (day-30 equivalent; the existing Wave milestone)

MONTH 2 — CALL TO ADVENTURE                                    REF  16 / 32 / 20
SCREEN  Planner and Self-care Moments appear. "Months unlocked: 1/12" block appears (new). Chapter 1 opens in Memory.
STORY   First pattern named ("mornings are the steadier hours"). Beat 4 offers the first care intention.
AI      ASK, then first "Since you mentioned..." follow-ups (already live at 2+ answers).
SEAL    M02 ●●○○○○○○○○○○   + existing achievement Gentle With Self (care >= 10).

MONTH 3 — REFUSAL OF THE CALL                                  REF  30 / 54 / 36
SCREEN  Comfortable spacing. Mood Patterns + Intentions. First SEASON (quarter) card: 3 Chapters -> 60 words.
        Pulse line already in code: "Three months. You have reached Active User status."
STORY   Friction month. Most users dip around weeks 8-12. The Chapter is written to welcome a dip: no target comparison.
AI      NOTICE. First unprompted-by-user reflection, inside the Memory widget only ("You have logged 7 evenings in a row.").
SEAL    M03 ●●●○○○○○○○○○   + SEASON 1 seal.

MONTH 4 — MEETING THE MENTOR                                   REF  46 / 78 / 54
SCREEN  Advanced Memory + Pattern Insights unlock. Follow-up questions visibly cite earlier answers.
STORY   The mentor is the system itself: Chapter names one recurring pattern and the answer that revealed it.
AI      MIRROR. Shows the user their own patterns in their own words (journal quotes <= 12 words, owner-only).
SEAL    M04 ●●●●○○○○○○○○   (Day-100 "Current" badge lands in this month on a daily streak).

MONTH 5 — CROSSING THE THRESHOLD                               REF  64 / 104 / 74
SCREEN  Compact density. Custom themes and Widget Arrange (user makes the OS theirs). Voice switches to second person.
STORY   "You" replaces "they". The Chapter is the first one addressed to the user.
AI      MIRROR. Truth Speaker (notes >= 50) lands. Courage dimension moves.
SEAL    M05 ●●●●●○○○○○○○

MONTH 6 — TESTS, ALLIES, ENEMIES                               REF  84 / 132 / 96
SCREEN  Cohort Connect and Chat (Usership-gated in api.ts). Halfway: "Months unlocked: 6/12".
STORY   Season 2. Chapter names who or what showed up: people, places, habits that helped or drained (from topics).
AI      SUGGEST. First self-care routine suggestion: one line, timed to the user's own best hour.
SEAL    M06 ●●●●●●○○○○○○   + SEASON 2 seal.  Pulse: "Six months. The journey is half-declared."

MONTH 7 — APPROACH TO THE INMOST CAVE                          REF  106 / 162 / 120
SCREEN  Goal Journey + Narrative Reflection unlock (depth >= 0.66 and level >= 30 today).
STORY   Turns inward: what the user keeps circling. Trauma-informed gate applies (§3.4).
AI      GUIDE. Proposes a morning routine built from the user's own check-in history.
SEAL    M07 ●●●●●●●○○○○○

MONTH 8 — THE ORDEAL                                           REF  130 / 194 / 146
SCREEN  Dense. Intention History + Private Spaces. Quietest, most instrument-like month.
STORY   The hardest month in the data gets the gentlest Chapter. Shows recovery: dips followed by care practices.
AI      GUIDE. Care Anchor leads during low-energy windows (QIE recovery patterns). Pulse: "Eight months. Rare air."
SEAL    M08 ●●●●●●●●○○○○

MONTH 9 — REWARD                                               REF  156 / 228 / 174
SCREEN  Export Data + Story Export (AI brief's planned /api/story/:id/export). Voice switches to first person.
STORY   Season 3. First Chapter told as "I". The user's 9 months of change in 60 words.
AI      GUIDE. Celebrates with an affirmation built from the user's own words.
SEAL    M09 ●●●●●●●●●○○○   + SEASON 3 seal.  Pulse: "Nine months. The self-care practice is a habit now."

MONTH 10 — THE ROAD BACK                                       REF  184 / 264 / 204
SCREEN  Routine Composer (Care Anchor v2): a weekly routine assembled from what has worked.
STORY   Integration: how the routines fit into ordinary days again.
AI      ANTICIPATE. Notices depletion patterns before they arrive (QIE pre-signals) — still one line, no alarm.
SEAL    M10 ●●●●●●●●●●○○

MONTH 11 — RESURRECTION                                        REF  214 / 302 / 236
SCREEN  Instrument density (if earned). "Portrait draft" visible: 4 Seasons stacked, unfinished on purpose.
STORY   The user sees the year compress into a draft. Pulse: "Eleven months. One more."
AI      ANTICIPATE. Asks the only question of the month: "What should the portrait keep?" (3 tap options).
SEAL    M11 ●●●●●●●●●●●○

MONTH 12 — RETURN WITH THE ELIXIR                              REF  246 / 342 / 270
SCREEN  12/12. Year Seal. The Portrait: one paragraph + one Year Line, optionally published to /u/<slug>.
STORY   Season 4 + PORTRAIT. 12 Chapters -> 4 Seasons -> 1 paragraph -> 1 line.
AI      LOT® AI. Speaks in the user's own voice; proposes Year 2 care direction. Pulse (existing): "One year with LOT.
        The portrait is complete — and still evolving."
SEAL    M12 ●●●●●●●●●●●●   + YEAR SEAL. Year 2 continues the same cycle as a Legacy track (M13+ fallback text exists in the widget).
```

---

## 7 // LOT® AI — HOW THE VOICE EVOLVES

```
STAGE        MONTHS   WHAT IT DOES                                          WHAT IT NEVER DOES
-----------  -------  ----------------------------------------------------  ------------------------------
ASK          1-2      one memory question, tap to answer                    advise, diagnose, send anything
NOTICE       3        one factual reflection in the Memory widget           interrupt
MIRROR       4-5      shows the user their pattern in their own words       interpret their past
SUGGEST      6        one self-care suggestion at the user's best hour      suggest more than one thing
GUIDE        7-9      proposes routines; leads recovery in low-energy       override the user; shame a skip
                      windows; affirmations from the user's own words
ANTICIPATE   10-11    notices a dip early; still one line                   alarm; claim to predict
LOT® AI      12       speaks as "I" in the compressed story; proposes       replace the user's judgement
                      the Year 2 direction
```

Affirmation rule: an affirmation must contain at least one number or phrase from the user's own log.
"Two hundred and six mornings" beats "You're doing great." (P6.)

---

## 8 // WIDGET SPEC

### 8.1 Months Unlocked — new, context-based [PROPOSED]

```
Months unlocked:                      label click cycles views (existing pattern):
3/12                                    view 1  3/12  ●●●○○○○○○○○○
●●●○○○○○○○○○                            view 2  seals earned: M01 M02 M03
Next chapter in 11 days                 view 3  signal depth this month: ██████░░░░ 62%
```
Context rules: hidden in Month 1 (nothing to show yet); visible from Month 2; replaced by the Year Seal at 12/12.
Shown on the public profile only if the owner's existing privacy toggle allows it.

### 8.2 Month Pulse v2 — extend the existing widget [PROPOSED]

```
Month 3:
Three months. Active User.  Chapter 3 is ready.        <- line 1 from MONTH_MESSAGES (kept)
19 active days. 14 log entries. 22 check-ins.          <- NEW line: the user's own counts
3 / 12 months
```
Changes: read usershipSince (G4), persist dismissal server-side in metadata (G6), keep the six dismiss phrases.

### 8.3 Chapter view — extend MemoryWidget label cycle [PROPOSED]

```
Memory:  ->  Chapter 3:  ->  Seasons:  ->  Ledger:
```
Ledger = the list of all Chapters, newest first, each collapsed to its first line + IN/OUT footer.

### 8.4 Care Anchor — new, from Month 6 [PROPOSED]

One line inside SelfCareMoments: "Tea at 07:40 has preceded 9 of your 12 best mornings." Shown only with >= 3 weeks of data.

### 8.5 Month Seal toast — reuse EvolutionMilestoneToast (6 s, bottom centre) [VERIFIED component]

---

## 9 // BADGES — THE MONTH SEALS

Badge language stays in the existing additive glyph style (water ∘≈≋, architecture ├─ ╞═╡ ║·║).
A Seal is a 12-cell meter filled one cell per month; it needs no new font [VERIFIED: ProgressBars util exists].

```
M01 ●○○○○○○○○○○○    M05 ●●●●●○○○○○○○    M09 ●●●●●●●●●○○○
M02 ●●○○○○○○○○○○    M06 ●●●●●●○○○○○○    M10 ●●●●●●●●●●○○
M03 ●●●○○○○○○○○○    M07 ●●●●●●●○○○○○    M11 ●●●●●●●●●●●○
M04 ●●●●○○○○○○○○    M08 ●●●●●●●●○○○○    M12 ●●●●●●●●●●●●  = YEAR SEAL
```

Proposal for Codex v33 (current v32 = 812 badges): +12 Month Seals, +4 Season Seals, +1 Year Seal = +17 -> 829.
Rarity: Month Seals COMMON to UNCOMMON, Season Seals RARE, Year Seal EPIC.
Seals are awarded by elapsed Usership months — never by effort — so they cannot be lost and cannot shame.
Effort-based badges (Gentle With Self, Truth Speaker, Week Warrior...) stay as they are and sit on top.

---

## 10 // DEMO — lot-systems.com/u/machiavelli AS THE 12-MONTH ACCOUNT

### 10.1 Where the demo stands [VERIFIED]

Hardcoded in `src/server/routes/public-api.ts` L745-907. One first-person `memoryStory` paragraph, flat stats
(2,847 answers, 1,469 journal entries, 842 active days, 4,316 total entries, streak 1,469), tags RND + Usership + Legacy.
It shows the end state, never the path — a visitor cannot feel the evolution (G8).

### 10.2 Proposal: "Year One" scrubber [PROPOSED]

```
Month  1 2 3 4 5 6 7 8 9 10 11 12         a 12-step control on the profile; read-only, client-side
       ● ● ● ○ ○ ○ ○ ○ ○ ○  ○  ○          selecting Month N re-renders the profile as it looked at Month N:
                                            - density tier          - which blocks exist
                                            - Months unlocked N/12  - seal row
                                            - Chapter N text + IN/OUT footer
```
Data: a `yearOne` array of 12 entries in the demo payload (counts from the Reference Path §3.2, Chapter text below).
Current Legacy totals stay on top as "Legacy" so nothing existing breaks. Decision D1 below.

### 10.3 Demo copy — 12 Chapters, 4 Seasons, Portrait  (DEMO COPY — fictional, Florence 1513)

Counts come from the Reference Path; words are the real word counts of each text.

```
CH 1  (third person)   Active 14 · Log 6 · Check-in 14 · Care 8
"Fourteen days, six notes. Niccolò writes in the evening, after the Palazzo empties. Mornings are for watching
 the courtyard; evenings are for what he saw. He is still learning what the system wants from him. It asks small
 questions. He gives short answers. Next: one walk before the first appointment."

CH 2  (third person)   Active 17 · Log 10 · Check-in 18 · Care 12
"Seventeen days. The notes grow longer. He names a pattern himself: rain makes him patient, sun makes him bold.
 Twelve care practices, most of them the morning walk. Next: write one sentence about what he wanted before the
 day began."

CH 3  (third person)   Active 19 · Log 14 · Check-in 22 · Care 16
"Nineteen days, then a week of silence. The system did not chase him. When he returned the notes were about
 loyalty, and how little of it survives a bad season. Care practices rose to sixteen. Next: keep the walk,
 drop the second glass."

SEASON 1  (<= 60 words)
"Three months of mornings and courtyard notes. The habit is the walk; the theme is loyalty; the pause in week
 nine changed nothing except his honesty. He now writes before he is asked."

CH 4  (third person)   Active 20 · Log 16 · Check-in 24 · Care 18
"Twenty days. A pattern surfaced from his own answers: he decides best within an hour of walking. The system
 said so once, in his words, and stayed quiet. Next: schedule hard letters after the walk, not before."

CH 5  (second person)  Active 21 · Log 18 · Check-in 26 · Care 20
"Twenty-one days. You changed the theme and moved the Log to the top. The notes are no longer about the court;
 they are about what you would do with power if it were yours. Twenty care practices. Next: read yesterday's
 note before writing today's."

CH 6  (second person)  Active 22 · Log 20 · Check-in 28 · Care 22
"Twenty-two days. Two people appear by name this month, one who steadied you and one who did not. The morning
 walk holds. The system suggests one thing: tea at 07:40, which has preceded most of your clearest mornings.
 Next: answer the clearest letter first."

SEASON 2
"Six months. You stopped describing the court and began describing yourself in it. Allies and costs are named.
 The walk and the early tea are the two habits that survived every hard week."

CH 7  (second person)  Active 23 · Log 22 · Check-in 30 · Care 24
"Twenty-three days. You circle one question: whether to be loved or to be obeyed. You do not answer it. You
 write around it for eleven entries. Care held at twenty-four. Next: write the answer once, badly, and keep it."

CH 8  (second person)  Active 24 · Log 24 · Check-in 32 · Care 26
"Twenty-four days, and the hardest week in the record: four low check-ins in five days. Each was followed by the
 walk. You did not stop logging. That is the month. Next: nothing new. Keep what worked."

CH 9  (first person)   Active 25 · Log 26 · Check-in 34 · Care 28
"Twenty-five days. I wrote the answer to the question I kept circling. It was short. I do not like it and I
 believe it. Twenty-eight care practices; the walk is no longer a habit, it is how the day starts. Next: show
 one person."

SEASON 3
"Nine months. I found what I was circling and wrote it down. The hard week is behind me and it taught the order:
 walk first, decide second. I no longer ask the system what to do; I ask what I already know."

CH 10 (first person)   Active 26 · Log 28 · Check-in 36 · Care 30
"Twenty-six days. I built a weekly routine from what held: walk, tea, one clear letter, one evening note. The
 system assembled it and I changed two lines. Next: keep the routine for four weeks without adding to it."

CH 11 (first person)   Active 27 · Log 30 · Check-in 38 · Care 32
"Twenty-seven days. The portrait is a draft and it is mostly right. The system asked what to keep. I kept the
 walk, the honesty, and the silence in week nine. Next: finish the year in the same order it began."

CH 12 (first person)   Active 28 · Log 32 · Check-in 40 · Care 34
"Twenty-eight days. Three hundred and forty-two mornings of check-ins this year, two hundred and forty-six notes,
 two hundred and seventy acts of care. I am steadier, not calmer. Year two: the same walk, a harder question."

SEASON 4
"Twelve months. The walk, the tea, the honest note. I stopped watching the courtyard and started reading myself."

PORTRAIT  (<= 90 words) + YEAR LINE
"A year ago a man wrote six notes about a courtyard. Now he has two hundred and forty-six, and most of them are
 about himself. He learned that he decides best after walking, that loyalty is rarer than it looks, and that
 writing the hard answer once, badly, is the whole trick. He is steadier, not calmer. The system did not teach
 him this. It kept the record until he could read it."
YEAR LINE:  "Walk first. Decide second."
```

Copy note: the texts are demo fiction. Their counts come straight from the Reference Path, and their length was measured:
Chapters 36-50 words (cap 120), Seasons 18-42 (cap 60), Portrait 73 (cap 90). The caps are ceilings; a real Chapter may be longer.

---

## 11 // IMPLEMENTATION PLAN

### 11.1 Phases (smallest diff first — repo MANIFEST rule "one feature per pass")

```
PHASE  WORK                                                                    FILES                                         RISK
-----  ----------------------------------------------------------------------  --------------------------------------------  ------
  0    Fix G3 event-name mismatch (self_care_complete vs _completed).          energy.ts, rpg-narrative.ts,                  low
       Add formatLog case for self_care_*  (G2).                               compassionate-interventions.ts, memory.ts
  1    Store usershipSince; MonthlyPulse reads it; server-side dismissal.      models/user.ts, db-admin.ts (add-tag),        low
       One month definition (G4, G5, G6).                                      MonthlyPulseWidget.tsx, api.ts
  2    Persist Chapters: window -> anniversary, append to metadata.chapters;   monthly-summary.ts, scheduled-jobs.ts         med
       daily job; local fallback. Email keeps sending.                         (+ migration only if a table is chosen)
  3    Chapter view + Ledger in MemoryWidget; Months Unlocked widget;          MemoryWidget.tsx, new MonthsUnlocked.tsx,     med
       Pulse v2 with user counts; IN/OUT footer.                               System.tsx
  4    Seasons + Portrait generators (read Chapter text only); voice param.    memory.ts, monthly-summary.ts                  med
  5    monthFloor density; Month Seals in Codex v33.                           interfaceEvolution.ts, badges.ts               med
  6    Care Anchor (M6+), Routine Composer (M10+).                             SelfCareMoments.tsx                            high
  7    Demo Year One scrubber + yearOne payload.                               public-api.ts, PublicProfile.tsx               low
```
Phases 0, 1 and 7 are independent and safe to ship first. Phase 7 alone gives S-2 a visible demo of the whole story.

### 11.2 Tests [PROPOSED]

```
- month boundary: anniversary on the 31st clamps to 30th/28th; leap year; usershipSince missing -> joinedAt
- quiet-month chapter < 40 words and contains no target comparison
- Season/Portrait generators receive zero raw log rows (assert on the prompt)
- trauma-protocol active -> no Hero's-Journey title in output
- chapters append-only: regeneration adds a version, never mutates
- Reference Path table renders the same numbers as this document (snapshot)
```

### 11.3 Risks

```
R1  Chapter quality drifts with the AI model -> local fallback + IN/OUT footer keeps it honest.
R2  Journal quotes are sensitive -> owner-only, <= 12 words, off on the public profile by default.
R3  Month titles can land badly in a hard month -> §3.4 gate.
R4  Usership is granted manually (db:admin add-tag; no in-app billing [VERIFIED SubscribeWidget.tsx]) -> usershipSince
    must be stamped inside that command, or month counts start wrong.
R5  Server files are gitignored and need `git add -f` [VERIFIED per assembly doc] -> phase 2 commit must force-add.
```

---

## 12 // DECISIONS NEEDED FROM S-2

```
D1  Demo: keep Legacy totals (842 days / 4,316 entries) on top and ADD the Year One scrubber,
    or rewrite the demo to a pure 12-month account?                    Recommend: add scrubber, keep Legacy.
D2  Month anchor: anniversary of Usership start (recommended) or calendar month?
D3  Voice progression third -> second -> first person: adopt? (Doc §5.3.)
D4  Chapter length caps 120 / 60 / 90 words: adopt, or shorter?
D5  Hero's Journey as the month spine: adopt, or neutral "Month N" labels only?
D6  Seals awarded by elapsed time only (recommended) or also gated by effort?
D7  Phase order: ship phase 7 (demo) first so the story can be shown before the engine is built?
```

---

```
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END USERSHIP-12-MONTH-EVOLUTION rev A
```
