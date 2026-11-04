# LOT Self-Assembly Session Report
## 2026-11-04 | Astrology Widget — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-xgj6w0`
**Session type:** Automated / Scheduled (recurring routine)
**Builds on:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)

## Understanding (full feature map)
The Astrology block (zodiac hour, Western sign, rokuyo, moon phase + illumination) is ambient — pure date math, no natal data — inlined in `src/client/components/System.tsx` (compact layout + cycling "pro" block: Astrology → Psychology → My Journey → Quantum).

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Isomorphic pure functions + new `toWallClockDateInZone` |
| Dashboard compute | `System.tsx` `astrology` useMemo | 15-min tick, paused when tab hidden; now timeZone-aware |
| QIE signal bus | `stores/intentionEngine.ts` | Tier 0 `astrology` source, `recordAstrologySignal` (1/day, `auspicious` = Taian); consumed by `system`, `cosmic` |
| Logs (write) | `server/utils/logs.ts` `getLogContext` | Stamps `astro*` fields into every log's `context` using user timeZone |
| Logs (read) | `Logs.tsx` SYS block | Prints `ASTRO: rokuyo · moon phase` |

## Changes this session
1. **Personalization (was pending in v1):** dashboard reading now uses the user's saved `me.timeZone` via `toWallClockDateInZone` (Intl-based; no dayjs tz plugin needed on client; falls back to device time on missing/invalid zone). Dashboard and server log snapshots now agree even when the device zone differs from the profile.
2. **Logs sync (read side):** dashboard appends `• N logged` showing how many of today's log entries carry the same rokuyo in `log.context.astroRokuyo` — a live link between the Astrology block and the Logs stream.
3. `npm run build` (client + server): PASS.

## Current feature state
- Inputs: zodiac hour, Western sign, rokuyo, moon phase/illumination; timeZone-personalized.
- Sync: QIE `astrology` signal → system/cosmic; Logs context stamp (write) + dashboard count (read).
- Still ambient only — no birth data.

## Pending
- Dedicated QIE pattern combining `astrology.auspicious` with goals/intentions (needs full benchmark/wiki/FM sync).
- Per-user opt-in (e.g. birth-year animal via unused `getJapaneseZodiac`) — needs a consented profile field.
- Per-rokuyo mood/energy correlation across historical logs.
