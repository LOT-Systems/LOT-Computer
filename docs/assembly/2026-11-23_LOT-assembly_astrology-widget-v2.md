# LOT Self-Assembly Session Report
## 2026-11-23 | Astrology Widget v2: Rokuyo Guidance, Log Resonance, Moon-Phase Fix

**Branch:** `claude/practical-curie-hqfg8e`
**Base commit:** `9f2b88c`
**Previous pass:** `2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md` (v1)
**Session type:** Automated / Scheduled (recurring routine)
**Scope:** The Astrology block shows ambient conditions (zodiac hour, moon phase, rokuyo). It is not a personal natal chart.

---

## 1. UNDERSTANDING: how the feature is wired (post-session)

```
                 src/shared/utils/astrology.ts   (pure, isomorphic)
                 ├─ getAmbientReading(date)        ← NEW v2: single source of truth
                 ├─ getRokuyoGuidance(rokuyo, h)   ← NEW v2
                 ├─ getLogAstroResonance(logs, r)  ← NEW v2
                 └─ getMoonPhase / getRokuyo / getHourlyZodiac / getWesternZodiac
                          │                         │
         ┌────────────────┘                         └──────────────────┐
         ▼                                                             ▼
 CLIENT  System.tsx (dashboard)                         SERVER  utils/logs.ts getLogContext(user)
  • astrology = getAmbientReading(now), 15-min tick       • reading in user.timeZone
  • rokuyoGuidance (current hour)                         • writes astro* fields into Log.context
  • astroResonance ← useLogs() ◄──────── Log rows ◄────── (≈17 log-creation sites in api.ts)
  • renders astrologyContent (2 layouts)                         │
  • once/day → recordAstrologySignal(…, personal)                ▼
         │                                               CLIENT  Logs.tsx
         ▼                                                • SYS: block → "ASTRO: rokuyo · phase"
 QIE  stores/intentionEngine.ts                           • every entry's hover line →
  • source 'astrology' (Tier 0)                             "12°C, 60% – City · Full Moon, Taian"  ← NEW v2
  • consumed by 'system', 'cosmic' in WIDGET_DEPENDENCY_MAP
  • metadata now carries rokuyoNote / samePhaseLogs /
    topPhase / taggedLogs / resonantPhase                 ← NEW v2
```

Logs are now a two-way sync:
- **Write path (v1):** each log stores the ambient reading it was written under.
- **Read path (v2):** the dashboard reads that history back to personalize the block. The QIE signal carries the result to the other widgets.

---

## 2. WHAT CHANGED THIS SESSION

### 2.1 One reading function: `getAmbientReading(date)`
Before this session, `System.tsx` and `getLogContext` each called the four functions separately. Both now call `getAmbientReading(date)`, so the dashboard, the Logs and the QIE always use the same fields with the same names. This also gives the reading a type, `AmbientReading`.

### 2.2 Personalization from rokuyo: `getRokuyoGuidance(rokuyo, hour)`
This uses the traditional time windows for each rokuyo day, checked against the current hour:

| Rokuyo | Note shown | Favourable now when |
|---|---|---|
| Taian | auspicious all day | always |
| Sensho | mornings favoured | hour < 12 |
| Senpu | afternoons favoured | hour ≥ 12 |
| Tomobiki | good except at noon | not 11–13 |
| Shakku | only noon is clear | 11–13 |
| Butsumetsu | quiet day, go gently | never |

The block adds a second line, for example `Tomobiki: good except at noon • now is clear`. It refreshes on the existing 15-minute tick, which is paused while the tab is hidden.

### 2.3 Personalization from Logs: `getLogAstroResonance(logs, reading)`
This counts the user's own log entries that have an astro snapshot:
- `taggedCount`: entries with a snapshot (anything logged since 2026-07-27)
- `samePhaseCount` and `sameRokuyoCount`: entries written under today's moon phase or rokuyo
- `topPhase`: the moon phase the user writes under most

When there are at least 5 tagged entries, the block shows a third line: `14 logs under Waxing Gibbous • you write most at Full Moon`, or `• your most written phase` when the two match. Users with fewer than 5 tagged entries see no change, so the block never shows thin numbers.

### 2.4 Sync with other widgets: richer QIE signal
`recordAstrologySignal()` takes a new optional `personal` argument. The daily `ambient_reading` signal now includes `rokuyoNote`, `samePhaseLogs`, `topPhase`, `taggedLogs` and a derived `resonantPhase` flag. `resonantPhase` is true when today's phase is the user's most-written phase. Together with the existing `auspicious` (Taian) flag, `system`, `cosmic` and any future pattern can react to personal astro context, not just raw date math.

The daily record now waits until logs have loaded, so the personal fields are not empty on first paint. The `localStorage` calls are wrapped in try/catch, so private mode cannot throw.

### 2.5 Sync with Logs: astro on every entry
Before, only `system_snapshot` (SYS:) entries showed `ASTRO:`. Now the hover context line on every entry adds the sky it was written under: `3°C, 81% – Tokyo · Full Moon, Taian`. If an entry has astro data but no weather, the line shows the astro part alone. This applies to both `contextText` builders in `Logs.tsx`: the editable primary entry and `LogContainer`.

### 2.6 Bug fix: moon-phase windows were off-center
`getMoonPhase` started each principal-phase window at the exact moment of that phase. For example, "Full Moon" began at 14.77 days and ran to 16.23. As a result, the night of a real full moon read as "Waxing Gibbous ~99%". The windows are now centered (±0.92 days on 0, ¼, ½ and ¾ of the cycle). The day-count is also normalized, so dates before 2000 no longer produce a negative phase. Checked against the real November 2026 events (UTC):

| Event | Before | After |
|---|---|---|
| Full moon, 24 Nov 14:53 | Waxing Gibbous | **Full Moon** (100%) |
| New moon, 9 Nov 07:02 | New Moon | New Moon (0%) |
| First quarter, 17 Nov 11:48 | Waxing Crescent | **First Quarter** |
| Last quarter, 1 Dec 06:09 | Waning Gibbous | **Last Quarter** |

Older logs keep the label that was computed when they were written. Only new entries use the corrected windows.

---

## 3. TEST

```
npx tsc --noEmit (client project)  → 104 errors before, 104 after (all pre-existing, none in new code)
npm run server:build               → PASS
npm run client:build               → PASS
npm run build                      → PASS
tsx smoke test                     → getAmbientReading / getRokuyoGuidance /
                                     getLogAstroResonance return expected shapes;
                                     moon events above verified
```

---

## 4. FEATURES BREAKDOWN (current state)

| Feature | Since | Where |
|---|---|---|
| Western sign, zodiac hour, rokuyo, moon phase + illumination % | v0/v1 | dashboard, both layouts |
| 15-min recompute, paused while the tab is hidden | v1 | `System.tsx` |
| Astro snapshot on every Log (user timeZone) | v1 | `getLogContext` |
| `ASTRO:` line in SYS: snapshots | v1 | `Logs.tsx` |
| QIE Tier 0 source `astrology` → `system`, `cosmic` | v1 | `intentionEngine.ts` |
| Single `getAmbientReading()` | **v2** | shared |
| Rokuyo guidance + "now is clear" | **v2** | dashboard |
| Personal log resonance line (≥5 tagged logs) | **v2** | dashboard |
| Personal fields + `resonantPhase` on QIE signal | **v2** | QIE |
| Astro shown on every log's hover line | **v2** | `Logs.tsx` |
| Centered moon-phase windows | **v2** | shared |

---

## 5. KNOWN LIMITATIONS / NEXT PASSES

1. **Rokuyo is approximate.** The real rokuyo is `(lunar month + lunar day) mod 6` on the Japanese lunisolar calendar. The current code uses a continuous 6-day count from 2000-01-01, which drifts at each new lunar month. A correct version needs new-moon and solar-term math (for month numbering and leap months) and real reference dates to check against. It is not shipped until those can be verified. This is the top candidate for the next pass.
2. **Mean lunar cycle.** Illumination comes from a mean cycle, so quarter-phase percentages can be about ±10 points off (for example, the 1 Dec last quarter shows 59%, not 50%). The labels are correct.
3. **Client timeZone.** The dashboard still uses device time, while Logs use `user.timeZone`. `UserProfile` (client) does not expose `timeZone`, so aligning them needs a small server/profile change.
4. **QIE pattern.** A pattern that combines `astrology.resonantPhase` or `auspicious` with `goals`/`intentions` (for example, a gentle nudge on Taian days or on the user's resonant phase) is still deferred to a dedicated benchmark pass with wiki and Field Manual sync.
5. `getJapaneseZodiac` and `getMoonEmoji` are still unused, and stay that way while the feature remains ambient-only.

---

## Files

```
src/shared/utils/astrology.ts          MODIFIED  (+getAmbientReading, +getRokuyoGuidance, +getLogAstroResonance, moon fix)
src/client/components/System.tsx       MODIFIED  (guidance + resonance lines, personal QIE payload)
src/client/stores/intentionEngine.ts   MODIFIED  (recordAstrologySignal personal arg)
src/server/utils/logs.ts               MODIFIED  (uses getAmbientReading)
src/client/components/Logs.tsx         MODIFIED  (astro on entry hover line)
docs/assembly/2026-11-23_LOT-assembly_astrology-widget-v2.md  ADDED
```

*LOT Self-Assembly Engine, automated session*
