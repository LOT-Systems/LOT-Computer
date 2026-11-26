# LOT Self-Assembly Session Report
## 2026-11-26 | Astrology Widget — v2: Shared Reading · TimeZone Personalization · Logs-Derived Rhythm

**Branch:** `claude/practical-curie-aoqafg`
**Base commit:** `9f2b88c`
**Previous astrology session:** `docs/assembly/2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)
**Session type:** Automated / Scheduled (recurring routine)
**Build:** `npm run build` → PASS (server tsc + client esbuild)

---

## MISSION BRIEF

Standing instruction: evolve the Astrology block (zodiac hour, moon phase,
rokuyo — ambient conditions, not a natal chart) for user personalization and
synchronization with other widgets; keep it synchronized with Logs entries;
push a full understanding + features breakdown each session.

---

## PHASE 0 — UNDERSTANDING (state at session start, after v1)

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure isomorphic readers: hourly zodiac, Western sign, rokuyo, moon phase |
| Dashboard | `src/client/components/System.tsx` | Two render sites (compact block + cycling Astrology → Psychology → Journey → Biofield block); 15-min off-tab-safe recompute tick |
| QIE bus | `src/client/stores/intentionEngine.ts` | `astrology` Tier-0 source; `recordAstrologySignal` once/day; consumed by `system`, `cosmic` |
| Logs write | `src/server/utils/logs.ts` `getLogContext` | Stamps `astro*` fields onto every Log `context` (user timeZone) |
| Logs read | `src/client/components/Logs.tsx` | `SYS:` block prints `ASTRO: rokuyo · moonPhase` |

Problems found this session:

1. **Rokuyo day-boundary bug.** `getRokuyo` subtracted a *UTC-midnight*
   anchor (`new Date('2000-01-01')`) from a *local* timestamp and floored. For
   users west of UTC the cycle advanced in the evening (e.g. 16:00 PST = next
   day's rokuyo); east of UTC it lagged after midnight. The block and Logs
   could show a different rokuyo than the calendar day.
2. **Two divergent computations.** Client used device time; server rebuilt a
   wall-clock Date by hand. Same reading computed two ways → drift risk.
3. **Moon phase skewed by timeZone on the server.** The server fed the
   *wall-clock* Date into `getMoonPhase`, which is an absolute astronomical
   quantity — off by the user's UTC offset (up to ~half a day).
4. **Dashboard ignored `me.timeZone`** (v1 pending item).
5. **Logs sync was one-way.** Logs recorded astrology, but the widget never
   read anything back from Logs — no personalization from the user's history.

---

## PHASE 1 — BUILD

### 1. Shared single source of truth — `getAmbientReading(timeZone)`
`astrology.ts` now exports:
- `getWallClockDate(timeZone, now)` — Intl-based (no dayjs tz plugin needed on
  the client), falls back to `now` on empty/invalid zone.
- `getAmbientReading(timeZone, now)` → `{ hourlyZodiac, westernZodiac,
  rokuyo, moonPhase, moonIllumination, auspicious }`. Hour/day readings use
  the zone's wall clock; moon phase uses the real instant.
- Server `getLogContext` and client `System.tsx` both call it. The hand-rolled
  `toWallClockDate` helper in `logs.ts` was removed.

### 2. Rokuyo fix
Calendar-day diff via `Date.UTC(y, m, d)` on both sides + safe modulo.
Verified: 7 consecutive days step through the 6-cycle cleanly at 23:59 local;
2000-01-01 at 00:01 and 23:59 both return Sensho.

> Note: this is still the simplified Gregorian 6-day cycle. True rokuyo is
> keyed to the lunisolar (kyūreki) calendar and resets on lunar-month starts,
> so it can differ from printed Japanese calendars. Unchanged by design;
> listed as future work.

### 3. TimeZone personalization on the dashboard
`System.tsx` reads `me.timeZone` and passes it to `getAmbientReading`. A user
travelling with a device in another zone now sees the same reading their Logs
record. Memo deps: `[astrologyTick, astrologyTimeZone]`.

### 4. Logs → Widget: personal rhythm (two-way Logs sync)
New `summarizeAstroRhythm(logs, current)` reads the `astro*` snapshot already
stamped on the user's own Log entries and returns the dominant moon phase,
rokuyo and zodiac hour under which **this user** writes, plus `inRhythm`
(today's phase == their dominant phase).
- Only user-authored events count: `answer`, `note`, `emotional_checkin`,
  `intention`, `goal_set`, `goal_complete`, `plan_set`, `self_care_complete`.
- Threshold `ASTRO_RHYTHM_MIN_SAMPLES = 8` — no claimed pattern from noise.
- Rendered under the reading in both render sites, dimmed:
  `Your rhythm: Waxing Gibbous • Taian • Dog hour`, or `In rhythm: …` when
  today matches. Hidden below threshold — existing users with older
  (pre-July) logs simply see nothing until enough stamped entries accrue.

Personalization without birth data — fully within the "ambient, not natal"
constraint.

### 5. Widget synchronization — richer QIE signal
`recordAstrologySignal(..., rhythm?)` now adds `dominantMoonPhase`,
`inRhythm`, `rhythmSamples` to the daily `ambient_reading` metadata, so
`cosmic` / `system` / future patterns can key on "user is in their writing
rhythm today" alongside the existing `auspicious` (Taian) flag.
`localStorage` access in the once-per-day guard is now wrapped in try/catch.

### 6. Logs display + context
- `LogContext` gains `astroAuspicious`.
- `Logs.tsx` `ASTRO:` line now shows illumination and hour:
  `ASTRO: Taian · Waning Gibbous (98%) · Horse hour`.

---

## PHASE 2 — TEST

Sample run (`TZ=America/Los_Angeles`, instant `2026-11-26T03:30Z`):

```
NY     → Pig hour · Sagittarius · Butsumetsu · Waning Gibbous 98% · auspicious=false
Tokyo  → Horse hour · Sagittarius · Taian     · Waning Gibbous 98% · auspicious=true
invalid zone → falls back to now (true)
rokuyo 7-day sequence: Taian,Shakku,Sensho,Tomobiki,Senpu,Butsumetsu,Taian
rhythm (9 authored, 1 system ignored) → Waxing Gibbous 67% · Taian · Dog · inRhythm=true
rhythm (5 samples) → all null (below threshold)
```

```
npm install --legacy-peer-deps   (container had no node_modules; pre-existing peer conflict)
npm run build                    -> PASS
```

---

## PHASE 3 — FULL FEATURES BREAKDOWN (post-session)

| Feature | Status | Where |
|---|---|---|
| Hourly Japanese zodiac (2-h periods) | Live, user timeZone | `getHourlyZodiac` |
| Western sun sign of the day | Live, user timeZone | `getWesternZodiac` |
| Rokuyo six-day cycle | Live, **day-boundary fixed** | `getRokuyo` |
| Moon phase + illumination % | Live, absolute instant | `getMoonPhase` |
| Auspicious flag (Taian) | Live | `AmbientReading.auspicious` |
| Single shared reading | **New** | `getAmbientReading` |
| TimeZone-aware dashboard | **New** | `System.tsx` (`me.timeZone`) |
| 15-min recompute, paused off-tab | Live (v1) | `System.tsx` |
| Personal rhythm from Logs | **New** | `summarizeAstroRhythm` → both render sites |
| QIE daily `ambient_reading` signal | Live, **+rhythm metadata** | `recordAstrologySignal` |
| Dependency graph (`astrology` → `system`, `cosmic`) | Live (v1) | `WIDGET_DEPENDENCY_MAP` |
| Per-entry Log snapshot (`astro*`) | Live, **+astroAuspicious** | `getLogContext` |
| Journal `ASTRO:` line | Live, **+illumination, +hour** | `Logs.tsx` |
| Natal chart / birth data | Not implemented by design | — |

Data flow:

```
            getAmbientReading(user.timeZone)
             │                          │
   server: getLogContext          client: System.tsx
             │                          │
   Log.context.astro*  ──────►  summarizeAstroRhythm(logs)
             │                          │
   Logs.tsx ASTRO: line         Astrology block + "Your rhythm"
                                        │
                                recordAstrologySignal (QIE, 1/day)
                                        │
                                cosmic · system widgets
```

---

## PHASE 4 — DEPLOY

```
Files changed:
  src/shared/utils/astrology.ts          MODIFIED  (rokuyo fix, getWallClockDate, getAmbientReading, summarizeAstroRhythm)
  src/server/utils/logs.ts               MODIFIED  (uses shared reading, +astroAuspicious)
  src/shared/types/index.ts              MODIFIED  (+astroAuspicious)
  src/client/components/System.tsx       MODIFIED  (timeZone, rhythm line, rhythm → QIE)
  src/client/stores/intentionEngine.ts   MODIFIED  (rhythm metadata on signal)
  src/client/components/Logs.tsx         MODIFIED  (richer ASTRO: line)
  docs/assembly/2026-11-26_LOT-assembly_astrology-widget-v2.md  ADDED
```

---

## PENDING / FUTURE WORK

- The daily QIE signal can fire before `useLogs` resolves, recording
  `rhythmSamples: 0` for that day. Gate on logs being loaded next session.
- Lunisolar-accurate rokuyo (kyūreki month resets).
- A dedicated QIE pattern combining `auspicious` / `inRhythm` with
  `goals`/`intentions` (e.g. a gentle prompt on in-rhythm days). Still deferred
  to a full self-assembly pass (pattern number, wiki, Field Manual sync).
- Optionally surface `moonPhaseShare` (e.g. "67% of your entries") behind a
  click on the rhythm line.
- `getJapaneseZodiac`, `getMoonEmoji` remain unused.

---

*LOT Self-Assembly Engine — automated session*
