<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® LOG COMMAND SYSTEM — FIELD SPECIFICATION

```
╔══════════════════════════════════════════════════════════════════════╗
║  DOC ID     : LOT-TECH-LCS-001                                        ║
║  CLASS      : ENGINEERING · PUBLIC                                    ║
║  VERSION    : 1.0                                                     ║
║  EFFECTIVE  : 2026-11-11                                              ║
║  OWNER      : S-2 (VADIK MARMELADOV)                                  ║
║  SOURCE     : src/shared/utils/logCommands.ts                         ║
║  VERIFY     : yarn verify:log-commands  (15 checks)                   ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 0. MISSION

The Log (Journal) is LOT's **passive AI surface**. The operator writes; the
machine never prompts inside the Log. Every entry is stored as a `Log` row with
`event: 'note'` and a context snapshot (weather, temperature, humidity, city,
time zone, moon phase, rokuyo, hourly and western zodiac). See
`src/server/utils/logs.ts → getLogContext()`.

Slash commands are the operator's only explicit lever inside the Log. They
**never replace** the entry text. They append a result block under the entry
and, for AI output, append the result into the entry so it persists.

Pipeline (doctrine):

```
LOT USER DATA ──► LOT QUANTUM INTENT ENGINE ──► AI VENDOR (Together AI) ──► LOT PERSONALIZED DATA
  Log rows          client: getUserState()        aiEngineManager            Log row
  + context         getUserIndex()                .getEngine('together')     event 'generated_story'
  + check-ins       server: buildStoryDigest()                               metadata.scope + digest
```

---

## 1. COMMAND REGISTRY (single source of truth)

All commands live in `LOG_COMMANDS` (`src/shared/utils/logCommands.ts`).
`/system` renders from it, so the help screen and the actual triggers can no
longer drift apart. `scripts/verify-log-commands.ts` asserts that **every
registry command and alias fires a trigger** in `src/client/utils/logTriggers.ts`.

| CATEGORY      | COMMAND                     | ALIASES / EMOJI            | EFFECT |
|---------------|-----------------------------|----------------------------|--------|
| NARRATIVE     | `/story [day\|week\|month\|year]` | 📖                    | Compressed AI story of the time window |
| NARRATIVE     | `/how`                      | —                          | Opens LOT AI check-in (System tab) |
| INTELLIGENCE  | `/qi [query]`               | —                          | Quantum Intelligence RFI |
| INTELLIGENCE  | `/scan`                     | `/ai`                      | System status overview |
| INTELLIGENCE  | `/qos`                      | `/os-report`               | Quantum OS state |
| INTELLIGENCE  | `/assembly`                 | `/assemble`                | Self-assembly module status |
| INTELLIGENCE  | `/phys`                     | `/cohort-report`           | Physiological cohort report |
| RITUAL        | `/prayer`                   | `/candle`, 🕯️              | Contextual scripture |
| RITUAL        | `/breathe`                  | `/breath`                  | 4-2-6 breathing |
| RITUAL        | `/freeze`                   | `/pause`, 🧊               | Pause-and-reflect protocol |
| RITUAL        | `/fast`                     | —                          | Orthodox fasting calendar |
| RITUAL        | `/silent`                   | `/quiet`                   | Signal silence check |
| RITUAL        | `/sil`                      | `/silence-check`           | Signal silence pattern |
| **ARCADE**    | **`/level`**                | **`/arcade`, `/xp`**       | **Self-care arcade rank — NEW** |
| INTERFACE     | `/synth`                    | `/keyboard`, 🎹            | Keyboard sound |
| INTERFACE     | `/radio`                    | 🎧                         | Radio |
| INTERFACE     | `/night`                    | 🌙                         | Dark mode |
| INTERFACE     | `/system`                   | `/commands`                | Command list |

Not in the registry: ❗ / ‼️ (cohort support signal). It is an emoji signal,
not a command, and is deliberately left out of `/system`.

### 1.1 Adding a command — checklist

1. Add the entry to `LOG_COMMANDS` (name, category, description, aliases, emojis).
2. Add the `LogTrigger` union member and the `RULES` row in `logTriggers.ts`.
3. Handle the trigger in `NoteEditor`'s trigger effect (`Logs.tsx`).
4. Run `yarn verify:log-commands`. The parity check fails if step 2 was skipped.

---

## 2. `/system`

```
INPUT     : "/system" or "/commands" anywhere in an entry
OUTPUT    : SYSTEM: block — categories as headers, one row per command
SOURCE    : formatSystemHelp()
RENDER    : lines starting "/" → command row (split on first 2+ space gap)
            other non-empty lines → small uppercase header
```

---

## 3. `/story` — TIME-SCOPED COMPRESSION

### 3.1 Syntax

| Typed                         | Scope    | Window | Target words |
|-------------------------------|----------|--------|--------------|
| `/story`  or 📖               | `recent` | 3 d    | 180 |
| `/story day` · `today` · `d`  | `day`    | 24 h   | 120 |
| `/story week` · `w`           | `week`   | 7 d    | 180 |
| `/story month` · `m`          | `month`  | 30 d   | 220 |
| `/story year` · `y` · `annual`| `year`   | 365 d  | 260 |

Unknown words after `/story` (for example `/story about the sea`) fall back to
`recent` and stay in the log text sent as `logText`.

### 3.2 Client sequence (`Logs.tsx → NoteEditor`)

```
T+0      "/story" typed → trigger fires (detectNewTriggers delta)
         → loading block "📖 ..." shown, timer armed (STORY_SCOPE_DEBOUNCE_MS = 1500)
T+n      operator keeps typing "week" → no re-fire (trigger already present)
T+1.5s   timer reads valueRef.current (settled text)
         ├─ /story removed meanwhile → abort, loading cleared
         └─ parseStoryScope() + stripStoryCommand() → POST /api/story {logText, scope,
            quantumState: getUserState(), userIndex: getUserIndex()}
T+resp   story appended to entry as "📖 <story>", block label "📖 WEEK"
```

Why debounce: triggers fire per keystroke, so without the delay `/story week`
would always submit as `recent` before `week` is typed.

### 3.3 Server sequence (`POST /api/story`, `src/server/routes/api.ts`)

```
GATE      : 'usership' tag required (403 otherwise) · rate limit 5/min
SCOPE     : isStoryScope(body.scope) ? body.scope : 'recent'
QUERY     : Log.findAll where userId, createdAt ≥ now − STORY_SCOPE_MS[scope]
            attributes event,text,createdAt,context,metadata
            limit 1000 (3000 for year)
COMPRESS  : buildStoryDigest(rows, scope, now)   ← pure, shared
PROMPT    : system rules + formatDigestForPrompt(digest)
ENGINE    : aiEngineManager.getEngine('together').generateCompletion(prompt,
            512 | 768 for month/year)
PERSIST   : Log { event: 'generated_story', text: story, context,
                  metadata: { story, logText, quantumState, scope,
                              digest: {entryCount, activeDays, avgValence,
                                       high, low, cities} } }
RETURN    : { story, logId, scope }
FALLBACK  : engine error → fixed quiet message, logId null, scope echoed
```

### 3.4 Digest contract (`StoryDigest`)

The digest size is bounded whatever the window length. A year costs about the
same prompt size as a day.

| Field        | Derivation | Bound |
|--------------|------------|-------|
| entryCount   | `note` / `log_entry` / `journal` rows with non-blank text | — |
| activeDays   | distinct UTC dates of any row in window | — |
| moods        | `emotional_checkin.metadata.emotionalState` counts | top 6 |
| avgValence   | mean of `MOOD_VALENCE` (−2…+2) | — |
| high / low   | max / min valence check-in (latest wins ties); high requires >0, low requires <0 | 1 each |
| cities       | `context.city` frequency | top 5 |
| tempRangeC   | `context.temperature` (Kelvin) → °C min/max | — |
| weather      | `context.weatherDescription` frequency | top 3 |
| moonPhases   | `context.astroMoonPhase` frequency | top 2 |
| selfCare     | `answer`, `self_care`, `memory_answer`, `self_care_checkin`, `energy_checkin` → "Q: A" or text | 5, spread |
| samples      | journal entries, chronological, **spread evenly** across window (`spreadSample`) | 8 × 200 chars |

Mood valence table:

```
+2  energized · excited · fulfilled · grateful
+1  hopeful · content · peaceful · calm
−1  uncertain · tired · restless
−2  anxious · overwhelmed · exhausted
```

### 3.5 Defect corrected (DEF-LCS-01)

```
SEVERITY : HIGH (feature produced generic output)
FINDING  : Pre-v1.0 /story filtered journal rows on event 'log_entry' | 'journal'.
           Journal entries are persisted as event 'note'. The story prompt
           therefore always received "RECENT LOG ENTRIES: (none)". Self-care
           filter also missed 'answer' and 'self_care'.
FIX      : ENTRY_EVENTS = {note, log_entry, journal}
           SELF_CARE_EVENTS += {answer, self_care}
GUARD    : verify-log-commands "digest: week window with peaks"
```

---

## 4. `/level` — ARCADE EVOLUTION

LOT is a self-care company. The arcade layer exists to reward **presence**, not
output. Rules of engagement:

```
R1  One journal day = one credit. Ten entries on one day = ten entries, one credit.
R2  Streak bonus +2 XP per consecutive day beyond the first, capped at +10/day.
R3  A missed day never subtracts XP. The streak resets; the rank holds.
R4  No leaderboard and no comparison. The rank is private to the operator.
R5  Computed client-side from the operator's own logs (useLogs cache);
    no new endpoint, no new table.
```

XP per day = `10 + min((streak − 1) × 2, 10)`.

| LV | Title          | Min XP | ≈ days at full streak |
|----|----------------|--------|-----------------------|
| 1  | INITIATE       | 0      | 0 |
| 2  | OBSERVER       | 50     | 4 |
| 3  | RECORDER       | 150    | 9 |
| 4  | PATHFINDER     | 350    | 19 |
| 5  | CARTOGRAPHER   | 700    | 37 |
| 6  | NAVIGATOR      | 1200   | 62 |
| 7  | ARCHIVIST      | 2000   | 102 |
| 8  | SENTINEL       | 3200   | 162 |
| 9  | ORACLE         | 5000   | 252 |
| 10 | LAYER-OF-TIME  | 8000   | 402 |

Days are bucketed in the operator's local time (`getTimezoneOffset()`). The
current streak stays alive if the last entry was today or yesterday.

Output block `ARCADE:`

```
RANK            LV 3 · RECORDER
XP              170
PROGRESS        ■□□□□□□□□□ 20/200
NEXT            PATHFINDER
STREAK          10D (BEST 10D)
ACTIVE DAYS     10
RULE            SHOW UP · ONE DAY = ONE CREDIT · NO PENALTIES
```

Relation to Badges: `/level` is a continuous ladder. The badge system
(`src/client/utils/badges.ts`, 812 badges / Codex v32) awards discrete events.
They are independent; neither reads the other.

---

## 5. VERIFICATION

```
$ yarn verify:log-commands
PASS  every registry command fires a trigger
PASS  /system lists every command once
PASS  /level and /system and /story detected
PASS  parseStoryScope
PASS  stripStoryCommand
PASS  digest: day window
PASS  digest: week window with peaks
PASS  digest: month includes older note
PASS  digest: bounded size for large windows
PASS  spreadSample keeps endpoints
PASS  arcade: empty
PASS  arcade: multiple entries same day = one credit
PASS  arcade: streak bonus, capped
PASS  arcade: gap breaks current streak, never subtracts xp
PASS  arcade: format lines
15 checks passed
```

---

## 6. OPEN ITEMS (next sorties)

| ID   | Item | Note |
|------|------|------|
| N-1  | Scheduled weekly/monthly story delivery | Run `buildStoryDigest` from a cron job; deliver as the morning question on LOT device / System widget |
| N-2  | Spike follow-up | Use `digest.low` + valence delta vs previous window to trigger a machine follow-up on a specific entry |
| N-3  | Story chaining | Feed the previous `generated_story` of the same scope into the next prompt (compression of compressions: day→week→month→year) |
| N-4  | Server-side arcade | Move `computeArcadeState` behind an endpoint when `/api/logs` gains pagination (today `/level` relies on the full log cache) |
| N-5  | Local-time day buckets in digest | `activeDays` uses UTC dates; pass operator tz offset |
