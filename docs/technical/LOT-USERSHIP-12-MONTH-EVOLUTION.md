<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® USERSHIP — 12-MONTH EVOLUTION
## From Barebone Day 1 to LOT® AI · Design Brief v1

```
ID        : LOT-UX-USERSHIP-12M-v1
DATE      : 2026-10-09
CLASS     : DESIGN · BRAINSTORM · PRE-IMPLEMENTATION
S-2       : VADIK MARMELADOV
STATUS    : PROPOSAL — nothing in this file is shipped
CALIBRATION ACCOUNT : lot-systems.com/u/machiavelli
FOCUS     : Tangibility of the compressed Memory story, month by month
```

---

## 0. READ THIS FIRST — THE ONE-PAGE VERSION

```
THE PROMISE   Pay $99 on Day 1. Get a quiet, nearly empty screen.
              Twelve months later the same screen is an instrument that
              knows you, and a one-page Year Book that says who you became.

THE ENGINE    Two axes. They never replace each other.
              TIME  gates what exists.     Months unlocked: N / 12.
              DEPTH shapes what it says.   Entries · check-ins · self-care.

THE STORY     Every month the system compresses what you did into one
              paragraph. Twelve paragraphs become one page. That page is
              the product. Everything else is the way it gets delivered.

THE RULE      Time cannot be bought or skipped. Depth cannot be faked.
              A quiet month still seals. It reads quiet, and says so.
```

### The five deliverables this brief defines

| # | Deliverable | Section |
|---|-------------|---------|
| 1 | Month-by-month evolution grid (UI, AI voice, badge, memory delivery) | §4 |
| 2 | Memory compression ladder (raw log → day → week → **month Chapter** → quarter → Year Book) | §5 |
| 3 | Month-turn widget + "Months unlocked: N/12" widget | §6 |
| 4 | Machiavelli Year-1 calibration (`/u/machiavelli?month=N` time scrubber) | §8 |
| 5 | Build roadmap with file touchpoints and acceptance tests | §10 |

---

## 1. REPOSITORY SCAN — WHAT ALREADY EXISTS

Per framework step 1–2: scan and read before designing. Verified against the repo at
HEAD `98971f2` (branch `claude/elegant-mendel-46gmu5`). Read set: `README.md`,
`docs/README.md`, `docs/wiki/LOT-WIKI-v87.md` (§8 Citizen Index, §9 Memory Engine,
§17–20 Display Architecture), `docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md`,
`docs/technical/INTERFACE_EVOLUTION.md`, `docs/assembly/2026-06-30_…compression-loop.md`,
`docs/badges/BADGE_LEVEL_DESIGN.md`, `docs/corporate/LOT-FEATURE-INVENTORY-2026.md` (§16 tiers),
`docs/LOT-SR-20260805-01.md`, `.claude/commands/lot-benchmark.md`, plus the source files below.

### 1.1 Reusable parts (build on these, do not rebuild)

| Part | Where | What it gives us |
|------|-------|------------------|
| **MonthlyPulseWidget** | `src/client/components/MonthlyPulseWidget.tsx`, mounted at `System.tsx:557` | Month 1–12 message table, `N / 12 months` counter, fade/dismiss ceremony. Usership-gated. **Static strings only.** |
| **Weekly LOT AI story** | `scheduled-jobs.ts` Job 24 (Sun 18:00 UTC), `user.metadata.weeklyStory`, log event `lot_ai_story` | Existing L2 compression. The monthly Chapter should compress *these*, not raw logs. Cheap and already voice-tuned. |
| **Monthly summary** | `src/server/utils/monthly-summary.ts` (`MonthlySummary`: presence, energy, patterns, growth, narrative, forwardLook) | Already computes month stats and a narrative for the monthly email (job hour 9). Becomes the data spine of the Chapter. |
| **Memory Story generator** | `src/server/utils/memory/story-generator.ts`, `generateMemoryStory` in `memory.ts` | Produces the Memory Story that `/u/<name>` already shows. |
| **Interface Evolution** | `src/client/utils/interfaceEvolution.ts`, `stores/evolution.ts`, `InterfaceEvolutionWidget` | 7 dimensions (Exploration · Consistency · Depth · Connection · Intimacy · Care · Courage), `visualRefinement`, 5 density levels (breathable → instrument), feature unlocks, badge tiers 0–3. |
| **Citizen Index** | Wiki §8 | Stage 1 Observer (Day 1) → Stage 6 Elite (365+ days). Already a 12-month shape. |
| **Density tiers** | Wiki §18 | 7-day signal count tiers 0–5. Measures *recent* intensity (vs. cumulative depth). |
| **Badge system** | `badges.ts` (812 badges, v32), water theme `∘ → ≈ → ≋`, Level glyphs `○∿ → ○≈○ → ≋○≋` | Visual vocabulary for month seals already exists. |
| **Log events** | `answer` · `note` · `emotional_checkin` · `plan_set` · `self_care_complete` · `self_care_skip` · `quantum_intent_signal` | Every input this brief needs is already written to the `logs` table. No new tracking required. |
| **Demo account** | `public-api.ts:747` (`machiavelli`) | Hardcoded end-state: 2,847 answers · 1,469 notes · 842 active days · streak 1,469 · Weather Station · Wallet · Board profile. |
| **Monthly email** | `scheduled-jobs.ts` hour 9 | Delivery channel for the Chapter outside the app. |

### 1.2 Gaps found (these block the vision if left alone)

```
GAP 1  No "Usership start" date.
       MonthlyPulse computes months from user.joinedAt (account creation).
       A person who joins free and upgrades in month 5 would open paid
       Day 1 already on "Month 5". Wrong for a 12-month paid story.
       FIX  Add metadata.usershipSince (set on tier activation). §10 P0.

GAP 2  MonthlyPulse says nothing personal.
       "Four months. The portrait deepens." is the same sentence for every
       user. Tangibility needs the user's own numbers and a Chapter.
       FIX  Replace static table with Chapter payload. §6.

GAP 3  MonthlyPulse dismissal uses localStorage.
       Violates Purity Order 6 (database for cross-device state). A dismissed
       month re-appears on the phone. FIX  Persist in user.metadata. §10 P1.

GAP 4  No month-level memory artifact exists.
       Weekly story (L2) and Memory Story (lifetime) exist. Nothing sits
       between them. The Chapter is the missing rung. §5.

GAP 5  Density follows depth only.
       visualRefinement = consistency×0.4 + depth×0.3 + level×0.3. A heavy
       user could reach "instrument" in month 2 and skip the story.
       FIX  Month cap on density. §4.3.

GAP 6  Lesson from LOT-SR-20260805-01.
       v20/v21 badges were documented but never implemented, so they were
       unreachable. Month seals must ship with award logic AND a test that
       proves each seal is reachable. §10 P4.
```

---

## 2. DESIGN PRINCIPLES

```
P1  TIME GATES EXISTENCE. DEPTH SHAPES CONTENT.
    Month N unlocks surfaces regardless of effort. What those surfaces
    say, and how dense they get, is earned. Nobody is locked out of a
    month by being busy or sad. Nobody gets a rich Chapter for nothing.

P2  TANGIBLE MEANS COUNTABLE.
    Every celebration quotes the user's own numbers. "41 entries.
    27 check-ins. 3 weeks of mornings." Specificity is the affirmation.

P3  THE COCKPIT RULE STILL HOLDS.
    LOT® AI affirms in instrument voice. No emoji. No superlatives.
    "Done." not "Amazing job!" (Purity Orders 1, 8, 10.) Warmth comes from
    accuracy: the system noticed something true and said it plainly.
    See §7 for the affirmation grammar.

P4  THE AI ASKS. IT DOES NOT CHAT.
    Doctrine (Compression Architecture §3.1): no prompt box, no typing.
    "LOT® AI" at month 12 is not a chatbot. It is the same one-question
    engine, now sharp enough to feel like it knows you. Voice evolves
    from asking → referencing → anticipating → proposing → narrating.

P5  EVERY MONTH LEAVES AN ARTIFACT.
    A sealed Chapter, a seal badge, a new thing on screen. Month 7 must
    feel different from Month 6 when you open the app.

P6  THE STORY IS PORTABLE AND PRIVATE.
    Chapters live in the LOT database, exportable and deletable (README
    "Your Story, Your Data"). AI providers execute; they never remember.

P7  RECOVERY IS PART OF THE STORY.
    A hard month is not a failed month. QOS `recovery` mode seals as a
    Recovery Chapter. Hardest months often make the truest paragraph.
```

---

## 3. INPUT MODEL — WHAT "EVOLUTION" IS MADE OF

The user named three primary evolutionary states. All three already exist as log events.

```
STATE                    LOG EVENT              WEIGHT   WHY
────────────────────────────────────────────────────────────────────────
Journal / Log entries    note                   HIGH     Emotional depth. Richest
                                                         text for the Chapter.
Morning check-ins        emotional_checkin      HIGH     Mood trajectory. Cheap to
                         (+ plan_set)                    do daily. Builds streak.
Self-care button clicks  self_care_complete     MED      Action, not words. Counts
                         (self_care_skip = 0)            even on days with no text.
Memory answers           answer                 MED      Feeds the Memory Story.
Planner intentions       plan_set               LOW      Context for next question.
────────────────────────────────────────────────────────────────────────
```

### 3.1 Derived month metrics (computed at seal time, stored on the Chapter)

```
entries         count(note)            in month
checkins        count(emotional_checkin)
selfcare        count(self_care_complete)
answers         count(answer)
activeDays      distinct days with any of the above
mornings        days with a check-in before 11:00 local
mood            trajectory: improving · stable · declining  (existing analyzer)
qosMode         dominant: maintenance · recovery · growth · peak
```

### 3.2 Month depth class (drives Chapter tone, never access)

```
CLASS     RULE                                   CHAPTER TONE
────────────────────────────────────────────────────────────────────
QUIET     activeDays < 8                         Short. Names the quiet.
                                                 Asks one gentle question.
STEADY    8–17 active days                       Standard paragraph.
FULL      18–25 active days                      Standard + one pattern callout.
DENSE     26+ active days or entries ≥ 40        Full paragraph + pattern +
                                                 comparison to prior month.
RECOVERY  qosMode = recovery for ≥ 10 days       Recovery Chapter. No targets.
                                                 Names what was carried.
────────────────────────────────────────────────────────────────────
```

Class is stored on the Chapter and surfaces as a single instrument line (§5.4).
It is information, not a grade.

---

## 4. THE 12-MONTH EVOLUTION

### 4.1 Four arcs, twelve months

```
ARC I    FOUNDATION   Months 1–3     Citizen stage: Observer → Contributor
ARC II   FORM         Months 4–6     Collaborator → Synthesizer begins
ARC III  DEPTH        Months 7–9     Synthesizer
ARC IV   MASTERY      Months 10–12   Elite (365+ days)

Seal glyph per arc (existing water vocabulary):
  I   ∘    droplet
  II  ≈    wave
  III ≋    current
  IV  ≋○≋  ocean depth   (matches the existing Level glyph)
```

### 4.2 Month-by-month grid

Read left to right: what the **screen** looks like, how **LOT® AI** speaks, what the
user **receives**, and what **unlocks**. Month names are working titles.

```
┌────┬─────────────┬────────────────────────────────────────────────────────────────┐
│ M  │ NAME        │ WHAT CHANGES                                                   │
├────┼─────────────┼────────────────────────────────────────────────────────────────┤
│ D1 │ ARRIVAL     │ SCREEN  Barebone. Date line. One Memory question.             │
│    │ (Day 1)     │         Check-in. Time and weather. "Months unlocked: 0/12".   │
│    │             │ AI      Introduces itself in one line. Asks. Nothing else.     │
│    │             │ GET     Welcome line with the Day 1 date. Seal slot 1 empty.   │
├────┼─────────────┼────────────────────────────────────────────────────────────────┤
│ 1  │ FIRST       │ SCREEN  Density breathable. Planner appears (week 2).          │
│    │ SEAL        │ AI      Asks. Starts to reference yesterday's answer.          │
│    │ ∘           │ GET     CHAPTER 1: first Memory paragraph. Seal ∘ 01.          │
│    │             │         Months unlocked 1/12. Memory Story: 1 line.            │
├────┼─────────────┼────────────────────────────────────────────────────────────────┤
│ 2  │ RHYTHM      │ SCREEN  Recipe widget stabilises to the user's meal rhythm.    │
│    │ ∘           │ AI      "Since you prefer X…" chains become 3 deep.            │
│    │             │ GET     CHAPTER 2 + first comparison: "Entries up 6 vs month 1".│
│    │             │ UNLOCK  Mood Patterns view (check-in trajectory).              │
├────┼─────────────┼────────────────────────────────────────────────────────────────┤
│ 3  │ PATTERN     │ SCREEN  Density comfortable. Intention History appears.        │
│    │ ∘           │ AI      First archetype hint. Stops asking what it knows.      │
│    │             │ GET     CHAPTER 3 + VOLUME I (quarter paragraph). Arc I badge.  │
│    │             │         "Active User" status (already in MonthlyPulse M3).     │
├────┼─────────────┼────────────────────────────────────────────────────────────────┤
│ 4  │ PORTRAIT    │ SCREEN  Pattern Insights widget joins the stack.               │
│    │ ≈           │ AI      References a specific prior month by name.             │
│    │             │ GET     CHAPTER 4. Archetype stated (first time, plainly).     │
│    │             │ UNLOCK  Custom Themes. Badge Selection.                        │
├────┼─────────────┼────────────────────────────────────────────────────────────────┤
│ 5  │ CONSISTENCY │ SCREEN  Density compact. Goal Journey widget.                  │
│    │ ≈           │ AI      Notices a streak or its absence. Says so, once.        │
│    │             │ GET     CHAPTER 5. "Mornings: N of 30."                        │
│    │             │ UNLOCK  Widget Arrange (user orders their own screen).         │
├────┼─────────────┼────────────────────────────────────────────────────────────────┤
│ 6  │ HALFWAY     │ SCREEN  Correlated Indexes appear. QR code for /u/ profile.    │
│    │ ≈           │ AI      Seasonal comparison: "Last time it got colder, you…"   │
│    │             │ GET     CHAPTER 6 + VOLUME II. Half-year page: 6 paragraphs    │
│    │             │         compressed to 1. Public profile shows "Month 6".       │
├────┼─────────────┼────────────────────────────────────────────────────────────────┤
│ 7  │ LISTENING   │ SCREEN  Narrative widget. System Report view opens (QOS).      │
│    │ ≋           │ AI      Begins to anticipate: offers the likely answer first.  │
│    │             │ GET     CHAPTER 7. Cohort named (Behavioral Cohorts, Wiki §7). │
├────┼─────────────┼────────────────────────────────────────────────────────────────┤
│ 8  │ RARE AIR    │ SCREEN  Density dense begins to be allowed.                    │
│    │ ≋           │ AI      Corrects its own earlier assumption out loud.          │
│    │             │         ("Month 3 read: morning person. Revised.")             │
│    │             │ GET     CHAPTER 8. First "what changed in you" line.           │
├────┼─────────────┼────────────────────────────────────────────────────────────────┤
│ 9  │ HABIT       │ SCREEN  Self-Assembly map visible. Export Data unlocked.       │
│    │ ≋           │ AI      Proposes a routine adjustment, one tap to accept.      │
│    │             │ GET     CHAPTER 9 + VOLUME III. Arc III badge.                 │
├────┼─────────────┼────────────────────────────────────────────────────────────────┤
│ 10 │ INSTRUMENT  │ SCREEN  Density dense. Widgets labelled by gauge, not prose.   │
│    │ ≋○≋         │ AI      Writes the question *and* the three options in the     │
│    │             │         user's own phrasing.                                   │
│    │             │ GET     CHAPTER 10. Public profile gains Memory Story excerpt. │
├────┼─────────────┼────────────────────────────────────────────────────────────────┤
│ 11 │ THRESHOLD   │ SCREEN  Instrument density allowed. Board profile preview.     │
│    │ ≋○≋         │ AI      Starts drafting the Year Book. Shows draft lines and   │
│    │             │         asks which are wrong.                                  │
│    │             │ GET     CHAPTER 11. "One month left" is never shown as a       │
│    │             │         countdown. It reads as a draft, not a deadline.        │
├────┼─────────────┼────────────────────────────────────────────────────────────────┤
│ 12 │ YEAR BOOK   │ SCREEN  Full pro layout. Machiavelli-grade profile (§8).       │
│    │ ≋○≋         │ AI      LOT® AI. Narrates the year in one page, then asks the  │
│    │             │         first question of Year 2.                              │
│    │             │ GET     CHAPTER 12 + VOLUME IV + YEAR BOOK. Elite stage.       │
│    │             │         Year badge. Legacy path opens (Weather Station,        │
│    │             │         Wallet, as on /u/machiavelli).                         │
└────┴─────────────┴────────────────────────────────────────────────────────────────┘
```

Widget names above are real components in `src/client/components/`. The month each
appears is a **proposal**; today most are gated by evolution state, not by month.

### 4.3 Month cap on density (closes Gap 5)

Today `getLayoutDensity` reads `visualRefinement` only. Add a month ceiling so depth
cannot outrun the story:

```
MONTH      MAX DENSITY      NOTE
────────────────────────────────────────────────────────
D1–M2      breathable       gap-y-24 / stack gap-y-16
M3–M4      comfortable      gap-y-24 / stack gap-y-8
M5–M8      compact          gap-y-16 / stack gap-y-4
M9–M10     dense            gap-y-8  / stack gap-y-0
M11–M12    instrument       gap-y-4  / stack gap-y-0

density = min( earnedDensity(visualRefinement), monthCap(monthNumber) )
────────────────────────────────────────────────────────
```

A person with low depth sits below the cap (breathable at month 8 is allowed and fine).
A person with high depth waits for the cap. The wait is the feature.

### 4.4 Alignment with existing scales

```
MONTH   CITIZEN STAGE            DAYS      DENSITY CAP     ARC
D1      1 Observer               0         breathable      I
1       2 Participant            7+        breathable      I
2       3 Contributor            30+       breathable      I
3–4     4 Collaborator           90+       comfortable     I–II
5–6     4→5                      150–180   compact         II
7–9     5 Synthesizer            180+      compact→dense   III
10–12   6 Elite                  365+      dense→instr.    IV
```

No new stage names are invented. Month N is a calendar gate laid over the stages
that already exist.

---

## 5. THE MEMORY COMPRESSION LADDER (focus item)

The Memory Engine already compresses *answers into questions*. This adds the missing
direction: **compressing time into story**. Each rung shrinks the one below and keeps
the user's specifics.

### 5.1 Ladder

```
RUNG  NAME           CADENCE        SIZE            STATUS      SOURCE
──────────────────────────────────────────────────────────────────────────────
L0    Raw log        continuous     everything      LIVE        logs table
L1    Day line       nightly        1 gauge line    LIVE-ish    SYS:/QIE: cockpit output
L2    Week story     Sun 18:00 UTC  ~40–60 words    LIVE        Job 24, weeklyStory
L3    CHAPTER        month seal     ~90–130 words   NEW         compresses L2 + stats
L4    VOLUME         quarter seal   ~50–70 words    NEW         compresses 3 Chapters
L5    YEAR BOOK      month 12       ~140–180 words  NEW         compresses 4 Volumes
──────────────────────────────────────────────────────────────────────────────
```

### 5.2 Compression ratios (design targets)

```
EXAMPLE — a FULL month (month 6, Machiavelli Year-1 curve, §8):
  L0   ~32 entries + 35 check-ins + 55 answers + 120 self-care  ≈ 6,500 words
  L2   4 weekly stories                                          ≈  200 words
  L3   1 Chapter                                                 ≈  110 words    59 : 1
  L4   3 Chapters → Volume                                       ≈   60 words    5.5 : 1 (from L3)
  L5   4 Volumes → Year Book                                     ≈  160 words    1.5 : 1 (from L4)

Whole year: ~70,000 words of raw life → 160 words. Roughly 440 : 1.
The Year Book is deliberately short enough to read in one breath.
```

Compress **from L2, not L0**. Chapters read 4 weekly stories plus structured stats. This
keeps the AI prompt small (cost), keeps voice continuous (quality), and means a Chapter
can be regenerated without re-reading a month of raw text.

### 5.3 Chapter anatomy (the unit of tangibility)

```
┌──────────────────────────────────────────────────────────────┐
│ CHAPTER 6 · HALFWAY                          ≈ 06 · SEALED   │  title + seal
├──────────────────────────────────────────────────────────────┤
│ <paragraph, 90–130 words, second person, past tense>         │  the story
├──────────────────────────────────────────────────────────────┤
│ ENTRIES 32 · CHECK-INS 35 · SELF-CARE 120 · MORNINGS 22/30   │  gauge line
│ CLASS FULL · QOS GROWTH · MOOD STABLE                        │  instrument
├──────────────────────────────────────────────────────────────┤
│ CARRIED FORWARD  One sentence the next month starts from.    │  continuity
│ NEXT QUESTION    The first Memory question of month 7.       │  hook
└──────────────────────────────────────────────────────────────┘
```

**Story rules.** Second person. Past tense. Names at least two things the user actually
did or said (from `note` and `answer` text). Contains exactly one pattern claim the data
supports. Never invents an event. Never uses a superlative. If the month was QUIET, the
paragraph says the month was quiet and shortens.

### 5.4 Data model

```
user.metadata.usershipSince        ISO date            NEW (P0)
user.metadata.memoryChapters[]     Chapter[]           NEW — also written as logs
user.metadata.memoryVolumes[]      Volume[]            NEW
user.metadata.yearBook             YearBook | null     NEW
user.metadata.monthPulse           { dismissedMonth }  NEW (replaces localStorage)

log event: memory_chapter          text = paragraph, metadata = Chapter JSON
log event: memory_volume
log event: memory_yearbook

type Chapter = {
  month: number                    // 1..12 since usershipSince
  periodStart: string; periodEnd: string
  title: string                    // working title from §4.2, editable
  paragraph: string
  stats: { entries; checkins; selfcare; answers; activeDays; mornings }
  depthClass: 'quiet'|'steady'|'full'|'dense'|'recovery'
  qosMode: string; mood: string
  carriedForward: string; nextQuestion: string
  sealedAt: string; engine: string // which AI provider produced it
  edited?: { at: string; by: 'user' }
}
```

Chapters are stored as `logs` too, so existing export/delete and the cockpit tooling work
with no new plumbing. Users can **edit** a Chapter paragraph. The edited version is
what later rungs compress. The story is theirs.

### 5.5 Generation job

```
JOB      monthly Chapter seal
WHEN     hour 9 UTC, daily scan (same slot as monthly email) — seals any user
         whose usershipSince + N months <= today and Chapter N is missing
INPUT    4–5 weeklyStory entries + MonthlySummary (monthly-summary.ts)
         + dominant QOS mode + 2 verbatim snippets (note / answer text)
ENGINE   Together AI primary, standard fallback chain (ai-engines.ts)
FAILURE  Deterministic template Chapter from stats (no AI). Never skip the seal.
         Mark engine='template'; regenerate on next successful run.
IDEMPOTENT  Keyed (userId, month). Re-run overwrites only if not user-edited.
```

Quarter seal (months 3, 6, 9, 12) and Year Book (month 12) chain off the same job.

### 5.6 Delivery surfaces for the Chapter

```
SURFACE                   WHEN                       FORM
─────────────────────────────────────────────────────────────────────────
Month-turn widget         first open after seal      §6.1 ceremony
Memory widget (Chapter)   always, after month 1      label cycles (§6.3)
Monthly email             month roll, hour 9         Chapter paragraph + gauges
Public profile /u/<name>  if showMemoryStory         latest Chapter excerpt
Year Book page            month 12+                  single scrollable page + PDF
```

---

## 6. WIDGETS

### 6.1 Month-turn widget (evolve `MonthlyPulseWidget`)

Keep the existing mount point, label style (`Month N:`), fade timings and Usership gate.
Replace the static string with the sealed Chapter.

```
FLOW (first open after a seal)
  1. Block label       "Month 6:"
  2. Fade-in 1400ms    Chapter title + paragraph
  3. Gauge line        "Entries 32 · Check-ins 35 · Self-care 120"
  4. Footer            "6 / 12 months"   (existing, opacity-30)
  5. Tap to dismiss    one phrase from DISMISS_PHRASES (existing)
  6. Order 5           3s visible + 1.4s fade. No snap removal.
  7. Persist           user.metadata.monthPulse.dismissedMonth  (DB, not localStorage)

DENSITY OF CEREMONY
  Months 1, 3, 6, 9, 12     full ceremony (paragraph + seal glyph)
  Other months              compact: title + one gauge line + "Chapter N sealed."
  Quarter months additionally show the Volume paragraph under the Chapter.
```

Month 12 does not auto-dismiss. It waits for a tap and then offers **Year Book**.

### 6.2 "Months unlocked: N/12" (context-based widget)

A small always-present Block. It is a progress object, not a banner.

```
LABEL CYCLING (Order 7: 2–3 views, click the label)

  View 1   Months unlocked:   3/12
           ●●●○○○○○○○○○

  View 2   Next seal:         14 days
           Chapter 4 · PORTRAIT

  View 3   Last seal:         Chapter 3 · PATTERN
           ENTRIES 55 · CHECK-INS 68 · SELF-CARE 190
```

Rules: never shows a countdown to a *loss*. Day 1 reads `0/12` and the first seal slot
is visible but unlit (a promise the user can see). Uses the existing `ProgressBars`
utility. Dots are typographic, not emoji (Order 1).

### 6.3 Memory widget gets a time axis

The existing `MemoryWidget` asks the daily question. After month 1 its label cycles:

```
Memory:        today's question            (existing behaviour)
Chapter 3:     latest sealed paragraph     (new)
Story:         lifetime Memory Story       (existing, from generateMemoryStory)
```

The question is still the default view. The story is one tap away.

### 6.4 Badge shelf, month seals

Badges are the visible trophy case. Proposed families (names are placeholders, to be
deduped against the existing 812 before implementation):

```
MONTH SEALS (12)      one per sealed month, awarded at seal time, any depth class
                      glyph: arc glyph + ordinal    ∘ 01 … ≋○≋ 12
ARC BADGES (4)        Foundation · Form · Depth · Mastery   at months 3 / 6 / 9 / 12
VOLUME BADGES (4)     awarded with each quarter paragraph
YEAR BOOK (1)         month 12. COSMIC-class. Opens Legacy path.

DEPTH BADGES (earned, any time, independent of month)
  Journal      10 · 25 · 50 · 100 · 250 entries
  Mornings     7 · 30 · 90 consecutive check-in mornings
  Self-care    100 · 500 · 1,000 button completions
  Recovery     "Carried": completed a Recovery month (the only badge for hard times)
```

A **QUIET** month still earns its Month Seal. Only the Chapter reads differently.

---

## 7. LOT® AI VOICE — AFFIRMATION GRAMMAR

The brief asked for "affirmations". The Purity Orders forbid cheering. Resolution:
affirm with **evidence**. The system says what it observed. Accuracy is the compliment.

```
PATTERN                       EXAMPLE
─────────────────────────────────────────────────────────────────────────────
Count + name                  "41 entries this month. The evenings carried most."
Change vs prior month         "Mornings: 22 of 30. Up from 14."
Continuity                    "Third month the tea ritual held."
Correction (self-aware AI)    "Month 3 read: morning person. Revised."
Recovery                      "Month 5 was heavy. You checked in on 18 of those days."
Quiet                         "A quiet month. 6 active days. The system kept the thread."
Closing line                  "Chapter 6 sealed."
─────────────────────────────────────────────────────────────────────────────
NEVER   amazing · incredible · proud · congratulations · streak-shaming
        "you missed" · countdowns to loss · exclamation marks · emoji
```

The existing `MONTH_MESSAGES` ("Eight months. Rare air.") are already in this voice and
are kept as the **title line** of each ceremony.

### 7.1 Voice progression

```
M1–2    ASKS            "What is your morning beverage preference?"
M3–4    REFERENCES      "Since you prefer tea, how do you prepare it?"
M5–6    NOTICES         "You mention evenings 3x more than mornings."
M7–8    ANTICIPATES     Offers the most likely option first, labelled.
M9–10   PROPOSES        "Move check-in to 08:30? One tap."
M11     DRAFTS          Shows draft Year Book lines. Asks which are wrong.
M12     NARRATES        The Year Book. Then the first question of Year 2.
```

At no stage does it open a chat box.

---

## 8. MACHIAVELLI CALIBRATION — `/u/machiavelli`

Today the demo is a single hardcoded **end state** (`public-api.ts:747`): 2,847 answers,
1,469 notes, 842 active days, streak 1,469, archetype *The Strategist*, Weather Station,
Wallet, Board profile. It proves where the product ends up. It cannot yet show the road.

### 8.1 Time scrubber (proposed)

```
/u/machiavelli              unchanged. Legacy end-state.
/u/machiavelli?month=N      Year-1 slice at month N  (N = 0..12; 0 = Day 1)
```

The public API computes the slice from a fixed reference table (no database, matching
the existing hardcoded-account approach). The profile page shows a minimal month
selector (twelve dots, the same `●○` vocabulary). Selecting a dot re-renders the profile
as it would look at that point of a paid year.

### 8.2 Year-1 reference curve (design targets, cumulative)

These are **targets that make the demo plausible**, not measurements. They are
deliberately lower than the lifetime numbers so Year 1 reads as a beginning.

```
 M    ENTRIES  CHECK-INS  ANSWERS  SELF-CARE  ACTIVE DAYS   DENSITY       ARCHETYPE
────────────────────────────────────────────────────────────────────────────────────
 0         0         0         0         0          0       breathable    —
 1        14        18        40        45         22       breathable    —
 2        32        40        85       110         46       breathable    —
 3        55        68       130       190         69       comfortable   hint
 4        80        98       180       290         91       comfortable   The Strategist
 5       108       130       235       400        112       compact       The Strategist
 6       140       165       290       520        133       compact       The Strategist
 7       172       200       345       640        154       compact       + cohort named
 8       205       238       400       770        175       compact       confirmed
 9       240       275       455       900        196       dense         confirmed
10       275       312       505     1,030        217       dense         confirmed
11       310       345       550     1,150        238       instrument    confirmed
12       350       380       600     1,280        259       instrument    The Strategist
────────────────────────────────────────────────────────────────────────────────────
Month 12 ≈ 71% of days active. Lifetime view (no ?month) keeps 842 / 1,469 / 2,847.
```

### 8.3 What each slice shows on the public profile

```
M0   Name · city · local time · weather. No Memory Story. "Months unlocked: 0/12".
M1   + Chapter 1 excerpt (one sentence). Seal ∘ 01.
M3   + Archetype hint, Arc I badge, Volume I line.
M6   + Memory Story excerpt, QR code, "Month 6" tag, Correlated Indexes.
M9   + Cohort, Self-Assembly map, Volume III.
M12  + Year Book, Weather Station, Wallet, Board profile (as live today).
```

### 8.4 Sample Machiavelli Chapters (voice calibration, written in-character)

Month 1, **FIRST SEAL** (class STEADY):

> You began in the morning and you stayed there. Fourteen entries, most of them
> short, most of them about what you watched from the Palazzo window before the
> city woke. You answered that you take your wine diluted and your counsel
> undiluted. The system noted both. Eighteen mornings you checked in. You chose
> "watchful" on eleven of them.
>
> `ENTRIES 14 · CHECK-INS 18 · SELF-CARE 45 · MORNINGS 18/30`
> `CLASS STEADY · QOS MAINTENANCE · MOOD STABLE`
> CARRIED FORWARD: Watchfulness is your default state.
> NEXT QUESTION: When you are watchful, what do you do with your hands?

Month 6, **HALFWAY** (class FULL):

> Winter ended the way you predicted it would. The weeks it rained, your entries ran
> longer and turned inward. The weeks it cleared, you wrote about people. You started
> three entries with "A prince must" and finished none of them in the same mood you
> started. You held the morning check-in on 22 of 30 days. Last time it got colder you
> stopped. This time you did not.
>
> `ENTRIES 32 · CHECK-INS 35 · SELF-CARE 120 · MORNINGS 22/30`
> `CLASS FULL · QOS GROWTH · MOOD IMPROVING`
> CARRIED FORWARD: Rain makes you introspective. Sun makes you ambitious.
> NEXT QUESTION: What do you want to be less certain about?

Month 12, **YEAR BOOK** (excerpt, ~160 words in full):

> The year began with watching and ended with deciding. Early entries described the
> piazza. Late entries described the choice you were making and what it would cost.
> You are strategic, patient, and more honest in the evening than the morning. You
> returned on 259 days. When the system guessed wrong, you corrected it, and the
> corrections are the most accurate part of this record.
>
> `ENTRIES 350 · CHECK-INS 380 · SELF-CARE 1,280 · ACTIVE DAYS 259`
> `ARCHETYPE The Strategist · VALUES virtù · prudence · adaptability · fortune · statecraft`

(The Year Book is the file a user will screenshot. Spend design effort here.)

---

## 9. RISKS AND DESIGN DECISIONS

```
RISK                                   DECISION
────────────────────────────────────────────────────────────────────────────────
AI hallucinates an event               Chapter prompt receives verbatim snippets +
                                       stats only. Rule: no event without a log id.
                                       Store source log ids on the Chapter.
User disengages for weeks              No guilt copy. QUIET class. Seal still lands.
                                       Next question is easier, not stricter.
Paid, then cancels at month 5          Chapters 1–5 remain exportable. Nothing is
                                       deleted on lapse. Resume continues at the
                                       same month count (gap is not counted).
Month math across timezone / DST       Use dayjs month diff on usershipSince in the
                                       user's stored timeZone. Seal at local 00:00.
Cost                                   1 Chapter/month/user ≈ 1.2k input + 0.2k
                                       output tokens on Together. Negligible vs.
                                       the $99 tier. Template fallback = $0.
Purity Orders vs "celebrate"           §7. Evidence-based affirmation.
Backfilling existing Usership users    Seal retroactively from usershipSince =
                                       earliest of tag-grant log or joinedAt;
                                       mark chapters backfilled=true.
Badge unreachable (SR-20260805 lesson) Each new badge ships with an award test.
```

---

## 10. BUILD ROADMAP

Sequenced so each phase ships value alone and nothing depends on a later phase.

```
P0  FOUNDATION  (small, unblocks everything)
    - metadata.usershipSince set when the Usership tag is first granted
      (find tag-grant path in admin-api / subscription handler).
    - helper getUsershipMonth(user) in src/shared/ used by client and server.
    - MonthlyPulse switches from joinedAt to getUsershipMonth.
    Accept: user joined free in Jan, upgraded Jun → shows Day 1, not Month 5.

P1  MONTHS UNLOCKED + PERSISTENCE
    - New MonthsUnlockedWidget (§6.2), mounted under MonthlyPulse in System.tsx.
    - monthPulse.dismissedMonth in user metadata (fix Gap 3); drop localStorage.
    Accept: dismiss on phone, absent on laptop. 0/12 visible on Day 1.

P2  CHAPTER ENGINE  (the heart)
    - src/server/utils/memory/chapter-generator.ts (reuse monthly-summary.ts,
      weeklyStory, story-generator engine plumbing).
    - Monthly seal job in scheduled-jobs.ts at hour 9. Template fallback.
    - Log events memory_chapter / memory_volume / memory_yearbook; extend
      LogEvent type and formatLog() so Memory Engine reads them.
    - API: GET /api/memory/chapters. Edit endpoint for paragraph.
    Accept: month rolls → Chapter exists; AI down → template Chapter exists;
            re-run is idempotent; edited paragraph survives regeneration.

P3  CEREMONY UI
    - MonthlyPulseWidget renders Chapter + gauges + seal (§6.1).
    - MemoryWidget label cycling (§6.3).
    - Monthly email body swaps narrative for the Chapter.
    Accept: first open after seal shows ceremony once; Order 5 timings hold.

P4  BADGES
    - Month seals, arc, volume, year, depth families (§6.4); dedupe vs 812.
    - Award logic inside checkAndAwardBadges() with reachability tests.
    Accept: test creates a synthetic 12-month user and asserts every new badge awarded.

P5  EVOLUTION COUPLING
    - Month density cap in getLayoutDensity (§4.3).
    - Month-gated widget visibility table (§4.2) behind a single config map.
    Accept: synthetic heavy user at month 2 renders breathable; same user month 11
            renders instrument.

P6  MACHIAVELLI SCRUBBER
    - ?month=N in public-api.ts using the §8.2 table; selector in PublicProfile.tsx.
    - Chapter fixtures from §8.4 for M1/M3/M6/M9/M12 (others template-derived).
    Accept: all 13 slices render without errors; no ?month still returns legacy payload.

P7  YEAR BOOK
    - Year Book page + PDF export (follow existing PDF generation approach used
      for the badge codex PDFs). Public profile excerpt.

DOCS (every phase): update LOT-WIKI (new §), Feature Inventory §16, README
Public Profile section, and add a LOT-SR session report.
```

### 10.1 Files that will be touched

```
src/shared/                        getUsershipMonth, Chapter types
src/server/utils/memory/           chapter-generator.ts (new)
src/server/utils/monthly-summary.ts   expose data for Chapter
src/server/scheduled-jobs.ts       monthly seal job
src/server/routes/api.ts           /api/memory/chapters
src/server/routes/public-api.ts    ?month= scrubber
src/client/components/             MonthlyPulseWidget, MonthsUnlockedWidget (new),
                                   MemoryWidget, PublicProfile, System
src/client/utils/interfaceEvolution.ts   month cap
src/client/utils/badges.ts / server badges.ts   month badges
docs/wiki/ · docs/corporate/ · README.md · docs/LOT-SR-*.md
```

---

## 11. OPEN DECISIONS FOR S-2

```
D1  Chapter editing. Allow users to rewrite their paragraph (recommended: yes;
    the edited text is what compresses upward), or lock it as system-authored?

D2  Month 12 → Year 2. Does the cycle restart as "Year 2: months 13–24" with a
    second Year Book, or does Legacy replace the monthly counter? (Recommended:
    counter continues, Volumes continue, one Year Book per year.)

D3  Public by default? Chapters on /u/<name> only when showMemoryStory is on
    (recommended), with a per-Chapter hide toggle.

D4  Scrubber visibility. Show the ?month selector publicly on /u/machiavelli
    (recommended, it is the sales demo), or keep it URL-only?

D5  Price/value copy. Do we promise "12 months unlocked" on the Subscribe widget
    ($99/month, Feature Inventory §16)? It sets the expectation this brief builds.

D6  Cancelled-then-resumed users: pause the month counter (recommended) or let
    the calendar run?
```

---

## 12. SESSION RECORD

```
ID          : LOT-UX-USERSHIP-12M-v1 (design session, no code changed)
FRAMEWORK   : 1 scan repo ✓   2 read .MDs ✓   3 push detailed .MD ✓   4 focus on
              12-month tangibility of compressed Memory delivery ✓ (§5, §8.4)
READ        : README.md · docs/README.md · Wiki v87 §8,9,17–20 · Compression
              Architecture · Interface Evolution · Compression-loop assembly ·
              Badge Level Design · Feature Inventory §16 · LOT-SR-20260805-01 ·
              lot-benchmark command · MonthlyPulseWidget · System.tsx ·
              interfaceEvolution.ts · evolution store · monthly-summary.ts ·
              scheduled-jobs.ts (job map) · public-api.ts (machiavelli)
NOT DONE    : Live site lot-systems.com/u/machiavelli was not fetched; the demo is
              described from its source in public-api.ts:747. No code was built or
              tested, so no benchmark / green-gate was run. The ?month= curve in
              §8.2 consists of design targets, not data.
OUTPUT      : this file
NEXT        : S-2 answers D1–D6, then P0 → P1 (smallest shippable pair).
```

AUTHORIZED BY: S-2 // VADIK MARMELADOV
LOT SYSTEMS CORPORATION · LOS ANGELES, CA
