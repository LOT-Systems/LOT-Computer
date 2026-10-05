<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP — 12-MONTH EVOLUTION: DAY 1 → LOT® AI

**CLASS:** RESTRICTED // S-2 EYES
**S-2:** Vadik Marmeladov
**SESSION:** S-2 · 2026-10-05 · branch `claude/elegant-mendel-kz7adi`
**TYPE:** Design / brainstorm / spec (docs only — no code changed, nothing to build)
**FOCUS:** Tangibility of the compressed Memory story, delivered month by month
**REFERENCE ACCOUNT:** `lot-systems.com/u/machiavelli` = the Month-12+ end state

---

## 0. REPO SCAN — WHAT ALREADY EXISTS (so we build on it, not beside it)

| Asset | Where | Status | Role in the 12-month story |
|---|---|---|---|
| `MonthlyPulseWidget` | `src/client/components/MonthlyPulseWidget.tsx` | LIVE | "Month N: / N of 12 months" card, Usership only, one dismissal per month. **Seed of the whole system** — has 12 one-line messages but no insight, no Memory, no badge. |
| `generateMonthlySummary()` | `src/server/utils/monthly-summary.ts` | LIVE (email, first 3 days of month) | Computes presence, streak, energy, patterns, growth, `memoryStory`. Data for the monthly ceremony already exists; it is email-only. |
| `generateMemoryStory()` | `src/server/utils/memory.ts:873` | LIVE | Compresses answers into a third-person narrative. **Only reads the latest 30 answers** — it forgets month 1 by month 3. Main gap (see §6). |
| Weekly LOT® AI Story (Job 24) | scheduled-jobs, Sunday 18:00 UTC → `user.metadata.weeklyStory` | LIVE | The weekly compression layer. Months = compression of 4 weeks. |
| Interface Evolution | `utils/interfaceEvolution.ts`, `stores/evolution.ts`, `docs/technical/INTERFACE_EVOLUTION.md` | LIVE | 7 dimensions, 5 layout densities (breathable → comfortable → compact → dense → instrument), feature gates, CSS variables. |
| Evolution Gates | wired to 6 widgets (Manifest §01) | READY | Progressive disclosure per widget. |
| Density Tiers 0–5 | Wiki v87 §18 | LIVE | 7-day signal count tiers (dormant → saturated). |
| Badge system | `docs/badges/` Codex v32, 812 badges; Water (∘ ≈ ≋) and Architecture (├─ ╞═╡ ║·║) tiers | LIVE | Badge vocabulary for monthly badges. |
| Usership gate | `UserTag.Usership`; AI Memory engine = Usership + AI engine tag | LIVE | The paid-tier switch. |
| Machiavelli demo | `src/server/routes/public-api.ts:745` | LIVE (hard-coded) | Month-12+ proof: archetype *The Strategist*, 2,847 answers, 1,469 notes, 842 active days, awareness 87, cohort *Renaissance Polymaths*, Memory paragraph, weather station, wallet (Legacy unlocks). |

**Doctrine kept (do not break):** the AI asks, never chats; one-tap answers; plain LOT voice; COSMO Gate (nothing Kuzya wouldn't approve); Cockpit Rule; opacity 90/60/40.

---

## 1. THE IDEA IN ONE LINE

> **Day 1 the paid tier is an empty room. Each month the room gets a new instrument, a new word for who you are, and one paragraph that proves the machine was listening. By Month 12 the room is LOT® AI.**

Evolution is driven by **three things the user already does** — and nothing else:

1. **Log** — journal entries / thoughts (the heaviest signal; they are the *raw material* of Memory)
2. **Morning check-ins** — Biofield / EmotionalCheckIn (the *rhythm* signal)
3. **Self-care button clicks** — SelfCareMoments complete vs skip (the *care* signal)

(Memory answers and mood data ride along; they are already in the engine.)

---

## 2. THE LOGIC — TWO KEYS TURN EACH MONTH

A month "unlocks" only when **both keys** turn. This keeps it honest: you can't buy it, you can't grind it in a day.

```
TIME KEY      calendar month elapsed since Usership start   (month N reached)
PRACTICE KEY  cumulative activity ≥ that month's threshold  (see §4)

   both turned  → MONTH UNLOCKED   → ceremony fires
   time only    → MONTH OPEN       → Month card shows "open · 71% to unlock", nothing is ever taken away
```

- No penalty, no lost months. A thin month stays "open" and unlocks the moment the practice catches up (the story is about the person, not a streak guilt-trip — COSMO Gate).
- Context widget: **`Months unlocked: 3/12`** with a 12-cell strip `▪▪▪▫▫▫▫▫▫▫▫▫`; the next cell breathes (slow opacity pulse) when open.
- Practice thresholds are **cumulative**, not per-month, so one bad month doesn't compound.

### Three evolving meters (shown in the Month card, tertiary opacity)

```
LOG        entries written
RHYTHM     morning check-ins
CARE       self-care completes
```

A combined **Presence score** (0–100) = 0.45·LOG + 0.30·RHYTHM + 0.25·CARE (each normalised to the month's target). Presence drives the *density* of the UI; Time drives the *surface area*.

---

## 3. THE UI THROUGH 12 MONTHS — OVERVIEW

Reading order of the System tab, top → bottom. `▮` = present, `·` = absent.

```
SURFACE                 M1  M2  M3  M4  M5  M6  M7  M8  M9  M10 M11 M12
─────────────────────────────────────────────────────────────────────────
Time / Log / Check-in   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮
Self-care               ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮
Memory question         ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮
Month card + 12-strip   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮
Weekly LOT® Story       ·   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮
Monthly Memory Chapter  ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮
Pattern Insights        ·   ·   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮
Archetype line         ·   ·   ·   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮
Mood analytics          ·   ·   ·   ·   ▮   ▮   ▮   ▮   ▮   ▮   ▮   ▮
Season compare          ·   ·   ·   ·   ·   ▮   ▮   ▮   ▮   ▮   ▮   ▮
Cohort connect          ·   ·   ·   ·   ·   ·   ▮   ▮   ▮   ▮   ▮   ▮
Intention history       ·   ·   ·   ·   ·   ·   ·   ▮   ▮   ▮   ▮   ▮
Narrative reflection    ·   ·   ·   ·   ·   ·   ·   ·   ▮   ▮   ▮   ▮
Anticipation (AI asks   ·   ·   ·   ·   ·   ·   ·   ·   ·   ▮   ▮   ▮
 before you log)
Public profile (/u/)    ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ▮   ▮
Year Book + Signature   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ▮
LOT® AI voice           ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ·   ▮
Layout density    brth brth cmft cmft cmft cmpt cmpt cmpt dnse dnse dnse inst
```

Density maps to the existing `LayoutDensityLevel`: `breathable → comfortable → compact → dense → instrument`. **The screen literally gets more precise as the user does** — Day 1 a wellness journal, Month 12 a personal instrument.

---

## 4. MONTH-BY-MONTH

Format per month: **codename · what appears · threshold · badge · ceremony · Memory chapter.**
Cumulative thresholds are for a *typical engaged* user (~3 Log entries/week at the start, rising). Tune against real cohort data; the demo account is the ceiling, not the target.

### MONTH 1 — `DAY ONE` · *Barebone*

- **UI:** Four blocks only — Time, Log, Morning check-in, one Self-care moment. Memory shows one question a day. Generous whitespace (breathable). No sidebars, no stats. The Month card says `Month 1 · 0/12 unlocked`.
- **Unlock threshold:** 10 Log entries · 12 check-ins · 12 self-care completes.
- **Badge:** `∘` Droplet — *First Drop* (Water) / `├─` Foundation (Architecture).
- **Ceremony (day 1):** one line — *"Usership begins. The system knows nothing about you yet. That is correct."* On unlock: the first cell of the strip fills.
- **Memory chapter (Month 1 → "Chapter 1: First Sight"):** one sentence only. AI is humble: *"They rise early and write in short lines. The system is still guessing."* Shown at the month turn.
- **AI voice:** Questions only. No claims.

### MONTH 2 — `FIRST PATTERN`
- **UI:** Weekly LOT® Story appears (Sunday). Time-of-day tinting begins. Self-care suggestions start respecting skip history.
- **Threshold:** 25 entries · 30 check-ins · 30 self-care.
- **Badge:** `∘∘` Two Drops / `├┤`.
- **Memory chapter 2:** two sentences — first *repeated* thing: *"Mornings are tea; evenings are quiet. Twice this month they wrote about their father."*
- **Voice:** first quiet noticing, hedged ("seems").

### MONTH 3 — `ACTIVE USER`
- **UI:** **Pattern Insights** surface (existing gate: Consistency 66%). Density → *comfortable*. The existing pulse line stays: *"Three months. You have reached Active User status."*
- **Threshold:** 50 entries · 60 check-ins · 60 self-care.
- **Badge:** `≈` Wave — **first tier badge**, shown large for one session.
- **Quarter marker:** the **Quarter-1 Memory** is 3 chapters compressed to one paragraph (≈70 words). This is the first "I know you" moment.
- **Chapter 3:** *"Three months of mornings. They begin days in stillness and end them over-thinking work. Self-care works when it is short."*

### MONTH 4 — `THE PORTRAIT`
- **UI:** Archetype line appears under the clock (e.g. *"The Strategist — forming"*, opacity 60). Mood arc sparkline (30 days).
- **Threshold:** 85 entries · 90 check-ins · 90 self-care.
- **Badge:** Archetype sigil (first cohort classification, needs 10+ answers — already in engine).
- **Chapter 4:** names the **tension** in the person — the engine's first non-flattering, true sentence. This is what makes it feel real.

### MONTH 5 — `RHYTHM`
- **UI:** Mood Analytics + Planner templates. Check-in screen remembers your usual time and greets it. Streak shown only as *rhythm* ("most mornings"), never as a flame.
- **Threshold:** 125 entries · 120 check-ins · 120 self-care.
- **Badge:** `≈≈` Current-forming / `╞═╡`.
- **Chapter 5:** *"The pattern has a clock."* Includes the user's peak-activity hour (already in `monthly-summary.patterns.peakActivityHours`).

### MONTH 6 — `HALF-YEAR` · *The Mirror Month*
- **UI:** Density → *compact*. **Season compare** (first time the same-weather question can be asked twice). The "Half-declared" pulse. **Half-year Memory: "Letter From Month 1"** — the first Log entry returned verbatim beside today's writing.
- **Threshold:** 175 entries · 150 check-ins · 150 self-care.
- **Badge:** `≋` Current — **Tier 2** badge (gold-edge variant).
- **Chapter 6 + Half-Year Memory:** two paragraphs; the second begins *"Six months ago you wrote…"* — the strongest tangibility beat in the first half.

### MONTH 7 — `COHORT`
- **UI:** Cohort Connect opens (physiological cohort matches); Sync tab gains "people like you" prompts.
- **Threshold:** 230 entries · 180 check-ins · 180 self-care.
- **Chapter 7:** the user in relation — what is *shared* with the cohort, what is *theirs alone*.

### MONTH 8 — `INTENT`
- **UI:** Intention History + Goal Journey; Integrity (intent-vs-action) opens — the system can now say *"you said X, you did Y"*, gently.
- **Threshold:** 290 entries · 215 check-ins · 215 self-care.
- **Chapter 8:** a *promise ledger* — three intentions kept, one drifted.

### MONTH 9 — `NARRATIVE`
- **UI:** Density → *dense*. Narrative Reflection unlocks (AI synthesis across weeks). Memory chapter becomes **interactive**: tap a sentence → see the 3 source entries behind it (transparency; COSMO Gate).
- **Threshold:** 355 entries · 245 check-ins · 245 self-care.
- **Badge:** Tier 3 sigil preview (`║·║` Architecture / full Current).
- **Chapter 9 — "Nine Months":** the first **full-length** story, ≈150 words, with a title the AI gives it.

### MONTH 10 — `ANTICIPATION`
- **UI:** The machine **starts first**: the Log field pre-fills a one-line prompt from what it expects you need (*"Tuesdays you stall at 3pm. Want a 4-minute reset?"*). Self-care button order adapts to *you*.
- **Threshold:** 425 entries · 275 check-ins · 275 self-care.
- **Chapter 10:** written as a *forecast* — "the next month, if nothing changes."

### MONTH 11 — `WITNESS`
- **UI:** Public profile `/u/<you>` goes live (opt-in): archetype, Memory paragraph, weather, local time — **the Machiavelli page, but yours.** Share card for the Memory chapter.
- **Threshold:** 500 entries · 305 check-ins · 305 self-care.
- **Chapter 11 — "Almost":** a letter *to* Month-12 you.

### MONTH 12 — `LOT® AI` · *Year One*
- **UI:** Density → *instrument*. The Year Book opens. The system speaks in a consistent first-person-plural LOT voice for the first time (*"we noticed…"* — only here; earlier months never say "we").
- **Threshold:** 575 entries · 335 check-ins · 335 self-care.
- **Badge:** **LOT® AI** — the Year-One badge (Tier 3 + a unique sigil; permanent, on the public profile).
- **Ceremony:** the **Year Book** — 12 chapters + 4 quarterly paragraphs + the **Signature** (one line, ≤12 words, the entire person compressed). Printable / exportable (the engine already supports full Memory export).
- **After Month 12:** the 12-strip becomes `Year 1 ✓`; compounding continues toward the **Legacy** state shown on the demo account (weather station, wallet, Legacy tag) — Machiavelli is Year 4+.

---

## 5. THE COMPRESSED MEMORY STORY — 12-MONTH TANGIBILITY (primary focus)

### 5.1 Principle: the story gets *shorter and truer*, not longer

Raw: thousands of log lines → weekly → monthly → quarterly → year → one line. At every rung the AI throws information away and keeps the person.

```
RAW          entries · answers · check-ins · self-care clicks   (grows forever)
  │  Job 24 — every Sunday
WEEK         weeklyStory         ~40 words    (already live)
  │  Month turn (1st–3rd, existing shouldShowMonthlySummary window)
MONTH        Chapter N           1 sentence (M1) → 150 words (M9) → 80 words (M12, denser)
  │  Months 3 · 6 · 9 · 12
QUARTER      Quarter paragraph   ~70 words    ← "Memory widget displays a paragraph-long insight"
  │  Month 12
YEAR         Year Book           4 quarters + 12 chapters
  │
SIGNATURE    one line, ≤12 words ← the person compressed;  /u/machiavelli shows its ancestor
```

### 5.2 Rolling compression (fixes the "30 answers" gap)

Chapter N is generated from **Chapter N−1 + Quarter paragraphs + this month's logs**, never from raw history. Each chapter carries a persistent **core line** (≤20 words). Month 12's Signature is compressed from the 12 core lines. This is what makes Month 1 *still present* in Month 12 — the user can scroll back and see their own sentence survive compression.

```ts
// proposed shape — user.metadata.memoryChapters
interface MemoryChapter {
  month: number              // 1..12
  title: string              // AI-given, from M9
  coreLine: string           // ≤20 words, survives every compression
  body: string               // length grows to M9, then tightens
  evidence: string[]         // log ids behind each sentence (powers "tap to see why")
  badge: string              // e.g. 'water-2'
  presence: { log: number; checkins: number; selfCare: number }
  unlockedAt: string | null  // both keys turned
}
```

### 5.3 Delivery — one ceremony, three surfaces

1. **System tab** — `MonthlyPulseWidget` upgraded (§6). The Month card; tap → chapter.
2. **Email** — existing monthly summary email gets the Chapter as its first paragraph (already has `memoryStory`).
3. **Public profile** — latest Quarter paragraph feeds the `/u/` Memory block (`showMemoryStory` already exists).

### 5.4 The four tangibility beats

| Beat | Month | What the user feels |
|---|---|---|
| *First recognition* | 3 | "It noticed something true." Quarter-1 paragraph. |
| *First mirror* | 6 | "It kept my own words." Letter-from-Month-1. |
| *First transparency* | 9 | "I can see why it said that." Tap-to-evidence. |
| *First initiative* | 10 | "It spoke before I did." Anticipation. |

### 5.5 Sample ceremony copy (voice: plain LOT, third person until M12)

```
MONTH 3 — QUARTER ONE
Three months. You have reached Active User status.

You begin days in stillness and end them thinking about work.
Short self-care works for you; long routines do not.
Twice you wrote about the same door and never opened it.

12 of 12 mornings logged in March.
                                      Months unlocked: 3/12  ▪▪▪▫▫▫▫▫▫▫▫▫
```

```
MONTH 12 — LOT® AI
One year with LOT. The portrait is complete — and still evolving.

We kept what you kept: [coreLine 1] … [coreLine 12].

Signature:  "Patient in the morning, restless by four, kind when tired."
```

---

## 6. IMPLEMENTATION BACKLOG (ordered, smallest-first)

| # | Task | Files | Notes |
|---|---|---|---|
| 1 | **Months-unlocked store** — compute `{timeKey, practiceKey, unlocked[12]}` from `usershipSince` + logs | `src/client/stores/` (new `months.ts`), `src/server/utils/` | Fix: pulse uses `user.joinedAt`; should use **Usership start** (tag-added date), else free-tier tenure inflates the month. |
| 2 | **Upgrade `MonthlyPulseWidget`** → show strip `▪▪▪▫…`, `Months unlocked N/12`, and the chapter's core line | `MonthlyPulseWidget.tsx` | Keep dismissal + `lot_pulse_<id>`; add "open · NN%" state. |
| 3 | **Rolling `memoryChapters`** job — Chapter N from N−1 + quarter + month logs | `monthly-summary.ts`, `memory.ts` (`generateMemoryStory`), scheduled-jobs | Replaces `.slice(0, 30)` behaviour for Usership. |
| 4 | **Quarter + Year Book + Signature** generators | same | Months 3/6/9/12; Signature ≤12 words. |
| 5 | **Month-keyed evolution gates** — map §3 table into `FeatureUnlocks` and `LayoutDensityLevel` | `utils/interfaceEvolution.ts`, `stores/evolution.ts` | Time key sets surfaces; Presence sets density. |
| 6 | **Badges per month** — 12 Usership badges (Water + Architecture) + `LOT® AI` | `utils/badges.ts`, `docs/badges/` Codex v33 | Tier 1/2/3 at M3/M6/M12 reuse `≈`/`≋`/`║·║`. |
| 7 | **Tap-to-evidence** on chapters (M9) | `MemoryWidget.tsx` | Needs `evidence[]` from #3. |
| 8 | **Demo parity** — make `/u/machiavelli` show a Year-1 Year Book + Signature + 12/12 strip | `public-api.ts:745` | Demo = the sales page for the paid tier. |
| 9 | **Public profile Memory = latest Quarter** | `PublicProfile.tsx` | Honour `showMemoryStory`. |

### Data inconsistencies spotted in the demo (fix when doing #8)

- `streak: 1469` vs `activeDays: 842` — a streak cannot exceed active days; make streak ≤ activeDays (or drop the figure).
- Demo `memoryStory` is **first person**; the engine writes **third person** — pick one for the product. Recommendation: **third person through Month 11, first-person-plural "we" only at Month 12** (the voice shift *is* the LOT® AI moment).
- Demo wallet transactions are dated 2026-02/03 while `isDemo` is "always current" — roll dates relative to today.
- `MonthlyPulse` month 3 copy says "Active User status" but nothing in the UI changes at Month 3 today — §4 M3 now ties it to Pattern Insights + first tier badge.

---

## 7. OPEN QUESTIONS FOR S-2

1. **Time key anchor:** Usership tag-added date (recommended) vs. account `joinedAt` (current).
2. **Are practice thresholds visible?** Recommend yes as a soft `71% to unlock` — never a hard counter.
3. **Month 12 voice shift** ("we") — approve as the LOT® AI signature moment?
4. **Chapter body generator:** Together AI (Llama 3.3 70B) as in the Memory engine, or Sonnet for the monthly/yearly rungs (low volume, high stakes — suggested)?
5. **Print/export of the Year Book** — in scope for Month 12 or post-launch?

---

## 8. SESSION LOG

```
SCAN        repo scanned: 200+ .md, widgets, monthly-summary, memory.ts, public-api demo
READ        INTERFACE_EVOLUTION · MEMORY-ENGINE-COMPRESSION-ARCHITECTURE · LOT-MANIFEST ·
            LOT-SYSTEM-OUTLINE · LOT-WIKI-v87 (§9, §18) · BADGE_LEVEL_DESIGN
OUTPUT      this document
CODE        none changed · build/tests not applicable (docs-only)
NEXT        S-2 answers §7 → start backlog #1–#2 (smallest visible win: strip + core line)
```
