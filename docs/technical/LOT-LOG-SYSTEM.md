# LOT LOG SYSTEM — Journal, Slash Commands, Compressed Story, Arcade

```
DOCUMENT:  LOT-LOG-SYSTEM
CLASS:     ENGINEERING
S-2:       VADIK MARMELADOV
REV:       A
DATE:      2026-10-06
SOURCES:   src/client/components/Logs.tsx
           src/client/utils/logTriggers.ts
           src/client/utils/logCommands.ts
           src/shared/utils/logStory.ts
           src/shared/utils/logArcade.ts
TESTS:     npm run test:log
```

## 1. PURPOSE

The Log is a passive AI interface. The Operator writes; there are no prompts,
no questions, no forms. Each entry is stored with the context of the moment
(weather, city, moon, time). The machine reads context, not prompts, and later
returns a compressed story so the loop tightens: Operator writes -> machine
compresses -> Operator reads themself back -> Operator writes more truthfully.

```
LOT User data -> LOT Quantum Intent Engine -> AI vendor (Together AI) -> LOT personalized data stored
```

Stage mapping for the Log:

| Stage                    | Implementation                                                    |
|--------------------------|-------------------------------------------------------------------|
| LOT User data            | `Log` rows, `event = 'note'`, `context` JSON (server-stamped)      |
| Quantum Intent Engine    | `getUserState()` / `getUserIndex()` sent with /story, /prayer, /qi |
| Compression (local)      | `compressLogs()` -> `StoryDigest` (deterministic, offline)         |
| AI vendor                | `POST /api/story` -> `aiEngineManager.getEngine('together')`       |
| LOT personalized storage | `generated_story` Log row written by the server                    |

Privacy property: the AI vendor receives the **digest** (counts, streak, place,
air, moon, mood, shifts) plus the Operator's current line, not the raw journal.
The server additionally reads recent entries itself for Usership members.

## 2. COMMAND SURFACE

Type any command anywhere in a Log entry. Commands fire on the delta only
(editing around an existing command does not re-fire it).

| Command                    | Group      | Effect                                              |
|----------------------------|------------|-----------------------------------------------------|
| `/system`                  | SYSTEM     | Lists every command, grouped, with current rank     |
| `/story [week\|month\|year]` | AI         | Compressed story; default scope is `day`            |
| `/rank`                    | AI         | Arcade rank, XP, streak                             |
| `/qi [query]`              | AI         | Quantum Intelligence RFI                            |
| `/how`                     | AI         | Open LOT AI check-in (System tab)                   |
| `/scan` `/assembly` `/phys` `/qos` `/fast` | CONTEXT | Status reports            |
| `/prayer` `/breathe` `/freeze` `/silent`   | SELF-CARE | Care protocols             |
| `/synth` `/radio` `/night` | DEVICE     | Toggles                                             |

`/system` output is **generated** from `LOG_COMMANDS` in `logCommands.ts`.
`scripts/tests/test-log-system.ts` fails when a command has no trigger, when a
trigger is missing from the registry, or when `/scandalous` fires `/scan`.
Known exempt triggers: `sil-check` (no handler wired), `cohort-support`
(emoji only).

### Adding a command

1. Add the trigger to `logTriggers.ts` (`LogTrigger` union + `RULES`).
2. Add the row to `LOG_COMMANDS` in `logCommands.ts`.
3. Add the handler branch in the trigger effect in `Logs.tsx`.
4. `npm run test:log`.

## 3. COMPRESSED STORY (`/story`)

### 3.1 Pipeline

```
/story week typed
   | 900 ms settle (scope word finishes being typed)
   v
compressLogs(allLoadedLogs, scope)   -> StoryDigest
   |-- renderStory(digest)           -> local story (always available)
   '-- digestForPrompt(digest)       -> POST /api/story  (Usership)
                                          |
                          success: local digest + AI narration, appended to the entry
                          failure / non-Usership: local digest is the story
```

The local digest is the guaranteed floor. The AI narration is an enrichment.
Before this revision the failure path showed a generic apology; it now shows
the Operator's real compression.

### 3.2 Digest fields

| Field        | Definition                                                           |
|--------------|----------------------------------------------------------------------|
| entries      | `event === 'note'` rows with >= 1 own word in the window             |
| words        | own words only (see 3.3)                                             |
| activeDays   | distinct local calendar days with an entry                           |
| streak       | consecutive entry days ending today, or yesterday if today is empty  |
| peakDay      | day with most own words (shown when more than one active day)        |
| topCity      | modal `context.city`                                                 |
| tempC        | min/max of `context.temperature` (Kelvin in storage, shown in C)     |
| topMoon      | modal `context.astroMoonPhase`                                       |
| moods        | top 3 `emotional_checkin` states in the window                       |
| shifts       | spike / silence / surge / drop (3.4)                                 |

Scopes: day = 1, week = 7, month = 30, year = 365 days. Data source is the
client log store (server returns up to 500 rows), so `year` is bounded by that
limit for heavy writers. Server-side long-horizon compression is future work.

### 3.3 No self-feeding loop

Generated blocks (story `📖`, prayer `🕯️`) are appended to the entry text so
they survive remount. `cleanJournalText()` cuts everything from the first
marker onward and strips `/command` tokens before any counting. Machine output
therefore never inflates words, streak or XP, and is never re-compressed.

### 3.4 Pattern-change detection (follow-up trigger)

| Shift   | Rule                                                                              |
|---------|-----------------------------------------------------------------------------------|
| spike   | today's words >= mean + 2 sigma of the 14-day baseline and >= 30 words (baseline needs >= 3 active days) |
| silence | >= 3 days without an entry after >= 3 active days in the 14 days before the gap     |
| surge   | window entries/day >= 2x the prior fortnight (window >= 7 days)                     |
| drop    | window entries/day <= 0.5x the prior fortnight (window >= 7 days)                   |

These are thresholds, not clinical findings. Today they are surfaced inside
`/story`. They are the hook for the proactive morning question: a spike or
silence is the machine's reason to ask first.

## 4. ARCADE EVOLUTION (`/rank`)

Self-care first, game second. Rank is a pure function of log history
(`computeArcade`), recomputable anywhere, never stored, so it cannot drift.

```
XP = 5 per entry
   + 2 per entry carrying context
   + floor(min(words, 40) / 10) per entry      depth is capped: volume is not farmed
   + 10 per distinct active day
   + 3 per streak day (cap 30)
```

| Rank      | XP   |   | Rank      | XP   |
|-----------|------|---|-----------|------|
| RECRUIT   | 0    |   | NAVIGATOR | 900  |
| SIGNAL    | 50   |   | ARCHITECT | 1800 |
| OPERATOR  | 150  |   | LOT-PRIME | 3500 |
| ANALYST   | 400  |   |           |      |

Design rule: showing up and recording context earns more than writing more.
Rank complements the existing badge system (`docs/badges/`); it does not
replace or write to it. Rank line appears at the top of `/system`.

## 5. FILES

| Path                                   | Role                                   |
|----------------------------------------|----------------------------------------|
| `src/shared/utils/logStory.ts`         | Compression, shifts, rendering (pure)  |
| `src/shared/utils/logArcade.ts`        | XP and rank (pure)                     |
| `src/client/utils/logCommands.ts`      | Command registry, /system renderer     |
| `src/client/utils/logTriggers.ts`      | Trigger detection (+ `rank-report`)    |
| `src/client/components/Logs.tsx`       | Handlers: /system, /story, /rank       |
| `scripts/tests/test-log-system.ts`     | 12 tests, `npm run test:log`           |

## 6. KNOWN LIMITS

- Command handlers still fire as the text changes (existing design). `/story`
  alone fires at the first trailing space, hence the 900 ms scope settle.
- `/qi` has the same first-space quirk; unchanged.
- Story history is limited to the loaded log window (500 rows).
- `/api/story` requires the Usership tag; others receive the local digest only.
- Spike/silence thresholds are untuned defaults; tune against real user data.

## 7. NEXT

1. Morning question driven by `shifts` (spike -> ask what happened; silence -> check in).
2. Server-side day/week/month/year compression stored as `generated_story`, so
   year scope is not bounded by the client window and devices share one story.
3. Arcade rank surfaced on the LOT personal device and in the daily widget.
