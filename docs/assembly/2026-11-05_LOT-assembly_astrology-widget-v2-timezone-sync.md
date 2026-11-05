# LOT Self-Assembly Session Report
## 2026-11-05 | Astrology Widget — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-9mj3fd`
**Session type:** Automated / Scheduled (recurring routine)
**Build:** `npm run build` PASS (client + server)

## Understanding (full feature map)

The Astrology block shows *ambient* conditions only (zodiac hour, Western sign, rokuyo, moon phase + illumination). It is not a natal chart; no birth data exists on `User`.

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure functions + (new) `toWallClockDate`, `getAstrologyReading` |
| Dashboard | `src/client/components/System.tsx` | Compact block + cycling "pro" block (Astrology → Psychology → Journey → Quantum); 15-min visibility-gated recompute |
| Signal bus | `src/client/stores/intentionEngine.ts` | Tier 0 `astrology` source; `recordAstrologySignal` once per day; `system` and `cosmic` depend on it |
| Logs | `src/server/utils/logs.ts` `getLogContext` | Stamps the reading onto every log's `context` JSONB; shown as `ASTRO:` in `Logs.tsx` |
| Types | `src/shared/types/index.ts` `LogContext` | `astro*` fields |

## Changes this session (v2)

1. **One shared reading** – `getAstrologyReading(instant, timeZone)` replaces duplicated per-function calls in dashboard and server logs, so the two surfaces can't drift.
2. **Dashboard now timezone-personalized** – resolves the reading in the user's saved profile `timeZone` (device time fallback), matching what Logs store. Closes the v1 pending item. `toWallClockDate` uses `Intl` (works on client without the dayjs tz plugin; invalid zone falls back safely).
3. **Logs sync** – new `astroAuspicious` flag in `LogContext`; Logs `ASTRO:` line shows `★` on auspicious (Taian) days.
4. Verified: Tokyo vs Los Angeles at the same instant yield different rokuyo; invalid zone does not throw.

## Current feature state

- Inputs: date-math only, no external API.
- Personalization: profile timeZone (dashboard + logs).
- Sync: QIE Tier 0 signal (daily), consumed by `system`/`cosmic`; every log entry stamped.
- Not done: natal-chart data (by design).

## Pending

- QIE pattern reacting to `astrology` + goals/intentions (needs full benchmark/doctrine pass).
- Daily QIE signal is still guarded by a device-local date key; could key on profile timeZone date.
- Unused: `getJapaneseZodiac`, `getMoonEmoji`.
- Insight idea: correlate log mood/energy with rokuyo/moon phase from stored `context`.
