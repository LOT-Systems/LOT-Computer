# LOT Self-Assembly Session Report
## 2026-10-19 | Astrology Widget — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-znwqwp`
**Session type:** Automated / scheduled routine. Builds on `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md`.

## UNDERSTANDING (full state)

The Astrology block shows ambient conditions (Western zodiac, zodiac hour, rokuyo, moon phase and illumination). It is not a natal chart. The User model has no birth data.

| Piece | Location |
|---|---|
| Math (pure, isomorphic) | `src/shared/utils/astrology.ts` |
| Dashboard render (compact + cycling "pro" block) | `src/client/components/System.tsx` |
| Signal bus | `src/client/stores/intentionEngine.ts`: Tier 0 `astrology` source, `recordAstrologySignal`, consumed by `system` and `cosmic` |
| Logs snapshot | `src/server/utils/logs.ts` `getLogContext` writes `astro*` fields into `Log.context` (JSONB); `Logs.tsx` prints `ASTRO:` in the `SYS:` block |

## CHANGES THIS SESSION

1. **User-timezone dashboard reading.** New `toZonedWallClock(date, timeZone)` (Intl-based, falls back to device zone on missing or invalid zone). `System.tsx` now reads the astrology clock in `me.timeZone`. This closes the previous session's pending item: the dashboard and the Logs snapshot now agree for users on a device in a different zone than their profile.
2. **Logs → widget sync ("resonance").** New `getAstrologyResonance(logs, rokuyo)`. It reads the `astroRokuyo` snapshot stored on the user's own `emotional_checkin` logs and returns the most frequent mood state on days with today's rokuyo. The line `Taian days: mostly calm (4/6)` shows under the astrology reading in both layouts. It stays hidden until there are at least 3 samples, so it never claims a pattern from noise.
3. This is the first path where Logs data flows back into the Astrology widget. Previously the flow was one-way, widget → Logs.

## FEATURE BREAKDOWN (current)

- **Inputs:** date math only; no external API and no birth data.
- **Personalization:** user timeZone on both dashboard and Logs snapshot; per-user mood resonance by rokuyo, learned from their own logs.
- **Freshness:** recompute every 15 min while the tab is visible, and immediately when the timeZone changes.
- **Sync:** QIE `astrology` signal once per day (includes a Taian flag); Logs snapshot on every new log; Logs → widget resonance line.
- **Not done:** natal data, which stays out of scope by design.

## TEST

`npm run build` (server + client) passes. Resonance was not exercised against live data in this session; it is a pure function over existing `context.astroRokuyo` and `metadata.emotionalState`. Logs created before 2026-07-27 have no `astro*` fields and are ignored.

## PENDING

- Add a QIE pattern keyed on `astrology` + `goals`/`intentions`. This needs a dedicated benchmark pass with wiki and doctrine sync.
- Extend resonance to moon phase, and to energy/intensity (`metadata.intensity`) as well as mood state.
- `getJapaneseZodiac` and `getMoonEmoji` are still unused.
