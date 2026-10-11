# LOT Self-Assembly Session Report
## 2026-10-11 | Astrology Widget — Personalization + Widget Sync | v2

**Branch:** `claude/practical-curie-v5xj73`
**Session type:** Automated / Scheduled (recurring routine)
**Previous session:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md`

## UNDERSTANDING (full feature map)

The Astrology block is inlined in `src/client/components/System.tsx` (compact layout + cycling "pro" block: Astrology → Psychology → My Journey → Biofield). It shows ambient conditions only — Western zodiac, zodiac hour, rokuyo, moon phase + illumination. No natal/birth data exists or is collected.

| Layer | Location | State |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure date-math. New this session: `toZonedWallClock`, `getAstrologyLogResonance` |
| Dashboard | `System.tsx` | 15-min recompute (visible tab only); now follows `me.timeZone` |
| Signal bus | `intentionEngine.ts` | Tier 0 `astrology` source; one `ambient_reading`/day; now carries `logsUnderSameRokuyo` |
| Logs write | `src/server/utils/logs.ts` `getLogContext` | Snapshots `astro*` fields per entry in the user's timeZone |
| Logs read | `Logs.tsx` `SYS:` block | `ASTRO:` line, now includes zodiac hour |

## CHANGES THIS SESSION

1. **Client timeZone parity (closes prior pending item):** dashboard reading uses the user's saved `timeZone` via `toZonedWallClock` (Intl-based, no new deps), so dashboard and Logs snapshots agree even when the device zone differs from the profile. Falls back to device time.
2. **Logs → Astrology sync (reverse direction):** `getAstrologyLogResonance` counts past log entries whose stored snapshot matches the current rokuyo / moon phase. Dashboard shows `• N logs under <Rokuyo>` when N > 0.
3. **QIE enrichment:** `recordAstrologySignal` takes optional `logsUnderSameRokuyo` (default 0, backward compatible) so future patterns can key off personal history, not just the calendar.
4. **Logs display:** `ASTRO:` line adds the zodiac hour.

## VERIFICATION

`npm run build` (client + server tsc) — PASS.

## FEATURES BREAKDOWN (current)

- Inputs: zodiac hour, Western sign, rokuyo, moon phase/illumination — ambient, no external API.
- Personalization: timeZone-aware; personal-history resonance from the user's own logs. Still no natal chart (by design).
- Freshness: 15-min tick, paused off-tab.
- Widget sync: Tier 0 QIE source feeding `system`/`cosmic`; daily signal with `auspicious` + resonance.
- Logs sync: write-side snapshot per entry; read-side resonance on dashboard.

## PENDING

- QIE pattern reacting to `astrology` + `goals`/`intentions` (needs full benchmark/wiki sync).
- Resonance for moon phase (computed, not yet displayed) and per-hour zodiac.
- Optional user toggle for which astrology fields display; opt-in Japanese-zodiac birth-year animal (`getJapaneseZodiac`, `getMoonEmoji` still unused).
- Older logs predating 2026-07-27 have no snapshot; resonance counts only newer entries.
