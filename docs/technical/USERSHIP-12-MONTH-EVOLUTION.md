<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP — 12-MONTH EVOLUTION → LOT® AI

**Document:** USERSHIP-12-MONTH-EVOLUTION  
**Class:** RESTRICTED // S-2 EYES  
**S-2:** VADIK MARMELADOV  
**Date:** 2026-10-13  
**Status:** DESIGN / BRAINSTORM — nothing in this document is shipped unless marked `EXISTS`  
**Focus (per S-2):** tangibility of the compressed Memory story, month by month

---

## 0. READ THIS FIRST

### 0.1 What was scanned (framework step 1–2)

| Source | What it gave this design |
|---|---|
| `src/client/components/MonthlyPulseWidget.tsx` | `EXISTS`: Usership-only card, `Month N/12`, one line per month, dismiss phrases. Month = `dayjs().diff(joinedAt,'month')`. **This is the seed of everything below.** |
| `src/server/utils/memory/story-generator.ts` | `EXISTS`: `generateMemoryStory()` (answers only, last 30, Together AI, local fallback). **Does not yet read journal notes, check-ins, or self-care events.** |
| `src/client/utils/interfaceEvolution.ts`, `stores/evolution.ts` | `EXISTS`: 7-dim evolution state, `featureUnlockLevel` 0–5, 5 layout densities `breathable → instrument`, 14 feature-unlock flags. |
| `docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md`, `docs/assembly/2026-06-30_…compression-loop.md` | Log events feeding Memory: `answer`, `note`, `emotional_checkin`, `plan_set`, `self_care_complete`, `self_care_skip`, `quantum_intent_signal`. |
| `docs/badges/*` (Codex v32, 812 badges) | Badge tiers, Water / Architecture themes, progression style. |
| `docs/technical/LOT-STYLE-GUIDE.md` | No decorative colour, no emoji, opacity hierarchy 90/60/40, `gap-y-24` sections. **All UI below obeys it.** |
| `docs/benchmark/LOT-SYSTEM-OUTLINE.md`, Manifest, Doctrine | Evolution Gates, IntegrityWidget, Density Patterns already built/READY — reused, not reinvented. |
| `UserTag.Usership`; `memoryEngine: 'ai'` only for Usership | Paid tier is already the AI-memory tier. |

### 0.2 Honest limits

- **`lot-systems.com/u/machiavelli` could not be fetched** from this session (proxy returned no response). §9 therefore specifies the demo account as a *target fixture*, not as an observation of the live page. Every "Machiavelli" text sample in this document is **illustrative copy**, not live data.
- Word-count and compression numbers below are **targets**, not measurements.
- No production code was changed in this session.

---

## 1. THE STORY IN ONE SCREEN

```
 MONTH  1      2      3      4      5      6      7      8      9      10     11     12
 UI     ░░░░   ░░░░   ▒▒▒▒   ▒▒▒▒   ▒▒▒▒   ▓▓▓▓   ▓▓▓▓   ▓▓▓▓   ████   ████   ████   ████
 AI     WATCH  ASK    NOTICE NAME   TIME   LETTER ECHO   CHALL. HABIT  FORE.  CURATE AUTHOR
 MEM    Page   Ch.I   Ch.II  ◆Vol.1 Ch.IV  Ch.V   ◆Vol.2 …     …     ◆Vol.3 Ch.XI  ◆BOOK
        (wk)   ──────────────────────────────────────────────────────────────────────────▶
                  every month = 1 Chapter (a paragraph)  ·  every 3rd = 1 Volume  ·  12th = the Book
```

One sentence: **a barebone terminal on day one becomes, by month 12, an instrument that writes the user's own book back to them — one paragraph a month — and the interface itself is the proof of how long they have been there.**

### Design principles

1. **One new thing per month.** Never two. The user can always name what changed.
2. **The paragraph is the product.** Everything (check-ins, logs, self-care taps) exists to make next month's paragraph truer.
3. **Receipts, not flattery.** Every Chapter carries an evidence line (counts of what it was built from). The AI may be warm; it may not be vague.
4. **No shame mechanics.** A quiet month still gets a Chapter — shorter, honest ("a quiet month"), never a broken-streak scold.
5. **The interface is a ledger of time.** Density, vocabulary, and widgets visibly deepen. Going back to month 1 would feel like going back to a barebone terminal — that is the retention mechanism, and it is earned, not nagged.
6. **Compression is the ceremony.** Raw → week → chapter → volume → book. The user watches their year get *smaller and truer*.

---

## 2. INPUTS — WHAT "EVOLUTION" IS MEASURED FROM

S-2 flagged: **Log entries/thoughts, morning check-ins, self-care button clicks.** Mapped to existing events:

| Signal | Log event | Weight (Presence Units, PU) | Daily cap |
|---|---|---|---|
| Journal entry / thought in LOG | `note` | 3 (+2 if ≥150 words) | none (it is the point) |
| Morning check-in | `emotional_checkin` (before 12:00 local) | 2 (+1 if "morning") | 1 counted |
| Self-care button | `self_care_complete` | 1 | 5 |
| Memory answer | `answer` | 2 | 3 |
| Plan / intention set | `plan_set` | 1 | 1 |

`self_care_skip` is **recorded but weighs 0** (no penalty).

```
PU(month)  = Σ capped weights over the month
SEAL TIER  = SEED  (< 40 PU)   "a quiet month"
             BLOOM (40–139)    "a full month"
             FULL  (≥ 140)     "a dense month"
```
(Thresholds are starting guesses — calibrate against the first 20 real Usership cohorts.)

### 2.1 Two clocks (important)

| Clock | Rule | Drives |
|---|---|---|
| **Calendar clock** | `monthsSinceJoin = floor(now − joinedAt)` — `EXISTS` in MonthlyPulseWidget | **Unlock** of the month (UI stage, badge slot, Chapter delivery) |
| **Presence clock** | PU in that month → Seal tier | **Quality** of the month (Chapter length/depth, badge tier I/II/III, density accelerator) |

So time can never be skipped, and presence can never be faked by logging in once — but nobody is locked out for being human. *Months Unlocked: 3/12* is calendar; the seal on each tile is presence.

---

## 3. MASTER TABLE — 12 MONTHS AT A GLANCE

`Density` uses the existing 5 levels. `Floor` = Usership minimum; the existing evolution engine may push a user *above* the floor, never below.

| # | Codename | Density floor | New on the System tab | LOT® AI voice | Memory artifact delivered | Badge (new slot) |
|---|---|---|---|---|---|---|
| 1 | **SIGNAL** | breathable | Time, Check-in, Log, **1** self-care button, *Months Unlocked 1/12* | Silent observer. One line/day, no questions | **First Page** (day 7) + **Chapter I** | `M01 FIRST LIGHT` |
| 2 | **ROUTINE** | breathable | Morning check-in becomes first card; Planner appears | Asks its first Memory question | **Chapter II** | `M02 TWO-WEEK PULSE` → `M02 ROUTINE` |
| 3 | **PATTERN** | comfortable | Mood trail (30-day), self-care suggestions adapt | Notices ("you log most on Tuesdays") | **Chapter III + Volume I "Season One"** | `M03 ACTIVE USER` + `Q1 SEAL` |
| 4 | **PORTRAIT** | comfortable | **Memory Story widget** (living portrait) | Uses your name; first-person plural ("we") | **Chapter IV** | `M04 PORTRAIT` |
| 5 | **RHYTHM** | compact | Circadian strip; self-care timing | Suggests *when*, not just *what* | **Chapter V** | `M05 RHYTHM` |
| 6 | **HALFWAY** | compact | **Half-Year Letter** page; Echo shelf opens | Writes a letter to you | **Chapter VI + Volume II "Half-Year Letter"** | `M06 HALF-DECLARED` + `H1 SEAL` |
| 7 | **ECHO** | compact | **Echo widget**: "Six months ago today you wrote…" | Quotes you back, with date | **Chapter VII** | `M07 LISTENER` |
| 8 | **RARE AIR** | dense | Integrity / contradiction view (IntegrityWidget) | Gently challenges: says-vs-does | **Chapter VIII** | `M08 RARE AIR` |
| 9 | **HABIT** | dense | **Routine Builder**: user names own self-care routines | Coaches a routine, then steps back | **Chapter IX + Volume III "Habit"** | `M09 HABIT LOCK` + `Q3 SEAL` |
| 10 | **FORECAST** | dense | **Forecast strip**: next-7-day pattern expectation | Predicts, proposes 1 experiment/week | **Chapter X** | `M10 FORECAST` |
| 11 | **EDIT** | instrument | **Curate**: pick which memories enter the Book | Becomes editor, asks permission | **Chapter XI** | `M11 EDITOR` |
| 12 | **BOOK** | instrument | **Year Book** (read, export, print); anniversary state | Full LOT® AI — authors the year, then asks "next?" | **Chapter XII + Volume IV + THE BOOK + 12-word epitaph** | `M12 ONE YEAR` + `Y1 SEAL` |

---

## 4. THE COMPRESSION LADDER (the core deliverable)

```
RAW            every log, check-in, self-care tap, answer           (hundreds/month)
  │  nightly, internal, never shown
  ▼
WEEK DIGEST    ≤ 60 words, structured facts + 1 observation         (4/month, hidden fuel)
  │  last day of Usership-month, 09:00 local
  ▼
CHAPTER        ONE PARAGRAPH, 90–130 words, + evidence line         (12/year)   ◀ the monthly gift
  │  every 3rd month
  ▼
VOLUME         ONE PARAGRAPH, 110–150 words (3 Chapters → 1)        (4/year)    ◀ quarter/half ceremonies
  │  month 12
  ▼
THE BOOK       12 Chapters + 4 Volumes + "The Year in one paragraph"
               (≤ 200 words) + EPITAPH (exactly 12 words)           (1)         ◀ the 12-month payoff
```

**Target compression** (to be measured, not claimed): ~800 raw items/month → ~110 words/chapter; 12 chapters → 1 ≤200-word year. Qualitative note: each level is *shorter and more specific* — compression must keep named, dated specifics (a person, a ritual, a date) and drop adjectives.

### 4.1 Chapter anatomy (what the user actually sees)

```
┌ CHAPTER IV — PORTRAIT ─────────────────────────────  Month 4 / 12 ┐
│                                                                   │
│  <one paragraph, 90–130 words, second person, present/past mix>   │
│                                                                   │
│  ── evidence ──────────────────────────────────────────────────── │
│  41 log entries · 27 morning check-ins · 63 self-care · 9 answers │
│  dense month ▓▓▓▓▓▓▓▓░░  (BLOOM→FULL)                            │
│                                                                   │
│  [ KEEP ]   [ CORRECT ]   [ SHARE ]                               │
└───────────────────────────────────────────────────────────────────┘
```

- **KEEP** → chapter is admitted to the Book (default on; matters in Month 11).
- **CORRECT** → user taps *"not quite"* + one-line fix; the correction becomes a `chapter_feedback` log that is fed back into the next prompt. (The user co-authors; this is the Virtuous Cycle applied to the story.)
- **SHARE** → opt-in only; renders on `/u/<username>` if profile public.

### 4.2 Chapter data model (proposal)

```ts
// src/shared/types — NEW (proposal)
type SealTier = 'seed' | 'bloom' | 'full'

interface MemoryChapter {
  id: string
  userId: string
  monthIndex: number          // 1..12  (calendar clock)
  kind: 'chapter' | 'volume' | 'book'
  title: string               // "PORTRAIT"
  body: string                // the paragraph
  epitaph?: string            // book only, exactly 12 words
  evidence: { notes: number; checkins: number; selfCare: number;
              answers: number; plans: number; pu: number }
  sealTier: SealTier          // presence clock
  sourceLogIds: string[]      // traceability ("receipts")
  generatedBy: 'ai' | 'local' // honest fallback marker
  userState: 'kept' | 'corrected' | 'dropped'
  correction?: string
  createdAt: string
}
```
Storage: `users.metadata.memoryChapters[]` is the lowest-risk start (no migration); promote to a table if the Book export needs queries.

### 4.3 Generation pipeline (maps to existing code)

```
scheduled-jobs.ts  ──(daily 09:00 local; fires on usership-month boundary)──▶
  buildMonthlyDigest(user)              reads logs: note, emotional_checkin,
                                         self_care_complete, answer, plan_set
  generateChapter(user, digest)         NEW, sibling of generateMemoryStory()
        │                                prompt = digest + prior 2 chapters
        │                                        + user corrections + month codename
        ├─ Together AI primary (same as story-generator)
        └─ composeLocalChapter()         deterministic fallback (poetic, honest)
  save MemoryChapter → SSE 'chapter_ready' → MonthlySealWidget fires
```

Prompt skeleton (engine-independent, stays on LOT's side like the existing densification prompt):

```
You are LOT® AI writing Chapter {n} "{codename}" of {firstName}'s year.
FACTS (only use these): {digest}
PRIOR CHAPTERS: {last two bodies}
USER CORRECTIONS: {corrections}
Write ONE paragraph, {90–130} words, second person.
Rules: name at least two dated or concrete specifics. No adjectives of praise
without a fact attached. If PU < 40, say it was a quiet month, plainly.
Never invent events. End on one forward-looking clause, not advice.
```

### 4.4 Gap to close in current code

`generateMemoryStory()` only reads `answer` logs. For chapters it must also read `note` (journal), `emotional_checkin`, `self_care_complete`, `plan_set` — the compression-loop doc already shows `formatLog` handling for `plan_set` and `emotional_checkin`; `note` is handled; `self_care_complete` is not. **Add it to `formatLog` first** (one-line, high value).

---

## 5. MONTH-BY-MONTH CARDS

Format per card: **UI delta → AI delta → Ritual → Chapter (sample copy) → Badge.**

### MONTH 1 — SIGNAL  *(density: breathable)*
- **UI:** barebone. Time · Emotional Check-in · Log · **one** self-care button. Everything else is a dark, labelled-but-locked row: `MEMORY ░ month 2`, `PORTRAIT ░ month 4` — **the roadmap is visible on day one**. Context widget **Months Unlocked 1/12** with 12 tiles, 11 hollow.
- **AI:** silent. One line per day under Check-in ("Day 4. Three mornings logged.").
- **Ritual:** *Day 7 — First Page.* A 40-word mini-chapter unlocks (the first taste of compression).
- **Chapter I (sample):** "You arrived on a Tuesday and checked in four mornings out of seven — mostly 'tired, hopeful'. You wrote three thoughts; the longest, on the 9th, was about leaving things unfinished. Tea came before everything else. The system is beginning to know you."
- **Badge:** `M01 FIRST LIGHT` — I/II/III by Seal.

### MONTH 2 — ROUTINE  *(breathable)*
- **UI:** Check-in card moves to top (morning first). **Planner** appears. First Memory question card.
- **AI:** asks its first question; 3–4 tap options. Never chats.
- **Ritual:** *Day 14 pulse* — "Two weeks of mornings" toast (existing EvolutionMilestoneToast).
- **Chapter II:** names the actual routine (time of day the user is most present).
- **Badge:** `M02 ROUTINE`.

### MONTH 3 — PATTERN  *(comfortable)*  — **first Volume**
- **UI:** 30-day mood trail; self-care suggestions reorder by what the user actually taps. MonthlyPulse line "Three months. You have reached Active User status." (`EXISTS`).
- **AI:** first *noticing* ("You log more on Tuesdays; check-ins are brighter after a walk").
- **Ritual:** **Q1 Seal ceremony** — full-screen, 3 tiles fill, Volume I "Season One" (3 chapters → 1 paragraph) fades in line by line (reuse 1400 ms fade).
- **Badge:** `M03 ACTIVE USER` + `Q1 SEAL`.

### MONTH 4 — PORTRAIT  *(comfortable)*
- **UI:** **Memory Story widget** — living portrait paragraph (the improved `generateMemoryStory`, now fed by all five signal types), with last-updated stamp.
- **AI:** begins using the user's name; plural voice ("we've noticed").
- **Chapter IV:** first chapter that *contradicts or refines* an earlier one ("In month two you said mornings were hard. By now they are the only part of the day you protect.").
- **Badge:** `M04 PORTRAIT`.

### MONTH 5 — RHYTHM  *(compact)*
- **UI:** circadian strip (when you check in, log, self-care across a week). Spacing tightens one step.
- **AI:** timing nudges: "Your best self-care window is 07:40–08:10."
- **Badge:** `M05 RHYTHM`.

### MONTH 6 — HALFWAY  *(compact)*  — **Half-Year Letter**
- **UI:** new page **LETTER** — Volume II rendered as a letter on a plain page, signed `— LOT® AI`. **Echo shelf** (locked tile) glows: "opens month 7".
- **Ritual:** **H1 Seal** — 6/12 tiles filled; a single sentence of the user's *own* words from month 1 is shown beside today's — the "then / now".
- **Chapter VI / Volume II:** includes one measured change ("mornings logged: 11 → 24 per month").
- **Badge:** `M06 HALF-DECLARED` + `H1 SEAL`.

### MONTH 7 — ECHO  *(compact)*
- **UI:** **Echo widget** — "6 months ago today you wrote: '…'" (verbatim, dated). Only shown when a ≥15-word entry exists for that date ±3 days.
- **AI:** quotes rather than paraphrases. Trust move: the machine proves it remembers.
- **Badge:** `M07 LISTENER`.

### MONTH 8 — RARE AIR  *(dense)*
- **UI:** Integrity / contradiction view (IntegrityWidget `READY` in Manifest). Opt-in toggle.
- **AI:** says-vs-does, framed as invitation ("You say sleep matters; 9 of 12 late nights were work."). Tone gate: only when Seal ≥ BLOOM.
- **Badge:** `M08 RARE AIR`.

### MONTH 9 — HABIT  *(dense)*  — **Q3 Volume**
- **UI:** **Routine Builder** — user names 1–3 self-care routines (e.g., "Evening unplug"); self-care buttons become *their* buttons. MonthlyPulse: "Nine months. The self-care practice is a habit now." (`EXISTS`).
- **AI:** helps build, then steps back (fewer prompts = a feature).
- **Badge:** `M09 HABIT LOCK` + `Q3 SEAL`.

### MONTH 10 — FORECAST  *(dense)*
- **UI:** **Forecast strip** (next 7 days: expected energy / best window / risk day) from QIE patterns.
- **AI:** proposes one **weekly experiment**; result is written into next Chapter.
- **Badge:** `M10 FORECAST`.

### MONTH 11 — EDIT  *(instrument)*
- **UI:** **Curate**: the 10 prior chapters in a list — KEEP / CORRECT / DROP; drag to reorder; pick one memory per month as the "headline".
- **AI:** becomes editor and asks permission; no new claims this month, only refinement.
- **Badge:** `M11 EDITOR`.

### MONTH 12 — BOOK  *(instrument)*
- **UI:** **Year Book** — 12 chapters, 4 volumes, "The Year in one paragraph", 12-word epitaph; export (PDF, print-ready), optional share to `/u/<username>`. System tab shows anniversary state: all 12 tiles filled, `LOT® AI` wordmark replaces the plain header.
- **AI:** full LOT® AI. Closes with: "Year two? Choose what I should watch."
- **Epitaph (sample):** "Protects mornings, writes at night, leaves things unfinished, still finishes what matters." *(exactly 12 words)*
- **Badge:** `M12 ONE YEAR` + `Y1 SEAL`.

> Badge naming: 12 monthly + Q1/H1/Q3/Y1 seals = **16 new badge slots**. Codex v32 sits at 812; assign IDs from the next free range and check for token collisions with `docs/badges/*` before implementation.

---

## 6. WIDGET SPECS (new / extended)

### 6.1 MONTHS UNLOCKED (context widget) — `EXTEND` MonthlyPulseWidget
```
MONTHS UNLOCKED  3 / 12
■ ■ ■ □ □ □ □ □ □ □ □ □
 Q1 sealed            next: PORTRAIT — 17 days
```
Tile glyph = Seal tier (`▫` seed, `▪` bloom, `■` full). Hover → that month's Chapter title. Shown at all times for Usership; collapses to a single line in `instrument` density.

### 6.2 MONTH SEAL (celebration card) — `EXTEND` MonthlyPulse
Fires on the usership-month boundary. Sequence (≈9 s, skippable):
1. `Month 4 unlocked.` (fade 1400 ms)
2. Affirmation (1 line, evidence-bound, from §7).
3. Chapter paragraph, line by line.
4. Badge reveal.
5. Dismiss phrase (existing pool: *Onward. / Noted. / The system remembers.*).

### 6.3 MEMORY RECALL — new
Paragraph-long insight from *last* month pinned atop the System tab for the first 7 days of the new month, then retires into the Book shelf. (This is S-2's "Memory widget displays a paragraph-long insight".)

### 6.4 SELF-CARE GUIDE — extend `SelfCareMoments`
Month-gated behaviour: M1 one button → M3 reorder by usage → M5 timing → M9 user-named routines → M10 weekly experiment.

### 6.5 THE SHELF — new page `/shelf` (Usership)
All Chapters/Volumes, Seal tiles, badges, Book. The permanent "what I built here" view.

---

## 7. AFFIRMATIONS — EVIDENCE-BOUND, NOT GENERIC

Template: `{fact} — {meaning, ≤12 words}.` Examples:
- "Twenty-four mornings this month. You are someone who shows up early."
- "You wrote on four of the five hardest days. That counts."
- Quiet month (SEED): "A quiet month. The record still holds you."

Rule: no affirmation without a number or a quote beside it.

---

## 8. LOT® AI — VOICE LADDER

| Months | Stage | Rule |
|---|---|---|
| 1 | WATCH | Never asks. States counts only. |
| 2–3 | ASK / NOTICE | Questions are tap-options; observations ≤1 sentence. |
| 4–5 | NAME / TIME | Uses name; suggests timing. |
| 6–7 | LETTER / ECHO | Long-form once; thereafter quotes the user. |
| 8–10 | CHALLENGE / HABIT / FORECAST | Allowed to disagree; must cite evidence; steps back after coaching. |
| 11–12 | CURATE / AUTHOR | Asks permission to change the story; authors the Book. |

Constant across all months: the AI is an **analyst reading the user's own record** (Doctrine: *Operator RFI Pattern*), never a chatbot persona; `generatedBy:'local'` is surfaced honestly when the fallback wrote the text.

---

## 9. DEMO ACCOUNT — `/u/machiavelli` AS THE MONTH-12 SPECIMEN

Status: **target fixture** (live page unreachable from this session).

### 9.1 Seed targets (illustrative; calibrate to the real account)

| Month | Notes (LOG) | Morning check-ins | Self-care taps | Answers | Seal |
|---|---|---|---|---|---|
| 1 | 6 | 12 | 20 | 4 | SEED |
| 2 | 10 | 20 | 38 | 8 | BLOOM |
| 3 | 14 | 24 | 55 | 10 | BLOOM |
| 4 | 18 | 26 | 70 | 12 | BLOOM |
| 5 | 20 | 26 | 78 | 12 | FULL |
| 6 | 22 | 27 | 85 | 14 | FULL |
| 7–9 | 24 | 27 | 90 | 14 | FULL |
| 10–12 | 26 | 28 | 95 | 14 | FULL |

Totals ≈ 250 notes · 310 check-ins · 900 self-care · 140 answers. The ramp is the point: the curve *is* the evolution.

### 9.2 Time-travel preview (the demo feature)
`/u/machiavelli?month=N` (N=1..12, demo account only) renders the profile **as it looked at month N**: density, unlocked widgets, badge shelf, Chapters ≤ N. A scrubber (`1 ─●──────── 12`) lets a visitor drag through the year. This makes the evolution tangible to a prospect in 20 seconds. Needs: server flag `isDemo`, client `previewMonth` override of `monthNumber` in MonthlyPulse + feature gates.

### 9.3 Public profile (month 12) should show
Months Unlocked 12/12 · Seal row · 16 monthly/seal badges · "The Year in one paragraph" · epitaph. Privacy: public only through the existing `privacySettings.isProfilePublic`.

---

## 10. IMPLEMENTATION MAP (smallest steps first)

| Step | Change | Files | Risk |
|---|---|---|---|
| 1 | Add `self_care_complete` + `plan_set` + `emotional_checkin` to story input | `story-generator.ts` `formatLog` | low |
| 2 | `usershipJourney.ts`: month table (§3), PU weights (§2), Seal thresholds | new `src/shared/usership-journey.ts` | low, pure data |
| 3 | Months Unlocked tiles + richer Month Seal | `MonthlyPulseWidget.tsx` | low |
| 4 | `generateChapter()` + local fallback + `MemoryChapter` in user metadata | `story-generator.ts`, `scheduled-jobs.ts` | med |
| 5 | Month-gated density floor | `interfaceEvolution.ts` `getLayoutDensity` (max(floor, evolved)) | med |
| 6 | Shelf page, CORRECT/KEEP feedback loop | new component + `api.ts` | med |
| 7 | Echo (M7), Forecast (M10), Curate (M11), Book export (M12) | new widgets | higher — ship one per month-cohort |
| 8 | Demo `?month=N` scrubber + seed script | `server.ts` public profile, `scripts/` | med |

Note: gates are **additive** to the existing Evolution Gates (`featureUnlockLevel`); a Usership user at month N sees `max(monthGate, evolutionGate)`.

---

## 11. OPEN QUESTIONS FOR S-2

1. Chapter language/voice: second person ("you") as drafted, or third person like current Memory Story ("User prefers…")? Recommendation: second person for Chapters, keep third person for the admin `/us` summary.
2. Should missing a month's data **delay** the Chapter, or always deliver on the calendar boundary (recommended: always deliver; SEED tier is honest).
3. Does Usership month 1 start at `joinedAt` or at the tag-grant date? (`joinedAt` is used today; a user who joined free then upgraded would jump straight to a high month.) **Recommend a `usershipSince` field.**
4. Print/PDF Book: physical product tie-in with the subscription box?
5. Calibrate PU thresholds after 20 real cohorts.

---

AUTHORIZED BY: S-2 // VADIK MARMELADOV
