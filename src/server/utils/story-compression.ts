/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Story compression — deterministic digest of a period of log data.
 *
 * Pipeline position:
 *   LOT User data → [digest: this module] → Quantum Intent Engine prompt →
 *   AI vendor (Together AI) → LOT personalized data stored.
 *
 * The digest is the compression step: hundreds of rows become a few dozen
 * facts. The AI only *narrates* those facts; every number in the story is
 * computed here, never invented by the model. `composeFallbackStory` renders
 * the same digest without AI so /story never returns nothing.
 *
 * Pure: no DB, no network, no clock (callers pass `now`).
 */

import type { StoryPeriod } from '../../shared/utils/logCommands.js'

export interface DigestLog {
  event: string
  text?: string | null
  createdAt: Date | string
  context?: {
    temperature?: number | null
    city?: string | null
    weatherDescription?: string | null
    astroMoonPhase?: string | null
  } | null
  metadata?: Record<string, any> | null
}

export interface StoryDigest {
  period: StoryPeriod
  /** ISO start of window (inclusive). */
  from: string
  /** ISO end of window (= now). */
  to: string
  totalSignals: number
  entries: number
  checkins: number
  activeDays: number
  windowDays: number
  /** Consecutive active days ending today or yesterday (over all supplied logs). */
  streak: number
  moods: Array<{ mood: string; count: number }>
  cities: string[]
  avgTempC: number | null
  moonPhases: string[]
  /** Busiest day (most signals) — the period's high peak. */
  peakDay: { date: string; signals: number } | null
  /** Longest silent gap inside the window, in days (0 if none). */
  longestGapDays: number
  /** Activity trend: second half of window vs first half. */
  trend: 'rising' | 'falling' | 'steady' | 'insufficient'
  /** Short excerpts of the most recent entries in the window (newest first). */
  excerpts: string[]
}

const DAY_MS = 86_400_000
const WINDOW_DAYS: Record<StoryPeriod, number> = { day: 1, week: 7, month: 30, year: 365 }

/** Events that are story inputs but not authored by the operator. */
const GENERATED_EVENTS = new Set(['generated_story', 'prayer_scripture'])
/** 'note' is what the Log tab actually writes; the others are legacy names. */
export const ENTRY_EVENTS = new Set(['note', 'log_entry', 'journal'])
export const CHECKIN_EVENTS = new Set([
  'emotional_checkin', 'energy_checkin', 'self_care_checkin', 'memory_answer',
  'answer', 'self_care_complete',
])

/** Events that count as operator-authored signal (DB allow-list for callers). */
export const STORY_SIGNAL_EVENTS = [...ENTRY_EVENTS, ...CHECKIN_EVENTS]

const dayKey = (d: Date) => d.toISOString().slice(0, 10)
const toDate = (v: Date | string) => (v instanceof Date ? v : new Date(v))

export function windowDaysFor(period: StoryPeriod): number {
  return WINDOW_DAYS[period]
}

/** Consecutive UTC days with activity, ending today or yesterday. */
export function computeStreak(dayKeys: Set<string>, now: Date): number {
  let cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  if (!dayKeys.has(dayKey(cursor))) cursor = new Date(cursor.getTime() - DAY_MS)
  let streak = 0
  while (dayKeys.has(dayKey(cursor))) {
    streak++
    cursor = new Date(cursor.getTime() - DAY_MS)
  }
  return streak
}

export function buildStoryDigest(
  logs: DigestLog[],
  period: StoryPeriod,
  now: Date = new Date()
): StoryDigest {
  const windowDays = WINDOW_DAYS[period]
  const fromMs = now.getTime() - windowDays * DAY_MS
  // Empty notes (autosaved placeholders) carry no signal.
  const operatorLogs = logs.filter(
    l => !GENERATED_EVENTS.has(l.event) && !(ENTRY_EVENTS.has(l.event) && !String(l.text || '').trim())
  )

  const allDays = new Set(operatorLogs.map(l => dayKey(toDate(l.createdAt))))
  const inWindow = operatorLogs
    .filter(l => {
      const t = toDate(l.createdAt).getTime()
      return t >= fromMs && t <= now.getTime()
    })
    .sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime())

  const perDay = new Map<string, number>()
  const moodCount = new Map<string, number>()
  const cityCount = new Map<string, number>()
  const moons = new Set<string>()
  const temps: number[] = []
  let entries = 0
  let checkins = 0

  for (const l of inWindow) {
    const k = dayKey(toDate(l.createdAt))
    perDay.set(k, (perDay.get(k) || 0) + 1)
    if (ENTRY_EVENTS.has(l.event)) entries++
    if (CHECKIN_EVENTS.has(l.event)) checkins++
    if (l.event === 'emotional_checkin') {
      const m = String(l.metadata?.emotionalState || '').trim().toLowerCase()
      if (m) moodCount.set(m, (moodCount.get(m) || 0) + 1)
    }
    const c = l.context
    if (c?.city) cityCount.set(c.city, (cityCount.get(c.city) || 0) + 1)
    if (c?.astroMoonPhase) moons.add(c.astroMoonPhase)
    if (typeof c?.temperature === 'number') temps.push(c.temperature)
  }

  // Peak day: most signals; ties resolve to the most recent day.
  let peakDay: StoryDigest['peakDay'] = null
  for (const [date, signals] of Array.from(perDay.entries()).sort((a, b) => b[0].localeCompare(a[0]))) {
    if (!peakDay || signals > peakDay.signals) peakDay = { date, signals }
  }

  // Longest silent gap between consecutive active days inside the window.
  const sortedDays = Array.from(perDay.keys()).sort()
  let longestGapDays = 0
  for (let i = 1; i < sortedDays.length; i++) {
    const gap =
      Math.round((Date.parse(sortedDays[i]) - Date.parse(sortedDays[i - 1])) / DAY_MS) - 1
    if (gap > longestGapDays) longestGapDays = gap
  }

  // Trend needs at least 2 days of window and 4 signals to mean anything.
  let trend: StoryDigest['trend'] = 'insufficient'
  if (windowDays >= 2 && inWindow.length >= 4) {
    const mid = now.getTime() - (windowDays * DAY_MS) / 2
    const late = inWindow.filter(l => toDate(l.createdAt).getTime() >= mid).length
    const early = inWindow.length - late
    trend = late > early * 1.25 ? 'rising' : early > late * 1.25 ? 'falling' : 'steady'
  }

  const top = (m: Map<string, number>, n: number) =>
    Array.from(m.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, n)

  return {
    period,
    from: new Date(fromMs).toISOString(),
    to: now.toISOString(),
    totalSignals: inWindow.length,
    entries,
    checkins,
    activeDays: perDay.size,
    windowDays,
    streak: computeStreak(allDays, now),
    moods: top(moodCount, 4).map(([mood, count]) => ({ mood, count })),
    cities: top(cityCount, 3).map(([c]) => c),
    avgTempC: temps.length
      ? Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10
      : null,
    moonPhases: Array.from(moons).slice(0, 3),
    peakDay,
    longestGapDays,
    trend,
    excerpts: inWindow
      .filter(l => ENTRY_EVENTS.has(l.event) && l.text)
      .slice(0, 5)
      .map(l => String(l.text).replace(/\s+/g, ' ').trim().slice(0, 160)),
  }
}

/** Fact block handed to the AI. Everything the model may cite is here. */
export function digestToPromptBlock(d: StoryDigest): string {
  const lines = [
    `PERIOD: ${d.period.toUpperCase()} (${d.from.slice(0, 10)} → ${d.to.slice(0, 10)})`,
    `SIGNALS: ${d.totalSignals} (${d.entries} entries, ${d.checkins} check-ins) over ${d.activeDays} of ${d.windowDays} days`,
    `STREAK: ${d.streak} days`,
    `ACTIVITY TREND: ${d.trend}`,
  ]
  if (d.peakDay) lines.push(`HIGH PEAK: ${d.peakDay.date} (${d.peakDay.signals} signals)`)
  if (d.longestGapDays > 0) lines.push(`LONGEST SILENCE: ${d.longestGapDays} days`)
  if (d.moods.length) lines.push(`MOODS: ${d.moods.map(m => `${m.mood} ×${m.count}`).join(', ')}`)
  if (d.cities.length) lines.push(`PLACES: ${d.cities.join(', ')}`)
  if (d.avgTempC !== null) lines.push(`AVG TEMP: ${d.avgTempC}°C`)
  if (d.moonPhases.length) lines.push(`MOON: ${d.moonPhases.join(', ')}`)
  lines.push('RECENT ENTRIES:')
  lines.push(...(d.excerpts.length ? d.excerpts.map(e => `- ${e}`) : ['- (none)']))
  return lines.join('\n')
}

/** Word limits per period: longer periods compress more, not expand. */
export function wordBudget(period: StoryPeriod): number {
  return period === 'day' ? 90 : period === 'week' ? 130 : period === 'month' ? 160 : 200
}

/** AI-free rendering of the digest. Facts only; no invented interpretation. */
export function composeFallbackStory(d: StoryDigest): string {
  if (d.totalSignals === 0) {
    const span = d.period === 'day' ? 'today' : `this ${d.period}`
    return `No signals recorded ${span}. The system is listening — your next entry starts the story.`
  }
  const span = d.period === 'day' ? 'Today' : `This ${d.period}`
  const parts = [
    `${span} you left ${d.totalSignals} signal${d.totalSignals === 1 ? '' : 's'} across ${d.activeDays} day${d.activeDays === 1 ? '' : 's'}.`,
  ]
  if (d.moods.length) parts.push(`The moods that came up most: ${d.moods.map(m => m.mood).join(', ')}.`)
  if (d.peakDay && d.windowDays > 1) parts.push(`Your fullest day was ${d.peakDay.date}.`)
  if (d.longestGapDays >= 2) parts.push(`There was a ${d.longestGapDays}-day silence — rest counts too.`)
  if (d.trend === 'rising') parts.push('Activity is rising toward now.')
  if (d.trend === 'falling') parts.push('Activity has been easing off.')
  if (d.streak >= 2) parts.push(`Streak: ${d.streak} days.`)
  return parts.join(' ')
}
