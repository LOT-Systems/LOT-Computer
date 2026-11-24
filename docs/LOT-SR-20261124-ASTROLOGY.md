# LOT-SR-20261124 · Astrology Widget — Astro Resonance

**Date:** 2026-11-24 · **Branch:** `claude/practical-curie-v3z6xl` · **Build:** GREEN (`yarn build`) · **tsc:** 104 errors, the same as baseline (none added)

The Astrology block shows **ambient conditions**: the zodiac hour, moon phase, rokuyo and Western sun sign for *now*. It is **not** a personal natal chart. This session adds **Astro Resonance**. It makes the block personal by reading the astro stamp already saved on every Log entry, and it keeps the System widget, the Logs feed and the QIE signal bus in sync.

---

## 1. Understanding — how the widget works end to end

```
 server/utils/logs.ts getLogContext(user)
   └─ stamps every log.context with astroRokuyo / astroMoonPhase /
      astroMoonIllumination / astroHourlyZodiac / astroWesternZodiac
      (computed in the user's saved timeZone)
                │
                ▼
 Logs (DB) ──► useLogs() ──► computeAstroResonance(logs)   [shared, pure]
                │                     │
                │                     ├─► System › Astrology   "You:" line + ◆ alignment
                │                     ├─► Logs › BIO check-ins  ASTRO stamp + ◆ if in peak hour
                │                     └─► recordAstrologySignal(..., resonance)
                │                                │
                │                                ▼
                │                     QIE signal bus · source 'astrology'
                │                     (Tier 0, feeds 'system' + 'cosmic' widgets)
                ▼
 Logs › SYS snapshot  ASTRO: rokuyo · moon · hour
```

### Ambient layer (existing, `src/shared/utils/astrology.ts`)
| Function | Output |
|---|---|
| `getHourlyZodiac(date)` | One of 12 two-hour Japanese zodiac periods (Rat 23–01 … Pig 21–23) |
| `getWesternZodiac(date)` | Sun sign for the date |
| `getMoonPhase(date)` | 8-phase name + illumination % (synodic 29.53 d from the 2000-01-06 new moon) |
| `getRokuyo(date)` | 六曜 six-day cycle (Sensho, Tomobiki, Senpu, Butsumetsu, Taian, Shakku). Simplified Gregorian version |
| `getMoonEmoji(phase)` | Glyph per phase |

System.tsx recalculates every 15 min and pauses while the tab is hidden.

---

## 2. New features this session

### 2.1 `computeAstroResonance(logs)` (shared, pure)
This function reads every log whose `context` has an astro stamp and returns:
- `peakHour` / `peakHourShare`: the zodiac hour the user logs in most, and its share of all stamped logs
- `peakMoonPhase`, `peakRokuyo`: the moon phase and rokuyo day with the most activity
- `brightMoonPhase` / `brightMoonShare`: the moon phase whose `emotional_checkin` entries are most often positive (needs ≥2 check-ins in that phase). The positive states follow the replenishing side of `ENERGY_COSTS`
- `samples`, `checkIns`

It is shown only when `samples ≥ ASTRO_RESONANCE_MIN_SAMPLES` (5). Below that, a "peak" is just noise.

### 2.2 `getAstroAlignment(resonance, now)`
Compares the current ambient reading with the user's resonance and returns `inPeakHour`, `inPeakMoon`, `inBrightMoon`, `onPeakRokuyo` and a `score` from 0 to 4.

### 2.3 System › Astrology widget
There is a new second line, in both the condensed and the full layouts:
```
Sagittarius • Dragon • Taian • Waxing Gibbous (78%)
You: Dragon hour • Full Moon • Bright in Waxing Gibbous • ◆◆◆ your hour
```
There is one ◆ per alignment match. "your hour" appears when the current zodiac hour is the user's peak hour.

### 2.4 Logs sync
- **BIO check-ins** (`emotional_checkin`) now show `ASTRO: <hour> hr · <moon> · <rokuyo>`, with a ◆ when the entry was logged in the user's peak hour. The rule is the same as the widget's, so both views always agree.
- The **SYS snapshot** ASTRO line now includes the zodiac hour.

### 2.5 Widget sync (QIE signal bus)
- `recordAstrologySignal(...)` takes an optional `resonance` argument and adds `personalPeakHour`, `personalPeakMoon`, `personalBrightMoon`, `resonanceSamples`, `alignmentScore` and `inPeakHour` to the `astrology/ambient_reading` signal.
- The recording slot was **once per day**. It is now **once per zodiac hour per day** (`astrology_signal_slot` = `YYYY-MM-DD:<hour>`). Downstream widgets (`system`, `cosmic`) now see the moment the user enters their resonant hour, not only a morning snapshot.
- localStorage access is wrapped in try/catch, so the widget still works in private windows.

---

## 3. Files changed
| File | Change |
|---|---|
| `src/shared/utils/astrology.ts` | + `computeAstroResonance`, `getAstroAlignment`, types, `ASTRO_RESONANCE_MIN_SAMPLES` |
| `src/client/components/System.tsx` | Resonance and alignment memos, "You:" line (both layouts), hourly signal slot with resonance payload |
| `src/client/components/Logs.tsx` | Resonance memo, ASTRO stamp and ◆ on BIO check-ins, hour on the SYS line |
| `src/client/stores/intentionEngine.ts` | `recordAstrologySignal` takes an optional `resonance` payload |

## 4. Verification
- `yarn build` (client + server): **green**
- `tsc --noEmit`: 104 errors before and after (all pre-existing). No new errors in the touched files
- Scratch run of `computeAstroResonance` on 7 synthetic logs: peak Dragon (50%), peak moon Full Moon, bright moon Waxing Gibbous (100%), alignment score 3. Results match a hand count.

## 5. Next evolution candidates
1. Use the real lunisolar rokuyo (based on the lunar month and day) instead of the simplified Gregorian cycle.
2. Have the `cosmic` widget read `inPeakHour` from the signal bus and suggest a focus block or ritual in the resonant hour.
3. Add a resonance trend: compare the last 30 days with all-time to show when the user's peak hour is drifting.
4. Bring mood intensity (`metadata.intensity`) into the bright-moon tally, weighting entries instead of counting them.
