/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * STORY COMPRESSION — day / week / month / year.
 *
 * Turns a window of raw Log rows (journal notes + check-ins, each carrying
 * context metadata: weather, place, moon, hour) into a small deterministic
 * DIGEST. The digest is what travels to the AI vendor (Together AI) — never
 * the raw archive — and it also powers an offline fallback story, so
 * /story never returns nothing.
 *
 *   LOT User data → [digest] → LOT Quantum Intent Engine → Together AI
 *                                                    → stored story
 *
 * Pure module. Deterministic for a given (rows, range, now).
 */

export type StoryRange = 'day' | 'week' | 'month' | 'year'

export const STORY_RANGES: StoryRange[] = ['day', 'week', 'month', 'year']

export const STORY_RANGE_DAYS: Record<StoryRange, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

const RANGE_ALIASES: Record<string, StoryRange> = {
  day: 'day', today: 'day', daily: 'day', d: 'day',
  week: 'week', weekly: 'week', w: 'week',
  month: 'month', monthly: 'month', m: 'month',
  year: 'year', yearly: 'year', annual: 'year', y: 'year',
}

/**
 * Reads the range argument following "/story". Unknown or missing
 * argument → 'day'. Safe on arbitrary text (journal prose containing
 * "/story" mid-sentence resolves to 'day').
 */
export function parseStoryRange(text: string | null | undefined): StoryRange {
  if (!text) return 'day'
  const m = /(?:^|\s)\/story(?:\s+([a-z]+))?/i.exec(text)
  const arg = m?.[1]?.toLowerCase()
  return (arg && RANGE_ALIASES[arg]) || 'day'
}

/** Removes the /story command, its range argument and the 📖 emoji. */
export function stripStoryCommand(text: string): string {
  return text
    .replace(/(^|\s)\/story(?:[ \t]+(?:day|today|daily|week|weekly|month|monthly|year|yearly|annual|d|w|m|y))?(?=\s|$)/gi, '$1')
    .replace(/📖/g, '')
    .trim()
}

export interface StoryRow {
  event: string
  text?: string | null
  metadata?: Record<string, any> | null
  context?: Record<string, any> | null
  createdAt: Date | string
}

export interface StoryDigest {
  range: StoryRange
  windowDays: number
  /** Journal entries (event = note / journal). */
  entries: number
  words: number
  activeDays: number
  /** activeDays / windowDays, 0–1. */
  coverage: number
  checkins: number
  /** Mood tally, most frequent first. */
  moods: Array<{ mood: string; count: number }>
  /** Context aggregates (metadata captured at the moment of each entry). */
  avgTempC: number | null
  avgHumidity: number | null
  places: string[]
  skies: string[]
  moonPhases: string[]
  /** Local hour (0–23) with most entries, or null. */
  peakHour: number | null
  /** Dates (YYYY-MM-DD) whose entry volume spiked ≥2× the active-day mean (min 3). */
  spikeDays: string[]
  /** Pattern change: 'rising' | 'falling' | 'steady' comparing first vs second half of window by entry count. */
  trend: 'rising' | 'falling' | 'steady' | 'insufficient'
  /** Representative excerpts (≤ 8, ≤ 220 chars), chronological. */
  excerpts: string[]
}

/**
 * Generated blocks the Log appends to the note text (/story → 📖, /prayer → 🕯️).
 * They are system output, not the operator's words — drop them so stories
 * never compress previous stories.
 */
export function stripGeneratedBlocks(text: string): string {
  return text
    .split(/\n{2,}/)
    .filter(p => !/^\s*(📖|🕯️?)/.test(p))
    .join('\n\n')
    .trim()
}

const JOURNAL_EVENTS = new Set(['note', 'journal', 'log_entry'])
const MAX_EXCERPTS = 8
const EXCERPT_CHARS = 220

function toDate(v: Date | string): Date {
  return v instanceof Date ? v : new Date(v)
}

/** YYYY-MM-DD in the row's own timezone when known, else UTC. */
export function dayKey(date: Date, timeZone?: string | null): string {
  if (timeZone) {
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
      }).format(date)
    } catch { /* fall through to UTC */ }
  }
  return date.toISOString().slice(0, 10)
}

function localHour(date: Date, timeZone?: string | null): number {
  if (timeZone) {
    try {
      const h = new Intl.DateTimeFormat('en-GB', {
        timeZone, hour: '2-digit', hour12: false,
      }).format(date)
      const n = parseInt(h, 10)
      if (!Number.isNaN(n)) return n % 24
    } catch { /* fall through */ }
  }
  return date.getUTCHours()
}

function topN(counts: Map<string, number>, n: number): string[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([k]) => k)
}

const mean = (xs: number[]): number | null =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null

/** Kelvin → °C (log context stores Kelvin; see shared toCelsius). */
const kelvinToC = (k: number): number => k - 273.15

export function buildStoryDigest(
  rows: StoryRow[],
  range: StoryRange,
  now: Date = new Date()
): StoryDigest {
  const windowDays = STORY_RANGE_DAYS[range]
  const startMs = now.getTime() - windowDays * 86_400_000
  const inWindow = rows
    .map(r => ({ r, at: toDate(r.createdAt) }))
    .filter(({ at }) => !Number.isNaN(at.getTime()) && at.getTime() >= startMs && at.getTime() <= now.getTime())
    .sort((a, b) => a.at.getTime() - b.at.getTime())

  const journal = inWindow
    .map(x => ({ ...x, r: { ...x.r, text: stripGeneratedBlocks(x.r.text || '') } }))
    .filter(({ r }) => JOURNAL_EVENTS.has(r.event) && r.text)
  const checkins = inWindow.filter(({ r }) => r.event === 'emotional_checkin')

  // Per-day entry volume
  const perDay = new Map<string, number>()
  const hourCounts = new Map<number, number>()
  let words = 0
  for (const { r, at } of journal) {
    const tz = r.context?.timeZone as string | undefined
    const k = dayKey(at, tz)
    perDay.set(k, (perDay.get(k) || 0) + 1)
    const h = localHour(at, tz)
    hourCounts.set(h, (hourCounts.get(h) || 0) + 1)
    words += (r.text || '').trim().split(/\s+/).filter(Boolean).length
  }
  const activeDays = perDay.size

  // Moods
  const moodCounts = new Map<string, number>()
  for (const { r } of checkins) {
    const m = String(r.metadata?.emotionalState || '').trim().toLowerCase()
    if (m) moodCounts.set(m, (moodCounts.get(m) || 0) + 1)
  }
  const moods = [...moodCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([mood, count]) => ({ mood, count }))

  // Context aggregates from every contextual row in window
  const temps: number[] = []
  const hums: number[] = []
  const places = new Map<string, number>()
  const skies = new Map<string, number>()
  const moons = new Map<string, number>()
  for (const { r } of inWindow) {
    const c = r.context
    if (!c) continue
    if (typeof c.temperature === 'number' && c.temperature > 150) temps.push(kelvinToC(c.temperature))
    if (typeof c.humidity === 'number') hums.push(c.humidity)
    if (c.city) places.set(String(c.city), (places.get(String(c.city)) || 0) + 1)
    if (c.weatherDescription) skies.set(String(c.weatherDescription).toLowerCase(), (skies.get(String(c.weatherDescription).toLowerCase()) || 0) + 1)
    if (c.astroMoonPhase) moons.set(String(c.astroMoonPhase), (moons.get(String(c.astroMoonPhase)) || 0) + 1)
  }

  // Spikes
  const meanPerDay = activeDays ? journal.length / activeDays : 0
  const spikeDays = [...perDay.entries()]
    .filter(([, n]) => n >= 3 && n >= meanPerDay * 2)
    .map(([k]) => k)
    .sort()

  // Trend: first half vs second half entry counts (needs ≥ 4 entries, ≥ 2-day window)
  let trend: StoryDigest['trend'] = 'insufficient'
  if (windowDays >= 2 && journal.length >= 4) {
    const mid = startMs + (windowDays * 86_400_000) / 2
    const first = journal.filter(({ at }) => at.getTime() < mid).length
    const second = journal.length - first
    if (second >= first * 1.5 && second - first >= 2) trend = 'rising'
    else if (first >= second * 1.5 && first - second >= 2) trend = 'falling'
    else trend = 'steady'
  }

  // Excerpts: longest entry + evenly spaced samples, chronological, de-duplicated
  const picks = new Set<number>()
  if (journal.length) {
    let longest = 0
    journal.forEach(({ r }, i) => {
      if ((r.text || '').length > (journal[longest].r.text || '').length) longest = i
    })
    picks.add(longest)
    const slots = Math.min(MAX_EXCERPTS, journal.length)
    for (let s = 0; s < slots && picks.size < MAX_EXCERPTS; s++) {
      picks.add(Math.floor((s * journal.length) / slots))
    }
  }
  const excerpts = [...picks].sort((a, b) => a - b).map(i => {
    const t = (journal[i].r.text || '').replace(/\s+/g, ' ').trim()
    return t.length > EXCERPT_CHARS ? t.slice(0, EXCERPT_CHARS - 1) + '…' : t
  })

  const peak = [...hourCounts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]
  const avgT = mean(temps)
  const avgH = mean(hums)

  return {
    range,
    windowDays,
    entries: journal.length,
    words,
    activeDays,
    coverage: Math.round((activeDays / windowDays) * 100) / 100,
    checkins: checkins.length,
    moods,
    avgTempC: avgT === null ? null : Math.round(avgT),
    avgHumidity: avgH === null ? null : Math.round(avgH),
    places: topN(places, 3),
    skies: topN(skies, 3),
    moonPhases: topN(moons, 2),
    peakHour: peak ? peak[0] : null,
    spikeDays,
    trend,
    excerpts,
  }
}

/** Plain-text digest block injected into the AI prompt. */
export function renderDigestBlock(d: StoryDigest): string {
  const lines = [
    `WINDOW: ${d.range.toUpperCase()} (${d.windowDays}d)`,
    `ENTRIES: ${d.entries} · WORDS: ${d.words} · ACTIVE DAYS: ${d.activeDays}/${d.windowDays} (${Math.round(d.coverage * 100)}%)`,
    `CHECK-INS: ${d.checkins}${d.moods.length ? ' · MOODS: ' + d.moods.slice(0, 5).map(m => `${m.mood}×${m.count}`).join(', ') : ''}`,
    `TREND: ${d.trend}${d.spikeDays.length ? ' · SPIKE DAYS: ' + d.spikeDays.slice(0, 5).join(', ') : ''}`,
    `PEAK HOUR: ${d.peakHour === null ? 'n/a' : String(d.peakHour).padStart(2, '0') + ':00'}`,
    `CONTEXT: ${[
      d.avgTempC !== null ? `${d.avgTempC}°C avg` : '',
      d.avgHumidity !== null ? `${d.avgHumidity}% humidity` : '',
      d.skies.join('/'),
      d.places.join('/'),
      d.moonPhases.join('/'),
    ].filter(Boolean).join(' · ') || 'n/a'}`,
    'EXCERPTS:',
    ...(d.excerpts.length ? d.excerpts.map(e => `- ${e}`) : ['- (none)']),
  ]
  return lines.join('\n')
}

const RANGE_NOUN: Record<StoryRange, string> = {
  day: 'day', week: 'week', month: 'month', year: 'year',
}

/**
 * Offline story — used when the AI vendor is unreachable or the window
 * is empty. Plain, grounded, second person, no invented facts.
 */
export function composeLocalStory(d: StoryDigest): string {
  const noun = RANGE_NOUN[d.range]
  if (d.entries === 0 && d.checkins === 0) {
    return `Nothing is on the record for this ${noun} yet. One line is enough to begin — the system reads the moment around it.`
  }
  const parts: string[] = []
  parts.push(
    `This ${noun} you wrote ${d.entries} ${d.entries === 1 ? 'entry' : 'entries'} across ${d.activeDays} of ${d.windowDays} ${d.windowDays === 1 ? 'day' : 'days'}.`
  )
  if (d.moods.length) {
    parts.push(`The mood you named most was ${d.moods[0].mood}.`)
  }
  const ctx: string[] = []
  if (d.skies[0]) ctx.push(`${d.skies[0]} skies`)
  if (d.avgTempC !== null) ctx.push(`around ${d.avgTempC}°C`)
  if (d.places[0]) ctx.push(`near ${d.places[0]}`)
  if (ctx.length) parts.push(`The world around you was ${ctx.join(', ')}.`)
  if (d.trend === 'rising') parts.push('Your writing picked up toward the end.')
  else if (d.trend === 'falling') parts.push('Your writing grew quieter toward the end.')
  if (d.spikeDays.length) parts.push(`${d.spikeDays[0]} stood out as the loudest day.`)
  parts.push('The record is yours to keep adding to.')
  return parts.join(' ')
}
