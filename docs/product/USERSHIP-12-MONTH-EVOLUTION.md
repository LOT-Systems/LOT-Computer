<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Usership: The 12-Month Evolution — From Barebone to LOT® AI

**Status:** Brainstorm / product design proposal — not yet implemented.
**Author:** Claude (scheduled session), for S-2.
**Date:** 2026-09-24
**Reference target state:** `lot-systems.com/u/machiavelli` (public profile of a fully-evolved, long-tenured account) and `lot-systems.com/u/<user>` generally as "the personal OS."

> This session could not fetch the live `/u/machiavelli` page (outbound egress to `lot-systems.com` is blocked from this sandbox). Everything below is grounded instead in what the codebase already computes and already almost shows — `MonthlyPulseWidget`, `monthly-summary.ts`, the badge/CQGS/Architect systems, and `PublicProfile.tsx`. A follow-up pass should visually diff this proposal against the real `/u/machiavelli` page once someone can view it, and correct any month-mapping drift.

---

## 0. The core idea in one paragraph

LOT already *computes* a monthly compressed story of who the user is becoming (`generateMonthlySummary` → narrative, forwardLook, memoryStory, pattern insights, growth deltas) — but today that computation only ever leaves the building as an email. Usership's 12-month arc should be told **in the product**, not the inbox: once a month, on schedule, the system should hand the user a short, paragraph-long, AI-written reflection of their own last 30 days, wrapped in a small ritual (an affirmation, a glyph change, a "months unlocked" tick), so evolution is something they *feel happen to the interface itself* — not something they infer from a badge count going up. Day 1 should look almost empty. Day 365 should look like `/u/machiavelli`. The distance between those two screens, delivered in twelve deliberate steps, **is** the product.

---

## 1. Design constraints carried forward (do not violate)

Per `docs/technical/LOT-STYLE-GUIDE.md`, everything proposed here must stay inside the existing visual language — the evolution is felt through *information density and symbol state*, never through decoration:

- No color as a UI primitive. Hierarchy comes from opacity only (`opacity-90` primary / `opacity-60` secondary / `opacity-40` tertiary).
- No custom fonts, no icon libraries. Meaning is carried by Unicode glyphs already in use elsewhere (`∘ ≈ ≋`, `├─ ╞═╡ ║·║`, `◐ ◆ ✦ ◉`) and by *text*.
- Periods over symbols. "One year with LOT. The portrait is complete." — not "🎉 Congrats!! 1 YEAR!!"
- The `Block` component + click-to-cycle-views pattern (Prompt → History → Patterns, etc.) is the one interaction primitive. New surfaces should be new `Block` panels or new cycle-views on existing widgets, not new visual systems.
- Fade timing convention: 3s hold + 1.4s fade = 4.4s total for ambient/dismissible messages (already implemented in `MonthlyPulseWidget`).
- Everything proposed is **additive** — extend `MonthlyPulseWidget`, `EvolutionWidget`, `ArchitectWidget`, and `monthly-summary.ts`, rather than introducing a parallel design system.

## 2. What already exists (inventory — build on this, don't rebuild it)

| System | File | State today |
|---|---|---|
| Month counter + "N / 12 months" | `src/client/components/MonthlyPulseWidget.tsx` | **Live.** Already computes `monthNumber` from `joinedAt`, shows one static line per month 1–12, dismiss-once ritual. Gated on `UserTag.Usership`. This is the widget to evolve, not replace. |
| Compressed monthly narrative (presence, energy, patterns, growth, narrative, forwardLook, memoryStory) | `src/server/utils/monthly-summary.ts` → `generateMonthlySummary()` | **Live but email-only.** Runs via `executeMonthlyEmailJob()` in `scheduled-jobs.ts`, fires in the first 3 days of the month, stamps `lastMonthlySummaryDate`. Never rendered in-app. **This is the single highest-leverage gap** — the "paragraph-long insight from last month" the brief asks for is already being generated server-side every month and thrown away after the email send. |
| Memory Story (running narrative from all logged Q&A) | `src/server/utils/memory.ts` → `generateMemoryStory` | **Live.** Fed into AI prompts; 15-most-recent-Q&A compression core. Surfaced today only inside `PublicProfile.tsx` (optional toggle) and `MemoryWidget`. |
| Badge tiers by day count | `docs/badges/LOT_BADGES_AND_ACHIEVEMENTS.md` | Day 7 (Common) → Day 30 (Uncommon) → Day 100 (Rare) → Day 365 "The Long Count" (Legendary). Rarity ladder also defines Epic/Mythic. Pattern badges (Balanced/Flow/Consistent/Reflective/Explorer) are **designed but not yet built** — this doc proposes exactly where to slot them in. |
| Self-assembly phase (system "growing itself") | `src/client/components/ArchitectWidget.tsx` | 5 phases: `dormant → awakening → forming → assembled → integrated`. Usership/R&D gated. No explicit time mapping today — this doc proposes one. |
| Citizen Index / level | `src/client/components/EvolutionWidget.tsx` | CQGS stages `Bootstrapping(1-9) → Initializing(10-19) → Integrated(20-29) → Compiled(30-39) → Optimized(40-49) → Transparent(50+)` across 7 modules. Engagement-driven, not time-gated — stays that way; this doc only proposes *expected bands* per month for calibration copy, never a hard gate. |
| Public profile ("the personal OS") | `src/client/components/PublicProfile.tsx` | Shows tags, Usership board profile, QR code (Usership-gated), optional Memory Story. This is the month-12 destination screen. |
| Day-1 onboarding | — | **Does not exist.** New paid users land on the same `System.tsx` feed as a 300-day user, with zero explicit "this is day one" framing beyond `MemoryWidget`'s first-question copy. This is the other real gap alongside the buried monthly summary. |

## 3. The three tangibility threads

Per the brief, three raw counters are what should visibly compound, month over month. Each needs both a *backend number that goes up* and a *UI surface where the user sees it go up*:

1. **Log/Journal depth** — entry count, unique active days, streaks, word depth. Backend: `Logs.tsx` writes, already aggregated into `presence.activeDays` / `presence.totalEntries` / `presence.longestStreak` inside `monthly-summary.ts`. Today the user never sees these numbers as a monthly delta — only implicitly, via badges.
2. **Morning check-ins & self-care clicks** — `EmotionalCheckIn.tsx` (biofield check-in) and `SelfCareMoments.tsx` (`completedToday` counter). These reset daily; there is currently no monthly *rollup* of "you checked in 24 of 30 mornings this month." That rollup is the missing piece, and it's cheap: `monthly-summary.ts` already has the log timestamps needed to compute it.
3. **Memory Story compression** — the AI-authored paragraph. Backend exists (`generateMemoryStory`, `MonthlySummary.narrative/forwardLook/memoryStory`); UI surface does not.

All three should land in **one** new monthly ritual surface (Section 4) rather than three separate ones — that's what makes the evolution feel like a single coherent story instead of a dashboard of stats.

## 4. New / evolved components

### 4.1 `MonthsUnlockedWidget` (evolves `MonthlyPulseWidget`)

Keep everything `MonthlyPulseWidget` already does (dismiss ritual, fade timing, Usership gate) and add:

- A 12-segment glyph progress line instead of the plain "N / 12 months" caption — e.g. `● ● ● ○ ○ ○ ○ ○ ○ ○ ○ ○` using the *same* glyph vocabulary as the current month's Architect phase (Section 5), so the progress bar itself narrates the arc rather than being a generic progress bar.
- Click-through from the dismiss line into the new Memory Capsule (4.2) instead of just vanishing — "Onward." becomes "Onward. →" and opens the capsule once, first time only that month.
- Unlock-styled copy for months that also carry a phase transition (1, 3, 6, 9, 12) — see the table in Section 6.

### 4.2 Memory Capsule (new widget, e.g. `MemoryCapsuleWidget.tsx`)

The centerpiece. Fires once, within the existing `shouldShowMonthlySummary` window (first 3 days of the month), for Usership users only. Structure, top to bottom, inside one `Block`:

1. **Affirmation line** — one short, second-person, LOT-toned sentence, AI-generated from the month's dominant theme (`patterns.dominantThemes[0]`). Not a generic affirmation library — specific to what they actually logged. E.g. "You kept the tea ritual through a hard week." not "You're doing great!"
2. **The paragraph** — `narrative` from `MonthlySummary`, verbatim, unedited. This is the "paragraph-long insight from last month" the brief asks for, and it already exists; it just needs a place to live.
3. **The numbers, stated as prose, not a stat grid** (matches style guide — no dashboards): "22 mornings met with a check-in. 31 entries logged. Your longest run was 9 days." — built from `presence` + a new self-care-completion rollup (Section 3.2).
4. **`forwardLook`** — one line, already generated, currently sent by email only.
5. **Months unlocked tick** — "Month 4 of 12 unlocked." shown last, as the close of the ritual, not the headline (the story should read as *about them*, the counter as a footnote).

**Backend requirement:** `generateMonthlySummary()` currently runs inline inside the email job and is discarded. It needs to be persisted (e.g. `user.metadata.lastMonthlySummary: MonthlySummary` written alongside the existing `lastMonthlySummaryDate` stamp in `scheduled-jobs.ts`) and exposed via a small `GET /api/monthly-summary/current` read endpoint, so the widget can fetch what was already computed rather than recomputing or waiting on the cron's email side-effect.

### 4.3 Self-care rollup (backend-only addition)

Extend `monthly-summary.ts`'s `presence` block with a `checkInRate: { mornings: number, of: number }` computed the same way `activeDays` already is, from `EmotionalCheckIn`/`SelfCareMoments` log entries instead of general logs. Small, additive, same file.

## 5. The phase/glyph spine (ties Architect, badges, and months into one visual language)

Map the existing 5-phase `ArchitectWidget` arc onto the 12-month calendar, and let each phase own one glyph family already used elsewhere in the codebase (so nothing new is invented):

| Phase (existing) | Months | Glyph | Badge milestone crossed in this phase |
|---|---|---|---|
| `dormant` | Day 1 (pre-Month-1) | *(blank — see Section 7)* | — |
| `awakening` | 1–2 | `∘` | Day 7 Common (week 1), Day 30 Uncommon (Month 1 close) |
| `forming` | 3–5 | `≈` | Day 100 Rare (lands mid-Month-4) |
| `assembled` | 6–9 | `╞═╡` | Pattern badges (Balanced/Flow/Consistent — see 6.2) |
| `integrated` | 10–12 | `≋` / `║·║` | Day 365 Legendary "Long Count" (Month 12 close) |

This gives every month a *reason* its glyph looks different, instead of an arbitrary 12-step gradient — the glyph literally reports which self-assembly phase the Architect system already thinks the user is in.

## 6. Month-by-month table

Each row: what's new to *see*, what the AI *says* (Memory Capsule tone), and what closes out the month (badge/unlock). "Log/check-in target" is descriptive framing for the affirmation copy, not a gate — CQGS/badges stay engagement-driven per Section 2.

### 6.1 Month 0 — Day 1 (proposed: new onboarding, currently missing)

- **Screen:** Deliberately barebone. `System.tsx` feed shows only: `MemoryWidget` in "First Question" mode, `Logs.tsx` empty state, and one new first-run line — no badges, no Architect panel, no Evolution widget yet (all suppressed below a "first log written" threshold, not a hardcoded day-count, so it reads as "this appears once the system has something to hold," not a locked wall).
- **Why this matters:** it's the contrast that makes Month 12 legible. If Day 1 already looks like a dashboard, nothing after it reads as evolution.
- **Copy tone:** plain, no mythology yet. "What is your morning beverage preference?" (already the real first question). No affirmations — there's nothing to affirm yet.

### 6.2 Months 1–12

| Month | Phase / glyph | Headline moment | Memory Capsule focus | Badge/unlock at month close |
|---|---|---|---|---|
| **1** | awakening `∘` | System starts noticing. `MonthlyPulseWidget` copy already: *"The first month. The system is beginning to know you."* | First monthly narrative — mostly presence stats, thin pattern data. Affirmation is about *showing up*, not depth. | Day 30 badge (Uncommon) lands here. Architect panel becomes visible for the first time. |
| **2** | awakening `∘` | *"Patterns are starting to form."* (existing copy) | First real `dominantThemes` entry — capsule can now name a specific recurring topic. | — |
| **3** | forming `≈` | *"You have reached Active User status."* (existing copy) — pair this with the phase glyph flipping from `∘` to `≈` for the first time; this is the first *visible* phase transition. | Narrative can now reference month-over-month change ("more consistent than last month"), since two prior summaries exist to compare against. | — |
| **4** | forming `≈` | *"The portrait deepens."* | Day 100 lands mid-month — first Rare badge. Capsule should reference it directly: "You crossed one hundred days this month." | Day 100 badge (Rare). |
| **5** | forming `≈` | *"Consistency is its own reward."* | First candidate month for a **pattern badge** (Consistent/Reflective — currently roadmap-only in the badge doc; this is the natural month to ship them, since enough history now exists to detect a pattern rather than a single data point). | Pattern badge #1 (proposed new). |
| **6** | assembled `╞═╡` | *"The journey is half-declared."* Second visible phase transition (`≈ → ╞═╡`). | Capsule becomes retrospective for the first time: a short "six months ago vs. now" contrast line, pulled from the earliest vs. latest Memory Story entries. This is the emotional midpoint — treat it as weightier than a normal month, matching the existing copy's own emphasis ("half-declared"). | Halfway marker on the 12-segment progress glyph fills. |
| **7** | assembled `╞═╡` | *"The system has been listening."* | Capsule can start using `forwardLook` more assertively — enough history to predict, not just describe. | Pattern badge #2 candidate (Flow/Balanced). |
| **8** | assembled `╞═╡` | *"Rare air."* | Public-profile-eligible narrative snippet — this is roughly where a Usership user's Memory Story becomes substantial enough to be worth showing publicly (ties to the existing optional `showMemoryStory` toggle in `PublicProfile.tsx`). | — |
| **9** | assembled `╞═╡` | *"The self-care practice is a habit now."* Third phase transition (`╞═╡ → ≋` begins). | Self-care rollup (4.3) becomes the headline stat instead of a footnote — this is the month the brief's "regular morning check-ins and self-care button clicks" pays off most visibly, since 9 months is enough for the check-in rate itself to be the story. | — |
| **10** | integrated `≋` | *"Almost there."* | Capsule tone shifts from *reflective* to *anticipatory* — explicitly counts down, mirrors the existing widget copy's own "almost there" framing. | — |
| **11** | integrated `≋` | *"One more."* | Short capsule, deliberately — let the brevity itself signal anticipation. | — |
| **12** | integrated `≋` / `║·║` | *"One year with LOT. The portrait is complete — and still evolving."* (existing copy, exactly right, keep verbatim) | This is the graduation capsule: full narrative, full stats prose, explicit reference to Day 1 ("What began as a question about your morning tea is now a portrait of...") pulled from the very first logged answer if available. Day 365 Legendary badge fires in this window. | Day 365 "Long Count" (Legendary). Public profile becomes eligible for the full "evolved" presentation — QR code, Usership board profile, all optional toggles recommended on by default at this point (still user-controlled). |

### 6.3 After month 12

The brief frames Usership as evolving "within the 12-month evolution" toward "LOT® AI" — read that as: month 12 is not an end state, it's the point where the *system* stops being the one driving the ritual cadence and starts reflecting the user's own established rhythm back at full fidelity (`/u/machiavelli` as the steady-state). Concretely: after month 12, `MonthsUnlockedWidget` retires (nothing left to unlock), and the Memory Capsule continues monthly but drops the "X of 12" framing entirely — it's no longer a countdown, it's simply the ongoing monthly ritual, same as email already does today, just now also in-app.

## 7. What to explicitly *not* build

- No hard gates on CQGS levels or badge access by calendar month — engagement stays the only lever for those systems, per how `EvolutionWidget` already works. The month-to-phase table above is calibration copy for the AI's tone, not an access-control mechanism.
- No new color system, no icon library, no confetti/celebration animation beyond the existing 4.4s fade. A "new month" moment should feel like the system quietly noticed, not like a mobile-game reward screen.
- No stat-grid/dashboard UI for the rollup numbers (Section 4.2.3) — keep them as prose sentences, consistent with the rest of the app.
- Do not gate the Day-1 barebone state on a hardcoded day count (e.g. "hide badges until day 7") — gate it on *data existing* (first log written, first memory answer given), so a highly engaged user isn't artificially held back and a slow starter isn't shown an empty Architect panel prematurely.

## 8. Implementation notes (for engineering handoff)

Proposed touch points, smallest diff first:

1. `src/server/utils/monthly-summary.ts` — add `checkInRate` to `presence` (Section 4.3). Pure addition, no signature break.
2. `src/server/scheduled-jobs.ts` (`executeMonthlyEmailJob`) — persist the generated `MonthlySummary` onto `user.metadata.lastMonthlySummary` alongside the existing `lastMonthlySummaryDate` write, instead of discarding it after the email send.
3. New route, e.g. `src/server/routes/api.ts` — `GET /api/monthly-summary/current`, Usership-gated (reuse the `hasUsershipTag` check already in `src/server/models/user.ts`), returns the persisted summary.
4. New component `src/client/components/MemoryCapsuleWidget.tsx` — Section 4.2, modeled directly on `MonthlyPulseWidget.tsx`'s show/dismiss/fade/localStorage-dedupe pattern (same `lot_pulse_<userId>`-style key convention, different key namespace e.g. `lot_capsule_<userId>`).
5. `src/client/components/MonthlyPulseWidget.tsx` — evolve in place per Section 4.1 (glyph progress line, click-through). Keep the component name or rename to `MonthsUnlockedWidget` and update the one import site in `System.tsx` — engineering's call, either is a small diff.
6. `src/client/components/ArchitectWidget.tsx` — no functional change required; the phase-to-month mapping in Section 5 is copy/interpretation living in the new widgets, not a change to Architect's own phase-detection logic.
7. Badge doc (`docs/badges/LOT_BADGES_AND_ACHIEVEMENTS.md`) — the two pattern badges proposed for Months 5 and 7 (Section 6.2) should be picked from the doc's own existing roadmap list (Balanced/Flow/Consistent/Reflective/Explorer) rather than invented fresh; this doc intentionally doesn't pick which two, that's a call for whoever ships the badge engine work.

## 9. Open questions for S-2

- Should the Memory Capsule be dismissible-forever, or does the user get to revisit past months' capsules later (an "archive" view)? Nothing in the current `MonthlyPulseWidget` pattern persists past months anywhere retrievable — worth deciding before building, since it changes whether capsule text needs a permanent home in the DB beyond `lastMonthlySummary` (which only ever holds the *most recent* one).
- Does "LOT® AI" at month 12 imply a literal product/tier rename in the UI (a new badge/label replacing "Usership" in the nav or profile), or is it purely narrative framing for this doc's own title? The codebase has no `LOT® AI` string anywhere today — worth confirming before any label changes ship.
- This doc could not visually compare against the live `/u/machiavelli` reference (network egress blocked in this session). Recommend a follow-up pass — either a session with browser/screenshot access, or S-2 pasting a screenshot — to sanity-check the month-to-visual mapping in Section 6 against what that account actually shows today.
