```
LOT SYSTEMS — TECHNICAL SPECIFICATION
DOC      : LOG-COMMANDS-AND-STORY
CLASS    : RESTRICTED // S-2 EYES
S-2      : VADIK MARMELADOV
DATE     : 2026-10-25
SCOPE    : Log slash-command system (/system) · Compressed story (/story)
```

# 1. PURPOSE

The Log is a passive AI UI. The operator writes; no prompts, no questions.
Each entry is stamped with context metadata (weather, humidity, place,
moon, zodiac, time). Slash commands are the *only* explicit control
surface, and they live inside the same text field.

```
LOT User data → LOT Quantum Intent Engine → AI vendor (Together AI) → LOT personalized data stored
```

# 2. COMMAND REGISTRY — SINGLE SOURCE OF TRUTH

`src/client/utils/logCommands.ts` declares every command once:
`trigger`, `command`, `aliases`, `emojis`, `args`, `description`, `group`, `hidden`.

| Consumer | Derivation |
|---|---|
| `logTriggers.ts` | detection `RULES` built from the registry |
| `/system` | `buildSystemHelp()` renders the help screen from the registry |
| `Logs.tsx` | dispatches on `trigger` (unchanged contract) |

**Rule:** to add a command, add one registry row and one handler branch in
`Logs.tsx`. The help screen updates itself. Before this change the help
text was hand-written and had drifted (`/sil` was detected but unlisted and
had no handler).

## 2.1 Command table

| Group | Command | Aliases / emoji | Effect |
|---|---|---|---|
| AI | `/story [day\|week\|month\|year]` | 📖 | Compressed story of the period |
| AI | `/qi [query]` | | Quantum Intelligence RFI |
| AI | `/prayer` | candle, 🕯️ | Contextual scripture |
| AI | `/how` | | Open LOT AI check-in (System tab) |
| SYSTEM | `/scan` | ai | System status overview |
| SYSTEM | `/assembly` | assemble | Self-assembly module status |
| SYSTEM | `/qos` | os-report | Quantum OS state analysis |
| SYSTEM | `/phys` | cohort-report | Physiological cohort report |
| SYSTEM | `/sil` | silence-check | Signal silence check (shares `/silent` handler) |
| SYSTEM | `/system` | commands | Help screen |
| WELLBEING | `/fast` `/breathe` `/freeze` `/silent` | breath, pause 🧊, quiet | Care protocols |
| WELLBEING | (hidden) | ❗ ‼️ | Cohort support request |
| INTERFACE | `/synth` `/radio` `/night` | keyboard 🎹, 🎧, 🌙 | UI toggles |

## 2.2 Detection semantics (unchanged)

- Keyword match is whole-token: `/scandalous` does not fire `/scan`;
  `/sil` does not fire `/silent`.
- Only *new* triggers fire (`detectNewTriggers`): editing around an
  existing command never re-fires it.

# 3. /story — COMPRESSED USER STORY

`/story` → weekly (default). `/story day|week|month|year` (aliases:
today, daily, weekly, monthly, yearly). Unknown argument → week.

## 3.1 Pipeline

```
Log rows (window) ──► compressLogs() ──► StoryDigest ──► buildStoryPrompt() ──► Together AI
   user-scoped          pure, bounded      counts+excerpts     period-sized        │
                                                                                    ▼
                                      Log row  event=generated_story  ◄── cleaned story
```

Module: `src/shared/utils/story-compression.ts` (pure, no dependencies).

| Period | Window | Target length |
|---|---|---|
| day | 1 d | 60–100 words |
| week | 7 d | 100–160 |
| month | 30 d | 140–200 |
| year | 365 d | 180–240 |

## 3.2 Digest contents

`entryCount`, `activeDays`, `moodCounts` (from `emotional_checkin`), top
places / weather / moon phase from each record's **context snapshot**,
`wordTrend` (writing volume first vs second half), and at most **8
excerpts × 160 chars**, sampled evenly across the window.

## 3.3 Privacy & safety properties

- Query is scoped to `userId` and bounded by `createdAt >= windowStart`, `LIMIT 1000`.
- Only the digest (bounded, ≤ ~1.5 KB of excerpts) is sent to the vendor — never the raw log table.
- Prompt forbids invention of events/people/numbers and diagnosis; sparse data is stated plainly.
- Gate unchanged: Usership tag required (403 otherwise). Rate limit 5/min.
- The generated story is stored as `generated_story` with `metadata.period`
  and `metadata.entryCount`, so future jobs can re-compress stories into
  month/year stories (the loop-compression of the product vision).

# 4. ARCADE (GAMIFICATION) HOOKS — NOT YET WIRED

Recorded for the next pass; intentionally not implemented here:

1. Badge `chronicler` — first `/story year`.
2. Streak signal — consecutive weeks with a stored `generated_story`.
3. `generated_story` metadata is available to the badge engine and QIE
   pattern detectors (story-cadence pattern).

# 5. VERIFICATION

```
node --experimental-strip-types --import ./scripts/tests/ts-resolve.mjs scripts/tests/test-log-commands.ts
→ 9 checks passed
tsc --strict (registry, triggers, story-compression) → clean
```

Not run in this environment: full `yarn build` (no `node_modules`
installed), `Logs.tsx` / `api.ts` type-check, live Together AI call.
Run `yarn build` before deploy.

# 6. FILES

```
A  src/client/utils/logCommands.ts
A  src/shared/utils/story-compression.ts
A  scripts/tests/test-log-commands.ts
A  scripts/tests/ts-resolve.mjs
M  src/client/utils/logTriggers.ts      (RULES derived from registry)
M  src/client/components/Logs.tsx       (/system from registry, /sil, /story period)
M  src/client/queries.ts                (period param)
M  src/server/routes/api.ts             (/story windowed + compressed)
```
