# LOT Self-Assembly Session Report
## 2026-11-09 | Astrology Widget — Personalization + Widget Sync | v2

**Branch:** `claude/practical-curie-ql28r4`
**Session type:** Automated / Scheduled (recurring routine)
**Builds on:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)

## Understanding (current architecture)

The Astrology block (zodiac hour, Western sign, rokuyo, moon phase) is
ambient, not a natal chart. No birth data exists on `User`.

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure date math; v2 adds `toWallClockInZone`, `summarizeAstrologyLogs` |
| Dashboard | `src/client/components/System.tsx` | Compact + "pro" cycling block share one `astrology` memo (15-min tick, paused off-tab) |
| Signal bus | `src/client/stores/intentionEngine.ts` | Tier 0 `astrology` source; `recordAstrologySignal` once/day; dependency of `system`, `cosmic` |
| Logs write | `src/server/utils/logs.ts` `getLogContext` | Snapshots `astro*` fields on every log, user-timeZone aware |
| Logs read | `src/client/components/Logs.tsx` | `SYS:` block prints `ASTRO: rokuyo · moon` |

## Changes this session (v2)

1. **Client timeZone personalization** (closes v1 pending item): the dashboard
   reading is now computed in `profile.timeZone` via `toWallClockInZone`
   (Intl-based, falls back to device time if unset/invalid). Dashboard and
   Logs snapshot now agree even when the device zone differs from the profile.
2. **Logs → Astrology reverse sync**: `summarizeAstrologyLogs` reads the
   `astro*` snapshot stored on each log and counts logs written today and
   logs written under the current rokuyo / moon phase. The block now appends
   `• N today • M on <Rokuyo>` (only when logs with a reading exist). Together
   with v1's forward sync this makes Logs ↔ Astrology bidirectional.

## Feature breakdown (state after v2)

- Inputs: zodiac hour, Western zodiac, rokuyo, moon phase + illumination.
- Personalization: user `timeZone` on both client display and server log snapshot.
- Freshness: 15-minute recompute, visible tab only; also recomputes on timeZone change.
- Widget sync: Tier 0 QIE source, daily `ambient_reading` signal with `auspicious` (Taian) flag.
- Logs sync: write-side snapshot (v1) + read-side summary on the widget (v2).
- Not implemented by design: natal data (birth date/time/place).

## Verification

`npm run build` (client + server) PASS. Pre-existing duplicate-key warnings in
`src/client/utils/badges.ts` are unrelated.

## Pending

- Dedicated QIE pattern combining `astrology` with goals/intentions (needs full benchmark pass).
- Include `sameRokuyo` log count in the daily QIE signal metadata.
- Logs filter/grouping by moon phase or rokuyo in `Logs.tsx`.
- `getJapaneseZodiac`, `getMoonEmoji` still unused.
- Older logs predate v1 and carry no `astro*` snapshot; the summary counts only logs that have one.
