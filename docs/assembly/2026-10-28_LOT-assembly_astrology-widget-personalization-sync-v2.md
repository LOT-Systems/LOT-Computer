# LOT Self-Assembly Session Report
## 2026-10-28 | Astrology Widget — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-nvta16`
**Session type:** Automated / scheduled routine (continues `2026-07-27_..._astrology-widget-personalization-sync.md`)

## Understanding (full map)

The Astrology block (zodiac hour, Western sign, rokuyo, moon phase + illumination) is ambient, pure date-math, no natal data, no external API.

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | `getHourlyZodiac`, `getWesternZodiac`, `getRokuyo`, `getMoonPhase`; **new** `toWallClockDate`, `summarizeAstrologyLogs` |
| Dashboard | `src/client/components/System.tsx` | `astrology` useMemo (15-min tick, paused off-tab), compact block + cycling "pro" block, daily QIE signal |
| QIE bus | `src/client/stores/intentionEngine.ts` | Tier 0 `astrology` source; `recordAstrologySignal` (once/day, `auspicious` = Taian); consumed by `system`, `cosmic` |
| Logs write | `src/server/utils/logs.ts` `getLogContext` | Snapshots astro fields into every log's `context`, using user timeZone |
| Logs read | `src/client/components/Logs.tsx` | `SYS:` block prints `ASTRO:` line |

## Changes this session

1. **Dashboard now uses the user's saved timeZone** (`me.timeZone`) via shared `toWallClockDate` (Intl-based, client-safe). Dashboard and log snapshots now agree even when the device zone differs from the profile. Falls back to device time if unset/invalid. Closes last session's pending item.
2. **Logs → widget sync ("resonance")**: `summarizeAstrologyLogs` counts the user's own logs created under today's rokuyo and moon phase. Both astrology render sites show `Logs: N on <Rokuyo> · M under <Phase> (of T)` once ≥5 astro-tagged logs exist. Co-occurrence only; no predictive claim.
3. **Fuller Logs rendering**: `ASTRO:` line now also shows moon illumination %, zodiac hour and Western sign, which were stored but not shown.

## Feature state

- Inputs: zodiac hour, Western sign, rokuyo, moon phase/illumination.
- Personalization: timeZone-aware (dashboard + logs); user-history resonance from their own logs. No birth data by design.
- Sync: QIE Tier 0 signal (daily), Logs context snapshot, Logs-derived dashboard line.
- Old logs (pre-2026-07-27) lack astro context and are skipped by the resonance count.

## Verification

`npm run build` (server + client) passes.

## Pending

- QIE pattern reacting to `astrology` + goals/intentions (needs dedicated benchmark pass with wiki/doctrine sync).
- Optional: feed resonance into the QIE signal; backfill astro for old logs from `createdAt`; unit tests for the two new helpers (no test runner wired for shared utils).
- `getJapaneseZodiac`, `getMoonEmoji` still unused.
