```
================================================================================
LOT SYSTEMS / LOG COMMAND SYSTEM
DOCUMENT: LOT-LOG-COMMANDS
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
VERSION:  1.0 (SR-20261108-01)
DATE:     2026-11-08
================================================================================
```

# LOT® LOG — Command System, Story Compression, Arcade

## 00 // PURPOSE

The Log is the Journal. It is a **passive AI UI**: the operator writes, with no
prompts and no questions. Every entry is stamped with the context of the moment
(weather, humidity, place, moon, time). The machine reads the *pattern*, not the
operator's attention.

This document specifies the three things layered on top of that Log:

| LAYER            | SURFACE              | SOURCE OF TRUTH                |
|------------------|----------------------|--------------------------------|
| Command registry | `/system`            | `src/shared/logCommands.ts`    |
| Story compression| `/story [range]`     | `src/shared/story.ts`          |
| Arcade evolution | footer of `/story`   | `src/shared/arcade.ts`         |

## 01 // OPERATOR QUICK REFERENCE

Type in the Log (no Enter needed — commands fire on detection):

```
/system                 → full command list (grouped by category)
/story                  → compressed story of your DAY      (default)
/story week             → compressed story of your WEEK
/story month            → compressed story of your MONTH
/story year             → compressed story of your YEAR
```

Range aliases: `today daily` · `weekly` · `monthly` · `yearly annual` ·
single letters `d w m y`. Unknown argument → `day`. The 📖 emoji alone = `/story day`.

`/story` reads the argument after a 1.5 s settle window, so `/story week`
typed character-by-character resolves to **week**, not **day**.

`/story` requires the **Usership** tag (unchanged policy).

## 02 // /system — GENERATED, NOT HAND-WRITTEN

Before SR-20261108-01 the help screen was a hand-typed list that had already
drifted from the detector (`/sil`, `/ai`, aliases were detectable but unlisted).

Now:

```
src/shared/logCommands.ts   LOG_COMMANDS[]  ← ONE entry per command
        │
        ├── client/utils/logTriggers.ts   RULES = LOG_COMMANDS.map(...)   (detection)
        └── buildSystemHelp()             /system output                  (display)
```

**To add a command:** append one `LogCommandDef` to `LOG_COMMANDS`
(`trigger`, `keywords`, `emojis`, `category`, `args?`, `description`), add the
`LogTrigger` union member, and handle the trigger in `Logs.tsx`.
`/system` updates itself. The test `registry: /system lists every visible
command` fails the build if a visible command is ever missing from help.

Categories: `AI` · `SELF-CARE` · `STATE` · `INTERFACE` · `SYSTEM`.

## 03 // /story — COMPRESSION PIPELINE

```
LOT User data                              (Log rows: notes + check-ins, each with context)
    │  window by range (1 / 7 / 30 / 365 days)
    ▼
DIGEST  (shared/story.ts · buildStoryDigest · deterministic, ~1 KB)
    │  counts · active-day coverage · mood tally · context aggregates
    │  spike days · trend · peak hour · ≤ 8 excerpts
    ▼
LOT Quantum Intent Engine                  (client quantumState + userIndex ride along)
    ▼
AI vendor processor — Together AI          (receives the DIGEST, never the raw archive)
    ▼
LOT personalized data stored               (Log event = generated_story, metadata.range/digest)
```

### 03.1 Digest fields

| FIELD          | MEANING                                                        |
|----------------|----------------------------------------------------------------|
| entries/words  | journal volume in window                                       |
| activeDays / coverage | days with ≥1 entry, share of window                     |
| moods          | check-in mood tally (most frequent first)                      |
| avgTempC, avgHumidity, places, skies, moonPhases | context captured at each moment |
| peakHour       | local hour with most entries (row's own time zone)             |
| spikeDays      | days with ≥3 entries and ≥2× the active-day mean               |
| trend          | `rising` / `falling` / `steady` / `insufficient` (1st vs 2nd half) |
| excerpts       | ≤ 8 × ≤ 220 chars: longest entry + evenly spaced samples       |

Spike + trend are the "spike or pattern change" signals the follow-up engine
keys on. Temperature is stored in Kelvin in `Log.context` and converted in the digest.

### 03.2 Guarantees

1. **Minimisation.** Only the digest + current-entry note (≤ 300 chars) reach the vendor.
2. **No story-on-story.** Blocks the Log appends (`📖`, `🕯️`) are stripped from
   every entry before digesting (`stripGeneratedBlocks`).
3. **Never empty.** If the vendor fails or returns nothing, `composeLocalStory`
   writes a grounded story from the digest (`metadata.source = 'local'`).
   Empty window → a one-line invitation, no fabricated content.
4. **Cache.** Same range + identical digest key (`entries:words:checkins`)
   within 6 h → the stored story is returned, zero vendor calls (`cached: true`).
5. **Rate limit.** 5 req/min per route (unchanged).
6. **No invention.** The prompt forbids facts outside the digest.

### 03.3 API

`POST /api/story`

```jsonc
// request
{ "logText": "...", "range": "day|week|month|year", "quantumState": {...}, "userIndex": {...} }
// response
{ "story": "...", "logId": "uuid|null", "range": "week", "cached": false,
  "source": "ai|local", "digest": { "entries": 12, "activeDays": 5, "windowDays": 7 },
  "arcade": { "xp": 412, "rank": "OPERATOR", "next": "SPECIALIST", "toNext": 288,
              "progressPct": 56, "streak": 6, "line": "ARCADE  OPERATOR · ..." } }
```

Query cost per call: 1 window read (≤ 1500 rows), 3 counts, 1 day-key read
(≤ 3000 rows, 2 columns), 1 prior-story read (≤ 20 rows). All indexed on `userId`.

## 04 // ARCADE — EVOLUTION OF THE OPERATOR

Self-care company, arcade layer. The design rule: **XP rewards consistency and
reflection, never volume.**

| SOURCE            | XP      | NOTE                                              |
|-------------------|---------|---------------------------------------------------|
| Entry             | 5       | counted only up to 5 entries per active day       |
| Active day        | 20      |                                                   |
| Streak day        | 10      | capped at 30 days                                 |
| Story (`/story`)  | 40      | closing the loop is rewarded                      |
| Emotional check-in| 15      |                                                   |

| RANK | NAME        | MIN XP |
|------|-------------|--------|
| R0   | RECRUIT     | 0      |
| R1   | SIGNAL      | 100    |
| R2   | OPERATOR    | 300    |
| R3   | SPECIALIST  | 700    |
| R4   | SERGEANT    | 1400   |
| R5   | NAVIGATOR   | 2600   |
| R6   | ARCHITECT   | 4500   |
| R7   | COMMANDER   | 7500   |

Tested properties: a 40-entry binge day earns the same XP as a calm 5-entry day;
30 steady days outscore 3 bursty days with 10× the entries.

The Arcade line is a live HUD under the story. It is **not** written into the
journal text. Rank is derived on demand from the Log — there is no stored score
to corrupt. It is a sibling of (not a replacement for) the Badge Codex
(`docs/badges/`, 812 badges), which remains the achievement layer.

## 05 // KNOWN ISSUE FIXED (RECORD)

`/story` previously filtered journal rows with `event === 'log_entry' || 'journal'`.
Real Log entries are stored as `event = 'note'`, so the story never saw the
operator's own words. Fixed: the digest accepts `note`, `journal`, `log_entry`.

## 06 // VERIFICATION

```
yarn test:log     18 PASS · 0 FAIL   (registry, range parsing, digest, arcade)
yarn build        GREEN              (client esbuild + server tsc + ESM fix)
```

Not verified in this session (needs a live DB + `TOGETHER_API_KEY`): end-to-end
`/api/story` against Together AI. The fallback path is covered by unit tests.

## 07 // ROADMAP (NOT BUILT — PROPOSED)

| ID  | ITEM                                                                                   |
|-----|----------------------------------------------------------------------------------------|
| R-1 | **Machine asks first.** Morning question (any device / widget) generated from the latest digest's spike or trend change. |
| R-2 | **Passive follow-up.** Scheduled job compares today's digest to a 30-day baseline; on spike/pattern change, queue a single gentle question — never a notification storm. |
| R-3 | **Story loop.** Feed the last stored story back into the next digest as a one-line prior to compress the loop. |
| R-4 | `/rank` command → Arcade standing without generating a story.                          |
| R-5 | Arcade badge bridge: rank-ups mint Badge Codex entries.                                 |
| R-6 | Server-side `/system` for the LOT® COSMO device (same registry, JSON endpoint).         |

## 08 // FILES

```
ADDED     src/shared/logCommands.ts          command registry + buildSystemHelp
ADDED     src/shared/story.ts                range parse, digest, local story
ADDED     src/shared/arcade.ts               XP, ranks, streak
ADDED     scripts/tests/test-log-commands.ts 18 assertions
MODIFIED  src/client/utils/logTriggers.ts    rules derived from registry
MODIFIED  src/client/components/Logs.tsx     /system from registry, /story range + Arcade HUD
MODIFIED  src/client/queries.ts              story request/response types
MODIFIED  src/server/routes/api.ts           POST /api/story rewritten
MODIFIED  package.json                       test:log script
```
