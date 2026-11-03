```
╔══════════════════════════════════════════════════════════════════════╗
║            LOT SYSTEMS — LOG ENTRY SYSTEM (TECHNICAL SPEC)           ║
╠══════════════════════════════════════════════════════════════════════╣
║  DOC      : LOG-ENTRY-SYSTEM                                         ║
║  CLASS    : RESTRICTED // S-2 EYES                                   ║
║  S-2      : VADIK MARMELADOV                                         ║
║  DATE     : 2026-11-03                                               ║
║  STATUS   : IMPLEMENTED (unit-tested; live-vendor path untested)     ║
╚══════════════════════════════════════════════════════════════════════╝
```

## 1. PURPOSE

The Log is a **passive AI UI**. The user writes; they are never prompted or
quizzed. Every entry is stored with ambient context metadata (weather, city,
humidity, moon phase, zodiac, time zone). The machine later compresses that
record into a story and flags spikes and pattern changes.

```
LOT User data -> LOT Quantum Intent Engine -> AI vendor (Together AI) -> LOT personalized data stored
   (Log rows)     (digest + state + rules)     (story generation)         (event: generated_story)
```

## 2. COMMANDS

All slash commands live in one registry: `src/client/utils/logCommands.ts`
(`LOG_COMMANDS`). `/system` renders from that table, so no command can exist
undocumented. `scripts/tests/test-log-commands.ts` asserts every registered
command is also a live trigger in `logTriggers.ts` (registry cannot drift).

| Input | Result |
|---|---|
| `/system` | Full command list, grouped AI / RITUAL / CONTEXT / INTERFACE |
| `/system ai` · `/system ritual` · `/system story` | Filtered by category or command name; no match prints `NO COMMAND MATCHES` |
| `/story` | Compressed story, default window = week |
| `/story day` · `week` · `month` · `year` | Compressed story of that window |

**Argument timing.** Triggers fire on text change, so `/story` is detected the
moment it is typed. `system-help` and `story-mode` are therefore *deferred
900 ms* (`scheduleDeferred` in `Logs.tsx`) and re-read the live text, letting
the user finish `/story month` before it runs. Detection itself is unchanged
(`detectNewTriggers` delta logic), so editing around a command does not refire.

**Gate.** `/story` is Usership-only (HTTP 403 otherwise) — unchanged from prior behaviour.
Rate limit 5/min.

## 3. STORY PIPELINE

`POST /api/story` body: `{ logText, period?: day|week|month|year, quantumState?, userIndex? }`

1. Fetch the user's logs from the last 365 days (cap 3000 rows).
2. `buildDigest(rows, period, now)` (`src/server/utils/log-story.ts`, pure) produces:
   entries, active days, streak, mood list + mood shift, top cities, avg temp
   (°C), avg humidity, moon phases, time-of-day histogram, spikes, trimmed
   excerpts, arcade state.
3. `digestToPrompt` + a period-specific system prompt go to Together AI
   (`aiEngineManager.getEngine('together')`). Prompt rule: *use only facts in the digest; never invent.*
4. Result is stored as `event: 'generated_story'` (`metadata.period`, `metadata.digest` without excerpts).
5. Response: `{ story, logId, period, arcade, spikes }`.
6. **Vendor failure** returns `composeLocalStory(digest)` — a deterministic
   summary built only from real digest values (previously a static
   placeholder). `logId` is `null` in that case; nothing is persisted.

The client appends `📖 <story>` to the entry (existing behaviour) and shows a
status line under it: `WEEK · KEEPER · LV 4 · 312 XP · STREAK 5D · 288 TO NAVIGATOR · SILENCE GAP`.
Excerpts fed to later stories drop everything after `📖` and strip `/story` /
`/system`, so generated text and commands do not feed back into the digest.

## 4. SPIKE / PATTERN-CHANGE RULES (deterministic)

Window must be >= 3 days. These are the hooks for future proactive follow-ups.

| Kind | Rule |
|---|---|
| `volume-spike` | day entry count > max(3, 2.5 x median active-day count) |
| `silence-gap` | >= 3 consecutive days with no entry (including an ongoing gap up to *now*) |
| `mood-shift` | modal mood of the newer half of check-ins differs from the older half (needs >= 4 check-ins) |

Design note: a mean+2σ rule was tried first and rejected — with few active days
(n=4) a 2σ outlier is mathematically impossible, so spikes could never fire.

## 5. ARCADE (gamified evolution)

Self-care first: ranks name a *practice*, not a score. The story prompt is told
to mention rank only in passing.

| XP source | Value |
|---|---|
| Journal / log entry | +10 |
| Emotional check-in | +5 |
| Memory answer, self-care or energy check-in | +3 |
| Streak | +2 per streak day, capped at 30 days (+60) |

Level = `floor(sqrt(XP/5)) + 1`.

| Rank | Min XP |
|---|---|
| SIGNAL | 0 |
| OBSERVER | 50 |
| KEEPER | 200 |
| NAVIGATOR | 600 |
| ARCHITECT | 1500 |
| ORACLE | 4000 |

Streak = consecutive days with an entry ending today, or yesterday (a streak survives until midnight).
This server-side arcade is computed from the Log only; it is **separate from**
the client Badge Codex (`badges.ts`) and Interface Evolution levels. Unifying
them is an open item (section 8).

## 6. FILE MAP

```
src/client/utils/logCommands.ts      command registry, /story + /system parsers, help renderer
src/client/utils/logTriggers.ts      trigger detection (unchanged)
src/client/components/Logs.tsx       deferred triggers, story meta line, wider command column
src/client/queries.ts                useStoryGeneration: period in, arcade/spikes out
src/server/utils/log-story.ts        PURE: digest, spikes, streak, arcade, local story
src/server/routes/api.ts             POST /story rewritten around the digest
scripts/tests/test-log-story.ts      engine tests
scripts/tests/test-log-commands.ts   registry/parser tests
```

## 7. VERIFICATION

```
npx tsx scripts/tests/test-log-story.ts      -> log-story: all assertions passed
npx tsx scripts/tests/test-log-commands.ts   -> log-commands: all assertions passed
tsc --project tsconfig.server.json --noEmit  -> zero errors in touched server files
tsc --noEmit -p tsconfig.json                -> 4 errors in Logs.tsx, identical to base commit (pre-existing, not introduced)
esbuild Logs.tsx                             -> parses
NOT RUN: full yarn build, live Together AI call, browser test of the 900 ms deferral.
```

## 8. OPEN ITEMS / RISKS

1. **Live verification pending.** The endpoint was not exercised against Together AI or a database in this session.
2. Proactive follow-up on spikes (the "machine asks first" loop) is not wired; `spikes` are returned but nothing schedules a question yet.
3. Temperature unit: Log context stores Kelvin; digest converts any value > 150 as Kelvin. Revisit if a source ever stores Celsius above 150 (not physically plausible).
4. Server arcade vs client Badge Codex are two parallel progression systems.
5. Stories saved in `generated_story` rows are not yet re-compressed into weekly -> monthly -> yearly roll-ups (the "further compress the loop" step).
6. `/story` remains Usership-gated, so non-members see only the 403 text.

```
AUTHORIZED BY: S-2 // VADIK MARMELADOV
```
