# LOT Self-Assembly Session Report
## 2026-10-26 | Astrology Widget — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-r8m2i7`
**Session type:** Automated / Scheduled (recurring routine)
**Predecessor:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)

---

## UNDERSTANDING — what the Astrology block is

Ambient conditions for "now" — zodiac hour, Western sign, rokuyo (6-day cycle),
moon phase + illumination. Pure date math, no external API, **not** a natal
chart (no birth data exists on `User`).

| Piece | Location | Role |
|---|---|---|
| Math + shared reading | `src/shared/utils/astrology.ts` | `getHourlyZodiac/WesternZodiac/Rokuyo/MoonPhase` plus new `toWallClockDate`, `getAstrologyReading` |
| Dashboard render | `src/client/components/System.tsx` | Basic layout static block; "pro" layout cycles Astrology → Psychology → Journey → Quantum |
| Signal bus | `src/client/stores/intentionEngine.ts` | Tier 0 `astrology` source; `recordAstrologySignal` (once/day, `auspicious` = Taian); dependency of `system`, `cosmic` |
| Logs snapshot | `src/server/utils/logs.ts` `getLogContext` | Writes `astro*` fields into each Log's JSONB `context` |
| Logs render | `src/client/components/Logs.tsx` | `SYS:` block prints `ASTRO:` line |

## WHAT CHANGED THIS SESSION (v2)

1. **Single source of truth.** v1 had the timezone wall-clock trick private to
   the server (dayjs) and the dashboard reading device time — two code paths
   that could disagree. Added `getAstrologyReading(date, timeZone?)` and
   `toWallClockDate` (Intl-based, no dayjs, isomorphic, safe fallback on a
   bad/missing zone) to the shared util.
2. **Dashboard personalized (v1 pending item).** `System.tsx` now reads the
   astrology block in the user's saved `timeZone` (device-local if unset), so
   the dashboard and the Log snapshots always agree. Verified the zone
   matters: 2026-10-26 20:00Z is *Taian* in Asia/Tokyo but *Butsumetsu* in
   America/Los_Angeles.
3. **Logs sync deepened.** `getLogContext` now uses the shared helper (removed
   duplicate server-only code). The journal `ASTRO:` line now shows
   illumination and zodiac hour: `ASTRO: Taian · Full Moon (99%) · Rabbit`.
4. Fixed: the recompute memo now also re-derives when the profile timeZone
   changes.

## FEATURES BREAKDOWN (current state)

- **Inputs:** zodiac hour, Western sign, rokuyo, moon phase/illumination.
- **Personalization:** user `timeZone` (dashboard + Logs). No birth data.
- **Freshness:** recompute every 15 min while the tab is visible.
- **Widget sync:** QIE Tier 0 `astrology` signal, daily; consumed by `system`, `cosmic`.
- **Logs sync:** every new log carries the reading in `context`; shown in `SYS:`.

## VERIFICATION

- `tsc -p tsconfig.server.json` — clean
- `npm run client:build` — completed (pre-existing duplicate-key warning in intentionEngine.ts, unrelated)
- Helper spot-check across Tokyo / Los Angeles / invalid zone — correct

## PENDING / FUTURE

- QIE pattern reacting to `astrology` + goals/intentions (needs a dedicated self-assembly pass).
- Daily-signal throttle key still uses device date, not the user's timeZone date.
- Opt-in birth-year animal (`getJapaneseZodiac`) / `getMoonEmoji` still unused.
- Retroactive astrology for logs created before v1 (could be derived from `createdAt` + timeZone at render time).
