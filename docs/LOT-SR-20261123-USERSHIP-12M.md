# SESSION REPORT — USERSHIP 12-MONTH EVOLUTION
## Date: 2026-11-23 · Branch: claude/elegant-mendel-48e3h0
### Session Type: Product Design — Usership Chapters / Memory Story compression

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS CORPORATION — SESSION REPORT                       ║
║  USERSHIP · THE TWELVE CHAPTERS                                 ║
║  November 23, 2026 · Scheduled routine                          ║
║  Authorized: S-2 // VADIK MARMELADOV                            ║
╚══════════════════════════════════════════════════════════════════╝
```

## 1. TASK

Outline the month-to-month evolution of the Usership (paid tier) UI from
Day 1 barebone to LOT® AI at Month 12, using `/u/machiavelli` as the
evolved reference. Focus: tangible monthly delivery of the compressed
Memory story, driven by journal/Log entries, morning check-ins and
self-care clicks; monthly affirmations, badges, "Months unlocked: N/12".

## 2. FRAMEWORK COMPLIANCE

| Step | Status | Notes |
|---|---|---|
| 1 Scan repository | DONE | `src/client/components` (60+ widgets), `System.tsx` Usership gating, `MonthlyPulseWidget.tsx`, `interfaceEvolution.ts`, `public-api.ts` Machiavelli demo payload, `models/user.ts`, Log event types |
| 2 Read .MDs | PARTIAL | 381 .md files in repo. Read in full/at depth: README, docs/README, INTERFACE_EVOLUTION, MEMORY-ENGINE-COMPRESSION-ARCHITECTURE, WIDGETS (index), LOT-DOCTRINE, LOT-LEXICON, LOT-SR-20261117-CODEX-v33, QI46 12-month section. Versioned wiki/codex/assembly series scanned by index only (latest versions supersede earlier). |
| 3 Push session with detailed .MD | DONE | This report + design doc |
| 4 12-month Memory compression focus | DONE | Compression Ladder (§2 of design doc) |

`lot-systems.com/u/machiavelli` was unreachable from the sandbox network;
the reference state was taken from the canonical demo payload in
`src/server/routes/public-api.ts` (`/profile/machiavelli`).

## 3. DELIVERABLE

`docs/corporate/LOT-USERSHIP-12-MONTH-EVOLUTION.md`

- Four evolution signals with weights: LOG 40 · MORNING 25 · CARE 20 · ANSWERS 15
- Chapter grades QUIET / STEADY / RICH / LUMINOUS; elapsed vs unlocked counters
- Compression Ladder: Raw → Week Digest → Chapter → Season → Memory Story → Year Line → Word
- Twelve named chapters (THE BLANK PAGE → LOT® AI), each with UI state, unlock, AI behavior, compression, affirmation, badge
- Three widgets: MONTHS UNLOCKED rail, CHAPTER widget, NEW MONTH greeting
- Story Spine on `/u/{username}`
- Badge Codex v34 proposal · THE TWELVE CHAPTERS (+20)
- Machiavelli field → month mapping
- Engineering outline: data model, jobs, prompt rule, build order S1–S7

## 4. FINDINGS (code, not fixed this session)

1. `MonthlyPulseWidget` counts months from `joinedAt`, not paid start — no `usershipStartedAt` exists.
2. Self-care event name split: `self_care_completed` (energy, interventions, rpg-narrative) vs `self_care_complete` (goal-understanding, question-generator).
3. Pulse dismissal is localStorage-only; chapters need server-side state.
4. Usership Day 1 receives the full pro layout — no barebone start.

## 5. CHECKS

Docs-only change. No source modified; build not affected.

## 6. LEXICON CANDIDATES (need recurrence before adoption)

```
CHAPTER        One sealed Usership month: paragraph + affirmation + seal
SEASON         Three chapters compressed into one paragraph (M3/M6/M9/M12)
STORY SPINE    12-row chapter index on /u/ profile
MERIDIAN       Month 6 mirror: Chapter I vs Chapter VI
COMPRESSION LADDER  Raw → Digest → Chapter → Season → Story → Line → Word
```
