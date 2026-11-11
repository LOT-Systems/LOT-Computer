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
  // (2026-11-11 fix) Count whole *calendar* days from the date's own
  // wall-clock Y/M/D. The previous version diffed against
  // new Date('2000-01-01') — parsed as UTC midnight — so the rokuyo
  // flipped at the user's UTC offset (e.g. 16:00 in California, 09:00 in
  // Tokyo) instead of at local midnight.
  const dayNumber = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000
  const knownDayNumber = Date.UTC(2000, 0, 1) / 86400000
  const daysDiff = Math.round(dayNumber - knownDayNumber)
  const rokuyoIndex = ((daysDiff % 6) + 6) % 6
  return ROKUYO[rokuyoIndex]
}

export type RokuyoWindow = 'favorable' | 'unfavorable'

/**
 * Traditional time-of-day guidance for each rokuyo day, keyed to the
 * current wall-clock hour. Sources the classic almanac rules:
 *   Sensho      — morning favorable, afternoon not
 *   Tomobiki    — morning & evening favorable, midday (11–13) not
 *   Senpu       — morning not, afternoon favorable
 *   Butsumetsu  — unfavorable all day
 *   Taian       — favorable all day
 *   Shakku      — only the Hour of the Horse (11–13) is favorable
 */
export function getRokuyoTiming(rokuyo: string, hour: number): { window: RokuyoWindow; note: string } {
  const isMorning = hour < 12
  const isMidday = hour >= 11 && hour < 13
  switch (rokuyo) {
    case 'Sensho':
      return isMorning
        ? { window: 'favorable', note: 'act early' }
        : { window: 'unfavorable', note: 'morning has passed' }
    case 'Tomobiki':
      return isMidday
        ? { window: 'unfavorable', note: 'pause at midday' }
        : { window: 'favorable', note: 'shared things go well' }
    case 'Senpu':
      return isMorning
        ? { window: 'unfavorable', note: 'wait for afternoon' }
        : { window: 'favorable', note: 'afternoon opens' }
    case 'Butsumetsu':
      return { window: 'unfavorable', note: 'rest, close loops' }
    case 'Taian':
      return { window: 'favorable', note: 'good for beginnings' }
    case 'Shakku':
      return isMidday
        ? { window: 'favorable', note: 'Hour of the Horse' }
        : { window: 'unfavorable', note: 'favorable only 11–13' }
    default:
      return { window: 'unfavorable', note: '' }
  }
}

/**
 * Convert a real instant into a Date whose *local* getters
 * (getHours/getDate/getMonth/getFullYear) return the wall-clock time in
 * `timeZone`. Isomorphic (Intl only — no tz plugin needed on the client).
 * Falls back to the instant itself when timeZone is missing/invalid.
 */
export function toWallClockInZone(instant: Date, timeZone?: string | null): Date {
  if (!timeZone) return instant
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(instant)
    const get = (type: string) => Number(parts.find(p => p.type === type)?.value)
    return new Date(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'))
  } catch {
    return instant
  }
}

export type AstrologyReading = {
  hourlyZodiac: string
  westernZodiac: string
  rokuyo: string
  moonPhase: string
  moonIllumination: number
  window: RokuyoWindow
  windowNote: string
}

/**
 * Single source of truth for the ambient reading — used by the dashboard
 * block, the QIE astrology signal, and every Log context snapshot, so all
 * three always agree. Calendar fields (rokuyo, zodiac hour, sign) are read
 * in the user's timeZone; the moon phase uses the real instant (it is a
 * global astronomical quantity, not a wall-clock one).
 */
export function getAstrologyReading(instant: Date = new Date(), timeZone?: string | null): AstrologyReading {
  const wallClock = toWallClockInZone(instant, timeZone)
  const moon = getMoonPhase(instant)
  const rokuyo = getRokuyo(wallClock)
  const timing = getRokuyoTiming(rokuyo, wallClock.getHours())
  return {
    hourlyZodiac: getHourlyZodiac(wallClock),
    westernZodiac: getWesternZodiac(wallClock),
    rokuyo,
    moonPhase: moon.phase,
    moonIllumination: moon.illumination,
    window: timing.window,
    windowNote: timing.note,
  }
}

export type AstroResonance = {
  sampleSize: number
  topRokuyo: string | null
  topMoonPhase: string | null
  topZodiacHour: string | null
  favorableShare: number | null // % of logs written in a favorable window
}

/**
 * Personalization from the user's own Logs: which ambient conditions they
 * actually show up under. Reads the astro* fields every log context has
 * carried since 2026-07-27. Ambient only — no birth data involved.
 */
export function summarizeAstroResonance(
  logs: Array<{ context?: Record<string, any> | null }>,
  minSample = 5
): AstroResonance {
  const withAstro = logs.filter(l => l.context && l.context.astroRokuyo)
  const empty: AstroResonance = { sampleSize: withAstro.length, topRokuyo: null, topMoonPhase: null, topZodiacHour: null, favorableShare: null }
  if (withAstro.length < minSample) return empty
  const top = (key: string): string | null => {
    const counts: Record<string, number> = {}
    for (const l of withAstro) {
      const v = l.context![key]
      if (typeof v === 'string' && v) counts[v] = (counts[v] || 0) + 1
    }
    let best: string | null = null
    let bestCount = 0
    for (const [k, c] of Object.entries(counts)) if (c > bestCount) { best = k; bestCount = c }
    return best
  }
  const withWindow = withAstro.filter(l => l.context!.astroWindow === 'favorable' || l.context!.astroWindow === 'unfavorable')
  return {
    sampleSize: withAstro.length,
    topRokuyo: top('astroRokuyo'),
    topMoonPhase: top('astroMoonPhase'),
    topZodiacHour: top('astroHourlyZodiac'),
    favorableShare: withWindow.length >= minSample
      ? Math.round((withWindow.filter(l => l.context!.astroWindow === 'favorable').length / withWindow.length) * 100)
      : null,
  }
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
