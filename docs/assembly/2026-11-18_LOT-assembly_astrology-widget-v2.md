# LOT Self-Assembly Session Report
## 2026-11-18 | Astrology Widget — v2 · Single Source of Truth · Logs-Derived Resonance

**Branch:** `claude/practical-curie-zsohn0`
**Base commit:** `9f2b88c`
**Previous session:** `docs/assembly/2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)
**Session type:** Automated / Scheduled (recurring routine)
**Build:** `npm run build` — PASS (server tsc + client esbuild)

---

## MISSION BRIEF

Standing recurring instruction: keep evolving the Astrology block (today's
zodiac hour, moon phase, rokuyo — ambient conditions, **not** a personal natal
chart) for user personalization and synchronization with other widgets, keep
it synchronized with Logs entries, and push a full understanding + features
breakdown document each session.

---

## PHASE 0 — UNDERSTANDING (state at session start)

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure isomorphic date math: hourly zodiac, Western sign, rokuyo, moon phase |
| Dashboard | `src/client/components/System.tsx` | Two render sites: static "Astrology:" block (compact layout) and cycling block Astrology → Psychology → My Journey → Biofield |
| QIE bus | `src/client/stores/intentionEngine.ts` | Tier 0 source `astrology`; consumed by `system`, `cosmic`; `recordAstrologySignal()` once per day |
| Logs snapshot | `src/server/utils/logs.ts` `getLogContext()` | Every new log stores `astro*` fields in `context` JSONB |
| Logs render | `src/client/components/Logs.tsx` | `SYS:` block prints `ASTRO: rokuyo · moon` |

### Defects found this session

1. **Rokuyo flipped at UTC midnight, not local midnight.** `getRokuyo()`
   subtracted `new Date('2000-01-01')` (UTC midnight) from the raw instant.
   In Los Angeles at 8 PM the dashboard already showed *tomorrow's* rokuyo.
2. **Dashboard vs Logs disagreement.** The dashboard computed from device-local
   time; the server Logs snapshot computed from `user.timeZone` through a
   separate code path. Same moment → potentially different rokuyo/zodiac hour
   on screen vs in the journal.
3. **Moon phase skewed by the timezone offset on the server.** `logs.ts` fed
   a *wall-clock-shifted* Date into `getMoonPhase()`. Moon phase is an
   absolute-time quantity, so this introduced up to ±14 h of error.
4. **No personalization from the user's own history** — v1 snapshotted astro
   context onto every log but nothing ever read it back.

---

## PHASE 1 — BUILD

### 1. Single source of truth — `getAstrologyReading(instant, timeZone)`

New in `src/shared/utils/astrology.ts`, used by **both** the dashboard and
the server Logs snapshot:

- Calendar-based fields (zodiac hour, Western sign, rokuyo) read the user's
  wall clock via new `toZonedWallClock()` (Intl-only, isomorphic, falls back
  to the raw instant for a missing/invalid zone).
- Moon phase + illumination use the **true instant** (fixes defect 3).
- Returns `AstrologyReading`: `hourlyZodiac`, `westernZodiac`, `rokuyo`,
  `rokuyoGuidance`, `auspicious`, `daysUntilTaian`, `moonPhase`,
  `moonIllumination`, `timeZone`.

### 2. Rokuyo fix

`getRokuyo()` now counts whole **calendar days** from the Date's own local
fields (`Date.UTC(y, m, d)` delta), with a negative-safe modulo so pre-2000
dates also resolve. Fixes defect 1.

### 3. New ambient features

- `ROKUYO_GUIDANCE` — one line of traditional guidance per day
  (e.g. Taian → "Auspicious — good day to begin", Butsumetsu → "Rest and close loops").
- `getDaysUntilTaian(date)` — countdown to the next auspicious day.

### 4. Personalization from Logs — `summarizeAstroResonance()`

Reads the `astroRokuyo` / `astroMoonPhase` snapshot that every log already
carries and returns: `sampled`, `topMoonPhase`, `topRokuyo`,
`todayRokuyoCount`, `todayMoonCount`. This is behavior-derived
personalization ("when do *you* write?") — still no birth data.

### 5. Dashboard (`System.tsx`)

- Reads `me.timeZone` (saved profile) instead of device time → fixes defect 2.
- Both render sites gain a muted detail line, e.g.
  `Go slow — afternoons favored • Taian in 2d • 14 logs on Senpu days`
  or `… • Your most active moon` when today's moon phase is the one the user
  has logged most under. Resonance hints appear only after ≥ 5 snapshots.
- localStorage access wrapped in try/catch.
- The daily QIE signal now waits for Logs to load so it carries resonance.

### 6. Widget sync — QIE signal enriched

`recordAstrologySignal(..., extra)` adds metadata: `daysUntilTaian`,
`timeZone`, `resonantMoon`, `resonantRokuyo`, `resonanceSampled`. Downstream
widgets (`system`, `cosmic`, and any future pattern) can now key off
"today matches this user's most active conditions", not just "today is Taian".
Signature is backward-compatible (new arg optional).

### 7. Logs sync

- `getLogContext()` now uses `getAstrologyReading()` and also stores
  `astroAuspicious` (new optional `LogContext` field; JSONB, no migration).
- `SYS:` block shows the full reading:
  `ASTRO: Senpu · Dog hr · Waxing Gibbous (69%)`.
- **Every** log entry's hover context line (`LogContainer`) now appends
  `rokuyo · moon`, not just system snapshots.

---

## PHASE 2 — TEST

```
npm install --legacy-peer-deps   (node_modules absent in fresh container; pre-existing peer conflict)
npm run build                    -> PASS
```

Spot check (`npx tsx`, instant 2026-11-19T04:00Z):

| timeZone | Local time | Rokuyo | Zodiac hr | Moon |
|---|---|---|---|---|
| America/Los_Angeles | Nov 18, 20:00 | Senpu | Dog | Waxing Gibbous 69% |
| Asia/Tokyo | Nov 19, 13:00 | Butsumetsu | Goat | Waxing Gibbous 69% |
| Bad/Zone | fallback | handled, no throw | | |

Rokuyo advances by exactly one between the two local days and the moon is
identical worldwide, as expected. Pre-2000 date (1999-12-31) → Shakku (negative modulo OK).

---

## PHASE 3 — FULL FEATURES BREAKDOWN (post-session)

**Shared math — `src/shared/utils/astrology.ts`**
- `getHourlyZodiac` — 12 two-hour animal periods (Rat 23–01 … Pig 21–23)
- `getWesternZodiac` — sun sign of the current date (ambient, not natal)
- `getRokuyo` — six-day cycle, local-calendar-day based (fixed v2)
- `ROKUYO_GUIDANCE`, `getDaysUntilTaian` — new v2
- `getMoonPhase` — 8 phases + illumination %, absolute-instant based
- `toZonedWallClock`, `getAstrologyReading` — new v2, single source of truth
- `summarizeAstroResonance` — new v2, Logs-derived personalization
- `getJapaneseZodiac`, `getMoonEmoji` — still unused

**Dashboard — `System.tsx`**
- Profile-timeZone aware reading, recomputed every 15 min while tab visible
- Line 1: `Sign • Zodiac hour • Rokuyo • Moon (illum%)`
- Line 2 (muted): guidance • Taian countdown • personal resonance
- Present in compact layout and in the cycling Astrology/Psychology/Journey/Biofield block

**Widget synchronization — QIE**
- Tier 0 source `astrology`; dependents `system`, `cosmic`
- One `ambient_reading` signal per local day with `auspicious`,
  `daysUntilTaian`, `resonantMoon`, `resonantRokuyo`, `resonanceSampled`

**Logs synchronization**
- Every log: `astroRokuyo`, `astroMoonPhase`, `astroMoonIllumination`,
  `astroHourlyZodiac`, `astroWesternZodiac`, `astroAuspicious`
- Shown on every entry's hover line and in full in `SYS:` entries
- Read back by the dashboard to build personal resonance (closed loop)

**By design, not implemented:** natal chart / birth data of any kind.

---

## PHASE 4 — DEPLOY

```
src/shared/utils/astrology.ts          MODIFIED  (rokuyo fix, reading, resonance)
src/server/utils/logs.ts               MODIFIED  (shared reading, true-instant moon)
src/shared/types/index.ts              MODIFIED  (astroAuspicious)
src/client/components/System.tsx       MODIFIED  (profile tz, detail line, enriched signal)
src/client/components/Logs.tsx         MODIFIED  (full ASTRO line, hover astro)
src/client/stores/intentionEngine.ts   MODIFIED  (signal metadata)
docs/assembly/2026-11-18_LOT-assembly_astrology-widget-v2.md  ADDED
```

---

## PENDING / FUTURE WORK

- Rokuyo is still a *simplified* fixed 6-day cycle; the traditional rokuyo
  resets on each lunisolar month's first day. A real lunisolar table would
  make it match printed Japanese calendars.
- Author a QIE pattern consuming `resonantMoon`/`resonantRokuyo` + `goals`
  (e.g. nudge to start a goal on a resonant Taian day) — needs a dedicated
  benchmark pass (pattern number, wiki/FM sync).
- Let `cosmic` / `QuantumSignWidget` actually render the shared reading.
- Small unit-test file for `astrology.ts` once a test runner is adopted (none in repo today).

---

*LOT Self-Assembly Engine — automated session*
