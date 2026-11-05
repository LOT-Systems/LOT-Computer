# LOT® LOG COMMAND SYSTEM — `/system` · `/story` · ARCADE

```
CLASS:     RESTRICTED // S-2 EYES
DOCUMENT:  LOT-TECH-LOGCMD-01
S-2:       VADIK MARMELADOV
STATUS:    IMPLEMENTED — GATE GREEN
DATE:      2026-11-05
CODE:      src/shared/utils/log-commands.ts
           src/server/routes/api.ts           (POST /api/story)
           src/client/components/Logs.tsx     (NoteEditor trigger wiring)
           src/client/utils/logTriggers.ts    (token detection, unchanged)
TEST:      npm run test:log-commands
```

## 1. MISSION

The Log is a **passive AI UI**: the user writes, never answers prompts. Every entry is stamped with context metadata (weather, humidity, city, time zone, moon phase, hourly zodiac). From that stream the machine builds a **compressed story** of the person — day, week, month, year — and feeds it back so the loop tightens: *entry → context → compression → story → next entry.*

Two commands expose that loop inside the Log itself:

| Command | Effect |
|---|---|
| `/system` | Prints every command, generated from one registry, plus the user's Arcade rank. |
| `/story [day\|week\|month\|year]` | Prints the compressed user-story for the chosen window (default `day`). |

## 2. DATA FLOW

```
LOT User data (Log rows: text + context JSONB)
   │
   ▼
compressStory()            ← deterministic, pure, shared module (no AI, no I/O)
   │  digest: counts · active days · peak hour · weather · city · moon · SPIKES
   ▼
LOT Quantum Intent Engine  ← client sends quantumState + userIndex with the request
   │  (energy / clarity / alignment / trend grounds the prompt)
   ▼
AI vendor processor        ← Together AI via aiEngineManager.getEngine('together')
   │  prompt = system rules + COMPRESSED DIGEST (ground truth) + moods + self-care
   ▼
LOT personalized data stored ← Log row event='generated_story'
                               metadata { scope, digest, story, quantumState }
```

**Doctrine: the digest is ground truth, the LLM only phrases it.** The prompt forbids inventing facts beyond the digest. If the vendor is down, the route returns the digest narrative itself as the story — the feature degrades to *less poetic*, never to *broken*.

## 3. `/system` — COMMAND REGISTRY

Help is **generated** by `buildSystemHelp()` from `COMMANDS`. Adding a command = one registry row + one `logTriggers.ts` rule; `scripts/tests/test-log-commands.ts` fails the build if a registered command has no trigger or is missing from `/system`.

| Category | Commands |
|---|---|
| NARRATIVE | `/story [scope]` `/prayer` `/qi [query]` `/how` |
| CONTEXT | `/scan` `/qos` `/assembly` |
| BODY | `/phys` `/fast` `/breathe` `/freeze` `/silent` `/sil` |
| AMBIENT | `/synth` `/radio` `/night` |
| SYSTEM | `/system` |

Aliases (e.g. `/commands`, `/pause`, `/candle`) are honored by the trigger layer; the help lists canonical names. Emoji triggers (`📖 🎹 🎧 🌙 🕯️ 🧊 ❗`) are unchanged.

Line grammar of the help text (renderer contract): `/…` = command row (2+ spaces before description), other non-empty = section header, empty = spacer.

## 4. `/story` — COMPRESSION

### 4.1 Parsing
`parseStoryCommand(text)` → `{ scope, rest }`. Accepts `day|today|daily`, `week|weekly`, `month|monthly`, `year|yearly|annual`. Unknown argument → `day`, and the argument stays in the user's text. The `/story …` token is stripped from what the server sees.

### 4.2 Windows
Server reads **2× the scope** (current + previous equal window) so it can compare. Hard cap 3,000 rows. Only `log_entry` / `journal` events with real prose count (`isUserProse` drops zero-width-only and bare slash lines — same character class as the blank-message hardening, LOT-SR-20260719-01).

### 4.3 Digest fields
`entryCount · activeDays/totalDays · words · peakHour/dayPart · dominant weather · mean °C · cities · dominant moon phase · spikes[] · narrative`

### 4.4 Spike / pattern-change rules (the "follow-up" trigger signal)

| Kind | Rule |
|---|---|
| `volume` | previous window ≥ 3 entries AND current ≥ 2× previous |
| `silence` | previous ≥ 3 and current = 0; or previous ≥ 5 and current ≤ ⅓ previous |
| `depth` | longest entry ≥ 40 words AND ≥ 3× the previous window's mean length |

Spikes are stored in `metadata.digest.spikes` of every generated story. This is the hook for the next phase: the machine **asks first** (morning prompt on any device / site widget) when a spike appears.

### 4.5 Persistence & access
- Gate: `Usership` tag (unchanged). Rate limit 5/min (unchanged).
- Stored as `event='generated_story'` with `scope` and `digest` — later stories can be compressed *from stories* (week from days, year from months) without re-reading raw entries.
- Only the story text is appended to the user's entry. The scope/rank footer is display-only and is **never written into the log**.

## 5. ARCADE — GAMIFIED EVOLUTION

LOT is a self-care technology company with an arcade soul: every check-in is a move. Arcade here is **derived, never stored** — same logs, same rank, no drift, no migration.

```
XP = Σ min(entries_that_day, 5) × 10      showing up, not spamming
   + active_days × 5
   + streak_days × 3                      consecutive days ending today/yesterday
   + stories_generated × 25
```

| LV | RANK | XP ≥ |
|---|---|---|
| 1 | CADET | 0 |
| 2 | OPERATOR | 50 |
| 3 | NAVIGATOR | 200 |
| 4 | ARCHIVIST | 600 |
| 5 | CARTOGRAPHER | 1,500 |
| 6 | ARCHITECT | 4,000 |

**Self-care guardrails:** per-day cap of 5 entries; no penalty for broken streaks (streak simply resets, XP is never removed); **no command is gated behind rank** — help and safety tools (`/breathe`, `/system`) are always available. Rank is shown in `/system` (after the first `/story` of the session) and in the `/story` footer: `[ WEEK · RANK OPERATOR · LV 2 · 85 XP · STREAK 3D ]`.

## 6. API CONTRACT

`POST /api/story`
```jsonc
// request
{ "logText": "string", "scope": "day|week|month|year",   // scope optional, invalid → day
  "quantumState": {...}, "userIndex": {...} }
// response
{ "story": "string", "logId": "uuid|null", "scope": "week",
  "arcade": { "xp": 85, "level": 2, "rank": "OPERATOR",
              "nextRank": "NAVIGATOR", "xpToNext": 115, "streak": 3 } }
```
Failure mode: HTTP 200 with digest-narrative fallback, `logId: null`. Non-Usership: 403 (unchanged).

## 7. VERIFICATION

| Gate | Command | Result |
|---|---|---|
| Self-test (33 assertions) | `npm run test:log-commands` | ALL GREEN |
| Server typecheck/build | `npm run server:build` | PASS |
| Client build | `npm run client:build` | PASS |
| Known pre-existing | 4 TS errors in `Logs.tsx` (lines 100/104/~3789/~3856), identical before/after | UNCHANGED |

## 8. KNOWN LIMITS / NEXT

1. `/story` output requires network + Usership; offline digest exists server-side only — a client-side local digest for non-Usership preview is a candidate next step.
2. Mood is not yet part of the digest (only moods in the prompt). Fold `emotional_checkin` into `compressStory` to detect mood-shift spikes.
3. Proactive loop: a scheduled job should read `metadata.digest.spikes` and queue a morning question. Not implemented — deliberately left for review before the machine starts speaking first.
4. Arcade is Log-only. Widget participation (check-ins, Memory answers) should add XP through the same derived model.
5. Production verification needs a real Together AI key + Usership account; not exercisable in CI.

---
*LOT® — Self-care through proactive context-aware AI.*
