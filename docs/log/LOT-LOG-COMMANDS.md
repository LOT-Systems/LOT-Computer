```
╔══════════════════════════════════════════════════════════════════════╗
║            LOT SYSTEMS — LOG ENTRY SYSTEM · FIELD SPECIFICATION      ║
╠══════════════════════════════════════════════════════════════════════╣
║  DOC      : LOT-LOG-COMMANDS                                         ║
║  REV      : A  (2026-10-07)                                          ║
║  CLASS    : RESTRICTED // S-2 EYES                                   ║
║  S-2      : VADIK MARMELADOV                                         ║
╚══════════════════════════════════════════════════════════════════════╝
```

# 1. PURPOSE

The Log is the passive-AI surface of LOT®. The operator writes; there are no
prompts, no questions, no forms. Every entry is stamped with context metadata
(weather, humidity, city, time). The machine reads the record later, compresses
it, and hands it back as a story.

This document specifies the Log's **slash-command layer** — `/system` (index)
and `/story` · `/week` · `/month` · `/year` (compression) — the shared
compression engine behind them, and the arcade (rank / XP) layer on top.

```
LOT User data → LOT Quantum Intent Engine → AI vendor (Together AI) → LOT personalized data stored
                                                  ▲
                                   executes only; never remembers
```

# 2. COMMAND SURFACE

Typed anywhere in a Log entry. A command fires once, on the keystroke that
completes it (delta detection — editing around it never re-fires).

| COMMAND   | TRIGGER        | EFFECT                                              | AI CALL |
|-----------|----------------|-----------------------------------------------------|---------|
| `/system` | `system-help`  | Command index grouped by category + operator rank   | no      |
| `/story`  | `story-mode`   | Compressed story, last **24 h**                     | yes     |
| `/week`   | `story-week`   | Compressed story, last **7 d**                      | yes     |
| `/month`  | `story-month`  | Compressed story, last **30 d**                     | yes     |
| `/year`   | `story-year`   | Compressed story, last **365 d**                    | yes     |
| `/sil`    | `sil-check`    | Signal-silence check (alias of `/silent` handler)   | no      |

All other commands are unchanged; the full list is whatever `/system` prints.

**Why `/week` and not `/story week`:** triggers fire the instant the keyword is
complete. `/story` would fire before the operator could type ` week`. Each
period is therefore its own keyword.

**Match rule:** `(^|\s)/word` followed by end, whitespace, or a non-word
character. `good week`, `example.com/week` and `/weekend` do not fire.

# 3. `/system` — COMMAND INDEX

Rendered by `formatSystemHelp()` from the **registry**
(`src/client/utils/logCommands.ts`), never from a hand-written string.

```
OPERATOR STATUS
RANK  CADET   XP 40/…   COMMANDS 3/20
NEXT  OPERATOR AT 80 XP

MEMORY
/story          Compressed story of your day  ●
/week           Compressed story of your week
…
```

`●` marks commands the operator has used. Categories: MEMORY · ENGINE · BODY ·
ENVIRONMENT · SYSTEM.

**Anti-drift guarantee:** `scripts/tests/test-log-commands.ts` asserts every
registry entry (usage + aliases) fires its trigger and appears in `/system`.
Add a command in one place; the check fails if the other is forgotten.

# 4. `/story` — COMPRESSION PIPELINE

```
 operator types /week
        │
        ├─► CLIENT (instant, offline)
        │     buildStoryDigest(cached logs, 'week') → STORY: block
        │
        └─► POST /api/story { period, logText, quantumState, userIndex }
              SERVER
              1. Usership gate (403 otherwise)
              2. Load logs: window + equal prior window (2× span), cap 5000
              3. buildStoryDigest() → COMPRESSED RECORD (same code as client)
              4. Prompt = rules + COMPRESSED RECORD + state + recent entries
              5. Together AI → ≤200-word second-person story
              6. Persist as Log event `generated_story`
                 metadata { period, digest, logText, quantumState }
              7. Client appends “📖 <story>” to the entry
```

The operator sees numbers immediately (STORY: block) and prose when the model
returns. If the AI is down, the numbers still render — the compression does not
depend on the vendor.

## 4.1 StoryDigest fields

| FIELD                | DEFINITION                                                     |
|----------------------|----------------------------------------------------------------|
| entries / priorEntries | journal notes in window / in the preceding equal window      |
| deltaPct             | % change vs prior; `null` when prior = 0 (no invented baseline) |
| activeDays           | distinct UTC days with ≥1 entry                                |
| longest / currentStreak | consecutive active UTC days; current ends today or yesterday |
| peakBand             | NIGHT · MORNING · MIDDAY · AFTERNOON · EVENING (UTC hour)      |
| moods, moodHigh, moodLow | `emotional_checkin` counts; high/low from fixed positive/challenging sets |
| keywords             | top ≤5 stems, len ≥4, stopwords removed, slash commands & engine echoes stripped |
| cities, avgTempC     | from entry context; temperature stored in **Kelvin**           |
| spikes               | `SPIKE`: day with ≥3 entries and ≥3× window daily mean. `DROP`: ≥3 consecutive silent days. Windows ≥7 d only. |
| silentHours          | hours since last entry                                         |

## 4.2 Defined as an entry

`event = 'note'`, non-empty after trim, not beginning with `📖` or `🕯`
(engine output echoed into the entry is not the operator's own signal).

## 4.3 Pattern-change follow-up (design hook)

`spikes`, `deltaPct` and `silentHours` are the machine's “follow up” triggers.
Today they are surfaced in `/story`. The next increment (see §9) is a proactive
morning question keyed off the same digest — the machine asks first.

# 5. ARCADE LAYER

Self-care tech with an arcade spine: **discovery is the game.**

```
RANK        MIN XP
RECRUIT        0
CADET         30
OPERATOR      80
SPECIALIST   150
COMMANDER    250
```

- First use of a command awards its XP once (`MEMORY` commands weigh most:
  `/story` 20 · `/week` 30 · `/month` 40 · `/year` 50 — longer horizons earn more).
- Rank is a pure function of discovered commands. It only goes up.
- Storage: `localStorage['lot:log-commands:discovered']`, per device. Failure
  tolerant (private mode → no XP, no crash).
- **Design constraints (self-care, not casino):** no streak penalties, no loss
  states, no timers, no variable-ratio rewards, no notifications about rank.
- Relation to Badges: this is the *Log-surface* rank. The Badge Codex
  (`docs/badges/`) remains the long-horizon achievement system; wiring
  command-rank into a badge is a candidate increment (§9).

# 6. PRIVACY & DATA FLOW

| RULE | ENFORCEMENT |
|------|-------------|
| Vendor never receives full history | Prompt carries the digest (aggregates + ≤5 keyword stems) + ≤5 recent entries truncated to 200 chars (pre-existing behavior) |
| Vendor does not remember | Stateless completion call; story stored in LOT's own database |
| Story is the operator's | Persisted under their `userId` as `generated_story`; export/delete paths cover it |
| Gate | `/api/story` requires `usership` tag; rate limit 5/min |
| No audio / photo | Context snapshot is numeric/text only |

# 7. FILES

| PATH | ROLE |
|------|------|
| `src/shared/utils/logStory.ts` | Pure digest + renderer (client **and** server) |
| `src/client/utils/logCommands.ts` | Command registry, ranks, discovery storage, `/system` formatter |
| `src/client/utils/logTriggers.ts` | Detector table (added `story-week/month/year`) |
| `src/client/components/Logs.tsx` | Handlers, `STORY:` block, `/sil` alias |
| `src/client/queries.ts` | `useStoryGeneration` — `period` param |
| `src/server/routes/api.ts` | `POST /api/story` — period, digest, prompt |
| `scripts/tests/test-log-commands.ts` | 15-check self-test (pure modules) |

# 8. DEFECTS FOUND AND FIXED (REV A)

1. **`/story` never saw journal entries.** The route filtered
   `event === 'log_entry' || 'journal'`; the Log tab stores `'note'`. The model
   was only ever given moods and self-care answers. Fixed: filter is `'note'`.
2. **`/sil` was a dead command.** Detector existed, no handler. Now aliased to
   the silence check.
3. **`/system` could drift** from the detector table (hand-written list omitted
   `/sil`). Now generated from the registry and covered by a parity check.

# 9. NEXT INCREMENTS (NOT IN THIS REV)

| ID | ITEM | NOTE |
|----|------|------|
| N1 | Proactive morning question from digest spikes/drops | “Machine asks first”; widget + device |
| N2 | Cache `generated_story` per (user, period, day) | Avoid repeat vendor spend |
| N3 | Server-side rank + badge hook | Cross-device rank (today per-device) |
| N4 | Local-timezone day bucketing | Digest uses UTC days; entries carry `context.timeZone` |
| N5 | Route digest through Quantum Intent Engine signals | Close the loop: story → intent → next question |

# 10. VERIFICATION

```
node --experimental-strip-types scripts/tests/test-log-commands.ts   → 15/15 PASS
npx tsc --noEmit -p tsconfig.json   → 0 new errors (128 pre-existing, unchanged)
client build (esbuild, -prod)       → completes
```

```
AUTHORIZED BY: S-2 // VADIK MARMELADOV
```
