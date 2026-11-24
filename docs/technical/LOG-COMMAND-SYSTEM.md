<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

```
================================================================================
LOT SYSTEMS / TECHNICAL ORDER
DOCUMENT: LOT-TO-LOG-01 — LOG COMMAND SYSTEM & STORY COMPRESSION
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-24
STATUS:   OPERATIONAL (branch claude/youthful-ritchie-zhasfr)
================================================================================
```

## 00 // BLUF (Bottom Line Up Front)

The Log (Journal) is LOT's **passive AI surface**: the operator writes, the
machine records the moment with its context metadata (weather, humidity, city,
time, sky, astrology) and asks nothing back. Slash commands are the only way the
operator explicitly calls the machine from inside the Log.

This order defines:

1. **`/system`**: the command map, generated from one registry so the list
   can't drift from what the code actually handles.
2. **`/system <command>`**: a single-command dossier (usage, aliases, XP,
   use count).
3. **`/story [day|week|month|year]`**: the **compressed story**. The operator's
   logs for that horizon are compressed into a packet without calling a model,
   and only that packet goes to the AI vendor.
4. **Arcade ledger**: per-command XP and a 6-step rank ladder.

---

## 01 // DATA FLOW

```
 OPERATOR TYPES IN LOG
        │
        ▼
 logTriggers.detectNewTriggers()      ← delta-only, so editing around a command never re-fires it
        │
        ├─ /system ───────────► logCommands.renderSystemHelp()   (client only, no network)
        │                       logCommands.renderCommandDossier()
        │
        ├─ /qi …   ─┐
        └─ /story … ┴─► ARMED ──(1.2 s typing pause)──► FIRE
                                                       │
                                                       ▼
                         POST /api/story { logText, horizon, quantumState, userIndex }
                                                       │
  ┌────────────────────────── SERVER ─────────────────┴─────────────────────────┐
  │ 1. Usership gate (403 otherwise)                                              │
  │ 2. Log.findAll(userId, createdAt ≥ now − window)   LOT USER DATA              │
  │ 3. compressLogs(logs, horizon)                      QUANTUM INTENT COMPRESSION│
  │ 4. Empty horizon? → return without vendor call                                │
  │ 5. compressionToPrompt() → Together AI              AI VENDOR PROCESSOR       │
  │ 6. Log.create(event='generated_story', metadata{horizon, compression, xp})    │
  │                                                     LOT PERSONALIZED STORE    │
  └───────────────────────────────────────────────────────────────────────────────┘
                                                       │
                                                       ▼
          Client renders compression header + story, appends "📖 <story>" to the log,
          records XP in the Arcade ledger.
```

This is the proposed pipeline, *LOT User data → LOT Quantum Intent Engine →
AI vendor processor (Together AI) → LOT personalized data stored*, applied to the
Log. **The vendor never sees the raw log table.** It receives counts, a mood
histogram, two peaks and at most 6–12 trimmed excerpts.

---

## 02 // FILE MANIFEST

| File | Role |
|------|------|
| `src/shared/utils/story-compression.ts` | **NEW.** Pure module: horizon parsing, `compressLogs()`, peak detection, XP, header + prompt formatting. Shared by client and server. |
| `src/client/utils/logCommands.ts` | **NEW.** Command registry (`LOG_COMMANDS`), `/system` renderer, dossier, Arcade rank ladder + ledger. |
| `src/client/utils/logTriggers.ts` | Unchanged. Still the detector. The registry is checked against it by tests. |
| `src/client/components/Logs.tsx` | Wires `/system` to the registry, defers `/story` and `/qi` until typing pauses, renders the compression header, records XP. |
| `src/client/queries.ts` | `useStoryGeneration` gains `horizon` (request) and `horizon`, `compression`, `xp` (response). |
| `src/server/routes/api.ts` | `POST /api/story` rebuilt on the compression layer. |
| `scripts/tests/test-log-commands.ts` | **NEW.** 19 assertions. `yarn test:log-commands`. |

---

## 03 // COMMAND MAP (`/system`)

Rendered output, grouped by category:

```
NARRATIVE
/story [day|week|month|year]    Compressed story of your day, week, month or year
/prayer                         Contextual scripture for this entry
/how                            Open LOT AI check-in (System tab)

INTELLIGENCE
/qi [query]                     Ask the Quantum Intelligence engine
/qos                            Quantum OS state analysis
/assembly                       Self-assembly module status
/phys                           Physiological cohort report
/scan                           System status overview

SELF-CARE
/breathe                        4-2-6 breathing exercise
/freeze                         Pause and reflect protocol
/silent                         Signal silence check
/sil                            Silence-pattern check
/fast                           Orthodox fasting calendar

ENVIRONMENT
/radio                          Toggle radio
/synth                          Toggle keyboard sound
/night                          Dark mode

SYSTEM
/system [command]               This command map (or one command dossier)

SHORTCUTS
Ctrl+Enter    Save log immediately

ARCADE · RANK NAVIGATOR · XP 160 · NEXT ARCHIVIST @ 400
```

### 03.1 Registry contract

Each entry in `LOG_COMMANDS`:

| Field | Type | Rule |
|-------|------|------|
| `cmd` | `string` | Primary slash command. Must fire `trigger` through `detectTriggers()`. |
| `usage` | `string` | Shown in `/system`; args go in `[brackets]`. |
| `trigger` | `LogTrigger` | One command per trigger (checked by a test). |
| `category` | `CommandCategory` | `NARRATIVE · INTELLIGENCE · SELF-CARE · ENVIRONMENT · SYSTEM` |
| `aliases` | `string[]` | Alternative keywords or emojis. Each must fire the same trigger (checked by a test). |
| `xp` | `number` | Arcade XP per use. `/system` = 0, so XP can't be farmed by opening the help screen. |

**To add a command:** (1) add the rule to `logTriggers.ts`, (2) add the entry to
`LOG_COMMANDS`, (3) handle the trigger in `Logs.tsx`, (4) run
`yarn test:log-commands`. Step 4 fails if steps 1 and 2 disagree.

### 03.2 Dossier (`/system story`)

```
COMMAND DOSSIER — /STORY
/story [day|week|month|year]    Compressed story of your day, week, month or year

CATEGORY        NARRATIVE
ALIASES         📖
XP / USE        +10
USES            3
```

The dossier updates as the argument is typed. An unknown argument falls back to
the full map.

### 03.3 Render rules (SYSTEM block in `Logs.tsx`)

| Line shape | Rendered as |
|-----------|-------------|
| empty | spacer |
| starts with `/` **or** contains a 2+ space gap | two-column row (key / description); wraps on phone width |
| anything else | section header (11 px, tracked, 40 % opacity) |

---

## 04 // `/story` — COMPRESSED STORY

### 04.1 Horizons

| Command | Horizon | Window | Story length | Max excerpts | Base XP |
|---------|---------|--------|--------------|--------------|---------|
| `/story` | `recent` | last 10 journal entries | 100–200 w | 6 | 5 |
| `/story day` · `today` · `d` · `24h` | `day` | 24 h | 60–120 w | 6 | 5 |
| `/story week` · `w` · `7d` | `week` | 7 d | 120–200 w | 6 | 15 |
| `/story month` · `m` · `30d` | `month` | 30 d | 150–250 w | 10 | 40 |
| `/story year` · `y` · `365d` | `year` | 365 d | 200–320 w | 12 | 120 |

An unrecognised argument (for example `/story banana bread`) maps to `recent`,
and the argument stays in the operator's log text. `/storyline` does not fire.

### 04.2 Fire discipline

`detectTriggers()` matches `/story` as soon as it is typed, before the
horizon exists. So the trigger only **arms** the command. A debounce effect
fires it **1.2 s after typing stops**, reading the latest value. `/qi [query]`
uses the same mechanism (see §07 F-1).

### 04.3 Compression algorithm (`compressLogs`)

Deterministic and pure. `now` can be injected for tests.

1. **Window.** Keep logs with `now − window ≤ createdAt ≤ now`. Future-dated rows are dropped.
2. **Classify.** `log_entry | journal | note` → journal. `emotional_checkin` → mood.
   `memory_answer | self_care_checkin | energy_checkin` → self-care.
3. **Sanitize.** Remove lines beginning with `📖` / `🕯️` (earlier machine output)
   and slash commands, so a story never compresses an earlier story.
4. **Mood valence.** Positive set → +1, negative set → −1, unknown → 0. The sets
   align with `server/utils/energy.ts` `ENERGY_COSTS`.
5. **Peaks.** Valence is summed per UTC day. **HIGH PEAK** is the day with the
   highest positive sum and **LOW PEAK** the day with the lowest negative sum.
   Each carries its moods and the first journal excerpt from that day.
6. **Rhythm.** The modal journal hour (UTC), active-day count, and up to 5 distinct cities.
7. **Sample.** `sampleEvenly()` picks N excerpts across the window, keeping
   both endpoints, each trimmed to 200 characters.
8. **Ratio.** `compressionRatio = totalWords / excerptWords`.

### 04.4 Compression header (shown above the story)

```
HORIZON         WEEK
SIGNALS         12 LOG · 9 MOOD · 4 CARE · 6 DAYS
DOMINANT        CALM · VALENCE +0.33
HIGH PEAK       2026-11-22 · GRATEFUL/CALM
LOW PEAK        2026-11-20 · OVERWHELMED/ANXIOUS
COMPRESSION     1840W → 4.2:1
XP              +55
```

### 04.5 API

`POST /api/story`, rate limited to 5 per minute, Usership members only.

Request:
```json
{ "logText": "long day", "horizon": "week",
  "quantumState": { "energy": "low", "clarity": "mid", "alignment": "high" },
  "userIndex": { "overall": 62, "trend": "rising" } }
```

Response:
```json
{ "story": "You…", "logId": "uuid|null", "horizon": "week",
  "compression": { "entries": 12, "checkins": 9, "highPeak": { "date": "…" }, "…": "…" },
  "xp": 55 }
```

| Condition | Behaviour |
|-----------|-----------|
| No Usership tag | `403`, explanatory `story`, `logId: null` |
| `horizon` missing or invalid | coerced to `recent` |
| Horizon has zero signals | **No vendor call.** Returns a quiet "no signals" line with `xp: 0`. |
| Vendor failure | Fallback line, `logId: null`, `xp: 0`. Compression is still returned. |
| Success | `generated_story` log persisted with `metadata.horizon`, `metadata.compression`, `metadata.xp` |

Fetch caps: `recent`/`day`/`week` 500 rows · `month` 1 500 · `year` 3 000. Only the
`event, text, createdAt, metadata, context` columns are selected.

### 04.6 Privacy deltas

- The server log line now records `user <id>` instead of the operator's email address.
- The vendor gets compressed data only. Excerpts are capped at 200 characters and 6–12 items.
- The operator's own log text sent to the vendor is capped at 500 characters.

---

## 05 // ARCADE LEDGER

The arcade layer sits under self-care: it rewards coming back and reflecting,
not volume or streak pressure.

| Rank | XP |
|------|----|
| CADET | 0 |
| OPERATOR | 50 |
| NAVIGATOR | 150 |
| ARCHIVIST | 400 |
| CHRONICLER | 1 000 |
| ORACLE | 2 500 |

- Every fired command adds its registry `xp`. `/story` adds its registry XP
  **plus** `storyXp(compression)` only when a story was actually persisted.
- `storyXp = base(horizon) + 2 × activeDays + min(checkins, 30) + min(selfCare, 30)`.
  The caps stop one heavy day from outweighing a consistent month.
- Storage: `localStorage['lot:log-command-xp']` = `{ xp, uses: { [trigger]: n } }`.
  Every read and write is wrapped in try/catch. With no storage the ledger reads
  `{ xp: 0, uses: {} }` and the UI still renders.
- The ledger is **per device**. Server-side persistence is item P-1 in §08.

---

## 06 // VERIFICATION

```
yarn test:log-commands         19 / 19 PASS
tsc -p tsconfig.server.json    0 errors
tsc -p tsconfig.json           104 errors, all already present before this change (0 new)
yarn build                     PASS (client + server)
node ESM resolve               #shared/utils/story-compression → dist OK
```

Test coverage: every registry command and alias fires its trigger · triggers are
unique · alias lookup · `/system` argument parsing · help lists every command ·
rank ladder edges · ledger with no storage · horizon parsing and false
positives · command stripping · valence · even sampling · window
exclusion (old and future rows) · generated-story recursion guard · high and low peak
dates and scores · month city capture · recent mode · empty-horizon safety ·
header and prompt formatting.

**Not covered:** no browser run of the Log UI. The full app needs Postgres and a
Together AI key, and neither is available in this environment.

---

## 07 // FINDINGS

| ID | Severity | Finding | Disposition |
|----|----------|---------|-------------|
| F-1 | HIGH | `/qi [query]` fired the moment `/qi` was typed, before any query existed. The query match failed and the delta detector never re-fired, so `/qi` could only work when pasted whole. | **FIXED.** Armed and fired after a 1.2 s pause. Stays armed until a query of 2+ characters exists. |
| F-2 | MED | The `/system` list was hard-coded and had already drifted from `logTriggers.ts` (`/sil` was missing; aliases were undocumented). | **FIXED.** Generated from the registry and enforced by tests. |
| F-3 | MED | `/story` ignored any horizon and always used the last 10 entries. | **FIXED.** Day, week, month and year horizons. |
| F-4 | LOW | The story route logged the operator's email address to stdout. | **FIXED.** Logs the user ID. |
| F-5 | LOW | Duplicate object key `elixir_found` in `src/client/utils/badges.ts` (lines 4825 and 6883). esbuild warns, and the later definition wins. | **OPEN.** Out of scope; flagged for the next Badge Codex session. |
| F-6 | INFO | 104 client `tsc` errors already present on the base branch. | **OPEN.** Not touched. |

---

## 08 // NEXT ACTIONS

| ID | Action |
|----|--------|
| P-1 | Persist the Arcade ledger on the server (User metadata) so rank follows the operator across devices and the LOT® computer device. |
| P-2 | Scheduled compression: a nightly `day` story and a Sunday `week` story written as `generated_story`, then offered as the next morning's question. |
| P-3 | Spike follow-up: when a day's valence lands ≥ 2σ from the 30-day mean, the machine asks one quiet follow-up on the next visit. |
| P-4 | `/story` dossier in Admin: compression packets per user, for prompt QA. |
| P-5 | Localise mood valence sets; move them to `#shared/constants` beside `ENERGY_COSTS`. |

```
================================================================================
END LOT-TO-LOG-01 // S-2 // 2026-11-24
================================================================================
```
