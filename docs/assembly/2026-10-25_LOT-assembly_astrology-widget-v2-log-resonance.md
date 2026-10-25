# LOT Self-Assembly Session Report
## 2026-10-25 | Astrology Widget — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-lvg50z`
**Session type:** Automated / Scheduled (recurring routine)
**Predecessor:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)

## FULL UNDERSTANDING (current state)

The Astrology block is ambient (zodiac hour, Western sign, rokuyo, moon phase +
illumination) — **not** a natal chart. No birth data exists on `User`.

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure isomorphic date math; v2 adds `toZonedWallClock`, `summarizeAstroLogs` |
| Dashboard render | `src/client/components/System.tsx` | Inline block (compact + cycling "pro" layout), 15-min visible-tab tick |
| Signal bus | `src/client/stores/intentionEngine.ts` | Tier 0 `astrology` source, `recordAstrologySignal` once/day, consumed by `system`, `cosmic` |
| Logs write | `src/server/utils/logs.ts` `getLogContext` | Snapshots `astro*` fields (user timeZone) onto every log's `context` JSONB |
| Logs read | `src/client/components/Logs.tsx` | `SYS:` block prints `ASTRO:` line |

## FEATURES ADDED IN v2

1. **Dashboard honors the saved profile timeZone** (v1 pending item). The block
   now computes from `me.timeZone` via `toZonedWallClock` (Intl-based; falls
   back to device time on missing/invalid zone), so it matches the zone stamped
   on Logs.
2. **Log resonance (Logs → widget sync).** `summarizeAstroLogs` counts the
   user's own log entries by the astro snapshot they were written under. The
   Astrology block appends `N logs on <Rokuyo> days` when the current rokuyo
   has history. Purely derived from existing entries; no new storage.
3. **Richer Logs readout.** `ASTRO:` line now also shows moon illumination %
   and zodiac hour when present, matching the widget.

## FEATURE INVENTORY (whole block)

- Inputs: zodiac hour, Western sign, rokuyo, moon phase/illumination.
- Personalization: timeZone-aware (dashboard + logs); personal log resonance.
- Sync: QIE Tier 0 signal (daily, `auspicious` = Taian); Logs context snapshot
  and journal display; widget reads logs back.
- Freshness: 15-minute recompute, paused when tab hidden.

## VERIFICATION

`npm run build` (client + server) — PASS. Pre-existing duplicate-key warnings
in `badges.ts` are unrelated. No unit tests exist for these helpers.

## PENDING

- Dedicated QIE pattern using `astrology` + `goals`/`intentions` (needs full
  self-assembly pass: wiki/doctrine/lexicon/FM).
- Resonance by mood/outcome (not just counts) once log answers carry a numeric
  score to correlate.
- Opt-in birth-year animal via `getJapaneseZodiac` (needs a profile field and
  consent decision; out of scope while ambient-only).
- Unused `getMoonEmoji`.
