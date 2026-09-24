# LOT Self-Assembly Session Report
## 2026-09-24 | Astrology Widget — TimeZone Personalization | v2

**Branch:** `claude/practical-curie-e58zz0`
**Base commit:** `98971f2`
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

This is the second recorded session against this standing instruction. The
first (`2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md`,
commit `b75f65b`) had already: fixed a `[]`-dependency staleness bug (15-min
recompute tick, off-tab safe), surfaced the previously-discarded
`moonIllumination` percentage, wired the block into the QIE signal bus as a
Tier 0 `astrology` source (`recordAstrologySignal`, once/day, with an
`auspicious: rokuyo === 'Taian'` flag), and synchronized every Logs entry's
`context` JSONB snapshot with the ambient reading computed from the user's
saved server-side `timeZone` (`getLogContext` in `src/server/utils/logs.ts`).

Re-verified all of that is still live and unchanged in the current tree
(`System.tsx`, `intentionEngine.ts`, `logs.ts`, `Logs.tsx` — no drift since
`b75f65b`; `73edd95` was a benign merge-conflict resolution, not a
functional change to this feature).

That first session's own "PENDING / FUTURE WORK" section named three
candidates for the next pass:

1. Author a dedicated QIE pattern reacting to `astrology` + `goals`/`intentions`.
2. Make the **client-side** dashboard display timeZone-aware (only the
   server-side Logs snapshot was, at that point) — a user viewing the
   dashboard from a device set to a different timeZone than their saved
   profile would see a reading that didn't match what their Logs carried.
3. Consider surfacing `getJapaneseZodiac` (unused) as an opt-in personalization.

Investigated all three this session before picking one to build:

- **(2) was the clean, self-contained, genuinely still-missing piece** — the
  client `useMemo` at `System.tsx` still read `new Date()` unconditionally.
  Traced why: `UserProfile` (`src/shared/types/index.ts`), the type behind
  the client's `stores.me` atom, never carried `timeZone` — only the
  server-side `User` model did. `User.useProfileView()`
  (`src/server/models/user.ts`) already `fp.pick()`s `city`/`country` onto
  the client profile the same way; `timeZone` was simply never added to that
  pick list. Straightforward, additive, no schema/migration needed.

- **(1) was deliberately built and then reverted this session.** Drafted
  Pattern 152 (`auspicious-alignment`: Taian-day reading + same-day
  `goals`/`intentions` signal), confirmed it typechecks and builds cleanly
  against `IntentionPattern`. But authoring a QIE pattern in this codebase
  is not just adding a `patterns.push(...)` block — every existing pattern
  (P1–P151) is cross-referenced by a live, hardcoded pattern-count display
  (`About.tsx`: `"151 patterns active"`), by short-code registries
  (`QuantumEngineWidgets.tsx`), by description registries
  (`PatternRecognitionWidget.tsx`), and by the wiki/doctrine/lexicon/Field
  Manual version chain that the `lot-benchmark` self-assembly protocol
  maintains. The first astrology session explicitly named this exact
  tradeoff and deferred pattern-authoring to "a dedicated self-assembly
  pass, not folded into this routine." Landing P152 here without bumping
  the counters it's cross-referenced from would silently desync the live
  `About.tsx` display (151 vs. the true 152) — a drift bug of the same
  class this codebase is otherwise careful to avoid. Respected that
  boundary again this session rather than re-litigating it; the pattern
  draft was discarded, not committed. `git diff --stat` confirms zero trace
  remains outside the four files below.

- **(3)** stays out of scope while the feature is ambient-only (no
  personalization surface asked for a birth-year animal), unchanged from
  the first session's framing.

---

## PHASE 1 — BUILD

### TimeZone-aware client-side ambient reading

**`src/shared/types/index.ts`** — added `timeZone?: string | null` to
`UserProfile`, next to the existing `city`/`country`/`hideActivityLogs`
fields it already exposes from the server `User` model.

**`src/server/models/user.ts`** — added `'timeZone'` to the `fp.pick([...])`
list inside `useProfileView()`. This is the single function that shapes
every `/api/me`-style response; no other server change was needed — `getMe()`
on the client already round-trips whatever this function returns onto
`stores.me`.

**`src/client/utils/dayjs.ts`** — added the `dayjs/plugin/timezone.js`
extend (alongside the existing `utc` plugin it depends on). The client
dayjs instance previously had no `timezone` plugin at all; the server one
(`src/server/utils/dayjs.ts`) already did, which is what made the
server-side Logs snapshot timeZone-aware in the first place.

**`src/client/components/System.tsx`** — the `astrology` `useMemo` now
mirrors the exact wall-clock-passthrough trick `getLogContext` uses
server-side: when `me?.timeZone` is set, builds a `Date` from
`dayjs().tz(me.timeZone)`'s wall-clock fields (`year`/`month`/`date`/`hour`/
`minute`/`second`) via the plain `Date` constructor, so the `astrology.ts`
readers (`getHours()`, `getMonth()`, `getDate()`, ...) see the user's saved
local time regardless of the device's own timeZone. Falls back to
`new Date()` (device-local) when no profile timeZone is set — matching
`getLogContext`'s own fallback and preserving current behavior for every
user who hasn't set one. Added `me?.timeZone` to the memo's dependency
array so the reading recomputes once the profile finishes loading, not just
on the existing 15-minute tick.

Net effect: the dashboard display and every Logs entry now derive the
ambient astrology reading from the *same* source of truth (the user's saved
`timeZone`) instead of the dashboard silently using whatever timeZone the
viewing device happens to be set to. Closes future-work item (2) from the
first session.

---

## PHASE 2 — TEST

Dependencies were not pre-installed in this session's container
(`node_modules` absent, same as the first session); restored with
`npm install --legacy-peer-deps` (pre-existing `@nanostores/react`/
`nanostores` peer-version conflict, unrelated to this session's change).

```
npm run server:build   -> PASS (tsc --project tsconfig.server.json)
npm run client:build   -> PASS (postcss + esbuild client bundle)
```

Client build emits two pre-existing `esbuild` "duplicate object key"
warnings in `src/client/utils/badges.ts` (`quarter_drop`, `elixir_found`) —
unrelated to this session, not touched.

Zero errors or new warnings attributable to this session's changes.

---

## PHASE 3 — FEATURES BREAKDOWN (current Astrology feature state, post-session)

- **Inputs:** zodiac hour, Western zodiac sign, rokuyo (six-day auspicious
  cycle), moon phase + illumination % — pure date-math, no external API, no
  personal birth data.
- **Personalization anchor:** ambient reading is now timeZone-aware
  end-to-end — both the server-side Logs snapshot (`getLogContext`, since
  the first session) and the client-side dashboard display (`System.tsx`,
  this session) read from the same `user.timeZone`, falling back to
  server-process time / device-local time respectively when a user hasn't
  set one.
- **Freshness:** recomputes every 15 minutes while the tab is visible
  (unchanged), plus now also recomputes when the profile's `timeZone`
  becomes available or changes.
- **Widget synchronization:** registered as a Tier 0 QIE signal source
  (`astrology`), consumed per the dependency graph by `system` and
  `cosmic`; emits one `ambient_reading` signal per calendar day with an
  `auspicious` (Taian-day) flag (unchanged from first session — no new QIE
  pattern consumes it yet; see Pending).
- **Logs synchronization:** every new log entry's `context` JSONB snapshot
  includes the ambient astrology reading at creation time, rendered in the
  journal's `SYS:` block next to weather/location (unchanged from first
  session).
- **Not implemented (by design, per standing instruction):** any personal
  natal-chart data (birth date/time/place, sun/moon/rising sign) — the
  feature remains strictly ambient/environmental.

---

## PHASE 4 — DEPLOY

```
Branch: claude/practical-curie-e58zz0
Files changed: 4
  src/shared/types/index.ts                MODIFIED
  src/server/models/user.ts                MODIFIED
  src/client/utils/dayjs.ts                MODIFIED
  src/client/components/System.tsx         MODIFIED
  docs/assembly/2026-09-24_LOT-assembly_astrology-widget-timezone-personalization.md  ADDED
```

---

## PENDING / FUTURE WORK

- **Author the `astrology` + `goals`/`intentions` QIE pattern** (drafted and
  reverted this session — see Phase 0). Needs the full self-assembly
  treatment: pattern number (next is P152), short-code + description
  registry entries (`QuantumEngineWidgets.tsx`,
  `PatternRecognitionWidget.tsx`), and the live pattern-count display
  (`About.tsx`, currently `"151 patterns active"`) bumped in the same pass
  — plus whatever wiki/doctrine/lexicon/Field Manual sync the
  `lot-benchmark` protocol requires for a new pattern. Explicitly a job for
  a dedicated "Benchmark"-triggered session, not this recurring routine.
- `getJapaneseZodiac` (year-based animal) and `getMoonEmoji` remain unused;
  still a candidate for a future opt-in personalization pass, out of scope
  while the feature stays ambient-only.
- Consider whether other widgets beyond `system`/`cosmic` in
  `WIDGET_DEPENDENCY_MAP` should declare `astrology` as a dependency now
  that the reading is fully personalized end-to-end — deferred pending the
  QIE pattern work above, since that's what would give a widget an actual
  reason to consume the signal rather than a nominal graph edge.

---

*LOT Self-Assembly Engine — automated session*
*COSMO Gate status: monitoring*
