# LOT Self-Assembly Session Report
## 2026-10-08 | Astrology Widget — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-75ddmq`
**Session type:** Automated / Scheduled (recurring routine)
**Builds on:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md`

---

## 1. UNDERSTANDING (full feature map)

The Astrology block is ambient — zodiac hour, Western sign, rokuyo, moon phase/illumination. It is not a natal chart. No birth data exists in the `User` model, and none is added.

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure isomorphic functions: `getHourlyZodiac`, `getWesternZodiac`, `getRokuyo`, `getMoonPhase`. New this session: `toWallClockDate`, `countAstroLogMatches`. `getJapaneseZodiac` and `getMoonEmoji` are still unused. |
| Dashboard | `src/client/components/System.tsx` | Inlined block. Compact layout is static. Pro layout cycles Astrology → Psychology → Journey → Quantum. Recomputes every 15 min, paused while the tab is hidden. |
| Signal bus | `src/client/stores/intentionEngine.ts` | `astrology` is a Tier 0 source. `system` and `cosmic` depend on it. `recordAstrologySignal` emits one `ambient_reading` per day. |
| Logs (write) | `src/server/utils/logs.ts` `getLogContext` | Snapshots rokuyo, moon phase/illumination, hourly zodiac and Western sign into `Log.context` (JSONB), using the user's saved timeZone. |
| Logs (read) | `src/client/components/Logs.tsx` | `SYS:` block prints the `ASTRO:` line. |

## 2. CHANGES THIS SESSION

1. **Dashboard personalization.** The client now reads `me.timeZone` through the new `toWallClockDate(date, tz)`. It uses `Intl.DateTimeFormat`, so it needs no dayjs plugin and falls back to device time on a missing or invalid zone. This closes the July pending item: a user on a device set to a different zone now sees the reading for their profile zone, matching the Logs snapshot.
2. **Logs → Astrology sync (read direction).** `countAstroLogMatches(logs, rokuyo, moonPhase)` counts the user's past logs written under today's rokuyo or moon phase. The block appends `• N logs on <Rokuyo>` when N > 0, in both layouts.
3. **Astrology → QIE enrichment.** `recordAstrologySignal` takes an optional `logsOnSameRokuyo` and adds it to the signal metadata. Future patterns can use it to compare the user's activity on auspicious and inauspicious days.
4. **Richer log render.** The `ASTRO:` line in `Logs.tsx` now also shows moon illumination % and hourly zodiac when present. Older logs without those fields render as before.

## 3. FEATURE STATE (post-session)

- **Inputs:** date math only, no external API, no birth data.
- **Personalization:** user timeZone (dashboard and Logs), plus the user's own log history (match count).
- **Freshness:** 15-minute tick, paused while the tab is hidden.
- **Widget sync:** Tier 0 QIE source `astrology`, consumed by `system` and `cosmic`. Daily signal now carries `auspicious` (Taian) and `logsOnSameRokuyo`.
- **Logs sync:** two-way. Writes at log creation, reads in the dashboard match count and the Logs render.

## 4. VERIFICATION

`npm run build` passed (client bundle and server `tsc`). No dedicated astrology tests exist in the repo, and none were added.

## 5. PENDING / NEXT

- Author a QIE pattern that keys off `astrology` + `goals`/`intentions` (auspicious-day nudge). It needs the full benchmark treatment (wiki, lexicon, Field Manual).
- Reuse `toWallClockDate` in `server/utils/logs.ts` (it still has its own dayjs copy).
- Per-rokuyo log-density insight, e.g. "you log most on Senpu".
- Opt-in birth-year animal using `getJapaneseZodiac`, only if the ambient-only constraint is relaxed.
