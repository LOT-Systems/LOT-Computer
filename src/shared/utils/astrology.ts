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
  // Count whole *local calendar* days (2026-11-13 fix): the old version
  // diffed getTime() against UTC midnight, so the six-day cycle flipped at
  // the UTC-offset moment instead of at the reader's own midnight, and the
  // server's wall-clock-shifted Date could land on the neighbouring day.
  const knownDay = Date.UTC(2000, 0, 1)
  const localDay = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  const daysDiff = Math.round((localDay - knownDay) / 86400000)

  // Safe modulo — dates before 2000 must not produce a negative index.
  const rokuyoIndex = ((daysDiff % 6) + 6) % 6

  return ROKUYO[rokuyoIndex]
}

/**
 * Short ambient guidance line for each rokuyo day — the traditional
 * almanac reading, phrased as conditions rather than predictions.
 */
const ROKUYO_GUIDANCE: Record<string, string> = {
  Sensho: 'Act early — mornings favoured',
  Tomobiki: 'Shared plans favoured — midday quiet',
  Senpu: 'Go slow — afternoons favoured',
  Butsumetsu: 'Rest and close loops',
  Taian: 'Auspicious — good day to begin',
  Shakku: 'Take care — noon hour only',
}

export function getRokuyoGuidance(rokuyo: string): string {
  return ROKUYO_GUIDANCE[rokuyo] || ''
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

/**
 * Wall-clock Date for an instant in a given IANA timeZone.
 *
 * The returned Date's getFullYear()/getMonth()/getDate()/getHours() readers
 * report the wall clock *in that timeZone*, regardless of the runtime's own
 * zone — so calendar-based readings (zodiac hour, western sign, rokuyo)
 * follow the user's saved profile zone on both client and server. Do NOT
 * use its getTime() for astronomical math (moon phase) — that needs the
 * true instant. Falls back to the instant itself on an invalid/missing zone.
 */
export function toZonedWallClock(instant: Date, timeZone?: string | null): Date {
  if (!timeZone) return instant
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(instant)
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
    const hour = get('hour') % 24
    return new Date(get('year'), get('month') - 1, get('day'), hour, get('minute'), get('second'))
  } catch {
    return instant
  }
}

export interface AstrologyReading {
  westernZodiac: string
  hourlyZodiac: string
  rokuyo: string
  rokuyoGuidance: string
  auspicious: boolean
  moonPhase: string
  moonIllumination: number
  moonEmoji: string
  /** YYYY-MM-DD in the reading's timeZone — the day this reading belongs to */
  localDate: string
  timeZone: string | null
}

/**
 * Single source of truth for the ambient Astrology block — used by the
 * System dashboard AND by getLogContext() on the server, so the widget and
 * every Logs entry snapshot read identical values for the same moment and
 * timeZone. Ambient conditions only — not a personal natal chart.
 */
export function getAstrologyReading(instant: Date = new Date(), timeZone?: string | null): AstrologyReading {
  const wall = toZonedWallClock(instant, timeZone)
  // Moon phase is astronomical — always from the true instant.
  const moon = getMoonPhase(instant)
  const rokuyo = getRokuyo(wall)
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    westernZodiac: getWesternZodiac(wall),
    hourlyZodiac: getHourlyZodiac(wall),
    rokuyo,
    rokuyoGuidance: getRokuyoGuidance(rokuyo),
    auspicious: rokuyo === 'Taian',
    moonPhase: moon.phase,
    moonIllumination: moon.illumination,
    moonEmoji: getMoonEmoji(moon.phase),
    localDate: `${wall.getFullYear()}-${pad(wall.getMonth() + 1)}-${pad(wall.getDate())}`,
    timeZone: timeZone || null,
  }
}
