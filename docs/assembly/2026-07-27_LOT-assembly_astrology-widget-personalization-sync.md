# LOT Self-Assembly Session Report
## 2026-07-27 | Astrology Widget — Personalization + Widget Sync | v1

**Branch:** `claude/practical-curie-txifrq`
**Base commit:** `add997e`
**COSMO Gate:** Kuzya Cosmo Marmeladov — monitoring
**Session type:** Automated / Scheduled (recurring routine)
**Live site access:** not attempted — all work sourced from repo inspection

---

## MISSION BRIEF

Standing recurring instruction: continue evolving the Astrology block (today's
zodiac hour, moon phase, rokuyo — ambient conditions, not a personal natal
chart) for user personalization and synchronization with other widgets, keep
it synchronized with Logs entries, and push a full understanding + features
breakdown document each session.

---

## PHASE 0 — ORIENTATION / UNDERSTANDING

The Astrology block is **not** a standalone widget component — it is inlined
directly inside the master dashboard, `src/client/components/System.tsx`.
Full map of the feature as found at session start:

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure, isomorphic functions: `getHourlyZodiac`, `getWesternZodiac`, `getRokuyo`, `getMoonPhase`, `getJapaneseZodiac` (unused), `getMoonEmoji` (unused) |
| Compute site | `src/client/components/System.tsx:194` | `const astrology = useMemo(...)` — reads `new Date()` once |
| Render site A | `System.tsx` compact/basic layout | Static `Block label="Astrology:"` |
| Render site B | `System.tsx` "pro" layout | Cycling block: Astrology → Psychology → My Journey → Biofield, same computed object reused |
| Signal bus | `src/client/stores/intentionEngine.ts` (the QIE — Quantum Intention Engine) | Single nanostores atom + `WIDGET_DEPENDENCY_MAP` (~150 widget entries); **astrology had zero presence** — not a signal source, not in the dependency map |
| Logs | `src/server/utils/logs.ts` `getLogContext(user)` → `LogContext` (`src/shared/types/index.ts`) | Single shared function used by ~17 log-creation call sites in `src/server/routes/api.ts`; already snapshots weather + location + user timeZone per entry, astrology had no presence here either |
| Docs | `docs/technical/WIDGETS.md` | Lists astrology as a sub-feature of dashboard stack 4 ("Time & Environment"), not a first-class widget |

Confirmed **no natal-chart personalization data exists anywhere** (`User`
model has no birthDate/birthTime/birthPlace/lat-long — grepped for
birth/natal/zodiacSign, zero real hits). What *does* exist: `user.timeZone`,
`user.city`, `user.country` on the server `User` model. This matches the
standing instruction's framing — ambient conditions, not a natal chart — so
personalization this session is built on timeZone/location, not birth data.

Also found, while reading the render path: `moonIllumination` (0–100%) was
already computed by `getMoonPhase()` but silently discarded — never rendered
anywhere. And the `astrology` useMemo has a `[]` dependency array, meaning a
tab left open never re-derives the reading across a zodiac-hour or midnight
boundary — a real staleness bug, same class as the render-lag issues fixed in
prior sessions (LOT-SR-20260719-01).

---

## PHASE 1 — BUILD

### 1. Fixed staleness — periodic recompute, off-tab safe

`System.tsx`: added a `astrologyTick` state driven by a 15-minute
`setInterval`, gated on `!document.hidden` (matches the existing off-tab
background-work doctrine from the SystemProgressWidget/System perf fixes).
The `astrology` useMemo now depends on this tick instead of `[]`, so the
block re-derives across hour/day boundaries without polling on every render
and without doing work while the tab is backgrounded.

### 2. Surfaced moon illumination

Both render sites (compact layout + cycling "pro" block) now show
`{moonPhase} ({moonIllumination}%)` instead of discarding the percentage that
was already being computed.

### 3. Wired astrology into the QIE signal bus (widget synchronization)

`src/client/stores/intentionEngine.ts`:
- Added `'astrology'` to the `IntentionSignal['source']` union.
- Registered `astrology: []` as a new Tier 0 (raw input) entry in
  `WIDGET_DEPENDENCY_MAP`, dated `(2026-07-27 audit)` per the file's existing
  audit-comment convention.
- Added `'astrology'` as a dependency of the `system` and `cosmic` map
  entries — both widgets already consume/theme around it; this makes the
  cascade-invalidation graph (`getWidgetsDependingOn`) aware of the link,
  where before it was invisible to the dependency graph entirely.
- Added `recordAstrologySignal(rokuyo, moonPhase, moonIllumination,
  hourlyZodiac, westernZodiac)`, which records an `'astrology'` signal with
  `signal: 'ambient_reading'` and an `auspicious: rokuyo === 'Taian'` flag in
  metadata — the first piece of derived signal (not just raw display) this
  block has ever produced.

`System.tsx`: added a `useEffect` that calls `recordAstrologySignal` once per
calendar day (guarded via a `localStorage` date-stamp, the same throttling
pattern already used elsewhere in this codebase for journal-date tracking),
so the QIE gets exactly one ambient reading per day rather than one per
render.

Deliberately **not** done this session: minting a new QIE pattern/archetype
(a "PXXX auspicious-day-alignment" style composite) that reacts to the new
`astrology` source together with `goals`/`intentions`. The raw signal is now
flowing and registered in the dependency graph, which is the prerequisite;
authoring a full pattern (with wiki/doctrine/lexicon/Field-Manual version
bump) belongs to a dedicated self-assembly pass, not folded into this
routine.

### 4. Synchronized with Logs entries

`src/server/utils/logs.ts` — `getLogContext(user)` is the single function
already called from every log-creation path (~17 sites in `api.ts`) to
snapshot weather/location context onto each `Log` row. Extended it to also
snapshot the ambient astrology reading, computed from the **user's saved
timeZone** (not server-process time) via the same wall-clock-passthrough
trick already used for the existing `date` field:

```ts
function toWallClockDate(moment: dayjs.Dayjs): Date {
  return new Date(moment.year(), moment.month(), moment.date(), moment.hour(), moment.minute(), moment.second())
}
```

New `LogContext` fields (`src/shared/types/index.ts`): `astroRokuyo`,
`astroMoonPhase`, `astroMoonIllumination`, `astroHourlyZodiac`,
`astroWesternZodiac`. No migration needed — `context` is a free-form JSONB
column, already used this way for weather fields.

`src/client/components/Logs.tsx` — the `system_snapshot` (`SYS:`) log render
block, which already prints `POS:`/`TMP:`/`HUM:` from `log.context`, now also
prints `ASTRO: {rokuyo} · {moonPhase}` following the same label convention.

Net effect: every new log entry going forward carries the ambient
astrological reading it was created under, timeZone-aware per user, visible
in the journal alongside weather/location — the "synchronize with Logs
entries" requirement.

---

## PHASE 2 — TEST

Dependencies were not pre-installed in this session's container
(`node_modules` absent); ran `npm install --legacy-peer-deps` to restore them
(pre-existing `@nanostores/react`/`nanostores` peer-version conflict in
`package.json`, unrelated to this session — worked around with
`--legacy-peer-deps`, not a code change).

```
npm run server:build   -> PASS (tsc --project tsconfig.server.json)
npm run client:build   -> PASS (postcss + esbuild client bundle)
npm run build          -> PASS (both, end to end)
```

Zero errors attributable to this session's changes.

---

## PHASE 3 — FEATURES BREAKDOWN (current Astrology feature state, post-session)

- **Inputs:** zodiac hour, Western zodiac sign, rokuyo (six-day auspicious
  cycle), moon phase + illumination % — all pure date-math, no external API,
  no personal birth data.
- **Personalization anchor:** ambient reading is timeZone-aware wherever a
  server-side user context exists (Logs); client-side dashboard display still
  uses device-local time (unchanged — this is itself already a form of
  implicit personalization, since it reflects the device the user is
  actually looking at).
- **Freshness:** recomputes every 15 minutes while the tab is visible,
  instead of only once per mount.
- **Widget synchronization:** registered as a Tier 0 QIE signal source
  (`astrology`), consumed (per the dependency graph) by `system` and
  `cosmic`; emits one `ambient_reading` signal per calendar day, including an
  `auspicious` (Taian-day) flag other patterns can key off of in a future
  session.
- **Logs synchronization:** every new log entry's `context` JSONB snapshot
  now includes the ambient astrology reading at creation time, rendered in
  the journal's `SYS:` block next to weather/location.
- **Not implemented (by design, per standing instruction):** any personal
  natal-chart data (birth date/time/place, sun/moon/rising sign) — the
  feature remains strictly ambient/environmental.

---

## PHASE 4 — DEPLOY

```
Branch: claude/practical-curie-txifrq
Files changed: 5
  src/client/components/System.tsx        MODIFIED
  src/client/stores/intentionEngine.ts     MODIFIED
  src/server/utils/logs.ts                 MODIFIED
  src/shared/types/index.ts                MODIFIED
  src/client/components/Logs.tsx           MODIFIED
  docs/assembly/2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md  ADDED
```

---

## PENDING / FUTURE WORK

- Author a dedicated QIE pattern that reacts to the new `astrology` signal
  together with `goals`/`intentions` (e.g. surfacing a gentle nudge on
  auspicious/Taian days) — needs the full self-assembly treatment (pattern
  number, archetype/job wiring if warranted, wiki + doctrine + lexicon +
  Field Manual sync), intentionally deferred to a dedicated benchmark
  session rather than folded in here.
- Consider whether the client-side dashboard display should also read from
  `user.timeZone` (via a profile query) instead of device-local time, for
  users viewing the dashboard from a device set to a different timeZone than
  their saved profile — currently only the server-side Logs snapshot is
  timeZone-aware.
- `getJapaneseZodiac` (year-based animal) and `getMoonEmoji` remain unused;
  candidates for a future personalization pass (e.g. a "your birth year
  animal" opt-in) but out of scope while the feature stays ambient-only.

---

*LOT Self-Assembly Engine — automated session*
*COSMO Gate status: monitoring*
