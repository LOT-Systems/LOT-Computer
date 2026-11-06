# LOT Self-Assembly Session Report
## 2026-11-06 | Astrology Widget — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-dgigfn`
**Session type:** Automated / Scheduled (recurring routine)
**Builds on:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md`

## UNDERSTANDING (full feature map)

The Astrology block (today's zodiac hour, moon phase, rokuyo — ambient
conditions, not a natal chart) is inlined in `src/client/components/System.tsx`
(compact layout `Block label="Astrology:"` + cycling "pro" block:
Astrology → Psychology → My Journey → Biofield).

| Piece | Location | Role |
|---|---|---|
| Math + reading | `src/shared/utils/astrology.ts` | Pure isomorphic: `getHourlyZodiac`, `getWesternZodiac`, `getRokuyo`, `getMoonPhase`; **new** `toWallClockDate(tz)` and `getAstrologyReading(tz)` |
| Dashboard | `System.tsx` | `astrology` memo (15-min tick, paused off-tab), once-per-day QIE signal |
| Signal bus | `intentionEngine.ts` | Tier 0 `astrology` source; `recordAstrologySignal` (`ambient_reading`, `auspicious` = Taian); consumed by `system`, `cosmic` |
| Logs write | `src/server/utils/logs.ts` `getLogContext` | Snapshots `astro*` fields into each Log's JSONB `context` |
| Logs read | `Logs.tsx` `SYS:` block | `ASTRO:` line |

No natal data exists on the User model; personalization rests on `timeZone`.

## CHANGES THIS SESSION

1. **Single source of truth for the reading.** `getAstrologyReading(timeZone)` in
   the shared util replaces duplicated per-field calls on server and client.
   `toWallClockDate` uses `Intl.DateTimeFormat` (no dayjs-tz dependency, works
   on client where the tz plugin isn't loaded). Invalid/missing zone falls back
   to device time.
2. **Dashboard now uses the user's saved timeZone** (`me.timeZone`) — closes the
   v1 pending item; dashboard and Logs snapshot now always agree.
3. **Logs → widget sync (personalization).** New `astroLogSync` memo counts the
   user's own past Log entries written under today's rokuyo and moon phase;
   shown as `Your log: N under <Rokuyo> • M under <Phase>` in the Astrology view.
4. **Richer Logs `ASTRO:` line:** now `rokuyo · phase (illum%) · zodiac hour`.

## FEATURES BREAKDOWN (state after session)

- Inputs: zodiac hour, Western sign, rokuyo, moon phase + illumination (date math only).
- Personalization: user timeZone; per-user log-history counts under current conditions.
- Freshness: 15-min recompute, visible tab only.
- Sync: QIE Tier 0 signal (daily), Log context snapshot (every entry), dashboard↔Logs read-back.
- Not implemented by design: natal chart / birth data.

## VERIFICATION

`npm run build` → PASS (client + server). Runtime check of
`getAstrologyReading` for Asia/Tokyo, Pacific/Auckland, invalid zone → correct,
differing wall-clock results, no throw. (Pre-existing duplicate-key warnings in
`badges.ts` unrelated.)

## PENDING

- QIE pattern keyed on `astrology` + goals/intentions (needs dedicated benchmark pass).
- Mood-by-rokuyo correlation once enough logs carry `astro*` context (older logs lack it).
- Unused: `getJapaneseZodiac`, `getMoonEmoji`.
