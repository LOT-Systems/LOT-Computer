# LOT Self-Assembly Session Report
## 2026-10-05 | Astrology Widget — Personalization + Widget Sync | v2

**Branch:** `claude/practical-curie-5nnb3d`
**Base commit:** `98971f2`
**Session type:** Automated / Scheduled (recurring routine)
**Predecessor:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1, merged)

---

## UNDERSTANDING (full feature map, start of session)

The Astrology block (today's zodiac hour, moon phase, rokuyo) is ambient, not a natal chart. It lives inline in `src/client/components/System.tsx` (compact layout + cycling "pro" block).

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure isomorphic date math: hourly zodiac, Western zodiac, rokuyo, moon phase/illumination |
| Dashboard | `System.tsx` | 15-min recompute (visible tab only), renders block |
| Signal bus | `intentionEngine.ts` | Tier 0 `astrology` source, dependency of `system` + `cosmic`; `recordAstrologySignal` once/day |
| Logs | `src/server/utils/logs.ts` `getLogContext` | Snapshots `astro*` fields into each log's JSONB `context` |
| Journal UI | `Logs.tsx` `SYS:` block | Prints `ASTRO:` per system_snapshot log |

Known limits (unchanged): no birth data exists on `User`; rokuyo is a simplified Gregorian-cycle approximation, not the true lunisolar calendar.

## v1 gaps found this session

1. Dashboard read the **device** clock while Logs used the **profile timeZone** — the same moment could show different readings in the dashboard and the journal.
2. Server and client each re-implemented the reading assembly (duplicate logic).
3. Logs were written to but never read back — no feedback from log history into the block.
4. `getRokuyo` returned `undefined` for dates before 2000 (negative modulo) — would break any future historical log back-fill.

## BUILD (v2)

1. **Time-zone-aware dashboard** — new `toWallClockInZone(instant, tz)` (Intl-only, no plugin, falls back to the instant on a missing/invalid zone). `System.tsx` now computes the reading in `me.timeZone`, matching the Logs snapshot exactly.
2. **Single source** — new `getAstrologyReading(date)`; `System.tsx` and server `getLogContext` both use it (removed the server-only `toWallClockDate` helper).
3. **Logs → Astrology sync (personal resonance)** — new `getLogResonance(logs)` reads each log's saved `astroMoonPhase`/`astroRokuyo` and returns the moon phase + rokuyo the user's own entries cluster under (needs ≥5 tagged entries). When today's moon phase or rokuyo matches, the block appends `• in resonance`. This is the personalization layer: it is learned from the user's behaviour, not birth data.
4. **QIE sync** — `recordAstrologySignal` takes the resonance and emits `resonantMoonPhase`, `resonantRokuyo`, `inResonance` alongside the existing `auspicious` flag, so downstream patterns can key off personal alignment.
5. **Logs UI** — `ASTRO:` line now also shows illumination % and zodiac hour.
6. **Bug fix** — `getRokuyo` uses a positive modulo, so pre-2000 dates return a valid cycle entry.

## TEST

```
npm run build   -> PASS (client esbuild + tsc server)
Helper checks (tsx): 2026-10-05T12:00Z -> Tokyo hour 21, Los Angeles hour 5,
  invalid zone -> unchanged instant; resonance null at 2 entries, populated at 5;
  getRokuyo(1990-01-01) -> 'Senpu' (previously undefined).
```

No unit-test framework runs against these files in the repo; checks above were ad hoc.

## FEATURES BREAKDOWN (state after v2)

- **Inputs:** zodiac hour, Western sign, rokuyo, moon phase + %, all date math.
- **Personalization:** profile-timeZone reading; log-derived resonance (moon phase + rokuyo) with `in resonance` flag. No birth data.
- **Freshness:** 15-minute recompute, paused when tab hidden; also recomputes when the profile time zone changes.
- **Widget sync:** Tier 0 QIE source `astrology` → `system`, `cosmic`; daily `ambient_reading` signal with `auspicious` and `inResonance`.
- **Logs sync:** write path (every log snapshots astro fields) and read path (resonance computed from them), both through the shared reading function.

## PENDING / NEXT

- Author a QIE pattern on `astrology.inResonance` + `goals`/`intentions` (needs full benchmark/wiki/lexicon pass).
- Opt-in birth-year animal (`getJapaneseZodiac`, still unused) as the first explicit personal input.
- Resonance is count-based and unweighted by day; a per-day normalization would stop busy days dominating.
- Daily signal is guarded by a localStorage date; resonance is only included if logs have loaded by then (may be null on first load of the day).
- Replace simplified rokuyo with a true lunisolar calculation.
