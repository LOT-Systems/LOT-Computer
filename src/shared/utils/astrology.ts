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
  // Count whole *calendar* days from the date's own wall-clock Y/M/D, not
  // raw millisecond deltas — the old ms-delta form compared a local Date
  // against a UTC-midnight anchor, so the rokuyo flipped at 19:00 (UTC-5)
  // or 09:00 (UTC+9) local instead of midnight, and the client dashboard
  // disagreed with the server-side Logs snapshot for non-UTC users.
  // (2026-11-15 astrology v2 fix)
  const anchor = Date.UTC(2000, 0, 1)
  const day = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  const daysDiff = Math.round((day - anchor) / 86400000)
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
  const phase = ((daysSinceNewMoon % lunarCycle) + lunarCycle) % lunarCycle

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
  } else if (phase < 27.68493) {
    // Was < 29.53059, which swallowed the 1.85 days *before* each new moon
    // into Waning Crescent — New Moon was half as wide as it should be.
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

// ─────────────────────────────────────────────────────────────────────────
// Astrology v2 (2026-11-15) — timeZone-aware reading + Logs resonance
// Ambient conditions only. Personalization is derived from the user's own
// Logs history (when they write), never from birth data.
// ─────────────────────────────────────────────────────────────────────────

export const MOON_PHASES = [
  'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
  'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent',
] as const

// Share of the lunar cycle each named phase occupies (from the thresholds
// in getMoonPhase). Used as the "expected" baseline for resonance.
const LUNAR_CYCLE_DAYS = 29.53058770576
const MOON_PHASE_SHARE: Record<string, number> = {
  'New Moon': (1.84566 + (LUNAR_CYCLE_DAYS - 27.68493)) / LUNAR_CYCLE_DAYS,
  'Waxing Crescent': (7.38264 - 1.84566) / LUNAR_CYCLE_DAYS,
  'First Quarter': (8.84566 - 7.38264) / LUNAR_CYCLE_DAYS,
  'Waxing Gibbous': (14.76529 - 8.84566) / LUNAR_CYCLE_DAYS,
  'Full Moon': (16.22892 - 14.76529) / LUNAR_CYCLE_DAYS,
  'Waning Gibbous': (22.14855 - 16.22892) / LUNAR_CYCLE_DAYS,
  'Last Quarter': (23.61224 - 22.14855) / LUNAR_CYCLE_DAYS,
  'Waning Crescent': (27.68493 - 23.61224) / LUNAR_CYCLE_DAYS,
}

export interface AstrologyReading {
  hourlyZodiac: string
  westernZodiac: string
  rokuyo: string
  moonPhase: string
  moonIllumination: number
  auspicious: boolean
  timeZone: string | null
}

/**
 * Wall-clock Date for `date` as seen in `timeZone`. The returned Date's
 * local getters (getHours/getDate/...) read the zone's wall clock, which is
 * what the calendar-based readers above expect. Falls back to `date` when
 * the zone is missing or invalid. Isomorphic (Intl), no dayjs dependency.
 */
export function toZonedWallClock(date: Date, timeZone?: string | null): Date {
  if (!timeZone) return date
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(date)
    const get = (t: string) => Number(parts.find(p => p.type === t)?.value)
    return new Date(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'))
  } catch {
    return date
  }
}

/**
 * One canonical ambient reading. Calendar/clock readings (rokuyo, zodiac
 * hour, western sign) use the zone's wall clock; the moon phase uses the
 * real instant (the moon is the same everywhere). Dashboard and Logs both
 * call this, so the widget and the journal snapshot always agree.
 */
export function getAstrologyReading(date: Date = new Date(), timeZone?: string | null): AstrologyReading {
  const wall = toZonedWallClock(date, timeZone)
  const moon = getMoonPhase(date)
  const rokuyo = getRokuyo(wall)
  return {
    hourlyZodiac: getHourlyZodiac(wall),
    westernZodiac: getWesternZodiac(wall),
    rokuyo,
    moonPhase: moon.phase,
    moonIllumination: moon.illumination,
    auspicious: rokuyo === 'Taian',
    timeZone: timeZone || null,
  }
}

export interface AstroContextLike {
  astroRokuyo?: string | null
  astroMoonPhase?: string | null
  astroHourlyZodiac?: string | null
}

export type AstroResonanceLevel = 'resonant' | 'steady' | 'quiet'

export interface AstroResonance {
  sampleSize: number
  topHourZodiac: string | null
  topMoonPhase: string | null
  topRokuyo: string | null
  /** Observed/expected share of the user's logs written under today's rokuyo + moon phase */
  todayRatio: number
  level: AstroResonanceLevel
  /** True when the current zodiac hour is the user's most-written hour */
  isPeakHour: boolean
}

export const ASTRO_RESONANCE_MIN_SAMPLE = 12

function topKey(counts: Record<string, number>): string | null {
  let best: string | null = null
  let bestN = 0
  for (const [k, n] of Object.entries(counts)) {
    if (n > bestN) { best = k; bestN = n }
  }
  return best
}

/**
 * Personal rhythm from Logs: which zodiac hour / moon phase / rokuyo the
 * user actually writes under (read from each log's context snapshot), and
 * how today's conditions compare to that history. Returns null until there
 * are enough astro-stamped logs to say anything honest.
 */
export function computeAstroResonance(
  contexts: Array<AstroContextLike | null | undefined>,
  today: Pick<AstrologyReading, 'rokuyo' | 'moonPhase' | 'hourlyZodiac'>
): AstroResonance | null {
  const hour: Record<string, number> = {}
  const moon: Record<string, number> = {}
  const rok: Record<string, number> = {}
  let n = 0
  for (const c of contexts) {
    if (!c || !c.astroRokuyo || !c.astroMoonPhase) continue
    n++
    rok[c.astroRokuyo] = (rok[c.astroRokuyo] || 0) + 1
    moon[c.astroMoonPhase] = (moon[c.astroMoonPhase] || 0) + 1
    if (c.astroHourlyZodiac) hour[c.astroHourlyZodiac] = (hour[c.astroHourlyZodiac] || 0) + 1
  }
  if (n < ASTRO_RESONANCE_MIN_SAMPLE) return null

  const rokRatio = ((rok[today.rokuyo] || 0) / n) / (1 / 6)
  const moonShare = MOON_PHASE_SHARE[today.moonPhase] || 1 / 8
  const moonRatio = ((moon[today.moonPhase] || 0) / n) / moonShare
  const todayRatio = Math.round(((rokRatio + moonRatio) / 2) * 100) / 100
  const level: AstroResonanceLevel = todayRatio >= 1.25 ? 'resonant' : todayRatio <= 0.75 ? 'quiet' : 'steady'
  const topHourZodiac = topKey(hour)

  return {
    sampleSize: n,
    topHourZodiac,
    topMoonPhase: topKey(moon),
    topRokuyo: topKey(rok),
    todayRatio,
    level,
    isPeakHour: !!topHourZodiac && topHourZodiac === today.hourlyZodiac,
  }
}
