```
╔══════════════════════════════════════════════════════════════════════╗
║        LOT® LOG — COMMAND SYSTEM, /story COMPRESSION, ARCADE RANK    ║
╠══════════════════════════════════════════════════════════════════════╣
║  DOC      : docs/technical/LOG-COMMANDS-AND-STORY.md                 ║
║  CLASS    : ENGINEERING // TECHNICAL REFERENCE                       ║
║  S-2      : VADIK MARMELADOV                                         ║
║  DATE     : 2026-10-10                                               ║
╚══════════════════════════════════════════════════════════════════════╝
```

# 1. PURPOSE

The Log is a passive AI UI. The operator writes entries with no prompts or
questions; every entry is stored with environment context (weather, city,
time, astrology). Two slash commands expose the machine's side of the loop
from inside that same text field:

| Command | Result |
|---|---|
| `/system` | Prints every available command, grouped (JOURNAL · BODY · SYSTEM · INTERFACE). |
| `/story [day\|week\|month\|year]` | Prints a compressed story of that period, plus a one-line Arcade rank readout. Default period is `day`. |

Typing `/` alone (or a partial like `/st`) shows matching commands live,
beneath the entry, before anything is submitted.

This extends the loop defined in `docs/corporate/LOT-AI-PRODUCT-BRIEF.md`:
`LOG → OBSERVE → COMPRESS → ASK → COMPRESS AGAIN`. `/story` is the COMPRESS
step made visible on demand.

# 2. DATA FLOW

```
LOT User data                       Log rows (entries, mood check-ins, self-care answers),
      │                             each with context meta-data (city, temperature, humidity)
      ▼
Compression  (src/shared/utils/lotStory.ts, pure, deterministic)
      │   window → counts, active days, streak, mood trend, peaks (high/low/long entry),
      │   busiest time band, places, average temperature
      ▼
LOT Quantum Intent Engine           operator state (energy/clarity/alignment, User Index)
      │                             supplied by the client and appended to the prompt
      ▼
AI vendor processor (Together AI)   receives ONLY the compressed block (§5)
      │                             failure / empty / no-signal → deterministic fallback story
      ▼
LOT personalized data stored        Log row, event = 'generated_story'
                                    metadata: period, source ('ai'|'fallback'), stats, arcade
```

# 3. FILES

| File | Role |
|---|---|
| `src/shared/utils/lotCommands.ts` | Command registry, `/system` text builder, `suggestCommands()`. Pure. |
| `src/shared/utils/lotStory.ts` | Period parsing, compression, Arcade rank, prompt block, fallback story. Pure, no imports. |
| `src/server/routes/api.ts` (`POST /api/story`) | Loads one year of logs, compresses, calls vendor, persists. |
| `src/client/components/Logs.tsx` | Trigger wiring, `/` suggestion list, `/system` and `/story` blocks. |
| `src/client/utils/logTriggers.ts` | Detectors that *fire* commands (unchanged; registry is test-checked against it). |
| `src/client/queries.ts` | `useStoryGeneration` request/response types. |
| `scripts/tests/test-log-story.ts` | Dependency-free test suite (10 groups). |

# 4. `/story` BEHAVIOR

## 4.1 Period
Parsed from the text **after** `/story` only: `/story week`, `/story last month`,
`/story yearly`. A journal sentence like "rough week /story" stays `day`.
Windows are rolling: day = 24 h, week = 7 d, month = 30 d, year = 365 d.

The client waits 900 ms after `/story` is typed so an argument can follow, then
reads the latest text. A second `/story` while one is running is ignored.

## 4.2 Compression fields
`entries, logs, moodCheckins, selfCareAnswers, words, activeDays, totalDays,
streak, topMoods[3], moodTrend (rising|falling|steady|unknown), busiestBand
(night|morning|afternoon|evening), cities[3], avgTempC, peaks[]`.

- **Streak**: consecutive active days ending today; yesterday counts as grace.
- **Mood trend**: mean mood valence of the second half of the series minus the
  first half; |Δ| > 0.5 on a −2…+2 scale = rising/falling. Needs ≥ 4 scored moods.
- **Peaks**: brightest mood (valence > 0), heaviest mood (valence < 0), and a
  *long entry* (≥ mean + 1.5 σ words, needs ≥ 3 logs).
- Day boundaries and time bands use the operator's clock via `tzOffsetMin`
  (minutes from UTC, e.g. −420 for PDT; clamped to ±14 h; default 0).

## 4.3 Sources
`log_entry`, `journal`, `note` → logs · `emotional_checkin` → mood ·
`memory_answer`, `self_care_checkin`, `energy_checkin` → self-care.
Text after a `📖` marker is stripped so earlier `/story` output is never
re-compressed into the next story.

## 4.4 Access
Unchanged: Usership tag required (HTTP 403 otherwise). Rate limit 5/min.

# 5. PRIVACY BOUNDARY

The vendor prompt contains: aggregate numbers, mood names, place names, average
temperature, Arcade level/rank/XP, at most **3 peak excerpts** (≤ 90 chars) and
at most **3 recent excerpts** (≤ 120 chars), plus the client-supplied operator
state. It does **not** contain user id, email, or full log text. The server
log line prints the user id and entry count only (previously it printed the
email and the first 80 chars of the entry).

# 6. ARCADE EVOLUTION

A self-care company, an arcade ladder: the record earns rank, rank is never
lost. XP is recomputed from the last 365 days of logs, so it measures *recent
commitment*, not lifetime.

| Source | XP |
|---|---|
| Log entry | 10 |
| Mood / self-care check-in | 15 |
| Active day | 25 |
| Streak day (capped at 60) | 15 |
| Story generated | 50 |

| Level | Rank | XP |
|---|---|---|
| 1 | RECRUIT | 0 |
| 2 | OPERATOR | 100 |
| 3 | SPECIALIST | 300 |
| 4 | SERGEANT | 700 |
| 5 | LIEUTENANT | 1 500 |
| 6 | CAPTAIN | 3 000 |
| 7 | MAJOR | 6 000 |
| 8 | COLONEL | 12 000 |
| 9 | COMMANDER | 24 000 |

Readout appended under every story:
`LVL 2 OPERATOR  ███░░░░░░░  130 XP · 170 XP TO SPECIALIST`.

This is separate from the Badge Codex (`src/client/utils/badges.ts`); it does
not read or award badges. Unifying the two is an open item (§9).

# 7. API CONTRACT

`POST /api/story`
```
request : { logText: string, tzOffsetMin?: number, quantumState?, userIndex? }
response: { story: string, logId: string|null,
            period: 'day'|'week'|'month'|'year',
            source: 'ai'|'fallback',
            stats: { entries, activeDays, totalDays, streak, words, moodTrend },
            arcade: ArcadeRank, arcadeLine: string }
```
`logText` is the full entry text (the server parses the period from it). The
three new response fields are optional on the client type, so older cached
clients keep working.

# 8. ADDING A COMMAND

1. Add the detector to `RULES` in `src/client/utils/logTriggers.ts`.
2. Add one row to `LOG_COMMANDS` in `src/shared/utils/lotCommands.ts`.
3. Handle the trigger in the `Logs.tsx` effect.
4. Run `node --experimental-strip-types scripts/tests/test-log-story.ts`.
   The "registry matches logTriggers" test fails if step 1 or 2 is missed.

# 9. VERIFICATION AND KNOWN LIMITS

```
node --experimental-strip-types scripts/tests/test-log-story.ts   → 10 groups PASS
tsc --strict on lotStory.ts + lotCommands.ts                      → PASS
tsc on api.ts / Logs.tsx / queries.ts                             → no new errors
                                                                    (dependency-related
                                                                    errors only; see below)
```
**Not verified in this session:** `yarn install` failed (network reset) so
`yarn build`, the esbuild client bundle, and a live Together AI call were not
run. The route and UI changes are type-checked only. Run `yarn build` and one
manual `/story week` before releasing.

Known limits / open items:
- `/story` caps the year scan at 5 000 rows; heavier users get a truncated year.
- Mood valence table covers the 11 existing emotional states; unknown states are ignored.
- Proactive "machine asks first" follow-ups on spikes (item 2 of the product
  vision) are **not** in this change. The `peaks` / `moodTrend` output is the
  detector input they will need.
- Server-side persistence of `/system` use, and story delivery to devices
  (robot/vehicle/dashboard exports in the Product Brief), are not implemented.
- Unify Arcade rank with the Badge Codex.

```
S-2 // VADIK MARMELADOV // LOT SYSTEMS CORPORATION
```
