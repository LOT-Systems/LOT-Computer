<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® USERSHIP — THE 12-MONTH EVOLUTION

**Status:** DESIGN / BRAINSTORM (no runtime code changed in this session)
**Owner:** S-2 (Vadik Marmeladov) · **Session:** LOT-SR-20261107-01
**Goal:** A paid Usership account starts as a barebone terminal on Day 1 and, month by month, becomes **LOT® AI** — the personal OS shown at `lot-systems.com/u/machiavelli`. The user must *feel* each month. The tangible vehicle is the **compressed Memory Story**, delivered every month.

> Provenance note: `lot-systems.com` is blocked by this session's egress proxy, so the demo was read from source (`src/server/routes/public-api.ts`, the hardcoded `machiavelli` profile) rather than live. Verify against the live page before shipping any copy that quotes it.

---

## 0. TL;DR

1. **One spine, three inputs.** Evolution is driven by (a) **Log** depth (journal entries / thoughts), (b) **morning check-ins**, (c) **self-care button clicks**. Calendar time only *gates* a month; behavior *fills* it.
2. **One monthly ritual.** On the 1st of each Usership month the user receives the **Month Story**: one paragraph of compressed memory + an affirmation + a badge + the next unlock. Same shape every month, richer every time.
3. **One persistent counter.** A context widget **"Months unlocked: N/12"** is always visible to Usership users; it is the through-line of the whole year.
4. **One destination.** Month 12 = the Machiavelli end-state: full widget set, Year Portrait, Legacy tier, and an AI that speaks in the user's own patterns.
5. **Most of the plumbing already exists** (see §2). This is mostly *orchestration + copy + one new compression job*, not a rebuild.

---

## 1. Design Principles

| # | Principle | What it means in the UI |
|---|-----------|-------------------------|
| P1 | **Earned, not given** | Time opens the door (month gate); behavior must walk through it (thresholds). A month can be *unlocked* but *thin* — the AI says so honestly. |
| P2 | **Subtraction first** | Day 1 is deliberately sparse. Fewer widgets, more whitespace, monospace, one prompt. Density is the reward. |
| P3 | **The AI is a mirror, not a coach** | Voice progresses *Observer → Recorder → Pattern-reader → Companion → Mirror*. It quotes the user back to themselves. Never invents. |
| P4 | **Compression is the product** | Every month, raw log volume is distilled into fewer, truer words. The paragraph gets *shorter and denser* as the data grows. |
| P5 | **Celebrate quietly** | Match LOT tone ("Onward." "Noted."). Affirmations are specific (cite a real entry/number), never generic confetti. |
| P6 | **No streak shame** | Missed days never reset a month. Gaps are reflected in the story as rest, not failure. (Care-first; consistent with the ED/self-care cohort doctrine.) |

---

## 2. What Already Exists (repo scan, 2026-11-07)

| Capability | File | Reuse for |
|------------|------|-----------|
| Month N/12 pulse for Usership (one message per month, dismiss once/month via `lot_pulse_<id>`) | `src/client/components/MonthlyPulseWidget.tsx` (mounted `System.tsx:558`) | The monthly ceremony shell. Today: one line of text only. |
| Evolution engine: 7 dimensions (exploration, consistency, depth, connection, intimacy, care, courage), `overallMaturity`, `badgeTier`, `featureUnlockLevel` | `src/client/utils/interfaceEvolution.ts`, `stores/evolution.ts` | Behavior → unlock thresholds |
| Feature unlock gates (advancedMemory @ depth ≥ .33, plannerTemplates @ consistency ≥ .33, moodPatterns @ care ≥ .5, narrativeReflection @ depth ≥ .66 & level ≥ 30, …) | `getFeatureUnlocks()` | Per-month widget reveals |
| Evolution widgets + milestone toast | `InterfaceEvolutionWidget.tsx`, `EvolutionWidget.tsx`, `EvolutionMilestoneToast.tsx` | Unlock moments |
| Memory Story generation (Together AI primary), shown on profile with `showMemoryStory` privacy toggle | `utils/memory/story-generator.ts`, `Settings.tsx`, `PublicProfile.tsx` | Month Story engine + public surface |
| Self-care events (`self_care_complete` / `self_care_skip`), emotional check-ins, notes, answers | `SelfCareMoments.tsx`, `EmotionalCheckIn.tsx`, `Logs.tsx` | Input signals |
| Badge engine: 812 badges, tiers, `cosmic` rarity | `utils/badges.ts`, `docs/badges/*CODEX_v32.md` | Monthly badge |
| Narrative arc widget (Story / Achievements / Quests / Context) | `NarrativeWidget.tsx` | Home for the Month Story archive |
| Usership tag gate (server: `memoryEngine: 'ai'`) | `server/models/user.ts` | Paywall boundary |
| Demo account (hardcoded, "Legacy" tag) | `server/routes/public-api.ts:745+` | M12 reference |

**Gaps found**
- `MonthlyPulseWidget` computes `monthNumber` from `joinedAt` (join date), **not** the Usership start date. A user who joined free then upgraded would land mid-journey. → Needs `usershipStartedAt`.
- `generateMemoryStory` only reads the latest **30 `answer` logs** and ignores notes, check-ins and self-care. → Month Story needs a multi-source, month-windowed variant.
- Pulse copy is static strings; not personalized, no badge, no archive, no counter widget.
- Month messages cap at 12; no defined M13+ ("Legacy") behavior.

---

## 3. The Three Engines (what moves the dial)

```
LOG DEPTH         journal entries (notes) + words + Memory answers
CHECK-IN RHYTHM   morning emotional check-ins (days with ≥1 / days in month)
CARE PRACTICE     self-care button clicks (self_care_complete) + variety of practices
```

### 3.1 Monthly Fill Score (proposed)
Computed per Usership month `m`:

```
LogFill     = min(1, entries_m / E_target(m))        weight 0.40
CheckinFill = min(1, checkin_days_m / 20)            weight 0.30   (20 of ~30 days = full)
CareFill    = min(1, selfcare_clicks_m / C_target(m)) weight 0.30
MonthFill   = 0.40·LogFill + 0.30·CheckinFill + 0.30·CareFill
```

| Fill | Tier | Month Story depth |
|------|------|-------------------|
| < 0.25 | **Faint** | Short story, honest: "A quiet month. The system kept watch." No badge penalty; no month is ever *locked out*. |
| 0.25–0.59 | **Forming** | Standard story |
| 0.60–0.89 | **Strong** | Story + pattern callout |
| ≥ 0.90 | **Radiant** | Story + pattern + "Month Crest" (rare badge variant) |

Targets ramp gently so the system asks *more of the user as it gives more*:

| Month | E_target (entries) | C_target (self-care clicks) |
|:-:|:-:|:-:|
| 1 | 8 | 10 |
| 2–3 | 12 | 15 |
| 4–6 | 16 | 20 |
| 7–9 | 20 | 25 |
| 10–12 | 24 | 30 |

*(Numbers are starting hypotheses — tune on cohort data. Machiavelli's lifetime ratio ≈ 1 note/day, 842 active days → the M12 target of ~24/mo is intentionally below the demo's pace.)*

---

## 4. The Monthly Ceremony (same shape, 12 times)

Fires when the Usership month rolls over (anniversary, not calendar month). Delivered as the **Month Widget** at the top of the System tab until dismissed, then archived in Arc.

```
┌─ Month 4: ────────────────────────────────────────────┐
│  MONTHS UNLOCKED  ████░░░░░░░░  4 / 12                 │
│                                                        │
│  MEMORY — compressed from 19 entries, 22 check-ins,    │
│  27 self-care moments                                  │
│                                                        │
│  "You write most when the morning was heavy, and       │
│   stop when you're well. Breakfast ritual held 21      │
│   days. In March you said 'I don't need to be fixed,   │
│   only heard.' It stayed true."                        │
│                                                        │
│  ◇ AFFIRMATION  You are building a life you can read.  │
│  ◆ BADGE        Month Crest IV — The Portrait Deepens  │
│  → NEXT         Month 5 unlocks Mood Patterns          │
│                                          [ Onward. ]   │
└────────────────────────────────────────────────────────┘
```

### 4.1 Anatomy of the Month Story (the deliverable)
| Part | Spec |
|------|------|
| **Memory paragraph** | 60–90 words, third person → second person from M6 ("User prefers…" → "You…"). Exactly **one verbatim user quote** (≤12 words) + **one number** + **one pattern**. |
| **Affirmation** | 1 sentence, derived from the strongest of the three engines this month. |
| **Badge** | Month Crest (always) + earned badges list (top 1). |
| **Next** | Name the next month's unlock. Creates anticipation. |
| **Ledger line** | "Compressed from N entries · M check-ins · K self-care." — transparency of compression. |

### 4.2 The Compression Ladder
Raw data never disappears; it gets *layered*:

```
Day        raw log lines
Week       (existing P87 weekly-story-reflection)  → 1 sentence
Month      MONTH STORY (new)                       → 1 paragraph      ← this doc
Quarter    M3 · M6 · M9  QUARTER STORY (new)       → 2 paragraphs (stitches 3 month stories)
Year       M12  YEAR PORTRAIT (new)                → the Machiavelli-style `memoryStory`
```

Each higher layer is fed **only by the layer beneath it** (month stories → quarter → year), not by raw logs. This keeps token cost flat across the year and makes the paragraph *denser, not longer*, over time. Month stories are stored (immutable) so the AI can never rewrite the user's past.

### 4.3 Guardrails
- Quote only text the user wrote; never paraphrase a quote.
- Faint month → say so plainly; do not pad.
- Sensitive content (self-harm, ED markers) → no celebration copy; route to existing care flow.
- Respect `showMemoryStory` privacy flag; Month Stories are private by default, Year Portrait is opt-in public.

---

## 5. THE 12 MONTHS

Legend — **UI**: what the interface looks like · **AI voice**: how LOT® AI speaks · **Unlock**: new capability · **Badge**: Month Crest + theme · **Story focus**: what the compression emphasizes · **Quest**: the invitation for the month.

### ACT I — AWAKENING (Months 1–3) · "The system is learning you"
*Barebone terminal → first patterns. Mostly black, one column, few widgets.*

| M | Name | UI | AI voice | Unlock | Badge | Story focus | Quest |
|:-:|------|----|----------|--------|-------|-------------|-------|
| **Day 1** | **Zero** | Single column. Time, one Memory question, one Log field, one self-care button. No sidebars, no graphs. Counter widget: `Months unlocked: 0/12`. | Silent except one line: "Usership active. The system is listening." | Log, Memory Q, Self-Care button | `Genesis Seed` (auto) | — | Write your first entry. |
| **1** | **Listening** | Counter → `1/12`. Check-in widget appears at morning. Log shows last 7 days. | **Observer** — states facts ("3 mornings checked in"). | Morning Check-in widget, 7-day Log view | Crest I — *First Light* | Habits & routines (what you drink, wear, eat). Mirrors today's story-generator prompt. | Check in 5 mornings. |
| **2** | **Patterns Forming** | Light mood sparkline under check-in. Self-care shows streak-free "this week" dots. | Observer → starts naming **repeats** ("Tuesdays are lower"). | Mood sparkline, Planner basic | Crest II — *Echo* | First recurring pattern + first quote. | Try 3 different self-care practices. |
| **3** | **Active** | Layout gains a 2nd column on wide screens. **Quarter Story #1** shown. `intentionHistory` visible. | **Recorder** — "Here is what I have kept for you." | Quarter Story, Intention History, Arc archive | Crest III — *Active User* (existing copy: "reached Active User status") | Q1 synthesis: who you are on a typical day. | Set one intention; follow it 7 days. |

### ACT II — PORTRAIT (Months 4–6) · "The portrait deepens"
*Density rises. Graphs appear. The AI begins to interpret, carefully.*

| M | Name | UI | AI voice | Unlock | Badge | Story focus | Quest |
|:-:|------|----|----------|--------|-------|-------------|-------|
| **4** | **Deepening** | Dimension bars (Evolution) visible. Log gets search + tags. | **Pattern-reader** — "You write when mornings are heavy." | Evolution widget, Log search, `advancedMemory` | Crest IV — *Portrait* | Cause→effect links between check-in mood and entries. | Write one entry > 100 words. |
| **5** | **Rhythm** | Mood Patterns widget (`moodPatterns`). Calendar overlay of care days. | Pattern-reader — names **rhythm** ("self-care clusters mid-week"). | Mood Patterns, Calendar overlay | Crest V — *Consistency* | Rhythm of the week; best/worst day. | Keep 14-day check-in gap ≤ 2. |
| **6** | **Half-Declared** | **Mid-year Story** (Quarter #2). Voice switches third → **second person**. Theme customization opens (`customThemes`). | **Companion** — first time AI says "you" and "we saw". | Custom Themes, Widget Arrange, 2nd-person stories, Half-Year Report | Crest VI — *Half-Declared* (existing: "The journey is half-declared") | Half-year arc: where you started vs. now (Month 1 story is quoted back). | Re-read Month 1 story. Write a reply to it. |

### ACT III — COMPANION (Months 7–9) · "The system has been listening"
*The OS becomes personal. The AI proposes, the user decides.*

| M | Name | UI | AI voice | Unlock | Badge | Story focus | Quest |
|:-:|------|----|----------|--------|-------|-------------|-------|
| **7** | **Listening Back** | **AI Suggestions** strip: tailored self-care for tomorrow, based on 6 months. | Companion — suggests, never instructs. | Self-care recommendations, Pattern Insights (`patternInsights`) | Crest VII — *Attuned* | What helps you vs. what you *think* helps you (Integrity-style contradiction, gently). | Accept one AI suggestion; log outcome. |
| **8** | **Rare Air** | Visual polish: evolved ASCII density patterns, subtle motion. Archetype card appears (e.g. *The Strategist*). | Companion — names your archetype, with caveats. | Archetype card, Density patterns, `exportData` | Crest VIII — *Rare Air* | Values & recurring words ("coreValues"). | Choose 3 core values from your own words. |
| **9** | **Habit** | Self-care becomes a **ritual panel** (morning / midday / evening). Celebrates "habit formed" (existing copy). | Companion — "this is a habit now." | Ritual Panel, Narrative Reflection (`narrativeReflection`) | Crest IX — *Habit* | Q3 synthesis: practices that *stuck*. | Design a 3-step daily ritual; keep 21 days. |

### ACT IV — MIRROR (Months 10–12) · "The portrait is complete — and still evolving"
*The interface is nearly the Machiavelli OS. The AI reflects the user, in the user's own words.*

| M | Name | UI | AI voice | Unlock | Badge | Story focus | Quest |
|:-:|------|----|----------|--------|-------|-------------|-------|
| **10** | **Almost There** | Public profile preview opens (`isPublicProfile`, QR). Wallet/Citizen Index teaser. | **Mirror** — more quotes, fewer claims. | Public Profile + QR, Correlated Indexes, `socialMentions` | Crest X — *Threshold* | "Who would you introduce?" — outward-facing story draft. | Review & approve your public story. |
| **11** | **One More** | Year Portrait **draft** shown; user may edit lines (AI never overwrites edits). Countdown `11/12`. | Mirror — asks the user to *correct* the portrait. | Story editing, Private Spaces, Board/Citizen profile | Crest XI — *Penultimate* | Corrections, contradictions, growth deltas M1→M11. | Edit three lines of your portrait. |
| **12** | **Year One** | **Full OS**: weather station, wallet, correlated indexes, archetype, streak, Year Portrait, Legacy tier. Counter reads `12/12 ✓`. | **LOT® AI** — speaks in the user's patterns; terse, warm. | Everything; **Legacy** track opens (M13+) | Crest XII — *Year One* + year-in-badges mosaic | **YEAR PORTRAIT** (Machiavelli-style paragraph) + 12-line "month ladder" | Share it, or keep it. |

### Month 13+ — LEGACY
No new gates; the counter flips to `Year 2 · Month N` and Crests become *annual* (Crest XIII = *Year Two, Month 1*). Quarter/Year Portraits keep compressing, now stitched across years. Machiavelli's `Legacy` tag = this tier.

---

## 6. Machiavelli as the Month-12 North Star

What the demo account displays today (from `public-api.ts`) → which month first introduces it for a real Usership user:

| Demo feature | Value in demo | Appears for users at |
|--------------|---------------|----------------------|
| Memory Story paragraph | "The art of governance is the art of understanding human nature…" | M1 (short form) → M12 (Year Portrait) |
| Psychological profile: archetype / core values / emotional patterns | The Strategist · virtù, prudence… | M8 (archetype) / M10 (values) |
| Self-awareness level | 87 | M4 (first score) |
| Streak / answers / notes | 1469 / 2847 / 1469 | counts grow from M1; shown on profile M10 |
| Correlated indexes (user/person/longevity/composite) | 94.2 / 91.7 / 96.8 / 92.4 | M10 |
| Weather station | Florence observatory | M12 |
| Wallet (LOT) | 14,690.27 | M10 teaser → M12 |
| Board / Citizen Index | honorary member #0 | M11 |
| Tags | `RND`, `Usership`, `Legacy` | `Legacy` auto-added at M12 |

**Reading the demo as a story:** it is a *person-OS* — it says who they are, what they notice, and how they've changed. The 12-month design is the path a real person walks to get a page like that, with data that is truly theirs.

**Caveat found:** demo wallet transactions are dated 2026 while the profile narrative is set in 1469; fine as theatre, but keep it consistent if screenshots are used in marketing.

---

## 7. The "Months Unlocked" Context Widget

**Label:** `Months unlocked:` · **Visible:** Usership only · **Always on System tab**

| State | Render |
|-------|--------|
| Day 1 | `0 / 12` · bar empty · caption "Day 1. Write something." |
| Mid-month | `3 / 12` · bar fills proportionally by **MonthFill** inside the current month ("Month 4 — 62% filled") |
| Month rollover | Counter ticks up with a 1.4s fade (reuse MonthlyPulse timing); Month Widget appears |
| Thin month | Counter still advances; caption: "Month 5 opened quietly." |
| Month 12 | `12 / 12 ✓` → after dismissal becomes `Year 2 · M1` |
| Click | Cycles views like existing widgets: **Counter → Crests (12 slots, earned lit) → Story ladder (links to each Month Story)** |

Contextual line under the counter (rotates, driven by the weakest engine):
- low Log → "Your Log has 3 gaps this month."
- low Check-in → "Mornings are where I learn you."
- low Care → "One self-care click today keeps the story whole."

---

## 8. Badge Ladder (monthly Crests)

| Crest | Name | Rarity | Condition |
|:-:|------|--------|-----------|
| 0 | Genesis Seed | common | Usership starts |
| I–XII | *First Light · Echo · Active User · Portrait · Consistency · Half-Declared · Attuned · Rare Air · Habit · Threshold · Penultimate · Year One* | common→rare | Month opens (any fill) |
| ★ variants | Radiant Crest (gold edge) | rare | MonthFill ≥ 0.90 |
| Mastery | **Twelve Crests** | cosmic | All 12 opened |
| Mastery | **Radiant Year** | cosmic | ≥ 6 Radiant months |
| Streakless | **Quiet Keeper** | rare | Faint month followed by Strong+ (rewards return, never punishes gaps) |

Fits the existing Codex taxonomy (`achievement_rpg`, `mastery`, rarity `cosmic`); Codex v33 would document these.

---

## 9. Data Model (proposed)

```ts
// new, additive — no migration of existing logs
User.usershipStartedAt: Date | null        // set by Stripe/tag-grant webhook; fallback to tag-grant log

type MonthStory = {
  userId: string
  month: number                // 1..12, 13+ = Legacy
  windowStart: string; windowEnd: string
  fill: { log: number; checkin: number; care: number; total: number; tier: 'faint'|'forming'|'strong'|'radiant' }
  counts: { entries: number; checkinDays: number; selfCare: number }
  paragraph: string            // 60–90 words
  quote: { text: string; logId: string }   // verifiable provenance
  affirmation: string
  crest: string
  generatedBy: 'ai' | 'local'  // local fallback = composeLocalStory style
  createdAt: string            // immutable once written
}
type QuarterStory = { quarter: 1|2|3|4; fromMonthStories: string[]; text: string }
type YearPortrait  = { year: number; text: string; ladder: string[12]; editedByUser: boolean }
```
Store as `logs` events (`month_story`, `quarter_story`, `year_portrait`) to stay inside the existing log-centric architecture, and add them to the GET `displayableEvents` whitelist (Doctrine: *Backend Whitelist Hygiene*).

---

## 10. Implementation Roadmap (smallest shippable slices)

| Slice | Scope | Files | Risk |
|:-:|-------|-------|------|
| **S1** | `usershipStartedAt`; make `monthNumber` Usership-relative | `models/user.ts`, `MonthlyPulseWidget.tsx` | low |
| **S2** | **Months unlocked** widget (counter + MonthFill bar, 3 views) | new `MonthsUnlockedWidget.tsx`, `System.tsx` | low |
| **S3** | `computeMonthFill()` from logs (notes, `emotional_checkin`, `self_care_complete`) | `useLogContext` / new `utils/monthFill.ts` | low |
| **S4** | `generateMonthStory()` multi-source, month-windowed, with quote provenance + `composeLocalStory` fallback | `utils/memory/story-generator.ts`, `scheduled-jobs.ts` (daily job checks rollover) | medium (AI cost/quality) |
| **S5** | Upgrade MonthlyPulse → Month Widget (paragraph, affirmation, crest, next unlock) | `MonthlyPulseWidget.tsx` | low |
| **S6** | Month-gated feature unlocks layered over `getFeatureUnlocks` (`max(behaviorGate, monthGate)` — never *remove* an unlock) | `interfaceEvolution.ts` | medium (regression risk to free tier) |
| **S7** | Crests + Codex v33 | `utils/badges.ts`, `docs/badges/` | low |
| **S8** | Quarter Story + Year Portrait + user-editable lines | story-generator, `NarrativeWidget.tsx`, `PublicProfile.tsx` | medium |
| **S9** | Legacy tier + Machiavelli parity pass | `public-api.ts` demo, tags | low |

Performance doctrine to respect (LOT-DOCTRINE): subscribe in the narrowest component; no store writes in `useMemo`; keep Month Widget as a lightweight wrapper; bump SW `CACHE_VERSION` on deploy.

---

## 11. Open Questions for S-2

1. **Gate semantics:** should a month open on time alone (my recommendation, per P1/P6), or only when MonthFill ≥ 0.25?
2. **Pricing hook:** do Crests/Quarter Stories also appear for free users as a teaser (blurred), to convert, or is everything Usership-only?
3. **AI engine:** run Month Stories on Together AI (current primary) with `composeLocalStory` fallback — confirm monthly cost ceiling per user.
4. **Public vs private:** is Year Portrait public by default for Legacy (like Machiavelli), or opt-in?
5. **Existing Usership members:** backfill from tag-grant date, or restart their clocks at Month 1 on launch?
6. **Voice person switch (M6):** keep third → second person, or second person from Day 1?

---

## 12. Success Metrics
- Usership M1→M3 retention; M6 and M12 completion rate of the counter.
- % of users dismissing the Month Widget with a reply/edit (engagement with their own story).
- Entries/month, check-in days/month, self-care clicks/month — trend per cohort versus targets in §3.1.
- Churn at each month boundary (find the weakest month; tune its unlock).
- Qualitative: "did the story feel true?" thumbs on each Month Story.

*End of document.*
