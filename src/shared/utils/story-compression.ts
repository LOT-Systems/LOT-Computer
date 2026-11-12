/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Story Compression — the deterministic half of `/story`.
 *
 * LOT User data → LOT Quantum Intent Engine → AI vendor (Together AI) → stored.
 *
 * Before any model sees a single word, the raw record stream for a time
 * window (day / week / month / year) is compressed into a small, fixed-shape
 * packet: volume, rhythm, mood peaks, environmental context, and the
 * operator's own words at the high and low points. The packet is
 *   1) shown to the operator as the COMPRESSION header,
 *   2) fed to the AI as the only data it may draw from,
 *   3) used to build an offline story when the engine is unavailable.
 *
 * Pure module. No DB, no DOM, no network. Shared by server and client.
 */

export type StoryScope = 'day' | 'week' | 'month' | 'year'

export const STORY_SCOPES: StoryScope[] = ['day', 'week', 'month', 'year']

const SCOPE_ALIASES: Record<string, StoryScope> = {
  day: 'day', today: 'day', d: 'day', '24h': 'day',
  week: 'week', w: 'week', wk: 'week', '7d': 'week',
  month: 'month', m: 'month', mo: 'month', '30d': 'month',
  year: 'year', y: 'year', yr: 'year', '365d': 'year',
}

const SCOPE_DAYS: Record<StoryScope, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

/** Minimal record shape — matches the `Log` model without importing it. */
export interface CompressibleLog {
  event: string
  text?: string | null
  createdAt: Date | string
  context?: Record<string, any> | null
  metadata?: Record<string, any> | null
}

/**
 * Parse the scope argument from a `/story` invocation.
 * `/story` → week · `/story day` · `/story month` · `/story y` …
 * Unknown arguments fall back to `week`.
 */
export function parseStoryScope(text: string | null | undefined): StoryScope {
  if (!text) return 'week'
  const m = text.match(/(?:^|\s)\/story(?:\s+([a-z0-9]+))?/i)
  const arg = m?.[1]?.toLowerCase()
  if (arg && SCOPE_ALIASES[arg]) return SCOPE_ALIASES[arg]
  return 'week'
}

/** Remove the `/story [scope]` command and 📖 marker from log text. */
export function stripStoryCommand(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/(^|\s)\/story(\s+(day|today|d|24h|week|w|wk|7d|month|m|mo|30d|year|y|yr|365d))?(?=\s|$)/gi, ' ')
    .replace(/📖/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function scopeStart(scope: StoryScope, now: Date): Date {
  return new Date(now.getTime() - SCOPE_DAYS[scope] * 24 * 60 * 60 * 1000)
}

/** Emotional valence on a −2…+2 scale. Unknown states read as 0. */
export const MOOD_VALENCE: Record<string, number> = {
  energized: 2, excited: 2, fulfilled: 2, grateful: 2,
  hopeful: 1, calm: 1, content: 1, peaceful: 1,
  uncertain: -1, tired: -1, restless: -1,
  anxious: -2, exhausted: -2, overwhelmed: -2,
}

/** Events that count as the operator's own journal writing. */
export const JOURNAL_EVENTS = ['note', 'log_entry', 'journal']

export type DayPhase = 'NIGHT' | 'DAWN' | 'DAY' | 'EVENING'

function phaseOf(hour: number): DayPhase {
  if (hour < 5) return 'NIGHT'
  if (hour < 9) return 'DAWN'
  if (hour < 18) return 'DAY'
  if (hour < 22) return 'EVENING'
  return 'NIGHT'
}

/** Strip slash commands and AI output markers so only the operator's words remain. */
function cleanJournalText(text: string): string {
  return text
    .split(/\n\n(?=📖|🕯️)/)[0] // drop appended story / scripture blocks
    .replace(/(^|\s)\/[a-z-]+(\s+[a-z0-9]+)?/gi, ' ')
    .replace(/[📖🕯️🎹🎧🌙🧊❗‼️]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Most frequent key. Ties go to the key seen most recently (maps are filled oldest → newest). */
function topOf(counts: Map<string, number>): string | null {
  let best: string | null = null
  let n = 0
  counts.forEach((v, k) => { if (v >= n) { best = k; n = v } })
  return best
}

/** Local hour of the record in the operator's own timezone when known. */
function localHour(at: Date, timeZone?: string | null): number {
  if (timeZone) {
    try {
      const h = new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hourCycle: 'h23' }).format(at)
      const n = parseInt(h, 10)
      if (!isNaN(n)) return n % 24
    } catch {
      /* invalid zone → fall through */
    }
  }
  return at.getHours()
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function toC(f: number): number {
  return ((f - 32) * 5) / 9
}

export interface StoryPeak {
  at: string // ISO
  mood: string | null
  valence: number
  excerpt: string | null
}

export interface StoryCompression {
  scope: StoryScope
  from: string
  to: string
  records: number
  entries: number
  words: number
  activeDays: number
  windowDays: number
  /** Longest run of consecutive active days inside the window. */
  longestRun: number
  dominantPhase: DayPhase | null
  moods: { total: number; dominant: string | null; avgValence: number | null }
  peaks: { high: StoryPeak | null; low: StoryPeak | null }
  /** Change in mood valence: second half of window minus first half. */
  drift: number | null
  care: number
  context: {
    city: string | null
    cities: number
    avgTempC: number | null
    avgHumidity: number | null
    moon: string | null
    zodiac: string | null
  }
  /** Most recent journal fragments, oldest first (max 8, 160 chars). */
  fragments: string[]
}

/**
 * Compress a raw record stream into a StoryCompression for the window
 * ending at `now`. Records outside the window are ignored, so callers may
 * pass a superset.
 */
export function compressLogs(
  logs: CompressibleLog[],
  scope: StoryScope,
  now: Date = new Date()
): StoryCompression {
  const start = scopeStart(scope, now)
  const inWindow = logs
    .map(l => ({ ...l, at: new Date(l.createdAt) }))
    .filter(l => !isNaN(l.at.getTime()) && l.at >= start && l.at <= now)
    .sort((a, b) => a.at.getTime() - b.at.getTime())

  const journal = inWindow
    .filter(l => JOURNAL_EVENTS.includes(l.event))
    .map(l => ({ ...l, clean: cleanJournalText(l.text || '') }))
    .filter(l => l.clean.length > 0)

  const moods = inWindow
    .filter(l => l.event === 'emotional_checkin')
    .map(l => {
      const mood = String(l.metadata?.emotionalState || '').toLowerCase() || null
      return { at: l.at, mood, valence: mood ? MOOD_VALENCE[mood] ?? 0 : 0 }
    })
    .filter(m => m.mood)

  const care = inWindow.filter(l =>
    ['self_care_checkin', 'energy_checkin', 'memory_answer', 'self_care_completed'].includes(l.event)
  ).length

  // Rhythm — active days, longest run, dominant phase of day
  const days = new Set(inWindow.map(l => dayKey(l.at)))
  const sortedDays = Array.from(days).sort()
  let longestRun = 0
  let run = 0
  let prev: number | null = null
  for (const d of sortedDays) {
    const t = Date.parse(d)
    run = prev !== null && t - prev === 86_400_000 ? run + 1 : 1
    longestRun = Math.max(longestRun, run)
    prev = t
  }
  const phaseCounts = new Map<string, number>()
  journal.forEach(l => {
    const p = phaseOf(localHour(l.at, l.context?.timeZone))
    const v = (phaseCounts.get(p) || 0) + 1
    phaseCounts.delete(p) // re-insert so ties resolve to the most recent phase
    phaseCounts.set(p, v)
  })

  // Mood — dominant, average, drift
  const moodCounts = new Map<string, number>()
  const bump = (map: Map<string, number>, k: string) => {
    const v = (map.get(k) || 0) + 1
    map.delete(k) // re-insert so iteration order tracks recency
    map.set(k, v)
  }
  moods.forEach(m => bump(moodCounts, m.mood!))
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)
  const avgValence = avg(moods.map(m => m.valence))
  let drift: number | null = null
  if (moods.length >= 4) {
    const mid = Math.floor(moods.length / 2)
    const a = avg(moods.slice(0, mid).map(m => m.valence))!
    const b = avg(moods.slice(mid).map(m => m.valence))!
    drift = Math.round((b - a) * 10) / 10
  }

  // Peaks — highest and lowest mood, paired with the nearest journal words
  const nearestExcerpt = (at: Date): string | null => {
    let best: { d: number; text: string } | null = null
    for (const j of journal) {
      const d = Math.abs(j.at.getTime() - at.getTime())
      if (d <= 12 * 3600_000 && (!best || d < best.d)) best = { d, text: j.clean }
    }
    return best ? best.text.slice(0, 160) : null
  }
  const toPeak = (m: (typeof moods)[number]): StoryPeak => ({
    at: m.at.toISOString(),
    mood: m.mood,
    valence: m.valence,
    excerpt: nearestExcerpt(m.at),
  })
  let high: StoryPeak | null = null
  let low: StoryPeak | null = null
  if (moods.length) {
    const hi = moods.reduce((a, b) => (b.valence >= a.valence ? b : a))
    const lo = moods.reduce((a, b) => (b.valence <= a.valence ? b : a))
    if (hi.valence > 0) high = toPeak(hi)
    if (lo.valence < 0) low = toPeak(lo)
  }

  // Environment — the context every record carries
  const cityCounts = new Map<string, number>()
  const moonCounts = new Map<string, number>()
  const zodiacCounts = new Map<string, number>()
  const temps: number[] = []
  const hums: number[] = []
  inWindow.forEach(l => {
    const c = l.context || {}
    if (c.city) cityCounts.set(c.city, (cityCounts.get(c.city) || 0) + 1)
    if (c.astroMoonPhase) moonCounts.set(c.astroMoonPhase, (moonCounts.get(c.astroMoonPhase) || 0) + 1)
    if (c.astroWesternZodiac) zodiacCounts.set(c.astroWesternZodiac, (zodiacCounts.get(c.astroWesternZodiac) || 0) + 1)
    // Weather temperature is stored in Fahrenheit (see toCelsius usage in Logs.tsx)
    if (typeof c.temperature === 'number') temps.push(toC(c.temperature))
    if (typeof c.humidity === 'number') hums.push(c.humidity)
  })
  const r = (n: number | null) => (n === null ? null : Math.round(n))

  return {
    scope,
    from: start.toISOString(),
    to: now.toISOString(),
    records: inWindow.length,
    entries: journal.length,
    words: journal.reduce((n, l) => n + l.clean.split(/\s+/).filter(Boolean).length, 0),
    activeDays: days.size,
    windowDays: SCOPE_DAYS[scope],
    longestRun,
    dominantPhase: (topOf(phaseCounts) as DayPhase | null) ?? null,
    moods: {
      total: moods.length,
      dominant: topOf(moodCounts),
      avgValence: avgValence === null ? null : Math.round(avgValence * 10) / 10,
    },
    peaks: { high, low },
    drift,
    care,
    context: {
      city: topOf(cityCounts),
      cities: cityCounts.size,
      avgTempC: r(avg(temps)),
      avgHumidity: r(avg(hums)),
      moon: topOf(moonCounts),
      zodiac: topOf(zodiacCounts),
    },
    fragments: journal.slice(-8).map(l => l.clean.slice(0, 160)),
  }
}

const pad = (label: string) => label.padEnd(16, ' ')

/** Terminal-grid header lines shown above the story. */
export function formatCompressionHeader(c: StoryCompression): string[] {
  const lines = [
    `${pad('SCOPE')}${c.scope.toUpperCase()} · ${c.windowDays}D`,
    `${pad('RECORDS')}${c.records} · ${c.entries} ENTRIES · ${c.words} WORDS`,
    `${pad('PRESENCE')}${c.activeDays}/${c.windowDays} DAYS · RUN ${c.longestRun}`,
  ]
  if (c.dominantPhase) lines.push(`${pad('RHYTHM')}${c.dominantPhase}`)
  if (c.moods.dominant) {
    const d = c.drift === null ? '' : ` · DRIFT ${c.drift > 0 ? '+' : ''}${c.drift}`
    lines.push(`${pad('MOOD')}${c.moods.dominant.toUpperCase()}${d}`)
  }
  if (c.peaks.high) lines.push(`${pad('HIGH')}${c.peaks.high.mood!.toUpperCase()} · ${c.peaks.high.at.slice(0, 10)}`)
  if (c.peaks.low) lines.push(`${pad('LOW')}${c.peaks.low.mood!.toUpperCase()} · ${c.peaks.low.at.slice(0, 10)}`)
  const env: string[] = []
  if (c.context.city) env.push(c.context.city.toUpperCase())
  if (c.context.avgTempC !== null) env.push(`${c.context.avgTempC}°C`)
  if (c.context.avgHumidity !== null) env.push(`${c.context.avgHumidity}%`)
  if (env.length) lines.push(`${pad('FIELD')}${env.join(' · ')}`)
  if (c.context.moon) lines.push(`${pad('SKY')}${c.context.moon.toUpperCase()}`)
  return lines
}

/** The data block the AI is allowed to draw from. */
export function formatCompressionForPrompt(c: StoryCompression): string {
  const peak = (p: StoryPeak | null) =>
    p ? `${p.mood} on ${p.at.slice(0, 10)}${p.excerpt ? ` — they wrote: "${p.excerpt}"` : ''}` : 'none recorded'
  return [
    `WINDOW: last ${c.windowDays} day(s) (${c.scope})`,
    `VOLUME: ${c.records} records, ${c.entries} journal entries, ${c.words} words`,
    `PRESENCE: active ${c.activeDays} of ${c.windowDays} days, longest consecutive run ${c.longestRun}`,
    `RHYTHM: writes mostly at ${c.dominantPhase ? c.dominantPhase.toLowerCase() : 'unknown time'}`,
    `MOOD: dominant ${c.moods.dominant || 'unknown'}, average valence ${c.moods.avgValence ?? 'n/a'} (−2..+2), drift ${c.drift ?? 'n/a'}`,
    `HIGH PEAK: ${peak(c.peaks.high)}`,
    `LOW PEAK: ${peak(c.peaks.low)}`,
    `SELF-CARE ACTIONS: ${c.care}`,
    `FIELD: ${c.context.city || 'unknown city'}${c.context.cities > 1 ? ` (+${c.context.cities - 1} other places)` : ''}, ${c.context.avgTempC ?? '?'}°C avg, ${c.context.avgHumidity ?? '?'}% humidity, moon mostly ${c.context.moon || 'unknown'}`,
    `JOURNAL FRAGMENTS (oldest first):`,
    ...(c.fragments.length ? c.fragments.map(f => `- ${f}`) : ['- (none)']),
  ].join('\n')
}

const SCOPE_WORD: Record<StoryScope, string> = {
  day: 'today',
  week: 'this week',
  month: 'this month',
  year: 'this year',
}

/**
 * Deterministic story used when the AI engine is offline or the operator
 * lacks Usership. Built only from the compression — never invents detail.
 */
export function fallbackStory(c: StoryCompression): string {
  const when = SCOPE_WORD[c.scope]
  if (c.records === 0) {
    return `Nothing was recorded ${when}. The window is open; the first entry starts the story.`
  }
  const parts: string[] = []
  parts.push(
    `${when[0].toUpperCase()}${when.slice(1)} you showed up on ${c.activeDays} of ${c.windowDays} day${c.windowDays > 1 ? 's' : ''}` +
      (c.entries ? ` and wrote ${c.entries} ${c.entries === 1 ? 'entry' : 'entries'}` : '') +
      (c.context.city ? `, mostly from ${c.context.city}` : '') +
      '.'
  )
  const PHASE_WORD: Record<DayPhase, string> = {
    NIGHT: 'at night',
    DAWN: 'at dawn',
    DAY: 'during the day',
    EVENING: 'in the evening',
  }
  if (c.dominantPhase) parts.push(`Your words came most often ${PHASE_WORD[c.dominantPhase]}.`)
  if (c.moods.dominant) parts.push(`The mood that returned most was ${c.moods.dominant}.`)
  if (c.peaks.high) parts.push(`The high point: ${c.peaks.high.mood}${c.peaks.high.excerpt ? ` — "${c.peaks.high.excerpt}"` : ''}.`)
  if (c.peaks.low) parts.push(`The low point: ${c.peaks.low.mood}${c.peaks.low.excerpt ? ` — "${c.peaks.low.excerpt}"` : ''}.`)
  if (c.drift !== null && Math.abs(c.drift) >= 0.5) {
    parts.push(c.drift > 0 ? 'The second half lifted.' : 'The second half asked more of you.')
  }
  if (c.care) parts.push(`You tended yourself ${c.care} time${c.care === 1 ? '' : 's'}.`)
  return parts.join(' ')
}
