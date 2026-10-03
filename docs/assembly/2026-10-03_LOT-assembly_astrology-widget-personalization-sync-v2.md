# LOT Self-Assembly Session Report
## 2026-10-03 | Astrology Widget — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-l7lbr0`
**Session type:** Automated / Scheduled (recurring routine)
**Predecessor:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)

---

## UNDERSTANDING (full feature map, post-session)

The Astrology block = today's **ambient** conditions (zodiac hour, Western sign,
rokuyo, moon phase + illumination). Not a natal chart: no birth data exists on
the `User` model by design.

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure isomorphic functions + (new) `getWallClockDate`, `summarizeAstroLogs` |
| Dashboard block | `src/client/components/System.tsx` | Inline in the master dashboard (compact block + cycling "pro" block: Astrology → Psychology → My Journey → Biofield) |
| Signal bus | `src/client/stores/intentionEngine.ts` | Tier 0 `astrology` source; consumed by `system`, `cosmic`; `recordAstrologySignal` once/day |
| Logs snapshot (write) | `src/server/utils/logs.ts` `getLogContext` | Stamps `astro*` fields on every log's `context` JSONB, user-timeZone aware |
| Logs display (read) | `src/client/components/Logs.tsx` | `SYS:` block prints `ASTRO:` line |
| Profile | `src/server/models/user.ts` `useProfileView` | Now exposes `timeZone` to the client |

## WHAT CHANGED THIS SESSION

1. **Client-side timezone personalization (closes v1 pending item).** The
   dashboard previously read device-local time while Logs used the saved profile
   timeZone — a device in another zone showed a different zodiac hour/rokuyo than
   the logs it wrote. New shared `getWallClockDate(timeZone)` (Intl-only, no
   dayjs dependency, safe fallback on missing/invalid zone) is now used by **both**
   System.tsx and `getLogContext`, so dashboard and journal always agree. The
   server's private `toWallClockDate` helper was removed in favor of it.
   Requires `timeZone` in `/me`, so it was added to `useProfileView` and the
   `UserProfile` type (optional field; not sensitive).
2. **Logs → Astrology personalization ("resonance").** New
   `summarizeAstroLogs(logs)` tallies the `astro*` snapshots on the user's own
   logs: top rokuyo, top moon phase, top zodiac hour, % of entries on Taian days.
   The Astrology block shows e.g. *"You log most on Taian · Waxing Gibbous · hour
   of the Dragon (23 entries)"* once ≥5 stamped entries exist (below that it
   stays hidden to avoid noise).
3. **Astrology → QIE sync enriched.** The daily `ambient_reading` signal now
   carries `logResonance { sampled, topRokuyo, taianShare }`, so future patterns
   can key on "user's habitual conditions" vs "today's conditions".
4. **Logs display completeness.** `ASTRO:` line now also prints moon
   illumination % and zodiac hour (all data was already stored).

## FEATURE BREAKDOWN (current state)

- **Inputs:** zodiac hour, Western zodiac, rokuyo (simplified 6-day cycle, not
  lunisolar), moon phase/illumination — pure date math, no API.
- **Personalization:** user saved timeZone (dashboard + logs); per-user log
  resonance line derived from their own history.
- **Freshness:** recompute every 15 min while tab visible.
- **Widget sync:** QIE Tier 0 `astrology`; deps of `system` + `cosmic`; daily
  signal incl. `auspicious` (Taian) flag and log resonance.
- **Logs sync:** write (context snapshot at creation) and read (`ASTRO:` line +
  resonance summary) both live.

## TEST

`npm run build` (client + server tsc) PASS. `tsc --noEmit` shows only
pre-existing errors in unrelated files (none on touched lines). Helper
sanity-checked at runtime: for 2026-10-03T12:00Z, Tokyo→21h, Los Angeles→5h,
invalid zone→fallback; resonance tally correct.

## KNOWN LIMITS / PENDING

- Daily QIE signal fires once on first load; if logs haven't loaded yet,
  `logResonance` is `{sampled:0}` for that day (acceptable; next day is correct).
- Resonance only counts logs created since v1 (older logs lack `astro*`).
- `getRokuyo` is a simplified Gregorian approximation; true rokuyo needs the
  lunisolar calendar. Candidate for a correctness pass.
- Still deferred: dedicated QIE pattern reacting to `astrology` + goals/intentions
  (needs full benchmark/self-assembly treatment); `getJapaneseZodiac` /
  `getMoonEmoji` remain unused.
