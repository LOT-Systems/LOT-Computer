# LOT Self-Assembly Session Report
## 2026-10-27 | Astrology Widget — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-30c9gk`
**Session type:** Automated / Scheduled (recurring routine)
**Predecessor:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)

---

## 1. UNDERSTANDING (full feature map, post-session)

The Astrology block shows **ambient** conditions — zodiac hour, Western sign,
rokuyo, moon phase + illumination. It is not a natal chart; no birth data exists.

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure isomorphic fns. **New:** `toWallClockDate(date, tz)` and `getAstrologyReading(date, tz)` — one bundle used by client and server |
| Dashboard block | `src/client/components/System.tsx` | Inline (no standalone component); compact layout + cycling "pro" block (Astrology → Psychology → Journey → Quantum) |
| Signal bus | `src/client/stores/intentionEngine.ts` | Tier 0 `astrology` source, dependency of `system` and `cosmic`; `recordAstrologySignal()` once per day (`auspicious` = Taian) |
| Logs (write) | `src/server/utils/logs.ts` `getLogContext(user)` | Snapshots reading into `Log.context` (JSONB) in the user's timeZone, for every log-creating route |
| Logs (read) | `src/client/components/Logs.tsx` | `SYS:` block prints `ASTRO:` line |

## 2. CHANGES THIS SESSION

1. **Personalization (closes v1 pending item):** the dashboard reading now uses
   the user's saved `timeZone` (`me.timeZone`) instead of device-local time, so
   the block and the Logs snapshot agree. Falls back to device time when unset
   or invalid. Implemented with `Intl.DateTimeFormat` (client dayjs has no tz
   plugin).
2. **Single source of truth:** the server's local `toWallClockDate` and the
   client's inline computation were replaced by the shared
   `getAstrologyReading`. Removes duplicated logic that could drift.
3. **Logs → widget sync:** the block appends `• N logged` when N log entries
   created today (user's timeZone day) carry today's rokuyo stamp.
4. **Richer Logs render:** `ASTRO:` now prints
   `rokuyo · moon (illum%) · hourly zodiac · western sign` — fields were already
   stored, previously unshown.
5. **Daily QIE signal** is now keyed on the user's timeZone day, not device day.

## 3. FEATURE BREAKDOWN

- **Inputs:** date math only; no external API; no personal birth data.
- **Personalization anchor:** saved profile timeZone (dashboard + Logs).
- **Freshness:** 15-min recompute while tab visible.
- **Widget sync:** QIE `astrology` signal → `system`, `cosmic`; Logs count shown in block.
- **Logs sync:** every new entry stamped; journal displays the full reading.
- **Known quirk:** `getMoonPhase` / `getRokuyo` use absolute-time arithmetic, so
  the wall-clock shift moves results by at most hours; unchanged behavior.

## 4. VERIFICATION

```
npm run server:build -> PASS
npm run client:build -> PASS (pre-existing duplicate-key warning in badges.ts, unrelated)
```
No test suite covers this feature; behavior not exercised in a browser this session.

## 5. PENDING

- Dedicated QIE pattern reacting to `astrology` + `goals`/`intentions` (needs full
  self-assembly pass: wiki/doctrine/lexicon/FM sync).
- Mood/energy vs. moon-phase correlation computed from stamped Logs.
- `getJapaneseZodiac`, `getMoonEmoji` still unused.
