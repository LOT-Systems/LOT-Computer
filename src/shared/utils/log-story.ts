/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log story compression — pure functions.
 *
 *   raw log entries (+ context meta-data)
 *     → compressLogs()        deterministic digest (counts, peaks, spike)
 *     → digestToPrompt()      compact text block handed to the AI vendor
 *     → composeLocalStory()   offline fallback, no AI needed
 *
 * Honesty rule: every number here is a plain count or ratio over the
 * supplied logs. Nothing is inferred beyond what the data contains.
 */

import type { StoryPeriod } from './log-commands.js'

export interface StoryLogInput {
  event: string
  text?: string | null
  createdAt: Date | string
  context?: Record<string, any> | null
  metadata?: Record<string, any> | null
}

export const PERIOD_DAYS: Record<StoryPeriod, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Events that represent something the person wrote themselves. */
export const JOURNAL_EVENTS = ['note']
/** Events that carry a mood / state signal. */
export const MOOD_EVENTS = ['emotional_checkin']
/** Events that carry self-care answers or completions. */
export const SELF_CARE_EVENTS = [
  'memory_answer', 'self_care_checkin', 'energy_checkin',
  'self_care_complete', 'self_care_completed',
]

export type SpikeDirection = 'up' | 'down' | 'steady' | 'insufficient-data'

export interface StoryDigest {
  period: StoryPeriod
  windowDays: number
  windowStart: number
  entries: number
  words: number
  activeDays: number
  /** moods ordered by frequency, upper-cased */
  moods: Array<{ mood: string; count: number }>
  selfCareCount: number
  /** local hour-bucket with the most entries, e.g. "evening" */
  busiestPartOfDay: string | null
  cities: string[]
  weather: string[]
  moonPhases: string[]
  /** entry-rate change vs. the immediately preceding window of equal length */
  spike: { direction: SpikeDirection; current: number; previous: number }
  /** newest journal excerpts, newest first, truncated */
  excerpts: string[]
  /** self-care Q/A pairs, newest first */
  selfCare: string[]
}

function ts(d: Date | string): number {
  return d instanceof Date ? d.getTime() : new Date(d).getTime()
}

function partOfDay(hour: number): string {
  if (hour < 5) return 'night'
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  if (hour < 21) return 'evening'
  return 'night'
}

function hourIn(timeMs: number, timeZone?: string | null): number {
  try {
    if (timeZone) {
      const h = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric', hour12: false, timeZone,
      }).format(new Date(timeMs))
      return parseInt(h, 10) % 24
    }
  } catch {
    /* invalid tz → fall through to UTC */
  }
  return new Date(timeMs).getUTCHours()
}

function topN(counts: Map<string, number>, n: number): string[] {
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([k]) => k)
}

function bump(map: Map<string, number>, key?: string | null) {
  if (!key) return
  map.set(key, (map.get(key) || 0) + 1)
}

export function compressLogs(
  logs: StoryLogInput[],
  period: StoryPeriod,
  now: number = Date.now()
): StoryDigest {
  const windowDays = PERIOD_DAYS[period]
  const windowStart = now - windowDays * DAY_MS
  const prevStart = windowStart - windowDays * DAY_MS

  const inWindow = logs.filter(l => {
    const t = ts(l.createdAt)
    return t >= windowStart && t <= now
  })
  const inPrev = logs.filter(l => {
    const t = ts(l.createdAt)
    return t >= prevStart && t < windowStart
  })

  const journal = inWindow
    .filter(l => JOURNAL_EVENTS.includes(l.event) && (l.text || '').trim())
    .sort((a, b) => ts(b.createdAt) - ts(a.createdAt))

  const prevJournalCount = inPrev.filter(
    l => JOURNAL_EVENTS.includes(l.event) && (l.text || '').trim()
  ).length

  const days = new Set<string>()
  const moods = new Map<string, number>()
  const parts = new Map<string, number>()
  const cities = new Map<string, number>()
  const weather = new Map<string, number>()
  const moon = new Map<string, number>()
  let words = 0

  for (const l of inWindow) {
    const t = ts(l.createdAt)
    const tz = l.context?.timeZone as string | undefined
    days.add(new Date(t).toISOString().slice(0, 10))
    bump(cities, l.context?.city)
    bump(weather, l.context?.weatherDescription)
    bump(moon, l.context?.astroMoonPhase)
    if (MOOD_EVENTS.includes(l.event)) {
      const m = String(l.metadata?.emotionalState || '').toUpperCase()
      bump(moods, m)
    }
  }
  for (const l of journal) {
    words += (l.text || '').trim().split(/\s+/).length
    bump(parts, partOfDay(hourIn(ts(l.createdAt), l.context?.timeZone)))
  }

  const selfCare = inWindow
    .filter(l => SELF_CARE_EVENTS.includes(l.event))
    .sort((a, b) => ts(b.createdAt) - ts(a.createdAt))
  const selfCarePairs = selfCare
    .map(l => {
      const q = String(l.metadata?.question || '')
      const a = String(l.metadata?.option || l.metadata?.answer || '')
      return q && a ? `${q}: ${a}` : ''
    })
    .filter(Boolean)

  // Spike = journal-entry rate vs. the preceding equal window.
  // Needs at least 3 entries across both windows to say anything.
  const cur = journal.length
  let direction: SpikeDirection = 'steady'
  if (cur + prevJournalCount < 3) direction = 'insufficient-data'
  else if (cur >= prevJournalCount * 1.5 && cur - prevJournalCount >= 2) direction = 'up'
  else if (cur <= prevJournalCount * 0.5 && prevJournalCount - cur >= 2) direction = 'down'

  return {
    period,
    windowDays,
    windowStart,
    entries: journal.length,
    words,
    activeDays: days.size,
    moods: Array.from(moods.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([mood, count]) => ({ mood, count })),
    selfCareCount: selfCare.length,
    busiestPartOfDay: parts.size ? topN(parts, 1)[0] : null,
    cities: topN(cities, 3),
    weather: topN(weather, 3),
    moonPhases: topN(moon, 2),
    spike: { direction, current: cur, previous: prevJournalCount },
    excerpts: journal.slice(0, 5).map(l => (l.text || '').trim().replace(/\s+/g, ' ').slice(0, 200)),
    selfCare: selfCarePairs.slice(0, 5),
  }
}

/** Compact, vendor-neutral data block for the AI prompt. */
export function digestToPrompt(d: StoryDigest): string {
  const lines: string[] = []
  lines.push(`WINDOW: last ${d.windowDays} day(s) (${d.period})`)
  lines.push(
    `ACTIVITY: ${d.entries} journal entries, ${d.words} words, active on ${d.activeDays} day(s), ${d.selfCareCount} self-care records`
  )
  if (d.busiestPartOfDay) lines.push(`WRITES MOST IN THE: ${d.busiestPartOfDay}`)
  lines.push(
    `PATTERN: ${d.spike.direction} (${d.spike.current} entries now vs ${d.spike.previous} in the previous ${d.windowDays} day(s))`
  )
  lines.push(`MOODS: ${d.moods.slice(0, 5).map(m => `${m.mood}×${m.count}`).join(', ') || 'NO DATA'}`)
  const env = [...d.cities, ...d.weather, ...d.moonPhases].filter(Boolean)
  if (env.length) lines.push(`CONTEXT: ${env.join(' · ')}`)
  lines.push('RECENT ENTRIES (newest first):')
  lines.push(...(d.excerpts.length ? d.excerpts.map(e => `- ${e}`) : ['- (none)']))
  lines.push('SELF-CARE:')
  lines.push(...(d.selfCare.length ? d.selfCare.map(e => `- ${e}`) : ['- (none)']))
  return lines.join('\n')
}

const PERIOD_NOUN: Record<StoryPeriod, string> = {
  day: 'day', week: 'week', month: 'month', year: 'year',
}

/**
 * Deterministic offline story. Used when the AI vendor is unreachable or
 * returns nothing, so `/story` always answers. Second person, plain, short.
 */
export function composeLocalStory(d: StoryDigest): string {
  const noun = PERIOD_NOUN[d.period]
  if (d.entries === 0 && d.selfCareCount === 0 && d.moods.length === 0) {
    return `Nothing was written this ${noun}. That is also a signal — the system is here when you want to start.`
  }
  const parts: string[] = []
  parts.push(
    `This ${noun} you wrote ${d.entries} ${d.entries === 1 ? 'entry' : 'entries'} across ${d.activeDays} ${d.activeDays === 1 ? 'day' : 'days'}` +
      (d.busiestPartOfDay ? `, mostly in the ${d.busiestPartOfDay}.` : '.')
  )
  if (d.moods.length) {
    const top = d.moods[0]
    parts.push(`${top.mood.toLowerCase()} came up most (${top.count}×).`)
  }
  if (d.spike.direction === 'up') parts.push(`You are writing more than the ${noun} before — something is asking for words.`)
  else if (d.spike.direction === 'down') parts.push(`It has been quieter than the ${noun} before. Quiet is allowed.`)
  if (d.selfCareCount > 0) parts.push(`${d.selfCareCount} self-care ${d.selfCareCount === 1 ? 'moment' : 'moments'} were recorded.`)
  if (d.cities[0]) parts.push(`Most of it happened in ${d.cities[0]}.`)
  parts.push('The next entry will add to this.')
  return parts.join(' ')
}
