# LOT Self-Assembly Session Report
## 2026-11-16 | Astrology Widget v2 — True Lunisolar Rokuyo · Profile-Zone Personalization · Logs Resonance

**Branch:** `claude/practical-curie-i1ffkt`
**Base commit:** `98971f2`
**Previous session:** `docs/assembly/2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)
**Session type:** Automated / Scheduled (recurring routine)
**Live site access:** not attempted — repo inspection + local build/verification only

---

## MISSION BRIEF

Standing instruction: keep evolving the Astrology block (today's zodiac hour,
moon phase, rokuyo — ambient conditions, not a personal natal chart) for user
personalization and sync with other widgets, keep it in sync with Logs
entries, and push a full understanding + features breakdown each session.

---

## PHASE 0 — UNDERSTANDING (state at session start)

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure, isomorphic date math (zodiac hour, Western sign, rokuyo, moon phase) |
| Compute + render | `src/client/components/System.tsx` | `astrology` useMemo (15-min tick, paused off-tab); rendered in compact layout and in the cycling Astrology → Psychology → My Journey → Biofield block |
| Signal bus | `src/client/stores/intentionEngine.ts` | Tier 0 source `astrology`; `system` and `cosmic` depend on it; `recordAstrologySignal()` fires once a day |
| Logs snapshot | `src/server/utils/logs.ts` → `getLogContext()` | Every new log's `context` JSONB carries `astro*` fields computed in the user's saved timeZone |
| Logs render | `src/client/components/Logs.tsx` | `SYS:` block prints `ASTRO: rokuyo · moonPhase` |

### Defects found this session

1. **Rokuyo was wrong on most days.** v0/v1 used a free-running 6-day cycle
   from 2000-01-01. The real rule is `(lunar month + lunar day) % 6`, which
   **resets at every new moon**, so a continuous cycle can't line up with
   printed Japanese calendars. (Also mixed a UTC epoch with local-time dates.)
2. **Moon phase used a mean lunation.** The real lunation length varies by
   about ±7 h around the mean, so phase boundaries could be up to half a day off.
3. **Dashboard and journal could disagree.** Logs used the profile
   `timeZone`, but the dashboard used the device clock (v1 open item).
   `UserProfile` (what `/me` returns) didn't include `timeZone` at all.
4. **Server moon phase used wall-clock time.** `getLogContext` passed the
   rebuilt wall-clock Date into `getMoonPhase`. Moon phase belongs to an
   instant, not to a local clock, so a server whose zone differed from the
   user's skewed it by the zone offset.

---

## PHASE 1 — BUILD

### 1. Lunisolar engine (`src/shared/utils/astrology.ts`)

New exports:

- `getNewMoonMs(k)`: true new moon for lunation `k`, using Meeus ch. 49 (25 periodic terms), corrected from TT to UTC with ΔT ≈ 69 s.
- `getSunLongitude(ms)`: apparent solar longitude (Meeus ch. 25).
- `getLunarDate(date)`: 旧暦 `{ month, day, leap }`, reckoned in JST per the 天保暦 rules. The month is set by the principal solar term (中気) inside the lunation (雨水 → 1, 春分 → 2, … 冬至 → 11). A lunation with no principal term is a leap month (閏月).
- `getRokuyo(date)`: now `ROKUYO_BY_LUNAR[(month + day) % 6]`, with the order Taian, Shakku, Sensho, Tomobiki, Senpu, Butsumetsu.
- `getRokuyoMeaning(rokuyo)`: a one-line plain-language gloss.
- `getWallClockDate(timeZone, now)`: converts the clock to an IANA zone with `Intl` (no dayjs-tz needed on the client). Falls back to `now` if the zone is missing or invalid.
- `getMoonPhase(date)`: age now runs from the actual previous new moon and is scaled by the actual lunation length. The signature is unchanged.

### 2. Personalization: profile timeZone on the dashboard

- `useProfileView()` (`src/server/models/user.ts`) now includes `timeZone`. `UserProfile` gains `timeZone?: string | null`.
- `System.tsx` computes zodiac hour, Western sign, rokuyo and lunar date from `getWallClockDate(me.timeZone)`. Moon phase uses the real instant. The memo now also depends on `me?.timeZone`. **The dashboard and the Logs snapshot now use the same zone.**

### 3. Logs sync: personal resonance (`getAstroResonance(logs)`)

Personalization without a natal chart. Every log already carries the ambient
reading it was written under. `getAstroResonance` counts those snapshots and
returns, for the user's own entries:
- the most common moon phase, rokuyo and zodiac hour
- each one's share
- the sample size

Once at least `ASTRO_RESONANCE_MIN_SAMPLE` (7) tagged logs exist, the
Astrology block shows a second detail line:

```
Lunar 10/8 • Most auspicious; begin things
Resonance: you write most under Waxing Gibbous (34% of 41) • Dog hour
```

It reads **"In resonance"** when today's moon phase matches the user's
dominant phase. Rendering lives in a small `AstrologyDetail` component at
the end of `System.tsx`, shared by both render sites.

### 4. Logs snapshot (server) + journal render

- `getLogContext` now also stores `astroLunarMonth`, `astroLunarDay`, and `astroEngine: 'lunisolar-v2'`. The engine tag lets future analysis tell v2 rokuyo apart from the old approximation. Older entries have no tag. Moon phase now uses the real instant (fixes defect 4).
- `Logs.tsx` `SYS:` line: `ASTRO: Taian · Waxing Crescent 48% · Horse hr · L10/8`. Each added part shows only if that field is present, so old entries still render.

### 5. QIE widget sync

`recordAstrologySignal(..., extra)` takes a new optional argument (it
defaults to empty, so existing callers still compile). The daily
`ambient_reading` signal now carries:

- `lunarMonth` and `lunarDay`
- `resonantMoonPhase`, `inLunarResonance` and `resonanceSample`
- a new `inauspicious` flag (Butsumetsu), alongside the existing `auspicious` (Taian)

`cosmic` and `system`, the dependents of the Tier 0 `astrology` source, can
now key off the user's personal resonance as well as the ambient reading.
The daily `localStorage` guard is now wrapped in try/catch, so blocked
storage no longer throws.

---

## PHASE 2 — VERIFY

```
npm run build          -> PASS (client esbuild + server tsc)
tsc --noEmit (full)    -> no new errors in touched lines (pre-existing repo-wide errors unchanged)
```

Lunisolar engine checked against known 旧暦 dates. All pass:

| Civil date | Expected | Got | Rokuyo |
|---|---|---|---|
| 2023-01-22 | 1/1 (旧正月) | 1/1 | Sensho ✓ (旧正月 is always 先勝) |
| 2024-02-10 | 1/1 | 1/1 | Sensho ✓ |
| 2025-01-29 | 1/1 | 1/1 | Sensho ✓ |
| 2026-02-17 | 1/1 | 1/1 | Sensho ✓ |
| 2024-01-01 | 11/20 | 11/20 | Shakku ✓ |
| 2020-05-23 | 閏4/1 | 閏4/1 | Butsumetsu |
| 2023-03-22 | 閏2/1 | 閏2/1 | Tomobiki |
| 2025-07-25 | 閏6/1 | 閏6/1 | Shakku |

- **Leap-month sweep, 2020–2030:** finds exactly 2020 閏4, 2023 閏2, 2025 閏6 and 2028 閏5.
- **10-year range sweep:** 0 out-of-range lunar dates.
- **Today (2026-11-16):** lunar 10/8, Taian, Waxing Crescent at 48%.
- **`getAstroResonance` fixture:** handles null or missing `context` and computes shares correctly.

---

## PHASE 3 — FEATURES BREAKDOWN (post-session)

| Feature | Status |
|---|---|
| Zodiac hour (12 × 2 h, 子 starts 23:00) | ✅ profile-zone aware |
| Western sun sign of the day | ✅ profile-zone aware |
| Rokuyo | ✅ **true lunisolar** (v2), with a plain gloss |
| 旧暦 lunar date, including leap months | ✅ new |
| Moon phase + illumination | ✅ true-lunation based |
| Freshness | ✅ 15-min tick, paused off-tab, re-derives when the profile zone changes |
| Personal resonance from Logs | ✅ new (≥7 tagged logs) |
| Logs snapshot | ✅ rokuyo, phase, illumination %, hour, sign, lunar M/D, engine tag |
| Journal render | ✅ extended `ASTRO:` line |
| QIE signal | ✅ daily, with lunar date, resonance and auspicious/inauspicious flags |
| Natal chart | ❌ out of scope by design (ambient only) |

---

## PHASE 4 — DEPLOY

```
src/shared/utils/astrology.ts          MODIFIED  lunisolar engine, wall-clock, resonance
src/client/components/System.tsx       MODIFIED  profile-zone compute, resonance, AstrologyDetail
src/client/components/Logs.tsx         MODIFIED  extended ASTRO: line
src/client/stores/intentionEngine.ts   MODIFIED  recordAstrologySignal extra metadata
src/server/utils/logs.ts               MODIFIED  lunar date + engine tag, instant-based moon phase
src/server/models/user.ts              MODIFIED  profile view exposes timeZone
src/shared/types/index.ts              MODIFIED  UserProfile.timeZone, LogContext lunar fields
docs/assembly/2026-11-16_LOT-assembly_astrology-widget-v2-lunisolar-resonance.md  ADDED
```

---

## PENDING / FUTURE WORK

- **Legacy entries:** rokuyo in pre-v2 logs (no `astroEngine` tag) came from
  the old approximation. The resonance's `topRokuyo` will become accurate as
  new entries build up. Option: recompute it on the fly from each log's
  `context.date` and `timeZone`, or have the resonance count only
  `astroEngine === 'lunisolar-v2'` rows for rokuyo.
- **QIE pattern:** still deferred. Candidates: a pattern that combines
  `inLunarResonance` or `auspicious` with `goals`/`intentions`, such as a
  nudge to start things on Taian days that fall in the user's resonant phase.
  It needs a dedicated benchmark pass (pattern number, wiki, Field Manual).
- **Mood × moon:** correlate mood-log valence with `astroMoonPhase`, so the
  resonance says *how* the user feels under each phase, not just how often
  they write.
- **Time-of-day hints:** surface rokuyo hours (for example Shakku clear only
  11:00–13:00, Sensho AM, Senpu PM) as a live "now favorable / now wait"
  marker that uses the zodiac hour already computed.
- `getJapaneseZodiac` and `getMoonEmoji` are still unused.

---

*LOT Self-Assembly Engine — automated session*
