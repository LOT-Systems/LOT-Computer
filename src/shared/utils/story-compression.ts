/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Story Compression — LOT® AI loop, step 3
 *
 * Pure functions (no I/O, no stores, no AI vendor) that compress a window
 * of Log rows into a StoryDigest: a small, vendor-neutral summary of the
 * period (entries, mood arc, environment context, spikes, arcade rank).
 *
 * Flow:  Log rows → buildStoryDigest() → buildStoryPrompt() → AI vendor
 *        (Together AI) → stored story.  If the vendor is unavailable,
 *        composeFallbackStory() renders the same digest locally so the user
 *        never gets an empty answer.
 *
 * Shared by the server (/api/story) and any client surface that wants to
 * preview the digest. See docs/technical/LOG-COMMAND-SYSTEM.md.
 */

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'

export const STORY_PERIODS: StoryPeriod[] = ['day', 'week', 'month', 'year']

/** Minimal Log row shape the compressor needs (subset of the Log model). */
export interface StoryLogRow {
  event: string
  text?: string | null
  createdAt: Date | string
  context?: {
    temperature?: number | null // Kelvin
    humidity?: number | null
    weatherDescription?: string | null
    city?: string | null
    astroMoonPhase?: string | null
    astroWesternZodiac?: string | null
  } | null
  metadata?: Record<string, any> | null
}

export interface StorySpike {
  /** YYYY-MM-DD (UTC bucket) */
  day: string
  kind: 'volume' | 'silence-break'
  entries: number
  note: string
}

export interface StoryArcade {
  badgesEarned?: number
  badgesTotal?: number
}

export interface StoryDigest {
  period: StoryPeriod
  windowStart: string
  windowEnd: string
  entryCount: number
  activeDays: number
  totalDays: number
  wordCount: number
  moods: string[]
  topMood: string | null
  cities: string[]
  avgTempC: number | null
  avgHumidity: number | null
  skies: string[]
  moonPhases: string[]
  spikes: StorySpike[]
  /** Self-care answers ("question: answer") from Memory / check-ins. */
  careNotes: string[]
  /** Short verbatim excerpts, oldest → newest, for the vendor prompt. */
  excerpts: string[]
  rank: StoryRank
}

export interface StoryRank {
  level: number
  title: string
  xp: number
  nextAt: number | null
}

/** Events that count as user-authored journal material. */
const JOURNAL_EVENTS = new Set(['log_entry', 'journal'])
const MOOD_EVENTS = new Set(['emotional_checkin'])
const CARE_EVENTS = new Set([
  'memory_answer',
  'self_care_checkin',
  'energy_checkin',
])

const PERIOD_DAYS: Record<StoryPeriod, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

const PERIOD_EXCERPT_LIMIT: Record<StoryPeriod, number> = {
  day: 8,
  week: 10,
  month: 12,
  year: 14,
}

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Arcade ladder. Self-care first: XP comes from showing up (entries,
 * active days, badges), never from volume alone.
 */
const RANKS: { at: number; title: string }[] = [
  { at: 0, title: 'SIGNAL' },
  { at: 25, title: 'OPERATOR' },
  { at: 100, title: 'NAVIGATOR' },
  { at: 300, title: 'ARCHITECT' },
  { at: 800, title: 'STEWARD' },
  { at: 2000, title: 'ELDER' },
]

export function parseStoryPeriod(input?: string | null): StoryPeriod {
  const s = (input || '').trim().toLowerCase()
  if (s.startsWith('d') || s === 'today') return 'day'
  if (s.startsWith('m')) return 'month'
  if (s.startsWith('y')) return 'year'
  if (s.startsWith('w')) return 'week'
  return 'week'
}

/**
 * Extracts the period argument from a log containing "/story [period]".
 * Returns null when no (valid) period token follows the command.
 */
export function extractStoryPeriod(logText: string): StoryPeriod | null {
  const m = (logText || '').match(/\/story\s+(day|today|week|month|year)\b/i)
  return m ? parseStoryPeriod(m[1]) : null
}

export function computeRank(xp: number): StoryRank {
  let idx = 0
  for (let i = 0; i < RANKS.length; i++) if (xp >= RANKS[i].at) idx = i
  const next = RANKS[idx + 1]
  return {
    level: idx + 1,
    title: RANKS[idx].title,
    xp,
    nextAt: next ? next.at : null,
  }
}

function toDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d)
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function countWords(s: string): number {
  const t = s.trim()
  return t ? t.split(/\s+/).length : 0
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

function uniqueTop(values: string[], max: number): string[] {
  const freq = new Map<string, number>()
  for (const v of values) freq.set(v, (freq.get(v) || 0) + 1)
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([v]) => v)
}

/**
 * Spike detection — the "follow-up trigger" described in the product
 * brief. A day is a spike when:
 *   volume        entries >= max(3, 2 × median) of active-day counts
 *   silence-break first entry after >= 3 quiet days inside the window
 * Both are deterministic and cheap; the AI vendor only narrates them.
 */
export function detectSpikes(
  dayCounts: Map<string, number>,
  windowStart: Date,
  windowEnd: Date
): StorySpike[] {
  const spikes: StorySpike[] = []
  const counts = [...dayCounts.values()]
  if (counts.length === 0) return spikes

  const mean = counts.reduce((a, b) => a + b, 0) / counts.length
  const sortedCounts = [...counts].sort((a, b) => a - b)
  const median = sortedCounts[Math.floor(sortedCounts.length / 2)]
  // Median is robust on small windows where one burst inflates σ.
  const threshold = Math.max(3, 2 * median)

  const days = [...dayCounts.keys()].sort()
  for (const day of days) {
    const n = dayCounts.get(day) || 0
    if (n >= threshold) {
      spikes.push({
        day,
        kind: 'volume',
        entries: n,
        note: `${n} entries — well above your usual ${round1(mean)}/day`,
      })
    }
  }

  let prev = windowStart.getTime() - DAY_MS
  for (const day of days) {
    const t = new Date(day + 'T00:00:00Z').getTime()
    const gap = Math.round((t - prev) / DAY_MS) - 1
    // Only count a gap that follows a real prior entry inside the window.
    if (gap >= 3 && prev >= windowStart.getTime()) {
      spikes.push({
        day,
        kind: 'silence-break',
        entries: dayCounts.get(day) || 0,
        note: `back after ${gap} quiet days`,
      })
    }
    prev = t
  }
  void windowEnd
  return spikes.sort((a, b) => a.day.localeCompare(b.day))
}

export function buildStoryDigest(
  rows: StoryLogRow[],
  period: StoryPeriod,
  now: Date = new Date(),
  arcade: StoryArcade = {}
): StoryDigest {
  const totalDays = PERIOD_DAYS[period]
  const windowEnd = now
  const windowStart = new Date(now.getTime() - totalDays * DAY_MS)

  const inWindow = rows.filter(r => {
    const t = toDate(r.createdAt).getTime()
    return t >= windowStart.getTime() && t <= windowEnd.getTime()
  })
  const sorted = [...inWindow].sort(
    (a, b) => toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime()
  )

  const journal = sorted.filter(
    r => JOURNAL_EVENTS.has(r.event) && (r.text || '').trim()
  )
  const dayCounts = new Map<string, number>()
  for (const r of journal) {
    const k = dayKey(toDate(r.createdAt))
    dayCounts.set(k, (dayCounts.get(k) || 0) + 1)
  }

  const moods = sorted
    .filter(r => MOOD_EVENTS.has(r.event))
    .map(r => String(r.metadata?.emotionalState || '').toUpperCase())
    .filter(Boolean)

  const temps: number[] = []
  const hums: number[] = []
  const cities: string[] = []
  const skies: string[] = []
  const moons: string[] = []
  for (const r of sorted) {
    const c = r.context
    if (!c) continue
    if (typeof c.temperature === 'number') temps.push(c.temperature - 273.15)
    if (typeof c.humidity === 'number') hums.push(c.humidity)
    if (c.city) cities.push(c.city)
    if (c.weatherDescription) skies.push(c.weatherDescription.toLowerCase())
    if (c.astroMoonPhase) moons.push(c.astroMoonPhase)
  }
  const avg = (xs: number[]) =>
    xs.length ? round1(xs.reduce((a, b) => a + b, 0) / xs.length) : null

  const careNotes = sorted
    .filter(r => CARE_EVENTS.has(r.event))
    .map(r => {
      const q = String(r.metadata?.question || '')
      const a = String(r.metadata?.option || r.metadata?.answer || '')
      return q && a ? `${q}: ${a}`.slice(0, 120) : ''
    })
    .filter(Boolean)
    .slice(-6)

  const wordCount = journal.reduce((n, r) => n + countWords(r.text || ''), 0)
  const limit = PERIOD_EXCERPT_LIMIT[period]
  // Evenly sample across the window so a year is not just December.
  const step = Math.max(1, Math.ceil(journal.length / limit))
  const excerpts = journal
    .filter((_, i) => i % step === 0)
    .slice(-limit)
    .map(r => (r.text || '').trim().replace(/\s+/g, ' ').slice(0, 200))

  // Arcade XP: showing up beats volume.
  const xp =
    journal.length +
    dayCounts.size * 3 +
    moods.length * 2 +
    (arcade.badgesEarned || 0) * 5

  return {
    period,
    windowStart: windowStart.toISOString(),
    windowEnd: windowEnd.toISOString(),
    entryCount: journal.length,
    activeDays: dayCounts.size,
    totalDays,
    wordCount,
    moods,
    topMood: uniqueTop(moods, 1)[0] || null,
    cities: uniqueTop(cities, 3),
    avgTempC: avg(temps),
    avgHumidity: avg(hums),
    skies: uniqueTop(skies, 3),
    moonPhases: uniqueTop(moons, 2),
    spikes: detectSpikes(dayCounts, windowStart, windowEnd),
    careNotes,
    excerpts,
    rank: computeRank(xp),
  }
}

const PERIOD_LABEL: Record<StoryPeriod, string> = {
  day: 'the last 24 hours',
  week: 'the last 7 days',
  month: 'the last 30 days',
  year: 'the last 365 days',
}

const PERIOD_WORDS: Record<StoryPeriod, string> = {
  day: '60-100',
  week: '100-160',
  month: '140-200',
  year: '180-260',
}

/** Renders the digest as a compact, vendor-neutral data block. */
export function formatDigestBlock(d: StoryDigest): string {
  const lines = [
    `WINDOW: ${PERIOD_LABEL[d.period]}`,
    `ENTRIES: ${d.entryCount} across ${d.activeDays}/${d.totalDays} days (${d.wordCount} words)`,
    `MOODS: ${d.moods.slice(-8).join(', ') || 'NO DATA'}${d.topMood ? ` (dominant: ${d.topMood})` : ''}`,
  ]
  const env: string[] = []
  if (d.cities.length) env.push(d.cities.join(' / '))
  if (d.avgTempC !== null) env.push(`avg ${d.avgTempC}°C`)
  if (d.avgHumidity !== null) env.push(`humidity ${d.avgHumidity}%`)
  if (d.skies.length) env.push(d.skies.join(', '))
  if (d.moonPhases.length) env.push(`moon: ${d.moonPhases.join(', ')}`)
  lines.push(`ENVIRONMENT: ${env.join('; ') || 'NO DATA'}`)
  lines.push(
    `SPIKES: ${d.spikes.map(s => `${s.day} ${s.note}`).join(' | ') || 'none detected'}`
  )
  lines.push(`ARCADE: rank ${d.rank.title} (level ${d.rank.level}, ${d.rank.xp} XP)`)
  lines.push(
    `SELF-CARE: ${d.careNotes.join(' | ') || 'NO DATA'}`
  )
  lines.push('EXCERPTS (oldest → newest):')
  lines.push(...(d.excerpts.length ? d.excerpts.map(e => `- ${e}`) : ['- (none)']))
  return lines.join('\n')
}

export function buildStoryPrompt(
  d: StoryDigest,
  currentEntry: string,
  stateBlock = ''
): string {
  const system = `You are the Story module of LOT Systems — a personal operating system that compresses a person's journal, mood and environment context into a short narrative they can recognise themselves in.

Write ${PERIOD_WORDS[d.period]} words about ${PERIOD_LABEL[d.period]}.

RULES:
- Second person ("You...").
- Use ONLY the data below. Never invent events, people, places or numbers.
- Name one high and one low if the data supports it; mention a SPIKE if one is listed.
- If data is thin, say so plainly and gently — do not pad.
- Match the tone to the person's current energy: reflective if low, energized if high.
- Self-care framing, not productivity pressure. No diagnoses, no medical advice.
- End with one forward-looking sentence — a quiet truth, not a pep talk.
- Return ONLY the story. No title, no preamble, no markdown.`

  return `${system}

CURRENT ENTRY: "${(currentEntry || '(none)').slice(0, 300)}"
${stateBlock || 'STATE: unknown'}

${formatDigestBlock(d)}`
}

/**
 * Deterministic local story used when the AI vendor is unavailable or
 * the user has not yet produced enough data. Never fabricates: every
 * sentence is derived from a digest field.
 */
export function composeFallbackStory(d: StoryDigest): string {
  const span =
    d.period === 'day'
      ? 'today'
      : d.period === 'week'
        ? 'this week'
        : d.period === 'month'
          ? 'this month'
          : 'this year'

  if (d.entryCount === 0) {
    return `Nothing has been logged ${span} yet. That is fine — the system is listening, and your story starts with the next line you write.`
  }

  const parts: string[] = []
  parts.push(
    `${span.charAt(0).toUpperCase() + span.slice(1)} you showed up ${d.activeDays} time${d.activeDays === 1 ? '' : 's'}, writing ${d.entryCount} entr${d.entryCount === 1 ? 'y' : 'ies'} and ${d.wordCount} words.`
  )
  if (d.topMood) parts.push(`${d.topMood.toLowerCase()} was the mood that came up most.`)
  const where = d.cities[0]
  if (where || d.avgTempC !== null) {
    parts.push(
      `The world around you was ${[where ? `in ${where}` : '', d.avgTempC !== null ? `about ${d.avgTempC}°C` : ''].filter(Boolean).join(', ')}.`
    )
  }
  const peak = d.spikes[0]
  if (peak) parts.push(`A moment stood out on ${peak.day}: ${peak.note}.`)
  parts.push(
    d.rank.nextAt !== null
      ? `Rank ${d.rank.title}, ${d.rank.nextAt - d.rank.xp} XP from the next level. Keep writing — the pattern is the point.`
      : `Rank ${d.rank.title}. Keep writing — the pattern is the point.`
  )
  return parts.join(' ')
}
