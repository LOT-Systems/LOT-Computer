/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * STORY DIGEST — the compression stage of the LOT AI loop.
 *
 *   LOT User data -> [digest: deterministic compression] -> QIE -> Together AI
 *
 * Pure and deterministic: same rows in, same digest out. The LLM only
 * narrates what the digest already established, so the story cannot invent
 * numbers. Each Log row carries `context` (weather, city, moon, time zone)
 * captured at write time; the digest folds that metadata into the summary.
 */

import { STORY_PERIOD_DAYS, type StoryPeriod } from './logCommands.js'

export interface DigestLogRow {
  event: string
  text?: string | null
  createdAt: Date | string
  metadata?: Record<string, any> | null
  context?: Record<string, any> | null
}

export interface ArcadeRank {
  level: number
  title: string
  /** Entries still needed for the next level, or null at max. */
  toNext: number | null
}

export interface StoryDigest {
  period: StoryPeriod
  windowDays: number
  entryCount: number
  activeDays: number
  streakDays: number
  dayPart: Record<'night' | 'morning' | 'afternoon' | 'evening', number>
  moods: string[]
  topMood: string | null
  cities: string[]
  weather: { avgTempC: number | null; dominant: string | null }
  moon: string | null
  /** ISO dates whose entry count is >= 2x the window's daily mean (min 3). */
  spikeDays: string[]
  /** True when the second half of the window is much quieter/busier than the first. */
  paceShift: 'quieter' | 'busier' | null
  excerpts: string[]
  rank: ArcadeRank
}

/** Log events that count as user-authored journal material. */
export const JOURNAL_EVENTS = ['log_entry', 'journal']

const DAY_MS = 86_400_000

// Arcade evolution: entries -> level. Self-care framing, not a leaderboard.
const RANKS: Array<{ min: number; title: string }> = [
  { min: 0,    title: 'BOOT' },
  { min: 5,    title: 'SIGNAL' },
  { min: 20,   title: 'OPERATOR' },
  { min: 60,   title: 'NAVIGATOR' },
  { min: 150,  title: 'ARCHITECT' },
  { min: 400,  title: 'CARTOGRAPHER' },
  { min: 1000, title: 'LEGACY' },
]

export function computeArcadeRank(totalEntries: number): ArcadeRank {
  let idx = 0
  RANKS.forEach((r, i) => { if (totalEntries >= r.min) idx = i })
  const next = RANKS[idx + 1]
  return {
    level: idx + 1,
    title: RANKS[idx].title,
    toNext: next ? next.min - totalEntries : null,
  }
}

function dayKey(d: Date, tz?: string | null): string {
  try {
    if (tz) return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(d)
  } catch { /* invalid tz -> UTC */ }
  return d.toISOString().slice(0, 10)
}

function hourOf(d: Date, tz?: string | null): number {
  try {
    if (tz) {
      const h = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', hourCycle: 'h23' }).format(d)
      return parseInt(h, 10)
    }
  } catch { /* invalid tz -> UTC */ }
  return d.getUTCHours()
}

function top<T extends string>(items: T[]): T | null {
  const c = new Map<T, number>()
  items.forEach(i => c.set(i, (c.get(i) || 0) + 1))
  let best: T | null = null
  let n = 0
  c.forEach((v, k) => { if (v > n) { best = k; n = v } })
  return best
}

/**
 * Compress `rows` (any order, any events) into a digest for `period`.
 * `now` is injectable for deterministic tests. `totalEntries` is the user's
 * lifetime journal count for the arcade rank (defaults to in-window count).
 */
export function buildStoryDigest(
  rows: DigestLogRow[],
  period: StoryPeriod,
  now: Date = new Date(),
  totalEntries?: number
): StoryDigest {
  const windowDays = STORY_PERIOD_DAYS[period]
  const since = now.getTime() - windowDays * DAY_MS

  const inWindow = rows
    .map(r => ({ ...r, at: new Date(r.createdAt) }))
    .filter(r => !isNaN(r.at.getTime()) && r.at.getTime() >= since && r.at.getTime() <= now.getTime())
    .sort((a, b) => a.at.getTime() - b.at.getTime())

  const entries = inWindow.filter(r => JOURNAL_EVENTS.includes(r.event) && (r.text || '').trim())
  const tz = (entries.find(e => e.context?.timeZone)?.context?.timeZone as string) || null

  const dayPart = { night: 0, morning: 0, afternoon: 0, evening: 0 }
  const perDay = new Map<string, number>()
  entries.forEach(e => {
    const h = hourOf(e.at, e.context?.timeZone || tz)
    if (h < 6) dayPart.night++
    else if (h < 12) dayPart.morning++
    else if (h < 18) dayPart.afternoon++
    else dayPart.evening++
    const k = dayKey(e.at, e.context?.timeZone || tz)
    perDay.set(k, (perDay.get(k) || 0) + 1)
  })

  // Streak: consecutive days with an entry, ending today or yesterday.
  let streak = 0
  const todayKey = dayKey(now, tz)
  const cursor = new Date(now)
  if (!perDay.has(todayKey)) cursor.setTime(cursor.getTime() - DAY_MS)
  while (perDay.has(dayKey(cursor, tz))) {
    streak++
    cursor.setTime(cursor.getTime() - DAY_MS)
  }

  const meanPerDay = entries.length / windowDays
  const spikeDays = Array.from(perDay.entries())
    .filter(([, n]) => n >= 3 && n >= 2 * meanPerDay)
    .map(([k]) => k)
    .sort()

  const mid = since + (now.getTime() - since) / 2
  const first = entries.filter(e => e.at.getTime() < mid).length
  const second = entries.length - first
  let paceShift: StoryDigest['paceShift'] = null
  if (entries.length >= 6) {
    if (second >= first * 2) paceShift = 'busier'
    else if (first >= second * 2) paceShift = 'quieter'
  }

  const moods = inWindow
    .filter(r => r.event === 'emotional_checkin')
    .map(r => String(r.metadata?.emotionalState || '').toUpperCase())
    .filter(Boolean)

  const ctxRows = entries.map(e => e.context || {})
  // Log context stores temperature in Kelvin (see toCelsius in shared/utils).
  const temps = ctxRows
    .map(c => Number(c.temperature) - 273.15)
    .filter(t => Number.isFinite(t) && t > -90 && t < 60)
  const cities = Array.from(new Set(ctxRows.map(c => c.city).filter(Boolean) as string[])).slice(0, 4)
  const weatherWords = ctxRows.map(c => String(c.weatherDescription || '').toLowerCase()).filter(Boolean)
  const moon = top(ctxRows.map(c => c.astroMoonPhase).filter(Boolean) as string[])

  // Excerpts: newest first, capped, so the prompt stays small on a yearly run.
  const excerptCap = period === 'year' ? 12 : period === 'month' ? 10 : 6
  const excerpts = entries
    .slice(-excerptCap)
    .map(e => `${e.at.toISOString().slice(0, 10)}: ${(e.text || '').replace(/\s+/g, ' ').slice(0, 160)}`)

  return {
    period,
    windowDays,
    entryCount: entries.length,
    activeDays: perDay.size,
    streakDays: streak,
    dayPart,
    moods,
    topMood: top(moods),
    cities,
    weather: {
      avgTempC: temps.length ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length) : null,
      dominant: top(weatherWords),
    },
    moon,
    spikeDays,
    paceShift,
    excerpts,
    rank: computeArcadeRank(totalEntries ?? entries.length),
  }
}

/** Renders the digest as the fact block handed to the language model. */
export function renderDigestBlock(d: StoryDigest): string {
  const dp = d.dayPart
  const lines = [
    `WINDOW: ${d.period.toUpperCase()} (${d.windowDays}d)`,
    `ENTRIES: ${d.entryCount} across ${d.activeDays} active day(s); current streak ${d.streakDays}d`,
    `WHEN YOU WRITE: night ${dp.night}, morning ${dp.morning}, afternoon ${dp.afternoon}, evening ${dp.evening}`,
    `MOODS: ${d.moods.length ? `${d.moods.slice(-6).join(', ')} (most frequent: ${d.topMood})` : 'NO DATA'}`,
    `PLACES: ${d.cities.join(', ') || 'unknown'}`,
    `AIR: ${d.weather.dominant || 'unknown'}${d.weather.avgTempC !== null ? `, ~${d.weather.avgTempC}°C recorded` : ''}${d.moon ? `; moon ${d.moon}` : ''}`,
    `SPIKES: ${d.spikeDays.length ? d.spikeDays.join(', ') : 'none'}`,
    `PACE: ${d.paceShift ? `second half of window ${d.paceShift}` : 'steady'}`,
    `ARCADE: level ${d.rank.level} ${d.rank.title}${d.rank.toNext !== null ? `, ${d.rank.toNext} entries to next level` : ', max level'}`,
    'ENTRIES (oldest to newest):',
    ...(d.excerpts.length ? d.excerpts.map(e => `- ${e}`) : ['- (none)']),
  ]
  return lines.join('\n')
}

/**
 * Deterministic fallback used when the AI vendor is unavailable, so /story
 * always returns something true instead of an apology.
 */
export function composeDigestStory(d: StoryDigest): string {
  if (d.entryCount === 0) {
    return 'The log is quiet for this window. The machine is listening — one line, whenever you are ready, starts the story.'
  }
  const parts: string[] = []
  parts.push(`${d.entryCount} ${d.entryCount === 1 ? 'entry' : 'entries'} across ${d.activeDays} ${d.activeDays === 1 ? 'day' : 'days'}.`)
  if (d.streakDays > 1) parts.push(`A ${d.streakDays}-day streak is holding.`)
  const dp = d.dayPart
  const busiest = (Object.keys(dp) as Array<keyof typeof dp>).sort((a, b) => dp[b] - dp[a])[0]
  if (dp[busiest] > 0) parts.push(`You mostly write in the ${busiest}.`)
  if (d.topMood) parts.push(`The mood that returned most: ${d.topMood.toLowerCase()}.`)
  if (d.paceShift) parts.push(`The second half of the window ran ${d.paceShift}.`)
  parts.push(`Level ${d.rank.level} · ${d.rank.title}.`)
  return parts.join(' ')
}
