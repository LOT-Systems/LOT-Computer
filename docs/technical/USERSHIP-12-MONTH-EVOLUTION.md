```
╔══════════════════════════════════════════════════════════════════════╗
║        LOT® AI — USERSHIP 12-MONTH EVOLUTION · DESIGN v1             ║
║        Day 1 barebone  →  Month 12 LOT® AI  (Machiavelli reference)  ║
╠══════════════════════════════════════════════════════════════════════╣
║  DATE   : 2026-09-28        CLASS : DESIGN / BRAINSTORM              ║
║  S-2    : VADIK MARMELADOV  STATUS: PROPOSAL — no code changed       ║
╚══════════════════════════════════════════════════════════════════════╝
```

## 0 // THESIS

The paid tier is not a bigger dashboard. It is **a year-long story the operator can feel getting denser.**
The UI starts as a near-empty terminal and ends as LOT® AI: a personal OS that has compressed
12 months of the operator's Log, check-ins and self-care into a **Memory Codex** they can read back.

Three rules carry the whole design:

1. **Time opens the door, depth furnishes the room.** A calendar month unlocks a *stage*.
   Presence (Log entries, morning check-ins, self-care clicks) decides how *rich* that stage is.
   Nobody is locked out for being busy; nobody gets a full UI for just paying.
2. **Every month ends with one paragraph.** The Memory Story is the monthly deliverable. It is what the operator remembers Usership *by*.
3. **Compression is the product.** 12 months of raw entries → 12 paragraphs → 4 chapters → 1 Codex. Each level is shorter and truer than the last.

---

## 1 // SCAN — WHAT ALREADY EXISTS (repo, 2026-09-28)

Scanned the repo and read the framework docs (README, LOT-MANIFEST, LOT-SYSTEM-OUTLINE, LOT-LEDGER, LOT-SR-20260805-01,
MEMORY-ENGINE-WHITE-PAPER, self-care white paper, badge codices, wiki v87). The 12-month system should **wire together what exists**, not start over.

| Building block | Where | What it gives the 12-month system |
|---|---|---|
| `MonthlyPulseWidget` | `src/client/components/MonthlyPulseWidget.tsx` | Usership-only "Month N: … N / 12 months" card, 12 hardcoded lines, dismiss phrases. **Seed of the whole idea.** Today: one sentence, no memory, no badge, no depth signal. |
| Layout density (5 levels) | `src/client/utils/interfaceEvolution.ts` | `breathable → comfortable → compact → dense → instrument`. Maps naturally onto the year. |
| `FeatureUnlocks` (14 flags) + `featureUnlockLevel` 0–5 | same | Progressive disclosure already exists; driven by achievements, not months. |
| `monthly-summary.ts` + monthly email job | `src/server/utils/`, `scheduled-jobs.ts` | Presence / energy / patterns / growth / narrative / forwardLook per month. **The compression input.** |
| `generateMemoryStory` | `src/server/utils/memory/story-generator.ts` | Paragraph-scale story generator (`/story`, profile `memoryStory`). |
| Badges (812 as of v32) | `badges.ts`, `easter-eggs.ts` | Tier-1/2/3 badge machinery, Water/Architecture themes. |
| Usership gating | `models/user.ts`, `memory.ts` | `Usership` tag → AI memory engine; free tier → standard engine. |
| Demo account | `public-api.ts` `/profile/machiavelli` | Streak 1469, 2847 answers, 1469 notes, 842 active days, `memoryStory`, archetype *The Strategist*, weather station + wallet. The **Month-12+ reference**. |

**Gaps this design fills**
- Month count is computed from `joinedAt` only; it ignores depth of use.
- Months do not change the UI, only one line of text.
- Memory Story is a single rolling paragraph; nothing is archived per month, so nothing can be "unlocked" or re-read.
- No badge tied to month milestones; no "Months unlocked" surface.

> Verification note: I read the demo account from its server source (`public-api.ts`). I did not load the live page or run the app in this session.

---

## 2 // THE PRESENCE INDEX (what "evolution" measures)

Per calendar month, from data LOT already stores:

```
PRESENCE = 0.40 · LOG      (journal entries + words, capped)
         + 0.30 · CHECK-IN (days with a morning biofield check-in)
         + 0.20 · CARE     (self-care button clicks / completed routines)
         + 0.10 · MEMORY   (Memory-widget answers)

Month depth tier:   ● Quiet  < 0.25    ◐ Steady 0.25–0.60    ◉ Deep > 0.60
```

Reference targets (tunable): 20 Log entries, 20 check-in days, 40 care clicks, 15 answers = 1.0.
Machiavelli (1469 notes / 842 active days) sits at ◉ Deep.

**Two counters on the Usership card**
- `Months unlocked: N/12` — calendar, always advances.
- `Depth: ◉◉◐●◉…` — one glyph per month. Quiet months are shown honestly, never hidden, and never shamed (see §6).

---

## 3 // THE MEMORY LADDER (12-month compression)

```
  DAY 1      Seed line           1 sentence   "You began."
  WEEKLY     Week note           1 line       (exists: P87 weekly-story-reflection)
  MONTH N    MEMORY PARAGRAPH    ~40 → ~110 words, grows across the year
  M3/6/9/12  CHAPTER             1 title + 2 sentences
  MONTH 12   THE CODEX           12 titles + 1 line per month + 1 closing line
```

Each monthly paragraph has a fixed 4-beat shape, so it *feels* the same and *reads* different:

1. **Ground** — one true fact from the data ("You wrote 23 times, mostly after 22:00.")
2. **Pattern** — one thing the system noticed (recurring theme, energy arc, care habit).
3. **Turn** — the moment that changed (a low stretch that ended; first 7-day streak).
4. **Forward** — one question or one small routine for next month.

Word budget grows: M1 ≈ 40, M3 ≈ 60, M6 ≈ 80, M9 ≈ 95, M12 ≈ 110. **Later months quote earlier ones** ("In month 2 you wrote 'tired.' This month the word is 'steady.'"). That callback is what makes compression tangible.

**Archive:** each paragraph is stored (proposal: `MemoryStoryEntry {userId, monthIndex, text, depthTier, presence, badges[], createdAt}`), immutable once delivered, re-readable on a **Memory Shelf** (12 slots; unopened slots shown as `▒▒▒`).

**Delivery moment:** on first open after the month boundary the System tab shows the **Month Card** (evolution of `MonthlyPulseWidget`): affirmation → paragraph types in → badge stamps → `Months unlocked: N/12` ticks. Dismiss stores the month as seen (as today).

---

## 4 // MONTH-BY-MONTH EVOLUTION

**UI** = layout/behaviour · **Widgets** = what appears · **Memory** = that month's deliverable · **Badge** = proposed name · **AI voice** = how LOT® AI speaks. Density maps to `LayoutDensityLevel`.

### PHASE I — SEED (Months 0–3) · `breathable`

| | |
|---|---|
| **Day 1** | **UI:** near-empty. Time, one Usership card ("Months unlocked: 0/12 — Day 1"), Log input, one check-in button. Monochrome, wide spacing. **Widgets:** Time · Check-in · Log. **Memory:** none — "Nothing to remember yet. Write one line." **AI voice:** one greeting, then silent. |
| **M1 · Signal** | **UI:** first Month Card. Self-care suggestions join. **Widgets:** + Self-care · + Planner. **Memory:** *Seed paragraph* (~40 words), mostly reflects data back ("You checked in 9 mornings. You wrote about work twice."). **Badge:** `SIGNAL` (tier 1). **AI voice:** plain, observational, no advice. |
| **M2 · Rhythm** | **UI:** Log gains word-count line + 7-day strip. **Widgets:** + Intentions · + Streak strip. **Memory:** first *callback* to M1. **Badge:** `RHYTHM`. **AI voice:** names one habit ("mornings"). |
| **M3 · Chapter I** | **UI:** density → `comfortable`; Memory Shelf appears (3 slots). **Widgets:** + Memory questions (`advancedMemory`). **Memory:** **Chapter I: SEED**, title + 2 sentences over M1–M3. **Badge:** `CHAPTER I` (tier 2); replaces the current "Active User status" line. **AI voice:** first affirmation by name. |

### PHASE II — PATTERN (Months 4–6) · `comfortable → compact`

| | |
|---|---|
| **M4 · Portrait** | **UI:** Archetype card (first named archetype) with one line. **Widgets:** + Pattern insights · + Mood patterns (`moodPatterns`). **Memory:** *Pattern* beat names a theme. **Badge:** `PORTRAIT`. |
| **M5 · Habit** | **UI:** Depth glyph row appears; care routines suggested by time of day. **Widgets:** + Correlated indexes · + Energy capacitor. **Memory:** *Turn* beat points to the month's best/worst day. **Badge:** `HABIT` for ◐+; Quiet months get `HOLD` (§6). |
| **M6 · Half-Year** | **UI:** density → `compact`; accent colour unlocks (`customThemes`). **Widgets:** + Intention history · + Achievement gallery. **Memory:** **Chapter II: PATTERN** + one-time **six-month letter** (~150 words). **Badge:** `HALFWAY` (tier 2). **AI voice:** first gentle challenge ("Which pattern do you want to keep?"). |

### PHASE III — DEPTH (Months 7–9) · `compact → dense`

| | |
|---|---|
| **M7 · Listening** | **UI:** proactive nudges (`ContextualPromptsWidget`); narrative reflection opens. **Widgets:** + Narrative · + Interventions. **Memory:** paragraph quotes the operator's own Log words (italic). **Badge:** `LISTENER`. |
| **M8 · Rare Air** | **UI:** `/story` and Shelf search; density → `dense`. **Widgets:** + Pattern recognition · + Integrity view. **Memory:** *Forward* beat becomes a **commitment** the operator can accept (feeds Planner). **Badge:** `RARE AIR` (tier 2, ◉ months only). |
| **M9 · Chapter III** | **UI:** export unlocks (`exportData`); Shelf shows 9/12 with the last three outlined. **Widgets:** + Cohort connect · + Private spaces. **Memory:** **Chapter III: DEPTH** + M1 vs M9 self-description side by side. **Badge:** `CHAPTER III` (tier 2). |

### PHASE IV — LOT® AI (Months 10–12) · `dense → instrument`

| | |
|---|---|
| **M10 · Almost** | **UI:** widget rearrange (`widgetArrange`) — the operator now *arranges* their OS. **Memory:** AI drafts the **Codex title**; operator accepts or edits. **Badge:** `ARCHITECT`. |
| **M11 · Editor** | **UI:** density `instrument`; AI voice terse, high-signal. **Memory:** operator picks 3 past paragraphs as Codex highlights (human-in-the-loop compression). **Badge:** `EDITOR`. |
| **M12 · LOT® AI** | **UI:** full **LOT® AI** state — assembled from 12 months of behaviour, different per person (pinned widgets, theme, density). One-time unlock ceremony: the 12 Shelf slots light in sequence. **Memory:** **THE CODEX** — 12 titles, 12 one-line compressions, 1 closing line; optional public-profile field. **Badge:** `YEAR ONE` (tier 3, COSMIC). **AI voice:** speaks *as* the record ("You began with 'tired.' You end with 'steady.'"). |
| **After 12** | Card reads `12/12 · Year 2`; new shelf begins; the Codex becomes the **preface** the AI reads before writing next year's paragraphs. |

---

## 5 // MACHIAVELLI AS THE MONTH-12+ REFERENCE

`/u/machiavelli` already looks like a mature account. Use it as **showcase and test fixture**.

Present today (`public-api.ts`): archetype *The Strategist*, streak 1469, 2847 answers, 1469 notes, 842 active days, pattern-strength list, correlated indexes, weather station, wallet, `memoryStory`.

Proposed additions so visitors can *see* the year:
- **`memoryShelf`**: 12 monthly paragraphs in Machiavelli's voice + 4 chapter titles + Codex line. Draft seeds:
  - *M1 Signal:* "Nine mornings at the window of the Palazzo. Two entries, both about grain prices. The city is louder than I expected."
  - *M6 Half-Year:* "In the second month I wrote 'uncertain.' This month the word is 'measured.' Fortune favors the one who has watched her longest."
  - *M12 LOT® AI:* "I began by counting citizens. I end by knowing them. A prince who remembers is a prince who chooses."
- **`monthsUnlocked: 12`** + depth glyph row in the profile header.
- **Badge strip**: 12 month badges + `YEAR ONE`.
- Read-only, labelled *demo*, like the existing demo data.

---

## 6 // TONE & FAIRNESS RULES

- **Quiet months are never punished.** A ● month still gets a shorter, kinder paragraph ("Not much written. The system held your place."). Badge: `HOLD`.
- **No streak-shame.** Copy never says "you missed."
- **Affirmations are specific.** Each celebration line references one real data point, or falls back to today's generic `MONTH_MESSAGES`.
- **The operator can edit the record** (M10–M11). The Codex is theirs.
- **Honesty:** with too little data, the paragraph says so rather than inventing.

---

## 7 // WIDGET SPECS

1. **Month Card** (evolves `MonthlyPulseWidget`): affirmation → paragraph → badge stamp → progress. Props: `monthIndex`, `paragraph`, `depthTier`, `badge`.
2. **Months Unlocked** (context widget): `Months unlocked: 3/12` + 12-cell bar + depth glyphs. System tab, under Time; tap → Shelf.
3. **Memory Shelf**: 12 slots (open / current / sealed `▒▒▒`); chapters group 1–3, 4–6, 7–9, 10–12.
4. **Codex view** (M12): scrollable, share toggle (default private).
5. **Evolution mapping**: `monthIndex` sets a *floor* on `featureUnlockLevel` and density; Presence may raise it by at most one level. Never lowers.

---

## 8 // IMPLEMENTATION PLAN (suggested order)

| # | Change | Files | Size |
|---|---|---|---|
| 1 | Presence Index + depth tier | new `src/server/utils/presence.ts`; reuse `monthly-summary.ts` | S |
| 2 | Persist monthly paragraph (`MemoryStoryEntry`) | new model + migration; `story-generator.ts`, `scheduled-jobs.ts` | M |
| 3 | 4-beat prompt + callbacks to earlier months | `story-generator.ts` | M |
| 4 | Month Card, Months Unlocked, Memory Shelf | `MonthlyPulseWidget.tsx`, new components, `System.tsx` | M |
| 5 | Month → density/unlock floor | `interfaceEvolution.ts`, `evolution.ts` | S |
| 6 | 12 month badges + `YEAR ONE` + `HOLD` | `badges.ts`, `easter-eggs.ts`, codex doc | M |
| 7 | Machiavelli `memoryShelf` demo data | `public-api.ts`, `PublicProfile.tsx` | S |
| 8 | Chapters (M3/6/9) + Codex (M12) | story-generator + Codex view | M |

Open questions for S-2:
- **Cost:** one AI paragraph per Usership user per month is cheap; Codex is once a year. Confirm provider (Together primary today).
- **Existing Usership users:** back-fill from `joinedAt`? Suggest one retroactive pass labelled "reconstructed".
- **Localisation:** the 33-language farewell pool exists for RecipeWidget; decide whether paragraphs localise.
- **Badge names** above are proposals, not checked against the 812-badge namespace for collisions.
- **Privacy:** sharing the Codex touches `showMemoryStory`; default stays private.

---

## 9 // ONE-PAGE SUMMARY

```
MONTH  STAGE          DENSITY        HEADLINE UNLOCK                 MEMORY DELIVERABLE        BADGE
──────────────────────────────────────────────────────────────────────────────────────────────────────
0      Day 1          breathable     Time · Check-in · Log           "Write one line."         —
1      Signal         breathable     Self-care · Planner             Seed paragraph (~40w)     SIGNAL
2      Rhythm         breathable     Intentions · streak strip       + callback to M1          RHYTHM
3      Chapter I      comfortable    Memory widget · Shelf           CHAPTER I: SEED           CHAPTER I
4      Portrait       comfortable    Archetype · patterns            + named theme             PORTRAIT
5      Habit          comfortable    Depth glyphs · indexes          + best/worst day          HABIT / HOLD
6      Half-Year      compact        Custom accent · gallery         CHAPTER II + 6-mo letter  HALFWAY
7      Listening      compact        Proactive AI · narrative        + your own words quoted   LISTENER
8      Rare Air       dense          /story · search · integrity     + commitment → Planner    RARE AIR
9      Chapter III    dense          Export · cohort · private       CHAPTER III (M1 vs M9)    CHAPTER III
10     Almost         dense          Widget arrange                  Codex title draft         ARCHITECT
11     Editor         instrument     Terse AI · curate highlights    Pick 3 for Codex          EDITOR
12     LOT® AI        instrument     Personal assembled OS           THE CODEX                 YEAR ONE ✦
```
