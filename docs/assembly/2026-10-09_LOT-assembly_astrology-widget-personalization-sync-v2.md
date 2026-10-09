# LOT Self-Assembly Session Report
## 2026-10-09 | Astrology Widget — Personalization + Widget Sync | v2

**Branch:** `claude/practical-curie-ffuzqh`
**Session type:** Automated / Scheduled (recurring routine)
**Builds on:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)

## UNDERSTANDING (full feature map, current)

The Astrology block is ambient (zodiac hour, Western sign, rokuyo, moon phase + illumination) — pure date math, no natal data. It lives inline in `src/client/components/System.tsx` (compact layout + cycling "pro" block: Astrology → Psychology → My Journey → Biofield).

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | `getHourlyZodiac`, `getWesternZodiac`, `getRokuyo`, `getMoonPhase`; **new** `getWallClockDate`, `getAstrologyResonance` |
| Client compute | `System.tsx` `astrology` useMemo | 15-min tick (visible tab only); now reads the user's saved timeZone |
| QIE bus | `intentionEngine.ts` | `astrology` Tier 0 source; `recordAstrologySignal` once/day; dependency of `system`, `cosmic` |
| Logs write | `src/server/utils/logs.ts` `getLogContext` | Snapshots `astro*` fields into each log's JSONB context (user timeZone) |
| Logs read | `Logs.tsx` `SYS:` block | Prints `ASTRO: rokuyo · moon phase` |

## CHANGES THIS SESSION

1. **Profile timeZone on the client.** `getWallClockDate(timeZone)` (Intl-based, isomorphic, falls back to device clock on missing/invalid zone). The dashboard reading now matches what the server stamps into Logs, even when the device clock is in another zone. Closes v1's pending item.
2. **Logs → Astrology feedback (personalization).** `getAstrologyResonance(logs, rokuyo, moonPhase)` counts the user's own entries written under today's rokuyo and moon phase. Both render sites show `Logs: N on <rokuyo> days • M under <moon phase>`; hidden until at least one log carries astro context (entries before 2026-07-27 are untracked).

## FEATURES BREAKDOWN

- Inputs: ambient date math only. Personalization anchors: saved `timeZone`, and the user's own Logs history.
- Freshness: 15-min recompute, paused off-tab; recomputes on timeZone change.
- Sync out: QIE `astrology` signal (daily, `auspicious` = Taian); Logs context snapshot per entry.
- Sync in: Logs resonance line on the block.
- Not implemented by design: natal chart / birth data.

## VERIFICATION
`npm run build` (server + client): PASS.

## PENDING
- QIE pattern reacting to `astrology` + goals/intentions (needs a dedicated benchmark pass).
- Feed resonance counts into the QIE astrology signal metadata.
- `getJapaneseZodiac`, `getMoonEmoji` still unused.
