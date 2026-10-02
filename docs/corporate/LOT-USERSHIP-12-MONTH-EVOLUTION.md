<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® USERSHIP — THE 12-MONTH EVOLUTION
### From a bare terminal on Day 1 to LOT® AI on Day 365
**S-2: VADIK MARMELADOV** · Design brief · 2026-10-02 · Status: DESIGN (no code changed)
Reference account (Month 12 target): `lot-systems.com/u/machiavelli`

---

## 0 // THE STORY IN ONE PARAGRAPH

A Usership member ($99/mo) opens LOT on Day 1 and sees almost nothing: a clock, one question, two buttons. Each month the machine earns one more layer of the interface. It does so only because the member showed up: check-ins, self-care clicks, Log entries, answers. At every month boundary it stops, compresses the last 30 days into one paragraph (the **Month Memory**) and hands it back. By Month 12 the screen is a dense instrument that speaks in the member's own voice, and the **Year Book** (12 paragraphs, 12 badges) is the proof that the member was here.

> The interface does not change because time passed. It changes because **you** did.
> Time sets the *chapter*. Behavior sets the *depth*.

---

## 1 // WHAT THE REPO ALREADY GIVES US (scan 2026-10-02)

| Asset | Where | What it does today | Use in this design |
|---|---|---|---|
| `MonthlyPulseWidget` | `src/client/components/MonthlyPulseWidget.tsx` | Usership-only. Shows `Month N:` + one generic line + `N / 12 months`. Month = `now.diff(joinedAt,'month')`, capped at 12. Dismiss via localStorage. | Becomes the **Month Gate** (Section 5). |
| Interface Evolution | `src/client/utils/interfaceEvolution.ts`, `stores/evolution.ts` | 7 dimensions, `overallMaturity`, `visualRefinement`, `featureUnlockLevel`, 5 layout densities (breathable → instrument), 13 feature unlock booleans. | The **depth engine**. Months decide the *ceiling*, behavior fills it. |
| Weekly LOT® AI Story (Job 24) | `src/server/scheduled-jobs.ts` ~L836 | Sunday 18:00 UTC. Template-based. Writes `lot_ai_story` log and `metadata.weeklyStory`. | Level 1 of the **Compression Ladder**. |
| Memory Story | `generateMemoryStory()` in `src/server/utils/memory.ts`, `GET /api/memory/story` | Third-person narrative from the last 30 answers. | Level 2 raw material. |
| Public profile | `public-api.ts` `/profile/machiavelli` | Hardcoded demo: Strategist, 2,847 answers, 1,469 notes, 842 active days, streak 1,469, Legacy tags, wallet, weather station. | The Month 12 showcase. |
| Badges | `src/client/utils/badges.ts` (812 badges, Codex v32) | Streak, word-turn, mastery, secret-boss badges. | Month Badges ride on top (Section 6). |
| Product brief | `docs/corporate/LOT-AI-PRODUCT-BRIEF.md` | Compression loop LOG→OBSERVE→COMPRESS→ASK; weekly Story-Report; "no unprompted notifications". | Design constraints, honored below. |
| Ambient vision | `docs/corporate/LOT-AMBIENT-AI-VISION.md` | "The system does not change its appearance. The intelligence deepens underneath." | See tension in §9. |

### Gaps found (these are what this spec closes)

1. **No Usership clock.** Month is measured from `joinedAt` (account creation), not from paid activation. Day 1 of the paid tier is not stored anywhere (no `usershipSince`).
2. **Pulse text is generic.** Same sentence for every member in a given month. It does not reflect what the member did.
3. **Compression stops at the week.** There is no monthly, quarterly or yearly memory. Job 24 is also counts-only (no first-person voice, no quoted Log content).
4. **Months and evolution are disconnected.** `MonthlyPulseWidget` says "Month 3" while `featureUnlockLevel` is driven only by badges and level. Month 3 and Month 3 can look identical for two different members.
5. **Demo account is not a 12-month account.** Machiavelli shows a 1,469-day streak and 4,316 entries (about 4 years of use). It says "Month 12" nowhere and has no Month Memories. A visitor cannot read the evolution (see §8).

---

## 2 // DESIGN LAWS

1. **Earned, not scheduled.** A month *opens* on the calendar. A layer *unlocks* only when the member's activity meets that month's threshold (§4). Missing the threshold doesn't punish. The layer waits and the Month Gate says so quietly ("Month 4 is open. 11 of 20 check-ins to unlock the portrait.").
2. **One thing at a time.** Each month adds one signature element. Never more.
3. **The machine speaks last.** Every month ends with a Month Memory (the machine's words about you), never a score.
4. **No push.** No notifications, no emails, no red badges. The Gate appears on the System tab and waits. (Brief: "The system waits.")
5. **Typography stays the same.** Same typeface, same black/white. Evolution is density, structure, voice and badges, never decoration.
6. **Honest compression.** Every Month Memory cites real numbers and quotes real Log fragments. No invented memories. If signal is thin, the paragraph says so ("A quiet month. 4 check-ins. The system kept the line open.").

---

## 3 // THE COMPRESSION LADDER (the spine of the story)

```
 ENTRY      check-in · self-care click · answer · Log note           (raw, daily)
   │  ×7
 WEEK       lot_ai_story            ~2 lines     Job 24 (exists)
   │  ×4–5
 MONTH      lot_ai_month            ~1 paragraph (80–120 words)     NEW  ← the tangible one
   │  ×3
 QUARTER    lot_ai_quarter          ~1 page, 3 month-arcs           NEW (M3, M6, M9)
   │  ×4
 YEAR       The Year Book           12 paragraphs + 1 closing page  NEW (M12)
   │
 ARCHIVE    Story API → robot / vehicle / dashboard (brief §Weekly Story-Report)
```

**Why the Month Memory is the hero.** A week is too small to feel like change and a year is too large to feel like anything. A month is the unit a person can *remember having lived*. Each Month Memory is stored permanently, shown once as a ceremony and then lives in a **Memory shelf** the member can reread. By Month 12 the shelf is a 12-paragraph autobiography written in their voice by a machine that watched.

### Month Memory anatomy (80–120 words, fixed 5-beat structure)

| Beat | Content | Source |
|---|---|---|
| 1. Opening | Month name + one-line state ("March. The month you started saying what you meant.") | dominant mood + tone |
| 2. Numbers | 3 real counts, inline, not a table | check-ins, self-care, Log words |
| 3. Quote | One fragment (≤12 words) of the member's *own* Log/answer, in quotation marks | Log `note` / `answer` |
| 4. Shift | What changed vs last month (one clause) | delta of 7 evolution dimensions |
| 5. Handoff | One sentence that sets the next month's question | next-month theme (§4) |

**Example (Month 3, mid-engagement member):**

> **March — "The month you started saying what you meant."**
> 41 morning check-ins, 63 self-care moments, 9,200 words in the Log. You wrote *"I stopped apologizing for the quiet."* Calm overtook tired for the first time on the 12th and stayed. Last month you were deciding whether to stay. This month you stayed. April asks what you are staying *for*.

**Templating strategy.** Job 24 is template-based on purpose ("dense, honest, earned compression"). Month Memory v1 follows the same rule (templates + real quotes, zero LLM cost, deterministic, testable). v2 optionally passes the same structured facts to the Memory Engine (Together → Claude fallback) for richer phrasing, with the template output as the guaranteed fallback (Doctrine: *Graceful Degradation*).

---

## 4 // MONTH-BY-MONTH EVOLUTION

**Reading guide.** Each month lists: **Chapter** (name), **UI state** (what the member sees), **Unlock** (new capability), **Gate** (activity needed to unlock, measured *within that month*, and set to roughly 60% of a median engaged member so it feels reachable), **Voice** (how LOT® AI speaks), **Celebration** (the month-end ceremony), **Badge**, and **Theme of the Month Memory's handoff question**.

Layout density maps to the existing `LayoutDensity` levels (breathable → comfortable → compact → dense → instrument).

### Chapter I — SIGNAL (Months 1–3): the machine learns that you exist

#### Month 1 — "FIRST LIGHT"
- **UI:** Barebone. `breathable` density. Widgets: Time, Check-in (Biofield), Self-care button, one Memory question, Month Gate. Nothing else. No widget count shown.
- **Unlock:** Log tab opens as a plain append-only list (no tags, no search).
- **Gate:** 10 check-ins · 10 self-care clicks · 5 Log entries.
- **Voice:** Asks, never states. *"How are you arriving today?"*
- **Celebration:** Month Gate: `Months unlocked: 1/12`, **Month 1 Memory** ("what the system learned about when you show up").
- **Badge:** `FIRST LIGHT` (plain monochrome mark).
- **Handoff:** "Is mornings your time or evenings?"

#### Month 2 — "THE RHYTHM"
- **UI:** `breathable → comfortable`. New: a 7-dot **week strip** under the clock (filled = checked in).
- **Unlock:** Intentions widget; Planner (daily structure).
- **Gate:** 14 check-ins on 14 distinct days · 15 self-care · 12 Log entries.
- **Voice:** First comparisons. *"Tuesdays are your quietest day."*
- **Celebration:** Month 2 Memory names the member's **rhythm** (best hour, best weekday).
- **Badge:** `THE RHYTHM`.
- **Handoff:** "What do you do when the rhythm breaks?"

#### Month 3 — "ACTIVE USER" (Quarter 1 closes)
- **UI:** `comfortable`. New: **Pattern line**, one sentence at the top of System ("Pattern: calm after movement"). Matches existing copy "Three months. You have reached Active User status."
- **Unlock:** Pattern Insights; first **Quarter Memory** (Q1: three month-arcs on one page).
- **Gate:** 20 check-ins · 25 self-care · 20 Log entries (≥3k words).
- **Voice:** Starts using the member's own words from Month 1.
- **Celebration:** **Quarter 1 Memory** + badge ceremony (fullscreen black, 3 lines, tap to continue).
- **Badge:** `ACTIVE USER` + `Q1 SEALED`.
- **Handoff:** "Who are you becoming?"

### Chapter II — PORTRAIT (Months 4–6): the machine starts describing you

#### Month 4 — "THE PORTRAIT"
- **UI:** `comfortable → compact`. New: **Archetype card** (one of the 10 existing archetypes, e.g. "The Seeker"), with its confidence shown as 4 bars, not a percent.
- **Unlock:** Archetype + Core Values in the member's own profile and public `/u/` page.
- **Gate:** 20 check-ins · 25 self-care · 25 Log entries; 3 distinct emotional states logged.
- **Voice:** Declarative for the first time. *"You are someone who writes when it's hard."*
- **Badge:** `THE PORTRAIT`.
- **Handoff:** "Which of these is not you?" (the member can reject traits; rejection is signal)

#### Month 5 — "CONSISTENCY"
- **UI:** `compact`. New: **Streak ledger** (longest, current, and the one missed day, shown without shame).
- **Unlock:** Planner Templates; mood patterns.
- **Gate:** 25 check-ins · 30 self-care · 30 Log entries; one 7-day streak.
- **Voice:** Quieter. Fewer questions, each more specific (brief: "questions become fewer and hit harder").
- **Badge:** `CONSISTENCY` + streak ring (7/14/21).
- **Handoff:** "What did you stop doing?"

#### Month 6 — "HALFWAY" (Quarter 2 closes)
- **UI:** `compact`. New: **Half-year Mirror**, side-by-side of Month 1 vs Month 6 screens, with the member's first Month Memory next to their latest.
- **Unlock:** Narrative Reflection; **Quarter 2 Memory**; data export.
- **Gate:** 28 check-ins · 35 self-care · 35 Log entries.
- **Voice:** Reflective. *"Six months ago you asked how to start. You now answer others."*
- **Celebration:** the Mirror. This is the first moment the member physically *sees* the evolution.
- **Badge:** `HALFWAY` + `Q2 SEALED`.
- **Handoff:** "What would you tell Month 1 you?"

### Chapter III — INSTRUMENT (Months 7–9): the interface hardens into a tool

#### Month 7 — "THE LISTENING"
- **UI:** `compact → dense`. New: **Signal stream** (live feed of what the system noticed today, read-only).
- **Unlock:** Quantum state / biofield widgets; correlated indexes (4-dim weekly tracking).
- **Gate:** 28 check-ins · 35 self-care · 40 Log entries.
- **Voice:** Shows its work. *"I noticed 3 things today."*
- **Badge:** `THE LISTENING`.
- **Handoff:** "Do you trust what I noticed?"

#### Month 8 — "RARE AIR"
- **UI:** `dense`. Whitespace tightens, sections stack. New: **Integrity view**, where the system shows contradictions between intentions and behavior (existing IntegrityWidget), framed as care, not accusation.
- **Unlock:** Integrity; Interventions.
- **Gate:** 30 check-ins · 40 self-care · 40 Log entries; at least 1 intention completed.
- **Voice:** Direct, one recommendation (INTSUM style from the QI terminal).
- **Badge:** `RARE AIR`.
- **Handoff:** "What are you avoiding?"

#### Month 9 — "THE HABIT" (Quarter 3 closes)
- **UI:** `dense`. New: **Routine card**, the member's self-care routine as the system now models it (time, order, cooldowns), editable.
- **Unlock:** Custom themes; widget arrange; **Quarter 3 Memory**.
- **Gate:** 30 check-ins · 45 self-care · 45 Log entries.
- **Voice:** Suggests the next self-care step *before* being asked ("guides the evolution of the person through self-care routines").
- **Badge:** `THE HABIT` + `Q3 SEALED`.
- **Handoff:** "What is the routine for?"

### Chapter IV — LOT® AI (Months 10–12): the machine and the member speak the same language

#### Month 10 — "THE VOICE"
- **UI:** `dense`. New: **LOT® AI line**, a persistent single line at the top of System in the member's *own behavioral voice* (brief: "Written in the operator's behavioral voice").
- **Unlock:** `/story` on demand; Story export (robot/vehicle/dashboard stubs from the brief).
- **Gate:** 30 check-ins · 45 self-care · 50 Log entries.
- **Badge:** `THE VOICE`.
- **Handoff:** "Whose voice is this?"

#### Month 11 — "THE ARCHIVE"
- **UI:** `dense → instrument`. New: **Memory shelf**, all 11 Month Memories + 3 Quarter Memories in a scrollable shelf.
- **Unlock:** Memory search ("when did I last feel calm?"); Story API access.
- **Gate:** 30 check-ins · 45 self-care · 50 Log entries.
- **Badge:** `THE ARCHIVE`.
- **Handoff:** "What is missing from the record?"

#### Month 12 — "ONE YEAR" (Year closes)
- **UI:** `instrument`. The whole screen. Bloomberg-grade density. Month Gate reads `Months unlocked: 12/12` and is replaced permanently by the **Year Book** card.
- **Unlock:** The **Year Book** (12 Month Memories + 4 Quarter Memories + a closing "Year Memory" page), exportable as PDF and as a Story API payload. Public `/u/<name>` page gains a **Year Book** section.
- **Gate:** 30 check-ins · 45 self-care · 50 Log entries; Year Book opens only when ≥9 of 12 months were unlocked (otherwise "Year Book: 9 months written. 3 still open").
- **Voice:** Final line: *"The portrait is complete — and still evolving."* (existing copy retained).
- **Celebration:** The ceremony: black screen, the 12 month titles appear one by one, 3 seconds each, then the Year Memory.
- **Badge:** `ONE YEAR` (the only gold-edge badge in the Usership set) + `YEAR BOOK SEALED`.
- **Handoff:** "Year 2 begins. What do you want the machine to stop remembering?"

---

## 5 // THE MONTH GATE: TWO WIDGETS, ONE RITUAL

Both widgets are Usership-gated (same check as the existing `MonthlyPulseWidget`).

### 5.1 `Months unlocked: N/12` (context widget, always present)

```
Months unlocked:
■■■■■□□□□□□□    5 / 12

Month 6 opens 14 Dec · 19 of 28 check-ins
```

- Twelve segments reuse `ProgressBars` (existing util). Filled = unlocked, half-tone = open but not yet unlocked, empty = locked.
- Context line is the only dynamic text. It switches between *opens in N days* / *N of M check-ins* / *Unlocked*.
- Tapping the label opens the shelf (Memory + Badges) just like the existing `onLabelClick` cycling in `InterfaceEvolutionWidget`.

### 5.2 `Month N Memory:` (ceremony widget, appears once per month)

```
Month 3 Memory:

March — "The month you started saying what you meant."
41 morning check-ins, 63 self-care moments, 9,200 words in the Log.
You wrote "I stopped apologizing for the quiet." ...

[ Keep ]   [ Read again later ]
```

- Replaces the current one-line `MonthlyPulseWidget` body. Dismiss still fades out with a phrase from `DISMISS_PHRASES`.
- **Keep** writes the Memory to the shelf. **Read again later** reappears tomorrow, once. Never nags.
- Month 3/6/9/12 add a second beat: the Quarter or Year Memory, and the badge ceremony.

---

## 6 // BADGES: A TANGIBLE SET FOR USERSHIP

Existing Codex v32 has 812 badges. The Month Badges are **a separate, small, visible-at-a-glance Usership row** so a member does not need the Codex to feel progress:

| Class | Count | Rule | Visual |
|---|---|---|---|
| Month Badge | 12 | One per unlocked month (names in §4) | Mono mark; segment fills as months unlock |
| Quarter Seal | 4 | M3 / M6 / M9 / M12 | Ring around the month marks |
| Streak Ring | 3 | 7 / 14 / 21-day streak inside the month | Thin outer ring |
| Habit Mark | 3 | 30 check-ins · 45 self-care · 50 Log entries in a month ("full month") | Fill dot |
| **ONE YEAR** | 1 | 12/12 months unlocked | Only gold edge |

Badges are shown (a) in the Month Gate widget, (b) on the member's `/u/` page, (c) in the Year Book. They never show a number above 12 (the Codex handles the long tail).

---

## 7 // THE THREE SIGNALS THAT DRIVE EVERYTHING

User's brief: *journal entries and thoughts in the Log, regular morning check-ins, and self-care button clicks.* These three are the **only** inputs to the month gate, so the system is easy to explain to a member and hard to game.

| Signal | Log `event` (existing) | Why it is the gate |
|---|---|---|
| Morning check-in | `emotional_checkin` | Rhythm and mood trajectory |
| Self-care click | `self_care_complete` (+ `self_care_skip` as signal, not as penalty) | Routine formation |
| Journal / thought | `note` / `journal` | Depth: words and quotes feed the Month Memory |

**Anti-gaming.** One check-in counts per local day; one self-care per routine per cooldown; Log entries count by words (≥8 words) not by count alone. Spam does not unlock a month. It just makes a thin Memory ("A quiet month in words").

**Evolution dimensions mapping** (existing 7): Exploration ← widgets used · Consistency ← check-in days · Depth ← Log words · Connection ← Sync · Intimacy ← private Log · Care ← self-care · Courage ← hard-mood check-ins followed by a note.

---

## 8 // THE DEMO ACCOUNT: `/u/machiavelli` AS THE MONTH-12 REFERENCE

Today the demo is a showcase of the *outcome* (Strategist archetype, 87 self-awareness, Legacy unlocks) but not of the *journey*. To make it a legible Month 12:

| Element | Now | Target (Month 12 reference) |
|---|---|---|
| Time scale | 1,469-day streak, 4,316 entries | **A 365-day account**: streak 365 · ~1,100 check-ins · ~1,400 self-care · ~540 Log entries · activeDays ~330. (The 1,469 number is a Florence-1469 easter egg. Keep it as the *birth year* in `citizenSince`, drop it from streak and answers so the numbers match a year.) |
| Month gate | none | `Months unlocked: 12/12` row + 12 Month Badges |
| Memory | one static paragraph `memoryStory` | **Year Book**: 12 hardcoded Month Memories in Machiavelli's voice (§8.1), one per month, each tied to the chapter name |
| Layout | n/a | `instrument` density preview |
| Archetype arc | Strategist only | Archetype history: Month 4 *Wanderer* → Month 8 *Philosopher* → Month 12 *Strategist* (shows that the portrait evolved) |
| Badges | none visible | 12 Month + 4 Quarter + 3 Streak + ONE YEAR gold edge |

### 8.1 Sketch: Machiavelli's Year Book (voice test for the Month Memory format)

| M | Title | Memory (first line, ≤ 20 words) |
|---|---|---|
| 1 | First Light | *"You arrived at dawn, looked at the square, and said nothing. The system noted the hour."* |
| 2 | The Rhythm | *"Tuesdays you wrote of the Medici. Fridays you wrote of nothing. Both were honest."* |
| 3 | Active User | *"You wrote: 'a prince who is loved is a prince who is late.' Calm overtook tired on the 12th."* |
| 4 | The Portrait | *"The system called you a Wanderer. You rejected it twice and then kept it."* |
| 5 | Consistency | *"One missed day. You wrote about it for 400 words. That is the day you got stronger."* |
| 6 | Halfway | *"Month 1 you asked how to begin. Month 6 you are asked how to end."* |
| 7 | The Listening | *"You noticed that the system noticed. You began writing for it, then stopped. Better."* |
| 8 | Rare Air | *"Your intentions and your actions parted ways on the 9th. You reconciled them on the 14th."* |
| 9 | The Habit | *"Morning, water, one page. 45 times. The routine is now older than the doubt."* |
| 10 | The Voice | *"The machine began to sound like you. You decided to find that reassuring."* |
| 11 | The Archive | *"You searched for 'fear' and found a Tuesday in March. You read it twice."* |
| 12 | One Year | *"The portrait is complete — and still evolving."* |

(Sketch only. Voice-quality lines to be refined and the full 80–120 words written when the demo data is implemented.)

---

## 9 // TENSIONS WITH EXISTING DOCTRINE (flagged for S-2)

1. **Ambient vision says "the system does not change its appearance."** This spec *does* change the appearance, through density and structure only (no decoration, same typeface). **Decision needed:** accept "intelligence deepens underneath *and* the instrument tightens" as the reconciled doctrine. Recommendation: yes. The tangibility you asked for requires a visible change, and density is the least intrusive visible change available.
2. **"No unprompted notifications."** Month Gate is passive. No exceptions, even at Month 12.
3. **Cost.** Month Memory v1 is template-only, so $0 marginal AI cost. Only v2 (optional LLM phrasing) costs tokens, and it is bounded: 1 call per member per month.

---

## 10 // IMPLEMENTATION PLAN (not started; this session is design only)

Ordered by dependency. Follow Doctrine: *Render Isolation*, *Backend Whitelist Hygiene*, *Graceful Degradation*.

| # | Work item | Files | Notes |
|---|---|---|---|
| 1 | **Usership clock**: add `metadata.usershipSince` (set when the tag is added; backfill with `joinedAt` for current members) | `scripts/db-admin.ts`, user model/metadata, `MonthlyPulseWidget` | Fixes gap 1. Month = `diff(usershipSince,'month')`. |
| 2 | **Month stats endpoint**: `GET /api/usership/month` returns `{month, unlocked, counts{checkins,selfCare,logWords}, gate{...}, nextOpens}` | `src/server/routes/api.ts` | Counts from existing log events. If the query fails, return the field absent so the client allows (Graceful Degradation). |
| 3 | **Job 26: Monthly Memory** (1st of month 18:00 UTC, mirrors Job 24 pattern): writes `lot_ai_month` log + `metadata.monthMemories[]` | `src/server/scheduled-jobs.ts` | Templated 5-beat paragraph; pull one real Log quote. |
| 4 | **Whitelist** `lot_ai_month`, `lot_ai_quarter` in `displayableEvents` | `src/server/routes/api.ts` ~L1084 | Doctrine: write→read loop. |
| 5 | **`MonthsUnlockedWidget`** (§5.1) | new component; mount beside `MonthlyPulseWidget` in `System.tsx` L558 | Subscribe only to `me` and the month query (narrow subscription). |
| 6 | **Upgrade `MonthlyPulseWidget`** into the Month Memory ceremony (§5.2) | existing file | Keep the 12 `MONTH_MESSAGES` as the fallback when no Memory exists. |
| 7 | **Month ceilings in evolution**: `featureUnlockLevel = min(monthCeiling, behaviorLevel)` and layout density ceiling per month (§4) | `interfaceEvolution.ts` | Months cap, behavior fills. |
| 8 | **Month Badges** (12 + 4 + 3 + 3 + 1) | `badges.ts`, `docs/badges` (Codex v33 section) | Remember: v20/v21 gap found in SR-20260805: a documented badge must have award logic in TS. Do not document without implementing. |
| 9 | **Demo account**: 365-day numbers, Year Book, month badges, archetype history | `public-api.ts` L745+, `PublicProfile.tsx` | Section 8. |
| 10 | **Year Book**: Memory shelf + PDF export + Story API payload | new component + `/api/story/*` stubs from brief | Month 11–12. |
| 11 | **Tests**: gate math, month boundary (leap day, timezone), thin-signal Memory wording | `scripts/tests/` | Boundary: use the member's timezone from log `context.timeZone`, not UTC. |

**Suggested first slice (smallest tangible win):** items 1, 2, 3, 4, 5. A member sees a *real* Month 1 Memory with their own numbers and quote, and a `Months unlocked: 1/12` bar. About 1 session.

---

## 11 // OPEN QUESTIONS FOR S-2

1. Is Month 1 anchored to **paid activation** (recommended) or account creation?
2. If a member **misses a gate**, does the month still open the next calendar month (recommended: yes, "open but not unlocked", so ceilings only hold back features, never the story) or does time stop?
3. **Churn/return:** after a lapsed subscription, do unlocked months persist? (Recommended: yes. Memories are the member's, only the *live* layers pause.)
4. Should Legacy / Admin tags skip the clock (start at Month 12 density)? Demo Machiavelli carries `RND, Usership, Legacy`.
5. Month Memory visible on the **public** `/u/` page by default or opt-in under existing `showMemoryStory` privacy flag? (Recommended: reuse the flag, default off for Month Memories, on for badges.)

---

*S-2: VADIK MARMELADOV · LOT® Founded 7 April 2016 · COSMO® Founded 1 July 2024*
