/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * STORY COMPRESSION — horizon parsing + deterministic log compression.
 *
 * Pipeline position:
 *   LOT User data → [THIS MODULE: compress] → Quantum Intent prompt → Together AI → generated_story log
 *
 * Pure module: no DB, no network, no DOM. Shared by client (horizon
 * parsing for the /story command) and server (compression of the
 * operator's logs before the AI vendor sees them). The AI only ever
 * receives the compressed packet, never the raw log table.
 */

export type StoryHorizon = 'recent' | 'day' | 'week' | 'month' | 'year'

export const STORY_HORIZONS: StoryHorizon[] = ['recent', 'day', 'week', 'month', 'year']

/** Window length per horizon. `recent` has no window — it uses the last N entries. */
export const HORIZON_WINDOW_MS: Record<StoryHorizon, number | null> = {
  recent: null,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
}

/** Target story length (words) per horizon — longer horizon, denser compression. */
export const HORIZON_WORDS: Record<StoryHorizon, [number, number]> = {
  recent: [100, 200],
  day: [60, 120],
  week: [120, 200],
  month: [150, 250],
  year: [200, 320],
}

const HORIZON_ALIASES: Record<string, StoryHorizon> = {
  recent: 'recent', now: 'recent',
  day: 'day', today: 'day', d: 'day', '24h': 'day',
  week: 'week', w: 'week', '7d': 'week',
  month: 'month', m: 'month', '30d': 'month',
  year: 'year', y: 'year', '365d': 'year',
}

/**
 * Parse `/story <horizon>` out of free log text.
 * `/story` alone → 'recent'. Unknown argument → 'recent' (the argument
 * is treated as part of the operator's own log text).
 */
export function parseStoryHorizon(text: string): StoryHorizon {
  if (!text) return 'recent'
  const m = text.match(/(?:^|\s)\/story(?:\s+([a-z0-9]+))?/i)
  if (!m || !m[1]) return 'recent'
  return HORIZON_ALIASES[m[1].toLowerCase()] || 'recent'
}

/** Remove the `/story [horizon]` command and 📖 glyphs, leaving the operator's words. */
export function stripStoryCommand(text: string): string {
  if (!text) return ''
  return text
    .replace(/(^|\s)\/story(\s+(recent|now|today|day|d|24h|week|w|7d|month|m|30d|year|y|365d)\b)?/i, '$1')
    .replace(/📖/g, '')
    .trim()
}

// ─── Mood valence ────────────────────────────────────────────────────────────

const POSITIVE = new Set([
  'energized', 'calm', 'peaceful', 'grateful', 'hopeful', 'fulfilled', 'content',
  'happy', 'joyful', 'excited', 'focused', 'inspired', 'motivated', 'loved', 'relaxed',
])
const NEGATIVE = new Set([
  'tired', 'anxious', 'overwhelmed', 'exhausted', 'restless', 'uncertain',
  'sad', 'angry', 'stressed', 'lonely', 'frustrated', 'scared', 'numb', 'drained',
])

/** +1 positive, -1 negative, 0 neutral/unknown. */
export function moodValence(mood: string | null | undefined): -1 | 0 | 1 {
  if (!mood) return 0
  const k = mood.toLowerCase().trim()
  if (POSITIVE.has(k)) return 1
  if (NEGATIVE.has(k)) return -1
  return 0
}

// ─── Compression ─────────────────────────────────────────────────────────────

/** Minimal log shape needed for compression (matches the Log model subset). */
export interface CompressibleLog {
  event: string
  text?: string | null
  createdAt: Date | string
  metadata?: Record<string, any> | null
  context?: Record<string, any> | null
}

export interface StoryPeak {
  date: string        // YYYY-MM-DD
  score: number       // net valence that day
  moods: string[]
  excerpt: string | null
}

export interface StoryCompression {
  horizon: StoryHorizon
  windowStart: string | null
  windowEnd: string
  entries: number          // journal/log entries
  checkins: number         // emotional check-ins
  selfCare: number         // self-care / memory answers
  activeDays: number       // distinct days with any signal
  totalWords: number
  dominantMood: string | null
  moodCounts: Record<string, number>
  valence: number          // mean valence −1..+1, 2 decimals
  highPeak: StoryPeak | null
  lowPeak: StoryPeak | null
  peakHour: number | null  // 0-23 UTC, most frequent entry hour
  cities: string[]
  excerpts: string[]       // representative log excerpts (chronological)
  selfCareNotes: string[]
  compressionRatio: number // raw words in → excerpt words out
}

const JOURNAL_EVENTS = new Set(['log_entry', 'journal', 'note'])
const SELF_CARE_EVENTS = new Set(['memory_answer', 'self_care_checkin', 'energy_checkin'])

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function wordCount(s: string): number {
  const t = s.trim()
  return t ? t.split(/\s+/).length : 0
}

/** Strip previously generated command output so stories don't recurse on themselves. */
function cleanText(s: string | null | undefined): string {
  if (!s) return ''
  return s
    .split('\n')
    .filter(line => !/^\s*(📖|🕯️|🕯)/.test(line))
    .join(' ')
    .replace(/(^|\s)\/[a-z]+(\s+[a-z0-9]+)?/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Evenly sample `n` items from an array, preserving order. */
export function sampleEvenly<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return arr.slice()
  if (n <= 0) return []
  if (n === 1) return [arr[arr.length - 1]]
  const out: T[] = []
  const step = (arr.length - 1) / (n - 1)
  for (let i = 0; i < n; i++) out.push(arr[Math.round(i * step)])
  return out
}

/**
 * Compress an operator's logs for a horizon into a deterministic packet.
 * `logs` may arrive in any order; `now` is injectable for tests.
 */
export function compressLogs(
  logs: CompressibleLog[],
  horizon: StoryHorizon,
  now: Date = new Date(),
  opts: { maxExcerpts?: number; excerptChars?: number } = {}
): StoryCompression {
  const maxExcerpts = opts.maxExcerpts ?? (horizon === 'year' ? 12 : horizon === 'month' ? 10 : 6)
  const excerptChars = opts.excerptChars ?? 200
  const windowMs = HORIZON_WINDOW_MS[horizon]
  const start = windowMs ? new Date(now.getTime() - windowMs) : null

  const inWindow = logs
    .map(l => ({ ...l, _d: new Date(l.createdAt) }))
    .filter(l => !isNaN(l._d.getTime()) && l._d <= now && (!start || l._d >= start))
    .sort((a, b) => a._d.getTime() - b._d.getTime())

  const journal = inWindow.filter(l => JOURNAL_EVENTS.has(l.event) && cleanText(l.text).length > 0)
  const scoped = horizon === 'recent' ? journal.slice(-10) : journal
  const checkins = inWindow.filter(l => l.event === 'emotional_checkin')
  const selfCare = inWindow.filter(l => SELF_CARE_EVENTS.has(l.event))

  // Mood histogram + per-day valence
  const moodCounts: Record<string, number> = {}
  const perDay = new Map<string, { score: number; moods: string[]; excerpt: string | null }>()
  let valenceSum = 0
  let valenceN = 0
  for (const c of checkins) {
    const mood = String(c.metadata?.emotionalState || '').toLowerCase()
    if (!mood) continue
    moodCounts[mood] = (moodCounts[mood] || 0) + 1
    const v = moodValence(mood)
    valenceSum += v
    valenceN++
    const k = dayKey(c._d)
    const day = perDay.get(k) || { score: 0, moods: [], excerpt: null }
    day.score += v
    day.moods.push(mood)
    perDay.set(k, day)
  }
  for (const j of journal) {
    const k = dayKey(j._d)
    const day = perDay.get(k)
    if (day && !day.excerpt) day.excerpt = cleanText(j.text).slice(0, 140)
  }

  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] || null

  let highPeak: StoryPeak | null = null
  let lowPeak: StoryPeak | null = null
  for (const [date, d] of Array.from(perDay.entries())) {
    if (d.score > 0 && (!highPeak || d.score > highPeak.score)) highPeak = { date, ...d }
    if (d.score < 0 && (!lowPeak || d.score < lowPeak.score)) lowPeak = { date, ...d }
  }

  // Rhythm
  const hours = new Array(24).fill(0)
  journal.forEach(j => { hours[j._d.getUTCHours()]++ })
  const maxHour = Math.max(...hours)
  const peakHour = maxHour > 0 ? hours.indexOf(maxHour) : null

  const days = new Set<string>()
  inWindow.forEach(l => days.add(dayKey(l._d)))

  const cities = Array.from(new Set(
    inWindow.map(l => (l.context?.city as string) || '').filter(Boolean)
  )).slice(0, 5)

  const texts = scoped.map(l => cleanText(l.text))
  const totalWords = texts.reduce((n, t) => n + wordCount(t), 0)
  const excerpts = sampleEvenly(texts, maxExcerpts).map(t => t.slice(0, excerptChars))
  const excerptWords = excerpts.reduce((n, t) => n + wordCount(t), 0)

  const selfCareNotes = selfCare.slice(-5).map(l => {
    const q = String(l.metadata?.question || '')
    const a = String(l.metadata?.option || l.metadata?.answer || '')
    return q && a ? `${q}: ${a}` : ''
  }).filter(Boolean)

  return {
    horizon,
    windowStart: start ? start.toISOString() : null,
    windowEnd: now.toISOString(),
    entries: scoped.length,
    checkins: checkins.length,
    selfCare: selfCare.length,
    activeDays: days.size,
    totalWords,
    dominantMood,
    moodCounts,
    valence: valenceN ? Math.round((valenceSum / valenceN) * 100) / 100 : 0,
    highPeak,
    lowPeak,
    peakHour,
    cities,
    excerpts,
    selfCareNotes,
    compressionRatio: excerptWords ? Math.round((totalWords / excerptWords) * 10) / 10 : 0,
  }
}

/** Arcade XP earned by a story compression — rewards consistency, not volume. */
export function storyXp(c: StoryCompression): number {
  const base = { recent: 5, day: 5, week: 15, month: 40, year: 120 }[c.horizon]
  return base + c.activeDays * 2 + Math.min(c.checkins, 30) + Math.min(c.selfCare, 30)
}

/** Fixed-width terminal header for a compressed story. */
export function formatCompressionHeader(c: StoryCompression): string[] {
  const pad = (k: string) => k.padEnd(16)
  const lines = [
    `${pad('HORIZON')}${c.horizon.toUpperCase()}`,
    `${pad('SIGNALS')}${c.entries} LOG · ${c.checkins} MOOD · ${c.selfCare} CARE · ${c.activeDays} DAYS`,
  ]
  if (c.dominantMood) lines.push(`${pad('DOMINANT')}${c.dominantMood.toUpperCase()} · VALENCE ${c.valence >= 0 ? '+' : ''}${c.valence.toFixed(2)}`)
  if (c.highPeak) lines.push(`${pad('HIGH PEAK')}${c.highPeak.date} · ${c.highPeak.moods.join('/').toUpperCase()}`)
  if (c.lowPeak) lines.push(`${pad('LOW PEAK')}${c.lowPeak.date} · ${c.lowPeak.moods.join('/').toUpperCase()}`)
  if (c.compressionRatio > 0) lines.push(`${pad('COMPRESSION')}${c.totalWords}W → ${c.compressionRatio}:1`)
  lines.push(`${pad('XP')}+${storyXp(c)}`)
  return lines
}

/** Data block handed to the AI vendor. Only compressed data — never raw tables. */
export function compressionToPrompt(c: StoryCompression): string {
  const moodLine = Object.entries(c.moodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([m, n]) => `${m}×${n}`)
    .join(', ')
  const peak = (p: StoryPeak | null) =>
    p ? `${p.date} (${p.moods.join(', ')})${p.excerpt ? ` — "${p.excerpt}"` : ''}` : 'none detected'
  return [
    `HORIZON: ${c.horizon.toUpperCase()}${c.windowStart ? ` (${c.windowStart.slice(0, 10)} → ${c.windowEnd.slice(0, 10)})` : ''}`,
    `SIGNAL COUNT: ${c.entries} log entries, ${c.checkins} mood check-ins, ${c.selfCare} self-care answers across ${c.activeDays} active days`,
    `MOOD DISTRIBUTION: ${moodLine || 'NO DATA'}`,
    `MEAN VALENCE: ${c.valence} (−1 low … +1 high)`,
    `HIGH PEAK: ${peak(c.highPeak)}`,
    `LOW PEAK: ${peak(c.lowPeak)}`,
    `WRITING HOUR: ${c.peakHour !== null ? `${String(c.peakHour).padStart(2, '0')}:00 UTC` : 'unknown'}`,
    `PLACES: ${c.cities.join(', ') || 'unknown'}`,
    '',
    'LOG EXCERPTS (chronological sample):',
    c.excerpts.map(e => `- ${e}`).join('\n') || '- (none)',
    '',
    'SELF-CARE DATA:',
    c.selfCareNotes.map(n => `- ${n}`).join('\n') || '- (none)',
  ].join('\n')
}
