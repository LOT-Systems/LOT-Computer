# LOT Self-Assembly Session Report
## 2026-10-10 | Astrology Widget — Personal Resonance + Timezone Sync | v2

**Branch:** `claude/practical-curie-3l3ew8`
**Session type:** Automated / Scheduled (recurring routine)
**Predecessor:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)

## Understanding (full feature map)

The Astrology block is ambient (zodiac hour, Western sign, rokuyo, moon phase + illumination), not a natal chart. It is inlined in `src/client/components/System.tsx`; math lives in `src/shared/utils/astrology.ts` (pure, isomorphic).

| Layer | Where | State |
|---|---|---|
| Math | `shared/utils/astrology.ts` | `getHourlyZodiac`, `getWesternZodiac`, `getRokuyo`, `getMoonPhase`; **new** `getAstrologyResonance`, `toZonedWallClock` |
| Dashboard | `System.tsx` (compact + cycling "pro" block) | 15-min visible-tab recompute (v1); **new** reads `me.timeZone`; **new** resonance line |
| QIE bus | `intentionEngine.ts` | Tier 0 `astrology` source, deps of `system` + `cosmic`, one `ambient_reading` signal/day with `auspicious` (Taian) flag (v1) |
| Logs | `server/utils/logs.ts` `getLogContext` → `LogContext.astro*` | Each new log snapshots the ambient reading in the user's timeZone; shown as `ASTRO:` in `Logs.tsx` (v1) |

## Changes this session

1. **Personal resonance (Logs ↔ widget sync, read direction).** v1 wrote the astro snapshot into every log; the widget now reads it back. `getAstrologyResonance(logs, current)` counts the user's own logs created under the current moon phase and current rokuyo. The dashboard shows e.g. `3 logs under this moon • 5 on Taian days` (dimmed, only once any astro-stamped logs exist). Personalization derives from the user's own history; no birth data.
2. **Timezone-aware client reading.** Closes v1's pending item: the dashboard now evaluates astrology in `me.timeZone` (via `toZonedWallClock`, falling back to device time), so client and server Logs snapshots agree for users on a device set to a different zone.

## Features breakdown (current)

- Inputs: date math only; no external API.
- Freshness: 15-min recompute while tab visible.
- Personalization: user timeZone + resonance with own log history.
- Widget sync: QIE Tier 0 source feeding `system`, `cosmic`; daily signal.
- Logs sync: write (context snapshot) and read (resonance) both live.
- Not implemented by design: natal chart / birth data.

## Verification

`npm run build` (server + client) PASS. Not run: live-site check, unit tests (none cover astrology).

## Pending

- QIE pattern keyed on `astrology` + `goals`/`intentions` (needs dedicated benchmark pass with wiki/doctrine sync).
- Feed resonance counts into the QIE signal metadata.
- Opt-in "birth-year animal" via unused `getJapaneseZodiac`; `getMoonEmoji` still unused.
- Resonance only covers logs created after v1 shipped (older logs lack `astro*`).
