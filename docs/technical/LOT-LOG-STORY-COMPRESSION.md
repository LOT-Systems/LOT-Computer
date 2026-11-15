# LOT® Log — Story Compression & Command System

## Classification: RESTRICTED // S-2 EYES

| Field       | Value                                                        |
|-------------|--------------------------------------------------------------|
| Document    | LOT-LOG-STORY-COMPRESSION                                    |
| Version     | 1.0                                                          |
| S-2         | Vadik Marmeladov                                             |
| Date        | 15 November 2026                                             |
| Status      | OPERATIONAL (branch `claude/youthful-ritchie-87xg48`)        |
| Engine      | Together AI (vendor processor) · deterministic fallback      |
| Supersedes  | `/story` v1 (single-paragraph, 10-row prompt, 2026-06-22)    |

---

## 1. Doctrine

1. **The Log is a passive AI UI.** The person writes. No prompt, no question
   box, no chatbot. Every entry is stored with its moment: time, weather,
   humidity, place, sky (moon phase, zodiac, rokuyo) — a snapshot without a
   photo or a sound.
2. **Click by click, context.** Every click on every widget is a row. Rows
   are signal. The Story Compression Engine (SCE) reads all of them.
3. **Compress, then send.** Raw rows never leave LOT. The SCE builds a
   *compression packet*; only the packet crosses to the AI vendor.
4. **The machine asks first.** Every story ends with exactly one follow-up
   question aimed at the strongest signal (low peak → activity spike → high
   peak → falling trend). The question is stored and becomes the next
   prompt in the loop.
5. **Never empty.** If the vendor is down, the SCE renders a deterministic
   story from the same packet. `/story` always answers.
6. **Arcade, not combat.** Evolution is gamified, but this is self-care:
   XP is earned by presence, ranks are names of growth.

---

## 2. Pipeline

```
 ┌──────────────────────┐   Log entry, check-in, self-care, widget click
 │ 1  LOT USER DATA     │   each row = text + metadata + LogContext
 └──────────┬───────────┘
            │  trailing 365 d, ≤ 5000 rows (event,text,metadata,context,createdAt)
            ▼
 ┌──────────────────────┐   compressLogs()  — PURE, deterministic
 │ 2  LOT QUANTUM INTENT│   horizon window · auto-widen · mood · valence ·
 │    ENGINE (SCE)      │   environment · themes · peaks · spikes · arcade
 └──────────┬───────────┘
            │  CompressionPacket (JSON, ≤ 2 excerpts of ≤ 120 chars)
            ▼
 ┌──────────────────────┐   buildStoryPrompt() → engine.generateCompletion()
 │ 3  AI VENDOR         │   Together AI, 640 tokens
 │    PROCESSOR         │   failure / < 40 chars → renderCompressedStory()
 └──────────┬───────────┘
            │  story + followUp
            ▼
 ┌──────────────────────┐   Log row  event=generated_story (metadata.packet)
 │ 4  LOT PERSONALIZED  │   user.metadata.compressedStories[horizon]
 │    DATA STORED       │   user.metadata.arcade
 └──────────────────────┘   story appended to the Log entry as "📖 …"
```

---

## 3. Command Surface

All commands are typed directly into a Log entry. `/system` renders the full
list from a single registry (`LOG_COMMANDS`, `src/client/utils/logTriggers.ts`)
— help can no longer drift from the code.

| Group        | Command        | Effect                                                    |
|--------------|----------------|-----------------------------------------------------------|
| NARRATIVE    | `/story` · 📖  | Compressed story of today; auto-widens if quiet           |
| NARRATIVE    | `/day`         | Compress last 24 h (exact, no widen)                      |
| NARRATIVE    | `/week`        | Compress last 7 d                                         |
| NARRATIVE    | `/month`       | Compress last 30 d                                        |
| NARRATIVE    | `/year`        | Compress last 365 d                                       |
| NARRATIVE    | `/prayer`      | Contextual scripture                                      |
| ENGINE       | `/scan` `/qi` `/qos` `/assembly` `/phys` | Unchanged                       |
| SELF-CARE    | `/breathe` `/freeze` `/silent` `/fast` `/how` | Unchanged                  |
| ENVIRONMENT  | `/synth` `/radio` `/night` | Unchanged                                     |
| ARCADE       | `/level` (`/arcade`, `/xp`) | Level, rank, XP bar, streak, next rank        |
| SYSTEM       | `/system` (`/commands`) | This list                                        |

### 3.1 Trigger mechanics (known constraint)

Triggers fire on the keystroke that completes the token (end-of-string
counts as a boundary). Consequence: `/story week` cannot be typed — `/story`
fires first. Horizons are therefore **separate tokens** (`/week`, not
`/story week`). Side effect: typing `/weekend` fires `/week` at `/week`.
This is pre-existing behavior for every command (e.g. `/fast` → `/faster`)
and is accepted; fixing it requires an Enter-to-commit model (see §9).

### 3.2 Re-fire guard

The story is appended to the entry as `📖 …`. Because 📖 is itself a story
trigger, `/week` + appended 📖 would have re-fired `story-mode`. The
mutation callbacks now set `lastTriggerScanRef.current = updated` before
`setValue`, marking the appended text as already scanned.

---

## 4. Compression Packet — Specification

`src/shared/utils/story-compression.ts` · `compressLogs(logs, horizon, now, opts)`

| Field                  | Derivation                                                            |
|------------------------|-----------------------------------------------------------------------|
| `horizon`              | Requested, or widened `day→week→month→year` until ≥ 2 journal entries (only when `autoWiden`) |
| `totals.snapshots`     | Every row in window (all clicks)                                      |
| `totals.journal`       | `note` / `journal` / `log_entry` rows with non-blank text             |
| `totals.words`         | Tokenized journal words (URLs and `/commands` stripped)               |
| `totals.activeDays`    | Distinct UTC days with a human (non-machine) row                      |
| `mood.dominant`        | Mode of `emotional_checkin.metadata.emotionalState`                   |
| `mood.sequence`        | Chronological, consecutive-deduped, last 8                            |
| `mood.valence`         | Mean of mood valence (±1) and non-zero lexicon valence of entries      |
| `mood.trend`           | 2nd-half mean − 1st-half mean > 0.2 → rising; < −0.2 → falling; ≥ 4 samples required |
| `environment.*`        | Temp min/max °C (Kelvin auto-converted), avg humidity, dominant weather, cities, moon phases, dominant zodiac |
| `themes`               | Top 5 words (≥ 4 chars, non-stopword, ≥ 2 entries)                    |
| `peaks`                | ≤ 1 high + ≤ 1 low journal entry by valence; excerpt ≤ 120 chars + context line |
| `spikes`               | Days with activity z-score ≥ 1.5 (≥ 3 active days), top 3             |
| `arcade`               | §5, computed over the full year                                       |

**Machine rows** (`generated_story`, `lot_ai_story`, `prayer_scripture`,
`qi_rfi`, `assembly_directive`, `scheduled_job`, `system_snapshot`, `ping`)
are excluded from voice, valence, spikes and XP — the machine must not
score its own words as the person's.

**Valence lexicon:** ~40 positive / ~40 negative tokens, single-word
negation (`not`, `don't`, `never`) flips polarity. Deliberately small and
auditable; it ranks peaks, it does not diagnose.

---

## 5. Arcade — Self-Care Evolution

| Action                         | XP                                   |
|--------------------------------|--------------------------------------|
| Journal entry                  | 10 + min(20, ⌊words / 10⌋) depth bonus |
| Self-care completion           | 8                                    |
| Check-in (emotional/energy)    | 6                                    |
| Intention                      | 5                                    |
| Any other click / snapshot     | 1                                    |
| Streak (consecutive days)      | 3 × streak length                    |

`xpForLevel(L) = 50 · (L − 1)²` — gentle quadratic. Rank advances every 3
levels:

```
Seed → Sprout → Keeper → Steward → Cartographer → Lantern →
Navigator → Elder → Sage → Constellation
```

`/level` output:

```
LEVEL           4 · STEWARD
XP              512 / 800
PROGRESS        ███████████░░░░░░░░░ 57%
STREAK          9 days
NEXT RANK       CARTOGRAPHER
```

---

## 6. API

### `POST /api/story` (Usership; rate limit 5/min)

Request:
```json
{ "logText": "…", "horizon": "week", "quantumState": { "energy": "…" }, "userIndex": { "overall": 72 } }
```
`horizon` optional. Omitted → parsed from `logText`, default `day`, auto-widen on.

Response:
```json
{
  "story": "…\nWhat would have made the low point lighter?",
  "header": "COMPRESSION     WEEK (widened from DAY)\nSNAPSHOTS …\nARCADE …",
  "horizon": "week",
  "followUp": "What would have made the low point lighter?",
  "arcade": { "xp": 512, "level": 4, "rank": "Steward", "nextLevelXp": 800, "progress": 0.57, "streakDays": 9 },
  "processor": "together",
  "logId": "…"
}
```
Non-Usership: `403` with the same shape (`story` = gating message).

### `POST /api/story/arcade` (authenticated, no AI call)

```json
{ "arcade": { … }, "nextRank": "Cartographer" }
```

---

## 7. Data Stored

| Location                                   | Content                                        |
|--------------------------------------------|------------------------------------------------|
| `logs` row, `event = generated_story`      | `text` = story; `metadata` = horizon, requestedHorizon, processor, followUp, **packet**, logText (≤ 500), quantumState |
| `users.metadata.compressedStories[h]`      | `{ text, followUp, at, processor }` — latest per horizon |
| `users.metadata.arcade`                    | Latest `ArcadeStatus`                          |
| Log entry text                             | `📖 <story>` appended (survives editor remount) |

The stored packet lets later jobs compare compressions across time
(day vs. week vs. month) without re-reading the archive.

---

## 8. Defects Corrected

| ID     | Defect                                                                 | Fix |
|--------|------------------------------------------------------------------------|-----|
| D-01   | `/story` v1 filtered journal rows by `log_entry`/`journal`; Log entries are stored as `note`. The story never saw the person's own words. | `JOURNAL_EVENTS` includes `note` |
| D-02   | `/story` v1 read last 200 rows only — no horizon, no year view.        | Trailing-year load, ≤ 5000 rows |
| D-03   | `/system` help was a hard-coded array, drifting from triggers.         | `LOG_COMMANDS` registry + `renderSystemHelp()` |
| D-04   | Appended `📖` could re-fire story from a horizon command.              | Re-fire guard (§3.2) |
| D-05   | Persist failure discarded a generated story.                           | Persistence wrapped; story still returned |

---

## 9. Verification

| Check                                           | Result |
|-------------------------------------------------|--------|
| `yarn test:story` (SCE unit checks)             | 9/9 PASS |
| `tsc -p tsconfig.server.json --noEmit`          | 0 errors |
| `tsc -p tsconfig.json --noEmit` (client)        | 104 errors — identical to baseline, 0 introduced |
| `yarn build` (client esbuild + css + server)    | PASS |
| Compiled `dist/server/shared/utils/story-compression.js` import | 13 exports OK |

Not verified in this session: live Together AI call and a browser pass on
the Log (no credentials / no running database in the build container).

---

## 10. Next Moves

1. **Enter-to-commit commands** — fire triggers on Enter / blur, unlocking
   `/story week` and arguments for every command.
2. **Morning question** — schedule a job that reads
   `compressedStories.day.followUp` and surfaces it as the morning
   Memory question on every device (incl. the LOT® computer).
3. **Spike follow-up job** — run `compressLogs(…,'week')` nightly; when a
   new spike or a low peak appears, write a follow-up into the Log.
4. **Compression ladder** — month story built from stored week packets,
   year from month packets (true recursive compression).
5. **Arcade badges** — bridge `ArcadeStatus` level-ups into the Badge
   Codex (`badge_unlock`).

---

*LOT Systems Corporation · Made in the USA · brand.lot-systems.com*
