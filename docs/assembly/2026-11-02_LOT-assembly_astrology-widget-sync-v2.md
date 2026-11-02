# LOT Self-Assembly Report — Astrology Widget Personalization + Sync | v2
**Date:** 2026-11-02 · **Branch:** `claude/practical-curie-3hbbo6` · **Type:** scheduled routine

## Understanding (full)
The Astrology block (zodiac hour, Western sign, rokuyo, moon phase + illumination) is ambient, not a natal chart. It is inlined in `src/client/components/System.tsx` (compact layout + cycling "pro" block). Math is in `src/shared/utils/astrology.ts` (pure, isomorphic). It is wired into:
- **QIE** (`intentionEngine.ts`): Tier 0 `astrology` source, dependency of `system` and `cosmic`; one `ambient_reading` signal per day (`auspicious` = Taian).
- **Logs** (`server/utils/logs.ts` `getLogContext`): every new log snapshots `astroRokuyo/MoonPhase/MoonIllumination/HourlyZodiac/WesternZodiac` using the user's saved timeZone; `Logs.tsx` shows `ASTRO:` in the `SYS:` block.
- No birth data exists in the `User` model; personalization is timeZone/log-history based.

## This session (v2)
1. **Timezone-aware dashboard reading** — client now derives the reading from `me.timeZone` (via `Intl.DateTimeFormat` wall-clock passthrough; client dayjs has no tz plugin), so dashboard and Logs snapshots agree on any device. Falls back to device time.
2. **Logs resonance** — new pure `getAstrologyResonance(logs, current)` in `astrology.ts` counts past log entries written under today's rokuyo / moon phase. Shown as a dim line under the Astrology reading once ≥5 astro-stamped logs exist (e.g. "3 logs on Taian days · 5 under Waxing Gibbous"). This is the first personalization derived from the user's own history.

## Feature state
Inputs: pure date math. Personalization: profile timeZone + personal log resonance. Freshness: 15-min tick off-tab safe. Sync: QIE signal + Logs context + Logs-derived resonance on the dashboard. Not done: natal data (by design).

## Build
`npm run build` — server + client PASS.

## Pending
- QIE pattern keyed on `astrology` + goals/intentions (needs full benchmark session).
- Feed resonance back into QIE as signal metadata; use `getJapaneseZodiac`/`getMoonEmoji` in an opt-in view.
- Resonance only counts logs after 2026-07-27 (older logs lack astro context); could backfill from `createdAt`.
