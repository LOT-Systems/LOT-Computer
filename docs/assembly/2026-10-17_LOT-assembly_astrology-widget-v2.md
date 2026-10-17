# LOT Self-Assembly Session Report
## 2026-10-17 | Astrology Widget — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-wil6pi`
**Session type:** Automated / Scheduled (recurring routine)
**Builds on:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)

---

## UNDERSTANDING (full feature map, post-session)

The Astrology block is ambient (zodiac hour, Western sign, moon phase +
illumination, rokuyo) — pure date math, no birth data, not a natal chart.

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | `getHourlyZodiac`, `getWesternZodiac`, `getRokuyo`, `getMoonPhase`; **new:** `getWallClockDate(timeZone)` and `getAstrologyReading(timeZone)` |
| Dashboard | `src/client/components/System.tsx` | Astrology block (compact + cycling "pro" layout); 15-min tick, paused off-tab |
| Signal bus | `src/client/stores/intentionEngine.ts` | Tier 0 `astrology` source, `recordAstrologySignal` (daily, `auspicious` = Taian), dependency of `system` and `cosmic` |
| Logs write | `src/server/utils/logs.ts` `getLogContext` | Snapshots the reading onto each log's `context` (`astro*` fields) |
| Logs read | `src/client/components/Logs.tsx` | `SYS:` block prints `ASTRO:` line |

## CHANGES THIS SESSION

1. **Single source of truth.** The reading is now produced by one shared
   function, `getAstrologyReading(timeZone)`, used by both the dashboard and
   the server Logs snapshot. Removes the dayjs-based `toWallClockDate` helper
   from the server and the duplicated per-field computation in `System.tsx`.
   `getWallClockDate` uses `Intl.DateTimeFormat`, so it is isomorphic and
   falls back to the raw instant on an invalid/missing timeZone.
2. **Personalization (closes v1 pending item).** The dashboard block now reads
   the user's saved profile `timeZone` (`stores.me`) instead of device-local
   time, so block and journal agree when the device clock differs from the
   profile.
3. **Logs synchronization (read direction).** The dashboard now reads back the
   `astro*` snapshots on the user's logs and shows
   `N logs under {rokuyo}` in the Astrology block when N > 0 (both layouts).
   Previously sync was write-only (dashboard → log).
4. **Journal line enriched.** `ASTRO:` in Logs now shows
   `{rokuyo} · {moon} ({illumination}%) · {zodiac hour}`, using fields that were
   already stored but never displayed.

## FEATURES BREAKDOWN

- **Ambient inputs:** zodiac hour, Western sign, rokuyo, moon phase/illum.
- **Personalization:** timeZone-aware on both client and server (profile tz).
- **Freshness:** 15-min recompute while tab visible.
- **Widget sync:** QIE Tier 0 `astrology` signal, one `ambient_reading`/day.
- **Logs sync:** write (context snapshot per entry), read (rokuyo-day count on
  dashboard), display (`ASTRO:` line in journal).
- **By design not implemented:** natal chart / birth data.

## VERIFICATION

`npm run build` (server tsc + client bundle) — PASS. No automated tests cover
this block; the timeZone path was not exercised in a browser this session.

## PENDING / FUTURE

- Dedicated QIE pattern keyed on `astrology` + `goals`/`intentions` (needs a
  full self-assembly pass with wiki/doctrine/lexicon sync).
- Use the new log snapshots for richer correlation (e.g. mood by moon phase).
- `getJapaneseZodiac` / `getMoonEmoji` still unused.
- Existing logs created before 2026-07-27 have no `astro*` context, so the
  rokuyo count only reflects newer entries.
