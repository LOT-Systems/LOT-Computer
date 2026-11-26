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
  // Count whole *calendar* days using the date's own wall-clock fields on
  // both sides (Date.UTC), so the result can't flip a day early/late near
  // local midnight. The previous version subtracted a UTC-midnight anchor
  // from a local timestamp, which shifted the cycle for users west of UTC
  // in the evening and east of UTC after midnight (2026-11-26 fix).
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

// ---------------------------------------------------------------------------
// Ambient reading — single source of truth (2026-11-26, Astrology v2)
// Shared by the dashboard (client) and getLogContext (server) so the block
// on screen and the ASTRO: line written into every Log entry can never drift.
// ---------------------------------------------------------------------------

export type AmbientReading = {
  hourlyZodiac: string
  westernZodiac: string
  rokuyo: string
  moonPhase: string
  moonIllumination: number
  auspicious: boolean
}

/**
 * Wall-clock Date for a given IANA timeZone. The returned Date's local
 * getters (getHours/getDate/...) report the time *in that zone*, which is
 * what the hour/day-based readers above expect. Falls back to `now` on an
 * unknown/empty zone. Uses Intl only — no tz plugin needed on the client.
 */
export function getWallClockDate(timeZone?: string | null, now: Date = new Date()): Date {
  if (!timeZone) return now
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(now)
    const get = (t: string) => Number(parts.find(p => p.type === t)?.value)
    return new Date(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'))
  } catch {
    return now
  }
}

/**
 * Full ambient reading. Moon phase is an absolute astronomical quantity, so
 * it is computed from the real instant; the hour/day-based readings use the
 * wall clock of the user's timeZone.
 */
export function getAmbientReading(timeZone?: string | null, now: Date = new Date()): AmbientReading {
  const wall = getWallClockDate(timeZone, now)
  const moon = getMoonPhase(now)
  const rokuyo = getRokuyo(wall)
  return {
    hourlyZodiac: getHourlyZodiac(wall),
    westernZodiac: getWesternZodiac(wall),
    rokuyo,
    moonPhase: moon.phase,
    moonIllumination: moon.illumination,
    auspicious: rokuyo === 'Taian',
  }
}

export type AstroRhythm = {
  /** log entries that carried an ambient snapshot */
  sampled: number
  /** moon phase under which this user writes most (null below threshold) */
  dominantMoonPhase: string | null
  /** rokuyo under which this user writes most (null below threshold) */
  dominantRokuyo: string | null
  /** zodiac hour under which this user writes most (null below threshold) */
  dominantHourlyZodiac: string | null
  /** share (0-100) of entries written under the dominant moon phase */
  moonPhaseShare: number
  /** true when the current reading matches the user's dominant moon phase */
  inRhythm: boolean
}

/** Minimum snapshots before a rhythm is claimed — avoids noise-as-pattern. */
export const ASTRO_RHYTHM_MIN_SAMPLES = 8

function topOf(counts: Record<string, number>): [string | null, number] {
  let best: string | null = null
  let n = 0
  for (const [k, v] of Object.entries(counts)) {
    if (v > n) { best = k; n = v }
  }
  return [best, n]
}

/**
 * Personal rhythm derived from the user's own Logs — reads the ambient
 * snapshot that getLogContext stamps on every entry (log.context.astro*).
 * Personalization without birth data: "when do *you* tend to write".
 * Only user-authored events count (answers, notes, journal), not system noise.
 */
export function summarizeAstroRhythm(
  logs: Array<{ event?: string; context?: Record<string, any> | null }>,
  current?: Pick<AmbientReading, 'moonPhase'>
): AstroRhythm {
  const AUTHORED = new Set([
    'answer', 'note', 'emotional_checkin', 'intention',
    'goal_set', 'goal_complete', 'plan_set', 'self_care_complete',
  ])
  const moon: Record<string, number> = {}
  const roku: Record<string, number> = {}
  const hour: Record<string, number> = {}
  let sampled = 0
  for (const log of logs) {
    const c = log?.context
    if (!c?.astroMoonPhase || (log.event && !AUTHORED.has(log.event))) continue
    sampled++
    moon[c.astroMoonPhase] = (moon[c.astroMoonPhase] || 0) + 1
    if (c.astroRokuyo) roku[c.astroRokuyo] = (roku[c.astroRokuyo] || 0) + 1
    if (c.astroHourlyZodiac) hour[c.astroHourlyZodiac] = (hour[c.astroHourlyZodiac] || 0) + 1
  }
  const enough = sampled >= ASTRO_RHYTHM_MIN_SAMPLES
  const [dominantMoonPhase, moonN] = topOf(moon)
  const [dominantRokuyo] = topOf(roku)
  const [dominantHourlyZodiac] = topOf(hour)
  return {
    sampled,
    dominantMoonPhase: enough ? dominantMoonPhase : null,
    dominantRokuyo: enough ? dominantRokuyo : null,
    dominantHourlyZodiac: enough ? dominantHourlyZodiac : null,
    moonPhaseShare: enough && sampled ? Math.round((moonN / sampled) * 100) : 0,
    inRhythm: !!(enough && current && dominantMoonPhase === current.moonPhase),
  }
}
