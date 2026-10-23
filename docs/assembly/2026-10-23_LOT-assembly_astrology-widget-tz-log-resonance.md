# LOT Self-Assembly Session Report
## 2026-10-23 | Astrology Widget — TimeZone Unification + Log Resonance | v2

**Branch:** `claude/practical-curie-7lks4s`
**Session type:** Automated / Scheduled (recurring routine)
**Builds on:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md`

---

## UNDERSTANDING (full feature map)

The Astrology block is inlined in `src/client/components/System.tsx` (compact
layout + cycling "pro" block: Astrology → Psychology → My Journey → Biofield).
Math lives in `src/shared/utils/astrology.ts` (pure, isomorphic): zodiac hour,
Western sign, rokuyo (6-day cycle), moon phase + illumination. It is **ambient
only** — no natal data exists on `User`; personalization anchors are
`timeZone`, `city`, `country` and the user's own Logs.

Sync surfaces:
- **QIE bus** — `astrology` Tier 0 signal source; `recordAstrologySignal` once
  per day (`ambient_reading`, `auspicious` = Taian); consumed by `system`, `cosmic`.
- **Logs (write)** — `getLogContext()` stamps `astro*` fields into every
  log's `context` JSONB; `Logs.tsx` renders `ASTRO:` in the `SYS:` block.
- **Logs (read, NEW)** — the widget now reads those stamps back.

## CHANGES THIS SESSION

1. **Shared `getWallClockDate(date, timeZone)`** (`astrology.ts`): Intl-based
   wall-clock conversion; falls back to device time on missing/invalid zone.
   Replaces the server-only dayjs `toWallClockDate` in `logs.ts`, so the
   dashboard and Logs now compute readings the same way (previously the
   dashboard used device time and Logs used the saved zone — they could
   disagree near day/zodiac-hour boundaries). Resolves last session's
   "client display should honor user.timeZone" item.
2. **`summarizeAstrologyLogs(logs, currentRokuyo)`** (`astrology.ts`): tallies
   `context.astroRokuyo` across the user's logs → total stamped logs, most
   active rokuyo, and count under today's rokuyo.
3. **Widget resonance line** (`System.tsx`, both layouts): a dim second line,
   e.g. `3 logs under Taian • most active: Senpu`, shown once at least one
   stamped log exists. This is the Logs → Astrology direction of the sync and
   the first user-personalized (not just ambient) output of the block.

## FEATURES BREAKDOWN (current state)

| Feature | State |
|---|---|
| Western zodiac / hourly zodiac / rokuyo / moon phase+% | live, user-timeZone aware (dashboard + logs) |
| 15-min refresh, paused off-tab | live |
| QIE signal `astrology` (daily, auspicious flag) | live |
| Log stamping (`astro*`) + `ASTRO:` render | live |
| Log resonance line in widget | **new** |
| Natal chart / birth data | intentionally absent |
| QIE pattern reacting to astrology+goals | pending (needs dedicated benchmark pass) |
| `getJapaneseZodiac`, `getMoonEmoji` | still unused |

## TEST

`npm run build` (server tsc + client bundle) — PASS, no errors from these changes.

## FUTURE

- Moon-phase resonance alongside rokuyo; minimum-sample threshold before
  showing "most active".
- QIE pattern for Taian-day + intention alignment.
- Optionally feed resonance back into the QIE signal metadata.
