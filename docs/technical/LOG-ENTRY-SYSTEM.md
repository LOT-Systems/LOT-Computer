<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOG ENTRY SYSTEM — Technical Reference
### LOT® AI · Passive Journal · Command Registry · Story Compression · Arcade Evolution
**Revision:** LES-1 · **Date:** 2026-10-20 · **Classification:** Operator Reference · **Owner:** S-2

---

## 0. MISSION

The Log is a **passive AI UI**. The operator writes entries — no prompts, no questions, no forms. Every entry is stamped with context meta-data (weather, humidity, sky, city, moon, zodiac, time). The machine later compresses entries into a **story** and hands it back, closing the loop: *person → data → compression → person.*

```
LOT User data  →  LOT Quantum Intent Engine  →  AI vendor (Together AI)  →  LOT personalized data stored
 (Log + context)     (digest + pattern/spike)        (story generation)         (Log: generated_story)
```

## 1. DOCTRINE

| # | Rule | Enforcement |
|---|------|-------------|
| 1 | **Passive first.** No prompt or question is ever required to journal. | Entry box is free text. Commands are opt-in. |
| 2 | **Context on every record.** Click = snapshot of the moment. No photo, no audio. | `getLogContext()` in `src/server/utils/logs.ts`. |
| 3 | **Machine asks second.** Follow-ups are driven by a spike or pattern change, never by schedule alone. | Spike detection (§5.3). |
| 4 | **Compression, not surveillance.** Stories use only the operator's own data; the model is told never to invent events. | Prompt rules (§5.4). |
| 5 | **One source of truth for commands.** A command cannot exist undocumented. | `LOG_COMMANDS` registry (§3). |
| 6 | **COSMO Gate.** Nothing ships that Kuzya would not approve. No diagnosis, no advice from the story module. | Prompt rules (§5.4). |

## 2. FILE MAP

| Path | Role |
|------|------|
| `src/shared/utils/logCommands.ts` | **NEW.** Command registry, `/system` builder, `/story` argument parser. Pure. |
| `src/shared/utils/storyCompression.ts` | **NEW.** Window math, log digest, spike detection, prompt builder, Arcade status. Pure. |
| `src/client/utils/logTriggers.ts` | Trigger detector (emoji + `/keyword`). Unchanged; keywords still authoritative for firing. |
| `src/client/components/Logs.tsx` | `NoteEditor` — executes triggers, renders `/system` and `/story` blocks. |
| `src/client/queries.ts` | `useStoryGeneration` mutation (now carries `period`, returns `arcade`, `spikes`). |
| `src/server/routes/api.ts` | `POST /api/story` — gathers window, compresses, calls AI, stores result. |
| `scripts/tests/test-log-story.ts` | Unit tests for both shared modules. |

## 3. COMMAND REGISTRY

`LOG_COMMANDS` in `logCommands.ts` is the registry. Fields: `name`, `aliases`, `emoji?`, `category`, `args?`, `description`.

Typing **`/system`** in a Log entry renders every registered command grouped by category:

```
STORY      /story [day|week|month|year]   /prayer
CONTEXT    /scan  /qi [query]  /qos  /phys  /assembly  /sil
PROTOCOL   /fast  /breathe  /freeze  /silent
MEDIA      /synth  /radio  /night
NAVIGATE   /how
SYSTEM     /system
SHORTCUTS  Ctrl+Enter
```

**Adding a command:** (1) add a row to `LOG_COMMANDS`; (2) add the matching rule in `logTriggers.ts` `RULES`; (3) handle the new `LogTrigger` in `NoteEditor`. The test suite fails if a registered command is missing from the rendered help.

> Known debt: steps (2) and (3) still duplicate the name. Next revision should generate `RULES` from the registry.

## 4. `/system`

* Trigger: `/system` or `/commands`.
* Output: structured `SystemHelpSection[]` rendered in a `SYSTEM:` block (previously a hard-coded string list that had drifted from the trigger table).
* Pure function `buildSystemHelp()`; `renderSystemHelpText()` provides a plain-text form for non-React surfaces (device, CLI, email).

## 5. `/story` — COMPRESSED USER STORY

### 5.1 Syntax

```
/story            → week (default)
/story day        → last 24 hours            (aliases: today, d)
/story week       → last 7 days              (weekly, w)
/story month      → last 30 days             (monthly, m)
/story year       → last 365 days            (yearly, y)
/story feeling low   → week, with "feeling low" passed as the operator note
```
`📖` also fires the trigger. Non-period words after `/story` are kept as the operator note.

### 5.2 Digest (`compressLogs`)

For the rolling window the server computes: journal count, active days, current streak, entries per day, evenly-sampled excerpts (cap 8/10/14 by period), mood tally, self-care Q&A, environment (avg °C converted from Kelvin, avg humidity, modal city, modal sky, moon phases).

### 5.3 Spike / pattern-change detection

| Kind | Rule |
|------|------|
| `volume` | A day with ≥ 3 entries and count > mean + 1.5σ (needs ≥ 3 active days). |
| `mood-shift` | ≥ 4 mood check-ins and the dominant mood of the first half differs from the second half. |

Spikes are (a) injected into the prompt so the story names the change gently with at most one open question, (b) returned to the client and (c) stored in the story Log metadata — the hook for the **machine-asks-first** follow-up (morning question on any device or widget).

### 5.4 Prompt contract

Second person · only supplied data · no invented events · name the high and low · environment only where it explains mood · honest when data is thin · no advice, no diagnosis · one quiet forward-looking closing sentence. Target length scales with period (80–140 words for a day → 200–300 for a year).

### 5.5 API

`POST /api/story` (Usership-gated, rate-limited 5/min)

```jsonc
// request
{ "logText": "tired", "period": "week", "quantumState": {...}, "userIndex": {...} }
// response
{ "story": "...", "logId": "uuid", "period": "week",
  "arcade": { "xp": 1240, "level": 3, "rank": "COMBO", "nextLevelXp": 1600 },
  "spikes": ["4 entries on 2026-10-19 vs 1.3/day average"] }
```
Persisted as `Log { event: 'generated_story', metadata: { story, period, journalCount, spikes, arcade, logText, quantumState } }` with full context stamp. Stored stories are the substrate for the next, higher compression (week → month → year).

Failure mode: engine error returns the fixed fallback line and `logId: null`; nothing is stored.

## 6. ARCADE EVOLUTION

Gamified progression inside a self-care company: the Log is the game, the operator is the player, and the only score is showing up honestly.

```
XP    = entries·10 + activeDays·25 + streak·15 + min(stories,20)·50
LEVEL n requires 100·(n+1)² XP        (level 1 floor, cap 40)
RANK  = floor((level-1)/5)  →  INSERT COIN · PLAYER ONE · COMBO · HIGH SCORE ·
                               BOSS RUSH · FLOW STATE · GRAND MASTER · LEGEND
```
Status renders under each story as `WEEK · LVL 3 COMBO · 1240/1600 XP`. Rules: XP is never lost, streaks only add, there is no punishment mechanic — consistent with COSMO Gate. Ranks are a display layer; they are designed to later map onto the Badge Codex (`docs/badges/`, 812 badges at v32).

## 7. VERIFICATION

```
node --experimental-strip-types scripts/tests/test-log-story.ts      # → log-story tests: OK
tsc --noEmit --strict (shared modules)                                # → clean
```
Not run in this session: full `yarn build` (dependencies not installed in the cloud sandbox). `Logs.tsx`, `queries.ts`, `api.ts` edits were reviewed by hand only — **run `yarn build` before deploy.**

## 8. ROADMAP (next sessions)

1. **Morning follow-up:** consume `spikes` from stored stories to queue a single morning question (device or widget).
2. **Generate `RULES` from registry** (remove the §3 duplication).
3. **Hierarchical compression:** feed prior `generated_story` records (day→week→month→year) instead of raw excerpts for long windows.
4. **QIE hand-off:** pass the digest through the Quantum Intent Engine for pattern IDs before the vendor call.
5. **Arcade → Badges:** award codex badges at level thresholds; persist XP server-side.
6. **Vendor abstraction:** route through `aiEngineManager` fallback chain rather than pinning `together`.
7. **Privacy:** per-user opt-out of context fields sent to the vendor.

## 9. CHANGE LOG

| Rev | Date | Change |
|-----|------|--------|
| LES-1 | 2026-10-20 | Command registry; `/system` generated; `/story` periods; digest + spike detection; Arcade status; tests; this document. |
