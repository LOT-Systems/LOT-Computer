# LOT Self-Assembly Session Report
## 2026-11-03 | Astrology Widget — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-5uyxwa` · **Type:** scheduled routine · **Builds on:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md`

## 1. Understanding (current state)
The Astrology block is ambient (zodiac hour, Western sign, rokuyo, moon phase + illumination), pure date-math in `src/shared/utils/astrology.ts`, no birth data and no external API. It is rendered inline in `System.tsx` (compact block + cycling "pro" block). It feeds:
- **QIE**: `recordAstrologySignal` (Tier 0 `astrology` source, once per day, `auspicious` = Taian), dependency of `system` and `cosmic`.
- **Logs**: `getLogContext()` snapshots `astro*` fields into each `Log.context` (JSONB); `Logs.tsx` prints `ASTRO:` in the `SYS:` block.

## 2. Changes this session
1. **Single source of truth** — new `getAstrologyReading(date)` and `toZonedWallClock(date, timeZone)` (Intl-based, isomorphic) in `astrology.ts`. Server `logs.ts` and client `System.tsx` now share them; removed the server-only `toWallClockDate` duplicate.
2. **Timezone personalization on the dashboard** — closes the 07-27 pending item. The widget now follows `me.timeZone` (falls back to device-local), so the dashboard and Log snapshots agree even when the device zone differs from the profile.
3. **Log echo (Logs → widget sync)** — the widget counts past log entries whose stored `astroMoonPhase` / `astroRokuyo` match today's, and shows `Echo: N logs under this moon · M on <rokuyo>` (hidden when zero). Reads existing log context; no schema change.
4. **Moon emoji** — previously-unused `getMoonEmoji` now rendered beside the phase.

## 3. Verification
`npm run build` (client + server) — PASS. No automated tests cover this block; not exercised in a live browser.

## 4. Feature breakdown (post-session)
| Feature | Status |
|---|---|
| Zodiac hour / sign / rokuyo / moon + % + emoji | live |
| User timeZone aware (dashboard + Logs) | live |
| 15-min off-tab-safe refresh | live |
| QIE `astrology` signal, daily | live |
| Per-log astro snapshot + `ASTRO:` render | live |
| Log echo on widget | live (new) |
| Natal chart / birth data | intentionally absent |

## 5. Pending
- QIE pattern reacting to `astrology` + goals/intentions (e.g. Taian-day nudge) — needs a dedicated benchmark pass.
- Add `logEchoes` to the `astrology` QIE signal metadata.
- Opt-in birth-year animal using `getJapaneseZodiac` (still unused).
- Rokuyo uses a Gregorian-cycle approximation, not the lunisolar calendar — a known accuracy limit.
