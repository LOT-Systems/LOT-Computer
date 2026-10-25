/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Story compression — pure, dependency-free.
 *
 * Turns a window of Log records (entries + their context snapshots) into
 * a compact digest the LOT® AI can narrate. The digest, not the raw
 * entries, is what leaves the LOT boundary toward the AI vendor:
 * bounded size, no more than MAX_EXCERPTS short excerpts.
 *
 *   LOT User data → Quantum Intent Engine → AI vendor → LOT stored story
 */

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'

export const STORY_PERIODS: StoryPeriod[] = ['day', 'week', 'month', 'year']
export const DEFAULT_STORY_PERIOD: StoryPeriod = 'week'

const PERIOD_DAYS: Record<StoryPeriod, number> = { day: 1, week: 7, month: 30, year: 365 }
const PERIOD_ALIASES: Record<string, StoryPeriod> = {
  day: 'day', today: 'day', daily: 'day',
  week: 'week', weekly: 'week',
  month: 'month', monthly: 'month',
  year: 'year', yearly: 'year',
}

const MAX_EXCERPTS = 8
const EXCERPT_CHARS = 160
const JOURNAL_EVENTS = new Set(['log_entry', 'journal'])

export interface StoryLogInput {
  event: string
  text?: string | null
  createdAt: Date | string
  metadata?: Record<string, any> | null
  context?: Record<string, any> | null
}

export interface StoryDigest {
  period: StoryPeriod
  windowStart: string
  windowEnd: string
  entryCount: number
  activeDays: number
  moodCounts: Record<string, number>
  cities: string[]
  weather: string[]
  moonPhases: string[]
  /** Mean words per entry in the first half vs second half of the window. */
  wordTrend: 'rising' | 'falling' | 'steady' | 'unknown'
  excerpts: string[]
}

/** Reads the period argument from "/story week", "/story monthly", etc. */
export function parseStoryPeriod(text: string): StoryPeriod {
  const m = /(?:^|\s)\/story\s+([a-z]+)/i.exec(text || '')
  return (m && PERIOD_ALIASES[m[1].toLowerCase()]) || DEFAULT_STORY_PERIOD
}

export function storyWindow(period: StoryPeriod, now: Date = new Date()) {
  const end = new Date(now)
  const start = new Date(now.getTime() - PERIOD_DAYS[period] * 86_400_000)
  return { start, end }
}

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s)
const words = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0)

function topN(values: string[], n: number): string[] {
  const counts = new Map<string, number>()
  for (const v of values) counts.set(v, (counts.get(v) || 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([v]) => v)
}

export function compressLogs(
  logs: StoryLogInput[],
  period: StoryPeriod,
  now: Date = new Date()
): StoryDigest {
  const { start, end } = storyWindow(period, now)
  const inWindow = logs
    .map(l => ({ ...l, at: new Date(l.createdAt) }))
    .filter(l => l.at >= start && l.at <= end)
    .sort((a, b) => a.at.getTime() - b.at.getTime())

  const journal = inWindow.filter(l => JOURNAL_EVENTS.has(l.event) && (l.text || '').trim())
  const moodCounts: Record<string, number> = {}
  for (const l of inWindow) {
    if (l.event !== 'emotional_checkin') continue
    const mood = String(l.metadata?.emotionalState || '').toUpperCase()
    if (mood) moodCounts[mood] = (moodCounts[mood] || 0) + 1
  }

  const ctx = inWindow.map(l => l.context || {})
  const weather = topN(
    ctx.map(c => String(c.weatherDescription || '')).filter(Boolean), 3)
  const cities = topN(ctx.map(c => String(c.city || '')).filter(Boolean), 3)
  const moonPhases = topN(ctx.map(c => String(c.astroMoonPhase || '')).filter(Boolean), 2)

  let wordTrend: StoryDigest['wordTrend'] = 'unknown'
  if (journal.length >= 4) {
    const half = Math.floor(journal.length / 2)
    const avg = (xs: typeof journal) =>
      xs.reduce((s, l) => s + words(l.text || ''), 0) / xs.length
    const a = avg(journal.slice(0, half))
    const b = avg(journal.slice(half))
    wordTrend = b > a * 1.25 ? 'rising' : b < a * 0.75 ? 'falling' : 'steady'
  }

  // Evenly sample excerpts across the window so long periods stay representative.
  const step = Math.max(1, journal.length / MAX_EXCERPTS)
  const excerpts: string[] = []
  for (let i = 0; i < journal.length && excerpts.length < MAX_EXCERPTS; i = Math.round(excerpts.length * step + step)) {
    const l = journal[Math.min(i, journal.length - 1)]
    excerpts.push(`${l.at.toISOString().slice(0, 10)}: ${clip((l.text || '').replace(/\s+/g, ' ').trim(), EXCERPT_CHARS)}`)
  }

  return {
    period,
    windowStart: start.toISOString(),
    windowEnd: end.toISOString(),
    entryCount: journal.length,
    activeDays: new Set(inWindow.map(l => l.at.toISOString().slice(0, 10))).size,
    moodCounts,
    cities,
    weather,
    moonPhases,
    wordTrend,
    excerpts,
  }
}

export function renderDigest(d: StoryDigest): string {
  const moods = Object.entries(d.moodCounts).sort((a, b) => b[1] - a[1])
    .map(([m, n]) => `${m}×${n}`).join(', ')
  return [
    `WINDOW: ${d.period.toUpperCase()} (${d.windowStart.slice(0, 10)} → ${d.windowEnd.slice(0, 10)})`,
    `ENTRIES: ${d.entryCount} across ${d.activeDays} active day(s); writing volume ${d.wordTrend}`,
    `MOODS: ${moods || 'NO DATA'}`,
    `PLACES: ${d.cities.join(', ') || 'unknown'}`,
    `SKY/WEATHER: ${d.weather.join(', ') || 'unknown'}${d.moonPhases.length ? ` · moon ${d.moonPhases.join(', ')}` : ''}`,
    'EXCERPTS:',
    ...(d.excerpts.length ? d.excerpts.map(e => `- ${e}`) : ['- (none)']),
  ].join('\n')
}

const PERIOD_WORDS: Record<StoryPeriod, string> = {
  day: '60-100 words', week: '100-160 words', month: '140-200 words', year: '180-240 words',
}

export function buildStoryPrompt(
  d: StoryDigest,
  extras: { stateBlock?: string; selfCare?: string[] } = {}
): string {
  return `You are the Story module of LOT Systems — a personal operating system that compresses the operator's recorded moments into a short narrative.

Compress the operator's ${d.period.toUpperCase()} into a story of ${PERIOD_WORDS[d.period]}. Surface the high and low peaks and any change of pattern; ground it in the context (place, sky, weather) where it matters.

RULES:
- Second person ("You...").
- Use only the data below. Never invent events, people or numbers.
- If data is sparse, say so plainly and briefly instead of padding.
- Acknowledge gaps or struggle with compassion; never diagnose.
- End with one quiet forward-looking sentence, not a pep talk.
- Return ONLY the story. No title, no preamble.

${renderDigest(d)}

${extras.stateBlock || 'STATE: unknown'}

SELF-CARE DATA:
${(extras.selfCare || []).slice(0, 5).map(n => `- ${n}`).join('\n') || '- (none)'}`
}
