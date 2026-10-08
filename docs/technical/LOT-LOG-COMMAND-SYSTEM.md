<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT-LOG-COMMAND-SYSTEM

```
DOCUMENT:  LOT-LOG-COMMAND-SYSTEM
CLASS:     RESTRICTED // S-2 EYES
S-2:       VADIK MARMELADOV
REVISION:  A  (2026-10-08)
STATUS:    /system SHIPPED (pre-existing) · /story LOT-SC-1 IMPLEMENTED · follow-up engine SPECIFIED
```

## 1. PURPOSE

The Log is a passive AI interface. The operator writes; no prompts, no questions.
Every entry is stamped with context (weather, place, time, moon/astrology) so the
machine can later compress the record and surface high and low peaks.

Two Log commands expose the machine to the operator:

| Command | Effect |
|---|---|
| `/system` | Lists every Log command (help screen). |
| `/story [day\|week\|month\|year]` | Returns the compressed story of the operator's own record for the window. Default `week`. |

Aliases: `/commands` = `/system`; `📖` = `/story`.

## 2. DATA FLOW

```
LOT User data (Log + context, mood, self-care)
        │
        ▼
LOT Quantum Intent Engine (client signals · server patterns)
        │
        ▼
STORY COMPRESSION  (LOT-SC-1, deterministic, no AI)   ◄── src/shared/utils/storyCompression.ts
        │   StoryDigest only — raw journal never leaves LOT except ≤4 short excerpts
        ▼
AI vendor processor (Together AI, via aiEngineManager)
        │
        ▼
LOT personalized data stored  (Log event `generated_story`, metadata.digest)
```

Vendor independence is preserved: the digest is vendor-neutral text. If the AI
call fails, or the window is empty, `fallbackStory()` returns a deterministic
story so `/story` never dead-ends.

## 3. LOT-SC-1 — STORY COMPRESSION

`compressStory(logs, window, now) -> StoryDigest` is pure (no I/O, no clock,
no randomness) and unit-tested.

**Inputs counted:** all Log events except generated/system events
(`generated_story`, `assembly_directive`, `qi_rfi`, `prayer_scripture`, `ping`,
chat/DM, settings, telemetry). Slash-command lines and prior 📖/🕯️ output
inside an entry are stripped so the story never feeds on itself.

**Digest fields:** entries · active days · streak · words · day-part rhythm
(UTC night/morning/afternoon/evening) · top moods · places · temperature range
(°C; context stores Kelvin) · moon phases · spikes · ≤4 excerpts · arcade status.

**Spike detection (all thresholds are constants in the module):**

| Kind | Rule |
|---|---|
| `volume` | Day with ≥3 entries and z-score ≥ 1.5 against active days (needs ≥3 active days). |
| `silence` | Gap of ≥4 days between two active days. |
| `mood-shift` | Share of low moods differs ≥ 0.4 between first and second half (needs ≥4 mood check-ins). |
| `weather-swing` | Day-over-day mean temperature change ≥ 8 °C. |

These are the hooks for the follow-up engine (§5). Thresholds are first-pass
heuristics, not clinically validated. Day boundaries are UTC.

## 4. ARCADE EVOLUTION

Gamified progression inside a self-care product: the reward is for showing up,
never for intensity. Computed per window from the digest; no extra storage.

```
XP = Σ per active day [ min(5 × entries, 20) + 10 ]
   + min(5 × streak, 50)
   + 2 × floor(words / 100)
```

| LV | RANK | XP floor |
|---|---|---|
| 1 | RECRUIT | 0 |
| 2 | OBSERVER | 50 |
| 3 | OPERATOR | 150 |
| 4 | NAVIGATOR | 400 |
| 5 | CARTOGRAPHER | 900 |
| 6 | ARCHIVIST | 1800 |
| 7 | KEEPER OF TIME | 3600 |

Rendered under the story as `LV 3 OPERATOR · 212 XP · 188 XP TO NEXT`.
Per-entry caps stop spam-farming. XP here is window-scoped; a lifetime rank
(all-time window, persisted) is future work (§6) and must stay consistent with
the Badge Codex (`docs/badges/`).

## 5. SERVER AND CLIENT CONTRACT

`POST /api/story` (Usership only, 5 req/min)

```
request   { logText?: string, window?: 'day'|'week'|'month'|'year',
            quantumState?, userIndex? }
response  { story, logId|null, window, source: 'together'|'fallback',
            arcade: string, spikes: [{day, kind, detail}] }
```

- Loads the operator's logs for the window (cap 3000), compresses, prompts Together AI with the digest only.
- Persists a `generated_story` log with `metadata.{window, source, digest(no excerpts)}`.
- Client (`Logs.tsx`) waits 1.2 s after `/story` is typed so the window word can be completed, then appends `📖 <story>` to the entry and renders window / arcade / up to 3 spikes beneath it.

`/system` is rendered from the `system-help` trigger in `Logs.tsx`; every
command is declared in `src/client/utils/logTriggers.ts`.

## 6. NOT YET BUILT (SPECIFIED, NOT IMPLIED)

| Item | Note |
|---|---|
| Proactive follow-up on a spike | Digest already emits spikes; a scheduled job (see `scheduled-jobs.ts`) would turn a new spike into a morning question on web or LOT device. Needs a cooldown and opt-out; COSMO Gate review. |
| Daily/weekly auto-story push | Story is pull-only (`/story`) today. |
| Lifetime arcade rank | Needs a persisted XP ledger. |
| Non-English `/system` | Help text is English only. |
| Client-side tests in CI | No test runner is wired; the self-test is a standalone script. |

## 7. VERIFICATION

```
node --experimental-strip-types scripts/tests/test-story-compression.ts   # ALL PASS
npx tsc --noEmit -p tsconfig.server.json                                  # 0 errors
npx tsc --noEmit -p tsconfig.json                                         # 104 errors, identical to pre-change baseline (none in changed lines)
yarn client:js:build / npm run server:build                               # OK
```

Not verified: a live `/story` round-trip against a database and Together AI
(no credentials in the build environment).

## 8. PRIVACY

Only the digest and ≤4 excerpts (≤160 chars each, from the operator's own
entries) are sent to the vendor; the vendor holds no operator data. Raw logs,
digests and stories remain in the LOT database. No new data is collected.
