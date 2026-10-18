<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP — 12-MONTH EVOLUTION TO LOT® AI
## Design brief · month-to-month UI · compressed Memory story delivery

```
S-2:        VADIK MARMELADOV
DOCUMENT:   USERSHIP-12-MONTH-EVOLUTION  rev A
CLASS:      ENGINEERING (design brief — no code changed this session)
STATUS:     PROPOSAL — brainstorm for S-2 decision. Nothing below is shipped
            unless it is listed in section 02 as EXISTING.
REFERENCE:  lot-systems.com/u/machiavelli (demo account = Month 12+ end state)
```

---

## 00 // THESIS

The Usership user must feel the system change shape **every month**, not only
get a notification about it. Three things move together:

```
AXIS            WHAT MOVES                           DRIVEN BY
────            ──────────                           ─────────
CALENDAR        Month 1 → 12 unlocked                presence (joinedAt, paid tier)
DEPTH           layout density, widgets, badges      activity (Log entries, check-ins,
                                                     self-care clicks)
STORY           one compressed chapter per month     Memory Engine compression
```

Calendar says **which month you are in**. Depth says **how much of that month you
filled**. Story says **what it meant**. A user who writes 600 entries and a user
who writes 60 both reach Month 12 on the same date — but their cockpit, badge
set and chapters differ. Time is guaranteed; depth is earned. No month is ever
taken away and no month is ever guilt-tripped (see section 08).

The Memory story is the spine. Every month ends with a **Chapter**: a
paragraph-long, third-person compression of that month's Log. At Month 12 the
twelve chapters compress once more into **The Year** — the LOT® AI portrait.

---

## 01 // REPO SCAN (2026-10-18, branch `claude/elegant-mendel-5vkpt0`)

Read before this session: README.md, docs/README.md, LOT-FEATURE-INVENTORY-2026
(§16 tiers), MEMORY-AND-QUANTUM-INTENT-ENGINES (§5 story generation),
benchmark LEDGER / LEXICON / MANIFEST, Badges Codex v24 header, last SR
(20260719-01). 143k lines of .md across docs/ — only the files that bear on
this brief were read in full; the rest are append-only history.

---

## 02 // WHAT ALREADY EXISTS (build on it, don't duplicate)

```
PIECE                       WHERE                                   STATE
─────                       ─────                                   ─────
MonthlyPulseWidget          client/components/MonthlyPulseWidget    LIVE. Usership only.
                                                                    Month N/12 line, one-shot
                                                                    dismiss per month (localStorage).
                                                                    Message per month is a single
                                                                    sentence — the thing to enrich.
Interface evolution         client/utils/interfaceEvolution.ts      LIVE. 7 dimensions, chapter 1-4,
                            client/stores/evolution.ts              visualRefinement, 5 layout
                                                                    densities (breathable → instrument).
Evolution gates             13 feature unlocks wired to 6 widgets   LIVE (progressive disclosure).
InterfaceEvolutionWidget    dimensions / unlocks / effects views    LIVE.
EvolutionMilestoneToast     toast on density / chapter change       LIVE.
Weekly LOT® AI story        scheduled-jobs.ts Job 24 (Sun 18:00)    LIVE. Template-based, no AI call.
                                                                    Writes `lot_ai_story` log +
                                                                    metadata.weeklyStory. Counts
                                                                    check-ins / self-care / intentions
                                                                    / notes. THIS IS LAYER 2 of the
                                                                    compression ladder already.
Memory story                memory.ts generateMemoryStory()         LIVE. Last 30 answers, AI,
                                                                    third person, en-dash insights.
Monthly email               scheduled-jobs.ts (monthly review)      LIVE.
Milestone badges            utils/badges.ts milestone_30/90/180/365 LIVE. Water + Architecture
                                                                    dual naming. 365 = Long Count /
                                                                    Citadel.
Badge Codex                 812 badges (v32)                        LIVE.
Assembly phase              dormant → awakening → forming →         LIVE (server computes, QR gate
                            assembled → integrated                  uses it).
Demo profile                public-api.ts  /profile/machiavelli     LIVE. Static: streak 1469,
                                                                    4316 total entries, 2847 answers,
                                                                    1469 notes, 842 active days,
                                                                    archetype The Strategist.
```

**Gaps this brief fills:**
1. Month is derived from `joinedAt` (the account date), not from the **paid
   Usership start**. A free-then-upgraded user would open at "Month 7" on day 1
   of paid. Needs `usershipSince`.
2. The monthly message is one hard-coded sentence — no per-user content.
3. Weekly stories exist but never roll up. No monthly or yearly layer.
4. Badges are day-count (30/90/180/365) not month-keyed; no month ceremony.
5. No "Months unlocked: N/12" context widget; no month 1 → 12 visual contract.
6. The demo account shows only the end state; a visitor cannot see the journey.

---

## 03 // THE COMPRESSION LADDER (the spine)

```
LAYER   UNIT        PRODUCED BY                   LENGTH          STATUS
─────   ────        ───────────                   ──────          ──────
L0      Entry       user (Log, check-in, click)   raw             live
L1      Day         —  (counts only, no text)     counts          live (stats)
L2      Week        Job 24 weekly story           1-3 sentences   live
L3      Month       NEW Job — Monthly Chapter     1 paragraph     PROPOSED
L4      Quarter     NEW — Quarter Plate (M3/6/9)  3 lines + badge PROPOSED
L5      Year        NEW — The Year (M12)          1 page, 12 ¶    PROPOSED
```

Rules (from CARDINAL RULE 5, honest engineering):

- **Chapter = template skeleton + AI paragraph.** Counts and mood are computed
  deterministically from Log (as Job 24 does). The AI call only writes the one
  paragraph of insight, grounded on those facts + the 4 weekly stories of that
  month + top memory answers. If AI fails → fall back to the template skeleton
  (never an empty month).
- **The compression number shown to the user is a count, not a ratio claim.**
  Display: `412 entries → 1 chapter (118 words)`. Real, reproducible, no
  invented "X:1 compression" marketing metric.
- **Chapters are immutable once sealed** (`sealedAt`). The user may annotate,
  never rewrite — the same append-only principle as the benchmark ledger. Memory
  of a month does not drift.
- **Third person, past tense, en-dash insights** — matches existing
  generateMemoryStory() format rules. Machiavelli's public `memoryStory` field is
  the style anchor.
- **Privacy:** chapters are private by default. Public profile shows only the
  latest chapter and only if `showMemoryStory` is on (existing flag).

### Proposed storage (no migration needed — user.metadata JSON)

```
metadata.usership = {
  since: ISO,                       // paid start; month N = floor(months since)+1
  chapters: [
    { month: 3, sealedAt: ISO, text: "...", words: 118,
      entries: 412, checkins: 61, selfCare: 74, notes: 188,
      dominantMood: "grounded", tone: "growth", badgeIds: ["..."] }
  ],
  quarters: [...], year: { sealedAt, text }
}
```

Plus a `lot_ai_chapter` Log event on seal (mirrors `lot_ai_story`) so the
chapter itself feeds the Memory Engine and survives metadata edits.

---

## 04 // THE THREE INPUTS THAT DRIVE DEPTH

S-2 named the key signals. Define them as the **Depth Score** shown (as a bar,
not a number) beside the month:

```
SIGNAL              LOG EVENT(S)                           WEIGHT
──────              ────────────                           ──────
LOG VOLUME          note, journal, answer                  0.40
MORNING CHECK-INS   emotional_checkin (once/day counts)    0.35
SELF-CARE CLICKS    self_care_complete(d)                  0.25
```

Per-month **reference targets** (Machiavelli-calibrated; tune after real data):

```
                  PER-MONTH TARGET        CUMULATIVE
LOG ENTRIES       ~120 (4/day)            ~1,440 at M12
CHECK-INS         ~24 days of 30          ~288
SELF-CARE CLICKS  ~45                     ~540
```

Machiavelli's stats (4,316 entries, 842 active days) sit **above** these targets
by design — the demo is the ceiling, not the median. The Depth bar fills against
the target, caps at 100%, and a full bar earns that month's **Seal** (see 05).

Depth feeds the existing `visualRefinement` (consistency × 0.4 + depth × 0.3 +
level × 0.3), so density evolution is already wired — this brief maps months to
the bands that formula already produces:

```
MONTH   DENSITY (existing)   visualRefinement band (existing thresholds)
─────   ──────────────────   ──────────────────────────────────────────
1-2     breathable           < 0.15
3-4     comfortable          0.15 – 0.35
5-7     compact              0.35 – 0.55
8-10    dense                0.55 – 0.75
11-12   instrument           ≥ 0.75
```

A fully-engaged user lands on the row for their month; a lighter user lags one
band behind. Calendar still unlocks the **month's ceremony, badge slot and
chapter** regardless — only density/widgets lag. This is the "tangible but
fair" contract.

---

## 05 // THE 12 MONTHS

Naming follows the existing Architecture badge metaphor (milestone_90 "Inner
Wall", 180 "Wing", 365 "Citadel") with the Water twin for users on that theme.
One build metaphor, twelve stations.

Legend per month: **UI** = what the screen looks like · **UNLOCK** = capability
· **CEREMONY** = what happens at month-turn · **BADGE** · **CHAPTER** = the
Memory story deliverable · **WIDGET** = context widget text.

### Quarter 1 — FOUNDATION (months 1-3) · breathable → comfortable

```
M1  GROUND              water: Shore
    UI        Barebone. One column, wide spacing, 3 widgets: Time, Check-in,
              Memory question. No density chrome. Month block reads
              "Month 1: Ground."
    UNLOCK    Memory Engine (AI questions), Log, morning check-in, self-care
              moments, QR (once assembly >= forming).
    CEREMONY  Day-1 welcome block (replaces nothing; shows once): "Usership
              active. 12 months. Month 1 of 12." Months strip appears as
              1 filled + 11 empty cells.
    BADGE     Keystone (first-day paid mark). Existing milestone_30 at day 30.
    CHAPTER   "Ground Report" — day 30. Short (60-90 words). Mostly
              orientation: what you logged, first mood signature, first
              question you answered twice.
    WIDGET    Months unlocked: 1/12

M2  FIRST COURSES       water: Shallows
    UI        Same layout. Check-in streak counter appears under the check-in.
              Memory widget shows "last month's chapter" teaser (1 line).
    UNLOCK    Intention History (existing gate), Mood Patterns lite.
    CEREMONY  Chapter 1 delivered at month-turn as a full Block. One dismiss.
    BADGE     Streak 7 / 14 / 21 (existing streak badges) get a Month-2 frame.
    CHAPTER   Chapter 1 ("Ground") sealed. Chapter 2 drafts weekly.
    WIDGET    Months unlocked: 2/12 · Chapter 1 sealed

M3  FOUNDATION          water: Tideline         [QUARTER 1 CLOSE]
    UI        First visible density shift: breathable → comfortable. Widgets
              start forming semantic stacks (Time+Weather, Check-in+Self-care).
              EvolutionMilestoneToast: "Stacks forming."
    UNLOCK    Planner Templates, Pattern Insights (QIE patterns visible),
              "Active User" status (already referenced in MONTH_MESSAGES[3]).
    CEREMONY  Quarter Plate Q1: three lines — the three words the system would
              use for you so far (derived from dominant moods + top
              archetype signals). Badge ceremony.
    BADGE     milestone_90 "Deep Reach" / Inner Wall (existing) — the quarter
              badge. First time the badge changes the page chrome: a
              1px foundation rule appears under the header.
    CHAPTER   Chapter 3 + Q1 Plate.
    WIDGET    Months unlocked: 3/12 · Foundation complete
```

### Quarter 2 — STRUCTURE (months 4-6) · comfortable → compact

```
M4  FIRST WALL          water: Current
    UI        Right-hand rail gains a second widget slot (Pattern Insights
              pinned). Spacing tightens a step.
    UNLOCK    Narrative Reflection (AI narrative synthesis, existing gate).
    CEREMONY  "Compare" view: Chapter 1 vs Chapter 4, side by side. First time
              the user sees themselves change.
    BADGE     Wall Course I
    CHAPTER   Chapter 4. First chapter allowed to cite a prior chapter.
    WIDGET    Months unlocked: 4/12 · Next seal: Depth 62%

M5  LOAD PATH           water: Channel
    UI        Compact density approaches. Check-in becomes a one-line strip
              (user knows the drill; the UI gets out of the way).
    UNLOCK    Custom Themes, Badge Selection (water/architecture choice).
    CEREMONY  Theme pick prompt: "Choose your material." Sets badgeTheme.
    BADGE     Material badge (reflects chosen theme)
    CHAPTER   Chapter 5.
    WIDGET    Months unlocked: 5/12

M6  WING                water: Voyager        [HALF-YEAR]
    UI        Density: compact. Header shows month strip with 6 filled cells.
              A faint half-year line crosses the strip.
    UNLOCK    Widget Arrange (drag-drop), Export Data.
    CEREMONY  HALF-YEAR READOUT — the largest ceremony so far: Quarter Plate
              Q2, Chapter 6, and the Half-Year Letter (see 06).
    BADGE     milestone_180 "Voyager" / Wing (existing, legendary).
    CHAPTER   Chapter 6 + Q2 Plate + Half-Year Letter.
    WIDGET    Months unlocked: 6/12 · Half-year sealed
```

### Quarter 3 — CIRCUITRY (months 7-9) · compact → dense

```
M7  WIRING              water: Undertow
    UI        Dense chrome begins: tabular numerals, hairline dividers,
              widgets show a delta arrow vs last month.
    UNLOCK    Social Mentions (@ in community), Private Spaces.
    CEREMONY  "Month delta" strip: entries / check-ins / self-care vs M6.
    BADGE     Circuit Course I
    CHAPTER   Chapter 7.
    WIDGET    Months unlocked: 7/12 · Δ entries +12%

M8  RARE AIR            water: Pressure
    UI        Density: dense. Minimal whitespace, cockpit feel. The QI
              terminal (/qi) is promoted to the primary nav.
    UNLOCK    QI terminal full access (existing QI), Correlated Indexes.
    CEREMONY  Archetype check: the system states current archetype and whether
              it moved since M3 ("The Wanderer → The Strategist").
    BADGE     Archetype Seal
    CHAPTER   Chapter 8.
    WIDGET    Months unlocked: 8/12 · Archetype: <name>

M9  HABIT               water: Trench          [QUARTER 3 CLOSE]
    UI        Self-care row condenses to icon-grid; user's three most-clicked
              practices pin to the top automatically.
    UNLOCK    Integrity widget (contradiction analysis), Weekly Drift.
    CEREMONY  Quarter Plate Q3 + "Practice map": the self-care routines the
              system recommends keeping vs dropping, based on mood-after.
    BADGE     Habit Ring (ties to existing streak 90 badges)
    CHAPTER   Chapter 9 + Q3 Plate.
    WIDGET    Months unlocked: 9/12 · 3 practices pinned
```

### Quarter 4 — LOT® AI (months 10-12) · dense → instrument

```
M10 ALMOST              water: Abyss
    UI        Instrument density begins for high-Depth users. The AI voice
              appears in the UI chrome itself: one-line "LOT® AI:" status
              under the clock (what it noticed today).
    UNLOCK    LOT® AI proactive guidance: the system proposes tomorrow's
              self-care routine from the user's own history (opt-in).
    CEREMONY  First "AI proposes, you decide" routine. Accept/decline is logged.
    BADGE     Guide Seal
    CHAPTER   Chapter 10. First chapter that ends with a forward-looking
              line grounded in observed pattern ("Mornings after 8h+ sleep
              carry your best entries.").
    WIDGET    Months unlocked: 10/12 · LOT® AI: guiding

M11 ONE MORE            water: Hadal
    UI        Instrument-grade cockpit. Everything the user kept pinned,
              nothing else. The Year draft is visible as a locked block with
              11 of 12 paragraphs written.
    UNLOCK    Year Preview (read the 11 chapters in order).
    CEREMONY  Quiet. The month-11 Block is the shortest message in the
              system: "One month remains."
    BADGE     Eve Mark
    CHAPTER   Chapter 11.
    WIDGET    Months unlocked: 11/12 · The Year: drafting

M12 CITADEL             water: The Long Count   [YEAR CLOSE]
    UI        Full LOT® AI. The interface the user sees equals
              /u/machiavelli in structure: portrait, weather station, wallet
              slot, correlated indexes, memory story, badge wall. The month
              strip is complete: 12 of 12 filled.
    UNLOCK    LOT® AI full — The Year, year-over-year mode, Legacy tag
              candidacy (what Machiavelli carries).
    CEREMONY  THE YEAR (see 06). Longest ceremony in the product, shown once.
    BADGE     milestone_365 "The Long Count" / Citadel (existing, legendary)
              + Citadel Year Plate (new, shareable).
    CHAPTER   Chapter 12 + THE YEAR: twelve paragraphs compressed to one page,
              then to one paragraph (the new public memoryStory).
    WIDGET    Months unlocked: 12/12 · The Year sealed
```

---

## 06 // THE THREE CEREMONIES (what makes it tangible)

**A. Month-turn Block (every month).** Replaces today's one-liner. On the first
visit after the month boundary the Monthly Pulse Block renders, in order:

```
Month 4: First Wall                      <- label (existing Block style)

<Chapter 3 paragraph, 80-130 words, third person>

– insight 1 (en-dash, complete sentence)
– insight 2
– insight 3

412 entries -> 1 chapter                 <- real counts, 30% opacity
Depth ████████░░  Seal earned            <- ProgressBars (existing util)
Next: Narrative Reflection unlocked      <- the month's UNLOCK line
```

One tap dismisses (existing behaviour, existing phrases). Dismissal is
per-user-per-month — keep the current localStorage key but move the source of
truth to `metadata.usership.chapters[n].seenAt` so it follows the user across
devices.

**B. Half-Year Letter (M6).** A short letter from the system to the user,
written from Chapters 1-6, ending with one question for the second half.
Answer is stored as a Log entry and returned in the Year.

**C. The Year (M12).** Structure:

```
THE YEAR — <Name>                      12 / 12
Archetype then -> now                  The Wanderer -> The Strategist
12 chapters, one line each             (the first sentence of each chapter)
Three recurring patterns               (QIE)
What you practiced                     top 3 self-care routines by count
One paragraph                          <- becomes the public memoryStory
```

The final one-paragraph form is the **LOT® AI portrait**, the same shape as
Machiavelli's `memoryStory` today. A user can see that the demo page is not a
different product — it is where their own page ends up.

---

## 07 // CONTEXT WIDGETS

```
WIDGET                    SHOWS                                      WHEN
──────                    ─────                                      ────
MonthsUnlockedWidget      "Months unlocked: 3/12" + 12-cell strip    always (Usership)
                          filled cells = months reached; the         upper-left of System
                          current cell pulses once on load.
MemoryChapterWidget       Latest sealed chapter, 1 paragraph.        day 1-7 of each month
                          Tap -> earlier chapters (carousel).        after first dismiss
NextSealWidget            Depth bar + the single next action:        weeks 2-4 of month
                          "11 more entries to seal month 4."
LOT® AI line (M10+)       One line under the clock.                  M10-M12
```

Context rule: only **one** of Chapter / NextSeal is visible at a time (Chapter
early in month, NextSeal late) so the screen stays quiet. All use the existing
`Block` primitive and `ProgressBars` util — no new visual language, per MILITARY
PURITY (no emojis, no superlatives, no decoration).

---

## 08 // GUARDRAILS

1. **No loss.** Unlocks never revoke. A lapsed Depth only slows density, never
   removes a widget.
2. **Quiet months are valid.** < 10 entries -> the chapter is 1-2 sentences:
   "A quiet month. The system waited." No shame copy, no streak-loss language.
3. **Paid-start clock.** Month number = from `usership.since`, not `joinedAt`.
   Cancel/resume pauses the clock (Month 7 resumes as Month 7).
4. **No fabricated numbers.** Counts only. Anything inferred (archetype move,
   pattern) is labelled with its source signal and confidence from QIE.
5. **Sensitive cohorts.** Resilience (PTSD/C-PTSD) and eating-disorder cohort
   users get chapters with the trauma-informed filter already used by the
   Memory Engine; self-care routine proposals (M10) are suppressed for
   restriction-pattern users. Do not celebrate weight, streaks of restriction or
   "discipline" in these cohorts.
6. **Public profile.** Chapters never leak publicly except the single latest
   one-paragraph memoryStory with the existing `showMemoryStory` flag.
7. **Chapter AI fails open.** Template skeleton always ships; AI paragraph is
   additive.

---

## 09 // MACHIAVELLI DEMO — "TIME MACHINE"

The demo is currently the end state only. Proposal: add `?month=N` (1-12) to
`/u/machiavelli`; the profile endpoint returns the state *as of month N*, and a
12-cell month strip at the top lets a visitor click through the year.

```
M1   barebone: name, city, time, 1 line story, 0 badges, density breathable
M3   + weather, first chapter, Foundation plate, 1 badge
M6   + psychological profile (archetype appears), half-year letter, 3 badges
M9   + correlated indexes, QI, practice map
M12  = today's full demo: weather station, wallet, board profile, Citadel
```

Demo data derived from the existing constants so numbers stay coherent:
`answerCount 2847 / noteCount 1469 / activeDays 842` scale to month N at a fixed
curve (cumulative = final × (N/12)^1.15, slightly back-loaded, as real usage
accrues). Clearly flagged `isDemo` (existing). No real-user data is involved.

**Twelve sample chapters in Machiavelli's voice** (style anchor for the AI
prompt and the demo `chapters[]`; each ≈ 40-60 words in production demo):

```
M1   The prince arrived at the Palazzo Vecchio without a plan. He answered
     what he was asked and wrote little. The mornings were quiet.
M2   He began to notice the hour at which he wrote best. Dawn, before the
     courtyard filled. He returned to it six times.
M3   Patterns formed where there had been habit. Three mornings in four he
     named his mood before his duties. The foundation was laid.
M4   He read the first month against the fourth and found a different man:
     slower to anger, quicker to watch.
M5   Consistency became its own argument. Twenty-seven check-ins; he missed
     three and wrote nothing of them. The notes grew longer.
M6   Half the year, and the letter asked one question: what would you
     defend? He answered in a single line and has not changed it.
M7   Rain brought introspection; sun brought ambition. He wrote both down and
     began to plan around the weather of his own mind.
M8   The system named him a Strategist. He did not argue.
M9   Practice replaced effort. Three routines carried the month; he dropped
     the fourth without regret.
M10  For the first time the system proposed tomorrow. He accepted two of
     three and was right to decline the third.
M11  A month of little noise. He read the year back and found it already
     written.
M12  A year of presence. The art of governance is the art of understanding
     human nature; this year he governed one subject only. The Citadel stands.
```

---

## 10 // BADGE MAP (existing + proposed)

```
EXISTING    milestone_30 / 90 / 180 / 365         tie to M1 / M3 / M6 / M12
            streak badges                         framed per month in ceremony
PROPOSED    12 month Seals (one per month)        Depth >= 100% at month close
            4 Quarter Plates                      M3, M6, M9, M12 (shareable)
            Citadel Year Plate                    M12 only, public-profile badge
            "No Missed Turn"                      opened the app in every month
            "Quiet Month"                         honours a low-depth month
                                                  (anti-shame badge)
```

Codex rule: new badges must be added to the Badge Codex as a dated version
(v33), not edited into v32 — history stays append-only.

---

## 11 // IMPLEMENTATION ROADMAP (smallest correct steps, in order)

```
STEP  CHANGE                                              FILES                      SIZE
────  ──────                                              ─────                      ────
1     usership.since written on Usership tag grant /      server/models/user.ts,     S
      Stripe start; month helper uses it                  routes/api.ts (+ helper
                                                          in shared/utils)
2     Monthly Chapter job (L3): template + AI paragraph,  server/scheduled-jobs.ts   M
      writes metadata.usership.chapters + lot_ai_chapter  (new Job after 24),
      log. Backfill existing Usership users for the       utils/memory.ts
      months already elapsed (idempotent)
3     MonthlyPulseWidget v2: render chapter + counts +    client/components/         M
      Depth bar + unlock line; seenAt synced server-side  MonthlyPulseWidget.tsx
4     MonthsUnlockedWidget + MemoryChapterWidget +        new components, mount in   M
      NextSealWidget                                      System.tsx near line 557
5     Month->unlock map: align 13 existing gates to       client/stores/evolution,   S
      the table in section 05 (calendar floor + depth)    utils/interfaceEvolution
6     Quarter Plate + Half-Year Letter + The Year         scheduled-jobs.ts, new     L
                                                          ceremony Blocks
7     Badge v33: 12 Seals, 4 Plates, Citadel Year Plate   utils/badges.ts, docs/     M
                                                          badges/ Codex v33
8     Demo Time Machine ?month=N                          routes/public-api.ts       M
                                                          (/profile/machiavelli),
                                                          PublicProfile.tsx
```

Suggested first slice (one benchmark run): steps 1-3. It delivers the
tangible monthly chapter for every Usership user and nothing else has to exist
yet; the rest layer on without rework.

---

## 12 // OPEN QUESTIONS FOR S-2

1. **Month clock:** confirm paid-start (`usership.since`) over `joinedAt`.
   Existing paid users with a long free history — start them at M1 now, or
   backfill by real paid date?
2. **Chapter length:** 80-130 words (this brief) vs. longer. Shorter keeps
   Month-turn Block quiet; longer is more "gift."
3. **AI vs template for Chapters:** brief proposes template + one AI paragraph.
   Cost at $99/month tier is negligible (one ~400-token call/user/month on
   Together AI), but confirm the model.
4. **Naming:** Architecture names (Ground, Wall, Wing, Citadel) used as master;
   Water twins listed. Keep the dual system, or architecture only?
5. **Demo Time Machine** public or Usership-only? Public makes it the best
   sales surface; the whole point of `/u/machiavelli` is to be seen.
6. **Quiet-month badge:** ship it? It is the clearest signal that LOT does not
   gamify at the cost of the person.

---

AUTHORIZED BY: S-2 // VADIK MARMELADOV
