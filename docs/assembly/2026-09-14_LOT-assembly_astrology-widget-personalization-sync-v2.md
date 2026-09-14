# LOT Self-Assembly Session Report
## 2026-09-14 | Astrology Widget — Personalization + Widget Sync | v2

**Branch:** `claude/practical-curie-y1e1dt`
**Base commit:** `98971f2`
**Prior session:** `docs/assembly/2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md`
**COSMO Gate:** Kuzya Cosmo Marmeladov — monitoring
**Session type:** Automated / Scheduled (recurring routine)
**Live site access:** not attempted — all work sourced from repo inspection

---

## MISSION BRIEF

Standing recurring instruction: continue evolving the Astrology block
(today's zodiac hour, moon phase, rokuyo — ambient conditions, not a
personal natal chart) for user personalization and synchronization with
other widgets, keep it synchronized with Logs entries, and push a full
understanding + features breakdown document each session.

---

## PHASE 0 — ORIENTATION / VERIFY PRIOR SESSION LANDED

The 2026-07-27 session's changes were confirmed present in `master` at the
base commit (`98971f2`, merged via PR #96 on 2026-08-05): staleness fix
(`astrologyTick`, 15-min recompute off-tab), moon illumination surfaced,
Tier 0 QIE signal source (`astrology` in `WIDGET_DEPENDENCY_MAP`,
`recordAstrologySignal`), and Logs synchronization (`astroRokuyo` /
`astroMoonPhase` / `astroMoonIllumination` / `astroHourlyZodiac` /
`astroWesternZodiac` in `LogContext`, rendered in `Logs.tsx`'s `SYS:`
block). No astrology-specific session had run between then and today.

Re-read that session's **PENDING / FUTURE WORK** list to pick up where it
left off:
1. Author a dedicated QIE pattern reacting to the `astrology` signal
   together with `goals`/`intentions` (Taian-day nudge) — full self-assembly
   treatment (pattern number, wiki/doctrine/lexicon/Field Manual bump).
2. Client-side dashboard display still used device-local time instead of
   the user's saved `timeZone`, unlike the server-side Logs snapshot.
3. `getJapaneseZodiac` (year-based animal) and `getMoonEmoji` remained
   unused in the render path — candidates for a future ambient-safe
   personalization pass.

Item 1 (a new QIE pattern with archetype/job wiring and a version bump
across wiki/doctrine/lexicon/Field Manual) is a structural change on its
own scale and was left for a dedicated benchmark pass, consistent with the
prior session's own reasoning — folding it into this routine risks a sloppy
half-wired pattern. Items 2 and 3 were scoped, contained, and directly
actionable this session.

Checked whether the user's `timeZone` is reachable client-side at all:
confirmed `GET /me` (`src/server/routes/api.ts:412`) already returns
`metadata` (which includes `timeZone`) on the `me` object, and the existing
codebase convention for reading a metadata field client-side is
`(me as any)?.metadata?.<field>` (already used for `profileVisits` in
`System.tsx:113`) — no new endpoint needed.

---

## PHASE 1 — BUILD

### 1. Timezone-aware client dashboard display (closes pending item 2)

`src/shared/utils/astrology.ts` — extracted the wall-clock-passthrough
helper that was previously private to `src/server/utils/logs.ts` into a
shared, exported `wallClockDateFromMoment(moment)`. It's duck-typed against
dayjs's `.year()/.month()/.date()/.hour()/.minute()/.second()` accessors
rather than importing dayjs into this isomorphic, dependency-free module,
so both server and client can build a timeZone-correct `Date` from a
`dayjs().tz(...)` moment without duplicating the same one-liner and risking
drift between the two call sites.

`src/server/utils/logs.ts` — now imports and uses the shared helper instead
of its own local copy; behavior unchanged.

`src/client/utils/dayjs.ts` — added the `dayjs/plugin/timezone.js` extend
(after `utc`, matching the plugin's own load-order requirement and the
exact extend order already used in `src/server/utils/dayjs.ts`), so `.tz()`
is available client-side.

`src/client/components/System.tsx` — the `astrology` `useMemo` now reads
`(me as any)?.metadata?.timeZone` and, when the user has one saved, computes
the reading from `wallClockDateFromMoment(dayjs().tz(userTimeZone))` instead
of `new Date()`; falls back to device-local time for logged-out users or
users who haven't set a `timeZone`. `userTimeZone` was added to the memo's
dependency array so a profile fetch resolving after mount doesn't leave a
stale device-local reading behind.

Net effect: the dashboard's ambient reading and the Logs snapshot now agree
with each other for any user who has saved a `timeZone` — previously the
two could show a different zodiac hour or even a different rokuyo day
around a midnight boundary if the viewing device's clock timeZone differed
from the user's profile.

### 2. Surfaced the two previously-unused astrology functions (closes pending item 3)

Both `getJapaneseZodiac` and `getMoonEmoji` existed in
`src/shared/utils/astrology.ts` since before the 2026-07-27 session but were
never called from any render path. Confirmed both stay strictly ambient
under the standing instruction:

- `getMoonEmoji(phaseName)` is a pure display lookup on the phase name
  already being computed and shown — no new data, just an emoji prefix.
- `getJapaneseZodiac(year)` — the prior session flagged this as a "future
  personalization pass" candidate *if* used for a birth year (which would
  cross into natal-chart territory the standing instruction excludes). Used
  here instead on the **current calendar year** (`now.getFullYear()`),
  which is exactly as ambient as rokuyo or moon phase — it's "what year is
  it" astrology, not "when were you born."

Wired into all three places the existing four ambient fields already flow
through, so the new field doesn't become a second-class citizen relative to
rokuyo/moon phase/zodiac hour:

- `astrology` useMemo (`System.tsx`) → new `yearZodiac` field.
- Both render sites (compact `Block label="Astrology:"` and the cycling
  "pro" block) now show `{moonEmoji} {moonPhase} (...)  • Year of the
  {yearZodiac}`.
- `recordAstrologySignal` (`intentionEngine.ts`) → new `yearZodiac`
  parameter, included in the `ambient_reading` signal's metadata.
- `getLogContext` (`src/server/utils/logs.ts`) → new `astroYearZodiac` field
  on `LogContext` (`src/shared/types/index.ts`), computed from the same
  timeZone-resolved `localDate` the other four astro fields already use.
- `Logs.tsx`'s `SYS:` block → `ASTRO:` line now also shows the moon emoji
  and, when present, `· Year of the {astroYearZodiac}`.

No `WIDGET_DEPENDENCY_MAP` or Tier-0 signal-source changes were needed —
`astrology` was already registered as a Tier 0 source in the 2026-07-27
session; this session only enriches the payload of the signal it already
emits, it doesn't add a new source.

### 3. Synchronized with Logs entries (extends prior sync, doesn't replace it)

Every new log entry's `context` JSONB snapshot now carries `astroYearZodiac`
alongside the five ambient fields the prior session added, computed from
the same user-timeZone-resolved date so the whole ambient reading in one
log entry is internally consistent (no case where the rokuyo/moon-phase
came from one wall-clock day and the year-zodiac from another).

---

## PHASE 2 — TEST

Dependencies were not pre-installed in this session's container
(`node_modules` absent, as in the prior astrology session); ran
`npm install --legacy-peer-deps` to restore them (same pre-existing
`@nanostores/react`/`nanostores` peer-version conflict noted previously,
unrelated to this session's changes).

```
npm run server:build   -> PASS (tsc --project tsconfig.server.json)
npm run client:build   -> PASS (postcss + esbuild client bundle)
```

Both together are what `npm run build` runs end to end. The only build
warnings emitted (`duplicate-object-key` on `quarter_drop` / `elixir_found`
in `src/client/utils/badges.ts`) are pre-existing and unrelated to this
session's files. Zero errors or new warnings attributable to this session's
changes — in particular, the strict-mode nullable-field case in `Logs.tsx`
(`log.context.astroMoonPhase` is `string | null | undefined` on the shared
`LogContext` type, while `getMoonEmoji` takes a plain `string`) was caught
by `tsc` during iteration and fixed with a `|| ''` fallback before the
build reported clean.

---

## PHASE 3 — FEATURES BREAKDOWN (current Astrology feature state, post-session)

- **Inputs:** zodiac hour, Western zodiac sign, rokuyo (six-day auspicious
  cycle), moon phase + illumination % + emoji, current-year Japanese zodiac
  animal — all pure date-math, no external API, no personal birth data.
- **Personalization anchor:** the ambient reading is now timeZone-aware
  everywhere a saved `timeZone` exists for the user — both the server-side
  Logs snapshot (since 2026-07-27) and, as of this session, the client-side
  dashboard display (`System.tsx`) via `me.metadata.timeZone`. Users without
  a saved `timeZone` still see device-local time on the dashboard, which is
  itself a form of implicit personalization (it reflects the device they're
  actually looking at).
- **Freshness:** recomputes every 15 minutes while the tab is visible
  (unchanged from 2026-07-27), and now also recomputes if the user's saved
  `timeZone` resolves after initial mount (e.g. profile data arriving after
  the dashboard's first render).
- **Widget synchronization:** registered as a Tier 0 QIE signal source
  (`astrology`, since 2026-07-27), consumed per the dependency graph by
  `system` and `cosmic`; the daily `ambient_reading` signal now carries five
  data fields (rokuyo, moon phase, moon illumination, hourly zodiac, western
  zodiac) plus the new year-zodiac field and the `auspicious` (Taian-day)
  flag.
- **Logs synchronization:** every new log entry's `context` JSONB snapshot
  includes the full ambient astrology reading — now six fields instead of
  five — at creation time, timeZone-aware, rendered in the journal's `SYS:`
  block next to weather/location, including the moon emoji.
- **Shared/DRY:** the timeZone-aware wall-clock date construction used by
  both the server Logs snapshot and the client dashboard now lives in one
  place (`wallClockDateFromMoment` in the shared, isomorphic
  `astrology.ts`) instead of being duplicated per-side, closing a
  drift risk the prior session's implementation left open.
- **Not implemented (by design, per standing instruction):** any personal
  natal-chart data (birth date/time/place, sun/moon/rising sign) — the
  feature remains strictly ambient/environmental. The year-zodiac addition
  this session deliberately uses the *current* year, not a birth year, to
  stay inside that boundary.

---

## PHASE 4 — DEPLOY

```
Branch: claude/practical-curie-y1e1dt
Files changed: 7
  src/shared/utils/astrology.ts            MODIFIED (+wallClockDateFromMoment)
  src/server/utils/logs.ts                 MODIFIED (dedupe onto shared helper, +astroYearZodiac)
  src/shared/types/index.ts                MODIFIED (+astroYearZodiac on LogContext)
  src/client/utils/dayjs.ts                MODIFIED (+timezone plugin)
  src/client/components/System.tsx         MODIFIED (timeZone-aware reading, +yearZodiac, +moon emoji)
  src/client/stores/intentionEngine.ts     MODIFIED (recordAstrologySignal +yearZodiac param)
  src/client/components/Logs.tsx           MODIFIED (ASTRO: line +emoji, +year zodiac)
  docs/assembly/2026-09-14_LOT-assembly_astrology-widget-personalization-sync-v2.md  ADDED
```

---

## PENDING / FUTURE WORK

- Author a dedicated QIE pattern that reacts to the `astrology` signal
  together with `goals`/`intentions` (e.g. a gentle nudge on
  auspicious/Taian days, now additionally able to key off the year-zodiac
  metadata field). Still deferred to a dedicated benchmark/self-assembly
  session — pattern number, archetype/job wiring if warranted, wiki +
  doctrine + lexicon + Field Manual sync — rather than folded into this
  routine, same reasoning as the prior session.
- Consider whether `Block label="Astrology:"` is getting crowded now that
  it renders six data points on one line (western zodiac, hourly zodiac,
  rokuyo, moon phase + emoji + illumination, year zodiac) — a future
  session could look at whether the compact layout needs a second line or
  a shorter format, independent of any further data additions.
- The `auspicious` (Taian-day) flag has been available on every
  `ambient_reading` QIE signal since 2026-07-27 but nothing yet reads it —
  same prerequisite-vs-consumer gap noted then, now joined by the new
  `yearZodiac` field also going unconsumed until the pattern in the first
  bullet above is authored.

---

*LOT Self-Assembly Engine — automated session*
*COSMO Gate status: monitoring*
