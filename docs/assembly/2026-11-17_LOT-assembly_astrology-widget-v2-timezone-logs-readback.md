# LOT Self-Assembly Session Report
## 2026-11-17 | Astrology Widget — v2: Profile timeZone, Logs Read-back, Rokuyo Day-Boundary Fix

**Branch:** `claude/practical-curie-rsz1qk`
**Base commit:** `98971f2`
**Previous session:** `docs/assembly/2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)
**COSMO Gate:** Kuzya Cosmo Marmeladov — monitoring
**Session type:** Automated / Scheduled (recurring routine)
**Live site access:** not attempted. All work comes from reading the repo, local builds and unit checks.

---

## MISSION BRIEF

Standing recurring instruction: keep evolving the Astrology block (zodiac hour,
moon phase, rokuyo — ambient conditions, **not** a personal natal chart). The
goals are user personalization, sync with other widgets, and sync with Logs
entries. Each session pushes a full understanding and features breakdown.

---

## PHASE 0 — ORIENTATION (what v1 left behind)

v1 (2026-07-27) made three changes:
- a 15-minute recompute while the tab is visible,
- moon illumination shown on screen,
- a Tier 0 `astrology` QIE source plus a once-per-day `ambient_reading` signal, and an
  ASTRO snapshot on every log's `context` (`getLogContext`).

Open items v1 deferred, plus defects found in this session's audit:

| # | Finding | Severity |
|---|---|---|
| 1 | **Rokuyo flipped at UTC midnight, not local midnight.** `getRokuyo` diffed against `new Date('2000-01-01')`, which is UTC midnight. A device west of UTC showed the *next* day's rokuyo from late afternoon on (Los Angeles: 16:00–23:59, a third of every day). | Bug |
| 2 | **Server moon phase skewed by the user's UTC offset.** v1's `toWallClockDate` built a fake-local Date and passed it to `getMoonPhase`. The moon phase is an absolute astronomical quantity, so the log illumination % could disagree with the dashboard. | Bug (minor) |
| 3 | The dashboard used device time. Logs used the saved profile timeZone. `/me` never exposed `timeZone`, so the client couldn't match. | v1 pending item |
| 4 | Logs sync went one way only: logs *stored* the sky, but nothing *read it back*. | Gap |
| 5 | Two copies of the reading logic (System.tsx and logs.ts) could drift apart. | Debt |

---

## PHASE 1 — BUILD

### 1. Single shared reading — `src/shared/utils/astrology.ts`
New isomorphic API (Intl only, no dayjs in shared code):

- `getWallClockDate(now, timeZone?)` returns a Date whose local getters read the
  wall clock in `timeZone`. A null or invalid zone falls back to `now`
  (`timeZone: null`).
- `getAstrologyReading(now, timeZone?)` returns an `AstrologyReading`:
  `hourlyZodiac, westernZodiac, rokuyo, rokuyoGuidance, moonPhase,
  moonIllumination, auspicious, readingDate (YYYY-MM-DD local), timeZone`.
  Calendar and clock values use the wall clock. The moon uses real `now` (fixes #2).
- `ROKUYO_GUIDANCE`: one plain line per rokuyo day type (e.g. Taian →
  "Auspicious — good day to begin").
- `summarizeLogsUnderSky(logs, reading)` returns `{ samePhase, sameRokuyo,
  withReading }` (fixes #4).

**Rokuyo fix (#1):** the day count now comes from
`Date.UTC(y, m, d)` of the reading's own local fields, with a positive modulo
for dates before 2000.
**History is preserved:** every hour from 2020 to 2026 was checked on a UTC host,
and there were **0 mismatches** against the old function. Server-stamped Logs
history therefore stays consistent. On an `America/Los_Angeles` host, the old and new versions differed
for 18,790 hours, which is exactly the 16:00–24:00 window of every day (the bug).

### 2. Server Logs use the shared reading — `src/server/utils/logs.ts`
`getLogContext` now calls `getAstrologyReading(new Date(), user.timeZone)`.
The local `toWallClockDate` helper is removed. The `LogContext` field names are
unchanged (`astroRokuyo`, `astroMoonPhase`, `astroMoonIllumination`,
`astroHourlyZodiac`, `astroWesternZodiac`). No migration is needed.

### 3. Profile timeZone personalization (#3)
- `src/server/models/user.ts`: `useProfileView()` now includes `timeZone`.
  It is only used by `GET /api/me`, so it returns the user's **own** setting to themselves.
- `src/shared/types/index.ts`: added `UserProfile.timeZone?: string | null`.
- `src/client/components/System.tsx`: the `astrology` memo is now
  `getAstrologyReading(new Date(), me?.timeZone)`, keyed on the 15-minute tick and the
  timeZone. If a traveller's device is set to another zone, the dashboard still shows the same sky that their
  logs record.

### 4. Logs read-back on the dashboard (#4)
New `AstrologyDetail` line under the main reading, on both render sites
(the compact layout and the cycling Astrology/Psychology/Journey/Biofield block):

```
Scorpio • Monkey • Tomobiki • First Quarter (57%)
Shared plans go well • 12 logs under this moon
```

The count appears only after the user has at least one log carrying an ASTRO
snapshot (entries written since 2026-07-27).

### 5. Richer QIE signal (widget synchronization)
`recordAstrologySignal(...)` in `intentionEngine.ts` takes an optional `extra`
object. The daily `ambient_reading` signal now carries `readingDate`,
`timeZone`, `logsSamePhase`, `logsSameRokuyo` and `logsWithReading`, alongside
`auspicious`. Downstream widgets (`system`, `cosmic` via the Tier 0
`astrology` dependency) can now tell whether a moon phase has personal history.
Other changes to when the signal fires:
- the once-per-day key is the reading's **local date in the profile timeZone**,
  not the device date;
- it waits for the logs query to finish (`isFetched`), so the counts are real.
  It does not wait for `logs.length > 0`, so a user with no logs still gets the
  signal;
- `localStorage` access is wrapped in try/catch, so it survives private mode.

### 6. Richer journal line — `src/client/components/Logs.tsx`
`SYS:` blocks now show
`ASTRO: Taian · Full Moon (98%) · Horse hour`. Before this session they showed
only the rokuyo and moon phase.

---

## PHASE 2 — TEST

```
npm install --legacy-peer-deps   -> OK (node_modules absent at start; known peer conflict)
npm run server:build             -> PASS
npm run client:build             -> PASS (only the old duplicate-key warnings)
tsc --noEmit (client config)     -> 0 errors in touched code (the repo's existing errors elsewhere are unchanged)
```

Unit checks (esbuild bundle, run as `TZ=UTC` and `TZ=America/New_York` hosts):

| Check | Result |
|---|---|
| Reading for 2026-11-17 23:30Z in null / UTC / LA / Tokyo / invalid zone | Tokyo rolls to 2026-11-18 + Senpu; invalid zone falls back to `timeZone: null` |
| Same zone gives the same reading regardless of host TZ | ✓ |
| Rokuyo 7-day sequence cycles all 6 values | ✓ |
| Pre-2000 date (negative diff) | ✓ valid value (Shakku) |
| Old vs new rokuyo, UTC host, hourly 2020–2026 | **0 mismatches** |
| `summarizeLogsUnderSky` skips null contexts | ✓ |

Not tested: the dashboard was not opened in a browser. That needs a running server and
database, which this container does not have.

---

## PHASE 3 — FEATURES BREAKDOWN (Astrology state after v2)

| Layer | Feature | Since |
|---|---|---|
| Math | Hourly zodiac (12 × 2h), Western sign, rokuyo (6-day), moon phase + illumination | base |
| Math | Rokuyo flips at the viewer's **local** midnight | **v2** |
| Math | Shared `getAstrologyReading()` used by client and server | **v2** |
| Personalization | Reading follows the user's saved profile `timeZone` (device time if unset) | **v2** |
| Personalization | Rokuyo day guidance line | **v2** |
| Personalization | "N logs under this moon": the user's own history under the current sky | **v2** |
| Freshness | Recomputes every 15 min while the tab is visible, and again when the timeZone changes | v1 / v2 |
| Widget sync | Tier 0 QIE source `astrology` → `system`, `cosmic` | v1 |
| Widget sync | Daily `ambient_reading` signal with `auspicious`, timeZone, local date, Logs counts | v1 / **v2** |
| Logs sync (write) | Every new log's `context` stores the ASTRO snapshot (user timeZone) | v1 |
| Logs sync (write) | The snapshot moon phase uses real time (no more offset skew) | **v2** |
| Logs sync (read) | Dashboard counts logs with the same phase and same rokuyo | **v2** |
| Logs render | `ASTRO: rokuyo · phase (illum%) · zodiac hour` | **v2** |
| Out of scope by design | Natal chart: birth date, time or place; sun, moon or rising sign | — |

### Data flow
```
              getAstrologyReading(now, user.timeZone)   [shared]
                 │                              │
   server: getLogContext ─► Log.context.astro*  │  client: System.tsx useMemo
                 │                              │
                 └──► GET /api/logs ──► summarizeLogsUnderSky ──► AstrologyDetail
                                                │
                                   recordAstrologySignal (1×/local day)
                                                │
                                 QIE Tier 0 'astrology' ─► system, cosmic
```

---

## PHASE 4 — DEPLOY

```
Branch: claude/practical-curie-rsz1qk
  src/shared/utils/astrology.ts          MODIFIED  (reading API, rokuyo fix, read-back)
  src/server/utils/logs.ts               MODIFIED  (uses the shared reading)
  src/server/models/user.ts              MODIFIED  (/me exposes own timeZone)
  src/shared/types/index.ts              MODIFIED  (UserProfile.timeZone)
  src/client/components/System.tsx       MODIFIED  (tz-aware reading, AstrologyDetail, signal v2)
  src/client/stores/intentionEngine.ts   MODIFIED  (recordAstrologySignal extra payload)
  src/client/components/Logs.tsx         MODIFIED  (richer ASTRO line)
  docs/assembly/2026-11-17_LOT-assembly_astrology-widget-v2-timezone-logs-readback.md  ADDED
```

---

## PENDING / FUTURE WORK

- **QIE pattern on top of the read-back** (still deferred from v1, now unblocked): for example a
  nudge on Taian days when `logsSameRokuyo` is high, or a "last time the moon
  was here you wrote…" memory surface. This needs a full self-assembly pass
  (pattern number, wiki, doctrine, lexicon, Field Manual sync).
- **Moon-cycle mood correlation:** group mood logs by `astroMoonPhase` and
  show the dominant mood per phase. The data is already in `Log.context`.
- The rokuyo is still a fixed 6-day cycle, not tied to the lunisolar calendar
  (the traditional rokuyo resets on each lunar month's first day). An
  accurate version needs a lunisolar month table. Any change has to keep Logs
  history consistent, e.g. by stamping a new `astroRokuyoV` field instead of
  changing old values.
- `getJapaneseZodiac` and `getMoonEmoji` are still unused.

---

*LOT Self-Assembly Engine — automated session*
*COSMO Gate status: monitoring*
