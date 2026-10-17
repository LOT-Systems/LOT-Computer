/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * STORY COMPRESSION — deterministic first pass of the /story loop.
 *
 *   LOT User data → [compressLogs] → compact fact sheet → AI vendor → story
 *
 * Pure (no DB, no network). The server fetches logs, this module reduces them
 * to a small, privacy-bounded fact sheet (counts, moods, ambient context,
 * pattern shift, a few excerpts). The fact sheet — not the raw log history —
 * is what reaches the AI vendor, and it also powers an offline fallback story
 * so /story never returns an empty or generic error.
 */

import type { StoryScope } from '#shared/utils/logCommands'

export const SCOPE_DAYS: Record<StoryScope, number> = { day: 1, week: 7, month: 30, year: 365 }
export const SCOPE_LABEL: Record<StoryScope, string> = {
  day: 'today', week: 'this week', month: 'this month', year: 'this year',
}

const DAY_MS = 24 * 60 * 60 * 1000
const ENTRY_EVENTS = new Set(['log_entry', 'journal'])
const MAX_EXCERPTS = 5
const EXCERPT_LEN = 160

export interface StoryLogInput {
  event: string
  text: string | null
  createdAt: Date | string
  metadata?: Record<string, any> | null
  context?: Record<string, any> | null
}

export type PatternShift = 'surge' | 'drop' | 'steady' | 'insufficient'

export interface StoryCompression {
  scope: StoryScope
  windowStart: string
  entryCount: number
  activeDays: number
  windowDays: number
  moods: Array<{ mood: string; count: number }>
  selfCareTouches: number
  ambient: {
    avgTempC: number | null
    topWeather: string | null
    cities: string[]
    moonPhases: string[]
    daypart: Record<'night' | 'morning' | 'afternoon' | 'evening', number>
  }
  shift: PatternShift
  /** most recent first, truncated; entries only — never other event types */
  excerpts: string[]
}

export function windowStartFor(scope: StoryScope, now = new Date()): Date {
  return new Date(now.getTime() - SCOPE_DAYS[scope] * DAY_MS)
}

function top<T extends string>(counts: Map<T, number>, n: number): Array<[T, number]> {
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, n)
}

function bump(m: Map<string, number>, k: string | null | undefined) {
  if (k) m.set(k, (m.get(k) || 0) + 1)
}

function daypartOf(hour: number): 'night' | 'morning' | 'afternoon' | 'evening' {
  return hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
}

/** Local hour of an entry from its context.date ("… HH:mm") when present, else UTC hour. */
function localHour(l: StoryLogInput, created: Date): number {
  const m = /(\d{1,2}):\d{2}/.exec(String(l.context?.date || ''))
  return m ? Math.min(23, parseInt(m[1], 10)) : created.getUTCHours()
}

export function compressLogs(
  logs: StoryLogInput[],
  scope: StoryScope,
  now = new Date()
): StoryCompression {
  const start = windowStartFor(scope, now)
  const inWindow = logs
    .map(l => ({ l, at: new Date(l.createdAt) }))
    .filter(({ at }) => !isNaN(at.getTime()) && at >= start && at <= now)
    .sort((a, b) => b.at.getTime() - a.at.getTime())

  const entries = inWindow.filter(({ l }) => ENTRY_EVENTS.has(l.event) && (l.text || '').trim())
  const moods = new Map<string, number>()
  const weather = new Map<string, number>()
  const cities = new Map<string, number>()
  const moons = new Map<string, number>()
  const daypart = { night: 0, morning: 0, afternoon: 0, evening: 0 }
  const days = new Set<string>()
  const temps: number[] = []
  let selfCare = 0

  for (const { l, at } of inWindow) {
    if (l.event === 'emotional_checkin') bump(moods, String(l.metadata?.emotionalState || '').toLowerCase())
    if (['memory_answer', 'self_care_checkin', 'energy_checkin'].includes(l.event)) selfCare++
    if (ENTRY_EVENTS.has(l.event) || l.event === 'emotional_checkin') {
      days.add(at.toISOString().slice(0, 10))
    }
    const c = l.context || {}
    if (typeof c.temperature === 'number' && c.temperature > 0) temps.push(c.temperature - 273.15)
    bump(weather, c.weatherDescription)
    bump(cities, c.city)
    bump(moons, c.astroMoonPhase)
  }
  for (const { l, at } of entries) daypart[daypartOf(localHour(l, at))]++

  // Pattern shift: entries in the recent half of the window vs the earlier half.
  const mid = start.getTime() + (now.getTime() - start.getTime()) / 2
  const recent = entries.filter(({ at }) => at.getTime() >= mid).length
  const earlier = entries.length - recent
  let shift: PatternShift = 'insufficient'
  if (entries.length >= 4) {
    shift = recent >= earlier * 2 && recent - earlier >= 2 ? 'surge'
      : earlier >= recent * 2 && earlier - recent >= 2 ? 'drop' : 'steady'
  }

  return {
    scope,
    windowStart: start.toISOString(),
    entryCount: entries.length,
    activeDays: days.size,
    windowDays: SCOPE_DAYS[scope],
    moods: top(moods, 5).map(([mood, count]) => ({ mood, count })),
    selfCareTouches: selfCare,
    ambient: {
      avgTempC: temps.length ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length) : null,
      topWeather: top(weather, 1)[0]?.[0] ?? null,
      cities: top(cities, 3).map(([c]) => c),
      moonPhases: top(moons, 2).map(([m]) => m),
      daypart,
    },
    shift,
    excerpts: entries
      .slice(0, MAX_EXCERPTS)
      .map(({ l }) => (l.text || '').replace(/\s+/g, ' ').trim().slice(0, EXCERPT_LEN)),
  }
}

/** Compact text block for the AI prompt. */
export function formatCompression(c: StoryCompression): string {
  const dp = c.ambient.daypart
  const busiest = (Object.keys(dp) as Array<keyof typeof dp>).sort((a, b) => dp[b] - dp[a])[0]
  return [
    `WINDOW: ${c.scope.toUpperCase()} (${c.windowDays}d) — ${c.entryCount} entries on ${c.activeDays} active days`,
    `PATTERN: ${c.shift}`,
    `MOODS: ${c.moods.map(m => `${m.mood}×${m.count}`).join(', ') || 'NO DATA'}`,
    `SELF-CARE TOUCHES: ${c.selfCareTouches}`,
    `AMBIENT: ${[
      c.ambient.avgTempC !== null ? `avg ${c.ambient.avgTempC}°C` : null,
      c.ambient.topWeather,
      c.ambient.cities.join('/') || null,
      c.ambient.moonPhases.join('/') || null,
    ].filter(Boolean).join(', ') || 'NO DATA'}`,
    c.entryCount ? `WRITES MOSTLY: ${busiest}` : '',
    `ENTRIES (newest first):`,
    ...(c.excerpts.length ? c.excerpts.map(e => `- ${e}`) : ['- (none)']),
  ].filter(Boolean).join('\n')
}

/**
 * Offline story from the fact sheet. Used when the AI vendor is unavailable
 * so the operator still receives a grounded, honest compression.
 */
export function buildLocalStory(c: StoryCompression): string {
  const label = SCOPE_LABEL[c.scope]
  if (c.entryCount === 0) {
    return `Nothing was written ${label}. The system noticed the quiet and kept it with you. Whenever you are ready, one line is enough.`
  }
  const parts: string[] = []
  parts.push(
    `You wrote ${c.entryCount} ${c.entryCount === 1 ? 'entry' : 'entries'} ${label}, across ${c.activeDays} ${c.activeDays === 1 ? 'day' : 'days'}.`
  )
  if (c.moods.length) {
    parts.push(`The feeling that returned most was ${c.moods[0].mood}.`)
  }
  const amb = [c.ambient.topWeather, c.ambient.avgTempC !== null ? `around ${c.ambient.avgTempC}°C` : null,
    c.ambient.cities[0]].filter(Boolean)
  if (amb.length) parts.push(`The world around you was ${amb.join(', ')}.`)
  if (c.shift === 'surge') parts.push('Your writing picked up pace toward the end — something was moving.')
  if (c.shift === 'drop') parts.push('Your writing slowed toward the end. That is information too, not a failure.')
  if (c.excerpts[0]) parts.push(`Most recently you wrote: “${c.excerpts[0].slice(0, 100)}”.`)
  parts.push('Tomorrow only needs one honest line.')
  return parts.join(' ')
}
