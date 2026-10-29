<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT-LOG-AI-SYSTEM — Log Command Layer, Story Compression, Log Arcade

```
DOCUMENT:  LOT-LOG-AI-SYSTEM
CLASS:     RESTRICTED // S-2 EYES
S-2:       VADIK MARMELADOV
REV:       A
DATE:      2026-10-29
STATUS:    IMPLEMENTED — build GREEN, self-test GREEN (see §9)
```

## 1. PURPOSE

The Log is the passive AI surface of LOT®. The operator writes; no prompts, no
forms. Every entry is stamped with context meta-data (city, temperature,
humidity, time zone, timestamp) by the server (`getLogContext`). The machine
reads the stream later and answers in the operator's own terms.

This revision hardens three things in the Log:

| # | Capability | Operator-visible |
|---|------------|------------------|
| 1 | **Command registry** — one table drives detection and the `/system` screen | `/system` |
| 2 | **Story compression** — `/story` compresses a day/week/month/year into a digest, then a story | `/story [day\|week\|month\|year]` |
| 3 | **Log Arcade** — self-care evolution: rank, XP, streak, discoveries | `/rank` (and a line in `/system`) |

## 2. DATA FLOW

```
LOT User data (Log rows: text + context meta-data + check-in events)
        │
        ▼
 story-compression.ts      compressLogs()  → StoryDigest   (deterministic, no I/O)
        │                  renderDigest()  → bounded prompt block
        ▼
 Quantum Intent Engine     operator state (energy/clarity/alignment) + User Index,
 (client state, existing)  sent by the client with the request
        │
        ▼
 AI vendor processor       aiEngineManager.getEngine('together')  (Together AI)
        │
        ▼
 LOT personalized data     Log row  event='generated_story'
                           metadata { story, period, digest(no excerpts), quantumState }
```

Failure path: if the vendor errors, the server returns `composeFallbackStory(digest)`
— a plain, factual summary derived only from the digest. No row is written on
failure (`logId: null`), same as before this revision.

Boundary notes (honest):
- The "Quantum Intent Engine" input is the client-side operator state already
  sent by the Log; this revision does not add a new server-side QIE stage.
- Only the digest and the operator's current entry text are sent to the vendor;
  raw history is not. Entry excerpts (≤160 chars each, ≤12) are inside the
  digest. Excerpts are **not** persisted in the `generated_story` row.

## 3. COMMAND REGISTRY

File: `src/client/utils/logCommands.ts` — `LOG_COMMANDS`.

`logTriggers.ts` builds its detection rules from this table; `renderSystemHelp()`
builds `/system` from it. A command cannot be detected yet undocumented. The
self-test asserts every registered command appears in the help output.

| Command | Args | Group | Effect |
|---------|------|-------|--------|
| `/story` | `[day\|week\|month\|year]` | MEMORY | Compressed story (default `day`) |
| `/prayer` `/candle` | — | MEMORY | Contextual scripture |
| `/how` | — | MEMORY | Open LOT AI check-in (System tab) |
| `/qi` | `[query]` | MEMORY | Ask the Quantum Intelligence engine |
| `/scan` `/ai` | — | SYSTEM | System status overview |
| `/assembly` | — | SYSTEM | Self-assembly module status |
| `/phys` | — | SYSTEM | Physiological cohort report |
| `/qos` | — | SYSTEM | Quantum OS state analysis |
| `/sil` | — | SYSTEM | Signal silence check |
| `/rank` `/arcade` | — | SYSTEM | Log Arcade read-out (NEW) |
| `/system` `/commands` | — | SYSTEM | Command list (grouped) |
| `/fast` | — | BODY | Orthodox fasting calendar |
| `/breathe` | — | BODY | 4-2-6 breathing |
| `/freeze` | — | BODY | Pause and reflect |
| `/silent` | — | BODY | Signal silence acknowledgement |
| `/synth` `🎹` | — | AMBIENT | Toggle keyboard sound |
| `/radio` `🎧` | — | AMBIENT | Toggle radio |
| `/night` `🌙` | — | AMBIENT | Dark mode |

Emoji-only signal `❗` (cohort support) is intentionally not listed in `/system`.

**Add a command:** add one row to `LOG_COMMANDS`, add its trigger id to the
`LogTrigger` union in `logTriggers.ts`, add a branch in the `NoteEditor` effect
in `Logs.tsx`. Run `npm run test:log-ai`.

Detection rule (unchanged): `/word` must be a whole token (start or after
whitespace; followed by end or a non-word character). `/scandalous` does not
fire `/scan`. Only *new* triggers since the previous text fire.

## 4. /story — COMPRESSION SPEC

File: `src/server/utils/story-compression.ts`. Endpoint: `POST /api/story`
(Usership only; 5 requests/min rate limit — unchanged).

Request body adds `period?: 'day'|'week'|'month'|'year'`. Unknown values
normalise to `day` (never reaches the query unvalidated).

| Period | Window (trailing) | Excerpts handed to model |
|--------|-------------------|--------------------------|
| day | 1 d | 6 |
| week | 7 d | 8 |
| month | 30 d | 10 |
| year | 365 d | 12 |

Query is window-bounded (`createdAt >= now - window`, `LIMIT 2000`) — previously
the last 200 rows regardless of age.

### Digest fields
`entries`, `activeDays`, `entriesPerActiveDay`, `moods[]` (top 5), `latestMood`,
`timeOfDay{morning,afternoon,evening,night}`, `places[]` (top 3), `avgTempC`,
`avgHumidity`, `signals[]`, `excerpts[]`, `selfCare[]`.

Blank/whitespace entries are ignored. Temperature is stored in Kelvin and
converted to °C.

### Pattern signals (the "follow up on a spike or pattern change" hook)
| Signal | Rule |
|--------|------|
| `SPIKE` | ≥3 active days; a day with ≥ max(3, 2× mean) entries |
| `SILENCE` | window ≥7 d, ≥3 entries, none in the most recent half |
| `SURGE` | window ≥7 d, ≥6 entries, ≥80% in the most recent half |
| `MOOD-SHIFT` | ≥2 distinct moods; latest ≠ dominant; dominant seen ≥2× |
| `RHYTHM` | ≥5 entries, ≥50% between 22:00–05:00 |

Signals are descriptive. The prompt instructs the model to name a signal once,
as an observation, never as a diagnosis, and never to invent facts absent from
the digest.

### Client
`/story week` → `parseStoryPeriod()` (accepts plural, case-insensitive;
`/story yearning` is `day`). The operator's own words (command stripped by
`stripStoryCommand()`) travel as `logText`. The story is appended to the entry
prefixed `📖`, as before.

## 5. LOG ARCADE

File: `src/client/utils/logArcade.ts`. Client-side, deterministic, computed from
the cached `useLogs()` result. **Nothing is stored; no new table.**

Design rules:
1. **Routine, never valence.** XP rewards showing up, rhythm and exploring the
   system. A hard day earns exactly what a good day earns. Content and mood are
   never scored.
2. **Silent while writing.** Rank appears only on `/rank` and as one line in `/system`.
3. **No grinding.** Entries count up to 5 per day.
4. **Calm names.** Self-care company, not a combat game.

### XP formula
```
XP = 10 × Σ_day min(entries_day, 5)
   +  5 × active_days
   +  3 × longest_streak_days
   + 15 × distinct_commands_used
   + 20 × stories_generated
```

### Ranks
| ID | Rank | Min XP |
|----|------|--------|
| 0 | SIGNAL | 0 |
| 1 | PULSE | 100 |
| 2 | ROUTINE | 300 |
| 3 | RHYTHM | 700 |
| 4 | ANCHOR | 1500 |
| 5 | ARCHIVIST | 3000 |
| 6 | NAVIGATOR | 6000 |
| 7 | KEEPER | 12000 |

Streak: consecutive local days with ≥1 non-blank entry; today may still be empty
without breaking the current streak.

Known limit: `useLogs()` is capped at the most recent 500 rows (see
`LOT-SR-20260719-01`), so very long histories under-count until a server-side
aggregate exists. For heavy users rank can therefore stall or appear to regress
as old rows leave the 500-row window — see §8 R-2.

## 6. FILES

| Path | Role |
|------|------|
| `src/client/utils/logCommands.ts` | Registry, `renderSystemHelp`, `/story` arg parsing |
| `src/client/utils/logTriggers.ts` | Detection (now derived from registry) |
| `src/client/utils/logArcade.ts` | XP / rank / streak |
| `src/client/components/Logs.tsx` | `/system`, `/rank`, `/story <period>` wiring |
| `src/client/queries.ts` | `period` on `useStoryGeneration` |
| `src/server/utils/story-compression.ts` | Digest, signals, fallback story |
| `src/server/routes/api.ts` | `POST /api/story` uses the digest |
| `scripts/tests/test-log-ai.ts` | Self-test (`npm run test:log-ai`) |

## 7. VERIFY

```bash
npm run test:log-ai     # registry, compression, arcade — exit 1 on failure
npm run build           # client + server; must be green before push
```

## 8. RISKS / OPEN ITEMS

| ID | Item | Severity | Note |
|----|------|----------|------|
| R-1 | Time-of-day buckets use UTC | LOW | Should use the log's `context.timeZone`. Affects `RHYTHM` signal and fallback wording only. |
| R-2 | Arcade limited to 500 recent rows | MED | Add a server aggregate endpoint; rank may appear to regress for heavy users. |
| R-3 | Vendor receives entry excerpts | MED | Excerpts are truncated and Usership-gated. A user-facing consent/opt-out toggle is not built. |
| R-4 | `logText` is not length-limited at the route | LOW | Truncated to 500 only in the stored row; prompt gets it whole. Pre-existing. |
| R-5 | Morning proactive question not built | — | "The machine asks first" remains the Memory Engine's job; this revision does not change it. |
| R-6 | No server-side test runner in repo | LOW | Self-test is a standalone script; wire into CI when one exists. |

## 9. VERIFICATION RECORD (2026-10-29)

- `npm run test:log-ai` — ALL PASS
- `npm run build` — GREEN
- `tsc --noEmit -p tsconfig.json` — 104 errors before and after; zero in changed files (pre-existing debt)
- No benchmark tag existed at run time → Plan B unavailable (see `docs/benchmark/LOT-SR-20261029-01.md`)

AUTHORIZED BY: S-2 // VADIK MARMELADOV
