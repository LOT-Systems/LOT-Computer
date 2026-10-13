<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® LOG — SLASH COMMANDS, /system, /story, ARCADE RANK

```
DOCUMENT : LOT-TECH-LOG-CMD-01
CLASS    : ENGINEERING // RESTRICTED // S-2 EYES
S-2      : VADIK MARMELADOV
DATE     : 2026-10-13
STATUS   : IMPLEMENTED (client + server prompt); typecheck of full tree NOT RUN (see §9)
```

## 1. PURPOSE

The Log is a passive AI UI: the user writes, never answers prompts. Each entry
is stored with environment context (weather, city, time). Slash commands are the
single deliberate channel to the machine from inside an entry.

Two commands carry the product loop:

| COMMAND | RESULT |
|---|---|
| `/system` | Full command catalogue, grouped, generated from one registry |
| `/story [day\|week\|month\|year]` | Compressed story of the period, shown instantly, then narrated by the AI engine |

## 2. DATA FLOW

```
LOT User data (Log entries + context + check-ins)
        │  client, offline, deterministic
        ▼
storyCompression.compressLogs()  ──►  StoryDigest  (counts, mood, pattern, themes, arcade)
        │                                   │
        │ formatDigest()                    │ digestForPrompt()  (≤ 800 chars)
        ▼                                   ▼
 instant /story block              POST /api/story { scope, digest, state, index }
 (works offline)                            │
                                            ▼
                        LOT Quantum Intent Engine context (state + index)
                                            ▼
                        AI vendor processor (Together AI)
                                            ▼
                        generated_story Log row (personalized data stored)
                                            ▼
                        story replaces the digest in the 📖 block and is
                        appended to the entry; on error the digest is kept
```

Privacy property: the vendor receives the compressed digest plus the
pre-existing recent-entry excerpts the route already used. Raw entries for the
whole period are not newly uploaded by this change.

## 3. FILES

| PATH | ROLE |
|---|---|
| `src/client/utils/slashCommands.ts` | Command registry, `buildSystemHelp()`, `parseStoryScope()` |
| `src/client/utils/storyCompression.ts` | `compressLogs()`, `formatDigest()`, `digestForPrompt()`, `arcadeRank()` |
| `src/client/utils/logTriggers.ts` | Trigger detection (unchanged; registry is checked against it) |
| `src/client/components/Logs.tsx` | `/system` and `/story` wiring in `NoteEditor` |
| `src/client/queries.ts` | `useStoryGeneration` accepts `scope`, `digest` |
| `src/server/routes/api.ts` | `POST /api/story` accepts `scope`, `digest`; prompt narrates the digest |
| `scripts/tests/test-slash-commands.ts` | Registry/trigger/scope/compression assertions |

## 4. /system

`SLASH_COMMANDS` is the only list of commands shown. Groups: MEMORY,
INTELLIGENCE, PROTOCOL, ENVIRONMENT, SYSTEM. The test asserts every registry
entry resolves to its trigger through `detectTriggers`, so the help screen cannot
advertise a command that is not wired. Adding a command = one registry row + one
`RULES` row in `logTriggers.ts` + a handler.

## 5. /story

Period argument is the first word after `/story` only: `day` (default), `week`,
`month`, `year` (aliases: today, d, w, m, y). Prose after the command
(`/story what a day`) is not read as a scope.

Digest fields:

| FIELD | DEFINITION |
|---|---|
| entries / words | User-written logs in the window (generated and check-in events excluded) |
| checkins | `emotional_checkin`, `self_care_checkin`, `energy_checkin`, `memory_answer` |
| activeDays / streak | Days with ≥1 record; streak ends today (an unlogged today does not break it) |
| HIGH | Day with most records |
| LOW | Longest run of zero-record days |
| PATTERN | Second half of window vs first half: `spike` (≥1.5×+1), `drop` (≤0.5×−1), `steady`; needs ≥4 days and ≥4 records, else `insufficient` |
| MOOD | Most frequent `metadata.emotionalState` |
| THEMES | Up to 5 words (≥4 letters, ≥2 occurrences, stop-words removed) |
| CONTEXT | Most frequent city, temperature range (stored °F → °C) |

PATTERN is the seed for the planned proactive follow-up: a `spike` or `drop`
is the "pattern change" signal on which the machine may ask first.

## 6. ARCADE RANK (PROVISIONAL)

Self-care is the product; the arcade layer is a motivational surface.

```
XP = lifetime entries × 10 + check-ins in window × 5
   + active days in window × 20 + earned badges × 50
```

| LV | TITLE | MIN XP |
|---|---|---|
| 1 | SIGNAL | 0 |
| 2 | OPERATOR | 100 |
| 3 | NAVIGATOR | 400 |
| 4 | ARCHITECT | 1000 |
| 5 | CARTOGRAPHER | 2500 |
| 6 | KEEPER | 6000 |
| 7 | LOT | 15000 |

PROVISIONAL: derived client-side per call, not stored. "Lifetime entries" is
bounded by what `/api/logs` returns to the client; check-in and active-day terms
depend on the chosen window, so rank can differ between `/story day` and
`/story year`. Moving XP server-side as a stored, window-independent score is the
recommended next step.

## 7. SERVER CONTRACT

`POST /api/story` (Usership-gated, 5/min rate limit; unchanged):
request adds optional `scope` (whitelisted to day|week|month|year, else `day`)
and `digest` (control characters stripped, truncated to 800 chars). The digest
is placed in the prompt as untrusted data; the prompt forbids inventing numbers
not in the digest.

## 8. TEST

```
npx tsx scripts/tests/test-slash-commands.ts     # prints OK, exits non-zero on failure
```

## 9. KNOWN LIMITS / NEXT

1. Full-tree `tsc` and `yarn build` were not run in the authoring environment
   (package registry unreachable through the proxy; no `node_modules`). New
   modules were type-checked in isolation; `Logs.tsx` and `api.ts` were verified
   to parse and bundle with esbuild only. Run `yarn build` before deploy.
2. `/story` is Usership-gated server-side; non-members see the local digest, then
   the gate message from the server.
3. The stored `generated_story` rows are not yet fed back into later digests
   (day → week → month → year hierarchical compression). Next step.
4. Proactive follow-up on `spike`/`drop` and a morning question on devices are
   specified in product intent, not built here.
5. Together AI is the configured vendor; no vendor change was made.

AUTHORIZED BY: S-2 // VADIK MARMELADOV
