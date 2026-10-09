/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Story compression + arcade rank (pure, deterministic).
 *
 * Pipeline position:
 *   LOT user data -> [digest: THIS MODULE] -> Quantum Intent Engine
 *   -> AI vendor (Together AI) -> LOT personalized data stored
 *
 * The digest is computed WITHOUT any model call. The model only
 * narrates it. That keeps the compression auditable, cheap, and means
 * /story still works (via composeLocalStory) when the vendor is down.
 *
 * Privacy: the digest carries counts, mood labels, places and
 * weather — never raw journal text beyond short excerpts the caller
 * explicitly passes in.
 */

import type { StoryPeriod } from './logCommands'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DigestEntry {
  event: string
  text?: string | null
  createdAt: string | Date
  context?: {
    temperature?: number | null // Kelvin, as stored by getLogContext
    humidity?: number | null
    weatherDescription?: string | null
    city?: string | null
    astroMoonPhase?: string | null
  } | null
  metadata?: Record<string, any> | null
}

export type DayPart = 'night' | 'morning' | 'afternoon' | 'evening'

export interface StoryDigest {
  period: StoryPeriod
  windowDays: number
  entryCount: number
  activeDays: number
  /** Consecutive days ending today with at least one entry. */
  streak: number
  moods: Array<{ mood: string; count: number }>
  dayParts: Record<DayPart, number>
  cities: string[]
  weather: string[]
  avgTempC: number | null
  moonPhases: string[]
  /** Short excerpts, newest first, already truncated. */
  excerpts: string[]
  /** Human-readable spikes / pattern changes found in the window. */
  signals: string[]
}

export interface ArcadeState {
  xp: number
  level: number
  rank: string
  /** XP still needed to reach the next level. */
  xpToNext: number
  /** Name of the next rank, or null at the top. */
  nextRank: string | null
  /** 0..1 progress through the current level. */
  progress: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Events that count as a person's own journal entry. */
export const JOURNAL_EVENTS = ['log_entry', 'journal']

/** Events that carry a mood label in metadata.emotionalState. */
const MOOD_EVENTS = ['emotional_checkin']

export const PERIOD_DAYS: Record<StoryPeriod, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

const DAY_MS = 86_400_000

// ---------------------------------------------------------------------------
// Time helpers (timezone-aware via Intl, UTC fallback)
// ---------------------------------------------------------------------------

function localParts(d: Date, timeZone?: string | null): { key: string; hour: number } {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone || 'UTC',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', hourCycle: 'h23',
    }).formatToParts(d)
    const get = (t: string) => parts.find(p => p.type === t)?.value || '00'
    return { key: `${get('year')}-${get('month')}-${get('day')}`, hour: parseInt(get('hour'), 10) }
  } catch {
    return localParts(d, 'UTC')
  }
}

function dayPartOf(hour: number): DayPart {
  if (hour < 6) return 'night'
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

function dayKeyShift(key: string, deltaDays: number): string {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + deltaDays)).toISOString().slice(0, 10)
}

function topN(counts: Map<string, number>, n: number): Array<[string, number]> {
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
}

// ---------------------------------------------------------------------------
// Digest
// ---------------------------------------------------------------------------

export function periodStart(period: StoryPeriod, now: Date = new Date()): Date {
  return new Date(now.getTime() - PERIOD_DAYS[period] * DAY_MS)
}

/** Consecutive-day streak ending at `now` (or yesterday, so a quiet morning does not zero it). */
export function computeStreak(dates: Array<string | Date>, now: Date, timeZone?: string | null): number {
  const days = new Set(dates.map(d => localParts(new Date(d), timeZone).key))
  let cursor = localParts(now, timeZone).key
  if (!days.has(cursor)) cursor = dayKeyShift(cursor, -1)
  let streak = 0
  while (days.has(cursor)) {
    streak++
    cursor = dayKeyShift(cursor, -1)
  }
  return streak
}

export function buildDigest(
  entries: DigestEntry[],
  period: StoryPeriod,
  now: Date = new Date(),
  timeZone?: string | null
): StoryDigest {
  const start = periodStart(period, now).getTime()
  const inWindow = entries
    .filter(e => {
      const t = new Date(e.createdAt).getTime()
      return t >= start && t <= now.getTime()
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const journal = inWindow.filter(e => JOURNAL_EVENTS.includes(e.event) && (e.text || '').trim())
  const moodRows = inWindow.filter(e => MOOD_EVENTS.includes(e.event))

  const dayParts: Record<DayPart, number> = { night: 0, morning: 0, afternoon: 0, evening: 0 }
  const days = new Set<string>()
  const cities = new Map<string, number>()
  const weather = new Map<string, number>()
  const moons = new Map<string, number>()
  const temps: number[] = []

  for (const e of inWindow) {
    const { key, hour } = localParts(new Date(e.createdAt), timeZone)
    days.add(key)
    if (JOURNAL_EVENTS.includes(e.event)) dayParts[dayPartOf(hour)]++
    const c = e.context
    if (c?.city) cities.set(c.city, (cities.get(c.city) || 0) + 1)
    if (c?.weatherDescription) weather.set(c.weatherDescription.toLowerCase(), (weather.get(c.weatherDescription.toLowerCase()) || 0) + 1)
    if (c?.astroMoonPhase) moons.set(c.astroMoonPhase, (moons.get(c.astroMoonPhase) || 0) + 1)
    if (typeof c?.temperature === 'number' && c.temperature > 0) temps.push(c.temperature - 273.15)
  }

  const moodCounts = new Map<string, number>()
  for (const r of moodRows) {
    const m = String(r.metadata?.emotionalState || '').trim().toLowerCase()
    if (m) moodCounts.set(m, (moodCounts.get(m) || 0) + 1)
  }

  const digest: StoryDigest = {
    period,
    windowDays: PERIOD_DAYS[period],
    entryCount: journal.length,
    activeDays: days.size,
    streak: computeStreak(inWindow.map(e => e.createdAt), now, timeZone),
    moods: topN(moodCounts, 5).map(([mood, count]) => ({ mood, count })),
    dayParts,
    cities: topN(cities, 3).map(([c]) => c),
    weather: topN(weather, 3).map(([w]) => w),
    avgTempC: temps.length ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length) : null,
    moonPhases: topN(moons, 2).map(([m]) => m),
    excerpts: journal.slice(0, 5).map(e => (e.text || '').replace(/\s+/g, ' ').trim().slice(0, 160)),
    signals: [],
  }
  digest.signals = detectSignals(inWindow, journal, moodRows, period, now)
  return withDayPartSignals(digest)
}

/**
 * Spike / pattern-change detection. Each rule is deliberately simple and
 * explainable — the output is shown to the user and handed to the model.
 *
 * Rules (need >= 4 journal entries unless stated):
 *  - VOLUME SPIKE / DROP: second half of the window vs first half, >= 2x either way.
 *  - MOOD SHIFT: dominant mood of the second half differs from the first (>= 2 moods each).
 *  - SILENCE: no journal entry for >= half the window although there were earlier ones.
 *  - NIGHT WRITING (withDayPartSignals, timezone-correct): >= 40% of entries 00:00-06:00.
 */
export function detectSignals(
  inWindow: DigestEntry[],
  journal: DigestEntry[],
  moodRows: DigestEntry[],
  period: StoryPeriod,
  now: Date
): string[] {
  const signals: string[] = []
  const startMs = periodStart(period, now).getTime()
  const midMs = startMs + (now.getTime() - startMs) / 2

  const firstHalf = journal.filter(e => new Date(e.createdAt).getTime() < midMs).length
  const secondHalf = journal.length - firstHalf

  if (journal.length >= 4) {
    if (secondHalf >= 2 * Math.max(firstHalf, 1) && secondHalf >= 3) signals.push('VOLUME SPIKE: writing picked up in the second half of the window')
    else if (firstHalf >= 2 * Math.max(secondHalf, 1) && firstHalf >= 3) signals.push('VOLUME DROP: writing slowed in the second half of the window')
  }

  const dominant = (rows: DigestEntry[]) => {
    const c = new Map<string, number>()
    rows.forEach(r => {
      const m = String(r.metadata?.emotionalState || '').trim().toLowerCase()
      if (m) c.set(m, (c.get(m) || 0) + 1)
    })
    return topN(c, 1)[0]
  }
  const early = moodRows.filter(r => new Date(r.createdAt).getTime() < midMs)
  const late = moodRows.filter(r => new Date(r.createdAt).getTime() >= midMs)
  const dEarly = dominant(early)
  const dLate = dominant(late)
  if (early.length >= 2 && late.length >= 2 && dEarly && dLate && dEarly[0] !== dLate[0]) {
    signals.push(`MOOD SHIFT: ${dEarly[0]} -> ${dLate[0]}`)
  }

  if (journal.length > 0) {
    const newest = new Date(journal[0].createdAt).getTime()
    if (now.getTime() - newest >= (now.getTime() - startMs) / 2 && period !== 'day') {
      signals.push('SILENCE: no journal entry for over half of the window')
    }
  }

  return signals
}

/** Applies the night-writing rule from an already-tallied digest (timezone-correct). */
export function withDayPartSignals(digest: StoryDigest): StoryDigest {
  const total = digest.dayParts.night + digest.dayParts.morning + digest.dayParts.afternoon + digest.dayParts.evening
  if (total >= 4 && digest.dayParts.night / total >= 0.4) {
    return { ...digest, signals: [...digest.signals, 'NIGHT WRITING: most entries were written between 00:00 and 06:00'] }
  }
  return digest
}

// ---------------------------------------------------------------------------
// Prompt block + local fallback
// ---------------------------------------------------------------------------

const PERIOD_LABEL: Record<StoryPeriod, string> = {
  day: 'DAY', week: 'WEEK', month: 'MONTH', year: 'YEAR',
}

export function digestToPromptBlock(d: StoryDigest): string {
  const parts = Object.entries(d.dayParts).filter(([, n]) => n > 0).map(([k, n]) => `${k} ${n}`).join(', ')
  return [
    `PERIOD: ${PERIOD_LABEL[d.period]} (last ${d.windowDays} day${d.windowDays > 1 ? 's' : ''})`,
    `ENTRIES: ${d.entryCount} across ${d.activeDays} active day(s); current streak ${d.streak}`,
    `WRITING HOURS: ${parts || 'n/a'}`,
    `MOODS: ${d.moods.map(m => `${m.mood} x${m.count}`).join(', ') || 'NO DATA'}`,
    `PLACES: ${d.cities.join(', ') || 'n/a'}`,
    `SKY/WEATHER: ${[...d.weather, d.avgTempC !== null ? `avg ${d.avgTempC}C` : '', ...d.moonPhases.map(m => `moon ${m}`)].filter(Boolean).join(', ') || 'n/a'}`,
    `SIGNALS (spikes / pattern changes): ${d.signals.join('; ') || 'none detected'}`,
    `EXCERPTS (newest first):`,
    ...(d.excerpts.length ? d.excerpts.map(x => `- ${x}`) : ['- (none)']),
  ].join('\n')
}

/** Deterministic story used when the AI vendor is unavailable. */
export function composeLocalStory(d: StoryDigest): string {
  const span = d.period === 'day' ? 'today' : `this ${d.period}`
  if (d.entryCount === 0) {
    return `You have not written ${span}. The system is holding the space — one line, whenever you are ready, is enough to begin.`
  }
  const bits: string[] = [
    `You wrote ${d.entryCount} ${d.entryCount === 1 ? 'entry' : 'entries'} ${span}, across ${d.activeDays} ${d.activeDays === 1 ? 'day' : 'days'}.`,
  ]
  if (d.moods[0]) bits.push(`The mood that returned most was ${d.moods[0].mood}.`)
  if (d.cities[0]) bits.push(`You were mostly in ${d.cities[0]}${d.weather[0] ? ` under ${d.weather[0]}` : ''}.`)
  if (d.signals[0]) bits.push(`The system noticed a change: ${d.signals[0].toLowerCase()}.`)
  if (d.streak >= 2) bits.push(`Your streak stands at ${d.streak} days.`)
  bits.push('Keep the loop small and honest.')
  return bits.join(' ')
}

// ---------------------------------------------------------------------------
// Arcade evolution
// ---------------------------------------------------------------------------

/** Rank ladder. `minLevel` is the first level at which the rank applies. */
export const ARCADE_RANKS: Array<{ minLevel: number; name: string }> = [
  { minLevel: 1, name: 'SIGNAL' },
  { minLevel: 3, name: 'PILOT' },
  { minLevel: 6, name: 'NAVIGATOR' },
  { minLevel: 10, name: 'OPERATOR' },
  { minLevel: 15, name: 'ARCHITECT' },
  { minLevel: 22, name: 'SENTINEL' },
  { minLevel: 30, name: 'LOT MASTER' },
]

export const XP_PER_ENTRY = 10
export const XP_PER_ACTIVE_DAY = 25
export const XP_PER_STREAK_DAY = 15
export const XP_PER_STORY = 20

/** XP needed to *reach* a level: 50 * (level-1)^2. Level 2 = 50, level 5 = 800. */
export function xpForLevel(level: number): number {
  return 50 * (level - 1) * (level - 1)
}

export function computeArcade(input: {
  totalEntries: number
  activeDays: number
  streak: number
  storiesRead?: number
}): ArcadeState {
  const xp =
    input.totalEntries * XP_PER_ENTRY +
    input.activeDays * XP_PER_ACTIVE_DAY +
    input.streak * XP_PER_STREAK_DAY +
    (input.storiesRead || 0) * XP_PER_STORY
  let level = Math.floor(Math.sqrt(xp / 50)) + 1
  while (xpForLevel(level + 1) <= xp) level++
  while (level > 1 && xpForLevel(level) > xp) level--

  const rank = [...ARCADE_RANKS].reverse().find(r => level >= r.minLevel)!.name
  const next = ARCADE_RANKS.find(r => r.minLevel > level) || null
  const span = xpForLevel(level + 1) - xpForLevel(level)
  return {
    xp,
    level,
    rank,
    xpToNext: xpForLevel(level + 1) - xp,
    nextRank: next ? next.name : null,
    progress: span > 0 ? (xp - xpForLevel(level)) / span : 0,
  }
}

export function formatArcadeLine(a: ArcadeState): string {
  const filled = Math.round(a.progress * 10)
  const bar = '█'.repeat(filled) + '░'.repeat(10 - filled)
  return `RANK ${a.rank}  LV ${a.level}  ${bar}  ${a.xp} XP  (${a.xpToNext} TO LV ${a.level + 1})`
}
