# LOT Self-Assembly Session Report
## 2026-10-16 | Astrology Widget — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-gnzk76`
**Session type:** Automated / scheduled routine
**Prior session:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md`

## UNDERSTANDING (full feature map)

The Astrology block = today's zodiac hour, Western sign, rokuyo, moon phase + illumination. Ambient conditions, **not** a natal chart; no birth data exists in the `User` model.

| Piece | Location | Role |
|---|---|---|
| Math | `src/shared/utils/astrology.ts` | Pure isomorphic date math. New this session: `getAstrologyReading(date)`, `toWallClockDate(fields)` |
| Dashboard | `src/client/components/System.tsx` | Inline block (compact layout + cycling pro block: Astrology → Psychology → Journey → Biofield); recomputes every 15 min while tab visible |
| Signal bus | `src/client/stores/intentionEngine.ts` | Tier 0 `astrology` source; dependency of `system` and `cosmic`; `recordAstrologySignal` once per day |
| Logs (write) | `src/server/utils/logs.ts` `getLogContext` | Snapshots `astro*` fields into each Log's JSONB `context`, using the user's saved `timeZone` |
| Logs (read) | `src/client/components/Logs.tsx` | `SYS:` block prints `ASTRO:` line |

## CHANGES THIS SESSION

1. **Dedup**: shared `getAstrologyReading` + `toWallClockDate` replace the duplicated 5-call computation in `System.tsx` and `logs.ts` (and the private helper in `logs.ts`). One definition of "a reading" for dashboard, signal and Logs.
2. **Logs → dashboard sync (personalization)**: the dashboard now reads each log's `context.astroMoonPhase` / `astroRokuyo` and shows "N logs under this moon • M on <rokuyo> days" — a personal history layered on the ambient reading. Hidden when zero.
3. **Logs → QIE**: `recordAstrologySignal` takes optional `logsUnderMoon`, included in signal metadata for future patterns.
4. **Logs display**: `ASTRO:` line now also shows moon illumination % and zodiac hour.

## FINDING (corrects prior session's pending item)

The client `UserProfile` type has no `timeZone`, and the client dayjs has no timezone plugin, so a timeZone-aware dashboard reading needs a profile/API change first. Attempted, reverted; the dashboard stays on device wall-clock time, the server Logs snapshot stays on `user.timeZone`.

## VERIFY

`npm run build` (client + server): PASS. `tsc --noEmit` shows only pre-existing errors (e.g. `IntentionSignal['source']` union vs `'micro_game'`/`'ecosystem'` callers, Logs.tsx nullability) — none from this change.

## FEATURES (state after session)

- Inputs: zodiac hour, sign, rokuyo, moon phase/illumination (no external API).
- Freshness: 15-min recompute, paused off-tab.
- Sync: QIE Tier 0 signal (+logsUnderMoon); Logs snapshot at write time; Logs history read back into dashboard.
- Not implemented: natal data, birth-year animal (`getJapaneseZodiac`, `getMoonEmoji` still unused).

## NEXT

- Expose `timeZone` on `UserProfile` + add dayjs tz plugin client-side → timeZone-aware dashboard.
- QIE pattern on Taian days + goals/intentions (needs a full benchmark pass).
- Fix the `IntentionSignal['source']` union drift (separate cleanup).
