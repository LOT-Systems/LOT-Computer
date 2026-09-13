# LOT Self-Assembly Session Report
## 2026-09-13 | Astrology Widget — Personalization + Widget Sync (continuation) | v2

**Branch:** `claude/practical-curie-r3ygjs`
**Base commit:** `98971f2`
**COSMO Gate:** Kuzya Cosmo Marmeladov — monitoring
**Session type:** Automated / Scheduled (recurring routine)
**Live site access:** not attempted — all work sourced from repo inspection
**Prior session:** `docs/assembly/2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1, merged to master)

---

## MISSION BRIEF

Standing recurring instruction: continue evolving the Astrology block (today's
zodiac hour, moon phase, rokuyo — ambient conditions, not a personal natal
chart) for user personalization and synchronization with other widgets, keep
it synchronized with Logs entries, and push a full understanding + features
breakdown document each session.

---

## PHASE 0 — ORIENTATION (state inherited from v1, verified live in repo)

v1 (2026-07-27) shipped and is confirmed merged to master (`73edd95` resolved
a `System.tsx` merge conflict importing both `recordAstrologySignal` and
`getCircadianPhase`, both present today):

- Staleness fix: `astrologyTick` 15-min interval, paused `!document.hidden`.
- Moon illumination surfaced in both render sites.
- `astrology` registered as a Tier 0 QIE signal source; dependency of `system`
  and `cosmic`; `recordAstrologySignal()` fires once/day with an `auspicious`
  (Taian-day) flag.
- Logs synchronization: `getLogContext()` snapshots `astroRokuyo` /
  `astroMoonPhase` / `astroMoonIllumination` / `astroHourlyZodiac` /
  `astroWesternZodiac` onto every new `Log.context`, timeZone-aware server-side.

v1 left three explicit PENDING items. This session closes two of them:

1. ~~Author a QIE pattern reacting to the `astrology` signal + `goals`/
   `intentions`~~ → **done this session** (P152, below).
2. ~~Client dashboard display still reads device-local time, not
   `user.timeZone`~~ → **done this session** (below).
3. `getJapaneseZodiac`/`getMoonEmoji` remain unused, floated as a future
   birth-year-animal opt-in → **still deferred**, unchanged: the standing
   instruction is explicit that this stays ambient/environmental, not a
   personal chart, so no birth-data field was added anywhere.

Also re-verified this session: no natal-chart data exists anywhere in the
`User` model (grepped again for birth/natal — zero hits beyond the existing
`timeZone`/`city`/`country`), and `PATTERN_DISPLAY`/lexicon convention was
read fresh from `QuantumEngineWidgets.tsx` and `PatternRecognitionWidget.tsx`
rather than assumed from the prior report.

---

## PHASE 1 — BUILD

### 1. Personalization: client dashboard now timeZone-aware

Found the actual gap while tracing why `user.timeZone` never reached
`System.tsx`: the server's `/me` route calls `req.user.useProfileView()`
(`src/server/models/user.ts`), which builds the client-facing `UserProfile`
via an `fp.pick([...])` allowlist — and `timeZone` was never in that list,
even though the `User` model has carried the column all along (it's exactly
what `getLogContext()` already reads for the Logs-side reading). So the
field was being silently dropped before it ever reached the browser.

Two-file fix to actually deliver it to the client:
- `src/server/models/user.ts` — added `'timeZone'` to the `useProfileView()`
  pick-list.
- `src/shared/types/index.ts` — added `timeZone: string | null` to the
  `UserProfile` type (previously present on the server-only `User` type, not
  the client-facing one).

With the field now flowing, `System.tsx`'s `astrology` `useMemo` reads
`me.timeZone` (via the existing `useProfile`/`stores.me`) and reuses the same
wall-clock-passthrough trick already established server-side in
`getLogContext()`:

```ts
const localMoment = me?.timeZone ? dayjs().tz(me.timeZone) : dayjs()
const now = new Date(
  localMoment.year(), localMoment.month(), localMoment.date(),
  localMoment.hour(), localMoment.minute(), localMoment.second()
)
```

falling back to plain `dayjs()` (device-local, the prior behavior
unchanged) when no `timeZone` is saved. The client `dayjs` instance
(`src/client/utils/dayjs.ts`) did not carry the `timezone` plugin the server
instance already had — added it alongside the existing `utc` plugin so
`.tz()` resolves. Net effect: an operator who saved a `timeZone` in Settings
now sees the *same* zodiac hour / rokuyo day on the dashboard as gets
written into their Logs entries, even if their device clock is set to a
different zone (e.g. traveling) — closing a real personalization gap, not a
cosmetic one.

### 2. Widget synchronization: Pattern 152 — Auspicious Alignment

v1 wired the raw `astrology` signal into the QIE dependency graph but
deliberately minted no pattern consuming it, calling that "a dedicated
self-assembly pass." This session is that pass, scoped to the pattern
itself (no new archetype or scheduled job — those come in the codebase's
usual batches of three; minting one for a single new pattern would be
invention, not something earned by precedent).

`src/client/stores/intentionEngine.ts`, added directly after Pattern 151:

```ts
// Pattern 152: Auspicious Alignment
const p152Cut        = now - 24 * 60 * 60 * 1000
const p152Auspicious = signals.filter(s => s.source === 'astrology' && s.timestamp > p152Cut && s.metadata?.auspicious === true)
const p152Intent     = signals.filter(s => s.timestamp > p152Cut && ((s.source === 'intentions' && s.signal === 'intention_set') || s.source === 'goals'))
if (p152Auspicious.length >= 1 && p152Intent.length >= 1) {
  patterns.push({ pattern: 'auspicious-alignment', confidence: Math.min(0.60 + p152Intent.length * 0.05, 0.78), suggestedWidget: 'system', suggestedTiming: 'passive', reason: `AUSPALIGN: ...` })
}
```

Fires when an `intention_set` or any `goals` signal lands within 24h of the
day's ambient reading reporting `auspicious: true` (rokuyo === 'Taian').
Explicitly not a causal or astrological claim — it is a coincidence-of-timing
pattern, same epistemic status as every other QIE pattern (behavioral
correlation, not prediction). It is the first pattern that actually *reads*
the `astrology` source rather than just registering it as a dependency —
this is what "widget synchronization" means concretely for this feature.

Registered display label `AUSPALIGN` in `QuantumEngineWidgets.tsx`
`PATTERN_DISPLAY`, and the name/description in `PatternRecognitionWidget.tsx`
(`'Auspicious alignment — intention or goal set within 24h of a Taian
(auspicious) rokuyo reading (P152)'`) — the two client-side registries every
prior pattern was found registered in.

### 3. Logs synchronization — verified unchanged, still correct

Re-checked `getLogContext()` / `Logs.tsx` `ASTRO:` render block from v1: both
intact, both still the single source of truth for the Logs-side reading. No
changes needed here this session — the personalization gap was specifically
on the *dashboard* side, which is now closed to match.

---

## PHASE 2 — TEST

`node_modules` was absent again this session (fresh container) —
`npm install --legacy-peer-deps` restored it (~700 packages, pre-existing
`@nanostores/react` peer conflict, unrelated).

```
npm run build          -> PASS (client esbuild + server tsc, both green)
```

`npm run build` does not type-check client files (esbuild transpiles only —
`server:build`'s `tsc` only covers `tsconfig.server.json`). To verify this
session's client edits introduced no regressions the build gate itself can't
see, ran `npx tsc --noEmit -p tsconfig.json` before AND after this session's
changes (via `git stash`): **128 diagnostic lines both times, identical** —
every type error in the client tree pre-exists this session; zero
attributable to these changes. Documented here rather than silently
suppressed, per the honesty-boundary rule: this codebase's client half is
not currently type-clean, and this session neither fixed nor worsened that.

---

## PHASE 3 — FEATURES BREAKDOWN (current Astrology feature state, post-session)

- **Inputs:** zodiac hour, Western zodiac sign, rokuyo (six-day auspicious
  cycle), moon phase + illumination % — pure date-math, no external API, no
  personal birth data.
- **Personalization:** dashboard display AND Logs snapshot are now both
  timeZone-aware from the operator's saved `Settings → timeZone`, using the
  identical wall-clock-passthrough technique on both client and server; falls
  back to device-local time only when no `timeZone` is saved (unchanged
  default for new/unconfigured accounts).
- **Freshness:** recomputes every 15 minutes while the tab is visible
  (unchanged from v1).
- **Widget synchronization:** Tier 0 QIE source, depended on by `system` and
  `cosmic`; now also *consumed*, not just registered — Pattern 152
  (`auspicious-alignment`) reacts to it alongside `intentions`/`goals`,
  visible in `PatternInsightsWidget`/`QuantumEngineWidgets` like any other
  recognized pattern.
- **Logs synchronization:** unchanged from v1 — every new log entry's
  `context` carries the ambient reading at creation time, rendered in the
  journal's `SYS:` block.
- **Not implemented (by design, per standing instruction):** any personal
  natal-chart data (birth date/time/place, sun/moon/rising sign) — the
  feature remains strictly ambient/environmental. `getJapaneseZodiac` /
  `getMoonEmoji` remain unused, still floated as a future opt-in, still out
  of scope.

---

## PHASE 4 — DEPLOY

```
Branch: claude/practical-curie-r3ygjs
Files changed: 9
  src/client/components/System.tsx                MODIFIED
  src/client/utils/dayjs.ts                        MODIFIED
  src/shared/types/index.ts                        MODIFIED
  src/server/models/user.ts                        MODIFIED
  src/client/stores/intentionEngine.ts             MODIFIED
  src/client/components/QuantumEngineWidgets.tsx   MODIFIED
  src/client/components/PatternRecognitionWidget.tsx MODIFIED
  docs/benchmark/LOT-SR-20260913-01.md             ADDED
  docs/assembly/2026-09-13_LOT-assembly_astrology-widget-personalization-sync.md ADDED
```

---

## PENDING / FUTURE WORK

- `getJapaneseZodiac`/`getMoonEmoji` — birth-year-animal opt-in, still
  deliberately out of scope while ambient-only.
- P152 has no archetype or scheduled job yet, matching how single-pattern
  additions between batches are usually left — a future batch of three
  patterns is the natural point to revisit whether an "Auspicious Operator"
  archetype is warranted, not before.
- Logs → astrology is still one-way (astrology writes into logs; nothing
  reads Logs history back for, e.g., a Taian-day streak trend) — noted, not
  started.

---

*LOT Self-Assembly Engine — automated session*
*COSMO Gate status: monitoring*
