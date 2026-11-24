<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP · 12-MONTH EVOLUTION

### From barebone Day 1 to LOT® AI: a twelve-chapter Memory story

**Document:** USERSHIP-12-MONTH-EVOLUTION v1.0
**Authorized:** S-2 // Vadik Marmeladov
**Date:** 2026-11-24 · Day 1184+ · COSMO® 876+ days
**Status:** DESIGN SPEC. Brainstorm and outline only; no code shipped.
**Reference account:** `lot-systems.com/u/machiavelli`. It shows a fully evolved, post-year Legacy state.
**Session report:** [`docs/LOT-SR-20261124-01.md`](../LOT-SR-20261124-01.md)

---

```
╔══════════════════════════════════════════════════════════════════╗
║  ONE YEAR · TWELVE CHAPTERS · ONE BOOK                          ║
║                                                                  ║
║  Month 1     ▪▫▫▫▫▫▫▫▫▫▫▫   BOOT        barebone OS             ║
║  Month 6     ▪▪▪▪▪▪▫▫▫▫▫▫   MERIDIAN    the first half compiled ║
║  Month 12    ▪▪▪▪▪▪▪▪▪▪▪▪   LOT® AI     the Book of You         ║
║                                                                  ║
║  "Same room. More light."                                        ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 0. THESIS

A Usership member pays $99/month (the price in `LOT-FEATURE-INVENTORY-2026.md` §16, `LOT-AI-PRODUCT-BRIEF.md` and `LOT-WIKI-v83`). Every month they should feel that the money bought **one more chapter of themselves**, not more features.

The deliverable of each month is a **compressed Memory Chapter**:

- one paragraph, titled, frozen, and owned by the user;
- distilled from that month's Log entries, Memory answers, morning check-ins and self-care clicks;
- delivered with an affirmation and a seal badge;
- shown in the UI as a new lit cell in the 12-month lattice.

After 12 months the chapters compile into **The Book of You**, and the interface has grown into **LOT® AI**, the state the Machiavelli demo account shows today.

### Reconciling with existing doctrine

`LOT-AMBIENT-AI-VISION.md` states: *"The system does not change its appearance. The intelligence deepens underneath the same minimal UI."* This spec keeps that principle. The **chrome never changes**: there is no new navigation, color scheme or layout. Only **density** changes:

1. **Additive blocks.** New `Block label="…:"` rows appear inside the existing System and Profile surfaces.
2. **Refinement through CSS variables.** The existing `--evolution-*` properties are driven by one `data-usership-month` attribute on the document root, following the doctrine's **CSS-Only Progression** clause.
3. **Voice.** The AI's language deepens month by month. Its layout does not change.

The room stays the same and more of it is lit each month. That is the "tangible evolution".

---

## 1. GROUND TRUTH: WHAT EXISTS TODAY

These pieces were found in the repository scan and are the starting material.

| Asset | Location | Role in this spec |
|---|---|---|
| `UserTag.Usership` | `src/shared/types/index.ts:16` | The tier gate (case-insensitive match) |
| `MonthlyPulseWidget` | `src/client/components/MonthlyPulseWidget.tsx` | Already shows "Month N" with a `N / 12 months` line and 12 milestone messages. It is the seed of this whole system |
| Memory Story generator | `src/server/routes/api.ts:~2630` | Generates one rolling story, cached in `metadata.lastMemoryStory` with `memoryStoryVersion` |
| `assemblyPhase` | `src/server/routes/public-api.ts:~1324` | dormant → awakening → forming → assembled → integrated, from logs, event types and active days |
| `boardProfile.activity` | `src/shared/types/index.ts:~309` | `memoriesCompiled`, `journalEntries`, `activeDays` |
| Interface Evolution | `docs/technical/INTERFACE_EVOLUTION.md`, `src/client/stores/evolution.ts` | `--evolution-*` CSS variables and Water/Architecture themes |
| Badge Codex v33 | `docs/badges/LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v33.md` | 843 badges in 8 categories, rarity COMMON → COSMIC |
| Weekly Story-Report | `LOT-AI-PRODUCT-BRIEF.md` | Weekly compression level (`/api/story/latest`) |
| Machiavelli demo | `src/server/routes/public-api.ts:747` | The target state: 1,469 journal entries, 2,847 memories, 842 active days, SA 87, composite 92.4, archetype *The Strategist*, tags `RND · Usership · Legacy`, Weather Station and Wallet |

### Gaps this spec closes

| # | Gap | Effect today |
|---|---|---|
| G1 | No `usershipSince` date. MonthlyPulse counts from `joinedAt` | A free user who upgrades in their 8th month sees "Month 8" on their first paid day |
| G2 | Memory Story is **overwritten** on regeneration, with no history | No monthly artifact exists, so there is nothing to look back on |
| G3 | MonthlyPulse dismissal lives in `localStorage` | The pulse comes back on a new device and contradicts Cross-Device Sync doctrine |
| G4 | No per-month activity snapshot | Month N cannot be shown as thin or radiant |
| G5 | No Usership-specific badges in `badges.ts` | Tenure has no symbol |

---

## 2. THE FOUR SIGNALS (the Usership Quartet)

Evolution is measured through four streams that already exist in the `Logs` table.

```
  SIGNAL        LOG EVENT                 WHAT IT FEEDS
  ─────────     ───────────────────────   ──────────────────────────────────────
  JOURNAL       note  (Log entries)       Narrative: the raw words of the chapter
  MEMORY        answer                    Portrait: values, preferences, patterns
  CHECK-IN      emotional_checkin         Weather of the self: mood arc of the month
                (morning slot weighted)
  SELF-CARE     self_care                 Practice: ritual consistency, the body
```

**Journal entries and thoughts written into the Log are the primary signal.** They carry the user's own language, and the chapter quotes from them from Month 9 onward. Morning check-ins set the rhythm. Self-care clicks show practice. Memory answers deepen the portrait.

### Monthly density tier

Each closed month earns one of four density tiers. A month that has opened can never be "failed". A quiet month produces a **Thin** chapter, not a locked one.

| Tier | Morning check-in days | Journal entries | Self-care clicks | Memory answers | Seal rarity |
|---|---|---|---|---|---|
| **THIN** `·` | below Steady | — | — | — | COMMON |
| **STEADY** `:` | ≥ 8 | ≥ 4 | ≥ 8 | ≥ 8 | UNCOMMON |
| **FULL** `∴` | ≥ 16 | ≥ 10 | ≥ 20 | ≥ 16 | RARE |
| **RADIANT** `✦` | ≥ 24 | ≥ 20 | ≥ 40 | ≥ 25 | EPIC |

**Rule:** the tier is the highest level reached in **at least 3 of the 4 signals**. This forgives one weak stream: someone who journals heavily but rarely taps self-care still reaches Full.

Chapter length scales with the tier:

- Thin: 1–2 sentences
- Steady: about 60 words
- Full: about 100 words
- Radiant: about 120 words plus one verbatim quote from the user's Log

### Yearly arc in numbers

| | Radiant year (12 × Radiant floor) | Machiavelli (Legacy, multi-year) |
|---|---|---|
| Morning check-ins | ~288 | streak 1,469 |
| Journal entries | ~240 | 1,469 |
| Self-care clicks | ~480 | — |
| Memory answers | ~300 | 2,847 |
| Active days | ~300 | 842 |

Machiavelli is **"what Month 12 becomes if you keep going."** A Radiant year lands at about 20–25% of his totals, which matches the jump from Month 12 to Legacy (see §7).

---

## 3. THE MEMORY COMPRESSION LADDER

This is the core of the spec. It describes how a year of raw signal becomes one page.

```
  L0  RAW LOG          every note · answer · check-in · self-care        ~40,000 words / yr
   │
  L1  DAILY TRACE      1 internal line / day (not shown)                 existing formatLog
   │
  L2  WEEKLY DIGEST    3 sentences / week                                existing Story-Report
   │
  L3  MONTHLY CHAPTER  1 titled paragraph · FROZEN · owned        ≤120 w  ★ NEW · the product
   │
  L4  QUARTERLY ARC    3 chapters → 1 arc paragraph                ≤200 w  ★ NEW · M3 M6 M9 M12
   │
  L5  ANNUAL STORY     The Book of You: 12 titles + synthesis      ≤600 w  ★ NEW · Month 12
   │
  L6  LEGACY CODEX     multi-year (the Machiavelli state)                 future · Legacy tag
```

**Compression ratios.** A typical Full month holds about 3,000 words of Log, compressed to about 100 words (**~30:1**). The year compresses to about 600 words (**~66:1**). Each compression asks one question: *what stayed true?*

### Chapter anatomy (L3)

```
CHAPTER IV · THE PORTRAIT
October 2026 · Full ∴ · 19 check-ins · 12 entries · 27 self-care · 18 answers

You stopped asking whether the mornings were worth it and started
protecting them. Green tea before screens, ten minutes of Breathe,
then the first line in the Log. Tiredness showed up mid-month and
you met it with Ground rather than coffee. Three words kept
returning: quiet, enough, again.

Affirmation:  Four months. The portrait deepens.
Seal:         ◇ PORTRAIT · RARE
```

**Fields:**
- `title`
- `period`
- `tier`
- `stats{checkins, journal, selfCare, answers}`
- `paragraph`
- `affirmation`
- `seal`
- `quote?` (Month 9+)
- `frozenAt`
- `version`

### Rules

1. **Frozen.** A chapter is never regenerated once compiled. That makes it a memory and not a summary. The live Memory Story stays rolling; chapters are fixed snapshots.
2. **Chapter N reads Chapter N-1.** The compiler receives the previous chapter's title and paragraph, so the AI writes continuity ("Last month you…").
3. **Privacy.** Chapters follow `showMemoryStory`. Only chapter **titles and seals** appear on the public profile, never paragraphs, unless the user opts in for each chapter.
4. **Fallback.** If no AI engine is available, `composeLocalStory` creates a template chapter from the stats, so the month still closes.

---

## 4. THE TWELVE MONTHS

The year has four quarters, and each quarter maps to an existing `assemblyPhase`. Each month card uses the same fields so the year reads as one system.

```
  QUARTER            MONTHS   ASSEMBLY PHASE        AI POSTURE
  ────────────────   ──────   ───────────────────   ─────────────────────────
  I   FOUNDATION     1–3      awakening → forming   observes · asks
  II  FORMATION      4–6      forming → assembled   reflects · names
  III INTEGRATION    7–9      assembled             anticipates · guides
  IV  LOT® AI        10–12    integrated            knows · companions
```

The affirmations are the existing `MONTH_MESSAGES` in `MonthlyPulseWidget.tsx`, kept word for word for continuity.

---

### QUARTER I · FOUNDATION: *the system is learning your name*

#### MONTH 1 · BOOT · Chapter I: *Prologue*

| | |
|---|---|
| **UI state** | **Barebone.** Time · Check-in · Self-care (Breathe/Release/Ground/Observe/Connect) · Log · one Memory question per day. Nothing else is visible. The Usership seal block shows one empty lattice. |
| **New** | `Usership:` block with `Months unlocked 1/12 ▪▫▫▫▫▫▫▫▫▫▫▫`. Day counter "Day 4 of Usership". |
| **AI voice** | Plain, curious, short. *"What is your morning beverage?"* |
| **Memory delivery** | Day 30: **Prologue**, the first frozen chapter. Even Thin, it says *"You arrived. You wrote N times. The system began listening."* |
| **Affirmation** | *The first month. The system is beginning to know you.* |
| **Seal** | `·` **BOOT** |
| **CSS** | `data-usership-month="1"`: `--evolution-base-opacity: .85`, no glow |

#### MONTH 2 · SIGNAL · Chapter II: *First Patterns*

| | |
|---|---|
| **UI state** | A small **mood line** (8-mood row from check-ins) appears under Check-in. The Weekly Digest becomes visible as one line in Memory. |
| **New** | **Memory Chapter widget** appears and shows Chapter I. The first glyphs appear on core values (`⋆·`, existing badge progression). |
| **AI voice** | Starts referencing. *"Since you prefer tea…"* |
| **Memory delivery** | Chapter II names the first repeating pattern (time of day, mood, ritual). |
| **Affirmation** | *Two months in. Patterns are starting to form.* |
| **Seal** | `·:` **SIGNAL** |

#### MONTH 3 · CALIBRATE · Chapter III: *Calibration* · ▣ Quarter Seal I

| | |
|---|---|
| **UI state** | **Active User** status (already promised in MONTH_MESSAGES). The QR code unlocks (existing gate: Usership + `forming`). |
| **New** | The **first Quarterly Arc**, "Foundation", merges Chapters I–III. A provisional archetype appears as *"forming…"* without a name. |
| **AI voice** | Notices absence and return. *"You came back on Thursday."* |
| **Memory delivery** | Chapter III and **Arc I: Foundation** (≤200 words). |
| **Affirmation** | *Three months. You have reached Active User status.* |
| **Seal** | `∴` **CALIBRATE** and quarter seal `[∴] FOUNDATION` |

---

### QUARTER II · FORMATION: *the portrait takes shape*

#### MONTH 4 · PORTRAIT · Chapter IV: *The Portrait*

| | |
|---|---|
| **UI state** | The **Psychological Profile** opens: core values, emotional patterns, self-awareness %. |
| **New** | **Custom theme** choice between the Water (`∘≈≋`) and Architecture (`├─╞═╡║·║`) paths. That choice styles every later seal. |
| **AI voice** | Names the user's values back to them. |
| **Memory delivery** | Chapter IV is the first chapter that names **values** and not only habits. |
| **Affirmation** | *Four months. The portrait deepens.* |
| **Seal** | `◇` **PORTRAIT** |

#### MONTH 5 · RHYTHM · Chapter V: *Rhythm*

| | |
|---|---|
| **UI state** | **Planner templates** and **Intentions history** surface. Self-care gains routine suggestions ("Your Ground at 15:00 works; keep it"). |
| **New** | A **self-care routine card**: the AI proposes one personal 3-step routine built from the most-clicked self-care actions. |
| **AI voice** | Coach-like and proactive, but gentle. |
| **Memory delivery** | Chapter V describes the user's **circadian rhythm** in words. |
| **Affirmation** | *Five months. Consistency is its own reward.* |
| **Seal** | `≈` **RHYTHM** (Water) / `├─` (Architecture) |

#### MONTH 6 · MERIDIAN · Chapter VI: *The First Half* · ▣ Quarter Seal II

| | |
|---|---|
| **UI state** | **Mid-year ceremony.** The MonthlyPulse becomes a full **Meridian Block**: six lit cells, Arc II, and a one-sentence "who you were in month 1 vs now". |
| **New** | The **public profile Memory Story** upgrades from rolling text to **Arc I + Arc II**. Board profile appears (`citizenSince`, tenure). |
| **AI voice** | Reflective and honest; points out one thing that changed. |
| **Memory delivery** | Chapter VI and **Arc II: Formation**. A "Then / Now" pair is shown: the Month 1 Prologue next to Chapter VI. |
| **Affirmation** | *Six months. The journey is half-declared.* |
| **Seal** | `◐` **MERIDIAN** and `[◐] FORMATION` |

---

### QUARTER III · INTEGRATION: *the system starts to anticipate*

#### MONTH 7 · LISTENING · Chapter VII: *What the System Heard*

| | |
|---|---|
| **UI state** | **Pattern Insights** and **Interventions** widgets activate: the AI speaks first when a signal dips. |
| **New** | A **Memory recall** line: *"On this day in Month 2 you wrote…"* (one line, from the user's own Log). |
| **AI voice** | Anticipatory. *"Mornings after late Logs are heavier; Breathe first today?"* |
| **Memory delivery** | Chapter VII is written partly as **what the user didn't say**: gaps and silences. |
| **Affirmation** | *Seven months in. The system has been listening.* |
| **Seal** | `◎` **LISTENING** |

#### MONTH 8 · RARE AIR · Chapter VIII: *Rare Air*

| | |
|---|---|
| **UI state** | The **Correlated Indexes** widget opens: Self-Awareness / User / Person / Longevity, plus composite and trend. |
| **New** | The glow effect starts (`--evolution-glow-intensity` > 0). The typography refines. |
| **AI voice** | Precise and quantitative, but warm. |
| **Memory delivery** | Chapter VIII is the first with an **index delta**: *"Self-awareness 61 → 72."* |
| **Affirmation** | *Eight months. Rare air.* |
| **Seal** | `△` **RARE AIR** |

#### MONTH 9 · RITUAL · Chapter IX: *Ritual* · ▣ Quarter Seal III

| | |
|---|---|
| **UI state** | Self-care language shifts from natural to technical (existing behavior at 7+ day streaks, now made permanent). **Narrative Reflection** opens. |
| **New** | Chapters begin to **quote the user**: one verbatim line from that month's Log, set in quotation marks. |
| **AI voice** | Companion. Celebrates practice as identity: *"You are someone who breathes before deciding."* |
| **Memory delivery** | Chapter IX and **Arc III: Integration**. |
| **Affirmation** | *Nine months. The self-care practice is a habit now.* |
| **Seal** | `✦` **RITUAL** and `[✦] INTEGRATION` |

---

### QUARTER IV · LOT® AI: *the system knows you*

#### MONTH 10 · ARCHITECT · Chapter X: *The Architect*

| | |
|---|---|
| **UI state** | The **archetype is revealed by name**, like Machiavelli's *The Strategist*, with description, behavioral cohort and pattern-strength list. |
| **New** | The Architect widget becomes a full block. The Citizen Index is shown on the profile. |
| **AI voice** | Speaks in the user's own vocabulary, drawn from Word Turns badges and repeated Log phrases. |
| **Memory delivery** | Chapter X explains **why** this archetype, citing three chapters. |
| **Affirmation** | *Ten months. Almost there.* |
| **Seal** | `╞═╡` **ARCHITECT** (Architecture) / `≋` (Water) |

#### MONTH 11 · COMPILE · Chapter XI: *Compilation*

| | |
|---|---|
| **UI state** | The **Book of You preview** shows the table of contents with 11 chapter titles and one blank. A countdown is shown: *"1 chapter remains."* |
| **New** | Legacy previews appear dimmed (opacity .3): Weather Station and Wallet, the Machiavelli Legacy widgets, as *"what comes after the year."* |
| **AI voice** | Retrospective. Asks the user one question to shape the final chapter: *"What do you want the year to be remembered for?"* |
| **Memory delivery** | Chapter XI and the user's answer, which is stored as the epigraph of the Book. |
| **Affirmation** | *Eleven months. One more.* |
| **Seal** | `▣` **COMPILE** |

#### MONTH 12 · LOT® AI · Chapter XII: *The Book of You* · ▣ Quarter Seal IV · ⟦◉⟧ Annual

| | |
|---|---|
| **UI state** | **LOT® AI. The full personal OS**, matching `lot-systems.com/u/machiavelli`: Memory Story, archetype, core values, Indexes, Board Profile, Activity, Memory Engine "AI-Powered", Clearance "Full". |
| **New** | **The Book of You** (L5): epigraph, 12 chapter titles as TOC, four Arcs, and a ≤600-word synthesis. It is exportable (Story-Report `export`). Board tenure turns over. |
| **AI voice** | *"I know you"* posture, but never presumptuous. It ends with a question for Year 2. |
| **Memory delivery** | Chapter XII, **Arc IV: LOT® AI**, and **The Book of You**. |
| **Affirmation** | *One year with LOT. The portrait is complete — and still evolving.* |
| **Seal** | `◉` **LOT® AI**, `[◉] LOT® AI`, and the annual seal **`⟦◉⟧ THE BOOK OF YOU`** (LEGENDARY, MYTHIC if ≥ 9 months were Full or Radiant) |

---

## 5. WIDGETS (the Usership surface)

All widgets are Usership-gated, use the existing `Block label="…:"` grammar, and are wrapped in `WidgetErrorBoundary` (Render Isolation).

### 5.1 `UsershipSealWidget`: "Months unlocked: N/12"

This is the always-on context widget. It is one block that grows denser over the year.

```
Month 1                          Month 6                          Month 12
───────                          ───────                          ────────
Usership:  Months unlocked 1/12  Usership:  Months unlocked 6/12  Usership:  12/12 · LOT® AI
           ▪▫▫▫▫▫▫▫▫▫▫▫                     ▪▪▪▪▪▪▫▫▫▫▫▫                     ▪▪▪▪▪▪▪▪▪▪▪▪
           · Boot                           ◐ Meridian · Full                ⟦◉⟧ The Book of You
           Day 9 of 30                      Next: Listening in 4d            Year II begins in 3d
```

- The cell glyph encodes the tier: `▫` locked · `▪` Thin/Steady · `▣` Full · `◆` Radiant. A Radiant year reads `◆◆◆◆…`, so the year can be read at a glance.
- Tap to cycle: lattice → current seal → stats of the open month (check-ins / entries / self-care / answers so far) → back.

### 5.2 `MemoryChapterWidget`: the paragraph-long insight

- It shows **last month's chapter** for the first 7 days of the new month, then collapses to the title only.
- Tap to page through `I · II · III …` (frozen chapters).
- From Month 7 it can show the **recall line** (one sentence from the same day in an earlier month).
- At M3/M6/M9/M12 it shows the **Arc** first, then the chapters.

### 5.3 `MonthlyPulseWidget` (upgrade of the existing component)

The existing component is kept and three changes are made:

1. Count from `usership.since`, not `joinedAt` (fixes G1).
2. Store dismissal server-side in `metadata.usership.pulseDismissed[]` (fixes G3, matching Cross-Device Sync doctrine).
3. The body shows **affirmation → chapter title → seal unlock line** in order. The existing 1400 ms fade choreography is kept.

```
Month 4:
  Four months. The portrait deepens.
  Chapter IV · The Portrait
  ◇ PORTRAIT · RARE
  4 / 12 months
```

### 5.4 Public profile block (`/u/<user>`)

A new `Usership:` block on `PublicProfile.tsx`, between Board Profile and Memory Story:

```
Usership:   Month 8 of 12 · since March 2026
            · ·: ∴ ◇ ≈ ◐ ◎ △
            Chapters: I–VIII (titles public, text private)
```

The Machiavelli demo gets a 12/12 fixture (see §7), so the endpoint state is always visible.

---

## 6. BADGES: new category "USERSHIP SEASONS" (+17)

This is a ninth category alongside the 8 in Codex v33. It is earned only by tenure × density, and keeps the wiki rule that badges never grant access. The UI evolution is driven by month count, not by badges.

| # | ID | Glyph | Name | Trigger | Rarity |
|---|---|---|---|---|---|
| 1 | `usership_m01_boot` | `·` | BOOT | Month 1 chapter frozen | by tier |
| 2 | `usership_m02_signal` | `·:` | SIGNAL | Month 2 | by tier |
| 3 | `usership_m03_calibrate` | `∴` | CALIBRATE | Month 3 | by tier |
| 4 | `usership_m04_portrait` | `◇` | PORTRAIT | Month 4 | by tier |
| 5 | `usership_m05_rhythm` | `≈` / `├─` | RHYTHM | Month 5 | by tier |
| 6 | `usership_m06_meridian` | `◐` | MERIDIAN | Month 6 | by tier |
| 7 | `usership_m07_listening` | `◎` | LISTENING | Month 7 | by tier |
| 8 | `usership_m08_rare_air` | `△` | RARE AIR | Month 8 | by tier |
| 9 | `usership_m09_ritual` | `✦` | RITUAL | Month 9 | by tier |
| 10 | `usership_m10_architect` | `╞═╡` / `≋` | ARCHITECT | Month 10 | by tier |
| 11 | `usership_m11_compile` | `▣` | COMPILE | Month 11 | by tier |
| 12 | `usership_m12_lot_ai` | `◉` | LOT® AI | Month 12 | by tier |
| 13 | `usership_q1_foundation` | `[∴]` | FOUNDATION | Arc I compiled | RARE |
| 14 | `usership_q2_formation` | `[◐]` | FORMATION | Arc II compiled | RARE |
| 15 | `usership_q3_integration` | `[✦]` | INTEGRATION | Arc III compiled | EPIC |
| 16 | `usership_q4_lot_ai` | `[◉]` | LOT® AI | Arc IV compiled | EPIC |
| 17 | `usership_annual_book` | `⟦◉⟧` | THE BOOK OF YOU | Annual Story compiled | LEGENDARY / MYTHIC |

**"By tier"** means the seal's rarity is set by that month's density (THIN=COMMON, STEADY=UNCOMMON, FULL=RARE, RADIANT=EPIC). Two members both hold `◇ PORTRAIT`, but one holds it as EPIC. This tells each person apart without ranking them.

**Codex delta if shipped:** 843 → 860. Badge v34 "THE DREAM LABORATORY" is planned as a word-turn release, so ship this as a parallel category.

**Unlock messages** follow the codex `↳` style, for example:
`↳ Six chapters sealed. The first half of the year is written. ◐`
`↳ Twelve chapters. One book. It is yours. ⟦◉⟧`

---

## 7. MACHIAVELLI: THE EVOLVED REFERENCE

`/u/machiavelli` is the visible endpoint: 12/12 and beyond, with the Legacy tag. Suggested fixture for the demo route (`public-api.ts:747`): a `usership` object with 12 frozen Florentine chapters. It demonstrates the system to every visitor.

| Ch | Title | One-line paragraph seed |
|---|---|---|
| I | Prologue at Sant'Andrea | Exile begins. He writes each evening, removing the mud of the day before entering his study. |
| II | First Patterns | The evening ritual repeats: courtly robes, four hours with the ancients, no weariness. |
| III | Calibration | He notices fortune governs half of his days and stops pretending otherwise. |
| IV | The Portrait | Virtù, prudence, adaptability: the values he keeps naming without meaning to. |
| V | Rhythm | Mornings in the woods, afternoons at the inn, nights with the dead philosophers. |
| VI | The First Half | Then: a dismissed secretary. Now: a man drafting a book for a prince. |
| VII | What the System Heard | He never writes of his wife on hard days; the silence was the signal. |
| VIII | Rare Air | Self-awareness rises as he admits that the observer of power is also observed. |
| IX | Ritual | "When evening comes, I return home and enter my study." The quote becomes the practice. |
| X | The Architect | The Strategist: sees beneath appearances; patience over impulse. |
| XI | Compilation | Asked what the year should be remembered for, he answers: *understanding, not victory.* |
| XII | The Book of You | A year of exile became a treatise. The portrait is complete and still evolving. |

The demo also shows what lies past Month 12 (**Legacy, L6**): Weather Station, Wallet, a multi-year streak of 1,469 and composite 92.4. Members see a goal, not a ceiling.

---

## 8. ENGINEERING OUTLINE (for the build session)

This section is a plan only; nothing below is implemented in this session.

1. **Data model.** In `user.metadata.usership`:
   ```ts
   usership: {
     since: string              // ISO; set when Usership tag added (G1)
     pausedMonths?: number      // lapsed months do not count toward N
     chapters: MemoryChapter[]  // frozen L3 (G2)
     arcs: MemoryArc[]          // L4 at M3/M6/M9/M12
     book?: AnnualStory         // L5
     pulseDismissed: number[]   // server-side (G3)
   }
   MemoryChapter = { month, title, period, tier, stats{checkins,journal,selfCare,answers},
                     paragraph, affirmation, seal, quote?, frozenAt, version }
   ```
2. **Since backfill.** Set it on `add-tag usership` (`db:admin`). For existing members, backfill from the first Usership-only event, or else from `joinedAt`.
3. **Compiler job.** In `scheduled-jobs.ts`, run daily at 03:00 UTC. For each Usership member whose month anniversary is today:
   - snapshot stats (G4);
   - compute the tier;
   - compile the chapter: Together AI first, `composeLocalStory` as fallback; the prompt follows the PLANNER-CONTEXT order and adds the previous chapter;
   - freeze it;
   - award the seal;
   - log an `usership_chapter` event.
4. **API.** `GET /api/usership/timeline` (chapters, arcs, current month live stats) and `POST /api/usership/pulse/dismiss`. Batch them into one query (Query Batching).
5. **Client.** `UsershipSealWidget` and `MemoryChapterWidget` in `System.tsx` next to MonthlyPulse, with `data-usership-month` on `<html>` for CSS-only progression.
6. **Profile.** Add the `Usership:` block and the Machiavelli 12/12 fixture.
7. **Badges.** A `USERSHIP_SEASONS` array in `src/client/utils/badges.ts` (+17) and Codex v34 accounting.
8. **Lapse rule.** If the tag is removed, the counter freezes and chapters are kept forever. On return, the next month resumes at N+1.

---

## 9. DESIGN PRINCIPLES (summary)

1. **One chapter per month.** The monthly unit of value is a paragraph about the user.
2. **Never failed, only thin.** Calendar time opens a month; signals decide how bright it is.
3. **Frozen memory.** Chapters are not regenerated. The past stays true to itself.
4. **Same room, more light.** The chrome is constant; density, voice and refinement grow.
5. **The user's words, returned.** From Month 9, the AI quotes the person back to themselves.
6. **Visible endpoint.** Machiavelli shows where the path leads, and that it continues past Month 12.

---

*LOT Systems Corporation — Vadim Marmeladov, CEO*
