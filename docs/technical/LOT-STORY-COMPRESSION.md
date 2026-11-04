# LOT® STORY COMPRESSION & ARCADE EVOLUTION
**Classification:** TECHNICAL REFERENCE · **Revision:** 1 · **Date:** 2026-11-04 · **Owner:** S-2

## 1. DOCTRINE
LOT® AI is *context-first, click-by-click*. Each widget and each Log entry adds a moment-snapshot (no photo, no audio). The machine's job is to **compress** those moments into a story and hand it back, tightening the loop: person → context → story → person. Peaks and lows surface from the compression; the user is never interrogated inside the Log.

## 2. PIPELINE
```
LOT User data (Log + mood/care check-ins + context meta)
   │
   ▼  storyCompression.compressLogs()      ← deterministic, pure, tested
LOT Quantum Intent Engine context  (energy / clarity / alignment / user index)
   │
   ▼  buildCompressionPrompt()             ← bounded digest, guardrails
AI vendor processor: Together AI  (aiEngineManager.getEngine('together'))
   │
   ▼
LOT personalized data stored  (Log event 'generated_story', metadata.digest/period/window)
```
The QIE state is supplied by the client (`getUserState`, `getUserIndex`) exactly as before; the server adds the compressed history.

## 3. THE DIGEST (what the vendor sees)
| Field | Meaning |
|---|---|
| `entryCount`, `wordCount`, `activeDays/windowDays` | volume, never judged |
| `currentStreak`, `longestStreak` | consecutive active days (today may be unwritten) |
| `moods[]` | tally of `emotional_checkin` states |
| `careAnswers[]` | last 5 memory/self-care Q→A |
| `environment` | avg °C (Kelvin auto-detected), top cities, top sky conditions |
| `spikes[]` | pattern changes (below) |
| `sampleEntries[]` | ≤6 evenly spaced entries, each truncated to 200 chars |

Window: day = 1d, week = 7d, month = 30d, year = 365d. Server reads up to 2000 recent logs.
Empty period → honest "quiet" message, **no model call**.

## 4. SPIKE / PATTERN-CHANGE DETECTION (`detectSpikes`)
| Kind | Rule |
|---|---|
| `volume` | day with ≥3 entries and ≥ mean + 2σ (windows ≥7 days, ≥3 active days) |
| `silence` | ≥3 empty days between two active days |
| `mood-shift` | dominant mood of 2nd half ≠ 1st half (≥4 mood check-ins) |
These are the hooks for the future *follow-up* engine ("machine asks first"): a spike on an entry is the trigger condition for a morning question or widget prompt. **Not built yet** — see §8.

## 5. PROMPT GUARDRAILS
Second person; length by period (80–260 words); facts from DIGEST only; no invention; one high / one low only if supported; silence ≠ failure; not medical advice with a fixed crisis line fallback; one quiet forward sentence; rank is never mentioned in prose.

## 6. ARCADE (GAMIFIED EVOLUTION)
Self-care company ⇒ **XP rewards showing up and reflecting, never intensity.**
| Source | XP | Anti-gaming |
|---|---|---|
| Journal entry | 10 | max 3 counted per day |
| Best streak | 25 per day beyond day 1 | capped at 7 steps |
| Mood / care check-in | 15 | — |
| Generated story | 40 | rate-limited 5/min |
Ranks: ROOKIE 0 · OBSERVER 50 · OPERATOR 200 · NAVIGATOR 600 · ARCHIVIST 1500 · ORACLE 4000.
XP is **derived from logs on request** (`GET /api/arcade`, and returned with `/story`), not stored — no migration, cannot desync. Missing a day never removes XP or rank (no loss mechanic).
Relationship to existing systems: this is a lightweight, Log-native layer; it does **not** replace or modify the 812-badge Codex (docs/badges/). Bridging rank → badges is open work.

## 7. API
`POST /api/story` body `{ logText, period?, quantumState?, userIndex? }` → `{ story, logId, period, arcade, digest }`
`GET /api/arcade` → `{ rank, level, xp, nextRank, xpToNext }`

## 8. ROADMAP (NOT IMPLEMENTED)
1. Morning proactive question seeded from `spikes[]` (widget + device).
2. Scheduled day/week/month/year stories via the existing job scheduler (cf. Job 24 weekly `lot_ai_story`), de-duplicated against `/story`.
3. Surface `suggestCommands()` autocomplete in the editor.
4. Bridge ARCADE rank to Badge Codex unlocks.
5. Per-user opt-out of vendor processing; log each vendor call.

## 9. PRIVACY NOTES
Entries sampled to the vendor are user text and are personal data. Digest is bounded (≤6×200 chars) and excludes email/ids. `generated_story` stores the digest (without samples). Review vendor retention terms before enabling for non-Usership users.

## 10. VERIFICATION STATUS
| Check | Result |
|---|---|
| `scripts/tests/test-log-commands.ts` (10 cases) | PASS |
| `tsc --strict` on shared + logTriggers | PASS |
| Server (`api.ts`) / client (`Logs.tsx`) full build | **NOT RUN** (dependencies not installed in session) |
| Live Together AI call | **NOT RUN** |
