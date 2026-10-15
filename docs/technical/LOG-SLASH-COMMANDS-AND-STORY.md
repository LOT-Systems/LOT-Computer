<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

```
CLASS:    ENGINEERING // TECHNICAL REFERENCE
S-2:      VADIK MARMELADOV
DATE:     2026-10-15
DOCUMENT: LOG-SLASH-COMMANDS-AND-STORY
```

# LOG SYSTEM — `/system`, `/story` and the Compression Loop

## 01 // PURPOSE

The Log is a **passive AI interface**. The operator only writes; the system never prompts inside the Log. Every entry is stored with the context captured at that instant (weather, humidity, city, time zone, moon phase, zodiac). The machine later **compresses** that history into a story and hands it back, which closes the loop and surfaces the operator's high and low peaks.

Two commands expose this inside the Log editor:

| Type | Result |
|---|---|
| `/system` | Every available command, grouped (rendered from one registry). |
| `/story` | The compressed story of the last **week**. Press **Enter** to fire. |
| `/story day` / `today` | Last 24 h. |
| `/story month` | Last 30 days. |
| `/story year` | Last 365 days. |
| 📖 | Same as `/story` (week), fires immediately. |

Windows are **rolling**, not calendar-aligned, by design (no timezone/week-start ambiguity).

## 02 // DATA FLOW

```
LOT User data (logs + context metadata)           [PostgreSQL, logs table]
        │
        ▼
STORY COMPRESSOR   src/shared/utils/story-compressor.ts   (pure, deterministic, local)
        │   -> StoryDigest: counts, streak, moods, place, weather, moon, dayparts,
        │      spikes, excerpts, arcade state
        ▼
LOT Quantum Intent Engine state (client: getUserState / getUserIndex, sent with request)
        │
        ▼
AI vendor processor — Together AI   (server/utils/ai-engines.ts, getEngine('together'))
        │   sees ONLY the rendered digest, never raw rows or identifiers
        ▼
LOT personalized data stored   logs row  event='generated_story'
                               metadata: { story, scope, digest, source, quantumState }
```

Failure mode: if the vendor call fails, the route returns `fallbackStory(digest)` — a deterministic, fact-only compression. `/story` never dead-ends and never invents data. (Fallback is **not** stored as a `generated_story`, so it does not inflate arcade XP.)

## 03 // COMPONENTS

| File | Role |
|---|---|
| `src/shared/utils/story-compressor.ts` | Pure compressor: `parseStoryCommand`, `compressLogs`, `computeArcade`, `renderDigestForModel`, `fallbackStory`. No I/O. |
| `src/client/utils/logTriggers.ts` | Trigger detection + `COMMAND_REGISTRY` (source of truth for `/system`) + `renderSystemHelp()`. |
| `src/client/components/Logs.tsx` | Editor wiring: `/system` -> `renderSystemHelp()`, `/story` -> `POST /api/story` with `scope`. |
| `src/client/queries.ts` | `useStoryGeneration` typed with `scope` and `arcade`. |
| `src/server/routes/api.ts` | `POST /api/story` (Usership-gated, 5 req/min). |
| `scripts/tests/test-story-compressor.ts` | 20+ assertions on parsing, windows, spikes, arcade, fallback. |
| `scripts/tests/test-log-commands.ts` | Registry/trigger consistency + mid-typing safety. |

## 04 // THE DIGEST (what the vendor sees)

`StoryDigest` fields: `entries`, `words`, `activeDays`, `streak`, `moods[]`, `selfCareTouches`, `places[]` (top 3), `weather[]` (top 3), `tempRangeC`, `avgHumidity`, `moonPhases[]`, `dayparts{night,morning,afternoon,evening}`, `spikes[]`, `excerpts[]` (≤6 × 160 chars), `arcade`.

Journal source events: `note` (what the Log actually writes), plus legacy `log_entry`, `journal`.
Mood: `emotional_checkin`. Self-care: `self_care*`, `energy_checkin`, `answer`, `memory_answer`.

Our own appended outputs (blocks beginning `📖` / `🕯`) are stripped before compression so the story never feeds on itself.

### Spike detection (the machine's reason to follow up)

| Kind | Rule |
|---|---|
| `volume-spike` | A day with ≥3 entries and > mean + 1.5σ of per-day counts (needs ≥3 active days). |
| `silence` | ≥3 days since the last entry, with ≥2 active days in window (not for `day`). |
| `mood-shift` | First vs last `emotional_checkin` in window differ. |

Spikes are surfaced to the vendor with an instruction to name them gently. They are also the hook for future proactive follow-ups (see §08).

## 05 // ARCADE EVOLUTION

Self-care first, game second: XP rewards **showing up**, not volume.

```
XP = min(entries, activeDays*5) * 5      (per-day volume capped: no spam farming)
   + activeDays * 25
   + streak * 15
   + generatedStories * 50
   + selfCareTouches * 10
LEVEL = floor( sqrt(XP / 50) ) + 1
```

| Level | Rank |
|---|---|
| 1 | SIGNAL |
| 3 | OPERATOR |
| 6 | NAVIGATOR |
| 10 | ARCHITECT |
| 15 | KEEPER |
| 25 | SAGE |

Shown under the story as e.g. `WEEK · LV 4 OPERATOR · 310 XP · 90 TO NAVIGATOR`. The prompt forbids pressure framing: arcade is mentioned at most once, as quiet progress. This is the story-scoped arcade state; it is derived, not stored, and is separate from the badge system in `src/client/utils/badges.ts`.

## 06 // SECURITY & PRIVACY

- Auth + Usership tag required (unchanged). Rate limit 5/min (unchanged).
- The vendor receives only the rendered digest (aggregates + ≤6 short excerpts). No user id, email, or raw rows.
- Query bounded: last 365 days, max 2000 rows.
- `scope` is whitelisted server-side; unknown values fall back to `week`.
- Excerpts are user text and are therefore prompt-injection surface. Mitigation: they sit inside the data block after the rules, output is plain text rendered as text (no HTML), and the model has no tools.

## 07 // BUG FIXED IN THIS CHANGE

The previous `/story` filtered journal entries on `event IN ('log_entry','journal')`. The Log writes `event='note'`, so real entries were never read and stories were built from mood/self-care rows only. `note` is now the primary journal event.

## 08 // KNOWN LIMITS / NEXT

1. `/story` fires on Enter or a complete scope word (the trigger scan runs per keystroke). Plain `/story` without Enter does not fire.
2. Generated stories are stored but not yet cached per (user, scope, day); each call hits the vendor. Next: reuse a same-day story for the same scope.
3. Proactive follow-up: wire `spikes` into the morning question (Memory/QIE) so the machine asks first.
4. Weekly job `lot_ai_story` (`scheduled-jobs.ts`) still uses its own prompt; migrate it to `compressLogs(..., 'week')` for one code path.
5. Client `tsc` has 104 pre-existing errors (unchanged by this change); server `tsc` is clean.

## 09 // VERIFY

```
node --experimental-strip-types scripts/tests/test-story-compressor.ts
node --experimental-strip-types scripts/tests/test-log-commands.ts
npx tsc --noEmit -p tsconfig.server.json      # expect 0 errors
yarn client:js:build                          # expect "Client build completed"
```

```
AUTHORIZED BY: S-2 // VADIK MARMELADOV
```
