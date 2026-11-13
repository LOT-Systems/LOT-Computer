/**
 * LOT SYSTEMS CORPORATION
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Story Compression — pure, deterministic layer under /story.
 *
 * The Log is a passive AI surface: the operator writes, the machine
 * records context. `/story [scope]` folds a time window of that record
 * into a compressed narrative. This module does the non-AI half:
 *
 *   1. resolve the scope (day / week / month / year) to a time window
 *   2. compress raw logs into a small, countable digest (entries,
 *      moods, peaks, cities, self-care answers)
 *   3. produce a deterministic fallback story when the AI vendor
 *      (Together AI) is unreachable — so /story never returns empty.
 *
 * No I/O, no stores, no DOM. Safe to import from server and client.
 */

export type StoryScope = 'day' | 'week' | 'month' | 'year'

export const STORY_SCOPES: StoryScope[] = ['day', 'week', 'month', 'year']

export const DEFAULT_STORY_SCOPE: StoryScope = 'week'

const SCOPE_MS: Record<StoryScope, number> = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
}

/** Max raw logs pulled per scope. Larger windows sample more. */
export const SCOPE_LOG_LIMIT: Record<StoryScope, number> = {
  day: 200,
  week: 500,
  month: 1000,
  year: 2000,
}

const SCOPE_ALIASES: Record<string, StoryScope> = {
  day: 'day', d: 'day', today: 'day', '24h': 'day',
  week: 'week', w: 'week', '7d': 'week',
  month: 'month', m: 'month', '30d': 'month',
  year: 'year', y: 'year', '365d': 'year',
}

/** Coerce any input (e.g. request body) into a valid scope. */
export function normalizeStoryScope(input: unknown): StoryScope {
  if (typeof input !== 'string') return DEFAULT_STORY_SCOPE
  return SCOPE_ALIASES[input.trim().toLowerCase()] || DEFAULT_STORY_SCOPE
}

/**
 * Parse the scope argument that follows `/story` in a log entry.
 * `/story` → week, `/story day` → day, `/story year` → year.
 * Unknown arguments fall back to the default scope.
 */
export function parseStoryScope(text: string): StoryScope {
  if (!text) return DEFAULT_STORY_SCOPE
  const match = text.match(/(^|\s)\/story(?:\s+([a-z0-9]+))?/i)
  if (!match || !match[2]) return DEFAULT_STORY_SCOPE
  return normalizeStoryScope(match[2])
}

/** Inclusive start of the scope window relative to `now`. */
export function storyWindowStart(scope: StoryScope, now: Date = new Date()): Date {
  return new Date(now.getTime() - SCOPE_MS[scope])
}

/** Minimal log shape this module needs — matches the Log model. */
export interface StoryLogInput {
  event?: string | null
  text?: string | null
  createdAt?: Date | string | null
  context?: { city?: string | null; [k: string]: unknown } | null
  metadata?: Record<string, unknown> | null
}

export interface StoryPeak {
  date: string // YYYY-MM-DD
  mood: string
  valence: number
}

export interface StoryDigest {
  scope: StoryScope
  from: string
  to: string
  entryCount: number
  checkinCount: number
  selfCareCount: number
  activeDays: number
  topMoods: Array<{ mood: string; count: number }>
  high: StoryPeak | null
  low: StoryPeak | null
  cities: string[]
  entries: string[] // newest first, trimmed
  selfCare: string[] // "question: answer"
}

/**
 * Coarse valence map for emotional check-in states. Unknown states
 * score 0 (neutral) — they still count toward topMoods.
 */
const MOOD_VALENCE: Record<string, number> = {
  joyful: 2, grateful: 2, inspired: 2, excited: 2, happy: 2, energized: 2,
  calm: 1, content: 1, peaceful: 1, focused: 1, hopeful: 1, good: 1, rested: 1,
  neutral: 0, okay: 0, ok: 0,
  tired: -1, restless: -1, uncertain: -1, bored: -1, stressed: -1, distracted: -1,
  anxious: -2, sad: -2, overwhelmed: -2, exhausted: -2, angry: -2, lonely: -2,
}

export function moodValence(mood: string): number {
  return MOOD_VALENCE[(mood || '').toLowerCase()] ?? 0
}

const JOURNAL_EVENTS = new Set(['log_entry', 'journal', 'note'])
const SELF_CARE_EVENTS = new Set(['memory_answer', 'self_care_checkin', 'energy_checkin'])

function toDate(v: StoryLogInput['createdAt']): Date | null {
  if (!v) return null
  const d = v instanceof Date ? v : new Date(v)
  return isNaN(d.getTime()) ? null : d
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/**
 * Compress raw logs into a digest for one scope window.
 * Logs outside the window are ignored; order of input does not matter.
 */
export function compressLogs(
  logs: StoryLogInput[],
  scope: StoryScope,
  now: Date = new Date()
): StoryDigest {
  const from = storyWindowStart(scope, now)
  const inWindow = logs
    .map(l => ({ l, at: toDate(l.createdAt) }))
    .filter((x): x is { l: StoryLogInput; at: Date } =>
      !!x.at && x.at.getTime() >= from.getTime() && x.at.getTime() <= now.getTime()
    )
    .sort((a, b) => b.at.getTime() - a.at.getTime())

  const days = new Set<string>()
  const moodCounts = new Map<string, number>()
  const cityCounts = new Map<string, number>()
  const entries: string[] = []
  const selfCare: string[] = []
  let checkinCount = 0
  let high: StoryPeak | null = null
  let low: StoryPeak | null = null

  for (const { l, at } of inWindow) {
    const event = l.event || ''
    const city = l.context?.city
    if (city) cityCounts.set(city, (cityCounts.get(city) || 0) + 1)

    if (JOURNAL_EVENTS.has(event)) {
      const text = (l.text || '').trim()
      if (text) {
        entries.push(text.substring(0, 200))
        days.add(dayKey(at))
      }
    } else if (event === 'emotional_checkin') {
      const mood = String(l.metadata?.emotionalState || '').toLowerCase()
      if (!mood) continue
      checkinCount++
      days.add(dayKey(at))
      moodCounts.set(mood, (moodCounts.get(mood) || 0) + 1)
      const v = moodValence(mood)
      const peak = { date: dayKey(at), mood, valence: v }
      // Ties resolve to the most recent occurrence (input is newest first).
      if (!high || v > high.valence) high = peak
      if (!low || v < low.valence) low = peak
    } else if (SELF_CARE_EVENTS.has(event)) {
      const q = String(l.metadata?.question || '')
      const a = String(l.metadata?.option || l.metadata?.answer || '')
      if (q && a) {
        selfCare.push(`${q}: ${a}`.substring(0, 200))
        days.add(dayKey(at))
      }
    }
  }

  // A flat emotional line has no peaks worth surfacing.
  if (high && low && high.valence === low.valence) {
    high = null
    low = null
  }

  const topMoods = Array.from(moodCounts.entries())
    .map(([mood, count]) => ({ mood, count }))
    .sort((a, b) => b.count - a.count || a.mood.localeCompare(b.mood))
    .slice(0, 3)

  const cities = Array.from(cityCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([c]) => c)
    .slice(0, 3)

  return {
    scope,
    from: from.toISOString(),
    to: now.toISOString(),
    entryCount: entries.length,
    checkinCount,
    selfCareCount: selfCare.length,
    activeDays: days.size,
    topMoods,
    high,
    low,
    cities,
    entries,
    selfCare,
  }
}

const SCOPE_NOUN: Record<StoryScope, string> = {
  day: 'today',
  week: 'this week',
  month: 'this month',
  year: 'this year',
}

/** Plain-text data block handed to the AI vendor. */
export function digestToPromptBlock(d: StoryDigest): string {
  const peaks = [
    d.high ? `HIGH: ${d.high.mood.toUpperCase()} on ${d.high.date}` : null,
    d.low ? `LOW: ${d.low.mood.toUpperCase()} on ${d.low.date}` : null,
  ].filter(Boolean)
  return [
    `SCOPE: ${d.scope.toUpperCase()} (${d.from.slice(0, 10)} → ${d.to.slice(0, 10)})`,
    `ACTIVE DAYS: ${d.activeDays} · ENTRIES: ${d.entryCount} · CHECK-INS: ${d.checkinCount} · SELF-CARE: ${d.selfCareCount}`,
    `TOP MOODS: ${d.topMoods.map(m => `${m.mood.toUpperCase()}×${m.count}`).join(', ') || 'NO DATA'}`,
    `PEAKS: ${peaks.join(' · ') || 'FLAT / NO DATA'}`,
    `PLACES: ${d.cities.join(', ') || 'UNKNOWN'}`,
    '',
    'LOG ENTRIES (newest first):',
    d.entries.slice(0, 8).map(e => `- ${e}`).join('\n') || '- (none)',
    '',
    'SELF-CARE ANSWERS:',
    d.selfCare.slice(0, 6).map(s => `- ${s}`).join('\n') || '- (none)',
  ].join('\n')
}

/**
 * Deterministic second-person story used when the AI engine fails.
 * It is a compression, not prose: it states only what the record holds.
 */
export function fallbackStory(d: StoryDigest): string {
  const span = SCOPE_NOUN[d.scope]
  if (d.entryCount + d.checkinCount + d.selfCareCount === 0) {
    return `The record is quiet ${span}. Write one line in the Log and the machine will start the story from there.`
  }
  const parts: string[] = []
  parts.push(
    `${capitalize(span)} you showed up on ${d.activeDays} ${d.activeDays === 1 ? 'day' : 'days'}` +
      ` — ${d.entryCount} ${d.entryCount === 1 ? 'entry' : 'entries'}, ` +
      `${d.checkinCount} ${d.checkinCount === 1 ? 'check-in' : 'check-ins'}, ` +
      `${d.selfCareCount} self-care ${d.selfCareCount === 1 ? 'answer' : 'answers'}.`
  )
  if (d.topMoods.length > 0) {
    parts.push(`Your most frequent state was ${d.topMoods[0].mood}.`)
  }
  if (d.high && d.low) {
    parts.push(`The high came on ${d.high.date} (${d.high.mood}); the low on ${d.low.date} (${d.low.mood}).`)
  }
  if (d.cities.length > 0) {
    parts.push(`Most of it happened in ${d.cities[0]}.`)
  }
  parts.push('The loop is recorded. Keep writing — the next compression starts here.')
  return parts.join(' ')
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
