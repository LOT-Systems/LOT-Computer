# LOT Self-Assembly Session Report
## 2026-09-28 | Astrology Widget — Personalization + Widget Sync (Round 2) | v2

**Branch:** `claude/practical-curie-lj8odo`
**Base commit:** `98971f2`
**COSMO Gate:** Kuzya Cosmo Marmeladov — monitoring
**Session type:** Automated / Scheduled (recurring routine)
**Prior round:** `docs/assembly/2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (commit `b75f65b`, merged to master)
**Live site access:** not attempted — all work sourced from repo inspection

---

## MISSION BRIEF

Standing recurring instruction: continue evolving the Astrology block (today's
zodiac hour, moon phase, rokuyo — ambient conditions, not a personal natal
chart) for user personalization and synchronization with other widgets, keep
it synchronized with Logs entries, and push a full understanding + features
breakdown document each session.

---

## PHASE 0 — ORIENTATION (state at session start)

The 2026-07-27 round already landed and is live on `master`:

| Piece | State found |
|---|---|
| Staleness fix | Done — 15-min recompute tick, paused off-tab |
| Moon illumination | Done — surfaced in both render sites |
| QIE signal bus | Done — `astrology` is a Tier 0 source; `recordAstrologySignal()` fires once/day with an `auspicious` (Taian) flag; `system`/`cosmic` declare it as a dependency |
| Logs sync | Done — `LogContext.astro*` fields populated in `getLogContext()`, rendered in `Logs.tsx`'s `SYS:` block |

Three items were explicitly left open in that report's "Pending / Future
Work" section, which this round picks up:

1. Author a dedicated QIE pattern reacting to the `astrology` signal together
   with `goals`/`intentions` (an auspicious-day nudge).
2. Make the client-side dashboard timeZone-aware — it read device-local time
   only, while the server-side Logs snapshot already used `user.timeZone`.
3. Decide what to do with `getJapaneseZodiac`/`getMoonEmoji`, both still
   unused in the render path at the time.

Investigated and confirmed before building:

- The client never fetched the user's own `timeZone` at all — `GET /api/me`
  (`useProfileView()` in `src/server/models/user.ts`) explicitly excluded it
  from its `fp.pick([...])` field list, even though the column exists and is
  already used server-side. `city`/`country` were already available client-side
  via `stores.me` (`useStore(stores.me)`, populated by `getMe()` at app boot),
  but not `timeZone`.
- The client's `dayjs` build (`src/client/utils/dayjs.ts`) only extends
  `utc`/`relativeTime`/`weekOfYear`/`isoWeek`/`advancedFormat`/`dayOfYear` — no
  `dayjs/plugin/timezone`. Reproducing the server's `dayjs().tz(...)` approach
  client-side would mean adding a new plugin to the client bundle; instead this
  round reuses the same *wall-clock round-trip* idea the server already uses
  (`toWallClockDate()` in `src/server/utils/logs.ts`) but built on
  `Intl.DateTimeFormat(...).formatToParts()`, which every target browser
  already ships — no new dependency.
- `analyzeIntentions()` in `src/client/stores/intentionEngine.ts` is genuinely
  live detection code — it scans the rolling `IntentionSignal[]` history and
  pushes to a `patterns` array read by `System.tsx`/`QuantumEngineWidgets.tsx`
  each render. Separately, a family of `check<Pattern>(): boolean` helper
  functions (`checkCentennialConvergence`, `checkBiofieldCoherence`, etc.)
  exist for *meta*-patterns (patterns that fire off other patterns firing);
  some of those are wired into `analyzeIntentions()`'s post-commit
  `setTimeout` block, others (e.g. `checkCentennialConvergence`) are exported
  but not currently called from anywhere — a pre-existing gap, left alone this
  round since it's unrelated to astrology.
- Both `PATTERN_DISPLAY`-style lookup maps (`QuantumEngineWidgets.tsx`,
  `PatternRecognitionWidget.tsx`) fall back to an auto-generated label
  (`pattern.replace(/-/g, ' ')`) for any pattern id not present in the map —
  confirmed before relying on it, so a new pattern id doesn't need a matching
  entry there to render safely.

---

## PHASE 1 — BUILD

### 1. Client dashboard now personalizes to the user's saved timeZone

`src/server/models/user.ts` — added `'timeZone'` to the `fp.pick([...])` list
in `useProfileView()`, the single function backing `GET /api/me`.
`src/shared/types/index.ts` — added `timeZone?: string | null` to
`UserProfile`. No new endpoint, no new client fetch: `stores.me` already
carries the full profile response, so `me.timeZone` becomes available for
free wherever `useStore(stores.me)` is already called.

`src/client/components/System.tsx` — added `timeZoneWallClockDate(timeZone)`,
which reconstructs a `Date` whose getters (`getHours()`, `getDate()`, etc.)
read as if they were local to that IANA zone, via
`Intl.DateTimeFormat(...).formatToParts()` (guarding the known Chrome
`hour12: false` midnight-as-"24" quirk with `% 24`). The `astrology` `useMemo`
now computes `now` from `me.timeZone` when present, falling back to
device-local `new Date()` otherwise — so a dashboard opened from a device set
to a different timeZone than the saved profile still reads the operator's own
local sky, while nothing changes for the common case where they match.

### 2. Surfaced the moon emoji

`getMoonEmoji()` (`src/shared/utils/astrology.ts`) was computed nowhere and
called nowhere — flagged as unused in the prior round. Both render sites now
show it inline: `{moonEmoji} {moonPhase} ({moonIllumination}%)`.

Deliberately **not** done: a "birth-year zodiac animal" opt-in using
`getJapaneseZodiac()`, floated as a future option last round. There is still
no birth-date field anywhere on the `User` model (confirmed again this round —
no migration, no column), and adding one crosses from *ambient* conditions
into *personal* data the standing instruction explicitly scopes out ("ambient
conditions, not a personal natal chart"). `getJapaneseZodiac()` remains
unused; revisit only if a birth-year field is deliberately added for other
product reasons.

### 3. New QIE pattern — Pattern 152: Auspicious Alignment

`src/client/stores/intentionEngine.ts`, inside `analyzeIntentions()`: when an
`astrology` signal flagged `auspicious: true` (rokuyo === Taian, already
emitted daily by `recordAstrologySignal()`) and a `goals` or `intentions`
signal both land in the same rolling 24h window, the engine now pushes an
`auspicious-alignment` pattern (`reason` prefixed `AUSP:`, confidence 0.55,
`suggestedWidget: 'cosmic'`, `suggestedTiming: 'passive'`) into the
already-existing pattern list `System.tsx` and the Quantum Engine widgets
read every render. No new signal-recording plumbing was needed — it reads
signals `recordAstrologySignal()` and the existing goals/intentions call
sites already produce.

This is the actual "widget synchronization" this round adds: `goals` gains
`'astrology'` as a declared dependency in `WIDGET_DEPENDENCY_MAP` (so
`getWidgetsDependingOn('astrology')` now correctly reports `goals` as a
consumer, alongside the pre-existing `system`/`cosmic`), and the astrology
signal now has a real downstream reader beyond passive display.

Deliberately scoped down from what a full "SELF-ASSEMBLY" version-bump
session in this repo's history usually does for a new pattern (no new
Archetype, no new scheduled Job, no Field Manual version bump, no
`About.tsx` pattern-count bump, no `PATTERN_DISPLAY` entry). Those are
optional presentation/narrative layers with confirmed graceful fallbacks
(see Phase 0); adding them for one pattern this round would have meant
touching ~8 additional files (`scheduled-jobs.ts`, `routes/api.ts`,
`QuantumEngineWidgets.tsx`, `PatternRecognitionWidget.tsx`, `About.tsx`,
`SystemProgressWidget.tsx`, plus a wiki/doctrine pass) with no independent
verification available in this environment for most of them — more surface
than a single automated routine pass should risk. The pattern is real and
live; the ceremony around it is left for a dedicated full self-assembly pass
if wanted.

### 4. Deepened Logs synchronization

`src/shared/types/index.ts` / `src/server/utils/logs.ts` — `LogContext`
gained `astroAuspicious?: boolean | null`, populated in `getLogContext()`
alongside the other `astro*` fields (`rokuyo === 'Taian'`, computed once and
reused rather than calling `getRokuyo()` twice). `src/client/components/Logs.tsx`
— the `ASTRO:` line now appends a `✨` marker when the day was auspicious, so
the journal shows at a glance which past days lined up with a Taian rokuyo —
the same signal the new QIE pattern reacts to live, now also visible
retrospectively in the log history.

---

## PHASE 2 — TEST

```
npm install --legacy-peer-deps   -> OK (node_modules was absent this session; pre-existing
                                     @nanostores/react peer-version conflict worked around
                                     the same way as the prior round, not a code change)
npm run server:build             -> PASS (tsc --project tsconfig.server.json)
npm run client:build             -> PASS (postcss + esbuild client bundle)
npm run build                    -> PASS (both, end to end)
```

Two pre-existing esbuild warnings (`duplicate-object-key` on `quarter_drop`
and `elixir_found` in `src/client/utils/badges.ts`) are unrelated to this
session's files and were present before this round's changes.

---

## PHASE 3 — FEATURES BREAKDOWN (current Astrology feature state, post-session)

- **Inputs:** zodiac hour, Western zodiac sign, rokuyo (six-day auspicious
  cycle), moon phase + illumination % + emoji — all pure date-math, no
  external API, no personal birth data.
- **Personalization anchor:** the dashboard reading now prefers the user's
  saved `timeZone` (via `GET /api/me` → `stores.me.timeZone`) when available,
  reconstructed with an `Intl`-based wall-clock trick (no new client
  dependency), falling back to device-local time — matching what the
  server-side Logs snapshot has done since the prior round.
- **Freshness:** recomputes every 15 minutes while the tab is visible.
- **Widget synchronization:** `astrology` is a Tier 0 QIE signal source,
  declared as a dependency of `system`, `cosmic`, and now `goals`. It emits
  one `ambient_reading` signal per calendar day (with an `auspicious` flag),
  which now genuinely feeds a second-order pattern —
  **Pattern 152 (auspicious-alignment)** — when a `goals`/`intentions` signal
  lands the same day. This is the first astrology-reactive pattern; the
  dependency graph and the live pattern list agree with each other.
- **Logs synchronization:** every new log entry's `context` JSONB snapshot
  includes the ambient astrology reading at creation time (rokuyo, moon
  phase, illumination, zodiac hour, Western sign, and now an explicit
  `astroAuspicious` boolean), rendered in the journal's `SYS:` block with a
  `✨` marker on auspicious days.
- **Not implemented (by design, per standing instruction):** any personal
  natal-chart data (birth date/time/place, sun/moon/rising sign) — the
  feature remains strictly ambient/environmental. `getJapaneseZodiac()`
  remains unused pending an explicit product decision to collect birth years.

---

## PHASE 4 — DEPLOY

```
Branch: claude/practical-curie-lj8odo
Files changed: 6
  src/client/components/System.tsx         MODIFIED
  src/client/components/Logs.tsx           MODIFIED
  src/client/stores/intentionEngine.ts     MODIFIED
  src/server/models/user.ts                MODIFIED
  src/server/utils/logs.ts                 MODIFIED
  src/shared/types/index.ts                MODIFIED
  docs/assembly/2026-09-28_LOT-assembly_astrology-widget-personalization-sync-v2.md  ADDED
  docs/benchmark/LOT-SR-20260928-01.md     ADDED
```

---

## PENDING / FUTURE WORK

- If a full self-assembly pass is wanted for Pattern 152 (Archetype, Job,
  Field Manual version bump, wiki entry, `PATTERN_DISPLAY` label,
  `About.tsx` counts), it is additive on top of this round — the pattern
  itself is already live and does not need to be re-authored.
- `getJapaneseZodiac()` stays a candidate for a future opt-in
  "birth-year animal" personalization feature, contingent on a deliberate
  decision to add a birth-year field to the `User` model — out of scope for
  an ambient-only routine.
- Consider whether other ambient-adjacent widgets (`cosmic` in particular,
  which already declares `astrology` as a dependency) should also read from
  `me.timeZone` the same way `System.tsx` now does, for consistency.

---

*LOT Self-Assembly Engine — automated session*
*COSMO Gate status: monitoring*
