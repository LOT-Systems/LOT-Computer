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
  const index = (((year - 1900) % 12) + 12) % 12
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
  // raw epoch milliseconds — the old `date.getTime() - new Date('2000-01-01')`
  // form anchored the day boundary to UTC midnight, so the rokuyo flipped
  // mid-afternoon/evening for users west of UTC (and mid-morning east of it)
  // instead of at their local midnight. (2026-11-14 fix)
  const dayIndex = Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(2000, 0, 1)) /
      86400000
  )
  // Safe modulo — dates before 2000 previously produced a negative index
  // and an `undefined` rokuyo.
  const rokuyoIndex = ((dayIndex % 6) + 6) % 6
  return ROKUYO[rokuyoIndex]
}

/**
 * Rokuyo guidance — the traditional meaning of each day, resolved against the
 * current local hour so the reading is time-aware ("morning is favored" reads
 * differently at 8 AM than at 4 PM). Ambient, not personal.
 *
 * `favorable` is true when *this moment* is the favored part of the day.
 */
export function getRokuyoGuidance(
  rokuyo: string,
  hour: number
): { meaning: string; hint: string; favorable: boolean } {
  const isMorning = hour < 12
  switch (rokuyo) {
    case 'Sensho':
      return {
        meaning: 'Early wins',
        hint: isMorning ? 'Morning is favored — act early' : 'Morning has passed — keep it light',
        favorable: isMorning,
      }
    case 'Tomobiki':
      return {
        meaning: 'Shared luck',
        hint: hour >= 11 && hour < 13 ? 'Midday pause — step back briefly' : 'Good for gatherings and shared plans',
        favorable: !(hour >= 11 && hour < 13),
      }
    case 'Senpu':
      return {
        meaning: 'Patience first',
        hint: isMorning ? 'Hold steady — afternoon is favored' : 'Afternoon is favored — move now',
        favorable: !isMorning,
      }
    case 'Butsumetsu':
      return {
        meaning: 'Quiet day',
        hint: 'Rest, close loops, avoid new starts',
        favorable: false,
      }
    case 'Taian':
      return {
        meaning: 'Great peace',
        hint: 'Auspicious all day — good for beginnings',
        favorable: true,
      }
    case 'Shakku':
      return {
        meaning: 'Take care',
        hint: hour >= 11 && hour < 13 ? 'Midday window is clear' : 'Move carefully — midday is clearest',
        favorable: hour >= 11 && hour < 13,
      }
    default:
      return { meaning: '', hint: '', favorable: false }
  }
}

/**
 * Wall-clock Date for a given IANA timeZone, built with the plain Date
 * constructor so getHours()/getDate()/getMonth() return the *zone's* local
 * fields regardless of the runtime's own zone. Isomorphic (Intl only, no
 * dayjs-timezone plugin required) so server Logs and the client dashboard
 * share one implementation. Falls back to the runtime-local clock on an
 * unknown/missing zone.
 */
export function toZonedWallClock(now: Date, timeZone?: string | null): Date {
  if (!timeZone) return now
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }).formatToParts(now)
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value)
    return new Date(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'))
  } catch {
    return now
  }
}

export type AstrologyReading = {
  hourlyZodiac: string
  westernZodiac: string
  rokuyo: string
  rokuyoMeaning: string
  rokuyoHint: string
  favorableNow: boolean
  moonPhase: string
  moonIllumination: number
  moonEmoji: string
  yearAnimal: string
}

/**
 * Single source of truth for the ambient reading. Calendar/clock-based parts
 * (zodiac hour, rokuyo, western sign, year animal) use the zone's wall clock;
 * the moon phase uses the *absolute* instant — the moon is the same for
 * everyone, and feeding it a shifted wall-clock Date skewed it by the UTC
 * offset (up to ±14h) in the old server-side Logs path.
 */
export function getAstrologyReading(now: Date = new Date(), timeZone?: string | null): AstrologyReading {
  const local = toZonedWallClock(now, timeZone)
  const rokuyo = getRokuyo(local)
  const guidance = getRokuyoGuidance(rokuyo, local.getHours())
  const moon = getMoonPhase(now)
  return {
    hourlyZodiac: getHourlyZodiac(local),
    westernZodiac: getWesternZodiac(local),
    rokuyo,
    rokuyoMeaning: guidance.meaning,
    rokuyoHint: guidance.hint,
    favorableNow: guidance.favorable,
    moonPhase: moon.phase,
    moonIllumination: moon.illumination,
    moonEmoji: getMoonEmoji(moon.phase),
    yearAnimal: getJapaneseZodiac(local.getFullYear()),
  }
}

/**
 * Compact ambient tag for a stored log context, e.g. "Taian · Full Moon".
 * Used by the journal's per-entry context hover line so every entry — not
 * just SYS snapshots — shows the conditions it was written under.
 */
export function formatAstroTag(context?: { astroRokuyo?: string | null; astroMoonPhase?: string | null } | null): string {
  if (!context) return ''
  return [context.astroRokuyo, context.astroMoonPhase].filter(Boolean).join(' · ')
}

/**
 * Logs resonance — personalization derived from the user's *own* journal:
 * which rokuyo and moon phase their entries most often fall on. Requires a
 * minimum sample so a handful of entries doesn't produce a spurious pattern.
 */
export function getAstroResonance(
  contexts: Array<{ astroRokuyo?: string | null; astroMoonPhase?: string | null } | null | undefined>,
  minSample = 5
): { sample: number; topRokuyo: string | null; topRokuyoCount: number; topMoonPhase: string | null; topMoonCount: number } | null {
  const rokuyoCounts: Record<string, number> = {}
  const moonCounts: Record<string, number> = {}
  let sample = 0
  for (const c of contexts) {
    if (!c?.astroRokuyo) continue
    sample++
    rokuyoCounts[c.astroRokuyo] = (rokuyoCounts[c.astroRokuyo] || 0) + 1
    if (c.astroMoonPhase) moonCounts[c.astroMoonPhase] = (moonCounts[c.astroMoonPhase] || 0) + 1
  }
  if (sample < minSample) return null
  const top = (m: Record<string, number>): [string | null, number] =>
    Object.entries(m).reduce<[string | null, number]>((best, [k, v]) => (v > best[1] ? [k, v] : best), [null, 0])
  const [topRokuyo, topRokuyoCount] = top(rokuyoCounts)
  const [topMoonPhase, topMoonCount] = top(moonCounts)
  return { sample, topRokuyo, topRokuyoCount, topMoonPhase, topMoonCount }
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
