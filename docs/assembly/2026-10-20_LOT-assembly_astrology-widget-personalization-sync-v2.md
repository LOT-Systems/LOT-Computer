# LOT Self-Assembly Session Report
## 2026-10-20 | Astrology Widget — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-4pk10s`
**Session type:** Automated / Scheduled (recurring routine)
**Predecessor:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)

---

## 1. UNDERSTANDING (current architecture)

The Astrology block is ambient, not a natal chart: zodiac hour, Western sign,
rokuyo, moon phase + illumination. All pure date math, no external API, no
birth data (the `User` model has none).

| Piece | Location | Role |
|---|---|---|
| Math + reading + resonance | `src/shared/utils/astrology.ts` | Isomorphic. `getAstrologyReading(date, tz)` is the single source of the reading; `toZonedWallClock`; `computeAstroResonance(logs, todayRokuyo)` |
| Dashboard render | `src/client/components/System.tsx` | One `astrologyLine` string rendered in the compact layout and the cycling "pro" block (Astrology → Psychology → Journey → Quantum) |
| Signal bus | `src/client/stores/intentionEngine.ts` | Tier 0 `astrology` source; `recordAstrologySignal` (one `ambient_reading` per local day); consumed per dependency map by `system` and `cosmic` |
| Logs write side | `src/server/utils/logs.ts` `getLogContext` | Stamps every new Log's `context` (JSONB) with `astroRokuyo/MoonPhase/MoonIllumination/HourlyZodiac/WesternZodiac` in the user's timeZone |
| Logs read side | `src/client/components/Logs.tsx` | `SYS:` block prints `ASTRO: {rokuyo} · {moonPhase}` |

## 2. WHAT CHANGED THIS SESSION

1. **One reading, two timelines.** `getAstrologyReading()` replaces the
   duplicated per-function calls on client and server. Server `getLogContext`
   dropped its dayjs-based `toWallClockDate` for the shared Intl-based
   `toZonedWallClock` (no dayjs-tz dependency, bad zone falls back safely).
2. **Dashboard is now timeZone-aware (v1 pending item closed).** The client
   block reads `me.timeZone`, so the dashboard and the Logs stamps agree even
   when the device clock is set to another zone. Verified: 2026-10-20T23:30Z →
   Tokyo = Dragon, Los Angeles = Monkey, invalid zone = device-local fallback.
3. **Personal resonance (Logs → Astrology feedback loop).** Logs were
   write-only context for astrology; now they personalize it.
   `computeAstroResonance` tallies the user's *deliberate* entries (note,
   answer, emotional_checkin, intention, goal_set, self_care_complete,
   plan_set) by stamped `astroRokuyo`. With ≥12 samples and the top rokuyo at
   ≥1.25× the uniform 1/6 expectation, the block appends
   `resonance Taian ×1.6` (plus `●` when today is that rokuyo). Below the
   threshold nothing is shown, so it never fabricates a pattern. Only entries
   created after v1 shipped carry stamps; older entries are ignored.
4. **QIE sync.** `recordAstrologySignal` now carries `resonanceRokuyo`,
   `resonanceLift`, `resonanceAligned` so other widgets can key off a
   personal-alignment day, not only the generic Taian flag.

## 3. FEATURE BREAKDOWN (state after session)

- Inputs: zodiac hour, Western sign, rokuyo, moon phase/illumination.
- Personalization: profile timeZone (display + Logs stamps); learned rokuyo
  resonance from the user's own Logs.
- Freshness: 15-min tick while tab visible.
- Widget sync: Tier 0 QIE `astrology` signal, once per local day, includes
  auspicious + resonance fields; dependents `system`, `cosmic`.
- Logs sync: stamped on write (all ~17 creation paths via `getLogContext`),
  displayed in `SYS:`, and read back for resonance.
- Out of scope by design: natal chart / birth data.

## 4. TEST

`npm install --legacy-peer-deps && npm run build` — PASS (client + server tsc).
Node check of `getAstrologyReading` and `computeAstroResonance` against the
compiled output — PASS (14 samples, 8 Taian → lift 3.4, aligned; 5 samples → null).
No test suite covers this block; none was added.

## 5. KNOWN LIMITS / NEXT

- The daily QIE signal fires on first mount; if `/api/logs` has not loaded yet
  the resonance fields for that day are null. Acceptable; could re-fire once
  logs arrive.
- `getRokuyo` is the simplified 6-day Gregorian cycle, not the true lunar-
  calendar rokuyo; labels are ambient flavor, not authoritative.
- Moon-phase resonance (needs duration normalization, phases are unequal
  length) and mood-valence-weighted resonance (join `emotional_checkin`
  metadata) are the natural next steps.
- Still deferred: a dedicated QIE pattern reacting to `astrology` +
  `goals/intentions` (needs a full benchmark pass with wiki/doctrine sync).
- `getJapaneseZodiac` and `getMoonEmoji` remain unused.
