# LOT® Log — Command System, /story Compression, Arcade Ladder

**Document:** LOT-TECH-LOG-CMD-01 · **Date:** 2026-10-31 · **Owner:** S-2 // Vadik Marmeladov
**Status:** IMPLEMENTED (shared modules + server + client wired) · **Verification:** see §9

---

## 1. Purpose

The Log is a **passive AI UI**: the user writes, never answers a prompt. Each entry is stamped
with environment context (weather, time, sky, location, astrology). The machine reads the
stream, compresses it, and hands the person back a short story of their own life — closing
the loop:

```
LOT User data → LOT Quantum Intent Engine → AI vendor (Together AI) → LOT personalized data stored
   (Log rows       (client intentionEngine;      (/api/story →            (generated_story Log row
    + context)      state + index sent)           aiEngineManager)         + digest in metadata)
```

This change adds the **command layer** that lets the user pull from that loop on demand,
without leaving the Log: `/system` and `/story [period]`, plus the **Arcade** progression
shown with them.

## 2. User-facing behavior

| Input in Log | Result |
|---|---|
| `/system` (alias `/commands`) | Help screen listing **every** command, grouped AI / CONTEXT / BODY / AMBIENT / SYSTEM, with an ARCADE line (level, XP bar) on top. |
| `/story` | Compressed story of **today**. |
| `/story week` · `month` · `year` | Same, over a rolling 7 / 30 / 365-day window. Aliases `d w m y`, `today`. Unknown argument → `day`. |
| 📖 emoji | Same as `/story`. |

`/story` output = story text (also appended to the entry as `📖 …`) + one Arcade line.
Story generation remains a **Usership** feature (server returns 403 text otherwise); `/system`
is available to everyone.

## 3. Architecture

```
src/shared/utils/logCommands.ts      REGISTRY. One row per command; buildSystemHelp(); parseStoryPeriod()
src/shared/utils/storyCompression.ts DIGEST.   buildStoryDigest() · digestToPromptBlock() · composeDigestStory()
src/shared/utils/arcade.ts           LADDER.   computeArcade() · formatArcadeLine()
src/client/utils/logTriggers.ts      DETECTOR  (unchanged) keyword/emoji → trigger id
src/client/components/Logs.tsx       HANDLERS  system-help now generated; story-mode sends `period`
src/client/queries.ts                useStoryGeneration: + period, + arcade in response
src/server/routes/api.ts             POST /api/story: digest → prompt → Together AI → store; deterministic fallback
scripts/tests/test-log-commands.ts   SELF-TEST (npm run test:log-commands)
```

All three shared modules are **pure** (no stores, DOM, network) and run identically on client
and server.

### 3.1 Registry = single source of truth
`/system` previously hard-coded its list inside `Logs.tsx` and could silently drift from the
real triggers. It is now generated from `LOG_COMMANDS`. The self-test fails if any registry
row lacks a trigger id or keyword in `logTriggers.ts`.

**To add a command:** (1) row in `LOG_COMMANDS`; (2) rule in `logTriggers.ts` `RULES`;
(3) handler branch in `Logs.tsx`; (4) `npm run test:log-commands`.

### 3.2 Story compression (the "compressed story" pipeline)
1. Server loads the user's recent Log rows (300 / 600 / 2000 by period).
2. `buildStoryDigest` keeps **only the user's own words** (`log_entry`, `journal`). Generated
   stories are excluded so the machine never feeds on its own output (no echo loop).
3. Digest fields: entries, words, active days, streak, **peak/low day**, tone **drift**
   (rising/falling/steady — first vs. second half of the window), **volume-spike days**
   (≥2× period mean and ≥3 entries — the "pattern change" signal for follow-ups), dominant
   city and moon phase, average temperature (Kelvin auto-converted), recurring words,
   up to 3 short (≤90 char) notable quotes.
4. `digestToPromptBlock` renders it as a terse block appended to the vendor prompt — far
   fewer tokens than raw entries.
5. The vendor returns the story; it is stored as a `generated_story` Log row with
   `metadata.period` and `metadata.digest` (so future follow-ups can read compressed history
   rather than re-scan).
6. **Fallback:** if the vendor call fails, `composeDigestStory` writes a deterministic
   second-person story from the digest. Still personal; no vendor required.

**Honesty boundary.** Peaks/lows are a *lexical + volume heuristic* (small positive/negative
word lists), **not** clinical sentiment analysis. The prompt tells the model to surface them
gently and never diagnose. Treat them as signals, not facts.

### 3.3 Arcade ladder (self-care gamification)
Ten calm ranks: SIGNAL · SPARK · ROUTINE · RHYTHM · ANCHOR · COMPASS · LANTERN · KEEPER ·
ORACLE · CONSTELLATION (thresholds 0 → 8000 XP).

| Action | XP |
|---|---|
| Log entry | 3 (+2 if ≥20 words, +2 more if ≥60 words) |
| First generated story of a day | 5 |
| 7 consecutive writing days | +10 |
| **Daily cap** | **25** |

Design rules: rewards **consistency and reflection**, not volume — spamming 500 entries earns
at most 25 XP/day. **No penalty for gaps** and no streak-loss mechanic (self-care, not
anxiety). Deterministic: same logs → same level. This is the Log on-ramp; it does not replace
the badge codex in `docs/badges/`. XP is computed from loaded Log rows (client: current
`useLogs()` cache; server: the story query window), so it is **approximate for very long
histories** until a persisted counter exists (see §8).

## 4. API contract

`POST /api/story`
```jsonc
// request
{ "logText": "string", "period": "day|week|month|year", "quantumState": {...}, "userIndex": {...} }
// response
{ "story": "string", "logId": "uuid|null", "period": "week", "arcade": "LVL 3 ROUTINE  ▓▓▓▓▓░░░░░  250 XP  → RHYTHM in 100" }
```
Rate limit unchanged (5/min). `period` is optional and defaults to `day`, so older clients
keep working.

## 5. Privacy
- Raw entries are never sent in bulk: the prompt carries the digest plus ≤3 truncated quotes
  and the last ≤5 truncated entries (pre-existing behavior retained).
- No audio, photo or sensor capture — context is metadata only, per product principle.
- Generated stories are excluded from future digests.

## 6. Failure modes
| Failure | Behavior |
|---|---|
| Vendor down / timeout | Deterministic digest story (§3.2.6); arcade line still returned |
| No entries in window | "Nothing written {today/this week…} yet." |
| Non-Usership | 403 message (unchanged) |
| Unknown `/story` argument | Treated as `day` |
| Arcade compute throws | Arcade line omitted from `/system`; help still renders |

## 7. Doctrine alignment
Passive AI UI (no prompts) · Context on every record · Compress-then-return loop ·
Together AI as sole vendor behind the Quantum Intent Engine · Arcade evolution inside a
self-care company (calm, non-punitive).

## 8. Roadmap (not built — recorded honestly)
1. **Proactive follow-up:** use `spikeDays` / `drift` to have the machine ask first
   (morning widget or LOT device) — the digest already emits the signal.
2. **Persisted Arcade counter** (user metadata) so XP is exact for multi-year histories.
3. Arcade rank-up toast + badge-codex bridge.
4. Hierarchical compression: day digests → week → month → year stored as `generated_story`
   rows, so `/story year` reads 12 monthly digests instead of 2000 rows.
5. Server-side unit tests in CI (repo has no test runner; self-test is a plain Node script).

## 9. Verification record
| Check | Result |
|---|---|
| `npm run test:log-commands` (registry↔triggers, help completeness, period parse, digest, fallback, arcade caps) | **PASS** (all assertions) |
| `tsc --strict --noEmit` on the three shared modules | **PASS** |
| `git diff --check` | PASS |
| Full `yarn build` (client+server) | **NOT RUN** — `npm ci` in the cloud sandbox fails on a pre-existing `@nanostores/react@0.4.1` ↔ `nanostores@0.9.5` peer conflict; `node_modules` unavailable. Edits to `Logs.tsx`, `queries.ts`, `api.ts` are small and syntactically mirror existing patterns, but were **not compiled**. Run `yarn build` before deploy. |

See `docs/benchmark/LOT-SR-20261031-01.md` for the session report.

AUTHORIZED BY: S-2 // VADIK MARMELADOV
