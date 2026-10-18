# LOT Self-Assembly Session Report
## 2026-10-18 | Astrology Widget — Timezone Personalization + Log Affinity | v2

**Branch:** `claude/practical-curie-43emr5`
**Session type:** Automated / Scheduled (recurring routine)
**Predecessor:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)

---

## MISSION BRIEF

Standing instruction: evolve the Astrology block (zodiac hour, moon phase,
rokuyo — ambient conditions, not a natal chart) for user personalization and
synchronization with other widgets and Logs; push a full understanding +
features breakdown each session.

---

## PHASE 0 — UNDERSTANDING (state at session start)

The block is inlined in `src/client/components/System.tsx` (compact layout and
the cycling "pro" block: Astrology → Psychology → My Journey → Quantum).

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure isomorphic date math: hourly zodiac (Chinese 2h animals), Western sign, rokuyo (6-day cycle from 2000-01-01), moon phase + illumination |
| Compute | `System.tsx` `astrology` useMemo | Re-ticks every 15 min while tab visible |
| QIE bus | `intentionEngine.ts` | `astrology` is a Tier 0 source; `system` and `cosmic` depend on it; `recordAstrologySignal` emits one `ambient_reading` per day (with `auspicious` = Taian) |
| Logs (server) | `src/server/utils/logs.ts` `getLogContext` | Stamps `astroRokuyo/MoonPhase/MoonIllumination/HourlyZodiac/WesternZodiac` on every new log, using the user's saved timeZone |
| Logs (UI) | `Logs.tsx` `SYS:` block | Prints `ASTRO: {rokuyo} · {moonPhase}` |

Gaps found: (1) dashboard still read device-local time while Logs used the
profile timeZone, so the two could disagree for travelers or mis-set devices;
(2) the per-log astro snapshots were written but never read back to
personalize anything.

---

## PHASE 1 — BUILD (this session)

1. **Timezone-consistent dashboard** — new isomorphic
   `toWallClockDate(date, timeZone)` in `astrology.ts` (Intl-based, no new
   dependency, falls back to the input date on empty/invalid zone). The
   `astrology` useMemo now reads the clock in `me.timeZone`, so dashboard and
   Logs agree. Memo re-derives if the profile timeZone changes.
2. **Logs → dashboard sync (personalization)** — new pure
   `getAstrologyLogAffinity(logs, rokuyo, moonPhase)` counts the user's own
   logs written under today's rokuyo and moon phase from the stored `astro*`
   snapshots. The block shows a second line, e.g.
   `Logged under Taian: 4 • Waxing Gibbous: 2`, in both layouts. Hidden until
   at least one log carries a snapshot (older logs are ignored, no backfill).

Not changed: server `logs.ts` keeps its own `toWallClockDate` (moment-based);
unifying it with the shared helper is a safe future cleanup.

---

## PHASE 2 — TEST

```
npm run build  -> PASS (client esbuild + tsc server)
```
One build failure mid-session (JSX sibling inside a ternary in the pro layout)
was fixed by wrapping in a fragment. Smoke check of the compiled helpers:
`toWallClockDate(2026-10-18T12:00Z, 'Asia/Tokyo').getHours() === 21`, invalid
zone returns the input date, affinity counts as expected. No automated test
suite covers this block.

---

## PHASE 3 — FEATURES BREAKDOWN (post-session)

- **Inputs:** zodiac hour, Western sign, rokuyo, moon phase + illumination;
  pure date math, no external API, no birth data.
- **Personalization:** timeZone-aware (profile) on both dashboard and Logs;
  per-user log-affinity line derived from their own history.
- **Freshness:** 15-minute re-tick while visible.
- **Widget sync:** Tier 0 QIE `astrology` source → `system`, `cosmic`; daily
  `ambient_reading` signal with `auspicious` flag.
- **Logs sync:** write side (context snapshot per log) and read side
  (`SYS: ASTRO:` line + dashboard affinity) are both live.
- **Not implemented by design:** natal chart / birth data.

---

## PENDING / FUTURE WORK

- QIE pattern reacting to `astrology` + `goals`/`intentions` (needs a full
  benchmark session: pattern number, wiki/doctrine/lexicon/FM sync).
- Include affinity counts in the daily `ambient_reading` signal metadata so
  other widgets can key off it.
- Mood-by-rokuyo correlation (join `astro*` snapshots with mood logs).
- Unify server and shared `toWallClockDate`; `getJapaneseZodiac` and
  `getMoonEmoji` remain unused.

---

*LOT Self-Assembly Engine — automated session*
