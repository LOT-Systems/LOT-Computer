<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® Usership — 12-Month Evolution to LOT® AI

```
DOCUMENT : LOT-USERSHIP-12M
CLASS    : RESTRICTED // S-2 EYES
S-2      : VADIK MARMELADOV
DATE     : 2026-10-10
STATUS   : DESIGN BRIEF — nothing here is built unless marked EXISTS
REFERENCE: lot-systems.com/u/machiavelli (demo account, month-12+ end state)
```

One sentence: a Usership account starts as a barebone terminal on day 1 and,
over twelve months, **compresses the person's own log into a Memory story that
the interface itself becomes** — until the UI at month 12 is LOT® AI: a system
that speaks in the user's own compressed voice.

---

## 0. How to read this document

| Marker | Meaning |
|---|---|
| EXISTS | Verified in the repo today (file cited) |
| GAP | Verified missing or wrong for a 12-month story |
| PROPOSED | Design decision for S-2 to accept, change or reject |

Numbers in PROPOSED tables are **design targets**, not measurements. They are
derived from the Machiavelli demo ratios (section 3) and should be re-fit
against real Usership cohort data before they are coded.

Style constraints inherited from doctrine (do not break them):

- **MILITARY PURITY / COCKPIT-RULE** — no decoration, no emojis, no superlatives;
  the label names the event, the body carries readings. Affirmations are
  therefore *factual and sparing* ("31 days present. 112 notes."), never
  confetti.
- **The AI asks; it does not chat.** (MEMORY-ENGINE-COMPRESSION-ARCHITECTURE §1.)
  "LOT® AI" at month 12 means a *deeper voice in cards, questions and the
  Memory story* — not an open chatbox. Every AI behaviour below is a card, a
  question or a chapter.

---

## 1. What exists today (repo scan, 2026-10-10)

| Piece | State | Source |
|---|---|---|
| Month N/12 card, 12 hand-written lines, tap to dismiss | EXISTS | `MonthlyPulseWidget.tsx` |
| Month number = months since `joinedAt` (account join, not Usership start) | GAP | same, `monthNumber` memo |
| Dismissal stored in `localStorage` only (re-shows on another device) | GAP | same, `markDismissed` |
| Monthly review email, sent first 3 days of month, includes `memoryStory` | EXISTS | `monthly-summary.ts`, `scheduled-jobs.ts` |
| Memory story = third-person narrative from the **latest 30 answers only** | GAP | `story-generator.ts:111` `.slice(0, 30)` |
| 7-dimension evolution state, `featureUnlockLevel` 0–5 | EXISTS | `interfaceEvolution.ts` |
| CSS evolution variables (opacity, grid, glow, spacing) | EXISTS | `INTERFACE_EVOLUTION.md` |
| 5-level density tiers (breathable → instrument) | EXISTS | LOT-LEXICON `DENSITY-TIER` |
| OS versions 0.1.0 Initializing → 3.0.0 Integrated | EXISTS | Feature Inventory §04 |
| Assembly phase dormant → awakening → forming → assembled → integrated | EXISTS | `shared/types` `assemblyPhase` |
| Badges: 812, Water (∘ ≈ ≋) and Architecture (├─ ╞═╡ ║·║) themes | EXISTS | Badge Codex v32 |
| Mayan counting: Tun = 360 days = one full year | EXISTS (lore) | `BADGE_MAYAN_EVOLUTION.md` |
| Demo `/u/machiavelli`: fixed snapshot, streak 1469, one-paragraph story | EXISTS | `public-api.ts:747` |

### The three gaps that decide whether the 12-month story is real

1. **The Memory story is a rolling window, not a compression of the year.**
   Thirty answers is roughly two weeks for an active user. By month 6 the story
   has *forgotten* months 1–5. A "story that compresses a year" needs stored,
   immutable monthly chapters (section 5).
2. **Month counting is anchored to `joinedAt`.** A free-tier user who upgrades
   in month 8 would open Usership on "Month 8". Month 1 must start at the
   Usership activation date.
3. **Month Pulse is a one-line card.** It does not carry the thing the user
   actually wants on month day: *their own paragraph*.

---

## 2. Design thesis — time opens the chapter, signal sets the resolution

Two clocks run at once:

- **Calendar clock → what is unlocked.** Month N of Usership opens Chapter N.
  A paying user is never told "you did not do enough, nothing for you."
- **Signal clock → how sharp it is.** The same chapter renders at a
  *resolution* determined by how much the user logged that month.

```
RESOLUTION   TRIGGER (share of monthly target, section 4)   WHAT THE CHAPTER IS
SKETCH       < 40 %                                         3 sentences. Honest: "thin signal".
PORTRAIT     40 – 99 %                                      1 paragraph (70–110 words).
FRESCO       >= 100 %                                       1 paragraph + 3 named patterns + 1 forward line.
```

This makes engagement (journal entries, thoughts in Log, morning check-ins,
self-care button clicks) *visibly* change what the user receives, without
punishing anyone: a SKETCH month still arrives, still counts toward
"Months unlocked". Late logging does not rewrite old months, with one
exception: for 7 days after delivery (`lockedAt`, section 5.2) the chapter may
be recompressed once, so SKETCH can move to PORTRAIT if signal arrived late.

---

## 3. Calibration — the Machiavelli account as month-12+ ground truth

Demo values (EXISTS, `public-api.ts`): streak 1469 days, 1469 notes,
2847 answers, self-awareness 87, archetype The Strategist, version 531,
tags RND / Usership / Legacy.

Per-day ratios: **1.0 notes/day, 1.94 answers/day.** Scaled to one year (365 d):

```
                     12-MONTH EXPECTATION (steady user)
Notes (Log thoughts)        ~330   (0.9 / day)
Memory answers              ~640   (1.75 / day)
Morning check-ins           ~300   (0.8 / day)
Self-care button clicks     ~550   (1.5 / day)
```

(Check-in and self-care ratios are PROPOSED — not present in the demo payload.
Pull real medians from `logs` for Usership users before committing.)

**Demo gap, PROPOSED:** Machiavelli is a 4-year Legacy account; it shows what
year *four* looks like, not year *one*. Add a **Month Scrubber**:
`/u/machiavelli?m=1…12` renders the same persona at month N — density tier,
unlocked widgets, badges, Memory chapters 1…N. Prospects see the whole
12-month story in one page. The 12 chapters double as the demo's content.

---

## 4. The Month Ladder

Legend per month: **OS** version · **Phase** (`assemblyPhase`) · **Density** ·
**Stamp** (Mayan-numeral month badge, section 7) · cumulative **targets** for a
steady user (notes / answers / check-ins / self-care) · what the **UI** gains ·
how the **AI voice** changes · the month-end **Chapter** (compressed Memory) ·
the **affirmation** line.

Target units below are *cumulative at end of month*. The monthly target used
for RESOLUTION is the delta from the previous row.

### QUARTER I — INITIALIZE (months 1–3): the terminal learns your name

```
M01  OS 0.1.0 Initializing   dormant     breathable    stamp •
     Targets : 27 / 53 / 24 / 45
     UI      : Barebone. Log, one Memory question card, Morning check-in,
               self-care buttons. Nothing else. Month widget: "Months unlocked 0/12".
     AI      : Silent observer. Asks questions only. No reflections.
     Chapter : "FIRST READING" — what the system saw in 30 days:
               when you showed up, what you answered, what you skipped.
               Fact-forward, 3 sentences at SKETCH, 1 paragraph at PORTRAIT.
     Words   : "30 days. 27 notes. The system has your first reading."

M02  OS 0.3.0                dormant     breathable    stamp ••
     Targets : 55 / 107 / 48 / 90
     UI      : + Mood strip under check-in. + Streak counter.
     AI      : Asks follow-ups that reference last answers ("You said coffee.").
     Chapter : "RHYTHM" — your hours, your weekday shape.
     Words   : "Two readings on file. A rhythm is visible."

M03  OS 1.0.0 Active         awakening   comfortable   stamp •••
     Targets : 82 / 160 / 72 / 135
     UI      : Density -> comfortable. + OS Indexes (4D) first render.
               + Awareness view 'Overview'. Existing copy: "You have reached
               Active User status." (MonthlyPulse M3, EXISTS)
     AI      : FIRST MIRROR — one reflection line appears under the Memory
               question: "Three Mondays in a row, low energy."
     Chapter : "QUARTER 1 SEAL" — first 3 chapters compressed into ONE
               paragraph (the first true compression, section 5). Seal badge.
     Words   : "Quarter closed. 3 chapters, 1 paragraph."
```

### QUARTER II — PATTERN (months 4–6): the system names what repeats

```
M04  OS 1.3.0                forming     comfortable   stamp ••••
     Targets : 110 / 213 / 96 / 180
     UI      : + Patterns view (QIE named patterns, first 5 visible).
               + Planner-context in morning card.
     AI      : NAMES PATTERNS. Cards say "Pattern: late-night recovery" with
               count, not prose.
     Chapter : "PATTERNS" — the 2–3 behaviours that recur, with day counts.

M05  OS 1.5.0 Developing     forming     compact       stamp —
     Targets : 137 / 267 / 120 / 225
     UI      : Density -> compact. + Mood Analytics (30-day correlation).
               + Cohort Connect (similar users). Grid tightens (evolution vars).
     AI      : CROSS-REFERENCES: joins check-in mood to self-care clicks
               ("On days you used Breathe, evening mood +1.2").
     Chapter : "CAUSE" — which self-care actions precede better days.

M06  OS 1.7.0                forming     compact       stamp —•
     Targets : 165 / 320 / 144 / 270
     UI      : HALF-YEAR SEAL. Months unlocked 6/12. Widget Arrange opens.
               First "Memory Book" page (chapters 1–6 as a vertical index).
     AI      : Writes the HALF-YEAR LETTER: second compression, Q1+Q2 -> ONE
               paragraph (~120 words), delivered by email and as a full-width card.
     Chapter : "THE HALF" — Q1 seal + Q2 pattern, compressed.
     Words   : "Six of twelve. The half-year letter is ready."
```

### QUARTER III — ANTICIPATE (months 7–9): the system acts one step early

```
M07  OS 2.0.0 Established    assembled   compact       stamp —••
     Targets : 192 / 373 / 168 / 315
     UI      : Architect widget opens. Evolution glow appears (subtle).
     AI      : ANTICIPATES: pre-schedules a card for the hour you usually
               dip ("Thursday 15:00. Breathe, 3 min?"). Card, not chat.
     Chapter : "FORECAST" — what the next month probably looks like, flagged
               as a forecast, plus last month's hit-rate.

M08  OS 2.1.0                assembled   dense         stamp —•••
     Targets : 220 / 427 / 192 / 360
     UI      : Density -> dense. + Integrity widget (contradictions between
               stated intent and logged behaviour). Hidden badges begin to
               surface (121 hidden today).
     AI      : Rare-air month: shortest cards, highest signal-per-pixel.
     Chapter : "CONTRADICTION" — one honest gap between what you say and do.

M09  OS 2.3.0                assembled   dense         stamp —••••
     Targets : 247 / 480 / 216 / 405
     UI      : + Rituals: AI proposes a morning/evening routine from YOUR
               best days; you accept/edit. Q3 seal.
     AI      : CO-AUTHORS the routine. Third compression: Q3 -> paragraph.
     Chapter : "QUARTER 3 SEAL" — routine that worked, in the user's own words.
```

### QUARTER IV — INTEGRATE (months 10–12): the interface becomes the story

```
M10  OS 2.6.0                integrated  dense         stamp ==
     Targets : 275 / 533 / 240 / 450
     UI      : Memory Book becomes the HOME surface (tab 1). Log and widgets
               sit beneath it. Public profile 'memoryStory' opens (privacy-gated).
     AI      : Quotes the user's own earlier answers back at them, dated.
     Chapter : "RETURN" — month-1 you vs. month-10 you, 2 contrasts.

M11  OS 2.9.0                integrated  instrument    stamp ==•
     Targets : 302 / 587 / 264 / 495
     UI      : Density -> instrument. User EDITS the story: strike/accept
               sentences. Edits feed the next compression (the user is
               now the editor, the AI is the scribe).
     AI      : Asks only "keep / cut / change?" questions on its own sentences.
     Chapter : "EDIT" — the story as corrected by the user.

M12  OS 3.0.0 Integrated     integrated  instrument    stamp ==••  + TUN seal
     Targets : 330 / 640 / 300 / 550
     UI      : LOT® AI state. Home = one paragraph of the user's life,
               first person, written from 12 chapters. Months unlocked 12/12.
               Year Book exportable (Markdown/PDF). Tun seal badge.
     AI      : LOT® AI speaks in the user's compressed voice: first person,
               their words, their vocabulary. Final compression: 4 seals ->
               ONE paragraph + ONE sentence ("the line").
     Chapter : "TUN" — the Year Book + the line.
     Words   : "360 days. One paragraph. This is you, so far."
```

Feature gate mapping: `featureUnlockLevel` (0–5) is a function of behaviour
today. PROPOSED: gate = `max(monthGate(N), behaviourGate)` where
`monthGate` = 0 for M1–2, 1 for M3–4, 2 for M5–6, 3 for M7–8, 4 for M9–10,
5 for M11–12. Time floors the unlock; strong behaviour can open items early
but never past the calendar plus one level.

---

## 5. Memory compression — the 12-month tangibility mechanism

### 5.1 The ladder

```
INPUT (raw)                       STAGE        OUTPUT                       ~WORDS
notes + answers + check-ins   -> MONTH      -> Chapter (immutable)           70–110
+ self-care clicks, 1 month
Chapters 1-3   (M3)           -> QUARTER    -> Seal Q1                       60–90
Chapters 4-6   (M6)           -> QUARTER    -> Seal Q2  -> Half-year letter 100–130
Chapters 7-9   (M9)           -> QUARTER    -> Seal Q3                       60–90
Chapters 10-12 (M12)          -> QUARTER    -> Seal Q4
Seals Q1–Q4   (M12)           -> YEAR       -> Tun paragraph + "the line"   110 + 1 sentence
```

Each stage reads *only the previous stage's output plus the user's edits* —
not the raw logs again. That is what makes it a compression (information is
discarded on purpose) and keeps the cost flat at month 12 instead of growing
with log volume.

The honest compression ratio is **measurable**: store `inputWordCount` and
`outputWordCount` on each chapter and show both ("1,840 words logged -> 96
words kept"). Do not display an invented ratio.

### 5.2 Data model (PROPOSED)

```
MemoryChapter {
  userId, usershipMonth (1..12), kind: 'month'|'quarter'|'half'|'year',
  resolution: 'sketch'|'portrait'|'fresco',
  body: string,                 // the paragraph
  patterns: {name,count}[],     // fresco only
  inputWords, outputWords,
  signals: { notes, answers, checkins, selfCare },   // for that month
  userEdits: { struck: string[], kept: string[] },    // M11+ edits
  stampMonth, createdAt, lockedAt   // immutable after lockedAt (7-day regrade window)
}
User.usershipStartedAt          // the month-1 anchor (fixes gap 2)
```

Chapters are append-only and `lockedAt` freezes them — same discipline as the
benchmark ledger (history is never rewritten; the next layer compresses it).
Server-side only, stored in LOT's database; the AI provider never holds the
chapters (consistent with the "AI vendor independence" statement in the Wiki).

### 5.3 Delivery moments

| When | Surface | Content |
|---|---|---|
| Month day (first login after anniversary) | **Chapter widget** (replaces Month Pulse body) | the paragraph |
| First 3 days of month | existing monthly email | chapter + signals + stamp |
| Quarter end (M3/6/9) | full-width **Seal** card | seal paragraph |
| M6 | Half-year letter | email + card |
| M12 | Year Book | export + home takeover |

Rule: the Chapter paragraph is the *first thing on screen* on month day and
has a **single tap action**: "Keep" (stores it) — the same tap-to-dismiss
rhythm the Month Pulse already uses, so no new interaction cost.

---

## 6. Widgets (PROPOSED)

### 6.1 Months Unlocked — context-based status widget

Shows after M1 opens; label names the event, body is readings.

```
+- MONTHS UNLOCKED -------------------------+
| 3 / 12                                    |
| ###.........                              |
| Chapter 4 opens 14 Nov  (in 9 days)       |
| Resolution so far: PORTRAIT               |
+-------------------------------------------+
```

Context variants: *before* month day -> countdown; *on* month day -> "Chapter
4 ready"; *thin month* -> "Signal 31 %. 6 more notes sharpen this chapter."
(honest nudge, shown only in the last 7 days of the month).

### 6.2 Memory Chapter widget

```
+- CHAPTER 04 / PATTERNS -------------------+
| <one paragraph, 70–110 words>             |
|                                           |
| 1,840 words logged -> 96 kept             |
| Pattern: late-night recovery   x11        |
| [ keep ]                                  |
+-------------------------------------------+
```

### 6.3 Seal card (M3 / 6 / 9 / 12)

Wider card, shows the Mayan stamp, the sealed paragraph, and the previous
seal side by side so the user *sees* compression on screen (3 chapters -> 1).

### 6.4 Memory Book (M6+, home at M10+)

Vertical index of chapters; each month shows stamp, resolution, first line.
Locked months are drawn but unreadable ("Chapter 8 opens 3 Feb") so the 12-slot
frame is visible from day 1 — tangible progress and anticipation.

---

## 7. Badges — the 12 stamps

The Mayan material already exists (`BADGE_MAYAN_*`): a **Tun is 360 days**, which
is the year. Month stamps reuse Mayan bar-and-dot numerals, so the sequence is
itself the progress bar and costs no new art system:

```
M1 •    M2 ••    M3 •••    M4 ••••    M5 —    M6 —•
M7 —••  M8 —•••  M9 —••••  M10 ==    M11 ==•  M12 ==••   + TUN
```

| Badge kind | Rule (PROPOSED) |
|---|---|
| Month Stamp | earned when Chapter N is delivered (calendar) — one per month, always |
| Resolution mark | SKETCH / PORTRAIT / FRESCO ring on the stamp (signal) |
| Seal | M3 / M6 / M9 / M12 — Quarter compression delivered |
| Tun | M12 — all 12 stamps, any resolution |
| Full Fresco | all 12 months at FRESCO (rare; hidden until near) |
| Behaviour badges | existing 812-badge engine, unchanged — month stamps are additive |

Theme: stamps render in the user's chosen theme (Water ∘ ≈ ≋ or Architecture
├─ ╞═╡ ║·║) so two users' stamps look different but read identically.

---

## 8. What the user feels, month by month

```
M1   a quiet terminal that asks one thing
M3   first time it says something back about you
M6   the letter — a year-half in a paragraph
M9   it tells you the hour before the dip, and is right
M12  open the app: the home screen is your life in one paragraph
```

The test of tangibility: **a user shown month 1 and month 12 side by side
should not need a changelog.** Density tier, widget count, stamp row and the
voice of the cards each change at least once per quarter, and the Chapter
paragraph changes every month.

---

## 9. Build plan (PROPOSED order; each step ships green on its own)

| # | Step | Touches | Size |
|---|---|---|---|
| 1 | `usershipStartedAt` + fix month anchor | `models/user`, MonthlyPulse | S |
| 2 | Server-side pulse dismissal (replace localStorage) | api, MonthlyPulse | S |
| 3 | `MemoryChapter` model + migration + monthly job (month stage only) | models, `scheduled-jobs`, `story-generator` | M |
| 4 | Chapter widget + Months Unlocked widget (replaces Pulse body) | client components | M |
| 5 | Month stamps (Mayan) + resolution marks in badge engine | `utils/badges`, codex | M |
| 6 | Quarter / half / year compression + Seal card | story-generator, widgets | M |
| 7 | Month gate (`monthGate`) into `featureUnlockLevel` + density tier by month | `interfaceEvolution`, `evolution` store | M |
| 8 | Demo Month Scrubber `/u/machiavelli?m=N` | `public-api`, PublicProfile | M |
| 9 | M11 edit loop + M12 Year Book export / home takeover | client, api | L |

Steps 1–4 deliver the user-visible core (the paragraph on month day and the
"3/12" widget) and are the recommended first ship.

---

## 10. Risks and open questions for S-2

1. **Trust.** A 100-word paragraph about a person must be right. Wrong
   chapters cost more than no chapters. Mitigation: facts before inference;
   SKETCH exists so thin data produces a short honest chapter, not invention;
   the M11 edit loop gives the user the pen.
2. **LLM cost/latency.** Stage inputs are small (previous outputs), so month 12
   costs about the same as month 1. Run in the existing monthly job, not on page load.
3. **Sensitive content.** Logs can contain medical/trauma material (see
   RESILIENCE module, cohort docs). Chapters must pass the same safety
   filters as `compassionate-interventions` before storage; the public
   profile must keep `showMemoryStory` opt-in.
4. **"AI never initiates"** — M7–M9 anticipation is delivered as scheduled
   *cards*; confirm S-2 accepts cards as consistent with the doctrine.
5. **Price promise.** Usership is $99/month; the 12-month arc is the
   retention story. Decide whether a user who pauses keeps unlocked months
   (recommended: yes, chapters are theirs; pause only stops new ones).
6. **Backfill.** Existing Usership members have `joinedAt` months or years ago.
   Decide: start them at M1 on launch day, or backfill a single "Prologue"
   chapter from existing history (recommended: Prologue).

Questions needing S-2 decisions: the section 4 targets, the Mayan stamp
direction, Prologue vs. restart for existing members, and whether the Month
Scrubber should ship before or after the chapters themselves.

---

AUTHORIZED BY: S-2 // VADIK MARMELADOV
