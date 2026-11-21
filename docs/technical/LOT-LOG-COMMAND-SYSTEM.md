<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® LOG — COMMAND SYSTEM & STORY COMPRESSION
## Field Manual · Technical Order LOT-TO-LOG-001 · Rev A · 2026-11-21

```
╔══════════════════════════════════════════════════════════════════╗
║  CLASSIFICATION   INTERNAL // ENGINEERING                         ║
║  SUBSYSTEM        LOG (JOURNAL) · PASSIVE AI UI                   ║
║  COMMANDS         /system · /story [day|week|month|year]          ║
║  AUTHORITY        S-2 // VADIK MARMELADOV                         ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 0. MISSION STATEMENT

The Log is a passive AI interface. The operator writes; the machine does not
interrupt with prompts. Every entry is stored with an **environment snapshot**
(time, timezone, city, country, temperature, humidity, weather, moon phase,
zodiac/rokuyo) — a record of the moment without a photo or a sound.

Two commands give the operator an explicit handle on the machine:

| Command | Function |
|---|---|
| `/system` | Prints the full command index inside the Log. |
| `/story [day\|week\|month\|year]` | Compresses the operator's data for the period into a digest + narrative and writes it back into the Log. |

The compressed story is the return leg of the LOT® AI loop:

```
 LOT USER DATA ──► STORY COMPRESSION ──► QUANTUM INTENT ──► AI VENDOR ──► LOT PERSONALIZED
 (Log, moods,      ENGINE (pure,          ENGINE STATE       (Together AI)   DATA STORED
  self-care,        deterministic)        (energy/clarity/                   (generated_story
  context)                                 alignment)                         log + digest)
        ▲                                                                       │
        └───────────────── operator reads story, answers its closing question ◄─┘
```

---

## 1. COMPONENT MAP

| # | File | Role |
|---|---|---|
| 1 | `src/shared/utils/storyCompression.ts` | **Story Compression Engine.** Pure functions: scope parsing, digest, peaks, spikes, Arcade XP, rendering, deterministic narrative, AI prompt block. Shared by client + server. |
| 2 | `src/client/utils/logTriggers.ts` | Trigger detection (`RULES`) + **`LOG_COMMANDS` registry** + `renderSystemHelp()`. Single source of truth for `/system`. |
| 3 | `src/client/components/Logs.tsx` | NoteEditor wiring: `/system` render, `/story` scope-aware debounced fire, digest + story blocks, append to entry. |
| 4 | `src/client/queries.ts` | `useStoryGeneration` — request `{ logText, scope, quantumState, userIndex }`, response `{ story, logId, scope, digest[] }`. |
| 5 | `src/server/routes/api.ts` → `POST /api/story` | Loads windowed logs, compresses, prompts Together AI, persists `generated_story`. |
| 6 | `scripts/tests/story-compression.test.ts` | 12-check verification grid for the engine. |
| 7 | `scripts/tests/log-commands.test.ts` | Registry parity grid (every trigger must appear in `/system`). |

---

## 2. `/system` — COMMAND INDEX

### 2.1 Behaviour
Typing `/system` (alias `/commands`) anywhere in a Log entry renders the
command index under the editor. Output is generated from `LOG_COMMANDS`, so the
index can never drift from the trigger table again (prior to Rev A it was a
hand-maintained string array and had already drifted — `/sil` was missing).

### 2.2 Output (verbatim)
```
LOT® LOG — COMMAND INDEX

[ AI ]
/story [day|week|month|year]  Compressed story of your period (default week)
/qi [query]                   Ask the Quantum Intelligence engine
/prayer                       Contextual scripture
/how                          Open LOT AI check-in (System tab)

[ SYSTEM ]
/scan                         System status overview
/assembly                     Self-assembly module status
/qos                          Quantum OS state analysis
/phys                         Physiological cohort report
/sil                          Signal silence pattern check
/system                       This command index

[ CARE ]
/breathe                      4-2-6 breathing exercise
/freeze                       Pause and reflect protocol
/silent                       Signal silence acknowledgement
/fast                         Orthodox fasting calendar

[ AMBIENT ]
/synth                        Toggle keyboard sound (🎹)
/radio                        Toggle radio (🎧)
/night                        Dark mode (🌙)

[ SIGNALS ]
❗ / ‼️                        Cohort support flag

SHORTCUTS
Ctrl+Enter                    Save log immediately
```

### 2.3 Adding a command — Standard Operating Procedure
1. Add the trigger literal to `LogTrigger` and a rule to `RULES` (`logTriggers.ts`).
2. Add a `LogCommandSpec` to `LOG_COMMANDS` (TypeScript enforces this — the
   record is keyed by `Exclude<LogTrigger, 'cohort-support'>`).
3. Handle the trigger in the NoteEditor effect in `Logs.tsx`.
4. Run `npx tsx scripts/tests/log-commands.test.ts` → must be GREEN.

---

## 3. `/story` — COMPRESSED NARRATIVE

### 3.1 Syntax
```
/story              → WEEK  (default)
/story day          → last 24 h      aliases: today, daily, d
/story week         → last 7 days    aliases: weekly, w, 7d
/story month        → last 30 days   aliases: monthly, m, 30d
/story year         → last 365 days  aliases: yearly, annual, y, 365d
📖                  → same as /story
```
Unknown arguments fall back to WEEK; `/story weekend plans` keeps
"weekend plans" as entry text (scope regex is word-bounded).

### 3.2 Fire timing (scope debounce)
Trigger detection runs on every keystroke and fires the instant `/story`
is typed. Rev A **arms a 1 200 ms timer instead of firing**, and re-arms it on
each keystroke. The request leaves only after the operator stops typing, so
the scope argument is read from the final text. Timer is cleared on unmount.

### 3.3 Server pipeline — `POST /api/story`
| Step | Action |
|---|---|
| 1 | Gate: `usership` tag required (403 otherwise). |
| 2 | Validate `scope` ∈ {day, week, month, year}; default week. |
| 3 | Query `Log` where `createdAt ≥ windowStart`, event ∈ {note, emotional_checkin, answer, self_care, memory_answer, self_care_checkin, energy_checkin}, limit 3 000. |
| 4 | `compressLogs()` → `StoryDigest`. |
| 5 | If any data: prompt Together AI with `digestToPromptBlock()` + Quantum Intent state. Word budget scales with scope (60–120 … 180–260). |
| 6 | On vendor failure or empty output: `narrateDigest()` — a deterministic story built from the operator's own excerpts. |
| 7 | Persist `generated_story` log: `metadata = { story, scope, engine, digest, logText, quantumState, timestamp }`. |
| 8 | Return `{ story, logId, scope, digest: formatDigest(...) }`. |

Rate limit: 5 req/min/user (unchanged).

### 3.4 Defect corrected in Rev A
The previous handler filtered journal entries by `event === 'log_entry' || 'journal'`.
Neither event exists — journal entries are `note`. **`/story` was never reading the
operator's journal.** It now reads `note` events, within a time window, rather than
"last 200 logs of any type".

### 3.5 Prompt doctrine
- Second person. Only events present in the digest — no invention.
- Name the high and low peak plainly; no diagnosis.
- Mention at most one pattern spike as a quiet observation.
- **End with one question** the operator can answer in their next entry —
  "the machine asks first", closing the loop.

---

## 4. STORY COMPRESSION ENGINE — SPECIFICATION

### 4.1 Event classes
| Class | Events | Use |
|---|---|---|
| Journal | `note` (non-empty text) | count, words, threads, text valence, excerpts |
| Mood | `emotional_checkin` (`metadata.emotionalState`) | mood histogram, valence |
| Self-care | `answer`, `self_care`, `memory_answer`, `self_care_checkin`, `energy_checkin` | count, active days |
| Excluded | `generated_story` | prevents the loop from feeding on its own output |

### 4.2 Valence scale (−2 … +2)
| +2 | +1 | 0 | −1 | −2 |
|---|---|---|---|---|
| energized, excited, fulfilled, grateful | hopeful, content, calm, peaceful | uncertain | tired, restless, anxious | exhausted, overwhelmed |

Journal text valence: lexicon score `2·(pos−neg)/(pos+neg)`, `null` when no signal words.
Day valence = mean of all valences recorded that day.

### 4.3 Day key
`context.date` (operator-local ISO date stamped at write time) when present,
otherwise UTC date of `createdAt`.

### 4.4 Peaks
- **HIGH PEAK** — day with maximum valence; excerpt = that day's most positive entry.
- **LOW PEAK** — day with minimum valence (distinct from HIGH); excerpt = most negative entry.
- Single scored day: reported only as HIGH if ≥ 0, only as LOW if < 0.

### 4.5 Trend
Mean valence of second half of scored days minus first half:
`> +0.3 rising · < −0.3 falling · else steady` (needs ≥ 2 scored days).

### 4.6 Spikes — pattern-change detection
Requires ≥ 3 days. z-score per day; `|z| ≥ 1.5σ` flags:
`volume` (entries/day), `valence-high`, `valence-low`. Top 5 by |z|.
Spikes are the hand-off to the passive AI: a follow-up question is warranted
when a spike appears.

### 4.7 Environment aggregation
Dominant cities (by count), mean temperature °C (Kelvin auto-converted), mean
humidity, distinct moon phases, dominant weather descriptions.

### 4.8 Threads
Words ≥ 4 chars, stop-words removed, slash commands and URLs stripped,
frequency ≥ 2, top 8.

---

## 5. ARCADE — GAMIFIED EVOLUTION (SELF-CARE GRADE)

LOT is a self-care company, so the Arcade rewards **showing up**, not volume.
XP is derived from logs on every request — never stored, always reproducible.

### 5.1 XP rules
| Action | XP |
|---|---|
| Journal entry | 10 |
| Per 100 words | 5 |
| Mood check-in | 5 |
| Self-care event | 5 |
| Active day | 20 |
| Streak day (consecutive, ending today/yesterday) | 10 |

### 5.2 Ranks
| # | Rank | XP |
|---|---|---|
| 0 | INITIATE | 0 |
| 1 | OBSERVER | 100 |
| 2 | RECORDER | 300 |
| 3 | NAVIGATOR | 700 |
| 4 | ARCHIVIST | 1 500 |
| 5 | CARTOGRAPHER | 3 000 |
| 6 | SENTINEL | 6 000 |
| 7 | ORACLE | 12 000 |

Rank is **per scope** — a week of ORACLE is not possible; a year of it is.
`/story year` is therefore the operator's lifetime-grade Arcade card. The
existing Badge Codex (843 badges, `src/client/utils/badges.ts`) is unaffected;
the Arcade rank is a complementary, period-scoped read-out.

---

## 6. DIGEST TERMINAL GRID — SAMPLE

```
STORY           WEEK · 2026-11-14 → 2026-11-21
ENTRIES         3 · 19 WORDS
ACTIVE DAYS     4/7
CHECK-INS       2 MOOD · 1 SELF-CARE
VALENCE         +0.50 LIFTED · FALLING
DOMINANT MOOD   CALM
HIGH PEAK       2026-11-21 +2.00 HIGH
LOW PEAK        2026-11-19 -2.00 HEAVY
THREADS         COFFEE · WALK
ENVIRONMENT     NEW YORK · 13°C · 65%
MOON            WAXING
ARCADE          OBSERVER · 165 XP · 135 → RECORDER
STREAK          4 DAYS
```

The Log entry receives `📖 STORY · WEEK` followed by the narrative, so the story
survives editor remount and becomes part of the record.

---

## 7. VERIFICATION

```
npx tsx scripts/tests/story-compression.test.ts   # 12 checks
npx tsx scripts/tests/log-commands.test.ts        #  3 checks
yarn build                                        # client + server
```

| Gate | Rev A result |
|---|---|
| Story Compression grid | GREEN 12/12 |
| Command registry grid | GREEN 3/3 |
| `tsc -p tsconfig.server.json` | 0 errors |
| `tsc -p tsconfig.json` | 104 errors — all pre-existing, identical count before/after; 0 introduced |
| `yarn build` | EXIT 0 |
| Compiled ESM import `#shared/utils/storyCompression` | resolves |

---

## 8. FAILURE MODES

| Condition | Behaviour |
|---|---|
| Together AI down / timeout | Deterministic `narrateDigest()` from operator's own data; `metadata.engine = 'deterministic'`. |
| No data in window | No vendor call; "The record for this week is still blank…" |
| Non-usership user | 403 with explanatory story string. |
| DB write fails | Story still returned, `logId: null`. |
| Client network error | Existing fallback string appended. |

---

## 9. ROADMAP (NEXT ORDERS)

1. **Spike follow-up** — scheduled job runs `compressLogs(week)` nightly; on a
   `valence-low` spike, queue one morning question (System widget / LOT device).
2. **Hierarchical compression** — store weekly digests, build month/year from
   them instead of raw logs (bounded cost for `/story year`).
3. **Arcade card widget** — surface the year-scope rank beside the Badge Codex.
4. **Locale-aware lexicon** — Russian/Japanese valence words.

---
*END OF TECHNICAL ORDER LOT-TO-LOG-001 REV A*
