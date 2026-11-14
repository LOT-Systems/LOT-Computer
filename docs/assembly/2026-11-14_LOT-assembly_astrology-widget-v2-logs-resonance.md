# LOT Self-Assembly Session Report
## 2026-11-14 | Astrology Widget — v2 · Shared Reading · Rokuyo Guidance · Logs Resonance

**Branch:** `claude/practical-curie-gzqkdy`
**Base commit:** `98971f2`
**Previous astrology session:** `docs/assembly/2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)
**Session type:** Automated / Scheduled (recurring routine)
**Build:** `npm run build` → PASS (server tsc + client esbuild, exit 0)

---

## MISSION BRIEF

Standing recurring instruction: keep evolving the Astrology block (today's
zodiac hour, moon phase, rokuyo — **ambient conditions, not a personal natal
chart**) for user personalization and synchronization with other widgets,
keep it synchronized with Logs entries, and push a full understanding +
features breakdown `.md` each session.

---

## 1 · UNDERSTANDING — how the Astrology block works (full map, post-session)

The block is not a standalone component. It lives inline in the master
dashboard and is fed by one shared, isomorphic utility.

```
                 src/shared/utils/astrology.ts
                 getAstrologyReading(now, timeZone?)   ← single source of truth
                    │                         │
     client (device-local clock)        server (user.timeZone)
                    │                         │
   System.tsx  ─────┤                 logs.ts getLogContext(user)
   · Astrology block (2 render sites)        │  snapshots astro* onto every
   · 15-min off-tab-safe recompute           │  Log.context (JSONB) at creation
   · Logs resonance (reads useLogs)  ◄───────┤
   · once/day QIE signal                     │
                    │                  Logs.tsx
   intentionEngine.ts (QIE)            · every entry's hover context line
   · source 'astrology' (Tier 0)       · SYS: snapshot ASTRO: line
   · consumed by 'system', 'cosmic'
```

| Piece | Location | Role |
|---|---|---|
| Math + reading | `src/shared/utils/astrology.ts` | `getHourlyZodiac`, `getWesternZodiac`, `getRokuyo`, `getMoonPhase`, `getJapaneseZodiac`, `getMoonEmoji`, **new:** `getRokuyoGuidance`, `toZonedWallClock`, `getAstrologyReading`, `formatAstroTag`, `getAstroResonance` |
| Dashboard | `src/client/components/System.tsx` | Compact layout `Block "Astrology:"` + "pro" cycling block (Astrology → Psychology → My Journey → Biofield) |
| Signal bus | `src/client/stores/intentionEngine.ts` | `recordAstrologySignal(...)` → `'astrology'` / `'ambient_reading'` |
| Logs write | `src/server/utils/logs.ts` | `getLogContext(user)` — called by every log-creation path in `api.ts` |
| Logs type | `src/shared/types/index.ts` `LogContext` | `astroRokuyo`, `astroMoonPhase`, `astroMoonIllumination`, `astroHourlyZodiac`, `astroWesternZodiac`, **new:** `astroFavorable` |
| Logs read | `src/client/components/Logs.tsx` | Entry hover context line + `SYS:` block |

Personalization data available: no birth data exists anywhere (by design).
Personalization is built from **time zone**, **local hour**, and the user's
**own Logs history** — which is what this session adds.

---

## 2 · FINDINGS (bugs found while reading)

1. **Rokuyo flipped at UTC midnight, not local midnight.**
   `getRokuyo` did `date.getTime() - new Date('2000-01-01')`; the anchor is UTC
   midnight and `getTime()` is absolute, so for a user in Los Angeles the
   "day" changed at 4 PM local (and at 9 AM for Tokyo). The dashboard was
   showing tomorrow's rokuyo for part of every afternoon/evening west of UTC.
2. **Pre-2000 dates returned `undefined`** (negative JS `%`). Same latent bug
   in `getJapaneseZodiac` for years before 1900.
3. **Logs moon phase skewed by the UTC offset.** v1's server path fed a
   *wall-clock-shifted* Date into `getMoonPhase`, which needs an absolute
   instant — every logged moon phase / illumination was off by up to ±14h
   (enough to mislabel the phase near a boundary).
4. **Server rokuyo depended on server-process TZ** because of #1 + the
   wall-clock trick.
5. Client and server computed the reading with two separate code paths, so
   they could disagree.

---

## 3 · BUILD — what changed this session

### 3.1 Correctness (astrology.ts)
- `getRokuyo` now counts whole **calendar** days from the date's own
  Y/M/D (`Date.UTC(y, m, d) - Date.UTC(2000, 0, 1)`), with safe modulo.
- `getJapaneseZodiac` safe modulo.
- Verified: anchor day, 23:59 vs 00:01 boundary, 1999-12-31 → Shakku,
  1899 → Pig.

### 3.2 One shared reading — `getAstrologyReading(now, timeZone?)`
- Clock/calendar parts (zodiac hour, rokuyo, western sign, year animal) use
  the zone's wall clock via new `toZonedWallClock` (pure `Intl`, no dayjs-tz
  plugin → works on client and server; unknown zone falls back safely).
- Moon phase uses the absolute instant — verified identical for Tokyo and
  LA at the same moment, while rokuyo correctly differs across the date line.
- Returns `{ hourlyZodiac, westernZodiac, rokuyo, rokuyoMeaning, rokuyoHint,
  favorableNow, moonPhase, moonIllumination, moonEmoji, yearAnimal }`.
- Used by **both** `System.tsx` and `logs.ts` (old wall-clock helper removed).

### 3.3 Personalization — time-aware rokuyo guidance
`getRokuyoGuidance(rokuyo, hour)` resolves each day's traditional meaning
against the current local hour:

| Rokuyo | Meaning | Favored window | Hint (example) |
|---|---|---|---|
| Sensho 先勝 | Early wins | before noon | "Morning is favored — act early" / "Morning has passed — keep it light" |
| Tomobiki 友引 | Shared luck | all day except 11–13 | "Good for gatherings and shared plans" |
| Senpu 先負 | Patience first | afternoon | "Hold steady — afternoon is favored" / "Afternoon is favored — move now" |
| Butsumetsu 仏滅 | Quiet day | none | "Rest, close loops, avoid new starts" |
| Taian 大安 | Great peace | all day | "Auspicious all day — good for beginnings" |
| Shakku 赤口 | Take care | 11–13 only | "Midday window is clear" |

Rendered as a dimmed second line under the reading in **both** dashboard
render sites. Because the block re-ticks every 15 min (off-tab paused), the
hint changes on its own at noon.

### 3.4 Logs synchronization — read side
- **Every journal entry** (notes and all `LogContainer` events) now shows the
  ambient tag in its hover context line:
  `12°C, 60% – Tokyo · Taian · Full Moon`. In v1 only `SYS:` snapshots
  showed astrology.
- `SYS:` block `ASTRO:` line now includes illumination and zodiac hour:
  `ASTRO: Taian · Full Moon (98%) · Horse hour`.
- New `LogContext.astroFavorable` stored on every new entry (was the moment
  inside the rokuyo's favored window?) — no migration, `context` is JSONB.

### 3.5 Personalization from Logs — "resonance"
`getAstroResonance(contexts, minSample = 5)` counts which rokuyo and moon
phase the user's own written notes (`event === 'note'`, non-empty) most often
fall on. Only entries carrying the astro snapshot (2026-07-27+) count; below
5 tagged entries nothing is shown. Dashboard copy, chosen against today:

- today matches both → "Your writing day and moon — N entries"
- today's rokuyo matches → "Taian is your most-written day"
- today's moon matches → "You write most under the Full Moon"
- otherwise → "You write most on Sensho · Waxing Gibbous"

### 3.6 Widget synchronization — QIE signal enriched
`recordAstrologySignal(..., { favorableNow, resonantDay })` now adds:
- `favorableNow` — time-aware window flag (finer than v1's Taian-only
  `auspicious`, which is kept for compatibility).
- `resonantDay` — today's rokuyo equals the user's Logs-derived top rokuyo.

The once-a-day record now waits for `useLogs().isFetched`, so the daily
signal carries a real resonance flag instead of firing on the empty first
render.

---

## 4 · TEST

```
scratch verification (tsx, not committed)         15/15 ok
  rokuyo anchor / local-midnight boundary / pre-2000 wrap
  year animal pre-1900
  toZonedWallClock Tokyo, Los Angeles, bogus zone fallback
  moon phase timezone-independent; rokuyo differs across date line
  resonance min-sample + top counts; Sensho time-aware
npm run build (server tsc + client esbuild)       PASS, exit 0
```
Sample live reading (2026-11-14, America/New_York, evening):
`Scorpio • Dog • Butsumetsu • Waxing Crescent (18%)` — "Rest, close loops,
avoid new starts".

Not run: browser/visual check of the dashboard. The repo has no unit test
runner configured for shared utils, so the scratch checks were not added as
committed tests.

---

## 5 · FEATURES BREAKDOWN (current state, v2)

- **Ambient inputs:** Western sign, zodiac hour (12 × 2h), rokuyo (six-day
  cycle, simplified Gregorian; not lunisolar-exact), moon phase +
  illumination %, year animal (computed, not displayed yet).
- **Correct day boundary:** rokuyo changes at the viewer's local midnight
  (dashboard) or the user's saved timeZone midnight (Logs).
- **Time-aware guidance:** per-rokuyo meaning + hint + `favorableNow` window.
- **Freshness:** 15-minute recompute while the tab is visible.
- **Logs → every entry:** astro snapshot stored on every log; shown on every
  entry's hover line and in `SYS:` blocks.
- **Logs → personalization:** resonance line from the user's own writing
  history (≥5 tagged notes).
- **Widgets:** QIE Tier 0 source `astrology` → `system`, `cosmic`; daily
  `ambient_reading` signal with `auspicious`, `favorableNow`, `resonantDay`.
- **Still out of scope by design:** natal chart / birth data.

---

## 6 · FILES

```
src/shared/utils/astrology.ts          MODIFIED  (fixes + 5 new exports)
src/server/utils/logs.ts               MODIFIED  (shared reading, absolute-time moon)
src/shared/types/index.ts              MODIFIED  (LogContext.astroFavorable)
src/client/components/System.tsx       MODIFIED  (shared reading, hint line, resonance, signal gating)
src/client/components/Logs.tsx         MODIFIED  (astro tag on every entry, richer SYS line)
src/client/stores/intentionEngine.ts   MODIFIED  (favorableNow, resonantDay)
docs/assembly/2026-11-14_LOT-assembly_astrology-widget-v2-logs-resonance.md  ADDED
```

---

## 7 · PENDING / NEXT SESSION

- **Historic logs written before this session** carry a moon phase skewed by
  the old UTC-offset bug and a rokuyo computed with the UTC boundary. They
  are left as-is; a backfill could recompute from `createdAt` + `timeZone`.
- **Dashboard zone:** the client `UserProfile` has no `timeZone`, so the
  dashboard uses the device clock while Logs use the saved zone. Exposing
  `timeZone` on `/api/me` would let `getAstrologyReading(now, me.timeZone)`
  align them exactly — the helper already accepts it.
- **QIE pattern:** author a composite pattern that reacts to
  `astrology.favorableNow` / `resonantDay` together with `goals`/`intentions`
  (e.g. gentle "good window to begin" nudge on Taian or resonant days).
  This needs a full self-assembly pass (pattern number, wiki/Field Manual sync).
- **Resonance depth:** compare written-entry *length/mood* per moon phase,
  not just counts, once enough tagged history accumulates.
- `yearAnimal` and `moonEmoji` are computed on the reading but not rendered;
  candidates for a terminal-style glyph or tooltip.

---

*LOT Self-Assembly Engine — automated session*
