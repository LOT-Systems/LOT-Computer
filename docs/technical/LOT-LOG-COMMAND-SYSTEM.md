<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT-LOG-COMMAND-SYSTEM
## Log Entry System · `/system` · `/story` · Arcade Rank
### Revision: R1 · Date: 2026-10-16 · Classification: INTERNAL / ENGINEERING

---

## 1. PURPOSE

The Log is a **passive AI UI**: the user writes, with no prompts or questions.
Every entry is stored with its context snapshot (weather, humidity, city, moon,
zodiac). Slash commands are the only *active* surface. Two of them close the
loop between the user's raw data and the machine's compressed understanding:

| Command | Effect |
|---|---|
| `/system` | Lists every command the Log understands |
| `/story` | Compressed story of the last **day** |
| `/story week` · `/story month` · `/story year` | Same, over a longer window |

## 2. DATA FLOW

```
 LOT User data (Log rows + context metadata + mood/self-care events)
        │
        ▼
 [1] COMPRESSION      src/shared/utils/story-compression.ts  (pure, no I/O)
     buildStoryDigest() → StoryDigest → renderDigest()
        │
        ▼
 [2] QUANTUM INTENT   client sends quantumState + userIndex (QIE output)
        │
        ▼
 [3] AI VENDOR        POST /api/story → aiEngineManager 'together' (Together AI)
        │
        ▼
 [4] PERSONALIZED DATA STORED
     Log row event='generated_story', metadata { story, period, digest, quantumState }
        │
        ▼
 [5] RETURNED to the Log (appended under 📖 + Arcade rank line)
```

Compression happens **before** the vendor call: the vendor sees a digest
(counts, streaks, places, moods, pattern flags, ≤8 trimmed excerpts), not the
raw journal. This bounds prompt size and limits what leaves LOT.

## 3. COMPONENTS

| File | Role |
|---|---|
| `src/client/utils/logTriggers.ts` | Trigger detectors + `LOG_COMMANDS` registry + `renderSystemHelp()` |
| `src/shared/utils/story-compression.ts` | Period parsing, digest, spike detection, Arcade rank (pure) |
| `src/client/components/Logs.tsx` | Trigger effect, SYSTEM block, 📖 story block |
| `src/client/queries.ts` | `useStoryGeneration` (typed `period`, `rank`) |
| `src/server/routes/api.ts` (`POST /story`) | Windowed query, digest, prompt, persistence |
| `scripts/test-story-compression.ts` | Verification of the pure modules |

## 4. `/system`

`LOG_COMMANDS` is the **single source of truth**. `renderSystemHelp()` builds
the help text from it, grouped AI · STATE · SENSORY · NAVIGATION. Adding a
command = one registry entry + one `RULES` entry in `logTriggers.ts`.
Previously the help text was a hard-coded array inside `Logs.tsx` and could
drift from the detectors.

## 5. `/story`

### 5.1 Period parsing
`parseStoryPeriod(text)` reads `/story [day|week|month|year]` (aliases:
`today`, `weekly`, `monthly`, `yearly`). Default `day`. `stripStoryCommand()`
removes the command and 📖 so only the user's words are sent as `logText`.

The trigger fires the moment `/story` is typed, so the client waits **1.2 s**
and re-reads the editor value before parsing the period, letting
`/story week` finish typing.

### 5.2 Window
Server query: `createdAt >= now − window` (1 / 7 / 30 / 365 days), newest
first, hard cap 2 000 rows. Previously a fixed last-200 rows regardless of age.

### 5.3 Digest fields
`entryCount · activeDays · consistency · longestStreak · cities ·
avgTemperatureC · moods · moodShift · volumeTrend · peakDay · highlights`

**Pattern-change detection (follow-up hook):** the window is split in half.
`volumeTrend` = `rising` / `falling` when one half holds ≥ 1.5× + 1 the entries
of the other; `moodShift` = most common mood of first half ≠ second half.
These flags are what a future proactive follow-up ("detects a spike or a
pattern change") should key on; they are already persisted in
`generated_story.metadata.digest`.

Temperature is stored in either unit; values > 60 are treated as °F.

### 5.4 Access & limits
Usership-only (unchanged). Rate limit 5 / min (unchanged). Vendor failure
returns the quiet fallback string; nothing is persisted on failure.

## 6. ARCADE RANK

Self-care tech, arcade vocabulary. XP is **derived from lifetime Log events**,
never stored — a recompute can never disagree with history.

| Event | XP |
|---|---|
| `log_entry`, `journal` | 5 |
| `memory_answer`, `self_care_checkin` | 4 |
| `emotional_checkin`, `energy_checkin` | 3 |
| `generated_story` | 2 |

| XP ≥ | Rank |
|---|---|
| 0 | INSERT COIN |
| 50 | PLAYER ONE |
| 150 | COMBO KEEPER |
| 400 | HIGH SCORER |
| 900 | BOSS SLAYER |
| 2000 | ARCADE LEGEND |

`/story` shows `RANK · LVL n · XP · k TO NEXT` under the story. The model is
told rank is context only (one short clause at most) so the story stays about
the person, not the score. This is separate from the Badge Engine
(`src/client/utils/badges.ts`); unifying them is a future decision for S-2.

## 7. VERIFICATION

```
npx tsx scripts/test-story-compression.ts      # prints PASS
```
Covers period parsing/aliases, command stripping, windowing, mood shift,
volume trend, city/temperature aggregation, rank, trigger detection,
`/system` rendering.

**Not verified in this session:** full `tsc`/build and a live Together AI call
(no `node_modules`, no `TOGETHER_API_KEY` in the sandbox). The server edit is
confined to `POST /story`; run `yarn build` before deploy.

## 8. KNOWN LIMITS / NEXT

1. Morning proactive question (device or widget) is not implemented; it should
   consume `digest.volumeTrend` / `moodShift`.
2. Stories are regenerated per call; per-period caching would cut vendor cost.
3. `/story` still appends the story into the editor text (existing behavior).
4. Year window loads up to 2 000 rows; a SQL aggregate is the scaling path.
5. Arcade rank and Badge Engine are parallel systems.
