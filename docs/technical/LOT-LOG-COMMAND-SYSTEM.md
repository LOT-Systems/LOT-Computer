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
DOCUMENT:  LOT-TS-LOG-CMD-01
TITLE:     LOG COMMAND SYSTEM + LOG COMPRESSION ENGINE (LCE-1)
CLASS:     RESTRICTED // S-2 EYES
S-2:       VADIK MARMELADOV
REVISION:  A — 2026-11-26
SESSION:   LOT-SR-20261126-01
STATUS:    LIVE ON BRANCH claude/youthful-ritchie-1pvhjt
================================================================================
```

## 0. MISSION

The Log is LOT's passive AI surface. The operator writes; the machine does
not prompt, interrupt or question inside the Journal. Every entry is stored
with its context snapshot (time, timezone, city, country, temperature,
humidity, weather, moon phase, illumination, rokuyo, hourly and western
zodiac — see `getLogContext()` in `src/server/utils/logs.ts`). No photo. No
sound. Only the moment's metadata.

This document specifies the two operator-invoked surfaces inside the Log:

| COMMAND                          | FUNCTION                                                  |
|----------------------------------|-----------------------------------------------------------|
| `/system`                        | Lists every documented command, grouped                   |
| `/story [day\|week\|month\|year]` | Compressed story of the operator's record for the horizon |
| `/rank`                          | Arcade — Record Rank, XP, streak, follow-up signal         |

and the deterministic engine underneath them: **LCE-1, the Log Compression
Engine.**

---

## 1. DATA FLOW

```
 ┌──────────────┐   ┌──────────────────────┐   ┌───────────────────┐   ┌──────────────┐   ┌───────────────────┐
 │ LOT USER DATA│──▶│ LCE-1 PACKET          │──▶│ QUANTUM INTENT    │──▶│ TOGETHER AI  │──▶│ LOT PERSONALIZED  │
 │ note +       │   │ (deterministic, pure) │   │ STATE (client QIE │   │ prose only   │   │ DATA STORED       │
 │ emotional_   │   │ counts · peaks ·      │   │ energy/clarity/   │   │              │   │ Log event         │
 │ checkin +    │   │ spikes · shift ·      │   │ alignment + user  │   │ on failure → │   │ generated_story   │
 │ context      │   │ context · streak      │   │ index)            │   │ fallback     │   │ + metadata.packet │
 └──────────────┘   └──────────────────────┘   └───────────────────┘   └──────────────┘   └───────────────────┘
```

DOCTRINE: **the numbers are computed by LOT; the vendor writes prose.** The AI
never receives the raw journal dump — only the packet. Every fact in a story is
traceable to a field in `metadata.packet` on the stored `generated_story` log.

---

## 2. COMPONENT MAP

| LAYER   | FILE                                         | ROLE                                                        |
|---------|----------------------------------------------|-------------------------------------------------------------|
| SHARED  | `src/shared/utils/log-compression.ts`        | LCE-1 — parse, clean, score, compress, rank, render (pure)  |
| CLIENT  | `src/client/utils/logTriggers.ts`            | Command registry (single source of truth) + detectors        |
| CLIENT  | `src/client/components/Logs.tsx`             | Trigger dispatch, `/story` settle timer, result blocks      |
| CLIENT  | `src/client/queries.ts`                      | `useStoryGeneration` (POST) · `getStoryPacket` (GET)         |
| SERVER  | `src/server/routes/api.ts`                   | `POST /api/story` · `GET /api/story/packet`                  |
| TEST    | `scripts/tests/test-log-compression.ts`      | `yarn test:log-compression` — 14 deterministic cases         |

---

## 3. `/system` — COMMAND REGISTRY

### 3.1 Single source of truth

`RULES` in `logTriggers.ts` holds, per command: trigger id, emojis, keywords,
and — for documented commands — `usage`, `description`, `group`.
`buildSystemHelp()` renders `/system` from that table. Adding a command means
adding one row; the help screen updates itself. **The help screen can no
longer drift from what the detector accepts** (prior state: a hand-maintained
string list in `Logs.tsx`).

Rows without `usage` stay unlisted (easter eggs): `/sil`, `❗`.

### 3.2 Groups (display order)

```
STORY & RECORD   /story [day|week|month|year] · /rank
INTELLIGENCE     /qi [query] · /scan · /assembly · /qos · /phys · /how
SELF-CARE        /prayer · /breathe · /freeze · /fast · /silent
ENVIRONMENT      /synth · /radio · /night
SYSTEM           /system
```

### 3.3 Detection rules (unchanged)

- Keyword match is a whole token: `(^|\s)/word(\s|$|[^a-z0-9_])`, case-insensitive.
  `/storyline` does **not** fire `/story`.
- Emojis match as substrings (`📖` = `/story`).
- Delta-only: `detectNewTriggers(text, previous)` fires a trigger once, when it
  first appears. Editing around it does not re-fire.

---

## 4. `/story` — COMPRESSED STORY

### 4.1 Syntax

```
/story                → week (default)
/story day|today|d    → last 24 h
/story week|w         → last 7 d
/story month|m        → last 30 d
/story year|y         → last 365 d
<text> /story month <text>   → surrounding text is passed as the operator note
/story about rain     → unknown argument: horizon = week, "about rain" = note
```

Parser: `parseStoryCommand()`. Windows are rolling (now − N days), not calendar.

### 4.2 Settle timer (defect fixed)

Triggers fire per keystroke. Before this revision, `/story` submitted the
instant the `y` was typed, so the operator could never finish `/story month`.
Now `story-mode` only **arms** a pending flag; a 1500 ms timer re-arms on every
keystroke and, once the text settles, parses the **current** value and submits.
Timer is cleared on unmount.

### 4.3 Server — `POST /api/story`

| FIELD          | VALUE                                                                   |
|----------------|-------------------------------------------------------------------------|
| Auth           | Session; **Usership** tag required (403 otherwise — unchanged)           |
| Rate limit     | 5 / minute                                                              |
| Body           | `{ logText, horizon?, quantumState?, userIndex? }`                      |
| Query          | `note` + `emotional_checkin`, `createdAt ≥ now − horizon`, ≤ 3000 rows  |
| AI             | `aiEngineManager.getEngine('together')`, max 640 tokens                 |
| Word budget    | day 60–120 · week 100–180 · month 120–200 · year 140–220                |
| Fallback       | `composeFallbackStory(packet)` — deterministic, never dark              |
| Persist        | Log `generated_story`, `metadata: { story, horizon, engine, packet, … }`|
| Response       | `{ story, logId, horizon, packet, engine: 'together' \| 'fallback' }`   |

**Defect fixed:** the previous handler selected journal entries with
`event === 'log_entry' || 'journal'`. Log entries are stored as `event: 'note'`
(`LogEvent` in `src/shared/types/index.ts`; every other engine — memory,
energy, goals, RPG — reads `'note'`). The old `/story` therefore never saw the
journal and wrote from moods/self-care only. LCE-1 reads `note`.

### 4.4 Client render

The `📖` block shows the Terminal Grid header (`packetToGrid`) above the story.
Actual output for the test fixture in `scripts/tests/test-log-compression.ts`:

```
STORY           WEEK · 7D
ENTRIES         8 · 22 WORDS
ACTIVE DAYS     5/7 · STREAK 3D
DOMINANT MOOD   ENERGIZED
TONE SHIFT      DOWN (-1.67)
HIGH            2026-11-20
LOW             2026-11-24
FOLLOW-UP       TONE SHIFTED DOWN IN SECOND HALF OF WINDOW
```

The story text is appended to the note as `📖 …` (persistence across remount,
unchanged behaviour).

---

## 5. LCE-1 — LOG COMPRESSION ENGINE

### 5.1 Contract

- Pure TypeScript. No I/O, no stores, no clock except the `now` argument.
- Shared by server and client (`#shared/utils/log-compression`).
- Input: `CompressibleLog[]` (`event, text, createdAt, context, metadata`).
- Only `note` and `emotional_checkin` events are read; all others ignored.

### 5.2 Feedback-loop guard — `cleanJournalText()`

The machine must not compress its own output into the next story. Removed
before any counting or scoring:

1. Lines beginning with `/` (command lines).
2. `📖` and `🕯` blocks — from the marker line until the next blank line.
3. Inline commands (`/story month`, `/qi`) inside prose.

URLs and `a/b` constructs are preserved (only `/word` after whitespace or at
line start is stripped).

### 5.3 Packet fields

| FIELD           | COMPUTATION                                                                         |
|-----------------|-------------------------------------------------------------------------------------|
| `entries`       | cleaned, non-empty notes in window                                                  |
| `words`         | whitespace token count of cleaned notes                                             |
| `activeDays`    | distinct UTC dates with ≥ 1 note                                                    |
| `coverage`      | `activeDays / spanDays`, capped at 1                                                |
| `checkins`      | `emotional_checkin` rows with `metadata.emotionalState`                             |
| `moods`         | state → count, descending; `dominantMood` = first                                   |
| `peaks.high/low`| max positive / min negative valence across notes + check-ins, with excerpt (≤140 ch), city, weather |
| `meanValence`   | mean valence of scored candidates                                                   |
| `shift`         | mean valence 1st half vs 2nd half of window; needs ≥ 2 scored items per half; `up` > +0.25, `down` < −0.25, else `flat`. Not computed for `day` |
| `spikes`        | days with ≥ 3 notes **and** ≥ 2× active-day mean; needs ≥ 3 active days; top 3. Not computed for `day` |
| `context`       | distinct cities (≤5) · mean °C (Kelvin → C) · modal weather · modal moon phase · modal time block in the operator's **own timezone** (`context.timeZone`, UTC fallback) |
| `streak`        | consecutive UTC days with a note, counted back from today (or yesterday)           |
| `followUp`      | see 5.5                                                                             |

### 5.4 Valence — honest scope

`scoreValence()` is a **small lexical heuristic** (~35 lighter / ~35 heavier
terms, simple negation window: `not / no / never / don't / didn't / isn't /
wasn't / without`). Range ≈ [−1, 1]. Mood check-ins map to fixed values
(`energized` +1 … `exhausted` −1).

It locates **candidate** peaks for the narrative. It is not sentiment
analysis, not a clinical instrument, and is never shown to the operator as a
score. Text with no lexicon hits scores 0 and cannot become a peak.

### 5.5 Follow-up signal — "the machine asks first"

`detectFollowUp()` returns one stated reason, or `null`. Priority:

```
1. shift.direction == down          → TONE SHIFTED DOWN IN SECOND HALF OF WINDOW
2. peaks.low.valence ≤ −0.6         → LOW PEAK DETECTED — CHECK IN ON IT
3. spikes[0] present                → ACTIVITY SPIKE <date> (<n> ENTRIES)
4. span ≥ 7d, entries > 0, cov < .2 → SIGNAL SPARSE — FEW ACTIVE DAYS
```

When present, the AI is instructed to end the story with **one** short, open
question about it — the Log stays passive; the story is where the machine may
ask. The signal is also shown under `/rank` and stored in `metadata.packet`
for future morning-question / device follow-up jobs to consume.

---

## 6. `/rank` — ARCADE: RECORD RANK

Gamified evolution of the Log, in self-care register.

### 6.1 Rules of engagement

- **XP only accrues.** Gaps never subtract. Missing days cost nothing.
- Trailing **365 days** — the rank reflects a living practice.
- Separate from the 1–100 **Overall Level** (`rpg-narrative.ts`, all activity),
  which `/rank` displays alongside it.

### 6.2 XP formula

```
XP = 10 × entries
   + floor(words / 25)
   + 2  × entries carrying context (city or temperature)
   + 5  × min(streak, 60)
```

### 6.3 Ladder

```
TIER  RANK           XP
1     OBSERVER          0
2     RECORDER        100
3     CHRONICLER      400
4     CARTOGRAPHER   1000
5     ARCHIVIST      2500
6     KEEPER         5000
```

### 6.4 Render (test fixture, actual output)

```
RECORD RANK     RECORDER · TIER 2/6
XP              123
PROGRESS        ██░░░░░░░░░░░░░░░░░░
NEXT            CHRONICLER IN 277 XP
FROM ENTRIES    90
FROM WORDS      0
FROM CONTEXT    18
FROM STREAK     15
OVERALL LEVEL   12/100
```

### 6.5 `GET /api/story/packet?horizon=week`

No AI call. Rate limit 20 / minute. Returns
`{ packet, rank, overallLevel }`. Available to all signed-in operators (the
data is their own and costs no vendor tokens).

---

## 7. VERIFICATION

| CHECK                                    | RESULT                         |
|------------------------------------------|--------------------------------|
| `yarn test:log-compression`              | 14 PASS · 0 FAIL               |
| `tsc -p tsconfig.server.json --noEmit`   | 0 errors                       |
| `tsc -p tsconfig.json --noEmit`          | 104 errors — identical to baseline (pre-existing, none in new code) |
| `yarn build`                             | OK                             |
| dist runtime import `#shared/utils/log-compression` | resolves, 19 exports |

NOT VERIFIED THIS SESSION: live Together AI completion and in-browser
interaction (no database / vendor key in the build container).

---

## 8. OPEN ITEMS (for S-2)

1. Consume `metadata.packet.followUp` in the morning-question job so the
   machine's first question of the day can reference the flagged moment.
2. Auto-compression cadence: scheduled weekly/monthly `generated_story` per
   Usership operator (currently operator-invoked only).
3. Hierarchical compression: year story built from stored month packets
   instead of 365 days of raw rows (cheaper; cap is 3000 rows today).
4. Expand valence lexicon beyond English, or swap for a vendor classifier —
   keep the packet contract unchanged.

```
================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-TS-LOG-CMD-01
================================================================================
```
