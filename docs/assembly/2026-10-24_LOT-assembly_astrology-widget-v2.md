# LOT Self-Assembly Session Report
## 2026-10-24 | Astrology Widget — Personalization + Logs Sync | v2

**Branch:** `claude/practical-curie-p6kqw2`
**Session type:** Automated / Scheduled (recurring routine)
**Predecessor:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md`

## Understanding (state at session start)

The Astrology block (zodiac hour, Western sign, rokuyo, moon phase + illumination) is inlined in `src/client/components/System.tsx` (compact layout + cycling "pro" block). Math is pure and isomorphic in `src/shared/utils/astrology.ts`. v1 added: 15-min off-tab-safe recompute, illumination %, Tier 0 `astrology` QIE signal (`recordAstrologySignal`, one per day, `auspicious` = Taian), and per-log astrology snapshot in `getLogContext` (`astroRokuyo`, `astroMoonPhase`, `astroMoonIllumination`, `astroHourlyZodiac`, `astroWesternZodiac`) rendered as `ASTRO:` in `Logs.tsx`. Still ambient only: no birth data exists on `User`.

Gap found: the dashboard read device-local time while Logs stamp the user's saved `timeZone`, so the two could disagree; and the log snapshots were written but never read back by the widget.

## Built this session

1. **Personalization — timeZone-aware dashboard.** New `toWallClockInZone(date, timeZone)` in `astrology.ts` (Intl-only, safe fallback). `System.tsx` now derives the reading from `me.timeZone`, so the widget and the Logs stamp agree. Closes v1's pending item.
2. **Logs synchronization (read side).** New `getAstrologyLogAlignment(logs, reading, todayStart)` counts the user's past logs whose context snapshot matches today's moon phase / rokuyo (today's entries excluded). The block shows a dim second line: `N logs under this moon • M on a <Rokuyo> day`, hidden when both are 0.
3. Both render sites (compact + pro cycling block) show the line.

## Build

`npm run build` (server tsc + client bundle) — PASS.

## Feature breakdown (current)

| Feature | Status |
|---|---|
| Zodiac hour / Western sign / rokuyo / moon phase + % | live |
| 15-min recompute, paused off-tab | live (v1) |
| User-timeZone reading on dashboard | **new** |
| Per-log astrology snapshot (server, user tz) | live (v1) |
| `ASTRO:` line in journal SYS block | live (v1) |
| Log-history alignment line in widget | **new** |
| Tier 0 `astrology` QIE signal, deps in `system`/`cosmic` | live (v1) |
| Natal chart / birth data | intentionally absent |

## Pending

- QIE pattern keyed on `astrology.auspicious` + goals/intentions (needs a dedicated benchmark pass: pattern number, wiki/doctrine sync).
- Include alignment counts in the daily `ambient_reading` signal metadata.
- Optional opt-in birth-year animal using the unused `getJapaneseZodiac`; `getMoonEmoji` still unused.
- Rokuyo uses a Gregorian approximation, not the lunisolar calendar.
