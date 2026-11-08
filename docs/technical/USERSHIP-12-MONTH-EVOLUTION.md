<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# USERSHIP — 12-MONTH EVOLUTION SYSTEM

**Class:** DESIGN BRAINSTORM // PRODUCT · **S-2:** Vadik Marmeladov
**Date:** 2026-11-08 · **Session:** LOT-SR-20261108-01
**Status:** PROPOSAL — nothing here is shipped. Section 11 lists what is already in the repo.
**One line:** A paid user starts Day 1 on a nearly empty screen. Twelve months later their screen looks like `/u/machiavelli`. Every month the machine hands back one compressed paragraph of who they became.

---

## 0. HOW TO READ THIS

| § | What | Use it for |
|---|------|-----------|
| 1 | Ground truth from the repo | What we build on. Not invented. |
| 2 | The design spine | The five rules every month obeys |
| 3 | The Month Ledger | Master table, M0 to M12 |
| 4 | Month-by-month detail | One block per month: UI, AI, memory, badge |
| 5 | The Compression Ladder | How memory gets shorter and truer |
| 6 | Monthly Memory Capsule | The core deliverable, anatomy and samples |
| 7 | Widgets | "Months unlocked", Capsule, Archive, Year Portrait |
| 8 | Self-care and Log mechanics | What fills each month |
| 9 | Machiavelli as the Month-12 reference | Plus the Time Machine scrubber |
| 10 | Data model, jobs, endpoints | Build plan |
| 11 | Existing vs. new | Gap list |
| 12 | Risks and open questions | Decisions needed from S-2 |

---

## 1. GROUND TRUTH — WHAT THE REPO ALREADY HAS

Scanned this session: 6.7 MB of .md under `docs/`, plus the code paths below.

**Tier.** Usership is $99/month (R&D $15). It carries the AI Memory Engine, Memory Story, psychological profile, QR code, custom theme, board profile, Architect widget and monthly email. (`LOT-FEATURE-INVENTORY-2026.md` §16; `User.getMemoryEngine` returns `'ai'` only for Usership.)

**Interface evolution already exists, but is driven by effort, not time.**
`src/client/utils/interfaceEvolution.ts` computes seven dimensions, a `visualRefinement` score, four story chapters (by level: 1 / 10 / 30 / 60) and five layout densities: `breathable → comfortable → compact → dense → instrument`. Feature gates (`featureUnlocks`) already hide widgets until earned. `INTERFACE_EVOLUTION.md` documents it.

**A Month widget already exists.**
`MonthlyPulseWidget.tsx` shows "Month N: <one line>" and "N / 12 months" to Usership users, once per month, dismissed with a one-word phrase. Weaknesses:

1. Month is counted from `joinedAt` (account join), not from the day Usership began.
2. Dismissal lives in `localStorage` only, so it re-fires on a new device.
3. The line is static copy, not drawn from the user's own data.
4. Nothing is archived. After dismissal the month is gone.

**Memory is one rolling story, not twelve.**
The Memory Story is cached in `user.metadata.lastMemoryStory`, keyed by answer count (`api.ts` ~2658). It is overwritten as answers grow. There is no per-month snapshot. This is the biggest gap for the brief.

**Monthly Summary exists** as an email (job 15, 1st of month 09:00 UTC) and a Weekly Summary exists (Sun/Mon). Neither is shown in-app as a permanent object.

**Badges:** 812 badges, 8 rarity tiers (COMMON to MYTHIC), Codex v32. Quests have 4 tiers (daily / weekly / ...).

**The demo account is a fixed payload** in `public-api.ts` (~L747). Facts we use as the Month-12+ reference:

| Field | Value |
|---|---|
| Name / archetype | Niccolò Machiavelli · The Strategist |
| Tags | RND, Usership, Legacy |
| Streak | 1469 |
| Answers (memories compiled) | 2847 |
| Journal entries (notes) | 1469 |
| Active days | 842 |
| Total entries | 4316 |
| Self-awareness | 87 |
| Composite / User / Person / Longevity | 92.4 / 94.2 / 91.7 / 96.8 |
| Pattern strength index | 2847 (top: strategic thinking 842) |
| Unlocks shown | Weather Station, Wallet, Board profile, Memory Story |

Note on the live page: `lot-systems.com` is blocked from this sandbox, so the above comes from the hardcoded payload and `PublicProfile.tsx`, not from the rendered page. Re-verify visually before design lock.

---

## 2. THE DESIGN SPINE — FIVE RULES

**Rule 1. Time opens the door. Behavior fills the room.**
Each month unlocks a *slot* (a surface, a capability, a badge frame). What goes in it, and how dense it gets, depends on what the user actually did. A user who logs nothing still reaches Month 3, and the AI says so honestly. This also keeps the subscription from reading as "pay to wait".

**Rule 2. Density is capped by month and earned by effort.**
`effectiveDensity = min(earnedDensity, monthCeiling)`. A Month-1 power user does not get the instrument layout. A Month-12 idler does not get it either. The screen is a receipt for the year.

| Months | Density ceiling |
|---|---|
| 0–1 | breathable |
| 2–3 | comfortable |
| 4–6 | compact |
| 7–10 | dense |
| 11–12 | instrument |

**Rule 3. Every month ends with something you can hold.**
One Capsule (a paragraph), one badge, one number that moved. Nothing is a progress bar alone.

**Rule 4. The machine speaks less and says more.**
Questions per day fall over the year; their specificity rises. Month 1: it asks, plainly. Month 12: it quotes you back to yourself, once.

**Rule 5. House style holds.**
Monospace, no emoji, periods not symbols ("Done."), opacity hierarchy 90/60/40, military purity of vocabulary, trauma-informed protocol always on. ASCII bars only (the repo already has ASCII density fills).

---

## 3. THE MONTH LEDGER (MASTER TABLE)

Day 1 is **M0**. Month N unlocks on the N-month anniversary of `usershipSince`.

| M | Chapter | Density ceiling | Surface unlocked | AI voice | Capsule | Badge (proposed) |
|---|---|---|---|---|---|---|
| 0 | I · INTAKE | breathable | Question, Log, check-in, "Months unlocked 0/12" | Introduces itself, 1 question | none (a Day-1 receipt) | **INTAKE** |
| 1 | I · INTAKE | breathable | First Capsule, Month widget, Weekly Story | Asks, learns your hours | Capsule 01 | **FIRST PATTERN** |
| 2 | I · INTAKE | comfortable | Mood Patterns, streak ribbon | Starts follow-ups on your own words | Capsule 02 | **STEADY HAND** |
| 3 | I · INTAKE | comfortable | Quarter Story Q1, Active User status, QR | First "I noticed" line | Capsule 03 + **Quarter 1** | **ACTIVE USER** |
| 4 | II · PATTERN | compact | Archive view, Intention History | Names a recurring theme | Capsule 04 | **PORTRAIT LINE** |
| 5 | II · PATTERN | compact | Self-care Routine Builder | Suggests a routine from your data | Capsule 05 | **CADENCE KEPT** |
| 6 | II · PATTERN | compact | Half-Year Seal, Psych profile v-next | First contradiction handled gently | Capsule 06 + **Quarter 2 + Half-Year** | **HALF-YEAR SEAL** |
| 7 | III · DEPTH | dense | Pattern Insights, Board profile | Quotes an old entry back | Capsule 07 | **LONG LISTEN** |
| 8 | III · DEPTH | dense | Architect widget depth, Integrity view | Names a blind spot | Capsule 08 | **RARE AIR** |
| 9 | III · DEPTH | dense | Narrative Reflection, Quarter Story Q3 | Proposes a monthly intention | Capsule 09 + **Quarter 3** | **HABIT FORMED** |
| 10 | IV · MASTERY | dense | Export, Custom themes in full, Weather Station | Fewer questions, sharper | Capsule 10 | **LAST QUARTER** |
| 11 | IV · MASTERY | instrument | Wallet, Legacy preview | Writes a draft of your Year line for you to edit | Capsule 11 | **EVE OF YEAR** |
| 12 | IV · MASTERY | instrument | **Year One Portrait**, Year Story, shareable public card | Hands the portrait back | Capsule 12 + **Quarter 4 + Year Story** | **YEAR ONE PORTRAIT** |

Chapters map onto the four existing story-arc chapters in `interfaceEvolution.ts` so the vocabulary stays one system. The existing chapters trigger on level; the Usership chapters trigger on month. Open question 12.4 covers which wins.

Badge names above are proposals. Names like FIRST LIGHT, MERIDIAN and THRESHOLD already exist in earlier Codex versions, so the set was picked to avoid them. Run a collision check against Codex v32 before adding. They should be a new category, **USERSHIP YEAR**, with a gold-to-white frame that fills as months pass (see §7.5).

---

## 4. MONTH-BY-MONTH DETAIL

Each block: what the user sees, what the AI does, what the memory delivers, what fills it. Activity floors are the *minimum for a full-weight Capsule*, not a lock.

### M0 — DAY ONE · "BAREBONE"
- **Screen.** Dark, near empty. Three things: today's single question, the Log field, one check-in button. A quiet line: `Months unlocked: 0 / 12`.
- **AI.** One sentence of intent: "I will ask one thing a day. I will remember."
- **Memory.** A Day-1 receipt: "Usership began. 0 memories. The portrait is blank." This is deliberate. The blank is the baseline the year is measured against.
- **Floor.** None.
- **Why it matters.** The value story is a before/after. Without a truly bare Day 1 the 12-month screen has nothing to be compared to.

### M1 — FIRST PATTERN
- **Screen.** Month widget appears for the first time with a real Capsule. Weekly Story becomes a permanent card instead of an email. The question area gains a small "Day N" mark.
- **AI.** Learns when you show up. Moves the question to your window.
- **Memory.** **Capsule 01**: "The month the machine learned your hours." Includes one concrete detail (most-used time of day, most frequent check-in word).
- **Floor.** 8 Log entries, 10 check-ins, 6 self-care taps.
- **Moment.** Month-end Pulse: `Month 1 unlocked.` + Capsule + badge. Dismiss phrase stays.

### M2 — STEADY HAND
- **Screen.** Mood Patterns widget (already gated at care 50% or level 20; month 2 lowers the bar for Usership). Streak ribbon in the header.
- **AI.** Begins follow-ups that reuse the user's own phrases.
- **Memory.** Capsule 02 diffs against Capsule 01: "This month compared with last."
- **Floor.** 10 Log, 14 check-ins, 8 self-care.

### M3 — ACTIVE USER · QUARTER 1
- **Screen.** Active User status (already promised by the existing M3 message). QR code unlocks (currently gated by Usership + assembly phase). Density reaches `comfortable`.
- **AI.** First "I noticed" sentence, prefixed so it is clearly an observation, never a diagnosis.
- **Memory.** Capsule 03 and **Quarter Story Q1**: the three Capsules compressed to one paragraph. First time the user sees compression *of compression*.
- **Moment.** A full-width Quarter card replaces the Month widget for 24 hours.

### M4 — PORTRAIT LINE
- **Screen.** Density goes `compact`. **Archive** opens: a vertical timeline of Capsules 01 to 04. Intention History unlocks.
- **AI.** Names a recurring theme out loud ("work" appears in 61% of low-energy entries).
- **Memory.** Capsule 04 carries a single **Portrait Line**: one sentence that is the user's current self-description. It is replaced, never appended. The old line moves into the Archive.

### M5 — CADENCE KEPT
- **Screen.** **Routine Builder**: the AI proposes a three-step self-care routine assembled from the buttons the user already presses most, with a time of day.
- **AI.** Becomes a guide, not a questioner. "You press Breathe on Sunday evenings. Make it a routine?"
- **Memory.** Capsule 05 reports the routine's first 4 weeks as a hit rate, not a score.

### M6 — HALF-YEAR SEAL · QUARTER 2
- **Screen.** The big mid-point. A **Half-Year Seal** badge (frame half filled). Psychological profile gets its first "then vs. now" row.
- **AI.** Handles its first contradiction: "In month 1 you wrote X. This month you wrote the opposite. Both can be true."
- **Memory.** Capsule 06 + Quarter Story Q2 + **Half-Year Letter**: six months in 120 words, written to the user.
- **Retention note.** Months 2–3 and 6–7 are the usual churn cliffs. This month is a planned gift, not an upsell.

### M7 — LONG LISTEN
- **Screen.** Density `dense`. Pattern Insights and the Board profile open. Citizen Index rank shown.
- **AI.** Quotes one old entry back, with its date. "On 14 April you wrote: ..."
- **Memory.** Capsule 07 anchors on a *quote*, the first Capsule that does.

### M8 — RARE AIR
- **Screen.** Architect widget goes deep. Integrity view (contradiction analysis, already built) becomes available to Usership.
- **AI.** Names one blind spot, once, with a way out. Gated by the trauma-informed protocol; skipped if distress signals are present.
- **Memory.** Capsule 08 includes the **Blind Spot** as a sidebar.

### M9 — HABIT FORMED · QUARTER 3
- **Screen.** Narrative Reflection unlocks. The AI proposes a one-line **Monthly Intention** for M10 to M12.
- **AI.** Hands more control back: the user edits the AI's draft.
- **Memory.** Capsule 09 + Quarter Story Q3. Quarter paragraphs now cross-reference each other.

### M10 — LAST QUARTER
- **Screen.** Export Data, full custom themes, Weather Station tile (the Legacy tile Machiavelli shows).
- **AI.** Questions per day drop to the minimum. It asks rarely and the questions are long.
- **Memory.** Capsule 10 states the trajectory: where the user was at M1, at M5, now.

### M11 — EVE OF YEAR
- **Screen.** Density `instrument`. Wallet and Legacy preview open.
- **AI.** Writes a *draft* of the user's Year line and asks for edits. First time the user co-authors the system's output.
- **Memory.** Capsule 11 is written as a letter to the Month-12 self.

### M12 — YEAR ONE PORTRAIT · QUARTER 4
- **Screen.** The full Machiavelli-grade layout. **Year One Portrait** page: all 12 Capsules, 4 Quarter paragraphs, the Half-Year Letter, the Year Story, the badge frame fully lit. A shareable public card (opt-in via `showMemoryStory`).
- **AI.** Hands the portrait back and goes quiet for one day.
- **Memory.** Capsule 12 + Quarter Story Q4 + **Year Story** (§5). The Year Story is the headline deliverable of the whole product.
- **After M12.** The counter becomes `Year 2 · Month 1 / 12`, the density ceiling lifts, and the Machiavelli-only layers (Wallet, Weather Station, Legacy) stay available. Year 2 content is out of scope here.

---

## 5. THE COMPRESSION LADDER

This is the 12-month tangibility mechanism. Memory is not stored once; it is *re-compressed at every scale*, and the user can open any rung.

```
ENTRY   (raw)         1 Log line / 1 answer / 1 tap          ~10-40 words each
  |
DAY     (hidden)      machine-only context                   not shown
  |
WEEK    Weekly Story  ~90 words                              exists as email today
  |
MONTH   Capsule       ~110 words + 1 line + 3 numbers        NEW (core)
  |
QUARTER Quarter Story ~70 words from 3 Capsules              NEW
  |
HALF    Half-Year Letter ~120 words                          NEW (M6)
  |
YEAR    Year Story    ~160 words + 1 Portrait Line           NEW (M12)
```

**Compression targets.** Roughly 400 raw entries a month become 110 words, then 70 words per quarter, then 160 for the year. The Year Story is the shortest account of the longest span. That inversion (less text, more truth) is the product claim.

**Rules for the compressor.**
1. Every Capsule must contain at least one *verbatim fragment* of the user's own words. This is the anti-hallucination anchor and the emotional hook.
2. Every Capsule must contain at least one *concrete number* from the Ledger.
3. Capsules never diagnose. Observation verbs only: "appeared", "returned", "went quiet".
4. A quarter or year is composed from *Capsules*, not raw entries, so the AI spends tokens once per rung. Raw entries are re-read only when the Capsule is thin.
5. Thin months (below floor) produce a short honest Capsule: "A quiet month. 3 entries. The machine kept the thread." Never padded.
6. All AI text has a deterministic local fallback (the Memory Engine already has one) so a provider outage never leaves a month blank.

---

## 6. THE MONTHLY MEMORY CAPSULE

### 6.1 Anatomy

```
MONTH 04 · PORTRAIT LINE                         12 March – 11 April
------------------------------------------------------------------
"I stopped explaining myself and started choosing."   <- Portrait Line
------------------------------------------------------------------
This month you wrote most after 22:00, and your lowest-energy
entries mentioned work. In week three you wrote, "I want less
noise, not more." The shape of the month is a narrowing:
fewer topics, longer entries.

  LOG        41 entries    (+12)
  CHECK-INS  24 / 30 days
  SELF-CARE  19 taps       top: Breathe
------------------------------------------------------------------
Months unlocked: 4 / 12            [ Archive ]  [ Next: M5 ]
```

Parts: header, Portrait Line (M4+), body paragraph (verbatim fragment + number), three-number strip (delta vs. last month), footer counter. Fits the existing `Block` component with `blockView`.

### 6.2 The delivery moment
- Fires on the anniversary day, not the 1st of the calendar month (so it is personal).
- Opens as the Month widget, replaces the Daily question area for one view, then collapses to a one-line row in the Archive.
- Stored server-side; dismissal is server-side too (§10), fixing the localStorage weakness.
- The monthly email (job 15) becomes the *same* Capsule, so the in-app and inbox versions never diverge.

### 6.3 Sample Capsules in the demo voice (Machiavelli, for the Time Machine)

These are placeholder copy for design review, written in a Renaissance-strategist register to match the existing demo `memoryStory`. Edit freely.

| M | Capsule (sample) |
|---|---|
| 1 | "The machine asked me one thing a day and I answered most of them at dusk. I wrote, 'I watch before I speak.' It noticed." |
| 2 | "Twelve entries, mostly about the Medici. The questions began to use my own words. I did not mind." |
| 3 | "A quarter spent learning that I am most honest when tired. 'Fatigue removes the courtier,' I wrote." |
| 4 | "Fewer subjects, longer notes. The line the machine kept: 'I stopped explaining myself and started choosing.'" |
| 5 | "It built me a routine from what I already do: breathe at dusk, walk the courtyard. I kept it 22 days of 30." |
| 6 | "Half a year. In month one I wrote that I trust no one; this month I wrote of one friend I trust. Both stand." |
| 7 | "On 14 April I wrote, 'Fortune favors the prepared.' The machine returned it to me. I had forgotten I believed it." |
| 8 | "A blind spot, gently named: I plan well and rest badly. It offered one evening a week of nothing." |
| 9 | "The habit holds without the streak counting it. My intention for the last quarter: 'Say less. Mean it.'" |
| 10 | "Fewer questions now, and each one longer. I answer slowly. The portrait is mostly mine." |
| 11 | "A letter to the one I will be next month: you were frightened in March and are not now." |
| 12 | "A year. The machine's last paragraph is shorter than my first note. That is the point." |

### 6.4 Year Story (sample, M12, ~160 words)
> "You arrived measuring everything and trusting little. Across twelve months the entries narrowed from many subjects to a few, and from explanation to choice. You were most honest after dark and least after long days of planning. Your routine settled around dusk: breathe, walk, write. In spring you named a blind spot, that you plan well and rest badly, and by autumn you had given it one evening a week. The word 'noise' appeared often early and rarely late. Your last intention was 'Say less. Mean it.' You kept it. The portrait the machine holds is not who you were told to be. It is who kept turning up."

---

## 7. WIDGETS

All follow the LOT label-cycling pattern: click the label to cycle views. No decorative color. ASCII bars.

### 7.1 `MonthsUnlockedWidget` ("Months unlocked: 3/12")
Context-based: it changes with where you are.
- **Views (label click cycles):** `Months` → `Next unlock` → `Badges`.
- **Months view:** `Months unlocked: 3 / 12` and `███░░░░░░░░░`
- **Next unlock view:** "Month 4 in 19 days. Opens: Archive, Intention History."
- **Context rules:** M0 shows "0 / 12 · Day 1". Within 3 days of an anniversary it shows the countdown. After M12 it shows `Year 2 · 1 / 12`.

### 7.2 `MonthlyPulseWidget` v2 (upgrade of the existing one)
- Keep the one-per-month rhythm and the dismiss phrases (they are good).
- Replace static `MONTH_MESSAGES` with the user's Capsule; keep the static line only as the thin-month fallback.
- Month counted from `usershipSince`; dismissal stored server-side.
- Adds the `[ Open Capsule ]` action.

### 7.3 `CapsuleArchiveWidget` (M4+)
Vertical list, newest first. Each row = month number, Portrait Line, three-number strip. Quarter rows (M3/6/9/12) are visually heavier: a rule above and the Quarter paragraph beneath. Tapping a row expands the full Capsule in place.

### 7.4 `YearPortraitWidget` (M12)
One page, five bands: Year Story → Portrait Line history (the six lines side by side) → 12-tick badge frame → three before/after numbers (answers, active days, self-awareness) → share card. Designed as the screenshot the user posts.

### 7.5 Badge frame
A single badge, **USERSHIP YEAR**, with 12 segments. Each month fills one segment and awards that month's named badge. The frame is the hero of the Badges view and of the share card. Rarity: M1–M5 COMMON/UNCOMMON, M6 RARE, M9 EPIC, M12 LEGENDARY (final tiers to be set against the 8-tier scale).

### 7.6 Day-1 to Day-365 screen states (summary)

```
M0   [ question ]                                     breathable
     [ log ]  [ check-in ]
     Months unlocked: 0 / 12

M3   [ question ]  [ month pulse ]                    comfortable
     [ log ]  [ check-in ]  [ mood ]  [ streak ]
     Months unlocked: 3 / 12   ███░░░░░░░░░

M6   [ question ] [ pulse ] [ archive ] [ routine ]   compact
     [ log ] [ check-in ] [ mood ] [ psych v-next ]
     Months unlocked: 6 / 12   ██████░░░░░░

M12  full cockpit: pulse, archive, portrait, board,   instrument
     architect, integrity, weather, wallet, badges
     Months unlocked: 12 / 12  ████████████
```

---

## 8. SELF-CARE AND LOG MECHANICS (WHAT FILLS EACH MONTH)

The brief names three levers: Log entries and thoughts, morning check-ins, self-care button taps. Treat them as the user's three **inputs** and the Capsule's three **numbers**.

| Input | Where it comes from today | In the Capsule strip | Gentle target (full-weight month) |
|---|---|---|---|
| Log entries | `/` Log, journal reflection, `/commands` | LOG n (+delta) | 8 → 40+ by M12 |
| Morning check-ins | `EmotionalCheckIn.tsx` | CHECK-INS n / days | 10 → 25+ |
| Self-care taps | `SelfCareMoments.tsx` | SELF-CARE n, top action | 6 → 20+ |

**How the AI guides self-care across the year**
- **M1–M3 Observe.** No advice. It watches and reports back what it saw.
- **M4–M6 Propose.** One routine at a time, built from existing habits, never imported.
- **M7–M9 Adjust.** It moves a routine when your pattern moves ("Breathe has migrated from dusk to dawn").
- **M10–M12 Release.** It prompts less. Success is the routine running without the prompt.

**Celebration, not scoring.** Affirmations are tied to a *fact*, never a score: "You checked in 24 of 30 days" rather than "Great job". No streak-shaming; a missed day is not mentioned in the Capsule unless the user asks.

**Trauma-informed guardrail.** Blind-spot and contradiction lines (M6, M8) are skipped when the engine detects distress (existing protocol, Source 8 in the Compression Architecture). A skipped line is replaced with a neutral observation.

---

## 9. MACHIAVELLI — THE MONTH-12 REFERENCE, AND THE TIME MACHINE

`/u/machiavelli` is already the proof of the end state. The 12-month system makes that proof *walkable*.

**Time Machine scrubber (proposal).** A slider on the demo page, `M0 … M12`. Dragging it re-renders the profile at that month: density ceiling, which widgets exist, which Capsule is on top, how many of the 12 segments are lit. A visitor feels the year in ten seconds. This is also the best sales surface for the paid tier.

Implementation sketch: add `usershipMonth` and `capsules[12]` to the hardcoded demo payload, pass `?m=N` (default 12) to `PublicProfile.tsx`, and have the same `monthCeiling` function used for real users read it.

**Mapping the demo's raw numbers onto the year** (so the scrubber is credible): Machiavelli's 2847 answers and 842 active days exceed one year, so the demo is labelled *Year N, Month 12 view*. The scrubber shows year one only; the totals shown at M12 stay as they are.

| Metric | M1 | M3 | M6 | M9 | M12 (demo today) |
|---|---|---|---|---|---|
| Memories compiled | 31 | 118 | 260 | 410 | 2847 (lifetime) |
| Journal entries | 9 | 40 | 96 | 150 | 1469 (lifetime) |
| Self-awareness | 12 | 31 | 52 | 70 | 87 |

The M1–M9 numbers are illustrative placeholders for design review, not derived from real data.

---

## 10. DATA MODEL, JOBS, ENDPOINTS

**Storage** (extends `user.metadata`, no migration needed to start):

```jsonc
"usership": {
  "since": "2026-11-08T00:00:00Z",       // start of paid tier; source of truth for month
  "monthsUnlocked": 3,
  "capsules": [
    { "m": 1, "from": "...", "to": "...",
      "portraitLine": null,
      "body": "...", "fragment": "...",
      "stats": { "log": 41, "checkins": 24, "selfcare": 19, "topAction": "Breathe" },
      "thin": false, "dismissedAt": null }
  ],
  "quarters": [ { "q": 1, "body": "..." } ],
  "halfYearLetter": null,
  "yearStory": null
}
```

**Month computation.** `month = floor(monthsBetween(usership.since, now))`, capped at 12 for year one. `usership.since` is set when the Usership tag is first applied. Fallback for existing users: `joinedAt`, matching today's behavior.

**Job J49: `usership-capsule-compose`.** Runs daily, finds users whose anniversary is today, composes the Capsule from the Ledger and Memory Story, stores it, queues the email. Idempotent per `(userId, m)`. Uses the existing AI path with the local fallback.

**Endpoints (proposed):**
```
GET  /api/usership/months                 -> { month, unlocked, nextAt, ceiling }
GET  /api/usership/capsule/:m
POST /api/usership/capsule/:m/dismiss     -> server-side dismissal
GET  /api/usership/year                   -> Year Story + Quarters (M12)
GET  /api/public/profile/:u?m=N           -> demo scrubber / public card
```

**Client.** `monthCeiling(month)` pure function beside `getLayoutDensity`; `useUsershipMonth()` hook; gates read `max(earnedUnlock, monthUnlock)` for the surfaces in §3 so effort can still unlock things early where the existing system already allows it.

**Build order (smallest value first):**
1. `usership.since` + month function + server-side dismissal. Fixes the three weaknesses in §1.
2. `MonthsUnlockedWidget` (pure UI, immediate tangibility).
3. Capsule composer + archive (the core).
4. Density ceiling + surface gates.
5. Badge category USERSHIP YEAR + frame.
6. Quarter, Half-Year, Year Story.
7. Time Machine scrubber on the demo page.

Each step is shippable alone.

---

## 11. EXISTING VS. NEW

| Capability | State |
|---|---|
| Usership tier, AI Memory Engine | EXISTS |
| Month N/12 widget with copy and dismissal | EXISTS (static copy, localStorage) |
| Density levels, chapters, feature gates | EXISTS (effort-driven) |
| Weekly/Monthly summary emails | EXISTS |
| Memory Story | EXISTS (single rolling story) |
| Badges (812), quests, rarity tiers | EXISTS |
| Demo account with Legacy unlocks | EXISTS (static) |
| `usershipSince` | NEW |
| Per-month Capsule + Archive | NEW (core gap) |
| Quarter / Half-Year / Year compression | NEW |
| Month-capped density | NEW |
| USERSHIP YEAR badge category | NEW |
| Time Machine scrubber | NEW |

---

## 12. RISKS AND OPEN QUESTIONS FOR S-2

1. **Hallucination risk.** A confident wrong Capsule is worse than none. Mitigation is the verbatim-fragment and concrete-number rules in §5; consider a validator that rejects a Capsule if its fragment is not found in the user's entries.
2. **Privacy.** Capsules quote the user. They must default to private. The public card and `/u/<name>` use the existing `showMemoryStory` toggle, and the Year Story share card needs an explicit preview step.
3. **Anniversary vs. calendar month.** Anniversary is more personal but harder to align with the 1st-of-month email. Recommendation: anniversary, with the email following it.
4. **Chapter source of truth.** Should Usership chapters (month) override the existing level-based chapters (1/10/30/60)? Recommendation: keep both; show the Usership chapter on the Months widget and the level chapter in the profile.
5. **Month ceiling vs. earned.** Capping density by month may annoy heavy users. Alternative: a soft cap that lets effort advance one density step early.
6. **Price anchor.** At $99 a month, M1–M3 must feel worth it on their own. If the Capsule only lands at M1 end, consider a Week-1 Story as a Day-7 hook.
7. **Churn cliffs** at M2–3 and M6–7. The plan puts the Quarter card (M3) and the Half-Year Letter (M6) on those exact cliffs by intent.
8. **Existing users.** Those already past 12 months from `joinedAt` should land on Year 2. Needs a one-time backfill and a decision on whether to generate historic Capsules (recommended: generate M-last only, plus a "your year so far" summary).
9. **Badge names** need the Codex v32 collision check.
10. **Live page verification.** Re-check `/u/machiavelli` visually; the sandbox could not load it.

---

## 13. APPENDIX — SOURCES READ THIS SESSION

`docs/README.md` · `docs/technical/INTERFACE_EVOLUTION.md` · `docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md` · `docs/technical/LOT-STYLE-GUIDE.md` · `docs/corporate/LOT-AI-PRODUCT-BRIEF.md` · `docs/corporate/LOT-FEATURE-INVENTORY-2026.md` (§06, §16) · `docs/benchmark/LOT-MANIFEST.md` · `docs/benchmark/LOT-LEDGER.md` · `docs/wiki/LOT-WIKI-v83.md` (vocab) · `docs/LOT-SR-20260805-01.md` · `src/client/components/MonthlyPulseWidget.tsx` · `src/client/utils/interfaceEvolution.ts` · `src/server/routes/public-api.ts` (demo payload) · `src/server/routes/api.ts` (Memory Story cache) · `src/server/models/user.ts`.

Not individually read: the ~40 `LOT-WIKI-v*` and ~30 badge Codex files (6.7 MB); they were searched for Usership, tier, and badge-name collisions only.

---
*End of document. Companion session report: `docs/LOT-SR-20261108-01.md`.*
