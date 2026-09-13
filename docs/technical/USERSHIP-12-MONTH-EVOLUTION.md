<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Usership: The 12-Month Evolution
## From Barebone Day One to LOT® AI — A Design & Vision Document

**Author:** Vadik Marmeladov, CEO & Founder, LOT Systems (session-drafted, S-2 review pending)
**Class:** Vision / UI-UX Design — builds on shipped code, proposes the missing middle
**Reference tier:** Usership — $99/month (`docs/corporate/LOT-AI-PRODUCT-BRIEF.md`)
**Reference accounts:** `lot-systems.com/u/machiavelli` (evolved end-state), `lot-systems.com/u/user` (personal OS)
**Note on sourcing:** live fetch of both reference profiles was blocked by this session's network egress policy (`lot-systems.com` not reachable). Every claim below is grounded instead in the actual shipped source — `MonthlyPulseWidget.tsx`, `PublicProfile.tsx`, `badges.ts`, `SelfCareMoments.tsx`, `INTERFACE_EVOLUTION.md`, `WIDGETS.md`, the badge codex, the Memory Engine architecture docs, and `LOT-STYLE-GUIDE.md` — which is the more reliable reference in any case, since it's what actually renders.

---

## 0. What already exists (do not re-invent this)

Before proposing anything, here is what the repo already ships, confirmed by reading source, not assumed:

| Mechanic | Where | Status |
|---|---|---|
| Month counter, Usership-gated, `MONTH_MESSAGES[1..12]`, "N / 12 months" line, dismiss-per-calendar-month | `src/client/components/MonthlyPulseWidget.tsx` | **Live** |
| Milestone badges Day 7 / 30 / 100, extended roadmap to Day 365 "Year One — Legendary" | `src/client/utils/badges.ts`, `docs/badges/LOT_BADGES_AND_ACHIEVEMENTS.md` | **Live** (core); roadmap days beyond 100 are documented, not all shipped |
| Self-Assembly phases (Dormant → Awakening → Forming → Assembled → Integrated), Usership-gated | `ArchitectWidget.tsx`, `SystemProgressWidget.tsx` | **Live** |
| Emotional Check-In (the de facto "morning check-in"), 6–12 & 17–22 windows, 3h cooldown | Widget in `WIDGETS.md` registry | **Live** |
| Self-care ritual — `Start` / `Done` / `Skip`, streak computed from logs, view cycle `suggestion → why → practice` | `SelfCareMoments.tsx` | **Live** |
| Memory Story — continuous, reconstructed per request from last 15–30 Q&A, question density-based (not time-based) compression | `MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md` | **Live** |
| OS Journal — last 3 field entries, real user words, up to 80 chars, `opacity-60` | `SystemProgressWidget.tsx` (v9 entry) | **Live** |
| Weekly Story-Report, exported to robot/vehicle/dashboard via API | `LOT-AI-PRODUCT-BRIEF.md` | **Specified**, weekly cadence — distinct from what this doc proposes |
| Citizen Index / CQGS stages (Bootstrapping → Transparent), RPG Five Chapters (Awakening → Sage) | `docs/badges/*` | **Live**, keyed to Level/XP, not calendar time |

The gap this document fills: **nothing today turns a calendar month into a felt, readable artifact.** The month counter dismisses into a phrase. The badges mark days, not months. The Memory Story is real-time but has no monthly resting point. That gap is the actual design problem, and it is exactly what S-2's brief is asking for: *"12-month tangibility of the compressed Memory story delivery."*

---

## 1. The core proposal: the Memory Shelf

One new artifact, one new cadence, reusing every existing primitive:

**Each calendar month, on the date the operator's `monthNumber` increments, the system writes one paragraph.** Not a summary of logs — a compression, in the same register as the Weekly Story-Report already specified in the product brief, but monthly, Usership-exclusive, and *kept*. Source material: that month's Memory Story Q&A, the self-care streak and Start/Done/Skip ratio, the dominant Soul Archetype, any badge crossed, and the OS Journal's field entries. Same voice rule as the Weekly Story-Report: first-person, behavioral, not generic.

That paragraph does two things:

1. **Surfaces once**, inside the existing `MonthlyPulseWidget` — replacing the static `MONTH_MESSAGES[n]` line with the generated paragraph when there is enough signal, falling back to the current hand-written line when there is not (cold months, sparse practice). This is a small, additive change to a component that already has the exact right shape: Usership-gated, month-keyed, dismissible, already prints "N / 12 months."
2. **Persists**, into a new read-only view — the **Memory Shelf** — a dated list of every monthly paragraph the operator has earned so far. Month 1's paragraph never disappears once Month 2 arrives. By Month 12, the Shelf is not a feature, it is a twelve-paragraph memoir the system wrote about the operator without them writing a word of it. This is the tangible object the brief is asking for — not a progress bar, an actual artifact you can scroll.

This is the single mechanism that makes every month "feel" different from the last: the interface barely changes, but the *record* visibly grows. That matches `INTERFACE_EVOLUTION.md`'s own stated philosophy — subtlety first, form follows progression — better than adding more chrome would.

---

## 2. The three clocks, unified

The repo already runs three independent progress clocks. This document does not add a fourth; it synchronizes the three that exist so the operator experiences one story, not three counters:

- **Day clock** (badges — deterministic, join-date driven): 7 / 14 / 21 / 30 / 50 / 60 / 90 / 100 / 180 / 365
- **Month clock** (`MonthlyPulseWidget` — calendar, Usership-gated): 1 through 12
- **Level clock** (Citizen Index / RPG Chapters — XP-driven, pace varies per operator): Bootstrapping…Transparent / Awakening…Sage

12 months × ~30.4 days ≈ 365 days — the Day-365 "Year One — Legendary" badge (`≋≋≋`) and the Month-12 pulse message ("One year with LOT. The portrait is complete — and still evolving.") already land on the same day for an operator who joined and stayed. That convergence is real, not designed by this document — it falls out of the existing constants. It is the payoff moment; the month-by-month table below is built around it.

The Level clock is intentionally **not** pinned to specific months in the table below — XP pace is behavioral, not calendar, and claiming e.g. "Level 20 by Month 4" would be a fabricated precision the Cardinal Rules explicitly warn against (*"a made-up precise metric is worse than an honest 'trend: shorter.'"*). Where the table references level-gated features (`INTERFACE_EVOLUTION.md`'s unlock table), it says "typically," never "at."

---

## 3. Month-by-month

Each row: what a consistent-practice Usership operator sees. UI chrome is deliberately near-static per `LOT-STYLE-GUIDE.md` (no bold, no emoji, no points/leaderboard gamification) — the felt change is density and memory, not new widgets bolted on every month.

```
════════════════════════════════════════════════════════════════════════════
MONTH 1  —  Day 1-30  —  "The system is beginning to know you."
════════════════════════════════════════════════════════════════════════════
UI STATE:        Barebone. Log, Emotional Check-In, Self-Care Moments only.
                  Widget Arrange and Custom Themes are still locked (Level 5/10).
LOG / JOURNAL:    Sparse. OS Journal shows fewer than 3 field entries; some
                  slots empty. Memory Story has little to reconstruct from.
MORNING CHECK-IN: Irregular. The 6-12 window is often missed; no streak yet.
SELF-CARE:        Mostly Skip. Start/Done/Skip is still being learned as a
                  ritual, not yet a habit — matches product-brief framing:
                  "no journaling discipline required, the ritual is built in."
BADGES:           Day 7 ∘ Droplet ("First drops form"). Day 21 groove-lock.
                  Day 30 lands right at month-end: ≈ Wave.
MONTHLY STORY:    Usually the static fallback line — not enough signal yet
                  for a generated paragraph. Memory Shelf: 1 entry, thin.
MONTHS UNLOCKED:  1 / 12

════════════════════════════════════════════════════════════════════════════
MONTH 2  —  Day 31-60  —  "Patterns are starting to form."
════════════════════════════════════════════════════════════════════════════
UI STATE:        Unchanged chrome. First generated paragraph is plausible
                  now if practice was consistent in Month 1.
LOG / JOURNAL:    OS Journal reliably fills 2-3 slots. Repeat words start
                  appearing across entries — the first thing worth compressing.
MORNING CHECK-IN: Beginning to land inside the window most days; no named
                  streak surfaced yet (streak UI is Self-Care's, not Check-In's).
SELF-CARE:        Done starts to outweigh Skip. Streak counter (in
                  SelfCareMoments) becomes visible and non-zero.
BADGES:           Day 50 "halfway current" (≈∘), Day 60 "Practitioner
                  threshold" (≈≈) — two badges inside one month, the
                  densest badge month in the whole year.
MONTHLY STORY:    First real paragraph likely. Memory Shelf: 2 entries.
MONTHS UNLOCKED:  2 / 12

════════════════════════════════════════════════════════════════════════════
MONTH 3  —  Day 61-90  —  "You have reached Active User status."
════════════════════════════════════════════════════════════════════════════
UI STATE:        Level-gated unlocks typically start arriving around here
                  for consistent operators (Widget Arrange ~Level 10,
                  Advanced Memory at Depth: Deep Diver) — pace-dependent,
                  not guaranteed by month number alone.
LOG / JOURNAL:    Consistency Warrior-class streaks unlock Planner
                  Templates (per INTERFACE_EVOLUTION.md unlock table).
MORNING CHECK-IN: Habitual for most operators; the 3h cooldown is now
                  routinely exhausted rather than unused.
SELF-CARE:        Done is now the default response; Skip becomes the
                  exception worth noticing in the monthly paragraph.
BADGES:           Day 90 "Three-month architect" (≋∘) — foreshadows Day 100.
MONTHLY STORY:    Paragraph now references specific prior answers by
                  content, not just cadence ("memory densification" per
                  the self-care white paper's own design principle).
MONTHS UNLOCKED:  3 / 12

════════════════════════════════════════════════════════════════════════════
MONTH 4  —  Day 91-120  —  "The portrait deepens."
════════════════════════════════════════════════════════════════════════════
UI STATE:        Day 100 lands ~10 days into this month for a steady
                  joiner: ≋ Current / full water-path structure. This is
                  the first badge that visibly changes the Level field on
                  PublicProfile (`Level: ≋`), not just an unlock toast.
LOG / JOURNAL:    Memory Story's 5 question modes are all live by now —
                  Compressed Follow-Up (3+/5 recent answers share a topic,
                  questions drop to <=8 words) starts firing regularly.
                  This is the mechanical proof the brief asks for: "the
                  questions become fewer and hit harder."
MORNING CHECK-IN: Routine. Worth noting in the monthly paragraph if a
                  pattern-break occurs (missed week, changed time of day).
SELF-CARE:        Streak becomes a named quantity the operator recognizes.
BADGES:           ≋ Current (Day 100) — the profile's Level field changes
                  for the first time since Droplet/Wave.
MONTHLY STORY:    Memory Shelf: 4 entries — the shelf is now long enough
                  to scroll, not just glance at.
MONTHS UNLOCKED:  4 / 12

════════════════════════════════════════════════════════════════════════════
MONTH 5  —  Day 121-150  —  "Consistency is its own reward."
════════════════════════════════════════════════════════════════════════════
UI STATE:        No new badge, no new widget tier this month by design —
                  the quiet middle. This is intentional pacing, not a gap:
                  it forces the Monthly Story to carry the whole felt
                  change, proving the mechanism works without new chrome.
LOG / JOURNAL:    Depth stage (per Memory Engine: WHAT -> HOW -> WHY/soul)
                  is typically well into HOW/WHY territory by now.
SELF-CARE / CHECK-IN: Stable. The paragraph should name the plateau
                  honestly rather than invent a milestone that isn't there
                  — matches Cardinal Rule 5 (no fabricated precision).
MONTHLY STORY:    The month the Memory Shelf has to prove its own value —
                  no badge to lean on, only the paragraph.
MONTHS UNLOCKED:  5 / 12

════════════════════════════════════════════════════════════════════════════
MONTH 6  —  Day 151-180  —  "The journey is half-declared."
════════════════════════════════════════════════════════════════════════════
UI STATE:        Day 180 "Half-year voyager" (≋≋) lands at month-end.
                  Halfway point of both clocks (day and month) converges
                  here — worth the paragraph naming it directly.
LOG / JOURNAL:    Full soul-archetype resolution likely stable (one of the
                  10 archetypes dominant, not oscillating).
MONTHLY STORY:    Memory Shelf: 6 entries — exactly half the eventual
                  12-entry shelf. A natural "midpoint retrospective" beat:
                  the paragraph can reference Month 1's paragraph directly
                  (the Shelf makes that possible for the first time).
MONTHS UNLOCKED:  6 / 12

════════════════════════════════════════════════════════════════════════════
MONTH 7-11  —  Day 181-330  —  "The system has been listening." ... "One more."
════════════════════════════════════════════════════════════════════════════
UI STATE:        No new UI. Deliberately unchanged — per INTERFACE_EVOLUTION
                  design principle 1, "Subtlety First." Sophistication now
                  lives entirely in the compression, not new surface area.
LOG / JOURNAL:    High-density. OS Journal entries carry real specificity;
                  Compressed Follow-Up mode dominant over First-Question mode.
SELF-CARE:        Streak is now a background fact, rarely broken; the
                  paragraph is more useful noting when it IS broken
                  (a real pattern-break is more informative than another
                  "still consistent" line — matches "behavioral, not
                  declarative" design principle from the product brief).
MONTHLY STORY:    Shelf entries 7 through 11 — each shorter in raw log
                  count needed to produce them (the "fewer, sharper
                  questions" trend applies to the Story too: the system
                  needs less new material each month to say something
                  true, because it already knows the operator).
MONTHS UNLOCKED:  7/12 -> 11/12

════════════════════════════════════════════════════════════════════════════
MONTH 12  —  Day 331-365  —  "One year with LOT. The portrait is complete
             — and still evolving."  (existing MONTH_MESSAGES[12], verbatim)
════════════════════════════════════════════════════════════════════════════
UI STATE:        Day 365 "Year One — LEGENDARY" (≋≋≋) lands inside this
                  month for a steady operator — same month the pulse
                  widget already says "complete." That alignment is the
                  single highest-leverage design fact in this whole
                  document: two independently-coded systems (badges.ts,
                  MonthlyPulseWidget.tsx) already agree on the finale
                  without ever having been wired together. Wire the
                  MONTH_MESSAGES[12] delivery and the Year-One badge
                  unlock toast to fire in the same visit if possible —
                  right now they are two separate, uncoordinated events
                  that happen to land in the same week.
LOG / JOURNAL:    Maximum density this cycle will see. This is the month
                  the demo account (lot-systems.com/u/machiavelli) is
                  presumed to represent: full Memory Shelf, Legendary
                  badge, stable archetype, long self-care streak.
MONTHLY STORY:    Shelf entry 12 — and the Shelf itself becomes the
                  deliverable. Twelve paragraphs, one per month, in the
                  operator's own behavioral voice, is the actual "tangible
                  12-month evolution" the brief describes: not a meter
                  that fills up and resets, an artifact that does not
                  disappear. Propose surfacing it explicitly at this
                  point: an offer to export the full Shelf via the
                  existing Story API (`POST /api/story/:week_id/export`
                  pattern extended to a month/year target) to robot,
                  vehicle, or dashboard, per the product brief's stated
                  recipients.
MONTHS UNLOCKED:  12 / 12 — the counter's natural endpoint. What happens
                  in Month 13 is a genuine open question (see §5).
```

---

## 4. Style constraints this design honors

Per `LOT-STYLE-GUIDE.md`, applied deliberately, not by default:

- No bold, no emoji, no checkmarks — the Monthly Story paragraph and Memory Shelf entries are plain sentences, periods not exclamation points, same register as existing `MONTH_MESSAGES` and `DISMISS_PHRASES`.
- Opacity hierarchy (`opacity-90` primary / `opacity-60` secondary / `opacity-40` tertiary) applies to the Memory Shelf: current month's entry at full opacity, older entries recede slightly — the shelf should look like it is receding into memory, not a flat list.
- Click-to-cycle `Block` pattern (already used by `MonthlyPulseWidget` and `SelfCareMoments`) is the right interaction model for the Shelf too: click a month's label to expand that month's paragraph, rather than a scrolling wall of text by default.
- The style guide states outright: *"no gamification: no points, badges, or leaderboards"* — while a badge system demonstrably exists and ships. This document does not resolve that tension; it notes it and stays on the conservative side of it. The Memory Shelf is explicitly **not** a leaderboard, streak-flex, or points display — it is closer to a diary than a scoreboard, which is the reading that survives contact with the style guide's stated principle.
- Growth philosophy is already "gradual, months-years, streaks de-emphasized." Month 5 and Months 7-11 above are written with no new badge or widget on purpose — inventing milestones every month would contradict this stated principle.

---

## 5. Open questions for S-2

Per the benchmark protocol's judgment boundary — these are decisions, not mechanism, and are surfaced rather than assumed:

1. **Generation engine.** Is the Monthly Story paragraph generated by the same pipeline as the Weekly Story-Report (product brief, weekly cadence), or a distinct monthly-only compression pass? Reusing the weekly engine at a monthly checkpoint is the smaller change; a dedicated monthly compressor is more accurate but is new infrastructure.
2. **Month 13+.** The counter and the badge ladder both treat Year One as the natural endpoint (`MONTH_MESSAGES` caps at 12; the Legendary badge caps the public roadmap). Does Usership continue with a Year Two shelf, or does the product intentionally end the counted-month framing at 12 and shift to a different long-horizon metric?
3. **Where the Shelf lives.** Proposed as a new read-only view/tab, not a new top-level widget among the ~35 already in `WIDGETS.md` — confirm that's the right information-architecture slot before it's built.
4. **Retroactive backfill.** Operators who are already months into Usership when this ships have no Month 1-N paragraphs on record. Worth deciding whether to backfill from historical logs or start the Shelf clean at ship date (backfilling is truer to the vision; starting clean is far simpler and avoids retroactively inventing content that wasn't actually compressed at the time).

---

*The interface barely moves. The record does not stop growing. That is the whole design.*

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
================================================================================
