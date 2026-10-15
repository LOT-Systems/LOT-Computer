# LOT Self-Assembly Session Report
## 2026-10-15 | Astrology Widget — Personalization + Widget Sync | v2

**Branch:** `claude/practical-curie-vp9rmt`
**Session type:** Automated / Scheduled (recurring routine)
**Builds on:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md`

## UNDERSTANDING (full feature map, current)

The Astrology block is ambient conditions (zodiac hour, Western sign, rokuyo, moon phase + illumination) — not a natal chart. No birth data exists on `User`; personalization is anchored on `user.timeZone`.

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure isomorphic date math (`getHourlyZodiac`, `getWesternZodiac`, `getRokuyo`, `getMoonPhase`; `getJapaneseZodiac`, `getMoonEmoji` still unused) |
| Dashboard | `src/client/components/System.tsx` | `astrology` useMemo, 15-min visible-tab tick; two render sites (compact + cycling pro block) |
| Signal bus | `src/client/stores/intentionEngine.ts` | Tier 0 `astrology` source; `recordAstrologySignal` once/day (localStorage-gated); dependency of `system` and `cosmic` |
| Logs (write) | `src/server/utils/logs.ts` `getLogContext` | Snapshots astro fields into each Log `context` JSONB, using the user's timeZone |
| Logs (read) | `src/client/components/Logs.tsx` | `SYS:` block prints `ASTRO:` line |

## CHANGES THIS SESSION

1. **Dashboard now reads time in the user's saved profile timeZone** (`System.tsx`), using the same wall-clock rebuild as the server's Logs snapshot. Dashboard and newly written logs now agree even when the device timezone differs from the profile (closes the v1 "pending" item). Invalid zone strings fall back to device time.
2. **Client dayjs gained the `timezone` plugin** (`src/client/utils/dayjs.ts`) — previously `.tz()` was server-only.
3. **Logs `ASTRO:` line enriched**: now `rokuyo · moonPhase (illum%) · hourlyZodiac`, mirroring the dashboard block so a log can be matched to the dashboard reading at that moment (fields were already stored, just not shown).

## TEST

`npm run build` (client + server tsc) — PASS.

## FEATURE STATE

- Inputs: date math only, no external API, no birth data.
- Personalization: user profile timeZone (dashboard + logs).
- Freshness: 15-min recompute while tab visible.
- Widget sync: QIE Tier 0 `astrology` source → `system`, `cosmic`; daily `ambient_reading` signal with `auspicious` (Taian) flag.
- Logs sync: every new log carries the ambient reading; displayed in `SYS:` block.

## PENDING

- Dedicated QIE pattern reacting to `astrology` + goals/intentions (needs full self-assembly pass: pattern number, wiki/doctrine/lexicon/FM sync).
- Existing logs predating v1 have no astro context (no backfill).
- Optional opt-in "birth-year animal" via `getJapaneseZodiac` if personal data is ever allowed.
