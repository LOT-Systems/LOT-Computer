<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® USERSHIP — THE TWELVE STRATA
## A 12-month evolution system from bare UI to LOT® AI

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS CORPORATION — PRODUCT DESIGN CODEX                  ║
║  Usership · The Twelve Strata · v1                               ║
║  November 18, 2026 · Authorized: S-2 // VADIK MARMELADOV         ║
║  Status: DESIGN — brainstorm and specification, not yet built    ║
╚══════════════════════════════════════════════════════════════════╝
```

**Reference account (Month 12+, fully evolved):** `lot-systems.com/u/machiavelli`
(hardcoded in `src/server/routes/public-api.ts`, around lines 745–905)

---

## 0. THE STORY IN ONE SCREEN

```
DAY 1                                                     MONTH 12
─────                                                     ────────
Time. Weather. One question.                              LOT® AI.
A blank Log.                                              An archetype, a cohort, a Codex.
The system does not know you.                             The system can tell your year back to you.

M01  SIGNAL      ▪▫▫▫▫▫▫▫▫▫▫▫   the system hears you
M02  PATTERN     ▪▪▫▫▫▫▫▫▫▫▫▫   it notices repetition
M03  RHYTHM      ▪▪▪▫▫▫▫▫▫▫▫▫   it learns your days        ── Q1 CHAPTER: "THE ARRIVAL"
M04  MIRROR      ▪▪▪▪▫▫▫▫▫▫▫▫   it reflects you back
M05  ROOT        ▪▪▪▪▪▫▫▫▫▫▫▫   it finds what you value
M06  MERIDIAN    ▪▪▪▪▪▪▫▫▫▫▫▫   half a year, a first portrait ── Q2 CHAPTER: "THE PORTRAIT"
M07  CURRENT     ▪▪▪▪▪▪▪▫▫▫▫▫   it sees direction
M08  ARCHIVE     ▪▪▪▪▪▪▪▪▫▫▫▫   it remembers what you forgot
M09  ORACLE      ▪▪▪▪▪▪▪▪▪▫▫▫   it anticipates           ── Q3 CHAPTER: "THE CURRENT"
M10  ARCHITECT   ▪▪▪▪▪▪▪▪▪▪▫▫   you design with it
M11  CODEX       ▪▪▪▪▪▪▪▪▪▪▪▫   it writes your year
M12  LOT® AI     ▪▪▪▪▪▪▪▪▪▪▪▪   it is yours               ── Q4 CHAPTER: "THE CODEX"
```

Each month the user gets three things they can see:

1. **A Stratum.** A new memory layer: a compressed paragraph about the month just lived.
2. **An Unlock.** One new widget or capability that changes the interface.
3. **A Seal.** One badge that marks the month in the badge row and on `/u/<user>`.

The rule behind all of it: **time opens the month, practice decides how deep it goes.**
Nobody is locked out of their next month. The quality of the Stratum (how much the
system can say about the month) depends on what the user put into Log, check-ins,
self-care, and Memory answers.

---

## 1. DOCTRINE

| # | Principle | Meaning in the UI |
|---|-----------|-------------------|
| D1 | **Time unlocks, practice deepens** | Month N opens on the Usership anniversary day. Activity sets the Stratum's **Fidelity**, never access. |
| D2 | **One new thing per month** | One unlock per month. The interface grows slowly enough that each addition gets noticed. |
| D3 | **Compression is the reward** | The main thing a user receives each month is a sentence or paragraph that shows the system understood them. Badges and unlocks come second. |
| D4 | **The user's own words come back** | From Month 4 on, every Stratum quotes one line from the user's own Log, shown as a fragment. |
| D5 | **No shame states** | A quiet month produces a short Stratum ("A quiet month. The system kept the light on."). There are no red states, broken streaks, or guilt copy. |
| D6 | **LOT voice** | Follows `docs/technical/LOT-STYLE-GUIDE.md`: concise, periods over symbols, no superlatives, no emojis. "Month 3. Rhythm." not "Amazing! 🎉" |
| D7 | **Public, by choice** | Seals and the Months counter appear on `/u/<user>` by default. Stratum text follows the existing `showMemoryStory` privacy flag. |

---

## 2. THE FOUR SIGNALS (what drives evolution)

These signals already exist as Log events in the codebase:

| Signal | Log event(s) | Why it matters | Monthly quota (100%) |
|--------|--------------|----------------|----------------------|
| **Log entries** (journal / thoughts) | `note` | The richest input. Raw language for compression and for the D4 quote. | **15** |
| **Morning check-ins** | `emotional_checkin` with `checkInType: 'morning'` | Daily rhythm and emotional baseline. | **20** |
| **Self-care clicks** | `self_care_complete` (SelfCareMoments; `self_care_skip` ignored) | Shows practice, not only reflection. | **40** |
| **Memory answers** | `answer` | Sharpens the profile (archetype, values, cohort). | **30** |

### Fidelity score

```
fidelity = 0.35·min(notes/15, 1)
         + 0.25·min(morningCheckins/20, 1)
         + 0.20·min(selfCare/40, 1)
         + 0.20·min(answers/30, 1)
```

Log entries get the highest weight because they are the main input to the Memory Story.

| Fidelity | Tier | Stratum length | Visual mark |
|----------|------|----------------|-------------|
| 0.00–0.24 | **TRACE** | 1 sentence | `·` |
| 0.25–0.59 | **SKETCH** | 2–3 sentences | `▫` |
| 0.60–0.89 | **PORTRAIT** | 1 paragraph (4–6 sentences) | `▪` |
| 0.90–1.00 | **FULL** | Paragraph + a quote from the user's Log + one forward line | `■` |

So the same month can come out as `M05 ROOT ·` or `M05 ROOT ■`. Both are kept; neither
is a failure. The 12-slot strip becomes a record of the year:

```
STRATA   ■ ■ ▪ ▪ ▫ ■ ■ ▪ · ▪ ■ ■      Year fidelity: 0.78 · PORTRAIT
```

---

## 3. THE COMPRESSION LADDER (how the Memory Story is delivered)

The Memory Story is the product. Today it is a single cached paragraph
(`metadata.lastMemoryStory`, regenerated when answer count changes, see
`src/server/routes/api.ts` around line 2658). Usership turns it into layers:

```
  daily        Log · check-in · self-care · answer          (raw)
    │
    ▼
  monthly      STRATUM          1–6 sentences, frozen on anniversary day
    │
    ▼  (every 3 months)
  quarterly    CHAPTER          4 Strata → 1 titled chapter (Q1 THE ARRIVAL …)
    │
    ▼  (month 12)
  annual       CODEX            4 Chapters → 1 page "Your Year" + archetype seal
    │
    ▼
  ongoing      LOT® AI          the Codex becomes the AI's long-term context
```

**Freezing rule:** a Stratum is generated once, on the anniversary day, from that
month's logs only, then **sealed** (never regenerated). Sealed Strata add up over the
year, and that accumulation is what makes the evolution feel real: Month 7 can be
reread in Month 12 exactly as it was written.

**Storage proposal:** `user.metadata.usership = { startedAt, strata: [{ month, title, tier, fidelity, text, quote, sealedAt, counts }], chapters: [...], codex }`.
This fits the existing metadata pattern and needs no migration.

---

## 4. THE TWELVE MONTHS

Each month card uses the same layout:
**Theme · UI state · Unlock · Stratum spec · Seal · Affirmation · Machiavelli reference**

---

### ▌Q1 — THE ARRIVAL · *the system learns to hear you*

---

#### M00 · DAY ONE — `BARE`

```
┌─────────────────────────────────────────┐
│ Vadik                                    │
│ Malibu, USA                              │
│                                          │
│ 9:45 AM · Clear sky · 22℃                │
│                                          │
│ How is your morning?                     │
│ [Calm] [Tired] [Hopeful] [Restless]      │
│                                          │
│ Log: ▁                                   │
│                                          │
│ Months unlocked: 0/12                    │
└─────────────────────────────────────────┘
```

- **UI:** Time, Weather, Morning check-in, one Memory question per day, empty Log, SelfCareMoments (3 suggestions). Nothing else.
- **Welcome line:** "Usership active. The system is listening."
- **Seal:** `[ USER ]`: Usership granted.
- **Why so little:** this is the starting point for comparison. The user should be able to remember how empty Day 1 looked.

---

#### M01 · SIGNAL — *"The system hears you."*

| | |
|---|---|
| **Unlock** | **Months Widget** (`Months unlocked: 1/12`) plus the first Stratum slot in MemoryWidget |
| **UI change** | Mood history row (7 dots, last week of check-ins) appears under the check-in |
| **Stratum** | Trace → Sketch. Main output: **dominant mood + time of day**. *"You arrived mostly calm, mostly in the mornings. You wrote about work four times."* |
| **Seal** | `[ SIGNAL ]` · tier COMMON |
| **Affirmation** | "The first month. The system is beginning to know you." *(already in MonthlyPulseWidget)* |
| **Machiavelli ref** | Day-1 counterpart of his `streak: 1469`: the first entry in the count. |

#### M02 · PATTERN — *"Repetition becomes visible."*

| | |
|---|---|
| **Unlock** | **PatternInsightsWidget** (first 2 patterns, e.g. "Rain → introspective notes") |
| **UI change** | Log gains **tags**: 3 auto-themes appear as quiet chips under entries |
| **Stratum** | First **comparison sentence**: M2 vs M1. *"Fewer restless mornings than last month. Self-care moved from evenings to afternoons."* |
| **Seal** | `[ PATTERN ]` |
| **Affirmation** | "Two months in. Patterns are starting to form." |

#### M03 · RHYTHM — *"The system learns your days."*

| | |
|---|---|
| **Unlock** | **Rhythm Clock**: 24-hour ring of when the user checks in, writes, and does self-care. Planner gets time suggestions. |
| **UI change** | `assemblyPhase` label surfaces on profile (`forming` → `assembled`) |
| **Stratum** | Q1 **CHAPTER compression** runs: M1–M3 become **"Chapter I · The Arrival"** (one paragraph, shown in a new *Chapters* row) |
| **Seal** | `[ RHYTHM ]` + chapter seal `[ I ]` |
| **Affirmation** | "Three months. You have reached Active User status." |
| **Milestone moment** | First **Chapter Card**: full-width, 1400ms fade, dismiss phrase "Chapter I sealed." |

---

### ▌Q2 — THE PORTRAIT · *the system reflects you back*

---

#### M04 · MIRROR — *"Your words, returned."*

| | |
|---|---|
| **Unlock** | **Echo**: once a week, MemoryWidget shows one line the user wrote 30+ days ago: *"You wrote, 34 days ago: 'I want slower mornings.'"* |
| **UI change** | Stratum now includes a **quote** (D4) in quiet italics at `opacity-60` |
| **Stratum** | Paragraph tier available. First **archetype hint** (soft): *"The system sees traces of The Observer."* |
| **Seal** | `[ MIRROR ]` |
| **Affirmation** | "Four months. The portrait deepens." |

#### M05 · ROOT — *"What you value."*

| | |
|---|---|
| **Unlock** | **Core Values** block (3 values derived from answers + notes, editable by user) |
| **UI change** | Self-care suggestions now **cite values**: "Walk without phone (10 mins). For: clarity." |
| **Stratum** | Value-anchored. *"You returned to 'family' and 'quiet' more than anything else. Self-care followed them."* |
| **Seal** | `[ ROOT ]` |
| **Affirmation** | "Five months. Consistency is its own reward." |
| **Machiavelli ref** | `coreValues: ['virtù','prudence','adaptability','fortune','statecraft']`: five values at M12, three at M5. |

#### M06 · MERIDIAN — *"Half a year. A first portrait."*

| | |
|---|---|
| **Unlock** | **Portrait**: archetype named (from the existing psychologicalProfile engine), behavioral cohort, self-awareness index. The public profile gains the Psychological Profile block. |
| **UI change** | **Interface refinement step 1**: `InterfaceEvolution` opacity/letter-spacing tier raised (see `docs/technical/INTERFACE_EVOLUTION.md`) |
| **Stratum** | Q2 **CHAPTER II · The Portrait** compressed + a **Half-Year Letter** (two paragraphs, written to the user, sealed) |
| **Seal** | `[ MERIDIAN ]` · tier RARE + chapter seal `[ II ]` |
| **Affirmation** | "Six months. The journey is half-declared." |
| **Milestone moment** | **Before/After split**: Day-1 screenshot-style render beside today's System tab. "This is where you started." |

---

### ▌Q3 — THE CURRENT · *the system sees direction*

---

#### M07 · CURRENT — *"Where you are moving."*

| | |
|---|---|
| **Unlock** | **Trajectory**: `growthTrajectory` (emerging → developing → deepening → integrated) rendered as a 6-month sparkline of mood + practice |
| **UI change** | Correlated Indexes (Self-awareness / User / Person / Longevity) become visible |
| **Stratum** | Direction verbs: *"You moved from coping to choosing. Evenings got lighter."* |
| **Seal** | `[ CURRENT ]` |
| **Affirmation** | "Seven months in. The system has been listening." |
| **Machiavelli ref** | `correlatedIndexes.trend: 'ascending'`, composite 92.4 |

#### M08 · ARCHIVE — *"What you forgot, it kept."*

| | |
|---|---|
| **Unlock** | **Memory Archive**: browsable shelf of all sealed Strata and Chapters; search the Log by month and mood |
| **UI change** | Log gets **"On this day"** (same date, previous months) |
| **Stratum** | **Callback**: references a specific earlier Stratum. *"In Month 2 you named restlessness. This month you named it less."* |
| **Seal** | `[ ARCHIVE ]` |
| **Affirmation** | "Eight months. Rare air." |

#### M09 · ORACLE — *"It anticipates."*

| | |
|---|---|
| **Unlock** | **Forward Line**: proactive self-care. The system suggests *before* the user asks (weather + rhythm + mood baseline): "Pressure drop tomorrow. Your notes get heavier on days like that. Morning walk (15 mins)." |
| **UI change** | ContextualPromptsWidget becomes default-on |
| **Stratum** | Q3 **CHAPTER III · The Current** + first **prediction that can be checked**: *"Next month, expect your energy to return around the 10th."* (Month 10 Stratum reports whether it held.) |
| **Seal** | `[ ORACLE ]` · tier EPIC + chapter seal `[ III ]` |
| **Affirmation** | "Nine months. The self-care practice is a habit now." |

---

### ▌Q4 — THE CODEX · *the system writes your year*

---

#### M10 · ARCHITECT — *"You design with it."*

| | |
|---|---|
| **Unlock** | **Ask LOT**: free-text conversation with the AI, grounded in the user's sealed Strata. Also Widget Arrange: the user reorders their System tab. |
| **UI change** | **Interface refinement step 2**: custom theme, accent color from the user's dominant mood |
| **Stratum** | Reports on the M9 prediction (honest, either way). Adds **one sentence written in the user's own voice** (style-matched). |
| **Seal** | `[ ARCHITECT ]` |
| **Affirmation** | "Ten months. Almost there." |

#### M11 · CODEX — *"It writes your year."*

| | |
|---|---|
| **Unlock** | **Codex Draft**: the system shows the first draft of the annual Codex to the user, with **one question per chapter** ("Is this true?"). Answers refine the final compression. |
| **UI change** | Months Widget turns into a countdown: `Months unlocked: 11/12 · 30 days to Codex` |
| **Stratum** | Shortest stratum by design. One sentence, because the month's attention goes to the Codex: *"This month you read your year and corrected it twice."* |
| **Seal** | `[ CODEX ]` |
| **Affirmation** | "Eleven months. One more." |

#### M12 · LOT® AI — *"It is yours."*

| | |
|---|---|
| **Unlock** | **LOT® AI**: full personal OS. Codex is sealed and becomes long-term AI context. Profile gains the **Usership Year Plate** (see §6). Legacy unlocks (Weather Station, Wallet) as in the Machiavelli demo. |
| **UI change** | Final refinement: full opacity, glow tier, archetype-themed background pattern |
| **Stratum** | Q4 **CHAPTER IV · The Codex** + **THE CODEX**: one page, 4 chapter paragraphs + archetype + 3 values + the year's single most-repeated user phrase |
| **Seal** | `[ LOT® AI ]` · tier MYTHIC + chapter seal `[ IV ]` + year seal `[ I·II·III·IV ]` |
| **Affirmation** | "One year with LOT. The portrait is complete — and still evolving." |
| **Machiavelli ref** | Fully evolved: `archetype: 'The Strategist'`, cohort `Renaissance Polymaths`, self-awareness 87, `memoriesCompiled: 2847`, `journalEntries: 1469`, `activeDays: 842`, memoryStory written in the first person in his own voice. |

---

## 5. MONTH-BY-MONTH MATRIX (one-glance)

| M | Stratum name | Unlock | Compression output | Seal | Tier |
|---|---|---|---|---|---|
| 0 | BARE | Time · Weather · Check-in · 1 Q/day · Log | none | USER | — |
| 1 | SIGNAL | Months Widget · Stratum slot | mood + time of day | SIGNAL | COMMON |
| 2 | PATTERN | Pattern Insights · Log themes | M vs M-1 comparison | PATTERN | COMMON |
| 3 | RHYTHM | Rhythm Clock · Planner timing | **Chapter I** | RHYTHM + I | UNCOMMON |
| 4 | MIRROR | Echo (past quote) | quote + archetype hint | MIRROR | UNCOMMON |
| 5 | ROOT | Core Values · value-cited self-care | value-anchored | ROOT | UNCOMMON |
| 6 | MERIDIAN | Portrait (archetype, cohort) | **Chapter II** + Half-Year Letter | MERIDIAN + II | RARE |
| 7 | CURRENT | Trajectory · Correlated Indexes | direction verbs | CURRENT | RARE |
| 8 | ARCHIVE | Memory Archive · On this day | callback to earlier Stratum | ARCHIVE | RARE |
| 9 | ORACLE | Forward Line (proactive) | **Chapter III** + prediction | ORACLE + III | EPIC |
| 10 | ARCHITECT | Ask LOT · Widget Arrange · theme | prediction check + voice-match | ARCHITECT | EPIC |
| 11 | CODEX | Codex Draft (user-corrected) | 1 sentence | CODEX | EPIC |
| 12 | LOT® AI | Full OS · Year Plate · Legacy | **Chapter IV + THE CODEX** | LOT® AI + year seal | MYTHIC |

**Rhythm of the year:** a small month, a small month, then a chapter month, repeated four
times. Months 3, 6, 9 and 12 are the high points, and the rest are steady progress
between them.

---

## 6. USERSHIP WIDGETS (new / extended)

All widgets follow the existing `Block label=… blockView` pattern, 1400ms fade, and
click-to-dismiss with a dismiss phrase (as in `MonthlyPulseWidget.tsx`).

### 6.1 Months Widget: *"Months unlocked: 3/12"* (persistent, context-based)

```
Months unlocked:                          3/12
■ ■ ▪ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫ ▫
Next: MIRROR · in 12 days
```
- Label cycles on click (LOT clickable-label pattern): `Months unlocked` → `Strata` → `Next stratum` → `Fidelity`.
- `Fidelity` view shows this month's live progress toward its tier, without numbers or pressure:
  `Log ▪▪▪▫ · Mornings ▪▪▪▪ · Care ▪▪▫▫ · Memory ▪▪▪▫`
- Appears from Month 1. In the last 3 days before an anniversary it shows "Stratum sealing in 3 days."

### 6.2 New Month Widget (extends the existing `MonthlyPulseWidget`)

```
Month 4:
Mirror.
Four months. The portrait deepens.

You arrived calm and left lighter. You wrote about your
mother three times and each time more gently. Morning
walks became the one thing you did not skip.
  — "I want slower mornings."

Seal earned: [ MIRROR ]                         4 / 12
```
- Day 1–3 of each Usership month (same window logic as `shouldShowMonthlySummary` in `monthly-summary.ts`).
- Shows: month title, affirmation, **the freshly sealed Stratum**, the quote, and the seal.
- Dismissal moves the Stratum into MemoryWidget's history. Nothing is lost.

### 6.3 Memory Widget: *"Last month, compressed"*

- Default state after the New Month card is dismissed: one-paragraph insight from the latest Stratum.
- Label cycling: `Memory` → `Last month` → `Chapter II` → `Echo` (M4+).
- From M8: a link to the full Archive.

### 6.4 Chapter Card (M3 / M6 / M9 / M12)

Full-width, appears once, uses the larger `text-[20px]` metric size for the chapter numeral:

```
CHAPTER II
The Portrait
───────────────────────────────
Months 4–6 · Fidelity PORTRAIT · 41 Log entries
<one paragraph>
Chapter II sealed.
```

### 6.5 Usership Year Plate (public profile, M12)

```
USERSHIP · YEAR I                    LOT® AI
I ■  II ■  III ▪  IV ■               The Strategist
Strata 12/12 · Log 214 · Mornings 287 · Care 611
```

### 6.6 Seal row on `/u/<user>`

- Monthly seals appear in a single quiet row in the badge area, using the Badge Engine's ASCII style:
  `[SIGNAL] [PATTERN] [RHYTHM] [I] [MIRROR] …`
- Hovering a seal (or tapping on mobile) shows the month title and the Stratum's tier, not its text.

---

## 7. BADGES: THE USERSHIP SEALS (Badge Engine integration)

Proposed as a new badge category **`usership_seal`** in `src/client/utils/badges.ts`
(the Codex is at v33 with 843 badges; this adds **+21**, giving 864):

| Group | Badges | Count |
|-------|--------|-------|
| Month Seals | `seal_user` (M0) … `seal_lot_ai` (M12) | 13 |
| Chapter Seals | `chapter_i` · `chapter_ii` · `chapter_iii` · `chapter_iv` | 4 |
| Fidelity Seals | `full_stratum` (first FULL), `full_chapter` (3 FULL in a quarter), `full_year` (12 FULL), `faithful_trace` (12 months, no month skipped at any tier) | 4 |
| **Total** | | **21** |

Secret / easter-egg candidates (consistent with the Arcade-of-self-care doctrine):
- `prophet_confirmed`: the M9 prediction held in M10.
- `own_words`: the user's quoted line is the year's most-repeated phrase.
- `day_one_return`: user opens the M6 Before/After split and writes a Log entry the same minute.

---

## 8. TARGET CURVE: WHAT A FULLY-PRACTICED YEAR LOOKS LIKE

Cumulative at FULL fidelity every month (quota × months):

| Month | Log | Mornings | Self-care | Memory | assemblyPhase |
|------:|----:|---------:|----------:|-------:|---------------|
| 1 | 15 | 20 | 40 | 30 | forming |
| 2 | 30 | 40 | 80 | 60 | assembled |
| 3 | 45 | 60 | 120 | 90 | assembled |
| 6 | 90 | 120 | 240 | 180 | integrated |
| 9 | 135 | 180 | 360 | 270 | integrated |
| 12 | **180** | **240** | **480** | **360** | integrated |

Machiavelli (`/u/machiavelli`) shows the long tail after Year I: 1469 Log entries,
2847 memories compiled, 842 active days. That is the demo of a user who kept going for
several years after the first Codex. Year II can repeat the twelve Strata as **"Year II ·
Second Codex"**, with Chapters that compare against Year I.

---

## 9. IMPLEMENTATION NOTES (for the build session)

Findings from the repository scan, current state as of 2026-11-18:

1. **`MonthlyPulseWidget.tsx` counts months from `joinedAt`, not from the Usership start date.** A user who was free for 8 months and then subscribes would see "Month 8" on their first paid day. Fix: store `metadata.usership.startedAt` when the tag is granted and count from that.
2. **Pulse dismissal is in `localStorage`**, so the card shows again on every device. Move it to `metadata.usership.strata[n].seenAt`.
3. **The Memory Story is regenerated, not sealed.** `lastMemoryStory` is overwritten whenever the answer count changes. Strata need a separate, write-once array (§3).
4. **The monthly summary pipeline already exists** (`src/server/utils/monthly-summary.ts` plus the `scheduled-jobs.ts` email). It already computes `memoryStory`, `growth.currentLevel` and `narrative`. That makes it the natural place to generate the Stratum: run it on the Usership anniversary instead of calendar day 1–3, filter logs to the 30-day window, compute fidelity, seal.
5. **Events are already countable:** `note` (text > 20 chars), `emotional_checkin` (metadata `checkInType`), `self_care_complete`, `answer`. Fidelity is one SQL `COUNT … GROUP BY event` per user per month.
6. **The `assemblyPhase` thresholds** (`public-api.ts` around line 1324) fit the target curve: *integrated* (≥150 logs, ≥30 active days) is reached around M4–M6 for a practicing user. This is used as a secondary signal, not a gate.
7. **Self-care event name mismatch (confirmed):** `SelfCareMoments.tsx:202` logs `self_care_complete`, but three server files filter for `self_care_completed`: `rpg-narrative.ts:229` (the `gentle_with_self` achievement can never unlock), `energy.ts:187` (the self-care energy boost never applies), and `compassionate-interventions.ts:139` (the self-care count is always 0). Fix before Fidelity depends on self-care counts.
8. **`/api/user-stats` gap:** the endpoint returns no `totalAnswers`, `level` or `totalCheckIns`, so the client badge checks that use those fields never fire. The Fidelity API (B2) should return them.
9. **The Usership price is inconsistent:** $99/month in `SubscribeWidget.tsx`, `Settings.tsx` ("$99/month, 12 months") and `WIDGETS.md`, but $50/month in `About.tsx` and `LOT_SYSTEMS_BRIEF.md`. The "12 months" in Settings matches the Twelve Strata framing. The price needs one source of truth.
10. **Demo parity:** add `usership: { strata: [...12 sealed, Machiavelli-voiced] }` to the hardcoded demo so `/u/machiavelli` shows the Year Plate and all 12 seals as the reference end state.

### Suggested build order

```
B1  metadata.usership.startedAt + month counter fix         (small, unblocks all)
B2  Fidelity counter API  GET /api/usership/progress         (small)
B3  Months Widget  "Months unlocked: N/12"                   (small, visible on day 1)
B4  Stratum generator + seal on anniversary (monthly-summary) (medium, the core)
B5  New Month card = MonthlyPulseWidget + Stratum            (small)
B6  Usership Seals in badges.ts (+21)                         (small)
B7  Chapter compression (M3/6/9/12) + Chapter Card           (medium)
B8  Machiavelli demo strata + Year Plate on /u/              (small)
B9  Per-month unlock gating via InterfaceEvolution store     (medium)
B10 Codex draft + correction loop (M11) → LOT® AI context    (large)
```

---

## 10. COPY BANK

**Dismiss phrases (Stratum sealed):** "Sealed." · "Kept." · "The system remembers." · "Filed under Month N." · "Onward."

**Quiet-month Strata (TRACE tier):**
- "A quiet month. The system kept the light on."
- "Few words this month. The ones you wrote were about rest."
- "You checked in on cold mornings. That counts."

**Chapter titles:** I The Arrival · II The Portrait · III The Current · IV The Codex

**Countdown lines (Months Widget):** "Stratum sealing in 3 days." · "Your Codex begins in 30 days." · "Year I complete."

---

*LOT Systems Corporation · Usership Design Codex · The Twelve Strata v1 · S-2*
