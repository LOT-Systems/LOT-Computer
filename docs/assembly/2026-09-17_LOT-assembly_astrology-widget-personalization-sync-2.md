# LOT Self-Assembly Session Report
## 2026-09-17 | Astrology Widget — Personalization + Widget Sync | v2

**Branch:** `claude/practical-curie-eqc90o`
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

This is the second dedicated session on this recurring task. Its job was to
pick up the three deferred items left open in the first session's report
(`docs/assembly/2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md`).

---

## PHASE 0 — ORIENTATION / UNDERSTANDING

### Baseline verification

Confirmed the repo's current state matches the July 27 report's
"post-session" description exactly. `git log --oneline -- src/shared/utils/astrology.ts
src/client/stores/intentionEngine.ts src/server/utils/logs.ts` shows
`b75f65b feat(astrology): personalize, sync with QIE + Logs, fix staleness`
and merge `73edd95` already in this branch's history, and a direct read of
`astrology.ts`, `System.tsx`, `intentionEngine.ts`, `logs.ts`, `Logs.tsx`, and
`types/index.ts` confirmed all five July 27 deliverables (staleness fix,
moon-illumination surfacing, QIE signal wiring, Logs sync, doc) are present
and unmodified since.

### Current QIE state (not the July numbers — those are stale)

`git log --oneline --all -- docs/assembly/` and a direct read of the two most
recent QIE/wiki assembly reports
(`2026-08-04_LOT-assembly_qie-v113.md`, `2026-08-05_LOT-assembly_wiki-v87.md`)
established the true current counters, confirmed against the live file
(`intentionEngine.ts` itself, whose last pattern block is P151
`recovery-intelligence-arc`, last archetype `Arch51 Quantum Presence
Crystallizer`):

| Counter | Value as of session start |
|---|---|
| QIE patterns | 151 (P1–P151) |
| Archetypes | 51 (Arch1–Arch51) |
| Background jobs | 48 (J1–J48) |
| Dependency nodes | 190+ |
| Field Manual | v113 |
| Wiki | v87 |

No `docs/assembly/` commits exist between `8ac3690` (wiki v87, 2026-08-05) and
this session's start (`98971f2`, most recent unrelated commit being a badge
codex session), so these are the correct current numbers — next pattern is
**P152**.

### Reused-vs-new survey (for the new pattern's wiring)

`PHYSIOLOGICAL_ARCHETYPES` in `intentionEngine.ts` is a flat array where
array position == archetype number (verified by counting entries against the
labeled `// ── Arch39:` … `// ── Arch51:` comments, which land on the
expected ordinals). Position 16, **`Intention Executor`**
(`dominantSources: ['intentions', 'planner', 'goals']`,
`patternConditions: ['intention-follow-through', 'temporal-coherence-window',
'care-momentum']`), was identified as the correct existing archetype to
extend rather than minting a new one — it is already the goal/intention
-alignment-themed archetype the task asked to look for.

Surveyed how simple (non-meta) patterns are conventionally built, using P53
`intention-crystallization` and P54 `os-vitals-convergence` as templates: a
guard filter over `recentSignals`/`signals`, a `patterns.push({...})` with
`pattern`/`confidence`/`suggestedWidget`/`suggestedTiming`/`reason`. Also
established that **not every pattern gets a `PATTERN_DISPLAY` code, a
`Logs.tsx` COCKPIT LOG handler, or a background job** — only the
meta-pattern/QOS-ceiling class (P143–P151-style) gets that full treatment,
tied to a scheduled job that writes a real `Log` row server-side. Simple
signal-correlation patterns like P53/P54 do not have any of those. This
determined the correct minimal scope for the new P152 (see PHASE 1).

### timeZone-awareness survey

Confirmed the client had genuinely zero access to the user's saved profile
timeZone, as the July report suspected:
- `UserProfile` (`src/shared/types/index.ts`) did not include `timeZone`.
- `User.useProfileView()` (`src/server/models/user.ts`) explicitly
  `fp.pick()`s a field allowlist for `/api/me` that omitted `timeZone` even
  though the underlying `User` model column exists and is already used
  server-side by `getLogContext`.
- Client `dayjs` (`src/client/utils/dayjs.ts`) did not have the `timezone`
  plugin extended (only the server copy did) — `.tz()` was unavailable
  client-side.
- `stores.me` (`src/client/stores/state.ts`) is already populated at app
  boot via `getMe()` and already consumed inside `System.tsx`
  (`const me = useStore(stores.me)` at line 105), so once the field exists on
  the wire, no new data-fetching path was needed — this is "wire it in
  following an existing pattern," not new infrastructure.

### `getJapaneseZodiac`/`getMoonEmoji` survey

Re-checked the `User` model for any non-birth ambient field that could
legitimately drive `getJapaneseZodiac` (year → animal). Found `joinedAt` —
LOT's own account-founding date, not a birth date. Deliberately **not**
used: repurposing a join-year into a "your zodiac animal" framing would
still read as a natal-chart-style personality claim to the user, which is
exactly what the standing instruction excludes, and it would require new UI
surface for a facet nobody asked for. `getMoonEmoji`, by contrast, needs no
personal data at all — it is a pure function of the moon-phase string
already being computed every render — so it was safe to activate this
session (see PHASE 1).

---

## PHASE 1 — BUILD

### 1. New QIE pattern — P152 `auspicious-intention-alignment`

Added to `analyzeIntentions()` in `src/client/stores/intentionEngine.ts`,
directly after the P151 block:

```ts
// Pattern 152: Auspicious Intention Alignment — a goal or intention is declared while
// today's ambient astrology reading is a Taian (大安) day, the most auspicious day in
// the six-day rokuyo cycle. First pattern to react to the 'astrology' signal source
// (wired 2026-07-27, one ambient reading per calendar day) together with goal/intention
// -setting behavior. A same-day correlation between two already-flowing ambient signals —
// no natal-chart or personal astrology data involved, consistent with the ambient-only
// design. Feeds the existing Arch16 (Intention Executor) archetype rather than a new one.
const p152Astro = recentSignals.find(s => s.source === 'astrology' && s.metadata?.auspicious === true)
const p152Declarations = recentSignals.filter(s => s.source === 'goals' || s.source === 'intentions')
if (p152Astro && p152Declarations.length >= 1) {
  const p152Kind = p152Declarations[0].source === 'goals' ? 'goal' : 'intention'
  const p152Bonus = Math.min((p152Declarations.length - 1) * 0.03, 0.13)
  patterns.push({
    pattern: 'auspicious-intention-alignment',
    confidence: Math.min(0.72 + p152Bonus, 0.85),
    suggestedWidget: 'intentions',
    suggestedTiming: 'passive',
    reason: `Auspicious-day alignment — a ${p152Kind} was set on a Taian (大安) rokuyo day, the most auspicious day in the six-day cycle. Ambient reading and declared intent co-occurring today. Offered as an observation, not a directive.`,
  })
}
```

Detection logic: within the existing 24h `recentSignals` window, the pattern
fires when the day's `astrology` signal carries `metadata.auspicious === true`
(the Taian flag, already produced by `recordAstrologySignal` since the July
session) **and** at least one `goals` or `intentions` signal exists in the
same window. Confidence starts at 0.72 and rises modestly (+0.03 per extra
declaration, capped) with how many goals/intentions were set that day, capped
at 0.85 — deliberately below the QOS meta-pattern ceiling range (0.88–0.97)
since this is a soft ambient correlation, not a structural system state.
`suggestedTiming: 'passive'` — this is offered as an observation, never a
push/urgent nudge, matching the "gentle nudge" framing in the task and the
non-directive tone of the `reason` string itself.

**Wiring (reused, not invented):**
- **Archetype**: extended the existing `Intention Executor` archetype
  (array position 16 = Arch16) rather than minting a new one —
  `dominantSources` gained `'astrology'`, `patternConditions` gained
  `'auspicious-intention-alignment'`. This is exactly the fitting
  goal/intention-alignment-themed archetype the task pointed at.
- **Background job**: deliberately **not** added. Jobs in this codebase
  (48 for 151 patterns) exist only for the meta-pattern/QOS-ceiling class
  that needs server-side aggregation across a full day's `Log` rows (see
  PHASE 0 survey). P152 is a same-session client-side correlation of two
  already-flowing signals, the same class as P53/P54 — those have no jobs
  either. Inventing one here would be scope creep the task explicitly warned
  against.
- **`PATTERN_DISPLAY` / `Logs.tsx` COCKPIT LOG handler / `PatternRecognitionWidget.tsx`
  description**: deliberately **not** added, for the same reason — these are
  the meta-pattern-class treatment (tied to a real server `Log` event from a
  job), and P53/P54-class patterns don't carry them either. `PATTERN_DISPLAY`
  has a graceful fallback (auto-uppercased pattern name) for exactly this
  case, so nothing is unlabeled in the UI.
- **Dependency map** (`WIDGET_DEPENDENCY_MAP`): added `'astrology'` to the
  `goals` widget's upstream sources, dated `(2026-09-17 audit)` per the
  file's existing audit-comment convention — this is the "widget
  synchronization" half of the requirement: the cascade-invalidation graph
  now knows `goals` can be influenced by the ambient astrology signal, where
  before only `system` and `cosmic` (from the July session) carried that
  edge.
- **Logs sync**: no new `LogContext` field was needed. The Taian/auspicious
  condition is already fully derivable from the existing `astroRokuyo` field
  every log entry has carried since the July session
  (`auspicious ⇔ astroRokuyo === 'Taian'`) — adding a redundant boolean would
  duplicate data already synchronized with Logs.

### 2. Client-side dashboard timeZone-awareness

Wired the user's saved profile timeZone into the client for the first time:

- `src/shared/types/index.ts` — `UserProfile` gained
  `timeZone?: string | null`.
- `src/server/models/user.ts` — `User.useProfileView()`'s `fp.pick()`
  allowlist for `/api/me` now includes `'timeZone'` (one-line addition; the
  underlying column already existed and was already used server-side).
- `src/client/utils/dayjs.ts` — added the `dayjs/plugin/timezone.js` plugin
  (extended after `utc`, matching the exact plugin order already used in
  `src/server/utils/dayjs.ts`), giving the client `.tz()` for the first time.
- `src/client/components/System.tsx` — the `astrology` `useMemo` now reads
  `me?.timeZone` (the existing `stores.me` atom, already consumed in this
  component) and, when present, builds the wall-clock `Date` via the same
  `toWallClockDate`-style trick already used server-side in
  `getLogContext()` (`src/server/utils/logs.ts`), wrapped in a `try/catch`
  that falls back to device-local time on an invalid/unsupported IANA string.
  The `useMemo`'s dependency array now includes `me?.timeZone`.

Net effect: a user viewing the dashboard on a device set to a different
timeZone than their saved profile now sees the *same* ambient astrology
reading in `System.tsx` as gets snapshotted into their `Log` rows —
closing the gap the July report flagged. Logged-out users / users with no
saved timeZone are unaffected (falls back to device-local time exactly as
before).

### 3. `getJapaneseZodiac` / `getMoonEmoji`

- `getJapaneseZodiac` — left unused, by design (see PHASE 0 survey). No safe
  ambient use found; the only candidate field (`joinedAt`) would still read
  as a personality/natal claim to the end user, which is out of scope per
  the standing instruction. Left as a documented future candidate, unchanged.
- `getMoonEmoji` — activated. It requires zero personal data (pure function
  of the already-computed moon-phase string), so it was safe to wire in this
  session:
  - `System.tsx` — both render sites (compact `Block` and the cycling "pro"
    block) now show `{getMoonEmoji(moonPhase)} {moonPhase}` instead of the
    bare phase name.
  - `Logs.tsx` — the `SYS:` block's `ASTRO:` line now also renders the moon
    emoji, and additionally surfaces `astroMoonIllumination` (already present
    in `LogContext` since July, but never rendered in the journal until now)
    as `(n%)`.

---

## PHASE 2 — TEST

`node_modules` was absent in this session's container; ran
`npm install --legacy-peer-deps` to restore dependencies (same pre-existing
`@nanostores/react`/`nanostores` peer-version conflict noted in the July
report — worked around identically, not a code change).

```
npm run server:build   -> PASS (tsc --project tsconfig.server.json)
npm run client:build   -> PASS (postcss + esbuild client bundle)
npm run build          -> PASS (both, end to end)
```

Two pre-existing esbuild warnings (`Duplicate key "quarter_drop"` and
`"elixir_found"` in `src/client/utils/badges.ts`) appear in every client
build in this container and are unrelated to any file touched this session —
noted, not fixed, per the "don't fix unrelated pre-existing issues" scope
rule. Zero errors or new warnings attributable to this session's changes.

---

## PHASE 3 — FEATURES BREAKDOWN (current Astrology feature state, full picture)

### Compute layer
- **Math** (`src/shared/utils/astrology.ts`, pure/isomorphic, no external
  API): `getHourlyZodiac` (2h-period Japanese zodiac hour), `getWesternZodiac`
  (date-range Western sign), `getRokuyo` (6-day auspicious cycle, known
  anchor 2000-01-01 = Sensho), `getMoonPhase` (returns `{phase, illumination}`,
  known-new-moon anchor + 29.53059-day synodic period), `getMoonEmoji`
  (phase-name → emoji, **now active**, used in both client render sites and
  Logs), `getJapaneseZodiac` (year → 12-animal cycle, **still unused by
  design** — no safe ambient/non-natal data source exists to drive it).
- **Client compute site** (`System.tsx`, `astrology` `useMemo`): recomputes
  every 15 minutes while the tab is visible (`astrologyTick`, paused
  off-tab), and now additionally recomputes whenever the resolved profile
  timeZone (`me?.timeZone`) changes. Reads the user's saved profile timeZone
  when available (new this session, via `stores.me`), building a wall-clock
  `Date` the same way the server does; falls back to device-local time for
  logged-out/unsaved-timeZone users.
- **Server compute site** (`getLogContext()`, `src/server/utils/logs.ts`):
  unchanged this session — already timeZone-aware since July, using the
  identical wall-clock-passthrough trick the client now also uses.

### Render layer
- **Render site A** — compact/basic layout `Block label="Astrology:"`:
  `{westernZodiac} • {hourlyZodiac} • {rokuyo} • {moonEmoji} {moonPhase} (n%)`.
- **Render site B** — "pro" layout cycling block (Astrology → Psychology →
  My Journey → Biofield), same computed object, same moon-emoji-enriched
  string.
- **Logs journal** (`Logs.tsx`, `system_snapshot`/`SYS:` block): `ASTRO:
  {rokuyo} · {moonEmoji} {moonPhase} (n%)` — moon emoji and illumination
  percentage both newly surfaced this session; previously only rokuyo +
  bare phase name were shown.

### Personalization anchor
- Ambient reading is timeZone-aware **both** server-side (Logs, since July)
  **and** now client-side (dashboard display, this session) wherever a
  saved profile timeZone exists — closing the gap between the two that the
  July report flagged. Still strictly ambient: zodiac hour, Western sign,
  rokuyo, moon phase — no birth date/time/place anywhere in the data model
  (confirmed again this session; `User.joinedAt` exists but is deliberately
  not used for zodiac framing).

### Widget synchronization (QIE — `src/client/stores/intentionEngine.ts`)
- **Signal source**: `astrology` remains a Tier 0 raw-input source
  (`WIDGET_DEPENDENCY_MAP.astrology = []`), emitting one `ambient_reading`
  signal per calendar day via `recordAstrologySignal`, carrying
  `{rokuyo, moonPhase, moonIllumination, hourlyZodiac, westernZodiac,
  auspicious}`.
- **Dependency graph consumers**: `system`, `cosmic` (from July) **and now
  `goals`** (this session) — three widgets whose cascade-invalidation now
  accounts for the ambient astrology signal.
- **Patterns**: **P152 `auspicious-intention-alignment`** (new this session)
  — fires when a Taian-day reading and a goal/intention declaration co-occur
  within the 24h signal window. First pattern in the 152-pattern library to
  react to the `astrology` source.
- **Archetypes**: `Intention Executor` (Arch16) extended — now lists
  `astrology` as a dominant source and `auspicious-intention-alignment` as a
  qualifying pattern condition, alongside its existing
  `intention-follow-through`, `temporal-coherence-window`, `care-momentum`
  conditions.
- **Jobs**: none added — P152 is a same-session client-side pattern, the
  same infrastructure class as the majority of the 152-pattern library
  (only the meta-pattern/QOS-ceiling class gets dedicated background jobs;
  48 jobs cover 152 patterns).
- **Global QIE counters** (Field Manual / wiki-tracked, **not** bumped this
  session — see PENDING): patterns 151→152 (code-true as of this commit),
  archetypes stay at 51 (reused, not incremented), jobs stay at 48.

### Logs synchronization (`src/server/utils/logs.ts`, `LogContext`, `Logs.tsx`)
- Unchanged infrastructure, fully verified still intact: every log entry's
  `context` JSONB snapshot carries `astroRokuyo`, `astroMoonPhase`,
  `astroMoonIllumination`, `astroHourlyZodiac`, `astroWesternZodiac`,
  computed from the user's saved timeZone via `getLogContext()`.
- `Logs.tsx`'s `SYS:` block render **enriched** this session: now shows the
  moon emoji and the illumination percentage that were already present in
  every log's context but not previously displayed in the journal.
- P152's `auspicious` condition is fully derivable from existing
  `astroRokuyo` data already flowing into every log — no new `LogContext`
  field was needed to keep the new pattern in sync with Logs.

### Not implemented (by design, per standing instruction)
- Any personal natal-chart data (birth date/time/place, sun/moon/rising
  sign) — the feature remains strictly ambient/environmental.
- A "your founding-year zodiac animal" feature — technically available via
  `User.joinedAt` + the now-still-unused `getJapaneseZodiac`, but
  deliberately not built: it would read as a natal-chart-style personality
  claim to the user, which the standing instruction excludes, for a facet
  nobody asked for.

---

## PHASE 4 — DEPLOY

```
Branch: claude/practical-curie-eqc90o
Base commit: 98971f2
Files changed: 6
  src/client/stores/intentionEngine.ts     MODIFIED  (P152 · Arch16 rewire · dep map)
  src/client/components/System.tsx         MODIFIED  (timeZone-aware compute · moon emoji)
  src/client/components/Logs.tsx           MODIFIED  (moon emoji + illumination in SYS: block)
  src/client/utils/dayjs.ts                MODIFIED  (timezone plugin)
  src/server/models/user.ts                MODIFIED  (timeZone exposed via /api/me)
  src/shared/types/index.ts                MODIFIED  (UserProfile.timeZone)
  docs/assembly/2026-09-17_LOT-assembly_astrology-widget-personalization-sync-2.md  ADDED
```

---

## PENDING / FUTURE WORK

- **QIE global counter sync**: P152 is real and detecting in code (151→152
  patterns), but the Field Manual/wiki counters (`About.tsx`'s narrative
  counters, `docs/wiki/LOT-WIKI-v87.md`, FM version) were deliberately
  **not** bumped this session — that full sync (About.tsx counters,
  `PATTERN_DISPLAY`/`PatternRecognitionWidget.tsx` entries if a future
  session decides P152 warrants the fuller meta-pattern treatment, wiki
  vNN, FM vNNN, ledger append) belongs to the next dedicated QIE/wiki
  session, matching how those sessions already batch multiple patterns
  before syncing. This mirrors the July session's own precedent of scoping
  itself to code + this report, not the full wiki cadence.
- Consider whether P152 should eventually get a background job if usage
  data shows the Taian/goal-declaration correlation is common enough to be
  worth a daily server-side aggregate (`daily-auspicious-alignment-check`
  style) — no evidence either way yet; deferred until real signal exists.
- `getJapaneseZodiac` remains unused — no safe ambient (non-natal) data
  source identified this session either. Would need either genuine opt-in
  birth-year collection (explicitly out of scope) or a materially different
  framing than "your zodiac animal" to justify wiring `User.joinedAt` into
  it without it reading as natal-chart personalization.

---

*LOT Self-Assembly Engine — automated session*
*COSMO Gate status: monitoring*
