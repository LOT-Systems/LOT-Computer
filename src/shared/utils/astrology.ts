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

// ─── Lunisolar engine (2026-11-16) ─────────────────────────────────────────
// Rokuyo is NOT a free-running 6-day cycle: in the Japanese calendar it is
// (lunar month + lunar day) % 6, so it resets at every new moon. The earlier
// simplified implementation drifted from printed calendars on most days.
// The engine below derives the 旧暦 (old lunisolar) date from true new moons
// (Meeus ch.49, major terms) and principal solar terms (Meeus ch.25), reckoned
// in JST as the 天保暦 rules specify. Accuracy: exact except on rare days
// where a new moon or solar term falls within minutes of JST midnight.

const DAY_MS = 86400000
const JST_OFFSET_MS = 9 * 3600000
const DEG = Math.PI / 180

// Rokuyo order as indexed by (month + day) % 6
const ROKUYO_BY_LUNAR = ['Taian', 'Shakku', 'Sensho', 'Tomobiki', 'Senpu', 'Butsumetsu'] as const

const jdToMs = (jd: number) => (jd - 2440587.5) * DAY_MS
const msToJd = (ms: number) => ms / DAY_MS + 2440587.5
const sinD = (x: number) => Math.sin(x * DEG)

/** UTC ms of the true new moon with lunation number k (k=0 ≈ 2000-01-06). */
export function getNewMoonMs(k: number): number {
  const T = k / 1236.85
  const jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T * T - 0.00000015 * T ** 3 + 0.00000000073 * T ** 4
  const E = 1 - 0.002516 * T - 0.0000074 * T * T
  const M = 2.5534 + 29.1053567 * k - 0.0000014 * T * T - 0.00000011 * T ** 3
  const Mp = 201.5643 + 385.81693528 * k + 0.0107582 * T * T + 0.00001238 * T ** 3 - 0.000000058 * T ** 4
  const F = 160.7108 + 390.67050284 * k - 0.0016118 * T * T - 0.00000227 * T ** 3 + 0.000000011 * T ** 4
  const Om = 124.7746 - 1.56375588 * k + 0.0020672 * T * T + 0.00000215 * T ** 3
  const corr =
    -0.4072 * sinD(Mp) +
    0.17241 * E * sinD(M) +
    0.01608 * sinD(2 * Mp) +
    0.01039 * sinD(2 * F) +
    0.00739 * E * sinD(Mp - M) -
    0.00514 * E * sinD(Mp + M) +
    0.00208 * E * E * sinD(2 * M) -
    0.00111 * sinD(Mp - 2 * F) -
    0.00057 * sinD(Mp + 2 * F) +
    0.00056 * E * sinD(2 * Mp + M) -
    0.00042 * sinD(3 * Mp) +
    0.00042 * E * sinD(M + 2 * F) +
    0.00038 * E * sinD(M - 2 * F) -
    0.00024 * E * sinD(2 * Mp - M) -
    0.00017 * sinD(Om) -
    0.00007 * sinD(Mp + 2 * M) +
    0.00004 * sinD(2 * Mp - 2 * F) +
    0.00004 * sinD(3 * M) +
    0.00003 * sinD(Mp + M - 2 * F) +
    0.00003 * sinD(2 * Mp + 2 * F) -
    0.00003 * sinD(Mp + M + 2 * F) +
    0.00003 * sinD(Mp - M + 2 * F) -
    0.00002 * sinD(Mp - M - 2 * F) -
    0.00002 * sinD(3 * Mp + M) +
    0.00002 * sinD(4 * Mp)
  // JDE is Terrestrial Time; subtract ΔT (~69s in this era) for UTC.
  return jdToMs(jde + corr) - 69000
}

/** Apparent geocentric solar longitude in degrees [0, 360). */
export function getSunLongitude(ms: number): number {
  const T = (msToJd(ms) - 2451545) / 36525
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * sinD(M) +
    (0.019993 - 0.000101 * T) * sinD(2 * M) +
    0.000289 * sinD(3 * M)
  const om = 125.04 - 1934.136 * T
  const lon = L0 + C - 0.00569 - 0.00478 * sinD(om)
  return ((lon % 360) + 360) % 360
}

/** Index of the lunation (k) whose new moon is the latest one at or before `ms`. */
function lunationAtOrBefore(ms: number): number {
  let k = Math.floor((msToJd(ms) - 2451550.09766) / 29.530588861)
  while (getNewMoonMs(k) > ms) k--
  while (getNewMoonMs(k + 1) <= ms) k++
  return k
}

// JST calendar-day index (days since epoch) of an instant
const jstDayIndex = (ms: number) => Math.floor((ms + JST_OFFSET_MS) / DAY_MS)
// UTC ms of JST midnight beginning a given JST day index
const jstMidnightMs = (dayIndex: number) => dayIndex * DAY_MS - JST_OFFSET_MS

/** Lunar month number (1–12) of the lunation starting at new moon k. */
function lunarMonthNumber(k: number): { month: number; leap: boolean } {
  const startDay = jstDayIndex(getNewMoonMs(k))
  const endDay = jstDayIndex(getNewMoonMs(k + 1))
  const L1 = getSunLongitude(jstMidnightMs(startDay))
  const L2 = getSunLongitude(jstMidnightMs(endDay))
  const span = (L2 - L1 + 360) % 360
  const firstTerm = Math.ceil(L1 / 30) * 30
  if ((firstTerm - L1 + 360) % 360 < span || L1 % 30 === 0) {
    // 雨水 (330°) opens month 1, 春分 (0°) month 2 … 冬至 (270°) month 11
    const month = ((Math.round(firstTerm / 30) % 12) + 2 - 1) % 12 + 1
    return { month, leap: false }
  }
  // No principal term in this lunation → 閏月, numbered after the previous month
  return { month: lunarMonthNumber(k - 1).month, leap: true }
}

export interface LunarDate {
  month: number
  day: number
  leap: boolean
}

/**
 * Japanese lunisolar (旧暦) date for a civil calendar date. Reads the date's
 * wall-clock Y/M/D (getFullYear/getMonth/getDate) and reckons it as a JST day.
 */
export function getLunarDate(date: Date): LunarDate {
  const dayIndex = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS)
  // Latest new moon whose JST date is <= this day: test end of the JST day
  const k = lunationAtOrBefore(jstMidnightMs(dayIndex + 1) - 1)
  const nmDay = jstDayIndex(getNewMoonMs(k))
  const { month, leap } = lunarMonthNumber(k)
  return { month, day: dayIndex - nmDay + 1, leap }
}

/**
 * Get Rokuyo (六曜) - Japanese six-day cycle for determining auspicious days.
 * True calendar rule: (lunar month + lunar day) % 6.
 */
export function getRokuyo(date: Date): string {
  const { month, day } = getLunarDate(date)
  return ROKUYO_BY_LUNAR[(month + day) % 6]
}

/** One-line plain-language gloss for a rokuyo day. */
export function getRokuyoMeaning(rokuyo: string): string {
  const meanings: Record<string, string> = {
    Sensho: 'Act early; mornings favored',
    Tomobiki: 'Shared luck; good for gatherings',
    Senpu: 'Wait; afternoons favored',
    Butsumetsu: 'Quiet day; rest and close loops',
    Taian: 'Most auspicious; begin things',
    Shakku: 'Caution; only midday is clear',
  }
  return meanings[rokuyo] || ''
}

/**
 * Wall-clock Date for an IANA timeZone, built so getHours()/getDate() etc.
 * return that zone's local fields regardless of the runtime's own zone.
 * Falls back to `now` when the zone is missing or invalid.
 */
export function getWallClockDate(timeZone: string | null | undefined, now: Date = new Date()): Date {
  if (!timeZone) return now
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hourCycle: 'h23',
    }).formatToParts(now)
    const get = (t: string) => Number(parts.find(p => p.type === t)?.value)
    return new Date(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'))
  } catch {
    return now
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
  // True lunation bounds (2026-11-16): age is measured from the actual
  // previous new moon and scaled by the actual lunation length, replacing
  // the mean-cycle approximation that could be ~half a day off.
  const lunarCycle = 29.53058770576 // mean days in lunar cycle (phase bins)
  const t = date.getTime()
  const k = lunationAtOrBefore(t)
  const prev = getNewMoonMs(k)
  const next = getNewMoonMs(k + 1)
  const phase = ((t - prev) / (next - prev)) * lunarCycle

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

// ─── Personal resonance from Logs (2026-11-16) ─────────────────────────────
// Personalization without a natal chart: every Log row snapshots the ambient
// reading it was written under (LogContext.astro*). Aggregating those
// snapshots tells the user which ambient conditions they actually show up
// in — a mirror built from their own entries, not a prediction.

export interface AstroResonance {
  sample: number // logs carrying an astro snapshot
  topMoonPhase: string | null
  topMoonPhaseShare: number // 0–100
  topRokuyo: string | null
  topRokuyoShare: number // 0–100
  topHourlyZodiac: string | null
  topHourlyZodiacShare: number // 0–100
}

export const ASTRO_RESONANCE_MIN_SAMPLE = 7

type AstroContextLike = {
  context?: {
    astroMoonPhase?: string | null
    astroRokuyo?: string | null
    astroHourlyZodiac?: string | null
  } | null
}

function topOf(values: (string | null | undefined)[]): { key: string | null; share: number } {
  const counts = new Map<string, number>()
  let total = 0
  for (const v of values) {
    if (!v) continue
    counts.set(v, (counts.get(v) || 0) + 1)
    total++
  }
  let key: string | null = null
  let best = 0
  for (const [k, c] of counts) {
    if (c > best) { best = c; key = k }
  }
  return { key, share: total ? Math.round((best / total) * 100) : 0 }
}

export function getAstroResonance(logs: AstroContextLike[]): AstroResonance {
  const tagged = logs.filter(l => l?.context?.astroRokuyo || l?.context?.astroMoonPhase)
  const phase = topOf(tagged.map(l => l.context?.astroMoonPhase))
  const rokuyo = topOf(tagged.map(l => l.context?.astroRokuyo))
  const hour = topOf(tagged.map(l => l.context?.astroHourlyZodiac))
  return {
    sample: tagged.length,
    topMoonPhase: phase.key,
    topMoonPhaseShare: phase.share,
    topRokuyo: rokuyo.key,
    topRokuyoShare: rokuyo.share,
    topHourlyZodiac: hour.key,
    topHourlyZodiacShare: hour.share,
  }
}
