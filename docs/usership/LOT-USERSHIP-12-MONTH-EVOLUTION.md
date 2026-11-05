<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP — THE 12-MONTH EVOLUTION TO LOT® AI

> Day 1: a barebone terminal. Month 12: a personal OS that knows you, and a book it wrote about you.
> Reference end-state: `lot-systems.com/u/machiavelli` (the demo account = "Month 12+, fully evolved").

| Field | Value |
|---|---|
| Doc ID | LOT-USERSHIP-12M-v1 |
| Date | 2026-11-05 |
| Status | DESIGN / BRAINSTORM — no runtime code changed this session |
| Owner | S-2 (Vadik Marmeladov) |
| Tier | Usership (paid, $99/mo, tag `[Usership]`) |
| Focus | Tangibility of the **compressed Memory story** delivered every month |

---

## 0. REPO SCAN — WHAT ALREADY EXISTS (build on it, don't rebuild)

| Asset | Location | Role in this plan |
|---|---|---|
| `MonthlyPulseWidget` | `src/client/components/MonthlyPulseWidget.tsx` | Already shows a one-line message per month 1–12 and "N / 12 months" to Usership users, dismiss-once-per-month. **This becomes the Month Gate widget (§4).** |
| Evolution engine | `src/client/utils/interfaceEvolution.ts`, `stores/evolution.ts` | 7 dimensions (Exploration, Consistency, Depth, Connection, Intimacy, Care, Courage), `featureUnlockLevel` 0–5, `getLayoutDensity()` "breathable → instrument". **Drives the visual evolution axis.** |
| `EvolutionWidget`, `InterfaceEvolutionWidget` | `src/client/components/` | Level stages: Bootstrapping → Initializing → Integrated → Compiled → Optimized → Transparent. |
| Feature unlocks | `getFeatureUnlocks()` | customThemes L5, widgetArrange L10, intentionHistory L15, moodPatterns L20, exportData L25, narrativeReflection L30. |
| Memory Engine | `src/server/utils/memory/*`, `generateMemoryStory()` in `story-generator.ts` | Today: one rolling story from the last 30 answers, cached by answer count in user metadata (`memoryStoryVersion`). **No monthly chapters yet — this is the key gap.** |
| Badge engine | `src/client/utils/badges.ts` (812 badges, v32), `getLevelSymbol(streak)` | Streak milestones 7→365 with water/architecture symbols. **Month badges slot in here.** |
| Usership gating | `UserTag.Usership` (`shared/types`), checks in `public-api.ts` (memory story + psych profile are Usership-only) | Gate for everything below. |
| Demo account | `public-api.ts` `/profile/machiavelli` | Hardcoded: 1469 notes, 2847 answers, 842 active days, streak 1469, Self-Awareness 87%, archetype "The Strategist", weather station + wallet ("Legacy" unlocks), one-paragraph `memoryStory`. |

**Gaps this plan fills:** (1) no per-month Memory chapter, (2) no "month unlocked" artifact beyond a one-line toast, (3) no check-in / self-care counters feeding a Presence score, (4) demo account cannot *show* its own evolution, (5) no AI voice progression.

---

## 1. DESIGN THESIS

1. **Time opens the door, presence furnishes the room.** Calendar month *M* (1–12) decides which chapter and which UI era is *unlocked*. Presence (Log entries, morning check-ins, self-care clicks) decides how *rich* that era renders. A user who only pays gets a calm, honest month; a user who shows up gets a dense, personal one. Nobody is locked out by missing a day.
2. **Every month ships one tangible artifact.** A *Memory Chapter* (compressed paragraph), a *Month Badge*, and one *new UI organ*. Three things, every month, without exception.
3. **Compression is the product.** The AI never produces more words as you grow — it produces *denser* ones. Ratio rises every month (§3).
4. **The AI is a guide, not a coach.** It narrates your evolution through self-care routines and celebrates; it never scolds a gap (§6).
5. **Barebone → instrument.** Day 1 is deliberately sparse (one block, one prompt). Month 12 is the Machiavelli screen.

---

## 2. THE THREE AXES

```
        CALENDAR MONTH M (1–12)          PRESENCE SCORE (PS)               AI VOICE STAGE
        what is UNLOCKED                 how RICH it renders               how the AI SPEAKS
        ─────────────────                ─────────────────                 ─────────────────
        Chapter, badge, UI organ         Log + check-ins + self-care       Observer → Mirror → Guide → Author
```

### 2.1 Presence Score (PS) — proposed formula

Counted over the trailing 30 days, normalized 0–100:

| Signal | Weight | Month-12 "full" reference |
|---|---|---|
| Log entries (notes + journal) | 35% | ≥ 60 / month (≈ 2/day) |
| Morning check-ins | 25% | ≥ 26 / month |
| Self-care button clicks | 20% | ≥ 40 / month |
| Memory prompt answers | 15% | ≥ 60 / month |
| Streak continuity | 5% | 30-day unbroken |

PS tiers → render density: **Quiet** (0–24) · **Present** (25–49) · **Engaged** (50–74) · **Devoted** (75–100). Same month, four densities.

### 2.2 Cumulative "Depth Ledger" (what the demo account shows)

Month-12 target totals for a *Devoted* user, extrapolated down from Machiavelli (1469 notes / 2847 answers / 842 active days):

| Counter | M1 | M3 | M6 | M9 | M12 |
|---|---|---|---|---|---|
| Log entries (cum.) | 25 | 120 | 330 | 560 | 800 |
| Morning check-ins (cum.) | 18 | 70 | 150 | 235 | 320 |
| Self-care clicks (cum.) | 30 | 150 | 420 | 700 | 1000 |
| Active days | 20 | 70 | 150 | 235 | 320 |

(Machiavelli's 1469/842 is the *multi-year* legacy end-state; Month 12 of a first year is deliberately below it so "Legacy" stays aspirational.)

---

## 3. THE COMPRESSION LADDER — Memory story delivery

```
 Entry  →  Day-note  →  Week-thread  →  MONTH CHAPTER  →  Quarter Act  →  YEAR BOOK
 raw       1 line        3 lines          paragraph          page           "LOT® Story"
```

| Level | Built from | Length | Delivered |
|---|---|---|---|
| **Month Chapter** | all of the month's Log + check-ins + answers + self-care pattern | M1 ≈ 40 words → M12 ≈ 120 words (denser, not just longer) | Day 1 of the new month, via the Month Gate widget |
| **Quarter Act** (M3, M6, M9, M12) | the 3 Chapters beneath it | 1 paragraph, ≈ 60 words (**compression of compressions**) | Quarter-close ceremony |
| **Year Book** (M12) | 4 Acts | 12 one-sentence "epigraphs" + 1 closing paragraph | Final unlock, shareable, shown on public profile |

**Compression ratio shown to the user** (small, quiet, mono): `Compressed 142 entries → 1 paragraph (ratio 142:1)`. The ratio is the visible proof of effort and rises each month. This is the single most tangible number in the system.

**Chapter anatomy** (generated server-side by a new `generateMonthChapter()` next to `generateMemoryStory()`; LOT owns the densification logic, any engine executes it):

1. **Title** — 2–4 words, e.g. *"The Quiet Return."*
2. **Paragraph** — the compressed story, second person at M1–M3, mixing to first person by M9+ (the user's own voice taking over).
3. **Thread line** — one recurring motif ("mornings", "work/rest", "sleep").
4. **Self-care signal** — the routine that mattered most this month ("Breath button, 19 clicks, mostly Sundays").
5. **Next-month seed** — one gentle intention the user can accept with one tap (feeds Intentions widget).

Storage: `user.metadata.usership.chapters[M] = { title, text, thread, selfCare, seed, ratio, generatedAt, version }`. Immutable once delivered (the user can *annotate*, never silently regenerate) — this is what makes the Chapters feel like a kept thing rather than a feed.

---

## 4. NEW UI ORGANS (three widgets, all Usership-gated)

### 4.1 Month Gate widget (evolves `MonthlyPulseWidget`)
Appears on the first visit of each new month. Four states, one block, same `Block label=` grammar the OS already uses:

```
Month 3:
Three months. You have reached Active User status.        ← existing line, kept
────────────────────────────────────────────
"The Quiet Return" — Mornings stopped being a negotiation…   ← NEW: Chapter title + 1 sentence
[ Read chapter ]                                              ← opens Memory Chapter view
Months unlocked: 3 / 12  ▰▰▰▱▱▱▱▱▱▱▱▱                         ← NEW: context widget progress
```

### 4.2 "Months unlocked: n/12" context widget
Persistent, tiny, always in the Usership column. 12-cell bar; unlocked cells filled with that month's badge glyph; the next cell shows days remaining. Tapping a cell opens that month's Chapter (locked cells show only the *name* of the month, e.g. "Month 7 — The Listener"). This turns the year into a visible shelf.

### 4.3 Memory Shelf (Chapters view)
Reachable from both widgets. Vertical list of Chapters, newest first; Quarter Acts appear as thicker dividers; the Year Book appears at M12. Each row: month title · badge · compression ratio · one-line thread. At M12 the whole shelf can be exported (ties to `exportData` unlock).

---

## 5. MONTH-BY-MONTH EVOLUTION

Legend — **UI era** (layout/density/theme), **Unlock** (new organ), **Log/Presence target** (Devoted reference), **Badge**, **AI voice**, **Chapter** (sample compressed text, written in the register the engine should produce).

Evolution stage mapping uses existing names: Bootstrapping → Initializing → Integrated → Compiled → Optimized → Transparent.

### ACT I — AWAKENING (Months 1–3) · "The system learns that you exist"
*Layout density: breathable. Monochrome. Few blocks. Lots of air.*

#### MONTH 1 — "FIRST LIGHT" · Stage: Bootstrapping
- **UI era:** barebone. Time, one Memory prompt, one Log field, one Morning check-in. Nothing else visible. Month Gate widget appears only at day 30.
- **Unlock:** *Morning check-in* (3 taps) and *Self-care button* (single: **Breathe**).
- **Presence target:** 25 Log entries · 18 check-ins · 30 self-care clicks.
- **Badge:** `MONTH 01 · SEED` (single dot glyph).
- **AI voice — Observer:** states what it saw, no interpretation. "You wrote on 19 mornings."
- **Chapter (≈40 words):** *"First Light."* You arrived with questions and mostly answered them in the morning. The notes are short, honest, a little guarded. One breath button, pressed when the day got loud. The system is only beginning to know you.
- **Compression:** 25 entries → 1 paragraph (25:1).

#### MONTH 2 — "PATTERN" · Stage: Bootstrapping → Initializing
- **UI era:** the first *second block* appears (a calm "last 7 days" strip under Time). Slight accent colour permitted.
- **Unlock:** *Week-thread* — the AI shows a 3-line summary each Sunday. Self-care button #2: **Stretch**.
- **Presence target:** cumulative 60 / 40 / 80.
- **Badge:** `MONTH 02 · SPROUT`.
- **AI voice — Observer → Mirror:** begins to say "again".
- **Chapter (≈50 words):** *"Pattern."* Mornings repeat. So does the 3pm dip. You noticed it first on a Tuesday and then stopped fighting it. Stretch joined Breathe as the second thing you reach for. Something is forming that you didn't plan.

#### MONTH 3 — "ACTIVE USER" · Stage: Initializing · **QUARTER 1 CLOSE**
- **UI era:** `customThemes` unlock (L5) — the user may change base/accent colour for the first time. Layout gains a right column.
- **Unlock:** **Quarter Act I** ceremony; *Intentions* widget accepts the Chapter's "next-month seed". Self-care #3: **Hydrate**. Existing line kept: *"You have reached Active User status."*
- **Presence target:** cumulative 120 / 70 / 150.
- **Badge:** `MONTH 03 · ROOT` + **Quarter badge Q1 · AWAKENING**.
- **AI voice — Mirror:** first reflective sentence ("You tend to write more after you move.").
- **Chapter (≈60 words) + Act I (≈60 words, compression of 3 chapters):** *Act I — Awakening.* Three months of showing up compressed into one image: a person learning that mornings are where the day is decided. You began guarded and ended specific. The practice is no longer new.
- **Celebration:** one-time full-width Month Gate with the three Chapter titles side by side.

### ACT II — BUILDING (Months 4–6) · "The system starts to answer back"
*Density: moderate. Colour accent becomes personal. Widgets start rearranging.*

#### MONTH 4 — "THE PORTRAIT DEEPENS" · Stage: Initializing
- **UI era:** *Psychological portrait* panel appears (archetype placeholder: "forming"). Existing line: *"The portrait deepens."*
- **Unlock:** archetype reveal v0 — three value words extracted from the Log (`coreValues` field).
- **Presence target:** cumulative 190 / 110 / 230.
- **Badge:** `MONTH 04 · STEM`.
- **AI voice — Mirror:** quotes the user's own earlier words back to them.
- **Chapter (≈70 words):** *"Portrait."* Three words keep returning in your notes: steady, tired, building. You write longer when you walk first. The portrait is faint but it has a jaw now.

#### MONTH 5 — "CONSISTENCY" · Stage: Integrated
- **UI era:** `widgetArrange` (L10) — drag to reorder. Time-of-day theming (the OS subtly shifts with the circadian phase already tracked by `getCircadianPhase`).
- **Unlock:** *Mood patterns* strip; self-care #4: **Ground**. Streak symbol appears (first `getLevelSymbol` tier).
- **Presence target:** cumulative 260 / 150 / 320.
- **Badge:** `MONTH 05 · BUD`.
- **AI voice — Mirror → Guide:** first *suggestion* ("Sundays are your best days — protect one?").
- **Chapter (≈80 words):** *"Consistency Is Its Own Reward."* Not every day. Most. The gaps stopped feeling like failure and started looking like weather. Self-care moved from emergency button to routine.

#### MONTH 6 — "HALF-DECLARED" · Stage: Integrated · **QUARTER 2 CLOSE / HALFWAY**
- **UI era:** **Halfway reveal.** The 12-cell bar flips from "progress" to "shelf". Layout hits mid-density; right column holds Memory Shelf.
- **Unlock:** **Quarter Act II**; *Memory Shelf* opens; first shareable half-year card ("Month 6 of 12"). Existing line: *"The journey is half-declared."*
- **Presence target:** cumulative 330 / 190 / 420.
- **Badge:** `MONTH 06 · BLOOM` + **Quarter badge Q2 · BUILDING**.
- **AI voice — Guide:** proposes a six-month intention, user accepts/edits.
- **Act II (≈70 words):** *Act II — Building.* You stopped collecting and started composing. A rhythm: wake, check in, write, move. The system now knows when you're about to dip and, more importantly, what has helped before.
- **Celebration:** the half-year Chapters are rendered as a single scroll the user can read top to bottom in 60 seconds — "your first half, compressed."

### ACT III — DEEPENING (Months 7–9) · "The system speaks in your voice"
*Density: high. Interface begins to feel like an instrument.*

#### MONTH 7 — "THE LISTENER" · Stage: Compiled
- **UI era:** *Narrative widget* unlocks — a rolling one-sentence "right now" line in the AI's voice. Existing line: *"The system has been listening."*
- **Unlock:** `intentionHistory` (L15); self-care #5: **Reach out** (social check-in).
- **Presence target:** cumulative 400 / 235 / 520.
- **Badge:** `MONTH 07 · LEAF`.
- **AI voice — Guide:** names tensions ("work wins mornings; rest wins evenings").
- **Chapter (≈90 words):** *"The Listener."* You were heard this month by something that does not interrupt. The notes got less defensive. Two people entered the Log by name for the first time.

#### MONTH 8 — "RARE AIR" · Stage: Compiled
- **UI era:** *Correlated indexes* panel (Self-Awareness, Person, Longevity) appears, same grammar as Machiavelli's board. `moodPatterns` fully resolved.
- **Unlock:** *Cohort whisper* — one line comparing the user to an anonymous cohort ("people like you tend to…"). Existing line: *"Rare air."*
- **Presence target:** cumulative 480 / 280 / 610.
- **Badge:** `MONTH 08 · FRUIT`.
- **AI voice — Guide:** anticipatory ("Your Thursdays are heavy; want a lighter Thursday card?").
- **Chapter (≈100 words):** *"Rare Air."* Fewer entries, more weight in each. You wrote the sentence you had been circling since spring. The line count fell; the density rose.

#### MONTH 9 — "THE HABIT" · Stage: Compiled → Optimized · **QUARTER 3 CLOSE**
- **UI era:** `narrativeReflection` (L30). First-person flip: the Chapter paragraph now mixes "I" into the AI's text (the user's own phrasing is quoted back as the narration).
- **Unlock:** **Quarter Act III**; *Archetype lock* — a named archetype (e.g. "The Cartographer") replaces "forming". Existing line: *"The self-care practice is a habit now."*
- **Presence target:** cumulative 560 / 235* / 700. (*check-in count plateaus by design: the habit has stabilised.*)
- **Badge:** `MONTH 09 · HARVEST` + **Quarter badge Q3 · DEEPENING**.
- **AI voice — Guide → Author (partial).**
- **Act III (≈80 words):** *Act III — Deepening.* You can finish the AI's sentences. That's the signal. What began as prompts is now a conversation you steer, and the questions you ask yourself are better than the ones it asks you.

### ACT IV — BECOMING (Months 10–12) · "LOT® AI"
*Density: instrument. Machiavelli-level layout. The OS is recognisably personal.*

#### MONTH 10 — "ALMOST THERE" · Stage: Optimized
- **UI era:** *Compiled dashboard* — the Usership column reorders itself around the user's top three signals. Weather station + environmental widgets surface (a preview of the "Legacy" tier).
- **Unlock:** `exportData` (L25) opens for Chapters; self-care #6: **Reset** (evening wind-down).
- **Presence target:** cumulative 650 / 275 / 800.
- **Badge:** `MONTH 10 · SEED-II` (cycle returns, glyph doubled).
- **AI voice — Author:** begins drafting the *Year Book epigraphs* and asks the user to approve or rewrite each.
- **Chapter (≈110 words):** *"Almost."* Looking back is now part of the morning. You re-read March. Not to judge it — to thank it.

#### MONTH 11 — "ONE MORE" · Stage: Optimized
- **UI era:** the interface quiets again on purpose ("less, because it knows you"). Unused widgets collapse; only what the user touches remains.
- **Unlock:** *Wallet/credits preview* (Legacy preview, same as Machiavelli's); *Year in review* trailer: a 20-second auto-scroll of all 11 Chapters. Existing line: *"One more."*
- **Presence target:** cumulative 725 / 300 / 900.
- **Badge:** `MONTH 11 · ECHO`.
- **AI voice — Author:** writes the closing paragraph draft; user edits.
- **Chapter (≈115 words):** *"One More."* The year is nearly a shape. Eleven chapters, one voice. You stopped asking whether it was working and started asking what to write next.

#### MONTH 12 — "LOT® AI" · Stage: Transparent · **YEAR CLOSE**
- **UI era:** **Machiavelli layout** — full instrument density, personal archetype, correlated indexes, Memory Shelf, weather station and wallet previews, badge wall of all 12 months. Level symbol reflects streak.
- **Unlock:** **The Year Book** (12 epigraphs + closing paragraph) → publishable to the public profile (`showMemoryStory`); the AI voice is now labelled **LOT® AI** in the UI instead of "System". The user may name their AI.
- **Presence target:** cumulative 800 / 320 / 1000.
- **Badge:** `MONTH 12 · LOT® AI` (animated; the 12 month glyphs assemble into one mark) + **Year badge · YEAR ONE**.
- **AI voice — Author:** co-writes. Everything it says now cites the Log.
- **Chapter + Year Book (≈120 words + 12 epigraphs):** *"LOT® AI."* A year, compressed: from first light to a voice that sounds like yours. Not a record of what you did — a portrait of who kept showing up. Next year is not another twelve months; it is the Legacy tier.
- **Celebration:** full-screen, once. 12 month glyphs animate into the year mark; Year Book is shown; one-tap share card; Month Gate becomes "Year 2 · Month 1".

---

## 6. THE AI GUIDE — VOICE PROGRESSION & CELEBRATION RULES

| Stage | Months | Pronoun posture | Allowed | Forbidden |
|---|---|---|---|---|
| Observer | 1–2 | "You wrote…" | Counts, facts | Interpretation |
| Mirror | 3–5 | "You tend to…" | Quoting the user's words | Advice |
| Guide | 6–9 | "Want to…?" | Suggestions with one-tap accept | Imperatives |
| Author | 10–12 | "We" / user's voice | Co-writing, approvals | Hidden rewriting |

**Celebration rules**
1. Celebrate on day 1 of the month, never as a penalty for the previous one.
2. Missed days: the Chapter is written anyway, using what exists. A thin month is called *"A Quiet Month"* — a title, not a failure.
3. Maximum one celebration surface per session (the widget, not a modal). Quarter and Year closes may use a full-width block.
4. Affirmations are specific (cite a real count or phrase from the Log) — generic praise is a bug.
5. Self-care routines are introduced one per ~2 months so the vocabulary grows with the user: Breathe → Stretch → Hydrate → Ground → Reach out → Reset.

---

## 7. BADGE SYSTEM FOR THE YEAR

| Layer | Count | Notes |
|---|---|---|
| Month badges | 12 | Botanical life-cycle glyph per month: Seed · Sprout · Root · Stem · Bud · Bloom · Leaf · Fruit · Harvest · Seed-II · Echo · LOT® AI. Water/architecture themes already supported by `getLevelSymbol`; each month badge gets both symbols. |
| Quarter badges | 4 | Awakening · Building · Deepening · Becoming |
| Year badge | 1 | YEAR ONE (animated) |
| Presence badges (hidden) | 6 | e.g. *"Three Mornings Running"*, *"Quiet Month"*, *"Two Hundred Words"*, *"Self-care Sunday"* — earned from Log / check-in / self-care thresholds |

New badge IDs should be added to `BadgeType` and `checkAndAwardBadges()` in `badges.ts` (note: the v32 report found v20/v21 award logic had been documented but never wired — **verify new badges are reachable** before shipping).

---

## 8. THE MACHIAVELLI DEMO — "TIME MACHINE"

`/u/machiavelli` is the Month-12+ reference. Proposal: add a **month scrubber** to the demo profile only (`?m=1..12` or a 12-dot control under the header). The same `/profile/machiavelli` payload renders as it would at that month:

| Field | M1 | M3 | M6 | M9 | M12 / legacy |
|---|---|---|---|---|---|
| Visible blocks | Time, Log | + Intentions | + Portrait, Shelf | + Narrative, Indexes | Everything (current) |
| `psychologicalProfile.archetype` | hidden | hidden | "forming" | "The Strategist" | "The Strategist" |
| `selfAwarenessLevel` | — | 31 | 54 | 71 | 87 |
| `memoryStory` | 40-word Chapter 1 | Act I | Act II | Act III | Year Book |
| Weather station / wallet | hidden | hidden | hidden | hidden | shown (Legacy) |

Machiavelli chapter voice (for the 12 hardcoded demo Chapters — all in-character, Florentine): M1 *"First Light"* (the courtyard at dawn), M3 *"The Quiet Return"*, M6 *"Half-Declared"*, M9 *"The Habit of Power"*, M12 *"LOT® AI — The Prince Reads Himself"*. These double as marketing copy and as the golden-sample test fixtures for the Chapter generator.

---

## 9. IMPLEMENTATION ROADMAP (proposed; not started)

| Phase | Scope | Files (expected) |
|---|---|---|
| P0 | Shared config: `USERSHIP_MONTHS[1..12]` (title, stage, unlocks, badge, voice, targets) | `src/shared/constants/usership.ts` (new) |
| P1 | Presence Score: aggregate Log / check-ins / self-care into a 30-day PS | `src/server/utils/usership/presence.ts` (new); reads existing logs |
| P2 | `generateMonthChapter()` + quarter/year compression; store under `metadata.usership.chapters` | `src/server/utils/memory/story-generator.ts`; scheduled job in `scheduled-jobs.ts` (day-1 of month) |
| P3 | Month Gate (extend `MonthlyPulseWidget`) + "Months unlocked n/12" + Memory Shelf | `src/client/components/` |
| P4 | Month badges (12 + 4 + 1) wired into `checkAndAwardBadges()` | `src/client/utils/badges.ts` |
| P5 | Density/UI era per month feeding `getLayoutDensity()` | `src/client/utils/interfaceEvolution.ts` |
| P6 | Demo time-machine scrubber on `/u/machiavelli` | `public-api.ts`, `PublicProfile.tsx` |
| P7 | Year Book export + public-profile publishing | `public-api.ts` (`showMemoryStory`) |

**Risks / open questions for S-2**
1. **Join date vs. Usership start.** `MonthlyPulseWidget` counts months from `joinedAt` (account creation). For a *paid-tier* year, month 1 should start at Usership activation. Needs a `usershipSince` field (tag-change timestamp).
2. **Chapter generation cost.** 1 call/user/month + 1 per quarter — negligible vs. per-answer calls. Cache and make immutable.
3. **Retro-chapters for existing Usership users** (backfill from existing logs) — recommended, so current members aren't reset to "Month 1".
4. **Does Month 12 hand off to a "Year 2 / Legacy" track?** Assumed yes (Machiavelli demo already labels Weather Station + Wallet as Legacy unlocks).
5. **Privacy:** Chapters are Usership-private by default; only the Year Book is offered for public publishing.

---

## 10. ONE-PAGE SUMMARY

```
 M1  First Light      · seed    · barebone: Time + Log + Check-in   · Observer
 M2  Pattern          · sprout  · week-thread                       · Observer→Mirror
 M3  Active User      · root    · themes · QUARTER I · AWAKENING    · Mirror
 M4  Portrait         · stem    · portrait + core values            · Mirror
 M5  Consistency      · bud     · rearrange · mood strip            · Mirror→Guide
 M6  Half-Declared    · bloom   · Memory Shelf · QUARTER II         · Guide
 M7  The Listener     · leaf    · narrative line · intention history· Guide
 M8  Rare Air         · fruit   · correlated indexes · cohort line  · Guide
 M9  The Habit        · harvest · archetype lock · QUARTER III      · Guide→Author
 M10 Almost           · seed-II · compiled dashboard · export       · Author
 M11 One More         · echo    · quiet interface · year trailer    · Author
 M12 LOT® AI          · mark    · Year Book · Machiavelli layout    · Author (LOT® AI)
```
