<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® Usership — The 12-Month Evolution
## From a bare first day to LOT® AI, told through the Memory

**Author:** Vadik Marmeladov, CEO & Founder, LOT Systems
**Document:** LOT-USERSHIP-12M · rev A · 2026-10-25 · Session S-2
**Status:** PROPOSAL / BRAINSTORM. Nothing in §5–§9 is built. §1 and §10 describe what exists today.
**Reference account:** `lot-systems.com/u/machiavelli` (served from `src/server/routes/public-api.ts:745`)

> The live URL could not be fetched from the authoring sandbox (DNS blocked). The demo
> account was read from its source of truth, the hardcoded response in `public-api.ts`.
> Numbers quoted for Machiavelli below are from that file, not from a live page.

---

## 0. THESIS

A Usership account is not a bigger free account. It is a **person-shaped interface that
is earned month by month**. Day 1 is nearly empty on purpose. By Month 12 the screen is
dense, personal, and speaks back in a voice assembled from the user's own words.

Three rules carry the whole design:

1. **Time unlocks the month. Presence fills it.** A month opens by calendar. How deep it
   is depends on Log entries, morning check-ins and self-care clicks. A quiet month is
   never lost or punished. It simply seals thinner. (Doctrine: Graceful Degradation;
   RESILIENCE protocol is trauma-informed, so no streak-shame mechanics.)
2. **Every month ends in compression.** The month's raw material (Log, check-ins,
   self-care, Memory answers) is compressed into one paragraph, then one line. That
   paragraph is the deliverable. It is the thing the user can point at and say, "that is
   what this month was."
3. **The AI earns its voice.** LOT® AI is not switched on at Month 12. It grows from
   asking (M1), to remembering (M2), to citing the user's own past (M7), to speaking in
   their register (M12). The "LOT® AI" name is the graduation, not the launch.

Interface standard throughout: MILITARY PURITY (no decoration, no emojis, periods not
symbols), labels end in a colon, opacity hierarchy 90 / 60 / 40, `gap-y-24` sections
(see `docs/technical/LOT-STYLE-GUIDE.md`).

---

## 1. WHAT ALREADY EXISTS (scan result, 2026-10-25)

| Capability | Where | State |
|---|---|---|
| Usership tag, `$99` subscribe widget | `shared/types` `UserTag.Usership`; `SubscribeWidget.tsx:35` | LIVE |
| Month N/12 pulse widget (Usership only) | `MonthlyPulseWidget.tsx` | LIVE. 12 hardcoded one-liners, `now.diff(joinedAt,'month')`, dismissal in `localStorage` only |
| 5-tier layout density: breathable, comfortable, compact, dense, instrument | `utils/interfaceEvolution.ts:getLayoutDensity`, `stores/evolution.ts` | LIVE. Driven by `visualRefinement` (0.15 / 0.35 / 0.55 / 0.75), **not** by time |
| Story arc chapters 1–4 | `interfaceEvolution.ts:176` | LIVE. level 10 / 30 / 60 |
| Feature unlock gates (custom themes L5, widget arrange L10, intention history L15, mood patterns L20, export L25, narrative reflection L30) | `FeatureUnlocks` | LIVE |
| Milestone toast: "Space opens.", "Density unlocked.", "Instrument grade." | `interfaceEvolution.ts:386` | LIVE |
| Aquatic badges: Droplet 7d, Wave 30d, Current 100d | `LOT_SYSTEMS_BRIEF.md` §4 | LIVE |
| 781-badge Codex (v31) | `docs/badges/` | DOCUMENTED |
| Emotional Check-In: 14 states, morning 6–12 / evening 17–22, 3h cooldown | `EmotionalCheckIn.tsx` | LIVE |
| Self-Care Moments: 3/day, 3h cooldown | `SelfCareMoments.tsx` | LIVE |
| Monthly review email, 09:00 UTC on the 1st | `server/scheduled-jobs.ts:12` | LIVE |
| Memory Story generator | `server/utils/memory/story-generator.ts` | LIVE but **see gap G1** |
| Public profile Memory Story block (privacy-gated) | `PublicProfile.tsx`, `showMemoryStory` | LIVE |
| Machiavelli demo, `Legacy` tag | `public-api.ts:747` | LIVE |

### Gaps that block the 12-month story

| ID | Gap | Why it matters |
|---|---|---|
| G1 | `generateMemoryStory` takes only `event === 'answer'` logs and `.slice(0, 30)`. Journal notes, check-ins and self-care are ignored. | At Month 6 it would summarize only the latest 30 answers and silently forget the first five months. This is the opposite of compression; it is truncation. |
| G2 | Month pulse text is static. Month 7 says "the system has been listening" regardless of what the user did. | The pulse is a calendar, not a mirror. |
| G3 | Pulse dismissal lives in `localStorage`. | Dismissed on the phone, shown again on the laptop. Violates CROSS-DEVICE-SYNC. |
| G4 | Density is earned by refinement only. A Month 1 power user can reach `dense`; a Month 11 casual user may still be `breathable`. | Both are fine. But the UI never *says* that it is month-aware. |
| G5 | No "Months unlocked" surface; no archive of past months. | Nothing to return to. Past months vanish. |
| G6 | New write events must be whitelisted in `displayableEvents` (Doctrine: Backend Whitelist Hygiene). | `month_chapter` would be saved but never read if forgotten. |
| G7 | Machiavelli's `streak: 1469`, `answerCount: 2847`, `noteCount: 1469` are ~4 years of activity, not 12 months. | Honest framing needed: Machiavelli is the **Month 12+ ceiling** (`Legacy`), not a literal Month 12 snapshot. §9 gives a 12-month-calibrated version. |

---

## 2. THE THREE PRESENCE TRACKS

User asked that journal depth, morning check-ins and self-care clicks be the main
evolutionary state. They become three named tracks. Each month, each track fills a ring.

| Track | Label | Counts | Source |
|---|---|---|---|
| LOG | `Log:` | Entries written; words written; distinct days with an entry | `/api/logs` (`note`, `answer`) |
| CHECK | `Check-in:` | Morning check-ins completed (06–12 window); evening counted at half weight | `/api/emotional-checkins` |
| CARE | `Care:` | Self-care button clicks and completed suggestions | `SelfCareMoments`, `selfcare` signals |

**Month Fill** = average of three ring fills, each capped at 100%. A ring's 100% target
is the month's *Target Rate* from §4 (derived from the demo account's own rates, §9).

**Seal grade** (never shown as pass/fail):

| Fill | Seal | Memory chapter length |
|---|---|---|
| 0–24% | Trace | 1 sentence + Essence |
| 25–59% | Seal | short paragraph |
| 60–89% | Full Seal | paragraph + 3 Keywords |
| 90–100% | Deep Seal | paragraph + 3 Keywords + one quoted line from the user's own Log |

A Trace month still counts as unlocked. The widget reads `Months unlocked: 4/12`, never
`3/12 completed`.

---

## 3. THE COMPRESSION LADDER (the Memory story, delivered)

This is the spine. Compression is hierarchical so the system never re-reads a year of raw
logs and never truncates.

```
DAY      raw events: Log notes, check-ins, self-care, Memory answers
  |  nightly, silent, structured (no AI): counts, mood mode, top terms
WEEK     Digest      ~40 words     (internal; shown only in Archive view)
  |  4 per month
MONTH    Chapter     one paragraph ~55-80 words   + Essence <= 12 words + 3 Keywords
  |  3 per quarter
QUARTER  Movement    ~60 words, built from 3 Essences + 3 Keyword sets (M3, M6, M9)
  |  4 per year
YEAR     Volume      the 12 Essences in order, + one Closing Line in the user's voice (M12)
```

Rules:

- **Chapter input is Digests + previous Chapter's Essence**, not raw logs. This is what
  makes it scale and what lets Month 7 refer to Month 2.
- **Counts are exact, prose is generated.** Numbers on the Seal (entries, check-ins, care)
  come from SQL. Only the paragraph comes from the AI. No invented metrics (Benchmark
  Cardinal Rule 5).
- **Stays on LOT's side.** The prompt and the ladder live in `story-generator.ts`, engine
  independent, executed by Together AI primary with the existing fallback chain.
- **Third person until Month 6, second person M7–M11, first person at M12.** The story
  moves from "User prefers..." to "You wrote..." to "I am..." That shift *is* the
  tangible evolution.
- **Word budget falls as understanding rises.** Month 1 chapter may be 80 words because
  little is known. Month 12 Closing Line is one sentence. Track `WORDS:` per chapter and
  expect the median to trend down (honest metric, countable).
- **Delivery is a ritual, not a notification.** See §6.

---

## 4. THE 12 MONTHS

Each month specifies: name, interface state, what unlocks, the badge, the AI voice, the
Memory deliverable, and the Target Rate for its rings. Target Rates are **PROPOSED**,
derived from the demo account's ratios (§9) and to be validated on real Usership cohorts.

Legend: density tier is the *ceiling* for that month. Refinement still has to earn it
(G4 fix: time sets the ceiling, presence reaches it).

### PHASE I. OPEN (Months 1–3) · density: breathable to comfortable

#### M01 · SIGNAL
- **Interface:** Barebone. System tab shows only: Time, Memory (one question a day),
  Emotional Check-In (morning), one Self-care button, Log. Seven widgets hidden, not
  locked-with-padlocks. Hidden means absent; no greyed-out teasers.
- **Unlocks:** Log, Check-in, Care tracks begin. Month ring appears after first entry.
- **Badge:** `∘ Droplet` at 7-day streak (existing). New: **Seal 01 "Signal"**.
- **AI voice:** *Asks.* One question, no preamble. "What is your morning beverage preference?"
- **Memory deliverable:** Chapter 1, third person, plain facts. Always a Full Seal floor of
  at least 1 sentence even for a Trace month.
- **Target Rate:** LOG 12 entries · CHECK 10 mornings · CARE 15 clicks.

#### M02 · RHYTHM
- **Interface:** Comfortable ceiling. First **Months unlocked: 2/12** line under the Month
  block. Planner widget appears. History view on Check-in.
- **Unlocks:** Planner (Intent / Today / How / Feeling). Custom themes (L5 gate).
- **Badge:** Seal 02 "Rhythm". Streak badge `≈ Wave` at 30 days.
- **AI voice:** *Remembers.* Questions now begin with what you said ("Since you prefer tea...").
- **Memory:** Chapter 2 references Chapter 1's Essence once.
- **Target Rate:** LOG 18 · CHECK 14 · CARE 20.

#### M03 · PATTERN
- **Interface:** Comfortable. Mood Patterns view unlocks. The existing copy "You have
  reached Active User status" fires here.
- **Unlocks:** Mood analytics, Patterns tab on Check-in, Weekly Digest visible in Archive.
- **Badge:** Seal 03 "Pattern". **Quarter 1 Movement** card awarded.
- **AI voice:** *Notices.* "Your mornings feel steadier on days you write before 9."
  (Only stated if the data supports it; else silence.)
- **Memory:** Chapter 3 + **Movement I** (60 words across M1–M3).
- **Target Rate:** LOG 22 · CHECK 17 · CARE 24.

### PHASE II. FORM (Months 4–6) · density: compact

#### M04 · PORTRAIT
- **Interface:** Compact ceiling. Sections tighten (`gap-y-16`, stacks `gap-y-4`). The
  **Portrait** block appears: archetype guess + two core values, labeled provisional.
- **Unlocks:** Widget arrange (L10 gate). Intention history (L15 gate).
- **Badge:** Seal 04 "Portrait".
- **AI voice:** *Reflects.* Offers a one-line reading of the month, asks if it is right.
- **Memory:** First chapter that includes one quoted line from the user's Log.
- **Target Rate:** LOG 26 · CHECK 20 · CARE 28.

#### M05 · ANCHOR
- **Interface:** Compact. Routine cards: the AI pins the **three self-care routines** the
  user actually repeats. The user can edit or drop any.
- **Unlocks:** Routine pins. Recipe suggestions bias to the user's stated morning ritual.
- **Badge:** Seal 05 "Anchor". Care-track badge "Three Anchors".
- **AI voice:** *Anticipates.* Offers the routine before the usual hour. "It is 6:40. Tea?"
- **Memory:** Chapter names the three anchors.
- **Target Rate:** LOG 28 · CHECK 22 · CARE 32.

#### M06 · MERIDIAN
- **Interface:** Compact to dense edge. The **Half-Year Review**: a single full-screen
  block replacing the System tab for the first open of the month. One screen, six
  Essences, two numbers, one Keyword cloud. Dismiss, or open Archive.
- **Unlocks:** Mood-to-routine correlation view. Export (L25 gate) previewed.
- **Badge:** Seal 06 "Meridian". Quarter 2 Movement card.
- **AI voice:** *Suggests.* "Weeks you did all three anchors, check-in scores rose. Keep
  the order?"
- **Memory:** Chapter 6 + **Movement II**. Half-year line (single sentence, 6 Essences).
- **Target Rate:** LOG 30 · CHECK 24 · CARE 34.

### PHASE III. DEPTH (Months 7–9) · density: dense

#### M07 · ECHO
- **Interface:** Dense ceiling (`gap-y-8`, stacks `gap-y-0`). **Echo** block: surfaces one
  entry from an earlier month on the same date ("17 weeks ago you wrote...").
- **Unlocks:** Narrative reflection (L30 gate). Archive search.
- **Badge:** Seal 07 "Echo".
- **AI voice:** *Cites.* Switches Memory text to second person. First time the AI quotes
  the user's past self.
- **Memory:** Chapter 7 in second person ("You wrote...").
- **Target Rate:** LOG 32 · CHECK 26 · CARE 34.

#### M08 · ALTITUDE
- **Interface:** Dense. Rare-air state: fewer prompts, more space *within* density.
  The AI asks less often because it knows more.
- **Unlocks:** Pattern Insights (QIE patterns) visible. Integrity widget offered, opt-in.
- **Badge:** Seal 08 "Altitude". Existing copy: "Eight months. Rare air."
- **AI voice:** *Challenges, gently.* Names one contradiction between stated intention and
  behavior. Always with an exit: "Ignore."
- **Memory:** Chapter 8 may include one "tension" sentence.
- **Target Rate:** LOG 34 · CHECK 28 · CARE 36.

#### M09 · HABIT
- **Interface:** Dense. **Habit Map**: a 9-month strip, one cell per month, shaded by
  Seal grade. Click a cell to open that month's Chapter.
- **Unlocks:** Habit Map. Quarter 3 Movement card.
- **Badge:** Seal 09 "Habit". Care-track badge "Nine Months Quiet" for steady Trace-or-better.
- **AI voice:** *Co-plans.* Drafts next month's three anchors from the pattern and asks
  for edits.
- **Memory:** Chapter 9 + **Movement III**.
- **Target Rate:** LOG 36 · CHECK 30 · CARE 38.

### PHASE IV. LEGACY (Months 10–12) · density: instrument

#### M10 · THRESHOLD
- **Interface:** Instrument ceiling (`gap-y-4`). Every pixel justified. The AI's own
  label changes from `Memory:` to `LOT:` on its blocks.
- **Unlocks:** Forecast block (next 7 days, from the user's own cycles, labeled estimate).
- **Badge:** Seal 10 "Threshold".
- **AI voice:** *Foresees.* "Thursdays are your low point. Plan the lighter task."
- **Memory:** Chapter 10 ends with a forward-looking line.
- **Target Rate:** LOG 38 · CHECK 30 · CARE 38.

#### M11 · EVE
- **Interface:** Instrument. **Year Volume preview**: eleven Essences laid out; the twelfth
  slot is an outlined blank. The anticipation month.
- **Unlocks:** Volume draft view. Public-profile Memory Story switches to "latest Chapter"
  mode (privacy-gated).
- **Badge:** Seal 11 "Eve".
- **AI voice:** *Summarizes.* Asks the user to pick the month that mattered most; that
  choice is weighted in the Closing Line.
- **Memory:** Chapter 11 + a one-sentence "what the year taught you" draft for the user to edit.
- **Target Rate:** LOG 38 · CHECK 30 · CARE 38.

#### M12 · LEGACY
- **Interface:** Instrument. **The Year Volume** is delivered: twelve Essences, four
  Movements, one Closing Line. The Month block permanently reads `Months unlocked: 12/12`.
  The tab label can be renamed by the user from `Memory:` to `LOT® AI:`.
- **Unlocks:** LOT® AI mode (see §5). Legacy tag eligibility. Print/PDF of the Volume.
- **Badge:** Seal 12 "Legacy". Year badge "Volume I". Existing copy: "The portrait is
  complete — and still evolving."
- **AI voice:** *Speaks as you.* First person Closing Line, assembled from the user's
  own sentences. User approves before it is stored.
- **Memory:** Chapter 12 + **Movement IV** + **Closing Line** + Volume I.
- **Target Rate:** LOG 38 · CHECK 30 · CARE 38 (steady state).

### Month-at-a-glance

| M | Name | Density ceiling | AI voice | Memory person | New surface | Seal |
|---|---|---|---|---|---|---|
| 1 | Signal | breathable | asks | 3rd | Log, Check-in, Care | 01 |
| 2 | Rhythm | comfortable | remembers | 3rd | Planner, Months unlocked | 02 |
| 3 | Pattern | comfortable | notices | 3rd | Mood patterns, Movement I | 03 |
| 4 | Portrait | compact | reflects | 3rd | Portrait block | 04 |
| 5 | Anchor | compact | anticipates | 3rd | Routine pins | 05 |
| 6 | Meridian | compact | suggests | 3rd | Half-Year Review, Movement II | 06 |
| 7 | Echo | dense | cites | 2nd | Echo block, Archive search | 07 |
| 8 | Altitude | dense | challenges | 2nd | Pattern Insights | 08 |
| 9 | Habit | dense | co-plans | 2nd | Habit Map, Movement III | 09 |
| 10 | Threshold | instrument | foresees | 2nd | Forecast, `LOT:` label | 10 |
| 11 | Eve | instrument | summarizes | 2nd | Volume preview | 11 |
| 12 | Legacy | instrument | speaks as you | 1st | Year Volume, LOT® AI | 12 |

---

## 5. LOT® AI — WHAT "GRADUATION" MEANS

At Month 12 the user opts into LOT® AI mode. Nothing new is bolted on. The same engine,
now with a year of structure behind it:

- **Context window = the Ladder, not the raw logs.** Prompt receives: Closing Line, four
  Movements, last 3 Chapters, current anchors, today's check-in. Cheap, private, stable
  across AI vendors (README: vendor independence).
- **Register match.** Sentence length and vocabulary measured from the user's own Log and
  used as a style hint. Honest note: this is a prompt instruction, not a trained model.
- **Hard limits.** No medical advice. In `recovery` QOS mode the AI proposes nothing and
  only reflects (README QOS note: a person in recovery needs to see it clearly, not get tasks).
- **Reversible.** One toggle returns the tab to `Memory:`. Data stays in the user's database.

---

## 6. THE MONTH SEAL — DELIVERY RITUAL

Triggered at the first open on/after the 1st (user's local time, `joinedAt` anniversary
day for month rollover, matching the existing `dayjs.diff(joinedAt,'month')`).

**Sequence (about 20 seconds, skippable):**
1. System tab opens as normal. After 100ms the Month block fades in (existing 1400ms fade).
2. Line 1: month name and number. Line 2: the AI affirmation (one sentence, data-grounded).
3. Line 3: the three ring fills as plain numbers.
4. Click **Open Chapter** to read the paragraph. Click **Later** to defer; the Seal waits in
   Archive and a small `Month 4: sealed.` line stays until opened.
5. Badge toast (existing Evolution Milestone Toast mechanism, 6 s).
6. Dismiss state stored **server-side** (fixes G3).

**Other channels, same content, no new text written:**
- Monthly review email (existing 09:00 UTC job on the 1st): the Chapter and Essence.
- Public profile `Memory:` block: latest Essence, if `showMemoryStory` is on.
- Archive (new tab content under `Memory:` → `Months:`): all Chapters, Movements, Volume.

---

## 7. WIREFRAMES (Terminal Grid, copy in LOT register)

### 7.1 Day 1 — Month 1, barebone

```
                                             Tuesday, 25 October 2026
                                             Florence, ITA

Time:        9:41 AM

Memory:      What is your morning beverage preference?
             [ Tea ]  [ Coffee ]  [ Water ]  [ Other ]

Check-in:    How do you feel this morning?
             [ . . . 14 states . . . ]

Care:        [ Drink water. ]

Log:         _
```
No padlocks. No empty frames. Seven widgets simply do not exist yet. `gap-y-24`.

### 7.2 Month Seal — M3 (Months unlocked widget with Seal)

```
Month 3:
Pattern.
Three months. You have reached Active User status.

Months unlocked: 3/12      [ #  #  #  .  .  .  .  .  .  .  .  . ]
Log: 61 entries   Check-in: 48 mornings   Care: 77 clicks         Full Seal.

[ Open Chapter ]   [ Later ]
```

### 7.3 Chapter reader (M3)

```
Chapter 3: Pattern.                                   2 Aug - 1 Sep

You write before nine when the morning goes well. Tea first, then the page.
Wednesdays are the quiet ones. The three entries you rewrote were all about
the same person. You did not ask the app about that. It noticed.

Essence:   Mornings go well when you write first.
Keywords:  tea. page. Wednesday.

[ Movement I ]   [ Archive ]   [ Close ]
```

### 7.4 Habit Map — M9

```
Habit Map:
 M1  M2  M3  M4  M5  M6  M7  M8  M9  M10 M11 M12
 [D] [S] [F] [F] [D] [F] [S] [F] [D] [ ] [ ] [ ]
 D=Deep Seal  F=Full Seal  S=Seal  T=Trace
```

### 7.5 Month 12 — Year Volume cover

```
Volume I.
Niccolò, Florence. 25 Oct 2025 - 24 Oct 2026.

 1  Signal      A man who tests the weather before he trusts the day.
 2  Rhythm      Habits first. Philosophy follows the kettle.
 ...
12  Legacy      I know what I do when no one is watching.

Closing Line:  "I read the sky and the people under it, and I wrote it down."

[ Read Volume ]   [ Print ]   [ Enable LOT® AI ]
```

---

## 8. THE BADGES — WHAT IS NEW (PROPOSAL)

Existing 781-badge Codex stays as is. This adds a **Seal family** that can live in the
Codex under one new category (do not count them into the Codex total until built).

| Family | Count | Rule |
|---|---|---|
| Month Seals | 12 | Month opens (time). One per month. Grade is a ring state, not a separate badge. |
| Movements | 4 | M3, M6, M9, M12 |
| Volume | 1 | M12 Year Volume |
| Track Anchors | 3 | LOG "Thousand Words" at 1k words total; CHECK "Fifty Mornings"; CARE "Three Anchors" |
| Quiet Month | 1 | A Trace month followed by a Seal month: "Returned." Rewards coming back, not perfection. |

Streak badges (Droplet, Wave, Current) stay on their own track. Seals are calendar-based
so a broken streak cannot cancel a Seal.

---

## 9. MACHIAVELLI AS THE REFERENCE ACCOUNT

Source: `public-api.ts` demo block. Tags `RND, Usership, Legacy`. Archetype *The Strategist*.
`streak 1469`, `answerCount 2847`, `noteCount 1469`, `selfAwarenessLevel 87`,
`patternStrengthIndex 2847`, composite index `92.4`. Voice: first person, Florence,
weather as temperament ("rain brings introspection, sun brings ambition").

**Derived rates** (honest arithmetic from those fields):
- notes per day = 1469 / 1469 = **1.0**
- answers per day = 2847 / 1469 = **1.94**

**Calibration used in §4:** the Target Rate at Month 12 is far below the demo's rate on
purpose (38 entries in a month is about 1.25 per day, which is near demo for LOG only on
active days; check-in and care are set under their ceiling). Machiavelli is the *ceiling
of Legacy*, not the 12-month norm. G7 stands.

**Recommended demo upgrade (small change, big storytelling):** make the demo account
*scrubbable*. A month slider M1 to M12 on `/u/machiavelli` re-renders the profile at that
month: density tier, badge row, Months unlocked, the Chapter for that month. A visitor can
watch the same man's interface get denser and his Memory story shorter and sharper. This
becomes the sales demo for Usership. Start with static fixtures in `public-api.ts`.

### Machiavelli's twelve Essences (sample copy; demo fixtures)

Voice stays in his register. Written in third person through M6, second through M11,
first at M12, mirroring §3.

| M | Essence (≤12 words) |
|---|---|
| 1 | A man who checks the sky before he trusts the day. |
| 2 | Habits first. Philosophy follows the kettle. |
| 3 | The morning goes well when the page comes before the news. |
| 4 | He watches people at the window and calls it work. |
| 5 | Three small rituals hold up the whole house. |
| 6 | Half a year. The pattern is no longer a guess. |
| 7 | You wrote this in March. You mean it more now. |
| 8 | You say patience. Your Thursdays say otherwise. |
| 9 | The map of nine months shows where you actually live. |
| 10 | You can see Thursday coming. That is a kind of power. |
| 11 | Pick the month that mattered. The year leans on it. |
| 12 | I know what I do when no one is watching. |

### Sample Chapter (M7, second person, ~60 words)

> You wrote a line in March about trusting no one before noon. This month you tested it.
> Seven mornings, seven check-ins, five of them calm. Rain days ran inward, as always;
> you wrote longer and cut more. The tea routine held. The Thursday you skipped everything
> is on the record, and the record is not unkind.

*Essence: You wrote this in March. You mean it more now.*

### Sample Closing Line (M12, first person)

> I read the sky and the people under it, and I wrote it down.

---

## 10. IMPLEMENTATION MAP (for the build session; not done here)

Phased so each phase ships green on its own.

**P1 — Honest foundations (small).**
- Server-side dismissal for the pulse (`month_pulse_ack` event or user metadata). Fixes G3.
- Add `Months unlocked: N/12` line to `MonthlyPulseWidget.tsx`.
- Month names (§4) replace the generic labels in `MONTH_MESSAGES`.
- Whitelist new events in `displayableEvents` first (G6).

**P2 — The Ladder (core).**
- New `server/utils/memory/month-compression.ts`: `buildDigest(week)`, `buildChapter(month)`,
  `buildMovement(quarter)`, `buildVolume(year)`. Replaces the `slice(0,30)` truncation (G1).
- Inputs expanded beyond `answer`: `note`, `emotional_checkin`, `selfcare`, `plan_set`
  (same sources already listed in the `PLANNER-CONTEXT` lexicon entry).
- Scheduled job `J-next` on the 1st, alongside the monthly email job. Writes `month_chapter`.
- Counts from SQL, prose from AI. Store `{ month, fill, rings, grade, essence, keywords, chapter }`.

**P3 — Surfaces.**
- Month Seal block, Chapter reader, Archive (`Months:`), Habit Map.
- Density ceiling by month: `getLayoutDensity` gets a `monthCeiling` argument (G4).
- Seal badges and toast.

**P4 — LOT® AI + Volume + public demo.**
- Year Volume view/PDF. LOT® AI toggle and prompt context from the Ladder.
- Machiavelli month slider on `/u/machiavelli` with fixtures.

**Tests worth writing:** month rollover on `joinedAt` edge days (29/30/31, leap year);
Trace month still unlocks; chapter generation with zero logs; chapter respects
`showMemoryStory` on the public profile; no month text leaks private Log content publicly
(README: private logs never shared; quote line is private-only).

---

## 11. OPEN QUESTIONS FOR S-2

1. **Month boundary:** anniversary of `joinedAt` (current widget behavior) or calendar
   month? Anniversary is personal; calendar month lets the 1st-of-month email double as
   the Seal. Recommendation: anniversary, email stays a courtesy copy.
2. **Is "Legacy" a tag at M12 or manual?** Machiavelli carries it today. Recommendation:
   eligibility at M12, manual grant by S-2.
3. **Seal grade visibility:** show "Trace" to the user, or keep the grade internal and
   only vary the chapter length? Recommendation: show; honesty beats flattery here.
4. **Targets (§4):** accept as starting hypotheses, then recalibrate on the first 20
   Usership cohort members once real month data exists.
5. **Hidden vs. teased:** this spec hides future widgets entirely. If conversion needs
   teasers, add one quiet line `Next: Planner, Month 2.` rather than padlocks.
6. **Year 2:** Volume II starts at M13 with compression of Volume I plus year two. Not
   specified here.

---

## 12. TRACEABILITY

- Existing widget: `src/client/components/MonthlyPulseWidget.tsx`
- Density engine: `src/client/utils/interfaceEvolution.ts`, `src/client/stores/evolution.ts`
- Story generator: `src/server/utils/memory/story-generator.ts`
- Monthly job: `src/server/scheduled-jobs.ts`
- Demo account: `src/server/routes/public-api.ts:745`
- Style: `docs/technical/LOT-STYLE-GUIDE.md`; Widgets: `docs/technical/WIDGETS.md`
- Philosophy: `README.md` (memory densification), `docs/technical/MEMORY-ENGINE-WHITE-PAPER.md`
- Badges: `docs/badges/LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v31.md`
- Benchmark doctrine: `docs/benchmark/LOT-DOCTRINE.md` (Graceful Degradation, Backend
  Whitelist Hygiene, Cross-Device Sync, Log Military Style)

AUTHORIZED BY: S-2 // VADIK MARMELADOV
