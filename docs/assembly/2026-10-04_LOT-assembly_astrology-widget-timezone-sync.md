# LOT Self-Assembly Session Report
## 2026-10-04 | Astrology Widget — TimeZone Personalization | v2

**Branch:** `claude/practical-curie-0setpe`
**Session type:** Automated / Scheduled (recurring routine)
**Predecessor:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md`

## UNDERSTANDING (full feature map)

The Astrology block = ambient conditions (zodiac hour, Western sign, rokuyo, moon phase + illumination). Not a natal chart; no birth data exists on the `User` model.

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure date-math: `getHourlyZodiac`, `getWesternZodiac`, `getRokuyo`, `getMoonPhase`, new `getWallClockDate` |
| Dashboard | `src/client/components/System.tsx` | `astrology` useMemo (15-min tick, paused off-tab); compact block + cycling "pro" block (Astrology → Psychology → Journey → Quantum) |
| Signal bus | `src/client/stores/intentionEngine.ts` | Tier 0 `astrology` source; `recordAstrologySignal` once/day (`auspicious` = Taian); dependency of `system` and `cosmic` |
| Logs | `src/server/utils/logs.ts` `getLogContext` | Snapshots `astro*` fields into `Log.context` using user timeZone |
| Logs UI | `src/client/components/Logs.tsx` | `SYS:` block prints `ASTRO: rokuyo · moon phase` |

## CHANGES THIS SESSION

1. **`getWallClockDate(timeZone, now)`** (shared util, Intl-based, no dayjs tz plugin needed on the client; falls back to device clock on missing/invalid zone).
2. **Dashboard now reads the clock in the user's saved `me.timeZone`**, so the Astrology block and the Logs snapshot (already timeZone-aware server side) agree even when the device is set to a different zone. The useMemo re-derives when the profile timeZone changes.
3. **Daily QIE signal day-key** uses the same wall-clock date, so the once-per-day `ambient_reading` rolls over at the user's local midnight.

## TEST

`npm run build` (client + server) — PASS. No unit-test suite touched.

## FEATURES BREAKDOWN (state after session)

- Inputs: pure date-math, no external API, no personal birth data.
- Personalization: user timeZone on both dashboard and Logs.
- Freshness: 15-min recompute while tab visible.
- Widget sync: Tier 0 QIE source, consumed by `system` / `cosmic`; daily `ambient_reading` with `auspicious` flag.
- Logs sync: every new log carries the ambient reading; shown in `SYS:` block.

## PENDING

- QIE pattern keyed on `astrology.auspicious` + goals/intentions (needs dedicated benchmark/self-assembly pass).
- Render `ASTRO:` in other log event types beyond `system_snapshot`.
- Opt-in "birth-year animal" via `getJapaneseZodiac` (only if a birth-year field is ever added; feature stays ambient-only until then).
