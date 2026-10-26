# LOT® LOG — COMMANDS, STORY COMPRESSION & ARCADE RANK

```
DOCUMENT: LOT-TECH-LOG-STORY-01
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-10-26
STATUS:   IMPLEMENTED (client + server + shared) — GREEN
```

## 1. PURPOSE

The Log is a passive AI interface: the operator writes, with no prompts. Every
entry is stored with environment context (weather, city, moon, zodiac). Two
in-Log commands expose the machine's side of the loop:

| Command | Result |
|---|---|
| `/system` | Full command registry grouped by function, plus the operator's Arcade rank |
| `/story` | Compressed story of the operator's **week** (default) |
| `/story day` · `/story month` · `/story year` | Same, other horizon (`today` aliases `day`) |

Both are typed into a normal Log entry; no modal, no form.

## 2. DATA FLOW

```
LOT USER DATA            Log rows (event='note', text, context{city,weather,moon})
      │
      ▼
DIGEST (deterministic)   compressEntries()  — src/shared/utils/log-story.ts
      │                  counts · active days · streak · HIGH day · LOW day ·
      │                  PATTERN CHANGE (spike) · place · sky · moon · recurring words
      ▼
LOT QUANTUM INTENT       quantumState + userIndex (client) + mood / self-care logs
ENGINE (QIE)             assembled into the prompt block
      │
      ▼
AI VENDOR PROCESSOR      Together AI  (aiEngineManager.getEngine('together'))
      │
      ▼
LOT PERSONALIZED DATA    Log row event='generated_story'
                         metadata{ story, period, digest, quantumState }
```

**Fallback.** If the vendor is unreachable, `composeLocalStory(digest)` returns a
deterministic story from the same digest. The operator never sees a dead end,
and the local fallback is built only from the operator's own data.

**Privacy.** The digest is computed server-side from the authenticated user's
rows only. Nothing leaves the account except the prompt to the vendor.

## 3. FILES

| Path | Role |
|---|---|
| `src/shared/utils/log-story.ts` | Pure: digest, local story, Arcade XP/rank, period parser |
| `src/client/utils/logCommands.ts` | Command registry + `/system` text builder |
| `src/client/utils/logTriggers.ts` | Trigger detection (unchanged; registry is checked against it) |
| `src/client/components/Logs.tsx` | Wires `/system` rank line and `/story <period>` |
| `src/client/queries.ts` | `useStoryGeneration` accepts `period` |
| `src/server/routes/api.ts` | `POST /api/story` — digest in prompt, `period`, local fallback |
| `scripts/tests/test-log-story.ts` | Unit checks (`npx tsx scripts/tests/test-log-story.ts`) |

## 4. DIGEST FIELDS

`entryCount` · `activeDays` · `windowDays` · `words` · `avgWords` · `streak`
(consecutive days ending at newest active day) · `peakDay` (HIGH) · `lowDay`
(LOW, needs ≥3 active days) · `spike` (latest day ≥2× or ≤0.4× the prior mean
of active days, needs ≥4 active days) · `topCity` · `topWeather` · `moonPhase`
· `themes` (up to 5 words appearing ≥2×, stopwords removed).

System-generated blocks (lines starting `📖`/`🕯`) and slash tokens are stripped
before counting so the story never compresses itself.

The `spike` is the hook for the planned **follow-up** behaviour: the machine can
ask first when it detects a pattern change (see §7).

## 5. ARCADE — GAMIFIED EVOLUTION

Self-care register, not combat. Rank is **derived, never stored**: a pure
function of the trailing-365-day log, so it cannot drift or be corrupted.

XP = 10 per entry + 1 per 20 words (cap 5/entry) + 25 per active day + 5 per streak day.

| LVL | TITLE | XP ≥ |
|---|---|---|
| 1 | SEED | 0 |
| 2 | SPROUT | 50 |
| 3 | ROOTED | 150 |
| 4 | STEADY | 400 |
| 5 | ATTUNED | 900 |
| 6 | LUCID | 1800 |
| 7 | KEEPER | 3500 |
| 8 | ORACLE | 7000 |

Shown at the top of `/system`. Relationship to the badge system
(`docs/badges/`): rank is a continuous ladder; badges remain discrete awards.
Wiring rank into badge unlocks is future work.

## 6. DEFECT FIXED IN THIS CHANGE

`POST /api/story` previously selected journal text with
`event === 'log_entry' || 'journal'`. Journal entries are stored with
`event = 'note'` (see `GET /api/logs`), so the story never saw the operator's
actual entries. It now queries `event='note'` within the period window
(limit 1000).

## 7. NOT DONE / NEXT (honest boundary)

- Story is **not** yet pushed unprompted; the morning "machine asks first"
  question and automatic follow-up on `spike` are not implemented here.
- Digest has no sentiment signal; mood comes from existing `emotional_checkin`
  rows only.
- `/story` remains gated to Usership (unchanged). Non-members get the existing
  403 message.
- Story API export for robot / vehicle (`docs/corporate/LOT-AI-PRODUCT-BRIEF.md`)
  is not implemented; `generated_story.metadata.digest` is the structured payload
  it would serve.
- Rank is computed from the client's cached `/api/logs` (last 500 rows); heavy
  users' rank is a lower bound until a server endpoint exists.

## 8. VERIFICATION

```
npx tsx scripts/tests/test-log-story.ts       -> all checks passed
npx tsc --noEmit -p tsconfig.server.json      -> 0 errors
NODE_ENV=production npx esr scripts/build/client.build.ts -prod -> OK
npm run server:build                          -> OK
```

The test also asserts every command in the registry fires its trigger and every
slash-keyword trigger is documented, so `/system` cannot drift from reality.

AUTHORIZED BY: S-2 // VADIK MARMELADOV
