# LOT Self-Assembly Session Report
## 2026-11-08 | Astrology Widget — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-o1s9t1`
**Session type:** Automated / Scheduled (recurring routine)
**Builds on:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md`

## Understanding (full feature map)

The Astrology block is ambient (zodiac hour, Western sign, rokuyo, moon phase) — not a natal chart. No birth data exists on `User`; personalization anchors on `user.timeZone`.

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure isomorphic readers; **new** `getAstrologyReading(date)` is the single source of truth |
| Dashboard | `src/client/components/System.tsx` | Compact + cycling "pro" block; 15-min visible-tab tick |
| Signal bus | `src/client/stores/intentionEngine.ts` | Tier 0 `astrology` source, `recordAstrologySignal` (once/day), consumed by `system` + `cosmic` in `WIDGET_DEPENDENCY_MAP` |
| Logs | `src/server/utils/logs.ts` `getLogContext` → `LogContext` | Snapshots reading onto every log entry (user timeZone) |
| Journal UI | `src/client/components/Logs.tsx` | `SYS:` block prints `ASTRO:` line |

## Changes this session

1. **Shared helper** `getAstrologyReading(date)` returns hourly zodiac, western sign, moon phase/illumination/emoji, rokuyo, `auspicious` (Taian). Dashboard and server Logs now both use it, so they cannot drift.
2. **Rokuyo bug fix**: `getRokuyo` used UTC instants (`getTime()` vs `new Date('2000-01-01')` UTC), so the day flipped at UTC midnight regardless of the user's wall clock, and negative day differences (pre-2000) produced a negative index. Now uses the Date's local Y/M/D fields with a positive modulo. This makes the timeZone-aware wall-clock approach actually correct for rokuyo.
3. **Dashboard personalization**: the client reads the clock in the user's saved profile `timeZone` (via `Intl.DateTimeFormat.formatToParts`, falling back to device time) — same anchor as Logs. Resolves the 07-27 pending item. Recomputes when timeZone changes.
4. **Display**: moon emoji and a ★ marker on auspicious (Taian) days in both dashboard layouts.
5. **Logs sync**: new `astroAuspicious` field in `LogContext`; journal prints `ASTRO: Taian ★ · 🌔 Waxing Gibbous`.

## Features breakdown (post-session)

- Inputs: pure date math, no API, no birth data.
- Personalization: profile timeZone on both client and server; device time fallback.
- Freshness: 15-min recompute while tab visible.
- Widget sync: QIE Tier 0 `astrology` signal, daily, with `auspicious` flag; dependents `system`, `cosmic`.
- Logs sync: all 5 astro fields + auspicious flag stored per entry in JSONB `context` (no migration).

## Verification

`npm run build` (client + server) — PASS. Pre-existing duplicate-key warnings in `badges.ts` are unrelated.

## Pending / future

- Author a QIE pattern keyed on `astrology.auspicious` + goals/intentions (needs full benchmark/self-assembly pass).
- Backfill: logs created before 07-27 have no astro context; could be derived at render time from `createdAt`.
- `getJapaneseZodiac` still unused (would need opt-in birth year).
