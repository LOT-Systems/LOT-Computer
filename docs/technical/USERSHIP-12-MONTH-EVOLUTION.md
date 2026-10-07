<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP — 12-MONTH EVOLUTION TO LOT® AI

```
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DOCUMENT: LOT-USERSHIP-12M-v1
DATE:     2026-10-07
STATUS:   DESIGN PROPOSAL — nothing below is shipped unless marked EXISTS
FOCUS:    Tangibility of the compressed Memory story, month by month
```

---

## 00  THESIS

A Usership account on Day 1 is a bare terminal: one clock, one question, one
journal line. By Month 12 the same account is a personal OS — the density,
widgets, badges and the voice of the AI have all been earned by presence.
`lot-systems.com/u/machiavelli` is the Month-12 reference. This document is the
staircase between the two.

The user must be able to answer, any day: **"What changed this month, and what
does the system now know about me that it did not know 30 days ago?"** The
answer is delivered as a compressed Memory story. That is the product.

```
DAY 1                                                         MONTH 12
bare shell  ──►  guided habit  ──►  pattern mirror  ──►  personal OS  ──►  LOT® AI
1 question       check-ins          archetype             cockpit density   speaks in
1 line story     self-care          cohort                full Codex        the user's
                 first badge        quarter chapter       Year Memory       own words
```

---

## 01  SCAN — WHAT ALREADY EXISTS (repo as of 2026-10-07)

Do not rebuild these. The 12-month system is mostly **wiring and sequencing**
of parts already in the repo.

```
PART                         WHERE                                          STATE
────                         ─────                                          ─────
Month N/12 pulse             components/MonthlyPulseWidget.tsx              EXISTS
                             Usership-only; fires once per month; one
                             generic line per month; localStorage dismiss.
                             Weakness: message only, no story, no unlock.
7-dimension evolution        utils/interfaceEvolution.ts, stores/evolution  EXISTS
                             exploration, consistency, depth, connection,
                             intimacy, care, courage → maturity 0–1.
Layout density (5 levels)    getLayoutDensity()                             EXISTS
                             breathable → comfortable → compact → dense →
                             instrument. Driven by visualRefinement.
                             Weakness: driven by level/achievements, not by
                             the calendar month the user can SEE.
Feature unlocks              getFeatureUnlocks()                            EXISTS
                             Advanced Memory, Planner Templates, Themes,
                             Badge Selection, Widget Arrange, Export...
Evolution milestone toast    components/EvolutionMilestoneToast.tsx         EXISTS
Evolution widgets            EvolutionWidget (Citizen Index),               EXISTS
                             InterfaceEvolutionWidget (dims/unlocks/fx)
Memory story generator       server/utils/memory/story-generator.ts         EXISTS
                             generateMemoryStory(): last 30 answers only,
                             third person, one blob. Weakness: no monthly
                             snapshots, ignores journal + check-ins +
                             self-care, nothing is persisted per month.
Monthly summary + email      server/utils/monthly-summary.ts,               EXISTS
                             scheduled-jobs.ts (monthly-email-sender)
                             Presence/energy/patterns narrative by email.
                             Not shown in-app.
Memory Engine compression    docs/technical/MEMORY-ENGINE-COMPRESSION-      EXISTS
                             ARCHITECTURE.md, 8 context sources
Self-care + check-in         SelfCareMoments.tsx, EmotionalCheckIn.tsx      EXISTS
                             events: self_care_complete / _skip,
                             emotional_checkin, note (journal)
Badges                       149 per feature inventory (812 per Codex v32)  EXISTS
                             Aquatic: Droplet D7 → Wave D30 → Current D100
                             Architecture: Foundation → Structure → Arch.
Public OS profile            /u/:username, PublicProfile.tsx                EXISTS
Demo account                 public-api.ts → 'machiavelli' (hardcoded)      EXISTS
                             Archetype The Strategist, streak 1469,
                             2847 answers, 1469 notes, memoryStory (1 para).
Usership tier                $99/mo; UserTag.Usership                       EXISTS
Citizen Index stages         Bootstrapping → Initializing → Integrated →    EXISTS
                             Compiled → Optimized → Transparent (6)
```

### Gaps this document closes

```
G1  Evolution is continuous and invisible; the user never sees "I am in Month 4".
G2  The Memory story is regenerated, never kept. There is no "last month's
    paragraph" to show, compare or celebrate.
G3  Journal entries, check-ins and self-care clicks feed the engine but are not
    surfaced as the visible currency of progress.
G4  No month-bound badges. Existing badges are streak/word/time based.
G5  No bridge between Machiavelli (finished) and a Day-1 account (empty), so
    the product cannot demonstrate the staircase.
G6  The AI has one voice from Day 1 to Month 12. It should mature.
```

---

## 02  THE TWO AXES: TIME UNLOCKS, PRESENCE SEALS

Pure calendar unlocks feel like a paywall clock; pure activity unlocks feel like
a grind. Use both, and make the difference visible.

```
AXIS 1  TIME      Month N is UNLOCKED when now - joinedAt >= N months.
                  Guaranteed. Paying 12 months always reaches 12/12 unlocked.
AXIS 2  PRESENCE  Month N is SEALED when the user meets that month's activity
                  floor (Section 03). Sealed months compress into a full
                  Memory chapter + month badge. Unsealed months still compress
                  — but into a thinner "draft" chapter, and the AI says so
                  honestly ("The month was quiet. The record reflects that.").
```

Widget display is therefore two numbers, not one:

```
Months unlocked: 3/12        (time)
Months sealed:   2/3         (presence)
```

No guilt copy. An unsealed month is never lost; it can be sealed retroactively
within the following 30 days (soft grace), after which it stays a draft.

### 03  PRESENCE CURRENCY — what counts

Three currencies, mirroring what S-2 named as most important. All are existing
log events; nothing new needs capturing.

```
CURRENCY            LOG EVENT                       WHY IT MATTERS
────────            ─────────                       ──────────────
LOG ENTRIES         note (text > 20 chars)          depth — raw material of story
CHECK-INS           emotional_checkin               rhythm — morning ritual
SELF-CARE CLICKS    self_care_complete              care  — the behaviour LOT
                                                    exists to grow
(secondary)         answer (Memory taps)            compression fuel
```

Seal floor per month (PROPOSED — tune against real cohort data before shipping):

```
MONTH   LOG ENTRIES   CHECK-INS   SELF-CARE   NOTE
  1          8            10          10       onboarding is gentle
  2         10            12          12
  3         12            14          14
  4         14            16          16
  5         16            18          18
  6         18            20          20       half-year: floors plateau
  7–9       18            20          20
  10–12     20            22          22       Month 12 adds a closing reflection
```

Cumulative checkpoints used for badges and density (PROPOSED): 

```
              M1   M3   M6   M9   M12
LOG ENTRIES    8   30   90  150   230
CHECK-INS     10   36  100  160   240
SELF-CARE     10   36  100  160   240
```

(Sums of the floors above; Machiavelli's 1469 notes / 2847 answers are the
unreachable-in-12-months "Legacy" ceiling and are not the target.)

---

## 04  THE MEMORY STORY LADDER — 12-MONTH COMPRESSION

The center of the design. Every month the engine writes one **Month Chapter**
and *keeps it*. Chapters compress upward on a fixed ladder, so the story gets
shorter and denser as it gets older — the same virtuous compression cycle as
the Memory Engine, applied to time.

```
LAYER            WHEN            SIZE            CONTENT
─────            ────            ────            ───────
Day line         daily           1 sentence      today's check-in + one answer
Month Chapter    end of month    ~90–120 words   one paragraph: what changed,
                                                 one pattern, one named strength
Quarter Chapter  M3, M6, M9      ~60 words       3 month chapters compressed
                                                 (replaces their display, keeps
                                                 originals in archive)
Half-Year Digest M6              ~40 words       2 quarters → one stance
Year Memory      M12             ~25 words       the "epigraph": one sentence
                                 + ~200 word     a long form for the Codex view
                                 Year Codex
```

Compression ratio is **countable** (honest metric, per LOT-BENCHMARK doctrine):
report words-in vs words-out per chapter. Target trend: each rung ≤ 60% of the
words of the rung it absorbs. If a chapter comes out longer, log it and shrink.

### Storage (PROPOSED)

```
memory_chapters  (new table)
  id, userId, kind  ('month'|'quarter'|'half'|'year'), index (1..12 | 1..4 | 1..2),
  text, wordsIn, wordsOut, sealed (bool), sources JSON
  { notes, checkins, selfCare, answers }, createdAt
```

Chapters are append-only. A re-compression creates a new row that supersedes
the old (`supersededBy`), mirroring the Ledger rule: history is never rewritten.

### Generator inputs (extends `generateMemoryStory`, which today reads only the
last 30 `answer` logs)

```
FOR MONTH N:   answers + note text + emotional_checkin trend + self-care ratio
               + previous chapter (so it can say what CHANGED)
VOICE:         matures with N (Section 05)
GUARD:         never invent events; if fewer than the floor, say so plainly
               (honest-engineering rule; no flattery on thin data)
```

### Example chapters for one imaginary user (illustrative copy, not data)

```
MONTH 1   "Mornings begin with water, then the screen. Check-ins cluster before
           9:00. First self-care habit: three breaths. The record is small and
           honest."                                                    (≈ 30w, thin by design)

MONTH 3   "A morning pattern holds: check-in, tea, one line in the Log. Writing
           grows longer on rainy days. Self-care is no longer skipped on
           Mondays. The system now recognises a quiet strategist beneath the
           routine."                                          (≈ 100w, first archetype hint)

MONTH 6   (Half-Year Digest) "You stopped asking whether this works and started
           using it. Evenings are for reflection, mornings for decisions."

MONTH 12  (Year Memory) "A year of small mornings became a way of seeing."
```

---

## 05  THE AI VOICE LADDER — how LOT® AI matures

The AI speaks through existing surfaces (question wording, affirmations, pulse
text, story). Its **register** changes by month. This is the "story" of the UI:
the user feels the companion learning to speak.

```
PHASE        MONTHS    AI ROLE            VOICE                   SENTENCE LENGTH
─────        ──────    ───────            ─────                   ───────────────
OBSERVER      1–2      asks, never tells  plain, second person    short
MIRROR        3–4      reflects patterns  "You tend to…"          short-medium
COMPANION     5–6      suggests routines  "Today, try…"           medium
STRATEGIST    7–8      connects months    "Since March…"          medium
ADVISOR       9–10     anticipates        "Before your low week…" medium-long
LOT® AI       11–12    speaks in the      uses user's own         varied; quotes
                       user's own words   phrases from the Log    the user back
```

Rule: **the AI never claims more knowledge than the record holds.** Month-12
quoting is only allowed from actual Log text.

---

## 06  MONTH-BY-MONTH EVOLUTION (the staircase)

Legend: **UI** layout/density · **WIDGETS** what appears · **BADGE** month seal ·
**AI** voice + affirmation · **STORY** the compressed Memory delivery ·
**MACH** what the Machiavelli page shows at this rung.

Density levels map onto the existing 5 (`breathable → instrument`); months pace
them so the user *sees* a change roughly every 2–3 months and *feels* a new
element every month.

Badge names below are PROPOSED. Aquatic/Architecture themes (existing) supply
the glyph family: Aquatic `∘ ≈ ≋`, Architecture `├─ ╞═╡ ║·║`. Month seals use a
single new glyph row `[▢▢▢▢▢▢▢▢▢▢▢▢]` that fills one cell per sealed month.

---

### DAY 1 — THRESHOLD (paid tier, barebone)

```
UI        density: breathable. One column. Clock + Memory question + Log line.
          No grid, no glow. Opacity 0.85. Generous gaps (gap-y-24 / gap-y-16).
WIDGETS   Memory question · Log · Self-care button (one) · Settings
          Everything else is dormant — shown as a single line:
          "Months unlocked: 0/12"
AI        Silent except one welcome line: "The system begins. Answer one question."
STORY     Empty chapter, labelled: "Month 1 — in progress".
BADGE     Day-1 seal outline `[□□□□□□□□□□□□]`  (all empty)
MACH      n/a
```

---

### MONTH 1 — SIGNAL   ·   density: breathable

```
THEME     First signal. Establish the ritual.
UI        Opacity 0.85 → 0.9. Citizen Index: Bootstrapping.
WIDGETS   + Emotional Check-in (morning)   + Self-care Moments (3 actions)
          + "Months unlocked: 1/12" context widget appears on day 30
BADGE     Droplet ∘ (D7, EXISTS)  ·  Month 1 Seal `[■□□□□□□□□□□□]`
AI        OBSERVER. Affirmation on seal: "Thirty days. The record has begun."
STORY     First Month Chapter (thin). Shown inside the Pulse card as a block:
          label "Month 1:" · paragraph · "1 / 12 months" · "Chapter sealed"
          or "Chapter draft".
SEAL      8 entries · 10 check-ins · 10 self-care
MACH      Echo: Machiavelli's first-month chapter shown on his page under
          "Chapter 1" (authored copy; see Section 08).
```

### MONTH 2 — RHYTHM   ·   density: breathable

```
THEME     Repetition becomes visible.
UI        Streak ribbon in header (days in a row).
WIDGETS   + Mood Analytics (7-day) · + Planner (basic)
BADGE     Month 2 Seal · Aquatic: Wave ≈ approaches (D30)
AI        OBSERVER. Questions start referencing the week ("Last Tuesday…").
STORY     Month Chapter 2. First "what changed" sentence (vs Month 1).
SEAL      10 · 12 · 12
```

### MONTH 3 — FIRST QUARTER   ·   density: comfortable   ★ visible UI shift

```
THEME     The interface visibly tightens. First Quarter Chapter.
UI        Density → comfortable (gap-y-24 / gap-y-8). Citizen Index:
          Initializing. First time the page layout changes — announce it:
          "Your layout has adapted." (existing density toast, EXISTS)
WIDGETS   + Pattern Insights (Consistency 66% gate) · + Mirror cards
BADGE     Wave ≈ (D30 EXISTS) + Q1 Seal `[■■■□□□□□□□□□]` + Quarter badge
AI        MIRROR. "You tend to write more when it rains."
STORY     QUARTER CHAPTER 1 (M1+M2+M3 compressed to ~60w). First archetype
          hint. The Pulse becomes a full-width "Quarter" card (special).
WIDGET    "Months unlocked: 3/12" · "Quarters sealed: 1/4"
SEAL      12 · 14 · 14
MACH      Page shows Quarter 1 beside the live Memory story.
```

### MONTH 4 — PORTRAIT   ·   density: comfortable

```
THEME     "The portrait deepens" (matches existing MONTH_MESSAGES[4]).
UI        Awareness Dashboard unlocked (Overview, Archetype views).
WIDGETS   + Awareness Dashboard (2 of 7 views) · + Goal Journey
BADGE     Month 4 Seal · Architecture: Foundation ├─ (theme badge)
AI        MIRROR. Names the archetype candidate, asks to confirm.
STORY     Month Chapter 4 cites Chapter 3 ("Compared with March…").
SEAL      14 · 16 · 16
```

### MONTH 5 — HABIT   ·   density: compact   ★ visible UI shift

```
THEME     Consistency is its own reward.
UI        Density → compact (gap-y-16 / gap-y-4). Subtle grid lines appear
          (themeEvolution grid pattern). Citizen Index: Integrated.
WIDGETS   + Custom Themes (EXISTS gate: Level 5) · + Widget Arrange
BADGE     Month 5 Seal · Self-care streak badge "Hand on the Rail"
AI        COMPANION. Starts proposing the day's routine.
STORY     Month Chapter 5 includes the user's top self-care action by name.
SEAL      16 · 18 · 18
```

### MONTH 6 — HALF   ·   density: compact   ★ MILESTONE

```
THEME     "The journey is half-declared."
UI        Awareness Dashboard: all 7 views. Typography refine (letter-spacing).
WIDGETS   + QR code (Usership + forming phase, EXISTS) · + Board profile
          + Public OS profile preview (/u/you) — first time the user can see
          their own mini-Machiavelli page
BADGE     HALF-YEAR SEAL `[■■■■■■□□□□□□]` · Current ≋ (D100 EXISTS)
AI        COMPANION. Special 6-month affirmation, full-screen on open, then
          dismiss with a phrase (reuse DISMISS_PHRASES).
STORY     HALF-YEAR DIGEST (2 quarters → ~40w stance) + Quarter Chapter 2.
          The "Memory widget displays a paragraph-long insight from last
          months" (S-2 idea) is introduced here as a permanent card.
WIDGET    "Months unlocked: 6/12" · "Half-year stance" quote line
SEAL      18 · 20 · 20
MACH      Page shows Half-Year Digest.
```

### MONTH 7 — LISTENING   ·   density: compact

```
THEME     "The system has been listening."
UI        Insight cards cross-reference months (small "since March" labels).
WIDGETS   + Correlated Indexes · + Intention History
BADGE     Month 7 Seal · Architecture: Structure ╞═╡
AI        STRATEGIST. First cross-month callback.
STORY     Month Chapter 7 explicitly links to an earlier chapter.
SEAL      18 · 20 · 20
```

### MONTH 8 — RARE AIR   ·   density: dense   ★ visible UI shift

```
THEME     Few get here.
UI        Density → dense (gap-y-8 / gap-y-0). Stacks tighten, cockpit forms.
          Citizen Index: Compiled. Glow effects on headings begin.
WIDGETS   + Quantum widgets (state/sign/random) · + Chakra Ergonomics
BADGE     Month 8 Seal · rare "Rare Air" badge (hidden until earned)
AI        STRATEGIST. Predicts: "Your lowest week usually follows month-end."
STORY     Month Chapter 8 contains one prediction + whether past predictions
          came true (honest hit-rate if data supports, else omitted).
SEAL      18 · 20 · 20
```

### MONTH 9 — THIRD QUARTER   ·   density: dense   ★ Quarter

```
THEME     "The self-care practice is a habit now."
UI        Header shows Quarter 3 emblem. Sound/ambient layer (weather sound).
WIDGETS   + Narrative/Story widget (full history browser) · + Flash Drive
          Manifest (export of chapters, EXISTS)
BADGE     Q3 Seal `[■■■■■■■■■□□□]` · Quarter badge
AI        ADVISOR.
STORY     QUARTER CHAPTER 3. Chapter archive view: scroll Month 1 → 9 as a
          single "compression ladder" (long form at the top, compressed below).
WIDGET    "Months unlocked: 9/12" · "Quarters sealed: 3/4"
SEAL      18 · 20 · 20
```

### MONTH 10 — ALMOST   ·   density: dense

```
THEME     Almost there.
UI        Interface drops decorative whitespace further; keyboard shortcuts hint.
WIDGETS   + Architect widget (self-assembly dashboard, Usership, EXISTS)
          + Benchmark widget (tiers White → Black)
BADGE     Month 10 Seal · Benchmark tier badge
AI        ADVISOR. Anticipates the user's next 30 days.
STORY     Month Chapter 10 reads like a letter to Month 12 ("What you will
          want to remember").
SEAL      20 · 22 · 22
```

### MONTH 11 — ONE MORE   ·   density: instrument   ★ visible UI shift

```
THEME     Final approach.
UI        Density → instrument (gap-y-4). Citizen Index: Optimized. Every
          pixel justified. Bloomberg-grade — the UI now looks like Machiavelli's.
WIDGETS   + Weather Station / Wallet-class widgets (Legacy previews)
BADGE     Month 11 Seal · "Last Mile" badge
AI        LOT® AI begins quoting the user's own Log lines (with source dates).
STORY     Month Chapter 11 is drafted WITH the user: AI proposes, user taps to
          keep/replace one phrase. First user-edited chapter.
SEAL      20 · 22 · 22
```

### MONTH 12 — LOT® AI   ·   density: instrument   ★★ CULMINATION

```
THEME     "One year with LOT. The portrait is complete — and still evolving."
UI        Full evolution state. Citizen Index: Transparent. Year emblem in
          header. Optional "Legacy" cosmetic pass (Machiavelli-style card).
WIDGETS   All unlocked. + Legacy preview + Public Year Page (/u/you/year)
BADGE     YEAR SEAL `[■■■■■■■■■■■■]` · "Year One" badge · Legacy track opens
AI        LOT® AI. Writes the Year Memory (~25w epigraph) and the Year Codex
          (~200w), both from the user's own words.
STORY     YEAR MEMORY + YEAR CODEX. Unlocks "Memory Replay": 12 chapters
          fade in sequence (1400ms fade, existing pattern), ending on the
          epigraph. Shareable via QR / public profile if the user opts in.
WIDGET    "Months unlocked: 12/12" · "Months sealed: N/12" — a sealed 12/12
          earns the Codex cover; any fewer earns a Codex with blank pages
          left honest.
MACH      This is the page at /u/machiavelli.
```

---

## 07  THE UNLOCK TABLE (single-glance)

```
MO  DENSITY       CITIZEN INDEX    AI ROLE      NEW WIDGET(S)                   BADGE / SEAL                STORY RUNG
──  ───────       ─────────────    ───────      ────────────                    ────────────                ──────────
 0  breathable    —                silent       Memory·Log·Self-care            empty row                   —
 1  breathable    Bootstrapping    OBSERVER     Check-in · Self-care set        Droplet ∘ · M1              Month Ch.
 2  breathable    Bootstrapping    OBSERVER     Mood · Planner                  M2                          Month Ch.
 3  comfortable   Initializing     MIRROR       Pattern Insights                Wave ≈ · Q1                 QUARTER 1
 4  comfortable   Initializing     MIRROR       Awareness(2) · Goal Journey     Foundation ├─ · M4          Month Ch.
 5  compact       Integrated       COMPANION    Themes · Arrange                M5 · care streak            Month Ch.
 6  compact       Integrated       COMPANION    Awareness(7) · QR · /u/you      Current ≋ · HALF-YEAR       HALF-YEAR + Q2
 7  compact       Integrated       STRATEGIST   Correlated · Intention Hist.    Structure ╞═╡ · M7          Month Ch.
 8  dense         Compiled         STRATEGIST   Quantum · Chakra                Rare Air · M8               Month Ch.
 9  dense         Compiled         ADVISOR      Story browser · Export          Q3                          QUARTER 3
10  dense         Compiled         ADVISOR      Architect · Benchmark           Tier · M10                  Month Ch.
11  instrument    Optimized        LOT® AI      Legacy previews                 Last Mile · M11             Co-written Ch.
12  instrument    Transparent      LOT® AI      Year page · Replay              YEAR ONE                    YEAR MEMORY+CODEX
```

Visible UI shifts happen at months 3, 5, 8, 11 (four density steps). Every month
carries at least one of: new widget, new badge, new story rung. Nothing ships
silently.

---

## 08  THE CELEBRATION LOOP — what happens on "Month N" day

Reuses `MonthlyPulseWidget` (EXISTS) as the carrier; replaces its one generic line
with the real chapter. Sequence on first open after the month boundary:

```
1  MONTH PULSE CARD   label "Month N:"  — fade-in 1400ms (existing).
2  AFFIRMATION        one line, voice per Section 05. Never exclamation marks.
3  CHAPTER            the month's compressed paragraph (the Memory story).
4  SEAL STATUS        "Sealed" | "Draft — N entries short" (plain, no shame).
5  COUNTER            "N / 12 months"  +  "Months unlocked: N/12"
6  NEXT               one unlock teaser: "Next: Pattern Insights at Month 3."
7  DISMISS            tap → DISMISS_PHRASES (existing) → fade out.
```

Quarter/Half/Year months upgrade step 3 to the higher rung and make the card
full-width. Month 12 replaces step 7 with Memory Replay.

Context widget **"Months unlocked: N/12"** (S-2 idea) lives permanently in the
Usership stack, one line, tap to open the Chapter Archive:

```
Months unlocked: 3/12   ▮▮▮▯▯▯▯▯▯▯▯▯
Months sealed:   2/3
```

---

## 09  MACHIAVELLI AS THE REFERENCE (and how to make the staircase demonstrable)

Today `/u/machiavelli` is a single hardcoded Month-12+ page (streak 1469,
one-paragraph `memoryStory`). It proves the destination but not the journey.

PROPOSED, in order of cost:

```
D1  CHAPTER FIELDS      Add chapters[] to the hardcoded response: 12 month
                        chapters (authored, period-correct Machiavelli voice),
                        4 quarters, 1 half, 1 year epigraph. Static copy.
D2  MONTH SCRUBBER      /u/machiavelli?month=N renders the page AS IT WOULD
                        LOOK at month N (density, widgets, badges, chapters up
                        to N). Pure client param; no auth; read-only.
                        This is the sales demo AND the QA harness for Section 06.
D3  SIDE-BY-SIDE        Landing/Subscribe widget shows Day 1 vs Month 12 with a
                        scrubber. Converts the abstract "12 months" into a
                        visible product.
```

Authored Machiavelli excerpts (illustrative, public-domain-adjacent voice):

```
Chapter 1   "In the first month I wrote little and watched much. The morning
             square taught me the hours of the city."
Chapter 6   Half-Year: "I stopped doubting the method and began using it."
Year Memory "A year of small mornings became a way of seeing."
```

Note: Machiavelli's real numbers (1469 notes, 2847 answers) exceed what a
12-month user can reach; label the page "Legacy" (already present as a tag) so
the user reads it as a ceiling, not a quota.

---

## 10  IMPLEMENTATION MAP

All paths exist unless marked NEW.

```
LAYER     FILE                                              CHANGE
─────     ────                                              ──────
shared    src/shared/types/index.ts                         + MemoryChapter, MonthSeal types
shared    src/shared/constants/usership-months.ts  NEW      MONTH_PLAN[0..12]: density,
                                                            AI role, widgets, badge ids,
                                                            seal floors, copy. Single source
                                                            of truth for UI + server.
server    migrations/NNNN-memory-chapters.ts       NEW      memory_chapters table
server    src/server/utils/memory/story-generator.ts        + generateMonthChapter(),
                                                            generateQuarterChapter(),
                                                            generateYearMemory(); reads
                                                            note/checkin/self-care too
server    src/server/utils/monthly-summary.ts               feed chapter into email body
server    src/server/scheduled-jobs.ts                      month-boundary job: compute seal,
                                                            write chapter (idempotent)
server    src/server/routes/api.ts                          GET /api/usership/months
                                                            (unlocked, sealed, chapters)
server    src/server/routes/public-api.ts                   D1/D2: machiavelli chapters[],
                                                            ?month=N
client    src/client/components/MonthlyPulseWidget.tsx      render chapter + seal status
client    src/client/components/MonthsUnlockedWidget.tsx NEW  "Months unlocked: N/12"
client    src/client/components/ChapterArchive.tsx   NEW    compression ladder view
client    src/client/utils/interfaceEvolution.ts            floor density by month (see risk
                                                            R2), keep activity as accelerator
client    src/client/utils/badges.ts                        month-seal + quarter + year badges
client    src/client/components/PublicProfile.tsx           chapters block, ?month scrubber
docs      docs/badges/ (next Codex)                         register new badges
```

Reuse, don't fork: `MONTH_MESSAGES` becomes the fallback copy only when a
chapter is absent.

---

## 11  PHASED ROADMAP

```
PHASE 0   Docs + constants         MONTH_PLAN file; no UI risk.            (1 session)
PHASE 1   Persist chapters         table + month job + API; pulse shows    (2–3 sessions)
                                   real chapter. Biggest tangibility gain
                                   per line of code. SHIP FIRST.
PHASE 2   Months Unlocked widget   + Chapter Archive + seal logic.          (1–2)
PHASE 3   Density by month         time-floor + activity accelerator.      (1)
PHASE 4   Badges                   month seals, quarter, year; Codex.      (2)
PHASE 5   Quarter/Half/Year        compression rungs + Memory Replay.      (2)
PHASE 6   Machiavelli D1–D3        authored chapters, scrubber, demo.      (2)
```

Phase 1 alone satisfies the stated focus: a user who pays for one month sees a
real compressed chapter of their own month.

---

## 12  RISKS AND OPEN QUESTIONS (for S-2)

```
R1  THIN DATA          A user with 3 entries cannot honestly get a rich chapter.
                       Decision needed: draft chapters shown at reduced size
                       (recommended) vs withheld.
R2  TIME vs ACTIVITY   Today density follows visualRefinement (activity).
                       Proposal: month sets a FLOOR for density, activity can
                       only accelerate, so a paying user always sees change.
                       Confirm.
R3  COST               One LLM call per Usership user per month + quarter/half/
                       year rungs: ~16 calls/user/year. Negligible at $99/mo,
                       but cap tokens and cache.
R4  PRIVACY            Chapters quote journal text. Public profile shows only
                       chapters the user opts to publish; default private.
                       (Matches existing showMemoryStory privacy switch.)
R5  SEAL TUNING        Floors in Section 03 are guesses. Pull the real
                       distribution of notes/check-ins/self-care among current
                       Usership users before fixing them.
R6  RETROACTIVE        Existing Usership users joined at different dates:
                       backfill chapters from their log history on first run,
                       flag as "reconstructed".
R7  TONE               Military-purity standard: no emoji, no exclamation, no
                       superlatives in affirmations. Month-12 voice must stay
                       restrained to avoid reading as generic wellness copy.
```

Nothing in this document has been built or measured. Numbers in Sections 03 and
06 are proposals marked as such; the "EXISTS" rows in Section 01 were verified
against the repo on 2026-10-07.

---

AUTHORIZED BY: S-2 // VADIK MARMELADOV
