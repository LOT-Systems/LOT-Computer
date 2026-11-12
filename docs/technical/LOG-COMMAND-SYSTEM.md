<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® LOG — COMMAND SYSTEM, STORY COMPRESSION & ARCADE EVOLUTION

```
CLASSIFICATION : RESTRICTED // S-2 EYES
DOCUMENT       : LOT-TECH-LOG-CMD-001
REVISION       : 1.0
DATE           : 2026-11-12
S-2            : VADIK MARMELADOV
STATUS         : OPERATIONAL — BUILD GREEN · 36/36 CHECKS PASS
SCOPE          : Log (Journal) slash commands · /system · /story · /level
```

---

## 1. MISSION

The Log is the passive AI surface of LOT®. The operator writes. No prompts,
no questions, no chat. Every entry is stored with the environmental snapshot
of its moment — city, temperature, humidity, sky, moon, zodiac — captured by
`getLogContext()` on the server. Click by click, entry by entry, the machine
accumulates context.

Slash commands are the operator's only direct line to the machine from inside
the Log. They are typed inline, never into a separate box, and their output is
rendered beneath the entry as a terminal block.

This document specifies three capabilities:

| ID   | COMMAND                          | FUNCTION                                                    |
|------|----------------------------------|-------------------------------------------------------------|
| C-1  | `/system`                        | Index of every command, generated from a single registry   |
| C-2  | `/story [day\|week\|month\|year]`  | Compressed narrative of a time window, peaks surfaced       |
| C-3  | `/level` · `/xp` · `/arcade`     | Arcade evolution — rank, XP, progress. Self-care safe.      |

---

## 2. DATA FLOW — DOCTRINE PIPELINE

```
 LOT USER DATA                    LOT QUANTUM INTENT ENGINE            AI VENDOR                 LOT STORE
 ─────────────                    ─────────────────────────            ─────────                 ─────────
 note (journal)        ┐
 emotional_checkin     │    ┌──────────────────────────────┐   ┌────────────────────┐   ┌──────────────────────┐
 self_care_checkin     ├──▶ │ compressLogs(logs, scope)    │──▶│ Together AI        │──▶│ Log event:           │
 energy_checkin        │    │  · window filter             │   │ prompt = packet    │   │  generated_story     │
 memory_answer         │    │  · rhythm / presence / run   │   │ ONLY facts allowed │   │ metadata: scope,     │
 + context on every    │    │  · mood valence, drift       │   └─────────┬──────────┘   │  source, header,     │
   record (city, °F,   │    │  · HIGH / LOW peaks + words  │             │ failure     │  compression packet  │
   humidity, moon …)   ┘    │  · field (place/weather/sky) │             ▼             │ + context snapshot   │
                            └──────────────┬───────────────┘   ┌────────────────────┐   └──────────────────────┘
 client quantum state ─────────────────────┘                   │ fallbackStory()    │
 (energy/clarity/alignment)                                    │ deterministic,     │
                                                               │ invents nothing    │
                                                               └────────────────────┘
```

The **compression packet** is the contract. The model never sees raw rows;
it receives a fixed-shape summary and is instructed to use nothing else. The
same packet drives the on-screen header and the offline story, so the three
outputs can never disagree.

---

## 3. C-1 — `/system`

### 3.1 Behaviour
Typing `/system` (alias `/commands`) anywhere in a Log entry renders the
`SYSTEM:` block with every command, grouped:

```
NARRATIVE
/story        Compressed story of your week
/story day    Compress the last 24 hours
/story month  Compress the last 30 days
/story year   Compress the last 365 days
/level        Arcade rank, XP and progress (/xp, /arcade)

INTELLIGENCE
/qi [query]   Ask the Quantum Intelligence engine
/scan         System status overview
/qos          Quantum OS state analysis
/phys         Physiological cohort report
/assembly     Self-assembly module status
/how          Open LOT AI check-in (System tab)

SELF-CARE
/breathe      4-2-6 breathing exercise
/freeze       Pause and reflect protocol
/silent       Signal silence check
/prayer       Generate contextual scripture
/fast         Orthodox fasting calendar

ENVIRONMENT
/synth        Toggle keyboard sound
/radio        Toggle radio
/night        Dark mode
/system       This command index

SHORTCUTS
Ctrl+Enter    Save log immediately
```

### 3.2 Single source of truth
Before this revision the help screen was a hand-typed string array inside
`Logs.tsx` and could drift from the trigger table. It is now generated:

| ARTIFACT                                  | ROLE                                              |
|-------------------------------------------|---------------------------------------------------|
| `src/client/utils/logTriggers.ts` `RULES` | What the parser detects                           |
| `src/client/utils/logTriggers.ts` `COMMAND_GROUPS` | What `/system` shows                     |
| `buildSystemHelp()`                       | Renders `COMMAND_GROUPS` to the block format      |
| Check **T4.6**                            | Fails the build-check if any listed usage does not parse to its declared trigger |

**Standing order:** a new slash command is not done until it appears in
`COMMAND_GROUPS`. T4.6 enforces the reverse direction.

---

## 4. C-2 — `/story`

### 4.1 Invocation

| TYPED                         | SCOPE  | WINDOW     |
|-------------------------------|--------|------------|
| `/story`                      | week   | last 7 d   |
| `/story day` · `today` · `d` · `24h` | day | last 24 h |
| `/story week` · `w` · `wk` · `7d`    | week | last 7 d  |
| `/story month` · `m` · `mo` · `30d`  | month | last 30 d |
| `/story year` · `y` · `yr` · `365d`  | year | last 365 d |
| `/story <anything else>`      | week   | fallback   |
| `📖` emoji                    | week   | —          |

Text around the command is kept as the operator's note and sent with the
request: `slept badly, long walk after /story day` → note = `slept badly,
long walk after`.

### 4.2 Debounce (timing defect corrected)
Triggers are evaluated on every keystroke. Previously `/story` fired the
instant the sixth character landed, so `/story month` could never be typed —
the request had already gone out as the default. The submit is now armed on
detection and fires **1.2 s after the last keystroke**, reading the scope
from the live text at fire time. A single in-flight guard
(`storyInFlightRef`) prevents duplicate generations.

### 4.3 Compression packet (`src/shared/utils/story-compression.ts`)

| FIELD           | DERIVATION                                                                  |
|-----------------|-----------------------------------------------------------------------------|
| `records`       | Every row in the window (excluding prior `generated_story`)                 |
| `entries/words` | Journal rows (`note`, `log_entry`, `journal`) after cleaning                |
| `activeDays`    | Distinct UTC days with any record                                           |
| `longestRun`    | Longest run of consecutive active days                                      |
| `dominantPhase` | NIGHT (22–05) · DAWN (05–09) · DAY (09–18) · EVENING (18–22) of journal rows, in the operator's `context.timeZone` (server time if absent) |
| `moods`         | `emotional_checkin` states → valence −2…+2; dominant (ties → most recent) + average |
| `drift`         | Mean valence of 2nd half minus 1st half (≥4 check-ins required)             |
| `peaks.high/low`| Highest positive / lowest negative mood + nearest journal words (±12 h)     |
| `care`          | Self-care / energy / memory-answer actions                                  |
| `context`       | Dominant city, # of places, avg °C (stored °F converted), avg humidity, dominant moon phase, zodiac |
| `fragments`     | Last 8 journal fragments, ≤160 chars, slash commands and AI blocks removed  |

**Cleaning rule:** previously generated `📖` stories and `🕯️` scriptures are
appended to the entry text. They are cut before compression so the machine
never feeds its own output back as the operator's words.

**Valence table**

```
+2  energized  excited  fulfilled  grateful
+1  hopeful    calm     content    peaceful
-1  uncertain  tired    restless
-2  anxious    exhausted overwhelmed
```

### 4.4 Output
The `📖` block now shows the compression header above the narrative:

```
SCOPE           WEEK · 7D
RECORDS         8 · 3 ENTRIES · 14 WORDS
PRESENCE        5/7 DAYS · RUN 4
RHYTHM          DAY
MOOD            GRATEFUL · DRIFT +3.5
HIGH            GRATEFUL · 2026-11-11
LOW             OVERWHELMED · 2026-11-09
FIELD           BROOKLYN · 10°C · 70%
SKY             WANING CRESCENT
```

*(Actual output for the T2 fixture in `scripts/tests/test-log-story-arcade.ts`.)*
Offline story for the same packet:

> This week you showed up on 5 of 7 days and wrote 3 entries, mostly from
> Brooklyn. Your words came most often during the day. The mood that returned
> most was grateful. The high point: grateful — "Long walk by the river, light
> was gold". The low point: overwhelmed — "Deadline crush.". The second half
> lifted. You tended yourself 1 time.

Length scales with scope: day 60–120 words · week 100–200 · month 150–250 ·
year 200–320.

### 4.5 Failure modes

| CONDITION                      | BEHAVIOUR                                                       |
|--------------------------------|-----------------------------------------------------------------|
| Window empty                   | No model call. "Nothing was recorded this <scope>…"             |
| Together AI error / empty text | `fallbackStory(packet)` — `source: 'offline'`                   |
| No Usership (403)              | 403 still carries `story`, `header` from the packet; client renders it |
| Persist failure                | Story still returned; `logId: null`; error logged               |
| Rate limit                     | 5 / minute / operator (unchanged)                               |

### 4.6 Defect corrected — journal blindness
The previous `/story` handler selected journal rows with
`event === 'log_entry' || event === 'journal'`. Log entries are stored as
`event: 'note'`. **The story module had never seen a single journal entry**;
it wrote from moods and self-care answers only. `JOURNAL_EVENTS` now includes
`note`.

### 4.7 API

```
POST /api/story
  body  { logText: string, scope?: 'day'|'week'|'month'|'year',
          quantumState?, userIndex? }
  200   { story, scope, header: string[], compression, source: 'ai'|'offline', logId }
  403   { story, scope, header, compression, source: 'offline', logId: null }
```

Persisted row: `event: 'generated_story'`, `metadata: { story, scope, source,
header, compression, logText, quantumState, timestamp }`, `context` = snapshot
at generation time. The full packet is stored so later loops (monthly / yearly
re-compression, follow-up questions on spikes) can work from compressed
history instead of re-reading raw rows.

---

## 5. C-3 — ARCADE EVOLUTION (`/level` · `/xp` · `/arcade`)

### 5.1 Rules of engagement
LOT® is a self-care company. The arcade layer exists to make presence
visible, never to create anxiety. These rules are hard constraints in
`src/shared/utils/log-arcade.ts`:

```
R1  XP NEVER DECAYS.            Nothing is ever taken away.
R2  NO STREAK PENALTY.          Returning after ≥3 silent days EARNS +30.
R3  PRESENCE OVER VOLUME.       Daily caps make grinding pointless.
R4  NO LEADERBOARD.             No comparison. The only opponent is entropy.
R5  DETERMINISTIC.              Every point maps to a stored record.
```

### 5.2 XP table

| SOURCE                                   | XP  | DAILY CAP     |
|------------------------------------------|-----|---------------|
| Journal entry (`note`)                   | 10  | 5 entries     |
| Check-in (mood, self-care, energy, memory answer) | 5 | 6 check-ins |
| Presence (any record that day)           | 20  | 1             |
| Return (first day after >3 silent days)  | 30  | —             |
| Story generated (`/story`)               | 15  | 1             |

Maximum honest day ≈ 50 + 30 + 20 + 15 = **115 XP** (+30 on a return).

### 5.3 Level curve & tiers
`xpForLevel(L) = 50 · (L−1) · L` → 0 · 100 · 300 · 600 · 1000 · 1500 …

| LEVELS | TIER             |
|--------|------------------|
| 1–5    | SIGNAL I–V       |
| 6–10   | TRACE I–V        |
| 11–15  | PATTERN I–V      |
| 16–20  | NARRATIVE I–V    |
| 21–25  | ARCHIVE I–V      |
| 26–30  | CONSTELLATION I–V|
| 31+    | LIBRARY OF TIME n|

A steady operator (~80 XP/day) reaches TRACE in ~2 weeks, PATTERN in ~2
months, NARRATIVE in ~5 months, LIBRARY OF TIME in roughly two and a half
years — the arc of a long relationship with one's own record.

### 5.4 Output

```
ARCADE:
RANK            TRACE II
LEVEL           7
XP              2240 / 2800
PROGRESS        ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░
TODAY           +65 XP
PRESENCE        31 DAYS
RETURNS         2

XP NEVER DECAYS · RETURNING IS REWARDED
```

### 5.5 API

```
GET /api/log-arcade
  200  { xp, level, tier, rank, levelFloor, nextLevelAt, progress,
         activeDays, returns, breakdown, todayXp, lines: string[] }
```
Reads `event, createdAt` only (up to 20 000 rows). No writes.

---

## 6. FILE MANIFEST

| FILE                                         | CHANGE                                                     |
|----------------------------------------------|------------------------------------------------------------|
| `src/shared/utils/story-compression.ts`      | **NEW** — scope parsing, compression, header, prompt packet, offline story |
| `src/shared/utils/log-arcade.ts`             | **NEW** — XP rules, level curve, tiers, meter              |
| `src/server/routes/api.ts`                   | `/story` rebuilt on compression; **NEW** `GET /log-arcade` |
| `src/client/utils/logTriggers.ts`            | `arcade-level` trigger; `COMMAND_GROUPS`; `buildSystemHelp()` |
| `src/client/components/Logs.tsx`             | Debounced `/story` with scope; header render; `ARCADE:` block; registry-driven `/system` |
| `src/client/queries.ts`                      | `scope` on story request; `fetchLogArcade()`              |
| `scripts/tests/test-log-story-arcade.ts`     | **NEW** — 36 checks                                       |
| `package.json`                               | `npm run test:log`                                        |

---

## 7. VERIFICATION MATRIX

```
npm run test:log      36 PASS · 0 FAIL
npm run build         PASS (client esbuild + server tsc + ESM fix)
tsc client --noEmit   0 new errors (104 pre-existing, unchanged, none in touched code)
tsc server --noEmit   0 errors
ESM runtime resolve   #shared/utils/story-compression ✓  #shared/utils/log-arcade ✓
```

| ID    | CHECK                                                         |
|-------|---------------------------------------------------------------|
| T1.x  | Scope parsing, aliases, unknown → week, command stripping     |
| T2.x  | Window bounds, fragment cleaning, peaks + excerpts, drift, °F→°C, care, header, prompt, day scope, empty window, fallback honesty, mood tie → recency, operator-timezone rhythm |
| T3.x  | Level curve, inverse, daily cap, return bonus, monotonic XP, rank label, tier boundaries |
| T4.x  | Trigger detection for `/system`, `/story month`, `/level`/`/xp`/`/arcade`, `/levelup` rejected, help content, registry ↔ parser parity, renderer column split |

---

## 8. NEXT OPERATIONS (NOT IN THIS REVISION)

1. **Spike follow-up.** When a new `generated_story` packet shows `|drift| ≥ 1`
   or a new LOW peak, queue one Memory question referencing the operator's own
   excerpt — the machine asks first, on any device.
2. **Recursive compression.** Build `month` packets from stored `week` packets
   and `year` from `month`, so the year story costs 12 rows, not 5 000.
3. **Morning prompt.** Surface yesterday's `day` story as the first line of the
   LOT® device / System tab check-in.
4. **Arcade surface.** Show rank in the Log footer; award badges on tier entry
   (`SIGNAL → TRACE` etc.) via `badges.ts`.
