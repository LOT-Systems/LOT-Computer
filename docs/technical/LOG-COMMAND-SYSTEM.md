<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® LOG — COMMAND SYSTEM & STORY COMPRESSION (LCX-1)

## Classification: RESTRICTED // S-2 EYES
## Designation: LCX-1 · Log Compression Exchange, revision 1
## Effective: 2026-11-23 · Authority: S-2 // VADIK MARMELADOV

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT® LOG — FIELD SPECIFICATION                                  ║
║  /system · /story [day|week|month|year] · /arcade                ║
║  Pipeline: USER DATA → QIE COMPRESSION → TOGETHER AI → LEDGER    ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 0. BLUF (Bottom Line Up Front)

1. **`/system`** lists every Log command. It renders from one registry
   (`COMMAND_REGISTRY`), so the help screen cannot drift from what the
   commands actually do.
2. **`/story`** returns a compressed story of the operator's recorded
   period. Horizons: `day`, `week` (default), `month`, `year`. Each is a rolling window.
3. A deterministic **Quantum Intent Engine compression stage** runs first.
   It turns raw logs plus context snapshots into a bounded `StoryDigest`
   (counts, environment, peaks, rhythm, mood drift, follow-up). Together AI
   only ever sees that digest. It never sees raw history.
4. **Recursive compression:** a `month` story is given the `week`
   stories inside its window, and a `year` story is given the `month`
   stories. Each loop compresses the previous one.
5. **`/arcade`** shows rank, level, XP and streak. XP is earned only for
   showing up and is never taken away.
6. **Defect fixed:** before this change, `/story` filtered journal rows on the event names
   `log_entry` / `journal`. The Log writes `note`, so **the user's journal never
   reached their story**. LCX-1 includes `note`.

---

## 1. DOCTRINE

| # | Principle | Enforcement |
|---|-----------|-------------|
| D1 | **Passive AI UI.** The Log never prompts. The operator writes, and the machine records. | Commands are opt-in tokens inside an ordinary entry. |
| D2 | **Every click is a snapshot.** Each entry carries context (time, weather, humidity, city, moon, zodiac, rokuyo). No photo, no audio. | `getLogContext()` in `src/server/utils/logs.ts` |
| D3 | **The machine asks first, and only when it has a reason to.** | `followUpQuestion()` returns a question only on a spike or a drift. Otherwise `null`. |
| D4 | **Rules before models.** Peaks and spikes are computed by code we own. | `compressLogs()` is pure and deterministic |
| D5 | **Minimum disclosure to the vendor.** | Only `renderDigestBlock()` text is sent. It contains no IDs, emails or raw timestamps. |
| D6 | **Never fail silent, never lie.** | `fallbackStory()` builds a story from digest facts only |
| D7 | **Self-care, not a leaderboard.** | Arcade XP never decreases. A broken streak resets only the streak counter. |
| D8 | **The machine doesn't eat its own words.** | `stripMachineOutput()` removes 📖/🕯 blocks before compression |

---

## 2. PIPELINE

```
 ┌──────────────────────┐   every click / entry
 │  LOT USER DATA       │   Log rows: note, emotional_checkin,
 │  (Log + context)     │   memory_answer, energy_checkin, ...
 └──────────┬───────────┘   + context snapshot per row (D2)
            │  POST /api/story { logText, horizon, quantumState, userIndex }
            ▼
 ┌──────────────────────┐   src/shared/utils/log-compression.ts
 │  LOT QUANTUM INTENT  │   compressLogs(logs, horizon, now) → StoryDigest
 │  ENGINE — LCX-1      │     · window filter (rolling)
 │  (deterministic)     │     · journal sampling (even spread, newest kept)
 │                      │     · environment aggregation
 │                      │     · peaks ▲/▼  · rhythm  · mood drift
 │                      │     · followUp question (or null)
 └──────────┬───────────┘   + child-horizon stories (recursive loop)
            │  renderDigestBlock(digest)  — bounded text, no PII
            ▼
 ┌──────────────────────┐   aiEngineManager.getEngine('together')
 │  AI VENDOR PROCESSOR │   generateCompletion(prompt, 512 | 768)
 │  (Together AI)       │   on failure / empty → fallbackStory(digest)
 └──────────┬───────────┘
            ▼
 ┌──────────────────────┐   Log row event = 'generated_story'
 │  LOT PERSONALIZED    │   metadata: { horizon, engine, digest, ... }
 │  DATA STORED         │   → feeds the next horizon up (week→month→year)
 └──────────────────────┘   → GET /api/story/latest?horizon=…
```

---

## 3. COMMAND REFERENCE

Source of truth: `src/client/utils/logTriggers.ts` → `RULES` (detection) and
`COMMAND_REGISTRY` (presentation). `missingFromRegistry()` must return `[]`.

| Group | Command | Aliases | Effect |
|-------|---------|---------|--------|
| NARRATIVE | `/story [day\|week\|month\|year]` | `📖` | Compressed story (default `week`) |
| NARRATIVE | `/arcade` | `/level` `/xp` | Rank / level / XP / streak readout |
| NARRATIVE | `/prayer` | `/candle` `🕯️` | Contextual scripture |
| INTELLIGENCE | `/qi [query]` | — | Quantum Intelligence RFI |
| INTELLIGENCE | `/scan` | `/ai` | System status overview |
| INTELLIGENCE | `/qos` | `/os-report` | Quantum OS state |
| INTELLIGENCE | `/assembly` | `/assemble` | Self-assembly directive |
| INTELLIGENCE | `/phys` | `/cohort-report` | Physiological cohort report |
| INTELLIGENCE | `/sil` | `/silence-check` | Signal silence check |
| SELF-CARE | `/how` | — | Opens LOT AI check-in (System tab) |
| SELF-CARE | `/breathe` | `/breath` | 4-2-6 breathing |
| SELF-CARE | `/freeze` | `/pause` `🧊` | Pause and reflect |
| SELF-CARE | `/silent` | `/quiet` | Signal silence acknowledgement |
| SELF-CARE | `/fast` | — | Orthodox fasting calendar |
| SELF-CARE | `❗` | `‼️` | Cohort support flag |
| ENVIRONMENT | `/synth` | `/keyboard` `🎹` | Keyboard sound |
| ENVIRONMENT | `/radio` | `🎧` | Radio |
| ENVIRONMENT | `/night` | `🌙` | Dark mode |
| SYSTEM | `/system` | `/commands` | Command list |

**Detection rules** (unchanged from before):
- A keyword fires only as a whole token. `/storyteller` does not fire `/story`.
- **Delta-only.** `detectNewTriggers(text, prev)` fires a trigger only when it is new.
  Editing around an existing `/story` does not re-run it.

### 3.1 Adding a command (procedure)

1. Add the `LogTrigger` union member and the `RULES` row.
2. Add the `COMMAND_REGISTRY` row (group, usage, description).
3. Handle the trigger in the `NoteEditor` trigger effect (`Logs.tsx`).
4. Run `npx tsx scripts/verify-log-commands.ts`. The registry check fails if step 2 was skipped.

---

## 4. `/story` SPECIFICATION

### 4.1 Horizon

| Input | Horizon | Window | Journal samples | Word budget | Child stories fed |
|-------|---------|--------|-----------------|-------------|-------------------|
| `/story`, `📖`, `/story <unknown>` | week | 7 × 24 h | 10 | 180 | day (≤ 6) |
| `/story day` · `today` · `d` | day | 24 h | 8 | 120 | — |
| `/story week` · `w` | week | 7 × 24 h | 10 | 180 | day |
| `/story month` · `m` | month | 30 × 24 h | 12 | 220 | week |
| `/story year` · `y` | year | 365 × 24 h | 14 | 260 | month |

Windows are **rolling** and end at request time. Calendar-aligned buckets would need the user's
time zone on every boundary. Rolling windows avoid that. Hour-of-day and active-day
counting still use the local wall clock from `context.date`.

### 4.2 StoryDigest (contract)

```ts
interface StoryDigest {
  horizon: 'day' | 'week' | 'month' | 'year'
  windowStart: string; windowEnd: string            // ISO
  counts: { total, journal, moods, selfCare, activeDays }
  journal: string[]                                  // ≤ cap, 180 chars each, commands stripped
  moods: { state, count }[]                          // most frequent first
  selfCare: string[]                                 // "question: answer", last 8
  environment: { tempC{min,max,avg} | null, humidityAvg, cities[≤5], weather, moonPhase, zodiac }
  timeOfDay: { night, morning, afternoon, evening }  // intentional acts only
  peaks: StoryPeak[]                                 // ≤ 1 high + ≤ 1 low
  rhythm: 'surge' | 'steady' | 'quiet' | 'silent'
  moodDrift: 'rising' | 'falling' | 'stable' | 'unknown'
  followUp: string | null
}
```

### 4.3 Peak scoring

| Source | Score |
|--------|-------|
| Mood check-in | `round(valence × intensity/5 × 2.5)`. Valence is −2…+2 (table `MOOD_VALENCE`). Intensity defaults to 5. |
| Journal entry | `2 × (high-lexicon hits − low-lexicon hits)`, ±1 for `!!`, clamped to ±10 |

The strongest positive score becomes **▲ HIGH** and the strongest negative becomes **▼ LOW**. Each
peak carries its own context line (for example `2°C · 60% · clear sky · Brooklyn · Waxing Gibbous`),
so the story can say *where* and *under what sky* the peak happened.

### 4.4 Spike / pattern-change signals

| Signal | Rule |
|--------|------|
| `rhythm` | Compares the event rate in the last ¼ of the window with the first ¾. Ratio ≥ 2 → `surge`. Ratio ≤ 0.34 → `quiet`. No events → `silent`. |
| `moodDrift` | Compares mean valence of the 2nd half of mood check-ins with the 1st half. Δ ≥ +0.75 → `rising`. Δ ≤ −0.75 → `falling`. Fewer than 4 check-ins → `unknown`. |
| `followUp` | Priority: falling + low peak → quiet with entries → surge → rising. Otherwise `null` (stay silent). |

### 4.5 API

| Method | Path | Body / Query | Returns |
|--------|------|--------------|---------|
| POST | `/api/story` | `{ logText, horizon?, quantumState?, userIndex? }` | `{ story, logId, horizon, header, followUp }` |
| GET | `/api/story/latest` | `?horizon=day\|week\|month\|year` (optional) | `{ story, horizon, createdAt, engine, digest }` |
| POST | `/api/arcade` | `{}` | `{ xp, level, rank, nextLevelXp, progress, streakDays, lastActiveDay, report }` |

- `/api/story` is **Usership-gated** (403 otherwise) and rate-limited to 5/min.
- If `horizon` is absent, the server parses it from `logText`, so older clients still work.
- With an empty window the vendor call is **skipped** (`engine: 'fallback'`). That saves tokens and gives an honest reply.
- Stories persisted before LCX-1 have no `horizon`. `/story/latest` treats them as `week`.

### 4.6 Persisted record

```
Log {
  event: 'generated_story',
  text: <story>,
  context: <snapshot at generation>,
  metadata: {
    story, horizon, engine: 'together' | 'fallback', logText, quantumState,
    digest: { windowStart, windowEnd, counts, rhythm, moodDrift, peaks, environment, followUp },
    childStoriesUsed, timestamp
  }
}
```

### 4.7 Client behaviour (Log)

- The result renders in the `📖` block: a header strip (`STORY WEEK · N ENTRIES · N DAYS · RHYTHM`,
  then `▲ HIGH  ▼ LOW`), the story, and `→ followUp` if there is one.
- The story is appended to the entry through `toMachineBlock('📖', story)`. That gives one contiguous
  block with no inner blank lines. `stripMachineOutput()` removes everything from a 📖/🕯 line up to the
  next blank line, so later compressions never re-ingest machine text.
  - **Operator note:** text typed *directly* under a 📖 block with no blank line in between is
    treated as part of that block. Leave a blank line first.

---

## 5. ARCADE — GAMIFIED EVOLUTION

LOT is a self-care company. The Arcade layer rewards **presence**, not
performance.

| Event | XP |
|-------|----|
| Journal entry (`note`), excluding command-only entries | 10 |
| Mood check-in | 5 |
| Self-care / memory answer | 5 |
| Generated story (loop closed) | 15 |

**Curve:** level *n* needs `50·n·(n−1)` cumulative XP (L2 = 100, L3 = 300, L4 = 600,
L10 = 4 500).

| Level ≥ | Rank |
|---------|------|
| 1 | SIGNAL |
| 3 | OPERATOR |
| 6 | NAVIGATOR |
| 10 | ARCHIVIST |
| 15 | CARTOGRAPHER |
| 21 | STEWARD |
| 28 | ORACLE |
| 36 | SAGE |

**Streak:** consecutive active days that end today or yesterday. Days are local when
`context.date` exists, otherwise UTC.

```
RANK            OPERATOR
LEVEL           3
XP              340 / 600
PROGRESS        ███░░░░░░░░░░░░░░░░░
STREAK          4 DAYS
RULE            PRESENCE EARNS XP · NOTHING IS EVER TAKEN AWAY
```

The Arcade readout is separate from the Badge Codex (`src/client/utils/badges.ts`,
843 badges as of v33). Badges are discrete unlocks. Arcade is a continuous measure.

---

## 6. VERIFICATION

```
npx tsx scripts/verify-log-commands.ts      # 25 checks, exits non-zero on failure
npx tsc --noEmit -p tsconfig.server.json    # server typecheck
yarn build                                  # client + server production build
```

The checks cover trigger detection, registry completeness, horizon parsing, command and
machine-output stripping, the `note` regression, window bounds, peaks, drift and follow-up,
environment aggregation, PII-free digest text, fallback honesty, sampling caps, the XP curve,
ranks, and the rule that command-only entries earn no XP.

---

## 7. FILE MAP

| File | Role |
|------|------|
| `src/shared/utils/log-compression.ts` | LCX-1 engine: horizons, compression, peaks, rhythm, drift, follow-up, prompt render, fallback, Arcade |
| `src/client/utils/logTriggers.ts` | Trigger detection + `COMMAND_REGISTRY` + `renderSystemHelp()` |
| `src/client/components/Logs.tsx` | NoteEditor trigger effect: `/system`, `/story`, `/arcade` rendering |
| `src/client/queries.ts` | `useStoryGeneration` (with `horizon`), `useArcadeReport` |
| `src/server/routes/api.ts` | `POST /story`, `GET /story/latest`, `POST /arcade` |
| `scripts/verify-log-commands.ts` | Verification suite |

---

## 8. KNOWN LIMITS / NEXT ACTIONS

| ID | Item | Priority |
|----|------|----------|
| N1 | Scheduled job to write `day` stories nightly, so `week`/`month`/`year` always have child chapters (today they appear only when the operator runs `/story day`). | HIGH |
| N2 | Surface `followUp` as the next morning question (Memory Engine Mode 3) instead of only inline. | HIGH |
| N3 | Lexicon peaks are English-only. Replace with an engine-side valence score once one is validated. | MED |
| N4 | `POST /api/story/:id/export` (robot / vehicle / dashboard), per the Product Brief. | MED |
| N5 | Arcade XP is recomputed on each call (≤ 20 000 rows). Cache it in user metadata if latency shows up. | LOW |
