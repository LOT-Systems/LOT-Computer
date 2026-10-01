# LOT Self-Assembly Session Report
## 2026-10-01 | Astrology Widget — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-4ui6fd`
**Session type:** Automated / Scheduled (recurring routine)
**Predecessor:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)

## UNDERSTANDING (full feature map)

The Astrology block = ambient conditions (zodiac hour, Western sign, moon phase + illumination, rokuyo). Not a natal chart; no birth data exists on `User`.

| Piece | Location | Role |
|---|---|---|
| Math + shared reading | `src/shared/utils/astrology.ts` | Pure isomorphic functions; **new** `getAstrologyReading`, `toTimeZoneWallClock` |
| Dashboard | `src/client/components/System.tsx` | Compact block + cycling pro block (Astrology → Psychology → Journey → Quantum); 15-min visible-tab tick |
| Signal bus | `src/client/stores/intentionEngine.ts` | Tier 0 `astrology` source; `recordAstrologySignal` once/day; dependency of `system`, `cosmic` |
| Logs capture | `src/server/utils/logs.ts` `getLogContext` | Snapshots reading into every log's `context` (JSONB, no migration) |
| Logs render | `src/client/components/Logs.tsx` (`SYS:` block) | `ASTRO:` line |

## CHANGES THIS SESSION

1. **Single source of truth.** `getAstrologyReading(date)` returns the full reading (+ `auspicious` = Taian). Dashboard and Logs now both call it, so they cannot drift.
2. **Rokuyo day-boundary bug fixed.** `getRokuyo` counted elapsed UTC time since 2000-01-01T00:00Z, so it flipped at UTC midnight (e.g. 5pm Pacific) rather than the viewer's midnight. Now counts local calendar days (`Date.UTC(y,m,d)`), with a positive modulo for pre-2000 dates. Verified: 2000-01-01 = Sensho, 2000-01-05 = Taian.
3. **Client personalization.** Dashboard reading is computed in the user's saved `timeZone` (`me.timeZone`) via `toTimeZoneWallClock` (Intl-based, falls back to device time on missing/invalid zone). Dashboard and journal now share one time basis — closes v1's pending item.
4. **Server helper simplified.** `getLogContext` drops its dayjs wall-clock helper for the shared one (same output, one implementation).
5. **Logs sync richer.** `ASTRO:` now shows illumination % and zodiac hour: `ASTRO: Taian · Waxing Gibbous (62%) · Horse hr`. Older logs without the new fields render as before.

## VERIFICATION

`npm run build` (client + server) passes. Only pre-existing duplicate-key warnings in `badges.ts`. Helper behavior spot-checked via script (Rokuyo anchors, LA/Tokyo wall-clock conversion, bad-zone fallback).

## FEATURE STATE

- Inputs: zodiac hour, Western sign, rokuyo, moon phase/illumination — pure date math.
- Personalization: user timeZone (dashboard + logs). Not natal.
- Freshness: 15-min recompute while tab visible.
- Widget sync: QIE Tier 0 signal, one `ambient_reading`/day; consumers `system`, `cosmic`.
- Logs sync: every new log carries the reading; shown in `SYS:` block.
- Known limitation: rokuyo is a simplified day-cycle, not the true lunisolar calendar (documented in source).

## PENDING

- QIE pattern keyed on `astrology.auspicious` + goals/intentions (needs full benchmark/wiki/FM sync pass).
- The daily-signal guard in `System.tsx` keys on device-local date; could key on the timeZone-based date for travelers.
- Optional: moon emoji (`getMoonEmoji`, unused) in the display; opt-in "birth-year animal" via `getJapaneseZodiac` (unused; needs birth-year field).
- Optional: surface astro alongside mood/energy in Logs insights (correlation view).
