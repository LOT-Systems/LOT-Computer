/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT Story — period compression + Arcade rank
 *
 * Pure, dependency-free module (no DB, no DOM, no network) shared by the
 * server `/api/story` route and by tests. It owns three things:
 *
 *   1. Period parsing        "/story week"      -> 'week'
 *   2. Compression           entries[] + period -> StoryCompression
 *   3. Arcade evolution      activity totals    -> ArcadeRank (XP, rank, next)
 *
 * The AI vendor (Together AI) only ever receives the *compressed* block
 * produced by `buildStoryDataBlock`, never raw logs. When the vendor is
 * unreachable, `buildFallbackStory` renders a deterministic story from the
 * same compression so `/story` always answers.
 *
 * Doc: docs/technical/LOG-COMMANDS-AND-STORY.md
 */

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'

export const STORY_PERIODS: readonly StoryPeriod[] = ['day', 'week', 'month', 'year']

const PERIOD_DAYS: Record<StoryPeriod, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
}

const DAY_MS = 24 * 60 * 60 * 1000

export interface StoryEntry {
  /** Epoch ms */
  at: number
  kind: 'log' | 'mood' | 'selfcare'
  text: string
  /** Lower-case emotional state for kind === 'mood' (or an entry tagged with one) */
  mood?: string
  context?: {
    city?: string
    /** Degrees Celsius */
    temperatureC?: number
    humidity?: number
  }
}

export interface StoryPeak {
  at: number
  type: 'high' | 'low' | 'long-entry'
  label: string
  excerpt: string
}

export interface StoryCompression {
  period: StoryPeriod
  from: number
  to: number
  entries: number
  logs: number
  moodCheckins: number
  selfCareAnswers: number
  words: number
  activeDays: number
  totalDays: number
  /** Consecutive active days ending today (or yesterday) */
  streak: number
  topMoods: Array<{ mood: string; count: number }>
  /** 'rising' | 'falling' | 'steady' | 'unknown' — mood valence, first half vs second half */
  moodTrend: 'rising' | 'falling' | 'steady' | 'unknown'
  busiestBand: 'night' | 'morning' | 'afternoon' | 'evening' | null
  cities: string[]
  avgTempC: number | null
  peaks: StoryPeak[]
}

// ---------------------------------------------------------------------------
// Period parsing & windows
// ---------------------------------------------------------------------------

/**
 * Reads the requested period out of free text (`/story week`,
 * `/story last month`, `📖 year`). Defaults to 'day'.
 * Only looks at the text after "/story" when that token is present, so a
 * journal sentence containing the word "week" does not change the period.
 */
export function parseStoryPeriod(text: string | undefined | null): StoryPeriod {
  if (!text) return 'day'
  const lower = text.toLowerCase()
  const idx = lower.indexOf('/story')
  const tail = idx >= 0 ? lower.slice(idx + '/story'.length) : lower.includes('📖') ? lower.slice(lower.indexOf('📖') + 2) : ''
  const m = tail.match(/^\s+(?:last\s+|this\s+|my\s+)?(day|today|week|weekly|month|monthly|year|yearly|annual)\b/)
  if (!m) return 'day'
  const w = m[1]
  if (w.startsWith('week')) return 'week'
  if (w.startsWith('month')) return 'month'
  if (w.startsWith('year') || w === 'annual') return 'year'
  return 'day'
}

/** Rolling window ending at `now`. */
export function periodWindow(period: StoryPeriod, now: number): { from: number; to: number } {
  return { from: now - PERIOD_DAYS[period] * DAY_MS, to: now }
}

export function periodDays(period: StoryPeriod): number {
  return PERIOD_DAYS[period]
}

// ---------------------------------------------------------------------------
// Compression
// ---------------------------------------------------------------------------

/** Mood valence, -2 (heavy) .. +2 (bright). Unknown moods are ignored. */
const MOOD_VALENCE: Record<string, number> = {
  energized: 2,
  fulfilled: 2,
  grateful: 2,
  hopeful: 1,
  content: 1,
  calm: 1,
  restless: -1,
  tired: -1,
  anxious: -1,
  overwhelmed: -2,
  exhausted: -2,
}

export function moodValence(mood: string | undefined): number | null {
  if (!mood) return null
  const v = MOOD_VALENCE[mood.toLowerCase()]
  return v === undefined ? null : v
}

function dayKey(at: number, tzOffsetMin: number): number {
  return Math.floor((at + tzOffsetMin * 60 * 1000) / DAY_MS)
}

function wordCount(text: string): number {
  const t = text.trim()
  return t ? t.split(/\s+/).length : 0
}

function excerpt(text: string, max = 90): string {
  const t = text.replace(/\s+/g, ' ').trim()
  return t.length > max ? t.slice(0, max - 1) + '…' : t
}

function band(hour: number): 'night' | 'morning' | 'afternoon' | 'evening' {
  if (hour < 6) return 'night'
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

/**
 * Compresses entries inside the period window into a small, stable summary.
 * `tzOffsetMin` is the user's offset from UTC in minutes (e.g. -480 for PST)
 * so "active day" and "time band" follow the user's own clock. Default 0.
 * Entries outside the window are ignored; input order does not matter.
 */
export function compressPeriod(
  all: StoryEntry[],
  period: StoryPeriod,
  now: number,
  tzOffsetMin = 0
): StoryCompression {
  const { from, to } = periodWindow(period, now)
  const entries = all.filter(e => e.at >= from && e.at <= to).sort((a, b) => a.at - b.at)

  const logs = entries.filter(e => e.kind === 'log')
  const moods = entries.filter(e => e.kind === 'mood' || (e.kind === 'log' && e.mood))
  const days = new Set(entries.map(e => dayKey(e.at, tzOffsetMin)))

  // Streak: consecutive active days counted back from today (grace: yesterday).
  const today = dayKey(now, tzOffsetMin)
  let cursor = days.has(today) ? today : today - 1
  let streak = 0
  while (days.has(cursor)) {
    streak++
    cursor--
  }

  const moodCounts = new Map<string, number>()
  for (const e of moods) {
    if (!e.mood) continue
    const k = e.mood.toLowerCase()
    moodCounts.set(k, (moodCounts.get(k) || 0) + 1)
  }
  const topMoods = [...moodCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([mood, count]) => ({ mood, count }))

  // Trend: mean valence of first half vs second half of the mood series.
  const scored = moods
    .map(e => ({ at: e.at, v: moodValence(e.mood), e }))
    .filter((x): x is { at: number; v: number; e: StoryEntry } => x.v !== null)
  let moodTrend: StoryCompression['moodTrend'] = 'unknown'
  if (scored.length >= 4) {
    const mid = Math.floor(scored.length / 2)
    const avg = (xs: typeof scored) => xs.reduce((s, x) => s + x.v, 0) / xs.length
    const delta = avg(scored.slice(mid)) - avg(scored.slice(0, mid))
    moodTrend = delta > 0.5 ? 'rising' : delta < -0.5 ? 'falling' : 'steady'
  }

  // Peaks: brightest mood, heaviest mood, and statistically long entry.
  const peaks: StoryPeak[] = []
  if (scored.length >= 2) {
    const hi = scored.reduce((a, b) => (b.v > a.v ? b : a))
    const lo = scored.reduce((a, b) => (b.v < a.v ? b : a))
    if (hi.v > 0) peaks.push({ at: hi.at, type: 'high', label: (hi.e.mood || '').toUpperCase(), excerpt: excerpt(hi.e.text) })
    if (lo.v < 0) peaks.push({ at: lo.at, type: 'low', label: (lo.e.mood || '').toUpperCase(), excerpt: excerpt(lo.e.text) })
  }
  if (logs.length >= 3) {
    const lens = logs.map(l => wordCount(l.text))
    const mean = lens.reduce((s, n) => s + n, 0) / lens.length
    const sd = Math.sqrt(lens.reduce((s, n) => s + (n - mean) ** 2, 0) / lens.length)
    let best = -1
    lens.forEach((n, i) => {
      if (sd > 0 && n >= mean + 1.5 * sd && (best < 0 || n > lens[best])) best = i
    })
    if (best >= 0) peaks.push({ at: logs[best].at, type: 'long-entry', label: `${lens[best]} WORDS`, excerpt: excerpt(logs[best].text) })
  }
  peaks.sort((a, b) => a.at - b.at)

  const bandCounts = new Map<string, number>()
  for (const e of entries) {
    const hour = new Date(e.at + tzOffsetMin * 60 * 1000).getUTCHours()
    const b = band(hour)
    bandCounts.set(b, (bandCounts.get(b) || 0) + 1)
  }
  const busiestBand = bandCounts.size
    ? ([...bandCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0] as StoryCompression['busiestBand'])
    : null

  const cityCounts = new Map<string, number>()
  const temps: number[] = []
  for (const e of entries) {
    if (e.context?.city) cityCounts.set(e.context.city, (cityCounts.get(e.context.city) || 0) + 1)
    if (typeof e.context?.temperatureC === 'number' && isFinite(e.context.temperatureC)) temps.push(e.context.temperatureC)
  }
  const cities = [...cityCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c)

  return {
    period,
    from,
    to,
    entries: entries.length,
    logs: logs.length,
    moodCheckins: entries.filter(e => e.kind === 'mood').length,
    selfCareAnswers: entries.filter(e => e.kind === 'selfcare').length,
    words: logs.reduce((s, l) => s + wordCount(l.text), 0),
    activeDays: days.size,
    totalDays: PERIOD_DAYS[period],
    streak,
    topMoods,
    moodTrend,
    busiestBand,
    cities,
    avgTempC: temps.length ? Math.round(temps.reduce((s, t) => s + t, 0) / temps.length) : null,
    peaks,
  }
}

// ---------------------------------------------------------------------------
// Arcade evolution
// ---------------------------------------------------------------------------

export interface ArcadeRank {
  xp: number
  level: number
  rank: string
  nextRank: string | null
  xpToNext: number
  /** 0..1 progress within the current rank */
  progress: number
}

/** Ordered ladder. `min` is the XP at which the rank is reached. */
export const ARCADE_RANKS: ReadonlyArray<{ rank: string; min: number }> = [
  { rank: 'RECRUIT', min: 0 },
  { rank: 'OPERATOR', min: 100 },
  { rank: 'SPECIALIST', min: 300 },
  { rank: 'SERGEANT', min: 700 },
  { rank: 'LIEUTENANT', min: 1500 },
  { rank: 'CAPTAIN', min: 3000 },
  { rank: 'MAJOR', min: 6000 },
  { rank: 'COLONEL', min: 12000 },
  { rank: 'COMMANDER', min: 24000 },
]

export interface ArcadeInput {
  logs: number
  moodCheckins: number
  activeDays: number
  streak: number
  stories: number
}

/**
 * XP rules (documented in docs/technical/LOG-COMMANDS-AND-STORY.md):
 *   log 10 · mood/self-care check-in 15 · active day 25 · streak day 15 · story 50
 * Streak is capped at 60 days so one long run cannot dominate the ladder.
 */
export function computeArcade(input: ArcadeInput): ArcadeRank {
  const n = (x: number) => (Number.isFinite(x) && x > 0 ? Math.floor(x) : 0)
  const xp =
    n(input.logs) * 10 +
    n(input.moodCheckins) * 15 +
    n(input.activeDays) * 25 +
    Math.min(n(input.streak), 60) * 15 +
    n(input.stories) * 50

  let idx = 0
  for (let i = 0; i < ARCADE_RANKS.length; i++) if (xp >= ARCADE_RANKS[i].min) idx = i
  const cur = ARCADE_RANKS[idx]
  const next = ARCADE_RANKS[idx + 1] || null
  return {
    xp,
    level: idx + 1,
    rank: cur.rank,
    nextRank: next ? next.rank : null,
    xpToNext: next ? next.min - xp : 0,
    progress: next ? (xp - cur.min) / (next.min - cur.min) : 1,
  }
}

/** One-line terminal-style rank readout. */
export function formatArcadeLine(a: ArcadeRank): string {
  const bar = (() => {
    const filled = Math.round(a.progress * 10)
    return '█'.repeat(filled) + '░'.repeat(10 - filled)
  })()
  const next = a.nextRank ? `${a.xpToNext} XP TO ${a.nextRank}` : 'MAX RANK'
  return `LVL ${a.level} ${a.rank}  ${bar}  ${a.xp} XP · ${next}`
}

// ---------------------------------------------------------------------------
// AI prompt block + deterministic fallback
// ---------------------------------------------------------------------------

const PERIOD_LABEL: Record<StoryPeriod, string> = {
  day: 'the last 24 hours',
  week: 'the last 7 days',
  month: 'the last 30 days',
  year: 'the last 365 days',
}

export function periodLabel(p: StoryPeriod): string {
  return PERIOD_LABEL[p]
}

/**
 * The only operator data the AI vendor receives: aggregate numbers plus at
 * most three short excerpts. No identifiers, no email, no full log text.
 */
export function buildStoryDataBlock(c: StoryCompression, a: ArcadeRank, recentExcerpts: string[] = []): string {
  const lines = [
    `PERIOD: ${periodLabel(c.period)}`,
    `ENTRIES: ${c.entries} (${c.logs} logs, ${c.moodCheckins} mood check-ins, ${c.selfCareAnswers} self-care answers)`,
    `ACTIVE DAYS: ${c.activeDays} of ${c.totalDays} · CURRENT STREAK: ${c.streak}`,
    `WORDS WRITTEN: ${c.words}`,
    `MOODS: ${c.topMoods.map(m => `${m.mood} x${m.count}`).join(', ') || 'no data'} · TREND: ${c.moodTrend}`,
    `MOST ACTIVE: ${c.busiestBand || 'n/a'}`,
    `PLACES: ${c.cities.join(', ') || 'n/a'}${c.avgTempC !== null ? ` · AVG TEMP ${c.avgTempC}°C` : ''}`,
    `ARCADE: level ${a.level} ${a.rank}, ${a.xp} XP`,
  ]
  if (c.peaks.length) {
    lines.push('PEAKS:')
    for (const p of c.peaks) lines.push(`- ${p.type.toUpperCase()} (${p.label}): "${p.excerpt}"`)
  }
  const ex = recentExcerpts.filter(Boolean).slice(0, 3)
  if (ex.length) {
    lines.push('RECENT ENTRIES:')
    for (const e of ex) lines.push(`- "${excerpt(e, 120)}"`)
  }
  return lines.join('\n')
}

/** Deterministic story used when the AI vendor is unavailable. */
export function buildFallbackStory(c: StoryCompression, a: ArcadeRank): string {
  if (c.entries === 0) {
    return `No signal in ${periodLabel(c.period)}. The record is quiet, not lost. One entry restarts the loop.`
  }
  const parts: string[] = []
  parts.push(
    `In ${periodLabel(c.period)} you were present on ${c.activeDays} of ${c.totalDays} days and left ${c.entries} ${c.entries === 1 ? 'mark' : 'marks'}` +
      (c.words ? `, ${c.words} words` : '') +
      '.'
  )
  if (c.topMoods.length) {
    const trend =
      c.moodTrend === 'rising' ? ' It has been lifting.' : c.moodTrend === 'falling' ? ' It has been getting heavier.' : ''
    parts.push(`The dominant weather inside was ${c.topMoods.map(m => m.mood).join(', ')}.${trend}`)
  }
  const high = c.peaks.find(p => p.type === 'high')
  const low = c.peaks.find(p => p.type === 'low')
  if (high) parts.push(`The high point: "${high.excerpt}"`)
  if (low) parts.push(`The low point: "${low.excerpt}"`)
  if (c.streak >= 2) parts.push(`${c.streak} days running.`)
  parts.push(
    a.nextRank
      ? `${a.xpToNext} XP separates you from ${a.nextRank}.`
      : 'You hold the highest rank. Keep the record honest.'
  )
  return parts.join(' ')
}
