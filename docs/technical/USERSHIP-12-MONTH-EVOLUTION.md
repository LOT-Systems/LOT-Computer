<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Usership — The Twelve-Month Arc

**Author:** LOT Systems Corporation (design pass, Claude session)
**S-2:** Vadik Marmeladov
**Status:** DESIGN / BRAINSTORM — not yet implemented
**Reference end-state:** `lot-systems.com/u/machiavelli` (see §7 — fetch blocked
in this sandbox, description below is reconstructed from live repo docs)

---

## 0. What already exists (read before building anything)

This is not a greenfield proposal. LOT already runs three progression systems
that a 12-month Usership arc must sit on top of, not duplicate:

| System | Axis | Granularity | Source |
|---|---|---|---|
| **Interface Evolution** | 7-dimensional behavioral maturity (Exploration, Consistency, Depth, Connection, Intimacy, Care, Courage) | Continuous 0–1, recalculated live | `src/client/utils/interfaceEvolution.ts`, `docs/technical/INTERFACE_EVOLUTION.md` |
| **Badge System** | Day-streak / pattern milestones, Water (∘ ≈ ≋) vs Architecture (├─ ╞═╡ ║·║) themes | Day thresholds: 7/14/21/30/50/60/90/100/180/365 | `src/client/utils/badges.ts` (424+ badges) |
| **Self-Assembly Engine** | 18 QOS modules (Biofield Engine, Memory Architecture, Routine Compiler, Intention Core, Cleanness Protocol, Reflection Layer, Community Mesh, Ecosystem Bridge, Quantum Substrate, Nutrition Protocol, Goal Architecture, Archetype Classifier, OS Vitals Monitor, Temporal Planner, Quantum OS, Signal Archive, Resilience Protocol) | 7-day signal density → dormant/awakening/forming/assembled/integrated | `src/client/stores/selfAssembly.ts` |

And a **fourth, already-started** piece that is the direct ancestor of this
brief: `src/client/components/MonthlyPulseWidget.tsx`. It exists today,
ships with 12 canned messages (Month 1 → Month 12), reads `user.joinedAt`,
gates on `UserTag.Usership`, and renders `N / 12 months`. It is a one-shot
toast, dismissed and silenced for the rest of that calendar month
(`lot_pulse_{userId}` in `localStorage`). It has no badge, no AI-generated
content, no persistent status indicator, and its 12 messages are static
strings unrelated to what the user actually did that month.

**This document's job is not to invent a fifth system. It is to give the
existing MonthlyPulseWidget a spine (a genuine calendar-tenure track,
parallel to but distinct from day-streak badges), a brain (the Memory
Engine's existing Together AI compression pipeline, monthly cadence), and
a body (a persistent "Months unlocked" indicator + a richer celebration
surface) — and to lay all 12 months out end to end so the arc reads as one
story, not twelve unrelated toasts.**

---

## 1. Two axes, reconciled

The brief asks for evolution "tied to the amount of journal entries and
thoughts put into Log... regular morning check-ins and self-care button
clicks" — i.e. activity-gated. LOT's existing Interface Evolution and Badge
systems already do exactly that, continuously, for every user regardless of
tier. A second, tenure-gated axis for Usership specifically must not
re-litigate that system. The two axes are kept orthogonal and multiplicative:

- **Tenure axis (new, this doc):** guarantees the paid-tier story ships on
  schedule. Month N unlocks on the calendar, `joinedAt`-based, independent
  of how active the user was. A quiet month still gets its chapter — the
  user paid for 12 months of becoming, not 12 months of grading.
- **Density axis (existing):** determines how *rich* that month's unlock
  feels. A month with heavy Log/check-in/self-care volume gets the full
  Memory Digest, an early unlock animation, and denser badge language
  (reusing the existing `overallMaturity`/`visualEffects` CSS variables). A
  quiet month still gets the milestone and the affirmation, just plainer —
  same mechanism `INTERFACE_EVOLUTION.md` already documents as "Subtlety
  First... start minimal, earn complexity."

Concretely: **Month unlock is time-gated. Month richness is signal-gated.**
This is the same pattern already used by Self-Assembly (`phaseFromDensity`)
applied to a 30-day window instead of a 7-day one.

---

## 2. The Four Chapters

`WIDGETS.md` already documents story chapters for the Narrative Widget:
**Awakening → Exploration → Integration → Mastery**. Reuse them verbatim —
minting a second chapter vocabulary for the same concept is exactly the
kind of unearned new token `LOT-LEXICON.md` exists to prevent. Map the
twelve months to these four chapters, three months each:

```
Q1  Months 1–3    AWAKENING     barebone → first shape
Q2  Months 4–6    EXPLORATION   widgets multiply, theme picks a side
Q3  Months 7–9    INTEGRATION   cross-module signals, Architect comes online
Q4  Months 10–12  MASTERY       full LOT® AI, Tun completes
```

---

## 3. The month-by-month table

`UI STACK` references the exact stack names in `WIDGETS.md` §Architecture
Overview (Header, Community Pulse, Tags & Team, Time & Environment, Context
Stack, Bioethics Stack, Settings, Lifestyle Stack, Intentions & Planning,
Subscriber Stack, Quantum Engine Connect, QIE Stack, Dashboard Stack, Stats
Stack). `TENURE GLYPH` is defined in §4.

| Mo | Chapter | UI stack unlocked this month | Tenure glyph | Digest theme |
|----|---------|-------------------------------|:---:|---|
| 1 | Awakening | Header, Time & Environment, Lifestyle (Recipe only) — deliberately barebone, per `INTERFACE_EVOLUTION.md` "start minimal" | ∘ | "The system is beginning to know you." *(existing copy — kept)* |
| 2 | Awakening | Lifestyle (Emotional Check-In added), Intentions & Planning (Planner) | ∘∘ | First pattern named — one recurring word/time-of-day from Log |
| 3 | Awakening | Context Stack (Contextual Prompts), Bioethics (Energy Capacitor) | ∘∘∘ | "Active User" status line kept from existing copy; first Water/Architecture theme prompt offered |
| 4 | Exploration | Bioethics (Evolution Widget / Citizen Index), Settings (Mirror, breathe mode) | ∘∘∘∘ | Named archetype first appears in digest, if profile density allows |
| 5 | Exploration | Community Stack (Contextual Prompts → Interventions, Chat Catalyst) | — | Consistency streak called out by name |
| 6 | Exploration | Bioethics (Interface Evolution Widget, Milestone Toasts), custom theme unlock reachable | —∘ | Halfway digest — deliberately longer paragraph, explicit "half-declared" framing (existing Month 6 copy kept) |
| 7 | Integration | QIE Stack (Quantum State, Pattern Recognition, Signal Stream) | —∘∘ | Cross-module pattern named (reuses QIE pattern labels, e.g. FSCOHERE if earned) |
| 8 | Integration | Dashboard Stack (User Metrics / CQGS), System Progress (Deployment view) | —∘∘∘ | "Rare air" — existing copy; digest cites a specific rare pattern if unlocked |
| 9 | Integration | **Architect Widget** (Usership-only, Self-Assembly module map) fully surfaced | —∘∘∘∘ | Self-care practice named as habitual, ties to Cleanness Protocol module state |
| 10 | Mastery | Subscriber Stack (Quantum Sign, Cosmic Update) | ⩵ | Board-style richness begins — Public Profile gains fuller trait density |
| 11 | Mastery | Stats Stack (Growth Milestones, Badge Unlock Feed, Pattern Insights) | ⩵∘ | "One more." — existing copy kept, digest previews the Year One report |
| 12 | Mastery | Full stack; QR Code + custom board-profile treatment; **Tun ceremony** (§5) | ⩵∘∘ | Full-year Story compression — the annual Memory Digest, not just 30 days |

Unlock order above is a *default* sequence for a median-density account. A
high-density account (heavy Log/check-in/self-care volume) may cross the
existing Interface Evolution feature-unlock thresholds (Level 5/10/15/20/25/30
in `INTERFACE_EVOLUTION.md` §Feature Unlocks) faster than the calendar —
when that happens, the widget simply appears early via the *existing*
`isFeatureUnlocked()` gate, and the tenure track's job on that month is only
to supply the glyph, the affirmation, and the digest, not to gate the
widget a second time. Tenure never blocks something density already earned.

---

## 4. Tenure badges: authentic Mayan numerals, deliberately distinct from day-streak glyphs

`BADGE_MAYAN_EVOLUTION.md` already establishes the vocabulary: `∘` =
individual moment/dot, `—` = bar = 5 (Mayan vigesimal), `○` = shell/zero/
completion. The existing day-streak badges (`milestone_7`, `milestone_30`,
`milestone_100`...) already spend `∘ ≈ ≋` and `├─ ╞═╡ ║·║` on *activity*
milestones. Reusing those exact glyphs for *calendar* tenure would make two
unrelated numbers look identical in the UI — a user would not be able to
tell "you've used LOT for 7 days" from "you've been a Usership member for 7
[somethings]" at a glance.

So: tenure badges use **authentic Mayan bar-and-dot numerals**, rendered
with the same `∘`/`—` primitives already in the doctrine, but never
combined with `○`, `≈`, or `≋` — those stay exclusively day-streak symbols.
One inline-legibility substitution: two stacked bars (Mayan "10") don't
render on one text line, so month 10 uses `⩵` (U+2A75, double horizontal
line) as a single-glyph stand-in, noted here so no future session mistakes
it for a new mint:

```
Month  1   ∘
Month  2   ∘∘
Month  3   ∘∘∘
Month  4   ∘∘∘∘
Month  5   —          (bar = 5)
Month  6   —∘
Month  7   —∘∘
Month  8   —∘∘∘
Month  9   —∘∘∘∘
Month 10   ⩵          (two bars, single glyph — inline substitution)
Month 11   ⩵∘
Month 12   ⩵∘∘         + Tun ceremony, see §5
```

This is the "Level:" field pattern from `BADGE_LEVEL_DESIGN.md`, duplicated
as a second field: Public Profile gains a `Tenure:` row directly under
`Level:`, e.g.:

```
Archetype:              The Explorer
Awareness Level:        Deepening (8.4/10)
Level:                  ≋           (day-streak: 100+ days)
Tenure:                 —∘∘ (7 mo.) (Usership calendar tenure)
```

---

## 5. Month 12 — the Tun ceremony

`BADGE_MAYAN_EVOLUTION.md`'s own cosmology hands this month its ending for
free: the Mayan **Tun** is 360 days — near enough to 12 months that the
doctrine already treats it as "the long cycle." The existing day-streak
track's highest tier, `milestone_365` (Water: `≋≋≋` "Long Count" / Architecture:
`╔═╗` "Citadel", flagged LEGENDARY in `badges.ts`), sits at almost exactly
the same point on the *other* axis.

Proposal: when a user crosses **both** — 12 months of Usership tenure *and*
`milestone_365` on the day-streak track — fire a single rare composite
unlock, in the same easter-egg register as existing entries like
`meta_signal` (MYTHIC) or `cosmic_twin` (ULTRA-RARE): call it
`full_circle`. It is the one moment the two independent progression systems
this document was careful to keep separate are allowed to touch. Users who
hit Month 12 without the day-streak badge still get the full Month 12
chapter (§3) — `full_circle` is a bonus, never a gate.

Month 12's Memory Digest (§6) is not a 30-day compression like months 1–11.
It is the annual Story-Report already named as a Usership benefit in
`LOT-AI-PRODUCT-BRIEF.md` ("Story-Report · API") — same Together AI
pipeline, 365-day window instead of 30.

---

## 6. The Memory Digest — making the celebration true, not generic

Current `MONTH_MESSAGES` in `MonthlyPulseWidget.tsx` are fixed strings.
The brief specifically asks for "a paragraph-long insight from last month" —
that requires closing the loop into the Memory Engine's existing compression
pipeline (`MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md`), not writing more
canned copy.

**Job:** extend the existing **Monthly Email Sender** background job
(`WIDGETS.md` — "09:00 UTC, 1st" — already runs monthly, already Usership-
aware) to also compute and cache, per Usership user, on the 1st:

1. One affirmation sentence — short, present-tense, drawn from the
   dominant trait/archetype signal of the prior 30 days (same trait
   extraction already feeding `psychologicalProfile.coreValues`).
2. One paragraph — the actual "Memory" insight. Same `buildPrompt()` /
   Together AI Llama 3.3 70B call the Memory Engine already makes for
   questions, but pointed at the last 30 days of Log/journal/check-in/
   self-care signals with a *summarize, don't ask* instruction, following
   the doctrine's existing prompt-order rule (`LOT-DOCTRINE.md`:
   plannerContext before formattedLogs — declared intent first, inferred
   pattern second).
3. Cache result server-side (mirrors the existing `qos_report_generated` /
   `os_vitals_snapshot` synthetic-log pattern) and render it through a new
   Log renderer label, `DIGEST:`, alongside the existing block set
   (`QOS: / ASM: / COMM: / CARE: / PLAN: / INTENT:` etc. — `WIDGETS.md`
   §Signal Archive).

**Surface:** the digest paragraph and affirmation become the expanded state
of `MonthlyPulseWidget` (replacing the static `MONTH_MESSAGES[n]` lookup
with `digest.affirmation` when present, falling back to the existing static
line if generation failed or the user has under ~5 signals that month —
never show an empty or hallucinated-feeling digest for a quiet month).

Cost note: this reuses infrastructure already running monthly for the email
job — no new cron cadence, no new AI provider integration, one additional
Together AI call per Usership user per month.

---

## 7. Persistent widget: "Months unlocked: N/12"

Distinct from `MonthlyPulseWidget` (a one-shot toast, dismissed and gone
for the month). This is the **Tenure Ring** — a small, always-visible,
Usership-gated status element, same visibility tier as the existing
`Architect Widget` and `Cosmic Update` (Usership-only per `WIDGETS.md`
§Conditional & Subscriber Widgets). Lives in the Header stack per
`WIDGETS.md`'s "User identity, week number, date, location" — Tenure Ring
sits next to week-number, since both are calendar-derived identity facts.

```
┌──────────────────────────┐
│  Months unlocked          │
│  ●●●●●●●○○○○○  7 / 12     │
│  —∘∘  Integration          │
└──────────────────────────┘
```

Filled/empty dot ring for the coarse read, tenure glyph (§4) and current
chapter name (§2) underneath for the precise one. Clicking opens the same
expanded surface as `MonthlyPulseWidget`'s dismissed-state history — a
scrollable log of past affirmations, matching the "Recent Activity" pattern
already used in `BADGE_LEVEL_DESIGN.md` profile mockups.

---

## 8. Data model additions

Minimal — reuse `user.joinedAt` and `UserTag.Usership`
(`MonthlyPulseWidget.tsx` already computes `monthNumber` from exactly these
two fields; no new column needed for the tenure number itself). New surface:

- `monthly_digest` cache, keyed `(userId, yearMonth)`: `{ affirmation:
  string, insight: string, generatedAt, signalCount }`. `signalCount` is
  the gate for "quiet month" fallback in §6.
- `tenureBadge` derivation is pure function of `monthNumber` (§4 table) —
  no persistence needed, same pattern as day-streak badge derivation in
  `badges.ts`.
- One new Log event/renderer type: `story_digest_generated` → `DIGEST:`
  block, following the exact pattern of `qos_report_generated` → `QOS:`.

No changes required to `selfAssembly.ts`'s `MODULE_DEFINITIONS` or to the
Interface Evolution 7-dimension calculator — this arc is additive, not a
fork of either.

---

## 9. Demo account note (honesty per doctrine)

`lot-systems.com/u/machiavelli` was named as the reference 12-month-evolved
account. A live fetch was attempted and **blocked by this sandbox's network
egress policy** (`lot-systems.com` is not on the allowed egress list) — so
nothing above is based on a live screenshot. It is reconstructed from what
`LOT-FEATURE-INVENTORY-2026.md` already documents about that account
(Niccolo Machiavelli, simulated Florence weather, used repeatedly as the
canonical Usership/board-tier demo across `PublicProfile.tsx`-adjacent
docs) and from every Usership-gated feature enumerated in `WIDGETS.md` §
Conditional & Subscriber Widgets. Anyone continuing this design should pull
the live page from an environment with `lot-systems.com` egress allowed and
diff it against §3's Month 12 row before implementing — this document
should not be taken as a verified visual spec of that page, only a
doctrine-consistent reconstruction of what it *should* contain if the
Usership feature set is fully unlocked.

---

## 10. Open questions for S-2

1. **Pause vs. reset on lapse.** If a Usership subscription lapses and
   resumes, does `monthNumber` (computed live from `joinedAt`) keep
   counting through the gap, or should tenure freeze at the last unlocked
   month until resumed? Current `MonthlyPulseWidget` logic would silently
   keep counting (calendar-based, not subscription-active-based) — worth
   an explicit decision before this ships, since it changes what "Month 12"
   means for a lapsed-and-returned user.
2. **Month 12 and beyond.** Existing widget already caps display at
   `Math.min(monthNumber, 12)`. Does Year 2 restart the Tun cycle
   (Month 13 → glyph resets to `∘` with a "Second Tun" framing) or does
   the UI settle into a permanent Mastery steady-state? Doctrine favors
   the former — cyclical, not linear, per `BADGE_MAYAN_EVOLUTION.md`'s own
   "growth through cycles, not grinding" — but this is S-2's call.
3. **Digest failure UX.** §6 already specifies a fallback to static copy
   on a quiet month — confirm that's acceptable rather than skipping the
   toast entirely on a quiet month (skipping breaks the "guaranteed
   monthly ceremony" premise of §1).

---

*This document is a design/brainstorm artifact per S-2's request. No source
files were modified in this session — `MonthlyPulseWidget.tsx`, `badges.ts`,
`selfAssembly.ts`, and the Memory Engine pipeline are all read-only
references above. Implementation is a separate, future benchmark session.*
