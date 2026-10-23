# LOT® LOG COMMAND SYSTEM — `/system` · `/story`

S-2: VADIK MARMELADOV · CLASS: ENGINEERING · REV A · 2026-10-23

## 1. PURPOSE

The Log is a passive-AI journal. The user writes; no prompts, no questions.
Every entry is stored with ambient context (weather, humidity, city, moon,
zodiac, time). Slash commands typed inside an entry are the only active
surface. Two are the front door to the data loop:

| Command | Effect |
|---|---|
| `/system` | Prints every available command, grouped (Story · Intelligence · Self-care · Environment). |
| `/story [day\|week\|month\|year]` | Compresses the user's own context-tagged records for that window into a short second-person story, ending with the Arcade standing line. Default scope: `day`. |

Loop (per product doctrine):

```
LOT User data -> LOT Quantum Intent Engine -> AI vendor (Together AI) -> LOT personalized data stored
```

`/story` implements the last two hops: the digest (below) is the QIE-side
compression; Together AI turns it into prose; the result is stored as a
`generated_story` Log row with the digest and Arcade standing in `metadata`.

## 2. DATA FLOW

```
NoteEditor (Logs.tsx)
  detectNewTriggers()            logTriggers.ts      "/story" detected
  1.5 s grace                    Logs.tsx            lets the user finish "/story week"
  parseStoryScope(live text)     logTriggers.ts      day|week|month|year
  POST /api/story {logText,scope,quantumState,userIndex}
        |
api.ts  POST /story            (Usership-gated, 5 req/min)
  Log.findAll(user, newest first, limit 1000; 3000 for year)
  buildStoryDigest(rows, scope)  story-compression.ts   PURE
  computeArcadeStanding(rows)    story-compression.ts   PURE
  Together AI completion  --fail-->  composeFallbackStory(digest)
  Log.create(event='generated_story', metadata={scope,digest,arcade})
        |
  {story, logId, scope, arcade} -> appended to the entry as "📖 <story>\n[RANK · LVn · XP · k to NEXT]"
```

## 3. DIGEST (what the LLM sees instead of raw journals)

`StoryDigest` fields: `totalRecords`, `journalEntries`, `checkIns`,
`activeDays`, `streakDays`, `moods[]`, `cities[]`, `weather[]`,
`moonPhases[]`, `peakHours[]` (UTC), `spikes[]`, `excerpts[]` (<=8 x 160 chars).

**Spike rule (pattern-change detector, v1).** With >= 3 active days, mean =
records/active day. A day is a `surge` if count >= 2x mean and >= 3; a `drop`
if count <= mean/2 and mean >= 4. Spikes are surfaced in the story and are the
hook for future machine follow-ups (section 6).

**Streak.** Consecutive UTC days with any record, ending today (or yesterday
if today is still empty).

The prompt instructs the model to treat the digest as ground truth and never
invent events, numbers or places. On vendor failure the user still gets a
deterministic local story (`composeFallbackStory`), never an empty or
error-shaped answer.

## 4. ARCADE EVOLUTION

Self-care first; the arcade layer is a quiet progress ladder, not a game.

XP = journal x3 + check-in x2 + other record x1, **+5 per active day in the
last 30 days, +2 per streak day.** Derived on read from existing rows — no new
table, no drift.

| Level | Rank | XP floor |
|---|---|---|
| 1 | BOOT | 0 |
| 2 | SIGNAL | 25 |
| 3 | PULSE | 100 |
| 4 | RHYTHM | 250 |
| 5 | ORBIT | 600 |
| 6 | COHERENT | 1200 |
| 7 | OPERATOR | 2500 |

This ladder is independent of the Badge Codex (`docs/badges/`); badges remain
the collectible layer, rank is the continuous layer. Thresholds are PROVISIONAL
pending real-user XP distributions.

## 5. FILES

| Path | Role |
|---|---|
| `src/server/utils/story-compression.ts` | Pure digest, fallback story, Arcade standing |
| `src/server/routes/api.ts` (`POST /story`) | Endpoint, prompt assembly, persistence |
| `src/client/utils/logTriggers.ts` | `story-mode`/`system-help` detectors, `parseStoryScope` |
| `src/client/components/Logs.tsx` | Trigger handling, `/system` screen, story append |
| `src/client/queries.ts` | `useStoryGeneration` types (`scope`, `arcade`) |
| `scripts/tests/test-story-compression.ts` | Unit tests (`npx esr ./scripts/tests/test-story-compression.ts`) |

## 6. PRIVACY & LIMITS

- Only the caller's own rows are read. Raw excerpts (<= 8 x 160 chars) go to the
  vendor; full history never does. Stored digests omit excerpts.
- `/story` remains Usership-gated, rate-limited to 5/min.
- Time math is UTC; local-day boundaries are a known approximation.
- Year scope reads at most 3000 newest rows; heavy users get a truncated year.

## 7. ROADMAP (NOT IMPLEMENTED)

1. **Machine-asks-first.** Morning question on any device, driven by digest
   spikes (`drop` after a streak -> gentle check-in). Digest already exposes the signal.
2. **Auto-compression.** Scheduled job writes day/week/month/year stories
   without a command, feeding the next prompt (the "loop of the loop").
3. **Entry follow-ups.** On `surge`/`drop`, attach a follow-up question to the
   originating entry.
4. **Server-side Arcade ledger** once rank thresholds are calibrated.
5. **Localised day boundaries** using `context.timeZone`.

## 8. VERIFICATION

`npx esr ./scripts/tests/test-story-compression.ts` (scope parsing, window cut,
streak, spike, mood aggregation, fallback, Arcade ladder);
`npm run server:build`; `npm run client:js:build`.
Not verified: live Together AI call and browser behaviour of the 1.5 s grace
timer (no credentials / browser run in this session).
