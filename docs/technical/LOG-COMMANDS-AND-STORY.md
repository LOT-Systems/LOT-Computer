# LOG COMMANDS, /system, /story — TECHNICAL SPECIFICATION

CLASS: RESTRICTED // S-2 EYES
S-2: VADIK MARMELADOV
DOC: LOT-LOGCMD rev A · 2026-11-02 · session LOT-SR-20261102-01

## 1. PURPOSE

The Log is a passive AI UI: the operator writes, with no prompts or questions.
Every entry is stored with environment context (weather, time, location, sky,
astrology). Slash commands are optional, discoverable shortcuts layered on the
same text field. Doctrine: LOT User data -> LOT Quantum Intent Engine -> AI
vendor processor (Together AI) -> LOT personalized data stored.

## 2. STATUS BEFORE THIS SESSION

| Item | State |
|------|-------|
| /system | Existed; command list hard-coded inline in Logs.tsx (drift risk) |
| /story | Existed; single mode, last 10 entries, fixed 200-row window |
| Arcade | Badges/streak levels existed client-side; not reflected in the story |

## 3. CHANGES

### 3.1 Command registry — `src/shared/utils/logCommands.ts` (NEW)
Single source of truth. Pure (no stores/DOM/network); usable by client, server, tests.
- `LOG_COMMANDS`: 16 commands in 4 categories (NARRATIVE, CONTEXT, BODY, SYSTEM).
- `buildSystemHelp()`: renders /system. Format contract with the SYSTEM block
  renderer: category header = line without leading "/"; command row = starts
  with "/" and separates command from description with 2+ spaces.
- Adding a command: add one registry row AND one rule in
  `src/client/utils/logTriggers.ts` (the test enforces that every registry
  command is detected by a trigger).

### 3.2 /system
Typing `/system` (or `/commands`) shows all commands grouped by category,
generated from the registry. No manual list to keep in sync.

### 3.3 /story [day|week|month|year]
| Input | Window |
|-------|--------|
| `/story` or `/story day` | 1 day |
| `/story week` | 7 days |
| `/story month` | 30 days |
| `/story year` | 365 days |

Aliases: today, weekly, monthly, yearly, d, w, m, y. Only the word directly
after `/story` counts ("/story of my week" is read as `day`).

Client: the trigger fires when "/story" is complete, before an argument can be
typed, so the handler waits 1500 ms and reads the final text from `valueRef`.

Server (`POST /api/story`, Usership only, 5 req/min):
1. `period` validated against `STORY_PERIOD_DAYS` (default `day`).
2. Log rows restricted to the window (`createdAt >= now - N days`, limit 1000).
3. Entry sample cap scales with period (10 / 20 / 30).
4. Prompt asks for compression of the period and its most intimate high and low,
   forbids invented events/numbers, and tells the model to say so when data is thin.
5. Response adds `period` and `arcade`; both are persisted in the
   `generated_story` log metadata (with `recordsInWindow`).
6. On engine failure the existing quiet fallback text is returned.

### 3.4 Arcade evolution
`computeArcade({entries, checkIns, streakDays})` -> XP, level, rank.
XP = entries x 10 + check-ins x 5 + streak days x 20.

| Level | Rank | XP threshold |
|-------|------|--------------|
| 1 | RECRUIT | 0 |
| 2 | OPERATOR | 100 |
| 3 | FIELD AGENT | 300 |
| 4 | SPECIALIST | 700 |
| 5 | COMMANDER | 1500 |
| 6 | ARCHITECT | 3000 |

PROVISIONAL: weights and thresholds are tuning values, not measured. The rank
line (`LVL 2 OPERATOR · 130 XP · 170 XP TO FIELD AGENT`) is shown above the
story and passed to the model as context. Streak is computed over up to 365
days of record dates (UTC day buckets). Tone remains self-care: progress is
shown, nothing is penalised or lost.

## 4. FILES

| Path | Status |
|------|--------|
| src/shared/utils/logCommands.ts | ADDED |
| src/client/components/Logs.tsx | MODIFIED (/system, /story period, arcade header) |
| src/client/queries.ts | MODIFIED (types: period, arcade) |
| src/server/routes/api.ts | MODIFIED (story handler only) |
| scripts/tests/test-log-commands.mts | ADDED |

## 5. VERIFICATION

- `node --experimental-strip-types scripts/tests/test-log-commands.mts` -> OK
- `npx tsc --project tsconfig.server.json --noEmit` -> 0 errors
- `npm run build` -> OK
- `tsc --project tsconfig.json --noEmit` -> 104 errors both before and after
  (pre-existing, not part of the build gate; no new errors).
- NOT verified: live Together AI output and in-browser behaviour (no API key /
  database in this environment).

## 6. KNOWN LIMITS / NEXT

1. `/story` for long periods samples entries; a rolling stored daily digest
   (day -> week -> month -> year compression) would cut tokens and improve
   quality. Not built.
2. Proactive loop (morning question, spike/pattern follow-up on an entry) is
   not part of this change.
3. Arcade is server-derived for the story only; badge system integration is open.
4. Rank thresholds need tuning against real usage distribution.
