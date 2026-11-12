/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Astrology utility functions for Japanese zodiac, moon phase, and Western zodiac
 */

// Japanese zodiac animals (12-year cycle starting from 1900 = Rat)
const JAPANESE_ZODIAC = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'
] as const

// Rokuyo (六曜) - Six-day cycle used in Japanese calendars
const ROKUYO = [
  'Sensho',      // 先勝 - Morning is better
  'Tomobiki',    // 友引 - Good day (avoid funerals)
  'Senpu',       // 先負 - Afternoon is better
  'Butsumetsu',  // 仏滅 - Inauspicious day
  'Taian',       // 大安 - Very auspicious day
  'Shakku',      // 赤口 - Caution needed
] as const

// Western zodiac signs with date ranges
const WESTERN_ZODIAC = [
  { sign: 'Capricorn', start: [12, 22], end: [1, 19] },
  { sign: 'Aquarius', start: [1, 20], end: [2, 18] },
  { sign: 'Pisces', start: [2, 19], end: [3, 20] },
  { sign: 'Aries', start: [3, 21], end: [4, 19] },
  { sign: 'Taurus', start: [4, 20], end: [5, 20] },
  { sign: 'Gemini', start: [5, 21], end: [6, 20] },
  { sign: 'Cancer', start: [6, 21], end: [7, 22] },
  { sign: 'Leo', start: [7, 23], end: [8, 22] },
  { sign: 'Virgo', start: [8, 23], end: [9, 22] },
  { sign: 'Libra', start: [9, 23], end: [10, 22] },
  { sign: 'Scorpio', start: [10, 23], end: [11, 21] },
  { sign: 'Sagittarius', start: [11, 22], end: [12, 21] },
] as const

/**
 * Get Japanese zodiac animal for a given year
 */
export function getJapaneseZodiac(year: number): string {
  // 1900 is year of the Rat (index 0)
  const index = (year - 1900) % 12
  return JAPANESE_ZODIAC[index]
}

/**
 * Get hourly Japanese zodiac animal based on time of day
 * Each animal governs a 2-hour period
 */
export function getHourlyZodiac(date: Date): string {
  const hour = date.getHours()

  // Map hours to zodiac animals (2-hour periods)
  if (hour >= 23 || hour < 1) return 'Rat'      // 11 PM - 1 AM
  if (hour >= 1 && hour < 3) return 'Ox'        // 1 AM - 3 AM
  if (hour >= 3 && hour < 5) return 'Tiger'     // 3 AM - 5 AM
  if (hour >= 5 && hour < 7) return 'Rabbit'    // 5 AM - 7 AM
  if (hour >= 7 && hour < 9) return 'Dragon'    // 7 AM - 9 AM
  if (hour >= 9 && hour < 11) return 'Snake'    // 9 AM - 11 AM
  if (hour >= 11 && hour < 13) return 'Horse'   // 11 AM - 1 PM
  if (hour >= 13 && hour < 15) return 'Goat'    // 1 PM - 3 PM
  if (hour >= 15 && hour < 17) return 'Monkey'  // 3 PM - 5 PM
  if (hour >= 17 && hour < 19) return 'Rooster' // 5 PM - 7 PM
  if (hour >= 19 && hour < 21) return 'Dog'     // 7 PM - 9 PM
  if (hour >= 21 && hour < 23) return 'Pig'     // 9 PM - 11 PM

  return 'Rat'
}

/**
 * Get Rokuyo (六曜) - Japanese six-day cycle for determining auspicious days
 * Simplified calculation based on Gregorian calendar
 */
export function getRokuyo(date: Date): string {
  // Known starting point: January 1, 2000 was Sensho (index 0).
  // Count whole *calendar* days from the date's own wall-clock Y/M/D, not raw
  // epoch ms — the previous ms-diff flipped the rokuyo at UTC midnight (e.g.
  // 4 PM in Los Angeles) instead of at the viewer's local midnight. (v2 fix)
  const knownDay = Date.UTC(2000, 0, 1)
  const localDay = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  const daysDiff = Math.round((localDay - knownDay) / (1000 * 60 * 60 * 24))

  // ((n % 6) + 6) % 6 keeps the index valid for dates before 2000 too
  const rokuyoIndex = ((daysDiff % 6) + 6) % 6

  return ROKUYO[rokuyoIndex]
}

/**
 * Get Western zodiac sign for a given date
 */
export function getWesternZodiac(date: Date): string {
  const month = date.getMonth() + 1 // 1-12
  const day = date.getDate()

  for (const zodiac of WESTERN_ZODIAC) {
    const [startMonth, startDay] = zodiac.start
    const [endMonth, endDay] = zodiac.end

    // Handle zodiac signs that span across year boundary (Capricorn)
    if (startMonth > endMonth) {
      if (month === startMonth && day >= startDay) return zodiac.sign
      if (month === endMonth && day <= endDay) return zodiac.sign
    } else {
      // Normal case
      if (month === startMonth && day >= startDay) return zodiac.sign
      if (month === endMonth && day <= endDay) return zodiac.sign
      if (month > startMonth && month < endMonth) return zodiac.sign
    }
  }

  return 'Unknown'
}

/**
 * Calculate moon phase for a given date
 * Returns phase name and illumination percentage
 */
export function getMoonPhase(date: Date): { phase: string; illumination: number } {
  // Known new moon: January 6, 2000, 18:14 UTC
  const knownNewMoon = new Date('2000-01-06T18:14:00Z').getTime()
  const secondsInDay = 86400000
  const lunarCycle = 29.53058770576 // days in lunar cycle

  // Calculate days since known new moon
  const daysSinceNewMoon = (date.getTime() - knownNewMoon) / secondsInDay
  const phase = daysSinceNewMoon % lunarCycle

  // Calculate illumination (0-100%)
  const illumination = Math.round(50 * (1 - Math.cos((phase / lunarCycle) * 2 * Math.PI)))

  // Determine phase name
  let phaseName: string
  if (phase < 1.84566) {
    phaseName = 'New Moon'
  } else if (phase < 7.38264) {
    phaseName = 'Waxing Crescent'
  } else if (phase < 8.84566) {
    phaseName = 'First Quarter'
  } else if (phase < 14.76529) {
    phaseName = 'Waxing Gibbous'
  } else if (phase < 16.22892) {
    phaseName = 'Full Moon'
  } else if (phase < 22.14855) {
    phaseName = 'Waning Gibbous'
  } else if (phase < 23.61224) {
    phaseName = 'Last Quarter'
  } else if (phase < 29.53059) {
    phaseName = 'Waning Crescent'
  } else {
    phaseName = 'New Moon'
  }

  return { phase: phaseName, illumination }
}

/**
 * Get moon emoji based on phase
 */
export function getMoonEmoji(phaseName: string): string {
  const emojiMap: Record<string, string> = {
    'New Moon': '🌑',
    'Waxing Crescent': '🌒',
    'First Quarter': '🌓',
    'Waxing Gibbous': '🌔',
    'Full Moon': '🌕',
    'Waning Gibbous': '🌖',
    'Last Quarter': '🌗',
    'Waning Crescent': '🌘',
  }
  return emojiMap[phaseName] || '🌑'
}

// ─────────────────────────────────────────────────────────────────────────────
// v2 (2026-11-12) — unified reading, timeZone anchoring, guidance, Logs resonance
// Still strictly ambient: nothing here reads birth data or builds a natal chart.
// ─────────────────────────────────────────────────────────────────────────────

/** Short, practical meaning of each rokuyo day — surfaced next to the reading. */
const ROKUYO_GUIDANCE: Record<string, string> = {
  Sensho: 'Morning favored',
  Tomobiki: 'Good for shared plans',
  Senpu: 'Afternoon favored',
  Butsumetsu: 'Rest, avoid launches',
  Taian: 'Auspicious all day',
  Shakku: 'Midday only, take care',
}

export function getRokuyoGuidance(rokuyo: string): string {
  return ROKUYO_GUIDANCE[rokuyo] || ''
}

export type MoonTrend = 'dark' | 'waxing' | 'full' | 'waning'

/** Coarse lunar direction: build while waxing, release while waning. */
export function getMoonTrend(phaseName: string): MoonTrend {
  if (phaseName === 'New Moon') return 'dark'
  if (phaseName === 'Full Moon') return 'full'
  if (phaseName.startsWith('Waxing') || phaseName === 'First Quarter') return 'waxing'
  return 'waning'
}

const MOON_TREND_HINT: Record<MoonTrend, string> = {
  dark: 'Set intentions',
  waxing: 'Build',
  full: 'Reflect',
  waning: 'Release',
}

export function getMoonTrendHint(trend: MoonTrend): string {
  return MOON_TREND_HINT[trend]
}

/**
 * Re-express an instant as a Date whose *local* getters (getHours/getDate/…)
 * return the wall-clock time in `timeZone`. Isomorphic (Intl only), so the
 * dashboard and the server Logs snapshot share the exact same anchoring.
 * Falls back to the original date for a missing/invalid timeZone.
 */
export function toZonedWallClock(date: Date, timeZone?: string | null): Date {
  if (!timeZone) return date
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date)
    const get = (type: string) => Number(parts.find(p => p.type === type)?.value)
    const hour = get('hour') === 24 ? 0 : get('hour')
    return new Date(get('year'), get('month') - 1, get('day'), hour, get('minute'), get('second'))
  } catch {
    return date
  }
}

export type AstrologyReading = {
  hourlyZodiac: string
  westernZodiac: string
  rokuyo: string
  rokuyoGuidance: string
  moonPhase: string
  moonIllumination: number
  moonTrend: MoonTrend
  moonTrendHint: string
  auspicious: boolean
  timeZone: string | null
}

/**
 * One reading for one instant. Calendar-based parts (hour animal, sign,
 * rokuyo) use the wall clock in `timeZone`; the moon phase uses the real
 * instant, since lunar phase is global — feeding it a shifted wall-clock Date
 * would skew it by the UTC offset (up to ±14h). (v2 fix)
 */
export function getAstrologyReading(now: Date = new Date(), timeZone?: string | null): AstrologyReading {
  const wall = toZonedWallClock(now, timeZone)
  const moon = getMoonPhase(now)
  const rokuyo = getRokuyo(wall)
  const moonTrend = getMoonTrend(moon.phase)
  return {
    hourlyZodiac: getHourlyZodiac(wall),
    westernZodiac: getWesternZodiac(wall),
    rokuyo,
    rokuyoGuidance: getRokuyoGuidance(rokuyo),
    moonPhase: moon.phase,
    moonIllumination: moon.illumination,
    moonTrend,
    moonTrendHint: getMoonTrendHint(moonTrend),
    auspicious: rokuyo === 'Taian',
    timeZone: timeZone || null,
  }
}

export type AstroLogResonance = {
  /** Logs carrying an astrology snapshot at all (written since v1, 2026-07-27) */
  tagged: number
  /** Of those, written under the same moon phase as now */
  samePhase: number
  /** Of those, written on the same rokuyo day as today */
  sameRokuyo: number
  /** The user's most-written moon phase, once there is enough history (>= 5) */
  dominantPhase: string | null
}

/**
 * Personal echo of the ambient reading, derived from the user's own Logs:
 * every log's `context` snapshots the reading it was written under (see
 * server/utils/logs.ts getLogContext), so we can say "you've written N notes
 * under this moon" without any birth data.
 */
export function getLogAstroResonance(
  logs: Array<{ context?: Record<string, any> | null }>,
  reading: Pick<AstrologyReading, 'moonPhase' | 'rokuyo'>
): AstroLogResonance {
  let tagged = 0
  let samePhase = 0
  let sameRokuyo = 0
  const phaseCounts: Record<string, number> = {}
  for (const log of logs) {
    const ctx = log?.context
    if (!ctx || !ctx.astroMoonPhase) continue
    tagged++
    phaseCounts[ctx.astroMoonPhase] = (phaseCounts[ctx.astroMoonPhase] || 0) + 1
    if (ctx.astroMoonPhase === reading.moonPhase) samePhase++
    if (ctx.astroRokuyo === reading.rokuyo) sameRokuyo++
  }
  let dominantPhase: string | null = null
  if (tagged >= 5) {
    let best = 0
    for (const [phase, count] of Object.entries(phaseCounts)) {
      if (count > best) { best = count; dominantPhase = phase }
    }
  }
  return { tagged, samePhase, sameRokuyo, dominantPhase }
}
