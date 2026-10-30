# LOT® LOG COMMAND SYSTEM — /system AND /story

DOCUMENT: LOT-TECH-LOG-COMMANDS  
CLASS: ENGINEERING  
S-2: VADIK MARMELADOV  
DATE: 2026-10-30  
SESSION: LOT-SR-20261030-01 -> see `docs/benchmark/LOT-SR-20261030-01.md`

---

## 1. PURPOSE

The Log is a passive AI interface. The operator writes; there are no prompts. Each
entry is stored with its context snapshot (time, place, weather, moon, zodiac). Two
slash commands are typed into the Log to reach the machine on demand:

| Command | Effect |
|---|---|
| `/system` | Prints every available command, grouped. |
| `/story [day\|week\|month\|year]` | Prints a compressed story of the operator's record for that window. Default: `week`. |

## 2. LOOP POSITION

```
LOT User data -> [story-compression] -> LOT Quantum Intent Engine -> Together AI -> LOT personalized data stored
                       (this change)                                  (vendor)      (generated_story log row)
```

Compression happens BEFORE the vendor. The vendor receives a digest of counts and at
most five 160-character entry excerpts, not the raw record.

## 3. COMPONENTS

| File | Role |
|---|---|
| `src/client/utils/logTriggers.ts` | Detects `/command` tokens in log text (unchanged). |
| `src/client/utils/logCommands.ts` | NEW. Command registry (single source of truth). `renderSystemHelp()` builds the `/system` screen from it. `parseStoryRangeArg()` reads the window. |
| `src/client/components/Logs.tsx` | `/system` now renders the registry; `/story` sends `range`; story block shows the arcade line. |
| `src/client/queries.ts` | `useStoryGeneration` types gain `range` and `arcade`. |
| `src/server/utils/story-compression.ts` | NEW. Pure, deterministic. `compressLogs`, `renderDigest`, `composeLocalStory`, `computeArcade`. |
| `src/server/routes/api.ts` | `POST /api/story` loads the window (up to 2000 rows), builds the digest, calls Together AI, stores digest in the `generated_story` row metadata. |
| `scripts/tests/test-story-compression.ts` | NEW. Assertion test (run with `npx tsx`). |

To add a command: add the trigger in `logTriggers.ts`, add one line to `LOG_COMMANDS`.
The test fails if a registry command has no trigger.

## 4. DIGEST (what is computed)

All values derive from stored rows. Nothing is estimated.

- `entries` — `log_entry` / `journal` rows with text. `checkins` — `emotional_checkin`, `memory_answer`, `self_care_checkin`, `energy_checkin`.
- `activeDays`, `streak` (consecutive active days ending today or yesterday), `silentGapDays` (longest gap in window).
- `moods` — tally of `metadata.emotionalState`.
- `peakHour` — modal hour, from `context.date` (operator's local clock) when present, else UTC.
- `spikes` — days with >= 3 entries and >= 2x the active-day mean.
- `trend` — first half vs second half of the window; only for windows >= 7 days and >= 4 entries. `rising` / `falling` when one half exceeds 1.5x the other.
- `context` — cities, temperature range (C), moon phases seen across the window.

## 5. ARCADE LAYER

The operator's evolution is a plain, reproducible function of recorded activity:

```
XP    = entries*10 + checkins*5 + streak*20
LEVEL = largest n with (n+1)(n+2)*50 <= XP        (level n+1 needs (n+1)(n+2)*50 XP)
RANK  = RECRUIT, OPERATOR, SPECIALIST, SENTINEL, ARCHITECT, COHERENCE HOLDER   (index = level, capped)
```

Rank is shown under every story: `RANK · LEVEL n · xp/next XP`. The window-scoped XP is
a snapshot of the chosen range, not a lifetime balance. A persisted lifetime balance is
NOT implemented (see 7).

## 6. FAILURE MODES

| Condition | Behavior |
|---|---|
| Vendor error / no key | Server returns `composeLocalStory(digest)` — deterministic, second person, facts only. `logId: null`. |
| Empty window | "Nothing recorded in the last N days." |
| Non-Usership user | 403, unchanged. |
| Rate limit | 5 / minute, unchanged. |

## 7. KNOWN LIMITS (HONEST)

- XP is computed per request over the window; no persistence, no lifetime level.
- `peakHour` mixes local and UTC only for rows lacking `context.date`.
- Window cap is 2000 rows; a heavy year may truncate the oldest rows.
- Follow-up on spikes/pattern change (digest `spikes`, `trend`) is computed but not yet pushed back as an unsolicited prompt. Next step: morning-question job reads the same digest.
- Client typecheck (`tsc -p tsconfig.json`) reports 4 pre-existing errors in `Logs.tsx`; none are in changed lines. The build gate (`yarn build`) is green.

## 8. VERIFY

```bash
npx tsx scripts/tests/test-story-compression.ts     # story-compression: OK
yarn build                                          # client + server
```
