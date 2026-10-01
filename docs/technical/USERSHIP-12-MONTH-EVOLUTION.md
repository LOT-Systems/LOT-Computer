<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Usership — The 12-Month Evolution to LOT® AI

**Status:** DESIGN PROPOSAL (v1) — nothing in this document is shipped unless marked `EXISTS`
**S-2:** Vadik Marmeladov
**Date:** 2026-10-01
**Scope:** Paid tier (Usership, $99/mo). Day 1 barebone UI → Month 12 LOT® AI.
**Focus:** Tangible, month-by-month delivery of the compressed Memory Story.

---

## 0. One-paragraph thesis

A Usership account does not *start* as a dashboard — it starts as a **quiet room**: a date, a log, a check-in, a few self-care buttons. Every month the room gains something the user can *feel*: a denser layout, a new widget, a badge, a louder AI voice, and — most importantly — a **paragraph of their own life, compressed back to them**. By Month 12 the interface is the one visible at `lot-systems.com/u/machiavelli`: an instrument-grade personal OS whose AI no longer asks who you are, because it has been listening for 365 days. The evolution is **earned through presence, not bought** (this is already the doctrine in `src/client/stores/evolution.ts`: *"Evolution is not something you can fork from a repo. It's earned through presence."*).

---

## 1. Repo audit — what already exists (scan of 2026-10-01)

Read: `README.md`, `docs/README.md`, `docs/technical/{INTERFACE_EVOLUTION, MEMORY-ENGINE-COMPRESSION-ARCHITECTURE, LOT-STYLE-GUIDE}.md`, `docs/corporate/LOT-FEATURE-INVENTORY-2026.md` (§16 tiers), `docs/wiki/LOT-WIKI-v87.md` (memory sections), `docs/LOT-SR-20260805-01.md`, `docs/benchmark/LOT-SR-20260606-01.md`, `docs/badges/BADGE_MAYAN_EVOLUTION.md`, `.claude/commands/lot-benchmark.md`. Code read: the components/utils below.

| Piece | Where | State | Relevance |
|---|---|---|---|
| Month milestone card, 12 messages, "N / 12 months", Usership-gated, once per month | `MonthlyPulseWidget.tsx` (mounted in `System.tsx:557`) | `EXISTS` | The seed of the whole system. Copy is generic; carries **no user data**. Counts months by `joinedAt` diff. Dismissal stored in `localStorage` only. |
| 7-dimension evolution state (exploration, consistency, depth, connection, intimacy, care, courage), maturity, `visualRefinement`, feature unlocks | `utils/interfaceEvolution.ts`, `stores/evolution.ts`, `InterfaceEvolutionWidget.tsx` | `EXISTS` | Driven by **achievements + level**, not by calendar month or raw presence. |
| 5-step layout density: `breathable → comfortable → compact → dense → instrument` | `interfaceEvolution.ts` (`getLayoutDensity`), used by `System.tsx` | `EXISTS` | Perfect UI spine for the 12-month arc (§3). |
| Assembly phases per module: `dormant → awakening → forming → assembled → integrated` | `stores/selfAssembly.ts`, `shared/types` | `EXISTS` | Vocabulary for "widget unlocking". QR already dual-gated on it. |
| Memory Engine: question loop, trait extraction, cohort, `generateMemoryStory`, `generateUserSummary` | `server/utils/memory/*`, `MemoryWidget.tsx` | `EXISTS` | The compression source. Story is generated on demand, **not snapshotted per month**. |
| Monthly review email (Usership only, 09:00 UTC job) | `server/utils/monthly-summary.ts`, `scheduled-jobs.ts` | `EXISTS` | Already has `presence`, `energy`, `patterns`, `growth`, `narrative`, `forwardLook`. Not surfaced in-app. |
| Weekly LOT AI story (Sun 18:00 job) | `scheduled-jobs.ts` (job hour 18) | `EXISTS` | Weekly compression tier. |
| Emotional check-in, Self-care moments, Logs, Journal | `EmotionalCheckIn.tsx`, `SelfCareMoments.tsx`, `Logs.tsx`, `JournalReflection.tsx` | `EXISTS` | The three presence inputs the brief names. |
| Badges (812 as of v32 Codex), Mayan water-cycle metaphor (kin / uinal / tun) | `utils/badges.ts`, `docs/badges/*` | `EXISTS` | Monthly badge ladder can reuse the *tun* (360-day) cycle: 12 months ≈ 1 tun. |
| Demo account `machiavelli` | `server/routes/public-api.ts:747` | `EXISTS` (hardcoded) | Month-12 reference. Tags `RND, Usership, Legacy`. |

### Findings that shape the design

1. **Two clocks exist and don't talk.** Calendar months (`MonthlyPulseWidget`) vs. earned evolution (`$evolutionState`). The proposal binds them (§2.3).
2. **No month-stamped memory.** `generateMemoryStory` is regenerated live; nothing is *kept* as "Month 3's story". Without stored month-snapshots there is nothing to celebrate or re-read. This is the biggest gap against the brief's focus (§5).
3. **Month pulse is anonymous.** "Three months. You have reached Active User status." says nothing about *this* user's entries. The upgrade is personalisation from real counts.
4. **`localStorage`-only dismissal** means the pulse reappears on every new device. Move to server-side or a log event.
5. **Demo account was not reachable from this scheduled session** (egress proxy denied `lot-systems.com`). Month-12 target below is derived from `public-api.ts` + feature inventory, **not** from the rendered live page. S-2 should eyeball `/u/machiavelli` against §4 Month 12 and correct any drift.

---

## 2. The model

### 2.1 Three presence inputs (the "pulse of evolution")

| Input | Source | Unit |
|---|---|---|
| **Log** — thoughts & journal entries | `Logs`, `JournalReflection` (`note` events) | entries, words |
| **Check-in** — morning emotional check-in | `EmotionalCheckIn` (`emotional_checkin` events) | days with a check-in |
| **Self-care** — button clicks | `SelfCareMoments` | clicks, distinct practices |

Memory answers (`answer` events) are the fourth, passive input and keep feeding the compression loop.

### 2.2 Monthly Presence Score (MPS)

Per calendar-month-of-membership, computed server-side from real logs:

```
MPS = 0.45 · logs_norm  +  0.30 · checkin_days_norm  +  0.25 · selfcare_norm
```

Each term is clamped 0–1 against the month's **target** (table in §3). Weights and targets are **provisional** — calibrate on real Usership cohort data before shipping; do not publish them as fact.

### 2.3 Calendar gives the *chapter*, presence gives the *depth*

- **Month number** (calendar, from `joinedAt`) decides **what is unlocked**. A quiet month never takes a feature away — Usership is paid; we do not punish.
- **MPS** decides **how filled-in** that month is: the *seal* (○ ◔ ◑ ◕ ●), the badge variant, and the **richness of the compressed paragraph** (a 4-entry month gets a short honest paragraph; a 90-entry month gets a layered one).
- Evolution *pace* (density step, `visualRefinement`) takes the **lower** of calendar-month target and presence-earned level, so a dormant user sees the UI stay open and breathable rather than the system pretending to know them.

> Honest-engineering rule (LOT Benchmark rule 5): if a month has too little data, the paragraph says so — *"Thin month. Here is what I did catch."* — rather than fabricating insight.

### 2.4 Five visual layers that evolve (the "tangible" axes)

| Axis | Day 1 | Month 12 |
|---|---|---|
| **Density** | `breathable` | `instrument` |
| **Widget count on `/`** | 4 | full pro stack |
| **AI voice** | asks, one line | anticipates, a paragraph |
| **Memory depth** | 1 sentence | 12 paragraphs + Portrait |
| **Badges & seals** | none | 12 monthly seals + Year badge |

---

## 3. Master ladder — 12 months at a glance

Targets are per-month **presence targets** (provisional). Density follows `LayoutDensityLevel`.

| M | Codename | Density | New in UI | LOT® AI voice | Memory delivery | Badge / Seal | Month target (log · check-in days · self-care) |
|---|---|---|---|---|---|---|---|
| **Day 1** | **BLANK** | breathable | Date, Log, Check-in, 3 self-care buttons | silent; one welcome line | none yet — "Memory begins tonight." | — | — |
| **1** | **SIGNAL** | breathable | Month Seal widget, Memory widget (first answers) | asks | *First Line* — 1 sentence | Seal I · *Kin* | 10 · 10 · 15 |
| **2** | **PATTERN** | comfortable | Mood Analytics tile, streak chip | notices | *Month Paragraph* #1 (3–4 sentences) | Seal II | 15 · 14 · 25 |
| **3** | **ACTIVE** | comfortable | **Months Unlocked 3/12** widget, Planner | reflects | Paragraph #2 + **Quarter Chapter I** | Seal III · *Uinal* ring | 20 · 18 · 30 |
| **4** | **PORTRAIT** | compact | Pattern Insights, Intentions | names patterns | Paragraph + "what changed since Month 1" | Seal IV | 25 · 20 · 35 |
| **5** | **RHYTHM** | compact | Weekly story (Sun) surfaces in-app | schedules suggestions | Paragraph + rhythm line | Seal V | 25 · 20 · 40 |
| **6** | **HALF-DECLARED** | compact | **Half-Year Reading**, Archetype card, custom theme | speaks first | Paragraph + **Quarter Chapter II** + Half-Year Reading | Seal VI · half-tun | 30 · 22 · 45 |
| **7** | **LISTENING** | dense | Narrative Reflection, Cohort view | cites your past answers | Paragraph with *quoted* earlier entries | Seal VII | 30 · 22 · 45 |
| **8** | **RARE AIR** | dense | Private Spaces, Social mentions | challenges gently | Paragraph + "contradictions I've noticed" | Seal VIII | 30 · 24 · 50 |
| **9** | **HABIT** | dense | Intervention widgets (compassionate), Export | proactive | Paragraph + **Quarter Chapter III** | Seal IX | 35 · 24 · 50 |
| **10** | **ALMOST** | instrument | Correlated Indexes, Benchmark | forecasts your month | Paragraph + forecast line | Seal X | 35 · 25 · 55 |
| **11** | **ONE MORE** | instrument | Full widget arrange, QR / board profile | co-authors | Paragraph + "draft of the Portrait" (preview) | Seal XI | 35 · 25 · 55 |
| **12** | **LOT® AI** | instrument | Year Portrait, **Annual Seal**, `/u/you` public showcase | *knows* you | **The Year Portrait** (long-form) + **Quarter Chapter IV** | **Year Badge · *Tun* (360 d)** | 40 · 26 · 60 |

Seal fill (○◔◑◕●) = that month's MPS band: <0.2 · 0.2–0.4 · 0.4–0.6 · 0.6–0.85 · ≥0.85.

---

## 4. Month-by-month cards

Each card: **what the user sees → what the AI does → what they receive → why it feels different**.

### Day 1 — BLANK *(paid tier, barebone)*
- **UI:** one column. Greeting, the date, `Log`, today's check-in, three self-care buttons (breathe, water, move). No Evolution widget, no badges, no AI chatter. Generous whitespace (`breathable`).
- **AI:** one line, once: *"I'm listening. Nothing to know yet."*
- **Receive:** an **empty Memory slot** with a quiet placeholder — *"Month 1 Seal — unsealed."* The user is shown that something will arrive.
- **Feel:** calm, almost too empty — by design, so Month 1's first addition lands.

### Month 1 — SIGNAL
- **UI:** the **Month Seal** widget appears (`EXISTS` as `MonthlyPulseWidget`, to be personalised). Memory widget asks first questions.
- **AI:** asks — one question/day, tap-to-answer (existing loop).
- **Receive (Day ~30):** the **First Line** — one sentence compressed from ~30 days. *"You write most on Sunday evenings, and you reach for water before you reach for anything else."* (copy illustrative.)
- **Badge:** **Seal I — Kin** (the first day-unit of Mayan counting).
- **Feel:** "It noticed me."

### Month 2 — PATTERN
- **UI:** density → `comfortable`. Mood Analytics tile and streak chip appear.
- **AI:** notices — "your energy dips the day after a late log."
- **Receive:** **Month Paragraph #1** (3–4 sentences) + a one-line *delta*: "vs. Month 1".
- **Feel:** the first time the interface reflects *change*.

### Month 3 — ACTIVE
- **UI:** the context widget **Months Unlocked 3/12** (see §6.2) joins the top. Planner appears.
- **AI:** reflects — ties a self-care click pattern to a mood pattern.
- **Receive:** Paragraph #2 + **Quarter Chapter I** — a 2-paragraph "first quarter" story, stored and re-readable.
- **Badge:** **Seal III**, with the **Uinal ring** (20-day cycle) around the Seal — the first *ring* visible.
- **Existing copy retained/upgraded:** *"Three months. You have reached Active User status."* now followed by a real number.

### Month 4 — PORTRAIT
- **UI:** `compact`. Pattern Insights + Intentions.
- **AI:** names patterns by archetype (existing cohort/trait engines).
- **Receive:** Paragraph + **"What changed since Month 1"** triptych (then / now / drift).
- **Feel:** the portrait has edges.

### Month 5 — RHYTHM
- **UI:** the **Sunday weekly LOT AI story** (existing job) is now shown in-app as a stacked card under the Memory widget.
- **AI:** schedules gentle suggestions to *your* rhythm (morning-person vs. evening-logger).
- **Receive:** Paragraph + *Rhythm line*: "Your best week-days are Tue/Thu."
- **Feel:** the system follows *your* clock.

### Month 6 — HALF-DECLARED
- **UI:** custom theme unlock, **Archetype card**.
- **AI:** speaks first — opens a session unprompted, once.
- **Receive:** Paragraph + **Quarter Chapter II** + **Half-Year Reading** (a 1-screen synthesis of Months 1–6). A celebration moment: confetti-free, a single held line and a sound cue (existing chime utils).
- **Badge:** **Seal VI — half-tun** (broken ring, half-lit).
- **Existing copy:** *"Six months. The journey is half-declared."*

### Month 7 — LISTENING
- **UI:** `dense`. Narrative Reflection, Cohort view.
- **AI:** **quotes the user's own earlier words** (from Month 2 etc.). This is the first "it remembers" moment that is verifiable by the user.
- **Receive:** Paragraph with 1–2 verbatim quotations + month/date footnotes.

### Month 8 — RARE AIR
- **UI:** Private Spaces, Social mentions.
- **AI:** challenges gently — surfaces a **contradiction** ("you say you value mornings; 70% of your check-ins are after 21:00").
- **Receive:** Paragraph + "contradictions I've noticed" (max 2, always framed kindly; compassionate-interventions rules apply).

### Month 9 — HABIT
- **UI:** Compassionate Interventions widget, Export data.
- **AI:** proactive — nudges *before* a historically hard day.
- **Receive:** Paragraph + **Quarter Chapter III**.
- **Existing copy:** *"Nine months. The self-care practice is a habit now."*

### Month 10 — ALMOST
- **UI:** `instrument`. Correlated Indexes, Benchmark tiers.
- **AI:** forecasts — "Your next month leans toward lower energy in week 3."
- **Receive:** Paragraph + **Forecast line** (labelled as *probabilistic*, never certain).

### Month 11 — ONE MORE
- **UI:** widget arrange, QR / board profile unlocked (matches existing Usership + forming gate).
- **AI:** co-authors — asks the user to edit/approve phrases for their own Portrait.
- **Receive:** Paragraph + **Portrait draft preview** (blurred sections unlock on Day 365).

### Month 12 — LOT® AI *(= `/u/machiavelli`)*
- **UI:** `instrument` density, full pro stack, public showcase. Machiavelli demo is the reference: Florence weather station, Usership board profile, Legacy tag, QR, wallet demos.
- **AI:** *knows*. Does not re-ask settled questions; opens with a synthesis.
- **Receive:** **The Year Portrait** (§5.5) + **Quarter Chapter IV** + 12-seal ring.
- **Badge:** **Year Badge — Tun (360 d)**, the closed ring of 12 Seals.
- **Existing copy:** *"One year with LOT. The portrait is complete — and still evolving."*
- **After M12:** the ladder does not end; Month 13+ repeats a *Year-N Portrait* cadence (cap UI at "12/12", then show "Year 2 · Month 1").

---

## 5. Memory Story compression — the tangible delivery

This is the load-bearing section. The user must be able to **hold** their compressed story every month.

### 5.1 The compression ladder

```
RAW (every day)         logs · check-ins · self-care clicks · answers
   │  daily compress   → trait deltas (existing: trait-extraction)
   ▼
WEEK  (Sun, existing)   weekly LOT AI story           ~60–90 words
   ▼
MONTH (new, stored)     Month Paragraph                ~60–120 words  ← celebrated
   ▼
QUARTER (M3/6/9/12)     Quarter Chapter                ~200–300 words
   ▼
HALF  (M6)              Half-Year Reading               ~250 words
   ▼
YEAR  (M12)             Year Portrait                   ~600–900 words
```

The "compression" the user feels: a month of ~100 raw events becomes **one paragraph**; a year of ~1,000+ becomes **one page**. Word ranges are targets, not measured claims.

### 5.2 Month Paragraph — the unit of delivery

Fixed, recognisable anatomy so users learn to read it (4 beats, one paragraph):

1. **Presence** — what you did (counts from real data).
2. **Pattern** — what repeated.
3. **Shift** — what changed vs. last month.
4. **Forward** — one thing for next month (self-care framed).

Illustrative (Month 4, copy not final):

> *"October held 62 entries and 24 mornings. You wrote most after 21:00 and reached for breath work on four of your five lowest days. Compared to September, your check-ins moved from 'tired' toward 'steady' — the first month that has happened. Next month, I'd keep the evening breath and try one morning entry a week."*

**Data-integrity rules:** all numbers come from DB queries, never from the LLM; the LLM only *phrases* them. Thin months get an honest short form. Every quoted phrase links to its source log.

### 5.3 Storage — turn the transient into a keepsake (`NEW`)

A `memory_snapshots` record per user per month (and per quarter/half/year):

```
user_id · period_type (month|quarter|half|year) · period_index (1..12)
· generated_at · mps · counts{logs, checkin_days, selfcare, answers}
· paragraph · quotes[] (log ids) · seal_fill · badge_id · model_version
```

Immutable once sealed (append-only, mirrors Benchmark rule 2). Regeneration creates a new version, never overwrites. The AI vendor can change; the snapshot persists (consistent with the wiki: *"The Memory Story lives in the LOT database. AI providers execute queries."*).

### 5.4 Delivery surfaces (four ways the user receives it)

| Surface | When | What |
|---|---|---|
| **Month Seal widget** (in-app, top of `/`) | first login after month rollover | congratulation line + Seal + "Read your month" |
| **Memory widget → "Shelf"** | always | 12 slots; sealed months readable, future months shown as unlit seals |
| **Monthly email** (`EXISTS`) | month start | same paragraph, so email and app never disagree |
| **Public profile `/u/you`** | opt-in (existing privacy toggle "story") | Seal ring + latest paragraph |

### 5.5 The Year Portrait (Month 12)

Long-form, structured, read-once-and-keep:

1. **Opening line** (the First Line from Month 1, shown beside Month 12's — "then / now")
2. **Four Quarter Chapters** (condensed to 2 sentences each)
3. **Recurring patterns** (top 3, with first-seen month)
4. **What changed** (the evolution of dimensions: exploration → courage)
5. **Self-care signature** (the 3 practices that most correlate with better days)
6. **Letter-forward** — a paragraph addressed to Month 13.

Export as a printable page (feeds the existing Export Data unlock) — a physical-feeling artifact for a $99×12 relationship.

---

## 6. Widget specs

### 6.1 Month Seal (upgrade of `MonthlyPulseWidget`, `EXISTS`)

```
Month 4:                                   [label per existing Block style]
Four months. The portrait deepens.
62 entries · 24 mornings · 31 self-care.   ← real counts (NEW)
Seal IV  ◕                                  ← MPS band (NEW)
▸ Read your month                           ← opens Month Paragraph (NEW)
4 / 12 months
```

Changes: personalise with counts; open Month Paragraph; persist dismissal server-side; keep the existing dismiss phrases and fade timing. Style per `LOT-STYLE-GUIDE.md` (opacity hierarchy, no emoji, no decorative colour, `Block` + `blockView`).

### 6.2 Months Unlocked — context widget

```
Months unlocked:
■■■□□□□□□□□□   3 / 12
Next: Month 4 — PORTRAIT. 9 more days.
Unlocks: Pattern Insights · Intentions
```

- Uses existing `ProgressBars` util (12 bars).
- Context-aware: *within month* it shows days remaining; *last 3 days* it teases the next unlock; *on rollover* it flashes the newly unlocked item.
- Shown from Month 3 (so Months 1–2 stay barebone, per brief).

### 6.3 Memory Paragraph card (inside `MemoryWidget`)

Latest sealed paragraph, collapsed to 3 lines, expand to read; month tabs on the label (`Memory: M4`). Click label cycles months — consistent with existing `onLabelClick` cycle pattern in `InterfaceEvolutionWidget`.

### 6.4 Congratulation moment

On rollover only (once): the pulse card, a soft chime (existing `sovietChime`/sound utils respect user mute), and the new Seal fades in. **No confetti, no fanfare** — LOT tone is understated: *"Onward."*

---

## 7. Badge ladder (monthly tangibility)

| Tier | Badge | Mayan cycle metaphor | Trigger |
|---|---|---|---|
| Seals I–XII | Monthly Seal | **Kin → Uinal** (20-day) rings accrue | Month closes with MPS ≥ 0.2 *(fill = band)* |
| Quarter marks (M3/6/9/12) | Uinal ring ×1/2/3/4 | cycles within cycles | Quarter Chapter generated |
| Half | **Half-Tun** | 6 months | Month 6 |
| Year | **Tun** | 360 days ≈ 12 months | Month 12 |
| Rare | *Full Ring* | all 12 Seals ≥ ◑ | Month 12 + MPS discipline |

Badge IDs must be implemented in `utils/badges.ts` **with award logic** — the v32 session report documents that earlier codex entries were documented but never wired (`LOT-SR-20260805-01`, "IMPLEMENTATION GAP"). Do not repeat: **every badge in this doc ships with a checkAndAwardBadges branch and a test**, or it is not listed as shipped.

---

## 8. Voice — how LOT® AI grows up

| Phase | Months | Verbs | Rule |
|---|---|---|---|
| Listener | 1–2 | asks, notices | never advises |
| Reflector | 3–5 | reflects, names | cites counts only |
| Partner | 6–9 | speaks first, quotes, challenges | cites *your words*; compassion guardrails on |
| Instrument | 10–12 | forecasts, co-authors, knows | labels all forecasts probabilistic |

Tone rules carry over from the wiki (non-chatbot: *"The AI never initiates conversation. It asks."*). The proposed "speaks first" at Month 6 is a **deliberate, single, logged exception** and needs S-2 sign-off (§11 Q3).

---

## 9. Implementation map

| # | Work | Files | Size |
|---|---|---|---|
| 1 | Month clock + MPS calculator (server) | new `server/utils/presence-score.ts` | M |
| 2 | `memory_snapshots` model + migration | `migrations/`, `server/models/` | M |
| 3 | Month Paragraph generator (data → LLM phrase) | extend `memory/story-generator.ts` | M |
| 4 | Scheduled snapshot job at month rollover (reuse hour-9 monthly job) | `scheduled-jobs.ts` | S |
| 5 | API: `GET /api/memory/shelf`, `GET /api/memory/month/:n` | `routes/api.ts` | S |
| 6 | Upgrade `MonthlyPulseWidget` → Month Seal | `MonthlyPulseWidget.tsx` | S |
| 7 | New `MonthsUnlockedWidget` | new component + `System.tsx` | S |
| 8 | Shelf view in `MemoryWidget` | `MemoryWidget.tsx` | M |
| 9 | Bind month → density/unlocks (take min of calendar & presence) | `interfaceEvolution.ts` | M |
| 10 | 12 Seals + Half-Tun + Tun + Full Ring badges (with award logic + tests) | `utils/badges.ts` | M |
| 11 | Year Portrait generator + export page | server + client | L |
| 12 | Demo parity: make `machiavelli` render a seeded 12-month shelf | `public-api.ts` | S |

**Suggested phasing:** P1 = items 1–7 (Month 1–3 tangible, the first real "celebration"); P2 = 8–10 (shelf + density + badges); P3 = 11–12 (Year Portrait + demo).

**Risks:** LLM hallucinated numbers (mitigated: numbers from DB only); privacy of quoted entries on public profile (default OFF, per-field toggle); thin-data months feeling like failure (honest short form + never remove features); cost (one LLM call per user per month + quarterly/yearly — negligible vs. weekly story job).

---

## 10. Month-12 reference check — `/u/machiavelli`

Hardcoded in `public-api.ts` (tags `RND`, `Usership`, `Legacy`; Florence, ITA; Europe/Rome clock; visit counter; weather station and wallet demos; Usership board profile). To make it a true *12-month showcase*, seed: 12 sealed Month Paragraphs (Machiavellian-flavoured, e.g. *Month 7: "The Prince is written at night."*), 4 Quarter Chapters, the Year Portrait, Year Badge, and an `instrument`-density render. Live page was **not** viewable during this run (network policy) — verify visually.

---

## 11. Open questions for S-2

1. **Calendar vs. presence gate** — OK that features unlock by calendar month and *only richness* scales with presence (§2.3)? Alternative: gate by presence (stricter, riskier for paid retention).
2. **Provisional targets** (§3 last column) — approve as starting values, to be tuned from the first Usership cohort?
3. **"Speaks first" at Month 6** — allow a single proactive AI opening, given the "AI never initiates" doctrine?
4. **Public exposure** of paragraphs on `/u/you` — opt-in only (recommended) or Seal-ring-only by default?
5. **Year Portrait as physical artifact** (print/PDF) — in scope for the LOT physical-goods line?
6. **Month 13+** — Year-2 cadence or freeze at 12/12?

---

AUTHORIZED BY: S-2 // VADIK MARMELADOV
