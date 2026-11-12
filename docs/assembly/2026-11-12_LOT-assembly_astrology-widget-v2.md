# LOT Self-Assembly Session Report
## 2026-11-12 | Astrology Widget — v2: TimeZone Anchoring, Guidance, Logs Resonance

**Branch:** `claude/practical-curie-cro1lb`
**Base commit:** `98971f2`
**Previous session:** `docs/assembly/2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)
**Session type:** Automated / scheduled routine ("The Astrology Widget")

---

## MISSION BRIEF

Standing instruction: keep evolving the Astrology block (today's zodiac hour,
moon phase, rokuyo — ambient conditions, **not** a personal natal chart) for
user personalization and sync with other widgets; keep it in sync with Logs
entries; push a full understanding + features breakdown each session.

---

## 1. UNDERSTANDING — HOW THE FEATURE WORKS (v2)

The Astrology block is not its own component. It sits inline in the dashboard
(`src/client/components/System.tsx`) and reads from one shared, isomorphic
utility module.

```
                     src/shared/utils/astrology.ts
                 getAstrologyReading(now, timeZone)
                 getLogAstroResonance(logs, reading)
                    ▲                          ▲
     client (System.tsx)                server (utils/logs.ts)
     me.timeZone → reading              user.timeZone → reading
     logs → resonance                   → Log.context.astro* snapshot
          │                                    │
          ├─► Astrology block (UI)             └─► Logs.tsx  "ASTRO:" line
          └─► recordAstrologySignal() ─► QIE atom (source 'astrology')
                                          ─► system, cosmic (dependency map)
```

| Piece | Location | Role |
|---|---|---|
| Math + reading | `src/shared/utils/astrology.ts` | Pure functions. v2 adds `getAstrologyReading`, `toZonedWallClock`, `getRokuyoGuidance`, `getMoonTrend`, `getMoonTrendHint`, `getLogAstroResonance` |
| Dashboard | `src/client/components/System.tsx` | Compact layout: static block. Pro layout: cycles Astrology → Psychology → My Journey → Biofield |
| Recompute cadence | `System.tsx` `astrologyTick` | Every 15 min, skipped while the tab is hidden (since v1) |
| Signal bus | `src/client/stores/intentionEngine.ts` `recordAstrologySignal` | Tier 0 source `astrology`. `system` and `cosmic` depend on it |
| Logs snapshot | `src/server/utils/logs.ts` `getLogContext` | Every new log's `context` JSONB carries `astro*` fields |
| Logs render | `src/client/components/Logs.tsx` | `SYS:` block prints `ASTRO:` |
| Types | `src/shared/types/index.ts` `LogContext` | `astroRokuyo`, `astroMoonPhase`, `astroMoonIllumination`, `astroHourlyZodiac`, `astroWesternZodiac`, `astroMoonTrend` (new) |

There is still **no birth data** anywhere (no birth date, time or place on
`User`). Personalization is built from `user.timeZone` and the user's own Logs
history.

---

## 2. THIS SESSION'S CHANGES

### 2.1 Bug fix: rokuyo changed at UTC midnight, not local midnight
`getRokuyo` counted raw epoch milliseconds from `new Date('2000-01-01')`
(UTC). So the day's rokuyo changed at 00:00 UTC, which is 4 PM in Los Angeles
and 9 AM in Tokyo. It now counts whole calendar days from the date's own
local Y/M/D. It also uses a safe modulo, so dates before 2000 no longer give
a negative array index (that returned `undefined`).

Verified: 00:05 and 23:55 on the same local day give the same rokuyo, and
00:05 the next day gives the next one.

### 2.2 Bug fix: moon phase in Logs was shifted by the UTC offset
v1's server-side `toWallClockDate()` trick was right for the calendar-based
readings (hour animal, sign, rokuyo). But it also fed the shifted Date into
`getMoonPhase`, which is based on the absolute instant. That moved the lunar
phase by the user's UTC offset (up to ±14 h), so phase names could be wrong
near phase boundaries. `getAstrologyReading` now uses the wall clock for the
calendar parts and the real instant for the moon.

### 2.3 Personalization: the dashboard follows the profile timeZone
This closes v1's pending item. The dashboard now calls
`getAstrologyReading(new Date(), me?.timeZone)`, which is the same function
the server uses for Logs. The block and the journal's `ASTRO:` line now
always agree, even when the device clock is set to a different zone than the
profile. If no timeZone is saved, or it is invalid, the reading uses device
time. `toZonedWallClock` uses only `Intl`, so it adds no dayjs-tz dependency
on the client.

### 2.4 New: guidance line
A second line under the reading shows:
- **Rokuyo guidance**: Sensho "Morning favored" · Tomobiki "Good for shared
  plans" · Senpu "Afternoon favored" · Butsumetsu "Rest, avoid launches" ·
  Taian "Auspicious all day" · Shakku "Midday only, take care"
- **Moon direction hint**: New "Set intentions" · Waxing "Build" · Full
  "Reflect" · Waning "Release"

This line appears in both the compact and pro layouts.

### 2.5 New: Logs resonance (Logs sync, read side)
v1 only wrote the astro snapshot into each log. v2 also reads it back.
`getLogAstroResonance(logs, reading)` scans the user's loaded logs for
`context.astroMoonPhase` and `context.astroRokuyo` and returns:
- `tagged`: logs that have a snapshot (written since 2026-07-27)
- `samePhase` / `sameRokuyo`: logs written under the current moon / rokuyo
- `dominantPhase`: the user's most-written moon phase, once there are at
  least 5 tagged logs ("Your moon")

The pro layout shows `N logs under this moon • Your moon: <phase>` when
`samePhase > 0`. Logs written before v1 have no snapshot and are skipped.

### 2.6 Richer QIE signal (widget sync)
`recordAstrologySignal(...)` takes a new optional `extra` argument. Existing
callers are unaffected. The `ambient_reading` metadata now also includes
`moonTrend`, `rokuyoGuidance`, `timeZone`, `logsTagged`, `logsSamePhase`,
`logsSameRokuyo`, `dominantPhase`, `inauspicious` (Butsumetsu) and
`resonant` (the current moon is the user's dominant moon). The signal still
fires once per day. The guard key is now `YYYY-MM-DD:<rokuyo>`, so changing
the profile timeZone in a way that changes the rokuyo emits a fresh reading.
localStorage reads and writes are now wrapped in try/catch, so private mode
can't throw.

### 2.7 Logs.tsx: fuller ASTRO line
`ASTRO: Tomobiki · Waxing Crescent (5%) · Dog hour`. Illumination and the
hour animal were already saved per log but were never shown.

### 2.8 Server snapshot adds `astroMoonTrend`
New optional `LogContext` field. No migration needed, because `context` is
free-form JSONB.

---

## 3. VERIFICATION

Spot check with `tsx` and `TZ=America/New_York`, at instant 2026-11-12T01:13Z:

| timeZone | hour | rokuyo | moon |
|---|---|---|---|
| (device, NY) | Dog | Tomobiki | Waxing Crescent 5% |
| America/Los_Angeles | Rooster | Tomobiki | Waxing Crescent 5% |
| Asia/Tokyo (already Nov 12 10:13) | Snake | Senpu | Waxing Crescent 5% |
| `Bad/Zone` (invalid) | Dog (fallback) | Tomobiki | Waxing Crescent 5% |

The moon is identical in every zone, as expected. The calendar parts follow
each zone.

```
npm run build  -> PASS (client esbuild + server tsc)
```
The only warnings are duplicate-key warnings in `src/client/utils/badges.ts`,
which existed before this session and are not related to it.

---

## 4. FEATURES BREAKDOWN (current state, after v2)

- **Readings:** Western sign · hour animal (2-hour 十二支 slots) · rokuyo
  (6-day cycle, simplified Gregorian approximation, not the true lunisolar
  calendar) · moon phase + illumination % · moon direction.
- **Guidance:** one plain-language line per day (rokuyo) and per lunar
  direction.
- **TimeZone anchoring:** uses the profile timeZone on both client and
  server, with device time as the fallback.
- **Freshness:** recomputes every 15 min while the tab is visible, and
  immediately when `me.timeZone` changes.
- **Logs (write):** each new log snapshots rokuyo, phase, illumination,
  hour animal, sign and moon direction.
- **Logs (read):** personal resonance, meaning logs under this moon and
  "Your moon".
- **Logs (render):** `ASTRO:` line in the journal `SYS:` block.
- **Widget sync:** QIE Tier 0 source `astrology`. `system` and `cosmic`
  depend on it. A daily `ambient_reading` signal carries auspicious,
  inauspicious and resonant flags plus the resonance counts.
- **By design, not included:** natal chart and any birth data.

---

## 5. FILES CHANGED

```
src/shared/utils/astrology.ts          rokuyo fix + v2 reading/guidance/resonance API
src/server/utils/logs.ts               shared reading, moon-instant fix, astroMoonTrend
src/shared/types/index.ts              LogContext.astroMoonTrend
src/client/components/System.tsx       timeZone anchoring, guidance line, resonance, richer signal
src/client/stores/intentionEngine.ts   recordAstrologySignal extra metadata
src/client/components/Logs.tsx         fuller ASTRO line
docs/assembly/2026-11-12_LOT-assembly_astrology-widget-v2.md   ADDED
```

---

## 6. PENDING / NEXT SESSION

- **QIE pattern** reacting to `astrology` + `goals`/`intentions` (for
  example, "Taian + waxing → nudge to start a goal"). The signal now has
  everything such a pattern needs (`auspicious`, `moonTrend`, `resonant`).
  Writing the pattern itself still needs a dedicated benchmark pass
  (pattern number, wiki, Field Manual).
- **Resonance depth:** `useLogs()` only returns the logs loaded on the
  client. A server aggregate (count by `context->>'astroMoonPhase'`) would
  make "Your moon" cover the full history.
- **True rokuyo:** the current cycle is a continuous 6-day approximation.
  Real rokuyo resets on each lunisolar month, so it needs a lunar-month
  table.
- `getJapaneseZodiac` and `getMoonEmoji` are still unused.
- An invalid `me.timeZone` falls back to device time silently. Consider
  validating it when the profile is saved.

---

*LOT Self-Assembly Engine — automated session*
