/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Story Compression — LOT® AI
 *
 * Pure functions (no DB, no network, no clock unless injected) that turn a
 * window of a user's log records into a compact "compression" of their
 * day / week / month / year:
 *
 *   records → stats (volume, mood arc, context, peaks & lows) → data block
 *
 * The data block is what the AI vendor (Together AI) receives. The same stats
 * also drive a deterministic fallback story, so `/story` never returns an
 * empty apology when the vendor is unreachable.
 *
 * Privacy: only aggregates and short excerpts leave this module. Raw context
 * metadata (weather, city, time-of-day) is summarised, never forwarded
 * verbatim per record.
 */

export type StoryScope = 'day' | 'week' | 'month' | 'year'

export const STORY_SCOPES: StoryScope[] = ['day', 'week', 'month', 'year']

/** Entries per scope that may be quoted to the vendor as excerpts. */
const EXCERPT_LIMIT: Record<StoryScope, number> = { day: 6, week: 8, month: 10, year: 12 }
const WINDOW_DAYS: Record<StoryScope, number> = { day: 1, week: 7, month: 30, year: 365 }

/** Events that carry the operator's own words (Log section = Journal). */
export const JOURNAL_EVENTS = ['note', 'journal', 'log_entry']
export const MOOD_EVENTS = ['emotional_checkin']

const MOOD_POSITIVE = new Set([
  'energized', 'calm', 'hopeful', 'grateful', 'fulfilled', 'content',
  'peaceful', 'excited', 'grounded', 'focused', 'flowing', 'steady',
])
const MOOD_HARD = new Set([
  'tired', 'anxious', 'exhausted', 'overwhelmed', 'restless', 'uncertain',
  'drained', 'depleted', 'unsettled', 'heavy',
])

export interface StoryLogRecord {
  event: string
  text?: string | null
  metadata?: Record<string, any> | null
  context?: Record<string, any> | null
  createdAt: Date | string
}

export interface MoodDay {
  day: string // YYYY-MM-DD
  valence: number // -1 (hard) … +1 (positive)
  moods: string[]
}

export interface StoryStats {
  scope: StoryScope
  windowStart: string
  windowEnd: string
  totalRecords: number
  journalEntries: number
  activeDays: number
  windowDays: number
  consistency: 'strong' | 'steady' | 'sporadic' | 'minimal' | 'none'
  dominantMood: string | null
  moodCounts: Record<string, number>
  moodArc: MoodDay[]
  /** Day with the best / worst mood valence. Null when <2 mood days. */
  peak: MoodDay | null
  low: MoodDay | null
  /** Day whose entry volume is the biggest deviation from the window mean. */
  volumeSpike: { day: string; count: number; mean: number } | null
  /** Direction of mood across the window: first half vs second half. */
  trend: 'rising' | 'falling' | 'flat' | 'unknown'
  timeOfDay: Record<'night' | 'morning' | 'afternoon' | 'evening', number>
  cities: string[]
  avgTempC: number | null
  selfCareCount: number
  intentionCount: number
  excerpts: string[]
}

/** Parse the optional scope argument that follows `/story`. */
export function parseStoryScope(raw: unknown): StoryScope {
  const s = String(raw || '').trim().toLowerCase()
  if (s === 'today' || s === 'daily') return 'day'
  if (s === 'weekly') return 'week'
  if (s === 'monthly') return 'month'
  if (s === 'yearly' || s === 'annual') return 'year'
  return (STORY_SCOPES as string[]).includes(s) ? (s as StoryScope) : 'week'
}

export function scopeWindow(scope: StoryScope, now: Date = new Date()): { start: Date; end: Date } {
  return { start: new Date(now.getTime() - WINDOW_DAYS[scope] * 86_400_000), end: now }
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10)

function valenceOf(mood: string): number {
  const m = mood.toLowerCase()
  return MOOD_POSITIVE.has(m) ? 1 : MOOD_HARD.has(m) ? -1 : 0
}

function toCelsius(kelvin: number): number {
  // Log context stores tempKelvin (see getLogContext); matches shared toCelsius.
  return kelvin - 273.15
}

function hourBucket(date: Date): keyof StoryStats['timeOfDay'] {
  const h = date.getUTCHours()
  return h < 6 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
}

function consistencyOf(activeDays: number, windowDays: number): StoryStats['consistency'] {
  if (activeDays === 0) return 'none'
  const ratio = activeDays / Math.min(windowDays, 30)
  return ratio >= 0.7 ? 'strong' : ratio >= 0.4 ? 'steady' : ratio >= 0.15 ? 'sporadic' : 'minimal'
}

/** Compress a record window into stats. Records outside the window are ignored. */
export function compressRecords(
  records: StoryLogRecord[],
  scope: StoryScope,
  now: Date = new Date()
): StoryStats {
  const { start, end } = scopeWindow(scope, now)
  const inWindow = records
    .map(r => ({ r, at: new Date(r.createdAt) }))
    .filter(({ at }) => !isNaN(at.getTime()) && at >= start && at <= end)
    .sort((a, b) => a.at.getTime() - b.at.getTime())

  const days = new Set<string>()
  const perDayVolume: Record<string, number> = {}
  const moodByDay: Record<string, string[]> = {}
  const moodCounts: Record<string, number> = {}
  const timeOfDay = { night: 0, morning: 0, afternoon: 0, evening: 0 }
  const cities = new Map<string, number>()
  const temps: number[] = []
  const excerpts: string[] = []
  let journalEntries = 0
  let selfCareCount = 0
  let intentionCount = 0

  for (const { r, at } of inWindow) {
    const day = dayKey(at)
    days.add(day)
    perDayVolume[day] = (perDayVolume[day] || 0) + 1
    timeOfDay[hourBucket(at)]++

    const ctx = r.context || {}
    if (typeof ctx.city === 'string' && ctx.city) cities.set(ctx.city, (cities.get(ctx.city) || 0) + 1)
    if (typeof ctx.temperature === 'number') temps.push(toCelsius(ctx.temperature))

    if (MOOD_EVENTS.includes(r.event)) {
      const mood = String(r.metadata?.emotionalState || '').toLowerCase()
      if (mood) {
        moodCounts[mood] = (moodCounts[mood] || 0) + 1
        ;(moodByDay[day] ||= []).push(mood)
      }
    } else if (JOURNAL_EVENTS.includes(r.event)) {
      const text = (r.text || '').trim()
      if (text) {
        journalEntries++
        excerpts.push(`${day}: ${text.replace(/\s+/g, ' ').slice(0, 180)}`)
      }
    } else if (['self_care_complete', 'self_care_completed'].includes(r.event)) {
      selfCareCount++
    } else if (r.event === 'intention') {
      intentionCount++
    }
  }

  const moodArc: MoodDay[] = Object.keys(moodByDay).sort().map(day => {
    const moods = moodByDay[day]
    return { day, moods, valence: moods.reduce((s, m) => s + valenceOf(m), 0) / moods.length }
  })

  let peak: MoodDay | null = null
  let low: MoodDay | null = null
  if (moodArc.length >= 2) {
    peak = moodArc.reduce((a, b) => (b.valence > a.valence ? b : a))
    low = moodArc.reduce((a, b) => (b.valence < a.valence ? b : a))
    if (peak.valence === low.valence) { peak = null; low = null }
  }

  let trend: StoryStats['trend'] = 'unknown'
  if (moodArc.length >= 4) {
    const mid = Math.floor(moodArc.length / 2)
    const avg = (xs: MoodDay[]) => xs.reduce((s, m) => s + m.valence, 0) / xs.length
    const delta = avg(moodArc.slice(mid)) - avg(moodArc.slice(0, mid))
    trend = delta > 0.25 ? 'rising' : delta < -0.25 ? 'falling' : 'flat'
  }

  let volumeSpike: StoryStats['volumeSpike'] = null
  const volDays = Object.keys(perDayVolume)
  if (volDays.length >= 3) {
    const mean = volDays.reduce((s, d) => s + perDayVolume[d], 0) / volDays.length
    const top = volDays.reduce((a, b) => (perDayVolume[b] > perDayVolume[a] ? b : a))
    if (perDayVolume[top] >= mean * 2 && perDayVolume[top] >= 4) {
      volumeSpike = { day: top, count: perDayVolume[top], mean: Math.round(mean * 10) / 10 }
    }
  }

  const dominantMood = Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null

  return {
    scope,
    windowStart: start.toISOString(),
    windowEnd: end.toISOString(),
    totalRecords: inWindow.length,
    journalEntries,
    activeDays: days.size,
    windowDays: WINDOW_DAYS[scope],
    consistency: consistencyOf(days.size, WINDOW_DAYS[scope]),
    dominantMood,
    moodCounts,
    moodArc,
    peak,
    low,
    volumeSpike,
    trend,
    timeOfDay,
    cities: [...cities.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c),
    avgTempC: temps.length ? Math.round(temps.reduce((s, t) => s + t, 0) / temps.length) : null,
    selfCareCount,
    intentionCount,
    // Most recent excerpts win; keep chronological order for the prompt.
    excerpts: excerpts.slice(-EXCERPT_LIMIT[scope]),
  }
}

/** Compact data block for the AI vendor prompt. */
export function renderStatsBlock(s: StoryStats): string {
  const lines = [
    `SCOPE: ${s.scope.toUpperCase()} (${s.windowStart.slice(0, 10)} → ${s.windowEnd.slice(0, 10)})`,
    `PRESENCE: ${s.activeDays}/${s.windowDays} days active · ${s.journalEntries} journal entries · ${s.totalRecords} records · consistency ${s.consistency}`,
    `MOOD: ${s.dominantMood ? `dominant ${s.dominantMood}` : 'no check-ins'} · trend ${s.trend}`,
  ]
  if (s.peak) lines.push(`HIGH PEAK: ${s.peak.day} (${s.peak.moods.join(', ')})`)
  if (s.low) lines.push(`LOW PEAK: ${s.low.day} (${s.low.moods.join(', ')})`)
  if (s.volumeSpike) {
    lines.push(`SPIKE: ${s.volumeSpike.count} records on ${s.volumeSpike.day} vs ${s.volumeSpike.mean}/day average`)
  }
  const tod = Object.entries(s.timeOfDay).filter(([, n]) => n > 0).sort(([, a], [, b]) => b - a)
  if (tod.length) lines.push(`RHYTHM: most active ${tod[0][0]} (UTC)`)
  if (s.cities.length || s.avgTempC !== null) {
    lines.push(`ENVIRONMENT: ${[s.cities.join('/'), s.avgTempC !== null ? `${s.avgTempC}°C avg` : ''].filter(Boolean).join(' · ')}`)
  }
  if (s.selfCareCount || s.intentionCount) {
    lines.push(`CARE: ${s.selfCareCount} self-care completed · ${s.intentionCount} intentions set`)
  }
  lines.push('', 'JOURNAL EXCERPTS:', ...(s.excerpts.length ? s.excerpts.map(e => `- ${e}`) : ['- (none)']))
  return lines.join('\n')
}

const SCOPE_LABEL: Record<StoryScope, string> = {
  day: 'today', week: 'this week', month: 'this month', year: 'this year',
}

/**
 * Deterministic story used when the AI vendor is unavailable. Honest,
 * compressed, second person — same register as the weekly Job 24 story.
 */
export function fallbackStory(s: StoryStats): string {
  const label = SCOPE_LABEL[s.scope]
  if (s.totalRecords === 0) {
    return `No signal recorded ${label}. The record is open — one entry starts the loop.`
  }
  const parts: string[] = []
  parts.push(
    `${s.activeDays} active day${s.activeDays === 1 ? '' : 's'} ${label}, ${s.journalEntries} journal entr${s.journalEntries === 1 ? 'y' : 'ies'}.`
  )
  if (s.dominantMood) parts.push(`${s.dominantMood[0].toUpperCase()}${s.dominantMood.slice(1)} carried the mood.`)
  if (s.trend === 'rising') parts.push('The arc is rising.')
  else if (s.trend === 'falling') parts.push('The arc is falling — worth a gentle look.')
  if (s.peak) parts.push(`High point: ${s.peak.day}.`)
  if (s.low) parts.push(`Low point: ${s.low.day}.`)
  if (s.volumeSpike) parts.push(`${s.volumeSpike.day} ran well above your usual volume.`)
  if (s.selfCareCount) parts.push(`${s.selfCareCount} self-care moment${s.selfCareCount === 1 ? '' : 's'} kept.`)
  parts.push(s.consistency === 'strong' ? 'The loop is tight.' : 'The loop stays open for you.')
  return parts.join(' ')
}

const SCOPE_WORDS: Record<StoryScope, string> = {
  day: '60-120 words', week: '100-180 words', month: '140-220 words', year: '180-260 words',
}

/** Vendor system prompt for a scoped compression story. */
export function storySystemPrompt(scope: StoryScope): string {
  return `You are the Story module of LOT Systems — a context-based personal narrative system for self-care.

The operator invoked /story ${scope}. Compress their ${scope} into a short personal narrative from the data below.

RULES:
- Second person ("You..."). ${SCOPE_WORDS[scope]}. No title, no preamble, no commentary.
- Use ONLY facts present in the data. Never invent events, people, or numbers.
- Surface the high peak and the low peak if present, and any spike or change of pattern.
- Quote or paraphrase journal excerpts sparingly; they are the operator's own words.
- Be compassionate about gaps and low points. Do not force positivity.
- Environment (weather, city, time of day) may colour the story, never dominate it.
- Not medical advice. Do not diagnose.
- End with one quiet forward-looking sentence — a truth, not a pep talk.`
}
