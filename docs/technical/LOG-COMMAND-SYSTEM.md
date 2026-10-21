# LOG COMMAND SYSTEM — `/system` and `/story`

```
DOCUMENT:  LOT-TECH-LOG-COMMANDS
CLASS:     RESTRICTED // S-2 EYES
S-2:       VADIK MARMELADOV
REVISION:  A  (2026-10-21)
STATUS:    SHIPPED ON BRANCH claude/youthful-ritchie-9orvua
```

## 1. PURPOSE

The Log is a passive journal. The user types; no prompts, no questions. Each entry is stored with its
context metadata (city, weather, time). Two slash commands let the user pull the system's view back out:

| COMMAND | EFFECT |
|---|---|
| `/system` | Prints every available Log command, grouped AI / SYSTEM / CARE / AMBIENT. |
| `/story [day\|week\|month\|year]` | Compressed story of the journal for that window. Default `week`. |

## 2. DATA FLOW

```
LOT User data (Log rows + context)
   -> compressLogs()            deterministic digest   [src/shared/utils/logStory.ts]
   -> LOT Quantum Intent Engine  quantumState + userIndex attached by client
   -> AI vendor (Together AI)    receives DIGEST only, never raw history
   -> generated_story Log row    LOT personalized data stored (metadata.range recorded)
   -> client Log                 story appended to entry + Arcade rank line
```

Fail-safe: if the vendor errors, `composeOfflineStory()` returns a data-only summary built from the same
digest. No canned text; the user always sees their own numbers.

## 3. FILES

| PATH | ROLE |
|---|---|
| `src/client/utils/logCommands.ts` | Command registry. Single source of truth for `/system` output. |
| `src/client/utils/logTriggers.ts` | Detection (unchanged). `/story` and `/system` were already registered. |
| `src/shared/utils/logStory.ts` | Pure: range parsing, digest, offline story, Arcade rank. |
| `src/client/components/Logs.tsx` | Renders `/system`, fires `/story` after a 1.5 s grace window. |
| `src/server/routes/api.ts` | `POST /api/story`: windowed query, digest prompt, rank. |
| `scripts/tests/test-log-story.ts` | Run: `npx tsx scripts/tests/test-log-story.ts`. |

## 4. DIGEST SPEC

Window = last N days (day 1, week 7, month 30, year 365). Fields: entry count, check-in count, active days,
top two cities, mean temperature (°C), up to 5 moods, up to 5 excerpts (160 chars), and pace versus the
previous window of equal length (`up` > 1.25x, `down` < 0.75x, else `flat`; `n/a` with no prior data).
Server query is bounded to 2x window, max 1000 rows.

## 5. ARCADE (PROVISIONAL)

XP = 10 per journal entry + 5 per check-in, all-time. Ranks: SIGNAL 0, OPERATOR 50, NAVIGATOR 200,
ARCHITECT 600, ORACLE 1500. This is a transparent activity count for gamified evolution. It is not a
wellness or psychological measure and must not be presented as one. Thresholds are tunable constants.

## 6. DESIGN NOTES

- `/story week` fires 1.5 s after `/story` is detected, so the range can be typed. Range is read from the
  latest text at fire time.
- A registry test asserts every `/system` entry maps to a working trigger, so help cannot drift from code.
- Access is unchanged: `/story` requires the Usership tag (server returns 403 text otherwise).

## 7. KNOWN LIMITS / NEXT

- Story is not yet pushed proactively (morning ask on device or widget). Next step: schedule digest per
  day/week and surface as a widget prompt.
- Spike/pattern-change follow-up on single entries is not implemented here.
- Pre-existing: 4 `tsc` type errors in `Logs.tsx` (lines ~101, 105, 3786, 3853) predate this change.

AUTHORIZED BY: S-2 // VADIK MARMELADOV
