# LOT Self-Assembly Session Report
## 2026-11-10 | Astrology Widget — TimeZone Personalization + Logs Resonance | v2

**Branch:** `claude/practical-curie-iybio5`
**Session type:** Automated / Scheduled routine ("The Astrology Widget")
**Prior session:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)

## UNDERSTANDING (current state of the feature)

The Astrology block = ambient conditions (zodiac hour, Western sign, rokuyo, moon phase + illumination). Not a natal chart; no birth data exists in the `User` model.

| Piece | Location |
|---|---|
| Pure math + shared reading helper | `src/shared/utils/astrology.ts` |
| Dashboard render (compact + cycling "pro" block) | `src/client/components/System.tsx` |
| QIE Tier-0 signal `astrology` (daily `ambient_reading`, `auspicious` = Taian) | `src/client/stores/intentionEngine.ts` |
| Per-log snapshot | `src/server/utils/logs.ts` → `LogContext.astro*` |
| Journal display (`SYS:` block, `ASTRO:` line) | `src/client/components/Logs.tsx` |

## CHANGES THIS SESSION

1. **Shared helpers** (`astrology.ts`): `toWallClockDate(date, timeZone)` (Intl-based, invalid zone falls back to the input date) and `getAstrologyReading(date, timeZone)` returning one object with all five readings. Removes duplicated compute logic between server and client.
2. **Client timeZone personalization** (closes v1 pending item): the dashboard block now reads in the user's saved profile `timeZone` (falls back to device time), so it matches what Logs snapshots. Verified: same instant yields different zodiac hour/rokuyo/moon phase for Asia/Tokyo vs America/Los_Angeles.
3. **Server** `getLogContext` now uses `getAstrologyReading` (the local `toWallClockDate` was removed).
4. **Logs → Astrology resonance** (reverse sync): the dashboard block appends `N logs this phase` — count of the user's logs whose `context.astroMoonPhase` equals the current moon phase (also computes the rokuyo count for future use).
5. **Logs display**: `ASTRO:` line now also shows moon illumination % and zodiac hour.

## TESTS
`npm run build` (server tsc + client bundle) — PASS. Helper smoke-tested in node. (The esbuild duplicate-key warning for `elixir_found` in `badges.ts` is pre-existing.)

## FEATURE BREAKDOWN
- **Inputs:** date-math only; no external API.
- **Personalization:** profile timeZone (client + server); resonance count from the user's own log history.
- **Widget sync:** QIE `astrology` source (consumed by `system`, `cosmic`); daily signal.
- **Logs sync:** every new log snapshots the reading; journal shows it; dashboard reads it back.

## PENDING
- QIE pattern keyed on `astrology` + `goals`/`intentions` (Taian-day nudge) — needs a dedicated benchmark pass (wiki/doctrine/FM sync).
- Surface rokuyo resonance (computed, unused); optional opt-in birth-year animal via `getJapaneseZodiac`; `getMoonEmoji` still unused.
- Historic logs predating v1 have no `astro*` context, so resonance counts grow only from new entries.
