/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Story Compression — pure, deterministic, no network.
 *
 * Turns raw Log rows (text + context metadata) into a compact DIGEST for a
 * period (day/week/month/year): volume, active days, streak, highs/lows,
 * context signature. The digest is (a) fed to the AI vendor prompt instead
 * of raw entries (smaller, no private verbatim bloat) and (b) used to write
 * a deterministic fallback story when the vendor is unreachable.
 *
 * HONESTY NOTE: "peaks" and "lows" are lexical + volume heuristics, not
 * clinical sentiment analysis. They are labelled as signals, never diagnoses.
 */

import type { StoryPeriod } from './logCommands'

export type DigestLog = {
  text: string | null
  event: string
  createdAt: Date | string
  context?: Record<string, any> | null
}

export type DayBucket = {
  day: string // YYYY-MM-DD (UTC)
  entries: number
  words: number
  tone: number // lexical balance, >0 uplift, <0 strain
}

export type StoryDigest = {
  period: StoryPeriod
  windowStart: string
  windowEnd: string
  entries: number
  words: number
  activeDays: number
  windowDays: number
  streak: number // consecutive active days ending at the last active day
  peakDay: DayBucket | null
  lowDay: DayBucket | null
  /** first-half vs second-half tone shift: 'rising' | 'falling' | 'steady' */
  drift: 'rising' | 'falling' | 'steady' | 'unknown'
  /** a day whose volume is >= 2x the period mean (pattern-change signal) */
  spikeDays: string[]
  topCity: string | null
  topMoon: string | null
  avgTempC: number | null
  themes: string[]
  /** short quotes (<=90 chars) of up to 3 notable entries */
  quotes: string[]
}

export const PERIOD_DAYS: Record<StoryPeriod, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

/** Only these events are the user's own words. Generated output is excluded
 * so the machine never feeds on its own stories (no echo loop). */
export const USER_TEXT_EVENTS = ['log_entry', 'journal']

const UP = ['good', 'great', 'calm', 'happy', 'grateful', 'thankful', 'rested', 'energy', 'energized', 'strong', 'love', 'proud', 'peace', 'clear', 'joy', 'win', 'better']
const DOWN = ['tired', 'anxious', 'anxiety', 'sad', 'stress', 'stressed', 'pain', 'sick', 'angry', 'lonely', 'exhausted', 'worried', 'fear', 'bad', 'worse', 'cry', 'overwhelmed', 'insomnia']
const STOP = new Set(['the', 'and', 'for', 'that', 'this', 'with', 'was', 'are', 'but', 'not', 'you', 'have', 'had', 'has', 'its', 'just', 'from', 'they', 'about', 'what', 'when', 'there', 'then', 'than', 'been', 'were', 'will', 'would', 'could', 'should', 'into', 'out', 'got', 'get', 'very', 'really', 'today', 'like', 'want', 'feel', 'felt', 'much', 'some', 'more', 'also', 'still', 'because', 'story', 'system'])

const dayKey = (d: Date) => d.toISOString().slice(0, 10)
const toDate = (v: Date | string) => (v instanceof Date ? v : new Date(v))
const words = (t: string) => t.split(/\s+/).filter(Boolean)

function tone(text: string): number {
  const ws = words(text.toLowerCase()).map(w => w.replace(/[^a-z']/g, ''))
  let s = 0
  for (const w of ws) {
    if (UP.includes(w)) s++
    else if (DOWN.includes(w)) s--
  }
  return s
}

function mode(vals: (string | null | undefined)[]): string | null {
  const c = new Map<string, number>()
  for (const v of vals) if (v) c.set(v, (c.get(v) || 0) + 1)
  let best: string | null = null
  let n = 0
  c.forEach((k, v) => { if (k > n) { n = k; best = v } })
  return best
}

export function buildStoryDigest(logs: DigestLog[], period: StoryPeriod, now: Date = new Date()): StoryDigest {
  const windowDays = PERIOD_DAYS[period]
  // 'day' = today (UTC calendar day); others = rolling window ending now.
  const end = now
  const start = period === 'day'
    ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    : new Date(now.getTime() - windowDays * 86400000)

  const inWin = logs.filter(l => {
    if (!USER_TEXT_EVENTS.includes(l.event)) return false
    if (!l.text || !l.text.trim()) return false
    const t = toDate(l.createdAt).getTime()
    return t >= start.getTime() && t <= end.getTime()
  })

  const buckets = new Map<string, DayBucket>()
  for (const l of inWin) {
    const k = dayKey(toDate(l.createdAt))
    const b = buckets.get(k) || { day: k, entries: 0, words: 0, tone: 0 }
    b.entries++
    b.words += words(l.text!).length
    b.tone += tone(l.text!)
    buckets.set(k, b)
  }
  const days = Array.from(buckets.values()).sort((a, b) => a.day.localeCompare(b.day))

  // streak: consecutive days ending at the last active day
  let streak = days.length ? 1 : 0
  for (let i = days.length - 1; i > 0; i--) {
    const gap = (Date.parse(days[i].day) - Date.parse(days[i - 1].day)) / 86400000
    if (gap === 1) streak++
    else break
  }

  const totalWords = days.reduce((a, d) => a + d.words, 0)
  const mean = days.length ? days.reduce((a, d) => a + d.entries, 0) / days.length : 0
  const spikeDays = days.length >= 3 ? days.filter(d => d.entries >= mean * 2 && d.entries >= 3).map(d => d.day) : []

  let peakDay: DayBucket | null = null
  let lowDay: DayBucket | null = null
  for (const d of days) {
    if (!peakDay || d.tone > peakDay.tone) peakDay = d
    if (!lowDay || d.tone < lowDay.tone) lowDay = d
  }
  if (peakDay && lowDay && peakDay.day === lowDay.day) lowDay = null
  if (peakDay && peakDay.tone <= 0) peakDay = null
  if (lowDay && lowDay.tone >= 0) lowDay = null

  let drift: StoryDigest['drift'] = 'unknown'
  if (days.length >= 4) {
    const half = Math.floor(days.length / 2)
    const a = days.slice(0, half).reduce((s, d) => s + d.tone, 0) / half
    const b = days.slice(half).reduce((s, d) => s + d.tone, 0) / (days.length - half)
    drift = b - a > 0.5 ? 'rising' : a - b > 0.5 ? 'falling' : 'steady'
  }

  const freq = new Map<string, number>()
  for (const l of inWin) {
    for (const raw of words(l.text!.toLowerCase())) {
      const w = raw.replace(/[^a-z]/g, '')
      if (w.length < 4 || STOP.has(w)) continue
      freq.set(w, (freq.get(w) || 0) + 1)
    }
  }
  const themes = Array.from(freq.entries())
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([w]) => w)

  const temps = inWin
    .map(l => Number(l.context?.temperature))
    .filter(n => Number.isFinite(n))
    // context temperature is stored in Kelvin by the log context builder when > 150
    .map(n => (n > 150 ? n - 273.15 : n))
  const avgTempC = temps.length ? Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10 : null

  const quotes = [...inWin]
    .sort((a, b) => b.text!.length - a.text!.length)
    .slice(0, 3)
    .map(l => l.text!.trim().replace(/\s+/g, ' ').slice(0, 90))

  return {
    period,
    windowStart: dayKey(start),
    windowEnd: dayKey(end),
    entries: inWin.length,
    words: totalWords,
    activeDays: days.length,
    windowDays,
    streak,
    peakDay,
    lowDay,
    drift,
    spikeDays,
    topCity: mode(inWin.map(l => l.context?.city)),
    topMoon: mode(inWin.map(l => l.context?.astroMoonPhase)),
    avgTempC,
    themes,
    quotes,
  }
}

/** Compact, vendor-ready text block. Deliberately terse (token-cheap). */
export function digestToPromptBlock(d: StoryDigest): string {
  const L: string[] = [
    `PERIOD: ${d.period.toUpperCase()} (${d.windowStart} → ${d.windowEnd})`,
    `VOLUME: ${d.entries} entries, ${d.words} words, ${d.activeDays}/${d.windowDays} active days, streak ${d.streak}`,
    `TONE DRIFT: ${d.drift}`,
  ]
  if (d.peakDay) L.push(`HIGH: ${d.peakDay.day} (${d.peakDay.entries} entries)`)
  if (d.lowDay) L.push(`LOW: ${d.lowDay.day} (${d.lowDay.entries} entries)`)
  if (d.spikeDays.length) L.push(`VOLUME SPIKES: ${d.spikeDays.join(', ')}`)
  if (d.themes.length) L.push(`RECURRING WORDS: ${d.themes.join(', ')}`)
  const ctx = [d.topCity, d.topMoon && `moon ${d.topMoon}`, d.avgTempC !== null && `${d.avgTempC}°C avg`].filter(Boolean)
  if (ctx.length) L.push(`CONTEXT: ${ctx.join(' · ')}`)
  if (d.quotes.length) L.push('NOTABLE ENTRIES:', ...d.quotes.map(q => `- ${q}`))
  return L.join('\n')
}

/**
 * Deterministic fallback story (no AI). Used when the vendor is unreachable
 * or the entry count is too low to be worth a model call.
 */
export function composeDigestStory(d: StoryDigest): string {
  const span = { day: 'today', week: 'this week', month: 'this month', year: 'this year' }[d.period]
  if (d.entries === 0) {
    return `Nothing written ${span} yet. The page is open whenever you are — one line is enough.`
  }
  const parts: string[] = []
  parts.push(
    `You wrote ${d.entries} ${d.entries === 1 ? 'entry' : 'entries'} ${span}` +
    (d.windowDays > 1 ? `, across ${d.activeDays} of ${d.windowDays} days` : '') + '.'
  )
  if (d.streak >= 3) parts.push(`${d.streak} days in a row — the habit is holding.`)
  if (d.themes.length) parts.push(`Words that kept returning: ${d.themes.slice(0, 3).join(', ')}.`)
  if (d.peakDay && d.windowDays > 1) parts.push(`Your lightest day was ${d.peakDay.day}.`)
  if (d.lowDay && d.windowDays > 1) parts.push(`${d.lowDay.day} carried the most weight.`)
  if (d.spikeDays.length) parts.push(`You wrote far more than usual on ${d.spikeDays[0]} — something was moving.`)
  if (d.drift === 'rising') parts.push('The tone of your entries is lifting.')
  if (d.drift === 'falling') parts.push('The tone of your entries has been getting heavier; be gentle with yourself.')
  parts.push('Keep writing — the story sharpens with every line.')
  return parts.join(' ')
}
