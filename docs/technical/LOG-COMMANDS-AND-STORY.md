================================================================================
LOT SYSTEMS / TECHNICAL SPECIFICATION
DOCUMENT: LOT-TS-LOG-COMMANDS-STORY  rev A
TITLE:    Log slash commands (/system), compressed story (/story), arcade rank
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-11-01
STATUS:   IMPLEMENTED — GREEN (see docs/benchmark/LOT-SR-20261101-01.md)
================================================================================

# 0. PURPOSE

The Log is a passive AI interface. The operator writes; the machine reads the
context stamped on every entry (weather, time, place, moon) and later closes the
loop by returning a compressed story. Two commands expose the loop inside the
Log with no prompt, form or question:

  /system   lists every command (generated from a registry, cannot drift)
  /story    returns the compressed story of the record + arcade rank

Doctrine alignment (docs/corporate/LOT-AI-PRODUCT-BRIEF.md):
LOG -> OBSERVE -> COMPRESS -> ASK -> COMPRESS AGAIN. /story is the COMPRESS step
made visible; the digest it builds is the unit sent onward.

# 1. DATA FLOW

```
LOT User data (Log rows + context meta-data)
        |
        v   on-device, deterministic, no network
compressStory() + computeArcade()      src/client/utils/logStory.ts
        |
        +--> renderStory()   -> shown immediately in the Log (STORY block)
        |
        v   digestForModel(): one line, <= 900 chars
LOT Quantum Intent Engine routing      POST /api/story  (quantumState + userIndex from QIE ride along)
        |
        v
AI vendor processor: Together AI       aiEngineManager.getEngine('together')
        |
        v
LOT personalized data stored           Log row, event = generated_story
```

Privacy property: raw entries are NOT sent by the client. The vendor receives a
digest (counts, streak, peak time, themes, change flag, rank, latest-entry
excerpt <= 140 chars) plus the server-side recent-entry excerpts the route
already used before this change. The compressed story renders even if the
vendor is down.

# 2. /system

Source of truth: `src/client/utils/logCommands.ts` (LOG_COMMANDS).
Detector:        `src/client/utils/logTriggers.ts` (RULES).
Renderer:        `buildSystemHelp()` -> `setSystemHelp()` in Logs.tsx.

| CATEGORY  | COMMANDS                                                    |
|-----------|-------------------------------------------------------------|
| NARRATIVE | /story [day|week|month|year] · /qi [query] · /prayer · /how |
| STATE     | /scan · /assembly · /phys · /qos · /fast · /silent · /sil   |
| PROTOCOL  | /breathe · /freeze                                          |
| INTERFACE | /synth · /radio · /night · /system                          |

Commands are case-insensitive, whole-token (`/scandalous` does not fire
`/scan`), and may sit anywhere in an entry. Usership-gated commands carry a
`[USERSHIP]` marker. To add a command: add a RULES entry in logTriggers.ts, add
a LOG_COMMANDS entry, handle the trigger in Logs.tsx. The check script fails if
the two lists disagree.

# 3. /story

Syntax: `/story` (= week) · `/story day|today|week|month|year`.

Windows (local time): day = since local midnight; week = trailing 7 days;
month = 30; year = 365; each compared with the equal-length window before it.

Trigger timing: /story is DEBOUNCED 1200 ms after the last keystroke so the
operator can finish typing the period. Other commands still fire immediately.

## 3.1 Counted records

  JOURNAL  event in {note, log_entry, journal} with non-empty text
  SIGNAL   any other operator event (check-ins, answers, intentions, ...)
  NOISE    ping, settings_change, users_*, badge_unlock, generated_story,
           qi_rfi, assembly_directive, prayer_scripture, system_feedback,
           chat_message_like, live_message, other  -> never counted

Appended prayer/story blocks and slash commands are stripped before analysis.

## 3.2 Digest fields

entries · signals · priorEntries · change · activeDays · streak · peakDay ·
peakHour/partOfDay · themes (top 4 words, >= 2 occurrences, stop-words removed) ·
tempRangeC (context stores Kelvin) · cities · moonPhases · firstEntry/lastEntry.

## 3.3 Pattern-change detection (the "follow up on a spike" hook)

  spike  prior >= 3 and current >= 1.5 x prior
  drop   prior >= 3 and current <= 0.5 x prior
  new    prior = 0 and current > 0
  steady otherwise

The flag is rendered in the story ("This is a spike ... Something is moving.")
and is passed to the vendor, which is instructed to name it gently. This is the
first machine-side surface for the "follow up when a pattern changes" behaviour;
proactive follow-up (machine asks first) is NOT yet implemented — see section 6.

## 3.4 Output grid

```
STORY LAST 7 DAYS
<2-4 sentence deterministic narrative>
Latest: "<last entry excerpt>"

RECORD     ENTRIES / SIGNALS / ACTIVE / STREAK / PEAK DAY
ARCADE     RANK / XP bar / NEXT RANK
NARRATIVE  <Together AI paragraph, appended when the vendor answers>
```

Only the vendor paragraph is appended to the entry text (as before); the local
story is display-only so the journal is not polluted with statistics.

# 4. ARCADE EVOLUTION

Self-care first: XP rewards presence and noticing, never output volume.

| SOURCE        | XP   | CAP                          |
|---------------|------|------------------------------|
| Journal entry | +10  | 3 XP-bearing entries per day |
| Other signal  | +2   | 10 per day                   |
| Active day    | +15  | 1 per day                    |
| Streak        | +5/d | +50 total                    |

Curve: xpForLevel(L) = 25(L-1)^2 + 25(L-1)
-> L2 = 50, L3 = 150, L4 = 300, L5 = 500. Level is derived, never stored.

| LEVEL | RANK            | MEANING                         |
|-------|-----------------|---------------------------------|
| 1     | SIGNAL          | first records                   |
| 3     | OBSERVER        | noticing the self               |
| 6     | KEEPER          | routine forming                 |
| 10    | NAVIGATOR       | patterns understood             |
| 15    | CARTOGRAPHER    | maps own cycles                 |
| 21    | ARCHIVIST       | long memory                     |
| 30    | OPERATOR PRIME  | founding-grade record           |

Anti-gaming: the daily caps mean 50 entries in one day yields the same XP as 3.
Rank is computed from the existing log history, so it needs no migration and is
independent of the badge codex (src/client/utils/badges.ts).

# 5. VERIFICATION

`npx tsx scripts/tests/test-log-commands.ts` — 68 checks: registry/detector
parity, help content, period parsing, noise exclusion, window math, streak,
peak hour, themes, Kelvin conversion, spike/drop, determinism, XP caps.
Build gate: `npm run server:build` and `npm run client:build` both green.

# 6. KNOWN LIMITS / NEXT

1. `/qi <query>` still fires on the bare `/qi` token (pre-existing); the same
   debounce used for /story should be applied.
2. `/story` year uses the loaded `/api/logs` set; that endpoint is cached 5 min.
3. Proactive loop not built: scheduled morning question, spike-triggered
   follow-up, and weekly auto-story to device are specified in the product brief
   but not implemented here.
4. Digest is built client-side; moving compression server-side (so devices
   without the web client get identical stories) is the QIE integration step.
5. Arcade is display-only; no persistence, rewards or leaderboard by design.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-TS-LOG-COMMANDS-STORY
================================================================================
