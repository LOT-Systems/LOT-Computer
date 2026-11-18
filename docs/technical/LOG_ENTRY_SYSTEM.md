# LOT Log Entry System — Field Manual

## Classification: RESTRICTED // S-2 EYES

**Author:** LOT Systems Corporation
**S-2:** Vadik Marmeladov
**Date:** 18 November 2026
**Status:** OPERATIONAL
**Module:** Log Compression Engine `LCE-1`
**AI vendor:** Together AI (via `aiEngineManager.getEngine('together')`)
**Session report:** [`docs/LOT-SR-20261118-LOG-01.md`](../LOT-SR-20261118-LOG-01.md)

---

## 1. Doctrine

The Log is a **passive AI surface**. The operator writes. The machine does not
prompt, does not interrupt, does not ask "how was your day?" inside the Log.
Every entry is stamped with the moment it was written — time, temperature,
humidity, sky, city, moon phase, zodiac hour — without a photo and without a
sound recording. The context is the snapshot.

The machine speaks only when invoked (slash command) or when it detects a spike
or a pattern change worth a follow-up. Even then it **asks first** — via the
morning question on a device or a widget — never a lecture in the Log.

```
  WRITE ──► SNAPSHOT ──► COMPRESS ──► STORY ──► QUESTION ──► WRITE
  (user)    (context)    (LCE-1)      (AI)      (one line)   (user)
                 ▲                                              │
                 └──────────────── the loop tightens ───────────┘
```

Each loop compresses the operator further. The story the machine returns is a
compression of the person's own records; the closing question is the seed of
the next entry.

---

## 2. Command Surface

All commands are typed **inside a Log entry**. Detection is in
`src/client/utils/logTriggers.ts` (`detectNewTriggers`). Commands fire once per
appearance — editing around an existing command does not re-fire it.

### 2.1 Registry — single source of truth

`LOG_COMMANDS` in `logTriggers.ts` is the authoritative list. `/system` renders
it via `formatSystemHelp()`. **Rule:** any new `RULES` trigger must add a row to
`LOG_COMMANDS` in the same commit, or `/system` will lie.

| Group        | Command        | Effect                                          |
|--------------|----------------|-------------------------------------------------|
| NARRATIVE    | `/story`       | Compressed story of the last 7 days (default)   |
| NARRATIVE    | `/story day`   | Compressed story of the last 24 hours           |
| NARRATIVE    | `/story week`  | Compressed story of the last 7 days             |
| NARRATIVE    | `/story month` | Compressed story of the last 30 days            |
| NARRATIVE    | `/story year`  | Compressed story of the last 365 days           |
| NARRATIVE    | `/prayer`      | Contextual scripture                            |
| INTELLIGENCE | `/qi [query]`  | Quantum Intelligence RFI                        |
| INTELLIGENCE | `/scan`        | System status overview                          |
| INTELLIGENCE | `/qos`         | Quantum OS state analysis                       |
| INTELLIGENCE | `/assembly`    | Self-assembly module status                     |
| INTELLIGENCE | `/phys`        | Physiological cohort report                     |
| SELF-CARE    | `/breathe`     | 4-2-6 breathing exercise                        |
| SELF-CARE    | `/freeze`      | Pause-and-reflect protocol                      |
| SELF-CARE    | `/silent`      | Signal silence check                            |
| SELF-CARE    | `/fast`        | Orthodox fasting calendar                       |
| ENVIRONMENT  | `/synth`       | Toggle keyboard sound                           |
| ENVIRONMENT  | `/radio`       | Toggle radio                                    |
| ENVIRONMENT  | `/night`       | Dark mode                                       |
| NAVIGATION   | `/how`         | Open LOT AI check-in (System tab)               |
| NAVIGATION   | `/system`      | This help screen                                |

Period aliases accepted by `/story`: `d today daily` · `w weekly` ·
`m monthly` · `y yearly annual`. Unknown argument → `week`.
`📖` emoji is equivalent to `/story`.

---

## 3. `/story` Pipeline

```
 ┌─────────────────────────┐
 │ LOG ENTRY  "/story m"   │  Logs.tsx — parseStoryPeriod() → 'month'
 └────────────┬────────────┘
              │ POST /api/story { logText, period, quantumState, userIndex }
              ▼
 ┌─────────────────────────┐
 │ USERSHIP GATE           │  403 for non-Usership operators
 └────────────┬────────────┘
              ▼
 ┌─────────────────────────┐
 │ WINDOW QUERY            │  Log.findAll createdAt ≥ now − period
 │                         │  excludes generated_story, limit 3000
 └────────────┬────────────┘
              ▼
 ┌─────────────────────────┐
 │ LCE-1 compressLogs()    │  totals · moods · valence · rhythm · context
 │ (pure, shared)          │  peaks ▲▼ · spikes · followUps · excerpts
 └────────────┬────────────┘
              ▼
 ┌─────────────────────────┐
 │ QIE STATE MERGE         │  quantumState (energy/clarity/alignment)
 │                         │  + userIndex (overall/trend) from client
 └────────────┬────────────┘
              ▼
 ┌─────────────────────────┐
 │ TOGETHER AI             │  buildStorySystemPrompt(period)
 │                         │  + compressionToPromptBlock()
 │                         │  tokens: day/week 512 · month 700 · year 900
 └────────────┬────────────┘
              │  on failure / empty ─► localStory(compression)
              ▼
 ┌─────────────────────────┐
 │ PERSIST                 │  Log event 'generated_story'
 │                         │  metadata: story, period, source,
 │                         │  compression, chronicle, quantumState
 └────────────┬────────────┘
              ▼
 ┌─────────────────────────┐
 │ RENDER (Logs.tsx)       │  📖 block: LCE header → story → chapter/rank
 │                         │  story appended to entry as "📖 …"
 └─────────────────────────┘
```

### 3.1 Data minimisation

The AI vendor never receives raw log history. It receives only the
compression: counts, mood distribution, valence numbers, top-3 context values,
up to 4 peak excerpts (≤120 chars), up to 6 journal excerpts (≤200 chars), up to
5 self-care answers. No email, no user id, no name. The server log line records
the user id and counts only — never text.

### 3.2 Response contract

```ts
{
  story: string
  logId: string | null           // null only if persistence failed
  period: 'day'|'week'|'month'|'year'
  header: string                 // terminal-style LCE stats block
  source: 'ai' | 'local'         // local = deterministic fallback
  chronicle: { chapter, rank, glyph, xp, nextRank, chaptersToNext, bar }
  followUps: string[]            // pattern signals for later follow-up
}
```

Rate limit: 5 req / min / operator.

---

## 4. Log Compression Engine — LCE-1

File: `src/shared/utils/logCompression.ts` — pure, no DB, no DOM, clock
injected. Shared by server, client and tests.

### 4.1 Inputs counted

| Bucket       | Events                                                        |
|--------------|---------------------------------------------------------------|
| Journal      | `note`, `journal` (non-empty after `stripCommands`)            |
| Mood         | `emotional_checkin` with `metadata.emotionalState`             |
| Self-care    | `memory_answer`, `self_care_checkin`, `energy_checkin`, `answer` |
| Context      | every record in window (`context.*`)                          |

`stripCommands()` removes slash commands and any paragraph previously
appended by the machine (`📖`, `🕯️`) so the machine never compresses its own
output back into the operator's story.

### 4.2 Valence model

Signed score in `[-1, 1]`.

- **Mood check-in (authoritative):** `MOOD_VALENCE[state]` scaled by
  intensity: `scale = 0.5 + min(intensity,10)/20` (intensity 10 → ×1.0,
  intensity 1 → ×0.55). No intensity → ×1.0.
- **Journal text (fallback):** small transparent lexicon,
  `(pos − neg) / (pos + neg)`; `null` if no signal words.

The model is deliberately crude. LCE only needs to *locate* peaks; the AI
vendor supplies nuance.

### 4.3 Peaks

- **High:** valence ≥ +0.5, top 2 by value.
- **Low:** valence ≤ −0.5, top 2 by value.
- Each peak carries its timestamp, excerpt and a context line
  (`18°C · Lisbon · Waxing Gibbous`) so the story can say *where* and *under
  what sky* it happened.

### 4.4 Pattern change (follow-up signals)

| Signal               | Condition                                              |
|----------------------|--------------------------------------------------------|
| `VALENCE DROP`       | ≥4 scored records and second-half mean − first-half ≤ −0.4 |
| `VALENCE RISE`       | same, shift ≥ +0.4                                     |
| `SPIKE YYYY-MM-DD`   | ≥3 active days, day has ≥3 entries and ≥2× baseline (not for `day`) |
| `LOWS WITHOUT HIGHS` | at least one low peak and zero highs                   |

These are stored in `metadata.compression.followUps` on the
`generated_story` record. They are the hook for the machine to "ask first"
later (morning question / widget) — see §7.

### 4.5 Rhythm

Phase of day per record, computed in the operator's `context.timeZone`
(the server runs UTC): `NIGHT 22–05 · DAWN 05–09 · MORNING 09–12 · MIDDAY
12–14 · AFTERNOON 14–18 · EVENING 18–22`.

### 4.6 Context aggregation

Temperatures arrive in °F and are reported in °C. Top-3 cities, weather
descriptions, moon phases; top-2 western zodiac signs.

### 4.7 Local fallback story

`localStory()` is deterministic: volume + place + time of day, air and moon,
dominant mood, one high quote, one low quote, the tone shift, and a closing
question. Empty window → *"Nothing was recorded … What is one thing you
noticed today?"*. The operator never sees an error string.

---

## 5. Arcade Layer — The Chronicle

LOT is a self-care company. The arcade layer rewards *closing chapters*, never
streak pressure: skipping a week costs nothing, nothing decays.

Each `/story` closes one **chapter**. XP is weighted by period:

| Period | XP |
|--------|----|
| day    | 1  |
| week   | 3  |
| month  | 8  |
| year   | 30 |

Legacy `generated_story` records without a period count as a week (3 XP).

| Rank        | From chapter | Glyph |
|-------------|--------------|-------|
| SCRIBE      | 1            | `[.]` |
| CHRONICLER  | 5            | `[:]` |
| ARCHIVIST   | 15           | `[#]` |
| LOREKEEPER  | 40           | `[§]` |
| MYTHWRIGHT  | 100          | `[∞]` |

Rendered under the story:

```
CHAPTER 7 · [:] CHRONICLER · 24 XP [██░░░░░░░░] 8 TO ARCHIVIST
```

The Chronicle is independent of the Badge Codex (`src/client/utils/badges.ts`,
843 badges at v33); a future codex version may mint badges on rank promotion.

---

## 6. Verification

```bash
npx tsx scripts/tests/test-log-compression.ts   # 13 checks, exits 1 on failure
npx tsc --project tsconfig.server.json --noEmit # 0 errors
npm run build                                   # client + server green
```

Test coverage: period parsing and aliases; trigger detection (`/storyline`
does not fire); `/system` registry completeness and no duplicate rows;
command stripping; lexicon valence; window filtering; `note` events counted;
peak detection with context; valence-drop follow-up; °F→°C; day-window
narrowing; spike detection; local story grounding; chronicle ladder.

---

## 7. Known Limits / Next Orders

1. **Follow-up delivery.** `followUps` are stored but not yet routed into the
   Memory Engine morning question. Next: have the Memory Engine read the latest
   `generated_story.metadata.compression.followUps` when building its prompt.
2. **Scheduled compression.** Stories are on-demand only. Next: a nightly job
   compressing `day` for active operators and a Sunday job for `week`, stored
   silently, surfaced as a widget prompt ("Your week is ready").
3. **Lexicon.** English only. Russian/Japanese journals score `null`
   (neutral) — peaks then come only from mood check-ins.
4. **Year window** caps at 3000 records; extremely active operators get the
   most recent 3000.
5. **Calendar windows.** Periods are rolling (last 24h / 7d / 30d / 365d), not
   calendar day/week/month.

---

## 8. File Map

| File | Role |
|------|------|
| `src/shared/utils/logCompression.ts` | LCE-1 engine, prompt builder, local story, Chronicle rank |
| `src/client/utils/logTriggers.ts` | Trigger detection + `LOG_COMMANDS` registry + `formatSystemHelp()` |
| `src/client/components/Logs.tsx` | Trigger dispatch, `/story` period parse, 📖 / SYSTEM: render |
| `src/client/queries.ts` | `useStoryGeneration` request/response types |
| `src/server/routes/api.ts` | `POST /api/story` |
| `scripts/tests/test-log-compression.ts` | LCE-1 self-test |
