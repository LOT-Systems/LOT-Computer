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
  // Known starting point: January 1, 2000 was Sensho (index 0)
  const knownDate = new Date('2000-01-01')
  const knownRokuyoIndex = 0

  // Calculate days since known date
  const daysDiff = Math.floor((date.getTime() - knownDate.getTime()) / (1000 * 60 * 60 * 24))

  // Calculate Rokuyo index (6-day cycle)
  const rokuyoIndex = (knownRokuyoIndex + daysDiff) % 6

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

// ─── Astro Resonance (personalization from Logs) ────────────────────────────
//
// Every log written through getLogContext() carries an ambient astrology
// stamp (astroRokuyo / astroMoonPhase / astroHourlyZodiac …) in its context.
// Astro Resonance folds those stamps back into a personal reading: which
// zodiac hour, moon phase and rokuyo day the user is *actually* most active
// in, and — from emotional check-ins — under which moon phase their mood
// tends to lean positive. Still ambient conditions × the user's own
// behaviour; never a natal chart.

// Emotional states counted as positive for the mood-lean tally. Mirrors the
// replenishing side of ENERGY_COSTS in server/utils/energy.ts.
const POSITIVE_STATES = new Set([
  'energized', 'calm', 'peaceful', 'grateful', 'hopeful', 'fulfilled', 'content', 'excited', 'happy', 'joyful',
])

// Minimum stamped logs before a resonance is shown — below this the "peak"
// is noise from a handful of entries.
export const ASTRO_RESONANCE_MIN_SAMPLES = 5

export type AstroResonanceLog = {
  event: string
  context?: Record<string, any> | null
  metadata?: Record<string, any> | null
}

export type AstroResonance = {
  samples: number
  peakHour: string | null
  peakHourShare: number // 0-100, share of stamped logs in the peak hour
  peakMoonPhase: string | null
  peakRokuyo: string | null
  // Moon phase under which check-ins lean most positive (≥2 check-ins)
  brightMoonPhase: string | null
  brightMoonShare: number // 0-100 positive share under brightMoonPhase
  checkIns: number
}

export type AstroAlignment = {
  inPeakHour: boolean
  inPeakMoon: boolean
  inBrightMoon: boolean
  onPeakRokuyo: boolean
  score: number // 0-4 count of matches
}

function topKey(counts: Map<string, number>): [string | null, number] {
  let best: string | null = null
  let bestCount = 0
  counts.forEach((count, key) => {
    if (count > bestCount) { best = key; bestCount = count }
  })
  return [best, bestCount]
}

function bump(counts: Map<string, number>, key: unknown) {
  if (typeof key !== 'string' || !key) return
  counts.set(key, (counts.get(key) || 0) + 1)
}

/**
 * Fold astro-stamped log entries into a personal resonance reading.
 * Pure — safe on client (System widget, Logs) and server alike.
 */
export function computeAstroResonance(logs: AstroResonanceLog[]): AstroResonance {
  const hours = new Map<string, number>()
  const moons = new Map<string, number>()
  const rokuyos = new Map<string, number>()
  const moodByMoon = new Map<string, { total: number; positive: number }>()
  let samples = 0
  let checkIns = 0

  for (const log of logs) {
    const ctx = log.context
    if (!ctx || !ctx.astroRokuyo) continue
    samples++
    bump(hours, ctx.astroHourlyZodiac)
    bump(moons, ctx.astroMoonPhase)
    bump(rokuyos, ctx.astroRokuyo)

    if (log.event === 'emotional_checkin' && typeof ctx.astroMoonPhase === 'string') {
      checkIns++
      const state = String(log.metadata?.emotionalState || '').toLowerCase()
      const entry = moodByMoon.get(ctx.astroMoonPhase) || { total: 0, positive: 0 }
      entry.total++
      if (POSITIVE_STATES.has(state)) entry.positive++
      moodByMoon.set(ctx.astroMoonPhase, entry)
    }
  }

  const [peakHour, peakHourCount] = topKey(hours)
  const [peakMoonPhase] = topKey(moons)
  const [peakRokuyo] = topKey(rokuyos)

  let brightMoonPhase: string | null = null
  let brightMoonShare = 0
  moodByMoon.forEach((entry, phase) => {
    if (entry.total < 2) return
    const share = Math.round((entry.positive / entry.total) * 100)
    if (share > brightMoonShare) { brightMoonShare = share; brightMoonPhase = phase }
  })

  return {
    samples,
    peakHour,
    peakHourShare: samples > 0 ? Math.round((peakHourCount / samples) * 100) : 0,
    peakMoonPhase,
    peakRokuyo,
    brightMoonPhase,
    brightMoonShare,
    checkIns,
  }
}

/**
 * Compare the current ambient reading against a resonance profile.
 */
export function getAstroAlignment(
  resonance: AstroResonance,
  now: { hourlyZodiac: string; moonPhase: string; rokuyo: string }
): AstroAlignment {
  const inPeakHour = !!resonance.peakHour && resonance.peakHour === now.hourlyZodiac
  const inPeakMoon = !!resonance.peakMoonPhase && resonance.peakMoonPhase === now.moonPhase
  const inBrightMoon = !!resonance.brightMoonPhase && resonance.brightMoonPhase === now.moonPhase
  const onPeakRokuyo = !!resonance.peakRokuyo && resonance.peakRokuyo === now.rokuyo
  return {
    inPeakHour,
    inPeakMoon,
    inBrightMoon,
    onPeakRokuyo,
    score: [inPeakHour, inPeakMoon, inBrightMoon, onPeakRokuyo].filter(Boolean).length,
  }
}
