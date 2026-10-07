# LOT Self-Assembly Session Report
## 2026-10-07 | Astrology Widget — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-t35s94`
**Session type:** Automated / Scheduled (recurring routine)
**Predecessor:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)

---

## UNDERSTANDING (full feature map)

The Astrology block shows ambient conditions (zodiac hour, Western sign, moon
phase + illumination, rokuyo). It is **not** a natal chart; no birth data exists.

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure functions + (new) `toWallClockDate`, `getAstrologyReading` |
| Dashboard | `src/client/components/System.tsx` | Inline block, two render sites (basic + cycling "pro") |
| Signal bus | `src/client/stores/intentionEngine.ts` | Tier 0 `astrology` source, `recordAstrologySignal` (1/day, `auspicious` = Taian), depended on by `system`, `cosmic` |
| Logs write | `src/server/utils/logs.ts` `getLogContext` | Snapshots `astro*` fields into each log's `context` JSONB |
| Logs read | `src/client/components/Logs.tsx` | `ASTRO:` line in the `SYS:` snapshot block |

Known approximations: rokuyo is a Gregorian-day cycle (not the true lunar-calendar
rokuyo); moon phase is a mean-cycle formula.

## CHANGES THIS SESSION

1. **Single shared reading, timeZone-aware everywhere.** `getAstrologyReading(date, timeZone?)`
   uses `Intl.DateTimeFormat` (no dayjs-tz dependency, so it works on client and server)
   to build a wall-clock date in the user's saved timeZone. The server Logs snapshot now
   calls it (replacing the local `toWallClockDate`), and the dashboard block calls it with
   `me.timeZone` — closing v1's pending item. Dashboard and journal can no longer disagree
   when a device's timeZone differs from the profile. Falls back to device time if unset/invalid.
2. **Logs → widget sync.** The block now appends `N logs under <rokuyo>` (when N>0),
   counting the user's own logs whose `context.astroRokuyo` matches today's — the first
   read-back of the Logs snapshot into the dashboard (personal history under today's conditions).

## FEATURE STATE

- Personalization: timeZone from profile (dashboard + logs); personal per-rokuyo log count.
- Freshness: 15-min recompute while tab visible.
- Widget sync: QIE `astrology` signal (daily), dependency edges to `system`, `cosmic`.
- Logs sync: write (`astro*` context) and read (`ASTRO:` line, dashboard count).

## VERIFICATION

`tsc -p tsconfig.server.json` clean; `npm run client:build` passes (pre-existing
duplicate-key warnings in `badges.ts`, unrelated).

## PENDING / FUTURE

- QIE pattern keyed on `astrology.auspicious` + goals/intentions (needs a dedicated benchmark pass).
- True lunar-calendar rokuyo; optional opt-in birth-year animal via `getJapaneseZodiac`
  (note: its index is wrong for years < 1900).
- Per-rokuyo/moon-phase mood or energy correlation from log history.
