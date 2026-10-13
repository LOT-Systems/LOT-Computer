# LOT Self-Assembly Session Report
## 2026-10-13 | Astrology Widget — TimeZone Personalization + Rokuyo Resonance | v2

**Branch:** `claude/practical-curie-pol6cl` · **Type:** scheduled routine
**Scope:** Astrology block = ambient conditions (zodiac hour, Western sign, rokuyo, moon phase) — not a natal chart.

## Understanding (full map)
| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure date math: hourly zodiac, Western sign, rokuyo, moon phase/illumination; now also `toWallClockDate`, `getRokuyoResonance` |
| Render | `src/client/components/System.tsx` | Inlined block (compact layout + cycling "pro" block: Astrology → Psychology → Journey → Biofield); 15-min visible-tab tick |
| Signal bus | `src/client/stores/intentionEngine.ts` | Tier 0 `astrology` source, `recordAstrologySignal` once/day, dependency of `system` + `cosmic` |
| Logs | `src/server/utils/logs.ts` → `LogContext` | Every log snapshots `astroRokuyo/MoonPhase/MoonIllumination/HourlyZodiac/WesternZodiac`; shown as `ASTRO:` in `Logs.tsx` |

## Changes this session
1. **Shared `toWallClockDate(instant, timeZone)`** (Intl-based, works client + server). Server `getLogContext` now uses it instead of a private dayjs helper — behaviour identical.
2. **Closes the prior pending item:** the dashboard reading now uses the user's saved `me.timeZone` (fallback: device clock), so dashboard and Logs agree on the same moment/day.
3. **Rokuyo resonance (personalization + Logs sync):** `getRokuyoResonance(logs, rokuyo)` reads the `astroRokuyo` snapshot already stamped on `emotional_checkin` logs and surfaces the user's most frequent state on days with today's rokuyo, e.g. `Sensho days: mostly calm (3/5)`. Requires ≥3 check-ins on that rokuyo and a leading state with ≥2 hits; otherwise silent. Rendered in both layouts.

## Verification
`npm run build` (client + server) — PASS. No automated tests cover this block.

## Feature state
- Inputs: pure date math, no external API, no birth data.
- Personalization: saved timeZone; personal rokuyo↔mood resonance from own history.
- Sync: QIE Tier 0 signal (daily), dependency edges to `system`/`cosmic`, Logs context snapshot + `ASTRO:` render, resonance reads Logs back into the widget (two-way).

## Pending / ideas
- Dedicated QIE pattern for auspicious (Taian) days + resonance (needs full wiki/doctrine/lexicon pass).
- Include resonance in the `astrology` QIE signal metadata.
- Moon-phase resonance (same method); opt-in birth-year animal (`getJapaneseZodiac`, unused).
- Existing logs predating 2026-07-27 have no astro snapshot, so resonance builds up over time.
