# LOT Self-Assembly Session Report
## 2026-09-11 | Astrology Widget — TimeZone Personalization | v2

**Branch:** `claude/practical-curie-9mc6bl`
**Base commit:** `98971f2` (last commit on repo prior to this session: 2026-08-05)
**COSMO Gate:** Kuzya Cosmo Marmeladov — monitoring
**Session type:** Automated / Scheduled (recurring routine)
**Live site access:** not attempted — all work sourced from repo inspection
**Prior session:** `docs/assembly/2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md`

---

## MISSION BRIEF

Standing recurring instruction: continue evolving the Astrology block (today's
zodiac hour, moon phase, rokuyo — ambient conditions, not a personal natal
chart) for user personalization and synchronization with other widgets, keep
it synchronized with Logs entries, and push a full understanding + features
breakdown document each session.

---

## PHASE 0 — ORIENTATION

The 2026-07-27 session (v1) already: fixed a staleness bug (15-min recompute,
off-tab safe), surfaced `moonIllumination` in the UI, wired `astrology` into
the QIE signal bus (`intentionEngine.ts` — Tier 0 source, consumed by
`system`/`cosmic`, emits one `ambient_reading` signal/day with an `auspicious`
flag), and synchronized every Logs entry's `context` JSONB with the ambient
reading computed from the **user's saved `timeZone`** server-side. All of that
is present and intact on `master` at session start — verified by grep across
`System.tsx`, `intentionEngine.ts`, `logs.ts`, `Logs.tsx`, `shared/types`.

v1's own "PENDING / FUTURE WORK" list named three items. This session picked
up the one with the clearest, most self-contained payoff:

> Consider whether the client-side dashboard display should also read from
> `user.timeZone` (via a profile query) instead of device-local time, for
> users viewing the dashboard from a device set to a different timeZone than
> their saved profile — currently only the server-side Logs snapshot is
> timeZone-aware.

Investigating this surfaced the actual reason it hadn't been possible yet:
**`user.timeZone` was never returned to the client at all.** `User.timeZone`
is a real, populated column (auto-derived from `city`/`country` via
`weather.getTimeZone()` on profile save, `src/server/routes/api.ts:585-601`,
and already consumed server-side in `logs.ts` and `admin-api.ts`) — but
`User.useProfileView()` (`src/server/models/user.ts`), the `fp.pick([...])`
allowlist behind the `/api/me` route that populates the client's `stores.me`,
did not include `'timeZone'` in its pick list. The shared `UserProfile` type
(`src/shared/types/index.ts`) didn't declare the field either, even though
the separate `User` type nearby already did. So the client-side "use
`user.timeZone`" fix from v1's pending list was blocked on a one-line gap in
the profile serializer, not a missing feature — worth closing directly.

---

## PHASE 1 — BUILD

### 1. Exposed `timeZone` on the client profile

- `src/server/models/user.ts` — added `'timeZone'` to the `fp.pick([...])`
  allowlist in `useProfileView()`, alongside the existing `city`/`country`
  fields it's derived from. No new data exposed beyond what the weather
  lookup already derives from city/country, which were already client-visible.
- `src/shared/types/index.ts` — added `timeZone: string | null` to
  `UserProfile`, matching the existing `User` type's field.

### 2. Isomorphic timeZone re-anchoring helper

- `src/shared/utils/astrology.ts` — added
  `getWallClockDateInTimeZone(date, timeZone)`: uses `Intl.DateTimeFormat`
  (native, zero dependency footprint — no timezone-database package needed,
  works identically in browser and Node) to read a date's wall-clock
  year/month/day/hour/minute/second *as seen in* the given IANA timeZone,
  and reconstructs a `Date` whose local getters report those values. Every
  other function in this file (`getHourlyZodiac`, `getWesternZodiac`,
  `getRokuyo`, `getMoonPhase`) already reads via local Date getters, so this
  is a drop-in seam: pass it a re-anchored date and the whole pipeline
  becomes timeZone-aware for free. Falls back to returning the input date
  unchanged if the timeZone string is invalid — a bad/legacy `timeZone`
  value degrades to the previous (device-local) behavior instead of
  throwing.

Chose this over pulling `dayjs/plugin/timezone` into the client bundle
(the approach `server/utils/logs.ts` uses via `dayjs().tz(...)`) since the
client bundle has no timezone plugin loaded today (checked
`src/client/utils/dayjs.ts` — only `utc`/`relativeTime`/`weekOfYear`/
`isoWeek`/`advancedFormat`/`dayOfYear` are extended) and `Intl` covers the
same wall-clock-reprojection need with no bundle-size or IANA-database-
freshness cost.

### 3. Wired it into the dashboard

`src/client/components/System.tsx`:
- Imported `getMoonEmoji` (previously computed and discarded per v1's notes
  — actually: unused entirely, never called) and the new
  `getWallClockDateInTimeZone`.
- The `astrology` `useMemo` now computes its anchor date as
  `me?.timeZone ? getWallClockDateInTimeZone(new Date(), me.timeZone) : new Date()`,
  and depends on `[astrologyTick, me?.timeZone]` — the day/hour boundary a
  user actually experiences (their saved timeZone, when set) now drives the
  reading instead of whichever timeZone the current device's clock happens
  to be set to. Users with no saved `timeZone` (no city/country on file) see
  exactly the prior device-local behavior — no regression, pure enhancement.
- Both render sites (compact `Block label="Astrology:"` and the cycling
  "pro" block) now show `{moonEmoji} {moonPhase}` instead of the phase name
  alone, closing out the other loose end from v1's notes
  (`getMoonEmoji`/`getJapaneseZodiac` "remain unused").

---

## PHASE 2 — TEST

Dependencies were not pre-installed in this session's container
(`node_modules` absent, matching v1's environment note); ran
`npm install --legacy-peer-deps` to restore them (same pre-existing
`@nanostores/react`/`nanostores` peer-version conflict noted in v1, unrelated
to this session).

```
npm run server:build   -> PASS (tsc --project tsconfig.server.json)
npm run client:build   -> PASS (postcss + esbuild client bundle)
```

Two pre-existing esbuild warnings (duplicate `quarter_drop`/`elixir_found`
keys in `src/client/utils/badges.ts`) are unrelated to this session's diff —
confirmed by `git blame`-adjacent inspection, not introduced here.

Zero errors attributable to this session's changes.

---

## PHASE 3 — FEATURES BREAKDOWN (current Astrology feature state, post-session)

- **Inputs:** zodiac hour, Western zodiac sign, rokuyo (six-day auspicious
  cycle), moon phase + illumination % + emoji — all pure date-math, no
  external API, no personal birth data.
- **Personalization anchor:** ambient reading is now timeZone-aware
  end-to-end — both the server-side Logs snapshot (since v1) *and* the
  client-side dashboard display (new this session) read from the user's
  saved `timeZone` when one exists, falling back to device-local time
  otherwise. A user who saved a city/country sees the same zodiac
  hour/rokuyo regardless of what timeZone the device they're currently
  looking at the dashboard on is set to.
- **Freshness:** recomputes every 15 minutes while the tab is visible
  (unchanged from v1), now also recomputing immediately if `me.timeZone`
  changes (e.g. right after a profile save).
- **Widget synchronization:** registered as a Tier 0 QIE signal source
  (`astrology`, unchanged from v1), consumed by `system` and `cosmic`;
  emits one `ambient_reading` signal per calendar day with an `auspicious`
  (Taian-day) flag.
- **Logs synchronization:** every new log entry's `context` JSONB snapshot
  includes the ambient astrology reading at creation time (unchanged from
  v1), rendered in the journal's `SYS:` block next to weather/location.
- **Display:** moon phase now shown with its emoji (🌑🌒🌓🌔🌕🌖🌗🌘) in
  both the compact and cycling "pro" dashboard render sites.
- **Not implemented (by design, per standing instruction):** any personal
  natal-chart data (birth date/time/place, sun/moon/rising sign) — the
  feature remains strictly ambient/environmental.

---

## PHASE 4 — DEPLOY

```
Branch: claude/practical-curie-9mc6bl
Files changed: 5
  src/client/components/System.tsx         MODIFIED
  src/server/models/user.ts                MODIFIED
  src/shared/types/index.ts                MODIFIED
  src/shared/utils/astrology.ts            MODIFIED
  docs/assembly/2026-09-11_LOT-assembly_astrology-widget-timezone-personalization.md  ADDED
```

---

## PENDING / FUTURE WORK

- **QIE pattern authoring** (carried over from v1, still deferred): a
  dedicated pattern reacting to the `astrology` signal together with
  `goals`/`intentions` (e.g. a gentle nudge on auspicious/Taian days). This
  needs the full self-assembly treatment — pattern number, archetype/job
  wiring if warranted, wiki + doctrine + lexicon + Field Manual version sync
  — and is intentionally kept out of this lighter-weight routine, same
  reasoning as v1.
- **`getJapaneseZodiac`** (year-based animal) remains unused. Still a
  candidate for a future personalization pass (e.g. a "your birth year
  animal" opt-in), still out of scope while the feature stays ambient-only
  and no birth-year field exists on the `User` model — confirmed again this
  session (grepped `src/server`/`src/shared` for
  `birthYear|birthDate|birthPlace|zodiacSign`, zero hits).
- Consider surfacing the new `auspicious` (Taian-day) signal directly in the
  dashboard block itself (not just in the QIE bus) as a small visual cue —
  deferred since it overlaps with the pattern-authoring item above and is
  better designed together with it.

---

*LOT Self-Assembly Engine — automated session*
*COSMO Gate status: monitoring*
