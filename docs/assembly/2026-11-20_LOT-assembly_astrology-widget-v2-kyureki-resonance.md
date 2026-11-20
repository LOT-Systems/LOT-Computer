# LOT Self-Assembly Session Report
## 2026-11-20 | Astrology Widget — Kyureki Rokuyo · TimeZone Personalization · Logs Resonance | v2

**Branch:** `claude/practical-curie-ypouc4`
**Base commit:** `9f2b88c`
**Previous session:** `docs/assembly/2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1, merged in #92)
**Session type:** Automated / Scheduled (recurring routine)
**Live site access:** not attempted. All work comes from inspecting the repo.

---

## MISSION BRIEF

Standing instruction: keep evolving the Astrology block (today's zodiac hour, moon phase and rokuyo, as ambient conditions, not a personal natal chart). The goals are user personalization, synchronization with other widgets and synchronization with Logs entries. Each session pushes a full understanding and features breakdown as an .md file.

---

## PHASE 0 — UNDERSTANDING (state at session start)

| Piece | Location | State found |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | `getRokuyo` used a **free-running 6-day cycle** from 2000-01-01 |
| Dashboard | `src/client/components/System.tsx` | Read the device-local clock; ignored the user's saved `timeZone` |
| QIE signal | `src/client/stores/intentionEngine.ts` `recordAstrologySignal` | One `ambient_reading` per local day, with five positional args |
| Logs | `src/server/utils/logs.ts` `getLogContext` | Snapshot taken in the user's timeZone, but the moon phase was computed from a *wall-clock-shifted* Date, so it was off by the UTC offset |
| Journal render | `src/client/components/Logs.tsx` `SYS:` block | `ASTRO: {rokuyo} · {moonPhase}` |

### Critical finding: rokuyo was wrong on most days

Real rokuyo is not a continuous 6-day cycle. It is defined on the **Kyureki (旧暦) lunisolar date**:

```
rokuyo = ROKUYO[(lunarMonth + lunarDay) % 6]   // 0 Taian, 1 Shakku, 2 Sensho, 3 Tomobiki, 4 Senpu, 5 Butsumetsu
```

The cycle restarts on the 1st of every lunar month, so a fixed 6-day rotation drifts off immediately. Measured over all of 2026, the old function matched the true rokuyo on **58 of 365 days (16%)**, about what a random guess would score. Its own anchor was also wrong: it called 2000-01-01 Sensho, but that day is lunar 11/25, which is **Taian**. The `auspicious` (Taian) flag sent to the QIE, and every Logs `astroRokuyo` snapshot since 2026-07-27, were therefore unreliable.

---

## PHASE 1 — BUILD

### 1. Accurate Kyureki lunisolar engine (`astrology.ts`)

This is pure date-math, with no API and no dependency.

- **New moons:** Meeus *Astronomical Algorithms* ch. 49, including all 25 periodic terms and 14 planetary terms. Accurate to about a minute. ΔT is set to 69.2 s.
- **Solar longitude:** Meeus ch. 25, the apparent longitude, accurate to about 0.01°.
- **Month boundaries:** the new moon's **JST (UTC+9) calendar date**, which is the canonical Japanese definition.
- **Month numbering:** taken from the principal solar term (chūki) inside the lunation. 330° gives month 1, 0° month 2, and so on to 270° (winter solstice), which gives month 11. A lunation with no chūki is a **leap month** and repeats the previous number.
- **Caching:** results are cached per day number. A full year computes in about 13 ms.

New exports:

| Export | Purpose |
|---|---|
| `getLunarDate(date)` | `{ month, day, isLeapMonth }` for the wall-clock calendar day |
| `getRokuyo(date)` | Now Kyureki-correct (same signature, so every call site is fixed) |
| `getRokuyoGuidance(rokuyo)` | Kanji, favorable window, short label and meaning |
| `isRokuyoFavoredHour(rokuyo, hour)` | Traditional favorable-hour test |
| `toZonedWallClock(instant, tz)` | Isomorphic `Intl`-based wall clock for an IANA zone (no dayjs plugin needed on the client); falls back safely on an invalid zone |
| `getAmbientAstrology(instant, tz)` | **Single source of truth** for the full reading, used by the dashboard, the QIE and Logs |
| `getRokuyoResonance(logs)` | Personal pattern computed from the user's own Logs |

Rokuyo favorable windows (traditional):

| Rokuyo | Kanji | Window | Label |
|---|---|---|---|
| Taian | 大安 | all day | `all day` |
| Shakku | 赤口 | 11:00–13:00 | `noon only` |
| Sensho | 先勝 | before noon | `AM favored` |
| Tomobiki | 友引 | all except 11–13 | `AM/PM, not noon` |
| Senpu | 先負 | after noon | `PM favored` |
| Butsumetsu | 仏滅 | none | `rest day` |

### 2. Personalization: the user's own timeZone on the dashboard

- `User.useProfileView()` now includes `timeZone`, and `UserProfile.timeZone?` was added. This is the user's own field and is already derived from their city/country.
- `System.tsx` computes `getAmbientAstrology(new Date(), me?.timeZone)`. The dashboard now shows the **same reading as the Logs snapshot** for that user, even when they view it from a device set to a different zone. Without a saved zone it falls back to device-local time.

### 3. Personalization: rokuyo resonance from Logs

`getRokuyoResonance(logs)` counts which rokuyo days the user actually writes on.

- A log's saved rokuyo is trusted only if the log also carries `astroLunarMonth` (a snapshot from the new algorithm). Older entries, and those with the legacy snapshot, are **recomputed from `createdAt` and the log's own `context.timeZone`**, so the wrong pre-session snapshots cannot skew the result.
- A result needs at least 12 logs and a real lean: the top day must exceed the uniform 1/6 share by 25%. Otherwise the function returns `null` and nothing renders.

### 4. Display (System dashboard)

Compact layout, one line:

```
Scorpio • Snake • Senpu (PM favored) • Waxing Gibbous (78%)
```

Pro layout (the Astrology view of the block that cycles Astrology → Psychology → Journey → Biofield) adds a muted second line:

```
Lunar 10/12 • Not favored now • Your day: Taian
```

When today matches the user's peak day, the last part reads `Your day`. Leap months render as `Lunar leap 6/1`.

### 5. Widget synchronization (QIE)

`recordAstrologySignal` now takes a reading object. Its `ambient_reading` metadata gains:

- `rokuyoWindow`
- `lunarMonth`, `lunarDay`, `lunarLeapMonth`
- `personalPeak`: the user's resonant rokuyo, or null
- `resonantDay`: true when today is the user's peak rokuyo, a new hook for future patterns

The `auspicious` flag is now actually correct. The once-per-day guard is keyed on the reading's own `dateKey` (in the user's timeZone, not the device's). The `localStorage` access is wrapped in try/catch.

### 6. Logs synchronization

`getLogContext` now calls `getAmbientAstrology(new Date(), user.timeZone)`, the same function the dashboard uses. This also fixes the moon phase, which is now computed from the real instant.

New `LogContext` fields (JSONB, so no migration is needed): `astroLunarMonth`, `astroLunarDay`, `astroLunarLeap` and `astroFavoredNow`.

The journal `SYS:` block now renders:

```
ASTRO: Senpu · Snake hour · Waxing Gibbous 78% · lunar 10/12
```

Optional parts only render when present, so older entries still display cleanly.

---

## PHASE 2 — TEST

```
npm run test:astrology   -> ALL PASS (20 checks, new script scripts/tests/test-astrology.ts)
npm run server:build     -> PASS
npm run client:build     -> PASS (only the old duplicate-key warning in badges.ts)
tsc --noEmit (full)      -> no new errors in touched code; the remaining errors (e.g. Logs.tsx:99, System.tsx:629) were already there
```

Ground truth for the regression test is the published Kyureki new-year and leap-month dates:

| Date | Lunar | Rokuyo |
|---|---|---|
| 2000-01-01 | 11/25 | Taian |
| 2020-05-23 | leap 4/1 | Butsumetsu |
| 2023-01-22 | 1/1 | Sensho |
| 2023-03-22 | leap 2/1 | Tomobiki |
| 2024-01-01 | 11/20 | Shakku |
| 2024-02-10 | 1/1 | Sensho |
| 2025-01-29 | 1/1 | Sensho |
| 2025-07-25 | leap 6/1 | Shakku |
| 2026-02-17 | 1/1 | Sensho |

The test also covers favorable-hour rules, timeZone date splitting (Tokyo vs Los Angeles for one instant), invalid-zone fallback, the resonance peak, ignoring legacy snapshots, and the minimum sample size.

---

## PHASE 3 — FULL FEATURES BREAKDOWN (post-session)

**Inputs (all ambient, no birth data)**
- Western sun sign of the day
- Japanese zodiac hour (12 two-hour animals)
- Rokuyo, **Kyureki-correct**, with kanji, meaning and a favorable window
- Lunar date (month/day, leap flag)
- Moon phase and illumination %, computed from the real instant

**Personalization**
- The reading follows the user's saved `timeZone` on both the dashboard and Logs, falling back to device-local time.
- `Favored now`: the current hour is checked against the day's rokuyo window.
- Personal resonance ("Your day"): the rokuyo the user writes on most, learned from their own Logs.

**Freshness**
- Recomputes every 15 minutes while the tab is visible (since v1) and also whenever the user's timeZone changes.

**Widget synchronization**
- QIE Tier 0 source `astrology`, a dependency of `system` and `cosmic`.
- One `ambient_reading` signal per user-local day, carrying `auspicious`, `rokuyoWindow`, the lunar date, `personalPeak` and `resonantDay`.

**Logs synchronization**
- Every new log snapshots: rokuyo, hour animal, moon phase and %, Western sign, lunar date and leap flag, and favored-now.
- The journal `SYS:` block renders all of these.
- The same function produces both the Logs snapshot and the dashboard, so they cannot disagree.

**Deliberately not implemented**
- Natal-chart data (birth date, time or place). The feature stays ambient-only.

---

## PHASE 4 — DEPLOY

```
Branch: claude/practical-curie-ypouc4
  src/shared/utils/astrology.ts          MODIFIED  (Kyureki engine, guidance, ambient reading, resonance)
  src/client/components/System.tsx       MODIFIED  (shared reading, timeZone, resonance line)
  src/client/components/Logs.tsx         MODIFIED  (richer ASTRO line)
  src/client/stores/intentionEngine.ts   MODIFIED  (reading-object signal, new metadata)
  src/server/utils/logs.ts               MODIFIED  (shared reading, instant-based moon)
  src/server/models/user.ts              MODIFIED  (timeZone in profile view)
  src/shared/types/index.ts              MODIFIED  (LogContext lunar fields, UserProfile.timeZone)
  scripts/tests/test-astrology.ts        ADDED
  package.json                           MODIFIED  (test:astrology script)
  docs/assembly/2026-11-20_LOT-assembly_astrology-widget-v2-kyureki-resonance.md  ADDED
```

---

## KNOWN LIMITS / NEXT SESSIONS

- **Edge cases:** a new moon or chūki within a few minutes of JST midnight could shift a boundary by one day. Accuracy is about a minute, so this is rare. The "2033 problem" (a lunation with two chūki near the winter solstice) takes the first chūki; the official resolution may differ for 2033–2034.
- **Old snapshots:** Logs `astroRokuyo` values taken between 2026-07-27 and 2026-11-20 are still stored with the old wrong algorithm. They are ignored for resonance, but the journal `SYS:` line still shows them. A one-off backfill (recomputing from `createdAt` and `context.timeZone`) could correct the stored rows.
- **Resonance by mood:** resonance counts log *volume* only. A next step is crossing it with mood/energy signals, for example "your calmest rokuyo".
- **QIE pattern:** a dedicated pattern consuming `resonantDay` / `auspicious` together with `goals`/`intentions`. It needs the full benchmark treatment (pattern number, wiki, doctrine, Field Manual), as noted in v1.

---

*LOT Self-Assembly Engine — automated session*
