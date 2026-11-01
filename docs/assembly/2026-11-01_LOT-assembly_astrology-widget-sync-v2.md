# LOT Self-Assembly Session Report
## 2026-11-01 | Astrology Widget — Personalization + Widget/Logs Sync | v2

**Branch:** `claude/practical-curie-ualunl` · **Type:** scheduled routine · **Live site:** not accessed

## Understanding (full map)
The Astrology block (zodiac hour, Western sign, rokuyo, moon phase/illumination — ambient, NOT a natal chart; no birth data exists on `User`) is inlined in `src/client/components/System.tsx` (compact block + cycling "pro" block Astrology→Psychology→Journey→Quantum).

| Piece | Location |
|---|---|
| Pure math | `src/shared/utils/astrology.ts` (+ new `getWallClockDate`) |
| Dashboard compute | `System.tsx` `astrology` useMemo, 15-min visible-tab tick |
| QIE signal | `intentionEngine.ts` — Tier 0 `astrology`, deps of `system`/`cosmic`, `recordAstrologySignal` (daily, `auspicious` = Taian) |
| Logs snapshot | `server/utils/logs.ts` `getLogContext` → `LogContext.astro*` fields (user timeZone) |
| Logs render | `Logs.tsx` `ASTRO:` line in `SYS:` block |

## Changes this session (closes v1 "pending" item: client timeZone)
1. **Shared personalization anchor** — new isomorphic `getWallClockDate(timeZone, now)` (Intl-based). The dashboard now reads the saved profile `me.timeZone` (falls back to device time), so the dashboard and Logs show the same reading for a user on a differently-zoned device.
2. **Daily QIE signal keyed to user's zone day** (was device-local `dayjs()`), preventing a double/missed record near midnight when zones differ.
3. **Taian marker `✦`** on the dashboard block for auspicious days — surfaces the existing `auspicious` signal flag visually.
4. **Logs sync** — `ASTRO:` line now also shows the zodiac hour recorded with the entry.

## Features breakdown (state)
- Inputs: zodiac hour, sign, rokuyo, moon phase+%; pure date math.
- Personalization: profile timeZone (dashboard + Logs); Taian highlight.
- Sync: QIE Tier 0 source → `system`, `cosmic`; Logs context snapshot per entry.
- Freshness: 15-min recompute, paused when tab hidden.

## Verify
`npm run build` — PASS (client + server).

## Pending
- Dedicated QIE pattern reacting to `astrology` + goals/intentions on Taian days (needs full benchmark/wiki sync pass).
- Opt-in birth-year animal (`getJapaneseZodiac`) and `getMoonEmoji` still unused.
- Logs filtering/grouping by moon phase or rokuyo.
