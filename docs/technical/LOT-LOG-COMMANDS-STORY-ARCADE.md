# LOT® LOG — COMMANDS · STORY COMPRESSION · ARCADE

```
DOCUMENT:  LOT-TECH-LOG-CMD-01
CLASS:     ENGINEERING // RESTRICTED
S-2:       VADIK MARMELADOV
DATE:      2026-10-14
STATUS:    IMPLEMENTED (client + server) — scoring constants PROVISIONAL
SOURCE:    src/shared/utils/logStory.ts
TESTS:     scripts/tests/test-log-story.ts   (npx tsx scripts/tests/test-log-story.ts)
```

## 1. PURPOSE

The Log is a passive AI interface: the user writes, never answers prompts. Every
entry is stored with its environment context (weather, time, location, astrology).
This module adds three things on top of that substrate:

| Capability | Trigger        | Result |
|------------|----------------|--------|
| Command index | `/system` (alias `/commands`) | Full command list, generated from one registry |
| Compressed story | `/story` · `/story week` · `/story month` · `/story year` | Narrative of the period, built from compressed log data |
| Arcade rank | `/arcade` (alias `/rank`, 🕹️) | Level, title, XP, progress, streak |

## 2. DATA FLOW

```
 LOT User data (Log entries + context, check-ins)
        │
        ▼
 compressLogs()            ← deterministic, pure, in-repo (logStory.ts)
        │  counts · moods · peaks · lows · context shifts · excerpts
        ▼
 LOT Quantum Intent Engine ← operator state (energy/clarity/alignment) + User Index
        │  (client getUserState / getUserIndex, sent with the request)
        ▼
 AI vendor processor       ← Together AI via aiEngineManager.getEngine('together')
        │
        ▼
 LOT personalized data     ← Log row, event = 'generated_story', metadata.compression
```

Design rule: **the model never sees raw history, only the compression.** The
compression is deterministic and testable; the model only phrases it. If the
vendor fails, `fallbackStory()` returns a plain factual line built from the same
compression — it never invents data.

## 3. COMMANDS

### 3.1 `/system`
Renders `LOG_COMMANDS` (registry) grouped `AI · ARCADE · CONTEXT · WELLBEING ·
INTERFACE`. The registry is the single source of truth; the test suite fails if a
registry command has no trigger detector, so the help screen cannot drift from
reality. **To add a command:** (1) add a trigger rule in
`src/client/utils/logTriggers.ts`, (2) add a handler in the trigger effect of
`src/client/components/Logs.tsx`, (3) add a row to `LOG_COMMANDS`.

### 3.2 `/story [period]`
- `parseStoryPeriod()` maps text → `day | week | month | year` (default `day`;
  unknown argument → `day`; `today` = `day`).
- The client **defers 700 ms** after the trigger appears and re-reads the live
  text, so `/story week` can finish typing before the period is parsed.
- Server `POST /api/story` (Usership only, 5 req/min): queries Log rows **in the
  window** (`createdAt >= now − period`), events `note`, `emotional_checkin`,
  `memory_answer`, `self_care_checkin`, `energy_checkin` (limit 1000).
- Window lengths: 1 / 7 / 30 / 365 days (rolling, not calendar).
- Result is appended to the entry as `📖 …` and stored as `generated_story`.

**Defect fixed in this change:** the previous `/story` selected
`event === 'log_entry' | 'journal'`, but Log entries are persisted as
`event: 'note'`. Stories therefore never saw real Log text. They now do.

### 3.3 `/arcade`
`POST /api/arcade` (20 req/min) derives status from the user's own Log rows. No
new tables, no migration. Returns `{xp, level, title, nextTitle, xpToNext,
progressPct, streakDays, display}`.

## 4. COMPRESSION (what the model receives)

`compressLogs(logs, period)` → `Compression`:

| Field | Definition |
|-------|------------|
| `entries` / `activeDays` / `totalWords` | Non-empty `note` rows, distinct UTC days, summed words |
| `moods` | `emotional_checkin.metadata.emotionalState` counts, descending |
| `peaks` / `lows` | First 3 check-ins in a HIGH / LOW mood set (see source) |
| `contextSpikes` | Consecutive entries whose stored temperature differs by ≥ 8° |
| `sample` | Up to 8 (day) / 12 (other) entries, whitespace-collapsed, 200 chars each |

This is the hook for the "follow up on a spike or pattern change" behavior:
`contextSpikes`, `lows` and mood counts are the signals; the story prompt asks
the model to name a changed pattern once, gently. Proactive morning questions are
**not** implemented here (see §8).

## 5. ARCADE (gamified evolution)

LOT® is a self-care company: the arcade rewards **showing up and reflecting**, not
output or speed. No loss states, no leaderboards, no punishment for gaps (a broken
streak resets quietly).

| Event | XP |
|-------|----|
| Log entry (`note`, non-empty) | +5 |
| Deep entry (≥ 50 words) | +5 |
| First entry of a calendar day | +10 |
| Emotional check-in | +3 |
| Asking for a story (`generated_story`) | +8 |

| LV | Title | XP from |
|----|-------|---------|
| 1 | SPARK | 0 |
| 2 | SIGNAL | 50 |
| 3 | PULSE | 150 |
| 4 | ORBIT | 400 |
| 5 | RESONANCE | 900 |
| 6 | COHERENCE | 1800 |
| 7 | QUANTUM | 3500 |

`PROVISIONAL`: the XP weights and thresholds are first-pass guesses and have not
been tuned against real user data. Treat them as constants to calibrate.
**Relationship to existing systems:** the client-side badge catalog
(`src/client/utils/badges.ts`) and Interface Evolution (`interfaceEvolution.ts`)
are untouched. The arcade rank is a separate, server-derived score; unifying it
with badges is an open item (§8). XP is computed on the fly from Log rows, so
changing a constant re-scores history retroactively.

## 6. API CONTRACT

```
POST /api/story    body {logText, period?, quantumState?, userIndex?}
                   → {story, logId|null}            403 for non-Usership
POST /api/arcade   body {}
                   → {xp, level, title, nextTitle, xpToNext, progressPct, streakDays, display}
```

## 7. VERIFICATION

| Check | Command | Result |
|-------|---------|--------|
| Unit | `npx tsx scripts/tests/test-log-story.ts` | 8 / 8 PASS |
| Server typecheck | `npx tsc --noEmit -p tsconfig.server.json` | clean |
| Client build | `NODE_ENV=production npx esr ./scripts/build/client.build.ts -prod` | OK |
| Not verified | Live Together AI call; browser interaction | requires production secrets / Usership session |

## 8. KNOWN GAPS / NEXT

1. **Proactive follow-up** ("the machine asks first"): `contextSpikes`/`lows` are
   computed but nothing yet schedules a morning question from them. Natural home:
   `src/server/scheduled-jobs.ts` + the Memory question pipeline.
2. **Persisted stories as memory:** `generated_story.metadata.compression` is
   stored; day→week→month stories do not yet feed the next level up (the true
   "compression loop").
3. **Arcade ↔ badges unification** and calibration of XP constants.
4. Mood sets (`HIGH_MOODS`/`LOW_MOODS`) assume lowercase state names; verify
   against the live `EmotionalState` vocabulary.
5. Pre-existing, untouched: 4 strict-null `tsc` errors in `Logs.tsx` (client
   typecheck is not part of the build gate).
6. Windows are rolling UTC; user-timezone day boundaries are not applied.
