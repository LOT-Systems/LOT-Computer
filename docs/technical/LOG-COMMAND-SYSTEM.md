# LOT® LOG — COMMAND SYSTEM & STORY COMPRESSION

```
╔══════════════════════════════════════════════════════════════════════╗
║  DOC      : LOT-TECH-LOG-CMD                                         ║
║  REV      : 1.0 — 2026-11-10                                         ║
║  CLASS    : ENGINEERING / FIELD SPEC                                 ║
║  OWNER    : S-2                                                      ║
║  SCOPE    : Log (Journal) slash commands · /system · /story horizons ║
╚══════════════════════════════════════════════════════════════════════╝
```

## 0. MISSION

The Log is LOT®'s **passive AI surface**. The operator writes; the system never
prompts inside the Log. Every entry is stored with its environmental context
(weather, humidity, sky, city, time zone, moon phase, zodiac, rokuyo — see
`getLogContext()` in `src/server/utils/logs.ts`). Slash commands are the only
way the operator *pulls* from the machine while journaling.

This document specifies two commands:

| COMMAND | FUNCTION |
|---|---|
| `/system` | Prints the full command grid + Arcade rank. |
| `/story [day\|week\|month\|year]` | Compresses the chosen horizon into a story. |

## 1. DATA FLOW (DOCTRINE)

```
 OPERATOR TYPES "/story month"
          │
          ▼
 Logs.tsx  NoteEditor effect ── detectNewTriggers() → 'story-mode'
          │  waits STORY_ARG_SETTLE_MS (1200 ms) for the horizon argument
          │  parseStoryHorizon(text) → 'month'
          ▼
 POST /api/story  { logText, horizon, quantumState, userIndex }
          │
          ▼
 LOT USER DATA      Log rows where createdAt ≥ now − HORIZON_MS[month]
                    (cap STORY_MAX_ROWS = 2000)
          │
          ▼
 LOT QUANTUM INTENT ENGINE (deterministic compression)
                    compressLogs() → StoryDigest
                    + client QIE state (energy/clarity/alignment, user index)
          │
          ▼
 AI VENDOR PROCESSOR  Together AI via aiEngineManager.getEngine('together')
                    receives ONLY the digest — never raw rows
          │
          ▼
 LOT PERSONALIZED DATA STORED
                    Log { event: 'generated_story', metadata.horizon,
                          metadata.digest (no excerpts) }
          │
          ▼
 Log UI   📖 block: digest header (terminal grid) + story;
          story text appended to the entry as "📖 …"
```

The deterministic/AI split is deliberate:

- **Bounded vendor payload.** A year of logs compresses to ~20 lines.
- **Auditable.** The digest is stored next to the story, so any story can be
  traced back to the numbers that produced it.
- **Loop closure.** Stored `generated_story` rows are themselves future signal:
  the next compression at a wider horizon reads them back (they fall inside the
  window like any other row).

## 2. `/story` — HORIZON SPEC

### 2.1 Grammar

```
/story                 → week (DEFAULT_STORY_HORIZON)
/story day|d|today|24h → day   (24 h)
/story week|w|7d       → week  (7 d)
/story month|m|30d     → month (30 d)
/story year|y|365d     → year  (365 d)
/story <anything else> → week  (argument ignored, kept in logText)
📖                     → week
```

Case-insensitive. Parser: `parseStoryHorizon()` in
`src/shared/utils/story-compression.ts`.

### 2.2 Horizon table

| HORIZON | WINDOW | TARGET WORDS | EXCERPTS | MAX TOKENS |
|---|---|---|---|---|
| day   | 24 h  | 120 | 6  | 384 |
| week  | 7 d   | 180 | 8  | 512 |
| month | 30 d  | 240 | 10 | 640 |
| year  | 365 d | 300 | 12 | 768 |

### 2.3 StoryDigest fields

| FIELD | SOURCE | NOTES |
|---|---|---|
| `totalSignals` | every row in window | clicks, check-ins, entries — all are signal |
| `journalEntries` | `log_entry`, `journal`, `note` | command-only lines (`/story week`) excluded |
| `activeDays` / `spanDays` | UTC dates of rows | engagement density |
| `moodCounts`, `dominantMood` | `emotional_checkin.metadata.emotionalState` | ties broken alphabetically |
| `moodBalance` | mean of `MOOD_VALENCE` | −1 … +1 |
| `moodDrift` | mean(2nd half) − mean(1st half) | >0 rising, <0 falling; needs ≥2 check-ins |
| `highPeak` / `lowPeak` | most extreme valence, most recent wins ties | only kept on their own side of neutral |
| `selfCareCompleted/Skipped` | `self_care_complete`, `self_care_checkin` / `self_care_skip` | discipline signal |
| `topCities` | `context.city` | up to 3 |
| `avgTemperature`, `avgHumidity` | `context.*` | raw units as stored |
| `dominantSky`, `dominantMoon` | `context.weatherDescription`, `context.astroMoonPhase` | setting for the story |
| `longestSilenceHours` | max gap between consecutive rows | surfaces absences |
| `excerpts` | journal text, **evenly sampled** across the window | a month story covers the whole month, not the last 3 days |

### 2.4 Mood valence map

```
+1.0  energized · excited · fulfilled · grateful · hopeful
+0.5  content · calm · peaceful
−0.5  uncertain · tired · restless
−1.0  anxious · overwhelmed · exhausted
```

States outside the map are counted in `moodCounts` but carry no valence.

### 2.5 Prompt rules (server)

Second person · digest-only (no invented events) · HIGH and LOW peak are the
spine · reflect drift · acknowledge gaps with compassion · end with one quiet
forward-looking sentence · no title/preamble · empty digest → two quiet
sentences stating the horizon was unrecorded.

### 2.6 Response contract

```ts
POST /api/story
body:     { logText: string; horizon?: 'day'|'week'|'month'|'year';
            quantumState?; userIndex? }
response: { story: string; logId: string | null;
            horizon: StoryHorizon; header: string[] }
```

`header` is the terminal-grid summary rendered above the story, e.g.:

```
STORY           MONTH
SIGNALS         212 · 31 ENTRIES · 24/30 DAYS
DOMINANT        CALM
HIGH            GRATEFUL 10-28
LOW             OVERWHELMED 10-14
```

Unchanged guards: Usership tag required (403 otherwise) · rate limit 5/min ·
vendor failure returns the fallback story *with* the header (the digest is
computed before the vendor call, so the operator still sees their numbers).

## 3. `/system` — COMMAND GRID

### 3.1 Single source of truth

`LOG_COMMANDS` in `src/client/utils/logTriggers.ts` is the registry. The
`/system` screen is rendered by `formatSystemHelp()` from it, and the EMOJI row
is derived from the detection `RULES`, so the help screen cannot drift from
what the detector actually fires on. **Adding a command = one `RULES` row + one
`LOG_COMMANDS` row + one branch in `Logs.tsx`.**

### 3.2 Groups

| GROUP | COMMANDS |
|---|---|
| NARRATIVE | `/story [day\|week\|month\|year]` · `/prayer` · `/how` |
| INTELLIGENCE | `/qi [query]` · `/scan` · `/qos` · `/assembly` · `/phys` · `/sil` |
| SELF-CARE | `/breathe` · `/freeze` · `/fast` · `/silent` |
| ENVIRONMENT | `/synth` · `/radio` · `/night` · `/system` |

`/sil` existed in the detector but was missing from the old hardcoded list —
fixed by the registry.

### 3.3 Arcade block

The self-care Arcade (badges, streak milestones) is surfaced at the bottom of
`/system`:

```
ARCADE
RANK            ≈ Stream            (highest milestone_N badge → getLevelName)
BADGES          42                  (getEarnedBadges().length)
NEXT UNLOCK     Tide                (getNextBadgeUnlock())
```

Before the first 7-day milestone: `RANK  INITIATE — first milestone at 7 days`.
Rank respects the operator's badge theme (water / architecture). Any failure
reading badge storage drops the block silently — `/system` always renders.

## 4. FILE MAP

| FILE | ROLE |
|---|---|
| `src/shared/utils/story-compression.ts` | **NEW.** Pure compressor: horizons, parser, `compressLogs`, `sampleEvenly`, prompt + header formatters. Shared client/server. |
| `src/client/utils/logTriggers.ts` | `LOG_COMMANDS`, `getEmojiShortcuts`, `formatSystemHelp`, `ArcadeStatus`. |
| `src/client/components/Logs.tsx` | `/system` uses registry + Arcade; `/story` settles 1200 ms, sends `horizon`, renders `header`. |
| `src/client/queries.ts` | `useStoryGeneration` types: `horizon`, `header`. |
| `src/server/routes/api.ts` | `POST /api/story` windowed query, digest, horizon-aware prompt, digest persisted in metadata. |

## 5. OPERATIONAL NOTES

- **Settle window.** Triggers fire on the bare `/story` keystroke, so the
  editor waits 1200 ms and then reads the latest text. A slow typist who pauses
  longer than that between `/story` and `month` gets a week story; retyping
  `/story month` on a fresh line fires again (delta-based detection).
- **Row cap.** 2000 rows per request. A heavy year may be truncated to the
  most recent 2000 rows; the digest still reports the true window dates.
- **Privacy.** Excerpts are trimmed to 200 chars and are not persisted in the
  story's metadata digest (only aggregate numbers are).
- **No DB migration.** Uses existing `Log` columns (`event`, `text`,
  `context`, `metadata`).

## 6. VERIFICATION (2026-11-10)

```
tsc -p tsconfig.server.json --noEmit   PASS (0 errors)
tsc -p tsconfig.json --noEmit          104 errors — identical to base commit (pre-existing)
yarn build (client + server)           PASS
compressLogs assertions (12)           PASS  — window filter, peaks, drift,
                                                silence, self-care, cities,
                                                command-line exclusion, sampling
formatSystemHelp render                PASS  — 17 commands, 7 emoji, Arcade block
```

## 7. NEXT ORDERS

1. Morning question seeded from the latest `generated_story` low peak (the
   machine asks first).
2. Auto-compression: nightly `day` story, Sunday `week`, 1st-of-month `month`,
   delivered as a Log follow-up when `moodDrift` crosses ±0.5 (spike detection).
3. Arcade: badge for first `/story year`; streak credit for consecutive daily
   compressions.
4. Fix the same settle problem for `/qi [query]` (it fires on bare `/qi` and
   no-ops).
