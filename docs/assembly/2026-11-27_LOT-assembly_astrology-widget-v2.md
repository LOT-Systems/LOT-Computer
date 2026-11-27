# LOT Self-Assembly Session Report
## 2026-11-27 | Astrology Widget v2: Profile-Zone Personalization, Rokuyo Guidance, Logs Rhythm | v2

**Branch:** `claude/practical-curie-czaiel`
**Base commit:** `9f2b88c`
**Previous session:** `docs/assembly/2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)
**Session type:** Automated / Scheduled (recurring routine)
**Live site access:** not attempted. All work comes from reading the repo.

---

## MISSION BRIEF

This is a standing instruction that recurs each session. Keep evolving the Astrology block, which shows ambient conditions: today's zodiac hour, moon phase and rokuyo. It is **not** a personal natal chart. The goals are:

- personalize the block for each user
- keep it in sync with the other widgets
- keep it in sync with Logs entries
- push a full .MD file with the understanding and a features breakdown every session

---

## PHASE 0: UNDERSTANDING (full feature map, as of the end of this session)

The Astrology block has no component of its own. It is inlined in the master dashboard, `src/client/components/System.tsx`, and is rendered in two places:

1. In the **compact layout**, as a static `Block label="Astrology:"`.
2. In the **pro layout**, as the first face of the cycling block. Clicking the label moves through Astrology → Psychology → My Journey → Biofield.

Both places now render the same `astrologyBody` JSX (`System.tsx:251`).

| Layer | File | What it does |
|---|---|---|
| Math (pure, isomorphic) | `src/shared/utils/astrology.ts` | `getHourlyZodiac`, `getWesternZodiac`, `getRokuyo`, `getMoonPhase`, `getJapaneseZodiac`, `getMoonEmoji`, plus the **v2** functions `toZonedWallClock`, `getRokuyoGuidance`, `getAstrologyReading`, `getLogAstroStamp`, `summarizeAstroLogs` |
| Dashboard compute | `System.tsx` ~L193–L270 | Recomputes on a 15-minute tick that pauses while the tab is hidden. Reading uses `me.timeZone`; the Logs rhythm uses `useLogs()`; records one QIE signal per day |
| Signal bus (QIE) | `src/client/stores/intentionEngine.ts` | Tier 0 source `'astrology'`. The `system` and `cosmic` widgets depend on it in `WIDGET_DEPENDENCY_MAP`. Provides `recordAstrologySignal(…, extra)` and the new `getLatestAstrologySignal()` |
| Logs snapshot (server) | `src/server/utils/logs.ts` `getLogContext(user)` | All ~17 log-creation paths in `api.ts` call it. It stamps `astro*` fields into the `Log.context` JSONB, computed in the user's saved timeZone |
| Logs render | `src/client/components/Logs.tsx` `system_snapshot` block | `ASTRO: {rokuyo} · {phase} {illum}% · {zodiac hour} [· favored]` |
| Types | `src/shared/types/index.ts` `LogContext` | `astroRokuyo`, `astroMoonPhase`, `astroMoonIllumination`, `astroHourlyZodiac`, `astroWesternZodiac`, plus the new `astroFavoredNow` |
| Tests | `scripts/tests/test-astrology.ts` (new) | `npm run test:astrology` |

**Data model limits.** No birth data exists anywhere: the user record has no birthDate, birthTime or birthPlace. Personalization comes only from:

- `user.timeZone`
- the user's own **Logs history**

This matches the instruction that the feature stay ambient.

---

## PHASE 1: BUILD (what changed this session)

### 1. Correctness fix: rokuyo rolled over at the wrong hour east of UTC

`getRokuyo` subtracted a **UTC-midnight** anchor (`new Date('2000-01-01')`) from a **local** instant and then floored the result. For UTC+N zones the day count only advanced at N:00 local time. In Asia/Tokyo, for example, the rokuyo changed at **09:00 instead of midnight**.

The fix compares calendar days with `Date.UTC(y, m, d)` built from the local Y/M/D. The modulo is also made non-negative, so dates before 2000 no longer index out of range.

Effect on users:
- In zones **west of UTC** (the Americas), the day boundary is unchanged.
- In zones **east of UTC**, the day boundary is now local midnight.

### 2. Moon phase is now computed from the absolute instant

In v1 the server computed the moon phase from a date shifted to the user's zone, which skewed it by the UTC offset (up to about 0.5 day of the cycle). The moon phase is now computed from the real instant on both the client and the server. Only the rokuyo, the zodiac hour and the Western sign are zone-relative.

### 3. Personalization: the dashboard now uses the profile's saved timeZone

This was v1 "Pending item 2". `getAstrologyReading(date, timeZone)` is built on `toZonedWallClock`, which uses `Intl.DateTimeFormat` and has no dayjs dependency, so it runs on both client and server. System.tsx now passes `me.timeZone`.

As a result, the dashboard and the Logs snapshot give **the same reading**, even when the user views the dashboard from a device set to another zone. If the zone is invalid or missing, the reading falls back to device-local time.

### 4. Rokuyo guidance, adjusted to the current hour

`getRokuyoGuidance(rokuyo, hour)` gives a short ambient hint and a `favoredNow` flag:

| Rokuyo | Favored window | Hint (example) |
|---|---|---|
| Sensho 先勝 | before 12:00 | Morning favored · act early |
| Tomobiki 友引 | all day except 11–13 | Good for shared plans |
| Senpu 先負 | from 12:00 | Afternoon favored · move now |
| Butsumetsu 仏滅 | none | Quiet day · reflect, rest, close loops |
| Taian 大安 | all day | Auspicious all day · begin things |
| Shakku 赤口 | 11:00–13:00 | Midday window open / Caution · favor midday |

The hint is rendered as line 2 of the block. It is dimmed to `opacity-60` when the current hour falls outside the favored window.

### 5. Logs synchronization: the user's own "astro rhythm"

`summarizeAstroLogs(logs, current)` scans **user-authored** entries only: `note`, `answer`, or any entry with text. System snapshots are skipped so they don't drown out the user's own writing. For each entry it reads the astro stamp:

- It prefers the server stamp written at creation time (v1).
- Logs written **before 2026-07-27** have no stamp. For those, `getLogAstroStamp` **back-derives** the reading from `createdAt` in the entry's own saved `context.timeZone`.

The summary returns:

- `samePhase`: entries written under the current moon phase
- `sameRokuyo`: entries written under the current rokuyo
- `thisCycle`: entries in the last 29.53 days
- `topPhase` / `topRokuyo`: the phase and rokuyo the user writes under most, needing at least 3 entries

The dashboard shows this as line 3 of the block: `Logs: N under this moon • M this cycle [• your phase]`. The `• your phase` suffix appears when today's phase is the one the user historically writes under most.

The Logs `ASTRO:` line now appears on **every** system snapshot, including legacy ones (back-derived). It also shows illumination, the zodiac hour and `· favored` when the entry was written inside the favored window.

### 6. Widget synchronization: a richer QIE signal and a reader

- `recordAstrologySignal` takes an optional `extra` with these fields:
  - `favoredNow`, `guidance`, `timeZone`
  - `logsSamePhase`, `logsThisCycle`, `logsTopPhase`, `logsTopRokuyo`

  It also emits a derived flag **`resonant`**, which is true when today's moon phase is the user's top logging phase. The v1 `auspicious` (Taian) flag is kept.
- The daily signal is now keyed to the **user's-zone calendar day** and waits for `useLogs()` to succeed, so the rhythm fields hold real values rather than zeros from the first render. The `localStorage` access is wrapped in try/catch.
- New `getLatestAstrologySignal()` lets any widget (cosmic, system, journal, …) read the most recent ambient reading from the bus without recomputing it.

### 7. Tests

`scripts/tests/test-astrology.ts` has 18 checks:
- rokuyo anchor and day boundary, including a pre-2000 date
- Tokyo and Los Angeles wall-clock conversion
- fallback for an invalid or null zone
- favored windows
- filtering to user-authored entries in the rhythm summary
- top phase and cycle counts
- a log with a bad `createdAt`

---

## PHASE 2: TEST / BUILD

```
npm install --legacy-peer-deps     -> OK (pre-existing nanostores peer conflict, unchanged)
npm run test:astrology (TZ=UTC)    -> ALL PASS (18/18)
TZ=Asia/Tokyo run of same checks   -> ALL PASS (18/18)
npm run build                      -> PASS (client esbuild + server tsc)
```

The client build prints duplicate-key warnings from `src/client/utils/badges.ts`. They were present before this session (checked with `git stash`) and are not related to this work.

---

## PHASE 3: FEATURES BREAKDOWN (current state, after v2)

**Inputs.** All are pure date math, with no external API and no birth data:
- Western sign
- zodiac hour (12 two-hour animals)
- rokuyo (six-day cycle)
- moon phase and illumination %

**Personalization:**
- Readings follow the **user's saved profile timeZone** on both the dashboard and Logs, with a device-local fallback.
- The rokuyo guidance is adjusted to the user's current local hour.
- The block reflects the **user's own logging rhythm**: how many entries they wrote under this moon and this cycle, and whether today's phase is the one they write under most.

**Freshness.** The block recomputes every 15 minutes while the tab is visible, and again when the profile zone changes.

**Widget synchronization:**
- `astrology` is a Tier 0 QIE source that the `system` and `cosmic` widgets depend on.
- One `ambient_reading` signal is recorded per user-zone day, carrying:
  - the reading
  - the `auspicious` and `resonant` flags
  - the guidance
  - the Logs rhythm
- Other widgets can read it with `getLatestAstrologySignal()`.

**Logs synchronization:**
- Every new log is stamped with the reading, including `astroFavoredNow`, in the user's zone.
- Legacy logs are back-derived when displayed.
- The dashboard reads the rhythm back from Logs, so the two stay in sync in both directions.

**Not implemented, by design:** any natal-chart data, meaning birth date, time or place, or sun, moon and rising signs.

**Known approximation:** `getRokuyo` uses a continuous six-day cycle from a fixed anchor. Traditional rokuyo is `(lunar month + lunar day) mod 6` on the Japanese lunisolar calendar, and it resets at each lunar month. The values therefore match only part of the time.

---

## PHASE 4: DEPLOY

```
Branch: claude/practical-curie-czaiel
  src/shared/utils/astrology.ts          MODIFIED  (rokuyo fix + v2 API)
  src/client/components/System.tsx       MODIFIED  (zone-aware reading, guidance, Logs rhythm, richer signal)
  src/client/stores/intentionEngine.ts   MODIFIED  (recordAstrologySignal extra/resonant, getLatestAstrologySignal)
  src/server/utils/logs.ts               MODIFIED  (shared reader, astroFavoredNow)
  src/client/components/Logs.tsx         MODIFIED  (ASTRO line for all snapshots, back-derived)
  src/shared/types/index.ts              MODIFIED  (LogContext.astroFavoredNow)
  scripts/tests/test-astrology.ts        ADDED
  package.json                           MODIFIED  (test:astrology script)
  docs/assembly/2026-11-27_LOT-assembly_astrology-widget-v2.md  ADDED
```

No database migration is needed, because `Log.context` is free-form JSONB.

---

## PENDING / NEXT SESSION CANDIDATES

1. **True lunisolar rokuyo.** Replace the continuous cycle with the real calculation: a new-moon table, the start of each lunar month, and `(month + day) % 6`. This is the largest accuracy improvement left.
2. **A QIE pattern for `resonant` / `auspicious`.** Nudge the user toward intentions or goals on Taian days, or on days that fall in their own top logging phase. This still deserves a dedicated benchmark pass covering the pattern number and the wiki, doctrine and lexicon updates.
3. **Have the `cosmic` widget read `getLatestAstrologySignal()`.** It currently declares the dependency but doesn't consume the metadata.
4. **Mood × moon correlation.** `emotional_checkin` logs carry moods, so the rhythm could report "calmest under Waxing Gibbous".
5. **Show the guidance next to the timestamp in the Logs editor.** "Writing in a favored window" as a subtle header hint.
6. `getJapaneseZodiac` and `getMoonEmoji` are still unused.

---

*LOT Self-Assembly Engine, automated session*
