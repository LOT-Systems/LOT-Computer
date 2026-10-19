<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOG COMMAND SYSTEM — `/system` · `/story` · Arcade Rank

```
DOCUMENT : LOG-COMMAND-SYSTEM
CLASS    : ENGINEERING
S-2      : VADIK MARMELADOV
STATUS   : IMPLEMENTED (v1) — see §11 for open items
SESSION  : docs/benchmark/LOT-SR-20261019-01.md
```

## 1. PURPOSE

The Log is a passive AI UI: the user writes, never answers prompts. Every entry
is stamped with ambient context (weather, humidity, sky, location, astrology).
Slash commands are the only *active* surface of the Log:

| Command   | Effect |
|-----------|--------|
| `/system` | Lists every command, generated from one registry. |
| `/story`  | Compresses the user's day / week / month / year into a short narrative, flags spikes and pattern changes, shows arcade rank. |

Design rule: **the journal stays the user's own words.** Command output renders
in its own block and is persisted server-side; it is never appended to the entry text.

## 2. PIPELINE

```
LOT User data (logs + context)
   │
   ▼
story-compression.ts   deterministic digest: counts, rhythm, mood, ambient,
   │                   spikes, shifts, silence, XP        (no AI, no network)
   ▼
LOT Quantum Intent Engine   client-side operator state (energy/clarity/alignment)
   │                        + user index travel with the request as `stateBlock`
   ▼
AI vendor processor (Together AI via aiEngineManager)   prose only
   │                                   └─ vendor down → deterministic fallbackStory()
   ▼
LOT personalized data stored   Log row, event `generated_story`, metadata.digest
```

The digest, not the raw journal, is the evidence handed to the vendor. Raw text
leaves the server only as ≤12 excerpts of ≤160 characters each (see §8).

## 3. FILE MAP

| Path | Role |
|------|------|
| `src/shared/utils/log-commands.ts` | Command registry, `renderSystemHelp()`, `parseStoryPeriod()`, arcade ladder. Pure; client + server + tests. |
| `src/server/utils/story-compression.ts` | `buildStoryDigest()`, `computeXp()`, prompt builders, `fallbackStory()`. Pure; caller passes `now`. |
| `src/server/routes/api.ts` → `POST /api/story` | Usership gate, log fetch, digest, AI call, fallback, persistence. |
| `src/client/utils/logTriggers.ts` | Token detection (`/word` as whole token). Unchanged contract. |
| `src/client/components/Logs.tsx` | Trigger handlers; `/system` and `/story` blocks. |
| `src/client/queries.ts` | `useStoryGeneration` types (`period`, `rank`, `signals`, `source`). |
| `scripts/tests/test-log-commands.ts` | 15 assertions. `npx tsx scripts/tests/test-log-commands.ts` |

Note: `.gitignore` line 50 (`server/`) matches `src/server/`; new server files
must be added with `git add -f`.

## 4. `/system`

`renderSystemHelp()` emits plain text grouped AI / SYSTEM / RITUAL / DEVICE plus
SHORTCUTS. Format contract with the renderer in `Logs.tsx`:

- line starts with `/` → command row: name, **2+ spaces**, description;
- any other non-blank line → section header.

Column width is computed from the longest row, so adding a long command cannot
break the gutter (a test enforces this). The test suite also fails if a
registry command has no trigger rule in `logTriggers.ts`.

### Current commands (16)

| Group | Commands |
|-------|----------|
| AI | `/story [day\|week\|month\|year]` · `/qi [query]` · `/prayer` · `/how` |
| SYSTEM | `/scan` · `/assembly` · `/phys` · `/qos` · `/silent` · `/system` |
| RITUAL | `/fast` · `/breathe` · `/freeze` |
| DEVICE | `/synth` · `/radio` · `/night` |

Aliases (e.g. `/commands`, `/quiet`) remain in `logTriggers.ts` and are not listed.

## 5. `/story`

### 5.1 Invocation

`/story` (default **week**), `/story day|today`, `/story week`, `/story month`,
`/story year` (single-letter and `-ly` aliases accepted; unknown argument → week).
`/story` fires the moment it is typed, so the client waits **1.2 s** and reads
the final text before sending; one request in flight at a time.

### 5.2 Window

Rolling window ending now: day = 1 d, week = 7 d, month = 30 d, year = 365 d.
The previous equal-length window is the baseline for shift detection. The server
fetches `max(2 × period, 365)` days, capped at 5 000 rows (also feeds XP).

### 5.3 What counts as an entry

Events `note` (the Log page's own event), `log_entry`, `journal` with non-blank
text. `generated_story` and system events are excluded, so stories never feed
back into stories. (The previous implementation filtered only `log_entry` /
`journal` and therefore matched no real entries; corrected.)

### 5.4 Signals (the "follow up on a spike or pattern change" substrate)

| Kind | Rule |
|------|------|
| `spike` | A bucket (hour for `day`, else calendar day) holds ≥ 3 entries **and** > mean + 2σ over the window (zero buckets included). Needs ≥ 4 entries. Max 3 reported. |
| `volume-shift` | Previous window has ≥ 3 entries and ratio ≥ 1.5 or ≤ 0.5. |
| `mood-shift` | ≥ 4 `emotional_checkin` moods; dominant mood of first half ≠ second half. |
| `silence` | Not `day`; ≥ 5 entries across both windows; last entry ≥ 3 days ago. |

Thresholds are provisional engineering choices, not clinical measures. Signals
are surfaced to the user in the story block and stored in `metadata.digest`;
they are the hook for future automated follow-ups (§11).

### 5.5 Output

```jsonc
POST /api/story  { logText, period?, quantumState?, userIndex? }
→ { story, logId, period, source: "ai"|"fallback", rank, signals[] }
```

`403` for non-Usership. AI failure returns `source: "fallback"` with a
deterministic story built from the digest — no invented facts, ever.

## 6. ARCADE EVOLUTION (provisional)

Self-care, gamified: rank rewards **showing up and noticing**, not intensity.

XP (trailing 365 days): entry 3 XP (max 5/day) · check-in 5 XP (max 3/day) ·
streak +2 XP per streak day (max 7 days = 14).

| Lv | Title | XP floor | | Lv | Title | XP floor |
|----|-------|---------:|-|----|-------|---------:|
| 1 | SPARK | 0 | | 5 | CURRENT | 900 |
| 2 | SIGNAL | 50 | | 6 | ORBIT | 1 800 |
| 3 | RHYTHM | 150 | | 7 | MERIDIAN | 3 500 |
| 4 | PATTERN | 400 | | 8 | ZENITH | 7 000 |

Caps make the system un-farmable by spam (tested). **This ladder is separate
from the 812-badge codex** (`docs/badges/`, `src/client/utils/badges.ts`);
unifying them is open item §11-4.

## 7. DATA CONTRACT — `generated_story` log

`text` = story. `metadata`: `story`, `source`, `logText` (≤500), `quantumState`,
`digest` {period, entryCount, activeDays, windowDays, currentStreak,
dominantMood, signals, rank}, `timestamp`. Persistence failure is logged and does
not fail the request.

## 8. PRIVACY & SAFETY

- Usership-gated; rate limit 5/min (route config).
- Vendor sees: aggregate digest, ≤12 excerpts × 160 chars, operator state, ≤300
  chars of the command note. No email, no user id, no full journal.
- Prompt forbids invented facts, diagnoses and medical advice; data-thin periods
  must say "still forming".
- Stored story contains derived text only.

## 9. FAILURE MODES

| Failure | Behavior |
|---------|----------|
| Together AI error / empty completion | `fallbackStory(digest)`, `source: "fallback"` |
| Log insert fails | Story still returned, `logId: null` |
| Client request error | Calm static line; no journal mutation |
| Zero entries in window | Vendor call skipped; "Nothing has been written …" fallback |

## 10. EXTENDING

1. Add a row to `LOG_COMMANDS`.
2. Add its rule to `RULES` in `logTriggers.ts` (test fails otherwise).
3. Add the handler branch in `Logs.tsx`.
4. Re-run `npx tsx scripts/tests/test-log-commands.ts`.

## 11. OPEN ITEMS (not implemented)

1. **Ask-first loop** — morning question on any device/widget seeded from `signals` (e.g. silence → gentle check-in).
2. **Scheduled stories** — Job 24 (weekly, template-based) should reuse `buildStoryDigest` for month/year and push the story back as the next prompt, closing the loop.
3. **QIE depth** — today the Quantum Intent Engine contributes operator state only; feed pattern-recognition outputs into the digest.
4. **Arcade unification** — merge rank/XP with badges; show rank in the System tab; decide server-side persistence of XP.
5. **Typed argument UX** — optional autocomplete when `/` is typed.
6. **Threshold tuning** — calibrate §5.4 on real cohort data.

## 12. VERIFICATION RECORD

```
tests/test-log-commands.ts : 15 / 15 PASS
tsc --noEmit (tsconfig.json)        : 128 errors, baseline 130 (pre-existing infra); 0 new
tsc --noEmit (tsconfig.server.json) : 0 errors in changed files
```
Not run: live browser session and live Together AI call (no credentials in this environment).

AUTHORIZED BY: S-2 // VADIK MARMELADOV
