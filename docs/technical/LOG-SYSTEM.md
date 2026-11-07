# LOT® LOG SYSTEM — Passive Journal, Commands, Story Compression, Arcade

```
DOCUMENT:  LOT-TECH-LOG-SYSTEM
CLASS:     ENGINEERING // S-2 EYES
S-2:       VADIK MARMELADOV
DATE:      2026-11-07
STATUS:    IMPLEMENTED (commands, story, arcade) / PLANNED (proactive follow-up, see §9)
```

## 1. Purpose

The Log is a **passive AI UI**. The operator writes; there are no prompts, forms
or questions. Every entry is stored with ambient context meta-data (weather,
humidity, city, time zone, moon phase, zodiac). The machine later compresses
those entries into a story and, in a later phase, asks first.

```
LOT User data ──▶ LOT Quantum Intent Engine ──▶ AI vendor (Together AI) ──▶ LOT personalized data stored
 (Log + context)     (signals, patterns)          (executes, never remembers)   (Log table, event=generated_story)
```

The AI vendor only executes a prompt. All memory lives in the LOT database
(README §"Your Story, Your Data").

## 2. Command reference

Typed anywhere inside a Log entry as a whole token (`/scandalous` does not fire
`/scan`). Detection is delta-based: editing around an existing command does not
re-fire it. Source of truth: `src/shared/utils/log-commands.ts`.

| Command | Group | Behaviour |
|---|---|---|
| `/system` | SYSTEM | Prints every command, grouped. Generated from the registry. |
| `/story [day\|week\|month\|year]` | NARRATIVE | Compressed story of the period. Default `week`. Aliases: `today`, `daily`, `weekly`, `monthly`, `yearly`. 📖 also triggers. Usership only (server-enforced). |
| `/arcade` | NARRATIVE | Rank, level, XP, streak read-out (§5). Aliases: `/level`, `/xp`, 🕹️. |
| `/qi [query]` | NARRATIVE | Quantum Intelligence RFI. |
| `/prayer` | NARRATIVE | Contextual scripture. |
| `/scan` `/qos` `/phys` `/assembly` `/silent` | CONTEXT | State read-outs. |
| `/how` `/breathe` `/freeze` `/fast` | SELF-CARE | Check-in, breathing, pause, fasting calendar. |
| `/synth` `/radio` `/night` | MODES | Keyboard sound, radio, dark mode. |

Adding a command: (1) add a `RULES` row in `src/client/utils/logTriggers.ts`,
(2) add a `LOG_COMMANDS` row, (3) add the handler in `Logs.tsx`,
(4) run `npx tsx scripts/tests/test-log-commands.ts` — it fails if a registry
command is not detectable or missing from `/system`.

## 3. `/story` — compression pipeline

```
POST /api/story { logText, period, quantumState, userIndex }
  1. Load logs for 2 × window (current + preceding), newest first, ≤ 2000 rows
  2. compressLogs()  → StoryDigest (deterministic, no AI)
  3. digestToPrompt() → compact text block
  4. Together AI completion (≤ 512 tokens, ≤ 200-word story, 2nd person)
  5. Persist Log{event:'generated_story', metadata:{period,digest,…}}
  6. On vendor failure / empty output → composeLocalStory(digest) (offline)
```

`StoryDigest` contains only counts and ratios: journal entries, words, active
days, mood frequency, self-care records, busiest part of day, top cities /
weather / moon phase, newest excerpts (≤ 200 chars), and a **spike** flag.

**Spike / pattern change:** journal-entry count in the window vs. the preceding
window of equal length. `up` if ≥ 1.5× and ≥ 2 more; `down` if ≤ 0.5× and ≥ 2
fewer; `insufficient-data` if fewer than 3 entries across both windows. This is
the hook the follow-up engine (§9) will use.

Windows are rolling: day = 1, week = 7, month = 30, year = 365 days.

## 4. Context meta-data

`getLogContext()` (server) stamps each log with temperature, humidity, weather
description, city, country, time zone, ambient astrology. The digest reads
`city`, `weatherDescription`, `astroMoonPhase`, `timeZone` (for part-of-day).
No photo or audio is ever recorded.

## 5. Arcade (gamified evolution)

Source: `src/shared/utils/log-arcade.ts`. Pure and deterministic.

| Rule | Value |
|---|---|
| XP per event | note 10 · emotional_checkin 8 · self_care_complete 12 · memory_answer 6 · generated_story 5 · badge_unlock 25 · goal_set 10 · goal_complete 30 |
| Reflection bonus | +5 for a note of ≥ 40 words |
| Daily cap | 120 XP/day — rewards showing up, not volume |
| Level | `floor(sqrt(xp/50)) + 1` (level n needs `50·(n−1)²`) |
| Rank | INITIATE → OPERATOR → NAVIGATOR → PILOT → COMMANDER → ARCHITECT, one step per 5 levels |
| Streak | consecutive days with XP; stays alive until end of the next day |

**Self-care guardrails (non-negotiable):** nothing is ever subtracted; a broken
streak resets the streak counter only; empty notes earn nothing; the cap blocks
grinding. The Arcade sits beside the existing badge codex (`docs/badges/`), it
does not replace it.

## 6. Files

| Path | Role |
|---|---|
| `src/shared/utils/log-commands.ts` | Command registry, `/system` formatter, `/story` argument parser |
| `src/shared/utils/log-story.ts` | `compressLogs`, `digestToPrompt`, `composeLocalStory` |
| `src/shared/utils/log-arcade.ts` | `computeArcade`, `formatArcade` |
| `src/client/utils/logTriggers.ts` | Trigger detectors (+ `arcade-report`) |
| `src/client/components/Logs.tsx` | Handlers and result blocks (`SYSTEM:`, `ARCADE:`, 📖) |
| `src/server/routes/api.ts` | `POST /api/story` |
| `scripts/tests/test-log-commands.ts` | Self-test, 45+ assertions |

## 7. Defects fixed in this cycle

1. `/story` filtered on events `log_entry` / `journal`, which the system never
   writes (journal entries are `note`). The story never saw the operator's
   journal. Now reads `note`.
2. `/story` AI failure returned a fixed apology. It now returns an offline story
   composed from the digest.
3. `/system` text was hard-coded in the component and had already drifted from
   the trigger list. It is now generated from the registry and test-guarded.

## 8. Known limits (honest)

- `/arcade` runs client-side on what `GET /api/logs` returns (newest 500
  displayable events), so XP is a **rolling window**, not an all-time ledger.
  A server-side ledger endpoint is the planned fix.
- `/story year` is bounded by the server query cap (2000 rows per call); heavy
  users will see a truncated year.
- Spike detection uses entry counts only; it does not yet read mood valence.
- `/story` remains Usership-gated. `/system` and `/arcade` are open to all.
- Pre-existing: `Logs.tsx` has 4 TypeScript strictness errors unrelated to this
  change (unchanged by it); the esbuild client build passes.

## 9. Roadmap — "the machine asks first"

1. **Spike → follow-up:** when `spike.direction` is `up`/`down`, or a mood flips,
   queue one gentle question for the morning slot (widget or LOT computer).
2. **Scheduled stories:** nightly (day), Sunday (week), 1st of month, 1 Jan —
   stored as `generated_story`, surfaced as the next day's prompt, closing the
   compression loop.
3. **Server arcade ledger** so XP is all-time and shared across devices.
4. **Arcade surfaces:** level-up toast, rank on public profile (opt-in).

## 10. Verification

```
npx tsx scripts/tests/test-log-commands.ts   # ALL PASS
npx tsc --noEmit -p tsconfig.server.json     # clean
yarn server:build && yarn client:js:build    # OK
```

AUTHORIZED BY: S-2 // VADIK MARMELADOV
