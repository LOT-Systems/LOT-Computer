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

// ─── Kyureki (旧暦) — Japanese lunisolar calendar ─────────────────────────
// Rokuyo is defined on the traditional lunisolar date, not as a free-running
// 6-day cycle: index = (lunarMonth + lunarDay) % 6, and it resets at every
// new moon. Month boundaries are new moons on the JST (UTC+9) calendar date;
// month numbers come from the principal solar term (chūki, a multiple of 30°
// of solar longitude) each month contains — the month holding the winter
// solstice (270°) is month 11. A month with no chūki is a leap month and
// repeats the previous month's number. Pure date-math, no external API.

const RAD = Math.PI / 180
const DAY_MS = 86400000
const JST_OFFSET_DAYS = 9 / 24
const DELTA_T_DAYS = 69.2 / 86400 // TT − UT, ~2020s; sub-minute effect

function sinD(deg: number): number {
  return Math.sin(deg * RAD)
}

function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360
}

/** Julian Day (UT) → integer JST calendar-day number (days since 1970-01-01). */
function jdToJstDay(jd: number): number {
  return Math.floor(jd - 2440587.5 + JST_OFFSET_DAYS)
}

/** Integer day number → JD (UT) at 00:00 JST of that day. */
function jstDayStartJd(day: number): number {
  return day + 2440587.5 - JST_OFFSET_DAYS
}

/** Meeus ch. 49 — true new moon k (k=0 ≈ 2000-01-06), returned as JD (UT). */
function newMoonJd(k: number): number {
  const T = k / 1236.85
  const T2 = T * T, T3 = T2 * T, T4 = T3 * T
  let jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T2 - 0.00000015 * T3 + 0.00000000073 * T4
  const E = 1 - 0.002516 * T - 0.0000074 * T2
  const M = 2.5534 + 29.1053567 * k - 0.0000014 * T2 - 0.00000011 * T3
  const Mp = 201.5643 + 385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4
  const F = 160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4
  const Om = 124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3
  jde +=
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
    0.00004 * sinD(3 * M + Mp) +
    0.00003 * sinD(Mp + M - 2 * F) +
    0.00003 * sinD(2 * Mp + 2 * F) -
    0.00003 * sinD(Mp + M + 2 * F) +
    0.00003 * sinD(Mp - M + 2 * F) -
    0.00002 * sinD(Mp - M - 2 * F) -
    0.00002 * sinD(3 * Mp + M) +
    0.00002 * sinD(4 * Mp)
  // Planetary arguments
  const A = [
    [299.77 + 0.107408 * k - 0.009173 * T2, 0.000325],
    [251.88 + 0.016321 * k, 0.000165],
    [251.83 + 26.651886 * k, 0.000164],
    [349.42 + 36.412478 * k, 0.000126],
    [84.66 + 18.206239 * k, 0.00011],
    [141.74 + 53.303771 * k, 0.000062],
    [207.14 + 2.453732 * k, 0.00006],
    [154.84 + 7.30686 * k, 0.000056],
    [34.52 + 27.261239 * k, 0.000047],
    [207.19 + 0.121824 * k, 0.000042],
    [291.34 + 1.844379 * k, 0.00004],
    [161.72 + 24.198154 * k, 0.000037],
    [239.56 + 25.513099 * k, 0.000035],
    [331.55 + 3.592518 * k, 0.000023],
  ]
  for (const [arg, coef] of A) jde += coef * sinD(arg)
  return jde - DELTA_T_DAYS
}

/** Meeus ch. 25 (low precision, ~0.01°) — apparent solar longitude in degrees. */
function solarLongitude(jd: number): number {
  const T = (jd + DELTA_T_DAYS - 2451545.0) / 36525
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * sinD(M) +
    (0.019993 - 0.000101 * T) * sinD(2 * M) +
    0.000289 * sinD(3 * M)
  const omega = 125.04 - 1934.136 * T
  return norm360(L0 + C - 0.00569 - 0.00478 * sinD(omega))
}

/** JST day number on which lunation k begins. */
function lunationStartDay(k: number): number {
  return jdToJstDay(newMoonJd(k))
}

/**
 * Month number from the first chūki inside [startDay, endDay), or null if the
 * lunation holds none (leap month). Chūki longitudes: 330° → month 1,
 * 0° → 2, … 270° → 11, 300° → 12.
 */
function chukiMonth(startDay: number, endDay: number): number | null {
  const a = solarLongitude(jstDayStartJd(startDay))
  const b = solarLongitude(jstDayStartJd(endDay))
  const sa = Math.floor(a / 30)
  let sb = Math.floor(b / 30)
  if (sb < sa) sb += 12
  if (sb === sa) return null
  const longitude = ((sa + 1) % 12) * 30
  const month = (longitude / 30 + 2) % 12
  return month === 0 ? 12 : month
}

export interface LunarDate {
  month: number // 1–12
  day: number // 1–30
  isLeapMonth: boolean
}

const lunarCache = new Map<number, LunarDate>()

/** Lunisolar date for an integer calendar-day number (days since 1970-01-01). */
function lunarDateForDay(day: number): LunarDate {
  const cached = lunarCache.get(day)
  if (cached) return cached

  // Locate lunation k with start(k) ≤ day < start(k+1)
  const jd = day + 2440587.5
  let k = Math.floor((jd - 2451550.09766) / 29.530588861)
  while (lunationStartDay(k) > day) k--
  while (lunationStartDay(k + 1) <= day) k++

  const start = lunationStartDay(k)
  let month: number | null = chukiMonth(start, lunationStartDay(k + 1))
  let isLeapMonth = false
  if (month === null) {
    // Leap month — takes the number of the preceding month
    isLeapMonth = true
    let j = k - 1
    let prev: number | null = null
    for (let guard = 0; guard < 3 && prev === null; guard++, j--) {
      prev = chukiMonth(lunationStartDay(j), lunationStartDay(j + 1))
    }
    month = prev ?? 1
  }

  const result: LunarDate = { month, day: day - start + 1, isLeapMonth }
  if (lunarCache.size > 2000) lunarCache.clear()
  lunarCache.set(day, result)
  return result
}

/** Integer day number of a Date's wall-clock (getFullYear/Month/Date) calendar day. */
function wallClockDayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS)
}

/**
 * Kyureki lunisolar date for the wall-clock calendar day of `date`.
 * The calendar day is taken as-is (the day the user sees); its lunar
 * date is looked up on the canonical JST-based lunisolar calendar.
 */
export function getLunarDate(date: Date): LunarDate {
  return lunarDateForDay(wallClockDayNumber(date))
}

// Order follows (lunarMonth + lunarDay) % 6
const ROKUYO_BY_INDEX = ['Taian', 'Shakku', 'Sensho', 'Tomobiki', 'Senpu', 'Butsumetsu'] as const

/**
 * Get Rokuyo (六曜) - Japanese six-day cycle for determining auspicious days.
 * Computed from the Kyureki lunisolar date: (lunarMonth + lunarDay) % 6.
 */
export function getRokuyo(date: Date): string {
  const lunar = getLunarDate(date)
  return ROKUYO_BY_INDEX[(lunar.month + lunar.day) % 6]
}

export type RokuyoWindow = 'all-day' | 'morning' | 'afternoon' | 'not-noon' | 'noon-only' | 'none'

export interface RokuyoGuidance {
  rokuyo: string
  kanji: string
  window: RokuyoWindow
  label: string // short display label, e.g. "AM favored"
  meaning: string
}

const ROKUYO_GUIDANCE: Record<string, Omit<RokuyoGuidance, 'rokuyo'>> = {
  Taian: { kanji: '大安', window: 'all-day', label: 'all day', meaning: 'Great peace — favorable for beginnings all day' },
  Shakku: { kanji: '赤口', window: 'noon-only', label: 'noon only', meaning: 'Red mouth — caution; only the noon hours (11–13) are favorable' },
  Sensho: { kanji: '先勝', window: 'morning', label: 'AM favored', meaning: 'Early win — act early; morning is favorable' },
  Tomobiki: { kanji: '友引', window: 'not-noon', label: 'AM/PM, not noon', meaning: 'Pulling friends — good for shared plans; avoid noon' },
  Senpu: { kanji: '先負', window: 'afternoon', label: 'PM favored', meaning: 'Early loss — move slowly; afternoon is favorable' },
  Butsumetsu: { kanji: '仏滅', window: 'none', label: 'rest day', meaning: 'Buddha’s death — inauspicious; a day for rest and reflection' },
}

/** Traditional favorable-time guidance for a rokuyo day. */
export function getRokuyoGuidance(rokuyo: string): RokuyoGuidance {
  const g = ROKUYO_GUIDANCE[rokuyo] ?? ROKUYO_GUIDANCE.Taian
  return { rokuyo, ...g }
}

/** Whether a wall-clock hour (0–23) falls in the rokuyo's favorable window. */
export function isRokuyoFavoredHour(rokuyo: string, hour: number): boolean {
  switch (getRokuyoGuidance(rokuyo).window) {
    case 'all-day':
      return true
    case 'morning':
      return hour < 12
    case 'afternoon':
      return hour >= 12
    case 'not-noon':
      return hour < 11 || hour >= 13
    case 'noon-only':
      return hour >= 11 && hour < 13
    default:
      return false
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

/**
 * Wall-clock view of an instant in an IANA timeZone, as a plain Date whose
 * getHours()/getDate()/… return the zone's local fields. Isomorphic (Intl
 * only, no dayjs plugin). Falls back to the runtime's local time when the
 * zone is missing or invalid.
 */
export function toZonedWallClock(instant: Date, timeZone?: string | null): Date {
  if (!timeZone) return new Date(instant.getTime())
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).formatToParts(instant)
    const get = (type: string) => Number(parts.find(p => p.type === type)?.value)
    return new Date(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'))
  } catch {
    return new Date(instant.getTime())
  }
}

export interface AmbientAstrology {
  westernZodiac: string
  hourlyZodiac: string
  rokuyo: string
  rokuyoKanji: string
  rokuyoWindow: RokuyoWindow
  rokuyoLabel: string
  rokuyoMeaning: string
  favoredNow: boolean
  auspicious: boolean // Taian day
  lunarMonth: number
  lunarDay: number
  lunarLeapMonth: boolean
  moonPhase: string
  moonIllumination: number
  dateKey: string // YYYY-MM-DD in the reading's timeZone
}

/**
 * The single source of truth for the Astrology block — used by the System
 * dashboard, the QIE signal, and every Log entry's context snapshot, so all
 * three agree for a given instant + timeZone. Ambient conditions only.
 */
export function getAmbientAstrology(instant: Date = new Date(), timeZone?: string | null): AmbientAstrology {
  const wall = toZonedWallClock(instant, timeZone)
  const rokuyo = getRokuyo(wall)
  const guidance = getRokuyoGuidance(rokuyo)
  const lunar = getLunarDate(wall)
  // Moon phase is a property of the instant, not of the wall clock
  const moon = getMoonPhase(instant)
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    westernZodiac: getWesternZodiac(wall),
    hourlyZodiac: getHourlyZodiac(wall),
    rokuyo,
    rokuyoKanji: guidance.kanji,
    rokuyoWindow: guidance.window,
    rokuyoLabel: guidance.label,
    rokuyoMeaning: guidance.meaning,
    favoredNow: isRokuyoFavoredHour(rokuyo, wall.getHours()),
    auspicious: rokuyo === 'Taian',
    lunarMonth: lunar.month,
    lunarDay: lunar.day,
    lunarLeapMonth: lunar.isLeapMonth,
    moonPhase: moon.phase,
    moonIllumination: moon.illumination,
    dateKey: `${wall.getFullYear()}-${pad(wall.getMonth() + 1)}-${pad(wall.getDate())}`,
  }
}

/**
 * Personal rokuyo resonance from the user's own Logs: which rokuyo days they
 * write most on. Uses each log's Kyureki-era snapshot when present, else
 * derives it from createdAt + the log's timeZone. Returns null below a minimum sample size.
 */
export function getRokuyoResonance(
  logs: Array<{
    createdAt: string | Date
    context?: { astroRokuyo?: string | null; astroLunarMonth?: number | null; timeZone?: string | null } | null
  }>,
  minSample = 12
): { peak: string; peakCount: number; total: number; counts: Record<string, number> } | null {
  const counts: Record<string, number> = {}
  let total = 0
  for (const log of logs) {
    // Only trust snapshots taken by the Kyureki algorithm (they carry
    // astroLunarMonth); pre-2026-11-20 snapshots used a naive 6-day cycle.
    let r = log.context?.astroLunarMonth ? log.context?.astroRokuyo || null : null
    if (!r) {
      const created = new Date(log.createdAt)
      if (isNaN(created.getTime())) continue
      r = getRokuyo(toZonedWallClock(created, log.context?.timeZone))
    }
    counts[r] = (counts[r] || 0) + 1
    total++
  }
  if (total < minSample) return null
  let peak = ''
  let peakCount = 0
  for (const [r, c] of Object.entries(counts)) {
    if (c > peakCount) {
      peak = r
      peakCount = c
    }
  }
  // Require a real lean: peak must exceed the uniform share (1/6) by 25%
  if (peakCount < (total / 6) * 1.25) return null
  return { peak, peakCount, total, counts }
}
