/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Log story — pure helpers shared by client and server.
 *
 * `/story [day|week|month|year]` compresses a window of journal entries
 * (each carrying its context metadata) into a deterministic digest. The
 * digest is the only thing handed to the AI vendor, and is also the
 * offline fallback when the vendor is unreachable.
 *
 * Arcade rank is PROVISIONAL: a transparent XP count of care actions,
 * not a clinical or psychological measure.
 */

export type StoryRange = 'day' | 'week' | 'month' | 'year'

export const STORY_RANGES: StoryRange[] = ['day', 'week', 'month', 'year']

export const STORY_RANGE_DAYS: Record<StoryRange, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

/** Parses `/story`, `/story week`, `/story month` ... Defaults to `week`. */
export function parseStoryRange(text: string): StoryRange {
  const m = /(^|\s)\/story\s+(day|week|month|year)\b/i.exec(text || '')
  return m ? (m[2].toLowerCase() as StoryRange) : 'week'
}

export interface StoryLogInput {
  event: string
  text?: string | null
  createdAt: Date | string
  context?: {
    city?: string
    temperature?: number
    humidity?: number
  } | null
  metadata?: Record<string, unknown> | null
}

export interface StoryDigest {
  range: StoryRange
  entryCount: number
  checkinCount: number
  activeDays: number
  topCities: string[]
  avgTempC: number | null
  moods: string[]
  excerpts: string[]
  /** Entry-count change vs. the previous window of equal length. */
  paceChange: 'up' | 'down' | 'flat' | 'n/a'
}

const ENTRY_EVENTS = ['note', 'log_entry', 'journal']
const CHECKIN_EVENTS = [
  'emotional_checkin',
  'memory_answer',
  'self_care_checkin',
  'energy_checkin',
]

// Context temperature is stored in Fahrenheit (see toCelsius in #shared/utils).
const toC = (f: number) => (f - 32) * (5 / 9)

function inWindow(t: number, start: number, end: number) {
  return t >= start && t < end
}

export function compressLogs(
  logs: StoryLogInput[],
  range: StoryRange,
  now: Date = new Date()
): StoryDigest {
  const span = STORY_RANGE_DAYS[range] * 86400000
  const end = now.getTime()
  const start = end - span
  const prevStart = start - span

  const stamp = (l: StoryLogInput) => new Date(l.createdAt).getTime()
  const isEntry = (l: StoryLogInput) =>
    ENTRY_EVENTS.includes(l.event) && !!(l.text || '').trim()

  const current = logs.filter(l => inWindow(stamp(l), start, end))
  const previous = logs.filter(l => inWindow(stamp(l), prevStart, start))
  const entries = current.filter(isEntry)
  const checkins = current.filter(l => CHECKIN_EVENTS.includes(l.event))

  const days = new Set(
    [...entries, ...checkins].map(l => new Date(stamp(l)).toISOString().slice(0, 10))
  )

  const cityCount: Record<string, number> = {}
  const temps: number[] = []
  for (const l of entries) {
    const c = l.context?.city
    if (c) cityCount[c] = (cityCount[c] || 0) + 1
    if (typeof l.context?.temperature === 'number') temps.push(toC(l.context.temperature))
  }

  const moods = checkins
    .filter(l => l.event === 'emotional_checkin')
    .map(l => String(l.metadata?.emotionalState || '').toUpperCase())
    .filter(Boolean)
    .slice(0, 5)

  const prevCount = previous.filter(isEntry).length
  let paceChange: StoryDigest['paceChange'] = 'n/a'
  if (prevCount > 0) {
    const ratio = entries.length / prevCount
    paceChange = ratio > 1.25 ? 'up' : ratio < 0.75 ? 'down' : 'flat'
  }

  return {
    range,
    entryCount: entries.length,
    checkinCount: checkins.length,
    activeDays: days.size,
    topCities: Object.entries(cityCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([c]) => c),
    avgTempC: temps.length
      ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length)
      : null,
    moods,
    excerpts: entries
      .sort((a, b) => stamp(b) - stamp(a))
      .slice(0, 5)
      .map(l => (l.text || '').trim().replace(/\s+/g, ' ').slice(0, 160)),
    paceChange,
  }
}

/** Renders the digest as the compact block sent to the AI vendor. */
export function formatDigest(d: StoryDigest): string {
  return [
    `WINDOW: ${d.range.toUpperCase()}`,
    `ENTRIES: ${d.entryCount}  CHECK-INS: ${d.checkinCount}  ACTIVE DAYS: ${d.activeDays}`,
    `PACE VS PREVIOUS WINDOW: ${d.paceChange}`,
    `PLACES: ${d.topCities.join(', ') || 'unknown'}`,
    `AVG TEMP: ${d.avgTempC === null ? 'unknown' : d.avgTempC + '°C'}`,
    `MOODS: ${d.moods.join(', ') || 'NO DATA'}`,
    'EXCERPTS:',
    ...(d.excerpts.length ? d.excerpts.map(e => `- ${e}`) : ['- (none)']),
  ].join('\n')
}

/** Deterministic offline story — honest about being data-only. */
export function composeOfflineStory(d: StoryDigest): string {
  if (d.entryCount + d.checkinCount === 0) {
    return `Nothing recorded in the last ${d.range}. The next entry starts the thread.`
  }
  const place = d.topCities.length ? ` around ${d.topCities.join(' and ')}` : ''
  const pace =
    d.paceChange === 'up'
      ? ' You wrote more than in the window before.'
      : d.paceChange === 'down'
        ? ' You wrote less than in the window before.'
        : ''
  return (
    `This ${d.range}: ${d.entryCount} entries and ${d.checkinCount} check-ins ` +
    `across ${d.activeDays} days${place}.${pace} ` +
    `The engine is offline, so this is the raw shape of it. The words are still yours.`
  )
}

// ── Arcade (PROVISIONAL) ────────────────────────────────────────────────
export interface ArcadeRank {
  xp: number
  rank: string
  nextAt: number | null
}

const RANKS: Array<[number, string]> = [
  [0, 'SIGNAL'],
  [50, 'OPERATOR'],
  [200, 'NAVIGATOR'],
  [600, 'ARCHITECT'],
  [1500, 'ORACLE'],
]

/** XP = 10 per journal entry + 5 per check-in. */
export function computeArcadeFromCounts(entries: number, checkins: number): ArcadeRank {
  const xp = entries * 10 + checkins * 5
  let rank = RANKS[0][1]
  let nextAt: number | null = RANKS[1][0]
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i][0]) {
      rank = RANKS[i][1]
      nextAt = RANKS[i + 1] ? RANKS[i + 1][0] : null
    }
  }
  return { xp, rank, nextAt }
}

export const STORY_ENTRY_EVENTS = ENTRY_EVENTS
export const STORY_CHECKIN_EVENTS = CHECKIN_EVENTS
