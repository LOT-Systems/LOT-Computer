# LOT Self-Assembly Session Report
## 2026-09-09 | Astrology Widget — TimeZone Personalization + Moon Emoji | v2

**Branch:** `claude/practical-curie-c1uqjc`
**Session type:** Automated / Scheduled (recurring routine)
**Prior session:** `docs/assembly/2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)
**Live site access:** not attempted — all work sourced from repo inspection

---

## MISSION BRIEF

Standing recurring instruction: continue evolving the Astrology block (today's
zodiac hour, moon phase, rokuyo — ambient conditions, not a personal natal
chart) for user personalization and synchronization with other widgets, keep
it synchronized with Logs entries, and push a full understanding + features
breakdown document each session.

---

## PHASE 0 — ORIENTATION / WHAT CHANGED SINCE v1

Confirmed v1 (`b75f65b feat(astrology): personalize, sync with QIE + Logs, fix
staleness`) is on this branch's history and its five changes (15-minute
recompute tick, moon illumination surfaced, QIE Tier 0 `astrology` signal
source + `recordAstrologySignal`, and the `LogContext.astro*` fields synced
into `getLogContext`/`Logs.tsx`) are all present and untouched. No further
astrology commits landed between v1 and this session.

v1's own "PENDING / FUTURE WORK" section named three concrete follow-ups.
This session picks up the one that was both well-scoped and squarely
"personalization" — the other two were explicitly deferred by v1 to a
dedicated pattern-authoring benchmark pass, which is out of scope for this
recurring routine:

1. **Picked up this session:** "Consider whether the client-side dashboard
   display should also read from `user.timeZone` ... currently only the
   server-side Logs snapshot is timeZone-aware."
2. Deferred (needs a dedicated benchmark session per v1): author a QIE
   pattern reacting to `astrology` + `goals`/`intentions` (e.g. a nudge on
   Taian/auspicious days) — pattern numbering, archetype/job wiring, and a
   wiki/doctrine/lexicon/Field Manual version bump belong to that kind of
   session, not this one.
3. Deferred (still no personalization data to hang it on): `getJapaneseZodiac`
   (birth-year animal) and one branch of `getMoonEmoji` remained unused going
   into this session — re-checked the `User` model again, still no
   birthDate/birthPlace field exists, so a birth-year-animal feature still has
   nothing to opt into. `getMoonEmoji` is addressed this session instead (see
   below) via the moon phase already being computed, not birth data.

---

## PHASE 1 — BUILD

### 1. Dashboard reading now follows the user's saved timeZone (personalization)

Root cause confirmed by reading the code, not guessing: `System.tsx`'s
`astrology` `useMemo` called `new Date()` directly — device-local time. Server
side, `getLogContext` already reads `dayjs().tz(user.timeZone)` (via the
server's dayjs timezone plugin) before computing the same reading, so a user
whose device clock/timeZone differs from their saved profile timeZone (e.g.
viewing the dashboard while traveling, or from a shared/kiosk device) already
saw two different astrology readings: one on the dashboard, one on any Log
entry they created in the same moment.

Closing that split required exposing `timeZone` to the client, since the
client dayjs build (`src/client/utils/dayjs.ts`) deliberately does not load
the `dayjs/plugin/timezone` + tz-data pair the server uses (bundle-size
tradeoff, unaffected by this change):

- `src/shared/utils/astrology.ts` — added `getTimeZoneWallClockDate(date,
  timeZone)`, an isomorphic helper built on `Intl.DateTimeFormat.formatToParts`
  (no new dependency, works in both the browser and Node). It mirrors the
  server's existing `toWallClockDate` trick in `src/server/utils/logs.ts`
  conceptually — round-trip a moment through a target timeZone's wall-clock
  fields into a plain local `Date` — but is generic over any IANA `timeZone`
  string rather than depending on dayjs's timezone plugin.
- `src/shared/types/index.ts` — added `timeZone?: string | null` to
  `UserProfile`.
- `src/server/models/user.ts` — added `'timeZone'` to the `useProfileView()`
  field-pick list. This is the single call site of `useProfileView()` (the
  `/me` endpoint) — confirmed via repo-wide search before changing it — so
  this only ever exposes a user's own saved timeZone back to themselves,
  nothing new leaks to any other viewer.
- `src/client/components/System.tsx` — the `astrology` `useMemo` now computes
  `getTimeZoneWallClockDate(new Date(), me.timeZone)` when the already-loaded
  `me` profile (`stores.me`, populated by the existing `getMe()` call in
  `entries/app.tsx`) has a saved `timeZone`, falling back to device-local
  `new Date()` when it doesn't (new/never-configured accounts, matching
  `getLogContext`'s own `user.timeZone ? ... : dayjs()` fallback). Added
  `me?.timeZone` to the memo's dependency array so the reading re-derives if
  the user changes their city/country in Settings mid-session (which
  reactively updates `user.timeZone` server-side per the existing
  `/settings` handler in `api.ts`).

Net effect: the dashboard's Astrology block and a Log entry's `ASTRO:` line
now report the identical ambient reading for the same real-world moment, both
keyed off the user's saved timeZone rather than mixing device-local
(dashboard) and profile-local (Logs) clocks.

### 2. Surfaced the moon emoji (`getMoonEmoji`)

`getMoonEmoji(phaseName)` existed in `astrology.ts` since before v1 but was
never called anywhere — flagged as unused in v1's orientation phase. Wired it
into both places moon phase is already rendered, no new computation needed
since `moonPhase.phase` was already in hand:

- `System.tsx` — both render sites (compact `Block label="Astrology:"` and
  the cycling "pro" block) now show `{rokuyo} • {moonEmoji} {moonPhase}
  ({illumination}%)` instead of the phase name alone. Added `moonEmoji` to the
  `astrology` memo's return object rather than calling `getMoonEmoji` inline
  at each render site, keeping it computed once per tick like the rest of the
  block.
- `src/client/components/Logs.tsx` — the `SYS:` block's `ASTRO:` line
  (`log.context.astroRokuyo` / `astroMoonPhase`, added in v1) now also shows
  the emoji derived from the stored `astroMoonPhase` string, so a journal
  entry from any past day renders the same way the live dashboard does today.

`getJapaneseZodiac` remains the one still-unused export in `astrology.ts` —
correctly so, per Phase 0: it needs a birth year, and no such field exists on
`User` yet.

---

## PHASE 2 — TEST

```
npm install --legacy-peer-deps   -> OK (node_modules absent at session start;
                                        same pre-existing @nanostores/react
                                        peer-version conflict as v1, unrelated
                                        to this session, same workaround)
npm run server:build             -> PASS (tsc --project tsconfig.server.json)
npm run client:build             -> PASS (postcss + esbuild client bundle)
```

Client build emitted two pre-existing `duplicate-object-key` warnings in
`src/client/utils/badges.ts` (`quarter_drop`, `elixir_found`) — present before
this session's changes, unrelated to astrology, not touched.

Zero errors attributable to this session's changes.

---

## PHASE 3 — FEATURES BREAKDOWN (current Astrology feature state, post-session)

- **Inputs:** zodiac hour, Western zodiac sign, rokuyo (six-day auspicious
  cycle), moon phase + illumination % + emoji — all pure date-math, no
  external API, no personal birth data.
- **Personalization anchor:** the dashboard display and the Logs snapshot now
  both read the user's saved `timeZone` (set from city/country in Settings)
  when available, via two independent but equivalent implementations — dayjs
  timezone plugin server-side, a pure-`Intl` helper client-side — falling
  back to local device/process time only for accounts with no saved
  timeZone. This closes the split flagged as pending in v1.
- **Freshness:** recomputes every 15 minutes while the tab is visible
  (unchanged from v1), now also re-deriving immediately if the user's saved
  timeZone changes mid-session.
- **Widget synchronization:** registered as a Tier 0 QIE signal source
  (`astrology`, unchanged from v1), consumed per the dependency graph by
  `system` and `cosmic`; emits one `ambient_reading` signal per calendar day
  with an `auspicious` (Taian-day) flag.
- **Logs synchronization:** every new log entry's `context` JSONB snapshot
  carries the ambient astrology reading at creation time (unchanged from v1);
  the journal's `SYS:` block rendering now shows the moon emoji alongside the
  phase name, matching the live dashboard's presentation.
- **Not implemented (by design, per standing instruction):** any personal
  natal-chart data (birth date/time/place, sun/moon/rising sign) — the
  feature remains strictly ambient/environmental.

---

## PHASE 4 — DEPLOY

```
Branch: claude/practical-curie-c1uqjc
Files changed: 5
  src/shared/utils/astrology.ts   MODIFIED (+getTimeZoneWallClockDate)
  src/shared/types/index.ts       MODIFIED (+UserProfile.timeZone)
  src/server/models/user.ts       MODIFIED (+'timeZone' in useProfileView pick)
  src/client/components/System.tsx  MODIFIED (timeZone-aware reading, moon emoji)
  src/client/components/Logs.tsx    MODIFIED (moon emoji in ASTRO: line)
  docs/assembly/2026-09-09_LOT-assembly_astrology-widget-timezone-personalization.md  ADDED
```

---

## PENDING / FUTURE WORK

- Author a dedicated QIE pattern that reacts to the `astrology` signal
  together with `goals`/`intentions` (e.g. a gentle nudge on auspicious/Taian
  days) — still deferred to a dedicated benchmark session (pattern number,
  archetype/job wiring if warranted, wiki + doctrine + lexicon + Field Manual
  sync), same reasoning as v1.
- `getJapaneseZodiac` (year-based zodiac animal) remains unused — still
  blocked on there being no birth-year field on `User`; revisit if/when a
  birth-year opt-in is added elsewhere in the product, not invented here
  solely to consume this function.
- Consider surfacing the `auspicious` (Taian-day) flag itself somewhere
  visible pre-pattern — e.g. a subtle marker on the dashboard block on days
  the signal already flags as auspicious — as a smaller, non-benchmark step
  before the full QIE pattern above.

---

*LOT Self-Assembly Engine — automated session*
