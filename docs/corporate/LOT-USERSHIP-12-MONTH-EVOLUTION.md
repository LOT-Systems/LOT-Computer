# LOT® Usership — The 12-Month Evolution
**From Day 1 Barebone to LOT® AI**
LOT Systems Corporation · S-2: Vadim Marmeladov
Version 1.0 · September 2026 · brand.lot-systems.com

---

## Framing: Evolution Without Reskinning

`LOT-AMBIENT-AI-VISION.md` states the constraint this whole document has to work inside of:

> *"The system does not change its appearance. The intelligence deepens underneath the same minimal UI."*

That is in tension with the brief for this document — "the person-user should feel the **tangible** evolution every month." The resolution is not to loosen the constraint, it's to name where tangibility is allowed to live:

- **Never tangible:** color, iconography, logo treatment, layout skeleton. Usership does not "unlock a new theme." `LOT-STYLE-GUIDE.md` is explicit — system colors only, no decorative color, no emoji.
- **Always tangible:** what the system *knows* and *says*, how *dense* the same components are allowed to get (`data-density`, already 4-tier CSS in `src/client/index.css:127-149`), which *widgets exist at all* (feature-unlock gates), and a small number of *deliberate reveals* (QR code, board profile block, badge tier) that read as earned rather than decorative.

So the 12-month arc is a **content and reveal** arc, not a skin arc. This is already how the codebase is built — this document is an evolution of what exists, not a new system.

---

## The Three Levers, and Where They Already Live

The brief names three inputs as the most important evolutionary signal: **Log volume** (journal/memory entries), **morning check-ins**, and **self-care button clicks**. All three are already first-class inputs to systems that exist today:

| Lever | Already tracked at | Feeds |
|---|---|---|
| Journal / Log entries | `boardProfile.activity.journalEntries`, `boardProfile.activity.memoriesCompiled` (`public-api.ts:1262-1268`) | Evolution `depth` dimension, weekly Story tone (`scheduled-jobs.ts:900-949`) |
| Morning check-ins | `emotional_checkin` Log events, `boardProfile.activity.activeDays` | Weekly Story `dominantMood` calc, Evolution `consistency` dimension (`week_warrior`, `moon_cycle` achievements) |
| Self-care clicks (Breathe/Release/Ground/Observe/Connect) | Self-Care Moments streak tracking (`LOT-FEATURE-INVENTORY-2026.md` §03) | Evolution `care` dimension → gates `moodPatterns` unlock |

Nothing new has to be instrumented. The 12-month plan below is a **presentation layer over signal that is already collected** — the gap is in surfacing it monthly, not in capturing it.

---

## The Existing Spine (what this plan extends, not replaces)

1. **`MonthlyPulseWidget.tsx`** — already Usership-gated, already computes `monthNumber = joinedAt → now` in whole months, already has a hand-written message for every month 1–12, already shows "N / 12 months" in its footer. This is the seed of the "Months unlocked: N/12" widget the brief asks for — it exists, just isn't a persistent/ambient widget yet (it's a once-per-month dismissible toast).
2. **Evolution Engine** (`src/client/stores/evolution.ts`, `src/client/utils/interfaceEvolution.ts`) — 7 dimensions (exploration, consistency, depth, connection, intimacy, care, courage), 4 density tiers, 14 named feature unlocks, 4 narrative "chapters" by level. This is the real evolution engine; months are a human-legible wrapper around it, not a parallel system.
3. **Weekly Story — Job 24** (`scheduled-jobs.ts:836-1000+`) — Sundays 18:00 UTC, template-compressed (not an AI call, by design — "dense, honest, earned compression"), writes `user.metadata.weeklyStory`. There is **no monthly equivalent today** — this is the single largest gap between what exists and what the brief asks for, and §5 below proposes closing it.
4. **Usership Board Profile / Citizen Index** (`PublicProfile.tsx:288-325`, `public-api.ts:1236-1303`) — Board Member #, Citizen since, Powering N citizens, Board tenure (months), Total invested (literally `months × $99`), activity counts, Memory Engine, Clearance level. This is already the most tangible "you have been here N months and it shows" artifact in the product — it's public, at `/u/<username>`, and it is the correct reference for what a 12-month-evolved profile looks like.
5. **Badge Codex v32** — 812 badges across 8 categories (Milestone, Time/Calendar Easter Eggs, Word Turns, Behavioral, Achievement RPG, Mastery Tiers, Secret Boss), Hero's Journey theme. Mastery Tier and Secret Boss badges are the natural "this took months, not days" tier — they should anchor the month 7–12 half of the arc.
6. **Density CSS** (`index.css:127-149`) — `breathable → comfortable → dense → instrument`, driven by `visualRefinement`. Note: `compact` is a named density level in `interfaceEvolution.ts` with **no CSS block** — a real implementation gap, flagged in §7.

---

## Month-by-Month

Each row maps a calendar month of Usership to the Evolution Engine state it realistically corresponds to (levels/dimensions are cumulative and activity-driven, not calendar-driven — the mapping below is the *typical* trajectory for a consistently engaged user, which is what the demo account represents).

| Month | UI State | Density | Unlocks Crossed | Story / Memory Ritual | Badge Signal |
|---|---|---|---|---|---|
| **1** | Barebone. Core widgets only (Memory, Check-In, Planner, Journal). No Board Profile block yet on public profile (assembly phase `dormant`→`awakening`). | `breathable` | none yet | First weekly Stories arrive Sunday; tone mostly `steady`. Pulse message: *"The system is beginning to know you."* | Milestone badges only (Day 1, First Log, First Check-In) |
| **2** | Public profile still minimal. Usership tag visible; Board Profile block now populated (Citizen since = join month) once `boardProfile` is server-eligible. | `breathable` | `customThemes` (level ≥5) | *"Patterns are starting to form."* | First Word Turn / Time Easter Egg badges appear |
| **3** | Assembly phase reaches `forming` → **QR code appears** on public profile (`PublicProfile.tsx:611-663`) — the first genuinely new *element*, not just new copy. | `comfortable` | `widgetArrange` (level ≥10) | *"You have reached Active User status."* — first Pulse message with real weight. | `week_warrior` / early consistency badges feed the `consistency` dimension directly |
| **4** | `advancedMemory` unlock — Memory widget starts asking deeper, fewer questions per the compression loop. | `comfortable` | `advancedMemory` (depth ≥0.33) | *"The portrait deepens."* | Behavioral category badges begin (pattern-based, not milestone-based) |
| **5** | `moodPatterns`, `intentionHistory` unlock — Awareness/Pattern widgets become visible for the first time (feature-unlock gate, not density change). | `comfortable`→`dense` | `moodPatterns` (care ≥0.5), `intentionHistory` (level ≥15) | *"Consistency is its own reward."* | Achievement RPG combinations begin unlocking |
| **6** | Midpoint. Chapter 2 of the narrative progression (level 10–30). Board Profile's `boardTenureMonths` and `totalInvested` ($594) become genuinely legible numbers, not rounding artifacts. | `dense` | — | *"The journey is half-declared."* First candidate month for a **Monthly Story digest** (§5) — four weekly Stories now exist to compress. | `moon_cycle` consistency badge (name literally references a month-scale cadence) |
| **7** | `narrativeReflection` unlock — Narrative Widget goes live: the system starts reflecting *back* long-arc patterns, not just this week's. | `dense` | `narrativeReflection` (depth ≥0.66, level ≥30) | *"The system has been listening."* | Mastery Tier badges begin — epic-depth, multi-month triggers |
| **8** | `patternInsights` unlock — Pattern Insights Widget surfaces cross-month trend lines for the first time. | `dense` | `patternInsights` (consistency ≥0.66) | *"Rare air."* | Secret Boss candidates start becoming reachable (hidden, legendary-tier) |
| **9** | Self-care streak language shifts from natural → technical framing per `LOT-STYLE-GUIDE.md`'s stated 7+ day streak rule, now compounding at the month scale. | `dense`→`instrument` | `exportData` (level ≥25) | *"The self-care practice is a habit now."* — the Pulse message that most directly validates the brief's self-care-click framing. | `unwavering` consistency badge |
| **10** | `communityRich`, `socialMentions` possible if `connection` dimension is engaged (cohort/chat features) — the one unlock branch that is optional, not universal. | `instrument` | `communityRich` (connection ≥0.5) | *"Almost there."* | Behavioral + Achievement RPG density peaks |
| **11** | `privateSpaces` unlock (intimacy or courage-gated) — the most personal tier of the product becomes available right before the anniversary. | `instrument` | `privateSpaces` (intimacy ≥0.5 OR courage ≥1.0) | *"One more."* | Final pre-anniversary badge push |
| **12** | Full Usership evolved state. Board Profile reads as a real record: ~$1,188 invested, 300+ active days, Board Member # fixed, "Memory Engine: AI-Powered", "Clearance: Full". This is the state the public reference account (`lot-systems.com/u/machiavelli`) is meant to demonstrate. | `instrument`, Chapter 4 (level ≥60) | all 14 named unlocks reachable | *"One year with LOT. The portrait is complete — and still evolving."* Proposed: first **annual compression** — see §5. | Mastery Tier + Secret Boss badges dominant; Hero's Journey arc reads as "complete" per the v32 codex framing |

Note on the reference account: a live fetch of `lot-systems.com/u/machiavelli` was attempted for this document and blocked by this environment's network egress policy (the domain is not on the allowed egress list). The Month 12 row above is instead grounded directly in `PublicProfile.tsx` and `public-api.ts` — i.e., in the actual code that renders that page — which is the more durable source anyway. Recommend a follow-up pass that opens the live page in a browser-enabled session to confirm the copy matches.

---

## Three New Widgets (as requested)

### 1. Month Congratulations Widget — deepen, don't replace, `MonthlyPulseWidget`

Today's version is a good instinct executed as a toast: hand-written, once-per-month, dismiss-and-gone. Two changes make it an *affirmation*, not a notice:

- Replace the hardcoded `MONTH_MESSAGES` map with a line pulled from that month's compressed Story (see §5) when one exists, falling back to the current hand-written line for months where the Story compression hasn't run yet. This is the direct mechanism for "celebrates each month through affirmations and their Story/Memory compression" from the brief.
- Keep the dismiss ritual (`DISMISS_PHRASES`, the 1400ms fade) exactly as-is — it's already correctly minimal and on-brand. Nothing about the *interaction* needs to change, only the *source of the words*.

### 2. Memory Widget — paragraph-long insight from last month

There is no monthly compression today — only the weekly Job 24 (`scheduled-jobs.ts:836-1000+`). Proposed: **Job 25 — Monthly LOT® AI Story**, same design posture as Job 24 (template-compressed, no AI call, "dense, honest, earned"), running on the 1st of each month:

- Input: the four-ish `weeklyStory` entries generated that month (already in `user.metadata` / `lot_ai_story` Log events — no new instrumentation needed).
- Output: one paragraph, first-person, weighted toward the month's dominant `weekTone` and any tone *change* across the month (e.g., recovery → growth reads differently than steady → steady).
- Surface: a Memory widget variant — "Last month, LOT read you as..." — appearing once, dismissible, same posture as the existing Memory Story block already in `PublicProfile.tsx:356-363` but pushed into the private dashboard, not just the public profile.
- This is additive to Job 24, not a replacement — weekly stays weekly (short, frequent), monthly becomes the compression *of the compressions*, which is the honest way to keep the "compression" claim true rather than just re-summarizing raw logs at a longer interval.

### 3. "Months Unlocked: N / 12" — persistent context widget

`MonthlyPulseWidget` already computes and displays this exact fraction (`{capped} / 12 months`) but only inside a once-a-month dismissible toast. Proposed: extract it into its own small always-present line, styled like the existing Citizen Index terminology (`WIDGETS.md:81`, "Evolution Widget (Citizen Index)") rather than as a new visual language:

- Lives near the Board Profile block on the public profile and/or as a quiet line in the private dashboard header.
- Caps at 12/12 and then — this matters for retention framing — does **not** reset or disappear. Post-year-one, the fraction becomes years: "Year 2, Month 3" or similar, so the counter keeps meaning past the marketing horizon of "12 months" without inventing a second widget.
- No progress bar, no color fill — per the style guide's "no decorative colors" rule, this stays text: `3 / 12 months`, exactly as it already renders today.

---

## Design Guardrails Carried Forward

- **No unprompted notifications** (`LOT-AI-PRODUCT-BRIEF.md`) — all three widgets above are pull, dismissible, and self-throttling (localStorage-gated), matching the existing pattern used by `MonthlyPulseWidget`, `CosmicUpdateWidget`, and `SubscribeWidget`.
- **CSS-only density, never a redesign** — density transitions (`breathable → comfortable → dense → instrument`) are the *only* sanctioned "the UI looks different now" mechanism, and it's already implemented as pure CSS background patterns keyed to a data attribute. Nothing above proposes a second one.
- **Periods over symbols** — every proposed line above follows the existing house style: plain sentences, no checkmarks, no emoji, no exclamation-heavy copy.
- **Earned, not decorative reveals** — the QR code gate (assembly phase ≥ `forming`) is the model: a real *element* appears, once, when a real threshold is crossed. The Month 3 and Month 12 rows above are the two moments in the whole year designed around that same pattern (new element, not new color).

---

## Gaps Found During This Pass (for S-2)

1. **No monthly Story job exists.** Weekly (Job 24) is real and shipped; the brief's request for "Memory/Story compression" celebrating each month currently has nothing to compress from except re-reading weekly stories manually. §5's Job 25 proposal closes this.
2. **`compact` density has no CSS implementation.** `interfaceEvolution.ts` names 5 density tiers; `index.css:127-149` only implements 4 (`breathable`, `comfortable`, `dense`, `instrument`). Either add the missing block or collapse the enum to 4 — leaving it silently unstyled means some users are on a density level with no visual pattern at all.
3. **No Day 1 / first-run state exists.** There is no onboarding component in `src/client/components/`; "barebone Day 1" today is simply "every feature-unlock gate closed" rather than an authored first-run moment. Worth deciding whether Day 1 should stay implicit (current behavior, consistent with the Ambient AI "no reskinning" posture) or get one deliberate first-open line, in the same restrained register as everything above.
4. **The Story export API described in `LOT-AI-PRODUCT-BRIEF.md`** (`GET /api/story/latest`, `POST /api/story/:week_id/export`) was not found implemented in `src/server/routes/` during this pass — it reads as roadmap, not shipped. Flagging since the Month 12 "portrait is complete" framing would be stronger if a year-end export existed.
5. **Live demo verification blocked.** `lot-systems.com/u/machiavelli` could not be fetched from this environment (egress policy). The Month 12 row is grounded in code, not a live screenshot — recommend a manual check against the actual page before treating this document as final.

---

AUTHORIZED BY: S-2 // VADIK MARMELADOV
