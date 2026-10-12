# LOT Self-Assembly Session Report
## 2026-10-12 | Astrology Widget — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-1rt9mw`
**Session type:** Automated / scheduled routine (follows 2026-07-27 v1 report)

## Understanding (full feature map)

The Astrology block shows ambient conditions (zodiac hour, Western sign, rokuyo, moon phase + illumination) — not a natal chart. No birth data exists on `User`; personalization anchors on `user.timeZone`.

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure date math; now also `getWallClockDate(tz)` and `getAstrologyReading(date)` |
| Dashboard block | `src/client/components/System.tsx` | Compact + cycling "pro" render; 15-min tick, paused off-tab |
| Signal bus | `src/client/stores/intentionEngine.ts` | Tier 0 `astrology` source; `recordAstrologySignal` once per day; dependency of `system` and `cosmic` |
| Logs snapshot | `src/server/utils/logs.ts` `getLogContext` | Writes `astro*` fields into each log's `context` (user timeZone) |
| Logs render | `src/client/components/Logs.tsx` (`SYS:` block) | `ASTRO:` line |

## Changes this session

1. **Shared reading helper** — `getAstrologyReading(date)` is now the single source for both the dashboard and the Logs snapshot (removes duplicated five-call composition).
2. **Dashboard uses profile timeZone** — closes the v1 "pending" item. `getWallClockDate(me.timeZone)` (Intl-based, falls back to device time on missing/invalid zone) feeds the block, so the dashboard and Logs agree even when the device is set to another zone.
3. **Daily QIE signal keyed to profile-zone day** — the once-per-day guard no longer flips at device midnight.
4. **Logs show the full reading** — `ASTRO:` now prints `sign • zodiac hour • rokuyo • moon phase (illumination%)`, matching the dashboard block exactly (older entries lacking fields degrade gracefully).

## Verification

`npm run build` (client + server) — PASS.

## Feature state

- Inputs: date math only; no external API; no birth data.
- Personalization: profile timeZone (dashboard + Logs).
- Freshness: 15-min recompute while tab visible.
- Widget sync: Tier 0 `astrology` QIE signal (daily, `auspicious` = Taian) consumed by `system`/`cosmic`.
- Logs sync: every new log carries the reading; journal renders it.

## Pending

- QIE pattern keyed on `astrology` + goals/intentions (needs full benchmark/self-assembly pass).
- Optional opt-in birth-year animal using unused `getJapaneseZodiac`; `getMoonEmoji` still unused.
- Backfill: historical logs have no `astro*` context.
