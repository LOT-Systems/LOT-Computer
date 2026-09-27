# LOT Self-Assembly Session Report
## 2026-09-27 | Astrology Widget — Personalization + Widget Sync | v2

**Branch:** `claude/practical-curie-h6dysb`
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

## PHASE 0 — ORIENTATION / RE-AUDIT

Re-read the feature end to end against the v1 report's map and its three
"PENDING / FUTURE WORK" items, two months and ~30 assembly sessions later
(intervening work was QIE/wiki/badge cycles — none touched astrology).
Confirmed still true:

| Piece | Location | State since v1 |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Unchanged. `getJapaneseZodiac` still unused; `getMoonEmoji` was still unused (fixed this session, see below). |
| Freshness | `System.tsx` `astrologyTick` (15 min, off-tab paused) | Unchanged, working as designed. |
| QIE signal | `recordAstrologySignal` (`intentionEngine.ts`), Tier 0 `astrology` source, `system`/`cosmic` depend on it | Unchanged, confirmed still wired (merge commit `73edd95` landed it cleanly alongside `getCircadianPhase` from a parallel session — no conflict-induced regression). |
| Logs sync | `getLogContext` (`src/server/utils/logs.ts`) | Unchanged, confirmed still timeZone-aware server-side and still rendered in `Logs.tsx`'s `SYS:` block. |
| Client display | `System.tsx` astrology `useMemo` | Still read `new Date()` — **device**-local time only, never the user's *saved* timeZone. This was v1's pending item #2. |

New finding this session: `QuantumSignWidget.tsx` computes its own, unrelated
`astrologyPatches` array (a static day-of-year-indexed content list, labeled
"Astrology:" in its UI) that does **not** call into `shared/utils/astrology.ts`
and is not registered as the `astrology` QIE source — a naming collision, not
a functional dependency. Left untouched this session (it's a different
feature — a rotating content patch, not an ambient reading — and changing its
content/behavior wasn't asked for); flagged here so a future pass doesn't
assume it's already synchronized just because the label matches.

Checked whether any of the two months of intervening work added a
personalization anchor (birth date/year, natal fields) to the `User` model —
still none (grepped `birth|natal|zodiacSign` across `src`, zero hits beyond
the ambient-astrology code itself). The "ambient conditions, not a natal
chart" framing continues to hold as this session's constraint.

---

## PHASE 1 — BUILD

### 1. Client-side timeZone personalization (v1 pending item #2)

Previously, the dashboard's astrology block always read `new Date()` — the
viewing device's local clock — even for a user who has a saved home timeZone
in Settings different from the device they're currently on. The Logs
snapshot (server-side) was already timeZone-aware; the live dashboard display
wasn't.

- `src/shared/types/index.ts` — added `timeZone?: string | null` to
  `UserProfile` (the client-facing user shape), with a comment explaining why.
- `src/server/models/user.ts` — `useProfileView()` now picks `timeZone` into
  the profile payload alongside the existing fields, so it reaches the client
  via the same `/me`-style endpoint already in use — no new endpoint, no
  migration (the column already exists on `User`).
- `src/client/utils/dayjs.ts` — added the `dayjs/plugin/timezone.js` plugin
  (client dayjs previously had `utc` but not `timezone`, so `.tz()` wasn't
  available client-side; server's `dayjs.ts` already had both).
- `src/client/components/System.tsx` — the `astrology` `useMemo` now checks
  `me?.timeZone`: when set, it builds the reading from the user's home
  timeZone via the same wall-clock-passthrough trick already used
  server-side in `getLogContext` (`new Date(local.year(), local.month(), ...)`
  from a `dayjs().tz(timeZone)` moment, so `astrology.ts`'s
  `getHours()`/`getMonth()`/`getDate()` readers see the right wall-clock
  values regardless of the browser's own timeZone); falls back to
  device-local `new Date()` when no timeZone is saved, which is the same
  behavior as before. Added `me?.timeZone` to the memo's dependency array.

Net effect: two people viewing the same account from different timeZone
devices (e.g. traveling) now see the *same* rokuyo/moon-phase/zodiac-hour
reading — anchored to their saved home timeZone — instead of each device
silently computing its own.

### 2. Surfaced the moon emoji (v1 pending item #3, partial)

`getMoonEmoji()` existed since before v1 and was computed nowhere. Both
render sites (compact layout line and the cycling "pro" block) now show it
inline: `{rokuyo} • {moonEmoji} {moonPhase} ({illumination}%)`. Small, but it
was free — the function already existed and took a phase name it already had
in hand.

`getJapaneseZodiac` (year-based animal) remains unused. Adding it would need
a birth-year input, which per the standing ambient-only constraint is out of
scope for this routine without further instruction — left as-is, same as v1.

### 3. Widget synchronization — re-verified, no new dependency-map changes needed

Checked every widget added or touched since v1 (`CosmicUpdateWidget`,
`ChakraErgonomicsWidget`, `QuantumSignWidget`, and others in the July–August
QIE/badge sessions) for any that read moon-phase/zodiac/rokuyo data and
should therefore be added as consumers of the `astrology` Tier 0 signal in
`WIDGET_DEPENDENCY_MAP`. None do (`CosmicUpdateWidget`'s one "moon" hit is an
unrelated image-generation prompt string). `system` and `cosmic` remain the
only real consumers, which is already correctly registered — no code change
needed here this session.

### 4. Logs synchronization — re-verified, already correct

`getLogContext` already computes the ambient reading from the user's
timeZone-aware wall clock (not server-process time) and stamps it onto every
new `Log.context`; `Logs.tsx` already renders it in the `SYS:` block. No
changes needed — confirmed still working end to end.

---

## PHASE 2 — TEST

```
npm install --legacy-peer-deps   -> OK (pre-existing peer-dep conflict, unrelated to this session)
npm run build                    -> PASS
  client:build (postcss + esbuild)  -> PASS (2 pre-existing duplicate-key
                                       warnings in badges.ts, unrelated)
  server:build (tsc --project tsconfig.server.json)  -> PASS
```

A broader `tsc --noEmit -p tsconfig.json` run surfaces pre-existing errors
elsewhere in the tree (`AdminUser.tsx`, `MicroGameWidget.tsx`, several
`intentionEngine.ts` string-literal-union mismatches) — none in the files
touched this session, and none newly introduced; the project's actual build
pipeline (`tsconfig.server.json` + esbuild) is what's exercised by
`npm run build` and is green.

---

## PHASE 3 — FEATURES BREAKDOWN (current Astrology feature state, post-session)

- **Inputs:** zodiac hour, Western zodiac sign, rokuyo (six-day auspicious
  cycle), moon phase + illumination % + emoji — all pure date-math, no
  external API, no personal birth data.
- **Personalization anchor:** the reading is now timeZone-aware **both**
  server-side (Logs, since v1) **and** client-side (live dashboard, new this
  session) whenever the user has a saved `timeZone`; falls back to
  device-local time when they don't, which was the only behavior before v1.
- **Freshness:** recomputes every 15 minutes while the tab is visible,
  paused when backgrounded (`document.hidden`), and re-derives immediately if
  the user's saved timeZone changes.
- **Widget synchronization:** registered as a Tier 0 QIE signal source
  (`astrology`), consumed by `system` and `cosmic` per the dependency graph;
  emits one `ambient_reading` signal per calendar day with an `auspicious`
  (Taian-day) flag. Re-audited this session — no other widget currently
  needs this dependency wired in.
- **Logs synchronization:** every new log entry's `context` JSONB snapshot
  includes the ambient astrology reading (rokuyo, moon phase + illumination,
  hourly + Western zodiac) at creation time, timeZone-aware per user,
  rendered in the journal's `SYS:` block next to weather/location.
- **Known non-integration (by design):** `QuantumSignWidget`'s own
  "Astrology:"-labeled content patches are a separate, unrelated feature (a
  day-of-year-indexed static list) and are not fed by or synchronized with
  this engine — noted for future disambiguation, not merged.
- **Not implemented (by design, per standing instruction):** any personal
  natal-chart data (birth date/time/place, sun/moon/rising sign) — the
  feature remains strictly ambient/environmental.

---

## PHASE 4 — DEPLOY

```
Branch: claude/practical-curie-h6dysb
Files changed: 5
  src/client/components/System.tsx        MODIFIED
  src/client/utils/dayjs.ts               MODIFIED
  src/server/models/user.ts               MODIFIED
  src/shared/types/index.ts               MODIFIED
  docs/assembly/2026-09-27_LOT-assembly_astrology-widget-personalization-sync.md  ADDED
```

---

## PENDING / FUTURE WORK

- Author a dedicated QIE pattern that reacts to the `astrology` signal
  together with `goals`/`intentions` (e.g. a gentle nudge on auspicious/Taian
  days) — still deferred; needs the full self-assembly treatment (pattern
  number, archetype/job wiring, wiki + doctrine + lexicon + Field Manual
  sync), which belongs to a dedicated benchmark session rather than this
  lighter recurring routine. Carried over from v1 unchanged.
- `getJapaneseZodiac` (year-based animal) remains unused; would need a
  birth-year opt-in field (new profile input, not currently collected
  anywhere) to activate — still out of scope while no such field exists and
  the feature stays ambient-only by design.
- Consider whether `QuantumSignWidget`'s separate "Astrology:" content patches
  should eventually be renamed or merged to avoid the two-systems-same-label
  confusion flagged this session — not touched, since its patch content looks
  intentional and unrelated to ambient rokuyo/moon data.

---

*LOT Self-Assembly Engine — automated session*
*COSMO Gate status: monitoring*
