<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

```
================================================================================
LOT SYSTEMS / TECHNICAL SPECIFICATION
DOCUMENT: LOG-COMMAND-SYSTEM
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-09
STATUS:   IMPLEMENTED (builds green; 16/16 unit tests)
================================================================================
```

# LOG COMMAND SYSTEM — `/system`, `/story`, `/rank`

## 00 // PURPOSE

The Log is a **passive AI UI**: the user writes, without prompts or questions.
Every entry is stored with its context (weather, humidity, city, time zone,
moon, zodiac). The machine reads the stream later and answers back.

This subsystem gives the Log its **command layer** and its **compression
loop**:

| Command | Effect |
|---|---|
| `/system` | Shows every command, grouped, plus the user's arcade rank line |
| `/story` | Compressed story of the **day** (default) |
| `/story week` · `month` · `year` | Compressed story of that period |
| `/rank` | Arcade rank, XP, progress bar, next rank |

Aliases (`/commands`, `/arcade`, `/xp`) are in the registry.

## 01 // DATA FLOW

```
LOT User data (Log entries + context metadata + mood check-ins)
        |
        v
[1] DIGEST            src/shared/utils/storyCompression.ts   (deterministic, no model)
        |             counts, active days, streak, moods, day-parts, places,
        |             weather, moon, SIGNALS (spikes / pattern changes), excerpts
        v
[2] QUANTUM INTENT    client sends quantumState + userIndex with the request
    ENGINE            (energy / clarity / alignment, overall index + trend)
        |
        v
[3] AI VENDOR         Together AI via aiEngineManager.getEngine('together')
        |             narrates the digest — it never computes it
        v
[4] LOT PERSONALIZED  Log row, event = 'generated_story'
    DATA STORED       metadata: { period, digest, quantumState, logText }
```

**Design rule:** the compression is computed locally and is auditable. The
model only narrates. If the vendor fails, `composeLocalStory(digest)` returns a
deterministic story, so `/story` never dead-ends.

## 02 // COMPONENTS

| File | Role |
|---|---|
| `src/shared/utils/logCommands.ts` | Command registry (single source of truth), `renderSystemHelp`, `parseStoryPeriod`, `stripStoryCommand` |
| `src/shared/utils/storyCompression.ts` | `buildDigest`, `detectSignals`, `computeStreak`, `composeLocalStory`, `computeArcade`, `formatArcadeLine` |
| `src/client/utils/logTriggers.ts` | Trigger detector; new `rank-report` trigger |
| `src/client/components/Logs.tsx` | Wires `/system`, `/story [period]`, `/rank` into the editor |
| `src/client/queries.ts` | `useStoryGeneration` (adds `period`), `useArcade` (on-demand) |
| `src/server/routes/api.ts` | `POST /api/story` (period-aware), `GET /api/arcade` |
| `scripts/tests/test-log-commands.ts` | 16 unit tests (`npm run test:log-commands`) |

`/system` is **rendered from the registry**, so it cannot drift from the
commands the Log understands. A test asserts every registry command and alias
is recognised by `detectTriggers`.

## 03 // `/story` — PERIODS AND WINDOWS

| Period | Window (rolling) | Row cap | Max tokens |
|---|---|---|---|
| day | 1 day | 1500 | 512 |
| week | 7 days | 1500 | 768 |
| month | 30 days | 1500 | 768 |
| year | 365 days | 5000 | 768 |

Access: **Usership** tag required (unchanged). Rate limit: 5/min (unchanged).
Bare `/story` behaves as `/story day`. An unknown word after `/story` is
ignored and treated as `day`.

## 04 // SIGNALS — SPIKE AND PATTERN-CHANGE DETECTION

Every rule is simple and explainable; the output is shown to the user and given
to the model. Entries are split at the midpoint of the window.

| Signal | Rule |
|---|---|
| `VOLUME SPIKE` | >= 4 entries; second half >= 2x first half and >= 3 entries |
| `VOLUME DROP` | mirror of the above |
| `MOOD SHIFT: a -> b` | dominant mood differs between halves; >= 2 check-ins each half |
| `SILENCE` | newest entry older than half the window (not evaluated for `day`) |
| `NIGHT WRITING` | >= 4 entries and >= 40% between 00:00–06:00 **in the user's time zone** |

These are the hooks for the "machine follows up on a spike" behaviour. This
release **surfaces** signals in `/story`. Autonomous follow-up prompts
(morning question, widget prompt, device push) are the next step — see §08.

## 05 // ARCADE EVOLUTION

LOT is an arcade for self-care. Progress is earned by **presence**, never by
purchase.

```
XP = 10 x entries + 25 x active days + 15 x streak days + 20 x stories read
Level L is reached at 50 x (L-1)^2 XP        (LV2 = 50, LV5 = 800, LV10 = 4050)
```

| Rank | First level |
|---|---|
| SIGNAL | 1 |
| PILOT | 3 |
| NAVIGATOR | 6 |
| OPERATOR | 10 |
| ARCHITECT | 15 |
| SENTINEL | 22 |
| LOT MASTER | 30 |

`/rank` output example:

```
RANK PILOT  LV 3  ███░░░░░░░  214 XP  (186 TO LV 4)
NEXT RANK       NAVIGATOR
EARN XP        +10 entry · +25 active day · +15 streak day · +20 story
```

Streak anchors on today **or yesterday**, so a quiet morning does not zero it.
Arcade state is derived on demand from the last 365 days of Log rows (cap
10,000); nothing new is stored.

> **Scope note.** This is a *Log-scoped* XP layer. It does not replace or write
> to the existing badge engine (`badges.ts`) or interface evolution
> (`interfaceEvolution.ts`). Unifying them is future work (§08).

## 06 // PRIVACY AND SAFETY

- The digest carries counts, mood labels, places, weather. Raw text reaches the
  model only as <= 5 excerpts of <= 160 characters, plus the entry the user
  typed alongside `/story`.
- Generated stories are stored as `generated_story` events and are excluded
  from journal counts, so the machine never "reads its own writing" as the
  user's.
- `/story` text is appended to the user's Log (existing behaviour, kept).
- Slash-command parsing is token-based: `/scandalous` does not fire `/scan`.

## 07 // VERIFICATION

```
npm run test:log-commands     16/16 PASS
npm run server:build          PASS (tsc, strict)
npm run client:build          PASS (esbuild + postcss)
```

Not verified in this environment: live Together AI call, and a browser
walkthrough with a real Usership account (no credentials / database here).
Treat the first production `/story week` as the acceptance test.

## 08 // OPEN ITEMS (RECOMMENDED NEXT)

1. **Proactive follow-up** — scheduled job reads `signals` and queues a single
   question for the next morning (device or widget) when a spike/shift is found.
2. **Rolling compression** — persist the day digest nightly; build week/month/
   year from stored day digests instead of raw rows (cheaper, and keeps raw
   text out of the year prompt entirely).
3. **Unify arcade** — feed `/rank` XP into the badge engine and
   `$evolutionState` so one progression system drives both Log and widgets.
4. **Story-read XP** — currently counts all stored stories, not distinct reads.
5. **Streak on server uses user time zone; active-day tally uses UTC dates** —
   align both to `localParts` (minor XP skew near midnight).
