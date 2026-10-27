/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Story compression — deterministic first pass of the LOT® AI loop.
 *
 *   LOT User data → compressLogs() → (Quantum Intent Engine / Together AI
 *   narrates) → personalized story stored.
 *
 * Everything here is pure and countable: the LLM only narrates facts that
 * this module has already measured, and a deterministic fallback story is
 * available when no AI vendor responds. Also hosts the Arcade rank model.
 */

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'

export const STORY_PERIOD_DAYS: Record<StoryPeriod, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

export interface StoryLogInput {
  text?: string | null
  event: string
  createdAt: Date | string
  context?: Record<string, any> | null
  metadata?: Record<string, any> | null
}

export interface StorySpike {
  kind: 'volume' | 'mood-shift' | 'silence'
  day: string
  detail: string
}

export interface CompressedStory {
  period: StoryPeriod
  windowDays: number
  entryCount: number
  activeDays: number
  streak: number
  dailyCounts: Record<string, number>
  timeOfDay: Record<'night' | 'morning' | 'afternoon' | 'evening', number>
  topCities: string[]
  topWeather: string[]
  topMoods: string[]
  spikes: StorySpike[]
  excerpts: string[]
}

/** Events that represent the user's own writing. */
const ENTRY_EVENTS = new Set(['log_entry', 'journal'])
/** Events that carry signal but are not free text. */
const SIGNAL_EVENTS = new Set([
  'emotional_checkin', 'memory_answer', 'self_care_checkin', 'energy_checkin',
])

const PERIOD_RE = /\/story\b(?:\s+(day|week|month|year)\b)?/i

/** `/story week` → 'week'; bare `/story` → 'day'. */
export function parseStoryPeriod(text: string): StoryPeriod {
  const m = PERIOD_RE.exec(text || '')
  return ((m && m[1] ? m[1].toLowerCase() : 'day') as StoryPeriod)
}

/** Remove the command (and its period word) from a log entry. */
export function stripStoryCommand(text: string): string {
  return (text || '').replace(PERIOD_RE, '').replace(/📖/g, '').trim()
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function bucketHour(h: number): keyof CompressedStory['timeOfDay'] {
  return h < 6 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
}

function topN(counts: Map<string, number>, n: number): string[] {
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([k]) => k)
}

function bump(map: Map<string, number>, key?: string | null) {
  if (key) map.set(key, (map.get(key) || 0) + 1)
}

/**
 * Compress raw log rows into measured facts for one period.
 * `now` is injectable so results are reproducible in tests.
 */
export function compressLogs(
  logs: StoryLogInput[],
  period: StoryPeriod,
  now: Date = new Date()
): CompressedStory {
  const windowDays = STORY_PERIOD_DAYS[period]
  const end = new Date(now)
  // 'day' = since 00:00 UTC today; other periods are rolling windows.
  const start = new Date(end.getTime() - windowDays * 86_400_000)
  if (period === 'day') {
    start.setTime(end.getTime())
    start.setUTCHours(0, 0, 0, 0)
  }

  const inWindow = logs
    .map(l => ({ ...l, at: new Date(l.createdAt) }))
    .filter(l => l.at >= start && l.at <= end)
    .sort((a, b) => a.at.getTime() - b.at.getTime())

  const dailyCounts: Record<string, number> = {}
  const timeOfDay = { night: 0, morning: 0, afternoon: 0, evening: 0 }
  const cities = new Map<string, number>()
  const weather = new Map<string, number>()
  const moodCounts = new Map<string, number>()
  const moodSeries: { day: string; mood: string }[] = []
  const excerpts: string[] = []
  let entryCount = 0

  for (const l of inWindow) {
    const isEntry = ENTRY_EVENTS.has(l.event)
    const isSignal = SIGNAL_EVENTS.has(l.event)
    if (!isEntry && !isSignal) continue
    const day = dayKey(l.at)
    dailyCounts[day] = (dailyCounts[day] || 0) + 1
    timeOfDay[bucketHour(l.at.getUTCHours())]++
    bump(cities, l.context?.city)
    bump(weather, l.context?.weatherDescription)
    if (isEntry) {
      entryCount++
      const t = (l.text || '').replace(/\s+/g, ' ').trim()
      // Skip pure command invocations; they carry no narrative.
      if (t && !/^\/\w+$/.test(t)) excerpts.push(t.slice(0, 160))
    }
    if (l.event === 'emotional_checkin') {
      const mood = String(l.metadata?.emotionalState || '').toLowerCase()
      if (mood) {
        bump(moodCounts, mood)
        moodSeries.push({ day, mood })
      }
    }
  }

  const days = Object.keys(dailyCounts).sort()
  const activeDays = days.length
  const spikes = detectSpikes(dailyCounts, moodSeries, start, end, period)

  return {
    period,
    windowDays,
    entryCount,
    activeDays,
    streak: trailingStreak(dailyCounts, end),
    dailyCounts,
    timeOfDay,
    topCities: topN(cities, 2),
    topWeather: topN(weather, 3),
    topMoods: topN(moodCounts, 3),
    spikes,
    excerpts: excerpts.slice(-6),
  }
}

/** Consecutive active days ending today (or yesterday, so the streak survives until midnight). */
export function trailingStreak(dailyCounts: Record<string, number>, now: Date): number {
  let cursor = new Date(now)
  if (!dailyCounts[dayKey(cursor)]) cursor = new Date(cursor.getTime() - 86_400_000)
  let streak = 0
  while (dailyCounts[dayKey(cursor)]) {
    streak++
    cursor = new Date(cursor.getTime() - 86_400_000)
  }
  return streak
}

/**
 * Spike / pattern-change detection. Thresholds are deliberately simple and
 * explainable: volume = mean + 1.5σ (min 3 records); mood-shift = latest
 * mood differs from the prior modal mood; silence = ≥3 empty days after
 * activity inside the window.
 */
export function detectSpikes(
  dailyCounts: Record<string, number>,
  moodSeries: { day: string; mood: string }[],
  start: Date,
  end: Date,
  period: StoryPeriod
): StorySpike[] {
  const spikes: StorySpike[] = []
  const days = Object.keys(dailyCounts).sort()

  if (days.length >= 3) {
    const vals = days.map(d => dailyCounts[d])
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length
    const sd = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length)
    for (const d of days) {
      if (dailyCounts[d] >= 3 && dailyCounts[d] > mean + 1.5 * sd) {
        spikes.push({ kind: 'volume', day: d, detail: `${dailyCounts[d]} records vs ${mean.toFixed(1)} avg` })
      }
    }
  }

  if (moodSeries.length >= 3) {
    const latest = moodSeries[moodSeries.length - 1]
    const prior = new Map<string, number>()
    moodSeries.slice(0, -1).forEach(m => bump(prior, m.mood))
    const modal = topN(prior, 1)[0]
    if (modal && modal !== latest.mood) {
      spikes.push({ kind: 'mood-shift', day: latest.day, detail: `${modal} → ${latest.mood}` })
    }
  }

  if (period !== 'day' && days.length) {
    const first = new Date(days[0] + 'T00:00:00Z').getTime()
    const last = Math.min(new Date(dayKey(end) + 'T00:00:00Z').getTime(), end.getTime())
    let gap = 0
    let gapStart = ''
    let longest = { len: 0, from: '' }
    for (let t = first; t <= last; t += 86_400_000) {
      const k = dayKey(new Date(t))
      if (dailyCounts[k]) {
        gap = 0
      } else {
        if (gap === 0) gapStart = k
        gap++
        if (gap > longest.len) longest = { len: gap, from: gapStart }
      }
    }
    if (longest.len >= 3) {
      spikes.push({ kind: 'silence', day: longest.from, detail: `${longest.len} quiet days` })
    }
  }
  return spikes.slice(0, 4)
}

/** Facts block fed to the LLM — the model narrates only what is listed here. */
export function renderFacts(c: CompressedStory): string {
  const busiest = Object.entries(c.timeOfDay).sort((a, b) => b[1] - a[1])[0]
  return [
    `PERIOD: ${c.period.toUpperCase()} (${c.windowDays}d)`,
    `RECORDS: ${c.entryCount} journal entries across ${c.activeDays} active days · streak ${c.streak}`,
    busiest && busiest[1] > 0 ? `PEAK TIME: ${busiest[0]}` : '',
    c.topCities.length ? `PLACES: ${c.topCities.join(', ')}` : '',
    c.topWeather.length ? `SKY: ${c.topWeather.join(', ')}` : '',
    c.topMoods.length ? `MOODS: ${c.topMoods.join(', ')}` : '',
    c.spikes.length ? `SPIKES:\n${c.spikes.map(s => `- ${s.kind} ${s.day}: ${s.detail}`).join('\n')}` : '',
    c.excerpts.length ? `EXCERPTS:\n${c.excerpts.map(e => `- ${e}`).join('\n')}` : '',
  ].filter(Boolean).join('\n')
}

/** Deterministic story used when no AI vendor answers. Never fabricates detail. */
export function renderFallbackStory(c: CompressedStory): string {
  const label = c.period === 'day' ? 'today' : `the last ${c.windowDays} days`
  if (c.entryCount === 0 && c.activeDays === 0) {
    return `Nothing recorded for ${label} yet. The system is listening whenever you write.`
  }
  const parts = [
    `You made ${c.entryCount} journal ${c.entryCount === 1 ? 'entry' : 'entries'} across ${c.activeDays} ${c.activeDays === 1 ? 'day' : 'days'} in ${label}.`,
  ]
  if (c.topCities.length) parts.push(`Most of it happened in ${c.topCities[0]}.`)
  if (c.topMoods.length) parts.push(`The mood that returned most was ${c.topMoods[0]}.`)
  for (const s of c.spikes.slice(0, 2)) {
    parts.push(s.kind === 'silence' ? `There was a quiet stretch starting ${s.day} (${s.detail}).`
      : s.kind === 'mood-shift' ? `Your mood shifted on ${s.day}: ${s.detail}.`
      : `${s.day} was louder than usual (${s.detail}).`)
  }
  return parts.join(' ')
}

// ─────────────────────────────────────────────────────────────────────────────
// ARCADE — gamified evolution of the user (self-care framing, not competition)
// ─────────────────────────────────────────────────────────────────────────────

export const ARCADE_RANKS = [
  'SIGNAL', 'OBSERVER', 'KEEPER', 'NAVIGATOR', 'ARCHITECT', 'LUMINARY',
] as const

export interface ArcadeRank {
  xp: number
  level: number
  rank: string
  xpIntoLevel: number
  xpForNext: number
  streak: number
}

/** XP: 10 per record, 25 per active day, 15 per streak day. Level = ⌊√(XP/50)⌋ + 1. */
export function computeArcadeRank(
  entryCount: number,
  activeDays: number,
  streak: number
): ArcadeRank {
  const xp = entryCount * 10 + activeDays * 25 + streak * 15
  const level = Math.floor(Math.sqrt(xp / 50)) + 1
  const floorXp = (level - 1) ** 2 * 50
  const nextXp = level ** 2 * 50
  return {
    xp,
    level,
    rank: ARCADE_RANKS[Math.min(Math.floor((level - 1) / 3), ARCADE_RANKS.length - 1)],
    xpIntoLevel: xp - floorXp,
    xpForNext: nextXp - floorXp,
    streak,
  }
}

export function renderArcadeRank(r: ArcadeRank): string {
  const filled = Math.round((r.xpIntoLevel / r.xpForNext) * 10)
  return [
    `RANK            ${r.rank}`,
    `LEVEL           ${r.level}`,
    `XP              ${r.xp}  [${'■'.repeat(filled)}${'□'.repeat(10 - filled)}]`,
    `STREAK          ${r.streak} ${r.streak === 1 ? 'DAY' : 'DAYS'}`,
  ].join('\n')
}
