<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT-LOG-COMMAND-SYSTEM
## Log Entry System — `/system` · `/story` · Command Registry · Arcade Rank

```
DOCUMENT   LOT-LOG-COMMAND-SYSTEM
CLASS      RESTRICTED // S-2 EYES
OWNER      S-2 (Vadim Marmeladov)
DATE       2026-10-04
BRANCH     claude/youthful-ritchie-bxfcxl
STATUS     IMPLEMENTED — see §11 for verification evidence
```

---

## 0. MISSION

The Log is a **passive AI UI**. The operator writes; the machine listens. No prompts, no questions, no forms. Every entry is stamped with context metadata (weather, city, time, humidity, sky, astrology). The machine later compresses that record into a story and hands it back, closing the loop:

```
 click / entry ──► context snapshot ──► LOT personalized data
      ▲                                          │
      │                                          ▼
   operator  ◄──── compressed story ◄──── LOT® AI compression
```

This document specifies the Log **command layer** — the two operator-facing entry points to that loop:

| Command | Purpose | Loop position |
|---|---|---|
| `/system` | Show every available command, grouped, with arcade rank | Discovery |
| `/story [day\|week\|month\|year]` | Return the compressed story of the chosen window | Return path |

Everything else in the registry (`/scan`, `/qi`, `/breathe`, …) predates this work and is unchanged in behaviour; it is now *listed* from one source of truth.

---

## 1. ARCHITECTURE

```
CLIENT                                                SERVER
──────                                                ──────
Logs.tsx (NoteEditor)
  │ keystroke
  ▼
logTriggers.ts   detectNewTriggers()  ◄─ RULES (what fires)
  │ fresh triggers
  ├─► logCommands.ts   markDiscovered()      (arcade, localStorage)
  ├─► /system ► renderSystemHelp(COMMANDS)   (what is listed)
  └─► /story  ► parseStoryCommand()
                 │  1.5 s pause (scope word may follow the command)
                 ▼
          POST /api/story { logText, scope, quantumState, userIndex }
                 │                                   │
                 │                          routes/api.ts  /story
                 │                            1. Usership gate (403 otherwise)
                 │                            2. Log.findAll(window, ≤2000)
                 │                            3. compressRecords()   ◄─ story-compression.ts (pure)
                 │                            4. renderStatsBlock()  → prompt data block
                 │                            5. Together AI completion
                 │                               └─ on failure: fallbackStory() (deterministic)
                 │                            6. Log.create(event 'generated_story', scope, source)
                 ◄────────── { story, scope, source, logId }
  │
  ▼ story appended to the entry with 📖 prefix
```

**Proposed data logic (S-2 directive):**
`LOT User data → LOT Quantum Intent Engine → AI vendor processor (Together AI) → LOT personalized data stored`
This work implements the right half of that chain for `/story`: user records → compression → Together AI → `generated_story` stored. The QIE state (`quantumState`, `userIndex`) is passed through unchanged as *current-state* context.

### Files

| File | Role | New / Changed |
|---|---|---|
| `src/client/utils/logCommands.ts` | Command registry, `/system` renderer, arcade ranks, `/story` argument parser, discovery persistence | **NEW** |
| `src/server/utils/story-compression.ts` | Pure compression: window → stats → prompt block / fallback story | **NEW** |
| `scripts/tests/test-log-commands.ts` | Drift + parsing + compression test (no DB, no network) | **NEW** |
| `src/client/utils/logTriggers.ts` | Added `/help` alias to `system-help` | changed |
| `src/client/components/Logs.tsx` | `/system` from registry; `/story` scope + deferral; discovery marking | changed |
| `src/client/queries.ts` | `useStoryGeneration` accepts `scope`, returns `scope`/`source` | changed |
| `src/server/routes/api.ts` | `/story` rewritten around compression | changed |

> **Git note:** `.gitignore` contains a blanket `server/` rule (compiled-output guard). Existing `src/server/**` files are tracked, but **new** server files must be added with `git add -f`. `story-compression.ts` was added this way.

---

## 2. `/system` — COMMAND INDEX

Typing `/system` (aliases: `/commands`, `/help`) renders the SYSTEM block under the entry.

### 2.1 Single source of truth

`COMMANDS` in `logCommands.ts` is the only list the help screen reads. Previously the list was a hardcoded string array inside `Logs.tsx` and could drift from `RULES` in `logTriggers.ts` (a command could fire but be undocumented, or vice-versa). The test suite now asserts that **every registry command fires its declared trigger**.

### 2.2 Registry (16 commands)

| Category | Command | Trigger id | Description |
|---|---|---|---|
| MEMORY | `/story [day\|week\|month\|year]` | `story-mode` | Compressed story of the window |
| MEMORY | `/prayer` | `prayer-mode` | Contextual scripture |
| MEMORY | `/how` | `how-checkin` | Open LOT AI check-in (System tab) |
| SYSTEM | `/system` | `system-help` | This screen |
| SYSTEM | `/scan` | `ai-scan` | System status overview |
| SYSTEM | `/qi [query]` | `qi-rfi` | Quantum Intelligence request |
| SYSTEM | `/assembly` | `assembly-check` | Self-assembly module status |
| SYSTEM | `/phys` | `phys-report` | Physiological cohort report |
| SYSTEM | `/qos` | `qos-report` | Quantum OS state analysis |
| WELLBEING | `/fast` | `force-fast` | Orthodox fasting calendar |
| WELLBEING | `/breathe` | `breathe` | 4-2-6 breathing |
| WELLBEING | `/freeze` | `freeze-widgets` | Pause-and-reflect protocol |
| WELLBEING | `/silent` | `silent-mode` | Signal silence check |
| AMBIENT | `/synth` | `toggle-synth` | Keyboard sound |
| AMBIENT | `/radio` | `radio-toggle` | Radio |
| AMBIENT | `/night` | `night-mode` | Dark mode |

### 2.3 Render contract

`renderSystemHelp()` returns plain text consumed by the existing renderer in `Logs.tsx`:

- line starts with `/` → command row: `cmd`, **two or more spaces**, description
- any other non-empty line → section header (11 px, tracked, 40 % opacity)
- blank line → spacer

A discovered command's description is prefixed `✓ `. The test asserts every command row still splits on 2+ spaces.

---

## 3. `/story` — COMPRESSED USER STORY

### 3.1 Syntax

```
/story            → week (default)
/story day        → last 24 h          (aliases: today, daily)
/story week       → last 7 days        (weekly)
/story month      → last 30 days       (monthly)
/story year       → last 365 days      (yearly, annual)
```

Anything else after `/story` is ignored for scope and stays as the operator's own entry text. The 📖 emoji alone still triggers the command (scope = week).

### 3.2 Timing — why there is a 1.5 s deferral

Triggers fire on the keystroke that completes the token `/story`. A scope word typed afterwards would always be missed. The client therefore waits 1.5 s, re-reads the **live** editor text, verifies `/story` (or 📖) is still present, then parses the scope. Deleting the command inside the window cancels the request. A ref (`storyInFlightRef`) guards against double submission and is released on success and on error.

### 3.3 Compression pipeline (`story-compression.ts`)

Input: log records in the scope window (`createdAt ≥ now − window`, newest first, capped at 2000).
Output: `StoryStats`.

| Stat | Derivation |
|---|---|
| `journalEntries` | records with event `note` / `journal` / `log_entry` and non-empty text |
| `activeDays`, `consistency` | distinct UTC days; ratio vs `min(window, 30)` → strong ≥ .7 · steady ≥ .4 · sporadic ≥ .15 · minimal · none |
| `moodArc`, `dominantMood` | `emotional_checkin` → `metadata.emotionalState`, valence per day (+1 positive / −1 hard / 0 neutral) |
| `peak` / `low` | best / worst mood-valence day (needs ≥ 2 mood days and a spread) |
| `trend` | mean valence 2nd half − 1st half of the arc (needs ≥ 4 mood days): > .25 rising, < −.25 falling |
| `volumeSpike` | busiest day ≥ 2× the per-day mean **and** ≥ 4 records (needs ≥ 3 active days) — the "spike / pattern change" signal |
| `timeOfDay` | UTC buckets: night < 06 ≤ morning < 12 ≤ afternoon < 18 ≤ evening |
| `cities`, `avgTempC` | from `record.context` (`city`, `temperature` in **Kelvin**) |
| `selfCareCount`, `intentionCount` | `self_care_complete(d)`, `intention` |
| `excerpts` | most recent journal lines, 180 chars each; limit 6/8/10/12 by scope |

### 3.4 Vendor prompt

`storySystemPrompt(scope)` + `renderStatsBlock(stats)` + the current entry + current QIE state. Rules enforced in the prompt: second person; word budget per scope (60–120 / 100–180 / 140–220 / 180–260); **facts only from the data**; surface high peak, low peak, spikes; compassionate about gaps; not medical advice; one quiet forward-looking closing line.

### 3.5 Fallback — the vendor is never a single point of failure

If Together AI errors or returns empty, `fallbackStory(stats)` produces a deterministic, honest compression (e.g. *"5 active days this week, 7 journal entries. Calm carried the mood. The arc is rising. High point: 2026-10-03. …"*). The response carries `source: 'fallback'`. An empty window returns *"No signal recorded this week. The record is open — one entry starts the loop."* The client's own offline message remains for network-level failure.

### 3.6 Storage

Each story is written as a Log row: `event: 'generated_story'`, `text` = story, `context` = live log context, `metadata` = `{ story, scope, source, logText, quantumState, stats{totalRecords, journalEntries, activeDays, dominantMood, trend}, timestamp }`. Only aggregates are stored in `stats`; no raw excerpts are duplicated.

> `generated_story` is deliberately **distinct** from `lot_ai_story` (weekly Job 24). `lot_ai_story` feeds QIE Pattern P87; operator-invoked stories must not inflate it.

### 3.7 Access

Usership gate unchanged: non-Usership callers receive `403` with an explanatory message. Rate limit unchanged: 5 / minute.

---

## 4. BUG FIXED IN PASSING

The previous `/story` route selected journal text with `event === 'log_entry' || 'journal'`. The Log section writes entries as **`event: 'note'`**. The old story therefore never saw the operator's actual journal. The new pipeline reads `note` (plus the two legacy names).

---

## 5. ARCADE LAYER — OPERATOR RANK

LOT is a self-care technology company; its arcade is *discovery and consistency, never speed or volume*. Every first use of a command is a **discovery**, persisted per viewer in `localStorage` (`lot:log-commands-discovered`; wrapped in try/catch — the UI works without storage).

| Rank | Commands discovered |
|---|---|
| RECRUIT | 0–2 |
| CADET | 3–5 |
| OPERATOR | 6–9 |
| SPECIALIST | 10–13 |
| COMMANDER | 14–15 |
| ARCHITECT | 16 (all) |

`/system` prints: `RANK CADET · 3/16 commands discovered` and `NEXT OPERATOR in 3 more`. The ladder's top rung is `COMMANDS.length`, so adding a command automatically raises the bar for ARCHITECT.

**Out of scope here (roadmap, §9):** server-side persistence of rank so it follows the operator across devices, and a badge-codex entry for ARCHITECT.

---

## 6. PRIVACY & ETHICS (COSMO GATE)

- Only aggregates and ≤ 180-char excerpts leave the server toward the vendor. Per-record context (precise weather, city per entry) is summarised, not forwarded.
- The prompt forbids invention, diagnosis, and medical advice.
- Gaps and low points are acknowledged with compassion; positivity is not forced.
- No photo or sound is ever captured. Context is environmental metadata only.
- Stories are user-initiated (`/story`); no unsolicited analysis is added by this change.

---

## 7. HOW TO ADD A COMMAND

1. Add a `LogTrigger` id and a `RULES` entry in `logTriggers.ts`.
2. Add a `LogCommand` row in `COMMANDS` (`logCommands.ts`) — pick a category.
3. Handle the trigger in the `NoteEditor` effect in `Logs.tsx`.
4. Run `npx tsx scripts/tests/test-log-commands.ts`. Step 2 is enforced: a trigger missing from the registry, or a registry command that does not fire, fails the suite.

---

## 8. LIMITS / KNOWN BEHAVIOUR

- Day/time buckets use **UTC**; per-user timezone bucketing is not yet applied.
- Mood valence uses the same positive/hard vocabularies as Job 24; unknown moods are neutral (0).
- `year` scope reads up to 2000 records; very heavy loggers get the most recent 2000.
- `/story` text is appended to the entry (existing behaviour), so a story becomes part of the journal and, later, part of the next compression. Intentional: the loop compresses itself.
- Command deferral is 1.5 s; very fast typists see the story slightly after the command, slower typists may need to retype `/story <scope>` if they pause > 1.5 s mid-command.

---

## 9. ROADMAP — THE MACHINE ASKS FIRST

Not implemented here; recorded so the design stays coherent.

1. **Passive follow-up.** Reuse `volumeSpike` / `trend === 'falling'` as a *detector*: when a spike or pattern change is found on a journal entry, surface one gentle follow-up widget (never a modal).
2. **Morning ask.** A once-a-day question on any device (site widget or LOT Computer device) seeded from yesterday's `/story day`.
3. **Scheduled compression.** Extend Job 24 (weekly) with day / month / year jobs writing the same `generated_story` shape, so `/story` can return a cached compression instantly.
4. **Rank persistence + badges.** Store discovery server-side; ARCHITECT badge in the Codex.
5. **Per-user timezone** for rhythm buckets.
6. **Compression of compressions.** Month stories built from week stories (token-cheap, higher-level pattern).

---

## 10. CHANGELOG

| Date | Change |
|---|---|
| 2026-10-04 | Command registry; `/system` generated; `/story` scopes (day/week/month/year); compression module; deterministic fallback; `note`-event bug fixed; arcade rank; `/help` alias; test suite; this document |

---

## 11. VERIFICATION

See `docs/benchmark/LOT-SR-20261004-LOGCMD-01.md` for the command-by-command evidence log of this change (test run, typecheck, build).

Run locally:

```bash
npx tsx scripts/tests/test-log-commands.ts
```

*End of document.*
