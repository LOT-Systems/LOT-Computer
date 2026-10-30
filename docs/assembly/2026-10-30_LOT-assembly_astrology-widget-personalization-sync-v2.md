# LOT Self-Assembly Session Report
## 2026-10-30 | Astrology Widget — Personalization + Widget Sync | v2

**Branch:** `claude/practical-curie-6cs59d`
**Session type:** Automated / Scheduled (recurring routine)
**Builds on:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)

---

## UNDERSTANDING (full feature map, post-session)

The Astrology block shows ambient conditions (zodiac hour, Western sign, rokuyo,
moon phase + illumination), not a personal natal chart. No birth data exists on
the `User` model; personalization is built on `user.timeZone` and the user's own Logs.

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure functions: `getHourlyZodiac`, `getWesternZodiac`, `getRokuyo`, `getMoonPhase`; **new** `toWallClockInZone`, `countLogsOnRokuyo`. `getJapaneseZodiac`, `getMoonEmoji` still unused |
| Dashboard | `src/client/components/System.tsx` | Computes the reading (15-min tick, paused off-tab); renders in compact layout and in the cycling "pro" block (Astrology → Psychology → My Journey → Biofield) |
| Signal bus | `src/client/stores/intentionEngine.ts` | Tier 0 `astrology` source; dependency of `system` and `cosmic`; `recordAstrologySignal` fires once per calendar day |
| Logs (write) | `src/server/utils/logs.ts` `getLogContext` | Snapshots the reading (user's timeZone) into `Log.context` (`astroRokuyo`, `astroMoonPhase`, `astroMoonIllumination`, `astroHourlyZodiac`, `astroWesternZodiac`) |
| Logs (read) | `src/client/components/Logs.tsx` | `SYS:` block prints `ASTRO:` line |

## CHANGES THIS SESSION

1. **Timezone personalization on the dashboard.** The client previously used
   device-local time (v1 pending item). New `toWallClockInZone(date, tz)`
   (Intl-based, no dayjs tz plugin needed on the client; falls back to the
   device clock for a missing/invalid zone) makes the dashboard reading use
   `me.timeZone`, the same basis as the server-side Logs snapshot, so dashboard
   and Logs now agree.
2. **Logs → widget sync (new direction).** Previously data flowed widget→Logs only.
   `countLogsOnRokuyo(logs, rokuyo)` reads the snapshotted `context.astroRokuyo`
   from the user's past logs; the block now shows e.g. "3 entries logged on
   Taian days" (compact and pro layouts, hidden when zero).
3. **QIE signal enriched.** `recordAstrologySignal` takes optional
   `rokuyoLogCount`, included in the daily `ambient_reading` metadata so future
   patterns can key off personal history against the day's rokuyo.
4. **Logs render.** `ASTRO:` line now also shows moon illumination % and the
   hourly zodiac already stored in context.

## TEST

`npm run build` (server tsc + client bundle) — PASS. One mid-session JSX error
(ternary branch needed a fragment) was fixed before the green build.

## FEATURES BREAKDOWN

- Inputs: date math only, no external API, no birth data.
- Personalization: user timeZone (dashboard + Logs), user's own log history per rokuyo.
- Freshness: 15-min recompute while tab visible.
- Widget sync: QIE Tier 0 `astrology`, consumed by `system`, `cosmic`; daily signal incl. `auspicious` (Taian) and `rokuyoLogCount`.
- Logs sync: every new log carries the reading; dashboard reads it back.
- Limitation: affinity counts only logs created after v1 (older logs lack astro context); the count reflects the loaded `useLogs()` page.

## PENDING

- Dedicated QIE pattern reacting to `astrology` + goals/intentions (needs a full benchmark pass: pattern number, wiki/doctrine/lexicon/FM sync).
- Optional: most-active-rokuyo summary; opt-in birth-year animal via `getJapaneseZodiac`; use `getMoonEmoji`.
