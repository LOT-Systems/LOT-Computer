# LOT Self-Assembly Session Report
## 2026-10-29 | Astrology Widget — Timezone Personalization + Log Resonance | v2

**Branch:** `claude/practical-curie-tjiwjb`
**Session type:** Automated / Scheduled (recurring routine)
**Predecessor:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md`

## UNDERSTANDING (current state)

The Astrology block is inlined in `src/client/components/System.tsx` (compact and cycling "pro" layouts). Pure date-math lives in `src/shared/utils/astrology.ts` (zodiac hour, Western sign, rokuyo, moon phase + illumination). It is ambient only: no birth data and no natal chart. Other pieces:

- Signal bus: `intentionEngine.ts` registers `astrology` as a Tier 0 source (`recordAstrologySignal`, once per day, `auspicious` flag on Taian). `system` and `cosmic` depend on it.
- Logs: `getLogContext()` (`src/server/utils/logs.ts`) snapshots `astroRokuyo/MoonPhase/MoonIllumination/HourlyZodiac/WesternZodiac` onto every new Log's `context`, using the user's saved timeZone. `Logs.tsx` shows `ASTRO:` in the `SYS:` block.
- Freshness: 15-minute tick, paused while the tab is hidden.

## CHANGES THIS SESSION

1. **Timezone personalization (client).** The dashboard reading now uses the user's saved `timeZone` via `Intl.DateTimeFormat`, so it matches the Logs snapshot. It falls back to device time if the zone is missing or invalid. This closes a pending item from v1. To make it work, `timeZone` is now exposed in `UserProfile` (server `useProfileView` and the shared type).
2. **Log resonance (Logs sync).** New shared helper `getAstroLogResonance(logs, current)` counts past logs whose stored astro snapshot shares today's moon phase or rokuyo. Logs written before the snapshot existed are skipped. The block shows a dim line: `N logs under this moon • M on <Rokuyo> days`. It stays hidden until at least one log carries a snapshot.

## FEATURES BREAKDOWN

| Feature | Status |
|---|---|
| Zodiac hour / Western sign / rokuyo / moon phase+% | live |
| Timezone-aware (server logs and dashboard) | live (dashboard new) |
| 15-min refresh, off-tab safe | live |
| QIE `astrology` signal, daily | live |
| Log snapshot + journal `ASTRO:` line | live |
| Log resonance line | new |
| Dedicated QIE pattern on auspicious days | pending |
| `getJapaneseZodiac`, `getMoonEmoji` | unused |

## VERIFICATION

`npm run build` passes (server and client). A full `tsc --noEmit` still shows errors in `intentionEngine.ts` and `MicroGameWidget.tsx` that predate this session and are unrelated. Nothing new appears in the touched files.

## NEXT

- Add a QIE pattern keyed on `astrology.auspicious` plus goals/intentions.
- Add an optional mood-by-moon-phase correlation from the log snapshots.
- Widen the `IntentionSignal['source']` union to clear the existing type errors.
