# LOT Self-Assembly Session Report
## 2026-09-15 | Astrology Widget — TimeZone Personalization | v2

**Branch:** `claude/practical-curie-d4r55x`
**Base commit:** `98971f2`
**COSMO Gate:** Kuzya Cosmo Marmeladov — monitoring
**Session type:** Automated / Scheduled (recurring routine)
**Live site access:** not attempted — all work sourced from repo inspection
**Prior session:** `docs/assembly/2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)

---

## MISSION BRIEF

Standing recurring instruction: continue evolving the Astrology block (today's
zodiac hour, moon phase, rokuyo — ambient conditions, not a personal natal
chart) for user personalization and synchronization with other widgets, keep
it synchronized with Logs entries, and push a full understanding + features
breakdown document each session.

---

## PHASE 0 — ORIENTATION (state inherited from v1)

Re-read the feature as it stands, confirmed all five v1 deliverables are
live on the current branch tip:

| Deliverable (v1, 2026-07-27) | Verified state |
|---|---|
| 15-min recompute tick, paused `!document.hidden` | `System.tsx` `astrologyTick` — present |
| Moon illumination surfaced in both render sites | `{moonPhase} ({moonIllumination}%)` — present |
| `astrology` wired into QIE signal bus (Tier 0, `system`/`cosmic` deps) | `intentionEngine.ts` `WIDGET_DEPENDENCY_MAP`, `recordAstrologySignal` — present |
| One `ambient_reading` signal/day via `localStorage` date-stamp | `System.tsx` effect — present |
| Logs synchronization (`astroRokuyo` etc. in `LogContext`) | `logs.ts` `getLogContext`, `Logs.tsx` `ASTRO:` line — present |

v1 left three items in PENDING/FUTURE WORK. This session picks up the one
that is concretely scoped and low-risk; the other two are re-evaluated and
re-deferred below with reasoning (this routine's own judgment boundary: hold
and record rather than guess on broad-scope items).

### Gap found and fixed: the client dashboard was never able to be
### timeZone-aware — not just "unchanged," structurally blocked

v1's notes framed the client-side device-local-time behavior as a soft
"consider whether to change this" item. Tracing it further this session
found it's not a preference gap, it's a payload gap: `GET /api/me` truncates
the `User` row through `useProfileView()` (`src/server/models/user.ts`),
which `fp.pick()`s an explicit field allowlist — and `timeZone` was never in
that list, despite living on the underlying `User` model and being the exact
field `getLogContext()` already uses server-side for the Logs snapshot. The
client's `UserProfile` type (`src/shared/types/index.ts`) matched that
narrower payload, so there was no client field to read even if `System.tsx`
had wanted one. This made the v1 "future work" item actually unreachable
without a payload change, not just an unimplemented nice-to-have.

Also confirmed: the client's dayjs instance (`src/client/utils/dayjs.ts`)
never loaded the `timezone` plugin — only the server one
(`src/server/utils/dayjs.ts`) did — so `dayjs().tz(...)` was unavailable
client-side even with the data in hand.

---

## PHASE 1 — BUILD

### 1. Exposed `timeZone` on the user profile payload

`src/server/models/user.ts` — added `'timeZone'` to the `useProfileView()`
`fp.pick()` allowlist, the single source powering `GET /api/me`.

`src/shared/types/index.ts` — added `timeZone: string | null` to the
`UserProfile` type (isomorphic client/server type), mirroring the field
already on `User`.

No new endpoint, no migration — the column already exists and is already
readable server-side; this only widens an existing response shape.

### 2. Loaded the `timezone` dayjs plugin client-side

`src/client/utils/dayjs.ts` — added `dayjs/plugin/timezone.js`, extended
alongside the existing `utc` plugin (mirrors the plugin set already
registered in `src/server/utils/dayjs.ts`). This is the only client dayjs
change; no other call site was touched, so no existing date formatting
anywhere else in the client changes behavior.

### 3. Astrology block now reads the user's saved timeZone when available

`src/client/components/System.tsx` — the `astrology` `useMemo` now builds
its `now` from `me.timeZone` (the nanostores `UserProfile` atom, already
populated from `/api/me`) via the identical wall-clock-passthrough trick the
server already uses in `getLogContext()`/`toWallClockDate()`:

```ts
const now = me?.timeZone
  ? (() => {
      const local = dayjs().tz(me.timeZone!)
      return new Date(local.year(), local.month(), local.date(), local.hour(), local.minute(), local.second())
    })()
  : new Date()
```

Falls back to `new Date()` (device-local time) exactly as before when the
user has no saved timeZone (or is signed out) — no regression for that case.
`me?.timeZone` was added to the `useMemo` dependency array so the block also
re-derives immediately if the user changes their timeZone in Settings,
rather than waiting for the next 15-minute tick.

Only `getHourlyZodiac` and `getWesternZodiac` (`src/shared/utils/astrology.ts`)
actually consume wall-clock fields (`getHours()`/`getMonth()`/`getDate()`);
`getMoonPhase` and `getRokuyo` are instant-based (`date.getTime()` diffed
against a fixed epoch) and are identical in every timeZone by construction —
so this change only changes the *hour-boundary* and *midnight-boundary*
readings (zodiac hour, western zodiac cusp dates), which is exactly where
device-vs-home-timeZone divergence would have shown up.

### 4. Not touched this session (deliberately re-deferred)

- **QIE auspicious-day-alignment pattern** (goals/intentions × Taian-day
  nudge): the `intentionEngine.ts` pattern engine is a single 6,500-line
  file at v113 (151 patterns, 51 archetypes, 48 jobs) with its own minting
  convention (pattern number, archetype/job wiring, wiki + doctrine +
  lexicon + Field Manual version bump, all in lockstep). That is a
  dedicated self-assembly pass in its own right, not a sub-task of the
  astrology routine — bundling it in here risks an inconsistent partial
  mint in a file this dense. Re-deferred, same reasoning as v1.
- **Japanese zodiac / moon emoji personalization** (`getJapaneseZodiac`,
  `getMoonEmoji`, both still unused): `getJapaneseZodiac` takes a birth
  *year*, which the `User` model does not store anywhere (confirmed again
  this session — no birth-year/birth-date field exists). Wiring it up would
  mean introducing new personal-data collection, which is a product
  decision beyond "continue evolving the ambient widget" and cuts against
  the standing instruction's explicit "not a personal natal chart" framing.
  Held for S-2, not implemented.

---

## PHASE 2 — TEST

`node_modules` absent at session start (fresh container) — ran
`npm install --legacy-peer-deps` to restore them (same pre-existing
`@nanostores/react`/`nanostores` peer-version conflict noted in v1;
unrelated to this session's code).

```
npm run server:build   -> PASS (tsc --project tsconfig.server.json, typechecks UserProfile/User usage)
npm run client:build   -> PASS (postcss + esbuild client bundle)
npm run build          -> PASS (both, end to end)
```

Two pre-existing esbuild warnings (`duplicate-object-key` on
`quarter_drop`/`elixir_found` in `src/client/utils/badges.ts`) are unrelated
to this session's files and were present before these changes.

Zero errors attributable to this session's changes.

---

## PHASE 3 — FEATURES BREAKDOWN (current Astrology feature state, post-session)

- **Inputs:** zodiac hour, Western zodiac sign, rokuyo (six-day auspicious
  cycle), moon phase + illumination % — all pure date-math, no external API,
  no personal birth data.
- **Personalization anchor:** the dashboard display and the Logs snapshot
  are now **both** timeZone-aware against the same field
  (`user.timeZone` / `me.timeZone`) — previously only the server-side Logs
  path had this; the client dashboard silently used device-local time with
  no way to do otherwise. A user viewing the dashboard from a device set to
  a different timeZone than their saved profile now sees the *same* zodiac
  hour / cusp-date reading as their Logs entries and as any other
  server-computed context, rather than two silently disagreeing clocks.
  Users with no saved timeZone see unchanged device-local behavior.
- **Freshness:** recomputes every 15 minutes while the tab is visible, plus
  immediately on a timeZone change (new this session), instead of only on a
  fixed interval.
- **Widget synchronization:** unchanged from v1 — registered as a Tier 0 QIE
  signal source (`astrology`), consumed by `system` and `cosmic`, one
  `ambient_reading` signal per calendar day with an `auspicious` (Taian-day)
  flag.
- **Logs synchronization:** unchanged from v1 — every new log entry's
  `context` JSONB snapshot carries the ambient astrology reading at creation
  time. That reading and the dashboard's reading are now derived from the
  identical timeZone-resolution logic (`toWallClockDate` server-side,
  the equivalent inline in `System.tsx` client-side), closing the last gap
  between the two surfaces.
- **Not implemented (by design, per standing instruction):** any personal
  natal-chart data (birth date/time/place, sun/moon/rising sign), and no new
  QIE pattern minted this session — both re-deferred above with reasoning.

---

## PHASE 4 — DEPLOY

```
Branch: claude/practical-curie-d4r55x
Files changed: 5
  src/server/models/user.ts                                                              MODIFIED
  src/shared/types/index.ts                                                              MODIFIED
  src/client/utils/dayjs.ts                                                              MODIFIED
  src/client/components/System.tsx                                                       MODIFIED
  docs/assembly/2026-09-15_LOT-assembly_astrology-widget-timezone-personalization.md      ADDED
```

---

## PENDING / FUTURE WORK (carried forward)

- QIE auspicious-day-alignment pattern (`astrology` × `goals`/`intentions`,
  Taian-day nudge) — needs its own dedicated self-assembly pass (pattern
  number, archetype/job wiring, wiki + doctrine + lexicon + Field Manual
  sync). Still deferred, now for the second session running.
- `getJapaneseZodiac` / `getMoonEmoji` remain unused — would require new
  birth-year data collection, a product decision outside this routine's
  scope; held for S-2.
- Consider whether Settings' timeZone picker (if/where it exists) should
  surface a note that it now also drives the Astrology block's hour/cusp
  readings, since that dependency is new and not obvious from the Settings
  UI copy.

---

*LOT Self-Assembly Engine — automated session*
*COSMO Gate status: monitoring*
