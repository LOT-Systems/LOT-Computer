# LOT Self-Assembly Session Report
## 2026-11-22 | Astrology Widget — Personalization + Widget Sync + Logs Echo | v2

**Branch:** `claude/practical-curie-6jk0fr`
**Base commit:** `9f2b88c`
**Previous session:** `docs/assembly/2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)
**Session type:** Automated / Scheduled (recurring routine)
**Scope rule:** ambient conditions only (zodiac hour, moon phase, rokuyo). Not a personal natal chart.

---

## 1. WHAT THE ASTROLOGY BLOCK IS

A one-line ambient reading on the System dashboard
(`src/client/components/System.tsx`). It appears in two places:

| Layout | Render | Notes |
|---|---|---|
| Compact / basic | static `Block label="Astrology:"` | always the astrology reading |
| Pro | cycling block: Astrology → Psychology → My Journey → Quantum | click to cycle |

Line 1 (unchanged format):
`Sagittarius • Monkey • Sensho • Waxing Gibbous (97%)`
= Western sign of the day • zodiac animal of the current 2-hour period • rokuyo day-type • moon phase (illumination).

Line 2 (**new this session**), dimmed:
`Act early — mornings favor you. · Taian in 4d`
= a one-line meaning of today's rokuyo plus a countdown to the next Taian (most auspicious) day.

Line 3 (**new this session**), dimmer, shown only once the user has logs that carry an astro snapshot:
`Logs: 7 on Sensho · 3 under Waxing Gibbous`
= how many of the user's past log entries were written on the same rokuyo day-type and under the same moon phase.

---

## 2. ARCHITECTURE MAP (post-session)

```
                 src/shared/utils/astrology.ts  (pure, isomorphic)
                 ├─ getAmbientReading(instant, timeZone?)  ← NEW single entry point
                 ├─ getAmbientLogEcho(logs, reading)       ← NEW Logs cross-reference
                 ├─ toWallClockInZone(instant, tz)         ← NEW Intl-based zone shift
                 ├─ getRokuyoGuidance / ROKUYO_GUIDANCE    ← NEW
                 ├─ getDaysUntilRokuyo(date, target)       ← NEW
                 └─ getHourlyZodiac / getWesternZodiac / getRokuyo (FIXED) / getMoonPhase
                         │                                   │
        ┌────────────────┘                                   └───────────────┐
  CLIENT  System.tsx                                              SERVER  utils/logs.ts
  getAmbientReading(now, me.timeZone)                             getLogContext(user)
  getAmbientLogEcho(useLogs(), reading)                           getAmbientReading(now, user.timeZone)
  ├─ <AstrologyDetail/> line 2 + 3                                └─ writes log.context.astro* on every log
  └─ recordAstrologySignal(... , extras) once/day                          │
        │                                                                  ▼
        ▼                                                        Logs.tsx SYS: block
  QIE intentionEngine 'astrology' Tier 0 source                  ASTRO: Sensho · Waxing Gibbous (97%) · Monkey hr
  → system, cosmic (WIDGET_DEPENDENCY_MAP)
```

`/me` (`src/server/models/user.ts` `useProfileView`) now includes the user's
own `timeZone`, which is how the client gets it. That function is only used
by `/me`, so the zone is never sent to anyone else.

---

## 3. CHANGES THIS SESSION

### 3.1 Bug fix: the rokuyo changed in the middle of the day
`getRokuyo` counted raw milliseconds from a UTC-midnight anchor
(`new Date('2000-01-01')`). On any runtime not set to UTC, the day-type
changed at the UTC midnight, not the local one. In UTC-8 that is **16:00 local
time**. So the dashboard (device time) and the server log snapshot could show
different rokuyo for the same moment. It now counts whole local calendar days
(`Date.UTC(y, m, d)` from the wall-clock fields) and uses a safe modulo for
negative values.
Verified: for 00:05 and 23:55 on the same local day the result is the same,
and it changes at the next local midnight. The output is identical when the
test runs under `TZ=UTC` and `TZ=America/Los_Angeles`.

### 3.2 Bug fix: server moon phase was skewed by the zone offset
v1 built a "wall-clock" `Date` for the user's zone and passed it to
`getMoonPhase`, which reads `getTime()`. That shifted the moon by the
user-to-server offset (up to ±14 h). The moon phase is global, so
`getAmbientReading` now uses the true instant for the moon and the zone's
wall clock only for the calendar-bound parts.

### 3.3 Personalization: dashboard follows the saved profile timeZone
v1 left this as future work. The dashboard read device-local time while Logs
used `user.timeZone`. Both now go through
`getAmbientReading(instant, timeZone)`:
- Client uses `me.timeZone` (now exposed on `/me`) and falls back to device time.
- Server uses `user.timeZone`.
- The memo recomputes when the zone changes as well as on the existing 15-minute visible-tab tick.
- `toWallClockInZone` uses `Intl.DateTimeFormat#formatToParts` with no
  dependencies. If the zone is invalid it falls back to the instant without
  throwing.

### 3.4 Personalization: rokuyo guidance + Taian countdown
`ROKUYO_GUIDANCE` gives one line per day-type:

| Rokuyo | Guidance |
|---|---|
| Sensho 先勝 | Act early — mornings favor you. |
| Tomobiki 友引 | Shared plans go well; good for gatherings. |
| Senpu 先負 | Go slow early; afternoons favor you. |
| Butsumetsu 仏滅 | Quiet day — rest, close loops, start nothing big. |
| Taian 大安 | Most auspicious day — begin what matters. |
| Shakku 赤口 | Take care; only midday (11–13) is clear. |

`getDaysUntilRokuyo(date, 'Taian')` gives the countdown (0 = today). The
countdown is not shown on Taian days, because the guidance already says so.

### 3.5 Logs sync: the "echo"
`getAmbientLogEcho(logs, reading)` goes through the user's logs (already
loaded by `useLogs()` on the dashboard, so no extra request) and counts
entries whose `context.astroRokuyo` / `context.astroMoonPhase` match the
current reading. Logs written before v1 have no astro snapshot. They are
counted as untracked and skipped, so the line stays hidden until there is
data.

New log context field: `astroDaysUntilTaian` (`LogContext` in
`src/shared/types/index.ts`, stored in the `context` JSONB column, so no
migration is needed).

The journal `SYS:` block in `Logs.tsx` now shows the full snapshot:
`ASTRO: {rokuyo} · {moonPhase} ({illum}%) · {hourlyZodiac} hr`.

### 3.6 Widget synchronization: richer QIE signal
`recordAstrologySignal(..., extras)` takes a new optional `extras` argument
(backward compatible). The daily `ambient_reading` signal now carries:
- `daysUntilTaian`, `timeZone`
- `logEchoSameRokuyo`, `logEchoSameMoon`, `logEchoTracked`
- `resonant`: true when the share of the user's logs on today's rokuyo is
  above 1/6, the level you'd expect if logs were spread evenly over the six
  day-types. It means "this user writes more than usual on days like today".

The once-per-day guard key now uses the date **in the reading's zone**. The
`localStorage` access is wrapped in try/catch, because it can throw in
private windows.

---

## 4. TEST

```
npm install --legacy-peer-deps   -> OK (pre-existing nanostores peer conflict)
npm run build                    -> PASS (client esbuild + server tsc)
npx tsc --noEmit -p tsconfig.json -> 104 errors before, 104 after (all pre-existing, none added)
ad-hoc esr script under TZ=UTC and TZ=America/Los_Angeles:
  getAmbientReading(2026-11-22T23:30Z, null | LA | Tokyo)  -> identical across runtime TZ
  rokuyo constant across a local day, changes at local midnight -> OK
  invalid timeZone -> falls back to the instant                 -> OK
  getAmbientLogEcho on mixed / null contexts                    -> {1, 2, tracked 2} OK
```

The UI was not checked visually in a browser this session, because it needs a
database and an authenticated session.

---

## 5. FULL FEATURES BREAKDOWN (current state)

| Feature | Status | Where |
|---|---|---|
| Western sign, zodiac hour, rokuyo, moon phase + illumination | live | `astrology.ts` |
| Recomputes every 15 min, paused while the tab is hidden | live (v1) | `System.tsx` |
| Saved-timeZone personalization (dashboard + Logs agree) | **live (v2)** | `getAmbientReading`, `/me.timeZone` |
| Rokuyo changes at local midnight (fixed) | **live (v2)** | `getRokuyo` |
| Global moon phase from the true instant (fixed) | **live (v2)** | `getAmbientReading` |
| Rokuyo guidance line | **live (v2)** | `ROKUYO_GUIDANCE`, `AstrologyDetail` |
| Taian countdown | **live (v2)** | `getDaysUntilRokuyo` |
| Logs echo (same rokuyo / same moon) | **live (v2)** | `getAmbientLogEcho` |
| Astro snapshot on every log entry | live (v1) + `astroDaysUntilTaian` (v2) | `server/utils/logs.ts` |
| Journal `SYS:` ASTRO line with illumination + zodiac hour | **extended (v2)** | `Logs.tsx` |
| QIE Tier 0 `astrology` source → `system`, `cosmic` | live (v1) | `intentionEngine.ts` |
| Daily signal with `auspicious`, `resonant`, echo, zone | **extended (v2)** | `recordAstrologySignal` |
| Natal chart / birth data | not built, by design | — |

---

## 6. PENDING / NEXT SESSION

- **QIE pattern** that uses `auspicious` + `resonant` together with `goals`/`intentions`
  (for example, a gentle "begin what matters" nudge in IntentionsWidget on Taian days when
  `resonant` is true). This still needs a full self-assembly pass (pattern number, wiki,
  Field Manual sync), so it stays deferred.
- **Cosmic widget consumption**: `CosmicUpdateWidget` / `QuantumSignWidget` are wired to `astrology`
  in the dependency map but don't read the signal yet. Their daily "astrology patch" could
  use the actual moon phase/rokuyo instead of `dayOfYear % n`.
- **Logs filter**: tapping the echo line could filter the Logs view to entries from the same
  rokuyo or moon phase. The data is already in `context`, so no new data is needed.
- **Rokuyo accuracy**: the cycle is a simple 6-day count from a fixed anchor. Traditional rokuyo
  resets on each lunisolar month start. A lookup table or algorithm would make it match printed
  Japanese calendars.
- `getJapaneseZodiac` / `getMoonEmoji` are still unused. They can stay unused while the scope is
  ambient-only.

---

*LOT Self-Assembly Engine — automated session*
