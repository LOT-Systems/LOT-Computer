<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

```
DOCUMENT:  LOT-LOG-COMMAND-SYSTEM
CLASS:     RESTRICTED // S-2 EYES
S-2:       VADIK MARMELADOV
DATE:      2026-10-17
STATUS:    IMPLEMENTED — GREEN (build + 12/12 self-tests)
```

# LOT® AI — Log Command System & Story Compression

## 1. PURPOSE

The Log is the **passive AI surface** of LOT® AI. The operator writes entries with no prompts and no questions. Every entry is stored with its context snapshot (weather, humidity, city, time zone, moon phase, hourly zodiac). Commands are *optional* accelerators. Nothing in this system requires the operator to type a command.

This document covers two operator-facing commands and the machinery behind them:

| Command | Result |
|---|---|
| `/system [filter]` | Lists every Log command, grouped by category. An optional filter narrows the list. |
| `/story [day\|week\|month\|year]` | A compressed story of the chosen window. Default window: `week`. |

## 2. DATA FLOW

```
LOT User data (Log entries + context metadata, check-ins, self-care answers)
        │
        ▼
 compressLogs()            src/server/utils/story-compression.ts   (deterministic, pure)
        │   fact sheet only — counts, moods, ambient, pattern shift, ≤5 excerpts
        ▼
 LOT Quantum Intent Engine  (client QuantumState + UserIndex + Arcade rank, sent with request)
        │
        ▼
 AI vendor processor        Together AI via aiEngineManager.getEngine('together')
        │
        ▼
 LOT personalized data      Log row, event = 'generated_story'
                            metadata: { scope, entryCount, shift, story, … }
```

**Privacy boundary.** The vendor receives the compressed fact sheet and at most five 160-character excerpts of `log_entry`/`journal` events. It never receives the raw history. Other event types (settings changes, chat, etc.) are excluded by construction — the compressor only reads `log_entry`, `journal`, `emotional_checkin`, `memory_answer`, `self_care_checkin`, `energy_checkin`. This is covered by a test.

**Failure mode.** If the vendor errors, the server returns `buildLocalStory()` — a grounded story assembled from the same fact sheet. The operator never sees a generic error. If the vendor returns an empty body, the same fallback applies.

## 3. FILES

| Path | Role |
|---|---|
| `src/shared/utils/logCommands.ts` | Command registry (single source of truth), `/system` builder, scope parsing, did-you-mean, Arcade rank. Pure. Shared by client and server. |
| `src/client/utils/logTriggers.ts` | Trigger *detection* (unchanged). Parity with the registry is enforced by test. |
| `src/client/components/Logs.tsx` | Trigger wiring in `NoteEditor`; deferred argument commands; unknown-command hint. |
| `src/client/queries.ts` | `useStoryGeneration` — request now carries `scope` and `arcade`. |
| `src/server/utils/story-compression.ts` | `compressLogs`, `formatCompression`, `buildLocalStory`, window math. Pure. |
| `src/server/routes/api.ts` | `POST /api/story` — scoped query, compression, vendor call, persistence. |
| `scripts/tests/test-log-commands.ts` | 12 self-tests. `npm run test:log-commands`. |

> **GITIGNORE NOTE.** `.gitignore` line 50 (`server/`) matches `src/server/`. New files under it must be added with `git add -f`. Existing files are tracked and unaffected.

## 4. COMMAND REGISTRY

Registry fields: `name`, `aliases`, `args`, `description`, `category`. Categories: `MEMORY`, `INTEL`, `BODY`, `ENV`, `SYSTEM`.

| Category | Commands |
|---|---|
| MEMORY | `/story [scope]` · `/prayer` (`/candle`) · `/how` |
| INTEL | `/qi [query]` · `/scan` (`/ai`) · `/assembly` · `/qos` |
| BODY | `/phys` · `/fast` · `/breathe` · `/freeze` (`/pause`) · `/silent` (`/quiet`) · `/sil` |
| ENV | `/synth` (`/keyboard`) · `/radio` · `/night` |
| SYSTEM | `/system [filter]` (`/commands`) |

**Adding a command.** (1) add a rule to `RULES` in `logTriggers.ts`; (2) add an entry to `LOG_COMMANDS`; (3) add the handler branch in `Logs.tsx`; (4) run `npm run test:log-commands`. Step 4 fails if (1) and (2) disagree.

### 4.1 `/system`

* `/system` — full list, then `SHORTCUTS`.
* `/system radio` — only commands whose name, alias, category, or description contain `radio`.
* No match → `NO MATCH. TYPE /system FOR THE FULL LIST.`

Rendering reuses the existing `SYSTEM:` block. Rows start with `/` and split command from description on two or more spaces; the builder guarantees that split.

### 4.2 Unknown-command hint

After 1.8 s of idle typing, any `/token` of three or more characters that is not a command but is within edit distance 2 of one produces `UNKNOWN COMMAND /stroy` and `/story Did you mean this?`. Tokens are matched only at the start of text or after whitespace, so URLs and paths never match. Ordinary slashes in prose (`and/or`) are ignored.

### 4.3 Deferred argument commands

Triggers fire on the *first appearance* of a command (delta detection). That would fire `/story` before the operator can type `month`. `/system` and `/story` therefore wait **1.2 s**, then re-read the current text (`valueRef`) and re-confirm the trigger is still present. If the operator deletes the command in that window, nothing runs.

> **KNOWN ISSUE (pre-existing, not changed).** `/qi [query]` still reads its argument at the instant the trigger fires, so it only works when the whole line is pasted or completed before the command is recognized. Recommended follow-up: route `/qi` through `deferArgCommand`.

## 5. `/story`

### 5.1 Scope

| Input | Scope | Window |
|---|---|---|
| `/story`, `/story banana` | `week` (default) | 7 days |
| `/story day` · `today` · `daily` | `day` | 1 day |
| `/story week` · `weekly` | `week` | 7 days |
| `/story month` · `monthly` | `month` | 30 days |
| `/story year` · `yearly` · `annual` | `year` | 365 days |

The window is rolling and its start is inclusive. The 📖 emoji alone also triggers `/story` (default scope). Text typed alongside the command, minus the command and scope word, is passed as `OPERATOR NOTE` (≤300 chars).

### 5.2 Fact sheet (`StoryCompression`)

| Field | Meaning |
|---|---|
| `entryCount`, `activeDays`, `windowDays` | Volume and consistency |
| `moods` | Top 5 `emotional_checkin` states with counts |
| `selfCareTouches` | Count of memory/self-care/energy check-ins |
| `ambient` | Mean temperature (°C, from Kelvin), top weather, top cities, top moon phases, entries by daypart |
| `shift` | `surge` / `drop` / `steady` / `insufficient` — entries in recent half vs earlier half of the window; needs ≥4 entries; surge/drop need ≥2× and a gap of ≥2 |
| `excerpts` | ≤5 newest entries, whitespace-collapsed, ≤160 chars |

`shift` is the first implementation of the "spike or pattern change" signal from the product brief. It is the hook for the future follow-up engine (§8).

### 5.3 API

```
POST /api/story            (Usership only · 5 req/min)
Body: { logText, scope?, quantumState?, userIndex?, arcade? }
200 : { story, logId | null, scope }
403 : { story: "Story generation is available for Usership members.", logId: null }
```

An invalid or missing `scope` falls back to `week`. Query: `userId` + `createdAt >= windowStart`, newest first, limit 2000. (Previously: newest 200 rows regardless of age.)

## 6. ARCADE EVOLUTION

The operator's self-care progress is a game. `arcadeRank(badgeCount)` maps earned badges to a rank and is sent with `/story` so the narrative can acknowledge progress without becoming a pep talk.

| Rank | Level | Badges ≥ |
|---|---|---|
| RECRUIT | 1 | 0 |
| OPERATOR | 2 | 5 |
| SPECIALIST | 3 | 20 |
| VETERAN | 4 | 50 |
| ARCHITECT | 5 | 120 |
| MASTER | 6 | 300 |

Thresholds are a first calibration against the 812-badge codex (v32) and are expected to be tuned. Rank is advisory context for the prompt; it gates nothing.

## 7. VERIFICATION

| Check | Command | Result |
|---|---|---|
| Self-tests | `npm run test:log-commands` | 12/12 PASS |
| Server typecheck | `tsc --project tsconfig.server.json` | PASS |
| Full build | `npm run build` | PASS |
| Client typecheck | `tsc --noEmit -p tsconfig.json` | 4 errors in `Logs.tsx`, identical before and after this change (pre-existing; lines 107, 111, 3792, 3859) |

**Not verified.** Live vendor call (needs `TOGETHER_API_KEY`) and in-browser behavior of the deferred commands. Both need a manual pass: type `/system radio`, `/story month`, and `/stroy` in a Usership account.

## 8. ROADMAP (NOT IMPLEMENTED)

1. **Morning ask.** The machine asks first: a daily question on any device, seeded by the latest story and `shift`.
2. **Follow-up on spike.** When `shift` is `surge` or `drop` on a new entry, queue one follow-up question attached to that entry.
3. **Story as input.** Feed the stored `generated_story` rows back into the next compression to close the loop (day → week → month → year).
4. **Story export.** The product brief names `GET /api/story/latest`, `GET /api/story/:week_id`, and `POST /api/story/:week_id/export`. None exist yet.
5. **`/qi` argument fix** (§4.3).
6. **Quantum Intent Engine server-side.** Today QIE state is computed on the client and sent in the request body, so the server trusts it. It is prompt context only and gates nothing.
