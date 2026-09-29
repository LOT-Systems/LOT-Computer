# LOT Self-Assembly Session Report
## 2026-09-29 | Astrology Widget — Personalization + Widget Sync | v2

**Branch:** `claude/practical-curie-pd9gll` · **Session:** scheduled routine · builds on 2026-07-27 v1

## Understanding (current architecture)
- **Math:** `src/shared/utils/astrology.ts` — pure date functions: `getHourlyZodiac`, `getWesternZodiac`, `getRokuyo`, `getMoonPhase` (phase + illumination). `getJapaneseZodiac`, `getMoonEmoji` still unused.
- **Dashboard:** inlined in `System.tsx` (`astrology` useMemo, 15-min visible-tab tick); rendered in compact layout and the cycling "pro" block.
- **QIE bus:** `intentionEngine.ts` — Tier 0 `astrology` source, deps of `system` and `cosmic`; `recordAstrologySignal` emits one `ambient_reading` per day (with `auspicious` = Taian).
- **Logs:** `server/utils/logs.ts#getLogContext` snapshots rokuyo / moon phase+illumination / hourly + western zodiac per entry using the user's timeZone; `Logs.tsx` renders it in the `SYS:` block.
- No birth/natal data exists — feature stays ambient by design.

## Changes this session
1. **Dashboard now uses the user's saved timeZone** (`me.timeZone`, via `Intl.DateTimeFormat` wall-clock conversion — no dayjs tz plugin needed on client; invalid zone falls back to device time). Dashboard and Logs snapshots now agree even when the device clock differs. Closes v1's pending item.
2. **Logs `ASTRO:` line is complete**: `rokuyo · moon phase (illumination%) · zodiac hour` — previously the stored illumination and zodiac hour were captured but not shown.

## Features breakdown
| Feature | State |
|---|---|
| Ambient reading (zodiac hour, sign, rokuyo, moon+%) | live |
| Freshness (15-min tick, off-tab paused) | live |
| User timeZone personalization — Logs | live (v1) |
| User timeZone personalization — dashboard | **new (v2)** |
| QIE Tier-0 signal + dependency graph | live |
| Logs sync, full reading rendered | **completed (v2)** |
| Natal chart / birth data | intentionally absent |

## Verification
`npm run build` (client + server) PASS.

## Pending
- QIE pattern reacting to `astrology` + goals/intentions (needs dedicated benchmark pass).
- Daily signal guard uses device-local date; could use user timeZone.
- Opt-in features using `getJapaneseZodiac` / `getMoonEmoji`.
