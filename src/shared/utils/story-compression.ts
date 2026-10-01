/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Story compression — LOT® AI loop stage 3
 *
 * Pure, dependency-free. Takes raw Log rows and compresses a time window
 * (day / week / month / year) into a StoryDigest: counts, rhythm, mood
 * spread, high/low peaks, spike-or-drop versus the previous window, and
 * the operator's Arcade rank. The digest feeds two consumers:
 *   1. the AI vendor prompt (renderDigestBlock) — numbers, not raw journal
 *   2. the offline fallback story (renderDigestStory) — so /story still
 *      answers when the vendor is down
 *
 * No I/O, no randomness, no clock reads (callers pass `now`).
 */

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'

export const STORY_PERIODS: readonly StoryPeriod[] = ['day', 'week', 'month', 'year']

export interface CompressibleLog {
  event: string
  text?: string | null
  createdAt: Date | string
  metadata?: Record<string, any> | null
  context?: Record<string, any> | null
}

export interface StoryPeak {
  date: string // YYYY-MM-DD (UTC)
  score: number // valence, -1..1
  excerpt: string
}

export interface ArcadeRank {
  xp: number
  level: number
  title: string
  nextTitle: string | null
  xpToNext: number | null
}

export interface StoryDigest {
  period: StoryPeriod
  label: string
  entries: number
  words: number
  activeDays: number
  windowDays: number
  streak: number
  peakDay: { date: string; entries: number } | null
  rhythm: 'night' | 'morning' | 'afternoon' | 'evening' | null
  moods: Array<{ mood: string; count: number }>
  high: StoryPeak | null
  low: StoryPeak | null
  trend: 'spike' | 'drop' | 'steady' | 'new'
  previousEntries: number
  city: string | null
  arcade: ArcadeRank
}

const DAY_MS = 86_400_000

/** Events that are the operator's own words (Log tab entries are event 'note'). */
const ENTRY_EVENTS = new Set(['note', 'log_entry', 'journal'])
const MOOD_EVENTS = new Set(['emotional_checkin', 'energy_checkin', 'self_care_checkin'])

const POSITIVE = [
  'good', 'great', 'happy', 'calm', 'grateful', 'joy', 'love', 'proud', 'strong', 'rested',
  'peace', 'energized', 'energised', 'clear', 'hopeful', 'focused', 'win', 'better', 'light', 'glad',
]
const NEGATIVE = [
  'tired', 'sad', 'anxious', 'angry', 'stress', 'stressed', 'exhausted', 'lonely', 'afraid', 'pain',
  'worse', 'heavy', 'lost', 'overwhelmed', 'burnout', 'drained', 'fear', 'cry', 'sick', 'low',
]

/** Valence of a text, -1..1. Whole-word lexicon match; 0 when nothing matches. */
export function scoreValence(text: string): number {
  const words = (text || '').toLowerCase().match(/[a-z']+/g) || []
  let pos = 0
  let neg = 0
  for (const w of words) {
    if (POSITIVE.includes(w)) pos++
    else if (NEGATIVE.includes(w)) neg++
  }
  const total = pos + neg
  return total === 0 ? 0 : (pos - neg) / total
}

const toDate = (d: Date | string): Date => (d instanceof Date ? d : new Date(d))
const dayKey = (d: Date): string => d.toISOString().slice(0, 10)

/**
 * Window for a period, ending at `now`. `day` = today (UTC), the others
 * are rolling (7 / 30 / 365 days). `prevStart` opens the equally long
 * window before it, for spike/drop detection.
 */
export function periodWindow(
  period: StoryPeriod,
  now: Date
): { start: Date; end: Date; prevStart: Date; days: number; label: string } {
  const days = { day: 1, week: 7, month: 30, year: 365 }[period]
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const start = new Date(todayStart.getTime() - (days - 1) * DAY_MS)
  const prevStart = new Date(start.getTime() - days * DAY_MS)
  const label = { day: 'TODAY', week: 'LAST 7 DAYS', month: 'LAST 30 DAYS', year: 'LAST 365 DAYS' }[period]
  return { start, end: now, prevStart, days, label }
}

const RANKS: Array<{ level: number; xp: number; title: string }> = [
  { level: 1, xp: 0, title: 'SIGNAL' },
  { level: 2, xp: 100, title: 'OPERATOR' },
  { level: 3, xp: 400, title: 'NAVIGATOR' },
  { level: 4, xp: 1000, title: 'ARCHIVIST' },
  { level: 5, xp: 2500, title: 'COMMANDER' },
  { level: 6, xp: 6000, title: 'ARCHITECT' },
]

/** Arcade rank from lifetime-ish activity. Pure; no persistence. */
export function arcadeRank(entries: number, activeDays: number, streak: number): ArcadeRank {
  const xp = entries * 10 + activeDays * 25 + streak * 15
  let idx = 0
  RANKS.forEach((r, i) => { if (xp >= r.xp) idx = i })
  const next = RANKS[idx + 1] || null
  return {
    xp,
    level: RANKS[idx].level,
    title: RANKS[idx].title,
    nextTitle: next ? next.title : null,
    xpToNext: next ? next.xp - xp : null,
  }
}

function streakEndingAt(activeKeys: Set<string>, now: Date): number {
  const todayStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  // Today may not have an entry yet — the streak is still alive if yesterday does.
  let cursor = activeKeys.has(dayKey(new Date(todayStart))) ? todayStart : todayStart - DAY_MS
  let n = 0
  while (activeKeys.has(dayKey(new Date(cursor)))) {
    n++
    cursor -= DAY_MS
  }
  return n
}

function rhythmOf(hours: number[]): StoryDigest['rhythm'] {
  if (!hours.length) return null
  const buckets = { night: 0, morning: 0, afternoon: 0, evening: 0 }
  for (const h of hours) {
    if (h < 6) buckets.night++
    else if (h < 12) buckets.morning++
    else if (h < 18) buckets.afternoon++
    else buckets.evening++
  }
  return (Object.keys(buckets) as Array<keyof typeof buckets>).reduce((a, b) =>
    buckets[b] > buckets[a] ? b : a
  )
}

const excerpt = (t: string): string => {
  const flat = t.replace(/\s+/g, ' ').trim()
  return flat.length > 120 ? flat.slice(0, 117) + '...' : flat
}

/**
 * Compress `logs` (any order, any events) into a digest for `period`.
 * Generated stories and other system events are ignored so the loop
 * never feeds on its own output.
 */
export function compressLogs(logs: CompressibleLog[], period: StoryPeriod, now: Date): StoryDigest {
  const win = periodWindow(period, now)
  const startMs = win.start.getTime()
  const prevMs = win.prevStart.getTime()

  const current: Array<{ at: Date; text: string }> = []
  const moodRows: string[] = []
  const allActive = new Set<string>()
  let previousEntries = 0
  let allEntries = 0
  const cities = new Map<string, number>()

  for (const l of logs) {
    const at = toDate(l.createdAt)
    const t = at.getTime()
    if (Number.isNaN(t) || t > now.getTime()) continue

    if (ENTRY_EVENTS.has(l.event)) {
      const text = (l.text || '').trim()
      if (!text) continue // empty placeholder rows are not entries
      allEntries++
      allActive.add(dayKey(at))
      if (t >= startMs) {
        current.push({ at, text })
        const city = l.context?.city
        if (typeof city === 'string' && city) cities.set(city, (cities.get(city) || 0) + 1)
      } else if (t >= prevMs) {
        previousEntries++
      }
    } else if (MOOD_EVENTS.has(l.event) && t >= startMs) {
      const m = String(l.metadata?.emotionalState || l.metadata?.option || '').trim().toLowerCase()
      if (m) moodRows.push(m)
    }
  }

  const perDay = new Map<string, number>()
  const activeInWindow = new Set<string>()
  let words = 0
  for (const e of current) {
    const k = dayKey(e.at)
    activeInWindow.add(k)
    perDay.set(k, (perDay.get(k) || 0) + 1)
    words += (e.text.match(/\S+/g) || []).length
  }

  let peakDay: StoryDigest['peakDay'] = null
  for (const [date, n] of Array.from(perDay)) {
    if (!peakDay || n > peakDay.entries) peakDay = { date, entries: n }
  }

  const scored = current.map(e => ({
    date: dayKey(e.at),
    score: scoreValence(e.text),
    excerpt: excerpt(e.text),
  }))
  const pos = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score)[0]
  const neg = scored.filter(s => s.score < 0).sort((a, b) => a.score - b.score)[0]

  const moodCounts = new Map<string, number>()
  moodRows.forEach(m => moodCounts.set(m, (moodCounts.get(m) || 0) + 1))
  const moods = Array.from(moodCounts, ([mood, count]) => ({ mood, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  let trend: StoryDigest['trend']
  if (previousEntries === 0) trend = current.length ? 'new' : 'steady'
  else if (current.length >= previousEntries * 1.8) trend = 'spike'
  else if (current.length <= previousEntries * 0.5) trend = 'drop'
  else trend = 'steady'

  const topCity = Array.from(cities).sort((a, b) => b[1] - a[1])[0]
  const streak = streakEndingAt(allActive, now)

  return {
    period,
    label: win.label,
    entries: current.length,
    words,
    activeDays: activeInWindow.size,
    windowDays: win.days,
    streak,
    peakDay,
    rhythm: rhythmOf(current.map(e => e.at.getUTCHours())),
    moods,
    high: pos ? { date: pos.date, score: pos.score, excerpt: pos.excerpt } : null,
    low: neg ? { date: neg.date, score: neg.score, excerpt: neg.excerpt } : null,
    trend,
    previousEntries,
    city: topCity ? topCity[0] : null,
    arcade: arcadeRank(allEntries, allActive.size, streak),
  }
}

/** Structured numbers block for the AI vendor prompt. */
export function renderDigestBlock(d: StoryDigest): string {
  const lines = [
    `WINDOW: ${d.label}`,
    `ENTRIES: ${d.entries} (previous window: ${d.previousEntries}, trend: ${d.trend.toUpperCase()})`,
    `ACTIVE DAYS: ${d.activeDays}/${d.windowDays} · STREAK: ${d.streak} · WORDS: ${d.words}`,
  ]
  if (d.rhythm) lines.push(`RHYTHM: mostly ${d.rhythm}`)
  if (d.peakDay) lines.push(`BUSIEST DAY: ${d.peakDay.date} (${d.peakDay.entries} entries)`)
  if (d.moods.length) lines.push(`MOODS: ${d.moods.map(m => `${m.mood} x${m.count}`).join(', ')}`)
  if (d.city) lines.push(`PLACE: ${d.city}`)
  if (d.high) lines.push(`HIGH PEAK (${d.high.date}): "${d.high.excerpt}"`)
  if (d.low) lines.push(`LOW PEAK (${d.low.date}): "${d.low.excerpt}"`)
  lines.push(`ARCADE: LVL ${d.arcade.level} ${d.arcade.title} · ${d.arcade.xp} XP`)
  return lines.join('\n')
}

/**
 * Deterministic compressed story — used when the AI vendor is
 * unreachable, and as the factual spine the AI is told to respect.
 * Terminal style (UPPERCASE keys, aligned) to match other Log output.
 */
export function renderDigestStory(d: StoryDigest): string {
  if (d.entries === 0) {
    return [
      `STORY           ${d.label}`,
      'ENTRIES         NONE',
      'SIGNAL          QUIET — NO RECORDS IN THIS WINDOW',
      `ARCADE          LVL ${d.arcade.level} ${d.arcade.title}`,
    ].join('\n')
  }
  const row = (k: string, v: string) => `${k.padEnd(16)}${v}`
  const lines = [
    row('STORY', d.label),
    row('ENTRIES', `${d.entries} · ${d.words} WORDS`),
    row('ACTIVE', `${d.activeDays} OF ${d.windowDays} DAYS · STREAK ${d.streak}`),
    row('TREND', d.trend === 'new' ? 'NEW SIGNAL' : `${d.trend.toUpperCase()} (PREV ${d.previousEntries})`),
  ]
  if (d.rhythm) lines.push(row('RHYTHM', d.rhythm.toUpperCase()))
  if (d.moods.length) lines.push(row('MOODS', d.moods.map(m => `${m.mood} x${m.count}`).join(' · ').toUpperCase()))
  if (d.high) lines.push(row('HIGH', `${d.high.date} — ${d.high.excerpt}`))
  if (d.low) lines.push(row('LOW', `${d.low.date} — ${d.low.excerpt}`))
  const next = d.arcade.nextTitle ? ` · ${d.arcade.xpToNext} XP TO ${d.arcade.nextTitle}` : ''
  lines.push(row('ARCADE', `LVL ${d.arcade.level} ${d.arcade.title} · ${d.arcade.xp} XP${next}`))
  return lines.join('\n')
}
