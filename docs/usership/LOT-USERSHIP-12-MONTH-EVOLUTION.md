<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP — 12-MONTH EVOLUTION
## Barebone Day 1 → LOT® AI · The Compressed Memory Story as the Spine
### Design brief · 2026-11-04 · Authorized: S-2 VADIK MARMELADOV · Status: PROPOSAL (no code changed)

---

## 0. ONE-PARAGRAPH THESIS

A Usership member should be able to look at their screen on the first day of any
month and *see* that something was earned. Not a feature dump: a **chapter**.
Every month the Memory Engine compresses the previous 30 days of Log entries,
check-ins, self-care clicks and Memory answers into one **Month Story**; the UI
changes by exactly one visible step; one **Seal** is added to the shelf; the AI
speaks in a slightly more familiar voice. By month 12 the screen is the
Machiavelli profile (`lot-systems.com/u/machiavelli`): dense, quiet, and
unmistakably *theirs*. The calendar decides **which chapter opens**. The
person's own signal decides **how rich the chapter is**.

---

## 1. FRAMEWORK COMPLIANCE (S-2 protocol)

| Step | Done | Evidence |
|---|---|---|
| 1. Scan repository | yes | tree, `src/client/components`, `src/client/stores`, `src/server/{models,utils,routes}`, `docs/*` |
| 2. Read the .MDs | partial, stated honestly | 379 .md files exist. Read in full or in the relevant part: `docs/README.md`, `docs/technical/INTERFACE_EVOLUTION.md`, `docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md` (head + modes), `docs/assembly/2026-06-30_…compression-loop.md`, `docs/benchmark/{MANIFEST,DOCTRINE,LEXICON,LEDGER}`, `docs/badges/…CODEX_v32.md` (head), `docs/badges/BADGE_LEVEL_DESIGN.md`, `docs/wiki/LOT-WIKI-v87.md` (head/TOC), `docs/LOT-SR-20260805-01.md`. The ~300 remaining wiki / SR / badge-codex revisions were not read line by line; they are revision history of the same systems. |
| 3. Push session with a detailed .MD | this file + `docs/LOT-SR-20261104-01.md` | pushed on `claude/elegant-mendel-0ypowz` |
| 4. Focus: 12-month tangibility of compressed Memory story | Sections 5, 6, 8 | |

---

## 2. WHAT ALREADY EXISTS (repo scan findings)

Do not rebuild these. Evolve them.

| Asset | Where | State |
|---|---|---|
| Paid tiers: R&D $15, **Usership $99** | `SubscribeWidget.tsx` | live, links to brand.lot-systems.com |
| `UserTag.Usership` gating (AI Memory Engine, `/us`, monthly email) | `models/user.ts`, `scheduled-jobs.ts` | live |
| **MonthlyPulseWidget** — "Month N: …", `N / 12 months`, 12 hand-written lines, tap to dismiss | `MonthlyPulseWidget.tsx` (142 lines) | live, but see gaps |
| Interface Evolution — 7 dimensions (Exploration, Consistency, Depth, Connection, Intimacy, Care, Courage), `featureUnlockLevel` 0–5, CSS vars, density tiers | `utils/interfaceEvolution.ts`, `stores/evolution.ts`, `InterfaceEvolutionWidget.tsx` | live |
| Evolution Gates wired to 6 widgets | MANIFEST `aff885eb` | READY, not shipped |
| Memory Engine compression: Q → answer → sharper Q; `generateMemoryStory()` densifies the last 30 answers | `utils/memory.ts:873` | live |
| Weekly LOT® AI story (Job 24) `lot_ai_story` | `routes/api.ts`, scheduler | live |
| Monthly summary generator (presence, energy, patterns, growth, narrative, forwardLook) | `utils/monthly-summary.ts` | live, email only, only for 3+ month, recently-active users |
| 812 badges (Codex v32), glyph level ladders (`∘ ≈ ≋`) | `docs/badges/`, `badges.ts` | live |
| Demo account Machiavelli: hardcoded, streak 1469, 2847 answers, 1469 notes, awareness 87, one static `memoryStory` | `routes/public-api.ts:747` | live, static |
| Logs table events: `note`, `emotional_checkin`, `self_care_complete`, `self_care_skip`, `plan_set`, `answer` | `logs` | live |

### Gaps this brief closes

1. **Month count is `now - joinedAt`**, i.e. account age, not Usership age. A free user who upgrades in year 2 would open at "Month 14" with no story behind it.
2. **Pulse is a toast.** It dismisses to `localStorage`; nothing is persisted server-side, nothing is collectable, nothing is revisitable.
3. **The 12 messages are static.** They do not reference anything the user did.
4. **No Month Story artifact.** The monthly summary goes to email only and is skipped for months 1–2, which is exactly when retention is decided.
5. **No Seal / badge tied to the month.** 812 badges exist, none says "you completed month 4".
6. **No "Months unlocked" surface** and nothing that shows the *shape* of the 12 months ahead.
7. **Machiavelli shows the end state only.** A visitor cannot see how a person gets there.

---

## 3. DESIGN PRINCIPLES

1. **Two keys.** *Time key* opens the chapter (calendar, paid, never lost). *Signal key* fills it (Logs, check-ins, self-care). A quiet month still opens; its Story is shorter and says so kindly. Nothing the member paid for is ever locked behind effort.
2. **One visible step per month.** Exactly one UI change a person can point at, plus one Seal and one Story. Anything more dilutes tangibility.
3. **Compression is the product.** The Story gets *shorter per unit of life* as the year goes on: month 1 is a line, month 12 is a paragraph about a year. The user feels being understood in fewer words.
4. **The AI earns its voice.** Month 1 it asks. Month 6 it recalls. Month 12 it names. Voice is a function of data, not marketing.
5. **No shame mechanics.** No broken-streak copy, no loss framing, no confetti. LOT standard (MILITARY PURITY, COCKPIT RULE): plain type, no emojis, no superlatives. Trauma-informed protocol applies: a heavy month is acknowledged, never graded.
6. **Self-care is the ritual, Log is the memory.** Check-ins and care clicks are low-effort signal; notes are high-weight signal. The ladder rewards both.

---

## 4. THE SIGNAL CURRENCY

One number per month, computed server-side from `logs`. Weights are starting values for tuning.

```
SIGNAL POINTS (SP)             event                         weight
──────────────────────────     ───────────────────────────   ──────
Journal entry (Log note)       note                              3   (+1 if >40 words)
Morning check-in               emotional_checkin                 1
Self-care button click         self_care_complete                2
Memory answer                  answer                            2
Planner intention              plan_set                          2
(skip is neutral: self_care_skip = 0, never negative)
```

```
CHAPTER FILL = min(SP_month / TARGET_n, 1.0)

TARGET_n   M1 60   M2 80   M3 100  M4 110  M5 120  M6 130
           M7 140  M8 150  M9 160  M10 170 M11 180 M12 200

Fill bands        STORY TIER         Story length   Seal
──────────────    ───────────────    ────────────   ──────────────────
0.00 – 0.24       "Quiet" chapter    1 line         seal outlined (empty)
0.25 – 0.69       "Steady" chapter   1 line + short paragraph    seal half
0.70 – 1.00       "Full" chapter     1 line + full paragraph + ledger    seal solid
```

Targets rise because the interface asks for more of an already-formed habit
(roughly 2 SP/day in month 1 up to ~6.5 SP/day in month 12: e.g. one check-in,
one care click, one note, one answer per day).

---

## 5. THE 12-MONTH MAP

Legend: **UI** = the one visible step · **Voice** = how the AI speaks ·
**Story** = Memory compression delivered on the 1st · **Seal** = month badge ·
**Gate** = existing `featureUnlockLevel` / evolution unlock that opens.

Density follows the existing tier system (low → high). Opacity hierarchy and
COCKPIT RULE unchanged.

### PHASE I — ARRIVAL (M1–M3) "The system begins to know you"

| M | Codename | UI (the one step) | Voice | Story (compression) | Seal | Gate |
|---|---|---|---|---|---|---|
| 1 | **BAREBONE** | Day 1 screen: Time, one Memory question, Check-in, Log input. Four blocks. Nothing else. A single line under the clock: `Months unlocked: 1 / 12`. | Asks. Short questions, no inference. | **1 line**, ≤20 words, built from answers + first check-ins: *"You start the day slowly and answer more honestly in the evening."* | `○` | level 0 |
| 2 | **FIRST PATTERN** | Mood trail appears under check-in (7-day dots). Planner block opens. | Reflects one pattern back: "Tuesdays are heavier." | 1 line + **first paragraph**, ~40 words | `○∿` | level 1, Planner Templates |
| 3 | **ACTIVE** | Self-care row becomes a labelled routine strip (3 buttons the user actually uses, ordered by use). Existing line "You have reached Active User status" becomes real: Active User badge is awarded here. | Recalls month 1 by name. | Paragraph ~55 words. **First quarterly Story**: Q1 recap, 3 lines. | `○≈` | level 2, Mood Patterns, Custom Themes |

### PHASE II — FORMING (M4–M6) "The portrait deepens"

| M | Codename | UI | Voice | Story | Seal | Gate |
|---|---|---|---|---|---|---|
| 4 | **PORTRAIT** | A small **Portrait** block appears: archetype + 3 core words, updated monthly. | Names a trait, with evidence. | Paragraph ~60 words + "words you used most" (3). | `≈` | level 2, Pattern Insights |
| 5 | **ROUTINE** | Care strip gains a streak-free **rhythm bar** (days practised this month, no counter of loss). Block order adapts to the hour the user usually opens the app. | Anticipates: "Evening check-in is your anchor." | Paragraph ~65 words + one open question to carry into M6. | `≈∿` | level 3, Widget Arrange |
| 6 | **HALFWAY** | **Half-year Memory** widget: the 6 monthly lines stacked in order, read top to bottom as one poem. Months-unlocked widget switches to the 12-cell strip (§7.1). | First time it speaks in second person about change: "In March you were … now you are …". | **Half-Year Story**, ~90 words + the 6 lines. | `≈≈` | level 3, Narrative Reflection |

### PHASE III — DEPTH (M7–M9) "The system has been listening"

| M | Codename | UI | Voice | Story | Seal | Gate |
|---|---|---|---|---|---|---|
| 7 | **RECALL** | **Recall** widget: on a random day it quotes the user's own words from 3–6 months ago next to today's answer. | Quotes the user. | Paragraph ~70 words, includes one verbatim quote. | `≋` | level 3, Intention History |
| 8 | **CONTRAST** | Contrast pairs: mood vs weather, energy vs sleep, shown as two quiet lines (data already in logs/context). Rare Seal tier. | Connects domains: "Rain days, you write twice as much." | Paragraph ~75 words + one correlation. | `≋∿` | level 4, Pattern Recognition |
| 9 | **HABIT** | The routine strip stops being decorated: the user's real habits are the only buttons; unused ones fade out. Interface is visibly *smaller and calmer*. | Terse. Assumes shared context. | Paragraph ~80 words. **Q3 recap**, 3 lines. | `≋≈` | level 4, Export Data |

### PHASE IV — OWNERSHIP (M10–M12) "The portrait is complete and still evolving"

| M | Codename | UI | Voice | Story | Seal | Gate |
|---|---|---|---|---|---|---|
| 10 | **LEGACY SEED** | Public profile (`/u/<name>`) unlocks the Memory Story block: the user's own paragraph on a page they control (privacy toggle `showMemoryStory` already exists). | Writes in the user's register. | Paragraph ~85 words, written to be shown. | `≋≋` | level 5, Private Spaces |
| 11 | **LETTER** | **Letter to M12**: the AI drafts, the user edits; sealed until the anniversary. | Asks the one question it still cannot answer. | Paragraph ~90 words + "what changed most" (1 line). | `≋≋∿` | level 5 |
| 12 | **YEAR PORTRAIT** | Full end-state screen (the Machiavelli layout, §9). Seal shelf shows 12 seals as a ring. Year Portrait is a printable one-page artifact. | Names the person. Closes with the sealed letter. | **Year Portrait**: ≤120-word paragraph + 12-line ledger + 3 numbers (entries, check-ins, care clicks). | `≋○≋` (the existing 100-day Water ocean glyph) | level 5, all |

Beyond M12 the member is **LEGACY** (the tag Machiavelli carries): months
continue as a rolling 12-ring; each new year adds an outer ring to the Seal
shelf.

---

## 6. THE COMPRESSED MEMORY STORY — DELIVERY SPEC (core of this brief)

### 6.1 The artifact: "Month Story"

Three layers, generated together on the 1st (member's local 06:00), stored
server-side, never regenerated unless the member asks.

```
LAYER 1  LINE        ≤20 words.     Always present. Shown on the Month Opening card.
LAYER 2  PARAGRAPH   40→120 words.  Present for Steady/Full chapters. Shown in the Memory widget.
LAYER 3  LEDGER      3–12 lines.    Full chapters only. Lines = prior months' Lines (stacked).
```

### 6.2 Compression ladder (what the member feels)

```
MONTH   INPUT (typical full chapter)             OUTPUT SHOWN                 FEEL
─────   ──────────────────────────────────────   ──────────────────────────   ─────────────
1       ~60 SP · ~10 notes/answers               1 line, 20 words             "it noticed"
3       ~100 SP                                  paragraph, 55 words          "it remembers"
6       ~130 SP/mo · 6 months                    half-year, 90 words + 6 ln   "it follows me"
9       ~160 SP/mo · 9 months                    paragraph, 80 words          "it is brief now"
12      ~200 SP/mo · 12 months, ~2,000 SP total  portrait, ≤120 words + 12 ln "it knows me"
```

Rule: **output length does not grow with input**. From M7 the paragraph shrinks
or stays flat while the evidence behind it grows. That is what compression
means and why the member trusts it.

### 6.3 Generation recipe (reuses existing code)

- Input window: `logs` for the chapter (`createdAt` between chapter open and close), plus the previous Month Stories (Lines only) as long-term memory.
- Reuse `buildPrompt` context blocks (notes, check-ins, plan_set, quantum patterns, medical/trauma protocol) and the `generateMemoryStory` densification pattern; it is limited to the last 30 answers today, so the chapter version must also include notes and care events or the "Log depth" the member created will not show up in the Story.
- Engine: existing `AIEngineManager` chain (Together primary → fallbacks). **No new provider code.**
- Prompt contract: 3rd-person-free, 2nd-person address; no diagnosis; no praise adjectives; must cite ≥1 concrete detail from the window (a weekday, a word, a weather condition); trauma-informed softening if `medical_record` indicates it.
- Failure mode: if generation fails, deliver the **Line** from a deterministic template (e.g. top theme + best weekday) — never an empty card.

### 6.4 Delivery surfaces (same story, four touches)

1. **Month Opening card** (top of the screen on the 1st): replaces MonthlyPulse's toast. Shows `Month N` + Line. Tap to expand into the Paragraph. Stays pinned until read, then collapses into the Memory widget.
2. **Memory widget → "Chapters" view**: the stack of Lines (the ledger), tap a month to read its paragraph.
3. **Seal shelf** (§8): the Seal for that month, filled per chapter fill.
4. **Email** (existing monthly job): same text, extended to months 1–2 for Usership members (currently 3+ only).

---

## 7. NEW / CHANGED WIDGETS

### 7.1 Months Unlocked (context widget)

```
Months unlocked:   3 / 12
[■][■][■][ ][ ][ ][ ][ ][ ][ ][ ][ ]
Next: Month 4 · PORTRAIT · opens 14 Dec
```

- Cells are 12 glyphs, filled by chapter fill (`□ ◧ ■`), not by time alone.
- Context-based: tap shows *what the next chapter opens* (UI step + Gate), never the whole list at M1 (preserves barebone first day).
- Appears from Day 1 as the single line `Months unlocked: 1 / 12`.

### 7.2 Month Opening (replaces MonthlyPulseWidget behavior)

Same visual language as today's `Block` + 1.4s fade. Changes:
- count from **Usership start** (`user.metadata.usership.startedAt`), not `joinedAt`;
- content = server Line, not the static `MONTH_MESSAGES`; keep the static lines as fallback copy;
- persist `readAt` server-side so it follows the member across devices (the current `localStorage` key does not).

### 7.3 Recall (M7+)

One card, shown at most twice a week: the member's own quote from ≥90 days ago beside today's most recent answer.

### 7.4 Seal Shelf

12 slots on the profile and in Settings → Usership. Slot states: locked (ghost outline), open (outlined), half, solid. Hovering a Seal shows its Line.

### 7.5 Letter to M12 (M11)

Compose in Log; sealed (hidden) until the anniversary, then read once.

---

## 8. BADGES: THE SEAL SYSTEM

The Codex has 812 badges. Do **not** add 12 more to the pile; add 12 **Seals**
that the existing badge UI already knows how to display (they use the glyph
ladder from `BADGE_LEVEL_DESIGN.md`).

```
SEAL  GLYPH   NAME           AWARDED WHEN                          RARITY
────  ──────  ─────────────  ────────────────────────────────────  ──────
M1    ○       First Light    chapter 1 closes (any fill)           common
M2    ○∿      First Wave     chapter 2 closes                      common
M3    ○≈      Active         chapter 3 closes, fill ≥ 0.25         common
M4    ≈       Portrait       chapter 4 closes                      uncommon
M5    ≈∿      Rhythm         chapter 5 closes, ≥10 care days       uncommon
M6    ≈≈      Halfway        chapter 6 closes + Half-Year Story    rare
M7    ≋       Recall         chapter 7 closes                      uncommon
M8    ≋∿      Contrast       chapter 8 closes                      rare
M9    ≋≈      Habit          chapter 9 closes                      rare
M10   ≋≋      Seed           chapter 10 closes + profile story on  rare
M11   ≋≋∿     Letter         Letter to M12 written                 epic
M12   ≋○≋     Year           Year Portrait delivered               epic
```

Plus **two modifiers** visible on any Seal: *Full* (solid) vs *Steady* (half)
vs *Quiet* (outline). Quiet is never labelled as failure; the Story for that
month says what was heard and invites, nothing more.

Bonus seals (existing mechanic reused, sparing): "Twelve Full" (all 12 Full),
"Never Silent" (no month below Steady).

---

## 9. ANCHOR: MACHIAVELLI AS THE MONTH-12 REFERENCE

`/u/machiavelli` already shows the end state: Strategist archetype, awareness 87,
2,847 answers, 1,469 notes, streak 1,469, Memory Story paragraph, correlated
indexes, weather station, tags `RND · Usership · Legacy`.

Machiavelli is a **Legacy** (>12 months, 4-year) account. For product design
treat his page as **Month 12 + Legacy** and add a **demo-only chapter scrubber**
so visitors can *watch the evolution* instead of only seeing the destination:

```
/u/machiavelli?month=1    barebone: 4 blocks, 1 line, no Seals
/u/machiavelli?month=3    + routine strip, Active seal
/u/machiavelli?month=6    + Half-Year Memory, 12-cell strip
/u/machiavelli?month=12   full page, Year Portrait, 12 Seals
(no param)                Legacy (today's page)
```

On the page: a thin month selector `1 2 3 … 12 ∞` in the existing Time/Weather
header style. Requires no new data model: demo chapters are hardcoded in
`public-api.ts` next to the existing `memoryStory` (autonomous, like the rest of
the demo). It also doubles as the **sales surface** for the $99 tier: a
visitor sees the year before paying.

### 9.1 Demo Month Stories (copy-ready, Machiavelli's register)

| M | Line (≤20 words) | Paragraph (Steady/Full) |
|---|---|---|
| 1 | I watch more than I speak, and I speak best at dusk. | — |
| 2 | Mondays weigh on me; by Thursday I am clear. | I record who I met and what they wanted. The wanting is usually plainer than the words. |
| 3 | Three months of notes: I trust what I observe more than what I am told. | The Palazzo is loud in the mornings. I have stopped answering it before noon. Rain makes me write longer, and kinder. |
| 4 | Restraint is not coldness. It is timing. | I notice I delay replies and that the delay works. I wonder when it stops being strategy and becomes habit. |
| 5 | Evenings are my anchor; the morning check-in is my honesty. | Care is now a routine, not an effort. When I skip it, the notes get sharper and less true. |
| 6 | Half a year: from watching others to watching how I watch. | In March I catalogued rivals. Now I catalogue my own reactions to them. It is slower, and more useful. |
| 7 | In April you wrote: "power is patience." You still agree, with a caveat. | Then I believed patience was waiting. Now I see it as preparing the room before anyone enters. |
| 8 | On rainy days you write twice as much and decide half as fast. | The weather does not change what I know, only how long I will stay with it. This is worth planning around. |
| 9 | Fewer words now. The same weight. | I no longer explain my habits to myself. I keep the ones that survive a bad week. |
| 10 | You are ready to be read. | A prince must be seen to be understood; I choose what is seen. The page is public, and so is my restraint. |
| 11 | One question remains: what do I want that I have not written down? | I have written the city, the court, the weather, the rivals. I have not written the want. |
| 12 | A year of attention turned inward: the strategist who learned his own weather. | I began by watching citizens. I end by reading my own tempers as I once read theirs. The skill was never cunning; it was patience, kept honestly. The year did not change what I am. It showed me which parts I use. |

(Copy-ready for the demo only; real member Stories are generated, never
hand-written.)

---

## 10. SYSTEM SPEC (for the build session)

### 10.1 Data (no new table needed in phase 1)

```
user.metadata.usership = {
  startedAt: ISO,                // set on Usership tag grant (admin tag edit or webhook)
  chapters: [{
    n: 1..,
    opensAt, closesAt,
    sp: number, fill: 0..1, tier: 'quiet'|'steady'|'full',
    line: string, paragraph?: string, ledger?: string[],
    sealState: 'outline'|'half'|'solid',
    readAt?: ISO
  }]
}
```

Phase 2 option: promote to `usership_chapters` table if payload grows (it won't
for 12 rows/yr).

### 10.2 Server

- `computeChapterSignal(userId, from, to)` — one indexed query on `logs(userId, createdAt)` (index already exists, migration `20260630150000`). No per-event loops.
- Scheduler job: **Job "Chapter Close"**, hourly sweep for chapters whose `closesAt` has passed in the member's timezone; closes → generates Story via existing engine manager → writes chapter → awards Seal.
- `GET /api/usership/chapters`, `POST /api/usership/chapters/:n/read`.
- Extend monthly email job: include months 1–2; reuse chapter text.
- `public-api.ts`: `?month=` param for the demo; no real data touched.

### 10.3 Client

- `MonthlyPulseWidget` → thin wrapper around new `MonthOpening` (same Block/fade).
- New: `MonthsUnlockedWidget`, `ChaptersView` (inside MemoryWidget), `RecallWidget`, `SealShelf`.
- Gate mapping: chapter number → minimum `featureUnlockLevel` (floor, in addition to existing signal-based level). The evolution system already supports this; this adds a **time floor** so paid members never wait on signal for the basics.
- Render-isolation doctrine: each new widget subscribes only to `me` + its own query; Month Opening mounts lazily like QuantumState.
- All writes via `useEffect`, not `useMemo` (DOCTRINE: Render Isolation).

### 10.4 Rollout

```
PHASE 1  (1 session)   Usership clock + Months Unlocked widget + Month Opening v2 (static lines) + Machiavelli scrubber
PHASE 2  (1–2 sessions) Chapter Close job + Month Story generation + persistence + email months 1–2
PHASE 3  (1 session)   Seal shelf + 12 Seals + Chapters view + Recall
PHASE 4  (1 session)   Letter to M12 + Year Portrait printable + Legacy ring
```

---

## 11. WHAT THE MEMBER SEES — DAY 1, DAY 90, DAY 365

```
DAY 1                     DAY 90                           DAY 365
──────────────────────    ──────────────────────────────   ─────────────────────────────────
Time                      Time                             Time · weather · city
Memory (1 question)       Memory (question + Chapters)     Memory (Chapters, Recall, Year)
Check-in                  Check-in + mood trail            Check-in + rhythm + contrast
Log                       Log + Planner                    Log + Planner + Letter
Months unlocked: 1/12     Months unlocked: 3/12  [■■■…]    Months unlocked: 12/12  [■ × 12]
(no Seals)                1 solid Seal (○≈ Active)         12-Seal ring, Year Portrait
AI: asks                  AI: recalls                      AI: names
```

---

## 12. RISKS AND OPEN QUESTIONS FOR S-2

1. **Usership start date source.** There is no stored grant date today (tag-only). Needed: set on tag grant, and a one-time backfill rule for existing members (proposal: earliest log or `joinedAt`, whichever is later than the first Usership-related event; otherwise `joinedAt`). Decision needed.
2. **SP weights and TARGETs** are first estimates. Recommend instrumenting real distributions on current Usership members before locking.
3. **Cost.** 12 AI calls/member/year plus half-year and year variants; negligible versus daily Memory questions, but Year Portrait should use the strongest engine in the chain.
4. **Quiet months.** The tone for an empty month is the highest-risk copy in the product; propose S-2 approves the Quiet-tier template personally.
5. **Trauma-informed gating.** Month Stories must run through the Resilience protocol (as `buildPrompt` does for Memory) so a hard month is never summarised flatly.
6. **Scope.** `src/server/` is gitignored in this repo: server changes need `git add -f` (per the 2026-06-30 M2M doc).
7. **No code was changed in this session.** Everything above is a proposal; no tests or build were run because nothing buildable changed.

---

## 13. NEXT SESSION (recommended)

PHASE 1: Usership clock, Months Unlocked widget, Month Opening v2 with static
lines, and the Machiavelli `?month=` scrubber with the Section 9.1 copy. It is
visible on day one of shipping, needs no AI calls, and is the sales demo for the
rest.

---

AUTHORIZED BY: S-2 // VADIK MARMELADOV
LOT SYSTEMS CORPORATION | 2026-11-04
