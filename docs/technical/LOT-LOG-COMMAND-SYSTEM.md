================================================================================
LOT SYSTEMS / TECHNICAL SPECIFICATION
DOCUMENT: LOT-TS-LOG-COMMANDS
TITLE:    LOG COMMAND SYSTEM · COMPRESSED STORY · ARCADE RANK
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-22
STATUS:   IMPLEMENTED (v1) — roadmap items marked PLANNED
================================================================================

## 00 // PURPOSE

The Log is a passive journal. The user writes; the machine records the
entry together with its context (weather, place, moon, time) and later
compresses what it has seen back into a story. Slash commands are the
only *active* surface of the Log, and they exist so the user never has
to learn a menu:

    /system   → every command, grouped, with the user's Arcade rank
    /story    → the compressed story (day · week · month · year)
    /rank     → Arcade rank, XP, streak, next unlock

Design rules (inherited from LOT-AI-PRODUCT-BRIEF.md):
  1. No prompts, no questions in the Log. The user just writes.
  2. The machine asks first — through widgets / morning question, never
     by interrupting the editor. (PLANNED — see 08.)
  3. Context is private by default. Only a compressed digest leaves the
     server, and only to the vendor below.

## 01 // DATA FLOW

    LOT USER DATA                Log entry + context snapshot
         │                       (weather, city, moon, daypart, mood)
         ▼
    LOT QUANTUM INTENT ENGINE    deterministic compression: buildStoryDigest()
         │                       counts · streak · spikes · context averages
         ▼
    AI VENDOR (Together AI)      receives the DIGEST + ≤8 short excerpts,
         │                       never the full history
         ▼
    LOT PERSONALIZED DATA        stored as Log event `generated_story`
                                 (text + range + digest metadata)

The compression step is code, not a model: it is deterministic, unit
tested, and bounds what the vendor can see.

## 02 // COMMAND REGISTRY

Single source of truth: `src/shared/utils/logCommands.ts` → `LOG_COMMANDS`.
One row = one command (name, aliases, argument hint, group, description).
`/system` is generated from this table, so help can never drift from
reality. Trigger detection (`src/client/utils/logTriggers.ts`) is kept
separate because it also owns emoji triggers; a unit test asserts that
EVERY registry command resolves to a trigger.

GROUPS
  INTELLIGENCE  story · qi · scan · qos · phys · assembly · rank · how
  SELF-CARE     prayer · breathe · freeze · silent · sil · fast
  ENVIRONMENT   synth · radio · night
  SYSTEM        system

To add a command:
  1. Add a row to LOG_COMMANDS.
  2. Add/extend a rule in logTriggers.ts (keywords must include the name + aliases).
  3. Handle the trigger in Logs.tsx (NoteEditor effect).
  4. `npx tsx --test scripts/tests/log-commands.test.ts` must stay green.

## 03 // /system

Typing `/system` anywhere in a Log entry renders the command directory
in a SYSTEM block under the editor. Arcade rank (see 06) is fetched
on demand from `GET /api/arcade` and patched into the top of the block
when it arrives; the directory itself renders instantly and offline.

## 04 // /story [range]

    /story            legacy behaviour: last ~200 rows, 8 newest excerpts
    /story day        last 1 day
    /story week       last 7 days
    /story month      last 30 days
    /story year       last 365 days
    (aliases: today, daily, weekly, monthly, yearly; unknown words → recent)

Access: Usership tag required (unchanged). Rate limit: 5/min (unchanged).
Endpoint: `POST /api/story  { logText, range?, quantumState?, userIndex? }`
Response: `{ story, logId, range, arcade }`.

The story is appended to the entry prefixed with 📖 (persistence pattern
shared with /prayer — see LOT-SR-20260622-01) and stored as a
`generated_story` log row carrying `range` and the digest (without excerpts).

### 04.1 Digest contents (`StoryDigest`)

| Field            | Meaning                                                        |
|------------------|----------------------------------------------------------------|
| entryCount       | non-empty Log entries in window                                |
| activeDays       | distinct days with an entry                                    |
| streakDays       | consecutive active days ending today/yesterday                 |
| dayparts         | night/morning/afternoon/evening counts (entry's own timezone)  |
| avgTempC / avgHumidity | mean of per-entry context snapshots                      |
| topCities / topWeather / topMoonPhases | most frequent context values            |
| moods            | emotional check-ins, newest first                              |
| spikes           | VOLUME SPIKE · SILENCE (≥3 days) · MOOD SHIFT                  |
| excerpts         | ≤8 newest entries, ≤200 chars each                             |

### 04.2 Spike rules (v1, intentionally simple)

  VOLUME SPIKE  a day with ≥ max(3, 2× window mean) entries (needs ≥3 active days)
  SILENCE       ≥3 days since the last entry (windows > 1 day)
  MOOD SHIFT    dominant mood of the newer half ≠ older half (needs ≥4 check-ins)

Spikes are *noticings*, passed to the model with the instruction to
surface them gently. Acting on them proactively is PLANNED (08).

### 04.3 Defect fixed in this revision

The previous /story read events `log_entry` / `journal`. The Log editor
persists entries as event `note`, so the story never saw the user's
actual journal. The digest now reads `note` (plus the two legacy names).

## 05 // CONTEXT METADATA PER ENTRY

Every Log row already carries `context` (LogContext in shared/types):
temperature (K), humidity, weatherDescription, city, country, timeZone,
date, astroMoonPhase, astroMoonIllumination, astroRokuyo,
astroHourlyZodiac, astroWesternZodiac. The digest is the first consumer
that aggregates it across a window. No schema change was required.

## 06 // ARCADE — GAMIFIED EVOLUTION

Self-care first; the arcade layer only rewards *showing up*, never
volume of misery or length of text.

    XP = entries×10 + check-ins×5 + stories×15 + streakDays×20

    LV1 RECRUIT 0 · LV2 OPERATOR 100 · LV3 SPECIALIST 500
    LV4 VANGUARD 1500 · LV5 COMMANDER 4000 · LV6 ARCHITECT 10000

(Thresholds PROVISIONAL — tune from real distributions. Titles are the
contract.) XP is derived on demand from the Log (`GET /api/arcade`,
last 5000 rows); there is no new table and nothing to migrate. The
existing Badge Codex (docs/badges/) is the *collectible* layer; the rank
ladder is the *progress* layer. They are independent by design.

Known limit: streak uses UTC day keys; a user near a day boundary may see
the streak roll a few hours off their local midnight. PLANNED: use
LogContext.timeZone.

## 07 // SECURITY & PRIVACY

  - Vendor payload = digest + ≤8×200-char excerpts + the operator's current
    entry text. No email, no user id, no full history.
  - Range input is allow-listed server-side (`hasOwnProperty` against
    STORY_RANGE_DAYS); anything else falls back to `recent`.
  - Window queries are bounded: 2000 rows (ranged) / 200 (recent) / 5000 (arcade).
  - `/api/arcade` is scoped to `req.user.id`; no cross-user path.

## 08 // ROADMAP (PLANNED — NOT IMPLEMENTED)

  R1  MORNING ASK       A single question on any device/widget, chosen from
                        the digest's spikes (e.g. SILENCE → "How was the quiet?").
  R2  SPIKE FOLLOW-UP   Follow-up on an entry when the digest flags a pattern change.
  R3  STORY LOOP        Feed the last story back into the next digest
                        ("compress the compression") for week/month/year.
  R4  SCHEDULED STORIES Weekly/monthly/yearly stories generated by job,
                        cached in user metadata; /story returns the cache.
  R5  STORY EXPORT      /api/story/:week_id/export per PRODUCT-BRIEF.
  R6  ARCADE UI         Rank chip in nav; rank-up toast; local-timezone streaks.

## 09 // TEST & VERIFICATION

    npx tsx --test scripts/tests/log-commands.test.ts     10/10 PASS
    npm run client:js:build                                PASS
    npm run server:build                                   PASS
    npx tsc --noEmit                                       104 errors = baseline (0 new)

Covered: registry uniqueness, registry→trigger reachability, alias
resolution, /system completeness, range parsing, rank boundaries, XP
formula, streak logic, digest aggregation, spike detection, empty input.
NOT covered: live Together AI call, HTTP routes, React rendering —
verify manually in a Usership session (type /system, /story week, /rank).

## 10 // FILE MAP

  NEW   src/shared/utils/logCommands.ts          registry · range parser · arcade
  NEW   src/shared/utils/storyCompression.ts     digest builder + prompt formatter
  NEW   scripts/tests/log-commands.test.ts       10 tests
  MOD   src/server/routes/api.ts                 /story range+digest · GET /arcade
  MOD   src/client/components/Logs.tsx           /system from registry · /story range · /rank
  MOD   src/client/queries.ts                    range, ArcadeStatusDTO, useArcade
  MOD   src/client/utils/logTriggers.ts          arcade-rank trigger

AUTHORIZED BY: S-2 // VADIK MARMELADOV
