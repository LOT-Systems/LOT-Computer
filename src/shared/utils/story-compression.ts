/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Story compression — pure, dependency-free.
 *
 * Reduces a window of Log rows (day / week / month / year) to a compact,
 * deterministic digest. The digest has two consumers:
 *   1. the LLM prompt (via renderDigestForPrompt) — facts the model must
 *      ground the story in, so it cannot invent a past;
 *   2. the offline fallback (renderDigestStory) — a plain-language story
 *      shown when the AI vendor is unreachable. No fabricated content:
 *      every sentence is derived from counted data.
 *
 * Doc: docs/technical/LOT-LOG-COMMANDS-AND-STORY.md
 */

export type StoryPeriod = 'day' | 'week' | 'month' | 'year'

export const STORY_PERIODS: StoryPeriod[] = ['day', 'week', 'month', 'year']

const PERIOD_DAYS: Record<StoryPeriod, number> = { day: 1, week: 7, month: 30, year: 365 }
const PERIOD_ALIASES: Record<string, StoryPeriod> = {
  day: 'day', today: 'day', d: 'day',
  week: 'week', weekly: 'week', w: 'week',
  month: 'month', monthly: 'month', m: 'month',
  year: 'year', yearly: 'year', y: 'year',
}

/** Events that carry user-authored free text. */
const TEXT_EVENTS = new Set(['note', 'log_entry', 'journal'])
/** Events that carry a mood / state signal. */
const MOOD_EVENTS = new Set(['emotional_checkin'])
/** Events that carry a self-care answer. */
const CARE_EVENTS = new Set(['memory_answer', 'self_care_checkin', 'energy_checkin'])

export interface StoryLogRow {
  event?: string | null
  text?: string | null
  createdAt: Date | string
  metadata?: Record<string, unknown> | null
  context?: {
    temperature?: number | null
    city?: string | null
    astroMoonPhase?: string | null
  } | null
}

export interface StoryDigest {
  period: StoryPeriod
  windowDays: number
  /** Distinct calendar days (UTC) with at least one signal. */
  activeDays: number
  totalSignals: number
  entries: number
  words: number
  /** Mood label -> count, sorted by count desc. */
  moods: Array<{ label: string; count: number }>
  careAnswers: number
  /** Highest-signal day (ISO date) and its count; null when no data. */
  peakDay: { date: string; count: number } | null
  /** Longest run of consecutive active days inside the window. */
  longestStreak: number
  /** Last N entry excerpts, newest first, already truncated. */
  excerpts: string[]
  /** Entries per half-window: used for the trend word. */
  trend: 'rising' | 'falling' | 'steady' | 'insufficient'
}

/** Parse the period argument that follows /story. Defaults to 'day'. */
export function parseStoryPeriod(text: string): StoryPeriod {
  const m = /(^|\s)\/story(?:\s+([a-z]+))?/i.exec(text || '')
  const arg = m?.[2]?.toLowerCase()
  return (arg && PERIOD_ALIASES[arg]) || 'day'
}

const isoDay = (d: Date) => d.toISOString().slice(0, 10)

export function compressLogs(
  rows: StoryLogRow[],
  period: StoryPeriod,
  now: Date = new Date()
): StoryDigest {
  const windowDays = PERIOD_DAYS[period]
  const start = now.getTime() - windowDays * 86_400_000
  const mid = now.getTime() - (windowDays * 86_400_000) / 2

  const inWindow = rows
    .map(r => ({ r, t: new Date(r.createdAt).getTime() }))
    .filter(x => Number.isFinite(x.t) && x.t >= start && x.t <= now.getTime())
    .sort((a, b) => b.t - a.t)

  const dayCounts = new Map<string, number>()
  const moodCounts = new Map<string, number>()
  const excerpts: string[] = []
  let entries = 0, words = 0, careAnswers = 0, firstHalf = 0, secondHalf = 0

  for (const { r, t } of inWindow) {
    const ev = r.event || ''
    const text = (r.text || '').trim()
    const isText = TEXT_EVENTS.has(ev) && text.length > 0
    const isMood = MOOD_EVENTS.has(ev)
    const isCare = CARE_EVENTS.has(ev)
    if (!isText && !isMood && !isCare) continue

    const day = isoDay(new Date(t))
    dayCounts.set(day, (dayCounts.get(day) || 0) + 1)
    if (t >= mid) secondHalf++; else firstHalf++

    if (isText) {
      entries++
      words += text.split(/\s+/).length
      if (excerpts.length < 5) excerpts.push(text.replace(/\s+/g, ' ').slice(0, 160))
    }
    if (isMood) {
      const label = String(r.metadata?.emotionalState || '').trim().toLowerCase()
      if (label) moodCounts.set(label, (moodCounts.get(label) || 0) + 1)
    }
    if (isCare) careAnswers++
  }

  let peakDay: StoryDigest['peakDay'] = null
  dayCounts.forEach((count, date) => {
    if (!peakDay || count > peakDay.count) peakDay = { date, count }
  })

  const days = Array.from(dayCounts.keys()).sort()
  let longest = 0, run = 0, prev = 0
  for (const d of days) {
    const t = Date.parse(d)
    run = prev && t - prev === 86_400_000 ? run + 1 : 1
    longest = Math.max(longest, run)
    prev = t
  }

  const total = firstHalf + secondHalf
  let trend: StoryDigest['trend'] = 'insufficient'
  if (total >= 4) {
    if (secondHalf > firstHalf * 1.5) trend = 'rising'
    else if (firstHalf > secondHalf * 1.5) trend = 'falling'
    else trend = 'steady'
  }

  return {
    period,
    windowDays,
    activeDays: dayCounts.size,
    totalSignals: total,
    entries,
    words,
    moods: Array.from(moodCounts, ([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count),
    careAnswers,
    peakDay,
    longestStreak: longest,
    excerpts,
    trend,
  }
}

/** Fact block for the LLM prompt. */
export function renderDigestForPrompt(d: StoryDigest): string {
  const lines = [
    `WINDOW: last ${d.windowDays} day(s) (${d.period.toUpperCase()})`,
    `ACTIVE DAYS: ${d.activeDays}/${d.windowDays}  LONGEST STREAK: ${d.longestStreak}`,
    `LOG ENTRIES: ${d.entries} (${d.words} words)  SELF-CARE ANSWERS: ${d.careAnswers}`,
    `MOODS: ${d.moods.map(m => `${m.label} x${m.count}`).join(', ') || 'NO DATA'}`,
    `PEAK DAY: ${d.peakDay ? `${d.peakDay.date} (${d.peakDay.count} signals)` : 'NONE'}`,
    `ACTIVITY TREND: ${d.trend}`,
    'EXCERPTS (newest first):',
    ...(d.excerpts.length ? d.excerpts.map(e => `- ${e}`) : ['- (none)']),
  ]
  return lines.join('\n')
}

const PERIOD_NOUN: Record<StoryPeriod, string> = {
  day: 'today', week: 'this week', month: 'this month', year: 'this year',
}

/**
 * Offline story: strictly derived from the digest. Used when the AI engine
 * is unavailable, so /story always returns something true.
 */
export function renderDigestStory(d: StoryDigest): string {
  const when = PERIOD_NOUN[d.period]
  if (d.totalSignals === 0) {
    return `Nothing recorded ${when} yet. The system is listening — your first entry starts the story.`
  }
  const parts: string[] = []
  parts.push(
    `${when[0].toUpperCase()}${when.slice(1)} you left ${d.entries} ${d.entries === 1 ? 'entry' : 'entries'}` +
    (d.words ? ` (${d.words} words)` : '') +
    ` across ${d.activeDays} ${d.activeDays === 1 ? 'day' : 'days'}.`
  )
  if (d.moods.length) {
    const top = d.moods.slice(0, 2).map(m => m.label).join(' and ')
    parts.push(`The strongest signal was ${top}.`)
  }
  if (d.careAnswers) parts.push(`You answered ${d.careAnswers} self-care ${d.careAnswers === 1 ? 'question' : 'questions'}.`)
  if (d.longestStreak > 1) parts.push(`Your longest unbroken run was ${d.longestStreak} days.`)
  if (d.trend === 'rising') parts.push('Activity is picking up.')
  else if (d.trend === 'falling') parts.push('Activity has slowed — the system notes it without judgement.')
  parts.push('The loop keeps compressing; the next entry sharpens it.')
  return parts.join(' ')
}
