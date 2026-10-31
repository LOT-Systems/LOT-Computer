# LOT Self-Assembly Session Report
## 2026-10-31 | Astrology Widget — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-niffjw`
**Session type:** Automated / Scheduled (recurring routine). Builds on `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1).

## Standing mission
Evolve the Astrology block (zodiac hour, moon phase, rokuyo — ambient conditions, not a natal chart) for user personalization and widget synchronization, keep it in sync with Logs, and push a full understanding + feature breakdown each session.

## Understanding (state at session start)
| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure date functions: hourly zodiac, Western zodiac, rokuyo, moon phase/illumination, moon emoji (previously unused), Japanese year animal (unused) |
| Dashboard | `src/client/components/System.tsx` | Inline block (compact layout + cycling "pro" block); 15-min tick, paused off-tab |
| Signal bus | `src/client/stores/intentionEngine.ts` | `astrology` Tier 0 QIE source; `recordAstrologySignal` once/day; dependency of `system` and `cosmic` |
| Logs write | `src/server/utils/logs.ts` `getLogContext` | Snapshots astro reading into `Log.context` (JSONB) on every log creation |
| Logs read | `src/client/components/Logs.tsx` | `SYS:` block prints `ASTRO:` line |

**Gap found:** v1 left a mismatch — the Logs snapshot used the user's saved timeZone while the dashboard used device-local time, and the daily QIE signal was keyed on device date. Near zodiac-hour/midnight boundaries (or when the device zone differs from the profile) the dashboard, the QIE signal and the Logs entries could disagree about the same moment. The `toWallClockDate` helper was also private to the server.

## Changes this session
1. **`getWallClockDate(timeZone, now)`** (shared, `Intl.DateTimeFormat`-based, no dayjs-tz dependency so it works on the client, which has no tz plugin). Invalid/missing zone falls back to the instant.
2. **`getAstrologyReading(timeZone, now)`** — one canonical reading (zodiac hour, sign, moon phase/illumination/emoji, rokuyo, `auspicious`). Dashboard, QIE signal and Logs snapshot all call it, so they cannot drift.
3. **Dashboard personalization:** reading now follows `me.timeZone`; the daily QIE signal date key uses the same wall clock; moon emoji shown; Taian (auspicious) days carry a ★.
4. **Logs sync:** `getLogContext` uses the shared reading (private helper removed). The `ASTRO:` line now also shows illumination %, zodiac hour, and ★ on Taian days — fields that were already stored but never displayed.

## Verification
- `npm run build` (client + server): PASS. Only pre-existing warning: duplicate `elixir_found` key in `src/client/utils/badges.ts`.
- Spot check: 2026-10-31T12:00Z → Asia/Tokyo = Pig hour; Pacific/Honolulu = Ox hour; invalid zone falls back without throwing.
- Not tested in a live browser; no live-site access.

## Feature breakdown (current)
- **Inputs:** date math only; no external API; no birth data.
- **Personalization:** timeZone-aware (profile), moon emoji, auspicious-day marker. Still ambient-only by design.
- **Freshness:** 15-min recompute while tab visible.
- **Widget sync:** Tier 0 QIE `astrology` source → `system`, `cosmic`; one `ambient_reading` per day with `auspicious` flag.
- **Logs sync:** every new entry stores the reading; journal shows it.

## Pending / ideas
- QIE pattern keyed on `astrology.auspicious` + goals/intentions (needs full benchmark/wiki treatment).
- Rokuyo is a Gregorian-cycle approximation, not the true lunisolar calendar — accuracy caveat, not changed.
- Historical logs created before v1 have no `astro*` context; could backfill from `createdAt` + stored `timeZone` (pure function, safe).
- `getJapaneseZodiac` still unused (would need opt-in birth year).
