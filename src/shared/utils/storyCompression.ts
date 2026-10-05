/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Story Compression — pure, dependency-free.
 *
 * Turns a window of Log rows (day / week / month / year) into a compact
 * DIGEST: counts, mood tally, environment averages, spikes, and the
 * operator's Arcade standing. The digest is what the LLM vendor sees
 * (never raw history), and what the deterministic fallback story is
 * written from when the vendor is unavailable.
 *
 * Pipeline position:
 *   LOT User data -> [this module] -> Quantum Intent Engine -> AI vendor
 *
 * Pure on purpose: no DB, no stores, no network. Testable with
 * `npx tsx scripts/tests/test-story-compression.ts`.
 */

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'

export const STORY_PERIODS: StoryPeriod[] = ['day', 'week', 'month', 'year']
export const DEFAULT_STORY_PERIOD: StoryPeriod = 'week'

const PERIOD_DAYS: Record<StoryPeriod, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

/** Minimal Log shape this module needs. Matches the Sequelize Log model. */
export interface StoryLogRow {
  event?: string | null
  text?: string | null
  createdAt: Date | string
  context?: {
    temperature?: number
    humidity?: number
    city?: string
    [k: string]: any
  } | null
  metadata?: Record<string, any> | null
}

const ENTRY_EVENTS = new Set(['log_entry', 'journal'])
const CHECKIN_EVENTS = new Set([
  'emotional_checkin',
  'self_care_checkin',
  'energy_checkin',
  'memory_answer',
])
// Events the machine writes itself — never counted as operator activity.
const MACHINE_EVENTS = new Set(['generated_story', 'generated_prayer'])

/**
 * Parse the period argument of `/story` out of raw log text.
 * "/story week" -> 'week'; "/story" -> default; "/story years" -> 'year'.
 */
export function parseStoryPeriod(text: string): StoryPeriod {
  const m = /(^|\s)\/story\s+(day|today|week|month|year)s?(\s|$|[^a-z0-9_])/i.exec(text || '')
  if (!m) return DEFAULT_STORY_PERIOD
  const word = m[2].toLowerCase()
  return word === 'today' ? 'day' : (word as StoryPeriod)
}

/** Remove the `/story [period]` token and the 📖 marker, leaving the user's own words. */
export function stripStoryCommand(text: string): string {
  return (text || '')
    .replace(/(^|\s)\/story(\s+(day|today|week|month|year)s?)?(?=\s|$|[^a-z0-9_])/gi, '$1')
    .replace(/📖/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

export function storyWindowStart(period: StoryPeriod, now: Date = new Date()): Date {
  return new Date(now.getTime() - PERIOD_DAYS[period] * 24 * 60 * 60 * 1000)
}

// ---------------------------------------------------------------------------
// ARCADE — gamified evolution of the operator
// ---------------------------------------------------------------------------

export interface ArcadeRank {
  level: number
  title: string
  xp: number
  /** XP at which the next level starts; null at max level. */
  nextAt: number | null
  /** 0–1 progress through the current level. */
  progress: number
}

const ARCADE_LEVELS: Array<{ at: number; title: string }> = [
  { at: 0, title: 'ROOKIE' },
  { at: 100, title: 'OPERATOR' },
  { at: 300, title: 'SIGNALMAN' },
  { at: 700, title: 'NAVIGATOR' },
  { at: 1500, title: 'ARCHITECT' },
  { at: 3000, title: 'MAINFRAME' },
  { at: 6000, title: 'QUANTUM' },
]

/** XP weights. Documented in docs/technical/LOT-LOG-COMMAND-SYSTEM.md §6. */
export const ARCADE_XP = {
  entry: 10,
  checkin: 5,
  activeDay: 20,
  streakDay: 5,
} as const

export function arcadeRankFromXp(xp: number): ArcadeRank {
  const safe = Math.max(0, Math.floor(xp))
  let idx = 0
  for (let i = 0; i < ARCADE_LEVELS.length; i++) {
    if (safe >= ARCADE_LEVELS[i].at) idx = i
  }
  const cur = ARCADE_LEVELS[idx]
  const next = ARCADE_LEVELS[idx + 1]
  return {
    level: idx + 1,
    title: cur.title,
    xp: safe,
    nextAt: next ? next.at : null,
    progress: next ? (safe - cur.at) / (next.at - cur.at) : 1,
  }
}

// ---------------------------------------------------------------------------
// DIGEST
// ---------------------------------------------------------------------------

export interface StorySpike {
  kind: 'volume' | 'mood-shift' | 'quiet-gap'
  detail: string
}

export interface StoryDigest {
  period: StoryPeriod
  entries: number
  checkins: number
  activeDays: number
  /** Consecutive active days ending today (or yesterday). */
  streakDays: number
  moods: Array<{ mood: string; count: number }>
  avgTempC: number | null
  avgHumidity: number | null
  cities: string[]
  spikes: StorySpike[]
  /** Short verbatim excerpts, newest first (≤ 6, ≤ 160 chars each). */
  excerpts: string[]
  arcade: ArcadeRank
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function toCelsius(t: number): number {
  // Context stores Fahrenheit (client utils/toCelsius mirrors this).
  return (t - 32) * (5 / 9)
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

export function buildStoryDigest(
  rows: StoryLogRow[],
  period: StoryPeriod,
  now: Date = new Date(),
  lifetimeXp?: number
): StoryDigest {
  const since = storyWindowStart(period, now).getTime()
  const inWindow = rows
    .filter(r => !MACHINE_EVENTS.has(r.event || ''))
    .map(r => ({ r, t: new Date(r.createdAt).getTime() }))
    .filter(x => Number.isFinite(x.t) && x.t >= since && x.t <= now.getTime())
    .sort((a, b) => b.t - a.t)

  const entries = inWindow.filter(x => ENTRY_EVENTS.has(x.r.event || ''))
  const checkins = inWindow.filter(x => CHECKIN_EVENTS.has(x.r.event || ''))

  const activeDaySet = new Set<string>()
  const perDay = new Map<string, number>()
  inWindow.forEach(x => {
    const k = dayKey(new Date(x.t))
    activeDaySet.add(k)
    perDay.set(k, (perDay.get(k) || 0) + 1)
  })

  // Streak: walk back from today; allow today to be empty (day not over).
  let streak = 0
  const cursor = new Date(now)
  if (!activeDaySet.has(dayKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1)
  while (activeDaySet.has(dayKey(cursor))) {
    streak++
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }

  // Moods
  const moodCount = new Map<string, number>()
  const moodSeq: string[] = [] // oldest -> newest
  checkins
    .filter(x => x.r.event === 'emotional_checkin')
    .slice()
    .reverse()
    .forEach(x => {
      const m = String(x.r.metadata?.emotionalState || '').trim().toUpperCase()
      if (!m) return
      moodSeq.push(m)
      moodCount.set(m, (moodCount.get(m) || 0) + 1)
    })
  const moods = Array.from(moodCount.entries())
    .map(([mood, count]) => ({ mood, count }))
    .sort((a, b) => b.count - a.count)

  // Environment
  const temps: number[] = []
  const hums: number[] = []
  const cityCount = new Map<string, number>()
  inWindow.forEach(x => {
    const c = x.r.context
    if (!c) return
    if (typeof c.temperature === 'number') temps.push(toCelsius(c.temperature))
    if (typeof c.humidity === 'number') hums.push(c.humidity)
    if (c.city) cityCount.set(c.city, (cityCount.get(c.city) || 0) + 1)
  })
  const avg = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : null)
  const avgT = avg(temps)
  const avgH = avg(hums)
  const cities = Array.from(cityCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([c]) => c)

  // Spikes — deliberately simple, explainable heuristics.
  const spikes: StorySpike[] = []
  if (period !== 'day' && perDay.size >= 3) {
    const counts = Array.from(perDay.values())
    const mean = counts.reduce((s, v) => s + v, 0) / counts.length
    let peakDay = ''
    let peak = 0
    perDay.forEach((v, k) => {
      if (v > peak) {
        peak = v
        peakDay = k
      }
    })
    if (peak >= 3 && peak >= mean * 2) {
      spikes.push({ kind: 'volume', detail: `${peak} records on ${peakDay} (avg ${round1(mean)}/day)` })
    }
  }
  if (moodSeq.length >= 4) {
    const half = Math.floor(moodSeq.length / 2)
    const lead = (seq: string[]) => {
      const t = new Map<string, number>()
      seq.forEach(m => t.set(m, (t.get(m) || 0) + 1))
      return Array.from(t.entries()).sort((a, b) => b[1] - a[1])[0]?.[0]
    }
    const first = lead(moodSeq.slice(0, half))
    const second = lead(moodSeq.slice(half))
    if (first && second && first !== second) {
      spikes.push({ kind: 'mood-shift', detail: `${first} -> ${second}` })
    }
  }
  if (period !== 'day' && inWindow.length > 0) {
    // Longest silent stretch (hours) between consecutive records.
    const asc = inWindow.map(x => x.t).reverse()
    let gap = 0
    for (let i = 1; i < asc.length; i++) gap = Math.max(gap, asc[i] - asc[i - 1])
    const gapDays = gap / 86_400_000
    if (gapDays >= 2) spikes.push({ kind: 'quiet-gap', detail: `${Math.round(gapDays)} days without a record` })
  }

  const excerpts = entries
    .map(x => String(x.r.text || '').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map(t => (t.length > 160 ? t.slice(0, 157) + '...' : t))
    .slice(0, 6)

  const windowXp =
    entries.length * ARCADE_XP.entry +
    checkins.length * ARCADE_XP.checkin +
    activeDaySet.size * ARCADE_XP.activeDay +
    streak * ARCADE_XP.streakDay

  return {
    period,
    entries: entries.length,
    checkins: checkins.length,
    activeDays: activeDaySet.size,
    streakDays: streak,
    moods,
    avgTempC: avgT === null ? null : round1(avgT),
    avgHumidity: avgH === null ? null : Math.round(avgH),
    cities,
    spikes,
    excerpts,
    arcade: arcadeRankFromXp(lifetimeXp ?? windowXp),
  }
}

/** Lifetime XP from every row the caller has (use a wider fetch than the window). */
export function computeLifetimeXp(rows: StoryLogRow[]): number {
  const live = rows.filter(r => !MACHINE_EVENTS.has(r.event || ''))
  const entries = live.filter(r => ENTRY_EVENTS.has(r.event || '')).length
  const checkins = live.filter(r => CHECKIN_EVENTS.has(r.event || '')).length
  const days = new Set<string>()
  live.forEach(r => {
    const t = new Date(r.createdAt)
    if (Number.isFinite(t.getTime())) days.add(dayKey(t))
  })
  return entries * ARCADE_XP.entry + checkins * ARCADE_XP.checkin + days.size * ARCADE_XP.activeDay
}

// ---------------------------------------------------------------------------
// RENDERING
// ---------------------------------------------------------------------------

/** Compact text block for the LLM prompt. Digest only — no raw history. */
export function digestToPromptBlock(d: StoryDigest): string {
  const lines = [
    `WINDOW: ${d.period.toUpperCase()}`,
    `RECORDS: ${d.entries} journal entries, ${d.checkins} check-ins over ${d.activeDays} active days (streak ${d.streakDays})`,
    `MOODS: ${d.moods.slice(0, 5).map(m => `${m.mood}x${m.count}`).join(', ') || 'NO DATA'}`,
  ]
  const env = [
    d.avgTempC !== null ? `avg ${d.avgTempC}C` : '',
    d.avgHumidity !== null ? `${d.avgHumidity}% humidity` : '',
    d.cities.join('/'),
  ].filter(Boolean)
  if (env.length) lines.push(`ENVIRONMENT: ${env.join(', ')}`)
  lines.push(
    `SPIKES: ${d.spikes.map(s => `${s.kind}: ${s.detail}`).join('; ') || 'none detected'}`,
    `ARCADE: LV${d.arcade.level} ${d.arcade.title}, ${d.arcade.xp} XP`,
    'EXCERPTS:',
    ...(d.excerpts.length ? d.excerpts.map(e => `- ${e}`) : ['- (none)'])
  )
  return lines.join('\n')
}

/**
 * Deterministic second-person story from the digest alone. Used when the
 * AI vendor is unreachable so /story ALWAYS answers with real data.
 */
export function buildLocalStory(d: StoryDigest): string {
  const span = { day: 'today', week: 'this week', month: 'this month', year: 'this year' }[d.period]
  if (d.entries + d.checkins === 0) {
    return `The record for ${span} is empty. That is data too. Write one line and the story begins.`
  }
  const parts: string[] = []
  parts.push(
    `${span[0].toUpperCase()}${span.slice(1)} you left ${d.entries} ${d.entries === 1 ? 'entry' : 'entries'}` +
      (d.checkins ? ` and ${d.checkins} ${d.checkins === 1 ? 'check-in' : 'check-ins'}` : '') +
      ` across ${d.activeDays} ${d.activeDays === 1 ? 'day' : 'days'}.`
  )
  if (d.moods.length) {
    const lead = d.moods[0]
    parts.push(`${lead.mood.toLowerCase()} came up most (${lead.count}x).`)
  }
  const shift = d.spikes.find(s => s.kind === 'mood-shift')
  if (shift) parts.push(`The weather inside you turned: ${shift.detail.toLowerCase()}.`)
  const gap = d.spikes.find(s => s.kind === 'quiet-gap')
  if (gap) parts.push(`There was a silence — ${gap.detail}. Silence is part of the pattern.`)
  const vol = d.spikes.find(s => s.kind === 'volume')
  if (vol) parts.push(`One day ran loud: ${vol.detail}.`)
  if (d.avgTempC !== null) {
    parts.push(`Around you: ${d.avgTempC}°C on average${d.cities[0] ? ` in ${d.cities[0]}` : ''}.`)
  }
  if (d.streakDays >= 2) parts.push(`${d.streakDays} days in a row — the loop is holding.`)
  parts.push('The machine will keep the thread.')
  return parts.join(' ')
}

/** One-line Arcade status, e.g. `LV 2 OPERATOR · 140 XP · 160 TO SIGNALMAN`. */
export function formatArcadeLine(a: ArcadeRank): string {
  const next = ARCADE_LEVELS[a.level] // level is 1-based => index of the next level
  const tail = a.nextAt !== null && next ? ` · ${a.nextAt - a.xp} TO ${next.title}` : ' · MAX'
  return `LV ${a.level} ${a.title} · ${a.xp} XP${tail}`
}
