# LOT Self-Assembly Session Report
## 2026-11-25 | Astrology Widget v2 — Personal Resonance · TimeZone Sync · Logs Sync

**Branch:** `claude/practical-curie-kx2b2o`
**Base commit:** `9f2b88c`
**Previous astrology session:** `docs/assembly/2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)
**Session type:** Automated / Scheduled (recurring routine)
**Live site access:** not attempted. All work comes from reading the repo.

---

## MISSION BRIEF

Standing recurring instruction: keep evolving the Astrology block (today's
zodiac hour, moon phase and rokuyo, which are ambient conditions and not a personal natal
chart). Make it more personal, keep it in sync with other widgets and with Logs
entries, and push a full .md covering how the feature works and what it does each session.

---

## PART 1 — FULL UNDERSTANDING (system map, post-v2)

The Astrology block is not a standalone component. It lives inline in the
master dashboard, `src/client/components/System.tsx`, and is fed by pure
shared math plus a per-log server snapshot.

```
                ┌────────────────────────────────────────────┐
                │ src/shared/utils/astrology.ts  (isomorphic)│
                │  getHourlyZodiac / getWesternZodiac        │
                │  getRokuyo / getMoonPhase                  │
                │  v2: toWallClockInTimeZone                 │
                │      getAstrologyReading(instant, tz)      │
                │      getAstrologyResonance(logs, reading)  │
                └───────┬───────────────────────┬────────────┘
                        │                       │
   server: getLogContext(user)          client: System.tsx
   (src/server/utils/logs.ts)           reading = getAstrologyReading(now, me.timeZone)
   → Log.context.astro* on EVERY        resonance = getAstrologyResonance(logs, reading)
     new log entry (~18 call sites)            │
                        │                      ├─► Astrology block (compact + pro/cycling)
                        ▼                      │     line 1: sign • hour • rokuyo • moon (%)
              Logs.tsx journal                 │     line 2: personal resonance label
              · hover line on every entry      │
                "…°C – City · Moon · Rokuyo"   └─► QIE: recordAstrologySignal(…, resonance)
              · SYS: block → ASTRO line            once per day, after Logs load
                (rokuyo · moon (%) · hour)         Tier 0 source 'astrology'
                        ▲                          → system, cosmic depend on it
                        └──── logs feed resonance ◄┘
```

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure date math, no API, no birth data |
| Reading | `getAstrologyReading(instant, timeZone)` | One object: `hourlyZodiac`, `westernZodiac`, `rokuyo`, `moonPhase`, `moonIllumination`, `auspicious` |
| Resonance | `getAstrologyResonance(logs, reading)` | Matches the user's astro-tagged Logs history against today's reading |
| Dashboard | `System.tsx` | Reads in the profile timeZone, re-ticks every 15 min while the tab is visible |
| Profile | `src/server/models/user.ts` `useProfileView` | v2 exposes `timeZone` to the user's own `/api/me` (the only call site) |
| Logs write | `src/server/utils/logs.ts` `getLogContext` | Snapshots `astroRokuyo`, `astroMoonPhase`, `astroMoonIllumination`, `astroHourlyZodiac`, `astroWesternZodiac`, v2 `astroAuspicious` |
| Logs read | `src/client/components/Logs.tsx` | `formatLogContextText` hover line on every entry, plus a richer `ASTRO:` line in `SYS:` |
| Signal bus | `src/client/stores/intentionEngine.ts` | `recordAstrologySignal`, now with resonance metadata |
| Types | `src/shared/types/index.ts` | `LogContext.astroAuspicious`, `UserProfile.timeZone` |

---

## PART 2 — WHAT CHANGED THIS SESSION

### 1. Bug fix: rokuyo rolled over at UTC midnight, not local midnight
`getRokuyo` diffed raw epoch ms against `new Date('2000-01-01')`, which is UTC
midnight. As a result the six-day cycle changed at 09:00 in Tokyo and at
16:00/17:00 in Los Angeles, not at the user's own midnight. It now diffs two
UTC-encoded **calendar** dates built from the Date's local fields, and the
modulo is now safe for dates before 2000. For UTC users nothing changes, and
the 2000-01-01 = Sensho anchor still holds.

### 2. Bug fix: moon phase was skewed by the UTC offset
In v1 the server built a wall-clock Date that was shifted by the timeZone
offset, then fed it into the moon math, which works on absolute time. The
moon phase is the same everywhere at a given instant, so
`getAstrologyReading` now uses the real instant for the moon and the
wall clock only for calendar values (hour animal, sign, rokuyo).

### 3. Personalization: dashboard follows the saved profile timeZone
This was v1's pending item #2. `/api/me` now returns `timeZone` (own user
only), and the dashboard computes the reading in that zone through
`Intl.DateTimeFormat`. It falls back to the device's local time when the zone
is missing or invalid. The dashboard and every Log snapshot now read from the
same clock.

### 4. Personalization: personal resonance from Logs
`getAstrologyResonance` scans the user's Logs for `context.astro*` snapshots
(every entry since v1 has them) and works out:
- **dominantMoonPhase**: the moon phase the user logs under most
- **brightestMoonPhase**: the moon phase with the highest share of positive
  `emotional_checkin` states (energized, calm, hopeful, fulfilled, grateful,
  content, peaceful, excited vs. tired, anxious, exhausted, restless,
  overwhelmed, uncertain). It needs at least 3 check-ins in that phase.
- **dominantRokuyo**: the rokuyo day the user logs on most
- **alignedToday**: whether today's phase or rokuyo matches one of these

The dashboard shows a second, dimmed line in both render sites. It needs at
least 5 astro-tagged entries (`RESONANCE_MIN_SAMPLES`):
- `Your brightest phase • 75% uplifted` (today is the brightest phase)
- `Your most active phase • 14 logs` (today is the dominant phase)
- `Your most active day • Taian` (today is the dominant rokuyo)
- `Your phase: Waxing Gibbous • 22 logs` (otherwise)

With fewer than 5 samples, no line is shown.

### 5. Widget sync: resonance on the QIE bus
`recordAstrologySignal` now accepts resonance, and the `ambient_reading`
signal carries `resonanceSamples`, `resonanceAligned`,
`resonanceDominantPhase`, `resonanceBrightestPhase` and
`resonanceDominantRokuyo`. The daily record now waits for the Logs query to
finish (`isFetched`), so resonance is never recorded empty on first paint.
`localStorage` access is wrapped in try/catch (private mode or blocked
storage).

### 6. Logs sync: astro shown on every entry
Two duplicated `contextText` memos in `Logs.tsx` were replaced by one
`formatLogContextText`. The hover context on **every** log entry now reads
`12°C, 60% – Tokyo · Full Moon · Taian`. Before, astro data appeared only on
`SYS:` snapshots. The `SYS:` `ASTRO:` line now also shows illumination and
the zodiac hour: `ASTRO: Taian · Full Moon (99%) · Rabbit hour`. Entries with
a city but no weather now show the city alone, without a leading ` – `.

### 7. Server: `astroAuspicious` added to the Log context
This is a boolean flag (rokuyo === Taian) for later server-side pattern
queries. No migration is needed because `context` is free-form JSONB.

---

## PART 3 — FEATURES BREAKDOWN (current state)

| Feature | Since | Status |
|---|---|---|
| Western sign · zodiac hour · rokuyo · moon phase + % | v0/v1 | live |
| 15-min recompute, paused off-tab | v1 | live |
| Reading in the user's saved timeZone (dashboard) | **v2** | live |
| Reading in the user's saved timeZone (Logs) | v1 | live, moon fixed in **v2** |
| Rokuyo rolls over at local midnight | **v2** | fixed |
| Personal resonance line from Logs + mood valence | **v2** | live (≥5 samples) |
| QIE Tier 0 `astrology` source → `system`, `cosmic` | v1 | live |
| QIE resonance metadata | **v2** | live |
| Astro snapshot on every Log entry | v1 | live |
| Astro on every entry's hover line | **v2** | live |
| `astroAuspicious` flag in Log context | **v2** | live |
| Natal chart / birth data | — | not built, on purpose (ambient only) |

---

## PART 4 — VERIFY

```
npm install --legacy-peer-deps  -> ok (pre-existing nanostores peer conflict)
npm run build                   -> PASS (client esbuild + server tsc)
tsc --noEmit -p tsconfig.json   -> 104 errors, identical to the pre-change baseline
                                   (all pre-existing; 0 introduced)
```
The smoke test ran `npx esr` with TZ=UTC at instant 2026-11-25T20:00Z:
- Asia/Tokyo → Nov 26 05:00, Rabbit hour, **Taian**, Full Moon 99%
- America/Los_Angeles → Nov 25 12:00, Horse hour, **Butsumetsu**, Full Moon 99%
  (consecutive days, so the rokuyo is correctly one step apart)
- invalid zone → falls back to the instant without crashing
- 2000-01-01 → Sensho (anchor holds); 1999-12-31 → Shakku (negative modulo ok)
- resonance fixture (8 Full Moon/Taian logs, 3 of 4 check-ins calm) →
  `Your brightest phase • 75% uplifted`, aligned
- empty logs → `label: null`

Not verified: a browser render of the dashboard against a live account.

---

## PENDING / NEXT SESSION

- **QIE pattern for alignment**: add a composite pattern that fires when
  `resonanceAligned && auspicious` together with active `goals`/`intentions`
  (a gentle "good day to begin" nudge). This needs a full benchmark pass
  (pattern number, wiki, lexicon, Field Manual).
- **Accurate rokuyo**: true rokuyo is (lunar month + lunar day) mod 6 on the
  Japanese lunisolar calendar. The current one is a continuous six-day
  approximation, so it drifts from printed calendars at each lunar month start.
- **Resonance in Logs**: a weekly-summary line such as "you logged most under
  the Waxing Gibbous this week" in the existing `weekly_summary` entry.
- **Server-side resonance**: run `getAstrologyResonance` (already isomorphic)
  inside AI prompt context builders, so Memory/Story responses can mention it.
- Still unused: `getJapaneseZodiac`, `getMoonEmoji`.

---

## FILES

```
src/shared/utils/astrology.ts          MODIFIED  rokuyo fix + v2 reading/resonance
src/client/components/System.tsx       MODIFIED  timeZone reading, resonance line, QIE sync
src/client/components/Logs.tsx         MODIFIED  formatLogContextText, richer ASTRO line
src/client/stores/intentionEngine.ts   MODIFIED  resonance metadata on ambient_reading
src/server/utils/logs.ts               MODIFIED  getAstrologyReading, astroAuspicious
src/server/models/user.ts              MODIFIED  profile view exposes timeZone (own user)
src/shared/types/index.ts              MODIFIED  UserProfile.timeZone, LogContext.astroAuspicious
docs/assembly/2026-11-25_LOT-assembly_astrology-widget-v2.md  ADDED
```

*LOT Self-Assembly Engine (automated session)*
