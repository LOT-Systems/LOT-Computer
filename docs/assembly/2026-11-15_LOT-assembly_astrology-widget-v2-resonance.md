# LOT Self-Assembly Session Report
## 2026-11-15 | Astrology Widget — v2: TimeZone Unification + Logs Resonance

**Branch:** `claude/practical-curie-wab7ly`
**Base commit:** `98971f2`
**Previous astrology session:** `docs/assembly/2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)
**Session type:** Automated / Scheduled (recurring routine)
**Live site access:** not attempted. All work comes from reading the repo.

---

## MISSION BRIEF

Standing instruction: keep evolving the Astrology block (today's zodiac hour,
moon phase, rokuyo; ambient conditions, not a personal natal chart). Focus on
user personalization, sync with other widgets, and sync with Logs entries.
Push a full understanding and features breakdown each session.

---

## PHASE 0 — UNDERSTANDING (state at session start, after v1)

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure isomorphic readers: zodiac hour, Western sign, rokuyo, moon phase |
| Widget | `src/client/components/System.tsx` | Two render sites: a static compact block, and the "pro" block that cycles Astrology → Psychology → My Journey → Biofield |
| Freshness | `System.tsx` | 15-minute tick, paused while the tab is hidden (v1) |
| Widget bus | `src/client/stores/intentionEngine.ts` | Tier 0 QIE source `astrology`, feeding `system` and `cosmic`. Sends one `ambient_reading` per day (v1) |
| Logs | `src/server/utils/logs.ts` `getLogContext` | Stamps `astro*` fields onto every log's `context` JSONB in the user's timeZone (v1) |
| Journal render | `src/client/components/Logs.tsx` | `SYS:` block shows `ASTRO: rokuyo · moon` (v1) |

### Bugs found this session

1. **Rokuyo flipped at the wrong hour (affected every non-UTC user).**
   `getRokuyo` counted milliseconds between the local date and a
   **UTC-midnight** anchor (`new Date('2000-01-01')`). So the six-day cycle
   flipped at 19:00 in New York and 09:00 in Tokyo instead of at midnight.
   The dashboard (device time) and the Logs snapshot (server, UTC) could also
   show **different rokuyo for the same moment**, which undermined the v1
   Logs sync.
2. **Moon phase on the server was shifted by the user's UTC offset.** The
   v1 `toWallClockDate` trick is right for calendar readings, but it moved
   the *absolute instant* that feeds the moon calculation by up to ±14 h.
   The moon is the same everywhere, so it should never be zone-shifted.
3. **New Moon was half as wide as it should be.** `getMoonPhase` called
   everything from day 23.6 to 29.53 "Waning Crescent", which absorbed the
   ~1.85 days *before* each new moon. The standard boundary is 27.68493.
4. **The dashboard ignored the saved timeZone.** v1 left this open: the
   widget used device time while Logs used `user.timeZone`. `/me`
   (`useProfileView`) never exposed `timeZone`, so the client couldn't use it.
5. Minor: the `localStorage` day-stamp guard had no try/catch, so it threw
   in private or blocked-storage browsers.

---

## PHASE 1 — BUILD

### 1. One canonical reader: `getAstrologyReading(date, timeZone)`
`src/shared/utils/astrology.ts`
- `toZonedWallClock(date, tz)`: an isomorphic `Intl.DateTimeFormat` wall
  clock with no dayjs dependency. Falls back to the input date when the zone
  is missing or invalid.
- `getAstrologyReading` reads the calendar values (rokuyo, zodiac hour,
  Western sign) from the zone's wall clock, and the moon from the real
  instant. Returns
  `{ hourlyZodiac, westernZodiac, rokuyo, moonPhase, moonIllumination, auspicious, timeZone }`.
- **The dashboard and the server Logs snapshot now call the same function**,
  so the widget and the journal always agree.
- `getRokuyo` now counts whole calendar days with `Date.UTC(y, m, d)` from the
  date's own local fields, and uses a positive modulo (safe before 2000).
- `getMoonPhase` has the corrected Waning Crescent / New Moon boundary and a
  positive modulo.

### 2. Personalization from Logs: `computeAstroResonance(contexts, today)`
This is the first personal layer, and it is built from **when the user
actually writes**, not from birth data.
- Reads the `astro*` snapshot from every log's `context` (written since v1).
- Returns `null` until there are **12 or more** astro-stamped logs
  (`ASTRO_RESONANCE_MIN_SAMPLE`), so it never claims a pattern on thin data.
- Outputs:
  - `topHourZodiac`, `topMoonPhase`, `topRokuyo`: the user's most-written
    conditions.
  - `todayRatio`: observed vs. expected share of logs under today's rokuyo
    (expected 1/6) and today's moon phase (expected = that phase's actual
    share of the lunar cycle). The two are averaged.
  - `level`: `resonant` (≥1.25), `steady`, or `quiet` (≤0.75).
  - `isPeakHour`: true when the current zodiac hour is the user's top hour.

### 3. Widget render
`System.tsx`, both render sites. The pro site is wrapped in a fragment
because it sits inside the view ternary.
```
Scorpio • Dragon • Taian • Waxing Crescent (28%)
Rhythm: Dragon hour (now) • Waxing Gibbous • Today resonant     ← dimmed, appears at ≥12 logs
```
- The reading now uses `me.timeZone` when it is set, and falls back to device
  time otherwise. The useMemo re-runs when the 15-minute tick or the zone
  changes.

### 4. Sync with other widgets (QIE)
`recordAstrologySignal(...)` takes an optional 6th argument. The daily
`ambient_reading` signal now also carries `resonance`, `resonanceRatio`,
`topHourZodiac`, `topMoonPhase` and `sampleSize`. So `cosmic`, `system` and
any future pattern get the **personalized** reading, not just the raw sky.
The signature change is backward compatible.

### 5. Sync with Logs
- `getLogContext` now uses `getAstrologyReading(new Date(), user.timeZone)`.
  The `toWallClockDate` helper is gone.
- The journal `SYS:` line now shows illumination and zodiac hour:
  `ASTRO: Taian · Waxing Crescent (28%) · Dragon hour`.
- The two are a loop: Logs stamp the sky, the widget reads those stamps back
  as the user's personal rhythm, and the QIE spreads it to other widgets.

### 6. Profile
`UserProfile.timeZone?` was added, and `useProfileView` now includes
`timeZone`. It is only used by `/me`, the user's own profile, and it is
derived from the city they already set.

---

## PHASE 2 — TEST

| Check | Result |
|---|---|
| `npm run build` (client esbuild + server tsc) | PASS |
| `tsc --noEmit -p tsconfig.json` | 104 errors, the same as baseline `98971f2`. **0 new** |
| Rokuyo day boundary | Same value at 00:00:01 and 23:59:59, changes at the next 00:00:01 ✔ |
| Cross-zone | 2026-11-15T03:30Z → NY / LA = Taian (Nov 14), Tokyo / UTC = Shakku (Nov 15) ✔ |
| Process-TZ independence | Same output with `TZ=Asia/Kolkata` ✔ |
| Invalid zone | Falls back to the instant, no throw ✔ |
| Resonance | 20 synthetic logs → `resonant`, ratio 4.17, top hour Dragon; 5 logs → `null` ✔ |

The client build's duplicate-key warnings come from the existing
`src/client/utils/badges.ts`, not from this session.

**Data note:** logs stamped *before* this fix may have a rokuyo that is off
by one day for non-UTC users when the log was written in the evening (UTC−)
or morning (UTC+). The resonance needs 12 or more samples and averages
across days, so the effect fades as new, correct logs pile up. No backfill
was done, because `context` is a historical snapshot.

---

## PHASE 3 — FULL FEATURES BREAKDOWN (current state, after v2)

**Readings (ambient, no birth data, no external API)**
- Zodiac hour: 12 Japanese animals in 2-hour blocks, Rat = 23:00–01:00
- Western sun sign of the current date
- Rokuyo: six-day cycle (Sensho, Tomobiki, Senpu, Butsumetsu, Taian, Shakku).
  `auspicious` = Taian. This is a simplified Gregorian cycle, not the true
  lunisolar-calendar rokuyo.
- Moon phase (8 names) and illumination %

**Timekeeping**
- One reader (`getAstrologyReading`) shared by client and server
- Uses the saved `user.timeZone`, with device time as the fallback
- Rokuyo and Western sign roll over at local midnight. The moon is absolute.
- Recomputes every 15 minutes while the tab is visible

**Personalization**
- A personal rhythm from the user's own Logs: top zodiac hour, top moon
  phase, top rokuyo
- Daily resonance: resonant, steady or quiet
- Marks "(now)" during the user's peak writing hour
- Hidden until 12 or more astro-stamped logs exist

**Widget sync (QIE)**
- Tier 0 source `astrology` → `system`, `cosmic`
- One `ambient_reading` per day, carrying `auspicious` and the resonance fields

**Logs sync**
- Every new log stamps `astroRokuyo`, `astroMoonPhase`,
  `astroMoonIllumination`, `astroHourlyZodiac` and `astroWesternZodiac`
- Journal `SYS:` shows rokuyo · phase (illum%) · zodiac hour
- The widget reads these stamps back to build the personal rhythm

**Not implemented, on purpose:** natal-chart data (birth date, time or place;
rising and moon signs).

---

## PHASE 4 — DEPLOY

```
Branch: claude/practical-curie-wab7ly
src/shared/utils/astrology.ts          MODIFIED  (rokuyo + moon fixes, reader, resonance)
src/server/utils/logs.ts               MODIFIED  (canonical reader)
src/client/components/System.tsx       MODIFIED  (tz-aware reading, Rhythm line, QIE payload)
src/client/stores/intentionEngine.ts   MODIFIED  (resonance metadata on signal)
src/client/components/Logs.tsx         MODIFIED  (ASTRO line detail)
src/server/models/user.ts              MODIFIED  (timeZone in profile view)
src/shared/types/index.ts              MODIFIED  (UserProfile.timeZone)
docs/assembly/2026-11-15_LOT-assembly_astrology-widget-v2-resonance.md  ADDED
```

---

## PENDING / NEXT SESSION

- **A QIE pattern that uses resonance.** For example: on `resonant` days
  during the peak hour, nudge toward journaling or intentions; on `quiet`
  days, lower nudge pressure. Carried over from v1. It needs the full
  benchmark treatment (pattern number, wiki, Field Manual).
- **True rokuyo.** The real rokuyo follows the Japanese lunisolar
  (kyūreki) month and day, `(month + day) % 6`. It resets at each lunar
  month, so the current six-day cycle drifts from published Japanese
  calendars. A lunar-month table or calculation would make it authentic.
- **Click to expand.** Show the raw distribution (logs per zodiac hour /
  moon phase) as a small Table inside the block.
- **Cosmic widget.** Have the `cosmic` widget actually read the `astrology`
  signal metadata it is now wired to.
- `getJapaneseZodiac` and `getMoonEmoji` are still unused.

---

*LOT Self-Assembly Engine — automated session*
