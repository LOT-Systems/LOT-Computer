# SESSION REPORT: USERSHIP · TWELVE MONTHS
## Date: 2026-11-20 · Branch: `claude/elegant-mendel-c3ie4f`
### Session type: Product blueprint. 12-month evolution of the paid tier, from bare-bones Day 1 to LOT® AI

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS CORPORATION · SESSION REPORT                       ║
║  USERSHIP · TWELVE MONTHS · The Compressed Memory Story         ║
║  November 20, 2026 · Day 1180+                                  ║
║  Authorized: S-2                                                ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 0. THE IDEA IN ONE PARAGRAPH

Usership is a 12-chapter book that the person writes by living, and LOT® compresses.
On Day 1 the paid tier is deliberately bare: a clock, one Memory question, the Log,
a morning check-in and the self-care buttons. Each month the person *earns* a month,
through presence and not just calendar time. When they do, three things happen at once:
(1) a new **block** appears on their personal OS at `lot-systems.com/u/<user>`,
(2) a new **badge** is struck, and (3) the Memory Engine **compresses** the previous month
into a paragraph, while older months fold into a line and quarters fold into a title.
By Month 12 the profile has assembled into the full shape of the demo account
`lot-systems.com/u/machiavelli`, and the system has become **LOT® AI**: a companion that
holds a year of the person, compressed into a story they can read in one minute.

> The evolution is not a feature tour. It is a story the person can *see shrinking into
> meaning*: thirty days become a paragraph, a quarter becomes a sentence, and a year becomes a title.

---

## 1. SESSION FRAMEWORK COMPLIANCE

| Step | Requirement | Done |
|------|-------------|------|
| 1 | Scan the repository | `src/` (client, server, shared), 64 client components, stores, hooks, routes, scheduled jobs |
| 2 | Read the .MDs | 381 .md files indexed. Read in depth: `README.md`, `docs/README.md`, `docs/technical/LOT-STYLE-GUIDE.md`, `INTERFACE_EVOLUTION.md`, `MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md`, `docs/benchmark/LOT-DOCTRINE.md`, `LOT-SR-20261117-CODEX-v33.md`, wiki v83 (Usership definition) |
| 3 | Push the session with a detailed .MD | This file |
| 4 | Focus on 12-month tangibility of the compressed Memory Story | §4 (Memory Strata) and the month-by-month spec in §5 |

### 1.1 What already exists and what this plan builds on

| Asset | File | Role in the 12-month system |
|-------|------|-----------------------------|
| `MonthlyPulseWidget` | `src/client/components/MonthlyPulseWidget.tsx` | Has 12 month messages and a `N / 12 months` line. **Seed of the Chapter widget.** |
| Monthly summary + Memory Story generator | `src/server/utils/monthly-summary.ts`, `scheduled-jobs.ts` | Already produces `narrative`, `forwardLook` and `memoryStory` once a month (email). **Engine for compression.** |
| Interface Evolution store | `src/client/stores/evolution.ts`, `utils/interfaceEvolution.ts` | 7 dimensions, `badgeTier`, layout density, feature unlocks. **Visual-evolution layer.** |
| `useLogContext` | `src/client/hooks/useLogContext.ts` | Counts journal (`note`), check-ins (`emotional_checkin`), self-care (`self_care_complete`), answers. **Presence meter.** |
| Public profile | `src/client/components/PublicProfile.tsx` | Blocks: Profile, Team, Local time, Weather, Sound, Memory Story, Psych profile, Indexes, Citizen Index, Weather Station, Wallet, QR. **The canvas that assembles over 12 months.** |
| Demo account | `src/server/routes/public-api.ts` (`machiavelli`) | Fully evolved reference: archetype, core values, patterns, cohort, indexes, board profile, legacy unlocks. **Month 12 target shape.** |
| Usership gate | `src/server/models/user.ts` | `memoryEngine: 'ai'` for Usership + AI engine. **LOT® AI switch.** |

### 1.2 Gaps found during the scan (fix before build)

1. **Month counter uses `joinedAt`, not the Usership start.** A person who joined free in 2025
   and upgrades today would open on "Month 11". We need `metadata.usership.startedAt`.
2. **Dismissal is stored in `localStorage`.** The month celebration repeats on every device and
   disappears on a cleared browser. It should be stored server-side in `metadata.usership.seen`.
3. **The self-care event name is split.** The writer (`SelfCareMoments.tsx:202`) emits
   `self_care_complete`. Several readers (`energy.ts`, `rpg-narrative.ts`,
   `compassionate-interventions.ts`, parts of `api.ts` and `scheduled-jobs.ts`) look for
   `self_care_completed`, so those readers silently miss real self-care clicks. The presence
   meter must count both until the names are unified. *(Doctrine: Silent Erasure.)*
4. **The monthly summary fires on calendar days 1 to 3**, not on the person's Usership anniversary.
   Chapters should turn on the person's own day (for example the 14th → the 14th).

---

## 2. THE MODEL: A MONTH IS EARNED, NOT ELAPSED

A month **unlocks** when both conditions are true:

```
  TIME     ≥ 30 days since the previous unlock (or since Usership start)
  PRESENCE ≥ the month's quorum (see table)
```

If time passes but presence falls short, the month is **Held**, not lost:

```
  Month 4 · Held.
  3 more present days.
```

No guilt and no streak-shaming: the chapter waits for the person. *(Style guide: non-pushy, assumes agency.)*

### 2.1 Presence signals (all already logged)

| Signal | Log event | Weight | Why it matters |
|--------|-----------|--------|----------------|
| Journal entry | `note` (text > 20 chars) | **3** | Raw material for the story. The Memory Engine reads it directly. |
| Thought in Log | `note` (short), `intention` | 1 | Micro-signal of attention |
| Morning check-in | `emotional_checkin` (type `morning`) | **2** | The daily anchor. The arc of mood across the year. |
| Self-care click | `self_care_complete` / `_completed` | **2** | Evidence of care in action. Drives the "person" index. |
| Memory answer | `answer` | 1 | Compression input. Sharpens the archetype. |

A **present day** is any day with at least one weighted point ≥ 2 (one check-in, one self-care,
or one journal entry). This keeps the gate humane: one meaningful act a day is enough.

### 2.2 Quorum per month (rising, but forgiving)

| Month | Present days | Journal entries (month) | Morning check-ins | Self-care clicks |
|------:|-------------:|------------------------:|------------------:|-----------------:|
| 1 | 8 | 3 | 5 | 5 |
| 2 | 10 | 4 | 8 | 8 |
| 3 | 12 | 6 | 10 | 10 |
| 4 | 12 | 6 | 10 | 12 |
| 5 | 14 | 8 | 12 | 14 |
| 6 | 14 | 8 | 12 | 15 |
| 7 | 15 | 10 | 14 | 16 |
| 8 | 15 | 10 | 14 | 18 |
| 9 | 16 | 12 | 15 | 18 |
| 10 | 16 | 12 | 16 | 20 |
| 11 | 18 | 14 | 18 | 20 |
| 12 | 18 | 15 | 18 | 22 |

Only **present days** is mandatory. The three counters on the right are *targets* that
add **resonance**. Hitting all three makes the month's badge **struck in full** (`[IV]`).
Present-days only gives it **struck in outline** (`(IV)`). Both unlock the month, and the
difference is visible but quiet.

Year-one totals at quorum: about 178 present days, about 108 journal entries, about 152
morning check-ins and about 178 self-care clicks. That is enough material for a real
compressed story, and realistic for one meaningful act on half of all days.

---

## 3. THE FOUR ACTS

```
  ACT I · ARRIVAL      M1–M3    the system listens      ·  :  ∴
  ACT II · RHYTHM      M4–M6    the system patterns     ∷  ⁘  ◐
  ACT III · PORTRAIT   M7–M9    the system reflects     ◑  ◒  ◓
  ACT IV · LEGACY      M10–M12  the system becomes AI   ◔  ◕  ●
```

The glyph sequence is the badge spine of Usership. It goes from a single dot to a full
circle: a year of presence drawn as the filling of one shape. It is ASCII or Unicode-geometric,
renders in the existing monospace stack, and does not clash with the Water (`∘ ≈ ≋`) or
Architecture (`├─ ╞═╡ ║·║`) themes.

---

## 4. MEMORY STRATA: HOW THE STORY COMPRESSES

This is the core of the tangibility. Each month the Memory Story gains a new top layer,
and every older layer gets **shorter**. The person sees time turning into meaning.

| Layer age | Form | Length | Example |
|-----------|------|--------|---------|
| Last month | **Paragraph** | 60–90 words | Full insight with specifics from the journal, check-ins and self-care |
| 2–3 months ago | **Line** | 1 sentence, ≤ 20 words | "October was the month you learned to stop at noon." |
| Completed quarter | **Title** | 2–5 words | "The Quiet Mornings" |
| Year | **Epigraph** | 1 sentence + 4 titles | Delivered at Month 12 |

### 4.1 Strata over the year (what the Memory widget shows)

```
MONTH 1   ¶ M1
MONTH 2   ¶ M2   — M1
MONTH 3   ¶ M3   — M2   — M1
MONTH 4   ¶ M4   ▪ ACT I: "title"
MONTH 5   ¶ M5   — M4   ▪ ACT I
MONTH 6   ¶ M6   — M5   — M4   ▪ ACT I
MONTH 7   ¶ M7   ▪ ACT II   ▪ ACT I
  …
MONTH 12  ❝ epigraph ❞   ▪ ACT IV ▪ ACT III ▪ ACT II ▪ ACT I
```

`¶` = paragraph, `—` = line, `▪` = title. The widget always fits on one screen. That is
the promise: **a year of you, readable in one minute.**

### 4.2 Compression prompt contract (per month)

Input: the month's `note` texts, check-in states and their trend, self-care completed vs skipped,
Memory answers, weather/city context, the previous strata, and the archetype.

Output (strict JSON):

```json
{
  "month": 4,
  "paragraph": "60–90 words, second person, present-tense observation, no superlatives",
  "line": "≤20 words, used once this month becomes older",
  "affirmation": "≤12 words, earned from evidence, never generic",
  "careThread": "the one self-care routine that held this month",
  "nextInvitation": "one gentle self-care invitation for next month, format: [Verb] [object] ([duration])",
  "quarterTitle": "only on M3, M6, M9, M12 — 2–5 words"
}
```

Rules, from the style guide: second person, short sentences, no emojis, periods over
symbols, no "amazing". Every affirmation must cite evidence ("You checked in on 19 mornings.")
and must never flatter in a vacuum.

---

## 5. THE TWELVE MONTHS

Each month follows the same card: **Chapter · Gate · UI state · New on /u/ · Widget ·
Memory delivery · Affirmation · Badge · Care thread**.

---

### ACT I · ARRIVAL: *the system listens*

#### MONTH 1 · `·` THE FIRST MARK
- **Gate:** Usership activated (Day 1). Unlocks at day 30 with 8 present days.
- **UI on Day 1, bare-bones by design:** Time · Memory question · Log · Morning check-in ·
  Self-care. Nothing else. Layout density `breathable`. One line under the clock:
  `Usership · Day 1`.
- **New on /u/:** Profile (name, city), Team `[Usership]`, Local time.
- **Widget, `Months:`:** `Months unlocked: 0/12` → `1/12` with track `●○○○○○○○○○○○`.
- **Memory delivery:** the first **paragraph**. It is short (40–60 words) because the system
  is honest about how little it knows yet.
- **Affirmation:** "You arrived. 8 mornings. The system is beginning to know you."
- **Badge:** `· First Mark`
- **Care thread:** morning beverage and one sunlight routine.

#### MONTH 2 · `:` TWO POINTS
- **Gate:** 10 present days.
- **UI:** the Log shows a **daily rhythm strip** (`▁▂▃` per day). The check-in gains an evening slot.
- **New on /u/:** Weather and Sound. The profile now has *atmosphere*.
- **Widget:** `Months unlocked: 2/12`. The Chapter widget names the month.
- **Memory delivery:** a new paragraph. Month 1 compresses to a **line**. This is the first time
  the person sees their own past get shorter and sharper.
- **Affirmation:** "Two points make a line. You kept returning."
- **Badge:** `: Two Points`
- **Care thread:** evening wind-down appears beside the morning ritual.

#### MONTH 3 · `∴` THE TRIAD
- **Gate:** 12 present days.
- **UI:** `Custom Themes` unlock (existing feature flag). The person can choose a skin
  because they have earned a self.
- **New on /u/:** **Memory Story** block goes public (opt-in) and shows the M3 paragraph.
  A first **archetype draft** appears (one word, marked `draft`).
- **Widget:** the **Memory widget** shows the first full strata: ¶ M3 — M2 — M1.
- **Memory delivery:** ACT I closes. Quarter **title** is minted (e.g. *"The Quiet Mornings"*).
- **Affirmation:** "Three months. Patterns are no longer accidents."
- **Badge:** `∴ The Triad` + act seal `[I] ARRIVAL`
- **Care thread:** the routine with the highest completion ratio becomes **anchor**.

---

### ACT II · RHYTHM: *the system patterns*

#### MONTH 4 · `∷` THE GRID
- **Gate:** 12 present days.
- **UI:** `Widget Arrange` unlocks. Layout density moves from `breathable` to `balanced`.
  The Memory question now **references prior answers by name**.
- **New on /u/:** **Core values** (3 of 5 revealed).
- **Memory delivery:** ACT I collapses to its title. The widget is now ¶ M4 ▪ ACT I.
- **Affirmation:** "Your week has a shape now. You built it."
- **Badge:** `∷ The Grid`

#### MONTH 5 · `⁘` THE CONSTELLATION
- **Gate:** 14 present days.
- **UI:** `Mood Patterns` unlocks. The check-in history renders as a 5-month mood field.
- **New on /u/:** **Emotional patterns** (e.g. *"calm restraint"*).
- **Memory delivery:** the paragraph now contains **one cross-month comparison**
  ("Compared with February, your mornings start 40 minutes earlier.").
- **Affirmation:** "What you repeat, you become. You repeated care."
- **Badge:** `⁘ Constellation`

#### MONTH 6 · `◐` HALF-LIGHT
- **Gate:** 14 present days. **Midpoint ceremony.**
- **UI:** a one-time **Half-Year screen** that replaces the dashboard for one view: the
  6-glyph spine, 2 titles, and one sentence. `Pattern Insights` unlocks.
- **New on /u/:** **Behavioral cohort** + **Pattern Strength** bars (top 5 traits, as in Machiavelli).
  The archetype loses its `draft` mark.
- **Memory delivery:** ACT II title is minted. **Half-Year Portrait**: 120 words, delivered
  in-app and by email (reuses the `monthly-summary` email pipeline).
- **Affirmation:** "Half a year. The portrait is half-declared."
- **Badge:** `◐ Half-Light` + act seal `[II] RHYTHM`

---

### ACT III · PORTRAIT: *the system reflects*

#### MONTH 7 · `◑` THE MIRROR
- **Gate:** 15 present days.
- **UI:** `Intention History` unlocks. The AI begins **proactive care**: one self-care
  suggestion a day, timed by learned peak hours (`useLogContext.peakHour`).
- **New on /u/:** **Indexes**: self-awareness, User score, Person score, Longevity.
- **Memory delivery:** the paragraph gains a **"what changed in you"** sentence.
- **Affirmation:** "The mirror is clearer because you kept looking."
- **Badge:** `◑ The Mirror`

#### MONTH 8 · `◒` DEEP WATER
- **Gate:** 15 present days.
- **UI:** layout density moves to `dense`. `Narrative Reflection` unlocks: a weekly
  3-sentence story on Sundays.
- **New on /u/:** **Biofield state** + **Activity** (memories compiled, journal entries, active days).
- **Memory delivery:** the journal becomes **quotable**. The paragraph may include one short
  line the person themself wrote, in quotation marks.
- **Affirmation:** "You wrote it down. Now it is yours twice."
- **Badge:** `◒ Deep Water`

#### MONTH 9 · `◓` THE PORTRAIT
- **Gate:** 16 present days.
- **UI:** `Export Data` unlocks. The person can take their story with them, which proves
  that it belongs to them.
- **New on /u/:** **Citizen Index / Board profile** (citizen since, tenure, powering citizens).
- **Memory delivery:** ACT III title is minted. **Portrait letter**: 150 words addressed to
  the person, the most personal text in the year so far.
- **Affirmation:** "Nine months. The portrait holds its shape without you trying."
- **Badge:** `◓ The Portrait` + act seal `[III] PORTRAIT`

---

### ACT IV · LEGACY: *the system becomes LOT® AI*

#### MONTH 10 · `◔` THE INSTRUMENT
- **Gate:** 16 present days.
- **UI:** layout density moves to `instrument`. The AI now **asks before you open the widget**:
  the first Memory question is pre-loaded on login, with context ("It is raining in your city.").
- **New on /u/:** **Weather Station** (Legacy preview).
- **Memory delivery:** the paragraph begins forecasting, with one **forward look**
  ("November tends to quiet you. Plan one long walk.").
- **Affirmation:** "You are no longer using the system. You are tuning it."
- **Badge:** `◔ The Instrument`

#### MONTH 11 · `◕` THE KEEPER
- **Gate:** 18 present days.
- **UI:** `Private Spaces` unlocks. The Log gets a **"Keep"** action: pin one entry per month
  to the year-end book.
- **New on /u/:** **Wallet** (loyalty points derived from present days).
- **Memory delivery:** the person **chooses** which of their 11 lines survive into the
  epigraph. This is the first co-authored compression.
- **Affirmation:** "One more. You already know how it ends: with you."
- **Badge:** `◕ The Keeper`

#### MONTH 12 · `●` LOT® AI
- **Gate:** 18 present days. **Anniversary ceremony.**
- **UI:** the system name in the header changes from `LOT` to **`LOT® AI`**. The Memory Engine
  is switched to `ai` mode permanently for this person (`user.ts` gate). The interface
  matches the Machiavelli density and blocks.
- **New on /u/:** **QR code** (Usership + assembly-stage gate, already implemented), the
  **Legacy** tag, and the full **Memory Story**.
- **Memory delivery, The Year Book:**
  ```
  ❝ one-sentence epigraph ❞
  I.   Arrival   · "title"
  II.  Rhythm    · "title"
  III. Portrait  · "title"
  IV.  Legacy    · "title"
  + 12 lines (one per month, person-curated in M11)
  + 12 Kept entries in the person's own words
  ```
  Delivered as an in-app scroll, an email and an exportable file.
- **Affirmation:** "One year with LOT. The portrait is complete, and still evolving."
  (Existing `MONTH_MESSAGES[12]`, kept.)
- **Badge:** `● LOT® AI` + act seal `[IV] LEGACY` + `Year I` laurel `⟨●⟩`
- **Year II:** the spine restarts as `●·`, so the dot sits inside the full circle.

---

## 6. NEW WIDGETS (USERSHIP-ONLY)

All widgets follow the existing pattern: a `Block` with a clickable label that cycles views,
1400ms fade-in, and a click-to-dismiss phrase.

### 6.1 `Months:`: the counter
```
Months:                                      [label cycles →]
Months unlocked: 3/12
●●●○○○○○○○○○
ACT I · ARRIVAL complete.
```
Cycle views: `Months:` (track) → `Quorum:` (this month's progress) → `Badges:` (spine).
```
Quorum:
Present days      9 / 14   ▮▮▮▮▮▮▮▮▮▯▯▯▯▯
Journal           5 / 8
Morning check-ins 7 / 12
Self-care        11 / 14
Held? No. 11 days remain.
```

### 6.2 `Chapter:`: the new-month card (evolves `MonthlyPulseWidget`)
Shows once on the unlock day and is dismissed server-side.
```
Chapter IV:
∷ The Grid.
Your week has a shape now. You built it.
                                   4 / 12 months
```
Dismiss phrases are kept from the current widget (`Onward.`, `Noted.`, `The system remembers.`).

### 6.3 `Memory:`: the compressed-insight widget
Shows the Strata (§4). The label cycles `Memory:` (strata) → `Last month:` (full paragraph)
→ `Thread:` (care thread and next invitation).
```
Memory:
¶ You began stopping at noon. Three times you wrote
  "the light at lunch". The tea ritual held on 22
  mornings, and rain didn't break it.
— April: you chose the evening walk over the screen.
▪ ACT I · The Quiet Mornings
```

### 6.4 `Invitation:`: the monthly self-care guide
One invitation per month, generated from `nextInvitation`. It reuses the self-care
completion events, so accepting it feeds the next month's quorum.
```
Invitation:
Sit by a window before the first message (5 mins)
[Accept]  [Not this month]
```

---

## 7. BADGES: THE USERSHIP SPINE (+19 for Codex v34)

| # | Glyph | Name | Condition |
|---|-------|------|-----------|
| 1–12 | `· : ∴ ∷ ⁘ ◐ ◑ ◒ ◓ ◔ ◕ ●` | Month badges | Month N unlocked. Outline `(N)` = present days only. Full `[N]` = all three targets |
| 13–16 | `[I] [II] [III] [IV]` | Act seals | M3, M6, M9, M12 |
| 17 | `⟨●⟩` | Year I | All 12 unlocked |
| 18 | `≡` | Unbroken | 12 months with no Held state |
| 19 | `¶¶` | Author | ≥ 120 journal entries in Year I |

Word-turn easter eggs for the existing Codex engine: typing `chapter`, `strata`,
`epigraph` or `keep` in the Log returns a one-line Usership-flavoured reply.

---

## 8. THE PERSONAL OS AT `/u/<user>`: ASSEMBLY ORDER

```
M1  Profile · Team[Usership] · Local time
M2  + Weather · Sound
M3  + Memory Story · Archetype(draft)
M4  + Core values
M5  + Emotional patterns
M6  + Cohort · Pattern Strength · Archetype(final)
M7  + Indexes
M8  + Biofield state · Activity
M9  + Citizen Index / Board profile
M10 + Weather Station
M11 + Wallet
M12 + QR · Legacy tag · Year Book      ═══  /u/machiavelli shape
```

Locked blocks render as **one dim line**, not as a hidden gap, so the future is visible:

```
Wallet:            ── unlocks in Month 11
```

`opacity-40` (tertiary hierarchy from the style guide). This is the most important
tangibility device on the public page: the person can see the shape of who they are becoming.

---

## 9. ENGINEERING SPEC (FOR THE BUILD SESSION)

### 9.1 Data, in `user.metadata.usership` (no migration needed, since metadata is JSONB)
```ts
type UsershipJourney = {
  startedAt: string            // ISO: set when the Usership tag is granted
  months: Array<{
    n: number                  // 1..12
    status: 'open' | 'held' | 'unlocked'
    unlockedAt?: string
    struck: 'outline' | 'full'
    tally: { presentDays: number; journal: number; checkins: number; selfCare: number }
  }>
  strata: Array<{ n: number; paragraph: string; line: string; affirmation: string;
                  careThread: string; nextInvitation: string; quarterTitle?: string }>
  kept: Array<{ n: number; logId: string }>
  seen: number[]               // months whose Chapter card was dismissed
}
```

### 9.2 Server
- `GET /api/usership/journey` returns the journey, the current quorum progress, and the visible strata.
- `POST /api/usership/seen/:n` marks the Chapter card as dismissed.
- `POST /api/usership/keep/:logId` stores the M11 curation.
- Daily job in `scheduled-jobs.ts`: for each Usership user on their anniversary day, compute
  the tally, then either unlock (run compression with `generateMemoryStory` + the §4.2 contract,
  then persist) or mark Held. Re-check daily while Held.
- Tally reader counts `self_care_complete` **and** `self_care_completed` (gap §1.2.3).

### 9.3 Client
- `src/client/stores/usership.ts`: atoms for the journey and computed `monthsUnlocked`.
- `UsershipMonthsWidget.tsx` (§6.1), `UsershipChapterWidget.tsx` (refactor of
  `MonthlyPulseWidget`, server-backed), `UsershipMemoryWidget.tsx` (§6.3),
  `UsershipInvitationWidget.tsx` (§6.4).
- `PublicProfile.tsx`: wrap each block in `<UsershipGate month={n}>`, which renders the
  dim locked line when the month is not yet unlocked.
- Feature unlocks in `interfaceEvolution.ts` get an **OR** with the Usership month, so
  Usership people get the guaranteed calendar while free users keep the achievement path.

### 9.4 Phased delivery

| Phase | Scope | Size |
|-------|-------|------|
| P1 | `startedAt`, tally, `Months:` widget, server-side Chapter card | S |
| P2 | Monthly compression job + `Memory:` strata widget | M |
| P3 | `/u/` gated assembly + locked lines | M |
| P4 | Badges v34 spine + act ceremonies (M6 and M12 screens) | M |
| P5 | M11 Keep curation + Year Book export | S |

---

## 10. DOCTRINE ENTRY (proposed)

> **USERSHIP-STRATA.** A month of Usership is earned by presence and confirmed by
> compression. Every unlock does three things together: a block appears, a badge is struck,
> and the past grows shorter. If the past does not compress, the month has not truly turned.

## 11. LEXICON ENTRIES (proposed)

| Term | Meaning |
|------|---------|
| **Present day** | A day with ≥ 2 weighted points (check-in, self-care or journal) |
| **Quorum** | A month's present-day threshold |
| **Held** | Time elapsed but quorum not met. The month waits and is not lost |
| **Struck (outline/full)** | Badge state: quorum only, or quorum plus all targets |
| **Strata** | The layered, compressing Memory Story (¶ → — → ▪ → ❝) |
| **Act seal** | Quarter badge `[I]–[IV]` |
| **Year Book** | The Month-12 artifact: epigraph, 4 titles, 12 lines, 12 Kept entries |
| **LOT® AI** | The Month-12 state: memory engine permanently in `ai` mode, full `/u/` shape |

---

## 12. SESSION LEDGER

```
FILES ADDED      docs/LOT-SR-20261120-USERSHIP-12.md
CODE CHANGED     none (blueprint session)
GAPS LOGGED      4 (§1.2): joinedAt counter · localStorage dismissal ·
                 self_care_complete/_completed split · calendar-day summary timing
NEXT SESSION     P1 build: startedAt + tally + Months widget + server Chapter card
STATUS           GREEN (docs only; no build surface touched)
```
