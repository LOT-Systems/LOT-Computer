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
  const knownRokuyoIndex = 0

  // Count whole *calendar* days between the anchor and the date's local
  // (wall-clock) Y/M/D. The previous version subtracted a UTC-midnight
  // anchor from a local instant, so for zones east of UTC (e.g. Asia/Tokyo)
  // the rokuyo rolled over at 09:00 local instead of at midnight. Comparing
  // UTC-normalized calendar dates makes the boundary local midnight in every
  // zone; zones west of UTC are unchanged.
  const localDay = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  const daysDiff = Math.floor((localDay - Date.UTC(2000, 0, 1)) / 86400000)

  // Calculate Rokuyo index (6-day cycle)
  const rokuyoIndex = (((knownRokuyoIndex + daysDiff) % 6) + 6) % 6

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
// v2 (2026-11-27) — personalization + widget/Logs synchronization helpers
// Ambient conditions only — never a personal natal chart.
// ─────────────────────────────────────────────────────────────────────────────

export type AstrologyReading = {
  westernZodiac: string
  hourlyZodiac: string
  rokuyo: string
  moonPhase: string
  moonIllumination: number
  /** Short ambient guidance for the rokuyo, adjusted to the current hour */
  guidance: string
  /** True when the current hour falls in the rokuyo's favored window */
  favoredNow: boolean
  /** IANA zone the reading was computed in (null = device-local) */
  timeZone: string | null
}

/**
 * Build a Date whose local getters (getHours/getDate/…) return the wall-clock
 * time in `timeZone`. Isomorphic (Intl only, no dayjs) so client and server
 * produce identical readings for the same saved profile timeZone.
 * Falls back to the input date when the zone is missing or invalid.
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
    const get = (t: string) => Number(parts.find(p => p.type === t)?.value)
    const y = get('year'), mo = get('month'), d = get('day')
    const h = get('hour') % 24, mi = get('minute'), se = get('second')
    if ([y, mo, d, h, mi, se].some(n => Number.isNaN(n))) return date
    return new Date(y, mo - 1, d, h, mi, se)
  } catch {
    return date
  }
}

// Traditional rokuyo windows. Sensho favors the morning, Senpu the afternoon,
// Shakku only the midday hour (11–13); Taian and Tomobiki are good all day
// (Tomobiki's midday is traditionally neutral); Butsumetsu is quiet all day.
export function getRokuyoGuidance(rokuyo: string, hour: number): { guidance: string; favoredNow: boolean } {
  switch (rokuyo) {
    case 'Sensho':
      return { guidance: hour < 12 ? 'Morning favored · act early' : 'Morning has passed · steady pace', favoredNow: hour < 12 }
    case 'Senpu':
      return { guidance: hour < 12 ? 'Calm morning · afternoon favored' : 'Afternoon favored · move now', favoredNow: hour >= 12 }
    case 'Shakku':
      return { guidance: hour >= 11 && hour < 13 ? 'Midday window open' : 'Caution · favor midday', favoredNow: hour >= 11 && hour < 13 }
    case 'Taian':
      return { guidance: 'Auspicious all day · begin things', favoredNow: true }
    case 'Tomobiki':
      return { guidance: hour >= 11 && hour < 13 ? 'Neutral midday · share with others' : 'Good for shared plans', favoredNow: !(hour >= 11 && hour < 13) }
    case 'Butsumetsu':
      return { guidance: 'Quiet day · reflect, rest, close loops', favoredNow: false }
    default:
      return { guidance: '', favoredNow: false }
  }
}

/**
 * One-call ambient reading. If `timeZone` is given (the user's saved
 * profile zone), the reading reflects that zone's wall clock, so the
 * dashboard and the Logs snapshot agree even on a travelling device.
 */
export function getAstrologyReading(date: Date = new Date(), timeZone?: string | null): AstrologyReading {
  const local = toZonedWallClock(date, timeZone)
  const moon = getMoonPhase(date) // moon phase is an absolute instant — no zone shift
  const rokuyo = getRokuyo(local)
  const { guidance, favoredNow } = getRokuyoGuidance(rokuyo, local.getHours())
  return {
    westernZodiac: getWesternZodiac(local),
    hourlyZodiac: getHourlyZodiac(local),
    rokuyo,
    moonPhase: moon.phase,
    moonIllumination: moon.illumination,
    guidance,
    favoredNow,
    timeZone: timeZone || null,
  }
}

type AstroLogLike = {
  createdAt: Date | string
  event?: string
  context?: Record<string, any> | null
}

export type AstroLogRhythm = {
  /** Log entries considered (with a readable astro stamp) */
  total: number
  /** Entries written under the same moon phase as `current` */
  samePhase: number
  /** Entries written under the same rokuyo as `current` */
  sameRokuyo: number
  /** Moon phase the user logs under most (null when < 3 entries) */
  topPhase: string | null
  /** Rokuyo the user logs under most (null when < 3 entries) */
  topRokuyo: string | null
  /** Entries in the current lunar cycle (last 29.5 days) */
  thisCycle: number
}

/**
 * Read the astro stamp for a log. Prefers the server snapshot written at
 * creation (LogContext.astro*, added 2026-07-27); for older entries it
 * back-derives the reading from createdAt in the entry's own saved zone.
 */
export function getLogAstroStamp(log: AstroLogLike): { rokuyo: string; moonPhase: string; moonIllumination: number; hourlyZodiac: string } | null {
  const ctx = log.context || {}
  if (ctx.astroRokuyo && ctx.astroMoonPhase) {
    return {
      rokuyo: ctx.astroRokuyo,
      moonPhase: ctx.astroMoonPhase,
      moonIllumination: typeof ctx.astroMoonIllumination === 'number' ? ctx.astroMoonIllumination : getMoonPhase(new Date(log.createdAt)).illumination,
      hourlyZodiac: ctx.astroHourlyZodiac || getHourlyZodiac(toZonedWallClock(new Date(log.createdAt), ctx.timeZone)),
    }
  }
  const created = new Date(log.createdAt)
  if (Number.isNaN(created.getTime())) return null
  const local = toZonedWallClock(created, ctx.timeZone)
  const moon = getMoonPhase(created)
  return { rokuyo: getRokuyo(local), moonPhase: moon.phase, moonIllumination: moon.illumination, hourlyZodiac: getHourlyZodiac(local) }
}

function topKey(counts: Record<string, number>): string | null {
  let best: string | null = null
  let bestN = 0
  for (const [k, n] of Object.entries(counts)) {
    if (n > bestN) { best = k; bestN = n }
  }
  return best
}

/**
 * Summarize which ambient conditions a user's Logs were written under.
 * Only user-authored entries count (event 'note' / 'answer' or text logs),
 * so automatic system snapshots don't drown the rhythm.
 */
export function summarizeAstroLogs(
  logs: (AstroLogLike & { text?: string | null })[],
  current: Pick<AstrologyReading, 'moonPhase' | 'rokuyo'>,
  now: Date = new Date()
): AstroLogRhythm {
  const phaseCounts: Record<string, number> = {}
  const rokuyoCounts: Record<string, number> = {}
  let total = 0, samePhase = 0, sameRokuyo = 0, thisCycle = 0
  const cycleStart = now.getTime() - 29.53058770576 * 86400000
  for (const log of logs) {
    const authored = log.event === 'note' || log.event === 'answer' || (!!log.text && log.text.trim().length > 0)
    if (!authored) continue
    const stamp = getLogAstroStamp(log)
    if (!stamp) continue
    total++
    phaseCounts[stamp.moonPhase] = (phaseCounts[stamp.moonPhase] || 0) + 1
    rokuyoCounts[stamp.rokuyo] = (rokuyoCounts[stamp.rokuyo] || 0) + 1
    if (stamp.moonPhase === current.moonPhase) samePhase++
    if (stamp.rokuyo === current.rokuyo) sameRokuyo++
    if (new Date(log.createdAt).getTime() >= cycleStart) thisCycle++
  }
  return {
    total,
    samePhase,
    sameRokuyo,
    topPhase: total >= 3 ? topKey(phaseCounts) : null,
    topRokuyo: total >= 3 ? topKey(rokuyoCounts) : null,
    thisCycle,
  }
}
