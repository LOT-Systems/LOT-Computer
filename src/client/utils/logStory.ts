/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log Story — deterministic local compression of the Log record.
 *
 * /story <day|week|month|year> compresses every Journal entry in the window
 * (with its context metadata) into a short, countable story: volume, themes,
 * mood arc, ambient context, high/low peaks, and SPIKES — the pattern-change
 * signals the machine may later follow up on.
 *
 * Runs entirely on the client from the already-loaded log list: no network,
 * no vendor, instant, works offline. The AI narrative (Together AI, via
 * /api/story) layers on top of this and falls back to it when unavailable.
 *
 * Honest by design: every number here is a count, a median or a ratio of
 * real entries. Tone scoring uses a small fixed lexicon and is labelled as
 * such — it is a heuristic, not sentiment analysis.
 */

import {
  ENTRY_EVENTS,
  cleanEntryText,
  dayKey,
  wordCount,
} from '#client/utils/logArcade'

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'

export const STORY_PERIODS: readonly StoryPeriod[] = ['day', 'week', 'month', 'year']
export const DEFAULT_STORY_PERIOD: StoryPeriod = 'week'

const PERIOD_DAYS: Record<StoryPeriod, number> = { day: 1, week: 7, month: 30, year: 365 }
const DAY_MS = 86_400_000

export interface StoryLogInput {
  id?: string
  text: string | null
  event: string
  metadata?: Record<string, any> | null
  context?: Record<string, any> | null
  createdAt: string | Date
}

export type SpikeKind = 'VOLUME' | 'DEPTH' | 'QUIET' | 'LOW-TONE'

export interface Spike {
  kind: SpikeKind
  /** day key (YYYY-MM-DD) the spike is anchored to; window start for QUIET */
  day: string
  detail: string
}

export interface StoryCompression {
  period: StoryPeriod
  windowDays: number
  from: string
  to: string
  entries: number
  words: number
  activeDays: number
  /** entries in the equally long window immediately before this one */
  previousEntries: number
  themes: string[]
  moods: Array<{ state: string; count: number }>
  context: { avgTempC: number | null; topCity: string | null; topMoon: string | null }
  high: { day: string; excerpt: string } | null
  low: { day: string; excerpt: string } | null
  spikes: Spike[]
}

const STOPWORDS = new Set((
  'the a an and or but if then so of to in on at by for with from as is am are was were be been being ' +
  'it its this that these those i me my mine we our you your he she they them his her their ' +
  'not no yes do did does done have has had will would can could should just very really also ' +
  'about into over than too out up down more most some any all one two like get got going went ' +
  'today now still well what when where who why how there here again'
).split(' '))

const LOW_WORDS = [
  'tired', 'exhausted', 'drained', 'anxious', 'anxiety', 'stressed', 'overwhelmed', 'sad',
  'alone', 'lonely', 'angry', 'afraid', 'scared', 'panic', 'pain', 'hurt', 'sick', 'insomnia',
  'hopeless', 'numb', 'worried', 'worry', 'cry', 'crying', 'bad', 'awful', 'heavy',
]
const HIGH_WORDS = [
  'happy', 'grateful', 'gratitude', 'calm', 'rested', 'strong', 'energy', 'energized', 'clear',
  'peace', 'peaceful', 'joy', 'proud', 'love', 'good', 'great', 'better', 'light', 'free',
  'focused', 'hopeful', 'alive', 'thankful',
]

function tokens(text: string): string[] {
  return (text.toLowerCase().match(/[a-zа-яё']+/gi) || []).map(t => t.replace(/^'+|'+$/g, ''))
}

/** Heuristic tone: (+high words) - (low words). Fixed lexicon, English only. */
export function toneScore(text: string): number {
  let score = 0
  for (const t of tokens(text)) {
    if (HIGH_WORDS.includes(t)) score += 1
    else if (LOW_WORDS.includes(t)) score -= 1
  }
  return score
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const s = [...values].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

function topByCount<T extends string>(items: T[], n: number): Array<[T, number]> {
  const counts = new Map<T, number>()
  for (const i of items) counts.set(i, (counts.get(i) || 0) + 1)
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .slice(0, n)
}

function excerpt(text: string, max = 90): string {
  return text.length <= max ? text : text.slice(0, max - 1).trimEnd() + '…'
}

export function parseStoryPeriod(text: string): StoryPeriod {
  const m = text.toLowerCase().match(/(^|\s)\/story\s+(day|week|month|year)\b/)
  return m ? (m[2] as StoryPeriod) : DEFAULT_STORY_PERIOD
}

interface Entry {
  day: string
  at: number
  clean: string
  words: number
  tone: number
}

function toEntries(logs: readonly StoryLogInput[]): Entry[] {
  const out: Entry[] = []
  for (const l of logs) {
    if (!ENTRY_EVENTS.includes(l.event)) continue
    const clean = cleanEntryText(l.text)
    if (!clean) continue
    const d = new Date(l.createdAt)
    out.push({ day: dayKey(d), at: d.getTime(), clean, words: wordCount(clean), tone: toneScore(clean) })
  }
  return out.sort((a, b) => a.at - b.at)
}

export function compressLogs(
  logs: readonly StoryLogInput[],
  period: StoryPeriod,
  now: Date = new Date()
): StoryCompression {
  const windowDays = PERIOD_DAYS[period]
  const end = now.getTime()
  const start = end - windowDays * DAY_MS
  const prevStart = start - windowDays * DAY_MS

  const all = toEntries(logs)
  const inWindow = all.filter(e => e.at > start && e.at <= end)
  const previousEntries = all.filter(e => e.at > prevStart && e.at <= start).length

  const perDay = new Map<string, Entry[]>()
  for (const e of inWindow) perDay.set(e.day, [...(perDay.get(e.day) || []), e])

  // Themes: most frequent non-stopword tokens (3+ chars, seen 2+ times).
  const themeTokens: string[] = []
  for (const e of inWindow) {
    for (const t of tokens(e.clean)) if (t.length >= 3 && !STOPWORDS.has(t)) themeTokens.push(t)
  }
  const themes = topByCount(themeTokens, 5).filter(([, c]) => c >= 2).map(([t]) => t)

  // Moods from emotional check-ins in the window.
  const moodStates: string[] = []
  const windowLogs = logs.filter(l => {
    const t = new Date(l.createdAt).getTime()
    return t > start && t <= end
  })
  for (const l of windowLogs) {
    if (l.event === 'emotional_checkin') {
      const s = String(l.metadata?.emotionalState || '').toUpperCase()
      if (s) moodStates.push(s)
    }
  }
  const moods = topByCount(moodStates, 3).map(([state, count]) => ({ state, count }))

  // Ambient context captured on every record (weather, place, moon).
  const temps: number[] = []
  const cities: string[] = []
  const moons: string[] = []
  for (const l of windowLogs) {
    const c = l.context
    if (!c) continue
    if (typeof c.temperature === 'number' && c.temperature > 0) temps.push(c.temperature - 273.15)
    if (c.city) cities.push(String(c.city))
    if (c.astroMoonPhase) moons.push(String(c.astroMoonPhase))
  }
  const context = {
    avgTempC: temps.length ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length) : null,
    topCity: topByCount(cities, 1)[0]?.[0] ?? null,
    topMoon: topByCount(moons, 1)[0]?.[0] ?? null,
  }

  // High / low peaks: best and worst heuristic tone, only when tone is non-neutral.
  let high: StoryCompression['high'] = null
  let low: StoryCompression['low'] = null
  const best = [...inWindow].sort((a, b) => b.tone - a.tone || b.at - a.at)[0]
  const worst = [...inWindow].sort((a, b) => a.tone - b.tone || b.at - a.at)[0]
  if (best && best.tone > 0) high = { day: best.day, excerpt: excerpt(best.clean) }
  if (worst && worst.tone < 0) low = { day: worst.day, excerpt: excerpt(worst.clean) }

  // Spikes — pattern-change signals the machine can follow up on.
  const spikes: Spike[] = []
  const dayCounts = Array.from(perDay.entries()).map(([day, es]) => [day, es.length] as const)
  if (dayCounts.length >= 3) {
    const mean = dayCounts.reduce((a, [, c]) => a + c, 0) / dayCounts.length
    for (const [day, c] of dayCounts) {
      if (c >= 3 && c >= 2 * mean) {
        spikes.push({ kind: 'VOLUME', day, detail: `${c} entries vs ${mean.toFixed(1)} avg per active day` })
      }
    }
  }
  const medWords = median(inWindow.map(e => e.words))
  for (const e of inWindow) {
    if (e.words >= 40 && e.words >= 2.5 * medWords && inWindow.length >= 4) {
      spikes.push({ kind: 'DEPTH', day: e.day, detail: `${e.words} words vs ${medWords} median` })
    }
  }
  if (previousEntries >= 4 && inWindow.length * 2 < previousEntries) {
    spikes.push({
      kind: 'QUIET',
      day: dayKey(new Date(start + DAY_MS)),
      detail: `${inWindow.length} entries vs ${previousEntries} in prior ${windowDays}d`,
    })
  }
  for (const [day, es] of Array.from(perDay.entries())) {
    const tone = es.reduce((a, e) => a + e.tone, 0)
    if (tone <= -3) spikes.push({ kind: 'LOW-TONE', day, detail: `tone ${tone} (heuristic lexicon)` })
  }
  spikes.sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0))

  return {
    period,
    windowDays,
    from: dayKey(new Date(start + DAY_MS)),
    to: dayKey(now),
    entries: inWindow.length,
    words: inWindow.reduce((a, e) => a + e.words, 0),
    activeDays: perDay.size,
    previousEntries,
    themes,
    moods,
    context,
    high,
    low,
    spikes,
  }
}

/** Terminal-grid text for the Log. Line prefixes are fixed-width for alignment. */
export function renderStory(s: StoryCompression): string {
  const lines: string[] = []
  lines.push(`STORY           ${s.period.toUpperCase()} · ${s.from} → ${s.to}`)
  if (s.entries === 0) {
    lines.push('RECORD          NO ENTRIES IN WINDOW')
    lines.push('NEXT            WRITE ONE LINE. THE SYSTEM WILL REMEMBER THE MOMENT.')
    return lines.join('\n')
  }
  lines.push(`ENTRIES         ${s.entries} (${s.activeDays} ACTIVE DAYS · ${s.words} WORDS)`)
  const delta = s.entries - s.previousEntries
  if (s.previousEntries > 0) {
    lines.push(`VS PRIOR        ${delta >= 0 ? '+' : ''}${delta} (${s.previousEntries} IN PRIOR ${s.windowDays}D)`)
  }
  if (s.themes.length) lines.push(`THEMES          ${s.themes.join(' · ').toUpperCase()}`)
  if (s.moods.length) {
    lines.push(`MOOD            ${s.moods.map(m => `${m.state} x${m.count}`).join(' · ')}`)
  }
  const ctx: string[] = []
  if (s.context.avgTempC !== null) ctx.push(`${s.context.avgTempC}°C AVG`)
  if (s.context.topCity) ctx.push(s.context.topCity.toUpperCase())
  if (s.context.topMoon) ctx.push(s.context.topMoon.toUpperCase())
  if (ctx.length) lines.push(`CONTEXT         ${ctx.join(' · ')}`)
  if (s.high) lines.push(`HIGH            ${s.high.day} — "${s.high.excerpt}"`)
  if (s.low) lines.push(`LOW             ${s.low.day} — "${s.low.excerpt}"`)
  if (s.spikes.length) {
    lines.push('')
    lines.push('SPIKES — FOLLOW-UP CANDIDATES')
    for (const sp of s.spikes.slice(0, 5)) {
      lines.push(`${sp.kind.padEnd(15)} ${sp.day} · ${sp.detail}`)
    }
  } else {
    lines.push('SPIKES          NONE — PATTERN STABLE')
  }
  return lines.join('\n')
}
