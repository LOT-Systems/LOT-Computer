# LOT Self-Assembly Session Report
## 2026-10-06 | Astrology Widget — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-o1rtyr`
**Session type:** Automated / scheduled routine
**Builds on:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)

---

## 1. Full understanding of the feature

The Astrology block shows **ambient** conditions — zodiac hour, Western sign,
rokuyo, moon phase/illumination. It is not a natal chart; no birth data exists
on the `User` model.

| Piece | Location | Role |
|---|---|---|
| Math + helpers | `src/shared/utils/astrology.ts` | Pure/isomorphic: `getHourlyZodiac`, `getWesternZodiac`, `getRokuyo`, `getMoonPhase`, `getMoonEmoji`, plus (new) `toWallClockInZone`, `getAstrologyReading`, `getLogResonance` |
| Widget | `src/client/components/System.tsx` | Inlined in the dashboard: compact layout block + cycling "pro" block (Astrology → Psychology → Journey → Biofield) |
| Signal bus | `src/client/stores/intentionEngine.ts` | Tier 0 `astrology` source; `recordAstrologySignal` (once/day, `auspicious` = Taian); dependency of `system` and `cosmic` |
| Logs snapshot | `src/server/utils/logs.ts` `getLogContext` | Stamps `astro*` fields on every log's `context` (JSONB) |
| Logs display | `src/client/components/Logs.tsx` | `SYS:` block prints `ASTRO: rokuyo · moon phase` |

## 2. Changes this session

1. **One shared reading path.** `getAstrologyReading(date)` returns the full
   reading; the server (`getLogContext`) and client widget both use it, so the
   widget and Logs can no longer drift. The server-only `toWallClockDate`
   helper was removed.
2. **Client honors the saved timeZone.** v1's open item. The widget now reads
   `me.timeZone` through `toWallClockInZone` (Intl-based, no dayjs-tz plugin
   needed on the client). Invalid/missing zone falls back to device-local time.
3. **Personalization via Logs ("resonance").** `getLogResonance` counts the
   user's own logs stamped under the current rokuyo / moon phase. The widget
   appends `N/M logs under <rokuyo>` once the user has stamped logs. This is
   the first place Logs data flows back into the widget.
4. **Moon emoji** (`getMoonEmoji`, previously unused) now prefixes the moon phase.

## 3. Feature state

- **Inputs:** date math only, no API, no birth data.
- **Personalization:** profile timeZone + the user's own log history (resonance).
- **Freshness:** 15-min tick while the tab is visible; also re-derives on timeZone change.
- **Widget sync:** QIE Tier 0 `astrology` signal, daily; consumed by `system`, `cosmic`.
- **Logs sync:** write path (context snapshot) and read path (resonance in widget) both live.

## 4. Verification

- `npm run build` (server tsc + client esbuild): PASS. Existing duplicate-key
  warnings in `badges.ts` are pre-existing and unrelated.
- Helper smoke test (tsx): Tokyo wall-clock rolls 2026-10-06T23:30Z to the 7th;
  invalid zone returns the input; resonance counts match.
- Not verified: live rendering in a browser; no unit-test suite covers this block.

## 5. Pending / future

- QIE pattern keyed on `astrology` + `goals`/`intentions` (needs a full
  benchmark/self-assembly pass with wiki/doctrine sync).
- Include resonance counts in the daily `ambient_reading` signal metadata.
- Pre-existing logs have no `astro*` stamp; resonance only counts new entries
  (no backfill; would need a migration deriving from `createdAt` + `timeZone`).
- Optional opt-in "birth-year animal" via `getJapaneseZodiac` remains out of scope.
