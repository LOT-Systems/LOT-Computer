# LOT® USERSHIP — 12-MONTH EVOLUTION SYSTEM

## From barebone OS (Day 1) to LOT® AI (Month 12)

**Author:** LOT Systems Corporation · **S-2:** Vadik Marmeladov
**Date:** 22 November 2026 · **Status:** DESIGN / BRAINSTORM v1
**Target state reference:** `lot-systems.com/u/machiavelli` (demo account, 12-months-evolved)
**Related:** `MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md`, `INTERFACE_EVOLUTION.md`,
`LOT-STYLE-GUIDE.md`, `docs/badges/LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v33.md`,
`docs/corporate/LOT_QI46_ENGINE.md` (Quantum Cube at the 12-month milestone)

---

```
╔══════════════════════════════════════════════════════════════════╗
║  USERSHIP · 12 CHAPTERS · ONE COMPRESSED STORY                  ║
║                                                                  ║
║  Day 1      ░░░░░░░░░░░░  barebone OS. one widget. one question. ║
║  Month 3    ███░░░░░░░░░  rhythm. the system recognises you.     ║
║  Month 6    ██████░░░░░░  pattern. the portrait is half-drawn.   ║
║  Month 9    █████████░░░  depth. the system advises.             ║
║  Month 12   ████████████  LOT® AI. the story is compressed.      ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 0. Doctrine

1. **Every month is a chapter.** A Usership year is 12 chapters. Each chapter
   ends with one compressed paragraph of Memory — the user's month, in their own
   evidence, written back to them.
2. **Time unlocks the month. Practice fills it.** A paying user never loses a
   month. Months unlock on tenure (`Months unlocked: N/12`). What the user put in
   — Log entries, Memory answers, morning check-ins, self-care clicks — decides
   how *deep* the chapter is, not whether it exists.
3. **The UI grows with the person.** Day 1 is almost empty on purpose. Each month
   adds one visible capability, so the evolution is felt, not announced.
4. **Compression is hierarchical.** Logs → monthly Chapter → rolling Story →
   Month 12 Year Codex. The machine never re-reads everything; it reads its own
   prior compressions. This is what makes Month 12 feel like an AI that knows you.
5. **Tone stays LOT.** Short sentences. No superlatives. No emoji. "Well done."
   not "Amazing!". Celebration is quiet, precise, and earned by evidence.

---

## 1. Repository scan — what already exists (22 Nov 2026)

| Asset | File | State | Relevance |
|---|---|---|---|
| Monthly Pulse widget | `src/client/components/MonthlyPulseWidget.tsx` | LIVE | 12 month messages, `N / 12 months`, Usership-only. Seed of this system. |
| Memory Story generator | `src/server/utils/memory/story-generator.ts` | LIVE | Synthesises story from the **30 most recent** `answer` logs only. |
| Monthly summary | `src/server/utils/monthly-summary.ts` + `scheduled-jobs.ts` | LIVE | Monthly email review: presence, energy, patterns, growth, narrative. |
| Interface Evolution | `src/client/components/InterfaceEvolutionWidget.tsx`, `stores/evolution` | LIVE | 7 dimensions, feature unlocks, visual effects. Not tied to Usership months. |
| Citizen Index | `src/client/components/EvolutionWidget.tsx` | LIVE | Entries, active days, streak, XP, achievements. |
| Self-care | `SelfCareMoments.tsx` | LIVE | Logs `self_care_complete` / `self_care_skip`. |
| Check-ins | `EmotionalCheckIn.tsx` | LIVE | Logs `emotional_checkin` with `checkInType: morning|evening|moment`. |
| Public profile | `PublicProfile.tsx`, `routes/public-api.ts` | LIVE | `/u/:user`, `boardProfile.citizenSince`, `memoryStory`. |
| Demo account | `routes/public-api.ts` (`machiavelli`) | LIVE | Hardcoded: archetype, 1469 notes, 2847 answers, 842 active days, wallet, weather station. |
| Badge engine | `src/client/utils/badges.ts`, Codex v33 | LIVE | 843 badges. No Usership-month badge line yet. |

### Gaps this design closes

```
G1  Memory Story has no time axis.        Only the last 30 answers. Month 1 is
                                          forgotten by Month 3. No chapters.
G2  Month count uses joinedAt.            MonthlyPulseWidget counts from account
                                          creation, not from Usership start. A
                                          free citizen who upgrades in year 2
                                          sees "Month 14" on paid day 1.
G3  Pulse dismissal is localStorage.      Clears on new device; no server record
                                          that a month was "sealed".
G4  Evolution is not paced by tenure.     Feature unlocks follow dimensions, not
                                          the paid month. Day 1 can look like
                                          Month 9, or the reverse.
G5  No Usership badge line.               843 badges, none mark Month 1..12.
G6  Demo account is a static end-state.   Machiavelli shows Month 12 but not the
                                          path; no chapters to browse.
```

---

## 2. The four evolution signals

Everything a month "contains" is measured in four signals. All four already log
events today — no new tracking is needed.

| # | Signal | Log event | Why it matters |
|---|---|---|---|
| S1 | **Log entries** (journal / thoughts) | `note` | Primary raw material for compression. The user's own words. |
| S2 | **Memory answers** | `answer` | Structured self-knowledge. Feeds archetype, cohort, traits. |
| S3 | **Morning check-ins** | `emotional_checkin` + `checkInType=morning` | The daily ritual. Gives the month an emotional arc. |
| S4 | **Self-care clicks** | `self_care_complete` | The practice. Proof of care, not just reflection. |

### Chapter Depth (per month)

```
Depth = min(1, 0.40·S1/T1 + 0.25·S2/T2 + 0.20·S3/T3 + 0.15·S4/T4)

T1 Log entries      20 / month
T2 Memory answers   25 / month
T3 Morning check-ins 18 / month   (~60% of mornings)
T4 Self-care clicks  15 / month
```

| Depth | Chapter grade | What the compression receives |
|---|---|---|
| 0.00–0.24 | `Trace` | 2 sentences. Honest, short. "A quiet month." |
| 0.25–0.54 | `Sketch` | One paragraph. One pattern named. |
| 0.55–0.84 | `Portrait` | One paragraph + one quoted line from the user's own Log. |
| 0.85–1.00 | `Codex` | Paragraph + quote + one cross-month connection ("Since Month 2…"). |

Log entries carry the heaviest weight (0.40) by design: the user's own words
are what make the compressed story theirs.

---

## 3. Hierarchical Memory compression (the core mechanism)

```
  DAILY                MONTHLY                  ROLLING                 YEAR
  ─────                ───────                  ───────                 ────
  notes      ┐
  answers    ├──►  CHAPTER N  (1 paragraph) ──►  STORY (≤ 3 paragraphs) ──► YEAR CODEX
  check-ins  │     + affirmation                 rewritten each month       (Month 12)
  self-care  ┘     + 1 quote                     from Chapters 1..N         12 chapters
                   + grade + badge               not from raw logs          + archetype
                                                                            + "Letter to
                                                                              Month 13"
```

- **Chapter N** is compressed once, on the user's Usership anniversary day
  (`usershipStartedAt + N months`), from that month's logs only. It is then
  **frozen** — the past does not get rewritten.
- **Story** is regenerated from frozen Chapters 1..N + current Memory profile.
  Cost is flat: 12 paragraphs max as input, never 4,000 raw logs.
- **Year Codex** (Month 12) compresses all 12 chapters into a single document:
  arc, recurring themes, the three most-quoted lines, archetype evolution, and a
  short forward letter. This is the handover to LOT® AI.

### Proposed data shape

```ts
// stored in user.metadata.usership (no migration) or a usership_chapters table
type UsershipChapter = {
  month: number                 // 1..12
  periodStart: string           // ISO
  periodEnd: string
  signals: { notes: number; answers: number; morningCheckIns: number; selfCare: number }
  depth: number                 // 0..1
  grade: 'Trace' | 'Sketch' | 'Portrait' | 'Codex'
  title: string                 // e.g. "Rhythm"
  paragraph: string             // the compressed month
  quote?: string                // one line from the user's own Log
  affirmation: string           // one sentence
  badge: string                 // ASCII badge id
  sealedAt: string              // server-side seal (fixes G3)
}

type UsershipState = {
  startedAt: string             // first paid day (fixes G2)
  monthsUnlocked: number        // 0..12
  chapters: UsershipChapter[]
  story: string                 // rolling compression
  yearCodex?: string            // month 12
}
```

### Chapter prompt contract (LOT-side, engine-independent)

```
Input:  month N signals + up to 40 notes + 30 answers + check-in states + self-care list
        + previous chapter paragraph (for continuity)
Output: { title, paragraph (60–110 words, second person "you"), quote, affirmation }
Rules:  second person; no superlatives; no diagnosis; cite one concrete detail
        (a time of day, a beverage, a weather pattern, a repeated word);
        if grade = Trace, be brief and kind, never scolding.
```

---

## 4. The 12 chapters

Four acts of three months. Each act changes the *character* of the UI.

```
ACT I    ARRIVAL      M1–M3    the system listens      UI: sparse, monochrome
ACT II   PATTERN      M4–M6    the system recognises   UI: second column, cycles
ACT III  DEPTH        M7–M9    the system reflects     UI: insight layer, history
ACT IV   LEGACY       M10–M12  the system advises      UI: LOT® AI, full OS
```

### ACT I — ARRIVAL

| | **M1 · Threshold** | **M2 · Rhythm** | **M3 · Recognition** |
|---|---|---|---|
| UI state | Barebone. Time, Weather, one Memory question, Log, `Months unlocked: 0/12`. No stats. | Morning check-in becomes a fixed top slot. Self-care moments appear after check-in. | `Chapter` widget appears. First compressed paragraph shown. Profile `/u/user` gains Memory Story. |
| Unlocks | Log · Memory · Check-in | Self-care routines · Streak line | Memory Chapter widget · Public story · Archetype (preliminary) |
| Compression delivered | (none — collecting) | **Chapter 1** sealed | **Chapter 2** sealed + first rolling Story |
| Affirmation | "You arrived. The system is listening." | "A rhythm is forming. Mornings are yours." | "The system recognises you now." |
| Badge | `[ · ]` THRESHOLD | `[ ∿ ]` RHYTHM | `[ ◐ ]` RECOGNISED |

### ACT II — PATTERN

| | **M4 · Reflection** | **M5 · Architecture** | **M6 · Meridian** |
|---|---|---|---|
| UI state | Label cycling enabled on core widgets (Chapter ↔ Story). Mood pattern view. | Planner + Intentions widgets. Widget arrange unlocked. Two-column density on desktop. | Midpoint ceremony. `Meridian` widget shows Chapters 1–5 as a vertical timeline. Theme customisation. |
| Unlocks | Mood Patterns · Intention history | Planner templates · Widget arrange | Custom themes · Chapter timeline · Export data |
| Compression delivered | **Chapter 3** + Story v2 | **Chapter 4** + Story v3 | **Chapter 5** + **Half-Year Story** (2 paragraphs, "First half / what changed") |
| Affirmation | "You look back, and it looks back clearly." | "You are building structure around care." | "Half the year is written. It reads like you." |
| Badge | `[ ◑ ]` REFLECTION | `[ ▦ ]` ARCHITECT | `[ ⊖ ]` MERIDIAN |

### ACT III — DEPTH

| | **M7 · Interior** | **M8 · Discipline** | **M9 · Synthesis** |
|---|---|---|---|
| UI state | Pattern Insights widget: cross-month correlations ("on rain days you write longer"). | Self-care routines become personalised sequences built from M1–M7 completions. | Narrative Reflection: Story speaks back with one question per week drawn from chapters. |
| Unlocks | Pattern Insights · Correlated indexes | Personal routines · Mastery badge tiers | Narrative Reflection · Private spaces |
| Compression delivered | **Chapter 6** + Story v4 | **Chapter 7** + Story v5 | **Chapter 8** + Story v6 with first cross-chapter quote |
| Affirmation | "Patterns you could not see are visible now." | "Care has become practice." | "Your months are speaking to each other." |
| Badge | `[ ◎ ]` INTERIOR | `[ ▲ ]` DISCIPLINE | `[ ⧉ ]` SYNTHESIS |

### ACT IV — LEGACY

| | **M10 · Counsel** | **M11 · Codex** | **M12 · LOT® AI** |
|---|---|---|---|
| UI state | AI suggests (never commands) the day's self-care from the user's own history. Board profile on `/u/user`. | Year Codex preview builds live: 11 chapter titles listed, 12th blank. | Full OS. LOT® AI header. Year Codex readable. `/u/user` matches the Machiavelli template: archetype, values, pattern strength, Citizen Index, story. |
| Unlocks | Counsel mode · Board profile | Codex preview · Wallet / loyalty | LOT® AI · Year Codex · Quantum Cube eligibility (QI·46) |
| Compression delivered | **Chapter 9** + Story v7 | **Chapter 10** + Story v8 | **Chapter 11** + **Chapter 12** (on day 365) + **YEAR CODEX** |
| Affirmation | "The system advises now, because it has listened." | "Eleven chapters. One remains." | "One year. The portrait is complete — and still evolving." |
| Badge | `[ ✦ ]` COUNSEL | `[ ≡ ]` CODEX | `[ ◉ ]` LOT® AI |

> Note: Chapter N is sealed at the *end* of month N, so the paragraph a user reads
> during month N+1 describes month N. M12's ceremony on day 365 seals Chapter 12
> and compiles the Year Codex the same day.

### Badges as a line

The 12 Usership badges form one readable row on the profile, filling left to
right. Empty months render as `[   ]` at 30% opacity.

```
Month 4:   [ · ] [ ∿ ] [ ◐ ] [ ◑ ] [   ] [   ] [   ] [   ] [   ] [   ] [   ] [   ]
Month 12:  [ · ] [ ∿ ] [ ◐ ] [ ◑ ] [ ▦ ] [ ⊖ ] [ ◎ ] [ ▲ ] [ ⧉ ] [ ✦ ] [ ≡ ] [ ◉ ]
```

The grade adds a suffix: `◐` Trace · `◐·` Sketch · `◐:` Portrait · `◐∴` Codex.
A Codex-graded year reads `∴` twelve times — a quiet, collectible distinction.

---

## 5. Usership widgets

All follow `LOT-STYLE-GUIDE.md`: `Block` + label, label-click cycling, 1400ms
fade, opacity hierarchy, no emoji.

### 5.1 `Months unlocked:` (context widget, always present for Usership)

```
Months unlocked:                       ← label click cycles: Months → Signals → Next
4 / 12
████░░░░░░░░
Chapter 5 · Architecture · 11 days left
```
```
Signals:                                Next:
Log            14 / 20                  Month 5 unlocks Planner templates
Memory         19 / 25                  and Widget arrange.
Mornings       12 / 18                  11 days.
Self-care       9 / 15
Depth  Sketch → Portrait at 0.55
```
Signals are shown as gentle targets, never as failure. No red. No "behind".

### 5.2 `Month N:` (Month Seal — evolves `MonthlyPulseWidget`)

Appears once on the anniversary day, server-sealed.

```
Month 3:
The system recognises you now.

[ ◐: ]  RECOGNISED · Portrait

Read Chapter 2 →
                                         3 / 12 months
```
Click → dismiss phrase ("The system remembers.") → fades → Chapter widget opens.

### 5.3 `Chapter:` (Memory widget — the paragraph-long insight)

```
Chapter 2 · Rhythm:                     ← label click: Chapter → Story → Quote
In your second month you wrote mostly before 8 AM, and most often on clear
days. Tea replaced coffee in week three and stayed. You completed breathing
practice eleven times, usually after an anxious morning check-in — and the
evenings that followed were logged as calm. Care is becoming the answer you
reach for first.
                                           Portrait · 17 entries · 14 mornings
```
```
Quote:
"I did not need the second cup today."
— your Log, 14 Oct
```

### 5.4 `Meridian:` / `Codex:` (timeline, M6 and M12)

```
Codex:
 1  Threshold       Sketch     ·
 2  Rhythm          Portrait   ∿:
 3  Recognition     Portrait   ◐:
 4  Reflection      Codex      ◑∴
 …
12  LOT® AI         —          (day 365)
```
Each row opens its sealed chapter. This is the tangible proof of the year.

---

## 6. UI states — five snapshots

### Day 1 · Barebone

```
┌──────────────────────────────────────────┐
│ LOT                       Usership · M0  │
├──────────────────────────────────────────┤
│ Time:      7:12 AM                       │
│ Weather:   Clear sky · 14℃               │
│                                          │
│ Memory:                                  │
│ What do you drink first in the morning?  │
│ [ Tea ]  [ Coffee ]  [ Water ]           │
│                                          │
│ Months unlocked:  0 / 12                 │
│ ░░░░░░░░░░░░  Chapter 1 begins today.    │
│                                          │
│ Log:  _                                  │
└──────────────────────────────────────────┘
```

### Month 3 · Recognition

```
│ Month 3:  The system recognises you now. │
│ How is your morning?  [Calm] [Tired] …   │
│ Self-care:  Step outside (5 mins)        │
│ Chapter 2 · Rhythm:  In your second…     │
│ Months unlocked: 3/12  ███░░░░░░░░░      │
│ Badges: [·][∿][◐]                        │
```

### Month 6 · Meridian

Two columns. Left: check-in, self-care, Log. Right: Meridian timeline,
Mood patterns, Planner. Theme picker unlocked.

### Month 9 · Synthesis

Insight layer: Pattern Insights, Correlated Indexes, a weekly Story question
("In Month 4 you wrote about leaving the city. Is that still true?").

### Month 12 · LOT® AI  (= `/u/machiavelli`)

```
┌──────────────────────────────────────────────────────────┐
│ LOT® AI                                Usership · M12 ◉  │
├──────────────────────────────────────────────────────────┤
│ Niccolò Machiavelli · Florence, ITA                      │
│ Archetype:  The Strategist                               │
│ Values:     virtù · prudence · adaptability · fortune    │
│                                                          │
│ Badges:  [·][∿][◐][◑][▦][⊖][◎][▲][⧉][✦][≡][◉]           │
│                                                          │
│ Year Codex:                                              │
│ The art of governance is the art of understanding human  │
│ nature. Every morning in the Palazzo Vecchio…            │
│                                                          │
│ Counsel:  Rain tomorrow. Your Month 7 chapter shows you  │
│           write best on rain days. Keep the morning open.│
│                                                          │
│ Citizen Index 92.4 · Self-awareness 87 · ascending       │
└──────────────────────────────────────────────────────────┘
```

---

## 7. Machiavelli as the 12-month reference

The demo payload in `routes/public-api.ts` already carries the Month 12 end
state (archetype, values, pattern strength, Citizen Index, memoryStory,
board profile). Its counts are multi-year (1469 notes, 2847 answers). To make it
a *Usership year* reference, add a `usership` block alongside `boardProfile`:

```ts
usership: {
  startedAt: '1513-01-01',          // the year he wrote The Prince
  monthsUnlocked: 12,
  chapters: [
    { month: 1,  title: 'Threshold',   grade: 'Sketch',   badge: '·',
      paragraph: 'Exiled to Sant’Andrea, you wrote at dusk, after the inn…' },
    { month: 2,  title: 'Rhythm',      grade: 'Portrait', badge: '∿:', … },
    …
    { month: 12, title: 'LOT® AI',     grade: 'Codex',    badge: '◉∴', … },
  ],
  yearCodex: '…',                    // reuse current memoryStory as its opening
}
```

Suggested 12-month signal totals for the demo (realistic for a dedicated year,
so real users can see a reachable target):

| Signal | Year total | Per month |
|---|---|---|
| Log entries | 312 | 26 |
| Memory answers | 365 | ~30 |
| Morning check-ins | 288 | 24 |
| Self-care completions | 240 | 20 |

This lets the public profile render a browsable `Codex:` with 12 sealed
chapters — the demo then shows the *path*, not only the destination (fixes G6).

---

## 8. Implementation roadmap

```
PHASE 1 · FOUNDATION                                     (fixes G2, G3)
  - user.metadata.usership.startedAt — set on first paid event / tag grant
  - getUsershipMonth(user) shared util; replace joinedAt in MonthlyPulseWidget
  - server seal endpoint: POST /api/usership/seal  (replaces localStorage)

PHASE 2 · CHAPTER COMPRESSION                            (fixes G1)
  - src/server/utils/memory/chapter-generator.ts
      collectMonthSignals(user, period) → signals + depth + grade
      generateChapter(user, logs, prevChapter) → title/paragraph/quote/affirmation
      composeLocalChapter() fallback (same pattern as composeLocalStory)
  - scheduled-jobs.ts: daily pass, seal chapters whose anniversary is today
  - story-generator.ts: when chapters exist, build Story from chapters, not
    from the last 30 answers

PHASE 3 · WIDGETS
  - UsershipMonthsWidget (Months unlocked / Signals / Next)
  - MonthlyPulseWidget → Month Seal with badge + "Read Chapter" link
  - ChapterWidget (Chapter / Story / Quote cycle)
  - CodexTimelineWidget (M6 Meridian, M12 Codex)

PHASE 4 · PACED EVOLUTION                                (fixes G4)
  - stores/evolution: featureUnlocks gated by max(dimensionUnlock, monthUnlock)
    so tenure guarantees the floor, practice can only add
  - LOT® AI header + Counsel mode at M10/M12

PHASE 5 · BADGES + PROFILE                               (fixes G5, G6)
  - 12 Usership badges + 4 grade suffixes in badges.ts (Codex v34 line)
  - /u/user renders badge row + Codex when showMemoryStory is on
  - Machiavelli payload gains usership block
```

Each phase ships independently. Phase 1 + 2 alone already deliver the core
promise: a compressed paragraph, every month, that the user can read.

---

## 9. Copy library (style-guide compliant)

**Month Seal dismiss phrases** (extend existing set): `Onward.` · `Noted.` ·
`Sealed.` · `The chapter is kept.` · `The system remembers.`

**Trace-grade chapter openers** (kind, never scolding):
- "A quiet month. You returned four times, and each time you wrote about rest."
- "Little was logged. What was logged was honest."

**Next-month nudges** (`Next:` view):
- "Month 5 unlocks Planner templates. 11 days."
- "Three more morning check-ins raise this chapter to Portrait."

**Never:** "You're behind." · "Don't break your streak!" · "Amazing progress!"

---

## 10. Open questions for S-2

1. **Lapsed months.** If Usership pauses, does the chapter counter pause (proposed)
   or continue? Proposal: pause; the year is 12 *paid* months.
2. **Chapter privacy.** Public profile shows badge row + Year Codex by default;
   individual chapters private unless `showMemoryStory` is on?
3. **Engine.** Chapter compression on Together AI (current Story engine) or move
   to Claude for longer-context Year Codex synthesis?
4. **Month 13+.** Year 2 = "Volume II", same 12 chapters with new titles, or a
   single continuing Codex?
5. **Quantum Cube.** Tie physical delivery (QI·46 doc) to Month 12 seal event.

---

*LOT Systems Corporation · Made in the USA · brand.lot-systems.com*
