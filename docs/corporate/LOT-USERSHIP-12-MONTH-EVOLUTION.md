<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP — 12-MONTH EVOLUTION
## From barebone Day 1 to LOT® AI · The compressed Memory story, month by month

```
S-2:        VADIK MARMELADOV
DOCUMENT:   LOT-USERSHIP-12-MONTH-EVOLUTION
CLASS:      DESIGN SPEC // PROPOSAL (not shipped code)
DATE:       2026-10-12
SESSION:    S-2 scheduled brainstorm
REFERENCE:  https://lot-systems.com/u/machiavelli  (demo account = evolved end-state)
STATUS KEY: [LIVE] exists in repo today · [GAP] missing · [PROPOSED] new in this spec
```

---

## 0. READ THIS FIRST

**The one-sentence product.** A Usership member pays $99/month and, every month, receives
something they can *see*: a denser interface, a new capability, a badge, and a
paragraph-long compression of their own last month.

**The tangibility rule.** If a user cannot tell Month N from Month N+1 in a
five-second glance at their System tab, the month failed. Every month must add:

1. one **visible change** to the interface,
2. one **earned artifact** (Seal badge + Memory paragraph),
3. one **new AI behavior** the user can notice,
4. one **number that moved** (`Months unlocked: N/12`).

**Honesty note.** All thresholds below are *provisional design values*, not measured
retention data. Retention or conversion claims in this document are hypotheses to test.

---

## 1. WHAT THE REPO ALREADY GIVES US (scan result, 2026-10-12)

Scanned: README, docs/README, product brief, Memory Engine compression architecture,
Interface Evolution spec, LOT-DOCTRINE, LEXICON, LEDGER, MANIFEST, WIKI-v87, feature
inventory, plus the code below. ~380 `.md` files exist; the ones above are the ones
that bear on this feature, the rest are session-report history.

| Building block | Where | State | Use in this spec |
|---|---|---|---|
| `MonthlyPulseWidget` — "Month N: / N/12 months", 12 one-line messages, per-month dismiss in localStorage, Usership-gated | `src/client/components/MonthlyPulseWidget.tsx` | [LIVE] | Becomes the **Month Card** (§4). Today it is one line; it should carry the Memory paragraph. |
| Month counted from `joinedAt` (account creation) | same file | [GAP] | A free user who upgrades in month 8 would start at "Month 8". Needs a **Usership start date** (§8). |
| Layout density tiers `breathable → comfortable → compact → dense → instrument` | `interfaceEvolution.ts`, `System.tsx` | [LIVE] | The visual spine of the 12 months (§3). |
| Paid layout is the *same full layout* for R&D and Usership from day 1 | `System.tsx` (`isPaidAccount`) | [GAP] | Day 1 is not barebone today. Needs a month-gated layout. |
| Feature unlocks (advanced memory, templates, themes, export, narrative reflection…) gated by level/achievements | `interfaceEvolution.ts`, `INTERFACE_EVOLUTION.md` | [LIVE] | Re-map to calendar months (§5). |
| Weekly story job: counts check-ins / self-care / intentions / notes → `lot_ai_story` log event + `weeklyStory` in user metadata (Job 24, Sun 18:00 UTC) | `scheduled-jobs.ts` | [LIVE] | The **week layer** of the compression ladder (§6). Note: `weeklyStory` is overwritten weekly; only the log events keep history. |
| Monthly email summary, 1st of month 09:00 UTC | `scheduled-jobs.ts` | [LIVE] | Same trigger window for the **month layer**. |
| `story-generator.ts` / `composeLocalStory` — Memory Story from answer logs; Together AI primary | `src/server/utils/memory/` | [LIVE] | Engine for month paragraphs. |
| Aquatic badges Droplet (D7) → Wave (D30) → Current (D100); Badge Codex v32 = 812 badges | `badges.ts`, codex v32 | [LIVE] | In-month micro-badges. **Month Seals** (§7) are a new, separate series. |
| Citizen Index, 6 stages (Bootstrapping → Transparent) | feature inventory | [LIVE] | Sub-label on the Month Card. |
| Demo `/u/machiavelli`: Legacy tag, `streak: 1469`, `activeDays: 842`, `selfAwarenessLevel: 87`, one-paragraph `memoryStory`, Florence weather | `public-api.ts` | [LIVE] | End-state reference. Static today (§9). |
| Doctrine: *no unprompted notifications*; *one question at a time*; COCKPIT-RULE; Military Purity (no emojis) | product brief, DOCTRINE, LEXICON | [LIVE] | Hard constraints on every month below. |

**Biggest gap found:** the demo shows the finished product, but nothing shows the road.
`/u/machiavelli` is at ~48 months (streak 1469), so it cannot honestly stand in for
"Month 12". §9 proposes a time-scrubber that fixes this.

---

## 2. THE TWO KEYS — TIME SETS THE CEILING, PRACTICE CLIMBS TO IT

A month "unlocks" by **calendar** (you paid for it; it always arrives). What fills it
is **practice**. This avoids punishing a bad month while keeping the interface honest.

```
Months unlocked : N / 12        <- calendar, from Usership start. Never decreases.
Month depth     : Quiet | Present | Dense   <- practice during that month
Interface level : min( time ceiling , practice level )
```

### 2.1 The four signals (the user's stated priority)

| Signal | Source today | Weight |
|---|---|---|
| **L — Log entries** (notes + journal) | `note`, `journal` events | 40% |
| **C — Morning check-ins** (days with ≥1 `emotional_checkin` before noon local) | `emotional_checkin` | 25% |
| **S — Self-care clicks** | `self_care_complete(d)` | 20% |
| **M — Memory answers** | `answer` | 15% |

Log is weighted highest because journal text is the raw material the compression
reads; without it the Memory paragraph can only count, not narrate.

### 2.2 Month depth (provisional thresholds, per calendar month)

```
Quiet    : < 8  total signals          -> story says so, plainly, without guilt
Present  : 8-59 signals                 -> normal story
Dense    : >= 60 signals AND >= 10 morning check-in days AND >= 6 log entries
```

A **Quiet** month still unlocks and still gets a paragraph — an honest short one
("Few signals this month. The system held what it had."). Doctrine: *an honest
"trend: shorter" beats a made-up metric.* Never invent warmth the data does not hold.

### 2.3 Interface level

```
timeCeiling(month)  = month 1-2 -> breathable ... month 12 -> instrument
practiceStep        = from trailing-30-day depth (Quiet = -1, Present = 0, Dense = 0)
interfaceLevel      = timeCeiling + practiceStep   (practice can hold you one tier
                                                    below the ceiling, never above it)
```

Reading: Present and Dense members sit at the ceiling; a Quiet member sits one tier below it and
sees a one-line nudge ("A Present month restores the next tier"). Nothing is ever *removed* —
only held back. Graceful Degradation doctrine applies: if the computation errors, the
field stays absent and the client treats absence as "allow", never "locked".

---

## 3. THE FOUR QUARTERS (the visual spine)

```
MONTH   1    2    3    4    5    6    7    8    9    10   11   12
DENSITY ░░░░░░░░ ▒▒▒▒▒▒▒▒▒▒▒▒ ▓▓▓▓▓▓▓▓▓▓▓▓ ████████████ ██
        breath.  comfortable   compact       dense       instrument
        Q1 ROOTS    Q2 SIGNAL      Q3 PATTERN        Q4 VOICE
        Observe+Ask  Recall+Name    Anticipate+Guide  Reflect+Author
```

| Quarter | Name | Density | AI verb | The user feels |
|---|---|---|---|---|
| Q1 M1-3 | **ROOTS** | breathable → comfortable | *Asks* | "It is learning me." |
| Q2 M4-6 | **SIGNAL** | comfortable → compact | *Recalls, names patterns* | "It remembers what I said." |
| Q3 M7-9 | **PATTERN** | compact | *Anticipates, guides* | "It sees what I'm about to need." |
| Q4 M10-12 | **VOICE** | dense → instrument | *Reflects, authors* | "It can tell my story back to me." |

Wordmark rule [PROPOSED, decision for S-2]: the AI has **no name** in the UI for
Months 1-11 — only questions. The name **LOT® AI** appears first on the Month 12
Year Portrait signature, and from then on in the System header. The product
*becomes* LOT® AI in front of the user instead of being labelled that on Day 1.

---

## 4. THE MONTH CARD (the recurring ritual)

Evolves the existing `MonthlyPulseWidget`. Same `Block` primitive, same top-of-System
slot, same fade-in. **No push, no email nag** — it appears in place when the user
opens the System after the month boundary (product-brief principle).

```
┌─ Month 4: ─────────────────────────────────────────────┐
│  Months unlocked: 4/12   [■■■■□□□□□□□□]   Q2 SIGNAL     │
│                                                         │
│  Month 3 compressed (2,140 words -> 71):                │
│  "March was a month of early mornings and short, honest │
│   entries. Tea before reading came back eleven times.   │
│   You wrote most when the weather turned. The system    │
│   notes: your best days began before eight."            │
│                                                         │
│  Seal IV earned · Dense · 14 log · 22 check-ins ·       │
│  31 self-care · 40 answers                              │
│                                                         │
│  Unlocking now: Mood Patterns                           │
│  Next (Month 5): Planner Templates          [Open ›]    │
└─────────────────────────────────────────────────────────┘
```

Rules:
- The paragraph is the hero. Counts are one muted line (`opacity-30`, existing style).
- Dismiss keeps the existing phrase ("The system remembers.") then collapses to a
  one-line `Month 4: Seal IV · 4/12` row that stays for the whole month.
- The full paragraph lives permanently in **Memory › Months** (§6) — dismissal never deletes.
- COCKPIT-RULE for the *log event* body (instrument readings only); the *card* may use prose because it is the product's voice surface, same exception the Weekly Story already uses.

### 4.1 Context widget: "Months unlocked"

A permanent micro-widget on the System tab, always visible after Month 1, no
dismiss:

```
Months unlocked: 4/12     [■■■■□□□□□□□□]
Next unlock in 19 days: Planner Templates
```

It is the user's *progress bar for the subscription itself*. At 12/12 it becomes
`Year 1 complete · Portrait ready`.

### 4.2 Affirmations (Military Purity-safe)

Short, declarative, no superlatives, no emojis. The existing `MONTH_MESSAGES` are the
right register and are kept as the *closing line* of the card. Affirmations cite a
**fact the user produced** ("eleven mornings") rather than generic praise — the
"earned, not given" standard.

---

## 5. THE 12 MONTHS

Fields per month: **Theme · Density · Interface (what visibly changes) · Unlock ·
AI behavior · Seal · Memory artifact · Machiavelli reference.**
The sample Memory paragraphs are written in the voice of the demo account so the
public page can show a believable year (they are *illustrative fixtures*, not
generated output).

---

### MONTH 1 — "THE FIRST PAGE" · Q1 ROOTS
```
DENSITY     breathable          INTERFACE LEVEL  0
```
- **Interface (barebone):** Name + date header. One Memory question. Check-in. Log.
  Nothing else. Wide spacing, single column. No Team block, no Recipe, no pulse,
  no Months widget (nothing to count yet).
- **Unlock:** Log (free text), Morning check-in, Self-care buttons (3 only), Memory question (1/day).
- **AI behavior:** Asks. One question a day. Never speaks unprompted. No names for patterns yet.
- **Seal:** `I` — ring 1/12.
- **Aquatic micro-badges inside month:** Droplet (D7), Wave (D30).
- **Memory artifact:** *Week stories only.* Month-end card shows the first monthly
  paragraph, short by design (it has little to compress — and says so).
- **Sample paragraph:** *"Thirty days of first answers. You prefer tea to coffee, early
  to late, quiet to company. The system is not drawing conclusions. It is learning how
  you answer."*
- **Machiavelli reference:** public page shows only name, weather, local time — the
  Day-1 profile.

### MONTH 2 — "THE SECOND ANSWER" · Q1 ROOTS
```
DENSITY     breathable          INTERFACE LEVEL  0-1
```
- **Interface:** `Months unlocked: 1/12` micro-widget appears. Weather line added.
  Self-care expands from 3 to full set.
- **Unlock:** Full Self-care panel; Team tag block; Week story view in Memory.
- **AI behavior:** Questions now begin with *"Since you…"* — first visible callback to last month.
- **Seal:** `II`.
- **Sample paragraph:** *"Tea before reading returned eleven mornings. The questions
  stopped being new and started being yours. You skipped the weekends — the system
  noted it without comment."*
- **Machiavelli reference:** adds Team tags + sound status.

### MONTH 3 — "THE ACTIVE USER" · Q1 ROOTS · first chapter close
```
DENSITY     comfortable         INTERFACE LEVEL  1
```
- **Interface:** First density step — widgets group into semantic stacks. Citizen
  Index label appears on the card ("Initializing"). Existing copy "Three months. You
  have reached Active User status." becomes the headline.
- **Unlock:** Recipe widget; Calendar; Planner (basic); **Quarter 1 Chapter** (see §6).
- **AI behavior:** Names the first *pattern* in plain words ("Your best days start before eight").
- **Seal:** `III` + **Quarter Seal "ROOTS"** (distinct frame).
- **Memory artifact:** **Chapter 1 — ROOTS** (~120 words) stitched from the three
  month paragraphs. First moment the user can *export* a story.
- **Sample chapter:** *"Roots. The first quarter was about mornings. You built a small
  ritual — tea, quiet, a sentence written down — and kept it through two bad weeks.
  The system learned three things: you write more when it rains; you answer fastest
  at 7:40; you choose rest when the questions get heavy. It will ask fewer questions
  now, and better ones."*
- **Machiavelli reference:** Memory Story block appears on the public page.

### MONTH 4 — "THE PORTRAIT DEEPENS" · Q2 SIGNAL
```
DENSITY     comfortable         INTERFACE LEVEL  1-2
```
- **Interface:** Mood timeline strip (14 days) appears under the check-in. Opacity
  hierarchy sharpens (accent opacity up per `getVisualEffects`).
- **Unlock:** **Mood Patterns** (spec: "Care 50% or Level 20" → re-map to Month 4).
- **AI behavior:** **Recalls.** May quote the user's own earlier answer back, with the date.
- **Seal:** `IV`.
- **Sample paragraph:** *"Colder weather, slower mornings. You said in March that rain
  helps you write; this month proved it — six of your nine longest entries fell on
  rainy days. You also stopped answering on Fridays."*
- **Machiavelli reference:** mood strip visible on public page (privacy toggle).

### MONTH 5 — "CONSISTENCY IS ITS OWN REWARD" · Q2 SIGNAL
```
DENSITY     compact (entering)   INTERFACE LEVEL  2
```
- **Interface:** Two-column grid on wide screens (`maxColumns` 2). Calendar month
  grid shows Log density as shaded cells (a literal heatmap of the user's writing).
- **Unlock:** **Planner Templates**; **Intention History**.
- **AI behavior:** Questions get *fewer* on Dense months, not more — compression in action. (Product brief: "questions become fewer and hit harder".)
- **Seal:** `V`.
- **Sample paragraph:** *"Five months and the shape is visible. Intentions set on
  Mondays, kept more often than not. Your self-care clicks cluster after hard
  check-ins — you repair on your own, quietly. The system stopped asking about it."*
- **Machiavelli reference:** calendar heatmap on public demo page.

### MONTH 6 — "THE JOURNEY IS HALF-DECLARED" · Q2 SIGNAL · half-year
```
DENSITY     compact             INTERFACE LEVEL  2-3
```
- **Interface:** **Half-Year Compression** moment: the Month Card widens to full
  width once, showing six paragraphs as a six-line index (one sentence each) — the
  first time the user sees their half-year as a *list they wrote*.
- **Unlock:** **Quarter 2 Chapter — SIGNAL**; **Data export** (JSON + Markdown); Custom themes.
- **AI behavior:** Names *recurring words* from the user's Log ("quiet" 41×, "again" 29×) — the Word Turn / vocabulary engine already in the codex surfaces here.
- **Seal:** `VI` + Quarter Seal "SIGNAL".
- **Sample chapter:** *"Signal. Months four to six: the noise dropped. You kept the
  mornings, lost the Fridays, and found that your best entries are short. The word you
  used most was 'quiet'. The system now knows when to stay silent."*
- **Machiavelli reference:** half-year index visible.

### MONTH 7 — "THE SYSTEM HAS BEEN LISTENING" · Q3 PATTERN
```
DENSITY     compact             INTERFACE LEVEL  3
```
- **Interface:** A **"Before you ask"** line appears above the Memory question: a
  context-based suggestion drawn from weather + time + trailing pattern ("Overcast, no
  morning entry yet — tea and two lines?"). Single line, dismissible, never repeats same day.
- **Unlock:** **Advanced Memory** (deep reflection questions); Pattern Insights.
- **AI behavior:** **Anticipates.** First time it offers *before* being asked — still one line, still user-initiated to act.
- **Seal:** `VII`.
- **Sample paragraph:** *"Seven months of rain and tea. The system can now predict your
  heaviest weekday: Thursday. This month it offered a self-care prompt on three
  Thursdays; you took two. That is the loop closing."*
- **Machiavelli reference:** shows the "Before you ask" line live on the page, tied to Florence weather.

### MONTH 8 — "RARE AIR" · Q3 PATTERN
```
DENSITY     compact → dense      INTERFACE LEVEL  3
```
- **Interface:** Archetype/cohort name appears (one line, plain). Widget order now
  adapts to *when* you open the app (morning order ≠ evening order).
- **Unlock:** Widget arrange (drag); Narrative Reflection preview.
- **AI behavior:** Time-of-day adaptation; evening reflections start to differ from morning questions.
- **Seal:** `VIII`.
- **Sample paragraph:** *"Rare air: only a few members reach month eight with the
  morning check-in intact. Yours is intact. Evenings got longer; mornings got shorter.
  You now answer in two taps."*
  (Do **not** state "few members" in production unless computed from real cohort data.)
- **Machiavelli reference:** archetype line visible.

### MONTH 9 — "THE PRACTICE IS A HABIT NOW" · Q3 PATTERN · Chapter close
```
DENSITY     dense               INTERFACE LEVEL  4
```
- **Interface:** Density steps to *dense*. Information-cockpit spacing; secondary
  details move behind a single expand. Q3 shows as the **second time the card goes
  full-width**.
- **Unlock:** **Quarter 3 Chapter — PATTERN**; Social mentions; Private spaces; Guided routine builder.
- **AI behavior:** **Guides.** Proposes a *named routine* built from the user's own
  behavior ("Rain Morning: tea → two lines → one self-care"). The user accepts, edits
  or ignores.
- **Seal:** `IX` + Quarter Seal "PATTERN".
- **Sample chapter:** *"Pattern. Months seven to nine: the system stopped listening
  and started proposing. Three routines emerged from your own days — Rain Morning,
  Thursday Reset, Sunday Close. You kept two. The third taught you something by not
  fitting."*
- **Machiavelli reference:** named routines listed.

### MONTH 10 — "ALMOST THERE" · Q4 VOICE
```
DENSITY     dense               INTERFACE LEVEL  4
```
- **Interface:** The Memory Story block on System switches from latest paragraph to a
  **scrollable ledger** of all prior months (10 paragraphs, newest on top).
- **Unlock:** Story-Report API payload (export to robot / vehicle / dashboard per product brief — shown as "ready", gated by hardware availability); Rewrite-my-month (user may correct a paragraph; correction is itself stored).
- **AI behavior:** Asks *you to correct it* — "Did we get March right?" The first time the machine invites disagreement. Corrections feed the next compression.
- **Seal:** `X`.
- **Sample paragraph:** *"Ten months. You corrected the system twice: it called you an
  early riser; you said you are an early *starter*. It kept the correction. Questions
  now average eleven words."*
- **Machiavelli reference:** visible correction trail.

### MONTH 11 — "ONE MORE" · Q4 VOICE
```
DENSITY     dense               INTERFACE LEVEL  4-5
```
- **Interface:** Typography tightens (letter-spacing/line-height from visual-effects).
  A small **Year-ahead** line appears: `Month 12 unlocks the Year Portrait in N days.`
- **Unlock:** Identity compression preview — a draft *"who you are becoming"* paragraph, marked DRAFT.
- **AI behavior:** **Reflects.** Questions are about change over time, not about today.
- **Seal:** `XI`.
- **Sample paragraph:** *"Eleven months. The first question you answered was about tea.
  The last was about what you would stop doing. That distance is the story."*
- **Machiavelli reference:** draft identity paragraph visible.

### MONTH 12 — "THE PORTRAIT" · Q4 VOICE · Year 1 complete
```
DENSITY     instrument          INTERFACE LEVEL  5
```
- **Interface:** Instrument tier: maximum density, every pixel justified. The Month
  Card becomes the **Year Portrait** — a full-screen, one-time reading experience
  (fade-in lines, 1400ms like existing widgets), then a permanent artifact.
- **Unlock:** **Year Portrait** (~250 words, signed **LOT® AI**), exportable as Markdown/PDF; **Year Seal**; invitation to renew into Year 2 with the Portrait as the opening context (the machine starts Year 2 *already knowing the person*).
- **AI behavior:** **Authors.** Writes the portrait from 12 paragraphs + 4 chapters + user corrections.
- **Seal:** `XII` — ring 12/12, Year Seal.
- **Sample Year Portrait:**
  > *"Year one. You arrived answering questions about tea. You leave with a practice:
  > mornings that begin before eight, entries that are short and honest, rest chosen
  > before collapse. You write most in the rain. You repair quietly. You corrected this
  > system twice and it was better for it. The pattern is not discipline — it is
  > attention. Year two begins from here."*
  > — LOT® AI
- **Machiavelli reference:** this is the page `/u/machiavelli` should show in "Year 1" mode.

---

## 6. THE COMPRESSION LADDER (focus: tangible Memory delivery)

The product-brief loop is `LOG → OBSERVE → COMPRESS → ASK → COMPRESS AGAIN`. Here it
is made *visible at five scales*, so the user watches their raw life shrink into a
sentence that is truer than the pile it came from.

```
SCALE      ARTIFACT              LENGTH        STATUS      SURFACE
─────────  ────────────────────  ────────────  ──────────  ───────────────────────
Day        Answer + Log entry    raw           [LIVE]      Log tab
Week       Week story            1-3 sentence  [LIVE]      Memory › Weeks (Job 24)
Month      Month paragraph       55-90 words   [PROPOSED]  Month Card, Memory › Months
Quarter    Chapter               110-150 words [PROPOSED]  Full-width card, M3/6/9/12
Year       Year Portrait         220-280 words [PROPOSED]  Month 12 reading + export
```

### 6.1 The visible compression receipt

Every artifact shows what it came from, using real counts:

```
Month 3 compressed
  4 week stories · 14 log entries · 22 check-ins · 31 self-care · 40 answers
  2,140 words -> 71 words
```

This is the tangibility device: the *ratio* makes compression felt. Word counts must
be computed, never estimated (Honest Engineering).

### 6.2 How a month paragraph is built

1. **Gather** (server): the month's `lot_ai_story` week logs + counts of L/C/S/M + top
   mood + top recurring words + any weather/time correlation + user corrections.
2. **Compose**: Together AI primary (existing engine abstraction; the Memory Story
   already lives in LOT's DB, so provider can be swapped without losing context),
   with a **template fallback** like the weekly job — a month must *always* get a
   paragraph even if AI is down (Graceful Degradation).
3. **Constrain**: max 90 words; every sentence must cite at least one real count or
   quoted user phrase; ban generic praise; Military-Purity vocabulary.
4. **Store**: log event `month_story` (body = readings only, COCKPIT-RULE) +
   `metadata.monthStories[N]` in user metadata. **Add `month_story` to
   `displayableEvents`** (Backend Whitelist Hygiene doctrine — otherwise the
   write→read loop silently breaks, as happened with `calendar_entry`).
5. **Privacy**: month text is private by default; public profile shows it only under
   the existing `showMemoryStory` toggle. Story export remains explicit user action.

### 6.3 Quiet-month policy

Quiet month → 1-2 plain sentences, counts only, no invented insight. The Year
Portrait weights Dense months higher but never skips a Quiet one; it can say "two
months of silence" because that, too, is the story.

---

## 7. BADGES & SEALS

Two layers so the 812-badge Codex is not disturbed:

| Layer | What | Count | Source |
|---|---|---|---|
| In-month micro-badges | Droplet D7 · Wave D30 · Current D100 + existing Codex badges | existing | [LIVE] |
| **Month Seals** | One per unlocked month, Roman numeral, ring glyph fills 1/12 → 12/12 | 12 | [PROPOSED] |
| **Quarter Seals** | ROOTS (M3) · SIGNAL (M6) · PATTERN (M9) · VOICE (M12) — distinct frame | 4 | [PROPOSED] |
| **Year Seal** | M12, appears with the Portrait | 1 | [PROPOSED] |

Seal glyph ladder (ties to the existing density-evolved ASCII fills):

```
I    ◔           V    ◑▪          IX   ◕▪▪          XII  ●  YEAR
II   ◔▪          VI   ◑▪▪         X    ◕▪▪▪
III  ◔▪▪         VII  ◑▪▪▪        XI   ◕▪▪▪▪
IV   ◑           VIII ◕           (exact glyphs = design task)
```

Depth modifier (not a separate badge): a Seal earned in a **Dense** month renders with
a filled ring; **Present** with an outline; **Quiet** with a dotted outline. All
three are earned and kept — the dotted one is not a failure mark, it is the true
record. Seals live on the profile and are public only by toggle.

Rule: Seals are *awarded on the month boundary on next open*, never pushed.

---

## 8. ENGINEERING MAP (smallest honest path)

All [PROPOSED]. File names are the repo's existing locations unless marked new.

| # | Work | Where | Doctrine to obey |
|---|---|---|---|
| 1 | **`usershipSince`** timestamp (set when Usership tag first applied / Stripe subscribe). Month N counts from here, fall back to `joinedAt` | `user.ts` model + migration, tag-grant path | Graceful Degradation: absent -> fallback, never lock |
| 2 | **`usershipMonths.ts`** pure fn: `monthState(since, signals) -> {month, depth, ceilingLevel, interfaceLevel, unlocks[]}` — no store reads, unit-testable | new `src/shared/utils/` | Render Isolation (pure, no subscriptions) |
| 3 | **Month-gated layout** in `System.tsx`: Month 1 = barebone subset; later months add widgets. Replace the flat `isPaidAccount` branch | `System.tsx` | Subscriptions at narrowest scope; wrap each new widget in `WidgetErrorBoundary` |
| 4 | **Month Card** replaces one-line pulse; adds paragraph + counts + seal + next unlock | `MonthlyPulseWidget.tsx` | Keep fade 1400ms + dismiss phrases |
| 5 | **`month-compression` job**, 1st of month ~09:00 UTC (share the monthly-email window), idempotent per `(user, month)` | `scheduled-jobs.ts` | Process.nextTick/async work try-catch wrapped; template fallback |
| 6 | **Month/Quarter/Year story composer** with word-count + citation constraints | `story-generator.ts` | Honest Engineering; rate-limit AI route (existing per-route limits) |
| 7 | **Whitelist** `month_story`, `quarter_story`, `year_portrait` in `displayableEvents` | `routes/api.ts` | Backend Whitelist Hygiene |
| 8 | **Seals**: 12 + 4 + 1 definitions, award on boundary | `badges.ts` (+ Codex v33 doc) | Badge Codex process |
| 9 | **Machiavelli time-scrubber** (§9) | `public-api.ts`, `PublicProfile.tsx` | Privacy: demo only |
| 10 | Service-worker `CACHE_VERSION` bump on deploy | `public/sw.js` | Client Cache Freshness |

Suggested ship order (each independently green-gateable): 1 → 2 → 4 → 5/6/7 → 3 →
8 → 9. Items 1, 2, 4 alone already make Month 2+ feel different and are the cheapest
tangibility win.

---

## 9. `/u/machiavelli` — THE TIME MACHINE

**Problem.** The demo is a static end-state (streak 1469, activeDays 842). A visitor
cannot see the *journey*, only the destination, and 1469 days reads as "years" not
"12 months".

**Proposal.** Add a month scrubber to the demo page only:
`/u/machiavelli?m=1 … ?m=12` (and a small `‹ Month 4/12 ›` control).
The server renders a **fixture table** keyed by month: which sections are visible,
that month's paragraph, the Seal row so far, density tier, `activeDays`/`streak`
consistent with the month (e.g. M6 ≈ 180 days), Florence weather unchanged.

```
?m=1   name · date · weather                        (barebone)
?m=3   + Team tags · Memory Story · Seals I-III · Chapter ROOTS
?m=6   + mood strip · calendar heatmap · half-year index · Seals I-VI
?m=9   + routines · archetype · Seals I-IX · 3 Chapters
?m=12  + Year Portrait signed LOT® AI · Year Seal · instrument density
(no ?m)  current behavior: Legacy end-state, untouched
```

The scrubber is the single most persuasive sales surface: a prospect drags 1 → 12 and
*watches the interface grow up*. It also doubles as the visual regression fixture for
the tangibility test (§10).

Keep Machiavelli's voice: all 12 sample paragraphs in §5 are written for the
Palazzo-Vecchio-observer register already in his `memoryStory`.

---

## 10. TANGIBILITY ACCEPTANCE TESTS

1. **Five-second test.** Screenshot System at Month N and N+1 (via the scrubber). A
   reviewer who has not seen them must say which is later, for all 11 adjacent pairs.
2. **Paragraph-truth test.** Every sentence in a generated month paragraph must trace
   to a real count or quoted phrase in that month's logs. Zero un-sourced claims.
3. **No-push test.** No month ritual triggers a notification, badge dot on the app
   icon, or email beyond the existing 1st-of-month summary.
4. **Quiet-month test.** A fixture user with <8 signals receives a short honest
   paragraph and an outline Seal; nothing locks.
5. **Absence test.** Delete the computed month state -> client renders the full
   layout for that user's time ceiling (absent = allow).
6. **Late-upgrade test.** Free for 8 months then Usership: Month 1 barebone, not Month 8.

Hypotheses to measure after ship (not claims): 30-day Log-entry rate after Month 3
Chapter vs before; renewal at Month 12 for members who open the Year Portrait.

---

## 11. OPEN DECISIONS FOR S-2

1. **Day 1 barebone** — confirm Usership Month 1 should be *less* than today's full
   paid layout (this is a deliberate subtraction from what members see now; existing
   members need a grandfathering rule, e.g. map by `usershipSince` and never regress
   anyone who already has the full layout).
2. **Wordmark reveal** — "LOT® AI" first appears at Month 12 (this spec) vs earlier.
3. **R&D tier** — shares `isPaidAccount` today; does it get the 12-month arc or the full layout?
4. **Quiet-month Seal style** — dotted outline (this spec) vs identical Seal.
5. **Quarter chapters at M3/6/9/12** — four moments vs fewer.
6. **AI provider for compositions** — Together AI primary (cost) vs Anthropic for the Year Portrait only (quality, ~once per user per year, negligible cost).
7. **Legacy/Admin tiers** — enter at Month 12 state, or run the arc?

---

## 12. ONE-PAGE SUMMARY

```
MO  THEME                    DENSITY       NEW ON SCREEN                    AI VERB      SEAL
01  The First Page           breathable    Question · Check-in · Log        Asks         I
02  The Second Answer        breathable    Months 1/12 · full Self-care     Asks+callback II
03  The Active User          comfortable   Stacks · Recipe · Calendar       Names 1st    III + ROOTS
04  The Portrait Deepens     comfortable   Mood strip                       Recalls      IV
05  Consistency              compact-      2-col · Log heatmap · Templates  Compresses   V
06  Half-Declared            compact       Half-year index · Export         Names words  VI + SIGNAL
07  Listening                compact       "Before you ask" line            Anticipates  VII
08  Rare Air                 compact+      Archetype · Adaptive order       Adapts       VIII
09  A Habit Now              dense         Routines · Social · Private      Guides       IX + PATTERN
10  Almost There             dense         Story ledger · Rewrite-my-month  Asks to be corrected X
11  One More                 dense+        Year-ahead · Identity draft      Reflects     XI
12  The Portrait             instrument    Year Portrait · LOT® AI · export Authors      XII + YEAR
```

*The questions get better every year. The machine earns the right to ask them.*

---

```
AUTHORIZED BY: S-2 // VADIK MARMELADOV
```
