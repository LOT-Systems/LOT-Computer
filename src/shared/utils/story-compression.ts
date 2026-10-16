/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Story compression — pure functions (no DB, no network, no DOM).
 *
 * Turns a window of Log rows (text + context metadata) into a compact
 * digest that the Story module hands to the AI vendor. The digest is the
 * "compression" step of: LOT User data → QIE → vendor → personalized data.
 *
 * Also hosts the Arcade rank model: self-care activity earns XP, XP maps
 * to a rank. Ranks are derived, never stored — recomputed from logs.
 */

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'

export const STORY_PERIODS: StoryPeriod[] = ['day', 'week', 'month', 'year']

const PERIOD_DAYS: Record<StoryPeriod, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

export function periodWindowMs(period: StoryPeriod): number {
  return PERIOD_DAYS[period] * 24 * 60 * 60 * 1000
}

/**
 * Reads the period from a "/story [period]" log line. Default: day.
 * Accepts day|today, week|weekly, month|monthly, year|yearly.
 */
export function parseStoryPeriod(text: string): StoryPeriod {
  const m = /(^|\s)\/story\s+(day|today|week|weekly|month|monthly|year|yearly)\b/i.exec(text || '')
  if (!m) return 'day'
  const w = m[2].toLowerCase()
  if (w.startsWith('week')) return 'week'
  if (w.startsWith('month')) return 'month'
  if (w.startsWith('year')) return 'year'
  return 'day'
}

/** Strips "/story [period]" and the 📖 emoji so only the user's words remain. */
export function stripStoryCommand(text: string): string {
  return (text || '')
    .replace(/(^|\s)\/story(\s+(day|today|week|weekly|month|monthly|year|yearly)\b)?/gi, ' ')
    .replace(/📖/g, '')
    .trim()
}

// ---------------------------------------------------------------------------
// Digest
// ---------------------------------------------------------------------------

export interface StoryLogRow {
  event: string
  text?: string | null
  createdAt: Date | string
  context?: {
    temperature?: number
    humidity?: number
    city?: string
    weather?: string
    moonPhase?: string
    [k: string]: unknown
  } | null
  metadata?: Record<string, unknown> | null
}

export interface StoryDigest {
  period: StoryPeriod
  entryCount: number
  activeDays: number
  windowDays: number
  /** Share of window days with at least one entry, 0..1 */
  consistency: number
  /** Longest run of consecutive active days inside the window */
  longestStreak: number
  cities: string[]
  avgTemperatureC: number | null
  moods: string[]
  /** Moods that changed relative to the first half of the window */
  moodShift: string | null
  /** Pattern-change flag: entry volume in 2nd half vs 1st half */
  volumeTrend: 'rising' | 'falling' | 'steady' | 'insufficient'
  /** Day with the most entries, ISO date */
  peakDay: string | null
  /** Highlights: newest-first trimmed entry excerpts with context tag */
  highlights: string[]
}

const JOURNAL_EVENTS = new Set(['log_entry', 'journal'])
const MOOD_EVENT = 'emotional_checkin'

const dayKey = (d: Date) => d.toISOString().slice(0, 10)

const toCelsius = (t: number) => (t > 60 ? (t - 32) * (5 / 9) : t) // stored values may be °F

export function buildStoryDigest(
  rows: StoryLogRow[],
  period: StoryPeriod,
  now: Date = new Date()
): StoryDigest {
  const windowMs = periodWindowMs(period)
  const start = new Date(now.getTime() - windowMs)
  const mid = new Date(now.getTime() - windowMs / 2)
  const windowDays = PERIOD_DAYS[period]

  const inWindow = rows
    .map(r => ({ ...r, at: new Date(r.createdAt) }))
    .filter(r => !isNaN(r.at.getTime()) && r.at >= start && r.at <= now)
    .sort((a, b) => b.at.getTime() - a.at.getTime())

  const journal = inWindow.filter(r => JOURNAL_EVENTS.has(r.event) && (r.text || '').trim())
  const moodRows = inWindow.filter(r => r.event === MOOD_EVENT)

  // Days / streaks
  const perDay = new Map<string, number>()
  journal.forEach(r => perDay.set(dayKey(r.at), (perDay.get(dayKey(r.at)) || 0) + 1))
  const activeDays = perDay.size
  let longestStreak = 0
  let run = 0
  for (let i = 0; i < windowDays; i++) {
    const k = dayKey(new Date(start.getTime() + (i + 1) * 86400000))
    if (perDay.has(k)) { run++; longestStreak = Math.max(longestStreak, run) } else run = 0
  }
  let peakDay: string | null = null
  let peak = 0
  perDay.forEach((n, k) => { if (n > peak) { peak = n; peakDay = k } })

  // Context metadata
  const cities = Array.from(new Set(journal.map(r => r.context?.city).filter((c): c is string => !!c)))
  const temps = journal
    .map(r => r.context?.temperature)
    .filter((t): t is number => typeof t === 'number')
    .map(toCelsius)
  const avgTemperatureC = temps.length
    ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length)
    : null

  // Moods + shift
  const moodOf = (r: typeof moodRows[number]) => String(r.metadata?.emotionalState || '').toLowerCase()
  const moods = moodRows.map(moodOf).filter(Boolean)
  const recentMoods = moodRows.filter(r => r.at >= mid).map(moodOf).filter(Boolean)
  const earlyMoods = moodRows.filter(r => r.at < mid).map(moodOf).filter(Boolean)
  const mode = (a: string[]) => {
    const c: Record<string, number> = {}
    a.forEach(x => { c[x] = (c[x] || 0) + 1 })
    return Object.entries(c).sort((x, y) => y[1] - x[1])[0]?.[0]
  }
  const mRecent = mode(recentMoods)
  const mEarly = mode(earlyMoods)
  const moodShift = mRecent && mEarly && mRecent !== mEarly ? `${mEarly} → ${mRecent}` : null

  // Volume trend (spike / pattern-change detector)
  const early = journal.filter(r => r.at < mid).length
  const late = journal.length - early
  let volumeTrend: StoryDigest['volumeTrend'] = 'insufficient'
  if (journal.length >= 4) {
    if (late >= early * 1.5 + 1) volumeTrend = 'rising'
    else if (early >= late * 1.5 + 1) volumeTrend = 'falling'
    else volumeTrend = 'steady'
  }

  const highlights = journal.slice(0, 8).map(r => {
    const tag = [dayKey(r.at), r.context?.city, r.context?.weather].filter(Boolean).join(' · ')
    return `[${tag}] ${(r.text || '').trim().replace(/\s+/g, ' ').substring(0, 160)}`
  })

  return {
    period,
    entryCount: journal.length,
    activeDays,
    windowDays,
    consistency: Math.round((activeDays / windowDays) * 100) / 100,
    longestStreak,
    cities,
    avgTemperatureC,
    moods: moods.slice(0, 8),
    moodShift,
    volumeTrend,
    peakDay,
    highlights,
  }
}

/** Renders the digest as the plain-text data block fed to the AI vendor. */
export function renderDigest(d: StoryDigest): string {
  return [
    `WINDOW: last ${d.windowDays} day(s) (${d.period.toUpperCase()})`,
    `ENTRIES: ${d.entryCount} across ${d.activeDays} active day(s); consistency ${Math.round(d.consistency * 100)}%; longest streak ${d.longestStreak}`,
    `PLACES: ${d.cities.join(', ') || 'unknown'}${d.avgTemperatureC !== null ? `; avg ${d.avgTemperatureC}°C` : ''}`,
    `MOODS: ${d.moods.join(', ') || 'NO DATA'}${d.moodShift ? ` (shift: ${d.moodShift})` : ''}`,
    `PATTERN: volume ${d.volumeTrend}${d.peakDay ? `; busiest day ${d.peakDay}` : ''}`,
    `HIGHLIGHTS (newest first):`,
    ...(d.highlights.length ? d.highlights.map(h => `- ${h}`) : ['- (none)']),
  ].join('\n')
}

// ---------------------------------------------------------------------------
// Arcade rank (self-care gamification, derived from logs)
// ---------------------------------------------------------------------------

export interface ArcadeRank {
  xp: number
  level: number
  rank: string
  nextRank: string | null
  xpToNext: number
}

export const ARCADE_RANKS: Array<{ min: number; name: string }> = [
  { min: 0, name: 'INSERT COIN' },
  { min: 50, name: 'PLAYER ONE' },
  { min: 150, name: 'COMBO KEEPER' },
  { min: 400, name: 'HIGH SCORER' },
  { min: 900, name: 'BOSS SLAYER' },
  { min: 2000, name: 'ARCADE LEGEND' },
]

const XP_BY_EVENT: Record<string, number> = {
  log_entry: 5,
  journal: 5,
  emotional_checkin: 3,
  memory_answer: 4,
  self_care_checkin: 4,
  energy_checkin: 3,
  generated_story: 2,
}

export function computeArcadeRank(rows: Array<Pick<StoryLogRow, 'event'>>): ArcadeRank {
  const xp = rows.reduce((sum, r) => sum + (XP_BY_EVENT[r.event] || 0), 0)
  let idx = 0
  ARCADE_RANKS.forEach((r, i) => { if (xp >= r.min) idx = i })
  const next = ARCADE_RANKS[idx + 1] || null
  return {
    xp,
    level: idx + 1,
    rank: ARCADE_RANKS[idx].name,
    nextRank: next ? next.name : null,
    xpToNext: next ? next.min - xp : 0,
  }
}
