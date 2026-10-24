# LOT® LOG COMMAND SYSTEM — /system · /story · ARCADE

```
DOCUMENT:  LOT-TECH-LOG-COMMANDS
CLASS:     RESTRICTED // S-2 EYES
S-2:       VADIK MARMELADOV
STATUS:    ACTIVE (provisional: Arcade XP constants)
SOURCE:    src/shared/utils/logCommands.ts
TEST:      scripts/tests/test-log-commands.ts
```

## 1. PURPOSE

The Log is a passive journal: the user writes, with no prompts. Every entry is stored
with environment context (weather, time, location, sky). Slash commands are the only
"active" surface. This document specifies two of them and the Arcade layer.

```
LOT User data -> LOT Quantum Intelligence Engine -> AI vendor (Together AI) -> LOT personalized data stored
```

## 2. /system — COMMAND INDEX

Typing `/system` (alias `/commands`) in a Log renders the full command list, grouped:
CONTEXT, MIND, BODY, SYSTEM. The list is generated from `LOG_COMMANDS`
(`src/shared/utils/logCommands.ts`) — the single source of truth. Previously the list was a
hardcoded array inside `Logs.tsx`.

**Adding a command:** add the trigger in `src/client/utils/logTriggers.ts` (RULES + type),
add the handler in `Logs.tsx`, add one row to `LOG_COMMANDS`. The test fails if a registry
command has no trigger keyword, or if `/system` omits a registry command.

## 3. /story — COMPRESSED USER STORY

`/story` (or the 📖 emoji) compresses the user's recent record into a short second-person narrative.

| Input            | Window                | Notes                         |
|------------------|-----------------------|-------------------------------|
| `/story`         | rolling 24h (`day`)   | default                       |
| `/story week`    | 7 days                |                               |
| `/story month`   | 30 days               |                               |
| `/story year`    | 365 days              |                               |

Aliases: `today`, `weekly`, `monthly`, `yearly`.

**Timing:** the trigger fires the instant `/story` is typed. The client waits 1.5 s, then reads
the current text, so a period word typed immediately after is honored. A period typed later
does not re-fire (existing delta-trigger design); delete and retype `/story`.

**Flow**
1. Client `POST /api/story` `{ logText, period, badges, quantumState, userIndex }`.
2. Server (Usership only; rate limit 5/min) loads logs inside the window
   (cap 600; 3000 for `year`).
3. `summarizeEntries` computes entries, active days, current streak, mood counts.
4. `computeArcade` computes XP, level, rank.
5. Prompt (period + stats + arcade + recent entries/moods/self-care) -> Together AI.
6. Story saved as a `generated_story` log with `period`, `stats`, `arcade` in metadata.
7. Response `{ story, logId, period, arcade, arcadeLine }`. Client appends the story plus
   the ARCADE line to the entry.

**Failure mode:** if the AI vendor errors, the server returns `composeCompressedStory`,
a deterministic count-based summary (e.g. `4 entries across 3 days this week.`), not an
error string. `logId` is `null` in that case (nothing saved).

## 4. ARCADE — GAMIFIED SELF-CARE EVOLUTION

Gamification is a progress mirror for self-care, not a game that competes with it. It is
derived from behavior the user already performs.

```
XP = entries*10 + activeDays*25 + streakDays*15 + badges*50
```

| LV | RANK      | MIN XP |
|----|-----------|--------|
| 1  | SIGNAL    | 0      |
| 2  | OPERATOR  | 100    |
| 3  | NAVIGATOR | 400    |
| 4  | KEEPER    | 1000   |
| 5  | ARCHITECT | 2500   |
| 6  | ORACLE    | 6000   |

Output line: `ARCADE  LV2 OPERATOR  ███░░░░░░░  100 XP — 300 to NAVIGATOR`

**Limits (read before trusting):**
- XP is computed over the *story window*, so a `/story day` rank is lower than `/story year`.
  A persistent lifetime XP ledger is not built yet (see Roadmap).
- `badges` is client-reported and clamped to 0-2000 server-side; it is cosmetic, not authoritative.
- The constants are PROVISIONAL; tune in `ARCADE_XP` / `ARCADE_RANKS`.

## 5. DATA & PRIVACY

- No new tables or migrations. Story logs reuse the `Log` model (`event: generated_story`).
- Only the user's own logs are read (`userId = req.user.id`).
- Raw log text is sent to the AI vendor as in the pre-existing `/story`; stats are numeric.

## 6. VERIFICATION

```
npx tsx scripts/tests/test-log-commands.ts   # registry/trigger parity, periods, stats, arcade
npx tsc --noEmit -p tsconfig.server.json     # clean
npm run server:build && npm run client:build # green
```
Client `tsc -p tsconfig.json` has 104 pre-existing errors (badges.ts, intentionEngine.ts, ...);
this change adds none (diff of error set: identical).

## 7. ROADMAP (not built)

1. Persistent lifetime Arcade ledger (server-side XP, anti-cheat on badges).
2. Proactive follow-up: detect spikes/pattern change and ask in the morning (device or widget).
3. Scheduled day/week/month/year story compression pushed to the user without a command.
4. Optional `/rank` command and an Arcade section in `/system`.
