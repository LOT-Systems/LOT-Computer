# LOT Self-Assembly Session Report
## 2026-11-13 | Astrology Widget — Personalization + Widget Sync + Logs Sync | v2

**Branch:** `claude/practical-curie-ompeu4`
**Base commit:** `98971f2` (master, PR #96 merged)
**Previous report:** `docs/assembly/2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)
**Session type:** Automated / Scheduled (recurring routine)
**Live site access:** not attempted. Everything here comes from reading the repo.

---

## MISSION BRIEF

Standing instruction: keep evolving the Astrology block (today's zodiac hour,
moon phase, rokuyo; ambient conditions, not a personal natal chart). Work on
user personalization and sync with other widgets, keep it in sync with Logs
entries, and push a full understanding + features breakdown each session.

---

## PHASE 0 — UNDERSTANDING (state at session start)

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure date math: zodiac hour, Western sign, rokuyo, moon phase, plus the unused helpers `getJapaneseZodiac` and `getMoonEmoji` |
| Widget | `src/client/components/System.tsx` | Inline `Astrology:` block in two layouts: the compact one, and the "pro" one that cycles Astrology → Psychology → Journey → Quantum |
| Widget sync | `src/client/stores/intentionEngine.ts` | Tier 0 QIE source `astrology`. `system` and `cosmic` depend on it. `recordAstrologySignal()` runs once per day |
| Logs sync | `src/server/utils/logs.ts` → `getLogContext()` | Writes `astro*` fields into each log's `context` JSONB |
| Logs render | `src/client/components/Logs.tsx` | `ASTRO:` line, shown only in `system_snapshot` (SYS) entries |

### Defects found while reading

1. **Two code paths drifted apart.** The client called the four helpers on device time. The server rebuilt a shifted wall-clock `Date` in `getLogContext`. The widget and the Logs snapshot could disagree for the same moment.
2. **Moon phase on the server was skewed by the UTC offset.** It was computed from `getTime()` of the shifted wall-clock Date (wrong by up to ±14 h of lunar cycle, about ±1–2 % illumination, and the phase name can flip at boundaries).
3. **Rokuyo changed day at the wrong moment.** `getRokuyo` diffed `getTime()` against UTC midnight 2000-01-01. The six-day cycle advanced at the UTC-offset moment, not at the reader's local midnight. Dates before 2000 could also produce a negative index (`undefined`).
4. **The dashboard ignored the saved profile timeZone** (deferred item from v1). `/me` didn't return `timeZone` at all (`useProfileView` didn't pick it).
5. **Coming back to a backgrounded tab** showed up to 15 minutes of stale reading.
6. **Normal journal entries didn't show the astro snapshot.** Only SYS entries did, even though every log already carries it.

---

## PHASE 1 — BUILD

### 1. One shared reading for widget and Logs — `getAstrologyReading(instant, timeZone)`
`src/shared/utils/astrology.ts`
- `toZonedWallClock(instant, tz)`: isomorphic, uses `Intl.DateTimeFormat#formatToParts`, so it doesn't depend on dayjs. Calendar fields follow the given IANA zone whatever zone the runtime is in. An invalid or missing zone falls back to the instant itself.
- `getAstrologyReading()` returns `{ westernZodiac, hourlyZodiac, rokuyo, rokuyoGuidance, auspicious, moonPhase, moonIllumination, moonEmoji, localDate, timeZone }`.
  Calendar readings use the zoned wall clock. **Moon phase always uses the true instant.**
- `getRokuyo` now counts whole local calendar days (`Date.UTC(y, m, d)` from local fields) and uses a safe modulo.
- New `getRokuyoGuidance()`: one short ambient almanac line per rokuyo day, for example Taian → "Auspicious — good day to begin".
- `getMoonEmoji` is now used (it's part of the reading).

### 2. Personalization: the dashboard follows the saved profile timeZone
- `src/server/models/user.ts`: `useProfileView` now includes `timeZone`. It's used only by the user's own `GET /me`, so it isn't exposed to other users.
- `src/shared/types/index.ts`: `UserProfile.timeZone?`.
- `System.tsx`: `astrology = getAstrologyReading(new Date(), me?.timeZone)`. It recomputes when the 15-minute tick fires, when the tab becomes visible again (new), and when the profile timeZone changes. With no saved zone, it uses device time as before.
- Both render sites now show a dim second line with the day's rokuyo guidance.

### 3. Widget sync (QIE)
- `recordAstrologySignal(..., extra?)` now also records `timeZone`, `localDate` and `guidance`. The new fields are optional, so existing callers still work.
- The once-per-day guard now keys on the reading's own `localDate` (in the profile zone), not device-local `dayjs()`. `localStorage` access is wrapped in try/catch.
- Consumers (`cosmic`, `system`, future patterns) can match the signal's `localDate` against Logs entries' `context.astro*` for the same day.

### 4. Logs sync
- `getLogContext()` now uses the shared `getAstrologyReading(new Date(), user.timeZone)` instead of its own local `toWallClockDate` helper, which is gone. It fixes the moon skew and records a new `astroAuspicious` boolean. `LogContext.astroAuspicious?` was added. No migration is needed because `context` is free-form JSONB.
- `Logs.tsx`:
  - SYS `ASTRO:` line: `Taian ✦ · Rat hr · Waxing Crescent (15%)`. It used to show only rokuyo and phase.
  - **Every** entry's hover context (`LogContainer` and the editable entry) now ends with the astro snapshot, via `withAstroContext()`. Example: `12°C, 60% – Tokyo · Taian ✦ · Waxing Crescent`. Entries from before the astro fields existed render unchanged.

---

## PHASE 2 — TEST

```
Shared util, bundled with esbuild and run under TZ=UTC and TZ=Asia/Tokyo:
  instant 2026-11-13T15:30Z
    null zone (UTC runtime)  → Scorpio · Monkey · Butsumetsu · Waxing Crescent 15% · 2026-11-13
    Asia/Tokyo               → Scorpio · Rat    · Taian ✦    · Waxing Crescent 15% · 2026-11-14
    America/Los_Angeles      → Scorpio · Dragon · Butsumetsu · Waxing Crescent 15% · 2026-11-13
    Pacific/Kiritimati       → Rabbit · Taian · 2026-11-14
    Bad/Zone                 → falls back to the instant, no throw
  Zoned results are identical under both runtime TZs        PASS
  Rokuyo, 1999-12-28 … 2000-01-04: advances exactly once per day,
    no undefined before 2000                                  PASS
npm run build (server tsc + client esbuild)                   PASS
tsc --noEmit (full project): no new errors in touched lines.
  The other errors listed in these files were already there.
```

---

## PHASE 3 — FEATURES BREAKDOWN (current state, after this session)

**What it shows:** Western sign • zodiac hour (12 × 2-hour animals) • rokuyo (six-day almanac) • moon phase (illumination %), plus a dim rokuyo guidance line.

**Where:** System dashboard. The compact layout shows a static block. The pro layout shows a click-to-cycle block (Astrology / Psychology / Journey / Quantum).

**Personalization:**
- Follows the user's saved profile timeZone (new), falling back to device time.
- The auspicious flag is set on Taian days.
- Still ambient only: no birth data is stored or asked for, by design.

**Freshness:** recomputes every 15 minutes while the tab is visible, right away when the tab comes back (new), and when the profile timeZone changes (new).

**Widget sync:**
- Tier 0 QIE source `astrology`, which `system` and `cosmic` depend on.
- One `ambient_reading` signal per local day carrying rokuyo, moon, hour, sign, auspicious, timeZone, localDate and guidance.

**Logs sync:**
- Every log's `context` snapshots rokuyo, moon phase, illumination, zodiac hour, Western sign and auspicious, using the same function and zone as the widget.
- The values appear in SYS entries and in every entry's hover context.

**Single source of truth:** `getAstrologyReading()` in `#shared/utils/astrology`, used by both the client and the server.

---

## PHASE 4 — DEPLOY

```
Branch: claude/practical-curie-ompeu4
  src/shared/utils/astrology.ts           MODIFIED  shared reading, zoned wall clock, rokuyo fix, guidance
  src/server/utils/logs.ts                MODIFIED  uses the shared reading, moon skew fixed, astroAuspicious
  src/server/models/user.ts               MODIFIED  /me profile view includes timeZone
  src/shared/types/index.ts               MODIFIED  UserProfile.timeZone?, LogContext.astroAuspicious?
  src/client/components/System.tsx        MODIFIED  profile-zone reading, visibility refresh, guidance line
  src/client/stores/intentionEngine.ts    MODIFIED  signal carries timeZone / localDate / guidance
  src/client/components/Logs.tsx          MODIFIED  richer ASTRO line, astro on every entry's hover
  docs/assembly/2026-11-13_…-v2.md        ADDED     this report
```

---

## PENDING / FUTURE WORK

- **Write a QIE pattern that uses the signal.** Nothing reads the `astrology` signal yet. A candidate: Taian day + an active goal or intention → a gentle "good day to begin" nudge. Butsumetsu → a "close loops" nudge. This needs a full self-assembly pass: pattern number, then wiki, doctrine and Field Manual sync.
- **Add a mood/journal correlation view.** Every log now has `astro*` context, so the Logs or Journey views could show, for example, entry counts or mood by moon phase or rokuyo over the last N days.
- **Make rokuyo accurate.** It's still the simplified Gregorian six-day cycle. Traditional rokuyo resets on each lunisolar month (旧暦). A lunisolar table or algorithm would make it correct.
- **Use the unused helper.** `getJapaneseZodiac` (year animal) is still unused. It could become an opt-in, year-level ambient reading.
