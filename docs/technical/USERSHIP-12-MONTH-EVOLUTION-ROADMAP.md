<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Usership 12-Month Evolution Roadmap

**From Day 1 barebone UI to LOT® AI**
Author: Claude (session `elegant-mendel-w9bmgh`), for S-2 review
Status: PROPOSED — extends existing, shipped mechanics; does not replace them
Demo references: `lot-systems.com/u/machiavelli` (target Month 12 state), `lot-systems.com/u/user` (personal OS reference)

---

## 0. What this document is

This is not a new system. LOT already has five independent, shipped progression
axes that a Usership account moves through as it accumulates signal. What is
missing is the **narrative packaging** that makes the operator feel the twelve
months as a designed story rather than five silent counters. This document:

1. Names the five axes that already exist and are already Usership-gated
   (§1), so no one re-derives what `interfaceEvolution.ts` already computes.
2. Specifies two new surfaces — `Months unlocked: N/12` and a monthly Memory
   Digest paragraph — that extend an existing widget rather than add a new one
   (§2).
3. Lays out Month 1 through Month 12 as a single table cross-referencing all
   five axes plus the two new surfaces (§3).
4. Maps the existing day-streak badge ladder onto the same twelve months, so
   badge unlocks and month beats reinforce each other instead of running on
   separate clocks (§4).
5. Specifies the "new month" celebration mechanic precisely enough to build,
   using the existing toast pattern rather than inventing a new interruption
   style (§5).
6. States the copy/tone rules this roadmap must obey, pulled verbatim from
   the standing style guide (§6).
7. Flags two real tensions already latent in the codebase that this roadmap
   inherits rather than creates (§7) — per the benchmark doctrine's honest-
   engineering rule, these are named, not papered over.
8. Maps the two demo accounts to concrete target states (§8).
9. Lists the minimal implementation surface — which files this actually
   touches when built (§9).

Everything marked **EXISTING** below is verified against the current
codebase. Everything marked **PROPOSED** is new design from this session and
has not been built.

---

## 1. The five progression axes (EXISTING, run in parallel — do not conflate)

A single Usership account can be at a different "stage" on each of these five
axes at the same time. They are computed independently. A roadmap that
implies "Month 6 = X" for all five would misrepresent the system; this
document instead states the *typical* correlation, not a guarantee.

| # | Axis | Mechanism | Cadence | Levels | Source |
|---|------|-----------|---------|--------|--------|
| 1 | **Density Tier** | `visualRefinement` = consistency×0.4 + depth×0.3 + (level/100)×0.3 | Cumulative signal | breathable → comfortable → compact → dense → instrument | `interfaceEvolution.ts:442-467` |
| 2 | **Story Chapter** | Level thresholds | Cumulative signal | 1 Awakening → 2 Exploration → 3 Integration → 4 Mastery (gated at level 10 / 30 / 60) | `interfaceEvolution.ts` (chapter calc) |
| 3 | **Badge / Streak Tier** | Consecutive-day streak + word/behavior badges | Daily | 7d → 30d → 100d → 365d milestone ladder (Water/Architecture theme), 812 badges total | `badges.ts`, `LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v32.md` |
| 4 | **Assembly Phase** | Module-signal density across 12 self-assembly modules | Cumulative signal | dormant → awakening → forming → assembled → integrated | `selfAssembly.ts` |
| 5 | **QOS Mode** | Real-time energy/pattern state — **not** a long-arc axis | Minute-to-minute | maintenance / recovery / growth / peak | `QuantumEngineWidgets.tsx: computeQOSMode()` |

Axis 5 (QOS Mode) is the moment-to-moment weather; axes 1-4 are the climate.
A Month 9 user in `peak` QOS mode on a good day is still a Month 9 user —
the roadmap below speaks to axes 1-4 and treats axis 5 as background texture
that should visually harmonize but never substitute for the long-arc state.

Density tier is **already Usership-exclusive** (`System.tsx:404-414`) — free
accounts get a hardcoded breathable-only layout and never enter this system.
This is the strongest existing anchor for "the interface visibly changes
because you pay and because you show up": it is real today, just not yet
narrated month-by-month.

---

## 2. Two new surfaces (PROPOSED — both extend `MonthlyPulseWidget.tsx`)

`MonthlyPulseWidget.tsx` already computes `monthNumber = now.diff(user.joinedAt,
'month')` (capped at 12) and already carries a hand-authored `MONTH_MESSAGES`
line per month (Month 3: "Active User status"; Month 6: "the journey is
half-declared"; Month 12: "the portrait is complete — and still evolving").
That is the narrative spine. This roadmap adds two cycling views to the same
widget rather than shipping a competing component.

### 2.1 `Unlocked:` view — "Months unlocked: N/12"

A single line, Usership-gated, using the widget's own already-computed
`monthNumber`:

```
Unlocked: 3/12
```

- Renders as a third click-cycle view alongside the widget's existing
  Pulse/Message views: `Pulse:` → `Digest:` → `Unlocked:` → back to `Pulse:`.
- At `monthNumber >= 12`, the copy changes state rather than freezing at
  "12/12" forever: `Unlocked: Year One complete.` — and hands off to the
  Year Two badge track (`saga_age`, `odyssey_log`, both already exist at the
  1,825-day / 900-day marks — see §4) so Month 13 does not feel like a
  dead end.
- No new gating logic needed: reuses the exact Usership check already in
  `System.tsx:404-414` and the exact `monthNumber` calculation already in
  the widget.

### 2.2 `Digest:` view — the monthly Memory compression paragraph

This is the direct answer to "Story/Memory compression" in the brief. It
does **not** invent a new compression engine — Memory Engine compression is
already continuous and answer-triggered (`MEMORY-ENGINE-COMPRESSION-
ARCHITECTURE.md`), and a Monthly Summary HTML email already exists and
already fires server-side (Job 15, 1st of month, 09:00 UTC, per
`LOT-FEATURE-INVENTORY-2026.md:377`). The gap is that this compressed
content dies in an email inbox and never surfaces in-app.

**Proposal:** when Job 15 composes the Monthly Summary email, cache its
opening paragraph to `user.metadata.lastMonthlyDigest` — the same pattern
already used for `user.metadata.lastMemoryStory`. Surface it as the
`Digest:` view:

```
Digest: Reading in the quiet mornings, mostly. Three weeks of low-energy
starts turned into steadier ones by the third week — you noticed it
yourself before the system did. The tea ritual held. Move toward what's
working.
```

- One paragraph. First-person-observational voice, matching the existing
  Memory Story register (README.md's "You love hot green loose leaf tea as
  a morning ritual" example) — not a stats recap.
- The paragraph's *register* should track the same depth ladder the Memory
  Engine already uses internally (Behavior → Motivation → Values → Soul,
  `MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md §5`): early months read as
  behavior-level observation, later months read as values/soul-level
  reflection. This is not a new ladder — it is the existing one, simply
  quoted back monthly instead of only feeding silently into question
  generation.
- Closes with one earned, non-superlative line — "Well done." register per
  the style guide, never "Amazing month!"

Both views are additive to one widget. No new nanostore, no new gate, no
new cooldown logic — the Usership check and the `monthNumber` derivation
already exist in the file being extended.

---

## 3. Month-by-month table

Density tier, Story Chapter, and Assembly Phase columns show the *typical*
band for an actively-engaging Usership account — real users will vary, since
all three are signal-driven, not calendar-driven. Where `MONTH_MESSAGES`
text is already verified against the codebase it is marked EXISTING; the
`Unlocked:` and `Digest:` columns are this roadmap's proposal (§2) and are
illustrative sample copy, not shipped strings.

| Mo | Density Tier (typical) | Story Chapter | Assembly Phase (typical) | Self-Care Voice | `Unlocked:` (PROPOSED) | `Digest:` theme (depth ladder) | Existing `MONTH_MESSAGES` beat |
|----|---|---|---|---|---|---|---|
| 1 | breathable | 1 Awakening | dormant → awakening | plain | Unlocked: 1/12 | Behavior — what you did | (verify at build time) |
| 2 | breathable → comfortable | 1 Awakening | awakening | plain | Unlocked: 2/12 | Behavior | (verify at build time) |
| 3 | comfortable | 1 Awakening → 2 Exploration | awakening → forming | plain/mixed | Unlocked: 3/12 | Behavior → Motivation | EXISTING: "Active User status" |
| 4 | comfortable | 2 Exploration | forming | mixed | Unlocked: 4/12 | Motivation | (verify at build time) |
| 5 | comfortable → compact | 2 Exploration | forming | mixed | Unlocked: 5/12 | Motivation | (verify at build time) |
| 6 | compact | 2 Exploration → 3 Integration | forming → assembled | mixed | Unlocked: 6/12 | Motivation → Values | EXISTING: "the journey is half-declared" |
| 7 | compact | 3 Integration | assembled | mixed → technical | Unlocked: 7/12 | Values | (verify at build time) |
| 8 | compact → dense | 3 Integration | assembled | technical | Unlocked: 8/12 | Values | (verify at build time) |
| 9 | dense | 3 Integration | assembled | technical | Unlocked: 9/12 | Values → Soul | (verify at build time) |
| 10 | dense | 3 Integration → 4 Mastery | assembled → integrated | technical | Unlocked: 10/12 | Soul | (verify at build time) |
| 11 | dense → instrument | 4 Mastery | integrated | technical | Unlocked: 11/12 | Soul | (verify at build time) |
| 12 | instrument | 4 Mastery | integrated | technical | Unlocked: Year One complete. | Soul | EXISTING: "the portrait is complete — and still evolving" |

"(verify at build time)" marks months where this session did not have
verbatim source access to the hardcoded `MONTH_MESSAGES` string and is
flagging it rather than inventing wording — see `MonthlyPulseWidget.tsx`
for the authored lines already in place for months 1, 2, 4, 5, 7, 8, 9, 10,
11. **This roadmap should not overwrite those — it should read them.**

---

## 4. Badge/streak ladder mapped to the same twelve months

The badge system's day-streak milestones (`badges.ts:30-40`, dual Water /
Architecture theme, EXISTING) already land at roughly these month marks for
a daily-active operator, which is why they are presented here as
reinforcing the month beats rather than competing with them:

| Streak (days) | Badge (Water / Architecture) | Rarity | Approx. month | Roadmap tie-in |
|---|---|---|---|---|
| 30 | ≈ Wave / ╞═╡ Structure | uncommon | Month 1 | First density-tier crossing typically lands near here |
| 60 | ≈≈ Dual Wave / ╞═══ Master Frame | — | Month 2 | |
| 90 | ≋∘ Deep Reach / ║═ Inner Wall | — | Month 3 | Coincides with EXISTING "Active User status" beat |
| 100 | ≋ Current / ║·║ Architecture | epic | Month 3-4 | Pattern Insights typically unlocks near consistency ≥0.66 around here |
| 180 | ≋≋ Voyager / ║╞║ Wing | — | Month 6 | Coincides with EXISTING "half-declared" beat |
| 365 | ≋≋≋ Long Count / ╔═╗ Citadel | LEGENDARY | Month 12 | Coincides with EXISTING "portrait is complete" beat |

Beyond Month 12, the ladder does not stop — `odyssey_log` (900+ check-in
days, EPIC) and `saga_age` (5-year account age, LEGENDARY) already exist in
v22 of the mastery tier system. Month 13 of the `Unlocked:` view should read
as the start of Year Two, not a plateau — the system already has the content
for this; it simply needs the same in-app surfacing this roadmap proposes
for Year One.

---

## 5. "New month" celebration — mechanic spec (PROPOSED)

Do not build a new interruption pattern. `EvolutionMilestoneToast` already
exists and already fires subtly (6-second auto-dismiss) on badge tier,
chapter, and density-tier crossings (`INTERFACE_EVOLUTION.md §Milestones`).
A calendar-month rollover for a Usership account is the same category of
event and should use the same component and the same restraint:

- **Trigger:** server-side calendar month rollover AND `Usership` tag AND
  the account has at least one log entry in the new month (do not celebrate
  an empty month — that reads as hollow, not encouraging).
- **Rendering:** one line, via the existing toast component, on next app
  open — not a push notification, not a modal. This matches the standing
  design principle "no unprompted notifications... the system waits" already
  stated in `LOT-AI-PRODUCT-BRIEF.md`.
- **Copy:** earned, not celebratory-loud. Per style guide: "Well done." /
  "Month 6 open." register — never "🎉 Congrats on month 6!!"
- **Action:** tapping the toast opens `MonthlyPulseWidget` directly to the
  new `Digest:` view (§2.2), so the celebration and the substance are the
  same tap.

---

## 6. Copy and tone guardrails (verbatim from `LOT-STYLE-GUIDE.md`)

Every string proposed in this document must obey the standing rules already
in force for every other widget:

- No superlatives ("amazing", "incredible") — ever.
- Periods, not checkmarks or emoji, for completion states: "Done." not
  "Done ✓".
- Questions in second person, careful grammar: "How is your month going?"
  not "How is your months?"
- Action labels: `[verb] [object] ([duration])` where relevant.
- Milestones are already described in the style guide as "subtle, every 20
  answers" — the twelve-month arc adds a second, slower-cadence milestone
  layer on top, not a louder one.

---

## 7. Two honest tensions this roadmap inherits (not introduces)

Per the benchmark doctrine's honest-engineering rule, these are flagged
plainly rather than smoothed over:

1. **Badges vs. "no gamification."** `LOT-STYLE-GUIDE.md` states explicitly:
   "No gamification: No points, badges, or leaderboards." The badge system
   already has 812 badges, 7 rarity tiers, and an RPG achievement layer. This
   contradiction predates this roadmap. Extending `MonthlyPulseWidget` does
   not add to it, but S-2 should resolve which doctrine wins before the
   Digest/Unlocked surfaces ship, since their tone should follow whichever
   side of that line the team lands on.
2. **"No unprompted notifications" vs. the existing milestone toast.**
   `LOT-AI-PRODUCT-BRIEF.md` states the system "does not push"; the shipped
   `EvolutionMilestoneToast` already interrupts (gently) on milestone
   crossings. §5 above deliberately reuses that existing pattern rather than
   inventing a third notification style — but the underlying tension in the
   doctrine is pre-existing and worth a single-line resolution from S-2:
   toast-on-open is the agreed exception, or it isn't.

---

## 8. Demo account target states

**`lot-systems.com/u/machiavelli` — Month 12 showcase target:**
instrument density, Chapter 4 Mastery, badge tier 3, assembled/integrated
assembly phase, full Board Profile block visible (Usership-gated), QR code
visible (requires assembly phase ≥ forming — already true at this stage),
Psychological Profile block visible (requires streak ≥ 7 — trivially true),
`Digest:` view showing Soul-level compressed narrative, `Unlocked: Year One
complete.`

**`lot-systems.com/u/user` — mid-arc reference (~Month 4-6):**
compact/dense density, Chapter 2-3, Pattern Insights just crossing its
consistency ≥ 0.66 unlock, `Digest:` view at Motivation/Values register,
`Unlocked: 5/12` or similar — deliberately mid-story, not finished, to show
the arc in motion rather than only its endpoint.

---

## 9. Minimal implementation surface

If built, this roadmap touches:

- `src/client/components/MonthlyPulseWidget.tsx` — add `digest` and
  `unlocked` to the view-cycle enum; render per §2.
- Server-side Job 15 (Monthly Email Sender) — cache the composed digest
  paragraph to `user.metadata.lastMonthlyDigest`, mirroring the existing
  `lastMemoryStory` caching pattern. No new AI call needed if the email body
  is already generated — reuse its opening paragraph.
- No new nanostore, no new API route, no new gating logic, no new badge
  IDs. Every mechanism this document depends on for gating (Usership tag
  check, `monthNumber` derivation, milestone toast component) already
  exists and is reused as-is.

---

*This document extends `docs/technical/INTERFACE_EVOLUTION.md` and
`docs/technical/WIDGETS.md`. It does not supersede either — read both before
implementing.*
