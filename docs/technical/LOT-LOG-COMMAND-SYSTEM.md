<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® LOG COMMAND SYSTEM — FIELD SPECIFICATION

```
DOC ID      : LOT-TS-LOG-CMD-01
CLASS       : ENGINEERING / TECHNICAL SPECIFICATION
REVISION    : 1.0 — 2026-11-17
AUTHORITY   : S-2 (Vadik Marmeladov)
STATUS      : ACTIVE — supersedes the hard-coded /system list in Logs.tsx
SCOPE       : Log (Journal) slash commands · /system · /story compression loop
VERIFIER    : yarn verify:log  → scripts/verify-log-commands.ts (66 checks)
```

---

## 1. MISSION

The Log is LOT's **passive AI surface**. The operator writes — no prompts,
no questions, no form fields. Every entry is saved with an **environment
snapshot** (`Log.context`: temperature, humidity, weather, city, country,
time zone, wall-clock date, rokuyo, moon phase + illumination, hourly
zodiac, western zodiac). No photo, no audio — only the shape of the moment.

Slash commands are the operator's **only explicit interface** into the
machine from inside the Journal. Two are load-bearing:

| COMMAND | FUNCTION |
|---|---|
| `/system` | Command index. Lists every command the Log understands. |
| `/story [day\|week\|month\|year]` | Compressed story of the operator's own record for that window, with HIGH / LOW peaks and an Arcade readout. |

---

## 2. THE LOOP

```
┌────────────────┐   ┌──────────────────────────────┐   ┌─────────────────┐   ┌──────────────────────┐
│ LOT USER DATA  │──▶│ LOT QUANTUM INTENT ENGINE    │──▶│ AI VENDOR       │──▶│ LOT PERSONALIZED     │
│ note · mood ·  │   │ compressStory()  (pure)      │   │ Together AI     │   │ DATA STORED          │
│ self-care ·    │   │ → Story Packet               │   │ narrates packet │   │ Log event            │
│ context snap   │   │   excerpts · peaks · env ·   │   │ (Usership only) │   │ 'generated_story'    │
└────────────────┘   │   rhythm · Arcade XP/level   │   └────────┬────────┘   │ + scope + packet     │
        ▲            └──────────────┬───────────────┘            │ fail      └──────────┬───────────┘
        │                           └──────────── composeFallbackStory() ◀─┘              │
        └──────────────────────────── story returned into the Log entry (📖) ◀────────────┘
```

**Doctrine:** the AI vendor never receives the raw journal. It receives
the compressed packet only (≤ 8 excerpts of ≤ 220 chars, aggregates,
city-level location). Compression happens on LOT infrastructure.

---

## 3. COMPONENTS

| FILE | ROLE |
|---|---|
| `src/client/utils/logTriggers.ts` | Detector rules (`RULES`) + **command registry** (`LOG_COMMANDS`), `formatSystemHelp()`, `extractCommandArgument()`, `ARGUMENT_TRIGGERS`. |
| `src/client/components/Logs.tsx` (`NoteEditor`) | Fires triggers on text delta; **settle-then-fire** for argument commands; renders `SYSTEM:` and `📖` blocks. |
| `src/shared/utils/storyCompression.ts` | Pure compression engine — scope parsing, journal cleaning, packet, Arcade, prompt/header/fallback renderers. Shared by client + server. |
| `src/server/routes/api.ts` → `POST /api/story` | Window query → compress → vendor (Usership) or fallback → persist. |
| `src/client/queries.ts` → `useStoryGeneration` | Typed mutation: `{logText, scope?, quantumState?, userIndex?}` → `{story, logId, scope?, header?, source?}`. |
| `scripts/verify-log-commands.ts` | Deterministic verifier. Exit 0 = GREEN. |

---

## 4. COMMAND REGISTRY (`LOG_COMMANDS`)

Single source of truth. `/system` renders from this table; the verifier
fails if an entry has no detector rule.

| CATEGORY | USAGE | TRIGGER | ARG |
|---|---|---|---|
| NARRATIVE | `/story [day\|week\|month\|year]` | `story-mode` | ✔ |
| NARRATIVE | `/prayer` | `prayer-mode` | |
| NARRATIVE | `/how` | `how-checkin` | |
| INTELLIGENCE | `/qi [query]` | `qi-rfi` | ✔ |
| INTELLIGENCE | `/scan` | `ai-scan` | |
| INTELLIGENCE | `/qos` | `qos-report` | |
| INTELLIGENCE | `/assembly` | `assembly-check` | |
| INTELLIGENCE | `/phys` | `phys-report` | |
| SELF-CARE | `/breathe` | `breathe` | |
| SELF-CARE | `/freeze` | `freeze-widgets` | |
| SELF-CARE | `/silent` | `silent-mode` | |
| SELF-CARE | `/fast` | `force-fast` | |
| ENVIRONMENT | `/synth` | `toggle-synth` | |
| ENVIRONMENT | `/radio` | `radio-toggle` | |
| ENVIRONMENT | `/night` | `night-mode` | |
| ENVIRONMENT | `/system` | `system-help` | |

**To add a command:** (1) add the `LogTrigger` union member, (2) add a
`RULES` row, (3) add a `LOG_COMMANDS` row, (4) handle it in `NoteEditor`,
(5) `yarn verify:log`.

### 4.1 Settle-then-fire (argument commands)

Detection is delta-based: a trigger fires once, the moment its token
becomes whole. For `/story` that moment is *before* the operator can type
`month`, and for `/qi` it is before the query exists — so `/qi <query>`
typed by hand never fired, and `/story month` would always run as `week`.

Argument commands (`takesArgument: true`) are therefore **armed, not
fired**. They fire when:

1. the command's line is completed with **Enter**, or
2. the operator pauses for **1400 ms** (`ARG_SETTLE_MS`).

At fire time the text is re-read; if the command was deleted, nothing
runs. The argument is parsed from the live text.

---

## 5. `/story` — COMPRESSION SPEC

### 5.1 Scope

| INPUT | SCOPE | WINDOW |
|---|---|---|
| `/story` | week (default) | 7 d |
| `/story day` · `today` · `d` | day | 1 d |
| `/story week` · `w` | week | 7 d |
| `/story month` · `m` | month | 30 d |
| `/story year` · `y` | year | 365 d |
| anything else | week | 7 d |

### 5.2 Event classes

| CLASS | EVENTS |
|---|---|
| JOURNAL | `note`, `journal`, `log_entry` |
| MOOD | `emotional_checkin` |
| SELF-CARE | `memory_answer`, `self_care_checkin`, `energy_checkin`, `answer` |

`generated_story` and every other machine event are excluded by query.

### 5.3 Journal cleaning

Removed before compression:
- lines starting with `📖` or `🕯️` (machine replies appended to notes),
- slash-command tokens (`/story month`, `/system`, …).

Entries empty after cleaning (command-only notes) are dropped. This stops
the loop from compressing its own output back into the operator's story.

### 5.4 Story Packet

| FIELD | CONTENT |
|---|---|
| `journal` | entries, words, ≤4/6/8 longest excerpts (day/week/≥month), top 8 recurring words (stop-words removed, Latin + Cyrillic) |
| `moods` | count, last 12 states, mean valence (−2…+2), trend (rising / falling / steady / unknown, half-split, ±0.5) |
| `peaks` | HIGH = max-valence check-in, LOW = min-valence check-in, each with date + context line (city · °C · moon) |
| `selfCare` | last 6 `question → answer` pairs |
| `environment` | top cities, °C min/max (Kelvin auto-converted), mean humidity, top weather, moon phases, zodiac |
| `rhythm` | active days, longest consecutive-day streak, dominant writing phase (from `context.date` wall clock) |
| `arcade` | XP, level, rank, next-level XP, progress |
| `signalDensity` | silent (0) · sparse (<0.5/day) · steady (<2/day) · dense |

Valence table: `MOOD_VALENCE` in `storyCompression.ts`. Unknown states = 0
(never produce false peaks).

### 5.5 Narration

| CONDITION | SOURCE |
|---|---|
| Usership + signal ≠ silent + vendor OK | `ai` — Together AI narrates packet; length 80–140 / 120–200 / 150–240 / 180–300 words by scope |
| Non-Usership, silent window, or vendor failure | `compression` — `composeFallbackStory()` deterministic prose |

The response carries `header` (terminal readout) + `story`. The Log shows
both in the `📖` block; only the story text is appended into the note.

Reference output (verifier fixture, `compression` source):

```
STORY · THIS WEEK
3 ENTRIES · 2 MOODS · 3 DAYS
LVL 1 INITIATE ▮▮▮▮▮▮▮▮▮▯ 90 XP

This week you wrote 3 entries in Lisbon, between 12 and 18°C, mostly in
the morning. The words that kept returning: ocean, alive, clear. The high
point was grateful on 2026-11-17; the low, exhausted on 2026-11-16. The
record keeps growing — level 1, initiate.
```

### 5.6 Persistence

`Log.create({ event: 'generated_story', text: story, context, metadata })`
with `metadata.{story, scope, source, header, packet{window, entries,
words, moods, trend, peaks, activeDays, longestStreak, signalDensity,
arcade}, logText, quantumState, timestamp}`. Stored peaks are the anchor
for future follow-ups ("the machine asks first") when a later window
shows a spike or pattern change.

---

## 6. ARCADE — GAMIFIED SELF-CARE EVOLUTION

Self-care first, game second. XP rewards **care and consistency**, never
raw volume:

| ACTION | XP |
|---|---|
| Journal entry | 10 (+1 per 20 words, max +5) |
| Mood check-in | 5 |
| Self-care answer | 5 |
| Active day | 15 |
| Streak | 10 per day of longest streak beyond 2 |

Level curve: `xpForLevel(n) = 50·(n−1)·n` → 0, 100, 300, 600, 1000, …

| LVL | RANK | LVL | RANK |
|---|---|---|---|
| 1 | INITIATE | 6 | ARCHIVIST |
| 2 | OBSERVER | 7 | OPERATOR |
| 3 | SIGNALER | 8 | ARCHITECT |
| 4 | CARTOGRAPHER | 9 | ORACLE |
| 5 | NAVIGATOR | 10+ | LOT PRIME |

Arcade is **window-scoped** (the level of *this* day / week / month /
year), so a fresh week always starts at INITIATE and a strong year reads
as a long climb. It is shown in the header only — the AI is instructed
never to mention XP or levels inside the story.

---

## 7. SECURITY & PRIVACY

- Auth: `/api/story` sits behind the authenticated API router; queries are
  scoped to `req.user.id`.
- Rate limit: 5 / minute / operator.
- Vendor payload: compressed packet only; location at city granularity;
  no email, no user id in the prompt. Server log line uses user id, not email.
- Query bound: `limit 2000` rows, event-class filtered, window-bounded.

---

## 8. VERIFICATION

```
$ yarn verify:log
§1 REGISTRY   37 checks  every command ↔ detector, /system completeness, /qi arg, /storyline guard
§2 SCOPE       6 checks
§3 CLEAN       1 check
§4 COMPRESS   12 checks  window, top words, peaks, env °C, streak, phase, day/year scopes, silence
§5 ARCADE      4 checks
§6 RENDER      6 checks
RESULT: 66 PASS · 0 FAIL → GREEN
```
