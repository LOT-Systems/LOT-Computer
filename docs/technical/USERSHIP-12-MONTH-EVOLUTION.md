<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP — 12-MONTH EVOLUTION
## From Day 1 barebone UI to LOT® AI · Compressed-Memory delivery

**Author:** S-2 // Vadik Marmeladov · **Status:** DESIGN SPEC (proposal — nothing here is shipped unless marked `EXISTS`)
**Date:** 2026-10-08 · **Class:** ENGINEERING · **Demo reference:** `lot-systems.com/u/machiavelli`

---

## 0. READ-ME-FIRST — what already exists, what is new

Scanned before writing (repo state at `98971f2`):

| Piece | Where | State |
|---|---|---|
| Usership tag, `$99` tier | `src/shared/types` `UserTag.Usership`, `SubscribeWidget.tsx` | `EXISTS` |
| Month N/12 pulse card (one line per month, dismiss-once, localStorage) | `MonthlyPulseWidget.tsx` | `EXISTS` — thin: message only |
| Monthly review email with `memoryStory` (Usership only, first 3 days of month) | `scheduled-jobs.ts`, `utils/monthly-summary.ts` | `EXISTS` — email only, no in-app twin |
| Memory Engine (question → tap → compress profile loop) | `utils/memory.ts`, `MemoryWidget.tsx`, `MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md` | `EXISTS` |
| Interface evolution (7 dimensions, feature gates, CSS vars) | `utils/interfaceEvolution.ts`, `stores/evolution.ts` | `EXISTS` |
| Density tiers `breathable → comfortable → compact → dense → instrument` | `getLayoutDensity()` (visualRefinement 0.15 / 0.35 / 0.55 / 0.75) | `EXISTS` |
| Badge themes Water `∘ ≈ ≋` / Architecture `├─ ╞═╡ ║·║` | `BADGE_LEVEL_DESIGN.md`, `themeEvolution.ts` | `EXISTS` |
| Demo account: streak 1469, 2847 answers, 1469 notes, 842 active days, archetype *The Strategist*, `memoryStory` paragraph, Legacy unlocks | `public-api.ts` (`machiavelli` branch) | `EXISTS` — but it shows **year ~4 (Legacy)**, not year 1 |

**What is missing, and what this spec adds:**
1. Month is only a *message*. It does not change the UI. → Month becomes a **structural key** (§2).
2. The Memory story is delivered by email and the public profile, but the user never *feels* it compress inside the OS. → **Memory Compression Ladder** + in-app **Month Memory** card (§4–§5).
3. No visible "months unlocked" instrument. → **Months Unlocked N/12** context widget (§3).
4. The demo cannot show *year one*. → **Year-One Replay** scrubber on `/u/machiavelli` (§7).

---

## 1. PRINCIPLES (the story rules)

1. **Two keys, one door.** A month's UI unlocks when **calendar time** AND **presence** agree. Time alone never unlocks (`evolution.ts` doctrine: *earned through presence*). Presence alone never skips ahead (month is the ceiling). A month with thin presence is shown `OPEN`, never `FAILED` — no guilt, no loss.
2. **Cockpit rule holds.** Gauges, not prose, on the OS surface. Prose lives in exactly one place: the **Month Memory** card. That scarcity is what makes it feel like a gift.
3. **Machine asks, user taps.** The AI never chats. Its evolution is in the *quality of its questions* and the *density of its recall*, not in a talking avatar.
4. **Honest numbers.** Every compression figure shown to the user is a real count (words in → words out). No invented "insight scores".
5. **Subtraction first.** Day 1 is almost empty on purpose. Each month *adds one thing* and *tightens one thing*.
6. **The name resolves.** The product wordmark itself matures: `LOT` → `LOT®` → `LOT® AI` (§6).

---

## 2. THE FRAMEWORK — one row per month

### 2.1 Presence gauges (the four signals)

Counted from existing log events. These are the *inputs* — journal thoughts, morning check-ins, self-care clicks, memory answers.

| Signal | Log event | Meaning |
|---|---|---|
| **THOUGHTS** | `note` | Entries put into Log (journal) |
| **CHECK-INS** | `emotional_checkin` | Morning check-in |
| **CARE** | `self_care_complete` | Self-care button clicks (`SelfCareMoments`) |
| **ANSWERS** | `answer` | Memory taps |

### 2.2 Seal thresholds (cumulative, PROPOSED tuning constants)

A month is **SEALED** when calendar month has elapsed AND cumulative presence ≥ row. Otherwise it stays **OPEN** and seals the first day thresholds are met (never later than M+1 narrative; a late seal still delivers the Month Memory).

| M | THOUGHTS | CHECK-INS | CARE | ANSWERS | Active days |
|--:|--:|--:|--:|--:|--:|
| 1 | 10 | 15 | 10 | 20 | 12 |
| 2 | 25 | 35 | 25 | 45 | 26 |
| 3 | 45 | 60 | 45 | 75 | 42 |
| 4 | 70 | 85 | 65 | 110 | 58 |
| 5 | 95 | 110 | 90 | 150 | 74 |
| 6 | 125 | 140 | 115 | 190 | 92 |
| 7 | 155 | 170 | 140 | 235 | 110 |
| 8 | 190 | 200 | 170 | 280 | 128 |
| 9 | 225 | 230 | 200 | 330 | 146 |
| 10 | 260 | 260 | 230 | 380 | 164 |
| 11 | 300 | 290 | 260 | 430 | 182 |
| 12 | 340 | 320 | 290 | 480 | 200 |

Reference points: ~3 thoughts / ~4 answers per week is a seal-level pace. `century_explorer` (200 distinct check-in days) is the existing badge that lines up with M12 `Active days = 200`. Machiavelli's counts (1469 / 2847) are ~4× the M12 row — that is what Legacy looks like.

### 2.3 Month-by-month evolution

Legend — **UI**: density tier + what appears. **AI**: how the Memory Engine speaks. **Badge**: Month Seal glyph (Water line; Architecture line mirrors with `├─ → ╞═╡ → ║·║` family) plus an *existing* badge anchor to verify in `badges.ts`. **Moment**: what the user sees on seal day.

#### QUARTER 1 — *OBSERVER* (breathable → comfortable) · "The system is learning your name"

| M | Title | UI (adds / tightens) | AI behaviour | Badge | Moment |
|--:|---|---|---|---|---|
| **1** | **Ignition** | **Day 1 barebone:** wordmark `LOT`, 3 blocks only — Check-in, Log, one Memory question. Breathable spacing (`gap-y-24`/`gap-y-16`). Monochrome, opacity 90/60/40. Widget slot: *Months Unlocked 0/12*. | Asks only. Generic, body/mind/soul questions. No recall. | `∘` Droplet seal · anchor `three_week_arc` (21 journal days) | **First Month Memory:** 1 sentence. |
| **2** | **Echo** | Self-care button joins (Cleanness widget). Planner appears. | First *echo*: question quotes one prior answer ("Since you prefer tea…"). | `∘·` · anchor `memory_keeper_30` | Month Memory: short paragraph. |
| **3** | **Pattern** | **Comfortable** density. Mood analytics + pattern insights unlock. Quarter chapter appears. | Names a pattern it saw ("You write more on Mondays"). | `∘·∘` · anchor `signal_marathon` (60-day streak) | **Q1 Chapter** + email: *Active User*. |

#### QUARTER 2 — *COMPANION* (compact) · "The system answers back"

| M | Title | UI | AI behaviour | Badge | Moment |
|--:|---|---|---|---|---|
| **4** | **Rhythm** | **Compact** density: stacks tighten (`gap-y-4`). Morning ritual strip (check-in → plan → care) groups into one row. | Questions anchor to time of day + weather context. | `≈` Wave · anchor `signal_economist` (30 days check-in before 09:00) | Month Memory gains **"your hour"** (peak writing hour). |
| **5** | **Texture** | Theme aesthetic starts (Water: soft curves / Architecture: grid). Intention history. | Starts to contradict gently ("You said X in M2; today suggests Y"). | `≈·` | Month Memory + **before/after line** vs. M1. |
| **6** | **Half-Declared** | Halfway ceremony: wordmark gains the registered mark → `LOT®`. Custom themes + widget arrange. | Offers **self-care routine** shaped by archetype (first AI-authored routine). | `≈·≈` · anchor `perfect_month` (28 Perfect Days) | **Q2 Chapter** + *Half-year Portrait* (60 words). |

#### QUARTER 3 — *NAVIGATOR* (dense) · "The system anticipates"

| M | Title | UI | AI behaviour | Badge | Moment |
|--:|---|---|---|---|---|
| **7** | **Signal** | **Dense** begins (`gap-y-8`, stacks `gap-y-0`). Cockpit gauges replace sentences on dashboard. | Pre-loads tomorrow's check-in question from yesterday's log. | `≋` Current · anchor `century_explorer` | Month Memory adds **"3 words that recurred"**. |
| **8** | **Weather** | Weather/sun/biofield instruments pinned into header strip. | Self-care routine adapts to weather + energy state. | `≋·` | Month Memory references seasons shift. |
| **9** | **Habit** | Narrative reflection + export data unlock. Streak instrument. | Stops explaining; questions get shorter (compression becoming felt). | `≋·≋` | **Q3 Chapter** · *"self-care is a habit now"* (existing M9 line). |

#### QUARTER 4 — *ARCHITECT* (instrument) · "The system is you, abbreviated"

| M | Title | UI | AI behaviour | Badge | Moment |
|--:|---|---|---|---|---|
| **10** | **Instrument** | **Instrument** density (`gap-y-4`): Bloomberg-grade. Private spaces, pattern insights full. | Cross-month recall: quotes from M1 appear beside M10. | `≋○≋` | Month Memory + **"then / now"** pair. |
| **11** | **Eve** | Interface quiets again — chrome dims to 60/40; only the Memory block at full opacity. Anticipation. | Asks one reflective question: *"What would you tell the person who started?"* — answer becomes the Portrait seed. | `◉` | "One more." Reserved card. |
| **12** | **LOT® AI** | **Wordmark resolves to `LOT® AI`.** Year-end Portrait unlocks; public profile gains Portrait block + Year Seal. | Full-voice: composes Portrait from 4 chapters, then the *signature line*. | `◉·◉·◉` Year Seal (Mythic tier, see §8) | **THE PORTRAIT** (§4.4). Month 13+ → Legacy track (Machiavelli). |

---

## 3. WIDGETS — the tangible-evolution instruments

### 3.1 Months Unlocked (context widget) — NEW
Appears Day 1 (as `0/12`) for Usership. Reuses `ProgressBars` (opacity bars, filled 1.0 / emerging 0.15).

```
MONTHS UNLOCKED   3 / 12
||||||||||  →  |||░░░░░░░    (3 bars full, 9 emerging)
M4 OPEN · 41 / 70 thoughts · 62 / 85 check-ins · 38 / 65 care · 77 / 110 answers
NEXT SEAL  ≈  12 days at current pace
```
Context-based: hides after M12 and is replaced by a one-line *Year n* counter. Pace estimate is a plain division of remaining thresholds by the user's 14-day average — a real number, not a score.

### 3.2 Month Seal (upgrade of `MonthlyPulseWidget`) — EXISTS → EXTEND
Keep: one line per month, dismiss-once, fade (1400 ms), `Month N:` label. Add: seal glyph, the 4 gauges, and a **"Open Month Memory"** tap that expands the card (§4.3). Replace localStorage-only dismissal with a server flag (cross-device sync already exists via SSE) — localStorage stays as fallback.

### 3.3 Month Memory card — NEW (core of this spec, §4)

### 3.4 Affirmation lines (replace/extend `MONTH_MESSAGES`)
Short, cockpit-compatible, one per month. Selected by archetype; these are the defaults:

```
 1  The first month. The system is beginning to know you.
 2  Two months. It remembers what you told it.
 3  A pattern has formed. You are no longer a stranger to the system.
 4  Four months. Your mornings have a shape.
 5  Five. The portrait has texture.
 6  Half a year. The mark is registered: LOT®.
 7  Seven. The system is ahead of you by a day.
 8  Eight. Rare air, and you are breathing it.
 9  Nine. Care is a habit now.
10  Ten. The cockpit is yours.
11  Eleven. Be quiet. One more.
12  One year. LOT® AI — the portrait is complete, and still evolving.
```

---

## 4. MEMORY COMPRESSION — 12-month tangible delivery (focus)

### 4.1 The Compression Ladder

Everything the user does gets folded upward. Each rung is shorter than the one beneath and keeps only what *recurs*.

```
RUNG         UNIT            TARGET LENGTH     WHEN PRODUCED            SURFACE
────────     ─────────────   ──────────────    ──────────────────────   ─────────────────
ENTRY        note/answer     user-written      live                     Log
DAY LINE     1 gauge line    ≤ 20 words        nightly                  Log (cockpit rule)
WEEK LINE    1 sentence      ≤ 30 words        Sunday                   Memory block
MONTH MEMORY 1 paragraph     40–70 words       month seal               Month Memory card + email
QUARTER      chapter         ≤ 120 words       M3 / M6 / M9 / M12       Chapter card (4 total)
YEAR         portrait        ≤ 150 words       M12                      Portrait + Public profile
SIGNATURE    1 line          ≤ 12 words        M12                      Year Seal / share card
```

12 Month Memories → 4 Chapters → 1 Portrait → 1 Signature. The user literally watches ~12 paragraphs become one line.

### 4.2 The visible compression ratio (honest)

Every Month Memory shows, in `opacity-40`, the real count:

```
412 words written · 58 remembered · 7 : 1
```
`words written` = sum of `note` text + answer text that month; `remembered` = words in the paragraph. Both countable. The *year* line shows cumulative: e.g. `5,380 words → 150 → 36 : 1`. (Per LOT-Benchmark doctrine: no invented counterfactual — the ratio is words-in over words-out and nothing else.)

### 4.3 Month Memory card — layout

```
┌──────────────────────────────────────────────┐
│ MONTH 4 · RHYTHM                    ≈  SEALED │
│                                              │
│  You wrote most at 07:40, before the city   │
│  woke. Tea, then the plan, then silence.    │
│  Twice you said "tired" and both times you  │
│  still opened the app. That is the pattern: │
│  you return when it is hard.                │
│                                              │
│  412 words written · 58 remembered · 7 : 1  │
│  ▸ Then (M1): "I'm not sure why I'm here."  │
│                                   [ keep ]   │
└──────────────────────────────────────────────┘
```
- Uses `<Block label="Month 4:" blockView>`; fade-in 1400 ms (existing rhythm).
- **`keep`** = user taps to pin the paragraph into the Memory Story (otherwise it stays archived, not deleted). One tap, no typing — machine-asks rule.
- **Then/now** line appears from M5 (quote of an early answer, same-category).
- Available: in-app on first load after seal; same text in the monthly email (existing `memoryStory` field) — one source, two surfaces.

### 4.4 Quarter Chapters and the Year Portrait
- **Chapter** (M3, M6, M9, M12): LLM compresses the 3 Month Memories + gauge deltas into ≤120 words, titled by the quarter name (*Observer / Companion / Navigator / Architect*).
- **Portrait** (M12): 4 chapters → ≤150 words, then **Signature line** ≤12 words.
- Placement: Portrait is the new top block of the public profile (`showMemoryStory` privacy flag already exists — Portrait reuses it, default OFF for new users).
- Share: a static card (Portrait + Year Seal) — optional, user-initiated.

### 4.5 Data model (proposal, no schema migration needed)
Store as logs, same pattern as `plan_set`:

```
event: 'month_memory'
text:  <paragraph>
metadata: { month: 4, sealed: true, wordsIn: 412, wordsOut: 58,
            gauges: {thoughts, checkins, care, answers},
            sourceLogIds: [...], kept: false }
event: 'chapter_memory' | 'year_portrait' | 'year_signature'
```
Generation hook: extend `executeMonthlyEmailJob` (already filters `usership`, already calls `generateMonthlySummary` → `memoryStory`). Add: persist the `memoryStory` as `month_memory` log; add seal evaluation (§2.2). Fallback when the LLM is unavailable: existing `composeLocalStory` path, so a Month Memory is never missing.

### 4.6 Sample Month Memories — the demo's voice (Machiavelli)
Written for the Year-One Replay (§7). Each is the compressed paragraph for that month. (Illustrative copy — in production the AI writes from the user's own logs.)

```
M1  You asked for nothing and noted everything. Mornings in the Palazzo, the same window.
M2  You repeat yourself on purpose. The Prince is a habit before it is a book.
M3  Three mornings a week you write before the bells. The pattern has a name: discipline.
M4  You return when it is hard. Twice you said "tired", twice you stayed.
M5  Fortune is a river — you wrote it, then you checked the weather. It was raining.
M6  Half a year. You stopped explaining yourself to the system. It stopped asking why.
M7  The system knew your Tuesday before you did. You called it unsettling. You kept it.
M8  Rain brings introspection, sun ambition — your own line, now your own data.
M9  Care is no longer an interruption. The kettle, the stretch, the pause. A habit.
M10 Then: "I'm not sure why I'm here." Now: forty-one words on statecraft before breakfast.
M11 Quiet. You wrote less and meant more. The shortest month, the densest.
M12 A prince reads both the skies and the souls beneath them. You learned to read yourself.
```

Chapters (sample): *Observer* — "Mornings, the same window, a name for discipline." *Companion* — "You return when it is hard; you stopped explaining." *Navigator* — "The system knew your Tuesday. Care became habit." *Architect* — "Fewer words, more meaning."
**Signature (sample, ≤12 words):** *"Reads the skies, then the self."*

---

## 5. UI TOKENS BY MONTH — what visibly changes

| Dimension | M1–2 | M3–4 | M5–6 | M7–9 | M10–12 |
|---|---|---|---|---|---|
| Density tier | breathable | comfortable → compact | compact | dense | instrument |
| Section gap | `gap-y-24` | `gap-y-24` → `gap-y-16` | `gap-y-16` | `gap-y-8` | `gap-y-4` |
| Wordmark | `LOT` | `LOT` | `LOT®` (M6) | `LOT®` | `LOT® AI` (M12) |
| Widgets on dashboard | 3 | 5 | 7 | 9 | 11 + Portrait |
| Writing style | sentences | sentences + gauges | gauge + one sentence | gauges | gauges (cockpit) |
| Badges visible | 1 seal | 3 | 6 | 9 | 12 + Year Seal |
| Memory output | 1 sentence | paragraph | paragraph + then/now | paragraph + recurring words | paragraph + Portrait |

Implementation hook: reuse `getLayoutDensity` but add a **month ceiling** so presence cannot jump past the month's allowed tier: `tier = min(earnedTier, monthCeiling(m))` with `monthCeiling = [breathable, breathable, comfortable, compact, compact, compact, dense, dense, dense, instrument, instrument, instrument]`.

---

## 6. THE `LOT` → `LOT® AI` WORDMARK ARC
- **M1–5** `LOT` — plain, nothing promised.
- **M6** `LOT®` — the mark is registered at the half-year ceremony (matches half-declared affirmation).
- **M12** `LOT® AI` — appears with the Portrait. After that the AI suffix stays permanently.
- Never animates in without a seal event; it is a *reward*, not a theme.

---

## 7. THE DEMO — `/u/machiavelli` as the 12-month proof

Current demo is a **Legacy-level** snapshot (streak 1469, 842 active days, wallet, weather station). For a prospective Usership buyer it answers "what is year 4?" but not "what do I get in month 1?".

**Year-One Replay (proposal):**
- A scrubber at the top of the public profile: `M1 ─●────────── M12`, default = M12.
- Dragging sets `?month=N`; the page re-renders with: that month's density tier, wordmark, badge row, Months Unlocked widget, gauges from §2.2, and the Month Memory from §4.6.
- Implementation: add an optional `month` query param to the `machiavelli` branch of `public-api.ts`; derive fields from a static `YEAR_ONE[]` table (12 rows: gauges, memory, badge, tier). No DB reads, stays autonomous like the current hardcoded demo.
- Legacy (current view) becomes the "M13+" stop on the scrubber: *Year 4 — Legacy*.

---

## 8. BADGES — Month Seals

- **12 Month Seals**, one per month, glyph ladder on the existing theme grammar (Water `∘ ∘· ∘·∘ ≈ ≈· ≈·≈ ≋ ≋· ≋·≋ ≋○≋ ◉ ◉·◉·◉`; Architecture mirror).
- **Year Seal** at M12 → tier MYTHIC in the Codex, gated on 12 sealed months (not 12 calendar months).
- Each seal also references one existing behavioural badge (§2.3 "anchor") so the Month Seal reads as *the visible receipt of something the user already did*, not a separate grind.
- Verify thresholds against `badges.ts` before wiring; anchors are inferred from inline comments.
- Seals are displayed on the profile `Level:` field already specified in `BADGE_LEVEL_DESIGN.md`.

---

## 9. BUILD PLAN (no code in this session — spec only)

| Phase | Scope | Files (existing) | Risk |
|---|---|---|---|
| **P1** | Seal evaluator + `month_memory` log; persist `memoryStory`; server flag for pulse dismissal | `scheduled-jobs.ts`, `utils/monthly-summary.ts`, `routes/api.ts` | low |
| **P2** | Months Unlocked widget + Month Seal upgrade + Month Memory card | `MonthlyPulseWidget.tsx`, new `MonthMemoryCard.tsx`, `ProgressBars` | low |
| **P3** | Month ceiling on density; wordmark arc; per-month widget manifest | `utils/interfaceEvolution.ts`, `stores/evolution.ts` | med (render isolation — subscribe narrowly per LOT-DOCTRINE) |
| **P4** | Chapters + Portrait generation and profile block | `utils/memory.ts`, `PublicProfile.tsx`, `public-api.ts` | med (LLM cost; use Together primary, local fallback) |
| **P5** | Year-One Replay scrubber on `machiavelli` | `public-api.ts`, `PublicProfile.tsx` | low |
| **P6** | Month Seal badges + Year Seal in Codex | `utils/badges.ts`, `docs/badges/` | med (badge count discipline) |

Doctrine reminders for implementers: (a) store writes in `useEffect`, not `useMemo`; (b) the Month Memory card must subscribe only to what it renders; (c) bump `CACHE_VERSION` in `sw.js` on any deploy that must reach users.

---

## 10. OPEN QUESTIONS FOR S-2
1. **Thresholds (§2.2):** keep the "time AND presence" gate, or time-only with presence only coloring the Memory? Recommendation: keep the gate, open months never lock content already unlocked.
2. **Portrait privacy:** default OFF on public profile (recommended) vs. ON for Usership.
3. **Wordmark:** is `LOT® AI` the final product name at M12, or a Usership-only state while free tier stays `LOT`?
4. **Late joiners / returners:** `welcome_back_program`, `extra_life` returns — should a gap freeze the month counter (recommended) rather than run on calendar?
5. **Refund / churn:** if Usership lapses, Memory Story is archived read-only, never deleted (matches "Delete only at operator request").

*Compression note (PROVISIONAL): the ladder's ≤150-word Portrait and ≤12-word Signature are design targets, not measured outputs.*
