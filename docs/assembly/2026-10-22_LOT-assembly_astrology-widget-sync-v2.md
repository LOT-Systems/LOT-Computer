# LOT Self-Assembly Session Report
## 2026-10-22 | Astrology Widget — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-sfyj04`
**Session type:** Automated / Scheduled (recurring routine)
**Builds on:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)

---

## UNDERSTANDING (full feature map, post-session)

The Astrology block is ambient — zodiac hour, Western sign, rokuyo, moon phase +
illumination — not a personal natal chart. No birth data exists on `User`.

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure date-math: `getHourlyZodiac`, `getWesternZodiac`, `getRokuyo`, `getMoonPhase`; new `toZonedWallClockDate`, `summarizeAstroLogs`. `getJapaneseZodiac`, `getMoonEmoji` still unused |
| Dashboard | `src/client/components/System.tsx` | Compact layout block + cycling "pro" block (Astrology → Psychology → My Journey → Biofield); recomputed every 15 min while tab visible |
| Signal bus | `src/client/stores/intentionEngine.ts` | Tier 0 `astrology` source; `recordAstrologySignal` once/day (`auspicious` = Taian); dependency of `system`, `cosmic` |
| Logs (write) | `src/server/utils/logs.ts` `getLogContext` | Snapshots `astroRokuyo/MoonPhase/MoonIllumination/HourlyZodiac/WesternZodiac` into `Log.context` using the user's timeZone |
| Logs (display) | `src/client/components/Logs.tsx` | `ASTRO:` line in `SYS:` block |

## CHANGES THIS SESSION

1. **Timezone personalization on the dashboard (closes v1 pending item).**
   `toZonedWallClockDate(date, timeZone)` (Intl-based, safe fallback to device
   time on missing/invalid zone) is applied in `System.tsx` using `me.timeZone`,
   so the displayed reading now matches what the server stamps onto Logs for the
   same moment, even when the device zone differs from the saved profile.
2. **Logs → widget sync (reverse direction).** `summarizeAstroLogs(logs, reading)`
   counts stored log snapshots made under today's rokuyo / moon phase. The block
   shows "N logs under <Rokuyo>" when N > 0 (both layouts). Previously, Logs
   only received astrology; now the widget reads it back.

## FEATURES BREAKDOWN

- Inputs: date-math only; no external API; no birth data.
- Personalization: user `timeZone` (dashboard + Logs).
- Freshness: 15-min tick, paused off-tab.
- Widget sync: QIE `astrology` signal (daily) → `system`, `cosmic`.
- Logs sync: write-side snapshot per entry; read-side "logs under today's rokuyo".
- Not implemented by design: natal chart.

## TEST

`npm run build` (server + client) — PASS.

## PENDING

- QIE pattern keyed on `astrology` + `goals`/`intentions` (needs full benchmark pass).
- Opt-in "birth-year animal" via `getJapaneseZodiac`; render `getMoonEmoji`.
- Older logs lack `astro*` context, so counts start from 2026-07-27 onward.
