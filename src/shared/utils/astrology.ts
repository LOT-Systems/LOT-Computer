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
  // (2026-11-19) Day-count from the date's *local* calendar fields via
  // Date.UTC, so the six-day cycle flips at local midnight. The previous
  // getTime() diff against a UTC-midnight anchor flipped at UTC midnight —
  // a user at UTC-8 saw tomorrow's rokuyo from 4 PM onward — and produced a
  // negative index for pre-2000 dates.
  const dayNumber = Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(2000, 0, 1)) / 86400000
  )
  const rokuyoIndex = ((dayNumber % 6) + 6) % 6

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

// ─────────────────────────────────────────────────────────────────────────
// Ambient reading + personalization layer (2026-11-19)
// Everything below stays ambient/environmental — no birth data, no natal
// chart. "Personalization" means: the reading is computed in the user's own
// timeZone, and the user's own Logs history (each entry snapshots the
// reading it was written under) is folded into a personal "resonance".
// ─────────────────────────────────────────────────────────────────────────

export const ROKUYO_GUIDANCE: Record<string, string> = {
  Sensho: 'morning favored',
  Tomobiki: 'shared plans favored',
  Senpu: 'afternoon favored',
  Butsumetsu: 'rest, avoid new starts',
  Taian: 'auspicious for beginnings',
  Shakku: 'midday only, move with care',
}

export interface AstrologyReading {
  westernZodiac: string
  hourlyZodiac: string
  rokuyo: string
  rokuyoGuidance: string
  moonPhase: string
  moonIllumination: number
  /** Local calendar day (YYYY-MM-DD) the reading belongs to */
  localDay: string
  /** Local hour (0–23) the reading was taken at */
  localHour: number
  /** timeZone actually used ('device' when none was supplied/valid) */
  timeZone: string
}

/**
 * Wall-clock Date for `instant` as seen in `timeZone`. The returned Date's
 * getHours()/getDate()/getMonth() readers yield the zone's local fields
 * regardless of the runtime's own timeZone. Isomorphic (Intl only), so the
 * client dashboard and the server Logs snapshot share one implementation.
 * Falls back to `instant` itself on a missing/invalid zone.
 */
export function toWallClockInTimeZone(instant: Date, timeZone?: string | null): Date {
  if (!timeZone) return instant
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(instant)
    const get = (t: string) => Number(parts.find(p => p.type === t)?.value ?? 0)
    return new Date(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'))
  } catch {
    return instant
  }
}

/**
 * One full ambient reading. Calendar-based fields (rokuyo, zodiac hour,
 * western sign) use the user's local wall clock; the moon phase uses the
 * true instant, since the lunar cycle is global and must not be shifted by
 * a timeZone offset.
 */
export function getAstrologyReading(instant: Date = new Date(), timeZone?: string | null): AstrologyReading {
  const wall = toWallClockInTimeZone(instant, timeZone)
  const moon = getMoonPhase(instant)
  const rokuyo = getRokuyo(wall)
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    westernZodiac: getWesternZodiac(wall),
    hourlyZodiac: getHourlyZodiac(wall),
    rokuyo,
    rokuyoGuidance: ROKUYO_GUIDANCE[rokuyo] ?? '',
    moonPhase: moon.phase,
    moonIllumination: moon.illumination,
    localDay: `${wall.getFullYear()}-${pad(wall.getMonth() + 1)}-${pad(wall.getDate())}`,
    localHour: wall.getHours(),
    timeZone: wall === instant ? 'device' : (timeZone as string),
  }
}

/** Minimal shape of a Log entry's context this module reads. */
export interface AstroLogContextLike {
  astroRokuyo?: string | null
  astroMoonPhase?: string | null
  astroHourlyZodiac?: string | null
}

export interface AstroResonance {
  /** Entries that carried an astro snapshot */
  sampleSize: number
  rokuyo: { value: string; share: number } | null
  moonPhase: { value: string; share: number } | null
  hourlyZodiac: { value: string; share: number } | null
}

export const ASTRO_RESONANCE_MIN_SAMPLE = 7

function topOf(values: string[], cycleLength: number): { value: string; share: number } | null {
  if (!values.length) return null
  const counts = new Map<string, number>()
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  let best: [string, number] | null = null
  for (const entry of counts) if (!best || entry[1] > best[1]) best = entry
  if (!best) return null
  const share = best[1] / values.length
  // Only a "resonance" if it clearly beats the uniform baseline for that
  // cycle (1/6 rokuyo, 1/8 moon phases, 1/12 zodiac hours) by 1.5×.
  if (share < (1 / cycleLength) * 1.5) return null
  return { value: best[0], share: Math.round(share * 100) / 100 }
}

/**
 * Personal resonance — which ambient conditions this user most often
 * writes under, derived purely from their own Logs (each entry's context
 * snapshot from getLogContext). Returns null below the minimum sample.
 */
export function computeAstroResonance(
  logs: Array<{ context?: AstroLogContextLike | null }>
): AstroResonance | null {
  const withAstro = logs.filter(l => l?.context?.astroRokuyo)
  if (withAstro.length < ASTRO_RESONANCE_MIN_SAMPLE) return null
  const pick = (k: keyof AstroLogContextLike) =>
    withAstro.map(l => l.context?.[k]).filter((v): v is string => !!v)
  return {
    sampleSize: withAstro.length,
    rokuyo: topOf(pick('astroRokuyo'), 6),
    moonPhase: topOf(pick('astroMoonPhase'), 8),
    hourlyZodiac: topOf(pick('astroHourlyZodiac'), 12),
  }
}

/** Which of today's reading's facets match the user's resonance. */
export function getResonanceMatches(reading: AstrologyReading, resonance: AstroResonance | null): string[] {
  if (!resonance) return []
  const matches: string[] = []
  if (resonance.rokuyo?.value === reading.rokuyo) matches.push('rokuyo')
  if (resonance.moonPhase?.value === reading.moonPhase) matches.push('moon')
  if (resonance.hourlyZodiac?.value === reading.hourlyZodiac) matches.push('hour')
  return matches
}

/** Compact "Taian · Full Moon · Dragon hr" line for a Log entry footer. */
export function formatAstroContext(ctx?: AstroLogContextLike | null): string {
  if (!ctx?.astroRokuyo) return ''
  return [ctx.astroRokuyo, ctx.astroMoonPhase, ctx.astroHourlyZodiac && `${ctx.astroHourlyZodiac} hr`]
    .filter(Boolean)
    .join(' · ')
}
