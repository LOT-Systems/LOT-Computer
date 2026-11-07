# LOT Self-Assembly Session Report
## 2026-11-07 | Astrology Widget — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-lpiocz`
**Session type:** Automated / Scheduled (recurring routine)
**Builds on:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)

## Understanding (full feature map)

The Astrology block = ambient conditions (zodiac hour, Western sign, rokuyo, moon phase + illumination). Not a natal chart; no birth data exists on `User`.

| Piece | Location | Role |
|---|---|---|
| Math + shared helpers | `src/shared/utils/astrology.ts` | `getHourlyZodiac`, `getWesternZodiac`, `getRokuyo`, `getMoonPhase`; **new** `toWallClockDate`, `getAstrologyReading`, `getLogAlignment` |
| Dashboard render | `src/client/components/System.tsx` | Compact layout + cycling "pro" block (Astrology → Psychology → Journey → Quantum) |
| Signal bus | `src/client/stores/intentionEngine.ts` | Tier 0 `astrology` source; `recordAstrologySignal` once/day; dependency of `system`, `cosmic` |
| Logs snapshot | `src/server/utils/logs.ts` `getLogContext` | Writes `astro*` fields into each log's `context` JSONB |
| Logs render | `src/client/components/Logs.tsx` | `SYS:` block prints `ASTRO: rokuyo · moon (illum%)` |

## Changes this session

1. **Single source of truth.** Server and client previously could diverge (server used a dayjs-tz hack, client used device time). Both now call `getAstrologyReading(instant, timeZone)`, an Intl-based isomorphic helper. Invalid timeZone falls back safely to device time.
2. **Personalization.** Dashboard reading now follows the user's saved profile `timeZone` (`me.timeZone`) rather than the device clock — resolves v1 pending item. Recomputes when the profile timeZone changes.
3. **Logs synchronization (two-way).** Logs already received the reading at write time; now the dashboard reads logs back: `getLogAlignment` counts entries written under the current rokuyo, shown inline as e.g. `3/42 logs under Taian`. Logs UI also shows moon illumination %.
4. **QIE signal.** Daily throttle key now includes timeZone, so a timeZone change re-records the reading. Signal payload shape unchanged (`auspicious` = Taian).
5. `auspicious` is now exposed on the shared reading object for any widget to use.

## Verification

`npm run build` (client + server): PASS. Node smoke test of helpers: Tokyo vs Los Angeles give different zodiac hours for the same instant (Horse vs Dog); bad zone falls back; alignment counts correct, null-context logs skipped.

## Feature state (post-session)

- Inputs: date-math only, timeZone-aware (profile), no external API.
- Freshness: 15-min tick while tab visible.
- Widgets: QIE Tier 0 `astrology` → `system`, `cosmic`.
- Logs: written into every log context; read back as alignment stat on dashboard.
- Not implemented: natal data (by design).

## Pending / next

- QIE pattern keyed on `astrology` + goals/intentions (Taian nudge) — needs dedicated benchmark/self-assembly pass.
- Per-rokuyo/moon-phase mood or energy correlation from log context (needs mood data joined to astro snapshot).
- `getJapaneseZodiac`, `getMoonEmoji` still unused.
- Old logs lack `astro*` context; no backfill (could derive from `createdAt` + stored timeZone).
