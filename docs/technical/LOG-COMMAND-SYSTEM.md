================================================================================
LOT SYSTEMS / TECHNICAL DOCUMENT
DOCUMENT: LOG-COMMAND-SYSTEM
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-03
STATUS:   IMPLEMENTED (build gate pending — see 08 // VERIFICATION)
================================================================================

# LOG COMMAND SYSTEM — `/system`, `/story`, Compression Loop, Arcade Rank

## 00 // PURPOSE

The Log is a passive journal. The operator types; no prompts, no questions.
Every record is stored with its context (weather, time, place, sky). From
that stream the machine compresses the operator's day, week, month or year
into a short story and hands it back — closing the loop:

    LOG → OBSERVE → COMPRESS → ASK → COMPRESS AGAIN
    (see docs/corporate/LOT-AI-PRODUCT-BRIEF.md)

Two commands are the operator-facing surface of that loop:

| COMMAND   | EFFECT                                                         |
|-----------|----------------------------------------------------------------|
| `/system` | Lists every Log command, grouped, plus arcade/badge status.    |
| `/story`  | Compressed story of the operator's week (default scope).       |
| `/day` `/week` `/month` `/year` | Same story, explicit scope.              |

## 01 // DATA FLOW

    LOT User data (logs + context metadata)
        │  Sequelize Log rows, last 400d, user's own rows only
        ▼
    OBSERVE   computeStreakDays()  · getArcadeStatus()        [arcade.ts]
        ▼
    COMPRESS  buildStoryDigest()   deterministic, no network  [story-compression.ts]
        │      → volume, mood arc, environment, rhythm, peak/low, spike, silence
        ▼
    LOT Quantum Intent Engine  (client quantumState + userIndex attached)
        ▼
    AI vendor (Together AI)   receives ONLY renderDigestBlock() + arcade line
        ▼
    LOT personalized data stored   Log row event='generated_story'
                                   metadata: story, scope, digest, arcade

Privacy rules enforced in code:
- The vendor never receives raw history — only the digest (≤ ~1.5 KB; 5 capped
  samples of 160 chars each).
- Slash-command echoes, prior `generated_story`, `generated_prayer` rows and
  📖/🕯 blocks are excluded from "operator voice" (no self-feedback loop).
- Usership gate unchanged: non-Usership gets 403.
- Rate limit unchanged: 5 requests / minute.

## 02 // FAILURE MODE

If the vendor errors or returns empty, the server returns
`composeDigestStory()` — a plain, true story built from the digest alone —
instead of the former canned apology. Nothing is persisted for fallback
stories (`logId: null`).

## 03 // FILES

| FILE | ROLE |
|------|------|
| `src/shared/utils/log-commands.ts`     | Command registry (single source of truth) + `/system` builder |
| `src/shared/utils/story-compression.ts`| Scope parsing, digest, prompt block, offline story |
| `src/shared/utils/arcade.ts`           | Rank ladder, streak, arcade line |
| `src/client/utils/logTriggers.ts`      | Detector table (+ `/day /week /month /year`) |
| `src/client/components/Logs.tsx`       | Handlers: `/system` render, `/story` + scope submit |
| `src/client/queries.ts`                | `useStoryGeneration` (adds `scope`, `arcadeLine`) |
| `src/server/routes/api.ts`             | `POST /api/story` — scope, digest, vendor call, store |
| `scripts/tests/test-log-commands.ts`   | 13 contract tests (`yarn test:log`) |

Shared modules are imported by deep path (`#shared/utils/arcade`), not via
`#shared/utils`, because a stale tracked `src/shared/utils/index.js` shadows
`index.ts` for some resolvers.

## 04 // ADDING A COMMAND

1. Add the detector rule in `logTriggers.ts` (`LogTrigger` type + `RULES`).
2. Add the row to `LOG_COMMANDS` in `log-commands.ts`.
3. Handle the trigger in the `NoteEditor` effect in `Logs.tsx`.
4. `yarn test:log` — the suite fails if a registry command does not fire its
   own trigger, or if `/system` omits or duplicates a command.

## 05 // STORY SCOPES

| SCOPE | WINDOW | WORD CAP |
|-------|--------|----------|
| day   | 1d     | 120 |
| week  | 7d     | 160 (default) |
| month | 30d    | 200 |
| year  | 365d   | 240 |

Digest fields: total records, journal entries, active days, streak, top-5
moods + first→last arc, avg °C / humidity, weather, cities, moon phase,
morning/afternoon/evening/night rhythm (UTC), peak day, low day, SPIKE flag
(peak ≥ 4 records and ≥ 2× the other days' mean), longest silent gap.
The SPIKE and silence fields are the seed signals for follow-up (see 07).

## 06 // ARCADE (GAMIFIED EVOLUTION)

The operator evolves by consistency, not by volume. Rank = consecutive-day
streak (a streak stays alive until the day ends). The ladder mirrors the
milestone badges (architecture theme names):

    0 Recruit · 7 Foundation · 14 Load-Bearing · 21 Deep Foundation ·
    30 Structure · 50 Mid-Structure · 60 Master Frame · 90 Inner Wall ·
    100 Architecture · 180 Wing · 365 Citadel

`/story` returns `RANK … · STREAK nD · kD TO NEXT` and the model is told to
mention rank once, lightly, as progress. This stays a self-care product:
no leaderboards, no loss language, no penalties for a broken streak.
`/system` shows `BADGES n/total UNLOCKED` (client badge state); server-side
rank is surfaced through `/story`.

## 07 // NOT IN THIS CHANGE (ROADMAP)

- Spike/pattern-triggered follow-up on a specific entry (digest already
  computes SPIKE and silence; needs a scheduled job + ask surface).
- Morning question on LOT® device / widget (the "machine asks first" half).
- Server-side rank in `/system` (needs a small `GET /api/arcade`).
- Story export targets (`/api/story/:week_id/export`) from the product brief.
- Per-user timezone bucketing for rhythm (currently UTC).

## 08 // VERIFICATION

| CHECK | RESULT |
|-------|--------|
| Contract tests (13), compiled with tsc `--strict` + run on Node 22 | PASS |
| Full `yarn build` (client esbuild + server tsc) | NOT RUN — `yarn install` failed (network ECONNRESET), no node_modules in this environment |
| `Logs.tsx` / `api.ts` type-check | NOT RUN (same reason) — run `yarn build` before merge |

Per LOT-BENCHMARK doctrine, run the benchmark (green gate) before shipping
to master.

--------------------------------------------------------------------------------
S-2: VADIK MARMELADOV
--------------------------------------------------------------------------------
