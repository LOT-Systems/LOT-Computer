# LOT® LOG — COMMAND REGISTRY & STORY COMPRESSION

```
DOCUMENT:  LOT-TECH-LOG-CMD-01
CLASS:     ENGINEERING // RESTRICTED
S-2:       VADIK MARMELADOV
DATE:      2026-10-11
STATUS:    IMPLEMENTED (client + server + tests)  |  ROADMAP items marked
```

## 1. PURPOSE

The Log is a passive journal: the user types, no prompts. Each entry is stored with
context metadata (weather, time, moon, zodiac, location). Two in-Log commands expose
the machine without leaving the page:

| Command | Result |
|---|---|
| `/system` | Lists every command, grouped. `/system <cmd>` shows detail for one. |
| `/story [day\|week\|month\|year]` | Compressed story of the window. Default `day`. |

Data flow (unchanged principle):

```
LOT User data (Log rows) -> compression (deterministic digest)
   -> Quantum Intent Engine / AI vendor (Together AI) -> story
   -> stored as Log row (event=generated_story) -> LOT personalized data
```

## 2. COMPONENTS

| File | Role |
|---|---|
| `src/client/utils/logCommands.ts` | Command registry (single source of truth for `/system`); `renderSystemHelp`, `parseSystemArg`, `findCommand`. Pure. |
| `src/client/utils/logTriggers.ts` | Trigger detection (unchanged). Registry names must match its keywords. |
| `src/shared/utils/story-compression.ts` | Pure digest: `parseStoryPeriod`, `compressLogs`, `renderDigestForPrompt`, `renderDigestStory`. |
| `src/client/components/Logs.tsx` | Executes triggers; sends `period` with `/story`. |
| `src/client/queries.ts` | `useStoryGeneration` accepts optional `period`. |
| `src/server/routes/api.ts` (`POST /api/story`) | Loads rows, builds digest, prompts model, falls back to offline story. |
| `scripts/tests/test-log-commands.ts` | 8 tests. `npm run test:log-commands`. |

## 3. /system

Groups: `AI`, `SYSTEM`, `RITUAL`, `AMBIENT`. Output lines beginning with `/` render as
command rows (command + description split on 2+ spaces); other lines render as headers.
A test asserts every registry entry fires its own trigger, so the help screen cannot
list a command that does not work. **To add a command:** add a rule in `logTriggers.ts`,
an entry in `LOG_COMMANDS`, a handler branch in `Logs.tsx`. Tests fail if the first two
disagree.

## 4. /story

### 4.1 Digest (deterministic, no AI)
For rows inside the window (day=1, week=7, month=30, year=365 days):

- counts text entries (`note`, `log_entry`, `journal`; empty text ignored), word total
- counts mood check-ins by label (`emotional_checkin`), self-care answers
  (`memory_answer`, `self_care_checkin`, `energy_checkin`)
- active days (UTC), longest consecutive-day streak, peak day
- activity trend (`rising` / `falling` / `steady` / `insufficient`, 1.5x half-window ratio, min 4 signals)
- up to 5 excerpts (160 chars)

### 4.2 Two consumers
1. **Prompt:** digest is injected as "COMPRESSED WINDOW (counted facts)" so the model is
   grounded in real counts.
2. **Offline fallback:** if the AI engine errors, the server returns `renderDigestStory`
   — sentences derived only from counted data. Previously a canned line was returned.

### 4.3 Persistence
The story is saved as a Log row (`event=generated_story`) with `period` and `digest` in
metadata, so later compressions can build on earlier ones (day -> week -> month -> year).

### 4.4 Limits & gating
Rate limit 5/min. Usership required for the AI voice (unchanged). Row fetch: 200 (day/week),
600 (month), 2000 (year).

## 5. PRIVACY
Only the digest and short excerpts of the user's own rows reach the vendor; the vendor
executes and does not store. Output is stored in the user's own database.

## 6. KNOWN LIMITS (honest)
- Digest days are UTC, not user-local; streak may differ by one at timezone edges.
- Year window is capped at 2000 most-recent rows.
- `generated_story` rows are not yet fed back into later digests (ROADMAP R1).
- The client typecheck has 135 pre-existing errors in the repository (baseline unchanged by this work).
- Not exercised against a live database or live Together AI in this session.

## 7. ROADMAP (not implemented)
- **R1 Recursive compression:** week story built from day stories, etc.
- **R2 Spike follow-up:** machine asks first when a digest shows a trend break
  (`falling` after `steady`), surfaced as morning question / widget.
- **R3 Arcade hooks (self-care, not gambling):** `/story` use and streaks feed existing
  badge/level system (`src/client/utils/badges.ts`). Proposed: `longestStreak` and
  period-story count as badge criteria; rank shown in `/system` footer. Design rule:
  reward consistency and reflection, never volume of text.
- **R4 Local-time digest** using `user.timeZone`.

## 8. VERIFY
```
npm run test:log-commands
npx tsc --noEmit -p tsconfig.server.json   # no errors in touched files
```
