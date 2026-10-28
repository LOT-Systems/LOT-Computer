```
================================================================================
LOT SYSTEMS / TECHNICAL SPECIFICATION
DOCUMENT: LOT-TS-LOG-SLASH-STORY
TITLE:    LOG ENTRY SYSTEM — /system COMMAND INDEX · /story COMPRESSED STORY
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
REV:      A
DATE:     2026-10-28
STATUS:   IMPLEMENTED (v1) · ARCADE TUNING PROVISIONAL
================================================================================
```

# 1. PURPOSE

The Log is a **passive AI UI**. The person writes; they are never prompted,
quizzed, or scored at write time. Every entry is stored with its context
(time, weather, location, sky). The machine later compresses that record back
into a story, and surfaces the intimate high and low peaks — closing the loop.

This document specifies the two Log commands that expose that loop:

| COMMAND  | EFFECT                                                         |
|----------|----------------------------------------------------------------|
| `/system`| Lists every available command (help screen).                   |
| `/story` | Returns the compressed story of the person's day/week/month/year. |

Both existed in rudimentary form. v1 (this revision) replaces the hard-coded
help and the raw-log story with a **single command registry** and a
**deterministic compression stage**.

# 2. DATA FLOW

```
LOT User data                       Log rows: note · emotional_checkin · self_care ·
  │                                 intention · answer   (+ LogContext on each)
  ▼
compressLogs()  ── src/shared/story-compression.ts   (deterministic, no network)
  │   window → buckets → mood series → signals → context → themes → ARCADE
  ▼
StoryDigest  (fixed shape, ~1 KB — the ONLY thing the vendor sees)
  │
  ▼
LOT Quantum Intent Engine prompt  ── buildStoryPrompt()
  │   + operator state (quantumState) + user index
  ▼
AI vendor processor: Together AI   ── aiEngineManager.getEngine('together')
  │   on failure / empty → composeLocalStory(digest)   (never a dead end)
  ▼
LOT personalized data stored  ── Log{event:'generated_story', metadata:{window,
                                  source, digest, story}}
  ▼
Client: stat grid + story text (also appended to the open entry as "📖 …")
```

**Design invariants**

1. The vendor receives the Digest, **never raw log rows**. Compression is the
   privacy boundary as well as the cost boundary.
2. `/story` always answers. Engine down → `composeLocalStory` renders the same
   Digest (`source:"local"` is recorded).
3. Machine output is never re-ingested. Text after `📖`/`🕯` and the command
   token itself are stripped from a note before it is counted
   (`ownText()`), so the story of next week is not a story about this week's story.
4. System noise (`user_login`, `theme_change`, `quantum_intent_signal`,
   `generated_story`, …) is not narrative and is ignored.

# 3. `/system` — COMMAND INDEX

Source of truth: `src/shared/slash-commands.ts` → `SLASH_COMMANDS`.
`renderSystemHelp()` builds the screen; Logs.tsx renders it. A command added to
the registry cannot be missing from the help.

| GROUP        | COMMANDS                                    |
|--------------|---------------------------------------------|
| INTELLIGENCE | `/story [day\|week\|month\|year]` · `/qi [query]` · `/scan` · `/assembly` |
| RITUAL       | `/prayer` · `/breathe` · `/freeze` · `/fast` |
| STATE        | `/phys` · `/qos` · `/sil` · `/silent`        |
| DEVICE       | `/synth` · `/radio` · `/night`               |
| NAVIGATION   | `/how` · `/system`                           |

Aliases (e.g. `/commands` → `/system`, `/pause` → `/freeze`) are listed in the
registry and mirror `RULES` in `src/client/utils/logTriggers.ts`. The test
suite fails if a registry command or alias has no detector (see §8).

**Adding a command:** (1) add a `LogTrigger` + `RULES` row in `logTriggers.ts`;
(2) add a row to `SLASH_COMMANDS`; (3) handle the trigger in `Logs.tsx`;
(4) `npm run test:story`.

# 4. `/story` — COMPRESSED STORY

## 4.1 Syntax

```
/story               → week (default)
/story day           → last 24 h      (aliases: today, daily, 24h, 1d)
/story week          → last 7 d       (weekly, 7d)
/story month         → last 30 d      (monthly, 30d)
/story year          → last 365 d     (yearly, annual, 365d)
```

Text written alongside the command is passed as context
(`rough day /story week`). Unknown arguments fall back to `week`.

## 4.2 Compression stage (`compressLogs`)

| FIELD       | DEFINITION |
|-------------|------------|
| `counts`    | notes · check-ins · self-care (`self_care`,`self_care_checkin`,`energy_checkin`,`intention`) · answers |
| `buckets`   | day window → hourly; week/month → daily; year → monthly. Boundaries use the user's UTC offset. |
| `mood`      | Emotional-state valence −1…+1 (e.g. fulfilled +0.9, tired −0.3, exhausted −0.8). Avg, top 3 states, best/worst bucket (needs ≥ 2 mood buckets). |
| `signals`   | Pattern detectors — see 4.3. |
| `context`   | Dominant city · dominant moon phase · mean °C (from Kelvin) · mean humidity. |
| `themes`    | Up to 5 words (≥ 4 letters, stop-words removed) appearing in **≥ 2 distinct entries**. |
| `excerpts`  | Last 3 of the person's own lines, ≤ 140 chars. |
| `arcade`    | See §5. |

## 4.3 Pattern detectors ("spike or pattern change")

| SIGNAL         | TRIGGER |
|----------------|---------|
| `volume-spike` | Peak bucket ≥ 3 entries **and** > mean + 1.5σ (σ over all slots, empty slots = 0). Needs ≥ 4 entries in window. |
| `mood-shift`   | Mean valence of 2nd half vs 1st half of the mood series differs by ≥ 0.4. Needs ≥ 4 mood samples. |
| `silence`      | Time since last entry > 24 h **and** > 2× the median inter-entry gap. Needs ≥ 3 entries. |

These are the hooks for the machine's follow-up behaviour ("detects a spike or
a pattern change"). In v1 they shape the story; proactive morning questions
that consume `signals` are specified in §9 (not yet built).

## 4.4 Output contract

`POST /api/story` body: `{ logText, window?, quantumState?, userIndex? }`

Response: `{ story, stats[], window, source: "together"|"local", arcade, logId }`

`stats` is the monospace stat grid:

```
WINDOW    WEEK · 7D
ENTRIES   12 · notes 8 · check-ins 3 · self-care 1
ACTIVE    5 days
MOOD      +0.31 · CALM×2 HOPEFUL×1
PEAK      2026-10-26 (4)
SIGNAL    MOOD-SHIFT — mood moved up (-0.4 → 0.5)
CONTEXT   Austin · Waxing Gibbous · 21°C
ARCADE    LVL 4 OPERATOR · 120 XP (+38) · STREAK 5D · 40 TO NEXT
```

Access: unchanged — Usership tag required (403 otherwise). Rate limit
5/min. Persisted row: `Log{event:'generated_story'}` with the Digest in
`metadata` (the future "story of stories": week stories compress into month,
month into year without re-reading raw rows).

# 5. ARCADE (GAMIFIED) EVOLUTION — *PROVISIONAL*

LOT is a self-care technology company; the arcade layer is a **side effect of
care, never the goal**. It is shown after the story, never at write time, and
never as a penalty (a broken streak resets quietly; no loss messaging).

| ITEM            | RULE (v1) |
|-----------------|-----------|
| XP per entry    | note 3 · self-care 4 · check-in 5 · answer 2 |
| Streak bonus    | +10 XP per consecutive active day (ending today or yesterday) |
| Level           | `floor(sqrt(XP/10)) + 1` — each level costs more than the last |
| Rank            | 1–2 INITIATE · 3–5 OPERATOR · 6–9 NAVIGATOR · 10–14 ARCHITECT · 15+ SAGE |
| `xpWindow`      | XP earned inside the selected window |

The ranks are deliberately separate from the existing 1–100 `UserNarrative`
level (`rpg-narrative.ts`) and the badge codex (`docs/badges/`); unifying them
is an open decision (§9). All constants live at the top of
`story-compression.ts` and are marked PROVISIONAL until S-2 signs off.

# 6. DEFECTS FIXED IN THIS REVISION

| ID  | DEFECT | FIX |
|-----|--------|-----|
| D-1 | `/story` selected events `log_entry`/`journal`, which nothing writes — real journal notes (`note`) were never read. | Compressor reads `note`, `emotional_checkin`, `self_care`, `intention`, `answer`. |
| D-2 | Self-care read from `memory_answer`/`self_care_checkin` only; actual events are `answer`/`self_care`. | Both spellings accepted. |
| D-3 | Appended `📖` story text re-entered the journal and would pollute the next story. | `ownText()` strips generated blocks + command token. |
| D-4 | Failure path returned a canned sentence and wrote nothing. | Local compose from Digest; persisted with `source:"local"`. |
| D-5 | `/system` help was a hard-coded array, drifting from the trigger table. | Registry + drift test. |

# 7. FILE MAP

| PATH | ROLE |
|------|------|
| `src/shared/slash-commands.ts` | Command registry, `renderSystemHelp()` |
| `src/shared/story-compression.ts` | `compressLogs`, `parseStoryWindow`, `composeLocalStory`, `buildStoryPrompt`, `computeArcade` |
| `src/server/routes/api.ts` | `POST /api/story` (compress → Together → persist) |
| `src/client/components/Logs.tsx` | `/system` + `/story` triggers, stat-grid rendering |
| `src/client/queries.ts` | `useStoryGeneration` types |
| `src/client/utils/logTriggers.ts` | Command detection (unchanged) |
| `scripts/tests/test-story-compression.ts` | 15 deterministic checks |

# 8. VERIFICATION

```
npm run test:story        15 checks: windows, boundaries, noise filter,
                          feedback isolation, mood/spike/silence detectors,
                          themes, Kelvin→°C, arcade math, registry↔trigger drift
npm run server:build      tsc typecheck + ESM fix            → PASS
npm run client:build      esbuild + postcss                  → PASS
```

Known baseline (pre-existing, untouched): 4 strict-mode type errors in
`Logs.tsx` lines ~101/105/3786/3853 under `tsc -p tsconfig.json`; the shipped
build gates (`server:build`, `client:build`) are green.

Not covered: live Together AI call and DB round-trip (no credentials or
database in the build environment). Verify on staging: `/story day` as a
Usership account, confirm a `generated_story` row with `metadata.digest`.

# 9. OPEN DECISIONS FOR S-2 (not built)

1. **Gating.** Compression and local story cost nothing; only Together
   narration needs Usership. Option: serve the local story to all users, AI
   narration to Usership.
2. **Machine asks first.** Feed `signals` + `silence` into the morning
   question (device or widget) so the follow-up is proactive. Needs a
   scheduled job; hook point is the Digest `signals[]`.
3. **Story of stories.** Roll stored `generated_story` day digests into week,
   week into month, month into year (true compression loop, no raw re-read).
4. **Arcade unification.** Merge `arcade` ranks with `UserNarrative.currentLevel`
   and the badge codex, or keep separate by design.
5. **Privacy.** Excerpts (≤ 140 chars × 3) of the person's own words are sent
   to the vendor. Option: themes-only mode, or a per-user opt-out.
6. **Medical boundary.** Prompt forbids medical advice and keeps heavy-stretch
   responses to one small step; a clinical-safety review is advised before
   wider rollout.

```
================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-TS-LOG-SLASH-STORY
================================================================================
```
