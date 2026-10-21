# LOT Self-Assembly Session Report
## 2026-10-21 | Astrology Widget — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-h6b7uq`
**Session type:** Automated / Scheduled (recurring routine)
**Predecessor:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)

---

## UNDERSTANDING (full feature map, post-session)

The Astrology block is ambient (zodiac hour, Western sign, moon phase + illumination, rokuyo), not a natal chart. No birth data exists on `User`; personalization is built on `user.timeZone` and the user's own log history.

| Piece | Location | Role |
|---|---|---|
| Math + shared helpers | `src/shared/utils/astrology.ts` | `getHourlyZodiac`, `getWesternZodiac`, `getRokuyo`, `getMoonPhase`; **new** `getAstrologyReading`, `toWallClockDate(timeZone)`, `getAstroEcho` |
| Dashboard block | `src/client/components/System.tsx` | Compact + "pro" cycling block (Astrology → Psychology → Journey → Quantum); recomputes every 15 min while tab visible |
| Signal bus | `src/client/stores/intentionEngine.ts` | Tier 0 `astrology` source; `recordAstrologySignal` (once/day); consumed by `system`, `cosmic` in `WIDGET_DEPENDENCY_MAP` |
| Logs snapshot | `src/server/utils/logs.ts` `getLogContext` | Writes `astro*` fields into each log's JSONB `context`, using the user's saved timeZone |
| Logs UI | `src/client/components/Logs.tsx` | `ASTRO: rokuyo · moon` line in the `SYS:` block |

## CHANGES THIS SESSION

1. **Profile time zone on the dashboard.** The pending item from v1: the client block now reads `me.timeZone` through `toWallClockDate` (Intl-based, no new dependency, falls back to device time on missing/invalid zone). Dashboard and Logs snapshots now agree on the same wall-clock reading.
2. **Astro echo (personalization from Logs).** `getAstroEcho` counts the user's past logs whose `context.astroRokuyo` / `astroMoonPhase` match today's. Shown under the reading in both layouts, e.g. `3 of 41 logs under Taian · 5 under Waxing Gibbous`. Hidden until the user has logs carrying astro context.
3. **Echo flows into the QIE.** `recordAstrologySignal` takes an optional `echo` and records `echoRokuyoCount`, `echoMoonCount`, `echoTracked` in signal metadata, so future patterns can key on personal history, not just the day's reading.
4. **De-duplication.** `getLogContext` now uses `getAstrologyReading` instead of four separate calls; client and server compute the reading identically.

## VERIFICATION

- `npm run build` (client + server): PASS.
- Node smoke test of `toWallClockDate('Asia/Tokyo')`, `getAstrologyReading`, `getAstroEcho`: correct output.
- No automated tests exist for this area; not added this session.

## FEATURE STATE

- **Inputs:** date math only, no external API, no birth data.
- **Personalization:** saved time zone (dashboard + logs) and personal echo counts from log history.
- **Freshness:** 15-minute recompute while visible.
- **Widget sync:** Tier 0 QIE `astrology` source → `system`, `cosmic`; daily `ambient_reading` signal with `auspicious` (Taian) flag and echo counts.
- **Logs sync:** every new log carries the reading; journal shows it. Logs created before 2026-07-27 have no astro context and are excluded from echo counts.

## PENDING / NEXT

- Author a QIE pattern that uses `auspicious` + echo counts with goals/intentions (needs a dedicated benchmark pass: pattern number, wiki/doctrine/lexicon/FM sync).
- Correlate echo with mood/energy per rokuyo (needs a mood field on logs or a join with mood signals).
- Opt-in birth-year animal using unused `getJapaneseZodiac`; `getMoonEmoji` still unused.
- Daily signal throttle uses device-local date; consider the profile zone there too.
