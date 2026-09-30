# LOT Self-Assembly Session Report
## 2026-09-30 | Astrology Widget — Personalization + Widget Sync + Logs Sync | v2

**Branch:** `claude/practical-curie-k8k2xa`
**Session type:** Automated / Scheduled (recurring routine)
**Predecessor:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)

## Standing instruction
Evolve the Astrology block (today's zodiac hour, moon phase, rokuyo — ambient
conditions, not a personal natal chart) for user personalization and widget
synchronization, keep it synchronized with Logs entries, push a full
understanding + features breakdown each session.

## Understanding (state at session start)
- **Math:** `src/shared/utils/astrology.ts` — pure functions `getHourlyZodiac`, `getWesternZodiac`, `getRokuyo`, `getMoonPhase` (phase + illumination %), plus unused `getJapaneseZodiac`, `getMoonEmoji`.
- **Dashboard:** inlined in `src/client/components/System.tsx` (compact block + cycling "pro" block: Astrology → Psychology → My Journey → Quantum). Recomputed every 15 min while tab visible.
- **QIE bus:** `intentionEngine.ts` — Tier 0 `astrology` source, dependency of `system` and `cosmic`; `recordAstrologySignal` emits one `ambient_reading` per calendar day (with `auspicious` = Taian flag).
- **Logs:** `getLogContext(user)` in `src/server/utils/logs.ts` snapshots the reading into `Log.context` (JSONB, `astro*` fields); `Logs.tsx` renders it in the `SYS:` block as `ASTRO:`.
- **Gap found:** the dashboard read device-local time while Logs used the user's saved timeZone, and each had its own copy of the assembly logic — the two could disagree (e.g. viewing from a device in another zone), and the server used a dayjs wall-clock hack.

## Changes this session
1. **Shared `getWallClockDate(now, timeZone)` + `getAstrologyReading(now, timeZone)`** in `astrology.ts`. Intl-only (no dayjs tz plugin needed on client), invalid/missing zone falls back to device time.
2. **Dashboard personalization:** `System.tsx` now derives the reading from `me.timeZone` (user's saved profile zone), recomputing on zone change. Dashboard and Logs now always agree for a given user.
3. **Logs sync:** `getLogContext` uses the same shared function (removed the duplicate `toWallClockDate` hack); `Logs.tsx` `ASTRO:` line now also shows the zodiac hour captured at entry time (`ASTRO: Taian · Full Moon · Horse`).
4. Verified: Tokyo vs Los Angeles at the same instant yield different rokuyo/zodiac hour/illumination; bogus zone falls back safely.

## Features breakdown (post-session)
| Feature | Status |
|---|---|
| Western zodiac, zodiac hour, rokuyo, moon phase + illumination | Live (pure date math, no API) |
| User personalization | Saved-profile timeZone anchor (dashboard + logs). No natal/birth data by design |
| Freshness | 15-min tick, paused off-tab |
| QIE sync | Tier 0 `astrology` source; daily `ambient_reading` signal; deps of `system`, `cosmic` |
| Logs sync | Per-entry snapshot (5 `astro*` context fields), rendered in journal |
| Unified code path | One shared `getAstrologyReading` for client + server |

## Test
`npm run build` (client + server tsc) — PASS. Pre-existing duplicate-key warning in `badges.ts` (`elixir_found`) is unrelated.

## Pending / ideas
- QIE pattern reacting to `astrology` + `goals`/`intentions` (auspicious-day nudge) — needs a dedicated benchmark pass.
- Journal insight: aggregate Log `astro*` context vs mood (e.g. mood on Taian vs Butsumetsu days) — data is now being collected.
- Opt-in "birth-year animal" via `getJapaneseZodiac`; use `getMoonEmoji` in the block.
- Extract the inline block into its own `AstrologyWidget` component.
