# LOT Self-Assembly Session Report
## 2026-11-19 | Astrology Block — Personal Resonance + Logs Sync | v2

**Branch:** `claude/practical-curie-4xxa5l`
**Base commit:** `9f2b88c`
**Previous session:** `docs/assembly/2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)
**Session type:** Automated / Scheduled (recurring routine)
**Scope guard:** ambient conditions only — no birth data, no natal chart

---

## MISSION BRIEF

Standing instruction: evolve the Astrology block (zodiac hour, moon phase,
rokuyo) for user personalization and cross-widget synchronization, keep it
synchronized with Logs entries, and push a full understanding + features
breakdown each session.

---

## PHASE 0 — UNDERSTANDING (system map, as of this session)

| Piece | Location | Role |
|---|---|---|
| Math + personalization | `src/shared/utils/astrology.ts` | Isomorphic. Raw cycles (`getHourlyZodiac`, `getWesternZodiac`, `getRokuyo`, `getMoonPhase`) **plus new** `getAstrologyReading`, `toWallClockInTimeZone`, `computeAstroResonance`, `getResonanceMatches`, `formatAstroContext`, `ROKUYO_GUIDANCE` |
| Dashboard compute | `src/client/components/System.tsx` | `astrology` memo (15-min tick, off-tab paused), now timeZone-aware via `me.timeZone`; `astroResonance` from `useLogs()` |
| Dashboard render | `System.tsx` — compact `Block "Astrology:"` + cycling pro block (Astrology → Psychology → My Journey → Biofield) | 3 lines: reading, rokuyo guidance, personal resonance |
| Signal bus | `src/client/stores/intentionEngine.ts` `recordAstrologySignal` | Tier 0 source `astrology`; consumed by `system`, `cosmic` in `WIDGET_DEPENDENCY_MAP` |
| Logs write path | `src/server/utils/logs.ts` `getLogContext(user)` | Every log row's `context` JSONB snapshots `astroRokuyo/astroMoonPhase/astroMoonIllumination/astroHourlyZodiac/astroWesternZodiac` |
| Logs read path | `src/client/components/Logs.tsx` | `SYS:` block `ASTRO:` line + **new** astro footer on every note/entry |
| Types | `src/shared/types/index.ts` `LogContext` | `astro*` optional fields (unchanged this session) |

**The loop this session closes:** Logs entries snapshot the ambient reading →
the dashboard reads the user's Logs back → derives which conditions *this
user* writes under → shows it in the Astrology block and pushes the match
into the QIE signal bus for other widgets. Personalization comes from the
user's own behavior, not from birth data.

---

## PHASE 1 — BUILD

### 1. Bug fix — rokuyo flipped at UTC midnight, not local midnight
`getRokuyo` diffed `date.getTime()` against `new Date('2000-01-01')` (UTC
midnight). A user at UTC−8 saw *tomorrow's* rokuyo from 4 PM local onward;
pre-2000 dates produced a negative array index (`undefined`). Now computes a
day number from local calendar fields via `Date.UTC(y, m, d)` with a
non-negative modulo. Continuity verified: 1999-12-31 = Shakku → 2000-01-01 = Sensho.

### 2. Bug fix — moon phase was shifted by timeZone offset in Logs
v1's server `toWallClockDate` fed a wall-clock-shifted Date into
`getMoonPhase`, which uses the absolute instant — skewing the lunar phase by
the user's UTC offset (up to ±14 h). New `getAstrologyReading(instant, tz)`
uses wall-clock time for calendar cycles and the **true instant** for the moon.

### 3. One shared reading for dashboard + Logs (synchronization)
- `toWallClockInTimeZone(instant, tz)` — Intl-based, isomorphic (no dayjs),
  invalid/missing zone falls back to device time.
- `getAstrologyReading()` returns `{ westernZodiac, hourlyZodiac, rokuyo,
  rokuyoGuidance, moonPhase, moonIllumination, localDay, localHour, timeZone }`.
- Server `getLogContext` and client `System.tsx` both call it → the
  dashboard now uses the **saved profile timeZone** (closes v1 pending item),
  so the block and the Log snapshot can never disagree on day/hour.

### 4. Personalization — "Personal Resonance" from Logs
`computeAstroResonance(logs)`: over entries carrying an astro snapshot
(min sample **7**), finds the dominant rokuyo / moon phase / zodiac hour. A
value only counts as resonance if its share is ≥ 1.5× the uniform baseline
for its cycle (1/6, 1/8, 1/12) — avoids false "patterns" from noise.
`getResonanceMatches(reading, resonance)` → which of `rokuyo|moon|hour`
today matches.

Dashboard block now renders:
```
Scorpio • Goat • Taian • Waxing Gibbous (79%)
Taian: auspicious for beginnings
You write most under Taian • Full Moon • Rat hr • aligned 1/3
```

### 5. Rokuyo guidance line
`ROKUYO_GUIDANCE` gives each day a plain-language reading (Sensho: morning
favored · Tomobiki: shared plans favored · Senpu: afternoon favored ·
Butsumetsu: rest, avoid new starts · Taian: auspicious for beginnings ·
Shakku: midday only, move with care).

### 6. Widget sync — richer QIE signal
`recordAstrologySignal(..., personal?)` metadata now adds
`resonanceMatches[]`, `resonanceAligned`, `resonanceSample`, `localDay`.
The daily signal waits for `useLogs` to be fetched (so it carries the match),
keys its once-per-day guard on the **user-timeZone `localDay`**, and wraps
localStorage in try/catch. `cosmic` and `system` (already dependents of the
`astrology` source) can key off `resonanceAligned`.

### 7. Logs sync — astro on every entry
- Every note/entry footer: `12°C, 60% – Tokyo · Taian · Full Moon · Rat hr`
  (both `contextText` sites in `Logs.tsx`, via `formatAstroContext`).
- `SYS:` snapshot line: `ASTRO: Taian · Full Moon · Rat hr (98%)` (was rokuyo + moon only).
- Older entries without astro context render unchanged.

---

## PHASE 2 — TEST

```
tsx unit run of shared/utils/astrology.ts (TZ=UTC):
  instant 2026-11-20T04:00Z, America/Los_Angeles → localDay 2026-11-19, 20h, Dog, Butsumetsu
  same instant, Asia/Tokyo                       → localDay 2026-11-20, 13h, Goat, Taian
  moon identical in both zones (79%, Waxing Gibbous)        PASS
  invalid zone → 'device' fallback                          PASS
  rokuyo continuity across 2000-01-01                       PASS
  resonance: 10 synthetic logs → Taian 0.6, Full Moon 1.0, Rat 0.3; match ['rokuyo']  PASS
npm run build (server tsc + client esbuild)                 PASS
tsc --noEmit -p tsconfig.json: 104 errors before, 104 after — zero new (all pre-existing)
```

---

## PHASE 3 — FEATURES BREAKDOWN (current state)

- **Inputs:** zodiac hour (12 × 2h), Western sign, rokuyo (6-day), moon phase
  + illumination. Pure date math, no external API, no birth data.
- **TimeZone:** profile timeZone on dashboard *and* Logs (device fallback).
- **Freshness:** 15-min recompute, paused off-tab; re-derives on timeZone change.
- **Guidance:** one-line rokuyo meaning.
- **Personal Resonance:** dominant conditions from the user's own Logs,
  noise-gated, with live "aligned n/3" marker.
- **Widget sync:** Tier 0 QIE source `astrology` → `system`, `cosmic`; daily
  `ambient_reading` with `auspicious` + `resonanceAligned` flags.
- **Logs sync:** write — every entry snapshots the reading; read — every
  entry shows it; feedback — Logs feed the resonance.

## FILES

```
src/shared/utils/astrology.ts          MODIFIED  (rokuyo fix + reading/resonance layer)
src/server/utils/logs.ts               MODIFIED  (shared reading, moon-phase fix)
src/client/components/System.tsx       MODIFIED  (tz-aware, guidance + resonance lines, signal)
src/client/stores/intentionEngine.ts   MODIFIED  (signal metadata)
src/client/components/Logs.tsx         MODIFIED  (astro footer on entries, richer SYS line)
docs/assembly/2026-11-19_LOT-assembly_astrology-widget-personalization-sync-v2.md  ADDED
```

## PENDING / NEXT SESSION

- QIE pattern reacting to `resonanceAligned` + `goals`/`intentions` (nudge on
  aligned Taian days) — needs full self-assembly treatment (pattern number,
  wiki/doctrine/Field Manual sync).
- Resonance by *mood*: correlate astro snapshot with mood-check-in logs
  (which conditions coincide with better moods), not just volume.
- Cap resonance to a rolling window (e.g. last 90 days) once logs grow;
  `/api/logs` has no LIMIT.
- `getJapaneseZodiac` / `getMoonEmoji` still unused (opt-in only, scope guard).

*LOT Self-Assembly Engine — automated session*
