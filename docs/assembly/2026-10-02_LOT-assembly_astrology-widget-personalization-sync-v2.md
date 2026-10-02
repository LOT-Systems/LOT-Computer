# LOT Self-Assembly Session Report
## 2026-10-02 | Astrology Widget — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-1eqqgk`
**Session type:** Automated / Scheduled (recurring routine)
**Builds on:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md`

## Mission
Standing instruction: evolve the Astrology block (zodiac hour, moon phase,
rokuyo — ambient conditions, not a natal chart) for personalization and widget
sync, keep it synchronized with Logs, and push a full understanding + features
breakdown each session.

## Understanding (full map)
| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure date-math: `getHourlyZodiac`, `getWesternZodiac`, `getRokuyo`, `getMoonPhase`, `getJapaneseZodiac` (unused), `getMoonEmoji` (unused), **new** `getAstrologyResonance` |
| Display | `src/client/components/System.tsx` | Inlined (no standalone component). Compact layout block + cycling "pro" block (Astrology → Psychology → Journey → Quantum). 15-min tick, paused off-tab |
| Signal bus | `src/client/stores/intentionEngine.ts` | `astrology` Tier 0 source; `recordAstrologySignal` once/day; dependency of `system` and `cosmic` |
| Logs write | `src/server/utils/logs.ts` `getLogContext` | Stamps `astroRokuyo/MoonPhase/MoonIllumination/HourlyZodiac/WesternZodiac` (user timeZone) on every new log's JSONB `context` |
| Logs read | `src/client/components/Logs.tsx` | `SYS:` block prints `ASTRO: rokuyo · moon` |
| Personal data | `User.timeZone/city/country` only | No birth data exists — ambient-only by design |

## Changes this session
1. **Client timeZone personalization** (resolves v1 pending item): the dashboard
   reading now uses `me.timeZone` (via `toLocaleString` wall-clock conversion,
   since the client dayjs has no tz plugin), falling back to device time. The
   dashboard and the Logs snapshot now agree even on a device set to another zone.
2. **Logs → widget feedback loop**: new pure helper `getAstrologyResonance(logs,
   current)` counts the user's own past entries stamped with today's rokuyo /
   moon phase. The Astrology block shows a dim line, e.g. `4 of 18 logs on Taian
   days`, once ≥3 stamped logs exist. Entries predating v1 (no stamp) are skipped.

## Features breakdown (current state)
- **Inputs:** western sign, zodiac hour, rokuyo, moon phase + illumination %.
- **Personalization:** timeZone-aware on both client and server; personal
  resonance line derived from the user's own Logs.
- **Freshness:** 15-min recompute while visible; recompute on timeZone change.
- **Widget sync:** QIE `astrology` signal (daily, with `auspicious` Taian flag);
  cascade graph links to `system`, `cosmic`.
- **Logs sync:** write-side stamp on every entry; read-side `ASTRO:` display;
  new aggregate read-back into the widget.
- **Not implemented:** natal chart, birth data, year-animal.

## Verification
`npm run build` (server tsc + client esbuild) — PASS.

## Pending
- Dedicated QIE pattern keyed on `astrology` + goals/intentions (needs full
  benchmark pass: wiki/doctrine/lexicon/FM sync).
- Feed `getAstrologyResonance` result into `recordAstrologySignal` metadata.
- Opt-in "birth-year animal" via `getJapaneseZodiac` if personal data is ever added.
- Resonance is count-only; no significance test — keep wording non-causal.
