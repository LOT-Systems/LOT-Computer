# LOT Self-Assembly Session Report
## 2026-11-11 | Astrology Widget — Time Windows, Personal Resonance, Unified Reader | v2

**Branch:** `claude/practical-curie-joufvr`
**Base commit:** `98971f2`
**Previous session:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)
**Session type:** Automated / Scheduled (recurring routine)
**Live site access:** not attempted. All work comes from reading the repo.

---

## MISSION BRIEF

Standing instruction: keep evolving the Astrology block (today's zodiac hour,
moon phase, rokuyo; ambient conditions, not a personal natal chart). Make it
more personal, keep it in sync with other widgets and with Logs entries, and
push a full understanding + features breakdown each session.

---

## PHASE 0 — UNDERSTANDING (state at session start)

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure isomorphic functions: hourly zodiac, Western sign, rokuyo, moon phase |
| Dashboard | `src/client/components/System.tsx` | Inline block in two layouts (compact static block + the "pro" cycling block Astrology → Psychology → My Journey → Biofield) |
| Signal bus | `src/client/stores/intentionEngine.ts` | `astrology` is a Tier 0 QIE source; `recordAstrologySignal` fires once per day; `system` + `cosmic` depend on it |
| Logs (write) | `src/server/utils/logs.ts` `getLogContext` | Snapshots `astro*` fields into every Log `context` JSONB |
| Logs (read) | `src/client/components/Logs.tsx` | `SYS:` block prints `ASTRO: rokuyo · moonPhase` |
| Docs (in-app) | `src/client/components/About.tsx` `#astrology` | User-facing explanation |

### Defects found this session

1. **Rokuyo flipped at the UTC offset, not at local midnight.** `getRokuyo`
   diffed against `new Date('2000-01-01')`, which is parsed as *UTC* midnight.
   Every user outside UTC saw the day change mid-day: 16:00 in California,
   09:00 in Tokyo. The Logs snapshot and the dashboard could disagree for
   part of every day.
2. **Server moon phase skewed by the user's tz offset.** `logs.ts` passed a
   synthetic wall-clock Date to `getMoonPhase`, and that function reads
   `getTime()`. Illumination came out off by up to ~14h of lunar motion.
3. **Dashboard ignored the profile timeZone.** The client used the device
   clock while Logs used `user.timeZone` (open item from v1).
4. **About page had Tomobiki and Shakku inverted** compared with the
   traditional almanac rules. Tomobiki is bad only at midday. Shakku is good
   *only* at midday.
5. The once-per-day QIE throttle used `localStorage` without try/catch, so
   it could throw in private windows or when storage is blocked.

---

## PHASE 1 — BUILD

### 1. One shared reader: `getAstrologyReading(instant, timeZone)`
`astrology.ts` now exports a single entry point that returns
`{ hourlyZodiac, westernZodiac, rokuyo, moonPhase, moonIllumination, window, windowNote }`.
- Calendar fields (rokuyo, zodiac hour, sign) are read in the user's zone
  through the new `toWallClockInZone(instant, tz)`. It uses only `Intl`, so it
  works on the client without the dayjs tz plugin, and it falls back to the
  device clock if the zone is invalid.
- The moon phase is computed from the real instant (fixes defect 2).
- The dashboard (`System.tsx`) and the server (`logs.ts`) both call this
  reader, so the block, the QIE signal and the Logs ASTRO line always agree
  (fixes defect 3).

### 2. Rokuyo fix
`getRokuyo` now counts whole calendar days from the date's own Y/M/D
(`Date.UTC(y,m,d)`), with a safe positive modulo. 2000-01-01 is still
Sensho. Verified under `TZ=UTC` and `TZ=America/Los_Angeles`: the value stays
the same from 00:01 to 23:59 and advances at local midnight (fixes defect 1).

### 3. New feature: "Now" window (rokuyo time-of-day guidance)
`getRokuyoTiming(rokuyo, hour)` → `{ window: 'favorable'|'unfavorable', note }`:

| Rokuyo | Rule | Example note |
|---|---|---|
| Sensho | morning favorable | "act early" / "morning has passed" |
| Tomobiki | all but 11–13 favorable | "shared things go well" / "pause at midday" |
| Senpu | afternoon favorable | "wait for afternoon" / "afternoon opens" |
| Butsumetsu | unfavorable all day | "rest, close loops" |
| Taian | favorable all day | "good for beginnings" |
| Shakku | only 11–13 (Hour of the Horse) | "Hour of the Horse" / "favorable only 11–13" |

Rendered as a second line in both dashboard layouts:
`Now: favorable · act early`.

### 4. New feature: "Your rhythm" (personalization from Logs)
`summarizeAstroResonance(logs)` reads the `astro*` snapshots that every log
has carried since v1. It returns the user's most frequent rokuyo, moon phase
and zodiac hour, plus the share of logs written in a favorable window. It
needs at least 5 logs before it says anything.
Rendered as a third line: `Your rhythm: Taian · Full Moon — in tune today`.
"In tune" appears when today's rokuyo or moon phase matches the user's
dominant one. No birth data is involved; it is personal only because it
comes from the user's own behaviour.

### 5. Logs synchronization (both directions)
- **Write:** `LogContext` gains `astroWindow` (`favorable|unfavorable`).
  `getLogContext` uses the unified reader.
- **Read (render):** the `SYS:` block now shows the full reading:
  `ASTRO: Taian · Dog hour · Full Moon (98%) · favorable`
- **Read (personalize):** the Logs feed is the input to "Your rhythm", and
  that closes the loop: Logs ← reading → Logs.
- No migration is needed because `context` is free-form JSONB. Old logs
  without `astroWindow` just leave it out of the line and out of
  `favorableShare`.

### 6. Widget synchronization
- `recordAstrologySignal(..., extra)` metadata now also carries `window`,
  `resonantRokuyo`, `resonantMoonPhase` and `resonanceMatch`.
- New read-side helper `getLatestAstrologyReading(signals)` in
  `intentionEngine.ts` returns the latest `ambient_reading` from the last 36h.
  Any widget can sync without importing the dashboard.
- **First consumer:** `SystemPulseWidget` (Biofield view) shows a
  `ROKUYO  Taian · in tune` row.
- The System Biofield table (pro layout) shows a `Rokuyo` row:
  `Taian · favorable`.
- The once-per-day throttle key is now the calendar day *in the user's
  zone*, and storage access is wrapped in try/catch (fixes defect 5).

### 7. In-app docs
`About.tsx#astrology`: Tomobiki and Shakku now follow the traditional rules
(fixes defect 4). Added "Now Window" and "Your Rhythm" subsections and
corrected the moon-phase cadence ("re-derived every 15 min", not "daily").

---

## PHASE 2 — TEST

```
npm install --legacy-peer-deps   -> ok (node_modules absent in fresh container)
npm run server:build             -> PASS
npm run client:build             -> PASS (0 errors; pre-existing badges.ts duplicate-key warnings unchanged)
```

Pure-function checks (`npx esr`, run under TZ=UTC and TZ=America/Los_Angeles):
- `getRokuyo` is stable across a local day, advances at local midnight, and
  2000-01-01 is still Sensho.
- Instant 2026-11-11T23:30Z reads as LA (15:30) → Tomobiki, Monkey hour, favorable;
  Tokyo (Nov 12, 08:30) → Senpu, Dragon hour, unfavorable · "wait for afternoon".
- `getRokuyoTiming('Shakku', 12)` is favorable; at hour 9 it is unfavorable.
- `summarizeAstroResonance`: with 6 logs → Taian / Full Moon / Dog / 83%;
  with 2 logs → all null (below the threshold).
- An invalid timeZone falls back gracefully.

---

## PHASE 3 — FULL FEATURES BREAKDOWN (post-session)

**Inputs (all pure date math, no API, no birth data)**
- Western sign (tropical, date ranges)
- Japanese hourly zodiac (12 × 2h)
- Rokuyo (6-day cycle, local-midnight boundary)
- Moon phase + illumination % (synodic month from the 2000-01-06 new moon)
- Rokuyo time window (favorable/unfavorable + note)

**Personalization**
- The profile `timeZone` drives every calendar field, on both client and server.
- "Your rhythm" gives the dominant rokuyo / moon phase / zodiac hour from the
  user's own logs (≥5), the favorable-window share, and an "in tune today" flag.

**Display**
- Compact layout: static `Astrology:` block with 3 lines.
- Pro layout: cycling block (Astrology → Psychology → My Journey → Biofield).
  The Biofield table includes a Rokuyo row.

**Freshness**
- Re-derived every 15 min while the tab is visible and paused off-tab.
- The QIE signal fires once per user-zone calendar day.

**Widget sync (QIE)**
- Tier 0 source `astrology`; dependents are `system` and `cosmic`.
- `ambient_reading` metadata: rokuyo, moonPhase, moonIllumination,
  hourlyZodiac, westernZodiac, auspicious (Taian), window, resonantRokuyo,
  resonantMoonPhase, resonanceMatch.
- `getLatestAstrologyReading()` is the read API. Consumers: SystemPulseWidget.

**Logs sync**
- Every log `context`: astroRokuyo, astroMoonPhase, astroMoonIllumination,
  astroHourlyZodiac, astroWesternZodiac, astroWindow.
- `SYS:` render line: `ASTRO: rokuyo · zodiac hour · moon (illum%) · window`.

**Out of scope by design:** natal chart, birth date/time/place, sun/moon/rising.

---

## PHASE 4 — DEPLOY

```
Branch: claude/practical-curie-joufvr
  src/shared/utils/astrology.ts               MODIFIED  (reader, tz, timing, resonance, rokuyo fix)
  src/shared/types/index.ts                   MODIFIED  (LogContext.astroWindow)
  src/server/utils/logs.ts                    MODIFIED  (unified reader, moon instant fix)
  src/client/components/System.tsx            MODIFIED  (profile tz, Now/Your rhythm lines, Biofield row, safe throttle)
  src/client/components/Logs.tsx              MODIFIED  (full ASTRO line)
  src/client/components/SystemPulseWidget.tsx MODIFIED  (Rokuyo row via QIE)
  src/client/stores/intentionEngine.ts        MODIFIED  (signal metadata, getLatestAstrologyReading)
  src/client/components/About.tsx             MODIFIED  (rule corrections, new subsections)
  docs/assembly/2026-11-11_LOT-assembly_astrology-widget-v2-timing-resonance.md  ADDED
```

---

## PENDING / FUTURE WORK

- **QIE pattern** (still deferred from v1): a composite pattern that combines
  `astrology.window`/`resonanceMatch` with `goals`/`intentions`, for example
  a gentle "start it now" nudge in a favorable window on an in-tune day.
  This needs a dedicated benchmark pass (pattern number, wiki/FM sync).
- **Cosmic widget consumer:** `cosmic` is in the dependency map, but no UI
  reads `getLatestAstrologyReading()` there yet.
- **Rokuyo accuracy:** the real rokuyo resets on the first day of each
  *lunisolar* month. The 6-day modular cycle is a documented simplification.
  A lunisolar table would make it calendar-exact.
- **Resonance trend:** compare favorableShare over the last 30 days with
  all-time, and surface "you've shifted toward afternoons".
- `getJapaneseZodiac` and `getMoonEmoji` are still unused.

---

*LOT Self-Assembly Engine — automated session*
