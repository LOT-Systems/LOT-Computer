# LOT Self-Assembly Session Report
## 2026-10-14 | Astrology Block — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-e7eqel`
**Session type:** Automated / scheduled routine. Repo inspection only; live site not accessed.
**Scope:** the Astrology block (zodiac hour, Western zodiac, rokuyo, moon phase) is ambient conditions, not a natal chart.

---

## 1. Understanding (full map)

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure functions: `getHourlyZodiac`, `getWesternZodiac`, `getRokuyo`, `getMoonPhase`; new this session: `toWallClockDate`, `getAstrologyReading` |
| Dashboard | `src/client/components/System.tsx` | Computes the reading; renders it in the compact layout and in the cycling pro block (Astrology → Psychology → My Journey → Quantum) |
| Signal bus | `src/client/stores/intentionEngine.ts` | `astrology` is a Tier 0 source; `system` and `cosmic` depend on it; `recordAstrologySignal` emits one `ambient_reading` per day, with an `auspicious` flag for Taian |
| Logs (server) | `src/server/utils/logs.ts` `getLogContext` | Snapshots the reading onto every new log's `context` JSONB (`astro*` fields in `LogContext`) |
| Logs (UI) | `src/client/components/Logs.tsx` | `SYS:` block prints the `ASTRO:` line |

No birth data exists in the `User` model. Personalization is built only on the saved `timeZone`, plus per-viewer preferences.

## 2. Changes this session

1. **One shared timezone-aware reading.** `getAstrologyReading(date, timeZone)` and `toWallClockDate` use `Intl.DateTimeFormat`, so there is no dayjs dependency. They fall back to the input date if the timeZone is missing or invalid. The server and client now compute the reading identically.
2. **Dashboard uses the profile timeZone** (`me.timeZone`). Before, it used device-local time and could disagree with the Logs snapshot when the device was in another zone. This closes the "client display should read user.timeZone" item left pending in v1.
3. **View preference persists.** The last-viewed block in the cycling pro widget is saved in `localStorage` (`astrology_view`) and restored on mount. Access is wrapped in try/catch.
4. **Logs line enriched.** `ASTRO:` now shows moon illumination and zodiac hour, e.g. `ASTRO: Taian · Waxing Gibbous (74%) · Horse`.
5. **Server de-duplication.** `getLogContext` drops its private wall-clock helper and calls the shared function.

## 3. Features breakdown (current state)

- **Inputs:** date-math only, with no external API. Zodiac hour, Western sign, rokuyo (six-day cycle), moon phase and illumination %.
- **Personalization:** saved timeZone drives the reading everywhere; the last-viewed block is remembered per device.
- **Freshness:** recomputes every 15 minutes while the tab is visible.
- **Widget sync:** Tier 0 QIE source consumed by `system` and `cosmic`, with a daily `ambient_reading` signal.
- **Logs sync:** every new log carries the reading at creation time. The journal shows rokuyo, phase, illumination % and hour. Existing logs created before 2026-07-27 have no astro fields, and the UI hides the line for them.

## 4. Verification

`npm run build` (client and server) passes. The only warning is a pre-existing duplicate `elixir_found` key in `badges.ts`. No tests were run: the checked-in suite does not cover these paths.

## 5. Pending / next

- Author a QIE pattern keyed on the `astrology` signal plus goals/intentions (Taian-day nudge). It needs a full benchmark pass: pattern number, wiki, doctrine and Field Manual sync.
- Optionally show `getMoonEmoji` next to the phase.
- Optionally let a Logs filter group entries by rokuyo or moon phase, now that the data is captured per entry.
- `getJapaneseZodiac` stays unused. It would only be used for an opt-in birth-year feature, which would break the ambient-only rule.
