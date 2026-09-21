# LOT Self-Assembly Session Report
## 2026-09-21 | Astrology Widget — Personalization + Widget Sync | v2

**Branch:** `claude/practical-curie-qv9nb8`
**Base commit:** `98971f2`
**COSMO Gate:** Kuzya Cosmo Marmeladov — monitoring
**Session type:** Automated / Scheduled (recurring routine)
**Live site access:** not attempted — all work sourced from repo inspection
**Prior session:** `docs/assembly/2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1) — all of that session's work has since landed on `master` via PR #96.

---

## MISSION BRIEF

Standing recurring instruction (unchanged since v1): continue evolving the
Astrology block (today's zodiac hour, moon phase, rokuyo — ambient conditions,
not a personal natal chart) for user personalization and synchronization with
other widgets, keep it synchronized with Logs entries, and push a full
understanding + features breakdown document each session.

---

## PHASE 0 — ORIENTATION / UNDERSTANDING (state inherited from v1, now on master)

Re-verified the full map from the v1 report is live on `master` and reachable
from this session's base commit:

| Piece | Location | State |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Unchanged — pure isomorphic functions |
| Compute site | `src/client/components/System.tsx` | `astrology` `useMemo`, now ticks every 15 min off a `document.hidden`-gated interval (v1 fix, confirmed live) |
| Signal bus | `src/client/stores/intentionEngine.ts` (QIE) | `astrology` is a registered Tier 0 source; `system` and `cosmic` depend on it; `recordAstrologySignal()` fires once/calendar-day via a `localStorage` date-stamp guard (v1, confirmed live) |
| Logs | `src/server/utils/logs.ts` → `getLogContext(user)` | Snapshots `astroRokuyo`/`astroMoonPhase`/`astroMoonIllumination`/`astroHourlyZodiac`/`astroWesternZodiac` onto every new `Log` row, computed from the user's saved `timeZone` (v1, confirmed live); rendered in `Logs.tsx`'s `SYS:` block as `ASTRO: {rokuyo} · {moonPhase}` |
| QIE patterns | `src/client/stores/intentionEngine.ts` | 151 patterns as of base commit (P1–P151, latest QIE v113 pass); **zero** of them referenced the `astrology` source in a rule body — the signal was flowing and registered in the dependency graph, but nothing consumed it yet. This was the explicit "pending" item carried over from v1. |

Confirmed still true: no natal-chart personalization data exists anywhere
(`User` model has no birthDate/birthTime/birthPlace/lat-long). What newly
matters this session: `User.timeZone` exists on the server model but was
**not** exposed on the client-facing `UserProfile` type or the `/api/me`
response (`useProfileView()`'s `fp.pick([...])` allowlist omitted it) — so
even though the server-side Logs snapshot has been timeZone-aware since v1,
the client dashboard's live `astrology` block had no way to read the user's
saved timeZone and was always computing off device-local time. This is the
exact gap v1's "PENDING / FUTURE WORK" section flagged but deferred.

---

## PHASE 1 — BUILD

### 1. Client-side personalization: dashboard reads the user's saved timeZone

Closes v1's first deferred item ("consider whether the client-side dashboard
display should also read from `user.timeZone`").

- `src/server/models/user.ts` — added `'timeZone'` to the `useProfileView()`
  pick allowlist. No migration: the column already exists on `User`; this
  only widens what the existing `/me` route serializes.
- `src/shared/types/index.ts` — added `timeZone?: string | null` to the
  `UserProfile` type so the client type matches the now-wider response.
- `src/client/utils/dayjs.ts` — extended the client dayjs singleton with the
  `dayjs/plugin/timezone.js` plugin (mirrors the server's existing
  `#server/utils/dayjs.ts` setup exactly). Additive: only adds `.tz()`, does
  not change any existing client dayjs call site.
- `src/client/components/System.tsx` — the `astrology` `useMemo` now reads
  `me?.timeZone` (the already-loaded `/api/me` profile atom) and, when set,
  builds the reading off `dayjs().tz(userTimeZone)` converted to a wall-clock
  `Date` (identical `toWallClockDate` trick already used server-side in
  `getLogContext`), instead of `new Date()`. Falls back to device-local time
  when the user has no saved timeZone (logged-out sessions, unset profile
  field) — no behavior change for those users. The memo's dependency array
  now includes `me?.timeZone` alongside the existing 15-minute tick.

Net effect: a user who lives in Tokyo but has their laptop's OS clock set to
UTC now sees a dashboard astrology reading anchored to their saved profile
timeZone, matching what Logs has already been recording since v1. The two
surfaces (live dashboard, historical Logs) are now on the same clock.

### 2. Widget synchronization: first QIE pattern reacting to the `astrology` signal

Closes v1's second deferred item (a dedicated pattern-authoring pass was
explicitly deferred to "a dedicated self-assembly pass, not folded into
[v1's] routine" — this is that pass).

`src/client/stores/intentionEngine.ts` — added **Pattern 152:
`auspicious-intention-alignment`** to `analyzeIntentions()`. Fires when:
- the day's `astrology` signal (recorded once/day by `recordAstrologySignal`)
  carries `metadata.auspicious === true` (i.e. today's rokuyo is Taian, 大安,
  the most favorable day in the six-day cycle), **and**
- at least one `goals` or `intentions` signal was also recorded in the same
  24h window.

Confidence starts at 0.62 and scales up to 0.80 with more goal/intention
activity that day. `suggestedWidget: 'cosmic'` (the widget that already
themes around the `astrology` source per `WIDGET_DEPENDENCY_MAP`),
`suggestedTiming: 'passive'` — a background nudge, not an interruption,
per the standing instruction's "ambient conditions" framing (this is
correlation the user can notice, explicitly not framed as causal/predictive
in the pattern's own `reason` text).

`src/client/components/QuantumEngineWidgets.tsx` — added
`'auspicious-intention-alignment': 'AUSP-ALIGN'` to `PATTERN_DISPLAY`, so the
pattern renders with a readable label in the QOS pattern list instead of
falling back to the raw slug.

This is the first pattern in the engine's history to key off the `astrology`
Tier 0 source at all — the prerequisite work from v1 (registering the source,
wiring the dependency graph, emitting the daily signal) is what made this a
same-session addition rather than a larger undertaking.

### 3. Logs synchronization

No changes needed — v1's Logs wiring (`getLogContext`, `LogContext` fields,
`Logs.tsx` render block) is already live on master and already timeZone-aware
per-user. Verified still correct and unaffected by this session's changes.

---

## PHASE 2 — TEST

Dependencies were not pre-installed in this session's container
(`node_modules` absent, as in v1); ran `npm install --legacy-peer-deps` to
restore them (same pre-existing `@nanostores/react`/`nanostores` peer-version
conflict noted in v1, unrelated to this session).

```
npm run server:build   -> PASS (tsc --project tsconfig.server.json)
npm run client:build   -> PASS (postcss + esbuild client bundle)
npm run build          -> PASS (both, end to end)
```

Two pre-existing esbuild warnings (`duplicate-object-key` on
`quarter_drop`/`elixir_found` in `src/client/utils/badges.ts`) are unrelated
to this session's diff — not touched, not introduced here.

Zero errors attributable to this session's changes.

---

## PHASE 3 — FEATURES BREAKDOWN (current Astrology feature state, post-session)

- **Inputs:** zodiac hour, Western zodiac sign, rokuyo (six-day auspicious
  cycle), moon phase + illumination % — all pure date-math, no external API,
  no personal birth data.
- **Personalization anchor:** ambient reading is now timeZone-aware on
  **both** surfaces — the server-side Logs snapshot (since v1) and, as of
  this session, the live client dashboard block — both anchored to the
  user's saved `User.timeZone` where set, with a clean fallback to
  device/server-local time where it is not.
- **Freshness:** recomputes every 15 minutes while the tab is visible
  (unchanged from v1), now also re-deriving if the user's saved timeZone
  changes mid-session.
- **Widget synchronization:** registered as a Tier 0 QIE signal source
  (`astrology`), consumed per the dependency graph by `system` and `cosmic`;
  emits one `ambient_reading` signal per calendar day with an `auspicious`
  (Taian-day) flag. As of this session, that flag is consumed: **Pattern 152
  (`auspicious-intention-alignment`)** fires when a Taian day coincides with
  goal/intention-setting activity, surfacing on the `cosmic` widget.
- **Logs synchronization:** unchanged from v1 — every new log entry's
  `context` JSONB snapshot includes the ambient astrology reading at
  creation time, rendered in the journal's `SYS:` block next to
  weather/location.
- **Not implemented (by design, per standing instruction):** any personal
  natal-chart data (birth date/time/place, sun/moon/rising sign) — the
  feature remains strictly ambient/environmental.

---

## PHASE 4 — DEPLOY

```
Branch: claude/practical-curie-qv9nb8
Files changed: 6
  src/client/components/System.tsx               MODIFIED
  src/client/stores/intentionEngine.ts            MODIFIED
  src/client/components/QuantumEngineWidgets.tsx  MODIFIED
  src/client/utils/dayjs.ts                       MODIFIED
  src/server/models/user.ts                       MODIFIED
  src/shared/types/index.ts                       MODIFIED
  docs/assembly/2026-09-21_LOT-assembly_astrology-widget-personalization-sync.md  ADDED
```

---

## PENDING / FUTURE WORK

- `getJapaneseZodiac` (year-based animal) and `getMoonEmoji` remain unused —
  still candidates for a future opt-in personalization pass (e.g. "your
  birth-year animal"), still out of scope while the feature stays
  ambient-only per the standing instruction.
- Pattern 152 is intentionally narrow (astrology + goals/intentions only).
  A future pass could widen it into a small family (e.g. an inverse
  "Butsumetsu-day gentle-pace" variant) once P152 has accumulated real usage
  to justify it — per the lexicon's "earn, don't decree" minting rule.
- The `moonPhase`/`moonIllumination` pairing is only consumed by the
  dashboard render and the Logs snapshot; no QIE pattern yet keys off moon
  phase specifically (only the rokuyo-derived `auspicious` flag). Worth
  revisiting once P152 shows real engagement data.

---

*LOT Self-Assembly Engine — automated session*
*COSMO Gate status: monitoring*
